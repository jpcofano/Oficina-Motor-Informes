#!/usr/bin/env node
/**
 * tools/probar-remitentes-acumulado.js — control de las cinco `camp_envN_rem` que escribe
 * `aplicarRemitentes20260908()` (`2026-09-08_8` Trabajo 2), **fuera de Apps Script**.
 *
 * ⛔⛔ **Sobre QUÉ artefacto afirma, y la pregunta va ANTES de correrlo:** afirma sobre las listas
 * y el texto de `Instalar.gs`. **No mide `acumulado | Mail`** —esa solapa no está en ningún
 * fixture ni en ningún censo del repo— y **no puede** decir si la columna del ámbito existe. Eso
 * lo contestan los gates, contra la hoja viva.
 *
 * ⭐ **La afirmación que más vale es negativa, y es la que este prompt existe para no romper:**
 * ningún `camp_envN_rem` puede quedar leyendo `mail_remitente`. Ése es el mail crudo, y publicarlo
 * llena el hueco con algo que el equipo no publica.
 *
 * ⚠ **Y la segunda negativa cuida el borde que el `_7` NO tenía:** las cinco tienen que apuntar a
 * `acumulado/Mail`. Si alguna queda en `digital/Directa Mail`, la corrida publicaría el mail otra
 * vez — la lámina se ve igual, y el error es el que este prompt vino a corregir.
 *
 * Uso:
 *   node tools/probar-remitentes-acumulado.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const GENERADOR = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

/** Extrae `var NOMBRE = …;` del top level y lo EVALÚA — la lista se construye con un `.map()`. */
function extraerVar(texto, nombre, archivo) {
  const marca = '\nvar ' + nombre + ' = ';
  const inicio = texto.indexOf(marca);
  if (inicio === -1) {
    throw new Error('No encontré `var ' + nombre + ' =` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  const i = inicio + marca.length;
  let nivel = 0;
  let enTexto = null;
  for (let j = i; j < texto.length; j++) {
    const c = texto[j];
    if (enTexto) {
      if (c === '\\') j++;
      else if (c === enTexto) enTexto = null;
      continue;
    }
    if (c === "'" || c === '"') { enTexto = c; continue; }
    if (c === '[' || c === '{' || c === '(') nivel++;
    else if (c === ']' || c === '}' || c === ')') nivel--;
    else if (c === ';' && nivel === 0) {
      // eslint-disable-next-line no-new-func
      return new Function('return (' + texto.slice(i, j) + ');')();
    }
  }
  throw new Error('`var ' + nombre + '` sin cerrar en ' + archivo);
}

function extraerFuncion(texto, nombre, archivo) {
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) throw new Error('No encontré `function ' + nombre + '(` en ' + archivo);
  const i = texto.indexOf('{', inicio);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}' && --nivel === 0) return texto.slice(inicio, j + 1);
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

const FILAS = extraerVar(INSTALAR, 'FILAS_ENVIO_REM_AMBITO_', 'Instalar.gs');
const BASE = extraerVar(INSTALAR, 'BASE_REM_', 'Instalar.gs');
const SOLAPA = extraerVar(INSTALAR, 'SOLAPA_REM_', 'Instalar.gs');
const CAMPO = extraerVar(INSTALAR, 'CAMPO_AMBITO_MAIL_', 'Instalar.gs');

/* El catálogo de formatos, de la función REAL. `texto_revisar` tiene que resolver. */
const formatear = (function () {
  const cuerpo = extraerFuncion(GENERADOR, 'formatearValorMarcador_', 'Generador.gs');
  // eslint-disable-next-line no-new-func
  return new Function(
    'var parsearFechaCelda_ = function () { return null; };\n' +
    'var Utilities = { formatDate: function () { return "01/01"; } };\n' +
    'var Session = { getScriptTimeZone: function () { return "UTC"; } };\n' +
    cuerpo + '\nreturn formatearValorMarcador_;')();
})();

/* El bloque del constructor de filas, que es donde viven `campo_logico`, `formato` y `separador`. */
const BLOQUE = INSTALAR.slice(
  INSTALAR.indexOf('var plan = FILAS_ENVIO_REM_AMBITO_.map'),
  INSTALAR.indexOf('var faltanCols = [];'));

let ok = 0;
let mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-remitentes-acumulado ==');
console.log('');
console.log('1 · las cinco, una por envío');
af('son cinco', FILAS.length === 5, 'son ' + FILAS.length);
af('sus nombres son `camp_env1..5_rem`',
  FILAS.map(function (x) { return x.marcador; }).join(',') ===
  'camp_env1_rem,camp_env2_rem,camp_env3_rem,camp_env4_rem,camp_env5_rem',
  FILAS.map(function (x) { return x.marcador; }).join(','));
af('sus `valor_fijo` son 1..5, uno por envío',
  FILAS.map(function (x) { return x.valor_fijo; }).join(',') === '1,2,3,4,5',
  FILAS.map(function (x) { return x.valor_fijo; }).join(','));
/* ⚠ `C-83`: Sheets convierte `1/3` en FECHA y `01` pierde el cero, y `opFILA` exige el índice
 * como **entero pelado**. Un `'1'` como texto pasaría este banco y fallaría en la corrida. */
af('⚠ los cinco `valor_fijo` son NÚMEROS, no texto — `opFILA` exige entero pelado (`C-83`)',
  FILAS.every(function (x) { return typeof x.valor_fijo === 'number'; }),
  FILAS.map(function (x) { return typeof x.valor_fijo; }).join(','));

console.log('');
console.log('2 · ⛔⛔ NEGATIVA — la fuente es `acumulado | Mail`, NO `digital | Directa Mail`');
/* ⛔⛔ Es exactamente el error que el `_7` cometió y que este prompt corrige: el gate barrió la
 * solapa equivocada. Si alguna de las cinco vuelve a `digital/Directa Mail`, la corrida publicaría
 * el mail crudo y **la lámina se vería igual**. */
af('la base es `acumulado`', BASE === 'acumulado', BASE);
af('la solapa es `Mail`', SOLAPA === 'Mail', SOLAPA);
af('⛔ la base NO es `digital`', BASE !== 'digital');
af('⛔ la solapa NO es `Directa Mail`', SOLAPA !== 'Directa Mail');
af('el constructor escribe `base_id: BASE_REM_`', /base_id: BASE_REM_/.test(BLOQUE));
af('el constructor escribe `solapa: SOLAPA_REM_`', /solapa: SOLAPA_REM_/.test(BLOQUE));

console.log('');
console.log('3 · ⛔⛔ NEGATIVA — ninguna publica el mail crudo');
af('el `campo_logico` es `' + CAMPO + '`', /campo_logico: CAMPO_AMBITO_MAIL_/.test(BLOQUE));
af('⛔ el campo NO es `mail_remitente` — eso es el mail crudo',
  CAMPO !== 'mail_remitente', CAMPO);
af('⛔ el bloque no menciona `mail_remitente` en ningún `campo_logico`',
  !/campo_logico: *'mail_remitente'/.test(BLOQUE));
/* ⭐ El nombre del campo lo fija UNA constante y el `SEED_MAPEO_` la copia. Si el seed lo
 * declarara por su cuenta, un renombre dejaría al marcador buscando un campo inexistente. */
af('el nombre del campo vive en UNA constante, no repetido en el constructor',
  (BLOQUE.match(/CAMPO_AMBITO_MAIL_/g) || []).length === 1,
  (BLOQUE.match(/CAMPO_AMBITO_MAIL_/g) || []).length + ' menciones');

console.log('');
console.log('4 · la operación y su orden');
af('operan con `FILA`', /operacion: 'FILA'/.test(BLOQUE));
/* ⛔ `opFILA` sin `separador` NO ordena por posición: falla con `«FALTA:@fila_sin_orden»`. */
af('ordenan por `fecha_periodo` — sin `separador`, `opFILA` FALLA',
  /separador: 'fecha_periodo'/.test(BLOQUE));
af('⛔ el corte no va en `filtro`: queda vacío', /filtro: ''/.test(BLOQUE));
af('⛔ ni en `dimensiones`: el ámbito acá es un VALOR que se publica, no un corte',
  /dimensiones: ''/.test(BLOQUE));

console.log('');
console.log('5 · ⭐ las cinco nacen con `_revisar` — ningún caso las valida');
af('el formato es `texto_revisar`', /formato: 'texto_revisar'/.test(BLOQUE));
af('`texto_revisar` resuelve contra la función real',
  String(formatear('JM', 'texto_revisar')).indexOf('FALTA:formato_desconocido') === -1,
  String(formatear('JM', 'texto_revisar')));
af('`texto_revisar` publica entre guiones', formatear('JM', 'texto_revisar') === '-JM-',
  String(formatear('JM', 'texto_revisar')));

console.log('');
console.log('6 · ⭐ los gates existen y ABORTAN antes de la primera escritura');
const CUERPO = INSTALAR.slice(INSTALAR.indexOf('function aplicarRemitentes20260908_'));
const iBackup = CUERPO.indexOf("backupMarcadores_('remitentes_acumulado')");
['G0', 'G1', 'G2'].forEach(function (g) {
  const i = CUERPO.indexOf('---- ' + g + ' ·');
  af('`' + g + '` existe y corre ANTES del backup', i !== -1 && i < iBackup,
    i === -1 ? 'no está' : 'está DESPUÉS de la primera escritura');
});
/* ⛔ Cero filas no es «la columna está bien»: es que el gate no midió nada. */
af('`G1` aborta con CERO filas — un cero sin denominador se lee como verde',
  /G1 NO PASA — la ventana devolvió CERO filas/.test(CUERPO));
/* ⛔⛔ `R-02` excluye las derivadas como fuente: si el censo encontró fórmulas, el alta muere. */
af('`G0` nombra el caso `derivada` aparte — `R-02` lo excluye como fuente',
  /uso === 'derivada'/.test(CUERPO));
af('`G2` declara los DOS conteos aunque coincidan',
  /filas en la ventana — `digital\|Directa Mail`/.test(CUERPO));
/* ⚠ Dos envíos del mismo día ordenados por fecha no se distinguen: la clave se debilita. */
af('`G2` avisa cuando hay empates de fecha — ahí la fecha no alcanza como clave',
  /empates de fecha/.test(CUERPO));
af('`G2` avisa cuando NO hay campo de corroboración común',
  /NO hay ningún campo de corroboración COMÚN/.test(CUERPO));

console.log('');
console.log('7 · ⭐ el orden NO se reimplementa: sale de `filasOrdenadas_`');
/* `CLAUDE.md` §4 — cuando la lógica existe en un `.gs`, se usa la real. Un orden propio acá sería
 * el instrumento que reproduce lógica del motor y la reproduce peor, justo en la comparación de
 * la que depende que la tabla no mezcle envíos. */
const HELPER = INSTALAR.slice(
  INSTALAR.indexOf('function envioOrdenadoDeSolapa_'),
  INSTALAR.indexOf('function diagAplicarRemitentes20260908'));
af('usa `filasOrdenadas_`, la que corre en producción', /filasOrdenadas_\(ctx\)/.test(HELPER));
af('resuelve la columna con `buscarMapeo`', /buscarMapeo\(baseId, solapa, campoOrden\)/.test(HELPER));
af('resuelve la clave de lectura con `claveDeFila_`', /claveDeFila_\(/.test(HELPER));
af('⛔ NO tiene un `.sort(` propio', !/\.sort\(/.test(HELPER));

console.log('');
console.log('8 · control negativo — que esto sepa ponerse rojo');
/* ⚠ **La mutación se EXIGE.** Si el patrón no matchea, el caso FALLA en vez de dar verde sobre el
 * texto intacto — la lección de los dos parches con CRLF del 22/08. */
{
  const marca = "var CAMPO_AMBITO_MAIL_ = 'acm_remitente';";
  if (INSTALAR.indexOf(marca) === -1) {
    af('el parche exige su marca (el campo)', false, 'no encontré `' + marca + '`');
  } else {
    const roto = INSTALAR.replace(marca, "var CAMPO_AMBITO_MAIL_ = 'mail_remitente';");
    af('la mutación ocurrió (el campo)', roto !== INSTALAR);
    af('volviendo al mail crudo, la afirmación 3 se pone roja',
      extraerVar(roto, 'CAMPO_AMBITO_MAIL_', '(mutado)') === 'mail_remitente',
      'el control dejaría pasar el mail crudo en la columna Envío');
  }
}
{
  const marca = "var BASE_REM_ = 'acumulado';";
  if (INSTALAR.indexOf(marca) === -1) {
    af('el parche exige su marca (la base)', false, 'no encontré `' + marca + '`');
  } else {
    const roto = INSTALAR.replace(marca, "var BASE_REM_ = 'digital';");
    af('la mutación ocurrió (la base)', roto !== INSTALAR);
    af('volviendo a `digital`, la afirmación 2 se pone roja',
      extraerVar(roto, 'BASE_REM_', '(mutado)') === 'digital',
      'el control no distingue la solapa buena de la que el `_7` midió por error');
  }
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · sobre ' + FILAS.length +
  ' fila(s) declaradas por `aplicarRemitentes20260908()`');
console.log('  ⚠ NO mide `' + BASE + ' | ' + SOLAPA + '`: esa solapa no está en ningún fixture ni');
console.log('    en ningún censo del repo. Si la columna del ámbito existe lo dicen los gates.');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
