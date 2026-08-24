#!/usr/bin/env node
/**
 * tools/probar-tabla-post.js — **la tabla de `L-036`**: los 20 marcadores y los tres bordes que
 * `julio_24_30` ejercita (25/08/2026).
 *
 * Hermano de `probar-tabla-envios.js`. Guarda dos cosas distintas y conviene no mezclarlas:
 *
 *   - **el seed** — que los 20 existan, con la forma correcta, y que los 12 sin fuente NO existan;
 *   - **el comportamiento de `opFILA`** sobre los datos reales de `julio_24_30`, que es lo que
 *     hace que este control valga como control y no como inventario.
 *
 * ⭐ **El fixture NO es inventado: son las dos filas reales de `reuniones/Agenda JM | Post`** del
 * export del 20/08 (`DGPLES _ Seguimiento ECVs`, sha `f8ef3227…`), copiadas y no deducidas — la
 * regla del 17/08. Y por eso los tres bordes son los de verdad y no tres casos elegidos:
 *
 *   1. **Retiro** tiene el camino entero, y su identidad interna cierra **al dígito**.
 *   2. **San Cristóbal** está en **ceros** → *cero real*, que NO es *sin dato*.
 *   3. Son **2 ítems para 4 ranuras** → las filas 3 y 4 salen `sin_datos`, que **no es error**.
 *
 * ⚠ **Lo que este control NO dice, y está anotado en `PENDIENTES`:** que el `id_cuenta` del
 * anclaje coincida con el de la solapa. El cruce del 24/08 fue por `Barrio / Comuna`. **Eso lo
 * cierra una corrida, no un banco.**
 *
 * Uso:
 *   node tools/probar-tabla-post.js
 *   node tools/probar-tabla-post.js --autoprueba
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const MARCADORES_GS = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');
const CENSO = fs.readFileSync(path.join(RAIZ, 'docs', 'CENSO_tokens_sin_fila_2026-08-22.md'), 'utf8');

let fallas = [];
let ok = 0;
function af(cond, msg, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + msg); }
  else { fallas.push(msg); console.log('  ⛔ ' + msg + (detalle ? ' — ' + detalle : '')); }
}

/** El bloque de `L-036` del censo, como LISTA. Cruzar es pertenencia; filtrar por prefijo es regla. */
function tokensDelCenso() {
  const m = CENSO.match(/l[áa]mina\s+9\s+·\s+L-036[^\n]*\n((?:\s{4,}[^\n]*\n)+)/);
  if (!m) throw new Error('No encontré el bloque de L-036 en el censo — si el formato cambió, ' +
    'esta prueba tiene que enterarse en vez de dar verde sobre una lista vacía.');
  return m[1].split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);
}

/** Las filas que el wrapper escribe, ejecutando el seed real con `curarMarcadores_` stubeado. */
function filasDelWrapper(fuente) {
  const ctx = { console, Math, JSON, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} } };
  vm.createContext(ctx);
  const bloque = fuente.match(/var COLUMNAS_POST_L036_ = \[[\s\S]*?\n\];/);
  if (!bloque) throw new Error('No encontré `COLUMNAS_POST_L036_` — si se renombró, esta prueba ' +
    'tiene que enterarse en vez de dar verde sobre otra cosa.');
  const fn = fuente.match(/function cablearTablaPostReuniones_\(\) \{[\s\S]*?\n\}/);
  if (!fn) throw new Error('No encontré `cablearTablaPostReuniones_`.');
  let capturadas = null;
  ctx.curarMarcadores_ = (quitar, agregar) => { capturadas = agregar; return { ok: true }; };
  vm.runInContext(bloque[0] + '\n' + fn[0] + '\ncablearTablaPostReuniones_();', ctx);
  return capturadas;
}

/** `opFILA` real, extraída de `Marcadores.gs`. No se reimplementa (`CLAUDE.md` §4). */
function contextoFila() {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} } };
  vm.createContext(ctx);
  const trozos = ['cacheFilasOrdenadas_', 'huellaDeFilas_', 'filasOrdenadas_', 'opFILA'];
  trozos.forEach((n) => {
    const re = n === 'cacheFilasOrdenadas_'
      ? /var cacheFilasOrdenadas_ = \{\};/
      : new RegExp('function ' + n + '\\([\\s\\S]*?\\n\\}');
    const m = MARCADORES_GS.match(re);
    if (!m) throw new Error('No encontré `' + n + '` en Marcadores.gs.');
    vm.runInContext(m[0], ctx);
  });
  ctx.trazaDeVentana_ = () => '';
  return ctx;
}

