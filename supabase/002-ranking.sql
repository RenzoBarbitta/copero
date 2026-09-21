-- Copero V2: etapa 2, ranking global sobre Supabase con Row Level Security.
-- Reemplaza el almacen publico (textdb.dev). Ejecutar con SQL Editor o API.
-- El script usa una transaccion y se puede volver a ejecutar.
--
-- MODELO DE DEFENSA:
--  - Leer es publico (el top 100 se ve sin iniciar sesion).
--  - Escribir exige sesion iniciada y SOLO sobre la fila propia (PK = user_id).
--  - No existe grant ni politica de DELETE: nadie borra filas por API.
--    La moderacion (borrar un jugador) se hace desde el dashboard (service_role).
--  - CHECK constraints: media 0..99, apodo 2..30, sin valores absurdos.
--  - LIMITACION CONOCIDA: el propietario de una cuenta puede inflar SU media
--    (el cliente no es confiable). Eliminarlo requiere validacion server-side.
begin;

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

-- Sin estos grants, anon y authenticated no tienen ningun permiso implicito.
revoke all on table public.copero_ranking from anon, authenticated;

grant select on table public.copero_ranking to anon, authenticated;
grant insert (user_id, display_name, posicion, club, media, titulos, anio, ts)
  on public.copero_ranking to authenticated;
grant update (display_name, posicion, club, media, titulos, anio, ts)
  on public.copero_ranking to authenticated;

-- Lectura publica del top global.
drop policy if exists copero_ranking_read on public.copero_ranking;
create policy copero_ranking_read on public.copero_ranking
  for select to anon, authenticated using (true);

-- Alta: solo la fila propia, solo autenticado.
drop policy if exists copero_ranking_insert on public.copero_ranking;
create policy copero_ranking_insert on public.copero_ranking
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Edicion: solo la fila propia, solo autenticado (no puede cambiar user_id:
-- no esta entre las columnas otorgadas en el grant update).
drop policy if exists copero_ranking_update on public.copero_ranking;
create policy copero_ranking_update on public.copero_ranking
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- updated_at automatico en cada edicion.
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

commit;
