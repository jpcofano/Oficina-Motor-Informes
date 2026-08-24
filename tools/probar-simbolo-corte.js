#!/usr/bin/env node
/**
 * tools/probar-simbolo-corte.js — **la regla de asignación de `»»»`** (24/08/2026).
 *
 * El glifo lo eligió el usuario; lo que este control guarda es **la regla**, que es la parte que
 * puede romperse sin que nadie lo note:
 *
 *   `sin_fila` → `/////`   ·   crudo + corte + **tiene fila** → `»»»`
 *
 * ⛔ **Por qué el borde importa más que el glifo.** Si `»»»` se aplicara a *todo lo crudo después
 * del corte*, **taparía el cableado que falta**: un token sin fila diría *«corré de nuevo»* y
 * correr de nuevo no lo arregla nunca. El deck dejaría de mandar a cablear justo donde hay que
 * cablear — que es la misma familia del `/////` que tapaba el corte, con los papeles al revés.
 *
 * ⚠ **Y el caso conservador es una afirmación, no un descuido:** sin la lista de tokens con fila,
 * la barrida vuelve a `/////` para todos. Marcar `»»»` sobre un conjunto que no se pudo leer
 * afirmaría *«esto está cableado»* sin haberlo verificado.
 *
 * Uso:
 *   node tools/probar-simbolo-corte.js
 *   node tools/probar-simbolo-corte.js --autoprueba
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

let fallas = [];
let ok = 0;
function af(cond, msg) {
  if (cond) { ok++; console.log('  ✅ ' + msg); }
  else { fallas.push(msg); console.log('  ⛔ ' + msg); }
}

/** Un `presentacion` de mentira que anota qué texto recibió cada token. */
function deckFalso(tokensPresentes) {
  const pintado = {};
  return {
    pintado,
    replaceAllText(patron, texto) {
      const token = patron.replace('{{', '').replace('}}', '');
      if (tokensPresentes.indexOf(token) === -1) return 0;
      pintado[token] = texto;
      return 1;
    }
  };
}

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} }
  };
  vm.createContext(ctx);
  let texto = FUENTE;
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    /* ⚠ La guarda del 24/08: un parche que no matchea corre sobre el código intacto y da verde
     * sin haber probado nada. `Generador.gs` está en CRLF — los patrones van por fragmento de
     * UNA línea, nunca por bloques con `\n`. */
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  // `textoFaltante_` es de otro archivo; acá sólo interesa que NO sea el símbolo del corte.
  ctx.textoFaltante_ = (token) => '«FALTA:' + token + '»';
  ctx.tokensVisiblesDe_ = () => ({ tokens: {} });
  return ctx;
}

const TOKENS = ['camp_env1_aud', 'post_vistas1', 'camp_ctor'];
const CON_FILA = { camp_env1_aud: true, camp_ctor: true };   // `post_vistas1` NO tiene fila

console.log('== probar-simbolo-corte — la regla de asignación de `»»»` ==');

console.log('\n1 · el glifo elegido');
{
  const ctx = contexto();
  af(ctx.SIMBOLO_CORTE_ === '»»»', 'SIMBOLO_CORTE_ es `»»»` (elegido por el usuario el 24/08)');
  af(ctx.SIMBOLO_CORTE_ !== '/////', 'y ya no es `/////`, que era el glifo que tapaba dos causas');
}

console.log('\n2 · ⭐ con corte: `»»»` sólo para los que TIENEN fila');
{
  const ctx = contexto();
  const deck = deckFalso(TOKENS);
  const mapa = {}; TOKENS.forEach((t) => { mapa[t] = true; });
  const r = ctx.barrerTokensNoAlcanzados_(deck, mapa, true, true, CON_FILA);

  af(deck.pintado.camp_env1_aud === '»»»', 'un token cableado sale `»»»` — el trabajo es correr de nuevo');
  af(deck.pintado.camp_ctor === '»»»', 'y otro cableado también');
  af(deck.pintado.post_vistas1 === '«FALTA:post_vistas1»',
    '⛔ un token SIN FILA no sale `»»»` aunque haya corte — si no, taparía el cableado que falta');
  af(r.barridos.length === 3, 'los tres se barrieron igual (' + r.barridos.length + ')');
}

console.log('\n3 · sin corte: el símbolo sale del estado, no del corte');
{
  const ctx = contexto();
  const deck = deckFalso(TOKENS);
  const mapa = {}; TOKENS.forEach((t) => { mapa[t] = true; });
  ctx.barrerTokensNoAlcanzados_(deck, mapa, true, false, CON_FILA);
  af(Object.keys(deck.pintado).every((t) => deck.pintado[t] !== '»»»'),
    'ninguno sale `»»»` — sin corte, «no se llegó» no es la causa');
}

