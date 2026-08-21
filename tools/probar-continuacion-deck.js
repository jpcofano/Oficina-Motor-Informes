#!/usr/bin/env node
/**
 * tools/probar-continuacion-deck.js — **la rama de continuación devuelve `ok`, sin excepción**
 * (`docs/Prompts/2026-08-21_2_typeerror_continuacion.md`, Parte B), fuera de Apps Script y
 * cargando `Generador.gs` tal cual — mismo criterio que `probar-reloj-etapas.js`.
 *
 * ⭐ **Por qué existe, que es más importante que lo que prueba.** Al 21/08/2026 las tres suites del
 * repo estaban **todas en verde** — 18 afirmaciones del planificador, 14 de `resueltas`, 17 del
 * reloj — y **ninguna tocaba la rama de continuación**. Esa rama no tenía **una sola afirmación**.
 * El bug que se arregló acá —`copia.getName()` sobre una variable que sólo se asigna en la rama que
 * copia la plantilla— vivió desde el 20/08 con todos los controles pasando.
 *
 * **Una rama nueva que nunca se ejecutó no está sin probar: está sin escribir el control.** La
 * única corrida desatendida real salió por el camino *«no quedan secciones pendientes»*, que
 * devuelve **antes** de llamar a `generarInforme`, así que el verde de las tres suites no cubría
 * nada de lo que se había agregado.
 *
 * ⚠ **Qué es real acá y qué está falseado, dicho arriba y no al final.** Es **real todo
 * `generarInformeConCache_`**, de la primera línea al `return`: las precondiciones, la apertura del
 * deck, `abrirCorrida_`, `marcarEtapa_`, los puntos de control del reloj, la barrida,
 * `escribirFaltantes_`, `escribirCorrida_`, el sello y **la resolución del deck del retorno**, que
 * es lo que estaba roto. Están **falseadas** las plataformas (`DriveApp`, `SlidesApp`,
 * `SpreadsheetApp` con hojas en memoria) y las funciones de otros archivos — más
 * `resolverMarcadores`, que es de `Generador.gs` pero arrastra el motor entero y **no es lo que
 * este control mira**.
 *
 * **Lo que eso significa:** esto responde *"¿la rama de continuación vuelve?"*. **No** responde si
 * los números salen bien, ni si el deck queda pintado.
 *
 * Uso:
 *   node tools/probar-continuacion-deck.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/* ── una planilla en memoria ───────────────────────────────────────────────────────────────
 *
 * Con esto `abrirCorrida_`, `marcarEtapa_`, `escribirCorrida_` y `escribirFaltantes_` corren
 * **reales**. Importa: el `TypeError` que motiva este control estaba **después** del cierre, así
 * que un banco que saltee el cierre no llega al lugar del bug. */
function hojaEnMemoria(headers) {
  const filas = [headers.slice()];
  const hoja = {
    getName: () => 'hoja',
    getLastRow: () => filas.length,
    getLastColumn: () => headers.length,
    getDataRange: () => ({ getValues: () => filas.map(f => f.slice()) }),
    appendRow: (f) => { filas.push(f.slice()); },
    setFrozenRows: () => {},
    getRange: (fila, col, nFilas, nCols) => ({
      getValues: () => {
        const out = [];
        for (let i = 0; i < (nFilas || 1); i++) {
          const origen = filas[fila - 1 + i] || [];
          out.push(headers.map((_, k) => origen[col - 1 + k] !== undefined ? origen[col - 1 + k] : ''));
        }
        return out;
      },
      getValue: () => (filas[fila - 1] || [])[col - 1] || '',
      setValue: (v) => { while (filas.length < fila) filas.push([]); filas[fila - 1][col - 1] = v; },
      setValues: (m) => { m.forEach((f, i) => { while (filas.length < fila + i) filas.push([]); filas[fila - 1 + i] = f.slice(); }); },
      clearContent: () => { filas.length = 1; }
    })
  };
  hoja.__filas = filas;
  return hoja;
}

