#!/usr/bin/env node
/**
 * tools/probar-filtro-alternativas.js — **el lenguaje de filtros gana `||`** (`2026-08-28`).
 *
 * ⛔⛔ **Por qué hizo falta, y es un dato, no una preferencia.** El universo `JM` de
 * `digital/CAMPAÑAS_DESGLOCE_DIGITAL` está **partido en dos columnas**: 3.493 filas traen el
 * nombre de campaña en `nombre_campaña` (col V) y **1.631 lo traen en la columna rotulada
 * `Prioridad`** (col U), que en las filas buenas dice `Alto`/`Bajo`. Medido sobre el fixture del
 * 28/08: JM por V **372**, JM por U **248**, **en las dos a la vez 0**, unión **620** — que es
 * exactamente lo que `looker/DIGITAL` ve. **Ninguna columna sola alcanza**, y con la V sola las
 * seis filas de Coghlan caían en `GCBA`.
 *
 * ⭐ **Retrocompatible por construcción:** una pieza sin `||` produce la condición de siempre con
 * `alternativas` vacío. Los filtros vivos no cambian de comportamiento, y el caso A lo afirma.
 *
 * ⭐ **La precedencia es la de cualquier lenguaje:** el `&&` se parte PRIMERO, así que `||` liga
 * más fuerte. `A || B && C` es `(A || B) && C`.
 *
 * ⚠ **La negación de un `||` NO lleva `||`:** *«ni en una ni en la otra»* es `!~= && !~=`. Por eso
 * el ámbito `gcba` —que es *todo lo que no es `jm`* (`D-33`)— sigue sin necesitar nada nuevo, y el
 * caso D lo verifica sobre las mismas filas.
 *
 * Uso:
 *   node tools/probar-filtro-alternativas.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let pasadas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) { pasadas++; console.log('  ✅ ' + mensaje); }
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) return null;   // guarda de que la mutación ocurrió
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  /* `normalizarValorDeclarado_` vive en `Fuentes.gs`; se carga la REAL, no una copia. */
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8'), ctx,
    { filename: 'Fuentes.gs' });
  return ctx;
}

/** Evalúa un filtro contra una fila, con el evaluador REAL del motor. */
function pasa(ctx, texto, fila) {
  ctx.__t = texto;
  ctx.__f = fila;
  return vm.runInContext(
    'primeraCondicionQueFalla_(parsearFiltro_(__t).condiciones, function (c) { return __f[c]; }) === null',
    ctx);
}

/* Las dos filas reales de Coghlan y una de GCBA, del fixture del 28/08. `u` es la columna
 * `Prioridad` y `v` es `nombre_campaña`: en Coghlan el nombre está en la U y la V vacía. */
const COGHLAN = { u: '1 A 1 JM | 21/8 COGHLAN', v: '' };
const OTRA_JM = { u: 'Alto', v: 'Agenda RDV JM Te cuento' };
const GCBA = { u: 'Alto', v: 'Infraestructura I Cortes en AU Dellepiane' };
const AMBITO_JM = 'u~=JM || v~=JM';
const AMBITO_GCBA = 'u!~=JM && v!~=JM';

console.log('\n═══ A · control positivo — sin `||` todo sigue igual ═══');
{
  const ctx = contexto();
  const f = vm.runInContext('parsearFiltro_("v~=JM")', ctx);
  afirmar(f.ok === true && f.condiciones.length === 1, 'un filtro simple parsea a una condición');
  afirmar((f.condiciones[0].alternativas || []).length === 0,
    '⭐ y sin alternativas — los filtros vivos no cambian de forma');
  afirmar(pasa(ctx, 'v~=JM', OTRA_JM) === true, 'y evalúa igual que siempre');
  afirmar(pasa(ctx, 'v~=JM', GCBA) === false, 'incluido cuando no pasa');
  /* ⚠ Dos condiciones con `&&` siguen siendo AND: si esto se rompiera, el `||` habría cambiado
   * el significado de los 33 filtros vivos. */
  afirmar(pasa(ctx, 'u~=Alto && v~=JM', OTRA_JM) === true, 'y el `&&` sigue siendo AND');
  afirmar(pasa(ctx, 'u~=Alto && v~=Dellepiane', OTRA_JM) === false, 'con las dos exigidas');
}

