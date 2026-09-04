#!/usr/bin/env node
/**
 * tools/probar-cambios-0409.js — los tres cambios del `2026-09-04_5` (B.1, B.2, B.3).
 *
 * ⭐⭐ **Lo que este banco existe para afirmar, y es lo único que un ojo no distingue:** que el
 * formato elegido para los tres `%` es `porcentaje_sin_signo` y **NO `fraccion`**. Las dos
 * "sacan el signo"; una publica **18.3** y la otra **1832.2**. ⛔ **Un error de orden de magnitud
 * que no falla: publica un número plausible.**
 *
 * ⚠ **Se extraen `opPCT` y `formatearValorMarcador_` REALES** — no se reimplementa el formateo.
 *
 * Uso:  node tools/probar-cambios-0409.js
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

/* ⚠ Corte por el `}` en columna 0: estas funciones llevan regex con llaves adentro y un contador
 * de llaves cuenta las del regex. Es el error que el `2026-09-02` sacó de `tools/inventario.js`. */
function ex(src, firma) {
  const i = src.indexOf(firma);
  if (i === -1) throw new Error('no encontré `' + firma + '`');
  return src.slice(i, src.indexOf('\n}', i) + 2);
}

const INS = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const GEN = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
const MAR = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');

/* La tabla REAL, extraída de `Instalar.gs`. */
const ctxT = {};
vm.createContext(ctxT);
{
  const i = INS.indexOf('var PLANTILLA_EMIN_LISTA_ =');
  const j = INS.indexOf('var CAMBIOS_0409_ = [');
  vm.runInContext(INS.slice(i, INS.indexOf('\n];', j) + 3), ctxT);
}
const CAMBIOS = ctxT.CAMBIOS_0409_;

/* Las funciones REALES de formato y operación. */
const ctxF = { Utilities: {}, Session: { getScriptTimeZone: () => 'GMT-3' },
  trazaDeVentana_: () => '', parsearFechaCelda_: () => null };
vm.createContext(ctxF);
vm.runInContext([ex(MAR, 'function opRATIO'), ex(MAR, 'function opPCT'),
  ex(GEN, 'function formatearValorMarcador_')].join('\n'), ctxF);

console.log('═══ A · B.1 · la plantilla pierde el condicional y usa el nombre que EXISTE ═══');
{
  const l = CAMBIOS.find(c => c.marcador === 'emin_lista');
  afirmar(!!l && l.campo === 'campo_logico', '`emin_lista` cambia su `campo_logico`');
  afirmar(!!l && l.a === '{figura} {barrio} {fecha:dd/MM}',
    '⭐ queda `' + (l ? l.a : '') + '` — funcionario + barrio + fecha sin año');
  /* ⛔ El nombre lógico es `figura`. `funcionario` es el ENCABEZADO de la columna B, no el campo. */
  afirmar(!!l && /\{figura\}/.test(l.a),
    '⭐⭐ usa `{figura}`, el nombre que EXISTE en `MAPEO` — no `{funcionario}`, que es el encabezado');
  afirmar(!!l && !/\{funcionario\}/.test(l.a), '⛔ y NO usa `{funcionario}`: no existe como campo lógico');
  afirmar(!!l && l.a.indexOf('?') === -1 && l.a.indexOf('=') === -1,
    '⭐ sin condicional: con el barrio SIEMPRE presente, las tres filas del ciclo ya se distinguen');
  afirmar(!!l && /:dd\/MM\}/.test(l.a), '   y la fecha va `dd/MM`, sin año');
}

console.log('\n═══ B · ⭐⭐ B.2 · `porcentaje_sin_signo` y NO `fraccion` — la diferencia es 100× ═══');
{
  const pct = CAMBIOS.filter(c => /^emin_(or|ctor|ctr)$/.test(c.marcador));
  afirmar(pct.length === 3, 'son los tres `emin_*` de porcentaje');
  pct.forEach(c => afirmar(c.a === 'porcentaje_sin_signo_revisar',
    '  `' + c.marcador + '` → ' + c.a));
  pct.forEach(c => afirmar(!/fraccion/.test(c.a),
    '  ⛔ `' + c.marcador + '` NO usa `fraccion`'));
  /* ⛔ Y conservan `_revisar`: nacieron propuesta y no hay caso que los levante. */
  pct.forEach(c => afirmar(/_revisar$/.test(c.a),
    '  ⚠ `' + c.marcador + '` conserva `_revisar` — no hay caso que lo levante'));

  /* ⭐⭐ EL CASO QUE DISTINGUE, con los tres pares REALES del deck `secco-20260903-234123`. */
  console.log('');
  const casos = [['emin_or', 90023, 491344, '-18.3-'], ['emin_ctor', 1699, 90023, '-1.9-'],
    ['emin_ctr', 2638, 893351, '-0.3-']];
  casos.forEach(([n, num, den, esperado]) => {
    const v = ctxF.opPCT({ valoresNumerador: [num], valoresDenominador: [den], campo_logico: 'a/b' }).valor;
    const conNuevo = ctxF.formatearValorMarcador_(v, 'porcentaje_sin_signo_revisar');
    const conViejo = ctxF.formatearValorMarcador_(v, 'porcentaje_revisar');
    const conFraccion = ctxF.formatearValorMarcador_(v, 'fraccion_revisar');
    afirmar(conNuevo === esperado,
      '⭐ `' + n + '`: el formato nuevo da ' + conNuevo + ' (crudo ' + v.toFixed(4) + ')');
    /* ⚠ El viejo reproduce el deck: eso PRUEBA que el número ya era correcto y sólo sobraba el signo. */
    afirmar(conViejo === esperado.slice(0, -1) + '%-',
      '   el formato VIEJO daba ' + conViejo + ' ⇒ con el `%` de la caja, ' + conViejo.slice(0, -1) + '%');
    /* ⚠ La comparación va sobre el CRUDO y no sobre las cadenas: los dos formatos redondean a un
     * decimal, así que `0.2953 → "0.3"` contra `29.53 → "29.5"` da 98,3× y no 100×. **El redondeo
     * rompe la razón exacta, y el hecho que se afirma es sobre el número, no sobre el texto.** */
    const crudoFraccion = parseFloat(conFraccion.replace(/-/g, ''));
    afirmar(conNuevo !== conFraccion && Math.abs(crudoFraccion / v - 100) < 0.5,
      '⛔⛔ `fraccion` daría ' + conFraccion + ' — 100× el crudo (' + v.toFixed(4) + '). Publicable y falso');
  });
}

