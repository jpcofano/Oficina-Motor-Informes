#!/usr/bin/env node
/**
 * tools/probar-migracion-asterisco.js — **las dos mitades del cierre: modo seco, backup y `*`**
 * (`2026-08-31_6` Parte A).
 *
 * ⛔⛔ **Son DOS objetivos y el banco los trata como tales**, porque el riesgo es distinto:
 *
 *   - **los `_revisar`** cambian lo que publica `jm` **HOY** — marcan como sospechosos números que
 *     hoy salen limpios, en un informe **en producción**;
 *   - **las `*`** no mueven ningún número de `jm`: agregan `secco`.
 *
 * ⭐ **El caso que más importa es el del backup**, y no es ceremonia: `MARCADORES` **no tiene
 * `SEED_*` y no lo va a tener** (`D-17`), así que **la hoja es la única copia que existe**. Si el
 * backup falla y se escribe igual, deshacer 168 filas es reescribirlas a mano.
 *
 * Uso:
 *   node tools/probar-migracion-asterisco.js
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

/* `en_secco` es un token que vive en la plantilla de `secco`; `solo_jm` no. `ya_asterisco` ya
 * migró — la idempotencia tiene que respetarla. Y `sin_validar_*` ejercitan la otra mitad. */
function filasBase() {
  return [
    ['marcador', 'informe_id', 'formato', 'notas'],
    ['en_secco', 'jm', 'entero', 'nota previa'],
    ['solo_jm', 'jm', 'entero', ''],
    ['ya_asterisco', '*', 'entero', ''],
    ['m2_campanias', 'jm', 'miles', 'la fila SE CONSERVA'],
    ['sin_validar_a', 'jm', 'entero', 'ojo: SIN VALIDAR contra el deck'],
    ['sin_validar_b', 'jm', '', 'SIN VALIDAR']
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
  const escrituras = [];
  const hojasCreadas = [];
  ctx.__escrituras = escrituras;
  ctx.__hojas = hojasCreadas;
  ctx.__datos = () => datos;

  const hojaMarcadores = {
    getDataRange: () => ({ getValues: () => datos.map((f) => f.slice()) }),
    getLastRow: () => datos.length,
    getRange: (fila, col) => ({
      setValue: (v) => { escrituras.push({ fila, col, valor: v }); datos[fila - 1][col - 1] = v; }
    }),
    copyTo: () => {
      const copia = {
        setName: (n) => { hojasCreadas.push(n); copia.__nombre = n; return copia; },
        hideSheet: () => {},
        getLastRow: () => (opciones.backupCorto ? 1 : datos.length)
      };
      if (opciones.backupTira) throw new Error('sin permiso para copiar (caso negativo)');
      return copia;
    }
  };
  ctx.SpreadsheetApp = {
    flush: () => {},
    getActiveSpreadsheet: () => ({
      getSheetByName: (n) => {
        if (n === 'MARCADORES') return hojaMarcadores;
        if (hojasCreadas.indexOf(n) !== -1) {
          return { getLastRow: () => (opciones.backupCorto ? 1 : datos.length) };
        }
        return null;
      },
      deleteSheet: () => {}
    })
  };
  ctx.Utilities = { formatDate: () => '2026-08-31_2359' };
  ctx.Session = { getScriptTimeZone: () => 'America/Argentina/Buenos_Aires' };
  ctx.tokensDePlantilla_ = () => ['en_secco', 'ya_asterisco', 'm2_campanias', 'sin_validar_a'];
  ctx.curarCamposMarcadores_ = (cambios) => {
    cambios.forEach((c) => escrituras.push({ via: 'curar', marcador: c.marcador, formato: c.formato }));
    return { ok: true, cambios_escritos: cambios.length };
  };
  return ctx;
}

console.log('\n═══ A · MODO SECO — las dos mitades, y ninguna escribe ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('diagCierreParaGenerar()', ctx);
  afirmar(r && r.ok === true, 'el wrapper de diagnóstico devuelve ok');
  afirmar(ctx.__escrituras.length === 0, '⭐⭐ CERO escrituras en las DOS mitades');
  afirmar(ctx.__hojas.length === 0, '⭐ y CERO backups — no hace falta respaldar lo que no se toca');
  const texto = ctx.__log.join('\n');
  afirmar(/LAS DOS CIFRAS, JUNTAS/.test(texto), 'imprime las dos cifras juntas');
  afirmar(/Se aprueba y se aplica la 1 ANTES/.test(texto),
    '⭐ y dice el orden con su motivo, no como procedimiento');
}

console.log('\n═══ B · las `*`: el conjunto y la idempotencia ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('diagAsteriscoCompartidos()', ctx);
  const nombres = r.cambios.map((c) => c.marcador).sort();
  afirmar(JSON.stringify(nombres) === JSON.stringify(['en_secco', 'm2_campanias', 'sin_validar_a']),
    '⭐ migra los que están en la plantilla de `secco` (' + nombres.join(', ') + ')');
  afirmar(nombres.indexOf('solo_jm') === -1,
    '⭐ CONTROL POSITIVO: `solo_jm` NO está en `secco` y se queda en `jm`');
  afirmar(nombres.indexOf('ya_asterisco') === -1, 'y `ya_asterisco` no se vuelve a tocar (idempotencia)');
  afirmar(r.cambios.every((c) => c.informe_actual === 'jm'),
    '⭐ el modo seco declara el `informe_id` ACTUAL de cada fila, no sólo el destino');
}

console.log('\n═══ C · el sello y la nota de `m2_campanias` ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('diagAsteriscoCompartidos()', ctx);
  const m2 = r.cambios.filter((c) => c.marcador === 'm2_campanias')[0];
  const otro = r.cambios.filter((c) => c.marcador === 'en_secco')[0];
  afirmar(/Validación es de jm/.test(otro.notas),
    '⭐ el sello dice que la validación es de `jm` — un sello heredado que parezca validación es peor que ninguno');
  afirmar(/nota previa/.test(otro.notas), 'y CONSERVA la nota que la fila ya tenía');
  afirmar(/en secco NADIE declaró nada/.test(m2.notas),
    '⭐⭐ `m2_campanias` lleva su matiz propio — está sana y NO se excluye, pero se dice qué no está declarado');
  afirmar(!/NADIE declaró/.test(otro.notas), 'y esa nota va sólo en su fila, no en las 168');
}

console.log('\n═══ D · APLICAR: backup primero, relectura después ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('aplicarAsteriscoCompartidos()', ctx);
  afirmar(r && r.ok === true && r.aplicados === 3, 'aplica las 3 (' + (r && r.aplicados) + ')');
  afirmar(ctx.__hojas.length === 1 && /_BACKUP_MARCADORES_/.test(ctx.__hojas[0]),
    '⭐ hizo backup, con fecha en el nombre: `' + ctx.__hojas[0] + '`');
  afirmar(/asterisco/.test(ctx.__hojas[0]), 'y el nombre dice de qué mitad es el backup');
  const filas = ctx.__datos();
  afirmar(filas[2][1] === 'jm', '⭐ `solo_jm` sigue en `jm` después de aplicar');
  afirmar(filas[1][1] === '*', '`en_secco` quedó en `*`');
  afirmar(/RELEÍDOS de la hoja/.test(ctx.__log.join('\n')),
    '⭐ y relee de la hoja — «pedí que quedara así» y «quedó así» son dos afirmaciones');
}

console.log('\n═══ E · control NEGATIVO — backup que TIRA: no se escribe nada ═══');
{
  const ctx = contexto({ backupTira: true });
  const r = vm.runInContext('aplicarAsteriscoCompartidos()', ctx);
  afirmar(r && r.ok === false && /backup/.test(r.motivo), 'devuelve `ok: false` con motivo de backup');
  afirmar(ctx.__escrituras.length === 0,
    '⭐⭐ CERO escrituras — `MARCADORES` no tiene seed, así que sin backup no hay vuelta atrás');
  afirmar(ctx.__datos()[1][1] === 'jm', 'y la hoja quedó intacta');
}

console.log('\n═══ F · control NEGATIVO — backup INCOMPLETO también aborta ═══');
{
  /* ⛔ El caso que separa «se creó la hoja» de «tiene los datos». Un backup vacío pasa cualquier
   * chequeo de existencia y no sirve para nada. */
  const ctx = contexto({ backupCorto: true });
  const r = vm.runInContext('aplicarAsteriscoCompartidos()', ctx);
  afirmar(r && r.ok === false, 'aborta con `ok: false`');
  afirmar(/fila\(s\) y el original/.test(r.motivo),
    '⭐⭐ el motivo compara las cuentas de filas — «se creó» y «tiene los datos» son dos cosas');
  afirmar(ctx.__escrituras.length === 0, 'y no escribió nada');
}

console.log('\n═══ G · la mitad de los `_revisar`, con su backup propio ═══');
{
  const ctx = contexto();
  const seco = vm.runInContext('diagRevisarASinValidar()', ctx);
  afirmar(seco.cambios.length === 2, 'el modo seco ve las 2 filas con `SIN VALIDAR` sin sufijo');
  afirmar(ctx.__escrituras.length === 0, 'y no escribe');
  afirmar(seco.cambios.filter((c) => c.marcador === 'sin_validar_b')[0].formato === 'texto_revisar',
    '⭐ con `formato` vacío le pone `texto_revisar`, no `_revisar` solo');

  const ctx2 = contexto();
  const ap = vm.runInContext('aplicarRevisarASinValidar()', ctx2);
  afirmar(ap && ap.ok === true, 'aplicar devuelve ok');
  afirmar(ctx2.__hojas.length === 1 && /revisar/.test(ctx2.__hojas[0]),
    '⭐ y tiene su PROPIO backup, con su motivo en el nombre — son dos objetivos, dos backups');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
