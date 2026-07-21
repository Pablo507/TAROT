// api/paypal-webhook.js
// PayPal llama a este endpoint cuando la suscripción se activa, cancela, etc.
// Configurar en PayPal Developer → Webhooks
//
// Eventos a escuchar:
//   BILLING.SUBSCRIPTION.ACTIVATED  → activar suscriptor
//   BILLING.SUBSCRIPTION.CANCELLED  → desactivar suscriptor
//   BILLING.SUBSCRIPTION.SUSPENDED  → desactivar suscriptor
//   PAYMENT.SALE.COMPLETED           → pago mensual exitoso

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

// ── Verificar firma del webhook de PayPal ───────────────────────────────────
async function verificarFirma(req, rawBody) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[PayPal Webhook] PAYPAL_WEBHOOK_ID no configurado — saltando verificación')
    return true
  }

  try {
    const token = await getPayPalToken()

    const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo:         req.headers['paypal-auth-algo'],
        cert_url:          req.headers['paypal-cert-url'],
        transmission_id:   req.headers['paypal-transmission-id'],
        transmission_sig:  req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id:        webhookId,
        webhook_event:     JSON.parse(rawBody),
      }),
    })

    const result = await verifyRes.json()
    return result.verification_status === 'SUCCESS'
  } catch (err) {
    console.error('[PayPal Webhook] Error verificando firma:', err)
    return false
  }
}

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

// ── Handler principal ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const rawBody = JSON.stringify(req.body)
    const event   = req.body
    const eventType = event.event_type

    console.log(`[PayPal Webhook] evento: ${eventType}`)

    // ── Extraer datos del evento ─────────────────────────────────────────────
    const resource    = event.resource || {}
    const customId    = resource.custom_id      // subscriber_id de Supabase
    const ppSubId     = resource.id             // ID de suscripción PayPal

    // ── Procesar según el tipo de evento ────────────────────────────────────
    switch (eventType) {

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Pago aprobado y suscripción activa
        if (customId) {
          await activarSuscriptor(customId, ppSubId)
        } else {
          // Buscar por ID de suscripción PayPal si no hay custom_id
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
        // Desactivar suscriptor
        await desactivarSuscriptor(ppSubId, eventType)
        break

      case 'PAYMENT.SALE.COMPLETED':
        // Pago mensual exitoso — renovar fecha
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
        console.log(`[PayPal Webhook] Evento no manejado: ${eventType}`)
    }

    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('[PayPal Webhook] Error:', err)
    return res.status(200).json({ ok: true }) // Siempre 200 para evitar reintentos
  }
}

// ── Activar suscriptor en Supabase + WhatsApp ───────────────────────────────
async function activarSuscriptor(subscriberId, ppSubId) {
  const { error } = await supabase
    .from('subscribers')
    .update({
      active: true,
      status: 'active',
      paypal_subscription_id: ppSubId,
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriberId)

  if (error) {
    console.error('[PayPal Webhook] Error activando suscriptor:', error)
    return
  }

  console.log(`[PayPal Webhook] Suscriptor ${subscriberId} activado`)
  await enviarBienvenida(subscriberId)
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
