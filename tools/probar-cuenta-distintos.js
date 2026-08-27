#!/usr/bin/env node
/**
 * tools/probar-cuenta-distintos.js — control positivo de `opCUENTA_DISTINTOS`
 * (`docs/Prompts/2026-08-20_5_m2_campanias.md`, Parte B), **sin planilla** y extrayendo el código
 * real de `Marcadores.gs`.
 *
 * ⭐ **El fixture del punto 2 está elegido para DISTINGUIR implementaciones, no para confirmar
 * una.** `['A', '', 'B', '  ']` da **2**, y ese 2 no coincide con «cuenta todas las filas» (4) ni
 * con «cuenta las no vacías sin normalizar» (3, porque `'  '` no es `''`). Es la disciplina que
 * `[10, 5, '']` enseñó a la mala en `Pruebas.gs:456`: un dato que satisface dos afirmaciones por
 * igual no distingue entre ellas.
 *
 * Uso:
 *   node tools/probar-cuenta-distintos.js
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

const cuerpo =
  extraerFuncion('Marcadores.gs', 'opCUENTA_DISTINTOS') + '\n' +
  /* `2026-08-26` — el conteo pasó a salir de `distintosDeCampo_`, el núcleo que ahora comparte con
   * `LISTA_CRUDA`. Se extrae también, y **esta prueba se rompió fuerte** el día del cambio en vez de
   * dar verde sobre una copia vieja, que es lo que se le pide a un extractor. */
  extraerFuncion('Marcadores.gs', 'distintosDeCampo_') + '\n' +
  extraerFuncion('Marcadores.gs', 'valoresDeCtx_') + '\n' +
  extraerFuncion('Marcadores.gs', 'trazaDeVentana_') + '\n' +
  // `R-10` de verdad, extraída de `Fuentes.gs`: si alguien la cambia ahí, esta prueba se entera.
  extraerFuncion('Fuentes.gs', 'normalizarValorDeclarado_');

// eslint-disable-next-line no-new-func
const M = new Function(cuerpo + '\nreturn { opCUENTA_DISTINTOS };')();

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  OK  ' + mensaje);
  else { fallas++; console.log('  XX  ' + mensaje); }
}

const ctx = (valores) => ({ valores: valores, campo_logico: 'mail_campana', base_id: 'digital', solapa: 'Directa Mail' });

console.log('Control positivo de `CUENTA_DISTINTOS` — código extraído de Marcadores.gs\n');

/* ── 1 · tres valores iguales con distinta grafía de espacios dan 1 ─────────────────────────── */
console.log('1 · la grafía de espacios no inventa campañas');
{
  const r = M.opCUENTA_DISTINTOS(ctx(['Salud Eje Norte', ' Salud Eje Norte', 'Salud  Eje   Norte']));
  afirmar(r.valor === 1, 'tres grafías de lo mismo dan 1 — vino ' + JSON.stringify(r.valor));
  afirmar(r.filas === 3, 'y la traza sabe que leyó 3 filas');
}

/* ── 2 · ⭐ vacías salteadas, con el fixture que distingue implementaciones ──────────────────── */
console.log('2 · las vacías no cuentan');
{
  const r = M.opCUENTA_DISTINTOS(ctx(['A', '', 'B', '  ']));
  afirmar(r.valor === 2, '`[A, "", B, "  "]` da 2 — vino ' + JSON.stringify(r.valor));
  afirmar(r.vacias === 2, 'y salteó DOS vacías: `""` y `"  "` — vino ' + r.vacias);

  // Las tres afirmaciones que este fixture separa, dichas de una:
  afirmar(r.valor !== 4, 'NO es «cuenta todas las filas» (daría 4)');
  afirmar(r.valor !== 3, 'NO es «cuenta las no vacías sin normalizar» (daría 3: `"  "` no es `""`)');
  afirmar(r.traza.indexOf('2 celda(s) vacía(s)') !== -1,
    'y la traza lo dice con el número, no con un adjetivo');
}

