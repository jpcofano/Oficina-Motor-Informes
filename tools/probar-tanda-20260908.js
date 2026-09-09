#!/usr/bin/env node
/**
 * tools/probar-tanda-20260908.js — control de las filas que escribe `aplicarTanda20260908()`
 * (`2026-09-08_7`), **fuera de Apps Script** y sobre las listas REALES de `Instalar.gs`.
 *
 * ⭐ **Por qué existe, y es la regla de `CLAUDE.md` §4 aplicada al pie:** *«una rama nueva que
 * nunca se ejecutó no está sin probar: está sin escribir el control»*. Estas listas **escriben en
 * `MARCADORES`**, o sea que un error acá **publica un número** — y las 97 suites del repo no
 * tocaban ninguna de las tres.
 *
 * ⛔⛔ **Sobre QUÉ artefacto afirma, que es la pregunta que hay que hacerse ANTES de correrlo:**
 * afirma sobre las **listas declaradas**, no sobre la hoja. *«La fila que se va a escribir es
 * ésta»* y *«la hoja quedó así»* son dos afirmaciones distintas; la segunda la contesta la
 * relectura que el wrapper hace **desde la hoja**, y no hay forma de contestarla desde acá.
 *
 * ⚠ **Las afirmaciones NEGATIVAS son la mitad cara.** Tres de ellas —que `campo_logico` de las
 * `_rem` esté VACÍO, que ningún `*_campanias` entre, que ningún token de `L-034` entre— se ponen
 * rojas justo el día que alguien "complete" el hueco con lo que tenga a mano. Ese día el control
 * tiene que mandarlo a leer el motivo, no dejarlo pasar.
 *
 * Uso:
 *   node tools/probar-tanda-20260908.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const GENERADOR = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

/**
 * Extrae `var NOMBRE = …;` del top level y lo evalúa. **Se evalúa, no se lee con una regex**:
 * `FILAS_ENVIO_REM_` se construye con un `.map()`, así que mirarla a ojo daría otra lista.
 */
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

/** El catálogo de formatos, extraído de la función REAL en vez de copiado (`CLAUDE.md` §4). */
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

const GCBA = extraerVar(INSTALAR, 'FILAS_GCBA_CC_', 'Instalar.gs');
const ENV4 = extraerVar(INSTALAR, 'FILA_ENV4_FECHA_', 'Instalar.gs');
const REM = extraerVar(INSTALAR, 'FILAS_ENVIO_REM_', 'Instalar.gs');
const JM = extraerVar(INSTALAR, 'FILAS_CC_ACUMULADO_', 'Instalar.gs');

/* `formatearValorMarcador_` con los dos stubs mínimos que necesita la rama `fecha`. No se
 * reimplementa nada: el catálogo de formatos es el que corre en producción. */
const formatear = (function () {
  const cuerpo = extraerFuncion(GENERADOR, 'formatearValorMarcador_', 'Generador.gs');
  // eslint-disable-next-line no-new-func
  return new Function(
    'var parsearFechaCelda_ = function () { return null; };\n' +
    'var Utilities = { formatDate: function () { return "01/01"; } };\n' +
    'var Session = { getScriptTimeZone: function () { return "UTC"; } };\n' +
    cuerpo + '\nreturn formatearValorMarcador_;')();
})();

let ok = 0;
let mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-tanda-20260908 ==');
console.log('');
console.log('1 · las tres `gcba_cc_*` son COPIA de las de JM, y difieren SÓLO en el corte');
/* ⭐ Es `D3` como afirmación: si el corte se hubiera escrito cambiando el `campo_logico` o la
 * `operacion`, dejaría de ser «la misma medida con otro corte» y sería otra medida. */
af('son tres', GCBA.length === 3, 'son ' + GCBA.length);
af('sus nombres son los tres de JM con prefijo `gcba_`',
  GCBA.map(function (x) { return x.marcador; }).join(',') ===
  JM.map(function (x) { return 'gcba_' + x.marcador; }).join(','),
  GCBA.map(function (x) { return x.marcador; }).join(','));
