# 📱 Guía: jugar en el teléfono + Ranking Online

Esta versión del juego agrega dos cosas nuevas:

1. **Port para teléfono**: la app es instalable en el celular (PWA), funciona offline y todos los minijuegos se juegan con controles táctiles en pantalla (flechas + botón ESPACIO).
2. **Ranking online global**: al terminar una carrera, el resultado se envía a un ranking compartido entre todos los que jueguen (teléfonos y PCs).

---

## 🎮 Jugar en el teléfono

### Opción recomendada: subir el juego a internet (gratis)

El juego es una página web estática, se sube tal cual la carpeta:

- **Cloudflare Pages** (gratis, dominio `*.pages.dev`), tres formas de subirlo:
  1. **Arrastrar y soltar** (lo más fácil): entrá al dashboard de Cloudflare → *Workers & Pages* → *Create* → pestaña **Pages** → **Upload assets**, poné el nombre del proyecto (ej. `copero`) y arrastrá la carpeta con los archivos del juego.
  2. **Desde GitHub** (deploy automático en cada push): *Workers & Pages* → *Create* → **Pages** → *Connect to Git*, elegí el repo `copero`, dejá **Build command** vacío y en **Build output directory** poné `/`. La configuración ya está lista en `wrangler.toml`.
  3. **Por consola con wrangler**: desde la carpeta del proyecto, `npx wrangler login` y después `npx wrangler pages deploy`.
- **GitHub Pages**: subí los archivos a un repositorio y activá Pages.

> ⚠️ No subas la carpeta con archivos de más: los archivos del juego son `index.html`, `styles.css`, `theme.css`, `fx.css`, `fx-detalle.css`, `app.js`, `data.js`, `features.js`, `touch-controls.js`, `ranking-online.js`, `pwa.js`, `sw.js`, `manifest.webmanifest`, la carpeta `imagenes/`, la carpeta `vendor/` (React) y la carpeta `react/` (capa visual). El resto (`README-MOVIL.md`, tests) no hace falta subirlo. Ver `AGENT.md` para el mapa completo.

### Instalar como app

- **Android (Chrome)**: abrí la URL del juego → aparece el botón **📥 Instalar App** en la pantalla de inicio (o menú ⋮ → "Instalar aplicación").
- **iPhone (Safari)**: abrí la URL → botón **Compartir** (□↑) → **"Agregar a pantalla de inicio"**.

Una vez instalada, la app abre sin barra del navegador y **funciona sin internet** (el ranking online se sincroniza cuando haya conexión).

### Controles táctiles

Cuando se abre un minijuego, aparece un **gamepad en pantalla** en la esquina inferior derecha:

- ⬆️⬅️⬇️➡️ para los minijuegos de flechas (Dominios, Regate, Guantes).
- ⚡ **ESPACIO** para los de acción (Pase, Cabezazo, Pelea).

En la PC no cambia nada: se sigue jugando con el teclado.

---

## 🏆 Ranking online

- El botón **🏆 Ranking** ahora muestra dos pestañas:
  - **🌍 Global (Online)**: las mejores carreras de todos los jugadores (top 100, ordenadas por media OVR).
  - **📱 Este dispositivo**: el ranking local de siempre.
- **Un registro por dispositivo**: tu última carrera terminada reemplaza a la anterior en el global.
- Si terminás una carrera **sin internet**, el puntaje queda en cola y se envía solo al reconectar.
- Los nombres se muestran escapados (no se puede meter HTML/código en el ranking).

### Cómo funciona (con cuenta en Supabase)

El ranking global se guarda en **Supabase** (el mismo servicio de las cuentas) con reglas de seguridad a nivel base de datos (RLS):

- **Publicar requiere iniciar sesión** con tu cuenta (email confirmado): al terminar una carrera con sesión iniciada, tu resultado se publica con tu apodo, posición, club, media, títulos y fecha.
- **Una entrada por cuenta**: tu nueva carrera reemplaza a la anterior en el global.
- **Nadie puede manipular la base**: sin sesión solo se puede *leer*; con sesión solo se puede escribir **tu propia fila**; y no existe borrado por API (la moderación la hace el administrador desde el dashboard).
- **Sin sesión / sin internet**: la carrera queda en cola en el dispositivo y se publica sola cuando iniciés sesión y haya conexión. El juego nunca se rompe: solo se desactiva el aviso de sincronización.
- La tabla solo expone apodo y resultado deportivo. **Nunca** publica el correo ni datos sensibles.

> ⚠️ Limitación conocida: alguien con su propia cuenta puede inflar *su* media (el cliente no es confiable al 100%). Lo que la base garantiza es que **nadie puede tocar las entradas de otros ni publicar de forma anónima**. La validación server-side de puntajes queda como mejora futura.

---

## ✅ Verificación y actualizaciones

- Para probar el ranking online por consola (usa un almacén desechable, NO toca el ranking real): `node test-ranking-online.mjs`
- Si en el futuro modificás archivos del juego, subí `CACHE_NOMBRE` en `sw.js` (ej. `"pso-carrera-v1"` → `"pso-carrera-v2"`) para que los teléfonos descarguen la versión nueva.
