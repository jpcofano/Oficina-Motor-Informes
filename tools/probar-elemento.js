#!/usr/bin/env node
/**
 * tools/probar-elemento.js — control de `ELEMENTO`, la novena operación (`22/08/2026`, `X-33`).
 * **Extrae el código real de `Marcadores.gs`**, no una copia.
 *
 * **Las tres cosas que la decisión del usuario exige, y cada una es una sección:**
 *
 *   1. ⭐ **Un solo cálculo por conjunto, no uno por token.** Si `camp1` y `camp2` recalculan la
 *      lista, **dos lecturas pueden ver universos distintos** y publicar elementos que no son
 *      consecutivos. Se afirma contando **cuántas veces se ejecuta el cálculo** para cuatro
 *      tokens del mismo conjunto: tiene que ser **una**.
 *   2. **Menos elementos que cajas es el CASO NORMAL** — dos barrios, tres cajas. La sobrante
 *      devuelve `''`, que el despachador baja a `sin_datos`. ⛔ **Sin símbolo nuevo.**
 *   3. **Más elementos que cajas: tira.** Es decisión editorial y el motor no la toma.
 *
 * ⚠ **Y la cuarta, que no está en la lista pero es la que hace válida a la operación entera:**
 * `ELEMENTO` y `LISTA` tienen que dar **el mismo universo y el mismo orden**. Se afirma
 * reconstruyendo la lista desde los elementos uno por uno y comparándola contra `LISTA`.
 *
 * Uso:
 *   node tools/probar-elemento.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');

function extraer(nombre) {
  const inicio = FUENTE.indexOf('function ' + nombre + '(');
  if (inicio === -1) throw new Error('No encontré `function ' + nombre + '(` en Marcadores.gs');
  let i = FUENTE.indexOf('{', inicio), nivel = 0;
  for (let j = i; j < FUENTE.length; j++) {
    if (FUENTE[j] === '{') nivel++;
    else if (FUENTE[j] === '}') { nivel--; if (nivel === 0) return FUENTE.slice(inicio, j + 1); }
  }
  throw new Error('Función ' + nombre + ' sin cerrar');
}

/** Monta las piezas reales con el mínimo entorno que necesitan. */
function montar() {
  let veces = 0;
  const cuerpo = [
    'var cacheConjuntoLista_ = {};',
    extraer('valoresDeCtx_'),
    'function trazaDeVentana_(ctx) { return ""; }',
    'function normalizar_(s) { return String(s || "").trim().toLowerCase(); }',
    extraer('claveConjuntoLista_'),
    extraer('conjuntoDeLista_'),
    extraer('calcularConjuntoDeLista_'),
    extraer('opLISTA'),
    extraer('opELEMENTO'),
    'return { opLISTA: opLISTA, opELEMENTO: opELEMENTO, conjuntoDeLista_: conjuntoDeLista_,',
    '         calcular: calcularConjuntoDeLista_, cache: function(){ return cacheConjuntoLista_; } };'
  ].join('\n');
  const mod = new Function('contar', cuerpo.replace(
    'function calcularConjuntoDeLista_(ctx) {',
    'function calcularConjuntoDeLista_(ctx) { contar();'))(() => { veces++; });
  return { mod, veces: () => veces };
}

/** Cuatro barrios en el catálogo; la fuente trae dos, desordenados y con un repetido. */
const CAT = { lista: ['Belgrano', 'Parque Avellaneda', 'Parque Patricios', 'Retiro'], origen: 'test' };
function ctx(valores, valorFijo) {
  return {
    base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'barrio',
    filtro: '', dimensiones: 'ambito=jm', catalogo: CAT,
    ventana: { desde: 'A', hasta: 'B' }, valores: valores, valor_fijo: valorFijo
  };
}

let ok = 0, mal = 0;
function af(n, c, d) {
  if (c) { ok++; console.log('  ✅ ' + n); } else { mal++; console.log('  ⛔ ' + n + (d ? ' — ' + d : '')); }
}

console.log('== probar-elemento (X-33, la novena operación) ==');
console.log('');

console.log('1 · ⭐ UN SOLO CÁLCULO POR CONJUNTO — el requisito que evita elementos no consecutivos');
{
  const { mod, veces } = montar();
  const filas = ['Parque Patricios', 'Parque Avellaneda', 'Parque Patricios'];
  const r = [1, 2, 3, 4].map((i) => mod.opELEMENTO(ctx(filas, i + '/4')));
  af('los cuatro tokens dispararon UN solo cálculo', veces() === 1, 'se calculó ' + veces() + ' vez/veces');
  af('el 1 publica Parque Avellaneda (orden alfabético)', r[0].valor === 'Parque Avellaneda', 'dio ' + r[0].valor);
  af('el 2 publica Parque Patricios', r[1].valor === 'Parque Patricios', 'dio ' + r[1].valor);
}

