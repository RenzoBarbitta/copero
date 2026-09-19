const CLUBES = [
    { nombre: "Agropecuario", reputacion: 7, imagen: "imagenes/agropecuario.png" },
    { nombre: "Alessandria", reputacion: 7, imagen: "imagenes/alessandria.png" },
    { nombre: "Alumni", reputacion: 2, imagen: "imagenes/alumni.png" },
    { nombre: "AerolÃ­neas Splinter", reputacion: 5, imagen: "imagenes/areolineasplinter.png" },
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
    { nombre: "PeÃ±arol", reputacion: 7, imagen: "imagenes/penarol.png" },
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
    { nombre: "POD", reputacion: 7, imagen: "imagenes/podfc.png" }

];

// 2. REGLAS DE MEDIA SEGÃšN REPUTACIÃ“N
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
    "Perfecciona el tiro de primera intenciÃ³n apenas entra la pelota al Ã¡rea chica.",
    "Entrena la cobertura de pelota de espaldas para girar rÃ¡pido y sacar el zurdazo.",
    "Domina el arte del amague largo para dejar tirado al arquero en el mano a mano.",
    "Practica los desmarques en diagonal atacando el espacio vacÃ­o.",
    "Perfecciona el remate de cabeza picado tras centro bombeado.",
    "Entrena la definiciÃ³n de cuchara por encima del golero."
  ],
  CM: [
    "Masteriza la pausa y el cambio de frente milimÃ©trico hacia la banda opuesta.",
    "Practica el control orientado de primera para sacarte la presiÃ³n alta de encima.",
    "Entrena el pase filtrado entre lÃ­neas para romper bloques defensivos cerrados.",
    "Aprende a temporizar y manejar los tiempos del equipo en momentos crÃ­ticos.",
    "Perfecciona el remate de media distancia ante rebotes a la salida de un cÃ³rner.",
    "Practica la recuperaciÃ³n tras pÃ©rdida para cortar el contraataque rival.",
    "Entrena la distribuciÃ³n al primer toque bajo presiÃ³n sofocante.",
    "Trabaja las paredes cortas en el borde del Ã¡rea para romper lÃ­neas."
  ],
  DEF: [
    "Aprende a perfilar el cuerpo para temporizar al extremo y cerrarle la diagonal.",
    "Domina el tiempo del cruce abajo con barrida limpia sin cometer falta en el Ã¡rea.",
    "Entrena el anticipo de cabeza frente a los saques largos del arquero rival.",
    "Practica el despeje de cabeza orientado hacia las bandas para no regalar la pelota en el centro.",
    "Trabaja el escalonamiento defensivo para tirar la trampa del offside en el momento exacto.",
    "Perfecciona la salida limpia desde el fondo rompiendo la primera lÃ­nea de presiÃ³n.",
    "Aprende a usar el cuerpo en el hombro a hombro para desequilibrar al delantero sin cometer falta.",
    "Entrena la cobertura a la espalda de tu lateral cuando se proyecta al ataque.",
    "Masteriza la marca personal en el tiro de esquina para no perder nunca de vista a tu marca."
  ],
  GK: [
    "Trabaja los reflejos sobre la lÃ­nea y la velocidad de reacciÃ³n en remates a quemarropa.",
    "Mejora el achique agresivo achicando el Ã¡ngulo de tiro en los mano a mano.",
    "Practica la salida rÃ¡pida con el pie para iniciar la contra instantÃ¡nea.",
    "Perfecciona el embolse de pelota en tiros potentes a media altura.",
    "Entrena la comunicaciÃ³n y el liderazgo para ordenar la barrera en tiros libres.",
    "Trabaja la estirada a mano cambiada para sacar pelotas del Ã¡ngulo."
  ]
};

