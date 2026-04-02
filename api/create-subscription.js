// api/create-subscription.js
// Crea una suscripción recurrente en MercadoPago y redirige al usuario
// POST /api/create-subscription  { phone, name, country }

import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
})

function validarTelefono(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone.trim())
}

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

    // Guardar como PENDIENTE en Supabase (se activa cuando MP confirme el pago)
    const { data: subscriber, error: dbError } = await supabase
      .from('subscribers')
      .upsert(
        {
          phone,
          name: name?.trim() || null,
          active: false,           // inactivo hasta que pague
          status: 'pending',       // nuevo campo
          source: 'web_paid',
        },
        { onConflict: 'phone', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (dbError) throw dbError

    const subscriberId = subscriber.id

    // Crear suscripción en MercadoPago
    const preapproval = new PreApproval(mp)

    const suscripcion = await preapproval.create({
      body: {
        reason: 'Tarot Diario por WhatsApp — Oráculo del Tarot IA',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 15,        // $15 USD (minimo requerido por MP para USD)
          currency_id: 'USD',           // Mercado Pago USD
        },
        back_url: `${process.env.APP_URL}/suscripcion-exitosa?sub=${subscriberId}`,
        payer_email: `${phone.replace('+', '')}@tarot.placeholder`, // MP requiere email
        external_reference: subscriberId,   // lo usamos en el webhook para identificar al usuario
        status: 'pending',
      }
    })

    // Guardar el preapproval_id para rastrear pagos futuros
    await supabase
      .from('subscribers')
      .update({ mp_preapproval_id: suscripcion.id })
      .eq('id', subscriberId)

    // Devolver la URL de pago de MercadoPago
    return res.status(200).json({
      ok: true,
      init_point: suscripcion.init_point,  // URL donde el usuario paga
      subscription_id: suscripcion.id
    })

  } catch (err) {
    console.error('create-subscription error:', err)
    return res.status(500).json({ error: 'Error al crear la suscripción. Intentá de nuevo.' })
  }
}
