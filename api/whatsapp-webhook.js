// api/whatsapp-webhook.js — recibe mensajes entrantes de WhatsApp
// Maneja: STOP (baja), confirmaciones, respuestas de usuarios y notificaciones de estado

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN  // token que elegís vos al configurar

export default async function handler(req, res) {

  // ── GET: verificación del webhook (Meta lo llama una vez al configurar) ──
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode']
    const token     = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado ✓')
      return res.status(200).send(challenge)  // IMPORTANTE: responder el challenge
    }
    return res.status(403).send('Forbidden')
  }

  // ── POST: mensajes entrantes y notificaciones ──────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const body = req.body

    // Verificar que es un mensaje de WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      return res.status(200).send('OK')  // siempre responder 200 a Meta
    }

    const entry   = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value   = changes?.value

    // ── Capturar cambios de estado (entregado, leído, fallido) ──
    if (value?.statuses) {
      for (const status of value.statuses) {
        if (status.status === 'failed') {
          console.error('[Meta Fallo de Entrega]:', JSON.stringify(status.errors, null, 2))
        }
      }
    }

    // ── Procesar mensajes entrantes ──
    if (value?.messages) {
      for (const msg of value.messages) {
        await procesarMensaje(msg, value.metadata)
      }
    }

    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(200).json({ ok: true })  // siempre 200 para que Meta no reintente
  }
}

async function procesarMensaje(msg, metadata) {
  const phone   = '+' + msg.from
  const texto   = msg.text?.body?.trim().toUpperCase() || ''
  const waPhoneId = metadata?.phone_number_id

  console.log(`[Webhook] Mensaje de ${phone}: "${texto}"`)

  // ── STOP: baja del servicio ──
  if (['STOP', 'BAJA', 'NO', 'CANCELAR', 'DETENER', 'SALIR'].includes(texto)) {
    await supabase
      .from('subscribers')
      .update({ active: false })
      .eq('phone', phone)

    // Respuesta de confirmación
    await enviarRespuesta(waPhoneId, msg.from,
      '✓ Dejaste de recibir las lecturas por WhatsApp.\n\n' +
      '⚠️ *Importante:* esto NO cancela el cobro mensual de $4.99 en PayPal. ' +
      'Para dejar de pagar, tenés que cancelar la suscripción vos mismo/a desde tu cuenta de PayPal ' +
      '(Configuración → Pagos → Pagos automáticos → Oráculo del Tarot → Cancelar).\n\n' +
      'Si cambiás de opinión sobre las lecturas, ingresá al sitio para reactivarlas. ✦'
    )
    console.log(`[Webhook] Baja procesada: ${phone}`)
    return
  }

  // ── START/HOLA: reactivar si estaba dado de baja ──
  if (['START', 'HOLA', 'SI', 'SÍ', 'INICIAR', 'ACTIVAR'].includes(texto)) {
    const { data } = await supabase
      .from('subscribers')
      .select('active')
      .eq('phone', phone)
      .single()

    if (data && !data.active) {
      await supabase
        .from('subscribers')
        .update({ active: true })
        .eq('phone', phone)

      await enviarRespuesta(waPhoneId, msg.from,
        '✦ ¡Bienvenido/a de vuelta! Volverás a recibir tu tirada de tarot cada mañana 🌙'
      )
    }
    return
  }

  // ── Otros mensajes: respuesta automática (URL corregida) ──
  await enviarRespuesta(waPhoneId, msg.from,
    '✦ Oráculo del Tarot IA\n\nRecibís tu lectura diaria cada mañana 🌙\n\n_Responde *STOP* para darte de baja_\n_Hacé tu lectura completa en: https://www.tarotgratis.online_'
  )
}

async function enviarRespuesta(phoneId, to, mensaje) {
  await fetch(
    `https://graph.facebook.com/v21.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: mensaje }
      })
    }
  )
}
