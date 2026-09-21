// ============================================================
//  MOTOR DE MINIJUEGO EN PRIMERA PERSONA (versión visual nueva)
//  createFirstPersonDodge(container, config)
//
//  Escena en primera persona renderizada con DOM/CSS 3D:
//   - Contenedor con perspective: 900px y transform-style:
//     preserve-3d (identidad visual pedida).
//   - Cada objeto usa transform: translate3d() + scale() y la
//     proyección en pantalla se calcula por frame replicando
//     exactamente la ley de perspectiva de una cámara con
//     distancia focal 900px (d = profundidad mundial):
//         scale = 900 / d   ;   x = centro + worldX * scale
//   - 3 carriles (izquierda, centro, derecha). Los obstáculos
//     nacen a d = -2000 (lejos, cerca del horizonte) y se
//     aproximan hasta la cámara creciendo en escala, con blur
//     atmosférico en la distancia y leve desenfoque por el
//     movimiento al pasar de cerca.
//
//  DOS VARIANTES con identidad propia:
//   - tunnel: túnel de estadio oscuro y rojo, humo, siluetas de
//     barra, cámaras y micrófonos, luz artificial que se
//     enciende cerca del jugador.
//   - rain  : calle de noche bajo lluvia, asfalto mojado con
//     reflejos y charcos, autos con luces, peatones, lluvia
//     procedural (nodos DOM reutilizados).
//
//  El motor NO decide el resultado narrativo: informa el
//  contador de choques a onFinish(choques). Eso lo decide el
//  sistema externo (ver event-outcomes.js).
//
//  ARQUITECTURA
//   - GameController : orquesta el loop rAF, el tiempo y el final.
//   - Camera         : bob, sway lateral, inclinación al cambiar
//                      de carril y shake ante impacto.
//   - PlayerFeet     : pies del jugador en primera persona
//                      (botines SVG), animación de zancada.
//   - ObstacleManager: pool de nodos DOM con SVG detallados,
//                      sombra y brillo; reutiliza y recicla.
//   - CollisionManager: mantiene la lógica de carriles y el
//                      conteo de choques (sin cambios).
//   - Scene          : decorado (paredes, techo, farolas, líneas
//                      de piso) con lineas en perspectiva.
//   - HUD            : chips cinematográficos por variante.
//
//  ASSETS / REEMPLAZO FUTURO
//   El arte se construye como SVG inline (sin dependencias
//   externas). Cada SVG está mapeado en la tabla ASSETS_FP_* :
//   para reemplazar por imágenes webp basta cambiar el valor
//   de la entrada por urls locales (assets/minigames/...).
//
//  API devuelta: { destroy(), getCrashes(), moveToLane() }
//  destroy() limpia listeners, detiene el loop y elimina el DOM.
//  Sin dependencias externas: JS vanilla.
// ============================================================

