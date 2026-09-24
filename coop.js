// ============================================================
//  COOPERATIVO ONLINE - "DUPLA DE CARRERAS" (coop.js)
//  V1 - Carrera PSO
//
//  Dos usuarios en la MISMA sala comparten UN proyecto: el mismo
//  club y la misma selección ("la dupla"). Cada uno juega su propia
//  carrera en paralelo (simulación determinista por semilla del
//  servidor, igual que el duelo), y cada temporada hay UN momento
//  cooperativo: la táctica de un partido de la selección que eligen
//  a ciegas los dos. La elección de AMBOS decide el marcador y el
//  resultado compartido. Los goles/títulos de la dupla se suman al
//  proyecto en conjunto. Cierra con confirmación server-side.
//
//  Estructura (espejo de duelo.js):
//   - Parte 1: logica pura (testeable sin DOM) -> window.CoperoCoopLogica
//   - Parte 2: lobby 0/2 -> 1/2 -> 2/2, config del anfitrión, HUD,
//              temporadas deterministas y retiro.
//
//  Se carga DESPUES de data.js, app.js, features.js, cuenta-api.js,
//  cuenta-ui.js y duelo.js (reutiliza CoperoDueloLogica).
// ============================================================

(function() {
  "use strict";

  // ============================================================
  //  PARTE 1: CONFIGURACION Y LOGICA PURA (sin DOM)
  // ============================================================

  const COOP_CFG = (typeof CONFIG !== "undefined" && CONFIG.COOP) || {
    TEMPORADAS: 8,
    TIMER_MS: 10000,
    EDAD_INICIO: 22,
    TACTICAS: ["A", "B", "C"],
    META_GOLES_INT_POR_TEMP: 2,
    META_TROFEOS_MIN: 2
  };

  // Las tres tácticas del momento cooperativo (partido de selección).
  const COOP_TACTICAS = {
    A: { label: "🔥 Presión alta", desc: "más goles, más riesgo" },
    B: { label: "⚖️ Equilibrado", desc: "balance entre ataque y defensa" },
    C: { label: "🛡️ Defensa total", desc: "menos goles, más seguridad" }
  };

  // Semilla del SERVIDOR (006): la setea la Parte 2 cuando el RPC de sala
  // responde. Sin servidor, se usa el topic de la sala (como en el duelo).
  let coopSemillaServidor = null;

  function hashCoop(str) {
    const dl = (typeof window !== "undefined") ? window.CoperoDueloLogica : null;
    if (dl && typeof dl.hashSemilla === "function") return dl.hashSemilla(str);
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // PRNG determinista (mulberry32): ambos clientes generan EXACTAMENTE la
  // misma secuencia con la misma semilla (no hay Math.random en la Parte 1
  // de las decisiones/simulaciones compartidas).
  function prngDeterminista(semilla) {
    let a = semilla >>> 0;
    return function() {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Semilla por sala + temporada + clave. Con semilla del servidor, el
  // navegador no puede elegir un rival/táctica cómoda.
  function semillaCoop(topic, temporada, clave) {
    const base = coopSemillaServidor || (topic || "sala");
    return hashCoop(base + "|coop-" + (clave || "") + "-" + temporada);
  }

  const POSICIONES_COOP = ["DEL", "CM", "DEF", "GK"];

  function asignarPosicionCoop(rol, topic) {
    const idx = semillaCoop(topic, 0, "pos-" + rol) % POSICIONES_COOP.length;
    return POSICIONES_COOP[idx];
  }

  // Jugador real de la dupla: cada integrante tiene SU propia carrera, pero
  // comparten el MISMO club (se asigna al construir la dupla).
  function construirMiCoop(apodo, rol, topic) {
    return {
      apodo: apodo || "Jugador",
      rol: rol || "A",
      posicion: asignarPosicionCoop(rol || "A", topic),
      ovr: 60,
      moral: 60,
      edad: COOP_CFG.EDAD_INICIO || 22,
      goles: 0,
      asistencias: 0,
      historial: [],
      alertEdadMostrada: false
    };
  }

  function clubDeReputacionCoop(rep) {
    const clubes = (typeof CLUBES !== "undefined") ? CLUBES : [];
    const repN = Math.max(1, Math.min(10, Number(rep) || 5));
    return clubes.find(function(c) { return c.reputacion === repN; }) ||
      clubes.find(function(c) { return c.reputacion >= repN; }) ||
      clubes[0] || { nombre: "Libre", reputacion: repN };
  }

  // Núcleo compartido de la dupla: el mismo club y la misma selección.
  function construirDuplaCoop(cfg, topic) {
    void topic;
    const rep = Math.max(1, Math.min(10, Number(cfg && cfg.rep) || 5));
    const sel = (cfg && cfg.sel) ? seleccionPorCodigo(cfg.sel) : null;
    const seleccion = sel || seleccionPorCodigo("ARG") ||
      { codigo: "ARG", nombre: "Argentina", bandera: "🇦🇷", fuerza: 99 };
    return {
      club: clubDeReputacionCoop(rep),
      seleccion: seleccion,
      partidosSeleccion: 0,
      golesSeleccion: 0,
      victoriasSeleccion: 0,
      puntosSincronia: 0,
      trofeos: {},
      detalleTrofeos: {}
    };
  }

  // Trofeos del CLUB de la dupla (mismas probabilidades que la carrera
  // individual y el duelo, pero con el OVR promedio de la pareja).
  function simularTrofeosCoop(rep, ovrCombinado, rand) {
    rand = rand || Math.random;
    const trofeos = [];
    const esPrimera = rep > 5;
    if (!esPrimera) {
      if (rand() < (rep / 5) * 0.20 + (ovrCombinado / 100) * 0.10) trofeos.push("🏆 Segunda División");
      if (rand() < 0.10 + (ovrCombinado / 100) * 0.08) trofeos.push("🍷 Copa Apa");
    } else {
      if (rand() < ((rep - 5) / 5) * 0.25 + (ovrCombinado / 100) * 0.08) trofeos.push("🏆 Primera División");
      if (rand() < 0.08 + (rep / 10) * 0.10 + (ovrCombinado / 100) * 0.05) trofeos.push("🇦🇷 Copa Argentina");
      if (rand() < 0.05 + (ovrCombinado / 100) * 0.04) trofeos.push("👑 Copa de Campeones");
    }
    return trofeos;
  }

  // Mapea un nombre de trofeo (string) a su clave contadora.
  function claveTrofeoCoop(tro) {
    const claves = { "Primera División": "primera", "Segunda División": "segunda", "Copa Argentina": "copaAr", "Copa Apa": "copaApa", "Copa de Campeones": "copaCam" };
    for (const k in claves) {
      if (String(tro).indexOf(k) !== -1) return claves[k];
    }
    return null;
  }

  // Meta del PROYECTO compartido: depende del esfuerzo de AMBOS.
  function metaCoopCumplida(golesSeleccion, temporadas, trofeosCount, cfg) {
    const c = cfg || COOP_CFG;
    return (golesSeleccion >= (temporadas || 0) * (c.META_GOLES_INT_POR_TEMP || 2)) &&
      (trofeosCount >= (c.META_TROFEOS_MIN || 2));
  }

  // Rival de la selección de la dupla: se elige determinista por semilla,
  // de fuerza parecida a la nuestra (partido creíble para la dupla).
  function rivalSeleccionCoop(seleccion, topic, temporada) {
    const catalogo = (typeof SELECCIONES !== "undefined") ? SELECCIONES : [];
    const fSel = (seleccion && seleccion.fuerza) || 80;
    const filtrados = (catalogo || []).filter(function(s) { return s[0] !== seleccion.codigo; });
    if (!filtrados.length) {
      return { codigo: seleccion.codigo, nombre: seleccion.nombre, bandera: seleccion.bandera, fuerza: fSel };
    }
    const cercanos = filtrados.filter(function(s) { return Math.abs(s[4] - fSel) <= 14; });
    const pool = cercanos.length ? cercanos : filtrados;
    const idx = semillaCoop(topic, temporada, "rival") % pool.length;
    const s = pool[idx];
    return { codigo: s[0], nombre: s[1], bandera: s[2], fuerza: s[4] };
  }

  // Resolución determinística del MOMENTO COOPERATIVO (táctica a ciegas).
  // Ambos clientes computan EXACTAMENTE el mismo marcador con la misma
  // semilla + las elecciones de cada uno. La elección de AMBOS importa:
  //   - la MISMA táctica = +1 gol y sincronía (+moral);
  //   - Presión total (A+A) = +2 goles extra;
  //   - Defensa total (C+C) = -1 gol (demasiado conservador);
  //   - tácticas opuestas (A vs C) = -2 goles (desorden).
  function resolverDecisionCoop(seleccion, partido, eleccionLocal, eleccionRival, rand) {
    rand = rand || Math.random;
    const fSel = (seleccion && seleccion.fuerza) || 80;
    const fRiv = (partido && partido.fuerzaRival) || 76;
    const base = 1 + Math.floor(rand() * 3);
    let delta = 0;
    const l = eleccionLocal, r = eleccionRival;
    const sincronia = l === r;
    if (sincronia) delta += 1;
    if (l === "A" && r === "A") delta += 2;
    if (l === "C" && r === "C") delta -= 1;
    if ((l === "A" && r === "C") || (l === "C" && r === "A")) delta -= 2;
    const golesSel = Math.max(0, base + delta);
    const golesRiv = Math.max(0, Math.floor(((fRiv / (fSel + 30)) * 2.6) * (rand() * 0.6 + 0.3)));
    const bonusMoral = (l === "A" && r === "A") ? 8 : (sincronia ? 5 : 0);
    return {
      golesSel: golesSel,
      golesRiv: golesRiv,
      victoria: golesSel > golesRiv,
      empate: golesSel === golesRiv,
      sincronia: sincronia,
      bonusMoral: bonusMoral
    };
  }

  // Resumen de UN integrante de la dupla (aporte individual).
  function resumenCoop(j) {
    const h = j.historial || [];
    const ovrMax = h.reduce(function(m, x) { return Math.max(m, x.ovr); }, j.ovr);
    const ovrProm = h.length ? Math.round(h.reduce(function(a, x) { return a + x.ovr; }, 0) / h.length) : j.ovr;
    return {
      apodo: j.apodo, rol: j.rol, posicion: j.posicion,
      ovrMax: ovrMax, ovrProm: ovrProm,
      goles: j.goles, asistencias: j.asistencias, ovr: j.ovr
    };
  }

  // Puntaje del APORTE individual (misma fórmula que el duelo, sin clásicos).
  function calcularAporteCoop(s) {
    return Math.round(
      (s.ovrMax || 0) * 15 +
      (s.ovrProm || 0) * 10 +
      (s.goles || 0) * 2 +
      (s.asistencias || 0) * 1
    );
  }

  // Resultado FINAL del proyecto de la dupla: aportes de ambos + lo que
  // la dupla logró en la selección y con el club compartido.
  function calcularProyectoCoop(miRes, socioRes, dupla, temporadas, cfg) {
    const c = cfg || COOP_CFG;
    const golesSel = (dupla && dupla.golesSeleccion) || 0;
    const trofeos = Object.keys((dupla && dupla.trofeos) || {}).reduce(function(a, k) { return a + dupla.trofeos[k]; }, 0);
    const aporteMi = calcularAporteCoop(miRes);
    const aporteSocio = calcularAporteCoop(socioRes);
    return {
      aporteMi: aporteMi,
      aporteSocio: aporteSocio,
      golesSel: golesSel,
      partidosSel: (dupla && dupla.partidosSeleccion) || 0,
      trofeos: trofeos,
      puntaje: aporteMi + aporteSocio + golesSel * 5 + trofeos * 50,
      meta: metaCoopCumplida(golesSel, temporadas, trofeos, c)
    };
  }

  // API pura para tests
  window.CoperoCoopLogica = {
    COOP_CFG: COOP_CFG,
    COOP_TACTICAS: COOP_TACTICAS,
    hashCoop: hashCoop,
    prngDeterminista: prngDeterminista,
    semillaCoop: semillaCoop,
    asignarPosicionCoop: asignarPosicionCoop,
    construirMiCoop: construirMiCoop,
    clubDeReputacionCoop: clubDeReputacionCoop,
    construirDuplaCoop: construirDuplaCoop,
    simularTrofeosCoop: simularTrofeosCoop,
    claveTrofeoCoop: claveTrofeoCoop,
    metaCoopCumplida: metaCoopCumplida,
    rivalSeleccionCoop: rivalSeleccionCoop,
    resolverDecisionCoop: resolverDecisionCoop,
    resumenCoop: resumenCoop,
    calcularAporteCoop: calcularAporteCoop,
    calcularProyectoCoop: calcularProyectoCoop,
    _setSemillaServidor: function(s) { coopSemillaServidor = s || null; }
  };

  // ============================================================
  //  PARTE 2: INTERFAZ Y SINCRONIZACION (requiere DOM)
  // ============================================================
  if (typeof document === "undefined") return;

  const PANTALLA = "pantalla-coop";
  let caSesion = null; // conexion realtime de la sala (coop)
  let c = null;        // estado de la dupla
  let cModal = null;
  let cTimers = [];    // intervalos/timeouts activos de la interfaz
  let cCola = null;    // estado de la cola de matchmaking (BUSCAR DUPLA)
  const COOP_COLA_TOPIC = "coop:cola-online";

  function icoCoop(nombre, tam) {
    if (typeof iconoSVG === "function") return iconoSVG(nombre, tam || 18);
    return "";
  }
  function tCoop(clave, fallback) {
    if (typeof uiT === "function") return uiT(clave, fallback);
    return fallback;
  }

  function limpiarTimersCoop() {
    cTimers.forEach(function(t) { clearInterval(t); clearTimeout(t); });
    cTimers = [];
  }
  function enTareaCoop(fn, ms) { const t = setTimeout(fn, ms); cTimers.push(t); return t; }
  function enIntervaloCoop(fn, ms) { const t = setInterval(fn, ms); cTimers.push(t); return t; }

  function slugCoop(txt) {
    return String(txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  }
  function escCoop(txt) {
    return String(txt == null ? "" : txt).replace(/[&<>"']/g, function(c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function avatarCoop(nombre) {
    const iniciales = String(nombre || "?").trim().split(/\s+/).map(function(p) { return p[0] || ""; }).join("").slice(0, 2).toUpperCase() || "?";
    return '<div class="duelo-avatar">' + escCoop(iniciales) + "</div>";
  }
  function obtenerRolCoop(ovr) {
    if (typeof obtenerRol === "function") return obtenerRol(ovr);
    return { nombre: "Normal", color: "#adb5bd", emoji: "⚽" };
  }

  function notifCoop(titulo, html, cb) {
    if (typeof mostrarNotificacion === "function") { mostrarNotificacion(titulo, html, cb); return; }
    alert(titulo + "\n\n" + String(html).replace(/<[^>]+>/g, ""));
    if (cb) cb();
  }

  function asegurarModalCoop() {
    if (cModal) return cModal;
    let el = document.getElementById("modalCoop");
    if (!el) {
      el = document.createElement("div");
      el.className = "modal fade";
      el.id = "modalCoop";
      el.tabIndex = -1;
      el.setAttribute("aria-hidden", "true");
      el.innerHTML =
        '<div class="modal-dialog modal-dialog-centered modal-lg">' +
        '<div class="modal-content card-custom border-success">' +
        '<div class="modal-header border-bottom-0"><h5 class="modal-title w-100 fw-bold text-success text-center" id="modalCoopTitulo"></h5></div>' +
        '<div class="modal-body text-center" id="modalCoopCuerpo"></div>' +
        '<div class="modal-footer border-top-0 justify-content-center pt-0" id="modalCoopFooter"></div>' +
        "</div></div>";
      document.body.appendChild(el);
    }
    cModal = new bootstrap.Modal(el, { backdrop: "static", keyboard: false });
    return cModal;
  }
  function abrirModalCoop(titulo, cuerpoHtml, footerHtml) {
    const m = asegurarModalCoop();
    document.getElementById("modalCoopTitulo").innerHTML = titulo;
    document.getElementById("modalCoopCuerpo").innerHTML = cuerpoHtml;
    document.getElementById("modalCoopFooter").innerHTML = footerHtml || "";
    m.show();
  }
  function cerrarModalCoop() {
    if (cModal) cModal.hide();
  }
  function actualizarModalCoop(cuerpoHtml, footerHtml) {
    if (!cModal) return;
    document.getElementById("modalCoopCuerpo").innerHTML = cuerpoHtml;
    document.getElementById("modalCoopFooter").innerHTML = footerHtml || "";
  }

  let cTimerIntervalo = null;
  function iniciarTimerCoop(segundos, onExpira) {
    detenerTimerCoop();
    const el = document.getElementById("coop-timer");
    if (!el) return;
    el.classList.remove("hidden");
    let restante = Math.ceil(segundos);
    el.innerHTML = "⏱️ <strong>" + restante + "</strong>s para elegir la táctica (si no, decide el tiempo)";
    cTimerIntervalo = enIntervaloCoop(function() {
      restante--;
      if (restante <= 0) {
        detenerTimerCoop();
        if (onExpira) onExpira();
      } else {
        el.innerHTML = "⏱️ <strong>" + restante + "</strong>s para elegir la táctica (si no, decide el tiempo)";
      }
    }, 1000);
    return cTimerIntervalo;
  }
  function detenerTimerCoop() {
    if (cTimerIntervalo) { clearInterval(cTimerIntervalo); cTimerIntervalo = null; }
    const el = document.getElementById("coop-timer");
    if (el) { el.classList.add("hidden"); el.innerHTML = ""; }
  }

  // ============================================================
  //  LOBBY Y MATCHMAKING (misma infraestructura que el duelo)
  // ============================================================
  let miApodoCoop = "Dupla";

  function abrirPantallaCoop(opts) {
    limpiarTimersCoop();
    const inicio = document.getElementById("pantalla-inicio");
    const juego = document.getElementById("pantalla-juego");
    const resumen = document.getElementById("pantalla-resumen");
    if (inicio) inicio.classList.add("hidden");
    if (juego) juego.classList.add("hidden");
    if (resumen) resumen.classList.add("hidden");
    let pantalla = document.getElementById(PANTALLA);
    if (!pantalla) {
      pantalla = document.createElement("div");
      pantalla.id = PANTALLA;
      (document.querySelector(".react-container") || document.querySelector(".container") || document.body).appendChild(pantalla);
    }
    pantalla.classList.remove("hidden");

    const cuenta = window.CoperoCuenta;
    if (!cuenta || !cuenta.tieneSesion() || !(typeof supabase !== "undefined")) {
      pantalla.innerHTML =
        '<div class="card card-custom p-4 mt-3 text-center">' +
        '<h4 class="fw-bold text-success">🤝 Cooperativo Online (Dupla de Carreras)</h4>' +
        '<p class="mt-3">' + (!cuenta
          ? "⛔ <strong>Es obligatorio tener usuario para jugar.</strong><br>Iniciá sesión o creá tu cuenta en el panel «👤 Mi cuenta» de la pantalla principal."
          : "⛔ <strong>Tenés que iniciar sesión o crear una cuenta</strong> para usar el modo Cooperativo Online.<br>Hacela en el panel «👤 Mi cuenta» de la pantalla principal y, después de loguearte, volvé a recargar.") + "</p>" +
        '<button class="btn btn-outline-secondary mt-3" onclick="volverInicioCoop()">← Volver</button>' +
        "</div>";
      return;
    }

    pantalla.innerHTML = '<div class="card card-custom p-4 mt-3 text-center"><p>⏳ Cargando tu perfil...</p></div>';
    cuenta.perfil().then(function(apodo) {
      renderLobbyCoop(apodo || "Dupla");
      if (opts && opts.autoBuscar) buscarPartidoCoop();
    }).catch(function() {
      pantalla.innerHTML =
        '<div class="card card-custom p-4 mt-3 text-center">' +
        "<h4>🤝 Cooperativo Online</h4>" +
        "<p>⛔ No se pudo leer tu perfil. Revisá tu sesión en «👤 Mi cuenta» e intentá de nuevo.</p>" +
        '<button class="btn btn-outline-secondary mt-3" onclick="volverInicioCoop()">← Volver</button>' +
        "</div>";
    });
  }

  function volverInicioCoop() {
    cerrarSesionCoop();
    salirDeColaCoop();
    const pantalla = document.getElementById(PANTALLA);
    if (pantalla) pantalla.classList.add("hidden");
    const inicio = document.getElementById("pantalla-inicio");
    if (inicio) inicio.classList.remove("hidden");
  }

  function renderLobbyCoop(apodo) {
    miApodoCoop = apodo || "Dupla";
    const pantalla = document.getElementById(PANTALLA);
    pantalla.innerHTML =
      '<div class="card card-custom p-4 mt-3 duelo-lobby" id="coop-lobby">' +
      '<div class="text-center mb-2">' +
      '<div class="duelo-lobby-icon">' + icoCoop("duo", 26) + "</div>" +
      '<h4 class="fw-bold mb-1 text-success">🤝 Cooperativo Online</h4>' +
      '<p class="small text-secondary mb-0">Dupla de Carreras · ' + COOP_CFG.TEMPORADAS + " temporadas en tiempo real · mismo club y misma selección</p>" +
      "</div>" +
      '<div class="d-flex justify-content-center align-items-center gap-2 flex-wrap mt-2 mb-4">' +
      avatarCoop(apodo) +
      '<span class="fw-bold">' + escCoop(apodo) + "</span>" +
      '<span class="chip-small">✔️ Sesión verificada</span>' +
      "</div>" +
      // Panel de búsqueda (BUSCAR DUPLA)
      '<div id="coop-buscar-panel" class="duelo-cola-panel hidden mb-3">' +
      '<div class="duelo-spinner" aria-hidden="true"></div>' +
      '<div class="duelo-cola-titulo text-success">BUSCANDO SOCIO</div>' +
      '<div class="small text-secondary mt-1">Buscando un socio para la dupla...</div>' +
      '<div id="coop-cola-gente" class="small text-3 mt-1"></div>' +
      '<button class="btn btn-outline-danger fw-bold mt-3 px-4" onclick="cancelarBusquedaCoop()">✕ CANCELAR</button>' +
      "</div>" +
      '<button id="btn-coop-buscar" class="btn btn-success btn-lg fw-bold w-100" onclick="buscarPartidoCoop()">' +
      icoCoop("duo", 18) + " BUSCAR SOCIO</button>" +
      '<p class="text-center small text-3 mt-2 mb-4">Jugá en dupla: mismo club y misma selección, decisiones compartidas</p>' +
      '<div class="duelo-divisor"><span>o creá una sala con un amigo</span></div>' +
      '<div class="row g-3 mt-1" id="coop-botones-salas">' +
      '<div class="col-md-6"><div class="border rounded p-3 h-100">' +
      '<h6 class="fw-bold">🟢 Crear sala</h6>' +
      '<input id="coop-crear-nombre" class="form-control mb-2" placeholder="Nombre de la sala" maxlength="30">' +
      '<input id="coop-crear-clave" type="password" class="form-control mb-2" placeholder="Contraseña de la sala" maxlength="30">' +
      '<button class="btn btn-warning fw-bold w-100" onclick="crearSalaCoop()">Crear sala y esperar socio</button>' +
      "</div></div>" +
      '<div class="col-md-6"><div class="border rounded p-3 h-100">' +
      '<h6 class="fw-bold">🔗 Unirse a sala</h6>' +
      '<input id="coop-unir-nombre" class="form-control mb-2" placeholder="Nombre de la sala" maxlength="30">' +
      '<input id="coop-unir-clave" type="password" class="form-control mb-2" placeholder="Contraseña de la sala" maxlength="30">' +
      '<button class="btn btn-outline-success fw-bold w-100" onclick="unirseSalaCoop()">Unirme a la dupla</button>' +
      "</div></div></div>" +
      '<div id="coop-sala-panel" class="mt-3 hidden"></div>' +
      '<div id="coop-lobby-estado" class="mt-3"></div>' +
      '<div class="text-center mt-3"><button class="btn btn-outline-secondary btn-sm" onclick="volverInicioCoop()">← Volver al inicio</button></div>' +
      "</div>";
    document.getElementById("coop-crear-nombre").value = "";
  }

  function estadoLobbyCoop(html) {
    const el = document.getElementById("coop-lobby-estado");
    if (el) el.innerHTML = html;
  }

  // Panel de sala conectada: contador 0/2 -> 1/2 -> 2/2 + config del dupla.
  function renderPanelSalaCoop(html) {
    const el = document.getElementById("coop-sala-panel");
    if (el) { el.classList.remove("hidden"); el.innerHTML = html; }
  }

  function crearSalaCoop() {
    if (cCola && cCola.activo) { estadoLobbyCoop('<div class="alert alert-warning p-2 mb-0">⚠️ Estás en BUSCAR SOCIO. CANCELÁ la búsqueda para crear una sala.</div>'); return; }
    const nombre = document.getElementById("coop-crear-nombre").value.trim();
    const clave = document.getElementById("coop-crear-clave").value;
    const error = validarDatosSalaCoop(nombre, clave);
    if (error) { estadoLobbyCoop('<div class="alert alert-warning p-2 mb-0">⚠️ ' + error + "</div>"); return; }
    conectarCanalCoop(nombre, clave);
  }

  function unirseSalaCoop() {
    if (cCola && cCola.activo) { estadoLobbyCoop('<div class="alert alert-warning p-2 mb-0">⚠️ Estás en BUSCAR SOCIO. CANCELÁ la búsqueda para unirte a una sala.</div>'); return; }
    const nombre = document.getElementById("coop-unir-nombre").value.trim();
    const clave = document.getElementById("coop-unir-clave").value;
    const error = validarDatosSalaCoop(nombre, clave);
    if (error) { estadoLobbyCoop('<div class="alert alert-warning p-2 mb-0">⚠️ ' + error + "</div>"); return; }
    conectarCanalCoop(nombre, clave);
  }

  function validarDatosSalaCoop(nombre, clave) {
    if (!nombre || nombre.trim().length < 3) return "El nombre de la sala debe tener al menos 3 caracteres.";
    if (!clave || clave.length < 3) return "La contraseña de la sala debe tener al menos 3 caracteres.";
    return null;
  }

  // Matchmaking de la dupla: cola pública en un canal PROPIO (coop:cola-online)
  // para no cruzarse con la cola de duelos. El par sigue siendo determinista
  // (los 2 más antiguos) y reutiliza saleAutomaticaDuelo para calcular la sala.
  function buscarPartidoCoop() {
    if (caSesion || (c && c.activo)) return;
    if (cCola && cCola.activo) return;
    if (cCola && cCola.canal) salirDeColaCoop();
    if (!cCola) cCola = { activo: false, miId: null, apodo: "", ts: 0, canal: null, cliente: null, conectado: false };

    const cuenta = window.CoperoCuenta;
    if (!cuenta || !cuenta.tieneSesion()) return;
    const apodo = miApodoCoop || "Dupla";
    cCola.apodo = apodo;
    cCola.ts = Date.now();
    cCola.activo = true;
    cCola.miId = cCola.miId || "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    const sb = supabase.createClient(COPERO_SUPABASE.url, COPERO_SUPABASE.publishableKey);
    cCola.cliente = sb;
    mostrarPanelBusquedaCoop(true);

    const canal = sb.channel(COOP_COLA_TOPIC, { config: { presence: { key: cCola.miId } } });
    cCola.canal = canal;
    canal.on("presence", { event: "sync" }, function() { chequearColaCoop(); });
    canal.on("presence", { event: "leave" }, function() { chequearColaCoop(); });
    canal.subscribe(function(estado) {
      if (estado === "SUBSCRIBED") {
        if (!cCola || !cCola.activo) { try { canal.untrack(); } catch (e) { /* noop */ } return; }
        cCola.conectado = true;
        canal.track({ id: cCola.miId, apodo: cCola.apodo, ts: cCola.ts });
        actualizarColaGenteCoop();
      } else if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
        if (cCola && cCola.activo) {
          salirDeColaCoop();
          renderLobbyCoop(miApodoCoop);
          estadoLobbyCoop('<div class="alert alert-danger p-2 mb-0">🔴 No se pudo conectar a la cola online. Revisá tu conexión e intentá otra vez.</div>');
        }
      }
    });
  }

  function salirDeColaCoop() {
    if (!cCola) return;
    cCola.activo = false;
    cCola.conectado = false;
    if (cCola.canal) {
      try {
        cCola.canal.untrack();
        if (cCola.cliente && cCola.cliente.removeChannel) cCola.cliente.removeChannel(cCola.canal);
      } catch (e) { /* noop */ }
      cCola.canal = null;
    }
    cCola.cliente = null;
    mostrarPanelBusquedaCoop(false);
  }

  function cancelarBusquedaCoop() {
    salirDeColaCoop();
    renderLobbyCoop(miApodoCoop);
    estadoLobbyCoop('<div class="alert alert-secondary p-2 mb-0">⏹️ Búsqueda cancelada.</div>');
  }

  function mostrarPanelBusquedaCoop(visible) {
    const panel = document.getElementById("coop-buscar-panel");
    const btn = document.getElementById("btn-coop-buscar");
    if (panel) panel.classList.toggle("hidden", !visible);
    if (btn) {
      btn.disabled = visible;
      if (visible) {
        btn.innerHTML = '<span class="duelo-btn-spinner"></span> BUSCAR SOCIO...';
      } else {
        btn.innerHTML = icoCoop("duo", 18) + " BUSCAR SOCIO";
      }
    }
  }

  function actualizarColaGenteCoop() {
    const el = document.getElementById("coop-cola-gente");
    if (!el || !cCola || !cCola.canal) return;
    const presentes = Object.keys(cCola.canal.presenceState() || {}).length;
    el.textContent = presentes >= 2
      ? "🌍 " + presentes + " jugadores esperando..."
      : presentes === 1
      ? "Aún no llega nadie. Quedate conectado..."
      : "Conectando a la cola...";
  }

  function chequearColaCoop() {
    if (!cCola || !cCola.activo || !cCola.canal) return;
    const estado = cCola.canal.presenceState() || {};
    const ids = Object.keys(estado);
    actualizarColaGenteCoop();
    const presentes = ids.map(function(k) {
      const m = estado[k] && estado[k][0];
      return { id: k, ts: m && typeof m.ts === "number" ? m.ts : 0 };
    });
    const dl = (typeof window.CoperoDueloLogica !== "undefined") ? window.CoperoDueloLogica : null;
    if (!dl) return;
    const par = dl.calcularParejaCola(presentes, cCola.miId);
    if (!par) return;
    const sala = dl.salaAutomaticaDuelo(par.ids);
    salirDeColaCoop();
    renderLobbyCoop(miApodoCoop);
    estadoLobbyCoop('<div class="alert alert-success p-2 mb-0">🎯 ¡Socio encontrado! Conectando a la dupla...</div>');
    conectarCanalCoop(sala.nombre, sala.clave, { modoAuto: true });
  }

  function conectarCanalCoop(nombre, clave, opts) {
    opts = opts || {};
    const cuenta = window.CoperoCuenta;
    cuenta.perfil().then(function(apodo) {
      miApodoCoop = apodo || "Dupla";
      const topic = "coop:" + slugCoop(nombre) + "-" + slugCoop(clave);
      const miId = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

      caSesion = {
        salaNombre: nombre, topic: topic, miId: miId, apodo: miApodoCoop,
        canal: null, conectado: false, holas: {}, iniciado: false, cerrada: false,
        holaEnviado: false, modoAuto: !!opts.modoAuto,
        configMostrada: false, semillaServidor: null, rolServidor: null, verificado: false
      };

      if (opts.modoAuto) {
        estadoLobbyCoop('<div class="alert alert-info p-2 mb-0">🎯 Socio encontrado. Conectando a la dupla privada...</div>');
      } else {
        estadoLobbyCoop('<div class="alert alert-info p-2 mb-0">🌐 Conectando a la sala <strong>' + escCoop(nombre) + "</strong>...</div>");
      }

      const sb = supabase.createClient(COPERO_SUPABASE.url, COPERO_SUPABASE.publishableKey);
      const canal = sb.channel(topic, { config: { broadcast: { self: false }, presence: { key: miId } } });

      canal.on("broadcast", { event: "msg" }, function(m) { recibirCoop(m.payload || {}); });
      canal.on("presence", { event: "sync" }, function() { chequearPresenciaCoop(); });
      canal.on("presence", { event: "leave" }, function() { chequearPresenciaCoop(); });

      canal.subscribe(function(estado) {
        if (estado === "SUBSCRIBED") {
          caSesion.conectado = true;
          caSesion.canal = canal;
          canal.track({ id: miId, apodo: miApodoCoop });
          registrarSalaSeguraCoop(topic);
          if (opts.modoAuto) {
            estadoLobbyCoop('<div class="alert alert-success p-2 mb-0">🟢 ¡Socio localizado! Preparando la dupla...</div>');
            enTareaCoop(function() {
              if (!caSesion || !c || !c.iniciado) {
                const presentes = caSesion && caSesion.canal ? Object.keys(caSesion.canal.presenceState() || {}).length : 0;
                if (presentes < 2) {
                  cerrarSesionCoop();
                  renderLobbyCoop(miApodoCoop);
                  estadoLobbyCoop('<div class="alert alert-warning p-2 mb-0">⚠️ No se pudo conectar al socio. Buscando otra vez...</div>');
                  buscarPartidoCoop();
                }
              }
            }, 9000);
          } else {
            estadoLobbyCoop(
              '<div class="alert alert-success p-2 mb-0">🟢 Conectado a <strong>' + escCoop(nombre) +
              "</strong>. Esperando al socio...<br><small>Compartí el nombre de la sala y la contraseña con tu compañero.</small></div>"
            );
          }
        } else if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
          estadoLobbyCoop('<div class="alert alert-danger p-2 mb-0">🔴 No se pudo conectar a la sala. Revisá tu conexión e intentá otra vez.</div>');
          cerrarSesionCoop();
        } else if (estado === "CLOSED" && caSesion && !caSesion.cerrada) {
          estadoLobbyCoop('<div class="alert alert-warning p-2 mb-0">🔌 Conexión cerrada. Intentá conectarte otra vez.</div>');
        }
      });
    }).catch(function() {
      estadoLobbyCoop('<div class="alert alert-danger p-2 mb-0">⛔ No se pudo leer tu perfil. Revisá tu sesión.</div>');
    });
  }

  function chequearPresenciaCoop() {
    if (!caSesion || !caSesion.canal) return;
    const presentes = Object.keys(caSesion.canal.presenceState() || {});
    if (presentes.length > 2 && (!c || !c.iniciado)) {
      estadoLobbyCoop('<div class="alert alert-danger p-2 mb-0">⛔ La sala está ocupada (ya hay una dupla en curso).</div>');
      return;
    }
    // Contador visible del lobby 0/2 -> 1/2 -> 2/2
    detectarGenteSalaCoop(presentes.length);
    if (presentes.length >= 2) sendHolaIfPendingCoop();
    if (c) setEstadoSocioCoop(presentes.length >= 2 ? "🟢 Conectado" : "🔴 Desconectado");
    if (c && c.activo && presentes.length < 2) bannerDesconectadoSocio();
  }

  function detectarGenteSalaCoop(cantidad) {
    if (!caSesion || c) return;
    const el = document.getElementById("coop-gente-count");
    if (el) el.innerHTML = cantidad + "/2";
    if (cantidad >= 2 && !caSesion.configMostrada && !caSesion.iniciado) {
      // Ya somos dos: definimos roles (determinista y cacheado) y mostramos
      // la config al anfitrión. Sin el hola del socio todavía no hay rol.
      const soyAnfitrion = definirRolCoop() === "A";
      if (soyAnfitrion === null) return;
      caSesion.configMostrada = true;
      if (soyAnfitrion) {
        renderConfigAnfitrionCoop();
      } else {
        renderPanelSalaCoop(
          '<div class="alert alert-success p-2 mb-3">🎯 <strong>' + escCoop(nombreInvitadoCoop() || "Tu socio") + "</strong> es el anfitrión. Está eligiendo el club y la selección de la dupla...</div>" +
          '<div class="text-center p-3">' + avatarCoop(nombreInvitadoCoop() || "?") + "</div>"
        );
      }
    }
  }

  function nombreInvitadoCoop() {
    if (!caSesion) return null;
    const ids = Object.keys(caSesion.holas);
    if (!ids.length) return null;
    const otro = ids[0];
    return caSesion.holas[otro] && caSesion.holas[otro].apodo;
  }

  function definirRolCoop() {
    // El rol se resuelve UNA sola vez y se cachea: si el del servidor llegara
    // tarde (o por otro ordenamiento de ids) no volvemos a cambiar a mitad de
    // la dupla. El "anfitrión" (rol A) es el de miId menor, como en el duelo.
    if (caSesion.miRol) return caSesion.miRol;
    const ids = Object.keys(caSesion.holas);
    if (!ids.length) return null;
    const orden = [caSesion.miId].concat(ids).sort();
    caSesion.miRol = orden[0] === caSesion.miId ? "A" : "B";
    return caSesion.miRol;
  }

  function sendHolaIfPendingCoop() {
    if (!caSesion || caSesion.holaEnviado) return;
    caSesion.holaEnviado = true;
    enviarCoop({ t: "hola", id: caSesion.miId, apodo: caSesion.apodo });
  }

  // ============================================================
  //  CONFIGURACION DE LA DUPLA (solo el anfitrión, rol A)
  // ============================================================
  function renderConfigAnfitrionCoop() {
    const selHtml = armarSelectSeleccionesCoop();
    renderPanelSalaCoop(
      '<div class="alert alert-success p-2 mb-3">🎯 ¡Ya son 2! Configurá la dupla...</div>' +
      '<div class="p-2">' +
      '<label class="small text-secondary fw-bold d-block mb-1">🏟️ Nivel del club compartido (reputación 1-10)</label>' +
      '<select id="coop-config-rep" class="form-control mb-3 coop-select">' +
      Array.from({ length: 10 }, function(_, i) {
        const n = i + 1;
        return '<option value="' + n + '"' + (n === 5 ? " selected" : "") + ">Reputación " + n + " / 10</option>";
      }).join("") +
      "</select>" +
      '<label class="small text-secondary fw-bold d-block mb-1">🌍 Selección de la dupla</label>' +
      '<select id="coop-config-sel" class="form-control mb-3 coop-select">' + selHtml + "</select>" +
      '<button class="btn btn-success btn-lg fw-bold w-100" onclick="iniciarCoopConfig()">🎮 COMENZAR DUPLA</button>' +
      '<p class="small text-secondary mt-2 mb-0">Ambos van a jugar en el MISMO club y la MISMA selección. Cada temporada toman juntos la táctica del partido internacional.</p>' +
      "</div>"
    );
  }

  function armarSelectSeleccionesCoop() {
    const catalogo = (typeof SELECCIONES !== "undefined") ? SELECCIONES : [];
    const porConfed = {};
    catalogo.forEach(function(s) {
      (porConfed[s[3]] = porConfed[s[3]] || []).push(s);
    });
    let html = "";
    Object.keys(porConfed).forEach(function(confed) {
      html += '<optgroup label="' + escCoop(confed) + '">';
      porConfed[confed].sort(function(a, b) { return a[4] - b[4]; }).reverse().forEach(function(s) {
        html += '<option value="' + escCoop(s[0]) + '"' + (s[0] === "ARG" ? " selected" : "") + ">" +
          escCoop(s[2] + " " + s[1]) + "</option>";
      });
      html += "</optgroup>";
    });
    return html;
  }

  function iniciarCoopConfig() {
    if (!caSesion || caSesion.iniciado || (c && c.iniciado)) return;
    const repEl = document.getElementById("coop-config-rep");
    const selEl = document.getElementById("coop-config-sel");
    const cfg = {
      rep: Number(repEl ? repEl.value : 5),
      sel: selEl ? selEl.value : "ARG"
    };
    enviarCoop({ t: "inicio", cfg: cfg });
    estadoLobbyCoop('<div class="alert alert-info p-2 mb-0">🎮 Dupla configurada. Arrancando el proyecto...<br><small>Club rep. ' + cfg.rep + " · Selección " + cfg.sel + "</small></div>");
    renderPanelSalaCoop("");
    iniciarCoop(cfg);
  }

  // ============================================================
  //  CONEXION REALTIME + SEGURIDAD SERVER-SIDE (RPC de Supabase)
  //  Reutiliza la infraestructura genérica de salas del duelo (006).
  // ============================================================
  function coopRpcSeguro(nombre, cuerpo) {
    try {
      if (typeof fetch !== "function" || typeof COPERO_SUPABASE === "undefined") return Promise.resolve(null);
      const cuenta = window.CoperoCuenta;
      if (!cuenta || typeof cuenta.token !== "function") return Promise.resolve(null);
      return cuenta.token().then(function(token) {
        return fetch(COPERO_SUPABASE.url + "/rest/v1/rpc/" + nombre, {
          method: "POST",
          headers: {
            apikey: COPERO_SUPABASE.publishableKey,
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify(cuerpo || {})
        }).then(function(res) {
          return res.text().then(function(texto) {
            let datos = null;
            try { datos = JSON.parse(texto); } catch (e) { datos = null; }
            if (!res.ok) {
              try {
                console.warn("[coop] RPC " + nombre + " rechazado", JSON.stringify({
                  status: res.status, statusText: res.statusText,
                  respuesta: String(texto).slice(0, 400)
                }));
              } catch (e) { /* sin consola */ }
              return { error: true, status: res.status, cuerpo: String(texto), datos: datos };
            }
            return datos;
          });
        });
      }).catch(function() { return null; });
    } catch (e) { return Promise.resolve(null); }
  }

  function registrarSalaSeguraCoop(topic) {
    coopRpcSeguro("copero_duelo_sala_unirse", { p_room_id: topic }).then(function(res) {
      if (!res) return;
      if (res.error) {
        if (String(res.cuerpo || "").indexOf("sala_llena") !== -1) {
          estadoLobbyCoop('<div class="alert alert-danger p-2 mb-0">Esta sala ya tiene dos integrantes. Probá con otra sala o usá BUSCAR SOCIO.</div>');
          cerrarSesionCoop();
        }
        return;
      }
      if (caSesion && caSesion.topic === topic) {
        caSesion.semillaServidor = res.semilla || null;
        caSesion.rolServidor = res.rol || null;
        caSesion.verificado = !!res.semilla;
        // La config de la dupla (rol A = anfitrión) se resuelve con el rol
        // local determinista (mismo min(id) que usa el servidor), así que la
        // semilla del servidor llega a tiempo para las temporadas.
        if (typeof window.CoperoCoopLogica !== "undefined" && window.CoperoCoopLogica._setSemillaServidor) {
          window.CoperoCoopLogica._setSemillaServidor(caSesion.semillaServidor);
        }
      }
    });
  }

  function confirmarResultadoSeguroCoop() {
    if (!c || !caSesion || !caSesion.topic || caSesion.confirmado) return;
    caSesion.confirmado = true;
    const topic = caSesion.topic;
    let resumen = null;
    try { resumen = miResumenCoop(); } catch (e) { return; }
    coopRpcSeguro("copero_coop_confirmar", {
      p_coop_id: topic,
      p_temporadas: c.temporada || 0,
      p_aporte: calcularAporteCoop(resumen),
      p_meta: (typeof c.proyectoResultado !== "undefined" && c.proyectoResultado.meta) === true,
      p_resumen: resumen
    }).then(function(res) {
      if (!res || res.error) return null;
      return coopRpcSeguro("copero_coop_resultado", { p_coop_id: topic });
    }).then(function(res) {
      if (!res || res.error || !res.completo) return;
      try {
        console.info("[coop] Proyecto verificado por el servidor", JSON.stringify({
          mia: res.mia, socio: res.socio, meta: res.meta, temporadas: res.temporadas
        }));
      } catch (e) { /* sin consola */ }
    }).catch(function() { /* el coop nunca se rompe por esto */ });
  }

  function enviarCoop(payload) {
    if (!caSesion || !caSesion.canal || !caSesion.conectado) return;
    payload.id = caSesion.miId;
    try { caSesion.canal.send({ type: "broadcast", event: "msg", payload: payload }); } catch (e) { /* conexion caida */ }
  }

  function recibirCoop(msg) {
    if (!msg || !caSesion) return;
    if (msg.id === caSesion.miId) return;

    if (msg.t === "hola") {
      if (!caSesion.holas[msg.id]) {
        caSesion.holas[msg.id] = { apodo: msg.apodo };
      }
      chequearPresenciaCoop();
      return;
    }
    if (msg.t === "inicio") {
      if (caSesion.iniciado || (c && c.iniciado)) return;
      estadoLobbyCoop('<div class="alert alert-info p-2 mb-0">🎮 El anfitrión configuró la dupla. Arrancando el proyecto...</div>');
      renderPanelSalaCoop("");
      iniciarCoop(msg.cfg || { rep: 5, sel: "ARG" });
      caSesion.iniciado = true;
      return;
    }
    if (!c) return;

    switch (msg.t) {
      case "stats":
        if (c && c.socio) {
          c.socio.ovr = msg.ovr; c.socio.goles = msg.goles; c.socio.asistencias = msg.asist;
          c.socio.moral = msg.moral; c.socio.edad = msg.edad || c.socio.edad;
          if (msg.estado) { c.socio.estado = msg.estado; renderHUDCoop(); }
        }
        break;
      case "coopsel":
        if (c && c.decision) {
          c.decision.eleccionRival = msg.op;
          resolverDecision();
        }
        break;
      case "listo":
        c.listos[msg.fase] = c.listos[msg.fase] || {};
        c.listos[msg.fase].rival = true;
        if (c.listos[msg.fase].yo) avanzarFaseCoop(msg.fase);
        else { c.socio.estado = "¡Listo!"; renderHUDCoop(); }
        break;
      case "fin":
        c.resumenSocio = msg.resumen;
        mostrarFinalCoop();
        break;
      case "abandono":
        caSesion.cerrada = true;
        mostrarPantallaAbandonoSocioCoop();
        break;
    }
  }

  function cerrarSesionCoop() {
    if (caSesion) {
      if (c && c.activo && !c.terminado && !caSesion.cerrada) {
        enviarCoop({ t: "abandono" });
      }
      caSesion.cerrada = true;
      try { if (caSesion.canal) { caSesion.canal.unsubscribe(); caSesion.canal = null; } } catch (e) { /* noop */ }
    }
    limpiarTimersCoop();
    detenerTimerCoop();
    cerrarModalCoop();
    caSesion = null;
    c = null;
  }

  // ============================================================
  //  ARRANQUE DE LA DUPLA, HUD Y SINCRONIZACION
  // ============================================================
  function iniciarCoop(cfg) {
    const ids = Object.keys(caSesion.holas || {});
    const apodoSocio = (ids.length ? caSesion.holas[ids[0]].apodo : null) || "Socio";
    definirRolCoop();
    const rolSocio = caSesion.miRol === "A" ? "B" : "A";

    c = {
      activo: true,
      iniciado: true,
      terminado: false,
      temporada: 0,
      cfg: cfg || { rep: 5, sel: "ARG" },
      mi: construirMiCoop(caSesion.apodo, caSesion.miRol, caSesion.topic),
      socio: construirMiCoop(apodoSocio, rolSocio, caSesion.topic),
      dupla: construirDuplaCoop(cfg || { rep: 5, sel: "ARG" }, caSesion.topic),
      decision: null,
      listos: {},
      resumenSocio: null,
      rivalActual: null
    };
    c.mi.club = c.dupla.club;
    c.socio.club = c.dupla.club;
    coopSemillaServidor = caSesion.semillaServidor || null;
    if (window.CoperoCoopLogica && window.CoperoCoopLogica._setSemillaServidor) {
      window.CoperoCoopLogica._setSemillaServidor(coopSemillaServidor);
    }

    const pantalla = document.getElementById(PANTALLA);
    pantalla.innerHTML =
      '<div id="coop-hud" class="card card-custom p-3 mb-3"></div>' +
      '<div id="coop-intro" class="card card-custom p-3 mb-3"></div>' +
      '<div class="card card-custom p-3"><div id="coop-arena" class="hidden"></div>' +
      '<div class="text-center mt-3"><button class="btn btn-outline-danger btn-sm fw-bold" onclick="abandonarCoop()">🏳️ Abandonar la dupla</button></div></div>' +
      '<div id="coop-timer" class="text-center my-2 hidden"></div>';

    renderHUDCoop();
    enviarStatsCoop("Conectado a la dupla");
    pintarIntroCoop(caSesion.apodo, apodoSocio, cfg);

    if (tieneMovimientoReducidoCoop()) {
      enTareaCoop(function() { montarCoopEnCurso(); }, 400);
    } else {
      let n = 3;
      var intervaloCuenta = enIntervaloCoop(function() {
        n--;
        if (n <= 0) {
          clearInterval(intervaloCuenta);
          montarCoopEnCurso();
          return;
        }
        pintarCuentaCoop(n);
      }, 800);
    }
  }

  function tieneMovimientoReducidoCoop() {
    try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  function pintarIntroCoop(apodoJugador, apodoSocio, cfg) {
    const intro = document.getElementById("coop-intro");
    if (!intro) return;
    const sel = c.dupla.seleccion;
    intro.innerHTML =
      '<div class="duelo-intro-tag text-success">🤝 DUPLA CONFORMADA</div>' +
      '<div class="d-flex justify-content-center align-items-center gap-3 my-3 flex-wrap">' +
      '<div class="text-center duelo-intro-avatar">' + avatarCoop(apodoJugador) +
      '<div class="fw-bold mt-1">' + escCoop(apodoJugador) + "</div>" +
      '<div class="small text-3">' + escCoop(c.mi.posicion) + "</div></div>" +
      '<div class="duelo-vs-big">🤝</div>' +
      '<div class="text-center duelo-intro-avatar">' + avatarCoop(apodoSocio) +
      '<div class="fw-bold mt-1">' + escCoop(apodoSocio) + "</div>" +
      '<div class="small text-3">Mismo club · misma selección</div></div>' +
      "</div>" +
      '<div class="small text-3 text-center mb-3">Proyecto de <strong>' + COOP_CFG.TEMPORADAS + " temporadas</strong> en <strong>" + escCoop(c.dupla.club.nombre) +
      "</strong> [Rep. " + c.dupla.club.reputacion + "] con <strong>" + escCoop(sel.bandera + " " + sel.nombre) + "</strong>.<br>Bienvenidos a la dupla.</div>" +
      '<div id="coop-countdown" class="duelo-countdown text-center">3</div>';
  }

  function pintarCuentaCoop(n) {
    const el = document.getElementById("coop-countdown");
    if (el) el.textContent = String(n);
  }

  function montarCoopEnCurso() {
    if (!c) return;
    const intro = document.getElementById("coop-intro");
    const arena = document.getElementById("coop-arena");
    const cd = document.getElementById("coop-countdown");
    if (cd) cd.textContent = "¡YA!";
    enTareaCoop(function() {
      if (intro) intro.innerHTML = "";
      if (arena) arena.classList.remove("hidden");
      iniciarTemporadaCoop();
    }, 500);
  }

  function enviarStatsCoop(estado) {
    if (!c) return;
    enviarCoop({
      t: "stats", ovr: c.mi.ovr, goles: c.mi.goles, asist: c.mi.asistencias,
      moral: c.mi.moral, edad: c.mi.edad, estado: estado || ""
    });
    if (estado) c.mi.estado = estado;
    renderHUDCoop();
  }

  function marcarListoCoop(fase) {
    c.listos[fase] = c.listos[fase] || {};
    c.listos[fase].yo = true;
    enviarCoop({ t: "listo", fase: fase });
    if (c.listos[fase].rival) avanzarFaseCoop(fase);
  }

  function avanzarFaseCoop(fase) {
    if (!c || !c.activo) return;
    if (fase === "tempo") {
      if (c.temporada >= COOP_CFG.TEMPORADAS) { c.fase = "retiro"; faseRetiroCoop(); }
      else { c.fase = "preparando"; enTareaCoop(function() { iniciarTemporadaCoop(); }, 800); }
    }
  }

  function setEstadoSocioCoop(txt) {
    if (!c) return;
    c.socio.estado = txt;
    renderHUDCoop();
  }

  function bannerDesconectadoSocio() {
    const band = document.getElementById("coop-banner-desc");
    if (!band) return;
    band.classList.remove("hidden");
    band.innerHTML = "🔌 <strong>" + escCoop(c.socio.apodo) + "</strong> se desconectó. Si vuelve, seguimos en la misma temporada. Si no regresa, podés esperar o abandonar la dupla.";
  }

  function renderHUDCoop() {
    const hud = document.getElementById("coop-hud");
    if (!hud || !c) return;
    const mi = c.mi, socio = c.socio, dupla = c.dupla;
    const sel = dupla.seleccion;
    const trofeos = Object.keys(dupla.trofeos).reduce(function(a, k) { return a + dupla.trofeos[k]; }, 0);
    hud.innerHTML =
      '<div class="d-flex justify-content-around align-items-center text-center flex-wrap">' +
      '<div>' + avatarCoop(mi.apodo) +
      '<div class="fw-bold mt-1">' + escCoop(mi.apodo) + '</div>' +
      '<div class="small text-secondary">' + escCoop(dupla.club.nombre) + " • " + mi.posicion + "</div></div>" +
      '<div class="duelo-vs fw-bold text-success">DUPLA</div>' +
      '<div>' + avatarCoop(socio.apodo) +
      '<div class="fw-bold mt-1">' + escCoop(socio.apodo) + "</div>" +
      '<div class="small text-secondary">' + escCoop(dupla.club.nombre) + " • " + socio.posicion + "</div></div>" +
      "</div>" +
      '<div class="d-flex justify-content-around mt-3 flex-wrap duelo-stats">' +
      '<div><span class="duelo-stat-num">' + mi.ovr + '</span><span class="duelo-stat-lbl">tu OVR</span></div>' +
      '<div><span class="duelo-stat-num">' + socio.ovr + '</span><span class="duelo-stat-lbl">OVR socio</span></div>' +
      '<div><span class="duelo-stat-num">' + mi.goles + '</span><span class="duelo-stat-lbl">tus goles</span></div>' +
      '<div><span class="duelo-stat-num">' + socio.goles + '</span><span class="duelo-stat-lbl">goles socio</span></div>' +
      '<div><span class="duelo-stat-num">' + mi.asistencias + '</span><span class="duelo-stat-lbl">tus asist.</span></div>' +
      '<div><span class="duelo-stat-num">' + socio.asistencias + '</span><span class="duelo-stat-lbl">asist. socio</span></div>' +
      '<div><span class="duelo-stat-num">' + mi.edad + '</span><span class="duelo-stat-lbl">tu edad</span></div>' +
      '<div><span class="duelo-stat-num">' + (socio.edad == null ? "—" : socio.edad) + '</span><span class="duelo-stat-lbl">edad socio</span></div>' +
      "</div>" +
      '<div class="coop-dupla-card mt-3">' +
      '<span>🏟️ <strong>' + escCoop(dupla.club.nombre) + "</strong> [Rep. " + dupla.club.reputacion + "]</span>" +
      '<span class="mx-2">·</span>' +
      '<span>' + escCoop(sel.bandera) + " <strong>" + escCoop(sel.nombre) + "</strong></span>" +
      '<span class="mx-2">·</span>' +
      '<span>Selección: <strong>' + dupla.partidosSeleccion + " PJ</strong></span>" +
      '<span class="mx-2">·</span>' +
      '<span>Goles: <strong>' + dupla.golesSeleccion + "</strong></span>" +
      '<span class="mx-2">·</span>' +
      '<span>🏆 x<strong>' + trofeos + "</strong></span>" +
      "</div>" +
      '<div class="small text-center mt-2 border-top pt-2">' +
      "🗓️ Temporada <strong>" + Math.max(1, c.temporada) + "/" + COOP_CFG.TEMPORADAS + "</strong> — " +
      "Tú: <strong>" + escCoop(c.mi.estado || "—") + "</strong> | Socio: <strong>" + escCoop(c.socio.estado || "—") + "</strong></div>" +
      '<div id="coop-banner-desc" class="alert alert-warning p-2 mt-2 mb-0 hidden"></div>';
  }

  // ============================================================
  //  TEMPORADA DE LA DUPLA (simulación determinista)
  // ============================================================
  function iniciarTemporadaCoop() {
    if (!c || !c.activo) return;
    c.temporada++;
    c.listos = {};

    [c.mi, c.socio].forEach(function(j) {
      j.edad++;
      const baja = calcularDecliveEdad(j.edad);
      if (baja > 0) {
        const OVR_MIN = (typeof CONFIG !== "undefined" && CONFIG.OVR_MIN) || 40;
        j.ovr = Math.max(OVR_MIN, j.ovr - baja);
      }
      if (ofertasAleatoriasPorEdad(j.edad) && !j.alertEdadMostrada) {
        j.alertEdadMostrada = true;
        notifCoop("🎲 Ofertas al azar", "Al pasar los 31, los equipos invitan más al azar.");
      }
    });

    const dl = (typeof window.CoperoDueloLogica !== "undefined") ? window.CoperoDueloLogica : null;

    function aplicarSimulacion(j, res) {
      j.goles += res.goles;
      j.asistencias += res.asistencias;
      if (res.subida > 0) {
        const reglas = (typeof REGLAS_MEDIA !== "undefined" && REGLAS_MEDIA[j.club.reputacion]) || 99;
        j.ovr = Math.min(reglas, j.ovr + res.subida);
      }
      j.moral = Math.min(100, j.moral + 5);
      j.historial.push({ temporada: c.temporada, club: c.dupla.club.nombre, partidos: res.partidos, goles: res.goles, asistencias: res.asistencias, ovr: j.ovr });
    }

    if (dl && typeof dl.simularTemporadaDuelo === "function") {
      // Cada integrante tiene SU PROPIA secuencia determinista de semilla.
      const rdmMi = prngDeterminista(semillaCoop(caSesion.topic, c.temporada, "jugador-" + c.mi.rol));
      const rdmSocio = prngDeterminista(semillaCoop(caSesion.topic, c.temporada, "jugador-" + c.socio.rol));
      const rdmDupla = prngDeterminista(semillaCoop(caSesion.topic, c.temporada, "dupla"));

      const resMi = dl.simularTemporadaDuelo(c.mi, rdmMi);
      const resSocio = dl.simularTemporadaDuelo(c.socio, rdmSocio);
      aplicarSimulacion(c.mi, resMi);
      aplicarSimulacion(c.socio, resSocio);

      const promedioOvr = Math.round((c.mi.ovr + c.socio.ovr) / 2);
      const trofeos = simularTrofeosCoop(c.dupla.club.reputacion, promedioOvr, rdmDupla);
      trofeos.forEach(function(tro) {
        const clave = claveTrofeoCoop(tro);
        if (clave) {
          c.dupla.trofeos[clave] = (c.dupla.trofeos[clave] || 0) + 1;
          c.dupla.detalleTrofeos[clave] = tro;
        }
      });
      c.resMi = resMi;
      c.resSocio = resSocio;
    }

    renderHUDCoop();
    pintarResumenTemporadaCoop();
    // Momento cooperativo: la táctica del partido de la selección.
    enTareaCoop(function() { faseDecisionCoop(); }, 800);
  }

  function pintarResumenTemporadaCoop() {
    const arena = document.getElementById("coop-arena");
    if (!arena) return;
    const resMi = c.resMi || {}, resSocio = c.resSocio || {};
    const trofeos = Object.keys(c.dupla.trofeos);
    const trofeosLista = trofeos.map(function(k) { return c.dupla.detalleTrofeos[k]; });
    arena.innerHTML =
      '<div id="coop-resumen">' +
      '<h5 class="fw-bold">📊 Temporada ' + c.temporada + " de la dupla</h5>" +
      '<div class="row justify-content-center mt-3">' +
      '<div class="col-6 col-md-3"><div class="border rounded p-2"><div class="small text-secondary fw-bold">' + escCoop(c.mi.apodo) + "</div>" +
      '<div class="fw-bold fs-4 text-success">' + (resMi.goles || 0) + " g / " + (resMi.asistencias || 0) + " a</div>" +
      '<div class="small text-secondary">OVR ' + c.mi.ovr + "</div></div></div>" +
      '<div class="col-6 col-md-3"><div class="border rounded p-2"><div class="small text-secondary fw-bold">' + escCoop(c.socio.apodo) + "</div>" +
      '<div class="fw-bold fs-4 text-info">' + (resSocio.goles || 0) + " g / " + (resSocio.asistencias || 0) + " a</div>" +
      '<div class="small text-secondary">OVR ' + c.socio.ovr + "</div></div></div>" +
      "</div>" +
      '<div class="mt-3">' + (trofeosLista.length
        ? "<strong class='text-warning'>🏆 " + trofeosLista.map(function(t) { return t; }).join(" • ") + "</strong>"
        : "<span class='text-secondary'>Sin títulos de club esta temporada.</span>") + "</div>" +
      '<p class="small text-secondary mt-2">Preparando el momento cooperativo: la táctica del partido de <strong>' + escCoop(c.dupla.seleccion.nombre) + "</strong>...</p>" +
      "</div>";
    enviarStatsCoop("Temporada " + c.temporada + ": decidí la táctica");
  }

  // ============================================================
  //  MOMENTO COOPERATIVO (táctica a ciegas + timer 10s)
  //  La elección de AMBOS decide el marcador del partido compartido
  //  de la selección de la dupla. Resolución determinista.
  // ============================================================
  function faseDecisionCoop() {
    if (!c || !c.activo) return;
    const rival = rivalSeleccionCoop(c.dupla.seleccion, caSesion.topic, c.temporada);
    c.rivalActual = rival;
    c.decision = { eleccionLocal: null, eleccionRival: null, resuelto: false };
    enviarStatsCoop("Pensando táctica...");

    const sel = c.dupla.seleccion;
    let footer = "";
    COOP_CFG.TACTICAS.forEach(function(key) {
      const tac = COOP_TACTICAS[key];
      footer += '<button class="btn btn-success fw-bold mx-2 my-1" onclick="elegirTacticaCoop(\'' + key + '\')">' +
        tac.label + '<br><small>' + tac.desc + "</small></button>";
    });

    abrirModalCoop(
      "🌍 MOMENTO COOPERATIVO — " + sel.bandera + " " + escCoop(sel.nombre) + " vs " + rival.bandera + " " + escCoop(rival.nombre) + " (Temporada " + c.temporada + ")",
      "<p class='fs-5'>Elegís junto a <strong>" + escCoop(c.socio.apodo) + "</strong> la táctica del partido.</p>" +
      "<p>Ambos eligen <strong>a ciegas</strong>: no vas a ver la elección del socio hasta que los dos hayan decidido. La táctica de <strong>los dos</strong> define el marcador y el resultado compartido.</p>" +
      "<p class='small text-secondary'>Misma táctica = +1 gol y sincronía (+moral). Presión total (🔥🔥) = +2. Defensa total (🛡️🛡️) = -1. Tácticas opuestas (🔥 vs 🛡️) = desorden (-2).</p>",
      footer
    );
    iniciarTimerCoop(COOP_CFG.TIMER_MS / 1000, function() { elegirTacticaCoop("B", true); });
  }

  function elegirTacticaCoop(op, porTimer) {
    if (!c || !c.decision || c.decision.eleccionLocal) return;
    detenerTimerCoop();
    c.decision.eleccionLocal = op;
    enviarCoop({ t: "coopsel", op: op });
    enviarStatsCoop("Táctica enviada...");

    const enEspera =
      (porTimer ? '<p class="small text-warning">⏱️ Se eligió automáticamente por tiempo.</p>' : "") +
      '<p class="mt-3">📨 Táctica enviada. Esperando a tu socio...</p>';
    actualizarModalCoop(enEspera, "");
    resolverDecision();
  }

  function resolverDecision() {
    if (!c || !c.decision || c.decision.resuelto) return;
    if (!c.decision.eleccionLocal || !c.decision.eleccionRival) return;
    c.decision.resuelto = true;

    const sel = c.dupla.seleccion;
    const rival = c.rivalActual || { fuerza: 76, nombre: "Rival" };
    const rdm = prngDeterminista(semillaCoop(caSesion.topic, c.temporada, "tactica"));
    const res = resolverDecisionCoop(sel, { fuerzaRival: rival.fuerza }, c.decision.eleccionLocal, c.decision.eleccionRival, rdm);

    // Aplicación COMPARTIDA sobre la selección de la dupla.
    c.dupla.partidosSeleccion++;
    c.dupla.golesSeleccion += res.golesSel;
    if (res.victoria) c.dupla.victoriasSeleccion++;
    if (res.sincronia) c.dupla.puntosSincronia++;
    if (res.bonusMoral > 0) {
      c.mi.moral = Math.min(100, c.mi.moral + res.bonusMoral);
      c.socio.moral = Math.min(100, c.socio.moral + res.bonusMoral);
    }

    const opLocal = c.decision.eleccionLocal, opRival = c.decision.eleccionRival;
    const resumen =
      "<h2 class='" + (res.victoria ? "text-success" : res.empate ? "text-warning" : "text-danger") + "'>" +
      sel.bandera + " <strong>" + res.golesSel + "</strong> — <strong>" + res.golesRiv + "</strong> " + rival.bandera + "</h2>" +
      "<p>" + (res.victoria ? "¡Victoria de la dupla!" : res.empate ? "Empate compartido." : "Derrota de la dupla.") + "</p>" +
      "<p class='small'>🎯 Tu táctica: <strong>" + COOP_TACTICAS[opLocal].label + "</strong><br>" +
      "🕵️ Tu socio eligió: <strong>" + COOP_TACTICAS[opRival].label + "</strong></p>" +
      (res.sincronia
        ? "<p class='text-success small'>🤝 ¡Sincronía perfecta! +" + res.bonusMoral + " de moral para los dos.</p>"
        : "<p class='text-secondary small'>Las tácticas no coincidieron... hablen la próxima.</p>") +
      "<p class='small text-secondary mt-2'>Goles de la dupla en la selección: <strong>" + c.dupla.golesSeleccion + "</strong></p>";

    actualizarModalCoop(resumen, '');
    enviarStatsCoop("Táctica " + (res.victoria ? "victoriosa" : "definida"));
    renderHUDCoop();
    c.decision = null;

    enTareaCoop(function() {
      cerrarModalCoop();
      pintarCierreTemporadaCoop();
      marcarListoCoop("tempo");
    }, 3200);
  }

  function pintarCierreTemporadaCoop() {
    const arena = document.getElementById("coop-arena");
    if (!arena) return;
    arena.innerHTML =
      '<h5 class="fw-bold">✅ Temporada ' + c.temporada + " completada</h5>" +
      '<p><strong>' + c.dupla.seleccion.nombre + "</strong>: " + c.dupla.partidosSeleccion + " PJ · " + c.dupla.golesSeleccion + " goles · " + c.dupla.victoriasSeleccion + " victorias</p>" +
      '<p class="small text-secondary mt-3">Esperando al socio para la temporada ' + (c.temporada + 1) + "...</p>";
  }

  // ============================================================
  //  RETIRO Y CIERRE DEL PROYECTO DE LA DUPLA
  // ============================================================
  function miResumenCoop() {
    return resumenCoop(c.mi);
  }

  function calcularProyectoLocalCoop() {
    return calcularProyectoCoop(resumenCoop(c.mi), resumenCoop(c.socio), c.dupla, c.temporada, COOP_CFG);
  }

  function faseRetiroCoop() {
    if (!c || !c.activo) return;
    c.terminado = true;
    c.proyectoResultado = calcularProyectoLocalCoop();
    const arena = document.getElementById("coop-arena");
    arena.innerHTML = "<h5 class='fw-bold text-center'>🏁 ¡FIN DEL PROYECTO! Calculando el cierre de la dupla...</h5>" +
      "<p class='small text-secondary text-center'>Esperando el aporte final de tu socio...</p>";
    enviarStatsCoop("Retirado. Calculando...");
    enviarCoop({ t: "fin", resumen: miResumenCoop() });
    c.resumenLocal = miResumenCoop();
    confirmarResultadoSeguroCoop();
    if (c.resumenSocio) mostrarFinalCoop();
  }

  function mostrarPantallaAbandonoSocioCoop() {
    if (!c) return;
    c.activo = false;
    limpiarTimersCoop();
    detenerTimerCoop();
    cerrarModalCoop();
    const arena = document.getElementById("coop-arena");
    if (arena) {
      arena.innerHTML =
        "<h4 class='text-warning text-center'>🏳️ ¡TU SOCIO ABANDONÓ!</h4>" +
        "<p class='text-center mt-3'>Sin socio no hay dupla: el proyecto quedó sin cierre.</p>" +
        '<div class="text-center mt-3 d-flex flex-wrap justify-content-center gap-2">' +
        '<button class="btn btn-pso fw-bold" onclick="jugarDeNuevoCoop()">🔁 JUGAR DE NUEVO</button>' +
        '<button class="btn btn-outline-secondary fw-bold" onclick="volverInicioCoop()">← Volver al inicio</button>' +
        "</div>";
    }
  }

  function abandonarCoop() {
    if (!c || c.terminado) { volverInicioCoop(); return; }
    if (!confirm("¿Seguro que querés abandonar la dupla? Tu socio se va a quedar solo.")) return;
    enviarCoop({ t: "abandono" });
    c.activo = false;
    limpiarTimersCoop();
    detenerTimerCoop();
    cerrarModalCoop();
    const arena = document.getElementById("coop-arena");
    if (arena) {
      arena.innerHTML = "<h4 class='text-center'>🏳️ Abandonaste la dupla.</h4>" +
        '<div class="text-center mt-3 d-flex flex-wrap justify-content-center gap-2">' +
        '<button class="btn btn-pso fw-bold" onclick="jugarDeNuevoCoop()">🔁 JUGAR DE NUEVO</button>' +
        '<button class="btn btn-outline-secondary fw-bold" onclick="volverInicioCoop()">← Volver al inicio</button>' +
        "</div>";
    }
  }

  function jugarDeNuevoCoop() {
    cerrarSesionCoop();
    salirDeColaCoop();
    abrirPantallaCoop({ autoBuscar: true });
  }

  function mostrarFinalCoop() {
    if (!c || !c.resumenLocal || !c.resumenSocio) return;
    limpiarTimersCoop();
    detenerTimerCoop();
    cerrarModalCoop();

    const proy = c.proyectoResultado || calcularProyectoLocalCoop();
    const mio = c.resumenLocal, socio = c.resumenSocio;
    const sel = c.dupla.seleccion;
    const trofeos = Object.keys(c.dupla.trofeos).reduce(function(a, k) { return a + c.dupla.trofeos[k]; }, 0);

    const arena = document.getElementById("coop-arena");
    arena.innerHTML =
      "<div class='duelo-final-container'>" +
      "<div class='coop-campeon-banner " + (proy.meta ? "text-success" : "text-warning") + "'>" +
      "<div class='duelo-campeon-titulo'>🤝 PROYECTO DE LA DUPLA COMPLETADO</div>" +
      "<div class='duelo-campeon-puntaje'>" + proy.puntaje + " PUNTOS</div>" +
      "<div class='small mt-2'>" +
      (proy.meta
        ? "🎯 ¡META CUMPLIDA! La dupla llega a la gloria."
        : "🎯 No llegaron a la meta. Igual, ¡gran proyecto!") +
      "</div></div>" +

      "<div class='row mt-4'>" + htmlTablaDupla(mio, socio) + "</div>" +
      "<div class='row mt-4'>" + htmlTablaDuplaSeleccion(sel, proy) + "</div>" +

      "<div class='coop-trofeos mt-4'>" +
      "<h5 class='fw-bold mb-3'>🏆 Vitrina de la dupla (" + trofeos + ")</h5>" +
      (Object.keys(c.dupla.trofeos).length
        ? Object.keys(c.dupla.trofeos).map(function(k) {
          return "<span class='chip-small mx-1'>" + escCoop(c.dupla.detalleTrofeos[k] || k) + " x" + c.dupla.trofeos[k] + "</span>";
        }).join("")
        : "<span class='text-secondary'>Sin títulos de club en la vitrina.</span>") +
      "</div>" +

      "<div class='small text-secondary mt-4'>Detalle del puntaje: Aporte de " + escCoop(mio.apodo) + " <strong>" + proy.aporteMi + "</strong> + Aporte de " + escCoop(socio.apodo) + " <strong>" + proy.aporteSocio + "</strong> + Goles de selección (" + proy.golesSel + " ×5) + Trofeos (" + trofeos + " ×50).</div>" +
      "<div class='small text-secondary mt-2'>Mayor aporte de la dupla: <strong>" + escCoop(proy.aporteMi >= proy.aporteSocio ? mio.apodo : socio.apodo) + "</strong></div>" +
      "<div class='text-center mt-4 d-flex flex-wrap justify-content-center gap-2'>" +
      "<button class='btn btn-success fw-bold px-4' onclick='jugarDeNuevoCoop()'>🔁 JUGAR DE NUEVO</button>" +
      "<button class='btn btn-outline-secondary fw-bold' onclick='volverInicioCoop()'>← Volver al inicio</button>" +
      "</div>" +
      "</div>";
  }

  function htmlTablaDupla(mio, socio) {
    function fila(etiqueta, v1, v2) {
      const g1 = v1 > v2, g2 = v2 > v1;
      return "<tr><td class='" + (g1 ? "text-success fw-bold" : "") + "'>" + v1 + "</td>" +
        "<td class='text-center small text-secondary'>" + etiqueta + "</td>" +
        "<td class='" + (g2 ? "text-success fw-bold" : "") + "'>" + v2 + "</td></tr>";
    }
    return (
      "<div class='col-12'>" +
      "<table class='table table-sm tabla-historial text-center align-middle'>" +
      "<thead><tr><th>" + escCoop(mio.apodo) + "</th><th>Aporte de la pareja</th><th>" + escCoop(socio.apodo) + "</th></tr></thead>" +
      "<tbody>" +
      fila("OVR Máximo", mio.ovrMax, socio.ovrMax) +
      fila("OVR Promedio", mio.ovrProm, socio.ovrProm) +
      fila("Goles", mio.goles, socio.goles) +
      fila("Asistencias", mio.asistencias, socio.asistencias) +
      "</tbody></table>" +
      "<div class='small text-secondary text-center'>Fórmula del aporte: (OVR_Max × 15) + (OVR_Promedio × 10) + (Goles × 2) + (Asistencias × 1)</div>" +
      "</div>"
    );
  }

  function htmlTablaDuplaSeleccion(sel, proy) {
    return (
      "<div class='col-12'>" +
      "<div class='border rounded p-3'>" +
      "<h6 class='fw-bold'>🌍 La selección de la dupla: " + escCoop(sel.bandera + " " + sel.nombre) + "</h6>" +
      "<div class='d-flex justify-content-around flex-wrap text-center'>" +
      "<div><div class='fw-bold fs-4'>" + proy.partidosSel + "</div><div class='small text-secondary'>PJ</div></div>" +
      "<div><div class='fw-bold fs-4 text-success'>" + proy.golesSel + "</div><div class='small text-secondary'>Goles</div></div>" +
      "<div><div class='fw-bold fs-4 text-warning'>" + proy.trofeos + "</div><div class='small text-secondary'>Trofeos de club</div></div>" +
      "</div></div></div>"
    );
  }

  // ============================================================
  //  EXPORTS GLOBALES (onclick desde el HTML/React)
  // ============================================================
  window.abrirPantallaCoop = abrirPantallaCoop;
  window.volverInicioCoop = volverInicioCoop;
  window.crearSalaCoop = crearSalaCoop;
  window.unirseSalaCoop = unirseSalaCoop;
  window.buscarPartidoCoop = buscarPartidoCoop;
  window.cancelarBusquedaCoop = cancelarBusquedaCoop;
  window.jugarDeNuevoCoop = jugarDeNuevoCoop;
  window.iniciarCoopConfig = iniciarCoopConfig;
  window.elegirTacticaCoop = elegirTacticaCoop;
  window.abandonarCoop = abandonarCoop;

  window.addEventListener("beforeunload", function() {
    if (c && c.activo && !c.terminado) enviarCoop({ t: "abandono" });
  });
})();