// Test de la logica pura del Cooperativo "Dupla de Carreras" (coop.js).
// Ejecutar: node test-coop.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

const contexto = vm.createContext({ window: {}, console });
vm.runInContext(read('data.js'), contexto);   // CLUBES, CONFIG, SELECCIONES, seleccionPorCodigo
vm.runInContext(read('duelo.js'), contexto);  // hashSemilla usada por hashCoop
vm.runInContext(read('coop.js'), contexto);   // la parte DOM se salta sola (sin document)

const L = vm.runInContext('window.CoperoCoopLogica', contexto);
if (!L) throw new Error('No se expuso window.CoperoCoopLogica');

let fallos = 0;
function ok(cond, mensaje) {
  if (cond) { console.log('OK  ' + mensaje); }
  else { fallos++; console.error('FAIL ' + mensaje); }
}

// 1) Configuración central de la dupla
ok(L.COOP_CFG.TEMPORADAS === 8, 'COOP_CFG: 8 temporadas');
ok(L.COOP_CFG.EDAD_INICIO === 22, 'COOP_CFG: edad inicial 22');
ok(L.COOP_CFG.META_GOLES_INT_POR_TEMP === 2, 'COOP_CFG: meta de 2 goles de selección por temporada');
ok(L.COOP_CFG.META_TROFEOS_MIN === 2, 'COOP_CFG: meta mínima de 2 trofeos');
ok(JSON.stringify(L.COOP_CFG.TACTICAS) === JSON.stringify(["A", "B", "C"]), 'COOP_CFG: tácticas A, B, C');
ok(JSON.stringify(Object.keys(L.COOP_TACTICAS)) === JSON.stringify(["A", "B", "C"]),
  'COOP_TACTICAS: tres tácticas con label/desc');

// 2) Hash y semilla deterministas
ok(L.hashCoop("misma") === L.hashCoop("misma") && L.hashCoop("otra") !== L.hashCoop("misma"),
  'hashCoop: determinista y sensible a la entrada');
ok(L.semillaCoop("sala", 3, "tactica") === L.semillaCoop("sala", 3, "tactica"),
  'semillaCoop: misma sala+temporada+clave -> misma semilla');
ok(L.semillaCoop("sala", 1, "tactica") !== L.semillaCoop("sala", 2, "tactica"),
  'semillaCoop: temporadas distintas -> semillas distintas');

// 3) PRNG determinista (mulberry32)
const rngA = L.prngDeterminista(42), rngB = L.prngDeterminista(42), rngC = L.prngDeterminista(99);
const secA = [rngA(), rngA(), rngA()], secB = [rngB(), rngB(), rngB()];
ok(JSON.stringify(secA) === JSON.stringify(secB), 'prng: misma semilla -> misma secuencia');
ok(JSON.stringify(secA) !== JSON.stringify([rngC(), rngC(), rngC()]), 'prng: semilla distinta -> secuencia distinta');
ok(secA.every(function(x) { return x >= 0 && x < 1; }), 'prng: valores en [0,1)');

// 4) Construcción del jugador real de la dupla
const jMio = L.construirMiCoop("Tano", "A", "sala-1");
ok(jMio.apodo === "Tano" && jMio.rol === "A", 'construirMiCoop: apodo y rol');
ok(jMio.ovr === 60 && jMio.moral === 60 && jMio.edad === 22, 'construirMiCoop: OVR 60, moral 60, edad 22');
ok(["DEL", "CM", "DEF", "GK"].includes(jMio.posicion), 'construirMiCoop: posición válida: ' + jMio.posicion);
ok(L.construirMiCoop("X", "A", "sala-1").posicion === L.construirMiCoop("X", "A", "sala-1").posicion,
  'construirMiCoop: posición determinista para la misma sala');

// 5) Club y dupla compartida
const club6 = L.clubDeReputacionCoop(6);
ok(club6 && club6.reputacion >= 6, 'clubDeReputacionCoop: rep 6 -> club de rep >= 6');
const dupla = L.construirDuplaCoop({ rep: 5, sel: "URU" }, "sala-1");
ok(dupla.club && dupla.seleccion && dupla.seleccion.codigo === "URU", 'construirDuplaCoop: club + selección URU');
ok(dupla.golesSeleccion === 0 && dupla.partidosSeleccion === 0, 'construirDuplaCoop: cero de partidos y goles');
const duplaARG = L.construirDuplaCoop({ rep: 7 }, "x");
ok(duplaARG.seleccion.codigo === "ARG" &&
  vm.runInContext('seleccionPorCodigo("ARG").fuerza', contexto) === duplaARG.seleccion.fuerza,
  'construirDuplaCoop: sin selección -> fallback ARG con su fuerza');

