// ============================================================
// test-calidad.mjs - Selector de CALIDAD (Alta / Baja) al entrar
// Valida la preferencia y sus efectos sin navegador:
//   - defaults: prefs.calidad = null (juego base) y preguntarCalidad = true.
//   - aplicarCalidad(): la marca va en <html> (html.calidad-baja).
//   - establecerCalidad(): guarda en pso_prefs_v1, cierra el cuadro y
//     sincroniza el selector de Configuración.
//   - preguntarCalidadAlEntrar(): el cuadro aparece al entrar salvo que el
//     jugador haya pedido no volver a ser preguntado.
//   - los botones del cuadro (conectados en features.js) responden al click.
//   - i18n: las claves del cuadro existen en es/en/pt.
//   - anclas estáticas: script del <head>, bloque html.calidad-baja de
//     fx-detalle.css (solo cosmético; la intro queda exenta) y guardas
//     de react/fx.js (la intro espera la elección y corre igual en
//     ambos modos).
// Ejecutar: node test-calidad.mjs
// ============================================================
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

// ---------- DOM mínimo con classList real ----------
function crearClaseLista(el) {
  const clases = new Set();
  return {
    add() { for (const n of arguments) clases.add(n); el.className = [...clases].join(' '); },
    remove() { for (const n of arguments) clases.delete(n); el.className = [...clases].join(' '); },
    contains: n => clases.has(n),
    toggle(n, forzar) {
      const activa = forzar === undefined ? !clases.has(n) : !!forzar;
      if (activa) clases.add(n); else clases.delete(n);
      el.className = [...clases].join(' ');
      return activa;
    }
  };
}

function crearElemento(id) {
  const el = { id, dataset: {}, className: '', checked: false, value: '', eventos: {} };
  el.classList = crearClaseLista(el);
  el.addEventListener = (tipo, fn) => { el.eventos[tipo] = fn; };
  el.disparar = tipo => { if (el.eventos[tipo]) el.eventos[tipo]({ target: el }); };
  el.setAttribute = () => {};
  return el;
}

const IDS_CALIDAD = ['overlay-calidad', 'btn-calidad-alta', 'btn-calidad-baja',
  'calidad-no-preguntar', 'select-calidad', 'calidad-preguntar'];
const elementos = new Map(IDS_CALIDAD.map(id => [id, crearElemento(id)]));
const documento = {
  addEventListener() {},
  getElementById: id => elementos.get(id) || null,
  querySelectorAll: () => [],
  querySelector: () => null,
  documentElement: crearElemento('html')
};

const almacen = new Map();
const eventosVentana = []; // lo que features.js despacha a la ventana
const contexto = vm.createContext({
  console, Math, Date, JSON, Object, Array, Set, String, Number,
  localStorage: {
    getItem: k => (almacen.has(k) ? almacen.get(k) : null),
    setItem: (k, v) => { almacen.set(k, String(v)); },
    removeItem: k => { almacen.delete(k); }
  },
  document: documento,
  CustomEvent: class CustomEvent {
    constructor(tipo, opciones) {
      this.type = tipo;
      this.detail = (opciones && opciones.detail) || null;
    }
  },
  window: {
    addEventListener() {},
    dispatchEvent(ev) { eventosVentana.push(ev && ev.type); return true; }
  },
  bootstrap: { Modal: { getOrCreateInstance: () => ({ show() {} }) } }
});

vm.runInContext(read('data.js'), contexto);
vm.runInContext(`
  function guardarPartida() {}
  function mostrarNotificacion() {}
  function finalizarCarrera() {}
  function iniciarCarrera() {}
  function continuarCarrera() {}
  function generarOfertasDeFichaje() {}
  function simularTemporada() {}
  function actualizarInterfaz() {}
  function mostrarModalRol() {}
  function limpiarEstadosMinijuegos() {}
  function cargarSlotDesdePanel() {}
  function puedeJugarMinijuegoExtra() { return true; }
  function chequearLogros() {}
  function chequearModoDesafio() {}
  function lanzarConfeti() {}
  function animarOVR() {}
  function traducirInterfaz() {}
`, contexto);
vm.runInContext(read('features.js'), contexto);

