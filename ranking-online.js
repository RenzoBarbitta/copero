// ============================================================
//  RANKING ONLINE - ranking-online.js
//  Ranking global sobre SUPABASE con Row Level Security (RLS).
//
//  DEFENSA (por que ya no se puede manipular la base):
//   - Antes era un JSON publico (textdb.dev): cualquiera podia
//     escribir desde la consola. Eso esta eliminado.
//   - La tabla copero_ranking solo acepta SELECT sin sesion.
//   - Escribir exige una cuenta con email confirmado y SOLO se
//     puede tocar la fila propia (user_id = auth.uid()).
//   - No existe DELETE por API: la moderacion se hace desde el
//     dashboard de Supabase (service_role).
//   - CHECK en la base: media 0..99, apodo 2..30, etc.
//     Ver supabase/002-ranking.sql.
//
//  COMO FUNCIONA:
//   - Al terminar una carrera: si hay sesion, se publica con un
//     UPSERT (una sola entrada por cuenta; la nueva reemplaza a
//     la anterior). Sin sesion queda en cola y se envia sola
//     cuando el jugador inicie sesion o vuelva internet.
//   - El boton 🏆 Ranking muestra: 🌍 Global (Supabase) y
//     📱 Este dispositivo (localStorage, igual que siempre).
//
//  Se carga DESPUES de cuenta-api.js (usa window.CoperoCuenta).
// ============================================================

// ------------------- CONFIGURACION -------------------

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

function compararRankingOnline(a, b) {
  if (typeof compararRanking === "function") return compararRanking(a, b);
  const mediaA = Number(a && a.media != null ? a.media : 0);
  const mediaB = Number(b && b.media != null ? b.media : 0);
  if (mediaB !== mediaA) return mediaB - mediaA;
  const titulosA = Number(a && a.titulos != null ? a.titulos : 0);
  const titulosB = Number(b && b.titulos != null ? b.titulos : 0);
  if (titulosB !== titulosA) return titulosB - titulosA;
  return Number(b && b.ts != null ? b.ts : 0) - Number(a && a.ts != null ? a.ts : 0);
}

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

function leerJSONLS(clave, defecto) {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : defecto;
  } catch (e) { return defecto; }
}

function escribirJSONLS(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* ignorar */ }
}

async function fetchConTimeout(url, opciones) {
  const controlador = new AbortController();
  const timer = setTimeout(function() { controlador.abort(); }, RANKING_TIMEOUT_MS);
  try {
    return await fetch(url, Object.assign({}, opciones || {}, { signal: controlador.signal }));
  } finally {
    clearTimeout(timer);
  }
}

// ------------------- SUPABASE (CAPA SEGURA) -------------------

function supabaseConfig() {
  if (typeof COPERO_SUPABASE === "undefined" || !COPERO_SUPABASE || !COPERO_SUPABASE.url) {
    throw new Error("Supabase no configurado");
  }
  return COPERO_SUPABASE;
}

function headersRanking(token) {
  const cfg = supabaseConfig();
  const h = { apikey: cfg.publishableKey, "Content-Type": "application/json" };
  if (token) h.Authorization = "Bearer " + token;
  return h;
}

// Sesion activa para publicar (o null). La sesion vive en cuenta-api.js:
// es en memoria, con token que se renueva solo.
function sesionRanking() {
  const cuenta = (typeof window !== "undefined") && window.CoperoCuenta;
  if (!cuenta || typeof cuenta.tieneSesion !== "function" || !cuenta.tieneSesion()) return null;
  if (typeof cuenta.idUsuario !== "function") return null;
  const id = cuenta.idUsuario();
  return id ? { userId: id } : null;
}

function idUsuarioActual() {
  const s = sesionRanking();
  return s ? s.userId : null;
}

// Arma el registro para la tabla. El cliente se auto-limita, pero la
// defensa real esta en la base: RLS + CHECK constraints (002-ranking.sql).
function construirRegistroRanking(jug, usuarioId) {
  const trofeos = jug.trofeos || {};
  const titulos = (trofeos.primeraDivision || 0) + (trofeos.segundaDivision || 0) +
                  (trofeos.copaDeCampeones || 0) + (trofeos.copaArgentina || 0) +
                  (trofeos.copaApa || 0);
  const media = Math.round(Number(jug.media) || 0);
  return {
    user_id: usuarioId || null,
    display_name: String(jug.nombre || "Anonimo").trim().slice(0, 30),
    posicion: String(jug.posicion || "").trim().slice(0, 5),
    club: (jug.clubActual && jug.clubActual.nombre) ? String(jug.clubActual.nombre).trim().slice(0, 40) : "",
    media: Math.max(0, Math.min(99, media)),
    titulos: Math.max(0, Math.round(Number(titulos) || 0)),
    anio: new Date().getFullYear(),
    ts: new Date().toISOString()
  };
}

