#!/usr/bin/env node
/**
 * tools/probar-tanda4.js — control positivo de la tanda 4 (`2026-08-17_4`), **fuera de Apps
 * Script** y extrayendo el código real del repo.
 *
 * **Prueba las dos cosas de las que depende esa tanda, y las dos son puras:**
 *
 *   1. **Que `campana~=JM` y `campana!~=JM` sean complementarios.** El control principal de la
 *      tanda es `4 + 22 = 26`, y esa suma sólo significa algo si toda fila cae en **exactamente
 *      una** de las dos mitades. Eso es una propiedad **del código** —`valorPasaFiltro_` calcula
 *      `coincide` una vez y devuelve `coincide` o `!coincide`—, así que **se puede demostrar
 *      ejecutándola**, sin la planilla y sin esperar a la corrida.
 *   2. **Que se puedan leer los dos operandos del `RATIO`** de la traza. El testigo los emite
 *      para distinguir *"se movió `looker`"* de *"la dimensión lee otras filas"*, y si el formato
 *      cambió, mejor enterarse acá que a mitad de la verificación.
 *
 * ⚠ **Extrae el código real, no una copia** — mismo criterio que `tools/probar-encabezado.js`:
 * una copia pegada acá probaría la copia, y seguiría en verde sobre código que ya no existe.
 *
 * **Lo que NO cubre:** que los dos marcadores lean el **mismo universo**. La complementariedad es
 * sobre **una fila**; que ambos partan del mismo conjunto depende de la solapa, la ventana y el
 * `periodo_ref`, y eso es del dato — lo mide `testigoDeFrecuencia()` contra la planilla.
 *
 * Uso:
 *   node tools/probar-tanda4.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/** Idéntica a la de `probar-encabezado.js`: cuenta llaves y **falla** si no encuentra el nombre. */
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
 * Una `var` de módulo cuyo valor es un literal, contando corchetes. Hace falta porque
 * `OPERADORES_FILTRO_` **no es una función** y es justamente donde vive la complementariedad: el
 * `!~=` y el `~=` comparten `op` y difieren sólo en `negado`.
 */
function extraerVar(archivo, nombre) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const inicio = texto.indexOf('var ' + nombre + ' = [');
  if (inicio === -1) {
    throw new Error('No encontré `var ' + nombre + ' = [` en ' + archivo);
  }
  let nivel = 0;
  for (let j = texto.indexOf('[', inicio); j < texto.length; j++) {
    if (texto[j] === '[') nivel++;
    else if (texto[j] === ']') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, j + 1) + ';';
    }
  }
  throw new Error('`var ' + nombre + '` sin cerrar en ' + archivo);
}

/* Todo en UN SOLO scope, igual que Apps Script concatena los `.gs` (`CLAUDE.md` §1). */
const cuerpo = [
  extraerVar('Generador.gs', 'OPERADORES_FILTRO_'),
  extraerFuncion('Fuentes.gs', 'normalizarValorDeclarado_'),
  extraerFuncion('Generador.gs', 'parsearCondicionFiltro_'),
  extraerFuncion('Generador.gs', 'valorPasaFiltro_'),
  extraerFuncion('Auditoria.gs', 'operandosDeRatio_'),
  extraerFuncion('Auditoria.gs', 'filasDeTraza_')
].join('\n\n');

// eslint-disable-next-line no-new-func
const M = new Function(cuerpo +
  '\nreturn { parsearCondicionFiltro_, valorPasaFiltro_, operandosDeRatio_, filasDeTraza_ };')();

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/** Aplica un texto de filtro de una sola condición a un valor de celda, como lo hace el motor. */
function pasa(textoFiltro, celda) {
  const p = M.parsearCondicionFiltro_(textoFiltro);
  if (!p.ok) throw new Error('el filtro `' + textoFiltro + '` no parseó: ' + p.motivo);
  return M.valorPasaFiltro_(celda, p.condicion);
}

console.log('Control positivo de la tanda 4 — código extraído de Generador.gs, Fuentes.gs y Auditoria.gs\n');

const JM = 'campana~=JM';
const GCBA = 'campana!~=JM';

/* ── 1 · los dos operadores son el MISMO `op` y difieren sólo en `negado` ────────────────────
 * Es la razón estructural de la complementariedad. Si algún día alguien le diera a `!~=` un `op`
 * propio, los dos lados dejarían de ser negaciones de la misma expresión y la partición se
 * volvería una propiedad del dato — que es lo que este prompt sostiene que NO es. */
