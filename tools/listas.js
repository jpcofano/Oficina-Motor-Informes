#!/usr/bin/env node
/**
 * tools/listas.js — comprueba que las tres listas de hojas de registro coincidan.
 *
 * **Por qué existe, y por qué NO unifica las listas.** Hay tres declaraciones de las mismas
 * hojas: `ALCANCE_REGISTROS_` en `Instalar.gs` (la del motor), `HOJAS_REGISTRO` en
 * `tools/escritores.js` y `HOJAS` en `tools/snapshot.js`. **La duplicación es deliberada y
 * correcta**: las dos herramientas de `tools/` son el contra-qué del motor, y si leyeran la
 * lista del código que auditan dejarían de ser independientes — está escrito en el encabezado
 * de las dos.
 *
 * **El problema nunca fue la duplicación: era que el desajuste no fallaba.** Medido el
 * 10/08/2026: `LAMINAS` nació con el `_11` el 09/08, `ALCANCE_REGISTROS_` la incluyó, las otras
 * dos no, y **nada lo señaló**. El censo de escritores la mandó al anexo de «no es de registro»
 * y `docs/_snapshots/` nunca produjo su TSV, así que la hoja estuvo un día **sin respaldo
 * declarado y fuera de la matriz**. Un valor hardcodeado no es deuda por estar escrito a mano:
 * es deuda cuando **nadie se entera de que quedó viejo**.
 *
 * Así que esto no toca las listas: las lee **por texto**, sin `require` ni ejecutar nada, y
 * falla con exit 1 si difieren. Cada archivo sigue siendo dueño de su copia.
 *
 * Uso:
 *   node tools/listas.js          -> compara y reporta
 *   node tools/listas.js --lista  -> imprime las tres, sin comparar
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/**
 * Cada fuente dice de dónde sacar su lista. El `patron` captura el bloque literal del array;
 * el nombre de la constante va adentro para que un renombre rompa acá y no en silencio.
 */
const FUENTES = [
  {
    nombre: 'ALCANCE_REGISTROS_',
    archivo: 'Instalar.gs',
    // Las entradas son objetos `{ hoja: 'X', ... }`, no strings sueltos.
    extraer: (txt) => {
      const bloque = txt.match(/var ALCANCE_REGISTROS_\s*=\s*\[([\s\S]*?)\n\];/);
      if (!bloque) return null;
      return [...bloque[1].matchAll(/hoja:\s*'([^']+)'/g)].map((m) => m[1]);
    }
  },
  {
    nombre: 'HOJAS_REGISTRO',
    archivo: 'tools/escritores.js',
    extraer: (txt) => {
      const bloque = txt.match(/const HOJAS_REGISTRO\s*=\s*\[([\s\S]*?)\];/);
      if (!bloque) return null;
      return [...bloque[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    }
  },
  {
    nombre: 'HOJAS',
    archivo: 'tools/snapshot.js',
    extraer: (txt) => {
      const bloque = txt.match(/const HOJAS\s*=\s*\[([\s\S]*?)\];/);
      if (!bloque) return null;
      return [...bloque[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    }
  }
];

const leidas = FUENTES.map((f) => {
  const ruta = path.join(RAIZ, f.archivo);
  if (!fs.existsSync(ruta)) return { ...f, error: 'no existe el archivo' };
  const lista = f.extraer(fs.readFileSync(ruta, 'utf8'));
  if (!lista || !lista.length) return { ...f, error: 'no encontré la constante — ¿la renombraron?' };
  return { ...f, lista };
});

const rotas = leidas.filter((f) => f.error);
if (rotas.length) {
  rotas.forEach((f) => console.error('✗ ' + f.nombre + ' (' + f.archivo + '): ' + f.error));
  process.exit(1);
}

if (process.argv.includes('--lista')) {
  leidas.forEach((f) => console.log(f.nombre.padEnd(20) + f.lista.length + '  ' + f.lista.join(', ')));
  process.exit(0);
}

// La unión de las tres es el universo; para cada hoja se dice quién la tiene y quién no.
const todas = [...new Set(leidas.flatMap((f) => f.lista))].sort();
const faltantes = todas.filter((h) => leidas.some((f) => f.lista.indexOf(h) === -1));

console.log('Hojas de registro declaradas en las tres listas\n');
console.log('hoja'.padEnd(24) + leidas.map((f) => f.nombre.slice(0, 18).padEnd(20)).join(''));
todas.forEach((h) => {
  console.log(h.padEnd(24) + leidas.map((f) => (f.lista.indexOf(h) !== -1 ? 'sí' : '— FALTA').padEnd(20)).join(''));
});
console.log('\n' + leidas.map((f) => f.nombre + '=' + f.lista.length).join('  ·  '));

if (!faltantes.length) {
  console.log('\nOK — las tres listas coinciden en ' + todas.length + ' hoja(s).');
  process.exit(0);
}

console.error('\n✗ DIVERGEN en ' + faltantes.length + ' hoja(s): ' + faltantes.join(', '));
console.error('  Las tres se mantienen a mano y a propósito (independencia), así que hay que');
console.error('  agregarla en las que falten. Ver el encabezado de este archivo.');
process.exit(1);