// 6) Trofeos del club compartido (deterministas con el mismo rand)
function randFijo(v) { return function () { return v; }; }
ok(L.simularTrofeosCoop(7, 80, randFijo(0.9)).length === 0, 'trofeos: rep alta y rand alto -> nada (suerte mala)');
ok(L.simularTrofeosCoop(7, 80, randFijo(0)).length >= 1, 'trofeos: rep alta y rand 0 -> al menos Primera División');
ok(L.simularTrofeosCoop(4, 70, randFijo(0)).length >= 1, 'trofeos: rep baja y rand 0 -> al menos Segunda División');
ok(L.claveTrofeoCoop("🏆 Primera División") === "primera", 'claveTrofeoCoop: mapea Primera División');
ok(L.claveTrofeoCoop("👑 Copa de Campeones") === "copaCam", 'claveTrofeoCoop: mapea Copa de Campeones');
ok(L.claveTrofeoCoop("Otro título") === null, 'claveTrofeoCoop: nombre desconocido -> null');

// 7) Meta del proyecto de la dupla (requiere a AMBOS)
ok(!L.metaCoopCumplida(10, 8, 2), 'meta: 10 goles en 8 temporadas < 16 -> NO cumple');
ok(L.metaCoopCumplida(16, 8, 2), 'meta: 16 goles en 8 temporadas y 2 trofeos -> cumple');
ok(!L.metaCoopCumplida(16, 8, 1), 'meta: 16 goles pero 1 solo trofeo -> NO cumple');
ok(L.metaCoopCumplida(20, 8, 3), 'meta: 20 goles y 3 trofeos -> cumple');

// 8) Rival de la selección de la dupla
const uru = vm.runInContext('seleccionPorCodigo("URU")', contexto);
const rival1 = L.rivalSeleccionCoop(uru, "sala-1", 4);
const rival2 = L.rivalSeleccionCoop(uru, "sala-1", 4);
ok(rival1.codigo === rival2.codigo, 'rival: determinista con la misma sala+temporada');
ok(rival1.codigo !== "URU", 'rival: nunca es la propia selección');
ok(rival1.fuerza && rival1.nombre && rival1.bandera, 'rival: expone codigo, nombre, bandera, fuerza');

// 9) Momento cooperativo: táctica a ciegas (resolución con rand conocido)
const sel90 = { codigo: "X", nombre: "X", bandera: "", fuerza: 90 };
const partido = { fuerzaRival: 80 };
// A+A: sincronía +1 y presión total +2 -> base(rand 0 = 1) + 3 = 4 goles, moral +8
const aa = L.resolverDecisionCoop(sel90, partido, "A", "A", randFijo(0));
ok(aa.sincronia === true && aa.bonusMoral === 8, 'táctica A+A: sincronía + presión total (moral +8)');
ok(aa.golesSel === 4, 'táctica A+A: base 1 + 1 sincronía + 2 presión = 4 goles');
// C+C: sincronía +1 pero demasiado conservador -1 -> base 1 + 0 = 1 gol
const cc = L.resolverDecisionCoop(sel90, partido, "C", "C", randFijo(0));
ok(cc.sincronia === true && cc.bonusMoral === 5 && cc.golesSel === 1,
  'táctica C+C: sincronía (moral +5) pero muy conservador -> 1 gol');
// A vs C: desorden -> -2, base 1 - 2 = 0 goles, sin sincronía
const ac = L.resolverDecisionCoop(sel90, partido, "A", "C", randFijo(0));
ok(ac.sincronia === false && ac.bonusMoral === 0 && ac.golesSel === 0,
  'táctica A vs C: desorden -> 0 goles, sin moral');
// B+B: sincronía pura -> base 1 + 1 = 2 goles
const bb = L.resolverDecisionCoop(sel90, partido, "B", "B", randFijo(0));
ok(bb.sincronia === true && bb.golesSel === 2, 'táctica B+B: sincronía -> 2 goles');
// golesSel nunca negativo incluso con combinaciones a ciegas
let nuncaNegativo = true;
for (let i = 0; i < 500; i++) {
  const tact = ["A", "B", "C"][i % 3];
  const r = L.resolverDecisionCoop(sel90, partido, tact, tact, randFijo(0.4));
  if (r.golesSel < 0) { nuncaNegativo = false; break; }
}
ok(nuncaNegativo, 'táctica: goles de selección nunca negativos');

