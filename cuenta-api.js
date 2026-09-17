// REST nativo: sin SDK ni claves administrativas. Sesión solo en memoria.
(function() {
  "use strict";
  let sesion = null;
  let renovacion = null;
  let generacion = 0;

  async function solicitar(ruta, metodo, cuerpo, token) {
    const controlador = new AbortController();
    const timer = setTimeout(function() { controlador.abort(); }, 12000);
    try {
      const headers = { apikey: COPERO_SUPABASE.publishableKey };
      if (token) headers.Authorization = "Bearer " + token;
      if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
      const res = await fetch(COPERO_SUPABASE.url + ruta, {
        method: metodo || "GET", headers: headers, cache: "no-store",
        signal: controlador.signal,
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
      });
      if (!res.ok) {
        const error = new Error(res.status === 429
          ? "Demasiados intentos. Esperá unos minutos antes de reintentar."
          : res.status === 401 || res.status === 403
            ? "No se autorizó la operación. Revisá tu sesión y la confirmación del correo."
            : "No se pudo completar la operación. Revisá los datos o intentá más tarde.");
        error.status = res.status;
        throw error;
      }
      const texto = await res.text();
      return texto ? JSON.parse(texto) : null;
    } catch (error) {
      if (error.status) throw error;
      throw new Error("No se pudo conectar con las cuentas. Revisá internet e intentá otra vez.");
    } finally {
      clearTimeout(timer);
    }
  }

  function aceptarSesion(datos) {
    if (!datos || !datos.access_token || !datos.refresh_token || !datos.user || !datos.user.id) {
      throw new Error("El servidor no devolvió una sesión válida.");
    }
    sesion = {
      token: datos.access_token, refresh: datos.refresh_token, user: datos.user.id,
      vence: Date.now() + Number(datos.expires_in || 3600) * 1000
    };
  }

  async function tokenActual() {
    if (!sesion) throw new Error("Iniciá sesión para usar tu perfil.");
    if (sesion.vence > Date.now() + 60000) return sesion.token;
    if (!renovacion) {
      const version = generacion;
      const refresh = sesion.refresh;
      renovacion = (async function() {
        try {
          const datos = await solicitar("/auth/v1/token?grant_type=refresh_token", "POST", { refresh_token: refresh });
          if (version !== generacion) throw new Error("La sesión cambió. Iniciá sesión otra vez.");
          aceptarSesion(datos);
          return sesion.token;
        } finally { renovacion = null; }
      })();
    }
    return renovacion;
  }

  function validarCredenciales(email, password) {
    if (!email || !email.includes("@") || !password) throw new Error("Completá correo y contraseña.");
  }

  const cuenta = {
    tieneSesion: function() { return !!sesion; },
    async registrar(email, password, aceptaPrivacidad) {
      if (aceptaPrivacidad !== true) throw new Error("Aceptá la Política de privacidad para crear tu cuenta.");
      validarCredenciales(email, password);
      if (password.length < 8) throw new Error("Usá una contraseña de al menos 8 caracteres.");
      await solicitar("/auth/v1/signup", "POST", {
        email: email.trim(), password: password,
        data: { privacy_version: "2026-09-17", privacy_accepted_at: new Date().toISOString() }
      });
      // No iniciar sesión automáticamente: mantener la confirmación por correo.
    },
    async entrar(email, password) {
      validarCredenciales(email, password);
      const version = ++generacion;
      sesion = null;
      const datos = await solicitar("/auth/v1/token?grant_type=password", "POST", {
        email: email.trim(), password: password
      });
      if (version !== generacion) throw new Error("Se canceló el inicio de sesión.");
      aceptarSesion(datos);
    },
    async salir() {
      const anterior = sesion;
      ++generacion;
      sesion = null;
      if (anterior) await solicitar("/auth/v1/logout?scope=local", "POST", undefined, anterior.token);
    },
    async perfil() {
      const token = await tokenActual();
      const lista = await solicitar("/rest/v1/copero_profiles?select=display_name&user_id=eq." +
        encodeURIComponent(sesion.user), "GET", undefined, token);
      return Array.isArray(lista) && lista[0] ? lista[0].display_name : null;
    },
    async guardarPerfil(nombre) {
      nombre = String(nombre || "").trim();
      if (Array.from(nombre).length < 2 || Array.from(nombre).length > 30) {
        throw new Error("El apodo debe tener entre 2 y 30 caracteres.");
      }
      const token = await tokenActual();
      const user = sesion.user;
      const actual = await cuenta.perfil();
      if (!sesion || sesion.user !== user) throw new Error("La sesión cambió. Reintentá.");
      if (actual !== null) {
        await solicitar("/rest/v1/copero_profiles?user_id=eq." + encodeURIComponent(user),
          "PATCH", { display_name: nombre }, token);
      } else {
        try {
          await solicitar("/rest/v1/copero_profiles", "POST", { user_id: user, display_name: nombre }, token);
        } catch (error) {
          // Otra pestaña pudo crear el perfil entre la consulta y la inserción.
          if (error.status !== 409) throw error;
          await solicitar("/rest/v1/copero_profiles?user_id=eq." + encodeURIComponent(user),
            "PATCH", { display_name: nombre }, token);
        }
      }
      return nombre;
    }
  };
  window.CoperoCuenta = cuenta;
})();
