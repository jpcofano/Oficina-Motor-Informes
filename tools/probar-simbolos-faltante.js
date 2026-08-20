#!/usr/bin/env node
/**
 * tools/probar-simbolos-faltante.js — control positivo de los cuatro símbolos del deck
 * (`docs/Prompts/2026-08-20_1_cuatro_simbolos.md`, Parte B), **fuera de Apps Script** y
 * extrayendo el código real del repo.
 *
 * Mismo criterio que `tools/probar-formato-revisar.js` y `tools/probar-tanda4.js`: una copia
 * pegada acá probaría la copia, y seguiría en verde sobre código que ya no existe.
 * `extraerFuncion` **falla** si el nombre no está, así que un renombre no pasa en silencio.
 *
 * Qué prueba: que `textoFaltante_` (`Generador.gs`) elija el símbolo **a partir del estado del
 * marcador y de la existencia de la fila**, y no de un booleano.
 *
 *   `/////`  falta el token — sin fila en `MARCADORES`, o el motor no llegó a resolverlo
 *   `---`    falló        — hay fila, se intentó leer y no salió (`error` · `REVISAR`)
 *   `-`      no hay dato  — se preguntó bien y la respuesta fue vacía (`sin_datos`)
 *
 * ⚠ **Por qué `sin fila → /////` y `error → ---` van como afirmaciones SEPARADAS** (Parte B
 * punto 1): un mapeo que devolviera `---` para todo pasaría un control que sólo mire `error`.
 * El fixture tiene que distinguir las dos, no confirmar una.
 *
 * ⚠ **El dudoso `-8.89-` se prueba acá aunque no sea de este cambio**, y con el valor REAL:
 * `numero` es `String(Math.round(n*100)/100)` y **no** pasa por `toLocaleString`, así que el
 * separador es el punto de JS. La ilustración con coma es un error de redacción de prompt que
 * ya entró dos veces por el mismo camino, y está documentado en el encabezado de
 * `probar-formato-revisar.js`. Va acá porque `-8.89-` y `-` conviven en la misma lámina y se
 * parecen lo suficiente como para que alguien los unifique después.
 *
 * Uso:
 *   node tools/probar-simbolos-faltante.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/** Idéntica a la de `probar-formato-revisar.js`: cuenta llaves y **falla** si no encuentra el
 * nombre — así una función renombrada o borrada no deja pasar la prueba en silencio. */
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

const cuerpo = extraerFuncion('Generador.gs', 'textoFaltante_') + '\n' +
  extraerFuncion('Generador.gs', 'formatearValorMarcador_');

// eslint-disable-next-line no-new-func
const M = new Function(cuerpo + '\nreturn { textoFaltante_, formatearValorMarcador_ };')();

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  OK  ' + mensaje);
  else { fallas++; console.log('  XX  ' + mensaje); }
}

const SIM = true;   // modo símbolos
const CRUDO = false;

console.log('Control positivo de los cuatro símbolos — código extraído de Generador.gs\n');

/* ── 1 · los cuatro casos dan cuatro salidas, cada uno con su afirmación propia ───────────── */
console.log('1 · los cuatro casos, uno por uno');
{
  // Estrella: `sin fila` y `error` van separados a propósito. Son las dos que un mapeo perezoso
  // colapsaría, y son justo las que deciden **quién arregla qué**.
  const sinFila = M.textoFaltante_('enc_total', undefined, SIM);
  afirmar(sinFila === '/////',
    'sin fila en MARCADORES da /////  (trabajo de cableado) — vino ' + JSON.stringify(sinFila));

  const error = M.textoFaltante_('enc_total', { estado: 'error' }, SIM);
  afirmar(error === '---',
    'estado error da ---  (trabajo de fuente o de filtro) — vino ' + JSON.stringify(error));

  const sinDatos = M.textoFaltante_('enc_total', { estado: 'sin_datos' }, SIM);
  afirmar(sinDatos === '-',
    'estado sin_datos da -  (se preguntó bien y no había) — vino ' + JSON.stringify(sinDatos));

  // Y las tres son DISTINTAS entre sí. Sin esta afirmación, tres constantes iguales pasarían
  // las tres de arriba por separado.
  afirmar(new Set([sinFila, error, sinDatos]).size === 3,
    'los tres símbolos son distintos entre sí — un mapeo que devolviera lo mismo no pasa');
}

/* ── 2 · `REVISAR` va a `---`, y es el caso que más fácil se confunde con `sin_datos` ───────
 * `R-18` addendum 1: `sin_datos` **afirma que no había nada**. `REVISAR` es lo contrario —
 * había filas y ninguna se pudo publicar. Escribirlo `-` publicaría esa afirmación falsa. */
console.log('\n2 · REVISAR no es sin_datos');
{
  const revisar = M.textoFaltante_('ecv_barrios', { estado: 'REVISAR' }, SIM);
  afirmar(revisar === '---',
    'REVISAR da ---, porque hubo filas y ninguna se pudo publicar — vino ' + JSON.stringify(revisar));
  afirmar(revisar !== M.textoFaltante_('ecv_barrios', { estado: 'sin_datos' }, SIM),
    'y NO coincide con sin_datos, que afirmaría que no había nada — R-18 addendum 1');
}

