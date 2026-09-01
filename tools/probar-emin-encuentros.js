#!/usr/bin/env node
/**
 * tools/probar-emin-encuentros.js — **la primera fila de ministros, y el ámbito `ministros`**
 * (`2026-09-01_1`).
 *
 * ⭐ **El control que más importa no es que escriba: es `CONTEO` y NO `CUENTA_DISTINTOS`.** Medido
 * sobre el fixture del 28/08: la ventana de `V-49` trae **8 filas** y **7 figuras** —Sánchez Zinny
 * tiene dos encuentros esa semana—. `V-49` espera **8**, así que la unidad es el **encuentro**.
 * **Un `CUENTA_DISTINTOS` publicaría 7 sin fallar**, que es el número plausible de siempre.
 *
 * ⭐⭐ **Y el ámbito `ministros` tiene nombre propio aunque hoy coincida con `gcba`.** Este banco
 * afirma que **existe y que es una negación**, no una lista de nombres: una lista se desactualiza
 * con cada cambio de gabinete y **el ministro nuevo no entra sin que nadie se entere**.
 *
 * Uso:
 *   node tools/probar-emin-encuentros.js
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

const HEADERS = ['marcador', 'familia', 'informe_id', 'base_id', 'solapa', 'campo_logico',
                 'periodo_ref', 'operacion', 'valor_fijo', 'filtro', 'dimensiones', 'formato',
                 'catalogo', 'separador', 'notas'];

function contexto(opciones) {
  opciones = opciones || {};
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error };
  ctx.__log = [];
  ctx.Logger = { log: (m) => ctx.__log.push(String(m)) };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8'), ctx,
    { filename: 'Instalar.gs' });

  let datos = [opciones.sinColumna ? HEADERS.filter((h) => h !== 'dimensiones') : HEADERS.slice()];
  if (opciones.yaExiste) {
    const f = new Array(datos[0].length).fill('');
    f[0] = 'emin_encuentros'; f[10] = 'ambito=OTRA_COSA';
    datos.push(f);
  }
  const hojas = [];
  ctx.__datos = () => datos;
  ctx.__hojas = hojas;
  const hoja = {
    getDataRange: () => ({ getValues: () => datos.map((r) => r.slice()) }),
    getLastRow: () => datos.length,
    appendRow: (r) => datos.push(r.slice()),
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
  ctx.Utilities = { formatDate: () => '2026-09-01_1200' };
  ctx.Session = { getScriptTimeZone: () => 'America/Argentina/Buenos_Aires' };
  return ctx;
}

console.log('\n═══ A · MODO SECO — no escribe ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('diagCablearEminEncuentros()', ctx);
  afirmar(r && r.ok === true && r.aplicado === false, 'devuelve `aplicado: false`');
  afirmar(ctx.__datos().length === 1, '⭐ no agregó ninguna fila');
  afirmar(ctx.__hojas.length === 0, 'y no hizo backup de algo que no toca');
}

console.log('\n═══ B · ⭐ CONTEO y no CUENTA_DISTINTOS — 8 encuentros, no 7 personas ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('diagCablearEminEncuentros()', ctx);
  afirmar(r.fila.operacion === 'CONTEO',
    '⭐⭐ la operación es `CONTEO` (' + r.fila.operacion + ') — `CUENTA_DISTINTOS` daría 7 sin fallar');
  afirmar(r.fila.dimensiones === 'ambito=ministros',
    'el corte va en `dimensiones`, no en `filtro` — `CLAUDE.md` §2');
  afirmar(r.fila.filtro === '', 'y `filtro` queda vacío: no hay restricción técnica');
  afirmar(r.fila.solapa === 'RVD JM-CM - ES',
    '⭐ lee la ancla SOLA — `RDV_otros_ministros` aporta cero, medido');
  afirmar(r.fila.informe_id === 'secco', 'nace con `informe_id = secco`, no `*`: `jm` no tiene la lámina');
  afirmar(!/_revisar/.test(r.fila.formato),
    '⭐ y SIN `_revisar`: `V-49` la valida y el número se reprodujo (D-56)');
  afirmar(/V-49/.test(r.fila.notas) && /8 filas/.test(r.fila.notas),
    'la nota cita el caso y el número reproducido');
}

console.log('\n═══ C · el ámbito `ministros` existe y es una NEGACIÓN ═══');
{
  const fuentes = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
  afirmar(/ministros:\s*\{[\s\S]{0,120}'rdv\|RVD JM-CM - ES':\s*'figura!=Jorge Macri'/.test(fuentes),
    '⭐⭐ `DIMENSIONES_.ambito.ministros` existe y es `figura!=Jorge Macri`');
  afirmar(/gcba[\s\S]{0,4000}'rdv\|RVD JM-CM - ES':\s*'figura!=Jorge Macri'/.test(fuentes),
    'y `gcba` sigue teniendo la suya — el nombre nuevo NO reemplaza al viejo');
  /* ⛔ Una lista de 17 nombres se desactualiza con cada cambio de gabinete y falla en silencio:
   * el ministro nuevo no entra y nadie se entera. La negación lo incluye solo. */
  afirmar(!/ministros:\s*\{[\s\S]{0,200}figura=/.test(fuentes),
    '⭐ y NO es una lista de nombres — una lista deja afuera al ministro nuevo, en silencio');
}

