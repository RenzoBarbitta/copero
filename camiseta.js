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
  const PALETA_CAMISETA_DEFAULT = Object.freeze({ principal: "#75aadb", sombra: "#0d2b45", texto: "#0d2b45" });
  let paletaCamiseta = Object.assign({}, PALETA_CAMISETA_DEFAULT);
  let imagenClubAnalizada = "";
  let tokenAnalisisPaleta = 0;

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

  function camisetaSVG(nombre, dorsal, mostrarNombre, paleta) {
    paleta = paleta || PALETA_CAMISETA_DEFAULT;
    const num = clampDorsal(dorsal);
    const textoNombre = String(nombre || "").trim().toUpperCase();
    const nombreCorto = textoNombre ? escaparCam(textoNombre.slice(0, 12)) : "···";
    const anchoMax = 42;
    const chars = (textoNombre.slice(0, 12) || "···").length;
    // Nombres cortos (<=7): tamaño cómodo con piso 8 (lo fija el test).
    // Nombres largos (>7): se calcula el tamaño para que el ancho natural
    // encaje en el torso y spacingAndGlyphs casi no tenga que comprimir
    // (con el piso 8 los glifos se aplanaban a lo ancho y se veía raro).
    const fsNombre = chars <= 7
      ? Math.min(11, Math.max(8, anchoMax / (chars * 0.68 + 0.5)))
      : Math.min(11, Math.max(5.5, (anchoMax - (chars - 1) * 0.5) / (chars * 0.68)));
    const estimado = chars * fsNombre * 0.68 + (chars - 1) * 0.5;
    const compresion = ' textLength="' + Math.min(anchoMax, estimado).toFixed(1) +
      '" lengthAdjust="spacingAndGlyphs"';
    const yNombre = 60;
    const yNumero = mostrarNombre ? 90 : 86;
    const fsNumero = mostrarNombre ? 24 : 40;
    const cuerpo =
      '<path d="M30 14 L48 6 Q60 18 72 6 L90 14 L104 26 L96 44 L84 38 L84 104 Q60 110 36 104 L36 38 L24 44 L16 26 Z" ' +
      'fill="' + paleta.principal + '" stroke="' + paleta.sombra + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M46 8 Q60 22 74 8" fill="none" stroke="' + paleta.sombra + '" stroke-width="3" stroke-linecap="round"/>';
    const etiqueta = mostrarNombre
      ? '<text x="60" y="' + yNombre + '" text-anchor="middle" font-size="' + fsNombre.toFixed(1) + '" font-weight="700" letter-spacing="0.5" fill="' + paleta.texto + '"' + compresion + '>' + nombreCorto + '</text>'
      : "";
    const numero = '<text x="60" y="' + yNumero + '" text-anchor="middle" font-size="' + fsNumero + '" font-weight="800" fill="' + paleta.texto + '">' + num + '</text>';
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Casaca número ' + num + '">' +
      cuerpo + etiqueta + numero + '</svg>';
  }

  function colorHex(r, g, b) {
    return "#" + [r, g, b].map(function(v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"); }).join("");
  }

  function colorLuminancia(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  function paletaDesdePixeles(pixeles) {
    const cubetas = {};
    for (let i = 0; i < pixeles.length; i += 4) {
      const alpha = pixeles[i + 3];
      if (alpha < 100) continue;
      const r = pixeles[i], g = pixeles[i + 1], b = pixeles[i + 2];
      const maximo = Math.max(r, g, b), minimo = Math.min(r, g, b);
      const saturacion = maximo === 0 ? 0 : (maximo - minimo) / maximo;
      const brillo = (r + g + b) / 3;
      if ((brillo > 238 && saturacion < 0.18) || brillo < 18) continue;
      const qr = Math.round(r / 24) * 24, qg = Math.round(g / 24) * 24, qb = Math.round(b / 24) * 24;
      const clave = qr + "," + qg + "," + qb;
      if (!cubetas[clave]) cubetas[clave] = { r: qr, g: qg, b: qb, cantidad: 0, saturacion: 0 };
      cubetas[clave].cantidad++;
      cubetas[clave].saturacion += saturacion;
    }
    const candidatos = Object.keys(cubetas).map(function(k) { return cubetas[k]; });
    if (!candidatos.length) return Object.assign({}, PALETA_CAMISETA_DEFAULT);
    candidatos.sort(function(a, b) {
      return (b.cantidad * (1 + b.saturacion / b.cantidad)) - (a.cantidad * (1 + a.saturacion / a.cantidad));
    });
    const dominante = candidatos[0];
    const principal = { r: dominante.r, g: dominante.g, b: dominante.b };
    const sombra = { r: principal.r * 0.42, g: principal.g * 0.42, b: principal.b * 0.42 };
    const luminancia = colorLuminancia(principal.r, principal.g, principal.b);
    return {
      principal: colorHex(principal.r, principal.g, principal.b),
      sombra: colorHex(sombra.r, sombra.g, sombra.b),
      texto: luminancia > 0.58 ? "#102030" : "#ffffff"
    };
  }

  function actualizarPaletaCamiseta(club) {
    const imagen = club && club.imagen;
    if (!imagen || typeof Image === "undefined") {
      paletaCamiseta = Object.assign({}, PALETA_CAMISETA_DEFAULT);
      imagenClubAnalizada = "";
      refrescarCamisetaHeader();
      return;
    }
    if (imagen === imagenClubAnalizada) return;
    const token = ++tokenAnalisisPaleta;
    const imagenEscudo = new Image();
    imagenEscudo.onload = function() {
      if (token !== tokenAnalisisPaleta) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.clearRect(0, 0, 32, 32);
        ctx.drawImage(imagenEscudo, 0, 0, 32, 32);
        paletaCamiseta = paletaDesdePixeles(ctx.getImageData(0, 0, 32, 32).data);
        imagenClubAnalizada = imagen;
        refrescarCamisetaHeader();
      } catch (e) {
        paletaCamiseta = Object.assign({}, PALETA_CAMISETA_DEFAULT);
        imagenClubAnalizada = imagen;
        refrescarCamisetaHeader();
      }
    };
    imagenEscudo.onerror = function() {
      if (token !== tokenAnalisisPaleta) return;
      paletaCamiseta = Object.assign({}, PALETA_CAMISETA_DEFAULT);
      imagenClubAnalizada = imagen;
      refrescarCamisetaHeader();
    };
    imagenEscudo.src = imagen;
  }

  function dorsalActual() {
    const jug = (typeof jugador !== "undefined") ? jugador : null;
    return (jug && jug.dorsal) ? jug.dorsal : DORSAL_DEFAULT;
  }

  function refrescarCamisetaHeader() {
    const cont = document.getElementById("camiseta-badge");
    if (!cont) return;
    const nombre = (typeof jugador !== "undefined" && jugador && jugador.nombre) ? jugador.nombre : "";
    cont.innerHTML = camisetaSVG(nombre, dorsalActual(), !!nombre, paletaCamiseta);
    cont.style.setProperty("--camiseta-color", paletaCamiseta.principal);
    cont.style.setProperty("--camiseta-sombra", paletaCamiseta.sombra);
  }

  function renderizarCamisetaPreview() {
    const cont = document.getElementById("camiseta-preview");
    if (!cont) return;
    const inputNombre = document.getElementById("input-nombre");
    const inputDorsal = document.getElementById("input-dorsal");
    const nombre = inputNombre ? inputNombre.value : "";
    const dorsal = inputDorsal ? inputDorsal.value : DORSAL_DEFAULT;
    cont.innerHTML = camisetaSVG(nombre, dorsal, true, PALETA_CAMISETA_DEFAULT);
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
        actualizarPaletaCamiseta(jugador.clubActual);
        refrescarCamisetaHeader();
      }
    } catch (e) { /* ignorar */ }
  };

  const _actualizarInterfazBaseCam = actualizarInterfaz;
  actualizarInterfaz = function() {
    _actualizarInterfazBaseCam();
    try {
      refrescarCamisetaHeader();
      actualizarPaletaCamiseta(typeof jugador !== "undefined" ? jugador.clubActual : null);
    } catch (e) { /* ignorar */ }
  };

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

  // ============================================================
  //  EXPORTS para minijuegos (usado por minigame-camiseta.js)
  // ============================================================
  window.getCamisetaSVG = function(nombre, dorsal, mostrarNombre) {
    return camisetaSVG(nombre, dorsal, mostrarNombre !== false, paletaCamiseta);
  };
  window.getPaletaCamiseta = function() {
    return Object.assign({}, paletaCamiseta);
  };
  // Camiseta del equipo en el que está jugando hoy el jugador:
  // usa los colores del club (paleta analizada del escudo) + nombre y dorsal.
  window.getCamisetaDeEquipo = function() {
    const j = (typeof jugador !== "undefined" && jugador) ? jugador : null;
    if (!j) return null;
    const club = j.clubActual;
    const paleta = (club && club.imagen) ? paletaCamiseta : PALETA_CAMISETA_DEFAULT;
    return camisetaSVG(
      j.nombre || "",
      (j.dorsal != null) ? j.dorsal : DORSAL_DEFAULT,
      !!j.nombre,
      paleta
    );
  };
})();