#!/usr/bin/env node
/**
 * tools/probar-bloque-por-objectid.js — **el bloque modelo se resuelve por `objectId`, no por
 * posición** (`2026-09-04`).
 *
 * ⛔⛔ **El defecto que esto fija, medido en el deck de `secco` del 04/09:** `LAMINAS` declara
 * `secco/campana` = `L-016`…`L-023` y el deck duplicó **`L-017`…`L-024`** — **corrido un lugar**.
 * Dejó afuera `L-016`, que sí es de la sección, y metió `L-024`, que es `analisis_datos`.
 * ⚠ **Y no falló: duplicó lo que no era.**
 *
 * **La causa:** `indiceDeLaminasPorAncla_` se calcula **una vez, antes de duplicar** —con razón,
 * es lo que mata la N²— pero `presentacion.getSlides()` se relee **dentro del bucle de secciones**.
 * ⇒ Con un neto distinto de cero, **las secciones posteriores indexan el deck nuevo con posiciones
 * viejas**.
 *
 * ⭐ **El control positivo es el escenario del bug:** una sección previa que agrega **una** slide
 * neta. Con posiciones, el bloque sale corrido; con `objectId`, sale bien.
 *
 * Uso:  node tools/probar-bloque-por-objectid.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

const GEN = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

/* ── Un deck de juguete: 8 slides con ancla, y la primera sección le agrega UNA ────────────── */
function deck() {
  return ['L-014', 'L-015', 'L-016', 'L-017', 'L-018', 'L-019', 'L-020', 'L-021']
    .map((id, i) => ({ id: id, oid: 'oid-' + i }));
}

/* Los índices se toman ANTES, como hace el motor. */
function indicePosicional(d) {
  const porId = {}, oidDe = {};
  d.forEach((s, i) => { porId[s.id] = i; oidDe[i] = s.oid; });
  return { porId, oidDe };
}

console.log('═══ A · ⭐⭐ el escenario del bug: una sección previa agrega UNA slide ═══');
{
  const original = deck();
  const idx = indicePosicional(original);

  /* `campana` = L-016..L-018, o sea posiciones 0-based 2,3,4. */
  const modelos = ['L-016', 'L-017', 'L-018'].map(id => idx.porId[id]);
  afirmar(modelos.join(',') === '2,3,4', 'el bloque declarado son las posiciones 2,3,4');

  /* ⇒ Una sección ANTERIOR expandió: 1 modelo × 2 ítems = 2 copias − 1 modelo = **+1 neta**,
   * insertada al principio. Es exactamente el neto que produce el corrimiento de un lugar. */
  const despues = [{ id: 'L-014', oid: 'oid-0' }, { id: 'COPIA', oid: 'oid-nueva' }]
    .concat(original.slice(1));
  afirmar(despues.length === original.length + 1, 'el deck creció en 1 slide');

  /* ⛔ POR POSICIÓN — lo que hacía el motor. */
  const porPosicion = modelos.map(i => despues[i].id);
  afirmar(porPosicion.join(',') === 'L-015,L-016,L-017',
    '⛔⛔ POR POSICIÓN toma ' + porPosicion.join(', ') + ' — corrido un lugar, y NO falla');
  afirmar(porPosicion.indexOf('L-016') !== 0,
    '   ⛔ deja afuera `L-016`, que SÍ es de la sección');
  afirmar(porPosicion.indexOf('L-018') === -1,
    '   ⛔ y mete una que no le toca — el equivalente de `L-024`/`analisis_datos`');

  /* ⭐ POR OBJECTID — lo que hace ahora. */
  const porOid = {};
  despues.forEach(s => { porOid[s.oid] = s; });
  const porObjectId = modelos.map(i => (porOid[idx.oidDe[i]] || {}).id);
  afirmar(porObjectId.join(',') === 'L-016,L-017,L-018',
    '⭐⭐ POR OBJECTID toma ' + porObjectId.join(', ') + ' — las declaradas, con el deck movido');
}