console.log('1 · `~=` y `!~=` son la misma comparación con el booleano invertido');
{
  const a = M.parsearCondicionFiltro_(JM).condicion;
  const b = M.parsearCondicionFiltro_(GCBA).condicion;
  afirmar(a.op === b.op && a.op === '~=', 'comparten `op` (`~=`) — vino ' + a.op + ' y ' + b.op);
  afirmar(a.negado === false && b.negado === true, '`negado` es false y true respectivamente');
  afirmar(a.campo === 'campana' && b.campo === 'campana', 'los dos leen el campo `campana`');
  afirmar(a.valor === 'JM' && b.valor === 'JM', 'los dos comparan contra `JM`');
}

/* ── 2 · la complementariedad, ejecutada sobre valores reales y de borde ─────────────────────
 * ⚠ **El caso que importa es el de la celda VACÍA**, que es el único que podría hacer desaparecer
 * una fila de los dos lados y romper la partición por un motivo que no es la migración. */
console.log('\n2 · toda celda cae en EXACTAMENTE una de las dos mitades');
{
  const CELDAS = [
    ['JM Convocatoria', 'contiene JM'],
    ['GCBA Verano', 'no contiene JM'],
    ['', '⚠ CELDA VACÍA — el caso de borde de este prompt'],
    ['   ', '⚠ sólo espacios (R-10 lo colapsa a vacío)'],
    ['jm minúscula', 'case distinto — R-10 NO pliega, así que es `gcba`'],
    ['AJMB', 'JM como subcadena en el medio'],
    ['Campaña JM 2026', 'JM con acentos alrededor']
  ];
  for (const [celda, nota] of CELDAS) {
    const enJm = pasa(JM, celda);
    const enGcba = pasa(GCBA, celda);
    afirmar(enJm !== enGcba,
      JSON.stringify(celda) + ' cae en ' + (enJm ? 'jm' : 'gcba') + ' y sólo ahí — ' + nota);
  }
  // Los dos casos nombrados, dichos como afirmación propia para que se lean en la salida.
  afirmar(pasa(GCBA, '') === true && pasa(JM, '') === false,
    'una fila SIN campaña cargada cae en `gcba` y NO se pierde (es lo que `D-33` declara)');
  afirmar(pasa(JM, 'jm minúscula') === false,
    'el case NO se pliega: `jm` no matchea `JM` (R-10 preserva mayúsculas)');
}

/* ── 3 · el control negativo: la prueba tiene que poder FALLAR ───────────────────────────────
 * ⚠ Sin esto, el caso 2 pasaría igual con un comparador que devolviera siempre lo contrario de
 * cualquier cosa. Dos filtros que **no** son complementarios tienen que dar un caso donde los dos
 * respondan igual — si no lo dieran, el caso 2 no estaría midiendo nada. */
console.log('\n3 · control negativo — dos filtros NO complementarios se detectan');
{
  const otro = 'campana~=GCBA';
  const solapan = ['JM y GCBA', 'otra cosa'].some((c) => pasa(JM, c) === pasa(otro, c));
  afirmar(solapan, '`~=JM` y `~=GCBA` NO particionan — hay celdas donde coinciden');
}

/* ── 4 · los dos operandos del RATIO se leen de la traza ─────────────────────────────────────
 * El formato lo produce `opRATIO` (`Marcadores.gs`): `RATIO num/den = N/D`. */
/* ⚠ **ESTE CASO ESTABA MAL Y PASABA. El fixture era inventado.**
 *
 * La primera versión usaba `RATIO dig_impresiones/alcance = …`, leído del **template** de
 * `opRATIO` (`nombreNum + '/' + nombreDen`) sin mirar **qué le pasa el despachador**:
 * `Generador.gs` arma los nombres como `nombre + ' (col ' + columna + ')'`. La traza real es
 *
 *     RATIO dig_impresiones (col H)/alcance (col K) = 6729844/475723
 *
 * y el extractor, anclado en `[^\s\/]+` —"un nombre no tiene espacios"—, **no matcheaba nada**.
 * La prueba daba verde porque el fixture compartía el error del código: **los dos suponían lo
 * mismo**, así que no había dato que los distinguiera. Es exactamente el caso de `ULTIMO` que
 * `CLAUDE.md` §4 documenta — un control que pasa afirmando otra cosa.
 *
 * **Ahora el fixture es la traza REAL, copiada del log del 17/08 a las 19:08.** */
