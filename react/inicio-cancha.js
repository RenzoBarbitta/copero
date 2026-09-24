// ============================================================
//  COPERO - react/inicio-cancha.js
//  Pantalla de inicio (parte 2): selector visual de posición en
//  cancha, casaca/dorsal, select oculto de posición y botones
//  de iniciar/continuar. index.html original líneas 133-181.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function InicioCancha() {
    return html`
      <div className="row g-3 mb-4 text-start justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card-cancha h-100">
            <h6 className="fw-bold text-center mb-3 card-cancha-titulo" data-i18n="posCancha">📍 Posición en cancha</h6>
            <div className="cancha-selector" id="cancha-selector" role="radiogroup" aria-label="Posición en cancha (6v6)">
              <svg className="cancha-lineas" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
                <rect x="8" y="8" width="284" height="384" rx="10" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
                <line x1="8" y1="200" x2="292" y2="200" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
                <circle cx="150" cy="200" r="42" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
                <circle cx="150" cy="200" r="3" fill="rgba(255,255,255,0.75)"/>
                <rect x="80" y="8" width="140" height="60" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
                <path d="M118 68 Q150 96 182 68" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
                <rect x="126" y="2" width="48" height="9" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5"/>
                <circle cx="150" cy="50" r="3" fill="rgba(255,255,255,0.75)"/>
                <rect x="80" y="332" width="140" height="60" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
                <path d="M118 332 Q150 304 182 332" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5"/>
                <rect x="126" y="389" width="48" height="9" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5"/>
                <circle cx="150" cy="350" r="3" fill="rgba(255,255,255,0.75)"/>
              </svg>
              <button type="button" className="pos-badge pos-del-izq" data-pos="DEL" role="radio" aria-checked="false">DEL</button>
              <button type="button" className="pos-badge pos-del-der" data-pos="DEL" role="radio" aria-checked="false">DEL</button>
              <button type="button" className="pos-badge pos-cm" data-pos="CM" role="radio" aria-checked="false">CM</button>
              <button type="button" className="pos-badge pos-def-izq" data-pos="DEF" role="radio" aria-checked="false">DEF</button>
              <button type="button" className="pos-badge pos-def-der" data-pos="DEF" role="radio" aria-checked="false">DEF</button>
              <button type="button" className="pos-badge pos-gk" data-pos="GK" role="radio" aria-checked="false">GK</button>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card-cancha h-100">
            <h6 className="fw-bold text-center mb-3 card-cancha-titulo" data-i18n="tuCasaca">👕 Tu casaca</h6>
            <div className="mb-3 px-2">
              <label className="form-label fw-bold mb-1 text-light" htmlFor="input-dorsal" data-i18n="dorsal">🔢 Dorsal</label>
              <input type="number" id="input-dorsal" className="form-control form-control-lg bg-light text-dark border-secondary fw-bold text-center dorsal-input" min="1" max="99" step="1" defaultValue="10" inputMode="numeric" autoComplete="off"/>
            </div>
            <div id="camiseta-preview" className="camiseta-preview" aria-live="polite"></div>
          </div>
        </div>
      </div>
      <div className="row g-3 mb-4 text-start justify-content-center">
        <div className="col-12">
          <div className="card-cancha position-relative" id="nacionalidad-card">
            <h6 className="fw-bold text-center mb-3 card-cancha-titulo" data-i18n="tuNacionalidad">🌍 Tu nacionalidad</h6>
            <div className="text-center">
              <button type="button" id="btn-nacionalidad" className="nacionalidad-preview" aria-haspopup="listbox" aria-expanded="false">
                <span id="nacionalidad-bandera" className="nacionalidad-bandera"></span>
                <span id="nacionalidad-nombre" className="nacionalidad-nombre"></span>
                <span id="nacionalidad-confed" className="nacionalidad-confed"></span>
                <span id="nacionalidad-flecha" className="nacionalidad-flecha">▾</span>
              </button>
            </div>
            <div id="nacionalidad-panel" className="nacionalidad-panel hidden" role="listbox" aria-label="Selecciones (211)"></div>
            <div className="text-center mt-2 mb-2">
              <small className="text-light opacity-75" data-i18n="nacionalidadAyuda">Elegí tu selección: si rendís, podés ser convocado a los torneos internacionales.</small>
            </div>
          </div>
        </div>
      </div>
      <select id="select-nacionalidad" className="hidden" tabIndex=${-1} aria-hidden="true">
        <option value="">———</option>
      </select>
      <select id="select-posicion" className="hidden" tabIndex=${-1} aria-hidden="true">
        <option value="DEL" data-i18n="posDEL">Delantero (DEL)</option>
        <option value="CM" data-i18n="posCM">Mediocampista (CM)</option>
        <option value="DEF" data-i18n="posDEF">Defensa (DEF)</option>
        <option value="GK" data-i18n="posGK">Arquero (GK)</option>
      </select>
      <button id="btn-iniciar" className="btn btn-warning btn-lg fw-bold px-5" onClick=${() => iniciarCarrera()} data-i18n="iniciar">Iniciar Carrera</button>
      <button id="btn-continuar" className="btn btn-outline-primary btn-lg fw-bold px-5 mt-3 hidden" onClick=${() => continuarCarrera()} data-i18n="continuar">
        ▶️ Continuar Carrera Guardada
      </button>`;
  }

  CR.InicioCancha = InicioCancha;
})(window.CR);
