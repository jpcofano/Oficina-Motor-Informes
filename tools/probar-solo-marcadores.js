#!/usr/bin/env node
/**
 * tools/probar-solo-marcadores.js — **la pasada por ítem resuelve sólo los marcadores de SU lámina**
 * (`docs/AUDITORIA_tiempos_2026-08-21.md`, salida A).
 *
 * ⭐ **El número que lo justifica, y está medido, no supuesto:** `resolverMarcadores('secco')` —que
 * tiene **cero** marcadores cableados— tarda **0,000 s** tibio, y `jm` con 111 tarda **19,9 s**.
 * **Costo fijo por llamada: cero. Por marcador: 0,18 s.** Una asignación con 15 marcadores en vez de
 * 111 pasa de 19,9 s a **2,7 s** — el 86 %.
 *
 * ⚠ **Y por eso este control mira DOS cosas y no una:** que el filtro filtre, y que **el llamador lo
 * use**. Un `solo_marcadores` perfecto que nadie pasa deja el bucle exactamente igual de lento —
 * es la misma familia que la columna declarada sin lector.
 *
 * Uso:
 *   node tools/probar-solo-marcadores.js
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

/** El código de un `.gs` sin comentarios: los comentarios citan el patrón viejo para explicarlo. */
function codigoDe(archivo) {
  return fs.readFileSync(path.join(RAIZ, archivo), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
}

console.log('Resolver sólo los marcadores de la lámina — código cargado de Generador.gs\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · ⭐ El filtro filtra, y el ausente sigue significando «todos»
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Se carga `resolverMarcadores` REAL con `leerMarcadores_` falseada — 111 filas como hoy — y se
 * corta apenas hecho el filtro: lo que se mide es **a cuántos llega**, no qué valor devuelve. */
function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },
    /* 111 marcadores de `jm`, como la hoja hoy.
     *
     * ⚠ **Se falsea `memoRegistro_` y NO `leerMarcadores_`, y es la diferencia entre medir y no
     * medir:** `leerMarcadores_` está **declarada en `Generador.gs`**, así que al cargar el archivo
     * su declaración **pisa el stub del contexto** y el falseo se pierde en silencio. `memoRegistro_`
     * vive en `Config.gs`, que este banco no carga, así que ahí el stub sobrevive. */
    memoRegistro_: (nombre) => (nombre === 'MARCADORES'
      ? Array.from({ length: 111 }, (_, i) => ({
          marcador: 'm' + i, informe_id: 'jm', base_id: 'x', solapa: 'y',
          campo_logico: 'c', operacion: 'ULTIMO', filtro: '', dimensiones: '', formato: ''
        }))
      : []),
    // Se aborta apenas empieza a resolver: la cuenta ya está hecha.
    datosDeMarcador_: () => { throw new Error('__CORTE__'); }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) texto = parchear(texto);
  /* Se instrumenta el punto exacto donde el filtro termina, para contar **sin** ejecutar la
   * resolución.
   *
   * ⚠ **Por regex y no por texto literal, y costó un rojo descubrirlo:** los `.gs` están en disco
   * con **CRLF** —git los convierte al hacer checkout— así que un patrón con `\n` **no matchea** y
   * la instrumentación **se saltea en silencio**. El control fallaba por su propia causa, no por
   * el código que mide. */
  const antes = texto;
  texto = texto.replace(/ {2}var cache = \{\};\r?\n {2}var resultados = delInforme\.map\(/,
    '  __CUANTOS = delInforme.length; throw new Error("__CONTADO__");\n  var cache = {};\n  var resultados = delInforme.map(');
  if (texto === antes) {
    // ⛔ Y si algún día deja de matchear, se dice — no se mide cero en silencio.
    throw new Error('No se pudo instrumentar `resolverMarcadores`: el punto de conteo cambió. ' +
      'Este control no puede medir nada así.');
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  return ctx;
}

console.log('1 · el filtro `solo_marcadores`');
{
  const ctx = contexto();
  const cuantos = (op) => {
    ctx.__op = op;
    try { vm.runInContext('resolverMarcadores("jm", __op)', ctx); } catch (e) { /* el corte */ }
    return vm.runInContext('__CUANTOS', ctx);
  };

  afirmar(cuantos({}) === 111, 'sin la opción se resuelven los 111 — «ausente = todos» no cambió');
  afirmar(cuantos({ solo_marcadores: [] }) === 111,
    'con una lista VACÍA también los 111 — vacío no es «ninguno», es «no pidió nada»');
  afirmar(cuantos({ solo_marcadores: ['m3', 'm7', 'm50'] }) === 3,
    'con tres tokens se resuelven 3, no 111');
  afirmar(cuantos({ solo_marcadores: ['m3', 'periodo', 'no_existe'] }) === 1,
    'y un token sin fila —`periodo`— no inventa nada: quedan los que existen');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐ El llamador lo usa — que es lo que de verdad ahorra
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · la pasada por ítem lo pasa');
{
  const gen = codigoDe('Generador.gs');

  afirmar(/opcionesItem\.solo_marcadores = tokensDeEstaSlide;/.test(gen),
    'el bucle arma `opcionesItem.solo_marcadores` con los tokens de la slide');
  afirmar(/resolverMarcadores\(informeId, opcionesItem\)/.test(gen),
    'y se lo pasa a `resolverMarcadores` — sin esto el filtro no ahorra nada');
  afirmar(!/resolverMarcadores\(informeId, asignacion\.item\.opciones\)/.test(gen),
    'ya no queda la llamada vieja que resolvía el informe entero');

  // ⚠ Y no se pisan las opciones del ítem: `id_cuenta` y `fila_rdv` son lo que hace correcto el número.
  afirmar(/opcionesItem\[k\] = asignacion\.item\.opciones\[k\];/.test(gen),
    'las `opciones` del ítem se COPIAN, no se pisan — `id_cuenta` y `fila_rdv` siguen viajando');

  /* Una sola llamada a `tokensDeSlide_` y sirve para resolver y para pintar.
   *
   * ⚠ **`function ` adelante, y no es cosmético:** el patrón sin él cuenta también **la
   * declaración** de la función —`function tokensDeSlide_(slide) {`— y daba 2 con el código ya
   * correcto. El control fallaba por su propio patrón, no por lo que mide. */
  const llamadas = (gen.match(/(?<!function )tokensDeSlide_\(slide\)/g) || []).length;
  afirmar(llamadas === 1,
    'y `tokensDeSlide_(slide)` se LLAMA una sola vez, y sirve para resolver y para pintar (' +
    llamadas + ')');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⚠ Romper a propósito
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · romper a propósito: sin el filtro, vuelven los 111');
{
  const ctx = contexto((t) => t.replace(
    '  if (opciones.solo_marcadores && opciones.solo_marcadores.length) {',
    '  if (false) {   // ROTO A PROPÓSITO'));
  ctx.__op = { solo_marcadores: ['m3', 'm7', 'm50'] };
  try { vm.runInContext('resolverMarcadores("jm", __op)', ctx); } catch (e) { /* el corte */ }
  const n = vm.runInContext('__CUANTOS', ctx);
  afirmar(n === 111, 'con el filtro anulado se resuelven los 111 pese a pedir 3 — la afirmación 1 cae');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · La aritmética del ahorro, con los números medidos
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * ⚠ No mide el motor: comprueba que la cuenta que justifica el cambio cierre. Si alguien cambia
 * los números medidos sin rehacer la cuenta, esto lo dice. */
console.log('\n4 · la aritmética, con lo medido el 21/08');
{
  const FIJO = 0.0;            // resolverMarcadores('secco'), 0 marcadores, tibio
  const POR_MARCADOR = 0.18;   // (19,945 − 0) / 111
  const ASIGNACIONES = 22;     // campana 2×9 + encuentro 2×2
  const UTIL = 320;            // techo 350 − reserva 30

  const antes = ASIGNACIONES * (FIJO + POR_MARCADOR * 111);
  const despues = ASIGNACIONES * (FIJO + POR_MARCADOR * 15);

  afirmar(Math.abs(POR_MARCADOR * 111 - 19.95) < 0.3,
    'el costo por marcador × 111 reproduce los 19,9 s medidos para `jm`');
  afirmar(antes > UTIL,
    'la etapa 3 SIN el cambio no entra: ' + Math.round(antes) + ' s contra ' + UTIL + ' útiles');
  afirmar(despues + 85 < UTIL,
    'y CON el cambio entra con margen: ' + Math.round(despues) + ' s + 85 de las etapas 1 y 2 = ' +
    Math.round(despues + 85) + ' s');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Cuánto tarda de verdad la próxima corrida. La aritmética del bloque 4 usa números');
console.log('     medidos el 21/08 sobre 111 marcadores; el que manda es el rastro de la corrida.');
console.log('   · Que los números publicados no cambien. El filtro elige QUÉ se resuelve, no CÓMO —');
console.log('     pero eso hay que verlo en un deck, no acá.');
console.log('   · ⚠ `resumen` ahora cuenta los marcadores de la lámina y no los del informe. Es más');
console.log('     correcto y está declarado, pero el número del reporte CAMBIA.');

process.exit(fallas === 0 ? 0 : 1);
