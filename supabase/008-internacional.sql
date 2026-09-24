-- ============================================================
--  008-INTERNACIONAL.SQL  -  Expansión internacional (Fase 1)
--  Copero V2. Ejecutar con SQL Editor (una vez). Idempotente.
--
--  FASE 1 (catálogo + visualización en ranking):
--   1) copero_selecciones: catálogo autorizado de las 211 asociaciones
--      miembro de FIFA (6 confederaciones). Lectura pública; solo el
--      servidor la escribe. Es la autoridad que valida la selección que
--      el cliente quiere publicar en el ranking.
--   2) copero_ranking.seleccion: nueva columna (nullable, texto).
--   3) copero_publicar_ranking(): RPC reemplazado con parámetro adicional
--      p_seleccion. Reglas idénticas al de 005 (SECURITY DEFINER, auth.uid(),
--      anti-replay, anti-flood, whitelists) más la validación de la
--      selección contra el catálogo: código inexistente => '' (nunca se
--      guarda una selección falsa). El parámetro es opcional (default null)
--      para no romper clientes viejos que aún no envíen selección.
--
--  La nacionalidad (UY etc.) se mantiene 100% en el cliente (data.js):
--  este script solo habilita MOSTRARLA de forma segura en el ranking.
-- ============================================================
begin;

-- ============================================================
-- 1) CATÁLOGO DE SELECCIONES AUTORIZADAS (211 FIFA)
-- ============================================================
create table if not exists public.copero_selecciones (
  codigo char(3) primary key,
  nombre text not null,
  bandera text not null,
  confederacion text not null check (
    confederacion in ('AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC', 'UEFA')
  ),
  fuerza smallint not null check (fuerza between 1 and 100),
  ranking_fifa smallint not null check (ranking_fifa between 1 and 211)
);

alter table public.copero_selecciones enable row level security;
revoke all on table public.copero_selecciones from anon, authenticated;
grant select on table public.copero_selecciones to anon, authenticated;

drop policy if exists copero_selecciones_read on public.copero_selecciones;
create policy copero_selecciones_read on public.copero_selecciones
  for select to anon, authenticated using (true);

