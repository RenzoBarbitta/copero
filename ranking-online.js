// ============================================================
//  RANKING ONLINE - ranking-online.js
//  Hace que el ranking funcione ONLINE entre todos los
//  dispositivos (telefonos y PC) sin necesidad de servidor
//  propio: usa un almacenamiento JSON gratuito en la nube.
//
//  COMO FUNCIONA:
//   - Al terminar una carrera se envia el resultado (nombre,
//     media, titulos, club, etc.) al almacenamiento online.
//   - Si no hay internet, queda en cola y se reintenta solo
//     cuando vuelve la conexion.
//   - El boton 🏆 Ranking muestra dos pestañas: 🌍 Global
//     (ranking online de todos) y 📱 Este dispositivo
//     (el ranking local de siempre).
//   - Hay UN registro por dispositivo: tu ultima carrera
//     terminada reemplaza a la anterior.
//
//  MIGRAR A FIREBASE (opcional, mas robusto):
//   1. Crear un proyecto gratis en firebase.google.com y una
//      Realtime Database en modo de prueba.
//   2. Completar RANKING_FIREBASE_URL con la URL terminada en
//      .json (ver README-MOVIL.md). Si queda vacio se usa
//      textdb.dev.
//
//  Se carga DESPUES de features.js
// ============================================================

// ------------------- CONFIGURACION -------------------

// Almacenamiento online por defecto (JSON en la nube, CORS abierto)
const RANKING_ALMACEN_URL = "https://textdb.dev/api/data/4777662b-82ad-481a-b548-4c999ebcddbc";

// Opcional: Firebase Realtime Database (URL terminada en .json)
// Ejemplo: "https://mi-pso-default-rtdb.firebaseio.com/ranking.json"
const RANKING_FIREBASE_URL = "";

const RANKING_DEV_KEY = "pso_ranking_dev";
const RANKING_OUTBOX_KEY = "pso_ranking_outbox";
const RANKING_SYNC_KEY = "pso_ranking_ultimo_sync";
const RANKING_CACHE_KEY = "pso_ranking_cache_online";
const RANKING_MAX = 100;
const RANKING_TIMEOUT_MS = 10000;
const RANKING_CACHE_MS = 60000;

let RANKING_ENVIANDO = false;
let _modalRankingBs = null;
let rankingAbierto = false;
let rankingTimer = null;
let rankingCarga = null;
let rankingUltimaLectura = 0;
let rankingErrorLectura = false;
const RANKING_REFRESH_MS = 10000;

// ------------------- UTILIDADES -------------------

// Traduccion con respaldo: usa t() de features.js si existe
function tRanking(clave, fallback) {
  try {
    if (typeof t === "function") {
      const valor = t(clave);
      if (valor && valor !== clave) return valor;
    }
  } catch (e) { /* ignorar */ }
  return fallback;
}

// Escapa texto del usuario (nombres) para evitar XSS al renderizar
function escaparHtml(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generarIdRanking() {
  try {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) { /* ignorar */ }
  return "id-" + Date.now() + "-" + Math.floor(Math.random() * 1e9);
}

function idDispositivo() {
  let id = null;
  try { id = localStorage.getItem(RANKING_DEV_KEY); } catch (e) { /* ignorar */ }
  if (!id) {
    id = generarIdRanking();
    try { localStorage.setItem(RANKING_DEV_KEY, id); } catch (e) { /* ignorar */ }
  }
  return id;
}

function leerJSONLS(clave, defecto) {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : defecto;
  } catch (e) { return defecto; }
}

function escribirJSONLS(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* ignorar */ }
}

function usarFirebase() { return !!RANKING_FIREBASE_URL; }
function urlLectura() { return usarFirebase() ? RANKING_FIREBASE_URL : RANKING_ALMACEN_URL; }
function urlEscritura() { return usarFirebase() ? RANKING_FIREBASE_URL : RANKING_ALMACEN_URL; }

async function fetchConTimeout(url, opciones) {
  const controlador = new AbortController();
  const timer = setTimeout(function() { controlador.abort(); }, RANKING_TIMEOUT_MS);
  try {
    return await fetch(url, Object.assign({}, opciones || {}, { signal: controlador.signal }));
  } finally {
    clearTimeout(timer);
  }
}

// ------------------- REGISTRO -------------------

