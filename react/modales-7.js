// ============================================================
//  COPERO - react/modales-7.js
//  Modal Dardos con los pibes y modal Configuración (idioma +
//  modo oscuro). index.html original líneas 789-830.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ModalDardos() {
    return html`
      <div className="modal fade" id="modalDardos" tabIndex=${-1} data-bs-backdrop="static" aria-hidden="true" aria-labelledby="modalDardosTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-primary">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title w-100 fw-bold text-primary" id="modalDardosTitulo" data-i18n="dardosTitulo">🎯 Dardos con los pibes</h5>
            </div>
            <div className="modal-body">
              <p id="instruccionDardos" className="small text-secondary mb-3" data-i18n="dardosIndicacion">Tocá <strong>¡TIRAR!</strong> en el momento justo: el indicador va de afuera hacia el centro y vuelve. Centro = más puntos.</p>
              <div id="contenedorDardos" className="contedor-dardos" style=${{ position: "relative", width: "100%", maxWidth: "340px", margin: "0 auto" }}></div>
              <p id="marcadorDardos" className="mt-3 mb-2 fw-bold">Tiro 1/3 · Puntos: 0</p>
              <button id="btnTirarDardo" type="button" className="btn btn-primary btn-lg fw-bold px-4" data-i18n="dardosBoton">🎯 ¡TIRAR!</button>
              <div id="resultadoDardos" className="mt-3" role="status" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function ModalConfiguracion() {
    return html`
      <div className="modal fade" id="modalConfiguracion" tabIndex=${-1} aria-hidden="true" aria-labelledby="configTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content card-custom border-secondary">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title fw-bold" data-i18n="configTitulo">Configuración</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="select-idioma-perfil" className="form-label fw-bold" data-i18n="idioma">🌐 Idioma</label>
                <select id="select-idioma-perfil" className="form-select"></select>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="btn-modo-oscuro-perfil"/>
                <label className="form-check-label fw-bold" htmlFor="btn-modo-oscuro-perfil" data-i18n="modoOscuro">🌙 Modo oscuro</label>
              </div>
            </div>
            <div className="modal-footer border-top-0 justify-content-center pt-0">
              <button type="button" className="btn btn-outline-secondary btn-sm fw-bold" data-bs-dismiss="modal" data-i18n="btnCerrar">Cerrar</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  CR.ModalDardos = ModalDardos;
  CR.ModalConfiguracion = ModalConfiguracion;
})(window.CR);
