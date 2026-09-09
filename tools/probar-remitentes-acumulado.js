#!/usr/bin/env node
/**
 * tools/probar-remitentes-acumulado.js — control de las cinco `camp_envN_rem` y del **camino `A`**
 * (`2026-09-09_1` Parte B), **fuera de Apps Script**.
 *
 * ⛔⛔ **DADO VUELTA el 09/09, y el motivo va primero porque el control estaba diciendo la
 * verdad.** Hasta el 08/09 este banco exigía lo contrario de lo que exige hoy: que las cinco
 * leyeran `acumulado | Mail` y que **ninguna** declarara `mail_remitente`. Las dos afirmaciones
 * eran correctas para el diseño de ese día — mudarlas de solapa era la salida elegida.
 *
 * **Cambió la decisión, no el control:** `camp_enviados`, `camp_or`, `camp_mail_clics` y
 * `camp_ctor` tienen caso **`C-99` `exacto`** (04/09) y son el **GLOBAL** de `L-047`. Mudar el
 * bloque cambia su universo —de *«la ventana»* a *«todo el `Id cuentas`»*, la rama de `D-30`— y
 * **`C-99` deja de valer**. ⇒ **la preferencia de `D-61` no invalida un caso vigente; cuando
 * chocan, gana el caso.**
 *
 * ⭐ **No se aflojó ninguna: se invirtieron con el motivo y se agregaron las que faltaban.** Donde
 * decía *«ninguna declara `mail_remitente`»* ahora dice algo **más exigente**: que declare
 * `mail_remitente` **Y** el catálogo, **juntos** — el campo solo publicaría el mail crudo, que es
 * exactamente lo que se quería evitar.
 *
 * ⛔ **Sobre qué artefacto afirma:** sobre las listas y el texto de `Instalar.gs`, `Marcadores.gs`
 * y `Generador.gs`. **No mide `acumulado | Remitentes`** —no hay fixture ni censo de esa hoja en
 * el repo—, así que **si el catálogo cubre a los remitentes reales lo dice el gate `G2`**, contra
 * la hoja viva.
 *
 * Uso:
 *   node tools/probar-remitentes-acumulado.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const GENERADOR = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
const MARCADORES = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');

/** Extrae `var NOMBRE = …;` del top level y lo EVALÚA — la lista se construye con un `.map()`. */
function extraerVar(texto, nombre, archivo) {
  const marca = '\nvar ' + nombre + ' = ';
  const inicio = texto.indexOf(marca);
  if (inicio === -1) {
    throw new Error('No encontré `var ' + nombre + ' =` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  const i = inicio + marca.length;
  let nivel = 0;
  let enTexto = null;
  for (let j = i; j < texto.length; j++) {
    const c = texto[j];
    if (enTexto) {
      if (c === '\\') j++;
      else if (c === enTexto) enTexto = null;
      continue;
    }
    if (c === "'" || c === '"') { enTexto = c; continue; }
    if (c === '[' || c === '{' || c === '(') nivel++;
    else if (c === ']' || c === '}' || c === ')') nivel--;
    else if (c === ';' && nivel === 0) {
      // eslint-disable-next-line no-new-func
      return new Function('return (' + texto.slice(i, j) + ');')();
    }
  }
  throw new Error('`var ' + nombre + '` sin cerrar en ' + archivo);
}

function extraerFuncion(texto, nombre, archivo) {
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) throw new Error('No encontré `function ' + nombre + '(` en ' + archivo);
  const i = texto.indexOf('{', inicio);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}' && --nivel === 0) return texto.slice(inicio, j + 1);
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

const FILAS = extraerVar(INSTALAR, 'FILAS_ENVIO_REM_AMBITO_', 'Instalar.gs');
const BASE = extraerVar(INSTALAR, 'BASE_REM_', 'Instalar.gs');
const SOLAPA = extraerVar(INSTALAR, 'SOLAPA_REM_', 'Instalar.gs');
const CAMPO = extraerVar(INSTALAR, 'CAMPO_AMBITO_MAIL_', 'Instalar.gs');
const CATALOGO = extraerVar(INSTALAR, 'CATALOGO_REM_', 'Instalar.gs');
const PISO = extraerVar(INSTALAR, 'VALIDADOS_L047_PISO_', 'Instalar.gs');
const OPCIONAL = extraerVar(MARCADORES, 'OPERACIONES_CON_CATALOGO_OPCIONAL_', 'Marcadores.gs');
const NECESITA = extraerVar(MARCADORES, 'OPERACIONES_CON_CATALOGO_', 'Marcadores.gs');

/* `formatearValorMarcador_` con los dos stubs mínimos. No se reimplementa: el catálogo de
 * formatos es el que corre en producción. */
const formatear = (function () {
  const cuerpo = extraerFuncion(GENERADOR, 'formatearValorMarcador_', 'Generador.gs');
  // eslint-disable-next-line no-new-func
  return new Function(
    'var parsearFechaCelda_ = function () { return null; };\n' +
    'var Utilities = { formatDate: function () { return "01/01"; } };\n' +
    'var Session = { getScriptTimeZone: function () { return "UTC"; } };\n' +
    cuerpo + '\nreturn formatearValorMarcador_;')();
})();

/* ⭐⭐ `opFILA` **real**, extraída de `Marcadores.gs` con sus dependencias, para probar la
 * traducción por catálogo sobre la función que corre y no sobre una copia. */
const opFILA = (function () {
  const cuerpo = ['filasOrdenadas_', 'huellaDeFilas_', 'opFILA']
    .map(function (n) { return extraerFuncion(MARCADORES, n, 'Marcadores.gs'); }).join('\n\n');
  // eslint-disable-next-line no-new-func
  return new Function(
    'var cacheFilasOrdenadas_ = {};\n' +
    'var normalizar_ = function (s) { return String(s == null ? "" : s).trim().toLowerCase(); };\n' +
    'var trazaDeVentana_ = function () { return ""; };\n' +
    cuerpo + '\nreturn opFILA;')();
})();

let ok = 0;
let mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-remitentes-acumulado ==');
console.log('');
console.log('1 · las cinco, una por envío');
af('son cinco', FILAS.length === 5, 'son ' + FILAS.length);
af('sus nombres son `camp_env1..5_rem`',
  FILAS.map(function (x) { return x.marcador; }).join(',') ===
  'camp_env1_rem,camp_env2_rem,camp_env3_rem,camp_env4_rem,camp_env5_rem',
  FILAS.map(function (x) { return x.marcador; }).join(','));
af('sus `valor_fijo` son 1..5, uno por envío',
  FILAS.map(function (x) { return x.valor_fijo; }).join(',') === '1,2,3,4,5');
/* ⚠ `C-83`: Sheets convierte `1/3` en FECHA y `01` pierde el cero; `opFILA` exige entero pelado. */
af('⚠ los cinco `valor_fijo` son NÚMEROS, no texto — `opFILA` exige entero pelado (`C-83`)',
  FILAS.every(function (x) { return typeof x.valor_fijo === 'number'; }));

console.log('');
console.log('2 · ⛔⛔ SE QUEDAN en `digital | Directa Mail` — mudarlas rompería `C-99`');
/* ⛔⛔ **La afirmación INVERSA de la que este banco tenía hasta el 08/09**, y el motivo está en el
 * encabezado: el bloque de envíos tiene cuatro casos `exacto` vigentes y la mudanza les cambia el
 * universo. ⭐ **Y quedarse trae un beneficio propio: la alineación con los otros 40 tokens es por
 * construcción, no algo que haya que verificar.** */
af('la base es `digital`', BASE === 'digital', BASE);
af('la solapa es `Directa Mail`', SOLAPA === 'Directa Mail', SOLAPA);
af('⛔ NO se mudaron a `acumulado` — eso cambiaría el universo del bloque de envíos',
  BASE !== 'acumulado', 'mudarlas rompe C-99 sobre ' + PISO.join(', '));
af('⛔ NO se mudaron a la solapa `Mail`', SOLAPA !== 'Mail');

console.log('');
console.log('3 · ⭐⭐ el par CAMPO + CATÁLOGO — juntos, o publica el mail crudo');
/* ⛔⛔ **Ésta reemplaza a «ninguna declara `mail_remitente`» y es MÁS exigente.** El campo solo
 * publicaría la dirección donde el equipo publica el ámbito. Lo que hace correcto al camino `A`
 * no es el campo ni el catálogo: es **que viajen juntos**. */
const BLOQUE = INSTALAR.slice(
  INSTALAR.indexOf('var plan = FILAS_ENVIO_REM_AMBITO_.map'),
  INSTALAR.indexOf('var faltanCols = [];'));
af('el campo es `mail_remitente` — la dirección cruda', CAMPO === 'mail_remitente', CAMPO);
af('el catálogo es `acumulado/Remitentes`', CATALOGO === 'acumulado/Remitentes', CATALOGO);
af('⭐ el constructor escribe LOS DOS: `campo_logico` y `catalogo`',
  /campo_logico: CAMPO_AMBITO_MAIL_/.test(BLOQUE) && /catalogo: CATALOGO_REM_/.test(BLOQUE));
af('⛔ el `catalogo` NO queda vacío — sin él las cinco publicarían el mail crudo',
  !/catalogo: ''/.test(BLOQUE));
af('el catálogo tiene la forma `base/solapa`', /^[^/]+\/[^/]+$/.test(CATALOGO), CATALOGO);

console.log('');
console.log('4 · la operación y su orden');
af('operan con `FILA`', /operacion: 'FILA'/.test(BLOQUE));
af('ordenan por `fecha_periodo` — sin `separador`, `opFILA` FALLA',
  /separador: 'fecha_periodo'/.test(BLOQUE));
af('⛔ el ámbito NO va en `filtro`: acá es un VALOR que se publica', /filtro: ''/.test(BLOQUE));
af('⛔ ni en `dimensiones`', /dimensiones: ''/.test(BLOQUE));

console.log('');
console.log('5 · ⭐ las cinco nacen con `_revisar` — ningún caso las valida');
af('el formato es `texto_revisar`', /formato: 'texto_revisar'/.test(BLOQUE));
af('`texto_revisar` publica entre guiones', formatear('JM', 'texto_revisar') === '-JM-',
  String(formatear('JM', 'texto_revisar')));

console.log('');
console.log('6 · ⭐⭐ `opFILA` honra el catálogo, y sólo si la fila lo declara');
/* ⛔ Meter `FILA` en `OPERACIONES_CON_CATALOGO_` haría fallar a los 45 marcadores que la usan sin
 * catálogo: `resolverCatalogoDeMarcador_` devuelve error con la celda vacía. Son dos contratos. */
af('`FILA` está en el mapa OPCIONAL', OPCIONAL.FILA === true);
af('⛔ `FILA` NO está en el mapa de las que lo NECESITAN — rompería a los 45 sin catálogo',
  !NECESITA.FILA);
af('`LISTA` y `ELEMENTO` siguen NECESITÁNDOLO', NECESITA.LISTA === true && NECESITA.ELEMENTO === true);
/* ⭐ El despachador sólo lo trae si la fila lo declara — y si lo declara y no resuelve, FALLA. */
af('el despachador lo trae cuando es opcional Y la fila lo declara',
  /operacionAdmiteCatalogo_\(fila\.operacion\) && declaraCatalogo/.test(GENERADOR));
af('⭐ el catálogo viaja con su `traduccion` — hasta hoy sólo viajaba la lista',
  /traduccion: leido\.porBarrio/.test(GENERADOR));

console.log('');
console.log('7 · ⭐⭐ la traducción, sobre la `opFILA` REAL');
const ctxBase = {
  filas: [{ Rem: 'jorge.macri@buenosaires.gob.ar', F: '2026-08-28' },
          { Rem: 'infovecinos@buenosaires.gob.ar', F: '2026-08-29' }],
  encabezado: 'Rem', separador: 'fecha_periodo', campo_logico: 'mail_remitente', columna: 'G',
  base_id: 'digital', solapa: 'Directa Mail',
  ordenPor: { campo: 'fecha_periodo', valores: ['2026-08-28', '2026-08-29'] }
};
const conCat = function (n) {
  return Object.assign({}, ctxBase, { valor_fijo: n, catalogo: {
    origen: 'acumulado/Remitentes',
    traduccion: { 'jorge.macri@buenosaires.gob.ar': 'JM', 'infovecinos@buenosaires.gob.ar': 'GCBA' }
  } });
};
af('⭐ la fila 1 publica `JM`, no el mail', opFILA(conCat(1)).valor === 'JM',
  JSON.stringify(opFILA(conCat(1)).valor));
af('⭐ la fila 2 publica `GCBA`', opFILA(conCat(2)).valor === 'GCBA',
  JSON.stringify(opFILA(conCat(2)).valor));
af('la traza DICE que hubo traducción — si no, un `JM` se lee como si la columna lo dijera',
  /traducido por el catálogo/.test(opFILA(conCat(1)).traza));
/* ⛔⛔ El caso caro: un remitente que el catálogo no cubre. Ni crudo ni vacío. */
{
  const huerfano = Object.assign({}, conCat(1), { catalogo: {
    origen: 'acumulado/Remitentes', traduccion: { 'otro@buenosaires.gob.ar': 'GCBA' } } });
  const r = opFILA(huerfano);
  af('⛔ un remitente FUERA del catálogo no publica el crudo',
    r.valor !== 'jorge.macri@buenosaires.gob.ar', JSON.stringify(r.valor));
  af('⛔ ni publica vacío en silencio: deja `rechazados`, y eso lo baja a `REVISAR` → `---`',
    !!(r.rechazados && r.rechazados.length), JSON.stringify(r.rechazados));
  af('la traza nombra el valor que no se pudo traducir',
    /jorge\.macri/.test(r.traza) && /no cubre/.test(r.traza));
}
/* ⭐ Y la inertidad, que es lo que protege a los otros 40 tokens de la misma tabla. */
{
  const sinCat = Object.assign({}, ctxBase, { valor_fijo: 1 });
  const r = opFILA(sinCat);
  af('⭐ SIN catálogo `opFILA` publica el valor crudo, igual que siempre',
    r.valor === 'jorge.macri@buenosaires.gob.ar', JSON.stringify(r.valor));
  af('⭐ y no inventa `rechazados` — los otros 40 tokens no cambian de comportamiento',
    !(r.rechazados && r.rechazados.length));
}
/* ⚠ Una celda vacía en la fuente NO es un rechazo: es `sin_datos`, otra afirmación. */
{
  const vacia = Object.assign({}, conCat(1), {
    filas: [{ Rem: '', F: '2026-08-28' }],
    ordenPor: { campo: 'fecha_periodo', valores: ['2026-08-28'] } });
  const r = opFILA(vacia);
  af('⚠ una celda VACÍA en la fuente no es rechazo: es `sin_datos` (`-`), no `---`',
    r.valor === '' && !(r.rechazados && r.rechazados.length));
}

console.log('');
console.log('8 · ⭐⭐ el gate «NADA VALIDADO SE MUEVE»');
const CUERPO = INSTALAR.slice(INSTALAR.indexOf('function aplicarRemitentes20260908_'));
af('el piso conocido son los cuatro de `C-99`',
  PISO.slice().sort().join(',') === ['camp_ctor', 'camp_enviados', 'camp_mail_clics', 'camp_or'].join(','),
  PISO.join(','));
/* ⭐ El piso va explícito y el cruce lo AMPLÍA: al revés, un cruce que fallara dejaría la lista
 * vacía y el gate diría «nada que cuidar» sobre cuatro casos vigentes. */
af('⭐ el cruce AMPLÍA el piso, no lo reemplaza',
  /var lista = VALIDADOS_L047_PISO_\.slice\(\)/.test(INSTALAR));
af('⛔ congelar CERO validados aborta — un cero se leería como «no se movió nada»',
  /no se congeló NINGUNO/.test(INSTALAR));
/* ⛔ La guarda va en el escritor, no en el llamador: si no se puede congelar, no se escribe. */
const iCongelar = CUERPO.indexOf('congelarValidadosL047_()');
const iBackup = CUERPO.indexOf("backupMarcadores_('remitentes_catalogo')");
af('⭐ el congelado corre DENTRO del escritor y ANTES del backup',
  iCongelar !== -1 && iBackup !== -1 && iCongelar < iBackup);
af('⛔ si no se puede congelar, ABORTA sin escribir',
  /ABORTA \(no se escribió nada\): no se pudo congelar/.test(CUERPO));
af('`verificarValidadosL047()` existe y es un botón sin argumentos',
  /function verificarValidadosL047\(\)/.test(INSTALAR));
af('⛔ y no tiene umbral: cualquier diferencia es una validación rota',
  /un caso `exacto` que se mueve es una validación rota/.test(INSTALAR));

console.log('');
console.log('9 · ⭐⭐ `G2` cambió de objeto: ya no mide alineación, mide COBERTURA');
af('`G2` mide cobertura del catálogo', /G2 · COBERTURA/.test(CUERPO));
af('⛔ `G2` PARA y lista los remitentes sin mapear', /remitente\(s\) SIN MAPEAR/.test(CUERPO));
/* ⭐ Los dos números se declaran aunque coincidan: un «12 de 12» es un dato, un silencio no. */
af('⭐ declara los dos números — distintos en la ventana y cubiertos',
  /remitentes distintos en la ventana/.test(CUERPO) && /cubiertos por el catálogo/.test(CUERPO));
af('⛔ cero filas o cero remitentes ABORTA — el gate no mediría nada',
  /El gate no puede concluir nada/.test(CUERPO));
/* ⚠ La divergencia entre las dos solapas se mide igual, como HALLAZGO y no como gate. */
af('⚠ la divergencia entre las dos solapas se mide como HALLAZGO, no como gate',
  /HALLAZGO \(no es gate\)/.test(CUERPO));
af('⚠ y distingue «se explica por la ventana» de «dicen cosas distintas del mismo envío»',
  /dicen cosas distintas del mismo envío/.test(CUERPO));

console.log('');
console.log('10 · ⭐ el catálogo en el seed, y el alta que lo sostiene');
const SEED_SOL = INSTALAR.slice(
  INSTALAR.indexOf("filaSolapa_('acumulado', 'Call Center - Métricas'"),
  INSTALAR.indexOf('Aplica SEED_SOLAPAS_ sobre la hoja SOLAPAS'));
const filaDe = (nombre) => {
  const i = SEED_SOL.indexOf("filaSolapa_('acumulado', '" + nombre + "'");
  return i === -1 ? null : SEED_SOL.slice(i, SEED_SOL.indexOf('})]', i));
};
af('⭐ `acumulado | Remitentes` está en el seed como `referencia`',
  /'referencia'/.test(filaDe('Remitentes') || ''));
/* ⭐ `referencia` alcanza: `catalogoBarriosDesdeBase_` abre con `abrirHoja`, que NO consulta
 * `usoSolapa_`. Si pasara por `buscarMapeo`, `referencia` la rechazaría. */
af('⭐ el catálogo apunta a esa solapa', CATALOGO === 'acumulado/Remitentes');
[['Mail', 'fuente'], ['IVR', 'fuente'], ['SMS', 'fuente'],
 ['Call Center - Campañas', 'fuente'], ['Mail x Sem x Rem', 'referencia'],
 ['Herramientas x Semana', 'referencia']].forEach(function (par) {
  const f = filaDe(par[0]);
  af('`acumulado | ' + par[0] + '` está en el seed como `' + par[1] + '`',
    !!f && f.indexOf("'" + par[1] + "'") !== -1, f ? 'está con otro uso' : 'no está');
});
af('⛔ `Mail` declara `campo_id_cuenta` — el día que se mude, sin eso publica el AGREGADO',
  /campo_id_cuenta: 'acm_id_cuenta'/.test(filaDe('Mail') || ''));
['Mail x Sem x Rem', 'Herramientas x Semana'].forEach(function (n) {
  af('⛔ `' + n + '` declara `fila_encabezado: 2` — tiene banda en la fila 1',
    /fila_encabezado: 2/.test(filaDe(n) || ''));
});

console.log('');
console.log('11 · control negativo — que esto sepa ponerse rojo');
/* ⚠ **La mutación se EXIGE.** Si el patrón no matchea, el caso FALLA en vez de dar verde sobre el
 * texto intacto — la lección de los dos parches con CRLF del 22/08. */
{
  const marca = "var CATALOGO_REM_ = 'acumulado/Remitentes';";
  if (INSTALAR.indexOf(marca) === -1) {
    af('el parche exige su marca (el catálogo)', false, 'no encontré `' + marca + '`');
  } else {
    const roto = INSTALAR.replace(marca, "var CATALOGO_REM_ = '';");
    af('la mutación ocurrió (el catálogo)', roto !== INSTALAR);
    af('sin catálogo, la afirmación 3 se pone roja — publicaría el mail crudo',
      extraerVar(roto, 'CATALOGO_REM_', '(mutado)') === '',
      'el control dejaría pasar las cinco leyendo `mail_remitente` a secas');
  }
}
{
  const marca = 'var OPERACIONES_CON_CATALOGO_OPCIONAL_ = { FILA: true };';
  if (MARCADORES.indexOf(marca) === -1) {
    af('el parche exige su marca (el mapa opcional)', false, 'no encontré el mapa');
  } else {
    const roto = MARCADORES.replace(marca, 'var OPERACIONES_CON_CATALOGO_OPCIONAL_ = {};');
    af('la mutación ocurrió (el mapa opcional)', roto !== MARCADORES);
    af('vaciando el mapa, la afirmación 6 se pone roja',
      extraerVar(roto, 'OPERACIONES_CON_CATALOGO_OPCIONAL_', '(mutado)').FILA !== true,
      'el control no distingue que `FILA` honre el catálogo de que no lo honre');
  }
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · sobre ' + FILAS.length +
  ' fila(s) y la `opFILA` REAL');
console.log('  ⚠ NO mide `' + CATALOGO + '`: no hay fixture ni censo de esa hoja en el repo.');
console.log('    Si el catálogo cubre a los remitentes reales lo dice `G2`, contra la hoja viva.');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
