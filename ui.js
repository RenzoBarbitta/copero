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
  carrera: ["navCarrera"],
  partido: ["navPartido"],
  entrenamiento: ["navEntrenamiento"],
  progreso: ["navProgreso"],
  comunidad: ["navComunidad"]
};

// ============================================================
//  ICONOS (SVG inline, estilo Lucide). Sin emojis de navegación.
// ============================================================
const ICONOS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-9h6v9"/>',
  partido: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  entrenar: '<path d="M6.5 3.5v17"/><path d="M17.5 3.5v17"/><path d="M2.5 8v8"/><path d="M21.5 8v8"/><path d="M6.5 12h11"/>',
  progreso: '<path d="M3 3v18h18"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-8"/>',
  comunidad: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  perfil: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  jugar: '<path d="m5 3 14 9-14 9V3z"/>',
  mercado: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  stats: '<path d="M3 3v18h18"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-8"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  noticias: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V4"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>',
  trofeo: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  redes: '<path d="m16 3 5 5-5 5"/><path d="M20 8H9a5 5 0 0 0-5 5v0"/>',
  duelo: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  corazon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  ojo: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  mano: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  pies: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>',
  girar: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  punto: '<circle cx="12" cy="12" r="5"/>'
};

function iconoSVG(nombre, tam) {
  const t = tam || 20;
  return '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONOS[nombre] || ICONOS.punto) + '</svg>';
}

function uiT(clave, fallback) {
  if (typeof t === "function") {
    const v = t(clave);
    return v === clave ? (fallback || clave) : v;
  }
  return fallback || clave;
}

// ============================================================
//  RIVAL PROBABLE (solo visual: próximo partido)
//  Elige un club con reputación similar, sin repetir el propio.
// ============================================================
function clubRivalProbable() {
  if (typeof CLUBES === "undefined" || !Array.isArray(CLUBES) || !jugador || !jugador.clubActual) return null;
  const propio = jugador.clubActual.nombre;
  const rep = jugador.clubActual.reputacion || 5;
  let mejor = null;
  let mejorDiff = 1e9;
  CLUBES.forEach(function(c) {
    if (c.nombre === propio) return;
    const diff = Math.abs(c.reputacion - rep);
    if (diff < mejorDiff) { mejorDiff = diff; mejor = c; }
  });
  return mejor;
}

function pintarEscudo(contenedorId, club) {
  const el = document.getElementById(contenedorId);
  if (!el) return;
  const iniciales = club && club.nombre ? club.nombre.slice(0, 3).toUpperCase() : "?";
  if (club && club.imagen) {
    el.innerHTML = '<img src="' + club.imagen + '" alt="' + iniciales + '">';
    el.querySelector("img").onerror = function() { el.innerHTML = '<span class="sin-img">' + iniciales + '</span>'; };
  } else {
    el.innerHTML = '<span class="sin-img">' + iniciales + '</span>';
  }
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
  if (ruta && meta) ruta.innerHTML = uiT(meta[0], meta[0]);
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
//  REFRESCO DE VISTAS: re-renderiza la sección visible cada vez
//  que se actualiza la interfaz (inicio, simulación, etc.).
// ============================================================
const _actualizarInterfazUI = actualizarInterfaz;
actualizarInterfaz = function() {
  _actualizarInterfazUI();
  UI_SECCIONES.forEach(function(s) {
    const vista = document.getElementById("vista-" + s);
    if (vista && !vista.classList.contains("hidden")) {
      const renderer = window["render" + s.charAt(0).toUpperCase() + s.slice(1)];
      if (typeof renderer === "function") {
        try { renderer(); } catch (ign) {}
      }
    }
  });
};

// ============================================================
//  VISTA: CARRERA (dashboard)
// ============================================================
function renderCarrera() {
  if (!jugador || !jugador.clubActual) return;
  const club = jugador.clubActual;
  const rival = clubRivalProbable();
  const setVal = function(pid, v) {
    const el = document.getElementById(pid);
    if (el) el.innerText = (v == null ? "" : String(v));
  };
  const esPrimera = jugador.division === 1 && !(jugador.temporadasForzadoSegunda > 0);
  setVal("carrera-competen", uiT(esPrimera ? "primeraDivision" : "segundaDivision", esPrimera ? "Primera División" : "Segunda División"));
  setVal("temporada-actual", jugador.temporadaActual);

  setVal("carrera-club-local", club.nombre);
  setVal("carrera-club-rival", rival ? rival.nombre : "—");
  pintarEscudo("carrera-escudo-local", club);
  pintarEscudo("carrera-escudo-rival", rival);

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
    html = panelPartido("trofeo", tfn("tabMomentos", "Momentos clave"), tfn("momentosTexto", ""), null);
  } else if (kind === "penales") {
    html = panelPartido("target", tfn("tabPenales", "Penales"), tfn("penalesTexto", ""), { lb: tfn("abrirTanda", "Jugar tanda de penales"), fn: "iniciarMinijuegoPenales()" });
  } else if (kind === "libres") {
    html = panelPartido("zap", tfn("tabLibres", "Tiros libres"), tfn("tiroLibreTexto", ""), { lb: tfn("abrirTiroLibre", "Jugar tiro libre"), fn: "iniciarMinijuegoTiroLibre('entrenamiento')" });
  } else if (kind === "especiales") {
    html = panelPartido("partido", tfn("tabEspeciales", "Partidos especiales"), tfn("especialesTexto", ""), null);
  }
  c.innerHTML = html;
}

