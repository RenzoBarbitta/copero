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

const sandbox = {
  console, Date, JSON, Math, Promise, setTimeout, clearTimeout, AbortController,
  localStorage: storageStub,
  document: { addEventListener() {}, getElementById: () => null, visibilityState: "visible" },
  window: { addEventListener() {}, dispatchEvent() {} },
  navigator: { onLine: true },
  location: { protocol: "https:", hostname: "test" },
  setInterval: () => 0,
  clearInterval() {},
  fetch: async (url, opts) => {
    peticiones.push({ url: String(url), opts: opts || {} });
    if (respuesta.error) throw respuesta.error;
    return {
      ok: respuesta.ok, status: respuesta.status,
      json: async () => respuesta.body,
      text: async () => JSON.stringify(respuesta.body)
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

// 2) Con sesion: vaciarOutbox hace el upsert seguro
sesionActiva = true;
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
asertar(peticiones.length === 1, "con sesion: se hace exactamente 1 peticion");
const envio = peticiones[0];
asertar(/\/rest\/v1\/copero_ranking/.test(envio.url), "la peticion apunta a copero_ranking");
asertar(envio.opts.method === "POST", "la publicacion usa POST (upsert)");
asertar(envio.opts.headers && envio.opts.headers.Prefer === "resolution=merge-duplicates", "usa Prefer: merge-duplicates (una entrada por cuenta)");
asertar(envio.opts.headers.apikey === "clave-publica-test", "envia la clave publishable");
asertar(envio.opts.headers.Authorization === "Bearer token-de-prueba", "envia el token de sesion");
const cuerpo = JSON.parse(envio.opts.body);
asertar(cuerpo.user_id === "user-1111", "el upsert va SIEMPRE a la fila del usuario en sesion");
asertar(cuerpo.display_name === "TestBot", "display_name correcto");
asertar(cuerpo.media === 88 && cuerpo.titulos === 3, "media 88 y titulos 3 (2 liga + 1 copa)");
asertar(!storageStub.getItem("pso_ranking_outbox"), "enviado: la cola queda vacia");

// 3) Defensa anti-media-trampa: el cliente acota la media a 0..99
vm.runInContext("jugador.media = 999;", sandbox);
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await new Promise(r => setTimeout(r, 50)); // el envio fire-and-forget termina
await vm.runInContext("vaciarOutbox();", sandbox);
await new Promise(r => setTimeout(r, 50));
const cuerpo2 = JSON.parse(peticiones[peticiones.length - 1].opts.body);
asertar(cuerpo2.media === 99, "media 999 se acota a 99 en el cliente (y la base lo rechazaria igual)");

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

console.log(fallos === 0 ? "TODO OK" : ("CON " + fallos + " FALLOS"));
process.exit(fallos === 0 ? 0 : 1);

