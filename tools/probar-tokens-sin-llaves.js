#!/usr/bin/env node
/**
 * tools/probar-tokens-sin-llaves.js — **el detector de tokens impresos SIN llaves** (`A4`).
 *
 * ⛔⛔ **Por qué hace falta un detector distinto:** todo lo que busca tokens en este repo usa
 * `RE_TOKEN_ = /\{\{([a-zA-Z0-9_]+)\}\}/g`, o sea que **exige las llaves**. Un nombre escrito sin
 * ellas es texto plano: **no lo lista el censo, no lo resuelve el motor, no entra a `FALTANTES` y
 * un grep de `{{…}}` tampoco lo ve.** Queda impreso en el deck como si fuera contenido.
 *
 * ⭐ **Lo que este banco fija es el CRITERIO del regex**, no que la función escriba: el detector
 * vale exactamente lo que valga su definición de «parece un token».
 *
 * ⚠ **Y el control que más importa es el de los FALSOS POSITIVOS.** Un detector que marca de más
 * es peor que ninguno: ya pasó el 30/08 —un detector escrito para nombrar un marcador devolvió 42,
 * casi todos falsos— y publicarlos habría costado más que el bug que se buscaba.
 *
 * Uso:
 *   node tools/probar-tokens-sin-llaves.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

/** El regex REAL, extraído de `Auditoria.gs` — no una copia. */
function regexReal() {
  const src = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');
  const m = src.match(/var RE_CANDIDATO_SIN_LLAVES_ = (\/.*\/[gimsuy]*);/);
  if (!m) throw new Error('no encontré `RE_CANDIDATO_SIN_LLAVES_` en Auditoria.gs');
  return m[1];
}

const fuente = regexReal();
console.log('  regex bajo prueba: ' + fuente);

function halla(texto) {
  const re = eval(fuente);            // eslint-disable-line no-eval
  const out = [];
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(texto)) !== null) out.push(m[2]);
  return out;
}

console.log('\n═══ A · ⭐ encuentra el caso real: `camp_env4_fecha` sin llaves ═══');
{
  afirmar(halla('Fecha camp_env4_fecha del envío').indexOf('camp_env4_fecha') !== -1,
    '⭐⭐ lo encuentra suelto en una frase — es el caso medido de `L-022`');
  afirmar(halla('camp_env4_fecha').indexOf('camp_env4_fecha') !== -1, 'y solo en la celda');
  afirmar(halla('|camp_env4_fecha|').indexOf('camp_env4_fecha') !== -1, 'y entre separadores');
}

console.log('\n═══ B · ⛔ NO marca un token bien escrito — el falso positivo que lo arruinaría ═══');
{
  /* Si marcara los `{{…}}`, el log saldría con cientos de líneas y el detector sería inútil. */
  afirmar(halla('{{camp_env4_fecha}}').length === 0,
    '⭐⭐ `{{token}}` NO se marca — si no, el censo entero sería ruido');
  afirmar(halla('Total: {{camp_clics}} clics').length === 0, 'ni dentro de una frase');
  afirmar(halla('{{a_b}} y {{c_d}}').length === 0, 'ni varios seguidos');
}

console.log('\n═══ C · el `_` es lo que separa la señal del ruido ═══');
{
  afirmar(halla('el informe semanal de campañas').length === 0,
    '⭐ palabras normales en minúscula NO son candidatas — sin `_` no hay señal');
  afirmar(halla('Buenos Aires Ciudad').length === 0, 'ni texto con mayúsculas');
  afirmar(halla('2026-08-31 · 45,3 %').length === 0, 'ni fechas ni números');
  afirmar(halla('mail_entregados').length === 1, 'y uno con `_` sí lo es');
}

console.log('\n═══ D · los bordes, que es donde un regex se rompe ═══');
{
  afirmar(halla('{camp_titulo}').indexOf('camp_titulo') === -1,
    '⭐ con UNA sola llave tampoco se marca — es el caso «a medio borrar», y lo dejamos fuera');
  afirmar(halla('ver camp_titulo.').indexOf('camp_titulo') !== -1, 'un punto detrás no lo tapa');
  afirmar(halla('(camp_titulo)').indexOf('camp_titulo') !== -1, 'ni un paréntesis');
  afirmar(halla('u1_post_meta_vtr').length === 1, 'nombres con varios `_` se toman enteros');
}

console.log('\n═══ E · control NEGATIVO — el detector PUEDE no encontrar ═══');
{
  /* ⛔ Sin esto, «cero hallazgos» y «el regex no matchea nada» se ven igual. */
  afirmar(halla('').length === 0, 'texto vacío da cero');
  afirmar(halla('Encuentros con vecinos').length === 0, 'y un título real también');
}

console.log('\n═══ F · ⚠ el LÍMITE declarado: se cruza contra el registro ═══');
{
  /* La función sólo reporta un candidato si existe como marcador o como token de la otra
   * plantilla. Eso evita el ruido —y significa que un token INVENTADO y sin llaves no se ve—.
   * El banco lo afirma para que el límite esté escrito y no se descubra al usarlo. */
  const src = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');
  const i = src.indexOf('function censarTokensSinLlaves(');
  const cuerpo = src.slice(i, i + 5000);
  afirmar(/if \(!conocidos\[nombre\]\) continue;/.test(cuerpo),
    '⭐ se cruza contra `conocidos` — cruzar, no filtrar por forma');
  afirmar(/no se reporta|TAMPOCO se ve/.test(cuerpo),
    '⭐⭐ y el límite está DICHO en el propio log: un token inventado sin llaves no se ve');
  afirmar(/ninguno/.test(cuerpo), 'y el cero se dice en vez de callarse');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
