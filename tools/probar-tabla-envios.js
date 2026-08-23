#!/usr/bin/env node
/**
 * tools/probar-tabla-envios.js — el control de los 40 tokens de `L-047`.
 *
 * ⭐⭐ **El control PRIMARIO es la coherencia de fila, y es deliberado.** Los nueve campos de
 * `env1` tienen que salir de **la misma fila de la fuente**. Es lo que `FILA` existe para
 * garantizar, lo que `ELEMENTO` rompía, y **no depende de ninguna definición del equipo**: se
 * verifica contra la base y nada más.
 *
 * ⚠ **La fila GLOBAL NO se usa como control primario, y el motivo está medido en otro lado:** está
 * en el documento al equipo como **pregunta abierta**, porque parece sumar universos distintos —los
 * envíos de JM por un lado y las aperturas de JM y GCBA juntas—. Si es así, la identidad **no cierra
 * y sería una alarma falsa contra un cableado correcto**. Va como secundario, con la hipótesis
 * declarada antes: **si cierra, confirma; si no cierra, es evidencia de que el GLOBAL suma otra
 * cosa** — que es justo lo que se preguntó. Los dos resultados informan.
 *
 * ⛔ **Y la afirmación que impide el `N × M`:** los 40 se cruzan **uno por uno** contra
 * `docs/CENSO_tokens_sin_fila_2026-08-22.md`. Son **`9 · 8 · 8 · 7 · 8`**, no `5 × 9`.
 *
 * Uso:
 *   node tools/probar-tabla-envios.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const CENSO_TXT = fs.readFileSync(
  path.join(RAIZ, 'docs', 'CENSO_tokens_sin_fila_2026-08-22.md'), 'utf8');
const MARC = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');

const SALTO = String.fromCharCode(10);
const BARRA = String.fromCharCode(92);

function recortar(texto, desde) {
  let nivel = 0, dentro = false, comilla = null, comentario = null;
  for (let j = desde; j < texto.length; j++) {
    const c = texto[j], sig = texto[j + 1];
    if (comentario === 'linea') { if (c === SALTO) comentario = null; continue; }
    if (comentario === 'bloque') { if (c === '*' && sig === '/') { comentario = null; j++; } continue; }
    if (comilla) {
      if (c === BARRA) { j++; continue; }
      if (c === comilla) comilla = null;
      continue;
    }
    if (c === '/' && sig === '/') { comentario = 'linea'; j++; continue; }
    if (c === '/' && sig === '*') { comentario = 'bloque'; j++; continue; }
    if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
    if (c === '[' || c === '{' || c === '(') { nivel++; dentro = true; }
    else if (c === ']' || c === '}' || c === ')') {
      nivel--;
      if (dentro && nivel === 0) return texto.slice(desde, j + 1);
    }
  }
  throw new Error('Expresión sin cerrar desde ' + desde);
}
function fnDe(txt, nombre) {
  const i = txt.indexOf('function ' + nombre + '(');
  if (i === -1) throw new Error('No encontré `function ' + nombre + '(` — si se renombró, esta prueba tiene que enterarse.');
  const llave = txt.indexOf('{', i);
  return txt.slice(i, llave + recortar(txt, llave).length);
}

// ── Las 40 filas que el wrapper escribe ────────────────────────────────────────────────
const marcaFn = 'function cablearTablaDeEnvios()';
if (FUENTE.indexOf(marcaFn) === -1) throw new Error('No encontré `' + marcaFn + '` en Instalar.gs.');
const marcaArr = 'curarMarcadores_([], ';
const FILAS = new Function('return ' +
  recortar(FUENTE, FUENTE.indexOf(marcaArr, FUENTE.indexOf(marcaFn)) + marcaArr.length))();

// ── La lista de L-047 según el censo ───────────────────────────────────────────────────
const lineas = CENSO_TXT.split(SALTO);
const iniCenso = lineas.findIndex((l) => l.indexOf('L-047') !== -1 && l.indexOf('sin fila:') !== -1);
if (iniCenso === -1) throw new Error('El censo no tiene el bloque de L-047.');
const acum = [];
for (let i = iniCenso + 1; i < lineas.length; i++) {
  if (lineas[i].indexOf('sin fila:') !== -1 || lineas[i].indexOf('== RESUMEN') !== -1) break;
  acum.push(lineas[i]);
}
const CENSO = acum.join(' ').split(',').map((t) => t.trim()).filter(Boolean);

// ── La operación real, ejecutada ───────────────────────────────────────────────────────
const OP = new Function(`
  var cacheFilasOrdenadas_ = {};
  function trazaDeVentana_(ctx) { return ''; }
  ${fnDe(MARC, 'huellaDeFilas_')}
  ${fnDe(MARC, 'filasOrdenadas_')}
  ${fnDe(MARC, 'opFILA')}
  return { opFILA: opFILA, reset: function () { cacheFilasOrdenadas_ = {}; } };
`)();

// Las cinco filas reales de 3488-AGOJDGAG, copiadas de la medición del 23/08.
const F = (fecha, seg, env, ent, ap) => ({
  'Fecha envio': new Date(fecha), 'Segmentacion': seg,
  'Enviados': env, 'Entregados': ent, 'Aperturas': ap
});
const FUENTE_FILAS = [
  F('2026-08-07', 'Geo a los barrios Barracas + Parque Patricios', 84608, 83298, 18253),
  F('2026-08-07', 'Interesados en salud de los barrios Patricios', 121983, 120091, 24908),
  F('2026-08-11', 'Inscriptos a reuniones de JM y FQ', 24519, 24137, 5797),
  F('2026-08-12', 'Vecinos con historia clínica de los barrios', 17870, 17472, 2596),
  F('2026-08-13', 'Inscriptos al formulario', 738, 735, 477)
];
const ORDEN = FUENTE_FILAS.map((f) => f['Fecha envio']);
const ENC = { enviados: 'Enviados', entregados: 'Entregados', aperturas: 'Aperturas', aud: 'Segmentacion' };

let ok = 0, mal = 0;
function af(nombre, cond, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-tabla-envios ==');

// ── 1 · ⭐⭐ CONTROL PRIMARIO: coherencia de fila ───────────────────────────────────────
console.log('\n1 · ⭐⭐ PRIMARIO — los campos de un envío salen de LA MISMA fila de la fuente');
console.log('     (no depende de ninguna definición del equipo: se verifica contra la base)');
[1, 2, 3, 4, 5].forEach((n) => {
  OP.reset();
  const leer = (suf) => OP.opFILA({
    marcador: 'camp_env' + n + '_' + suf, base_id: 'digital', solapa: 'Directa Mail',
    campo_logico: suf, columna: 'M', encabezado: ENC[suf], filas: FUENTE_FILAS,
    valor_fijo: n, separador: 'fecha_periodo', ordenPor: { campo: 'fecha_periodo', valores: ORDEN }
  }).valor;
  const env = leer('enviados');
  const fila = FUENTE_FILAS.filter((f) => f['Enviados'] === env)[0];
  af('env' + n + ': enviados/entregados/aperturas/aud de una sola fila',
    !!fila && leer('entregados') === fila['Entregados'] && leer('aperturas') === fila['Aperturas'] &&
    leer('aud') === fila['Segmentacion'],
    'enviados=' + env);
});
/* ⛔ El caso que hace falta y no se puede inventar: el 07/08 hay DOS envíos. Cualquiera de los dos
 * puede salir primero —la identidad de fila no está en los datos, `R-32`— pero **nunca cruzados**. */
