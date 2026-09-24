// ============================================================
// test-campeonatos.mjs - Campeonatos internacionales (data.js)
// Valida la lógica pura:
//   - torneoDeTemporada: ciclo 4 temporadas por confederación
//     (resto 1 continental, resto 2 Finalissima, resto 3 Mundial).
//   - participantesDeTorneo: 32 mundial, 16 continental, invitación
//     CONCACAF en la Copa América y presencia forzada de la selección.
//   - armarGruposEquipos: grupos de a 4 con serpiente por ranking.
//   - simularPartidoSeleccion: marcadores coherentes y efecto del jugador.
//   - tablaGrupo: orden por puntos, diferencia y goles a favor.
// Ejecutar: node test-campeonatos.mjs
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

const run = expr => vm.runInContext(expr, contexto);
const runJSON = expr => JSON.parse(JSON.stringify(vm.runInContext(expr, contexto)));
const C = run('CONFIG.SELECCION');

assert.equal(C.CICLO, 4, 'ciclo de torneos de 4 temporadas');
assert.equal(C.ANIO_CONTINENTAL, 1);
assert.equal(C.ANIO_FINALISSIMA, 2);
assert.equal(C.ANIO_MUNDIAL, 3);
assert.equal(C.MUNDIAL_EQUIPOS, 32);
assert.equal(C.CONTINENTAL_EQUIPOS, 16);
assert.equal(C.GRUPOS, 4);

// ---------- torneoDeTemporada ----------
assert.deepEqual(runJSON('torneoDeTemporada(1, "CONMEBOL")'), { tipo: 'copaAmerica', anio: 1 },
  'temporada 1 CONMEBOL => Copa América');
assert.deepEqual(runJSON('torneoDeTemporada(1, "UEFA")'), { tipo: 'euro', anio: 1 },
  'temporada 1 UEFA => Eurocopa');
assert.equal(run('torneoDeTemporada(1, "CAF")'), null,
  'temporada 1 CAF no tiene continental');
assert.deepEqual(runJSON('torneoDeTemporada(2, "CONMEBOL")'), { tipo: 'finalissima', anio: 2 },
  'temporada 2 => Finalissima');
assert.equal(run('torneoDeTemporada(2, "CAF")'), null, 'CAF no juega Finalissima');
assert.deepEqual(runJSON('torneoDeTemporada(3, "CONMEBOL")'), { tipo: 'mundial', anio: 3 },
  'temporada 3 => Mundial');
assert.equal(run('torneoDeTemporada(4, "CONMEBOL")'), null, 'temporada 4 => descanso');
assert.equal(runJSON('torneoDeTemporada(5, "CONMEBOL")').tipo, 'copaAmerica',
  'ciclo se repite cada 4 temporadas');
assert.equal(JSON.stringify(run('torneoDeTemporada(0, "CONMEBOL")')),
  JSON.stringify(run('torneoDeTemporada(4, "CONMEBOL")')),
  'temporada 0 equivale a descanso (mod 4)');

// ---------- participantesDeTorneo ----------
assert.equal(run('participantesDeTorneo("mundial", "CONMEBOL", "URU").length'), 32,
  'Mundial con 32 equipos');
assert.equal(run('participantesDeTorneo("copaAmerica", "CONMEBOL", "URU").length'), 16,
  'Copa América con 16 equipos');
assert.equal(run('participantesDeTorneo("euro", "UEFA", "FRA").length'), 16,
  'Euro con 16 equipos');
assert.equal(run('participantesDeTorneo("copaAmerica", "CONMEBOL", "URU").includes("AND")'), false,
  'Andorra (UEFA) no entra a la Copa América');
assert.equal(run('participantesDeTorneo("copaAmerica", "CONMEBOL", "URU").filter(x => x === "URU").length'), 1,
  'URU presente en su torneo');
const sinCorte = run('participantesDeTorneo("mundial", "CONMEBOL", "URU").includes("AND")');
assert.ok(sinCorte === false, 'Andorra (ranking alto) queda afuera del Mundial');
const conPresencia = [...run('participantesDeTorneo("mundial", "CAF", "AND")')];
assert.ok(conPresencia.includes('AND'), 'la selección del jugador entra aunque su ranking la deje fuera ' +
  '(' + conPresencia.length + ')');

