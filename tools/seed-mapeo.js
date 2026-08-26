/**
 * `tools/seed-mapeo.js` — **el seed de `MAPEO` tal como queda DESPUÉS del post-proceso de
 * `Instalar.gs`**, que es lo único que llega a la hoja.
 *
 * ⛔⛔ **Por qué existe, medido el 26/08/2026.** `Instalar.gs` declara las filas de `MAPEO` en cinco
 * listas y después corre **cuatro sentencias en el top level** que las modifican: los concats,
 * `fila.solapa = fila.hoja`, el default de `valores_incluidos`, `tipo_esperado` desde
 * `TIPO_ESPERADO_POR_CAMPO_` y `encabezado` desde `ENCABEZADO_POR_MAPEO_`. **Un banco que extrae
 * una lista y afirma sobre ella mide el artefacto de ANTES; el motor siembra el de DESPUÉS.**
 *
 * `tools/probar-mapeo-cc.js` afirmaba en verde *«todas traen `encabezado`»* sobre
 * `SEED_MAPEO_CC_` — cierto sobre la lista y **falso sobre la hoja**: las cuatro celdas estaban
 * vacías, porque el `forEach` del encabezado las pisaba con `|| ''`. Es la figura que `CLAUDE.md`
 * §4 nombra: *¿sobre qué artefacto corre esta afirmación, y es el mismo del que se va a hablar
 * después?*
 *
 * ⭐ **No reimplementa el post-proceso: EJECUTA el de `Instalar.gs`.** Se recorta el bloque que va
 * desde `var SEED_MAPEO_ = [` hasta el cierre del `forEach` del encabezado —verificado: ahí adentro
 * sólo hay `var`, sentencias sobre `SEED_MAPEO_` y comentarios— y se evalúa **verbatim**. El día
 * que alguien agregue una quinta transformación, esto se entera solo. Copiar las cuatro líneas acá
 * sería el error que `CLAUDE.md` §4 nombra: *el instrumento que reproduce lógica del motor y la
 * reproduce peor* — y además dejaría **dos lugares** que tienen que decir lo mismo.
 *
 * ⚠ **Lo que NO contesta:** qué tiene la hoja hoy. Eso es `verificarEncabezadosDeMapeo()` contra la
 * planilla viva. Esto contesta qué va a sembrar el seed.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/** Las cinco listas, en el orden en que `Instalar.gs` las concatena. */
const LISTAS = ['SEED_MAPEO_', 'SEED_MAPEO_REUNIONES_', 'SEED_MAPEO_DESGLOCE_',
  'SEED_MAPEO_DESGLOCE_REVISAR_', 'SEED_MAPEO_CC_'];

function fuente() {
  return fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
}

/** Recorta `var NOMBRE = <abre> … <cierra>` contando delimitadores. Falla fuerte si no está. */
function recortarVar(texto, nombre, abre, cierra) {
  const i = texto.indexOf('var ' + nombre + ' = ' + abre);
  if (i === -1) {
    throw new Error('No encontré `var ' + nombre + ' = ' + abre + '` en Instalar.gs — si se ' +
      'renombró, esto tiene que enterarse en vez de dar verde sobre otra cosa.');
  }
  const j = texto.indexOf(abre, i);
  let nivel = 0;
  for (let k = j; k < texto.length; k++) {
    if (texto[k] === abre) nivel++;
    else if (texto[k] === cierra) { nivel--; if (nivel === 0) return texto.slice(j, k + 1); }
  }
  throw new Error(nombre + ' sin cerrar en Instalar.gs.');
}

/**
 * El bloque de `Instalar.gs` que hay que ejecutar para tener el seed efectivo: desde la primera
 * lista hasta el cierre del `forEach` que escribe `encabezado`, que es el último del grupo.
 */
function bloqueDelSeed(texto) {
  const inicio = texto.indexOf('var SEED_MAPEO_ = [');
  if (inicio === -1) throw new Error('No encontré `var SEED_MAPEO_ = [` en Instalar.gs.');
  const marca = texto.indexOf('SEED_MAPEO_.forEach', texto.indexOf('var ENCABEZADO_POR_MAPEO_ = {'));
  if (marca === -1) {
    throw new Error('No encontré el `SEED_MAPEO_.forEach` posterior a `ENCABEZADO_POR_MAPEO_` — ' +
      'si el post-proceso del encabezado se movió, esto tiene que fallar, no adivinar.');
  }
  const abre = texto.indexOf('(', marca);
  let nivel = 0;
  for (let k = abre; k < texto.length; k++) {
    if (texto[k] === '(') nivel++;
    else if (texto[k] === ')') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, texto.indexOf(';', k) + 1);
    }
  }
  throw new Error('El `forEach` del encabezado quedó sin cerrar.');
}

const clave = (f) => f.base_id + '|' + f.solapa + '|' + f.campo_logico;

/**
 * Devuelve el seed de `MAPEO` en sus dos estados, para que un banco pueda afirmar sobre el que
 * corresponde y decir cuál usó:
 *   · `filas`     — el EFECTIVO, después de las cuatro sentencias reales. Es lo que se siembra.
 *   · `porClave`  — el mismo, indexado por `base|solapa|campo_logico`.
 *   · `inline`    — `{clave: encabezado}` de lo que cada lista declara AL LADO de la letra.
 *   · `mapa`      — `ENCABEZADO_POR_MAPEO_` crudo.
 *   · `tipos`     — `TIPO_ESPERADO_POR_CAMPO_` crudo.
 */
function leer(texto) {
  const src = texto || fuente();

  const filas = new Function(bloqueDelSeed(src) + '\nreturn SEED_MAPEO_;')();
  const mapa = new Function('return ' + recortarVar(src, 'ENCABEZADO_POR_MAPEO_', '{', '}'))();
  const tipos = new Function('return ' + recortarVar(src, 'TIPO_ESPERADO_POR_CAMPO_', '{', '}'))();

  /* Lo declarado inline se lee de las listas **antes** del post-proceso, con objetos frescos: es
   * la otra mitad de la comparación y no puede salir del mismo arreglo ya modificado. */
  const inline = {};
  LISTAS.forEach((nombre) => {
    new Function('return ' + recortarVar(src, nombre, '[', ']'))().forEach((f) => {
      f.solapa = f.hoja;
      if (f.encabezado) inline[clave(f)] = f.encabezado;
    });
  });

  const porClave = {};
  filas.forEach((f) => { porClave[clave(f)] = f; });

  return { filas: filas, porClave: porClave, inline: inline, mapa: mapa, tipos: tipos };
}

/** El testigo efectivo de una fila, por clave. Vacío significa «sin testigo declarado». */
function testigo(seed, baseId, solapa, campoLogico) {
  const f = seed.porClave[baseId + '|' + solapa + '|' + campoLogico];
  return f ? String(f.encabezado || '') : '';
}

module.exports = { LISTAS, RAIZ, fuente, leer, clave, testigo, recortarVar, bloqueDelSeed };
