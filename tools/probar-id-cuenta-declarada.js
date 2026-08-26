#!/usr/bin/env node
/**
 * tools/probar-id-cuenta-declarada.js — el control de `X-39`, y de todo `campo_id_cuenta`.
 *
 * ⭐ **El invariante que afirma, y vale para TODAS las solapas, no sólo las dos que se tocaron
 * hoy:** si `SOLAPAS.campo_id_cuenta` nombra un campo lógico, **ese campo tiene que existir en
 * `MAPEO` para esa misma base y solapa**. Es exactamente lo que `planDeLecturaPorCuenta_`
 * (`Generador.gs`) falla en runtime con `«FALTA:…@campo_id_cuenta_no_mapeado»`, adelantado a
 * tiempo de seed. **Un marcador que cae ahí no publica un número malo: no publica** — pero se
 * entera recién en una corrida, y una corrida cuesta seis minutos y la mira una persona.
 *
 * ⛔⛔ **La afirmación que de verdad importa es la negativa: `Directa IVR` y `Directa SMS` NO
 * declaran `campo_id_cuenta`.** Las tres solapas de directa compartían **una sola llamada** a
 * `filasSolapa_`, así que declararlo en el grupo se lo ponía a las tres — y las otras dos **no
 * tienen ese campo lógico en `MAPEO`**. Es el modo de falla del `_44` con otro disfraz: la
 * declaración entra en un lugar y no en los otros, y **los `ivr_*` del iceberg publican números
 * validados `exacto`**. El día que alguien las vuelva a agrupar, esto tiene que ponerse rojo.
 *
 * ⚠ **Lo que este control NO contesta**, y hay que decirlo o el verde se cita de más:
 *   - **Nada sobre la letra.** Que `A` siga siendo `Id cuentas` **hoy** lo contesta
 *     `verificarEncabezadosDeMapeo()` contra la planilla **viva**, que es mejor testigo que
 *     cualquier fixture. Reimplementar acá un lector de `.xlsx` sería *el instrumento que
 *     reproduce lógica del motor y la reproduce peor* (`CLAUDE.md` §4).
 *   - **Nada sobre si los `imp_*` se movieron.** Eso es `V-110`, se compara **en valores** contra
 *     `docs/_snapshots/TESTIGO_esquema_id_cuenta_2026-08-22.md`, y **lo corre el usuario**.
 *
 * ⚠ **Reimplementa UNA línea a propósito y conviene saber cuál:** `fila.solapa = fila.hoja`
 * (`Instalar.gs`). Todo lo demás —`filaSolapa_`, `filasSolapa_`— se **extrae y ejecuta**, que es
 * la regla: cuando la lógica existe en un `.gs`, se usa la función real.
 *
 * Uso:
 *   node tools/probar-id-cuenta-declarada.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const seedMapeo = require('./seed-mapeo.js');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');

const SALTO = String.fromCharCode(10);   // el salto de línea, sin escapes que se pierdan al editar
const BARRA = String.fromCharCode(92);   // la barra invertida, ídem

/**
 * Recorta desde `desde` hasta que corchetes, llaves y paréntesis vuelven a cero — o, con
 * `hastaPuntoYComa`, hasta el `;` que cierra la sentencia.
 *
 * ⚠ **Saltea cadenas y comentarios, y no es opcional:** los `notas` del seed están llenos de
 * paréntesis sueltos —`(_23)`, `«FALTA:…@campo»`— y los comentarios de bloque tienen corchetes
 * de markdown. Contar sin saltearlos corta la expresión en el lugar equivocado y el error sale
 * como un `SyntaxError` a 300 líneas de distancia, que no se parece a la causa.
 */
