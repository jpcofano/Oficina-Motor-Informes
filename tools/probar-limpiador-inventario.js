#!/usr/bin/env node
/**
 * tools/probar-limpiador-inventario.js — **el limpiador de `inventario.js` no se come el archivo**
 * (03/09/2026).
 *
 * ⛔⛔ **El bug que fija, y tuvo a dos instrumentos rotos seis días.** El limpiador borra
 * comentarios y contenido de strings preservando offsets, pero **no reconocía regex literales**.
 * `Auditoria.gs:2917` tiene una regex **con backticks adentro**:
 *
 *     /filtro\s+`[^`]*`[^→]*→\s*(\d+)\s+de\s+(\d+)\s+fila/
 *
 * El limpiador veía el primer `` ` `` y entraba en modo template string; el segundo lo cerraba, el
 * tercero volvía a abrir, y **desde ahí se comía el resto del archivo — 487 líneas de código**.
 * Resultado: `Llaves desbalanceadas tras limpiar Auditoria.gs (-2)`, y con él **`inventario.js` y
 * `escritores.js` caídos desde el 28/08** (`6d6fa01`; el commit anterior daba balance 0).
 *
 * ⭐ **El control es un INVARIANTE, no una constante:** el balance de llaves de un archivo `.gs`
 * válido **tiene que ser cero**, hoy y siempre. No caduca cuando alguien agregue código, que es
 * justo lo que le pasaría a un control escrito como *«Auditoria.gs tiene N funciones»*.
 *
 * Uso:
 *   node tools/probar-limpiador-inventario.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

/** Se extrae `limpiar` del archivo real, cortando antes de `main` para no ejecutarlo. */
function limpiadorReal() {
  const src = fs.readFileSync(path.join(RAIZ, 'tools/inventario.js'), 'utf8');
  const corte = src.indexOf('function main(');
  if (corte === -1) throw new Error('no encontré `function main(` en inventario.js');
  const ctx = { require, module, console, process, __dirname: path.join(RAIZ, 'tools') };
  vm.createContext(ctx);
  vm.runInContext(src.slice(0, corte) + '; globalThis.__limpiar = limpiar;', ctx,
    { filename: 'inventario.js' });
  return ctx.__limpiar;
}

const limpiar = limpiadorReal();

function balance(texto) {
  let b = 0;
  for (const c of limpiar(texto)) { if (c === '{') b++; if (c === '}') b--; }
  return b;
}

console.log('\n═══ A · ⭐ el INVARIANTE: todo `.gs` cierra sus llaves en cero ═══');
{
  const gs = fs.readdirSync(RAIZ).filter((f) => f.slice(-3) === '.gs');
  afirmar(gs.length >= 20, 'hay ' + gs.length + ' archivos `.gs` que medir');
  const malos = gs.filter((f) => balance(fs.readFileSync(path.join(RAIZ, f), 'utf8')) !== 0);
  afirmar(malos.length === 0,
    '⭐⭐ los ' + gs.length + ' cierran en cero' +
    (malos.length ? ' — DESBALANCEADOS: ' + malos.join(', ') : ''));
}

console.log('\n═══ B · el caso exacto: una regex con BACKTICKS adentro ═══');
{
  /* ⛔ Éste es el que rompía. Sin el reconocimiento de regex, el limpiador entra en modo template
   * string y se lleva puesto todo lo que sigue. */
  const caso = 'function a() {\n' +
    '  var f = /filtro\\s+`[^`]*`[^x]*x\\s*(\\d+)/.exec(t);\n' +
    '  if (f) { return 1; }\n' +
    '}\n';
  afirmar(balance(caso) === 0, '⭐⭐ balance 0 con backticks dentro de la regex');
  afirmar(limpiar(caso).indexOf('return') !== -1,
    '⭐ y el código que sigue NO se borra — era lo que desaparecía (487 líneas)');
}

console.log('\n═══ C · regex con comillas y con llaves adentro ═══');
{
  const conComillas = "function b() {\n  var r = /['\"]+/.exec(s);\n  if (r) { return 2; }\n}\n";
  afirmar(balance(conComillas) === 0, 'una regex con `\\x27` y `\"` adentro no abre un string');
  const conLlaves = 'function c() {\n  var r = /\\{([^}:]+)\\}/g;\n  if (r) { return 3; }\n}\n';
  afirmar(balance(conLlaves) === 0,
    '⭐ y una con `{` y `}` adentro no descuadra el conteo — las llaves de la regex NO son código');
  const clase = 'function d() {\n  var r = /[/{]+/.exec(s);\n  if (r) { return 4; }\n}\n';
  afirmar(balance(clase) === 0,
    '⭐ una `/` dentro de una clase `[...]` no cierra la regex');
}

console.log('\n═══ D · y la DIVISIÓN sigue siendo división ═══');
{
  /* ⚠ El riesgo del arreglo es el simétrico: tomar una división por el inicio de una regex y
   * comerse el código hasta la próxima `/`. El desempate mira el token anterior. */
  const div = 'function e() {\n  var x = (a + b) / c;\n  var y = total / 2;\n  if (x) { return 5; }\n}\n';
  afirmar(balance(div) === 0, 'balance 0 con divisiones');
  afirmar(limpiar(div).indexOf('return') !== -1,
    '⭐⭐ el código posterior a una división NO se borra — el error simétrico del arreglo');
  const tras = 'function f() {\n  return /ab/.test(s) ? 1 : 2;\n}\n';
  afirmar(balance(tras) === 0, 'y una regex después de `return` sí se reconoce como regex');
}

console.log('\n═══ E · control NEGATIVO — un desbalance REAL se detecta ═══');
{
  /* ⛔ Sin esto el banco no distingue «cierra en cero» de «el limpiador borró todo y no quedó
   * ninguna llave»: las dos dan balance 0. */
  const roto = 'function g() {\n  if (a) { return 1;\n}\n';
  afirmar(balance(roto) !== 0,
    '⭐⭐ un archivo con una llave de menos NO da cero (' + balance(roto) + ') — el control puede fallar');
}

console.log('\n═══ F · los dos instrumentos vuelven a correr ═══');
{
  const cp = require('child_process');
  let inv = true, esc = true;
  try { cp.execSync('node ' + JSON.stringify(path.join(RAIZ, 'tools/inventario.js')),
    { stdio: 'pipe', maxBuffer: 1e8 }); } catch (e) { inv = false; }
  try { cp.execSync('node ' + JSON.stringify(path.join(RAIZ, 'tools/escritores.js')),
    { stdio: 'pipe', maxBuffer: 1e8 }); } catch (e) { esc = false; }
  afirmar(inv, '`inventario.js` corre sin tirar');
  afirmar(esc, '`escritores.js` corre sin tirar — dependía del mismo limpiador');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
