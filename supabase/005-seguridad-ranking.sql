-- ============================================================
--  005-SEGURIDAD-RANKING.SQL  -  Endurecimiento del ranking online
--  Copero V2. Ejecutar con SQL Editor (una vez). Idempotente.
--
--  CAMBIO DE MODELO:
--   El 002/004 dejaban que el cliente hiciera INSERT/UPDATE directos a su
--   fila (RLS auth.uid()=user_id). Eso sigue permitiendo a una cuenta
--   escribir lo que quiera en SU fila (media=99, titulos=999) desde la
--   consola/DevTools. En la lista de ataque 1.1/1.2/1.13 eso es VULNERABLE.
--
--  A PARTIR DE ACÁ:
--   1) copero_ranking  -> SOLO lectura pública. Cero INSERT/UPDATE/DELETE
--      directos (se borran los policies y grants de escritura).
--   2) Publicar pasa únicamente por el RPC:
--         public.copero_publicar_ranking(...)  (SECURITY DEFINER)
--      que:
--        - ignora el user_id del payload: usa auth.uid() del token.
--        - no acepta ts/anio del cliente: los pone el servidor.
--        - display_name: lo lee del perfil copero_profiles (autoridad);
--          respaldo el nombre del payload solo si es válido (2..30).
--        - posicion: whitelist DEL/CM/DEF/GK (cualquier otra => '').
--        - club: solo nombres de la semilla copero_clubes (data.js);
--          club inexistente => se neutraliza a '' (libre), nunca se graba.
--        - media 0..99 y titulos 0..1000 (topes del CHECK, re-clampeado).
--        - anti-replay: nonce (el _id de la cola del cliente). Reenviar
--          la MISMA carrera (mismo nonce) es idempotente: no reescribe.
--   3) copero_clubes: catálogo autorizado (63 clubes, semilla de data.js).
--   4) copero_ranking_auditoria: registro de cada publicación (moderación).
--
--  LO QUE ESTE SCRIPT NO PUEDE TAPAR (límite documentado):
--   el progreso de la carrera se simula 100% en el navegador, así que el
--   servidor NO puede recalcular la media/títulos reales de una carrera. Lo
--   que sí evita: identidad falsa, valores fuera de rango, clubes/posiciones
--   inventados, escrituras directas, replay y flood. Verificación real del
--   progreso exigiría simular la carrera en el servidor (no se hace acá).
-- ============================================================
begin;

-- ============================================================
-- 1) CATÁLOGO DE CLUBES AUTORIZADOS
-- ============================================================
create table if not exists public.copero_clubes (
  nombre text primary key
);

alter table public.copero_clubes enable row level security;
revoke all on table public.copero_clubes from anon, authenticated;
grant select on table public.copero_clubes to anon, authenticated;

drop policy if exists copero_clubes_read on public.copero_clubes;
create policy copero_clubes_read on public.copero_clubes
  for select to anon, authenticated using (true);

-- Semilla (idempotente): se regenera al ejecutar el script.
truncate table public.copero_clubes;
insert into public.copero_clubes (nombre) values
  ('Agropecuario'), ('Alessandria'), ('Alumni'), ('Aerolíneas Splinter'),
  ('Arsenal'), ('Argentinos Juniors'), ('B15'), ('Botellita'),
  ('Chaco For Ever'), ('Chapa'), ('Chapita'), ('Chappineta'),
  ('Colchester United'), ('Cuiaba'), ('Davoneta'), ('Dope'),
  ('Dream Seven'), ('El Porvenir'), ('Impalare'), ('Imperial'),
  ('Imperial Academy'), ('Las Varillas'), ('Lechonidas'), ('Lions'),
  ('Los Andes'), ('Los Mancos Weones'), ('Los Toros'), ('Lowers'),
  ('Mastur'), ('Milangalock'), ('Nacional'), ('Nadroga'),
  ('Olimpo'), ('Parma'), ('Pastel de Papa'), ('Patos Feos'),
  ('Peñarol'), ('Prodigy'), ('River Plate'), ('Riverpool'),
  ('Roma'), ('San Lorenzo'), ('Sexito'), ('Shark'),
  ('Sol de Mayo'), ('Yorkshine'), ('Hasbullitah'), ('Bodo Glimt'),
  ('Atlanta'), ('Napoli'), ('Villa Dalmine'), ('El Bondi'),
  ('Bochum'), ('Barracas Central'), ('Orlando City'), ('Ta falido'),
  ('Santos'), ('Chapeconense'), ('Nitegy'), ('Night Ravens'),
  ('Laferrere'), ('POD'), ('Xheaston');

-- ============================================================
-- 2) COLUMNA ANTI-REPLAY EN EL RANKING
-- ============================================================
alter table public.copero_ranking add column if not exists carrera_nonce text;
alter table public.copero_ranking add column if not exists evento text not null default 'carrera';

-- ============================================================
-- 2.bis) AUDITORÍA DE PUBLICACIONES (moderación / anti-flood)
-- ============================================================
create table if not exists public.copero_ranking_auditoria (
  id bigserial primary key,
  user_id uuid not null,
  display_name text,
  posicion text,
  club text,
  media smallint,
  titulos integer,
  nonce text,
  idempotente boolean not null default false,
  ts timestamptz not null default now()
);

create index if not exists idx_copero_rank_aud_user_ts
  on public.copero_ranking_auditoria (user_id, ts desc);

alter table public.copero_ranking_auditoria enable row level security;
-- Nadie lee ni escribe la auditoría por API: solo el RPC (SECURITY DEFINER)
-- y la moderación desde el dashboard (service_role).
revoke all on table public.copero_ranking_auditoria from anon, authenticated;

