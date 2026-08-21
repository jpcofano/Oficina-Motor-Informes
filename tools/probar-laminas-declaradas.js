#!/usr/bin/env node
/**
 * tools/probar-laminas-declaradas.js — **el bloque de una sección sale de `LAMINAS`, y la condición
 * del "1 a 1" vive en la lámina** (`docs/Prompts/2026-08-21_11_laminas_declaradas.md`, Parte D),
 * fuera de Apps Script y cargando el código real del repo.
 *
 * ⭐ **El número que hay que leer con cuidado, y por eso va primero:** `encuentro` de `jm` emite
 * **4** asignaciones antes del cambio (2 ítems × 2 láminas) y **4** después. **El conteo no cambia;
 * cambia CUÁL lámina le toca a cada ítem.** Un control que sólo mirara el total daría verde sin que
 * nada se hubiera aplicado — es exactamente el control 1 del prompt, que no alcanza solo.
 *
 * Uso:
 *   node tools/probar-laminas-declaradas.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/** Carga el código real. `parchear` permite romper a propósito sin tocar el repo. */
function contexto(parchear) {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
                parseInt, parseFloat, Logger: { log: () => {} }, leerConfig: () => ({}) };
  vm.createContext(ctx);
  for (const f of ['Parseo.gs', 'Fuentes.gs', 'Sellador.gs', 'Generador.gs']) {
    let texto = fs.readFileSync(path.join(RAIZ, f), 'utf8');
    if (parchear) texto = parchear(f, texto);
    vm.runInContext(texto, ctx, { filename: f });
  }
  return ctx;
}

/* ── el fixture: las filas REALES de LAMINAS del snapshot vivo ────────────────────────────────
 *
 * ⚠ `CLAUDE.md` §4: **un fixture se copia de una salida real, nunca se deduce.** Estas filas salen
 * del último snapshot de `LAMINAS`, que es lo que la hoja dice hoy. */
function filasLaminasDelSnapshot() {
  const dir = path.join(RAIZ, 'docs/_snapshots');
  const f = fs.readdirSync(dir).filter((n) => /^LAMINAS_\d{4}-\d{2}-\d{2}(_\d{4})?\.tsv$/.test(n)).sort().pop();
  const filas = fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n').map((l) => l.split('\t'));
  const h = filas.shift();
  return { archivo: f, filas: filas.filter((r) => r[0]).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] || '']))) };
}

/** Un índice `lamina_id → posición` armado con las posiciones REALES de las plantillas (medidas). */
const POS = {
  jm: { 'L-030': 0, 'L-031': 1, 'L-032': 2, 'L-033': 3, 'L-034': 4, 'L-052': 5, 'L-035': 6,
        'L-053': 7, 'L-036': 8, 'L-037': 9, 'L-038': 10, 'L-039': 11, 'L-040': 12, 'L-041': 13,
        'L-042': 14, 'L-043': 15, 'L-044': 16, 'L-045': 17, 'L-046': 18, 'L-047': 19, 'L-048': 20,
        'L-049': 21, 'L-050': 22, 'L-051': 23 },
  secco: Object.fromEntries(Array.from({ length: 29 }, (_, i) => ['L-' + String(i + 1).padStart(3, '0'), i]))
};

const ITEM_U1  = { clave: 'Parque Avellaneda', tipo: 'Uno a uno', etapa: '', id_cuenta: '3487-AGOJDGAG' };
const ITEM_TEM = { clave: ': Salud', tipo: 'Encuentro Temático', etapa: '', id_cuenta: '' };
const ITEM_SIN = { clave: 'Sin tipo', tipo: '', etapa: '', id_cuenta: '' };

const snap = filasLaminasDelSnapshot();
console.log('Láminas declaradas — fixture: ' + snap.archivo + ' (' + snap.filas.length + ' filas)\n');

