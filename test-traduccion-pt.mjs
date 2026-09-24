// Prueba de cobertura de la interfaz PT-BR.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const dirReact = new URL('./react/', import.meta.url);
const fuenteReact = fs.readdirSync(dirReact).filter(n => n.endsWith('.js'))
  .map(n => fs.readFileSync(new URL(n, dirReact), 'utf8')).join('\n');
// La capa visual vive en react/*.js: las claves data-i18n están ahí.
const html = read('index.html') + fuenteReact;
const contexto = vm.createContext({ console, Math, Date, JSON, localStorage: { getItem: () => null, setItem: () => {} }, document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [] }, window: { addEventListener() {} } });
vm.runInContext(read('data.js'), contexto);
const pt = vm.runInContext('TEXTOS_UI.pt', contexto);
const clavesHtml = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => match[1]);
for (const clave of clavesHtml) assert.ok(pt[clave], `falta traducción PT-BR para ${clave}`);
assert.equal(pt.titulo, 'CARREIRA PSO');
assert.equal(pt.cuentaLogin, 'Entrar');
assert.equal(pt.rankColTitulos, 'Títulos');
assert.equal(pt.redesTitulo, '📱 Redes sociais');
assert.equal(pt.partidoTexto, 'Surge um momento decisivo na temporada. Como você quer resolvê-lo?');
assert.equal(pt.cuentaErrorAuth, 'A operação não foi autorizada. Verifique sua sessão e a confirmação do e-mail.');
console.log(`TODO OK: ${clavesHtml.length} chaves visíveis têm tradução PT-BR.`);
