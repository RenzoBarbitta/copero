# AGENT.md — Copero (Carrera PSO)

Guía completa del proyecto para agentes/desarrolladores. **Idioma: español.**
Última gran migración: la capa visual pasó de HTML estático a **React (sin build)**;
la lógica de juego/backend quedó **idéntica**.

---

## 1. Qué es

**COPERO** es un simulador de carrera de futbolista estilo "Carrera de FIFA/FM"
para la comunidad **PSO** (PlayStation Online, Uruguay/Argentina/Brasil).

- PWA **estática** (funciona offline, instalable en celular).
- Carrera por temporadas con atributos, moral, eventos, mercado de fichajes,
  minijuegos con controles táctiles, logros, red social de feed y ranking online.
- Multi-idioma: **es / en / pt** (diccionarios en `data.js` → `TEXTOS_UI`).
- Backend: **Supabase** (cuentas, ranking global con RLS, duelo 1v1 por realtime).
- Deploy: **Cloudflare Pages** con `wrangler.toml` (`pages_build_output_dir = "."`).
  **No hay build**: se publica la carpeta tal cual. `node_modules/` está en
  `.gitignore` y **no debe existir** en el repo (contaminaría el deploy de Pages).

## 2. Arquitectura en dos capas (clave)

```
┌─ CAPA BASE (SIN CAMBIOS) ─────────────────────────────────────┐
│ data.js · progression.js · event-outcomes.js · app.js        │
│ features.js · camiseta.js · minigame-camiseta.js             │
│ touch-controls.js · supabase-config.js · cuenta-api.js       │
│ ranking-online.js · cuenta-ui.js · duelo.js · ui.js · pwa.js  │
│ → lógica de juego + DOM por id (getElementById/innerHTML)     │
└───────────────────────────────────────────────────────────────┘
┌─ CAPA VISUAL (React, nueva) ──────────────────────────────────┐
│ vendor/ (React 18 UMD + ReactDOM + htm)                       │
│ react/*.js → todos los componentes del body                   │
│ fx.css + fx-detalle.css → animaciones y pulido (v4 limpio)     │
│ → renderiza UNA sola vez, espejo exacto del HTML original     │
└───────────────────────────────────────────────────────────────┘
```

### Reglas de oro de la capa React (romperlas rompe el juego)

1. **Render único**: `react/montar.js` monta en `#aplicacion` con
   `ReactDOM.flushSync(...)` ANTES de que carguen los scripts base, para que
   todo `getElementById` de la base encuentre los nodos. Después **no hay
   re-renders** de la estructura (solo `fx.js` tiene estado propio, en
   componentes decorativos aislados: `AmbienteFX`, `BarraScroll`).
2. **Los `id` son sagrados**: los 177 id del HTML original deben existir,
   sin duplicados. `test-react-ui.mjs` lo verifica renderizando el árbol.
3. **Handlers**: `onClick=${() => irA('carrera')}` resuelve la función global
   *al momento del click* (las funciones viven en la base, cargada después).
4. **Estilos**: `className`, `htmlFor`, estilos inline como objetos
   (`style=${{...}}`), SVG en camelCase (`strokeWidth`), booleanos explícitos
   (`required=${true}`, `hidden=${true}`), entradas con `value` → `defaultValue`.
5. **Sin empaquetado**: scripts clásicos (`<script src>`), namespace global
   `window.CR`. No introducir Vite/webpack/babel: el deploy y el service worker
   dependen de archivos planos.

## 3. Cómo ver el proyecto en local

No hay build. Cualquier servidor estático sirve, por ejemplo:

```bash
npx --yes http-server -p 8080        # o:
python -m http.server 8080
# luego abrir http://localhost:8080
```

