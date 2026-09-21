const CLUBES = [
    { nombre: "Agropecuario", reputacion: 7, imagen: "imagenes/agropecuario.png" },
    { nombre: "Alessandria", reputacion: 7, imagen: "imagenes/alessandria.png" },
    { nombre: "Alumni", reputacion: 2, imagen: "imagenes/alumni.png" },
    { nombre: "Aerolíneas Splinter", reputacion: 5, imagen: "imagenes/areolineasplinter.png" },
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
    { nombre: "POD", reputacion: 7, imagen: "imagenes/podfc.png" },
    { nombre: "Xheaston", reputacion: 5, imagen: "imagenes/xheaston.png" }
];

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
    iniciar: "Iniciar Carrera", continuar: "▶️ Continuar Carrera Guardada", modoDesafio: "🎲 Modo Desafío",
    ranking: "🏆 Ranking", slots: "💾 Slots", modoOscuroTitulo: "Modo oscuro", dueloBoton: "⚔️ 1v1 Online (Duelo)",
    edad: "Edad:", anios: "años", media: "Media:", club: "Club:", moral: "Moral:", acciones: "Acciones",
    entrenar: "Entrenar Tradicional", dominios: "⚽ Desafío Dominios", entrenamiento: "⚽ Entrenamiento",
    masMinijuegos: "🎮 Más Minijuegos", logros: "🏅 Logros", stats: "📊 Stats", sinEventos: "No hay eventos sociales esta temporada.",
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
    minijuegoIndicacion: "Seguí la indicación de este minijuego:", tiempoRestante: "Tiempo restante:", ssTitulo: "🔍 REVISIÓN EN VIVO (SS)", ssTexto: "Revisando carpetas y archivos sospechosos...",
    rolDesbloqueado: "🔓 ROL DESBLOQUEADO", avisoMinijuego: "Ya jugaste el minijuego de esta temporada. Solo se puede jugar 1 minijuego por temporada, además del entrenamiento tradicional. Avanzá a la próxima temporada para jugar otro."
  },
  en: {
    titulo: "PSO CAREER", nombreJugador: "Player Name:", placeholderNombre: "Ex: Caseros", posCancha: "📍 Position on the pitch", tuCasaca: "👕 Your shirt", dorsal: "🔢 Shirt number",
    posDEL: "Forward (DEL)", posCM: "Midfielder (CM)", posDEF: "Defender (DEF)", posGK: "Goalkeeper (GK)", iniciar: "Start Career", continuar: "▶️ Continue Saved Career", modoDesafio: "🎲 Challenge Mode", ranking: "🏆 Ranking", slots: "💾 Slots", modoOscuroTitulo: "Dark mode", dueloBoton: "⚔️ 1v1 Online (Duel)",
    edad: "Age:", anios: "years", media: "Rating:", club: "Club:", moral: "Morale:", acciones: "Actions", entrenar: "Train", dominios: "⚽ Domains Challenge", entrenamiento: "⚽ Training", masMinijuegos: "🎮 More Minigames", logros: "🏅 Achievements", stats: "📊 Stats", sinEventos: "No social events this season.", simular: "Simulate Season", reiniciar: "Restart Career", historial: "Career History", thTemp: "Season", thClub: "Club", thPJ: "MP", thGoles: "Goals", thAsist: "Assists", thTitulos: "Titles / Achievements", retiro: "🏁 Professional Retirement", partidos: "Matches:", goles: "Goals:", asistencias: "Assists:", jugarDeNuevo: "Play Again", rankTitulo: "🏆 Ranking", rankTabGlobal: "🌍 Global (Online)", rankTabLocal: "📱 This device", rankColJugador: "Player", rankColMedia: "Rating", rankColTitulos: "Titles", rankColAnio: "Year", rankCargando: "Loading online ranking...", rankErrorOnline: "Could not connect to the online ranking. Check your connection.", rankReintentar: "🔄 Retry", rankActualizar: "🔄 Refresh", rankVacioOnline: "No careers in the global ranking yet. Finish a career and be the first!", rankVacioLocal: "No careers registered on this device yet.", rankSincronizado: "🟢 Online ranking synced", rankPendiente: "📤 Your career was saved and will be sent when you're back online", btnInstalar: "📥 Install App", desarrollado: "Developed by:", colaboracion: "Collaboration:", privacidadLink: "Privacy Policy",
    cuentaTitulo: "👤 My account (optional)", cuentaInfo: "Your career is still saved on this device. Supabase manages your email, authentication and nickname. When you reload the page you will have to sign in again.", cuentaEmail: "Email", cuentaPass: "Password", cuentaAcepto1: "I have read and accept the", cuentaPrivacidadLink: "Privacy Policy (opens a new tab)", cuentaAcepto2: "to create my account.", cuentaAyuda: "Required only when signing up. We use the email and authentication to manage your account and the nickname for your profile. This acceptance does not allow advertising or optional measurement.", cuentaLogin: "Sign in", cuentaCrear: "Create account", cuentaRegistroAyuda: "To sign up, use at least 8 characters. Confirm the email you received before signing in.", cuentaApodo: "Profile nickname", cuentaGuardarApodo: "Save nickname", cuentaLeerPerfil: "Read profile again", cuentaSalir: "Sign out", btnEntendido: "Got it", btnRechazar: "Reject", btnAceptar: "Accept", btnContinuar: "Continue", btnCerrar: "Close", btnEntendido2: "Got it!", mercadoTitulo: "Transfer Market", penalTitulo: "⚽ DRAMATIC FINAL!", penalTexto: "The match is tied. The penalty to decide the title is at your feet.", minijuegoIndicacion: "Follow this minigame's instruction:", tiempoRestante: "Time left:", ssTitulo: "🔍 LIVE REVIEW (SS)", ssTexto: "Checking suspicious folders and files...", rolDesbloqueado: "🔓 ROLE UNLOCKED", avisoMinijuego: "You already played this season's minigame. You can only play 1 minigame per season, in addition to traditional training. Advance to the next season to play another."
  },
  pt: {
    titulo: "CARREIRA PSO", nombreJugador: "Nome do jogador:", placeholderNombre: "Ex.: Caseros", posCancha: "📍 Posição em campo", tuCasaca: "👕 Sua camisa", dorsal: "🔢 Número", posDEL: "Atacante (DEL)", posCM: "Meio-campista (CM)", posDEF: "Zagueiro (DEF)", posGK: "Goleiro (GK)", iniciar: "Iniciar carreira", continuar: "▶️ Continuar carreira salva", modoDesafio: "🎲 Modo desafio", ranking: "🏆 Ranking", slots: "💾 Slots", modoOscuroTitulo: "Modo escuro", dueloBoton: "⚔️ 1v1 online (Duelo)", edad: "Idade:", anios: "anos", media: "Média:", club: "Clube:", moral: "Moral:", acciones: "Ações", entrenar: "Treinamento tradicional", dominios: "⚽ Desafio de domínio", entrenamiento: "⚽ Treinamento", masMinijuegos: "🎮 Mais minijogos", logros: "🏅 Conquistas", stats: "📊 Estatísticas", sinEventos: "Não há eventos sociais nesta temporada.", simular: "Simular temporada", reiniciar: "Reiniciar carreira", historial: "Histórico da carreira", thTemp: "Temp.", thClub: "Clube", thPJ: "PJ", thGoles: "Gols", thAsist: "Assist.", thTitulos: "Títulos / Conquistas", retiro: "🏁 Aposentadoria profissional", partidos: "Partidas:", goles: "Gols:", asistencias: "Assistências:", jugarDeNuevo: "Jogar novamente", rankTitulo: "🏆 Ranking", rankTabGlobal: "🌍 Global (online)", rankTabLocal: "📱 Este dispositivo", rankColJugador: "Jogador", rankColMedia: "Média", rankColTitulos: "Títulos", rankColAnio: "Ano", rankCargando: "Carregando ranking online...", rankErrorOnline: "Não foi possível conectar ao ranking online. Verifique sua conexão.", rankReintentar: "🔄 Tentar novamente", rankActualizar: "🔄 Atualizar", rankVacioOnline: "Ainda não há carreiras no ranking global. Termine uma carreira e seja o primeiro!", rankVacioLocal: "Ainda não há carreiras registradas neste dispositivo.", rankSincronizado: "🟢 Ranking online sincronizado", rankPendiente: "📤 Sua carreira foi salva e será enviada quando houver internet", btnInstalar: "📥 Instalar aplicativo", desarrollado: "Desenvolvido por:", colaboracion: "Colaboração:", privacidadLink: "Política de privacidade", cuentaTitulo: "👤 Minha conta (opcional)", cuentaInfo: "Sua carreira continua salva neste dispositivo. O Supabase gerencia seu e-mail, autenticação e apelido. Ao recarregar a página, você terá que entrar novamente.", cuentaEmail: "E-mail", cuentaPass: "Senha", cuentaAcepto1: "Li e aceito a", cuentaPrivacidadLink: "Política de privacidade (abre em outra aba)", cuentaAcepto2: "para criar minha conta.", cuentaAyuda: "Obrigatório apenas no cadastro. Usamos o e-mail e a autenticação para gerenciar sua conta e o apelido do seu perfil. Esta aceitação não autoriza publicidade nem medição opcional.", cuentaLogin: "Entrar", cuentaCrear: "Criar conta", cuentaRegistroAyuda: "Para se cadastrar, use pelo menos 8 caracteres. Confirme o e-mail recebido antes de entrar.", cuentaApodo: "Apelido do perfil", cuentaGuardarApodo: "Salvar apelido", cuentaLeerPerfil: "Ler perfil novamente", cuentaSalir: "Sair da conta", btnEntendido: "Entendi", btnRechazar: "Recusar", btnAceptar: "Aceitar", btnContinuar: "Continuar", btnCerrar: "Fechar", btnEntendido2: "Entendi!", mercadoTitulo: "Mercado de transferências", penalTitulo: "⚽ FINAL DRAMÁTICA!", penalTexto: "A partida está empatada. O pênalti para decidir o título está nos seus pés.", minijuegoIndicacion: "Siga a instrução deste minijogo:", tiempoRestante: "Tempo restante:", ssTitulo: "🔍 REVISÃO AO VIVO (SS)", ssTexto: "Verificando pastas e arquivos suspeitos...", rolDesbloqueado: "🔓 FUNÇÃO DESBLOQUEADA", avisoMinijuego: "Você já jogou o minijogo desta temporada. Só é possível jogar 1 minijogo por temporada, além do treinamento tradicional. Avance para a próxima temporada para jogar outro."
  }
};

