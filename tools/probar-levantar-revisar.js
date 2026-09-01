#!/usr/bin/env node
/**
 * tools/probar-levantar-revisar.js — **levantar el `_revisar` de los validados por el CSV**
 * (`D-56`, `2026-08-31_7`).
 *
 * ⛔⛔ **La afirmación que más importa, y sin ella el trabajo se revierte solo:** al levantar el
 * sufijo hay que **neutralizar el `SIN VALIDAR` de `notas`**. `aplicarRevisarASinValidar()` busca
 * esa frase y le vuelve a poner el sufijo, así que **la próxima corrida de la mitad 1 deshace
 * esto** — sin fallar y sin que nadie lo note. El caso `C` lo fija.
 *
 * ⚠ **Y la segunda: el `informe_id` se lee de la HOJA, no se asume.** `curarCamposMarcadores_`
 * indexa por `marcador||informe_id`, y desde la migración de `D-54` **168 filas dicen `*`**. Pasar
 * `'jm'` fijo —como hace `quitarRevisarDeMetaYGoogle()`, escrita antes de la migración— no
 * encuentra la fila.
 *
 * Uso:
 *   node tools/probar-levantar-revisar.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

const HEADERS = ['marcador', 'informe_id', 'formato', 'notas'];

/* `camp_clics` ya migró a `*` — es el caso que separa «lee el informe_id» de «asume jm».
 * `ivr_75` sigue en `jm`. `enc_impresiones` ya está sin sufijo: idempotencia. */
function filasBase() {
  return [
    HEADERS.slice(),
    ['camp_clics', '*', 'entero_revisar', 'ojo: SIN VALIDAR contra el deck'],
    ['ivr_75', 'jm', 'miles_revisar', 'SIN VALIDAR'],
    ['enc_impresiones', '*', 'miles', 'ya validado antes'],
    /* ⭐ Uno de la clase «ausencia acordada», que sin él no se ejercita: el bloque que la
     * distingue no correría y el banco pasaría sin medirla. */
    ['u1_pre_prog_clics', '*', 'entero_revisar', 'SIN VALIDAR'],
    ['frecuencia', 'jm', 'entero_revisar', 'SIN VALIDAR — no está en la lista']
  ];
}

function contexto(opciones) {
  opciones = opciones || {};
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error };
  ctx.__log = [];
  ctx.Logger = { log: (m) => ctx.__log.push(String(m)) };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8'), ctx,
    { filename: 'Instalar.gs' });

  let datos = filasBase();
  const curados = [];
  const hojas = [];
  ctx.__datos = () => datos;
  ctx.__curados = curados;
  ctx.__hojas = hojas;

  const hoja = {
    getDataRange: () => ({ getValues: () => datos.map((f) => f.slice()) }),
    getLastRow: () => datos.length,
    copyTo: () => {
      if (opciones.backupTira) throw new Error('sin permiso (caso negativo)');
      const c = { setName: (n) => { hojas.push(n); return c; }, hideSheet: () => {},
                  getLastRow: () => datos.length };
      return c;
    }
  };
  ctx.SpreadsheetApp = {
    flush: () => {},
    getActiveSpreadsheet: () => ({
      getSheetByName: (n) => (n === 'MARCADORES' ? hoja
                              : (hojas.indexOf(n) !== -1 ? { getLastRow: () => datos.length } : null)),
      deleteSheet: () => {}
    })
  };
  ctx.Utilities = { formatDate: () => '2026-09-01_0100' };
  ctx.Session = { getScriptTimeZone: () => 'America/Argentina/Buenos_Aires' };
  ctx.curarCamposMarcadores_ = (cambios) => {
    cambios.forEach((c) => {
      curados.push(c);
      for (let i = 1; i < datos.length; i++) {
        if (datos[i][0] === c.marcador && datos[i][1] === c.informe_id) {
          if (c.formato !== undefined) datos[i][2] = c.formato;
          if (c.notas !== undefined) datos[i][3] = c.notas;
          return;
        }
      }
      curados[curados.length - 1].__noEncontrada = true;
    });
    return { ok: true, cambios_escritos: cambios.length };
  };
  return ctx;
}

console.log('\n═══ A · MODO SECO — no escribe, y dice el caso de cada uno ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('diagLevantarRevisar()', ctx);
  afirmar(r && r.ok === true && r.aplicado === false, 'devuelve `aplicado: false`');
  afirmar(ctx.__curados.length === 0 && ctx.__hojas.length === 0, '⭐ cero escrituras y cero backup');
  const texto = ctx.__log.join('\n');
  afirmar(/camp_clics.*V-111 · identidad interna/.test(texto),
    '⭐ cada línea trae su caso Y su clase de evidencia');
  afirmar(/u1_pre_prog_clics.*V-120 · ausencia acordada/.test(texto),
    '⭐⭐ y la «ausencia acordada» se nombra distinto — no es reproducir una cifra');
}