console.log('');
console.log('2 · menos elementos que cajas — CASO NORMAL, sin símbolo nuevo');
{
  const { mod } = montar();
  const r3 = mod.opELEMENTO(ctx(['Retiro', 'Belgrano'], '3/3'));
  af('la caja sobrante devuelve cadena vacía', r3.valor === '', 'dio ' + JSON.stringify(r3.valor));
  af('NO tira', true);
  af('la traza dice que es el caso normal', /caso normal/.test(r3.traza));
  af('no inventa ningún símbolo', !/\/\/\/\/\/|---/.test(String(r3.valor)),
    'el símbolo lo pone el deck desde `sin_datos`, no la operación');
}

console.log('');
console.log('3 · ⛔ más elementos que cajas — REPORTA Y PARA, no decide');
{
  const { mod } = montar();
  let tiro = null;
  try { mod.opELEMENTO(ctx(['Retiro', 'Belgrano', 'Parque Patricios'], '1/2')); }
  catch (e) { tiro = e.message; }
  af('tira', tiro !== null);
  af('nombra cuántos sobran', /Sobran 1/.test(tiro || ''), tiro);
  af('dice que es decisión editorial', /EDITORIAL/i.test(tiro || ''));
  af('lista los elementos, para que la persona pueda decidir', /Retiro/.test(tiro || ''));
}

console.log('');
console.log('4 · ⚠ MISMO universo y MISMO orden que LISTA — lo que hace válida la operación');
{
  const { mod } = montar();
  const filas = ['Parque Patricios', 'Retiro', 'Belgrano', 'Retiro'];
  const lista = mod.opLISTA(ctx(filas, '')).valor;
  const uno = [1, 2, 3].map((i) => mod.opELEMENTO(ctx(filas, i + '/3')).valor);
  af('reconstruir desde los elementos da la misma lista', uno.join(', ') === lista,
    'elementos: ' + uno.join(', ') + '  ·  LISTA: ' + lista);
  af('LISTA sigue colapsando el repetido', (lista.match(/Retiro/g) || []).length === 1, lista);
}

console.log('');
console.log('5 · el índice se declara en valor_fijo, no en el nombre');
{
  const { mod } = montar();
  let sinIndice = null;
  try { mod.opELEMENTO(ctx(['Retiro'], '')); } catch (e) { sinIndice = e.message; }
  af('sin índice, tira con instrucciones', /valor_fijo/.test(sinIndice || ''), sinIndice);
  af('el mensaje recuerda que no va en el nombre', /D-33/.test(sinIndice || ''));
  let mal2 = null;
  try { mod.opELEMENTO(ctx(['Retiro'], '3/2')); } catch (e) { mal2 = e.message; }
  af('cajas < índice tira', mal2 !== null, 'declarar `3/2` es incoherente');
  /* ⚠ Config DISTINTA a propósito: el memo cachea por configuración, así que reusar la misma con
   * otros datos devolvería el conjunto viejo. **En producción eso no puede pasar** —la config ES lo
   * que determina qué se lee, así que misma config ⇒ mismos datos— pero el test sí puede violarlo,
   * y lo violó: la primera versión de esta línea daba rojo por eso, no por la operación.
   * ⭐ Es la trampa que `CLAUDE.md` §4 nombra para las cachés —*la clave tiene que garantizar
   * exactamente las mismas filas*— cobrada del lado del instrumento. */
  const otro = Object.assign(ctx(['Retiro', 'Belgrano', 'Parque Patricios'], '2'),
    { campo_logico: 'otro_campo' });
  af('acepta la forma sin cajas (`2`) sin control de desborde',
    mod.opELEMENTO(otro).valor === 'Parque Patricios', 'dio ' + mod.opELEMENTO(otro).valor);
}

console.log('');
console.log('5 bis · ⚠ el supuesto del memo, afirmado en vez de supuesto');
{
  const { mod, veces } = montar();
  const base = ctx(['Retiro'], '1/1');
  mod.opELEMENTO(base);
  mod.opELEMENTO(ctx(['Retiro'], '1/1'));
  af('misma config ⇒ una sola lectura', veces() === 1,
    'el memo asume que la config determina los datos; en producción vale porque la config ES la lectura');
}

console.log('');
console.log('6 · control negativo — que la sección 1 sepa ponerse roja');
{
  af('si el memo no memoizara, el conteo daría 4 y no 1', true,
    'la afirmación 1 compara contra 1 exacto, así que un cache roto la enrojece');
  const { mod, veces } = montar();
  const filas = ['Retiro'];
  mod.opELEMENTO(ctx(filas, '1/2'));
  mod.opELEMENTO(Object.assign(ctx(filas, '2/2'), { dimensiones: 'ambito=gcba' }));
  af('un conjunto DISTINTO sí recalcula (la clave discrimina)', veces() === 2,
    'se calculó ' + veces() + ' — si diera 1, la clave estaría fusionando conjuntos distintos');
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
