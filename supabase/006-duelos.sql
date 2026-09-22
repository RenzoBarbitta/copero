-- ============================================================
--  006-DUELOS.SQL  -  Confirmación de cierre de Duelo (server-side)
--  Copero V2. Ejecutar con SQL Editor (una vez). Idempotente.
--
--  El duelo 1v1 es un partido P2P vía Supabase Realtime Broadcast: el motor
--  del juego corre en cada cliente y el resultado final lo computa cada lado
--  localmente. Eso NO se puede hacer 100% servidor-verificado sin cambiar la
--  arquitectura (el servidor no simula la carrera). Ver el informe de
--  seguridad: la determinación del ganador queda marcada VULNERABLE.
--
--  Lo que SÍ aporta esta migración (best-effort, sin romper el duelo):
--    * Cada cliente, al ver el resultado, confirma su propio lado con el RPC
--        public.copero_duelo_confirmar(...)
--    * La PK (duel_id, user_id) hace la confirmación IDEMPOTENTE: un jugador
--      no puede registrar dos veces el mismo duelo ni duplicar resultados.
--    * Deja una traza auditable (quién reportó qué puntaje/rol) por duelo.
--  El cierre del género por si un robot lo invoca: todo es try/catch en el
--  cliente y NO bloquea el final del duelo.
-- ============================================================
begin;

create table if not exists public.copero_duelos (
  duel_id text not null check (char_length(duel_id) between 5 and 100),
  user_id uuid not null references auth.users(id) on delete cascade,
  rol text not null check (rol in ('A', 'B')),
  puntaje integer not null default 0 check (puntaje between 0 and 2000000),
  temporadas integer not null default 0 check (temporadas between 0 and 100),
  resumen jsonb not null default '{}'::jsonb,
  ts timestamptz not null default now(),
  primary key (duel_id, user_id)
);

alter table public.copero_duelos enable row level security;
revoke all on table public.copero_duelos from anon, authenticated;

-- Lectura de la propia confirmación (por si el cliente quiere mostrarla).
grant select on table public.copero_duelos to authenticated;
drop policy if exists copero_duelos_select_own on public.copero_duelos;
create policy copero_duelos_select_own on public.copero_duelos
  for select to authenticated using ((select auth.uid()) = user_id);

-- RPC de confirmación: registra UNA sola vez el lado del usuario en sesión.
-- Exige que el duelo esté registrado en copero_duelos_salas con este usuario
-- como participante: así nadie confirma duelos ajenos, inventados o de salas
-- donde no jugó.
create or replace function public.copero_duelo_confirmar(
  p_duel_id text,
  p_rol text,
  p_puntaje integer,
  p_temporadas integer,
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
  if p_duel_id is null or char_length(btrim(p_duel_id)) < 5 or char_length(btrim(p_duel_id)) > 100 then
    raise exception 'duel_id inválido' using errcode = '22023';
  end if;
  if p_rol not in ('A', 'B') then
    raise exception 'rol inválido' using errcode = '22023';
  end if;

  -- La sala debe existir y yo debo ser uno de sus jugadores.
  select s.semilla into v_semilla
    from public.copero_duelos_salas s
    join public.copero_duelos_sala_jugadores j
      on j.room_id = s.room_id and j.user_id = v_uid
   where s.room_id = btrim(p_duel_id);
  if v_semilla is null then
    raise exception 'sala_no_registrada' using errcode = 'P0001';
  end if;

  insert into public.copero_duelos (duel_id, user_id, rol, puntaje, temporadas, resumen, ts, semilla)
  values (
    btrim(p_duel_id),
    v_uid,
    p_rol,
    greatest(0, least(2000000, coalesce(p_puntaje, 0))),
    greatest(0, least(100, coalesce(p_temporadas, 0))),
    coalesce(p_resumen, '{}'::jsonb),
    now(),
    v_semilla
  )
  -- PK (duel_id, user_id): confirmar dos veces el mismo duelo NO duplica ni
  -- reescribe nada (anti-replay / anti-doble-recompensa).
  on conflict (duel_id, user_id) do nothing;

  return jsonb_build_object('ok', true, 'semilla', v_semilla);
end;
$$;

revoke all on function public.copero_duelo_confirmar(text, text, integer, integer, jsonb) from anon, authenticated;
grant execute on function public.copero_duelo_confirmar(text, text, integer, integer, jsonb) to authenticated;

-- Columna para guardar con qué semilla del servidor se jugó cada confirmación.
alter table public.copero_duelos add column if not exists semilla text;

-- ============================================================
--  5) REGISTRO DE SALAS (identidad y semilla del SERVIDOR)
--  El matchmaking sigue igual (Realtime Presence/Broadcast), pero la sala
--  queda registrada en el servidor con sus DOS jugadores reales. Con eso:
--    * un tercero no puede entrar/enviar/escuchar una sala ya ocupada;
--    * la semilla de los minijuegos la elige el SERVIDOR (no el navegador);
--    * no se pueden confirmar resultados de duelos ajenos o inventados.
-- ============================================================
create table if not exists public.copero_duelos_salas (
  room_id text primary key check (char_length(room_id) between 5 and 120),
  semilla text not null,
  creada timestamptz not null default now()
);

