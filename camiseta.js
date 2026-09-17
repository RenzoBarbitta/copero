// ============================================================
//  CASACA Y POSICION EN CANCHA - camiseta.js
//  - Selector visual de posicion en cancha formato 6v6:
//      GK / DEF - DEF / CM / DEL - DEL
//    Sincroniza el <select id="select-posicion"> (que queda
//    oculto), asi la logica del juego no cambia nada.
//  - Eleccion de dorsal con vista previa de la casaca celeste
//    (nombre + numero). El dorsal se guarda en jugador.dorsal
//    y aparece tambien en una mini casaca en el header.
//  Se carga DESPUES de features.js
// ============================================================

(function() {
  "use strict";

  const DORSAL_DEFAULT = 10;

  function tCam(clave, fallback) {
    try {
      if (typeof t === "function") {
        const valor = t(clave);
        if (valor && valor !== clave) return valor;
      }
    } catch (e) { /* ignorar */ }
    return fallback;
  }

  function escaparCam(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clampDorsal(valor) {
    let n = parseInt(valor, 10);
    if (isNaN(n)) n = DORSAL_DEFAULT;
    return Math.max(1, Math.min(99, n));
  }

  // ---------------- CASACA (SVG celeste) ----------------

  // Remera celeste lisa con nombre y numero en la espalda.
  // El nombre se auto-ajusta (tamano de fuente + textLength) para que
  // NUNCA se desborde de la casaca ni quede desfasado del torso.
  function camisetaSVG(nombre, dorsal, mostrarNombre) {
    const num = clampDorsal(dorsal);
    const textoNombre = String(nombre || "").trim().toUpperCase();
    const nombreCorto = textoNombre ? escaparCam(textoNombre.slice(0, 12)) : "···";
    const anchoMax = 42; // ancho util del torso (x 39-81)
    const chars = (textoNombre.slice(0, 12) || "···").length;
    const fsNombre = Math.min(11, Math.max(8, anchoMax / (chars * 0.68 + 0.5)));
    const estimado = chars * fsNombre * 0.68 + (chars - 1) * 0.5;
    // Fijar el ancho incluso para nombres cortos: las letras anchas y
    // las fuentes del telefono no deben superar los limites del torso.
    const compresion = ' textLength="' + Math.min(anchoMax, estimado).toFixed(1) +
      '" lengthAdjust="spacingAndGlyphs"';
    const yNombre = 60; // debajo del cuello, encima del numero
    const yNumero = mostrarNombre ? 90 : 86;
    const fsNumero = mostrarNombre ? 24 : 40; // mini casaca sin nombre: conservar legibilidad
    const cuerpo =
      '<path d="M30 14 L48 6 Q60 18 72 6 L90 14 L104 26 L96 44 L84 38 L84 104 Q60 110 36 104 L36 38 L24 44 L16 26 Z" ' +
      'fill="#75aadb" stroke="#0d2b45" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M46 8 Q60 22 74 8" fill="none" stroke="#0d2b45" stroke-width="3" stroke-linecap="round"/>';
    const etiqueta = mostrarNombre
      ? '<text x="60" y="' + yNombre + '" text-anchor="middle" font-size="' + fsNombre.toFixed(1) + '" font-weight="700" letter-spacing="0.5" fill="#0d2b45"' + compresion + '>' + nombreCorto + '</text>'
      : "";
    const numero = '<text x="60" y="' + yNumero + '" text-anchor="middle" font-size="' + fsNumero + '" font-weight="800" fill="#0d2b45">' + num + '</text>';
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Casaca número ' + num + '">' +
      cuerpo + etiqueta + numero + '</svg>';
  }

  function dorsalActual() {
    const jug = (typeof jugador !== "undefined") ? jugador : null;
    return (jug && jug.dorsal) ? jug.dorsal : DORSAL_DEFAULT;
  }

  function refrescarCamisetaHeader() {
    const cont = document.getElementById("camiseta-badge");
    if (!cont) return;
    cont.innerHTML = camisetaSVG("", dorsalActual(), false);
  }

  function renderizarCamisetaPreview() {
    const cont = document.getElementById("camiseta-preview");
    if (!cont) return;
    const inputNombre = document.getElementById("input-nombre");
    const inputDorsal = document.getElementById("input-dorsal");
    const nombre = inputNombre ? inputNombre.value : "";
    const dorsal = inputDorsal ? inputDorsal.value : DORSAL_DEFAULT;
    cont.innerHTML = camisetaSVG(nombre, dorsal, true);
  }

  // ---------------- SELECTOR DE POSICION (cancha 6v6) ----------------

  let badgeSeleccionado = null;

  function seleccionarPosicion(badge) {
    if (!badge) return;
    if (badgeSeleccionado) {
      badgeSeleccionado.classList.remove("pos-seleccionada");
      badgeSeleccionado.setAttribute("aria-checked", "false");
    }
    badgeSeleccionado = badge;
    badge.classList.add("pos-seleccionada");
    badge.setAttribute("aria-checked", "true");
    const select = document.getElementById("select-posicion");
    if (select) select.value = badge.getAttribute("data-pos");
  }

  function actualizarTitlesPosiciones() {
    const contenedor = document.getElementById("cancha-selector");
    if (!contenedor) return;
    contenedor.querySelectorAll(".pos-badge").forEach(function(b) {
      const clave = "pos" + b.getAttribute("data-pos");
      b.title = tCam(clave, b.getAttribute("data-pos"));
    });
  }

  function iniciarSelectorPosicion() {
    const contenedor = document.getElementById("cancha-selector");
    const select = document.getElementById("select-posicion");
    if (!contenedor || !select) return;
    contenedor.querySelectorAll(".pos-badge").forEach(function(b) {
      b.addEventListener("click", function() { seleccionarPosicion(b); });
    });
    actualizarTitlesPosiciones();
    const posInicial = select.value || "DEL";
    seleccionarPosicion(
      contenedor.querySelector('.pos-badge[data-pos="' + posInicial + '"]') ||
      contenedor.querySelector(".pos-badge")
    );
  }

  // ---------------- DORSAL ----------------

  function iniciarSelectorDorsal() {
    const inputDorsal = document.getElementById("input-dorsal");
    const inputNombre = document.getElementById("input-nombre");
    if (inputDorsal) {
      inputDorsal.addEventListener("input", renderizarCamisetaPreview);
      inputDorsal.addEventListener("blur", function() {
        inputDorsal.value = clampDorsal(inputDorsal.value);
        renderizarCamisetaPreview();
      });
    }
    if (inputNombre) inputNombre.addEventListener("input", renderizarCamisetaPreview);
  }

  // ---------------- WRAPPERS (patron del proyecto) ----------------

  // iniciarCarrera: ademas asigna el dorsal elegido a la nueva carrera
  const _iniciarCarreraBaseCam = iniciarCarrera;
  iniciarCarrera = function() {
    const inputDorsal = document.getElementById("input-dorsal");
    const dorsal = clampDorsal(inputDorsal ? inputDorsal.value : DORSAL_DEFAULT);
    _iniciarCarreraBaseCam();
    try {
      const pantallaJuego = document.getElementById("pantalla-juego");
      const arranco = pantallaJuego && !pantallaJuego.classList.contains("hidden");
      if (arranco && typeof jugador !== "undefined" && jugador && jugador.nombre) {
        jugador.dorsal = dorsal;
        if (typeof guardarPartida === "function") guardarPartida();
        refrescarCamisetaHeader();
      }
    } catch (e) { /* ignorar */ }
  };

  // actualizarInterfaz: mantiene la mini casaca del header al dia
  const _actualizarInterfazBaseCam = actualizarInterfaz;
  actualizarInterfaz = function() {
    _actualizarInterfazBaseCam();
    try { refrescarCamisetaHeader(); } catch (e) { /* ignorar */ }
  };

  // traducirInterfaz: actualiza los tooltips de las posiciones
  const _traducirInterfazBaseCam = traducirInterfaz;
  traducirInterfaz = function() {
    _traducirInterfazBaseCam();
    try { actualizarTitlesPosiciones(); } catch (e) { /* ignorar */ }
  };

  // ---------------- INICIALIZACION ----------------

  document.addEventListener("DOMContentLoaded", function() {
    iniciarSelectorPosicion();
    iniciarSelectorDorsal();
    renderizarCamisetaPreview();
    refrescarCamisetaHeader();
  });
})();

