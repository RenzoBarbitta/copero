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
    { nombre: "Yorkshine", reputacion: 6, imagen: "imagenes/yorkshine.png" }
];

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

// 6. CONFIGURACION GLOBAL (balance del juego centralizado)
const CONFIG = {
  OVR_MIN: 40,
  OVR_MAX: 99,
  EDAD_INICIO: 17,
  EDAD_DECLIVE: 31,
  EDAD_RETIRO: 36,
  UMBRAL_PRIMERA: 5,
  SANCION_LORO_TEMPORADAS: 3,
  PROB_LORO: 0.15,
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
    PROB_MINIJUEGO_TITULO: 0.25,
    PROB_MINIJUEGO_DESCENSO: 0.30,
    PROB_FINAL_TORNEO: 0.30,
    PROB_CRUCE_CAMPEONES: 0.25
  },
  DOMINIOS:    { LARGO: 4, TIEMPO: 3.0, TICK_MS: 100, SUBIDA_OVR: 2 },
  TIRO_LIBRE:  { TICK_MS: 25, VELOCIDAD: 4, ZONA_MIN: 40, ZONA_MAX: 60, SUBIDA_OVR: 2 },
  BARRIDA:     { TICK_MS: 20, VELOCIDAD: 5, ZONA_MIN: 38, ZONA_MAX: 62, SUBIDA_OVR: 2 },
  GUANTES:     { SUBIDA_OVR: 2 },
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
  REGATE:    { PASOS: 5, TIEMPO_POR_PASO: 1.6, SUBIDA_OVR: 2 },
  PASE:      { TICK_MS: 20, VELOCIDAD: 3, ZONA: 22, SUBIDA_OVR: 2 },
  CHILENA:   { TAPS: 2, VENTANA_MS: 700, SUBIDA_OVR: 3 },
  CABEZAZO:  { TIEMPO_MS: 2500, SUBIDA_OVR: 2 },
  UNO_VS_UNO: { SUBIDA_OVR: 3 }
});

// 9. LOGROS DESBLOQUEABLES
const LOGROS = [
  { id: "primer_titulo", nombre: "Campeón",           desc: "Ganá tu primer título.",             emoji: "🏆" },
  { id: "bota_oro",      nombre: "Botín Dorado",      desc: "Ganá una Bota de Oro.",              emoji: "👟" },
  { id: "balon_oro",     nombre: "Mejor del Mundo",   desc: "Ganá un Balón de Oro.",              emoji: "🥇" },
  { id: "master",        nombre: "Master",            desc: "Alcanzá el rol Master.",             emoji: "👑" },
  { id: "inmortal",      nombre: "Inmortal",          desc: "Alcanzá el rol Inmortal.",           emoji: "💎" },
  { id: "copa_campeones",nombre: "Rey de Copas",      desc: "Ganá la Copa de Campeones.",         emoji: "👑" },
  { id: "temporada_10",  nombre: "Veterano",          desc: "Jugá 10 temporadas.",                emoji: "🎖️" },
  { id: "triplete",      nombre: "Triplete",          desc: "Ganá 3 títulos en una temporada.",   emoji: "🏅" },
  { id: "superviviente", nombre: "Superviviente",     desc: "Zafá una sanción de Loro.",          emoji: "🛡️" }
];

// 10. FINALES POSIBLES
const FINALES = [
  { id: "leyenda",    nombre: "Leyenda del PSO",  desc: "Terminaste con OVR 90+ y 3+ títulos mayores.", emoji: "👑", color: "#ffd43b" },
  { id: "estrella",   nombre: "Estrella",         desc: "Terminaste con OVR 85+ y títulos.",            emoji: "⭐", color: "#4dabf7" },
  { id: "profesional",nombre: "Profesional",      desc: "Carrera sólida con buen nivel.",               emoji: "🔥", color: "#69db7c" },
  { id: "promesa",    nombre: "Promesa Truncada", desc: "No lograste consolidarte.",                    emoji: "🌟", color: "#adb5bd" },
  { id: "olvidado",   nombre: "Olvidado",         desc: "Terminaste en el olvido de la Segunda.",       emoji: "💤", color: "#868e96" }
];

