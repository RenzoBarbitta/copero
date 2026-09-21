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
//   - GLOBAL es la fuente real (Supabase). "Este dispositivo" es
//     solo la carrera guardada (localStorage) y NO se mezcla con
//     el ranking: la cola (outbox) es un canal de sincronizacion.
//
//  FRESCURA GARANTIZADA:
//   - La cache en localStorage es SOLO un fallback visual/offline.
//     Nunca se sirve como dato "actual": tiene un tope de
//     antiguedad (RANKING_CACHE_MAX_MS) y todos los caminos que
//     piden datos (abrir, actualizar, publicar, volver a la
//     pestaña, reconectar) fuerzan una lectura a Supabase.
//   - polling cada RANKING_REFRESH_MS como red de seguridad MAS
//     Supabase Realtime: cuando un canal esta suscripto, el
//     ranking avisa al instante si cambia desde otro dispositivo
//     y deja de hacer polls innecesarios.
//   - El Service Worker NO intercepta supabase.co (ver sw.js).
//
//  Se carga DESPUES de cuenta-api.js (usa window.CoperoCuenta).
// ============================================================

// ------------------- CONFIGURACION -------------------

const RANKING_OUTBOX_KEY = "pso_ranking_outbox";
const RANKING_SYNC_KEY = "pso_ranking_ultimo_sync";
const RANKING_CACHE_KEY = "pso_ranking_cache_online";
const RANKING_MAX = 100;
const RANKING_TIMEOUT_MS = 10000;
// Cache de "fallback visual": solo se usa si esta MUY reciente.
const RANKING_CACHE_MS = 15000;
// Tope absoluto: aunque pidan !forzar, una cache con mas de 5 min
// NUNCA se considera actual (se lee la red).
const RANKING_CACHE_MAX_MS = 5 * 60 * 1000;
const RANKING_REFRESH_MS = 10000;

let RANKING_ENVIANDO = false;
let _modalRankingBs = null;
let rankingAbierto = false;
let rankingTimer = null;
let rankingCarga = null;
let rankingUltimaLectura = 0;
let rankingErrorLectura = false;
// El ranking "quedo viejo" (cambio remoto, publicacion propia, etc).
// Mientras sea true, aunque haya realtime, se vuelve a leer.
let rankingObsoleto = false;
// true solo cuando el canal de realtime esta suscripto OK.
let rankingRealtimeActivo = false;
let _canalRealtime = null;

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

// Registra en consola el estado y el cuerpo real de un fallo de Supabase
// (ej. 401, 403 RLS, 404 tabla, 429) para poder diagnosticarlo.
function registrarFalloRanking(op, res) {
  try {
    console.error("[ranking-online] " + op, JSON.stringify({
      operacion: op,
      status: res && res.status,
      estadoOk: !!(res && res.ok),
      cuerpo: res ? "(leyendo cuerpo)" : null
    }, null, 2));
    if (!res) return;
    (async function() {
      try {
        const texto = await res.text();
        console.error("[ranking-online] " + op + " cuerpo", texto.slice(0, 2000));
      } catch (e) { /* cuerpo no legible */ }
    })();
  } catch (e) { /* sin consola */ }
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
// es en memoria, con token que se renueva solo. Nunca se lee localStorage:
// si la sesion real no esta restaurada, no se publica (queda en cola).
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
  if (!res.ok) {
    registrarFalloRanking("leerRankingNube", res);
    throw new Error("HTTP " + res.status);
  }
  return normalizarFilas(await res.json());
}

// UPSERT de la fila propia (una entrada por cuenta). Sin sesion la base
// rechaza la escritura: el registro queda en la cola local.
async function publicarEnNube(registro) {
  const sesion = sesionRanking();
  if (!sesion) return false;
  let token;
  try {
    token = await window.CoperoCuenta.token();
  } catch (e) {
    // Sin token (sesion inexistente): no se publica y el registro queda en cola.
    try { console.error("[ranking-online] publicarEnNube sin token", e && e.message); } catch (e2) { /* silencio */ }
    return false;
  }
  // La fila SIEMPRE es la del usuario en sesion, y el cuerpo va EXACTO a las
  // columnas de la tabla (nada de campos extra que PostgREST rechace).
  const cuerpo = {
    user_id: sesion.userId,
    display_name: registro.display_name,
    posicion: registro.posicion || "",
    club: registro.club || "",
    media: registro.media,
    titulos: registro.titulos,
    anio: registro.anio,
    ts: registro.ts
  };
  const res = await fetchConTimeout(urlRanking(), {
    method: "POST",
    headers: Object.assign(headersRanking(token), { Prefer: "resolution=merge-duplicates" }),
    body: JSON.stringify(cuerpo)
  });
  // 401/403 (token vencido/revocado): el registro queda EN COLA para reintentar,
  // NUNCA se da de baja la sesion (puede ser un rechazo transitorio o de otra
  // pestaña). Cuando la sesion recupere validez se reenvia solo.
  if (res.status === 401 || res.status === 403) {
    registrarFalloRanking("publicarEnNube rechazado", res);
    return false;
  }
  if (!res.ok) {
    registrarFalloRanking("publicarEnNube", res);
    throw new Error("HTTP " + res.status);
  }
  return true;
}

