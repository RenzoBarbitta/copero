// ============================================================
//  COPERO - react/fx.js
//  Componentes decorativos con estado propio (los ÚNICOS con
//  estado de toda la capa React):
//   - AmbienteFX: orbes de luz del fondo con parallax que sigue
//     el puntero (solo punteros finos, con requestAnimationFrame).
//   - BarraScroll: progreso de lectura de la página.
//  Ambos son aria-hidden y no tocan ningún id de la base.
// ============================================================
(function (CR) {
  "use strict";
  const html = CR.html;
  const useState = React.useState;
  const useEffect = React.useEffect;

  function AmbienteFX() {
    const [puntero, setPuntero] = useState({ x: 0, y: 0 });

    useEffect(function () {
      if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return undefined;
      let enCola = false;
      let ultimo = null;
      function mover(ev) {
        ultimo = ev;
        if (enCola) return;
        enCola = true;
        requestAnimationFrame(function () {
          enCola = false;
          setPuntero({
            x: (ultimo.clientX / window.innerWidth - 0.5) * 2,
            y: (ultimo.clientY / window.innerHeight - 0.5) * 2
          });
        });
      }
      window.addEventListener("pointermove", mover, { passive: true });
      return function () { window.removeEventListener("pointermove", mover); };
    }, []);

    const dx = puntero.x;
    const dy = puntero.y;

    return html`
      <div className="fx-ambiente" aria-hidden="true">
        <span className="fx-orb fx-orb-1" style=${{ transform: "translate3d(" + (dx * -26).toFixed(2) + "px," + (dy * -18).toFixed(2) + "px,0)" }}><i></i></span>
        <span className="fx-orb fx-orb-2" style=${{ transform: "translate3d(" + (dx * 22).toFixed(2) + "px," + (dy * 15).toFixed(2) + "px,0)" }}><i></i></span>
        <span className="fx-orb fx-orb-3" style=${{ transform: "translate3d(" + (dx * -14).toFixed(2) + "px," + (dy * 24).toFixed(2) + "px,0)" }}><i></i></span>
        <span className="fx-orb fx-orb-4" style=${{ transform: "translate3d(" + (dx * 16).toFixed(2) + "px," + (dy * -20).toFixed(2) + "px,0)" }}><i></i></span>
        <span className="fx-orb fx-orb-5" style=${{ transform: "translate3d(" + (dx * -18).toFixed(2) + "px," + (dy * -14).toFixed(2) + "px,0)" }}><i></i></span>
        <span className="fx-orbes-peq" style=${{ transform: "translate3d(" + (dx * 8).toFixed(2) + "px," + (dy * 10).toFixed(2) + "px,0)" }}>
          <i className="peq-1"></i>
          <i className="peq-2"></i>
          <i className="peq-3"></i>
          <i className="peq-4"></i>
        </span>
        <span className="fx-aurora" style=${{ transform: "translate3d(" + (dx * -6).toFixed(2) + "px," + (dy * 4).toFixed(2) + "px,0)" }}></span>
        <span className="fx-reflejos" style=${{ transform: "translate3d(" + (dx * -10).toFixed(2) + "px," + (dy * 6).toFixed(2) + "px,0)" }}></span>
        <span className="fx-polvo"></span>
        <span className="fx-lineas-cancha"></span>
      </div>`;
  }

  function BarraScroll() {
    const [progreso, setProgreso] = useState(0);
    useEffect(function () {
      function calcular() {
        const alto = document.documentElement.scrollHeight - window.innerHeight;
        setProgreso(alto > 0 ? Math.min(100, (window.scrollY / alto) * 100) : 0);
      }
      calcular();
      window.addEventListener("scroll", calcular, { passive: true });
      window.addEventListener("resize", calcular);
      return function () {
        window.removeEventListener("scroll", calcular);
        window.removeEventListener("resize", calcular);
      };
    }, []);
    return html`<div className="fx-scroll" aria-hidden="true"><span style=${{ width: progreso + "%" }}></span></div>`;
  }

  // Cinemática de apertura: pantalla completa que se autodesmonta.
  // Fases: "en" (logo + orbes + letras entran) → "fuera" (zoom-out y
  // fade del contenedor) → "fin" (return null, se quita del DOM).
  // aria-hidden: es decorativa; el juego de abajo ya carga y anima.
  function Cinematica() {
    const [fase, setFase] = useState("en");
    useEffect(function () {
      const t1 = setTimeout(function () { setFase("fuera"); }, 2500);
      const t2 = setTimeout(function () { setFase("fin"); }, 3350);
      return function () { clearTimeout(t1); clearTimeout(t2); };
    }, []);
    if (fase === "fin") return null;
    const letras = "COPERO".split("").map(function (L) {
      return html`<span>${L}</span>`;
    });
    return html`
      <div className=${"cinematica" + (fase === "fuera" ? " cinematica-fuera" : "")} aria-hidden="true">
        <span className="cine-orb cine-orb-1"></span>
        <span className="cine-orb cine-orb-2"></span>
        <span className="cine-orb cine-orb-3"></span>
        <span className="cine-anillo"></span>
        <div className="cine-centro">
          <div className="cine-fx">
            <img className="cine-logo" src="imagenes/icon-512.png" alt=""/>
            <span className="cine-brillo"></span>
          </div>
          <div className="cine-titulo" aria-hidden="true">${letras}</div>
        </div>
        <span className="cine-linea"></span>
      </div>`;
  }

  CR.AmbienteFX = AmbienteFX;
  CR.BarraScroll = BarraScroll;
  CR.Cinematica = Cinematica;
})(window.CR);