console.log('\n═══ B · ⭐⭐ `||` pasa si pasa CUALQUIERA ═══');
{
  const ctx = contexto();
  const f = vm.runInContext('parsearFiltro_("' + AMBITO_JM + '")', ctx);
  afirmar(f.ok === true && f.condiciones.length === 1,
    'las alternativas son UN grupo, no dos condiciones (' + f.condiciones.length + ')');
  afirmar((f.condiciones[0].alternativas || []).length === 1, 'con una alternativa adentro');
  afirmar(pasa(ctx, AMBITO_JM, COGHLAN) === true,
    '⭐⭐ Coghlan pasa por la U — con la V sola caía en GCBA, que es el bug que esto arregla');
  afirmar(pasa(ctx, AMBITO_JM, OTRA_JM) === true, '⭐ y una campaña con el nombre en la V también');
  afirmar(pasa(ctx, AMBITO_JM, GCBA) === false,
    '⭐ y una de GCBA NO pasa — si pasara, el `||` estaría dejando entrar todo');
}

console.log('\n═══ C · precedencia: `||` liga más fuerte que `&&` ═══');
{
  const ctx = contexto();
  /* `(u~=JM || v~=JM) && u~=COGHLAN`: Coghlan cumple las dos; OTRA_JM cumple la primera y no la
   * segunda. Si el `&&` se partiera después del `||`, los dos darían lo mismo. */
  const t = 'u~=JM || v~=JM && u~=COGHLAN';
  afirmar(pasa(ctx, t, COGHLAN) === true, 'Coghlan pasa: cumple el grupo y la condición extra');
  afirmar(pasa(ctx, t, OTRA_JM) === false,
    '⭐ y la otra JM NO — o sea que el `&&` se aplicó al grupo entero, no sólo a la segunda mitad');
}

console.log('\n═══ D · la negación NO lleva `||` — De Morgan ═══');
{
  const ctx = contexto();
  afirmar(pasa(ctx, AMBITO_GCBA, GCBA) === true, 'la de GCBA pasa el ámbito `gcba`');
  afirmar(pasa(ctx, AMBITO_GCBA, COGHLAN) === false,
    '⭐⭐ y Coghlan NO — con `!~=` sobre las dos columnas, sin necesitar `||`');
  afirmar(pasa(ctx, AMBITO_GCBA, OTRA_JM) === false, 'ni la otra JM');
  /* ⚠ Las dos mitades tienen que ser complementarias sobre las mismas filas: si una fila pasara
   * las dos, o ninguna, el corte JM/GCBA dejaría de particionar y `D-33` se rompería. */
  [COGHLAN, OTRA_JM, GCBA].forEach((fila, i) => {
    const a = pasa(ctx, AMBITO_JM, fila);
    const b = pasa(ctx, AMBITO_GCBA, fila);
    afirmar(a !== b, '⭐ fila ' + (i + 1) + ': cae en exactamente UNO de los dos ámbitos');
  });
}

console.log('\n═══ E · un `||` mal escrito falla, y dice cuál ═══');
{
  const ctx = contexto();
  const f = vm.runInContext('parsearFiltro_("u~=JM || ")', ctx);
  afirmar(f.ok === false, 'una alternativa vacía no pasa desapercibida');
  afirmar(/alternativa 2 de 2/.test(f.motivo || ''),
    '⭐ y el motivo dice CUÁL — ' + (f.motivo || '').slice(0, 70));
}

console.log('\n═══ F · control negativo — sin el split, el `||` no hace nada ═══');
{
  const ctx = contexto((t) => t.replace(
    'var alternativas = String(piezas[p]).split(SEPARADOR_ALTERNATIVAS_FILTRO_);',
    'var alternativas = [piezas[p]];'));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    afirmar(pasa(ctx, AMBITO_JM, COGHLAN) === false,
      '⛔ sin partir por `||`, Coghlan vuelve a NO pasar — o sea que B mide ESA línea');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que el ámbito con `||` publique el número correcto. Eso pide una corrida y se');
console.log('     cruza contra el dashboard de Looker.');
console.log('   · Nada sobre la VENTANA: el Resumen Ejecutivo necesita además intersección de');
console.log('     fechas, que es otra pieza y otro banco.');

process.exit(fallas === 0 ? 0 : 1);
