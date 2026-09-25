// Modo Leal (features.js): al arrancar la carrera debe respetar la selección
// elegida en el panel de nacionalidad, generar los atributos iniciales (OVR
// coherente) y sincronizar la división con el club sorteado.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

const POSICIONES = ['DEL', 'CM', 'DEF', 'GK'];
const NACIONALIDADES = ['ARG', 'BRA', 'URU', 'ESP', 'JPN', 'MAR', 'KOR', 'USA', 'SEN', 'MEX'];

// LCG determinista: el sorteo de club, el chance de promesa y la variación de
// los atributos son aleatorios, pero para el test interesa que sea reproducible.
function crearAzar(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function nodo(id, valor) {
  return {
    id,
    value: valor || '',
    textContent: '',
    innerHTML: '',
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    addEventListener() {}, appendChild() {}, setAttribute() {}
  };
}

function montar(semilla, posicion, codigoNac) {
  const nodos = {
    'input-nombre': nodo('input-nombre', 'Prueba Leal'),
    'select-posicion': nodo('select-posicion', posicion),
    'select-nacionalidad': nodo('select-nacionalidad', codigoNac),
    'pantalla-inicio': nodo('pantalla-inicio'),
    'pantalla-juego': nodo('pantalla-juego')
  };
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
    window: null,
    bootstrap: { Modal: { getOrCreateInstance: () => ({ show() {}, hide() {} }) } }
  });
  // En el navegador window === globalThis: progression.js publica sus helpers
  // en window y el arranque del Modo Leal los busca ahí.
  vm.runInContext('globalThis.window = globalThis; globalThis.addEventListener = function() {};', ctx);

  vm.runInContext(read('data.js'), ctx);
  vm.runInContext(read('progression.js'), ctx);
  vm.runInContext(`
    function mostrarNotificacion() {}
    function guardarPartida() {}
    function actualizarInterfaz() {}
    function ocultarPanelCuenta() {}
    function prepararSiguienteEvento() {}
    function limpiarEstadosMinijuegos() {}
    function finalizarCarrera() {}
    function continuarCarrera() {}
    function generarOfertasDeFichaje() {}
    function simularTemporada() {}
    function mostrarModalRol() {}
    function lanzarConfeti() {}
    function animarOVR() {}
    function chequearLogros() {}
    function renderizarFeedRedes() {}
    function verificarCondicionLoro() {}
    function recuperarRangoNittox() {}
    function estadoMoral() { return { color: '', txt: '' }; }
    function uiT(clave, fallback) { return fallback; }
    function iniciarCarrera() { throw new Error('el Modo Leal no debe delegar en la carrera normal'); }
  `, ctx);
  // crearJugadorInicial y sincronizarDivision viven en app.js: se replican acá
  // porque el sandbox no carga app.js entera.
  vm.runInContext(`
    function crearJugadorInicial() {
      return {
        nombre: "", posicion: "DEL", nacionalidad: "URU", media: 60, atributos: null,
        clubActual: null, temporadaActual: 1, division: 2, rolAnterior: null,
        modoDesafio: false, desafioCompletado: false, modoLeal: false
      };
    }
    function sincronizarDivision() {
      if (jugador && jugador.clubActual) {
        jugador.division = jugador.clubActual.reputacion > CONFIG.UMBRAL_PRIMERA ? 1 : 2;
      }
    }
  `, ctx);
  vm.runInContext(read('features.js'), ctx);
  // CONFIG es `const` léxico: no queda como propiedad del global, se expone.
  vm.runInContext('globalThis.PROGRESION_CFG = CONFIG.PROGRESION; globalThis.CFG = CONFIG;', ctx);
  return ctx;
}

const cfg = ctx => ctx.PROGRESION_CFG;
let casos = 0;

for (let semilla = 1; semilla <= 60; semilla++) {
  const posicion = POSICIONES[semilla % POSICIONES.length];
  const codigoNac = NACIONALIDADES[semilla % NACIONALIDADES.length];
  const ctx = montar(semilla, posicion, codigoNac);
  ctx.iniciarCarreraLeal();
  const j = ctx.jugador;
  casos++;

  // 1. Nacionalidad: la elegida en el panel, no URU hardcodeado.
  assert.equal(j.nacionalidad, codigoNac,
    `semilla ${semilla}: nacionalidad ${j.nacionalidad} != elegida ${codigoNac}`);
  assert.ok(ctx.seleccionPorCodigo(j.nacionalidad), 'la selección debe existir en el catálogo');

  // 2. Atributos: se generan para la posición y dentro de los límites.
  assert.ok(j.atributos, `semilla ${semilla}: atributos null (no se cargaron)`);
  const esperadas = (posicion === 'GK' ? ctx.ATRIBUTOS_ARQUERO : ctx.ATRIBUTOS_CAMPO).slice().sort().join('|');
  assert.equal(Object.keys(j.atributos).sort().join('|'), esperadas,
    `semilla ${semilla}: atributos de ${posicion} incorrectos`);
  for (const [k, v] of Object.entries(j.atributos)) {
    assert.equal(typeof v, 'number', `atributo ${k} no numérico`);
    assert.ok(v >= cfg(ctx).ATR_MIN && v <= cfg(ctx).ATR_MAX, `atributo ${k}=${v} fuera de escala`);
  }

  // 3. Media = OVR derivado de los atributos (65 normal / 75 promesa).
  assert.equal(j.media, ctx.calcularOVR(j.atributos, posicion),
    `semilla ${semilla}: la media no coincide con el OVR de los atributos`);
  assert.ok([cfg(ctx).OVR_INICIAL_NORMAL, cfg(ctx).OVR_INICIAL_PROMESA].includes(j.media),
    `semilla ${semilla}: OVR inicial inesperado ${j.media}`);

  // 4. División: la del club sorteado (el sorteo puede dar uno de 1ª).
  const divisionEsperada = j.clubActual.reputacion > ctx.CFG.UMBRAL_PRIMERA ? 1 : 2;
  assert.equal(j.division, divisionEsperada,
    `semilla ${semilla}: division ${j.division} no sigue al club ${j.clubActual.nombre} (rep ${j.clubActual.reputacion})`);

  // 5. El resto del arranque del modo sigue igual.
  assert.equal(j.modoDesafio, true, 'debe quedar en modo Leal');
  assert.equal(j.desafioCompletado, false);
  assert.ok(j.clubActual && j.clubActual.reputacion < 8, 'el club sorteado debe ser de reputación baja');
  assert.ok(j.rolAnterior, 'el rol debe derivarse de la media ya calculada');
}

console.log(`TODO OK: Modo Leal arranca con la selección elegida, atributos cargados y división sincronizada (${casos} casos).`);
