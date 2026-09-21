// Prueba determinista del modal y del service worker; no toca la nube.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const eventos = () => ({ handlers: {}, innerHTML: '', textContent: '',
  addEventListener(tipo, fn) { this.handlers[tipo] = fn; }
});
const modal = eventos(), contenido = eventos(), estado = eventos();
const boton = eventos();
const nodos = { modalRanking: modal, 'ranking-online-contenido': contenido,
  'ranking-online-estado': estado, 'btn-ranking-actualizar': boton };
const document = Object.assign(eventos(), { visibilityState: 'visible',
  getElementById: id => nodos[id] || null });
const window = eventos();
const store = new Map(), timers = new Map();
let nextTimer = 0, lecturas = 0, fallar = false, liberar = null;
let lista = [{ user_id: 'otro', display_name: 'Primero', club: '', media: 80, titulos: 0, anio: 2026, ts: '2026-09-20T10:00:00Z' }];
const sandbox = { console, document, window, Date, Math, JSON, Promise,
  AbortController, setTimeout, clearTimeout,
  COPERO_SUPABASE: { url: 'https://proyecto-test.supabase.co', publishableKey: 'clave-publica-test' },
  setInterval(fn, ms) { const id = ++nextTimer; timers.set(id, { fn, ms, elapsed: 0 }); return id; },
  clearInterval(id) { timers.delete(id); },
  localStorage: { getItem: k => store.get(k) || null,
    setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) },
  bootstrap: { Modal: class { show() { modal.handlers['shown.bs.modal'](); } } },
  async fetch(url, opts) {
    lecturas++;
    assert.match(String(url), /copero_ranking/);
    assert.equal(opts.cache, 'no-store');
    assert.equal(opts.method, 'GET');
    assert.equal(opts.headers.apikey, 'clave-publica-test');
    if (liberar) await new Promise(resolve => { liberar.resolve = resolve; });
    if (fallar) throw new Error('Sin conexión');
    return { ok: true, json: async () => lista };
  }
};
vm.createContext(sandbox);
vm.runInContext('function guardarEnRanking() {} function mostrarRanking() {}', sandbox);
vm.runInContext(read('ranking-online.js'), sandbox);
const run = code => vm.runInContext(code, sandbox);
document.handlers.DOMContentLoaded();
run('guardarCacheOnline([{nombre:"Cache vieja",media:20}]); mostrarRanking();');
await run('rankingCarga');
assert.match(contenido.innerHTML, /Primero/);
assert.equal(lecturas, 1, 'Abrir consulta la red aunque exista caché');
const timer = [...timers.values()].find(t => t.ms === 10000);
assert.ok(timer, 'Intervalo de diez segundos activo');
async function avanzarTiempo(ms) {
  for (const t of timers.values()) {
    t.elapsed += ms;
    while (t.elapsed >= t.ms) {
      t.elapsed -= t.ms;
      await t.fn();
    }
  }
}
lista = [{ user_id: 'otro', display_name: 'Amigo nuevo', club: '', media: 92, titulos: 1, anio: 2026, ts: '2026-09-20T10:05:00Z' }];
await avanzarTiempo(15000);
assert.match(contenido.innerHTML, /Amigo nuevo/);
assert.equal(lecturas, 2, 'Se actualiza sin terminar ni crear carrera');
liberar = {};
const pendiente = timer.fn();
const duplicada = timer.fn();
assert.equal(duplicada, pendiente, 'Comparte la petición en curso');
assert.equal(lecturas, 3, 'No duplica peticiones en vuelo');
liberar.resolve(); liberar = null;
await pendiente;
fallar = true;
const anterior = contenido.innerHTML;
await timer.fn();
assert.equal(contenido.innerHTML, anterior, 'Error de red conserva resultados');
assert.match(estado.textContent, /desactualizados/);
fallar = false;
await window.handlers.online();
await run('rankingCarga');
assert.match(estado.textContent, /Consultado/);
document.visibilityState = 'hidden';
const antesOculto = lecturas;
await timer.fn();
assert.equal(lecturas, antesOculto, 'Pestaña oculta no consulta');
document.visibilityState = 'visible';
await document.handlers.visibilitychange();
assert.equal(lecturas, antesOculto + 1);
modal.handlers['hidden.bs.modal']();
assert.ok(![...timers.values()].some(t => t.ms === 10000), 'Cierre cancela intervalo');
const antesCierre = lecturas;
await timer.fn();
assert.equal(lecturas, antesCierre);
run('mostrarRanking();');
await run('rankingCarga');
assert.equal(lecturas, antesCierre + 1, 'Reabrir vuelve a consultar');
assert.equal([...timers.values()].filter(t => t.ms === 10000).length, 1);
lista = [{ user_id: 'otro', display_name: 'Al volver a Global', club: '', media: 95, titulos: 2, anio: 2026, ts: '2026-09-20T10:10:00Z' }];
const antesTab = lecturas;
modal.handlers['shown.bs.tab']({ target: { getAttribute: () => '#tab-ranking-local' } });
assert.equal(lecturas, antesTab, 'Cambiar a local no fuerza consulta');
modal.handlers['shown.bs.tab']({ target: { getAttribute: () => '#tab-ranking-online' } });
await run('rankingCarga');
assert.equal(lecturas, antesTab + 1, 'Volver a Global consulta inmediatamente');
assert.match(contenido.innerHTML, /Al volver a Global/);
// Ejecutar handler real del SW: la API debe quedar a cargo de la red.
const swHandlers = {};
vm.runInNewContext(read('sw.js'), { URL,
  self: { location: { origin: 'https://renzobarbitta.github.io' },
    addEventListener: (tipo, fn) => { swHandlers[tipo] = fn; } } });
for (const url of ['https://proyecto.supabase.co/rest/v1/copero_ranking?select=1',
  'https://ejemplo.firebaseio.com/ranking.json',
  'https://renzobarbitta.github.io/api/ranking']) {
  let interceptada = false;
  swHandlers.fetch({ request: { method: 'GET', cache: 'no-store', url },
    respondWith() { interceptada = true; } });
  assert.equal(interceptada, false, 'SW no cachea consultas de datos');
}

const rankingCtx = vm.createContext({ console, Math, Date, JSON, localStorage: { getItem: () => null, setItem: () => {} } });
vm.runInContext(read('data.js'), rankingCtx);
assert.equal(typeof vm.runInContext('compararRanking', rankingCtx), 'function', 'comparador de ranking disponible');
const ordenado = [
  { media: 80, titulos: 1, ts: 50 },
  { media: 80, titulos: 3, ts: 30 },
  { media: 79, titulos: 5, ts: 90 },
  { media: 79, titulos: 5, ts: 10 }
].sort(vm.runInContext('compararRanking', rankingCtx));
assert.deepEqual([ordenado[0].titulos, ordenado[1].titulos, ordenado[2].titulos, ordenado[3].titulos], [3, 1, 5, 5], 'OVR primero, títulos segundo y timestamp como desempate');
const configRanking = vm.runInContext('CONFIG', rankingCtx);
assert.ok(configRanking.PROMESA.PROB < 0.10, 'promesa: probabilidad baja y configurable');
assert.equal(configRanking.PROMESA.OVR_INICIAL, 70, 'promesa: OVR inicial de 70');
assert.ok(configRanking.PROB_LORO < 0.08, 'LORO: frecuencia reducida respecto al valor original');

console.log('OK: apertura, refresco, cambios remotos, concurrencia, error, reconexión, visibilidad, cierre, reapertura y exclusión de API en SW.');
