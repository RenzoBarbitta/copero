const CLUBES = [
    { nombre: "Agropecuario", reputacion: 7, imagen: "imagenes/agropecuario.png" },
    { nombre: "Alessandria", reputacion: 7, imagen: "imagenes/alessandria.png" },
    { nombre: "Alumni", reputacion: 2, imagen: "imagenes/alumni.png" },
    { nombre: "Aerolíneas Splinter", reputacion: 5, imagen: "imagenes/areolineasplinter.png" },
    { nombre: "Asesinos del Futbol", reputacion: 6, imagen: "imagenes/asesinosdelfutbol.png" },
    { nombre: "Arsenal", reputacion: 5, imagen: "imagenes/arsenal.png" },
    { nombre: "Argentinos Juniors", reputacion: 4, imagen: "imagenes/argentinosjrs.png" },
    { nombre: "B15", reputacion: 6, imagen: "imagenes/b15.png" },
    { nombre: "Botellita", reputacion: 2, imagen: "imagenes/botellita.png" },
    { nombre: "Chaco For Ever", reputacion: 6, imagen: "imagenes/chacoforever.png" },
    { nombre: "Chapa", reputacion: 6, imagen: "imagenes/chapa.png" },
    { nombre: "Chapita", reputacion: 2, imagen: "imagenes/chapita.png" },
    { nombre: "Chappineta", reputacion: 5, imagen: "imagenes/chappineta.png" },
    { nombre: "Colchester United", reputacion: 6, imagen: "imagenes/colchesterunited.png" },
    { nombre: "Cuiaba", reputacion: 10, imagen: "imagenes/cuiaba.png" },
    { nombre: "Davoneta", reputacion: 4, imagen: "imagenes/davoneta.png" },
    { nombre: "Dope", reputacion: 6, imagen: "imagenes/dope.png" },
    { nombre: "Dream Seven", reputacion: 7, imagen: "imagenes/dreamseven.png" },
    { nombre: "El Porvenir", reputacion: 4, imagen: "imagenes/elporvenir.png" },
    { nombre: "Impalare", reputacion: 10, imagen: "imagenes/impalare.png" },
    { nombre: "Imperial", reputacion: 8, imagen: "imagenes/imperial.png" },
    { nombre: "Imperial Academy", reputacion: 3, imagen: "imagenes/imperialacademy.png" },
    { nombre: "Las Varillas", reputacion: 3, imagen: "imagenes/lasvarillas.png" },
    { nombre: "Lechonidas", reputacion: 10, imagen: "imagenes/lechonidas.png" },
    { nombre: "Lions", reputacion: 8, imagen: "imagenes/lions.png" },
    { nombre: "Los Andes", reputacion: 8, imagen: "imagenes/losandes.png" },
    { nombre: "Los Mancos Weones", reputacion: 3, imagen: "imagenes/losmancosweones.png" },
    { nombre: "Los Toros", reputacion: 10, imagen: "imagenes/lostoros.png" },
    { nombre: "Lowers", reputacion: 8, imagen: "imagenes/lowers.png" },
    { nombre: "Mastur", reputacion: 6, imagen: "imagenes/mastur.png" },
    { nombre: "Milangalock", reputacion: 4, imagen: "imagenes/milangalock.png" },
    { nombre: "Nacional", reputacion: 10, imagen: "imagenes/nacional.png" },
    { nombre: "Nadroga", reputacion: 6, imagen: "imagenes/nadroga.png" },
    { nombre: "Olimpo", reputacion: 4, imagen: "imagenes/olimpo.png" },
    { nombre: "Parma", reputacion: 4, imagen: "imagenes/parma.png" },
    { nombre: "Pastel de Papa", reputacion: 4, imagen: "imagenes/pasteldepapa.png" },
    { nombre: "Patos Feos", reputacion: 2, imagen: "imagenes/patosfeos.png" },
    { nombre: "Peñarol", reputacion: 7, imagen: "imagenes/penarol.png" },
    { nombre: "Prodigy", reputacion: 4, imagen: "imagenes/prodigy.png" },
    { nombre: "River Plate", reputacion: 8, imagen: "imagenes/riverplate.png" },
    { nombre: "Riverpool", reputacion: 6, imagen: "imagenes/riverpool.png" },
    { nombre: "Roma", reputacion: 8, imagen: "imagenes/roma.png" },
    { nombre: "San Lorenzo", reputacion: 8, imagen: "imagenes/sanlorenzo.png" },
    { nombre: "Sexito", reputacion: 5, imagen: "imagenes/sexito.png" },
    { nombre: "Shark", reputacion: 6, imagen: "imagenes/shark.png" },
    { nombre: "Sol de Mayo", reputacion: 8, imagen: "imagenes/soldemayo.png" },
    { nombre: "Yorkshine", reputacion: 6, imagen: "imagenes/yorkshine.png" },
    { nombre: "Hasbullitah", reputacion: 2, imagen: "imagenes/hasbulitah.png" },
    { nombre: "Bodo Glimt", reputacion: 6, imagen: "imagenes/bodoglimt.png" },
    { nombre: "Atlanta", reputacion: 4, imagen: "imagenes/atlanta.png" },
    { nombre: "Napoli", reputacion: 6, imagen: "imagenes/napoli.png" },
    { nombre: "Villa Dalmine", reputacion: 2, imagen: "imagenes/villadalmine.png" },
    { nombre: "El Bondi", reputacion: 4, imagen: "imagenes/elbondi.png" },
    { nombre: "Bochum", reputacion: 4, imagen: "imagenes/bochum.png" },
    { nombre: "Barracas Central", reputacion: 9, imagen: "imagenes/barracascentral.png" },
    { nombre: "Orlando City", reputacion: 10, imagen: "imagenes/orlandocity.png" },
    { nombre: "Ta falido", reputacion: 10, imagen: "imagenes/tafalido.png" },
    { nombre: "Santos", reputacion: 7, imagen: "imagenes/santos.png" },
    { nombre: "Chapeconense", reputacion: 10, imagen: "imagenes/chapecoense.png" },
    { nombre: "Nitegy", reputacion: 7, imagen: "imagenes/nitegy.png" },
    { nombre: "Night Ravens", reputacion: 8, imagen: "imagenes/nightravens.png" },
    { nombre: "Laferrere", reputacion: 1, imagen: "imagenes/laferrere.png" },
    { nombre: "POD", reputacion: 10, imagen: "imagenes/podfc.png" },
    { nombre: "Xheaston", reputacion: 5, imagen: "imagenes/xheaston.png" },
    { nombre: "Sportivo Italiano", reputacion: 4, imagen: "imagenes/sportivoitaliano.png" },
    { nombre: "Fenix", reputacion: 7, imagen: "imagenes/fenix.png" },
    { nombre: "Plaza Colonia", reputacion: 9, imagen: "imagenes/plazacolonia.png"},
    { nombre: "Montevideo City Torque", reputacion: 7, imagen: "imagenes/montevideocitytorque.png"},
    { nombre: "Wanderers", reputacion: 6, imagen: "imagenes/wanderers.png"},
    { nombre: "Cerro", reputacion: 5, imagen: "imagenes/cerrolargo.png"},
    { nombre: "Danubio", reputacion: 6, imagen: "imagenes/danubio.png"}
];

// ============================================================
//  SELECCIONES NACIONALES - expansión internacional
//  211 asociaciones miembro de FIFA, 6 confederaciones.
//  Formato de cada fila:
//    [codigoFIFA3, nombre, bandera(emoji), confederacion, fuerza(1-100), rankingFifa]
//  La fuerza es una aproximación del nivel de la selección (para
//  simulación internacional). El ranking FIFA se calculó ordenando
//  globalmente por fuerza (coherente, no oficial al día).
// ============================================================
const CONFEDERACIONES = {
  AFC:      { emoji: "🌏" },
  CAF:      { emoji: "🌍" },
  CONCACAF: { emoji: "🌎" },
  CONMEBOL: { emoji: "🌎" },
  OFC:      { emoji: "🌊" },
  UEFA:     { emoji: "🌍" }
};

// 6 confederaciones en orden visual habitual (de izquierda a derecha).
const CONFEDERACIONES_ORDEN = ["CONMEBOL", "UEFA", "CAF", "AFC", "CONCACAF", "OFC"];

// Iconos de bandera reales (flag-icons, SVGs en vendor/flags/): clave por
// código FIFA. Las 4 naciones del Reino Unido usan claves propias
// (gb-eng/sct/wls/nir); Kosovo usa la clave no oficial "xk".
const BANDERA_ICONO = {
  ARG: "ar", BRA: "br", URU: "uy", COL: "co", ECU: "ec", PER: "pe",
  PAR: "py", CHI: "cl", VEN: "ve", BOL: "bo", FRA: "fr", ESP: "es",
  ENG: "gb-eng", POR: "pt", NED: "nl", BEL: "be", ITA: "it", GER: "de",
  CRO: "hr", SUI: "ch", DEN: "dk", AUT: "at", TUR: "tr", NOR: "no",
  SWE: "se", POL: "pl", SRB: "rs", UKR: "ua", HUN: "hu", SCO: "gb-sct",
  CZE: "cz", ROU: "ro", GRE: "gr", RUS: "ru", ISL: "is", SVK: "sk",
  SVN: "si", NIR: "gb-nir", WAL: "gb-wls", IRL: "ie", ALB: "al", BIH: "ba",
  GEO: "ge", ISR: "il", FIN: "fi", MNE: "me", BUL: "bg", KOS: "xk",
  ARM: "am", KAZ: "kz", MKD: "mk", CYP: "cy", LVA: "lv", EST: "ee",
  LTU: "lt", BLR: "by", LUX: "lu", AZE: "az", MDA: "md", FRO: "fo",
  MLT: "mt", AND: "ad", SMR: "sm", LIE: "li", GIB: "gi", MAR: "ma",
  SEN: "sn", NGA: "ng", EGY: "eg", CIV: "ci", ALG: "dz", TUN: "tn",
  GHA: "gh", CMR: "cm", COD: "cd", MLI: "ml", CPV: "cv", BFA: "bf",
  GUI: "gn", GAB: "ga", EQG: "gq", ANG: "ao", MAD: "mg", CGO: "cg",
  UGA: "ug", BEN: "bj", ZAM: "zm", KEN: "ke", TAN: "tz", RWA: "rw",
  NIG: "ne", SUD: "sd", MOZ: "mz", ZIM: "zw", ETH: "et", GAM: "gm",
  COM: "km", LBR: "lr", NAM: "na", TOG: "tg", MTN: "mr", GNB: "gw",
  BOT: "bw", SWZ: "sz", LBY: "ly", MWI: "mw", SLE: "sl", RSA: "za",
  LES: "ls", BDI: "bi", CTA: "cf", CHA: "td", SOM: "so", MRI: "mu",
  SEY: "sc", ERI: "er", SSD: "ss", DJI: "dj", STP: "st", JPN: "jp",
  IRN: "ir", KOR: "kr", AUS: "au", QAT: "qa", KSA: "sa", UZB: "uz",
  IRQ: "iq", UAE: "ae", JOR: "jo", OMA: "om", CHN: "cn", BHR: "bh",
  SYR: "sy", THA: "th", LBN: "lb", TJN: "tj", VIE: "vn", IND: "in",
  PSE: "ps", KGZ: "kg", MAS: "my", PHI: "ph", MYA: "mm", IDN: "id",
  SIN: "sg", TKM: "tm", HKG: "hk", AFG: "af", PAK: "pk", PRK: "kp",
  TPE: "tw", BAN: "bd", SRI: "lk", NEP: "np", YEM: "ye", LAO: "la",
  CAM: "kh", MDV: "mv", MNG: "mn", BRU: "bn", GUM: "gu", BHU: "bt",
  TLS: "tl", MAC: "mo", KUW: "kw", USA: "us", MEX: "mx", CAN: "ca",
  CRC: "cr", PAN: "pa", JAM: "jm", HON: "hn", HTI: "ht", GUA: "gt",
  NCA: "ni", SLV: "sv", CUR: "cw", TRI: "tt", SUR: "sr", DOM: "do",
  CUB: "cu", GUY: "gy", BER: "bm", BLZ: "bz", PUR: "pr", BRB: "bb",
  LCA: "lc", GRN: "gd", ATG: "ag", VIN: "vc", BAH: "bs", SKN: "kn",
  ARU: "aw", DMA: "dm", TCA: "tc", VIR: "vi", VGB: "vg", CAY: "ky",
  MSR: "ms", AIA: "ai", NZL: "nz", TAH: "pf", FIJ: "fj", PNG: "pg",
  NCL: "nc", SOL: "sb", VAN: "vu", SAM: "ws", TGA: "to", COK: "ck",
  ASA: "as"
};

// Ruta al SVG de la bandera (flag-icons) o "" si no existe.
function rutaBandera(codigo) {
  const clave = BANDERA_ICONO[codigo];
  return clave ? "vendor/flags/" + clave + ".svg" : "";
}

// HTML <img> de la bandera (título = nombre de la selección del catálogo).
function banderaImg(codigo, clase) {
  const ruta = rutaBandera(codigo);
  if (!ruta) return "";
  const s = seleccionPorCodigo(codigo);
  return "<img src=\"" + ruta + "\" alt=\"" + (s ? s.codigo : codigo) + "\"" +
    (s ? " title=\"" + s.nombre + "\"" : "") +
    (clase ? " class=\"" + clase + "\"" : "") + " loading=\"lazy\" decoding=\"async\">";
}

