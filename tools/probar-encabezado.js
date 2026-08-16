#!/usr/bin/env node
/**
 * tools/probar-encabezado.js — corre el control positivo del testigo de `D-31` **fuera de Apps
 * Script**, extrayendo el código real del repo.
 *
 * **Por qué existe.** La función que compara el encabezado esperado contra el encontrado es
 * **pura** —dos valores de texto entran, un veredicto sale— y no hay razón para que verificarla
 * dependa de que alguien abra el editor. Corriéndola acá queda verificada **antes** de que el
 * usuario toque nada, que es lo que pidió el `2026-08-16_3`.
 *
 * ⚠ **Extrae el código real, no una copia.** Lee `Union.gs` y `Fuentes.gs` por texto, saca las
 * funciones por nombre y las evalúa. **Una copia pegada acá probaría la copia**, y el día que
 * alguien toque el `.gs` la prueba seguiría en verde sobre código que ya no existe — que es
 * exactamente el modo de falla que este repo persigue. Mismo criterio que `tools/listas.js`: se
 * lee por texto, sin `require` y sin ejecutar el archivo entero.
 *
 * **Lo que NO cubre, dicho para que nadie lo lea de más:** esto prueba la **comparación**, no el
 * cableado. Que `encabezadoEnColumna_` llame al comparador y registre el aviso necesita la
 * planilla, y va por `verificarEncabezadosDeMapeo()`. Es la misma división que `D-32`: la parte
 * pura acá, la de punta a punta contra la hoja.
 *
 * Uso:
 *   node tools/probar-encabezado.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/**
 * Saca el texto de una función por nombre, contando llaves desde la primera `{`. Es tosco a
 * propósito: no parsea JavaScript, y si el día de mañana no encuentra la función **falla en vez
 * de seguir**, que es lo único que le pedimos.
 */
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

/**
 * Las funciones que hacen falta, con el archivo donde viven.
 *
 * ⚠ **Se evalúan TODAS JUNTAS en un solo scope, y eso no es comodidad: es fidelidad.** Apps
 * Script concatena todos los `.gs` en **un único scope global** —es la premisa de la §1 de
 * `CLAUDE.md`, la que obliga a greppear todo nombre nuevo—, así que `desalineamientoDeEncabezado_`
 * ve a `normalizarValorDeclarado_` sin importar nada. Evaluarlas por separado las aislaría y
 * probaría un entorno que no existe.
 */
const FUENTES = [
  ['Fuentes.gs', 'normalizarValorDeclarado_'],
  ['Union.gs', 'desalineamientoDeEncabezado_']
];

const EXPORTADA = 'desalineamientoDeEncabezado_';

const cuerpo = FUENTES.map(([archivo, nombre]) => extraerFuncion(archivo, nombre)).join('\n\n');
// eslint-disable-next-line no-new-func
const desalineamientoDeEncabezado_ = new Function(cuerpo + '\nreturn ' + EXPORTADA + ';')();

/* ─────────────────────────── el control positivo ─────────────────────────── */

let fallas = 0;
const lineas = [];

function afirmar(condicion, mensaje) {
  if (condicion) {
    lineas.push('  ✅ ' + mensaje);
  } else {
    fallas++;
    lineas.push('  ❌ ' + mensaje);
  }
}

console.log('Control positivo del testigo de `D-31` — código extraído de Union.gs y Fuentes.gs\n');

/* ── caso 1 · esperado ≠ real REPORTA ────────────────────────────────────────────────────
 * El caso que motiva la función: alguien insertó una columna, la letra quedó apuntando una más
 * allá, y el título que aparece ahí no es el que `MAPEO` declara esperar. */
console.log('1 · esperado ≠ real → reporta');
{
  const r = desalineamientoDeEncabezado_(['Impresiones'], 'Plataforma');
  afirmar(r !== null, 'devuelve un aviso');
  afirmar(r && r.real === 'Plataforma', 'el aviso trae el valor REAL — vino ' + JSON.stringify(r && r.real));
  afirmar(r && r.esperados.indexOf('Impresiones') !== -1,
    'el aviso trae el valor ESPERADO — vino ' + JSON.stringify(r && r.esperados));
}

/* ── caso 2 · esperado = real NO reporta ─────────────────────────────────────────────────
 * ⚠ **Éste es el que suele faltar, y sin él la prueba no distingue nada:** una función que
 * devolviera un aviso SIEMPRE pasaría el caso 1 entero. */
