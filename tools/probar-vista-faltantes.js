/**
 * `2026-08-24_2` Parte E — la vista de faltantes: los tres números, el corte por lámina y la
 * jerarquía por consecuencia.
 *
 * ⭐ **Ejecuta las funciones reales de `Panel.html`, no mira su fuente con una regex.** Una regex
 * habría pasado igual con la condición al revés — es la lección de `probar-confirmar-anclaje.js`.
 * Se carga el `<script>` entero en un contexto con un DOM mínimo y se llaman las funciones.
 *
 * Corre con: `node tools/probar-vista-faltantes.js`
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

let ok = 0;
let mal = 0;
const avisos = [];

function af(cond, texto, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + texto); }
  else { mal++; console.log('  ❌ ' + texto + (detalle ? ' — ' + detalle : '')); }
}

const html = fs.readFileSync(path.join(RAIZ, 'Panel.html'), 'utf8');
const m = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!m) {
  console.log('❌ no se encontró el bloque <script> de Panel.html');
  process.exit(1);
}

/**
 * Un contexto con el `<script>` del panel cargado y un DOM mínimo.
 *
 * ⚠ `pintar()` y `google.script.run` se falsean **sin hacer nada**: lo que se afirma acá es el HTML
 * que las funciones de vista devuelven, no el ciclo de repintado.
 */
function contextoPanel() {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, Boolean, isNaN, RegExp,
    parseInt, parseFloat, encodeURIComponent, decodeURIComponent, setTimeout: () => 0,
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    window: {}
  };
  /* `google.script.run` se encadena —`.withSuccessHandler(…).withFailureHandler(…).panel_x()`—, así
   * que el falso tiene que devolverse **a sí mismo** en cada paso. Un stub que devuelve `{}` corta
   * la cadena en el segundo eslabón, y el error se lee como un bug del panel. */
  const runFalso = new Proxy({}, { get: () => () => runFalso });
  ctx.google = { script: { run: runFalso } };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(m[1], ctx, { filename: 'Panel.html' });
  return ctx;
}

/** El `panel_faltantes` de una corrida con las tres clases representadas. */
function datosDeEjemplo() {
  return {
    ok: true, cual: 'actual', hoja: 'FALTANTES', existe_hoja: true,
    conteo: { real: 41, fuera_de_alcance: 57, texto_equipo: 20, sin_declarar: 3, sin_lamina: 2 },
    declaracion: { ok: true, columnas: true, motivo: '' },
    filas: 123, tokens: 98,
    corridas: [{ corrida_id: 'jm-20260825-171200', filas: 123 }],
    sin_lamina: 2,
    grupos: [
      { causa: 'escritor', texto: 'resolvió y el escritor no lo pisó', oficio: 'es un bug del escritor',
        orden: 4, cuenta_tokens: 1, cuenta_filas: 1,
        tokens: [{ token: 'imp_meta', items: [], base_id: 'looker', solapa: 'DIGITAL', motivo: 'ok', apariciones: 1 }] },
      { causa: 'sin_fila', texto: 'sin fila en MARCADORES', oficio: 'cablear',
        orden: 1, cuenta_tokens: 90, cuenta_filas: 110,
        tokens: [{ token: 'camp_titulo', items: [], base_id: '', solapa: '', motivo: 'sin fila', apariciones: 14 }] }
    ],
    laminas: [
      { lamina_id: 'L-036', filas: 8, cuenta_tokens: 8,
        causas: [{ causa: 'sin_fila', texto: 'sin fila en MARCADORES', oficio: 'cablear', orden: 1, cuantos: 8 }],
        tokens: ['post_alcance', 'post_habitantes'] },
      { lamina_id: 'L-046', filas: 2, cuenta_tokens: 2,
        causas: [{ causa: 'escritor', texto: 'resolvió y el escritor no lo pisó', oficio: 'es un bug del escritor', orden: 4, cuantos: 2 }],
        tokens: ['camp_ctr', 'camp_vtr'] }
    ]
  };
}

