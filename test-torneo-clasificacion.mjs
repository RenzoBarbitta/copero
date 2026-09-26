// ============================================================
// test-torneo-clasificacion.mjs - La selección que gana los 3 de
// grupos tiene que clasificar, y su ronda eliminatoria se tiene que
// completar al jugar (no quedar en null y eliminar al jugador).
// Reproduce el bug reportado: "ganás los 3 de la fase de grupos e igual
// quedás afuera del Mundial".
//   - registrarResultadoTorneo completa la fila del placeholder, no agrega
//     una segunda, y la tabla del grupo ve los 3 partidos.
//   - El marcador de la ronda eliminatoria se escribe en estado.ronda.
//   - Un ganador de los 3 de grupos entra en la ronda siguiente y puede
//     seguir avanzando hasta campeon.
//   - Un equipo que pierde los 3 queda eliminado (y no por un bug).
//   - El nombre de la ronda sale de la cantidad de equipos, no de la de grupos.
// Ejecutar: node test-torneo-clasificacion.mjs
// ============================================================
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

// Extrae el cuerpo real de una funcion de app.js: el test corre la logica que
// se toco, no una reimplementacion. Si la funcion no existe devuelve un cuerpo
// vacio (asi el test puede seguir y fallar por el bug, no por la extraccion).
function cuerpo(nombre) {
  const src = read('app.js');
  const ini = src.indexOf('function ' + nombre + '(');
  if (ini < 0) return '';
  const llave = src.indexOf('{', src.indexOf(')', ini));
  let profundidad = 0, i = llave;
  for (; i < src.length; i++) {
    if (src[i] === '{') profundidad++;
    else if (src[i] === '}') { profundidad--; if (profundidad === 0) break; }
  }
  return src.slice(llave + 1, i);
}

const CUERPOS = {
  registrarResultadoTorneo: cuerpo('registrarResultadoTorneo'),
  equipoAvanzado: cuerpo('equipoAvanzado'),
  nombreRondaPorCantidad: cuerpo('nombreRondaPorCantidad'),
  convertirVivosEnRonda: cuerpo('convertirVivosEnRonda'),
  siguientePendienteTorneo: cuerpo('siguientePendienteTorneo'),
  tablarClasificadosTorneo: cuerpo('tablarClasificadosTorneo'),
  continuarTorneoSeleccion: cuerpo('continuarTorneoSeleccion'),
  crearTorneoSeleccion: cuerpo('crearTorneoSeleccion'),
  cerrarTorneoSeleccion: cuerpo('cerrarTorneoSeleccion')
};

function montar(semilla) {
  let s = semilla >>> 0;
  const math = Object.assign(Object.create(Math), {
    random: () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
  });
  const ctx = vm.createContext({
    console, Date, JSON, Object, Array, Set, String, Number, Boolean, math,
    localStorage: { getItem: () => null, setItem() {} },
    document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [] }
  });
  vm.runInContext(read('data.js'), ctx);
  vm.runInContext(`
    function mostrarNotificacion() {}
    function rivalFinalissima() { return "BRA"; }
    globalThis.jugador = {
      nacionalidad: "URU", posicion: "DEL", moral: 50, clubActual: null,
      golesSeleccion: 0, tituloInternacional: null, tituloContinental: null, trofeos: {}
    };
    function simularPartidoSeleccion(a, b) { return { golesA: 1, golesB: 0 }; }
    function registrarResultadoTorneo(ga, gb, golesJugador) {${CUERPOS.registrarResultadoTorneo}}
    function equipoAvanzado(m) {${CUERPOS.equipoAvanzado}}
    function nombreRondaPorCantidad(cant) {${CUERPOS.nombreRondaPorCantidad}}
    function convertirVivosEnRonda(estado, vivos, nombreRonda) {${CUERPOS.convertirVivosEnRonda}}
    function siguientePendienteTorneo() {${CUERPOS.siguientePendienteTorneo}}
    function tablarClasificadosTorneo() {${CUERPOS.tablarClasificadosTorneo}}
    function continuarTorneoSeleccion() {${CUERPOS.continuarTorneoSeleccion}}
    function crearTorneoSeleccion(tipo) {${CUERPOS.crearTorneoSeleccion}}
    function cerrarTorneoSeleccion() {${CUERPOS.cerrarTorneoSeleccion}}
  `, ctx);
  return ctx;
}

let casos = 0;

