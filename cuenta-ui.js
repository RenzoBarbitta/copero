// Controles de cuenta independientes de la carrera y del ranking.
(function() {
  "use strict";
  document.addEventListener("DOMContentLoaded", function() {
    const panel = document.getElementById("cuenta-panel");
    if (!panel) return;
    const acceso = document.getElementById("cuenta-form");
    const perfil = document.getElementById("cuenta-perfil");
    const email = document.getElementById("cuenta-email");
    const password = document.getElementById("cuenta-pass");
    const apodo = document.getElementById("cuenta-apodo");
    const estado = document.getElementById("cuenta-estado");
    const api = window.CoperoCuenta;
    let ocupado = false;

    async function ejecutar(accion) {
      if (ocupado) return;
      ocupado = true;
      panel.querySelectorAll("button, input").forEach(function(el) { el.disabled = true; });
      estado.textContent = typeof t === "function" ? t("cuentaConectando") : "Conectando…";
      try {
        estado.textContent = await accion();
      } catch (error) {
        estado.textContent = error.message;
      } finally {
        password.value = "";
        acceso.hidden = api.tieneSesion();
        perfil.hidden = !api.tieneSesion();
        panel.querySelectorAll("button, input").forEach(function(el) { el.disabled = false; });
        ocupado = false;
      }
    }

    acceso.addEventListener("submit", function(evento) {
      evento.preventDefault();
      const registro = evento.submitter && evento.submitter.value === "registrar";
      const privacidad = document.getElementById("cuenta-privacidad");
      if (registro && !privacidad.checked) {
        estado.textContent = typeof t === "function" ? t("cuentaPrivacidadError") : "Para crear la cuenta, leé y aceptá la Política de privacidad.";
        privacidad.focus();
        return;
      }
      ejecutar(async function() {
        if (registro) {
          await api.registrar(email.value, password.value, privacidad.checked);
          privacidad.checked = false;
          return (typeof t === "function" ? t("cuentaRegistroOk") : "Solicitud enviada. Si corresponde crear la cuenta, recibirás un correo de confirmación.") + " Revisá también spam y luego iniciá sesión.";
        }
        await api.entrar(email.value, password.value);
        apodo.value = "";
        const nombre = await api.perfil();
        apodo.value = nombre || "";
        return nombre ? (typeof t === "function" ? t("cuentaSesionOk") : "Sesión iniciada.") + " Perfil leído correctamente." : (typeof t === "function" ? t("cuentaSesionOk") : "Sesión iniciada.") + " Elegí un apodo para crear tu perfil.";
      });
    });
    perfil.addEventListener("submit", function(evento) {
      evento.preventDefault();
      ejecutar(async function() {
        const nombre = await api.guardarPerfil(apodo.value);
        const leido = await api.perfil();
        if (leido !== nombre) throw new Error("No se pudo confirmar el guardado. Volvé a leer el perfil.");
        apodo.value = leido;
        return typeof t === "function" ? t("cuentaPerfilOk") : "Apodo guardado y verificado.";
      });
    });
    document.getElementById("cuenta-leer").addEventListener("click", function() {
      ejecutar(async function() {
        const nombre = await api.perfil();
        apodo.value = nombre || "";
        return nombre === null ? "Todavía no hay un perfil guardado." : "Perfil leído correctamente.";
      });
    });
    document.getElementById("cuenta-salir").addEventListener("click", function() {
      ejecutar(async function() {
        apodo.value = "";
        email.value = "";
        try { await api.salir(); }
        catch (error) { return "Sesión eliminada de esta página. No se pudo confirmar la revocación remota; los tokens emitidos pueden seguir vigentes hasta su vencimiento."; }
        return typeof t === "function" ? t("cuentaSesionCerrada") : "Sesión cerrada. Tu carrera local no cambió.";
      });
    });
  });
})();
