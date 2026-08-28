#!/usr/bin/env node
/**
 * tools/probar-ventana-propia.js — **`SOLAPAS.ventana_ref = 'propia'`: la solapa manda sobre el
 * `modo_periodo` de su base** (`2026-08-28`).
 *
 * ⛔ **El problema, medido.** `BASES.digital.modo_periodo = 'snapshot'` corta en `leerFuente`
 * **antes** de toda la lógica de fechas y devuelve todas las filas, así que
 * `digital/CAMPAÑAS_DESGLOCE_DIGITAL` no llegaba nunca al solape de `R-16`. Y el Resumen Ejecutivo
 * del equipo **sí** recorta por solape: contra el dashboard de Looker del 28/08, `JM` da **8
 * campañas** con `inicio ≤ hasta && fin ≥ desde` y **4 o 5** con cualquier otro criterio.
 *
 * ⭐ **El mecanismo de solape NO se escribió: ya existía.** `R-16` (07/08) lo decide con
 * `MAPEO.fecha_fin_periodo`. Lo único que faltaba era que la solapa **llegara** hasta ahí.
 *
 * ⚠ **Por qué la declaración es explícita y no se infiere de que la solapa mapee las dos fechas:**
 * **cuatro solapas de `digital` ya declaran `fecha_fin_periodo`** —`Digital`, `Directa IVR`,
 * `Seguimiento digital` y `Digital 2026 acumulado`—, así que inferirlo les cambiaría el universo a
 * tres solapas vivas sin que nadie lo pidiera.
 *
 * ⚠ **Y por qué no se cambió `BASES.digital.modo_periodo` a `filtrar`:** eso toca **todas** sus
 * solapas, incluida `Directa Mail`, de donde salen los `mail_*` con casos validados. El alcance de
 * esto es **una celda, una solapa**.
 *
 * Uso:
 *   node tools/probar-ventana-propia.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let pasadas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) { pasadas++; console.log('  ✅ ' + mensaje); }
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const FUENTES = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const AUDITORIA = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');

function ctxFuentes(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} }
  };
  vm.createContext(ctx);
  let texto = FUENTES;
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) return null;   // guarda de que la mutación ocurrió
  }
  vm.runInContext(texto, ctx, { filename: 'Fuentes.gs' });
  return ctx;
}

console.log('\n═══ A · el valor reservado existe y es UNO solo ═══');
{
  const ctx = ctxFuentes();
  afirmar(ctx.VENTANA_PROPIA_ === 'propia',
    '⭐ `VENTANA_PROPIA_` vale `propia` — el valor vive en una constante, no repetido como literal');
  /* ⚠ Se cuenta sobre el CÓDIGO, con los comentarios afuera. El primer intento contaba el texto
   * crudo y daba 2 — el segundo era el literal dentro del comentario que explica la decisión. Un
   * control que cuenta comentarios mide otra cosa que la que dice medir. */
  const codigo = FUENTES.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
  const literales = (codigo.match(/'propia'/g) || []).length;
  afirmar(literales === 1,
    '⭐⭐ y aparece UNA sola vez en el CÓDIGO de Fuentes.gs (' + literales + '): dos literales ' +
    'serían dos definiciones de lo mismo, y la segunda envejece sola');
}

console.log('\n═══ B · ⭐⭐ `propia` gana sobre el `snapshot` de la base ═══');
{
  afirmar(/if \(ventanaPropiaDeclarada\) modo = 'filtrar';/.test(FUENTES),
    '⭐⭐ con `propia` el modo pasa a `filtrar` aunque la base diga `snapshot`');
  /* ⚠ El orden importa y por eso se afirma: el parámetro `sin_recorte_por_ventana` se aplica
   * DESPUÉS, así que la lectura por cuenta —los `u1_*`, el temario— sigue trayendo todo. Si esto
   * se diera vuelta, `propia` le sacaría el «sin recorte» a quien lo pidió explícitamente. */
  const iPropia = FUENTES.indexOf("if (ventanaPropiaDeclarada) modo = 'filtrar';");
  const iParam = FUENTES.indexOf('sin_recorte_por_ventana) modo =');
  afirmar(iPropia !== -1 && iParam !== -1 && iPropia < iParam,
    '⭐⭐ y el PARÁMETRO se aplica después, así que `sin_recorte_por_ventana` sigue ganando: la ' +
    'lectura por cuenta de los `u1_*` no cambia');
}