function recortarBalanceado(texto, desde, hastaPuntoYComa) {
  let nivel = 0, dentro = false, comilla = null, comentario = null;
  for (let j = desde; j < texto.length; j++) {
    const c = texto[j], sig = texto[j + 1];
    if (hastaPuntoYComa && nivel === 0 && c === ';' && !comilla && !comentario) {
      return texto.slice(desde, j);
    }
    if (comentario === 'linea') { if (c === SALTO) comentario = null; continue; }
    if (comentario === 'bloque') { if (c === '*' && sig === '/') { comentario = null; j++; } continue; }
    if (comilla) {
      if (c === BARRA) { j++; continue; }
      if (c === comilla) comilla = null;
      continue;
    }
    if (c === '/' && sig === '/') { comentario = 'linea'; j++; continue; }
    if (c === '/' && sig === '*') { comentario = 'bloque'; j++; continue; }
    if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
    if (c === '[' || c === '{' || c === '(') { nivel++; dentro = true; }
    else if (c === ']' || c === '}' || c === ')') {
      nivel--;
      if (dentro && nivel === 0 && !hastaPuntoYComa) return texto.slice(desde, j + 1);
    }
  }
  throw new Error('Expresión sin cerrar desde el offset ' + desde);
}

/**
 * El valor de `var NOMBRE = <expresión>;`. Falla fuerte si el nombre no está.
 *
 * ⚠ **Corta en el `;`, no en el primer paréntesis balanceado**, y el motivo es concreto:
 * `SEED_SOLAPAS_` empieza con `[].concat(` — un array vacío que **balancea en el segundo
 * carácter**. Cortar ahí devuelve `[]`, o sea **cero solapas**, y el control habría dado quince
 * verdes sobre un conjunto vacío. Lo delató la afirmación que exige que haya al menos un
 * declarante: *cero verificado no es éxito*.
 */
function extraerVar(texto, nombre) {
  const marca = 'var ' + nombre + ' = ';
  const i = texto.indexOf(marca);
  if (i === -1) {
    throw new Error('No encontré `' + marca + '` en Instalar.gs — si se renombró, esta prueba ' +
      'tiene que enterarse en vez de dar verde sobre otra cosa.');
  }
  return recortarBalanceado(texto, i + marca.length, true);
}

/** El código fuente de `function nombre(...) { … }`. */
function extraerFuncion(texto, nombre) {
  const i = texto.indexOf('function ' + nombre + '(');
  if (i === -1) throw new Error('No encontré `function ' + nombre + '(` en Instalar.gs.');
  const llave = texto.indexOf('{', i);
  return texto.slice(i, llave + recortarBalanceado(texto, llave).length);
}

// ── Se ejecutan las funciones REALES del seed, no una copia ──────────────────────────────
const SANDBOX = new Function(`
  var FILA_ENCABEZADO_POR_BASE_ = ${extraerVar(FUENTE, 'FILA_ENCABEZADO_POR_BASE_')};
  var NOTA_PERIODO_MANUAL_ = ${extraerVar(FUENTE, 'NOTA_PERIODO_MANUAL_')};
  ${extraerFuncion(FUENTE, 'filaSolapa_')}
  ${extraerFuncion(FUENTE, 'filasSolapa_')}
  var SOLAPAS = ${extraerVar(FUENTE, 'SEED_SOLAPAS_')};
  var MAPEO = []
    .concat(${extraerVar(FUENTE, 'SEED_MAPEO_')})
    .concat(${extraerVar(FUENTE, 'SEED_MAPEO_REUNIONES_')})
    .concat(${extraerVar(FUENTE, 'SEED_MAPEO_DESGLOCE_')})
    .concat(${extraerVar(FUENTE, 'SEED_MAPEO_DESGLOCE_REVISAR_')})
    .concat(${extraerVar(FUENTE, 'SEED_MAPEO_CC_')});
  var TIPOS = ${extraerVar(FUENTE, 'TIPO_ESPERADO_POR_CAMPO_')};
  var ENCABEZADOS = ${extraerVar(FUENTE, 'ENCABEZADO_POR_MAPEO_')};
  return { SOLAPAS: SOLAPAS, MAPEO: MAPEO, TIPOS: TIPOS, ENCABEZADOS: ENCABEZADOS };
`)();

const { SOLAPAS, MAPEO, TIPOS, ENCABEZADOS } = SANDBOX;
// La única línea reimplementada, y está declarada arriba.
MAPEO.forEach((f) => { f.solapa = f.hoja; });

