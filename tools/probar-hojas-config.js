#!/usr/bin/env node
/**
 * tools/probar-hojas-config.js — **`HOJAS_CONFIG_` declara el esquema de todas las hojas, y un
 * comentario mal cerrado no puede comerse la mitad** (`2026-08-27`).
 *
 * ⛔⛔ **El bug que fija, medido el 27/08.** El commit `456a2b6` (22/08, `C-83`) abrió un bloque
 * `/* ... *` + `/` en `Instalar.gs:82` y **nunca lo cerró**: el siguiente `*` + `/` del archivo
 * estaba en la línea 245. **Diez de las dieciséis claves de `HOJAS_CONFIG_` quedaron adentro del
 * comentario** — `MARCADORES`, `MAPEO`, `SOLAPAS`, `CAMPANAS`, `PERIODOS`, `REUNIONES`,
 * `SECCIONES`, `VALORES`, `VALORES_DIVERGENTES` y `CORRIDAS`.
 *
 * **La consecuencia:** `aplicarInstalacion_` recorre `Object.keys(HOJAS_CONFIG_)`, así que desde
 * el 22/08 `instalar()` **no creaba ni reparaba esas diez hojas** — y como `COLUMNAS_DELTA_` se
 * aplica **dentro de ese mismo bucle**, sus deltas tampoco corrían. No falló nunca porque las diez
 * ya existen en la planilla viva: muerde en una planilla nueva, y mordió en silencio cada vez que
 * alguien declaró una columna nueva.
 *
 * ⛔⛔ **Por qué NO alcanza con un chequeo de sintaxis, que es lo primero que uno propone:** el
 * archivo roto **parseaba perfecto**. Un comentario que se come código es JavaScript válido. El
 * error apareció recién cuando alguien agregó otro `*` + `/` más abajo. **Un control de sintaxis
 * habría estado en verde los cinco días.** Se corre igual acá porque cubre otra clase de fallo,
 * pero **no es el control de este bug**.
 *
 * ⭐ **El control que sí lo caza es de CONTENIDO: las hojas de registro tienen que estar
 * declaradas.** Es la misma doctrina de `tools/listas.js` —*cuando la duplicación es el diseño, la
 * salida no es borrarla: es que el desajuste falle*— aplicada a una cuarta lista que nadie
 * comparaba. En el estado roto daba **4 de 11**.
 *
 * ⭐ **Y lo que lo hace funcionar es que el extractor IGNORA LOS COMENTARIOS.** Uno que matchee
 * sobre el texto crudo encuentra las diez claves comentadas y **da verde sobre el archivo roto** —
 * sería el control que no mide lo que dice medir, por cuarta vez esta semana. El caso negativo de
 * abajo existe exactamente para probar que no es ése.
 *
 * Uso:
 *   node tools/probar-hojas-config.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let pasadas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) { pasadas++; console.log('  ✅ ' + mensaje); }
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/**
 * Devuelve el texto con **comentarios y literales de cadena en blanco**, conservando los saltos de
 * línea para que los números de línea no se corran.
 *
 * ⚠ **Las cadenas también se neutralizan**, y no es exceso: un `'//'` adentro de un string haría
 * que el escáner se coma el resto de la línea. Es un escáner, no un parser — alcanza porque lo
 * único que se busca después es `  CLAVE: {` al principio de una línea.
 */
