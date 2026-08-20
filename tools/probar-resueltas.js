#!/usr/bin/env node
/**
 * tools/probar-resueltas.js — control positivo de `seccionesResueltas_` (`Desatendida.gs`).
 *
 * ⭐ **Existe porque el bug que atrapa ya se publicó.** El deck `jm-20260820-190943` salió con
 * **todos** los tokens crudos y con tres secciones marcadas `hecha`: el marcado se hacía desde
 * `r.repetibles.secciones`, que es **`expansion.reporte`** —el reporte de la EXPANSIÓN— y su `ok`
 * significa *«se expandió bien»*, no *«se resolvieron sus ítems»*.
 *
 * La Parte A del `_10` separó expandir de resolver con `solo_secciones`, que recorta **después** de
 * expandir, y **el marcado quedó del lado de la expansión**. El síntoma: tres filas `hecha` en la
 * ejecución 1 **con `segundos` vacío**, porque el resolver nunca las tocó.
 *
 * ⚠ **Y no había control que lo atrapara**, que es la razón de fondo por la que pasó. Los fixtures
 * de acá son la forma exacta de ese caso.
 *
 * Uso:
 *   node tools/probar-resueltas.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

function extraerFuncion(archivo, nombre) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) throw new Error('No encontré `function ' + nombre + '(` en ' + archivo);
  let i = texto.indexOf('{', inicio);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') { nivel--; if (nivel === 0) return texto.slice(inicio, j + 1); }
  }
  throw new Error('Función ' + nombre + ' sin cerrar');
}

const M = new Function(
  extraerFuncion('Desatendida.gs', 'seccionesResueltas_') + '\nreturn { seccionesResueltas_ };'
)();

let fallas = 0;
const afirmar = (c, m) => { if (c) console.log('  OK  ' + m); else { fallas++; console.log('  XX  ' + m); } };

/** Las asignaciones reales de `jm` al 20/08: 12+2+2 ítems expandidos a 36. */
const ASIGNACIONES = []
  .concat(Array.from({ length: 27 }, () => ({ seccion: 'encuentro' })))
  .concat(Array.from({ length: 2 }, () => ({ seccion: 'comunicaciones_post' })))
  .concat(Array.from({ length: 7 }, () => ({ seccion: 'campana' })));

const pintadas = (seccion, n) => Array.from({ length: n }, () => ({ seccion, ok: true }));

console.log('Control positivo de `seccionesResueltas_` — código extraído de Desatendida.gs\n');

/* ── 1 · ⭐ EL CASO QUE SE PUBLICÓ: se expandió todo y no se resolvió nada ──────────────────── */
console.log('1 · el caso del deck jm-20260820-190943: expandido, nada resuelto');
{
  // Así llegaba el resultado: el reporte de expansión con las tres `ok`, y CERO ítems pintados.
  const r = {
    repetibles: {
      secciones: [
        { seccion: 'encuentro', ok: true },
        { seccion: 'comunicaciones_post', ok: true },
        { seccion: 'campana', ok: true }
      ],
      items: []          // <-- nada resuelto
    }
  };
  const res = M.seccionesResueltas_(r, ASIGNACIONES);
  afirmar(res.completas.length === 0,
    'NINGUNA sección se marca hecha — vinieron ' + res.completas.length);
  afirmar(res.parciales.length === 3, 'las tres quedan pendientes y se reportan');
  afirmar(res.parciales.every((p) => p.pintadas === 0),
    'y el reporte dice que se pintaron 0 asignaciones de cada una');

  // La afirmación que separa esta implementación de la que falló:
  afirmar(res.completas.length !== r.repetibles.secciones.length,
    'el resultado NO sale del reporte de expansión — si saliera, serían 3');
}

