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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const event = req.body
    console.log('[PayPal Webhook Event]:', event.event_type)

    const resource = event.resource
    const subscriptionId = resource.id || resource.billing_agreement_id

    if (!subscriptionId) {
      return res.status(200).json({ received: true, note: 'No subscription ID found in event' })
    }

    // Activar suscripción en eventos de PayPal
    if (
      event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
      event.event_type === 'PAYMENT.SALE.COMPLETED'
    ) {
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('*')
        .eq('paypal_subscription_id', subscriptionId)
        .single()

      if (subscriber && subscriber.status !== 'active') {
        await supabase
          .from('subscribers')
          .update({ status: 'active' })
          .eq('id', subscriber.id)

        await enviarBienvenida(subscriber.id)
      }
    }

    // Manejar cancelación / suspensión
    if (
      event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
      event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED'
    ) {
      await supabase
        .from('subscribers')
        .update({ status: 'cancelled' })
        .eq('paypal_subscription_id', subscriptionId)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('[PayPal Webhook Error]:', err)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}