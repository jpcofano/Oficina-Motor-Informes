/**
 * `2026-08-28_5` B1 — **el `periodo_id` llega de las opciones del ítem a `resolverVentana`.**
 *
 * ⭐ **Ejecuta el código REAL de los dos lados del salto**: el `var ventana = opciones.ventana ||
 * resolverVentana({…})` se **extrae de `Generador.gs`** y se evalúa, y `resolverVentana` +
 * `filasDeCampana_` + `parsearFechaCelda_` salen de `Fuentes.gs` y `Config.gs`. Lo único simulado
 * es `leerCampanas()`, que es la hoja.
 *
 * ⛔⛔ **NINGÚN caso puede pasar `opciones.ventana`.** Con la ventana ya resuelta el `||`
 * cortocircuita y **nunca se llega a la línea que tenía el defecto**: el banco daría verde con el
 * bug puesto. Hay un caso —el 5— que lo pasa **a propósito**, justamente para afirmar que
 * cortocircuita, y es el único.
 *
 * ⚠ **Y el control positivo de una fila no puede ser el único**, porque no discrimina: con una
 * sola fila `per === ''` y el filtro correcto **dan el mismo resultado**, así que ese caso está
 * verde con y sin el parche. El que discrimina es el de **dos filas con `periodo_id` distinto**.
 *
 * Corre con: `node tools/probar-periodo-id-campana.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

let ok = 0;
let mal = 0;
const avisos = [];

function af(cond, texto, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + texto); }
  else { mal++; console.log('  ❌ ' + texto + (detalle ? ' — ' + detalle : '')); }
}

/** ⚠ Por posición, nunca por regex con `\n}`: los `.gs` están en CRLF. */
function extraer(texto, firma, cierre) {
  const desde = texto.indexOf(firma);
  if (desde === -1) return null;
  const c = cierre || '\n}';
  const fin = texto.indexOf(c, desde);
  return fin === -1 ? null : texto.slice(desde, fin + c.length);
}

const GENERADOR = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
const FUENTES = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
const CONFIG = fs.readFileSync(path.join(RAIZ, 'Config.gs'), 'utf8');

/**
 * ⭐ **El salto bajo prueba, extraído de `Generador.gs` — no una copia.** Es la sentencia entera,
 * con el `opciones.ventana ||` incluido, porque el cortocircuito es parte de lo que se afirma.
 */
const FIRMA_SALTO = '    var ventana = opciones.ventana || resolverVentana({';
const SALTO = extraer(GENERADOR, FIRMA_SALTO, '\n    });');
if (!SALTO) {
  console.log('❌ no se encontró el salto en Generador.gs — si se reescribió, esta prueba tiene');
  console.log('   que enterarse en vez de seguir midiendo otra cosa.');
  process.exit(1);
}

/* ⭐⭐ Las filas están COPIADAS del caso real que destapó el defecto: `3512-AGOSEGGJ` con dos filas
 * en `CAMPANAS`, la corrida `jm-20260828-193948`. Los períodos son los dos que conviven en la hoja.
 * ⚠ Las fechas van como texto `dd/mm/aaaa`, que es lo que devuelve la celda. */