(function (global) {
  "use strict";

  // ------------------- DEFAULTS -------------------

  var DEFAULTS = {
    duration: 6000,            // duración total en ms
    obstacleInterval: 1200,    // ms entre apariciones de obstáculos
    minObstacleInterval: 380,  // piso del intervalo (dificultad progresiva)
    obstacleSpeed: 1000,       // ms que tarda un obstáculo en llegar
    obstacleIntervalReduction: 0, // reducción del intervalo (0..1)
    reductionEvery: 2,         // cada cuántos obstáculos aplica la reducción
    obstacleSprites: null,     // (compat) urls de imágenes o null
    obstacleShapes: null,      // [{ type, colors }] formas por variante
    background: "#0b0f1a",     // (compat) color/gradiente de ambiente
    showProgressBar: false,    // barra de distancia al finalizar
    rainEffect: false,         // (compat) activa la variante lluvia
    onFinish: null,            // (choques) => void
    startScale: 0.2,           // (compat) escala inicial del obstáculo
    endScale: 1.4,             // (compat) escala final
    impactScale: 1.2,          // (compat) escala de impacto
    shakeDurationMs: 220,      // duración del shake ante choque
    fadeDurationMs: 260,       // duración del fundido al resolver
    swipeThreshold: 28,        // px mínimos para considerar un swipe
    variant: ""                // "tunnel" | "rain" ("" = auto)
  };

  // Carriles (índice lógico) y posición horizontal mundial por carril.
  var LANES_COUNT = 3;
  var WORLD_LANES = [-0.62, 0, 0.62];

  // Geometría de cámara (proyección con perspectiva de 900px).
  var FOCAL = 900;
  var DEPTH_FAR = 2000;        // profundidad inicial (lejos)
  var DEPTH_NEAR = 150;        // profundidad del plano de la cámara
  var GROUND_OFF = 225;        // alto del plano de piso (world px)
  var HORIZON_RATIO = 0.34;

  var DASH_COUNT = 10;
  var DASH_STEP = 170;
  var WALL_COUNT = 3;

  // Tabla de assets: reemplazando el string SVG por una url local
  // (assets/minigames/...) se cambia el arte sin tocar la lógica.
  var ASSET_FEET_LEFT = null;   // assets/minigames/shared/player/feet-left.webp
  var ASSET_FEET_RIGHT = null;  // assets/minigames/shared/player/feet-right.webp
  var ASSET_TUNNEL_BG = null;   // assets/minigames/tunnel/background.webp
  var ASSET_RAIN_BG = null;     // assets/minigames/rain/background.webp

  // ------------------- HELPERS DE DOM -------------------

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  function css(e, props) {
    var k;
    for (k in props) {
      if (Object.prototype.hasOwnProperty.call(props, k)) e.style[k] = props[k];
    }
    return e;
  }

  function nowMs() {
    return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function zeroPad(n) { return (n < 10 ? "0" : "") + n; }

  function mergeDefaults(user, base) {
    var out = {}, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in user) if (Object.prototype.hasOwnProperty.call(user, k)) out[k] = user[k];
    return out;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ------------------- ARTE SVG (INLINE) -------------------
  // Cada builder recibe un sufijo único (uid) para los ids de
  // gradientes, así se pueden clonar sin colisiones de ids.

  var UID = 0;
  function nextUid() { UID++; return "u" + UID; }

  function svgRaw(uid, w, h, inner) {
    return (
      '<svg class="mg-ffp-art" viewBox="0 0 ' + w + " " + h +
      '" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" ' +
      'aria-hidden="true" focusable="false">' + inner + "</svg>"
    );
  }

  function bootArt(side) {
    // Botín de fútbol visto en primera persona (desde lo alto).
    var uid = nextUid();
    var g1 = uid + "a", g2 = uid + "b", g3 = uid + "c";
    var flip = side === "left" ? 1 : -1;
    return svgRaw(uid, 150, 120,
      "<defs>" +
      '<linearGradient id="' + g1 + '" x1="0" y1="0" x2="' + (0.5 - flip * 0.5) + '" y2="1">' +
      '<stop offset="0" stop-color="#3a3f4a"/><stop offset="1" stop-color="#15181f"/>' +
      "</linearGradient>" +
      '<radialGradient id="' + g2 + '" cx="0.5" cy="0.35" r="0.75">' +
      '<stop offset="0" stop-color="#5b6270"/><stop offset="0.55" stop-color="#23262e"/><stop offset="1" stop-color="#0d0f14"/>' +
      "</radialGradient>" +
      '<radialGradient id="' + g3 + '" cx="0.5" cy="0.4" r="0.6">' +
      '<stop offset="0" stop-color="#6f7686" stop-opacity="0.9"/><stop offset="1" stop-color="#39404d" stop-opacity="0"/>' +
      "</radialGradient>" +
      "</defs>" +
      // media/cañón
      '<path d="M78 6 C66 6 60 26 58 54 L92 54 C90 28 86 6 78 6 Z" fill="url(#' + g2 + ')"/>' +
      '<path d="M60 52 L94 52 L96 74 L58 74 Z" fill="#20242c"/>' +
      // botín
      '<path d="M54 74 L96 74 C99 84 100 94 100 102 C100 110 88 112 76 112 C64 112 50 110 50 102 C50 94 52 84 54 74 Z" fill="url(#' + g1 + ')"/>' +
      // lengüeta y pasacordón
      '<path d="M66 40 L84 40 L82 74 L68 74 Z" fill="#11141a"/>' +
      '<path d="M70 78 L80 78 L80 88 L70 88 Z" fill="#0b0d11" stroke="#262b35" stroke-width="1"/>' +
      // taco a rayas del club
      '<path d="M72 92 L78 92 L78 106 L72 106 Z" fill="#c9303f"/>' +
      '<path d="M82 94 L88 94 L88 108 L82 108 Z" fill="#262b36"/>' +
      // veteado / brillos
      '<path d="M58 60 Q70 64 62 70 Q56 66 58 60 Z" fill="url(#' + g3 + ')"/>' +
      // suela trasera con tacos
      '<rect x="58" y="110" width="34" height="6" rx="3" fill="#07080b"/>' +
      '<circle cx="64" cy="114" r="2" fill="#2b303a"/><circle cx="72" cy="114" r="2" fill="#2b303a"/>' +
      '<circle cx="80" cy="114" r="2" fill="#2b303a"/><circle cx="88" cy="114" r="2" fill="#2b303a"/>'
    );
  }

  function tunnelFanArt(colors) {
    // Silueta de barra brava con la mano en alto y pañuelo.
    var uid = nextUid();
    var g1 = uid + "a", g3 = uid + "c";
    var skin = colors[0] || "#d8b48a";
    var jersey = colors[1] || "#7a1f2b";
    var buf = colors[2] || "#c9303f";
    return svgRaw(uid, 120, 252,
      "<defs>" +
      '<linearGradient id="' + g1 + '" x1="0" y1="0" x2="0.38" y2="1">' +
      '<stop offset="0" stop-color="' + jersey + '"/><stop offset="0.62" stop-color="#451421"/><stop offset="1" stop-color="#14060b"/>' +
      "</linearGradient>" +
      '<linearGradient id="' + g3 + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#10131a"/><stop offset="0.5" stop-color="#1c2028"/><stop offset="1" stop-color="#10131a"/>' +
      "</linearGradient>" +
      "</defs>" +
      // piernas
      '<rect x="42" y="178" width="14" height="52" fill="#16181f"/>' +
      '<rect x="64" y="178" width="14" height="52" fill="#16181f"/>' +
      '<rect x="40" y="222" width="18" height="20" rx="5" fill="#0c0d12"/>' +
      '<rect x="62" y="222" width="18" height="20" rx="5" fill="#0c0d12"/>' +
      // torso (campera)
      '<path d="M34 84 L86 84 L90 178 L30 178 Z" fill="url(#' + g1 + ')"/>' +
      '<path d="M54 84 L66 84 L66 178 L54 178 Z" fill="rgba(0,0,0,0.18)"/>' +
      // brazos arriba (barra)
      '<rect x="16" y="36" width="16" height="40" rx="7" fill="url(#' + g3 + ')"/>' +
      '<rect x="88" y="36" width="16" height="40" rx="7" fill="url(#' + g3 + ')"/>' +
      '<circle cx="24" cy="30" r="9" fill="' + skin + '"/>' +
      '<circle cx="96" cy="30" r="9" fill="' + skin + '"/>' +
      // pañuelo / bufanda
      '<path d="M40 108 q20 8 40 0 l4 26 q-24 10 -48 0 Z" fill="' + buf + '"/>' +
      '<rect x="66" y="122" width="14" height="56" rx="4" fill="' + buf + '"/>' +
      // cabeza con capucha
      '<circle cx="60" cy="52" r="22" fill="' + skin + '"/>' +
      '<path d="M30 52 A30 18 0 0 1 90 52 L84 62 Q60 44 36 62 Z" fill="#171a21"/>' +
      '<path d="M44 50 q16 22 32 0 q-8 12 -16 12 q-8 0 -16 -12 Z" fill="#0b0d11"/>' +
      // grito / boca
      '<ellipse cx="60" cy="62" rx="6" ry="5" fill="#3a0d12"/>'
    );
  }

  function tunnelCamArt(colors) {
    // Cámara de TV sobre trípode con luz roja de grabación.
    var uid = nextUid();
    var g1 = uid + "a", g2 = uid + "b";
    var body = colors[0] || "#23272e";
    var lens = colors[1] || "#5a86bd";
    return svgRaw(uid, 140, 212,
      "<defs>" +
      '<radialGradient id="' + g1 + '" cx="0.55" cy="0.4" r="0.7">' +
      '<stop offset="0" stop-color="#e8f2ff"/><stop offset="0.42" stop-color="' + lens + '"/><stop offset="1" stop-color="#0a0d13"/>' +
      "</radialGradient>" +
      '<linearGradient id="' + g2 + '" x1="0" y1="0" x2="0.35" y2="1">' +
      '<stop offset="0" stop-color="' + body + '"/><stop offset="1" stop-color="#0d1017"/>' +
      "</linearGradient>" +
      "</defs>" +
      // trípode
      '<line x1="70" y1="140" x2="38" y2="206" stroke="#23272e" stroke-width="7" stroke-linecap="round"/>' +
      '<line x1="70" y1="140" x2="102" y2="206" stroke="#23272e" stroke-width="7" stroke-linecap="round"/>' +
      '<line x1="70" y1="140" x2="70" y2="206" stroke="#23272e" stroke-width="6" stroke-linecap="round"/>' +
      // cabeza
      '<rect x="34" y="96" width="72" height="44" rx="8" fill="url(#' + g2 + ')"/>' +
      // lente
      '<rect x="40" y="104" width="60" height="28" rx="14" fill="#13161d"/>' +
      '<circle cx="70" cy="118" r="17" fill="url(#' + g1 + ')"/>' +
      '<circle cx="70" cy="118" r="7" fill="#05070b"/>' +
      // grabación (RED)
      '<circle cx="94" cy="102" r="4" fill="#e23a2e"/>' +
      '<circle cx="60" cy="102" r="3" fill="#0a0c10"/>' +
      // vincha superior
      '<rect x="44" y="92" width="52" height="8" rx="4" fill="#14171e"/>'
    );
  }

  function tunnelMicArt(colors) {
    // Micrófono y bastón a la salida del túnel.
    var uid = nextUid();
    var g1 = uid + "a", g2 = uid + "b";
    var dark = "#10131a";
    var head = colors[1] || "#e8e8ec";
    return svgRaw(uid, 120, 224,
      "<defs>" +
      '<linearGradient id="' + g1 + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#161920"/><stop offset="0.5" stop-color="#2a2f3a"/><stop offset="1" stop-color="#161920"/>' +
      "</linearGradient>" +
      '<radialGradient id="' + g2 + '" cx="0.5" cy="0.35" r="0.8">' +
      '<stop offset="0" stop-color="#f4f6fa"/><stop offset="0.7" stop-color="' + head + '"/><stop offset="1" stop-color="#9aa1ae"/>' +
      "</radialGradient>" +
      "</defs>" +
      // base con pies
      '<rect x="34" y="196" width="52" height="12" rx="6" fill="' + dark + '"/>' +
      '<rect x="22" y="208" width="14" height="8" rx="3" fill="#0b0d12"/>' +
      '<rect x="84" y="208" width="14" height="8" rx="3" fill="#0b0d12"/>' +
      // bastón
      '<rect x="57" y="86" width="6" height="112" fill="url(#' + g1 + ')"/>' +
      '<circle cx="60" cy="202" r="7" fill="#0b0d12"/>' +
      // micrófono redondo
      '<circle cx="60" cy="64" r="26" fill="url(#' + g2 + ')"/>' +
      '<circle cx="60" cy="64" r="18" fill="none" stroke="#6d7481" stroke-width="1.5" opacity="0.5"/>' +
      '<path d="M42 50 q8 8 4 16 q-6 2 -10 -6 Z" fill="rgba(255,255,255,0.55)"/>'
    );
  }

  function rainCarArt(colors, kind) {
    // Auto de frente con luces encendidas (lluvia).
    var uid = nextUid();
    var g1 = uid + "a", g2 = uid + "b", g3 = uid + "c", g4 = uid + "d";
    var body = colors[0] || "#b9533f";
    var glass = colors[1] || "#e8c05a";
    var isVan = kind === "van";
    var w = isVan ? 240 : 220;
    var h = isVan ? 130 : 118;
    return svgRaw(uid, w, h,
      "<defs>" +
      '<linearGradient id="' + g1 + '" x1="0" y1="0" x2="0.3" y2="1">' +
      '<stop offset="0" stop-color="' + body + '"/><stop offset="1" stop-color="#0d1118"/>' +
      "</linearGradient>" +
      '<radialGradient id="' + g2 + '" cx="0.5" cy="0.5" r="0.5">' +
      '<stop offset="0" stop-color="#fff8cf"/><stop offset="0.45" stop-color="#ffd976"/><stop offset="1" stop-color="rgba(255,217,118,0)"/>' +
      "</radialGradient>" +
      '<linearGradient id="' + g3 + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#dce8f2"/><stop offset="1" stop-color="#23304a"/>' +
      "</linearGradient>" +
      '<radialGradient id="' + g4 + '" cx="0.5" cy="0.5" r="0.6">' +
      '<stop offset="0" stop-color="#aab7cc"/><stop offset="1" stop-color="#141b28"/>' +
      "</radialGradient>" +
      "</defs>" +
      // halos de luz (faros)
      '<ellipse cx="60" cy="60" rx="46" ry="34" fill="url(#' + g2 + ')" opacity="0.9"/>' +
      '<ellipse cx="' + (w - 60) + '" cy="60" rx="46" ry="34" fill="url(#' + g2 + ')" opacity="0.9"/>' +
      // carrocería
      '<path d="M30 ' + (h - 26) +
      ' Q14 ' + (h - 30) + ' 14 ' + (h - 46) +
      ' L14 26 Q14 8 34 8 L' + (w - 34) + ' 8 Q' + (w - 14) + ' 8 ' + (w - 14) + ' 26 L' + (w - 14) + ' ' + (h - 46) +
      ' Q' + (w - 14) + ' ' + (h - 30) + ' ' + (w - 30) + ' ' + (h - 26) +
      ' Z" fill="url(#' + g1 + ')"/>' +
      // parabrisas / luneta o cintura oscura
      (isVan
        ? '<rect x="34" y="22" width="' + (w - 68) + '" height="' + (h - 88) + '" rx="6" fill="url(#' + g3 + ')"/>'
        : '<path d="M44 10 Q60 -6 78 6 L96 28 L34 28 Z" fill="url(#' + g3 + ')"/>') +
      // faros
      '<rect x="34" y="' + (h - 38) + '" width="22" height="10" rx="3" fill="url(#' + g4 + ')"/>' +
      '<rect x="' + (w - 56) + '" y="' + (h - 38) + '" width="22" height="10" rx="3" fill="url(#' + g4 + ')"/>' +
      // parrilla / detalle
      '<rect x="' + (w / 2 - 34) + '" y="' + (h - 20) + '" width="68" height="8" rx="4" fill="#0a0c11"/>' +
      // patente
      '<rect x="' + (w / 2 - 26) + '" y="' + (h - 12) + '" width="52" height="8" rx="2" fill="#f0efe6"/>' +
      // techo brillo
      '<rect x="52" y="4" width="34" height="6" rx="3" fill="rgba(255,255,255,0.18)"/>'
    );
  }

  function rainPedestrianArt(colors) {
    // Peatón que cruza bajo lluvia con paraguas.
    var uid = nextUid();
    var g1 = uid + "a", g2 = uid + "b";
    var coat = colors[0] || "#3b3f46";
    var skin = colors[1] || "#d8b48a";
    var para = colors[2] || "#2f5d8a";
    return svgRaw(uid, 120, 240,
      "<defs>" +
      '<linearGradient id="' + g1 + '" x1="0" y1="0" x2="0.35" y2="1">' +
      '<stop offset="0" stop-color="' + coat + '"/><stop offset="1" stop-color="#10141c"/>' +
      "</linearGradient>" +
      '<radialGradient id="' + g2 + '" cx="0.5" cy="0.35" r="0.7">' +
      '<stop offset="0" stop-color="' + para + '"/><stop offset="1" stop-color="#15263a"/>' +
      "</radialGradient>" +
      "</defs>" +
      // piernas con botas
      '<rect x="44" y="176" width="12" height="40" fill="#1d222c"/>' +
      '<rect x="64" y="176" width="12" height="40" fill="#1d222c"/>' +
      '<rect x="42" y="212" width="16" height="14" rx="5" fill="#0e1117"/>' +
      '<rect x="62" y="212" width="16" height="14" rx="5" fill="#0e1117"/>' +
      // piloto / gabardina
      '<path d="M32 96 L88 96 L94 178 L26 178 Z" fill="url(#' + g1 + ')"/>' +
      '<rect x="46" y="96" width="28" height="60" rx="4" fill="rgba(0,0,0,0.18)"/>' +
      // capucha con cara
      '<circle cx="60" cy="66" r="20" fill="' + skin + '"/>' +
      '<path d="M32 62 A28 16 0 0 1 88 62 L82 74 Q60 54 38 74 Z" fill="#1a1f29"/>' +
      // paraguas
      '<path d="M14 44 A46 20 0 0 1 106 44 L104 50 Q60 36 16 50 Z" fill="url(#' + g2 + ')"/>' +
      '<path d="M14 44 L60 60 L106 44" stroke="#0e1420" stroke-width="2" fill="none"/>' +
      '<rect x="58" y="44" width="5" height="46" fill="#2a3140"/>' +
      // gotitas
      '<path d="M22 60 l2 6 M98 62 l2 6 M8 70 l2 6" stroke="#bfd4e8" stroke-width="2" stroke-linecap="round" opacity="0.6"/>'
    );
  }

  function rainPuddleArt() {
    // Charco con reflejo en el asfalto.
    var uid = nextUid();
    var g1 = uid + "a", g2 = uid + "b";
    return svgRaw(uid, 200, 74,
      "<defs>" +
      '<radialGradient id="' + g1 + '" cx="0.5" cy="0.5" r="0.6">' +
      '<stop offset="0" stop-color="#9fc3e0"/><stop offset="0.7" stop-color="#33506e"/><stop offset="1" stop-color="rgba(30,48,70,0)"/>' +
      "</radialGradient>" +
      '<linearGradient id="' + g2 + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="rgba(255,255,255,0.5)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/>' +
      "</linearGradient>" +
      "</defs>" +
      '<ellipse cx="100" cy="37" rx="92" ry="30" fill="url(#' + g1 + ')"/>' +
      '<path d="M40 30 Q80 22 120 26 Q150 28 172 22" stroke="url(#' + g2 + ')" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="64" cy="42" r="2" fill="rgba(255,255,255,0.7)"/><circle cx="150" cy="48" r="1.6" fill="rgba(255,255,255,0.5)"/>' +
      '<circle cx="116" cy="20" r="1.4" fill="rgba(255,255,255,0.4)"/>'
    );
  }

  // Mapa de builders según el tipo de obstáculo.
  function buildObstacleArt(kind, colors) {
    switch (kind) {
      case "cam": return tunnelCamArt(colors);
      case "mic": return tunnelMicArt(colors);
      case "car": case "van": return rainCarArt(colors, kind);
      case "pedestrian": return rainPedestrianArt(colors);
      case "puddle": return rainPuddleArt();
      default: return tunnelFanArt(colors);
    }
  }

  // ------------------- FÁBRICA PRINCIPAL -------------------

  function createFirstPersonDodge(container, config) {
    if (!container) throw new Error("createFirstPersonDodge necesita un contenedor (DOM element).");
    var cfg = mergeDefaults(config || {}, DEFAULTS);

    // Variante visual (con retrocompatibilidad con la demo).
    var variant = cfg.variant || (cfg.rainEffect ? "rain" : "tunnel") || "tunnel";
    var isRain = variant === "rain";

    // ------------------- ESTADO DE JUEGO -------------------
    var playerLane = 1;
    var obstacles = [];
    var crashes = 0;
    var running = false;
    var destroyed = false;
    var rafId = null;
    var lastTime = 0;
    var startTime = 0;
    var elapsed = 0;
    var shakeUntil = 0;
    var spawnedCount = 0;
    var currentInterval = Math.max(cfg.obstacleInterval || 0, cfg.minObstacleInterval || 0);
    var nextSpawnAt = 0;
    var laneChangedAt = 0;
    var laneChangeDir = 0;
    var touchStart = null;
    var finishCalled = false;
    var ending = false;
    var endingT = 0;
    var endTimer = null;
    var dashOffset = 0;
    var W = 1, H = 1, horizonY = 1;

    // ------------------- DOM GENERAL -------------------
    var wrap = el("div", "mg-ffp-wrap");
    wrap.setAttribute("data-variant", variant);

    var scene = el("div", "mg-ffp-scene");
    if (cfg.background) scene.style.background = String(cfg.background);

    // Cámara 3D (perspective + preserve-3d).
    var persp = el("div", "mg-ffp-persp");
    var world = el("div", "mg-ffp-world");
    persp.appendChild(world);
    scene.appendChild(persp);

    wrap.appendChild(scene);
    container.appendChild(wrap);

    // Fondo de cielo/ambiente (estático, detrás de todo).
    var baseLayer = el("div", "mg-ffp-base");
    scene.appendChild(baseLayer);

    // Capa de blur atmosférico antes de obstáculos (suaviza el fondo).
    var hazeLayer = el("div", "mg-ffp-haze");
    scene.appendChild(hazeLayer);

    // ------------------- DECORADO PROYECTADO (piso, paredes, techo) -------------------
    var decor = el("div", "mg-ffp-decor");
    world.appendChild(decor);

    var dashEls = [];
    var i;
    for (i = 0; i < DASH_COUNT; i++) {
      var dash = el("div", "mg-ffp-dash" + (i % 3 === 1 ? " center" : ""));
      decor.appendChild(dash);
      dashEls.push(dash);
    }

    var wallEls = [];
    var wallHtml = null;
    for (i = 0; i < WALL_COUNT; i++) {
      if (wallHtml === null) wallHtml = wallArt();
      var wl = el("div", "mg-ffp-wall");
      var wr = el("div", "mg-ffp-wall");
      wl.innerHTML = wallHtml;
      wr.innerHTML = wallHtml;
      decor.appendChild(wl);
      decor.appendChild(wr);
      wallEls.push([wl, wr]);
    }

    var lampEls = [];
    for (i = 0; i < 4; i++) {
      var lamp = el("div", "mg-ffp-lamp" + (isRain ? " rain" : ""));
      lamp.innerHTML = lampArt();
      decor.appendChild(lamp);
      lampEls.push(lamp);
    }

    // ------------------- CAPAS DE ATMÓSFERA (humo / niebla / lluvia) -------------------
    var fog = el("div", "mg-ffp-fog");
    for (i = 0; i < 3; i++) fog.appendChild(el("div", "mg-ffp-fogblob"));
    scene.appendChild(fog);

    var rain = el("div", "mg-ffp-rain");
    var raindrops = [];
    if (isRain) {
      for (i = 0; i < 44; i++) {
        var drop = el("div", "mg-ffp-drop");
        rain.appendChild(drop);
        raindrops.push({ e: drop, x: 0, y: 0, len: 0, dy: 0, dx: 0, blur: 0, op: 0, init: false });
      }
      scene.appendChild(rain);
    }

    // ------------------- VINYETA Y FLASH DE IMPACTO -------------------
    var vignette = el("div", "mg-ffp-vignette");
    scene.appendChild(vignette);

    var flash = el("div", "mg-ffp-flash");
    scene.appendChild(flash);

    // ------------------- HUD -------------------
    var hud = el("div", "mg-ffp-hud");

    var hudLabel = el("div", "mg-ffp-label");
    hudLabel.textContent = isRain ? "CAMINO AL VESTUARIO" : "ROCE CON LA BARRA";
    hud.appendChild(hudLabel);

    var hudTime = el("div", "mg-ffp-chip");
    hudTime.innerHTML = isRain
      ? '<span class="mg-ffp-chip-cap">T</span><span class="mg-ffp-chip-val" id="mg-ffp-time-val-rain">0:00</span>'
      : '<span class="mg-ffp-chip-cap">TIEMPO</span><span class="mg-ffp-chip-val" id="mg-ffp-time-val">0.0s</span>';
    hud.appendChild(hudTime);

    var hudSpeed = el("div", "mg-ffp-chip");
    hudSpeed.innerHTML = isRain
      ? '<span class="mg-ffp-chip-cap">VEL</span><span class="mg-ffp-chip-val" id="mg-ffp-speed-val">0</span><span class="mg-ffp-chip-unit">km/h</span>'
      : '<span class="mg-ffp-chip-cap">SALIDA</span><span class="mg-ffp-chip-val">' + Math.ceil(cfg.duration / 1000) + 's</span>';
    hud.appendChild(hudSpeed);

    var hudCrash = el("div", "mg-ffp-chip");
    hudCrash.innerHTML = '<span class="mg-ffp-chip-cap">EMPUJONES</span><span class="mg-ffp-chip-val" id="mg-ffp-crash-val">0</span>';
    hud.appendChild(hudCrash);

    var hudProgress = el("div", "mg-ffp-progress");
    var hudProgressFill = el("div", "mg-ffp-progress-fill");
    hudProgress.appendChild(hudProgressFill);
    if (cfg.showProgressBar) hud.appendChild(hudProgress);
    scene.appendChild(hud);

    // Indicador fino de carril (abajo, discreto).
    var lanesHud = el("div", "mg-ffp-lanes");
    for (i = 0; i < LANES_COUNT; i++) lanesHud.appendChild(el("span", "mg-ffp-lane"));
    scene.appendChild(lanesHud);

    // ------------------- PIES DEL JUGADOR -------------------
    var feet = el("div", "mg-ffp-feet");
    feet.innerHTML =
      '<div class="mg-ffp-foot-shadow"></div>' +
      '<div class="mg-ffp-foot left">' + (ASSET_FEET_LEFT
        ? '<img src="' + esc(ASSET_FEET_LEFT) + '" alt="" draggable="false">'
        : bootArt("left")) + "</div>" +
      '<div class="mg-ffp-foot right">' + (ASSET_FEET_RIGHT
        ? '<img src="' + esc(ASSET_FEET_RIGHT) + '" alt="" draggable="false">'
        : bootArt("right")) + "</div>";
    scene.appendChild(feet);

    // ------------------- CONTROLES (botones táctiles) -------------------
    var controls = el("div", "mg-ffp-controls");
    function makeLaneBtn(side, dir) {
      var b = el("button", "mg-ffp-btn " + side);
      b.type = "button";
      b.setAttribute("aria-label", dir > 0 ? "Siguiente carril" : "Carril anterior");
      b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="' +
        (dir > 0 ? "M9 5 l7 7 -7 7" : "M15 5 l-7 7 7 7") +
        '" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      b.addEventListener("click", function () { moveToLane(playerLane + dir); });
      return b;
    }
    controls.appendChild(makeLaneBtn("left", -1));
    controls.appendChild(makeLaneBtn("right", 1));
    scene.appendChild(controls);

    // Overlay de fin (elegante, con identidad de la variante).
    var endOverlay = el("div", "mg-ffp-end");
    endOverlay.innerHTML =
      '<div class="mg-ffp-end-inner">' +
      '<div class="mg-ffp-end-title" id="mg-ffp-end-title"></div>' +
      '<div class="mg-ffp-end-sub" id="mg-ffp-end-sub"></div>' +
      "</div>";
    scene.appendChild(endOverlay);

    // ------------------- ARTE DE DECORADO -------------------
    function wallArt() {
      // Papel de pared del túnel / muro de calle.
      return (
        '<div class="mg-ffp-wall-surface">' +
        '<div class="mg-ffp-wall-light"></div>' +
        '<div class="mg-ffp-wall-crowd"></div>' +
        "</div>"
      );
    }
    function lampArt() {
      return '<div class="mg-ffp-lamp-glow"></div><div class="mg-ffp-lamp-bulb"></div>';
    }

    // ------------------- PROYECCIÓN -------------------
    // Replica la proyección de una cámara con focal 900px: dado un
    // punto mundial (profundidad positiva hacia el frente, worldX en
    // -1..1, worldY en px arriba del piso) se obtiene su posición en
    // pantalla y el factor de escala.
    function place(node, depth, worldX, worldY, sizeK) {
      var s = FOCAL / depth;
      var x = W / 2 + worldX * (W * 0.5) * s;
      var y = horizonY + worldY * s;
      var k = s * sizeK;
      node.style.transform =
        "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) " +
        "translate(-50%,-100%) scale(" + k.toFixed(3) + ")";
    }

    // ------------------- RESIZE -------------------
    function resize() {
      var rect = scene.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      W = Math.max(80, Math.round(rect.width));
      H = Math.max(120, Math.round(rect.height));
      horizonY = Math.round(H * HORIZON_RATIO);
      baseLayer.style.height = (H - horizonY) + "px";
      baseLayer.style.top = horizonY + "px";
      var fogW = W * 0.5;
      var blobs = fog.querySelectorAll(".mg-ffp-fogblob");
      for (var b = 0; b < blobs.length; b++) blobs[b].style.width = fogW + "px";
    }
    var observer = (typeof ResizeObserver !== "undefined") ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(scene);
    else global.addEventListener("resize", resize);
    resize();

    // ------------------- LÓGICA DEL JUGADOR -------------------
    function moveToLane(index) {
      index = clamp(index, 0, LANES_COUNT - 1);
      var prev = playerLane;
      playerLane = index;
      if (index !== prev) {
        laneChangedAt = nowMs();
        laneChangeDir = index > prev ? 1 : -1;
      }
    }
    function clampPlayer() { moveToLane(playerLane); }

    // ------------------- ENTRADA -------------------
    function onKeyDown(e) {
      if (destroyed || !running) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault(); moveToLane(playerLane - 1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault(); moveToLane(playerLane + 1);
      }
    }
    function onTouchStart(e) {
      if (destroyed || !running) return;
      var t = e.touches && e.touches[0];
      if (!t) return;
      touchStart = { x: t.clientX, y: t.clientY };
    }
    function onTouchEnd(e) {
      if (destroyed || !running || !touchStart) return;
      var t = e.changedTouches && e.changedTouches[0];
      if (t) {
        var dx = t.clientX - touchStart.x;
        if (Math.abs(dx) > cfg.swipeThreshold) {
          moveToLane(playerLane + (dx > 0 ? 1 : -1));
        }
      }
      touchStart = null;
    }
    scene.addEventListener("touchstart", onTouchStart, { passive: true });
    scene.addEventListener("touchend", onTouchEnd, { passive: true });
    global.addEventListener("keydown", onKeyDown);

    // ------------------- OBSTÁCULOS: SPAWN Y LÓGICA -------------------
    function pickFreeLane() {
      var bloqueados = {};
      obstacles.forEach(function (o) {
        if (o.state === "active" && progressOf(o) > 0.6) bloqueados[o.lane] = true;
      });
      var libres = [];
      for (var i2 = 0; i2 < LANES_COUNT; i2++) if (!bloqueados[i2]) libres.push(i2);
      if (libres.length === 0) return Math.floor(Math.random() * LANES_COUNT);
      return libres[Math.floor(Math.random() * libres.length)];
    }

    function pickShape() {
      if (!cfg.obstacleShapes || !cfg.obstacleShapes.length) {
        return { type: "person", colors: ["#d8b48a", isRain ? "#3b3f46" : "#7a1f2b"] };
      }
      return cfg.obstacleShapes[Math.floor(Math.random() * cfg.obstacleShapes.length)];
    }

    function spawnObstacle() {
      spawnedCount++;
      var shape = pickShape();
      var kind = shape.type;
      if (kind === "person" && isRain) kind = "pedestrian";
      var art = buildObstacleArt(kind, shape.colors);

      var node = el("div", "mg-ffp-obs " + kind);
      node.innerHTML =
        '<div class="mg-ffp-obs-glow"></div>' +
        '<div class="mg-ffp-obs-art">' + art + "</div>" +
        '<div class="mg-ffp-obs-shade"></div>';

      world.appendChild(node);
      obstacles.push({
        lane: pickFreeLane(),
        born: nowMs(),
        life: Math.max(120, cfg.obstacleSpeed),
        kind: kind,
        shape: shape,
        state: "active",
        fadeT: 0,
        slideDir: 0,
        lastT: 0,
        node: node,
        glow: node.querySelector(".mg-ffp-obs-glow"),
        art: node.querySelector(".mg-ffp-obs-art"),
        shade: node.querySelector(".mg-ffp-obs-shade")
      });

      if (cfg.obstacleIntervalReduction > 0 &&
          cfg.reductionEvery > 0 &&
          spawnedCount % cfg.reductionEvery === 0) {
        currentInterval = Math.max(cfg.minObstacleInterval, currentInterval * (1 - cfg.obstacleIntervalReduction));
      }
      nextSpawnAt = nowMs() + currentInterval;
    }

    function progressOf(o) {
      return Math.min(1, Math.max(0, (nowMs() - o.born) / o.life));
    }

    function updateObstacles(t) {
      var impactProgress = (cfg.impactScale - cfg.startScale) / (cfg.endScale - cfg.startScale);
      for (var i = obstacles.length - 1; i >= 0; i--) {
        var o = obstacles[i];
        var p = progressOf(o);
        if (o.state === "active") {
          if (p >= impactProgress && o.lane === playerLane) {
            o.state = "crash";
            o.fadeT = 0;
            crashes++;
            shakeUntil = t + cfg.shakeDurationMs;
            o.node.classList.add("bang");
          } else if (p >= 1) {
            o.state = "dodge";
            o.fadeT = 0;
            o.slideDir = o.lane < playerLane ? -1 : (o.lane > playerLane ? 1 : (Math.random() < 0.5 ? -1 : 1));
            o.node.classList.add("passed");
          }
        } else {
          o.fadeT += (o.lastT > 0 ? t - o.lastT : 0);
        }
        o.lastT = t;
        if (o.state !== "active" && o.fadeT >= cfg.fadeDurationMs) {
          if (o.node && o.node.parentNode) o.node.parentNode.removeChild(o.node);
          obstacles.splice(i, 1);
        }
      }
    }

    // ------------------- VISUAL DE OBSTÁCULOS -------------------
    function kindScale(kind) {
      switch (kind) {
        case "cam": return 1.05;
        case "mic": return 1.02;
        case "car": case "van": return 1.18;
        case "puddle": return 1.35;
        case "pedestrian": return 1.0;
        default: return 1.0;
      }
    }

    function renderObstacles(now) {
      for (var i = 0; i < obstacles.length; i++) {
        var o = obstacles[i];
        var p = progressOf(o);
        var depth = lerp(DEPTH_FAR, DEPTH_NEAR, p);
        var k = kindScale(o.kind);

        if (o.state === "active") {
          var sway = Math.sin(now * 0.002 + o.born) * 0.9;
          place(o.node, depth, WORLD_LANES[o.lane] + sway * 0.008, GROUND_OFF, k);

          // Profundidad de campo sutil: leve blur lejano + leve en cercanías.
          var f = 0;
          if (depth > 1200) f = (depth - 1200) / (DEPTH_FAR - 1200) * 1.1;
          else if (depth < 300) f = (300 - depth) / 300 * 0.9;
          var dim = depth > 1300 ? 1 - (depth - 1300) / 700 * 0.22 : 1;
          o.art.style.filter = (f > 0.02 ? "blur(" + f.toFixed(2) + "px)" : "none") +
            (dim < 1 ? " brightness(" + dim.toFixed(2) + ")" : "");

          // Luz cercana: el objeto se "enciende" al acercarse.
          var prox = 1 - clamp((depth - 260) / 1200, 0, 1);
          o.glow.style.opacity = (prox * 0.85).toFixed(2);
          o.shade.style.opacity = clamp(0.34 + (1 - p) * 0.3, 0.2, 0.6).toFixed(2);
        } else {
          // Esquive o crash: fundido, desliza a un costado y retrocede.
          var oo = Math.max(0, 1 - o.fadeT / cfg.fadeDurationMs);
          oo = oo * oo;
          var dd = Math.max(80, depth + (1 - oo) * 60);
          var ss = FOCAL / dd;
          var slide = o.slideDir * (1 - oo) * W * 0.22;
          var xx = W / 2 + WORLD_LANES[o.lane] * W * 0.5 * ss + slide;
          var yy = horizonY + GROUND_OFF * ss;
          var kk = ss * k * (0.6 + 0.4 * oo);
          o.node.style.opacity = oo.toFixed(3);
          o.node.style.transform =
            "translate3d(" + xx.toFixed(1) + "px," + yy.toFixed(1) + "px,0) " +
            "translate(-50%,-100%) scale(" + kk.toFixed(3) + ")";
          o.shade.style.opacity = (0.25 * oo).toFixed(2);
        }
      }
    }

    // ------------------- DECORADO EN MOVIMIENTO -------------------
    function renderDecor(dt) {
      var span = (DASH_COUNT - 1) * DASH_STEP;
      var speed = isRain ? 460 : 340;
      dashOffset += speed * dt / 1000;

      for (var i = 0; i < DASH_COUNT; i++) {
        var d = DEPTH_NEAR + ((dashOffset + i * DASH_STEP) % span);
        place(dashEls[i], Math.max(80, d), i % 3 === 1 ? 0 : (i % 3 === 0 ? -0.29 : 0.29), GROUND_OFF, 1);
      }

      var woff = (dashOffset * 300 / speed) % (WALL_COUNT * 900);
      for (var j = 0; j < WALL_COUNT; j++) {
        var dw = DEPTH_NEAR + ((woff + j * 900) % (WALL_COUNT * 900));
        place(wallEls[j][0], Math.max(80, dw), -1.18, -14, 1);
        place(wallEls[j][1], Math.max(80, dw), 1.18, -14, 1);
      }

      var loff = (dashOffset * 300 / speed) % (4 * 700);
      for (var l = 0; l < lampEls.length; l++) {
        var dl = DEPTH_NEAR + ((loff + l * 700) % (4 * 700));
        place(lampEls[l], Math.max(80, dl), l % 2 === 0 ? -0.5 : 0.5, -100, 1);
      }
    }

    // ------------------- CAMARA -------------------
    // Aplica bob, sway, inclinación de carril y el shake del choque.
    function renderCamera(now, dt) {
      var tSec = (now - startTime) / 1000;
      var bobY = Math.sin(tSec * 2.1) * 3.2;
      var bobX = Math.sin(tSec * 1.3) * 1.6;
      var swayX = Math.sin(tSec * 0.7) * 2.0;
      var laneT = clamp((now - laneChangedAt) / 300, 0, 1);
      var lean = laneChangeDir * (1 - laneT) * 5.5;
      var shakeX = 0, shakeY = 0;
      if (now < shakeUntil) {
        shakeX = (Math.random() * 2 - 1) * 5;
        shakeY = (Math.random() * 2 - 1) * 4;
      }
      var ease = ending ? (1 - clamp(endingT / 700, 0, 1)) : 1;
      world.style.transform =
        "translate3d(" + ((bobX + swayX + shakeX) * ease).toFixed(2) + "px," +
        ((bobY + shakeY) * ease).toFixed(2) + "px,0) " +
        "rotateZ(" + (lean * 0.02 * ease).toFixed(3) + "deg)";
      feet.style.transform = "translate3d(" + (lean * 0.18).toFixed(2) + "px,0,0)";
      void dt;
    }

    // ------------------- ANIMACIÓN DE ZANCADA (pies) -------------------
    function renderFeet(now) {
      var tSec = (now - startTime) / 1000;
      var swing = Math.sin(tSec * 3.4);
      var up = clamp(Math.sin(tSec * 3.4 + Math.PI * 0.5), -1, 1);
      var amp = ending ? 0.3 : 1;
      var left = feet.querySelector(".mg-ffp-foot.left");
      var right = feet.querySelector(".mg-ffp-foot.right");
      if (left) left.style.transform =
        "translate3d(0," + (-up * 6 * amp).toFixed(1) + "px,0) rotate(" + (swing * -2.4 * amp).toFixed(1) + "deg)";
      if (right) right.style.transform =
        "translate3d(0," + (up * 6 * amp).toFixed(1) + "px,0) rotate(" + (swing * 2.4 * amp).toFixed(1) + "deg)";
    }

    // ------------------- LLUVIA PROCEDURAL -------------------
    function updateRain(now, dt) {
      for (var i = 0; i < raindrops.length; i++) {
        var d = raindrops[i];
        if (!d.init) {
          d.init = true;
          d.y = Math.random() * H;
          d.x = Math.random() * W;
          d.len = 10 + Math.random() * 16;
          d.dy = 8 + Math.random() * 7;
          d.dx = d.dy * 0.34;
          d.blur = (Math.random() * 1.2).toFixed(2);
          d.op = (0.28 + Math.random() * 0.42).toFixed(2);
        }
        d.x += d.dx * dt / 16;
        d.y += d.dy * dt / 16;
        if (d.y > H + 30 || d.x > W + 30) {
          d.y = -30 - Math.random() * 40;
          d.x = Math.random() * W;
        }
        var ang = Math.atan2(-d.dy, -d.dx) * 180 / Math.PI;
        d.e.style.transform =
          "translate3d(" + d.x.toFixed(1) + "px," + d.y.toFixed(1) + "px,0) " +
          "rotate(" + ang.toFixed(1) + "deg) scaleY(" + (d.len / 18).toFixed(2) + ")";
        d.e.style.opacity = d.op;
        d.e.style.filter = "blur(" + d.blur + "px)";
      }
      void now;
    }

    // ------------------- HUD -------------------
    function renderHud() {
      var tLeft = Math.max(0, cfg.duration - elapsed);
      var timeVal = document.getElementById("mg-ffp-time-val");
      var timeValRain = document.getElementById("mg-ffp-time-val-rain");
      if (isRain && timeValRain) {
        timeValRain.textContent = Math.floor(tLeft / 60000) + ":" + zeroPad(Math.floor((tLeft % 60000) / 1000));
      } else if (!isRain && timeVal) {
        timeVal.textContent = (tLeft / 1000).toFixed(1) + "s";
      }
      if (isRain) {
        var speedEl = document.getElementById("mg-ffp-speed-val");
        if (speedEl) {
          var pct = clamp(elapsed / cfg.duration, 0, 1);
          speedEl.textContent = Math.round(9 + pct * 14);
        }
      }
      var crashEl = document.getElementById("mg-ffp-crash-val");
      if (crashEl) crashEl.textContent = crashes;
      if (cfg.showProgressBar) {
        var pct2 = clamp(elapsed / cfg.duration, 0, 1);
        hudProgressFill.style.width = (pct2 * 100).toFixed(1) + "%";
      }
      var laneNodes = lanesHud.children;
      for (var i = 0; i < laneNodes.length; i++) {
        laneNodes[i].classList.toggle("on", i === playerLane);
      }
    }

    // ------------------- IMPACTO (flash breve, no gigante) -------------------
    function renderFlash(now) {
      if (now < shakeUntil) {
        flash.style.opacity = (0.26 * (1 - (shakeUntil - now) / cfg.shakeDurationMs)).toFixed(2);
      } else {
        flash.style.opacity = "0";
      }
    }

    // ------------------- FINAL SUAVE -------------------
    function startEnding() {
      if (ending || destroyed || finishCalled) return;
      ending = true;
      endingT = 0;

      var title = document.getElementById("mg-ffp-end-title");
      var sub = document.getElementById("mg-ffp-end-sub");
      if (title) {
        title.textContent = crashes === 0
          ? (isRain ? "LLEGASTE AL MICRO" : "SALIDA LIMPIA")
          : (isRain ? "LLEGASTE CHOCADO" : "SALIDA CON ROZONES");
      }
      if (sub) {
        sub.textContent = crashes === 0
          ? "Sin empujones. El plantel te espera."
          : crashes + " empujón" + (crashes > 1 ? "es" : "") + " registrado" + (crashes > 1 ? "s" : "") + ".";
      }
      endOverlay.classList.add("show");

      endTimer = setTimeout(function () {
        finish();
      }, 900);
    }

    function finish() {
      if (finishCalled || destroyed) return;
      finishCalled = true;
      ending = false;
      if (rafId !== null) { global.cancelAnimationFrame(rafId); rafId = null; }
      running = false;
      if (typeof cfg.onFinish === "function") {
        try { cfg.onFinish(crashes); } catch (e) { /* la narrativa se maneja afuera */ }
      }
    }

    // ------------------- LOOP PRINCIPAL -------------------
    function loop(t) {
      if (destroyed) { rafId = null; return; }
      rafId = global.requestAnimationFrame(loop);

      var now = nowMs();
      var dt = Math.min(50, now - lastTime);
      lastTime = now;
      elapsed = now - startTime;

      if (ending) {
        endingT += dt;
        renderCamera(now, dt);
        renderFeet(now);
        renderFlash(now);
        if (endingT >= 700) {
          world.style.transform = "translate3d(0,0,0)";
          feet.style.transform = "translate3d(0,0,0)";
        }
        return;
      }

      // Spawn regido por el reloj (equivalente a interval, sin setInterval).
      if (elapsed < cfg.duration && now >= nextSpawnAt) spawnObstacle();

      updateObstacles(now);
      renderObstacles(now);
      renderDecor(dt);
      renderCamera(now, dt);
      renderFeet(now);
      if (isRain) updateRain(now, dt);
      renderHud();
      renderFlash(now);

      // Final: la escena se frena suave y se muestra el resultado.
      if (elapsed >= cfg.duration) {
        startEnding();
      }
    }

    // ------------------- API PÚBLICA -------------------
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      running = false;
      finishCalled = true;
      if (rafId !== null) { global.cancelAnimationFrame(rafId); rafId = null; }
      if (endTimer) { clearTimeout(endTimer); endTimer = null; }
      if (observer) observer.disconnect();
      else global.removeEventListener("resize", resize);
      global.removeEventListener("keydown", onKeyDown);
      scene.removeEventListener("touchstart", onTouchStart);
      scene.removeEventListener("touchend", onTouchEnd);
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }

    // ------------------- PUESTA EN MARCHA -------------------
    startTime = nowMs();
    lastTime = startTime;
    nextSpawnAt = startTime + currentInterval;
    clampPlayer();
    resize();
    running = true;
    rafId = global.requestAnimationFrame(loop);

    return {
      destroy: destroy,
      getCrashes: function () { return crashes; },
      moveToLane: moveToLane,
      isRunning: function () { return running; }
    };
  }

  // Exporta la factory al entorno (window o module común de vanilla).
  global.createFirstPersonDodge = createFirstPersonDodge;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = createFirstPersonDodge;
  }
})(typeof window !== "undefined" ? window : this);