console.log('\n═══ D · idempotencia: si la fila existe, NO se pisa ═══');
{
  const ctx = contexto({ yaExiste: true });
  const r = vm.runInContext('cablearEminEncuentros()', ctx);
  afirmar(r && r.aplicado === false && r.motivo === 'ya existe', 'no aplica');
  afirmar(ctx.__datos()[1][10] === 'ambito=OTRA_COSA',
    '⭐⭐ y NO pisó el valor que había — esa decisión no vive en ningún otro lado');
  afirmar(ctx.__hojas.length === 0, 'ni hizo backup de algo que no iba a tocar');
}

console.log('\n═══ E · aplicar: backup, escritura y relectura campo por campo ═══');
{
  const ctx = contexto();
  const r = vm.runInContext('cablearEminEncuentros()', ctx);
  afirmar(r && r.ok === true && r.aplicado === true, 'aplica');
  afirmar(ctx.__hojas.length === 1 && /_emin$/.test(ctx.__hojas[0]),
    '⭐ con backup propio, con su motivo en el nombre: `' + ctx.__hojas[0] + '`');
  const fila = ctx.__datos()[1];
  afirmar(fila[0] === 'emin_encuentros' && fila[7] === 'CONTEO' && fila[10] === 'ambito=ministros',
    'la fila quedó con marcador, operación y dimensiones correctos');
  afirmar(/RELEÍDA campo por campo/.test(ctx.__log.join('\n')),
    '⭐ y relee de la hoja — en Sheets la celda pasa por la coerción de tipos');
}

console.log('\n═══ F · control NEGATIVO — backup que falla no escribe ═══');
{
  const ctx = contexto({ backupTira: true });
  const r = vm.runInContext('cablearEminEncuentros()', ctx);
  afirmar(r && r.ok === false && /backup/.test(r.motivo), 'aborta con motivo de backup');
  afirmar(ctx.__datos().length === 1, '⭐⭐ y NO agregó la fila');
}

console.log('\n═══ G · control NEGATIVO — una columna que falta ABORTA ═══');
{
  /* ⛔ `CLAUDE.md` §2: agregar una columna es tocar N lectores, y el síntoma nunca es un error —
   * es un valor que se pierde. Si `dimensiones` no existiera, el corte desaparecería y el
   * marcador leería la solapa entera: JM incluido. */
  const ctx = contexto({ sinColumna: true });
  const r = vm.runInContext('cablearEminEncuentros()', ctx);
  afirmar(r && r.ok === false && /columnas faltantes/.test(r.motivo),
    '⭐⭐ sin la columna `dimensiones` ABORTA — si no, el corte se perdería y entraría Jorge Macri');
  afirmar(ctx.__datos().length === 1, 'y no escribió nada');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
