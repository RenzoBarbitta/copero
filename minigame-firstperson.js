// ============================================================
//  MOTOR BASE DE MINIJUEGO EN PRIMERA PERSONA
//  createFirstPersonDodge(container, config)
//
//  Vista fija en primera persona (la cámara no se mueve) con
//  3 carriles (izquierda, centro, derecha). Cada cierto tiempo
//  aparece un obstáculo en un carril aleatorio y crece en escala
//  (0.2x -> 1.4x) simulando que se acerca hasta la cámara.
//
//  Controles:
//   - Desktop: teclas flecha izquierda/derecha (y A/D).
//   - Mobile: swipe izquierda/derecha sobre el canvas.
//   - Todos: botones on-screen visibles siempre.
//
//  El motor NO decide el resultado narrativo: solo informa el
//  contador de choques a onFinish(choques). Eso lo decide el
//  sistema externo (ver event-outcomes.js).
//
//  Sin dependencias externas: JS vanilla + API de Canvas 2D.
//  Sin sitios web ni fuentes externas. Comentarios en español,
//  nombres de variables y funciones en inglés.
//
//  API devuelta: { destroy(), getCrashes(), moveToLane() }
//  destroy() limpia listeners, detiene el loop rAF y elimina el
//  DOM generado (para evitar memory leaks si se cierra el modal).
// ============================================================

