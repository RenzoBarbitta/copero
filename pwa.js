// ============================================================
//  PWA - pwa.js
//  Convierte el juego en una app instalable en el telefono:
//   - Registra el Service Worker (funcionamiento offline).
//   - Muestra el boton "📥 Instalar App" cuando el navegador
//     permite instalar (Chrome/Android/Edge).
//   - En iOS (Safari): Compartir -> "Agregar a pantalla de
//     inicio" (ver README-MOVIL.md).
//  Se carga al final del body.
// ============================================================

(function() {
  "use strict";

  // El Service Worker solo funciona en https o localhost
  const contextoValido = location.protocol === "https:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  if ("serviceWorker" in navigator && contextoValido) {
    window.addEventListener("load", function() {
      // updateViaCache: none -> el navegador siempre revalida sw.js
      // (nunca lo toma de la cache HTTP) y detecta la version nueva
      // del service worker en cuanto se despliega.
      navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(function() {
        /* sin SW el juego funciona igual, solo sin offline */
      });
    });
  }

  let eventoInstalacion = null;

  window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    eventoInstalacion = e;
    const btn = document.getElementById("btn-instalar");
    if (btn) btn.classList.remove("hidden");
  });

  window.addEventListener("appinstalled", function() {
    eventoInstalacion = null;
    const btn = document.getElementById("btn-instalar");
    if (btn) btn.classList.add("hidden");
  });

  document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("btn-instalar");
    if (!btn) return;
    btn.addEventListener("click", function() {
      if (!eventoInstalacion) return;
      eventoInstalacion.prompt();
      eventoInstalacion.userChoice.then(function() {
        eventoInstalacion = null;
        btn.classList.add("hidden");
      }).catch(function() { /* ignorar */ });
    });
  });
})();