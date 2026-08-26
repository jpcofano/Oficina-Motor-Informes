#!/usr/bin/env node
/**
 * tools/probar-totales-u1.js — el control de los TRES totales del "1 a 1" (`L-053`).
 *
 * ⭐⭐ **La afirmación que da nombre a esto: los tres totales llevan el MISMO corte.**
 * Hasta el 26/08/2026 llevaban **tres cortes distintos** —`u1_total_clics` sólo PRE,
 * `u1_total_vistas` sólo POST, `u1_total_impresiones` las dos (`R-28`)— **y nada lo detectaba**.
 * Uno estaba bien, uno estaba mal y uno acertaba por accidente. Las tres cosas se ven igual en un
 * deck.
 *
 * ⭐ **Y la que hace que este banco sirva de verdad es la del acierto por accidente.**
 * `u1_total_vistas` con `etapa=post` y con el corte vacío **dan exactamente el mismo número** sobre
 * `3487-AGOJDGAG`, porque las dos filas PRE de esa cuenta traen `0` visualizaciones. O sea: **el
 * corte equivocado no producía ningún síntoma**. El caso 5 lo demuestra con los datos reales, y el
 * caso 6 muestra con una fila sintética que en cuanto una PRE lleve video los dos números se
 * separan — que es el día en que el corte viejo habría empezado a publicar mal, en silencio.
 *
 * ⛔ **De dónde salen los números, y por qué de ahí:** de la tabla de evidencia de `R-28` en
 * `docs/REGLAS_NEGOCIO.md`, que **está en git**. El fixture del que se midieron —`Seguimiento
 * Digital  2026-08-20.zip`— **no está** (`C-21`), así que un banco que lo abriera fallaría en
 * cualquier otra máquina. La regla quedó derogada por `R-33`; **su tabla de evidencia no**, porque
 * `REGLAS_NEGOCIO.md` es append-only y una derogación no borra lo que se midió.
 *
 * ⚠ **Qué mide cada mitad, porque son dos y sólo una toca el motor** (`CLAUDE.md` §4):
 *   - los casos 1-4 leen **el código real** (`Instalar.gs`, `Fuentes.gs`) — miden el motor;
 *   - los casos 5-7 hacen la aritmética de la **definición del negocio** sobre la tabla de `R-28`
 *     — **no** reproducen lógica del motor, reproducen la definición. Se dice acá para que nadie
 *     lea el verde como *"el motor suma bien"*: eso lo dice una corrida.
 *
 * ⚠ **Lo que NO contesta:** si el número publicado es el que el equipo espera. `R-33` **deroga a
 * propósito** el criterio del deck del equipo, que publicó `1.472`. Que el motor publique `2.464`
 * es el resultado buscado, no un hallazgo.
 *
 * Uso:
 *   node tools/probar-totales-u1.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const FUENTES = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
const GENERADOR = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
const REGLAS = fs.readFileSync(path.join(RAIZ, 'docs', 'REGLAS_NEGOCIO.md'), 'utf8');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const SALTO = String.fromCharCode(10);
const BARRA = String.fromCharCode(92);

/**
 * Balancea delimitadores desde `desde` **salteando cadenas y comentarios**.
 *
 * ⚠ Sin el salteo esto no sirve en este repo: los comentarios de `DIMENSIONES_` traen paréntesis,
 * comillas y apóstrofes castellanos, y cualquiera de los tres desbalancea un contador ingenuo.
 * Es la misma rutina que usa `tools/probar-desglose-plataforma.js`.
 */
function balancear(texto, desde, archivo, que) {
  let nivel = 0, arranco = false, comilla = null, comentario = null;
  for (let j = desde; j < texto.length; j++) {
    const c = texto[j], sig = texto[j + 1];
    if (comentario === 'linea') { if (c === SALTO) comentario = null; continue; }
    if (comentario === 'bloque') { if (c === '*' && sig === '/') { comentario = null; j++; } continue; }
    if (comilla) {
      if (c === BARRA) { j++; continue; }
      if (c === comilla) comilla = null;
      continue;
    }
    if (c === '/' && sig === '/') { comentario = 'linea'; j++; continue; }
    if (c === '/' && sig === '*') { comentario = 'bloque'; j++; continue; }
    if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
    if (c === '[' || c === '{' || c === '(') { nivel++; arranco = true; }
    else if (c === ']' || c === '}' || c === ')') {
      nivel--;
      if (arranco && nivel === 0) return texto.slice(desde, j + 1);
    }
  }
  throw new Error('`' + que + '` sin cerrar en ' + archivo);
}