(function (global) {
  "use strict";

  // ------------------- VARIABLES Y DEFAULTS -------------------

  var DEFAULTS = {
    duration: 6000,            // duración total en ms
    obstacleInterval: 1200,    // ms entre apariciones de obstáculos
    minObstacleInterval: 380,  // piso del intervalo (dificultad progresiva)
    obstacleSpeed: 1000,       // ms que tarda un obstáculo en llegar a escala 1.0
    obstacleIntervalReduction: 0, // reducción del intervalo por cada N obstáculos (0..1)
    reductionEvery: 2,         // cada cuántos obstáculos aplica la reducción
    obstacleSprites: null,     // string[] de imágenes o null (usa formas de fallback)
    obstacleShapes: null,      // [{ type, colors }] formas de fallback por variante
    background: "#0b0f1a",     // color o gradiente de fondo
    showProgressBar: false,    // barra de distancia al finalizar (modo carrera)
    rainEffect: false,         // líneas de lluvia animadas
    onFinish: null,            // (choques) => void
    startScale: 0.2,           // escala inicial de un obstáculo (lejos)
    endScale: 1.4,             // escala final (sobre la cámara)
    impactScale: 1.2,          // escala de impacto: a partir de acá choca si coincide
    shakeDurationMs: 200,      // duración del screen shake ante choque
    fadeDurationMs: 260,       // duración del fundido de un obstáculo resuelto
    swipeThreshold: 28         // px mínimos para considerar un swipe
  };

  // Posición horizontal de cada carril en proporción al ancho del canvas.
  var LANES = [0.20, 0.50, 0.80];

  function mergeDefaults(user, base) {
    var out = {};
    var k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in user) if (Object.prototype.hasOwnProperty.call(user, k)) out[k] = user[k];
    return out;
  }

  function createFirstPersonDodge(container, config) {
    if (!container) throw new Error("createFirstPersonDodge necesita un contenedor (DOM element).");
    var cfg = mergeDefaults(config || {}, DEFAULTS);

    // ------------------- ESTADO INTERNO -------------------
    var playerLane = 1;          // 0 izquierda, 1 centro, 2 derecha
    var obstacles = [];          // obstáculos activos/en fundido
    var crashes = 0;             // contador de choques
    var running = false;
    var destroyed = false;
    var rafId = null;
    var lastTime = 0;
    var startTime = 0;
    var elapsed = 0;
    var shakeUntil = 0;
    var spawnedCount = 0;        // obstáculos creados (para progresión de dificultad)
    var currentInterval = Math.max(cfg.obstacleInterval, cfg.minObstacleInterval);
    var nextSpawnAt = 0;
    var raindrops = [];
    var images = [];
    var touchStart = null;

    // ------------------- DOM GENERADO -------------------
    var wrap = document.createElement("div");
    wrap.className = "mg-ffp-wrap";
    var canvas = document.createElement("canvas");
    canvas.className = "mg-ffp-canvas";
    wrap.appendChild(canvas);

    var buttonsRow = document.createElement("div");
    buttonsRow.className = "mg-ffp-buttons";
    var botones = [
      { texto: "◀", lane: 0 },
      { texto: "●", lane: 1 },
      { texto: "▶", lane: 2 }
    ];
    botones.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mg-ffp-lane-btn";
      btn.setAttribute("aria-label", "Carril " + (item.lane + 1));
      btn.textContent = item.texto;
      btn.addEventListener("click", function () { moveToLane(item.lane); });
      buttonsRow.appendChild(btn);
    });
    wrap.appendChild(buttonsRow);
    container.appendChild(wrap);

    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var dpr = 1;

    // ------------------- IMAGENES OPCIONALES -------------------
    if (cfg.obstacleSprites && cfg.obstacleSprites.length) {
      cfg.obstacleSprites.forEach(function (src) {
        var img = new Image();
        img.src = src;
        images.push(img);
      });
    }

    // ------------------- UTILIDADES DE TIEMPO -------------------
    function nowMs() {
      return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    }

    // ------------------- RESIZE RESPONSIVE -------------------
    function resize() {
      var rect = wrap.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      dpr = (global.devicePixelRatio) || 1;
      width = Math.max(80, Math.round(rect.width));
      height = Math.max(120, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    }

    var observer = (typeof ResizeObserver !== "undefined") ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(wrap);
    else global.addEventListener("resize", resize);
    resize();

    // ------------------- MOVIMIENTO DEL JUGADOR -------------------
    function moveToLane(index) {
      if (index < 0) index = 0;
      if (index > LANES.length - 1) index = LANES.length - 1;
      playerLane = index;
    }

    function clampPlayer() { moveToLane(playerLane); }

    // ------------------- ENTRADA (TECLADO / TOUCH / BOTONES) -------------------
    function onKeyDown(e) {
      if (destroyed || !running) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        moveToLane(playerLane - 1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        moveToLane(playerLane + 1);
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

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    global.addEventListener("keydown", onKeyDown);

    // ------------------- OBSTACULOS: SPAWN Y LÓGICA -------------------
    function pickFreeLane() {
      // Evita un patrón imposible: no spawnear sobre un carril con un
      // obstáculo muy cerca de la cámara si quedan carriles libres.
      var bloqueados = {};
      obstacles.forEach(function (o) {
        if (o.state === "active" && progressOf(o) > 0.6) bloqueados[o.lane] = true;
      });
      var libres = [];
      for (var i = 0; i < LANES.length; i++) if (!bloqueados[i]) libres.push(i);
      if (libres.length === 0) return Math.floor(Math.random() * LANES.length);
      return libres[Math.floor(Math.random() * libres.length)];
    }

    function pickShape() {
      if (!cfg.obstacleShapes || !cfg.obstacleShapes.length) {
        return { type: "person", colors: ["#d8b48a", "#4a6fa5"] };
      }
      return cfg.obstacleShapes[Math.floor(Math.random() * cfg.obstacleShapes.length)];
    }

    function spawnObstacle() {
      spawnedCount++;
      obstacles.push({
        lane: pickFreeLane(),
        born: nowMs(),
        life: Math.max(120, cfg.obstacleSpeed),
        image: images.length ? images[Math.floor(Math.random() * images.length)] : null,
        shape: pickShape(),
        state: "active", // active | crash | dodge
        fadeT: 0,
        slideDir: 0,
        lastT: 0
      });
      // Dificultad progresiva: el intervalo baja frente a cada N obstáculos.
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
            // Impacto: coincide el carril justo en la zona de choque.
            o.state = "crash";
            o.fadeT = 0;
            crashes++;
            shakeUntil = t + cfg.shakeDurationMs;
          } else if (p >= 1) {
            // Pasó la cámara sin chocar: esquive exitoso (slide + fade).
            o.state = "dodge";
            o.fadeT = 0;
            o.slideDir = o.lane < playerLane ? -1 : o.lane > playerLane ? 1 : (Math.random() < 0.5 ? -1 : 1);
          }
        } else {
          o.fadeT += (o.lastT > 0 ? t - o.lastT : 0);
        }
        o.lastT = t;
        if (o.state !== "active" && o.fadeT >= cfg.fadeDurationMs) obstacles.splice(i, 1);
      }
    }

    // ------------------- LLUVIA -------------------
    function spawnRaindrop() {
      var speed = 7 + Math.random() * 6;
      return {
        x: Math.random() * width,
        y: -20 - Math.random() * height,
        len: 10 + Math.random() * 12,
        dy: speed,
        dx: speed * 0.32
      };
    }

    function updateRain(t, dt) {
      if (raindrops.length < 150) raindrops.push(spawnRaindrop());
      for (var i = 0; i < raindrops.length; i++) {
        var d = raindrops[i];
        d.x += d.dx;
        d.y += d.dy;
        if (d.y > height + 20 || d.x > width + 20) {
          raindrops[i] = spawnRaindrop();
        }
      }
    }

    // ------------------- DIBUJO -------------------
    function paintBackground() {
      var bg = String(cfg.background || "").trim();
      if (bg.indexOf("linear-gradient(") === 0) {
        var inner = bg.slice("linear-gradient(".length, bg.lastIndexOf(")"));
        var parts = inner.split(",");
        var direction = parts[0].trim();
        var grad = null;
        if (direction === "to right") {
          grad = ctx.createLinearGradient(0, 0, width, 0);
        } else if (direction === "to top") {
          grad = ctx.createLinearGradient(0, height, 0, 0);
        } else {
          // Por defecto hacia abajo (to bottom) y "from top".
          grad = ctx.createLinearGradient(0, 0, 0, height);
        }
        for (var i = 1; i < parts.length; i++) {
          grad.addColorStop((i - 1) / (parts.length - 1), parts[i].trim());
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg || "#0b0f1a";
      }
      ctx.fillRect(0, 0, width, height);
    }

    function drawLanes() {
      // Lineas en perspectiva desde un punto de fuga central (sensación de túnel).
      var gapX = width;   // indicador de tonalidad en los extremos
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      for (var i = 0; i < LANES.length; i++) {
        var x = LANES[i] * width;
        ctx.beginPath();
        ctx.moveTo(width / 2, height * 0.34);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Laterales de la calle
      var side = 0.06 * width;
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.beginPath(); ctx.moveTo(width / 2, height * 0.34); ctx.lineTo(side, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width / 2, height * 0.34); ctx.lineTo(width - side, height); ctx.stroke();
      ctx.restore();
      void gapX;
    }

    function roundRect(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawShape(s) {
      var colors = (s && s.colors) || ["#d8b48a", "#4a6fa5"];
      switch (s && s.type) {
        case "car":
          // Auto: cabina + carrocería + ruedas.
          ctx.fillStyle = colors[0];
          roundRect(-34, -22, 68, 30, 8); ctx.fill();
          ctx.fillStyle = colors[1];
          roundRect(-22, -40, 44, 22, 6); ctx.fill();
          ctx.fillStyle = "#10131a";
          ctx.beginPath(); ctx.arc(-20, 10, 8, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(20, 10, 8, 0, Math.PI * 2); ctx.fill();
          break;
        case "puddle":
          // Charco: elipse plana semi transparente.
          ctx.globalAlpha *= 0.6;
          ctx.fillStyle = colors[0];
          ctx.beginPath(); ctx.ellipse(0, 0, 34, 11, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha *= 1;
          break;
        case "cam":
          // Cámara (parabólica): cuerpo ancho + lente circular + trípode.
          ctx.fillStyle = colors[0];
          roundRect(-24, -36, 48, 46, 7); ctx.fill();
          ctx.fillStyle = colors[1];
          ctx.beginPath(); ctx.arc(0, -16, 11, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#10131a";
          roundRect(-8, 12, 16, 26, 3); ctx.fill();
          break;
        case "mic":
          // Micrófono de notero: perilla + bastón + pies.
          ctx.fillStyle = colors[1];
          roundRect(-5, -46, 10, 58, 5); ctx.fill();
          ctx.fillStyle = colors[0];
          ctx.beginPath(); ctx.arc(0, -50, 11, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(0, 16, 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#10131a";
          roundRect(-16, 20, 12, 20, 3); ctx.fill();
          roundRect(4, 20, 12, 20, 3); ctx.fill();
          break;
        default:
          // Persona de pie: cabeza (círculo) + cuerpo (rectángulo) + piernas.
          ctx.fillStyle = colors[0];
          ctx.beginPath(); ctx.arc(0, -40, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = colors[1];
          roundRect(-16, -26, 32, 44, 8); ctx.fill();
          roundRect(-15, 18, 12, 26, 4); ctx.fill();
          roundRect(3, 18, 12, 26, 4); ctx.fill();
          break;
      }
    }

    function drawObstacle(o, p) {
      var scale = cfg.startScale + (cfg.endScale - cfg.startScale) * p;
      var alpha = 1;
      var slideX = 0;
      if (o.state !== "active") {
        var k = Math.max(0, 1 - o.fadeT / cfg.fadeDurationMs);
        alpha = k;
        slideX = o.slideDir * (1 - k) * width * 0.10;
      }
      var x = LANES[o.lane] * width;
      var yBase = height * 0.72; // punto de apoyo de los obstáculos
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x + slideX, yBase);
      ctx.scale(scale, scale);
      if (o.image && o.image.complete && o.image.naturalWidth > 0) {
        ctx.drawImage(o.image, -24, -70, 48, 66);
      } else {
        drawShape(o.shape);
      }
      ctx.restore();
    }

    function drawLaneIndicator() {
      var slots = LANES.length;
      var w = 24, h = 12, gap = 8;
      var total = slots * w + (slots - 1) * gap;
      var x0 = (width - total) / 2;
      var y = height - 26;
      for (var i = 0; i < slots; i++) {
        ctx.beginPath();
        roundRect(x0 + i * (w + gap), y, w, h, 4);
        ctx.fillStyle = (i === playerLane) ? "rgba(68,210,150,0.95)" : "rgba(255,255,255,0.16)";
        ctx.fill();
      }
    }

    function drawProgress(t) {
      if (!cfg.showProgressBar) return;
      var pct = Math.min(1, elapsed / cfg.duration);
      var pw = Math.min(220, width * 0.5);
      var x0 = (width - pw) / 2;
      var y = 14;
      var h = 8;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      roundRect(x0, y, pw, h, 4); ctx.fill();
      ctx.fillStyle = pct < 0.6 ? "#46d296" : pct < 0.85 ? "#f0c33c" : "#e65c54";
      roundRect(x0, y, Math.max(8, pw * pct), h, 4); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(Math.ceil((cfg.duration - elapsed) / 1000) + "s", width / 2, y + h + 12);
      ctx.restore();
    }

    function drawRain() {
      if (!cfg.rainEffect) return;
      ctx.save();
      ctx.strokeStyle = "rgba(190,210,230,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var i = 0; i < raindrops.length; i++) {
        var d = raindrops[i];
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.dx * d.len / d.dy, d.y + d.len);
      }
      ctx.stroke();
      ctx.restore();
    }

    function draw(t, shaking) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintBackground();
      if (shaking) {
        ctx.translate((Math.random() * 10 - 5), (Math.random() * 10 - 5));
      }
      drawLanes();
      obstacles.forEach(function (o) { drawObstacle(o, progressOf(o)); });
      drawLaneIndicator();
      drawRain();
      drawProgress(t);
    }

    // ------------------- LOOP PRINCIPAL (rAF) -------------------
    function loop(t) {
      if (destroyed) { rafId = null; return; }
      rafId = global.requestAnimationFrame(loop);

      var now = nowMs();
      var dt = Math.min(50, now - lastTime);
      lastTime = now;
      elapsed = now - startTime;

      // Spawn regido por el reloj (equivalente a interval, pero sin setInterval).
      if (elapsed < cfg.duration && now >= nextSpawnAt) spawnObstacle();

      updateObstacles(now);
      if (cfg.rainEffect) updateRain(now, dt);

      var shaking = now < shakeUntil;
      draw(now, shaking);

      if (elapsed >= cfg.duration) {
        finish();
      }
    }

    function finish() {
      if (rafId !== null) { global.cancelAnimationFrame(rafId); rafId = null; }
      running = false;
      if (typeof cfg.onFinish === "function") {
        try { cfg.onFinish(crashes); } catch (e) { /* la narrativa se maneja afuera */ }
      }
    }

    // ------------------- API PÚBLICA -------------------
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      running = false;
      if (rafId !== null) { global.cancelAnimationFrame(rafId); rafId = null; }
      if (observer) observer.disconnect();
      else global.removeEventListener("resize", resize);
      global.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
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