#!/usr/bin/env node
/**
 * tools/probar-parseo-temario.js — **el parser del temario contra el formato REAL** (25/08/2026).
 *
 * ⭐ **El fixture no es inventado: son las líneas de `docs/TEMARIOS_reales_2026-08-25.md`**, que
 * son los dos primeros temarios reales que tuvo el repo. Hasta ese día todo lo que se suponía
 * sobre el temario salía de lo que quedó cargado en `REUNIONES` — **el resultado de una adaptación
 * manual, no la entrada**. Se razonaba sobre el efecto y se lo tomaba por la causa.
 *
 * **Qué fija, y las tres cosas se rompen distinto:**
 *
 *   1. ⛔ **`(pre + post)` y sus variantes NO ensucian `notas`.** Antes caían ahí, y `notas` es
 *      donde van los rangos como *"24/07 al 30/07 inclusive - Acumulado"*. Reconocer la anotación
 *      es lo que permite descartarla; el texto entero sobrevive en `texto_original`.
 *   2. ⛔ **`etapa` NO se escribe desde el temario.** *El temario dice qué encuentros entran; las
 *      bases dicen qué etapas tuvo cada uno.* ⚠ Incluye el caso `(pre)` solo, que **antes sí la
 *      escribía**: es el que más fácil se reinstala sin querer.
 *   3. ⭐ **El nombre sale limpio.** `Encuentro Temático: Salud` daba `": Salud"` y ese texto
 *      viajaba a la clave de confirmación del anclaje y a `FALTANTES`.
 *
 * ⚠ **Control positivo que comparte camino:** las líneas que ya funcionaban —sin paréntesis, con
 * rango en el paréntesis— tienen que seguir igual. Sin eso, un parser que devolviera todo vacío
 * pasaría los tres puntos de arriba.
 *
 * Uso:
 *   node tools/probar-parseo-temario.js
 *   node tools/probar-parseo-temario.js --autoprueba
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const REUNIONES = fs.readFileSync(path.join(RAIZ, 'Reuniones.gs'), 'utf8');
const PARSEO = fs.readFileSync(path.join(RAIZ, 'Parseo.gs'), 'utf8');

let fallas = [];
let ok = 0;
function af(cond, msg, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + msg); }
  else { fallas.push(msg); console.log('  ⛔ ' + msg + (detalle ? ' — ' + detalle : '')); }
}

function extraerDe(src, nombre) {
  const i = src.indexOf('function ' + nombre + '(');
  if (i === -1) throw new Error('no encontré `' + nombre + '` — si se renombró, esta prueba tiene ' +
    'que enterarse en vez de dar verde sobre otra cosa.');
  let j = src.indexOf('{', i), nivel = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === '{') nivel++;
    else if (src[k] === '}') { nivel--; if (nivel === 0) return src.slice(i, k + 1); }
  }
  throw new Error('`' + nombre + '` sin cerrar');
}

/** El parser REAL, extraído. No se reimplementa (`CLAUDE.md` §4). */
function contexto(parchear) {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    parseInt, parseFloat };
  vm.createContext(ctx);
  let src = REUNIONES;
  if (parchear) {
    const antes = src;
    src = parchear(src);
    /* ⚠ La guarda del 24/08: un parche que no matchea corre sobre el código intacto y da verde sin
     * haber probado nada. `Reuniones.gs` está en CRLF — los patrones van por fragmento de UNA
     * línea, nunca por bloques con `\n`. */
    if (src === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  ['var TIPOS_REUNION_CONOCIDOS_', 'var TIPO_AGREGADO_POR_EJE_'].forEach((v) => {
    const i = src.indexOf(v);
    const cierre = src.indexOf(v.indexOf('TIPOS') !== -1 ? ']' : '}', i);
    vm.runInContext(src.slice(i, src.indexOf(';', cierre) + 1), ctx);
  });
  ['normalizar_', 'parsearFecha_'].forEach((n) => vm.runInContext(extraerDe(PARSEO, n), ctx));
  vm.runInContext(extraerDe(src, 'parsearLineaReunion_'), ctx);
  return ctx;
}

const P = contexto();
const p = (l) => P.parsearLineaReunion_(l);

console.log('== probar-parseo-temario — el parser contra el formato REAL ==');

console.log('\n1 · control positivo — las líneas reales se parsean, no vuelven vacías');
{
  const r = p('1) JM | Uno a uno en Parque Avellaneda 12/08 (pre + post)');
  af(r.eje === 'JM' && r.tipo === 'Uno a uno', 'eje y tipo salen bien');
  af(r.nombre === 'Parque Avellaneda', 'y el nombre también (' + r.nombre + ')');
  af(r.fecha instanceof Date, 'y la fecha es una fecha, no un texto');
  af(r.orden === 1, 'y el número de orden se toma del "1)"');
}

console.log('\n2 · ⛔ `(pre + post)` y variantes: NO ensucian `notas` y NO escriben `etapa`');
[
  '1) JM | Uno a uno en Parque Avellaneda 12/08 (pre + post)',
  '1) JM | Uno a uno en San Cristóbal 23/07 (pre + post)',
  'JM | Uno a uno en Retiro 24/07 (pre+post)',
  'JM | Uno a uno en Retiro 24/07 (PRE + POST)',
  'JM | Uno a uno en Retiro 24/07 (Pre + Post)',
  'JM | Uno a uno en Retiro 24/07 (post + pre)'
].forEach((l) => {
  const r = p(l);
  af(r.notas === '', 'no ensucia `notas`: ' + l.slice(-16), 'dijo "' + r.notas + '"');
  af(r.etapa === '', 'y `etapa` queda vacía: ' + l.slice(-16), 'dijo "' + r.etapa + '"');
});

console.log('\n3 · ⛔ `(pre)` y `(POST)` SOLOS tampoco escriben `etapa` — es el que se reinstala solo');
['JM | Uno a uno en San Cristóbal 23/07 (pre)', 'JM | Uno a uno en San Cristóbal 23/07 (POST)']
  .forEach((l) => {
    const r = p(l);
    af(r.etapa === '', 'sin `etapa`: ' + l.slice(-8), 'dijo "' + r.etapa + '"');
    af(r.notas === '', 'y sin ensuciar `notas`: ' + l.slice(-8));
  });

console.log('\n4 · ⭐ el nombre sale LIMPIO — el origen de `: Salud`');
{
  const r = p('2) JM | Encuentro Temático: Salud 14/08');
  af(r.nombre === 'Salud', 'sin los dos puntos del separador (dijo "' + r.nombre + '")');
  af(r.tipo === 'Encuentro Temático', 'y el tipo se reconoce igual');
  /* ⚠ El mismo texto sin el separador tiene que dar lo mismo: si no, el arreglo dependería de que
   * el temario use `:`, que es justo lo que varía entre líneas. */
  af(p('JM | Encuentro Temático Orden Público 28/07').nombre === 'Orden Público',
    'y una línea SIN separador da lo mismo que antes');
}

console.log('\n5 · ⚠ control positivo — lo que NO es anotación de etapa sigue yendo a `notas`');
{
  /* ⚠ Se afirma el PREFIJO y no la igualdad: esa línea además no trae fecha, así que `notas`
   * acumula su segundo aviso. Exigir igualdad exacta haría fallar la prueba por un comportamiento
   * viejo y correcto — el fixture estaba mal escrito, no el código. */
  const r = p('Ministros | Reuniones de la semana (24/07 al 30/07 inclusive - Acumulado)');
  af(r.notas.indexOf('24/07 al 30/07 inclusive - Acumulado') === 0,
    'un rango en el paréntesis sigue cayendo a `notas` (dijo "' + r.notas + '")');
  af(p('JM | Uno a uno en Retiro 24/07 (prepost)').notas === 'prepost',
    '`(prepost)` sin separador NO es anotación de etapa: va a notas');
  af(p('JM | Uno a uno en Retiro 24/07 (pre + algo)').notas === 'pre + algo',
    'y `(pre + algo)` tampoco — sólo `pre`/`post` combinados');
}

console.log('\n6 · una línea SIN paréntesis es un encuentro igual');
{
  const r = p('JM | Encuentro Temático Orden Público 28/07');
  af(r.etapa === '' && r.notas === '', 'sin etapa y sin notas');
  af(r.nombre === 'Orden Público' && r.fecha instanceof Date, 'con nombre y fecha');
}

console.log('\n7 · ⚠ el texto original sobrevive entero — es donde queda lo descartado');
{
  const l = '1) JM | Uno a uno en Parque Avellaneda 12/08 (pre + post)';
  af(p(l).texto_original === l, 'la línea completa queda en `texto_original`');
}


console.log('\n8 · ⭐ la preposición se recorta, y el borde que evita comerse un barrio');
{
  /* `Primera persona con Pareto` quedó cargado como `"con Pareto"` el 25/08. Misma familia que
   * `: Salud`: el tipo matchea y lo que queda se toma tal cual. */
  af(p('JM | Primera persona con Pareto 27/07').nombre === 'Pareto',
    '`con Pareto` sale `Pareto` (dijo "' + p('JM | Primera persona con Pareto 27/07').nombre + '")');
  af(p('JM | Primera persona en Villa Urquiza 27/07').nombre === 'Villa Urquiza',
    'y `en` sigue funcionando como antes — control positivo, no se rompió lo que andaba');
  /* ⛔ El borde que hace segura a la lista: `\s+` exige palabra entera. Sin él, `Constitución`
   * se cortaría en `stitución` — un nombre que CASI parece bien, que es el peor resultado. */
  af(p('JM | Uno a uno en Constitución 12/08').nombre === 'Constitución',
    '⛔ y NO se come `Constitución`: la preposición tiene que ser palabra entera');
  af(p('JM | Uno a uno en Concordia 12/08').nombre === 'Concordia',
    'ni `Concordia`, por lo mismo');
}

console.log('\n9 · ⭐ la fecha sale como Date, no como texto');
{
  /* Medido el 25/08 porque la carga nueva se veía como `23/07/2026` en la hoja. El parser
   * escribe un Date; lo que se ve es el FORMATO de la celda, no el tipo. Y aunque quedara texto,
   * los dos consumidores que comparan fechas hacen `instanceof Date ? x : parsearFechaCelda_(x)`
   * y `parsearFechaCelda_('23/07/2026')` devuelve la fecha correcta — medido. */
  ['1) JM | Uno a uno en San Cristóbal 23/07 (pre + post)',
   '2) JM | Encuentro Temático: Salud 14/08',
   'JM | Primera persona con Pareto 27/07'].forEach((l) => {
    const r = p(l);
    af(r.fecha instanceof Date, 'es Date, no texto: ' + r.nombre);
  });
  af(p('1) JM | Uno a uno en San Cristóbal 23/07 (pre + post)').fecha.getUTCMonth() === 6,
    'y el mes es julio (6), no marzo — dd/mm y no mm/dd');
}

if (process.argv.indexOf('--autoprueba') !== -1) {
  console.log('\n== autoprueba: control negativo CON MOTIVO ==');
  let malas = 0;
  const casos = [
    {
      nombre: 'vuelvo a escribir `etapa` cuando dice (pre)',
      mutar: (s) => s.replace('var esAnotacionDeEtapa = /^(pre|post)(\\s*\\+\\s*(pre|post))?$/i.test(dentroParen);',
        "var esAnotacionDeEtapa = /^(pre|post)(\\s*\\+\\s*(pre|post))?$/i.test(dentroParen); if (/^pre$/i.test(dentroParen)) propuesta.etapa = 'pre';"),
      probar: (ctx) => ctx.parsearLineaReunion_('JM | Uno a uno en San Cristóbal 23/07 (pre)').etapa === ''
    },
    {
      nombre: 'saco el recorte del separador del nombre',
      mutar: (s) => s.replace("nombre = nombre.replace(/^[\\s:;,.\\/|\\-–—]+|[\\s:;,.\\/|\\-–—]+$/g, '').trim();", ''),
      probar: (ctx) => ctx.parsearLineaReunion_('2) JM | Encuentro Temático: Salud 14/08').nombre === 'Salud'
    },
    {
      nombre: 'estrecho la anotación a la forma vieja',
      mutar: (s) => s.replace('/^(pre|post)(\\s*\\+\\s*(pre|post))?$/i', '/^(pre|post)$/i'),
      probar: (ctx) => ctx.parsearLineaReunion_('JM | Uno a uno en Retiro 24/07 (pre + post)').notas === ''
    }
  ];
  casos.forEach((c) => {
    let sigueVerde;
    try { sigueVerde = c.probar(contexto(c.mutar)); }
    catch (e) { console.log('  ⛔ ' + c.nombre + ' — ' + e.message); malas++; return; }
    if (!sigueVerde) console.log('  ✅ ' + c.nombre + ' → la afirmación cae');
    else { malas++; console.log('  ⛔ ' + c.nombre + ' → SIGUE en verde: no mide lo que dice'); }
  });
  console.log('');
  console.log(malas ? '⛔ la autoprueba encontró ' + malas + ' caso(s) mal medido(s).'
    : '✅ los ' + casos.length + ' casos negativos caen por el motivo correcto.');
  process.exit(malas ? 1 : 0);
}

console.log('');
console.log(fallas.length ? '⛔ ' + fallas.length + ' de ' + (ok + fallas.length) + ' en rojo.'
  : '✅ Las ' + ok + ' afirmaciones pasaron.');
console.log('⚠ Lo que NO dice: qué hace el CARGADOR con dos líneas que ahora producen la misma');
console.log('  fila. El temario partido a mano de julio_24_30 se borra y se recarga (usuario, 25/08).');
process.exit(fallas.length ? 1 : 0);
