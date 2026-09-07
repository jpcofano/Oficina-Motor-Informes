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

console.log('\n═══ A · ⛔⛔ RETIRADA (06/09/2026) — aborta y NO escribe ═══');
{
  /* ⭐⭐ **Este banco se dio vuelta entero, y el motivo es una decision del usuario del 06/09:**
   * sobrevive `guionesValidados_` y `levantarRevisar_` **se retira**. Sus secciones A a F probaban
   * el comportamiento de ESCRITURA —modo seco, `informe_id` desde la hoja, `SIN VALIDAR`,
   * idempotencia, backup— y **se pusieron rojas diciendo la verdad**: la funcion ya no escribe.
   *
   * ⛔ **Aflojarlas o borrar el banco habria perdido la vigilancia.** Lo que se exige ahora es lo
   * contrario y es igual de estricto: **que NO escriba, que diga POR QUE, y que apunte a su
   * reemplazante.** ⭐ Una funcion eliminada vuelve a escribirse; una que aborta explicando, no.
   *
   * ⚠ La seccion `G` **se conserva intacta**: cruza la lista contra los CSV y **eso sigue
   * valiendo**, porque la lista queda como evidencia fechada de lo que se levanto el 01/09. */
  const ctx = contexto();
  const r = vm.runInContext('diagLevantarRevisar()', ctx);
  afirmar(r && r.ok === false, '⛔ `diagLevantarRevisar()` devuelve `ok: false`');
  afirmar(/retirada/i.test(String((r || {}).motivo || '')),
    '⭐ y su `motivo` dice que esta retirada: ' + JSON.stringify((r || {}).motivo));

  const ctx2 = contexto();
  const r2 = vm.runInContext('aplicarLevantarRevisar()', ctx2);
  afirmar(r2 && r2.ok === false, '⛔⛔ y `aplicarLevantarRevisar()` TAMPOCO escribe');
  afirmar(ctx2.__curados.length === 0 && ctx2.__hojas.length === 0,
    '⭐⭐ CERO escrituras y CERO backup — la afirmacion que de verdad protege');

  const texto = ctx2.__log.join('\n');
  afirmar(/guionesValidados|GuionesValidados/.test(texto),
    '⭐ el log APUNTA a la reemplazante — sin eso, quien la corre queda sin saber a donde ir');
  afirmar(/enc_impresiones/.test(texto) && /ivr_75/.test(texto),
    '⭐⭐ y NOMBRA los 4 que vencieron — el motivo va medido, no argumentado');
}

console.log('\n═══ G · la lista y el CSV no pueden divergir sin que se note ═══');
{
  /* ⛔ La lista está escrita en el `.gs` porque los CSV viven en git y el motor en Apps Script.
   * Esta afirmación es lo que evita que se vuelva una lista huérfana: **cada entrada tiene que
   * existir en algún CSV con ese `caso_id`**. */
  const ctx = contexto();
  const lista = vm.runInContext('LEVANTAN_POR_CASO_', ctx);
  /* ⭐ **Los CSV se descubren con glob, no con una lista escrita a mano.** La lista fija dejó
   * huérfano a `V-124` el día que nació su archivo — el banco lo detectó, que es exactamente lo
   * que tenía que hacer, pero el arreglo correcto es que **un CSV nuevo entre solo**: una lista de
   * archivos que hay que actualizar a mano es justo la clase de lista que nadie actualiza. */
  const csv = fs.readdirSync(path.join(RAIZ, 'docs'))
    .filter((f) => f.indexOf('casos_validacion_') === 0 && f.slice(-4) === '.csv')
    .map((f) => fs.readFileSync(path.join(RAIZ, 'docs', f), 'utf8')).join('\n');
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