/* ⭐ Las DOS filas reales de `Agenda JM | Post` para los ítems de `etapa=post` de `julio_24_30`.
 * Copiadas del fixture del 20/08. Las claves son los encabezados de la fila 2 de la solapa. */
const RETIRO = { ID: '3346-JULJDGAG', Habitantes: 41475, Alcance: 47753,
  'Impresiones totales': 136971, Visualizaciones: 41204, '% VTR': 0.300822801906973, Fecha: 46227 };
const SAN_CRISTOBAL = { ID: '3354-JULJDGAG', Habitantes: 41240, Alcance: 0,
  'Impresiones totales': 0, Visualizaciones: 0, '% VTR': 0, Fecha: 46226 };

console.log('== probar-tabla-post — los 20 de `L-036` y los tres bordes de julio_24_30 ==');

console.log('\n1 · control positivo — el censo se leyó (32 tokens en L-036)');
const censo = tokensDelCenso();
af(censo.length === 32, 'el bloque de L-036 trae los 32 tokens (' + censo.length + ')');
af(censo.indexOf('post_camp1') !== -1, 'y trae `post_camp1`, que es de los que NO se cablean');

console.log('\n2 · cruce UNO POR UNO contra el censo — 5 columnas × 4 filas');
const filas = filasDelWrapper(FUENTE);
af(filas.length === 20, 'el wrapper escribe 20 y nada más (' + filas.length + ')');
const porNombre = {};
filas.forEach((f) => { porNombre[f.marcador] = f; });
['habitantes', 'alcance', 'impresiones', 'vistas', 'vtr'].forEach((col) => {
  for (let n = 1; n <= 4; n++) {
    const t = 'post_' + col + n;
    af(censo.indexOf(t) !== -1 && !!porNombre[t], t + ' está en el censo y tiene fila');
  }
});

console.log('\n3 · ⛔ NEGATIVA — las tres columnas SIN FUENTE no se cablean');
['camp', 'periodo', 'formato'].forEach((col) => {
  const cableadas = [1, 2, 3, 4].filter((n) => !!porNombre['post_' + col + n]).length;
  af(cableadas === 0, 'post_' + col + '1-4 NO tienen fila — no hay columna en ninguna solapa fuente',
    'si aparecen, se eligió una columna a ojo y eso publica texto distinto del que el equipo publica');
});

console.log('\n4 · la forma: FILA, orden declarado, índice entero');
filas.forEach((f) => {
  const n = Number(f.marcador.slice(-1));
  if (f.marcador !== 'post_habitantes1' && n !== 1) return;   // una muestra por columna basta
  af(f.operacion === 'FILA' && f.separador === 'fecha_periodo',
    f.marcador + ' es FILA ordenada por `fecha_periodo` (no hay default: FILA falla sin orden)');
});
af(filas.every((f) => typeof f.valor_fijo === 'number' && f.valor_fijo >= 1 && f.valor_fijo <= 4),
  '⛔ los 20 índices son ENTEROS PELADOS 1-4 — `1/4` lo convierte Sheets en fecha (C-83)');
af(filas.every((f) => f.base_id === 'reuniones' && f.solapa === 'Agenda JM | Post'),
  'los 20 leen `reuniones/Agenda JM | Post`, la solapa POST del par de C-50');
af(filas.every((f) => !f.filtro && !f.dimensiones),
  'sin filtro y sin dimensiones: el temario ya seleccionó, y volver a recortar sacaría ítems que eligió');

console.log('\n5 · ⭐ BORDE 1 — Retiro: el camino entero, y la identidad interna al dígito');
{
  const ctx = contextoFila();
  const ctxFila = (campo, n, enc) => ({
    filas: [RETIRO, SAN_CRISTOBAL], separador: 'fecha_periodo', valor_fijo: n,
    ordenPor: { valores: [RETIRO.Fecha, SAN_CRISTOBAL.Fecha] },
    campo_logico: campo, encabezado: enc, columna: '?', base_id: 'reuniones', solapa: 'Agenda JM | Post'
  });
  /* Ordenado por fecha ascendente, San Cristóbal (46226) va PRIMERO y Retiro (46227) segundo. */
  const vistas = ctx.opFILA(ctxFila('vis_totales', 2, 'Visualizaciones'));
  const impres = ctx.opFILA(ctxFila('imp_totales', 2, 'Impresiones totales'));
  const vtr = ctx.opFILA(ctxFila('vis_vtr_pct', 2, '% VTR'));
  af(vistas.valor === 41204 && impres.valor === 136971, 'la fila 2 es Retiro (ordena por fecha)');
  af(Math.abs((vistas.valor / impres.valor) - vtr.valor) < 1e-12,
    '⭐ % VTR = Visualizaciones / Impresiones, exacto — la identidad interna de la lámina');
  af(!vtr.sin_datos && !vtr.ambiguo, 'y sale con valor, no con hueco');
}

