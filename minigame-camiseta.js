// ============================================================
//  MINIJUEGOS DE COPERO
//   - createDodgeCamiseta(container, config)     → túnel / lluvia
//   - iniciarMinijuegoDardos()                    → dardos
// ============================================================

(function (global) {
  "use strict";

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function now() {
    return (typeof performance !== "undefined" && performance.now)
      ? performance.now() : Date.now();
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function randInt(n) { return Math.floor(Math.random() * n); }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else setTimeout(fn, 0);
  }

  function shapeToEmoji(shape, isRain) {
    var t = shape && shape.type;
    if (t === "cam") return { type: "cam", emoji: "📷" };
    if (t === "mic") return { type: "mic", emoji: "🎤" };
    if (t === "car") return { type: "car", emoji: "🚗" };
    if (t === "pedestrian") return { type: "pedestrian", emoji: "🚶" };
    if (t === "puddle") return { type: "puddle", emoji: "💧", wide: true };
    if (isRain) return { type: "pedestrian", emoji: "🚶" };
    return { type: "person", emoji: "🧑" };
  }

  // -------------------- CAMISETA DEL EQUIPO --------------------
  // Usa la función expuesta por camiseta.js (colores del club en el
  // que está jugando el jugador). Fallback a 👕 si algo falla.
  function leerCamisetaJugador() {
    var out = { svg: null, fallback: "👕" };
    try {
      if (typeof global.getCamisetaDeEquipo === "function") {
        var svg = global.getCamisetaDeEquipo();
        if (svg) out.svg = svg;
      }
    } catch (e) { /* sin jugador o club cargados */ }
    return out;
  }

  function construirCamiseta(info) {
    var cont = el("div", "mg-player-camiseta");
    if (info && info.svg) cont.innerHTML = info.svg;
    else if (info && info.fallback) cont.textContent = info.fallback;
    else cont.textContent = "👕";
    return cont;
  }

  // ============================================================
  //  DODGE (túnel / lluvia) — esquivar con la camiseta del equipo
  // ============================================================
  function createDodgeCamiseta(container, config) {
    if (!container) throw new Error("createDodgeCamiseta necesita un contenedor.");
    var cfg = config || {};
    var isRain = !!cfg.rainEffect || cfg.variant === "rain";
    var variant = isRain ? "rain" : "tunnel";

    var duration = cfg.duration || 12000;
    var spawnBase = cfg.obstacleInterval || (isRain ? 300 : 260);
    var minInterval = cfg.minObstacleInterval || (isRain ? 130 : 110);
    var fallDuration = cfg.obstacleSpeed || 620;
    var accelerate = (cfg.acceleration != null) ? cfg.acceleration : 22;
    var obstacleSize = (cfg.obstacleSize != null) ? cfg.obstacleSize : 0.48;
    var onFinish = cfg.onFinish || null;

    var shapes = [];
    if (Array.isArray(cfg.obstacleShapes) && cfg.obstacleShapes.length) {
      for (var si = 0; si < cfg.obstacleShapes.length; si++) {
        shapes.push(shapeToEmoji(cfg.obstacleShapes[si], isRain));
      }
    }
    if (shapes.length === 0) {
      shapes = isRain
        ? [{ type: "car", emoji: "🚗" }, { type: "pedestrian", emoji: "🚶" }, { type: "puddle", emoji: "💧", wide: true }]
        : [{ type: "person", emoji: "🧑" }, { type: "cam", emoji: "📷" }, { type: "mic", emoji: "🎤" }];
    }

    var playerLane = 1, items = [], hits = 0, score = 0;
    var startTime = 0, lastLoopTime = 0, nextSpawnAt = 0;
    var destroyed = false, finished = false, ending = false, rafId = null;
    var touchStart = null, W = 1, H = 1, laneWidth = 1;
    var shakeUntil = 0, introTimer = null, raindrops = [];

    var wrap = el("div", "mg-wrap");
    wrap.setAttribute("data-variant", variant);
    var scene = el("div", "mg-scene");
    wrap.appendChild(scene);

    if (isRain) {
      for (var r = 0; r < 50; r++) {
        var drop = el("div", "mg-raindrop");
        drop.style.left = Math.random() * 100 + "%";
        drop.style.top = (Math.random() * -100) + "%";
        drop.style.opacity = (0.3 + Math.random() * 0.5).toFixed(2);
        scene.appendChild(drop);
        raindrops.push({
          node: drop, y: parseFloat(drop.style.top) / 100,
          speed: 1.8 + Math.random() * 1.6, len: 12 + Math.random() * 16
        });
      }
    }

    var hud = el("div", "mg-hud");
    hud.appendChild(el("div", "mg-chip timer", '<span class="lbl">T</span><span class="val" id="mg-timer">' + (duration / 1000).toFixed(1) + '</span>'));
    hud.appendChild(el("div", "mg-chip", '<span class="lbl">ESQUIVES</span><span class="val" id="mg-score">0</span>'));
    hud.appendChild(el("div", "mg-chip hits", '<span class="lbl">GOLPES</span><span class="val" id="mg-hits">0</span>'));
    scene.appendChild(hud);

    var lives = el("div", "mg-lives");
    var lifeEls = [];
    for (var i = 0; i < 3; i++) {
      var li = el("div", "mg-life");
      lives.appendChild(li); lifeEls.push(li);
    }
    scene.appendChild(lives);

    var flash = el("div", "mg-flash");
    scene.appendChild(flash);

    var player = el("div", "mg-player");
    player.appendChild(construirCamiseta(leerCamisetaJugador()));
    scene.appendChild(player);

    var controls = el("div", "mg-controls");
    function makeBtn(dir) {
      var b = el("button", "mg-btn", dir > 0 ? "▶" : "◀");
      b.type = "button";
      b.addEventListener("click", function () { movePlayer(playerLane + dir); });
      return b;
    }
    controls.appendChild(makeBtn(-1));
    controls.appendChild(makeBtn(1));
    scene.appendChild(controls);

    var intro = el("div", "mg-intro",
      '<div class="mg-intro-card">' +
      '<span class="mg-intro-emoji">' + (isRain ? "🌧️" : "🏟️") + "</span>" +
      '<div class="mg-intro-title">' + (isRain ? "CARRERA BAJO LLUVIA" : "SALIDA DEL TÚNEL") + "</div>" +
      '<div class="mg-intro-text">' + (isRain ? "Caen <strong>en diagonal</strong>." : "Caen <strong>rectos</strong>.") + "</div>" +
      '<div class="mg-intro-keys"><kbd>←</kbd><span>o</span><kbd>→</kbd></div>' +
      "</div>");
    scene.appendChild(intro);

    var endOverlay = el("div", "mg-end",
      '<div>' +
      '<span class="mg-end-emoji" id="mg-end-emoji"></span>' +
      '<div class="mg-end-title" id="mg-end-title"></div>' +
      '<div class="mg-end-sub" id="mg-end-sub"></div>' +
      "</div>");
    scene.appendChild(endOverlay);

    function hideIntro() { intro.classList.add("hide"); }
    function introOnKey(e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" ||
          e.key === "a" || e.key === "A" || e.key === "d" || e.key === "D") hideIntro();
    }

    function resize() {
      var r = scene.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      W = Math.round(r.width);
      H = Math.round(r.height);
      laneWidth = W / 3;
      updatePlayerX();
      var size = laneWidth * obstacleSize;
      for (var j = 0; j < items.length; j++) {
        var o = items[j];
        if (o.kind === "obstacle") {
          o.node.style.width = size + "px";
          o.node.style.height = (o.wide ? size * 0.5 : size) + "px";
          o.node.style.left = (laneWidth * o.lane + (laneWidth - size) / 2) + "px";
        }
      }
    }
    function updatePlayerX() {
      var pw = player.offsetWidth || 84;
      player.style.left = (laneWidth * (playerLane + 0.5) - pw / 2) + "px";
    }
    function movePlayer(idx) {
      idx = clamp(idx, 0, 2);
      if (idx === playerLane) return;
      playerLane = idx;
      updatePlayerX();
    }
    function onKeyDown(e) {
      if (destroyed || finished) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); movePlayer(playerLane - 1); }
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); movePlayer(playerLane + 1); }
    }
    function onTouchStart(e) { var t = e.touches && e.touches[0]; if (t) touchStart = { x: t.clientX }; }
    function onTouchEnd(e) {
      if (!touchStart) return;
      var t = e.changedTouches && e.changedTouches[0];
      if (t) {
        var dx = t.clientX - touchStart.x;
        if (Math.abs(dx) > 30) movePlayer(playerLane + (dx > 0 ? 1 : -1));
      }
      touchStart = null;
    }

    scene.addEventListener("touchstart", onTouchStart, { passive: true });
    scene.addEventListener("touchend", onTouchEnd, { passive: true });
    scene.addEventListener("touchstart", hideIntro, { once: true, passive: true });
    global.addEventListener("keydown", onKeyDown);
    global.addEventListener("keydown", introOnKey);

    function spawn() {
      var lane = randInt(3);
      var size = laneWidth * obstacleSize;
      var pick = shapes[randInt(shapes.length)];
      var wide = !!pick.wide;
      var node = el("div", "mg-obs " + pick.type + (wide ? " wide" : ""), pick.emoji);
      node.style.width = size + "px";
      node.style.height = (wide ? size * 0.5 : size) + "px";
      node.style.left = (laneWidth * lane + (laneWidth - size) / 2) + "px";
      node.style.top = (-size) + "px";
      scene.appendChild(node);
      items.push({
        kind: "obstacle", lane: lane, node: node, age: 0,
        wide: wide, hit: false, passed: false,
        drift: isRain ? (Math.random() * 2 - 1) * 1.0 : 0
      });

      var elapsedSec = (now() - startTime) / 1000;
      var cur = Math.max(minInterval, spawnBase - elapsedSec * accelerate);
      nextSpawnAt = now() + cur;
    }

    function updateItems(dt) {
      var zone = H - 90;
      for (var i = items.length - 1; i >= 0; i--) {
        var o = items[i];
        o.age += dt;
        var p = clamp(o.age / fallDuration, 0, 1);
        var y = p * (H - 40);
        var dx = (isRain && o.kind === "obstacle") ? o.drift * p * laneWidth * 0.9 : 0;
        o.node.style.transform = "translate(" + dx + "px," + y + "px)";

        if (!o.hit && !o.passed && y > zone) {
          if (o.lane === playerLane) {
            hits++;
            shakeUntil = now() + 350;
            flash.style.opacity = "0.75";
            player.classList.remove("hit");
            void player.offsetWidth;
            player.classList.add("hit");
            setTimeout(function () { flash.style.opacity = "0"; }, 150);
            o.hit = true;
            if (o.node.parentNode) o.node.parentNode.removeChild(o.node);
            items.splice(i, 1);
            updateHud();
            if (hits >= 3) { startEnding(); return; }
            continue;
          } else if (!o.passed) {
            o.passed = true;
            score++;
            updateHud();
          }
        }
        if (p >= 1 || y > H + 40) {
          if (o.node.parentNode) o.node.parentNode.removeChild(o.node);
          items.splice(i, 1);
        }
      }
    }

    function updateRain(dt) {
      for (var i = 0; i < raindrops.length; i++) {
        var d = raindrops[i];
        d.y += (d.speed * dt) / 1000;
        if (d.y > 1.1) { d.y = -0.1; d.node.style.left = Math.random() * 100 + "%"; }
        d.node.style.top = (d.y * 100) + "%";
        d.node.style.height = d.len + "px";
      }
    }

    function updateHud() {
      for (var i = 0; i < lifeEls.length; i++) lifeEls[i].classList.toggle("off", i < hits);
      var e1 = document.getElementById("mg-hits"); if (e1) e1.textContent = hits;
      var e2 = document.getElementById("mg-score"); if (e2) e2.textContent = score;
    }

    function applyShake() {
      var t = now();
      if (t < shakeUntil) {
        var k = (shakeUntil - t) / 350 * 5;
        scene.style.transform = "translate(" + ((Math.random() * 2 - 1) * k) + "px," + ((Math.random() * 2 - 1) * k) + "px)";
      } else if (scene.style.transform) scene.style.transform = "";
    }

    function startEnding() {
      if (ending || destroyed || finished) return;
      ending = true;
      var endEmoji = document.getElementById("mg-end-emoji");
      var endTitle = document.getElementById("mg-end-title");
      var endSub = document.getElementById("mg-end-sub");
      if (hits === 0) { endEmoji.textContent = "🏆"; endTitle.textContent = isRain ? "¡LLEGASTE SECO!" : "¡PASASTE LIMPIO!"; }
      else if (hits < 3) { endEmoji.textContent = "🏁"; endTitle.textContent = isRain ? "LLEGASTE MOJADO" : "LLEGASTE CON ROZONES"; }
      else { endEmoji.textContent = "💥"; endTitle.textContent = isRain ? "NO LLEGASTE" : "TE AGARRARON"; }
      endSub.innerHTML = "Esquives: <strong style='color:#7ef0c4'>" + score + "</strong> · Golpes: <strong style='color:#ff8a7a'>" + hits + "</strong>";
      endOverlay.classList.add("show");
      setTimeout(finishGame, 1100);
    }

    function finishGame() {
      if (finished || destroyed) return;
      finished = true;
      ending = false;
      if (rafId != null) { global.cancelAnimationFrame(rafId); rafId = null; }
      if (typeof onFinish === "function") {
        try { onFinish(hits); } catch (e) {}
      }
    }

    function loop() {
      if (destroyed) { rafId = null; return; }
      rafId = global.requestAnimationFrame(loop);
      var t = now();
      var dt = Math.min(50, t - lastLoopTime);
      lastLoopTime = t;
      var elapsed = t - startTime;

      if (ending) { applyShake(); return; }
      if (elapsed < duration && t >= nextSpawnAt) spawn();
      updateItems(dt);
      if (isRain) updateRain(dt);
      applyShake();

      var left = Math.max(0, duration - elapsed);
      var timerEl = document.getElementById("mg-timer");
      if (timerEl) timerEl.textContent = (left / 1000).toFixed(1);

      if (elapsed >= duration && !ending) startEnding();
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      finished = true;
      if (rafId != null) { global.cancelAnimationFrame(rafId); rafId = null; }
      if (introTimer) { clearTimeout(introTimer); introTimer = null; }
      global.removeEventListener("keydown", onKeyDown);
      global.removeEventListener("keydown", introOnKey);
      scene.removeEventListener("touchstart", onTouchStart);
      scene.removeEventListener("touchend", onTouchEnd);
      scene.removeEventListener("touchstart", hideIntro);
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }

    container.appendChild(wrap);
    resize();
    var obs = (typeof ResizeObserver !== "undefined") ? new ResizeObserver(resize) : null;
    if (obs) obs.observe(scene); else global.addEventListener("resize", resize);

    startTime = now();
    lastLoopTime = startTime;
    nextSpawnAt = startTime + 300;
    introTimer = setTimeout(hideIntro, 2400);
    updateHud();
    rafId = global.requestAnimationFrame(loop);

    return {
      destroy: destroy,
      getCrashes: function () { return hits; },
      getScore: function () { return score; },
      isRunning: function () { return !finished && !destroyed; }
    };
  }

  // ============================================================
  //  DARDOS (sobrescribe iniciarMinijuegoDardos de app.js)
  // ============================================================
  function crearDardosNuevo() {
    var contenedor = document.getElementById("contenedorDardos");
    if (!contenedor) return;

    ["instruccionDardos", "marcadorDardos", "btnTirarDardo", "resultadoDardos"].forEach(function (id) {
      var e = document.getElementById(id);
      if (e) e.style.display = "none";
    });
    contenedor.innerHTML = "";

    var modal = document.getElementById("modalDardos");
    if (modal && typeof bootstrap !== "undefined") {
      bootstrap.Modal.getOrCreateInstance(modal).show();
    }

    var cfgD = (typeof CONFIG !== "undefined" && CONFIG.DARTS) ? CONFIG.DARTS : {};
    var tirosTotal = cfgD.TIROS || 3;
    var umbralMoral = cfgD.PUNTAJE_MORAL || 40;
    var bonusMoral = cfgD.MORAL_BONUS || 5;

    var destroyed = false, finished = false;
    var tirosHechos = 0, score = 0;
    var oscilando = false, pos = 0, dir = 1, angulo = 0;
    var rafId = null, lastT = 0;
    var velocidadRadial = 1.3;
    var velocidadAngular = 0.006;

    var wrap = el("div", "dd-wrap");
    contenedor.appendChild(wrap);

    wrap.appendChild(el("div", "", '<strong style="font-size:18px">🎯 DARDOS</strong>'));

    var zone = el("div", "dd-zone");
    wrap.appendChild(zone);

    var board = el("div", "dd-board");
    zone.appendChild(board);

    var nums = el("div", "dd-nums");
    var ordenNums = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    for (var ni = 0; ni < 20; ni++) {
      var numEl = el("span", "dd-num", String(ordenNums[ni]));
      var angN = (ni * 18 - 90) * Math.PI / 180;
      numEl.style.left = (50 + Math.cos(angN) * 45.5) + "%";
      numEl.style.top = (50 + Math.sin(angN) * 45.5) + "%";
      nums.appendChild(numEl);
    }
    zone.appendChild(nums);

    var dartSvg = '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dardo">' +
      '<path d="M60 4 L50 28 L60 24 L70 28 Z" fill="#b8842a"/>' +
      '<path d="M60 4 L55 28 L65 28 Z" fill="#ffd24a"/>' +
      '<path d="M56 28 a2 2 0 0 1 8 0 v4 a2 2 0 0 1 -8 0 Z" fill="#c8d2dc"/>' +
      '<rect x="56" y="34" width="8" height="8" rx="2" fill="#7a8898"/>' +
      '<path d="M54 46 h12 M54 52 h12 M54 58 h12" stroke="#5a6a7a" stroke-width="2" fill="none"/>' +
      '<rect x="54" y="62" width="12" height="14" rx="3" fill="#d8dde4"/>' +
      '<path d="M57 78 v12 M63 78 v12" stroke="#9aa8b6" stroke-width="2.5" fill="none"/>' +
      '<path d="M60 78 L54 100 L60 118 L66 100 Z" fill="#cfd8e0"/>' +
      '<path d="M60 78 L50 98 L60 118 Z" fill="#9fb3c4"/>' +
      '<path d="M60 78 L70 98 L60 118 Z" fill="#eef3f8"/>' +
      '</svg>';

    var dart = el("div", "dd-dart", dartSvg);
    zone.appendChild(dart);

    var indicator = el("div", "dd-indicator");
    zone.appendChild(indicator);

    var btn = el("button", "dd-btn", "🎯 TIRAR");
    btn.addEventListener("click", tirar);
    wrap.appendChild(btn);

    var scoreEl = el("div", "dd-score", "Puntos: 0 · Tiros: 0/" + tirosTotal);
    wrap.appendChild(scoreEl);

    var msgEl = el("div", "dd-msg", "");
    wrap.appendChild(msgEl);

    function dimsZone() {
      var r = zone.getBoundingClientRect();
      var lado = (r.width || 280);
      var c = lado / 2;
      return { c: c, rad: c - 16 };
    }
    function setIndicator() {
      var d = dimsZone();
      var rad = d.rad * (1 - pos);
      var x = Math.cos(angulo) * rad;
      var y = Math.sin(angulo) * rad;
      var px = d.c + x, py = d.c + y;
      indicator.style.left = px + "px";
      indicator.style.top = py + "px";
      dart.style.left = px + "px";
      dart.style.top = py + "px";
      dart.style.transform = "rotate(" + Math.atan2(x, -y) + "rad)";
    }

    function loop() {
      if (destroyed || finished) { rafId = null; return; }
      rafId = global.requestAnimationFrame(loop);
      var t = now();
      var dt = Math.min(50, t - lastT);
      lastT = t;
      if (oscilando) {
        angulo += velocidadAngular * dt;
        pos += dir * velocidadRadial * dt / 1000;
        if (pos >= 1) { pos = 1; dir = -1; }
        if (pos <= 0) { pos = 0; dir = 1; }
        setIndicator();
      }
    }

    function tirar() {
      if (!oscilando || tirosHechos >= tirosTotal || finished) return;
      oscilando = false;
      var pts = 5, label = "borde", cls = "borde";
      if (pos >= 0.92) { pts = 50; label = "¡DIANA!"; cls = "diana"; }
      else if (pos >= 0.78) { pts = 25; label = "anillo"; cls = "anillo"; }
      else if (pos >= 0.55) { pts = 10; label = "buen tiro"; cls = "buen-tiro"; }
      score += pts;
      tirosHechos++;

      var d = dimsZone();
      var radHit = d.rad * (1 - pos);
      var hx = Math.cos(angulo) * radHit;
      var hy = Math.sin(angulo) * radHit;
      var px = d.c + hx, py = d.c + hy;
      var angHit = Math.atan2(hx, -hy);

      indicator.classList.add("hidden");
      dart.classList.add("hidden");

      var fly = el("div", "dd-fly");
      var flyInner = el("div", "dd-fly-inner", dartSvg);
      fly.appendChild(flyInner);
      fly.style.left = px + "px";
      fly.style.top = py + "px";
      flyInner.style.transform = "rotate(" + angHit + "rad)";
      zone.appendChild(fly);

      var ring = el("span", "dd-ring");
      ring.style.left = px + "px";
      ring.style.top = py + "px";
      zone.appendChild(ring);

      var pop = el("span", "dd-pop " + cls, "+" + pts);
      pop.style.left = (px + 8) + "px";
      pop.style.top = (py - 6) + "px";
      zone.appendChild(pop);

      board.classList.remove("dd-strike");
      void board.offsetWidth;
      board.classList.add("dd-strike");

      var hole = el("div", "dd-hole");
      hole.style.left = px + "px";
      hole.style.top = py + "px";
      zone.appendChild(hole);

      msgEl.textContent = "+" + pts + " (" + label + ")";
      scoreEl.textContent = "Puntos: " + score + " · Tiros: " + tirosHechos + "/" + tirosTotal;

      window.setTimeout(function () {
        if (fly.parentNode) fly.parentNode.removeChild(fly);
        if (ring.parentNode) ring.parentNode.removeChild(ring);
        if (pop.parentNode) pop.parentNode.removeChild(pop);
        board.classList.remove("dd-strike");
      }, 750);

      if (tirosHechos >= tirosTotal) setTimeout(finalizar, 950);
      else {
        velocidadRadial += 0.4;
        velocidadAngular += 0.002;
        setTimeout(function () {
          pos = 0; dir = 1; oscilando = true;
          indicator.classList.remove("hidden");
          dart.classList.remove("hidden");
          setIndicator();
          msgEl.textContent = "";
        }, 700);
      }
    }

    function finalizar() {
      if (finished || destroyed) return;
      finished = true;
      if (rafId != null) { global.cancelAnimationFrame(rafId); rafId = null; }

      var ganado = score >= umbralMoral;
      if (ganado && typeof cambiarMoral === "function") cambiarMoral(bonusMoral);
      if (typeof guardarPartida === "function") guardarPartida();

      var endOv = el("div", "mg-end",
        '<div>' +
        '<span class="mg-end-emoji" id="dd-end-emoji"></span>' +
        '<div class="mg-end-title" id="dd-end-title"></div>' +
        '<div class="mg-end-sub" id="dd-end-sub"></div>' +
        "</div>");
      wrap.appendChild(endOv);
      var em = endOv.querySelector("#dd-end-emoji");
      var ti = endOv.querySelector("#dd-end-title");
      var su = endOv.querySelector("#dd-end-sub");
      if (score >= 100) { em.textContent = "🏆"; ti.textContent = "¡MAESTRO!"; }
      else if (score >= 60) { em.textContent = "🎯"; ti.textContent = "¡BUEN TIRO!"; }
      else if (score >= 30) { em.textContent = "👍"; ti.textContent = "ZAFABLE"; }
      else { em.textContent = "😅"; ti.textContent = "FLOJO"; }
      su.innerHTML = "Puntos: <strong style='color:#ffd24a'>" + score + "</strong>" +
        (ganado ? "<br><span style='color:#7ef0c4'>+" + bonusMoral + " moral</span>" : "");
      endOv.classList.add("show");

      setTimeout(function () {
        if (modal && typeof bootstrap !== "undefined") {
          bootstrap.Modal.getOrCreateInstance(modal).hide();
        }
        if (typeof verificarCambioRol === "function") verificarCambioRol();
        if (typeof actualizarInterfaz === "function") actualizarInterfaz();
      }, 1600);
    }

    function onSpace(e) {
      if (e.code === "Space") {
        e.preventDefault();
        if (!oscilando && tirosHechos === 0 && !finished) return;
        tirar();
      }
    }
    global.addEventListener("keydown", onSpace);

    lastT = now();
    setIndicator();
    setTimeout(function () { oscilando = true; pos = 0; dir = 1; angulo = 0; }, 1200);
    rafId = global.requestAnimationFrame(loop);
  }

  global.createDodgeCamiseta = createDodgeCamiseta;

  ready(function () {
    global.iniciarMinijuegoDardos = crearDardosNuevo;
  });

})(typeof window !== "undefined" ? window : this);