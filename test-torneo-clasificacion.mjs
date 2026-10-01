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
  cerrarPartidoTorneo: cuerpo('cerrarPartidoTorneo'),
  cerrarTandaTorneoDelJugador: cuerpo('cerrarTandaTorneoDelJugador'),
  buscarCruceTorneo: cuerpo('buscarCruceTorneo'),
  equipoAvanzado: cuerpo('equipoAvanzado'),
  esFaseEliminatoria: cuerpo('esFaseEliminatoria'),
  avanzaElJugadorEnRonda: cuerpo('avanzaElJugadorEnRonda'),
  planRondasEliminatorias: cuerpo('planRondasEliminatorias'),
  convertirVivosEnRonda: cuerpo('convertirVivosEnRonda'),
  siguientePendienteTorneo: cuerpo('siguientePendienteTorneo'),
  tablarClasificadosTorneo: cuerpo('tablarClasificadosTorneo'),
  continuarTorneoSeleccion: cuerpo('continuarTorneoSeleccion'),
  crearTorneoSeleccion: cuerpo('crearTorneoSeleccion'),
  cerrarTorneoSeleccion: cuerpo('cerrarTorneoSeleccion'),
  crearAmistosoSeleccion: cuerpo('crearAmistosoSeleccion'),
  cerrarAmistosoSeleccion: cuerpo('cerrarAmistosoSeleccion'),
  rivalAmistoso: cuerpo('rivalAmistoso')
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
    function guardarPartida() {}
    function mostrarTrasPartidoTorneo() {}
    let estadoTandaPenales = null;
    // Puente para el test: la variable de modulo es privada al script.
    function __setTanda(v) { estadoTandaPenales = v; }
    function __getTanda() { return estadoTandaPenales; }
    function rivalFinalissima() { return "BRA"; }
    globalThis.jugador = {
      nacionalidad: "URU", posicion: "DEL", moral: 50, clubActual: null,
      golesSeleccion: 0, tituloInternacional: null, tituloContinental: null, trofeos: {}
    };
    function simularPartidoSeleccion(a, b) { return { golesA: 1, golesB: 0 }; }
    function rivalAmistoso() {${CUERPOS.rivalAmistoso}}
    function rnd() { return Math.random(); }
    function mediaActual() { return 75; }
    // La tanda de penales del cruce del jugador es el unico punto donde el
    // test NO decide: se fuerza el marcador para poder verificar cada rama.
    function resolverPenalesTorneo() { return null; }
    function tandaSimulada() { return { a: 3, b: 1 }; }
    function registrarResultadoTorneo(ga, gb, golesJugador, jugado) {${CUERPOS.registrarResultadoTorneo}}
    function cerrarPartidoTorneo(p, ga, gb, golesJugador) {${CUERPOS.cerrarPartidoTorneo}}
    function cerrarTandaTorneoDelJugador() {${CUERPOS.cerrarTandaTorneoDelJugador}}
    function buscarCruceTorneo(estado, p) {${CUERPOS.buscarCruceTorneo}}
    function equipoAvanzado(m) {${CUERPOS.equipoAvanzado}}
    function esFaseEliminatoria(estado) {${CUERPOS.esFaseEliminatoria}}
    function avanzaElJugadorEnRonda(estado) {${CUERPOS.avanzaElJugadorEnRonda}}
    function planRondasEliminatorias(cant) {${CUERPOS.planRondasEliminatorias}}
    function convertirVivosEnRonda(estado, vivos, nombreRonda) {${CUERPOS.convertirVivosEnRonda}}
    function siguientePendienteTorneo() {${CUERPOS.siguientePendienteTorneo}}
    function tablarClasificadosTorneo() {${CUERPOS.tablarClasificadosTorneo}}
    function continuarTorneoSeleccion() {${CUERPOS.continuarTorneoSeleccion}}
    function crearAmistosoSeleccion() {${CUERPOS.crearAmistosoSeleccion}}
    function cerrarAmistosoSeleccion() {${CUERPOS.cerrarAmistosoSeleccion}}
    function crearTorneoSeleccion(tipo) {
      if (tipo === "amistoso") return crearAmistosoSeleccion();
      if (tipo === "finalissima") {
        const rival = rivalFinalissima();
        jugador.internacional = {
          tipo: "finalissima", seleccion: "URU", grupoJugador: "F", fase: "final",
          faseNombre: "torneoFaseFinal",
          pendientes: [{ a: "URU", b: rival }], resultados: [],
          ronda: [{ a: "URU", b: rival, ga: null, gb: null }], rondas: [],
          vivos: ["URU", rival], vivo: true, campeon: false, terminado: false,
          ganados: 0, jugados: 0
        };
        return jugador.internacional;
      }
      ${CUERPOS.crearTorneoSeleccion}
    }
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