/** El cuerpo de `function NOMBRE(…) {…}`, arrancando en la llave para no contar la firma. */
function extraerFuncion(texto, nombre, archivo) {
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  const llave = texto.indexOf('{', inicio);
  if (llave === -1) throw new Error('`' + nombre + '` sin cuerpo en ' + archivo);
  return texto.slice(inicio, llave) + balancear(texto, llave, archivo, nombre);
}

/** El literal `{…}` o `[…]` de una `var NOMBRE = …`. */
function extraerLiteral(texto, nombre, archivo) {
  const inicio = texto.indexOf('var ' + nombre + ' =');
  if (inicio === -1) {
    throw new Error('No encontré `var ' + nombre + ' =` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  const llaves = [texto.indexOf('{', inicio), texto.indexOf('[', inicio)]
    .filter((n) => n !== -1);
  if (!llaves.length) throw new Error('`' + nombre + '` no abre ningún literal en ' + archivo);
  return balancear(texto, Math.min.apply(null, llaves), archivo, nombre);
}

/** Una `var NOMBRE = 'texto';` de una línea — no tiene delimitadores que balancear. */
function extraerCadena(texto, nombre, archivo) {
  const m = texto.match(new RegExp('var\\s+' + nombre + "\\s*=\\s*'([^']*)'"));
  if (!m) {
    throw new Error('No encontré `var ' + nombre + " = '…'` en " + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  return m[1];
}

console.log('Control de los tres totales del "1 a 1" — `L-053`, R-33 (deroga R-28)\n');

/* ── 1 · los tres totales están declarados, y son exactamente tres ───────────────────────────── */
console.log('1 · `TOTALES_UNO_A_UNO_` declara los tres');
const TOTALES = (() => {
  // eslint-disable-next-line no-new-func
  return new Function('return ' + extraerLiteral(INSTALAR, 'TOTALES_UNO_A_UNO_', 'Instalar.gs'))();
})();
{
  const esperados = ['u1_total_impresiones', 'u1_total_clics', 'u1_total_vistas'];
  afirmar(TOTALES.length === 3, 'son tres y no más — vinieron ' + TOTALES.length);
  for (const m of esperados) {
    afirmar(TOTALES.indexOf(m) !== -1, '`' + m + '` está en la lista');
  }
}

/* ── 2 · el wrapper pide `dimensiones` VACÍO ─────────────────────────────────────────────────── */
console.log('\n2 · `alinearTotalesDeUnoAUno()` pide `dimensiones` vacío');
const WRAPPER = extraerFuncion(INSTALAR, 'alinearTotalesDeUnoAUno', 'Instalar.gs');
{
  afirmar(/dimensiones:\s*''/.test(WRAPPER),
    'el lote declara `dimensiones: \'\'`');
  afirmar(!/dimensiones:\s*'etapa=/.test(WRAPPER),
    'y NO declara ningún `etapa=` — el corte viejo no quedó suelto');
}

/* ── 3 · ⭐ EL MISMO corte para los tres, no tres literales que hoy coinciden ─────────────────
 * La diferencia importa: tres literales iguales se pueden separar de a uno sin que nada falle,
 * que es exactamente cómo llegaron a ser tres cortes distintos. Un solo valor para los tres no
 * se puede separar sin editar la línea que los une. */
console.log('\n3 · ⭐ el corte se declara UNA vez para los tres');
{
  /* ⚠ Se cuentan las asignaciones con valor LITERAL (`dimensiones: '…'`), no todas las
   * apariciones del nombre: el `return` del wrapper lleva un `dimensiones: vistos` que es el
   * releído y no un corte. Contar el nombre a secas daba 2 y acusaba a una línea inocente. */
  const asignaciones = WRAPPER.match(/dimensiones:\s*'/g) || [];
  afirmar(asignaciones.length === 1,
    'hay UNA sola asignación literal de `dimensiones` en el wrapper, no una por token — vinieron ' +
    asignaciones.length);
  afirmar(/TOTALES_UNO_A_UNO_\.map/.test(WRAPPER),
    'y se aplica recorriendo `TOTALES_UNO_A_UNO_`, así que los tres reciben el mismo valor');
  afirmar(/todosVacios/.test(WRAPPER) && /leerMarcadores_\(\)/.test(WRAPPER),
    'el wrapper RELEE la hoja y afirma el corte común — no informa lo que pidió escribir');
}

/* ── 4 · corte vacío = ninguna condición, con la función REAL ────────────────────────────────
 * `condicionesDeDimensiones_` es la que traduce `dimensiones` a condiciones físicas. Se extrae
 * de `Fuentes.gs` en vez de reescribirla: reproducir lógica del motor y reproducirla peor es el
 * error que este repo ya cometió cuatro veces (`CLAUDE.md` §4). */
console.log('\n4 · `dimensiones` vacío no agrega ninguna condición (función real)');
{
  const SEP = extraerCadena(GENERADOR, 'SEPARADOR_CONDICIONES_FILTRO_', 'Generador.gs');
  afirmar(SEP === '&&', 'el separador de condiciones sigue siendo `&&` — vino ' + JSON.stringify(SEP));

  const M = new Function(  // eslint-disable-line no-new-func
    'var SEPARADOR_CONDICIONES_FILTRO_ = ' + JSON.stringify(SEP) + ';\n' +
    'var DIMENSIONES_ = ' + extraerLiteral(FUENTES, 'DIMENSIONES_', 'Fuentes.gs') + ';\n' +
    extraerFuncion(FUENTES, 'normalizarValorDeclarado_', 'Fuentes.gs') + '\n' +
    extraerFuncion(FUENTES, 'condicionesDeDimensiones_', 'Fuentes.gs') + '\n' +
    'return { condicionesDeDimensiones_: condicionesDeDimensiones_, DIMENSIONES_: DIMENSIONES_ };')();

  const CLAVE = ['digital', 'CAMPAÑAS_DESGLOCE_DIGITAL'];
  const vacio = M.condicionesDeDimensiones_(CLAVE[0], CLAVE[1], '');
  afirmar(vacio.ok && vacio.condiciones === '',
    'corte vacío → sin condiciones (ausente significa «todas») — vino ' + JSON.stringify(vacio));

  // Control positivo del extractor: si `DIMENSIONES_` no se leyó, esto también falla.
  const pre = M.condicionesDeDimensiones_(CLAVE[0], CLAVE[1], 'etapa=pre');
  afirmar(pre.ok && pre.condiciones.length > 0,
    '⭐ control positivo — `etapa=pre` SÍ produce una condición: ' + JSON.stringify(pre.condiciones));
}

/* ── 5 · la cuenta, sobre la evidencia de `R-28` ─────────────────────────────────────────────
 * ⚠ Esto mide la DEFINICIÓN DEL NEGOCIO, no el motor. Ver el encabezado. */
console.log('\n5 · la aritmética sobre las 5 filas de `3487-AGOJDGAG` (evidencia de R-28)');
const FILAS = (() => {
  const salida = [];
  /* ⚠ **El `.trim()` no es prolijidad: es el fin de línea.** `docs/` se edita desde dos máquinas
   * y desde `git` con `autocrlf`, así que la misma línea llega con `\r` al final o sin él. Sin
   * esto el parser leía 5 filas en una copia LF y **0 en una CRLF** — y 0 filas hace que todas
   * las sumas de abajo den `0 === 0` sin que nada falle. Ya pasó, el 26/08, al agregar `R-33`.
   * Es la misma lección que `CLAUDE.md` §4 escribió para los parches de los controles negativos. */
  for (const linea of REGLAS.split('\n')) {
    const m = linea.trim().match(
      /^\|\s*(PRE|POST)\s*\|\s*([^|]+?)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|$/);
    if (!m) continue;
    const n = (s) => Number(String(s).split('.').join(''));
    salida.push({ etapa: m[1], plataforma: m[2], imp: n(m[3]), vis: n(m[4]), clic: n(m[5]) });
  }
  return salida;
})();
{
  /* ⭐ Control positivo del PARSER, y va primero: si la tabla se movió de formato, este bloque
   * mide cero filas y todas las sumas de abajo darían `0 === 0` sin que nadie se entere.
   * «No hay» y «no miré» se ven igual sin esta afirmación. */
  afirmar(FILAS.length === 5,
    '⭐ control positivo — se leyeron las 5 filas de la tabla de R-28 (vinieron ' + FILAS.length + ')');

  const suma = (campo, filtro) => FILAS
    .filter(filtro || (() => true))
    .reduce((a, f) => a + f[campo], 0);

  afirmar(suma('imp') === 394680,
    '`u1_total_impresiones` con corte vacío = 394.680 — vino ' + suma('imp'));
  afirmar(suma('clic') === 1879,
    '⭐ `u1_total_clics` con corte vacío = 1.879 (PRE + POST) — vino ' + suma('clic'));
  afirmar(suma('clic', (f) => f.etapa === 'PRE') === 1472,
    'y el corte viejo `etapa=pre` reproducía 1.472 — vino ' + suma('clic', (f) => f.etapa === 'PRE'));
  afirmar(suma('clic', (f) => f.etapa === 'POST') === 407,
    'o sea que faltaban los 407 clics del POST sobre este fixture — vino ' +
    suma('clic', (f) => f.etapa === 'POST'));
}

/* ── 6 · ⭐⭐ el acierto por accidente, que es el motivo de tocar `u1_total_vistas` ─────────── */
console.log('\n6 · ⭐⭐ `u1_total_vistas` acertaba por accidente');
{
  const suma = (filas) => filas.reduce((a, f) => a + f.vis, 0);
  const todas = suma(FILAS);
  const soloPost = suma(FILAS.filter((f) => f.etapa === 'POST'));

  afirmar(todas === soloPost,
    'con los datos REALES los dos cortes dan lo mismo (' + todas + ') — por eso no fallaba');
  afirmar(FILAS.filter((f) => f.etapa === 'PRE').every((f) => f.vis === 0),
    'y la causa es que las dos filas PRE traen 0 visualizaciones');

  /* La fila sintética es el contraejemplo: no describe ningún dato real, describe **el día que
   * una campaña PRE lleve video**. Sin ella este bloque sólo dice que hoy coinciden. */
  const conVideo = FILAS.concat([{ etapa: 'PRE', plataforma: 'Meta', imp: 0, vis: 1, clic: 0 }]);
  afirmar(suma(conVideo) !== suma(conVideo.filter((f) => f.etapa === 'POST')),
    '⭐ con una sola visualización en una fila PRE los dos cortes SE SEPARAN — el corte viejo ' +
    'habría empezado a publicar de menos, sin fallar');
}

/* ── 7 · el `_revisar` salió de las 24, y de ninguna más ─────────────────────────────────────
 * ⛔ La afirmación negativa es la mitad que importa: los ocho `imp_*` del Resumen Ejecutivo
 * **siguen marcados** y `L-053` no los puede haber tocado. */
console.log('\n7 · el `_revisar` de `L-053`, y sólo el de `L-053`');
{
  const MAPA = (() => {
    // eslint-disable-next-line no-new-func
    return new Function('return ' +
      extraerLiteral(INSTALAR, 'FORMATOS_SIN_REVISAR_L053_', 'Instalar.gs'))();
  })();
  const todos = Object.keys(MAPA).reduce((a, k) => a.concat(MAPA[k]), []);

  afirmar(todos.length === 24, 'son 24 marcadores — vinieron ' + todos.length);
  afirmar(new Set(todos).size === 24, 'y no hay ninguno repetido');
  afirmar(Object.keys(MAPA).every((f) => f.slice(-8) !== '_revisar'),
    'ninguno de los formatos destino conserva el sufijo `_revisar`');
  afirmar(todos.every((m) => m.indexOf('u1_') === 0),
    '⛔ los 24 son `u1_*`: ningún marcador de otra lámina entró al lote');
  afirmar(!todos.some((m) => m.indexOf('imp_') === 0 || m.indexOf('gcba_imp_') === 0),
    '⛔ los ocho `imp_*` del Resumen Ejecutivo NO están — su marca sigue viva');
  for (const m of TOTALES) {
    afirmar(todos.indexOf(m) !== -1, '`' + m + '` también pierde la marca');
  }
}

/* ── 8 · la fecha se publica SIN el año ──────────────────────────────────────────────────────
 * Se extrae `formatearValorMarcador_` real y se le stubean `Utilities`/`Session`, que son de
 * Apps Script. `probar-formato-revisar.js` saltea la rama `fecha` por eso mismo; acá no se puede
 * saltear, porque la rama `fecha` **es** lo que cambió. */
console.log('\n8 · `fecha` publica `dd/MM`, sin año');
{
  const cuerpo = extraerFuncion(GENERADOR, 'formatearValorMarcador_', 'Generador.gs');
  const M = new Function(  // eslint-disable-line no-new-func
    'var Session = { getScriptTimeZone: function () { return "GMT-3"; } };\n' +
    'var Utilities = { formatDate: function (d, tz, patron) {\n' +
    '  var dd = ("0" + d.getDate()).slice(-2), MM = ("0" + (d.getMonth() + 1)).slice(-2);\n' +
    '  if (patron === "dd/MM") return dd + "/" + MM;\n' +
    '  if (patron === "dd/MM/yyyy") return dd + "/" + MM + "/" + d.getFullYear();\n' +
    '  throw new Error("patrón de fecha no contemplado por el stub: " + patron);\n' +
    '} };\n' +
    'function parsearFechaCelda_(v) { return null; }\n' +
    cuerpo + '\nreturn { formatearValorMarcador_ };')();

  const v = M.formatearValorMarcador_(new Date(2026, 7, 12), 'fecha');
  afirmar(v === '12/08', '`fecha` sobre el 12/08/2026 da `12/08` — vino ' + JSON.stringify(v));
  afirmar(v.indexOf('2026') === -1, '⛔ y el año NO aparece');

  /* Control positivo del stub: si `Utilities.formatDate` no se estuviera llamando, el caso de
   * arriba pasaría por cualquier motivo. Este exige que el patrón que llega sea el nuevo. */
  let patronVisto = null;
  const M2 = new Function(  // eslint-disable-line no-new-func
    'var vistos = [];\n' +
    'var Session = { getScriptTimeZone: function () { return "GMT-3"; } };\n' +
    'var Utilities = { formatDate: function (d, tz, patron) { vistos.push(patron); return "x"; } };\n' +
    'function parsearFechaCelda_(v) { return null; }\n' +
    cuerpo + '\nreturn { formatearValorMarcador_: formatearValorMarcador_, vistos: vistos };')();
  M2.formatearValorMarcador_(new Date(2026, 7, 12), 'fecha');
  patronVisto = M2.vistos[0];
  afirmar(patronVisto === 'dd/MM',
    '⭐ control positivo — el patrón que se le pasa a `Utilities.formatDate` es `dd/MM`, no otro ' +
    '(vino ' + JSON.stringify(patronVisto) + ')');
}

/* ── 9 · control NEGATIVO, con guarda de mutación ────────────────────────────────────────────
 * ⛔ La guarda no es opcional: si el patrón no matchea, el caso corre sobre el código intacto,
 * da verde, y eso se lee como *«el negativo pasó»* (`CLAUDE.md` §4, 24/08). Los patrones van por
 * fragmento de UNA línea — el archivo está en CRLF y un patrón con `\n` no matchearía. */
console.log('\n9 · control negativo — si el corte vuelve a `etapa=pre`, el caso 2 se pone rojo');
{
  const PATRON = "dimensiones: '', notas: NOTA_TOTALES_UNO_A_UNO_";
  const REEMPLAZO = "dimensiones: 'etapa=pre', notas: NOTA_TOTALES_UNO_A_UNO_";
  const mutado = INSTALAR.split(PATRON).join(REEMPLAZO);

  afirmar(mutado !== INSTALAR,
    '⭐ LA MUTACIÓN OCURRIÓ — el patrón matcheó (sin esto el negativo mide el código intacto)');

  if (mutado !== INSTALAR) {
    const wrapperMutado = extraerFuncion(mutado, 'alinearTotalesDeUnoAUno', '(mutado)');
    const pasaVacio = /dimensiones:\s*''/.test(wrapperMutado);
    const pasaSinEtapa = !/dimensiones:\s*'etapa=/.test(wrapperMutado);
    afirmar(!pasaVacio && !pasaSinEtapa,
      '⭐ y el caso 2 cae POR EL MOTIVO CORRECTO: ya no declara vacío Y declara un `etapa=`');
  }
}

console.log('\n' + (fallas === 0
  ? '✅ TODO OK — ' + FILAS.length + ' fila(s) de evidencia, ' + TOTALES.length +
    ' total(es) y 24 marcadores verificados.'
  : '❌ ' + fallas + ' afirmación(es) fallaron.'));
process.exit(fallas === 0 ? 0 : 1);
