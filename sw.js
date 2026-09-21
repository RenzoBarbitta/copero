// ============================================================
//  SERVICE WORKER - sw.js
//  Cachea el juego para que funcione OFFLINE en el telefono.
//  - Al instalar: precachea el shell del juego (mismo origen).
//  - Bootstrap (CDN) se cachea la primera vez que se usa.
//  Para publicar una version nueva, subir CACHE_NOMBRE (v1->v2).
// ============================================================

const CACHE_NOMBRE = "pso-carrera-v23";

const ARCHIVOS_BASE = [
  "./",
  "./index.html",
  "./privacidad.html",
  "./styles.css",
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

  // Las consultas de datos nunca pasan por la cache del juego.
  if (req.cache === "no-store") return;
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

  // Mismo origen: stale-while-revalidate (rapido y siempre actualizado)
  evento.respondWith(
    caches.match(req).then((cacheado) => {
      const red = fetch(req).then((res) => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(CACHE_NOMBRE).then((cache) => cache.put(req, copia));
        }
        return res;
      }).catch(() => cacheado);
      return cacheado || red;
    })
  );
});