console.log('\n4 · los operandos del RATIO se extraen de la traza REAL (no de una inventada)');
{
  const traza = 'RATIO dig_impresiones (col H)/alcance (col K) = 6729844/475723, ' +
    '01/07/2026–31/07/2026 · filtro `campana~=JM` sobre 26 fila(s) → 4 de 26 fila(s) · ' +
    'solapa "resumen_metricas_dinamico"';
  const o = M.operandosDeRatio_(traza);
  afirmar(o !== null, 'matchea la traza REAL, con `(col H)` en el medio del nombre');
  afirmar(o && o.numerador === 6729844, 'numerador = 6729844 — vino ' + (o && o.numerador));
  afirmar(o && o.denominador === 475723, 'denominador = 475723 — vino ' + (o && o.denominador));
  afirmar(o && o.nombre_num === 'dig_impresiones (col H)' && o.nombre_den === 'alcance (col K)',
    'los nombres salen enteros — vino ' + (o && o.nombre_num + ' / ' + o.nombre_den));
  // La forma SIN `(col X)`, que es el fallback de `opRATIO` cuando el ctx no trae los nombres.
  // Las dos tienen que andar: el extractor no puede depender de cuál de los dos caminos corrió.
  const s = M.operandosDeRatio_('RATIO dig_impresiones/alcance = 100/25');
  afirmar(s && s.numerador === 100 && s.nombre_num === 'dig_impresiones',
    'y también la forma sin `(col X)` — el fallback de opRATIO');
  // PCT antepone `PCT — ` a la misma traza.
  const p = M.operandosDeRatio_('PCT — RATIO a (col A)/b (col B) = 3/4, 01/07/2026–31/07/2026');
  afirmar(p && p.numerador === 3 && p.denominador === 4, 'anda sobre un PCT, que envuelve al RATIO');
  // Decimales: `opRATIO` suma con `reduce`, así que los operandos pueden no ser enteros.
  const d = M.operandosDeRatio_('RATIO a/b = 10.5/2.5');
  afirmar(d && d.numerador === 10.5 && d.denominador === 2.5, 'soporta operandos con decimales');
  // Denominador cero: `opRATIO` agrega un sufijo que no tiene que confundir al extractor.
  const z = M.operandosDeRatio_('RATIO a (col A)/b (col B) = 5/0 (denominador vacío o cero)');
  afirmar(z && z.numerador === 5 && z.denominador === 0, 'lee el caso denominador = 0');
  // Y el caso que tiene que dar `null` en vez de un número inventado.
  afirmar(M.operandosDeRatio_('SUMA de `Impresiones` sobre 26 fila(s)') === null,
    'una traza que NO es RATIO devuelve null, no un operando fabricado');
}

/* ── 5 · la cuenta de filas sigue siendo legible DESPUÉS de migrar ───────────────────────────
 * ⚠ **Éste es el control que `CLAUDE.md` §4 pide explícitamente:** el instrumento que mide el
 * cambio no puede depender de lo que el cambio modifica. La migración vacía el `filtro` de la
 * hoja, pero el motor **sigue emitiendo la misma traza** porque las dimensiones se traducen a
 * condiciones y pasan por el mismo `aplicarFiltroDeMarcador_` (`Generador.gs`, `D-33`). Lo que
 * cambia es el texto DENTRO de las comillas, y `filasDeTraza_` **no lo usa como ancla**. */
console.log('\n5 · la cuenta de filas se lee igual antes y después de migrar');
{
  const antes = 'filtro `campana~=JM` sobre 26 fila(s) → 4 de 26 fila(s)';
  const despues = 'filtro `campana~=JM` (de dimensiones) sobre 26 fila(s) → 4 de 26 fila(s)';
  const a = M.filasDeTraza_(antes), d = M.filasDeTraza_(despues);
  afirmar(a && a.filtro && a.filtro.quedan === 4 && a.filtro.universo === 26,
    'antes: 4 de 26');
  afirmar(d && d.filtro && d.filtro.quedan === 4 && d.filtro.universo === 26,
    'después: 4 de 26 — el ancla es el rótulo `filtro`, no el texto del filtro');
}

console.log('\n' + (fallas === 0
  ? '✅ Todo en verde. La partición 4 + 22 = 26 está sostenida por el CÓDIGO, no por el dato.'
  : '❌ ' + fallas + ' afirmación(es) fallando. **No correr la tanda 4.**'));
process.exit(fallas === 0 ? 0 : 1);