const run = expr => vm.runInContext(expr, contexto);
const el = id => elementos.get(id);
const guardado = () => JSON.parse(almacen.get('pso_prefs_v1') || '{}');
const esBaja = () => documento.documentElement.classList.contains('calidad-baja');

// ---------- 1) i18n: claves del cuadro en los tres idiomas ----------
const clavesCalidad = [...new Set([...read('react/modales-7.js').matchAll(/data-i18n="(calidad[A-Za-z]+)"/g)]
  .map(m => m[1]))];
assert.equal(clavesCalidad.length, 9, 'claves de calidad en el markup: ' + clavesCalidad.join(','));
for (const idioma of ['es', 'en', 'pt']) {
  for (const clave of clavesCalidad) {
    assert.ok(run(`TEXTOS_UI.${idioma}["${clave}"]`), 'falta la traducción ' + clave + ' (' + idioma + ')');
  }
}

// ---------- 2) Arranque sin elección: juego base completo ----------
assert.equal(run('prefs.calidad'), null, 'sin elección previa se juega en Alta (juego base)');
assert.equal(run('prefs.preguntarCalidad'), true, 'por defecto se pregunta al entrar');
assert.equal(esBaja(), false, 'sin elección no se aplica ninguna clase');
assert.equal(el('overlay-calidad').classList.contains('hidden'), false, 'el cuadro se ve al entrar');

// ---------- 3) Elegir "Baja" desde el cuadro ----------
el('btn-calidad-baja').disparar('click');
assert.equal(run('prefs.calidad'), 'baja', 'la elección queda en memoria');
assert.equal(esBaja(), true, 'Baja pone html.calidad-baja');
assert.equal(el('overlay-calidad').classList.contains('hidden'), true, 'el cuadro se cierra al elegir');
assert.equal(el('select-calidad').value, 'baja', 'Configuración queda sincronizada');
assert.equal(guardado().calidad, 'baja', 'la elección se persiste en pso_prefs_v1');
assert.equal(guardado().preguntarCalidad, true, 'sin tildar la casilla se vuelve a preguntar');
assert.equal(guardado().idioma, 'es', 'las otras preferencias no se pisan');
assert.ok(eventosVentana.includes('copero:calidad-elegida'),
  'al elegir se despacha el evento que arranca la intro');

// ---------- 4) Volver a "Alta" desde Configuración ----------
run('establecerCalidad("alta", false)');
assert.equal(esBaja(), false, 'Alta saca la clase: el juego base vuelve entero');
assert.equal(guardado().calidad, 'alta', 'Alta también se persiste');
assert.equal(el('select-calidad').value, 'alta', 'el selector refleja Alta');
assert.equal(guardado().preguntarCalidad, true, 'cambiar la calidad desde Configuración no silencia la pregunta');

// ---------- 5) "No volver a preguntar" desde el cuadro ----------
el('calidad-no-preguntar').checked = true;
el('btn-calidad-baja').disparar('click');
assert.equal(guardado().preguntarCalidad, false, 'la casilla guarda que no se pregunte más');
assert.equal(esBaja(), true, 'sigue en Baja');
run('preguntarCalidadAlEntrar()');
assert.equal(el('overlay-calidad').classList.contains('hidden'), true, 'no se vuelve a preguntar al entrar');
assert.equal(el('calidad-no-preguntar').checked, true, 'la casilla refleja el estado guardado');

// ---------- 6) El switch de Configuración reactiva la pregunta ----------
run('prefs.preguntarCalidad = true; guardarPrefs(); aplicarCalidad(); preguntarCalidadAlEntrar();');
assert.equal(el('overlay-calidad').classList.contains('hidden'), false, 'se puede volver a preguntar');
assert.equal(el('calidad-no-preguntar').checked, false, 'la casilla del cuadro queda destildada');
run('establecerCalidad("alta", true)');
assert.equal(guardado().calidad, 'alta', 'queda elegido Alta');
assert.equal(esBaja(), false, 'y sin clase de Baja');

