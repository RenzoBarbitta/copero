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
  const inp = document.getElementById("input-nombre");
  if (inp) inp.setAttribute("placeholder", t("placeholderNombre"));
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
  let html = "<h6 class='mb-3'>🏅 Logros</h6><div class='row g-2'>";
  LOGROS.forEach(function(l) {
    const ok = desbloqueados.indexOf(l.id) !== -1;
    html += "<div class='col-6 col-md-4'><div class='border rounded p-2 text-center h-100 " +
      (ok ? "border-warning" : "border-secondary opacity-50") + "'>" +
      "<div style='font-size:1.5rem'>" + l.emoji + "</div>" +
      "<div class='fw-bold small'" + (ok ? " style='text-decoration:line-through;'" : "") + ">" + l.nombre + "</div>" +
      "<div class='text-secondary' style='font-size:0.72rem'>" + l.desc + "</div>" +
      (ok ? "<div class='small text-success fw-bold'>✅ Completado</div>" : "<div class='small text-secondary'>⬜ Pendiente</div>") +
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
      "<button class='btn btn-outline-success' " + (ocupado ? "" : "disabled") + " onclick='cargarSlotDesdePanel(" + i + ")'>Cargar</button>" +
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
    ranking.push({ nombre: jugador.nombre, media: jugador.media, titulos: titulos, anio: new Date().getFullYear() });
    ranking.sort(function(a, b) { return b.media - a.media; });
    ranking = ranking.slice(0, 10);
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
  } catch (e) {}
}

function mostrarRanking() {
  let ranking = [];
  try { ranking = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]"); } catch (e) {}
  if (ranking.length === 0) { mostrarNotificacion("Ranking", "Todavía no hay carreras registradas."); return; }
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
  const botones = [
    { nombre: "Regate en Zigzag", emoji: "🏃", fn: "iniciarMinijuegoRegate()" },
    { nombre: "Pase Filtrado",    emoji: "🎯", fn: "iniciarMinijuegoPase()" },
    { nombre: "Chilena",          emoji: "🤸", fn: "iniciarMinijuegoChilena()" },
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
//  MINIJUEGO: CHILENA (2 taps sincronizados)
// ------------------------------------------------------------
function iniciarMinijuegoChilena() {
  if (!puedeJugarMinijuegoExtra()) return;
  document.getElementById("modalDominiosTitulo").innerText = "🤸 Chilena";
  document.getElementById("secuenciaObjetivo").innerText = "¡Presioná CLIC 2 veces rápido para conectar la chilena!";
  document.getElementById("resultadoDominios").innerHTML = "<div id='chilenaContador' class='fs-3 fw-bold text-primary'>0 / " + CONFIG.CHILENA.TAPS + "</div>";
  document.getElementById("tiempoDominiosRow").style.display = "none";
  modalDominiosInstance.show();

  let taps = 0;
  let ultimoTap = 0;

  const manejar = function(e) {
    if (e.type === "keydown" && e.code !== "Space") return;
    const now = performance.now();
    if (taps > 0 && (now - ultimoTap) > CONFIG.CHILENA.VENTANA_MS) taps = 0;
    taps++;
    ultimoTap = now;
    const cont = document.getElementById("chilenaContador");
    if (cont) cont.innerText = taps + " / " + CONFIG.CHILENA.TAPS;
    if (taps >= CONFIG.CHILENA.TAPS) {
      window.removeEventListener("keydown", manejar);
      window.removeEventListener("click", manejar);
      finalizarChilena(true);
    }
  };
  window.addEventListener("keydown", manejar);
  window.addEventListener("click", manejar);

  setTimeout(function() {
    window.removeEventListener("keydown", manejar);
    window.removeEventListener("click", manejar);
    if (taps < CONFIG.CHILENA.TAPS) finalizarChilena(false);
  }, CONFIG.CHILENA.VENTANA_MS * 2);
}

function finalizarChilena(exito) {
  const resDiv = document.getElementById("resultadoDominios");
  if (exito) {
    resDiv.className = "text-success fw-bold fs-5 mt-2";
    resDiv.innerText = "🤸 ¡CHILENA ESPECTACULAR! (+" + CONFIG.CHILENA.SUBIDA_OVR + " OVR)";
    sumarMedia(CONFIG.CHILENA.SUBIDA_OVR);
    sonidoGol();
  } else {
    resDiv.className = "text-danger fw-bold fs-5 mt-2";
    resDiv.innerText = "❌ No llegaste a la pelota.";
    sonidoError();
  }
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
  document.getElementById("secuenciaObjetivo").innerText = "El arquero espera... ¿Qué hacés?";
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

const _iniciarCarreraBase = iniciarCarrera;
iniciarCarrera = function() {
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

const _generarOfertasBase = generarOfertasDeFichaje;
generarOfertasDeFichaje = function(ascendioPorTitulo) {
  if (jugador.modoDesafio && !jugador.carreraTerminada) {
    // Sin mercado: seguis en el mismo club para siempre. Se avanza directo a la próxima temporada.
    modalFichajes.hide();
    jugador.temporadaActual++;
    verificarCondicionLoro();
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
  const mediaOriginal = jugador.media;
  const ajusteMoral = Math.round((jugador.moral - 50) * CONFIG.MORAL_EFECTO * 0.2);
  const mediaConBonus = clampMedia(mediaOriginal + ajusteMoral);
  jugador.media = mediaConBonus;

  _simularTemporadaBase();

  // Preservar el delta real de la simulación y quitar el bonus temporal de moral
  const deltaBase = jugador.media - mediaConBonus;
  jugador.media = clampMedia(mediaOriginal + deltaBase);

  const ultima = jugador.historialTemporadas[jugador.historialTemporadas.length - 1];
  if (ultima) ultima.media = jugador.media;

  ajustarMoral(5);
  chequearLogros();
  chequearModoDesafio();
};

const _actualizarInterfazBase = actualizarInterfaz;
actualizarInterfaz = function() {
  _actualizarInterfazBase();
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