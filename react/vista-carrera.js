// ============================================================
//  COPERO - react/vista-carrera.js
//  Vista Carrera (dashboard): próximo partido (VS), evento
//  social y compositor de la sección. index.html 320-372, 405-406.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function TarjetaVS() {
    return html`
      <div className="col-12 col-md-6 col-xl-4 d-flex">
        <div className="card card-custom vs-card w-100 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center">
            <span className="vs-etiqueta" data-i18n="proximoPartido">Próximo partido</span>
            <span className="badge bg-primary">T<strong id="temporada-actual">1</strong></span>
          </div>
          <div className="vs-cuerpo">
            <div className="vs-equipo">
              <div className="vs-escudo" id="carrera-escudo-local"><span className="sin-img">DAV</span></div>
              <div className="vs-nombre" id="carrera-club-local">Davoneta</div>
            </div>
            <div className="vs-badge-vs" aria-hidden="true">VS</div>
            <div className="vs-equipo">
              <div className="vs-escudo" id="carrera-escudo-rival"><span className="sin-img">?</span></div>
              <div className="vs-nombre rival" id="carrera-club-rival">—</div>
            </div>
          </div>
          <div className="text-center vs-info">
            <span id="carrera-competen">Primera División</span>
            <span aria-hidden="true"> · </span>
            <span data-i18n="partidosPorTemporada">Partidos por temporada:</span>
            <strong id="carrera-partidos-aprox">25–30</strong>
          </div>
          <div className="mt-auto pt-3">
            <button id="btn-jugar-partido" type="button" className="btn btn-pso btn-lg fw-bold w-100" onClick=${() => jugarPartidoContraRival()}>
              <span data-i18n="jugarPartido">JUGAR PARTIDO</span>
            </button>
          </div>
        </div>
      </div>`;
  }

  function EventoSocial() {
    return html`
      <div className="col-12 col-md-6 col-xl-4 d-flex">
        <div className="card card-custom evento-card w-100 d-flex flex-column" id="evento-card">
          <div className="d-flex justify-content-between align-items-center">
            <span className="vs-etiqueta" data-i18n="eventoSecTitulo">Evento social</span>
            <span className="evento-estrella" aria-hidden="true">⭐</span>
          </div>
          <div className="evento-cuerpo flex-grow-1 d-flex flex-column justify-content-center">
            <div className="evento-nombre" id="evento-nombre">—</div>
            <p className="text-secondary small mb-0 mt-2" data-i18n="eventoAyuda">Aceptá o rechazá la propuesta: puede subir tu media, cambiarte de club o mover tus redes.</p>
          </div>
          <div className="mt-auto pt-3">
            <div id="mensaje-espera-eventos" className="alert alert-light border p-2 small mb-0" data-i18n="sinEventos">No hay eventos sociales esta temporada.</div>
            <button id="btn-evento-unico" type="button" className="btn btn-warning btn-lg w-100 hidden fw-bold" onClick=${() => abrirModalEvento()}></button>
          </div>
        </div>
      </div>`;
  }

  function TarjetaSeleccion() {
    return html`
      <div className="col-12 col-md-6 col-xl-4 d-flex">
        <div className="card card-custom seleccion-card w-100 d-flex flex-column" id="seccion-internacional">
          <div className="d-flex justify-content-between align-items-center">
            <span className="vs-etiqueta" data-i18n="internacionalTitulo">🌍 Internacional</span>
            <span className="badge" id="sel-estado">—</span>
          </div>
          <div className="seleccion-card-cuerpo flex-grow-1 text-center">
            <div className="seleccion-card-bandera mx-auto" id="seleccion-card-bandera"></div>
            <div className="seleccion-card-nombre fw-bold" id="seleccion-card-nombre">—</div>
            <div className="seleccion-card-confed small text-secondary" id="seleccion-card-confed"></div>
          </div>
          <div className="seleccion-card-stats d-flex justify-content-center gap-4 text-center">
            <div><div className="seleccion-card-stat">⚽ <span id="sel-goles">0</span></div><div className="small text-secondary" data-i18n="selGoles">Goles</div></div>
            <div><div className="seleccion-card-stat">📅 <span id="sel-partidos">0</span></div><div className="small text-secondary" data-i18n="selPartidos">Partidos</div></div>
            <div><div className="seleccion-card-stat" id="sel-capitan">—</div><div className="small text-secondary" data-i18n="selCapitan">Capitán</div></div>
          </div>
          <div className="seleccion-card-footer mt-2">
            <div className="small text-secondary" data-i18n="selTorneo">Torneo:</div>
            <div className="d-flex align-items-center justify-content-between gap-2">
              <span className="small fw-semibold" id="sel-torneo">—</span>
              <button type="button" className="btn btn-success btn-sm fw-bold d-none" id="btn-torneo-seleccion" data-i18n="btnJugarTorneo">Jugar torneo</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function VistaCarrera() {
    return html`
      <section id="vista-carrera" className="cp-vista">
        <div className="row g-3">
          <${TarjetaVS}/>
          <${EventoSocial}/>
          <${CR.ResumenTemporada}/>
          <${CR.ColumnaRedes}/>
          <${TarjetaSeleccion}/>
        </div>
      </section>`;
  }

  CR.TarjetaVS = TarjetaVS;
  CR.TarjetaSeleccion = TarjetaSeleccion;
  CR.VistaCarrera = VistaCarrera;
})(window.CR);
