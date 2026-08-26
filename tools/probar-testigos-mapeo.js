#!/usr/bin/env node
/**
 * `tools/probar-testigos-mapeo.js` — **el testigo de `D-31` tiene que LLEGAR a la hoja, y tener
 * UNA sola fuente.**
 *
 * ⛔⛔ **Por qué existe, medido el 26/08/2026.** `MAPEO` tenía **30 de 197 filas con la celda
 * `encabezado` vacía** —el 15 %, y el 100 % de `digital/CAMPAÑAS_DESGLOCE_DIGITAL` y `looker/CC`—
 * mientras el seed **declaraba el testigo medido** para 23 de ellas. Las borraba el propio
 * `Instalar.gs`: el `forEach` que aplica `ENCABEZADO_POR_MAPEO_` terminaba en `|| ''`, así que una
 * fila que traía su encabezado **al lado de la letra** se lo perdía. **El testigo de `D-31` estaba
 * declarado y no ejercido**, y nada lo señalaba.
 *
 * **Las tres afirmaciones, y ninguna implica a las otras:**
 *   1. lo declarado inline **llega** al seed efectivo, con ese valor y no otro;
 *   2. ninguna clave tiene testigo en **los dos** lados — *dos fuentes para el mismo valor es lo
 *      que produjo (1)*;
 *   3. ninguna clave del mapa queda **sin fila de seed** — un literal que ningún camino puede
 *      aplicar no es un testigo, y hace que el mapa **parezca** completo mientras la celda está
 *      vacía.
 *
 * ⭐ **Afirma sobre el seed EFECTIVO**, vía `tools/seed-mapeo.js`, que ejecuta el post-proceso real
 * de `Instalar.gs` en vez de copiarlo. Es la pregunta que `CLAUDE.md` §4 manda hacerse antes de
 * correr un control: *¿sobre qué artefacto corre esta afirmación, y es el mismo del que se va a
 * hablar después?*
 *
 * ⚠ **Lo que NO contesta:** qué dice la hoja hoy, ni si la letra sigue apuntando a esa columna.
 * Eso es `verificarEncabezadosDeMapeo()` contra la planilla viva, y es otra pregunta.
 *
 * Uso:
 *   node tools/probar-testigos-mapeo.js
 */

'use strict';

const seedMapeo = require('./seed-mapeo.js');
const FUENTE = seedMapeo.fuente();

let ok = 0, mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

/** Corre las mediciones sobre una fuente dada; los negativos la llaman con el texto mutado. */
function evaluar(fuente) {
  const s = seedMapeo.leer(fuente);
  const inline = Object.keys(s.inline);
  return {
    seed: s,
    filas: s.filas.length,
    inline: inline,
    // (1) declaran inline y NO llegan con ese valor
    pisados: inline.filter(function (k) { return (s.porClave[k] || {}).encabezado !== s.inline[k]; }),
    // (2) están en los dos lados
    dobles: inline.filter(function (k) { return k in s.mapa; }),
    // (3) claves del mapa sin fila de seed
    huerfanas: Object.keys(s.mapa).filter(function (k) { return !(k in s.porClave); }),
    sinTestigo: s.filas.filter(function (f) { return !f.encabezado; })
  };
}

const R = evaluar(FUENTE);

console.log('== probar-testigos-mapeo ==');
console.log('');
console.log('0 · control positivo — que el post-proceso REAL se haya ejecutado');
/* ⭐ Sin esto, un extractor que devolviera las listas crudas daría verde en todo lo de abajo: las
 * filas existirían y ninguna estaría «pisada». La prueba de que el post-proceso corrió es una fila
 * cuyo testigo SÓLO puede venir del mapa, porque no lo declara inline. */
af('el seed efectivo trae las cinco listas concatenadas (' + R.filas + ' filas)', R.filas > 150,
  'son ' + R.filas + ' — si bajó, alguna lista dejó de concatenarse');
af('`rdv|RVD JM-CM - ES|figura` resuelve su testigo DESDE EL MAPA («Figura»)',
  seedMapeo.testigo(R.seed, 'rdv', 'RVD JM-CM - ES', 'figura') === 'Figura',
  'esa fila no declara encabezado inline: si no dice «Figura», el post-proceso no corrió y el ' +
  'verde de abajo no significa nada');
af('`digital|CAMPAÑAS_DESGLOCE_DIGITAL|des_plataforma` resuelve DESDE LA FILA («Plataforma»)',
  seedMapeo.testigo(R.seed, 'digital', 'CAMPAÑAS_DESGLOCE_DIGITAL', 'des_plataforma') === 'Plataforma',
  'ésta lo declara inline: es la mitad que el `|| vacío` borraba');

console.log('');
console.log('1 · ⛔ lo declarado INLINE llega al seed efectivo — ' + R.inline.length + ' fila(s)');
af('ninguna declaración inline se pierde en el camino', R.pisados.length === 0,
  R.pisados.length + ' pisada(s): ' + R.pisados.slice(0, 6).join(' · ') +
  ' — el `forEach` de `ENCABEZADO_POR_MAPEO_` está sobreescribiendo en vez de decorar');

