// ============================================================
//  CARRERA PSO - ui.js
//  Interfaz reorganizada: navegación por secciones (Carrera,
//  Partido, Entrenamiento, Progreso, Comunidad), tarjeta del
//  jugador, vistas, notificaciones y menú de perfil.
//  Se carga DESPUÉS de features.js y duelo.js.
//  No reemplaza lógica de juego: solo la presentación.
// ============================================================

const UI_SECCIONES = ["carrera", "partido", "entrenamiento", "progreso", "comunidad"];
const UI_RUTAS = {
  carrera: ["navCarrera", "🏠"],
  partido: ["navPartido", "⚽"],
  entrenamiento: ["navEntrenamiento", "🏋️"],
  progreso: ["navProgreso", "📊"],
  comunidad: ["navComunidad", "🌐"]
};

function uiT(clave, fallback) {
  if (typeof t === "function") {
    const v = t(clave);
    return v === clave ? (fallback || clave) : v;
  }
  return fallback || clave;
}

// ============================================================
//  NAVEGACIÓN PRINCIPAL
// ============================================================
function irA(seccion) {
  if (UI_SECCIONES.indexOf(seccion) === -1) return;
  UI_SECCIONES.forEach(function(s) {
    const vista = document.getElementById("vista-" + s);
    if (vista) vista.classList.toggle("hidden", s !== seccion);
  });
  document.querySelectorAll("[data-seccion]").forEach(function(b) {
    b.classList.toggle("activo", b.getAttribute("data-seccion") === seccion);
  });
  const meta = UI_RUTAS[seccion];
  const ruta = document.getElementById("app-ruta");
  if (ruta && meta) ruta.innerHTML = meta[1] + " " + uiT(meta[0], meta[0]);
  const renderer = window["render" + seccion.charAt(0).toUpperCase() + seccion.slice(1)];
  if (typeof renderer === "function") {
    try { renderer(); } catch (ign) {}
  }
  if (typeof window.scrollTo === "function") window.scrollTo(0, 0);
  actualizarModoAplicacion();
}

// ============================================================
//  NOTIFICACIONES (toasts)
// ============================================================
function mostrarToast(mensaje, tipo) {
  const contenedor = document.getElementById("toast-copero");
  if (!contenedor) return;
  const el = document.createElement("div");
  el.className = "toast-item" + (tipo ? " toast-" + tipo : "");
  el.innerHTML = mensaje || "";
  contenedor.appendChild(el);
  setTimeout(function() {
    el.classList.add("saliendo");
    setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }, 3200);
}

// ============================================================
//  FEEDBACK DE SUBIDA DE OVR (anima j-media y avisa)
// ============================================================
const _sumarMediaOriginal = typeof sumarMedia === "function" ? sumarMedia : null;
sumarMedia = function(delta) {
  const antes = (typeof jugador !== "undefined" && jugador && (jugador.atributos && typeof window.calcularOVR === "function"))
    ? window.calcularOVR(jugador.atributos, jugador.posicion) : (jugador ? jugador.media : null);
  if (_sumarMediaOriginal) _sumarMediaOriginal(delta);
  else if (jugador) jugador.media = Math.max(40, Math.min(99, (jugador.media || 60) + delta));
  if (delta > 0 && jugador && !document.getElementById("pantalla-juego").classList.contains("hidden")) {
    mostrarToast("⬆️ " + uiT("ovrSubio", "¡OVR subió!") + " <strong>+" + Math.round(delta) + "</strong>", "ovr");
  }
  const jm = document.getElementById("j-media");
  if (jm && antes != null) {
    const actual = (jugador.atributos && typeof window.calcularOVR === "function")
      ? window.calcularOVR(jugador.atributos, jugador.posicion) : jugador.media;
    if (actual > antes) {
      jm.classList.remove("ovr-up");
      void jm.offsetWidth;
      jm.classList.add("ovr-up");
    }
  }
};

