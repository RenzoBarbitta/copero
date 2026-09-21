// ============================================================
//  EVENT OUTCOMES - event-outcomes.js
//  Decide resultados narrativos a partir del minijuego de
//  primera persona (event-outcomes).
//
//  Las funciones SOLO devuelven el resultado: NUNCA tocan el
//  estado del jugador directamente. El sistema de carrera es el
//  que aplica los deltas a moral / ovr / estadísticas.
//
//  Forma del resultado:
//    { moral: number (opcional, delta), ovrTemporal: number
//      (opcional, delta), mensaje: string }
//  Si una propiedad no aplica, se omite del objeto (no se pone 0).
// ============================================================

(function (global) {
  "use strict";

  // VARIANTE 1 - "Roce con la barra brava"
  // Salida del túnel del estadio post-partido. Lo que importa es
  // salir sin lío: los choques son empujones en la boca del túnel.
  function resolveTunnelEvent(choques) {
    choques = Number(choques) || 0;
    if (choques === 0) {
      return {
        moral: 2,
        mensaje: "Saliste tranquilo, la gente hasta te aplaudió."
      };
    }
    if (choques === 1) {
      return {
        moral: -10,
        mensaje: "Te empujaron un poco en la salida, quedaste incómodo."
      };
    }
    return {
      moral: -20,
      mensaje: "Salida caótica, quedó un video dando vueltas en redes."
    };
  }

  // VARIANTE 2 - "Carrera hacia el vestuario bajo lluvia"
  // Llegada tarde, opción de ir corriendo. Si llegás sin chocar
  // rendís bien pese al retraso; si chocás mucho, llegás recién
  // cuando ya arrancó el partido.
  function resolveLateRunEvent(choques) {
    choques = Number(choques) || 0;
    if (choques === 0) {
      return {
        ovrTemporal: 2,
        mensaje: "Llegaste agitado pero a tiempo, se notó el compromiso."
      };
    }
    if (choques === 1 || choques === 2) {
      return {
        moral: -5,
        mensaje: "Llegaste raspando, algo tarde y agitado."
      };
    }
    return {
      moral: -15,
      mensaje: "No llegaste a tiempo. El DT no dijo nada, pero la cara lo decía todo."
    };
  }

  // Accesorio: dado un resultado y el estado del jugador, devuelve
  // el nuevo estado y el mensaje listo para mostrar. Solo lectura
  // del jugador: NO lo modifica (clona los deltas para que afuera
  // decida cómo aplicarlos).
  function aplicarResultado(kind, choques, jugador) {
    var resultado = kind === "tunnel"
      ? resolveTunnelEvent(choques)
      : resolveLateRunEvent(choques);
    var nuevo = Object.create(null);
    if (resultado.moral != null && jugador && typeof jugador.moral === "number") {
      nuevo.moral = Math.max(0, Math.min(100, jugador.moral + resultado.moral));
    }
    if (resultado.ovrTemporal != null && jugador && typeof jugador.ovr === "number") {
      nuevo.ovrTemporal = resultado.ovrTemporal;
    }
    nuevo.mensaje = resultado.mensaje;
    nuevo.deltas = resultado;
    return nuevo;
  }

  global.resolveTunnelEvent = resolveTunnelEvent;
  global.resolveLateRunEvent = resolveLateRunEvent;
  global.aplicarResultado = aplicarResultado;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      resolveTunnelEvent: resolveTunnelEvent,
      resolveLateRunEvent: resolveLateRunEvent,
      aplicarResultado: aplicarResultado
    };
  }
})(typeof window !== "undefined" ? window : this);