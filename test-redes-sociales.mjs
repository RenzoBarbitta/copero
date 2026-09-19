// Prueba pura del feed social de jugadores precargados.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const elementos = new Map();
const contexto = vm.createContext({
  console, Math, Date, JSON, Object, Array, Set, String, Number,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  document: {
    addEventListener() {},
    getElementById: id => elementos.get(id) || null,
    querySelectorAll: () => []
  },
  window: { addEventListener() {} },
  bootstrap: { Modal: { getOrCreateInstance: () => ({ show() {} }) } }
});

vm.runInContext(read('data.js'), contexto);
vm.runInContext(`
  var jugador = {
    nombre: 'Test', posicion: 'DEL', edad: 20, media: 82,
    clubActual: CLUBES.find(c => c.nombre === 'River Plate'),
    temporadaActual: 3,
    historialTemporadas: [{ temporada: 2, club: 'River Plate (Primera)', partidos: 30, goles: 12, asistencias: 7, media: 81, trofeos: 'Primera División' }],
    trofeos: { primeraDivision: 1, segundaDivision: 0, copaDeCampeones: 0, copaArgentina: 0, copaApa: 0 },
    redesSociales: { feed: [], rivalidades: {}, cadenaActual: null }
  };
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
`, contexto);
vm.runInContext(read('features.js'), contexto);

const resultado = vm.runInContext(`
  CONFIG.REDES.PROB_DECLARACION = 1;
  CONFIG.REDES.PROB_RESPUESTA = 1;
  const ctx = contextoRedSocial('despues', rivalRedActual());
  const normal = publicarRedSocial('Caseros', 'normal', 'despues', ctx, true);
  const picante = publicarRedSocial('Gonza431', 'picante', 'despues', ctx, true);
  const muy = publicarRedSocial('Orsini', 'muy_picante', 'despues', ctx, true);
  const respuesta = generarRespuestaRedSocial(muy, ctx);
  const antes = generarRedesAntesPartido();
  const despues = generarRedesDespuesPartido();
  ({ normal, picante, muy, respuesta, antes, despues, feed: jugador.redesSociales.feed, rivalidades: jugador.redesSociales.rivalidades });
`, contexto);

assert.match(resultado.normal.texto, /River Plate|temporada|goles|títulos/i);
assert.match(resultado.picante.texto, /River Plate|temporada|goles|títulos/i);
assert.match(resultado.muy.texto, /River Plate|temporada|goles|títulos/i);
assert.match(resultado.muy.texto, /sigue en|llegó desde/i, 'la declaración usa contexto de fichaje');
assert.ok(resultado.normal.viralidad < resultado.muy.viralidad, 'muy picante genera más viralidad base');
assert.ok(resultado.respuesta && resultado.muy.respuestas.length >= 1, 'se generan respuestas entre jugadores');
assert.match(resultado.respuesta.texto, /declaración|Leí lo de|vi su declaración/i, 'la respuesta encadena la declaración anterior');
assert.ok(resultado.feed.some(post => post.momento === 'antes'), 'hay declaraciones antes del partido');
assert.ok(resultado.feed.some(post => post.momento === 'despues'), 'hay declaraciones después del partido');
assert.ok(Object.values(resultado.rivalidades).some(valor => valor > 0), 'las rivalidades acumulan intensidad');
assert.ok(resultado.feed.every(post => post.contexto.club && post.contexto.rival && post.contexto.rendimiento), 'cada publicación conserva contexto real');
console.log('TODO OK: declaraciones normales, picantes, muy picantes, respuestas, cadenas, contexto, rivalidades y viralidad.');