// ---------- 5. El cuadro SIEMPRE termina en final ----------
// El bug reportado: con 4 clasificados la ronda se llamaba "cuartos" y el
// siguiente cruce "semis"; al ganar la semi quedaban 1 vivo = campeon, sin
// jugar nunca una final.
{
  const ctx = montar(1);
  const plan = n => [...ctx.planRondasEliminatorias(n)];
  assert.deepEqual(plan(16), ['octavos', 'cuartos', 'semis', 'final'],
    '16 equipos: octavos, cuartos, semis y final');
  assert.deepEqual(plan(8), ['cuartos', 'semis', 'final'],
    '8 equipos: cuartos, semis y final');
  assert.deepEqual(plan(4), ['semis', 'final'],
    '4 equipos: SEMIFINAL Y FINAL (ganar la semi no es ser campeon)');
  assert.deepEqual(plan(2), ['final'],
    '2 equipos: directo a final');
  for (const n of [2, 4, 8, 16, 32]) {
    const plan = ctx.planRondasEliminatorias(n);
    assert.equal(plan[plan.length - 1], 'final', n + ' equipos: el cuadro debe terminar en final');
  }
  casos++;
}

// Ganar la semifinal NO da el título: hay que jugar la final.
{
  const ctx = montar(21);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  // Avanza ronda por ronda hasta quedarse en la semifinal.
  for (let ronda = 0; ronda < 10 && !est.terminado && est.fase !== 'semis'; ronda++) {
    while (est.pendientes.length) ctx.registrarResultadoTorneo(3, 0, 1);
    ctx.continuarTorneoSeleccion();
  }
  assert.equal(est.fase, 'semis', 'llegó a la semifinal, no a la final');
  assert.equal(est.campeon, false, 'todavía no es campeon');

  // Gana la semifinal: avanza, pero NO es campeon.
  while (est.pendientes.length) ctx.registrarResultadoTorneo(2, 1, 1);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.campeon, false,
    'ganar la semifinal NO puede dar el título: falta la final');
  assert.equal(est.terminado, false, 'sigue vivo para la final');
  assert.equal(est.fase, 'final', 'después de la semifinal se juega la final');
  assert.equal(est.pendientes.length, 1, 'la final tiene un partido pendiente');

  // Gana la final: ahí sí, campeón.
  ctx.registrarResultadoTorneo(1, 0, 1);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.campeon, true, 'ganar la final da el título');
  casos++;
}

// Un empate en eliminatorias NO elimina: define la tanda.
{
  const ctx = montar(23);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(5, 0, 2);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.fase, 'octavos');

  // Empate en octavos.
  ctx.registrarResultadoTorneo(1, 1, 0);
  // El test no simula la tanda: se comprueba que quedó empateado y que el
  // marcador sigue siendo 1-1 (no se "resuelve" por azar como antes).
  const mio = est.ronda.find(m => m.a === 'URU' || m.b === 'URU');
  assert.equal(mio.ga, 1);
  assert.equal(mio.gb, 1);
  assert.equal(mio.penales, undefined,
    'sin tanda resuelta el cruce no puede declararse para nadie');
  assert.equal(ctx.equipoAvanzado(mio), null,
    'un empate sin tanda no puede hacer avanzar a un equipo al azar');
  casos++;
}

// Con la tanda definida, el ganador de la tanda avanza (nunca por azar).
{
  const ctx = montar(24);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(5, 0, 2);
  ctx.continuarTorneoSeleccion();
  const mio = est.ronda.find(m => m.a === 'URU' || m.b === 'URU');
  ctx.registrarResultadoTorneo(2, 2, 0);
  mio.penales = mio.a === 'URU' ? { a: 4, b: 3 } : { a: 3, b: 4 };
  assert.equal(ctx.equipoAvanzado(mio), 'URU',
    'ganar la tanda hace avanzar al jugador aunque el partido fuera empate');
  casos++;
}

