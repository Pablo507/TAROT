// api/cron/daily-tarot.js — Vercel Cron Job
// Se activa automáticamente cada día a las 9 AM (UTC-3 = 12:00 UTC)
// Configurar en vercel.json: { "crons": [{ "path": "/api/cron/daily-tarot", "schedule": "0 12 * * *" }] }

import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const WA_TOKEN     = process.env.WHATSAPP_TOKEN        // token de WhatsApp Cloud API
const WA_PHONE_ID  = process.env.WHATSAPP_PHONE_ID     // ID del número de negocio
const CRON_SECRET  = process.env.CRON_SECRET           // para proteger el endpoint

// ── Arcanos del día ──────────────────────────────────────────
const ARCANOS = [
  "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador",
  "El Hierofante", "Los Enamorados", "El Carro", "La Fuerza", "El Ermitaño",
  "La Rueda de la Fortuna", "La Justicia", "El Colgado", "La Muerte",
  "La Templanza", "El Diablo", "La Torre", "La Estrella", "La Luna",
  "El Sol", "El Juicio", "El Mundo"
]

function cartaDelDia() {
  // Misma carta para todos hoy (más coherente), basada en la fecha
  const hoy = new Date()
  const idx = (hoy.getFullYear() + hoy.getMonth() + hoy.getDate()) % ARCANOS.length
  return ARCANOS[idx]
}

// ── Generar mensaje con Groq ─────────────────────────────────
async function generarMensaje(carta, nombre) {
  const saludo = nombre ? `Hola ${nombre.split(' ')[0]}` : 'Hola'

  const prompt = `Genera un mensaje de WhatsApp de tarot diario. Carta: "${carta}". 
  
El mensaje debe:
- Empezar con "✦ Tu carta de hoy: *${carta}*"
- Tener máximo 200 palabras
- Ser místico, positivo y personal
- Terminar con "Para una lectura completa gratuita → [URL]"
- Incluir un consejo práctico para el día
- NO usar asteriscos dobles (**), solo simples (*) para negrita de WhatsApp
- Incluir 2-3 emojis relevantes
- Terminar con: "_Responde STOP para dejar de recibir lecturas_"

Responde SOLO el mensaje, sin comillas ni explicaciones.`

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.85,
    max_tokens: 400,
  })

  const texto = resp.choices[0].message.content.trim()
  return `${saludo} 🌙\n\n${texto}\n\n_Oráculo del Tarot IA • oraculotarot.com_`
}

// ── Enviar mensaje por WhatsApp Cloud API ────────────────────
async function enviarWhatsApp(phone, mensaje) {
  // Quitar el + del phone para la API
  const waPhone = phone.replace('+', '')

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: waPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: mensaje
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

  return data?.messages?.[0]?.id  // wa_message_id
}

// ── Handler principal ────────────────────────────────────────
export default async function handler(req, res) {
  // Seguridad: verificar que viene de Vercel Cron o de nosotros
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startedAt = Date.now()
  const carta = cartaDelDia()
  let enviados = 0, fallidos = 0

  console.log(`[Cron] Iniciando. Carta del día: ${carta}`)

  try {
    // 1. Obtener todos los suscriptores activos
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('id, phone, name, sends_count')
      .eq('active', true)

    if (error) throw error
    console.log(`[Cron] ${subscribers.length} suscriptores activos`)

    // 2. Generar mensaje (uno para todos, cambia el saludo)
    // Generamos un mensaje base y personalizamos el saludo
    const mensajeBase = await generarMensaje(carta, null)

    // 3. Enviar a cada suscriptor con delay para no saturar la API
    for (const sub of subscribers) {
      try {
        const nombre = sub.name
        const saludo = nombre ? `Hola ${nombre.split(' ')[0]} 🌙` : 'Hola 🌙'
        const mensaje = mensajeBase.replace('Hola 🌙', saludo)

        const waId = await enviarWhatsApp(sub.phone, mensaje)

        // Log exitoso
        await supabase.from('send_log').insert({
          subscriber_id: sub.id,
          card: carta,
          status: 'sent',
          wa_message_id: waId
        })

        // Actualizar suscriptor
        await supabase
          .from('subscribers')
          .update({ last_sent_at: new Date().toISOString(), sends_count: (sub.sends_count || 0) + 1 })
          .eq('id', sub.id)

        enviados++

        // Rate limit: esperar 100ms entre mensajes (600/min máx en WhatsApp)
        await new Promise(r => setTimeout(r, 100))

      } catch (err) {
        console.error(`[Cron] Error con ${sub.phone}:`, err.message)

        await supabase.from('send_log').insert({
          subscriber_id: sub.id,
          card: carta,
          status: 'failed',
          error_msg: err.message
        })

        fallidos++
      }
    }

    const duration = ((Date.now() - startedAt) / 1000).toFixed(1)
    console.log(`[Cron] Completado. Enviados: ${enviados}, Fallidos: ${fallidos}, Tiempo: ${duration}s`)

    return res.status(200).json({
      ok: true,
      carta,
      enviados,
      fallidos,
      duration_s: parseFloat(duration)
    })

  } catch (err) {
    console.error('[Cron] Error fatal:', err)
    return res.status(500).json({ error: err.message })
  }
}