console.log('\n4 · ⚠ sin la lista de tokens con fila, el comportamiento es el CONSERVADOR');
{
  const ctx = contexto();
  const deck = deckFalso(TOKENS);
  const mapa = {}; TOKENS.forEach((t) => { mapa[t] = true; });
  ctx.barrerTokensNoAlcanzados_(deck, mapa, true, true, null);
  af(TOKENS.every((t) => deck.pintado[t] === '»»»'),
    'con `null` se marcan todos — es el comportamiento viejo, y está declarado en el código');
  /* ⚠ Esta afirmación documenta una decisión, no un ideal: `tokensConFilaDe_` devuelve `null`
   * sólo si `leerMarcadores_` explotó, y ahí ya hay un problema más grande que el glifo. */
}

console.log('\n5 · `tokensConFilaDe_` — el conjunto sale de MARCADORES y filtra por informe');
{
  const ctx = contexto();
  ctx.leerMarcadores_ = () => ([
    { marcador: 'camp_ctor', informe_id: 'jm' },
    { marcador: 'rrss_area1', informe_id: 'secco' },
    { marcador: 'periodo', informe_id: '*' }
  ]);
  const set = ctx.tokensConFilaDe_('jm');
  af(!!set.camp_ctor, 'entra el del informe');
  af(!!set.periodo, 'y el de `*`, que vale para todos');
  af(!set.rrss_area1, '⛔ no entra el de otro informe — si entrara, `»»»` mentiría en el deck de jm');

  ctx.leerMarcadores_ = () => { throw new Error('la hoja no está'); };
  af(ctx.tokensConFilaDe_('jm') === null,
    '⚠ si no se puede leer devuelve `null`, no un conjunto vacío — vacío diría «ninguno está cableado»');
}

if (process.argv.indexOf('--autoprueba') !== -1) {
  console.log('\n== autoprueba: control negativo CON MOTIVO ==');
  let malas = 0;
  const casos = [
    {
      nombre: 'anulo la guarda de `tieneFila`',
      mutar: (s) => s.replace('var tieneFila = tokensConFila ? !!tokensConFila[token] : true;',
        'var tieneFila = true;'),
      espera: '⛔ un token SIN FILA no sale `»»»` aunque haya corte — si no, taparía el cableado que falta'
    },
    {
      nombre: 'devuelvo un conjunto vacío en vez de `null` al fallar',
      /* ⚠ Regex con `\r?\n`, no una cadena con `\n`: `Generador.gs` está en CRLF y el patrón
       * literal no matchea nada. Lo cazó la guarda de «la mutación no cambió nada» — otra vez. */
      mutar: (s) => s.replace(/return null;(\r?\n\s*\}\r?\n\s*return set;)/, 'return {};$1'),
      espera: '⚠ si no se puede leer devuelve `null`, no un conjunto vacío — vacío diría «ninguno está cableado»'
    }
  ];
  casos.forEach((c) => {
    let cayo = [];
    const guardar = fallas; fallas = []; const guardarOk = ok;
    const log = console.log; console.log = () => {};
    try {
      const ctx = contexto(c.mutar);
      const deck = deckFalso(TOKENS);
      const mapa = {}; TOKENS.forEach((t) => { mapa[t] = true; });
      ctx.barrerTokensNoAlcanzados_(deck, mapa, true, true, CON_FILA);
      af(deck.pintado.post_vistas1 === '«FALTA:post_vistas1»',
        '⛔ un token SIN FILA no sale `»»»` aunque haya corte — si no, taparía el cableado que falta');
      ctx.leerMarcadores_ = () => { throw new Error('la hoja no está'); };
      af(ctx.tokensConFilaDe_('jm') === null,
        '⚠ si no se puede leer devuelve `null`, no un conjunto vacío — vacío diría «ninguno está cableado»');
      cayo = fallas.slice();
    } catch (e) {
      cayo = ['(el parche falló: ' + e.message + ')'];
    } finally {
      console.log = log; fallas = guardar; ok = guardarOk;
    }
    if (cayo.indexOf(c.espera) !== -1) {
      console.log('  ✅ ' + c.nombre + ' → cae la correcta');
    } else {
      malas++;
      console.log('  ⛔ ' + c.nombre + ' → NO cayó la esperada. Cayeron: ' + (cayo.join(' · ') || '(ninguna)'));
    }
  });
  console.log('');
  console.log(malas ? '⛔ la autoprueba encontró ' + malas + ' caso(s) mal medido(s).'
    : '✅ los ' + casos.length + ' casos negativos caen por el motivo correcto.');
  process.exit(malas ? 1 : 0);
}

console.log('');
console.log(fallas.length ? '⛔ ' + fallas.length + ' de ' + (ok + fallas.length) + ' en rojo.'
  : '✅ Las ' + ok + ' afirmaciones pasaron.');
console.log('⚠ Lo que NO dice: cómo se ve `»»»` en Slides. Eso lo mira una persona en un deck.');
process.exit(fallas.length ? 1 : 0);
