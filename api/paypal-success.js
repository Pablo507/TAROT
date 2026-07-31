import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tarotgratis.online'

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
    const { subscriber_id, subscription_id, token } = req.query

    const ppSubId = subscription_id || token

    if (!subscriber_id && !ppSubId) {
      return res.redirect(`${SITE_URL}/?paypal=error`)
    }

    if (ppSubId) {
      const accessToken = await getPayPalToken()
      const subRes = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${ppSubId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const subData = await subRes.json()

      if (subData.status === 'ACTIVE' || subData.status === 'APPROVED') {
        const idToUpdate = subscriber_id || subData.custom_id

        if (idToUpdate) {
          // El .eq('active', false) es clave: si el webhook ya activó a este
          // suscriptor, este update no encuentra filas y NO se reenvía
          // el mensaje de bienvenida (evita el duplicado).
          const { data: updatedSub } = await supabase
            .from('subscribers')
            .update({
              active: true,
              status: 'active',
              paypal_subscription_id: ppSubId,
              activated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', idToUpdate)
            .eq('active', false)
            .select()

          if (updatedSub && updatedSub.length > 0) {
            console.log(`[PayPal Success] Suscriptor ${idToUpdate} activado via redirect`)
            await enviarBienvenida(idToUpdate)
          } else {
            console.log(`[PayPal Success] Suscriptor ${idToUpdate} ya estaba activo, no se reenvía bienvenida`)
          }
        }

        return res.redirect(`${SITE_URL}/?paypal=success`)
      }
    }

    return res.redirect(`${SITE_URL}/?paypal=pending`)

  } catch (err) {
    console.error('[paypal-success] Error:', err)
    return res.redirect(`${SITE_URL}/?paypal=error`)
  }
}