/* ── 3 · sin estado y sin fila da `/////`. El caso de la barrida final ──────────────────────
 * La barrida sólo tiene el nombre del token: por diseño no recibe resultado, porque un token
 * que barre es uno que la corrida NO llegó a resolver. Su único símbolo posible es `/////`. */
console.log('\n3 · el caso de la barrida — sin información suficiente');
{
  afirmar(M.textoFaltante_('camp_alcance', null, SIM) === '/////',
    'null como resultado da /////  (es lo que pasa la barrida)');
  afirmar(M.textoFaltante_('camp_alcance', undefined, SIM) === '/////',
    'undefined como resultado da /////');
  afirmar(M.textoFaltante_('camp_alcance', {}, SIM) === '/////',
    'un resultado sin estado da /////, no se le adivina uno');

  // La regla escrita: ante ausencia de información el símbolo es el MÁS RUIDOSO, nunca `-`.
  // `-` es una afirmación *sobre el dato*, y quien no tiene el resultado no puede hacerla.
  [null, undefined, {}, { estado: '' }, { estado: 'un_quinto_estado' }].forEach(function (r) {
    afirmar(M.textoFaltante_('t', r, SIM) !== '-',
      'sin información suficiente NUNCA sale - — probado con ' + JSON.stringify(r));
  });

  // Un quinto estado que esta función no conozca cae en `/////` y no se lo inventa.
  afirmar(M.textoFaltante_('t', { estado: 'un_quinto_estado' }, SIM) === '/////',
    'un estado desconocido da /////, no un símbolo inventado');
}

/* ── 4 · modo crudo da `«FALTA:token»` en los cuatro, con el token adentro ──────────────────
 * `S-05` punto 3 sigue vivo porque el crudo no se retira: lo que entró es un modo, no un
 * reemplazo. Nada de mezclar — o los cuatro símbolos, o el crudo. */
console.log('\n4 · el modo crudo se conserva entero');
{
  const casos = [
    ['sin fila', undefined],
    ['error', { estado: 'error' }],
    ['REVISAR', { estado: 'REVISAR' }],
    ['sin_datos', { estado: 'sin_datos' }]
  ];
  const esperado = '«FALTA:enc_audiencia»';
  casos.forEach(function (par) {
    const v = M.textoFaltante_('enc_audiencia', par[1], CRUDO);
    afirmar(v === esperado,
      'crudo · ' + par[0] + ' da el aviso con el token adentro — vino ' + JSON.stringify(v));
  });

  // El token viaja de verdad: dos tokens distintos dan dos textos distintos.
  afirmar(M.textoFaltante_('a', undefined, CRUDO) !== M.textoFaltante_('b', undefined, CRUDO),
    'y el token va adentro del texto, no es una constante');

  // El modo se enciende con `=== true` y no con truthy: la opción entra desde un `<select>`,
  // desde un JSON de la API y desde una llamada a mano, y un `"false"` de query string es truthy.
  afirmar(M.textoFaltante_('t', { estado: 'error' }, 'true') === '«FALTA:t»',
    'un "true" de texto NO enciende los símbolos — el modo es === true');
  afirmar(M.textoFaltante_('t', { estado: 'error' }, 1) === '«FALTA:t»',
    'ni un 1 — mismo criterio');
}

/* ── 5 · el dudoso no se toca ───────────────────────────────────────────────────────────────
 * Es del formateador de valores, no de acá, y por eso un valor dudoso **no pasa nunca** por
 * `textoFaltante_`. Se prueba igual porque los dos glifos conviven en la misma lámina. */
console.log('\n5 · el dudoso -8.89- sigue siendo del formateador, y con punto');
{
  const v = M.formatearValorMarcador_(8.891234, 'numero_revisar');
  afirmar(v === '-8.89-',
    'numero_revisar sobre 8.891... sigue dando -8.89-, CON PUNTO — vino ' + JSON.stringify(v));
  afirmar(v.indexOf(',') === -1,
    'y sin coma: numero no pasa por toLocaleString (el separador decimal NO se arregla acá)');

  // Y lo que hace que valga la pena tenerlo en este archivo: `-8.89-` y `-` son distintos.
  // Se parecen lo suficiente como para que alguien los unifique después.
  afirmar(v !== M.textoFaltante_('t', { estado: 'sin_datos' }, SIM),
    'el dudoso -8.89- y el - de sin_datos son dos cosas distintas y no se unifican');
}

console.log('\n' + (fallas === 0
  ? 'TODO EN VERDE. El símbolo sale del estado y de la existencia de la fila, no de un booleano.'
  : 'FALLAN ' + fallas + ' afirmacion(es).'));
process.exit(fallas === 0 ? 0 : 1);
