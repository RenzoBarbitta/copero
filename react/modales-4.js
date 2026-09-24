// ============================================================
//  COPERO - react/modales-4.js
//  Modal Dominios, modal Super Signal (SS) y modal de Rol
//  desbloqueado. index.html original líneas 668-716.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ModalDominios() {
    return html`
      <div className="modal fade" id="modalDominios" tabIndex=${-1} data-bs-backdrop="static" aria-hidden="true" aria-labelledby="modalDominiosTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-success">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title w-100 fw-bold text-success" id="modalDominiosTitulo">⚽ Dominios</h5>
            </div>
            <div className="modal-body">
              <p className="mb-3" data-i18n="minijuegoIndicacion">Seguí la indicación de este minijuego:</p>
              <div id="secuenciaObjetivo" className="fs-1 fw-bold my-4 text-primary">---</div>
              <p id="tiempoDominiosRow" className="m-0 fs-5"><span data-i18n="tiempoRestante">Tiempo restante:</span> <span id="tiempoDominios" className="text-danger fw-bold">3.0</span>s</p>
              <div id="resultadoDominios" role="status" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function ModalSS() {
    return html`
      <div className="modal fade" id="modalSS" tabIndex=${-1} data-bs-backdrop="static" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-danger">
            <div className="modal-header border-bottom-0"><h5 className="modal-title w-100 fw-bold text-danger" data-i18n="ssTitulo">🔍 REVISIÓN EN VIVO (SS)</h5></div>
            <div className="modal-body">
              <div id="escaneoSSAnim" className="spinner-border text-danger my-3" role="status"></div>
              <div id="resultadoSS" className="fw-bold fs-5 text-dark" role="status" aria-live="polite" data-i18n="ssTexto">Revisando carpetas y archivos sospechosos...</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function ModalRol() {
    return html`
      <div className="modal fade" id="modalRol" tabIndex=${-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0 justify-content-center">
              <p className="rol-unlock-title mb-0" data-i18n="rolDesbloqueado">🔓 ROL DESBLOQUEADO</p>
            </div>
            <div className="modal-body pt-2">
              <div id="rolModalEmoji" className="my-2"></div>
              <div id="rolModalNombre" className="mb-1"></div>
              <div id="rolModalDescripcion" className="mb-2"></div>
              <div id="rolModalOVR" className="mb-3"></div>
            </div>
            <div className="modal-footer border-0 justify-content-center pt-0">
              <button className="btn btn-warning fw-bold px-4" data-bs-dismiss="modal" data-i18n="btnEntendido2">¡Entendido!</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  CR.ModalDominios = ModalDominios;
  CR.ModalSS = ModalSS;
  CR.ModalRol = ModalRol;
})(window.CR);