const SELECCIONES = [
  ['ARG', 'Argentina', '🇦🇷', 'CONMEBOL', 99, 1],
  ['BRA', 'Brasil', '🇧🇷', 'CONMEBOL', 96, 4],
  ['URU', 'Uruguay', '🇺🇾', 'CONMEBOL', 90, 12],
  ['COL', 'Colombia', '🇨🇴', 'CONMEBOL', 89, 13],
  ['ECU', 'Ecuador', '🇪🇨', 'CONMEBOL', 85, 25],
  ['PER', 'Perú', '🇵🇪', 'CONMEBOL', 82, 32],
  ['PAR', 'Paraguay', '🇵🇾', 'CONMEBOL', 81, 34],
  ['CHI', 'Chile', '🇨🇱', 'CONMEBOL', 80, 39],
  ['VEN', 'Venezuela', '🇻🇪', 'CONMEBOL', 76, 52],
  ['BOL', 'Bolivia', '🇧🇴', 'CONMEBOL', 50, 157],
  ['FRA', 'Francia', '🇫🇷', 'UEFA', 98, 2],
  ['ESP', 'España', '🇪🇸', 'UEFA', 97, 3],
  ['ENG', 'Inglaterra', '🇬🇧', 'UEFA', 96, 5],
  ['POR', 'Portugal', '🇵🇹', 'UEFA', 95, 6],
  ['NED', 'Países Bajos', '🇳🇱', 'UEFA', 94, 7],
  ['BEL', 'Bélgica', '🇧🇪', 'UEFA', 92, 9],
  ['ITA', 'Italia', '🇮🇹', 'UEFA', 93, 8],
  ['GER', 'Alemania', '🇩🇪', 'UEFA', 91, 10],
  ['CRO', 'Croacia', '🇭🇷', 'UEFA', 89, 14],
  ['SUI', 'Suiza', '🇨🇭', 'UEFA', 87, 19],
  ['DEN', 'Dinamarca', '🇩🇰', 'UEFA', 86, 20],
  ['AUT', 'Austria', '🇦🇹', 'UEFA', 85, 23],
  ['TUR', 'Turquía', '🇹🇷', 'UEFA', 84, 29],
  ['NOR', 'Noruega', '🇳🇴', 'UEFA', 84, 28],
  ['SWE', 'Suecia', '🇸🇪', 'UEFA', 81, 37],
  ['POL', 'Polonia', '🇵🇱', 'UEFA', 81, 35],
  ['SRB', 'Serbia', '🇷🇸', 'UEFA', 81, 36],
  ['UKR', 'Ucrania', '🇺🇦', 'UEFA', 79, 42],
  ['HUN', 'Hungría', '🇭🇺', 'UEFA', 79, 41],
  ['SCO', 'Escocia', '🇬🇧', 'UEFA', 78, 44],
  ['CZE', 'República Checa', '🇨🇿', 'UEFA', 78, 45],
  ['ROU', 'Rumania', '🇷🇴', 'UEFA', 77, 47],
  ['GRE', 'Grecia', '🇬🇷', 'UEFA', 76, 50],
  ['RUS', 'Rusia', '🇷🇺', 'UEFA', 76, 51],
  ['ISL', 'Islandia', '🇮🇸', 'UEFA', 75, 55],
  ['SVK', 'Eslovaquia', '🇸🇰', 'UEFA', 75, 53],
  ['SVN', 'Eslovenia', '🇸🇮', 'UEFA', 75, 54],
  ['NIR', 'Irlanda del Norte', '🇬🇧', 'UEFA', 74, 60],
  ['WAL', 'Gales', '🇬🇧', 'UEFA', 74, 59],
  ['IRL', 'República de Irlanda', '🇮🇪', 'UEFA', 74, 62],
  ['ALB', 'Albania', '🇦🇱', 'UEFA', 72, 66],
  ['BIH', 'Bosnia y Herzegovina', '🇧🇦', 'UEFA', 72, 67],
  ['GEO', 'Georgia', '🇬🇪', 'UEFA', 72, 69],
  ['ISR', 'Israel', '🇮🇱', 'UEFA', 72, 70],
  ['FIN', 'Finlandia', '🇫🇮', 'UEFA', 70, 74],
  ['MNE', 'Montenegro', '🇲🇪', 'UEFA', 69, 77],
  ['BUL', 'Bulgaria', '🇧🇬', 'UEFA', 68, 79],
  ['KOS', 'Kosovo', '🇽🇰', 'UEFA', 68, 81],
  ['ARM', 'Armenia', '🇦🇲', 'UEFA', 67, 84],
  ['KAZ', 'Kazajistán', '🇰🇿', 'UEFA', 66, 89],
  ['MKD', 'Macedonia del Norte', '🇲🇰', 'UEFA', 65, 93],
  ['CYP', 'Chipre', '🇨🇾', 'UEFA', 63, 101],
  ['LVA', 'Letonia', '🇱🇻', 'UEFA', 62, 108],
  ['EST', 'Estonia', '🇪🇪', 'UEFA', 62, 106],
  ['LTU', 'Lituania', '🇱🇹', 'UEFA', 61, 112],
  ['BLR', 'Bielorrusia', '🇧🇾', 'UEFA', 61, 110],
  ['LUX', 'Luxemburgo', '🇱🇺', 'UEFA', 60, 116],
  ['AZE', 'Azerbaiyán', '🇦🇿', 'UEFA', 59, 123],
  ['MDA', 'Moldavia', '🇲🇩', 'UEFA', 58, 126],
  ['FRO', 'Islas Feroe', '🇫🇴', 'UEFA', 56, 134],
  ['MLT', 'Malta', '🇲🇹', 'UEFA', 56, 135],
  ['AND', 'Andorra', '🇦🇩', 'UEFA', 42, 190],
  ['SMR', 'San Marino', '🇸🇲', 'UEFA', 41, 203],
  ['LIE', 'Liechtenstein', '🇱🇮', 'UEFA', 45, 175],
  ['GIB', 'Gibraltar', '🇬🇮', 'UEFA', 41, 198],
  ['MAR', 'Marruecos', '🇲🇦', 'CAF', 91, 11],
  ['SEN', 'Senegal', '🇸🇳', 'CAF', 88, 16],
  ['NGA', 'Nigeria', '🇳🇬', 'CAF', 85, 26],
  ['EGY', 'Egipto', '🇪🇬', 'CAF', 84, 27],
  ['CIV', 'Costa de Marfil', '🇨🇮', 'CAF', 82, 31],
  ['ALG', 'Argelia', '🇩🇿', 'CAF', 82, 30],
  ['TUN', 'Túnez', '🇹🇳', 'CAF', 81, 38],
  ['GHA', 'Ghana', '🇬🇭', 'CAF', 81, 33],
  ['CMR', 'Camerún', '🇨🇲', 'CAF', 76, 49],
  ['COD', 'R. D. del Congo', '🇨🇩', 'CAF', 75, 56],
  ['MLI', 'Mali', '🇲🇱', 'CAF', 74, 61],
  ['CPV', 'Cabo Verde', '🇨🇻', 'CAF', 73, 63],
  ['BFA', 'Burkina Faso', '🇧🇫', 'CAF', 72, 68],
  ['GUI', 'Guinea', '🇬🇳', 'CAF', 70, 75],
  ['GAB', 'Gabón', '🇬🇦', 'CAF', 68, 80],
  ['EQG', 'Guinea Ecuatorial', '🇬🇶', 'CAF', 66, 87],
  ['ANG', 'Angola', '🇦🇴', 'CAF', 65, 90],
  ['MAD', 'Madagascar', '🇲🇬', 'CAF', 65, 94],
  ['CGO', 'Congo', '🇨🇬', 'CAF', 65, 91],
  ['UGA', 'Uganda', '🇺🇬', 'CAF', 63, 104],
  ['BEN', 'Benín', '🇧🇯', 'CAF', 63, 100],
  ['ZAM', 'Zambia', '🇿🇲', 'CAF', 63, 105],
  ['KEN', 'Kenia', '🇰🇪', 'CAF', 62, 107],
  ['TAN', 'Tanzania', '🇹🇿', 'CAF', 62, 109],
  ['RWA', 'Ruanda', '🇷🇼', 'CAF', 61, 113],
  ['NIG', 'Níger', '🇳🇪', 'CAF', 60, 119],
  ['SUD', 'Sudán', '🇸🇩', 'CAF', 60, 120],
  ['MOZ', 'Mozambique', '🇲🇿', 'CAF', 60, 118],
  ['ZIM', 'Zimbabue', '🇿🇼', 'CAF', 60, 122],
  ['ETH', 'Etiopía', '🇪🇹', 'CAF', 60, 115],
  ['GAM', 'Gambia', '🇬🇲', 'CAF', 58, 125],
  ['COM', 'Comoras', '🇰🇲', 'CAF', 57, 127],
  ['LBR', 'Liberia', '🇱🇷', 'CAF', 57, 129],
  ['NAM', 'Namibia', '🇳🇦', 'CAF', 57, 131],
  ['TOG', 'Togo', '🇹🇬', 'CAF', 57, 132],
  ['MTN', 'Mauritania', '🇲🇷', 'CAF', 56, 136],
  ['GNB', 'Guinea-Bisáu', '🇬🇼', 'CAF', 56, 133],
  ['BOT', 'Botsuana', '🇧🇼', 'CAF', 55, 140],
  ['SWZ', 'Esuatini', '🇸🇿', 'CAF', 53, 146],
  ['LBY', 'Libia', '🇱🇾', 'CAF', 52, 153],
  ['MWI', 'Malaui', '🇲🇼', 'CAF', 54, 145],
  ['SLE', 'Sierra Leona', '🇸🇱', 'CAF', 53, 148],
  ['RSA', 'Sudáfrica', '🇿🇦', 'CAF', 51, 155],
  ['LES', 'Lesoto', '🇱🇸', 'CAF', 50, 160],
  ['BDI', 'Burundi', '🇧🇮', 'CAF', 50, 158],
  ['CTA', 'República Centroafricana', '🇨🇫', 'CAF', 48, 166],
  ['CHA', 'Chad', '🇹🇩', 'CAF', 48, 164],
  ['SOM', 'Somalia', '🇸🇴', 'CAF', 46, 174],
  ['MRI', 'Mauricio', '🇲🇺', 'CAF', 46, 173],
  ['SEY', 'Seychelles', '🇸🇨', 'CAF', 43, 188],
  ['ERI', 'Eritrea', '🇪🇷', 'CAF', 43, 186],
  ['SSD', 'Sudán del Sur', '🇸🇸', 'CAF', 42, 195],
  ['DJI', 'Yibuti', '🇩🇯', 'CAF', 41, 205],
  ['STP', 'Santo Tomé y Príncipe', '🇸🇹', 'CAF', 41, 204],
  ['JPN', 'Japón', '🇯🇵', 'AFC', 87, 17],
  ['IRN', 'Irán', '🇮🇷', 'AFC', 86, 21],
  ['KOR', 'Corea del Sur', '🇰🇷', 'AFC', 85, 24],
  ['AUS', 'Australia', '🇦🇺', 'AFC', 85, 22],
  ['QAT', 'Catar', '🇶🇦', 'AFC', 79, 40],
  ['KSA', 'Arabia Saudita', '🇸🇦', 'AFC', 78, 43],
  ['UZB', 'Uzbekistán', '🇺🇿', 'AFC', 77, 48],
  ['IRQ', 'Irak', '🇮🇶', 'AFC', 73, 64],
  ['UAE', 'Emiratos Árabes Unidos', '🇦🇪', 'AFC', 74, 58],
  ['JOR', 'Jordania', '🇯🇴', 'AFC', 71, 72],
  ['OMA', 'Omán', '🇴🇲', 'AFC', 70, 76],
  ['CHN', 'China', '🇨🇳', 'AFC', 70, 73],
  ['BHR', 'Baréin', '🇧🇭', 'AFC', 68, 78],
  ['SYR', 'Siria', '🇸🇾', 'AFC', 68, 82],
  ['THA', 'Tailandia', '🇹🇭', 'AFC', 68, 83],
  ['LBN', 'Líbano', '🇱🇧', 'AFC', 67, 86],
  ['TJN', 'Tayikistán', '🇹🇯', 'AFC', 65, 95],
  ['VIE', 'Vietnam', '🇻🇳', 'AFC', 64, 99],
  ['IND', 'India', '🇮🇳', 'AFC', 64, 98],
  ['PSE', 'Palestina', '🇵🇸', 'AFC', 63, 103],
  ['KGZ', 'Kirguistán', '🇰🇬', 'AFC', 61, 111],
  ['MAS', 'Malasia', '🇲🇾', 'AFC', 60, 117],
  ['PHI', 'Filipinas', '🇵🇭', 'AFC', 59, 124],
  ['MYA', 'Myanmar', '🇲🇲', 'AFC', 57, 130],
  ['IDN', 'Indonesia', '🇮🇩', 'AFC', 57, 128],
  ['SIN', 'Singapur', '🇸🇬', 'AFC', 56, 137],
  ['TKM', 'Turkmenistán', '🇹🇲', 'AFC', 56, 139],
  ['HKG', 'Hong Kong', '🇭🇰', 'AFC', 55, 141],
  ['AFG', 'Afganistán', '🇦🇫', 'AFC', 54, 144],
  ['PAK', 'Pakistán', '🇵🇰', 'AFC', 53, 147],
  ['PRK', 'Corea del Norte', '🇰🇵', 'AFC', 52, 150],
  ['TPE', 'China Taipéi', '🇹🇼', 'AFC', 52, 149],
  ['BAN', 'Bangladés', '🇧🇩', 'AFC', 50, 156],
  ['SRI', 'Sri Lanka', '🇱🇰', 'AFC', 49, 163],
  ['NEP', 'Nepal', '🇳🇵', 'AFC', 48, 165],
  ['YEM', 'Yemen', '🇾🇪', 'AFC', 48, 167],
  ['LAO', 'Laos', '🇱🇦', 'AFC', 47, 170],
  ['CAM', 'Camboya', '🇰🇭', 'AFC', 47, 169],
  ['MDV', 'Maldivas', '🇲🇻', 'AFC', 44, 181],
  ['MNG', 'Mongolia', '🇲🇳', 'AFC', 44, 182],
  ['BRU', 'Brunéi', '🇧🇳', 'AFC', 42, 192],
  ['GUM', 'Guam', '🇬🇺', 'AFC', 41, 199],
  ['BHU', 'Bután', '🇧🇹', 'AFC', 41, 196],
  ['TLS', 'Timor Oriental', '🇹🇱', 'AFC', 40, 210],
  ['MAC', 'Macao', '🇲🇴', 'AFC', 40, 207],
  ['KUW', 'Kuwait', '🇰🇼', 'AFC', 65, 92],
  ['USA', 'Estados Unidos', '🇺🇸', 'CONCACAF', 88, 15],
  ['MEX', 'México', '🇲🇽', 'CONCACAF', 87, 18],
  ['CAN', 'Canadá', '🇨🇦', 'CONCACAF', 77, 46],
  ['CRC', 'Costa Rica', '🇨🇷', 'CONCACAF', 74, 57],
  ['PAN', 'Panamá', '🇵🇦', 'CONCACAF', 72, 71],
  ['JAM', 'Jamaica', '🇯🇲', 'CONCACAF', 67, 85],
  ['HON', 'Honduras', '🇭🇳', 'CONCACAF', 66, 88],
  ['HTI', 'Haití', '🇭🇹', 'CONCACAF', 64, 97],
  ['GUA', 'Guatemala', '🇬🇹', 'CONCACAF', 64, 96],
  ['NCA', 'Nicaragua', '🇳🇮', 'CONCACAF', 45, 176],
  ['SLV', 'El Salvador', '🇸🇻', 'CONCACAF', 63, 102],
  ['CUR', 'Curazao', '🇨🇼', 'CONCACAF', 60, 114],
  ['TRI', 'Trinidad y Tobago', '🇹🇹', 'CONCACAF', 60, 121],
  ['SUR', 'Surinam', '🇸🇷', 'CONCACAF', 55, 143],
  ['DOM', 'República Dominicana', '🇩🇴', 'CONCACAF', 55, 142],
  ['CUB', 'Cuba', '🇨🇺', 'CONCACAF', 52, 151],
  ['GUY', 'Guyana', '🇬🇾', 'CONCACAF', 50, 159],
  ['BER', 'Bermudas', '🇧🇲', 'CONCACAF', 47, 168],
  ['BLZ', 'Belice', '🇧🇿', 'CONCACAF', 46, 172],
  ['PUR', 'Puerto Rico', '🇵🇷', 'CONCACAF', 45, 177],
  ['BRB', 'Barbados', '🇧🇧', 'CONCACAF', 44, 179],
  ['LCA', 'Santa Lucía', '🇱🇨', 'CONCACAF', 44, 183],
  ['GRN', 'Granada', '🇬🇩', 'CONCACAF', 44, 180],
  ['ATG', 'Antigua y Barbuda', '🇦🇬', 'CONCACAF', 43, 184],
  ['VIN', 'San Vicente y las Granadinas', '🇻🇨', 'CONCACAF', 43, 187],
  ['BAH', 'Bahamas', '🇧🇸', 'CONCACAF', 43, 185],
  ['SKN', 'San Cristóbal y Nieves', '🇰🇳', 'CONCACAF', 42, 194],
  ['ARU', 'Aruba', '🇦🇼', 'CONCACAF', 42, 191],
  ['DMA', 'Dominica', '🇩🇲', 'CONCACAF', 41, 197],
  ['TCA', 'Islas Turcas y Caicos', '🇹🇨', 'CONCACAF', 41, 200],
  ['VIR', 'Islas Vírgenes de los EE. UU.', '🇻🇮', 'CONCACAF', 41, 202],
  ['VGB', 'Islas Vírgenes Británicas', '🇻🇬', 'CONCACAF', 41, 201],
  ['CAY', 'Islas Caimán', '🇰🇾', 'CONCACAF', 40, 206],
  ['MSR', 'Montserrat', '🇲🇸', 'CONCACAF', 40, 208],
  ['AIA', 'Anguila', '🇦🇮', 'CONCACAF', 39, 211],
  ['NZL', 'Nueva Zelanda', '🇳🇿', 'OFC', 73, 65],
  ['TAH', 'Tahití', '🇵🇫', 'OFC', 56, 138],
  ['FIJ', 'Fiyi', '🇫🇯', 'OFC', 52, 152],
  ['PNG', 'Papúa Nueva Guinea', '🇵🇬', 'OFC', 51, 154],
  ['NCL', 'Nueva Caledonia', '🇳🇨', 'OFC', 50, 161],
  ['SOL', 'Islas Salomón', '🇸🇧', 'OFC', 49, 162],
  ['VAN', 'Vanuatu', '🇻🇺', 'OFC', 47, 171],
  ['SAM', 'Samoa', '🇼🇸', 'OFC', 45, 178],
  ['TGA', 'Tonga', '🇹🇴', 'OFC', 43, 189],
  ['COK', 'Islas Cook', '🇨🇰', 'OFC', 42, 193],
  ['ASA', 'Samoa Americana', '🇦🇸', 'OFC', 40, 209]
];

