// ============================================================
//  COPERO - react/modales-6.js
//  Modal Centro de Entrenamiento y modal del minijuego de la
//  camiseta. index.html original líneas 752-787.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ModalEntrenamientoAtributos() {
    return html`
      <div className="modal fade" id="modalEntrenamientoAtributos" tabIndex=${-1} aria-hidden="true" aria-labelledby="modalEntrenamientoTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content card-custom border-primary">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title text-primary fw-bold" id="modalEntrenamientoTitulo" data-i18n="entrenamientoTitulo">Centro de Entrenamiento</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body" id="modalEntrenamientoCuerpo">
              <p className="small text-muted" data-i18n="entrenamientoElige">Elegí un atributo para entrenar esta temporada. Verás el progreso antes y después.</p>
              <div className="d-grid gap-2" id="botonesEntrenamiento"></div>
              <hr/>
              <div id="resultadoEntrenamiento" className="text-center"></div>
            </div>
            <div className="modal-footer border-top-0 justify-content-center pt-0">
              <button type="button" className="btn btn-outline-secondary btn-sm fw-bold" data-bs-dismiss="modal" data-i18n="btnCerrar">Cerrar</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function ModalMinijuegoCamiseta() {
    return html`
      <div className="modal fade" id="modalMinijuegoCamiseta" tabIndex=${-1} data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-dark">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title w-100 fw-bold" id="tituloMinijuegoCamiseta"></h5>
            </div>
            <div className="modal-body">
              <p id="indicacionMinijuegoCamiseta" className="small text-secondary mb-3"></p>
              <div id="contenedorMinijuegoCamiseta"></div>
              <div id="resultadoMinijuegoCamiseta" className="mt-3" role="status" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  CR.ModalEntrenamientoAtributos = ModalEntrenamientoAtributos;
  CR.ModalMinijuegoCamiseta = ModalMinijuegoCamiseta;
})(window.CR);