// ---------- 7) Anclas estáticas ----------
const html = read('index.html');
const finHead = html.indexOf('</head>');
assert.ok(html.indexOf('pso_prefs_v1') > 0 && html.indexOf('pso_prefs_v1') < finHead,
  'index.html lee pso_prefs_v1 en el <head>');
assert.ok(html.indexOf('calidad-baja') > 0 && html.indexOf('calidad-baja') < finHead,
  'index.html aplica calidad-baja antes del primer pintado');

const css = read('fx-detalle.css');
assert.match(css, /\.calidad-overlay\s*\{/, 'fx-detalle.css define el cuadro de calidad');
assert.match(css, /\.calidad-overlay\s*\{[^}]*z-index:\s*6000/, 'el cuadro va por encima de la cinemática (5000)');
assert.match(css, /html\.calidad-baja \*[^}]*animation-duration:\s*0\.01ms/, 'Baja frena las animaciones');
// La intro NUNCA se apaga: es idéntica en Alta y en Baja (regla del proyecto).
assert.doesNotMatch(css, /html\.calidad-baja \.cinematica/,
  'Baja no oculta la intro de apertura');
assert.match(css, /html\.calidad-baja \*:not\(\.cinematica\):not\(\[class\*="cine-"\]\)/,
  'la intro queda exenta del apagado genérico de Baja');
assert.match(css, /\.cinematica\.cinematica-espera[^{]*\{[^}]*animation-play-state:\s*paused/,
  'la intro espera la elección quieta en su primer fotograma');
assert.match(css, /html\.calidad-baja \*[^}]*backdrop-filter:\s*none/, 'Baja apaga el cristal');
assert.match(css, /html\.calidad-baja \.fx-aurora/, 'Baja apaga las capas pesadas del fondo');
const bloqueBaja = css.slice(css.indexOf('MODO CALIDAD BAJA'));
assert.doesNotMatch(bloqueBaja, /pantalla|\.hidden|#nav-inferior[^,{]*\{[^}]*display/,
  'Baja es solo cosmético: no oculta pantallas ni la navegación');

const fx = read('react/fx.js');
assert.match(fx, /function calidadBaja\(\)/, 'react/fx.js sabe si está en Baja');
assert.match(fx, /if \(calidadBaja\(\)\) return;/, 'el parallax se corta en Baja');
assert.match(fx, /cinematica-espera/, 'la intro espera la elección (cinematica-espera)');
assert.match(fx, /copero:calidad-elegida/, 'la intro arranca con el evento de la elección');
assert.match(fx, /cine-letra/, 'las letras de la intro llevan su marca .cine-letra');
assert.match(fx, /CR\.hayQuePreguntarCalidad/, 'la intro usa la MISMA lógica que el cuadro');
assert.match(read('react/montar.js'), /CR\.OverlayCalidad/, 'montar.js monta el cuadro');
assert.match(read('ui.js'), /getElementById\("select-calidad"\)/, 'ui.js engancha el selector de Configuración');
assert.match(read('ui.js'), /getElementById\("calidad-preguntar"\)/, 'ui.js engancha el switch de pregunta');

// La base busca estos id: tienen que existir en la capa React.
const fuentesReact = fs.readdirSync(new URL('./react/', import.meta.url))
  .filter(n => n.endsWith('.js')).map(n => read('react/' + n)).join('\n');
for (const id of IDS_CALIDAD) {
  assert.match(fuentesReact, new RegExp('id="' + id + '"'), 'la capa React no renderiza #' + id);
}

console.log('TODO OK: cuadro de calidad al entrar, Baja cosmético (juego 100% jugable), Alta = juego base completo e intro de apertura siempre igual, después de elegir.');
