#!/usr/bin/env node
/**
 * tools/probar-semana-cerrada.js — control positivo de `ultimaSemanaCerradaR11_`
 * (`docs/Prompts/2026-08-20_2_semana_por_defecto.md`, Parte C), **fuera de Apps Script** y
 * extrayendo el código real del repo.
 *
 * Mismo criterio que `probar-formato-revisar.js` y `probar-simbolos-faltante.js`: una copia pegada
 * acá probaría la copia. `extraerFuncion` **falla** si el nombre no está, así que un renombre no
 * pasa en silencio.
 *
 * Qué prueba: que la propuesta por defecto sea **la última semana CERRADA**, viernes a jueves.
 * Función pura, fecha por parámetro, **sin planilla y sin esperar a un viernes**.
 *
 * ⭐ **El caso que motiva el prompt entero es el viernes**, y es el único día donde las dos
 * lecturas difieren. Un fixture de jueves **no distingue las dos funciones** —el jueves cierra su
 * propia semana en las dos—, que es exactamente el modo de falla que `CLAUDE.md` §4 documenta con
 * `[10, 5, '']`: un dato que satisface dos afirmaciones por igual no distingue entre ellas.
 *
 * ⚠ **Se corre también el control de `semanaR11_` tal como está** (punto 6 de la Parte C). Si
 * alguna de sus nueve afirmaciones hubo que tocarla, es que se cambió la función vieja en vez de
 * apoyarse en ella — y este archivo lo dice en vez de dejarlo pasar.
 *
 * Uso:
 *   node tools/probar-semana-cerrada.js
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

const cuerpo = extraerFuncion('Fuentes.gs', 'semanaR11_') + '\n' +
  extraerFuncion('Fuentes.gs', 'ultimaSemanaCerradaR11_');

// eslint-disable-next-line no-new-func
const M = new Function(cuerpo + '\nreturn { semanaR11_, ultimaSemanaCerradaR11_ };')();

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  OK  ' + mensaje);
  else { fallas++; console.log('  XX  ' + mensaje); }
}

const iso = (d) => d.getFullYear() + '-' +
  String(d.getMonth() + 1).padStart(2, '0') + '-' +
  String(d.getDate()).padStart(2, '0');

/** Fecha local sin hora, igual que la construye el motor. */
const F = (y, m, d, ...resto) => new Date(y, m - 1, d, ...resto);

/** `propuesta(fecha)` -> 'AAAA-MM-DD..AAAA-MM-DD' */
function propuesta(fecha) {
  const v = M.ultimaSemanaCerradaR11_(fecha);
  return iso(v.desde) + '..' + iso(v.hasta);
}

console.log('Control positivo de `ultimaSemanaCerradaR11_` — código extraído de Fuentes.gs\n');

/* ── 1 · jueves 20/08/2026: el jueves cierra su propia semana ───────────────────────────────── */
console.log('1 · jueves 20/08/2026 — el jueves cierra su propia semana');
{
  afirmar(propuesta(F(2026, 8, 20)) === '2026-08-14..2026-08-20',
    'jueves 20/08 propone 14/08-20/08 — vino ' + propuesta(F(2026, 8, 20)));
}

/* ── 2 · ⭐ viernes 21/08/2026: EL caso que motiva el prompt ─────────────────────────────────
 * La semana que arranca ese viernes todavía no cerró, así que la propuesta NO se mueve. Es el
 * único día del ciclo donde `ultimaSemanaCerradaR11_` y `semanaR11_` dan cosas distintas. */
console.log('\n2 · viernes 21/08/2026 — el caso que motiva el prompt entero');
{
  afirmar(propuesta(F(2026, 8, 21)) === '2026-08-14..2026-08-20',
    'viernes 21/08 sigue proponiendo 14/08-20/08, NO 21-27 — vino ' + propuesta(F(2026, 8, 21)));

  // Y la otra mitad de la afirmación, que es la que la vuelve informativa: acá las dos lecturas
  // DIFIEREN. Sin esto, la prueba pasaría igual con la función vieja.
  const vieja = M.semanaR11_(F(2026, 8, 21));
  afirmar(iso(vieja.desde) === '2026-08-21',
    'y `semanaR11_` sobre el mismo viernes da 21/08 — o sea, las dos funciones DIFIEREN acá');
  afirmar(propuesta(F(2026, 8, 21)) !== iso(vieja.desde) + '..' + iso(vieja.hasta),
    'las dos lecturas no coinciden el viernes: es el día que separa una de la otra');
}

/* ── 3 · la propuesta no se mueve hasta el jueves siguiente ─────────────────────────────────── */
console.log('\n3 · sábado 22/08 y miércoles 26/08 — la propuesta no se mueve');
{
  afirmar(propuesta(F(2026, 8, 22)) === '2026-08-14..2026-08-20',
    'sábado 22/08 sigue en 14/08-20/08');
  afirmar(propuesta(F(2026, 8, 26)) === '2026-08-14..2026-08-20',
    'miércoles 26/08 sigue en 14/08-20/08');

  // Los siete días del ciclo dan la MISMA propuesta salvo el jueves siguiente, que abre otra.
  const mismos = [21, 22, 23, 24, 25, 26].every((d) => propuesta(F(2026, 8, d)) === '2026-08-14..2026-08-20');
  afirmar(mismos, 'los seis días del 21 al 26 dan todos la misma propuesta');
}

