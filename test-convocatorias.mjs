// ============================================================
// test-convocatorias.mjs - Convocatorias internacionales (Fase 2)
// Valida la lógica pura de data.js:
//   - evaluarConvocatoria(jugador, media): umbrales de convocatoria
//     (>= 70 OVR) y capitanía (>= 84 OVR).
//   - simularFechaFifa(jugador): rival de la misma confederación,
//     marcador, rendimiento personal y moral acotada.
//   - mediaActualJugador(jugador): atributos -> OVR si hay calcularOVR,
//     si no usa la media guardada.
// Ejecutar: node test-convocatorias.mjs
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

const evaluar = (j, m) => JSON.parse(vm.runInContext('JSON.stringify(evaluarConvocatoria(' + (j || 'null') + ', ' + (m ?? 'undefined') + '))', contexto));
const fecha = (j) => JSON.parse(vm.runInContext('JSON.stringify(simularFechaFifa(' + (j || 'null') + '))', contexto));

const base = (media, pos, nac) => JSON.stringify({ nacionalidad: nac || 'URU', posicion: pos || 'DEL', media: media, atributos: null });

assert.ok(vm.runInContext('CONFIG.SELECCION && CONFIG.SELECCION.UMBRAL_CONVOCATORIA === 70', contexto),
  'CONFIG.SELECCION.UMBRAL_CONVOCATORIA debe ser 70');
assert.ok(vm.runInContext('CONFIG.SELECCION.UMBRAL_CAPITAN === 84', contexto),
  'CONFIG.SELECCION.UMBRAL_CAPITAN debe ser 84');

// Umbrales
assert.deepEqual(evaluar(base(60), undefined), { convocado: false, capitan: false, media: 60, umbralConvocatoria: 70, umbralCapitan: 84 },
  'media 60 => no convocado');
assert.deepEqual(evaluar(base(70), undefined), { convocado: true, capitan: false, media: 70, umbralConvocatoria: 70, umbralCapitan: 84 },
  'media 70 => convocado');
assert.equal(evaluar(base(84), undefined).capitan, true, 'media 84 => capitán');
assert.ok(evaluar(base(88), undefined).convocado && evaluar(base(88), undefined).capitan,
  'media 88 => convocado y capitán');

// mediaOverride tiene prioridad sobre media actual
assert.equal(evaluar(base(50), 82).convocado, true, 'override 82 => convocado');

// Fecha FIFA: rival dentro de la misma confederación, distinto, marcador válido y moral acotada
const CONMEBOL = vm.runInContext('seleccionesPorConfederacion("CONMEBOL").map(f => f[0])', contexto);
let fechas = 0;
for (let i = 0; i < 400; i++) {
  const r = fecha(base(80, 'DEL'));
  if (!r) continue;
  fechas++;
  assert.ok(r.seleccionCodigo === 'URU', 'juega por la selección del jugador');
  assert.ok(CONMEBOL.includes(r.rivalCodigo), 'rival de CONMEBOL: ' + r.rivalCodigo);
  assert.notEqual(r.rivalCodigo, 'URU', 'rival distinto de su selección');
  assert.ok(r.marcador.seleccion >= 0 && r.marcador.rival >= 0, 'marcador no negativo');
  assert.ok(r.goles >= 0 && r.goles <= r.marcador.seleccion, 'goles personales coherentes');
  assert.ok(r.moral >= -3 && r.moral <= 4, 'moral acotada: ' + r.moral);
  assert.ok(r.victoria === (r.marcador.seleccion > r.marcador.rival), 'victoria coherente');
}
assert.ok(fechas > 0, 'simularFechaFifa devuelve resultados');

// GK casi nunca convierte, DEL tiene chance real de gol
let golesGK = 0, golesDEL = 0;
for (let i = 0; i < 300; i++) {
  const gk = fecha(base(70, 'GK'));
  const dl = fecha(base(70, 'DEL'));
  if (!gk || !dl) continue;
  golesGK += gk.goles;
  golesDEL += dl.goles;
}
assert.ok(golesGK <= 25, 'el arquero casi nunca convierte (goles obtenidos: ' + golesGK + ')');
assert.ok(golesDEL >= 40, 'el delantero convierte con frecuencia (goles obtenidos: ' + golesDEL + ')');

// mediaActualJugador: sin calcularOVR usa la media guardada
assert.equal(vm.runInContext('mediaActualJugador(' + base(77) + ')', contexto), 77,
  'mediaActualJugador usa la media guardada');
assert.equal(vm.runInContext('mediaActualJugador({ nacionalidad: "ARG" })', contexto), 0,
  'sin media => 0');

// i18n de convocatorias presente en los 3 idiomas
for (const lang of ['es', 'en', 'pt']) {
  for (const k of ['internacionalTitulo', 'selConvocado', 'selNoConvocado', 'selPartidos', 'selGoles', 'selCapitan', 'fechaFifaTitulo', 'fechaFifaPartido', 'convConvocado', 'convCapitana']) {
    assert.ok(vm.runInContext(`TEXTOS_UI.${lang}.${k}`, contexto), `TEXTOS_UI.${lang}.${k}`);
  }
}

console.log('TODO OK: convocatorias (umbrales, Fecha FIFA por confederación, moral acotada) e i18n correctos.');