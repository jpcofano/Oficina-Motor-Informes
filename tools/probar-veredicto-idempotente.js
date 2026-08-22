#!/usr/bin/env node
/**
 * tools/probar-veredicto-idempotente.js — control positivo del veredicto de
 * `curarCamposMarcadores_` (`Instalar.gs`), **fuera de Apps Script** y extrayendo el código real.
 *
 * ⭐ **Por qué existe, y es la regla de `CLAUDE.md` §4 aplicada el mismo día que se escribe la
 * rama:** *"una rama nueva que nunca se ejecutó no está sin probar: está sin escribir el
 * control"*. El `22/08` se partió el veredicto de «cero celdas escritas» en **tres** causas
 * —falta la fila · difiere · ya estaba— donde antes había **una**, y ninguna de las 27 suites
 * del repo tocaba esa función. **El verde de al lado no dice nada sobre código que ninguna
 * afirmación mira.**
 *
 * **El caso que lo fuerza, medido:** `marcarProgrammaticARevisar()` encontró las ocho filas ya en
 * `miles_revisar` y el wrapper imprimió **«⛔ FALLÓ»** aclarando en el mismo mensaje que era
 * idempotencia. Un veredicto que se contradice tres palabras después no es un veredicto.
 *
 * ⚠ **Lo que este control tiene que probar NO es sólo que el caso nuevo dé verde**, que es la
 * mitad fácil: tiene que probar que **las dos causas que sí son falla siguen fallando**. Si sólo
 * afirmara la rama nueva, un `return { ok: true }` incondicional lo pasaría entero — y eso es
 * exactamente el agujero que la guarda del `17/08` vino a tapar.
 *
 * ⚠ **Y la mezcla es el caso que separa un veredicto de un atajo:** una fila que ya estaba MÁS
 * una fila que no existe **es falla**, no idempotencia. Un `if` que preguntara sólo *"¿escribí
 * algo?"* y *"¿alguna ya estaba?"* daría verde ahí.
 *
 * **Extrae el código real, no una copia** — mismo criterio que `probar-tanda4.js` y
 * `probar-encabezado.js`: una copia pegada acá probaría la copia y seguiría en verde sobre
 * código que ya no existe.
 *
 * Uso:
 *   node tools/probar-veredicto-idempotente.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/** Idéntica a la de `probar-tanda4.js`: cuenta llaves y **falla** si no encuentra el nombre. */
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
 * Arma el entorno mínimo de Apps Script que la función toca: `SpreadsheetApp`, `Logger` y una
 * hoja con `getDataRange().getValues()` y `getRange().setValue()`.
 *
 * ⭐ **`escrituras` se acumula y se afirma.** Que el veredicto diga «cero» no prueba que no haya
 * escrito: son dos afirmaciones distintas, y el día que se separen hay que enterarse.
 */
function construir(fuente, filas) {
  const escrituras = [];
  const logs = [];
  const datos = filas.map((f) => f.slice());
  const hoja = {
    getDataRange: () => ({ getValues: () => datos }),
    getRange: (r, c) => ({
      setValue: (v) => { escrituras.push({ fila: r, col: c, valor: v }); datos[r - 1][c - 1] = v; }
    })
  };
  const sandbox = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: (n) => (n === 'MARCADORES' ? hoja : null) }) },
    Logger: { log: (m) => logs.push(String(m)) }
  };
  const fn = new Function('SpreadsheetApp', 'Logger',
    fuente + '\nreturn curarCamposMarcadores_;')(sandbox.SpreadsheetApp, sandbox.Logger);
  return { fn, escrituras, logs };
}

const FUENTE = extraerFuncion('Instalar.gs', 'curarCamposMarcadores_');

/** La hoja de juguete. Las ocho `imp_*` de hoy, reducidas a tres, más una con `formato` distinto. */
const HOJA = [
  ['marcador', 'informe_id', 'formato', 'filtro'],
  ['imp_meta_jm', 'jm', 'miles_revisar', 'imp_totales!=0'],
  ['imp_google_jm', 'jm', 'miles_revisar', 'imp_totales!=0'],
  ['imp_prog_jm', 'jm', 'miles_revisar', 'imp_totales!=0'],
  ['enc_impresiones', 'jm', 'miles', 'imp_totales!=0']
];

let ok = 0, mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-veredicto-idempotente ==');
console.log('');

