// ============================================================
//  TEST: selector de posicion en cancha (6v6) + dorsal/casaca
//  Simula el DOM minimo y ejecuta camiseta.js en una sandbox.
//  Uso: node test-camiseta.mjs
// ============================================================
import fs from "node:fs";
import vm from "node:vm";

let fallos = 0;
function asertar(cond, msg) {
  if (!cond) { console.error("FALLO: " + msg); fallos++; }
  else console.log("OK  " + msg);
}

// ---------------- mini DOM ----------------
function nuevoBadge(dataPos, claseExtra) {
  const clases = new Set(["pos-badge", claseExtra]);
  const listeners = {};
  const badge = {
    dataPos,
    title: "",
    aria: "false",
    listeners,
    classList: {
      add: (c) => clases.add(c),
      remove: (c) => clases.delete(c),
      contains: (c) => clases.has(c)
    },
    getAttribute(k) { return k === "data-pos" ? dataPos : (k === "class" ? [...clases].join(" ") : null); },
    setAttribute(k, v) { if (k === "aria-checked") badge.aria = v; },
    addEventListener(tipo, fn) { listeners[tipo] = fn; }
  };
  badge.__clases = clases;
  return badge;
}

const badges = [
  nuevoBadge("DEL", "pos-del-izq"),
  nuevoBadge("DEL", "pos-del-der"),
  nuevoBadge("CM", "pos-cm"),
  nuevoBadge("DEF", "pos-def-izq"),
  nuevoBadge("DEF", "pos-def-der"),
  nuevoBadge("GK", "pos-gk")
];

function crearElementoSimple(extra = {}) {
  return Object.assign({
    value: "",
    innerHTML: "",
    title: "",
    listeners: {},
    classList: {
      _set: new Set(["hidden"]),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      contains(c) { return this._set.has(c); }
    },
    addEventListener(tipo, fn) { this.listeners[tipo] = fn; }
  }, extra);
}

const elementos = {
  "input-nombre": crearElementoSimple({ value: "" }),
  "input-dorsal": crearElementoSimple({ value: "10" }),
  "camiseta-preview": crearElementoSimple(),
  "camiseta-badge": crearElementoSimple(),
  "select-posicion": crearElementoSimple({ value: "DEL" }),
  "pantalla-juego": crearElementoSimple(),
  "pantalla-inicio": crearElementoSimple(),
  "cancha-selector": {
    querySelector(sel) {
      const m = sel.match(/data-pos="([A-Z]+)"/);
      if (m) return badges.find((b) => b.dataPos === m[1]) || null;
      return badges[0] || null;
    },
    querySelectorAll(sel) { return sel === ".pos-badge" ? badges : []; }
  }
};

const domHandlers = [];
const sandbox = {
  console, JSON, Math, Date, String, Number, parseInt, isNaN, Array, Set, RegExp, Object,
  document: {
    getElementById: (id) => elementos[id] || null,
    addEventListener: (tipo, fn) => { if (tipo === "DOMContentLoaded") domHandlers.push(fn); }
  },
  window: { addEventListener() {} }
};
vm.createContext(sandbox);

// Stubs de las globales que define el juego (app.js / features.js)
vm.runInContext([
  "var jugador;",
  "var guardarPartidaLlamadas = 0;",
  "function t(clave) { return ({ posGK: 'Arquero (GK)', posDEL: 'Delantero (DEL)' })[clave]; }",
  "function guardarPartida() { guardarPartidaLlamadas++; }",
  "function actualizarInterfaz() {}",
  "function traducirInterfaz() {}",
  "function iniciarCarreraBase() {",
  "  if (!document.getElementById('input-nombre').value) return;",
  "  jugador = { nombre: document.getElementById('input-nombre').value, posicion: document.getElementById('select-posicion').value };",
  "  document.getElementById('pantalla-juego').classList.remove('hidden');",
  "}",
  "function iniciarCarrera() { iniciarCarreraBase(); }"
].join("\n"), sandbox);

// Cargar camiseta.js
const codigo = fs.readFileSync("camiseta.js", "utf8");
vm.runInContext(codigo, sandbox, { filename: "camiseta.js" });
console.log("camiseta.js cargado en sandbox");

// Disparar DOMContentLoaded
domHandlers.forEach((fn) => fn());

// 1) seleccion inicial sincroniza el select oculto
asertar(elementos["select-posicion"].value === "DEL", "seleccion inicial: select sincronizado en DEL");
asertar(badges[0].__clases.has("pos-seleccionada"), "badge DEL izq marcado como seleccionado");

// 2) elegir GK
badges[5].listeners.click();
asertar(elementos["select-posicion"].value === "GK", "tocar GK sincroniza el select en GK");
asertar(!badges[0].__clases.has("pos-seleccionada") && badges[5].__clases.has("pos-seleccionada"), "el resaltado se mueve al badge GK");
asertar(badges[5].title === "Arquero (GK)", "tooltip del GK traducido");

// 3) dorsal 7 -> preview actualizado
elementos["input-dorsal"].value = "7";
elementos["input-dorsal"].listeners.input();
const preview = elementos["camiseta-preview"].innerHTML;
asertar(preview.includes(">7<"), "la casaca del preview muestra el dorsal 7");
asertar(preview.includes('fill="#75aadb"'), "la casaca es celeste");