function urlRanking() {
  return supabaseConfig().url +
    "/rest/v1/copero_ranking?select=user_id,display_name,posicion,club,media,titulos,anio,ts" +
    "&order=media.desc,titulos.desc,ts.desc&limit=" + RANKING_MAX;
}

// Toma las filas de Supabase y las normaliza (tolerante a basura).
function normalizarFilas(datos) {
  if (!Array.isArray(datos)) return [];
  return datos
    .filter(function(f) { return f && f.user_id && f.display_name && f.media != null; })
    .map(function(f) {
      return {
        user_id: String(f.user_id),
        nombre: String(f.display_name),
        posicion: String(f.posicion || ""),
        club: String(f.club || ""),
        media: Number(f.media) || 0,
        titulos: Number(f.titulos) || 0,
        anio: Number(f.anio) || 0,
        ts: Date.parse(f.ts) || 0
      };
    });
}

// Lectura: publica, con la clave publishable (la API ordena server-side).
async function leerRankingNube() {
  const res = await fetchConTimeout(urlRanking(), {
    method: "GET", cache: "no-store", headers: headersRanking(null)
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return normalizarFilas(await res.json());
}

// UPSERT de la fila propia (una entrada por cuenta). Sin sesion la base
// rechaza la escritura: el registro queda en la cola local.
async function publicarEnNube(registro) {
  const sesion = sesionRanking();
  if (!sesion) return false;
  const token = await window.CoperoCuenta.token();
  // Defensa extra: SIEMPRE se publica sobre la fila del usuario en sesion,
  // sin importar que diga el registro encolado.
  const cuerpo = Object.assign({}, registro, { user_id: sesion.userId });
  const res = await fetchConTimeout(urlRanking(), {
    method: "POST",
    headers: Object.assign(headersRanking(token), { Prefer: "resolution=merge-duplicates" }),
    body: JSON.stringify(cuerpo)
  });
  if (res.status === 401 || res.status === 403) return false; // sesion vencida: reintenta luego
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

// Intenta publicar el registro en cola. Sin sesion NO gasta red: queda
// guardado hasta que el jugador inicie sesion (se reintenta solo).
async function vaciarOutbox() {
  if (RANKING_ENVIANDO) return false;
  const pendiente = leerOutbox();
  if (!pendiente) return false;
  RANKING_ENVIANDO = true;
  try {
    const publicado = await publicarEnNube(pendiente);
    if (!publicado) return false; // sin sesion o rechazado: queda en cola
    borrarOutbox();
    marcarSync();
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
  const lista = await leerRankingNube();
  guardarCacheOnline(lista);
  return lista;
}

// Punto de entrada: se llama al terminar una carrera
function intentarEnviarRankingOnline() {
  try {
    if (typeof jugador === "undefined" || !jugador || !jugador.nombre) return;
    const s = sesionRanking();
    encolarRegistro(construirRegistroRanking(jugador, s ? s.userId : null));
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
  const miId = esLocal ? null : idUsuarioActual();
  let filas = "";
  (lista || []).slice().sort(compararRankingOnline).forEach(function(r, i) {
    const propia = !esLocal && r.user_id && r.user_id === miId;
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
  if (pendiente) {
    if (!sesionRanking()) {
      el.innerHTML = "<span class='small text-warning fw-bold'>" +
        tRanking("rankRequiereSesion", "🔐 Tu carrera quedó guardada. Iniciá sesión en Mi cuenta para publicarla en el ranking global") + "</span>";
    } else {
      el.innerHTML = "<span class='small text-warning fw-bold'>" +
        tRanking("rankPendiente", "📤 Tu carrera quedó guardada y se enviará cuando haya internet") + "</span>";
    }
    return;
  }
  if (rankingUltimaLectura) {
    el.textContent = "🟢 Consultado a las " + horaCorta(rankingUltimaLectura) + " · Actualización automática cada 10 s";
    return;
  }
  if (ultimo) {
    el.innerHTML = "<span class='small text-success'>" +
      tRanking("rankSincronizado", "🟢 Ranking online sincronizado") + " · " + horaCorta(ultimo) + "</span>";
  } else {
    el.innerHTML = "<span class='small text-secondary'>☁️ Top " + RANKING_MAX + " global · una entrada por cuenta</span>";
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



