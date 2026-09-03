#!/usr/bin/env node
/**
 * `2026-08-25_1` — **`FILA_TEXTO` ejecutada de verdad**, con las dos filas reales de
 * `reuniones/Agenda JM | Post`.
 *
 * ⛔⛔ **El modo de falla que este banco existe para impedir, y es el peor de la lámina:** las seis
 * columnas de `L-036` tienen que salir de **la misma fila**. Si el nombre eligiera otra —otro orden,
 * otro índice, otro camino— **la fila 2 del deck mostraría el nombre de un encuentro y los números
 * de otro, y nada fallaría.**
 *
 * ⭐ **Por eso la afirmación central no es «el texto se compone bien» sino «el nombre y los números
 * salen de la MISMA fila»**, y se verifica corriendo las dos operaciones sobre el mismo `ctx`.
 *
 * ⭐ **`opFILA_TEXTO` y `opFILA` se extraen de `Marcadores.gs`, no se reimplementan** — `CLAUDE.md`
 * §4. Y los fixtures están **copiados** del export del 20/08 (sha `f8ef3227…`), no deducidos.
 *
 * Corre con: `node tools/probar-fila-texto.js`
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const MARCADORES_GS = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');
const GENERADOR_GS = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

let ok = 0;
let mal = 0;
const avisos = [];

function af(cond, texto, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + texto); }
  else { mal++; console.log('  ⛔ ' + texto + (detalle ? ' — ' + detalle : '')); }
}

/** ⚠ Por posición, nunca por regex con `\n}\n`: los `.gs` están en CRLF. Mordió dos veces. */
function extraer(texto, firma, cierre) {
  const desde = texto.indexOf(firma);
  if (desde === -1) return null;
  const c = cierre || '\n}';
  const fin = texto.indexOf(c, desde);
  return fin === -1 ? null : texto.slice(desde, fin + c.length);
}

function contexto() {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },
    /* El formateador de fechas de Apps Script, con lo que este banco usa. `dd/MM` y nada más: si
     * mañana la plantilla pide otro patrón, esto tiene que enterarse en vez de inventarlo. */
    Utilities: {
      formatDate: (d, tz, patron) => {
        const dd = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        if (patron === 'dd/MM') return dd + '/' + MM;
        if (patron === 'dd/MM/yyyy') return dd + '/' + MM + '/' + d.getFullYear();
        throw new Error('patrón no soportado por el stub: ' + patron);
      }
    },
    Session: { getScriptTimeZone: () => 'America/Argentina/Buenos_Aires' }
  };
  vm.createContext(ctx);
  ['var cacheFilasOrdenadas_ = {};', 'function huellaDeFilas_', 'function filasOrdenadas_',
    'function opFILA', 'function opFILA_TEXTO'].forEach((firma) => {
    const t = firma.indexOf('var ') === 0
      ? extraer(MARCADORES_GS, firma, ';')
      : extraer(MARCADORES_GS, firma + '(');
    if (!t) { avisos.push('⚠ no se encontró `' + firma + '` en Marcadores.gs'); return; }
    vm.runInContext(t, ctx, { filename: 'Marcadores.gs (extracto)' });
  });
  /* `parsearFechaCelda_` vive en `Fuentes.gs` —no en `Parseo.gs`, que es donde uno la buscaría— y
   * `opFILA_TEXTO` la usa para el `{campo:dd/MM}`. Se carga la REAL: un stub que devolviera
   * cualquier fecha haría pasar el formato sin probarlo. */
  const parseo = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
  const pf = extraer(parseo, 'function parsearFechaCelda_');
  if (!pf) avisos.push('⚠ no se encontró `parsearFechaCelda_` en Parseo.gs');
  else vm.runInContext(pf, ctx, { filename: 'Parseo.gs (extracto)' });
  ctx.trazaDeVentana_ = () => '';
  return ctx;
}

/* ⭐ Las DOS filas REALES del fixture del 20/08, copiadas. Las claves son los encabezados de la
 * fila 2 de la solapa —que es como `leerFuente` indexa— más la clave posicional de las repetidas.
 *
 * ⛔⛔ **La `Fecha` va como `Date` y NO como el serial que trae el `.xlsx`, y esto lo encontró este
 * banco en su primera corrida.** El `.xlsx` guarda `46227`; **Apps Script entrega un `Date`** —
 * medido el 25/08 corriendo el parser real sobre la solapa—. Poner el serial hizo que el texto
 * saliera `«?fecha_periodo»`, o sea que el banco reportó un bug **del fixture**, no del código.
 *
 * ⭐ **Es la trampa del `String(celda)` de `CLAUDE.md` §4 en su versión más literal:** copié el
 * **formato de almacenamiento** del archivo en vez del **dato que le llega al motor**. Un fixture
 * de formato se copia de lo que el consumidor recibe, no de donde el dato duerme.
 *
 * ⚠ **Y el límite queda declarado, no arreglado:** `parsearFechaCelda_` acepta `Date`, ISO y
 * `dd/mm/aaaa`, y **no** el serial numérico. Es deliberado —es el lector canónico y no se le agrega
 * un caso por comodidad—, así que si alguna vez llegara un serial, el `{campo:dd/MM}` publicaría su
 * hueco visible. Lo afirma el bloque 4 ter. */
