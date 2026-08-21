#!/usr/bin/env node
/**
 * tools/probar-modo-faltantes.js — **el modo de los huecos tiene un default y un solo lector**
 * (`docs/Prompts/2026-08-21_5_modo_faltantes_un_solo_lugar.md`, Parte B), fuera de Apps Script y
 * cargando `Generador.gs` tal cual — mismo criterio que `probar-reloj-etapas.js`.
 *
 * ⭐ **Qué se rompió y por qué hacía falta un control.** El modo salía de
 * `opciones.faltantes_como_raya === true`, y `undefined === true` es `false`: **el default real era
 * el crudo y no lo había elegido nadie**. Medido el 21/08, de los cuatro llamadores de
 * `generarInforme` **dos no pasaban la opción** —el ítem de menú y la ejecución 1 de la corrida
 * desatendida—, así que sus decks salían en crudo por omisión. El caso peor era la desatendida:
 * ejecución 1 en crudo y continuaciones en símbolos, **sobre el mismo deck**.
 *
 * ⚠ **Y lo que este control tiene que proteger además del arreglo:** el `=== true` era una guarda
 * deliberada contra el `"false"` de un query string, que **es truthy**. Un arreglo que aflojara la
 * guarda cambiaría un bug por el otro. Por eso el bloque 3 existe y no es opcional.
 *
 * Uso:
 *   node tools/probar-modo-faltantes.js
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

/** Carga `Generador.gs` con un `CONFIG` falso. `defecto` es lo que dice la hoja. */
function contexto(defecto, fuenteOpcional) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },
    leerConfig: () => (defecto === undefined ? {} : { presentacion_faltantes_defecto: defecto })
  };
  vm.createContext(ctx);
  const texto = fuenteOpcional !== undefined
    ? fuenteOpcional
    : fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  return ctx;
}

/** `modoFaltantesDe_(opciones)` sobre un contexto dado. */
function modo(ctx, opciones) {
  ctx.__op = opciones;
  return vm.runInContext('modoFaltantesDe_(__op)', ctx);
}

