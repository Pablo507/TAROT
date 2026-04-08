// api/subscribe.js — Vercel API Route
// Registra un nuevo suscriptor en Supabase
// POST /api/subscribe  { phone: "+5491155550000", name: "María" }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role, nunca exponer al cliente
)

// Validar formato E.164: +[código país][número]
function validarTelefono(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone.trim())
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let { phone, name } = req.body

    if (!phone) {
      return res.status(400).json({ error: 'El número de WhatsApp es requerido' })
    }

    // Normalizar: quitar espacios, guiones, etc.
    phone = phone.replace(/[\s\-\(\)]/g, '')
    if (!phone.startsWith('+')) phone = '+' + phone

    if (!validarTelefono(phone)) {
      return res.status(400).json({
        error: 'Formato inválido. Incluí el código de país. Ej: +5491155550000'
      })
    }

    // Upsert: si ya existe y estaba inactivo, lo reactiva
    const { data, error } = await supabase
      .from('subscribers')
      .upsert(
        {
          phone,
          name: name?.trim() || null,
          active: true,
          source: 'web',
        },
        {
          onConflict: 'phone',
          ignoreDuplicates: false,
        }
      )
      .select('id, active')
      .single()

    if (error) throw error

    return res.status(200).json({
      ok: true,
      message: '¡Listo! Recibirás tu tirada diaria cada mañana ✦'
    })

  } catch (err) {
    console.error('Subscribe error:', err)
    return res.status(500).json({ error: 'Error al registrar. Intentá de nuevo.' })
  }
}