function panelPartido(icono, titulo, texto, boton) {
  let b = "";
  if (boton) {
    b = '<button type="button" class="btn btn-pso btn-sm fw-bold mt-2" onclick="' + boton.fn + '">' + iconoSVG("jugar", 14) + " " + boton.lb + '</button>';
  }
  return '<div class="contenido-partido-panel">' +
    '<div class="d-flex align-items-center gap-2 mb-1"><span class="attr-icono" style="width:30px;height:30px;">' + iconoSVG(icono, 15) + '</span>' +
    '<h6 class="fw-bold m-0">' + titulo + '</h6></div>' +
    '<p class="text-muted small mb-0">' + texto + '</p>' + b + '</div>';
}

function renderPartido() {
  const club = jugador && jugador.clubActual ? jugador.clubActual : null;
  const rival = club ? clubRivalProbable() : null;
  if (club) {
    const cl = document.getElementById("partido-club-local");
    if (cl) cl.innerText = club.nombre;
    const cr = document.getElementById("partido-club-rival");
    if (cr) cr.innerText = rival ? rival.nombre : "—";
    pintarEscudo("partido-escudo-local", club);
    pintarEscudo("partido-escudo-rival", rival);
  }
  const base = document.getElementById("partido-info-base");
  if (base) {
    if (club) {
      const esPrimera = jugador.division === 1 && !(jugador.temporadasForzadoSegunda > 0);
      const liga = uiT(esPrimera ? "primeraDivision" : "segundaDivision", esPrimera ? "Primera División" : "Segunda División");
      base.innerText = liga + " · " + uiT("temporadaActual", "Temporada") + " " + jugador.temporadaActual;
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
    cont.innerHTML = '<div class="col-12"><div class="alert border text-secondary small mb-0">' + tfn("sinDatos", "Sin datos todavía.") + '</div></div>';
    return;
  }
  const attrs = (typeof window.atributosDePosicion === "function") ? window.atributosDePosicion(jugador.posicion) : [];
  if (!attrs.length) { cont.innerHTML = ""; return; }
  const iconosAttr = { VEL: "zap", PAS: "share", REM: "target", DEF: "shield", REG: "girar", RES: "corazon", REF: "ojo", MAN: "mano", SAL: "pies" };
  const entrenarTxt = tfn("entrenar", "Entrenar");
  let html = "";
  attrs.forEach(function(a) {
    const val = jugador.atributos[a] != null ? jugador.atributos[a] : 0;
    const nombreA = (typeof window.nombreAtributo === "function") ? window.nombreAtributo(a) : a;
    const pct = Math.max(0, Math.min(100, (val / 99) * 100));
    const max = val >= 95;
    html += '<div class="col"><div class="attr-card h-100 text-center" onclick="abrirEntrenamientoAtributos()" role="button" tabindex="0" aria-label="' + a + ': ' + val + '">' +
      '<div class="attr-icono">' + iconoSVG(iconosAttr[a] || "punto", 20) + '</div>' +
      '<div class="attr-nombre">' + a + '</div>' +
      '<div class="text-muted small mb-1">' + nombreA + '</div>' +
      '<div class="attr-valor' + (max ? " max" : "") + '">' + val + "</div>" +
      '<div class="progress my-2"><div class="progress-bar" role="progressbar" style="width:' + pct + '%" aria-valuenow="' + val + '" aria-valuemin="0" aria-valuemax="99"></div></div>' +
      '<button type="button" class="btn btn-pso btn-sm w-100 fw-bold">' + entrenarTxt + '</button>' +
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
    rv.innerHTML = '<div class="vacio">' +
      '<div class="vacio-icono">' + iconoSVG("trofeo", 22) + '</div>' +
      '<div class="vacio-texto">' + tfn("rankingAbre", "Abrir ranking") + '</div>' +
      '<button type="button" class="btn btn-pso fw-bold btn-sm">' + iconoSVG("trofeo", 16) + ' ' + tfn("ranking", "Ranking") + '</button></div>';
    const btn = rv.querySelector("button");
    if (btn) btn.onclick = mostrarRanking;
  }

  const dv = document.getElementById("duelo-vista");
  if (dv) {
    const lbDuelo = String(tfn("dueloBoton", "⚔️ 1v1")).split("(")[0].trim().replace(/[^\w\s1v]/g, "") || "1v1";
    dv.innerHTML = '<div class="vacio">' +
      '<div class="vacio-icono">' + iconoSVG("duelo", 22) + '</div>' +
      '<div class="vacio-texto">' + tfn("dueloAbre", "Entrar a 1v1") + '</div>' +
      '<button type="button" class="btn btn-pso fw-bold btn-sm">' + iconoSVG("duelo", 15) + ' 1v1</button></div>';
    const btn = dv.querySelector("button");
    if (btn) btn.onclick = abrirPantallaDuelo;
  }

  const re = document.getElementById("redes-vista");
  const feedFuente = document.getElementById("redes-feed-lateral");
  if (re) {
    re.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">' +
      '<strong>' + tfn("redesTitulo", "Redes Sociales") + '</strong>' +
      '<button type="button" class="btn btn-sm btn-outline-danger fw-bold" onclick="mostrarRedesSociales()">' + tfn("redesAbrir", "Ver redes") + '</button></div>' +
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
    cv.innerHTML = '<div class="vacio">' +
      '<div class="vacio-icono">' + iconoSVG("perfil", 22) + '</div>' +
      (sesionActiva
        ? '<div class="vacio-titulo text-success">' + tfn("cuentaSesionOk", "Sesión iniciada.") + '</div>'
        : '<div class="vacio-texto">' + tfn("sinSesion", "No hay sesión iniciada.") + '</div>') +
      '<button type="button" class="btn btn-outline-secondary btn-sm fw-bold" onclick="abrirPanelCuenta()">' + tfn("cuentaBoton", "Cuenta") + '</button>' +
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