// Helpers de selecciones (reutilizables por ranking, internacional y cooperativo).
function seleccionPorCodigo(codigo) {
  const f = (SELECCIONES || []).find(function (s) { return s[0] === codigo; });
  if (!f) return null;
  return { codigo: f[0], nombre: f[1], bandera: f[2], confederacion: f[3], fuerza: f[4], rankingFifa: f[5], clave: BANDERA_ICONO[f[0]] || "" };
}

function banderaSeleccion(codigo) {
  const s = seleccionPorCodigo(codigo);
  return s ? s.bandera : "🏳️";
}

function seleccionesPorConfederacion(confed) {
  return (SELECCIONES || []).filter(function (s) { return s[3] === confed; });
}

// Fuerza de rivalidad: 1-10 (10 = máxima rivalidad histórica)
const RIVALIDADES = [
  { clubA: "River Plate", clubB: "San Lorenzo", fuerza: 8 },
  { clubA: "River Plate", clubB: "Peñarol", fuerza: 7 },
  { clubA: "River Plate", clubB: "Nacional", fuerza: 6 },
  { clubA: "San Lorenzo", clubB: "Peñarol", fuerza: 5 },
  { clubA: "Peñarol", clubB: "Nacional", fuerza: 9 },
  { clubA: "Argentinos Juniors", clubB: "Atlanta", fuerza: 6 },
  { clubA: "Los Andes", clubB: "Chaco For Ever", fuerza: 4 },
  { clubA: "Boca Juniors", clubB: "River Plate", fuerza: 10 },
  { clubA: "Imperial", clubB: "Imperial Academy", fuerza: 8 },
  { clubA: "Los Mancos Weones", clubB: "Chapa", fuerza: 3 },
  { clubA: "Barracas Central", clubB: "Laferrere", fuerza: 5 },
  { clubA: "Santos", clubB: "Chapeconense", fuerza: 6 },
  { clubA: "Cuiaba", clubB: "Chapeconense", fuerza: 4 },
  { clubA: "Orlando City", clubB: "Nacional", fuerza: 3 },
  { clubA: "Roma", clubB: "Lions", fuerza: 3 },
  { clubA: "Napoli", clubB: "Roma", fuerza: 4 },
  { clubA: "Imperial", clubB: "Nacional", fuerza: 8 },
  { clubA: "Lechonidas", clubB: "Alessandria", fuerza: 9},
  { clubA: "Asesinos del Futbol", clubB: "El Bondi", fuerza: 8},
  { clubA: "San Lorenzo", clubB: "Los Andes", fuerza: 7}
];

// Helper: obtener fuerza de rivalidad entre dos clubes
function obtenerRivalidad(clubA, clubB) {
  if (!clubA || !clubB) return 0;
  const nombreA = clubA.nombre || clubA;
  const nombreB = clubB.nombre || clubB;
  const rivalidad = RIVALIDADES.find(r => 
    (r.clubA === nombreA && r.clubB === nombreB) || 
    (r.clubA === nombreB && r.clubB === nombreA)
  );
  return rivalidad ? rivalidad.fuerza : 0;
}

// 2. REGLAS DE MEDIA SEGÚN REPUTACIÓN
const REGLAS_MEDIA = {
    1: 65, 2: 68, 3: 72, 4: 76, 5: 80,
    6: 84, 7: 88, 8: 92, 9: 96, 10: 99
};

// 3. PERSONAJES DE ENTRENAMIENTO
const PERSONAJES = {
  DEL: ["Gonza431", "SidaBolso", "Orsini", "Pyojo", "Flowy", "God", "Nano_deaa", "Nico Piedra", "Charly", "Valem", "GonzaMJ", "Fan", "Mclovin", "Dona", "Wel", "Wellio", "Toledo", "Nika", "Magno"],
  CM: ["Dnt", "Caseros", "Ivans", "Marabola", "Bati", "Barney", "Pisa", "021", "Valiel", "Rafah", "Puskas", "Osabio"],
  DEF: ["Cerbe", "Musa", "Fuyi", "Kolt", "Thomy", "Bekku", "Joel", "Skchester", "Trompita", "Sepi", "Wizen", "Justin", "Luckz", "Cz"],
  GK: ["Raiko", "Khruel", "Fonta", "Molleja", "Pulgar", "Gbz", "Carlos Maria", "Alisson", "Aubrey"],
  GLOBAL: ["Coutinho", "Iniesta", "Neneu", "Agstn", "Pipita"]
};

// ============ PERSONALIDADES PARA REDES SOCIALES ============
// Cada personaje tiene una personalidad que define su estilo de declaraciones
const PERSONAJES_REDES = {
  // DELanteros
  "Gonza431": { estilo: "picante", ego: 8, lealtad: 6, chicana: "Hablan mucho y después no aparecen." },
  "SidaBolso": { estilo: "normal", ego: 4, lealtad: 7, chicana: "" },
  "Orsini": { estilo: "muy_picante", ego: 9, lealtad: 5, chicana: "Mucho humo, poco fútbol." },
  "Pyojo": { estilo: "picante", ego: 7, lealtad: 6, chicana: "Cuando quieras hablamos en la cancha." },
  "Flowy": { estilo: "normal", ego: 5, lealtad: 8, chicana: "" },
  "God": { estilo: "muy_picante", ego: 10, lealtad: 4, chicana: "Yo soy el juego, ustedes solo miran." },
  "Nano_deaa": { estilo: "picante", ego: 6, lealtad: 7, chicana: "Seguí hablando, que yo sigo ganando." },
  "Nico Piedra": { estilo: "normal", ego: 4, lealtad: 9, chicana: "" },
  "Charly": { estilo: "picante", ego: 7, lealtad: 6, chicana: "No está a nuestra altura." },
  "Valem": { estilo: "normal", ego: 5, lealtad: 8, chicana: "" },
  "GonzaMJ": { estilo: "picante", ego: 6, lealtad: 7, chicana: "Primero ganá algo, después hablás." },
  "Fan": { estilo: "normal", ego: 3, lealtad: 9, chicana: "" },
  "Mclovin": { estilo: "picante", ego: 8, lealtad: 5, chicana: "Que disfruten ahora, después no lloren." },
  "Dona": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Wel": { estilo: "picante", ego: 6, lealtad: 7, chicana: "Mucho ruido, pocas nueces." },
  "Wellio": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Toledo": { estilo: "picante", ego: 7, lealtad: 6, chicana: "No saben perder, y menos ganar." },
  "Nika": { estilo: "normal", ego: 5, lealtad: 8, chicana: "" },
  "Magno": { estilo: "muy_picante", ego: 9, lealtad: 4, chicana: "Se creen grandes y son chicos." },

  // Centrocampistas
  "Dnt": { estilo: "muy_picante", ego: 9, lealtad: 5, chicana: "El fútbol se demuestra, no se cuenta." },
  "Caseros": { estilo: "normal", ego: 4, lealtad: 9, chicana: "" },
  "Ivans": { estilo: "picante", ego: 7, lealtad: 6, chicana: "Hay equipos que hablan antes y desaparecen después." },
  "Marabola": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Bati": { estilo: "picante", ego: 6, lealtad: 7, chicana: "Algunos necesitan cinco ocasiones para un gol." },
  "Barney": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Pisa": { estilo: "muy_picante", ego: 8, lealtad: 5, chicana: "Cuándo quieras nos vemos el domingo." },
  "021": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Valiel": { estilo: "picante", ego: 7, lealtad: 6, chicana: "Tanto hablar para qué, si en la cancha se ve." },
  "Rafah": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Puskas": { estilo: "picante", ego: 8, lealtad: 5, chicana: "Los títulos se ganan, no se compran." },
  "Osabio": { estilo: "normal", ego: 5, lealtad: 8, chicana: "" },

  // DEFensas
  "Cerbe": { estilo: "muy_picante", ego: 9, lealtad: 5, chicana: "Atrás no pasa nadie, y si pasa... se queda." },
  "Musa": { estilo: "normal", ego: 4, lealtad: 9, chicana: "" },
  "Fuyi": { estilo: "picante", ego: 6, lealtad: 7, chicana: "Mejor cerrar la boca y abrir el marcador." },
  "Kolt": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Thomy": { estilo: "picante", ego: 7, lealtad: 6, chicana: "La defensa gana campeonatos, la boca pierde finales." },
  "Bekku": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Joel": { estilo: "picante", ego: 6, lealtad: 7, chicana: "Hablan de mí porque no pueden hablar de su juego." },
  "Skchester": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Trompita": { estilo: "muy_picante", ego: 8, lealtad: 5, chicana: "El que habla mucho, juega poco." },
  "Sepi": { estilo: "normal", ego: 5, lealtad: 8, chicana: "" },
  "Wizen": { estilo: "picante", ego: 7, lealtad: 6, chicana: "Que hablen los resultados, yo hablo en la cancha." },
  "Justin": { estilo: "normal", ego: 4, lealtad: 9, chicana: "" },
  "Luckz": { estilo: "picante", ego: 6, lealtad: 7, chicana: "No necesito hablar, mi juego habla por mí." },
  "Cz": { estilo: "normal", ego: 5, lealtad: 8, chicana: "" },

  // ARQueros
  "Raiko": { estilo: "muy_picante", ego: 9, lealtad: 5, chicana: "Entre los tres palos mando yo." },
  "Khruel": { estilo: "normal", ego: 4, lealtad: 9, chicana: "" },
  "Fonta": { estilo: "picante", ego: 7, lealtad: 6, chicana: "Los delanteros vienen, los goles no." },
  "Molleja": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Pulgar": { estilo: "picante", ego: 6, lealtad: 7, chicana: "Atajé penales que ustedes ni soñaron patear." },
  "Gbz": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Carlos Maria": { estilo: "muy_picante", ego: 8, lealtad: 5, chicana: "Mi arco es mi casa, y ustedes no entran." },
  "Alisson": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Aubrey": { estilo: "picante", ego: 6, lealtad: 7, chicana: "Mucho tiro, poco gol." },

  // GLOBAL (mix)
  "Coutinho": { estilo: "normal", ego: 5, lealtad: 8, chicana: "" },
  "Iniesta": { estilo: "normal", ego: 3, lealtad: 9, chicana: "" },
  "Neneu": { estilo: "picante", ego: 7, lealtad: 6, chicana: "El fútbol es simple, ustedes lo complican." },
  "Agstn": { estilo: "normal", ego: 4, lealtad: 8, chicana: "" },
  "Pipita": { estilo: "muy_picante", ego: 10, lealtad: 4, chicana: "Tengo más títulos que ustedes partidos jugados." }
};

// Helper: obtener personalidad de un personaje
function obtenerPersonalidadRed(nombre) {
  return PERSONAJES_REDES[nombre] || { estilo: "normal", ego: 5, lealtad: 7, chicana: "" };
}

// 4. TEXTOS DE ENTRENAMIENTO
const TEXTOS_ENTRENAMIENTO = {
  DEL: [
    "Aprende a definir al segundo palo cruzado rompiendo la cadera del arquero rival.",
    "Trabaja la lectura de los desmarques de ruptura a la espalda de los centrales.",
    "Perfecciona el tiro de primera intención apenas entra la pelota al área chica.",
    "Entrena la cobertura de pelota de espaldas para girar rápido y sacar el zurdazo.",
    "Domina el arte del amague largo para dejar tirado al arquero en el mano a mano.",
    "Practica los desmarques en diagonal atacando el espacio vacío.",
    "Perfecciona el remate de cabeza picado tras centro bombeado.",
    "Entrena la definición de cuchara por encima del golero."
  ],
  CM: [
    "Masteriza la pausa y el cambio de frente milimétrico hacia la banda opuesta.",
    "Practica el control orientado de primera para sacarte la presión alta de encima.",
    "Entrena el pase filtrado entre líneas para romper bloques defensivos cerrados.",
    "Aprende a temporizar y manejar los tiempos del equipo en momentos críticos.",
    "Perfecciona el remate de media distancia ante rebotes a la salida de un córner.",
    "Practica la recuperación tras pérdida para cortar el contraataque rival.",
    "Entrena la distribución al primer toque bajo presión sofocante.",
    "Trabaja las paredes cortas en el borde del área para romper líneas."
  ],
  DEF: [
    "Aprende a perfilar el cuerpo para temporizar al extremo y cerrarle la diagonal.",
    "Domina el tiempo del cruce abajo con barrida limpia sin cometer falta en el área.",
    "Entrena el anticipo de cabeza frente a los saques largos del arquero rival.",
    "Practica el despeje de cabeza orientado hacia las bandas para no regalar la pelota en el centro.",
    "Trabaja el escalonamiento defensivo para tirar la trampa del offside en el momento exacto.",
    "Perfecciona la salida limpia desde el fondo rompiendo la primera línea de presión.",
    "Aprende a usar el cuerpo en el hombro a hombro para desequilibrar al delantero sin cometer falta.",
    "Entrena la cobertura a la espalda de tu lateral cuando se proyecta al ataque.",
    "Masteriza la marca personal en el tiro de esquina para no perder nunca de vista a tu marca."
  ],
  GK: [
    "Trabaja los reflejos sobre la línea y la velocidad de reacción en remates a quemarropa.",
    "Mejora el achique agresivo achicando el ángulo de tiro en los mano a mano.",
    "Practica la salida rápida con el pie para iniciar la contra instantánea.",
    "Perfecciona el embolse de pelota en tiros potentes a media altura.",
    "Entrena la comunicación y el liderazgo para ordenar la barrera en tiros libres.",
    "Trabaja la estirada a mano cambiada para sacar pelotas del ángulo."
  ]
};

// 4b. FRASES DE JUGADORES SEGÚN LA CARACTERÍSTICA A ENTRENAR
const TEXTOS_ENTRENAMIENTO_ATRIBUTO = {
  VEL: [
    "Si tenés velocidad, los centrales ni te ven. Sprint los lunes y el resto te sigue.",
    "Los primeros diez metros definen la carrera. Trabajá la explosión.",
    "Corré o mirá: en esta cancha el que llega primero define."
  ],
  PAS: [
    "Dámela limpia a la media luna que yo me encargo del resto.",
    "El pase es la mitad del gol, no la regales al medio.",
    "Jugá de primera, el fútbol no espera a nadie."
  ],
  REM: [
    "El remate no se piensa: pegale antes de que te cierren.",
    "Abajo al palo, que los arqueros esperan siempre el bombazo arriba.",
    "Definición de primera al segundo palo, ahí se rompen los arcos."
  ],
  DEF: [
    "Atrás no se negocia: cuerpo, timing y cierre.",
    "Temporizá el cruce y quedate parado, el delantero se va solo.",
    "La defensa gana campeonatos."
  ],
  REG: [
    "Encará siempre y, si vas, hacelo convencido hasta el final.",
    "El amague largo deja al marcador mirando el cartel.",
    "Cambiá el ritmo a mitad de carrera y escondete."
  ],
  RES: [
    "El partido se gana a los ochenta, cuando el resto baja los brazos.",
    "Llegar al área corriendo, no caminando: eso separa titulares.",
    "Banquero cada segundo, el segundo tiempo es de los que resisten."
  ],
  REF: [
    "El reflejo se entrena antes de la pelota: la reacción gana duelos.",
    "Quedate de pie hasta el último segundo, el remate llega siempre.",
    "En los mano a mano no hay empate: atajás o atajan."
  ],
  MAN: [
    "Achicá el ángulo y no caigas al piso antes de tiempo.",
    "Un arquero valiente corta la jugada antes de que pateen.",
    "Estirada a mano cambiada: mové esos guantes, no se gastan solo."
  ],
  SAL: [
    "Con los pies también se ataja: salida limpia y contra rápida.",
    "Anticipá los cortes largos y ordená a la defensa con tu voz.",
    "El arquero moderno juega con los pies, aprendé a sacar jugando."
  ]
};

