// ============================================================
//  COPERO - react/inicio-apoyo.js
//  Pantalla de inicio (parte 4): cards de apoyo / donaciones.
//  index.html original líneas 222-286.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function InicioApoyo() {
    return html`
      <div className="support-cards mt-4 pt-4 border-top border-secondary">
        <h5 className="text-center fw-bold mb-1" data-i18n="supportTitulo">❤️ Ayudame a mantener vivo a COPERO PSO SA</h5>
        <p className="support-subtitulo text-center small mb-4 mx-auto" style=${{ maxWidth: "620px" }} data-i18n="supportSubtitulo">
          Soy un estudiante: mantener las bases de datos que guardan tu progreso, cuenta y ranking tiene un costo real cada mes. Con tu apoyo las mantenemos en pie y me das la energía para seguir sumando contenido.
        </p>
        <div className="row g-3 justify-content-center">
          <div className="col-12 col-md-4">
            <div className="card card-custom support-card support-basico h-100">
              <div className="card-body d-flex flex-column text-center p-4">
                <div className="support-corona"></div>
                <div className="support-precio mb-2">
                  <span aria-hidden="true"><i className="bi bi-patch-check-fill"></i></span>
                </div>
                <h6 className="support-titulo text-uppercase fw-bold mb-1" data-i18n="supportBasicoTitulo">Básico</h6>
                <div className="support-costo fw-bold lh-sm mb-3" style=${{ fontSize: "1.5rem" }}>
                  <span data-i18n="supportBasicoPrecio">1 USD</span><span className="support-periodo" data-i18n="supportPeriodo">/mes</span>
                </div>
                <p className="support-tagline small text-secondary mb-3" data-i18n="supportBasicoDesc">
                  El arranque perfecto para bancar el proyecto.
                </p>
                <ul className="support-features text-start mb-4">
                  <li><i className="bi bi-patch-check" aria-hidden="true"></i><span data-i18n="supportBasicoF1">Insignia de apoyador en tu perfil</span></li>
                  <li><i className="bi bi-controller" aria-hidden="true"></i><span data-i18n="supportBasicoF2">Acceso al modo Ultrarealista</span></li>
                  <li><i className="bi bi-heart-fill" aria-hidden="true"></i><span data-i18n="supportBasicoF3">Nuestro agradecimiento eterno</span></li>
                </ul>
                <a href="https://discord.gg/p7kRKjWYFq" target="_blank" rel="noopener" className="btn btn-pso btn-lg fw-bold mt-auto w-100">
                  <i className="bi bi-star-fill me-1" aria-hidden="true"></i><span data-i18n="supportBasicoBtn">Apoyar</span>
                </a>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card card-custom support-card support-premium h-100">
              <div className="card-body d-flex flex-column text-center p-4">
                <div className="support-corona"><span className="badge support-badge"><i className="bi bi-trophy-fill me-1" aria-hidden="true"></i><span data-i18n="supportBadge">Recomendado</span></span></div>
                <div className="support-precio mb-2">
                  <span aria-hidden="true"><i className="bi bi-trophy-fill"></i></span>
                </div>
                <h6 className="support-titulo text-uppercase fw-bold mb-1" data-i18n="supportPremiumTitulo">Premium</h6>
                <div className="support-costo fw-bold lh-sm mb-3" style=${{ fontSize: "1.5rem" }}>
                  <span data-i18n="supportPremiumPrecio">3 USD</span><span className="support-periodo" data-i18n="supportPeriodo">/mes</span>
                </div>
                <p className="support-tagline small text-secondary mb-3" data-i18n="supportPremiumDesc">
                  El paquete completo para los que aman el proyecto.
                </p>
                <ul className="support-features text-start mb-4">
                  <li><i className="bi bi-check-circle-fill" aria-hidden="true"></i><span data-i18n="supportPremiumF1">Todo lo del Básico</span></li>
                  <li><i className="bi bi-calendar-event" aria-hidden="true"></i><span data-i18n="supportPremiumF2">Evento especial de fin de semana</span></li>
                  <li><i className="bi bi-stars" aria-hidden="true"></i><span data-i18n="supportPremiumF3">Cosmético exclusivo</span></li>
                  <li><i className="bi bi-mic" aria-hidden="true"></i><span data-i18n="supportPremiumF4">Voz activa en las próximas features</span></li>
                </ul>
                <a href="https://discord.gg/p7kRKjWYFq" target="_blank" rel="noopener" className="btn btn-pso btn-lg fw-bold mt-auto w-100">
                  <i className="bi bi-gem me-1" aria-hidden="true"></i><span data-i18n="supportPremiumBtn">Apoyar</span>
                </a>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card card-custom support-card support-dev h-100">
              <div className="card-body d-flex flex-column text-center p-4">
                <div className="support-corona"></div>
                <div className="support-precio mb-2">
                  <span aria-hidden="true"><i className="bi bi-code-slash"></i></span>
                </div>
                <h6 className="support-titulo text-uppercase fw-bold mb-1" data-i18n="supportDevTitulo">Desarrollador</h6>
                <div className="support-costo fw-bold lh-sm mb-3" style=${{ fontSize: "1.5rem" }} data-i18n="supportDevPrecio">Gratis</div>
                <p className="support-tagline small text-secondary mb-3" data-i18n="supportDevDesc">
                  El proyecto es 100% mío: sumate a construirlo o tirá ideas.
                </p>
                <ul className="support-features text-start mb-4">
                  <li><i className="bi bi-tools" aria-hidden="true"></i><span data-i18n="supportDevF1">Ayudar a desarrollar el juego</span></li>
                  <li><i className="bi bi-lightbulb" aria-hidden="true"></i><span data-i18n="supportDevF2">Tirar ideas a lo loco</span></li>
                  <li><i className="bi bi-mortarboard" aria-hidden="true"></i><span data-i18n="supportDevF3">Cero conocimientos previos</span></li>
                </ul>
                <a href="https://discord.gg/p7kRKjWYFq" target="_blank" rel="noopener" className="btn btn-pso btn-lg fw-bold mt-auto w-100">
                  <i className="bi bi-chat-dots-fill me-1" aria-hidden="true"></i><span data-i18n="supportDevBtn">Abrir ticket</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="support-nota text-center small mt-3 mb-0" data-i18n="supportNota">
          Tranquilo, no es pay-to-win: ningún beneficio te da ventaja en el ranking online ni en el 1v1. Acá manda la pasión por el proyecto. ❤️
        </p>
        <div id="support-estado" className="text-center small mt-2"></div>
      </div>`;
  }

  CR.InicioApoyo = InicioApoyo;
})(window.CR);