// ============================================================
//  VISTA: CARRERA (dashboard)
// ============================================================
function renderCarrera() {
  if (!jugador || !jugador.clubActual) return;
  const club = jugador.clubActual;
  const setVal = function(pid, v) {
    const el = document.getElementById(pid);
    if (el) el.innerText = (v == null ? "" : String(v));
  };
  const esPrimera = jugador.division === 1 && !(jugador.temporadasForzadoSegunda > 0);
  setVal("carrera-competen", uiT(esPrimera ? "primeraDivision" : "segundaDivision", esPrimera ? "Primera División" : "Segunda División"));
  setVal("temporada-actual", jugador.temporadaActual);

  let rango = "";
  if (typeof CONFIG !== "undefined" && CONFIG.SIM) {
    const S = CONFIG.SIM;
    const base = Math.min(S.PARTIDOS_MAX, Math.max(S.PARTIDOS_MIN, S.PARTIDOS_BASE + Math.floor((jugador.media - (club.reputacion * 10)) / 5)));
    const sup = Math.min(S.PARTIDOS_MAX, base + S.PARTIDOS_VARIACION);
    rango = (base === sup) ? String(base) : (base + "–" + sup);
  }
  setVal("carrera-partidos-aprox", rango);

  const h = jugador.historialTemporadas || [];
  const ult = h.length ? h[h.length - 1] : null;
  const tt = jugador.trofeos || {};
  const titulos = (tt.primeraDivision || 0) + (tt.segundaDivision || 0) + (tt.copaApa || 0) +
    (tt.copaArgentina || 0) + (tt.copaDeCampeones || 0) + (tt.botaDeOro || 0) + (tt.balonDeOro || 0);
  const media = (jugador.atributos && typeof window.calcularOVR === "function")
    ? window.calcularOVR(jugador.atributos, jugador.posicion) : jugador.media;

  function setValNum(pid, v) {
    const el = document.getElementById(pid);
    if (el) el.innerText = (v == null ? "0" : String(v));
  }
  setValNum("res-pj", ult ? ult.partidos : 0);
  setValNum("res-goles", ult ? ult.goles : 0);
  setValNum("res-asist", ult ? ult.asistencias : 0);
  setValNum("res-titulos", titulos);
  setValNum("res-media", media);
  setValNum("res-num-temp", jugador.temporadaActual);
}

// ============================================================
//  VISTA: PARTIDO
// ============================================================
function tabPartido(kind) {
  document.querySelectorAll(".tab-partido").forEach(function(b) {
    const on = (b.getAttribute("onclick") || "").indexOf(kind) > -1;
    b.classList.toggle("btn-pso", on);
    b.classList.toggle("btn-outline-primary", !on);
    b.classList.toggle("activo", on);
  });
  const c = document.getElementById("contenido-partido");
  if (!c) return;
  const tfn = uiT;
  let html = "";
  if (kind === "destaques") {
    html = panelPartido("🏟️", tfn("tabMomentos", "Momentos clave"), tfn("momentosTexto", ""), null);
  } else if (kind === "penales") {
    html = panelPartido("🥅", tfn("tabPenales", "Penales"), tfn("penalesTexto", ""), { lb: tfn("abrirTanda", "Jugar tanda de penales"), fn: "iniciarMinijuegoPenales()" });
  } else if (kind === "libres") {
    html = panelPartido("🎯", tfn("tabLibres", "Tiros libres"), tfn("tiroLibreTexto", ""), { lb: tfn("abrirTiroLibre", "Jugar tiro libre"), fn: "iniciarMinijuegoTiroLibre('entrenamiento')" });
  } else if (kind === "especiales") {
    html = panelPartido("⚽", tfn("tabEspeciales", "Partidos especiales"), tfn("especialesTexto", ""), null);
  }
  c.innerHTML = html;
}

function panelPartido(icono, titulo, texto, boton) {
  let b = "";
  if (boton) {
    b = '<button type="button" class="btn btn-pso btn-sm fw-bold" onclick="' + boton.fn + '">' + boton.lb + '</button>';
  }
  return '<div class="border rounded p-3 mb-2 bg-body">' +
    '<h6 class="fw-bold text-dark mb-2">' + icono + " " + titulo + '</h6>' +
    '<p class="text-muted small mb-2">' + texto + '</p>' + b + '</div>';
}

function renderPartido() {
  const base = document.getElementById("partido-info-base");
  if (base) {
    if (jugador && jugador.clubActual) {
      const esPrimera = jugador.division === 1 && !(jugador.temporadasForzadoSegunda > 0);
      const liga = uiT(esPrimera ? "primeraDivision" : "segundaDivision", esPrimera ? "Primera División" : "Segunda División");
      base.innerText = uiT("navPartido", "Partido") + " · " + liga + " · T" + jugador.temporadaActual;
    } else {
      base.innerText = "";
    }
  }
  const btnEv = document.getElementById("btn-partido-evento");
  if (btnEv) {
    if (jugador && jugador.eventoDisponibleActual) {
      btnEv.classList.remove("hidden");
      btnEv.innerText = "⭐ Evento Social";
    } else {
      btnEv.classList.add("hidden");
    }
  }
  tabPartido("destaques");
}

