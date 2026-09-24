-- ============================================================
--  009-COOP.SQL  -  Confirmación de cierre de Dupla (Coop Online)
--  Copero V2. Ejecutar con SQL Editor (una vez). Idempotente.
--
--  El Cooperativo "Dupla de Carreras" (coop.js) es un partido P2P vía
--  Supabase Realtime Broadcast: el motor corre en cada cliente y la carrera
--  de cada integrante la simula su propio navegador (determinista por
--  semilla del servidor). Reutiliza la infraestructura genérica de salas de
--  006 (copero_duelo_sala_unirse registra la sala + semilla + rol y protege
--  contra terceros / sala_llena).
--
--  Esta migración agrega la confirmación del PROYECTO DE LA DUPLA:
--    * Cada integrante, al finalizar la carrera compartida, confirma SU
--      aporte con el RPC public.copero_coop_confirmar(...).
--    * La PK (coop_id, user_id) es IDEMPOTENTE: confirmar dos veces el mismo
--      proyecto no duplica ni reescribe.
--    * public.copero_coop_resultado(...) devuelve el veredicto compartido:
--      ambos aportes + la META (es AND de las dos confirmaciones: coopera-
--      tivo = se cumple solo si los dos la marcaron).
--  Al igual que el duelo, todo es best-effort y try/catch en el cliente:
--  si el RPC no está instalado o no hay sesión, el final NO se rompe.
-- ============================================================
begin;

-- Confirmación del aporte de cada integrante de la dupla.
create table if not exists public.copero_coop_partidas (
  coop_id text not null check (char_length(coop_id) between 5 and 100),
  user_id uuid not null references auth.users(id) on delete cascade,
  temporadas integer not null default 0 check (temporadas between 0 and 100),
  aporte integer not null default 0 check (aporte between 0 and 2000000),
  meta boolean not null default false,
  resumen jsonb not null default '{}'::jsonb,
  semilla text,
  ts timestamptz not null default now(),
  primary key (coop_id, user_id)
);

alter table public.copero_coop_partidas enable row level security;
revoke all on table public.copero_coop_partidas from anon, authenticated;

-- Lectura de la propia confirmación (por si el cliente quiere mostrarla).
grant select on table public.copero_coop_partidas to authenticated;
drop policy if exists copero_coop_select_own on public.copero_coop_partidas;
create policy copero_coop_select_own on public.copero_coop_partidas
  for select to authenticated using ((select auth.uid()) = user_id);

-- Confirmación del aporte propio. Exige que la sala esté registrada en
-- copero_duelos_salas con este usuario como participante (reutiliza la
-- infraestructura genérica de salas de 006): nadie confirma proyectos
-- ajenos, inventados o de salas donde no jugó.
create or replace function public.copero_coop_confirmar(
  p_coop_id text,
  p_temporadas integer,
  p_aporte integer,
  p_meta boolean,
  p_resumen jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_semilla text;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;
  if p_coop_id is null or char_length(btrim(p_coop_id)) < 5 or char_length(btrim(p_coop_id)) > 100 then
    raise exception 'coop_id inválido' using errcode = '22023';
  end if;

  select s.semilla into v_semilla
    from public.copero_duelos_salas s
    join public.copero_duelos_sala_jugadores j
      on j.room_id = s.room_id and j.user_id = v_uid
   where s.room_id = btrim(p_coop_id);
  if v_semilla is null then
    raise exception 'sala_no_registrada' using errcode = 'P0001';
  end if;

  insert into public.copero_coop_partidas (coop_id, user_id, temporadas, aporte, meta, resumen, semilla, ts)
  values (
    btrim(p_coop_id),
    v_uid,
    greatest(0, least(100, coalesce(p_temporadas, 0))),
    greatest(0, least(2000000, coalesce(p_aporte, 0))),
    coalesce(p_meta, false),
    coalesce(p_resumen, '{}'::jsonb),
    v_semilla,
    now()
  )
  on conflict (coop_id, user_id) do nothing;

  return jsonb_build_object('ok', true, 'semilla', v_semilla);
end;
$$;

revoke all on function public.copero_coop_confirmar(text, integer, integer, boolean, jsonb) from anon, authenticated;
grant execute on function public.copero_coop_confirmar(text, integer, integer, boolean, jsonb) to authenticated;

-- Veredicto compartido del proyecto: aportes de ambos + meta (AND). Solo lo
-- puede consultar un participante de la sala.
create or replace function public.copero_coop_resultado(p_coop_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_mio public.copero_coop_partidas%rowtype;
  v_socio public.copero_coop_partidas%rowtype;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.copero_duelos_sala_jugadores
     where room_id = btrim(coalesce(p_coop_id, '')) and user_id = v_uid
  ) then
    raise exception 'sala_no_registrada' using errcode = 'P0001';
  end if;

  select * into v_mio from public.copero_coop_partidas
   where coop_id = btrim(p_coop_id) and user_id = v_uid;
  select * into v_socio from public.copero_coop_partidas
   where coop_id = btrim(p_coop_id) and user_id <> v_uid
   limit 1;

  if v_mio.user_id is null or v_socio.user_id is null then
    return jsonb_build_object('ok', true, 'completo', false);
  end if;

  return jsonb_build_object(
    'ok', true, 'completo', true,
    'mia', v_mio.aporte, 'socio', v_socio.aporte,
    'meta', (v_mio.meta and v_socio.meta),
    'temporadas', v_mio.temporadas
  );
end;
$$;

revoke all on function public.copero_coop_resultado(text) from anon, authenticated;
grant execute on function public.copero_coop_resultado(text) to authenticated;

commit;