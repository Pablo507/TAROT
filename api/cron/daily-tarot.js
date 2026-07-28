// api/cron/daily-tarot.js — Vercel Cron Job
// Se activa automáticamente cada día a las 9 AM Uruguay (12:00 UTC)
// Usa la plantilla aprobada "carta_diaria" para cumplir con las políticas de Meta
//
// Variables de la plantilla:
//   {{1}} = nombre del suscriptor
//   {{2}} = nombre de la carta del día
//   {{3}} = lectura corta generada por Groq (máx ~180 palabras)

import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const WA_TOKEN    = process.env.WHATSAPP_TOKEN
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID
const CRON_SECRET = process.env.CRON_SECRET

// Nombre exacto de la plantilla aprobada en Meta
const TEMPLATE_NAME = 'carta_diaria'
const TEMPLATE_LANG = 'es'

// ── Arcanos del día ──────────────────────────────────────────────────────────
const ARCANOS = [
  "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador",
  "El Hierofante", "Los Enamorados", "El Carro", "La Fuerza", "El Ermitaño",
  "La Rueda de la Fortuna", "La Justicia", "El Colgado", "La Muerte",
  "La Templanza", "El Diablo", "La Torre", "La Estrella", "La Luna",
  "El Sol", "El Juicio", "El Mundo"
]

function cartaDelDia() {
  const hoy = new Date()
  const idx = (hoy.getFullYear() + hoy.getMonth() + hoy.getDate()) % ARCANOS.length
  return ARCANOS[idx]
}

// ── Generar SOLO el texto de lectura con Groq ────────────────────────────────
// El saludo y el nombre de la carta ya están en la plantilla como variables.
// Groq solo genera el cuerpo de la lectura ({{3}}).
async function generarLectura(carta) {
  const prompt = `Generá una lectura de tarot diaria breve para la carta "${carta}".

El texto debe:
- Tener entre 60 y 90 palabras exactamente
- Ser místico, positivo y personal, como si hablaras directamente al lector
- Incluir un consejo práctico y concreto para el día de hoy
- NO mencionar el nombre de la carta al inicio (ya está en el título)
- NO usar asteriscos ni formato markdown
- NO incluir saludos ni despedidas
- Terminar con: "Consejo: [acción concreta de 1 oración]."

Respondé SOLO el texto de la lectura, sin comillas ni explicaciones.`

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.85,
    max_tokens: 200,
  })

  return resp.choices[0].message.content.trim()
}

// ── Enviar usando la plantilla aprobada ──────────────────────────────────────
async function enviarConPlantilla(phone, nombre, carta, lectura) {
  const waPhone   = phone.replace('+', '')
  const firstName = nombre ? nombre.split(' ')[0] : 'Hola'

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: waPhone,
    type: 'template',
    template: {
      name: TEMPLATE_NAME,
      language: { code: TEMPLATE_LANG },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: firstName },   // {{1}} = nombre
            { type: 'text', text: carta },        // {{2}} = carta del día
            { type: 'text', text: lectura },      // {{3}} = lectura
          ]
        }
      ]
    }
  }

  const resp = await fetch(
    `https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    }
  )

  const data = await resp.json()

  if (!resp.ok) {
    throw new Error(data?.error?.message || `WhatsApp API error ${resp.status}`)
  }

  return data?.messages?.[0]?.id
}

// ── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Seguridad: verificar que viene de Vercel Cron o de nosotros
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startedAt = Date.now()
  const carta     = cartaDelDia()
  let enviados = 0, fallidos = 0

  console.log(`[Cron] Iniciando con plantilla "${TEMPLATE_NAME}". Carta: ${carta}`)

  try {
    // 1. Obtener suscriptores activos
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('id, phone, name, sends_count')
      .eq('active', true)

    if (error) throw error
    console.log(`[Cron] ${subscribers.length} suscriptores activos`)

    // 2. Generar la lectura del día UNA sola vez (igual para todos)
    const lectura = await generarLectura(carta)
    console.log(`[Cron] Lectura generada (${lectura.split(' ').length} palabras)`)

    // 3. Enviar a cada suscriptor con la plantilla
    for (const sub of subscribers) {
      try {
        const waId = await enviarConPlantilla(
          sub.phone,
          sub.name,
          carta,
          lectura
        )

        // Log exitoso
        await supabase.from('send_log').insert({
          subscriber_id: sub.id,
          card: carta,
          status: 'sent',
          wa_message_id: waId,
          template: TEMPLATE_NAME,
        })

        // Actualizar suscriptor
        await supabase
          .from('subscribers')
          .update({
            last_sent_at: new Date().toISOString(),
            sends_count: (sub.sends_count || 0) + 1
          })
          .eq('id', sub.id)

        enviados++

        // Rate limit: 100ms entre mensajes (600/min máx en WhatsApp)
        await new Promise(r => setTimeout(r, 100))

      } catch (err) {
        console.error(`[Cron] Error con ${sub.phone}:`, err.message)

        await supabase.from('send_log').insert({
          subscriber_id: sub.id,
          card: carta,
          status: 'failed',
          error_msg: err.message,
          template: TEMPLATE_NAME,
        })

        fallidos++
      }
    }

    const duration = ((Date.now() - startedAt) / 1000).toFixed(1)
    console.log(`[Cron] Completado. Enviados: ${enviados}, Fallidos: ${fallidos}, Tiempo: ${duration}s`)

    return res.status(200).json({
      ok: true,
      carta,
      template: TEMPLATE_NAME,
      enviados,
      fallidos,
      duration_s: parseFloat(duration)
    })

  } catch (err) {
    console.error('[Cron] Error fatal:', err)
    return res.status(500).json({ error: err.message })
  }
}
