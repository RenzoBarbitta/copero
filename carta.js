// ============================================================
//  CARTA DE RETIRO (carta.js)
//  Al terminar la carrera se genera una carta tipo FIFAUC en un
//  <canvas> (1000x1400) con: foto subida por el jugador o avatar del
//  juego, OVR, posición, bandera, escudo del club, 6 atributos,
//  estadísticas de carrera y títulos. Se descarga como PNG.
//
//  Solo aparece en el retiro: no hay carta durante la carrera.
// ============================================================

// Estado de la carta en curso (foto temporal + avatar elegido).
let estadoCarta = {
  fotoDataUrl: null,
  avatarId: null
};

// Rareza según el OVR final del jugador.
function rarezaCarta(media) {
  const cfg = CONFIG.CARTA;
  const ovr = media || 0;
  for (let i = 0; i < cfg.RAREZAS.length; i++) {
    if (ovr >= cfg.RAREZAS[i].desde) return cfg.RAREZAS[i];
  }
  return cfg.RAREZAS[cfg.RAREZAS.length - 1];
}

// Los 6 atributos visibles de la carta (los de la posición).
function atributosCarta() {
  const cfg = CONFIG.PROGRESION;
  if (!jugador.atributos) return [];
  const lista = (jugador.posicion === "GK")
    ? cfg.ATRIBUTOS_ARQUERO
    : cfg.ATRIBUTOS_CAMPO;
  return lista.map(function (clave) {
    return {
      abrev: clave,
      nombre: cfg.NOMBRES_ATRIBUTOS[clave] || clave,
      valor: jugador.atributos[clave] || 0
    };
  });
}

// Totales de carrera que se imprimen en la carta.
function totalesCarta() {
  let partidos = 0, goles = 0, asistencias = 0;
  (jugador.historialTemporadas || []).forEach(function (t) {
    partidos += t.partidos || 0;
    goles += t.goles || 0;
    asistencias += t.asistencias || 0;
  });
  const trofeos = jugador.trofeos || {};
  const titulos = Object.keys(trofeos).reduce(function (acc, k) {
    return acc + (trofeos[k] || 0);
  }, 0);
  return { partidos: partidos, goles: goles, asistencias: asistencias, titulos: titulos };
}

// ============================================================
//  HELPERS DE CANVAS
// ============================================================

// Rectángulo redondeado.
function cartaRectRedondeado(ctx, x, y, w, h, r) {
  const radio = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.arcTo(x + w, y, x + w, y + h, radio);
  ctx.arcTo(x + w, y + h, x, y + h, radio);
  ctx.arcTo(x, y + h, x, y, radio);
  ctx.arcTo(x, y, x + w, y, radio);
  ctx.closePath();
}

// Ajusta el tamaño de fuente para que el texto entre en maxWidth.
function cartaAjustarTexto(ctx, texto, maxWidth, tamanoInicial) {
  let tam = tamanoInicial;
  do {
    ctx.font = "bold " + tam + "px 'Segoe UI', system-ui, sans-serif";
    if (ctx.measureText(texto).width <= maxWidth) break;
    tam -= 2;
  } while (tam > 12);
  return tam;
}

// Carga una imagen y resuelve a null si falla o no existe.
// Las fotos subidas (dataURL), los escudos y las banderas son del
// mismo origen: no ensucian el canvas, así que toDataURL funciona.
function cartaCargarImagen(src) {
  if (!src || typeof Image === "undefined") return Promise.resolve(null);
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = src;
  });
}

// ============================================================
//  DIBUJO
// ============================================================

// Degradado de fondo + marco + brillo diagonal tipo "foil".
function cartaFondo(ctx, paleta) {
  const W = CONFIG.CARTA.ANCHO, H = CONFIG.CARTA.ALTO;

  const fondo = ctx.createLinearGradient(0, 0, W * 0.6, H);
  fondo.addColorStop(0, paleta.fondo[0]);
  fondo.addColorStop(0.55, paleta.fondo[1]);
  fondo.addColorStop(1, paleta.fondo[2]);
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  const brillo = ctx.createLinearGradient(0, H, W, 0);
  brillo.addColorStop(0, "rgba(255,255,255,0)");
  brillo.addColorStop(0.45, paleta.brillo);
  brillo.addColorStop(0.6, "rgba(255,255,255,0)");
  ctx.fillStyle = brillo;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  ctx.strokeStyle = paleta.marco;
  ctx.lineWidth = 14;
  cartaRectRedondeado(ctx, 20, 20, W - 40, H - 40, 46);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 4;
  cartaRectRedondeado(ctx, 40, 40, W - 80, H - 80, 32);
  ctx.stroke();
}