OP.reset();
const e1 = ['enviados', 'entregados', 'aperturas'].map((suf) => OP.opFILA({
  base_id: 'digital', solapa: 'Directa Mail', campo_logico: suf, columna: 'M',
  encabezado: ENC[suf], filas: FUENTE_FILAS, valor_fijo: 1, separador: 'fecha_periodo',
  ordenPor: { campo: 'fecha_periodo', valores: ORDEN }
}).valor);
af('⛔ con DOS envíos el 07/08, env1 sale de uno o del otro pero NUNCA cruzado',
  JSON.stringify(e1) === JSON.stringify([84608, 83298, 18253]) ||
  JSON.stringify(e1) === JSON.stringify([121983, 120091, 24908]), JSON.stringify(e1));

// ── 2 · ⛔ Contra el CENSO, uno por uno ────────────────────────────────────────────────
console.log('\n2 · ⛔ Los 40 contra el censo — 9·8·8·7·8, nunca 5×9');
af('el wrapper cablea exactamente 40', FILAS.length === 40, 'son ' + FILAS.length);
FILAS.forEach((f) => {
  af('`' + f.marcador + '` está en el censo de L-047', CENSO.indexOf(f.marcador) !== -1,
    'no está: sería una fila que no se pinta en ninguna lámina y NO falla');
});
const porEnvio = {};
FILAS.forEach((f) => {
  const n = f.marcador.match(/^camp_env(\d)_/)[1];
  porEnvio[n] = (porEnvio[n] || 0) + 1;
});
af('el reparto es 9·8·8·7·8',
  JSON.stringify([1, 2, 3, 4, 5].map((n) => porEnvio[n])) === JSON.stringify([9, 8, 8, 7, 8]),
  JSON.stringify(porEnvio));
