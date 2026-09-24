// ============================================================
//  COPERO - react/chrome.js
//  Marco de la aplicación: sidebar de escritorio, barra superior
//  móvil/tablet y navegación inferior. Idéntico al HTML original
//  (mismos id, data-seccion, data-i18n y handlers de ui.js).
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  // ---------- Iconos (SVG inline, estilo Lucide, igual que ui.js) ----------
  const ATRIBUTOS_SVG = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  function Icono(props) {
    return html`<svg ...${ATRIBUTOS_SVG}>${props.children}</svg>`;
  }

  const ICO_CASA = html`<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-9h6v9"/>`;
  const ICO_ENTRENO = html`<path d="M6.5 3.5v17"/><path d="M17.5 3.5v17"/><path d="M2.5 8v8"/><path d="M21.5 8v8"/><path d="M6.5 12h11"/>`;
  const ICO_PROGRESO = html`<path d="M3 3v18h18"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-8"/>`;
  const ICO_COMUNIDAD = html`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`;
  const ICO_PERFIL = html`<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`;

  // Item de navegación reutilizado por sidebar (escritorio) e inferior (móvil).
  function ItemNav(props) {
    const clase = props.cls + (props.activo ? " activo" : "");
    return html`
      <button type="button" className=${clase} data-seccion=${props.seccion} onClick=${() => irA(props.seccion)}>
        <span className="sb-ico" aria-hidden="true"><${Icono}>${props.ico}<//></span>
        <span data-i18n=${props.claveI18n}>${props.texto}</span>
      </button>`;
  }

  // Contenido del menú de perfil (mismo HTML en escritorio y móvil).
  function MenuPerfilContenido() {
    return html`
      <div className="perfil-menu-content">
        <button type="button" className="btn btn-outline-primary btn-sm w-100 mb-1 fw-bold" onClick=${() => irA("carrera")}>🧑‍🎓 <span data-i18n="miJugador">Mi jugador</span></button>
        <button type="button" className="btn btn-outline-secondary btn-sm w-100 mb-1" onClick=${() => mostrarSlots()}>💾 <span data-i18n="misCarreras">Mis carreras</span></button>
        <button type="button" className="btn btn-outline-secondary btn-sm w-100 mb-1" onClick=${() => abrirPanelCuenta()}>🔐 <span data-i18n="cuentaBoton">Cuenta</span></button>
        <button type="button" className="btn btn-outline-secondary btn-sm w-100 mb-1" onClick=${() => abrirConfiguracion()}>⚙️ <span data-i18n="configTitulo">Configuración</span></button>
        <hr className="my-2"/>
        <button type="button" className="btn btn-outline-danger btn-sm w-100 mb-1" onClick=${() => cerrarSesionPerfil()}>↪ <span data-i18n="cuentaSalir">Cerrar sesión</span></button>
        <button type="button" className="btn btn-outline-dark btn-sm w-100" onClick=${() => reiniciarCarrera()}>♻️ <span data-i18n="reiniciar">Reiniciar carrera</span></button>
      </div>`;
  }

  // ---------- Sidebar (escritorio) ----------
  function BarraLateral() {
    return html`
      <aside id="sidebar" aria-label="Menú principal">
        <div className="sb-marca"><span><span className="marca-icono">◆</span> COPERO <small data-i18n="titulo">Carrera PSO</small></span></div>
        <nav className="sb-nav">
          <span className="sb-seccion" data-i18n="navCarrera">Carrera</span>
          <${ItemNav} cls="sb-item" activo=${true} seccion="carrera" ico=${ICO_CASA} claveI18n="navCarrera" texto="Carrera"/>
          <${ItemNav} cls="sb-item" seccion="entrenamiento" ico=${ICO_ENTRENO} claveI18n="navEntrenamiento" texto="Entrenamiento"/>
          <${ItemNav} cls="sb-item" seccion="progreso" ico=${ICO_PROGRESO} claveI18n="navProgreso" texto="Progreso"/>
          <${ItemNav} cls="sb-item" seccion="comunidad" ico=${ICO_COMUNIDAD} claveI18n="navComunidad" texto="Comunidad"/>
        </nav>
        <div className="sb-perfil">
          <details id="perfil-menu">
            <summary><span className="sb-ico" aria-hidden="true"><${Icono}>${ICO_PERFIL}<//></span> <span data-i18n="miPerfil">Perfil</span></summary>
            <${MenuPerfilContenido}/>
          </details>
        </div>
      </aside>`;
  }

  // ---------- Barra superior (móvil / tablet) ----------
  function BarraSuperior() {
    return html`
      <header id="topbar">
        <div className="tb-marca">◆ COPERO <small data-i18n="titulo">Carrera PSO</small></div>
        <details id="perfil-menu-movil">
          <summary aria-label="Perfil"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></summary>
          <${MenuPerfilContenido}/>
        </details>
      </header>`;
  }

  // ---------- Navegación inferior (móvil / tablet) ----------
  function NavInferior() {
    return html`
      <nav id="nav-inferior" aria-label="Menú principal">
        <${ItemNav} cls="nb-item" activo=${true} seccion="carrera" ico=${ICO_CASA} claveI18n="navCarrera" texto="Carrera"/>
        <${ItemNav} cls="nb-item" seccion="entrenamiento" ico=${ICO_ENTRENO} claveI18n="navEntrenamiento" texto="Entreno"/>
        <${ItemNav} cls="nb-item" seccion="progreso" ico=${ICO_PROGRESO} claveI18n="navProgreso" texto="Progreso"/>
        <${ItemNav} cls="nb-item" seccion="comunidad" ico=${ICO_COMUNIDAD} claveI18n="navComunidad" texto="Comunidad"/>
      </nav>`;
  }

  CR.BarraLateral = BarraLateral;
  CR.BarraSuperior = BarraSuperior;
  CR.NavInferior = NavInferior;
})(window.CR);
