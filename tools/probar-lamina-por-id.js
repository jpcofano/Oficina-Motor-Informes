#!/usr/bin/env node
/**
 * tools/probar-lamina-por-id.js — **ninguna decisión del motor cuelga de `orden_plantilla`**
 * (`docs/Prompts/2026-08-21_6_orden_no_es_clave.md`), fuera de Apps Script y leyendo el fuente del
 * repo — mismo criterio que `probar-reloj-etapas.js`.
 *
 * ⭐ **La regla que protege está escrita en el seed de `LAMINAS`, y es tajante:** *"`orden_plantilla`
 * es reportado, NUNCA autoritativo. **Nada del motor puede decidir en base a ese número**"*. El
 * motivo también está ahí: insertar una lámina antes corre todos los de abajo, y es exactamente lo
 * que rompió `LAMINAS_CONGELADAS_` cuando guardaba números.
 *
 * **El caso ya existe y no es hipotético.** Medido el 21/08 con `verificarLaminas()`: `L-052` se
 * insertó en la posición 6 de la plantilla de `jm` y corrió a `L-035` a la 7, pero la hoja sigue
 * diciendo `orden_plantilla = 6` para las dos. **Diecisiete filas quedaron con el orden viejo.** Eso
 * es esperado —el id existe justamente para que el orden no importe— y **sólo es un problema donde
 * alguien resuelve por orden**.
 *
 * ⚠ **Y ahí estaba el bug latente:** `censarTokensSinMarcador_` indexaba `iteran` por
 * `orden_plantilla`, así que con dos láminas del mismo número **una pisaba a la otra en silencio**.
 * No se disparaba sólo porque `itera_sobre` está vacío en las 52 filas — o sea que esperaba a la
 * primera fila que lo declarara.
 *
 * Uso:
 *   node tools/probar-lamina-por-id.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/** El código de un `.gs`, sin comentarios: un instrumento que mide código no puede confundirlo
 *  con su explicación — los comentarios citan el patrón viejo justamente para explicarlo. */