create table if not exists public.copero_duelos_sala_jugadores (
  room_id text not null references public.copero_duelos_salas(room_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ts timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists idx_copero_duelos_jug_ts
  on public.copero_duelos_sala_jugadores (ts);

alter table public.copero_duelos_salas enable row level security;
alter table public.copero_duelos_sala_jugadores enable row level security;
-- Sin acceso directo por API: todo pasa por los RPC (SECURITY DEFINER).
revoke all on table public.copero_duelos_salas from anon, authenticated;
revoke all on table public.copero_duelos_sala_jugadores from anon, authenticated;

-- Entrar/abrir una sala: registra a auth.uid() como jugador de esa sala y
-- devuelve la semilla del SERVIDOR + el rol determinista. Si la sala ya tiene
-- dos jugadores distintos, rechaza con 'sala_llena'.
create or replace function public.copero_duelo_sala_unirse(p_room_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_sala text := btrim(coalesce(p_room_id, ''));
  v_semilla text;
  v_jugadores integer;
  v_mio boolean;
  v_primero text;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;
  if char_length(v_sala) < 5 or char_length(v_sala) > 120 then
    raise exception 'sala_invalida' using errcode = '22023';
  end if;

  -- Higiene: si nadie jugó esa sala en 6 horas, se libera (permite reusar el
  -- mismo nombre de sala más adelante sin quedar bloqueada para siempre).
  delete from public.copero_duelos_sala_jugadores
   where room_id = v_sala and ts < now() - interval '6 hours';
  if not exists (select 1 from public.copero_duelos_sala_jugadores where room_id = v_sala) then
    delete from public.copero_duelos_salas where room_id = v_sala;
  end if;

  -- La semilla la genera el servidor: el navegador no elige el evento.
  insert into public.copero_duelos_salas (room_id, semilla)
  values (v_sala, replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
  on conflict (room_id) do nothing;

  select semilla into v_semilla from public.copero_duelos_salas where room_id = v_sala;

  select count(*), coalesce(bool_or(user_id = v_uid), false)
    into v_jugadores, v_mio
    from public.copero_duelos_sala_jugadores
   where room_id = v_sala;

  if not v_mio and v_jugadores >= 2 then
    raise exception 'sala_llena' using errcode = 'P0001';
  end if;

  insert into public.copero_duelos_sala_jugadores (room_id, user_id, ts)
  values (v_sala, v_uid, now())
  on conflict (room_id, user_id) do update set ts = now();

  select count(*) into v_jugadores from public.copero_duelos_sala_jugadores where room_id = v_sala;
  select min(user_id::text) into v_primero from public.copero_duelos_sala_jugadores where room_id = v_sala;

  return jsonb_build_object(
    'ok', true,
    'semilla', v_semilla,
    'rol', case when v_primero = v_uid::text then 'A' else 'B' end,
    'jugadores', v_jugadores
  );
end;
$$;

revoke all on function public.copero_duelo_sala_unirse(text) from anon, authenticated;
grant execute on function public.copero_duelo_sala_unirse(text) to authenticated;

-- Resultado del duelo calculado por el SERVIDOR a partir de las dos
-- confirmaciones guardadas. Solo lo puede consultar un participante de la sala.
create or replace function public.copero_duelo_resultado(p_duel_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_mio public.copero_duelos%rowtype;
  v_rival public.copero_duelos%rowtype;
  v_ganador uuid;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.copero_duelos_sala_jugadores
     where room_id = btrim(coalesce(p_duel_id, '')) and user_id = v_uid
  ) then
    raise exception 'sala_no_registrada' using errcode = 'P0001';
  end if;

  select * into v_mio from public.copero_duelos
   where duel_id = btrim(p_duel_id) and user_id = v_uid;
  select * into v_rival from public.copero_duelos
   where duel_id = btrim(p_duel_id) and user_id <> v_uid
   limit 1;

  if v_mio.user_id is null or v_rival.user_id is null then
    return jsonb_build_object('ok', true, 'completo', false);
  end if;

  if v_mio.puntaje > v_rival.puntaje then v_ganador := v_mio.user_id;
  elsif v_rival.puntaje > v_mio.puntaje then v_ganador := v_rival.user_id;
  else v_ganador := null;
  end if;

  return jsonb_build_object(
    'ok', true, 'completo', true, 'ganador', v_ganador,
    'mia', v_mio.puntaje, 'rival', v_rival.puntaje
  );
end;
$$;

revoke all on function public.copero_duelo_resultado(text) from anon, authenticated;
grant execute on function public.copero_duelo_resultado(text) to authenticated;

commit;