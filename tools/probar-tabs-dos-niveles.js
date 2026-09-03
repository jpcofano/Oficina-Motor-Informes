#!/usr/bin/env node
/**
 * tools/probar-tabs-dos-niveles.js — **la navegación de dos niveles del panel**
 * (`docs/Prompts/2026-09-01_3_panel_navegacion.md`, Parte B.2).
 *
 * ⭐ **Por qué existe.** `TABS_`, `tabDe_`, `nivelDe_` y `detallesVisible_` son código que
 * **ninguna afirmación tocaba**. `CLAUDE.md` §4: *una rama nueva que nunca se ejecutó no está sin
 * probar, está sin escribir el control*, y las dos se ven igual en un tablero verde.
 *
 * **Lo que fija, en orden de qué tan caro sale que se rompa:**
 *
 *  1. ⛔⛔ **El nivel se DERIVA de `S.tab`.** `S.tab = 'generar'` tiene que abrir «Detalles» **sin
 *     tocar `detallesAbierto`**. Es la mitad del diseño: los tres saltos automáticos escriben
 *     `S.tab` y nada más, y si esto se rompe la pestaña activa queda dentro de un grupo cerrado
 *     — un estado que compila y no se ve hasta que alguien genera.
 *  2. ⛔⛔ **`TABS_` y el router de `pintar()` dicen lo mismo, en los dos sentidos.** Son dos
 *     listas que tienen que coincidir y **nada las ata**: un id en `TABS_` sin rama cae en el
 *     fallback y pinta el asistente **en silencio**, y una rama sin id es una vista inalcanzable.
 *     Mismo argumento que `tools/listas.js` con las tres listas de hojas.
 *  3. ⛔ **El grupo «Detalles» NO lleva `data-tab`.** Si lo llevara haría `S.tab = null` y caería
 *     en el fallback del router; por eso el bind es `.tab[data-tab]` y no `.tab`.
 *  4. **Ninguna de las siete pestañas se perdió** al partir la barra en dos.
 *  5. **El panel arranca en `'asistente'`**, no en `'generar'` — que ahora vive un nivel abajo.
 *
 * ⚠ **Lo que NO prueba:** que el CSS apile bien las dos filas, ni que el click funcione en el
 * navegador. Eso se ve abriendo el panel. Acá se fija la **decisión**, que es la mitad pura.
 *
 * Uso:
 *   node tools/probar-tabs-dos-niveles.js
 *   node tools/probar-tabs-dos-niveles.js --autoprueba
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const AUTO = process.argv.indexOf('--autoprueba') !== -1;

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

const FUENTE = fs.readFileSync(path.join(RAIZ, 'Panel.html'), 'utf8');

/* Las piezas REALES, extraídas y no reescritas (`CLAUDE.md` §4). */
const TROZOS = [
  /function esc\(v\)\{[\s\S]*?\r?\n\}/,
  /var TABS_ = \[[\s\S]*?\r?\n\];/,
  /function tabDe_\(id\)\{[\s\S]*?\r?\n\}/,
  /function nivelDe_\(id\)\{[^\r\n]*\}/,
  /function detallesVisible_\(\)\{[^\r\n]*\}/,
  /function pintarTabs\(\)\{[\s\S]*?\r?\n\}/
];

/** Un DOM mínimo: alcanza para capturar el HTML que `pintarTabs` escribe. */
function contexto(fuente) {
  const capturado = { html: '' };
  const ctx = { console, String, Number, Object, Array };
  ctx.el = function (id) {
    if (id !== 'tabs') return null;
    return { set innerHTML(v) { capturado.html = v; }, get innerHTML() { return capturado.html; } };
  };
  ctx.document = { querySelectorAll: function () { return []; } };
  vm.createContext(ctx);
  TROZOS.forEach(function (re, i) {
    const m = fuente.match(re);
    if (!m) throw new Error('no se pudo extraer el trozo ' + i + ' de Panel.html');
    vm.runInContext(m[0], ctx, { filename: 'Panel.html' });
  });
  return { ctx: ctx, capturado: capturado };
}

