#!/usr/bin/env node
/**
 * tools/probar-token-compartido-por-lamina.js — **un token cuyas láminas declaran universos
 * distintos se resuelve por lámina y se pinta sólo en la suya** (`2026-08-27` Parte 2).
 *
 * ⛔⛔ **El caso, medido en el deck del 27/08.** `mail_entregados` vive en `L-031` —Resumen
 * Ejecutivo, universo la semana entera de JM— y en `L-034` —agregado del temario—.
 * `agruparTokensPorLamina_` lo asignaba a **la primera** y `replaceAllText` lo pintaba en las dos,
 * así que `L-034` publicaba **872.669 mails entregados** al lado de «ENCUENTROS: 1». Y el encuentro
 * de esa semana **no tuvo mail**, así que lo correcto ahí no era otro número: era sin dato.
 *
 * ⭐ **Da vuelta la guarda de `D-41` a propósito, con su mismo argumento.** Aquélla evitaba
 * *«publicar dos valores distintos del mismo token en el mismo deck»* porque serían **dos
 * respuestas a la misma pregunta**. Acá son **dos preguntas distintas**, y son exactamente las dos
 * cajas que `C-80` describe leyéndose como si fueran una.
 *
 * ⚠ **Lo que NO contesta:** qué número publica `L-034` después del desdoble. Eso depende de qué
 * filas trae el temario para `digital/Directa Mail` y se ve en una corrida. Esto mide **dónde se
 * resuelve y dónde se pinta**, que es lo que este cambio hace.
 *
 * Uso:
 *   node tools/probar-token-compartido-por-lamina.js
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
  return ctx;
}

/* Las posiciones son las reales del deck `jm`: `L-031` es la 2, `L-034` la 5, `L-036` la 7.
 * `camp_titulo` en ocho láminas es el control de que NO todo se desdobla. */
const TOKENS = {
  mail_entregados: [2, 5],
  ecv_inscriptos: [5],
  camp_titulo: [15, 16, 17, 18],
  imp_total: [2, 5]
};
const UNIVERSO = { 2: 'ventana', 5: 'temario:ecv_alcance_semanal', 7: 'temario:comunicaciones_post',
  15: 'ventana', 16: 'ventana', 17: 'ventana', 18: 'ventana' };
const universoDeSlide = (n) => UNIVERSO[n] || 'ventana';

const porSlide = (grupos) => {
  const o = {};
  grupos.forEach((g) => { o[g.slide] = g; });
  return o;
};

console.log('\n═══ A · sin resolvedor de universo, el comportamiento de siempre ═══');
{
  const ctx = contexto();
  const g = porSlide(ctx.agruparTokensPorLamina_(TOKENS));
  afirmar(!!g[2] && g[2].tokens.indexOf('mail_entregados') !== -1,
    'cada token va a su PRIMERA lámina');
  afirmar(!g[5] || g[5].tokens.indexOf('mail_entregados') === -1,
    'y a ninguna otra — retrocompatible con quien la llama con un solo argumento');
  afirmar(!!g[2] && g[2].exclusivos.length === 0, 'sin exclusivos');
}

console.log('\n═══ B · control positivo — el mismo universo NO se desdobla ═══');
{
  const ctx = contexto();
  const g = porSlide(ctx.agruparTokensPorLamina_(TOKENS, universoDeSlide));
  afirmar(!!g[15] && g[15].tokens.indexOf('camp_titulo') !== -1,
    '⭐ `camp_titulo` está en 4 láminas de ventana y se asigna a UNA sola');
  afirmar(!g[16] || g[16].tokens.indexOf('camp_titulo') === -1,
    'y no se repite en las otras — el mismo hecho se resuelve una vez');
  afirmar(!!g[15] && g[15].exclusivos.indexOf('camp_titulo') === -1,
    'y no queda marcado exclusivo, así que se sigue pintando de una pasada');
}

console.log('\n═══ C · ⭐⭐ universos distintos: se resuelve en las DOS y se marca exclusivo ═══');
{
  const ctx = contexto();
  const g = porSlide(ctx.agruparTokensPorLamina_(TOKENS, universoDeSlide));
  afirmar(!!g[2] && g[2].tokens.indexOf('mail_entregados') !== -1, 'sigue en L-031 (slide 2)');
  afirmar(!!g[5] && g[5].tokens.indexOf('mail_entregados') !== -1,
    '⭐⭐ y AHORA también en L-034 (slide 5) — se resuelve con las opciones de cada lámina');
  afirmar(!!g[2] && g[2].exclusivos.indexOf('mail_entregados') !== -1 &&
          !!g[5] && g[5].exclusivos.indexOf('mail_entregados') !== -1,
    'marcado exclusivo en las dos: cada una lo pinta sólo en su slide');
  afirmar(!!g[5] && g[5].exclusivos.indexOf('imp_total') !== -1,
    'y lo mismo con `imp_total`, que comparte las mismas dos láminas');
  afirmar(!!g[5] && g[5].tokens.indexOf('ecv_inscriptos') !== -1 &&
          g[5].exclusivos.indexOf('ecv_inscriptos') === -1,
    '⭐ un token de UNA sola lámina no se marca exclusivo — no hay con qué confundirlo');
}