-- Semilla (idempotente): se regenera al ejecutar el script.
truncate table public.copero_selecciones;
insert into public.copero_selecciones
  (codigo, nombre, bandera, confederacion, fuerza, ranking_fifa) values
  ('ARG', 'Argentina', '🇦🇷', 'CONMEBOL', 99, 1),
  ('BRA', 'Brasil', '🇧🇷', 'CONMEBOL', 96, 4),
  ('URU', 'Uruguay', '🇺🇾', 'CONMEBOL', 90, 12),
  ('COL', 'Colombia', '🇨🇴', 'CONMEBOL', 89, 13),
  ('ECU', 'Ecuador', '🇪🇨', 'CONMEBOL', 85, 25),
  ('PER', 'Perú', '🇵🇪', 'CONMEBOL', 82, 32),
  ('PAR', 'Paraguay', '🇵🇾', 'CONMEBOL', 81, 34),
  ('CHI', 'Chile', '🇨🇱', 'CONMEBOL', 80, 39),
  ('VEN', 'Venezuela', '🇻🇪', 'CONMEBOL', 76, 52),
  ('BOL', 'Bolivia', '🇧🇴', 'CONMEBOL', 50, 157),
  ('FRA', 'Francia', '🇫🇷', 'UEFA', 98, 2),
  ('ESP', 'España', '🇪🇸', 'UEFA', 97, 3),
  ('ENG', 'Inglaterra', '🇬🇧', 'UEFA', 96, 5),
  ('POR', 'Portugal', '🇵🇹', 'UEFA', 95, 6),
  ('NED', 'Países Bajos', '🇳🇱', 'UEFA', 94, 7),
  ('BEL', 'Bélgica', '🇧🇪', 'UEFA', 92, 9),
  ('ITA', 'Italia', '🇮🇹', 'UEFA', 93, 8),
  ('GER', 'Alemania', '🇩🇪', 'UEFA', 91, 10),
  ('CRO', 'Croacia', '🇭🇷', 'UEFA', 89, 14),
  ('SUI', 'Suiza', '🇨🇭', 'UEFA', 87, 19),
  ('DEN', 'Dinamarca', '🇩🇰', 'UEFA', 86, 20),
  ('AUT', 'Austria', '🇦🇹', 'UEFA', 85, 23),
  ('TUR', 'Turquía', '🇹🇷', 'UEFA', 84, 29),
  ('NOR', 'Noruega', '🇳🇴', 'UEFA', 84, 28),
  ('SWE', 'Suecia', '🇸🇪', 'UEFA', 81, 37),
  ('POL', 'Polonia', '🇵🇱', 'UEFA', 81, 35),
  ('SRB', 'Serbia', '🇷🇸', 'UEFA', 81, 36),
  ('UKR', 'Ucrania', '🇺🇦', 'UEFA', 79, 42),
  ('HUN', 'Hungría', '🇭🇺', 'UEFA', 79, 41),
  ('SCO', 'Escocia', '🇬🇧', 'UEFA', 78, 44),
  ('CZE', 'República Checa', '🇨🇿', 'UEFA', 78, 45),
  ('ROU', 'Rumania', '🇷🇴', 'UEFA', 77, 47),
  ('GRE', 'Grecia', '🇬🇷', 'UEFA', 76, 50),
  ('RUS', 'Rusia', '🇷🇺', 'UEFA', 76, 51),
  ('ISL', 'Islandia', '🇮🇸', 'UEFA', 75, 55),
  ('SVK', 'Eslovaquia', '🇸🇰', 'UEFA', 75, 53),
  ('SVN', 'Eslovenia', '🇸🇮', 'UEFA', 75, 54),
  ('NIR', 'Irlanda del Norte', '🇬🇧', 'UEFA', 74, 60),
  ('WAL', 'Gales', '🇬🇧', 'UEFA', 74, 59),
  ('IRL', 'República de Irlanda', '🇮🇪', 'UEFA', 74, 62),
  ('ALB', 'Albania', '🇦🇱', 'UEFA', 72, 66),
  ('BIH', 'Bosnia y Herzegovina', '🇧🇦', 'UEFA', 72, 67),
  ('GEO', 'Georgia', '🇬🇪', 'UEFA', 72, 69),
  ('ISR', 'Israel', '🇮🇱', 'UEFA', 72, 70),
  ('FIN', 'Finlandia', '🇫🇮', 'UEFA', 70, 74),
  ('MNE', 'Montenegro', '🇲🇪', 'UEFA', 69, 77),
  ('BUL', 'Bulgaria', '🇧🇬', 'UEFA', 68, 79),
  ('KOS', 'Kosovo', '🇽🇰', 'UEFA', 68, 81),
  ('ARM', 'Armenia', '🇦🇲', 'UEFA', 67, 84),
  ('KAZ', 'Kazajistán', '🇰🇿', 'UEFA', 66, 89),
  ('MKD', 'Macedonia del Norte', '🇲🇰', 'UEFA', 65, 93),
  ('CYP', 'Chipre', '🇨🇾', 'UEFA', 63, 101),
  ('LVA', 'Letonia', '🇱🇻', 'UEFA', 62, 108),
  ('EST', 'Estonia', '🇪🇪', 'UEFA', 62, 106),
  ('LTU', 'Lituania', '🇱🇹', 'UEFA', 61, 112),
  ('BLR', 'Bielorrusia', '🇧🇾', 'UEFA', 61, 110),
  ('LUX', 'Luxemburgo', '🇱🇺', 'UEFA', 60, 116),
  ('AZE', 'Azerbaiyán', '🇦🇿', 'UEFA', 59, 123),
  ('MDA', 'Moldavia', '🇲🇩', 'UEFA', 58, 126),
  ('FRO', 'Islas Feroe', '🇫🇴', 'UEFA', 56, 134),
  ('MLT', 'Malta', '🇲🇹', 'UEFA', 56, 135),
  ('AND', 'Andorra', '🇦🇩', 'UEFA', 42, 190),
  ('SMR', 'San Marino', '🇸🇲', 'UEFA', 41, 203),
  ('LIE', 'Liechtenstein', '🇱🇮', 'UEFA', 45, 175),
  ('GIB', 'Gibraltar', '🇬🇮', 'UEFA', 41, 198),
  ('MAR', 'Marruecos', '🇲🇦', 'CAF', 91, 11),
  ('SEN', 'Senegal', '🇸🇳', 'CAF', 88, 16),
  ('NGA', 'Nigeria', '🇳🇬', 'CAF', 85, 26),
  ('EGY', 'Egipto', '🇪🇬', 'CAF', 84, 27),
  ('CIV', 'Costa de Marfil', '🇨🇮', 'CAF', 82, 31),
  ('ALG', 'Argelia', '🇩🇿', 'CAF', 82, 30),
  ('TUN', 'Túnez', '🇹🇳', 'CAF', 81, 38),
  ('GHA', 'Ghana', '🇬🇭', 'CAF', 81, 33),
  ('CMR', 'Camerún', '🇨🇲', 'CAF', 76, 49),
  ('COD', 'R. D. del Congo', '🇨🇩', 'CAF', 75, 56),
  ('MLI', 'Mali', '🇲🇱', 'CAF', 74, 61),
  ('CPV', 'Cabo Verde', '🇨🇻', 'CAF', 73, 63),
  ('BFA', 'Burkina Faso', '🇧🇫', 'CAF', 72, 68),
  ('GUI', 'Guinea', '🇬🇳', 'CAF', 70, 75),
  ('GAB', 'Gabón', '🇬🇦', 'CAF', 68, 80),
  ('EQG', 'Guinea Ecuatorial', '🇬🇶', 'CAF', 66, 87),
  ('ANG', 'Angola', '🇦🇴', 'CAF', 65, 90),
  ('MAD', 'Madagascar', '🇲🇬', 'CAF', 65, 94),
  ('CGO', 'Congo', '🇨🇬', 'CAF', 65, 91),
  ('UGA', 'Uganda', '🇺🇬', 'CAF', 63, 104),
  ('BEN', 'Benín', '🇧🇯', 'CAF', 63, 100),
  ('ZAM', 'Zambia', '🇿🇲', 'CAF', 63, 105),
  ('KEN', 'Kenia', '🇰🇪', 'CAF', 62, 107),
  ('TAN', 'Tanzania', '🇹🇿', 'CAF', 62, 109),
  ('RWA', 'Ruanda', '🇷🇼', 'CAF', 61, 113),
  ('NIG', 'Níger', '🇳🇪', 'CAF', 60, 119),
  ('SUD', 'Sudán', '🇸🇩', 'CAF', 60, 120),
  ('MOZ', 'Mozambique', '🇲🇿', 'CAF', 60, 118),
  ('ZIM', 'Zimbabue', '🇿🇼', 'CAF', 60, 122),
  ('ETH', 'Etiopía', '🇪🇹', 'CAF', 60, 115),
  ('GAM', 'Gambia', '🇬🇲', 'CAF', 58, 125),
  ('COM', 'Comoras', '🇰🇲', 'CAF', 57, 127),
  ('LBR', 'Liberia', '🇱🇷', 'CAF', 57, 129),
  ('NAM', 'Namibia', '🇳🇦', 'CAF', 57, 131),
  ('TOG', 'Togo', '🇹🇬', 'CAF', 57, 132),
  ('MTN', 'Mauritania', '🇲🇷', 'CAF', 56, 136),
  ('GNB', 'Guinea-Bisáu', '🇬🇼', 'CAF', 56, 133),
  ('BOT', 'Botsuana', '🇧🇼', 'CAF', 55, 140),
  ('SWZ', 'Esuatini', '🇸🇿', 'CAF', 53, 146),
  ('LBY', 'Libia', '🇱🇾', 'CAF', 52, 153),
  ('MWI', 'Malaui', '🇲🇼', 'CAF', 54, 145),
  ('SLE', 'Sierra Leona', '🇸🇱', 'CAF', 53, 148),
  ('RSA', 'Sudáfrica', '🇿🇦', 'CAF', 51, 155),
  ('LES', 'Lesoto', '🇱🇸', 'CAF', 50, 160),
  ('BDI', 'Burundi', '🇧🇮', 'CAF', 50, 158),
  ('CTA', 'República Centroafricana', '🇨🇫', 'CAF', 48, 166),
  ('CHA', 'Chad', '🇹🇩', 'CAF', 48, 164),
  ('SOM', 'Somalia', '🇸🇴', 'CAF', 46, 174),
  ('MRI', 'Mauricio', '🇲🇺', 'CAF', 46, 173),
  ('SEY', 'Seychelles', '🇸🇨', 'CAF', 43, 188),
  ('ERI', 'Eritrea', '🇪🇷', 'CAF', 43, 186),
  ('SSD', 'Sudán del Sur', '🇸🇸', 'CAF', 42, 195),
  ('DJI', 'Yibuti', '🇩🇯', 'CAF', 41, 205),
  ('STP', 'Santo Tomé y Príncipe', '🇸🇹', 'CAF', 41, 204),
  ('JPN', 'Japón', '🇯🇵', 'AFC', 87, 17),
  ('IRN', 'Irán', '🇮🇷', 'AFC', 86, 21),
  ('KOR', 'Corea del Sur', '🇰🇷', 'AFC', 85, 24),
  ('AUS', 'Australia', '🇦🇺', 'AFC', 85, 22),
  ('QAT', 'Catar', '🇶🇦', 'AFC', 79, 40),
  ('KSA', 'Arabia Saudita', '🇸🇦', 'AFC', 78, 43),
  ('UZB', 'Uzbekistán', '🇺🇿', 'AFC', 77, 48),
  ('IRQ', 'Irak', '🇮🇶', 'AFC', 73, 64),
  ('UAE', 'Emiratos Árabes Unidos', '🇦🇪', 'AFC', 74, 58),
  ('JOR', 'Jordania', '🇯🇴', 'AFC', 71, 72),
  ('OMA', 'Omán', '🇴🇲', 'AFC', 70, 76),
  ('CHN', 'China', '🇨🇳', 'AFC', 70, 73),
  ('BHR', 'Baréin', '🇧🇭', 'AFC', 68, 78),
  ('SYR', 'Siria', '🇸🇾', 'AFC', 68, 82),
  ('THA', 'Tailandia', '🇹🇭', 'AFC', 68, 83),
  ('LBN', 'Líbano', '🇱🇧', 'AFC', 67, 86),
  ('TJN', 'Tayikistán', '🇹🇯', 'AFC', 65, 95),
  ('VIE', 'Vietnam', '🇻🇳', 'AFC', 64, 99),
  ('IND', 'India', '🇮🇳', 'AFC', 64, 98),
  ('PSE', 'Palestina', '🇵🇸', 'AFC', 63, 103),
  ('KGZ', 'Kirguistán', '🇰🇬', 'AFC', 61, 111),
  ('MAS', 'Malasia', '🇲🇾', 'AFC', 60, 117),
  ('PHI', 'Filipinas', '🇵🇭', 'AFC', 59, 124),
  ('MYA', 'Myanmar', '🇲🇲', 'AFC', 57, 130),
  ('IDN', 'Indonesia', '🇮🇩', 'AFC', 57, 128),
  ('SIN', 'Singapur', '🇸🇬', 'AFC', 56, 137),
  ('TKM', 'Turkmenistán', '🇹🇲', 'AFC', 56, 139),
  ('HKG', 'Hong Kong', '🇭🇰', 'AFC', 55, 141),
  ('AFG', 'Afganistán', '🇦🇫', 'AFC', 54, 144),
  ('PAK', 'Pakistán', '🇵🇰', 'AFC', 53, 147),
  ('PRK', 'Corea del Norte', '🇰🇵', 'AFC', 52, 150),
  ('TPE', 'China Taipéi', '🇹🇼', 'AFC', 52, 149),
  ('BAN', 'Bangladés', '🇧🇩', 'AFC', 50, 156),
  ('SRI', 'Sri Lanka', '🇱🇰', 'AFC', 49, 163),
  ('NEP', 'Nepal', '🇳🇵', 'AFC', 48, 165),
  ('YEM', 'Yemen', '🇾🇪', 'AFC', 48, 167),
  ('LAO', 'Laos', '🇱🇦', 'AFC', 47, 170),
  ('CAM', 'Camboya', '🇰🇭', 'AFC', 47, 169),
  ('MDV', 'Maldivas', '🇲🇻', 'AFC', 44, 181),
  ('MNG', 'Mongolia', '🇲🇳', 'AFC', 44, 182),
  ('BRU', 'Brunéi', '🇧🇳', 'AFC', 42, 192),
  ('GUM', 'Guam', '🇬🇺', 'AFC', 41, 199),
  ('BHU', 'Bután', '🇧🇹', 'AFC', 41, 196),
  ('TLS', 'Timor Oriental', '🇹🇱', 'AFC', 40, 210),
  ('MAC', 'Macao', '🇲🇴', 'AFC', 40, 207),
  ('KUW', 'Kuwait', '🇰🇼', 'AFC', 65, 92),
  ('USA', 'Estados Unidos', '🇺🇸', 'CONCACAF', 88, 15),
  ('MEX', 'México', '🇲🇽', 'CONCACAF', 87, 18),
  ('CAN', 'Canadá', '🇨🇦', 'CONCACAF', 77, 46),
  ('CRC', 'Costa Rica', '🇨🇷', 'CONCACAF', 74, 57),
  ('PAN', 'Panamá', '🇵🇦', 'CONCACAF', 72, 71),
  ('JAM', 'Jamaica', '🇯🇲', 'CONCACAF', 67, 85),
  ('HON', 'Honduras', '🇭🇳', 'CONCACAF', 66, 88),
  ('HTI', 'Haití', '🇭🇹', 'CONCACAF', 64, 97),
  ('GUA', 'Guatemala', '🇬🇹', 'CONCACAF', 64, 96),
  ('NCA', 'Nicaragua', '🇳🇮', 'CONCACAF', 45, 176),
  ('SLV', 'El Salvador', '🇸🇻', 'CONCACAF', 63, 102),
  ('CUR', 'Curazao', '🇨🇼', 'CONCACAF', 60, 114),
  ('TRI', 'Trinidad y Tobago', '🇹🇹', 'CONCACAF', 60, 121),
  ('SUR', 'Surinam', '🇸🇷', 'CONCACAF', 55, 143),
  ('DOM', 'República Dominicana', '🇩🇴', 'CONCACAF', 55, 142),
  ('CUB', 'Cuba', '🇨🇺', 'CONCACAF', 52, 151),
  ('GUY', 'Guyana', '🇬🇾', 'CONCACAF', 50, 159),
  ('BER', 'Bermudas', '🇧🇲', 'CONCACAF', 47, 168),
  ('BLZ', 'Belice', '🇧🇿', 'CONCACAF', 46, 172),
  ('PUR', 'Puerto Rico', '🇵🇷', 'CONCACAF', 45, 177),
  ('BRB', 'Barbados', '🇧🇧', 'CONCACAF', 44, 179),
  ('LCA', 'Santa Lucía', '🇱🇨', 'CONCACAF', 44, 183),
  ('GRN', 'Granada', '🇬🇩', 'CONCACAF', 44, 180),
  ('ATG', 'Antigua y Barbuda', '🇦🇬', 'CONCACAF', 43, 184),
  ('VIN', 'San Vicente y las Granadinas', '🇻🇨', 'CONCACAF', 43, 187),
  ('BAH', 'Bahamas', '🇧🇸', 'CONCACAF', 43, 185),
  ('SKN', 'San Cristóbal y Nieves', '🇰🇳', 'CONCACAF', 42, 194),
  ('ARU', 'Aruba', '🇦🇼', 'CONCACAF', 42, 191),
  ('DMA', 'Dominica', '🇩🇲', 'CONCACAF', 41, 197),
  ('TCA', 'Islas Turcas y Caicos', '🇹🇨', 'CONCACAF', 41, 200),
  ('VIR', 'Islas Vírgenes de los EE. UU.', '🇻🇮', 'CONCACAF', 41, 202),
  ('VGB', 'Islas Vírgenes Británicas', '🇻🇬', 'CONCACAF', 41, 201),
  ('CAY', 'Islas Caimán', '🇰🇾', 'CONCACAF', 40, 206),
  ('MSR', 'Montserrat', '🇲🇸', 'CONCACAF', 40, 208),
  ('AIA', 'Anguila', '🇦🇮', 'CONCACAF', 39, 211),
  ('NZL', 'Nueva Zelanda', '🇳🇿', 'OFC', 73, 65),
  ('TAH', 'Tahití', '🇵🇫', 'OFC', 56, 138),
  ('FIJ', 'Fiyi', '🇫🇯', 'OFC', 52, 152),
  ('PNG', 'Papúa Nueva Guinea', '🇵🇬', 'OFC', 51, 154),
  ('NCL', 'Nueva Caledonia', '🇳🇨', 'OFC', 50, 161),
  ('SOL', 'Islas Salomón', '🇸🇧', 'OFC', 49, 162),
  ('VAN', 'Vanuatu', '🇻🇺', 'OFC', 47, 171),
  ('SAM', 'Samoa', '🇼🇸', 'OFC', 45, 178),
  ('TGA', 'Tonga', '🇹🇴', 'OFC', 43, 189),
  ('COK', 'Islas Cook', '🇨🇰', 'OFC', 42, 193),
  ('ASA', 'Samoa Americana', '🇦🇸', 'OFC', 40, 209);

