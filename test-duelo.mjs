// Test de la logica pura del Duelo 1v1 Online (duelo.js).
// Ejecutar: node test-duelo.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

const contexto = vm.createContext({ window: {}, console });
vm.runInContext(read('data.js'), contexto);   // CLUBES, CONFIG, REGLAS_MEDIA, ROLES, obtenerRol
vm.runInContext(read('duelo.js'), contexto);  // la parte DOM se salta sola (sin document)

const L = vm.runInContext('window.CoperoDueloLogica', contexto);
if (!L) throw new Error('No se expuso window.CoperoDueloLogica');

let fallos = 0;
function ok(cond, mensaje) {
  if (cond) { console.log('OK  ' + mensaje); }
  else { fallos++; console.error('FAIL ' + mensaje); }
}
function aprox(a, b, eps, mensaje) { ok(Math.abs(a - b) <= eps, mensaje); }

// 1) Fórmula exacta del campeón del duelo
const s = { ovrMax: 80, ovrProm: 70, goles: 10, asistencias: 5, clasicos: 2 };
ok(L.calcularPuntajeDuelo(s) === 80 * 15 + 70 * 10 + 10 * 2 + 5 * 1 + 2 * 100,
  'fórmula: (OVR_Max*15)+(OVR_Prom*10)+(Goles*2)+(Asist*1)+(Clásicos*100) -> 2125');
ok(L.calcularPuntajeDuelo({ ovrMax: 0, ovrProm: 0, goles: 0, asistencias: 0, clasicos: 0 }) === 0,
  'fórmula: todo en cero -> 0');

// 2) Distancias entre zonas del arco (manhattan en grilla 2x3)
ok(L.distZonas('AI', 'AI') === 0, 'distZonas: misma zona -> 0');
ok(L.distZonas('AI', 'AC') === 1, 'distZonas: adyacente horizontal -> 1');
ok(L.distZonas('AI', 'BI') === 1, 'distZonas: adyacente vertical -> 1');
ok(L.distZonas('AI', 'AD') === 2, 'distZonas: misma fila, extremos -> 2');
ok(L.distZonas('AI', 'BD') === 3, 'distZonas: diagonal extrema -> 3');

// 3) Resolución del penal (determinística)
const r1 = L.resolverPenalDuelo('AI', 72, 'AI', 70, 70);
ok(r1.r === 'atajado', 'misma zona con potencia imperfecta -> atajado (el arquero adivinó)');
const r2 = L.resolverPenalDuelo('AI', 66, 'AI', 99, 60);
ok(r2.r === 'gol', 'misma zona pero potencia perfecta -> gol por el ángulo');
const r3 = L.resolverPenalDuelo('AI', 20, 'AC', 70, 70);
ok(r3.r === 'atajado', 'zona adyacente con potencia mala -> atajado');
const r4 = L.resolverPenalDuelo('AI', 65, 'BD', 70, 70);
ok(r4.r === 'gol', 'zona lejana con potencia buena -> gol');
const r5 = L.resolverPenalDuelo('AI', 5, 'BD', 60, 70);
ok(r5.r === 'afuera', 'zona lejana con potencia muy desviada -> afuera');
ok(L.resolverPenalDuelo('AC', 80, 'BC', 70, 95).r === L.resolverPenalDuelo('AC', 80, 'BC', 70, 95).r,
  'misma entrada -> mismo resultado (determinismo)');

// 4) Influencia del OVR en la barra de potencia
aprox(L.velocidadBarraDuelo(99), 90, 0.01, 'OVR 99: barra lenta (90 %/s)');
aprox(L.velocidadBarraDuelo(55), 142.8, 0.01, 'OVR 55: barra rápida (~142.8 %/s)');
ok(L.velocidadBarraDuelo(90) < L.velocidadBarraDuelo(60), 'mayor OVR -> barra más lenta');
ok(L.margenPotenciaDuelo(90) > L.margenPotenciaDuelo(60), 'mayor OVR -> más tolerancia de potencia');

// 5) Evento determinístico (mismo para ambos jugadores)
const e1 = L.elegirEventoDeterminista('sala-temp-1', []);
const e2 = L.elegirEventoDeterminista('sala-temp-1', []);
ok(e1 === e2, 'misma semilla -> mismo evento cruzado');
const pool = L.DUELO_EVENTOS_POOL;
ok(pool.includes(e1), 'el evento elegido pertenece al pool');
const e3 = L.elegirEventoDeterminista('sala-temp-2', pool);
ok(pool.includes(e3), 'pool agotado -> se recicla el pool completo');