// 4) nombre con HTML se escapa
elementos["input-nombre"].value = '<b>"Cachi</b>';
elementos["input-nombre"].listeners.input();
const previewEscapado = elementos["camiseta-preview"].innerHTML;
asertar(!previewEscapado.includes("<b>") && previewEscapado.includes("&lt;"), "el nombre se escapa dentro del SVG");

// 5) clamp del dorsal en blur (en el navegador value siempre es string)
elementos["input-dorsal"].value = "150";
elementos["input-dorsal"].listeners.blur();
asertar(String(elementos["input-dorsal"].value) === "99", "dorsal 150 se recorta a 99 en blur");
elementos["input-dorsal"].value = "";
elementos["input-dorsal"].listeners.blur();
asertar(String(elementos["input-dorsal"].value) === "10", "dorsal vacio vuelve al 10");

// 6) iniciarCarrera asigna el dorsal a la partida
elementos["input-nombre"].value = "Test";
elementos["input-dorsal"].value = "30";
vm.runInContext("iniciarCarrera();", sandbox);
asertar(vm.runInContext("jugador.dorsal", sandbox) === 30, "iniciarCarrera asigna jugador.dorsal = 30");
asertar(vm.runInContext("jugador.posicion", sandbox) === "GK", "la posicion elegida (GK) llega a iniciarCarrera");
asertar(vm.runInContext("guardarPartidaLlamadas", sandbox) >= 1, "la partida se guarda con el dorsal");

// 7) actualizarInterfaz pinta la mini casaca del header
elementos["camiseta-badge"].innerHTML = "";
vm.runInContext("actualizarInterfaz();", sandbox);
asertar(elementos["camiseta-badge"].innerHTML.includes(">30<"), "el header muestra la mini casaca con el dorsal 30");

// 8) si el arranque falla (nombre vacio -> pantalla no visible), no asigna dorsal
vm.runInContext("jugador = null;", sandbox);
elementos["pantalla-juego"].classList.add("hidden");
elementos["input-nombre"].value = "";
vm.runInContext("iniciarCarrera();", sandbox);
asertar(vm.runInContext("jugador", sandbox) === null || vm.runInContext("jugador", sandbox) === undefined, "sin nombre valido no se crea/asigna jugador");

// 9) el nombre nunca se desborda ni queda desfasado de la casaca
elementos["input-nombre"].value = "CASEROS";
elementos["input-nombre"].listeners.input();
const previewCaseros = elementos["camiseta-preview"].innerHTML;
asertar(/CASEROS<\/text>/.test(previewCaseros), "el nombre CASEROS se dibuja en la casaca");
asertar(previewCaseros.includes('font-size="8.0"'), "nombre de 7 letras auto-ajusta su tamano (8.0)");
asertar(previewCaseros.includes('textLength="41.1"'), "CASEROS tiene un ancho definido dentro del torso");
asertar(/y="60"/.test(previewCaseros) && /y="90"/.test(previewCaseros), "nombre (y=60) y numero (y=90) separados y centrados");
asertar(previewCaseros.includes('font-size="24"'), "dorsal reducido de 40 a 24 en la vista con nombre");
asertar(elementos["camiseta-badge"].innerHTML.includes('font-size="24"') && elementos["camiseta-badge"].innerHTML.includes("TEST") && elementos["camiseta-badge"].innerHTML.includes(">30<"), "la camiseta del juego muestra nombre y dorsal legibles");

elementos["input-nombre"].value = "MUYLARGONOMBRE";
elementos["input-nombre"].listeners.input();
const previewLargo = elementos["camiseta-preview"].innerHTML;
asertar(previewLargo.includes('textLength="42.0"') && previewLargo.includes("spacingAndGlyphs"), "nombre de 12 letras se comprime con textLength para no desbordar");

elementos["input-nombre"].value = "JO";
elementos["input-nombre"].listeners.input();
const previewCorto = elementos["camiseta-preview"].innerHTML;
asertar(previewCorto.includes('font-size="11.0"') && previewCorto.includes('textLength="15.5"'), "nombre corto mantiene el tamano base y un ancho proporcionado");

// Comprobar los atributos del texto generado, no solo la estimacion.
for (const nombre of ["CASEROS", "WWWWWWW", "MUYLARGONOMBRE", "JO", ""]) {
  elementos["input-nombre"].value = nombre;
  elementos["input-nombre"].listeners.input();
  const svg = elementos["camiseta-preview"].innerHTML;
  const etiqueta = svg.match(/<text\b([^>]*)>/)[1];
  const atributos = Object.fromEntries([...etiqueta.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
  const ancho = Number(atributos.textLength);
  const centro = Number(atributos.x);
  asertar(ancho > 0 && ancho <= 42 && centro - ancho / 2 >= 39 && centro + ancho / 2 <= 81,
    "ancho SVG dentro del torso: " + (nombre || "nombre vacio"));
  asertar(atributos["text-anchor"] === "middle" && atributos.lengthAdjust === "spacingAndGlyphs",
    "centrado y ajuste de glifos: " + (nombre || "nombre vacio"));
}

console.log(fallos === 0 ? "TODO OK" : ("CON " + fallos + " FALLOS"));
process.exit(fallos === 0 ? 0 : 1);

