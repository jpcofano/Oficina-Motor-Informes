#!/usr/bin/env node
/**
 * tools/probar-desglose-plataforma.js — el control de los 17 tokens de `L-046`.
 *
 * ⭐⭐ **La afirmación que da nombre a esto: los tokens se cablean contra el CENSO, uno por uno.**
 * Este control **abre `docs/CENSO_tokens_sin_fila_2026-08-22.md`** y exige que cada marcador que
 * `cablearDesglosePorPlataforma()` escribe esté en la lista de `L-046`. **Un token inventado no
 * falla en ningún lado** —resuelve, no encuentra dónde pintarse, no aparece en `FALTANTES`— y
 * queda como una fila de `MARCADORES` que nadie va a poder explicar. Acá falla.
 *
 * ⛔ **Y la afirmación negativa, que es la otra mitad: los OCHO que no entran siguen sin entrar.**
 * Los seis `camp_bench_*` y `camp_dig_insight` son **texto que escribe una persona**, y una `SUMA`
 * sobre una columna de texto **publica vacío sin fallar** — el error que no produce un número malo
 * sino una ausencia que apunta al lugar equivocado. `camp_eje` no tiene columna decidida.
 *
 * ⚠ **Lo que NO contesta:** si los números están bien. Eso lo dice una corrida contra el deck del
 * equipo, y el control que sirve para eso está impreso por el propio wrapper: **las tres
 * plataformas tienen que sumar la fila TOTALES** (`V-109`, medido exacto sobre `3481-AGOINFAN`).
 *
 * Uso:
 *   node tools/probar-desglose-plataforma.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const CENSO = fs.readFileSync(
  path.join(RAIZ, 'docs', 'CENSO_tokens_sin_fila_2026-08-22.md'), 'utf8');

const SALTO = String.fromCharCode(10);
const BARRA = String.fromCharCode(92);

/** Recorta una expresión balanceada saltando cadenas y comentarios. */
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

// ── Las filas que el wrapper escribe, ejecutadas tal como están ─────────────────────────
const marcaFn = 'function cablearDesglosePorPlataforma()';
if (FUENTE.indexOf(marcaFn) === -1) {
  throw new Error('No encontré `' + marcaFn + '` en Instalar.gs — si se renombró, esta prueba ' +
    'tiene que enterarse en vez de dar verde sobre otra cosa.');
}
const marcaArr = 'curarMarcadores_([], ';
const iArr = FUENTE.indexOf(marcaArr, FUENTE.indexOf(marcaFn)) + marcaArr.length;
const FILAS = new Function('return ' + recortar(FUENTE, iArr))();

// ── La lista de L-046 según el censo — la fuente contra la que se cablea ────────────────
function tokensDeLaminaEnCenso(laminaId) {
  const re = new RegExp('L-' + laminaId.replace(/^L-/, '') +
    '(?: \\(ESCONDIDA\\))? — \\d+ de \\d+ sin fila:');
  const m = CENSO.match(re);
  if (!m) throw new Error('El censo no tiene un bloque para ' + laminaId);
  const desde = CENSO.indexOf(m[0]) + m[0].length;
  // El bloque termina en la próxima línea que arranca con «lámina» o con «== RESUMEN».
  const resto = CENSO.slice(desde);
  const fin = resto.search(/\n\s{2}(?:lámina|== RESUMEN)/);
  return resto.slice(0, fin === -1 ? undefined : fin)
    .split(',').map((t) => t.trim()).filter(Boolean);
}
const CENSO_L046 = tokensDeLaminaEnCenso('L-046');

// ── DIMENSIONES_ y MAPEO, del código real ───────────────────────────────────────────────
const DIMS = new Function('return ' + recortar(FUENTE.indexOf ? fs.readFileSync(
  path.join(RAIZ, 'Fuentes.gs'), 'utf8') : '',
  fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8').indexOf('var DIMENSIONES_ = ') +
  'var DIMENSIONES_ = '.length))();
const MAPEO = new Function('return ' + recortar(FUENTE,
  FUENTE.indexOf('var SEED_MAPEO_ = ') + 'var SEED_MAPEO_ = '.length))();
const columnaDe = (campo) => (MAPEO.filter(
  (f) => f.base_id === 'looker' && f.hoja === 'DIGITAL' && f.campo_logico === campo)[0] || {}).columna;

let ok = 0, mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-desglose-plataforma ==');

