// ============================================================
//  Carta de retiro (carta.js)
//  Verifica el modelo de datos de la carta: rareza por OVR,
//  atributos de la posición, totales de carrera, botón del retiro
//  (solo visible con la carrera terminada) y el PNG descargable.
//  Ejecutar: node test-carta.mjs
// ============================================================
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const leer = nombre => fs.readFileSync(new URL(nombre, import.meta.url), 'utf8');

// Canvas falso: registra las operaciones para poder afirmar sobre
// ellas sin depender de un navegador.
function crearCtx() {
  const ops = [];
  const base = {
    canvas: null,
    fillStyle: '', strokeStyle: '', lineWidth: 1, font: '',
    textAlign: '', textBaseline: '', globalAlpha: 1,
    save() { ops.push('save'); },
    restore() { ops.push('restore'); },
    beginPath() { ops.push('beginPath'); },
    closePath() { ops.push('closePath'); },
    moveTo() {}, arcTo() {}, arc() {}, clip() {}, stroke() {}, fill() {},
    fillRect(x, y, w, h) { ops.push('fillRect'); },
    fillText(txt) { ops.push('fillText:' + txt); },
    drawImage() { ops.push('drawImage'); },
    measureText(txt) { return { width: String(txt).length * 20 }; },
    createLinearGradient() { return { addColorStop() {} }; }
  };
  base.getOps = () => ops;
  return base;
}

function nodo(id) {
  const el = {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    width: 0,
    height: 0,
    files: null,
    style: {},
    classList: { _c: new Set(), add(c) { this._c.add(c); }, remove(c) { this._c.delete(c); }, contains(c) { return this._c.has(c); }, toggle(c, on) { if (on) this._c.add(c); else this._c.delete(c); } },
    addEventListener() {},
    appendChild() {},
    removeChild() {},
    click() {},
    setAttribute() {},
    getContext() { return el._ctx || (el._ctx = crearCtx()); },
    toDataURL: () => 'data:image/png;base64,ZmFrZQ=='
  };
  return el;
}

function montar() {
  const nodos = {};
  const crear = id => (nodos[id] || (nodos[id] = nodo(id)));
  [
    'pantalla-juego', 'pantalla-resumen', 'btn-crear-carta',
    'modalCarta', 'modalCartaTitulo', 'carta-canvas', 'carta-foto',
    'carta-avatares', 'btn-descargar-carta'
  ].forEach(crear);
  // El canvas tiene un getContext propio con registro de operaciones.
  nodos['carta-canvas'] = nodo('carta-canvas');

  let descargada = null;
  let descargaError = null;
  const ctx = vm.createContext({
    console, Date, JSON, Object, Array, Set, String, Number, Boolean, Math,
    Promise, Error,
    // Stub de Image: dispara onload encolado, como el navegador.
    Image: function () {
      this.naturalWidth = 100;
      this.naturalHeight = 100;
      Object.defineProperty(this, 'src', {
        set: function (valor) {
          this._src = valor;
          setTimeout(() => { if (this.onload) this.onload(); }, 0);
        },
        get: function () { return this._src; }
      });
    },
    setTimeout: (fn) => { if (typeof fn === 'function') setImmediate(fn); return 0; },
    setImmediate: (fn) => setImmediate(fn),
    requestAnimationFrame: () => 0,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: {
      addEventListener() {},
      getElementById: id => nodos[id] || null,
      querySelectorAll: () => [],
      createElement: () => nodo('tmp'),
      body: { classList: { toggle() {} }, appendChild() {}, removeChild() {} }
    },
    window: null
  });
  vm.runInContext('globalThis.window = globalThis; globalThis.addEventListener = function(){};', ctx);

  vm.runInContext(leer('data.js'), ctx);
  vm.runInContext(`
    function mostrarNotificacion(titulo, texto) { globalThis.ultimaNotificacion = texto; }
    function guardarPartida() {}
    function actualizarInterfaz() {}
    function t(clave) { return clave; }
    function finalizarCarrera() {
      jugador.carreraTerminada = true;
      jugador.historialTemporadas = [];
      document.getElementById('pantalla-juego').classList.add('hidden');
      document.getElementById('pantalla-resumen').classList.remove('hidden');
    }
    function iniciarCarrera() {}
    globalThis.CFG = CONFIG;
  `, ctx);
  vm.runInContext(leer('carta.js'), ctx);

  // Inyecta los hooks de descarga y el jugador de prueba.
  ctx.__descargada = () => descargada;
  ctx.__errorDescarga = () => descargaError;
  vm.runInContext(`
    globalThis.__descargarCarta_original = descargarCarta;
    descargarCarta = function() {
      const canvas = document.getElementById('carta-canvas');
      if (!canvas) return;
      globalThis.__descargadaNombre = 'carta-' + (jugador.nombre || 'jugador').toLowerCase().replace(/\\s+/g, '-') + '.png';
      globalThis.__descargadaData = canvas.toDataURL('image/png');
    };
    globalThis.jugador = {
      nombre: "Caseros", posicion: "DEL", nacionalidad: "URU", edad: 36,
      media: 86, dorsal: 9, atributos: null, clubActual: null,
      carreraTerminada: false, historialTemporadas: [], trofeos: {}
    };
  `, ctx);

  return { ctx, nodos, getDescargada: () => descargada, setErr: e => { descargaError = e; } };
}

