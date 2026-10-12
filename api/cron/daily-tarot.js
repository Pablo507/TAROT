// api/cron/daily-tarot.js — Vercel Cron Job

import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

const LECTURAS_ARCANOS = {
  "El Loco": "Hoy se abre ante vos un portal de nuevos comienzos y libertades insospechadas. La energía te pide dar un salto de fe consciente, dejando atrás las dudas y confiando en tu instinto más puro. ✦ Hoy tu camino es: atreverte a iniciar ese proyecto o idea que venías postergando sin buscar la aprobación de nadie.",
  "El Mago": "La energía activa hoy tu poder personal y tu capacidad ilimitada de manifestación. Todo lo que necesitás para avanzar y materializar tus metas ya está a tu alcance, solo requiere que tomes la iniciativa con determinación. ✦ Hoy tu camino es: enfocarte en tu objetivo principal y realizar una acción concreta sin postergarla.",
  "La Sacerdotisa": "Un halo de intuición y sabiduría profunda envuelve tu jornada de hoy. Es momento de guardar silencio exterior para escuchar las respuestas que ya habitan en tu interior. ✦ Hoy tu camino es: confiar en tus corazonadas y no forzar decisiones precipitadas hasta sentir plena claridad.",
  "La Emperatriz": "La abundancia, la creatividad y el florecimiento marcan tu ritmo de hoy. Todo lo que siembres y cuides con amor en este momento crecerá con solidez y belleza. ✦ Hoy tu camino es: regalarte un momento de disfrute, conectar con la naturaleza y nutrir tus proyectos con alegría.",
  "El Emperador": "La estructura, el orden y el liderazgo firme son tus grandes aliados en este día. Tenés la capacidad de poner límites sanos y construir bases perdurables para tu futuro. ✦ Hoy tu camino es: organizar tus prioridades del día y tomar una decisión con la cabeza fría y determinación.",
  "El Hierofante": "Hoy la vida te invita a conectar con la enseñanza, la ética y los valores fundamentales. Buscar consejo sabio o actuar como guía para otros traerá un profundo sentido de propósito. ✦ Hoy tu camino es: honrar tus principios y buscar coherencia entre lo que pensás, sentís y hacés.",
  "Los Enamorados": "Las decisiones tomadas desde el corazón definen el rumbo de tu jornada. Es momento de alinear tus elecciones con lo que realmente amás y valorás en tus relaciones y proyectos. ✦ Hoy tu camino es: elegir con honestidad aquello que te da paz interior, dejando de lado los compromisos vacíos.",
  "El Carro": "La determinación y la fuerza de voluntad te impulsan hacia la victoria hoy. A pesar de los obstáculos o distracciones, mantenés el control firmemente sobre las riendas de tu vida. ✦ Hoy tu camino es: avanzar con enfoque total hacia tu meta sin dejar que nada te desvíe del rumbo.",
  "La Fuerza": "La paciencia, la compasión y el dominio de las emociones son tu mayor fortaleza hoy. Podés transformar cualquier tensión o dificultad no con agresión, sino con templanza y sabiduría. ✦ Hoy tu camino es: responder con calma frente a cualquier imprevisto y confiar en tu temple interior.",
  "El Ermitaño": "Una pausa consciente te permitirá ver con claridad la luz al final del camino. Es un día ideal para introspección, estudio y búsqueda de respuestas dentro de vos. ✦ Hoy tu camino es: desconectar del ruido externo por un momento para escuchar tus verdaderas necesidades.",
  "La Rueda de la Fortuna": "Los ciclos cambian y los vientos giran a tu favor hoy. Es un momento de fluir con los cambios imprevistos, sabiendo que cada giro trae consigo una oportunidad única. ✦ Hoy tu camino es: soltar el control y adaptarte con flexibilidad a las novedades que traiga la jornada.",
  "La Justicia": "La verdad, el equilibrio y la causa-efecto se manifiestan con claridad en tu día. Es momento de actuar con imparcialidad, asumir responsabilidades y cosechar lo sembrado. ✦ Hoy tu camino es: tomar decisiones ponderadas y buscar la equidad en cada interacción.",
  "El Colgado": "Una nueva perspectiva surge cuando te permitís pausar y mirar las cosas desde otro ángulo. El desapego y la rendición consciente abren puertas que el esfuerzo forzado cerraba. ✦ Hoy tu camino es: cambiar de punto de vista y no presionar situaciones que requieren tiempo.",
  "La Muerte": "Un proceso de transformación y renovación profunda se completa hoy. Soltar lo que cumplió su ciclo te libera de cargas pesadas para recibir lo nuevo con los brazos abiertos. ✦ Hoy tu camino es: despedir viejos hábitos o pensamientos limitantes para dar paso a tu nueva versión.",
  "La Templanza": "El equilibrio, la armonía y la sanación interna guían tu energía de hoy. Mezclar los ingredientes de tu vida con paciencia y moderación aportará mucha serenidad. ✦ Hoy tu camino es: buscar el punto medio en tus actividades y cultivar la calma interior.",
  "El Diablo": "Hoy tomás conciencia de los ataduras o sombras que limitaban tu libertad. Reconocer tus apegos o miedos es el primer gran paso para romper las cadenas y liberarte. ✦ Hoy tu camino es: identificar qué hábito o pensamiento te resta energía y dar un paso para liberarte de él.",
  "La Torre": "Las estructuras rígidas se caen para revelar la verdad sin filtros. Aunque las revelaciones o cambios repentinos sorprendan, abren paso a una reconstrucción mucho más auténtica. ✦ Hoy tu camino es: aceptar la verdad con valentía y confiar en que lo que queda es lo verdaderamente real.",
  "La Estrella": "La fe, la esperanza y la inspiración divina iluminan tu horizonte hoy. Sanás heridas del pasado y recuperás la confianza en que el universo guía cada uno de tus pasos. ✦ Hoy tu camino es: mantener la fe intacta, proyectar tus deseos y compartir tu luz con quienes te rodean.",
  "La Luna": "Tu intuición y el mundo de tus sueños están sumamente activos hoy. No te dejes confundir por ilusiones o miedos infundados; atravesá la niebla escuchando tu voz interior. ✦ Hoy tu camino es: no tomar decisiones apresuradas en la incertidumbre y confiar en lo que percibís.",
  "El Sol": "Claridad absoluta, éxito, alegría y vitalidad radiante acompañan tu día. Toda la energía está a tu favor para brillar, celebrar y compartir momentos cálidos con tus seres queridos. ✦ Hoy tu camino es: celebrar tus logros, sonreír y transmitir entusiasmo en todo lo que hagas.",
  "El Juicio": "Un llamado a despertar y tomar conciencia de tu verdadera vocación resuena hoy. Es hora de dejar atrás los juicios del pasado y renacer hacia un nivel superior de propósito. ✦ Hoy tu camino es: responder al llamado de tu intuición y dar un paso decisivo hacia tu transformación.",
  "El Mundo": "La culminación exitosa de un ciclo importante se manifiesta hoy. Sentís la plenitud, la integración y el reconocimiento de todo el camino recorrido con aprendizaje. ✦ Hoy tu camino es: agradecer el camino andado y prepararte con gozo para el siguiente gran capítulo."
}

function cartaDelDia() {
  const hoy = new Date()
  const idx = (hoy.getFullYear() + hoy.getMonth() + hoy.getDate()) % ARCANOS.length
  return ARCANOS[idx]
}

function generarInterpretacion(carta) {
  return LECTURAS_ARCANOS[carta] || `La energía de ${carta} te invita a mirar hacia adentro y conectar con tu intuición más profunda. Es un momento clave para avanzar con confianza. ✦ Hoy tu camino es: tomate unos minutos para respirar consciente y definir tu prioridad.`
}

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

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  const queryToken = req.query?.token
  if (authHeader !== `Bearer ${CRON_SECRET}` && queryToken !== CRON_SECRET) {
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

    const hoyInicio = new Date()
    hoyInicio.setUTCHours(0, 0, 0, 0)
    const fechaIsoHoy = hoyInicio.toISOString()

    const interpretacion = generarInterpretacion(carta)

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

        await supabase.from('send_log