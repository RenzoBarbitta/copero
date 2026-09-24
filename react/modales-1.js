// ============================================================
//  COPERO - react/modales-1.js
//  Cierre de página (footer + toast) y primeros modales:
//  info, decisión de evento y mercado de fichajes.
//  index.html original líneas 544-582.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function PiePagina() {
    return html`
      <footer className="text-center py-3 mt-4">
        <p className="mb-0 small"><strong data-i18n="desarrollado">Desarrollado por:</strong> Caseros · <strong data-i18n="colaboracion">Colaboración:</strong> Nasty · <a href="privacidad.html" target="_blank" rel="noopener" data-i18n="privacidadLink">Política de privacidad</a></p>
      </footer>`;
  }

  function ToastCopero() {
    return html`<div id="toast-copero" className="toast-copero" aria-live="polite" aria-atomic="true"></div>`;
  }

  function ModalInfo() {
    return html`
      <div className="modal fade" id="infoModal" tabIndex=${-1} aria-hidden="true" aria-labelledby="infoModalTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-secondary">
            <div className="modal-header border-bottom-0"><h5 className="modal-title fw-bold" id="infoModalTitulo"></h5></div>
            <div className="modal-body" id="infoModalCuerpo"></div>
            <div className="modal-footer border-top-0"><button className="btn btn-primary" data-bs-dismiss="modal" data-i18n="btnEntendido">Entendido</button></div>
          </div>
        </div>
      </div>`;
  }

  function ModalDecision() {
    return html`
      <div className="modal fade" id="decisionModal" tabIndex=${-1} aria-hidden="true" aria-labelledby="decisionModalTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-warning">
            <div className="modal-header border-bottom-0"><h5 className="modal-title text-warning fw-bold" id="decisionModalTitulo"></h5></div>
            <div className="modal-body" id="decisionModalCuerpo"></div>
            <div className="modal-footer border-top-0">
              <button className="btn btn-secondary" data-bs-dismiss="modal" data-i18n="eventoRechazar">Rechazar</button>
              <button className="btn btn-warning fw-bold" id="btn-aceptar-evento" data-i18n="eventoAceptar">Aceptar</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function ModalFichajes() {
    return html`
      <div className="modal fade" id="modal-fichajes" data-bs-backdrop="static" tabIndex=${-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-primary">
            <div className="modal-header border-bottom-0"><h5 className="modal-title text-primary fw-bold"><span data-i18n="mercadoTitulo">Mercado de Pases</span> (Temp. <span id="fichajes-temp"></span>)</h5></div>
            <div className="modal-body"><div id="contenedor-ofertas"></div></div>
          </div>
        </div>
      </div>`;
  }

  CR.PiePagina = PiePagina;
  CR.ToastCopero = ToastCopero;
  CR.ModalInfo = ModalInfo;
  CR.ModalDecision = ModalDecision;
  CR.ModalFichajes = ModalFichajes;
})(window.CR);