// ============================================================
//  VISTA: ENTRENAMIENTO
// ============================================================
function renderEntrenamiento() {
  const cont = document.getElementById("atributos-vista");
  if (!cont) return;
  const tfn = uiT;
  if (!jugador || !jugador.atributos) {
    cont.innerHTML = '<div class="col-12"><div class="alert alert-light border text-secondary small mb-0">' + tfn("sinDatos", "Sin datos todavía.") + '</div></div>';
    return;
  }
  const attrs = (typeof window.atributosDePosicion === "function") ? window.atributosDePosicion(jugador.posicion) : [];
  if (!attrs.length) { cont.innerHTML = ""; return; }
  let html = "";
  attrs.forEach(function(a) {
    const val = jugador.atributos[a] != null ? jugador.atributos[a] : 0;
    const nombreA = (typeof window.nombreAtributo === "function") ? window.nombreAtributo(a) : a;
    const emoji = (typeof EMOJI_ATRIBUTO !== "undefined" && EMOJI_ATRIBUTO[a]) || "🎽";
    const pct = Math.max(0, Math.min(100, (val / 99) * 100));
    html += '<div class="col-6 col-md-4 col-xl-3"><div class="border rounded p-2 h-100 text-center attr-card" onclick="abrirEntrenamientoAtributos()" role="button" tabindex="0">' +
      '<div style="font-size:1.4rem">' + emoji + '</div>' +
      '<div class="fw-bold small text-uppercase">' + a + '</div>' +
      '<div class="text-muted small">' + nombreA + '</div>' +
      '<div class="fw-bold fs-5 text-primary">' + val + '</div>' +
      '<div class="progress" style="height:8px;"><div class="progress-bar bg-success" role="progressbar" style="width:' + pct + '%" aria-valuenow="' + val + '" aria-valuemin="0" aria-valuemax="99"></div></div>' +
      '</div></div>';
  });
  cont.innerHTML = html;
}

// ============================================================
//  VISTA: PROGRESO
// ============================================================
function renderProgreso() {
  const tfn = uiT;

  const statsEl = document.getElementById("stats-vista");
  if (statsEl) {
    let datos = null;
    if (typeof calcularEstadisticas === "function") { try { datos = calcularEstadisticas(); } catch (ign) {} }
    if (!datos) {
      statsEl.innerHTML = '<p class="text-secondary small mb-0">' + tfn("sinDatos", "Sin datos todavía.") + '</p>';
    } else {
      statsEl.innerHTML = '<div class="row g-2 text-center">' +
        '<div class="col-4 col-md-2"><div class="border rounded p-2"><span class="rt-label d-block">' + tfn("thTemp", "Temporadas") + '</span><strong>' + datos.temporadas + '</strong></div></div>' +
        '<div class="col-4 col-md-2"><div class="border rounded p-2"><span class="rt-label d-block">' + tfn("thPJ", "PJ") + '</span><strong>' + datos.totalPJ + '</strong></div></div>' +
        '<div class="col-4 col-md-2"><div class="border rounded p-2"><span class="rt-label d-block">' + tfn("thGoles", "Goles") + '</span><strong>' + datos.totalG + '</strong></div></div>' +
        '<div class="col-4 col-md-2"><div class="border rounded p-2"><span class="rt-label d-block">Prom.</span><strong>' + datos.promGoles + '</strong></div></div>' +
        '<div class="col-4 col-md-2"><div class="border rounded p-2"><span class="rt-label d-block">Máx OVR</span><strong>' + datos.mejorOVR + '</strong></div></div>' +
        '<div class="col-4 col-md-2"><div class="border rounded p-2"><span class="rt-label d-block">Mejor temp.</span><strong>T' + datos.mejor.temporada + '</strong></div></div>' +
        '</div>';
    }
  }

  const evolEl = document.getElementById("evol-vista");
  if (evolEl) {
    const h = jugador ? (jugador.historialTemporadas || []) : [];
    if (!h.length) {
      evolEl.innerHTML = '<p class="text-secondary small mb-0">' + tfn("sinDatos", "Sin datos todavía.") + '</p>';
    } else {
      let html = '<div class="d-flex align-items-end gap-1 con-evol" style="min-height:150px;">';
      h.forEach(function(temp) {
        const m = temp.media != null ? temp.media : 0;
        const alt = Math.max(6, Math.round((Math.min(99, m) / 99) * 120));
        html += '<div class="flex-fill text-center">' +
          '<div class="barra-evol bg-primary rounded-top mx-auto" style="height:' + alt + 'px;" title="T' + temp.temporada + '">' +
          '<span class="barra-valor">' + m + '</span></div>' +
          '<div class="small text-muted mt-1">T' + temp.temporada + '</div></div>';
      });
      html += '</div><p class="text-secondary small mt-2 mb-0">' + tfn("marcaOVR", "Media por temporada") + '</p>';
      evolEl.innerHTML = html;
    }
  }

  const logrosEl = document.getElementById("logros-vista");
  if (logrosEl) logrosEl.innerHTML = htmlLogros(tfn);
}

