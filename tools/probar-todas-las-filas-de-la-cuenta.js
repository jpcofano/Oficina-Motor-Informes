#!/usr/bin/env node
/**
 * tools/probar-todas-las-filas-de-la-cuenta.js — **un agregado se lleva TODAS las filas de la
 * cuenta; una tabla, una por encuentro** (`2026-08-28`).
 *
 * ⛔⛔ **El bug que fija, publicado en el deck del 27/08.** `filasDeSolapaDelTemario_` hacía
 * `filas.push(suyas[0])` **siempre**. Para `L-036` es correcto —su tabla es *una fila por reunión*—
 * y esa función se reusó para el agregado de `L-034`. La cuenta de Coghlan (`3527-AGOJDGAG`) tiene
 * **seis filas** en la fuente —una por campaña × plataforma × objetivo— y el deck publicó las
 * impresiones de **una**: **29.349** en vez de **66.855**.
 *
 * ⭐ **Quedarse con la primera es elegir por el ORDEN DE LA HOJA**, que es exactamente lo que el
 * `_39` le sacó a `ULTIMO`. No es un número menos preciso: es otro número.
 *
 * ⚠ **Y el motor lo avisó y nadie lo vio:** la traza decía `⛔ 1 cuenta(s) con MÁS DE UNA fila — se
 * tomó la primera`. Vive en el `origen` del marcador, que no llega ni al deck ni a `FALTANTES`.
 *
 * ⭐ **Las seis filas del fixture son las reales**, copiadas de las que pasó el usuario el 27/08.
 * Suman 66.855, y la primera sola da 29.349 — los dos números que separan el bug del arreglo.
 *
 * Uso:
 *   node tools/probar-todas-las-filas-de-la-cuenta.js
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

const CUENTA = '3527-AGOJDGAG';
/* Las seis filas reales de Coghlan, del 27/08. `imp` es la columna de impresiones. */
const FILAS = [
  { id: CUENTA, imp: 29349, campana: 'Agenda con 1 A 1 - Coghlan - 18/8', plat: 'Meta' },
  { id: CUENTA, imp: 8955, campana: 'Agenda con 1 A 1 - Coghlan - 18/8', plat: 'Meta' },
  { id: CUENTA, imp: 23456, campana: 'Agenda Post con 1 A 1 - Coghlan - 18/8', plat: 'Meta' },
  { id: CUENTA, imp: 4838, campana: 'Agenda con 1 A 1 - Coghlan - 18/8', plat: 'Google ads' },
  { id: CUENTA, imp: 257, campana: 'Agenda Post con 1 A 1 - Coghlan - 18/8', plat: 'Google ads' },
  { id: CUENTA, imp: 0, campana: 'Agenda Post con 1 A 1 - Coghlan - 18/8', plat: 'DV360' },
  /* De otra cuenta: el control de que el recorte por cuenta sigue valiendo. Si entrara, el total
   * daría 76.855 y la afirmación de 66.855 caería. */
  { id: '9999-OTRA', imp: 10000, campana: 'Otra campaña', plat: 'Meta' }
];
const SUMA_SEIS = 66855;
const PRIMERA = 29349;

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

  ctx.leerSeccionesPlano_ = () => ({});
  ctx.seccionAgregadaDeReuniones_ = () => ({ ok: true, seccion: { seccion_id: 'ecv_alcance_semanal' } });
  ctx.campoIdCuentaDeSolapa_ = () => 'des_id_cuenta';
  ctx.buscarMapeo = () => ({ ok: true, columna: 'B' });
  ctx.claveDeLecturaEnColumna_ = () => 'id';
  ctx.normalizarIdCuenta_ = (v) => String(v || '').trim();
  ctx.itemsDeSeccion_ = () => ({ ok: true, items: [{ id_cuenta: CUENTA, clave: 'Coghlan' }] });
  ctx.leerFuente = () => ({ ok: true, hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', filas: FILAS });
  ctx.filtrarFilasPorCuenta_ = (filas, clave, id) => filas.filter((f) => f[clave] === id);
  return ctx;
}

const pedir = (ctx, todas) =>
  ctx.filasDeSolapaDelTemario_('jm', null, 'ecv_alcance_semanal',
    'digital', 'CAMPAÑAS_DESGLOCE_DIGITAL', [], todas);

const sumar = (r) => r.filas.reduce((a, f) => a + f.imp, 0);

console.log('\n═══ A · control positivo — la TABLA sigue tomando una por encuentro ═══');
{
  const ctx = contexto();
  const r = pedir(ctx, false);
  afirmar(r.ok === true, 'resuelve');
  afirmar(r.filas.length === 1, '⭐ una sola fila, que es lo que `L-036` necesita (' + r.filas.length + ')');
  afirmar(sumar(r) === PRIMERA, 'y es la primera: ' + sumar(r));
  afirmar(r.con_varias === 1, '⭐ reporta la cuenta con varias filas — el aviso que existía y nadie miraba');
  afirmar(r.todas === false, 'y declara que NO trajo todas');
}

console.log('\n═══ B · ⭐⭐ el AGREGADO se lleva las seis ═══');
{
  const ctx = contexto();
  const r = pedir(ctx, true);
  afirmar(r.filas.length === 6, '⭐⭐ seis filas, una por campaña × plataforma (' + r.filas.length + ')');
  afirmar(sumar(r) === SUMA_SEIS,
    '⭐⭐ suman ' + SUMA_SEIS + ' — el número que el deck tiene que publicar, contra ' + PRIMERA +
    ' que publicó el 27/08');
  afirmar(r.todas === true, 'y lo declara en el resultado, que es lo que hace que el aviso diga la verdad');
  afirmar(r.items === 1, '⚠ un ítem, seis filas: `items` cuenta ENCUENTROS y no filas (' + r.items + ')');
}

console.log('\n═══ C · el recorte por cuenta sigue valiendo ═══');
{
  const ctx = contexto();
  const r = pedir(ctx, true);
  afirmar(!r.filas.some((f) => f.id === '9999-OTRA'),
    '⭐ la fila de otra cuenta NO entra — si entrara darían 76.855 y B habría pasado por casualidad');
}

console.log('\n═══ D · la guarda de métrica mira TODAS, no la primera ═══');
{
  /* Con `camposMetrica`, «midió» tiene que ser *alguna* de las filas. Exigirlo de la primera
   * dejaría afuera una cuenta cuya única fila con resultado no está arriba. */
  const ctx = contexto();
  /* ⚠ Los dos stubs tienen que distinguir el campo de la CUENTA del de la MÉTRICA: si devuelven
   * la misma columna para los dos, el recorte por cuenta no matchea nada y el caso mide `sin_fila`
   * en vez de la guarda de métrica. Pasó en el primer intento y daba 0 filas. */
  ctx.buscarMapeo = (b, s, campo) => ({ ok: true, columna: campo === 'imp' ? 'imp' : 'B' });
  ctx.claveDeLecturaEnColumna_ = (b, s, col) => (col === 'imp' ? 'imp' : 'id');
  const conCero = FILAS.slice();
  conCero[0] = { id: CUENTA, imp: 0, campana: 'x', plat: 'Meta' };
  ctx.leerFuente = () => ({ ok: true, hoja: 'X', filas: conCero });
  const r = ctx.filasDeSolapaDelTemario_('jm', null, 'ecv_alcance_semanal',
    'digital', 'CAMPAÑAS_DESGLOCE_DIGITAL', ['imp'], true);
  afirmar(r.filas.length === 6 && r.sin_metrica === 0,
    '⭐ con la PRIMERA en cero la cuenta entra igual, porque otras midieron (' +
    r.filas.length + ' filas, sin_metrica=' + r.sin_metrica + ')');
}

console.log('\n═══ E · control negativo — sin la bandera, vuelve a una sola ═══');
{
  const ctx = contexto((t) => t.replace(
    'if (todasLasFilas) suyas.forEach(function (f) { filas.push(f); });',
    'if (false) suyas.forEach(function (f) { filas.push(f); });'));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    const r = pedir(ctx, true);
    afirmar(r.filas.length === 1 && sumar(r) === PRIMERA,
      '⛔ sin la línea vuelve a ' + PRIMERA + ' — o sea que B mide ESA línea');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que 66.855 sea el número CORRECTO del negocio. Prueba que se suman las seis');
console.log('     filas de la cuenta; si esas seis son el universo que corresponde es otra');
console.log('     pregunta, y el testigo es el deck del equipo (fixture del 28/08).');
console.log('   · Nada sobre `L-036`: su tabla sigue con una fila por encuentro, y eso lo');
console.log('     cubre `probar-rediseno-l036.js`.');

process.exit(fallas === 0 ? 0 : 1);
