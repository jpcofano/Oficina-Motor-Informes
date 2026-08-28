#!/usr/bin/env node
/**
 * tools/probar-desglose-como-fuente.js — **los ocho `imp_*` pueden leer el DESGLOSE con el criterio
 * idéntico** (`2026-08-28`).
 *
 * Decisión del usuario: *«que usen la misma fuente, y que el criterio sea el mismo»*. Las dos
 * solapas miden **4.904 filas** y el desglose expone las mismas columnas con más al lado.
 *
 * ⭐ **Copiar el criterio en vez de elegir uno nuevo es lo que hace ATRIBUIBLE el cambio:** la única
 * variable pasa a ser la solapa, así que si las dos traen la misma información los ocho valores
 * tienen que dar **lo mismo**. Este banco verifica que el criterio sea, efectivamente, el mismo —
 * no que los números coincidan, que eso lo mide `moverImpresionesAlDesglose()` contra la base viva.
 *
 * ⛔ **La afirmación que más importa es negativa: `des_estado` (col K) NO es la equivalente de
 * `estado`.** Esa columna usa `ACTIVA/FINALIZADA/PAUSADA/PENDIENTE`; la que comparte vocabulario
 * con `looker/DIGITAL` es `des_estado_2` (`Activa`). Medido sobre las seis filas de
 * `3527-AGOJDGAG`: con la equivocada quedan **23.713** en vez de **66.855**.
 *
 * Uso:
 *   node tools/probar-desglose-como-fuente.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let pasadas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) { pasadas++; console.log('  ✅ ' + mensaje); }
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const DESGLOSE = 'digital|CAMPAÑAS_DESGLOCE_DIGITAL';
const LOOKER = 'looker|DIGITAL';

function dimensiones(parchear) {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} } };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) return null;   // guarda de que la mutación ocurrió
  }
  vm.runInContext(texto, ctx, { filename: 'Fuentes.gs' });
  return ctx.DIMENSIONES_;
}

const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');

console.log('\n═══ A · `ambito` traducido para el desglose, con la MISMA regla que looker ═══');
{
  const D = dimensiones();
  afirmar(!!D && !!D.ambito, 'se pudo leer DIMENSIONES_');
  afirmar(!!D.ambito.jm[DESGLOSE], '⭐⭐ `ambito=jm` está definida para el desglose — sin esto los ' +
    'ocho fallarían con «no está definida para …» en L-031');
  afirmar(!!D.ambito.gcba[DESGLOSE], 'y `ambito=gcba` también');

  /* ⭐ La regla tiene que ser LA MISMA salvo el nombre de la columna: si difiere, el cambio movió
   * el corte además de la fuente — dos variables a la vez, y ningún número sería atribuible. */
  /* Se recorta hasta el primer operador y no por clase de caracteres: `nombre_campaña` tiene una
   * `ñ` que ningún `[a-z_]` matchea, y el primer intento falló justo por eso. */
  const mismaForma = (x, y) => x.replace(/^[^~!=]+/, '') === y.replace(/^[^~!=]+/, '');
  afirmar(mismaForma(D.ambito.jm[DESGLOSE], D.ambito.jm[LOOKER]),
    '⭐⭐ misma regla que looker salvo la columna: `' + D.ambito.jm[DESGLOSE] + '` contra `' +
    D.ambito.jm[LOOKER] + '`');
  afirmar(mismaForma(D.ambito.gcba[DESGLOSE], D.ambito.gcba[LOOKER]),
    'y la negación también — `gcba` es todo lo que no es `jm` (`D-33`)');

  /* ⛔ La otra columna existe y NO se usó. Va como afirmación para que el día que alguien la
   * cambie a `des_ambito` se ponga rojo: en las filas de Coghlan dice GCBA mientras el nombre de
   * campaña dice JM, así que elegirla cambiaría el corte. */
  afirmar(D.ambito.jm[DESGLOSE].indexOf('des_ambito') === -1,
    '⛔ y NO se usa `des_ambito` (col T): contradice al nombre de campaña en las filas de Coghlan');

  afirmar(!!D.plataforma && !!D.plataforma.meta && !!D.plataforma.meta[DESGLOSE],
    '⭐ control positivo: `plataforma` YA estaba declarada para esta solapa — si el extractor no ' +
    'viera, esta afirmación caería primero');
}

console.log('\n═══ B · el seed declara con qué recortar la ventana ═══');
{
  afirmar(/campo_logico: 'clave_ventana', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'B'/.test(INSTALAR),
    '⭐⭐ `clave_ventana` → col B: sin esta fila `leerFuente` falla con «FALTA:clave_ventana@…»');
  afirmar(/campo_id_cuenta: 'des_id_cuenta', ventana_ref: 'Cuentas'/.test(INSTALAR),
    '⭐⭐ y la solapa toma `ventana_ref = Cuentas` — la MISMA pertenencia que looker/DIGITAL, así ' +
    'que el recorte temporal no cambia');
}

console.log('\n═══ C · el wrapper mueve los ocho, y con el filtro equivalente ═══');
{
  afirmar(/function moverImpresionesAlDesglose\(\)/.test(INSTALAR),
    'existe el botón, público y sin argumentos');
  afirmar(/filtro: 'des_estado_2=Activa'/.test(INSTALAR),
    '⭐⭐ el filtro usa `des_estado_2` — la columna que comparte vocabulario con `estado` de looker');
  afirmar(!/filtro: 'des_estado=/.test(INSTALAR),
    '⛔ y NO `des_estado` (col K): con ACTIVA/FINALIZADA/PAUSADA quedan 23.713 en vez de 66.855');
  afirmar(/campo_logico: 'des_impresiones'/.test(INSTALAR), 'y el campo es `des_impresiones`');
  const ocho = INSTALAR.match(/var OCHO = \[([\s\S]*?)\];/);
  const n = ocho ? (ocho[1].match(/'/g) || []).length / 2 : 0;
  afirmar(n === 8, '⭐ mueve los OCHO y no sólo `imp_total` (' + n + ') — con uno solo se rompería ' +
    'la identidad `meta + google + prog = total`');
}

console.log('\n═══ D · control negativo — sin la entrada, A cae ═══');
{
  /* ⚠ Fragmento de UNA línea: el final de línea es del archivo (CRLF) y no de quien escribe la
   * prueba. El primer intento llevaba un salto adentro del patrón y **la guarda de mutación lo
   * cazó** — es `CLAUDE.md` §4 funcionando, no una anécdota. */
  const D = dimensiones((t) => t.replace(
    "'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_campana_2~=JM',",
    "'zzz_solapa_inexistente': 'des_campana_2~=JM',"));
  if (!D) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    afirmar(!D.ambito.jm[DESGLOSE],
      '⛔ sin la línea, `ambito=jm` no resuelve para el desglose — o sea que A mide ESA línea');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si los ocho valores COINCIDEN desde las dos solapas. Eso se mide contra la base');
console.log('     viva, y lo hace `moverImpresionesAlDesglose()` con su testigo antes/después.');
console.log('   · Qué publica L-034: ahí el temario recorta por cuenta y NO se aplican');
console.log('     dimensiones, así que es otra lectura y pide una corrida.');

process.exit(fallas === 0 ? 0 : 1);