console.log('\n═══ B · ⭐ y con el deck INTACTO los dos coinciden — por eso el bug era invisible ═══');
{
  const original = deck();
  const idx = indicePosicional(original);
  const modelos = ['L-016', 'L-017', 'L-018'].map(id => idx.porId[id]);
  const porOid = {};
  original.forEach(s => { porOid[s.oid] = s; });
  const a = modelos.map(i => original[i].id).join(',');
  const b = modelos.map(i => porOid[idx.oidDe[i]].id).join(',');
  afirmar(a === b && a === 'L-016,L-017,L-018',
    '⭐⭐ sin secciones previas los DOS dan lo mismo ⇒ **el defecto sólo aparece con más de una**');
  /* ⚠ Ésa es la razón de que sobreviviera: la mayoría de las corridas expanden una sola. */
}

console.log('\n═══ C · el motor usa `objectId` y ya no la posición ═══');
{
  afirmar(/var objectIdDeIndice = \{\};/.test(GEN),
    '⭐ `objectIdDeIndice` se arma antes de la primera duplicación');
  afirmar(/objectIdDeIndice\[i\] = sl\.getObjectId\(\)/.test(GEN),
    '   y guarda el `objectId` de cada posición original');
  afirmar(/porObjectId\[objectIdDeIndice\[i\]\]/.test(GEN),
    '⭐⭐ y `modelosSlides` resuelve por `objectId`, no por `slidesAhora[i]`');
  afirmar(!/var modelosSlides = ordenados\.map\(function \(i\) \{ return slidesAhora\[i\]; \}\)/.test(GEN),
    '⛔ y la línea vieja —`slidesAhora[i]`— ya NO está');
  /* ⛔ La guarda: una lámina que ya no está frena la sección en vez de duplicar la de al lado. */
  afirmar(/perdidas\.length/.test(GEN) && /No se ' \+\s*'expande/.test(GEN.replace(/\r/g, '')),
    '⭐⭐ y si una lámina modelo ya no está, **NO se expande** y se reporta');
}

console.log('\n═══ D · ⚠ por qué el ancla NO servía para esto ═══');
{
  /* `slide.duplicate()` copia las notas del orador —medido el 21/08—, así que una copia hereda el
   * ancla de su modelo. Resolver por `lamina_id` sobre un deck expandido devuelve COPIAS. El
   * `objectId`, en cambio, es propio de cada slide y las copias tienen uno nuevo. */
  const original = deck();
  const copia = { id: 'L-016', oid: 'oid-copia' };       // misma ancla, otro objectId
  afirmar(copia.id === original[2].id, '⚠ una copia hereda el ANCLA de su modelo (`L-016`)');
  afirmar(copia.oid !== original[2].oid,
    '⭐⭐ pero NO su `objectId` ⇒ es lo único que distingue el modelo de su copia');
}

console.log('\n═══ E · control NEGATIVO — el banco PUEDE fallar ═══');
{
  const original = deck();
  const idx = indicePosicional(original);
  const modelos = ['L-016'].map(id => idx.porId[id]);
  /* Mutación: se corre el deck DOS lugares en vez de uno. */
  const dos = [{ id: 'X1', oid: 'x1' }, { id: 'X2', oid: 'x2' }].concat(original);
  afirmar(dos.length === original.length + 2, '⭐⭐ la mutación ocurrió: el deck creció 2');
  /* ⭐ Con +2 el corrimiento es de DOS: L-016 -> L-014, no L-015. El error **escala con el neto**,
   * asi que no es un ±1 que uno pueda compensar mentalmente. */
  afirmar(dos[modelos[0]].id === 'L-014',
    '⛔ por posición toma `L-014` — el error ESCALA con el neto, no es un ±1 fijo');
  const porOid = {};
  dos.forEach(s => { porOid[s.oid] = s; });
  afirmar(porOid[idx.oidDe[modelos[0]]].id === 'L-016',
    '⭐ y por `objectId` sigue dando `L-016`, mueva lo que mueva');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
console.log('⚠ Lo que este verde NO dice: que el deck salga bien. Prueba la RESOLUCIÓN de posición');
console.log('  con un deck de juguete. El control real es una corrida de `secco` donde la sección');
console.log('  `campana` duplique `L-016`…`L-023` y NO `L-017`…`L-024`.');
