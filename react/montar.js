// ============================================================
//  COPERO - react/montar.js
//  Ensambla la aplicación completa y la monta en #aplicacion.
//  IMPORTANTE: se ejecuta ANTES que los scripts de la base y usa
//  flushSync para que el DOM quede listo en este mismo tick
//  (React 18 creaRoot+render es asíncrono por defecto). Después
//  de este render, la estructura NO vuelve a cambiar: espejo
//  exacto del index.html original para que app.js/ui.js/…
//  sigan operando por id.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;
  const Fragment = React.Fragment;

  // Pantalla de juego: tarjeta del jugador + ruta + las 4 vistas.
  function PantallaJuego() {
    return html`
      <div id="pantalla-juego" className="hidden">
        <${CR.TarjetaJugador}/>
        <${CR.AppRuta}/>
        <${CR.VistaCarrera}/>
        <${CR.VistaEntrenamiento}/>
        <${CR.VistaProgreso}/>
        <${CR.VistaComunidad}/>
      </div>`;
  }

  // Orden exacto de modales del index.html original (552-830).
  function Aplicacion() {
    return html`
      <${Fragment}>
        <${CR.Cinematica}/>
        <${CR.AmbienteFX}/>
        <${CR.BarraScroll}/>
        <${CR.BarraLateral}/>
        <${CR.BarraSuperior}/>
        <${CR.NavInferior}/>
        <div className="container flex-grow-1" id="contenido-juego">
          <${CR.CuentaPanel}/>
          <${CR.PantallaInicio}/>
          <${PantallaJuego}/>
          <${CR.PantallaResumen}/>
        </div>
        <${CR.PiePagina}/>
        <${CR.ToastCopero}/>
        <${CR.ModalInfo}/>
        <${CR.ModalDecision}/>
        <${CR.ModalFichajes}/>
        <${CR.ModalPenal}/>
        <${CR.ModalPartidoInteractivo}/>
        <${CR.ModalMomentosClave}/>
        <${CR.ModalTiroLibre}/>
        <${CR.ModalDominios}/>
        <${CR.ModalSS}/>
        <${CR.ModalRol}/>
        <${CR.ModalRanking}/>
        <${CR.ModalRedesSociales}/>
        <${CR.ModalEntrenamientoAtributos}/>
        <${CR.ModalMinijuegoCamiseta}/>
        <${CR.ModalDardos}/>
        <${CR.ModalConfiguracion}/>
      </${Fragment}>`;
  }

  const contenedor = document.getElementById("aplicacion");
  if (contenedor) {
    const raiz = ReactDOM.createRoot(contenedor);
    // flushSync garantiza que todo el DOM exista antes de que
    // continúe la carga (scripts base + DOMContentLoaded).
    ReactDOM.flushSync(function () {
      raiz.render(React.createElement(Aplicacion));
    });
  }
})(window.CR);
