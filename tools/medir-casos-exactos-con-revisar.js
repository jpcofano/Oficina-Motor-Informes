#!/usr/bin/env node
/**
 * tools/medir-casos-exactos-con-revisar.js — **el cruce INVERSO: casos `exacto` cuyo marcador
 * SIGUE marcado `_revisar`.** Ítem 36 de la cola. Parte H del `2026-09-05_1`.
 *
 * ⛔⛔ **El hueco que cierra:** el cruce marcador → caso corre **en una sola dirección**. Se detecta
 * el marcador con `_revisar` que **ya tiene** caso; **no** se detecta el caso `exacto` cuyo marcador
 * **sigue** marcado. ⚠ Eso es lo que dejó pasar la aplicación masiva del 01/09 — y `CLAUDE.md` §4 ya
 * lo tiene escrito con las dos direcciones: *«no alcanza con vigilar que no marquen de más: hay que
 * vigilar que no falte marcar»*, y su simétrica.
 *
 * ══ ⛔⛔ POR QUÉ ESTO NO ES UN `.gs`, QUE ES LO QUE EL PROMPT PEDÍA ═════════════════════════
 *
 * El prompt pedía `diagCasosExactosConRevisar()` en Apps Script. **No puede vivir ahí.** Los
 * `casos_validacion_*.csv` **no están en Drive**: viven en el repo, y el propio código lo dice —
 * *«el cruce completo se hace en disco»* (`Instalar.gs`). ⇒ Un `.gs` tendría que llevar la lista de
 * marcadores validados **embebida**, y eso es **exactamente la lista congelada** que hundió a
 * `confirmarNumerosDeUnoAUno()`: congelada el 26/08, no pudo enterarse de `X-42` y `X-43` del 28/08.
 *
 * ⭐ **Escribir en `.gs` el instrumento que vigila las listas congeladas, con una lista congelada
 * adentro, es el error que el ítem 36 existe para prevenir.** Acá los dos insumos están en disco, así
 * que el cruce se hace **contra los CSV vivos** y **corre esta misma noche**.
 *
 * ⚠ **`medir-*` y no `probar-*` a propósito:** mide contra un **snapshot fechado**, así que su
 * resultado es evidencia de ese día y **no un veredicto de hoy**. `tools/suites.js` no lo levanta —
 * un banco de la suite que dependiera de un snapshot viejo se pondría rojo por envejecer, no por
 * romperse.
 *
 * Uso:  node tools/medir-casos-exactos-con-revisar.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const DOCS = path.join(RAIZ, 'docs');

const SNAP = 'MARCADORES_2026-08-31.tsv';

/* ── Un parser de CSV de verdad, porque las notas llevan comas Y comillas ─────────────────────
 * ⚠ Partir por comas rompería en la primera nota. Y partir por `\n` rompería si alguna nota
 * tiene un salto adentro de las comillas — este lector consume el archivo carácter a carácter
 * y respeta las comillas, así que las dos cosas quedan cubiertas. */
function leerCsv(texto) {
  const filas = [];
  let campo = '', fila = [], enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else enComillas = false; }
      else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

const archivos = fs.readdirSync(DOCS)
  .filter(n => /^casos_validacion_.*\.csv$/.test(n)).sort();   // orden = orden de fecha

/* ── 1 · Los casos, con `token_propuesto` DESARMADO ──────────────────────────────────────── */
console.log('═══ 1 · los casos, y el desarme de `token_propuesto` ═══');
const porMarcador = {};   // marcador -> {estado, caso, archivo, orden}
let filasLeidas = 0, celdasMulti = 0, marcadoresVistos = 0;

