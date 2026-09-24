// ============================================================
//  COPERO - react/juego-tarjeta.js
//  Dentro de #pantalla-juego: tarjeta del jugador (nombre,
//  moral, atributos, OVR, rol, escudo) y la ruta de sección.
//  index.html original líneas 292-318.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function TarjetaJugador() {
    return html`
      <div className="card card-custom tarjeta-jugador mb-3">
        <div className="tj-izq">
          <h2 className="m-0 fw-bold"><span id="j-nombre"></span></h2>
          <p className="mb-2 fw-bold" id="j-seleccion"></p>
          <p className="mb-2 fw-bold" id="tj-posicion-linea"><span className="chip-small d-inline-flex"><span id="j-posicion"></span></span><span className="mx-2 text-3">·</span><span data-i18n="edad">Edad:</span> <span id="j-edad"></span> <span data-i18n="anios">años</span><span className="mx-2 text-3">·</span><span data-i18n="club">Club:</span> <span id="j-club"></span></p>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="chip-small"><span data-i18n="moral">Moral:</span> <span id="j-moral" className="fw-bold"></span></span>
            <button type="button" className="chip-small chip-click" onClick=${() => toggleAtributosPanel()} aria-expanded="false"><span data-i18n="misAtributos">Atributos</span></button>
          </div>
          <div id="panel-atributos" className="tj-atributos hidden" data-panel="atributos">
            <div id="j-atributos"></div>
          </div>
        </div>
        <div className="tj-der d-flex align-items-center gap-3">
          <div className="tj-ovr" aria-label="Media del jugador">
            <div className="tj-ovr-num"><span id="j-media" className="fw-bold">0</span></div>
            <div className="tj-ovr-lbl">OVR</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div id="rol-badge" title="Tu rol actual" aria-label="Rol actual del jugador"></div>
            <div id="camiseta-badge" title="Tu dorsal"></div>
            <img id="club-img" src="" alt="Escudo del club" style=${{ display: "none" }}/>
          </div>
        </div>
      </div>`;
  }

  function AppRuta() {
    return html`<div id="app-ruta" className="app-ruta mb-2"><span data-i18n="navCarrera">Carrera</span></div>`;
  }

  CR.TarjetaJugador = TarjetaJugador;
  CR.AppRuta = AppRuta;
})(window.CR);
