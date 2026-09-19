// ============================================================
//  CONTROLES TACTILES - touch-controls.js
//  Gamepad virtual para jugar en el telefono: aparece cuando
//  se abre un minijuego y traduce los toques a eventos de
//  teclado (flechas y ESPACIO). Asi todos los minijuegos que
//  usan teclado en la PC funcionan igual en el celular, sin
//  cambiar la logica del juego.
//  Se carga DESPUES de features.js
// ============================================================

(function() {
  "use strict";

  // Solo mostrar en dispositivos con pantalla tactil
  const esTactil =
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
    ("ontouchstart" in window) ||
    ((navigator.maxTouchPoints || 0) > 0);

  // Despacha un evento keydown sintetico. Los minijuegos ya escuchan
  // window.addEventListener("keydown", ...) y revisan e.code, por lo
  // que funcionan igual que con el teclado fisico.
  function despacharTecla(code) {
    window.dispatchEvent(new KeyboardEvent("keydown", {
      code: code,
      bubbles: true,
      cancelable: false
    }));
  }

  // Conecta un boton del gamepad. Se usa pointerdown (o touchstart de
  // respaldo) y se hace preventDefault para que NO se dispare tambien
  // un click real: asi los minijuegos que cuentan clics (pelea) no
  // suman de mas.
  function conectarBoton(btn, code) {
    const enviar = function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      despacharTecla(code);
    };
    if (window.PointerEvent) {
      btn.addEventListener("pointerdown", enviar);
    } else {
      btn.addEventListener("touchstart", enviar, { passive: false });
    }
    btn.addEventListener("contextmenu", function(ev) { ev.preventDefault(); });
  }

  function crearGamepad() {
    const pad = document.createElement("div");
    pad.id = "gamepad-tactil";
    pad.setAttribute("aria-hidden", "true");
    pad.innerHTML =
      "<div class='gamepad-flechas'>" +
        "<button type='button' class='gp-btn gp-flecha-up' aria-label='Arriba'>⬆️</button>" +
        "<button type='button' class='gp-btn gp-flecha-left' aria-label='Izquierda'>⬅️</button>" +
        "<button type='button' class='gp-btn gp-flecha-down' aria-label='Abajo'>⬇️</button>" +
        "<button type='button' class='gp-btn gp-flecha-right' aria-label='Derecha'>➡️</button>" +
      "</div>" +
      "<button type='button' class='gp-btn gp-accion' aria-label='Acción'>⚡<small>ESPACIO</small></button>";

    conectarBoton(pad.querySelector(".gp-flecha-up"), "ArrowUp");
    conectarBoton(pad.querySelector(".gp-flecha-left"), "ArrowLeft");
    conectarBoton(pad.querySelector(".gp-flecha-down"), "ArrowDown");
    conectarBoton(pad.querySelector(".gp-flecha-right"), "ArrowRight");
    conectarBoton(pad.querySelector(".gp-accion"), "Space");

    document.body.appendChild(pad);
    return pad;
  }

  document.addEventListener("DOMContentLoaded", function() {
    if (!esTactil) return;

    // Todos los minijuegos con teclado se juegan dentro de modalDominios
    const modalDominios = document.getElementById("modalDominios");
    if (!modalDominios) return;

    const pad = crearGamepad();
    modalDominios.addEventListener("show.bs.modal", function() {
      pad.classList.add("visible");
    });
    modalDominios.addEventListener("hidden.bs.modal", function() {
      pad.classList.remove("visible");
    });
  });
})();