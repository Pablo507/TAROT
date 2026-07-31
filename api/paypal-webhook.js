import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

async function getPayPalToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  return data.access_token
}

// Verifica que el evento realmente venga de PayPal (evita activaciones falsas)
async function verificarFirma(req, accessToken) {
  const resp = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: req.headers['paypal-auth-algo'],
      cert_url: req.headers['paypal-cert-url'],
      transmission_id: req.headers['paypal-transmission-id'],
      transmission_sig: req.headers['paypal-transmission-sig'],
      transmission_time: req.headers['paypal-transmission-time'],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: req.body,
    }),
  })

  const data = await resp.json()
  return data.verification_status === 'SUCCESS'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const accessToken = await getPayPalToken()
    const firmaValida = await verificarFirma(req, accessToken)

    if (!firmaValida) {
      console.warn('[PayPal Webhook] Firma inválida — evento descartado')
      return res.status(401).send('Unauthorized')
    }

    const event = req.body
    const eventType = event.event_type

    console.log(`[PayPal Webhook] evento recibido: ${eventType}`)

    const resource = event.resource || {}
    const customId = resource.custom_id
    const ppSubId  = resource.id

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        if (customId) {
          await activarSuscriptor(customId, ppSubId)
        } else {
          const { data: sub } = await supabase
            .from('subscribers')
            .select('id')
            .eq('paypal_subscription_id', ppSubId)
            .single()
          if (sub) await activarSuscriptor(sub.id, ppSubId)
        }
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await desactivarSuscriptor(ppSubId, eventType)
        break

      case 'PAYMENT.SALE.COMPLETED':
        const billingSubId = resource.billing_agreement_id
        if (billingSubId) {
          await supabase
            .from('subscribers')
            .update({
              last_payment_at: new Date().toISOString(),
              status: 'active',
              active: true,
            })
            .eq('paypal_subscription_id', billingSubId)
          console.log(`[PayPal Webhook] Pago renovado para suscripción ${billingSubId}`)
        }
        break

      default:
        console.log(`[PayPal Webhook] Evento no manejado o ignorado: ${eventType}`)
    }

    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('[PayPal Webhook] Error:', err)
    return res.status(200).json({ ok: true })
  }
}

async function activarSuscriptor(subscriberId, ppSubId) {
  // El .eq('active', false) es clave: si otro proceso (el redirect de
  // paypal-success.js) ya activó a este suscriptor, este update no
  // encuentra filas y NO se reenvía el mensaje de bienvenida.
  const { data: updatedSub } = await supabase
    .from('subscribers')
    .update({
      active: true,
      status: 'active',
      paypal_subscription_id: ppSubId,
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriberId)
    .eq('active', false)
    .select()

  if (updatedSub && updatedSub.length > 0) {
    console.log(`[PayPal Webhook] Suscriptor ${subscriberId} activado via webhook`)
    await enviarBienvenida(subscriberId)
  } else {
    console.log(`[PayPal Webhook] Suscriptor ${subscriberId} ya estaba activo, no se reenvía bienvenida`)
  }
}

async function desactivarSuscriptor(ppSubId, motivo) {
  const { error } = await supabase
    .from('subscribers')
    .update({
      active: false,
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('paypal_subscription_id', ppSubId)

  if (error) {
    console.error('[PayPal Webhook] Error desactivando suscriptor:', error)
    return
  }
  console.log(`[PayPal Webhook] Suscriptor desactivado por: ${motivo}`)
}

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

    console.log(`[PayPal Webhook] Bienvenida enviada a ${sub.phone}`)
  } catch (err) {
    console.error('[PayPal Webhook] Error enviando WhatsApp:', err)
  }
}
