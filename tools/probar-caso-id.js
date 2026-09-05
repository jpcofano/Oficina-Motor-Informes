#!/usr/bin/env node
/**
 * tools/probar-caso-id.js — **`caso_id` es la clave del cruce de `D-56` y NO es única.**
 * Ítem 29 de la cola. Parte G del `2026-09-05_1`.
 *
 * ⛔⛔ **El defecto que vigila:** `C-84` y `C-85` existen **dos veces**, en dos archivos distintos,
 * porque el CSV del 28/08 **reinició la serie** en vez de seguir el máximo global. ⚠ **Ya costó una
 * lectura equivocada**, y ningún instrumento del repo lo señalaba — el cruce de `D-56` le daba
 * verde igual.
 *
 * ══ ⭐⭐ POR QUÉ NO SALE ROJO POR LOS DOS QUE YA ESTÁN ══════════════════════════════════════
 *
 * El prompt pedía *«exit ≠ 0 si hay duplicados»*. ⛔ **Tal cual, este banco nacería rojo y quedaría
 * rojo para siempre**, porque los dos duplicados **no se pueden renumerar**: los casos ya ejecutados
 * no se renumeran —mismo criterio que los prompts, `CLAUDE.md` §3— y **elegir cuál de los dos `C-84`
 * se queda con el número es una decisión del usuario**. Un banco permanentemente rojo deja de leerse,
 * y entonces no vigila nada.
 *
 * ⭐ **La salida es la que el repo ya prescribe: el control no se afloja, gana afirmaciones.** El
 * baseline de dos se **declara por nombre**, y el banco se pone rojo ante **un tercero**. Así:
 *   · un duplicado nuevo **falla** — que es para lo que existe;
 *   · el día que el usuario resuelva los dos, **también falla** (`FALTA` en el baseline) y hay que
 *     venir a sacarlos de la lista, **con el motivo escrito**. ⇒ El baseline no se puede vencer en
 *     silencio, que es la diferencia entre un estado y una condición (`CLAUDE.md` §4).
 *
 * ⛔ **NO renumera nada, no escribe ningún CSV, y no elige.** Muestra el problema.
 *
 * Uso:  node tools/probar-caso-id.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const DOCS = path.join(RAIZ, 'docs');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

/* ⭐ El baseline: los duplicados CONOCIDOS y aceptados, por nombre. No es una tolerancia
 * numérica —«hasta dos duplicados está bien»— porque eso dejaría entrar un tercero distinto
 * mientras se resolviera uno de éstos. */
const DUPLICADOS_CONOCIDOS = ['C-84', 'C-85'];

const archivos = fs.readdirSync(DOCS)
  .filter(n => /^casos_validacion_.*\.csv$/.test(n)).sort();

/* ⚠ Se parte por la PRIMERA coma de cada línea y nada más: el `caso_id` es el primer campo y
 * nunca lleva comas. Un parser de CSV completo sería reimplementar lo que no hace falta —y las
 * notas de estos archivos tienen comas y comillas de sobra. */
const donde = {};      // caso_id -> [archivos]
const porPrefijo = {}; // prefijo -> máximo numérico
let filas = 0;
archivos.forEach(nombre => {
  const lineas = fs.readFileSync(path.join(DOCS, nombre), 'utf8').split(/\r?\n/);
  lineas.slice(1).forEach(l => {
    const id = l.split(',')[0].trim();
    if (!/^[A-Z]+-\d+$/.test(id)) return;
    filas++;
    (donde[id] = donde[id] || []).push(nombre);
    const [pre, num] = id.split('-');
    porPrefijo[pre] = Math.max(porPrefijo[pre] || 0, Number(num));
  });
});

console.log('═══ 0 · el universo, declarado antes de afirmar nada ═══');
console.log('  archivos: ' + archivos.length + '  ·  casos con id válido: ' + filas);
archivos.forEach(n => console.log('     · ' + n));
afirmar(archivos.length >= 2, 'hay al menos dos archivos que comparar');
afirmar(filas > 0, 'se leyó al menos un caso  (cero casos sería el cero silencioso)');

console.log('\n═══ A · ⭐ CONTROL POSITIVO — los duplicados conocidos TIENEN que aparecer ═══');
{
  /* ⛔ Sin esto, un parser roto informaría «no hay duplicados» y se leería como salud. Es la
   * misma figura que el detector sin control positivo: **el cero es el resultado más peligroso**,
   * porque es indistinguible del éxito. */
  const vistos = DUPLICADOS_CONOCIDOS.filter(id => (donde[id] || []).length > 1);
  vistos.forEach(id => console.log('     ' + id + '  →  ' + donde[id].join('  +  ')));
  afirmar(vistos.length === DUPLICADOS_CONOCIDOS.length,
    '⭐⭐ el instrumento VE los ' + DUPLICADOS_CONOCIDOS.length + ' conocidos (' +
    vistos.length + ' encontrados)');
  if (vistos.length !== DUPLICADOS_CONOCIDOS.length) {
    const faltan = DUPLICADOS_CONOCIDOS.filter(id => vistos.indexOf(id) === -1);
    console.log('     ⛔⛔ NO aparecen: ' + faltan.join(', '));
    console.log('     ⇒ O el parser dejó de ver los CSV, O el usuario resolvió el duplicado.');
    console.log('       **Son dos cosas opuestas y este banco no las distingue**: si fue lo');
    console.log('       segundo, hay que sacarlo del baseline A MANO y escribir por qué.');
  }
}

console.log('\n═══ B · ⛔ lo que este banco vigila: un duplicado NUEVO ═══');
{
  const todos = Object.keys(donde).filter(id => donde[id].length > 1).sort();
  const nuevos = todos.filter(id => DUPLICADOS_CONOCIDOS.indexOf(id) === -1);
  console.log('  duplicados totales: ' + todos.length +
    '  ·  conocidos: ' + DUPLICADOS_CONOCIDOS.length + '  ·  NUEVOS: ' + nuevos.length);
  nuevos.forEach(id => console.log('     ⛔ ' + id + '  →  ' + donde[id].join('  +  ')));
  afirmar(nuevos.length === 0,
    nuevos.length ? '⛔⛔ hay ' + nuevos.length + ' duplicado(s) NUEVO(s): ' + nuevos.join(', ')
      : 'ningún duplicado fuera del baseline declarado');
}

console.log('\n═══ C · ⭐ el máximo global por prefijo — de acá sale el próximo id ═══');
{
  /* ⭐ Es la mitad que EVITA el problema, no la que lo detecta: el `caso_id` nuevo sale del
   * máximo GLOBAL de todos los archivos, nunca del máximo del archivo que se está editando —que
   * es exactamente cómo nacieron `C-84` y `C-85`. */
  Object.keys(porPrefijo).sort().forEach(p => {
    console.log('     ' + p + '-*  →  máximo ' + p + '-' + porPrefijo[p] +
      '   ⇒ el próximo es ' + p + '-' + (porPrefijo[p] + 1));
  });
  afirmar(Object.keys(porPrefijo).length > 0, 'se calculó al menos un prefijo');
}

console.log('');
console.log('⛔ Este banco NO renumera, NO escribe ningún CSV y NO elige cuál de los dos `C-84`');
console.log('   se queda con el número: eso es una decisión del usuario. Muestra el problema.');
console.log('⚠ Y lo que NO contesta: si dos casos con id distinto hablan del mismo marcador. Eso');
console.log('   es `D-58` y es otra pregunta.');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