También se puede abrir `index.html` directo (file://), pero el service worker y
algunas APIs requieren `http://localhost` o HTTPS.

## 4. Mapa de archivos

### Raíz — lógica base (no tocar sin correr los tests)

| Archivo | Rol |
|---|---|
| `data.js` | Datos del juego + `TEXTOS_UI` (i18n es/en/pt) |
| `progression.js` | Progresión por atributos |
| `event-outcomes.js` | Resultados de eventos |
| `app.js` | Núcleo: temporadas, partidos, minijuegos, momentos clave |
| `features.js` | UI features: tema oscuro, i18n (`traducirInterfaz`), selector de minijuegos, slots |
| `camiseta.js` / `minigame-camiseta.js` (+ `.css`) | Casaca: selector dorsal/posición y minijuego |
| `touch-controls.js` | Gamepad táctil para minijuegos |
| `supabase-config.js` / `cuenta-api.js` / `cuenta-ui.js` | Cliente Supabase, API y panel de cuenta |
| `ranking-online.js` | Ranking global (cola offline, cache 5 min, RPC + upsert) |
| `duelo.js` | Duelo 1v1 online (Realtime) |
| `ui.js` | Navegación por secciones (`irA`), tarjeta del jugador, toasts, menú perfil |
| `pwa.js` | Botón instalar + registro del service worker |
| `sw.js` | Service worker: network-first, precache (`CACHE_NOMBRE`) |

### Raíz — resto

| Archivo | Rol |
|---|---|
| `index.html` | Shell: head (fuentes, Bootstrap CDN, CSS) + `#aplicacion` + orden de scripts |
| `styles.css` | Estilos base históricos |
| `theme.css` | Tema oscuro "carrera futbolística" (cargado después de styles) |
| `fx.css` / `fx-detalle.css` | **Capa React de animaciones** (siempre después de theme.css; solo agregan) |
| `privacidad.html` | Política de privacidad (fechada, la exige el registro) |
| `manifest.webmanifest` | PWA (iconos en `imagenes/`) |
| `wrangler.toml`, `_headers` | Cloudflare Pages (sin build) |
| `google7cb43165a7bd622a.html` | Verificación de Search Console |

### `vendor/` — React local (UMD, sin CDN para que funcione offline)

`react.production.min.js` (18.3.1), `react-dom.production.min.js`, `htm.umd.js`
(plantillas tipo JSX sin compiler). Si se actualiza React, re-descargar los UMD.

### `react/` — capa visual (21 módulos, orden de carga definido en index.html)

| Módulo | Contenido (equivalente al HTML original) |
|---|---|
| `nucleo.js` | `htm.bind(React.createElement)` → `window.CR`, helper `al()` |
| `fx.js` | `AmbienteFX` (orbes con parallax al puntero) y `BarraScroll` (progreso) |
| `chrome.js` | `#sidebar`, `#topbar`, `#nav-inferior` + menú de perfil reutilizado |
| `inicio.js` | Panel de cuenta Supabase + encabezado de `#pantalla-inicio` |
| `inicio-cancha.js` | Selector de posición en cancha, dorsal/casaca, botones iniciar/continuar |
| `inicio-modos.js` | Otros modos (Leal, Duelo) + fila de utilidades (Ranking/Slots/idiomas/tema) |
| `inicio-apoyo.js` | Cards de apoyo/donación |
| `juego-tarjeta.js` | Tarjeta del jugador (OVR, moral, atributos) y `#app-ruta` |
| `vista-carrera.js` / `vista-carrera2.js` | Dashboard: próximo partido VS, evento social, resumen, redes |
| `vista-extra.js` | Vistas Entrenamiento y Comunidad (tabs pills) |
| `vista-progreso.js` | Vista Progreso (stats/evolución/temporadas/logros) |
| `resumen.js` | Pantalla de retiro / resumen final |
| `modales-1..7.js` | Footer, toast y los 16 modales en orden original (info, decisión, fichajes, penal, partido interactivo, momentos clave, tiro libre, dominios, SS, rol, ranking, redes, entrenamiento, camiseta, dardos, configuración) + el cuadro de **CALIDAD** que se pregunta al entrar (`OverlayCalidad`) |
| `montar.js` | Compone `Aplicacion` y monta con `flushSync` en `#aplicacion` |

### `supabase/` — backend SQL

Migraciones numeradas (`001-…` … `007-perfiles-rpc.sql`): tablas
`copero_ranking`, `copero_profiles`, `copero_support`, `copero_duelos`,
políticas RLS y RPC `copero_publicar_ranking`. Detalle en `README-SUPABASE.md`.
Los datos de Supabase **nunca** pasan por la caché del SW (excluidos por
dominio y por `cache: no-store`).

### `test-*.mjs` — suite (Node puro, sin dependencias)

```bash
node test-react-ui.mjs        # espejo visual React ↔ HTML
node test-traduccion-pt.mjs   # i18n PT-BR
node test-privacidad.mjs      # registro/privacidad
# …uno por uno con `node test-X.mjs` (no hay runner central)
```

| Test | Cubre |
|---|---|
| `test-react-ui.mjs` | **Espejo visual**: render del árbol React en sandbox → 204 ids, 198 data-i18n, 26 handlers, forms/estados |
| `test-traduccion-pt.mjs` | Claves `data-i18n` (lee `index.html` + `react/*.js`) |
| `test-privacidad.mjs` | Casilla sin marcar, enlaces, precache de la política (lee `index.html` + `react/*.js`) |
| `test-camiseta` | Selector de casaca/dorsal y SVG |
| `test-duelo`, `test-ranking-online`, `test-ranking-dinamico` | Duelo 1v1 y ranking (sandbox con fetch falso) |
| `test-progresion`, `test-declive-veterano`, `test-ofertas`, `test-partidos-random`, `test-logros`, `test-redes-sociales` | Mecánicas puras |
| `test-modo-leal` | **Modo Leal** (`features.js`): el arranque respeta la selección elegida, genera los atributos iniciales (OVR 65/75) y sincroniza la división con el club sorteado |
| `test-sancion-loro` | **Sanción de Loro** (`app.js` + `data.js`): la sanción va contra el jugador, no contra el equipo, así que un sancionado en Primera no puede renovar ahí (solo fichar en Segunda); el Modo Leal no la esquiva y el relleno de ofertas nunca cruza de división |
| `test-selecciones` | Catálogo de 211 selecciones y banderas |
| `test-seguridad-live` | Audita RLS contra Supabase real (requiere red; 1 punto preexistente pendiente: SQL 005/006) |

### Modo Leal (arranque)

`features.js` envuelve a `app.js` (override, no cambio en la base): `iniciarCarrera()`,
`continuarCarrera()`, `generarOfertasDeFichaje()`, `simularTemporada()`,
`finalizarCarrera()`, `actualizarInterfaz()`, `mostrarModalRol()`. El botón 🛡️
(`react/inicio-modos.js` → `iniciarCarreraLeal()`) arma `modoDesafioPendiente` y
delega en `iniciarCarrera()`, que intercepta **antes** de la base.

**Trampa**: el arranque del Modo Leal no puede llamar a `iniciarCarrera()` de la
base (se re-delegaría en sí mismo). Debe replicar su bloque de arranque —
**nacionalidad** (lee `#select-nacionalidad`) y **atributos**
(`generarAtributosIniciales` + `calcularOVR`) — o el jugador nace con
`atributos: null`, `media: 60` y selección `URU` hardcodeada.
`activarModoDesafio()` llama a `sincronizarDivision()` porque el sorteo puede dar
un club de 1ª y `crearJugadorInicial()` deja `division: 2`.

**La lealtad no puede con la sanción de Loro**: `temporadasForzadoSegunda > 0`
limita al **jugador**, no al club, así que el override de
`generarOfertasDeFichaje()` (`features.js`) se saltea solo si no hay sanción *o*
si el club actual ya es de Segunda. Con sanción y club de Primera, el mercado se
abre igual y `app.js` ofrece únicamente clubes de Segunda: renovar en el club de
Primera no existe como opción. Cubierto por `test-sancion-loro.mjs`.

## 5. Animaciones (dónde tocar para pulir la UI)

- `fx.css` (912 líneas, 268 bloques, **reescrito limpio v4 — sin duplicados ni bloques huérfanos**): fondo con más resalte (gradiente base azul/dorado en `.fx-ambiente`, 5 orbes con flotación+rotación+escala y glow pulsante, 4 orbes pequeños decorativos, partículas `fx-ambiente::before` en deriva por tile, líneas de cancha con doble gradiente en dos ejes, viñeta con pulso, **aurora cónica girando** `.fx-aurora`, **barrido diagonal de luz** `.fx-reflejos` y **polvo fino flotando** `.fx-polvo` — estas 3 capas se suman al parallax del puntero en `react/fx.js`), `react/fx.js` renderiza los 5 orbes + orbes pequeños + parallax al puntero, barra de scroll, **intro animada** (`.intro-banner` con `banner copero.png` + emblema `CoperoPsoSa.png`: entrada con overshoot, barrido de brillo, pulso de borde y logo que "pica" — todo apagado en `prefers-reduced-motion`), **textos del menú y cards de apoyo** (títulos con gradiente dorado/azul que se desplaza, emojis de precio flotando, precio que respira con glow, badge "Recomendado" que late, botones con glow pulsante, entrada escalonada de las `.support-cards` y borde luminoso `.support-card::before` que viaja al hover), **cinemática de apertura** (`.cinematica` en `react/fx.js` → `Cinematica`, se autodesmonta a los ~3.35s con `return null` y, si hay cuadro de calidad, espera quieta en `.cinematica-espera` hasta que el jugador elija — arranca con el evento `copero:calidad-elegida` y es idéntica en Alta y en Baja; orbes que estallan, anillo dorado, logo con overshoot + brillo, título COPERO letra por letra con `linear-gradient`-clip, línea de carga dorada y salida en zoom-out hacia la app), entradas de pantalla/vistas/tarjetas escalonadas con overshoot (se re-disparan al quitar `.hidden`), hover lift+glow de tarjetas, navegación (pill activo que crece, ícono pop, respiración del ícono activo en nav inferior), **profundidad**: modales, topbar/sidebar/nav cristal con `backdrop-filter`, tarjeta del jugador/VS/escudos/OVR, chips, inputs hundidos, progreso y tablas, `#aplicacion{display:contents}`.
- `fx-detalle.css` (453 líneas, 156 bloques, **reescrito limpio v4 — sin triplicados; usa solo markup real**): botones con bisel estático + glow/micro-escala al hover y press, CTA `#btn-jugar-partido` con pulso azul, `.vs-badge-vs` sway, hover de VS/tarjeta-jugador, glow del OVR al subir (`.ovr-up`), toasts con rebote, chips con micro-bounce, stagger de filas de tabla (**excluye** `.tabla-historial`), menús `details`, foco latido, scrollbar con glow, **redes sociales** (selectors sobre `#redes-feed-lateral`/`#redes-feed` + `.red-social-post` real; NO existen `.autor-badge`/`.viralidad-badge`): entrada escalonada con overshoot, hover lift+glow, barra superior de color que se enciende, `@autor` con breath, badge de estilo con pop, viralidad (`.small.text-danger`) latiendo al hover, estado vacío flotando, **minijuegos** (IDs reales `#contenedorMinijuegoCamiseta`/`#contenedorDardos`): entrada con overshoot, chips con glow, vidas con glow **sumado** al pulse de la base vía `.mg-wrap .mg-life`, botones táctiles con spring, escena con resplandor, **casaca** (`#camiseta-preview`/`#camiseta-badge`): marco con halo pulsante, flotación del SVG, nombre con `paint-order` stroke (halo claro), inputs `#input-nombre`/`#input-dorsal` con glow al focus, **movimiento reducido** completo.
- **Selector de calidad (Alta / Baja)**: al entrar, `OverlayCalidad` (`react/modales-7.js` → `#overlay-calidad`, `z-index: 6000`, por encima de la cinemática que es 5000) pregunta `CALIDAD?` con dos botones grandes. `features.js` guarda `prefs.calidad` (`"alta"`/`"baja"`) y `prefs.preguntarCalidad` en `pso_prefs_v1` y pone/quitá la clase `<html class="calidad-baja">`; el script inline del `<head>` (`index.html`) la aplica antes del primer pintado cuando el jugador ya pidió no volver a ser preguntado. El control posterior está en el modal de Configuración (`#select-calidad` + `#calidad-preguntar`, enganchados en `ui.js → abrirConfiguracion`). El apagado visual vive en el bloque **MODO CALIDAD BAJA** de `fx-detalle.css` (animaciones/transiciones a 0.01ms, barra de scroll fuera, fondo plano sin orbes/aurora/reflejos/polvo/partículas, sin `backdrop-filter` y sombras mínimas; **la intro de apertura `.cinematica` y todo su marcado `.cine-*` quedan exentas** y se ven idénticas en ambos modos); el lado JS lo corta `react/fx.js` con `calidadBaja()` (frena parallax y progreso de scroll). Reglas: **ninguna animación puede ser necesaria para jugar** (en Baja el juego queda 100% jugable), **toda animación pesada nueva debe apagarse también con `html.calidad-baja`** y **la intro de apertura se ve siempre igual en ambos modos y recién después de elegir la calidad** (`cerrarPreguntaCalidad()` despacha `copero:calidad-elegida` y `Cinematica` sale de `.cinematica-espera`).
- Regla: CSS puro sobre clases existentes; **nunca** escribir valores que la base lea después (p. ej. no animar el `textContent` de `#j-media`).

## 6. PWA / caché

- `sw.js`: navegación y mismo origen **network-first**; Bootstrap CDN
  cache-first; Supabase excluido.
- Al modificar o agregar archivos del juego: **subir `CACHE_NOMBRE`**
  (hoy `pso-carrera-v54`) y agregar archivos nuevos a `ARCHIVOS_BASE`.

## 7. Deploy

```bash
npx wrangler login
npx wrangler pages deploy          # pages_build_output_dir = "."
```
Cloudflare Pages con build vacío (o arrastrando la carpeta). **Sin build =
sin `package.json`**: así debe quedar el repo; `node_modules/` solo si algún
día hace falta y nunca dentro del deploy.

## 8. Convenciones y trampas conocidas

- Correr la suite completa antes de cerrar cambios.
- `ui.js` re-pinta `#app-ruta` con `innerHTML` y `features.js` traduce con
  `textContent` sobre `[data-i18n]`: es esperado; React no re-renderiza.
- `irA(seccion)` alterna `.hidden`/`.activo` desde la base: las animaciones de
  entrada dependen de ese ciclo (no "arreglar" quitando `.hidden`).
- El MutationObserver de `ui.js` sincroniza `body.app-juego` (sidebar/bottom).
- En `react/*` usar caracteres UTF-8 literales (React no decode entidades).
- Si se agrega un `id` estructural al markup React, sumarlo a las listas de
  `test-react-ui.mjs`.
- Flujo de trabajo acordado: verificar en local y **no hacer commit/push**
  sin coordinar (preview local primero).

## 9. Comandos rápidos

```bash
npx --yes http-server -p 8080     # vista local
node test-react-ui.mjs            # espejo visual
npx wrangler pages deploy         # publicar
```