console.log('\n1 · Contra el CENSO — cada token cableado está en la lista de L-046');
console.log('    (' + FILAS.length + ' cableados · ' + CENSO_L046.length + ' sin fila en el censo)');
af('el wrapper cablea exactamente 17', FILAS.length === 17, 'son ' + FILAS.length);
FILAS.forEach((f) => {
  af('`' + f.marcador + '` está en el censo de L-046', CENSO_L046.indexOf(f.marcador) !== -1,
    'no está: sería una fila de MARCADORES que no se pinta en ninguna lámina y no falla');
});

/* ── 2 · Los que este lote NO toca ──────────────────────────────────────────────────────
 * ⚠ **Son ocho, pero NO son la misma cosa, y confundirlos costaría un token sin cablear para
 * siempre:** **siete son texto que escribe una persona** y `camp_eje` **no** — tiene fuente
 * (`eje`, columna `E` de `looker/resumen_metricas_dinamico`) y se cablea en
 * `cablearImplementacionesYEje()`. Un ⛔ que dice *"no entra"* y uno que dice *"entra en el paso
 * siguiente"* mandan a trabajos distintos. */
console.log('\n2 · Los ocho que este lote no toca — SIETE son texto del equipo y uno no');
const EXCLUIDOS = CENSO_L046.filter((t) => FILAS.every((f) => f.marcador !== t));
af('quedan exactamente 8 fuera de este lote', EXCLUIDOS.length === 8, EXCLUIDOS.join(', '));
const TEXTO_DEL_EQUIPO = ['camp_bench_meta_ctr', 'camp_bench_meta_vtr', 'camp_bench_google_ctr',
  'camp_bench_google_vtr', 'camp_bench_prog_ctr', 'camp_bench_prog_vtr', 'camp_dig_insight'];
TEXTO_DEL_EQUIPO.forEach((t) => {
  af('`' + t + '` NO se cablea nunca — lo escribe una persona', EXCLUIDOS.indexOf(t) !== -1,
    'texto del equipo cableado como métrica publica vacío sin fallar');
});
af('`camp_eje` está fuera de ESTE lote pero SÍ se cablea (en el paso de impl + eje)',
  EXCLUIDOS.indexOf('camp_eje') !== -1,
  'si entrara acá, se cablearía sobre looker/DIGITAL y su fuente está en resumen_metricas_dinamico');

console.log('\n3 · D-33 — el corte va en dimensiones, nunca en filtro ni en el nombre');
const PLAT = FILAS.filter((f) => f.solapa === 'DIGITAL');
af('los 15 de plataforma leen looker/DIGITAL', PLAT.length === 15, 'son ' + PLAT.length);
PLAT.forEach((f) => {
  af('`' + f.marcador + '` declara su corte en dimensiones y NO en filtro',
    /^plataforma=(meta|google|programmatic)$/.test(f.dimensiones || '') && !f.filtro,
    'dimensiones=' + f.dimensiones + ' · filtro=' + (f.filtro || '(vacío)'));
});

console.log('\n4 · ⛔ filtro VACÍO — la identidad que V-109 validó');
/* Los ocho `imp_*` llevan `estado=Activa`; éstos NO, a propósito. `V-109` midió que las filas por
 * plataforma suman **exacto** el agregado de `resumen_metricas_dinamico`, y ese sumatorio no
 * filtra por estado. Agregarlo rompería la única identidad validada de este bloque. */
af('ningún marcador de plataforma lleva estado=Activa',
  PLAT.every((f) => !f.filtro),
  'con estado=Activa las partes dejan de sumar el total que V-109 midió');

console.log('\n5 · El vocabulario y las columnas existen');
['meta', 'google', 'programmatic'].forEach((v) => {
  af('DIMENSIONES_.plataforma.' + v + ' cubre looker|DIGITAL',
    !!(DIMS.plataforma && DIMS.plataforma[v] && DIMS.plataforma[v]['looker|DIGITAL']),
    'sin traducción, el corte no se aplica');
});
['Impresiones', 'Visualizaciones', 'Clics'].forEach((campo) => {
  af('looker/DIGITAL mapea `' + campo + '`', !!columnaDe(campo), 'sin fila de MAPEO');
});
PLAT.filter((f) => f.operacion === 'PCT').forEach((f) => {
  const partes = String(f.campo_logico).split('/');
  af('`' + f.marcador + '` es PCT con numerador/denominador mapeados',
    partes.length === 2 && !!columnaDe(partes[0]) && !!columnaDe(partes[1]), f.campo_logico);
});