/* ── 2 · una sección resuelta entera se marca; las otras no ─────────────────────────────────── */
console.log('\n2 · resolución completa de una sección');
{
  const r = { repetibles: { secciones: [], items: pintadas('encuentro', 27) } };
  const res = M.seccionesResueltas_(r, ASIGNACIONES);
  afirmar(res.completas.length === 1 && res.completas[0].seccion_id === 'encuentro',
    'sólo `encuentro` se marca hecha — vino ' + JSON.stringify(res.completas.map((c) => c.seccion_id)));
  afirmar(res.completas[0].asignaciones === 27, 'y con sus 27 asignaciones, que van a la columna `segundos`');
  afirmar(res.parciales.length === 2, 'las otras dos quedan pendientes');
}

/* ── 3 · ⭐ una sección A MEDIO resolver NO se marca hecha ───────────────────────────────────
 * Es la afirmación que evita el peor resultado del mecanismo: una sección marcada hecha con
 * tokens crudos adentro **que nadie va a volver a mirar**. */
console.log('\n3 · a medio resolver no es resuelta');
{
  const r = { repetibles: { secciones: [], items: pintadas('encuentro', 20) } };  // 20 de 27
  const res = M.seccionesResueltas_(r, ASIGNACIONES);
  afirmar(res.completas.length === 0, '20 de 27 NO alcanza: no se marca hecha');
  const p = res.parciales.filter((x) => x.seccion_id === 'encuentro')[0];
  afirmar(p && p.pintadas === 20 && p.esperadas === 27,
    'y el reporte dice 20 de 27, para poder mirarlo');
}

/* ── 4 · un ítem que falló no cuenta como pintado ───────────────────────────────────────────── */
console.log('\n4 · los ítems fallados no cuentan');
{
  const items = pintadas('comunicaciones_post', 1).concat([{ seccion: 'comunicaciones_post', ok: false }]);
  const r = { repetibles: { secciones: [], items: items } };
  const res = M.seccionesResueltas_(r, ASIGNACIONES);
  afirmar(res.completas.length === 0,
    '1 pintada + 1 fallada sobre 2 esperadas NO completa la sección');
}

/* ── 5 · sólo se miran las secciones del chunk ─────────────────────────────────────────────── */
console.log('\n5 · el chunk acota qué se evalúa');
{
  const soloCampana = ASIGNACIONES.filter((a) => a.seccion === 'campana');
  const r = { repetibles: { secciones: [], items: pintadas('campana', 7).concat(pintadas('encuentro', 27)) } };
  const res = M.seccionesResueltas_(r, soloCampana);
  afirmar(res.completas.length === 1 && res.completas[0].seccion_id === 'campana',
    'sólo se evalúa `campana`, aunque se hayan pintado ítems de otra');
  afirmar(res.parciales.length === 0, 'y no inventa pendientes fuera del chunk');
}

/* ── 6 · bordes ────────────────────────────────────────────────────────────────────────────── */
console.log('\n6 · bordes');
{
  const vacio = M.seccionesResueltas_({ repetibles: { secciones: [], items: [] } }, []);
  afirmar(vacio.completas.length === 0 && vacio.parciales.length === 0,
    'sin chunk no hay nada que marcar ni que reportar');

  const sinRepetibles = M.seccionesResueltas_({}, ASIGNACIONES);
  afirmar(sinRepetibles.completas.length === 0,
    'un resultado sin `repetibles` no marca nada — no rompe y no inventa');

  // Más pintadas que esperadas (repintado) sigue contando como completa, no como error.
  const demas = M.seccionesResueltas_(
    { repetibles: { secciones: [], items: pintadas('campana', 9) } },
    ASIGNACIONES.filter((a) => a.seccion === 'campana'));
  afirmar(demas.completas.length === 1,
    'más pintadas que esperadas cuenta como completa: repintar es inocuo, no un error');
}

console.log('\n' + (fallas === 0
  ? 'TODO EN VERDE. `hecha` sale de la resolución, nunca de la expansión.'
  : 'FALLAN ' + fallas + ' afirmacion(es).'));
process.exit(fallas === 0 ? 0 : 1);