// Los empates de grupos NO van a penal (ahí puede quedar empate tranquilo).
{
  const ctx = montar(25);
  assert.equal(ctx.esFaseEliminatoria({ fase: 'grupos' }), false,
    'en grupos no hay tanda de penales');
  assert.equal(ctx.esFaseEliminatoria({ tipo: 'amistoso', fase: 'amistoso' }), false,
    'en un amistoso no hay tanda de penales');
  for (const f of ['octavos', 'cuartos', 'semis', 'final']) {
    assert.equal(ctx.esFaseEliminatoria({ fase: f }), true, f + ' sí tiene tanda de penales');
  }
  casos++;
}

// ---------- 6. Un torneo continental de 8 equipos arranca en cuartos ----------
{
  const ctx = montar(5);
  ctx.crearTorneoSeleccion('copaAmerica');
  const est = ctx.jugador.internacional;
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(5, 0, 2);
  ctx.continuarTorneoSeleccion();
  // 4 grupos x 2 clasifican = 8 equipos: la primera ronda eliminatoria son
  // CUARTOS (llamarla "octavos" con 8 equipos era una de las confusiones
  // que hacía que gaining la semi pareciera darte el título).
  assert.equal(est.fase, 'cuartos', '4 grupos x 2 = 8 equipos -> cuartos');
  assert.equal(est.vivos.length, 8);
  assert.deepEqual([...est.rondas], ['cuartos', 'semis', 'final'],
    'con 8 equipos: cuartos, semis y final');
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

// ---------- 8. El amistoso: un partido, sin cuadro, sin eliminacion ----------
{
  const ctx = montar(31);
  ctx.crearTorneoSeleccion('amistoso');
  const est = ctx.jugador.internacional;
  assert.ok(est, 'el amistoso tiene que crearse');
  assert.equal(est.tipo, 'amistoso');
  assert.equal(est.fase, 'amistoso');
  assert.equal(est.grupos, null, 'un amistoso no tiene grupos');
  assert.equal(est.pendientes.length, 1, 'es un solo partido');
  assert.equal(est.ronda.length, 1);
  assert.notEqual(est.pendientes[0].a, est.pendientes[0].b, 'el rival no es tu propia seleccion');
  assert.notEqual(est.pendientes[0].b, 'URU', 'el rival no puede ser tu seleccion');

  // Empatar en un amistoso NO va a penal ni elimina.
  const moralAntes = ctx.jugador.moral;
  ctx.registrarResultadoTorneo(1, 1, 0);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.terminado, true, 'el amistoso se termina al jugarlo');
  assert.equal(est.vivo, true, 'un empate en amistoso no elimina a nadie');
  assert.equal(est.campeon, false, 'un amistoso no da título');
  assert.equal(est.ronda[0].penales, undefined, 'el amistoso no tiene tanda de penales');
  assert.equal(ctx.jugador.moral, moralAntes, 'un empate en amistoso no sube ni baja la moral');
  casos++;
}

// ---------- 9. El amistoso no otorga trofeo ----------
{
  const ctx = montar(32);
  ctx.crearTorneoSeleccion('amistoso');
  const est = ctx.jugador.internacional;
  ctx.registrarResultadoTorneo(3, 0, 2);
  ctx.continuarTorneoSeleccion();
  ctx.cerrarTorneoSeleccion();
  ctx.cerrarAmistosoSeleccion();
  const total = Object.values(ctx.jugador.trofeos).reduce((a, b) => a + (b || 0), 0);
  assert.equal(total, 0, 'ganar un amistoso NO puede sumar trofeos');
  assert.equal(ctx.jugador.tituloInternacional, null,
    'el amistoso no registra titulo internacional');
  casos++;
}

