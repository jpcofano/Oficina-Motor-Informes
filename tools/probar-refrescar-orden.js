#!/usr/bin/env node
/**
 * tools/probar-refrescar-orden.js — **`refrescarOrdenPlantilla_` escribe SÓLO la celda del orden**
 * (`2026-08-31_5` addendum).
 *
 * ⛔ **El modo de falla que fija, y es el caro de este repo:** escribir la fila entera. Si esto
 * usara `upsertPorClave_`, la reescribiría con `(h in obj) ? obj[h] : ''` y **borraría `filtro`,
 * `notas`, `rol` y `alcance`** de cada fila corregida — sin fallar, y el síntoma aparecería lejos:
 * una lámina que deja de filtrar por `tipo` y se duplica de más en la próxima corrida.
 *
 * ⭐ **La medición no se reimplementa: sale de `verificarLaminas()`.** Este banco lo stubea para
 * fijar el contrato entre las dos, que es lo único que hay que verificar acá — que consuma
 * `desajustes` y no invente un criterio propio.
 *
 * Uso:
 *   node tools/probar-refrescar-orden.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

const HEADERS = ['lamina_id', 'informe_id', 'seccion_id', 'orden_plantilla', 'escondida',
                 'origen', 'modo', 'itera_sobre', 'filtro', 'rol', 'notas'];

/* `L-008` dice 8 y está en 9; `L-009` dice 9 y está en 11. `L-001` coincide. Y hay una fila de
 * `jm` desajustada que NO tiene que tocarse: el refresco es por informe. */
function filasBase() {
  return [
    { _fila: 2, lamina_id: 'L-001', informe_id: 'secco', orden_plantilla: 1, filtro: '', notas: 'n1' },
    { _fila: 3, lamina_id: 'L-008', informe_id: 'secco', orden_plantilla: 8, filtro: 'tipo!=Uno a uno', notas: 'n8' },
    { _fila: 4, lamina_id: 'L-009', informe_id: 'secco', orden_plantilla: 9, filtro: '', notas: 'n9' },
    { _fila: 5, lamina_id: 'L-040', informe_id: 'jm', orden_plantilla: 3, filtro: '', notas: 'njm' }
  ];
}

const DESAJUSTES = [
  { lamina_id: 'L-008', campo: 'orden_plantilla', en_hoja: 8, en_plantilla: 9 },
  { lamina_id: 'L-009', campo: 'orden_plantilla', en_hoja: 9, en_plantilla: 11 },
  { lamina_id: 'L-040', campo: 'orden_plantilla', en_hoja: 3, en_plantilla: 7 },
  { lamina_id: 'L-001', campo: 'informe_id', en_hoja: 'secco', en_plantilla: 'jm' }
];

function contexto(opciones) {
  opciones = opciones || {};
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error
  };
  ctx.__log = [];
  ctx.Logger = { log: (m) => ctx.__log.push(String(m)) };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Sellador.gs'), 'utf8'), ctx,
    { filename: 'Sellador.gs' });

  let filas = filasBase();
  const escrituras = [];
  ctx.__escrituras = escrituras;
  ctx.__filas = () => filas;

  ctx.verificarLaminas = () => opciones.verificarFalla
    ? { ok: false, motivo: 'no pude abrir la plantilla (caso negativo)' }
    : { ok: true, desajustes: DESAJUSTES, anclas_sin_fila: ['L-004', 'L-005'] };

  ctx.leerLaminas_ = () => ({
    ok: true, headers: HEADERS, filas: filas,
    hoja: {
      getRange: (fila, col) => ({
        setValue: (v) => {
          escrituras.push({ fila: fila, col: col, valor: v });
          const f = filas.filter((x) => x._fila === fila)[0];
          if (f) f[HEADERS[col - 1]] = v;
        }
      })
    }
  });
  ctx.SpreadsheetApp = { flush: () => {} };
  return ctx;
}

console.log('\n═══ A · el DIAGNÓSTICO no escribe ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('diagOrdenPlantillaSecco()', ctx);
  afirmar(r && r.ok === true && r.aplicado === false, 'devuelve `aplicado: false`');
  afirmar(ctx.__escrituras.length === 0, '⭐ CERO escrituras — «verificar antes de escribir» es su trabajo');
  afirmar(r.desajustes.length === 2, 've los 2 de `secco` y no el de `jm` (' + r.desajustes.length + ')');
}

