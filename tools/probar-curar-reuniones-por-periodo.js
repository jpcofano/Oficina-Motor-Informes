#!/usr/bin/env node
/**
 * tools/probar-curar-reuniones-por-periodo.js — **la clave de ESCRITURA llavea igual que la de
 * IDENTIDAD** (`2026-08-28`).
 *
 * ⛔⛔ **El bug que fija, y se publicó hoy.** `claveReunion_` incluye `periodo_id`, así que pegar el
 * mismo temario para un período nuevo crea —bien— una **fila nueva** con el MISMO `texto_original`.
 * Pero `curarCamposReuniones_` indexaba **sólo por `texto_original`** y su propio comentario decía
 * *«si dos filas comparten el texto, gana la primera»*.
 *
 * **Lo que pasó:** con dos filas de `Uno a uno en Coghlan (21/08)` el paso 3 del asistente escribió
 * `mostrar = sí` en la del período **viejo**; la de `2026_agosto_21_28` quedó vacía; y el anclaje
 * falló con *«REUNIONES no tiene filas para anclar en el período …»*, **culpando al período, que
 * era inocente**. La causa estaba dos pasos antes.
 *
 * ⭐ **«Gana la primera» era elegir por el ORDEN DE LA HOJA** — lo mismo que el `_39` le sacó a
 * `ULTIMO` y lo que el agregado del temario dejó de hacer el mismo día con las filas de una cuenta.
 * Con un solo período no se nota nunca: **el control tiene que tener DOS.**
 *
 * ⚠ **Y la otra mitad: una escritura que no llegó a ninguna fila FALLA.** Devolvía `ok: true` con
 * todo en `sin_fila` y el llamador miraba sólo `.ok`. Es la regla que `curarCamposMarcadores_`
 * tiene desde el 17/08 y que a ésta le faltaba.
 *
 * Uso:
 *   node tools/probar-curar-reuniones-por-periodo.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let pasadas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) { pasadas++; console.log('  ✅ ' + mensaje); }
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const TEXTO = 'Uno a uno en Coghlan (21/08)';
const VIEJO = 'agosto_21_27';
const NUEVO = '2026_agosto_21_28';
const HEADERS = ['periodo_id', 'orden', 'eje', 'tipo', 'nombre', 'fecha', 'etapa', 'mostrar',
  'texto_original', 'id_cuenta', 'notas'];

/** La hoja falseada: recuerda qué celdas se escribieron y en qué fila. */
function hoja(filas) {
  const datos = [HEADERS.slice()].concat(filas.map((f) => f.slice()));
  const escrituras = [];
  return {
    __datos: datos,
    __escrituras: escrituras,
    getDataRange: () => ({ getValues: () => datos }),
    getRange: (fila, col) => ({
      setValue: (v) => { datos[fila - 1][col - 1] = v; escrituras.push({ fila: fila, col: col, valor: v }); }
    })
  };
}

/* Las dos filas homónimas: mismo `texto_original`, distinto período. La del período VIEJO va
 * primera a propósito — es la que "ganaba" y la que hace que el caso pueda fallar. */
const DOS_FILAS = [
  [VIEJO, 1, 'JM', 'Uno a uno', 'Coghlan', '2026-08-21', '', 'sí', TEXTO, '', ''],
  [NUEVO, 1, 'JM', 'Uno a uno', 'Coghlan', '2026-08-21', '', '', TEXTO, '', '']
];

function contexto(filas, parchear) {
  const h = hoja(filas);
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => h }) }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Reuniones.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) return null;   // guarda de que la mutación ocurrió
  }
  vm.runInContext(texto, ctx, { filename: 'Reuniones.gs' });
  ctx.__hoja = h;
  return ctx;
}

const mostrarDe = (h, i) => String(h.__datos[i + 1][HEADERS.indexOf('mostrar')] || '').trim();

