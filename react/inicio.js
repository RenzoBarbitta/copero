// ============================================================
//  COPERO - react/inicio.js
//  Pantalla de inicio (parte 1): panel de cuenta Supabase y
//  encabezado (logos, título, nombre del jugador). Transcripción
//  fiel del index.html original (líneas 88-132 y compositor).
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;

  function CuentaPanel() {
    return html`
      <details className="card card-custom p-3 mt-3" id="cuenta-panel">
        <summary className="fw-bold" data-i18n="cuentaTitulo">👤 Mi cuenta (opcional)</summary>
        <p className="small mt-2" data-i18n="cuentaInfo">Tu carrera sigue guardada en este dispositivo. Supabase gestiona tu correo, autenticación y apodo.</p>
        <form id="cuenta-form">
          <label htmlFor="cuenta-email" className="form-label" data-i18n="cuentaEmail">Correo electrónico</label>
          <input id="cuenta-email" type="email" className="form-control mb-2" autoComplete="username" required=${true} maxLength="254"/>
          <label htmlFor="cuenta-pass" className="form-label" data-i18n="cuentaPass">Contraseña</label>
          <input id="cuenta-pass" type="password" className="form-control mb-3" autoComplete="current-password" required=${true}/>
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="cuenta-privacidad" aria-describedby="cuenta-privacidad-ayuda"/>
            <label className="form-check-label" htmlFor="cuenta-privacidad"><span data-i18n="cuentaAcepto1">Leí y acepto la</span> <a href="privacidad.html" target="_blank" rel="noopener" data-i18n="cuentaPrivacidadLink">Política de privacidad (abre otra pestaña)</a> <span data-i18n="cuentaAcepto2">para crear mi cuenta.</span></label>
          </div>
          <p className="small" id="cuenta-privacidad-ayuda" data-i18n="cuentaAyuda">Obligatorio solo al registrarse. Usamos el correo y la autenticación para gestionar tu cuenta y el apodo para tu perfil. Esta aceptación no autoriza publicidad ni medición opcional.</p>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-primary" type="submit" data-i18n="cuentaLogin">Iniciar sesión</button>
            <button className="btn btn-outline-primary" type="submit" value="registrar" data-i18n="cuentaCrear">Crear cuenta</button>
          </div>
          <p className="small mt-2" data-i18n="cuentaRegistroAyuda">Para registrarte, usá al menos 8 caracteres. Confirmá el correo recibido antes de iniciar sesión.</p>
        </form>
        <form id="cuenta-perfil" hidden=${true}>
          <label htmlFor="cuenta-apodo" className="form-label" data-i18n="cuentaApodo">Apodo del perfil</label>
          <input id="cuenta-apodo" className="form-control mb-3" minLength="2" maxLength="30" required=${true} autoComplete="nickname"/>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-primary" type="submit" data-i18n="cuentaGuardarApodo">Guardar apodo</button>
            <button id="cuenta-leer" className="btn btn-outline-primary" type="button" data-i18n="cuentaLeerPerfil">Volver a leer perfil</button>
            <button id="cuenta-salir" className="btn btn-outline-secondary" type="button" data-i18n="cuentaSalir">Cerrar sesión</button>
          </div>
        </form>
        <p id="cuenta-estado" className="small mt-3 mb-0" role="status" aria-live="polite"></p>
      </details>`;
  }

  function InicioEncabezado() {
    return html`
      <div className="logos-principales">
        <a href="https://discord.gg/jdFB6EHrjQ" target="_blank" rel="noopener" aria-label="Discord PSO Argentina"><img src="imagenes/logopsoarg-web.png" alt="PSO Argentina Logo" className="logo-principal" loading="lazy" decoding="async"/></a>
        <a href="https://discord.com/invite/NPuKuhVfHv" target="_blank" rel="noopener" aria-label="Discord PSO Brasil"><img src="imagenes/logopsobr-web.png" alt="PSO Brasil Logo" className="logo-principal" loading="lazy" decoding="async"/></a>
        <a href="https://discord.gg/J3Geb4EjDa" target="_blank" rel="noopener" aria-label="Discord PSO Uruguay"><img src="imagenes/logo-web.png" alt="PSO Uruguay Logo" className="logo-principal" loading="lazy" decoding="async"/></a>
      </div>
      <h1 className="mb-4 text-primary fw-bold" data-i18n="titulo">CARRERA PSO</h1>
      <div className="intro-banner" aria-hidden="true">
        <img src="imagenes/banner-web.png" alt="" className="intro-banner-img" loading="lazy" decoding="async"/>
        <span className="intro-banner-velo"></span>
        <span className="intro-banner-brillo"></span>
        <img src="imagenes/icon-512.png" alt="" className="intro-banner-logo" loading="lazy" decoding="async"/>
      </div>
      <div className="mb-3 text-start">
        <label className="form-label fw-bold" htmlFor="input-nombre" data-i18n="nombreJugador">Nombre del Jugador:</label>
        <input type="text" id="input-nombre" className="form-control bg-light text-dark border-secondary" placeholder="Ej: Caseros" maxLength="30" autoComplete="off"/>
      </div>`;
  }

  // Compositor de la pantalla de inicio (orden idéntico al original).
  function PantallaInicio() {
    return html`
      <div id="pantalla-inicio" className="card card-custom p-4 text-center mt-4">
        <${CR.InicioEncabezado}/>
        <${CR.InicioCancha}/>
        <${CR.InicioModos}/>
        <${CR.InicioApoyo}/>
      </div>`;
  }

  CR.CuentaPanel = CuentaPanel;
  CR.InicioEncabezado = InicioEncabezado;
  CR.PantallaInicio = PantallaInicio;
})(window.CR);
