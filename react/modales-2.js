// ============================================================
//  COPERO - react/modales-2.js
//  Modal de penales (definición) y modal de partido interactivo
//  (jugar vs simular). index.html original líneas 584-631.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ModalPenal() {
    return html`
      <div className="modal fade" id="modalPenal" tabIndex=${-1} data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-warning">
            <div className="modal-header border-bottom-0"><h5 className="modal-title w-100 fw-bold text-warning" data-i18n="penalTitulo">⚽ ¡FINAL DRAMÁTICA!</h5></div>
            <div className="modal-body">
              <p data-i18n="penalTexto">El partido está empatado. Tienes en tus pies el penal para definir el título.</p>
              <div className="d-inline-block p-2 border border-secondary rounded mb-3 bg-light">
                <div className="row g-1 mb-1">
                  <div className="col-4"><button type="button" className="btn btn-outline-dark w-100" aria-label="Arriba izquierda" onClick=${() => patearPenal("Arriba-Izquierda")}>↖️</button></div>
                  <div className="col-4"><button type="button" className="btn btn-outline-dark w-100" aria-label="Arriba centro" onClick=${() => patearPenal("Arriba-Centro")}>⬆️</button></div>
                  <div className="col-4"><button type="button" className="btn btn-outline-dark w-100" aria-label="Arriba derecha" onClick=${() => patearPenal("Arriba-Derecha")}>↗️</button></div>
                </div>
                <div className="row g-1">
                  <div className="col-4"><button type="button" className="btn btn-outline-dark w-100" aria-label="Abajo izquierda" onClick=${() => patearPenal("Abajo-Izquierda")}>↙️</button></div>
                  <div className="col-4"><button type="button" className="btn btn-outline-dark w-100" aria-label="Abajo centro" onClick=${() => patearPenal("Abajo-Centro")}>⬇️</button></div>
                  <div className="col-4"><button type="button" className="btn btn-outline-dark w-100" aria-label="Abajo derecha" onClick=${() => patearPenal("Abajo-Derecha")}>↘️</button></div>
                </div>
              </div>
              <div id="penalResultado" role="status" aria-live="polite"></div>
            </div>
            <div className="modal-footer border-top-0 justify-content-center" id="penalFooter" style=${{ display: "none" }}>
              <button type="button" className="btn btn-warning fw-bold px-4" onClick=${() => cerrarModalPenal()} data-i18n="btnContinuar">Continuar</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function ModalPartidoInteractivo() {
    return html`
      <div className="modal fade" id="modalPartidoInteractivo" tabIndex=${-1} data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true" aria-labelledby="modalPartidoInteractivoTitulo">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center border-primary">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title w-100 fw-bold text-primary" id="modalPartidoInteractivoTitulo" data-i18n="partidoTitulo">⚽ Partido Especial Detectado</h5>
            </div>
            <div className="modal-body">
              <p id="partidoInteractivoTexto" className="mb-4" data-i18n="partidoTexto">Se presenta un momento clave en la temporada. ¿Cómo querés resolverlo?</p>
              <div className="d-grid gap-2 col-8 mx-auto">
                <button type="button" className="btn btn-success btn-lg fw-bold" onClick=${() => jugarMomentosClave()}>
                  <span data-i18n="jugarMomentos">⚽ JUGAR MOMENTOS CLAVE</span>
                </button>
                <button type="button" className="btn btn-outline-primary btn-lg fw-bold" onClick=${() => simularPartidoNormal()}>
                  <span data-i18n="simularPartido">🎲 SIMULAR PARTIDO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  CR.ModalPenal = ModalPenal;
  CR.ModalPartidoInteractivo = ModalPartidoInteractivo;
})(window.CR);