// Arma el registro que se manda al ranking online
function construirRegistroRanking(jug) {
  const trofeos = jug.trofeos || {};
  const titulos = (trofeos.primeraDivision || 0) + (trofeos.segundaDivision || 0) +
                  (trofeos.copaDeCampeones || 0) + (trofeos.copaArgentina || 0) +
                  (trofeos.copaApa || 0);
  return {
    id: jug.rankingId || generarIdRanking(),
    dev: idDispositivo(),
    nombre: String(jug.nombre || "Anonimo").trim().slice(0, 30),
    posicion: jug.posicion || "",
    club: (jug.clubActual && jug.clubActual.nombre) ? String(jug.clubActual.nombre) : "",
    media: jug.media || 0,
    titulos: titulos,
    anio: new Date().getFullYear(),
    ts: Date.now()
  };
}

// Puro: mezcla el registro nuevo en la lista de la nube.
// - Reemplaza el registro del mismo dispositivo (tu ultima carrera).
// - Ordena por media descendente y limita a RANKING_MAX.
function mezclarRanking(lista, registro) {
  const base = Array.isArray(lista) ? lista.filter(function(r) { return !!r; }) : [];
  const filtrada = base.filter(function(r) {
    return r.id !== registro.id && r.dev !== registro.dev;
  });
  filtrada.push(registro);
  filtrada.sort(function(a, b) {
    const ma = a.media || 0, mb = b.media || 0;
    if (mb !== ma) return mb - ma;
    return (b.ts || 0) - (a.ts || 0);
  });
  return filtrada.slice(0, RANKING_MAX);
}

// ------------------- NUBE (lectura/escritura) -------------------

// Toma el texto crudo de la nube y devuelve la lista de registros
function normalizarDatosNube(texto) {
  if (!texto || !String(texto).trim()) return [];
  let datos;
  try { datos = JSON.parse(texto); } catch (e) { return []; }
  if (Array.isArray(datos)) return datos.filter(Boolean);
  if (datos && Array.isArray(datos.jugadores)) return datos.jugadores.filter(Boolean);
  return [];
}