// 5. SISTEMA DE ROLES
// Las imagenes de los badges estan en /imagenes:
//   inmortal.png (escudo dorado), master.png (escudo rojo), normal.png (circulo con X)
const ROLES = [
  { nombre: "Normal",    minOVR: 40, maxOVR: 74, emoji: "âš½",  color: "#adb5bd", descripcion: "Jugador en desarrollo", imagen: "imagenes/normal.png" },
  { nombre: "Promesa",   minOVR: 75, maxOVR: 79, emoji: "ðŸŒŸ",  color: "#4dabf7", descripcion: "Â¡MostrÃ¡s condiciones!" },
  { nombre: "Aspirante", minOVR: 80, maxOVR: 84, emoji: "ðŸ”¥",  color: "#69db7c", descripcion: "Un nivel mÃ¡s arriba" },
  { nombre: "Master",    minOVR: 85, maxOVR: 89, emoji: "ðŸ‘‘",  color: "#cc5de8", descripcion: "Jugador de Ã©lite", imagen: "imagenes/master.png" },
  { nombre: "Inmortal",  minOVR: 90, maxOVR: 99, emoji: "ðŸ’Ž",  color: "#ffd43b", descripcion: "Leyenda del PSO",   imagen: "imagenes/inmortal.png" }
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
    // (activa la mecÃ¡nica de +31); subila para verla antes.
    EDAD_INICIO: 22
  }
});

// 9. LOGROS DESBLOQUEABLES
const LOGROS = [
  { id: "primer_titulo", nombre: "CampeÃ³n",           desc: "GanÃ¡ tu primer tÃ­tulo.",             emoji: "ðŸ†" },
  { id: "bota_oro",      nombre: "BotÃ­n Dorado",      desc: "GanÃ¡ una Bota de Oro.",              emoji: "ðŸ‘Ÿ" },
  { id: "balon_oro",     nombre: "Mejor del Mundo",   desc: "GanÃ¡ un BalÃ³n de Oro.",              emoji: "ðŸ¥‡" },
  { id: "master",        nombre: "Master",            desc: "AlcanzÃ¡ el rol Master.",             emoji: "ðŸ‘‘" },
  { id: "inmortal",      nombre: "Inmortal",          desc: "AlcanzÃ¡ el rol Inmortal.",           emoji: "ðŸ’Ž" },
  { id: "copa_campeones",nombre: "Rey de Copas",      desc: "GanÃ¡ la Copa de Campeones.",         emoji: "ðŸ‘‘" },
  { id: "temporada_10",  nombre: "Veterano",          desc: "JugÃ¡ 10 temporadas.",                emoji: "ðŸŽ–ï¸" },
  { id: "triplete",      nombre: "Triplete",          desc: "GanÃ¡ 3 tÃ­tulos en una temporada.",   emoji: "ðŸ…" },
  { id: "superviviente", nombre: "Superviviente",     desc: "ZafÃ¡ una sanciÃ³n de Loro.",          emoji: "ðŸ›¡ï¸" }
];

// 10. FINALES POSIBLES
const FINALES = [
  { id: "leyenda",    nombre: "Leyenda del PSO",  desc: "Terminaste con OVR 90+ y 3+ tÃ­tulos mayores.", emoji: "ðŸ‘‘", color: "#ffd43b" },
  { id: "estrella",   nombre: "Estrella",         desc: "Terminaste con OVR 85+ y tÃ­tulos.",            emoji: "â­", color: "#4dabf7" },
  { id: "profesional",nombre: "Profesional",      desc: "Carrera sÃ³lida con buen nivel.",               emoji: "ðŸ”¥", color: "#69db7c" },
  { id: "promesa",    nombre: "Promesa Truncada", desc: "No lograste consolidarte.",                    emoji: "ðŸŒŸ", color: "#adb5bd" },
  { id: "olvidado",   nombre: "Olvidado",         desc: "Terminaste en el olvido de la Segunda.",       emoji: "ðŸ’¤", color: "#868e96" }
];