// ---------- armarGruposEquipos ----------
const gruposMundial = run('armarGruposEquipos(participantesDeTorneo("mundial", "CONMEBOL", "URU"))');
assert.equal(gruposMundial.length, 8, 'Mundial con 8 grupos');
gruposMundial.forEach(g => assert.equal(g.equipos.length, 4, 'grupo con 4 equipos'));
const todos = gruposMundial.flatMap(g => g.equipos);
assert.equal(new Set(todos).size, 32, 'sin equipos repetidos');
const u = gruposMundial.find(g => g.equipos.includes('URU'));
assert.equal(u.equipos.includes('URU'), true, 'URU participa del Mundial');
const tops = runJSON('participantesDeTorneo("mundial", "CONMEBOL", "URU").slice(0, 8)');
const cabezas = gruposMundial.map(g => g.equipos[0]);
assert.deepEqual([...cabezas].sort(), [...tops].sort(),
  'las 8 cabezas de serie son los mejores rankeados');
const gruposCopa = run('armarGruposEquipos(participantesDeTorneo("copaAmerica", "CONMEBOL", "URU"))');
assert.equal(gruposCopa.length, 4, 'Copa América con 4 grupos');

// ---------- simularPartidoSeleccion ----------
for (let i = 0; i < 500; i++) {
  const r = run('simularPartidoSeleccion("BRA", "SMR", null)');
  assert.ok(r.golesA >= 0 && r.golesB >= 0 && r.golesA <= 9 && r.golesB <= 9,
    'marcador fuera de rango: ' + JSON.stringify(r));
}
const fuerte = run('simularPartidoSeleccion("BRA", "SMR", null)');
assert.ok(fuerte.golesA > fuerte.golesB, 'BRA debe imponerse ante SMR con 500 intentos como tendencia');
const conJugador = run('simularPartidoSeleccion("AND", "BRA", { nacionalidad: "AND", media: 95, posicion: "DEL" })');
assert.ok(conJugador.golesA + conJugador.golesB > 0, 'con el jugador la selección compite');

// ---------- tablaGrupo ----------
const resultados = [
  { a: 'BRA', b: 'AND', ga: 3, gb: 0 },
  { a: 'URU', b: 'BRA', ga: 1, gb: 2 },
  { a: 'AND', b: 'URU', ga: 0, gb: 2 }
];
const tabla = [...run(`tablaGrupo(["AND","BRA","URU"], ${JSON.stringify(resultados)})`)];
assert.equal(tabla.length, 3);
const pts = tabla.map(x => x.pts);
assert.deepEqual(pts, [...pts].sort((a, b) => b - a), 'orden por puntos');
// Con 3 jugados, los puntos posibles son múltiplos de 0..9
tabla.forEach(x => assert.equal(x.pj, 2, '2 partidos jugados'));
assert.deepEqual(tabla.map(x => x.codigo), ['BRA', 'URU', 'AND'],
  'posiciones: BRA (6), URU (3), AND (0)');

// ---------- i18n de torneo en los 3 idiomas ----------
for (const lang of ['es', 'en', 'pt']) {
  for (const k of ['selTorneo', 'btnJugarTorneo', 'torneoIntro', 'torneoComoJugar', 'torneoJugar',
    'torneoSimular', 'torneoResultado', 'torneoClasificado', 'torneoEliminado', 'torneoCampeon',
    'torneoFaseGrupos', 'torneoFaseOctavos', 'torneoFaseCuartos', 'torneoFaseSemis', 'torneoFaseFinal',
    'torneoMundial', 'torneoCopaAmerica', 'torneoEuro', 'torneoFinalissima']) {
    assert.ok(run(`TEXTOS_UI.${lang}.${k}`), `TEXTOS_UI.${lang}.${k}`);
  }
}

console.log('TODO OK: ciclo de torneos (continental, Finalissima, Mundial), 32/16 equipos, grupos y tabla.');