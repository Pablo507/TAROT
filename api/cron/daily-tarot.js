// api/cron/daily-tarot.js — Vercel Cron Job

import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

export const maxDuration = 60

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const WA_TOKEN     = process.env.WHATSAPP_TOKEN
const WA_PHONE_ID  = process.env.WHATSAPP_PHONE_ID
const CRON_SECRET  = process.env.CRON_SECRET

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

  try {
    const resp = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 500,
    })

    let texto = resp?.choices?.[0]?.message?.content
    if (!texto) {
      throw new Error('Groq devolvió un contenido vacío')
    }

    texto = texto
      .trim()
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/  +/g, ' ')
      .trim()

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
        texto = corte.slice(0, ultimoPunto + 1)
      } else {
        const ultimoEspacio = corte.lastIndexOf(' ')
        texto = (ultimoEspacio > 0 ? corte.slice(0, ultimoEspacio) : corte).trim() + '…'
      }
    }

    return texto
  } catch (err) {
    console.error('[Groq] Error generando interpretación, usando texto por defecto:', err.message)
    // Texto de respaldo garantizado por si la API de IA falla puntualmente
    return `Hoy la energía te invita a mirar hacia adentro y conectar con tu intuición más profunda para transformar lo que ya no te sirve. Es un momento clave para soltar viejas estructuras y abrirte con confianza a nuevas oportunidades que están por llegar. ✦ Hoy tu camino es: tomate unos minutos en silencio para respirar consciente y definir una sola prioridad clara para avanzar.`
  }
}

async function enviarWhatsApp(phone, nombre, carta, interpretacion) {
  const waPhone = phone.replace('+', '')
  const saludo = nombre ? nombre.split(' ')[0] : 'amigo/a'

  if (!interpretacion || interpretacion.trim() === '') {
    throw new Error('La interpretación está vacía o inválida')
  }

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
    console.error('[WhatsApp] Error detallado de Meta:', JSON.stringify(data))
    throw new Error(data?.error?.message || `WhatsApp API error ${resp.status}`)
  }
  return data?.messages?.[0]?.id
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const startedAt = Date.now()
  const carta = cartaDelDia()
  let enviados = 0, fallidos = 0, omitidos = 0

  console.log(`[Cron] Iniciando. Carta del día: ${carta}`)

  try {
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('id, phone, name, sends_count')
      .eq('active', true)

    if (error) throw error
    console.log(`[Cron] ${subscribers.length} suscriptores activos`)

    const hoyInicio = new Date()
    hoyInicio.setUTCHours(0, 0, 0, 0)
    const fechaIsoHoy = hoyInicio.toISOString()

    const interpretacion = await generarInterpretacion(carta)

    for (const sub of subscribers) {
      try {
        const { data: yaEnviadoHoy, error: logError } = await supabase
          .from('send_log')
          .select('id')
          .eq('subscriber_id', sub.id)
          .eq('status', 'sent')
          .gte('sent_at', fechaIsoHoy)
          .limit(1)

        if (logError) throw logError

        if (yaEnviadoHoy && yaEnviadoHoy.length > 0) {
          console.log(`[Cron] Omitido: ${sub.phone} ya recibió su lectura hoy.`)
          omitidos++
          continue
        }

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
    console.log(`[Cron] Completado. Enviados: ${enviados}, Omitidos (duplicados): ${omitidos}, Fallidos: ${fallidos}, Tiempo: ${duration}s`)

    return res.status(200).json({
      ok: true,
      carta,
      enviados,
      omitidos,
      fallidos,
      duration_s: parseFloat(duration)
    })

  } catch (err) {
    console.error('[Cron] Error fatal:', err)
    return res.status(500).json({ error: err.message })
  }
}