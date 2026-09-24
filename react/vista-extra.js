// ============================================================
//  COPERO - react/vista-extra.js
//  Vistas Entrenamiento y Comunidad (tabs con Bootstrap pills).
//  index.html original líneas 409-433 y 485-510.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function VistaEntrenamiento() {
    return html`
      <section id="vista-entrenamiento" className="cp-vista hidden">
        <div className="row g-3">
          <div className="col-lg-4 d-flex">
            <div className="card card-custom w-100">
              <h5 data-i18n="navEntrenamiento">Entrenamiento</h5>
              <p className="text-secondary small mb-3" data-i18n="entrenoAyuda">Elegí una sesión por atributo o un minijuego para la temporada.</p>
              <div id="aviso-minijuego-usado" className="alert alert-info small hidden" role="status" data-i18n="avisoMinijuego">Ya jugaste el minijuego de esta temporada. Solo se puede jugar 1 minijuego por temporada, además del entrenamiento por atributos. Avanzá a la próxima temporada para jugar otro.</div>
              <button id="btn-entrenar-atributos" type="button" className="btn btn-pso mb-2 w-100 fw-bold" onClick=${() => abrirEntrenamientoAtributos()} data-i18n="entrenarAtributos">Entrenar atributos</button>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-success w-100 fw-bold btn-minijuego" onClick=${() => iniciarMinijuegoDominios()} data-i18n="dominios">⚽ Dominios</button>
                <button id="btn-minijuego-especifico" type="button" className="btn btn-outline-warning w-100 fw-bold text-dark btn-minijuego" onClick=${() => iniciarMinijuegoEntrenamiento()} data-i18n="entrenamiento">⚽ Entrenamiento</button>
                <button type="button" className="btn btn-outline-info w-100 fw-bold btn-minijuego" onClick=${() => abrirSelectorMinijuegos()} data-i18n="masMinijuegos">🎮 Más Minijuegos</button>
                <button type="button" className="btn btn-outline-warning w-100 fw-bold btn-minijuego" onClick=${() => iniciarMinijuegoPenales()}>🥅 <span data-i18n="tandaPenales">Tanda de Penales</span></button>
              </div>
            </div>
          </div>
          <div className="col-lg-8 d-flex">
            <div className="card card-custom w-100">
              <h5 className="m-0" data-i18n="misAtributos">Mis atributos</h5>
              <p className="text-secondary small mt-2 mb-3" data-i18n="atributosAyuda">Presioná un atributo para abrir el centro de entrenamiento. Cada sesión sube un atributo y puede aumentar tu OVR.</p>
              <div id="atributos-vista" className="row g-2 row-cols-2 row-cols-md-3 row-cols-xl-3"></div>
            </div>
          </div>
        </div>
      </section>`;
  }

  function VistaComunidad() {
    return html`
      <section id="vista-comunidad" className="cp-vista hidden">
        <div className="card card-custom">
          <ul className="nav nav-pills mb-3" role="tablist" aria-label="Comunidad">
            <li className="nav-item" role="presentation">
              <button className="nav-link active fw-bold" id="pesta-com-ranking" data-bs-toggle="pill" data-bs-target="#tab-com-ranking" type="button" role="tab" data-i18n="ranking">Ranking</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link fw-bold" id="pesta-com-duelo" data-bs-toggle="pill" data-bs-target="#tab-com-duelo" type="button" role="tab" data-i18n="dueloTab">⚔️ Duelo 1v1</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link fw-bold" id="pesta-com-cuenta" data-bs-toggle="pill" data-bs-target="#tab-com-cuenta" type="button" role="tab" data-i18n="cuentaBoton">Cuenta</button>
            </li>
          </ul>
          <div className="tab-content">
            <div className="tab-pane fade show active" id="tab-com-ranking" role="tabpanel">
              <div id="ranking-vista"></div>
            </div>
            <div className="tab-pane fade" id="tab-com-duelo" role="tabpanel">
              <div id="duelo-vista"></div>
            </div>
            <div className="tab-pane fade" id="tab-com-cuenta" role="tabpanel">
              <div id="cuenta-vista"></div>
            </div>
          </div>
        </div>
      </section>`;
  }

  CR.VistaEntrenamiento = VistaEntrenamiento;
  CR.VistaComunidad = VistaComunidad;
})(window.CR);