// 5. SISTEMA DE ROLES
// Las imagenes de los badges estan en /imagenes:
//   inmortal.png (escudo dorado), master.png (escudo rojo), normal.png (circulo con X)
const ROLES = [
  { nombre: "Normal",    minOVR: 40, maxOVR: 74, emoji: "⚽",  color: "#adb5bd", descripcion: "Jugador en desarrollo", imagen: "imagenes/normal.png" },
  { nombre: "Promesa",   minOVR: 75, maxOVR: 79, emoji: "🌟",  color: "#4dabf7", descripcion: "¡Mostrás condiciones!" },
  { nombre: "Aspirante", minOVR: 80, maxOVR: 84, emoji: "🔥",  color: "#69db7c", descripcion: "Un nivel más arriba" },
  { nombre: "Master",    minOVR: 85, maxOVR: 89, emoji: "👑",  color: "#cc5de8", descripcion: "Jugador de élite", imagen: "imagenes/master.png" },
  { nombre: "Inmortal",  minOVR: 90, maxOVR: 99, emoji: "💎",  color: "#ffd43b", descripcion: "Leyenda del PSO",   imagen: "imagenes/inmortal.png" }
];

function obtenerRol(media) {
  for (let i = ROLES.length - 1; i >= 0; i--) {
    if (media >= ROLES[i].minOVR) return ROLES[i];
  }
  return ROLES[0];
}

const LOGROS = [
  { id: "primer_titulo", nombre: "Campeón", desc: "Ganá tu primer título.", nombrePt: "Campeão", descPt: "Ganhe seu primeiro título.", emoji: "🏆" },
  { id: "bota_oro", nombre: "Botín Dorado", desc: "Ganá una Bota de Oro.", nombrePt: "Chuteira de Ouro", descPt: "Ganhe uma Chuteira de Ouro.", emoji: "👟" },
  { id: "balon_oro", nombre: "Mejor del Mundo", desc: "Ganá un Balón de Oro.", nombrePt: "Melhor do Mundo", descPt: "Ganhe uma Bola de Ouro.", emoji: "🥇" },
  { id: "master", nombre: "Master", desc: "Alcanzá el rol Master.", nombrePt: "Master", descPt: "Alcance a função Master.", emoji: "👑" },
  { id: "inmortal", nombre: "Inmortal", desc: "Alcanzá el rol Inmortal.", nombrePt: "Imortal", descPt: "Alcance a função Imortal.", emoji: "💎" },
  { id: "copa_campeones", nombre: "Rey de Copas", desc: "Ganá la Copa de Campeones.", nombrePt: "Rei das Copas", descPt: "Ganhe a Copa dos Campeões.", emoji: "👑" },
  { id: "temporada_10", nombre: "Veterano", desc: "Jugá 10 temporadas.", nombrePt: "Veterano", descPt: "Jogue 10 temporadas.", emoji: "🎖️" },
  { id: "triplete", nombre: "Triplete", desc: "Ganá 3 títulos en una temporada.", nombrePt: "Tríplice coroa", descPt: "Ganhe 3 títulos em uma temporada.", emoji: "🏅" },
  { id: "superviviente", nombre: "Superviviente", desc: "Zafá una sanción de Loro.", nombrePt: "Sobrevivente", descPt: "Supere uma punição do Loro.", emoji: "🛡️" }
];

const FINALES = [
  { id: "leyenda", nombre: "Leyenda del PSO", desc: "Terminaste con OVR 90+ y 3+ títulos mayores.", nombrePt: "Lenda do PSO", descPt: "Terminou com OVR 90+ e 3+ títulos principais.", emoji: "👑", color: "#ffd43b" },
  { id: "estrella", nombre: "Estrella", desc: "Terminaste con OVR 85+ y títulos.", nombrePt: "Estrela", descPt: "Terminou com OVR 85+ e títulos.", emoji: "⭐", color: "#4dabf7" },
  { id: "profesional", nombre: "Profesional", desc: "Carrera sólida con buen nivel.", nombrePt: "Profissional", descPt: "Carreira sólida e em bom nível.", emoji: "🔥", color: "#69db7c" },
  { id: "promesa", nombre: "Promesa Truncada", desc: "No lograste consolidarte.", nombrePt: "Promessa interrompida", descPt: "Você não conseguiu se consolidar.", emoji: "🌟", color: "#adb5bd" },
  { id: "olvidado", nombre: "Olvidado", desc: "Terminaste en el olvido de la Segunda.", nombrePt: "Esquecido", descPt: "Terminou esquecido na Segunda Divisão.", emoji: "💤", color: "#868e96" }
];

const TEXTOS_UI = {
  es: {
    titulo: "CARRERA PSO", nombreJugador: "Nombre del Jugador:", placeholderNombre: "Ej: Caseros",
    posCancha: "📍 Posición en cancha", tuCasaca: "👕 Tu casaca", dorsal: "🔢 Dorsal",
    posDEL: "Delantero (DEL)", posCM: "Mediocampista (CM)", posDEF: "Defensa (DEF)", posGK: "Arquero (GK)",
    iniciar: "Iniciar Carrera", continuar: "▶️ Continuar Carrera Guardada", modoDesafio: "🛡️ Modo Leal",
    modoLealInfo: "Carrera de un solo club que no afecta el ranking online. Objetivo: ganarle <strong>10 títulos</strong> a tu club.",
    ranking: "🏆 Ranking", slots: "💾 Slots", modoOscuroTitulo: "Modo oscuro", dueloBoton: "⚔️ Duelo 1v1 Online", dueloTab: "⚔️ Duelo 1v1", dueloBuscar: "BUSCAR PARTIDO", dueloAbre: "Jugá la carrera de 10 temporadas contra otro jugador en tiempo real.", coopBoton: "🤝 Cooperativo Online", coopAbre: "Jugá en dupla con otro jugador: mismo club y misma selección, decisiones compartidas en tiempo real.",
    edad: "Edad:", anios: "años", media: "Media:", club: "Club:", moral: "Moral:", acciones: "Acciones",
    entrenar: "Entrenar", dominios: "⚽ Dominios", entrenamiento: "⚽ Entrenamiento",
    masMinijuegos: "🎮 Más Minijuegos", logros: "🏅 Logros", stats: "📊 Stats", sinEventos: "No hay eventos sociales esta temporada.", sinEventosTitulo: "Sin eventos por ahora", eventoSecTitulo: "⭐ Evento social", eventoAyuda: "Aceptá o rechazá la propuesta: puede subir tu media, cambiarte de club o mover tus redes.",
  supportTitulo: "❤️ Ayudame a mantener vivo a COPERO PSO SA",
  supportSubtitulo: "Soy un estudiante: mantener las bases de datos que guardan tu progreso, cuenta y ranking tiene un costo real cada mes. Con tu apoyo las mantenemos en pie y me das la energía para seguir sumando contenido.",
  supportBasicoTitulo: "Básico", supportBasicoPrecio: "1 USD",
  supportBasicoDesc: "El arranque perfecto para bancar el proyecto.",
  supportBasicoF1: "Insignia de apoyador en tu perfil",
  supportBasicoF2: "Acceso al modo Ultrarealista",
  supportBasicoF3: "Nuestro agradecimiento eterno",
  supportPremiumTitulo: "Premium", supportPremiumPrecio: "3 USD",
  supportPremiumDesc: "El paquete completo para los que aman el proyecto.",
  supportPremiumF1: "Todo lo del Básico",
  supportPremiumF2: "Evento especial de fin de semana",
  supportPremiumF3: "Cosmético exclusivo",
  supportPremiumF4: "Voz activa en las próximas features",
  supportDevTitulo: "Desarrollador", supportDevPrecio: "Gratis",
  supportDevDesc: "El proyecto es 100% mío: sumate a construirlo o tirá ideas.",
  supportDevF1: "Ayudar a desarrollar el juego",
  supportDevF2: "Tirar ideas a lo loco",
  supportDevF3: "Cero conocimientos previos",
  supportBasicoBtn: "Apoyar", supportPremiumBtn: "Apoyar", supportDevBtn: "Abrir ticket",
  supportPeriodo: "/mes",
  supportBadge: "Recomendado",
  supportBtn: "🚀 Apoyar",
  supportNota: "Tranquilo, no es pay-to-win: ningún beneficio te da ventaja en el ranking online ni en el 1v1. Acá manda la pasión por el proyecto. ❤️",
    simular: "Simular Temporada", reiniciar: "Reiniciar Carrera", historial: "Historial de Carrera",
    thTemp: "Temp", thClub: "Club", thPJ: "PJ", thGoles: "Goles", thAsist: "Asist.", thTitulos: "Títulos / Logros",
    retiro: "🏁 Retiro Profesional", partidos: "Partidos:", goles: "Goles:", asistencias: "Asistencias:", jugarDeNuevo: "Jugar de Nuevo",
    rankTitulo: "🏆 Ranking", rankTabGlobal: "🌍 Global (Online)", rankTabLocal: "📱 Este dispositivo", rankColJugador: "Jugador",
    rankColMedia: "Media", rankColTitulos: "Títulos", rankColAnio: "Año", rankCargando: "Cargando ranking online...",
    rankErrorOnline: "No se pudo conectar con el ranking online. Revisá tu conexión.", rankReintentar: "🔄 Reintentar", rankActualizar: "🔄 Actualizar",
    rankVacioOnline: "Todavía no hay carreras en el ranking global. ¡Terminá una carrera y sé el primero!",
    rankVacioLocal: "Todavía no hay carreras registradas en este dispositivo.", rankSincronizado: "🟢 Ranking online sincronizado",
    rankPendiente: "📤 Tu carrera quedó guardada y se enviará cuando haya internet", btnInstalar: "📥 Instalar App",
    desarrollado: "Desarrollado por:", colaboracion: "Colaboración:", privacidadLink: "Política de privacidad",
    cuentaTitulo: "👤 Mi cuenta (opcional)", cuentaInfo: "Tu carrera sigue guardada en este dispositivo. Supabase gestiona tu correo, autenticación y apodo. Al recargar la página tendrás que iniciar sesión otra vez.",
    cuentaEmail: "Correo electrónico", cuentaPass: "Contraseña", cuentaAcepto1: "Leí y acepto la", cuentaPrivacidadLink: "Política de privacidad (abre otra pestaña)", cuentaAcepto2: "para crear mi cuenta.",
    cuentaAyuda: "Obligatorio solo al registrarse. Usamos el correo y la autenticación para gestionar tu cuenta y el apodo para tu perfil. Esta aceptación no autoriza publicidad ni medición opcional.",
    cuentaLogin: "Iniciar sesión", cuentaCrear: "Crear cuenta", cuentaRegistroAyuda: "Para registrarte, usá al menos 8 caracteres. Confirmá el correo recibido antes de iniciar sesión.",
    cuentaApodo: "Apodo del perfil", cuentaGuardarApodo: "Guardar apodo", cuentaLeerPerfil: "Volver a leer perfil", cuentaSalir: "Cerrar sesión",
    btnEntendido: "Entendido", btnRechazar: "Rechazar", btnAceptar: "Aceptar", btnContinuar: "Continuar", btnCerrar: "Cerrar", btnEntendido2: "¡Entendido!",
    mercadoTitulo: "Mercado de Pases", penalTitulo: "⚽ ¡FINAL DRAMÁTICA!", penalTexto: "El partido está empatado. Tienes en tus pies el penal para definir el título.",
    minijuegoIndicacion: "Seguí la indicación de este minijuego:", tiempoRestante: "Tiempo restante:", dardosTitulo: "🎯 Dardos con los pibes", dardosIndicacion: "Tocá TIRAR en el momento justo: el indicador va de afuera hacia el centro y vuelve. Centro = más puntos.", dardosBoton: "🎯 ¡TIRAR!", ssTitulo: "🔍 REVISIÓN EN VIVO (SS)", ssTexto: "Revisando carpetas y archivos sospechosos...",
    rolDesbloqueado: "🔓 ROL DESBLOQUEADO", avisoMinijuego: "Ya jugaste el minijuego de esta temporada. Solo se puede jugar 1 minijuego por temporada, además del entrenamiento por atributos. Avanzá a la próxima temporada para jugar otro."
  },
  en: {
    titulo: "PSO CAREER", nombreJugador: "Player Name:", placeholderNombre: "Ex: Caseros", posCancha: "📍 Position on the pitch", tuCasaca: "👕 Your shirt", dorsal: "🔢 Shirt number",
    posDEL: "Forward (DEL)", posCM: "Midfielder (CM)", posDEF: "Defender (DEF)", posGK: "Goalkeeper (GK)", iniciar: "Start Career", continuar: "▶️ Continue Saved Career", modoDesafio: "🛡️ Loyal Mode", modoLealInfo: "A one-club career that does NOT affect the online ranking. Goal: win <strong>10 titles</strong> for your club.", ranking: "🏆 Ranking", slots: "💾 Slots", modoOscuroTitulo: "Dark mode", dueloBoton: "⚔️ 1v1 Duel Online", dueloTab: "⚔️ 1v1 Duel", dueloBuscar: "FIND MATCH", dueloAbre: "Play the 10-season career against another player in real time.", coopBoton: "🤝 Co-op Online", coopAbre: "Play as a duo with another player: same club and same national team, shared decisions in real time.",
    edad: "Age:", anios: "years", media: "Rating:", club: "Club:", moral: "Morale:", acciones: "Actions", entrenar: "Train", dominios: "⚽ Ball Juggling", entrenamiento: "⚽ Training", masMinijuegos: "🎮 More Minigames", logros: "🏅 Achievements", stats: "📊 Stats", sinEventos: "No social events this season.", sinEventosTitulo: "No events right now", eventoSecTitulo: "⭐ Social event", eventoAyuda: "Accept or decline the offer: it can raise your rating, move you to another club or shake up your socials.",
  supportTitulo: "❤️ Help me keep COPERO PSO SA alive", supportSubtitulo: "I'm a student: keeping the databases that host your progress, account and ranking has a real cost every month. With your support they stay online and you give me the energy to keep shipping content.",
  supportBasicoTitulo: "Basic", supportBasicoPrecio: "1 USD", supportBasicoDesc: "The perfect first step to back the project.",
  supportBasicoF1: "Supporter badge on your profile",
  supportBasicoF2: "Access to Ultrarealistic mode",
  supportBasicoF3: "Our eternal gratitude",
  supportPremiumTitulo: "Premium", supportPremiumPrecio: "3 USD", supportPremiumDesc: "The full package for those who love the project.",
  supportPremiumF1: "Everything in Basic",
  supportPremiumF2: "Special weekend event",
  supportPremiumF3: "Exclusive cosmetic",
  supportPremiumF4: "Active voice in upcoming features",
  supportDevTitulo: "Developer", supportDevPrecio: "Free", supportDevDesc: "A 100% solo project: jump in to build it or toss ideas.",
  supportDevF1: "Help develop the game",
  supportDevF2: "Drop any wild idea",
  supportDevF3: "No prior knowledge needed",
  supportBasicoBtn: "Support", supportPremiumBtn: "Support", supportDevBtn: "Open ticket",
  supportPeriodo: "/month",
  supportBadge: "Recommended",
  supportBtn: "🚀 Support",
  supportNota: "Relax, it's not pay-to-win: no perk gives you an edge in online ranking or 1v1. Passion for the project is what matters. ❤️", simular: "Simulate Season", reiniciar: "Restart Career", historial: "Career History", thTemp: "Season", thClub: "Club", thPJ: "MP", thGoles: "Goals", thAsist: "Assists", thTitulos: "Titles / Achievements", retiro: "🏁 Professional Retirement", partidos: "Matches:", goles: "Goals:", asistencias: "Assists:", jugarDeNuevo: "Play Again", rankTitulo: "🏆 Ranking", rankTabGlobal: "🌍 Global (Online)", rankTabLocal: "📱 This device", rankColJugador: "Player", rankColMedia: "Rating", rankColTitulos: "Titles", rankColAnio: "Year", rankCargando: "Loading online ranking...", rankErrorOnline: "Could not connect to the online ranking. Check your connection.", rankReintentar: "🔄 Retry", rankActualizar: "🔄 Refresh", rankVacioOnline: "No careers in the global ranking yet. Finish a career and be the first!", rankVacioLocal: "No careers registered on this device yet.", rankSincronizado: "🟢 Online ranking synced", rankPendiente: "📤 Your career was saved and will be sent when you're back online", btnInstalar: "📥 Install App", desarrollado: "Developed by:", colaboracion: "Collaboration:", privacidadLink: "Privacy Policy",
    cuentaTitulo: "👤 My account (optional)", cuentaInfo: "Your career is still saved on this device. Supabase manages your email, authentication and nickname. When you reload the page you will have to sign in again.", cuentaEmail: "Email", cuentaPass: "Password", cuentaAcepto1: "I have read and accept the", cuentaPrivacidadLink: "Privacy Policy (opens a new tab)", cuentaAcepto2: "to create my account.", cuentaAyuda: "Required only when signing up. We use the email and authentication to manage your account and the nickname for your profile. This acceptance does not allow advertising or optional measurement.", cuentaLogin: "Sign in", cuentaCrear: "Create account", cuentaRegistroAyuda: "To sign up, use at least 8 characters. Confirm the email you received before signing in.", cuentaApodo: "Profile nickname", cuentaGuardarApodo: "Save nickname", cuentaLeerPerfil: "Read profile again", cuentaSalir: "Sign out", btnEntendido: "Got it", btnRechazar: "Reject", btnAceptar: "Accept", btnContinuar: "Continue", btnCerrar: "Close", btnEntendido2: "Got it!", mercadoTitulo: "Transfer Market", penalTitulo: "⚽ DRAMATIC FINAL!", penalTexto: "The match is tied. The penalty to decide the title is at your feet.", minijuegoIndicacion: "Follow this minigame's instruction:", tiempoRestante: "Time left:", dardosTitulo: "🎯 Darts with the boys", dardosIndicacion: "Tap THROW at the right moment: the indicator swings from the outside toward the center and back. Center = more points.", dardosBoton: "🎯 THROW!", ssTitulo: "🔍 LIVE REVIEW (SS)", ssTexto: "Checking suspicious folders and files...", rolDesbloqueado: "🔓 ROLE UNLOCKED", avisoMinijuego: "You already played this season's minigame. You can only play 1 minigame per season, in addition to attribute training. Move on to the next season to play another."
  },
  pt: {
    titulo: "CARREIRA PSO", nombreJugador: "Nome do jogador:", placeholderNombre: "Ex.: Caseros", posCancha: "📍 Posição em campo", tuCasaca: "👕 Sua camisa", dorsal: "🔢 Número", posDEL: "Atacante (DEL)", posCM: "Meio-campista (CM)", posDEF: "Zagueiro (DEF)", posGK: "Goleiro (GK)", iniciar: "Iniciar carreira", continuar: "▶️ Continuar carreira salva", modoDesafio: "🛡️ Modo Leal", ranking: "🏆 Ranking", slots: "💾 Slots", modoOscuroTitulo: "Modo escuro", dueloBoton: "⚔️ Duelo 1v1 Online", dueloTab: "⚔️ Duelo 1v1", dueloBuscar: "BUSCAR PARTIDA", dueloAbre: "Jogue a carreira de 10 temporadas contra outro jogador em tempo real.", coopBoton: "🤝 Cooperativo Online", coopAbre: "Jogue em dupla com outro jogador: mesmo clube e mesma seleção, decisões compartilhadas em tempo real.", edad: "Idade:", anios: "anos", media: "Média:", club: "Clube:", moral: "Moral:", acciones: "Ações", entrenar: "Treinar", dominios: "⚽ Embaixadinhas", entrenamiento: "⚽ Treinamento", masMinijuegos: "🎮 Mais minijogos", logros: "🏅 Conquistas", stats: "📊 Estatísticas", sinEventos: "Não há eventos sociais nesta temporada.", sinEventosTitulo: "Sem eventos por enquanto", eventoSecTitulo: "⭐ Evento social", eventoAyuda: "Aceite ou recuse a proposta: pode subir sua média, mudar seu clube ou mexer nas suas redes.",
  supportTitulo: "❤️ Ajude-me a manter o COPERO PSO SA vivo", supportSubtitulo: "Sou estudante: manter os bancos de dados que guardam seu progresso, conta e ranking tem um custo real todo mês. Com seu apoio eles ficam no ar e você me dá energia para continuar adicionando conteúdo.",
  supportBasicoTitulo: "Básico", supportBasicoPrecio: "1 USD", supportBasicoDesc: "O começo perfeito para apoiar o projeto.",
  supportBasicoF1: "Distintivo de apoiador no seu perfil",
  supportBasicoF2: "Acesso ao modo Ultrarealista",
  supportBasicoF3: "Nossa gratidão eterna",
  supportPremiumTitulo: "Premium", supportPremiumPrecio: "3 USD", supportPremiumDesc: "O pacote completo para quem ama o projeto.",
  supportPremiumF1: "Tudo do Básico",
  supportPremiumF2: "Evento especial de fim de semana",
  supportPremiumF3: "Cosmético exclusivo",
  supportPremiumF4: "Voz ativa nas próximas features",
  supportDevTitulo: "Desenvolvedor", supportDevPrecio: "Grátis", supportDevDesc: "Um projeto 100% meu: entre para construir ou mande ideias.",
  supportDevF1: "Ajudar a desenvolver o jogo",
  supportDevF2: "Mandar ideias à vontade",
  supportDevF3: "Sem conhecimento prévio",
  supportBasicoBtn: "Apoiar", supportPremiumBtn: "Apoiar", supportDevBtn: "Abrir ticket",
  supportPeriodo: "/mês",
  supportBadge: "Recomendado",
  supportBtn: "🚀 Apoiar",
  supportNota: "Fica tranquilo, não é pay-to-win: nenhum benefício te dá vantagem no ranking online nem no 1v1. Aqui manda a paixão pelo projeto. ❤️", simular: "Simular temporada", reiniciar: "Reiniciar carreira", historial: "Histórico da carreira", thTemp: "Temp.", thClub: "Clube", thPJ: "PJ", thGoles: "Gols", thAsist: "Assist.", thTitulos: "Títulos / Conquistas", retiro: "🏁 Aposentadoria profissional", partidos: "Partidas:", goles: "Gols:", asistencias: "Assistências:", jugarDeNuevo: "Jogar novamente", rankTitulo: "🏆 Ranking", rankTabGlobal: "🌍 Global (online)", rankTabLocal: "📱 Este dispositivo", rankColJugador: "Jogador", rankColMedia: "Média", rankColTitulos: "Títulos", rankColAnio: "Ano", rankCargando: "Carregando ranking online...", rankErrorOnline: "Não foi possível conectar ao ranking online. Verifique sua conexão.", rankReintentar: "🔄 Tentar novamente", rankActualizar: "🔄 Atualizar", rankVacioOnline: "Ainda não há carreiras no ranking global. Termine uma carreira e seja o primeiro!", rankVacioLocal: "Ainda não há carreiras registradas neste dispositivo.", rankSincronizado: "🟢 Ranking online sincronizado", rankPendiente: "📤 Sua carreira foi salva e será enviada quando houver internet", btnInstalar: "📥 Instalar aplicativo", desarrollado: "Desenvolvido por:", colaboracion: "Colaboração:", privacidadLink: "Política de privacidade", dardosTitulo: "🎯 Dardos com a galera", dardosIndicacion: "Toque em ATIRAR no momento certo: o indicador vai de fora em direção ao centro e volta. Centro = mais pontos.", dardosBoton: "🎯 ATIRAR!", cuentaTitulo: "👤 Minha conta (opcional)", cuentaInfo: "Sua carreira continua salva neste dispositivo. O Supabase gerencia seu e-mail, autenticação e apelido. Ao recarregar a página, você terá que entrar novamente.", cuentaEmail: "E-mail", cuentaPass: "Senha", cuentaAcepto1: "Li e aceito a", cuentaPrivacidadLink: "Política de privacidade (abre em outra aba)", cuentaAcepto2: "para criar minha conta.", cuentaAyuda: "Obrigatório apenas no cadastro. Usamos o e-mail e a autenticação para gerenciar sua conta e o apelido do seu perfil. Esta aceitação não autoriza publicidade nem medição opcional.", cuentaLogin: "Entrar", cuentaCrear: "Criar conta", cuentaRegistroAyuda: "Para se cadastrar, use pelo menos 8 caracteres. Confirme o e-mail recebido antes de entrar.", cuentaApodo: "Apelido do perfil", cuentaGuardarApodo: "Salvar apelido", cuentaLeerPerfil: "Ler perfil novamente", cuentaSalir: "Sair da conta", btnEntendido: "Entendi", btnRechazar: "Recusar", btnAceptar: "Aceitar", btnContinuar: "Continuar", btnCerrar: "Fechar", btnEntendido2: "Entendi!", mercadoTitulo: "Mercado de transferências", penalTitulo: "⚽ FINAL DRAMÁTICA!", penalTexto: "A partida está empatada. O pênalti para decidir o título está nos seus pés.", minijuegoIndicacion: "Siga a instrução deste minijogo:", tiempoRestante: "Tempo restante:", ssTitulo: "🔍 REVISÃO AO VIVO (SS)", ssTexto: "Verificando pastas e arquivos suspeitos...", rolDesbloqueado: "🔓 FUNÇÃO DESBLOQUEADA", avisoMinijuego: "Você já jogou o minijogo desta temporada. Só é possível jogar 1 minijogo por temporada, além do treinamento por atributos. Avance para a próxima temporada para jogar outro."
  }
};

