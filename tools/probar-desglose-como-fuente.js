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
  /* ⛔⛔ `2026-08-28` — **esta afirmación se dio vuelta con una medición.** Pedía *«la misma regla
   * que looker salvo la columna»*, que era lo correcto mientras se creyó que una columna alcanzaba.
   * **No alcanza:** el universo JM del desglose está partido — `des_campana_2` (V) tiene 372 filas
   * JM, `des_campana_3` (U, rotulada `Prioridad`) tiene 248, **disjuntas**, y la unión da **620**,
   * que es exactamente lo que `looker/DIGITAL` ve con su columna única.
   *
   * ⭐ **Lo que sí se conserva de la regla vieja, y es lo que importa: el OPERADOR.** Sigue siendo
   * `~=JM`, igual que looker. Lo que cambia es sobre cuántas columnas se busca, y eso es una
   * propiedad del dato, no del criterio. */
  const operadores = (s) => (s.match(/!?~?=/g) || []).join(' ');
  afirmar(/des_campana_2~=JM \|\| des_campana_3~=JM/.test(D.ambito.jm[DESGLOSE]),
    '⭐⭐ `jm` busca en las DOS columnas con `||` — con una sola, un tercio de las filas cae mal');
  afirmar(operadores(D.ambito.jm[LOOKER]) === '~=',
    '⭐ y looker sigue con UNA columna: su `nombre_campaña` está poblado en las 620');
  afirmar(/des_campana_2!~=JM && des_campana_3!~=JM/.test(D.ambito.gcba[DESGLOSE]),
    '⭐⭐ y `gcba` es el AND de las negaciones — De Morgan: «ni en una ni en la otra», sin `||`');

  /* ⛔ La otra columna existe y NO se usó. Va como afirmación para que el día que alguien la
   * cambie a `des_ambito` se ponga rojo: en las filas de Coghlan dice GCBA mientras el nombre de
   * campaña dice JM, así que elegirla cambiaría el corte. */
  afirmar(D.ambito.jm[DESGLOSE].indexOf('des_ambito') === -1,
    '⛔ y NO se usa `des_ambito` (col T): contradice al nombre de campaña en las filas de Coghlan');

  afirmar(!!D.plataforma && !!D.plataforma.meta && !!D.plataforma.meta[DESGLOSE],
    '⭐ control positivo: `plataforma` YA estaba declarada para esta solapa — si el extractor no ' +
    'viera, esta afirmación caería primero');
}

/* ⛔⛔ `2026-08-28` — **estas dos secciones se dieron vuelta el mismo día que se escribieron.**
 * Pedían que el desglose declarara `ventana_ref = Cuentas` y `clave_ventana` para que los ocho
 * `imp_*` conservaran su recorte al mudarse. **La mudanza se revirtió**, así que ahora se afirma lo
 * contrario — y con MÁS motivo, no con menos.
 *
 * ⭐ **La premisa era falsa y está medida.** `tools/medir-looker-vs-desglose.py` cruzó las dos
 * solapas fila por fila sobre el fixture del 28/08, agrupando por (cuenta, plataforma): de **766**
 * grupos de **Meta**, **759 difieren**, con **80.373.882** impresiones en looker contra
 * **913.951.689** en el desglose — **once veces**. DV360 difiere en **1 de 337**. Un desfase
 * temporal movería todas las plataformas por igual; que una esté 11× arriba y las otras clavadas
 * dice que **las dos solapas cuentan Meta de forma distinta**.
 *
 * ⭐⭐ **Y revertir la ventana protege algo que HOY funciona:** los `u1_*` leen esta solapa **por
 * cuenta** y publicaron exacto en la corrida del 28/08 (`V-114`…`V-119`). Meterle un recorte por
 * pertenencia habría cambiado lo que ellos leen, sin que nadie lo pidiera. */
console.log('\n═══ B · ⛔ el desglose NO declara ventana — revertido, con el 11× de Meta medido ═══');
{
  afirmar(!/campo_logico: 'clave_ventana', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL'/.test(INSTALAR),
    '⛔ el seed NO declara `clave_ventana` para el desglose');
  afirmar(!/campo_id_cuenta: 'des_id_cuenta', ventana_ref: 'Cuentas'/.test(INSTALAR),
    '⭐⭐ y la solapa NO toma `ventana_ref`: los `u1_*` la leen POR CUENTA y hoy publican exacto');
  afirmar(/campo_id_cuenta: 'des_id_cuenta'/.test(INSTALAR),
    '⭐ pero `campo_id_cuenta` SIGUE declarado — es lo que deja que el temario la recorte');
}

console.log('\n═══ C · los ocho vuelven a looker/DIGITAL ═══');
{
  /* ⚠ El botón de la mudanza **se conserva a propósito**: el día que se sepa por qué Meta cuenta
   * distinto, la pregunta vuelve a estar viva y su testigo antes/después sigue siendo el correcto.
   * Lo que manda hoy es el de reversión. */
  afirmar(/function volverImpresionesALooker\(\)/.test(INSTALAR),
    '⭐⭐ existe el botón de reversión, público y sin argumentos');
  afirmar(/base_id: 'looker', solapa: 'DIGITAL',[\s\S]{0,140}filtro: 'estado=Activa'/.test(INSTALAR),
    '⭐ y devuelve base, solapa y filtro a lo que estaba VALIDADO (V-73 · V-59 · V-74 · A-01..A-03)');
  const ochos = INSTALAR.match(/var OCHO = \[([\s\S]*?)\];/g) || [];
  afirmar(ochos.length >= 2,
    'los dos botones nombran su lista de ocho — mover y volver mueven el MISMO conjunto (' +
    ochos.length + ')');
  afirmar(ochos.every((b) => (b.match(/'/g) || []).length / 2 === 8),
    '⭐ y las dos listas tienen los OCHO: revertir de a uno rompería `meta + google + prog = total`');
}

console.log('\n═══ D · control negativo — sin la entrada, A cae ═══');
{
  /* ⚠ Fragmento de UNA línea: el final de línea es del archivo (CRLF) y no de quien escribe la
   * prueba. El primer intento llevaba un salto adentro del patrón y **la guarda de mutación lo
   * cazó** — es `CLAUDE.md` §4 funcionando, no una anécdota. */
  const D = dimensiones((t) => t.replace(
    "'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_campana_2~=JM ||",
    "'zzz_solapa_inexistente': 'des_campana_2~=JM ||"));
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
