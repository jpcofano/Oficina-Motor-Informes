#!/usr/bin/env node
/**
 * tools/probar-planificador.js — control positivo del planificador de la corrida desatendida
 * (`docs/Prompts/2026-08-20_10_corrida_desatendida.md` `v2`, Parte D punto 1, con el
 * `2026-08-20_10.1` aplicado), **sin planilla** y extrayendo el código real de `Desatendida.gs`.
 *
 * ⭐ **La afirmación que el `10.1` agrega, y es la que distingue dos diagnósticos:** cuando la
 * primera sección pendiente **no entra sola**, el planificador tiene que decirlo con ese nombre.
 * Sin eso, la guarda de progreso corta la corrida —bien— pero informa *«no avanza»*, cuando la
 * verdad es *«la unidad de trabajo es más grande que la ejecución»*. **Son dos arreglos distintos**
 * y un mecanismo desatendido que confunde uno con otro hace perder el día.
 *
 * ⚠ **Los fixtures NO son inventados: son las secciones reales de `jm` al 20/08**, con sus
 * asignaciones medidas —ítems × láminas modelo— y no estimadas.
 *
 * Uso:
 *   node tools/probar-planificador.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

function extraerFuncion(archivo, nombre) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  let i = texto.indexOf('{', inicio);
  if (i === -1) throw new Error('Función ' + nombre + ' sin cuerpo en ' + archivo);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, j + 1);
    }
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

const M = new Function(
  extraerFuncion('Desatendida.gs', 'planificarChunk_') + '\nreturn { planificarChunk_ };'
)();

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  OK  ' + mensaje);
  else { fallas++; console.log('  XX  ' + mensaje); }
}

/** Las secciones repetibles reales de `jm` al 20/08, con sus asignaciones medidas. */
const JM = [
  { seccion_id: 'encuentro', asignaciones: 27 },            // 12 ítems × ~2,25 láminas modelo
  { seccion_id: 'comunicaciones_post', asignaciones: 2 },   // 2 ítems (etapa=post)
  { seccion_id: 'campana', asignaciones: 7 }                // 2 ítems × sus láminas
];
const UTIL = 270;   // techo 350 − reserva 30 − arranque ~80, medido el 20/08
const SEG = 5.7;    // 204 s / 36 asignaciones, medido

console.log('Control positivo del planificador — código extraído de Desatendida.gs\n');

/* ── 1 · con los números de hoy, todo entra en una ejecución ────────────────────────────────── */
console.log('1 · los números reales de `jm` al 20/08');
{
  const r = M.planificarChunk_(JM, UTIL, SEG);
  afirmar(r.secciones.length === 3, 'las tres secciones entran — vinieron ' + r.secciones.length);
  afirmar(r.asignaciones === 36, 'y suman 36 asignaciones, que es lo que la corrida reportó');
  afirmar(r.no_entra_sola === '', 'ninguna sección queda sin entrar sola');
}

/* ── 2 · cuando no entra todo, se toma un prefijo y el resto queda para después ─────────────── */
console.log('\n2 · presupuesto chico: se parte, no se atraganta');
{
  const r = M.planificarChunk_(JM, 160, SEG);   // 160 s ≈ 28 asignaciones
  afirmar(r.secciones.length === 1 && r.secciones[0] === 'encuentro',
    'entra sólo `encuentro` (27 asignaciones ≈ 154 s) — vino ' + JSON.stringify(r.secciones));
  afirmar(r.asignaciones === 27, 'y son 27 asignaciones');
  afirmar(r.no_entra_sola === '', 'no es el caso de «no entra sola»: entró');
}

/* ── 3 · ⭐ la afirmación del `10.1`: la sección no entra SOLA ───────────────────────────────
 * Es la que distingue «la unidad es demasiado grande» de «no avanza». Sin ella, el mecanismo
 * corta por la guarda de progreso y da el diagnóstico equivocado. */
console.log('\n3 · la sección no entra sola — el diagnóstico que el 10.1 agrega');
{
  const r = M.planificarChunk_(JM, 100, SEG);   // 100 s ≈ 17 asignaciones; `encuentro` tiene 27
  afirmar(r.secciones.length === 0, 'no elige ninguna sección — vinieron ' + r.secciones.length);
  afirmar(r.no_entra_sola === 'encuentro',
    'y NOMBRA cuál no entra sola: `encuentro` — vino ' + JSON.stringify(r.no_entra_sola));
  afirmar(/no converge/.test(r.motivo), 'el motivo dice que el plan NO CONVERGE, no que «no avanza»');
  afirmar(/10\.1/.test(r.motivo), 'y apunta a dónde está la salida (partir por asignación)');
}

/* ── 4 · ⭐ el umbral real: a partir de cuántos encuentros deja de entrar ───────────────────── */
console.log('\n4 · el umbral, con los números medidos');
{
  const conEncuentros = (n) => [{ seccion_id: 'encuentro', asignaciones: Math.round(n * 2.25) }];
  afirmar(M.planificarChunk_(conEncuentros(12), UTIL, SEG).secciones.length === 1,
    '12 encuentros (27 asignaciones) entran — es lo de hoy');
  afirmar(M.planificarChunk_(conEncuentros(20), UTIL, SEG).secciones.length === 1,
    '20 encuentros (45) todavía entran');
  const rota = M.planificarChunk_(conEncuentros(24), UTIL, SEG);
  afirmar(rota.no_entra_sola === 'encuentro',
    '24 encuentros (54) YA NO entran sola — y el planificador lo dice, no lo descubre gastando cuota');
}

/* ── 5 · los bordes, que son donde un planificador se rompe callado ─────────────────────────── */
console.log('\n5 · bordes');
{
  const vacio = M.planificarChunk_([], UTIL, SEG);
  afirmar(vacio.secciones.length === 0 && vacio.no_entra_sola === '',
    'sin pendientes: ni elige ni acusa — la corrida está terminada');
  afirmar(/no quedan/.test(vacio.motivo), 'y el motivo lo dice así');

  const cero = M.planificarChunk_([{ seccion_id: 'vacia', asignaciones: 0 }], UTIL, SEG);
  afirmar(cero.secciones.length === 1,
    'una sección con CERO asignaciones entra y se marca hecha — si no, el plan no cerraría nunca');

  // Sin costo medido cae a un default; no puede devolver NaN ni dividir por cero.
  const sinCosto = M.planificarChunk_(JM, UTIL, 0);
  afirmar(sinCosto.secciones.length > 0 && !isNaN(sinCosto.asignaciones),
    'sin costo por asignación usa un default y sigue planificando');

  // El orden manda: lo pendiente se toma en el orden en que viene, no reordenado por tamaño.
  const alReves = M.planificarChunk_(
    [{ seccion_id: 'campana', asignaciones: 7 }, { seccion_id: 'encuentro', asignaciones: 27 }], 60, SEG);
  afirmar(alReves.secciones.length === 1 && alReves.secciones[0] === 'campana',
    'respeta el orden del plan y no reordena por conveniencia');
}

console.log('\n' + (fallas === 0
  ? 'TODO EN VERDE. El planificador cuenta asignaciones y distingue «no entra sola» de «no avanza».'
  : 'FALLAN ' + fallas + ' afirmacion(es).'));
process.exit(fallas === 0 ? 0 : 1);
