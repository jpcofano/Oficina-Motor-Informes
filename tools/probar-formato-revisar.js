#!/usr/bin/env node
/**
 * tools/probar-formato-revisar.js — control positivo del sufijo `_revisar`
 * (`2026-08-19_1_camp_del_temario_al_deck.md`, Parte C), **fuera de Apps Script** y extrayendo
 * el código real del repo — mismo criterio que `tools/probar-tanda4.js`: una copia pegada acá
 * probaría la copia, y seguiría en verde sobre código que ya no existe.
 *
 * Qué prueba: que `formatearValorMarcador_` (`Generador.gs`) reconozca el sufijo `_revisar`
 * sobre cualquier formato base, resuelva el formato base normalmente y **envuelva el resultado
 * en guiones** — sin tocar el valor crudo ni el formato base cuando el sufijo no está.
 *
 * ⚠ **Premisa del prompt verificada y corregida:** el prompt ilustra `numero_revisar` sobre
 * `8.891…` como `-8,89-`, con coma. El código de `numero` es `String(Math.round(numero*100)/100)`
 * — **sin** `toLocaleString`, así que el separador decimal real es el punto de JS, no la coma
 * de es-AR. `Pruebas.gs:580` ya lo confirma para `numero` puro: `1234.567` da `'1234.57'`, con
 * punto. Esta prueba afirma el valor REAL (`-8.89-`), no la ilustración del prompt — copiar la
 * ilustración habría sido el mismo error que `CLAUDE.md` documenta para `operandosDeRatio_`: un
 * fixture deducido en vez de copiado de la salida real. `miles` sí usa `toLocaleString('es-AR')`
 * y ahí el punto es de MILES, no decimal, así que `3.042.983` coincide con el prompt.
 *
 * Uso:
 *   node tools/probar-formato-revisar.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/** Idéntica a la de `probar-tanda4.js` / `probar-encabezado.js`: cuenta llaves y **falla** si no
 * encuentra el nombre — así una función renombrada o borrada no deja pasar la prueba en silencio. */
function extraerFuncion(archivo, nombre) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  let i = texto.indexOf('{', inicio);
  if (i === -1) throw new Error('Función ' + nombre + ' sin cuerpo en ' + archivo);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, j + 1);
    }
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

const cuerpo = extraerFuncion('Generador.gs', 'formatearValorMarcador_');

// eslint-disable-next-line no-new-func
const M = new Function(cuerpo + '\nreturn { formatearValorMarcador_ };')();

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

console.log('Control positivo del sufijo `_revisar` — código extraído de Generador.gs\n');

/* ── 1 · `numero_revisar` envuelve en guiones el formato base ───────────────────────────────
 * Valor real, no la ilustración del prompt (ver nota de arriba): `8.891…` con `numero` da
 * `'8.89'` (punto), así que con `_revisar` tiene que dar `'-8.89-'`. */
console.log('1 · `numero_revisar`');
{
  const v = M.formatearValorMarcador_(8.891234, 'numero_revisar');
  afirmar(v === '-8.89-', '`numero_revisar` sobre 8.891… da `-8.89-` — vino ' + JSON.stringify(v));
}

/* ── 2 · `miles_revisar` — acá el prompt sí acierta, porque `miles` usa `toLocaleString('es-AR')`
 * y el punto que aparece es de MILES, no decimal. */
console.log('\n2 · `miles_revisar`');
{
  const v = M.formatearValorMarcador_(3042983, 'miles_revisar');
  afirmar(v === '-3.042.983-', '`miles_revisar` sobre 3042983 da `-3.042.983-` — vino ' + JSON.stringify(v));
}

/* ── 3 · el sufijo no rompe ninguno de los cinco formatos base ya existentes ─────────────────
 * `formatearValorMarcador_` tiene cinco ramas con formato propio además de `numero`/`miles`:
 * `texto`, `fecha` (no se prueba acá — depende de `Utilities`/`Session`, ajenos a Apps Script,
 * y no la toca este prompt), `porcentaje`, `fraccion` y `porcentaje_sin_signo`. Se prueban las
 * cuatro que corren fuera de Apps Script, más `numero` y `miles` ya cubiertas arriba: son los
 * "cinco formatos ya existentes" que pide el prompt (`texto`, `porcentaje`, `fraccion`,
 * `porcentaje_sin_signo`, y el implícito "sin formato" `''`). */
console.log('\n3 · el sufijo no rompe los formatos base ya existentes');
{
  const casos = [
    ['texto', 'hola', 'hola'],
    ['porcentaje', 26.4, '26.4%'],
    ['fraccion', 0.2818, '28.2'],
    ['porcentaje_sin_signo', 26.4, '26.4'],
    ['', 'crudo', 'crudo']
  ];
  for (const [formato, valor, esperadoBase] of casos) {
    const base = M.formatearValorMarcador_(valor, formato);
    afirmar(base === esperadoBase,
      '`' + (formato || '(vacío)') + '` sin sufijo sigue dando `' + esperadoBase + '` — vino ' + JSON.stringify(base));
    const revisar = formato
      ? M.formatearValorMarcador_(valor, formato + '_revisar')
      : null; // el formato vacío no tiene nombre para sufijar — no aplica
    if (revisar !== null) {
      afirmar(revisar === '-' + esperadoBase + '-',
        '`' + formato + '_revisar` envuelve en guiones sin alterar el valor — vino ' + JSON.stringify(revisar));
    }
  }
}

/* ── 4 · control negativo — SIN el sufijo, `numero` sigue sin guiones ────────────────────────
 * Sin este caso la prueba pasaría con una función que pusiera guiones siempre. */
console.log('\n4 · control negativo — `numero` (sin `_revisar`) no lleva guiones');
{
  const v = M.formatearValorMarcador_(8.891234, 'numero');
  afirmar(v === '8.89', '`numero` solo sigue dando `8.89`, SIN guiones — vino ' + JSON.stringify(v));
  afirmar(v.indexOf('-') === -1, 'y no contiene ningún guión');
}

/* ── 5 · el valor crudo no se toca — sólo cambia lo que se PINTA ─────────────────────────────
 * El comentario de `Generador.gs` lo declara: "el valor crudo no cambia, sigue siendo el que
 * se audita". Esta prueba no tiene forma de ver el crudo desde acá (vive en `VALORES`, fuera
 * de esta función), pero sí puede afirmar que la función no muta su primer argumento. */
console.log('\n5 · la función no muta el valor de entrada');
{
  const original = 8.891234;
  M.formatearValorMarcador_(original, 'numero_revisar');
  afirmar(original === 8.891234, 'el número pasado como argumento sigue siendo el mismo objeto/valor');
}

console.log('\n' + (fallas === 0
  ? '✅ Todo en verde. `_revisar` envuelve en guiones sin tocar el valor crudo ni los formatos base.'
  : '❌ ' + fallas + ' afirmación(es) fallando.'));
process.exit(fallas === 0 ? 0 : 1);
