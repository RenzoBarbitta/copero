// ============================================================
//  TEST: ranking online sobre Supabase con RLS (SIN red real).
//  Ejecuta ranking-online.js en una sandbox con fetch simulado y
//  verifica la defensa: sin sesion NO se escribe, con sesion el
//  upsert siempre va a la fila propia, media acotada a 0..99,
//  y 401 mantiene el registro en cola.
//  Uso: node test-ranking-online.mjs
// ============================================================
import fs from "node:fs";
import vm from "node:vm";

let fallos = 0;
function asertar(cond, msg) {
  if (!cond) { console.error("FALLO: " + msg); fallos++; }
  else console.log("OK  " + msg);
}

// ---------------- sandbox ----------------
const store = new Map();
const storageStub = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: (k) => { store.delete(k); }
};

const peticiones = [];
let respuesta = { ok: true, status: 200, body: [] };
// Respuesta por ruta: permite distinguir el RPC (005) de la tabla (002/004).
let respuestaPorUrl = null;
let gateActive = false;   // si true, la siguiente peticion queda "en vuelo"
let gateResolve = null;   // la libera gateActive = false + llamar a gateRelease()

function gateRelease() { if (gateResolve) { const r = gateResolve; gateResolve = null; r(); } }

// Body real que devuelve Supabase cuando el RPC del 005 no esta instalado.
const RPC_NO_INSTALADO = {
  ok: false, status: 404, statusText: "Not Found",
  body: { code: "PGRST202", message: "Could not find the function public.copero_publicar_ranking(p_club, p_display_name, p_evento, p_media, p_nonce, p_posicion, p_titulos) in the schema cache" }
};

const sandboxTimers = {
  timeouts: new Map(),
  intervals: new Map(),
  setTimeout(fn, delay = 0, ...args) {
    const id = setTimeout(() => { sandboxTimers.timeouts.delete(id); fn(...args); }, delay);
    sandboxTimers.timeouts.set(id, { fn, delay });
    return id;
  },
  clearTimeout(id) {
    if (sandboxTimers.timeouts.has(id)) { clearTimeout(id); sandboxTimers.timeouts.delete(id); }
  },
  setInterval(fn, delay = 0, ...args) {
    const id = setInterval(() => { fn(...args); }, delay);
    sandboxTimers.intervals.set(id, { fn, delay });
    return id;
  },
  clearInterval(id) {
    if (sandboxTimers.intervals.has(id)) { clearInterval(id); sandboxTimers.intervals.delete(id); }
  },
  limpiarTodos() {
    for (const id of sandboxTimers.timeouts.keys()) clearTimeout(id);
    for (const id of sandboxTimers.intervals.keys()) clearInterval(id);
    sandboxTimers.timeouts.clear();
    sandboxTimers.intervals.clear();
  }
};

const sandbox = {
  _sandboxTimers: sandboxTimers,
  console, Date, JSON, Math, Promise, AbortController,
  setTimeout: sandboxTimers.setTimeout.bind(sandboxTimers),
  clearTimeout: sandboxTimers.clearTimeout.bind(sandboxTimers),
  setInterval: sandboxTimers.setInterval.bind(sandboxTimers),
  clearInterval: sandboxTimers.clearInterval.bind(sandboxTimers),
  localStorage: storageStub,
  document: { addEventListener() {}, getElementById: () => null, visibilityState: "visible" },
  window: { addEventListener() {}, dispatchEvent() {} },
  navigator: { onLine: true },
  location: { protocol: "https:", hostname: "test" },
  fetch: async (url, opts) => {
    const u = String(url);
    peticiones.push({ url: u, opts: opts || {} });
    const r = (respuestaPorUrl && respuestaPorUrl(u)) || respuesta;
    if (r.error) throw r.error;
    if (gateActive) await new Promise(function(res) { gateResolve = res; });
    return {
      ok: r.ok, status: r.status, statusText: r.statusText || "",
      json: async () => r.body,
      text: async () => (typeof r.body === "string" ? r.body : JSON.stringify(r.body))
    };
  },
  // Config publica del proyecto (misma estructura que supabase-config.js)
  COPERO_SUPABASE: { url: "https://proyecto-test.supabase.co", publishableKey: "clave-publica-test" }
};
vm.createContext(sandbox);