function htmlLogros(tfn) {
  const desbloqueados = (jugador && jugador.logros) || [];
  const portugues = (typeof prefs !== "undefined") && prefs.idioma === "pt";
  const logros = (typeof LOGROS !== "undefined") ? LOGROS : [];
  if (!logros.length) return '<p class="text-secondary small mb-0">' + tfn("sinDatos", "Sin datos todavía.") + '</p>';
  let html = '<div class="row g-2">';
  logros.forEach(function(l) {
    const ok = desbloqueados.indexOf(l.id) !== -1;
    const nombre = portugues && l.nombrePt ? l.nombrePt : l.nombre;
    const desc = portugues && l.descPt ? l.descPt : l.desc;
    const estado = ok ? tfn("logroCompletado", "✅ Completado") : tfn("logroPendiente", "⬜ Pendiente");
    html += '<div class="col-6 col-md-4 col-xl-3"><div class="border rounded p-2 text-center h-100 ' +
      (ok ? "border-warning" : "border-secondary opacity-50") + '">' +
      '<div style="font-size:1.5rem">' + l.emoji + '</div>' +
      '<div class="fw-bold small' + (ok ? " text-decoration-line-through" : "") + '">' + nombre + '</div>' +
      '<div class="text-secondary" style="font-size:0.72rem">' + desc + '</div>' +
      '<div class="small ' + (ok ? "text-success fw-bold" : "text-secondary") + '">' + estado + '</div>' +
      '</div></div>';
  });
  return html + '</div>';
}

// ============================================================
//  VISTA: COMUNIDAD
// ============================================================
function renderComunidad() {
  const tfn = uiT;

  const rv = document.getElementById("ranking-vista");
  if (rv) {
    rv.innerHTML = '<div class="text-center py-3">' +
      '<div style="font-size:2rem">🏆</div>' +
      '<p class="text-secondary small mb-2">' + tfn("rankingAbre", "Abrir ranking") + '</p>' +
      '<button type="button" class="btn btn-pso fw-bold" onclick="mostrarRanking()">🏆 ' + tfn("ranking", "Ranking") + '</button></div>';
  }

  const dv = document.getElementById("duelo-vista");
  if (dv) {
    const lbDuelo = String(tfn("dueloBoton", "⚔️ 1v1")).split("(")[0].trim() || "1v1";
    dv.innerHTML = '<div class="text-center py-3">' +
      '<div style="font-size:2rem">⚔️</div>' +
      '<p class="text-secondary small mb-2">' + tfn("dueloAbre", "Entrar a 1v1") + '</p>' +
      '<button type="button" class="btn btn-pso fw-bold" onclick="abrirPantallaDuelo()">⚔️ ' + lbDuelo + '</button></div>';
  }

  const re = document.getElementById("redes-vista");
  const feedFuente = document.getElementById("redes-feed-lateral");
  if (re) {
    re.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">' +
      '<strong class="text-danger">' + tfn("redesTitulo", "📱 Redes Sociales") + '</strong>' +
      '<button type="button" class="btn btn-sm btn-outline-danger fw-bold" onclick="mostrarRedesSociales()">📱 ' + tfn("redesAbrir", "Ver redes") + '</button></div>' +
      '<div id="redes-feed-comunidad"></div>';
    const fc = document.getElementById("redes-feed-comunidad");
    if (fc) {
      if (typeof renderizarFeedRedes === "function") renderizarFeedRedes();
      fc.innerHTML = feedFuente ? feedFuente.innerHTML : '';
    }
  }

  const cv = document.getElementById("cuenta-vista");
  if (cv) {
    let sesionActiva = false;
    try { sesionActiva = !!(window.CoperoCuenta && typeof window.CoperoCuenta.tieneSesion === "function" && window.CoperoCuenta.tieneSesion()); } catch (ign) {}
    cv.innerHTML = '<div class="text-center py-3">' +
      '<div style="font-size:2rem">🔐</div>' +
      (sesionActiva
        ? '<p class="text-success fw-bold small mb-2">' + tfn("cuentaSesionOk", "Sesión iniciada.") + '</p>' +
          '<button type="button" class="btn btn-outline-secondary btn-sm fw-bold" onclick="abrirPanelCuenta()">🔐 ' + tfn("cuentaBoton", "Cuenta") + '</button>'
        : '<p class="text-secondary small mb-2">' + tfn("sinSesion", "No hay sesión iniciada.") + '</p>' +
          '<button type="button" class="btn btn-outline-secondary btn-sm fw-bold" onclick="abrirPanelCuenta()">🔐 ' + tfn("cuentaBoton", "Cuenta") + '</button>') +
      '</div>';
  }
}

