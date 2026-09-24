// ============================================================
//  COPERO - react/vista-progreso.js
//  Vista Progreso: tabs Estadísticas / Evolución / Temporadas /
//  Logros (pills de Bootstrap). index.html original 436-482.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function VistaProgreso() {
    return html`
      <section id="vista-progreso" className="cp-vista hidden">
        <div className="card card-custom">
          <ul className="nav nav-pills mb-3" role="tablist" aria-label="Progreso">
            <li className="nav-item" role="presentation">
              <button className="nav-link active fw-bold" id="pesta-prog-stats" data-bs-toggle="pill" data-bs-target="#tab-prog-stats" type="button" role="tab" data-i18n="stats">Estadísticas</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link fw-bold" id="pesta-prog-evol" data-bs-toggle="pill" data-bs-target="#tab-prog-evol" type="button" role="tab" data-i18n="evolucion">Evolución</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link fw-bold" id="pesta-prog-temp" data-bs-toggle="pill" data-bs-target="#tab-prog-temp" type="button" role="tab" data-i18n="temporadas">Temporadas</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link fw-bold" id="pesta-prog-logros" data-bs-toggle="pill" data-bs-target="#tab-prog-logros" type="button" role="tab" data-i18n="logros">Logros</button>
            </li>
          </ul>
          <div className="tab-content">
            <div className="tab-pane fade show active" id="tab-prog-stats" role="tabpanel">
              <div id="stats-vista"></div>
            </div>
            <div className="tab-pane fade" id="tab-prog-evol" role="tabpanel">
              <div id="evol-vista"></div>
            </div>
            <div className="tab-pane fade" id="tab-prog-temp" role="tabpanel">
              <div className="table-responsive">
                <table className="table table-hover align-middle text-center m-0 border tabla-historial">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" data-i18n="thTemp">Temp</th>
                      <th scope="col" data-i18n="thClub">Club</th>
                      <th scope="col" data-i18n="thPJ">PJ</th>
                      <th scope="col" data-i18n="thGoles">Goles</th>
                      <th scope="col" data-i18n="thAsist">Asist.</th>
                      <th scope="col">OVR</th>
                      <th scope="col" data-i18n="thTitulos">Títulos / Logros</th>
                    </tr>
                  </thead>
                  <tbody id="tabla-temporadas-body"></tbody>
                </table>
              </div>
            </div>
            <div className="tab-pane fade" id="tab-prog-logros" role="tabpanel">
              <div id="logros-vista"></div>
            </div>
          </div>
        </div>
      </section>`;
  }

  CR.VistaProgreso = VistaProgreso;
})(window.CR);
