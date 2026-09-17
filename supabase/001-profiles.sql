-- Copero V2: etapa 1, perfiles de cuentas autenticadas.
-- Ejecutar con SQL Editor en el proyecto propio. No borra datos existentes.
-- Los perfiles se crean explícitamente después de confirmar email/iniciar sesión.
-- NO habilita escritura de puntajes: requiere RPC de validación en otra migración.
begin;

create table if not exists public.copero_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (
    char_length(btrim(display_name)) between 2 and 30
  ),
  created_at timestamptz not null default now()
);

alter table public.copero_profiles enable row level security;
revoke all on table public.copero_profiles from anon, authenticated;
grant select on table public.copero_profiles to authenticated;
grant insert (user_id, display_name) on public.copero_profiles to authenticated;
grant update (display_name) on public.copero_profiles to authenticated;

-- Cada cuenta solo consulta y modifica su perfil.
-- Las tablas públicas de clasificación expondrán únicamente apodo y resultado.
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

commit;