// 6) Simulación de temporada del duelo (números razonables)
const jDuelo = vm.runInContext('({ posicion: "DEL", ovr: 70, moral: 60, club: CLUBES.find(c => c.nombre === "River Plate") })', contexto);
for (let i = 0; i < 200; i++) {
  const r = L.simularTemporadaDuelo(jDuelo);
  if (r.partidos < 12 || r.partidos > 38) { fallos++; console.error('FAIL partidos fuera de rango: ' + r.partidos); break; }
  if (r.goles < 0 || r.asistencias < 0) { fallos++; console.error('FAIL goles/asist negativas'); break; }
  if (r.subida < 0 || r.subida > 3) { fallos++; console.error('FAIL subida OVR fuera de rango: ' + r.subida); break; }
}
ok(true, '200 simulaciones con partidos 12..38, subida 0..3 y sin negativos');

// 7) Techo de OVR por reputación (club rep 6 -> techo 84)
const jTecho = vm.runInContext('({ posicion: "DEL", ovr: 84, moral: 60, club: { nombre: "X", reputacion: 6 } })', contexto);
const rTecho = L.simularTemporadaDuelo(jTecho);
ok(rTecho.subida === 0, 'OVR en el techo del club (rep 6 -> 84) -> sin subida por rendimiento');

// 8) KROSTY / PRIMOS cambian de club correctamente (usando DUELO_EVENTOS)
const jA = { ovr: 70, moral: 60, club: { nombre: "Viejo Club", reputacion: 5 } };
const tA = L.DUELO_EVENTOS.KROSTY.resolver("a", jA);
ok(jA.club && jA.club.nombre === 'Hasbullitah', 'KROSTY (vas) -> cambiás a Hasbullitah');
ok(/Hasbullitah/.test(tA), 'texto del cambio de club de KROSTY presente');

const jB = { ovr: 70, moral: 60, club: { nombre: "Viejo Club", reputacion: 5 } };
const tB = L.DUELO_EVENTOS.PRIMOS.resolver("b", jB);
ok(jB.club && jB.club.nombre === 'Bodo Glimt', 'PRIMOS (aceptás) -> te fuiste a Bodo Glimt');
ok(/BODO|Bodo/.test(tB), 'texto del cambio de club de PRIMOS presente');

// 9) NITTOX solo aplica a Promesa/Aspirante
const jNormal = { ovr: 60, moral: 60, club: { nombre: "X", reputacion: 5 } };
const tNormal = L.DUELO_EVENTOS.NITTOX.resolver("a", jNormal);
ok(/rango/.test(tNormal), 'NITTOX: rango Normal -> no califica');

const jPromesa = { ovr: 77, moral: 60, club: { nombre: "X", reputacion: 5 } };
let califica = null;
try { L.DUELO_EVENTOS.NITTOX.resolver("b", jPromesa); califica = true; } catch (e) { califica = false; }
ok(califica, 'NITTOX: OVR 77 (Promesa) -> la opción se resuelve sin error');

  // 10) Duelo de Reflejos - resolución determinística
  // 10a) Doble foul -> empate
  ok(L.resolverReflejoDuelo(100, true, 200, true).r === 'empate', 'reflejo: doble foul -> empate');
  // 10b) Yo foul, rival no -> pierdo
  ok(L.resolverReflejoDuelo(100, true, 200, false).r === 'pierde', 'reflejo: yo foul -> pierdo');
  // 10c) Rival foul, yo no -> gano
  ok(L.resolverReflejoDuelo(100, false, 200, true).r === 'gana', 'reflejo: rival foul -> gano');
  // 10d) Mismo tiempo -> empate
  ok(L.resolverReflejoDuelo(150, false, 150, false).r === 'empate', 'reflejo: mismo tiempo -> empate');
  // 10e) Yo más rápido -> gano
  ok(L.resolverReflejoDuelo(120, false, 200, false).r === 'gana', 'reflejo: yo más rápido -> gano');
  // 10f) Rival más rápido -> pierdo
  ok(L.resolverReflejoDuelo(200, false, 120, false).r === 'pierde', 'reflejo: rival más rápido -> pierdo');
  // 10g) Timeout (9999) vs tiempo válido -> pierde el timeout
  ok(L.resolverReflejoDuelo(9999, false, 150, false).r === 'pierde', 'reflejo: timeout vs válido -> pierde timeout');
  ok(L.resolverReflejoDuelo(150, false, 9999, false).r === 'gana', 'reflejo: válido vs timeout -> gana');


if (fallos === 0) { console.log('TODO OK'); }
else { console.error(fallos + ' pruebas fallaron'); process.exit(1); }