/** El texto de `pintar()`, para cruzar el router contra `TABS_`. */
function fuentePintar(fuente) {
  const m = fuente.match(/function pintar\(\)\{[\s\S]*?\r?\n\}/);
  if (!m) throw new Error('no se pudo extraer pintar() de Panel.html');
  return m[0];
}

function correr(fuente) {
  const { ctx, capturado } = contexto(fuente);
  const ids = ctx.TABS_.map(function (t) { return t.id; });

  console.log('\n═══ A · las siete pestañas siguen estando ═══');
  afirmar(ids.length === 7, '⭐ `TABS_` tiene 7 entradas — tiene ' + ids.length);
  ['asistente', 'generar', 'desatendida', 'anclajes', 'faltantes', 'corridas', 'proximo']
    .forEach(function (id) {
      afirmar(ids.indexOf(id) !== -1, '   está `' + id + '`');
    });
  afirmar(ctx.tabDe_('no_existe') === null,
    '⭐ y un id desconocido devuelve null — es lo que deja a `pintar()` distinguirlo');

  console.log('\n═══ B · TABS_ y el router de pintar() dicen lo mismo ═══');
  const texto = fuentePintar(fuente);
  const enRouter = [];
  const re = /S\.tab === '([a-z]+)'/g;
  let m;
  while ((m = re.exec(texto)) !== null) if (enRouter.indexOf(m[1]) === -1) enRouter.push(m[1]);
  const sinRama = ids.filter(function (i) { return enRouter.indexOf(i) === -1; });
  const sinFila = enRouter.filter(function (i) { return ids.indexOf(i) === -1; });
  afirmar(enRouter.length > 0,
    '⭐ control positivo: el router menciona ' + enRouter.length + ' pestañas (0 sería «no miré»)');
  afirmar(sinRama.length === 0,
    '⛔ ningún id de `TABS_` se quedó sin rama — sin rama cae en el fallback y pinta el asistente ' +
    'en silencio. Sobran: [' + sinRama.join(', ') + ']');
  afirmar(sinFila.length === 0,
    '⛔ ninguna rama del router quedó sin fila en `TABS_` — sería una vista inalcanzable. ' +
    'Sobran: [' + sinFila.join(', ') + ']');

  console.log('\n═══ C · el nivel se DERIVA, no se guarda ═══');
  ctx.S = { tab: 'generar', detallesAbierto: false };
  afirmar(ctx.nivelDe_('generar') === 'detalles' && ctx.nivelDe_('asistente') === 'principal',
    '`nivelDe_` clasifica: generar→detalles, asistente→principal');
  afirmar(ctx.detallesVisible_() === true,
    '⛔⛔ con `S.tab = \'generar\'` y `detallesAbierto: false`, «Detalles» está ABIERTO — es el ' +
    'salto automático de `generarDesdeAsistente`, que sólo escribe `S.tab`');

  ctx.S = { tab: 'desatendida', detallesAbierto: false };
  afirmar(ctx.detallesVisible_() === false,
    'y con una pestaña de nivel 1 queda cerrado: el salto a `desatendida` no lo abre de más');

  ctx.S = { tab: 'asistente', detallesAbierto: true };
  afirmar(ctx.detallesVisible_() === true,
    '⭐ y `detallesAbierto` cubre su único caso: abrirlo para mirar desde el nivel 1');

  console.log('\n═══ D · el grupo «Detalles» no entra al bind de pestañas ═══');
  ctx.S = { tab: 'asistente', detallesAbierto: false };
  ctx.pintarTabs();
  const cerrado = capturado.html;
  afirmar(cerrado.indexOf('id="tab-detalles"') !== -1, 'con el grupo cerrado hay botón de grupo');
  const grupoTag = cerrado.match(/<button[^>]*id="tab-detalles"[^>]*>/)[0];
  afirmar(grupoTag.indexOf('data-tab') === -1,
    '⛔ y NO lleva `data-tab` — si lo llevara haría `S.tab = null` y caería en el fallback');
  afirmar((cerrado.match(/<div class="tabs">/g) || []).length === 1,
    'y con el grupo cerrado se pinta UNA sola fila');
  afirmar(cerrado.indexOf('data-tab="generar"') === -1,
    'y «Generar» no está a la vista: vive en el segundo nivel');

  ctx.S = { tab: 'asistente', detallesAbierto: true };
  ctx.pintarTabs();
  const abierto = capturado.html;
  afirmar((abierto.match(/<div class="tabs">/g) || []).length === 2,
    '⭐ abierto se pintan DOS filas');
  ['generar', 'anclajes', 'faltantes', 'proximo'].forEach(function (id) {
    afirmar(abierto.indexOf('data-tab="' + id + '"') !== -1, '   y aparece `' + id + '`');
  });

  console.log('\n═══ E · dentro de «Detalles» el grupo es una miga, no un botón muerto ═══');
  ctx.S = { tab: 'generar', detallesAbierto: false };
  ctx.pintarTabs();
  const dentro = capturado.html;
  afirmar(dentro.indexOf('id="tab-detalles"') === -1,
    '⚠ no hay botón de grupo: no podría cerrar el grupo donde estás parado');
  afirmar(dentro.indexOf('Detalles · Generar') !== -1,
    'dice dónde estás: «Detalles · Generar»');
  afirmar((dentro.match(/<div class="tabs">/g) || []).length === 2,
    'y la fila de abajo sigue ahí, que es la salida');

  console.log('\n═══ F · el arranque ═══');
  const inicial = fuente.match(/\r?\n  tab: '([a-z]+)',/);
  afirmar(!!inicial && inicial[1] === 'asistente',
    "⭐ `S.tab` nace en 'asistente' — dio '" + (inicial ? inicial[1] : '(no se encontró)') +
    "'. En 'generar' el panel abriría dentro de un grupo colapsado");
  afirmar(/if \(!tabDe_\(S\.tab\)\) S\.tab = 'asistente';[\s\S]{0,200}pintarTabs\(\);/.test(texto),
    '⛔ y la normalización corre ANTES de `pintarTabs()`: lo pintado y lo resaltado no discrepan');
}

