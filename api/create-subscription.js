// api/create-subscription.js
// Crea una suscripción recurrente en MercadoPago y redirige al usuario mediante Plan ID
// POST /api/create-subscription  { phone, name, country }

import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig } from 'mercadopago'

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
          status: 'pending',
          source: 'web_paid',
        },
        { onConflict: 'phone', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (dbError) throw dbError

    const subscriberId = subscriber.id

    // En lugar de llamar a la API (que requiere card_token_id para Planes), 
    // construimos el enlace de redirección directamente usando el Plan ID proporcionado.
    const planId = 'f510d6ed3e3041908f2223fe38d06985';
    // Se añade external_reference para el seguimiento en el webhook
    const init_point = `https://www.mercadopago.com.uy/subscriptions/checkout?preapproval_plan_id=${planId}&external_reference=${subscriberId}`;

    return res.status(200).json({ 
      ok: true,
      init_point: init_point,
      subscription_id: 'plan_based_' + subscriberId // ID temporal hasta que el webhook confirme
    })

  } catch (error) {
    console.error('Error en create-subscription:', error);
    return res.status(500).json({ error: 'Error al procesar la suscripción. Intentá de nuevo.' });
  }
}
