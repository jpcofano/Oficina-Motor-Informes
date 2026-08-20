#!/usr/bin/env node
/**
 * tools/probar-temario-reuniones.js — control positivo del salteo de `REUNIONES`
 * (`docs/Prompts/2026-08-19_2_panel_por_secciones.md`, Parte E punto 3), **sin planilla** y
 * extrayendo el código real del repo.
 *
 * Qué prueba: que cargar dos veces el mismo temario **no duplique**, y —el control negativo, que
 * es la mitad que importa— que **un temario con una fila nueva SÍ la agregue**. Sin el negativo,
 * un cargador que no escriba nunca pasaría el control principal.
 *
 * ⭐ **El fixture no es inventado: son las filas reales de `REUNIONES` al 20/08**, incluidas las
 * dos que hacen fallar la clave del prompt. `San Cristóbal 23/07` y `Retiro 24/07` aparecen **dos
 * veces cada uno** —una `pre` y una `post`—, así que la clave
 * `periodo_id + eje + nombre + fecha` **declara duplicado algo que no lo es**. Con `etapa` adentro
 * son 13 claves sobre 13 filas. Copiado de la hoja, no deducido (`CLAUDE.md` §4).
 *
 * Uso:
 *   node tools/probar-temario-reuniones.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

function extraerFuncion(archivo, nombre) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  let i = texto.indexOf('{', inicio);
  if (i === -1) throw new Error('Función ' + nombre + ' sin cuerpo en ' + archivo);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, j + 1);
    }
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

// `formatearFecha_` usa `Utilities`/`Session`, que no existen fuera de Apps Script. Se stubea con
// la MISMA semántica —`yyyy-MM-dd` en hora local— en vez de extraerla: acá lo que se prueba es la
// clave, no el formateador, y el formateador ya tiene su propio terreno.
const preludio = `
var Utilities = { formatDate: function (d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
} };
var Session = { getScriptTimeZone: function () { return 'America/Argentina/Buenos_Aires'; } };
function formatearFecha_(f) { return Utilities.formatDate(f); }
`;

const cuerpo = preludio +
  extraerFuncion('Reuniones.gs', 'claveReunion_') + '\n' +
  extraerFuncion('Reuniones.gs', 'separarReunionesNuevas_');

// eslint-disable-next-line no-new-func
const M = new Function(cuerpo + '\nreturn { claveReunion_, separarReunionesNuevas_ };')();

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  OK  ' + mensaje);
  else { fallas++; console.log('  XX  ' + mensaje); }
}

/** Las 13 filas reales de REUNIONES al 20/08/2026, copiadas del volcado de la hoja viva. */
const HOJA = [
  { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'pre' },
  { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Retiro', fecha: '2026-07-24', etapa: 'pre' },
  { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'post' },
  { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Retiro', fecha: '2026-07-24', etapa: 'post' },
  { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Boedo', fecha: '2026-07-22', etapa: '' },
  { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Almagro', fecha: '2026-07-25', etapa: '' },
  { periodo_id: 'julio_24_30', eje: 'M2', nombre: 'Acumulado', fecha: '2026-07-28', etapa: '' },
  { periodo_id: 'julio_24_30', eje: 'Ministros', nombre: 'Acumulado', fecha: '2026-07-29', etapa: '' },
  { periodo_id: 'junio_sem2', eje: 'JM', nombre: 'Mataderos', fecha: '2026-06-15', etapa: '' },
  { periodo_id: 'junio_sem2', eje: 'JM', nombre: 'Flores', fecha: '2026-06-16', etapa: '' },
  { periodo_id: 'junio_sem2', eje: 'JM', nombre: 'Caballito', fecha: '2026-06-17', etapa: '' },
  { periodo_id: 'junio_sem2', eje: 'M2', nombre: 'Acumulado', fecha: '2026-06-18', etapa: '' },
  { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Chacabuco', fecha: '2026-07-26', etapa: '' }
];

const clavesDe = (filas) => {
  const o = {};
  filas.forEach((f) => { o[M.claveReunion_(f)] = true; });
  return o;
};

console.log('Control positivo del salteo de REUNIONES — código extraído de Reuniones.gs\n');

/* ── 1 · ⛔ el gate del prompt: la clave SIN `etapa` colisiona en la hoja real ──────────────── */
console.log('1 · el gate — por qué `etapa` está en la clave');
{
  const sinEtapa = new Set(HOJA.map((f) => [f.periodo_id, f.eje, f.nombre, f.fecha].join('||')));
  afirmar(sinEtapa.size === 11,
    'la clave del prompt (sin etapa) da 11 claves sobre 13 filas: DOS colisiones — vino ' + sinEtapa.size);

  const conEtapa = Object.keys(clavesDe(HOJA));
  afirmar(conEtapa.length === 13,
    'con `etapa` adentro son 13 claves sobre 13 filas: cero colisiones — vino ' + conEtapa.length);

  // Y el caso puntual, nombrado: pre y post del mismo encuentro NO son la misma fila.
  const pre = M.claveReunion_({ periodo_id: 'julio_24_30', eje: 'JM', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'pre' });
  const post = M.claveReunion_({ periodo_id: 'julio_24_30', eje: 'JM', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'post' });
  afirmar(pre !== post, 'San Cristóbal 23/07 (pre) y (post) son dos claves distintas');
}

/* ── 2 · cargar dos veces el mismo temario NO duplica ───────────────────────────────────────── */
console.log('\n2 · el control principal — cargar dos veces no duplica');
{
  const r = M.separarReunionesNuevas_(HOJA, clavesDe(HOJA));
  afirmar(r.nuevas.length === 0, 'el mismo temario contra la misma hoja no agrega nada — vino ' + r.nuevas.length);
  afirmar(r.salteadas.length === 13, 'y saltea las 13, para poder reportarlas — vino ' + r.salteadas.length);
}

/* ── 3 · ⭐ el control NEGATIVO — una fila nueva SÍ entra ────────────────────────────────────
 * Sin esto, un cargador que no escriba NUNCA pasaría el punto 2 con nota perfecta. */
console.log('\n3 · el control negativo — una fila nueva SÍ se agrega');
{
  const nueva = { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Villa Crespo', fecha: '2026-07-27', etapa: '' };
  const r = M.separarReunionesNuevas_(HOJA.concat([nueva]), clavesDe(HOJA));
  afirmar(r.nuevas.length === 1, 'entra exactamente una — vino ' + r.nuevas.length);
  afirmar(r.nuevas[0] && r.nuevas[0].nombre === 'Villa Crespo', 'y es la nueva, no otra');
  afirmar(r.salteadas.length === 13, 'las 13 viejas se saltean igual');

  // Un encuentro que ya está como `pre` y llega como `post` es fila nueva, no duplicado.
  const post = { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Boedo', fecha: '2026-07-22', etapa: 'post' };
  const r2 = M.separarReunionesNuevas_([post], clavesDe(HOJA));
  afirmar(r2.nuevas.length === 1,
    'Boedo 22/07 (post) entra aunque Boedo 22/07 sin etapa ya esté — son dos filas del temario');
}

/* ── 4 · dedupe DENTRO del texto pegado, no sólo contra la hoja ─────────────────────────────── */
console.log('\n4 · la misma línea dos veces en el mismo pegado');
{
  const nueva = { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Villa Crespo', fecha: '2026-07-27', etapa: '' };
  const r = M.separarReunionesNuevas_([nueva, nueva, nueva], {});
  afirmar(r.nuevas.length === 1,
    'pegada tres veces sobre una hoja VACÍA entra una sola — vino ' + r.nuevas.length);
  afirmar(r.salteadas.length === 2, 'y las otras dos se reportan como salteadas');
}

/* ── 5 · los dos lados de la comparación llegan con tipos distintos ──────────────────────────
 * De la hoja viene un `Date` de Sheets; del parser viene un `Date` construido. Comparar `Date`
 * contra `Date` con `===` no matchea nunca, y ése es el modo de falla que la normalización evita. */
console.log('\n5 · `Date` de la hoja contra texto del temario');
{
  const comoHoja = { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Boedo', fecha: new Date(2026, 6, 22), etapa: '' };
  const comoTexto = { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'Boedo', fecha: '2026-07-22', etapa: '' };
  afirmar(M.claveReunion_(comoHoja) === M.claveReunion_(comoTexto),
    'un `Date` y su `yyyy-MM-dd` dan la MISMA clave — si no, el salteo no salteaba nunca');

  // Espacios de más de un lado no inventan una fila nueva (`R-10`).
  const conEspacios = { periodo_id: ' julio_24_30 ', eje: 'JM', nombre: 'San  Cristóbal', fecha: '2026-07-23', etapa: 'pre' };
  const limpio = { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'pre' };
  afirmar(M.claveReunion_(conEspacios) === M.claveReunion_(limpio),
    'espacios internos y bordes se colapsan — misma clave');

  // Pero las mayúsculas NO se pliegan: `R-10` preserva case y acentos.
  const otroCase = { periodo_id: 'julio_24_30', eje: 'JM', nombre: 'san cristóbal', fecha: '2026-07-23', etapa: 'pre' };
  afirmar(M.claveReunion_(otroCase) !== M.claveReunion_(limpio),
    'y las mayúsculas NO se pliegan: `R-10` preserva case y acentos');
}

console.log('\n' + (fallas === 0
  ? 'TODO EN VERDE. Cargar dos veces no duplica, y una fila nueva sigue entrando.'
  : 'FALLAN ' + fallas + ' afirmacion(es).'));
process.exit(fallas === 0 ? 0 : 1);
