#!/usr/bin/env node
/**
 * tools/probar-inventario-tokens.js — **`volcarInventarioDeTokens()` CORRE de punta a punta**
 * (`2026-08-31_4` Parte A).
 *
 * ⛔⛔ **El bug que fija, y costó una corrida del usuario.** La función usaba `informeId` dentro de
 * un `forEach(function (id) {…})` — el parámetro se llamaba `id`— y tiró
 * `ReferenceError: informeId is not defined` **a mitad del reporte**, después de haber leído las
 * dos plantillas y escrito la hoja. **`node --check` pasó**: la sintaxis era válida y el error es
 * de *scope*, que sólo aparece al ejecutar esa rama.
 *
 * ⚠ **Y había un segundo, peor, que el primero tapaba:** el `forEach` interno recorre láminas con
 * la variable `id`, así que **con el mismo nombre en los dos niveles el interno sombrea al
 * externo** — eso no tira ReferenceError: **habría cruzado cada lámina contra las láminas
 * declaradas para un `informe_id` que en realidad era un `lamina_id`**, y el reporte habría salido
 * lleno de falsos «sin fila en LAMINAS» sin fallar. **Un número plausible, otra vez.**
 *
 * ⭐ **Lo que este banco afirma es lo mínimo y es lo que faltaba: que la función VUELVA**, y que
 * vuelva con la forma esperada. No mide si el inventario es correcto —eso pide las plantillas
 * vivas—: mide que ninguna rama del reporte tire.
 *
 * ⚠ **Por eso los stubs devuelven datos que RECORREN todas las ramas**: una lámina anclada a otro
 * informe, una anclada sin fila, una declarada sin slide y una sin ancla. Con stubs vacíos el
 * banco pasaría sin ejecutar nada del cruce, que es el error de *«el control no llegó a mirar»*.
 *
 * Uso:
 *   node tools/probar-inventario-tokens.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
const log = [];
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

/** Una slide de mentira: sus notas dan el ancla y su texto los tokens. */
function slide(ancla, tokens, escondida) {
  return { __ancla: ancla, __tokens: tokens || [], __escondida: !!escondida };
}

/* ⭐ El fixture recorre las CUATRO ramas del cruce a propósito:
 *   `secco` tiene L-016 (propia), L-053 (declarada para `jm` — el caso del duplicado),
 *   L-099 (anclada sin ninguna fila), una slide SIN ancla y sin tokens, y `LAMINAS` declara
 *   L-017 que ninguna slide trae. */
/* ⭐ `2026-08-31` — **una lámina ESCONDIDA en el fixture, y no es decorativa.** Sin ella el bloque
 * que parte los «sólo secco» por visibilidad **no se ejecuta**, y el banco pasaría sin medirlo: es
 * el control que no llega a mirar. `secco` trae un token que vive **sólo** en una escondida
 * (`token_oculto`) y otro que vive en una visible (`token_sin_fila`). */
const PLANTILLAS = {
  jm: [slide('L-040', ['camp_titulo', 'camp_clics']), slide('L-053', ['u1_total_clics'])],
  secco: [
    slide('L-016', ['camp_titulo']),
    slide('L-053', ['u1_total_clics']),
    slide('L-099', ['token_sin_fila']),
    slide('L-098', ['token_oculto'], true),
    slide(null, [])
  ]
};

const LAMINAS = [
  { lamina_id: 'L-040', informe_id: 'jm', seccion_id: 'campana', orden_plantilla: 11, itera_sobre: '' },
  { lamina_id: 'L-053', informe_id: 'jm', seccion_id: 'encuentro', orden_plantilla: 8, itera_sobre: '' },
  { lamina_id: 'L-016', informe_id: 'secco', seccion_id: 'campana', orden_plantilla: 16, itera_sobre: '' },
  { lamina_id: 'L-017', informe_id: 'secco', seccion_id: 'campana', orden_plantilla: 17, itera_sobre: '' }
];

