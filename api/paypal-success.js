// api/paypal-success.js
// PayPal redirige aquí después de que el usuario aprueba la suscripción.
// Es un respaldo al webhook — activa al suscriptor si el webhook no llegó primero.
// GET /api/paypal-success?subscriber_id=xxx&subscription_id=xxx&token=xxx

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

export default async function handler(req, res) {
  try {
    const { subscriber_id, subscription_id, token } = req.query

    // PayPal pasa el subscription_id en el parámetro 'token' si no está en subscription_id
    const ppSubId = subscription_id || token

    if (!subscriber_id && !ppSubId) {
      return res.redirect(`${SITE_URL}/?paypal=error`)
    }

    // Verificar estado de la suscripción en PayPal
    if (ppSubId) {
      const accessToken = await getPayPalToken()
      const subRes = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${ppSubId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const subData = await subRes.json()

      if (subData.status === 'ACTIVE' || subData.status === 'APPROVED') {
        // Activar en Supabase si no lo activó el webhook todavía
        const idToUpdate = subscriber_id || subData.custom_id

        if (idToUpdate) {
          await supabase
            .from('subscribers')
            .update({
              active: true,
              status: 'active',
              paypal_subscription_id: ppSubId,
              activated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', idToUpdate)
            .eq('active', false) // Solo si no está ya activo (para no pisar el webhook)

          console.log(`[PayPal Success] Suscriptor ${idToUpdate} activado via redirect`)
        }

        // Redirigir a página de éxito
        return res.redirect(`${SITE_URL}/?paypal=success`)
      }
    }

    return res.redirect(`${SITE_URL}/?paypal=pending`)

  } catch (err) {
    console.error('[paypal-success] Error:', err)
    return res.redirect(`${SITE_URL}/?paypal=error`)
  }
}
