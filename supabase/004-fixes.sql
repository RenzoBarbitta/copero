-- ============================================================
--  004-FIXES.SQL - Reparación integral (idempotente)
--  Copero V2. Ejecutar con SQL Editor en el dashboard. Se puede
--  correr todas las veces que haga falta: todo es IF NOT EXISTS
--  o DROP + CREATE.
--
--  Repara y unifica:
--   * copero_profiles: columna updated_at + trigger (el 001 no la
--     tenía, y el upsert del cliente la necesita).
--   * copero_ranking: garantiza tabla, grants y políticas leídas.
--   * copero_support: la crea aunque 003 nunca se haya ejecutado.
--  NO borra datos ni revierte permisos.
-- ============================================================
begin;

-- ============================================================
-- 1) PERFILES
-- ============================================================
create table if not exists public.copero_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (
    char_length(btrim(display_name)) between 2 and 30
  ),
  created_at timestamptz not null default now()
);

alter table public.copero_profiles enable row level security;
alter table public.copero_profiles add column if not exists updated_at timestamptz not null default now();

revoke all on table public.copero_profiles from anon, authenticated;
grant select on table public.copero_profiles to authenticated;
grant insert (user_id, display_name) on public.copero_profiles to authenticated;
grant update (display_name) on public.copero_profiles to authenticated;

-- El cliente hace UPSERT (on_conflict=user_id): el UPDATE interno exige
-- columna updated_at y trigger para refrescarla.
create or replace function public.copero_profiles_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists copero_profiles_touch on public.copero_profiles;
create trigger copero_profiles_touch
  before update on public.copero_profiles
  for each row execute function public.copero_profiles_touch_updated_at();

drop policy if exists copero_profile_read on public.copero_profiles;
create policy copero_profile_read on public.copero_profiles
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists copero_profile_create on public.copero_profiles;
create policy copero_profile_create on public.copero_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists copero_profile_update on public.copero_profiles;
create policy copero_profile_update on public.copero_profiles
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- 2) RANKING (garantiza lo que 002 ya definió)
-- ============================================================
create table if not exists public.copero_ranking (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 30),
  posicion text not null default '' check (char_length(posicion) <= 5),
  club text not null default '' check (char_length(club) <= 40),
  media smallint not null check (media between 0 and 99),
  titulos integer not null check (titulos between 0 and 1000),
  anio smallint not null check (anio between 2020 and 2100),
  ts timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.copero_ranking enable row level security;

revoke all on table public.copero_ranking from anon, authenticated;
grant select on table public.copero_ranking to anon, authenticated;
grant insert (user_id, display_name, posicion, club, media, titulos, anio, ts)
  on public.copero_ranking to authenticated;
grant update (display_name, posicion, club, media, titulos, anio, ts)
  on public.copero_ranking to authenticated;

drop policy if exists copero_ranking_read on public.copero_ranking;
create policy copero_ranking_read on public.copero_ranking
  for select to anon, authenticated using (true);

drop policy if exists copero_ranking_insert on public.copero_ranking;
create policy copero_ranking_insert on public.copero_ranking
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists copero_ranking_update on public.copero_ranking;
create policy copero_ranking_update on public.copero_ranking
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.copero_ranking_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists copero_ranking_touch on public.copero_ranking;
create trigger copero_ranking_touch
  before update on public.copero_ranking
  for each row execute function public.copero_ranking_touch_updated_at();

-- ============================================================
-- 3) SOPORTE (003 nunca se ejecutó en la base real: se crea acá)
-- ============================================================
create table if not exists public.copero_support (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'basico' check (plan in ('basico', 'premium')),
  active boolean not null default true,
  started_at timestamptz not null default now(),
  payment_ref text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_copero_support_active on public.copero_support (active) where active;

alter table public.copero_support enable row level security;
revoke all on table public.copero_support from anon, authenticated;
grant select, insert (user_id, plan, active, payment_ref) on public.copero_support to authenticated;
grant update (plan, active, payment_ref) on public.copero_support to authenticated;

drop policy if exists select_own_support on public.copero_support;
create policy select_own_support on public.copero_support
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists insert_own_support on public.copero_support;
create policy insert_own_support on public.copero_support
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists update_own_support on public.copero_support;
create policy update_own_support on public.copero_support
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Sin DELETE: la administración se hace desde el dashboard.

comment on table public.copero_support is 'Planes de apoyo: basico (1 USD/mes) y premium (3 USD/mes). RLS: solo el dueño accede.';

commit;