// Estado de la cuenta simulada (window.CoperoCuenta)
let sesionActiva = false;
let usuarioId = "user-1111";
sandbox.window.CoperoCuenta = {
  tieneSesion: () => sesionActiva,
  idUsuario: () => (sesionActiva ? usuarioId : null),
  token: async () => "token-de-prueba"
};

vm.runInContext("function guardarEnRanking() {}; function mostrarRanking() {};", sandbox);
const codigo = fs.readFileSync("ranking-online.js", "utf8");
vm.runInContext(codigo, sandbox, { filename: "ranking-online.js" });

vm.runInContext(
  "var jugador = { nombre: 'TestBot', posicion: 'DEL', media: 88, trofeos: { primeraDivision: 2, copaDeCampeones: 1 }, clubActual: { nombre: 'River Plate' } };" +
  "var guardarPartida = function() {};",
  sandbox
);

// 1) Sin sesion: encola pero NO gasta red (no llega a hacer fetch)
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await new Promise(r => setTimeout(r, 50));
asertar(!!storageStub.getItem("pso_ranking_outbox"), "sin sesion: la carrera queda en cola");
asertar(peticiones.length === 0, "sin sesion: no hay peticiones de escritura a la nube");

// 2) Con sesion: vaciarOutbox publica con el RPC validado (005)
sesionActiva = true;
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
asertar(peticiones.length === 1, "con sesion: se hace exactamente 1 peticion");
const envio = peticiones[0];
asertar(/\/rest\/v1\/rpc\/copero_publicar_ranking$/.test(envio.url), "primero usa el RPC validado (005)");
asertar(envio.opts.method === "POST", "la publicacion usa POST");
asertar(envio.opts.headers.apikey === "clave-publica-test", "envia la clave publishable");
asertar(envio.opts.headers.Authorization === "Bearer token-de-prueba", "envia el token de sesion");
const cuerpo = JSON.parse(envio.opts.body);
asertar(cuerpo.user_id === undefined, "el RPC no manda user_id: lo pone el servidor con auth.uid()");
asertar(cuerpo.p_evento === "carrera", "declara el evento carrera");
asertar(typeof cuerpo.p_nonce === "string" && cuerpo.p_nonce.length > 0, "manda un nonce (idempotencia anti-replay)");
asertar(cuerpo.p_display_name === "TestBot", "display_name correcto");
asertar(cuerpo.p_media === 88 && cuerpo.p_titulos === 3, "media 88 y titulos 3 (2 liga + 1 copa)");
asertar(cuerpo.p_club === "River Plate", "p_club correcto");
asertar(cuerpo.p_posicion === "DEL", "p_posicion correcto");
asertar(cuerpo.p_durante === "M", "p_durante tiene valor por defecto (Opción A sin tocar 005)");
asertar(cuerpo.p_a_longitud === 0, "p_a_longitud tiene valor por defecto");
asertar(!storageStub.getItem("pso_ranking_outbox"), "enviado: la cola queda vacia");

// 3) Defensa anti-media-trampa: el cliente acota la media a 0..99
vm.runInContext("jugador.media = 999;", sandbox);
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await new Promise(r => setTimeout(r, 50)); // el envio fire-and-forget termina
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
const cuerpo2 = JSON.parse(peticiones[peticiones.length - 1].opts.body);
asertar(cuerpo2.p_media === 99, "media 999 se acota a 99 en el cliente (y la base lo rechazaria igual)");

// 4) Sesion vencida (401): el registro NO se borra, queda para reintentar
respuesta = { ok: false, status: 401, body: { message: "JWT expired" } };
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await new Promise(r => setTimeout(r, 50));
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
asertar(!!storageStub.getItem("pso_ranking_outbox"), "401: el registro queda en cola para reintentar");