Object.assign(TEXTOS_UI.es, {
  eventoRechazar: "Rechazar", eventoAceptar: "Aceptar", partidoTitulo: "⚽ Partido Especial Detectado", partidoTexto: "Se presenta un momento clave en la temporada. ¿Cómo querés resolverlo?", jugarMomentos: "⚽ JUGAR MOMENTOS CLAVE", simularPartido: "🎲 SIMULAR PARTIDO", tiroLibreTitulo: "🎯 Tiro Libre de Precisión", tiroLibreIndicacion: "Presiona ¡DISPARAR! cuando la barra esté en el centro.", tiroLibreBoton: "¡DISPARAR!", peleaIndicacion: "¡Presioná ESPACIO (o hacé clic) rapidísimo para defenderte!", redesTitulo: "📱 Redes Sociales", redesVacio: "Todavía no hay declaraciones sobre tu carrera.", redesResponde: "responde", viralidad: "viralidad", logrosTitulo: "🏅 Logros", logroCompletado: "✅ Completado", logroPendiente: "⬜ Pendiente", entrenarAtributos: "🏋️ Entrenar Atributos", entrenamientoTitulo: "🏋️ Centro de Entrenamiento", entrenamientoElige: "Elegí un atributo para entrenar esta temporada. Verás el progreso antes y después.", entrenamientoAgotado: "Ya entrenaste en esta temporada. Avanzá a la próxima para volver a entrenar.", entrenamientoFallido: "Práctica sin frutos hoy. El atributo no subió, pero la sesión quedó usada.", entrenamientoTecho: "Este atributo ya llegó a su tope del club actual.", atributoOVR: "OVR", cuentaPrivacidadError: "Para crear la cuenta, leé y aceptá la Política de privacidad.", cuentaConectando: "Conectando…", cuentaRegistroOk: "Solicitud enviada. Si corresponde crear la cuenta, recibirás un correo de confirmación.", cuentaSesionOk: "Sesión iniciada.", cuentaPerfilOk: "Apodo guardado y verificado.", cuentaSesionCerrada: "Sesión cerrada. Tu carrera local no cambió.", cuentaError429: "Demasiados intentos. Esperá unos minutos antes de reintentar.", cuentaErrorAuth: "No se autorizó la operación. Revisá tu sesión y la confirmación del correo.", cuentaErrorGeneral: "No se pudo completar la operación. Revisá los datos o intentá más tarde.", cuentaErrorConexion: "No se pudo conectar con las cuentas. Revisá internet e intentá otra vez.", cuentaErrorSesion: "El servidor no devolvió una sesión válida.", cuentaErrorIniciar: "Iniciá sesión para usar tu perfil.", cuentaErrorCambio: "La sesión cambió. Iniciá sesión otra vez.", cuentaErrorCredenciales: "Completá correo y contraseña.", cuentaErrorPassword: "Usá una contraseña de al menos 8 caracteres.", cuentaErrorCancelado: "Se canceló el inicio de sesión.", cuentaErrorApodo: "El apodo debe tener entre 2 y 30 caracteres.", cuentaErrorReintentar: "La sesión cambió. Reintentá."
});
Object.assign(TEXTOS_UI.es, {
  navCarrera: "Carrera", navEntrenamiento: "Entrenamiento", navProgreso: "Progreso", navComunidad: "Comunidad",
  otrosModos: "Otros modos",
  miPerfil: "Perfil", miJugador: "Mi jugador", misCarreras: "Mis carreras", configTitulo: "⚙️ Configuración", configIdioma: "🌐 Idioma",
  proximoPartido: "⚽ Próximo partido", jugarPartido: "JUGAR PARTIDO", resumenTemporada: "📊 Resumen de temporada",
  calendario: "Calendario", noticiasCarrera: "📰 Noticias de tu carrera", mercadoPases: "Mercado", verHistorial: "Resultados de tu carrera por temporada.", verHistorialBtn: "Ver historial completo",
  primeraDivision: "Primera División", segundaDivision: "Segunda División", sinDatos: "Sin datos todavía.", proximoRival: "Rival", tuClub: "Tu club",
  misAtributos: "📈 Mis atributos", atributosAyuda: "Presioná un atributo para abrir el centro de entrenamiento. Cada sesión sube un atributo y puede aumentar tu OVR.",
  partidoResumen: "Cada temporada simulás la campaña de tu club según tu posición, media y reputación del club. Podés resolver momentos clave, penales decisivos y tiros libres cuando el partido lo pida.",
  tabMomentos: "Momentos clave", tabPenales: "Penales", tabLibres: "Tiros libres", tabEspeciales: "Partidos especiales",
  momentosTexto: "Durante la temporada te llegan momentos clave (finalizaciones, definiciones y partidos especiales) listos para jugar y sumar bonus de goles y títulos.",
  penalesTexto: "Las tandas de penales deciden finales y ascensos. Juegalas para intentar la gloria.",
  tiroLibreTexto: "El tiro libre de precisión también suma OVR y decide jugadas clave de la temporada.",
  especialesTexto: "En partidos especiales podés elegir jugar los últimos momentos o simularlo y aceptar el resultado.",
  abrirTanda: "Jugar tanda de penales", abrirTiroLibre: "Jugar tiro libre",
  rankingAbre: "Abrir ranking", dueloAbre: "Entrar a 1v1",
  cuentaInfoCorta: "Creá una cuenta opcional (Supabase) para guardar tu perfil y nickname.", sinSesion: "No hay sesión iniciada. Iniciá sesión desde la pantalla de inicio.",
  evolucion: "📈 Evolución", temporadas: "🗓 Temporadas", marcaOVR: "Media por temporada", titulosGanados: "Títulos ganados",
  totalCarrera: "Total carrera", ovrSubida: "OVR subido", ovrSubio: "¡OVR subió!",
  cuentaBoton: "🔐 Cuenta", temporadaActual: "Temporada", jugar: "Jugar", momentosClave: "Momentos clave", penales: "Penales", tirosLibres: "Tiros libres", partidosEspeciales: "Partidos especiales", tandaPenales: "Tanda de Penales", idioma: "🌐 Idioma", modoOscuro: "🌙 Modo oscuro", temporadaTitulo: "🏁 Temporada actual", partidosPorTemporada: "Partidos por temporada",
  sinNoticiasTitulo: "Sin novedades todavía", sinNoticiasTexto: "Simulá tu primera temporada para que comience la actividad de tu carrera.", entrenoAyuda: "Elegí una sesión por atributo o un minijuego para la temporada.", proximoRivalDetalle: "Rival probable según la reputación de tu club",
  partidoXDeY: "Partido {n} de {t}", partidosPendientes: "Partidos pendientes", partidoCompletado: "Partido completado", faltanPartidos: "Te quedan {n} por jugar"
});
Object.assign(TEXTOS_UI.es, {
  tuNacionalidad: "🌍 Tu nacionalidad",
  seleccionNacional: "Selección:",
  internacionalTitulo: "🌍 Internacional",
  selConvocado: "Convocado",
  selNoConvocado: "Todavía no convocado",
  selPartidos: "Partidos",
  selGoles: "Goles",
  selCapitan: "Capitán",
  fechaFifaTitulo: "🌍 Fecha FIFA",
  fechaFifaPartido: "Jugaste con {seleccion} contra {rival}: {ptsSel}-{ptsRival}. Vos marcaste {goles} gol(es).",
  convConvocado: "¡Convocado a {seleccion}! Vas a jugar Fechas FIFA esta temporada.",
  convCapitana: "¡Elegido capitán de {seleccion}!",
  selTorneo: "Torneo:",
  btnJugarTorneo: "Jugar torneo",
  torneoIntro: "El {torneo} está en marcha: vas a jugarlo con tu selección desde la tarjeta Internacional. Coordinás cada partido (jugás o simulás) y el resto se define en el torneo.",
  torneoComoJugar: "¿Cómo jugás tu próximo partido del {torneo}?",
  torneoJugar: "Jugar (interactivo)",
  torneoSimular: "Simular",
  torneoResultado: "{seleccion} {pa} - {pb} {rival}. Marcaste {goles} gol(es).",
  torneoClasificado: "¡Clasificaste a {fase}!",
  torneoEliminado: "Quedaste afuera del {torneo} en {fase}.",
  torneoCampeon: "¡Campeones del {torneo}! 🏆",
  torneoFaseGrupos: "Fase de grupos",
  torneoFaseOctavos: "Octavos de final",
  torneoFaseCuartos: "Cuartos de final",
  torneoFaseSemis: "Semifinal",
  torneoFaseFinal: "Final",
  torneoMundial: "Mundial",
  torneoCopaAmerica: "Copa América",
  torneoEuro: "Eurocopa",
  torneoFinalissima: "Finalissima",
  nacionalidadAyuda: "Elegí tu selección: si rendís, podés ser convocado a los torneos internacionales.",
  rankColSeleccion: "🇺🇳 Selección",
  confAFC: "AFC", confCAF: "CAF", confCONCACAF: "Concacaf", confCONMEBOL: "CONMEBOL", confOFC: "OFC", confUEFA: "UEFA"
});
Object.assign(TEXTOS_UI.en, {
  eventoRechazar: "Reject", eventoAceptar: "Accept", partidoTitulo: "⚽ Special Match Detected", partidoTexto: "A key moment appears in the season. How do you want to resolve it?", jugarMomentos: "⚽ PLAY KEY MOMENTS", simularPartido: "🎲 SIMULATE MATCH", tiroLibreTitulo: "🎯 Precision Free Kick", tiroLibreIndicacion: "Press SHOOT when the bar is in the center.", tiroLibreBoton: "SHOOT!", peleaIndicacion: "Press SPACE (or click) as fast as you can to defend yourself!", redesTitulo: "📱 Social Media", redesVacio: "There are no statements about your career yet.", redesResponde: "replies", viralidad: "virality", logrosTitulo: "🏅 Achievements", logroCompletado: "✅ Completed", logroPendiente: "⬜ Pending", entrenarAtributos: "🏋️ Train Attributes", entrenamientoTitulo: "🏋️ Training Center", entrenamientoElige: "Choose an attribute to train this season. You will see the progress before and after.", entrenamientoAgotado: "You already trained this season. Move on to the next one to train again.", entrenamientoFallido: "No progress today. The attribute did not improve, but the session was used.", entrenamientoTecho: "This attribute has reached your current club's ceiling.", atributoOVR: "OVR", cuentaPrivacidadError: "To create the account, read and accept the Privacy Policy.", cuentaConectando: "Connecting…", cuentaRegistroOk: "Request sent. If the account can be created, you will receive a confirmation email.", cuentaSesionOk: "Signed in.", cuentaPerfilOk: "Nickname saved and verified.", cuentaSesionCerrada: "Signed out. Your local career was not changed.", cuentaError429: "Too many attempts. Wait a few minutes before trying again.", cuentaErrorAuth: "The operation was not authorized. Check your session and email confirmation.", cuentaErrorGeneral: "The operation could not be completed. Check the data and try again later.", cuentaErrorConexion: "Could not connect to accounts. Check your internet and try again.", cuentaErrorSesion: "The server did not return a valid session.", cuentaErrorIniciar: "Sign in to use your profile.", cuentaErrorCambio: "The session changed. Sign in again.", cuentaErrorCredenciales: "Complete your email and password.", cuentaErrorPassword: "Use a password with at least 8 characters.", cuentaErrorCancelado: "Sign-in was canceled.", cuentaErrorApodo: "The nickname must be between 2 and 30 characters.", cuentaErrorReintentar: "The session changed. Try again."
});
Object.assign(TEXTOS_UI.en, {
  navCarrera: "Career", navEntrenamiento: "Training", navProgreso: "Progress", navComunidad: "Community",
  otrosModos: "Other modes",
  miPerfil: "Profile", miJugador: "My player", misCarreras: "My careers", configTitulo: "⚙️ Settings", configIdioma: "🌐 Language",
  proximoPartido: "⚽ Next match", jugarPartido: "PLAY MATCH", resumenTemporada: "📊 Season summary",
  calendario: "Calendar", noticiasCarrera: "📰 Career news", mercadoPases: "Market", verHistorial: "Your season results.", verHistorialBtn: "See full history",
  primeraDivision: "First Division", segundaDivision: "Second Division", sinDatos: "No data yet.", proximoRival: "Rival", tuClub: "Your club",
  misAtributos: "📈 My attributes", atributosAyuda: "Press an attribute to open the training center. Each session raises one attribute and can raise your OVR.",
  partidoResumen: "Each season you simulate your club's campaign based on your position, rating and club reputation. You can play key moments, decisive penalties and free kicks when the match demands it.",
  tabMomentos: "Key moments", tabPenales: "Penalties", tabLibres: "Free kicks", tabEspeciales: "Special matches",
  momentosTexto: "During the season key moments arrive (finishes, deciders and special matches) ready to play and earn goal and title bonuses.",
  penalesTexto: "Penalty shootouts decide finals and promotions. Play them to try to reach glory.",
  tiroLibreTexto: "The precision free kick also adds OVR and decides key plays of the season.",
  especialesTexto: "In special matches you can play the final moments or simulate and accept the result.",
  abrirTanda: "Play penalty shootout", abrirTiroLibre: "Play free kick",
  rankingAbre: "Open ranking", dueloAbre: "Join 1v1",
  cuentaInfoCorta: "Create an optional account (Supabase) to save your profile and nickname.", sinSesion: "No active session. Sign in from the start screen.",
  evolucion: "📈 Evolution", temporadas: "🗓 Seasons", marcaOVR: "Rating per season", titulosGanados: "Trophies won",
  totalCarrera: "Career total", ovrSubida: "OVR gained", ovrSubio: "OVR went up!",
  cuentaBoton: "🔐 Account", temporadaActual: "Season", jugar: "Play", momentosClave: "Key moments", penales: "Penalties", tirosLibres: "Free kicks", partidosEspeciales: "Special matches", tandaPenales: "Penalty Shootout", idioma: "🌐 Language", modoOscuro: "🌙 Dark mode", temporadaTitulo: "🏁 Current season", partidosPorTemporada: "Matches per season",
  sinNoticiasTitulo: "No news yet", sinNoticiasTexto: "Simulate your first season to start your career activity.", entrenoAyuda: "Pick an attribute session or a minigame for the season.", proximoRivalDetalle: "Likely rival based on your club's reputation",
  partidoXDeY: "Match {n} of {t}", partidosPendientes: "Pending matches", partidoCompletado: "Match complete", faltanPartidos: "{n} to go"
});
Object.assign(TEXTOS_UI.en, {
  tuNacionalidad: "🌍 Your nationality",
  seleccionNacional: "National team:",
  internacionalTitulo: "🌍 International",
  selConvocado: "Called up",
  selNoConvocado: "Not called up yet",
  selPartidos: "Caps",
  selGoles: "Goals",
  selCapitan: "Captain",
  fechaFifaTitulo: "🌍 International matchday",
  fechaFifaPartido: "You played for {seleccion} against {rival}: {ptsSel}-{ptsRival}. You scored {goles} goal(s).",
  convConvocado: "Called up to {seleccion}! You will play international matchdays this season.",
  convCapitana: "Named captain of {seleccion}!",
  selTorneo: "Tournament:",
  btnJugarTorneo: "Play tournament",
  torneoIntro: "The {torneo} is on: you will play it with your national team from the International card. You run each match (play or simulate) and the rest plays out in the tournament.",
  torneoComoJugar: "How do you play your next {torneo} match?",
  torneoJugar: "Play (interactive)",
  torneoSimular: "Simulate",
  torneoResultado: "{seleccion} {pa} - {pb} {rival}. You scored {goles} goal(s).",
  torneoClasificado: "Qualified to {fase}!",
  torneoEliminado: "Eliminated from the {torneo} in the {fase}.",
  torneoCampeon: "{torneo} champions! 🏆",
  torneoFaseGrupos: "Group stage",
  torneoFaseOctavos: "Round of 16",
  torneoFaseCuartos: "Quarter-finals",
  torneoFaseSemis: "Semi-final",
  torneoFaseFinal: "Final",
  torneoMundial: "World Cup",
  torneoCopaAmerica: "Copa America",
  torneoEuro: "European Championship",
  torneoFinalissima: "Finalissima",
  nacionalidadAyuda: "Pick your national team: perform well and you can earn international call-ups.",
  rankColSeleccion: "🇺🇳 Team",
  confAFC: "AFC", confCAF: "CAF", confCONCACAF: "CONCACAF", confCONMEBOL: "CONMEBOL", confOFC: "OFC", confUEFA: "UEFA"
});
Object.assign(TEXTOS_UI.pt, {
  eventoRechazar: "Recusar", eventoAceptar: "Aceitar", partidoTitulo: "⚽ Partida especial detectada", partidoTexto: "Surge um momento decisivo na temporada. Como você quer resolvê-lo?", jugarMomentos: "⚽ JOGAR MOMENTOS DECISIVOS", simularPartido: "🎲 SIMULAR PARTIDA", tiroLibreTitulo: "🎯 Cobrança de falta precisa", tiroLibreIndicacion: "Pressione CHUTAR quando a barra estiver no centro.", tiroLibreBoton: "CHUTAR!", peleaIndicacion: "Pressione ESPAÇO (ou clique) o mais rápido possível para se defender!", redesTitulo: "📱 Redes sociais", redesVacio: "Ainda não há declarações sobre a sua carreira.", redesResponde: "responde", viralidad: "viralidade", logrosTitulo: "🏅 Conquistas", logroCompletado: "✅ Concluído", logroPendiente: "⬜ Pendente", entrenarAtributos: "🏋️ Treinar Atributos", entrenamientoTitulo: "🏋️ Centro de Treinamento", entrenamientoElige: "Escolha um atributo para treinar nesta temporada. Você verá o progresso antes e depois.", entrenamientoAgotado: "Você já treinou nesta temporada. Avance para a próxima para treinar de novo.", entrenamientoFallido: "Sem frutos hoje. O atributo não subiu, mas a sessão foi usada.", entrenamientoTecho: "Este atributo já chegou ao teto do seu clube atual.", atributoOVR: "OVR", cuentaPrivacidadError: "Para criar a conta, leia e aceite a Política de privacidade.", cuentaConectando: "Conectando…", cuentaRegistroOk: "Solicitação enviada. Se a conta puder ser criada, você receberá um e-mail de confirmação.", cuentaSesionOk: "Sessão iniciada.", cuentaPerfilOk: "Apelido salvo e verificado.", cuentaSesionCerrada: "Sessão encerrada. Sua carreira local não foi alterada.", cuentaError429: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.", cuentaErrorAuth: "A operação não foi autorizada. Verifique sua sessão e a confirmação do e-mail.", cuentaErrorGeneral: "Não foi possível concluir a operação. Verifique os dados e tente novamente mais tarde.", cuentaErrorConexion: "Não foi possível conectar às contas. Verifique a internet e tente novamente.", cuentaErrorSesion: "O servidor não retornou uma sessão válida.", cuentaErrorIniciar: "Entre na sua conta para usar o perfil.", cuentaErrorCambio: "A sessão mudou. Entre novamente.", cuentaErrorCredenciales: "Preencha o e-mail e a senha.", cuentaErrorPassword: "Use uma senha com pelo menos 8 caracteres.", cuentaErrorCancelado: "A entrada foi cancelada.", cuentaErrorApodo: "O apelido deve ter entre 2 e 30 caracteres.", cuentaErrorReintentar: "A sessão mudou. Tente novamente."
});
Object.assign(TEXTOS_UI.pt, {
  navCarrera: "Carreira", navEntrenamiento: "Treino", navProgreso: "Progresso", navComunidad: "Comunidade",
  otrosModos: "Outros modos",
  miPerfil: "Perfil", miJugador: "Meu jogador", misCarreras: "Minhas carreiras", configTitulo: "⚙️ Configurações", configIdioma: "🌐 Idioma",
  proximoPartido: "⚽ Próxima partida", jugarPartido: "JOGAR PARTIDA", resumenTemporada: "📊 Resumo da temporada",
  calendario: "Calendário", noticiasCarrera: "📰 Notícias da carreira", mercadoPases: "Mercado", verHistorial: "Seus resultados por temporada.", verHistorialBtn: "Ver histórico completo",
  primeraDivision: "Primeira Divisão", segundaDivision: "Segunda Divisão", sinDatos: "Sem dados ainda.", proximoRival: "Adversário", tuClub: "Seu clube",
  misAtributos: "📈 Meus atributos", atributosAyuda: "Pressione um atributo para abrir o centro de treinamento. Cada sessão aumenta um atributo e pode aumentar seu OVR.",
  partidoResumen: "Cada temporada você simula a campanha do seu clube conforme posição, média e reputação do clube. Você pode resolver momentos decisivos, pênaltis e cobranças de falta quando a partida pedir.",
  tabMomentos: "Momentos decisivos", tabPenales: "Pênaltis", tabLibres: "Faltas", tabEspeciales: "Partidas especiais",
  momentosTexto: "Durante a temporada chegam momentos decisivos (finalizações, definições e partidas especiais) prontos para jogar e ganhar bônus de gols e títulos.",
  penalesTexto: "As disputas de pênaltis decidem finais e acessos. Jogue para tentar a glória.",
  tiroLibreTexto: "A cobrança de falta precisa também soma OVR e decide jogadas-chave da temporada.",
  especialesTexto: "Em partidas especiais você pode jogar os últimos momentos ou simular e aceitar o resultado.",
  abrirTanda: "Jogar disputa de pênaltis", abrirTiroLibre: "Jogar cobrança de falta",
  rankingAbre: "Abrir ranking", dueloAbre: "Entrar no 1v1",
  cuentaInfoCorta: "Crie uma conta opcional (Supabase) para salvar seu perfil e apelido.", sinSesion: "Nenhuma sessão ativa. Faça login na tela inicial.",
  evolucion: "📈 Evolução", temporadas: "🗓 Temporadas", marcaOVR: "Média por temporada", titulosGanados: "Títulos ganhos",
  totalCarrera: "Total da carreira", ovrSubida: "OVR ganho", ovrSubio: "OVR subiu!",
  cuentaBoton: "🔐 Conta", temporadaActual: "Temporada", jugar: "Jogar", momentosClave: "Momentos decisivos", penales: "Pênaltis", tirosLibres: "Faltas", partidosEspeciales: "Partidas especiais", tandaPenales: "Disputa de pênaltis", idioma: "🌐 Idioma", modoOscuro: "🌙 Modo escuro", temporadaTitulo: "🏁 Temporada atual", partidosPorTemporada: "Partidas por temporada",
  sinNoticiasTitulo: "Sem novidades ainda", sinNoticiasTexto: "Simule sua primeira temporada para começar a atividade da sua carreira.", entrenoAyuda: "Escolha uma sessão por atributo ou um minijogo para a temporada.", proximoRivalDetalle: "Adversário provável segundo a reputação do seu clube",
  partidoXDeY: "Partida {n} de {t}", partidosPendientes: "Partidas pendentes", partidoCompletado: "Partida concluída", faltanPartidos: "Faltam {n}"
});
Object.assign(TEXTOS_UI.pt, {
  tuNacionalidad: "🌍 Sua nacionalidade",
  seleccionNacional: "Seleção:",
  internacionalTitulo: "🌍 Internacional",
  selConvocado: "Convocado",
  selNoConvocado: "Ainda não convocado",
  selPartidos: "Partidas",
  selGoles: "Gols",
  selCapitan: "Capitão",
  fechaFifaTitulo: "🌍 Data FIFA",
  fechaFifaPartido: "Você jogou pela {seleccion} contra {rival}: {ptsSel}-{ptsRival}. Você marcou {goles} gol(ns).",
  convConvocado: "Convocado pela {seleccion}! Você vai jogar as datas FIFA nesta temporada.",
  convCapitana: "Eleito capitão da {seleccion}!",
  selTorneo: "Torneio:",
  btnJugarTorneo: "Jogar torneio",
  torneoIntro: "O {torneo} começou: você vai jogá-lo com sua seleção pelo cartão Internacional. Você conduz cada partida (joga ou simula) e o resto se resolve no torneio.",
  torneoComoJugar: "Como você joga a próxima partida do {torneo}?",
  torneoJugar: "Jogar (interativo)",
  torneoSimular: "Simular",
  torneoResultado: "{seleccion} {pa} - {pb} {rival}. Você marcou {goles} gol(ns).",
  torneoClasificado: "Classificado para {fase}!",
  torneoEliminado: "Eliminado do {torneo} na {fase}.",
  torneoCampeon: "Campeões do {torneo}! 🏆",
  torneoFaseGrupos: "Fase de grupos",
  torneoFaseOctavos: "Oitavas de final",
  torneoFaseCuartos: "Quartas de final",
  torneoFaseSemis: "Semifinal",
  torneoFaseFinal: "Final",
  torneoMundial: "Mundial",
  torneoCopaAmerica: "Copa América",
  torneoEuro: "Eurocopa",
  torneoFinalissima: "Finalissima",
  nacionalidadAyuda: "Escolha sua seleção: se render, você pode ser convocado para os torneios internacionais.",
  rankColSeleccion: "🇺🇳 Seleção",
  confAFC: "AFC", confCAF: "CAF", confCONCACAF: "Concacaf", confCONMEBOL: "CONMEBOL", confOFC: "OFC", confUEFA: "UEFA"
});

