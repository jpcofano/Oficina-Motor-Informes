#!/usr/bin/env node
/**
 * tools/probar-ctx-plantilla.js — **`ctx.plantilla` llega a TODA operación `esPlantilla`, y no
 * sólo a las de la familia `FILA`.** Parte A del `2026-09-05_1`, ítem 34 de la cola.
 *
 * ⛔⛔ **El defecto que cierra:** la asignación de `ctx.plantilla` vivía **anidada** dentro del `if`
 * de `['FILA', 'FILA_TEXTO', 'GRUPO_TEXTO']`. `LISTA_TEXTO` **sí** es `esPlantilla` y **no** está en
 * esa lista ⇒ `opLISTA_TEXTO` recibía el `ctx` sin plantilla, devolvía
 * `«FALTA:@plantilla_sin_resolver»`, el marcador caía en `sin_datos` y **`emin_lista` publicaba `-`**.
 *
 * ⭐⭐ **Por qué este banco NO llama a `opLISTA_TEXTO` con un `ctx` armado a mano.** El defecto no
 * está en la operación: está en **quién arma el `ctx`**. Un banco que construyera el contexto
 * pasaría con el código roto — **medir la función no es medir el camino**. Así que se **extrae el
 * tramo real de `resolverMarcadores` y se evalúa verbatim**, con stubs sólo en sus dependencias:
 * si alguien vuelve a anidar la asignación, el tramo cambia y estas afirmaciones caen.
 * Mismo criterio que `tools/seed-mapeo.js`, que recorta el post-proceso de `Instalar.gs`.
 *
 * ⚠ **Lo que este banco NO dice:** qué publica `emin_lista` contra la base viva. Eso es una corrida.
 *
 * Uso:  node tools/probar-ctx-plantilla.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

const GEN = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

/* ── El tramo REAL, recortado por sus dos extremos y no reescrito ──────────────────────────────
 * ⚠ Arranca en la asignación incondicional de `ctx.separador` —la del 26/08, que ya salió de su
 * `if` por esta misma grieta— y termina cerrando el bloque de `esPlantilla`. */
const A = GEN.indexOf('    ctx.separador = fila.separador;');
const P = GEN.indexOf('ctx.plantilla = resolverPlantillaTexto_', A);
if (A === -1 || P === -1) { console.log('⛔ no encontré el tramo'); process.exit(1); }
const TRAMO = GEN.slice(A, GEN.indexOf('\n    }', P) + 7);

/* ⭐ Control de que el recorte agarró lo que dice agarrar, antes de afirmar nada sobre él. */
console.log('═══ 0 · ⭐ el recorte contiene las DOS guardas ═══');
afirmar(TRAMO.indexOf("['FILA', 'FILA_TEXTO', 'GRUPO_TEXTO']") !== -1,
  'el tramo incluye el `if` de la familia FILA');
afirmar(TRAMO.indexOf('if (esPlantilla) {') !== -1,
  'el tramo incluye la guarda `esPlantilla`');
afirmar(/\n    \}\s*\n[\s\S]*if \(esPlantilla\) \{/.test(TRAMO),
  '⭐⭐ y `esPlantilla` está DESPUÉS del cierre del `if` de FILA — no anidada adentro');

/* ── El evaluador: el tramo verbatim dentro de una cáscara, con sus dependencias en stub ────── */
function correrTramo(fuente, nombreOp, esPlantilla, separador) {
  const c = {
    buscarMapeo: () => ({ ok: false, motivo: 'stub' }),
    claveDeFila_: () => null,
    claveDeLecturaEnColumna_: () => null,
    parsearFechaCelda_: () => null,
    resolverPlantillaTexto_: () => ({ campos: { barrio: { clave: 'Barrio' } }, marca: 'RESUELTA' }),
    resultado: null
  };
  vm.createContext(c);
  vm.runInContext(
    'function correr(nombreOp, esPlantilla, fila, ctx, solapa, datos) {\n' +
    fuente + '\n  return ctx;\n}\n' +
    'resultado = correr(' + JSON.stringify(nombreOp) + ', ' + esPlantilla + ', ' +
    JSON.stringify({ separador: separador, base_id: 'b', campo_logico: '{barrio}' }) + ', {}, ' +
    JSON.stringify({ solapa: 's' }) + ', ' + JSON.stringify({ filas: [{ Barrio: 'Flores' }] }) + ');',
    c);
  return c.resultado;
}

console.log('\n═══ A · ⭐⭐ `LISTA_TEXTO` AHORA recibe `ctx.plantilla` ═══');
{
  const ctx = correrTramo(TRAMO, 'LISTA_TEXTO', true, '');
  afirmar(!!ctx.plantilla, '`LISTA_TEXTO` + `esPlantilla` ⇒ `ctx.plantilla` asignado');
  afirmar(ctx.plantilla && ctx.plantilla.marca === 'RESUELTA',
    '   y es lo que devolvió `resolverPlantillaTexto_`, no un objeto vacío');
  afirmar(ctx.separador === '', '⭐ y `ctx.separador` le llega igual — ya era incondicional (26/08)');
  afirmar(ctx.ordenPor === undefined,
    '⭐⭐ y NO se le arma `ordenPor`: su `separador` es la cadena que une, no un nombre de campo');
}