console.log('\n6 · Los dos de la fila TOTALES — molde camp_ctor, y no necesitaban X-39');
const TOT = FILAS.filter((f) => f.solapa === 'resumen_metricas_dinamico');
af('camp_ctr y camp_vtr leen resumen_metricas_dinamico', TOT.length === 2, 'son ' + TOT.length);
af('los dos son PCT sin corte', TOT.every((f) => f.operacion === 'PCT' && !f.dimensiones && !f.filtro));

/* ── 7 · `camp_meta_frecuencia` — el token que NACIÓ DESPUÉS del censo ──────────────────
 * ⛔⛔ **Esta sección existe para que nadie lo meta en el lote de los 17**, y el motivo es que los
 * 17 se cruzan contra un censo **congelado del 22/08**. Este token se agregó a la plantilla el
 * 23/08, así que **no puede estar ahí** — plegarlo al lote obligaría a aflojar el cruce, que es
 * justo el control que hace que un token inventado falle.
 * **Su control es otro y es del usuario: `censarTokensSinMarcador()` corrido antes y después.** */
console.log('\n7 · camp_meta_frecuencia — va SOLO, y por qué');
const TOKEN_NUEVO = 'camp_meta_frecuencia';
af(TOKEN_NUEVO + ' NO está entre los 17 del lote',
  FILAS.every((f) => f.marcador !== TOKEN_NUEVO),
  'plegarlo al lote rompe el cruce contra el censo congelado');
af(TOKEN_NUEVO + ' NO está en el censo del 22/08 (nació el 23) — por eso va aparte',
  CENSO_L046.indexOf(TOKEN_NUEVO) === -1,
  'si apareciera, el censo no sería del 22/08 y esta separación no haría falta');

const marcaMeta = 'function cablearMetaFrecuencia()';
af('existe el wrapper cablearMetaFrecuencia()', FUENTE.indexOf(marcaMeta) !== -1);
if (FUENTE.indexOf(marcaMeta) !== -1) {
  const iMeta = FUENTE.indexOf(marcaArr, FUENTE.indexOf(marcaMeta)) + marcaArr.length;
  const META = new Function('return ' + recortar(FUENTE, iMeta))();
  af('cablea exactamente una fila', META.length === 1, 'son ' + META.length);
  const f = META[0] || {};
  af('lee resumen_metricas_dinamico y NO looker/DIGITAL',
    f.solapa === 'resumen_metricas_dinamico', f.solapa);
  af('su campo lógico es meta_frecuencia', f.campo_logico === 'meta_frecuencia', f.campo_logico);
  af('es ULTIMO, el molde de camp_alcance', f.operacion === 'ULTIMO', f.operacion);
  /* ⭐ La plataforma acá es una COLUMNA, no una dimensión de fila: `DIMENSIONES_` no declara
   * `plataforma` para esta solapa y declararla fallaría. No es un incumplimiento de `D-33`. */
  af('dimensiones VACÍO — acá la plataforma es columna, no dimensión de fila', !f.dimensiones,
    'dimensiones=' + f.dimensiones + ': DIMENSIONES_.plataforma no cubre resumen_metricas_dinamico');
  af('DIMENSIONES_.plataforma efectivamente NO cubre esta solapa (por eso va vacío)',
    !(DIMS.plataforma && DIMS.plataforma.meta &&
      DIMS.plataforma.meta['looker|resumen_metricas_dinamico']),
    'si la cubriera, el corte debería ir en dimensiones y esta fila estaría mal');
}

const filaL = MAPEO.filter((x) => x.base_id === 'looker' &&
  x.hoja === 'resumen_metricas_dinamico' && x.campo_logico === 'meta_frecuencia')[0];
af('MAPEO mapea meta_frecuencia en la columna L', !!filaL && filaL.columna === 'L',
  filaL ? 'columna ' + filaL.columna : 'sin fila de MAPEO');
af('y NO pisó a `frecuencia`, que sigue en la M', (MAPEO.filter((x) =>
  x.base_id === 'looker' && x.hoja === 'resumen_metricas_dinamico' &&
  x.campo_logico === 'frecuencia')[0] || {}).columna === 'M',
  'son dos columnas y dos hechos distintos: M total, L Meta');