console.log('\n═══ B · el refresco escribe SÓLO la celda del orden ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('refrescarOrdenPlantillaSecco()', ctx);
  afirmar(r && r.ok === true && r.corregidas === 2, 'corrige 2 (' + (r && r.corregidas) + ')');
  const colOrden = HEADERS.indexOf('orden_plantilla') + 1;
  afirmar(ctx.__escrituras.every((e) => e.col === colOrden),
    '⭐⭐ TODAS las escrituras son a la columna `orden_plantilla` — nunca a la fila entera');
  const l008 = ctx.__filas().filter((f) => f.lamina_id === 'L-008')[0];
  afirmar(l008.orden_plantilla === 9, '`L-008` pasó de 8 a 9');
  afirmar(l008.filtro === 'tipo!=Uno a uno' && l008.notas === 'n8',
    '⭐⭐ y `filtro` y `notas` quedaron INTACTOS — es lo que `upsertPorClave_` habría borrado');
}

console.log('\n═══ C · no toca el otro informe ═══');
{
  const ctx = contexto();
  vm.runInContext('refrescarOrdenPlantillaSecco()', ctx);
  const jm = ctx.__filas().filter((f) => f.lamina_id === 'L-040')[0];
  afirmar(jm.orden_plantilla === 3,
    '⭐ la fila de `jm` desajustada NO se tocó — el refresco es por informe');
}

console.log('\n═══ D · los desajustes de `informe_id` se reportan y NO se tocan ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('refrescarOrdenPlantillaSecco()', ctx);
  afirmar(r.de_informe_id && r.de_informe_id.length === 1, 'el de `informe_id` se devuelve aparte');
  const l001 = ctx.__filas().filter((f) => f.lamina_id === 'L-001')[0];
  afirmar(l001.informe_id === 'secco',
    '⭐ y la celda `informe_id` quedó intacta — eso no se arregla con un número');
  afirmar(ctx.__log.join('\n').indexOf('SE REPORTAN Y NO SE TOCAN') !== -1,
    'y el log lo dice, en vez de callarlo');
}

console.log('\n═══ E · cero desajustes se DICE, no se calla ═══');
{
  const ctx = contexto();
  ctx.verificarLaminas = () => ({ ok: true, desajustes: [], anclas_sin_fila: [] });
  const r = vm.runInContext('refrescarOrdenPlantillaSecco()', ctx);
  afirmar(r && r.ok === true, 'devuelve ok');
  afirmar(ctx.__escrituras.length === 0, 'no escribe nada');
  afirmar(/ninguna fila desajustada/.test(ctx.__log.join('\n')),
    '⭐ «ninguna desajustada» y «no se midió» se ven igual sin este conteo');
}

console.log('\n═══ F · control NEGATIVO — si la medición falla, no se escribe ═══');
{
  const ctx = contexto({ verificarFalla: true });
  const r = vm.runInContext('refrescarOrdenPlantillaSecco()', ctx);
  afirmar(r && r.ok === false, 'devuelve `ok: false`');
  afirmar(ctx.__escrituras.length === 0,
    '⭐⭐ CERO escrituras — sin medición confiable no se corrige nada a ojo');
}

console.log('\n═══ G · control NEGATIVO — la relectura tiene que poder FALLAR ═══');
{
  /* ⛔ Un escritor que informa lo que escribió no verifica nada. Acá la hoja «acepta» la escritura
   * y devuelve otra cosa —lo que hace Sheets al coercionar tipos— y el banco exige que se note. */
  const ctx = contexto();
  const real = ctx.leerLaminas_;
  /* ⚠ **La segunda llamada es la relectura**, y el número importa: con `n >= 3` este caso daba
   * rojo **por el motivo equivocado** —el stub no llegaba a devolver nada distinto—, que es
   * exactamente lo que `CLAUDE.md` §4 advierte de un negativo: *romper a propósito y ver rojo no
   * alcanza; hay que mirar CUÁL afirmación cayó y con qué motivo.* */
  let n = 0;
  ctx.leerLaminas_ = () => {
    const reg = real();
    n++;
    if (n >= 2) reg.filas = reg.filas.map((f) => Object.assign({}, f, { orden_plantilla: 99 }));
    return reg;
  };
  const r = vm.runInContext('refrescarOrdenPlantillaSecco()', ctx);
  afirmar(r && r.ok === false && r.motivo === 'relectura',
    '⭐⭐ si la hoja quedó distinta de lo pedido, FALLA — la relectura sale de la hoja, no del escritor');
  afirmar(/RELECTURA FALLIDA/.test(ctx.__log.join('\n')) &&
          /pedí 9 y la hoja dice/.test(ctx.__log.join('\n')),
    '⭐ y el motivo dice QUÉ pidió y QUÉ quedó — no sólo que falló');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
