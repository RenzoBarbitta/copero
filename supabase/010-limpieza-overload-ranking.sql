-- ============================================================
--  010-LIMPIEZA-OVERLOAD-RANKING.SQL  -  Elimina la sobrecarga vieja
--  Copero V2. Ejecutar con SQL Editor (una vez). Idempotente.
--
--  PROBLEMA QUE ARREGLA:
--    En la base convivían DOS funciones public.copero_publicar_ranking:
--      a) una vieja de 7 argumentos  (..., p_nonce text)
--      b) la canónica de 10 argumentos de 008 (..., p_nonce, p_durante,
--         p_a_longitud, p_seleccion)
--    Al publicar el ranking, el cliente manda los 7 primeros parámetros
--    nombrados y PostgREST no sabe cuál elegir: responde HTTP 300
--    (PGRST203 "Could not choose the best candidate function between").
--    Por eso ningún cambio podía publicar y test-seguridad-live.mjs marcaba
--    "VULNERABLE" (no era un agujero: era ambigüedad de firma).
--
--  QUÉ HACE:
--    1) Borra la firma vieja de 7 argumentos (la que reportó PostgREST).
--    2) Borra también la de 9 argumentos de 005, por las dudas.
--    3) Verifica que quede exactamente UNA función con ese nombre.
--
--  Idempotente: se puede correr las veces que haga falta.
-- ============================================================
begin;

-- ============================================================
-- 0) DIAGNÓSTICO: muestra las firmas que existen (queda en el log)
-- ============================================================
do $$
declare
  f record;
begin
  for f in
    select p.pronargs,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'copero_publicar_ranking'
    order by p.pronargs
  loop
    raise notice 'Firma encontrada: copero_publicar_ranking(%)', f.args;
  end loop;
end;
$$;

-- ============================================================
-- 1) BORRAR SOBRECARGAS OBSOLETAS
--    `drop function` identifica por TIPOS declarados exactos, así que
--    solo toca la firma indicada (la canónica de 10 no se ve afectada).
-- ============================================================
-- Vieja de 7 argumentos (la que aparecía en el error PGRST203).
drop function if exists public.copero_publicar_ranking(
  text, text, text, integer, integer, text, text
);

-- De 005 (9 argumentos: 7 + p_durante + p_a_longitud). 008 ya la borró,
-- esto es solo por si quedó en algún entorno.
drop function if exists public.copero_publicar_ranking(
  text, text, text, integer, integer, text, text, text, integer
);

-- ============================================================
-- 2) VERIFICACIÓN: tiene que quedar UNA sola firma
-- ============================================================
do $$
declare
  v_total integer;
begin
  select count(*)
    into v_total
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = 'copero_publicar_ranking';

  if v_total <> 1 then
    raise exception 'Quedaron % firmas de copero_publicar_ranking (debe ser 1). Ejecutá 008-internacional.sql y volvé a correr 010', v_total;
  end if;

  raise notice 'OK: copero_publicar_ranking tiene una sola firma. PostgREST ya puede resolver el RPC.';
end;
$$;

commit;
