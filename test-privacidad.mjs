// Pruebas sin red: no crean cuentas ni envían correos.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const leer = nombre => fs.readFileSync(new URL(nombre, import.meta.url), 'utf8');

// Stub del SDK oficial (@supabase/supabase-js) que registra lo que se envía.
const signups = [];
const clientes = [];
const sdkStub = {
  createClient(url, key) {
    const miCliente = {
      url, key,
      auth: {
        async signUp(opciones) {
          signups.push({ url, key, opciones });
          return { data: { user: { id: 'u-1' }, session: null }, error: null };
        },
        async signInWithPassword() {
          return { data: { session: null }, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
        },
        async getSession() { return { data: { session: null }, error: null }; },
        async getUser() { return { data: { user: null }, error: null }; },
        async signOut() { return { error: null }; },
        onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; }
      },
      from(nombre) {
        return {
          select() {
            return { eq() { return { maybeSingle: async () => ({ data: null, error: null }) }; } };
          },
          upsert() { return { error: null }; }
        };
      }
    };
    clientes.push(miCliente);
    return miCliente;
  }
};

const contexto = vm.createContext({
  window: {}, COPERO_SUPABASE: { url: 'https://prueba.invalid', publishableKey: 'publica' },
  supabase: sdkStub,
  AbortController, setTimeout, clearTimeout,
  fetch: async () => ({ ok: true, text: async () => '{}' })
});
vm.runInContext(leer('cuenta-api.js'), contexto);
const api = contexto.window.CoperoCuenta;
for (const valor of [undefined, false, 'true', 1]) {
  await assert.rejects(api.registrar('test@example.com', 'password-test', valor), /privacidad/i);
}
assert.equal(signups.length, 0, 'Sin aceptar la política no debe llamarse al SDK.');
await api.registrar('test@example.com', 'password-test', true);
assert.equal(signups.length, 1);
const metadatos = signups[0].opciones.options.data;
assert.equal(metadatos.privacy_version, '2026-09-17');
assert.ok(Number.isFinite(Date.parse(metadatos.privacy_accepted_at)));
assert.equal(clientes.length, 1, 'El cliente es único y comparte la protección de privacidad.');
console.log('OK API: sin aceptar no hay red; aceptación incluye versión y fecha.');

const elementos = new Map();
function el(id) {
  if (!elementos.has(id)) elementos.set(id, {
    value: '', checked: false, hidden: false, disabled: false, textContent: '', eventos: {},
    addEventListener(tipo, fn) { this.eventos[tipo] = fn; },
    focus() { this.enfocado = true; },
    querySelectorAll() { return [...elementos.values()]; }
  });
  return elementos.get(id);
}
let registro = 0, login = 0;
const ui = vm.createContext({
  document: { getElementById: el, addEventListener: (tipo, fn) => fn() },
  window: { CoperoCuenta: {
    tieneSesion: () => false,
    registrar: async (email, pass, acepta) => { assert.equal(acepta, true); registro++; },
    entrar: async () => { login++; }, perfil: async () => 'Prueba'
  } }
});
vm.runInContext(leer('cuenta-ui.js'), ui);
const enviar = valor => el('cuenta-form').eventos.submit({ preventDefault() {}, submitter: { value: valor } });
const esperar = () => new Promise(resolve => setImmediate(resolve));
enviar('registrar');
await esperar();
assert.equal(registro, 0);
assert.equal(el('cuenta-privacidad').enfocado, true);
assert.match(el('cuenta-estado').textContent, /privacidad/i);
enviar('');
await esperar();
assert.equal(login, 1, 'Login no necesita aceptar de nuevo');
el('cuenta-privacidad').checked = true;
enviar('registrar');
await esperar();
assert.equal(registro, 1);
assert.equal(el('cuenta-privacidad').checked, false);
assert.equal(el('cuenta-pass').value, '');
console.log('OK UI: bloquea registro, enfoca casilla, permite login y reinicia aceptación.');
  const dirReact = new URL('./react/', import.meta.url);
  const fuenteReact = fs.readdirSync(dirReact).filter(n => n.endsWith('.js'))
    .map(n => fs.readFileSync(new URL(n, dirReact), 'utf8')).join('\n');
  // La casilla y los enlaces a privacidad viven ahora en react/*.js.
  const html = leer('index.html') + fuenteReact;
const checkbox = html.match(/<input[^>]+id="cuenta-privacidad"[^>]*>/)[0];
assert.ok(!/\schecked(?:\s|=|>)/.test(checkbox));
assert.equal((html.match(/href="privacidad.html"/g) || []).length, 2);
assert.ok(leer('sw.js').includes('"./privacidad.html"'));
assert.ok(leer('privacidad.html').includes('2026-09-17'));
console.log('OK HTML: casilla no premarcada, enlaces y caché de política.');
