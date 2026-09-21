// ============================================================
//  CARRERA DE LEYENDA - features.js
//  Nuevas mecanicas: minijuegos, moral, lesiones, logros,
//  finales, idiomas, slots, ranking, modo oscuro, etc.
//  Se carga DESPUES de app.js
// ============================================================

// ------------------------------------------------------------
//  PREFERENCIAS (idioma, modo oscuro, seed)
// ------------------------------------------------------------
const PREFS_KEY = "pso_prefs_v1";
let prefs = { idioma: "es", modoOscuro: false, seed: null };
let modoDesafioPendiente = false;
try {
  const rawPrefs = localStorage.getItem(PREFS_KEY);
  if (rawPrefs) prefs = Object.assign(prefs, JSON.parse(rawPrefs));
} catch (e) { /* ignorar */ }

function guardarPrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {}
}

function t(clave) {
  const dic = TEXTOS_UI[prefs.idioma] || TEXTOS_UI.es;
  return dic[clave] || clave;
}

// ------------------------------------------------------------
//  MODO OSCURO
// ------------------------------------------------------------
function aplicarModoOscuro() {
  document.body.classList.toggle("modo-oscuro", prefs.modoOscuro);
  const btn = document.getElementById("btn-modo-oscuro");
  if (btn) btn.innerText = prefs.modoOscuro ? "☀️" : "🌙";
}

function toggleModoOscuro() {
  prefs.modoOscuro = !prefs.modoOscuro;
  guardarPrefs();
  aplicarModoOscuro();
}

// ------------------------------------------------------------
//  IDIOMAS (traduccion completa via data-i18n)
// ------------------------------------------------------------
function cambiarIdioma(idioma) {
  prefs.idioma = idioma;
  guardarPrefs();
  traducirInterfaz();
}

function traducirInterfaz() {
  document.querySelectorAll("[data-i18n]").forEach(function(el) {
    const clave = el.getAttribute("data-i18n");
    el.innerText = t(clave);
  });
  // data-i18n-title: traduce el atributo title (tooltips), sin tocar el texto.
  document.querySelectorAll("[data-i18n-title]").forEach(function(el) {
    el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
  });
  const inp = document.getElementById("input-nombre");
  if (inp) inp.setAttribute("placeholder", t("placeholderNombre"));
  document.documentElement.lang = prefs.idioma || "es";
  document.title = t("titulo");
}

// ------------------------------------------------------------
//  ANIMACION DE OVR (contador)
// ------------------------------------------------------------
function animarOVR(desde, hasta, elemento) {
  if (!elemento) return;
  const duracion = 600;
  const inicio = performance.now();
  function paso(now) {
    const p = Math.min(1, (now - inicio) / duracion);
    elemento.innerText = Math.round(desde + (hasta - desde) * p);
    if (p < 1) requestAnimationFrame(paso);
    else elemento.innerText = hasta;
  }
  requestAnimationFrame(paso);
}

// ------------------------------------------------------------
//  CONFETI
// ------------------------------------------------------------
function lanzarConfeti(cantidad) {
  cantidad = cantidad || 60;
  const colores = ["#ffd43b", "#4dabf7", "#69db7c", "#cc5de8", "#ff6b6b"];
  for (let i = 0; i < cantidad; i++) {
    const c = document.createElement("div");
    c.className = "confeti";
    c.style.left = (Math.random() * 100) + "vw";
    c.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
    c.style.animationDelay = (Math.random() * 0.5) + "s";
    c.style.animationDuration = (1.5 + Math.random()) + "s";
    document.body.appendChild(c);
    setTimeout(function() { c.remove(); }, 3000);
  }
}

// ------------------------------------------------------------
//  LOGROS
// ------------------------------------------------------------
function desbloquearLogro(id) {
  if (!jugador.logros) jugador.logros = [];
  if (jugador.logros.indexOf(id) !== -1) return;
  const logro = LOGROS.find(function(l) { return l.id === id; });
  if (!logro) return;
  jugador.logros.push(id);
  guardarPartida();
  mostrarNotificacion(
    logro.emoji + " ¡Logro Desbloqueado!",
    "<strong>" + logro.nombre + "</strong><br><span class='text-secondary'>" + logro.desc + "</span>"
  );
}

function chequearLogros() {
  if ((jugador.trofeos.botaDeOro || 0) > 0) desbloquearLogro("bota_oro");
  if ((jugador.trofeos.balonDeOro || 0) > 0) desbloquearLogro("balon_oro");
  if ((jugador.trofeos.copaDeCampeones || 0) > 0) desbloquearLogro("copa_campeones");
  if ((jugador.trofeos.primeraDivision || 0) + (jugador.trofeos.segundaDivision || 0) > 0) desbloquearLogro("primer_titulo");
  if (jugador.media >= 85) desbloquearLogro("master");
  if (jugador.media >= 90) desbloquearLogro("inmortal");
  if (jugador.temporadaActual >= 10) desbloquearLogro("temporada_10");
  const titulosTotales = (jugador.trofeos.primeraDivision || 0) + (jugador.trofeos.segundaDivision || 0);
  // Triplete: 3 o más títulos ganados en UNA MISMA temporada
  const huboTriplete = (jugador.historialTemporadas || []).some(function(t) {
    if (!t.trofeos || t.trofeos === "Ninguno") return false;
    return t.trofeos.split(",").length >= 3;
  });
  if (huboTriplete) desbloquearLogro("triplete");
  if (jugador.loroOcurrio && jugador.temporadasForzadoSegunda === 0) desbloquearLogro("superviviente");
}

function mostrarPanelLogros() {
  const desbloqueados = jugador.logros || [];
  const portugues = typeof prefs !== "undefined" && prefs.idioma === "pt";
  const titulo = typeof t === "function" ? t("logrosTitulo") : "🏅 Logros";
  const completado = typeof t === "function" ? t("logroCompletado") : "✅ Completado";
  const pendente = typeof t === "function" ? t("logroPendiente") : "⬜ Pendiente";
  let html = "<h6 class='mb-3'>" + titulo + "</h6><div class='row g-2'>";
  LOGROS.forEach(function(l) {
    const ok = desbloqueados.indexOf(l.id) !== -1;
    const nombre = portugues && l.nombrePt ? l.nombrePt : l.nombre;
    const descripcion = portugues && l.descPt ? l.descPt : l.desc;
    html += "<div class='col-6 col-md-4'><div class='border rounded p-2 text-center h-100 " +
      (ok ? "border-warning" : "border-secondary opacity-50") + "'>" +
      "<div style='font-size:1.5rem'>" + l.emoji + "</div>" +
      "<div class='fw-bold small'" + (ok ? " style='text-decoration:line-through;'" : "") + ">" + nombre + "</div>" +
      "<div class='text-secondary' style='font-size:0.72rem'>" + descripcion + "</div>" +
      (ok ? "<div class='small text-success fw-bold'>" + completado + "</div>" : "<div class='small text-secondary'>" + pendente + "</div>") +
      "</div></div>";
  });
  html += "</div>";
  mostrarNotificacion("Logros", html);
}