function sinComentarios(txt) {
  let out = '';
  let i = 0;
  const n = txt.length;
  while (i < n) {
    const c = txt[i];
    const d = txt[i + 1];
    if (c === '/' && d === '*') {
      out += '  '; i += 2;
      while (i < n && !(txt[i] === '*' && txt[i + 1] === '/')) { out += (txt[i] === '\n' ? '\n' : ' '); i++; }
      out += '  '; i += 2;
      continue;
    }
    if (c === '/' && d === '/') {
      out += '  '; i += 2;
      while (i < n && txt[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const cierre = c;
      out += ' '; i++;
      while (i < n && txt[i] !== cierre) {
        if (txt[i] === '\\') { out += '  '; i += 2; continue; }
        out += (txt[i] === '\n' ? '\n' : ' '); i++;
      }
      out += ' '; i++;
      continue;
    }
    out += c; i++;
  }
  return out;
}

/** Las claves de primer nivel de `HOJAS_CONFIG_`, sobre el texto ya sin comentarios. */
function clavesDeHojasConfig(txt) {
  const limpio = sinComentarios(txt);
  const ini = limpio.indexOf('var HOJAS_CONFIG_');
  if (ini === -1) return null;
  const abre = limpio.indexOf('{', ini);
  if (abre === -1) return null;
  let nivel = 0, fin = -1;
  for (let i = abre; i < limpio.length; i++) {
    if (limpio[i] === '{') nivel++;
    else if (limpio[i] === '}') { nivel--; if (nivel === 0) { fin = i; break; } }
  }
  if (fin === -1) return null;
  const bloque = limpio.slice(abre, fin);
  /* Sólo las de PRIMER nivel: dos espacios de sangría exactos. Un `headers:` anidado tiene cuatro
   * y además no matchea `[A-Z_]+`. */
  return [...bloque.matchAll(/\n {2}([A-Z_]+):\s*\{/g)].map((m) => m[1]);
}

/** Las hojas de registro que declara el motor, del mismo archivo y con el mismo criterio. */
function hojasDeRegistro(txt) {
  const limpio = sinComentarios(txt);
  const bloque = limpio.match(/var ALCANCE_REGISTROS_\s*=\s*\[([\s\S]*?)\n\];/);
  if (!bloque) return null;
  /* ⚠ `sinComentarios` blanquea las cadenas, así que acá el nombre de la hoja ya no está. Se
   * relee del texto ORIGINAL, que para esta lista es seguro: no hay `hoja:` comentada. */
  const crudo = txt.match(/var ALCANCE_REGISTROS_\s*=\s*\[([\s\S]*?)\n\];/);
  return [...crudo[1].matchAll(/hoja:\s*'([^']+)'/g)].map((m) => m[1]);
}

const RUTA_INSTALAR = path.join(RAIZ, 'Instalar.gs');
const FUENTE = fs.readFileSync(RUTA_INSTALAR, 'utf8');

console.log('\n═══ A · las hojas de registro están DECLARADAS en HOJAS_CONFIG_ ═══');
{
  const claves = clavesDeHojasConfig(FUENTE);
  const registro = hojasDeRegistro(FUENTE);
  afirmar(Array.isArray(claves) && claves.length > 0,
    'se pudo extraer HOJAS_CONFIG_ (' + (claves ? claves.length : 'null') + ' clave(s))');
  afirmar(Array.isArray(registro) && registro.length > 0,
    'se pudo extraer ALCANCE_REGISTROS_ (' + (registro ? registro.length : 'null') + ' hoja(s))');

  if (claves && registro) {
    const faltan = registro.filter((h) => claves.indexOf(h) === -1);
    /* ⭐ El conteo va en el mensaje: «ningún problema» y «no se probó nada» se ven idénticos en un
     * log sin `n de m` (`CLAUDE.md` §4). En el estado roto esto decía «4 de 11». */
    afirmar(faltan.length === 0,
      '⭐⭐ las ' + registro.length + ' hojas de registro tienen entrada: ' +
      (registro.length - faltan.length) + ' de ' + registro.length +
      (faltan.length ? ' — FALTAN: ' + faltan.join(', ') : ''));

    /* Las operativas no están en `ALCANCE_REGISTROS_` a propósito —nadie las siembra— pero sí
     * tienen que tener esquema, porque `hojaDeSalida_` las crea desde acá. */
    const operativas = ['VALORES', 'VALORES_DIVERGENTES', 'CORRIDAS', 'FALTANTES', 'FALTANTES_PREVIO'];
    const faltanOp = operativas.filter((h) => claves.indexOf(h) === -1);
    afirmar(faltanOp.length === 0,
      'y las ' + operativas.length + ' operativas también: ' + (operativas.length - faltanOp.length) +
      ' de ' + operativas.length + (faltanOp.length ? ' — FALTAN: ' + faltanOp.join(', ') : ''));
  }
}

console.log('\n═══ B · control negativo — con el comentario roto, A tiene que caer ═══');
{
  /* La mutación reabre el bug real: se le saca el `*` + `/` que cierra el bloque de `valor_fijo`.
   * ⚠ Se ubica por ÍNDICE y no por un patrón de dos líneas: el final de línea es del archivo
   * (CRLF) y no de quien escribe la prueba (`CLAUDE.md` §4). */
  const ancla = FUENTE.indexOf('devuelve `releido`. Ver `CLAUDE.md`');
  const cierre = ancla === -1 ? -1 : FUENTE.indexOf('*/', ancla);
  const roto = cierre === -1 ? FUENTE : (FUENTE.slice(0, cierre) + '* ' + FUENTE.slice(cierre + 2));

  /* ⭐ La guarda de que la mutación ocurrió. Sin esto, un ancla que no matchea deja el caso
   * corriendo sobre el archivo intacto y el rojo esperado nunca llega — se leería como que el
   * negativo pasó. */
  if (roto === FUENTE) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO se aplicó (no encontré el cierre del comentario de ' +
      '`valor_fijo`) — el caso negativo habría corrido sobre el código intacto');
  } else {
    const claves = clavesDeHojasConfig(roto);
    const registro = hojasDeRegistro(roto);
    const faltan = registro.filter((h) => claves.indexOf(h) === -1);
    afirmar(faltan.length > 0,
      '⛔ con el comentario sin cerrar, ' + faltan.length + ' hoja(s) de registro quedan sin ' +
      'declarar (' + faltan.join(', ') + ')');
    /* ⭐⭐ Y ésta es la afirmación que prueba que el extractor **no lee comentarios**. Sin ella,
     * un extractor que matcheara sobre el texto crudo daría verde en A **sobre el archivo roto**,
     * que es el control que no mide lo que dice medir. */
    afirmar(claves.length < 16,
      '⭐⭐ y HOJAS_CONFIG_ queda con ' + claves.length + ' clave(s) de 16 — o sea que el ' +
      'extractor IGNORA los comentarios, que es lo único que hace verdadero al control A');
  }
}

console.log('\n═══ B bis · ninguna clave repetida en COLUMNAS_DELTA_ ═══');
{
  /* ⛔⛔ `2026-08-27` — **una clave repetida en un objeto literal no se ve evaluándolo: la
   * segunda pisa a la primera y `Object.keys` devuelve UNA.** Pasó el mismo día: se agregó un
   * `REUNIONES: [{ id_cuenta }]` sin grepear, y `COLUMNAS_DELTA_.REUNIONES` **ya existía** con
   * `periodo_id`. El delta viejo desaparecía en silencio y nada fallaba — es `CLAUDE.md` §1
   * literal, el namespace global, aplicado a una clave de objeto.
   *
   * ⭐ **Por eso se cuenta sobre el TEXTO y no sobre el objeto.** Un control que evalúe mide el
   * resultado del pisado, o sea justo lo que hay que detectar. */
  const limpio = sinComentarios(FUENTE);
  const ini = limpio.indexOf('var COLUMNAS_DELTA_');
  const abre = limpio.indexOf('{', ini);
  let nivel = 0, fin = -1;
  for (let i = abre; i < limpio.length; i++) {
    if (limpio[i] === '{') nivel++;
    else if (limpio[i] === '}') { nivel--; if (nivel === 0) { fin = i; break; } }
  }
  const bloque = limpio.slice(abre, fin);
  const claves = [...bloque.matchAll(/\n {2}([A-Z_]+):\s*\[/g)].map((m) => m[1]);
  const repetidas = claves.filter((c, i) => claves.indexOf(c) !== i);
  afirmar(claves.length > 0, 'se pudo leer COLUMNAS_DELTA_ (' + claves.length + ' clave(s))');
  afirmar(repetidas.length === 0,
    '⭐⭐ ninguna clave repetida en las ' + claves.length +
    (repetidas.length ? ' — REPETIDAS: ' + [...new Set(repetidas)].join(', ') : ''));

  /* El negativo: se duplica una clave a propósito y el conteo tiene que acusarla. Sin esto, un
   * `matchAll` con el patrón mal escrito devolvería siempre cero repetidas y daría verde. */
  const mutado = FUENTE.replace('\r\n  BASES: [', '\r\n  BASES: [\r\n  ],\r\n  BASES: [');
  if (mutado === FUENTE) {
    fallas++;
    console.log('  ❌ ⛔ la mutación de clave duplicada NO se aplicó — el negativo habría ' +
      'corrido sobre el texto intacto');
  } else {
    const lim2 = sinComentarios(mutado);
    const i2 = lim2.indexOf('var COLUMNAS_DELTA_');
    const a2 = lim2.indexOf('{', i2);
    let n2 = 0, f2 = -1;
    for (let i = a2; i < lim2.length; i++) {
      if (lim2[i] === '{') n2++;
      else if (lim2[i] === '}') { n2--; if (n2 === 0) { f2 = i; break; } }
    }
    const c2 = [...lim2.slice(a2, f2).matchAll(/\n {2}([A-Z_]+):\s*\[/g)].map((m) => m[1]);
    afirmar(c2.filter((c, i) => c2.indexOf(c) !== i).length > 0,
      '⛔ con una clave duplicada a propósito, el control la acusa');
  }
}

console.log('\n═══ C · todos los .gs parsean ═══');
{
  /* ⚠ Cubre OTRA clase de fallo: un `*` + `/` de más, un paréntesis sin cerrar. **No habría
   * cazado el bug de arriba** —el archivo roto parseaba— y por eso va tercero y no primero. */
  const archivos = fs.readdirSync(RAIZ).filter((f) => /\.gs$/.test(f)).sort();
  const rotos = [];
  archivos.forEach((f) => {
    try { new vm.Script(fs.readFileSync(path.join(RAIZ, f), 'utf8'), { filename: f }); }
    catch (e) { rotos.push(f + ': ' + e.message); }
  });
  afirmar(archivos.length > 0, 'hay .gs que revisar (' + archivos.length + ')');
  afirmar(rotos.length === 0,
    'los ' + archivos.length + ' .gs parsean' + (rotos.length ? ' — ROTOS: ' + rotos.join(' | ') : ''));
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si los `headers` declarados son los CORRECTOS. Dice que la hoja está declarada.');
console.log('   · Si la hoja viva tiene esas columnas. Eso lo contesta un snapshot, no esto.');
console.log('   · ⛔ Nada sobre `COLUMNAS_DELTA_`: una hoja puede estar declarada acá y no tener');
console.log('     entrada de delta, y entonces `instalar()` le reescribe la fila 1.');

process.exit(fallas === 0 ? 0 : 1);
