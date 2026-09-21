// ============================================================
//  SERVICE WORKER - sw.js
//  Cachea el juego para que funcione OFFLINE en el telefono.
//  - Al instalar: precachea el shell del juego (mismo origen).
//  - Bootstrap (CDN) se cachea la primera vez que se usa.
//
//  Estrategias de cache (clave para que el deploy se vea al toque):
//   - Navegacion (index.html y demas documentos): NETWORK-FIRST.
//     Siempre se pide la version nueva al servidor (que revalida
//     con ETag, sin costo). La cache solo se usa offline. Asi un
//     deploy jamas deja a un usuario con la version vieja.
//   - Archivos del mismo origen (JS, CSS, imagenes): NETWORK-FIRST
//     con respaldo en cache para offline. Como no llevan hash, la
//     unica forma correcta es revalidar contra la red en cada
//     visita; la cache se refresca sola.
//   - Bootstrap (CDN, version fija): CACHE-FIRST.
//
//  CACHE_NOMBRE es solo por higiene: al cambiarlo se purga toda la
//  cache de golpe, pero no es necesario para ver las novedades.
// ============================================================

const CACHE_NOMBRE = "pso-carrera-v36";

const ARCHIVOS_BASE = [
  "./",
  "./index.html",
  "./privacidad.html",
  "./styles.css",
  "./theme.css",
  "./app.js",
  "./data.js",
  "./progression.js",
  "./features.js",
  "./duelo.js",
  "./camiseta.js",
  "./touch-controls.js",
  "./ranking-online.js",
  "./supabase-config.js",
  "./cuenta-api.js",
  "./cuenta-ui.js",
  "./ui.js",
  "./pwa.js",
  "./event-outcomes.js",
  "./minigame-camiseta.js",
  "./minigame-camiseta.css",
  "./manifest.webmanifest",
  "./imagenes/logo.png",
  "./imagenes/logopsoarg.png",
  "./imagenes/logopsobr.png",
  "./imagenes/icon-192.png",
  "./imagenes/icon-512.png",
  "./imagenes/icon-512-maskable.png",
  "./imagenes/icon-180.png"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOMBRE).then((cache) =>
      // allSettled: si un archivo falla, no rompe la instalacion
      Promise.allSettled(ARCHIVOS_BASE.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(
        claves
          .filter((clave) => clave !== CACHE_NOMBRE)
          .map((clave) => caches.delete(clave))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Los datos propios (Supabase: ranking, cuenta, duelo) NUNCA pasan
  // por la cache del juego: se excluye por caché de red y por dominio.
  if (req.cache === "no-store") return;
  const host = url.hostname;
  if (host === "supabase.co" || host.endsWith(".supabase.co") ||
      host === "supabase.co." || host.endsWith(".supabase.co.")) return;
  if (url.origin !== self.location.origin &&
      !(url.hostname === "cdn.jsdelivr.net" && url.pathname.startsWith("/npm/bootstrap@"))) return;

  // Solo Bootstrap: cache-first
  if (url.origin !== self.location.origin) {
    evento.respondWith(
      caches.match(req).then((cacheado) => {
        if (cacheado) return cacheado;
        return fetch(req).then((res) => {
          if (res && (res.ok || res.type === "opaque")) {
            const copia = res.clone();
            caches.open(CACHE_NOMBRE).then((cache) => cache.put(req, copia));
          }
          return res;
        }).catch(() => cacheado);
      })
    );
    return;
  }

  // Mismo origen: network-first con respaldo offline.
  // La red manda para que siempre veas la ultima version publicada:
  // los requests se revalidan contra el servidor (304 barato) y la
  // copia en cache solo se usa sin conexion o si el servidor falla.
  const esNavegacion = req.mode === "navigate";
  // Se guarda la respuesta con una Request normal (evita problemas
  // al almacenar requests de tipo navigate en Cache Storage).
  const claveCache = new Request(url.href);

  evento.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok && res.status === 200) {
        const copia = res.clone();
        caches.open(CACHE_NOMBRE).then((cache) => cache.put(claveCache, copia));
      }
      return res;
    }).catch(() =>
      caches.match(claveCache).then((cacheado) =>
        cacheado || (esNavegacion ? caches.match("./index.html") : undefined)
      )
    )
  );
});