// ------------------------------------------------------------
//  MORAL / FORMA
// ------------------------------------------------------------
function ajustarMoral(delta) {
  jugador.moral = Math.max(CONFIG.MORAL_MIN, Math.min(CONFIG.MORAL_MAX, jugador.moral + delta));
}

function estadoMoral() {
  if (jugador.moral >= 80) return { txt: "🔥 En racha", color: "text-success" };
  if (jugador.moral >= 55) return { txt: "🙂 Bien", color: "text-primary" };
  if (jugador.moral >= 30) return { txt: "😐 Normal", color: "text-secondary" };
  return { txt: "😞 Baja", color: "text-danger" };
}

// ------------------------------------------------------------
//  MERCADO CON RIVALES (ver WRAPPERS más abajo)
// ------------------------------------------------------------

// ------------------------------------------------------------
//  SLOTS DE GUARDADO
// ------------------------------------------------------------
function claveSlot(n) { return "pso_slot_" + n; }

function guardarEnSlot(n) {
  try {
    localStorage.setItem(claveSlot(n), JSON.stringify(jugador));
    mostrarNotificacion("Guardado", "Partida guardada en el slot " + n + ".");
  } catch (e) {
    mostrarNotificacion("Error", "No se pudo guardar en el slot.");
  }
}

function cargarDeSlot(n) {
  try {
    const rawSlot = localStorage.getItem(claveSlot(n));
    if (!rawSlot) { mostrarNotificacion("Vacío", "El slot " + n + " está vacío."); return false; }
    const data = JSON.parse(rawSlot);
    if (data.clubActual && data.clubActual.nombre) {
      data.clubActual = CLUBES.find(function(c) { return c.nombre === data.clubActual.nombre; }) || data.clubActual;
    }
    jugador = Object.assign(crearJugadorInicial(), data);
    return true;
  } catch (e) { return false; }
}

function mostrarSlots() {
  let html = "<h6>💾 Slots de Guardado</h6><div class='d-grid gap-2 mt-2'>";
  for (let i = 1; i <= CONFIG.SLOTS; i++) {
    const ocupado = !!localStorage.getItem(claveSlot(i));
    html += "<div class='d-flex gap-2'>" +
      "<button class='btn btn-outline-primary flex-grow-1' onclick='guardarEnSlot(" + i + ")'>Guardar en Slot " + i + (ocupado ? " 💾" : " (vacío)") + "</button>" +
      "<button class='btn btn-outline-success' " + (ocupado ? "" : "disabled") + " onclick='cargarSlotDesdePanelConLimpieza(" + i + ")'>Cargar</button>" +
      "</div>";
  }
  html += "</div>";
  mostrarNotificacion("Partidas Guardadas", html);
}

function cargarSlotDesdePanel(n) {
  if (cargarDeSlot(n)) {
    modalInfo.hide();
    document.getElementById("pantalla-inicio").classList.add("hidden");
    document.getElementById("pantalla-juego").classList.remove("hidden");
    actualizarInterfaz();
    guardarPartida();
  }
}

// ------------------------------------------------------------
//  RANKING LOCAL
// ------------------------------------------------------------
const RANKING_KEY = "pso_ranking_v1";
function guardarEnRanking() {
  try {
    let ranking = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]");
    const titulos = (jugador.trofeos.primeraDivision || 0) + (jugador.trofeos.segundaDivision || 0) +
                    (jugador.trofeos.copaDeCampeones || 0) + (jugador.trofeos.copaArgentina || 0) +
                    (jugador.trofeos.copaApa || 0);
    ranking.push({ nombre: jugador.nombre, media: jugador.media, titulos: titulos, anio: new Date().getFullYear(), ts: Date.now() });
    ranking.sort(compararRanking);
    ranking = ranking.slice(0, 10);
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
  } catch (e) {}
}

function mostrarRanking() {
  let ranking = [];
  try { ranking = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]"); } catch (e) {}
  if (ranking.length === 0) { mostrarNotificacion("Ranking", "Todavía no hay carreras registradas."); return; }
  ranking.sort(compararRanking);
  let html = "<h6>🏆 Mejores Carreras</h6><ol class='mt-2'>";
  ranking.forEach(function(r) {
    html += "<li><strong>" + r.nombre + "</strong> — " + r.media + " OVR, " + r.titulos + " títulos</li>";
  });
  html += "</ol>";
  mostrarNotificacion("Ranking Local", html);
}

// ------------------------------------------------------------
//  ESTADISTICAS AVANZADAS
// ------------------------------------------------------------
function calcularEstadisticas() {
  const h = jugador.historialTemporadas || [];
  if (h.length === 0) return null;
  const totalPJ = h.reduce(function(a, x) { return a + x.partidos; }, 0);
  const totalG = h.reduce(function(a, x) { return a + x.goles; }, 0);
  const promGoles = (totalG / h.length).toFixed(1);
  const mejor = h.reduce(function(a, x) { return x.goles > a.goles ? x : a; }, h[0]);
  const mejorOVR = Math.max.apply(null, h.map(function(x) { return x.media; }));
  return { totalPJ: totalPJ, totalG: totalG, promGoles: promGoles, mejor: mejor, mejorOVR: mejorOVR, temporadas: h.length };
}

function mostrarEstadisticas() {
  const s = calcularEstadisticas();
  if (!s) { mostrarNotificacion("Estadísticas", "Todavía no jugaste ninguna temporada."); return; }
  mostrarNotificacion("📊 Estadísticas Avanzadas",
    "<ul class='mb-0'>" +
    "<li>Temporadas jugadas: <strong>" + s.temporadas + "</strong></li>" +
    "<li>Partidos totales: <strong>" + s.totalPJ + "</strong></li>" +
    "<li>Goles totales: <strong>" + s.totalG + "</strong></li>" +
    "<li>Promedio de goles/temporada: <strong>" + s.promGoles + "</strong></li>" +
    "<li>Mejor temporada: <strong>Temp. " + s.mejor.temporada + "</strong> (" + s.mejor.goles + " goles)</li>" +
    "<li>OVR máximo alcanzado: <strong>" + s.mejorOVR + "</strong></li>" +
    "</ul>"
  );
}