const RETIRO = {
  ID: '3346-JULJDGAG', Funcionario: 'Jorge Macri', 'Barrio / Comuna': 'Retiro',
  Tipo: 'Uno a uno', Fecha: new Date(2026, 6, 24), Habitantes: 41475, Alcance: 47753,
  'Impresiones totales': 136971, __pos__12: 41204, __pos__13: 0.300822801906973
};
const SAN_CRISTOBAL = {
  ID: '3354-JULJDGAG', Funcionario: 'Jorge Macri', 'Barrio / Comuna': 'San Cristóbal',
  Tipo: 'Uno a uno', Fecha: new Date(2026, 6, 23), Habitantes: 41240, Alcance: 0,
  'Impresiones totales': 0, __pos__12: 0, __pos__13: 0
};

/* ⚠ El orden de `filas` es el de la hoja; `Fecha` las ordena al revés (San Cristóbal 46226 es
 * ANTES que Retiro 46227). Que el fixture venga desordenado **es a propósito**: si viniera ya
 * ordenado, el banco no distinguiría «ordena» de «toma en el orden que vino». */
const FILAS = [RETIRO, SAN_CRISTOBAL];
const ORDEN = { campo: 'fecha_periodo', valores: [RETIRO.Fecha, SAN_CRISTOBAL.Fecha] };

const CAMPOS = {
  figura: { clave: 'Funcionario' },
  tipo_encuentro: { clave: 'Tipo' },
  barrio: { clave: 'Barrio / Comuna' },
  fecha_periodo: { clave: 'Fecha' }
};
const PLANTILLA = '{figura} — {tipo_encuentro} en {barrio} ({fecha_periodo:dd/MM})';

function ctxDe(ctx, n, campoLogico, clave) {
  return {
    campo_logico: campoLogico, columna: 'B', base_id: 'reuniones', solapa: 'Agenda JM | Post',
    filas: FILAS, encabezado: clave, valor_fijo: n, separador: 'fecha_periodo',
    ordenPor: ORDEN, plantilla: { campos: CAMPOS }
  };
}

console.log('== probar-fila-texto — `FILA_TEXTO` con las dos filas reales de julio_24_30 ==\n');

