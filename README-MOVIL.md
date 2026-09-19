# 📱 Guía: jugar en el teléfono + Ranking Online

Esta versión del juego agrega dos cosas nuevas:

1. **Port para teléfono**: la app es instalable en el celular (PWA), funciona offline y todos los minijuegos se juegan con controles táctiles en pantalla (flechas + botón ESPACIO).
2. **Ranking online global**: al terminar una carrera, el resultado se envía a un ranking compartido entre todos los que jueguen (teléfonos y PCs).

---

## 🎮 Jugar en el teléfono

### Opción recomendada: subir el juego a internet (gratis)

El juego es una página web estática, se sube tal cual la carpeta:

- **Netlify Drop** (lo más fácil, 1 minuto): entrá a <https://app.netlify.com/drop>, arrastrá la carpeta `CoperoActualizado` completa y te da una URL `https://algo.netlify.app`.
- **GitHub Pages**: subí los archivos a un repositorio y activá Pages.

> ⚠️ No subas la carpeta con archivos de más: los archivos del juego son `index.html`, `styles.css`, `app.js`, `data.js`, `features.js`, `touch-controls.js`, `ranking-online.js`, `pwa.js`, `sw.js`, `manifest.webmanifest` y la carpeta `imagenes/`. El resto (`README-MOVIL.md`, `test-ranking-online.mjs`) no hace falta subirlo.

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

### Cómo funciona (sin servidor propio)

El ranking usa un almacenamiento JSON gratuito en la nube (**textdb.dev**), ya configurado y probado. No hace falta crear cuentas ni claves. Limitaciones a saber:

- Es un servicio gratuito y público: cualquiera que conozca la URL del almacén puede leer los datos (y modificarlos con conocimiento técnico). Para un juego entre amigos está perfecto; no guarda nada sensible.
- Si el servicio llegara a caerse, el juego sigue funcionando: solo se desactiva la pestaña online y el ranking local sigue intacto.

### Migrar a Firebase (opcional, más robusto)

Si preferís una base de datos propia y más confiable:

1. Creá un proyecto gratis en <https://firebase.google.com> y dentro una **Realtime Database** (modo de prueba).
2. Abrí `ranking-online.js` y completá:
   ```js
   const RANKING_FIREBASE_URL = "https://TU-PROYECTO-default-rtdb.firebaseio.com/ranking.json";
   ```
3. Listo: el resto del sistema (envío, cola offline, pestañas) funciona igual.

---

## ✅ Verificación y actualizaciones

- Para probar el ranking online por consola (usa un almacén desechable, NO toca el ranking real): `node test-ranking-online.mjs`
- Si en el futuro modificás archivos del juego, subí `CACHE_NOMBRE` en `sw.js` (ej. `"pso-carrera-v1"` → `"pso-carrera-v2"`) para que los teléfonos descarguen la versión nueva.