// 10) Determinismo del momento cooperativo (misma semilla, mismas decisiones)
const rngT1 = L.prngDeterminista(L.semillaCoop("sala-1", 3, "tactica"));
const rngT2 = L.prngDeterminista(L.semillaCoop("sala-1", 3, "tactica"));
const dec1 = L.resolverDecisionCoop(sel90, partido, "A", "A", rngT1);
const dec2 = L.resolverDecisionCoop(sel90, partido, "A", "A", rngT2);
ok(dec1.golesSel === dec2.golesSel && dec1.golesRiv === dec2.golesRiv && dec1.victoria === dec2.victoria,
  'momento cooperativo: ambos jugadores computan el MISMO marcador');
ok(dec1.victoria === (dec1.golesSel > dec1.golesRiv) && dec1.empate === (dec1.golesSel === dec1.golesRiv),
  'momento cooperativo: victoria/empate coherentes');

// 11) Resumen y aporte individual
const jHist = {
  apodo: "Tano", rol: "A", posicion: "DEL", ovr: 78, goles: 12, asistencias: 7,
  historial: [{ ovr: 70 }, { ovr: 80 }]
};
const res = L.resumenCoop(jHist);
ok(res.ovrMax === 80 && res.ovrProm === 75, 'resumenCoop: OVR máx 80, promedio 75 (historial)');
ok(res.apodo === "Tano" && res.posicion === "DEL", 'resumenCoop: apodo y posición');
ok(L.calcularAporteCoop({ ovrMax: 80, ovrProm: 75, goles: 12, asistencias: 7 }) === 80 * 15 + 75 * 10 + 12 * 2 + 7,
  'aporte: (OVR_Max*15)+(OVR_Prom*10)+(Goles*2)+(Asist*1)');
ok(L.calcularAporteCoop({ ovrMax: 0, ovrProm: 0, goles: 0, asistencias: 0 }) === 0, 'aporte: todo en cero -> 0');

// 12) Proyecto final de la dupla (aporta cada uno + selección + club compartido)
const miRes = L.resumenCoop({ apodo: "A", rol: "A", posicion: "DEL", ovr: 80, goles: 10, asistencias: 5, historial: [{ ovr: 80 }] });
const soRes = L.resumenCoop({ apodo: "B", rol: "B", posicion: "CM", ovr: 74, goles: 6, asistencias: 4, historial: [{ ovr: 74 }] });
const duplaFin = {
  golesSeleccion: 16, partidosSeleccion: 8,
  trofeos: { primera: 1, copaAr: 1 }, detalleTrofeos: {}
};
const proy = L.calcularProyectoCoop(miRes, soRes, duplaFin, 8);
ok(proy.aporteMi === 80 * 15 + 80 * 10 + 10 * 2 + 5 && proy.aporteSocio === 74 * 15 + 74 * 10 + 6 * 2 + 4,
  'proyecto: aportes individuales calculados con la fórmula');
ok(proy.golesSel === 16 && proy.partidosSel === 8 && proy.trofeos === 2, 'proyecto: resumen de la dupla');
ok(proy.puntaje === proy.aporteMi + proy.aporteSocio + 16 * 5 + 2 * 50,
  'proyecto: puntaje = aportes + golesSel*5 + trofeos*50');
ok(proy.meta === true, 'proyecto: 16 goles y 2 trofeos -> meta cumplida');

// 13) Semilla del servidor condiciona la determinación
L._setSemillaServidor("server-seed-1");
const semConServidor = L.semillaCoop("sala-1", 3, "tactica");
L._setSemillaServidor(null);
const semSinServidor = L.semillaCoop("sala-1", 3, "tactica");
ok(semConServidor !== semSinServidor, 'semilla del servidor cambia el desenlace (jugador no puede armar estrategia cómoda)');
ok(L.semillaCoop("sala-1", 3, "tactica") === semSinServidor, 'sin servidor: semilla estable del topic');

if (fallos === 0) { console.log('TODO OK'); }
else { console.error(fallos + ' pruebas fallaron'); process.exit(1); }