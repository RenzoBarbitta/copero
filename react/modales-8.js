// ============================================================
//  COPERO - react/modales-8.js
//  Modal del DUELO DE RIVALIDAD (rival.js). Es una barra de
//  timing: el cursor oscila y hay que frenarlo cerca del centro.
//  3 chances por temporada; al terminar se comparan los puntos con
//  el objetivo del rival.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ModalRivalidad() {
    return html`
      <div className="modal fade" id="modalRivalidad" tabIndex=${-1} data-bs-backdrop="static" aria-hidden="true" aria-labelledby="modalRivalidadTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-danger">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title w-100 fw-bold text-danger" id="modalRivalidadTitulo" data-i18n="rivalidadDueloTitulo">⚔️ Duelo de Rivalidad</h5>
            </div>
            <div className="modal-body">
              <p className="small text-secondary mb-3" data-i18n="rivalidadDueloInstruccion">Frená el cursor en el centro: 3 chances, el centro vale 100 puntos.</p>
              <div className="rivalidad-barra" id="rivalidad-barra">
                <div className="rivalidad-zona"></div>
                <div className="rivalidad-cursor" id="rivalidad-cursor"></div>
              </div>
              <p id="rivalidad-marcador" className="mt-3 mb-1 fw-bold">—</p>
              <p id="rivalidad-objetivo" className="small text-secondary mb-2">—</p>
              <p id="rivalidad-turno" className="fw-bold text-primary" role="status" aria-live="polite"></p>
              <button id="btn-disparar-rivalidad" type="button" className="btn btn-danger btn-lg fw-bold px-4" data-i18n="rivalidadDisparar">⚔️ ¡DUELAR!</button>
              <button id="btn-cerrar-rivalidad" type="button" className="btn btn-outline-secondary btn-lg fw-bold px-4 mt-2 hidden" data-bs-dismiss="modal" data-i18n="btnCerrar">Cerrar</button>
              <div id="rivalidad-resultado" className="mt-3" role="status" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  CR.ModalRivalidad = ModalRivalidad;
})(window.CR);