console.log('\n2 · esperado = real → NO reporta  (sin este caso, una función que avisa siempre pasa el 1)');
{
  afirmar(desalineamientoDeEncabezado_(['Impresiones'], 'Impresiones') === null,
    'coincidencia exacta no avisa');
  // `R-10`: se normalizan los dos lados. Una celda tipeada a mano trae espacios de más, y si eso
  // disparara el aviso la alarma sería ruido desde el primer día y nadie la miraría.
  afirmar(desalineamientoDeEncabezado_(['  Impresiones '], 'Impresiones\n') === null,
    'espacios de más y salto de línea no son un desalineamiento (R-10)');
  // Y lo que R-10 NO hace: plegar el case. Dos encabezados que difieren en mayúsculas son
  // columnas distintas en estas bases, así que esto TIENE que avisar.
  afirmar(desalineamientoDeEncabezado_(['Impresiones'], 'impresiones') !== null,
    'el case NO se pliega: `impresiones` no es `Impresiones` (R-10 preserva mayúsculas)');
}

/* ── caso 3 · `encabezado` vacío no es desalineamiento ──────────────────────────────────
 * Es el estado real de 7 de las 154 filas: las de `promoverFechasElegidas()`. Vacío significa
 * "no declarado", no "declarado como vacío". */
console.log('\n3 · `encabezado` vacío → no es desalineamiento (las 7 filas de promoverFechasElegidas)');
{
  afirmar(desalineamientoDeEncabezado_([], 'Impresiones') === null,
    'sin ningún testigo declarado no hay nada que comparar');
  afirmar(desalineamientoDeEncabezado_([''], 'Impresiones') === null,
    'un testigo vacío se saltea, no se compara contra ""');
  afirmar(desalineamientoDeEncabezado_(['   '], 'Impresiones') === null,
    'un testigo de puros espacios también');
}

/* ── caso 4 · la aliasing de MAPEO, medida y no supuesta ────────────────────────────────
 * **12 grupos (base, solapa, letra) de `MAPEO_2026-08-15.tsv` tienen más de una fila**, porque
 * dos `campo_logico` distintos pueden apuntar a la misma columna física: `looker/
 * resumen_metricas_dinamico/C` tiene tres, y `rdv/RVD JM-CM - ES/E` tiene dos con testigos
 * DISTINTOS (`''` y `'FECHA'`).
 *
 * Por eso el comparador recibe una LISTA y no un valor: si el real coincide con **alguno** de
 * los declarados, no hay desalineamiento. Tratarlo como valor único produciría avisos falsos
 * sobre doce grupos el primer día, y una alarma que grita de entrada es una alarma apagada. */
console.log('\n4 · varios campos apuntan a la misma letra (12 grupos reales en MAPEO)');
{
  afirmar(desalineamientoDeEncabezado_(['', 'FECHA'], 'FECHA') === null,
    'coincide con uno de los declarados: no avisa');
  afirmar(desalineamientoDeEncabezado_(['', 'FECHA'], 'Barrio') !== null,
    'no coincide con ninguno: avisa');
  const r = desalineamientoDeEncabezado_(['Fecha de inicio', 'FECHA'], 'Barrio');
  afirmar(r && r.esperados.length === 2,
    'y el aviso lista TODOS los esperados, no el primero — vino ' + JSON.stringify(r && r.esperados));
}

/* ── caso 5 · el límite, que es de la función y no una omisión ──────────────────────────
 * `C-09`: en `RDV_otros_ministros` los encabezados están corridos EN ORIGEN — el rótulo no
 * describe lo que la columna tiene. Ahí el testigo coincide y no detecta nada, y eso es
 * correcto: **detecta que la columna se movió, no que el dato esté mal.** Se afirma acá para
 * que quede como comportamiento declarado y no como sorpresa. */
console.log('\n5 · el límite declarado: compara rótulos, no contenido (C-09)');
{
  afirmar(desalineamientoDeEncabezado_(['Barrio'], 'Barrio') === null,
    'el rótulo coincide → no avisa, aunque el contenido de esa columna fuera de otra cosa');
}

console.log('\n' + lineas.join('\n'));

if (fallas) {
  console.log('\n❌ ' + fallas + ' afirmación(es) fallaron.');
  process.exit(1);
}
console.log('\n✅ Las ' + lineas.length + ' afirmaciones pasaron.');