// 6b. CALIDAD VISUAL (cuadro que se pregunta al entrar)
// "Alta"  = juego base tal cual (todas las animaciones y efectos).
// "Baja"  = apaga animaciones, cinematica y capas pesadas del fondo
//           (moviles o PCs poco potentes). El juego sigue jugable.
Object.assign(TEXTOS_UI.es, {
  calidadTitulo: "CALIDAD?",
  calidadIntro: "Elegí cómo querés ver el juego. Podés cambiarlo cuando quieras desde Configuración.",
  calidadAlta: "Alta (Recomendado)",
  calidadAltaDetalle: "Mantiene todas las animaciones, transiciones, textos y el diseño completo.",
  calidadBaja: "Baja (Recomendado para móviles o PCs poco potentes)",
  calidadBajaDetalle: "Apaga animaciones y efectos pesados. El juego sigue 100% jugable.",
  calidadNoPreguntar: "No volver a preguntar (se cambia en Configuración)",
  calidadEtiqueta: "🎚️ Calidad visual",
  calidadPreguntar: "🎬 Preguntar la calidad al entrar"
});
Object.assign(TEXTOS_UI.en, {
  calidadTitulo: "QUALITY?",
  calidadIntro: "Choose how you want to see the game. You can change it anytime in Settings.",
  calidadAlta: "High (Recommended)",
  calidadAltaDetalle: "Keeps all animations, transitions, texts and the full design.",
  calidadBaja: "Low (Recommended for phones or low-end PCs)",
  calidadBajaDetalle: "Turns off animations and heavy effects. The game stays 100% playable.",
  calidadNoPreguntar: "Don't ask again (change it in Settings)",
  calidadEtiqueta: "🎚️ Visual quality",
  calidadPreguntar: "🎬 Ask for quality on start"
});
Object.assign(TEXTOS_UI.pt, {
  calidadTitulo: "QUALIDADE?",
  calidadIntro: "Escolha como você quer ver o jogo. Pode mudar quando quiser em Configurações.",
  calidadAlta: "Alta (Recomendado)",
  calidadAltaDetalle: "Mantém todas as animações, transições, textos e o design completo.",
  calidadBaja: "Baixa (Recomendado para celulares ou PCs pouco potentes)",
  calidadBajaDetalle: "Desliga animações e efeitos pesados. O jogo continua 100% jogável.",
  calidadNoPreguntar: "Não perguntar de novo (muda em Configurações)",
  calidadEtiqueta: "🎚️ Qualidade visual",
  calidadPreguntar: "🎬 Perguntar a qualidade ao entrar"
});