/* ── 4 · jueves 27/08 — recién ahí avanza ───────────────────────────────────────────────────── */
console.log('\n4 · jueves 27/08/2026 — recién ahí avanza');
{
  afirmar(propuesta(F(2026, 8, 27)) === '2026-08-21..2026-08-27',
    'jueves 27/08 propone 21/08-27/08 — vino ' + propuesta(F(2026, 8, 27)));
}

/* ── 5 · siete días inclusive, y cruce de año ───────────────────────────────────────────────── */
console.log('\n5 · siete días inclusive, y cruce de año');
{
  const v = M.ultimaSemanaCerradaR11_(F(2026, 8, 21));
  const dias = Math.round((v.hasta - v.desde) / 86400000) + 1;
  afirmar(dias === 7, 'son siete días contando los dos extremos, no ocho');
  afirmar(v.desde.getDay() === 5, 'la ventana abre un VIERNES');
  afirmar(v.hasta.getDay() === 4, 'y cierra un JUEVES');

  // Cruce de año: el viernes 01/01/2027 es viernes, así que la última cerrada es la anterior.
  afirmar(propuesta(F(2027, 1, 1)) === '2026-12-25..2026-12-31',
    'viernes 01/01/2027 propone 25/12-31/12 del año anterior — vino ' + propuesta(F(2027, 1, 1)));
  afirmar(propuesta(F(2027, 1, 7)) === '2027-01-01..2027-01-07',
    'jueves 07/01/2027 ya propone 01/01-07/01');

  // La hora no participa: la ventana es de días.
  afirmar(propuesta(F(2026, 8, 21, 23, 59, 59)) === '2026-08-14..2026-08-20',
    'la hora de la corrida no mueve la propuesta');

  // Un año entero sin romperse: toda propuesta abre viernes, cierra jueves y dura 7 días.
  let malos = 0;
  for (let i = 0; i < 400; i++) {
    const f = new Date(2026, 0, 1 + i);
    const v2 = M.ultimaSemanaCerradaR11_(f);
    const d2 = Math.round((v2.hasta - v2.desde) / 86400000) + 1;
    if (v2.desde.getDay() !== 5 || v2.hasta.getDay() !== 4 || d2 !== 7 || v2.hasta > f) malos++;
  }
  afirmar(malos === 0,
    '400 días corridos: toda propuesta abre viernes, cierra jueves, dura 7 días y NUNCA cae en el futuro');
}

/* ── 6 · `semanaR11_` sigue pasando su propio control, tal como está ────────────────────────
 * Punto 6 de la Parte C. Las nueve afirmaciones de `probarSemanaR11_` (`Pruebas.gs`) se
 * reproducen acá **con los mismos valores**, porque la función vieja NO se tocó y eso hay que
 * poder demostrarlo sin abrir Apps Script. */
console.log('\n6 · `semanaR11_` no cambió — sus nueve afirmaciones, tal cual');
{
  const d = M.semanaR11_(F(2026, 7, 24));
  afirmar(iso(d.desde) === '2026-07-24', 'R-11: corriendo un viernes, la semana arranca ESE viernes');
  afirmar(iso(d.hasta) === '2026-07-30', 'R-11: cierra el jueves siguiente, extremo inclusive');
  afirmar(Math.round((d.hasta - d.desde) / 86400000) + 1 === 7, 'R-11: siete días inclusive');

  ['2026-07-25', '2026-07-28', '2026-07-30'].forEach((dia) => {
    const p = dia.split('-').map(Number);
    const v = M.semanaR11_(F(p[0], p[1], p[2]));
    afirmar(iso(v.desde) === '2026-07-24' && iso(v.hasta) === '2026-07-30',
      'R-11: ' + dia + ' cae en la semana del 24/07');
  });

  afirmar(iso(M.semanaR11_(F(2026, 7, 31)).desde) === '2026-07-31',
    'R-11: el viernes siguiente abre una ventana nueva');
  const fa = M.semanaR11_(F(2027, 1, 2));
  afirmar(iso(fa.desde) === '2027-01-01' && iso(fa.hasta) === '2027-01-07',
    'R-11: cruza el cambio de año sin romperse');
  afirmar(iso(M.semanaR11_(F(2026, 7, 28, 23, 59, 59)).desde) === '2026-07-24',
    'R-11: la hora de la corrida no mueve la ventana');
}

console.log('\n' + (fallas === 0
  ? 'TODO EN VERDE. La propuesta es la última semana cerrada, y `semanaR11_` quedó intacta.'
  : 'FALLAN ' + fallas + ' afirmacion(es).'));
process.exit(fallas === 0 ? 0 : 1);