// ---------- 10. El Mundial con 32 equipos hace 4 rondas hasta el título ----------
{
  const ctx = montar(33);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(5, 0, 2);
  ctx.continuarTorneoSeleccion();
  assert.equal(est.fase, 'octavos', '32 equipos y 8 grupos x 2 = 16 en octavos');
  assert.deepEqual([...est.rondas], ['octavos', 'cuartos', 'semis', 'final']);

  // Caminar todas las rondas: la última tiene que ser la final.
  const fases = [];
  let partidos = 0;
  while (!est.terminado && partidos < 40) {
    while (est.pendientes.length && partidos < 40) {
      ctx.registrarResultadoTorneo(2, 0, 1);
      partidos++;
    }
    ctx.continuarTorneoSeleccion();
    if (!est.terminado) fases.push(est.fase);
  }
  assert.equal(est.campeon, true, 'ganando todo hay que ser campeon del Mundial');
  assert.deepEqual(fases, ['cuartos', 'semis', 'final'],
    'el cuadro del Mundial pasa por cuartos, semis y final (nunca campeon en semis)');
  casos++;
}

// ---------- 11. Con la tanda resuelta en el acto, el partido se registra
// una sola vez y sin perder moral ----------
{
  const ctx = montar(41);
  ctx.crearTorneoSeleccion('mundial');
  const est = ctx.jugador.internacional;
  for (let i = 0; i < 3; i++) ctx.registrarResultadoTorneo(5, 0, 2);
  ctx.continuarTorneoSeleccion();

  const pendientesAntes = est.pendientes.length;
  const jugadosAntes = est.jugados;
  const moralAntes = ctx.jugador.moral;
  ctx.registrarResultadoTorneo(2, 2, 0);
  assert.equal(est.tandaPendiente, false,
    'con la tanda resuelta en el acto el partido se registra normal');
  assert.equal(est.pendientes.length, pendientesAntes - 1, 'el pendiente se saca 1 vez');
  assert.equal(est.jugados, jugadosAntes + 1);
  casos++;
}

// El partido empatado con el jugador tiene que quedar ABIERTO si el minijuego
// de la tanda sigue en pantalla, y cerrarse UNA sola vez cuando termina.
{
  const ctx = montar(42);
  // Estado de torneo del jugador parado en la tanda de octavos.
  ctx.jugador.internacional = {
    tipo: 'mundial', nombre: 'Mundial', fase: 'octavos', ronda: [
      { a: 'URU', b: 'BRA', ga: null, gb: null }
    ], pendientes: [{ a: 'URU', b: 'BRA' }], grupos: [], resultados: [], vivos: [],
    rondas: ['octavos', 'cuartos', 'semis', 'final'], jugados: 0, ganados: 0
  };
  // El minijudio de pateo quedó abierto: resolverPenalesTorneo no resuelve nada.
  ctx.resolverPenalesTorneo = function () {
    ctx.jugador.internacional.tandaPendiente = true;
    return null;
  };

  const est = ctx.jugador.internacional;
  ctx.registrarResultadoTorneo(1, 1, 0);
  assert.equal(est.pendientes.length, 1, 'con la tanda abierta el partido NO se cierra');
  assert.equal(est.jugados, 0, 'no se cuenta como jugado mientras se patea');
  assert.equal(est.ronda[0].ga, 1, 'el 1-1 ya quedó anotado');
  assert.equal(est.ronda[0].penales, undefined, 'la tanda todavía no está definida');

  // Termina la tanda: acá sí se registra el partido.
  ctx.__setTanda({ mios: 5, rival: 3 });
  const cerrada = ctx.cerrarTandaTorneoDelJugador();
  assert.equal(cerrada, true, 'al terminar la tanda se registra el partido');
  assert.equal(est.tandaPendiente, false, 'la tanda queda cerrada');
  assert.equal(est.pendientes.length, 0, 'el pendiente se saca recién al terminar');
  assert.equal(est.jugados, 1, 'el partido se cuenta una sola vez');
  assert.equal(est.ronda[0].penales.a, 5);
  assert.equal(est.ronda[0].penales.b, 3);
  assert.equal(ctx.equipoAvanzado(est.ronda[0]), 'URU', 'ganar la tanda clasifica');
  casos++;
}

console.log(`TODO OK: ganar los 3 de grupos clasifica, el cuadro termina en final, ` +
  `el empate va a penal y el amistoso no elimina (${casos} casos).`);