console.log('\n6 · ⭐ BORDE 2 — San Cristóbal en CEROS: cero real, que NO es sin dato');
{
  const ctx = contextoFila();
  const c = {
    filas: [RETIRO, SAN_CRISTOBAL], separador: 'fecha_periodo', valor_fijo: 1,
    ordenPor: { valores: [RETIRO.Fecha, SAN_CRISTOBAL.Fecha] },
    campo_logico: 'imp_totales', encabezado: 'Impresiones totales', columna: 'J',
    base_id: 'reuniones', solapa: 'Agenda JM | Post'
  };
  const r = ctx.opFILA(c);
  af(r.valor === 0, 'la fila 1 es San Cristóbal y su valor es 0');
  af(!r.sin_datos,
    '⛔ y NO es `sin_datos`: un cero medido y un hueco mandan a trabajos distintos');
  /* ⚠ Y el habitantes SÍ tiene dato aunque el resto sea cero — la fila existe, la campaña no midió. */
  c.campo_logico = 'poblacion'; c.encabezado = 'Habitantes';
  af(ctx.opFILA(c).valor === 41240, 'y `poblacion` de esa misma fila sí trae 41.240');
}

console.log('\n7 · ⭐ BORDE 3 — 2 ítems para 4 ranuras: las filas 3 y 4 son `sin_datos`');
{
  const ctx = contextoFila();
  [3, 4].forEach((n) => {
    const r = ctx.opFILA({
      filas: [RETIRO, SAN_CRISTOBAL], separador: 'fecha_periodo', valor_fijo: n,
      ordenPor: { valores: [RETIRO.Fecha, SAN_CRISTOBAL.Fecha] },
      campo_logico: 'imp_totales', encabezado: 'Impresiones totales', columna: 'J',
      base_id: 'reuniones', solapa: 'Agenda JM | Post'
    });
    af(r.sin_datos === true && !r.ambiguo,
      'la fila ' + n + ' sale `sin_datos` y NO es error — no hay tanto encuentro');
  });
}

if (process.argv.indexOf('--autoprueba') !== -1) {
  console.log('\n== autoprueba: control negativo CON MOTIVO ==');
  let malas = 0;
  const casos = [
    {
      nombre: 'le saco el `separador` a las 20 filas',
      mutar: (s) => s.replace("operacion: 'FILA', valor_fijo: n, separador: 'fecha_periodo',",
        "operacion: 'FILA', valor_fijo: n, separador: '',"),
      probar: (f) => f.every((x) => x.separador === 'fecha_periodo')
    },
    {
      nombre: 'le pongo el índice como texto `1/4`',
      mutar: (s) => s.replace('operacion: \'FILA\', valor_fijo: n, separador:',
        'operacion: \'FILA\', valor_fijo: n + \'/4\', separador:'),
      probar: (f) => f.every((x) => typeof x.valor_fijo === 'number')
    }
  ];
  casos.forEach((c) => {
    const mutado = c.mutar(FUENTE);
    if (mutado === FUENTE) {
      console.log('  ⛔ ' + c.nombre + ' — la mutación NO cambió nada, así que no prueba nada');
      malas++;
      return;
    }
    let sigueVerde;
    try { sigueVerde = c.probar(filasDelWrapper(mutado)); } catch (e) { sigueVerde = false; }
    if (!sigueVerde) console.log('  ✅ ' + c.nombre + ' → la afirmación cae');
    else { malas++; console.log('  ⛔ ' + c.nombre + ' → la afirmación SIGUE en verde: no mide lo que dice'); }
  });
  console.log('');
  console.log(malas ? '⛔ la autoprueba encontró ' + malas + ' caso(s) mal medido(s).'
    : '✅ los ' + casos.length + ' casos negativos caen por el motivo correcto.');
  process.exit(malas ? 1 : 0);
}

console.log('');
console.log(fallas.length ? '⛔ ' + fallas.length + ' de ' + (ok + fallas.length) + ' en rojo.'
  : '✅ Las ' + ok + ' afirmaciones pasaron.');
console.log('⚠ Lo que NO dice: que el `id_cuenta` del anclaje coincida con el de la solapa.');
console.log('  El cruce del 24/08 fue por `Barrio / Comuna`. Eso lo cierra una corrida.');
process.exit(fallas.length ? 1 : 0);
