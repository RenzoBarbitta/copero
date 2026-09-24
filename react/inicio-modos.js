// ============================================================
//  COPERO - react/inicio-modos.js
//  Pantalla de inicio (parte 3): otros modos de juego y fila de
//  utilidades (Ranking, Slots, idiomas, instalar app, tema).
//  index.html original líneas 185-219.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function BanderaES() {
    return html`<svg className="bandera" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#fff"/><g fill="#0038a8"><rect y="1.8" width="24" height="1.8"/><rect y="5.3" width="24" height="1.8"/><rect y="8.9" width="24" height="1.8"/><rect y="12.4" width="24" height="1.8"/></g><rect width="10" height="8" fill="#fff"/><circle cx="5" cy="4" r="2" fill="#fcd116"/></svg>`;
  }

  function BanderaEN() {
    return html`<svg className="bandera" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#012169"/><path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3.2"/><path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" strokeWidth="1.6"/><path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5.4"/><path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3.2"/></svg>`;
  }

  function BanderaPT() {
    return html`<svg className="bandera" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#009b3a"/><path d="M12 2 22 8 12 14 2 8z" fill="#fedf00"/><circle cx="12" cy="8" r="3.4" fill="#002776"/><path d="M8.9 7.3c2 .9 4.2 1.2 6.2.8" stroke="#fff" strokeWidth="0.9" fill="none"/></svg>`;
  }

  function InicioModos() {
    return html`
      <div id="bloque-modos-juego" className="text-center mt-4 pt-3 border-top border-secondary">
        <div className="small text-secondary text-uppercase fw-bold mb-2" data-i18n="otrosModos">Otros modos</div>
        <div className="row justify-content-center g-2">
          <div className="col-6 col-md-4">
            <button id="btn-modo-desafio" className="btn btn-pso btn-lg fw-bold w-100 h-100" onClick=${() => iniciarCarreraLeal()} data-i18n="modoDesafio">🛡️ Modo Leal</button>
          </div>
          <div className="col-6 col-md-4">
            <button id="btn-duelo-online" className="btn btn-pso btn-lg fw-bold w-100 h-100" onClick=${() => abrirPantallaDuelo()} data-i18n="dueloBoton">⚔️ Duelo 1v1 Online</button>
          </div>
          <div className="col-6 col-md-4">
            <button id="btn-coop-online" className="btn btn-pso btn-lg fw-bold w-100 h-100" onClick=${() => abrirPantallaCoop()} data-i18n="coopBoton">🤝 Cooperativo 2v2 FIFA</button>
          </div>
        </div>
      </div>
      <div id="fila-utilidades" className="d-flex justify-content-center mt-4 flex-wrap">
        <button id="btn-ranking" className="btn btn-outline-secondary btn-util fw-bold" data-i18n="ranking">🏆 Ranking</button>
        <button className="btn btn-outline-secondary btn-util fw-bold" onClick=${() => mostrarSlots()} data-i18n="slots">💾 Slots</button>
        <span id="selector-idioma" className="btn-group" role="group" aria-label="Idioma">
          <button type="button" className="btn btn-outline-secondary btn-idioma" data-idioma="es" onClick=${() => elegirIdioma("es")} title="Español">
            <${BanderaES}/>ES
          </button>
          <button type="button" className="btn btn-outline-secondary btn-idioma" data-idioma="en" onClick=${() => elegirIdioma("en")} title="English">
            <${BanderaEN}/>EN
          </button>
          <button type="button" className="btn btn-outline-secondary btn-idioma" data-idioma="pt" onClick=${() => elegirIdioma("pt")} title="Português">
            <${BanderaPT}/>PT
          </button>
        </span>
        <select id="select-idioma" className="hidden" tabIndex=${-1} aria-hidden="true">
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="pt">PT</option>
        </select>
        <button id="btn-instalar" className="btn btn-outline-success btn-util fw-bold hidden" data-i18n="btnInstalar">📥 Instalar App</button>
        <button id="btn-modo-oscuro" className="btn btn-outline-secondary btn-util fw-bold" title="Modo oscuro" data-i18n-title="modoOscuroTitulo">🌙</button>
      </div>`;
  }

  CR.InicioModos = InicioModos;
})(window.CR);