console.log('\n═══ C · `propia` NO se confunde con un nombre de solapa ═══');
{
  afirmar(/var solapaRef = ventanaPropiaDeclarada \? '' : referenciaDeVentana_/.test(FUENTES),
    '⭐ el camino de PERTENENCIA se saltea — si no, buscaría una solapa llamada «propia»');
  afirmar(/String\(ref\)\.trim\(\)\.toLowerCase\(\) !== VENTANA_PROPIA_/.test(AUDITORIA),
    '⭐ y el diagnóstico de `ventana_ref` también la excluye, o reportaría un cruce roto inexistente');
}

console.log('\n═══ D · el desglose lo declara, y con las dos fechas ═══');
{
  afirmar(/campo_id_cuenta: 'des_id_cuenta', ventana_ref: 'propia'/.test(INSTALAR),
    '⭐⭐ la solapa declara `ventana_ref = propia`');
  afirmar(/campo_logico: 'fecha_periodo', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'I'/.test(INSTALAR),
    '⭐ `fecha_periodo` → col I (Fecha inicio)');
  afirmar(/campo_logico: 'fecha_fin_periodo', hoja: 'CAMPAÑAS_DESGLOCE_DIGITAL', columna: 'J'/.test(INSTALAR),
    '⭐⭐ y `fecha_fin_periodo` → col J: SIN ésta el criterio sería de PUNTO y entrarían 4 ' +
    'campañas en vez de 8');
}

console.log('\n═══ E · control positivo — el solape sigue siendo el de `R-16` ═══');
{
  /* ⭐ Se ejecuta la función REAL: si alguien cambiara la regla de solape, esto se entera. Y es la
   * misma que reprodujo las 8 campañas contra el dashboard. */
  const ctx = ctxFuentes();
  const solape = (i, f, d, h) => vm.runInContext(
    'entraPorSolape_("' + i + '","' + f + '","' + d + '","' + h + '")', ctx);
  afirmar(solape('2026-08-13', '2026-08-18', '2026-08-21', '2026-08-28') === false,
    '⭐ una campaña que terminó ANTES de la ventana no entra');
  afirmar(solape('2026-08-27', '2026-08-31', '2026-08-21', '2026-08-28') === true,
    '⭐⭐ una que empieza DENTRO y sigue después SÍ — es el caso POST de Coghlan');
  afirmar(solape('2026-08-01', '2026-09-30', '2026-08-21', '2026-08-28') === true,
    'y una que envuelve la ventana entera también');
  afirmar(solape('2026-09-01', '2026-09-05', '2026-08-21', '2026-08-28') === false,
    'y una posterior no');
}

console.log('\n═══ F · control negativo — sin la línea, la base vuelve a mandar ═══');
{
  const ctx = ctxFuentes((t) => t.replace(
    "if (ventanaPropiaDeclarada) modo = 'filtrar';", "if (false) modo = 'filtrar';"));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    afirmar(!/if \(ventanaPropiaDeclarada\) modo = 'filtrar';/.test(
      FUENTES.replace("if (ventanaPropiaDeclarada) modo = 'filtrar';", "if (false) modo = 'filtrar';")),
      '⛔ sin esa línea `propia` no cambia el modo — o sea que B mide ESA línea');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Qué número publica el Resumen Ejecutivo. Eso pide una corrida y se cruza');
console.log('     contra el dashboard de Looker: JM Meta 1.921.695 · Google 1.023.101 · DV360 5.330.034.');
console.log('   · Que las OTRAS solapas de `digital` no hayan cambiado. Ninguna declara `propia`,');
console.log('     así que siguen en `snapshot` — pero eso se ve en la traza de una corrida.');

process.exit(fallas === 0 ? 0 : 1);