const MARCADORES = [
  { marcador: 'camp_titulo', informe_id: 'jm' },
  { marcador: 'camp_clics', informe_id: 'jm' },
  { marcador: 'u1_total_clics', informe_id: 'jm' }
];

function contexto() {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: (m) => log.push(String(m)) }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8'), ctx,
    { filename: 'Auditoria.gs' });

  // Los stubs van DESPUÉS de cargar, para pisar lo que el archivo define.
  ctx.RE_TOKEN_ = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  ctx.Utilities = { formatDate: () => '2026-08-31' };
  ctx.Session = { getScriptTimeZone: () => 'America/Argentina/Buenos_Aires' };
  ctx.leerMarcadores_ = () => MARCADORES;
  ctx.leerSeccionesPlano_ = () => ({
    campana: { itera_sobre: 'CAMPANAS', modo: 'repetible' },
    encuentro: { itera_sobre: 'REUNIONES', modo: 'repetible' }
  });
  ctx.leerLaminas_ = () => ({ ok: true, filas: LAMINAS });
  ctx.leerInformes = () => ({ jm: { plantilla_id: 'P_JM' }, secco: { plantilla_id: 'P_SECCO' } });
  ctx.tokensDePlantilla_ = () => ['camp_titulo', 'u1_total_clics', 'token_sin_fila'];
  ctx.anclaDeLamina_ = (s) => s.__ancla;
  ctx.esLaminaEscondida_ = (s) => !!s.__escondida;
  ctx.piezasDeTextoDeSlide_ = (s) => s.__tokens.map((t) => ({ texto: '{{' + t + '}}' }));
  ctx.SlidesApp = {
    openById: (pid) => ({ getSlides: () => PLANTILLAS[pid === 'P_JM' ? 'jm' : 'secco'] })
  };
  const escritas = [];
  ctx.__escritas = escritas;
  const hojaFalsa = {
    getRange: () => ({ setValues: (v) => escritas.push(v) }),
    setFrozenRows: () => {}
  };
  ctx.SpreadsheetApp = {
    getActiveSpreadsheet: () => ({
      getSheetByName: () => null,
      deleteSheet: () => {},
      insertSheet: () => hojaFalsa
    })
  };
  return ctx;
}

console.log('\n═══ A · la función VUELVE, que es lo que ninguna afirmación cubría ═══');
let r;
{
  const ctx = contexto();
  try {
    r = vm.runInContext('volcarInventarioDeTokens()', ctx);
    afirmar(true, '⭐ corre de punta a punta sin tirar — habría cazado el `ReferenceError`');
  } catch (e) {
    afirmar(false, '⛔ TIRÓ: ' + e.message);
    r = null;
  }
  afirmar(!!r && r.ok === true, 'devuelve `ok: true`');
  afirmar(!!r && r.filas === 7, 'una fila por (token, lámina): 7 (' + (r && r.filas) + ')');
}

console.log('\n═══ B · el cruce ancla ↔ LAMINAS distingue los TRES estados ═══');
{
  const texto = log.join('\n');
  afirmar(/L-053.*declarada para `jm`/.test(texto),
    '⭐ `L-053` en `secco` sale como ANCLADA A LÁMINA DE OTRO INFORME — el caso del duplicado');
  afirmar(/L-099.*sin fila en LAMINAS/.test(texto),
    '`L-099` sale como anclada y SIN NINGUNA FILA — es otro estado y otro arreglo');
  afirmar(/DECLARADA EN LAMINAS Y SIN SLIDE.*L-017/.test(texto),
    '`L-017` sale como declarada sin slide — el estado inverso');
  afirmar(/SIN ANCLA: slide 5 \(0 token\(s\)\)/.test(texto),
    '⭐⭐ la slide SIN TOKENS y sin ancla SE MIDE — es el límite que el corte viejo salteaba');
}

