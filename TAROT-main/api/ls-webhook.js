// api/ls-webhook.js
// Lemon Squeezy llama a este endpoint cuando hay un pago exitoso o nueva suscripción
// Configurar en LS Dashboard: Settings → Webhooks

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-signature'];
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    // ── Verificar firma (seguridad) ──────────────────────────
    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(Buffer.from(rawBody)).digest('hex');

      if (signature !== digest) {
        console.warn('[LS Webhook] Firma inválida');
        return res.status(401).send('Unauthorized');
      }
    }

    const { meta, data } = req.body;
    const eventName = meta.event_name;
    const customData = meta.custom_data || {};
    const subscriberId = customData.subscriber_id;

    console.log(`[LS Webhook] event: ${eventName}, subscriberId: ${subscriberId}`);

    // ── Procesar eventos de éxito ──────────────────────────
    // order_created para pagos únicos, subscription_created para suscripciones
    if (eventName === 'order_created' || eventName === 'subscription_created') {
      if (!subscriberId) {
        console.warn('[LS Webhook] No se encontró subscriber_id en custom_data');
        return res.status(200).json({ ok: false, msg: 'No subscriber_id' });
      }

      await activarSuscriptor(subscriberId, data.id, eventName);
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[LS Webhook] Error:', err);
    return res.status(200).json({ ok: true }); // Siempre 200 para evitar reintentos infinitos
  }
}

async function activarSuscriptor(subscriberId, orderId, eventType) {
  // 1. Actualizar Supabase
  const { error } = await supabase
    .from('subscribers')
    .update({
      active: true,
      status: 'active',
      ls_order_id: orderId,
      ls_event: eventType,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscriberId);

  if (error) {
    console.error('[LS Webhook] Error actualizando DB:', error);
    return;
  }

  console.log(`[LS Webhook] Suscriptor ${subscriberId} activado`);

  // 2. Enviar mensaje de bienvenida por WhatsApp
  await enviarBienvenida(subscriberId);
}

async function enviarBienvenida(subscriberId) {
  const { data: sub } = await supabase
    .from('subscribers')
    .select('phone, name')
    .eq('id', subscriberId)
    .single();

  if (!sub) return;

  const nombre = sub.name ? sub.name.split(' ')[0] : null;
  const saludo = nombre ? `¡Hola ${nombre}!` : '¡Hola!';
  const waPhone = sub.phone.replace('+', '');

  const mensaje = `${saludo} 🌙✨\n\n` +
    `*¡Tu suscripción al Oráculo del Tarot está activa!*\n\n` +
    `A partir de mañana recibirás tu carta del día cada mañana directamente aquí.\n\n` +
    `Tu primer lectura llega mañana 🔮\n\n` +
    `_Responde STOP para cancelar tu suscripción en cualquier momento._`;

  try {
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
    );
    console.log(`[LS Webhook] Bienvenida enviada a ${sub.phone}`);
  } catch (err) {
    console.error('[LS Webhook] Error enviando WhatsApp:', err);
  }
}
