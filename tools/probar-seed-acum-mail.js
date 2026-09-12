#!/usr/bin/env node
/**
 * `tools/probar-seed-acum-mail.js` — **las dos listas de `acumulado | Mail` tienen que decir lo
 * mismo, y ninguna puede volver a los nombres `mail_*`.**
 *
 * ⛔⛔ **Por qué existe, medido el 11/09/2026 (`2026-09-11_4 ADDENDUM 4`).** La mudanza del mail de
 * campaña dio de alta 12 filas de `MAPEO` desde `MAPEO_ACUM_MAIL_`, con nombres `mail_*`. A.bis
 * las renombró a la familia `acm_*` del seed y borró las dos duplicadas —`A` y `AI`, que el seed
 * ya traía con otro nombre—. **`MAPEO_ACUM_MAIL_` se quedó con los nombres viejos**, así que una
 * segunda corrida de `aplicarMudanzaMail()` **re-creaba las 12 filas `mail_*`** y volvía a dejar
 * dos columnas con dos nombres cada una. **Sin fallar y sin avisar**, que es el modo de falla caro
 * de este repo: nadie mira una hoja que nadie tocó.
 *
 * ⭐ **La duplicación es el diseño y no se borra: lo que se hace es que el desajuste FALLE.** Es
 * exactamente el argumento de `tools/listas.js` con las tres listas de hojas de registro —el
 * contra-qué tiene que ser independiente— aplicado acá: el seed es lo que el sembrador reaplica en
 * cada corrida de configuración, y `MAPEO_ACUM_MAIL_` es lo que el alta de la mudanza escribe. Si
 * difieren, una de las dos escrituras pisa a la otra.
 *
 * **Las cuatro afirmaciones, y ninguna implica a las otras:**
 *   1. cada fila de `MAPEO_ACUM_MAIL_` está en el seed **con la misma letra y el mismo encabezado**;
 *   2. cada fila de seed de `acumulado | Mail` está en `MAPEO_ACUM_MAIL_` — *la deriva es
 *      simétrica, y un alta que entre a una sola de las dos es el mismo bug al revés*;
 *   3. **ningún `campo_logico` empieza con `mail_`** en ninguna de las dos: es el estado al que
 *      A.bis llevó la hoja y el que una segunda corrida podía deshacer;
 *   4. **ninguna columna lleva dos nombres** en el seed — la colisión concreta que A.bis resolvió
 *      borrando `mail_id_cuenta` (A) y `mail_remitente_etq` (AI).
 *
 * ⭐ **Afirma sobre el seed EFECTIVO**, vía `tools/seed-mapeo.js`, que ejecuta el post-proceso real
 * de `Instalar.gs` en vez de copiarlo.
 *
 * ⚠ **Lo que NO contesta:** qué dice `MAPEO` hoy. La hoja la mide `aplicarRenombreAcumMail` con su
 * relectura y `verificarEncabezadosDeMapeo()` contra la planilla viva. Esto contesta qué van a
 * escribir las dos listas la próxima vez que alguien las corra.
 *
 * Uso:
 *   node tools/probar-seed-acum-mail.js
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
  const seed = seedMapeo.leer(fuente).filas
    .filter(function (f) { return f.base_id === 'acumulado' && f.solapa === 'Mail'; });
  const lista = new Function('return ' + seedMapeo.recortarVar(fuente, 'MAPEO_ACUM_MAIL_', '[', ']'))();

  const porNombre = {};
  seed.forEach(function (f) { porNombre[f.campo_logico] = f; });

  /* (1) la lista del alta contra el seed, campo por campo y no sólo por nombre. */
  const desajustes = [];
  lista.forEach(function (c) {
    const f = porNombre[c.campo_logico];
    if (!f) { desajustes.push(c.campo_logico + ': no está en el seed'); return; }
    if (String(f.columna) !== String(c.columna)) {
      desajustes.push(c.campo_logico + ': letra ' + c.columna + ' en la lista, ' + f.columna + ' en el seed');
    }
    if (String(f.encabezado) !== String(c.encabezado)) {
      desajustes.push(c.campo_logico + ': encabezado «' + c.encabezado + '» en la lista, «' + f.encabezado + '» en el seed');
    }
  });

  /* (2) la otra dirección. */
  const enLista = {};
  lista.forEach(function (c) { enLista[c.campo_logico] = true; });
  const soloEnSeed = seed.filter(function (f) { return !enLista[f.campo_logico]; })
    .map(function (f) { return f.campo_logico; });

  /* (3) ningún nombre viejo, en ninguna de las dos. */
  const viejos = seed.map(function (f) { return f.campo_logico; })
    .concat(lista.map(function (c) { return c.campo_logico; }))
    .filter(function (n) { return String(n).indexOf('mail_') === 0; });

  /* (4) una columna, un nombre. */
  const porColumna = {};
  seed.forEach(function (f) {
    porColumna[f.columna] = (porColumna[f.columna] || []).concat(f.campo_logico);
  });
  const dobles = Object.keys(porColumna).filter(function (L) { return porColumna[L].length > 1; })
    .map(function (L) { return L + ' → ' + porColumna[L].join(' + '); });

  return { seed: seed, lista: lista, desajustes: desajustes, soloEnSeed: soloEnSeed,
           viejos: viejos, dobles: dobles, sinTestigo: seed.filter(function (f) { return !f.encabezado; }) };
}

const R = evaluar(FUENTE);

console.log('== probar-seed-acum-mail ==');
console.log('');
console.log('0 · control positivo — que las dos listas se hayan EXTRAÍDO de verdad');
/* ⭐ Sin esto, un extractor que devolviera cero filas daría verde en todas las de abajo: no habría
 * desajustes, no habría nombres viejos y no habría columnas dobles. **Cero unidades verificadas es
 * un problema, no un silencio** — y por eso el conteo es una afirmación y no una línea del log. */