// 11. TRADUCCIONES (UI COMPLETA)
const TEXTOS_UI = {
  es: {
    titulo: "CARRERA PSO",
    nombreJugador: "Nombre del Jugador:",
    placeholderNombre: "Ej: Caseros",
    posicion: "PosiciÃ³n:",
    posDEL: "Delantero (DEL)", posCM: "Mediocampista (CM)", posDEF: "Defensa (DEF)", posGK: "Arquero (GK)",
    iniciar: "Iniciar Carrera",
    continuar: "â–¶ï¸ Continuar Carrera Guardada",
    modoDesafio: "ðŸŽ² Modo DesafÃ­o",
    ranking: "ðŸ† Ranking",
    slots: "ðŸ’¾ Slots",
    modoOscuroTitulo: "Modo oscuro",
    edad: "Edad:", anios: "aÃ±os", media: "Media:", club: "Club:", moral: "Moral:", estado: "Estado:",
    acciones: "Acciones",
    entrenar: "Entrenar Tradicional",
    dominios: "âš½ DesafÃ­o Dominios",
    entrenamiento: "âš½ Entrenamiento",
    masMinijuegos: "ðŸŽ® MÃ¡s Minijuegos",
    logros: "ðŸ… Logros",
    stats: "ðŸ“Š Stats",
    sinEventos: "No hay eventos sociales esta temporada.",
    simular: "Simular Temporada",
    reiniciar: "Reiniciar Carrera",
    historial: "Historial de Carrera",
    thTemp: "Temp", thClub: "Club", thPJ: "PJ", thGoles: "Goles", thAsist: "Asist.", thTitulos: "TÃ­tulos / Logros",
    retiro: "ðŸ Retiro Profesional",
    partidos: "Partidos:", goles: "Goles:", asistencias: "Asistencias:",
    jugarDeNuevo: "Jugar de Nuevo",
    rankTabGlobal: "ðŸŒ Global (Online)",
    rankTabLocal: "ðŸ“± Este dispositivo",
    rankTitulo: "ðŸ† Ranking",
    rankColJugador: "Jugador", rankColMedia: "Media", rankColTitulos: "TÃ­tulos", rankColAnio: "AÃ±o",
    rankCargando: "Cargando ranking online...",
    rankErrorOnline: "No se pudo conectar con el ranking online. RevisÃ¡ tu conexiÃ³n.",
    rankReintentar: "ðŸ”„ Reintentar",
    rankActualizar: "ðŸ”„ Actualizar",
    rankVacioOnline: "TodavÃ­a no hay carreras en el ranking global. Â¡TerminÃ¡ una carrera y sÃ© el primero!",
    rankVacioLocal: "TodavÃ­a no hay carreras registradas en este dispositivo.",
    rankSincronizado: "ðŸŸ¢ Ranking online sincronizado",
    rankPendiente: "ðŸ“¤ Tu carrera quedÃ³ guardada y se enviarÃ¡ cuando haya internet",
    posCancha: "ðŸ“ PosiciÃ³n en cancha", tuCasaca: "ðŸ‘• Tu casaca", dorsal: "ðŸ”¢ Dorsal",
    btnInstalar: "ðŸ“¥ Instalar App",
    desarrollado: "Desarrollado por:", colaboracion: "ColaboraciÃ³n:",
    // --- UI estatica adicional (panel de cuenta, modales, avisos) ---
    cuentaTitulo: "ðŸ‘¤ Mi cuenta (opcional)",
    cuentaInfo: "Tu carrera sigue guardada en este dispositivo. Supabase gestiona tu correo, autenticaciÃ³n y apodo. Al recargar la pÃ¡gina tendrÃ¡s que iniciar sesiÃ³n otra vez.",
    cuentaEmail: "Correo electrÃ³nico",
    cuentaPass: "ContraseÃ±a",
    cuentaAcepto1: "LeÃ­ y acepto la",
    cuentaPrivacidadLink: "PolÃ­tica de privacidad (abre otra pestaÃ±a)",
    cuentaAcepto2: "para crear mi cuenta.",
    cuentaAyuda: "Obligatorio solo al registrarse. Usamos el correo y la autenticaciÃ³n para gestionar tu cuenta y el apodo para tu perfil. Esta aceptaciÃ³n no autoriza publicidad ni mediciÃ³n opcional.",
    cuentaLogin: "Iniciar sesiÃ³n",
    cuentaCrear: "Crear cuenta",
    cuentaRegistroAyuda: "Para registrarte, usÃ¡ al menos 8 caracteres. ConfirmÃ¡ el correo recibido antes de iniciar sesiÃ³n.",
    cuentaApodo: "Apodo del perfil",
    cuentaGuardarApodo: "Guardar apodo",
    cuentaLeerPerfil: "Volver a leer perfil",
    cuentaSalir: "Cerrar sesiÃ³n",
    dueloBoton: "âš”ï¸ 1v1 Online (Duelo)",
    btnEntendido: "Entendido",
    btnRechazar: "Rechazar",
    btnAceptar: "Aceptar",
    btnContinuar: "Continuar",
    btnCerrar: "Cerrar",
    btnEntendido2: "Â¡Entendido!",
    mercadoTitulo: "Mercado de Pases",
    penalTitulo: "âš½ Â¡FINAL DRAMÃTICA!",
    penalTexto: "El partido estÃ¡ empatado. Tienes en tus pies el penal para definir el tÃ­tulo.",
    minijuegoIndicacion: "SeguÃ­ la indicaciÃ³n de este minijuego:",
    tiempoRestante: "Tiempo restante:",
    ssTitulo: "ðŸ” REVISIÃ“N EN VIVO (SS)",
    ssTexto: "Revisando carpetas y archivos sospechosos...",
    rolDesbloqueado: "ðŸ”“ ROL DESBLOQUEADO",
    privacidadLink: "PolÃ­tica de privacidad",
    avisoMinijuego: "Ya jugaste el minijuego de esta temporada. Solo se puede jugar 1 minijuego por temporada, ademÃ¡s del entrenamiento tradicional. AvanzÃ¡ a la prÃ³xima temporada para jugar otro."
  },
  en: {
    titulo: "PSO CAREER",
    nombreJugador: "Player Name:",
    placeholderNombre: "Ex: Caseros",
    posicion: "Position:",
    posDEL: "Forward (DEL)", posCM: "Midfielder (CM)", posDEF: "Defender (DEF)", posGK: "Goalkeeper (GK)",
    iniciar: "Start Career",
    continuar: "â–¶ï¸ Continue Saved Career",
    modoDesafio: "ðŸŽ² Challenge Mode",
    ranking: "ðŸ† Ranking",
    slots: "ðŸ’¾ Slots",
    modoOscuroTitulo: "Dark mode",
    edad: "Age:", anios: "years", media: "Rating:", club: "Club:", moral: "Morale:", estado: "Status:",
    acciones: "Actions",
    entrenar: "Train",
    dominios: "âš½ Domains Challenge",
    entrenamiento: "âš½ Training",
    masMinijuegos: "ðŸŽ® More Minigames",
    logros: "ðŸ… Achievements",
    stats: "ðŸ“Š Stats",
    sinEventos: "No social events this season.",
    simular: "Simulate Season",
    reiniciar: "Restart Career",
    historial: "Career History",
    thTemp: "Season", thClub: "Club", thPJ: "MP", thGoles: "Goals", thAsist: "Assists", thTitulos: "Titles / Achievements",
    retiro: "ðŸ Professional Retirement",
    partidos: "Matches:", goles: "Goals:", asistencias: "Assists:",
    jugarDeNuevo: "Play Again",
    rankTabGlobal: "ðŸŒ Global (Online)",
    rankTabLocal: "ðŸ“± This device",
    rankTitulo: "ðŸ† Ranking",
    rankColJugador: "Player", rankColMedia: "Rating", rankColTitulos: "Titles", rankColAnio: "Year",
    rankCargando: "Loading online ranking...",
    rankErrorOnline: "Could not connect to the online ranking. Check your connection.",
    rankReintentar: "ðŸ”„ Retry",
    rankActualizar: "ðŸ”„ Refresh",
    rankVacioOnline: "No careers in the global ranking yet. Finish a career and be the first!",
    rankVacioLocal: "No careers registered on this device yet.",
    rankSincronizado: "ðŸŸ¢ Online ranking synced",
    rankPendiente: "ðŸ“¤ Your career was saved and will be sent when you're back online",
    posCancha: "ðŸ“ Position on the pitch", tuCasaca: "ðŸ‘• Your shirt", dorsal: "ðŸ”¢ Shirt number",
    btnInstalar: "ðŸ“¥ Install App",
    desarrollado: "Developed by:", colaboracion: "Collaboration:",
    // --- Extra static UI (account panel, modals, notices) ---
    cuentaTitulo: "ðŸ‘¤ My account (optional)",
    cuentaInfo: "Your career is still saved on this device. Supabase manages your email, authentication and nickname. When you reload the page you will have to sign in again.",
    cuentaEmail: "Email",
    cuentaPass: "Password",
    cuentaAcepto1: "I have read and accept the",
    cuentaPrivacidadLink: "Privacy Policy (opens a new tab)",
    cuentaAcepto2: "to create my account.",
    cuentaAyuda: "Required only when signing up. We use the email and authentication to manage your account and the nickname for your profile. This acceptance does not allow advertising or optional measurement.",
    cuentaLogin: "Sign in",
    cuentaCrear: "Create account",
    cuentaRegistroAyuda: "To sign up, use at least 8 characters. Confirm the email you received before signing in.",
    cuentaApodo: "Profile nickname",
    cuentaGuardarApodo: "Save nickname",
    cuentaLeerPerfil: "Read profile again",
    cuentaSalir: "Sign out",
    dueloBoton: "âš”ï¸ 1v1 Online (Duel)",
    btnEntendido: "Got it",
    btnRechazar: "Reject",
    btnAceptar: "Accept",
    btnContinuar: "Continue",
    btnCerrar: "Close",
    btnEntendido2: "Got it!",
    mercadoTitulo: "Transfer Market",
    penalTitulo: "âš½ DRAMATIC FINAL!",
    penalTexto: "The match is tied. The penalty to decide the title is at your feet.",
    minijuegoIndicacion: "Follow this minigame's instruction:",
    tiempoRestante: "Time left:",
    ssTitulo: "ðŸ” LIVE REVIEW (SS)",
    ssTexto: "Checking suspicious folders and files...",
    rolDesbloqueado: "ðŸ”“ ROLE UNLOCKED",
    privacidadLink: "Privacy Policy",
    avisoMinijuego: "You already played this season's minigame. You can only play 1 minigame per season, in addition to traditional training. Advance to the next season to play another."
  },
  pt: {
    titulo: "CARREIRA PSO",
    nombreJugador: "Nome do Jogador:",
    placeholderNombre: "Ex: Caseros",
    posicion: "PosiÃ§Ã£o:",
    posDEL: "Atacante (DEL)", posCM: "Meio-campista (CM)", posDEF: "Zagueiro (DEF)", posGK: "Goleiro (GK)",
    iniciar: "Iniciar Carreira",
    continuar: "â–¶ï¸ Continuar Carreira Salva",
    modoDesafio: "ðŸŽ² Modo Desafio",
    ranking: "ðŸ† Ranking",
    slots: "ðŸ’¾ Slots",
    modoOscuroTitulo: "Modo escuro",
    edad: "Idade:", anios: "anos", media: "MÃ©dia:", club: "Clube:", moral: "Moral:", estado: "Status:",
    acciones: "AÃ§Ãµes",
    entrenar: "Treinar",
    dominios: "âš½ Desafio de DomÃ­nios",
    entrenamiento: "âš½ Treinamento",
    masMinijuegos: "ðŸŽ® Mais Minijogos",
    logros: "ðŸ… Conquistas",
    stats: "ðŸ“Š EstatÃ­sticas",
    sinEventos: "NÃ£o hÃ¡ eventos sociais nesta temporada.",
    simular: "Simular Temporada",
    reiniciar: "Reiniciar Carreira",
    historial: "HistÃ³rico da Carreira",
    thTemp: "Temp", thClub: "Clube", thPJ: "PJ", thGoles: "Gols", thAsist: "Assist.", thTitulos: "TÃ­tulos / Conquistas",
    retiro: "ðŸ Aposentadoria Profissional",
    partidos: "Partidas:", goles: "Gols:", asistencias: "AssistÃªncias:",
    jugarDeNuevo: "Jogar Novamente",
    rankTabGlobal: "ðŸŒ Global (Online)",
    rankTabLocal: "ðŸ“± Este dispositivo",
    rankTitulo: "ðŸ† Ranking",
    rankColJugador: "Jogador", rankColMedia: "MÃ©dia", rankColTitulos: "TÃ­tulos", rankColAnio: "Ano",
    rankCargando: "Carregando ranking online...",
    rankErrorOnline: "NÃ£o foi possÃ­vel conectar ao ranking online. Verifique sua conexÃ£o.",
    rankReintentar: "ðŸ”„ Tentar novamente",
    rankActualizar: "ðŸ”„ Atualizar",
    rankVacioOnline: "Ainda nÃ£o hÃ¡ carreiras no ranking global. Termine uma carreira e seja o primeiro!",
    rankVacioLocal: "Ainda nÃ£o hÃ¡ carreiras registradas neste dispositivo.",
    rankSincronizado: "ðŸŸ¢ Ranking online sincronizado",
    rankPendiente: "ðŸ“¤ Sua carreira foi salva e serÃ¡ enviada quando houver internet",
    posCancha: "ðŸ“ PosiÃ§Ã£o em campo", tuCasaca: "ðŸ‘• Sua camisa", dorsal: "ðŸ”¢ NÃºmero",
    btnInstalar: "ðŸ“¥ Instalar App",
    desarrollado: "Desenvolvido por:", colaboracion: "ColaboraÃ§Ã£o:",
    // --- UI estatica adicional (painel de conta, modais, avisos) ---
    cuentaTitulo: "ðŸ‘¤ Minha conta (opcional)",
    cuentaInfo: "Sua carreira continua salva neste dispositivo. O Supabase gerencia seu e-mail, autenticaÃ§Ã£o e apelido. Ao recarregar a pÃ¡gina, vocÃª terÃ¡ que entrar novamente.",
    cuentaEmail: "E-mail",
    cuentaPass: "Senha",
    cuentaAcepto1: "Li e aceito a",
    cuentaPrivacidadLink: "PolÃ­tica de privacidade (abre em outra aba)",
    cuentaAcepto2: "para criar minha conta.",
    cuentaAyuda: "ObrigatÃ³rio apenas no cadastro. Usamos o e-mail e a autenticaÃ§Ã£o para gerenciar sua conta e o apelido para o seu perfil. Este aceite nÃ£o autoriza publicidade nem mediÃ§Ã£o opcional.",
    cuentaLogin: "Entrar",
    cuentaCrear: "Criar conta",
    cuentaRegistroAyuda: "Para se cadastrar, use pelo menos 8 caracteres. Confirme o e-mail recebido antes de entrar.",
    cuentaApodo: "Apelido do perfil",
    cuentaGuardarApodo: "Salvar apelido",
    cuentaLeerPerfil: "Ler perfil novamente",
    cuentaSalir: "Sair da conta",
    dueloBoton: "âš”ï¸ 1v1 Online (Duelo)",
    btnEntendido: "Entendi",
    btnRechazar: "Recusar",
    btnAceptar: "Aceitar",
    btnContinuar: "Continuar",
    btnCerrar: "Fechar",
    btnEntendido2: "Entendi!",
    mercadoTitulo: "Mercado de TransferÃªncias",
    penalTitulo: "âš½ FINAL DRAMÃTICO!",
    penalTexto: "A partida estÃ¡ empatada. VocÃª tem nos pÃ©s o pÃªnalti para decidir o tÃ­tulo.",
    minijuegoIndicacion: "Siga a instruÃ§Ã£o deste minijogo:",
    tiempoRestante: "Tempo restante:",
    ssTitulo: "ðŸ” REVISÃƒO AO VIVO (SS)",
    ssTexto: "Verificando pastas e arquivos suspeitos...",
    rolDesbloqueado: "ðŸ”“ CARGO DESBLOQUEADO",
    privacidadLink: "PolÃ­tica de privacidade",
    avisoMinijuego: "VocÃª jÃ¡ jogou o minijogo desta temporada. SÃ³ Ã© possÃ­vel jogar 1 minijogo por temporada, alÃ©m do treino tradicional. Avance para a prÃ³xima temporada para jogar outro."
  }
};

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

// 12. PRNG CON SEMILLA (modo desafÃ­o reproducible)
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

