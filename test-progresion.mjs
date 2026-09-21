// Test del sistema de progresión por atributos (progression.js).
// Ejecutar: node test-progresion.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

const contexto = vm.createContext({ window: {}, console, Math, Object, Array, Number, String, parseInt, JSON });
vm.runInContext(read('data.js'), contexto);
vm.runInContext(read('progression.js'), contexto);

let fallos = 0;
function ok(cond, mensaje) {
  if (cond) { console.log('OK  ' + mensaje); }
  else { fallos++; console.error('FAIL ' + mensaje); }
}

const W = contexto.window;
const POSICIONES = ['DEL', 'CM', 'DEF', 'GK'];

// 1) Atributos de posición: 6 únicos por posición y distintos campo/arco
POSICIONES.forEach(pos => {
  const lista = W.atributosDePosicion(pos);
  const unicos = new Set(lista).size === lista.length;
  ok(unicos && lista.length === 6, pos + ' tiene 6 atributos únicos');
});
const campo = W.atributosDePosicion('DEL').slice();
const arco = W.atributosDePosicion('GK').slice();
ok(campo.some(a => !arco.includes(a)) && arco.some(a => !campo.includes(a)), 'atributos de campo y arco son distintos');

// 2) Pesos suman 1 por posición
POSICIONES.forEach(pos => {
  const pesos = W.PESOS_ATRIBUTOS[pos];
  const suma = Object.keys(pesos).reduce((s, k) => s + pesos[k], 0);
  ok(Math.abs(suma - 1) < 1e-9, 'pesos de ' + pos + ' suman 1 (' + suma.toFixed(3) + ')');
});

// 3) OVR inicial exacto: 65 normal / 75 promesa (varias semillas)
['DEL', 'CM', 'DEF', 'GK'].forEach(pos => {
  let normalOk = true, promesaOk = true;
  for (let i = 0; i < 25; i++) {
    const n = W.generarAtributosIniciales(pos, false);
    if (W.calcularOVR(n, pos) !== 65) { normalOk = false; break; }
  }
  for (let i = 0; i < 25; i++) {
    const p = W.generarAtributosIniciales(pos, true);
    if (W.calcularOVR(p, pos) !== 75) { promesaOk = false; break; }
  }
  ok(normalOk, pos + ' OVR inicial normal siempre 65');
  ok(promesaOk, pos + ' OVR inicial promesa siempre 75');
});

// 4) Migración: generarAtributosConOVR llega al objetivo
[40, 60, 72, 82, 90, 99].forEach(target => {
  const attrs = W.generarAtributosConOVR('DEL', target);
  ok(W.calcularOVR(attrs, 'DEL') === target, 'generarAtributosConOVR(64,' + target + ') = ' + target);
});

// 5) Entrenamiento determinista (dado controlado), factor 1.0 (valor bajo)
const attrsEnt = W.generarAtributosIniciales('DEL', false);
const valOriginal = attrsEnt.REM;
const r1 = W.entrenarAtributoConDado(attrsEnt, 'REM', 'DEL', () => 0.5);
ok(r1.exitoso && r1.delta === 1 && attrsEnt.REM === valOriginal + 1, 'dado 0.5 -> REM +1');
const s2 = W.generarAtributosIniciales('DEL', false); s2.REM = 40;
const r2 = W.entrenarAtributoConDado(s2, 'REM', 'DEL', () => 0.85);
ok(r2.exitoso && r2.delta === 2, 'dado 0.85 -> REM +2');
const s3 = W.generarAtributosIniciales('DEL', false); s3.REM = 40;
const r3 = W.entrenarAtributoConDado(s3, 'REM', 'DEL', () => 0.96);
ok(r3.exitoso && r3.delta === 3, 'dado 0.96 -> REM +3');

// 6) Dificultad por rango: valor alto baja la probabilidad (falla posible)
const attrsAlto = Object.assign({}, attrsEnt, { REM: 80 });
const rFallido = W.entrenarAtributoConDado(attrsAlto, 'REM', 'DEL', () => 0.99);
ok(rFallido.exitoso === false && attrsAlto.REM === 80, 'REM 80 + dado 0.99 -> falla y no modifica nada');
const rDificil = W.entrenarAtributoConDado(attrsAlto, 'REM', 'DEL', () => 0.45);
ok(rDificil.exitoso && attrsAlto.REM > 80, 'REM 80 + dado 0.45 -> con dificultad todavía puede subir');

// 7) Entrenar un atributo que no corresponde a la posición no muta nada
const attrsArco = W.generarAtributosIniciales('GK', false);
const antes = JSON.parse(JSON.stringify(attrsArco));
const rInv = W.entrenarAtributoConDado(attrsArco, 'REM', 'GK', () => 0.1);
ok(!rInv.exitoso && JSON.stringify(antes) === JSON.stringify(attrsArco), 'GK no puede entrenar REM y no se modifica nada');

// 8) Evento oculto: aplicarCambioMediaOculto cambia el OVR sin tocar media
const attrsEv = W.generarAtributosIniciales('DEL', false);
const ovrBase = W.calcularOVR(attrsEv, 'DEL');
const ovrNuevo = W.aplicarCambioMediaOculto(attrsEv, 'DEL', 3);
ok(ovrNuevo === ovrBase + 3, 'evento +3 OVR: ' + ovrBase + ' -> ' + ovrNuevo);
const ovrBaja = W.aplicarCambioMediaOculto(attrsEv, 'DEL', -2);
ok(ovrBaja === ovrBase + 1, 'luego -2 OVR sobre el mismo perfil (atributos ya subidos) coherente');

// 9) El training de racha (OVR como media ponderada) no puede exceder 99
const attrsTop = {};
for (const a of W.atributosDePosicion('DEL')) attrsTop[a] = 99;
ok(W.calcularOVR(attrsTop, 'DEL') === 99, 'todos los atributos 99 -> OVR 99');

console.log('');
if (fallos > 0) {
  console.error('FALLARON ' + fallos + ' pruebas');
  process.exit(1);
} else {
  console.log('Todas las pruebas pasaron.');
}