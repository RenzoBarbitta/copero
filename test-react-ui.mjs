// ============================================================
// Prueba de la capa visual en React (react/*.js).
// Renderiza el árbol completo en un sandbox (vm) con htm real de
// vendor/ y un stub de React.createElement, y verifica que el
// DOM resultante sea ESPEJO del index.html original:
//   - mismos id (177, sin duplicados),
//   - mismas claves data-i18n (157 apariciones),
//   - mismos label for, handlers onclick y selectores de estado.
// Ejecutar: node test-react-ui.mjs
// ============================================================
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const leer = n => fs.readFileSync(new URL(n, import.meta.url), 'utf8');
const carpetaReact = new URL('./react/', import.meta.url);

// ---------- Listas de referencia (index.html previo al port) ----------
const IDS_ORIGINALES = ('app-ruta,atributos-vista,aviso-minijuego-usado,barraTL,bloque-modos-juego,' +
  'botonesEntrenamiento,btn-aceptar-evento,btn-continuar,btn-coop-online,btn-duelo-online,btn-entrenar-atributos,' +
  'btn-evento-unico,btn-iniciar,btn-instalar,btn-jugar-partido,btn-minijuego-especifico,btn-modo-desafio,' +
  'btn-modo-oscuro,btn-modo-oscuro-perfil,btnPatearTL,btn-ranking,btn-ranking-actualizar,btnTirarDardo,' +
  'camiseta-badge,camiseta-preview,cancha-selector,carrera-club-local,carrera-club-rival,carrera-competen,' +
  'carrera-escudo-local,carrera-escudo-rival,carrera-partidos-aprox,club-img,columna-redes,contenedorDardos,' +
  'contenedorMinijuegoCamiseta,contenedor-ofertas,contenido-juego,cuenta-apodo,cuenta-email,cuenta-estado,' +
  'cuenta-form,cuenta-leer,cuenta-panel,cuenta-pass,cuenta-perfil,cuenta-privacidad,cuenta-privacidad-ayuda,' +
  'cuenta-salir,cuenta-vista,decisionModal,decisionModalCuerpo,decisionModalTitulo,duelo-vista,escaneoSSAnim,' +
  'evento-card,evento-nombre,evol-vista,fichajes-temp,fila-utilidades,indicacionMinijuegoCamiseta,infoModal,' +
  'infoModalCuerpo,infoModalTitulo,input-dorsal,input-nombre,instruccionDardos,instruccionTL,j-atributos,' +
  'j-club,j-edad,j-media,j-moral,j-nombre,j-posicion,j-seleccion,logros-vista,marcadorDardos,mensaje-espera-eventos,' +
  'modalConfiguracion,modalDardos,modalDardosTitulo,modalDominios,modalDominiosTitulo,' +
  'modalEntrenamientoAtributos,modalEntrenamientoCuerpo,modalEntrenamientoTitulo,modal-fichajes,' +
  'modalMinijuegoCamiseta,modalMomentosClave,modalMomentosClaveCuerpo,modalMomentosClaveFooter,' +
  'modalMomentosClaveTitulo,modalPartidoInteractivo,modalPartidoInteractivoTitulo,modalPenal,modalRanking,' +
  'modalRankingTitulo,modalRedesSociales,modalRedesSocialesTitulo,modalRol,modalSS,modalTiroLibre,' +
  'modalTLTitulo,nav-inferior,panel-atributos,pantalla-inicio,pantalla-juego,pantalla-resumen,' +
  'partidoInteractivoTexto,penalFooter,penalResultado,perfil-menu,perfil-menu-movil,pesta-com-cuenta,' +
  'pesta-com-duelo,pesta-com-ranking,pesta-prog-evol,pesta-prog-logros,pesta-prog-stats,pesta-prog-temp,' +
  'ranking-online-contenido,ranking-online-estado,ranking-vista,redes-feed,redes-feed-lateral,res-asist,' +
  'res-goles,res-media,res-num-temp,res-pj,res-titulos,resultadoDardos,resultadoDominios,' +
  'resultadoEntrenamiento,resultadoMinijuegoCamiseta,resultadoSS,resultadoTL,resumen-asist,resumen-final,' +
  'resumen-goles,resumen-nombre,resumen-pj,resumen-posicion,resumen-rol,rol-badge,rolModalDescripcion,' +
  'rolModalEmoji,rolModalNombre,rolModalOVR,secuenciaObjetivo,select-idioma,select-idioma-perfil,' +
  'selector-idioma,select-nacionalidad,select-posicion,sidebar,stats-vista,support-estado,tab-com-cuenta,' +
  'tab-com-duelo,tab-com-ranking,tabla-resumen-body,tabla-temporadas-body,tab-prog-evol,tab-prog-logros,' +
  'tab-prog-stats,tab-prog-temp,tab-ranking-online,temporada-actual,tiempoDominios,tiempoDominiosRow,' +
  'tituloMinijuegoCamiseta,tj-posicion-linea,toast-copero,topbar,vista-carrera,vista-comunidad,' +
  'btn-nacionalidad,nacionalidad-bandera,nacionalidad-card,nacionalidad-confed,nacionalidad-flecha,' +
  'nacionalidad-nombre,nacionalidad-panel,seccion-internacional,seleccion-card-bandera,seleccion-card-confed,' +
  'seleccion-card-nombre,sel-capitan,sel-estado,sel-goles,sel-partidos,sel-torneo,btn-torneo-seleccion,' +
  'vista-entrenamiento,vista-progreso').split(',');

