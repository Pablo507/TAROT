// api/paypal-webhook.js
// PayPal llama a este endpoint cuando la suscripción se activa, cancela, renueva, etc.

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const event = req.body
    const eventType = event.event_type

    console.log(`[PayPal Webhook] evento recibido: ${eventType}`)

    const resource = event.resource || {}
    const customId = resource.custom_id      // subscriber_id de Supabase
    const ppSubId  = resource.id             // ID de suscripción PayPal

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
    return res.status(200).json({ ok: true }) // Siempre 200 para que PayPal no reintente
  }
}

// ── Activar suscriptor en Supabase + WhatsApp ───────────────────────────────
async function activarSuscriptor(subscriberId, ppSubId) {
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
    .eq('active', false) // Para no chocar con paypal-success
    .select()

  if (updatedSub && updatedSub.length > 0) {
    console.log(`[PayPal Webhook] Suscriptor ${subscriberId} activado via webhook`)
    await enviarBienvenida(subscriberId)
  }
}

// ── Desactivar suscriptor ───────────────────────────────────────────────────
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

// ── Mensaje de bienvenida por WhatsApp ──────────────────────────────────────
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
    await fetch(
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
    console.log(`[PayPal Webhook] Bienvenida enviada a ${sub.phone}`)
  } catch (err) {
    console.error('[PayPal Webhook] Error enviando WhatsApp:', err)
  }
}