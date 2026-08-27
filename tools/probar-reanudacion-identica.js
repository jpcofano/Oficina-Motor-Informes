#!/usr/bin/env node
/**
 * tools/probar-reanudacion-identica.js — **reanudar tiene que dar lo MISMO que correr entero**
 * (`docs/Prompts/2026-08-26_2_corrida_nocturna_front.md`, Parte D).
 *
 * ⛔⛔ **Por qué existe: el particionado por lámina (`D-41`) está escrito desde el 24/08 y NUNCA se
 * corrió cortando de verdad.** `probar-continuacion-deck.js` prueba que la rama de continuación
 * **vuelve**, que era el `TypeError` del 21/08 — y eso es otra pregunta. `CLAUDE.md` §4: *una rama
 * nueva que nunca se ejecutó no está sin probar, está sin escribir el control*.
 *
 * ⚠ **Y «no falla» no alcanza, que es la instrucción textual de la Parte D:** un reanudador que
 * saltea una lámina **no falla** — publica un deck incompleto. El control que decide es la
 * **identidad**: el conjunto de láminas resueltas al terminar tiene que ser el mismo por los dos
 * caminos.
 *
 * ⭐ **Cómo se mide, y es lo que lo vuelve barato:** se espía `resolverMarcadores` y se registra
 * qué `solo_marcadores` recibe en cada llamada. Eso dice **exactamente** qué lámina resolvió cada
 * tanda, sin mirar el deck ni simular Slides. La etapa 4 real —`agruparTokensPorLamina_`, el
 * checkpoint del reloj, el bucle— corre entera.
 *
 * ⚠ **Lo que NO prueba, arriba y no al final:** que el deck quede pintado. `replaceAllText` está
 * falseado. Esto responde *«¿la reanudación cubre las mismas láminas?»*, no *«¿el pixel quedó?»*.
 *
 * Uso:
 *   node tools/probar-reanudacion-identica.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let hechas = 0;
function afirmar(condicion, mensaje) {
  hechas++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/* ── una planilla en memoria ────────────────────────────────────────────────────────────────
 * Copiada de `probar-continuacion-deck.js`: con esto `abrirCorrida_`, `marcarEtapa_`,
 * `escribirCorrida_` y `escribirFaltantes_` corren **reales**, que es donde vive el cierre. */
