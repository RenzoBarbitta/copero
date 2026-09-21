// ====================================================================
// PROGRESIÓN POR ATRIBUTOS (SISTEMA SEPARADO DE ENTRENAMIENTO)
// - 6 atributos por posición (campo / arquero), escala 0-99.
// - OVR = media ponderada de los atributos según la posición.
// - ENTRENAMIENTO: el jugador elige el atributo y ve el progreso
//   (atributo + OVR antes/después), 1 vez por temporada.
// - EVENTO: el juego reparte el cambio en atributos ocultos; el
//   usuario solo ve la variación de MEDIA.
// - Guardados viejos (sin atributos) se migran con el OVR actual.
// Se carga entre data.js y app.js. Usa CONFIG.PROGRESION si existe.
// ====================================================================

(() => {
  const cfg = () => (typeof CONFIG !== "undefined" && CONFIG.PROGRESION) || {};

  const FALLBACK = {
    ATRIBUTOS_CAMPO: ["VEL", "PAS", "REM", "DEF", "REG", "RES"],
    ATRIBUTOS_ARQUERO: ["REF", "PAS", "DEF", "REG", "MAN", "SAL"],
    NOMBRES_ATRIBUTOS: {
      VEL: "Velocidad", PAS: "Pase", REM: "Remate", DEF: "Defensa",
      REG: "Regate", RES: "Resistencia", REF: "Reflejos",
      MAN: "Mano a Mano", SAL: "Salidas"
    },
    PESOS: {
      DEL: { VEL: 0.15, PAS: 0.15, REM: 0.30, DEF: 0.10, REG: 0.20, RES: 0.10 },
      CM:  { VEL: 0.15, PAS: 0.25, REM: 0.20, DEF: 0.10, REG: 0.20, RES: 0.10 },
      DEF: { VEL: 0.12, PAS: 0.15, REM: 0.08, DEF: 0.30, REG: 0.15, RES: 0.20 },
      GK:  { REF: 0.25, PAS: 0.15, DEF: 0.25, REG: 0.10, MAN: 0.15, SAL: 0.10 }
    },
    BASE: {
      DEL: { VEL: 62, PAS: 60, REM: 70, DEF: 58, REG: 68, RES: 62 },
      CM:  { VEL: 60, PAS: 70, REM: 62, DEF: 58, REG: 68, RES: 62 },
      DEF: { VEL: 60, PAS: 62, REM: 55, DEF: 72, REG: 60, RES: 68 },
      GK:  { REF: 68, PAS: 58, DEF: 68, REG: 56, MAN: 68, SAL: 60 }
    }
  };

  function atributosDePosicion(posicion) {
    const c = cfg();
    if (posicion === "GK") return c.ATRIBUTOS_ARQUERO || FALLBACK.ATRIBUTOS_ARQUERO;
    return c.ATRIBUTOS_CAMPO || FALLBACK.ATRIBUTOS_CAMPO;
  }

  function pesosDePosicion(posicion) {
    const c = cfg();
    return (c.PESOS && c.PESOS[posicion]) || FALLBACK.PESOS[posicion] || FALLBACK.PESOS.CM;
  }

  function baseDePosicion(posicion) {
    const c = cfg();
    return (c.BASE && c.BASE[posicion]) || FALLBACK.BASE[posicion] || FALLBACK.BASE.CM;
  }

  function nombreAtributo(attr) {
    const c = cfg();
    return (c.NOMBRES_ATRIBUTOS && c.NOMBRES_ATRIBUTOS[attr]) || (FALLBACK.NOMBRES_ATRIBUTOS[attr] || attr);
  }

  // MEDIA PONDERADA = OVR derivado de los atributos (0-99)
  function calcularOVR(atributos, posicion) {
    if (!atributos) return 0;
    const pesos = pesosDePosicion(posicion);
    const claves = Object.keys(pesos);
    let suma = 0;
    for (const k of claves) {
      suma += (atributos[k] || 0) * pesos[k];
    }
    return Math.round(suma);
  }

  function obtenerFactorDificultad(valor) {
    const c = cfg();
    const rangos = c.DIFICULTAD_RANGOS || [
      { hasta: 59, factor: 1.0 },
      { hasta: 69, factor: 0.85 },
      { hasta: 79, factor: 0.70 },
      { hasta: 89, factor: 0.50 },
      { hasta: 94, factor: 0.30 },
      { hasta: 98, factor: 0.15 }
    ];
    for (const rango of rangos) {
      if (valor <= rango.hasta) return rango.factor;
    }
    return 0.10;
  }

  function limites() {
    const c = cfg();
    return { min: c.ATR_MIN != null ? c.ATR_MIN : 20, max: c.ATR_MAX != null ? c.ATR_MAX : 99 };
  }

  function clampAtributo(valor) {
    const l = limites();
    return Math.max(l.min, Math.min(l.max, valor));
  }

  // Ajusta atributos al azar hasta alcanzar el OVR objetivo.
  // Devuelve el OVR final obtenido (float sin redondear para depurar).
  function ajustarHacia(atributos, posicion, ovrObjetivo, pasosMax) {
    const claves = Object.keys(pesosDePosicion(posicion));
    const l = limites();
    let iter = 0;
    const maxIters = pasosMax || 2000;
    while (iter < maxIters) {
      const actual = calcularOVR(atributos, posicion);
      const diff = ovrObjetivo - actual;
      if (diff === 0) break;
      const k = claves[Math.floor(Math.random() * claves.length)];
      const v = atributos[k] || 0;
      if (diff > 0 && v < l.max) {
        atributos[k] = v + 1;
      } else if (diff < 0 && v > l.min) {
        atributos[k] = v - 1;
      }
      iter++;
    }
    return calcularOVR(atributos, posicion);
  }

  // Genera atributos iniciales coherentes: OVR exacto 65 (normal)
  // o 75 (promesa), con un perfil acorde a la posición.
  function generarAtributosIniciales(posicion, esPromesa) {
    const pos = posicion || "CM";
    const base = baseDePosicion(pos);
    const claves = Object.keys(base);
    const c = cfg();
    const objetivo = esPromesa
      ? (c.OVR_INICIAL_PROMESA != null ? c.OVR_INICIAL_PROMESA : 75)
      : (c.OVR_INICIAL_NORMAL != null ? c.OVR_INICIAL_NORMAL : 65);

    const attrs = {};
    for (const k of claves) {
      const variacion = Math.floor(Math.random() * 9) - 4;
      attrs[k] = clampAtributo(base[k] + variacion);
    }
    ajustarHacia(attrs, pos, objetivo, 2000);
    return attrs;
  }

  // Migración de guardados antiguos: genera atributos para un OVR dado.
  function generarAtributosConOVR(posicion, ovrObjetivo) {
    const base = generarAtributosIniciales(posicion || "CM", false);
    const target = Math.max(0, Math.min(99, ovrObjetivo || 65));
    ajustarHacia(base, posicion || "CM", target, 2000);
    return base;
  }

  // ENTRENAMIENTO VISIBLE: sube el atributo elegido +1/+2/+3 según
  // probabilidad base y dificultad por rango. No modifica otros.
  function entrenarAtributo(atributos, attrName, posicion, rand) {
    const pos = posicion || "CM";
    const alea = rand || Math.random;
    const crearFallo = (motivo) => ({
      exitoso: false,
      motivo: motivo,
      atributo: attrName,
      delta: 0,
      nuevoValor: atributos ? (atributos[attrName] != null ? atributos[attrName] : null) : null,
      ovrAntes: atributos ? calcularOVR(atributos, pos) : 0,
      ovrDespues: atributos ? calcularOVR(atributos, pos) : 0
    });

    if (!atributos || atributos[attrName] === undefined) {
      return crearFallo("atributo_invalido");
    }
    const l = limites();
    const actual = atributos[attrName];
    if (actual >= l.max) return crearFallo("techo");

    const ovrAntes = calcularOVR(atributos, pos);
    const factor = obtenerFactorDificultad(actual);
    const c = cfg();
    const prob = c.PROB_SUBIDA || [0.72, 0.22, 0.06];
    const randVal = alea();
    const p1 = prob[0] * factor;
    const p2 = (prob[0] + prob[1]) * factor;
    const p3 = (prob[0] + prob[1] + prob[2]) * factor;

    let incremento = 0;
    if (randVal < p1) incremento = 1;
    else if (randVal < p2) incremento = 2;
    else if (randVal < p3) incremento = 3;

    if (incremento === 0) return crearFallo("sin_progreso");

    const nuevo = Math.min(l.max, actual + incremento);
    const delta = nuevo - actual;
    if (delta <= 0) return crearFallo("techo");

    atributos[attrName] = nuevo;
    return {
      exitoso: true,
      motivo: "ok",
      atributo: attrName,
      delta: delta,
      nuevoValor: nuevo,
      ovrAntes: ovrAntes,
      ovrDespues: calcularOVR(atributos, pos)
    };
  }

  // EVENTO OCULTO: reparte el delta de media en atributos al azar
  // sin mostrar cuáles. Devuelve el nuevo OVR calculado.
  function aplicarCambioMediaOculto(atributos, posicion, deltaMedia) {
    if (!atributos) return deltaMedia != null ? deltaMedia : 0;
    const pos = posicion || "CM";
    const objetivo = clampAtributoOVR(calcularOVR(atributos, pos) + (deltaMedia || 0));
    ajustarHacia(atributos, pos, objetivo, 2000);
    return clampAtributoOVR(calcularOVR(atributos, pos));
  }

  function clampAtributoOVR(valor) {
    if (typeof CONFIG === "undefined" || !CONFIG || CONFIG.OVR_MIN == null) return valor;
    return Math.max(CONFIG.OVR_MIN, Math.min(CONFIG.OVR_MAX, valor));
  }

  // Exportar para el resto del juego (consola + tests).
  window.ATRIBUTOS_CAMPO = atributosDePosicion("DEL");
  window.ATRIBUTOS_ARQUERO = atributosDePosicion("GK");
  window.NOMBRES_ATRIBUTOS = (cfg().NOMBRES_ATRIBUTOS || FALLBACK.NOMBRES_ATRIBUTOS);
  window.PESOS_ATRIBUTOS = (cfg().PESOS || FALLBACK.PESOS);
  window.atributosDePosicion = atributosDePosicion;
  window.nombreAtributo = nombreAtributo;
  window.calcularOVR = calcularOVR;
  window.generarAtributosIniciales = generarAtributosIniciales;
  window.generarAtributosConOVR = generarAtributosConOVR;
  window.entrenarAtributo = entrenarAtributo;
  window.entrenarAtributoConDado = function(atributos, attrName, posicion, rand) {
    return entrenarAtributo(atributos, attrName, posicion, rand);
  };
  window.aplicarCambioMediaOculto = aplicarCambioMediaOculto;
})();