// Handlers inline originales del index.html (onclick="…").
const HANDLERS_ORIGINALES = ('abrirConfiguracion,abrirEntrenamientoAtributos,abrirModalEvento,' +
  'abrirPanelCuenta,abrirPantallaCoop,abrirPantallaDuelo,abrirSelectorMinijuegos,cerrarModalPenal,cerrarSesionPerfil,' +
  'continuarCarrera,detenerTiroLibre,elegirIdioma,iniciarCarrera,iniciarCarreraLeal,' +
  'iniciarMinijuegoDominios,iniciarMinijuegoEntrenamiento,iniciarMinijuegoPenales,irA,jugarMomentosClave,' +
  'jugarPartidoContraRival,mostrarRedesSociales,mostrarSlots,patearPenal,reiniciarCarrera,' +
  'simularPartidoNormal,toggleAtributosPanel').split(',');

const FOR_ORIGINALES = ('cuenta-email,cuenta-pass,cuenta-privacidad,cuenta-apodo,input-nombre,' +
  'input-dorsal,select-idioma-perfil,btn-modo-oscuro-perfil').split(',');

const TOTAL_DATA_I18N = 186; // +3 card de nacionalidad (…) +4 tarjeta Internacional +2 torneo +1 coop

// ---------- Sandbox con React en stub y htm real de vendor/ ----------
let raiz = null;

function crearElemento(tipo, props) {
  const resto = Array.prototype.slice.call(arguments, 2);
  const p = Object.assign({}, props || {});
  if (resto.length === 1) p.children = resto[0];
  else if (resto.length > 1) p.children = resto;
  return { tipo: tipo, props: p, hijos: resto };
}

const ReactStub = {
  createElement: crearElemento,
  Fragment: '@@Fragment',
  useState: function (inicial) {
    return [typeof inicial === 'function' ? inicial() : inicial, function () {}];
  },
  useEffect: function () {}
};

const ReactDOMStub = {
  createRoot: function () {
    return { render: function (elemento) { raiz = elemento; } };
  },
  flushSync: function (fn) { fn(); }
};