// Retrato recortado en círculo (con fallback si no hay imagen).
function cartaFoto(ctx, img, cx, cy, radio) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radio, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (img && img.naturalWidth > 0) {
    // "cover": recorta al cuadrado sin deformar la imagen.
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - lado) / 2;
    const sy = (img.naturalHeight - lado) / 2;
    ctx.drawImage(img, sx, sy, lado, lado, cx - radio, cy - radio, radio * 2, radio * 2);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(cx - radio, cy - radio, radio * 2, radio * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold " + Math.round(radio * 0.9) + "px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚽", cx, cy);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, radio, 0, Math.PI * 2);
  ctx.stroke();
}

// Escudo del club en la esquina inferior izquierda de la foto.
function cartaEscudo(ctx, img) {
  if (!img || !img.naturalWidth) return;
  ctx.drawImage(img, 80, 810, 120, 120);
}

// Bandera de la selección en la esquina inferior derecha.
function cartaBandera(ctx, img) {
  if (!img || !img.naturalWidth) return;
  const W = 110, H = 82;
  const x = CONFIG.CARTA.ANCHO - 80 - W, y = 828;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  cartaRectRedondeado(ctx, x - 5, y - 5, W + 10, H + 10, 12);
  ctx.fill();
  ctx.clip();
  ctx.drawImage(img, x, y, W, H);
  ctx.restore();
}

// OVR gigante, posición y nombre de la rareza.
function cartaCabecera(ctx, paleta, media, posicion) {
  const W = CONFIG.CARTA.ANCHO;
  const rareza = rarezaCarta(media);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = paleta.ovr;
  ctx.font = "bold 200px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(String(media), 60, 250);
  ctx.font = "bold 60px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(posicion, 64, 315);

  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  const nombreRareza = t(rareza.clave).toUpperCase();
  cartaAjustarTexto(ctx, nombreRareza, W - 200, 54);
  ctx.fillText(nombreRareza, W - 60, 105);
}

// Nombre del jugador en mayúsculas.
function cartaNombre(ctx, nombre) {
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  const texto = (nombre || "JUGADOR").toUpperCase();
  cartaAjustarTexto(ctx, texto, CONFIG.CARTA.ANCHO - 200, 76);
  ctx.fillText(texto, CONFIG.CARTA.ANCHO / 2, 1010);
}

// Grilla de 6 atributos (3 columnas x 2 filas).
function cartaAtributos(ctx, atributos) {
  if (!atributos.length) return;
  const W = CONFIG.CARTA.ANCHO;
  const cols = 3;
  const anchoCelda = 250, altoCelda = 118, gap = 26;
  const totalAncho = cols * anchoCelda + (cols - 1) * gap;
  const x0 = (W - totalAncho) / 2;
  const y0 = 1040;

  atributos.forEach(function (at, i) {
    const col = i % cols;
    const fila = Math.floor(i / cols);
    const x = x0 + col * (anchoCelda + gap);
    const y = y0 + fila * (altoCelda + gap);
    const cx = x + anchoCelda / 2;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    cartaRectRedondeado(ctx, x, y, anchoCelda, altoCelda, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 58px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(String(at.valor), cx, y + altoCelda / 2 - 14);
    ctx.font = "bold 26px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(at.abrev, cx, y + altoCelda - 24);
    ctx.restore();
  });
}

// Pie con estadísticas de carrera, títulos, dorsal y club.
function cartaPie(ctx, totales, dorsal, clubNombre) {
  const W = CONFIG.CARTA.ANCHO;
  const y = 1300;

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "bold 40px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(t("cartaEstadisticas") + ": " + totales.partidos + " PJ · " +
    totales.goles + " G · " + totales.asistencias + " A", 80, y);

  ctx.textAlign = "right";
  ctx.fillStyle = "#ffe9a8";
  ctx.fillText("🏆 " + totales.titulos, W - 80, y);

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "30px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("#" + (dorsal || "?") + " · " + (clubNombre || ""), 80, y + 56);
}

// Pinta todo en un solo paso, ya cargadas las imágenes (así el
// retrato nunca queda por encima de los textos).
function pintarCarta(ctx, imgs) {
  const cfg = CONFIG.CARTA;
  const paleta = cfg.PALETAS[rarezaCarta(jugador.media).id];

  cartaFondo(ctx, paleta);
  cartaFoto(ctx, imgs.retrato, cfg.ANCHO / 2, 520, 250);
  cartaEscudo(ctx, imgs.escudo);
  cartaBandera(ctx, imgs.bandera);
  cartaCabecera(ctx, paleta, jugador.media, jugador.posicion);
  cartaNombre(ctx, jugador.nombre);
  cartaAtributos(ctx, atributosCarta());
  cartaPie(ctx, totalesCarta(),
    (jugador.dorsal != null) ? jugador.dorsal : "",
    jugador.clubActual ? jugador.clubActual.nombre : "");
}