// ------------------- COLA OFFLINE / SINCRONIZACION -------------------

function leerOutbox() { return leerJSONLS(RANKING_OUTBOX_KEY, null); }

// Cada registro encolado lleva un _id unico. Sirve para que una publicacion
// en vuelo NO borre por error un registro NUEVO que se encolo despues.
function encolarRegistro(registro) {
  const conId = Object.assign({}, registro, {
    _id: (registro && registro._id) ||
      ("r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10))
  });
  escribirJSONLS(RANKING_OUTBOX_KEY, conId);
  return conId;
}

// Borra SOLO si la cola sigue teniendo el mismo registro publicado.
function borrarOutboxSi(pendiente) {
  if (!pendiente) return;
  const actual = leerOutbox();
  if (actual && actual._id && actual._id === pendiente._id) {
    try { localStorage.removeItem(RANKING_OUTBOX_KEY); } catch (e) { /* ignorar */ }
  }
}

function marcarSync() { escribirJSONLS(RANKING_SYNC_KEY, Date.now()); }

// La cache SOLO es un fallback visual/offline (nunca "datos actuales").
// Por eso se puede invalidar sin miedo: es un render temporal.
function invalidarCacheOnline() {
  try { localStorage.removeItem(RANKING_CACHE_KEY); } catch (e) { /* ignorar */ }
}
function leerCacheOnline() { return leerJSONLS(RANKING_CACHE_KEY, null); }
function guardarCacheOnline(lista) {
  escribirJSONLS(RANKING_CACHE_KEY, { ts: Date.now(), lista: (lista || []).slice(0, RANKING_MAX) });
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
    // Solo borrar si sigue siendo el MISMO registro (no uno mas nuevo).
    borrarOutboxSi(pendiente);
    marcarSync();
    // Publicado = la vista debe refrescarse, asi que el cache vuela.
    invalidarCacheOnline();
    try { actualizarEstadoSync(); } catch (e) { /* silencio */ }
    // Lectura fresca (espera cualquier peticion en vuelo y vuelve a leer).
    refrescarRankingAhora();
    return true;
  } catch (e) {
    try { console.error("[ranking-online] vaciarOutbox", e && e.message); } catch (e2) { /* silencio */ }
    return false; // queda en cola para reintentar
  } finally {
    RANKING_ENVIANDO = false;
  }
}

// Lee el ranking. Siempre que pedimos datos (forzar=true) va a la red.
// El cache (solo-fallback) se usa unica y exclusivamente en llamadas
// explicitas !forzar y ademas con un tope de antiguedad (no puede
// bloquear un dato del servidor).
async function obtenerRankingOnline(forzar) {
  const cache = leerCacheOnline();
  const esValida = cache && Array.isArray(cache.lista) && cache.ts &&
    (Date.now() - cache.ts) <= RANKING_CACHE_MAX_MS;
  if (!forzar && esValida && (Date.now() - cache.ts) < RANKING_CACHE_MS) {
    return cache.lista;
  }
  const lista = await leerRankingNube();
  guardarCacheOnline(lista);
  return lista;
}

// Fuerza una lectura a Supabase DESPUES de que termine cualquier peticion
// en vuelo. Asi un refresh nunca "hereda" el resultado de una lectura que
// arranco ANTES de la publicacion/cambio que queremos ver.
function refrescarRankingAhora() {
  rankingObsoleto = true;
  rankingErrorLectura = false;
  const enVuelo = rankingCarga;
  return Promise.resolve(enVuelo)
    .catch(function() { /* una peticion previa que fallo no bloquea */ })
    .then(function() { return cargarRankingOnlineUI(true).catch(function() { return null; }); });
}

// Punto de entrada: se llama al terminar una carrera. Devuelve la promesa de
// vaciarOutbox: true = publicado, false = sigue en cola (sin sesion/offline).
function intentarEnviarRankingOnline() {
  try {
    if (typeof jugador === "undefined" || !jugador || !jugador.nombre) return false;
    const s = sesionRanking();
    encolarRegistro(construirRegistroRanking(jugador, s ? s.userId : null));
    invalidarCacheOnline(); // la carrera local cambio: el fallback visual ya no aplica
    return vaciarOutbox();
  } catch (e) { return false; }
}

// ------------------- REALTIME (cambios desde OTRO dispositivo) -------------------

function notificarCambioRemotoRanking() {
  // Puede venir por INSERT/UPDATE desde otro cliente (o por moderacion DELETE).
  rankingObsoleto = true;
  rankingErrorLectura = false;
  refrescarRankingVisible();
}