// 11. TRADUCCIONES (UI COMPLETA)
const TEXTOS_UI = {
  es: {
    titulo: "CARRERA PSO",
    nombreJugador: "Nombre del Jugador:",
    placeholderNombre: "Ej: Caseros",
    posicion: "Posición:",
    posDEL: "Delantero (DEL)", posCM: "Mediocampista (CM)", posDEF: "Defensa (DEF)", posGK: "Arquero (GK)",
    iniciar: "Iniciar Carrera",
    continuar: "▶️ Continuar Carrera Guardada",
    modoDesafio: "🎲 Modo Desafío",
    ranking: "🏆 Ranking",
    slots: "💾 Slots",
    modoOscuroTitulo: "Modo oscuro",
    edad: "Edad:", anios: "años", media: "Media:", club: "Club:", moral: "Moral:", estado: "Estado:",
    acciones: "Acciones",
    entrenar: "Entrenar Tradicional",
    dominios: "⚽ Desafío Dominios",
    entrenamiento: "⚽ Entrenamiento",
    masMinijuegos: "🎮 Más Minijuegos",
    logros: "🏅 Logros",
    stats: "📊 Stats",
    sinEventos: "No hay eventos sociales esta temporada.",
    simular: "Simular Temporada",
    reiniciar: "Reiniciar Carrera",
    historial: "Historial de Carrera",
    thTemp: "Temp", thClub: "Club", thPJ: "PJ", thGoles: "Goles", thAsist: "Asist.", thTitulos: "Títulos / Logros",
    retiro: "🏁 Retiro Profesional",
    partidos: "Partidos:", goles: "Goles:", asistencias: "Asistencias:",
    jugarDeNuevo: "Jugar de Nuevo",
    rankTabGlobal: "🌍 Global (Online)",
    rankTabLocal: "📱 Este dispositivo",
    rankTitulo: "🏆 Ranking",
    rankColJugador: "Jugador", rankColMedia: "Media", rankColTitulos: "Títulos", rankColAnio: "Año",
    rankCargando: "Cargando ranking online...",
    rankErrorOnline: "No se pudo conectar con el ranking online. Revisá tu conexión.",
    rankReintentar: "🔄 Reintentar",
    rankActualizar: "🔄 Actualizar",
    rankVacioOnline: "Todavía no hay carreras en el ranking global. ¡Terminá una carrera y sé el primero!",
    rankVacioLocal: "Todavía no hay carreras registradas en este dispositivo.",
    rankSincronizado: "🟢 Ranking online sincronizado",
    rankPendiente: "📤 Tu carrera quedó guardada y se enviará cuando haya internet",
    posCancha: "📍 Posición en cancha", tuCasaca: "👕 Tu casaca", dorsal: "🔢 Dorsal",
    btnInstalar: "📥 Instalar App",
    desarrollado: "Desarrollado por:", colaboracion: "Colaboración:"
  },
  en: {
    titulo: "PSO CAREER",
    nombreJugador: "Player Name:",
    placeholderNombre: "Ex: Caseros",
    posicion: "Position:",
    posDEL: "Forward (DEL)", posCM: "Midfielder (CM)", posDEF: "Defender (DEF)", posGK: "Goalkeeper (GK)",
    iniciar: "Start Career",
    continuar: "▶️ Continue Saved Career",
    modoDesafio: "🎲 Challenge Mode",
    ranking: "🏆 Ranking",
    slots: "💾 Slots",
    modoOscuroTitulo: "Dark mode",
    edad: "Age:", anios: "years", media: "Rating:", club: "Club:", moral: "Morale:", estado: "Status:",
    acciones: "Actions",
    entrenar: "Train",
    dominios: "⚽ Domains Challenge",
    entrenamiento: "⚽ Training",
    masMinijuegos: "🎮 More Minigames",
    logros: "🏅 Achievements",
    stats: "📊 Stats",
    sinEventos: "No social events this season.",
    simular: "Simulate Season",
    reiniciar: "Restart Career",
    historial: "Career History",
    thTemp: "Season", thClub: "Club", thPJ: "MP", thGoles: "Goals", thAsist: "Assists", thTitulos: "Titles / Achievements",
    retiro: "🏁 Professional Retirement",
    partidos: "Matches:", goles: "Goals:", asistencias: "Assists:",
    jugarDeNuevo: "Play Again",
    rankTabGlobal: "🌍 Global (Online)",
    rankTabLocal: "📱 This device",
    rankTitulo: "🏆 Ranking",
    rankColJugador: "Player", rankColMedia: "Rating", rankColTitulos: "Titles", rankColAnio: "Year",
    rankCargando: "Loading online ranking...",
    rankErrorOnline: "Could not connect to the online ranking. Check your connection.",
    rankReintentar: "🔄 Retry",
    rankActualizar: "🔄 Refresh",
    rankVacioOnline: "No careers in the global ranking yet. Finish a career and be the first!",
    rankVacioLocal: "No careers registered on this device yet.",
    rankSincronizado: "🟢 Online ranking synced",
    rankPendiente: "📤 Your career was saved and will be sent when you're back online",
    posCancha: "📍 Position on the pitch", tuCasaca: "👕 Your shirt", dorsal: "🔢 Shirt number",
    btnInstalar: "📥 Install App",
    desarrollado: "Developed by:", colaboracion: "Collaboration:"
  },
  pt: {
    titulo: "CARREIRA PSO",
    nombreJugador: "Nome do Jogador:",
    placeholderNombre: "Ex: Caseros",
    posicion: "Posição:",
    posDEL: "Atacante (DEL)", posCM: "Meio-campista (CM)", posDEF: "Defensor (DEF)", posGK: "Goleiro (GK)",
    iniciar: "Iniciar Carreira",
    continuar: "▶️ Continuar Carreira Salva",
    modoDesafio: "🎲 Modo Desafio",
    ranking: "🏆 Ranking",
    slots: "💾 Slots",
    modoOscuroTitulo: "Modo escuro",
    edad: "Idade:", anios: "anos", media: "Média:", club: "Clube:", moral: "Moral:", estado: "Estado:",
    acciones: "Ações",
    entrenar: "Treinar",
    dominios: "⚽ Desafio de Domínios",
    entrenamiento: "⚽ Treinamento",
    masMinijuegos: "🎮 Mais Minijogos",
    logros: "🏅 Conquistas",
    stats: "📊 Estatísticas",
    sinEventos: "Não há eventos sociais nesta temporada.",
    simular: "Simular Temporada",
    reiniciar: "Reiniciar Carreira",
    historial: "Histórico de Carreira",
    thTemp: "Temp", thClub: "Clube", thPJ: "PJ", thGoles: "Gols", thAsist: "Assist.", thTitulos: "Títulos / Conquistas",
    retiro: "🏁 Aposentadoria Profissional",
    partidos: "Partidas:", goles: "Gols:", asistencias: "Assistências:",
    jugarDeNuevo: "Jogar Novamente",
    rankTabGlobal: "🌍 Global (Online)",
    rankTabLocal: "📱 Este dispositivo",
    rankTitulo: "🏆 Ranking",
    rankColJugador: "Jogador", rankColMedia: "Média", rankColTitulos: "Títulos", rankColAnio: "Ano",
    rankCargando: "Carregando ranking online...",
    rankErrorOnline: "Não foi possível conectar ao ranking online. Verifique sua conexão.",
    rankReintentar: "🔄 Tentar novamente",
    rankActualizar: "🔄 Atualizar",
    rankVacioOnline: "Ainda não há carreiras no ranking global. Termine uma carreira e seja o primeiro!",
    rankVacioLocal: "Ainda não há carreiras registradas neste dispositivo.",
    rankSincronizado: "🟢 Ranking online sincronizado",
    rankPendiente: "📤 Sua carreira foi salva e será enviada quando houver internet",
    posCancha: "📍 Posição em campo", tuCasaca: "👕 Sua camisa", dorsal: "🔢 Número",
    btnInstalar: "📥 Instalar App",
    desarrollado: "Desenvolvido por:", colaboracion: "Colaboração:"
  }
};

// 12. PRNG CON SEMILLA (modo desafío reproducible)
function crearPRNG(semilla) {
  let s = semilla >>> 0;
  return function() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// 13. HELPER DE RANDOM GLOBAL (usa PRNG si hay semilla activa)
let _randActivo = Math.random;
function rnd() { return _randActivo(); }