Object.assign(TEXTOS_UI.es, {
  eventoRechazar: "Rechazar", eventoAceptar: "Aceptar", partidoTitulo: "⚽ Partido Especial Detectado", partidoTexto: "Se presenta un momento clave en la temporada. ¿Cómo querés resolverlo?", jugarMomentos: "⚽ JUGAR MOMENTOS CLAVE", simularPartido: "🎲 SIMULAR PARTIDO", tiroLibreTitulo: "🎯 Tiro Libre de Precisión", tiroLibreIndicacion: "Presiona ¡DISPARAR! cuando la barra esté en el centro.", tiroLibreBoton: "¡DISPARAR!", peleaIndicacion: "¡Presioná ESPACIO (o hacé clic) rapidísimo para defenderte!", redesTitulo: "📱 Redes Sociales", redesVacio: "Todavía no hay declaraciones sobre tu carrera.", redesResponde: "responde", viralidad: "viralidad", logrosTitulo: "🏅 Logros", logroCompletado: "✅ Completado", logroPendiente: "⬜ Pendiente", entrenarAtributos: "🏋️ Entrenar Atributos", entrenamientoTitulo: "🏋️ Centro de Entrenamiento", entrenamientoElige: "Elegí un atributo para entrenar esta temporada. Verás el progreso antes y después.", entrenamientoAgotado: "Ya entrenaste en esta temporada. Avanzá a la próxima para volver a entrenar.", entrenamientoFallido: "Práctica sin frutos hoy. El atributo no subió, pero la sesión quedó usada.", entrenamientoTecho: "Este atributo ya llegó a su tope del club actual.", atributoOVR: "OVR", cuentaPrivacidadError: "Para crear la cuenta, leé y aceptá la Política de privacidad.", cuentaConectando: "Conectando…", cuentaRegistroOk: "Solicitud enviada. Si corresponde crear la cuenta, recibirás un correo de confirmación.", cuentaSesionOk: "Sesión iniciada.", cuentaPerfilOk: "Apodo guardado y verificado.", cuentaSesionCerrada: "Sesión cerrada. Tu carrera local no cambió.", cuentaError429: "Demasiados intentos. Esperá unos minutos antes de reintentar.", cuentaErrorAuth: "No se autorizó la operación. Revisá tu sesión y la confirmación del correo.", cuentaErrorGeneral: "No se pudo completar la operación. Revisá los datos o intentá más tarde.", cuentaErrorConexion: "No se pudo conectar con las cuentas. Revisá internet e intentá otra vez.", cuentaErrorSesion: "El servidor no devolvió una sesión válida.", cuentaErrorIniciar: "Iniciá sesión para usar tu perfil.", cuentaErrorCambio: "La sesión cambió. Iniciá sesión otra vez.", cuentaErrorCredenciales: "Completá correo y contraseña.", cuentaErrorPassword: "Usá una contraseña de al menos 8 caracteres.", cuentaErrorCancelado: "Se canceló el inicio de sesión.", cuentaErrorApodo: "El apodo debe tener entre 2 y 30 caracteres.", cuentaErrorReintentar: "La sesión cambió. Reintentá."
});
Object.assign(TEXTOS_UI.en, {
  eventoRechazar: "Reject", eventoAceptar: "Accept", partidoTitulo: "⚽ Special Match Detected", partidoTexto: "A key moment appears in the season. How do you want to resolve it?", jugarMomentos: "⚽ PLAY KEY MOMENTS", simularPartido: "🎲 SIMULATE MATCH", tiroLibreTitulo: "🎯 Precision Free Kick", tiroLibreIndicacion: "Press SHOOT when the bar is in the center.", tiroLibreBoton: "SHOOT!", peleaIndicacion: "Press SPACE (or click) as fast as you can to defend yourself!", redesTitulo: "📱 Social Media", redesVacio: "There are no statements about your career yet.", redesResponde: "replies", viralidad: "virality", logrosTitulo: "🏅 Achievements", logroCompletado: "✅ Completed", logroPendiente: "⬜ Pending", entrenarAtributos: "🏋️ Train Attributes", entrenamientoTitulo: "🏋️ Training Center", entrenamientoElige: "Choose an attribute to train this season. You will see the progress before and after.", entrenamientoAgotado: "You already trained this season. Move on to the next one to train again.", entrenamientoFallido: "No progress today. The attribute did not improve, but the session was used.", entrenamientoTecho: "This attribute has reached your current club's ceiling.", atributoOVR: "OVR", cuentaPrivacidadError: "To create the account, read and accept the Privacy Policy.", cuentaConectando: "Connecting…", cuentaRegistroOk: "Request sent. If the account can be created, you will receive a confirmation email.", cuentaSesionOk: "Signed in.", cuentaPerfilOk: "Nickname saved and verified.", cuentaSesionCerrada: "Signed out. Your local career was not changed.", cuentaError429: "Too many attempts. Wait a few minutes before trying again.", cuentaErrorAuth: "The operation was not authorized. Check your session and email confirmation.", cuentaErrorGeneral: "The operation could not be completed. Check the data and try again later.", cuentaErrorConexion: "Could not connect to accounts. Check your internet and try again.", cuentaErrorSesion: "The server did not return a valid session.", cuentaErrorIniciar: "Sign in to use your profile.", cuentaErrorCambio: "The session changed. Sign in again.", cuentaErrorCredenciales: "Complete your email and password.", cuentaErrorPassword: "Use a password with at least 8 characters.", cuentaErrorCancelado: "Sign-in was canceled.", cuentaErrorApodo: "The nickname must be between 2 and 30 characters.", cuentaErrorReintentar: "The session changed. Try again."
});
Object.assign(TEXTOS_UI.pt, {
  eventoRechazar: "Recusar", eventoAceptar: "Aceitar", partidoTitulo: "⚽ Partida especial detectada", partidoTexto: "Surge um momento decisivo na temporada. Como você quer resolvê-lo?", jugarMomentos: "⚽ JOGAR MOMENTOS DECISIVOS", simularPartido: "🎲 SIMULAR PARTIDA", tiroLibreTitulo: "🎯 Cobrança de falta precisa", tiroLibreIndicacion: "Pressione CHUTAR quando a barra estiver no centro.", tiroLibreBoton: "CHUTAR!", peleaIndicacion: "Pressione ESPAÇO (ou clique) o mais rápido possível para se defender!", redesTitulo: "📱 Redes sociais", redesVacio: "Ainda não há declarações sobre a sua carreira.", redesResponde: "responde", viralidad: "viralidade", logrosTitulo: "🏅 Conquistas", logroCompletado: "✅ Concluído", logroPendiente: "⬜ Pendente", entrenarAtributos: "🏋️ Treinar Atributos", entrenamientoTitulo: "🏋️ Centro de Treinamento", entrenamientoElige: "Escolha um atributo para treinar nesta temporada. Você verá o progresso antes e depois.", entrenamientoAgotado: "Você já treinou nesta temporada. Avance para a próxima para treinar de novo.", entrenamientoFallido: "Sem frutos hoje. O atributo não subiu, mas a sessão foi usada.", entrenamientoTecho: "Este atributo já chegou ao teto do seu clube atual.", atributoOVR: "OVR", cuentaPrivacidadError: "Para criar a conta, leia e aceite a Política de privacidade.", cuentaConectando: "Conectando…", cuentaRegistroOk: "Solicitação enviada. Se a conta puder ser criada, você receberá um e-mail de confirmação.", cuentaSesionOk: "Sessão iniciada.", cuentaPerfilOk: "Apelido salvo e verificado.", cuentaSesionCerrada: "Sessão encerrada. Sua carreira local não foi alterada.", cuentaError429: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.", cuentaErrorAuth: "A operação não foi autorizada. Verifique sua sessão e a confirmação do e-mail.", cuentaErrorGeneral: "Não foi possível concluir a operação. Verifique os dados e tente novamente mais tarde.", cuentaErrorConexion: "Não foi possível conectar às contas. Verifique a internet e tente novamente.", cuentaErrorSesion: "O servidor não retornou uma sessão válida.", cuentaErrorIniciar: "Entre na sua conta para usar o perfil.", cuentaErrorCambio: "A sessão mudou. Entre novamente.", cuentaErrorCredenciales: "Preencha o e-mail e a senha.", cuentaErrorPassword: "Use uma senha com pelo menos 8 caracteres.", cuentaErrorCancelado: "A entrada foi cancelada.", cuentaErrorApodo: "O apelido deve ter entre 2 e 30 caracteres.", cuentaErrorReintentar: "A sessão mudou. Tente novamente."
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
  TEMPORADAS_ENTRE_EVENTOS: 2,
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

  return errores;
}

// 8. CONFIGURACION EXTENDIDA (nuevas mecanicas)
Object.assign(CONFIG, {
  // Moral / forma
  MORAL_MIN: 0,
  MORAL_MAX: 100,
  MORAL_INICIO: 60,
  MORAL_EFECTO: 0.15,

  // Mercado con rivales
  PROB_PUJA_RIVAL: 0.35,

  // Slots de guardado
  SLOTS: 3,

  // Minijuegos nuevos
  REGATE:    { PASOS: 6, TIEMPO_POR_PASO: 1.2, SUBIDA_OVR: 1 },
  PASE:      { TICK_MS: 20, VELOCIDAD: 3, ZONA: 18, SUBIDA_OVR: 1 },
  CABEZAZO:  { TIEMPO_MS: 2500, SUBIDA_OVR: 1 },
  UNO_VS_UNO: { SUBIDA_OVR: 2 },

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
    // (activa la mec�nica de +31); subila para verla antes.
    EDAD_INICIO: 22
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
    PROB_DECLARACION: 0.25,
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
function armarTresOfertas(pool, clubActual) {
  const actual = clubActual || null;
  const candidatas = (pool || []).slice().concat(typeof CLUBES !== "undefined" ? CLUBES : []);
  const usados = [];
  for (let i = 0; i < candidatas.length && usados.length < 2; i++) {
    const c = candidatas[i];
    if (!c || !c.nombre) continue;
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


