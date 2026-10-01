// ============================================================
//  COPERO - react/modales-9.js
//  Modal de la CARTA DE RETIRO (carta.js). Se dibuja en un canvas
//  1000x1400 y se descarga como PNG. Solo se abre cuando la carrera
//  terminó: el botón vive en la pantalla de retiro.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ModalCarta() {
    return html`
      <div className="modal fade" id="modalCarta" tabIndex=${-1} aria-hidden="true" aria-labelledby="modalCartaTitulo">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content card-custom border-warning">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title fw-bold" id="modalCartaTitulo" data-i18n="cartaTitulo">🃏 Tu carta de retiro</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <div className="row g-3 align-items-start">
                <div className="col-12 col-lg-7">
                  <div className="carta-preview">
                    <canvas id="carta-canvas" width="1000" height="1400" role="img" aria-label="Carta del jugador"></canvas>
                  </div>
                </div>
                <div className="col-12 col-lg-5">
                  <p className="small text-secondary" data-i18n="cartaAyuda">Subí tu foto o elegí un avatar del juego. Después descargá la carta en PNG.</p>
                  <div className="mb-3">
                    <label htmlFor="carta-foto" className="form-label fw-bold" data-i18n="cartaSubirFoto">📷 Subir foto</label>
                    <input className="form-control" type="file" id="carta-foto" accept="image/*" onChange=${(e) => onFotoCartaSeleccionada(e)}/>
                  </div>
                  <div className="mb-3">
                    <div className="form-label fw-bold" data-i18n="cartaAvatares">🎨 Avatares del juego</div>
                    <div className="carta-avatares" id="carta-avatares"></div>
                  </div>
                  <button id="btn-descargar-carta" type="button" className="btn btn-warning fw-bold w-100" onClick=${() => descargarCarta()} data-i18n="cartaDescargar">⬇️ Descargar carta (PNG)</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  CR.ModalCarta = ModalCarta;
})(window.CR);