console.log('\n═══ A · ⭐⭐ con `periodo_id`, escribe en la fila del período pedido ═══');
{
  const ctx = contexto(DOS_FILAS);
  const r = ctx.curarCamposReuniones_([{ texto_original: TEXTO, periodo_id: NUEVO, mostrar: 'sí' }]);
  afirmar(r.ok === true, 'la escritura resuelve');
  afirmar(mostrarDe(ctx.__hoja, 1) === 'sí',
    '⭐⭐ la fila del período NUEVO quedó en `sí` — es la que el asistente estaba confirmando');
  afirmar(mostrarDe(ctx.__hoja, 0) === 'sí' && ctx.__hoja.__escrituras.length === 1,
    '⭐ y la del período VIEJO no se tocó: una sola escritura, en la fila correcta');
}

console.log('\n═══ B · sin `periodo_id` y con dos candidatas: AMBIGUO, no escribe ═══');
{
  const ctx = contexto(DOS_FILAS);
  const r = ctx.curarCamposReuniones_([{ texto_original: TEXTO, mostrar: 'sí' }]);
  afirmar(r.ok === false, '⭐⭐ falla en vez de elegir por el orden de la hoja');
  afirmar((r.ambiguas || []).length === 1 && /2 filas/.test(r.ambiguas[0]),
    'y lo reporta como AMBIGUA, con cuántas encontró — ' + (r.ambiguas || [])[0]);
  afirmar(ctx.__hoja.__escrituras.length === 0,
    '⛔ y no escribió NADA: «gana la primera» era escribir en la fila equivocada');
  afirmar(/periodo_id/.test(r.motivo || ''),
    '⭐ el motivo dice qué falta para desambiguar, no sólo que falló');
}

console.log('\n═══ C · control positivo — con UNA sola candidata sigue andando sin período ═══');
{
  const ctx = contexto([DOS_FILAS[1]]);
  const r = ctx.curarCamposReuniones_([{ texto_original: TEXTO, mostrar: 'sí' }]);
  afirmar(r.ok === true && mostrarDe(ctx.__hoja, 0) === 'sí',
    '⭐ retrocompatible: sin ambigüedad no hace falta el período (los otros llamadores no cambian)');
}

console.log('\n═══ D · una clave que no existe FALLA, y dice cuál ═══');
{
  const ctx = contexto(DOS_FILAS);
  const r = ctx.curarCamposReuniones_([{ texto_original: 'una linea que ya no esta', periodo_id: NUEVO, mostrar: 'sí' }]);
  afirmar(r.ok === false, '⭐⭐ no informa cero: falla');
  afirmar((r.sin_fila || []).length === 1 && /ya no esta/.test(r.sin_fila[0]),
    'con la clave nombrada en `sin_fila`');
  afirmar((r.ambiguas || []).length === 0,
    '⚠ y NO como ambigua: «no existe» y «hay dos» mandan a trabajos distintos');
}

console.log('\n═══ E · «ya estaba» NO falla — eso es idempotencia ═══');
{
  const ctx = contexto(DOS_FILAS);
  const r = ctx.curarCamposReuniones_([{ texto_original: TEXTO, periodo_id: VIEJO, mostrar: 'sí' }]);
  afirmar(r.ok === true && r.cambios_escritos === 0,
    '⭐ resuelve con cero escrituras: la fila se ubicó y ya tenía el valor. Fallar acá rompería ' +
    'el caso normal de volver a confirmar sin cambios');
}

console.log('\n═══ F · control negativo — sin el filtro por período, vuelve a ganar la primera ═══');
{
  const ctx = contexto(DOS_FILAS, (t) => t.replace(
    'if (periodo && idxPeriodo !== -1) {', 'if (false && idxPeriodo !== -1) {'));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    const r = ctx.curarCamposReuniones_([{ texto_original: TEXTO, periodo_id: NUEVO, mostrar: 'sí' }]);
    afirmar(r.ok === false && (r.ambiguas || []).length === 1,
      '⛔ sin el filtro las dos filas quedan candidatas y cae en ambiguo — o sea que A mide ESE filtro');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Por qué hay dos filas del mismo encuentro. Que `claveReunion_` incluya el');
console.log('     período es correcto —son dos semanas—; si además conviene limpiar las viejas');
console.log('     es una decisión del usuario, no de esta función.');
console.log('   · Que el panel mande la clave correcta. Eso lo cubre `probar-asistente-anclaje.js`.');

process.exit(fallas === 0 ? 0 : 1);