af('el seed trae las 12 filas de `acumulado | Mail` (' + R.seed.length + ')', R.seed.length === 12,
  'son ' + R.seed.length + ' — si bajó, alguna se cayó del seed y el verde de abajo no dice nada');
af('`MAPEO_ACUM_MAIL_` trae 12 columnas (' + R.lista.length + ')', R.lista.length === 12,
  'son ' + R.lista.length);
af('las 12 del seed traen encabezado (`D-31`: testigo, nunca fallback)', R.sinTestigo.length === 0,
  R.sinTestigo.length + ' sin testigo: ' + R.sinTestigo.map(seedMapeo.clave).join(' · '));

console.log('');
console.log('1 · ⛔ la lista del alta dice lo mismo que el seed — letra Y encabezado');
af('cero desajustes entre `MAPEO_ACUM_MAIL_` y `SEED_MAPEO_ACUMULADO_`', R.desajustes.length === 0,
  R.desajustes.length + ': ' + R.desajustes.slice(0, 6).join(' · ') +
  ' — el alta de la mudanza y el sembrador escribirían cosas distintas en la misma celda');

console.log('');
console.log('2 · ⛔ y en la otra dirección — la deriva es simétrica');
af('ninguna fila de seed de `acumulado | Mail` falta en `MAPEO_ACUM_MAIL_`', R.soloEnSeed.length === 0,
  R.soloEnSeed.length + ' sólo en el seed: ' + R.soloEnSeed.join(' · ') +
  ' — un alta que entre a una sola de las dos es el mismo bug al revés');

console.log('');
console.log('3 · ⛔⛔ ningún `campo_logico` vuelve a llamarse `mail_*`');
/* ⛔ Es el `ADDENDUM 4` §2 literal: con un solo nombre viejo en `MAPEO_ACUM_MAIL_`, una segunda
 * corrida de `aplicarMudanzaMail()` re-crea esa fila al lado de la `acm_*` y la columna queda con
 * dos nombres. No falla: publica. */
af('cero nombres `mail_*` entre las dos listas', R.viejos.length === 0,
  R.viejos.length + ': ' + R.viejos.join(' · ') +
  ' — una segunda corrida de `aplicarMudanzaMail()` los re-crearía junto a los `acm_*`');

console.log('');
console.log('4 · ⛔ una columna, un nombre');
af('ninguna letra de `acumulado | Mail` lleva dos `campo_logico`', R.dobles.length === 0,
  R.dobles.join(' · ') + ' — es la colisión que A.bis resolvió borrando las duplicadas de A y AI');

console.log('');
console.log('5 · control negativo — CON MOTIVO: cuál cae y por qué');
/* ⚠ La mutación se EXIGE. Si el texto no cambió, el caso corre sobre el código intacto y su verde
 * no prueba nada — la tercera de las tres formas que `CLAUDE.md` §4 nombra.
 * ⭐ Y los tres casos son SINTÉTICOS: no dependen de que el bug del 11/09 siga vivo, así que el
 * banco sigue midiendo después de que todo esté limpio. */
const NEGATIVOS = [
  {
    nombre: 'le devuelvo a `MAPEO_ACUM_MAIL_` el nombre viejo `mail_entregados`',
    mutar: function (s) { return s.replace("{ campo_logico: 'acm_entregados',", "{ campo_logico: 'mail_entregados',"); },
    cae: function (r) { return r.viejos.length > 0 && r.desajustes.length > 0; },
    afirmacion: 'cero nombres `mail_*` / cero desajustes'
  },
  {
    nombre: 'le cambio la letra a una fila de la lista (R → S)',
    /* ⚠ Por regex y no por texto literal: el espaciado de alineación de la lista es del archivo,
     * no de quien escribe la prueba — un patrón que lo copia deja de matchear al primer reordenado
     * y el caso pasa a correr sobre el código intacto. Es la misma familia que el CRLF del 24/08. */
    mutar: function (s) { return s.replace(/(campo_logico: 'acm_ctor',\s*columna: ')R'/, "$1S'"); },
    cae: function (r) { return r.desajustes.length > 0; },
    afirmacion: 'cero desajustes entre las dos listas'
  },
  {
    nombre: 'saco una fila de `MAPEO_ACUM_MAIL_` sin sacarla del seed',
    mutar: function (s) { return s.replace(/\n  \{ campo_logico: 'acm_clics',[^\n]*\n/, '\n'); },
    cae: function (r) { return r.soloEnSeed.length > 0; },
    afirmacion: 'ninguna fila de seed falta en `MAPEO_ACUM_MAIL_`'
  },
  {
    nombre: 'siembro un segundo `campo_logico` sobre la columna AI',
    mutar: function (s) {
      return s.replace("var SEED_MAPEO_ACUMULADO_ = [",
        "var SEED_MAPEO_ACUMULADO_ = [\n  { base_id: 'acumulado', campo_logico: 'mail_remitente_etq', hoja: 'Mail', columna: 'AI', encabezado: 'Remitente', notas: 'sintético' },");
    },
    cae: function (r) { return r.dobles.length > 0; },
    afirmacion: 'ninguna letra lleva dos `campo_logico`'
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
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · sobre ' + R.seed.length +
  ' fila(s) de seed y ' + R.lista.length + ' de `MAPEO_ACUM_MAIL_`');
console.log('  ⚠ No cubre: qué dice `MAPEO` hoy — eso es la relectura de');
console.log('     `aplicarRenombreAcumMail` y `verificarEncabezadosDeMapeo()` contra la hoja viva.');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