/* ── 3 · cero filas es `sin_datos`, no `0` ───────────────────────────────────────────────────
 * `0` afirma "no hubo ninguna campaña"; vacío deja que el despachador diga `sin_datos`, que es
 * "no había filas". Son dos afirmaciones distintas sobre el mundo, y desde el `2026-08-20_1` el
 * deck las publica con símbolos distintos. */
console.log('3 · cero filas no es cero campañas');
{
  const r = M.opCUENTA_DISTINTOS(ctx([]));
  afirmar(r.valor === '', 'cero filas devuelve vacío, para que el despachador lo baje a `sin_datos`');
  afirmar(r.valor !== 0, 'y explícitamente NO devuelve 0');

  // ⚠ El caso que se parece y NO es el mismo: hubo filas, todas vacías.
  const r2 = M.opCUENTA_DISTINTOS(ctx(['', '  ', '']));
  afirmar(r2.valor === 0,
    'pero filas que existen y vienen todas vacías SÍ dan 0 — hubo filas, así que no es `sin_datos`');
  afirmar(r2.filas === 3 && r2.vacias === 3, 'y la traza manda a mirar la columna: 3 filas, 3 vacías');
}

/* ── 4 · mayúsculas distintas NO colapsan — protege la decisión 2 de que alguien la "mejore" ── */
console.log('4 · `R-10` preserva case y acentos');
{
  const r = M.opCUENTA_DISTINTOS(ctx(['Salud', 'salud']));
  afirmar(r.valor === 2, '`[Salud, salud]` da 2, no 1 — vino ' + JSON.stringify(r.valor));

  const a = M.opCUENTA_DISTINTOS(ctx(['Educación', 'Educacion']));
  afirmar(a.valor === 2, 'y los acentos tampoco se pliegan: `Educación` ≠ `Educacion`');
}

/* ── 5 · la traza trae los tres números, que es lo que hace auditable un conteo que da de más ─
 * `C-68` midió que la misma campaña aparece con cuatro grafías en cuatro solapas. Un conteo así
 * da de más **y no falla**: los tres números son lo único que lo delata. */
console.log('5 · la traza dice leídas, vacías y distintas');
{
  const r = M.opCUENTA_DISTINTOS(ctx(['A', 'A ', 'B', '', 'C']));
  afirmar(r.valor === 3, '5 filas con una repetida y una vacía dan 3');
  afirmar(r.traza.indexOf('sobre 5 fila(s)') !== -1, 'la traza dice cuántas leyó');
  afirmar(r.traza.indexOf('3 distinto(s)') !== -1, 'cuántas publicó');
  afirmar(r.traza.indexOf('1 celda(s) vacía(s)') !== -1, 'y cuántas salteó');
  afirmar(r.traza.indexOf('R-10') !== -1, 'y con qué normalizó, para que nadie lo suponga');
}

/* ── 6 · no rompe con `null`/`undefined`, que es lo que trae una celda de Sheets ────────────── */
console.log('6 · null y undefined son vacías, no valores');
{
  const r = M.opCUENTA_DISTINTOS(ctx([null, undefined, 'A']));
  afirmar(r.valor === 1, '`[null, undefined, A]` da 1 — vino ' + JSON.stringify(r.valor));
  afirmar(r.vacias === 2, 'y las dos cuentan como vacías');

  // Un número no se pierde por no ser string: `Number(0)` normalizado es `'0'`, que no es vacío.
  const n = M.opCUENTA_DISTINTOS(ctx([0, 1, 0]));
  afirmar(n.valor === 2, 'y `[0, 1, 0]` da 2: el cero es un valor, no una celda vacía');
}

console.log('\n' + (fallas === 0
  ? 'TODO EN VERDE. Cuenta distintos con R-10, saltea vacías, y cero filas no es cero campañas.'
  : 'FALLAN ' + fallas + ' afirmacion(es).'));
process.exit(fallas === 0 ? 0 : 1);