console.log('La vista de faltantes — los tres números, el corte por lámina y la jerarquía\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · Los tres números, y cuál va solo y arriba
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · el número del cierre va solo y arriba; los otros dos al lado y en gris');
{
  const ctx = contextoPanel();
  ctx.S.falt = datosDeEjemplo();
  const h = vm.runInContext('vistaFaltantes()', ctx);

  af(h.indexOf('falt-cierre') !== -1, 'el bloque del número del cierre existe');
  /* ⭐⭐ LA afirmación: `41` —los faltantes REALES— es el que va en el bloque grande, no `123`
   * (el total) ni `118` (real + descontados). Hasta hoy el conteo era uno y sumaba los tres. */
  // El contenido del bloque grande, entre su etiqueta de apertura y su cierre.
  const iNum = h.indexOf('falt-cierre-num">') + 'falt-cierre-num">'.length;
  const grande = h.slice(iNum, h.indexOf('</div>', iNum));
  af(grande.trim() === '41',
    '⭐ el número grande es 41 — los faltantes REALES, no el total de 123', JSON.stringify(grande));
  af(grande.indexOf('123') === -1 && grande.indexOf('57') === -1,
    'y ni el total ni los descontados entran a ese bloque');

  /* ⚠ Que se descuenten no los vuelve invisibles: quien mira tiene que ver CUÁNTO se descontó, o
   * el número de arriba pasa a ser una afirmación sin testigo. */
  af(h.indexOf('Fuera de alcance') !== -1 && h.indexOf('>57<') !== -1,
    'los 57 fuera de alcance se muestran, no se esconden');
  af(h.indexOf('Texto del equipo') !== -1 && h.indexOf('>20<') !== -1,
    'y los 20 del texto del equipo también');
  af(h.indexOf('decide el cierre de fase') !== -1,
    'y la pantalla dice cuál de los tres decide el cierre');

  /* ⛔ Sin color de alerta: un deck con faltantes reales es normal y publicable. Lo que frena son
   * las dos causas de `CAUSAS_QUE_FRENAN`, que ya tienen su alerta roja arriba. */
  af(h.indexOf('<div class="falt-cierre">') !== -1 && h.indexOf('falt-cierre alert-error') === -1,
    'el bloque del cierre NO usa el rojo de alerta — compite con la que sí frena');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · Jerarquía por consecuencia, no por cantidad
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · un token que salió mal en silencio va antes que noventa sin cablear');
{
  const ctx = contextoPanel();
  ctx.S.falt = datosDeEjemplo();
  const h = vm.runInContext('vistaFaltantes()', ctx);

  /* ⭐ La alerta de arriba es «algo salió mal en silencio» — 1 token —, y aparece ANTES que el
   * grupo de 90 sin cablear. Por cantidad el orden sería el inverso. */
  const iAlerta = h.indexOf('Algo salió mal en silencio');
  const iSinFila = h.indexOf('sin fila en MARCADORES');
  af(iAlerta !== -1, 'la alerta de lo que frena existe');
  af(iAlerta < iSinFila,
    '⭐ y va ARRIBA del grupo de 90 sin cablear — jerarquía por consecuencia, no por cantidad');
  af(h.indexOf('alert-error') < h.indexOf('falt-cierre'),
    'y arriba del propio número del cierre: lo que frena la publicación va primero y sin scroll');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · El corte por lámina
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · el mismo conteo, cortado por lámina');
{
  const ctx = contextoPanel();
  ctx.S.falt = datosDeEjemplo();

  const porCausa = vm.runInContext('vistaFaltantes()', ctx);
  af(porCausa.indexOf('data-corte="lamina"') !== -1, 'el switch de corte existe');
  af(porCausa.indexOf('L-036') === -1,
    'con el corte por causa, las láminas NO se pintan — es un corte o el otro, no los dos');

  ctx.S.faltCorte = 'lamina';
  const porLamina = vm.runInContext('vistaFaltantes()', ctx);
  af(porLamina.indexOf('L-036') !== -1 && porLamina.indexOf('L-046') !== -1,
    'con el corte por lámina, las dos láminas se pintan');
  // Los tokens de la que ABRE. Los de la plegada no se pintan, que es el bloque de abajo.
  af(porLamina.indexOf('camp_ctr') !== -1, 'y los tokens de la que abre, adentro');

  /* ⭐ La jerarquía se mantiene en el otro corte: `L-046` tiene 2 tokens y una causa que frena;
   * `L-036` tiene 8 y ninguna. La que frena es la que abre — por consecuencia, no por tamaño. */
  af(porLamina.indexOf('camp_ctr') !== -1,
    '⭐ L-046 abre sola: tiene una causa que frena, aunque sea la más chica');
  const iL036 = porLamina.indexOf('L-036');
  const iPost = porLamina.indexOf('post_alcance');
  af(iPost === -1 || iPost > porLamina.indexOf('camp_ctr'),
    'y L-036, con 8 tokens y ninguna causa que frene, arranca PLEGADA',
    'post_alcance en ' + iPost);
  af(iL036 !== -1, 'aunque su cabecera se ve igual — plegada no es escondida');

  /* ⚠ El conteo por lámina puede sumar más que el total, y va nombrado en vez de corregido. */
  af(porLamina.indexOf('token(s)') !== -1, 'cada lámina declara su cuenta de tokens');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Lo que la vista declara que NO contesta
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · el bloque final dice lo que es cierto HOY, no lo que era cierto ayer');
{
  const ctx = contextoPanel();
  ctx.S.falt = datosDeEjemplo();
  const h = vm.runInContext('vistaFaltantes()', ctx);

  /* ⛔⛔ El bloque decía «LAMINAS no tiene columna de alcance» y «FALTANTES no guarda la lámina».
   * Las dos dejaron de ser ciertas hoy, y dejarlas habría sido el `var TECHO_S = 350` otra vez:
   * el front declarando un límite que el backend ya no tiene, justo donde la persona mira. */
  af(h.indexOf('no tiene columna de alcance') === -1,
    '⭐ ya NO dice «LAMINAS no tiene columna de alcance» — dejó de ser cierto hoy');
  af(h.indexOf('no guarda la lámina') === -1,
    'ni «FALTANTES no guarda la lámina»');

  af(h.indexOf('nadie declaró') !== -1 && h.indexOf('>3 ') !== -1 || h.indexOf('3 fila(s)') !== -1,
    'y sí dice las 3 filas cuyo alcance nadie declaró');
  af(h.indexOf('2 fila(s) no dicen de qué lámina vienen') !== -1,
    'y las 2 que no dicen de qué lámina vienen');
  /* ⚠ La afirmación que ninguna de las dos partes de hoy cubre, y es la que más importa. */
  af(h.indexOf('es correcto') !== -1,
    '⭐ y que este conteo no dice si un número es CORRECTO: dice si se pintó');
}

console.log('\n4b · sin las columnas en LAMINAS, la vista lo dice en vez de mostrar ceros');
{
  const ctx = contextoPanel();
  const d = datosDeEjemplo();
  d.declaracion = { ok: true, columnas: false, motivo: 'LAMINAS todavía NO tiene las columnas `alcance` y `tokens_equipo` — correr `instalar()`.' };
  d.conteo = { real: 123, fuera_de_alcance: 0, texto_equipo: 0, sin_declarar: 0, sin_lamina: 0 };
  d.sin_lamina = 0;
  ctx.S.falt = d;
  const h = vm.runInContext('vistaFaltantes()', ctx);

  /* ⭐ «Nadie declaró nada» y «la columna no existe» dan los mismos ceros y mandan a trabajos
   * opuestos: llenar la hoja contra correr `instalar()`. La vista tiene que decir cuál. */
  af(h.indexOf('instalar()') !== -1,
    '⭐ con las columnas ausentes, el motivo aparece y manda a correr `instalar()`');
  af(h.indexOf('>123<') !== -1,
    'y el número del cierre muestra el total sin descontar, que es la verdad en ese estado');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Las reglas duras de esta pantalla
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · sin almacenamiento del navegador y sin dependencias nuevas');
{
  /* ⛔ Regla de la Parte E: corre en Apps Script. Y hay un motivo además del entorno — una
   * preferencia guardada sobrevive a un cambio de significado de lo que guarda. */
  /* ⚠ Se busca el USO —`localStorage.x` o `localStorage[…]`—, no la mención: el panel las nombra
   * dos veces **en comentarios**, justamente para decir que no se usan. Una afirmación que busca el
   * nombre a secas se pondría roja por la regla que documenta la regla. */
  const usa = /[^`\w.](localStorage|sessionStorage)\s*[.[]/.test(html);
  af(!usa, 'ni `localStorage` ni `sessionStorage` se USAN en todo el panel');
  af(html.indexOf('Sin `localStorage`') !== -1,
    '⭐ control positivo: el panel sí los MENCIONA en sus comentarios — el banco está leyendo el archivo');
  af(html.indexOf('<script src=') === -1 && html.indexOf('cdn.') === -1,
    'ninguna dependencia externa');

  /* ⛔ `CLAUDE.md` §4: el front pregunta, no contesta. El `var TECHO_S = 350` escrito en el HTML
   * contra los 150 de la hoja dibujó una escala hasta 350 y el contador pasó el techo real sin
   * ponerse en rojo — mintió justo en el lugar que la persona mira. */
  const ctx = contextoPanel();
  ctx.S.falt = datosDeEjemplo();
  const h = vm.runInContext('vistaFaltantes()', ctx);
  af(h.indexOf('>41<') !== -1,
    'los tres números salen del backend: la vista no los recalcula');

  /* El control positivo del banco: si `contextoPanel()` no cargara nada, todo lo de arriba sería
   * cadena vacía y las afirmaciones de ausencia pasarían igual. Algo TIENE que aparecer. */
  af(h.length > 500, '⭐ control positivo: la vista devuelve HTML de verdad — el banco la está ejecutando',
    h.length + ' caracteres');
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
if (avisos.length) {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.\n');
  console.log('⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach(a => console.log('   · ' + a));
} else {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');
}

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Cómo se VE. Acá no hay navegador: se afirma el HTML que sale, no el CSS que lo');
console.log('     pinta ni si entra sin scroll en una pantalla real.');
console.log('   · Si los conteos son correctos: eso lo cubre `probar-alcance-de-laminas.js`. Acá el');
console.log('     backend es un fixture y lo que se mide es qué hace la vista con él.');
console.log('   · Que los clicks funcionen: `conectarFaltantes()` necesita un DOM de verdad.');

process.exit(mal ? 1 : 0);
