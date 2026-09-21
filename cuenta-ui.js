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

    // Muestra el formulario o el perfil según haya sesión, y si hay sesión
    // recién restaurada (p. ej. tras recargar con F5) relee el apodo.
    function refrescarVistaCuenta() {
      const activa = !!(api && typeof api.tieneSesion === "function" ? api.tieneSesion() : false);
      acceso.hidden = activa;
      perfil.hidden = !activa;
      if (activa && !apodo.value && api && typeof api.perfil === "function") {
        api.perfil().then(function(nombre) {
          if (nombre === undefined || nombre === null) return;
          if (api.tieneSesion()) apodo.value = String(nombre);
        }).catch(function() { /* el apodo se rellena al abrir o con "Leer perfil" */ });
      }
    }

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
        refrescarVistaCuenta();
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
        // Login: si la sesión quedó iniciada pero el perfil no se pudo leer,
        // no mostramos un error de login: lo dejamos como advertencia aislada.
        await api.entrar(email.value, password.value);
        apodo.value = "";
        let nombre = null;
        let perfilOk = true;
        try {
          nombre = await api.perfil();
        } catch (e) {
          perfilOk = false;
        }
        if (!perfilOk) {
          return (typeof t === "function" ? t("cuentaSesionOk") : "Sesión iniciada.") + " No se pudo leer el perfil en este momento (revisá tu conexión). Podés usar «Leer perfil».";
        }
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

    // Al cargar la página y ante cada cambio de sesión (login, cierre o
    // restauración tras F5), el panel refleja el estado real de la cuenta.
    refrescarVistaCuenta();
    document.addEventListener("cuenta:sesion-cambiada", refrescarVistaCuenta);
  });
})();