// 5) Lectura publica + normalizacion (filas de Supabase -> filas del juego)
respuesta = { ok: true, status: 200, body: [
  { user_id: "a", display_name: "Uno", posicion: "DEL", club: "Club", media: 90, titulos: 4, anio: 2026, ts: "2026-09-20T12:00:00Z" },
  { user_id: "b", display_name: "Dos", posicion: "GK", club: "", media: 70, titulos: 0, anio: 2026, ts: "2026-09-20T11:00:00Z" },
  null,
  { media: 55 } // fila incompleta: se descarta
] };
const lista = await vm.runInContext("obtenerRankingOnline(true)", sandbox);
asertar(Array.isArray(lista) && lista.length === 2, "obtenerRankingOnline descarta filas incompletas");
asertar(lista[0].nombre === "Uno" && lista[0].media === 90, "normalizacion de filas correcta");
asertar(lista[0].ts > 0, "ts ISO convertido a numero");

// 6) Defensa XSS en el render
const escapado = vm.runInContext("escaparHtml('<img src=x onerror=alert(1)>')", sandbox);
asertar(escapado.indexOf("<img") === -1 && escapado.indexOf("&lt;img") !== -1, "escaparHtml neutraliza HTML malicioso");

// 7) Construccion sin sesion: user_id null (no imita a otros usuarios)
const registroAnonimo = vm.runInContext("construirRegistroRanking(jugador, null)", sandbox);
asertar(registroAnonimo.user_id === null, "sin sesion el registro no declara user_id ajeno");

// 8) 403 de RLS: el registro queda en cola (igual que 401, no se pierde ni se cierra sesion)
respuesta = { ok: false, status: 403, body: { message: "new row violates row-level security policy" } };
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await new Promise(r => setTimeout(r, 50));
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
asertar(!!storageStub.getItem("pso_ranking_outbox"), "403: el registro queda en cola para reintentar");

// 9) Fallo de red: el resultado no se pierde, sigue en la cola
respuesta.error = new Error("Sin conexion");
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await new Promise(r => setTimeout(r, 50));
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
asertar(!!storageStub.getItem("pso_ranking_outbox"), "fallo de red: el registro queda en cola");
delete respuesta.error;

// 10) Recuperacion de red: se publica, se vacia la cola y se invalida la cache del ranking
storageStub.setItem("pso_ranking_cache_online", JSON.stringify({ ts: Date.now(), lista: [{ nombre: "Vieja" }] }));
respuesta = { ok: true, status: 201, body: [] };
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
asertar(!storageStub.getItem("pso_ranking_outbox"), "recuperacion de red: se publica y la cola queda vacia");
asertar(!storageStub.getItem("pso_ranking_cache_online"), "publicar exitoso invalida la cache del ranking");

// 11) Reintento de una carrera en la misma cuenta: el nonce (id de la cola)
//     hace el reenvio idempotente; el RPC sigue sin mandar user_id.
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await new Promise(r => setTimeout(r, 50));
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
const cuerpo3 = JSON.parse(peticiones[peticiones.length - 1].opts.body);
asertar(cuerpo3.user_id === undefined, "reintento: la fila propia la fija auth.uid() en el servidor");
asertar(typeof cuerpo3.p_nonce === "string" && cuerpo3.p_nonce.length > 0, "reintento: manda nonce para no duplicar");

// 12) Ranking vacio devuelve una lista vacia (no rompe la UI)
respuesta = { ok: true, status: 200, body: [] };
const listaVacia = await vm.runInContext("obtenerRankingOnline(true)", sandbox);
asertar(Array.isArray(listaVacia) && listaVacia.length === 0, "ranking vacio devuelve []");

// 13) Cache vieja (>5 min) NUNCA bloquea: se lee la red aun sin forzar
storageStub.setItem("pso_ranking_cache_online",
  JSON.stringify({ ts: Date.now() - 10 * 60 * 1000, lista: [{ user_id: "x", nombre: "Cache", media: 10, titulos: 0, anio: 2026, ts: "2026-09-20T00:00:00Z" }] }));
