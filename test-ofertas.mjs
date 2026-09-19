// Test de la mecanica de ofertas de equipos coherentes con la media (V2).
// Ejecutar: node test-ofertas.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

const contexto = vm.createContext({ window: {}, console, Math, Object, Array });
vm.runInContext(read('data.js'), contexto);

let fallos = 0;
function ok(cond, mensaje) {
  if (cond) { console.log('OK  ' + mensaje); }
  else { fallos++; console.error('FAIL ' + mensaje); }
}
const rangoDe = m => vm.runInContext(`rangoReputacionPorMedia(${m})`, contexto);

// 1) Rangos de reputacion por media
const casos = [
  [40, 1, 4, 'media 40 -> rep 1 a 4'],
  [69, 1, 4, 'media 69 -> rep 1 a 4'],
  [70, 4, 6, 'media 70 -> rep 4 a 6'],
  [74, 4, 6, 'media 74 -> rep 4 a 6'],
  [75, 6, 8, 'media 75 -> rep 6 a 8'],
  [80, 6, 8, 'media 80 -> rep 6 a 8'],
  [81, 8, 10, 'media 81 -> rep 8 a 10'],
  [99, 8, 10, 'media 99 -> rep 8 a 10']
];
casos.forEach(([media, min, max, msg]) => {
  const r = rangoDe(media);
  ok(r.min === min && r.max === max, msg);
});

// 2) Cada rango tiene clubes disponibles en CLUBES (si no, las ofertas quedarian vacias)
const clubsPorRango = vm.runInContext(`
  (function() {
    const rangos = [[1,4],[4,6],[6,8],[8,10]];
    return rangos.map(function(r) {
      return CLUBES.filter(function(c) {
        return c.reputacion >= r[0] && c.reputacion <= r[1];
      }).length;
    });
  })()
`, contexto);
ok(clubsPorRango.every(n => n > 0), 'todos los rangos tienen clubes disponibles (' + clubsPorRango.join('/') + ')');

// 3) Filtro real: para cada media, las ofertas solo traen clubes del rango
const filtroCorrecto = vm.runInContext(`
  (function() {
    const medias = [45, 60, 72, 77, 85, 95];
    return medias.every(function(m) {
      const r = rangoReputacionPorMedia(m);
      const cand = CLUBES.filter(function(c) {
        return c.reputacion >= r.min && c.reputacion <= r.max;
      });
      return cand.length > 0 && cand.every(function(c) {
        return c.reputacion >= r.min && c.reputacion <= r.max;
      });
    });
  })()
`, contexto);
ok(filtroCorrecto, 'para media 45/60/72/77/85/95 las ofertas respetan el rango');

// 4) Ofertas aleatorias a partir de los 31
const edadChk = vm.runInContext(`
  [ofertasAleatoriasPorEdad(30), ofertasAleatoriasPorEdad(31), ofertasAleatoriasPorEdad(32), ofertasAleatoriasPorEdad(35)]
`, contexto);
ok(edadChk[0] === false && edadChk[1] === false, 'hasta 31 años: ofertas coherentes (no aleatorias)');
ok(edadChk[2] === true && edadChk[3] === true, 'más de 31 años: ofertas aleatorias');

// 5) Declive por edad: arranque suave a los 31 y más fuerte despues
const d30 = vm.runInContext('calcularDecliveEdad(30)', contexto);
const d31 = vm.runInContext('calcularDecliveEdad(31)', contexto);
const d32 = vm.runInContext('calcularDecliveEdad(32)', contexto);
const d34 = vm.runInContext('calcularDecliveEdad(34)', contexto);
const d36 = vm.runInContext('calcularDecliveEdad(36)', contexto);
ok(d30 === 0, 'edad 30: sin declive');
ok(d31 >= 1 && d31 <= 2, 'edad 31: declive suave (1 o 2) -> ' + d31);
ok(d32 === 2, 'edad 32: declive 2 (más fuerte)');
ok(d34 === 3, 'edad 34: declive 3 (se acentúa)');
ok(d36 === 4, 'edad 36: declive 4');
ok(d32 > 0 && d32 >= 2, 'después de 31 la media baja más que en el arranque');

// 6) armarTresOfertas: renovación + 2 alternativas distintas, sin duplicados
const ofertasChk = vm.runInContext(`
  (function() {
    const actual = CLUBES[0];
    const pool = CLUBES.filter(function(c) { return c.reputacion >= 1 && c.reputacion <= 4; });
    const res = armarTresOfertas(pool, actual);
    const nombres = res.map(function(c) { return c.nombre; });
    return {
      cantidad: res.length,
      primeroEsActual: nombres[0] === actual.nombre,
      sinDuplicados: nombres.length === new Set(nombres).size,
      noRepiteActual: nombres.slice(1).indexOf(actual.nombre) === -1,
      todosDelPool: res.slice(1).every(function(c) {
        return pool.some(function(p) { return p.nombre === c.nombre; });
      })
    };
  })()
`, contexto);
ok(ofertasChk.cantidad === 3, 'armarTresOfertas devuelve 3 ofertas (renovación + 2)');
ok(ofertasChk.primeroEsActual, 'la primera oferta siempre es el club actual (renovación)');
ok(ofertasChk.sinDuplicados, 'no hay ofertas duplicadas');
ok(ofertasChk.noRepiteActual, 'las alternativas no repiten el club actual');
ok(ofertasChk.todosDelPool, 'las alternativas salen del pool coherente');

// 7) Pool vacío: completa con clubes del listado general (no rompe)
const poolVacio = vm.runInContext(`
  (function() {
    const res = armarTresOfertas([], CLUBES[0]);
    const nombres = res.map(function(c) { return c.nombre; });
    return { cantidad: res.length, sinDuplicados: nombres.length === new Set(nombres).size };
  })()
`, contexto);
ok(poolVacio.cantidad === 3 && poolVacio.sinDuplicados, 'pool vacío: igual devuelve 3 ofertas válidas sin duplicados');

if (fallos === 0) { console.log('TODO OK'); }
else { console.error(fallos + ' pruebas fallaron'); process.exit(1); }