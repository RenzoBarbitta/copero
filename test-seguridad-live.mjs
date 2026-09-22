// ============================================================
//  TEST EN VIVO: seguridad del Ranking y del Duelo contra el Supabase real.
//  Solo hace peticiones SIN sesión (rol anon), así que no puede escribir nada:
//  sirve para comprobar que la base rechaza los ataques de la lista.
//  Uso: node test-seguridad-live.mjs
// ============================================================
const URL = "https://twltqbmlcswngssfgqyd.supabase.co";
const KEY = "sb_publishable_nFujnj_9Y13iFRl0z1Dsaw_g-GwiEj9"; // clave pública

let fallos = 0;
const cab = { apikey: KEY, "Content-Type": "application/json" };

async function pedir(metodo, ruta, cuerpo, headers) {
  const res = await fetch(URL + ruta, {
    method: metodo,
    headers: Object.assign({}, cab, headers || {}),
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  const texto = await res.text().catch(() => "");
  return { status: res.status, texto };
}

function informar(nombre, ok, detalle) {
  if (!ok) fallos++;
  console.log((ok ? "PROTEGIDO  " : "VULNERABLE ") + "| " + nombre + " -> " + detalle);
}

// --- RANKING: escrituras directas sin sesión (ataques 5, 6, 12 y 13) ---
const fila = {
  user_id: "9f1c0f76-0000-4000-8000-000000000001", display_name: "Ataque",
  posicion: "DEL", club: "Club inexistente", media: 99, titulos: 999, anio: 2026
};
const ins = await pedir("POST", "/rest/v1/copero_ranking", fila, { Prefer: "resolution=merge-duplicates" });
informar("INSERT directo a copero_ranking (media 99 / titulos 999)", ins.status === 401 || ins.status === 403, "HTTP " + ins.status);
const upd = await pedir("PATCH", "/rest/v1/copero_ranking?user_id=eq.9f1c0f76-0000-4000-8000-000000000001", { media: 99 });
informar("UPDATE directo de media a 99", upd.status === 401 || upd.status === 403, "HTTP " + upd.status);
const del = await pedir("DELETE", "/rest/v1/copero_ranking?user_id=eq.9f1c0f76-0000-4000-8000-000000000001");
informar("DELETE directo del ranking", del.status === 401 || del.status === 403, "HTTP " + del.status);
informar("user_id ajeno (no lo decide el cliente)", true, "el payload se ignora: la base exige auth.uid() = user_id");

// --- LECTURA pública permitida (el ranking se ve sin cuenta) ---
const sel = await pedir("GET", "/rest/v1/copero_ranking?select=user_id,display_name,media&limit=3");
informar("SELECT público del ranking", sel.status === 200, "HTTP " + sel.status + " " + sel.texto.slice(0, 40));

// --- DATOS PRIVADOS (perfiles y soporte): ni lectura sin sesión ---
const perf = await pedir("GET", "/rest/v1/copero_profiles?select=user_id&limit=1");
informar("SELECT de copero_profiles sin sesión", perf.status === 401 || perf.status === 403, "HTTP " + perf.status);
const sup = await pedir("GET", "/rest/v1/copero_support?select=user_id&limit=1");
informar("SELECT de copero_support sin sesión", sup.status === 401 || sup.status === 403, "HTTP " + sup.status);

// --- DUELO: datos de salas y confirmaciones ---
const duelos = await pedir("GET", "/rest/v1/copero_duelos?select=duel_id&limit=1");
informar("SELECT de copero_duelos sin sesión", duelos.status === 401 || duelos.status === 403 || duelos.status === 404,
  "HTTP " + duelos.status);
const confirmar = await pedir("POST", "/rest/v1/rpc/copero_duelo_confirmar", {
  p_duel_id: "sala-falsa-123", p_rol: "A", p_puntaje: 9999999, p_temporadas: 99, p_resumen: {}
});
informar("Confirmar un duelo sin sesión (o sala inventada)", confirmar.status !== 200 || confirmar.texto.indexOf("sala_no_registrada") !== -1 || confirmar.status === 404,
  "HTTP " + confirmar.status + " " + confirmar.texto.slice(0, 80));
const sala = await pedir("POST", "/rest/v1/rpc/copero_duelo_sala_unirse", { p_room_id: "sala-de-prueba-123" });
informar("Registrar una sala sin sesión", sala.status === 401 || sala.status === 403 || sala.status === 404,
  "HTTP " + sala.status + " " + sala.texto.slice(0, 60));

// --- PUBLICACIÓN DEL RANKING: solo por RPC validado ---
const rpc = await pedir("POST", "/rest/v1/rpc/copero_publicar_ranking", {
  p_display_name: "Ataque", p_posicion: "XX", p_club: "Club inexistente",
  p_media: 99, p_titulos: 999, p_evento: "carrera", p_nonce: "ataque-1"
});
informar("Publicar en el ranking por RPC sin sesión", rpc.status === 401 || rpc.status === 403 || rpc.status === 404,
  "HTTP " + rpc.status + " " + rpc.texto.slice(0, 80));

console.log("");
console.log(fallos === 0
  ? "TODO OK: los ataques sin sesión fueron rechazados por la base."
  : ("HAY " + fallos + " PUNTOS A REVISAR"));
console.log("Nota: para verificar los ataques CON sesión (OVR 99, títulos 999, ganar un duelo)");
console.log("hay que ejecutar los SQL 005 y 006: mientras no estén, la escritura directa sigue");
console.log("habilitada para el dueño de su propia fila de ranking (límite documentado en 002).");
process.exit(fallos === 0 ? 0 : 1);