function codigoDe(archivo) {
  return fs.readFileSync(path.join(RAIZ, archivo), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
}

const GS = fs.readdirSync(RAIZ).filter((f) => f.endsWith('.gs'));

console.log('`orden_plantilla` no decide nada — fuente del repo\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · ⭐ Nadie usa `orden_plantilla` como clave de un mapa
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · `orden_plantilla` no se usa como clave de mapa en ningún .gs');
{
  const usos = [];
  GS.forEach((f) => {
    codigoDe(f).split('\n').forEach((linea, i) => {
      // `algo[…orden_plantilla…] =` — indexar por el orden es decidir por el orden.
      if (/\[[^\]]*orden_plantilla[^\]]*\]\s*=/.test(linea)) {
        usos.push(f + ':' + (i + 1) + ' → ' + linea.trim().slice(0, 80));
      }
    });
  });

  afirmar(usos.length === 0,
    usos.length === 0
      ? 'ninguno de los ' + GS.length + ' archivos indexa por `orden_plantilla`'
      : usos.length + ' uso(s) como clave: ' + usos.join(' | '));
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · El censo resuelve por `lamina_id`, que es la identidad
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · el censo resuelve por el ancla de la lámina');
{
  const aud = codigoDe('Auditoria.gs');

  afirmar(aud.indexOf('iteran[String(l.lamina_id || k).trim()]') !== -1,
    'el mapa `iteran` se indexa por `lamina_id`');
  afirmar(aud.indexOf('var idLamina = anclaDeLamina_(slide);') !== -1,
    'y la identidad de la lámina del deck sale de `anclaDeLamina_`, no de su posición');
  afirmar(aud.indexOf('iteran[String(n)]') === -1,
    'ya no queda ninguna lectura del mapa por número de lámina');
  afirmar(aud.indexOf('sinAncla.push(n)') !== -1,
    'y una lámina sin ancla se cuenta aparte en vez de resolverse por posición');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⭐ El caso real: dos láminas con el mismo `orden_plantilla`
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Se reproduce la colisión sobre el snapshot vivo de `LAMINAS` — no sobre un fixture inventado.
 * `CLAUDE.md` §4: un fixture se copia de una salida real, nunca se deduce. */
console.log('\n3 · la colisión real de `L-035` y `L-052`, sobre el snapshot del 21/08');
{
  const snap = path.join(RAIZ, 'docs/_snapshots/LAMINAS_2026-08-21.tsv');
  if (!fs.existsSync(snap)) {
    fallas++;
    console.log('  ❌ falta el snapshot ' + snap + ' — sin él este bloque mide un fixture inventado');
  } else {
    const filas = fs.readFileSync(snap, 'utf8').trim().split('\n').map((l) => l.split('\t'));
    const h = filas.shift();
    const iId = h.indexOf('lamina_id');
    const iInf = h.indexOf('informe_id');
    const iOrd = h.indexOf('orden_plantilla');
    const jm = filas.filter((f) => f[iInf] === 'jm');

    afirmar(jm.length > 0, 'el snapshot trae ' + jm.length + ' lámina(s) de `jm`');

    // Cuántos órdenes están repetidos dentro de jm.
    const porOrden = {};
    jm.forEach((f) => { (porOrden[f[iOrd]] = porOrden[f[iOrd]] || []).push(f[iId]); });
    const repetidos = Object.keys(porOrden).filter((o) => porOrden[o].length > 1);

    afirmar(repetidos.length > 0,
      'y hay ' + repetidos.length + ' orden(es) repetido(s): ' +
      repetidos.map((o) => o + ' → ' + porOrden[o].join(' y ')).join(' · ') +
      ' — **la colisión es real, no hipotética**');

    // ⭐ La demostración del daño: indexar por orden pierde filas; por id, no.
    const porOrdenClave = {}, porIdClave = {};
    jm.forEach((f) => { porOrdenClave[f[iOrd]] = f[iId]; porIdClave[f[iId]] = f[iOrd]; });

    afirmar(Object.keys(porOrdenClave).length < jm.length,
      'indexar por `orden_plantilla` pierde ' + (jm.length - Object.keys(porOrdenClave).length) +
      ' fila(s) en silencio — ' + Object.keys(porOrdenClave).length + ' claves para ' + jm.length + ' láminas');
    afirmar(Object.keys(porIdClave).length === jm.length,
      'indexar por `lamina_id` no pierde ninguna: ' + Object.keys(porIdClave).length + ' de ' + jm.length);
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · ⚠ Romper a propósito
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · romper a propósito: con el índice por orden, la afirmación 1 cae');
{
  const buena = 'iteran[String(l.lamina_id || k).trim()] = l.itera_sobre;';
  const rota = 'iteran[String(l.orden_plantilla)] = l.itera_sobre;';
  const texto = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');

  if (texto.indexOf(buena) === -1) {
    fallas++;
    console.log('  ❌ no encontré la línea del índice — si se reescribió, esta prueba tiene que enterarse');
  } else {
    const roto = texto.replace(buena, rota)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    const cae = roto.split('\n').some((l) => /\[[^\]]*orden_plantilla[^\]]*\]\s*=/.test(l));
    afirmar(cae, 'con el índice viejo el detector lo encuentra — el control mide lo que dice');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · El generador nunca dependió del orden, y sigue sin depender
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · el generador no menciona `orden_plantilla`');
{
  afirmar(codigoDe('Generador.gs').indexOf('orden_plantilla') === -1,
    'Generador.gs no lo usa en ningún lado — la corrida nunca decidió por orden');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si el ancla de cada lámina coincide con su fila. Eso lo mide `verificarLaminas()`');
console.log('     contra las plantillas vivas, y hay que correrlo cada vez que se toca una plantilla.');
console.log('   · Qué orden tiene hoy cada lámina en la plantilla. El snapshot dice lo que la HOJA');
console.log('     declara, y al 21/08 diecisiete filas de `jm` tenían el orden viejo — que es');
console.log('     inofensivo justamente porque nadie decide por ese número.');

process.exit(fallas === 0 ? 0 : 1);
