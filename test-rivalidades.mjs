// ============================================================
//  Rivalidad de jugador (rival.js)
//  Verifica que el rival se sortee del catálogo correcto (misma
//  posición que el usuario), que evolucione temporada a temporada,
//  que el duelo se pueda jugar UNA vez por temporada con su propio
//  contador (sin tocar el de minijuegos) y que los premios se
//  apliquen según victoria / empate / derrota.
//  Ejecutar: node test-rivalidades.mjs
// ============================================================
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const leer = nombre => fs.readFileSync(new URL(nombre, import.meta.url), 'utf8');

const POSICIONES = ['DEL', 'CM', 'DEF', 'GK'];

// LCG determinista: el sorteo de rival, de club y la deriva de OVR
// son aleatorios, pero para el test interesa que sean reproducibles.
function crearAzar(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function nodo(id) {
  return {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    style: {},
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    addEventListener() {},
    querySelector: () => nodo('span'),
    setAttribute() {}
  };
}

let morphed = false;

function montar(semilla, posicion, nombreUsuario) {
  const nodos = {};
  const crear = id => (nodos[id] || (nodos[id] = nodo(id)));
  [
    'rival-card', 'rival-escudo', 'rival-nombre', 'rival-posicion', 'rival-club',
    'rival-stats', 'rival-media', 'rival-intensidad-texto', 'rival-intensidad-barra',
    'rival-historial', 'btn-duelo-rivalidad'
  ].forEach(crear);

  const math = Object.assign(Object.create(Math), { random: crearAzar(semilla) });

  const ctx = vm.createContext({
    console, Date, JSON, Object, Array, Set, String, Number, Boolean, math,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: {
      addEventListener() {},
      getElementById: id => nodos[id] || null,
      querySelectorAll: () => [],
      createElement: () => nodo('tmp'),
      body: { classList: { toggle() {} } }
    },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    window: null
  });
  vm.runInContext('globalThis.window = globalThis; globalThis.addEventListener = function() {};', ctx);

  vm.runInContext(leer('data.js'), ctx);
  // Stubs de la base: rival.js envuelve estas funciones al cargarse.
  vm.runInContext(`
    function mostrarNotificacion() {}
    function guardarPartida() {}
    function actualizarInterfaz() {}
    function t(clave) { return clave; }
    function sumarMedia(d) { jugador.media += d; }
    function ajustarMoral(d) { jugador.moral = (jugador.moral || 50) + d; }
    function mediaActual() { return jugador.media; }
    function clampMedia(v) { return Math.max(CONFIG.OVR_MIN, Math.min(CONFIG.OVR_MAX, v)); }
    function iniciarCarrera() { jugador = crearJugador(); }
    function continuarCarrera() {}
    function simularTemporada() { jugador.temporadaActual++; jugador.edad++; }
    function crearJugador() {
      return {
        nombre: "Prueba", posicion: "DEL", nacionalidad: "URU", edad: CONFIG.EDAD_INICIO,
        media: 65, moral: 50, dorsal: 10, atributos: null, clubActual: null,
        carreraTerminada: false, minijuegosUsadosEstaTemporada: 0, rivalidad: null,
        historialTemporadas: [], trofeos: {}
      };
    }
    globalThis.CFG = CONFIG;
    globalThis.CATALOGO_RIVAL = RIVALIDADES_PERSONAJES;
  `, ctx);
  vm.runInContext(leer('rival.js'), ctx);
  vm.runInContext('globalThis.jugador = crearJugador();', ctx);

  ctx.jugador.posicion = posicion;
  ctx.jugador.nombre = nombreUsuario;
  return ctx;
}

const cfg = ctx => ctx.CFG.RIVALIDAD;
let casos = 0;

// ---------- 1) El rival sale del catálogo de SU posición ----------
for (let semilla = 1; semilla <= 80; semilla++) {
  const posicion = POSICIONES[semilla % POSICIONES.length];
  const ctx = montar(semilla, posicion, "Prueba");
  const rival = ctx.sortearRivalidad();
  casos++;

  assert.ok(rival, 'semilla ' + semilla + ': debe sortear un rival');
  assert.equal(rival.posicion, posicion,
    'semilla ' + semilla + ': el rival debe ser de la misma posición (' + posicion + ')');

  const catalogo = ctx.CATALOGO_RIVAL[posicion];
  assert.ok(catalogo.includes(rival.nombre),
    'semilla ' + semilla + ': "' + rival.nombre + '" no está en RIVALIDADES_PERSONAJES.' + posicion);

  // Nunca puede ser el propio nombre del usuario.
  assert.notEqual(rival.nombre, "Prueba",
    'semilla ' + semilla + ': el rival no puede llamarse igual al usuario');

  // Arranca con OVR e intensidad dentro de los límites configurados.
  const cfgR = cfg(ctx);
  assert.ok(rival.media >= cfgR.OVR_MIN_INICIAL && rival.media <= cfgR.OVR_MAX_INICIAL,
    'semilla ' + semilla + ': OVR inicial ' + rival.media + ' fuera del rango configurado');
  assert.ok(rival.media >= ctx.CFG.OVR_MIN && rival.media <= ctx.CFG.OVR_MAX,
    'semilla ' + semilla + ': OVR inicial fuera de la escala del juego');
  assert.equal(rival.intensidad, cfgR.INTENSIDAD_INICIAL);
  assert.equal(rival.titulos, 0);
  // Arranca con los contadores de goles y asistencias en cero.
  assert.equal(rival.goles, 0);
  assert.equal(rival.asistencias, 0);
  assert.equal(rival.dueloUsadoTemporada, false);
  assert.ok(rival.clubNombre, 'el rival debe arrancar en un club');
  assert.ok(rival.edad >= ctx.CFG.EDAD_INICIO, 'edad del rival menor a la del usuario');
}

// ---------- 2) El rival EVOLUCIONA al simular temporada ----------
for (let semilla = 101; semilla <= 140; semilla++) {
  const ctx = montar(semilla, 'CM', 'Prueba');
  ctx.sortearRivalidad();
  casos++;

  const antes = JSON.parse(JSON.stringify(ctx.jugador.rivalidad));
  const edadAntes = antes.edad;
  const intensidadAntes = antes.intensidad;

  ctx.simularTemporada();

  const r = ctx.jugador.rivalidad;
  assert.equal(r.edad, edadAntes + 1, 'semilla ' + semilla + ': el rival debe envejecer 1 año');
  assert.notEqual(r.media, antes.media,
    'semilla ' + semilla + ': el rival debe cambiar de OVR al evolucionar');
  assert.ok(r.media >= ctx.CFG.OVR_MIN && r.media <= ctx.CFG.OVR_MAX,
    'semilla ' + semilla + ': OVR del rival ' + r.media + ' fuera de escala');

  // Sin duelo, la rivalidad se enfría 1 punto (piso: INTENSIDAD_MIN).
  assert.equal(r.intensidad, Math.max(cfg(ctx).INTENSIDAD_MIN, intensidadAntes - cfg(ctx).DECAIMIENTO_SIN_DUELO),
    'semilla ' + semilla + ': la rivalidad debe enfriarse si no hubo duelo');

  // El contador anual se reinicia para poder duelar de nuevo.
  assert.equal(r.dueloUsadoTemporada, false,
    'semilla ' + semilla + ': el duelo debe volver a estar disponible');

  // El minijuego NO se consume: el rival usa su propio contador.
  assert.equal(ctx.jugador.minijuegosUsadosEstaTemporada, 0,
    'semilla ' + semilla + ': el rivalidad no debe gastar el minijuego de la temporada');

  // Goles y asistencias: crecen con la temporada y nunca se resetan.
  assert.ok(r.goles >= antes.goles,
    'semilla ' + semilla + ': los goles del rival no pueden bajar de temporada a temporada');
  assert.ok(r.asistencias >= antes.asistencias,
    'semilla ' + semilla + ': las asistencias del rival no pueden bajar');
  assert.ok(r.goles > antes.goles || r.asistencias > antes.asistencias,
    'semilla ' + semilla + ': el rival debe anotar o asistir algo en una temporada');
  assert.ok(r.goles <= 5 * (antes.goles + 10) && Number.isFinite(r.goles),
    'semilla ' + semilla + ': goles del rival fuera de un rango razonable');

  // El declive por edad tiene que notar la diferencia.
  ctx.jugador.rivalidad.edad = 40;
  const antesVejez = ctx.jugador.rivalidad.media;
  ctx.evolucionarRivalidad();
  assert.ok(ctx.jugador.rivalidad.media <= antesVejez + 2,
    'semilla ' + semilla + ': un rival de 40 años no debe subir fuerte');
}

let decliveOk = false;
{
  // A los 40 años el rival nunca sube: tiene que promediar declive.
  const ctx = montar(777, 'DEF', 'Prueba');
  ctx.sortearRivalidad();
  ctx.jugador.rivalidad.edad = 45;
  let subiendo = 0;
  for (let i = 0; i < 40; i++) {
    const antes = ctx.jugador.rivalidad.media;
    ctx.evolucionarRivalidad();
    ctx.jugador.rivalidad.edad = 45;
    if (ctx.jugador.rivalidad.media > antes) subiendo++;
  }
  assert.equal(subiendo, 0, 'un rival veterano (45) no puede subir su OVR');
  decliveOk = true;
}

// ---------- 3) El DUELO: contador propio, 1 por temporada ----------
for (let semilla = 201; semilla <= 230; semilla++) {
  const ctx = montar(semilla, 'GK', 'Prueba');
  const rival = ctx.sortearRivalidad();
  casos++;

  assert.equal(ctx.rivalidadDueloDisponible(), true, 'semilla ' + semilla + ': el duelo arranca disponible');

  const objetivo = ctx.objetivoDueloRivalidad();
  const cfgR = cfg(ctx);
  assert.ok(objetivo >= cfgR.DUELO_OBJETIVO_MIN && objetivo <= cfgR.DUELO_OBJETIVO_MAX,
    'semilla ' + semilla + ': objetivo ' + objetivo + ' fuera de los límites configurados');

  // Victoria: muchos puntos.
  const resumen = ctx.registrarDueloRivalidad(cfgR.DUELO_OBJETIVO_MAX + 100);
  assert.equal(resumen.resultado, 'victoria', 'semilla ' + semilla + ': con muchos puntos tiene que ganar');
  assert.equal(rival.duelosGanados, 1);
  assert.equal(rival.duelosPerdidos, 0);
  assert.equal(rival.dueloUsadoTemporada, true);

  // La victoria sube OVR y moral del usuario.
  assert.equal(ctx.jugador.media, 65 + cfgR.OVR_VICTORIA,
    'semilla ' + semilla + ': la victoria debe dar +OVR');
  assert.equal(ctx.jugador.moral, 50 + cfgR.MORAL_VICTORIA,
    'semilla ' + semilla + ': la victoria debe dar +moral');

  // Una vez gastado, no se puede volver a jugar esta temporada.
  assert.equal(ctx.rivalidadDueloDisponible(), false,
    'semilla ' + semilla + ': el duelo debe quedar consumido');
  assert.equal(ctx.iniciarDueloRivalidad(), false,
    'semilla ' + semilla + ': no debe abrir un segundo duelo en la misma temporada');

  // Sigue AVAILABLE al simular la temporada siguiente.
  ctx.simularTemporada();
  assert.equal(ctx.rivalidadDueloDisponible(), true,
    'semilla ' + semilla + ': el duelo debe volver tras simular la temporada');
  assert.equal(ctx.jugador.minijuegosUsadosEstaTemporada, 0,
    'semilla ' + semilla + ': el rival no debe consumir el minijuego de la temporada');
}

// ---------- 4) Empate y derrota: premios e intensidad ----------
{
  const ctx = montar(555, 'DEL', 'Prueba');
  const rival = ctx.sortearRivalidad();
  const objetivo = ctx.objetivoDueloRivalidad();
  const margen = cfg(ctx).DUELO_MARGEN_EMPATE;
  casos++;

  const empate = ctx.registrarDueloRivalidad(objetivo);
  assert.equal(empate.resultado, 'empate', 'con exactamente el objetivo tiene que ser empate');
  assert.equal(rival.duelosEmpatados, 1);
  assert.equal(ctx.jugador.media, 65, 'el empate NO debe dar OVR');
  assert.equal(ctx.jugador.moral, 50 + cfg(ctx).MORAL_EMPATE);
  casos++;
}
{
  const ctx = montar(556, 'DEL', 'Prueba');
  const rival = ctx.sortearRivalidad();
  const objetivo = ctx.objetivoDueloRivalidad();
  const margen = cfg(ctx).DUELO_MARGEN_EMPATE;

  const derrota = ctx.registrarDueloRivalidad(objetivo - margen - 1);
  assert.equal(derrota.resultado, 'derrota', 'muy por debajo del objetivo tiene que ser derrota');
  assert.equal(rival.duelosPerdidos, 1);
  assert.equal(ctx.jugador.media, 65, 'la derrota NO debe dar OVR');
  assert.equal(ctx.jugador.moral, 50 + cfg(ctx).MORAL_DERROTA);
  assert.equal(rival.intensidad,
    Math.max(cfg(ctx).INTENSIDAD_MIN, cfg(ctx).INTENSIDAD_INICIAL + cfg(ctx).INTENSIDAD_DERROTA),
    'perder debe BAJAR la intensidad de la rivalidad');
}

// La intensidad nunca se sale de 1..10, ni ganando 20 duelos seguidos.
{
  const ctx = montar(999, 'DEL', 'Prueba');
  const rival = ctx.sortearRivalidad();
  for (let i = 0; i < 20; i++) {
    ctx.registrarDueloRivalidad(9999);
    rival.dueloUsadoTemporada = false;
  }
  assert.equal(rival.intensidad, cfg(ctx).INTENSIDAD_MAX,
    'ganando 20 duelos la intensidad debe quedar topeada en INTENSIDAD_MAX');
  ctx.jugador.media = 40;
  for (let i = 0; i < 20; i++) {
    rival.dueloUsadoTemporada = false;
    ctx.registrarDueloRivalidad(-1000);
  }
  assert.equal(rival.intensidad, cfg(ctx).INTENSIDAD_MIN,
    'perdiendo 20 duelos la intensidad debe quedar topeada en INTENSIDAD_MIN');
  casos++;
}

// ---------- 5) Migración de guardados viejos (sin rivalidad) ----------
{
  const ctx = montar(31337, 'CM', 'Prueba');
  ctx.jugador.rivalidad = null;
  casos++;
  const r = ctx.asegurarRivalidad();
  assert.ok(r && r.nombre, 'un guardado viejo debe recibir rival al continuar');
  assert.equal(r.posicion, 'CM');

  // Guardado con rivalidad a medio completar: se normaliza, no se rompe.
  ctx.jugador.rivalidad = { nombre: 'Cerbe', posicion: 'CM' };
  const norm = ctx.asegurarRivalidad();
  assert.equal(norm.intensidad, cfg(ctx).INTENSIDAD_INICIAL, 'intensidad ausente debe normalizarse');
  assert.equal(norm.duelosGanados, 0);
  assert.equal(norm.dueloUsadoTemporada, false, 'el flag anual ausente debe normalizarse');
  // Los contadores nuevos también se rellenan en un guardado a medio hacer.
  assert.equal(norm.goles, 0, 'goles ausentes deben normalizarse a 0');
  assert.equal(norm.asistencias, 0, 'asistencias ausentes deben normalizarse a 0');
  assert.equal(norm.titulos, 0);
  assert.ok(norm.partidos > 0, 'partidos ausentes deben normalizarse');
}

// ---------- 6) La intensidad sube con cada victoria ----------
{
  const ctx = montar(4242, 'DEF', 'Prueba');
  const rival = ctx.sortearRivalidad();
  rival.intensidad = 3;
  ctx.registrarDueloRivalidad(9999);
  assert.equal(rival.intensidad, 3 + cfg(ctx).INTENSIDAD_VICTORIA,
    'ganar debe subir la intensidad');
  casos++;
}

assert.ok(decliveOk);

console.log('TODO OK: Rivalidad sortea de RIVALIDADES_PERSONAJES por posición, ' +
  'evoluciona por temporada y el Duelo de Rivalidad jugable 1 vez por temporada ' +
  'con su propio contador y premios correctos (' + casos + ' casos).');