archivos.forEach((nombre, orden) => {
  const filas = leerCsv(fs.readFileSync(path.join(DOCS, nombre), 'utf8'));
  const head = filas[0].map(h => h.trim());
  const iId = head.indexOf('caso_id');
  const iTok = head.indexOf('token_propuesto');
  const iEst = head.indexOf('estado');
  if (iId < 0 || iTok < 0 || iEst < 0) {
    console.log('  ⛔ ' + nombre + ': faltan columnas — ' + head.join('|'));
    return;
  }
  filas.slice(1).forEach(f => {
    const id = (f[iId] || '').trim();
    if (!/^[A-Z]+-\d+$/.test(id)) return;
    filasLeidas++;
    /* ⛔ Una celda puede traer VARIOS marcadores separados por ` / ` —`V-125` trae seis—, y
     * contar celdas en vez de marcadores da un número que no corresponde a nada. */
    const trozos = (f[iTok] || '').split('/').map(s => s.trim()).filter(Boolean);
    if (trozos.length > 1) celdasMulti++;
    trozos.forEach(t => {
      if (!/^[a-z][a-z0-9_]*$/.test(t)) return;   // descarta descripciones en prosa
      marcadoresVistos++;
      /* ⭐ `D-58`: cuando dos casos hablan del mismo marcador, manda el MÁS NUEVO. El orden es
       * el del archivo (por fecha) y, dentro de uno, el de aparición. */
      porMarcador[t] = { estado: (f[iEst] || '').trim(), caso: id, archivo: nombre, orden: orden };
    });
  });
});
console.log('  archivos: ' + archivos.length + '  ·  filas de caso: ' + filasLeidas);
console.log('  celdas con VARIOS marcadores: ' + celdasMulti +
  '  ·  referencias a marcador desarmadas: ' + marcadoresVistos);
console.log('  marcadores distintos con caso vigente: ' + Object.keys(porMarcador).length);
console.log('  ⭐ vigente = el caso MÁS NUEVO que habla de ese marcador (`D-58`), no el primero.');

const exactos = Object.keys(porMarcador).filter(m => porMarcador[m].estado === 'exacto');
console.log('  de ellos, con caso vigente `exacto`: ' + exactos.length);

/* ── 2 · El snapshot de MARCADORES ───────────────────────────────────────────────────────── */
console.log('\n═══ 2 · ⚠ el estado de `MARCADORES` — FOTO DEL 31/08, no de hoy ═══');
const tsv = fs.readFileSync(path.join(DOCS, '_snapshots', SNAP), 'utf8').split(/\r?\n/);
const cab = tsv[0].split('\t').map(h => h.trim());
const iMar = cab.indexOf('marcador'), iFmt = cab.indexOf('formato');
const formatoDe = {};
tsv.slice(1).forEach(l => {
  if (!l.trim()) return;
  const c = l.split('\t');
  const n = (c[iMar] || '').trim();
  if (n) formatoDe[n] = (c[iFmt] || '').trim();
});
console.log('  ' + SNAP + '  ·  filas: ' + Object.keys(formatoDe).length);
console.log('  ⛔ Es ANTERIOR a la migración a `informe_id = "*"` y a los `emin_*`. Sirve para');
console.log('     probar que el instrumento FUNCIONA. **NO para sacar un número de hoy.**');

/* ── 3 · ⭐ Control positivo, antes de reportar nada ──────────────────────────────────────── */
console.log('\n═══ 3 · ⭐ CONTROL POSITIVO — el cruce tiene que reencontrar casos conocidos ═══');
const reencontrados = exactos.filter(m => formatoDe[m] !== undefined);
console.log('  marcadores con caso `exacto` que EXISTEN en el snapshot: ' +
  reencontrados.length + ' de ' + exactos.length);
if (!reencontrados.length) {
  console.log('  ⛔⛔ ABORTA: el cruce no reencontró NINGUNO. **El instrumento no ve** — o el');
  console.log('     desarme de `token_propuesto` falló, o los nombres no matchean el snapshot.');
  console.log('     Un cero acá sería indistinguible de «todo está limpio».');
  process.exit(1);
}
console.log('  ✅ el instrumento ve. Ejemplos: ' + reencontrados.slice(0, 5).join(', '));

