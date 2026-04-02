// api/mp-webhook.js
// MercadoPago llama a este endpoint cuando hay un pago o cambio de estado
// Configurar en MP Dashboard: Tus integraciones → Webhooks → esta URL

import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import crypto from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

export default async function handler(req, res) {
  // MP envía GET para validar la URL al configurar el webhook
  if (req.method === 'GET') {
    return res.status(200).send('OK')
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    // ── Verificar firma de MercadoPago (seguridad) ──────────
    const signature = req.headers['x-signature']
    const requestId = req.headers['x-request-id']

    if (signature && process.env.MP_WEBHOOK_SECRET) {
      const [tsPart, v1Part] = signature.split(',')
      const ts = tsPart?.split('=')?.[1]
      const v1 = v1Part?.split('=')?.[1]

      const manifest = `id:${req.query?.['data.id']};request-id:${requestId};ts:${ts};`
      const expected = crypto
        .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
        .update(manifest)
        .digest('hex')

      if (expected !== v1) {
        console.warn('Webhook firma inválida')
        return res.status(401).send('Unauthorized')
      }
    }

    const { type, data } = req.body

    console.log(`[MP Webhook] type: ${type}, id: ${data?.id}`)

    // ── Suscripción creada o actualizada ───────────────────
    if (type === 'subscription_preapproval') {
      await procesarSuscripcion(data.id)
    }

    // ── Pago individual de la suscripción ──────────────────
    if (type === 'subscription_authorized_payment') {
      await procesarPago(data.id)
    }

    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('[MP Webhook] Error:', err)
    return res.status(200).json({ ok: true }) // siempre 200 para que MP no reintente indefinidamente
  }
}

// ── Activar/desactivar suscriptor según estado de la suscripción ──
async function procesarSuscripcion(preapprovalId) {
  const preapproval = new PreApproval(mp)
  const sub = await preapproval.get({ id: preapprovalId })

  console.log(`[MP] Suscripción ${preapprovalId}: status=${sub.status}`)

  const subscriberId = sub.external_reference

  if (!subscriberId) {
    console.warn('[MP] Sin external_reference, no puedo identificar al suscriptor')
    return
  }

  // Mapear estado de MP a activo/inactivo
  const activo = sub.status === 'authorized'   // authorized = pago exitoso y vigente
  const estado = {
    'authorized': 'active',
    'pending':    'pending',
    'paused':     'paused',
    'cancelled':  'cancelled',
  }[sub.status] || sub.status

  await supabase
    .from('subscribers')
    .update({
      active: activo,
      status: estado,
      mp_preapproval_id: preapprovalId,
      mp_status: sub.status,
    })
    .eq('id', subscriberId)

  console.log(`[MP] Suscriptor ${subscriberId} → active=${activo}, status=${estado}`)

  // Si se activó por primera vez, mandarle un mensaje de bienvenida
  if (activo) {
    await enviarBienvenida(subscriberId)
  }
}

// ── Log de pago recibido ───────────────────────────────────────
async function procesarPago(paymentId) {
  // Registrar el pago en send_log para auditoría
  await supabase.from('send_log').insert({
    status: 'payment_received',
    wa_message_id: paymentId,
    card: 'PAGO_MP',
    error_msg: `MercadoPago payment ${paymentId}`,
  })
  console.log(`[MP] Pago registrado: ${paymentId}`)
}

// ── Mensaje de bienvenida al suscriptor que pagó ───────────────
async function enviarBienvenida(subscriberId) {
  const { data: sub } = await supabase
    .from('subscribers')
    .select('phone, name')
    .eq('id', subscriberId)
    .single()

  if (!sub) return

  const nombre = sub.name ? sub.name.split(' ')[0] : null
  const saludo = nombre ? `Hola ${nombre}` : 'Hola'
  const waPhone = sub.phone.replace('+', '')

  const mensaje = `${saludo} 🌙✨\n\n` +
    `*¡Tu suscripción al Oráculo del Tarot está activa!*\n\n` +
    `A partir de mañana recibirás tu carta del día cada mañana directamente aquí.\n\n` +
    `Tu primer lectura llega mañana 🔮\n\n` +
    `_Responde STOP para cancelar tu suscripción en cualquier momento._`

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
        text: { body: mensaje }
      })
    }
  )

  console.log(`[MP] Bienvenida enviada a ${sub.phone}`)
}