// Prepara el canvas y pinta la carta cuando las imágenes están listas.
function dibujarCarta() {
  const canvas = document.getElementById("carta-canvas");
  if (!canvas) return;
  const cfg = CONFIG.CARTA;
  canvas.width = cfg.ANCHO;
  canvas.height = cfg.ALTO;
  const ctx = canvas.getContext("2d");

  // Retrato: foto subida > avatar elegido > fallback.
  let fuente = estadoCarta.fotoDataUrl;
  if (!fuente && estadoCarta.avatarId) {
    const av = cfg.AVATARES.find(function (a) { return a.id === estadoCarta.avatarId; });
    if (av) fuente = av.src;
  }

  Promise.all([
    cartaCargarImagen(fuente),
    cartaCargarImagen(jugador.clubActual ? jugador.clubActual.imagen : ""),
    cartaCargarImagen(rutaBandera(jugador.nacionalidad))
  ]).then(function (imgs) {
    pintarCarta(ctx, { retrato: imgs[0], escudo: imgs[1], bandera: imgs[2] });
  });
}

// ============================================================
//  INTERACCIÓN DEL MODAL
// ============================================================

let modalCartaInstance = null;

function obtenerModalCarta() {
  const el = document.getElementById("modalCarta");
  if (!el) return null;
  if (!modalCartaInstance && typeof bootstrap !== "undefined") {
    modalCartaInstance = new bootstrap.Modal(el);
  }
  return modalCartaInstance;
}

// Abre el modal y pinta la carta con el estado actual.
function abrirModalCarta() {
  if (typeof jugador === "undefined" || !jugador || !jugador.carreraTerminada) return;
  pintarSelectorAvataresCarta();
  dibujarCarta();
  const modal = obtenerModalCarta();
  if (modal) modal.show();
}

// Pinta la galería de avatares incluidos en el juego.
function pintarSelectorAvataresCarta() {
  const cont = document.getElementById("carta-avatares");
  if (!cont) return;
  cont.innerHTML = "";
  CONFIG.CARTA.AVATARES.forEach(function (av) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "carta-avatar" + (estadoCarta.avatarId === av.id ? " activo" : "");
    btn.setAttribute("data-avatar", av.id);
    btn.title = av.etiqueta;
    btn.innerHTML = '<img src="' + av.src + '" alt="' + av.etiqueta + '">';
    btn.addEventListener("click", function () {
      estadoCarta.avatarId = av.id;
      estadoCarta.fotoDataUrl = null;
      pintarSelectorAvataresCarta();
      dibujarCarta();
    });
    cont.appendChild(btn);
  });
}

// Al elegir un archivo se lee como dataURL y se redibuja.
function onFotoCartaSeleccionada(evento) {
  const archivo = evento.target.files && evento.target.files[0];
  if (!archivo) return;
  if (archivo.type && archivo.type.indexOf("image/") !== 0) {
    mostrarNotificacion(t("cartaTitulo"), t("cartaErrorTipo"));
    return;
  }
  const lector = new FileReader();
  lector.onload = function () {
    estadoCarta.fotoDataUrl = lector.result;
    estadoCarta.avatarId = null;
    pintarSelectorAvataresCarta();
    dibujarCarta();
  };
  lector.readAsDataURL(archivo);
}

// Descarga el canvas como PNG.
function descargarCarta() {
  const canvas = document.getElementById("carta-canvas");
  if (!canvas) return;
  try {
    const enlace = document.createElement("a");
    const nombre = (jugador.nombre || "jugador").toLowerCase().replace(/\s+/g, "-");
    enlace.download = "carta-" + nombre + ".png";
    enlace.href = canvas.toDataURL("image/png");
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  } catch (e) {
    mostrarNotificacion(t("cartaTitulo"), t("cartaErrorDescarga"));
  }
}

// ============================================================
//  HOOK DEL RETIRO
// ============================================================

const _finalizarCarreraCartaBase = finalizarCarrera;
finalizarCarrera = function () {
  _finalizarCarreraCartaBase();
  estadoCarta = { fotoDataUrl: null, avatarId: null };
  actualizarBotonCarta();
};

// Muestra u oculta el botón según el estado de la carrera: la carta
// solo existe cuando la carrera terminó.
function actualizarBotonCarta() {
  const btn = document.getElementById("btn-crear-carta");
  if (!btn) return;
  const listo = (typeof jugador !== "undefined" && jugador && jugador.carreraTerminada);
  btn.classList.toggle("hidden", !listo);
  btn.disabled = !listo;
}

const _actualizarInterfazCartaBase = actualizarInterfaz;
actualizarInterfaz = function () {
  _actualizarInterfazCartaBase();
  actualizarBotonCarta();
};