const HEADERS = {
  CORRIDAS: ['corrida_id', 'informe_id', 'periodo_id', 'deck_id', 'fecha_generacion',
    'tokens_reemplazados', 'faltantes', 'mapa_tokens'],
  FALTANTES: ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo']
};

/**
 * Arma el contexto y carga `Generador.gs`. `nombreInicial` es cómo se llama el deck en Drive
 * antes de la corrida — con sello si se está continuando uno a medio hacer.
 */
function contexto(nombreInicial) {
  const hojas = {
    CORRIDAS: hojaEnMemoria(HEADERS.CORRIDAS),
    FALTANTES: hojaEnMemoria(HEADERS.FALTANTES)
  };

  const drive = { nombre: nombreInicial, renombrados: 0 };
  const archivo = {
    getId: () => 'DECK1',
    getName: () => drive.nombre,
    getUrl: () => 'https://docs.google.com/presentation/d/DECK1/edit',
    getOwner: () => ({ getEmail: () => 'duenio@ejemplo.com' }),
    setName: (n) => { drive.nombre = n; drive.renombrados++; },
    makeCopy: () => archivo
  };
  const slide = { getObjectId: () => 'oid1', replaceAllText: () => 0 };
  const presentacion = { getSlides: () => [slide], replaceAllText: () => 0 };

  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    parseInt, parseFloat,
    Logger: { log: () => {} },
    Session: { getScriptTimeZone: () => 'GMT-3' },
    Utilities: { formatDate: () => '20260821-101010' },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => hojas[n] || null,
        insertSheet: (n) => (hojas[n] = hojaEnMemoria(HEADERS[n] || ['a'])),
        getSpreadsheetTimeZone: () => 'GMT-3'
      }),
      flush: () => {}
    },
    DriveApp: { getFolderById: () => ({}), getFileById: () => archivo },
    SlidesApp: { openById: () => presentacion },

    // ── de otros archivos del repo ──
    leerConfig: () => ({ carpeta_salida: 'CARPETA', presupuesto_corrida_seg: '350', reserva_cierre_seg: '30' }),
    leerInformes: () => ({ jm: { nombre: 'JM', plantilla_id: 'PL1' } }),
    resolverVentana: () => ({ ok: true, desde: new Date(2026, 7, 14), hasta: new Date(2026, 7, 20), origen: 'test' }),
    formatearFecha_: () => '14/08/2026',
    tokensPorSlide_: () => ({}),
    laminasEscondidas_: () => ({}),
    piezasDeTextoDeSlide_: () => [],
    // `Config.gs`. Devuelve la lista vacía: no hay marcadores cableados en el banco, y el
    // recorrido que interesa no depende de que haya.
    memoRegistro_: () => [],
    // `Secciones.gs`. Sin secciones repetibles el camino de la plantilla no expande nada, que es
    // lo que hace falta acá: lo que este control mira es el RETORNO, no la expansión.
    leerSeccionesPlano_: () => [],

    // ── de Generador.gs, pero fuera de lo que este control mira ──
    resolverMarcadores: () => ({ resultados: [], resumen: null })
  };

  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8'), ctx, { filename: 'Generador.gs' });
  ctx.__drive = drive;
  ctx.__hojas = hojas;
  return ctx;
}