// 6. CONFIGURACION GLOBAL (balance del juego centralizado)
const CONFIG = {
  OVR_MIN: 40,
  OVR_MAX: 99,
  EDAD_INICIO: 17,
  EDAD_DECLIVE: 31,
  EDAD_RETIRO: 36,
  UMBRAL_PRIMERA: 5,
  SANCION_LORO_TEMPORADAS: 3,
  PROB_LORO: 0.03,
  TEMPORADAS_ENTRE_EVENTOS: 1,
  ENTRENAMIENTOS_POR_TEMPORADA: 1,
  MINIJUEGOS_POR_TEMPORADA: 1,
  SIM: {
    PARTIDOS_BASE: 25,
    PARTIDOS_MIN: 12,
    PARTIDOS_MAX: 38,
    PARTIDOS_VARIACION: 5,
    FACTOR_MIN: 0.5,
    FACTOR_MAX: 1.6,
    PROB_PARTIDO_ESPECIAL: 0.08,
    PROB_MINIJUEGO_TITULO: 0.25,
    PROB_MINIJUEGO_DESCENSO: 0.30,
    PROB_FINAL_TORNEO: 0.30,
    PROB_CRUCE_CAMPEONES: 0.25
  },
  DOMINIOS:    { LARGO: 5, TIEMPO: 2.8, TICK_MS: 100, SUBIDA_OVR: 1 },
  TIRO_LIBRE:  { TICK_MS: 25, VELOCIDAD: 4, ZONA_MIN: 40, ZONA_MAX: 60, SUBIDA_OVR: 1 },
  BARRIDA:     { TICK_MS: 20, VELOCIDAD: 5, ZONA_MIN: 38, ZONA_MAX: 62, SUBIDA_OVR: 1 },
  GUANTES:     { SUBIDA_OVR: 1 },
  GAMBETA:     { PASOS: 3 },
  SCREENSHARE: { PROB_ATRAPADO: 0.20, BONUS: 5, PENALIZACION: 5 },
  TIMING: {
    RESULTADO_MINIJUEGO_MS: 1600,
    RESULTADO_SS_MS: 2200,
    AVISO_EVENTO_MS: 300
  }
};

// 7. VALIDACION DE DATOS (evita fallos silenciosos)
function validarDatos() {
  const errores = [];

  if (typeof CLUBES === "undefined" || !Array.isArray(CLUBES) || CLUBES.length === 0) {
    errores.push("CLUBES esta vacio o no esta definido.");
  } else {
    CLUBES.forEach((c, i) => {
      if (!c || typeof c.nombre !== "string" || typeof c.reputacion !== "number") {
        errores.push("Club invalido en el indice " + i + ".");
      }
    });
  }

  if (typeof ROLES === "undefined" || !Array.isArray(ROLES) || ROLES.length === 0) {
    errores.push("ROLES esta vacio o no esta definido.");
  }

  if (typeof REGLAS_MEDIA === "undefined" || REGLAS_MEDIA === null) {
    errores.push("REGLAS_MEDIA no esta definido.");
  }

  if (typeof CONFIG === "undefined") {
    errores.push("CONFIG no esta definido.");
  }

  if (typeof SELECCIONES === "undefined" || !Array.isArray(SELECCIONES) || SELECCIONES.length !== 211) {
    errores.push("SELECCIONES debe contener las 211 asociaciones FIFA (actual: " + (SELECCIONES ? SELECCIONES.length : 0) + ").");
  } else {
    const confeds = Object.keys(CONFEDERACIONES || {});
    const vistos = {};
    SELECCIONES.forEach(function (s, i) {
      if (!s || typeof s[0] !== "string" || typeof s[1] !== "string" || typeof s[2] !== "string") {
        errores.push("Seleccion invalida en el indice " + i + ".");
      } else {
        if (vistos[s[0]]) errores.push("Seleccion duplicada: " + s[0]);
        vistos[s[0]] = 1;
        if (confeds.indexOf(s[3]) === -1) errores.push("Confederacion invalida para " + s[0] + ": " + s[3]);
        if (typeof s[4] !== "number" || s[4] < 1 || s[4] > 100) errores.push("Fuerza fuera de rango para " + s[0]);
        if (typeof s[5] !== "number" || s[5] < 1 || s[5] > 211) errores.push("Ranking FIFA fuera de rango para " + s[0]);
      }
    });
  }

  return errores;
}

// 8. CONFIGURACION EXTENDIDA (nuevas mecanicas)
Object.assign(CONFIG, {
  // Moral / forma
  MORAL_MIN: 0,
  MORAL_MAX: 100,
  MORAL_INICIO: 60,
  MORAL_EFECTO: 0.15,
  // V3: la moral pesa MUCHO más en la simulación de temporada (±6 OVR en extremos)
  MORAL_EFECTO_TEMPORADA: 0.12,

  // Mercado con rivales
  PROB_PUJA_RIVAL: 0.35,

  // Slots de guardado
  SLOTS: 3,

  // Minijuegos nuevos
  REGATE:    { PASOS: 6, TIEMPO_POR_PASO: 1.2, SUBIDA_OVR: 1 },
  PASE:      { TICK_MS: 20, VELOCIDAD: 3, ZONA: 18, SUBIDA_OVR: 1 },
  CABEZAZO:  { TIEMPO_MS: 2500, SUBIDA_OVR: 1 },
  UNO_VS_UNO: { SUBIDA_OVR: 2 },

  // Eventos V3: minijuegos de eventos sociales
  VIAJE:     { LARGO: 8, TIEMPO: 6.0, TICK_MS: 100 },
  RESISTENCIA: { DURACION: 6.0, TICK_MS: 100, INICIO: 50, DRAIN_POR_TICK: 4.0, DRAIN_RETEN: 0.08, SUBIDA_POR_PULSO: 14 },
  ZONA_EVENTO: { TICK_MS: 30, VELOCIDAD: 3, NORMAL: { ZONA_MIN: 40, ZONA_MAX: 60 }, REDUCIDA: { ZONA_MIN: 43, ZONA_MAX: 57 } },
  // Dardos con los Pibes: péndulo con anillos de puntaje (relax, sin castigo fuerte)
  DARTS: {
    PERIODO_MS: 3000,        // ida y vuelta completa del indicador
    TIROS: 3,
    ESPERA_ENTRE_TIROS_MS: 900,
    PUNTAJE_MORAL: 40,       // umbral para el bonus de moral
    MORAL_BONUS: 5,
    ANILLOS: [
      { hasta: 0.14, puntos: 50 },
      { hasta: 0.30, puntos: 25 },
      { hasta: 0.62, puntos: 10 },
      { hasta: 1.00, puntos: 5 }
    ]
  },
  ATRIBUTOS_FISICOS: { DEL: ["VEL", "RES"], CM: ["VEL", "RES"], DEF: ["VEL", "RES"], GK: ["REF", "MAN"] },

  // Evento "Acusado de cheats": probabilidad MUY baja por chequeo y
  // solo puede ocurrir UNA VEZ en toda la partida.
  PROB_EVENTO_ACUSADO: 0.03,
  PROB_ACUSADO_ATRAPADO: 0.45,

  // Temporada minima para la intervencion de Loro (no aparece al
  // iniciar la partida).
  TEMPORADA_MINIMA_LORO: 3,

  // Duelo 1v1 Online (Carrera PSO V2)
  DUELO: {
    TEMPORADAS: 10,
    TIMER_MS: 10000,
TANDA_PENALES: 3,
    BONUS_OVR_CLASICO: 1,
    BONUS_MORAL_CLASICO: 20,
    PUNTOS_RIVALIDAD_CLASICO: 150,
    // Edad de arranque del duelista. Con 10 temporadas, 22 llega a 32
    // (activa la mecánica de +31); subila para verla antes.
    EDAD_INICIO: 22
  },

  // Cooperativo Online "Dupla de Carreras" (2 jugadores, mismo club y misma
  // selección, decisiones comparadas a ciegas). Ver coop.js.
  COOP: {
    // Cantidad de temporadas del proyecto de la dupla.
    TEMPORADAS: 8,
    // Tiempo máximo para decidir cada táctica (si no, decide el tiempo).
    TIMER_MS: 10000,
    // Edad de arranque de ambos integrantes de la dupla.
    EDAD_INICIO: 22,
    // Opciones tácticas de los partidos compartidos de la selección.
    TACTICAS: ["A", "B", "C"],
    // Meta del proyecto compartido: goles de selección mínimos por temporada.
    META_GOLES_INT_POR_TEMP: 2,
    // Trofeos de club mínimos para cumplir la meta.
    META_TROFEOS_MIN: 2
  },

  // ============ NUEVAS MEC�NICAS ============

  // Partido interactivo (momentos clave)
  PARTIDO_INTERACTIVO: {
    PROB_PARTIDO: 0.10,
    PROB_MOMENTO: 0.35,
    MOMENTOS_MIN: 1,
    MOMENTOS_MAX: 2
  },

  // "Ha nacido una promesa" - jugador especial al inicio
  PROMESA: {
    PROB: 0.04,
    OVR_INICIAL: 70,
    REPUTACION_MIN: 7
  },

  // Redes sociales
  REDES: {
    PROB_DECLARACION: 0.40,
    MAX_DECLARACIONES_FEED: 10,
    PROB_RESPUESTA: 0.30,
    MAX_RESPUESTAS: 3
  },

  // Rivalidades entre clubes
  RIVALIDADES: {
    PROB_DECLARACION_RIVAL: 0.50,
    FORTALEZA_MINIMA: 5
  },

  // ============ SISTEMA DE PROGRESION (atributos -> OVR) ============
  // ENTRENAMIENTO = el jugador elige el atributo y ve su progreso.
  // EVENTO = el juego decide como progresa y el usuario solo ve MEDIA.
  PROGRESION: {
    OVR_INICIAL_NORMAL: 65,
    OVR_INICIAL_PROMESA: 75,
    ATR_MIN: 20,
    ATR_MAX: 99,
    // Progresion base del entrenamiento: +1 (72%), +2 (22%), +3 (6%)
    // (antes +1 60% / +2 30% / +3 10%: ahora es mas dificil conseguir +2/+3)
    PROB_SUBIDA: [0.72, 0.22, 0.06],
    // Penalidad de progresion segun el valor actual del atributo.
    // Pisos mas bajos y factores mas duros: cuesta mucho subir de 60 en adelante.
    DIFICULTAD_RANGOS: [
      { hasta: 59, factor: 1.0 },
      { hasta: 69, factor: 0.85 },
      { hasta: 79, factor: 0.70 },
      { hasta: 89, factor: 0.50 },
      { hasta: 94, factor: 0.30 },
      { hasta: 98, factor: 0.15 }
    ],
    // Atributos de campo (6) y de arquero (6), escala 0-99
    ATRIBUTOS_CAMPO: ["VEL", "PAS", "REM", "DEF", "REG", "RES"],
    ATRIBUTOS_ARQUERO: ["REF", "PAS", "DEF", "REG", "MAN", "SAL"],
    NOMBRES_ATRIBUTOS: {
      VEL: "Velocidad", PAS: "Pase", REM: "Remate", DEF: "Defensa",
      REG: "Regate", RES: "Resistencia", REF: "Reflejos",
      MAN: "Mano a Mano", SAL: "Salidas"
    },
    // OVR = media ponderada segun la posicion (los pesos suman 1)
    PESOS: {
      DEL: { VEL: 0.15, PAS: 0.15, REM: 0.30, DEF: 0.10, REG: 0.20, RES: 0.10 },
      CM:  { VEL: 0.15, PAS: 0.25, REM: 0.20, DEF: 0.10, REG: 0.20, RES: 0.10 },
      DEF: { VEL: 0.12, PAS: 0.15, REM: 0.08, DEF: 0.30, REG: 0.15, RES: 0.20 },
      GK:  { REF: 0.25, PAS: 0.15, DEF: 0.25, REG: 0.10, MAN: 0.15, SAL: 0.10 }
    },
    // Valores base por posicion (OVR resultante ~ 65)
    BASE: {
      DEL: { VEL: 62, PAS: 60, REM: 70, DEF: 58, REG: 68, RES: 62 },
      CM:  { VEL: 60, PAS: 70, REM: 62, DEF: 58, REG: 68, RES: 62 },
      DEF: { VEL: 60, PAS: 62, REM: 55, DEF: 72, REG: 60, RES: 68 },
      GK:  { REF: 68, PAS: 58, DEF: 68, REG: 56, MAN: 68, SAL: 60 }
    },
    // Puntos de Partido / Decision: costos configurables
    COSTOS_PP: {
      RECUPERACION: 3,       // recuperar moral/fisico
      ENTRENO_EXTRA: 5,      // entrenamiento adicional en la temporada
      PROTECCION_EVENTO: 4,  // anula la proxima penalidad de evento
      BONUS_TEMPORAL: 6      // bonus de moral por la temporada
    },
    COSTOS_PD: {
      SESION_ESPECIAL: 2     // decision especial del entrenador
    }
  },

  // ============ CONVOCATORIAS INTERNACIONALES ============
  // El jugador es convocado a su selección según su OVR: desde 70 juega
  // Fechas FIFA durante la temporada y desde 84 además es capitán.
  SELECCION: {
    UMBRAL_CONVOCATORIA: 70,
    UMBRAL_CAPITAN: 84,
    // Campeonatos internacionales (ciclo de 4 temporadas):
    //   resto 1 -> continental (Copa América / Eurocopa)
    //   resto 2 -> Finalissima (solo si salió campeón continental) + descanso
    //   resto 3 -> Mundial
    //   resto 0 -> descanso / clasificatorias
    CICLO: 4,
    ANIO_CONTINENTAL: 1,
    ANIO_FINALISSIMA: 2,
    ANIO_MUNDIAL: 3,
    MUNDIAL_EQUIPOS: 32,
    CONTINENTAL_EQUIPOS: 16,
    GRUPOS: 4
  }
});