GCBA.forEach(function (g, i) {
  const j = JM[i];
  af('`' + g.marcador + '` copia el `campo_logico` de `' + j.marcador + '`',
    g.campo_logico === j.campo_logico, JSON.stringify([g.campo_logico, j.campo_logico]));
  af('`' + g.marcador + '` copia la `operacion` de `' + j.marcador + '`',
    g.operacion === j.operacion, JSON.stringify([g.operacion, j.operacion]));
});

console.log('');
console.log('2 · ⭐ las tres nacen con `_revisar` — no tienen testigo publicado (`D4`)');
GCBA.forEach(function (g, i) {
  af('`' + g.marcador + '` lleva `_revisar`', /_revisar$/.test(g.formato), g.formato);
  af('`' + g.marcador + '` es el formato de su hermano MÁS la marca',
    g.formato.replace(/_revisar$/, '') === JM[i].formato.replace(/_revisar$/, ''),
    g.formato + ' vs ' + JM[i].formato);
});

console.log('');
console.log('3 · los formatos declarados EXISTEN — probados contra la función real');
/* ⛔ Desde el `2026-09-04_8` un formato desconocido devuelve `«FALTA:formato_desconocido:…»` en
 * vez de publicar el número crudo. Un `entero_revisar` inventado se caza acá y no en el deck. */
GCBA.concat([ENV4]).concat(REM).forEach(function (x) {
  const salida = String(formatear(1234.5, x.formato));
  af('`' + x.marcador + '` → formato `' + x.formato + '` resuelve',
    salida.indexOf('FALTA:formato_desconocido') === -1, salida);
});

console.log('');
console.log('4 · ⛔ NEGATIVA — el `campo_logico` de las cinco `_rem` está VACÍO');
/* ⛔⛔ **Ésta es la que impide publicar el mail crudo.** `D1` dice que la columna Envío publica el
 * ÁMBITO; la fila no puede traer un campo escrito de antemano, porque el único que hoy
 * particiona es `mail_remitente` —el mail— y escribirlo llenaría el hueco con algo que el equipo
 * no publica. Lo llena el gate `G1` con la columna que encuentre, o no se escribe ninguna. */
af('son cinco', REM.length === 5, 'son ' + REM.length);
af('las cinco traen `campo_logico` vacío',
  REM.every(function (x) { return !String(x.campo_logico || '').trim(); }),
  REM.map(function (x) { return x.marcador + '=' + x.campo_logico; }).join(' '));
af('⛔ NINGUNA declara `mail_remitente` — eso sería publicar el mail crudo',
  !REM.some(function (x) { return /remitente/i.test(String(x.campo_logico || '')); }));
af('sus `valor_fijo` son 1..5, uno por envío',
  REM.map(function (x) { return x.valor_fijo; }).join(',') === '1,2,3,4,5',
  REM.map(function (x) { return x.valor_fijo; }).join(','));

console.log('');
console.log('5 · `camp_env4_fecha` es copia de sus hermanos cambiando SÓLO `valor_fijo`');
af('lee `fecha_periodo`', ENV4.campo_logico === 'fecha_periodo', ENV4.campo_logico);
af('opera con `FILA`', ENV4.operacion === 'FILA', ENV4.operacion);
af('su `valor_fijo` es 4', String(ENV4.valor_fijo) === '4', String(ENV4.valor_fijo));
af('su formato es `fecha`, como los otros cuatro', ENV4.formato === 'fecha', ENV4.formato);

console.log('');
console.log('6 · ⛔ NEGATIVAS — los huecos DELIBERADOS siguen abiertos');
const todos = GCBA.concat([ENV4]).concat(REM).map(function (x) { return x.marcador; });
af('⛔ ningún `*_campanias` entra — `C-112` abierto, cuatro candidatas indistinguibles',
  !todos.some(function (n) { return /_campanias$/.test(n); }),
  todos.filter(function (n) { return /_campanias$/.test(n); }).join(','));
/* ⛔⛔ `L-034` usa LOS MISMOS NOMBRES que `L-031` —`cc_base`, `cc_contactados`,
 * `cc_contact_pct`—, y esas tres YA tienen fila y publican allá. Su `/////` en la lámina 5 es un
 * token que existe y no resuelve, no un hueco de fila. Escribirles algo taparía el síntoma. */
