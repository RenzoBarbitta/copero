// ============================================================
// test-selecciones.mjs - Catálogo de selecciones (Fase 1 internacional)
// Valida en data.js:
//   - 211 asociaciones miembro de FIFA repartidas en 6 confederaciones
//     (CONMEBOL 10, UEFA 55, CAF 54, AFC 46, CONCACAF 35, OFC 11).
//   - códigos FIFA 3 letras únicos,
//   - fuerza 1..100 y ranking FIFA 1..211 únicos,
//   - helpers seleccionPorCodigo / banderaSeleccion / seleccionesPorConfederacion,
//   - validarDatos() no reporta errores del catálogo.
// Ejecutar: node test-selecciones.mjs
// ============================================================
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const contexto = vm.createContext({
  console, Math, Date, JSON,
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [] },
  window: { addEventListener() {} }
});
vm.runInContext(read('data.js'), contexto);

const SELECCIONES = vm.runInContext('SELECCIONES', contexto);

assert.equal(SELECCIONES.length, 211, 'deben ser 211 asociaciones miembro de FIFA');

const esperado = { CONMEBOL: 10, UEFA: 55, CAF: 54, AFC: 46, CONCACAF: 35, OFC: 11 };
const conteo = {};
SELECCIONES.forEach(s => { conteo[s[3]] = (conteo[s[3]] || 0) + 1; });
assert.deepEqual(conteo, esperado, 'reparto por confederación');

const codigos = SELECCIONES.map(s => s[0]);
assert.equal(new Set(codigos).size, 211, 'códigos FIFA duplicados');
codigos.forEach(c => assert.match(c, /^[A-Z]{3}$/, 'código con formato exacto: ' + c));

SELECCIONES.forEach(s => {
  assert.ok(typeof s[1] === 'string' && s[1].length >= 3, 'nombre válido para ' + s[0]);
  assert.ok(typeof s[2] === 'string' && s[2].length >= 2, 'bandera (emoji) para ' + s[0]);
  assert.ok(s[4] >= 1 && s[4] <= 100, 'fuerza fuera de rango: ' + s[0]);
  assert.ok(s[5] >= 1 && s[5] <= 211, 'ranking FIFA fuera de rango: ' + s[0]);
});

const rankings = SELECCIONES.map(s => s[5]);
assert.equal(new Set(rankings).size, 211, 'ranking FIFA duplicado');

// Helpers expuestos por data.js
const uru = vm.runInContext('seleccionPorCodigo("URU")', contexto);
assert.ok(uru && uru.codigo === 'URU' && uru.bandera === '🇺🇾' && uru.confederacion === 'CONMEBOL',
  'seleccionPorCodigo debe resolver URU');
assert.equal(vm.runInContext('seleccionPorCodigo("ZZZ")', contexto), null,
  'código inexistente => null');
assert.equal(vm.runInContext('banderaSeleccion("ARG")', contexto), '🇦🇷',
  'banderaSeleccion de ARG');
assert.equal(vm.runInContext('banderaSeleccion("XB1")', contexto), '🏳️',
  'banderaSeleccion de código desconocido => bandera blanca');
assert.equal(vm.runInContext('seleccionesPorConfederacion("OFC").length', contexto), 11,
  'seleccionesPorConfederacion(OFC)');

// Banderas reales (flag-icons): mapa clave por código, todo archivo presente
const iconos = vm.runInContext('Object.keys(BANDERA_ICONO)', contexto);
assert.equal(iconos.length, 211, 'BANDERA_ICONO debe cubrir las 211 selecciones');
const faltanIconos = iconos.filter(c => !codigos.includes(c));
assert.equal(faltanIconos.length, 0, 'claves de BANDERA_ICONO sin selección: ' + faltanIconos.join(','));
codigos.forEach(c => assert.ok(vm.runInContext('BANDERA_ICONO["' + c + '"]', contexto),
  'BANDERA_ICONO debe incluir ' + c));
assert.equal(vm.runInContext('BANDERA_ICONO.ENG', contexto), 'gb-eng', 'UK: England usa su propia bandera');
assert.equal(vm.runInContext('BANDERA_ICONO.KOS', contexto), 'xk', 'Kosovo usa la clave no oficial xk');
assert.equal(vm.runInContext('rutaBandera("ARG")', contexto), 'vendor/flags/ar.svg',
  'rutaBandera de ARG');
assert.equal(vm.runInContext('rutaBandera("XB1")', contexto), '',
  'rutaBandera de código desconocido => ""');
assert.ok(!vm.runInContext('seleccionPorCodigo("URU").clave', contexto) ||
  vm.runInContext('seleccionPorCodigo("URU").clave', contexto) === 'uy',
  'seleccionPorCodigo expone clave flag-icons');

const carpetaFlags = new URL('./vendor/flags/', import.meta.url);
for (const c of codigos) {
  const clave = vm.runInContext('BANDERA_ICONO["' + c + '"]', contexto);
  const ruta = new URL('./vendor/flags/' + clave + '.svg', import.meta.url);
  assert.ok(fs.existsSync(ruta) && fs.statSync(ruta).size > 50,
    'falta el SVG de ' + c + ' (' + carpetaFlags.pathname + clave + '.svg)');
}
const svgs = fs.readdirSync(new URL('./vendor/flags/', import.meta.url)).filter(f => f.endsWith('.svg'));
assert.equal(svgs.length, 211, 'deben ser 211 SVGs en vendor/flags/ (hay ' + svgs.length + ')');

// validarDatos no debe reportar errores del catálogo
const errores = [...vm.runInContext('validarDatos()', contexto)]; // spread fuera del realm del sandbox
const erroresSelecciones = errores.filter(e => /seleccion/i.test(String(e)));
assert.equal(erroresSelecciones.length, 0, 'validarDatos no debe fallar con el catálogo');

// Claves i18n de confederación y nacionalidad presentes en los 3 idiomas
for (const lang of ['es', 'en', 'pt']) {
  for (const k of ['tuNacionalidad', 'nacionalidadAyuda', 'seleccionNacional', 'rankColSeleccion', 'confCONMEBOL', 'confUEFA', 'confOFC']) {
    assert.ok(vm.runInContext(`TEXTOS_UI.${lang}.${k}`, contexto), `TEXTOS_UI.${lang}.${k}`);
  }
}

console.log('TODO OK: 211 selecciones (' +
  Object.keys(conteo).map(c => c + '=' + conteo[c]).join(', ') + '), helpers e i18n correctos.');