// ---------- 1. Ganar los 3 de grupos clasifica (el bug reportado) ----------
for (let semilla = 1; semilla <= 40; semilla++) {
  const ctx = montar(semilla);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  assert.equal(est.pendientes.length, 3, '3 partidos de grupos pendientes');

  // Gana los 3 por goleada.
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(5, 0, 2);
  ctx.continuarTorneoSeleccion();

  assert.equal(est.jugados, 3, '3 partidos jugados');
  assert.equal(est.ganados, 3, '3 victorias');
  const mios = ctx.tablaGrupo(
    ctx.jugador.internacional.grupos.find(g => g.letra === est.grupoJugador).equipos,
    est.resultados
  ).find(x => x.codigo === 'URU');
  assert.equal(mios.pj, 3, `semilla ${semilla}: la tabla debe contar los 3 partidos (pj=${mios && mios.pj})`);
  assert.equal(mios.pts, 9, `semilla ${semilla}: 9 puntos con 3 victorias`);
  assert.ok(ctx.tablarClasificadosTorneo().includes('URU'),
    `semilla ${semilla}: ganar los 3 de grupos tiene que clasificar`);
  assert.equal(est.terminado, false, `semilla ${semilla}: no puede quedar eliminado en grupos`);
  casos++;
}

// ---------- 2. El marcador de la ronda eliminatoria se completa al jugar ----------
{
  const ctx = montar(7);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(5, 0, 2);
  ctx.continuarTorneoSeleccion();

  assert.equal(est.fase, 'octavos', 'clasificado arranca en octavos');
  const mio = est.ronda.find(m => m.a === 'URU' || m.b === 'URU');
  assert.ok(mio, 'el jugador tiene que tener partido en la ronda');
  assert.equal(mio.ga, null, 'la ronda arranca sin jugar');

  // Ganar el partido de la ronda: el marcador tiene que quedar en estado.ronda.
  ctx.registrarResultadoTorneo(3, 1, 1);
  assert.notEqual(mio.ga, null, 'el marcador de la ronda debe quedar registrado');
  assert.equal(mio.ga, 3);
  assert.equal(mio.gb, 1);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.terminado, false, 'ganar en octavos no puede eliminar al jugador');
  casos++;
}

// ---------- 3. Se puede llegar a campeon jugando los partidos del jugador ----------
{
  const ctx = montar(11);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  let partidos = 0;
  while (!est.terminado && partidos < 20) {
    if (est.pendientes.length === 0) { ctx.continuarTorneoSeleccion(); continue; }
    ctx.registrarResultadoTorneo(4, 0, 2);
    ctx.continuarTorneoSeleccion();
    partidos++;
  }
  assert.equal(est.campeon, true, 'ganando todos los partidos del jugador hay que ser campeon');
  assert.equal(est.vivo, true);
  casos++;
}

// ---------- 4. Perder los 3 de grupos elimina (el caso inverso) ----------
{
  const ctx = montar(3);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(0, 4, 0);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.vivo, false, 'perder los 3 de grupos elimina');
  assert.equal(est.terminado, true);
  casos++;
}

// ---------- 5. La ronda se nombra por equipos, no por grupos ----------
{
  const ctx = montar(1);
  assert.equal(ctx.nombreRondaPorCantidad(16), 'octavos', '16 equipos -> octavos');
  assert.equal(ctx.nombreRondaPorCantidad(8), 'octavos', '8 equipos -> octavos (no cuartos)');
  assert.equal(ctx.nombreRondaPorCantidad(4), 'cuartos');
  assert.equal(ctx.nombreRondaPorCantidad(2), 'semis');
  casos++;
}

// ---------- 6. Un torneo continental de 8 equipos arranca en octavos ----------
{
  const ctx = montar(5);
  ctx.crearTorneoSeleccion('copaAmerica');
  const est = ctx.jugador.internacional;
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(5, 0, 2);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.fase, 'octavos', '4 grupos x 2 = 8 equipos -> octavos');
  assert.equal(est.vivos.length, 8);
  casos++;
}

// ---------- 7. La Finalissima (un solo partido) decide el campeon ----------
{
  const ctx = montar(9);
  ctx.crearTorneoSeleccion('finalissima');
  const est = ctx.jugador.internacional;
  ctx.registrarResultadoTorneo(2, 0, 1);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.campeon, true, 'ganar la Finalissima da el titulo');
  casos++;
}

console.log(`TODO OK: ganar los 3 de grupos clasifica y la ronda eliminatoria no elimina al jugador (${casos} casos).`);
