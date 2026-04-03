// api/create-ls-checkout.js
// Registra al suscriptor en Supabase y devuelve la URL de checkout de Lemon Squeezy
// POST /api/create-ls-checkout  { phone, name, country }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

    // Guardar como PENDIENTE en Supabase
    const { data: subscriber, error: dbError } = await supabase
      .from('subscribers')
      .upsert(
        {
          phone,
          name: name?.trim() || null,
          active: false,
          status: 'pending',
          source: 'web_paid_ls',
        },
        { onConflict: 'phone', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (dbError) throw dbError

    const subscriberId = subscriber.id

    // Configuración de Lemon Squeezy
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID || '943511';
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID || '1482916';
    
    if (!variantId) {
      return res.status(500).json({ error: 'Configuración incompleta (Variant ID)' });
    }

    // Construir la URL de checkout
    // Pasamos el subscriberId en custom_data para poder identificarlo en el webhook
    const checkoutUrl = `https://checkout.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][subscriber_id]=${subscriberId}&checkout[full_name]=${encodeURIComponent(name || '')}&embed=1`;

    return res.status(200).json({ 
      ok: true,
      checkout_url: checkoutUrl
    })

  } catch (error) {
    console.error('Error en create-ls-checkout:', error);
    return res.status(500).json({ error: 'Error al procesar el checkout. Intentá de nuevo.' });
  }
}