// 14. OFERTAS DE EQUIPOS: rango de reputacion coherente con la media/OVR.
// Reglas de coherencia (V2):
//   hasta 69  -> rep 1 a 4
//   70 a 74   -> rep 4 a 6
//   75 a 80   -> rep 6 a 8
//   81 o mas  -> rep 8 a 10
// Fuera de esto solo se llega por eventos (cambios de club forzados).
function rangoReputacionPorMedia(media) {
  if (media < 70) return { min: 1, max: 4 };
  if (media < 75) return { min: 4, max: 6 };
  if (media <= 80) return { min: 6, max: 8 };
  return { min: 8, max: 10 };
}

// Edad a partir de la cual los equipos llaman de forma mas aleatoria
// (ya no siguen la coherencia de media/OVR).
const EDAD_OFERTAS_ALEATORIAS = 31;

function ofertasAleatoriasPorEdad(edad) {
  return edad > EDAD_OFERTAS_ALEATORIAS;
}

// Declive de media por edad: 31 = arranque suave, >31 se acentua.
function calcularDecliveEdad(edad) {
  if (edad > 31) return 2 + Math.floor((edad - 32) / 2);
  if (edad >= CONFIG.EDAD_DECLIVE) return Math.floor(Math.random() * 2) + 1;
  return 0;
}

// Arma las ofertas del mercado: renovacion + 2 clubes alternativos distintos.
// Nunca repite el club actual ni dos ofertas iguales. Si el pool queda vacio,
// completa con clubes del listado general.
// `permitido` filtra también ese relleno y `cuantos` fija cuántos alternativos
// se ofrecen (2 si hay renovación, 3 si no la hay): en sanciones/descensos la
// restricción es para el JUGADOR, así que el completado nunca puede devolver un
// club de Primera.
function armarTresOfertas(pool, clubActual, permitido, cuantos) {
  const actual = clubActual || null;
  const limite = typeof cuantos === "number" ? cuantos : 2;
  const candidatas = (pool || []).slice().concat(typeof CLUBES !== "undefined" ? CLUBES : []);
  const usados = [];
  for (let i = 0; i < candidatas.length && usados.length < limite; i++) {
    const c = candidatas[i];
    if (!c || !c.nombre) continue;
    if (permitido && !permitido(c)) continue;
    if (actual && c.nombre === actual.nombre) continue;
    if (usados.some(function(u) { return u.nombre === c.nombre; })) continue;
    usados.push(c);
  }
  const resultado = [];
  if (actual) resultado.push(actual);
  return resultado.concat(usados);
}

// 12. PRNG CON SEMILLA (modo desafío reproducible)
function crearPRNG(semilla) {
  let s = semilla >>> 0;
  return function() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function compararRanking(a, b) {
  const mediaA = Number(a && a.media != null ? a.media : 0);
  const mediaB = Number(b && b.media != null ? b.media : 0);
  if (mediaB !== mediaA) return mediaB - mediaA;

  const titA = Number(a && a.titulos != null ? a.titulos : 0);
  const titB = Number(b && b.titulos != null ? b.titulos : 0);
  if (titB !== titA) return titB - titA;

  const tsA = Number(a && a.ts != null ? a.ts : (a && a.anio != null ? a.anio : 0));
  const tsB = Number(b && b.ts != null ? b.ts : (b && b.anio != null ? b.anio : 0));
  if (tsB !== tsA) return tsB - tsA;

  return String(a && a.nombre ? a.nombre : "").localeCompare(String(b && b.nombre ? b.nombre : ""));
}

// 13. HELPER DE RANDOM GLOBAL (usa PRNG si hay semilla activa)
let _randActivo = Math.random;
function rnd() { return _randActivo(); }

// ============================================================
//  14. CONVOCATORIAS INTERNACIONALES (lógica pura y testeable)
// ============================================================
// OVR actual del jugador: si tiene atributos y hay calcularOVR disponible
// (app.js) se deriva de ellos; si no, usa su media guardada.
function mediaActualJugador(jugador) {
  if (!jugador) return 0;
  if (jugador.atributos &&
      typeof window !== "undefined" && typeof window.calcularOVR === "function") {
    const calculado = window.calcularOVR(jugador.atributos, jugador.posicion);
    if (typeof calculado === "number" && !isNaN(calculado)) return calculado;
  }
  return Number(jugador.media) || 0;
}

// Evalúa la convocatoria según el OVR actual (con umbrales configurables).
function evaluarConvocatoria(jugador, mediaOverride) {
  const cfg = CONFIG.SELECCION || {};
  const media = typeof mediaOverride === "number"
    ? mediaOverride
    : mediaActualJugador(jugador);
  const umbralConvocatoria = cfg.UMBRAL_CONVOCATORIA || 70;
  const umbralCapitan = cfg.UMBRAL_CAPITAN || 84;
  return {
    convocado: media >= umbralConvocatoria,
    capitan: media >= umbralCapitan,
    media: media,
    umbralConvocatoria: umbralConvocatoria,
    umbralCapitan: umbralCapitan
  };
}

// Juega una Fecha FIFA de la selección del jugador contra un rival de su
// misma confederación. Devuelve el rival, el marcador, el rendimiento
// personal (goles) y el ajuste de moral (acotado).
function simularFechaFifa(jugador) {
  if (!jugador) return null;
  const s = seleccionPorCodigo(jugador.nacionalidad);
  if (!s) return null;
  const candidatos = seleccionesPorConfederacion(s.confederacion)
    .filter(function (f) { return f[0] !== s.codigo; });
  if (!candidatos.length) return null;
  const rival = candidatos[Math.floor(rnd() * candidatos.length)];
  const media = mediaActualJugador(jugador);
  // Ventaja del duelo: fuerza de su selección menos la del rival + aporte del jugador
  const ventaja = (s.fuerza - rival[4]) / 30 + (media - 70) / 60;
  const golesSel = Math.max(0, Math.round(1.4 + ventaja * 1.2 + (rnd() * 2 - 1)));
  const golesRiv = Math.max(0, Math.round(1.2 - ventaja * 0.9 + (rnd() * 2 - 1)));
  // Probabilidad de gol personal según la posición
  let prob = 0.03;
  if (jugador.posicion === "DEL") prob = 0.60;
  else if (jugador.posicion === "CM") prob = 0.32;
  else if (jugador.posicion === "DEF") prob = 0.08;
  let goles = 0;
  if (rnd() < prob) {
    goles = 1;
    if (jugador.posicion === "DEL" && rnd() < 0.20 && media >= 78) goles = 2;
  }
  if (goles > golesSel) goles = golesSel;
  let moralDelta = (goles > 0 ? 2 : -1) + (golesSel > golesRiv ? 2 : (golesSel === golesRiv ? 0 : -2));
  moralDelta = Math.max(-3, Math.min(4, moralDelta));
  return {
    seleccion: s.nombre,
    seleccionCodigo: s.codigo,
    confederacion: s.confederacion,
    rival: rival[1],
    rivalCodigo: rival[0],
    marcador: { seleccion: golesSel, rival: golesRiv },
    goles: goles,
    moral: moralDelta,
    victoria: golesSel > golesRiv
  };
}

// ============================================================
//  15. CAMPEONATOS INTERNACIONALES (lógica pura y testeable)
// ============================================================
// ¿Qué torneo corresponde a la temporada según la confederación?
// Ciclo de 4 temporadas: continental, Finalissima, Mundial, descanso.
function torneoDeTemporada(temporada, confederacion) {
  const c = CONFIG.SELECCION || {};
  const ciclo = c.CICLO || 4;
  const resto = (((Number(temporada) || 0) % ciclo) + ciclo) % ciclo;
  if (resto === (c.ANIO_CONTINENTAL || 1)) {
    if (confederacion === "CONMEBOL") return { tipo: "copaAmerica", anio: resto };
    if (confederacion === "UEFA") return { tipo: "euro", anio: resto };
    return null;
  }
  if (resto === (c.ANIO_MUNDIAL || 3)) return { tipo: "mundial", anio: resto };
  if (resto === (c.ANIO_FINALISSIMA || 2) &&
      (confederacion === "CONMEBOL" || confederacion === "UEFA")) {
    return { tipo: "finalissima", anio: resto };
  }
  return null;
}

// Equipos que participan de un torneo. La selección del jugador siempre
// clasifica (por su nivel), aunque quede fuera del corte por ranking.
function participantesDeTorneo(tipo, confederacion, selCodigo) {
  const c = CONFIG.SELECCION || {};
  let lista;
  if (tipo === "mundial") {
    lista = SELECCIONES.slice().sort(function (a, b) { return a[5] - b[5]; })
      .slice(0, c.MUNDIAL_EQUIPOS || 32).map(function (f) { return f[0]; });
  } else if (tipo === "copaAmerica") {
    lista = SELECCIONES.filter(function (f) { return f[3] === "CONMEBOL"; }).map(function (f) { return f[0]; })
      .concat(SELECCIONES.filter(function (f) { return f[3] === "CONCACAF"; })
        .sort(function (a, b) { return a[5] - b[5]; })
        .slice(0, 6).map(function (f) { return f[0]; }));
  } else if (tipo === "euro") {
    lista = SELECCIONES.filter(function (f) { return f[3] === "UEFA"; })
      .sort(function (a, b) { return a[5] - b[5]; })
      .slice(0, c.CONTINENTAL_EQUIPOS || 16).map(function (f) { return f[0]; });
  } else if (tipo === "finalissima") {
    return selCodigo ? [selCodigo] : null;
  } else {
    return null;
  }
  if (selCodigo && lista.indexOf(selCodigo) === -1) {
    lista.pop();
    lista.push(selCodigo);
  }
  return lista;
}

// Distribuye los equipos en grupos de a 4 (serpiente por ranking FIFA).
function armarGruposEquipos(codigos) {
  const c = CONFIG.SELECCION || {};
  const equiposPorGrupo = c.GRUPOS || 4;
  const cantGrupos = Math.max(1, Math.floor((codigos || []).length / equiposPorGrupo));
  const grupos = [];
  for (let i = 0; i < cantGrupos; i++) {
    grupos.push({ letra: String.fromCharCode(65 + i), equipos: [] });
  }
  (codigos || []).forEach(function (cod, i) {
    const fila = Math.floor(i / cantGrupos);
    const col = i % cantGrupos;
    const idx = (fila % 2 === 1) ? (cantGrupos - 1 - col) : col;
    grupos[idx].equipos.push(cod);
  });
  return grupos;
}

// Partido entre dos selecciones. Si se pasa el jugador, su OVR inclina la
// fuerza de su selección (media alta puede decidir un partido parejo).
function simularPartidoSeleccion(codA, codB, jugador) {
  const sA = seleccionPorCodigo(codA);
  const sB = seleccionPorCodigo(codB);
  if (!sA || !sB) return null;
  let delta = sA.fuerza - sB.fuerza;
  if (jugador && jugador.nacionalidad) {
    if (jugador.nacionalidad === codA) delta += (mediaActualJugador(jugador) - 70) * 0.6;
    else if (jugador.nacionalidad === codB) delta -= (mediaActualJugador(jugador) - 70) * 0.6;
  }
  const gA = Math.max(0, Math.round(1.3 + delta / 25 + (rnd() * 1.8 - 0.9)));
  const gB = Math.max(0, Math.round(1.3 - delta / 25 + (rnd() * 1.8 - 0.9)));
  return { a: codA, b: codB, golesA: gA, golesB: gB };
}

// Tabla de posiciones de un grupo a partir de los resultados.
// Devuelve la lista ordenada (puntos, diferencia, goles a favor).
function tablaGrupo(equipos, resultados) {
  const tabla = {};
  equipos.forEach(function (cod) {
    tabla[cod] = { pj: 0, gf: 0, gc: 0, pts: 0 };
  });
  equipos.forEach(function (cod, i) {
    equipos.slice(i + 1).forEach(function (cod2) {
      // Solo cuentan las filas con marcador: una fila sin ga/gb es un partido
      // todavia no disputado y no puede tapar el resultado de la misma pareja.
      const r = (resultados || []).find(function (x) {
        const par = (x.a === cod && x.b === cod2) || (x.a === cod2 && x.b === cod);
        return par && x.ga != null && x.gb != null;
      });
      if (!r || r.ga == null || r.gb == null) return;
      const ga = r.a === cod ? r.ga : r.gb;
      const gb = r.a === cod ? r.gb : r.ga;
      tabla[cod].pj++;
      tabla[cod2].pj++;
      tabla[cod].gf += ga; tabla[cod].gc += gb;
      tabla[cod2].gf += gb; tabla[cod2].gc += ga;
      if (ga > gb) tabla[cod].pts += 3;
      else if (ga < gb) tabla[cod2].pts += 3;
      else { tabla[cod].pts++; tabla[cod2].pts++; }
    });
  });
  return Object.keys(tabla).map(function (cod) {
    return { codigo: cod, pj: tabla[cod].pj, gf: tabla[cod].gf, gc: tabla[cod].gc, pts: tabla[cod].pts };
  }).sort(function (x, y) {
    if (y.pts !== x.pts) return y.pts - x.pts;
    const difX = x.gf - x.gc, difY = y.gf - y.gc;
    if (difY !== difX) return difY - difX;
    return y.gf - x.gf;
  });
}