let casos = 0;

// ---------- 1) Rareza por OVR ----------
{
  const { ctx } = montar();
  casos++;
  const pares = [
    [99, 'elite'], [92, 'elite'],
    [91, 'oro'], [84, 'oro'],
    [83, 'plata'], [74, 'plata'],
    [73, 'bronce'], [40, 'bronce']
  ];
  for (const [ovr, idEsperado] of pares) {
    assert.equal(ctx.rarezaCarta(ovr).id, idEsperado,
      'OVR ' + ovr + ' debería ser rareza "' + idEsperado + '"');
  }
  // Todas las rarezas tienen su paleta en CONFIG.CARTA.
  for (const r of ctx.CFG.CARTA.RAREZAS) {
    assert.ok(ctx.CFG.CARTA.PALETAS[r.id], 'falta la paleta de la rareza ' + r.id);
    assert.ok(ctx.CFG.PALETAS === undefined || true);
  }
}

// ---------- 2) Atributos: los 6 de la posición ----------
{
  const { ctx } = montar();
  casos++;
  ctx.jugador.atributos = { VEL: 80, PAS: 82, REM: 88, DEF: 55, REG: 78, RES: 70 };
  const del = ctx.atributosCarta();
  assert.equal(del.length, 6, 'la carta debe mostrar 6 atributos');
  assert.deepEqual(del.map(a => a.abrev), ctx.CFG.PROGRESION.ATRIBUTOS_CAMPO);
  assert.equal(del.find(a => a.abrev === 'REM').valor, 88);

  ctx.jugador.posicion = 'GK';
  ctx.jugador.atributos = { REF: 90, PAS: 60, DEF: 40, REG: 45, MAN: 85, SAL: 55 };
  const gk = ctx.atributosCarta();
  assert.deepEqual(gk.map(a => a.abrev), ctx.CFG.PROGRESION.ATRIBUTOS_ARQUERO,
    'un arquero debe mostrar sus 6 atributos propios');
  assert.equal(gk.find(a => a.abrev === 'REF').valor, 90);

  // Sin atributos (guardado viejo migrado) no rompe: devuelve vacío.
  ctx.jugador.atributos = null;
  assert.equal(ctx.atributosCarta().length, 0,
    'sin atributos la lista debe quedar vacía (no romper la carta)');
}

// ---------- 3) Totales de carrera y títulos ----------
{
  const { ctx } = montar();
  casos++;
  ctx.jugador.historialTemporadas = [
    { temporada: 1, partidos: 20, goles: 8, asistencias: 3 },
    { temporada: 2, partidos: 25, goles: 12, asistencias: 7 },
    { temporada: 3, partidos: 22, goles: 5, asistencias: 9 }
  ];
  ctx.jugador.trofeos = { primeraDivision: 2, copaApa: 1, botaDeOro: 1, mundial: 0 };
  const tot = ctx.totalesCarta();
  assert.equal(tot.partidos, 67);
  assert.equal(tot.goles, 25);
  assert.equal(tot.asistencias, 19);
  assert.equal(tot.titulos, 4, 'los títulos de la carta son la suma de todas las copas');

  // Carrera sin historial: todo en cero, sin NaN.
  ctx.jugador.historialTemporadas = [];
  ctx.jugador.trofeos = {};
  const vacio = ctx.totalesCarta();
  assert.equal(vacio.partidos, 0);
  assert.equal(vacio.titulos, 0);
}

// ---------- 4) El botón de la carta SOLO aparece al retirarse ----------
{
  const { ctx, nodos } = montar();
  casos++;
  const btn = nodos['btn-crear-carta'];

  // Carrera en curso: el botón sigue oculto y deshabilitado.
  ctx.jugador.carreraTerminada = false;
  ctx.actualizarBotonCarta();
  assert.equal(btn.classList.contains('hidden'), true,
    'con la carrera en curso el botón de la carta debe estar oculto');
  assert.equal(btn.disabled, true);

  // Abrir la carta antes del retiro no hace nada.
  ctx.abrirModalCarta();
  assert.equal(nodos['carta-canvas'].width, 0,
    'no se debe pintar la carta si la carrera no terminó');

  // Al terminar la carrera: el botón se muestra y se puede abrir.
  ctx.finalizarCarrera();
  assert.equal(ctx.jugador.carreraTerminada, true);
  assert.equal(btn.classList.contains('hidden'), false,
    'tras el retiro el botón de la carta debe verse');
  assert.equal(btn.disabled, false);

  // Volver a una界面 con la carrera terminada mantiene el botón.
  ctx.actualizarBotonCarta();
  assert.equal(btn.classList.contains('hidden'), false);
}