const clave = (b, s, c) => b + '|' + s + '|' + c;
const MAPA = {};
MAPEO.forEach((f) => { MAPA[clave(f.base_id, f.solapa, f.campo_logico)] = f; });
const solapa = (b, s) => SOLAPAS.filter((x) => x.base_id === b && x.solapa === s)[0];

let ok = 0, mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-id-cuenta-declarada ==');

// ── 1 · El invariante general, sobre TODAS las solapas que lo declaran ───────────────────
const DECLARAN = SOLAPAS.filter((s) => s.campo_id_cuenta);
console.log('\n1 · El invariante: campo_id_cuenta resuelve en MAPEO — ' + DECLARAN.length +
  ' solapa(s) lo declaran, de ' + SOLAPAS.length + ' en el seed');
if (DECLARAN.length === 0) {
  af('hay al menos una solapa que declara campo_id_cuenta', false,
    'cero declarantes: el control no midió nada, y cero verificado NO es éxito');
}
DECLARAN.forEach((s) => {
  const k = clave(s.base_id, s.solapa, s.campo_id_cuenta);
  af(s.base_id + '/' + s.solapa + ' declara `' + s.campo_id_cuenta + '` y MAPEO lo tiene',
    !!MAPA[k], 'sin fila de MAPEO: en corrida sería «FALTA:…@campo_id_cuenta_no_mapeado»');
});

// ── 2 · X-39 — las dos solapas y las tres filas de MAPEO ────────────────────────────────
console.log('\n2 · X-39 (repuesto 23/08) — las dos solapas y las tres filas de MAPEO');
const dig = solapa('looker', 'DIGITAL');
const mail = solapa('digital', 'Directa Mail');
af('looker/DIGITAL declara campo_id_cuenta = ldig_id_cuenta',
  !!dig && dig.campo_id_cuenta === 'ldig_id_cuenta', dig && dig.campo_id_cuenta);
af('digital/Directa Mail declara campo_id_cuenta = mail_id_cuenta',
  !!mail && mail.campo_id_cuenta === 'mail_id_cuenta', mail && mail.campo_id_cuenta);
af('looker/DIGITAL conserva ventana_ref = Cuentas',
  !!dig && dig.ventana_ref === 'Cuentas', 'X-39 no puede pisar el cruce de ventana de D-24');

/* ⭐⭐ **La afirmación que hace que una REVERSIÓN sea posible, y es la menos obvia de todas.**
 * `X-39` se revirtió y se repuso el mismo día, y lo que hizo que la reversión llegara a la hoja
 * es que `filaSolapa_` **emita la clave** siempre — con `''` cuando no se declara.
 * `upsertPorClave_` reescribe la fila entera con `headers.map(h => (h in obj) ? obj[h] : '')`,
 * así que la clave presente garantiza que la celda se blanquee.
 * ⛔ **Si esto se pusiera rojo, un `X-39` revertido no se revertiría en la hoja y la corrida de
 * control mediría el estado nuevo creyendo que mide el viejo** — un cero disfrazado de éxito
 * justo donde el criterio es la igualdad (`CLAUDE.md` §4). Se afirma sobre el **mecanismo**, no
 * sobre el valor de hoy, para que siga valiendo con la declaración puesta. */
af('filaSolapa_ EMITE campo_id_cuenta siempre (aunque no se declare): una reversión llegaría a la hoja',
  SOLAPAS.every((x) => 'campo_id_cuenta' in x),
  'alguna fila omite la clave: ahí upsertPorClave_ no garantiza blanquear la celda');
[['Visualizaciones', 'D'], ['Clics', 'E'], ['ldig_id_cuenta', 'A'], ['Impresiones', 'C']]
  .forEach(([campo, col]) => {
    const f = MAPA[clave('looker', 'DIGITAL', campo)];
    af('looker/DIGITAL mapea `' + campo + '` en la columna ' + col,
      !!f && f.columna === col, f ? 'columna ' + f.columna : 'sin fila');
  });

