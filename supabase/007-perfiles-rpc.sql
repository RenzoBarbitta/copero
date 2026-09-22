-- ============================================================
--  007-PERFILES-RPC.SQL  -  Perfil por RPC (corrección + endurecimiento)
--  Copero V2. Ejecutar con SQL Editor (una vez). Idempotente.
--
--  PROBLEMA REPORTADO: «No deja cambiar el apodo» — guardarPerfil fallaba
--  con código 42501 ("No se autorizó la operación"). La escritura directa
--  del cliente sobre copero_profiles (upsert) depende de grants y políticas
--  RLS EXACTAS; cuando la base quedó desalineada (p. ej. 001 aplicado y
--  004/005 no, o permisos tocados a mano), PostgREST rechaza el INSERT/
--  UPDATE con 42501 aunque la LECTURA siga funcionando.
--
--  SOLUCIÓN (mismo modelo que 005 para el ranking):
--   1) Se reparan grants y políticas de copero_profiles (fallback y camino
--      directo histórico).
--   2) Se crean RPC SECURITY DEFINER como autoridad única:
--        public.copero_leer_perfil()            -> text (apodo o null)
--        public.copero_guardar_perfil(text)     -> text (apodo guardado)
--      El RPC corre con privilegios del owner (ignora RLS y grants de la
--      tabla), pero valida auth.uid() y el rango del apodo en el servidor.
--   3) El cliente (cuenta-api.js) pasa a usar estos RPC, con respaldo a la
--      escritura directa heredada solo si el RPC no existe en la base.
--
--  Sin sesión, auth.uid() es null y los RPC rechazan con 42501: anon nunca
--  puede leer ni guardar un apodo.
-- ============================================================
begin;

-- ============================================================
-- 1) REPARACIÓN DE LA TABLA (idempotente, a prueba de desalineación)
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
-- 2) RPC DE LECTURA (autoridad única, SECURITY DEFINER)
-- ============================================================
create or replace function public.copero_leer_perfil()
returns text
language sql
security definer
set search_path = public
as $$
  select btrim(display_name)
    from public.copero_profiles
   where user_id = auth.uid()
$$;

-- ============================================================
-- 3) RPC DE GUARDADO (valida sesión y rango del apodo)
-- ============================================================
create or replace function public.copero_guardar_perfil(p_display_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_nombre text;
begin
  -- Sesión obligatoria: nunca se confía en un user_id del payload.
  if v_uid is null then
    raise exception 'Se requiere sesión para guardar el perfil' using errcode = '42501';
  end if;

  v_nombre := btrim(coalesce(p_display_name, ''));
  if char_length(v_nombre) < 2 or char_length(v_nombre) > 30 then
    raise exception 'El apodo debe tener entre 2 y 30 caracteres.' using errcode = '22023';
  end if;

  insert into public.copero_profiles (user_id, display_name, created_at, updated_at)
  values (v_uid, v_nombre, now(), now())
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    updated_at   = now();

  return v_nombre;
end;
$$;

-- Solo cuentas autenticadas pueden invocar los RPC. anon jamás.
revoke all on function public.copero_leer_perfil() from public, anon, authenticated;
revoke all on function public.copero_guardar_perfil(text) from public, anon, authenticated;
grant execute on function public.copero_leer_perfil() to authenticated;
grant execute on function public.copero_guardar_perfil(text) to authenticated;

commit;