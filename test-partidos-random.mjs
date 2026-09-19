import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

const documentStub = {
  addEventListener() {},
  getElementById() {
    return {
      innerText: '',
      innerHTML: '',
      value: '',
      checked: false,
      style: {},
      disabled: false,
      classList: { add() {}, remove() {}, contains() { return false; } },
      addEventListener() {},
      setAttribute() {},
      querySelector() {
        return { addEventListener() {}, style: {}, innerHTML: '', classList: { add() {}, remove() {} } };
      },
      querySelectorAll() { return []; }
    };
  },
  querySelector() {
    return { addEventListener() {}, style: {}, innerHTML: '', classList: { add() {}, remove() {} } };
  },
  querySelectorAll() { return []; }
};

const sandbox = {
  console,
  Math,
  Date,
  JSON,
  Object,
  Array,
  Set,
  RegExp,
  String,
  Number,
  Boolean,
  window: {},
  document: documentStub,
  bootstrap: { Modal: function () { this.show = () => {}; this.hide = () => {}; } },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { maxTouchPoints: 0 },
  location: { protocol: 'https:', hostname: 'localhost' },
  setTimeout,
  clearTimeout,
  AudioContext: null,
  webkitAudioContext: null
};

vm.createContext(sandbox);
vm.runInContext(read('data.js'), sandbox);
vm.runInContext(read('app.js'), sandbox);

const required = [
  'detectarPartidoEspecial',
  'jugarMomentosClave',
  'simularPartidoNormal',
  'resolverMomentoClave',
  'generarMomentoClave'
];

let fallos = 0;
for (const name of required) {
  if (typeof sandbox[name] !== 'function') {
    console.error(`Falta ${name}`);
    fallos++;
  }
}

if (fallos) {
  process.exit(1);
}

console.log('OK: API de partidos random disponible');

const partido = vm.runInContext(`
  jugador.clubActual = CLUBES.find(c => c.nombre === 'River Plate');
  jugador.media = 82;
  jugador.moral = 70;
  detectarPartidoEspecial();
`, sandbox);
if (!partido || !partido.esPartidoInteractivo) {
  console.error('Falta un partido interactivo garantizado por temporada');
  process.exit(1);
}
if (partido.eventos.length !== 4 || partido.eventos[0].minuto !== 15 || partido.eventos[3].minuto !== 78) {
  console.error('El partido no tiene la línea temporal esperada');
  process.exit(1);
}
if (!partido.rival || !partido.competencia || typeof partido.local !== 'boolean' || !partido.titular) {
  console.error('Falta contexto previo del partido');
  process.exit(1);
}
console.log('OK: partido garantizado con rival, competición, localía, titularidad, contexto y cuatro momentos temporales');

vm.runInContext('var prefs = { idioma: "pt" };', sandbox);
const eventoPt = vm.runInContext('eventoEnIdioma(configsEventos.SOSSA)', sandbox);
if (!/Sossa/.test(eventoPt.titulo) || /¿Aceptas|te invita a salir/.test(eventoPt.texto)) {
  console.error('El evento no se traduce a PT-BR preservando el nombre propio');
  process.exit(1);
}
console.log('OK: eventos traducibles a PT-BR sin traducir nombres propios');