// ------------------------------------------------------------
//  MODAL DE MINIJUEGOS (selector)
// ------------------------------------------------------------
function abrirSelectorMinijuegos() {
  if (!puedeJugarMinijuegoExtra()) return;
  const botones = [
    { nombre: "Regate en Zigzag", emoji: "🏃", fn: "iniciarMinijuegoRegate()" },
    { nombre: "Pase Filtrado",    emoji: "🎯", fn: "iniciarMinijuegoPase()" },
    { nombre: "Cabezazo",         emoji: "💥", fn: "iniciarMinijuegoCabezazo()" },
    { nombre: "1 vs 1",           emoji: "⚔️", fn: "iniciarMinijuegoUnoVsUno()" },
    { nombre: "Tanda de Penales", emoji: "🥅", fn: "iniciarMinijuegoPenales()" }
  ];
  let html = "<p class='small text-secondary'>Elegí un minijuego extra. Máximo <strong>1 minijuego por temporada</strong> (además del entrenamiento tradicional).</p><div class='d-grid gap-2'>";
  botones.forEach(function(b) {
    html += "<button class='btn btn-outline-warning fw-bold' onclick='modalInfo.hide(); " + b.fn + "'>" + b.emoji + " " + b.nombre + "</button>";
  });
  html += "</div>";
  mostrarNotificacion("🎮 Minijuegos", html);
}

// ------------------------------------------------------------
//  LÍMITE: 1 ENTRENAMIENTO + 1 MINIJUEGO POR TEMPORADA
// ------------------------------------------------------------
function puedeJugarMinijuegoExtra() {
  if (jugador.minijuegosUsadosEstaTemporada >= CONFIG.MINIJUEGOS_POR_TEMPORADA) {
    mostrarNotificacion("Atención", "Ya jugaste tu minijuego de esta temporada.<br><br>Por temporada solo podés hacer <strong>1 entrenamiento tradicional + 1 minijuego</strong>.");
    return false;
  }
  return true;
}

// ------------------------------------------------------------
//  MINIJUEGO: REGATE EN ZIGZAG
// ------------------------------------------------------------
let regateEstado = null;

function iniciarMinijuegoRegate() {
  if (!puedeJugarMinijuegoExtra()) return;
  const direcciones = ["ArrowLeft", "ArrowRight"];
  const secuencia = [];
  for (let i = 0; i < CONFIG.REGATE.PASOS; i++) {
    secuencia.push(direcciones[Math.floor(Math.random() * 2)]);
  }
  regateEstado = { secuencia: secuencia, idx: 0, activo: true };

  document.getElementById("modalDominiosTitulo").innerText = "🏃 Regate en Zigzag";
  document.getElementById("secuenciaObjetivo").innerText = "⬅️ = Izquierda | ➡️ = Derecha";
  document.getElementById("resultadoDominios").innerHTML = "";
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();

  pedirPasoRegate();
}

function pedirPasoRegate() {
  if (!regateEstado || !regateEstado.activo) return;
  const secuencia = regateEstado.secuencia;
  const idx = regateEstado.idx;
  if (idx >= secuencia.length) { finalizarRegate(true); return; }
  const dir = secuencia[idx];
  document.getElementById("secuenciaObjetivo").innerText =
    "Rival " + (idx + 1) + "/" + secuencia.length + ": " + (dir === "ArrowLeft" ? "⬅️ Esquivá a la IZQUIERDA" : "➡️ Esquivá a la DERECHA");

  const manejar = function(e) {
    if (!regateEstado || !regateEstado.activo) return;
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
      window.removeEventListener("keydown", manejar);
      if (e.code === dir) {
        regateEstado.idx++;
        pedirPasoRegate();
      } else {
        finalizarRegate(false);
      }
    }
  };
  window.addEventListener("keydown", manejar);

  setTimeout(function() {
    window.removeEventListener("keydown", manejar);
    if (regateEstado && regateEstado.activo && regateEstado.idx === idx) {
      finalizarRegate(false);
    }
  }, CONFIG.REGATE.TIEMPO_POR_PASO * 1000);
}

