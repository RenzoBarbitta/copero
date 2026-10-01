// ============================================================
//  RIVALIDAD DE JUGADOR (rival.js)
//  Cada carrera sortea un rival de PSO de la MISMA posición usando
//  el catálogo RIVALIDADES_PERSONAJES de data.js. El rival tiene su
//  propia carrera simulada (media, club, títulos) y evoluciona solo
//  temporada a temporada. Una vez por temporada se puede jugar el
//  DUELO DE RIVALIDAD: una barra de timing contra su media, con
//  premio de OVR/moral si ganás y efecto en la intensidad.
//
//  El duelo usa un contador propio (rivalidad.dueloUsadoTemporada),
//  NO el de minijuegos: es una acción extra y no bloquea los
//  minijuegos de la temporada.
// ============================================================

// ============================================================
//  CATÁLOGO Y ESTADO
// ============================================================

// Minúsculas y sin acentos, para comparar nombres de forma tolerante.
function normalizarTextoNombre(valor) {
  return String(valor == null ? "" : valor)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Devuelve el catálogo de rivales de una posición. Como respaldo (si esa
// posición no viniera en RIVALIDADES_PERSONAJES) se usan los nombres de
// TODAS las posiciones del catálogo, nunca PERSONAJES: ese es el catálogo
// del entrenamiento y sus nombres no son rivales.
function catalogoRivalidad(posicion) {
  if (typeof RIVALIDADES_PERSONAJES === "undefined") return [];
  const lista = RIVALIDADES_PERSONAJES[posicion];
  if (Array.isArray(lista) && lista.length) return lista;
  const todos = [];
  Object.keys(RIVALIDADES_PERSONAJES).forEach(function (k) {
    const v = RIVALIDADES_PERSONAJES[k];
    if (Array.isArray(v)) v.forEach(function (n) { if (todos.indexOf(n) === -1) todos.push(n); });
  });
  return todos;
}

// Un club cualquiera para el rival (misma fuente que el usuario).
function rivalidadClubAleatorio() {
  if (typeof CLUBES === "undefined" || !Array.isArray(CLUBES) || !CLUBES.length) {
    return { nombre: "", imagen: "", reputacion: 0 };
  }
  const club = CLUBES[Math.floor(Math.random() * CLUBES.length)];
  return {
    nombre: club.nombre,
    imagen: club.imagen || "",
    reputacion: club.reputacion || 0
  };
}

// Sortea el rival de la carrera. Se llama una vez al iniciar.
function sortearRivalidad() {
  if (typeof jugador === "undefined" || !jugador) return null;
  const posicion = jugador.posicion || "DEL";
  const catalogo = catalogoRivalidad(posicion);
  if (!catalogo.length) return null;

  // Nunca se sortea el mismo nombre que eligió el usuario (sin importar
  // mayúsculas ni acentos: "L. Messi" no puede ser su propio rival).
  const propios = [normalizarTextoNombre(jugador.nombre)];
  let candidatos = catalogo.filter(n => !propios.includes(normalizarTextoNombre(n)));
  if (!candidatos.length) candidatos = catalogo;

  const nombre = candidatos[Math.floor(Math.random() * candidatos.length)];
  const club = rivalidadClubAleatorio();
  const cfg = CONFIG.RIVALIDAD;

  // El rival arranca cerca de la media del usuario.
  const base = (typeof mediaActual === "function" ? mediaActual() : jugador.media) || 60;
  const media = Math.max(
    cfg.OVR_MIN_INICIAL,
    Math.min(cfg.OVR_MAX_INICIAL, base + Math.floor(Math.random() * 7) - 3)
  );

  jugador.rivalidad = {
    nombre: nombre,
    posicion: posicion,
    edad: (jugador.edad || CONFIG.EDAD_INICIO) + Math.floor(Math.random() * 3),
    media: media,
    clubNombre: club.nombre,
    clubImagen: club.imagen,
    clubReputacion: club.reputacion,
    titulos: 0,
    partidos: (CONFIG.CARRETA && CONFIG.CARRETA.PARTIDOS_TEMPORADA) || 40,
    goles: 0,
    asistencias: 0,
    duelosGanados: 0,
    duelosPerdidos: 0,
    duelosEmpatados: 0,
    intensidad: cfg.INTENSIDAD_INICIAL,
    dueloUsadoTemporada: false,
    presentado: false
  };
  return jugador.rivalidad;
}

// Si el guardado es viejo y no tiene rival, se genera uno compatible
// con la media y la posición actuales.
function asegurarRivalidad() {
  if (typeof jugador === "undefined" || !jugador) return null;
  if (jugador.rivalidad && jugador.rivalidad.nombre) {
    // Normaliza campos que pudieran faltar en guardados intermedios.
    const r = jugador.rivalidad;
    if (typeof r.intensidad !== "number") r.intensidad = CONFIG.RIVALIDAD.INTENSIDAD_INICIAL;
    if (typeof r.duelosGanados !== "number") r.duelosGanados = 0;
    if (typeof r.duelosPerdidos !== "number") r.duelosPerdidos = 0;
    if (typeof r.duelosEmpatados !== "number") r.duelosEmpatados = 0;
    if (typeof r.goles !== "number") r.goles = 0;
    if (typeof r.asistencias !== "number") r.asistencias = 0;
    if (typeof r.titulos !== "number") r.titulos = 0;
    if (typeof r.partidos !== "number" || r.partidos <= 0) {
      r.partidos = (CONFIG.CARRETA && CONFIG.CARRETA.PARTIDOS_TEMPORADA) || 40;
    }
    if (typeof r.dueloUsadoTemporada !== "boolean") r.dueloUsadoTemporada = false;
    return r;
  }
  return sortearRivalidad();
}

// ============================================================
//  EVOLUCIÓN POR TEMPORADA
// ============================================================

// Goles y asistencias: el rival juega la temporada completa y sus
// números dependen de su media actual. Un OVR alto mete más goles y
// más asistencias; si cae el OVR, sus estadísticas también caen.
function evolucionarStatsRivalidad(r) {
  const potencial = Math.max(0, r.media - 45) / 10;   // 0 en OVR 45, ~5 en OVR 95
  const golsTemporada = Math.max(0, Math.round(potencial * (0.45 + Math.random() * 0.75)));
  const asistTemporada = Math.max(0, Math.round(potencial * (0.25 + Math.random() * 0.55)));
  const partidos = typeof CONFIG.CARRETA !== "undefined" && CONFIG.CARRETA
    ? (CONFIG.CARRETA.PARTIDOS_TEMPORADA || 40) : 40;
  // Los partidos se reconstruyen desde los goles/asistencias del año
  // (no se guardan aparte): el rival juega todos los partidos de su club.
  r.partidos = Math.max(1, partidos);
  r.goles = Math.max(0, (r.goles || 0) + golsTemporada);
  r.asistencias = Math.max(0, (r.asistencias || 0) + asistTemporada);
}

// El rival entrena solo: sube mientras es joven, se frena y decae.
function evolucionarRivalidad() {
  if (typeof jugador === "undefined" || !jugador) return null;
  const r = asegurarRivalidad();
  if (!r) return null;
  const cfg = CONFIG.RIVALIDAD;

  r.edad += 1;

  if (r.edad < cfg.EDAD_DECLIVE) {
    //Ascenso joven: +1 fijo y algo de suerte hasta +3.
    r.media = clampMedia(r.media + 1 + Math.floor(Math.random() * 3));
  } else {
    // Declive por edad: baja entre 0 y 2.
    r.media = clampMedia(r.media - Math.floor(Math.random() * 3));
  }

  // Puede mudarse de club si ya tiene recorrido.
  if (r.edad > CONFIG.EDAD_INICIO + 2 && Math.random() < cfg.PROB_CAMBIO_CLUB) {
    const club = rivalidadClubAleatorio();
    if (club.nombre) {
      r.clubNombre = club.nombre;
      r.clubImagen = club.imagen;
      r.clubReputacion = club.reputacion;
    }
  }

  // Títulos: cuanto más reputativo el club y más alto su OVR, más probable.
  if (r.clubReputacion >= 5 && Math.random() < 0.30) {
    r.titulos += 1;
  }

  evolucionarStatsRivalidad(r);

  return r;
}

// ============================================================
//  PRESENTACIÓN (una vez, al arrancar la carrera)
// ============================================================

function presentarRivalidad() {
  const r = (typeof jugador !== "undefined" && jugador) ? jugador.rivalidad : null;
  if (!r || r.presentado) return;
  r.presentado = true;
  if (typeof mostrarNotificacion === "function") {
    mostrarNotificacion(
      t("rivalidadTitulo"),
      t("rivalidadPresentado").replace("{rival}", r.nombre)
        .replace("{posicion}", r.posicion)
        .replace("{club}", r.clubNombre)
        .replace("{media}", r.media)
    );
  }
}

// ============================================================
//  DUELO DE RIVALIDAD
// ============================================================

// Puntos objetivo del rival en el duelo. Sube con la intensidad de
// la rivalidad y con la brecha de OVR a favor de él.
function objetivoDueloRivalidad() {
  const r = asegurarRivalidad();
  const cfg = CONFIG.RIVALIDAD;
  if (!r) return cfg.DUELO_OBJETIVO_BASE;
  const gap = r.media - mediaActual();
  const bruto = cfg.DUELO_OBJETIVO_BASE
    + r.intensidad * cfg.DUELO_OBJETIVO_POR_INTENSIDAD
    + gap * cfg.DUELO_OBJETIVO_POR_GAP_OVR;
  return Math.max(cfg.DUELO_OBJETIVO_MIN, Math.min(cfg.DUELO_OBJETIVO_MAX, Math.round(bruto)));
}

// ¿Se puede jugar el duelo esta temporada?
function rivalidadDueloDisponible() {
  if (typeof jugador === "undefined" || !jugador || !jugador.rivalidad) return false;
  if (jugador.carreraTerminada) return false;
  return !jugador.rivalidad.dueloUsadoTemporada;
}

// Registra el resultado del duelo: actualiza el historial, la
// intensidad y devuelve el resumen para mostrarlo.
function registrarDueloRivalidad(puntosJugador) {
  const r = asegurarRivalidad();
  if (!r) return null;
  const cfg = CONFIG.RIVALIDAD;

  const objetivo = objetivoDueloRivalidad();
  let resultado = "derrota";
  if (puntosJugador > objetivo + cfg.DUELO_MARGEN_EMPATE) resultado = "victoria";
  else if (Math.abs(puntosJugador - objetivo) <= cfg.DUELO_MARGEN_EMPATE) resultado = "empate";

  if (resultado === "victoria") {
    r.duelosGanados += 1;
    r.intensidad = Math.min(cfg.INTENSIDAD_MAX, r.intensidad + cfg.INTENSIDAD_VICTORIA);
    sumarMedia(cfg.OVR_VICTORIA);
    ajustarMoral(cfg.MORAL_VICTORIA);
  } else if (resultado === "empate") {
    r.duelosEmpatados += 1;
    r.intensidad = Math.min(cfg.INTENSIDAD_MAX, r.intensidad + cfg.INTENSIDAD_EMPATE);
    ajustarMoral(cfg.MORAL_EMPATE);
  } else {
    r.duelosPerdidos += 1;
    r.intensidad = Math.max(cfg.INTENSIDAD_MIN, r.intensidad + cfg.INTENSIDAD_DERROTA);
    ajustarMoral(cfg.MORAL_DERROTA);
  }

  r.dueloUsadoTemporada = true;
  guardarPartida();
  actualizarInterfaz();

  return {
    resultado: resultado,
    puntosJugador: puntosJugador,
    objetivo: objetivo,
    mediaRival: r.media,
    nombre: r.nombre
  };
}

// Hook del flujo de temporadas: evoluciona al rival, enfría la
// rivalidad si no hubo duelo y reinicia el contador anual.
//
// Se engancha a cerrarTemporadaFinalizada() y NO a simularTemporada():
// el cierre real de la temporada pasa siempre por ahí (lo usan tanto
// jugarPartidoContraRival como simularTemporada), mientras que
// simularTemporada() no tiene llamadores en el juego y nunca se
// ejecutaba, así que el rival se quedaba congelado toda la carrera.
const _cerrarTemporadaFinalizadaRivalBase = cerrarTemporadaFinalizada;
cerrarTemporadaFinalizada = function () {
  const previo = (typeof jugador !== "undefined" && jugador) ? jugador.rivalidad : null;
  const dueloEsteAnio = previo ? !!previo.dueloUsadoTemporada : false;
  _cerrarTemporadaFinalizadaRivalBase();
  if (typeof jugador === "undefined" || !jugador || jugador.carreraTerminada) return;
  const r = evolucionarRivalidad();
  if (r) {
    if (!dueloEsteAnio) {
      r.intensidad = Math.max(CONFIG.RIVALIDAD.INTENSIDAD_MIN, r.intensidad - CONFIG.RIVALIDAD.DECAIMIENTO_SIN_DUELO);
    }
    r.dueloUsadoTemporada = false;
  }
};

// ============================================================
//  ARRANQUE DE CARRERA Y RENDER
// ============================================================

// Al iniciar la carrera se sortea el rival y se avisa una vez.
// La base ya renderizó antes de que existiera el rival, así que
// hay que volver a pintar la tarjeta o queda vacía.
const _iniciarCarreraRivalBase = iniciarCarrera;
iniciarCarrera = function () {
  _iniciarCarreraRivalBase();
  sortearRivalidad();
  presentarRivalidad();
  guardarPartida();
  actualizarInterfaz();
};

// Continuar una carrera vieja (sin rival) también lo genera. La base
// ya renderizó el guardado, así que si el rival había que crearlo hay
// que volver a pintar la tarjeta.
const _continuarCarreraRivalBase = continuarCarrera;
continuarCarrera = function () {
  _continuarCarreraRivalBase();
  if (typeof jugador === "undefined" || !jugador) return;
  const previo = jugador.rivalidad;
  const r = asegurarRivalidad();
  if (r && !previo) {
    presentarRivalidad();
    guardarPartida();
    actualizarInterfaz();
  }
};

// Pinta la tarjeta "Tu Rival" del dashboard de Carrera.
function renderizarTarjetaRivalidad() {
  const r = (typeof jugador !== "undefined" && jugador) ? jugador.rivalidad : null;
  const cont = document.getElementById("rival-card");
  if (!cont) return;

  if (!r || !r.nombre) {
    cont.classList.add("vacio-rival");
    const nombre = document.getElementById("rival-nombre");
    if (nombre) nombre.textContent = t("rivalidadSinRival");
    ["rival-posicion", "rival-club", "rival-media", "rival-intensidad-texto",
      "rival-stats", "rival-historial"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.textContent = "—";
    });
    const btn = document.getElementById("btn-duelo-rivalidad");
    if (btn) btn.disabled = true;
    const escudo = document.getElementById("rival-escudo");
    if (escudo) escudo.innerHTML = '<span class="sin-img">?</span>';
    return;
  }

  cont.classList.remove("vacio-rival");

  const escudo = document.getElementById("rival-escudo");
  if (escudo) {
    if (r.clubImagen) {
      escudo.innerHTML = '<img src="' + r.clubImagen + '" alt="' + r.clubNombre + '">';
    } else {
      escudo.innerHTML = '<span class="sin-img">?</span>';
    }
  }

  const nombre = document.getElementById("rival-nombre");
  if (nombre) nombre.textContent = r.nombre;

  const posicion = document.getElementById("rival-posicion");
  if (posicion) posicion.textContent = r.posicion;

  const club = document.getElementById("rival-club");
  if (club) club.textContent = r.clubNombre;

  // Línea separada con los números del rival: goles y asistencias.
  const stats = document.getElementById("rival-stats");
  if (stats) {
    stats.innerHTML =
      '<span class="rival-stat"><b>' + (r.goles || 0) + "</b> " + t("rivalidadGoles") + "</span>" +
      '<span class="rival-stat"><b>' + (r.asistencias || 0) + "</b> " + t("rivalidadAsistencias") + "</span>" +
      '<span class="rival-stat"><b>' + (r.titulos || 0) + "</b> " + t("rivalidadTitulosCorto") + "</span>";
  }

  const media = document.getElementById("rival-media");
  if (media) media.textContent = r.media;

  const intensidadTxt = document.getElementById("rival-intensidad-texto");
  if (intensidadTxt) intensidadTxt.textContent = r.intensidad + "/10";

  const barra = document.getElementById("rival-intensidad-barra");
  if (barra) barra.style.width = (r.intensidad * 10) + "%";

  const hist = document.getElementById("rival-historial");
  if (hist) {
    hist.textContent = t("rivalidadHistorial")
      .replace("{ganados}", r.duelosGanados)
      .replace("{empatados}", r.duelosEmpatados)
      .replace("{perdidos}", r.duelosPerdidos);
  }

  const btn = document.getElementById("btn-duelo-rivalidad");
  if (btn) {
    const disponible = rivalidadDueloDisponible();
    btn.disabled = !disponible;
    // El botón tiene un <span data-i18n> adentro: se escribe ahí para no
    // romper la traducción automática al cambiar de idioma.
    const span = btn.querySelector("span") || btn;
    span.textContent = disponible
      ? t("rivalidadDueloBoton")
      : t("rivalidadDueloUsado");
  }
}

// Se engancha al render general de la interfaz.
const _actualizarInterfazRivalBase = actualizarInterfaz;
actualizarInterfaz = function () {
  _actualizarInterfazRivalBase();
  renderizarTarjetaRivalidad();
};

// ============================================================
//  DUELO DE RIVALIDAD (barra de timing)
//  3 chances: se frena el cursor lo más cerca posible del centro.
//  Los puntos se comparan con el objetivo del rival (su media, la
//  intensidad de la rivalidad y la brecha de OVR).
// ============================================================

let modalRivalidadInstance = null;
let estadoDueloRivalidad = null;

// Crea (o reutiliza) la instancia del modal de Bootstrap.
function obtenerModalRivalidad() {
  const el = document.getElementById("modalRivalidad");
  if (!el) return null;
  if (!modalRivalidadInstance && typeof bootstrap !== "undefined") {
    modalRivalidadInstance = new bootstrap.Modal(el);
  }
  return modalRivalidadInstance;
}

// Traduce la posición del cursor (0-100) a puntos: el centro vale
// 100 y cae linealmente hasta 0 en los bordes.
function puntosDueloRivalidad(posicion) {
  const distancia = Math.abs(50 - posicion);
  return Math.max(0, Math.round(100 - distancia * 2));
}

// Lanza el duelo. Devuelve false si no está disponible.
function iniciarDueloRivalidad() {
  if (!rivalidadDueloDisponible()) {
    mostrarNotificacion(t("rivalidadTitulo"), t("rivalidadDueloYaUsado"));
    return false;
  }
  // Si ya había un duelo corriendo, se limpia antes de empezar otro.
  if (estadoDueloRivalidad) limpiarDueloRivalidad();

  const cfg = CONFIG.RIVALIDAD;
  const modal = obtenerModalRivalidad();
  estadoDueloRivalidad = {
    chances: cfg.DUELO_CHANCES,
    puntos: 0,
    posicion: 0,
    direccion: 1,
    velocidad: 1.6,
    chancesRestantes: cfg.DUELO_CHANCES,
    raf: null,
    terminado: false,
    listeners: []
  };

  // El botón de disparo y la barra: sin esto el modal abría pero
  // el "¡DUELAR!" no hacía nada.
  const btnDisparo = document.getElementById("btn-disparar-rivalidad");
  if (btnDisparo) {
    btnDisparo.disabled = false;
    btnDisparo.addEventListener("click", dispararDueloRivalidad);
    estadoDueloRivalidad.listeners.push([btnDisparo, "click", dispararDueloRivalidad]);
  }
  const barra = document.getElementById("rivalidad-barra");
  if (barra) {
    barra.addEventListener("click", dispararDueloRivalidad);
    estadoDueloRivalidad.listeners.push([barra, "click", dispararDueloRivalidad]);
  }
  const alTeclado = function (ev) {
    if (ev && (ev.code === "Space" || ev.code === "Enter")) {
      if (ev.preventDefault) ev.preventDefault();
      dispararDueloRivalidad();
    }
  };
  document.addEventListener("keydown", alTeclado);
  estadoDueloRivalidad.listeners.push([document, "keydown", alTeclado]);

  const el = document.getElementById("modalRivalidad");
  if (el) {
    el.addEventListener("hidden.bs.modal", limpiarDueloRivalidad, { once: true });
  }
  pintarDueloRivalidad();
  if (modal) modal.show();
  loopDueloRivalidad();
  return true;
}

// Un frame del cursor oscilando de 0 a 100.
function loopDueloRivalidad() {
  const e = estadoDueloRivalidad;
  if (!e || e.terminado) return;
  e.posicion += e.direccion * e.velocidad;
  if (e.posicion >= 100) { e.posicion = 100; e.direccion = -1; }
  if (e.posicion <= 0) { e.posicion = 0; e.direccion = 1; }
  pintarDueloRivalidad();
  e.raf = requestAnimationFrame(loopDueloRivalidad);
}

// El jugador frena el cursor: suma puntos y gasta una chance.
function dispararDueloRivalidad() {
  const e = estadoDueloRivalidad;
  if (!e || e.terminado || e.chancesRestantes <= 0) return;
  const p = puntosDueloRivalidad(e.posicion);
  e.puntos += p;
  e.chancesRestantes -= 1;
  e.velocidad = Math.min(4, e.velocidad + 0.4);

  pintarDueloRivalidad(p);

  if (e.chancesRestantes <= 0) finalizarDueloRivalidad();
}

// Cierra el duelo y aplica el resultado.
function finalizarDueloRivalidad() {
  const e = estadoDueloRivalidad;
  if (!e || e.terminado) return;
  e.terminado = true;
  if (e.raf) { cancelAnimationFrame(e.raf); e.raf = null; }

  const resumen = registrarDueloRivalidad(e.puntos);
  if (!resumen) return;

  const resultado = document.getElementById("rivalidad-resultado");
  if (resultado) {
    const clase = resumen.resultado === "victoria" ? "text-success"
      : resumen.resultado === "empate" ? "text-warning" : "text-danger";
    const titulo = resumen.resultado === "victoria" ? t("rivalidadVictoria")
      : resumen.resultado === "empate" ? t("rivalidadEmpate") : t("rivalidadDerrota");
    resultado.innerHTML =
      '<div class="fs-4 fw-bold ' + clase + '">' + titulo + "</div>" +
      '<div class="small text-secondary">' + resumen.puntosJugador + " / " + resumen.objetivo + "</div>" +
      '<div class="small mt-2">' + t("rivalidadResultadoDuelo")
        .replace("{nombre}", resumen.nombre)
        .replace("{intensidad}", jugador.rivalidad.intensidad) + "</div>";
  }

  const btn = document.getElementById("btn-disparar-rivalidad");
  if (btn) btn.disabled = true;
  const seguir = document.getElementById("btn-cerrar-rivalidad");
  if (seguir) seguir.classList.remove("hidden");
}

// Pinta barra, chances y marcador.
function pintarDueloRivalidad(puntosTurno) {
  const e = estadoDueloRivalidad;
  if (!e) return;
  const cursor = document.getElementById("rivalidad-cursor");
  if (cursor) cursor.style.left = e.posicion + "%";
  const marcador = document.getElementById("rivalidad-marcador");
  if (marcador) {
    marcador.textContent = t("rivalidadMarcador")
      .replace("{chance}", e.chances - e.chancesRestantes + 1)
      .replace("{total}", e.chances)
      .replace("{puntos}", e.puntos);
  }
  const objetivo = document.getElementById("rivalidad-objetivo");
  if (objetivo) objetivo.textContent = t("rivalidadObjetivo").replace("{valor}", objetivoDueloRivalidad());
  const turno = document.getElementById("rivalidad-turno");
  if (turno && typeof puntosTurno === "number") {
    turno.textContent = t("rivalidadTurno").replace("{puntos}", puntosTurno);
  }
  const btn = document.getElementById("btn-disparar-rivalidad");
  if (btn) btn.disabled = e.chancesRestantes <= 0;
}

// Limpia timers y listeners al cerrar el modal.
function limpiarDueloRivalidad() {
  const e = estadoDueloRivalidad;
  if (e) {
    if (e.raf) cancelAnimationFrame(e.raf);
    e.raf = null;
    e.terminado = true;
    (e.listeners || []).forEach(function (l) {
      if (l && l[0] && l[0].removeEventListener) l[0].removeEventListener(l[1], l[2]);
    });
    e.listeners = [];
    estadoDueloRivalidad = null;
  }
  const resultado = document.getElementById("rivalidad-resultado");
  if (resultado) resultado.innerHTML = "";
  const turno = document.getElementById("rivalidad-turno");
  if (turno) turno.textContent = "";
  const marcador = document.getElementById("rivalidad-marcador");
  if (marcador) marcador.textContent = "—";
  const cursor = document.getElementById("rivalidad-cursor");
  if (cursor) cursor.style.left = "0%";
  const btnCerrar = document.getElementById("btn-cerrar-rivalidad");
  if (btnCerrar) btnCerrar.classList.add("hidden");
  const btn = document.getElementById("btn-disparar-rivalidad");
  if (btn) { btn.disabled = false; }
}