respuesta = { ok: true, status: 200, body: [{ user_id: "a", display_name: "Nuevo", posicion: "DEL", club: "", media: 90, titulos: 1, anio: 2026, ts: "2026-09-20T12:00:00Z" }] };
const l2 = await vm.runInContext("obtenerRankingOnline(false)", sandbox);
asertar(l2[0].nombre === "Nuevo", "cache vieja (>5 min) no bloquea: se lee la red aunque no se fuerce");

// 14) Cache reciente es SOLO fallback visual: se usa sin forzar, nunca con forzar
storageStub.setItem("pso_ranking_cache_online",
  JSON.stringify({ ts: Date.now(), lista: [{ user_id: "x", nombre: "Cache", media: 10, titulos: 0, anio: 2026, ts: "2026-09-20T00:00:00Z" }] }));
respuesta = { ok: true, status: 200, body: [{ user_id: "a", display_name: "Nuevo", posicion: "DEL", club: "", media: 90, titulos: 1, anio: 2026, ts: "2026-09-20T12:00:00Z" }] };
const l3 = await vm.runInContext("obtenerRankingOnline(false)", sandbox);
asertar(l3[0].nombre === "Cache", "cache reciente sirve de fallback visual solo sin forzar");
const l4 = await vm.runInContext("obtenerRankingOnline(true)", sandbox);
asertar(l4[0].nombre === "Nuevo", "FORZAR siempre consulta Supabase aunque haya cache reciente");

// 15) Ordenamiento: media > titulos > ts mas reciente (igual que el back-end)
const orden = vm.runInContext(
  "[" +
  "{user_id:'a',nombre:'A',media:80,titulos:1,ts:300}," +
  "{user_id:'b',nombre:'B',media:90,titulos:0,ts:900}," +
  "{user_id:'c',nombre:'C',media:80,titulos:3,ts:100}," +
  "{user_id:'d',nombre:'D',media:80,titulos:3,ts:400}" +
  "].sort(compararRankingOnline).map(function(r){return r.nombre;}).join(',')",
  sandbox);
asertar(orden === "B,D,C,A", "orden: media desc, titulos desc, timestamp mas reciente primero");

// 16) RACE de cola: si durante el POST en vuelo se encola un registro NUEVO,
//     el POST del registro viejo NO debe borrarlo de la cola.
storageStub.removeItem("pso_ranking_outbox");
respuesta = { ok: true, status: 201, body: [] };
gateActive = true;
vm.runInContext(
  "encolarRegistro({ user_id: 'u1', display_name: 'Viejo', posicion: 'DEL', club: '', media: 70, titulos: 1, anio: 2026, ts: '2026-09-20T10:00:00Z' });",
  sandbox);
const pVuelo = vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50)); // el POST quedo "en vuelo" (gate activo)
vm.runInContext(
  "encolarRegistro({ user_id: 'u1', display_name: 'Nuevo', posicion: 'DEL', club: '', media: 95, titulos: 5, anio: 2026, ts: '2026-09-20T11:00:00Z' });",
  sandbox);
gateActive = false;
gateRelease();
await pVuelo;
await new Promise(r => setTimeout(r, 50));
asertar(!!storageStub.getItem("pso_ranking_outbox"), "race: el POST del registro viejo no vacia la cola por error");
const enCola = JSON.parse(storageStub.getItem("pso_ranking_outbox"));
asertar(enCola.display_name === "Nuevo", "race: la cola conserva el registro MAS nuevo");

// 17) LA BASE TODAVIA NO TIENE EL 005 (404 PGRST202): el cliente cae solo al
//     upsert directo sobre la fila propia y publica igual (sync no rota).
vm.runInContext("RANKING_RPC_DISPONIBLE = null;", sandbox);
storageStub.setItem("pso_ranking_outbox", JSON.stringify({
  _id: "cola-1", user_id: "otro-usuario", display_name: "TestBot", posicion: "DEL",
  club: "River Plate", media: 88, titulos: 3, anio: 2026, ts: "2026-09-22T10:00:00Z"
}));
respuestaPorUrl = (u) => (/\/rest\/v1\/rpc\/copero_publicar_ranking$/.test(u)
  ? RPC_NO_INSTALADO
  : { ok: true, status: 201, statusText: "Created", body: [] });
