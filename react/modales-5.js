// ============================================================
//  COPERO - react/modales-5.js
//  Modal Ranking (online) y modal Redes Sociales.
//  index.html original líneas 717-750.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ModalRanking() {
    return html`
      <div className="modal fade" id="modalRanking" tabIndex=${-1} aria-hidden="true" aria-labelledby="modalRankingTitulo">
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content card-custom border-warning">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title w-100 fw-bold text-warning" id="modalRankingTitulo"><span data-i18n="rankTitulo">Ranking</span></h5>
            </div>
            <div className="modal-body">
              <div className="tab-content">
                <div className="tab-pane fade show active" id="tab-ranking-online" role="tabpanel">
                  <div id="ranking-online-contenido"></div>
                </div>
              </div>
              <div id="ranking-online-estado" className="text-center mt-2"></div>
            </div>
            <div className="modal-footer border-top-0 justify-content-center pt-0">
              <button type="button" id="btn-ranking-actualizar" className="btn btn-outline-secondary btn-sm fw-bold" data-i18n="rankActualizar">Actualizar</button>
              <button type="button" className="btn btn-warning fw-bold px-4" data-bs-dismiss="modal" data-i18n="btnCerrar">Cerrar</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function ModalRedesSociales() {
    return html`
      <div className="modal fade" id="modalRedesSociales" tabIndex=${-1} aria-hidden="true" aria-labelledby="modalRedesSocialesTitulo">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content card-custom border-danger">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title text-danger fw-bold" id="modalRedesSocialesTitulo" data-i18n="redesTitulo">Redes Sociales</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body" id="redes-feed"></div>
          </div>
        </div>
      </div>`;
  }

  CR.ModalRanking = ModalRanking;
  CR.ModalRedesSociales = ModalRedesSociales;
})(window.CR);
