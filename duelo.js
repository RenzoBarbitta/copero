// ============================================================
//  DUELO 1v1 ONLINE - "Duelo de Carreras" (duelo.js)
//  V2 - Carrera PSO
//
//  Dos usuarios juegan en simultaneo una carrera profesional
//  de 10 temporadas. Se sincronizan con Supabase Realtime
//  Broadcast (WebSockets). ES OBLIGATORIO TENER USUARIO (sesion
//  de Supabase) para jugar.
//
//  Estructura:
//   - Parte 1: logica pura (testeable sin DOM) -> window.CoperoDueloLogica
//   - Parte 2: lobby, HUD, fases, El Clasico y retiro.
//
//  Se carga DESPUES de data.js, app.js, features.js, cuenta-api.js
//  y cuenta-ui.js. Requiere el SDK de supabase-js (CDN).
// ============================================================

(function() {
  "use strict";

  // ============================================================
  //  PARTE 1: CONFIGURACION Y LOGICA PURA (sin DOM)
  // ============================================================

  const DUELO_CFG = (typeof CONFIG !== "undefined" && CONFIG.DUELO) || {
    TEMPORADAS: 10,
    TIMER_MS: 10000,
    TANDA_PENALES: 3,
    BONUS_OVR_CLASICO: 1,
    BONUS_MORAL_CLASICO: 20,
    PUNTOS_RIVALIDAD_CLASICO: 150,
    EDAD_INICIO: 22
  };

  // 6 zonas del arco: Arriba Izq/Centro/Der y Abajo Izq/Centro/Der
  const DUELO_ZONAS = ["AI", "AC", "AD", "BI", "BC", "BD"];
  const DUELO_ZONA_TXT = {
    AI: "⬆️ Arriba Izquierda", AC: "⬆️ Arriba Centro", AD: "⬆️ Arriba Derecha",
    BI: "⬇️ Abajo Izquierda", BC: "⬇️ Abajo Centro", BD: "⬇️ Abajo Derecha"
  };
  const DUELO_ZONA_POS = {
    AI: { f: 0, c: 0 }, AC: { f: 0, c: 1 }, AD: { f: 0, c: 2 },
    BI: { f: 1, c: 0 }, BC: { f: 1, c: 1 }, BD: { f: 1, c: 2 }
  };

  function distZonas(z1, z2) {
    const a = DUELO_ZONA_POS[z1], b = DUELO_ZONA_POS[z2];
    return Math.abs(a.f - b.f) + Math.abs(a.c - b.c);
  }

  // Fórmula exacta del ganador absoluto del duelo:
  // Puntaje = (OVR_Max * 15) + (OVR_Promedio * 10) + (Goles * 2)
  //         + (Asistencias * 1) + (Victorias_Classicos_1v1 * 100)
  function calcularPuntajeDuelo(s) {
    return Math.round(
      (s.ovrMax || 0) * 15 +
      (s.ovrProm || 0) * 10 +
      (s.goles || 0) * 2 +
      (s.asistencias || 0) * 1 +
      (s.clasicos || 0) * 100
    );
  }

  // Influencia del OVR: mayor media = barra de potencia MAS LENTA (% por
  // segundo) y arquero con mas rango de tolerancia.
  function velocidadBarraDuelo(ovr) {
    return 90 + (99 - Math.min(99, ovr)) * 1.2; // %/s: OVR 99 -> 90, OVR 55 -> ~136
  }
  function margenPotenciaDuelo(ovr) {
    return 8 + (Math.min(99, ovr) - 60) * 0.45; // tolerancia del pateador
  }

  // Resolucion deterministica del DUELO DE REFLEJOS (1v1 directo, sin arco).
  // Cada lado aporta su tiempo de reaccion en ms y si hizo foul (click anticipado).
  // Gana el menor tiempo valido; foul = derrota salvo doble foul (empate).
  // Sin respuesta (timeout) se representa con ms=9999.
  function resolverReflejoDuelo(msYo, foulYo, msRiv, foulRiv) {
    if (foulYo && foulRiv) return { r: "empate", t: "Doble salida en falso: nadie gana" };
    if (foulYo) return { r: "pierde", t: "Salida en falso: tocaste antes del ¡YA!" };
    if (foulRiv) return { r: "gana", t: "El rival se adelantó: victoria por foul" };
    if (msYo === msRiv) return { r: "empate", t: "Mismo tiempo de reacción" };
    if (msYo < msRiv) return { r: "gana", t: "Reflejo más rápido" };
    return { r: "pierde", t: "El rival reaccionó antes" };
  }

  // Resolucion deterministica de un penal. Ambos clientes computan
  // EXACTAMENTE el mismo resultado con los mismos datos.
  // potencia: 0-100 (ideal ~65), zonaTiro/zonaArquero: clave de DUELO_ZONAS.
  function resolverPenalDuelo(zonaTiro, potencia, zonaArquero, ovrPateador, ovrArquero) {
    const dif = distZonas(zonaTiro, zonaArquero);
    const desvio = Math.abs(potencia - 65);
    const margen = margenPotenciaDuelo(ovrPateador);
    if (dif === 0) {
      // El arquero adivino la zona: solo un tiro perfecto entra por el angulo.
      if (desvio <= 3) return { r: "gol", t: "La metio por el angulo pese al arquero" };
      return { r: "atajado", t: "El arquero adivino la zona" };
    }
    if (dif === 1) {
      // Zona adyacente: ataja si el tiro salio mal potenciado o si su OVR
      // es claramente superior (rango de tolerancia del arquero).
      if (desvio > margen) return { r: "atajado", t: "Tiro mordido: el arquero la saca" };
      if (ovrArquero >= ovrPateador + 10 && desvio > 5) {
        return { r: "atajado", t: "El arquero, de mayor nivel, llego a rozarla" };
      }
      return { r: "gol", t: "El arquero volo a otra zona" };
    }
    // Zona lejana: gol, salvo una potencia muy desviada (afuera).
    if (desvio > margen * 2) return { r: "afuera", t: "Se le fue la potencia: tiro afuera" };
    return { r: "gol", t: "El arquero fue a otra zona" };
  }

  // Simulacion de una temporada del duelo (misma mecanica que la carrera
  // individual: partidos/goles/asist segun posicion y rendimiento).
  function simularTemporadaDuelo(j, rand) {
    rand = rand || Math.random;
    const rep = (j.club && j.club.reputacion) || 5;
    const reglas = (typeof REGLAS_MEDIA !== "undefined" && REGLAS_MEDIA[rep]) || 99;
    const diferenciaNivel = j.ovr - rep * 10;

    const partidosBase = 25 + Math.floor(diferenciaNivel / 5);
    const partidos = Math.min(38, Math.max(12, partidosBase + Math.floor(rand() * 5)));
    let factor = Math.min(1.6, Math.max(0.5, 1 + diferenciaNivel / 50));
    // La moral influye levemente en el rendimiento
    factor *= 0.85 + (j.moral / 100) * 0.3;

    let goles = 0, asistencias = 0;
    if (j.posicion === "DEL") {
      goles = Math.floor((j.ovr / 100) * partidos * (rand() * 0.5 + 0.3) * factor);
      asistencias = Math.floor((j.ovr / 100) * partidos * (rand() * 0.25) * factor);
    } else if (j.posicion === "CM") {
      goles = Math.floor((j.ovr / 100) * partidos * (rand() * 0.2) * factor);
      asistencias = Math.floor((j.ovr / 100) * partidos * (rand() * 0.4 + 0.2) * factor);
    } else if (j.posicion === "DEF") {
      goles = Math.floor(rand() * 3 * factor);
      asistencias = Math.floor(rand() * 5 * factor);
    } else {
      goles = 0;
      asistencias = Math.floor(rand() * 2);
    }

    let subida = 0;
    const participaciones = goles + asistencias;
    if (j.posicion === "DEL" && participaciones >= 12) subida = Math.floor(rand() * 3) + 1;
    else if (j.posicion === "CM" && participaciones >= 8) subida = Math.floor(rand() * 3) + 1;
    else if (j.posicion === "DEF" && partidos >= 25) subida = Math.floor(rand() * 2) + 1;
    else if (j.posicion === "GK" && partidos >= 28) subida = Math.floor(rand() * 2) + 1;
    if (subida > 0 && j.ovr >= reglas) subida = 0;

    // Trofeos por probabilidad (como la carrera individual, sin finales interactivas)
    const trofeos = [];
    const esPrimera = rep > 5;
    if (!esPrimera) {
      if (rand() < (rep / 5) * 0.20 + (j.ovr / 100) * 0.10) trofeos.push("🏆 Segunda División");
      if (rand() < 0.10 + (j.ovr / 100) * 0.08) trofeos.push("🍷 Copa Apa");
    } else {
      if (rand() < ((rep - 5) / 5) * 0.25 + (j.ovr / 100) * 0.08) trofeos.push("🏆 Primera División");
      if (rand() < 0.08 + (rep / 10) * 0.10 + (j.ovr / 100) * 0.05) trofeos.push("🇦🇷 Copa Argentina");
      if (rand() < 0.05 + (j.ovr / 100) * 0.04) trofeos.push("👑 Copa de Campeones");
    }

    return { partidos, goles, asistencias, subida, trofeos };
  }

  function hashSemilla(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // Evento cruzado: MISMO evento para ambos, deterministico por semilla
  // (nombre de sala + temporada), sin depender del anfitrion.
    function elegirEventoDeterminista(semillaStr, usados) {
    let pool = DUELO_EVENTOS_POOL.filter(function(e) { return (usados || []).indexOf(e) === -1; });
    if (pool.length === 0) pool = DUELO_EVENTOS_POOL.slice();
    return pool[hashSemilla(semillaStr) % pool.length];
  }

  // Semilla determinista por sala + temporada. Ambos clientes calculan el
  // mismo valor, asi eligen el MISMO minijuego de temporada sin depender
  // del anfitrion.
  function semillaDeterministaDuelo(topic, temporada) {
    // Si el servidor registró la sala (006), la semilla la elige el SERVIDOR:
    // así el navegador no puede cambiarla para elegir un minijuego cómodo.
    // Sin registro (RPC no instalado) se conserva la fórmula de siempre.
    const servidor = (typeof dSesion !== "undefined" && dSesion && dSesion.semillaServidor)
      ? dSesion.semillaServidor : null;
    if (servidor) return hashSemilla(servidor + "|" + topic + "-minijuego-" + temporada);
    return hashSemilla((topic || "sala") + "-minijuego-" + temporada);
  }

  // ------------------------------------------------------------
  //  MATCHMAKING (BUSCAR PARTIDO): emparejamiento determinista.
  //  Dada la lista de jugadores esperando en la cola (id + ts de
  //  entrada), el par es SIEMPRE "los dos más antiguos": asi ambos
  //  miembros del par calculan la MISMA pareja y nadie se pierde.
  //  Devuelve null si hay menos de 2 jugadores o si yo no formo parte
  //  del par (entonces sigo esperando).
  // ------------------------------------------------------------
  function calcularParejaCola(presentes, miId) {
    const lista = (presentes || []).filter(function(p) {
      return p && p.id != null;
    }).sort(function(a, b) {
      const ta = a.ts || 0, tb = b.ts || 0;
      if (ta !== tb) return ta - tb;
      return String(a.id).localeCompare(String(b.id));
    });
    if (lista.length < 2) return null;
    const ids = [String(lista[0].id), String(lista[1].id)];
    if (ids.indexOf(String(miId)) === -1) return null;
    return { ids: ids };
  }

  // Sala privada determinista para una pareja: ambos calculan el MISMO
  // nombre y clave a partir de los dos ids ordenados, y se conectan con
  // la infraestructura de salas existente (conectarCanalDuelo).
  function salaAutomaticaDuelo(ids) {
    const ordenados = (ids || []).slice().sort();
    const semilla = ordenados.join("|");
    const hNombre = hashSemilla(semilla + "::sala").toString(16).slice(0, 6);
    const hClave = hashSemilla(semilla + "::clave").toString(16).slice(0, 6);
    return { nombre: "auto-" + hNombre, clave: "sala" + hClave };
  }

  // ============================================================
  //  EVENTOS CRUZADOS DEL DUELO
  //  Cada uno se resuelve LOCALMENTE con la eleccion propia; el
  //  sincronizado es solo la eleccion a ciegas (nadie ve la opcion
  //  del otro hasta que ambos enviaron).
  // ============================================================
  const DUELO_EVENTOS = {
    CERBE: {
      titulo: "Clubes Pro",
      texto: "Cerbe te pide que le tires un pase para convertir él.<br><br>¿Se lo tirás?",
      a: "⚽ Se la tirás", b: "🙅 No se la tirás",
      resolver: function(op, j) {
        if (op === "a") { j.ovr = Math.max(40, j.ovr - 1); return "⚽ Se la tiraste... lo dejaste SOLO frente al arco y Cerbe la erró el gol (-1 OVR)."; }
        j.moral = Math.max(0, j.moral - 15);
        return "🤣 No se la tiraste y Cerbe te metió en el Collage de caras (-15 de moral).";
      }
    },
    NERVA: {
      titulo: "Pelea de Wachines",
      texto: "Nerva se está peleando con Matias Fernandez.<br><br>¿Qué hacés?",
      a: "📱 Doxeás a los 2", b: "🤐 No hacés nada",
      resolver: function(op, j) {
        if (op === "a") { j.moral = Math.min(100, j.moral + 15); return "📽️ Doxeaste la pelea: filtraste la cara de ambos. Navarro te felicita (+15 de moral)."; }
        j.moral = Math.max(0, j.moral - 15);
        return "🙃 No hiciste nada y Nerva se reveló: filtró TU cara (-15 de moral).";
      }
    },
    NITTOX: {
      titulo: "Sargento Nittox",
      texto: "Nittox te quiere sacar el rol.<br><br>¿Volvés a jugar para defenderte?",
      a: "🎮 Volvés a jugar", b: "😴 No jugás más hasta que se le pase",
      resolver: function(op, j) {
        const rol = obtenerRol(j.ovr).nombre;
        if (rol !== "Promesa" && rol !== "Aspirante") {
          return "🪖 Nittox pasó de largo: tu rango actual no califica para el rol.";
        }
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 2); return "🔥 ¡La rompiste toda! Le cerraste el orto a Nittox (+2 OVR)."; }
          j.nittoxQuito = true;
          return "💀 Jugaste como el ojete. ¡A jugar mix Normal! (Perdés el rango esta temporada; la próxima podés recuperarlo).";
        }
        return "😴 No jugás más hasta que a Nittox se le pase. Sin consecuencias... esta vez.";
      }
    },
    KROSTY: {
      titulo: "Invitación rara",
      texto: "Krosty te invita a jugar a Hasbullitah.<br><br>¿Vas?",
      a: "✅ Vas con Krosty", b: "🚫 Rechazás",
      resolver: function(op, j) {
        if (op === "a") {
          const h = (typeof CLUBES !== "undefined") ? CLUBES.find(function(c) { return c.nombre === "Hasbullitah"; }) : null;
          if (h) j.club = h;
          return "🧔 Aceptaste la invitación rara: cambiaste de equipo a Hasbullitah.";
        }
        return "🚫 Rechazaste la invitación de Krosty. Hasbullitah sigue esperando.";
      }
    },
    PRIMOS: {
      titulo: "Primos",
      texto: "Benjita y Theo te dicen de ser primos.<br><br>¿Qué hacés?",
      a: "✋ Los mandás a cagar", b: "🤝 Aceptás",
      resolver: function(op, j) {
        if (op === "a") return "✋ Los mandaste a cagar a Benjita y a Theo. No pasa nada.";
        const b = (typeof CLUBES !== "undefined") ? CLUBES.find(function(c) { return c.nombre === "Bodo Glimt"; }) : null;
        if (b) j.club = b;
        return "🧑‍🤝‍🧑 Te hiciste tan amigo que te fuiste a BODO a jugar. ¡Cambio de club a Bodo Glimt!";
      }
    },
    SOSSA: {
      titulo: "Salida con Sossa",
      texto: "Sossa te invita a salir con la Popa a DORIAN previo al partido.<br><br>¿Aceptás salir?",
      a: "🍺 Salís con Sossa", b: "🏠 Te quedás en casa",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 4); return "🔥 Se picó en Dorian y rendiste más (+4 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 3);
          return "💥 Hubo bondi en Dorian, te cagaron a palo (-3 OVR).";
        }
        j.ovr = Math.max(40, j.ovr - 1);
        return "🏠 Te quedaste dormido y llegaste tarde (-1 OVR).";
      }
    },
    DNT: {
      titulo: "El Dicta",
      texto: "Dnt te invitó a jugar unos amis con CALA.<br><br>¿Aceptás?",
      a: "🎮 Aceptás", b: "🙈 No vas",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.4) { j.ovr = Math.min(99, j.ovr + 3); return "🧠 ¡Aprendiste el fútbol de CALA! (+3 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "🤬 El dicta te re cagó a puteadas, te fuiste con la moral baja (-2 OVR).";
        }
        return "🙈 No fuiste y seguiste con tu juego.";
      }
    },
    KOLT: {
      titulo: "Frío con Grasa",
      texto: "Kolt te invita un finde semana a su pueblo natal.<br><br>¿Vas?",
      a: "❄️ Vas con Kolt", b: "🧣 No vas",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.moral = Math.min(100, j.moral + 10); return "❄️ Gran finde con Kolt (+10 de moral)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "🥶 Te cagaste de frío y te enfermaste (-2 OVR).";
        }
        return "🧣 No fuiste y Zafaste del frío.";
      }
    },
    PIEDRA: {
      titulo: "Busco Piedra",
      texto: "Nico Piedra te invita a hacer un entreno con él para enseñarte a jugar de todas las posiciones.<br><br>¿Aceptás?",
      a: "🪨 Entrenás con Piedra", b: "🚶 Rechazás",
      resolver: function(op, j) {
        if (op === "a") { j.ovr = Math.min(99, j.ovr + 3); return "🪨 Aprendiste mucho de Piedra y mejoraste tu juego (+3 OVR)."; }
        j.ovr = Math.max(40, j.ovr - 2);
        return "🚶 Perdiste la oportunidad de aprender de Piedra (-2 OVR).";
      }
    },
    RICKY: {
      titulo: "Trucos de Ricky",
      texto: "Ricky Centurión te ofrece sus CHEATS.<br><br>¿Aceptas usarlos?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") { j.ovr = Math.min(99, j.ovr + 2); return "😈 Usaste los cheats de Ricky y rendís más (+2 OVR)... por ahora."; }
        j.ovr = Math.max(40, j.ovr - 2);
        return "Decidiste enfocarte y rechazaste la propuesta (-2 OVR).";
      }
    },
    BANDIDO: {
      titulo: "El Mágico",
      texto: "Bandido te invita un porro mágico antes de jugar.<br><br>¿Aceptas?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) return "¡Efecto mágico! Volás en la cancha.";
          j.ovr = Math.max(40, j.ovr - 1);
          return "Te cayó pesado y andás lento (Era Paraguayo) (-1 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    NACHO_LV: {
      titulo: "Entreno con Las Varillas",
      texto: "NachoLV te invita a hacer un entreno con Las Varillas.<br><br>¿Aceptas?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 4); return "¡Excelente entreno con las Varillas! (+4 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 3);
          return "Entreno cansador (-3 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    VALIEL: {
      titulo: "Promesa en MIX SA",
      texto: "Valiel te da la oportunidad de quedar como Aspirante tras unos partidos de prueba.<br><br>¿Aceptas jugarlas?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.4) { j.ovr = Math.min(99, j.ovr + 5); return "🔥 ¡Pasaste las pruebas de Valiel! (+5 OVR)."; }
          return "No lograste superar las pruebas de Valiel esta vez.";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    RANKEDS: {
      titulo: "Rankeds",
      texto: "Mojo te invita a jugar unas Rankeds del juego.<br><br>¿Qué decides hacer?",
      a: "✅ Aceptar rankeds", b: "❌ Jugar mix",
      resolver: function(op, j) {
        if (op === "a") { j.ovr = Math.max(40, j.ovr - 1); return "Sumas horas innecesarias por unas monedas y no mejoras (-1 OVR)."; }
        j.ovr = Math.min(99, j.ovr + 2);
        return "Utilizas tu tiempo para jugar mix (+2 OVR).";
      }
    },
    CHAGAS: {
      titulo: "Comer",
      texto: "Chagas te invita a una GRAN cena.<br><br>¿Aceptas ir a comer?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 2); return "¡La cena estuvo excelente y saludable! (+2 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "La comida te cayó bastante mal (-2 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    CASANA: {
      titulo: "Jugar IOSOCCER",
      texto: "Casana te invita a jugar IOSOCCER.<br><br>¿Aceptas la partida?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.4) { j.ovr = Math.min(99, j.ovr + 3); return "¡Jugar IOSOCCER te ayudó a mejorar en el PSO! (+3 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "Perdiste tiempo valioso jugando IOSOCCER (-2 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    BEKKU: {
      titulo: "Mix con Bekku",
      texto: "Bekku te pide jugar mas suelto la mix.<br><br>¿Aceptas?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 2); return "Bekku te ayuda a ganar la mix (+2 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "Bekku te trolea todo y pierden la mix y te comes 4adv (-2 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    CARNICERO: {
      titulo: "Carnicero de Neuquen",
      texto: "El Carnicero de Neuquén te invita a un asado.<br><br>¿Aceptas ir?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.4) { j.ovr = Math.min(99, j.ovr + 2); return "El Carnicero Neuquino te da una dieta a base de carne y mejoras (+2 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "La carne estaba toda vencida, te cayó mal (-2 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    KULONETA: {
      titulo: "Kuloneta",
      texto: "Kurona te invita a su server de discord, a cambio de algo...<br><br>¿Se lo das?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.moral = Math.min(100, j.moral + 15); return "🤝 Te haces amigo de ellos (+15 de moral)."; }
          j.moral = Math.max(0, j.moral - 15);
          return "😖 Salis traumado del discord (-15 de moral).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    MACHI: {
      titulo: "Giros",
      texto: "Te hablan de un jugador Machi que giraba mucho y te interesa probar su tecnica.<br><br>¿La practicas?",
      a: "✅ Practicar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 2); return "🌀 Aprendiste los giros de Machi (+2 OVR)."; }
          return "🙃 No servis para los giritos.";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    PIPITA: {
      titulo: "Titulos Pipa",
      texto: "Pipita te esta boqueando los titulos que tiene.<br><br>¿Que haces?",
      a: "🥊 Pegarle una piña", b: "😐 Dejarlo boquear",
      resolver: function(op, j) {
        if (op === "a") {
          j.moral = Math.min(100, j.moral + 15);
          if (Math.random() < 0.5) { j.ovr = Math.max(40, j.ovr - 3); return "🥊 ¡Le pegaste una PIÑA a Pipita! Te sube la moral (+15), pero te vieron y te sancionaron (-3 OVR)."; }
          return "🥊 ¡Le pegaste una PIÑA a Pipita! Nadie vio nada y te sentis un campeón (+15 de moral).";
        }
        return "😐 Te dejaste boquear con los títulos de Pipita. No pasa nada.";
      }
    },
    NOZ: {
      titulo: "Noz te invita",
      texto: "Noz te invita a salir previo al entrenamiento.<br><br>¿Aceptas?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 2); j.moral = Math.min(100, j.moral + 10); return "🍺 Buena salida con Noz: rendís más (+2 OVR, +10 moral)."; }
          j.ovr = Math.max(40, j.ovr - 2); j.moral = Math.max(0, j.moral - 10);
          return "😴 La salida con Noz te dejó fundido y rendís mal (-2 OVR, -10 moral).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    PYOJO: {
      titulo: "Salida a bar con Pyojo",
      texto: "Pyojo te invita a tomar un negroni con 2 rocas.<br><br>¿Aceptas?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 2); return "🍸 Salis re mamado y te bailas a todos (+2 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "🥴 Saliste todo quebrado y no te podes ni parar (-2 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    ORSINI: {
      titulo: "Paseo con Orsini",
      texto: "Orsini te pide que lo acompañes a buscar un frasco de flores.<br><br>¿Aceptas?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") return "🌼 Jugás unas mixs con Orsini. Ni bien ni mal, buena compañía.";
        return "Orsini te odia.";
      }
    },
    NICOBAILARIN: {
      titulo: "A Bailar con Nico",
      texto: "Nico Bailarin te invita a bailar un enganchado de Fer Palacio.<br><br>¿Te da?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 1); return "🕺 Mejoras tu movimiento de cadera y te ayuda a dribblear mejor (+1 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 1);
          return "💃 Salio mal el baile y te lastimaste (-1 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    RONNIE: {
      titulo: "Curso de Ronnie",
      texto: "Ronnie te vende un curso de 1337.<br><br>¿Lo compras?",
      a: "✅ Comprar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") { j.ovr = Math.min(99, j.ovr + 2); return "📚 Aprendes las habilidades de Ronnie y Flowy (+2 OVR)."; }
        return "Te llega un MD de Flowy diciendo que sos un fraca.";
      }
    },
    BAREIRO: {
      titulo: "Oferta Bareiro",
      texto: "Bareiro te invita a jugar en Argentinos Juniors.<br><br>¿Vas con el?",
      a: "✅ Ir", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          var ar = (typeof CLUBES !== "undefined") ? CLUBES.find(function(c) { return c.nombre === "Argentinos Juniors"; }) : null;
          if (ar) j.club = ar;
          return "🔴⚪ ¡Te vas a jugar a Argentinos Juniors con Bareiro! Cambio de club inmediato.";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    MUSA: {
      titulo: "El Establo de Musa",
      texto: "Musa te invita a su establo para que veas como entrena.<br><br>¿Aceptas?",
      a: "✅ Aceptar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") { j.ovr = Math.min(99, j.ovr + 1); return "🐴 Vas a entrenar con Musa (+1 OVR)."; }
        return "Te perdes las habilidades del CABA.";
      }
    },
    VIEJO: {
      titulo: "Viejo y Carita",
      texto: "Viejo y Carita te invitan a jugar al Dark Souls.<br><br>¿Jugas con ellos?",
      a: "✅ Jugar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 1); return "🎮 Incrementan tus habilidades (+1 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "⏳ Perdiste tiempo al pedo (-2 OVR).";
        }
        return "Carita te bloqueo de todos lados.";
      }
    },
    PISA: {
      titulo: "Pase Pisa",
      texto: "Pisa te enseña a tirar su pase especial.<br><br>¿Lo aprendes?",
      a: "✅ Aprender", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 2); return "🎯 Mejoras tu habilidad de Pase (+2 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "😈 Te putea todo Impalare y te doxean (-2 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    PERUANOS: {
      titulo: "Peruanos",
      texto: "Strahl y Cubarsi te invitan a Peru, pero tendrias que jugar un partido desde ahi.<br><br>¿Vas?",
      a: "✅ Ir", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 2); return "🇵🇪 Ganas el ofi desde Peru, nada te para (+2 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 1);
          return "📡 El ping te mato y perdieron (-1 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    PUSKAS: {
      titulo: "Componentes Puskas",
      texto: "Puskas te ofrece sus componentes.<br><br>¿Los compras?",
      a: "✅ Comprar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.5) { j.ovr = Math.min(99, j.ovr + 3); return "🖥️ Mejoras mucho gracias a los componentes (+3 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 3);
          return "🔧 Estaban rotos y dejaste de jugar por un tiempo (-3 OVR).";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    GLIZZI: {
      titulo: "Aprendes(?) con Glizzi",
      texto: "Glizzi te quiere enseñar a jugar.<br><br>¿Practicas con el?",
      a: "✅ Practicar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") { j.ovr = Math.min(99, j.ovr + 1); return "😄 Vos le enseñaste a él al final (+1 OVR)."; }
        return "No te perdiste de nada.";
      }
    },
    PASO: {
      titulo: "Terraria",
      texto: "Paso te invita a jugar a Terraria con Marabola.<br><br>¿Jugas con ellos?",
      a: "✅ Jugar", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") { j.moral = Math.min(100, j.moral + 10); return "⛏️ Vas a jugar al Terraria con ellos. ¡HICISTE UNA BUENA ELECCION! (+10 de moral)."; }
        return "Marabola te odia.";
      }
    },
    MATUTE: {
      titulo: "Semillero Chaco",
      texto: "Matute te invita a su semillero Chaco For Ever.<br><br>¿Vas a jugar?",
      a: "✅ Ir", b: "❌ Rechazar",
      resolver: function(op, j) {
        if (op === "a") {
          var ch = (typeof CLUBES !== "undefined") ? CLUBES.find(function(c) { return c.nombre === "Chaco For Ever"; }) : null;
          if (ch) j.club = ch;
          return "🌰 Vas a jugar a Chaco For Ever. Equipo donde salieron grandes jugadores.";
        }
        return "Decidiste enfocarte y rechazaste la propuesta.";
      }
    },
    ACUSADO: {
      titulo: "Acusado de Cheats",
      texto: "Después de una mix en la que hiciste 4 goles, te están acusando de cheats.<br><br>Estás OBLIGADO a hacerte una SS.<br><br>No hay vueltas: te hacen el SS ahora mismo.",
      a: "🛡️ Hacerte la SS", b: "🛡️ Hacerte la SS",
      sinRechazo: true,
      resolver: function(op, j) {
        j.ovr = Math.max(40, j.ovr - 5);
        return "🚨 ¡DETECTADO! Te hicieron el SS y te sacaron 5 OVR por sospecha de hacks.";
      }
    },
    TAMBUPA: {
      titulo: "Futbol 5 con Tambupa",
      texto: "Tambupa te invita a jugar un futbol 5.<br><br>¿Aceptas?",
      a: "⚽ Aceptás", b: "🙅 Rechazás",
      resolver: function(op, j) {
        if (op === "a") {
          if (Math.random() < 0.6) { j.ovr = Math.min(99, j.ovr + 3); return "🔥 Te la pasaste bien en el 5 y mejoraste tu juego (+3 OVR)."; }
          j.ovr = Math.max(40, j.ovr - 2);
          return "🤕 Te lastigaste en el 5 y perdiste OVR (-2 OVR).";
        }
        return "🙅 Rechazaste la invitación de Tambupa. Continuaste con tu carrera.";
      }
    },
    COCCARO: {
      titulo: "Invitación por plata",
      texto: "Coccaro te invita a jugar a su equipo LAFERRERE a cambio de plata.<br><br>¿Aceptas?",
      a: "💰 Aceptás", b: "🙅 Rechazás",
      resolver: function(op, j) {
        if (op === "a") {
          var lf = (typeof CLUBES !== "undefined") ? CLUBES.find(function(c) { return c.nombre === "Laferrere"; }) : null;
          if (lf) j.club = lf;
          j.ovr = Math.max(40, j.ovr - 3);
          return "💰 Te fuiste por la guita: -3 OVR. Cambiaste a Laferrere.";
        }
        return "Gran elección. Seguís con tu club actual.";
      }
    }
  };

  var DUELO_EVENTOS_POOL = Object.keys(DUELO_EVENTOS);

  // API pura para tests
  window.CoperoDueloLogica = {
    DUELO_ZONAS: DUELO_ZONAS,
    DUELO_EVENTOS: DUELO_EVENTOS,
    DUELO_EVENTOS_POOL: DUELO_EVENTOS_POOL,
    distZonas: distZonas,
    calcularPuntajeDuelo: calcularPuntajeDuelo,
    velocidadBarraDuelo: velocidadBarraDuelo,
    margenPotenciaDuelo: margenPotenciaDuelo,
    resolverPenalDuelo: resolverPenalDuelo,
    resolverReflejoDuelo: resolverReflejoDuelo,
    simularTemporadaDuelo: simularTemporadaDuelo,
    elegirEventoDeterminista: elegirEventoDeterminista,
    hashSemilla: hashSemilla,
    semillaDeterministaDuelo: semillaDeterministaDuelo,
    calcularParejaCola: calcularParejaCola,
    salaAutomaticaDuelo: salaAutomaticaDuelo
  };

  // ============================================================
  //  PARTE 2: INTERFAZ Y SINCRONIZACION (requiere DOM)
  // ============================================================
  if (typeof document === "undefined") return;

  const PANTALLA = "pantalla-duelo";
  let dSesion = null; // conexion realtime de la sala
  let d = null;       // estado del duelo
  let dModal = null;
  let dTimers = [];   // intervalos/timeouts activos de la interfaz
  let dCola = null;   // estado de la cola de matchmaking (BUSCAR PARTIDO)
  const DUELO_COLA_TOPIC = "duelo:cola-online";

  // Icono SVG reutilizando el sistema de ui.js (si esta disponible).
  function icoDuelo(nombre, tam) {
    if (typeof iconoSVG === "function") return iconoSVG(nombre, tam || 18);
    return "";
  }

  // Traduccion corta reutilizando uiT (si esta disponible).
  function tDuelo(clave, fallback) {
    if (typeof uiT === "function") return uiT(clave, fallback);
    return fallback;
  }

  function limpiarTimersDuelo() {
    dTimers.forEach(function(t) { clearInterval(t); clearTimeout(t); });
    dTimers = [];
  }
  function enTarea(fn, ms) { const t = setTimeout(fn, ms); dTimers.push(t); return t; }
  function enIntervalo(fn, ms) { const t = setInterval(fn, ms); dTimers.push(t); return t; }

  function slugDuelo(txt) {
    return String(txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  }
  function escaparDuelo(txt) {
    return String(txt == null ? "" : txt).replace(/[&<>"']/g, function(c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function clubDeNombre(nombre) {
    return (typeof CLUBES !== "undefined" ? CLUBES.find(function(c) { return c.nombre === nombre; }) : null) || null;
  }
  function avatarIniciales(nombre) {
    const iniciales = String(nombre || "?").trim().split(/\s+/).map(function(p) { return p[0] || ""; }).join("").slice(0, 2).toUpperCase() || "?";
    return '<div class="duelo-avatar">' + escaparDuelo(iniciales) + "</div>";
  }
  function obtenerRolDuelo(ovr) {
    if (typeof obtenerRol === "function") return obtenerRol(ovr);
    return { nombre: "Normal", color: "#adb5bd", emoji: "⚽" };
  }

  function notifDuelo(titulo, html, cb) {
    if (typeof mostrarNotificacion === "function") { mostrarNotificacion(titulo, html, cb); return; }
    alert(titulo + "\n\n" + String(html).replace(/<[^>]+>/g, ""));
    if (cb) cb();
  }

  function asegurarModalDuelo() {
    if (dModal) return dModal;
    let el = document.getElementById("modalDuelo");
    if (!el) {
      el = document.createElement("div");
      el.className = "modal fade";
      el.id = "modalDuelo";
      el.tabIndex = -1;
      el.setAttribute("aria-hidden", "true");
      el.innerHTML =
        '<div class="modal-dialog modal-dialog-centered modal-lg">' +
        '<div class="modal-content card-custom border-warning">' +
        '<div class="modal-header border-bottom-0"><h5 class="modal-title w-100 fw-bold text-warning text-center" id="modalDueloTitulo"></h5></div>' +
        '<div class="modal-body text-center" id="modalDueloCuerpo"></div>' +
        '<div class="modal-footer border-top-0 justify-content-center pt-0" id="modalDueloFooter"></div>' +
        "</div></div>";
      document.body.appendChild(el);
    }
    dModal = new bootstrap.Modal(el, { backdrop: "static", keyboard: false });
    return dModal;
  }

  function abrirModalDuelo(titulo, cuerpoHtml, footerHtml) {
    const m = asegurarModalDuelo();
    document.getElementById("modalDueloTitulo").innerHTML = titulo;
    document.getElementById("modalDueloCuerpo").innerHTML = cuerpoHtml;
    document.getElementById("modalDueloFooter").innerHTML = footerHtml || "";
    m.show();
  }
  function cerrarModalDuelo() {
    if (dModal) dModal.hide();
  }
  function actualizarModalDuelo(cuerpoHtml, footerHtml) {
    if (!dModal) return;
    document.getElementById("modalDueloCuerpo").innerHTML = cuerpoHtml;
    document.getElementById("modalDueloFooter").innerHTML = footerHtml || "";
  }

  // Temporizador visible (fases de decisión: eventos y penales)
  let dTimerIntervalo = null;
  function iniciarTimerDuelo(segundos, onExpira) {
    detenerTimerDuelo();
    const el = document.getElementById("duelo-timer");
    if (!el) return;
    el.classList.remove("hidden");
    let restante = Math.ceil(segundos);
    el.innerHTML = "⏱️ <strong>" + restante + "</strong>s para decidir (si no, se decide solo)";
    dTimerIntervalo = enIntervalo(function() {
      restante--;
      if (restante <= 0) {
        detenerTimerDuelo();
        if (onExpira) onExpira();
      } else {
        el.innerHTML = "⏱️ <strong>" + restante + "</strong>s para decidir (si no, se decide solo)";
      }
    }, 1000);
    return dTimerIntervalo;
  }
  function detenerTimerDuelo() {
    if (dTimerIntervalo) { clearInterval(dTimerIntervalo); dTimerIntervalo = null; }
    const el = document.getElementById("duelo-timer");
    if (el) { el.classList.add("hidden"); el.innerHTML = ""; }
  }

  // ============================================================
  //  LOBBY Y MATCHMAKING
  // ============================================================
  function abrirPantallaDuelo(opts) {
    limpiarTimersDuelo();
    const inicio = document.getElementById("pantalla-inicio");
    const juego = document.getElementById("pantalla-juego");
    const resumen = document.getElementById("pantalla-resumen");
    if (inicio) inicio.classList.add("hidden");
    if (juego) juego.classList.add("hidden");
    if (resumen) resumen.classList.add("hidden");
    let pantalla = document.getElementById(PANTALLA);
    if (!pantalla) {
      pantalla = document.createElement("div");
      pantalla.id = PANTALLA;
      (document.querySelector(".container") || document.body).appendChild(pantalla);
    }
    pantalla.classList.remove("hidden");

    const cuenta = window.CoperoCuenta;
    if (!cuenta || !cuenta.tieneSesion() || !(typeof supabase !== "undefined")) {
      pantalla.innerHTML =
        '<div class="card card-custom p-4 mt-3 text-center">' +
        '<h4 class="fw-bold text-warning">⚔️ Duelo 1v1 Online (Duelo de Carreras)</h4>' +
        '<p class="mt-3">' + (!cuenta
          ? "⛔ <strong>Es obligatorio tener usuario para jugar.</strong><br>Iniciá sesión o creá tu cuenta en el panel «👤 Mi cuenta» de la pantalla principal."
          : "⛔ <strong>Tenés que iniciar sesión o crear una cuenta</strong> para usar el modo 1v1 Online (Duelo de Carreras).<br>Hacela en el panel «👤 Mi cuenta» de la pantalla principal y, después de loguearte, volvé a recargar.") + "</p>" +
        '<button class="btn btn-outline-secondary mt-3" onclick="volverInicioDuelo()">← Volver</button>' +
        "</div>";
      return;
    }

    // Necesitamos el apodo del perfil (nombre del duelista)
    pantalla.innerHTML = '<div class="card card-custom p-4 mt-3 text-center"><p>⏳ Cargando tu perfil de duelista...</p></div>';
    cuenta.perfil().then(function(apodo) {
      renderLobbyDuelo(apodo || "Duelista");
      if (opts && opts.autoBuscar) buscarPartidoDuelo();
    }).catch(function() {
      pantalla.innerHTML =
        '<div class="card card-custom p-4 mt-3 text-center">' +
        "<h4>⚔️ Duelo 1v1 Online</h4>" +
        "<p>⛔ No se pudo leer tu perfil. Revisá tu sesión en «👤 Mi cuenta» e intentá de nuevo.</p>" +
        '<button class="btn btn-outline-secondary mt-3" onclick="volverInicioDuelo()">← Volver</button>' +
        "</div>";
    });
  }

  function volverInicioDuelo() {
    cerrarSesionDuelo();
    salirDeColaDuelo();
    const pantalla = document.getElementById(PANTALLA);
    if (pantalla) pantalla.classList.add("hidden");
    const inicio = document.getElementById("pantalla-inicio");
    if (inicio) inicio.classList.remove("hidden");
  }

  function renderLobbyDuelo(apodo) {
    miApodoDuelo = apodo || "Duelista";
    const pantalla = document.getElementById(PANTALLA);
    pantalla.innerHTML =
      '<div class="card card-custom p-4 mt-3 duelo-lobby" id="duelo-lobby">' +
      '<div class="text-center mb-2">' +
      '<div class="duelo-lobby-icon">' + icoDuelo("duelo", 26) + "</div>" +
      '<h4 class="fw-bold mb-1">Duelo 1v1 Online</h4>' +
      '<p class="small text-secondary mb-0">Duelo de Carreras · 10 temporadas en tiempo real · Campeón del Duelo</p>' +
      "</div>" +
      '<div class="d-flex justify-content-center align-items-center gap-2 flex-wrap mt-2 mb-4">' +
      avatarIniciales(apodo) +
      '<span class="fw-bold">' + escaparDuelo(apodo) + "</span>" +
      '<span class="chip-small">✔️ Sesión verificada</span>' +
      "</div>" +
      // Panel de búsqueda (BUSCAR PARTIDO buscando un oponente)
      '<div id="duelo-buscar-panel" class="duelo-cola-panel hidden mb-3">' +
      '<div class="duelo-spinner" aria-hidden="true"></div>' +
      '<div class="duelo-cola-titulo">BUSCANDO RIVAL</div>' +
      '<div class="small text-secondary mt-1">Buscando un oponente...</div>' +
      '<div id="duelo-cola-gente" class="small text-3 mt-1"></div>' +
      '<button class="btn btn-outline-danger fw-bold mt-3 px-4" onclick="cancelarBusquedaDuelo()">✕ CANCELAR</button>' +
      "</div>" +
      // CTA principal
      '<button id="btn-duelo-buscar" class="btn btn-pso btn-lg fw-bold w-100" onclick="buscarPartidoDuelo()">' +
      icoDuelo("duelo", 18) + " " + tDuelo("dueloBuscar", "BUSCAR PARTIDO") + "</button>" +
      '<p class="text-center small text-3 mt-2 mb-4">Competí contra otro jugador online</p>' +
      '<div class="duelo-divisor"><span>o creá una sala con un amigo</span></div>' +
      '<div class="row g-3 mt-1" id="duelo-botones-salas">' +
      '<div class="col-md-6"><div class="border rounded p-3 h-100">' +
      '<h6 class="fw-bold">🟢 Crear sala</h6>' +
      '<input id="duelo-crear-nombre" class="form-control mb-2" placeholder="Nombre de la sala" maxlength="30">' +
      '<input id="duelo-crear-clave" type="password" class="form-control mb-2" placeholder="Contraseña de la sala" maxlength="30">' +
      '<button class="btn btn-warning fw-bold w-100" onclick="crearSalaDuelo()">Crear sala y esperar rival</button>' +
      "</div></div>" +
      '<div class="col-md-6"><div class="border rounded p-3 h-100">' +
      '<h6 class="fw-bold">🔗 Unirse a sala</h6>' +
      '<input id="duelo-unir-nombre" class="form-control mb-2" placeholder="Nombre de la sala" maxlength="30">' +
      '<input id="duelo-unir-clave" type="password" class="form-control mb-2" placeholder="Contraseña de la sala" maxlength="30">' +
      '<button class="btn btn-outline-warning fw-bold w-100" onclick="unirseSalaDuelo()">Unirme al duelo</button>' +
      "</div></div></div>" +
      '<div id="duelo-lobby-estado" class="mt-3"></div>' +
      '<div class="text-center mt-3"><button class="btn btn-outline-secondary btn-sm" onclick="volverInicioDuelo()">← Volver al inicio</button></div>' +
      "</div>";
    document.getElementById("duelo-crear-nombre").value = "";
  }

  function estadoLobbyDuelo(html) {
    const el = document.getElementById("duelo-lobby-estado");
    if (el) el.innerHTML = html;
  }

  function validarDatosSala(nombre, clave) {
    if (!nombre || nombre.trim().length < 3) return "El nombre de la sala debe tener al menos 3 caracteres.";
    if (!clave || clave.length < 3) return "La contraseña de la sala debe tener al menos 3 caracteres.";
    return null;
  }

  // ============================================================
  //  CONEXION REALTIME (Supabase Broadcast sobre WebSockets)
  // ============================================================
  function crearSalaDuelo() {
    if (dCola && dCola.activo) { estadoLobbyDuelo('<div class="alert alert-warning p-2 mb-0">⚠️ Estás en BUSCAR PARTIDO. CANCELÁ la búsqueda para crear una sala.</div>'); return; }
    const nombre = document.getElementById("duelo-crear-nombre").value.trim();
    const clave = document.getElementById("duelo-crear-clave").value;
    const error = validarDatosSala(nombre, clave);
    if (error) { estadoLobbyDuelo('<div class="alert alert-warning p-2 mb-0">⚠️ ' + error + "</div>"); return; }
    conectarCanalDuelo(nombre, clave);
  }

  function unirseSalaDuelo() {
    if (dCola && dCola.activo) { estadoLobbyDuelo('<div class="alert alert-warning p-2 mb-0">⚠️ Estás en BUSCAR PARTIDO. CANCELÁ la búsqueda para unirte a una sala.</div>'); return; }
    const nombre = document.getElementById("duelo-unir-nombre").value.trim();
    const clave = document.getElementById("duelo-unir-clave").value;
    const error = validarDatosSala(nombre, clave);
    if (error) { estadoLobbyDuelo('<div class="alert alert-warning p-2 mb-0">⚠️ ' + error + "</div>"); return; }
    conectarCanalDuelo(nombre, clave);
  }

  // ============================================================
  //  MATCHMAKING: BUSCAR PARTIDO
  //  Cola pública en tiempo real (canal duelo:cola-online) donde cada
  //  jugador registra presence {id, apodo, ts}. El emparejamiento es
  //  determinista: los 2 más antiguos forman el par (calcularParejaCola),
  //  y ambos abren la MISMA sala privada calculada por salaAutomaticaDuelo.
  //  Reutiliza toda la infraestructura de salas existente.
  // ============================================================
  function buscarPartidoDuelo() {
    if (dSesion || (d && d.activo)) return;
    if (dCola && dCola.activo) return; // ya estoy buscando
    if (dCola && dCola.canal) salirDeColaDuelo();

    if (!dCola) dCola = { activo: false, miId: null, apodo: "", ts: 0, canal: null, cliente: null, conectado: false };

    const cuenta = window.CoperoCuenta;
    if (!cuenta || !cuenta.tieneSesion()) return;
    const apodo = miApodoDuelo || "Duelista";
    dCola.apodo = apodo;
    dCola.ts = Date.now();
    dCola.activo = true;
    dCola.miId = dCola.miId || "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    const sb = supabase.createClient(COPERO_SUPABASE.url, COPERO_SUPABASE.publishableKey);
    dCola.cliente = sb;
    mostrarPanelBusquedaDuelo(true);

    const canal = sb.channel(DUELO_COLA_TOPIC, { config: { presence: { key: dCola.miId } } });
    dCola.canal = canal;
    canal.on("presence", { event: "sync" }, function() { chequearColaDuelo(); });
    canal.on("presence", { event: "leave" }, function() { chequearColaDuelo(); });
    canal.subscribe(function(estado) {
      if (estado === "SUBSCRIBED") {
        if (!dCola || !dCola.activo) { try { canal.untrack(); } catch (e) { /* noop */ } return; }
        dCola.conectado = true;
        canal.track({ id: dCola.miId, apodo: dCola.apodo, ts: dCola.ts });
        actualizarColaGenteDuelo();
      } else if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
        if (dCola && dCola.activo) {
          salirDeColaDuelo();
          renderLobbyDuelo(miApodoDuelo);
          estadoLobbyDuelo('<div class="alert alert-danger p-2 mb-0">🔴 No se pudo conectar a la cola online. Revisá tu conexión e intentá otra vez.</div>');
        }
      }
    });
  }

  function salirDeColaDuelo() {
    if (!dCola) return;
    dCola.activo = false;
    dCola.conectado = false;
    if (dCola.canal) {
      try {
        dCola.canal.untrack();
        if (dCola.cliente && dCola.cliente.removeChannel) dCola.cliente.removeChannel(dCola.canal);
      } catch (e) { /* noop */ }
      dCola.canal = null;
    }
    dCola.cliente = null;
    mostrarPanelBusquedaDuelo(false);
  }

  function cancelarBusquedaDuelo() {
    salirDeColaDuelo();
    renderLobbyDuelo(miApodoDuelo);
    estadoLobbyDuelo('<div class="alert alert-secondary p-2 mb-0">⏹️ Búsqueda cancelada.</div>');
  }

  function mostrarPanelBusquedaDuelo(visible) {
    const panel = document.getElementById("duelo-buscar-panel");
    const btn = document.getElementById("btn-duelo-buscar");
    if (panel) panel.classList.toggle("hidden", !visible);
    if (btn) {
      btn.disabled = visible;
      if (visible) {
        btn.innerHTML = '<span class="duelo-btn-spinner"></span> ' + tDuelo("dueloBuscar", "BUSCAR PARTIDO") + "...";
      } else {
        btn.innerHTML = icoDuelo("duelo", 18) + " " + tDuelo("dueloBuscar", "BUSCAR PARTIDO");
      }
    }
  }

  function actualizarColaGenteDuelo() {
    const el = document.getElementById("duelo-cola-gente");
    if (!el || !dCola || !dCola.canal) return;
    const presentes = Object.keys(dCola.canal.presenceState() || {}).length;
    el.textContent = presentes >= 2
      ? "🌍 " + presentes + " jugadores esperando..."
      : presentes === 1
      ? "Aún no llega nadie. Quedate conectado..."
      : "Conectando a la cola...";
  }

  function chequearColaDuelo() {
    if (!dCola || !dCola.activo || !dCola.canal) return;
    const estado = dCola.canal.presenceState() || {};
    const ids = Object.keys(estado);
    actualizarColaGenteDuelo();

    const presentes = ids.map(function(k) {
      const m = estado[k] && estado[k][0];
      return { id: k, ts: m && typeof m.ts === "number" ? m.ts : 0 };
    });

    const par = calcularParejaCola(presentes, dCola.miId);
    if (!par) return; // no soy parte del par, sigo esperando
    const sala = salaAutomaticaDuelo(par.ids);
    salirDeColaDuelo();
    renderLobbyDuelo(miApodoDuelo);
    estadoLobbyDuelo('<div class="alert alert-success p-2 mb-0">🎯 ¡Rival encontrado! Conectando al duelo...</div>');
    conectarCanalDuelo(sala.nombre, sala.clave, { modoAuto: true });
  }

  function conectarCanalDuelo(nombre, clave, opts) {
    opts = opts || {};
    const cuenta = window.CoperoCuenta;
    cuenta.perfil().then(function(apodo) {
      miApodoDuelo = apodo || "Duelista";
      const topic = "duelo:" + slugDuelo(nombre) + "-" + slugDuelo(clave);
      const miId = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

      dSesion = {
        salaNombre: nombre, topic: topic, miId: miId, apodo: miApodoDuelo,
        canal: null, conectado: false, holas: {}, iniciado: false, cerrada: false,
        holaEnviado: false, modoAuto: !!opts.modoAuto,
        rivalConocido: opts.rivalApodo || null
      };

      if (opts.modoAuto) {
        estadoLobbyDuelo('<div class="alert alert-info p-2 mb-0">🎯 Rival encontrado. Conectando al duelo privado...</div>');
      } else {
        estadoLobbyDuelo('<div class="alert alert-info p-2 mb-0">🌐 Conectando a la sala <strong>' + escaparDuelo(nombre) + "</strong>...</div>");
      }

      const sb = supabase.createClient(COPERO_SUPABASE.url, COPERO_SUPABASE.publishableKey);
      const canal = sb.channel(topic, { config: { broadcast: { self: false }, presence: { key: miId } } });

      canal.on("broadcast", { event: "msg" }, function(m) { recibirDuelo(m.payload || {}); });
      canal.on("presence", { event: "sync" }, function() { chequearPresenciaDuelo(); });
      canal.on("presence", { event: "leave" }, function() { chequearPresenciaDuelo(); });

      canal.subscribe(function(estado) {
        if (estado === "SUBSCRIBED") {
          dSesion.conectado = true;
          dSesion.canal = canal;
          canal.track({ id: miId, apodo: miApodoDuelo });
          // Registro de la sala en el servidor (participantes reales + semilla
          // del servidor). Si el RPC no está instalado, no hace nada.
          registrarSalaSeguraDuelo(topic);
          if (opts.modoAuto) {
            estadoLobbyDuelo('<div class="alert alert-success p-2 mb-0">🟢 ¡Rival localizado! Preparando el duelo...</div>');
            // Si el otro jugador no llegó a tiempo a la sala, se reintenta solo.
            enTarea(function() {
              if (!dSesion || !d || !d.iniciado) {
                const presentes = dSesion && dSesion.canal ? Object.keys(dSesion.canal.presenceState() || {}).length : 0;
                if (presentes < 2) {
                  cerrarSesionDuelo();
                  renderLobbyDuelo(miApodoDuelo);
                  estadoLobbyDuelo('<div class="alert alert-warning p-2 mb-0">⚠️ No se pudo conectar al rival. Buscando otra vez...</div>');
                  buscarPartidoDuelo();
                }
              }
            }, 9000);
          } else {
            estadoLobbyDuelo(
              '<div class="alert alert-success p-2 mb-0">🟢 Conectado a <strong>' + escaparDuelo(nombre) +
              "</strong>. Esperando al rival...<br><small>Compartí el nombre de la sala y la contraseña con tu oponente.</small></div>"
            );
          }
        } else if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
          estadoLobbyDuelo('<div class="alert alert-danger p-2 mb-0">🔴 No se pudo conectar a la sala. Revisá tu conexión e intentá otra vez.</div>');
          cerrarSesionDuelo();
        } else if (estado === "CLOSED" && dSesion && !dSesion.cerrada) {
          estadoLobbyDuelo('<div class="alert alert-warning p-2 mb-0">🔌 Conexión cerrada. Intentá conectarte otra vez.</div>');
        }
      });
    }).catch(function() {
      estadoLobbyDuelo('<div class="alert alert-danger p-2 mb-0">⛔ No se pudo leer tu perfil. Revisá tu sesión.</div>');
    });
  }

  function chequearPresenciaDuelo() {
    if (!dSesion || !dSesion.canal) return;
    const presentes = Object.keys(dSesion.canal.presenceState() || {});
    if (presentes.length > 2 && (!d || !d.iniciado)) {
      estadoLobbyDuelo('<div class="alert alert-danger p-2 mb-0">⛔ La sala está ocupada (ya hay un duelo en curso).</div>');
      return;
    }
    if (presentes.length >= 2) sendHolaIfPending();
    if (d) setEstadoRivalDuelo(presentes.length >= 2 ? "🟢 Conectado" : "🔴 Desconectado");
    if (d && d.activo && presentes.length < 2) bannerDesconectadoRival();
  }

  function sendHolaIfPending() {
    if (dSesion.holaEnviado) return;
    dSesion.holaEnviado = true;
    enviarDuelo({ t: "hola", id: dSesion.miId, apodo: dSesion.apodo });
  }

  function bannerDesconectadoRival() {
    const band = document.getElementById("duelo-banner-desc");
    if (!band) return;
    band.classList.remove("hidden");
    band.innerHTML = "🔌 <strong>" + escaparDuelo(d.rival.apodo) + "</strong> se desconectó. Si vuelve, seguimos en la misma temporada. Si no regresa, podés esperar o abandonar el duelo.";
  }

  // ------------------------------------------------------------
  //  SEGURIDAD SERVER-SIDE (RPC de Supabase)
  //  Todo es best-effort: si el RPC no está instalado, no hay sesión o no hay
  //  internet, el duelo sigue funcionando exactamente como antes.
  //  Nunca se loguea el token: solo status y respuesta del servidor.
  // ------------------------------------------------------------
  function duelRpcSeguro(nombre, cuerpo) {
    try {
      if (typeof fetch !== "function" || typeof COPERO_SUPABASE === "undefined") return Promise.resolve(null);
      const cuenta = window.CoperoCuenta;
      if (!cuenta || typeof cuenta.token !== "function") return Promise.resolve(null);
      return cuenta.token().then(function(token) {
        return fetch(COPERO_SUPABASE.url + "/rest/v1/rpc/" + nombre, {
          method: "POST",
          headers: {
            apikey: COPERO_SUPABASE.publishableKey,
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify(cuerpo || {})
        }).then(function(res) {
          return res.text().then(function(texto) {
            let datos = null;
            try { datos = JSON.parse(texto); } catch (e) { datos = null; }
            if (!res.ok) {
              try {
                console.warn("[duelo] RPC " + nombre + " rechazado", JSON.stringify({
                  status: res.status, statusText: res.statusText,
                  respuesta: String(texto).slice(0, 400)
                }));
              } catch (e) { /* sin consola */ }
              return { error: true, status: res.status, cuerpo: String(texto), datos: datos };
            }
            return datos;
          });
        });
      }).catch(function() { return null; });
    } catch (e) { return Promise.resolve(null); }
  }

  // Registra la sala en el servidor: participantes reales + semilla del
  // servidor. Si la sala ya tiene sus dos jugadores, un tercero es rechazado.
  // Sin RPC instalado (005/006 sin ejecutar) no cambia absolutamente nada.
  function registrarSalaSeguraDuelo(topic) {
    duelRpcSeguro("copero_duelo_sala_unirse", { p_room_id: topic }).then(function(res) {
      if (!res) return;                       // sin RPC / sin sesión / sin red
      if (res.error) {
        if (String(res.cuerpo || "").indexOf("sala_llena") !== -1) {
          estadoLobbyDuelo('<div class="alert alert-danger p-2 mb-0">Esta sala ya tiene dos jugadores. Probá con otra sala o usá BUSCAR PARTIDO.</div>');
          cerrarSesionDuelo();
        }
        return;
      }
      if (dSesion && dSesion.topic === topic) {
        dSesion.semillaServidor = res.semilla || null;
        dSesion.rolServidor = res.rol || null;
        dSesion.verificado = !!res.semilla;
      }
    });
  }

  // Confirmación del resultado propio. La PK (duel_id, user_id) del lado del
  // servidor hace el envío idempotente: repetirlo no duplica ni reescribe.
  // Después se lee el veredicto del servidor (compara las dos confirmaciones)
  // y, si no coincide con el local, queda registrado en consola.
  function confirmarResultadoSeguroDuelo() {
    if (!d || !dSesion || !dSesion.topic || dSesion.confirmado) return;
    dSesion.confirmado = true;
    const topic = dSesion.topic;
    let resumen = null;
    try { resumen = miResumenDuelo(); } catch (e) { return; }
    duelRpcSeguro("copero_duelo_confirmar", {
      p_duel_id: topic,
      p_rol: dSesion.miRol || "A",
      p_puntaje: calcularPuntajeDuelo(resumen),
      p_temporadas: d.temporada || 0,
      p_resumen: resumen
    }).then(function(res) {
      if (!res || res.error) return null;
      return duelRpcSeguro("copero_duelo_resultado", { p_duel_id: topic });
    }).then(function(res) {
      if (!res || res.error || !res.completo) return;
      const cuenta = window.CoperoCuenta;
      const miUid = (cuenta && typeof cuenta.idUsuario === "function") ? cuenta.idUsuario() : null;
      const veredicto = (res.ganador == null) ? "empate"
        : (String(res.ganador) === String(miUid) ? "vos" : "rival");
      try {
        console.info("[duelo] Resultado verificado por el servidor", JSON.stringify({
          mia: res.mia, rival: res.rival, ganador: veredicto
        }));
      } catch (e) { /* sin consola */ }
    }).catch(function() { /* el duelo nunca se rompe por esto */ });
  }

  function enviarDuelo(payload) {
    if (!dSesion || !dSesion.canal || !dSesion.conectado) return;
    payload.id = dSesion.miId;
    try { dSesion.canal.send({ type: "broadcast", event: "msg", payload: payload }); } catch (e) { /* conexion caida */ }
  }

  function recibirDuelo(msg) {
    if (!msg || !dSesion) return;
    if (msg.id === dSesion.miId) return;

    if (msg.t === "hola") {
      if (!dSesion.holas[msg.id]) {
        dSesion.holas[msg.id] = { apodo: msg.apodo };
        chequearInicioDuelo();
      }
      return;
    }
    if (!d) return;

    switch (msg.t) {
      case "stats":
        d.rival.ovr = msg.ovr; d.rival.goles = msg.goles; d.rival.asist = msg.asist;
        d.rival.moral = msg.moral; d.rival.club = msg.club || d.rival.club;
        if (msg.edad) d.rival.edad = msg.edad;
        if (msg.estado) { d.rival.estado = msg.estado; renderHUD(); }
        break;
      case "listo":
        d.listos[msg.fase] = d.listos[msg.fase] || {};
        d.listos[msg.fase].rival = true;
        if (d.listos[msg.fase].yo) avanzarFase(msg.fase);
        else { d.rival.estado = "¡Listo!"; renderHUD(); }
        break;
      case "evsel":
        d.evento.eleccionRival = msg.op;
        resolverEventoCruzado();
        break;
      case "penal":
        if (d.penales) {
          d.penales.datosRival[msg.p] = { zona: msg.zona, potencia: msg.potencia };
          resolverPenalSiListo(msg.p);
        }
        break;
      case "reflejo":
        if (d.reflejo) {
          d.reflejo.rivMs = msg.ms;
          d.reflejo.rivFoul = !!msg.foul;
          resolverReflejoSiListo();
        }
        break;
      case "fin":
        d.resumenRival = msg.resumen;
        mostrarFinalDuelo();
        break;
      case "abandono":
        dSesion.cerrada = true;
        mostrarPantallaAbandonoRival();
        break;
    }
  }

  function chequearInicioDuelo() {
    if (!dSesion || dSesion.iniciado) return;
    const ids = Object.keys(dSesion.holas);
    if (ids.length < 1) return;
    dSesion.iniciado = true;

    // Roles deterministic: A (anfitrion, patea primero) = el id menor
    // lexicograficamente entre mi id y el id del rival.
    const orden = [dSesion.miId].concat(ids).sort();
    dSesion.miRol = orden[0] === dSesion.miId ? "A" : "B";
    const idRival = ids[0];
    dSesion.idRival = idRival;

    iniciarDuelo(dSesion.holas[idRival].apodo || dSesion.rivalConocido || "Rival");
  }

  function cerrarSesionDuelo() {
    if (dSesion) {
      if (d && d.activo && !d.terminado && !dSesion.cerrada) {
        enviarDuelo({ t: "abandono" });
      }
      dSesion.cerrada = true;
      try { if (dSesion.canal) { dSesion.canal.unsubscribe(); dSesion.canal = null; } } catch (e) { /* noop */ }
    }
    limpiarTimersDuelo();
    detenerTimerDuelo();
    cerrarModalDuelo();
    dSesion = null;
    d = null;
  }

  // ============================================================
  //  ARRANQUE DEL DUELO, HUD Y SINCRONIZACION DE ESTADISTICAS
  // ============================================================
  let miApodoDuelo = "Duelista";

  function construirJugadorDuelo() {
    const clubes = (typeof CLUBES !== "undefined") ? CLUBES : [];
    const club = clubes[Math.floor(Math.random() * clubes.length)] || { nombre: "Libre", reputacion: 5 };
    const posiciones = ["DEL", "CM", "DEF", "GK"];
    return {
      apodo: miApodoDuelo,
      posicion: posiciones[Math.floor(Math.random() * posiciones.length)],
      club: club,
      ovr: 60,
      moral: 60,
      edad: DUELO_CFG.EDAD_INICIO || 22,
      goles: 0,
      asistencias: 0,
      clasicosGanados: 0,
      rivalidad: 0,
      bonusPendiente: 0,
      nittoxQuito: false,
      trofeos: {},
      eventosUsados: [],
      historial: [],
      alertEdadMostrada: false
    };
  }

  function iniciarDuelo(apodoRival) {
    const rivalFinal = apodoRival || (dSesion ? dSesion.rivalConocido : null) || "Rival";
    d = {
      activo: true,
      iniciado: true,
      terminado: false,
      fase: "preparando",
      temporada: 0,
      yo: construirJugadorDuelo(),
      rival: { apodo: rivalFinal, ovr: 60, goles: 0, asist: 0, moral: 60, edad: null, club: null, estado: "🟢 Conectado" },
      listos: {},
      evento: null,
      penales: null,
      resumenRival: null
    };

    const pantalla = document.getElementById(PANTALLA);
    pantalla.innerHTML =
      '<div id="duelo-hud" class="card card-custom p-3 mb-3"></div>' +
      '<div id="duelo-intro" class="card card-custom p-3 mb-3"></div>' +
      '<div class="card card-custom p-3"><div id="duelo-arena" class="hidden"></div>' +
      '<div class="text-center mt-3"><button class="btn btn-outline-danger btn-sm fw-bold" onclick="abandonarDuelo()">🏳️ Abandonar duelo</button></div></div>' +
      '<div id="duelo-timer" class="text-center my-2 hidden"></div>';

    renderHUD();
    enviarStatsDuelo("Conectado al duelo");
    pintarIntroDuelo(miApodoDuelo, rivalFinal);

    if (tieneMovimientoReducidoDuelo()) {
      // Accesibilidad: sin animaciones, arrancamos directamente.
      enTarea(function() { montarDueloEnCurso(); }, 400);
    } else {
      let n = 3;
      var intervaloCuenta = enIntervalo(function() {
        n--;
        if (n <= 0) {
          clearInterval(intervaloCuenta);
          montarDueloEnCurso();
          return;
        }
        pintarCuentaDuelo(n);
      }, 800);
    }
  }

  function tieneMovimientoReducidoDuelo() {
    try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  function pintarIntroDuelo(apodoJugador, apodoRival) {
    const intro = document.getElementById("duelo-intro");
    if (!intro) return;
    intro.innerHTML =
      '<div class="duelo-intro-tag">🎯 RIVAL ENCONTRADO</div>' +
      '<div class="d-flex justify-content-center align-items-center gap-3 my-3 flex-wrap">' +
      '<div class="text-center duelo-intro-avatar">' + avatarIniciales(apodoJugador) +
      '<div class="fw-bold mt-1">' + escaparDuelo(apodoJugador) + "</div>" +
      '<div class="small text-3">' + escaparDuelo(d.yo.club.nombre) + "</div></div>" +
      '<div class="duelo-vs-big">VS</div>' +
      '<div class="text-center duelo-intro-avatar">' + avatarIniciales(apodoRival) +
      '<div class="fw-bold mt-1">' + escaparDuelo(apodoRival) + "</div>" +
      '<div class="small text-3">Jugador online</div></div>' +
      "</div>" +
      '<div class="small text-3 text-center mb-3">Carrera de 10 temporadas · ' +
      "te tocó jugar en <strong>" + escaparDuelo(d.yo.club.nombre) + "</strong> como <strong>" + d.yo.posicion + "</strong>.</div>" +
      '<div id="duelo-countdown" class="duelo-countdown text-center">3</div>';
  }

  function pintarCuentaDuelo(n) {
    const el = document.getElementById("duelo-countdown");
    if (el) el.textContent = String(n);
  }

  function montarDueloEnCurso() {
    const intro = document.getElementById("duelo-intro");
    const arena = document.getElementById("duelo-arena");
    const cd = document.getElementById("duelo-countdown");
    if (cd) cd.textContent = "¡YA!";
    enTarea(function() {
      if (intro) intro.innerHTML = "";
      if (arena) arena.classList.remove("hidden");
      iniciarTemporadaDuelo();
    }, 500);
  }

  function enviarStatsDuelo(estado) {
    if (!d) return;
    enviarDuelo({
      t: "stats", ovr: d.yo.ovr, goles: d.yo.goles, asist: d.yo.asistencias,
      moral: d.yo.moral, edad: d.yo.edad, club: d.yo.club ? d.yo.club.nombre : "", estado: estado || ""
    });
    if (estado) d.yo.estado = estado;
    renderHUD();
  }

  function marcarListo(fase) {
    d.listos[fase] = d.listos[fase] || {};
    d.listos[fase].yo = true;
    enviarDuelo({ t: "listo", fase: fase });
    if (d.listos[fase].rival) avanzarFase(fase);
  }

  function avanzarFase(fase) {
    if (!d || !d.activo) return;
    if (fase === "entreno") { d.fase = "mercado"; faseMercadoDuelo(); }
    else if (fase === "mercado") { d.fase = "evento"; enTarea(function() { faseEventoDuelo(); }, 600); }
    else if (fase === "evento") { enTarea(function() {
      // Minijuego de la temporada. Alterna 1 y 1 entre temporadas para que
      // ambos jugadores jueguen EXACTAMENTE el mismo minijuego y toquen las
      // dos variedades: temporadas impares -> Duelo de Reflejos, pares ->
      // Tanda de Penales (El Clásico).
      const jugarReflejos = (d.temporada % 2) === 1;
      d.fase = jugarReflejos ? "reflejos" : "clasico";
      if (jugarReflejos) faseReflejosDuelo();
      else faseClasicoDuelo();
    }, 1500); }
    else if (fase === "tempo") {
      if (d.temporada >= DUELO_CFG.TEMPORADAS) { d.fase = "retiro"; faseRetiroDuelo(); }
      else { d.fase = "preparando"; enTarea(function() { iniciarTemporadaDuelo(); }, 800); }
    }
  }

  function setEstadoRivalDuelo(txt) {
    if (!d) return;
    d.rival.estado = txt;
    renderHUD();
  }

  function renderHUD() {
    const hud = document.getElementById("duelo-hud");
    if (!hud || !d) return;
    const yo = d.yo, ri = d.rival;
    const dif = yo.ovr - ri.ovr;
    const signo = dif > 0 ? "+" + dif : (dif < 0 ? "−" + Math.abs(dif) : "=");
    const colorDif = dif > 0 ? "text-success" : (dif < 0 ? "text-danger" : "text-secondary");
    const clubYo = yo.club ? yo.club.nombre : "—";
    const clubRi = ri.club ? ri.club.nombre : "—";
    hud.innerHTML =
      '<div class="d-flex justify-content-around align-items-center text-center">' +
      '<div>' + avatarIniciales(yo.apodo) +
      '<div class="fw-bold mt-1">' + escaparDuelo(yo.apodo) + '</div>' +
      '<div class="small text-secondary">' + escaparDuelo(clubYo) + " • " + yo.posicion + "</div></div>" +
      '<div class="duelo-vs fw-bold">VS</div>' +
      "<div>" + avatarIniciales(ri.apodo) +
      '<div class="fw-bold mt-1">' + escaparDuelo(ri.apodo) + "</div>" +
      '<div class="small text-secondary">' + escaparDuelo(clubRi) + "</div></div>" +
      "</div>" +
      '<div class="d-flex justify-content-around mt-3 flex-wrap duelo-stats">' +
      '<div><span class="duelo-stat-num">' + yo.ovr + '</span><span class="duelo-stat-lbl">tu OVR</span><span class="' + colorDif + ' fw-bold small">(' + signo + ')</span></div>' +
      '<div><span class="duelo-stat-num">' + ri.ovr + '</span><span class="duelo-stat-lbl">OVR rival</span></div>' +
      '<div><span class="duelo-stat-num">' + yo.goles + '</span><span class="duelo-stat-lbl">goles</span></div>' +
      '<div><span class="duelo-stat-num">' + ri.goles + '</span><span class="duelo-stat-lbl">goles rival</span></div>' +
      '<div><span class="duelo-stat-num">' + yo.asistencias + '</span><span class="duelo-stat-lbl">asist.</span></div>' +
      '<div><span class="duelo-stat-num">' + ri.asist + '</span><span class="duelo-stat-lbl">asist. rival</span></div>' +
      '<div><span class="duelo-stat-num">' + yo.clasicosGanados + '</span><span class="duelo-stat-lbl">clásicos</span></div>' +
      '<div><span class="duelo-stat-num">' + yo.rivalidad + '</span><span class="duelo-stat-lbl">pts rivalidad</span></div>' +
      '<div><span class="duelo-stat-num">' + yo.edad + '</span><span class="duelo-stat-lbl">edad</span></div>' +
      '<div><span class="duelo-stat-num">' + (ri.edad == null ? "—" : ri.edad) + '</span><span class="duelo-stat-lbl">edad rival</span></div>' +
      "</div>" +
      '<div class="small text-center mt-2 border-top pt-2">' +
      "🗓️ Temporada <strong>" + Math.max(1, d.temporada) + "/" + DUELO_CFG.TEMPORADAS + "</strong> — " +
      "Tú: <strong>" + escaparDuelo(yo.estado || "—") + "</strong> | Rival: <strong>" + escaparDuelo(ri.estado || "—") + "</strong></div>";
  }

  // ============================================================
  //  FASES DE LA TEMPORADA (individuales: Entrenamiento y Mercado)
  // ============================================================
  function iniciarTemporadaDuelo() {
    if (!d || !d.activo) return;
    d.temporada++;
    d.listos = {};

    // Edad: incrementar y aplicar baja de OVR si corresponde
    d.yo.edad++;
    const baja = calcularDecliveEdad(d.yo.edad);
    if (baja > 0) {
      const ovrAntes = d.yo.ovr;
      const OVR_MIN = (typeof CONFIG !== "undefined" && CONFIG.OVR_MIN) || 40;
      d.yo.ovr = Math.max(OVR_MIN, d.yo.ovr - baja);
      if (d.yo.ovr < ovrAntes) {
        notifDuelo("📉 Edad", `Pasaron los 31 y el tiempo dejó su marca: <strong>-${baja} OVR</strong> (ahora ${d.yo.ovr}). Los equipos te van a ofrecer más al azar.`);
      }
    }
    // Notificación única cuando se cruza los 31 por primera vez
    if (ofertasAleatoriasPorEdad(d.yo.edad) && !d.yo.alertEdadMostrada) {
      d.yo.alertEdadMostrada = true;
      notifDuelo("🎲 Ofertas al azar", `Al pasar los 31, los equipos te invitan de forma más aleatoria (ya no siguen tu OVR).`);
    }

    // Recompensa del Clásico ganado: +1 OVR al inicio de la temporada siguiente
    if (d.yo.bonusPendiente > 0) {
      const reglas = (typeof REGLAS_MEDIA !== "undefined" && REGLAS_MEDIA[d.yo.club.reputacion]) || 99;
      if (d.yo.ovr < reglas) {
        d.yo.ovr = Math.min(reglas, d.yo.ovr + d.yo.bonusPendiente);
        notifDuelo("🏅 Bonus del Clásico", "¡Ganaste el Clásico anterior! <strong>+" + d.yo.bonusPendiente + " OVR</strong> para esta temporada.");
      }
      d.yo.bonusPendiente = 0;
    }
    // Nittox: el rango quitado se recupera la temporada siguiente
    if (d.yo.nittoxQuito) {
      d.yo.nittoxQuito = false;
      notifDuelo("🎮 Rango Recuperado", "Pasó la temporada del Sargento Nittox: <strong>recuperaste tu rango</strong>.");
    }

    renderHUD();
    faseEntrenoDuelo();
  }

  function faseEntrenoDuelo() {
    d.fase = "entreno";
    const arena = document.getElementById("duelo-arena");
    arena.innerHTML =
      '<h5 class="fw-bold">🏋️ Temporada ' + d.temporada + " — Entrenamiento</h5>" +
      '<p class="small text-secondary">Podés entrenar una vez por temporada (como en la carrera individual). Los mentores legendarios suben más... si salen bien.</p>' +
      '<button id="btn-duelo-entrenar" class="btn btn-primary btn-lg fw-bold" onclick="entrenarDuelo()">🏋️ Entrenar</button>';
    enviarStatsDuelo("Entrenando...");
  }

  function entrenarDuelo() {
    const btn = document.getElementById("btn-duelo-entrenar");
    if (btn) btn.disabled = true;
    const esLegendario = Math.random() < 0.2;
    const exitoProb = esLegendario ? 0.5 : 0.7;
    const incremento = esLegendario ? 3 : 2;
    const reglas = (typeof REGLAS_MEDIA !== "undefined" && REGLAS_MEDIA[d.yo.club.reputacion]) || 99;

    let resultadoTxt;
    if (Math.random() <= exitoProb) {
      if (d.yo.ovr < reglas) {
        d.yo.ovr = Math.min(reglas, d.yo.ovr + incremento);
        resultadoTxt = '<span class="text-success fw-bold">¡Progreso! ' + (esLegendario ? "Entreno legendario: " : "") + "+" + incremento + " OVR</span>";
      } else {
        resultadoTxt = '<span class="text-primary">Llegaste al techo del club actual.</span>';
      }
    } else {
      resultadoTxt = '<span class="text-danger">Práctica sin frutos.</span>';
    }

    const arena = document.getElementById("duelo-arena");
    arena.innerHTML =
      '<h5 class="fw-bold">🏋️ Temporada ' + d.temporada + " — Entrenamiento</h5>" +
      '<div class="fs-5 mt-3">' + resultadoTxt + "</div>" +
      '<p class="small text-secondary mt-3">Esperando al rival...</p>';
    enviarStatsDuelo("¡Listo!");
    marcarListo("entreno");
  }

  function faseMercadoDuelo() {
    d.fase = "mercado";
    const edadVeterano = ofertasAleatoriasPorEdad(d.yo.edad);
    const clubes = (typeof CLUBES !== "undefined" ? CLUBES : []);
    let candidatos;

    if (edadVeterano) {
      // > 31 años: los equipos llegan más al azar (sin filtro por OVR)
      candidatos = clubes
        .filter(function(c) { return c.nombre !== d.yo.club.nombre; })
        .sort(function() { return Math.random() - 0.5; });
    } else {
      // Rangos coherentes según el OVR (ver rangoReputacionPorMedia en data.js)
      const rango = rangoReputacionPorMedia(d.yo.ovr);
      candidatos = clubes
        .filter(function(c) {
          return c.nombre !== d.yo.club.nombre && c.reputacion >= rango.min && c.reputacion <= rango.max;
        })
        .sort(function() { return Math.random() - 0.5; });
    }

    const ofertas = armarTresOfertas(candidatos, d.yo.club);

    let html = '<h5 class="fw-bold">💼 Temporada ' + d.temporada + " — Mercado de Pases</h5>" +
      (edadVeterano
        ? '<p class="small text-secondary">A tu edad (' + d.yo.edad + '), los equipos te llaman más al azar: ya no dependen tanto de tu OVR. Elegí tu club.</p>'
        : '<p class="small text-secondary">Las ofertas llegan según tu nivel: los clubes te llaman de forma coherente con tu OVR. Cada club tiene un techo de OVR según su reputación.</p>') +
      '<div class="d-grid gap-2">';
    ofertas.forEach(function(club, i) {
      const esRenovacion = club.nombre === d.yo.club.nombre;
      html += '<button class="btn ' + (esRenovacion ? "btn-outline-primary" : "btn-pso") + ' fw-bold" onclick="elegirClubDuelo(' + i + ')">' +
        (esRenovacion ? "🔄 Renovar: " : "✍️ Fichar: ") + escaparDuelo(club.nombre) +
        ' <small class="' + (esRenovacion ? "text-info" : "text-warning") + '">[Reputación ' + club.reputacion + "/10 — techo OVR " + ((typeof REGLAS_MEDIA !== "undefined" && REGLAS_MEDIA[club.reputacion]) || 99) + "]</small></button>";
    });
    html += "</div>";
    const arena = document.getElementById("duelo-arena");
    arena.innerHTML = html;
    arena.dataset.ofertas = JSON.stringify(ofertas.map(function(c) { return { nombre: c.nombre }; }));
    enviarStatsDuelo("Eligiendo club...");
  }

  function elegirClubDuelo(indice) {
    const arena = document.getElementById("duelo-arena");
    const ofertas = JSON.parse(arena.dataset.ofertas || "[]").map(function(c) { return clubDeNombre(c.nombre) || d.yo.club; });
    const club = ofertas[indice] || d.yo.club;
    const cambio = club.nombre !== d.yo.club.nombre;
    d.yo.club = club;

    arena.innerHTML =
      '<h5 class="fw-bold">💼 Temporada ' + d.temporada + " — Mercado de Pases</h5>" +
      '<div class="fs-5 mt-3">' + (cambio
        ? '✍️ ¡Fichaste por <strong class="text-warning">' + escaparDuelo(club.nombre) + "</strong>!"
        : "🔄 Renovaste con <strong>" + escaparDuelo(club.nombre) + "</strong>.") + "</div>" +
      '<p class="small text-secondary mt-3">Esperando al rival...</p>';
    enviarStatsDuelo("¡Listo!");
    marcarListo("mercado");
  }

  // ============================================================
  //  DUELO DE REFLEJOS 1v1 (contra el rival, sin arco ni penales:
  //  esperar el ¡YA! y tocar antes que el oponente)
  // ============================================================
  function faseReflejosDuelo() {
    if (!d || !d.activo) return;
    var esperaMs = 2000 + (semillaDeterministaDuelo(dSesion ? dSesion.topic : "sala", d.temporada) % 3001);
    d.reflejo = { ya: false, miMs: null, miFoul: false, rivMs: null, rivFoul: false, resuelto: false };
    enviarStatsDuelo("Duelo de reflejos...");
    var esperaS = (esperaMs / 1000).toFixed(1);

    abrirModalDuelo(
      "⚡ DUELO DE REFLEJOS — Temporada " + d.temporada,
      "<p class='fs-5'>🆚 <strong>" + escaparDuelo(d.yo.apodo) + "</strong> vs <strong>" + escaparDuelo(d.rival.apodo) + "</strong></p>" +
      "<p>Esperá la señal <strong class='text-success'>¡YA!</strong> (" + esperaS + "s aprox). El botón se habilita recién cuando aparece el ¡YA!, así que no podés tocarlo antes.</p>" +
      "<p class='small text-danger'>⚠️ Tocá apenas veas el ¡YA!: tenés <strong>3 segundos</strong> para reaccionar.</p>" +
      "<p class='small text-secondary'>El ganador se lleva: <strong>+1 OVR</strong> en la temporada siguiente, <strong>+20 de Moral</strong> y <strong>+150 Puntos de Rivalidad</strong>.</p>" +
      "<div id='duelo-reflejo-estado' class='display-6 fw-bold my-3 text-warning'>⏳ Esperá...</div>" +
      "<button id='btn-duelo-reflejo' class='btn btn-success btn-lg fw-bold px-5' onclick='clickReflejoDuelo()' disabled>⚡ ¡TOCAR!</button>",
      ""
    );
    if (typeof lanzarConfeti === "function") lanzarConfeti(30);
    enTarea(function() {
      if (!d || !d.reflejo || d.reflejo.ya) return;
      d.reflejo.ya = true;
      d.reflejo.tYa = Date.now();
      var est = document.getElementById("duelo-reflejo-estado");
      if (est) { est.innerHTML = "🟢 ¡YA!"; est.className = "display-6 fw-bold my-3 text-success"; }
      var btn = document.getElementById("btn-duelo-reflejo");
      if (btn) btn.disabled = false;
      if (typeof sonidoGol === "function") sonidoGol();
      iniciarTimerDuelo(3, function() { enviarReflejoDuelo(9999, false, true); });
    }, esperaMs);
  }

  function clickReflejoDuelo() {
    if (!d || !d.reflejo || d.reflejo.miMs !== null) return;
    if (!d.reflejo.ya) { enviarReflejoDuelo(9999, true, false); return; }
    enviarReflejoDuelo(Math.max(0, Date.now() - (d.reflejo.tYa || Date.now())), false, false);
  }

  function enviarReflejoDuelo(ms, foul, porTimer) {
    if (!d || !d.reflejo || d.reflejo.miMs !== null) return;
    detenerTimerDuelo();
    d.reflejo.miMs = ms;
    d.reflejo.miFoul = !!foul;
    enviarDuelo({ t: "reflejo", ms: ms, foul: !!foul });
    var est = document.getElementById("duelo-reflejo-estado");
    if (est) {
      if (foul && !porTimer) est.innerHTML = "🔴 ¡FOUL! Tocaste antes del ¡YA!";
      else est.innerHTML = "📨 ¡" + ms + " ms! Esperando al rival...";
    }
    resolverReflejoSiListo();
  }

  function resolverReflejoSiListo() {
    if (!d || !d.reflejo || d.reflejo.resuelto) return;
    if (d.reflejo.miMs === null || d.reflejo.rivMs === null) return;
    d.reflejo.resuelto = true;
    detenerTimerDuelo();
    var res = resolverReflejoDuelo(d.reflejo.miMs, d.reflejo.miFoul, d.reflejo.rivMs, d.reflejo.rivFoul);
    var titulo, html;
    if (res.r === "gana") {
      titulo = "⚡ ¡GANASTE EL DUELO DE REFLEJOS!";
      d.yo.clasicosGanados++;
      d.yo.rivalidad += DUELO_CFG.PUNTOS_RIVALIDAD_CLASICO;
      d.yo.moral = Math.min(100, d.yo.moral + DUELO_CFG.BONUS_MORAL_CLASICO);
      d.yo.bonusPendiente += DUELO_CFG.BONUS_OVR_CLASICO;
      html =
        "<h4 class='text-success'>" + d.reflejo.miMs + " ms — " + d.reflejo.rivMs + " ms</h4>" +
        "<p>" + res.t + "</p>" +
        "<p>⚡ Duelos ganados: <strong>" + d.yo.clasicosGanados + "</strong></p>" +
        "<p>➕ <strong>+" + DUELO_CFG.BONUS_OVR_CLASICO + " OVR</strong> en la temporada siguiente</p>" +
        "<p>😊 <strong>+" + DUELO_CFG.BONUS_MORAL_CLASICO + " de Moral</strong></p>" +
        "<p>⚔️ <strong>+" + DUELO_CFG.PUNTOS_RIVALIDAD_CLASICO + " Puntos de Rivalidad</strong></p>";
      if (typeof lanzarConfeti === "function") lanzarConfeti(80);
      if (typeof sonidoExito === "function") sonidoExito();
    } else if (res.r === "pierde") {
      titulo = "😞 PERDISTE EL DUELO DE REFLEJOS";
      html = "<h4 class='text-danger'>" + d.reflejo.miMs + " ms — " + d.reflejo.rivMs + " ms</h4>" +
        "<p>" + res.t + ". El rival se lleva las recompensas. Podés desquitarte en la próxima temporada.</p>";
      if (typeof sonidoError === "function") sonidoError();
    } else {
      titulo = "⚖️ REFLEJOS EMPATADOS";
      html = "<h4>" + d.reflejo.miMs + " ms — " + d.reflejo.rivMs + " ms</h4><p>" + res.t + ". Nadie se lleva las recompensas esta vez.</p>";
    }
    html += "<p class='small text-secondary mt-2'>Simulando la temporada...</p>";
    document.getElementById("modalDueloTitulo").innerHTML = titulo;
    actualizarModalDuelo(html, "");
    d.reflejo = null;
    enviarStatsDuelo("Reflejos terminados");
    enTarea(function() { cerrarModalDuelo(); simularTemporadaDueloUI(); }, 3400);
  }
  
  // ============================================================
  //  EVENTO CRUZADO / SINCRONIZADO (eleccion a ciegas + timer 10s)
  // ============================================================
  function faseEventoDuelo() {
    if (!d || !d.activo) return;
    const semilla = (dSesion ? dSesion.topic : "sala") + "-temp-" + d.temporada;
    const id = elegirEventoDeterminista(semilla, d.yo.eventosUsados);
    d.yo.eventosUsados.push(id);
    d.evento = { id: id, cfg: DUELO_EVENTOS[id], eleccionLocal: null, eleccionRival: null, resuelto: false };

    const ev = d.evento.cfg;
    const arena = document.getElementById("duelo-arena");
    arena.innerHTML =
      '<h5 class="fw-bold">⭐ Evento cruzado de la temporada ' + d.temporada + "</h5>" +
      '<p class="small text-secondary">Ambos jugadores reciben el MISMO evento. Eligen a ciegas: no vas a ver qué eligió tu rival hasta que ambos decidieron. Tenés 10 segundos.</p>';

    let footer = "";
    if (ev.a && ev.b) {
      footer =
        '<button class="btn btn-warning fw-bold mx-2" onclick="elegirOpcionEventoDuelo(\'a\')">' + ev.a + "</button>" +
        '<button class="btn btn-secondary fw-bold mx-2" onclick="elegirOpcionEventoDuelo(\'b\')">' + ev.b + "</button>";
    } else {
      footer =
        '<button class="btn btn-warning fw-bold mx-2" onclick="elegirOpcionEventoDuelo(\'a\')">' + (ev.a || "✅ Aceptar") + "</button>" +
        '<button class="btn btn-secondary fw-bold mx-2" onclick="elegirOpcionEventoDuelo(\'b\')">' + (ev.b || "❌ Rechazar") + "</button>";
    }
    abrirModalDuelo("⭐ " + ev.titulo, ev.texto, footer);
    iniciarTimerDuelo(DUELO_CFG.TIMER_MS / 1000, function() { elegirOpcionEventoDuelo("b", true); });
    enviarStatsDuelo("Pensando evento...");
  }

  function elegirOpcionEventoDuelo(op, porTimer) {
    if (!d || !d.evento || d.evento.eleccionLocal) return;
    detenerTimerDuelo();
    d.evento.eleccionLocal = op;
    enviarDuelo({ t: "evsel", op: op });
    enviarStatsDuelo("Elección enviada...");

    const enEspera =
      (porTimer ? '<p class="small text-warning">⏱️ Se eligió automáticamente por tiempo.</p>' : "") +
      '<p class="mt-3">📨 Elección enviada. Esperando al rival...</p>';
    actualizarModalDuelo(enEspera, "");
    // Si el rival ya eligió antes, resolvé ahora
    resolverEventoCruzado();
  }

  function resolverEventoCruzado() {
    if (!d || !d.evento || d.evento.resuelto) return;
    if (!d.evento.eleccionLocal || !d.evento.eleccionRival) return;
    d.evento.resuelto = true;

    const ev = d.evento.cfg;
    const resultado = ev.resolver(d.evento.eleccionLocal, d.yo);
    const opRival = d.evento.eleccionRival;

    const html =
      '<p class="fs-5 mt-2">' + resultado + "</p>" +
      '<hr><p class="small">🕵️ Tu rival eligió: <strong>' + escaparDuelo(opRival === "a" ? ev.a : ev.b) + "</strong></p>" +
      '<p class="small text-secondary">Cada uno recibe la consecuencia de su propia elección.</p>';
    actualizarModalDuelo(html, '<button class="btn btn-warning fw-bold px-4" onclick="cerrarModalDuelo()">¡Entendido!</button>');
    enviarStatsDuelo("Evento resuelto");

    enTarea(function() {
      cerrarModalDuelo();
      renderHUD();
      marcarListo("evento");
    }, 3200);
  }

  // ============================================================
  //  EL CLASICO DE LA TEMPORADA (tanda de 3 penales por lado,
  //  roles alternados Pateador vs Arquero, eleccion a ciegas)
  // ============================================================
  function faseClasicoDuelo() {
    if (!d || !d.activo) return;
    enviarStatsDuelo("¡Llegó el Clásico!");
    lanzarAvisoClasico();
  }

  function lanzarAvisoClasico() {
    abrirModalDuelo(
      "¡LLEGÓ EL CLÁSICO DE LA TEMPORADA " + d.temporada + "!",
      "<p class='fs-5'>🔥 <strong>" + escaparDuelo(d.yo.apodo) + "</strong> VS <strong>" + escaparDuelo(d.rival.apodo) + "</strong></p>" +
      "<p>Tanda de <strong>3 penales por lado</strong> con roles alternados: pateador y arquero.</p>" +
      "<p class='small text-secondary'>El ganador se lleva: <strong>+1 OVR</strong> en la temporada siguiente, <strong>+20 de Moral</strong> y <strong>+150 Puntos de Rivalidad</strong>.</p>",
      '<button class="btn btn-warning btn-lg fw-bold px-4" onclick="arrancarClasicoDuelo()">🥅 ¡JUGAR EL CLÁSICO!</button>'
    );
    if (typeof lanzarConfeti === "function") lanzarConfeti(30);
  }

  function arrancarClasicoDuelo() {
    d.penales = {
      p: 0, total: DUELO_CFG.TANDA_PENALES * 2, extras: 0,
      golesYo: 0, golesRival: 0, datosLocal: {}, datosRival: {}, resueltos: {},
      barra: null
    };
    siguientePenalDuelo();
  }

  function papelEnPenalDuelo(p) {
    const kickerRol = p % 2 === 1 ? "A" : "B";
    return dSesion.miRol === kickerRol ? "pateador" : "arquero";
  }

  function siguientePenalDuelo() {
    const pen = d.penales;
    if (pen.p >= pen.total) { cerrarTandaDuelo(); return; }
    pen.p++;
    const p = pen.p;
    pen.datosLocal[p] = null;
    pen.datosRival[p] = null;
    const papel = papelEnPenalDuelo(p);
    enviarStatsDuelo(papel === "pateador" ? "Pateando penal..." : "Atajando penal...");

    let cuerpo = "<p class='mb-2'>Penal <strong>" + p + "</strong> de <strong>" + pen.total + "</strong> — Vos <strong>" +
      (papel === "pateador" ? "⚽ PATEÁS" : "🧤 ATAJÁS") + "</strong></p>" +
      "<p class='mb-1'>Marcador: <strong>" + d.yo.apodo + " " + pen.golesYo + " — " + pen.golesRival + " " + d.rival.apodo + "</strong></p>" +
      "<div class='duelo-arco mb-3'>" + htmlZonasArcoDuelo() + "</div>";

    if (papel === "pateador") {
      const margen = Math.round(margenPotenciaDuelo(d.yo.ovr));
      const desde = Math.max(0, 65 - margen);
      const ancho = Math.min(100, 65 + margen) - desde;
      cuerpo +=
        "<div class='duelo-penal-pasos mb-2'>" +
        "<div class='duelo-penal-paso' id='duelo-paso-1'><span class='duelo-paso-num'>1</span> Elegí la zona del arco</div>" +
        "<div class='duelo-penal-paso' id='duelo-paso-2'><span class='duelo-paso-num'>2</span> Frená la barra en la zona verde</div>" +
        "</div>" +
        "<div class='zona-gol duelo-barra duelo-barra-penal' id='duelo-barra-zona' onclick='detenerBarraDuelo()'>" +
        "<div class='duelo-barra-ideal' style='left:" + desde + "%;width:" + ancho + "%;'></div>" +
        "<div id='duelo-barra-fill' class='progress-bar bg-info' style='width:0%;height:100%;'></div>" +
        "<div id='duelo-barra-lbl' class='duelo-barra-lbl'>0</div>" +
        "</div>" +
        "<button type='button' class='btn btn-warning fw-bold mt-2 px-4' onclick='detenerBarraDuelo()'>✋ ¡FRENAR! <span class='small'>(ESPACIO)</span></button>" +
        "<p class='small text-secondary mt-2 mb-1'>Objetivo: <strong>65 de potencia</strong>. La zona verde es tu margen de error según tu OVR (" + d.yo.ovr + "): podés acertar entre " + desde + " y " + Math.round(desde + ancho) + ".</p>" +
        "<p class='small text-secondary'>Tu OVR hace la barra más lenta. OVR rival: " + d.rival.ovr + "</p>";
    } else {
      cuerpo += "<p class='small'>Elegí hacia dónde tirarte. Con más OVR tenés más rango de tolerancia para atajar.</p>";
    }
    cuerpo += "<div id='duelo-penal-estado' class='small text-secondary mt-2'></div>";

    abrirModalDuelo("🥅 EL CLÁSICO — Temporada " + d.temporada, cuerpo, "");
    // Limpio el intervalo de la barra del penal anterior
    if (pen.barra && pen.barra.intervalo) { clearInterval(pen.barra.intervalo); }
    pen.barra = { pos: 0, dir: 1, corriendo: papel === "pateador", intervalo: null };
    if (papel === "pateador") {
      const vel = velocidadBarraDuelo(d.yo.ovr);
      pen.barra.intervalo = enIntervalo(function() {
        const b = d && d.penales && d.penales.barra;
        if (!b || !b.corriendo) return;
        b.pos += b.dir * vel / 60;
        if (b.pos >= 100) { b.pos = 100; b.dir = -1; }
        if (b.pos <= 0) { b.pos = 0; b.dir = 1; }
        const fill = document.getElementById("duelo-barra-fill");
        const enZona = Math.abs(b.pos - 65) <= margenPotenciaDuelo(d.yo.ovr);
        if (fill) {
          fill.style.width = b.pos + "%";
          fill.className = "progress-bar " + (enZona ? "bg-success" : "bg-danger");
        }
        const lbl = document.getElementById("duelo-barra-lbl");
        if (lbl) lbl.innerText = Math.round(b.pos);
      }, 16);
      document.addEventListener("keydown", manejarEspacioBarraDuelo);
    }

    iniciarTimerDuelo(DUELO_CFG.TIMER_MS / 1000, function() {
      const expirado = !d.penales.datosLocal[p];
      if (!expirado) return;
      if (papelEnPenalDuelo(p) === "pateador") {
        enviarDatosPenalDuelo(p, DUELO_ZONAS[Math.floor(Math.random() * 6)], 65, true);
      } else {
        enviarDatosPenalDuelo(p, DUELO_ZONAS[Math.floor(Math.random() * 6)], null, true);
      }
    });
  }

  function manejarEspacioBarraDuelo(e) {
    if (e.code === "Space") {
      e.preventDefault();
      detenerBarraDuelo();
    }
  }

  function htmlZonasArcoDuelo() {
    let html = "";
    DUELO_ZONAS.forEach(function(z) {
      html += "<button type='button' class='duelo-zona' data-zona='" + z + "' onclick=\"elegirZonaPenalDuelo('" + z + "')\">" +
        DUELO_ZONA_TXT[z].replace(/[^⬆️⬇️]/g, "").slice(0, 2) + "<small>" + z + "</small></button>";
    });
    return html;
  }

  function elegirZonaPenalDuelo(zona) {
    const pen = d.penales;
    const p = pen.p;
    if (pen.datosLocal[p]) return;
    if (papelEnPenalDuelo(p) === "pateador") {
      // El pateador necesita zona + potencia: si la barra sigue corriendo,
      // la zona queda preseleccionada y espera el frenado.
      pen.zonaPendiente = zona;
      document.querySelectorAll(".duelo-zona").forEach(function(b) {
        b.classList.toggle("seleccionada", b.dataset.zona === zona);
      });
      const paso1 = document.getElementById("duelo-paso-1");
      const paso2 = document.getElementById("duelo-paso-2");
      if (paso1) paso1.classList.add("completo");
      if (paso2) paso2.classList.add("activo");
      const estado = document.getElementById("duelo-penal-estado");
      if (estado) estado.innerHTML = "🎯 Zona elegida. Ahora frená la barra en la zona verde.";
      if (pen.barra && pen.barra.corriendo) return; // espera la potencia
      enviarDatosPenalDuelo(p, zona, Math.round(pen.barra ? pen.barra.pos : 65));
    } else {
      enviarDatosPenalDuelo(p, zona, null);
    }
  }

  function detenerBarraDuelo() {
    const pen = d.penales;
    const p = pen.p;
    if (!pen.barra || !pen.barra.corriendo) return;
    // Sin zona elegida NO se frena: evita mandar el tiro a una zona al azar.
    if (!pen.zonaPendiente) {
      const estado = document.getElementById("duelo-penal-estado");
      if (estado) estado.innerHTML = "👉 Primero elegí una zona del arco para saber a dónde va el tiro.";
      const paso1 = document.getElementById("duelo-paso-1");
      if (paso1) paso1.classList.add("activo");
      return;
    }
    pen.barra.corriendo = false;
    document.removeEventListener("keydown", manejarEspacioBarraDuelo);
    const potencia = Math.round(pen.barra.pos);
    enviarDatosPenalDuelo(p, pen.zonaPendiente, potencia);
  }

  function enviarDatosPenalDuelo(p, zona, potencia, porTimer) {
    const pen = d.penales;
    if (pen.datosLocal[p]) return;
    if (porTimer) {
      document.removeEventListener("keydown", manejarEspacioBarraDuelo);
      if (pen.barra) pen.barra.corriendo = false;
    }
    pen.datosLocal[p] = { zona: zona, potencia: potencia };
    pen.zonaPendiente = null;
    enviarDuelo({ t: "penal", p: p, zona: zona, potencia: potencia });
    const estado = document.getElementById("duelo-penal-estado");
    if (estado) estado.innerHTML = (porTimer ? "⏱️ Decisión automática por tiempo. " : "") + "📨 Enviado. Esperando al rival...";
    detenerTimerDuelo();
    resolverPenalSiListo(p);
  }

  function resolverPenalSiListo(p) {
    const pen = d.penales;
    if (!pen || pen.resueltos[p]) return;
    const dl = pen.datosLocal[p], dr = pen.datosRival[p];
    if (!dl || !dr) return;
    pen.resueltos[p] = true;

    const yoPatea = papelEnPenalDuelo(p) === "pateador";
    const res = yoPatea
      ? resolverPenalDuelo(dl.zona, dl.potencia, dr.zona, d.yo.ovr, d.rival.ovr)
      : resolverPenalDuelo(dr.zona, dr.potencia, dl.zona, d.rival.ovr, d.yo.ovr);

    let marcadorTxt = "";
    if (res.r === "gol") {
      if (yoPatea) { pen.golesYo++; } else { pen.golesRival++; }
      if (typeof sonidoGol === "function") sonidoGol();
      marcadorTxt = "⚽ ¡GOOOL!";
    } else if (res.r === "afuera") {
      if (typeof sonidoError === "function") sonidoError();
      marcadorTxt = "🥅 ¡LA TIRÓ AFUERA!";
    } else {
      if (typeof sonidoError === "function") sonidoError();
      marcadorTxt = "🧤 ¡ATAJADO!";
    }

    const detalle = yoPatea
      ? "Tu tiro: " + DUELO_ZONA_TXT[dl.zona] + " (potencia " + dl.potencia + ") — Arquero rival: " + DUELO_ZONA_TXT[dr.zona] + ". " + res.t
      : "Tiro rival: " + DUELO_ZONA_TXT[dr.zona] + " (potencia " + (dr.potencia == null ? "?" : dr.potencia) + ") — Te tiraste a: " + DUELO_ZONA_TXT[dl.zona] + ". " + res.t;

    actualizarModalDuelo(
      "<h2 class='" + (res.r === "gol" ? "text-success" : "text-danger") + "'>" + marcadorTxt + "</h2>" +
      "<p class='small'>" + detalle + "</p>" +
      "<h4 class='mt-3'>" + escaparDuelo(d.yo.apodo) + " <strong>" + pen.golesYo + "</strong> — <strong>" + pen.golesRival + "</strong> " + escaparDuelo(d.rival.apodo) + "</h4>",
      ""
    );

    enTarea(function() { siguientePenalDuelo(); }, 2600);
  }

  function cerrarTandaDuelo() {
    const pen = d.penales;
    // Muerte súbita: si empatan tras la tanda, se agregan de a 2 penales
    // (uno por lado) hasta 3 tandas extra; si sigue empatado, gana el de
    // mayor OVR y si empatan en OVR, queda empatado el Clásico.
    if (pen.golesYo === pen.golesRival) {
      if (pen.extras < 3) {
        pen.extras++;
        pen.total += 2;
        actualizarModalDuelo(
          "<h4>⚖️ ¡EMPATE! Vamos a MUERTE SÚBITA</h4><p>Tanda extra " + pen.extras + "/3: un penal por lado.</p>",
          ""
        );
        enTarea(function() { siguientePenalDuelo(); }, 2200);
        return;
      }
      cerrarClasicoDuelo(null);
      return;
    }
    cerrarClasicoDuelo(pen.golesYo > pen.golesRival);
  }

  function cerrarClasicoDuelo(gane) {
    const pen = d.penales;
    let html, titulo;
    if (gane === true) {
      titulo = "🏆 ¡GANASTE EL CLÁSICO!";
      d.yo.clasicosGanados++;
      d.yo.rivalidad += DUELO_CFG.PUNTOS_RIVALIDAD_CLASICO;
      d.yo.moral = Math.min(100, d.yo.moral + DUELO_CFG.BONUS_MORAL_CLASICO);
      d.yo.bonusPendiente += DUELO_CFG.BONUS_OVR_CLASICO;
      html =
        "<h4 class='text-success'>" + pen.golesYo + " — " + pen.golesRival + "</h4>" +
        "<p>🏆 Clásicos ganados: <strong>" + d.yo.clasicosGanados + "</strong></p>" +
        "<p>➕ <strong>+" + DUELO_CFG.BONUS_OVR_CLASICO + " OVR</strong> en la temporada siguiente</p>" +
        "<p>😊 <strong>+" + DUELO_CFG.BONUS_MORAL_CLASICO + " de Moral</strong></p>" +
        "<p>⚔️ <strong>+" + DUELO_CFG.PUNTOS_RIVALIDAD_CLASICO + " Puntos de Rivalidad</strong></p>";
      if (typeof lanzarConfeti === "function") lanzarConfeti(80);
      if (typeof sonidoExito === "function") sonidoExito();
    } else if (gane === false) {
      titulo = "😞 PERDISTE EL CLÁSICO";
      html = "<h4 class='text-danger'>" + pen.golesYo + " — " + pen.golesRival + "</h4>" +
        "<p>El rival se lleva las recompensas. Podés desquitarte en la próxima temporada.</p>";
      if (typeof sonidoError === "function") sonidoError();
    } else {
      titulo = "⚖️ CLÁSICO EMPATADO";
      html = "<h4>" + pen.golesYo + " — " + pen.golesRival + "</h4><p>Nadie se lleva las recompensas esta vez.</p>";
    }
    html += "<p class='small text-secondary mt-2'>Simulando la temporada...</p>";
    document.getElementById("modalDueloTitulo").innerHTML = titulo;
    actualizarModalDuelo(html, "");
    d.penales = null;
    enviarStatsDuelo("Clásico terminado");
    enTarea(function() { cerrarModalDuelo(); simularTemporadaDueloUI(); }, 3400);
  }

  // ============================================================
  //  SIMULACION DE TEMPORADA Y AVANCE
  // ============================================================
  function simularTemporadaDueloUI() {
    if (!d || !d.activo) return;
    const res = simularTemporadaDuelo(d.yo);
    d.yo.goles += res.goles;
    d.yo.asistencias += res.asistencias;
    if (res.subida > 0) {
      const reglas = (typeof REGLAS_MEDIA !== "undefined" && REGLAS_MEDIA[d.yo.club.reputacion]) || 99;
      d.yo.ovr = Math.min(reglas, d.yo.ovr + res.subida);
    }
    res.trofeos.forEach(function(tro) {
      const claves = { "Primera División": "primera", "Segunda División": "segunda", "Copa Argentina": "copaAr", "Copa Apa": "copaApa", "Copa de Campeones": "copaCam" };
      const clave = Object.keys(claves).find(function(k) { return tro.indexOf(k) !== -1; });
      if (clave) d.yo.trofeos[claves[clave]] = (d.yo.trofeos[claves[clave]] || 0) + 1;
    });
    d.yo.moral = Math.min(100, d.yo.moral + 5);
    d.yo.historial.push({ temporada: d.temporada, club: d.yo.club.nombre, partidos: res.partidos, goles: res.goles, asistencias: res.asistencias, ovr: d.yo.ovr });

    const arena = document.getElementById("duelo-arena");
    arena.innerHTML =
      '<h5 class="fw-bold">📊 Temporada ' + d.temporada + " — Resumen</h5>" +
      "<div class='row justify-content-center mt-3'>" +
      "<div class='col-6 col-md-3'><div class='border rounded p-2'><div class='fw-bold fs-4'>" + res.partidos + "</div><div class='small text-secondary'>Partidos</div></div></div>" +
      "<div class='col-6 col-md-3'><div class='border rounded p-2'><div class='fw-bold fs-4 text-success'>" + res.goles + "</div><div class='small text-secondary'>Goles</div></div></div>" +
      "<div class='col-6 col-md-3'><div class='border rounded p-2'><div class='fw-bold fs-4 text-info'>" + res.asistencias + "</div><div class='small text-secondary'>Asistencias</div></div></div>" +
      "<div class='col-6 col-md-3'><div class='border rounded p-2'><div class='fw-bold fs-4 text-warning'>" + d.yo.ovr + "</div><div class='small text-secondary'>OVR" + (res.subida > 0 ? " (+" + res.subida + ")" : "") + "</div></div></div>" +
      "</div>" +
      "<div class='mt-3'>" + (res.trofeos.length
        ? "<strong class='text-warning'>🏆 " + res.trofeos.map(escaparDuelo).join(" • ") + "</strong>"
        : "<span class='text-secondary'>Sin títulos esta temporada.</span>") + "</div>" +
      "<p class='small text-secondary mt-3'>Esperando al rival para avanzar a la temporada " + (d.temporada + 1) + "...</p>";

    enviarStatsDuelo("Temporada " + d.temporada + " lista");
    marcarListo("tempo");
  }

  // ============================================================
  //  RETIRO Y CAMPEON DEL DUELO
  // ============================================================
  function miResumenDuelo() {
    const h = d.yo.historial || [];
    const ovrMax = h.reduce(function(m, x) { return Math.max(m, x.ovr); }, d.yo.ovr);
    const ovrProm = h.length ? Math.round(h.reduce(function(a, x) { return a + x.ovr; }, 0) / h.length) : d.yo.ovr;
    const trofeosTotales = Object.keys(d.yo.trofeos).reduce(function(a, k) { return a + d.yo.trofeos[k]; }, 0);
    return {
      apodo: d.yo.apodo, ovrMax: ovrMax, ovrProm: ovrProm,
      goles: d.yo.goles, asistencias: d.yo.asistencias,
      clasicos: d.yo.clasicosGanados, rivalidad: d.yo.rivalidad,
      trofeos: trofeosTotales, detalleTrofeos: d.yo.trofeos, historial: h
    };
  }

  function faseRetiroDuelo() {
    if (!d || !d.activo) return;
    d.terminado = true;
    const arena = document.getElementById("duelo-arena");
    arena.innerHTML = "<h5 class='fw-bold text-center'>🏁 ¡RETIRO! Calculando el Campeón del Duelo...</h5>" +
      "<p class='small text-secondary text-center'>Esperando las estadísticas finales del rival...</p>";
    enviarStatsDuelo("Retirado. Calculando...");
    enviarDuelo({ t: "fin", resumen: miResumenDuelo() });
    d.resumenLocal = miResumenDuelo();
    // Confirmación server-side (idempotente). No bloquea ni cambia la pantalla.
    confirmarResultadoSeguroDuelo();
    if (d.resumenRival) mostrarFinalDuelo();
  }

  function mostrarPantallaAbandonoRival() {
    if (!d) return;
    d.activo = false;
    limpiarTimersDuelo();
    detenerTimerDuelo();
    cerrarModalDuelo();
    const arena = document.getElementById("duelo-arena");
    if (arena) {
      arena.innerHTML =
        "<h4 class='text-warning text-center'>🏳️ ¡EL RIVAL ABANDONÓ!</h4>" +
        "<p class='text-center mt-3'>Por abandono del rival, ganaste el Duelo.</p>" +
        '<div class="text-center mt-3 d-flex flex-wrap justify-content-center gap-2">' +
        '<button class="btn btn-pso fw-bold" onclick="jugarDeNuevoDuelo()">🔁 JUGAR DE NUEVO</button>' +
        '<button class="btn btn-outline-secondary fw-bold" onclick="volverInicioDuelo()">← Volver al inicio</button>' +
        "</div>";
    }
    if (typeof lanzarConfeti === "function") lanzarConfeti(60);
  }

  function abandonarDuelo() {
    if (!d || d.terminado) { volverInicioDuelo(); return; }
    if (!confirm("¿Seguro que querés abandonar el duelo? El rival será declarado ganador.")) return;
    enviarDuelo({ t: "abandono" });
    d.activo = false;
    limpiarTimersDuelo();
    detenerTimerDuelo();
    cerrarModalDuelo();
    const arena = document.getElementById("duelo-arena");
    if (arena) {
      arena.innerHTML = "<h4 class='text-center'>🏳️ Abandonaste el duelo.</h4>" +
        '<div class="text-center mt-3 d-flex flex-wrap justify-content-center gap-2">' +
        '<button class="btn btn-pso fw-bold" onclick="jugarDeNuevoDuelo()">🔁 JUGAR DE NUEVO</button>' +
        '<button class="btn btn-outline-secondary fw-bold" onclick="volverInicioDuelo()">← Volver al inicio</button>' +
        "</div>";
    }
  }

  function jugarDeNuevoDuelo() {
    cerrarSesionDuelo();
    salirDeColaDuelo();
    abrirPantallaDuelo({ autoBuscar: true });
  }

  function mostrarFinalDuelo() {
    if (!d || !d.resumenLocal || !d.resumenRival) return;
    limpiarTimersDuelo();
    detenerTimerDuelo();
    cerrarModalDuelo();

    const mio = d.resumenLocal, riv = d.resumenRival;
    const puntajeMio = calcularPuntajeDuelo(mio);
    const puntajeRiv = calcularPuntajeDuelo(riv);

    const gane = puntajeMio > puntajeRiv;
    const empate = puntajeMio === puntajeRiv;

    const arena = document.getElementById("duelo-arena");
    arena.innerHTML =
      "<div class='duelo-final-container'>" +
      // Título principal del campeón
      "<div class='duelo-campeon-banner " + (gane ? "text-success" : empate ? "text-warning" : "text-danger") + "'>" +
      (gane
        ? "<div class='duelo-campeon-titulo'>🏆 ¡CAMPEÓN DEL DUELO!</div>"
        : empate
        ? "<div class='duelo-campeon-titulo'>⚖️ DUELO LEGENDARIO</div>"
        : "<div class='duelo-campeon-titulo'>💀 CAMPEÓN DEL DUELO</div>") +
      "<div class='duelo-campeon-apodo'>" + escaparDuelo(gane ? mio.apodo : riv.apodo) + "</div>" +
      "<div class='duelo-campeon-puntaje'>" + (gane ? puntajeMio : puntajeRiv) + " PUNTOS</div>" +
      "</div>" +

      // Tabla comparativa
      "<div class='row mt-4'>" + htmlTablaComparacion(mio, riv) + "</div>" +

      // Sección de trofeos/títulos del campeón
      "<div class='duelo-trophies-section mt-4'>" +
      "<h5 class='fw-bold mb-3'>" + (gane ? "🏆 Tu Vitrina de Campeón" : empate ? "🏆 Vitrinas de Campeones" : "🏆 Vitrina del Campeón") + "</h5>" +
      "<div class='duelo-trophies-grid'>" +
      (gane ? renderTrophyGrid(mio) : empate ? renderTrophyGrid(mio) + renderTrophyGrid(riv) : renderTrophyGrid(riv)) +
      "</div>" +
      "</div>" +

      // Stats resumidas
      "<div class='duelo-stats-final row text-center mt-3'>" +
      "<div class='col-4'><div class='duelo-stat-box'><div class='fw-bold fs-4'>" + puntajeMio + "</div><div class='small text-secondary'>Tu Puntaje</div></div></div>" +
      "<div class='col-4'><div class='duelo-stat-box'><div class='duelo-vs fw-bold'>VS</div><div class='small text-secondary'>Final</div></div></div>" +
      "<div class='col-4'><div class='duelo-stat-box'><div class='fw-bold fs-4'>" + puntajeRiv + "</div><div class='small text-secondary'>Rival</div></div></div>" +
      "</div>" +

      "<div class='text-center mt-4 d-flex flex-wrap justify-content-center gap-2'>" +
      "<button class='btn btn-warning fw-bold px-4' onclick='jugarDeNuevoDuelo()'>🔁 JUGAR DE NUEVO</button>" +
      "<button class='btn btn-outline-secondary fw-bold' onclick='volverInicioDuelo()'>← Volver al inicio</button>" +
      "</div>" +
      "</div>";

    if (!empate && gane && typeof lanzarConfeti === "function") lanzarConfeti(120);
  }

  function renderTrophyGrid(r) {
    const dt = r.detalleTrofeos || {};
    const trofeos = [
      { key: "primera", label: "👑 Primera División", count: dt.primera || 0 },
      { key: "segunda", label: "🥈 Segunda División", count: dt.segunda || 0 },
      { key: "copaAr", label: "🏆 Copa Argentina", count: dt.copaAr || 0 },
      { key: "copaApa", label: "🏆 Copa Apa", count: dt.copaApa || 0 },
      { key: "copaCam", label: "🏆 Copa de Campeones", count: dt.copaCam || 0 }
    ];
    let html = "";
    trofeos.forEach(function(t) {
      if (t.count > 0) {
        html += "<div class='duelo-trophy-item text-center'>" +
          "<div class='duelo-trophy-icon fs-3'>" + t.label.split(" ")[0] + "</div>" +
          "<div class='duelo-trophy-name small'>" + t.label.replace(/^[^\s]+ /, "") + "</div>" +
          "<div class='duelo-trophy-count fw-bold text-warning'>" + t.count + "x</div>" +
          "</div>";
      }
    });
    if (!html) html = "<div class='text-secondary text-center p-3'>Sin títulos en la vitrina</div>";
    return html;
  }

  function htmlTablaComparacion(mio, riv) {
    function fila(etiqueta, v1, v2, invertir) {
      const g1 = invertir ? v1 < v2 : v1 > v2;
      const g2 = invertir ? v2 < v1 : v2 > v1;
      return "<tr><td class='" + (g1 ? "text-success fw-bold" : "") + "'>" + v1 + "</td>" +
        "<td class='text-center small text-secondary'>" + etiqueta + "</td>" +
        "<td class='" + (g2 ? "text-success fw-bold" : "") + "'>" + v2 + "</td></tr>";
    }
    return (
      "<div class='col-12'>" +
      "<table class='table table-sm tabla-historial text-center align-middle'>" +
      "<thead><tr><th>" + escaparDuelo(mio.apodo) + "</th><th>Comparación</th><th>" + escaparDuelo(riv.apodo) + "</th></tr></thead>" +
      "<tbody>" +
      fila("OVR Máximo", mio.ovrMax, riv.ovrMax) +
      fila("OVR Promedio", mio.ovrProm, riv.ovrProm) +
      fila("Goles", mio.goles, riv.goles) +
      fila("Asistencias", mio.asistencias, riv.asistencias) +
      fila("Clásicos 1v1 ganados", mio.clasicos, riv.clasicos) +
      fila("Puntos de Rivalidad", mio.rivalidad, riv.rivalidad) +
      fila("Trofeos (vitrina)", mio.trofeos, riv.trofeos) +
      "</tbody></table>" +
      "<div class='small text-secondary'>" +
      "🏆 <strong>Vitrina de " + escaparDuelo(mio.apodo) + ":</strong> " + escaparDuelo(vitrinaDuelo(mio)) + "<br>" +
      "🏆 <strong>Vitrina de " + escaparDuelo(riv.apodo) + ":</strong> " + escaparDuelo(vitrinaDuelo(riv)) + "</div>" +
      "<div class='small text-secondary mt-2'>Fórmula del Campeón: (OVR_Max × 15) + (OVR_Promedio × 10) + (Goles × 2) + (Asistencias × 1) + (Clásicos × 100)</div>" +
      "</div>"
    );
  }

  function vitrinaDuelo(r) {
    const dt = r.detalleTrofeos || {};
    const nombres = { primera: "Primera División", segunda: "Segunda División", copaAr: "Copa Argentina", copaApa: "Copa Apa", copaCam: "Copa de Campeones" };
    const partes = Object.keys(nombres).filter(function(k) { return dt[k] > 0; }).map(function(k) { return nombres[k] + " ×" + dt[k]; });
    return partes.length ? partes.join(", ") : "sin trofeos";
  }

  // ============================================================
  //  EXPORTS GLOBALES (onclick desde el HTML)
  // ============================================================
  window.abrirPantallaDuelo = abrirPantallaDuelo;
  window.volverInicioDuelo = volverInicioDuelo;
  window.crearSalaDuelo = crearSalaDuelo;
  window.unirseSalaDuelo = unirseSalaDuelo;
  window.buscarPartidoDuelo = buscarPartidoDuelo;
  window.cancelarBusquedaDuelo = cancelarBusquedaDuelo;
  window.jugarDeNuevoDuelo = jugarDeNuevoDuelo;
  window.entrenarDuelo = entrenarDuelo;
  window.elegirClubDuelo = elegirClubDuelo;
  window.elegirOpcionEventoDuelo = elegirOpcionEventoDuelo;
  window.clickReflejoDuelo = clickReflejoDuelo;
  window.arrancarClasicoDuelo = arrancarClasicoDuelo;
  window.elegirZonaPenalDuelo = elegirZonaPenalDuelo;
  window.detenerBarraDuelo = detenerBarraDuelo;
  window.abandonarDuelo = abandonarDuelo;

  window.addEventListener("beforeunload", function() {
    if (d && d.activo && !d.terminado) enviarDuelo({ t: "abandono" });
  });
})();