correr(FUENTE);

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * G · romper a propósito
 *
 * ⭐⭐ **La mutación tiene que OCURRIR** (`CLAUDE.md` §4, 24/08): un parche que no matchea deja
 * el control corriendo sobre el código intacto y eso se lee como «el negativo pasó». Patrón por
 * fragmento de UNA línea — el fin de línea es del archivo, no de quien escribe la prueba.
 *
 * ⭐ **Y se exige el MOTIVO:** sin la derivación, `S.tab = 'generar'` deja «Detalles» cerrado.
 * Ése es exactamente el estado que compila y no se ve.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */
if (AUTO) {
  console.log('\n═══ G · autoprueba: sin la derivación, el salto automático deja el grupo cerrado ═══');
  const ORIGINAL = "return nivelDe_(S.tab) === 'detalles' || S.detallesAbierto === true;";
  if (FUENTE.indexOf(ORIGINAL) === -1) {
    fallas++;
    console.log('  ⛔ el patrón de la mutación no está en Panel.html — el negativo no midió nada');
  } else {
    const mutado = FUENTE.replace(ORIGINAL, 'return S.detallesAbierto === true;');
    if (mutado === FUENTE) {
      fallas++;
      console.log('  ⛔ la mutación NO ocurrió — el negativo habría corrido sobre el código intacto');
    } else {
      console.log('  ✅ la mutación ocurrió: el texto cambió');
      const { ctx } = contexto(mutado);
      ctx.S = { tab: 'generar', detallesAbierto: false };
      afirmar(ctx.detallesVisible_() === false,
        '⭐ y cae por el MOTIVO correcto: sin derivar, `S.tab = \'generar\'` deja «Detalles» ' +
        'cerrado con la pestaña activa adentro');
    }
  }
}

console.log('\n' + (fallas === 0 ? '✅ todo pasó.' : '⛔ ' + fallas + ' afirmación(es) fallaron.'));
process.exit(fallas === 0 ? 0 : 1);