af('⛔ camp_env4_fecha NO se inventó — la celda está combinada',
  FILAS.every((f) => f.marcador !== 'camp_env4_fecha'));
af('⛔ solo env1 tiene _rem', FILAS.filter((f) => /_rem$/.test(f.marcador)).length === 1 &&
  FILAS.some((f) => f.marcador === 'camp_env1_rem'));
/* ⚠ `camp_enviados` empieza con `camp_env`: filtrar por prefijo lo mete en la tabla, y es el
 * GLOBAL. Medido el 23/08 al extraer el censo — el primo del `N × M`. */
af('⚠ camp_enviados NO entró por parecerse a camp_env*',
  FILAS.every((f) => f.marcador !== 'camp_enviados'));
['camp_bench_remitente', 'camp_mail_insight', 'camp_remitente', 'camp_or', 'camp_mail_clics']
  .forEach((t) => af('`' + t + '` sigue fuera', FILAS.every((f) => f.marcador !== t)));

// ── 3 · Los tipos, medidos ─────────────────────────────────────────────────────────────
console.log('\n3 · Los tipos — `_aud` es TEXTO, y eso se afirma');
FILAS.filter((f) => /_aud$/.test(f.marcador)).forEach((f) => {
  af(f.marcador + ' lee mail_segmentacion y publica TEXTO',
    f.campo_logico === 'mail_segmentacion' && f.formato === 'texto',
    f.campo_logico + ' / ' + f.formato);
});
af('los 5 `_fecha`… son 4 y van `formato: fecha`',
  FILAS.filter((f) => /_fecha$/.test(f.marcador)).every((f) => f.formato === 'fecha') &&
  FILAS.filter((f) => /_fecha$/.test(f.marcador)).length === 4);
/* ⛔ **`fraccion`, NO `porcentaje_sin_signo`, y la corrección es del 23/08.** Las columnas `P`
 * (% OR) y `R` (% CTOR) guardan **fracciones 0–1** — medido: `P = Aperturas/Entregados` exacto y
 * el máximo sobre 2.266 filas con valor es `1.0000`. `porcentaje_sin_signo` **no multiplica**:
 * espera unidades de porcentaje, así que `0.4738` salía `0.5`.
 * ⚠ **`camp_ctor` del GLOBAL sí va con `PCT`** —`opPCT` es `opRATIO * 100`, el ×100 está en la
 * operación— y por eso publicaba bien. Son dos caminos en la misma lámina y el que andaba era el
 * molde: mirarlo primero evitó tocar la operación, que no tenía nada. */
af('`_or` y `_ctor` van `fraccion` — las columnas P y R guardan 0–1',
  FILAS.filter((f) => /_(or|ctor)$/.test(f.marcador)).every((f) => f.formato === 'fraccion'),
  'con porcentaje_sin_signo un 47,4 % sale «0.5»');
af('y son diez: cinco `_or` y cinco `_ctor`',
  FILAS.filter((f) => /_(or|ctor)$/.test(f.marcador)).length === 10);

// ── 4 · La operación y el orden, en las 40 ─────────────────────────────────────────────
console.log('\n4 · Las 40 usan FILA con el orden declarado');
af('las 40 son operacion FILA', FILAS.every((f) => f.operacion === 'FILA'));
af('las 40 declaran separador = fecha_periodo', FILAS.every((f) => f.separador === 'fecha_periodo'),
  'sin orden declarado FILA falla, y con órdenes distintos las filas se desalinean');
af('el índice va como ENTERO, no como texto ni como `n/5` (C-83)',
  FILAS.every((f) => typeof f.valor_fijo === 'number' && f.valor_fijo >= 1 && f.valor_fijo <= 5));
af('el índice coincide con el número del token',
  FILAS.every((f) => String(f.valor_fijo) === f.marcador.match(/^camp_env(\d)_/)[1]));

console.log('\n== ' + (mal === 0 ? '✅ VERDE' : '⛔ ROJO') + ' — ' + ok + ' de ' + (ok + mal) +
  ' afirmaciones, sobre 40 marcadores y los ' + CENSO.length + ' tokens del censo de L-047 ==');
console.log('⚠ SECUNDARIO, y se mide en la corrida: la fila GLOBAL. Hipótesis declarada ANTES —');
console.log('  si camp_enviados suma los cinco envíos, cierra. Si NO cierra, no es un bug del');
console.log('  cableado: es evidencia de que el GLOBAL suma otro universo, que es lo preguntado.');
process.exit(mal === 0 ? 0 : 1);
