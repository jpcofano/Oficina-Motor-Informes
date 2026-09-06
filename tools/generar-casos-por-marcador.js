#!/usr/bin/env node
/**
 * tools/generar-casos-por-marcador.js — **emite la constante `CASOS_POR_MARCADOR_` para pegar en
 * `Auditoria.gs`.** Parte C.1 del `2026-09-06_3`.
 *
 * ⛔⛔ **Por qué hace falta un generador y no un lector:** los `casos_validacion_*.csv` **no están
 * en Drive** —viven en el repo, y el propio código lo dice: *«el cruce completo se hace en disco»*—.
 * ⇒ Un diagnóstico de Apps Script que quiera cruzar `MARCADORES` **vivo** contra los casos **no los
 * puede leer**. La única forma es que la lista viaje como constante.
 *
 * ⚠ **Y eso es exactamente la «lista congelada» que hundió a `confirmarNumerosDeUnoAUno()`**, cuya
 * lista del 26/08 no pudo enterarse de `X-42` y `X-43` del 28/08. ⭐ **Por eso la constante lleva su
 * FECHA DE GENERACIÓN adentro** y el consumidor la imprime: una lista congelada **que declara
 * cuándo se congeló** se puede auditar; una que no, miente en silencio.
 *
 * ⭐ Aplica **`D-58`** al generar —cuando dos casos hablan del mismo marcador, **manda el más
 * nuevo**— y **desarma** los `token_propuesto` con varios marcadores en una celda (`V-125` trae
 * seis separados por ` / `), porque **contar celdas en vez de marcadores da un número que no
 * corresponde a nada**.
 *
 * Uso:  node tools/generar-casos-por-marcador.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const DOCS = path.join(RAIZ, 'docs');
const CSV = require('./lib-csv');   // el lector estricto compartido

const archivos = fs.readdirSync(DOCS)
  .filter(n => /^casos_validacion_.*\.csv$/.test(n)).sort();   // orden = orden de fecha

const porMarcador = {};
let referencias = 0, celdasMulti = 0;
archivos.forEach(nombre => {
  const filas = CSV.parsear(fs.readFileSync(path.join(DOCS, nombre), 'utf8'));
  const head = filas[0].map(h => h.trim());
  const iId = head.indexOf('caso_id'), iTok = head.indexOf('token_propuesto'), iEst = head.indexOf('estado');
  if (iId < 0 || iTok < 0 || iEst < 0) { console.error('⛔ ' + nombre + ': faltan columnas'); process.exit(1); }
  filas.slice(1).forEach(f => {
    const id = (f[iId] || '').trim();
    if (!/^[A-Z]+-\d+$/.test(id)) return;
    const trozos = (f[iTok] || '').split('/').map(s => s.trim()).filter(Boolean);
    if (trozos.length > 1) celdasMulti++;
    trozos.forEach(t => {
      if (!/^[a-z][a-z0-9_]*$/.test(t)) return;        // descarta prosa
      referencias++;
      /* ⭐ `D-58` aplicado al generar: el último que se ve gana, y el recorrido va por fecha. */
      porMarcador[t] = { estado: (f[iEst] || '').trim(), caso: id,
        archivo: nombre.replace('casos_validacion_', '').replace('.csv', '') };
    });
  });
});

const nombres = Object.keys(porMarcador).sort();
const hoy = new Date().toISOString().slice(0, 10);
const cuenta = e => nombres.filter(n => porMarcador[n].estado === e).length;

console.log('/* ══════════════════════════════════════════════════════════════════════════════');
console.log(' * ⭐⭐ `CASOS_POR_MARCADOR_` — GENERADA, NO ESCRITA A MANO.');
console.log(' *');
console.log(' * Regenerar con:  node tools/generar-casos-por-marcador.js');
console.log(' *');
console.log(' * ⛔ **Es una lista CONGELADA y lleva su fecha adentro a propósito.** Los');
console.log(' * `casos_validacion_*.csv` no están en Drive, así que un diagnóstico de Apps Script no');
console.log(' * los puede leer: la única forma es que la lista viaje como constante. ⚠ Es la misma');
console.log(' * figura que hundió a `confirmarNumerosDeUnoAUno()` —lista del 26/08 que no pudo');
console.log(' * enterarse de `X-42` y `X-43` del 28/08— y lo único que la hace auditable es que');
console.log(' * **declare cuándo se congeló**. El consumidor imprime esa fecha, siempre.');
console.log(' *');
console.log(' * ⭐ `D-58` aplicado al generar: cuando dos casos hablan del mismo marcador, manda el');
console.log(' * más nuevo. Y los `token_propuesto` con varios marcadores en una celda vienen');
console.log(' * DESARMADOS —' + celdasMulti + ' celdas, ' + referencias + ' referencias— porque contar celdas');
console.log(' * en vez de marcadores da un número que no corresponde a nada.');
console.log(' * ══════════════════════════════════════════════════════════════════════════════ */');
/* ⚠ Comillas SIMPLES, como todo el repo: el banco las busca así y `JSON.stringify` emite dobles. */
console.log("var CASOS_POR_MARCADOR_GENERADA_ = '" + hoy + "';");
console.log('var CASOS_POR_MARCADOR_ARCHIVOS_ = ' + archivos.length + ';');
console.log('/* ' + nombres.length + ' marcadores · exacto ' + cuenta('exacto') +
  ' · contradice ' + cuenta('contradice') + ' · cerrado ' + cuenta('cerrado') +
  ' · abierto ' + cuenta('abierto') + ' */');
console.log('var CASOS_POR_MARCADOR_ = {');
nombres.forEach((n, i) => {
  const c = porMarcador[n];
  console.log("  '" + n + "': { estado: '" + c.estado + "', caso: '" + c.caso + "', csv: '" +
    c.archivo + "' }" + (i < nombres.length - 1 ? ',' : ''));
});
console.log('};');
console.error('⇒ ' + nombres.length + ' marcadores desde ' + archivos.length + ' CSV · ' +
  referencias + ' referencias · ' + celdasMulti + ' celdas con varios');
