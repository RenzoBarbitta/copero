// Declive por edad vs rendimiento de la temporada (veteranos).
// Regla: desde los 31 la edad resta, pero el rendimiento de la temporada
// amortigua la caída (cada punto de subida desde +2 recorta 1 de declive,
// sin anularlo). Un veterano destacado debe seguir pudiendo GANAR media por
// temporada, no solo por eventos o entrenamientos.
// Ejecutar: node test-declive-veterano.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

const documentStub = {
  addEventListener() {},
  getElementById() {
    return {
      innerText: '', innerHTML: '', value: '', checked: false, style: {}, disabled: false,
      classList: { add() {}, remove() {}, contains() { return false; } },
      addEventListener() {}, setAttribute() {},
      querySelector() { return { addEventListener() {}, style: {}, innerHTML: '', classList: { add() {}, remove() {} } }; },
      querySelectorAll() { return []; }
    };
  },
  querySelector() { return { addEventListener() {}, style: {}, innerHTML: '', classList: { add() {}, remove() {} } }; },
  querySelectorAll() { return []; }
};

// Sandbox con Math.random fijo (o el real si random es null) para que el
// rendimiento de la temporada sea determinista.
function crearSandbox(random) {
  const MathControlado = Object.create(Math);
  if (random != null) MathControlado.random = () => random;
  const sandbox = {
    console,
    Math: MathControlado,
    Date, JSON, Object, Array, Set, RegExp, String, Number, Boolean,
    window: {},
    document: documentStub,
    bootstrap: { Modal: function () { this.show = () => {}; this.hide = () => {}; } },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    navigator: { maxTouchPoints: 0 },
    location: { protocol: 'https:', hostname: 'localhost' },
    setTimeout, clearTimeout, AudioContext: null, webkitAudioContext: null
  };
  vm.createContext(sandbox);
  vm.runInContext(read('data.js'), sandbox);
  vm.runInContext(read('app.js'), sandbox);
  return sandbox;
}

let fallos = 0;
function ok(cond, mensaje) {
  if (cond) { console.log('OK  ' + mensaje); }
  else { fallos++; console.error('FAIL ' + mensaje); }
}

const sb = crearSandbox(0.99);
const declive = (edad, rend) => vm.runInContext(`declivePorEdadYRendimiento(${edad}, ${rend})`, sb);

// 1) Antes de los 31 no hay declive, ni con temporadon
ok(declive(30, 3).base === 0 && declive(30, 3).efectiva === 0, 'edad 30: sin declive ni con temporadon');

// 2) El rendimiento amortigua la caida, pero el declive nunca desaparece
[31, 32, 33, 34, 35, 36].forEach(edad => {
  const flojo = declive(edad, 0);
  const crack = declive(edad, 3);
  ok(crack.efectiva < flojo.efectiva, 'edad ' + edad + ': el rendimiento recorta el declive (' + flojo.efectiva + ' -> ' + crack.efectiva + ')');
  ok(flojo.efectiva === flojo.base && crack.efectiva >= 1, 'edad ' + edad + ': sin rendimiento el declive es completo y nunca se anula');
});

// 3) Tabla fina de amortiguacion
ok(declive(32, 1).amortiguado === 0, 'rendimiento 1 no amortigua (no llega al umbral)');
ok(declive(32, 2).efectiva === 1 && declive(32, 3).efectiva === 1, 'edad 32 (declive 2): buena temporada o temporadon -> -1');
ok(declive(34, 2).efectiva === 2 && declive(34, 3).efectiva === 1, 'edad 34 (declive 3): temporadon -> -1 y buena -> -2');
ok(declive(36, 3).efectiva === 2, 'edad 36 (declive 4): ni el mejor ano evita -2');

// 4) Temporada real: DEL de 34 anos con temporadon -> la media SUBE
const sbMax = crearSandbox(0.99);
const crack = vm.runInContext(`
  jugador.edad = 34;
  jugador.posicion = 'DEL';
  jugador.media = 80;
  jugador.division = 1;
  jugador.clubActual = CLUBES.find(c => c.reputacion === 7) || CLUBES[0];
  const antes = jugador.media;
  const b = calcularBasicoTemporada();
  ({ antes, despues: jugador.media, rendimiento: b.subidaRendimiento, aplicada: b.subidaAplicada, base: b.bajaEdadBase, baja: b.bajaEdad, amortiguado: b.decliveAmortiguado });
`, sbMax);
ok(crack.rendimiento === 3 && crack.aplicada === 3, 'temporadon: +3 OVR de rendimiento aplicados');
ok(crack.base === 3 && crack.baja === 1 && crack.amortiguado === 2, 'edad 34: declive 3 amortiguado a -1');
ok(crack.despues > crack.antes, 'veterano destacado: la media SUBE por temporada (' + crack.antes + ' -> ' + crack.despues + ')');

// 5) Un veterano que no rinde sigue bajando
const sbMin = crearSandbox(0.05);
const flojo = vm.runInContext(`
  jugador.edad = 34;
  jugador.posicion = 'DEL';
  jugador.media = 60;
  jugador.division = 1;
  jugador.clubActual = CLUBES.find(c => c.reputacion >= 7) || CLUBES[0];
  const antes = jugador.media;
  const b = calcularBasicoTemporada();
  ({ antes, despues: jugador.media, rendimiento: b.subidaRendimiento, baja: b.bajaEdad, amortiguado: b.decliveAmortiguado });
`, sbMin);
ok(flojo.rendimiento === 0, 'sin rendimiento no hay subida por temporada');
ok(flojo.baja === 3 && flojo.amortiguado === 0, 'sin rendimiento el declive es completo (-3)');
ok(flojo.despues < flojo.antes, 'veterano sin rendimiento: la media baja (' + flojo.antes + ' -> ' + flojo.despues + ')');

// 6) El techo del club sigue mandando: no se reporta una subida que no se aplico
const sbTecho = crearSandbox(0.99);
const techo = vm.runInContext(`
  jugador.edad = 34;
  jugador.posicion = 'DEL';
  jugador.division = 1;
  jugador.clubActual = CLUBES.find(c => c.reputacion === 7) || CLUBES[0];
  jugador.media = REGLAS_MEDIA[jugador.clubActual.reputacion];
  const b = calcularBasicoTemporada();
  ({ rendimiento: b.subidaRendimiento, aplicada: b.subidaAplicada });
`, sbTecho);
ok(techo.rendimiento === 3 && techo.aplicada === 0, 'en el techo del club: rendimiento 3 pero subida aplicada 0');

if (fallos === 0) { console.log('TODO OK'); }
else { console.error(fallos + ' pruebas fallaron'); process.exit(1); }
