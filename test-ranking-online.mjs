// ============================================================
//  TEST DE HUMO: ranking online contra la nube real (textdb.dev)
//  Ejecuta ranking-online.js en una sandbox con stubs minimos y
//  prueba: envio, reemplazo por dispositivo, orden, escape XSS,
//  lectura con cache y tolerancia a datos corruptos.
//  Uso: node test-ranking-online.mjs
// ============================================================
import fs from "node:fs";
import vm from "node:vm";

let URL_ALMACEN_TEST = ""; // se setea al cargar el codigo con el id desechable

let fallos = 0;
function asertar(cond, msg) {
  if (!cond) { console.error("FALLO: " + msg); fallos++; }
  else console.log("OK  " + msg);
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function leerNube() {
  const res = await fetch(URL_ALMACEN_TEST, { cache: "no-store" });
  const texto = await res.text();
  try {
    const d = JSON.parse(texto);
    return Array.isArray(d) ? d : (Array.isArray(d.jugadores) ? d.jugadores : []);
  } catch { return []; }
}

async function resetearNube() {
  const res = await fetch(URL_ALMACEN_TEST, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ jugadores: [] })
  });
  asertar(res.ok, "POST inicial a la nube (reset) -> HTTP " + res.status);
}

// ---------------- sandbox ----------------
const store = new Map();
const storageStub = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: (k) => { store.delete(k); }
};

const sandbox = {
  console, fetch, Date, JSON, Math, Promise, setTimeout, clearTimeout, AbortController,
  localStorage: storageStub,
  document: { addEventListener() {}, getElementById: () => null, visibilityState: "visible" },
  window: { addEventListener() {}, dispatchEvent() {} },
  navigator: { onLine: true, maxTouchPoints: 0 },
  location: { protocol: "file:", hostname: "" },
  setInterval: () => 0,
  clearInterval() {}
};
vm.createContext(sandbox);

// Stub de las funciones globales que features.js define en el navegador
vm.runInContext("function guardarEnRanking() {}; function mostrarRanking() {};", sandbox);

const codigo = fs.readFileSync("ranking-online.js", "utf8");

// El test usa su PROPIO almacen desechable (nunca toca el ranking real)
const idTest = crypto.randomUUID();
const codigoTest = codigo.replace(
  "https://textdb.dev/api/data/4777662b-82ad-481a-b548-4c999ebcddbc",
  "https://textdb.dev/api/data/" + idTest
);
URL_ALMACEN_TEST = "https://textdb.dev/api/data/" + idTest;
console.log("Almacen de prueba: " + idTest);

vm.runInContext(codigoTest, sandbox, { filename: "ranking-online.js" });
console.log("ranking-online.js cargado en sandbox");

vm.runInContext(
  "var jugador = { nombre: 'TestBot', posicion: 'DEL', media: 88, trofeos: { primeraDivision: 2, copaDeCampeones: 1 }, clubActual: { nombre: 'River Plate' } };" +
  "var guardarPartida = function() {};",
  sandbox
);

await resetearNube();
await dormir(800);

// 1) Primera carrera -> se envia a la nube
vm.runInContext("intentarEnviarRankingOnline();", sandbox);
await dormir(2500);
let nube = await leerNube();
asertar(nube.length === 1, "1ra carrera: la nube tiene 1 registro (tiene " + nube.length + ")");
asertar(nube[0] && nube[0].nombre === "TestBot" && nube[0].media === 88, "registro con nombre y media correctos");
asertar(nube[0] && nube[0].titulos === 3, "titulos calculados = 3 (2 liga + 1 copa)");
asertar(nube[0] && !!nube[0].dev && !!nube[0].id, "registro tiene id y dev");

// 2) Segunda carrera en el MISMO dispositivo -> reemplaza, no duplica
vm.runInContext("jugador.rankingId = null; jugador.media = 91; intentarEnviarRankingOnline();", sandbox);
await dormir(2500);
nube = await leerNube();
asertar(nube.length === 1, "2da carrera mismo dispositivo: sigue habiendo 1 registro (tiene " + nube.length + ")");
asertar(nube[0] && nube[0].media === 91, "registro actualizado a media 91");

// 3) Otro dispositivo con menor media -> orden descendente
vm.runInContext(
  "var registroOtro = construirRegistroRanking({ nombre: 'OtroJugador', posicion: 'GK', media: 80, trofeos: { primeraDivision: 1 }, clubActual: { nombre: 'Boca Juniors' } });" +
  "registroOtro.dev = 'dev-otro-dispositivo'; registroOtro.id = 'id-otro-dispositivo';" +
  "var listaNube = " + JSON.stringify(nube) + ";",
  sandbox
);
await vm.runInContext("escribirAlmacen(mezclarRanking(listaNube, registroOtro));", sandbox);
await dormir(1500);
nube = await leerNube();
asertar(nube.length === 2, "otro dispositivo: la nube tiene 2 registros (tiene " + nube.length + ")");
asertar(nube[0] && nube[0].nombre === "TestBot" && nube[1] && nube[1].nombre === "OtroJugador", "orden por media descendente (91 antes que 80)");

// 4) Escape XSS en nombres
const escapado = vm.runInContext("escaparHtml('<img src=x onerror=alert(1)>')", sandbox);
asertar(escapado.indexOf("<img") === -1 && escapado.indexOf("&lt;img") !== -1, "escaparHtml neutraliza HTML malicioso");

// 5) Lectura online (sin cache, forzada)
const listaObtenida = await vm.runInContext("obtenerRankingOnline(true)", sandbox);
asertar(Array.isArray(listaObtenida) && listaObtenida.length === 2, "obtenerRankingOnline(true) devuelve la lista completa");

// 6) Tolerancia a datos corruptos
const corrupta = vm.runInContext("normalizarDatosNube('esto no es json {{{')", sandbox);
asertar(Array.isArray(corrupta) && corrupta.length === 0, "normalizarDatosNube devuelve [] con datos corruptos");

// Dejar la nube limpia para produccion
await resetearNube();
console.log(fallos === 0 ? "TODO OK" : ("CON " + fallos + " FALLOS"));
process.exit(fallos === 0 ? 0 : 1);