console.log('\n═══ B · el `informe_id` sale de la HOJA, no se asume ═══');
{
  const ctx = contexto();
  vm.runInContext('aplicarLevantarRevisar()', ctx);
  const cc = ctx.__curados.filter((c) => c.marcador === 'camp_clics')[0];
  const iv = ctx.__curados.filter((c) => c.marcador === 'ivr_75')[0];
  afirmar(cc && cc.informe_id === '*',
    '⭐⭐ `camp_clics` va con `*` — asumir `jm` no encontraría la fila desde la migración de D-54');
  afirmar(iv && iv.informe_id === 'jm', 'y `ivr_75`, que no migró, va con `jm`');
  afirmar(!ctx.__curados.some((c) => c.__noEncontrada), 'ninguna fila quedó sin encontrar');
}

console.log('\n═══ C · ⛔ `SIN VALIDAR` se NEUTRALIZA — sin esto la mitad 1 revierte todo ═══');
{
  const ctx = contexto();
  vm.runInContext('aplicarLevantarRevisar()', ctx);
  const filas = ctx.__datos();
  const cc = filas.filter((f) => f[0] === 'camp_clics')[0];
  afirmar(cc[2] === 'entero', 'el sufijo `_revisar` se fue (' + cc[2] + ')');
  afirmar(cc[3].indexOf('SIN VALIDAR') === -1,
    '⭐⭐ y `notas` ya NO dice `SIN VALIDAR` — si no, `aplicarRevisarASinValidar()` lo re-marca');
  afirmar(/VALIDADO/.test(cc[3]), 'se reemplaza en vez de borrarse: la historia queda');
  afirmar(/V-111/.test(cc[3]) && /identidad interna/.test(cc[3]),
    '⭐ y la nota dice de qué caso salió, con su `caso_id` — los dos registros dejan de divergir');
}

console.log('\n═══ D · control POSITIVO — lo que NO está en la lista no se toca ═══');
{
  const ctx = contexto();
  vm.runInContext('aplicarLevantarRevisar()', ctx);
  const fr = ctx.__datos().filter((f) => f[0] === 'frecuencia')[0];
  afirmar(fr[2] === 'entero_revisar',
    '⭐ `frecuencia` conserva su `_revisar` — `X-32` contradice AL MOTOR y no está en la lista');
  afirmar(/SIN VALIDAR/.test(fr[3]), 'y su `notas` queda intacta');
}

console.log('\n═══ E · idempotencia ═══');
{
  const ctx = contexto();
  vm.runInContext('aplicarLevantarRevisar()', ctx);
  const antes = ctx.__curados.length;
  const ctx2 = contexto();
  const seco = vm.runInContext('diagLevantarRevisar()', ctx2);
  afirmar(seco.cambios.every((c) => c.marcador !== 'enc_impresiones'),
    '⭐ `enc_impresiones`, que ya estaba sin sufijo, no entra a los cambios');
  afirmar(/ya estaban sin sufijo  : 1/.test(ctx2.__log.join('\n')),
    'y se cuenta aparte en vez de callarse');
  afirmar(antes === 3, 'la primera pasada escribió 3 (' + antes + ')');
}

console.log('\n═══ F · control NEGATIVO — backup que falla, no se escribe ═══');
{
  const ctx = contexto({ backupTira: true });
  const r = vm.runInContext('aplicarLevantarRevisar()', ctx);
  afirmar(r && r.ok === false && /backup/.test(r.motivo), 'aborta con motivo de backup');
  afirmar(ctx.__curados.length === 0, '⭐⭐ y NO llamó al escritor ni una vez');
  afirmar(ctx.__datos().filter((f) => f[0] === 'camp_clics')[0][2] === 'entero_revisar',
    'la hoja quedó intacta');
}

console.log('\n═══ G · la lista y el CSV no pueden divergir sin que se note ═══');
{
  /* ⛔ La lista está escrita en el `.gs` porque los CSV viven en git y el motor en Apps Script.
   * Esta afirmación es lo que evita que se vuelva una lista huérfana: **cada entrada tiene que
   * existir en algún CSV con ese `caso_id`**. */
  const ctx = contexto();
  const lista = vm.runInContext('LEVANTAN_POR_CASO_', ctx);
  const csv = ['docs/casos_validacion_2026-08-19.csv', 'docs/casos_validacion_2026-08-28.csv']
    .map((f) => fs.readFileSync(path.join(RAIZ, f), 'utf8')).join('\n');
  const huerfanos = lista.filter((x) => csv.indexOf(x.caso + ',') === -1);
  afirmar(huerfanos.length === 0,
    '⭐⭐ los ' + lista.length + ' casos de la lista existen en los CSV' +
    (huerfanos.length ? ' — HUÉRFANOS: ' + huerfanos.map((h) => h.caso).join(', ') : ''));
  const evs = {};
  lista.forEach((x) => { evs[x.evidencia] = (evs[x.evidencia] || 0) + 1; });
  afirmar(Object.keys(evs).length === 3,
    'y hay TRES clases de evidencia: ' + JSON.stringify(evs));
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