console.log('\n═══ B · ⚠ las tres de la familia `FILA` no cambiaron ═══');
{
  const ft = correrTramo(TRAMO, 'FILA_TEXTO', true, '');
  afirmar(!!ft.plantilla, '`FILA_TEXTO` sigue recibiendo `ctx.plantilla`');
  const gt = correrTramo(TRAMO, 'GRUPO_TEXTO', true, '');
  afirmar(!!gt.plantilla, '`GRUPO_TEXTO` sigue recibiendo `ctx.plantilla`');
  const f = correrTramo(TRAMO, 'FILA', false, 'fecha_periodo');
  afirmar(f.plantilla === undefined,
    '⭐ `FILA` NO recibe plantilla —no es `esPlantilla`— y eso no cambió');
  afirmar(f.separador === 'fecha_periodo', '   y sí recibe su `separador`');
}

console.log('\n═══ C · ⚠ una operación que no es ninguna de las dos cosas ═══');
{
  /* ⛔ El cambio no puede haberle dado plantilla a quien no la pide: sería darle `ctx` de más a
   * las 11 operaciones restantes. */
  const s = correrTramo(TRAMO, 'SUMA', false, '');
  afirmar(s.plantilla === undefined, '`SUMA` no recibe `ctx.plantilla`');
  afirmar(s.ordenPor === undefined, '`SUMA` no recibe `ordenPor`');
  afirmar(s.separador === '', '⭐ y sí `separador`, que es incondicional para todas');
}

console.log('\n═══ D · ⭐⭐ control NEGATIVO — el banco FALLA con el código de antes ═══');
{
  /* ⭐ Se reconstruye la semántica VIEJA —la guarda anidada dentro de la lista de nombres— con una
   * mutación de una línea, y se verifica que la mutación OCURRIÓ antes de creerle al resultado.
   * ⚠ Sin esto, un banco que no mirara nada daría verde igual (`CLAUDE.md` §4, la tercera forma). */
  const VIEJO = TRAMO.replace('if (esPlantilla) {',
    "if (esPlantilla && ['FILA', 'FILA_TEXTO', 'GRUPO_TEXTO'].indexOf(nombreOp) !== -1) {");
  afirmar(VIEJO !== TRAMO, '⭐⭐ la mutación OCURRIÓ — sin esto el negativo corre sobre el original');

  const roto = correrTramo(VIEJO, 'LISTA_TEXTO', true, '');
  afirmar(roto.plantilla === undefined,
    '⛔⛔ con la guarda anidada, `LISTA_TEXTO` queda SIN `ctx.plantilla` ⇒ la sección A caería');
  const ftRoto = correrTramo(VIEJO, 'FILA_TEXTO', true, '');
  afirmar(!!ftRoto.plantilla,
    '⚠ y `FILA_TEXTO` andaba igual — por eso el defecto vivió sin que ningún banco lo viera');
}

console.log('\n═══ E · ⛔ el camino (1) que NO se tomó, y por qué ═══');
{
  /* ⭐ Agregar `'LISTA_TEXTO'` a la lista habría andado HOY y sólo por una celda vacía: con un
   * `separador` cargado, ese valor se va a `buscarMapeo` como si fuera un nombre de campo. */
  const CAMINO1 = GEN.slice(A, GEN.indexOf('\n    }', GEN.indexOf('ordenPor', A)) + 7)
    .replace("['FILA', 'FILA_TEXTO', 'GRUPO_TEXTO']", "['FILA', 'FILA_TEXTO', 'GRUPO_TEXTO', 'LISTA_TEXTO']");
  let preguntado = null;
  const c = {
    buscarMapeo: (b, s, campo) => { preguntado = campo; return { ok: false }; },
    claveDeFila_: () => null, claveDeLecturaEnColumna_: () => null, parsearFechaCelda_: () => null,
    resolverPlantillaTexto_: () => ({}), resultado: null
  };
  vm.createContext(c);
  vm.runInContext(
    'function correr(nombreOp, fila, ctx, solapa, datos) {\n' + CAMINO1 + '\n  return ctx;\n}\n' +
    "resultado = correr('LISTA_TEXTO', " + JSON.stringify({ separador: ' — ', base_id: 'b' }) +
    ', {}, ' + JSON.stringify({ solapa: 's' }) + ', ' + JSON.stringify({ filas: [] }) + ');', c);
  afirmar(preguntado === '—',
    '⛔⛔ con el camino (1) y un `separador` cargado, `buscarMapeo` recibe ' +
    JSON.stringify(preguntado) + ' COMO NOMBRE DE CAMPO');
  afirmar(preguntado !== null,
    '⭐ y eso hoy no rompe sólo porque `emin_lista` declara `separador` vacío — una celda ' +
    'diseñada para llenarse');
}

console.log('');
console.log('⚠ Lo que este verde NO dice: qué publica `emin_lista` contra la base viva. El banco');
console.log('  prueba que el `ctx` se arma bien; el valor lo dice una corrida.');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