/* ─────────────────────────────────────────────────────────────────────────────────────────── */
console.log('1 · las tres filas YA ESTÁN en el estado pedido → ÉXITO idempotente');
{
  const { fn, escrituras, logs } = construir(FUENTE, HOJA);
  const r = fn([
    { marcador: 'imp_meta_jm', informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'imp_google_jm', informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'imp_prog_jm', informe_id: 'jm', formato: 'miles_revisar' }
  ]);
  af('devuelve ok:true', r.ok === true, 'devolvió ok=' + r.ok + ' · motivo: ' + r.motivo);
  af('se declara idempotente', r.idempotente === true);
  af('cambios_escritos = 0', r.cambios_escritos === 0);
  af('no escribió NINGUNA celda de verdad', escrituras.length === 0, escrituras.length + ' escritura(s)');
  af('el cero NO es silencioso: lo anuncia por Logger', logs.some((l) => /CERO CELDAS ESCRITAS/.test(l)));
  af('trae el diagnóstico por marcador', /YA ESTABA/.test(r.diagnostico || ''));
}

/* ─────────────────────────────────────────────────────────────────────────────────────────── */
console.log('');
console.log('2 · falta la fila → SIGUE FALLANDO (la mitad del 17/08 que no se deroga)');
{
  const { fn } = construir(FUENTE, HOJA);
  const r = fn([{ marcador: 'imp_inexistente', informe_id: 'jm', formato: 'miles_revisar' }]);
  af('devuelve ok:false', r.ok === false);
  af('no se declara idempotente', !r.idempotente);
  af('el motivo nombra la clave que no existe', /NO existen en MARCADORES/.test(r.motivo || ''));
}

/* ─────────────────────────────────────────────────────────────────────────────────────────── */
console.log('');
console.log('3 · la fila existe y DIFIERE → escribe, y no es idempotencia');
{
  const { fn, escrituras } = construir(FUENTE, HOJA);
  const r = fn([{ marcador: 'enc_impresiones', informe_id: 'jm', formato: 'miles_revisar' }]);
  af('devuelve ok:true', r.ok === true);
  af('NO se declara idempotente', !r.idempotente, 'un cambio real no puede pasar por idempotente');
  af('cambios_escritos = 1', r.cambios_escritos === 1);
  af('escribió exactamente una celda', escrituras.length === 1);
  af('escribió el valor pedido', escrituras[0] && escrituras[0].valor === 'miles_revisar');
}

/* ─────────────────────────────────────────────────────────────────────────────────────────── */
console.log('');
console.log('4 · ⭐ MEZCLA: una ya estaba + una que no existe → FALLA, no idempotencia');
{
  const { fn } = construir(FUENTE, HOJA);
  const r = fn([
    { marcador: 'imp_meta_jm', informe_id: 'jm', formato: 'miles_revisar' },
    { marcador: 'imp_fantasma', informe_id: 'jm', formato: 'miles_revisar' }
  ]);
  af('devuelve ok:false', r.ok === false, 'una huérfana en el lote no puede dar verde');
  af('no se declara idempotente', !r.idempotente);
  af('el sin_fila trae la huérfana', (r.sin_fila || []).join(' ').indexOf('imp_fantasma') !== -1);
}

/* ─────────────────────────────────────────────────────────────────────────────────────────── */
console.log('');
console.log('5 · la columna no existe → sigue siendo todo-o-nada (guarda del 15/08, intacta)');
{
  const { fn, escrituras } = construir(FUENTE, HOJA);
  const r = fn([{ marcador: 'imp_meta_jm', informe_id: 'jm', dimensiones: 'ambito=jm' }]);
  af('devuelve ok:false', r.ok === false);
  af('nombra la columna faltante', (r.columnas_faltantes || []).indexOf('dimensiones') !== -1);
  af('no escribió nada', escrituras.length === 0);
  af('no se declara idempotente', !r.idempotente, 'una columna que falta no es «ya estaba»');
}

/* ─────────────────────────────────────────────────────────────────────────────────────────── */
console.log('');
console.log('6 · control negativo — que la afirmación 1 SEPA ponerse roja');
{
  /* ⚠ Sin esto, un `return { ok: true, idempotente: true }` incondicional pasaría el caso 1 y
   * nadie se enteraría. El parche se EXIGE: si no matchea, la prueba falla en vez de dar verde
   * sobre un código que no se rompió. Es la lección de los dos parches con CRLF del 22/08. */
  const marca = /ok: true, idempotente: true/;
  if (!marca.test(FUENTE)) {
    af('el parche exige su marca', false, 'no encontré `ok: true, idempotente: true` — ¿cambió el código?');
  } else {
    const roto = FUENTE.replace(marca, 'ok: false, idempotente: false');
    const { fn } = construir(roto, HOJA);
    const r = fn([{ marcador: 'imp_meta_jm', informe_id: 'jm', formato: 'miles_revisar' }]);
    af('con el veredicto roto, el caso 1 se pone rojo', r.ok === false,
      'el control no distingue el código bueno del roto: no prueba nada');
  }
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
