#!/usr/bin/env node
/**
 * tools/probar-fila.js — el control de `opFILA`, la décima operación (`X-35`).
 *
 * ⭐ **El fixture son las CINCO FILAS REALES de `3488-AGOJDGAG`**, copiadas de la medición del
 * 23/08 sobre `digital/Directa Mail` del fixture del 20/08 (`sha f8ef3227…cc87`) — no deducidas.
 * Dos de ellas comparten fecha (**07/08**), que es el caso que hace falta y que **no se puede
 * inventar de memoria**: en toda la solapa, 144 de 508 cuentas con 2+ filas tienen fechas
 * repetidas.
 *
 * ⛔⛔ **La afirmación que da sentido a la operación entera es la 1: COHERENCIA DE FILA.** Los
 * nueve campos de `env1` tienen que salir de la **misma** fila. Es lo que `X-35` reporta roto en
 * `ELEMENTO` —que colapsa repetidos y ordena **por columna**, así que cada celda puede venir de un
 * envío distinto— y el síntoma **no es un error**: es una tabla de números correctos mal apareados.
 *
 * ⛔ **Y la 4 es la que impide reinstalar el `_39`:** sin campo de orden declarado, `FILA` **falla**
 * en vez de caer a la posición de la hoja. El día que alguien le ponga un default, esto se pone
 * rojo.
 *
 * ⚠ **Lo que NO cubre:** que el orden sea el que el equipo usa. Con empate, la identidad de fila
 * **no está en los datos** (`R-32`), y ninguna implementación la puede dar.
 *
 * Uso:
 *   node tools/probar-fila.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');

const SALTO = String.fromCharCode(10);
const BARRA = String.fromCharCode(92);

function recortar(texto, desde) {
  let nivel = 0, dentro = false, comilla = null, comentario = null;
  for (let j = desde; j < texto.length; j++) {
    const c = texto[j], sig = texto[j + 1];
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
      if (dentro && nivel === 0) return texto.slice(desde, j + 1);
    }
  }
  throw new Error('Expresión sin cerrar desde ' + desde);
}

/** El código de `function nombre(...)`, extraído y ejecutado — **la función real, no una copia**. */
function fn(nombre) {
  const i = FUENTE.indexOf('function ' + nombre + '(');
  if (i === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en Marcadores.gs — si se renombró, ' +
      'esta prueba tiene que enterarse en vez de dar verde sobre otra cosa.');
  }
  const llave = FUENTE.indexOf('{', i);
  return FUENTE.slice(i, llave + recortar(FUENTE, llave).length);
}

const SANDBOX = new Function(`
  var cacheFilasOrdenadas_ = {};
  function trazaDeVentana_(ctx) { return ''; }   // sólo decora la traza
  ${fn('huellaDeFilas_')}
  ${fn('filasOrdenadas_')}
  ${fn('opFILA')}
  return { opFILA: opFILA, filasOrdenadas_: filasOrdenadas_, reset: function () { cacheFilasOrdenadas_ = {}; } };
`)();

// ── El fixture: las cinco filas reales, con sus encabezados reales ──────────────────────
const F = (fecha, tipo, env, ent, ap) => ({
  'ID Cuentas': '3488-AGOJDGAG', 'Fecha envio': new Date(fecha), 'Tipo de mail': tipo,
  'Enviados': env, 'Entregados': ent, 'Aperturas': ap
});
const FILAS = [
  F('2026-08-07', 'Convocatoria', 84608, 83298, 18253),   // fila 2158
  F('2026-08-07', 'Convocatoria', 121983, 120091, 24908), // fila 2159  ← empate de fecha
  F('2026-08-11', 'Convocatoria', 24519, 24137, 5797),
  F('2026-08-12', 'Convocatoria', 17870, 17472, 2596),
  F('2026-08-13', 'Confirmación', 738, 735, 477)
];
const ORDEN = FILAS.map((f) => f['Fecha envio']);

