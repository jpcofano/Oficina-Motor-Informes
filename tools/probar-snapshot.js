#!/usr/bin/env node
/**
 * tools/probar-snapshot.js — control positivo de las dos garantías de `tools/snapshot.js`.
 *
 * **Por qué existe.** Este script es el mecanismo que sostiene toda la evidencia fechada del repo:
 * la respuesta a *"¿qué decía una hoja de registro tal día?"* (`CLAUDE.md` §7). Sus dos reglas
 * —**fechar en local** y **no pisar nunca**— son puras y se pueden probar sin tocar Google.
 *
 * ⚠ **Las dos nacieron de daño real, no de prudencia:** el 17/08 a las 22:31 el volcado archivó
 * once hojas con la fecha del día siguiente, y re-correrlo el mismo día **sobrescribió el
 * `MARCADORES_2026-08-17.tsv` pre-migración**, que es la línea base de las cuatro tandas de `D-33`.
 * Se recuperó de git de casualidad.
 *
 * ⚠ **El sistema de archivos se inyecta**: `rutaSinPisar` recibe `existe` y `leer`, así que esto
 * corre sobre un disco falso y **no escribe un solo byte**. Una prueba de "no pises archivos" que
 * necesitara archivos de verdad sería la primera candidata a hacer justamente eso.
 *
 * Uso:
 *   node tools/probar-snapshot.js
 */

'use strict';

const path = require('path');
const { fechaLocal, horaLocal, rutaSinPisar } = require('./snapshot');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/** Un disco falso: `{ ruta: contenido }`. */
function disco(archivos) {
  return {
    existe: (p) => Object.prototype.hasOwnProperty.call(archivos, p),
    leer: (p) => archivos[p]
  };
}

const D = '/snap';
const base = (n) => path.join(D, n);

console.log('Control positivo de tools/snapshot.js — sin red y sin escribir en disco\n');

/* ── 1 · la fecha es LOCAL, no UTC ────────────────────────────────────────────────────────
 * El caso exacto que falló: 22:31 del 17/08 en ART (UTC−3) es 01:31 UTC del 18. */
console.log('1 · la fecha se toma del reloj LOCAL');
{
  const nocheDel17 = new Date(2026, 7, 17, 22, 31, 0); // mes 7 = agosto
  afirmar(fechaLocal(nocheDel17) === '2026-08-17',
    '22:31 del 17/08 se archiva como 2026-08-17 — vino ' + fechaLocal(nocheDel17));
  // El control que hace que el caso de arriba signifique algo: con UTC habría dado el 18.
  afirmar(nocheDel17.toISOString().slice(0, 10) === '2026-08-18',
    'y toISOString() sobre esa MISMA fecha da 2026-08-18 — por eso el bug era real');
  const mediodia = new Date(2026, 7, 17, 12, 0, 0);
  afirmar(fechaLocal(mediodia) === '2026-08-17', 'al mediodía las dos coincidían (por eso no se notó)');
  afirmar(fechaLocal(new Date(2026, 0, 5, 9, 4, 0)) === '2026-01-05',
    'mes y día se rellenan a dos cifras');
  afirmar(horaLocal(new Date(2026, 7, 17, 9, 4, 0)) === '0904', 'la hora también');
}

/* ── 2 · un archivo que ya existe NO se pisa ──────────────────────────────────────────────
 * Es la garantía que hace citable a un snapshot. */
console.log('\n2 · un snapshot existente nunca se sobrescribe');
{
  const previo = 'marcador\tfiltro\ncampana~=JM\n';
  const nuevo = 'marcador\tfiltro\n\n';
  const d = disco({ [base('MARCADORES_2026-08-17.tsv')]: previo });
  const ahora = new Date(2026, 7, 17, 22, 31, 0);
  const r = rutaSinPisar(D, 'MARCADORES', '2026-08-17', nuevo, ahora, d.existe, d.leer);

  afirmar(r.estado === 'versionado', 'el estado es `versionado` — vino ' + r.estado);
  afirmar(r.archivo !== base('MARCADORES_2026-08-17.tsv'),
    'NO apunta al archivo existente — el caso exacto del 17/08');
  afirmar(path.basename(r.archivo) === 'MARCADORES_2026-08-17_2231.tsv',
    'la toma nueva lleva la hora — vino ' + path.basename(r.archivo));
  afirmar(r.preservado === base('MARCADORES_2026-08-17.tsv'),
    'dice cuál preservó, para poder informarlo');
}

/* ── 3 · el control NEGATIVO: sin archivo previo usa el nombre pelado ─────────────────────
 * ⚠ Sin este caso, una función que versionara SIEMPRE pasaría el caso 2 entero — y ensuciaría
 * la carpeta con un archivo con hora por cada corrida. */
console.log('\n3 · control negativo — sin archivo previo, nombre pelado (si no, el 2 pasa con cualquier cosa)');
{
  const d = disco({});
  const r = rutaSinPisar(D, 'MARCADORES', '2026-08-17', 'x', new Date(2026, 7, 17, 22, 31), d.existe, d.leer);
  afirmar(r.estado === 'nuevo', 'estado `nuevo` — vino ' + r.estado);
  afirmar(path.basename(r.archivo) === 'MARCADORES_2026-08-17.tsv',
    'sin hora en el nombre — vino ' + path.basename(r.archivo));
}

/* ── 4 · contenido idéntico no escribe nada ───────────────────────────────────────────────
 * Re-correr sobre una hoja quieta no tiene por qué dejar rastro. Sin esto, cada corrida del día
 * dejaría un archivo con hora aunque no hubiera cambiado un solo byte. */
console.log('\n4 · contenido idéntico → no se reescribe');
{
  const igual = 'a\tb\n1\t2\n';
  const d = disco({ [base('CONFIG_2026-08-17.tsv')]: igual });
  const r = rutaSinPisar(D, 'CONFIG', '2026-08-17', igual, new Date(2026, 7, 17, 23, 0), d.existe, d.leer);
  afirmar(r.estado === 'identico', 'estado `identico` — vino ' + r.estado);
  afirmar(path.basename(r.archivo) === 'CONFIG_2026-08-17.tsv', 'apunta al mismo archivo, y el llamador no escribe');
}

/* ── 5 · dos tomas distintas en el mismo minuto ───────────────────────────────────────────
 * El borde que haría fallar la garantía justo cuando más se la necesita. */
console.log('\n5 · dos tomas distintas en el mismo minuto tampoco se pisan');
{
  const d = disco({
    [base('MAPEO_2026-08-17.tsv')]: 'v1',
    [base('MAPEO_2026-08-17_2231.tsv')]: 'v2'
  });
  const r = rutaSinPisar(D, 'MAPEO', '2026-08-17', 'v3', new Date(2026, 7, 17, 22, 31, 47), d.existe, d.leer);
  afirmar(!d.existe(r.archivo), 'el destino elegido no existe todavía — vino ' + path.basename(r.archivo));
  afirmar(path.basename(r.archivo) === 'MAPEO_2026-08-17_223147.tsv',
    'agrega segundos — vino ' + path.basename(r.archivo));
}

console.log('\n' + (fallas === 0
  ? '✅ Todo en verde. Un snapshot escrito no cambia de contenido nunca más.'
  : '❌ ' + fallas + ' afirmación(es) fallando.'));
process.exit(fallas === 0 ? 0 : 1);
