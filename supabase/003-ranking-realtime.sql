-- Copero V2: etapa 3, habilitacion de Supabase Realtime para el ranking.
-- Permite que el modal del ranking detecte al instante un INSERT/UPDATE/DELETE
-- en copero_ranking hecho desde OTRO dispositivo (sin polling cada 10 s).
--
-- COMO ACTIVARLO (una sola vez, por dashboard o SQL Editor):
--   Ejecutar este script en Supabase -> SQL Editor.
--   Tambien se puede activar desde: Database -> Replication -> Enable Realtime
--   sobre la tabla public.copero_ranking (si tu plan lo permite por UI).
--
-- Si NO se ejecuta, el juego sigue funcionando: el cliente reintenta el
-- canal y si falla cae solo al polling (cada 10 s). Es una mejora opcional.
--
-- Idempotente: se puede ejecutar varias veces sin errores.
--
-- Nota: el SELECT publico (002-ranking.sql, politica copero_ranking_read)
-- ya existe, por lo que el evento llega tambien a clientes anonimos.

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'copero_ranking'
  ) then
    alter publication supabase_realtime add table public.copero_ranking;
  end if;
end $$;