console.log('');
console.log('2 · ⛔ un testigo, UNA fuente');
af('ninguna clave declara encabezado inline Y en `ENCABEZADO_POR_MAPEO_`', R.dobles.length === 0,
  R.dobles.length + ' en los dos lados: ' + R.dobles.slice(0, 6).join(' · ') +
  ' — hoy coinciden; el día que difieran, gana la fila y el mapa miente en silencio');

console.log('');
console.log('3 · ⛔ ninguna clave del mapa sin fila de seed');
/* ⭐ Una clave que ninguna fila usa **no se aplica nunca**: el único camino del mapa a la hoja es
 * el `forEach` sobre `SEED_MAPEO_`. Las 7 que había hasta el 26/08 hacían que el mapa pareciera
 * completo —«testigo para las 161»— mientras esas 7 celdas estaban vacías en `MAPEO`. */
af('cero claves huérfanas en `ENCABEZADO_POR_MAPEO_`', R.huerfanas.length === 0,
  R.huerfanas.length + ' sin fila de seed: ' + R.huerfanas.slice(0, 8).join(' · ') +
  ' — o la fila entra al seed, o el testigo lo escribe su escritor real, o la clave sobra');

console.log('');
console.log('4 · cuánto se midió, y qué queda sin testigo');
/* ⚠ **Informativo, no afirmación.** Una fila sin ninguno de los dos es legítima: vacío significa
 * «sin testigo declarado», no «la columna no tiene título». Lo que NO puede pasar es que una fila
 * que sí lo declara termine vacía, y eso es la afirmación 1. */
console.log('     filas de seed        : ' + R.filas);
console.log('     con testigo inline   : ' + R.inline.length);
console.log('     con testigo del mapa : ' + (R.filas - R.inline.length - R.sinTestigo.length));
console.log('     sin testigo declarado: ' + R.sinTestigo.length +
  (R.sinTestigo.length ? ' → ' + R.sinTestigo.slice(0, 8).map(seedMapeo.clave).join(' · ') : ''));

console.log('');
console.log('5 · control negativo — CON MOTIVO: cuál cae y por qué');
/* ⚠ La mutación se EXIGE. Si el texto no cambió, el caso corre sobre el código intacto y su verde
 * no prueba nada: es la tercera de las tres formas de control negativo que `CLAUDE.md` §4 nombra
 * —(1) el instrumento no ve, (2) ve pero cae por otro motivo, (3) no llegó a mirar nada—. */
const NEGATIVOS = [
  {
    nombre: 'le devuelvo el sobreescribir al forEach del encabezado',
    mutar: function (s) { return s.replace('  fila.encabezado = fila.encabezado ||', '  fila.encabezado = \'\' ||'); },
    cae: function (r) { return r.pisados.length > 0; },
    afirmacion: 'ninguna declaración inline se pierde en el camino'
  },
  {
    nombre: 'devuelvo `des_plataforma` al mapa (dos fuentes para el mismo testigo)',
    mutar: function (s) {
      return s.replace('var ENCABEZADO_POR_MAPEO_ = {',
        'var ENCABEZADO_POR_MAPEO_ = {\n  \'digital|CAMPAÑAS_DESGLOCE_DIGITAL|des_plataforma\': \'Plataforma\',');
    },
    cae: function (r) { return r.dobles.length > 0; },
    afirmacion: 'ninguna clave declara encabezado inline Y en `ENCABEZADO_POR_MAPEO_`'
  },
  {
    nombre: 'agrego una clave al mapa que ninguna fila usa',
    mutar: function (s) {
      return s.replace('var ENCABEZADO_POR_MAPEO_ = {',
        'var ENCABEZADO_POR_MAPEO_ = {\n  \'digital|Digital|campo_que_no_existe\': \'Fantasma\',');
    },
    cae: function (r) { return r.huerfanas.length > 0; },
    afirmacion: 'cero claves huérfanas en `ENCABEZADO_POR_MAPEO_`'
  }
];
NEGATIVOS.forEach(function (c) {
  const mutado = c.mutar(FUENTE);
  if (mutado === FUENTE) {
    af('[negativo] ' + c.nombre, false,
      '⛔ la mutación NO cambió nada: correría sobre el código intacto y daría verde sin probar');
    return;
  }
  let r = null;
  try { r = evaluar(mutado); } catch (e) { r = null; }
  af('[negativo] ' + c.nombre + ' → cae «' + c.afirmacion + '»', !!r && c.cae(r),
    r ? 'la afirmación siguió en verde con la causa puesta: no mide lo que dice'
      : 'la fuente mutada no evalúa — el caso no prueba nada');
});

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · sobre ' + R.filas +
  ' fila(s) del seed EFECTIVO de `MAPEO`');
console.log('  ⚠ No cubre: qué dice la hoja hoy ni si la letra sigue apuntando ahí —');
console.log('     eso es `verificarEncabezadosDeMapeo()` contra la planilla viva.');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