console.log('\n═══ D · el orden por lámina se conserva ═══');
{
  const ctx = contexto();
  const grupos = ctx.agruparTokensPorLamina_(TOKENS, universoDeSlide);
  const n = grupos.map((g) => g.slide);
  afirmar(JSON.stringify(n) === JSON.stringify(n.slice().sort((a, b) => a - b)),
    'ordenados de adelante hacia atrás (' + n.join(',') + ') — si la corrida corta, queda la COLA ' +
    'del deck sin pintar y no una lámina salteada del medio');
}

console.log('\n═══ E · `exclusivos` sobrevive al recorte de la lista de grupos ═══');
{
  /* ⭐ El caso concreto: `probar-reanudacion-identica.js` hace `.slice(0, -1)` sobre los grupos
   * para simular un corte. Una propiedad colgada del ARREGLO se perdería ahí y el token volvería
   * a pintarse en todo el deck **sin fallar**. En el grupo viaja con él. */
  const ctx = contexto();
  const cortada = ctx.agruparTokensPorLamina_(TOKENS, universoDeSlide).slice(0, -1);
  const g = porSlide(cortada);
  afirmar(!!g[5] && g[5].exclusivos.indexOf('mail_entregados') !== -1,
    '⭐⭐ tras `.slice()`, el grupo que sobrevive conserva su lista de exclusivos');
}

console.log('\n═══ F · «desconocido» no se mezcla con «ventana» ═══');
{
  const ctx = contexto();
  const g = porSlide(ctx.agruparTokensPorLamina_({ x: [2, 99] },
    (n) => (n === 99 ? 'desconocido' : 'ventana')));
  afirmar(!!g[2] && !!g[99] && g[99].exclusivos.indexOf('x') !== -1,
    '⭐ una lámina sin ancla desdobla en vez de heredar el valor de la vecina — el lado conservador');
}

console.log('\n═══ G · el pintado — exclusivo va al SLIDE, el resto a la presentación ═══');
{
  const ctx = contexto();
  const enPresentacion = [];
  const enSlide = [];
  ctx.pintarTokensFijosDeLamina_(['mail_entregados', 'camp_titulo'], {
    presentacion: { replaceAllText: (t, v) => enPresentacion.push(t) },
    slide: { replaceAllText: (t, v) => enSlide.push(t) },
    exclusivos: ['mail_entregados'],
    porMarcador: {
      mail_entregados: { estado: 'ok', valor_formateado: '17.472' },
      camp_titulo: { estado: 'ok', valor_formateado: 'Campaña' }
    },
    periodoLamina: '', conSimbolos: true, corridaId: 'x', informeId: 'jm',
    contadores: { sumarReemplazado: () => {} }, faltantes: [],
    laminasDeToken: () => ''
  });
  afirmar(enSlide.length === 1 && /mail_entregados/.test(enSlide[0]),
    '⭐⭐ el exclusivo se pinta en SU slide y en ningún otro');
  afirmar(enPresentacion.length === 1 && /camp_titulo/.test(enPresentacion[0]),
    '⭐ y el compartido sigue pintándose en toda la presentación, de una pasada');
}

console.log('\n═══ H · control negativo — sin la comparación de universos, no desdobla ═══');
{
  const ctx = contexto((t) => t.replace(
    'if (Object.keys(universos).length > 1) { destinos = slides; exclusivo = true; }',
    'if (false) { destinos = slides; exclusivo = true; }'));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    const g = porSlide(ctx.agruparTokensPorLamina_(TOKENS, universoDeSlide));
    afirmar(!g[5] || g[5].tokens.indexOf('mail_entregados') === -1,
      '⛔ sin la comparación, `mail_entregados` vuelve a estar sólo en L-031 — o sea que C mide ESA línea');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · QUÉ número publica L-034 después del desdoble. Depende de qué filas trae el');
console.log('     temario para `digital/Directa Mail`, y se ve en una corrida.');
console.log('   · ⛔ El costo: resolver dos veces un token cuesta dos resoluciones, y la etapa 4');
console.log('     es la que el presupuesto aprieta. La corrida lo mide, esto no.');
console.log('   · Que las láminas estén selladas. Sin ancla no hay universo, y el desdoble');
console.log('     conservador es lo único que evita heredar el valor de la vecina.');

process.exit(fallas === 0 ? 0 : 1);