-- ============================================================
-- 3) EL CLIENTE YA NO ESCRIBE NUNCA: SOLO LEE
-- ============================================================
revoke all on table public.copero_ranking from anon, authenticated;
grant select on table public.copero_ranking to anon, authenticated;

drop policy if exists copero_ranking_insert on public.copero_ranking;
drop policy if exists copero_ranking_update on public.copero_ranking;

-- Se conserva la lectura pública del top global.
drop policy if exists copero_ranking_read on public.copero_ranking;
create policy copero_ranking_read on public.copero_ranking
  for select to anon, authenticated using (true);

-- ============================================================
-- 4) RPC DE PUBLICACIÓN VALIDADA (SECURITY DEFINER)
-- ============================================================
create or replace function public.copero_publicar_ranking(
  p_display_name text,
  p_posicion text,
  p_club text,
  p_media integer,
  p_titulos integer,
  p_evento text,
  p_nonce text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_nombre text;
  v_anio integer;
  v_club text;
  v_posicion text;
  v_media integer;
  v_titulos integer;
  v_prev_nonce text;
begin
  -- Sesión obligatoria: nunca se confía en un user_id del payload.
  if v_uid is null then
    raise exception 'Se requiere sesión para publicar en el ranking' using errcode = '42501';
  end if;

  -- Anti-replay: el cliente manda el nonce de su cola (_id del registro).
  -- Reintentar la MISMA carrera (mismo nonce) es idempotente: no reescribe.
  if p_nonce is null or btrim(p_nonce) = '' or char_length(btrim(p_nonce)) > 64 then
    raise exception 'nonce inválido' using errcode = '22023';
  end if;

  -- Solo se acepta el evento 'carrera' (hoy es el único emisor legítimo).
  if p_evento is null or btrim(lower(p_evento)) <> 'carrera' then
    raise exception 'evento no permitido' using errcode = '22023';
  end if;

  -- Anti-flood: tope de publicaciones NUEVAS por hora y cuenta. Los reintentos
  -- idempotentes del mismo nonce no cuentan (no generan publicaciones nuevas).
  if (select count(*) from public.copero_ranking_auditoria
       where user_id = v_uid and not idempotente and ts > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limit' using errcode = 'P0001';
  end if;

  select carrera_nonce into v_prev_nonce
    from public.copero_ranking where user_id = v_uid;
  if v_prev_nonce is not null and v_prev_nonce = p_nonce then
    -- Mismo registro ya aplicado (retry de la cola o replay del mismo envío).
    insert into public.copero_ranking_auditoria
      (user_id, display_name, posicion, club, media, titulos, nonce, idempotente)
    values (v_uid, left(coalesce(p_display_name, ''), 30), left(coalesce(p_posicion, ''), 5),
            left(coalesce(p_club, ''), 40), greatest(0, least(99, coalesce(p_media, 0))),
            greatest(0, least(1000, coalesce(p_titulos, 0))), btrim(p_nonce), true);
    return jsonb_build_object('ok', true, 'idempotente', true, 'user_id', v_uid);
  end if;

  v_anio := extract(year from now())::int;
  v_media := greatest(0, least(99, coalesce(p_media, 0)));
  v_titulos := greatest(0, least(1000, coalesce(p_titulos, 0)));

  -- Nombre: autoridad = perfil de la cuenta. Respaldo solo si el payload
  -- trae un apodo válido (evita bucle en la cola si el perfil no existe).
  select display_name into v_nombre from public.copero_profiles where user_id = v_uid;
  if v_nombre is null or char_length(btrim(v_nombre)) < 2 then
    v_nombre := btrim(coalesce(p_display_name, ''));
    if char_length(v_nombre) < 2 then v_nombre := 'Jugador'; end if;
    v_nombre := left(v_nombre, 30);
  end if;

  -- Posición: whitelist estricta; cualquier otra se neutraliza a ''.
  v_posicion := upper(btrim(coalesce(p_posicion, '')));
  if v_posicion not in ('DEL', 'CM', 'DEF', 'GK') then v_posicion := ''; end if;

  -- Club: solo nombres del catálogo; club inexistente => '' (se neutraliza,
  -- nunca se guarda un club falso en el ranking).
  v_club := btrim(coalesce(p_club, ''));
  if v_club <> '' then
    if not exists (select 1 from public.copero_clubes where nombre = v_club) then
      v_club := '';
    end if;
  end if;

  -- UPSERT de la fila propia (una entrada por cuenta). ts/updated_at los
  -- fija el servidor con now(); el anio es el año del servidor.
  insert into public.copero_ranking
    (user_id, display_name, posicion, club, media, titulos, anio, ts, updated_at, carrera_nonce, evento)
  values
    (v_uid, v_nombre, v_posicion, v_club, v_media, v_titulos, v_anio, now(), now(), btrim(p_nonce), 'carrera')
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    posicion     = excluded.posicion,
    club         = excluded.club,
    media        = excluded.media,
    titulos      = excluded.titulos,
    anio         = excluded.anio,
    ts           = excluded.ts,
    updated_at   = now(),
    carrera_nonce = excluded.carrera_nonce,
    evento        = excluded.evento;

  -- Auditoría de la publicación efectiva (moderación y anti-flood).
  insert into public.copero_ranking_auditoria
    (user_id, display_name, posicion, club, media, titulos, nonce, idempotente)
  values (v_uid, v_nombre, v_posicion, v_club, v_media, v_titulos, btrim(p_nonce), false);

  return jsonb_build_object('ok', true, 'user_id', v_uid);
end;
$$;

-- Solo cuentas autenticadas pueden invocar el RPC. anon jamás.
revoke all on function public.copero_publicar_ranking(text, text, text, integer, integer, text, text) from anon, authenticated;
grant execute on function public.copero_publicar_ranking(text, text, text, integer, integer, text, text) to authenticated;

commit;