console.log('\n═══ C · el cruce de tokens y el testigo de la columna cruda ═══');
{
  const texto = log.join('\n');
  afirmar(/compartidos : 2/.test(texto), 'compartidos = 2 (`camp_titulo`, `u1_total_clics`)');
  afirmar(/sólo `jm`   : 1/.test(texto), 'sólo jm = 1 (`camp_clics`)');
  afirmar(/sólo `secco`: 2/.test(texto), 'sólo secco = 2 (`token_sin_fila` + `token_oculto`)');
  afirmar(/con valor: 0 ✅ vacía, como se esperaba/.test(texto),
    '⭐ el testigo de `LAMINAS.itera_sobre` reporta el vacío en vez de callarlo');
}

console.log('\n═══ C bis · ⭐ los «sólo secco» se parten por VISIBILIDAD ═══');
{
  /* ⛔ **La afirmación que cambia el tamaño del trabajo.** Sumar los «sólo secco» sobreestima: un
   * token que vive únicamente en láminas escondidas **no es deuda de cableado**, es una lámina que
   * no se usa. Las dos cosas se veían igual y mandan a trabajos opuestos. */
  const texto = log.join('\n');
  afirmar(/sólo `secco`: 2   → ⭐ 1 en visibles · 1 sólo en escondidas/.test(texto),
    '⭐⭐ 2 «sólo secco» → 1 visible + 1 oculto, y NO se suman como si fueran lo mismo');
  afirmar(/EL TRABAJO REAL de `secco` son los 1 visibles, no los 2/.test(texto),
    'el reporte nombra el trabajo real, no el total');
  afirmar(/token_sin_fila/.test(texto) && !/^\s+token_oculto/m.test(texto),
    '`token_sin_fila` está en la lista de trabajo y `token_oculto` no');
  afirmar(/secco: 1 → L-098/.test(texto),
    '⭐ las láminas escondidas se listan por informe, leídas de la SLIDE y no de LAMINAS');
  afirmar(/jm: 0/.test(texto),
    'y el cero de `jm` se dice — «ninguna escondida» y «no se midió» se ven igual sin conteo');
}

console.log('\n═══ C ter · el contraste con la medición externa se declara ═══');
{
  const texto = log.join('\n');
  afirmar(/contraste con la medición del usuario/.test(texto),
    'el reporte contrasta contra la medición del `.pptx`, en vez de publicar sin testigo');
  afirmar(/⛔ NO COINCIDE — ESO es el hallazgo/.test(texto),
    '⭐ y con el fixture (2/1/1 contra 55/13/42) marca el desajuste — el contraste PUEDE fallar');
}

console.log('\n═══ D · control NEGATIVO — con el nombre sombreado, el cruce miente ═══');
{
  /* ⭐ **Romper a propósito reponiendo el bug**, y con la mutación verificada: si el patrón no
   * matchea, el caso corre sobre el código bueno y daría verde. Acá se renombra el parámetro
   * externo a `id`, que es exactamente lo que estaba mal — y el efecto NO es una excepción: es un
   * cruce que sale mal **sin fallar**. */
  const fuente = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');
  const PATRON = "  ['jm', 'secco'].forEach(function (informeId) {";
  const mutada = fuente.replace(PATRON, "  ['jm', 'secco'].forEach(function (id) {")
    .replace('var r = resumen[informeId];', 'var r = resumen[id];')
    .replace('var declaradas = declaradasPorInforme[informeId] || {};',
             'var declaradas = declaradasPorInforme[id] || {};');
  afirmar(mutada !== fuente, '⭐ la MUTACIÓN OCURRIÓ — sin esto el negativo corre sobre el código bueno');

  const ctx = contexto();
  vm.runInContext(mutada, ctx, { filename: 'Auditoria-mutada.gs' });
  const antes = log.length;
  let salida = null;
  try { salida = vm.runInContext('volcarInventarioDeTokens()', ctx); } catch (e) { /* puede tirar */ }
  const texto = log.slice(antes).join('\n');
  afirmar(!salida || !/L-053.*declarada para `jm`/.test(texto),
    '⭐⭐ con el nombre sombreado el cruce DEJA de identificar `L-053` — el bug no era cosmético');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