/** Las láminas que le tocan a un ítem en una sección, con el código real. */
function bloqueDe(ctx, informeId, seccionId, item) {
  ctx.__filas = snap.filas; ctx.__ind = { porId: POS[informeId], sinAncla: [] };
  ctx.__inf = informeId; ctx.__sec = seccionId; ctx.__item = item;
  return vm.runInContext(`
    (function () {
      var d = laminasDeSeccion_(__filas, __inf, __sec, __ind);
      return d.conSlide.filter(function (l) { return laminaEntraParaItem_(l, __item).entra; })
              .map(function (l) { return l.lamina_id; });
    })()`, ctx);
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · No-regresión: el conjunto completo de cada sección es el que reclamaba la familia
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · el conjunto completo de cada sección');
{
  const ctx = contexto();
  const todas = (inf, sec) => {
    ctx.__filas = snap.filas; ctx.__ind = { porId: POS[inf], sinAncla: [] };
    ctx.__inf = inf; ctx.__sec = sec;
    return vm.runInContext('laminasDeSeccion_(__filas, __inf, __sec, __ind).conSlide.map(function(l){return l.lamina_id;})', ctx);
  };

  const encJm = todas('jm', 'encuentro');
  afirmar(JSON.stringify(encJm) === JSON.stringify(['L-052', 'L-035', 'L-053']),
    '`jm encuentro` = [L-052, L-035, L-053], en orden de deck — ' + JSON.stringify(encJm));

  const encSec = todas('secco', 'encuentro');
  afirmar(JSON.stringify(encSec) === JSON.stringify(['L-004', 'L-005', 'L-006', 'L-007', 'L-008']),
    '`secco encuentro` = las cinco, 4-5-6-7-8 — ' + JSON.stringify(encSec));

  // ⚠ §3 del `_11.2`: los dos bloques que CRECEN. Se afirma el número nuevo, no el viejo.
  afirmar(todas('jm', 'campana').length === 9,
    '⭐ `jm campana` arma 9 modelos, no 8 — entra L-040, la portada del bloque (§3)');
  afirmar(todas('secco', 'comunicaciones_post').length === 2,
    '⭐ `secco comunicaciones_post` arma 2, no 1 — entra L-009, la portada (§3)');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐ El objetivo: la lámina depende del tipo del ítem
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · la condición del "1 a 1"');
{
  const ctx = contexto();

  const u1 = bloqueDe(ctx, 'jm', 'encuentro', ITEM_U1);
  afirmar(JSON.stringify(u1) === JSON.stringify(['L-052', 'L-053']),
    '`Uno a uno` → portada + L-053, SIN el iceberg — ' + JSON.stringify(u1));

  const tem = bloqueDe(ctx, 'jm', 'encuentro', ITEM_TEM);
  afirmar(JSON.stringify(tem) === JSON.stringify(['L-052', 'L-035']),
    '`Encuentro Temático` → portada + iceberg, SIN L-053 — ' + JSON.stringify(tem));

  // ⭐ El número que se lee mal: los dos llevan DOS láminas. El total no cambia.
  afirmar(u1.length === 2 && tem.length === 2,
    'y los dos llevan 2 láminas: el conteo NO cambia, cambia cuál — por eso el control 1 no alcanza');

  const u1s = bloqueDe(ctx, 'secco', 'encuentro', ITEM_U1);
  afirmar(JSON.stringify(u1s) === JSON.stringify(['L-004', 'L-005']),
    'en `secco`, `Uno a uno` → L-004 + L-005 — ' + JSON.stringify(u1s));

  const tems = bloqueDe(ctx, 'secco', 'encuentro', ITEM_TEM);
  afirmar(JSON.stringify(tems) === JSON.stringify(['L-006', 'L-007', 'L-008']),
    'y `Encuentro Temático` → L-006 + L-007 + iceberg — ' + JSON.stringify(tems));
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · `tipo` vacío lleva iceberg — el caso que se olvida
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · `tipo` vacío');
{
  const ctx = contexto();
  const sin = bloqueDe(ctx, 'jm', 'encuentro', ITEM_SIN);
  afirmar(JSON.stringify(sin) === JSON.stringify(['L-052', 'L-035']),
    'sin `tipo` → portada + iceberg, que es lo decidido — ' + JSON.stringify(sin));

  // Y las otras dos grafías reales de REUNIONES, que también caen en `tipo!=Uno a uno`.
  ['Primera persona', 'Agregado'].forEach((t) => {
    const b = bloqueDe(ctx, 'jm', 'encuentro', { clave: t, tipo: t });
    afirmar(b.indexOf('L-035') !== -1 && b.indexOf('L-053') === -1,
      '`' + t + '` (grafía real de REUNIONES) → lleva iceberg, no L-053');
  });

  // ⚠ El caso que el prompt marca: en secco, un `Primera persona` NO recibe la estrategia.
  const pp = bloqueDe(ctx, 'secco', 'encuentro', { clave: 'x', tipo: 'Primera persona' });
  afirmar(pp.length >= 1 && JSON.stringify(pp) === JSON.stringify(['L-008']),
    '⚠ en `secco`, `Primera persona` sólo recibe el iceberg — ' + JSON.stringify(pp) +
    '. NO se queda sin bloque, así que el invariante no se rompe');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · ⛔ El invariante: un ítem sin ninguna lámina
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · un ítem que se queda sin ninguna lámina');
{
  const ctx = contexto();
  // Un ítem cuyo tipo no matchea ninguna condición de una sección con todas condicionales.
  const filasSolo = snap.filas.filter((f) => ['L-004', 'L-005', 'L-006', 'L-007'].indexOf(f.lamina_id) !== -1);
  ctx.__filas = filasSolo; ctx.__ind = { porId: POS.secco, sinAncla: [] };
  ctx.__item = { clave: 'Huérfano', tipo: 'Primera persona' };
  const b = vm.runInContext(`
    (function () {
      var d = laminasDeSeccion_(__filas, 'secco', 'encuentro', __ind);
      return d.conSlide.filter(function (l) { return laminaEntraParaItem_(l, __item).entra; }).length;
    })()`, ctx);
  afirmar(b === 0, 'sin el iceberg declarado, un `Primera persona` se queda con 0 láminas');

  // Y el motor lo frena: la guarda está en el código y el llamador la lee.
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  afirmar(/invarianteRoto = \{/.test(gen), 'el generador arma el invariante roto');
  afirmar(/if \(expansion\.invariante_roto\) \{/.test(gen),
    'y el llamador lo LEE y sale por ok:false — un `return` desde el forEach no habría frenado nada');
  afirmar(/inv\.seccion.*inv\.item|inv\.item.*inv\.seccion/s.test(gen),
    'y el motivo nombra la sección y el ítem');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Una lámina sin `seccion_id` no entra a ningún bloque
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · una lámina sin `seccion_id`');
{
  const ctx = contexto();
  const conHuerfana = snap.filas.map((f) => (f.lamina_id === 'L-035' ? Object.assign({}, f, { seccion_id: '' }) : f));
  ctx.__filas = conHuerfana; ctx.__ind = { porId: POS.jm, sinAncla: [] };
  const b = vm.runInContext(`laminasDeSeccion_(__filas, 'jm', 'encuentro', __ind).conSlide.map(function(l){return l.lamina_id;})`, ctx);
  afirmar(b.indexOf('L-035') === -1, 'con `seccion_id` vacío, L-035 no entra a `encuentro` — ' + JSON.stringify(b));
  afirmar(b.length === 2, 'y el bloque queda con las otras dos, no se cae');

  // Y el reporte la nombra: `laminas_sin_ancla` y `laminas_declaradas_sin_slide` viajan.
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  afirmar(/laminas_sin_ancla: indiceLaminas\.sinAncla/.test(gen),
    'y el reporte lleva `laminas_sin_ancla` — «nadie la clasificó» y «no tiene tokens» se separan');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 6 · ⚠ Romper a propósito
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · romper a propósito: volver la resolución a la familia de tokens');
{
  // Se anula el filtro por lámina — que es lo que la condición usa — y tiene que caer la 2.
  const ctx = contexto((f, texto) => f !== 'Generador.gs' ? texto : texto.replace(
    "  if (f.vacio) return { entra: true, motivo: '' };",
    "  return { entra: true, motivo: '' };   // ROTO A PROPÓSITO"));

  const u1 = bloqueDe(ctx, 'jm', 'encuentro', ITEM_U1);
  afirmar(u1.length === 3,
    'sin el filtro, el `Uno a uno` recibe las TRES láminas — iceberg incluido: ' + JSON.stringify(u1));
  afirmar(JSON.stringify(u1) !== JSON.stringify(['L-052', 'L-053']),
    'y la afirmación 2 cae — el control mide lo que dice');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 7 · Las cinco repetibles sin láminas NO despiertan
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n7 · el filtro de `estado = activa` se conserva');
{
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const cuerpo = gen.slice(gen.indexOf('function seccionesRepetiblesDe_('),
                           gen.indexOf('function itemsDeSeccion_('));
  afirmar(/estado \|\| ''\)\.trim\(\) !== 'activa'/.test(cuerpo),
    '`seccionesRepetiblesDe_` sigue exigiendo `estado = activa`');
  afirmar(/modo \|\| ''\)\.trim\(\) !== 'repetible'/.test(cuerpo),
    'y sigue exigiendo `modo = repetible`');
  afirmar(!/familiasDeSeccion_\(s\)\.length > 0/.test(cuerpo),
    'y YA NO exige `familia_tokens` — la pertenencia la dice LAMINAS (D-37)');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que el deck salga bien. Acá se decide QUÉ láminas copia cada ítem; que se copien,');
console.log('     se ordenen y se pinten necesita una corrida real.');
console.log('   · Que la N² esté muerta. El índice se calcula antes de duplicar y eso es estructural,');
console.log('     pero medirlo pide expandir dos veces sobre un deck de verdad.');
console.log('   · Qué dice LAMINAS hoy: el fixture es un snapshot fechado, no la hoja viva.');

process.exit(fallas === 0 ? 0 : 1);