function hojaEnMemoria(headers) {
  const filas = [headers.slice()];
  const hoja = {
    getName: () => 'hoja',
    getLastRow: () => filas.length,
    getLastColumn: () => headers.length,
    getDataRange: () => ({ getValues: () => filas.map(f => f.slice()) }),
    appendRow: (f) => { filas.push(f.slice()); },
    setFrozenRows: () => {},
    getMaxColumns: () => headers.length,
    insertColumnsAfter: () => {},
    getRange: (fila, col, nFilas, nCols) => ({
      getValues: () => {
        const out = [];
        const ancho = nCols || headers.length;
        for (let i = 0; i < (nFilas || 1); i++) {
          const origen = filas[fila - 1 + i] || [];
          const linea = [];
          for (let k = 0; k < ancho; k++) linea.push(origen[col - 1 + k] !== undefined ? origen[col - 1 + k] : '');
          out.push(linea);
        }
        return out;
      },
      getValue: () => (filas[fila - 1] || [])[col - 1] || '',
      setValue: (v) => { while (filas.length < fila) filas.push([]); filas[fila - 1][col - 1] = v; },
      setValues: (m) => {
        m.forEach((f, i) => {
          const n = fila - 1 + i;
          while (filas.length <= n) filas.push([]);
          const destino = filas[n];
          f.forEach((v, k) => { destino[col - 1 + k] = v; });
        });
        if (fila === 1) { headers.length = 0; filas[0].forEach(h => headers.push(h)); }
      },
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
const HOJAS_CONFIG_ = {
  CORRIDAS: { headers: HEADERS.CORRIDAS },
  FALTANTES: { headers: HEADERS.FALTANTES.concat(['causa']) },
  FALTANTES_PREVIO: { headers: HEADERS.FALTANTES.concat(['causa']) }
};

/* ⭐ **Seis láminas con tres tokens cada una — el fixture es la FORMA, no un deck real.**
 * Lo que importa es que sean varias y que el corte pueda caer en el medio. Un token por lámina
 * no distinguiría «se salteó la lámina» de «se salteó un token». */
const TOKENS_POR_SLIDE = {};
for (let s = 1; s <= 6; s++) {
  for (let t = 1; t <= 3; t++) TOKENS_POR_SLIDE['tok_s' + s + '_' + t] = [s];
}
const LAMINAS_ESPERADAS = [1, 2, 3, 4, 5, 6];

/**
 * Arma el contexto. `presupuesto` en segundos y `costoPorLamina` en milisegundos de reloj
 * simulado: con eso el checkpoint del reloj corta donde uno quiere, sin `sleep`.
 *
 * ⭐ **El reloj se mueve falseando `Date`, no parcheando el motor.** `controlDeEtapa_` y
 * `entraEnElPresupuesto_` corren **reales**: si se parchearan, el control mediría un corte
 * inventado en vez del corte del motor — el instrumento que reproduce lógica y la reproduce peor.
 */
function contexto(opciones) {
  const o = opciones || {};
  const hojas = {
    CORRIDAS: hojaEnMemoria(HEADERS.CORRIDAS),
    FALTANTES: hojaEnMemoria(HEADERS.FALTANTES)
  };
  const drive = { nombre: o.nombreInicial || 'JM' };
  const archivo = {
    getId: () => 'DECK1',
    getName: () => drive.nombre,
    getUrl: () => 'https://docs.google.com/presentation/d/DECK1/edit',
    getOwner: () => ({ getEmail: () => 'duenio@ejemplo.com' }),
    setName: (n) => { drive.nombre = n; },
    makeCopy: () => archivo
  };
  const slides = [];
  for (let s = 1; s <= 6; s++) slides.push({ getObjectId: () => 'oid' + s, replaceAllText: () => 0 });
  const presentacion = { getSlides: () => slides, replaceAllText: () => 0 };

  /* El reloj simulado. Cada lámina de la etapa 4 «cuesta» `costoPorLamina` ms; el resto de las
   * llamadas a `new Date()` no mueven la aguja, así que el gasto es atribuible. */
  const reloj = { ms: 1000000 };
  function FechaFalsa() { this.__t = reloj.ms; }
  FechaFalsa.prototype.getTime = function () { return this.__t; };
  FechaFalsa.prototype.toISOString = function () { return '2026-08-26T00:00:00.000Z'; };
  /* ⚠ `formatearPeriodoLamina_` pide `getDay()`: una fecha falsa que sólo tenga `getTime`
   * tumba la corrida en la etapa 0 y el `try/catch` del motor lo devuelve como `fallo` — o sea
   * `ok: true` sobre un recorrido que no llegó a ninguna etapa. Es la trampa que
   * `probar-continuacion-deck.js` ya documentó. */
  FechaFalsa.prototype.getDay = function () { return 5; };
  FechaFalsa.prototype.getDate = function () { return 14; };
  FechaFalsa.prototype.getMonth = function () { return 7; };
  FechaFalsa.prototype.getFullYear = function () { return 2026; };

  const espia = { llamadas: [] };

  const ctx = {
    console, Math, JSON, String, Number, Object, Array, RegExp, isNaN, Error, parseInt, parseFloat,
    Date: FechaFalsa,
    Logger: { log: () => {} },
    Session: { getScriptTimeZone: () => 'GMT-3' },
    Utilities: { formatDate: () => '20260826-000000' },
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

    leerConfig: () => ({
      carpeta_salida: 'CARPETA',
      presupuesto_corrida_seg: String(o.presupuesto === undefined ? 3600 : o.presupuesto),
      reserva_cierre_seg: '5',
      costo_lamina_etapa4_seg: '1'
    }),
    leerInformes: () => ({ jm: { nombre: 'JM', plantilla_id: 'PL1' } }),
    resolverVentana: () => ({ ok: true, desde: new FechaFalsa(), hasta: new FechaFalsa(), origen: 'test' }),
    formatearFecha_: () => '14/08/2026',
    tokensPorSlide_: () => {
      const copia = {};
      Object.keys(TOKENS_POR_SLIDE).forEach(k => { copia[k] = TOKENS_POR_SLIDE[k].slice(); });
      return copia;
    },
    laminasEscondidas_: () => ({}),
    piezasDeTextoDeSlide_: () => [],
    memoRegistro_: () => [],
    leerSeccionesPlano_: () => [],
    HOJAS_CONFIG_,

  };

  vm.createContext(ctx);
  for (const f of ['Sellador.gs', 'Generador.gs']) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
  }
  /* ⛔⛔ **El espía se instala DESPUÉS de cargar los `.gs`, y esto costó un rojo.**
   * `resolverMarcadores` está **declarada en `Generador.gs`**, así que ponerla en el objeto del
   * contexto no sirve: al cargar el archivo, su declaración **pisa el stub en silencio** y el
   * espía registra **cero llamadas** mientras la etapa 4 corre perfecto. Es exactamente la
   * trampa que `probar-solo-marcadores.js` documenta con `leerMarcadores_`.
   *
   * ⚠ Y el síntoma es el de siempre: **no es un error**. El banco daba `hechas: [1..6]` en el
   * reporte del motor y `0` en el instrumento propio — dos números que no se contradicen a
   * simple vista. */
  ctx.__espiaFn = function (informeId, opcs) {
    const tokens = (opcs && opcs.solo_marcadores) || [];
    if (tokens.length) {
      espia.llamadas.push(tokens.slice().sort());
      reloj.ms += (o.costoPorLamina === undefined ? 0 : o.costoPorLamina);
    }
    return { resultados: [], resumen: null };
  };
  vm.runInContext('resolverMarcadores = __espiaFn;', ctx);

  ctx.__espia = espia;
  ctx.__reloj = reloj;
  ctx.__drive = drive;
  return ctx;
}

/** Las láminas que una corrida resolvió, deducidas de los tokens que pidió. */
function laminasResueltas(espia) {
  const vistas = {};
  espia.llamadas.forEach((tokens) => {
    tokens.forEach((t) => {
      const m = /^tok_s(\d+)_/.exec(t);
      if (m) vistas[Number(m[1])] = true;
    });
  });
  return Object.keys(vistas).map(Number).sort((a, b) => a - b);
}

function correr(ctx, opcs) {
  ctx.__o = opcs || {};
  /* ⭐ `generarInformeConCache_` y no `generarInforme`: el envoltorio sólo enciende las dos
   * cachés de plataforma, y **el recorrido entero —etapas, checkpoints, cierre— vive acá**.
   * Mismo criterio que `probar-continuacion-deck.js`. El último argumento es el `t0` de la
   * corrida: un literal, porque `Date` está falseado y no tiene `now()`. */
  return vm.runInContext('generarInformeConCache_("jm", "", __o, 1000000)', ctx);
}

console.log('Reanudar contra correr entero — Generador.gs cargado tal cual\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · El control POSITIVO: la corrida entera. Sin esto no hay contra qué comparar.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · ⭐ el control positivo — la corrida ENTERA');
let ENTERA = null;
{
  const ctx = contexto({ presupuesto: 3600, costoPorLamina: 0 });
  const r = correr(ctx);
  ENTERA = laminasResueltas(ctx.__espia);

  afirmar(r.ok === true, 'la corrida entera devuelve `ok`');
  /* ⚠ `ok: true` convive con un fallo adentro: `generarInforme` atrapa a propósito para que la
   * fila de `CORRIDAS` cierre. Un control de «vuelve» que no exija esto mide que la función
   * existe (`CLAUDE.md` §4). */
  afirmar(!r.fallo, 'y SIN fallo — ' + (r.fallo ? r.fallo.etapa + ': ' + r.fallo.mensaje : 'ninguno'));
  afirmar(!r.corte, 'y sin corte: con presupuesto de sobra tiene que terminar');
  afirmar(ENTERA.join(',') === LAMINAS_ESPERADAS.join(','),
    '⭐ resolvió las 6 láminas — ' + ENTERA.join(', ') +
    ' (si esto no diera 6, todo lo de abajo compararía contra nada)');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · La corrida que CORTA, y que es la que nunca se había ejercitado
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · ⭐ la corrida que corta por presupuesto en el medio de la etapa 4');
let TANDA1 = null;
let RESULTADO1 = null;
{
  /* ⭐⭐ **El presupuesto se BUSCA, no se elige** — y esto salió de un rojo, no de la prudencia.
   *
   * Escrito con un número a ojo (20 s), el corte caía **antes** de la etapa 4: cero láminas
   * resueltas. Todo lo de abajo habría quedado en verde **midiendo un corte que no es el de
   * `D-41`** — la reanudación de un deck donde la etapa 4 nunca empezó no prueba el particionado
   * por lámina, prueba otra cosa. Lo cazó la afirmación de «corte PARCIAL», que está justamente
   * para eso.
   *
   * ⚠ **Y un número fijo sería la cuarta constante que nadie vuelve a mirar** (`CLAUDE.md` §4):
   * el día que cambie una estimación de etapa, el banco volvería a medir el corte equivocado
   * **sin ponerse rojo**. Acá se prueban presupuestos crecientes y se toma el primero que corta
   * DENTRO de la etapa 4, con la lámina donde cortó dicha en el log. */
  let calibrado = null;
  /* ⚠ **En DOS dimensiones, y el motivo se midió:** con un sólo costo por lámina no hay ningún
   * presupuesto que sirva. Abajo de cierto piso el corte cae en la etapa 2 —que se estima con
   * `costoMapaSeg_()`— y arriba de ese piso la etapa 4 entera entra. La ventana existe sólo
   * cuando la lámina cuesta lo bastante como para que el presupuesto se agote **adentro**. */
  const COSTOS = [6000, 15000, 30000, 60000];
  for (const costo of COSTOS) {
    for (let presupuesto = 15; presupuesto <= 600 && !calibrado; presupuesto += 5) {
      const c = contexto({ presupuesto: presupuesto, costoPorLamina: costo });
      const res = correr(c);
      const lams = laminasResueltas(c.__espia);
      if (res.corte && lams.length > 0 && lams.length < LAMINAS_ESPERADAS.length) {
        calibrado = { presupuesto: presupuesto, costo: costo, ctx: c, r: res, laminas: lams };
      }
    }
    if (calibrado) break;
  }
  if (!calibrado) {
    fallas++; hechas++;
    console.log('  ❌ no se encontró ningún presupuesto que corte DENTRO de la etapa 4 — ' +
      'este banco no puede medir la reanudación del particionado así');
  }
  const ctx = calibrado ? calibrado.ctx : contexto({ presupuesto: 20, costoPorLamina: 6000 });
  RESULTADO1 = calibrado ? calibrado.r : correr(ctx);
  TANDA1 = laminasResueltas(ctx.__espia);
  if (calibrado) console.log('  ⓘ calibrado: presupuesto ' + calibrado.presupuesto + ' s con ' +
    (calibrado.costo / 1000) + ' s por lámina → corta tras ' + calibrado.laminas.length + ' de ' +
    LAMINAS_ESPERADAS.length + ' láminas');

  afirmar(RESULTADO1.ok === true, 'la corrida cortada TAMBIÉN devuelve `ok` — el corte es ordenado');
  afirmar(!RESULTADO1.fallo, 'y sin fallo: cortar no es fallar');
  afirmar(!!RESULTADO1.corte, '⭐ y CORTÓ — ' + (RESULTADO1.corte ? RESULTADO1.corte.clase || 'sin clase' : 'NO CORTÓ'));

  /* ⭐ **El corte tiene que ser PARCIAL para que la comparación signifique algo.** Si cortara
   * antes de la primera lámina o después de la última, la tanda 2 no probaría una reanudación:
   * probaría una corrida entera con otro nombre. */
  afirmar(TANDA1.length > 0 && TANDA1.length < LAMINAS_ESPERADAS.length,
    '⭐ y cortó PARCIAL: resolvió ' + TANDA1.length + ' de ' + LAMINAS_ESPERADAS.length +
    ' láminas (' + TANDA1.join(', ') + ') — un corte total o nulo no probaría nada');

  /* ⚠ El orden importa: `agruparTokensPorLamina_` ordena por número de lámina justamente para
   * que lo que queda sin pintar sea **la cola** del deck y no un hueco del medio. */
  afirmar(TANDA1.join(',') === LAMINAS_ESPERADAS.slice(0, TANDA1.length).join(','),
    '⚠ y lo que quedó sin pintar es la COLA del deck, no un hueco del medio');

  const cont = RESULTADO1.continuacion || {};
  afirmar(cont.se_corto === true, '`continuacion.se_corto` viaja en true');
  afirmar(Array.isArray(cont.laminas_etapa4_hechas) &&
          cont.laminas_etapa4_hechas.length === TANDA1.length,
    '⭐ y `laminas_etapa4_hechas` declara las ' + TANDA1.length + ' que se pintaron');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⭐⭐ LA AFIRMACIÓN QUE DECIDE — reanudar cubre lo mismo que correr entero
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
/* ═════════════════════════════════════════════════════════════════════════════════════════
 * 2 bis · ⛔⛔ EL BUG QUE ESTE BANCO ENCONTRÓ — cortar ANTES de la etapa 4
 * ═════════════════════════════════════════════════════════════════════════════════════════
 *
 * ⛔ **Es el caso NORMAL de la corrida desatendida** —corta en la etapa 3, con secciones
 * pendientes— y hasta el 26/08 moría con `TypeError`. Las cuatro variables de `D-41` se
 * declaraban dentro de `if (!corte)`, y el retorno hacía `laminasDeEtapa4.length` **fuera del
 * `try/catch`**: la fila de `CORRIDAS` quedaba sin cerrar y sin plan para continuar.
 *
 * ⭐⭐ **El mismo error que `copia.getName()` del 21/08, en la misma función**, y el barrido de
 * aquel día dijo *«dio una sola»* con razón: estas cuatro nacieron el 24/08. Un cero medido vale
 * para su fecha. */
console.log('\n2 bis · ⛔ cortar ANTES de la etapa 4 — el caso normal del desatendido');
{
  /* Presupuesto mínimo: el corte cae en una etapa anterior y la etapa 4 no llega a correr. */
  const ctx = contexto({ presupuesto: 1, costoPorLamina: 0 });
  let excepcion = null;
  let r = null;
  try { r = correr(ctx); } catch (e) { excepcion = e; }

  afirmar(excepcion === null,
    '⭐⭐ NO tira excepción' + (excepcion ? ' — ⛔ ' + excepcion.name + ': ' + excepcion.message : '') +
    ' — antes del 26/08 acá moría con TypeError, fuera del try/catch');
  afirmar(!!r && r.ok === true, 'y devuelve `ok`: el corte se reporta, no se propaga');
  afirmar(!!r && !!r.corte, 'y CORTÓ, que es lo que este escenario necesita');
  afirmar(laminasResueltas(ctx.__espia).length === 0,
    'con la etapa 4 sin ejecutar: 0 láminas resueltas');

  /* ⭐ **Y el reporte lo DICE, que es la otra mitad.** `total: 0` solo no distingue «no se
   * ejecutó» de «se ejecutó y no había láminas», y esas dos mandan a trabajos opuestos — la
   * misma familia que el `/////` que no separaba «nadie lo cableó» de «no se llegó». */
  const e4 = (r && r.presupuesto && r.presupuesto.etapa4_por_lamina) || {};
  afirmar(e4.corrio === false,
    '⭐ y el reporte declara `corrio: false` — sin eso, `total: 0` se lee como «no había láminas»');

  /* ⚠ El control positivo del flag: uno que fuera siempre `false` pasaría el aserto de arriba. */
  const ctxEntero = contexto({ presupuesto: 3600, costoPorLamina: 0 });
  const rEntero = correr(ctxEntero);
  afirmar(rEntero.presupuesto.etapa4_por_lamina.corrio === true,
    '⚠ y en la corrida entera `corrio: true` — el flag distingue, no es siempre false');
}

console.log('\n3 · ⭐⭐ reanudar sobre el deck cortado');
let TANDA2 = null;
{
  const cont = RESULTADO1.continuacion || {};
  /* La reanudación real: mismo deck, con el sello puesto. Es el camino que el `2026-08-21_2`
   * arregló y que **la única corrida desatendida real nunca ejecutó** — salió por «no quedan
   * secciones pendientes», que devuelve antes de llamar a `generarInforme`. */
  const ctx = contexto({ presupuesto: 3600, costoPorLamina: 0, nombreInicial: '[en proceso] JM' });
  const r2 = correr(ctx, { deck_id: cont.deck_id, laminas_etapa4_hechas: cont.laminas_etapa4_hechas });
  TANDA2 = laminasResueltas(ctx.__espia);

  afirmar(r2.ok === true, 'la reanudación devuelve `ok`');
  afirmar(!r2.fallo, 'y SIN fallo — ' + (r2.fallo ? r2.fallo.etapa + ': ' + r2.fallo.mensaje : 'ninguno'));
  afirmar(!r2.corte, 'y sin corte: con presupuesto de sobra tiene que terminar el resto');

  /* ⭐⭐ **La identidad.** No «no falla»: que la UNIÓN de las dos tandas sea exactamente lo que
   * produce la corrida entera. Un reanudador que saltea una lámina pasa todo lo de arriba. */
  const union = Array.from(new Set(TANDA1.concat(TANDA2))).sort((a, b) => a - b);
  afirmar(union.join(',') === ENTERA.join(','),
    '⭐⭐ tanda 1 ∪ tanda 2 = la corrida entera — ' + union.join(', ') + ' contra ' + ENTERA.join(', '));

  const faltaron = ENTERA.filter((n) => union.indexOf(n) === -1);
  afirmar(faltaron.length === 0,
    '⭐ ninguna lámina se perdió entre tandas' + (faltaron.length ? ' — faltaron ' + faltaron.join(', ') : ''));
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · ⛔ Lo que la medición encontró y NO es lo que el código dice que hace
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · ⛔ el hallazgo: `laminas_etapa4_hechas` no lo lee nadie');
{
  /* ⛔⛔ **Medido acá, no razonado.** El comentario de `laminas_etapa4_hechas` dice que existe
   * *«para que la reanudación no repinte»*, y `grep -rn laminas_etapa4_hechas *.gs` devuelve **una
   * sola línea: donde se escribe**. Nadie lo consume. Es la columna declarada sin lector, la misma
   * familia que `datos.origen` de la Parte A.
   *
   * ⚠ **Y el efecto no es un deck roto: es costo.** La tanda 2 vuelve a resolver TODAS las
   * láminas, incluidas las que la tanda 1 ya pintó. El deck no se corrompe —`replaceAllText` no
   * encuentra `{{token}}` donde ya hay valor—, así que **funciona por accidente y se paga dos
   * veces**. Este aserto fija el comportamiento REAL de hoy: si algún día se implementa el
   * salteo, se pone rojo, **y eso es exactamente lo que tiene que pasar**. */
  const repetidas = TANDA1.filter((n) => TANDA2.indexOf(n) !== -1);
  afirmar(repetidas.length === TANDA1.length,
    '⛔ la tanda 2 RE-RESUELVE las ' + repetidas.length + ' láminas que la tanda 1 ya había ' +
    'pintado — `laminas_etapa4_hechas` se emite y nadie lo lee (hallazgo, 26/08)');
  afirmar(TANDA2.join(',') === ENTERA.join(','),
    '⛔ o sea que la tanda 2 resuelve el deck ENTERO, no el resto: ' + TANDA2.join(', '));
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · ⚠ Romper a propósito — sin esto, nada de arriba mide
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · ⚠ el control negativo');
{
  /* Un reanudador que saltea una lámina **no falla**. Se simula sacando la última lámina del
   * agrupador y se verifica que la sección 3 lo cazaría. */
  const ctx = contexto({ presupuesto: 3600, costoPorLamina: 0 });
  const antes = vm.runInContext('agruparTokensPorLamina_.toString()', ctx);
  vm.runInContext(
    'agruparTokensPorLamina_ = (function (orig) { return function (t) { return orig(t).slice(0, -1); }; })(agruparTokensPorLamina_);',
    ctx);
  const despues = vm.runInContext('agruparTokensPorLamina_.toString()', ctx);
  /* ⛔ La guarda del 24/08: si la mutación no ocurrió, no hay «después». */
  if (antes === despues) { fallas++; hechas++; console.log('  ❌ la mutación no aplicó — este caso no mide nada'); }
  else {
    const r = correr(ctx);
    const conHueco = laminasResueltas(ctx.__espia);
    afirmar(r.ok === true && !r.fallo,
      '⚠ un reanudador que saltea una lámina NO falla: devuelve `ok` y sin fallo');
    afirmar(conHueco.join(',') !== ENTERA.join(','),
      '⭐ y la afirmación de identidad SÍ lo caza — ' + conHueco.join(', ') +
      ' contra ' + ENTERA.join(', ') + '. Sin ella, el deck incompleto pasaba en verde');
  }
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que el DECK quede pintado. `replaceAllText` está falseado: esto mide qué');
console.log('     láminas se RESOLVIERON, no qué quedó en el archivo.');
console.log('   · Que los VALORES sean iguales entre tandas. `D-41` acota la inconsistencia a');
console.log('     entre láminas y ese límite está declarado, no resuelto — hace falta una corrida.');
console.log('   · El ciclo desatendido completo (trigger, PLAN_CORRIDA, cuota). Acá se ejercita');
console.log('     `generarInforme` cortando y reanudando, que es la mitad pura.');
console.log('   · ⛔ Y el hallazgo de la sección 4 NO está arreglado: se fija el comportamiento');
console.log('     de hoy para que un arreglo futuro se note. La decisión es del usuario.');

process.exit(fallas === 0 ? 0 : 1);
