// Prueba del botón/panel de logros y su traducción PT-BR.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
let notificacion = null;
const contexto = vm.createContext({
  console, Math, Date, JSON, Object, Array, Set, String, Number,
  localStorage: { getItem: () => JSON.stringify({ idioma: 'pt' }), setItem() {}, removeItem() {} },
  document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [] },
  window: { addEventListener() {} },
  bootstrap: { Modal: { getOrCreateInstance: () => ({ show() {} }) } }
});
vm.runInContext(read('data.js'), contexto);
vm.runInContext(`
  var jugador = { logros: ['primer_titulo'] };
  function guardarPartida() {}
  function mostrarNotificacion(titulo, html) { notificacion = { titulo, html }; }
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
`, contexto);
vm.runInContext(read('features.js'), contexto);
vm.runInContext('mostrarPanelLogros()', contexto);
const salida = vm.runInContext('notificacion', contexto);
assert.equal(salida.titulo, 'Logros');
assert.match(salida.html, /Conquistas/);
assert.match(salida.html, /Campeão/);
assert.match(salida.html, /Concluído/);
assert.match(salida.html, /Pendente/);
console.log('TODO OK: botón de logros funcional y panel traducido al PT-BR.');
