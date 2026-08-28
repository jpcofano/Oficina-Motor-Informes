#!/usr/bin/env node
/**
 * tools/probar-solapas-del-temario-por-lamina.js — **una lámina gobernada por el temario arma sus
 * `claves_temario` desde las solapas de SUS marcadores** (`2026-08-27` Parte 2b).
 *
 * ⛔⛔ **Es la pieza sin la cual las Partes 1 y 2 no mueven ningún número.** El universo del temario
 * se activa por `opciones.claves_temario[base|solapa]`, y esa lista salía de
 * `CONFIG.solapas_agregado_post` — **escrita para la sección post y atada a ella**. Con el token ya
 * desdoblado, las dos mitades de `mail_entregados` seguían resolviendo igual porque
 * `digital|Directa Mail` no estaba en la lista: `L-034` publicaba **872.669** al lado de
 * «ENCUENTROS: 1».
 *
 * ⭐ **Se autoconfigura en vez de agregar otra lista a mantener:** las solapas salen de los
 * marcadores que la lámina realmente lleva, y entra la que declara `SOLAPAS.campo_id_cuenta`, que
 * es la única vía para encontrar la fila de un encuentro fuera de `rdv` (`D-30`). Una lista escrita
 * a mano se desincronizaría con la plantilla en el primer cableado.
 *
 * ⚠ **Lo que NO contesta:** qué número sale. Eso depende de qué filas trae el temario para cada
 * solapa y se ve en una corrida. Acá se mide **qué solapas quedan gobernadas y cuáles no**.
 *
 * Uso:
 *   node tools/probar-solapas-del-temario-por-lamina.js
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

/* Los marcadores, copiados de `MARCADORES` del 26/08 más la declaración de `Directa IVR` del
 * 27/08. `ecv_inscriptos` es de `rdv` y `contenidos_total` es de otra lámina: los dos son
 * discriminadores — si el filtro no funcionara, entrarían. */
const MARCADORES = [
  { marcador: 'mail_entregados', informe_id: 'jm', base_id: 'digital', solapa: 'Directa Mail' },
  { marcador: 'mail_aperturas', informe_id: 'jm', base_id: 'digital', solapa: 'Directa Mail' },
  { marcador: 'imp_total', informe_id: 'jm', base_id: 'looker', solapa: 'DIGITAL' },
  { marcador: 'ivr_atendidos', informe_id: 'jm', base_id: 'digital', solapa: 'Directa IVR' },
  { marcador: 'ecv_inscriptos', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES' },
  { marcador: 'alcance', informe_id: 'jm', base_id: 'digital', solapa: 'Alcance' },
  { marcador: 'contenidos_total', informe_id: 'jm', base_id: 'digital', solapa: 'Seguimiento digital' },
  { marcador: 'mail_entregados', informe_id: 'secco', base_id: 'digital', solapa: 'OTRA DE SECCO' }
];

/* `SOLAPAS.campo_id_cuenta` vivo al 27/08. `Alcance` lo declara y `Seguimiento digital` no. */
const CAMPO_ID = {
  'digital|Directa Mail': 'mail_id_cuenta',
  'digital|Directa IVR': 'ivr_id_cuenta',
  'looker|DIGITAL': 'ldig_id_cuenta',
  'digital|Alcance': 'alc_id_cuenta'
};

const TOKENS_L034 = ['mail_entregados', 'mail_aperturas', 'imp_total', 'ivr_atendidos',
  'ecv_inscriptos', 'alcance'];

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) return null;   // guarda de que la mutación ocurrió
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });

  ctx.leerMarcadores_ = () => MARCADORES;
  ctx.campoIdCuentaDeSolapa_ = (b, s) => CAMPO_ID[b + '|' + s] || '';
  ctx.llamadas = [];
  ctx.filasDeSolapaDelTemario_ = (inf, ven, sec, base, sol, met, todas) => {
    ctx.llamadas.push({ seccion: sec, clave: base + '|' + sol, metricas: met, todas: todas });
    return { ok: true, filas: [], items: 2, sin_fila: 2, base_id: base, hoja: sol, seccion_id: sec };
  };
  return ctx;
}

const correr = (ctx, tokens) =>
  ctx.clavesTemarioDeLamina_('jm', { desde: new Date(2026, 7, 21) }, 'ecv_alcance_semanal',
    tokens || TOKENS_L034);

