// ============================================================
//  COPERO - react/modales-3.js
//  Modal Momento Clave (reutilizable) y modal Tiro Libre /
//  Barrida. index.html original líneas 633-667.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ModalMomentosClave() {
    return html`
      <div className="modal fade" id="modalMomentosClave" tabIndex=${-1} data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true" aria-labelledby="modalMomentosClaveTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-warning">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title w-100 fw-bold text-warning" id="modalMomentosClaveTitulo">⚡ Momento Clave</h5>
            </div>
            <div className="modal-body" id="modalMomentosClaveCuerpo"></div>
            <div className="modal-footer border-top-0 justify-content-center" id="modalMomentosClaveFooter" style=${{ display: "none" }}></div>
          </div>
        </div>
      </div>`;
  }

  function ModalTiroLibre() {
    return html`
      <div className="modal fade" id="modalTiroLibre" tabIndex=${-1} data-bs-backdrop="static" aria-hidden="true" aria-labelledby="modalTLTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-warning">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title w-100 fw-bold text-primary" id="modalTLTitulo" data-i18n="tiroLibreTitulo">🎯 Tiro Libre de Precisión</h5>
            </div>
            <div className="modal-body">
              <p id="instruccionTL" data-i18n="tiroLibreIndicacion">Presiona <strong>¡DISPARAR!</strong> cuando la barra esté en el centro.</p>
              <div className="zona-gol my-4" style=${{ position: "relative", height: "25px", background: "#e9ecef", borderRadius: "8px", overflow: "hidden" }}>
                <div className="zona-gol-marker"></div>
                <div id="barraTL" className="progress-bar bg-warning" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style=${{ width: "0%", height: "100%", transition: "none" }}></div>
              </div>
              <button id="btnPatearTL" className="btn btn-success btn-lg fw-bold px-4" onClick=${() => detenerTiroLibre()} data-i18n="tiroLibreBoton">¡DISPARAR!</button>
              <div id="resultadoTL" className="mt-3" role="status" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  CR.ModalMomentosClave = ModalMomentosClave;
  CR.ModalTiroLibre = ModalTiroLibre;
})(window.CR);