const sandbox = {
  console, Math, Date, JSON, Symbol, Map, Set, Promise, RegExp, Error,
  setTimeout: function () {}, clearTimeout: function () {},
  requestAnimationFrame: function () { return 0; },
  React: ReactStub,
  ReactDOM: ReactDOMStub,
  document: {
    getElementById: function (id) { return id === 'aplicacion' ? { nodeType: 1 } : null; },
    addEventListener: function () {},
    readyState: 'loading'
  }
};
sandbox.window = sandbox;
vm.createContext(sandbox);

vm.runInContext(leer('vendor/htm.umd.js'), sandbox, { filename: 'htm.umd.js' });
assert.equal(typeof sandbox.htm, 'function', 'vendor/htm.umd.js debe exponer htm');

const ORDEN = ['nucleo', 'fx', 'chrome', 'inicio', 'inicio-cancha', 'inicio-modos', 'inicio-apoyo',
  'juego-tarjeta', 'vista-carrera', 'vista-carrera2', 'vista-extra', 'vista-progreso', 'resumen',
  'modales-1', 'modales-2', 'modales-3', 'modales-4', 'modales-5', 'modales-6', 'modales-7', 'montar'];
for (const nombre of ORDEN) {
  vm.runInContext(leer('react/' + nombre + '.js'), sandbox, { filename: 'react/' + nombre + '.js' });
}
assert.ok(raiz, 'montar.js debe montar el árbol en #aplicacion');

// ---------- Recorrido del árbol renderizado ----------
const ids = [], clavesI18n = [], fors = [], privacidad = [], idiomas = [], secciones = [], posiciones = [];
const requeridos = [], ocultos = [];
const clases = {};
let registroCrear = null;
let privMarcada = null;

function recorrer(nodo) {
  if (nodo === null || nodo === undefined || typeof nodo === 'boolean') return;
  if (Array.isArray(nodo)) { nodo.forEach(recorrer); return; }
  if (typeof nodo === 'string' || typeof nodo === 'number') return;
  const props = nodo.props || {};
  if (typeof nodo.tipo === 'function') { recorrer(nodo.tipo(props)); return; }
  if (nodo.tipo === ReactStub.Fragment) { recorrer(nodo.hijos); return; }
  if (typeof props.id === 'string') {
    ids.push(props.id);
    clases[props.id] = props.className || '';
    if (props.hidden === true) ocultos.push(props.id);
    if (props.required === true) requeridos.push(props.id);
    if (props.id === 'cuenta-privacidad') privMarcada = !!props.checked;
  }
  if (props['data-i18n']) clavesI18n.push(props['data-i18n']);
  if (props.htmlFor) fors.push(props.htmlFor);
  if (props.href === 'privacidad.html') privacidad.push(1);
  if (props['data-idioma']) idiomas.push(props['data-idioma']);
  if (props['data-seccion']) secciones.push(props['data-seccion']);
  if (props['data-pos']) posiciones.push(props['data-pos']);
  if (props.value === 'registrar') registroCrear = props;
  recorrer(nodo.hijos);
}
recorrer(raiz);

// ---------- 1) IDs: mismo conjunto que el HTML original ----------
const faltan = IDS_ORIGINALES.filter(id => !ids.includes(id));
const sobran = ids.filter(id => !IDS_ORIGINALES.includes(id));
assert.equal(ids.length, IDS_ORIGINALES.length,
  'cantidad de ids ' + ids.length + ' != ' + IDS_ORIGINALES.length +
  ' | faltan: [' + faltan.join(',') + '] | sobran: [' + sobran.join(',') + ']');
assert.equal(new Set(ids).size, ids.length,
  'ids duplicados: ' + ids.filter((id, i) => ids.indexOf(id) !== i).join(','));
assert.equal(faltan.length, 0, 'faltan ids: ' + faltan.join(','));
assert.equal(sobran.length, 0, 'sobran ids: ' + sobran.join(','));

// ---------- 2) data-i18n: misma cantidad y todas traducidas al PT ----------
assert.equal(clavesI18n.length, TOTAL_DATA_I18N,
  'data-i18n renderizados ' + clavesI18n.length + ' != ' + TOTAL_DATA_I18N);
