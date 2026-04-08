-- ============================================================
-- Tabla de suscriptores de tarot diario por WhatsApp
-- Correr en: Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists subscribers (
  id            uuid primary key default gen_random_uuid(),
  phone         text not null unique,          -- formato E.164: +5491155550000
  name          text,                          -- nombre opcional
  created_at    timestamptz default now(),
  active        boolean default true,          -- false = STOP/baja
  last_sent_at  timestamptz,                   -- última vez que se le envió
  sends_count   integer default 0,             -- total de mensajes recibidos
  wa_id         text,                          -- WhatsApp contact ID (lo devuelve la API)
  source        text default 'web'             -- de dónde vino el lead
);

-- Índice para el cron (solo activos)
create index idx_subscribers_active on subscribers(active) where active = true;

-- Tabla de log de envíos (útil para debugging y auditoría)
create table if not exists send_log (
  id            uuid primary key default gen_random_uuid(),
  subscriber_id uuid references subscribers(id) on delete cascade,
  sent_at       timestamptz default now(),
  card          text,                          -- carta del tarot enviada
  status        text,                          -- 'sent' | 'failed' | 'skipped'
  wa_message_id text,                          -- ID que devuelve WhatsApp API
  error_msg     text                           -- si falló, por qué
);

-- RLS: habilitar seguridad por fila
alter table subscribers enable row level security;
alter table send_log    enable row level security;

-- Política: solo el service role puede leer/escribir (no expuesto al cliente)
create policy "service role only" on subscribers
  for all using (auth.role() = 'service_role');

create policy "service role only" on send_log
  for all using (auth.role() = 'service_role');

-- Vista útil para el dashboard
create or replace view subscriber_stats as
select
  count(*) filter (where active = true)  as active_count,
  count(*) filter (where active = false) as unsubscribed_count,
  count(*)                               as total_count,
  max(created_at)                        as last_signup,
  count(*) filter (where created_at > now() - interval '7 days') as signups_last_7d
from subscribers;

-- ── Campos adicionales para suscripción paga ─────────────────
-- Correr esto si ya ejecutaste el schema anterior

alter table subscribers
  add column if not exists status          text default 'pending',
  add column if not exists mp_preapproval_id text,
  add column if not exists mp_status       text,
  add column if not exists ls_order_id     text,
  add column if not exists ls_event        text,
  add column if not exists updated_at      timestamptz default now();

-- Índice para buscar por preapproval_id desde el webhook
create index if not exists idx_subscribers_mp on subscribers(mp_preapproval_id);

-- Índice para buscar por ls_order_id desde el webhook
create index if not exists idx_subscribers_ls on subscribers(ls_order_id);

-- Comentarios para documentar los estados posibles
comment on column subscribers.status is 'pending | active | paused | cancelled';
comment on column subscribers.active is 'true solo cuando status=active (pago vigente)';