/* ── 8 · Los tres que X-39 destrabó — `camp_dig_impl`, `camp_dir_impl`, `camp_eje` ──────
 * ⭐ Se cruzan contra el censo **igual que los 17**, pero contra **`L-045`** para los dos `impl`.
 * Y la afirmación que más importa acá es de **tipo**: `camp_eje` es TEXTO. Cablearlo con `SUMA`
 * devolvería `sin_datos` y el casillero saldría con el símbolo de sin dato — *"el dato no llegó"*
 * sobre un dato que está. */
console.log('\n8 · Los tres que X-39 destrabó (L-045 + camp_eje)');
const CENSO_L045 = tokensDeLaminaEnCenso('L-045');
const marcaImpl = 'function cablearImplementacionesYEje()';
af('existe el wrapper cablearImplementacionesYEje()', FUENTE.indexOf(marcaImpl) !== -1);
if (FUENTE.indexOf(marcaImpl) !== -1) {
  const iImpl = FUENTE.indexOf(marcaArr, FUENTE.indexOf(marcaImpl)) + marcaArr.length;
  const IMPL = new Function('return ' + recortar(FUENTE, iImpl))();
  af('cablea exactamente 3', IMPL.length === 3, 'son ' + IMPL.length);
  const por = {};
  IMPL.forEach((f) => { por[f.marcador] = f; });

  af('camp_dig_impl y camp_dir_impl están en el censo de L-045',
    CENSO_L045.indexOf('camp_dig_impl') !== -1 && CENSO_L045.indexOf('camp_dir_impl') !== -1,
    CENSO_L045.join(', '));
  af('camp_eje está en el censo de L-046', CENSO_L046.indexOf('camp_eje') !== -1);

  af('camp_dig_impl es CONTEO sobre looker/DIGITAL por ldig_id_cuenta',
    por.camp_dig_impl && por.camp_dig_impl.operacion === 'CONTEO' &&
    por.camp_dig_impl.solapa === 'DIGITAL' && por.camp_dig_impl.campo_logico === 'ldig_id_cuenta',
    'cuenta filas por la clave que X-39 declaró como campo_id_cuenta');
  af('camp_dir_impl es CONTEO sobre digital/Directa Mail por mail_id_cuenta',
    por.camp_dir_impl && por.camp_dir_impl.operacion === 'CONTEO' &&
    por.camp_dir_impl.solapa === 'Directa Mail' &&
    por.camp_dir_impl.campo_logico === 'mail_id_cuenta');
  af('los dos CONTEO van sin filtro — estado=Activa daría 3 donde el equipo publica 4',
    !!por.camp_dig_impl && !por.camp_dig_impl.filtro &&
    !!por.camp_dir_impl && !por.camp_dir_impl.filtro);
  /* ⭐ Un `CONTEO` es inmune a la inestabilidad por CAMBIO: `R-31` mide cero altas en
   * `looker/DIGITAL`, así que los valores se reescriben pero las filas no se mueven. Por eso
   * éstos NO nacen `_revisar` y los quince del desglose sí. */
  af('los dos CONTEO nacen SIN _revisar — un conteo de filas no lo mueve un recálculo',
    !!por.camp_dig_impl && !/_revisar$/.test(por.camp_dig_impl.formato || '') &&
    !!por.camp_dir_impl && !/_revisar$/.test(por.camp_dir_impl.formato || ''));

  af('⛔ camp_eje es TEXTO, no métrica',
    por.camp_eje && por.camp_eje.operacion === 'ULTIMO' && por.camp_eje.formato === 'texto',
    'una SUMA sobre texto devuelve sin_datos y el casillero miente sobre la causa');
  af('camp_eje lee resumen_metricas_dinamico y su campo está mapeado',
    !!por.camp_eje && por.camp_eje.solapa === 'resumen_metricas_dinamico' &&
    (MAPEO.filter((x) => x.base_id === 'looker' &&
      x.hoja === 'resumen_metricas_dinamico' && x.campo_logico === por.camp_eje.campo_logico)[0] || {}).columna === 'E',
    'sin fila de MAPEO el marcador no resuelve');
}

console.log('\n== ' + (mal === 0 ? '✅ VERDE' : '⛔ ROJO') + ' — ' + ok + ' de ' + (ok + mal) +
  ' afirmaciones, sobre ' + FILAS.length + ' marcadores y los ' + CENSO_L046.length +
  ' tokens que el censo lista para L-046 ==');
console.log('⚠ No cubre: si los números están bien. Eso lo dice una corrida — y el control es que');
console.log('  las tres plataformas sumen la fila TOTALES (V-109, exacto sobre 3481-AGOINFAN).');
process.exit(mal === 0 ? 0 : 1);