console.log('Modo de faltantes — código cargado de Generador.gs\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · ⭐ Un llamador que NO pasa la opción recibe el default de CONFIG
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Es el caso que fallaba: el ítem de menú llama `generarInforme(informeId)` a secas. */
console.log('1 · sin opción, manda el default de CONFIG');
{
  const conSimbolos = contexto('simbolos');
  const enCrudo = contexto('crudo');

  // Las tres formas de "no vino", que son distintas y tienen que dar lo mismo.
  [{}, { continuable: true }, { faltantes_como_raya: undefined }, { faltantes_como_raya: null },
   { faltantes_como_raya: '' }].forEach((op, i) => {
    const r = modo(conSimbolos, op);
    afirmar(r.simbolos === true,
      'forma ' + (i + 1) + ' de «no vino» → símbolos, como dice CONFIG');
  });

  // Y el default se lee de verdad: con la hoja en `crudo`, el mismo llamador sale en crudo.
  const r = modo(enCrudo, {});
  afirmar(r.simbolos === false,
    'con CONFIG en `crudo`, el mismo llamador sale en crudo — el default se LEE, no está fijo');

  // Sin clave en CONFIG cae al default del código, que son los símbolos.
  afirmar(modo(contexto(undefined), {}).simbolos === true,
    'sin la clave en CONFIG, cae al default del código (símbolos)');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · El llamador que la pasa gana sobre el default, en los DOS sentidos
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Un solo sentido no alcanza: una implementación que devolviera siempre el default pasaría la
 * mitad de las afirmaciones sin que nadie lo note. */
console.log('\n2 · el pedido explícito gana sobre el default, en los dos sentidos');
{
  afirmar(modo(contexto('crudo'), { faltantes_como_raya: true }).simbolos === true,
    'CONFIG dice crudo y el llamador pide símbolos → símbolos');
  afirmar(modo(contexto('simbolos'), { faltantes_como_raya: false }).simbolos === false,
    'CONFIG dice símbolos y el llamador pide crudo → crudo');

  afirmar(modo(contexto('crudo'), { faltantes_como_raya: true }).origen === 'lo pidió el llamador',
    'y el origen lo dice: "lo pidió el llamador"');
  afirmar(modo(contexto('crudo'), {}).origen.indexOf('default') !== -1,
    'contra "default de CONFIG…" cuando no lo pidió');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⚠ La guarda del query string sigue viva
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * `"false"` como STRING es truthy en JS. El `=== true` original existía para que eso no
 * encendiera el modo, y un arreglo que aflojara la guarda cambiaría un bug por el otro. */
console.log('\n3 · el "false" de un query string NO enciende los símbolos');
{
  const ctx = contexto('crudo');
  afirmar(modo(ctx, { faltantes_como_raya: 'false' }).simbolos === false,
    'el string "false" → crudo, no símbolos (era el bug que el `=== true` evitaba)');
  afirmar(modo(ctx, { faltantes_como_raya: '0' }).simbolos === false, 'el string "0" → crudo');
  afirmar(modo(ctx, { faltantes_como_raya: 'no' }).simbolos === false, 'el string "no" → crudo');

  // Y el otro sentido, que el `=== true` sí se equivocaba: "true" como texto significaba crudo.
  afirmar(modo(ctx, { faltantes_como_raya: 'true' }).simbolos === true,
    'el string "true" → símbolos (con `=== true` daba crudo, que era lo contrario de lo pedido)');
  afirmar(modo(ctx, { faltantes_como_raya: 'sí' }).simbolos === true, 'el string "sí" → símbolos');

  // Un texto que nadie reconoce NO se adivina: cae al default y lo dice.
  const raro = modo(contexto('simbolos'), { faltantes_como_raya: 'quizás' });
  afirmar(raro.simbolos === true, 'un texto no reconocido cae al default');
  afirmar(raro.origen.indexOf('no se reconoce') !== -1,
    'y el origen lo AVISA en vez de tragárselo: «' + raro.origen.slice(0, 60) + '…»');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · ⚠ Romper a propósito
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Se vuelve el lector al `=== true` de antes y se verifica que caiga la afirmación 1. Si no
 * cae, este control no mide lo que dice. */
console.log('\n4 · romper a propósito: con el `=== true` de antes, el default deja de aplicarse');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const buena = '  var pedido = normalizarModoFaltantes_(opciones.faltantes_como_raya);';
  const rota = '  var pedido = opciones.faltantes_como_raya === true;';

  if (texto.indexOf(buena) === -1) {
    fallas++;
    console.log('  ❌ no encontré la línea del lector — si se reescribió, esta prueba tiene que enterarse:');
    console.log('     ' + buena);
  } else {
    const ctx = contexto('simbolos', texto.replace(buena, rota));
    const r = modo(ctx, {});
    afirmar(r.simbolos === false,
      'con el lector viejo, un llamador sin opción vuelve a salir en CRUDO pese al default');
    afirmar(modo(ctx, { faltantes_como_raya: 'true' }).simbolos === false,
      'y el string "true" vuelve a significar crudo — el bug simétrico, también del lector viejo');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Los cuatro llamadores, sobre el fuente
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * El punto del arreglo es que un llamador **no tenga que** pasar la opción. Esto afirma que la
 * decisión ya no vive en ellos: ninguno computa el modo por su cuenta. */
console.log('\n5 · la decisión no vive en los llamadores');
{
  /* ⚠ **Se comparan LÍNEAS DE CÓDIGO, no el texto del archivo, y el primer intento lo aprendió
   * a los golpes:** la afirmación de abajo busca el patrón viejo y salió roja — los dos aciertos
   * estaban **en comentarios**, que citan `opciones.faltantes_como_raya === true` justamente para
   * explicar qué se cambió. Un instrumento que mide código mirando texto **no puede distinguir el
   * código de su explicación**, y la salida fácil —borrar la afirmación— habría perdido el
   * control. */
  const sinComentarios = (texto) => texto
    .replace(/\/\*[\s\S]*?\*\//g, '')                       // comentarios de bloque
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');   // y de línea

  const gen = sinComentarios(fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8'));
  const des = sinComentarios(fs.readFileSync(path.join(RAIZ, 'Desatendida.gs'), 'utf8'));
  const pan = sinComentarios(fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8'));

  afirmar(gen.indexOf('opciones.faltantes_como_raya === true') === -1,
    'ya no queda ningún `opciones.faltantes_como_raya === true` en el CÓDIGO de Generador.gs');

  // Control negativo del despojador: sobre el texto entero SÍ aparece —en los comentarios—, y
  // eso prueba que la afirmación de arriba mide algo y no está pasando por vacía.
  afirmar(fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8')
    .indexOf('opciones.faltantes_como_raya === true') !== -1,
    'y el patrón viejo SÍ sigue en los comentarios, que es donde tiene que estar: explicando');
  afirmar((gen.match(/modoFaltantesDe_\(/g) || []).length >= 2,
    'y `modoFaltantesDe_` es el lector: se define y se usa');

  // ⭐ La desatendida hereda el modo MEDIDO en la ejecución 1, no uno afirmado a mano.
  afirmar(des.indexOf("con_simbolos: r.presentacion_faltantes === 'simbolos'") !== -1,
    'la desatendida guarda el modo que la ejecución 1 usó de verdad, no un `true` fijo');
  afirmar(des.indexOf('con_simbolos: true,') === -1,
    'y ya no queda el `con_simbolos: true` que hacía divergir las dos mitades del mismo deck');

  // El panel sigue mandando lo suyo: el default no le saca la decisión a quien sí la toma.
  afirmar(pan.indexOf('faltantes_como_raya: conSimbolos === true') !== -1,
    'el panel sigue mandando su checkbox — el default no le pisa la elección a quien elige');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Qué dice `CONFIG.presentacion_faltantes_defecto` en la hoja viva. Acá va falseado');
console.log('     para recorrer los casos, y el seed sólo completa celdas vacías.');
console.log('   · Cómo se ve un hueco en el deck: `textoFaltante_` y el juego de símbolos no se');
console.log('     tocaron, y este control no los mira.');

process.exit(fallas === 0 ? 0 : 1);