function ctx(n, encabezado, extra) {
  const c = {
    marcador: 'camp_env' + n + '_x', base_id: 'digital', solapa: 'Directa Mail',
    campo_logico: 'mail_' + encabezado, columna: 'M', encabezado: encabezado,
    filas: FILAS, valor_fijo: n, separador: 'mail_fecha',
    ordenPor: { campo: 'mail_fecha', valores: ORDEN }
  };
  Object.keys(extra || {}).forEach((k) => { c[k] = extra[k]; });
  return c;
}

let ok = 0, mal = 0;
function af(nombre, cond, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

console.log('== probar-fila ==');
console.log('   fixture: las 5 filas reales de 3488-AGOJDGAG, dos con la MISMA fecha (07/08)');

// ── 1 · Coherencia de fila — la afirmación que da sentido a todo ────────────────────────
console.log('\n1 · ⛔⛔ COHERENCIA DE FILA — los campos de un mismo envío salen de la MISMA fila');
[1, 2, 3, 4, 5].forEach((n) => {
  SANDBOX.reset();
  const env = SANDBOX.opFILA(ctx(n, 'Enviados'));
  const ent = SANDBOX.opFILA(ctx(n, 'Entregados'));
  const ap = SANDBOX.opFILA(ctx(n, 'Aperturas'));
  const fila = FILAS.filter((f) => f['Enviados'] === env.valor)[0];
  af('env' + n + ': enviados/entregados/aperturas vienen de una sola fila',
    !!fila && ent.valor === fila['Entregados'] && ap.valor === fila['Aperturas'],
    'enviados=' + env.valor + ' entregados=' + ent.valor + ' aperturas=' + ap.valor);
});

// ── 2 · No colapsa repetidos ────────────────────────────────────────────────────────────
console.log('\n2 · No colapsa repetidos — las 5 filas son 5, aunque compartan valores');
SANDBOX.reset();
const tipos = [1, 2, 3, 4, 5].map((n) => SANDBOX.opFILA(ctx(n, 'Tipo de mail')).valor);
af('las 5 posiciones devuelven valor', tipos.every((t) => !!t), JSON.stringify(tipos));
af('`Convocatoria` aparece 4 veces y NO se colapsó a 1',
  tipos.filter((t) => t === 'Convocatoria').length === 4, JSON.stringify(tipos));
const enviados = [1, 2, 3, 4, 5].map((n) => SANDBOX.opFILA(ctx(n, 'Enviados')).valor);
af('los 5 «enviados» son los 5 de la fuente, sin faltar ninguno',
  FILAS.every((f) => enviados.indexOf(f['Enviados']) !== -1), JSON.stringify(enviados));

// ── 3 · Orden por fecha, y el empate declarado ──────────────────────────────────────────
console.log('\n3 · Orden por fecha ascendente, y el empate DECLARADO en la traza');
SANDBOX.reset();
const r1 = SANDBOX.opFILA(ctx(1, 'Enviados'));
const r5 = SANDBOX.opFILA(ctx(5, 'Enviados'));
af('la fila 1 es de la fecha más antigua (07/08)',
  r1.valor === 84608 || r1.valor === 121983, 'dio ' + r1.valor);
af('la fila 5 es la del 13/08', r5.valor === 738, 'dio ' + r5.valor);
af('⭐ la traza DECLARA el empate cuando lo hay',
  /empate/i.test(r1.traza || ''), r1.traza);
af('y nombra `R-32`, que es lo que el empate implica para comparar entre corridas',
  /R-32/.test(r1.traza || ''));
SANDBOX.reset();
const r3 = SANDBOX.opFILA(ctx(3, 'Enviados'));
af('la fila 3 es la del 11/08 — el empate no corre las posteriores',
  r3.valor === 24519, 'dio ' + r3.valor);

// ── 4 · ⛔ Sin orden declarado FALLA — no cae a la posición de la hoja (`_39`) ──────────
console.log('\n4 · ⛔ Sin campo de orden NO cae a la posición de la hoja: falla');
SANDBOX.reset();
const sinOrden = SANDBOX.opFILA(ctx(1, 'Enviados', { separador: '', ordenPor: null }));
/* ⚠ **Se exige el MOTIVO, no sólo que sea hueco.** Hay dos guardas —falta el `separador` y no
 * resuelve la columna— y las dos devuelven hueco. Afirmar sólo *«devuelve hueco»* pasaría con
 * cualquiera de las dos, así que no distinguiría cuál actuó: es el caso de `Pruebas.gs:456`, un
 * fixture cuyo dato satisface más de una afirmación. **Medido con el control negativo del 23/08**:
 * al desactivar la primera guarda, esta línea seguía en verde hasta que se le pidió el motivo. */
af('sin `separador` falla por FALTA DE ORDEN DECLARADO, no por otra guarda',
  !sinOrden.valor && sinOrden.ambiguo && /fila_sin_orden/.test(sinOrden.traza || ''),
  sinOrden.traza);
af('y la traza nombra el `_39`, para que se entienda por qué no hay default',
  /_39/.test(sinOrden.traza || ''), sinOrden.traza);
SANDBOX.reset();
const sinMapeo = SANDBOX.opFILA(ctx(1, 'Enviados', { ordenPor: null }));
af('con `separador` declarado pero sin resolver, también falla',
  !sinMapeo.valor && /orden_no_mapeado/.test(sinMapeo.traza || ''), sinMapeo.traza);

// ── 5 · `C-83`: el índice va entero pelado ──────────────────────────────────────────────
console.log('\n5 · C-83 — el índice va ENTERO PELADO, y lo demás falla nombrando la trampa');
[['1/5', 'la forma que Sheets convierte en fecha'], ['', 'vacío'], [0, 'cero: es 1-based'],
 [new Date('2026-03-01'), 'lo que la celda devuelve DESPUÉS de la coerción']].forEach(([v, q]) => {
  SANDBOX.reset();
  const r = SANDBOX.opFILA(ctx(1, 'Enviados', { valor_fijo: v }));
  af('rechaza ' + q, !r.valor && /indice_invalido/.test(r.traza || ''), JSON.stringify(r.traza));
});

// ── 6 · Desborde: `sin_datos`, no error ─────────────────────────────────────────────────
console.log('\n6 · Más índice que filas es «no hay tanto envío», no un fallo');
SANDBOX.reset();
const r9 = SANDBOX.opFILA(ctx(9, 'Enviados'));
af('la fila 9 sobre 5 devuelve sin_datos y NO error',
  r9.sin_datos === true && !r9.ambiguo, JSON.stringify(r9));
af('y la traza dice cuántas filas hay, que es lo que manda al trabajo correcto',
  /5 fila/.test(r9.traza || ''), r9.traza);

// ── 7 · ⭐ Control positivo: sin empate, el resultado es inequívoco ─────────────────────
console.log('\n7 · ⭐ Control positivo — sin empate no hay nada que desempatar');
const SIN_EMPATE = FILAS.slice(2);            // 11/08, 12/08, 13/08
const ordenSE = SIN_EMPATE.map((f) => f['Fecha envio']);
function ctxSE(n, enc) {
  return Object.assign(ctx(n, enc), { filas: SIN_EMPATE, ordenPor: { campo: 'mail_fecha', valores: ordenSE } });
}
SANDBOX.reset();
const s1 = SANDBOX.opFILA(ctxSE(1, 'Enviados'));
const s3 = SANDBOX.opFILA(ctxSE(3, 'Enviados'));
af('fila 1 = 24.519 (11/08), exacto', s1.valor === 24519, 'dio ' + s1.valor);
af('fila 3 = 738 (13/08), exacto', s3.valor === 738, 'dio ' + s3.valor);
af('⭐ y la traza NO declara empate cuando no lo hay',
  !/empate/i.test(s1.traza || ''),
  'si dice empate sin haberlo, el aviso deja de significar algo: ' + s1.traza);

console.log('\n== ' + (mal === 0 ? '✅ VERDE' : '⛔ ROJO') + ' — ' + ok + ' de ' + (ok + mal) +
  ' afirmaciones, sobre las 5 filas reales de 3488-AGOJDGAG ==');
console.log('⚠ No cubre: que el orden sea el que usa el equipo. Con empate, la identidad de fila');
console.log('  no está en los datos (R-32) y ninguna implementación la puede dar.');
process.exit(mal === 0 ? 0 : 1);
