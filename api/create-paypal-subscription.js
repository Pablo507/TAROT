// api/create-paypal-subscription.js
// Reemplaza create-subscription.js (Lemon Squeezy → PayPal)
// POST /api/create-paypal-subscription  { phone, name, country }
//
// Flujo:
//  1. Guarda suscriptor como PENDIENTE en Supabase
//  2. Crea una suscripción en PayPal ($4.99/mes)
//  3. Devuelve la URL de aprobación de PayPal
//
// Variables de entorno necesarias:
//   PAYPAL_CLIENT_ID        → de PayPal Developer Dashboard
//   PAYPAL_CLIENT_SECRET    → de PayPal Developer Dashboard
//   PAYPAL_PLAN_ID          → ID del plan mensual $4.99 (se crea una sola vez)
//   PAYPAL_MODE             → 'sandbox' | 'live' (default: live)

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tarotgratis.online'

// ── Obtener token de acceso PayPal ──────────────────────────────────────────
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

  if (!data.access_token) {
    console.error('[PayPal] Error obteniendo token. Status:', res.status, 'Respuesta:', data)
    throw new Error(
      `No se pudo obtener token de PayPal: ${data.error || 'desconocido'} — ${data.error_description || 'sin descripción'}`
    )
  }

  return data.access_token
}

// ── Validar teléfono ────────────────────────────────────────────────────────
function validarTelefono(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone.trim())
}

// ── Handler principal ───────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let { phone, name, country } = req.body

    if (!phone) {
      return res.status(400).json({ error: 'El número de WhatsApp es requerido' })
    }

    // Normalizar teléfono
    phone = (country || '') + phone.replace(/\D/g, '')
    if (!phone.startsWith('+')) phone = '+' + phone

    if (!validarTelefono(phone)) {
      return res.status(400).json({ error: 'Número inválido. Incluí el código de país.' })
    }

    // ── 1. Guardar como PENDIENTE en Supabase ────────────────────────────────
    const { data: subscriber, error: dbError } = await supabase
      .from('subscribers')
      .upsert(
        {
          phone,
          name: name?.trim() || null,
          active: false,
          status: 'pending',
          source: 'web_paid_paypal',
        },
        { onConflict: 'phone', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (dbError) throw dbError

    const subscriberId = subscriber.id

    // ── 2. Crear suscripción en PayPal ───────────────────────────────────────
    const token = await getPayPalToken()

    const subscriptionPayload = {
      plan_id: process.env.PAYPAL_PLAN_ID,
      subscriber: {
        name: {
          given_name: (name?.trim() || 'Suscriptor').split(' ')[0],
          surname: (name?.trim() || '').split(' ').slice(1).join(' ') || 'Tarot',
        },
      },
      application_context: {
        brand_name: 'Oráculo del Tarot',
        locale: 'es-AR',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        return_url: `${SITE_URL}/api/paypal-success?subscriber_id=${subscriberId}`,
        cancel_url: `${SITE_URL}/?paypal=cancelled`,
      },
      custom_id: subscriberId, // se recibe en el webhook
    }

    const ppRes = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `sub-${subscriberId}-${Date.now()}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(subscriptionPayload),
    })

    const ppData = await ppRes.json()

    if (!ppRes.ok) {
      console.error('[PayPal] Error creando suscripción:', ppData)
      throw new Error(ppData.message || 'Error de PayPal')
    }

    // ── 3. Obtener URL de aprobación ─────────────────────────────────────────
    const approvalLink = ppData.links?.find(l => l.rel === 'approve')?.href

    if (!approvalLink) {
      throw new Error('PayPal no devolvió URL de aprobación')
    }

    // Guardar el ID de suscripción de PayPal en Supabase
    await supabase
      .from('subscribers')
      .update({ paypal_subscription_id: ppData.id })
      .eq('id', subscriberId)

    console.log(`[PayPal] Suscripción creada: ${ppData.id} para suscriptor ${subscriberId}`)

    return res.status(200).json({
      ok: true,
      checkout_url: approvalLink,
      subscription_id: ppData.id,
    })

  } catch (error) {
    console.error('[create-paypal-subscription] Error:', error)
    return res.status(500).json({ error: 'Error al procesar el pago. Intentá de nuevo.' })
  }
}