-- ============================================================
-- 2) COLUMNA SELECCION EN EL RANKING
-- ============================================================
alter table public.copero_ranking add column if not exists seleccion text;

alter table public.copero_ranking_auditoria add column if not exists seleccion text;

-- ============================================================
-- 3) RPC DE PUBLICACIÓN CON SELECCIÓN (SECURITY DEFINER)
--    Reemplaza al de 005 agregándole p_seleccion (opcional).
-- ============================================================
drop function if exists public.copero_publicar_ranking(text, text, text, integer, integer, text, text, text, integer);

create or replace function public.copero_publicar_ranking(
  p_display_name text,
  p_posicion text,
  p_club text,
  p_media integer,
  p_titulos integer,
  p_evento text,
  p_nonce text,
  p_durante text default 'M',
  p_a_longitud integer default 0,
  p_seleccion text default null
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
  v_seleccion text;
  v_prev_nonce text;
begin
  -- Sesión obligatoria: nunca se confía en un user_id del payload.
  if v_uid is null then
    raise exception 'Se requiere sesión para publicar en el ranking' using errcode = '42501';
  end if;

  -- Anti-replay: el cliente manda el nonce de su cola (_id del registro).
  if p_nonce is null or btrim(p_nonce) = '' or char_length(btrim(p_nonce)) > 64 then
    raise exception 'nonce inválido' using errcode = '22023';
  end if;

  -- Solo se acepta el evento 'carrera' (hoy es el único emisor legítimo).
  if p_evento is null or btrim(lower(p_evento)) <> 'carrera' then
    raise exception 'evento no permitido' using errcode = '22023';
  end if;

  -- Anti-flood: tope de publicaciones NUEVAS por hora y cuenta.
  if (select count(*) from public.copero_ranking_auditoria
       where user_id = v_uid and not idempotente and ts > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limit' using errcode = 'P0001';
  end if;

  select carrera_nonce into v_prev_nonce
    from public.copero_ranking where user_id = v_uid;
  if v_prev_nonce is not null and v_prev_nonce = p_nonce then
    -- Mismo registro ya aplicado (retry de la cola o replay del mismo envío).
    insert into public.copero_ranking_auditoria
      (user_id, display_name, posicion, club, media, titulos, nonce, idempotente, seleccion)
    values (v_uid, left(coalesce(p_display_name, ''), 30), left(coalesce(p_posicion, ''), 5),
            left(coalesce(p_club, ''), 40), greatest(0, least(99, coalesce(p_media, 0))),
            greatest(0, least(1000, coalesce(p_titulos, 0))), btrim(p_nonce), true,
            left(coalesce(upper(btrim(p_seleccion)), ''), 3));
    return jsonb_build_object('ok', true, 'idempotente', true, 'user_id', v_uid);
  end if;

  v_anio := extract(year from now())::int;
  v_media := greatest(0, least(99, coalesce(p_media, 0)));
  v_titulos := greatest(0, least(1000, coalesce(p_titulos, 0)));

  -- Nombre: autoridad = perfil de la cuenta. Respaldo solo si el payload
  -- trae un apodo válido.
  select display_name into v_nombre from public.copero_profiles where user_id = v_uid;
  if v_nombre is null or char_length(btrim(v_nombre)) < 2 then
    v_nombre := btrim(coalesce(p_display_name, ''));
    if char_length(v_nombre) < 2 then v_nombre := 'Jugador'; end if;
    v_nombre := left(v_nombre, 30);
  end if;

  -- Posición: whitelist estricta; cualquier otra se neutraliza a ''.
  v_posicion := upper(btrim(coalesce(p_posicion, '')));
  if v_posicion not in ('DEL', 'CM', 'DEF', 'GK') then v_posicion := ''; end if;

  -- Club: solo nombres del catálogo; club inexistente => ''.
  v_club := btrim(coalesce(p_club, ''));
  if v_club <> '' then
    if not exists (select 1 from public.copero_clubes where nombre = v_club) then
      v_club := '';
    end if;
  end if;

  -- Selección: solo códigos del catálogo FIFA; código inexistente => ''.
  -- (El parámetro es opcional: clientes viejos que no la envían => null => '').
  v_seleccion := upper(btrim(coalesce(p_seleccion, '')));
  if v_seleccion <> '' then
    if not exists (select 1 from public.copero_selecciones where codigo = v_seleccion) then
      v_seleccion := '';
    end if;
  end if;

  -- UPSERT de la fila propia (una entrada por cuenta).
  insert into public.copero_ranking
    (user_id, display_name, posicion, club, media, titulos, anio, ts, updated_at, carrera_nonce, evento, seleccion)
  values
    (v_uid, v_nombre, v_posicion, v_club, v_media, v_titulos, v_anio, now(), now(), btrim(p_nonce), 'carrera', v_seleccion)
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
    evento        = excluded.evento,
    seleccion     = excluded.seleccion;

  -- Auditoría de la publicación efectiva (moderación y anti-flood).
  insert into public.copero_ranking_auditoria
    (user_id, display_name, posicion, club, media, titulos, nonce, idempotente, seleccion)
  values (v_uid, v_nombre, v_posicion, v_club, v_media, v_titulos, btrim(p_nonce), false, v_seleccion);

  return jsonb_build_object('ok', true, 'user_id', v_uid);
end;
$$;

-- Solo cuentas autenticadas pueden invocar el RPC. anon jamás.
revoke all on function public.copero_publicar_ranking(text, text, text, integer, integer, text, text, text, integer, text) from anon, authenticated;
grant execute on function public.copero_publicar_ranking(text, text, text, integer, integer, text, text, text, integer, text) to authenticated;

commit;