async function leerAlmacen() {
  const res = await fetchConTimeout(urlLectura(), { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const texto = await res.text();
  return normalizarDatosNube(texto);
}

async function escribirAlmacen(lista) {
  // textdb guarda texto plano (el content-type text/plain evita el
  // preflight de CORS); Firebase guarda el array directamente.
  const cuerpo = usarFirebase() ? JSON.stringify(lista) : JSON.stringify({ jugadores: lista });
  // IMPORTANTE: textdb.dev rechaza "text/plain;charset=UTF-8" (500),
  // hay que mandar "text/plain" a secas (tambien evita preflight CORS).
  const opciones = usarFirebase()
    ? { method: "PUT", headers: { "Content-Type": "application/json" }, body: cuerpo }
    : { method: "POST", headers: { "Content-Type": "text/plain" }, body: cuerpo };
  const res = await fetchConTimeout(urlEscritura(), opciones);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return true;
}

// ------------------- COLA OFFLINE / SINCRONIZACION -------------------

function leerOutbox() { return leerJSONLS(RANKING_OUTBOX_KEY, null); }
function encolarRegistro(registro) { escribirJSONLS(RANKING_OUTBOX_KEY, registro); }
function borrarOutbox() {
  try { localStorage.removeItem(RANKING_OUTBOX_KEY); } catch (e) { /* ignorar */ }
}
function marcarSync() { escribirJSONLS(RANKING_SYNC_KEY, Date.now()); }
function leerCacheOnline() { return leerJSONLS(RANKING_CACHE_KEY, null); }
function guardarCacheOnline(lista) {
  escribirJSONLS(RANKING_CACHE_KEY, { ts: Date.now(), lista: (lista || []).slice(0, 50) });
}

// Intenta mandar el registro en cola a la nube. Si falla, queda
// guardado y se reintenta cuando vuelva internet.
async function vaciarOutbox() {
  if (RANKING_ENVIANDO) return false;
  const pendiente = leerOutbox();
  if (!pendiente) return false;
  RANKING_ENVIANDO = true;
  try {
    const listaActual = await leerAlmacen();
    const mezclada = mezclarRanking(listaActual, pendiente);
    await escribirAlmacen(mezclada);
    borrarOutbox();
    marcarSync();
    guardarCacheOnline(mezclada);
    return true;
  } catch (e) {
    return false; // queda en cola para reintentar
  } finally {
    RANKING_ENVIANDO = false;
  }
}

async function obtenerRankingOnline(forzar) {
  const cache = leerCacheOnline();
  if (!forzar && cache && cache.lista && (Date.now() - cache.ts) < RANKING_CACHE_MS) {
    return cache.lista;
  }
  const lista = await leerAlmacen();
  guardarCacheOnline(lista);
  return lista;
}

// Punto de entrada: se llama al terminar una carrera
function intentarEnviarRankingOnline() {
  try {
    if (typeof jugador === "undefined" || !jugador || !jugador.nombre) return;
    if (!jugador.rankingId) {
      jugador.rankingId = generarIdRanking();
      if (typeof guardarPartida === "function") guardarPartida();
    }
    encolarRegistro(construirRegistroRanking(jugador));
    vaciarOutbox(); // fire and forget: si falla queda en cola
  } catch (e) { /* silencio */ }
}

// ------------------- INTERFAZ (MODAL RANKING) -------------------

function instanciaModalRanking() {
  if (!_modalRankingBs) {
    const el = document.getElementById("modalRanking");
    _modalRankingBs = new bootstrap.Modal(el);
  }
  return _modalRankingBs;
}

function tablaRankingHtml(lista, esLocal) {
  const medallas = ["🥇", "🥈", "🥉"];
  const miDev = esLocal ? null : idDispositivo();
  let filas = "";
  (lista || []).forEach(function(r, i) {
    const propia = !esLocal && r.dev && r.dev === miDev;
    filas += "<tr class='" + (propia ? "ranking-fila-propia" : "") + "'>" +
      "<td class='fw-bold'>" + (i < 3 ? medallas[i] : (i + 1)) + "</td>" +
      "<td class='text-start'><div class='fw-bold'>" + escaparHtml(r.nombre) + "</div>" +
      (r.club ? "<div class='small text-secondary'>" + escaparHtml(r.club) + "</div>" : "") +
      "</td>" +
      "<td><span class='fw-bold text-primary'>" + (r.media || 0) + "</span></td>" +
      "<td>" + (r.titulos || 0) + "</td>" +
      "<td>" + (r.anio || "") + "</td>" +
      "</tr>";
  });
  return "<div class='table-responsive tabla-ranking-wrap'><table class='table table-sm table-hover align-middle text-center m-0 tabla-ranking'>" +
    "<thead class='table-dark'><tr>" +
    "<th>#</th>" +
    "<th class='text-start'>" + tRanking("rankColJugador", "Jugador") + "</th>" +
    "<th>" + tRanking("rankColMedia", "Media") + "</th>" +
    "<th>" + tRanking("rankColTitulos", "Títulos") + "</th>" +
    "<th>" + tRanking("rankColAnio", "Año") + "</th>" +
    "</tr></thead><tbody>" + filas + "</tbody></table></div>";
}

function renderizarRankingLocal() {
  const cont = document.getElementById("ranking-local-contenido");
  if (!cont) return;
  let ranking = [];
  try { ranking = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]"); } catch (e) { /* ignorar */ }
  if (!ranking.length) {
    cont.innerHTML = "<p class='text-secondary text-center my-4 mb-0'>" +
      tRanking("rankVacioLocal", "Todavía no hay carreras registradas en este dispositivo.") + "</p>";
    return;
  }
  cont.innerHTML = tablaRankingHtml(ranking, true);
}

function cargarRankingOnlineUI(forzar) {
  if (rankingCarga) return rankingCarga;
  const cont = document.getElementById("ranking-online-contenido");
  if (!cont) return Promise.resolve();
  const cache = leerCacheOnline();
  if (!rankingUltimaLectura && cache && Array.isArray(cache.lista) && cache.lista.length) {
    cont.innerHTML = tablaRankingHtml(cache.lista, false);
  }
  if (!cont.innerHTML.trim()) {
    cont.innerHTML = "<p class='text-center my-4'>" +
      tRanking("rankCargando", "Cargando ranking online...") + "</p>";
  }
  rankingCarga = (async function() {
    try {
      const lista = await obtenerRankingOnline(!!forzar);
      cont.innerHTML = lista.length
        ? tablaRankingHtml(lista, false)
        : "<p class='text-secondary text-center my-4 mb-0'>" +
          tRanking("rankVacioOnline", "Todavía no hay carreras en el ranking global. ¡Terminá una carrera y sé el primero!") + "</p>";
      rankingUltimaLectura = Date.now();
      rankingErrorLectura = false;
    } catch (e) {
      // Mantener los resultados anteriores: no reemplazar la tabla por un error.
      rankingErrorLectura = true;
      if (!rankingUltimaLectura && !(cache && Array.isArray(cache.lista) && cache.lista.length)) {
        cont.textContent = tRanking("rankErrorOnline", "No se pudo conectar con el ranking online. Revisá tu conexión.");
      }
    } finally {
      rankingCarga = null;
      actualizarEstadoSync();
    }
  })();
  return rankingCarga;
}

function refrescarRankingVisible() {
  if (rankingAbierto && document.visibilityState === "visible") {
    return cargarRankingOnlineUI(true);
  }
  return Promise.resolve();
}

function iniciarRefrescoRanking() {
  rankingAbierto = true;
  if (rankingTimer !== null) clearInterval(rankingTimer);
  rankingTimer = setInterval(refrescarRankingVisible, RANKING_REFRESH_MS);
  return refrescarRankingVisible();
}

function detenerRefrescoRanking() {
  rankingAbierto = false;
  if (rankingTimer !== null) clearInterval(rankingTimer);
  rankingTimer = null;
}

function horaCorta(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) { return ""; }
}

function actualizarEstadoSync() {
  const el = document.getElementById("ranking-online-estado");
  if (!el) return;
  const pendiente = leerOutbox();
  const ultimo = leerJSONLS(RANKING_SYNC_KEY, null);
  if (rankingErrorLectura) {
    el.textContent = "⚠️ No se pudo actualizar. Los datos visibles pueden estar desactualizados. Reintentamos cada 10 s mientras esté abierto.";
    if (pendiente) el.textContent += " Tu carrera sigue pendiente de envío.";
    return;
  }
  if (rankingUltimaLectura) {
    el.textContent = "🟢 Consultado a las " + horaCorta(rankingUltimaLectura) + " · Actualización automática cada 10 s" +
      (pendiente ? " · 📤 Carrera pendiente de envío" : "");
    return;
  }
  if (pendiente) {
    el.innerHTML = "<span class='small text-warning fw-bold'>" +
      tRanking("rankPendiente", "📤 Tu carrera quedó guardada y se enviará cuando haya internet") + "</span>";
  } else if (ultimo) {
    el.innerHTML = "<span class='small text-success'>" +
      tRanking("rankSincronizado", "🟢 Ranking online sincronizado") + " · " + horaCorta(ultimo) + "</span>";
  } else {
    el.innerHTML = "<span class='small text-secondary'>☁️ Top " + RANKING_MAX + " global · un registro por dispositivo</span>";
  }
}

// ------------------- OVERRIDES -------------------

// guardarEnRanking (de features.js): guarda local y ademas manda online
const _guardarEnRankingBase = guardarEnRanking;
guardarEnRanking = function() {
  _guardarEnRankingBase();
  intentarEnviarRankingOnline();
};

// mostrarRanking (de features.js): ahora abre el modal con pestañas
// Global (online) y Este dispositivo (local)
mostrarRanking = function() {
  renderizarRankingLocal();
  instanciaModalRanking().show();
};

// ------------------- INICIALIZACION -------------------

document.addEventListener("DOMContentLoaded", function() {
  const modalEl = document.getElementById("modalRanking");
  if (modalEl) {
    modalEl.addEventListener("shown.bs.modal", function() {
      renderizarRankingLocal();
      iniciarRefrescoRanking();
    });
    modalEl.addEventListener("hidden.bs.modal", detenerRefrescoRanking);
    // Bootstrap propaga el evento de la pestaña: consultar al volver a Global.
    modalEl.addEventListener("shown.bs.tab", function(evento) {
      if (evento.target.getAttribute("data-bs-target") === "#tab-ranking-online") {
        refrescarRankingVisible();
      }
    });
  }

  const btnActualizar = document.getElementById("btn-ranking-actualizar");
  if (btnActualizar) {
    btnActualizar.addEventListener("click", function() {
      renderizarRankingLocal();
      cargarRankingOnlineUI(true);
    });
  }

  // Reintentos automaticos
  window.addEventListener("online", async function() {
    await vaciarOutbox();
    refrescarRankingVisible();
  });
  document.addEventListener("visibilitychange", refrescarRankingVisible);
  window.addEventListener("focus", refrescarRankingVisible);
  setInterval(function() {
    if (document.visibilityState === "visible" && leerOutbox()) vaciarOutbox();
  }, 45000);
  vaciarOutbox(); // al abrir la app
});






