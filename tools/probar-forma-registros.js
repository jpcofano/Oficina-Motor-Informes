#!/usr/bin/env node
/**
 * tools/probar-forma-registros.js — guarda de la CLASE de bug que rompió `diagTopeDeVentana()`
 * el 22/08/2026: **usar un lector de registro con la forma equivocada.**
 *
 * ⭐ **Por qué un lint y no una prueba del botón.** El bug fue
 * `leerSolapas().forEach(...)` → `TypeError`, y `leerSolapas()` devuelve un **mapa anidado**
 * `{base_id: {solapa: {...}}}`. Probar ese botón exigiría montar medio Apps Script; **greppear la
 * forma cubre a los 18 consumidores de golpe y a los que se escriban mañana**, que es lo que de
 * verdad hace falta.
 *
 * ⚠⚠ **Y la razón de fondo, que es un hallazgo por sí solo: de los siete lectores de `Config.gs`,
 * SEIS devuelven MAPA y UNO devuelve LISTA — `leerCampanas()` — y nada en el nombre lo dice.**
 * Es `CLAUDE.md` §4 en su forma más cara: *dos cosas que se llaman igual no son la misma cosa*.
 * A eso se suma `leerFilasSolapas_(hoja)` en `Solapas.gs`, que **también es lista** y se llama casi
 * igual que `leerSolapas()`.
 *
 * **Qué afirma, en las dos direcciones:**
 *   1. Ningún `.gs` aplica un método de **array** al retorno de un lector de **mapa**.
 *   2. Ningún `.gs` aplica `Object.keys/values/entries` al retorno del lector de **lista**.
 *
 * ⚠ **Lo que NO cubre, y conviene saberlo:** el retorno asignado a una variable —
 * `var s = leerSolapas(); s.forEach(...)`— **no lo ve este lint**. Cubre la forma directa, que es
 * la que se escribe cuando uno va rápido y es exactamente cómo apareció el bug.
 *
 * Uso:
 *   node tools/probar-forma-registros.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/** Se leen del propio `Config.gs` en vez de escribirlos acá: una lista a mano envejece. */
function clasificarLectores() {
  const texto = fs.readFileSync(path.join(RAIZ, 'Config.gs'), 'utf8');
  const mapa = [], lista = [];
  const re = /function (leer[A-Z][A-Za-z]*)\(\)\s*\{([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const nombre = m[1], cuerpo = m[2];
    // Un lector de mapa delega en `leerRegistro_` o memoiza un `*SinCache_` que arma un objeto.
    if (/return\s+(memoRegistro_|leerRegistro_)/.test(cuerpo)) {
      const sin = (cuerpo.match(/memoRegistro_\([^,]+,\s*(leer\w+SinCache_)/) || [])[1];
      if (sin) {
        const cuerpoSin = (texto.match(new RegExp('function ' + sin + '\\(\\)\\s*\\{([\\s\\S]*?)\\n\\}')) || [])[1] || '';
        (/return\s*\[\]/.test(cuerpoSin) ? lista : mapa).push(nombre);
      } else {
        mapa.push(nombre);
      }
    }
  }
  return { mapa, lista };
}

const { mapa, lista } = clasificarLectores();
const ARRAY = ['forEach', 'filter', 'map', 'some', 'every', 'sort', 'slice', 'reduce', 'find', 'indexOf'];
const OBJETO = ['keys', 'values', 'entries'];

let ok = 0, mal = 0, mirados = 0;
function af(nombre, cond, det) {
  if (cond) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (det ? '\n       ' + det : '')); }
}

console.log('== probar-forma-registros ==');
console.log('');
console.log('0 · los lectores, clasificados leyendo Config.gs');
af('se encontraron lectores de MAPA', mapa.length >= 5, 'encontrados: ' + mapa.join(', '));
af('se encontró el lector de LISTA (leerCampanas)', lista.indexOf('leerCampanas') !== -1,
  'si dejó de ser lista, esta prueba tiene que enterarse en vez de dar verde');
console.log('     mapa : ' + mapa.join(', '));
console.log('     lista: ' + (lista.join(', ') || '(ninguno)'));

const archivos = fs.readdirSync(RAIZ).filter((f) => f.endsWith('.gs'));
const malUsos = [];
archivos.forEach((f) => {
  const texto = fs.readFileSync(path.join(RAIZ, f), 'utf8');
  texto.split('\n').forEach((linea, i) => {
    if (/^\s*(\*|\/\/)/.test(linea)) return; // comentarios: ahí se DESCRIBE el bug a propósito
    mirados++;
    mapa.forEach((L) => {
      ARRAY.forEach((m) => {
        if (linea.indexOf(L + '().' + m) !== -1) {
          malUsos.push(f + ':' + (i + 1) + '  ' + L + '().' + m + '  → devuelve MAPA, no array');
        }
      });
    });
    lista.forEach((L) => {
      OBJETO.forEach((m) => {
        if (linea.indexOf('Object.' + m + '(' + L + '())') !== -1) {
          malUsos.push(f + ':' + (i + 1) + '  Object.' + m + '(' + L + '())  → devuelve LISTA, no mapa');
        }
      });
    });
  });
});

console.log('');
console.log('1 · ningún consumidor usa la forma equivocada');
af('cero usos con la forma equivocada', malUsos.length === 0, malUsos.join('\n       '));

console.log('');
console.log('2 · control negativo — que esto sepa ponerse rojo');
{
  const falso = 'leerSolapas().forEach(function (s) {});';
  let detecta = false;
  mapa.forEach((L) => {
    ARRAY.forEach((m) => { if (falso.indexOf(L + '().' + m) !== -1) detecta = true; });
  });
  af('detecta el uso que rompió diagTopeDeVentana() el 22/08', detecta,
    'el lint no reconoce su propio caso fundacional: no prueba nada');
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · ' +
  archivos.length + ' archivos .gs, ' + mirados + ' líneas miradas');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