/* ── 4 · ⛔ El hallazgo: caso `exacto` vigente Y `_revisar` puesto ────────────────────────── */
console.log('\n═══ 4 · ⛔ LOS QUE TIENEN CASO `exacto` VIGENTE **Y** SIGUEN CON `_revisar` ═══');
const marcados = reencontrados.filter(m => {
  const f = formatoDe[m];
  return f && f.length > 8 && f.slice(-8) === '_revisar';
});
console.log('  ⛔ ' + marcados.length + ' marcador(es):');
marcados.forEach(m => {
  const c = porMarcador[m];
  console.log('     · ' + m.padEnd(28) + ' formato ' + formatoDe[m].padEnd(26) +
    ' caso ' + c.caso + '  (' + c.archivo.replace('casos_validacion_', '').replace('.csv', '') + ')');
});
if (!marcados.length) {
  console.log('     (ninguno) — ⚠ y eso es un RESULTADO sobre el 31/08, no sobre hoy.');
}

/* ── 5 · La otra dirección, que sale gratis y es la mitad que faltaba ─────────────────────── */
console.log('\n═══ 5 · ⭐ la dirección INVERSA, que sale del mismo cruce ═══');
const contradichos = Object.keys(porMarcador)
  .filter(m => porMarcador[m].estado === 'contradice' && formatoDe[m] !== undefined)
  .filter(m => { const f = formatoDe[m]; return !(f && f.length > 8 && f.slice(-8) === '_revisar'); });
console.log('  con caso vigente `contradice` y SIN marca: ' + contradichos.length);
contradichos.forEach(m => {
  console.log('     ⛔ ' + m.padEnd(28) + ' formato ' + (formatoDe[m] || '(vacío)').padEnd(26) +
    ' caso ' + porMarcador[m].caso);
});
console.log('  ⇒ Un marcador que un caso DESMIENTE y que publica sin aviso es el número plausible');
console.log('    y equivocado, esta vez con el aviso ya escrito en el repo (`CLAUDE.md` §4).');

/* ── 6 · ⭐⭐ El control positivo FUERTE: un caso que el repo ya nombra por su nombre ──────── */
console.log('\n═══ 6 · ⭐⭐ CONTROL POSITIVO FUERTE — el caso que `CLAUDE.md` §4 documenta ═══');
{
  /* ⭐ `CLAUDE.md` §4 dice, textual: *«`u1_post_meta_alcance` tiene el caso `X-43` contradice del
   * 28/08 y NO tiene marca ⇒ un marcador que un caso desmiente está publicando sin aviso»*.
   * ⇒ **El instrumento tiene que reencontrarlo solo.** No es un caso sintético ni uno que yo
   * eligiera después de ver el resultado: estaba escrito antes de que esto existiera. */
  const TESTIGO = 'u1_post_meta_alcance';
  const hallado = contradichos.indexOf(TESTIGO) !== -1;
  if (hallado) {
    console.log('  ✅ reencontró `' + TESTIGO + '` (' + porMarcador[TESTIGO].caso + ') ⇒ el cruce');
    console.log('     inverso FUNCIONA: `CLAUDE.md` §4 lo nombra y este instrumento lo halla solo.');
  } else {
    console.log('  ⚠ NO reencontró `' + TESTIGO + '`, que `CLAUDE.md` §4 documenta.');
    console.log('     ⛔ Dos causas OPUESTAS y esto no las distingue: **o el cruce está ciego, o');
    console.log('     alguien ya le puso la marca** — el `_7` Addendum 1 lo tocó el 04/09, y este');
    console.log('     snapshot es del 31/08. **Antes de leer el punto 5, resolver cuál de las dos.**');
  }
}

console.log('');
console.log('⚠ LÍMITES, y son parte del resultado:');
console.log('  1 · El snapshot es del **31/08**. Los números de arriba responden por ese día.');
console.log('  2 · `D-58` se aplica por ORDEN DE ARCHIVO. Dos casos del MISMO archivo sobre el');
console.log('      mismo marcador se resuelven por orden de aparición, que es una convención.');
console.log('  3 · Sólo se desarman los trozos que **parecen un nombre de marcador**; las celdas');
console.log('      en prosa —como las de `C-97`— no aportan ninguno, y eso es correcto.');
console.log('  4 · ⛔ Esto NO dice si el `_revisar` está bien o mal puesto: dice que hay un caso');
console.log('      que opina distinto. **Quién manda lo decide el usuario.**');