console.log('\n═══ C · B.3 · vuelven al formato que TENÍAN, no a uno elegido ═══');
{
  /* ⭐ La autoridad es el snapshot del 31/08: ahí los siete `m2_*` están LIMPIOS. */
  const tsv = fs.readFileSync(path.join(RAIZ, 'docs', '_snapshots', 'MARCADORES_2026-08-31.tsv'), 'latin1');
  const lineas = tsv.split(/\r?\n/);
  const cab = lineas[0].split('\t');
  const iM = cab.indexOf('marcador'), iF = cab.indexOf('formato');
  const snap = {};
  lineas.slice(1).forEach(l => { const c = l.split('\t'); if (c[iM]) snap[c[iM].trim()] = (c[iF] || '').trim(); });
  afirmar(Object.keys(snap).length > 50, 'el snapshot se leyó (' + Object.keys(snap).length + ' marcadores)');

  const b3 = CAMBIOS.filter(c => c.campo === 'formato' && !/^emin_/.test(c.marcador));
  afirmar(b3.length === 10, 'son DIEZ los que pierden `_revisar` (dio ' + b3.length + ')');
  b3.forEach(c => {
    const eraSnap = snap[c.marcador];
    const base = eraSnap && eraSnap.endsWith('_revisar') ? eraSnap.slice(0, -8) : eraSnap;
    afirmar(base === c.a,
      '  `' + c.marcador + '` → `' + c.a + '` — es su formato del 31/08 (' + eraSnap + ')');
  });
  b3.forEach(c => afirmar(!/_revisar$/.test(c.a), '  ⛔ `' + c.marcador + '` queda SIN `_revisar`'));

  /* ⭐⭐ EL HALLAZGO DE PROCESO, afirmado: los siete `m2_*` estaban LIMPIOS el 31/08 ⇒ se les puso
   * `_revisar` DESPUÉS, y `V-124` los había validado el 02/09. */
  const m2 = b3.filter(c => /^m2_/.test(c.marcador));
  afirmar(m2.length === 7, 'siete son `m2_*`');
  afirmar(m2.every(c => snap[c.marcador] && !snap[c.marcador].endsWith('_revisar')),
    '⭐⭐ los siete estaban LIMPIOS el 31/08 ⇒ el `_revisar` se agregó DESPUÉS de que `V-124` los validara');
}

console.log('\n═══ D · el CSV nuevo entró y es acumulativo ═══');
{
  const dir = fs.readdirSync(path.join(RAIZ, 'docs')).filter(f => /^casos_validacion_.*\.csv$/.test(f));
  afirmar(dir.length === 4, 'hay CUATRO CSV de casos (dio ' + dir.length + ') — acumulativo, no reemplaza');
  const nuevo = fs.readFileSync(path.join(RAIZ, 'docs', 'casos_validacion_2026-09-04.csv'), 'utf8');
  afirmar(/^caso_id,bloque,token_propuesto,/.test(nuevo),
    '⭐ mismas columnas que los otros tres — `token_propuesto`, que es la que el cruce usa');
  afirmar(/V-125/.test(nuevo) && /C-87/.test(nuevo), 'trae `V-125` y `C-87`');
  /* ⛔ El id no puede chocar con los de los otros tres archivos (ítem 29). */
  const otros = dir.filter(f => f !== 'casos_validacion_2026-09-04.csv')
    .map(f => fs.readFileSync(path.join(RAIZ, 'docs', f), 'utf8')).join('\n');
  afirmar(!/(^|\n)V-125,/.test(otros), '⭐ `V-125` no existe en los otros tres — la serie sigue de largo');
  afirmar(!/(^|\n)C-87,/.test(otros), '⭐ `C-87` tampoco — sin la colisión del ítem 29');
}

console.log('\n═══ E · control NEGATIVO — el banco PUEDE fallar ═══');
{
  const mut = CAMBIOS.map(c => Object.assign({}, c,
    { a: c.a === 'porcentaje_sin_signo_revisar' ? 'fraccion_revisar' : c.a }));
  afirmar(mut.some(c => c.a === 'fraccion_revisar'), '⭐⭐ la mutación ocurrió: hay `fraccion_revisar`');
  afirmar(mut.filter(c => c.a === 'porcentaje_sin_signo_revisar').length === 0,
    '   y la sección B caería sobre los tres');
  afirmar(CAMBIOS.some(c => c.a === 'porcentaje_sin_signo_revisar'),
    '   mientras el original sigue intacto — la mutación no ensució la tabla');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
console.log('⚠ Lo que este verde NO dice: que la corrida publique bien. Prueba la CONFIGURACIÓN.');
console.log('  El control real es el deck: 7 renglones en `emin_lista`, un solo `%`, y los diez');
console.log('  sin guiones Y CON EL MISMO VALOR.');