function finalizarRegate(exito) {
  if (!regateEstado) return;
  regateEstado.activo = false;
  const resDiv = document.getElementById("resultadoDominios");
  if (exito) {
    resDiv.className = "text-success fw-bold fs-5 mt-2";
    resDiv.innerText = "🏃 ¡REGATE COMPLETO! Dejaste a todos atrás. (+" + CONFIG.REGATE.SUBIDA_OVR + " OVR)";
    sumarMedia(CONFIG.REGATE.SUBIDA_OVR);
    sonidoExito();
  } else {
    resDiv.className = "text-danger fw-bold fs-5 mt-2";
    resDiv.innerText = "❌ Te robaron la pelota.";
    sonidoError();
  }
  regateEstado = null;
  jugador.minijuegosUsadosEstaTemporada = 1;
  guardarPartida();
  setTimeout(function() { modalDominiosInstance.hide(); verificarCambioRol(); actualizarInterfaz(); }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// ------------------------------------------------------------
//  MINIJUEGO: PASE FILTRADO
// ------------------------------------------------------------
let paseEstado = null;

function iniciarMinijuegoPase() {
  if (!puedeJugarMinijuegoExtra()) return;
  const zona = 30 + Math.random() * 40;
  paseEstado = { pos: 0, dir: 1, zona: zona, activo: true, interval: null };

  document.getElementById("modalDominiosTitulo").innerText = "🎯 Pase Filtrado";
  document.getElementById("secuenciaObjetivo").innerHTML = "Presioná <strong>ESPACIO</strong> cuando la barra esté en la zona verde.";
  document.getElementById("resultadoDominios").innerHTML =
    "<div class='zona-gol my-3' style='position:relative;height:25px;background:#e9ecef;border-radius:8px;overflow:hidden;'>" +
    "<div class='zona-gol-marker' style='left:" + (zona - CONFIG.PASE.ZONA / 2) + "%;width:" + CONFIG.PASE.ZONA + "%;'></div>" +
    "<div id='barraPase' class='progress-bar bg-info' style='width:0%;height:100%;'></div></div>";
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();

  paseEstado.interval = setInterval(function() {
    if (!paseEstado || !paseEstado.activo) return;
    paseEstado.pos += paseEstado.dir * CONFIG.PASE.VELOCIDAD;
    if (paseEstado.pos >= 100 || paseEstado.pos <= 0) paseEstado.dir *= -1;
    const barra = document.getElementById("barraPase");
    if (barra) barra.style.width = paseEstado.pos + "%";
  }, CONFIG.PASE.TICK_MS);

  const manejar = function(e) {
    if (e.code === "Space") {
      e.preventDefault();
      window.removeEventListener("keydown", manejar);
      finalizarPase();
    }
  };
  window.addEventListener("keydown", manejar);
}

function finalizarPase() {
  if (!paseEstado) return;
  clearInterval(paseEstado.interval);
  paseEstado.activo = false;
  const resDiv = document.getElementById("resultadoDominios");
  const enZona = Math.abs(paseEstado.pos - paseEstado.zona) <= CONFIG.PASE.ZONA / 2;
  if (enZona) {
    resDiv.className = "text-success fw-bold fs-5 mt-2";
    resDiv.innerText = "🎯 ¡PASE PERFECTO ENTRE LÍNEAS! (+" + CONFIG.PASE.SUBIDA_OVR + " OVR)";
    sumarMedia(CONFIG.PASE.SUBIDA_OVR);
    sonidoExito();
  } else {
    resDiv.className = "text-danger fw-bold fs-5 mt-2";
    resDiv.innerText = "❌ El pase quedó corto.";
    sonidoError();
  }
  paseEstado = null;
  jugador.minijuegosUsadosEstaTemporada = 1;
  guardarPartida();
  setTimeout(function() { modalDominiosInstance.hide(); verificarCambioRol(); actualizarInterfaz(); }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// ------------------------------------------------------------
//  MINIJUEGO: CABEZAZO
// ------------------------------------------------------------
function iniciarMinijuegoCabezazo() {
  if (!puedeJugarMinijuegoExtra()) return;
  document.getElementById("modalDominiosTitulo").innerText = "💥 Cabezazo";
  document.getElementById("secuenciaObjetivo").innerText = "Esperá...";
  document.getElementById("resultadoDominios").innerHTML = "";
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();

  let activo = true;
  const espera = 1200 + Math.random() * 800;

  setTimeout(function() {
    if (!activo) return;
    document.getElementById("secuenciaObjetivo").innerText = "💥 ¡AHORA! Presioná ESPACIO";
    const manejar = function(e) {
      if (e.code === "Space") {
        e.preventDefault();
        window.removeEventListener("keydown", manejar);
        activo = false;
        finalizarCabezazo(true);
      }
    };
    window.addEventListener("keydown", manejar);
    setTimeout(function() {
      if (activo) {
        window.removeEventListener("keydown", manejar);
        activo = false;
        finalizarCabezazo(false);
      }
    }, 500);
  }, espera);
}

function finalizarCabezazo(exito) {
  const resDiv = document.getElementById("resultadoDominios");
  if (exito) {
    resDiv.className = "text-success fw-bold fs-5 mt-2";
    resDiv.innerText = "💥 ¡CABEZAZO PERFECTO! (+" + CONFIG.CABEZAZO.SUBIDA_OVR + " OVR)";
    sumarMedia(CONFIG.CABEZAZO.SUBIDA_OVR);
    sonidoGol();
  } else {
    resDiv.className = "text-danger fw-bold fs-5 mt-2";
    resDiv.innerText = "❌ Llegaste tarde al centro.";
    sonidoError();
  }
  jugador.minijuegosUsadosEstaTemporada = 1;
  guardarPartida();
  setTimeout(function() { modalDominiosInstance.hide(); verificarCambioRol(); actualizarInterfaz(); }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// ------------------------------------------------------------
//  MINIJUEGO: 1 vs 1
// ------------------------------------------------------------
function iniciarMinijuegoUnoVsUno() {
  if (!puedeJugarMinijuegoExtra()) return;
  document.getElementById("modalDominiosTitulo").innerText = "⚔️ 1 vs 1 con el Arquero";
  document.getElementById("secuenciaObjetivo").innerText = "El arquero espera. Elegí un botón: Amagar, Tirar o Pasarla.";
  document.getElementById("resultadoDominios").innerHTML =
    "<div class='d-grid gap-2 col-8 mx-auto mt-3'>" +
    "<button class='btn btn-outline-primary' onclick=\"resolverUnoVsUno('Amagar')\">🎭 Amagar</button>" +
    "<button class='btn btn-outline-success' onclick=\"resolverUnoVsUno('Tirar')\">⚽ Tirar</button>" +
    "<button class='btn btn-outline-warning' onclick=\"resolverUnoVsUno('Pasarla')\">➡️ Pasarla</button></div>";
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();
}

function resolverUnoVsUno(accion) {
  const acciones = ["Amagar", "Tirar", "Pasarla"];
  const arquero = acciones[Math.floor(Math.random() * 3)];
  const resDiv = document.getElementById("resultadoDominios");
  if (accion !== arquero) {
    resDiv.className = "text-success fw-bold fs-5 mt-2";
    resDiv.innerText = "⚔️ Ganaste el duelo (arquero eligió " + arquero + "). (+" + CONFIG.UNO_VS_UNO.SUBIDA_OVR + " OVR)";
    sumarMedia(CONFIG.UNO_VS_UNO.SUBIDA_OVR);
    sonidoGol();
  } else {
    resDiv.className = "text-danger fw-bold fs-5 mt-2";
    resDiv.innerText = "❌ El arquero leyó tu movimiento (eligió " + arquero + ").";
    sonidoError();
  }
  document.querySelectorAll("#modalDominios .modal-body button").forEach(function(b) { b.disabled = true; });
  jugador.minijuegosUsadosEstaTemporada = 1;
  guardarPartida();
  setTimeout(function() { modalDominiosInstance.hide(); verificarCambioRol(); actualizarInterfaz(); }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// ------------------------------------------------------------
//  MINIJUEGO: TANDA DE PENALES
// ------------------------------------------------------------
function iniciarMinijuegoPenales() {
  if (!puedeJugarMinijuegoExtra()) return;
  document.getElementById("modalDominiosTitulo").innerText = "🥅 Tanda de Penales";
  document.getElementById("secuenciaObjetivo").innerText = "Elegí a dónde patear (el arquero se tira a una zona):";
  document.getElementById("resultadoDominios").innerHTML =
    "<div class='d-flex justify-content-center gap-2 mt-3'>" +
    "<button class='btn btn-outline-danger' onclick=\"resolverPenal('Izquierda')\">⬅️</button>" +
    "<button class='btn btn-outline-danger' onclick=\"resolverPenal('Centro')\">⬆️</button>" +
    "<button class='btn btn-outline-danger' onclick=\"resolverPenal('Derecha')\">➡️</button></div>";
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();
}

function resolverPenal(zona) {
  const zonas = ["Izquierda", "Centro", "Derecha"];
  const arquero = zonas[Math.floor(Math.random() * 3)];
  const resDiv = document.getElementById("resultadoDominios");
  if (zona !== arquero) {
    resDiv.className = "text-success fw-bold fs-5 mt-2";
    resDiv.innerText = "⚽ ¡GOOOL a la " + zona + "! El arquero se tiró a la " + arquero + ".";
    sonidoGol();
  } else {
    resDiv.className = "text-danger fw-bold fs-5 mt-2";
    resDiv.innerText = "🧤 ¡ATAJÓ! Se tiró a la " + arquero + ".";
    sonidoError();
  }
  document.querySelectorAll("#modalDominios .modal-body button").forEach(function(b) { b.disabled = true; });
  jugador.minijuegosUsadosEstaTemporada = 1;
  guardarPartida();
  setTimeout(function() { modalDominiosInstance.hide(); actualizarInterfaz(); }, CONFIG.TIMING.RESULTADO_MINIJUEGO_MS);
}

// ------------------------------------------------------------
//  MULTIPLES FINALES
// ------------------------------------------------------------
function determinarFinal() {
  const titulosMayores = (jugador.trofeos.primeraDivision || 0) + (jugador.trofeos.copaDeCampeones || 0);
  if (jugador.media >= 90 && titulosMayores >= 3) return FINALES.find(function(f) { return f.id === "leyenda"; });
  if (jugador.media >= 85 && titulosMayores >= 1) return FINALES.find(function(f) { return f.id === "estrella"; });
  if (jugador.media >= 70) return FINALES.find(function(f) { return f.id === "profesional"; });
  if (jugador.media >= 60) return FINALES.find(function(f) { return f.id === "promesa"; });
  return FINALES.find(function(f) { return f.id === "olvidado"; });
}

function mostrarFinal() {
  const f = determinarFinal();
  jugador.finalCarrera = f.id;
  const el = document.getElementById("resumen-final");
  if (el) {
    el.innerHTML = "<h3 style='color:" + f.color + "'>" + f.emoji + " " + f.nombre + "</h3><p class='text-secondary'>" + f.desc + "</p>";
  }
  return f;
}

// ------------------------------------------------------------
//  MODO DESAFÍO: un solo club para siempre, ganarle 5 títulos
// ------------------------------------------------------------
function elegirClubDesafio() {
  // Solo clubs con reputación menor a 8 (no aparecen 8/10 para arriba).
  // Más chances para los de menor reputación (peso inverso a la reputación).
  const candidatos = CLUBES.filter(c => c.reputacion < 8);
  const bolsas = [];
  candidatos.forEach(function(c) {
    // rep 2 -> peso 6, rep 7 -> peso 1  =>  los más chicos salen más
    const peso = 9 - c.reputacion;
    for (let i = 0; i < peso; i++) bolsas.push(c);
  });
  return bolsas[Math.floor(Math.random() * bolsas.length)];
}

function activarModoDesafio() {
  jugador.modoDesafio = true;
  jugador.desafioCompletado = false;
  const club = elegirClubDesafio();
  jugador.clubActual = club;
  jugador.rolAnterior = obtenerRol(jugador.media);
  guardarPartida();
  mostrarNotificacion(
    "🎲 ¡Modo Desafío Iniciado!",
    "Te tocó <strong style='color:#ffd43b;'>" + club.nombre + "</strong> (reputación " + club.reputacion + "/10).<br><br>" +
    "Estás <strong>fichado ahí para siempre</strong>: no hay mercado de fichajes, solo simulás temporadas.<br><br>" +
    "<strong>🎯 Objetivo: ganarle 5 títulos al club.</strong>"
  );
}

function titulosTotalesDesafio() {
  const t = jugador.trofeos || {};
  return (t.primeraDivision || 0) + (t.segundaDivision || 0) +
         (t.copaDeCampeones || 0) + (t.copaArgentina || 0) + (t.copaApa || 0);
}

function chequearModoDesafio() {
  if (!jugador.modoDesafio || jugador.desafioCompletado) return;
  if (titulosTotalesDesafio() >= 5) {
    jugador.desafioCompletado = true;
    guardarPartida();
    lanzarConfeti(120);
    mostrarNotificacion(
      "🏆 ¡MODO DESAFÍO COMPLETADO!",
      "Le ganaste <strong>5 títulos</strong> a " + (jugador.clubActual ? jugador.clubActual.nombre : "tu club") +
      ".<br><br>Sos una leyenda del club. 🎉"
    );
  }
}

// ------------------------------------------------------------
// REDES SOCIALES: jugadores precargados
// ------------------------------------------------------------
function asegurarEstadoRedes() {
  if (!jugador.redesSociales) jugador.redesSociales = {};
  if (!Array.isArray(jugador.redesSociales.feed)) jugador.redesSociales.feed = [];
  if (!jugador.redesSociales.rivalidades || typeof jugador.redesSociales.rivalidades !== "object") jugador.redesSociales.rivalidades = {};
  if (!Object.prototype.hasOwnProperty.call(jugador.redesSociales, "cadenaActual")) jugador.redesSociales.cadenaActual = null;
  return jugador.redesSociales;
}

function escRed(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function totalTitulosRed() {
  const t = jugador.trofeos || {};
  return (t.primeraDivision || 0) + (t.segundaDivision || 0) +
    (t.copaDeCampeones || 0) + (t.copaArgentina || 0) + (t.copaApa || 0);
}

function rachaRed() {
  const h = jugador.historialTemporadas || [];
  let racha = 0;
  for (let i = h.length - 1; i >= 0; i--) {
    const t = h[i];
    if ((t.goles || 0) + (t.asistencias || 0) > 0 || t.trofeos !== "Ninguno") racha++;
    else break;
  }
  return racha;
}

function jugadorRedAleatorio(excluir) {
  const nombres = Object.keys(PERSONAJES_REDES).filter(function(nombre) { return nombre !== excluir; });
  return nombres[Math.floor(Math.random() * nombres.length)] || "Caseros";
}

function rivalRedActual() {
  const club = jugador.clubActual;
  if (!club) return CLUBES[0];
  const rivalidad = (typeof RIVALIDADES !== "undefined" ? RIVALIDADES : []).filter(function(r) {
    if (r.clubA !== club.nombre && r.clubB !== club.nombre) return false;
    const nombreRival = r.clubA === club.nombre ? r.clubB : r.clubA;
    return CLUBES.some(function(c) { return c.nombre === nombreRival; });
  }).sort(function(a, b) { return b.fuerza - a.fuerza; })[0];
  if (rivalidad) {
    const nombre = rivalidad.clubA === club.nombre ? rivalidad.clubB : rivalidad.clubA;
    return CLUBES.find(function(c) { return c.nombre === nombre; }) || club;
  }
  return CLUBES.filter(function(c) {
    return c.nombre !== club.nombre && Math.abs((c.reputacion || 0) - (club.reputacion || 0)) <= 1;
  })[0] || CLUBES.find(function(c) { return c.nombre !== club.nombre; }) || club;
}

function claveRivalidadRed(clubA, clubB) {
  return [clubA || "", clubB || ""].sort().join("|");
}

function registrarRivalidadRed(clubA, clubB, intensidad) {
  if (!clubA || !clubB || clubA === clubB) return 0;
  const redes = asegurarEstadoRedes();
  const clave = claveRivalidadRed(clubA, clubB);
  redes.rivalidades[clave] = Math.min(10, (redes.rivalidades[clave] || 0) + (intensidad || 1));
  return redes.rivalidades[clave];
}

function contextoRedSocial(momento, rival) {
  const ultima = jugador.historialTemporadas && jugador.historialTemporadas[jugador.historialTemporadas.length - 1];
  const anterior = jugador.historialTemporadas && jugador.historialTemporadas[jugador.historialTemporadas.length - 2];
  const cambio = anterior && ultima && anterior.club !== ultima.club;
  const titulos = ultima && ultima.trofeos !== "Ninguno" ? ultima.trofeos : "sin títulos";
  const produccion = ultima ? ((ultima.goles || 0) + " goles y " + (ultima.asistencias || 0) + " asistencias") : "todavía sin estadísticas";
  const rivalidad = rival ? asegurarEstadoRedes().rivalidades[claveRivalidadRed(jugador.clubActual && jugador.clubActual.nombre, rival.nombre)] || 0 : 0;
  return {
    momento: momento,
    club: jugador.clubActual ? jugador.clubActual.nombre : "su club",
    rival: rival ? rival.nombre : "el rival",
    resultado: ultima && ultima.trofeos !== "Ninguno" ? "ganó " + ultima.trofeos : (ultima ? "cerró la temporada sin títulos" : "se prepara para debutar"),
    competicion: ultima && ultima.club && ultima.club.indexOf("Primera") !== -1 ? "Primera División" : "la temporada",
    rendimiento: produccion,
    titulos: totalTitulosRed(),
    racha: rachaRed(),
    fichaje: cambio ? "llegó desde " + anterior.club : "sigue en " + (jugador.clubActual ? jugador.clubActual.nombre : "su club"),
    rivalidad: rivalidad
  };
}

function textoDeclaracionRed(autor, estilo, contexto, sobreUsuario) {
  const sujeto = sobreUsuario ? jugador.nombre : "el equipo";
  const pt = typeof prefs !== "undefined" && prefs.idioma === "pt";
  if (pt) {
    if (contexto.momento === "antes") {
      if (estilo === "muy_picante") return "No " + contexto.club + ". falam de " + sujeto + ", mas contra " + contexto.rival + " veremos quem aguenta a pressão. Promessa não ganha jogo.";
      if (estilo === "picante") return "Estamos prontos para " + contexto.rival + ". " + sujeto + " vem bem, mas a partida vai mostrar a verdade.";
      return "Vem aí uma partida importante entre " + contexto.club + " e " + contexto.rival + ". O grupo confia em " + sujeto + ".";
    }
    if (estilo === "muy_picante") return "Vencemos " + contexto.rival + " e " + sujeto + " terminou com " + contexto.rendimiento + ". " + contexto.fichaje + ". Já somamos " + contexto.titulos + " títulos.";
    if (estilo === "picante") return "Depois de " + contexto.resultado + " em " + contexto.competicion + ", " + sujeto + " tem " + contexto.rendimiento + ". " + contexto.fichaje + ". Alguns ainda continuam falando.";
    return "Temporada encerrada: " + sujeto + " contribuiu com " + contexto.rendimiento + ", e " + contexto.resultado + ". " + contexto.fichaje + ". A sequência positiva está em " + contexto.racha + ".";
  }
  if (contexto.momento === "antes") {
    if (estilo === "muy_picante") return "En " + contexto.club + " hablan de " + sujeto + ", pero contra " + contexto.rival + " se ve quién aguanta la presión. No se gana con promesas.";
    if (estilo === "picante") return "Estamos listos para " + contexto.rival + ". " + sujeto + " viene bien, aunque el partido va a decir toda la verdad.";
    return "Se viene un partido importante entre " + contexto.club + " y " + contexto.rival + ". Hay confianza en el grupo y en " + sujeto + ".";
  }
  if (estilo === "muy_picante") return "Ganamos contra " + contexto.rival + " y " + sujeto + " terminó con " + contexto.rendimiento + ". " + contexto.fichaje + ". Que miren la tabla: ya sumamos " + contexto.titulos + " títulos.";
  if (estilo === "picante") return "Después de " + contexto.resultado + " en " + contexto.competicion + ", " + sujeto + " lleva " + contexto.rendimiento + ". " + contexto.fichaje + ". Algunos todavía siguen hablando.";
  return "Temporada cerrada: " + sujeto + " aportó " + contexto.rendimiento + ", con " + contexto.resultado + ". " + contexto.fichaje + ". La racha positiva queda en " + contexto.racha + ".";
}

function viralidadRed(estilo, contexto, esRespuesta) {
  let valor = estilo === "muy_picante" ? 78 : estilo === "picante" ? 52 : 28;
  if (contexto.momento === "despues") valor += 8;
  if (contexto.rivalidad >= 3) valor += 10;
  if (contexto.titulos > 0) valor += 5;
  if (contexto.racha >= 2) valor += 6;
  if (contexto.rendimiento.indexOf("0 goles") === -1) valor += 5;
  if (esRespuesta) valor += 9;
  return Math.min(99, valor + Math.floor(Math.random() * 8));
}

function publicarRedSocial(autor, estilo, momento, contexto, sobreUsuario, respuestaA) {
  const redes = asegurarEstadoRedes();
  const post = {
    id: "red-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
    temporada: jugador.temporadaActual,
    momento: momento,
    autor: autor,
    estilo: estilo,
    texto: textoDeclaracionRed(autor, estilo, contexto, sobreUsuario),
    viralidad: viralidadRed(estilo, contexto, !!respuestaA),
    contexto: contexto,
    respuestaA: respuestaA || null,
    respuestas: []
  };
  redes.feed.push(post);
  if (estilo !== "normal") {
    contexto.rivalidad = registrarRivalidadRed(contexto.club, contexto.rival, estilo === "muy_picante" ? 2 : 1);
  }
  return post;
}

function generarRespuestaRedSocial(post, contexto) {
  if (!post || post.respuestas.length >= CONFIG.REDES.MAX_RESPUESTAS) return null;
  const autor = jugadorRedAleatorio(post.autor);
  const estilo = obtenerPersonalidadRed(autor).estilo;
  const pt = typeof prefs !== "undefined" && prefs.idioma === "pt";
  const texto = pt
    ? (estilo === "muy_picante"
      ? "Li o que " + post.autor + " disse: \"" + String(post.texto || "essa declaração").slice(0, 54) + "...\". Se quiser responder, faça isso depois de jogar contra " + contexto.rival + "."
      : estilo === "picante"
        ? "Vamos baixar a bola, " + post.autor + ": eu vi sua declaração anterior e os resultados de " + contexto.competicion + " falam por si."
        : "Li a declaração anterior. Todos podem opinar, mas primeiro é preciso jogar e respeitar o adversário.")
    : estilo === "muy_picante"
    ? "Leí lo de " + post.autor + ": \"" + String(post.texto || "esa declaración").slice(0, 54) + "...\". Si quiere responder, que lo haga después de jugar contra " + contexto.rival + "."
    : estilo === "picante"
      ? "Bajemos un cambio, " + post.autor + ": vi su declaración anterior y los resultados de " + contexto.competicion + " hablan solos."
      : "Leí la declaración anterior. Cada uno puede opinar, pero primero hay que jugar y respetar al rival.";
  const respuesta = {
    id: "red-res-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
    autor: autor,
    estilo: estilo,
    texto: texto,
    viralidad: viralidadRed(estilo, contexto, true),
    respuestaA: post.id
  };
  post.respuestas.push(respuesta);
  if (post.respuestas.length < CONFIG.REDES.MAX_RESPUESTAS && respuesta.viralidad >= 65 && Math.random() < 0.55) {
    generarRespuestaRedSocial({ autor: autor, respuestas: post.respuestas }, contexto);
  }
  return respuesta;
}

function generarRedesAntesPartido() {
  if (Math.random() >= CONFIG.REDES.PROB_DECLARACION) return [];
  const rival = rivalRedActual();
  const contexto = contextoRedSocial("antes", rival);
  const autor = jugadorRedAleatorio();
  const post = publicarRedSocial(autor, obtenerPersonalidadRed(autor).estilo, "antes", contexto, true, null);
  if (post.estilo !== "normal" && Math.random() < CONFIG.REDES.PROB_RESPUESTA) generarRespuestaRedSocial(post, contexto);
  asegurarEstadoRedes().cadenaActual = post.id;
  return [post];
}

function generarRedesDespuesPartido() {
  const rival = rivalRedActual();
  const contexto = contextoRedSocial("despues", rival);
  const creados = [];
  if (Math.random() < CONFIG.REDES.PROB_DECLARACION) {
    const autor = jugadorRedAleatorio();
    const post = publicarRedSocial(autor, obtenerPersonalidadRed(autor).estilo, "despues", contexto, true, asegurarEstadoRedes().cadenaActual);
    creados.push(post);
    if (post.estilo !== "normal" && Math.random() < CONFIG.REDES.PROB_RESPUESTA) generarRespuestaRedSocial(post, contexto);
  }
  asegurarEstadoRedes().cadenaActual = creados[0] ? creados[0].id : null;
  return creados;
}

function renderizarFeedRedes() {
  asegurarEstadoRedes();
  const contenedores = [document.getElementById("redes-feed"), document.getElementById("redes-feed-lateral")].filter(Boolean);
  if (!contenedores.length) return;
  const posts = jugador.redesSociales.feed.slice(-3).reverse();
  if (!posts.length) {
    const vacio = "<div class='vacio'><div class='vacio-icono' aria-hidden='true'><svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V4'/><path d='M18 14h-8M15 18h-5M10 6h8v4h-8z'/></svg></div><div class='vacio-titulo'>" + t("sinNoticiasTitulo") + "</div><div class='vacio-texto'>" + t("sinNoticiasTexto") + "</div><button type='button' class='btn btn-outline-danger btn-sm fw-bold' onclick='mostrarRedesSociales()'>" + t("redesTitulo") + "</button></div>";
    contenedores.forEach(function(cont) { cont.innerHTML = vacio; });
    return;
  }
  const html = posts.map(function(post) {
    const respuestas = (post.respuestas || []).map(function(res) {
      return "<div class='border-start border-warning ps-2 mt-2 small'><strong>" + escRed(res.autor) + "</strong> <span class='text-secondary'>" + escRed(t("redesResponde")) + "</span><br>" + escRed(res.texto) + "<br><span class='text-danger'>🔥 " + res.viralidad + " " + escRed(t("viralidad")) + "</span></div>";
    }).join("");
    return "<article class='red-social-post border rounded p-2 mb-2'><div class='d-flex justify-content-between gap-2'><strong>@" + escRed(post.autor) + "</strong><span class='badge text-bg-" + (post.estilo === "muy_picante" ? "danger" : post.estilo === "picante" ? "warning" : "secondary") + "'>" + escRed(post.estilo) + "</span></div><div class='small text-secondary'>" + post.temporada + " · " + escRed(post.momento) + " · " + escRed(post.contexto.club) + " vs " + escRed(post.contexto.rival) + "</div><p class='mb-1 mt-1'>" + escRed(post.texto) + "</p><span class='small text-danger'>🔥 " + post.viralidad + " " + escRed(t("viralidad")) + "</span>" + respuestas + "</article>";
  }).join("");
  contenedores.forEach(function(cont) { cont.innerHTML = html; });
}

function mostrarRedesSociales() {
  renderizarFeedRedes();
  const modal = document.getElementById("modalRedesSociales");
  if (modal && typeof bootstrap !== "undefined") bootstrap.Modal.getOrCreateInstance(modal).show();
}

// ------------------------------------------------------------
//  WRAPPERS: extender funciones de app.js sin romperlas
// ------------------------------------------------------------

const _finalizarCarreraBase = finalizarCarrera;
finalizarCarrera = function() {
  _finalizarCarreraBase();
  chequearLogros();
  guardarEnRanking();
  const f = mostrarFinal();
  if (f && (f.id === "leyenda" || f.id === "estrella")) lanzarConfeti(80);
  if (jugador.modoDesafio) chequearModoDesafio();
};

// ------------------------------------------------------------
//  FIX V2: estados residuales de minijuegos
//  Los minijuegos usan listeners globales y variables de estado.
//  Si el flujo se interrumpe, al iniciar/continuar una partida
//  pueden quedar "activados". Esta funcion limpia TODO al arrancar.
// ------------------------------------------------------------
function limpiarEstadosMinijuegos() {
  regateEstado = null;
  paseEstado = null;
  if (typeof peleaEstado !== "undefined") peleaEstado = null;
  escuchandoTeclado = false;
  if (typeof timerDominios !== "undefined" && timerDominios) {
    clearInterval(timerDominios);
    timerDominios = null;
  }
  try {
    if (typeof modalDominiosInstance !== "undefined" && modalDominiosInstance) modalDominiosInstance.hide();
  } catch (e) { /* el modal puede no estar abierto */ }
}

const _iniciarCarreraBase = iniciarCarrera;
iniciarCarrera = function() {
  limpiarEstadosMinijuegos();
  if (!modoDesafioPendiente) { _iniciarCarreraBase(); return; }
  // Modo Desafío: reemplaza la asignación de club aleatoria por el sorteo ponderado
  const nombreInput = document.getElementById("input-nombre").value.trim();
  if (!nombreInput) {
    mostrarNotificacion("Atención", "Por favor, ingresa el nombre de tu jugador.");
    return;
  }
  jugador = crearJugadorInicial();
  jugador.nombre = nombreInput;
  jugador.posicion = document.getElementById("select-posicion").value;
  document.getElementById("pantalla-inicio").classList.add("hidden");
  document.getElementById("pantalla-juego").classList.remove("hidden");
  ocultarPanelCuenta();
  activarModoDesafio();
  prepararSiguienteEvento();
  actualizarInterfaz();
  // Resetear el botón del modo desafío
  modoDesafioPendiente = false;
  const btnSeed = document.getElementById("btn-modo-desafio");
  if (btnSeed) {
    btnSeed.classList.remove("btn-warning");
    btnSeed.classList.add("btn-outline-secondary");
    btnSeed.innerText = "🎲 Modo Desafío";
  }
};

// FIX V2: también limpiar estados al continuar una partida guardada.
const _continuarCarreraBase = continuarCarrera;
continuarCarrera = function() {
  limpiarEstadosMinijuegos();
  _continuarCarreraBase();
};

function cargarSlotDesdePanelConLimpieza(n) {
  limpiarEstadosMinijuegos();
  cargarSlotDesdePanel(n);
}

const _generarOfertasBase = generarOfertasDeFichaje;
generarOfertasDeFichaje = function(ascendioPorTitulo) {
  if (jugador.modoDesafio && !jugador.carreraTerminada) {
    // Sin mercado: seguis en el mismo club para siempre. Se avanza directo a la próxima temporada.
    modalFichajes.hide();
    jugador.temporadaActual++;
    verificarCondicionLoro();
    recuperarRangoNittox();
    prepararSiguienteEvento();
    actualizarInterfaz();
    guardarPartida();
    return;
  }
  _generarOfertasBase(ascendioPorTitulo);
  if (Math.random() < CONFIG.PROB_PUJA_RIVAL && ofertasActuales.length > 0) {
    const contenedor = document.getElementById("contenedor-ofertas");
    if (!contenedor) return;
    const rival = CLUBES[Math.floor(Math.random() * CLUBES.length)];
    const div = document.createElement("div");
    div.className = "alert alert-info p-2 small mt-2 mb-0";
    div.innerHTML = "📣 <strong>" + rival.nombre + "</strong> mostró interés en vos.";
    contenedor.appendChild(div);
  }
};

const _simularTemporadaBase = simularTemporada;
simularTemporada = function() {
  generarRedesAntesPartido();
  const mediaOriginal = jugador.media;
  const ajusteMoral = Math.round((jugador.moral - 50) * CONFIG.MORAL_EFECTO * 0.2);
  const mediaConBonus = clampMedia(mediaOriginal + ajusteMoral);

  // El bonus de moral es temporal: se aplica a los atributos durante la
  // simulación (manteniendo OVR == media) y se revierte al final.
  const hayProgresion = typeof window !== "undefined"
    && typeof window.aplicarCambioMediaOculto === "function"
    && typeof window.calcularOVR === "function"
    && !!jugador.atributos;
  if (hayProgresion) {
    window.aplicarCambioMediaOculto(jugador.atributos, jugador.posicion, mediaConBonus - jugador.media);
    jugador.media = window.calcularOVR(jugador.atributos, jugador.posicion);
  } else {
    jugador.media = mediaConBonus;
  }

  _simularTemporadaBase();

  // Preservar el delta real de la simulación y quitar el bonus temporal de moral
  const deltaBase = jugador.media - mediaConBonus;
  const mediaFinal = clampMedia(mediaOriginal + deltaBase);
  if (hayProgresion) {
    const actual = window.calcularOVR(jugador.atributos, jugador.posicion);
    window.aplicarCambioMediaOculto(jugador.atributos, jugador.posicion, mediaFinal - actual);
    jugador.media = clampMedia(window.calcularOVR(jugador.atributos, jugador.posicion));
  } else {
    jugador.media = mediaFinal;
  }

  const ultima = jugador.historialTemporadas[jugador.historialTemporadas.length - 1];
  if (ultima) ultima.media = jugador.media;

  ajustarMoral(5);
  guardarPartida();
  chequearLogros();
  chequearModoDesafio();
};

const _actualizarInterfazBase = actualizarInterfaz;
actualizarInterfaz = function() {
  _actualizarInterfazBase();
  renderizarFeedRedes();
  const em = document.getElementById("j-moral");
  if (em) {
    const est = estadoMoral();
    em.innerHTML = "<span class='" + est.color + " fw-bold'>" + est.txt + "</span>";
  }
};

const _mostrarModalRolBase = mostrarModalRol;
mostrarModalRol = function(rol) {
  _mostrarModalRolBase(rol);
  if (rol.nombre === "Master" || rol.nombre === "Inmortal") lanzarConfeti(50);
  const ovrEl = document.getElementById("rolModalOVR");
  if (ovrEl) animarOVR(Math.max(40, jugador.media - 5), jugador.media, ovrEl);
};

// ------------------------------------------------------------
//  INICIALIZACION DE FEATURES
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  aplicarModoOscuro();
  traducirInterfaz();

  const btnSeed = document.getElementById("btn-modo-desafio");
  if (btnSeed) {
    btnSeed.addEventListener("click", function() {
      modoDesafioPendiente = !modoDesafioPendiente;
      btnSeed.classList.toggle("btn-warning", modoDesafioPendiente);
      btnSeed.classList.toggle("btn-outline-secondary", !modoDesafioPendiente);
      btnSeed.innerText = modoDesafioPendiente ? "🎲 Modo Desafío: ACTIVADO" : "🎲 Modo Desafío";
      if (modoDesafioPendiente) {
        mostrarNotificacion(
          "🎲 Modo Desafío",
          "Al iniciar la carrera te va a tocar un club de <strong>reputación baja (menos de 8/10)</strong>, con más chances para los más chicos.<br><br>" +
          "Vas a estar <strong>fichado ahí para siempre</strong>: sin mercado de fichajes, solo simulando temporadas.<br><br>" +
          "<strong>Objetivo: ganarle 5 títulos a ese club.</strong>"
        );
      }
    });
  }

  const btnDark = document.getElementById("btn-modo-oscuro");
  if (btnDark) btnDark.addEventListener("click", toggleModoOscuro);

  const selIdioma = document.getElementById("select-idioma");
  if (selIdioma) {
    selIdioma.value = prefs.idioma;
    selIdioma.addEventListener("change", function(e) { cambiarIdioma(e.target.value); });
  }

  const btnRanking = document.getElementById("btn-ranking");
  if (btnRanking) btnRanking.addEventListener("click", mostrarRanking);
});
