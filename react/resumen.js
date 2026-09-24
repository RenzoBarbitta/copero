// ============================================================
//  COPERO - react/resumen.js
//  Pantalla de resumen final (retiro profesional): estadísticas
//  de carrera, tabla por temporada y botón de reinicio.
//  index.html original líneas 513-541.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function PantallaResumen() {
    return html`
      <div id="pantalla-resumen" className="hidden">
        <div className="card card-custom p-4 text-center">
          <h2 className="text-primary mb-3 fw-bold" data-i18n="retiro">🏁 Retiro Profesional</h2>
          <div id="resumen-final" className="mb-3"></div>
          <h3><span id="resumen-nombre"></span> (<span id="resumen-posicion"></span>)</h3>
          <p><span data-i18n="partidos">Partidos:</span> <strong id="resumen-pj"></strong> | <span data-i18n="goles">Goles:</span> <strong id="resumen-goles"></strong> | <span data-i18n="asistencias">Asistencias:</span> <strong id="resumen-asist"></strong></p>
          <p id="resumen-rol" className="fs-5"></p>
          <div className="table-responsive my-3">
            <table className="table table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th scope="col" data-i18n="thTemp">Temp</th>
                  <th scope="col" data-i18n="thClub">Club</th>
                  <th scope="col" data-i18n="thPJ">PJ</th>
                  <th scope="col" data-i18n="thGoles">Goles</th>
                  <th scope="col" data-i18n="thAsist">Asist.</th>
                  <th scope="col">OVR</th>
                  <th scope="col" data-i18n="thTitulos">Títulos</th>
                </tr>
              </thead>
              <tbody id="tabla-resumen-body"></tbody>
            </table>
          </div>
          <button className="btn btn-warning fw-bold px-4" onClick=${() => reiniciarCarrera()} data-i18n="jugarDeNuevo">Jugar de Nuevo</button>
        </div>
      </div>`;
  }

  CR.PantallaResumen = PantallaResumen;
})(window.CR);