console.log('\n═══ A · ⭐⭐ las solapas de ESTA lámina que declaran campo_id_cuenta ═══');
{
  const ctx = contexto();
  const r = correr(ctx);
  const claves = Object.keys(r.claves).sort();
  afirmar(claves.indexOf('digital|Directa Mail') !== -1,
    '⭐⭐ `digital|Directa Mail` queda gobernada — es lo que saca los 872.669 de L-034');
  afirmar(claves.indexOf('looker|DIGITAL') !== -1, 'y `looker|DIGITAL`, que es `imp_total`');
  afirmar(claves.indexOf('digital|Directa IVR') !== -1,
    '⭐ y `digital|Directa IVR`, que entró recién el 27/08 al declarar `ivr_id_cuenta`');
  afirmar(claves.length === 4, 'cuatro en total (' + claves.join(', ') + ')');
}

console.log('\n═══ B · `rdv` se saltea — tiene su propia rama ═══');
{
  const ctx = contexto();
  const r = correr(ctx);
  afirmar(!r.claves['rdv|RVD JM-CM - ES'],
    '⭐ `rdv` no entra: se resuelve por (nombre, fecha) del anclaje y su solapa no declara cuenta');
  afirmar(r.omitidas.indexOf('rdv|RVD JM-CM - ES') === -1,
    'y tampoco se reporta como omitida — no es un hueco, es otra rama');
}

console.log('\n═══ C · lo que NO se pudo atar se DICE, no se calla ═══');
{
  const ctx = contexto();
  const r = correr(ctx, TOKENS_L034.concat(['contenidos_total']));
  afirmar(r.omitidas.indexOf('digital|Seguimiento digital') !== -1,
    '⭐⭐ una solapa sin `campo_id_cuenta` va a `omitidas` con nombre — callarla es X-41');
  afirmar(!r.claves['digital|Seguimiento digital'],
    'y no se gobierna: su marcador sigue publicando el universo de la ventana');
}

console.log('\n═══ D · sólo los tokens de la lámina, y sólo el informe ═══');
{
  const ctx = contexto();
  const r = correr(ctx, ['mail_entregados']);
  afirmar(Object.keys(r.claves).join(',') === 'digital|Directa Mail',
    '⭐ con un solo token entra una sola solapa (' + Object.keys(r.claves).join(',') + ')');
  afirmar(!r.claves['digital|OTRA DE SECCO'],
    'y el marcador homónimo de `secco` no entra — el filtro por informe vale');
}

console.log('\n═══ E · cómo se pide cada solapa ═══');
{
  const ctx = contexto();
  correr(ctx);
  afirmar(ctx.llamadas.length === 4, 'una llamada por solapa gobernada (' + ctx.llamadas.length + ')');
  afirmar(ctx.llamadas.every((l) => l.seccion === 'ecv_alcance_semanal'),
    'todas con la sección que gobierna ESTA lámina, no con la del post');
  /* ⭐⭐ `2026-08-28` — pide TODAS las filas de cada cuenta. Con `false` publicaba una sola de las
   * seis de Coghlan: 29.349 en vez de 66.855. Un agregado suma; una tabla toma una por encuentro. */
  afirmar(ctx.llamadas.every((l) => l.todas === true),
    '⭐⭐ y con `todasLasFilas = true`: es un AGREGADO, no una tabla de una fila por encuentro');
  afirmar(ctx.llamadas.every((l) => Array.isArray(l.metricas) && l.metricas.length === 0),
    '⭐ y con `camposMetrica` vacío: la regla de «métrica de resultado > 0» es de la sección post ' +
    'y aplicarla acá dejaría encuentros afuera por una razón que no es de esta lámina');
}

console.log('\n═══ F · control negativo — sin el filtro, entra una solapa que no puede recortar ═══');
{
  const ctx = contexto((t) => t.replace(
    "if (!campoIdCuentaDeSolapa_(baseId, solapa)) { out.omitidas.push(clave); return; }",
    "if (false) { out.omitidas.push(clave); return; }"));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    const r = correr(ctx, TOKENS_L034.concat(['contenidos_total']));
    afirmar(!!r.claves['digital|Seguimiento digital'],
      '⛔ sin el filtro entra `digital|Seguimiento digital` — o sea que A y C miden ESA línea');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · QUÉ número publica cada caja. Depende de qué filas trae el temario por solapa.');
console.log('   · Que `L-036` conserve su orden: la lista de CONFIG gana sobre lo autoconfigurado');
console.log('     en el merge, y eso vive en `generarInforme`, no acá.');
console.log('   · ⛔ Que las solapas omitidas SEAN aceptables. El log las nombra; la decisión');
console.log('     de declarar la celda o aceptar el universo ancho es del usuario.');

process.exit(fallas === 0 ? 0 : 1);
