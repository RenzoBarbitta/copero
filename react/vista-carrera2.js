// ============================================================
//  COPERO - react/vista-carrera2.js
//  Vista Carrera (parte 2): resumen de temporada y bloque de
//  noticias/redes. index.html original líneas 374-404.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function ResumenTemporada() {
    return html`
      <div className="col-12 col-xl-4 d-flex">
        <div className="card card-custom w-100">
          <h5 data-i18n="resumenTemporada">Resumen de temporada</h5>
          <div className="row g-2 text-center resumen-temp">
            <div className="col-4"><span className="rt-label" data-i18n="thPJ">PJ</span><strong id="res-pj">0</strong></div>
            <div className="col-4"><span className="rt-label" data-i18n="thGoles">Goles</span><strong id="res-goles">0</strong></div>
            <div className="col-4"><span className="rt-label" data-i18n="thAsist">Asist.</span><strong id="res-asist">0</strong></div>
            <div className="col-4"><span className="rt-label" data-i18n="thTitulos">Títulos</span><strong id="res-titulos">0</strong></div>
            <div className="col-4"><span className="rt-label">OVR</span><strong id="res-media">0</strong></div>
            <div className="col-4"><span className="rt-label" data-i18n="temporadaActual">Temporada</span><strong id="res-num-temp">0</strong></div>
          </div>
        </div>
      </div>`;
  }

  function ColumnaRedes() {
    return html`
      <div className="col-12" id="columna-redes">
        <div className="card card-custom">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0" data-i18n="noticiasCarrera">Noticias de tu carrera</h5>
            <button type="button" className="btn btn-sm btn-outline-danger fw-bold" onClick=${() => mostrarRedesSociales()}><span data-i18n="redesTitulo">Redes</span></button>
          </div>
          <div id="redes-feed-lateral">
            <div className="vacio">
              <div className="vacio-icono" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V4"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg></div>
              <div className="vacio-titulo" data-i18n="sinNoticiasTitulo">Sin novedades todavía</div>
              <div className="vacio-texto" data-i18n="sinNoticiasTexto">Simulá tu primera temporada para que comience la actividad de tu carrera.</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  CR.ResumenTemporada = ResumenTemporada;
  CR.ColumnaRedes = ColumnaRedes;
})(window.CR);
