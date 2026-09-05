#!/usr/bin/env node
/**
 * tools/probar-formato-desconocido.js — **Parte E del `2026-09-04_8`: un `formato` que la función
 * no conoce FALLA, no devuelve el valor sin formatear.**
 *
 * ⛔⛔ **El defecto que cierra:** `entero` no existía y `formatearValorMarcador_` caía a
 * `return String(valor)`, así que **seis filas publicaron el número crudo sin que nada lo
 * señalara**. Un error de configuración convertido en una salida plausible.
 *
 * ⭐⭐ **Este banco existe porque el cambio es INERTE hoy** —cero filas con formato desconocido tras
 * `formatoEmin()`— y **un cambio inerte no tiene testigo en producción**. Sin banco, nada prueba
 * que la guarda funcione hasta que alguien escriba el próximo nombre inventado.
 *
 * Uso:  node tools/probar-formato-desconocido.js
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

/* La función REAL, extraída — no una copia. */
const GEN = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
const ctx = {
  Utilities: { formatDate: (d, tz, f) => 'FECHA' },
  Session: { getScriptTimeZone: () => 'GMT-3' },
  parsearFechaCelda_: () => null
};
vm.createContext(ctx);
{
  const i = GEN.indexOf('function formatearValorMarcador_');
  vm.runInContext(GEN.slice(i, GEN.indexOf('\n}', i) + 2), ctx);
}
const F = ctx.formatearValorMarcador_;

console.log('═══ A · ⭐⭐ un formato desconocido FALLA visiblemente ═══');
{
  const r = F(541526, 'entero');
  afirmar(/^«FALTA:formato_desconocido:/.test(r), '`entero` → ' + r);
  afirmar(r.indexOf('entero') !== -1,
    '⭐ y el símbolo DICE CUÁL formato — el trabajo es corregir esa celda, y sin el nombre hay que buscarla');
  afirmar(F(1, '__inventado__').indexOf('__inventado__') !== -1, 'ídem con cualquier otro nombre');
  /* ⛔ Y lo que ya NO hace: devolver el crudo. */
  afirmar(F(541526, 'entero') !== '541526',
    '⛔⛔ y ya NO devuelve `541526` — que es lo que publicó seis filas sin que nada lo notara');
}

console.log('\n═══ B · ⭐ los SIETE formatos válidos siguen exactamente igual ═══');
{
  /* ⚠ La mitad negativa: sin esto, una guarda que fallara SIEMPRE pasaría la sección A. */
  const casos = [
    ['miles', 541526, '541.526'],
    ['numero', 3.14159, '3.14'],
    ['porcentaje', 18.3218, '18.3%'],
    ['porcentaje_sin_signo', 18.3218, '18.3'],
    ['fraccion', 0.2818, '28.2'],
    ['texto', 'hola', 'hola']
  ];
  casos.forEach(([f, v, esp]) => afirmar(F(v, f) === esp, '  `' + f + '` → ' + F(v, f)));
  afirmar(F('hola', '') === 'hola', '⭐ el formato VACÍO sigue cayendo a texto — está contemplado');
  afirmar(F(1, 'fecha') === 'FECHA' || typeof F(1, 'fecha') === 'string', '  `fecha` no rompe');
  /* ⭐⭐ Ninguno de los válidos puede dar el símbolo nuevo. */
  const validos = ['miles', 'numero', 'porcentaje', 'porcentaje_sin_signo', 'fraccion', 'texto', 'fecha', ''];
  afirmar(validos.every(f => String(F(100, f)).indexOf('formato_desconocido') === -1),
    '⭐⭐ NINGUNO de los ocho válidos produce `formato_desconocido`');
}

console.log('\n═══ C · ⚠ lo que deliberadamente NO cambió ═══');
{
  /* ⛔ Un dato NO numérico con formato numérico es un problema de la FUENTE, no de la
   * configuración. Meterlo en el mismo símbolo repetiría el error del `/////` que no distinguía
   * sus causas: dos causas distintas mandan a trabajos distintos. */
  afirmar(F('no-es-un-numero', 'miles') === 'no-es-un-numero',
    '⭐⭐ un valor NO numérico con formato numérico sigue devolviendo el crudo');
  afirmar(String(F('no-es-un-numero', 'miles')).indexOf('formato_desconocido') === -1,
    '⛔ y NO se confunde con formato desconocido — son dos causas y dos trabajos');
  /* ⭐ La guarda de vacío sigue PRIMERA (medido el 04/09, P1 del `_6`). */
  afirmar(F('', 'entero') === '', '⭐ el vacío sigue devolviendo `` — la guarda corre ANTES que todo');
  afirmar(F(null, '__inventado__') === '', '   y con `null` también, aun con formato inventado');
}

console.log('\n═══ D · el envoltorio `_revisar` sobre un formato desconocido ═══');
{
  const r = F(541526, 'entero_revisar');
  afirmar(/^-«FALTA:formato_desconocido:entero»-$/.test(r),
    '⚠ `entero_revisar` → ' + r + '  — los guiones envuelven el símbolo');
  /* ⭐ No es lindo, y es correcto: el `_revisar` es una capa de presentación y el formato base es
   * el que falló. Taparlo haría que un formato inventado con `_revisar` se viera distinto de uno
   * sin él, y son el mismo error. */
  afirmar(r.indexOf('formato_desconocido') !== -1,
    '⭐ y el símbolo sobrevive al envoltorio — un formato inventado se ve igual con o sin marca');
}

console.log('\n═══ E · control NEGATIVO — el banco PUEDE fallar ═══');
{
  /* ⛔ Se muta la función real quitándole la guarda, y se verifica que la mutación OCURRIÓ. */
  const i = GEN.indexOf('function formatearValorMarcador_');
  const fuente = GEN.slice(i, GEN.indexOf('\n}', i) + 2);
  const mutada = fuente.replace(
    "return '«FALTA:formato_desconocido:' + f + '»';", 'return String(valor);');
  afirmar(mutada !== fuente, '⭐⭐ la mutación OCURRIÓ — sin esto el negativo correría sobre el original');
  const c2 = { Utilities: ctx.Utilities, Session: ctx.Session, parsearFechaCelda_: () => null };
  vm.createContext(c2);
  vm.runInContext(mutada, c2);
  afirmar(c2.formatearValorMarcador_(541526, 'entero') === '541526',
    '⛔ con la guarda quitada vuelve `541526` ⇒ la sección A caería, así que mide la guarda');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
console.log('⚠ Lo que este verde NO dice: que hoy cambie alguna salida. **Es inerte** — el censo dio');
console.log('  0 desconocidos después de `formatoEmin()`. Prueba la GUARDA, no un arreglo.');
