// Cuenta Copero: sesión persistente con el cliente oficial de Supabase.
//
//  - supabase-js (v2) guarda la sesión en localStorage y la restaura sola al
//    recargar la página; los tokens se renuevan en segundo plano.
//  - Los errores se registran en la consola con detalle (status, code, body)
//    y se muestran mensajes amigables en la interfaz.
//  - window.CoperoCuenta mantiene la misma interfaz pública que antes
//    (tieneSesion, idUsuario, token, registrar, entrar, salir, perfil,
//    guardarPerfil) así el ranking y el 1v1 no se tocan.
(function() {
  "use strict";

  function textoConta(clave, fallback) {
    const valor = typeof t === "function" ? t(clave) : clave;
    return valor === clave ? fallback : valor;
  }

  let sesion = null;      // espejo en memoria de la sesión persistida
  let renovacion = null;  // promesa única de renovación de token
  let generacion = 0;

  function obtenerCliente() {
    if (typeof window !== "undefined" && window && typeof window.getSupabaseClient === "function") {
      return window.getSupabaseClient();
    }
    // Fallback para pruebas sin supabase-config.js.
    if (typeof supabase !== "undefined") {
      return supabase.createClient(COPERO_SUPABASE.url, COPERO_SUPABASE.publishableKey);
    }
    throw new Error("Supabase SDK no disponible.");
  }

  // Diagnóstico estructurado para reportes de GitHub: siempre a consola.
  function logDetalle(op, info) {
    try {
      console.error("[cuenta-api] " + op, JSON.stringify({
        operacion: op,
        status: info && info.status,
        code: info && info.code,
        mensaje: info && info.message,
        detalle: info && info.details,
        pista: (info && info.hint) || undefined
      }, null, 2));
    } catch (e) {
      try { console.error("[cuenta-api] " + op, info); } catch (e2) { /* sin consola */ }
    }
  }

  // Convierte un error del SDK en un Error con mensaje amigable (y status).
  function errorDeSupabase(error, op) {
    if (!error) return error;
    const codigo = String(error.code || "");
    const mensaje = String(error.message || "").toLowerCase();
    let texto;
    if (op === "login") {
      if (codigo === "email_not_confirmed" || mensaje.indexOf("email not confirmed") !== -1) {
        texto = "Confirmá tu correo antes de iniciar sesión (revisá también spam).";
      } else if (codigo === "invalid_credentials" || codigo === "invalid_grant" ||
                 mensaje.indexOf("invalid login credentials") !== -1) {
        texto = "Correo o contraseña incorrectos.";
      } else if (error.status === 429 || codigo.indexOf("rate_limit") !== -1) {
        texto = textoConta("cuentaError429", "Demasiados intentos. Esperá unos minutos antes de reintentar.");
      } else {
        texto = "No se pudo iniciar sesión en este momento. Revisá los datos o intentá más tarde.";
      }
    } else if (op === "registro") {
      if (codigo.indexOf("user_already_exists") !== -1) {
        texto = "Ya existe una cuenta con ese correo. Iniciá sesión o pedí restablecer la contraseña.";
      } else if (error.status === 429 || codigo.indexOf("rate_limit") !== -1) {
        texto = textoConta("cuentaError429", "Demasiados intentos. Esperá unos minutos antes de reintentar.");
      } else if (codigo === "email_provider_disabled" || /provider.?disabled|imap/.test(mensaje)) {
        texto = "No se pudo preparar el correo de confirmación. Avisá al administrador del proyecto una vez.";
      } else {
        texto = "No se pudo crear la cuenta en este momento. Revisá los datos o intentá más tarde.";
      }
    } else if (codigo === "42501" || codigo === "40101") {
      texto = textoConta("cuentaErrorAuth", "No se autorizó la operación. Revisá tu sesión y la confirmación del correo.");
    } else if (error.status === 401) {
      texto = "Tu sesión venció. Iniciá sesión otra vez para continuar.";
    } else {
      texto = textoConta("cuentaErrorGeneral", "No se pudo completar la operación. Revisá los datos o intentá más tarde.");
    }
    const fallo = new Error(texto);
    if (error.status) fallo.status = error.status;
    if (error.code) fallo.code = error.code;
    return fallo;
  }

  // Avisa al resto de la app (ranking, UI) cuando cambia la sesión.
  function avisarCambioSesion() {
    try {
      window.dispatchEvent(new CustomEvent("cuenta:sesion-cambiada"));
    } catch (e) { /* sin window (tests) o evento no soportado */ }
  }

  function sesionDesdeSDK(ss) {
    return {
      token: ss && ss.access_token,
      refresh: ss && ss.refresh_token,
      user: ss && ss.user && ss.user.id,
      vence: (Number(ss && ss.expires_at) || 0) * 1000
    };
  }

  // Lee la sesión persistida (localStorage del SDK) y la vuelca en memoria.
  async function restaurarSesion() {
    const sb = obtenerCliente();
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) throw errorDeSupabase(error, "sesion");
      sesion = data && data.session ? sesionDesdeSDK(data.session) : null;
    } catch (error) {
      if (error && error.status) throw error;
      throw new Error(textoConta("cuentaErrorConexion", "No se pudo conectar con las cuentas. Revisá internet e intentá otra vez."));
    }
    return sesion;
  }

  async function tokenActual() {
    let s = sesion;
    if (!s) s = await restaurarSesion();
    if (!s) throw new Error(textoConta("cuentaErrorIniciar", "Iniciá sesión para usar tu perfil."));
    if (s.vence > Date.now() + 60000) return s.token;
    if (!renovacion) {
      const version = generacion;
      const sb = obtenerCliente();
      renovacion = (async function() {
        try {
          // getUser valida el token vigente y renueva el acceso si ya venció.
          const r = await sb.auth.getUser();
          if (r.error) throw errorDeSupabase(r.error, "token");
          if (version !== generacion) throw new Error("La sesión cambió. Iniciá sesión otra vez.");
          const g = await sb.auth.getSession();
          if (g.error) throw errorDeSupabase(g.error, "token");
          if (!g.data || !g.data.session) throw new Error(textoConta("cuentaErrorIniciar", "Iniciá sesión para usar tu perfil."));
          sesion = sesionDesdeSDK(g.data.session);
          return sesion.token;
        } finally {
          renovacion = null;
        }
      })();
    }
    return renovacion;
  }

  function validarCredenciales(email, password) {
    if (!email || !email.includes("@") || !password) throw new Error("Completá correo y contraseña.");
  }

  function conectar(evento, sesionSDK) {
    const huboSesion = !!sesion;
    sesion = sesionSDK ? sesionDesdeSDK(sesionSDK) : null;
    if (evento !== "INITIAL_SESSION" || huboSesion || sesion) avisarCambioSesion();
  }

  // Restaura la sesión guardada y se mantiene al tanto de las renovaciones.
  function iniciarEscucha() {
    try {
      obtenerCliente().auth.onAuthStateChange(conectar);
    } catch (e) {
      logDetalle("inicializar escucha de sesión", e);
    }
  }

  const cuenta = {
    tieneSesion: function() { return !!sesion; },
    // Id del usuario de la sesion activa (o null). Lo usa el ranking
    // para resaltar la fila propia y para el upsert seguro.
    idUsuario: function() { return sesion && sesion.user ? sesion.user : null; },
    // Token vigente (renueva si esta por vencer). Lanza si no hay sesion.
    async token() { return tokenActual(); },
    async registrar(email, password, aceptaPrivacidad) {
      if (aceptaPrivacidad !== true) throw new Error("Aceptá la Política de privacidad para crear tu cuenta.");
      validarCredenciales(email, password);
      if (password.length < 8) throw new Error("Usá una contraseña de al menos 8 caracteres.");
      const sb = obtenerCliente();
      let res;
      try {
        res = await sb.auth.signUp({
          email: email.trim(), password: password,
          options: { data: { privacy_version: "2026-09-17", privacy_accepted_at: new Date().toISOString() } }
        });
      } catch (e) {
        logDetalle("registrar (red)", e);
        throw new Error(textoConta("cuentaErrorConexion", "No se pudo conectar con las cuentas. Revisá internet e intentá otra vez."));
      }
      if (res.error) {
        logDetalle("registrar", res.error);
        throw errorDeSupabase(res.error, "registro");
      }
      // No iniciar sesión automáticamente: mantener la confirmación por correo.
    },
    async entrar(email, password) {
      validarCredenciales(email, password);
      const version = ++generacion;
      sesion = null;
      const sb = obtenerCliente();
      let res;
      try {
        res = await sb.auth.signInWithPassword({ email: email.trim(), password: password });
      } catch (e) {
        logDetalle("entrar (red)", e);
        throw new Error(textoConta("cuentaErrorConexion", "No se pudo conectar con las cuentas. Revisá internet e intentá otra vez."));
      }
      if (res.error) {
        logDetalle("entrar", res.error);
        throw errorDeSupabase(res.error, "login");
      }
      if (version !== generacion) throw new Error("Se canceló el inicio de sesión.");
      sesion = res.data && res.data.session ? sesionDesdeSDK(res.data.session) : null;
      avisarCambioSesion();
    },
    async salir() {
      const anterior = sesion;
      ++generacion;
      sesion = null;
      avisarCambioSesion();
      if (!anterior) return;
      const sb = obtenerCliente();
      try {
        await sb.auth.signOut();
      } catch (e) {
        // La sesión ya se borró localmente; avisar que la revocación remota no confirmó.
        logDetalle("salir (revocación remota)", e);
        throw e;
      }
    },
    // Lee el apodo del perfil del usuario en sesión (null si no hay perfil).
    async perfil() {
      let user = sesion && sesion.user ? sesion.user : null;
      if (!user) {
        await restaurarSesion();
        user = sesion && sesion.user ? sesion.user : null;
      }
      if (!user) throw new Error(textoConta("cuentaErrorIniciar", "Iniciá sesión para usar tu perfil."));
      let resp;
      try {
        resp = await obtenerCliente().from("copero_profiles")
          .select("display_name")
          .eq("user_id", user)
          .maybeSingle();
      } catch (e) {
        logDetalle("perfil (red)", e);
        throw new Error(textoConta("cuentaErrorConexion", "No se pudo conectar con las cuentas. Revisá internet e intentá otra vez."));
      }
      if (resp.error) {
        logDetalle("perfil", resp.error);
        throw errorDeSupabase(resp.error, "perfil");
      }
      return resp.data ? resp.data.display_name : null;
    },
    async guardarPerfil(nombre) {
      nombre = String(nombre || "").trim();
      if (Array.from(nombre).length < 2 || Array.from(nombre).length > 30) {
        throw new Error("El apodo debe tener entre 2 y 30 caracteres.");
      }
      let user = sesion && sesion.user ? sesion.user : null;
      if (!user) {
        await restaurarSesion();
        user = sesion && sesion.user ? sesion.user : null;
      }
      if (!user) throw new Error(textoConta("cuentaErrorIniciar", "Iniciá sesión para usar tu perfil."));
      let resp;
      try {
        resp = await obtenerCliente().from("copero_profiles")
          .upsert({ user_id: user, display_name: nombre }, { onConflict: "user_id" });
      } catch (e) {
        logDetalle("guardarPerfil (red)", e);
        throw new Error(textoConta("cuentaErrorConexion", "No se pudo conectar con las cuentas. Revisá internet e intentá otra vez."));
      }
      if (resp.error) {
        logDetalle("guardarPerfil", resp.error);
        throw errorDeSupabase(resp.error, "perfil");
      }
      return nombre;
    }
  };
  window.CoperoCuenta = cuenta;

  if (typeof document !== "undefined" && document) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", iniciarEscucha);
    } else {
      iniciarEscucha();
    }
  }
})();