peticiones.length = 0;
asertar(await vm.runInContext("vaciarOutbox();", sandbox) === true, "RPC no instalado: la carrera se publica igual");
await new Promise(r => setTimeout(r, 50));
asertar(peticiones.length === 2, "RPC no instalado: 1 intento al RPC + 1 upsert directo");
asertar(/\/rest\/v1\/copero_ranking\?on_conflict=user_id$/.test(peticiones[1].url), "el respaldo usa on_conflict=user_id (PK real de la tabla)");
asertar(peticiones[1].opts.headers.Prefer === "resolution=merge-duplicates", "el respaldo usa Prefer: merge-duplicates");
asertar(peticiones[1].opts.headers.Authorization === "Bearer token-de-prueba", "el respaldo va con el token de la sesion");
const cuerpoTabla = JSON.parse(peticiones[1].opts.body);
asertar(cuerpoTabla.user_id === "user-1111", "SEGURIDAD: el payload de la cola no puede elegir otro user_id");
asertar(cuerpoTabla.display_name === "TestBot" && cuerpoTabla.media === 88, "el respaldo manda los datos de la carrera");
asertar(cuerpoTabla._id === undefined && cuerpoTabla.nonce === undefined, "el respaldo no manda campos que la tabla no tiene");
asertar(cuerpoTabla.ts === "2026-09-22T10:00:00Z", "el respaldo conserva la fecha de la carrera");
asertar(!storageStub.getItem("pso_ranking_outbox"), "RPC no instalado: la cola queda vacia (solo con 2xx)");

// 18) Detectado que el 005 no esta, no se repite el 404 en cada envio
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await new Promise(r => setTimeout(r, 50));
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
asertar(peticiones.length === 3, "sin el 005: el RPC no se vuelve a intentar (1 peticion por envio)");
asertar(/\/rest\/v1\/copero_ranking\?on_conflict=user_id$/.test(peticiones[2].url), "los envios siguientes van directo al upsert");

// 19) El error REAL de Supabase no queda oculto: un 400 de CHECK mantiene la
//     cola y el log trae code, mensaje, url y user_id (nunca el token).
const erroresConsola = [];
const consoleErrorOriginal = console.error;
console.error = function() { erroresConsola.push(Array.prototype.slice.call(arguments).join(" ")); };
respuestaPorUrl = () => ({
  ok: false, status: 400, statusText: "Bad Request",
  body: { code: "23514", message: 'new row for relation "copero_ranking" violates check constraint "copero_ranking_media_check"' }
});
storageStub.setItem("pso_ranking_outbox", JSON.stringify({
  _id: "cola-2", display_name: "TestBot", posicion: "DEL", club: "River Plate",
  media: 88, titulos: 3, anio: 2026, ts: "2026-09-22T11:00:00Z"
}));
peticiones.length = 0;
asertar(await vm.runInContext("vaciarOutbox();", sandbox) === false, "400 de la base: no se publica y NO se borra la cola");
console.error = consoleErrorOriginal;
const log = erroresConsola.join("\n");
asertar(!!storageStub.getItem("pso_ranking_outbox"), "400: la carrera sigue en la cola (no se pierde)");
asertar(log.indexOf("23514") !== -1, "400: el log muestra el code real de Supabase");
asertar(log.indexOf("check constraint") !== -1, "400: el log muestra el mensaje real de Supabase");
asertar(log.indexOf("copero_ranking") !== -1, "400: el log muestra la url del intento");
asertar(log.indexOf("user-1111") !== -1, "400: el log muestra el user_id autenticado");
asertar(log.indexOf("token-de-prueba") === -1, "400: el log NUNCA expone el token de sesion");

console.log(fallos === 0 ? "TODO OK" : ("CON " + fallos + " FALLOS"));
process.exit(fallos === 0 ? 0 : 1);