af('⛔ ninguna fila de `L-034`: ni `ecv_*` ni los tres `cc_*` pelados',
  !todos.some(function (n) { return /^ecv_/.test(n); }) &&
  !todos.some(function (n) { return JM.some(function (j) { return j.marcador === n; }); }),
  todos.join(','));
af('⛔ ninguna toca un marcador que ya publica un número',
  !todos.some(function (n) { return /^(imp_|gcba_imp_|mail_|camp_enviados|camp_or)/.test(n); }),
  todos.join(','));

console.log('');
console.log('7 · el corte va en `dimensiones`, nunca en `filtro` ni en el nombre');
/* `CLAUDE.md` §2: `filtro` queda sólo para restricciones técnicas. El bloque A escribe
 * `dimensiones: 'ambito=gcba'` y `filtro: ''`, y eso se afirma sobre el texto del constructor
 * porque ahí es donde vive. */
const bloqueA = INSTALAR.slice(
  INSTALAR.indexOf('FILAS_GCBA_CC_.forEach'), INSTALAR.indexOf('if (!bloqueado.env4)'));
af('el bloque A escribe `dimensiones: \'ambito=gcba\'`', /dimensiones: 'ambito=gcba'/.test(bloqueA));
af('el bloque A deja `filtro` vacío', /filtro: ''/.test(bloqueA));
af('⛔ ningún `gcba_cc_*` lleva el corte en el nombre del campo',
  !GCBA.some(function (x) { return /gcba/i.test(x.campo_logico); }),
  GCBA.map(function (x) { return x.campo_logico; }).join(','));

console.log('');
console.log('8 · control negativo — que esto sepa ponerse rojo');
/* ⚠ **La mutación se EXIGE.** Si el patrón no matchea, el caso FALLA en vez de dar verde sobre el
 * texto intacto — la lección de los dos parches con CRLF del 22/08. Y el patrón va por fragmento
 * de UNA línea: el fin de línea es del archivo, no de quien escribe la prueba. */
{
  const marca = "operacion: 'PCT', formato: 'porcentaje_sin_signo_revisar' }";
  if (INSTALAR.indexOf(marca) === -1) {
    af('el parche exige su marca (el formato)', false, 'no encontré `' + marca + '`');
  } else {
    const roto = INSTALAR.replace(marca, "operacion: 'PCT', formato: 'entero_revisar' }");
    af('la mutación ocurrió (el formato)', roto !== INSTALAR);
    const gcbaRoto = extraerVar(roto, 'FILAS_GCBA_CC_', '(mutado)');
    const detecta = gcbaRoto.some(function (x) {
      return String(formatear(1234.5, x.formato)).indexOf('FALTA:formato_desconocido') !== -1;
    });
    af('con un formato inventado, la afirmación 3 se pone roja', detecta,
      'el control no distingue el formato bueno del inventado: no prueba nada');
  }
}
{
  const marca = "marcador: 'camp_env' + n + '_rem', campo_logico: '',";
  if (INSTALAR.indexOf(marca) === -1) {
    af('el parche exige su marca (las `_rem`)', false, 'no encontré el constructor de las `_rem`');
  } else {
    const roto = INSTALAR.replace(marca,
      "marcador: 'camp_env' + n + '_rem', campo_logico: 'mail_remitente',");
    af('la mutación ocurrió (las `_rem`)', roto !== INSTALAR);
    const remRoto = extraerVar(roto, 'FILAS_ENVIO_REM_', '(mutado)');
    af('cableando el mail crudo, la afirmación 4 se pone roja',
      remRoto.some(function (x) { return /remitente/i.test(String(x.campo_logico || '')); }),
      'el control dejaría pasar el mail crudo en la columna Envío');
  }
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · sobre ' +
  (GCBA.length + 1 + REM.length) + ' fila(s) declaradas por `aplicarTanda20260908()`');
console.log('  ⚠ Afirma sobre las LISTAS, no sobre la hoja: «la fila es ésta» y «la hoja quedó');
console.log('    así» son dos cosas, y la segunda la contesta la relectura del wrapper.');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