const DOS_FILAS = [
  { campana_id: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28', desde: '21/08/2026', hasta: '28/08/2026' },
  { campana_id: '3512-AGOSEGGJ', periodo_id: 'agosto_14_20', desde: '14/08/2026', hasta: '20/08/2026' },
  { campana_id: '3481-AGOINFAN', periodo_id: 'agosto_21_28', desde: '21/08/2026', hasta: '28/08/2026' }
];
const UNA_FILA = [DOS_FILAS[0], DOS_FILAS[2]];

/**
 * Contexto con el camino real. `campanas` es lo único simulado: es la hoja.
 * `espia` reemplaza `resolverVentana` por un grabador — sirve para afirmar **qué se le pasa**,
 * que es exactamente lo que el bug rompía.
 */
function contexto(campanas, opciones, textoGenerador, espia) {
  const gen = textoGenerador !== undefined ? textoGenerador : GENERADOR;
  const ctx = {
    console, Math, JSON, String, Number, Object, Array, Boolean, isNaN, RegExp, Error, Date,
    Logger: { log: () => {} },
    leerCampanas: () => campanas,
    opciones: opciones,
    fila: { periodo_ref: '' },
    __llamadas: []
  };
  vm.createContext(ctx);

  ['function normalizarValorDeclarado_', 'function parsearFechaCelda_'].forEach((firma) => {
    const fn = extraer(FUENTES, firma);
    if (!fn) { avisos.push('⚠ no se encontró `' + firma + '` en Fuentes.gs.'); return; }
    vm.runInContext(fn, ctx, { filename: 'Fuentes.gs (extracto)' });
  });

  const fdc = extraer(CONFIG, 'function filasDeCampana_');
  if (!fdc) avisos.push('⚠ no se encontró `filasDeCampana_` en Config.gs.');
  else vm.runInContext(fdc, ctx, { filename: 'Config.gs (extracto)' });

  if (espia) {
    /* El espía guarda el objeto tal cual se lo pasan y devuelve algo válido, para que la sentencia
     * siga. Lo que se afirma acá es **qué campos llegaron**, no qué se resolvió. */
    ctx.resolverVentana = (o) => {
      ctx.__llamadas.push(o);
      return { ok: true, desde: new Date(2026, 7, 21), hasta: new Date(2026, 7, 28), origen: 'espia' };
    };
  } else {
    const rv = extraer(FUENTES, 'function resolverVentana');
    if (!rv) avisos.push('⚠ no se encontró `resolverVentana` en Fuentes.gs.');
    else vm.runInContext(rv, ctx, { filename: 'Fuentes.gs (extracto)' });
  }

  const salto = extraer(gen, FIRMA_SALTO, '\n    });');
  vm.runInContext(salto.replace(/^\s*var ventana/, 'var ventana'), ctx,
    { filename: 'Generador.gs (el salto)' });
  return ctx;
}

console.log('`periodo_id` de las opciones del ítem a `resolverVentana` — con el salto real\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · CONTROL POSITIVO — una fila por campaña resuelve igual que siempre
 *
 * ⚠ **Este caso NO discrimina y no puede ser el único**: con una fila, `per === ''` y el filtro
 * correcto dan el mismo resultado. Está para probar que el instrumento ve — si esto fallara,
 * nada de lo de abajo significaría nada.
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · control positivo: una fila resuelve, con o sin el arreglo');
{
  const ctx = contexto(UNA_FILA, { campana: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28' });
  af(ctx.ventana.ok === true, 'resuelve', JSON.stringify(ctx.ventana));
  af(ctx.ventana.ok && ctx.ventana.origen === 'campana:3512-AGOSEGGJ',
    'y el origen es la campaña', ctx.ventana.origen);
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · EL CASO QUE DISCRIMINA — dos filas de la misma campaña, períodos distintos
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · dos filas con `periodo_id` distinto: cada una resuelve a la SUYA');
{
  const a = contexto(DOS_FILAS, { campana: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28' });
  af(a.ventana.ok === true, 'agosto_21_28 resuelve (antes fallaba por ambigua)',
    JSON.stringify(a.ventana.motivo || ''));
  af(a.ventana.ok && a.ventana.desde.getDate() === 21,
    '⭐ y trae SU ventana: desde el 21', a.ventana.ok ? String(a.ventana.desde) : '');

  const b = contexto(DOS_FILAS, { campana: '3512-AGOSEGGJ', periodo_id: 'agosto_14_20' });
  af(b.ventana.ok === true, 'agosto_14_20 resuelve', JSON.stringify(b.ventana.motivo || ''));
  af(b.ventana.ok && b.ventana.desde.getDate() === 14,
    '⭐⭐ y trae OTRA ventana: desde el 14 — que es todo el punto del arreglo',
    b.ventana.ok ? String(b.ventana.desde) : '');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · La coletilla del motivo — es lo que prueba que el `periodo_id` llegó
 *
 * ⚠ La cadena está partida en dos líneas en el fuente (`'filas en ' + 'CAMPANAS'`), así que un
 * `grep` de la frase entera da cero **y eso no es evidencia de nada**. Se afirma sobre el mensaje
 * CONSTRUIDO, no sobre el código.
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · un duplicado real sigue fallando, y ahora el motivo dice de qué período');
{
  const duplicado = [
    { campana_id: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28', desde: '21/08/2026', hasta: '28/08/2026' },
    { campana_id: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28', desde: '21/08/2026', hasta: '28/08/2026' }
  ];
  const ctx = contexto(duplicado, { campana: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28' });
  af(ctx.ventana.ok === false, '⭐ dos filas del MISMO período siguen siendo ambiguas: no elige');
  af(ctx.ventana.ok === false && /para el período "agosto_21_28"/.test(ctx.ventana.motivo),
    '⭐⭐ y el motivo trae la coletilla — la señal de que el `periodo_id` llegó',
    ctx.ventana.motivo);
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · CONTROL NEGATIVO, con la mutación verificada
 *
 * ⭐ Tres afirmaciones separadas y ninguna implica a las otras: que la mutación OCURRIÓ, que el
 * caso 2 cae sin el arreglo, y que cae **por el motivo de antes** — sin la coletilla, que es el
 * síntoma exacto de `jm-20260828-193948`.
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · control negativo: sin la clave, vuelve el bug de la corrida');
{
  const CLAVE = '      periodo_id: opciones.periodo_id,\r\n';
  const mutado = GENERADOR.replace(CLAVE, '');

  af(mutado !== GENERADOR,
    '⭐ la MUTACIÓN OCURRIÓ — sin esto el caso correría sobre el código arreglado y daría verde');

  if (mutado !== GENERADOR) {
    const ctx = contexto(DOS_FILAS, { campana: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28' },
      mutado);
    af(ctx.ventana.ok === false,
      'sin la clave, la campaña con dos filas vuelve a fallar');
    af(ctx.ventana.ok === false && /ambigua/.test(ctx.ventana.motivo || ''),
      'y cae POR EL MOTIVO correcto: ambigua', ctx.ventana.motivo);
    af(ctx.ventana.ok === false && !/para el período/.test(ctx.ventana.motivo || ''),
      '⭐⭐ y SIN la coletilla — el síntoma exacto de `jm-20260828-193948`', ctx.ventana.motivo);

    /* Y el caso de una fila sigue verde con la mutación puesta: es la demostración de que el
     * control positivo del caso 1 no discrimina, dicha con un dato en vez de con una promesa. */
    const una = contexto(UNA_FILA, { campana: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28' }, mutado);
    af(una.ventana.ok === true,
      '⚠ y con UNA fila sigue verde aun con el bug puesto — por eso el caso 1 no alcanza');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Qué se le pasa a `resolverVentana`, con espía
 *
 * ⭐ El `periodo_ref` tiene que salir de la FILA del marcador y no de las opciones: es el segundo
 * eslabón de `D-20` y gana sobre la sección. Es la afirmación que impide "arreglar" esto con un
 * spread de `opciones`, que lo pisaría sin fallar.
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · el objeto que viaja: `periodo_id` de opciones, `periodo_ref` de la fila');
{
  const ctx = contexto(DOS_FILAS, {
    campana: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28',
    seccion_id: 'campanas_destacadas', periodo_ref: 'NO_DEBE_GANAR'
  }, undefined, true);
  ctx.fila = { periodo_ref: '' };

  const o = ctx.__llamadas[0];
  af(!!o, 'se llamó a `resolverVentana`');
  if (o) {
    af(o.periodo_id === 'agosto_21_28', 'lleva `periodo_id` de las opciones del ítem', o.periodo_id);
    af(o.campana === '3512-AGOSEGGJ', 'lleva `campana`', o.campana);
    af(o.seccion_id === 'campanas_destacadas', 'lleva `seccion_id`', o.seccion_id);
    af(o.periodo_ref !== 'NO_DEBE_GANAR',
      '⭐⭐ y `periodo_ref` NO sale de las opciones: es el de la fila del marcador (D-20)',
      String(o.periodo_ref));
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 6 · El cortocircuito, que es la trampa del banco
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · `opciones.ventana` cortocircuita — el único caso que la pasa, y a propósito');
{
  const YA = { ok: true, desde: new Date(2026, 6, 1), hasta: new Date(2026, 6, 7), origen: 'ya_resuelta' };
  const ctx = contexto(DOS_FILAS, {
    ventana: YA, campana: '3512-AGOSEGGJ', periodo_id: 'agosto_21_28'
  }, undefined, true);

  af(ctx.__llamadas.length === 0,
    '⛔ con `opciones.ventana` NO se llama a `resolverVentana`: un caso que la pase no mide nada');
  af(ctx.ventana === YA, 'y la ventana que sale es la que se pasó', ctx.ventana.origen);
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');

if (avisos.length) {
  console.log('\n⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach((a) => console.log('   · ' + a));
}

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Que la corrida publique. Esto mide el salto, no un deck: la verificación de');
console.log('     `jm-20260828-193948` es correr de nuevo y mirar los ~130 `camp_*`.');
console.log('   · Qué filas tiene `CAMPANAS` hoy: `leerCampanas` está simulado a propósito.');
console.log('   · Si DEBE haber dos bloques de la misma campaña. Eso lo decidió el usuario');
console.log('     (`_5` ADDENDUM 1, opción A) y no es una pregunta del motor.');

process.exit(mal ? 1 : 0);
