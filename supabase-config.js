// Configuración pública del proyecto. Nunca agregar secret keys ni service_role.
const COPERO_SUPABASE = Object.freeze({
  url: "https://twltqbmlcswngssfgqyd.supabase.co",
  publishableKey: "sb_publishable_nFujnj_9Y13iFRl0z1Dsaw_g-GwiEj9"
});

// Cliente único del SDK oficial (lazy: se crea recién al usarse, porque
// supabase-js se carga al final de <body>). Persiste la sesión en
// localStorage (copero_auth_token) y renueva los tokens solo.
let clienteSupabaseMemo = null;
if (typeof window !== "undefined" && window) {
  window.getSupabaseClient = function() {
    if (clienteSupabaseMemo) return clienteSupabaseMemo;
    if (typeof supabase === "undefined") {
      throw new Error("Supabase SDK no disponible.");
    }
    clienteSupabaseMemo = supabase.createClient(COPERO_SUPABASE.url, COPERO_SUPABASE.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: "copero_auth_token"
      }
    });
    return clienteSupabaseMemo;
  };
}