const ctxDatos = vm.createContext({
  console, Math, Date, JSON,
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [] },
  window: { addEventListener() {} }
});
vm.runInContext(leer('data.js'), ctxDatos);
const pt = vm.runInContext('TEXTOS_UI.pt', ctxDatos);
for (const clave of new Set(clavesI18n)) {
  assert.ok(pt[clave], 'falta traducción PT-BR para ' + clave);
}

// ---------- 3) labels for= ----------
assert.deepEqual([...new Set(fors)].sort(), [...FOR_ORIGINALES].sort(), 'labels for= distintos');

// ---------- 4) href privacidad.html (footer + panel de cuenta) ----------
assert.equal(privacidad.length, 2, 'href privacidad.html renderizados: ' + privacidad.length + ' != 2');

// ---------- 5) handlers: mismos que los onclick originales y definidos en la base ----------
const fuentesReact = fs.readdirSync(carpetaReact)
  .filter(n => n.endsWith('.js'))
  .map(n => leer('react/' + n))
  .join('\n');
const handlers = new Set();
for (const m of fuentesReact.matchAll(/onClick=\$\{\(\)\s*=>\s*([A-Za-z_$][\w$]*)\s*\(/g)) handlers.add(m[1]);
assert.deepEqual([...handlers].sort(), [...HANDLERS_ORIGINALES].sort(),
  'handlers onClick distintos de los onclick originales');
const base = ['data.js', 'progression.js', 'event-outcomes.js', 'minigame-camiseta.js', 'app.js',
  'features.js', 'camiseta.js', 'touch-controls.js', 'supabase-config.js', 'cuenta-api.js',
  'ranking-online.js', 'cuenta-ui.js', 'duelo.js', 'coop.js', 'ui.js', 'pwa.js'].map(leer).join('\n');
for (const h of handlers) {
  assert.match(base, new RegExp('function\\s+' + h + '\\s*\\('), 'handler sin definir en la base: ' + h);
}

// ---------- 6) Estados de navegación y formularios ----------
assert.match(clases['pantalla-juego'], /hidden/, 'pantalla-juego debe iniciar oculta');
assert.match(clases['pantalla-resumen'], /hidden/, 'pantalla-resumen debe iniciar oculta');
assert.doesNotMatch(clases['pantalla-inicio'], /hidden/, 'pantalla-inicio debe iniciar visible');
assert.match(clases['select-idioma'], /hidden/);
assert.match(clases['select-posicion'], /hidden/);
assert.ok(requeridos.includes('cuenta-email') && requeridos.includes('cuenta-pass') && requeridos.includes('cuenta-apodo'),
  'formularios de cuenta con required');
assert.equal(privMarcada, false, 'cuenta-privacidad NO viene marcada');
assert.ok(ocultos.includes('cuenta-perfil'), 'form cuenta-perfil debe iniciar hidden');
assert.equal(registroCrear && registroCrear.type, 'submit', 'botón registrar tipo submit');
assert.equal(registroCrear && registroCrear.value, 'registrar', 'botón registrar con value');

// ---------- 7) Selectores de la cancha, idiomas y secciones ----------
assert.deepEqual([...new Set(posiciones)].sort(), ['CM', 'DEF', 'DEL', 'GK'], 'posiciones en cancha');
assert.deepEqual([...new Set(idiomas)].sort(), ['en', 'es', 'pt'], 'botones de idioma');
assert.equal(secciones.length, 8, 'items de navegación (4 sidebar + 4 inferior)');
assert.deepEqual([...new Set(secciones)].sort(), ['carrera', 'comunidad', 'entrenamiento', 'progreso']);

console.log('TODO OK: ' + ids.length + ' ids, ' + clavesI18n.length +
  ' data-i18n, ' + handlers.size + ' handlers, árbol React espejo del HTML original.');


