// api/cron/daily-tarot.js — Vercel Cron Job
// Se activa automáticamente cada día a las 9 AM (UTC-3 = 12:00 UTC)
// Configurar en vercel.json: { "crons": [{ "path": "/api/cron/daily-tarot", "schedule": "0 12 * * *" }] }
//
// IMPORTANTE: usa la plantilla "carta_diaria" aprobada en Meta Business Manager.
// Los mensajes proactivos (sin que el usuario haya escrito en las últimas 24hs)
// SOLO se pueden enviar como template — texto libre se rechaza con error 131047.

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
  const hoy = new Date()
  const idx = (hoy.getFullYear() + hoy.getMonth() + hoy.getDate()) % ARCANOS.length
  return ARCANOS[idx]
}

// ── Generar SOLO la interpretación + consejo con Groq ────────
// El saludo, el llamado a la lectura gratuita y el pie de "STOP" ahora
// son texto FIJO de la plantilla de Meta — Groq solo escribe la parte
// que cambia día a día, y acotada en longitud para no romper la plantilla.
async function generarInterpretacion(carta) {
  const prompt = `Sos un tarotista experto con décadas de experiencia. Generá una lectura de tarot diaria para la carta "${carta}".

ESTRUCTURA OBLIGATORIA — 3 párrafos separados por salto de línea:

Párrafo 1: Una oración poderosa y específica sobre la energía única de ${carta}. Que impacte desde la primera línea.

Párrafo 2: 2-3 oraciones sobre qué significa esta carta HOY para el lector. Usá "vos", "tu energía", "este momento". Sé concreto y personal, nunca genérico.

Párrafo 3: Empezá con "✦ Hoy tu camino es:" y dá una acción concreta y específica para hoy.

REGLAS:
- Total: entre 100 y 130 palabras
- Tono místico, cálido, esperanzador
- NO mencionar el nombre de la carta
- NO usar asteriscos dobles, ni markdown
- NO incluir saludos ni despedidas
- Hablá en segunda persona (vos, tu, te)
- Podés usar 2-3 emojis relevantes

Respondé SOLO los 3 párrafos, sin títulos ni explicaciones.`

  const resp = await groq.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.85,
    max_tokens: 900,
    reasoning_effort: 'low',
    include_reasoning: false,
  })

  let texto = resp.choices[0].message.content
    .trim()
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/  +/g, ' ')
    .trim()

  // Cinturón de seguridad: la plantilla se cae si la variable es muy larga.
  // En vez de cortar a mitad de palabra, buscamos el último punto/cierre de
  // oración dentro del límite; si no hay uno cerca, cortamos en el último
  // espacio para no partir una palabra.
  if (texto.length > 500) {
    const limite = 480
    let corte = texto.slice(0, limite)

    const ultimoPunto = Math.max(
      corte.lastIndexOf('. '),
      corte.lastIndexOf('.\n'),
      corte.lastIndexOf('! '),
      corte.lastIndexOf('? ')
    )

    if (ultimoPunto > limite * 0.6) {
      // Hay un cierre de oración razonablemente cerca del límite: cortamos ahí
      texto = corte.slice(0, ultimoPunto + 1)
    } else {
      // Si no, cortamos en el último espacio para no partir una palabra
      const ultimoEspacio = corte.lastIndexOf(' ')
      texto = (ultimoEspacio > 0 ? corte.slice(0, ultimoEspacio) : corte).trim() + '…'
    }
  }

  return texto
}

// ── Enviar mensaje por WhatsApp usando la plantilla aprobada ─
// La plantilla "carta_diaria" debe tener este cuerpo en Meta Business Manager:
//
//   Hola {{1}} 🌙
//
//   ✦ Tu carta de hoy: *{{2}}*
//
//   {{3}}
//
//   Para una lectura completa gratuita → https://www.tarotgratis.online
//
//   _Responde STOP para dejar de recibir lecturas_
//
async function enviarWhatsApp(phone, nombre, carta, interpretacion) {
  const waPhone = phone.replace('+', '')
  const saludo = nombre ? nombre.split(' ')[0] : 'amigo/a'

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: waPhone,
    type: 'template',
    template: {
      name: 'carta_diaria',
      language: { code: 'es_UY' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: saludo },
            { type: 'text', text: carta },
            { type: 'text', text: interpretacion }
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

// ── Handler principal ────────────────────────────────────────
export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startedAt = Date.now()
  const carta = cartaDelDia()
  let enviados = 0, fallidos = 0

  console.log(`[Cron] Iniciando. Carta del día: ${carta}`)

  try {
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('id, phone, name, sends_count')
      .eq('active', true)

    if (error) throw error
    console.log(`[Cron] ${subscribers.length} suscriptores activos`)

    // La interpretación se genera UNA sola vez (misma carta para todos hoy)
    const interpretacion = await generarInterpretacion(carta)

    for (const sub of subscribers) {
      try {
        const waId = await enviarWhatsApp(sub.phone, sub.name, carta, interpretacion)

        await supabase.from('send_log').insert({
          subscriber_id: sub.id,
          card: carta,
          status: 'sent',
          wa_message_id: waId
        })

        await supabase
          .from('subscribers')
          .update({ last_sent_at: new Date().toISOString(), sends_count: (sub.sends_count || 0) + 1 })
          .eq('id', sub.id)

        enviados++
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