// ============================================================
//  TARJETA DEL JUGADOR: panel de atributos
// ============================================================
function toggleAtributosPanel() {
  const panel = document.getElementById("panel-atributos");
  if (!panel) return;
  const estabaOculto = panel.classList.contains("hidden");
  panel.classList.toggle("hidden", !estabaOculto);
  document.querySelectorAll("[onclick='toggleAtributosPanel()']").forEach(function(b) {
    b.setAttribute("aria-expanded", estabaOculto ? "true" : "false");
  });
}

// ============================================================
//  MENÚ DE PERFIL
// ============================================================
function abrirPanelCuenta() {
  const juego = document.getElementById("pantalla-juego");
  const inicio = document.getElementById("pantalla-inicio");
  if (inicio) inicio.classList.remove("hidden");
  if (juego) juego.classList.add("hidden");
  const panel = document.getElementById("cuenta-panel");
  if (panel) {
    panel.hidden = false;
    panel.open = true;
    setTimeout(function() {
      try { panel.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (ign) {}
    }, 80);
  }
}

function cerrarSesionPerfil() {
  const btn = document.getElementById("cuenta-salir");
  if (btn) { btn.click(); return; }
  mostrarToast("↪ " + uiT("cuentaSalir", "Cerrar sesión"));
}

function syncIdiomaInicio() {
  const selInicio = document.getElementById("select-idioma");
  if (selInicio) selInicio.value = prefs.idioma || "es";
}

function abrirConfiguracion() {
  const sel = document.getElementById("select-idioma-perfil");
  if (sel) {
    if (!sel.dataset.listo) {
      sel.dataset.listo = "1";
      [["es", "Español"], ["en", "English"], ["pt", "Português"]].forEach(function(pair) {
        const op = document.createElement("option");
        op.value = pair[0];
        op.textContent = pair[1];
        sel.appendChild(op);
      });
      sel.addEventListener("change", function() {
        if (typeof cambiarIdioma === "function") cambiarIdioma(sel.value);
        syncIdiomaInicio();
      });
    }
    sel.value = (typeof prefs !== "undefined" && prefs.idioma) || "es";
  }
  const chk = document.getElementById("btn-modo-oscuro-perfil");
  if (chk) {
    if (!chk.dataset.listo) {
      chk.dataset.listo = "1";
      chk.addEventListener("change", function() {
        if (typeof toggleModoOscuro === "function") toggleModoOscuro();
      });
    }
    chk.checked = !!(typeof prefs !== "undefined" && prefs.modoOscuro);
  }
  const mod = document.getElementById("modalConfiguracion");
  if (mod && typeof bootstrap !== "undefined") {
    bootstrap.Modal.getOrCreateInstance(mod).show();
  }
}

// ============================================================
//  MODO APLICACIÓN: muestra barra lateral / bottom nav solo en juego
// ============================================================
function actualizarModoAplicacion() {
  const juego = document.getElementById("pantalla-juego");
  const inicio = document.getElementById("pantalla-inicio");
  const activo = juego && inicio && !juego.classList.contains("hidden") && inicio.classList.contains("hidden");
  document.body.classList.toggle("app-juego", !!activo);
}

if (typeof MutationObserver !== "undefined") {
  new MutationObserver(function() {
    actualizarModoAplicacion();
  }).observe(document.body, { childList: true, subtree: true, attributeFilter: ["class"] });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function() {
    actualizarModoAplicacion();
  });
}