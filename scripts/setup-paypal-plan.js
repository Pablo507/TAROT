// scripts/setup-paypal-plan.js
// Corre UNA SOLA VEZ para crear el producto y plan mensual en PayPal.
// Guarda el PAYPAL_PLAN_ID que te devuelve como variable de entorno en Vercel.
//
// Uso:
//   node scripts/setup-paypal-plan.js
//
// Requiere en .env.local:
//   PAYPAL_CLIENT_ID=...
//   PAYPAL_CLIENT_SECRET=...
//   PAYPAL_MODE=sandbox   (para probar) | live (para producción)

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config({ path: '.env.local' })

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

async function getToken() {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Error obteniendo token: ' + JSON.stringify(data))
  return data.access_token
}

async function main() {
  console.log(`\n🔮 Configurando PayPal en modo: ${process.env.PAYPAL_MODE || 'live'}\n`)

  const token = await getToken()
  console.log('✅ Token obtenido')

  // ── 1. Crear Producto ──────────────────────────────────────────────────────
  const productRes = await fetch(`${PAYPAL_BASE}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Oráculo del Tarot — Suscripción Mensual',
      description: 'Lecturas de tarot personalizadas diarias por WhatsApp',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })

  const product = await productRes.json()
  if (!product.id) throw new Error('Error creando producto: ' + JSON.stringify(product))
  console.log(`✅ Producto creado: ${product.id}`)

  // ── 2. Crear Plan mensual $4.99 ────────────────────────────────────────────
  const planRes = await fetch(`${PAYPAL_BASE}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: product.id,
      name: 'Plan Mensual — Oráculo del Tarot',
      description: 'Lecturas de tarot diarias por WhatsApp — $4.99 USD/mes',
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // 0 = indefinido
          pricing_scheme: {
            fixed_price: { value: '4.99', currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: { value: '0', currency_code: 'USD' },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })

  const plan = await planRes.json()
  if (!plan.id) throw new Error('Error creando plan: ' + JSON.stringify(plan))

  console.log(`✅ Plan mensual creado: ${plan.id}`)
  console.log('\n' + '='.repeat(60))
  console.log('🎯 COPIÁ ESTE ID Y AGREGALO COMO VARIABLE DE ENTORNO EN VERCEL:')
  console.log(`\n   PAYPAL_PLAN_ID=${plan.id}\n`)
  console.log('='.repeat(60) + '\n')
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