/** Corre `generarInformeConCache_` y devuelve `{ ok, r, error }` — nunca tira. */
function correr(ctx, opciones) {
  ctx.__op = opciones;
  try {
    return { ok: true, r: vm.runInContext('generarInformeConCache_("jm", "", __op, Date.now())', ctx) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

console.log('Rama de continuación — código cargado de Generador.gs\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · ⭐ El control mínimo: continuar sobre un deck existente devuelve `ok`, sin excepción
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · continuar sobre un deck existente');
{
  const ctx = contexto('[en proceso] JM — 14 al 20 de agosto');
  const s = correr(ctx, {
    deck_id: 'DECK1', corrida_id: 'jm-20260821-101010', asignaciones: [], continuable: true
  });

  afirmar(s.ok, 'vuelve sin excepción' + (s.ok ? '' : ' — tiró ' + s.error.constructor.name + ': ' + s.error.message));
  if (s.ok) {
    afirmar(s.r.ok === true, 'y devuelve ok: true');

    /* ⚠ **`ok: true` NO significa que la corrida haya terminado**, y el primer intento de este
     * control se comió justo eso: el banco corrió con un stub de menos, la corrida murió por
     * excepción en la etapa 2, `generarInforme` la atrapó —que es lo correcto— y devolvió
     * `ok: true` con el `fallo` adentro. **Seis afirmaciones en verde sobre un recorrido que no
     * llegó al cierre**, o sea sobre el lugar donde vive el bug que este control mira.
     *
     * `fallo` y `corte` en `null` es lo que hace que las de abajo signifiquen algo. */
    afirmar(s.r.fallo === null,
      'y terminó el recorrido entero, sin excepción adentro' +
      (s.r.fallo ? ' — ⛔ murió en "' + s.r.fallo.etapa + '": ' + s.r.fallo.mensaje : ''));
    afirmar(s.r.corte === null,
      'y sin corte por presupuesto' + (s.r.corte ? ' — ⛔ cortó en ' + s.r.corte.etapa : ''));
    afirmar(s.r.deck && s.r.deck.id === 'DECK1', 'el deck del retorno es el que se continuó');
    afirmar(!!(s.r.deck && s.r.deck.nombre), 'trae nombre: "' + (s.r.deck ? s.r.deck.nombre : '') + '"');
    afirmar(!!(s.r.deck && s.r.deck.url), 'trae url');
    afirmar(!!(s.r.deck && s.r.deck.dueno), 'trae dueño: ' + (s.r.deck ? s.r.deck.dueno : ''));

    // ⭐ El nombre sale del ARCHIVO, no de una variable vieja: el cierre le acaba de quitar el
    // sello, así que leerlo de `copia` habría devuelto el nombre CON sello incluso cuando andaba.
    afirmar(s.r.deck.nombre.indexOf('[en proceso] ') !== 0,
      'y es el nombre de DESPUÉS del cierre, sin el sello de en-proceso');

    // El cierre corrió de verdad: la fila de CORRIDAS quedó cerrada.
    const filas = ctx.__hojas.CORRIDAS.__filas;
    afirmar(filas.length === 2 && filas[1][4] !== '',
      'y la fila de CORRIDAS quedó cerrada con fecha — el cierre corrió, no se saltó');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⚠ Romper a propósito: devolver `copia` a la línea y verificar que el control caiga
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Si no cae con `TypeError`, este control no mide lo que dice. */
console.log('\n2 · romper a propósito: con `copia` de vuelta, tiene que tirar TypeError');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const buena = 'deck: { id: deckId, nombre: nombreDeck, url: urlDeck, dueno: dueno },';
  const rota = 'deck: { id: deckId, nombre: copia.getName(), url: copia.getUrl(), dueno: dueno },';

  if (texto.indexOf(buena) === -1) {
    fallas++;
    console.log('  ❌ no encontré la línea del retorno — si se reescribió, esta prueba tiene que enterarse:');
    console.log('     ' + buena);
  } else {
    const ctx = contexto('[en proceso] JM — 14 al 20 de agosto');
    // Se recarga el fuente con el bug reintroducido, sobre el mismo contexto ya armado.
    vm.runInContext(texto.replace(buena, rota), ctx, { filename: 'Generador.gs (roto)' });
    const s = correr(ctx, {
      deck_id: 'DECK1', corrida_id: 'jm-roto', asignaciones: [], continuable: true
    });

    afirmar(!s.ok, 'con el bug reintroducido, la rama de continuación tira');
    /* ⚠ **`instanceof TypeError` NO sirve acá y da un rojo engañoso:** el error nace dentro del
     * contexto de `vm`, que tiene sus propios constructores, así que no es el `TypeError` de este
     * realm por más que lo sea. Se compara por nombre, que es lo que se puede afirmar de verdad. */
    afirmar(!s.ok && s.error && s.error.name === 'TypeError',
      'y es un TypeError: "' + (s.ok ? '(no tiró)' : s.error.message) + '"');
    afirmar(!s.ok && /getName/.test(String(s.error.message)),
      'y falla exactamente en `copia.getName()`, no en otra cosa');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · El caso simétrico: SIN `deck_id` también vuelve
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Un arreglo que rompiera el camino de siempre pasaría el punto 1 sin que nadie se enterara. */
console.log('\n3 · el camino de siempre — copiar la plantilla — sigue andando');
{
  const ctx = contexto('JM — plantilla');
  const s = correr(ctx, {});

  afirmar(s.ok, 'vuelve sin excepción' + (s.ok ? '' : ' — ' + s.error.message));
  if (s.ok) {
    afirmar(s.r.ok === true, 'y devuelve ok: true');
    // El mismo aviso que arriba, y por el mismo motivo: `ok: true` convive con un `fallo`.
    afirmar(s.r.fallo === null && s.r.corte === null,
      'y terminó el recorrido entero, sin excepción ni corte adentro' +
      (s.r.fallo ? ' — ⛔ ' + s.r.fallo.etapa + ': ' + s.r.fallo.mensaje : ''));
    afirmar(!!(s.r.deck && s.r.deck.nombre && s.r.deck.url && s.r.deck.dueno),
      'con nombre, url y dueño — el retorno no depende de qué rama se tomó');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · El barrido de la MISMA clase de bug
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * ⭐ **No alcanza con la línea que falló.** Toda variable que se asigne únicamente en una rama del
 * `if (continuando) … else …` y se lea después es el mismo error esperando, y las dos ramas
 * compilan igual. Esto lo mide sobre el fuente en vez de confiar en que alguien miró. */
console.log('\n4 · ninguna variable de una sola rama se desreferencia después del if/else');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const ini = texto.indexOf('function generarInformeConCache_(');
  let i = texto.indexOf('{', ini), nivel = 0, fin = -1;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}' && --nivel === 0) { fin = j + 1; break; }
  }
  const lineas = texto.slice(ini, fin).split('\n');

  // Las `var X;` sin inicializar son exactamente las que pueden quedar `undefined`.
  const sinInit = /^\s*var\s+([A-Za-z_$][\w$]*)\s*;\s*$/;
  const sospechosas = [];
  lineas.forEach((l, k) => {
    const m = l.match(sinInit);
    if (!m) return;
    const v = m.group === undefined ? m[1] : m[1];
    const usos = [];
    for (let k2 = k + 1; k2 < lineas.length; k2++) {
      const s = lineas[k2].trim();
      if (s.startsWith('*') || s.startsWith('//') || s.startsWith('/*')) continue;   // comentarios no
      if (new RegExp('(?<![\\w$.])' + v + '\\s*\\.').test(lineas[k2])) usos.push(lineas[k2].trim());
    }
    sospechosas.push({ v, usos });
  });

  afirmar(sospechosas.length > 0,
    'se examinaron ' + sospechosas.length + ' variable(s) declaradas sin inicializar — cero sería el problema');

  /* ⚠ `copia` es la excepción legítima y por eso se la nombra: su única desreferencia
   * (`deckId = copia.getId()`) está **adentro de la rama que la asigna**, una línea después.
   * Excluirla por nombre sería una lista blanca que crece sola; se la mide igual y se afirma
   * que su uso es exactamente ése. */
  sospechosas.forEach(({ v, usos }) => {
    const afuera = usos.filter(u => u.indexOf('deckId = copia.getId()') === -1);
    afirmar(afuera.length === 0,
      '`' + v + '`: ' + usos.length + ' desreferencia(s), ninguna fuera de su propia rama' +
      (afuera.length ? ' — ⛔ ' + afuera.join(' | ') : ''));
  });
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si la reanudación produce el deck correcto. Acá se pinta cero: `resolverMarcadores`');
console.log('     está falseada y las asignaciones van vacías. Sólo se afirma que la rama VUELVE.');
console.log('   · Si el ciclo desatendido cierra. Eso necesita trigger, lock y una corrida real.');
console.log('   · Nada sobre Drive ni Slides de verdad: las dos plataformas están falseadas.');

process.exit(fallas === 0 ? 0 : 1);