function conectarRealtimeRanking() {
  if (_canalRealtime) return;
  if (typeof window === "undefined" || typeof window.getSupabaseClient !== "function") return;
  let sb;
  try { sb = window.getSupabaseClient(); } catch (e) { return; }
  const canal = sb.channel("ranking-global");
  canal.on("postgres_changes",
    { event: "*", schema: "public", table: "copero_ranking" },
    function() { notificarCambioRemotoRanking(); }
  );
  canal.subscribe(function(estado) {
    if (estado === "SUBSCRIBED") {
      rankingRealtimeActivo = true;
    } else if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT" || estado === "CLOSED") {
      // Realtime no disponible (o fallo): el polling toma el control.
      rankingRealtimeActivo = false;
      try { sb.removeChannel(canal); } catch (e) { /* silencio */ }
      _canalRealtime = null;
    }
  });
  _canalRealtime = { sb: sb, canal: canal };
}

function desconectarRealtimeRanking() {
  if (!_canalRealtime) return;
  try { _canalRealtime.sb.removeChannel(_canalRealtime.canal); } catch (e) { /* silencio */ }
  _canalRealtime = null;
  rankingRealtimeActivo = false;
  rankingObsoleto = false;
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
      rankingObsoleto = false;
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
  if (!rankingAbierto || document.visibilityState !== "visible") return Promise.resolve();
  // Con realtime activo solo se vuelve a leer si algo cambio o fallo la ultima vez.
  // Sin realtime, el polling hace la lectura siempre (red de seguridad).
  if (rankingRealtimeActivo && !rankingObsoleto && !rankingErrorLectura) return Promise.resolve();
  return cargarRankingOnlineUI(true);
}

function alVolverVisible() {
  if (document.visibilityState !== "visible") return;
  rankingObsoleto = true; // volver a la app SIEMPRE consulta de nuevo
  refrescarRankingVisible();
}

function iniciarRefrescoRanking() {
  rankingAbierto = true;
  if (rankingTimer !== null) clearInterval(rankingTimer);
  rankingTimer = setInterval(refrescarRankingVisible, RANKING_REFRESH_MS);
  conectarRealtimeRanking();
  return refrescarRankingVisible();
}

function detenerRefrescoRanking() {
  rankingAbierto = false;
  if (rankingTimer !== null) clearInterval(rankingTimer);
  rankingTimer = null;
  rankingObsoleto = false;
  desconectarRealtimeRanking();
}

// Cuando la sesión cambia (inicio/cierre de cuenta), actualizar estado y,
// si hay sesión, intentar vaciar lo que quedó en cola de ranking. NO se
// genera un registro nuevo acá: eso solo pasa al TERMINAR una carrera.
function onSesionCambiada() {
  try { actualizarEstadoSync(); } catch (e) { /* silencio */ }
  if (sesionRanking() && typeof vaciarOutbox === "function") {
    (async function () {
      try {
        const ok = await vaciarOutbox();
        if (ok) {
          try { actualizarEstadoSync(); } catch (e) { /* silencio */ }
          rankingObsoleto = true;
          refrescarRankingAhora();
        }
      } catch (e) { /* silencio */ }
    })();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("cuenta:sesion-cambiada", onSesionCambiada);
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
    const cadencia = rankingRealtimeActivo ? "en vivo" : "cada 10 s";
    el.textContent = "🟢 Consultado a las " + horaCorta(rankingUltimaLectura) + " · " + cadencia;
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

// guardarEnRanking (de features.js): ahora solo manda a cola online
// (el guardado local fue eliminado de features.js).
// La función ya existe en features.js y envía a online directamente.

// mostrarRanking (de features.js): ahora abre el modal con pestañas
// Global (online)
mostrarRanking = function() {
  instanciaModalRanking().show();
};

// ------------------- INICIALIZACION -------------------

document.addEventListener("DOMContentLoaded", function() {
  const modalEl = document.getElementById("modalRanking");
  if (modalEl) {
    modalEl.addEventListener("shown.bs.modal", function() {
      vaciarOutbox(); // si quedó una carrera pendiente, se manda YA
      iniciarRefrescoRanking();
    });
    modalEl.addEventListener("hidden.bs.modal", detenerRefrescoRanking);
  }

  const btnActualizar = document.getElementById("btn-ranking-actualizar");
  if (btnActualizar) {
    btnActualizar.addEventListener("click", function() {
      // Primero se descarga la cola pendiente; la lectura fresca se hace
      // siempre, esperando cualquier peticion en vuelo.
      rankingObsoleto = true;
      vaciarOutbox();
      refrescarRankingAhora();
    });
  }

  // Reintentos automaticos
  window.addEventListener("online", function() {
    rankingObsoleto = true;
    vaciarOutbox();
    refrescarRankingVisible();
  });
  document.addEventListener("visibilitychange", alVolverVisible);
  window.addEventListener("focus", alVolverVisible);
  setInterval(function() {
    if (document.visibilityState === "visible" && leerOutbox()) vaciarOutbox();
  }, 45000);
  vaciarOutbox(); // al abrir la app
});