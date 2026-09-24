// ============================================================
//  COPERO - react/nucleo.js
//  Núcleo de la capa visual en React (UMD vendorizado en vendor/,
//  sin build ni empaquetado: el deploy sigue siendo estático).
//
//  REGLAS DE ORO DE ESTA CAPA:
//   1. React renderiza TODO el body UNA sola vez (ver montar.js,
//      con flushSync) y la estructura no vuelve a cambiar: no hay
//      estado que re-renderice los nodos de la base.
//   2. id, clases, data-i18n, handlers y estilos inline son
//      EXACTOS a los del index.html original: la lógica de juego
//      (app.js, ui.js, features.js, ranking-online.js, cuenta-ui.js,
//      duelo.js, camiseta.js…) sigue manipulando el DOM por id.
//   3. Las animaciones y el pulido visual viven en fx.css (capa
//      cargada DESPUÉS de theme.css), nunca en la lógica del juego.
// ============================================================
(function (global) {
  "use strict";

  // htm.bind(React.createElement): plantillas tipo JSX en JS plano,
  // sin compiler. Es el puente entre HTML y React.
  const html = htm.bind(React.createElement);

  // Envoltura declarativa para onclick de la base: la función global
  // (irA, mostrarSlots…) se resuelve recién al hacer click.
  function al(fn) {
    return function () {
      return fn.apply(this, arguments);
    };
  }

  global.CR = { html: html, al: al };
})(window);
