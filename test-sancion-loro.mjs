// ============================================================
// test-sancion-loro.mjs - La sanción de Loro va contra el JUGADOR
// Valida que un sancionado no pueda quedarse en un club de Primera:
//   - generarOfertasDeFichaje no ofrece renovar en el club de Primera
//     sancionado, solo clubes de Segunda.
//   - Si el sancionado ya está en Segunda, puede renovar ahí.
//   - La lealtad (Modo Leal) no esquiva la sanción.
//   - armarTresOfertas no rellena con clubes de Primera cuando el pool
//     de Segunda está vacío.
// Ejecutar: node test-sancion-loro.mjs
// ============================================================
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

// Contexto base solo para leer el catalogo de clubes.
const base = vm.createContext({ console, Math, Date, JSON, Object, Array });
vm.runInContext(read('data.js'), base);
const UMBRAL = vm.runInContext('CONFIG.UMBRAL_PRIMERA', base);
const CLUB_PRIMERA = vm.runInContext('CLUBES.find(c => c.reputacion > CONFIG.UMBRAL_PRIMERA)', base);
const CLUB_SEGUNDA = vm.runInContext('CLUBES.find(c => c.reputacion <= CONFIG.UMBRAL_PRIMERA)', base);

function nodo(id) {
  return {
    id, value: '', textContent: '', innerHTML: '', innerText: '',
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    addEventListener() {}, appendChild() {}, setAttribute() {}
  };
}

// Extrae el cuerpo real de generarOfertasDeFichaje de app.js: el test corre la
// logica que se toco, no una reimplementacion.
function cuerpoGenerarOfertas() {
  const src = read('app.js');
  const ini = src.indexOf('function generarOfertasDeFichaje(ascendio = false) {');
  assert.ok(ini > 0, 'no se encontro generarOfertasDeFichaje en app.js');
  let profundidad = 0;
  let i = src.indexOf('{', ini);
  for (; i < src.length; i++) {
    if (src[i] === '{') profundidad++;
    else if (src[i] === '}') { profundidad--; if (profundidad === 0) break; }
  }
  return src.slice(src.indexOf('{', ini) + 1, i);
}

const CUERPO_OFERTAS = cuerpoGenerarOfertas();

function montar({ sancionado, clubEsPrimera, modoLeal = false, modoDesafio = false }) {
  const clubActual = clubEsPrimera ? CLUB_PRIMERA : CLUB_SEGUNDA;
  const ctx = vm.createContext({
    console, Date, JSON, Object, Array, Set, String, Number, Boolean, Math,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: {
      addEventListener() {},
      getElementById: id => nodo(id),
      querySelectorAll: () => [],
      createElement: tag => nodo(tag),
      body: { classList: { toggle() {} } }
    },
    modalFichajes: { show() {}, hide() {} },
    bootstrap: { Modal: { getOrCreateInstance: () => ({ show() {}, hide() {} }) } }
  });
  vm.runInContext('globalThis.window = globalThis;', ctx);
  vm.runInContext(read('data.js'), ctx);
  vm.runInContext(`
    function mostrarNotificacion() {}
    function guardarPartida() {}
    function actualizarInterfaz() {}
    function prepararSiguienteEvento() {}
    function iniciarTemporadaInternacional() {}
    function recuperarRangoNittox() {}
    function verificarCambioRol() {}
    function sincronizarDivision() {
      if (jugador && jugador.clubActual) {
        jugador.division = jugador.clubActual.reputacion > CONFIG.UMBRAL_PRIMERA ? 1 : 2;
      }
    }
  `, ctx);
  vm.runInContext(`
    globalThis.ofertasActuales = [];
    globalThis.jugador = {
      nombre: "Sancionado", posicion: "DEL", nacionalidad: "URU", media: 78,
      clubActual: ${JSON.stringify(clubActual)},
      temporadaActual: 8, division: ${clubEsPrimera ? 1 : 2}, rolAnterior: null,
      loroOcurrio: ${sancionado}, temporadasForzadoSegunda: ${sancionado ? 3 : 0},
      modoDesafio: ${modoDesafio}, modoLeal: ${modoLeal}, carreraTerminada: false
    };
    function generarOfertasDeFichaje(ascendio = false) {${CUERPO_OFERTAS}}
  `, ctx);
  return { ctx, clubActual };
}