// ── 3 · ⛔ La negativa: las hermanas de Directa Mail NO lo declaran ──────────────────────
console.log('\n3 · ⛔ La trampa del _44 — las hermanas de Directa Mail siguen sin declarar');
['Directa IVR', 'Directa SMS'].forEach((s) => {
  const x = solapa('digital', s);
  af('digital/' + s + ' NO declara campo_id_cuenta', !!x && !x.campo_id_cuenta,
    x ? 'declara `' + x.campo_id_cuenta + '`, y MAPEO no lo tiene para esta solapa: ' +
        'si volvieron a agruparse con Directa Mail, los ivr_*/sms_* dejan de leer'
      : 'la solapa desapareció del seed');
});

// ── 4 · La decisión de tener dos nombres para la misma columna ──────────────────────────
console.log('\n4 · Dos roles, misma letra — la decisión que no hay que "unificar"');
const cv = MAPA[clave('looker', 'DIGITAL', 'clave_ventana')];
const li = MAPA[clave('looker', 'DIGITAL', 'ldig_id_cuenta')];
af('clave_ventana y ldig_id_cuenta apuntan a la MISMA columna',
  !!cv && !!li && cv.columna === li.columna, 'si dejaron de coincidir, uno de los dos se movió');
af('y siguen siendo campos lógicos DISTINTOS',
  !!cv && !!li && cv.campo_logico !== li.campo_logico,
  'unificarlos ata el grano por cuenta (D-30) al cruce de ventana (D-24)');
af('ldig_id_cuenta no pisa a dig_id_cuenta, que es de digital/Digital',
  !!MAPA[clave('digital', 'Digital', 'dig_id_cuenta')] &&
  MAPA[clave('digital', 'Digital', 'dig_id_cuenta')].base_id === 'digital',
  'TIPO_ESPERADO_POR_CAMPO_ indexa por campo lógico, no por base');

// ── 5 · D-31: letra y encabezado, y el tipo declarado ───────────────────────────────────
console.log('\n5 · D-31 — toda fila nueva lleva letra y encabezado, y su tipo');
/* ⛔ `2026-08-26` — **se pregunta por el testigo EFECTIVO, no por `ENCABEZADO_POR_MAPEO_`.** El
 * mapa pasó a ser el DEFAULT: una fila que declara su encabezado inline gana, así que mirar sólo
 * el mapa se pondría rojo el día que alguien mueva el testigo al lado de la letra —que es la forma
 * que `CLAUDE.md` §2 prescribe para toda fila nueva—. Es la figura del artefacto equivocado: la
 * afirmación puede fallar, pero está mirando otra cosa que la que nombra. */
const SEED_EFECTIVO = seedMapeo.leer(FUENTE);
['Visualizaciones', 'Clics', 'ldig_id_cuenta'].forEach((campo) => {
  af('`' + campo + '` tiene testigo de encabezado EFECTIVO en el seed',
    !!seedMapeo.testigo(SEED_EFECTIVO, 'looker', 'DIGITAL', campo),
    'sin testigo la fila llega con la celda vacía y `D-31` queda declarado y no ejercido — ' +
    'es lo que le pasó a 23 filas hasta el 26/08');
  af('`' + campo + '` tiene tipo_esperado declarado', !!TIPOS[campo], 'sin tipo en el mapa');
});
af('Visualizaciones y Clics se declaran numero', TIPOS.Visualizaciones === 'numero' && TIPOS.Clics === 'numero');
af('ldig_id_cuenta se declara texto', TIPOS.ldig_id_cuenta === 'texto');

// ── Veredicto, al final y con el conteo ─────────────────────────────────────────────────
console.log('\n== ' + (mal === 0 ? '✅ VERDE' : '⛔ ROJO') + ' — ' + ok + ' de ' + (ok + mal) +
  ' afirmaciones, sobre ' + SOLAPAS.length + ' solapas y ' + MAPEO.length + ' filas de MAPEO ==');
console.log('⚠ No cubre: que la letra siga siendo esa hoy (verificarEncabezadosDeMapeo, planilla viva)');
console.log('⚠ No cubre: que los ocho imp_* no se hayan movido (V-110, en VALORES, lo corre el usuario)');
process.exit(mal === 0 ? 0 : 1);