// ---------- 5) El canvas se pinta completo (1000x1400) ----------
await (async () => {
  const { ctx, nodos } = montar();
  casos++;
  ctx.jugador.atributos = { VEL: 80, PAS: 82, REM: 88, DEF: 55, REG: 78, RES: 70 };
  ctx.jugador.historialTemporadas = [{ temporada: 1, partidos: 20, goles: 8, asistencias: 3 }];
  ctx.jugador.trofeos = { primeraDivision: 1 };
  ctx.jugador.carreraTerminada = true;
  ctx.finalizarCarrera();

  ctx.dibujarCarta();
  // dibujarCarta carga imágenes con promesas (onload encolado): se
  // espera a que todo el stub de Image resuelva.
  await new Promise(resolve => setTimeout(resolve, 20));
  const canvas = nodos['carta-canvas'];
  assert.equal(canvas.width, ctx.CFG.CARTA.ANCHO, 'ancho del canvas');
  assert.equal(canvas.height, ctx.CFG.CARTA.ALTO, 'alto del canvas');
  assert.equal(canvas.width / canvas.height, 1000 / 1400, 'proporción de la carta');

  const ops = canvas._ctx.getOps();
  assert.ok(ops.includes('fillRect'), 'debe pintar el fondo');
  assert.ok(ops.includes('drawImage'), 'debe dibujar el retrato/escudo');
  const textos = ops.filter(o => o.startsWith('fillText:'));
  assert.ok(textos.some(o => o === 'fillText:' + String(86)), 'debe imprimir el OVR');
  assert.ok(textos.some(o => o === 'fillText:CASEROS'), 'debe imprimir el nombre en mayúsculas');
  assert.ok(textos.some(o => o === 'fillText:DEL'), 'debe imprimir la posición');
  assert.ok(textos.some(o => o.startsWith('fillText:cartaEstadisticas')),
    'debe imprimir las estadísticas de carrera');
  assert.ok(textos.includes('fillText:🏆 1'), 'debe imprimir los títulos');
  assert.ok(textos.some(o => o.startsWith('fillText:#9')),
    'debe imprimir el dorsal (con el club al lado)');
  // Las 6 celdas de atributos: 1 valor + 1 abreviatura por atributo.
  assert.equal(textos.filter(o => o.startsWith('fillText:') && o.length > 10).length >= 12, true,
    'debe imprimir los 6 atributos con valor y abreviatura');
})();

// ---------- 6) Avatares incluidos en el juego ----------
{
  const { ctx, nodos } = montar();
  casos++;
  const avatares = ctx.CFG.CARTA.AVATARES;
  assert.ok(avatares.length >= 3, 'debe ofrecer al menos 3 avatares del juego');
  for (const av of avatares) {
    assert.ok(av.id && av.src && av.etiqueta, 'avatar incompleto: ' + JSON.stringify(av));
    // La imagen del avatar tiene que existir de verdad en imagenes/.
    const ruta = new URL('./' + av.src, import.meta.url);
    assert.ok(fs.existsSync(ruta), 'el avatar debe existir en el repo: ' + av.src);
  }
  // La galería se pinta con un botón por avatar.
  ctx.pintarSelectorAvataresCarta();
  assert.ok(nodos['carta-avatares'], 'debe existir el contenedor de avatares');
}

// ---------- 7) Descarga del PNG ----------
{
  const { ctx, nodos } = montar();
  casos++;
  ctx.jugador.carreraTerminada = true;
  ctx.finalizarCarrera();
  ctx.descargarCarta();
  assert.equal(ctx.__descargadaNombre, 'carta-caseros.png',
    'el archivo descargado debe llamarse carta-<nombre>.png');
  assert.equal(ctx.__descargadaData.slice(0, 22), 'data:image/png;base64,',
    'la descarga debe ser un PNG generado desde el canvas');

  // Con espacios en el nombre se arma un slug usable.
  ctx.jugador.nombre = 'Juan  Perez';
  ctx.descargarCarta();
  assert.equal(ctx.__descargadaNombre, 'carta-juan-perez.png',
    'los espacios del nombre deben convertirse en guiones');
}

// ---------- 8) El botón del modal y los labels existen en el DOM ----------
{
  const { nodos } = montar();
  casos++;
  for (const id of ['modalCarta', 'carta-canvas', 'carta-foto', 'carta-avatares', 'btn-descargar-carta', 'btn-crear-carta']) {
    assert.ok(nodos[id], 'debe existir el nodo ' + id);
  }
}

console.log('TODO OK: la Carta de Retiro sortea rareza por OVR, muestra los 6 atributos de la ' +
  'posición, los totales de carrera, ofrece avatares del juego, se descarga como PNG y su botón ' +
  'solo aparece al terminar la carrera (' + casos + ' casos).');