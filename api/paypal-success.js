import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Función de bienvenida por WhatsApp con manejo de errores de Meta ──
async function enviarBienvenida(subscriberId) {
  const { data: sub } = await supabase
    .from('subscribers')
    .select('phone, name')
    .eq('id', subscriberId)
    .single()

  if (!sub) return

  const nombre  = sub.name ? sub.name.split(' ')[0] : null
  const saludo  = nombre ? `¡Hola ${nombre}!` : '¡Hola!'
  const waPhone = sub.phone.replace('+', '')

  const mensaje =
    `${saludo} 🌙✨\n\n` +
    `*¡Tu suscripción al Oráculo del Tarot está activa!*\n\n` +
    `A partir de mañana recibirás tu lectura de tarot personalizada cada mañana directamente aquí.\n\n` +
    `Tu primer lectura llega mañana 🔮\n\n` +
    `_Respondé STOP para cancelar tu suscripción en cualquier momento._`

  try {
    const waRes = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: waPhone,
          type: 'text',
          text: { body: mensaje },
        }),
      }
    )

    const waData = await waRes.json()

    if (!waRes.ok) {
      console.error('[WhatsApp Error de Meta]:', JSON.stringify(waData, null, 2))
      return
    }

    console.log(`[WhatsApp] Bienvenida enviada con éxito a ${sub.phone}`)
  } catch (err) {
    console.error('[WhatsApp] Excepción de red al enviar mensaje:', err)
  }
}

export default async function handler(req, res) {
  try {
    const { subscription_id, token } = req.query || req.body

    if (!subscription_id && !token) {
      return res.status(400).json({ error: 'Faltan parámetros de suscripción' })
    }

    // Buscar al suscriptor en Supabase
    const query = subscription_id 
      ? supabase.from('subscribers').select('*').eq('paypal_subscription_id', subscription_id).single()
      : supabase.from('subscribers').select('*').eq('paypal_token', token).single()

    const { data: subscriber, error } = await query

    if (error || !subscriber) {
      console.error('Suscriptor no encontrado:', error)
      return res.redirect('/error.html?reason=subscriber_not_found')
    }

    // Actualizar estado a activo si estaba pendiente
    if (subscriber.status !== 'active') {
      await supabase
        .from('subscribers')
        .update({ status: 'active' })
        .eq('id', subscriber.id)

      // Enviar mensaje de bienvenida por WhatsApp
      await enviarBienvenida(subscriber.id)
    }

    // Redirigir a la página de éxito
    return res.redirect('/gracias.html')
  } catch (err) {
    console.error('Error en paypal-success:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}