let casos = 0;

// ---------- 1. Sancionado en un club de Primera: no puede renovar ahí ----------
{
  const { ctx, clubActual } = montar({ sancionado: true, clubEsPrimera: true });
  ctx.generarOfertasDeFichaje(false);
  const ofertas = [...ctx.ofertasActuales];
  assert.equal(ofertas.length, 3, 'deben ofrecerse 3 alternativas');
  assert.ok(!ofertas.some(c => c.nombre === clubActual.nombre),
    `no debe ofrecer quedarse en ${clubActual.nombre} (Primera) estando sancionado`);
  ofertas.forEach(c => assert.ok(c.reputacion <= UMBRAL,
    `sancionado en Primera no puede fichar en ${c.nombre} (rep ${c.reputacion})`));
  casos++;
}

// ---------- 2. Sin sanción: el mercado normal sí ofrece renovar ----------
{
  const { ctx, clubActual } = montar({ sancionado: false, clubEsPrimera: true });
  ctx.generarOfertasDeFichaje(false);
  assert.ok(ctx.ofertasActuales.some(c => c.nombre === clubActual.nombre),
    'sin sanción se debe poder renovar en el club de Primera');
  casos++;
}

// ---------- 3. Sancionado pero ya en Segunda: puede renovar donde está ----------
{
  const { ctx, clubActual } = montar({ sancionado: true, clubEsPrimera: false });
  ctx.generarOfertasDeFichaje(false);
  assert.ok(ctx.ofertasActuales.some(c => c.nombre === clubActual.nombre),
    'sancionado en Segunda debe poder renovar en su club');
  ctx.ofertasActuales.forEach(c => assert.ok(c.reputacion <= UMBRAL,
    `no debe salir de Segunda: ${c.nombre}`));
  casos++;
}

// ---------- 4. Modo Leal no esquiva la sanción ----------
{
  const { ctx, clubActual } = montar({
    sancionado: true, clubEsPrimera: true, modoLeal: true, modoDesafio: true
  });
  ctx.generarOfertasDeFichaje(false);
  assert.ok(ctx.ofertasActuales.length > 0, 'el Modo Leal debe abrir el mercado si hay sanción');
  assert.ok(!ctx.ofertasActuales.some(c => c.nombre === clubActual.nombre),
    'el Modo Leal no puede mantener al sancionado en Primera');
  ctx.ofertasActuales.forEach(c => assert.ok(c.reputacion <= UMBRAL,
    `sancionado en Primera no puede fichar en ${c.nombre}`));
  casos++;
}

// ---------- 5. Modo Leal sin sanción: sigue sin mercado ----------
{
  const { ctx } = montar({
    sancionado: false, clubEsPrimera: false, modoLeal: true, modoDesafio: true
  });
  ctx.generarOfertasDeFichaje(false);
  assert.deepEqual([...ctx.ofertasActuales], [], 'Modo Leal sin sanción no debe generar ofertas');
  casos++;
}

// ---------- 6. armarTresOfertas: el relleno respeta el filtro de división ----------
{
  const { ctx } = montar({ sancionado: true, clubEsPrimera: false });
  const relleno = [...ctx.armarTresOfertas([], null, c => c.reputacion <= UMBRAL)];
  assert.equal(relleno.length, 2, 'debe completar con 2 clubes del listado general');
  relleno.forEach(c => assert.ok(c.reputacion <= UMBRAL,
    `el relleno no puede devolver un club de Primera: ${c.nombre}`));
  casos++;
}

console.log(`TODO OK: la sanción de Loro saca al jugador de Primera (no lo deja renovar) y el Modo Leal no la esquiva (${casos} casos).`);