const ctx = contexto();
const correr = (op, c) => { ctx.__c = c; return vm.runInContext(op + '(__c)', ctx); };

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · El texto que se publica
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · el nombre compuesto, con la forma que eligió el usuario');
{
  const r1 = correr('opFILA_TEXTO', ctxDe(ctx, 1, PLANTILLA, 'Funcionario'));
  const r2 = correr('opFILA_TEXTO', ctxDe(ctx, 2, PLANTILLA, 'Funcionario'));

  /* ⚠ La fila 1 es **San Cristóbal**, no Retiro: `fecha_periodo` ordena ascendente y 23/07 va
   * antes que 24/07. Que el banco lo afirme así es lo que prueba que ordena de verdad. */
  af(r1.valor === 'Jorge Macri — Uno a uno en San Cristóbal (23/07)',
    '⭐ fila 1 → «Jorge Macri — Uno a uno en San Cristóbal (23/07)»', r1.valor);
  af(r2.valor === 'Jorge Macri — Uno a uno en Retiro (24/07)',
    '⭐ fila 2 → «Jorge Macri — Uno a uno en Retiro (24/07)»', r2.valor);

  /* ⭐⭐ El fragmento que sale del deck del equipo, afirmado aparte: es la única parte del texto
   * que ya se vio publicada, y por eso es la que no se puede cambiar sin decidirlo. */
  af(r2.valor.indexOf('Uno a uno en Retiro (24/07)') !== -1,
    '⭐⭐ y contiene el fragmento LITERAL del deck del equipo del 31/07');

  af(!r1.ambiguo && !r2.ambiguo, 'ninguna de las dos sale ambigua');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐⭐ LA afirmación: el nombre y los números salen de la MISMA fila
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · ⭐⭐ el nombre y los números de una fila son del MISMO encuentro');
{
  for (let n = 1; n <= 2; n++) {
    const nombre = correr('opFILA_TEXTO', ctxDe(ctx, n, PLANTILLA, 'Funcionario'));
    const hab = correr('opFILA', ctxDe(ctx, n, 'poblacion', 'Habitantes'));
    const imp = correr('opFILA', ctxDe(ctx, n, 'imp_totales', 'Impresiones totales'));

    /* Se compara contra la fila que `opFILA` eligió, no contra una lista escrita acá: si las dos
     * operaciones eligieran filas distintas, esto cae — que es exactamente lo que hay que impedir. */
    const esperadoHab = nombre.valor.indexOf('Retiro') !== -1 ? 41475 : 41240;
    const esperadoImp = nombre.valor.indexOf('Retiro') !== -1 ? 136971 : 0;
    af(hab.valor === esperadoHab && imp.valor === esperadoImp,
      '⭐⭐ fila ' + n + ': «' + nombre.valor.slice(0, 46) + '…» va con ' + hab.valor +
      ' habitantes y ' + imp.valor + ' impresiones',
      'hab=' + hab.valor + ' imp=' + imp.valor);
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · Los bordes que `julio_24_30` ejercita
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · los bordes: cero real, y más ranuras que filas');
{
  const r3 = correr('opFILA_TEXTO', ctxDe(ctx, 3, PLANTILLA, 'Funcionario'));
  af(r3.valor === '' || r3.ambiguo,
    '⭐ la ranura 3 no inventa un nombre — 2 ítems para 4 ranuras NO es error', JSON.stringify(r3.valor));

  /* ⚠ San Cristóbal está en CEROS y su nombre igual se publica: *cero real* no es *sin dato*, y el
   * nombre de un encuentro que midió cero **sigue siendo su nombre**. */
  const r1 = correr('opFILA_TEXTO', ctxDe(ctx, 1, PLANTILLA, 'Funcionario'));
  af(r1.valor.indexOf('San Cristóbal') !== -1,
    '⭐ San Cristóbal está en ceros y su NOMBRE se publica igual — cero real no es sin dato');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Un campo que no resuelve deja el hueco VISIBLE
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · un campo sin mapeo no desaparece: se ve');
{
  const c = ctxDe(ctx, 2, PLANTILLA, 'Funcionario');
  c.plantilla = { campos: Object.assign({}, CAMPOS, { barrio: { clave: null } }) };
  const r = correr('opFILA_TEXTO', c);
  /* ⛔ Si el hueco quedara vacío, «Jorge Macri — Uno a uno en  (24/07)» se leería como un dato.
   * Un nombre al que le falta una parte tiene que verse. */
  af(r.valor.indexOf('«?barrio»') !== -1,
    '⭐ un campo sin clave publica `«?barrio»`, no un hueco mudo', r.valor);
  af(String(r.traza).indexOf('sin resolver') !== -1,
    'y la traza lo nombra, para que se pueda encontrar sin mirar el deck');
}

console.log('\n4 bis · una celda vacía tampoco desaparece');
{
  const c = ctxDe(ctx, 2, PLANTILLA, 'Funcionario');
  c.filas = [Object.assign({}, RETIRO, { 'Barrio / Comuna': '' }), SAN_CRISTOBAL];
  const r = correr('opFILA_TEXTO', c);
  af(r.valor.indexOf('«?barrio»') !== -1,
    '⭐ celda vacía → mismo hueco visible: «sin mapeo» y «sin dato» se ven, y la traza los separa',
    r.valor);
}

console.log('\n4 ter · ⚠ el límite declarado: el SERIAL de Sheets no se parsea');
{
  /* ⭐ Esto NO es un bug a arreglar: `parsearFechaCelda_` es el lector canónico y acepta `Date`,
   * ISO y `dd/mm/aaaa` **a propósito**. Apps Script entrega `Date`, así que el serial no llega por
   * el camino normal. La afirmación **fija el límite**: si alguien lo hiciera aceptar seriales,
   * esto se pone rojo y hay que venir a leer por qué estaba así. */
  const c = ctxDe(ctx, 2, PLANTILLA, 'Funcionario');
  c.filas = [Object.assign({}, RETIRO, { Fecha: 46227 }), SAN_CRISTOBAL];
  const r = correr('opFILA_TEXTO', c);
  af(r.valor.indexOf('«?fecha_periodo»') !== -1,
    '⚠ un serial (46227) NO se parsea y deja hueco visible — límite declarado, no bug', r.valor);
  af(String(r.traza).indexOf('no es fecha') !== -1,
    '  …y la traza dice `no es fecha`, que separa este caso del campo sin mapeo');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Los errores con motivo propio
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · lo que falla, falla con su motivo');
{
  const sinPlantilla = ctxDe(ctx, 1, PLANTILLA, 'Funcionario');
  delete sinPlantilla.plantilla;
  const r = correr('opFILA_TEXTO', sinPlantilla);
  af(r.ambiguo && String(r.traza).indexOf('@plantilla_sin_resolver') !== -1,
    'sin `ctx.plantilla` → `@plantilla_sin_resolver`, no una excepción', r.traza);

  const sinOrden = ctxDe(ctx, 1, PLANTILLA, 'Funcionario');
  sinOrden.separador = '';
  const r2 = correr('opFILA_TEXTO', sinOrden);
  /* ⭐ Hereda la guarda de `opFILA`: sin campo de orden NO ordena por posición, falla. Eso es lo
   * que se gana reusando la operación en vez de repetirla. */
  af(r2.ambiguo && String(r2.traza).indexOf('@fila_sin_orden') !== -1,
    '⭐ sin `separador` hereda la guarda de `opFILA`: `@fila_sin_orden`', r2.traza);

  const malIndice = ctxDe(ctx, '1/4', PLANTILLA, 'Funcionario');
  const r3 = correr('opFILA_TEXTO', malIndice);
  af(r3.ambiguo && String(r3.traza).indexOf('@fila_indice_invalido') !== -1,
    '⭐ y la de `C-83`: un índice que Sheets coercionó a `1/4` falla nombrándolo', r3.traza);
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 6 · Los helpers del despachador
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · `camposDePlantilla_` y `primerCampoDePlantilla_`');
{
  const c2 = { console, String, Object, Array, RegExp };
  vm.createContext(c2);
  /* ⭐ `2026-09-03` — **`partirTokenDePlantilla_` entra a la lista, y por eso este banco se puso
   * rojo: `camposDePlantilla_` pasó a depender de él** al nacer `LISTA_TEXTO` con su condicional
   * `{campo=VALOR?alterno}`. **El rojo era correcto** — la función extraída ya no era autónoma.
   * ⚠ Se agrega la dependencia, NO se afloja la afirmación: las cuatro de abajo siguen exigiendo
   * exactamente lo mismo, y son las que prueban que la sintaxis vieja no cambió. */
  ['function partirTokenDePlantilla_', 'function camposDePlantilla_',
   'function primerCampoDePlantilla_'].forEach((f) => {
    const t = extraer(GENERADOR_GS, f);
    if (!t) { avisos.push('⚠ no se encontró `' + f + '` en Generador.gs'); return; }
    vm.runInContext(t, c2, { filename: 'Generador.gs (extracto)' });
  });
  c2.__p = PLANTILLA;
  const campos = vm.runInContext('camposDePlantilla_(__p)', c2);
  af(campos.join('|') === 'figura|tipo_encuentro|barrio|fecha_periodo',
    'extrae los cuatro campos en orden, y el `:dd/MM` no ensucia el nombre', campos.join('|'));
  af(vm.runInContext('primerCampoDePlantilla_(__p)', c2) === 'figura',
    'el primero es `figura` — es con el que se resuelve la solapa');
  c2.__p = 'sin campos';
  af(vm.runInContext('primerCampoDePlantilla_(__p)', c2) === null,
    '⭐ una plantilla sin `{campo}` devuelve `null`, y el despachador la trata como error');
  c2.__p = '{a} y {a} otra vez';
  af(vm.runInContext('camposDePlantilla_(__p)', c2).length === 1,
    'un campo repetido se resuelve una sola vez');
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
if (avisos.length) {
  console.log(mal ? '⛔ ' + mal + ' de ' + (ok + mal) + ' en rojo.' : '✅ Las ' + ok + ' afirmaciones pasaron.');
  console.log('\n⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach((a) => console.log('   · ' + a));
} else {
  console.log(mal ? '⛔ ' + mal + ' de ' + (ok + mal) + ' en rojo.' : '✅ Las ' + ok + ' afirmaciones pasaron.');
}

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Que el deck publique ese texto. Acá el `ctx` está armado a mano; que el');
console.log('     despachador lo arme igual lo dice una corrida de `jm`.');
console.log('   · Que `figura`, `barrio` y `tipo_encuentro` estén mapeados en la solapa VIVA:');
console.log('     eso lo contesta `verificarEncabezadosDeMapeo()`.');

process.exit(mal ? 1 : 0);
