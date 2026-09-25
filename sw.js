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
//   - Archivos del mismo origen (JS, CSS): NETWORK-FIRST con
//     respaldo en cache para offline. Como no llevan hash, la unica
//     forma correcta es revalidar contra la red en cada visita.
//   - Imagenes de mismo origen (banderas, logos, escudos): CACHE-FIRST.
//     Son estaticas y casi nunca cambian; la purga la hace el bump de
//     CACHE_NOMBRE. Cero rondas de red en las visitas repetidas.
//  - Bootstrap y Bootstrap Icons (CDN, version fija): CACHE-FIRST.
//
//  CACHE_NOMBRE es solo por higiene: al cambiarlo se purga toda la
//  cache de golpe, pero no es necesario para ver las novedades.
// ============================================================

const CACHE_NOMBRE = "pso-carrera-v52";

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
  "./coop.js",
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
  "./fx.css",
  "./fx-detalle.css",
  "./vendor/react.production.min.js",
  "./vendor/react-dom.production.min.js",
  "./vendor/htm.umd.js",
  "./react/nucleo.js",
  "./react/fx.js",
  "./react/chrome.js",
  "./react/inicio.js",
  "./react/inicio-cancha.js",
  "./react/inicio-modos.js",
  "./react/inicio-apoyo.js",
  "./react/juego-tarjeta.js",
  "./react/vista-carrera.js",
  "./react/vista-carrera2.js",
  "./react/vista-extra.js",
  "./react/vista-progreso.js",
  "./react/resumen.js",
  "./react/modales-1.js",
  "./react/modales-2.js",
  "./react/modales-3.js",
  "./react/modales-4.js",
  "./react/modales-5.js",
  "./react/modales-6.js",
  "./react/modales-7.js",
  "./react/montar.js",
  "./manifest.webmanifest",
  "./imagenes/logo-web.png",
  "./imagenes/logopsoarg-web.png",
  "./imagenes/logopsobr-web.png",
  "./imagenes/icon-192.png",
  "./imagenes/icon-512.png",
  "./imagenes/icon-512-maskable.png",
  "./imagenes/icon-180.png",
  "./imagenes/banner-web.png"
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
      !(url.hostname === "cdn.jsdelivr.net" &&
        (url.pathname.startsWith("/npm/bootstrap@") ||
         url.pathname.startsWith("/npm/bootstrap-icons@")))) return;

  // Solo CDN (Bootstrap + Bootstrap Icons): cache-first
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

  // Imagenes de mismo origen (banderas, logos, escudos): son estaticas y casi
  // nunca cambian entre deploys, asi que cache-first. En las visitas repetidas
  // no se revalidan: cero rondas de red. Si alguna vez cambian, el bump de
  // CACHE_NOMBRE purga la cache vieja y se actualizan solas.
  if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/i.test(url.pathname)) {
    evento.respondWith(
      caches.match(claveCache).then(function (cacheado) {
        if (cacheado) return cacheado;
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            const copia = res.clone();
            caches.open(CACHE_NOMBRE).then(function (cache) { cache.put(claveCache, copia); });
          }
          return res;
        });
      })
    );
    return;
  }

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