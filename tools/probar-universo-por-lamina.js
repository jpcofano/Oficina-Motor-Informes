#!/usr/bin/env node
/**
 * tools/probar-universo-por-lamina.js — **el universo del temario es DE LA LÁMINA, y se lee de
 * `LAMINAS.seccion_id`** (`2026-08-27` Parte 1).
 *
 * ⛔ **Lo que estaba mal:** la etapa 4 copiaba las claves del temario **a todas** las láminas por
 * igual, así que el universo era del INFORME. Funcionaba de casualidad —los `ecv_*` viven sólo en
 * `L-034` y los `post_*` sólo en `L-036`, así que nadie más las miraba— y **deja de funcionar en
 * cuanto un token vive en dos láminas con universos distintos**, que es `C-80`: `L-031` y `L-034`
 * comparten ocho tokens y cinco ya publican el universo de la otra.
 *
 * ⭐⭐ **Y el hallazgo que evitó una columna nueva:** la identidad de la lámina **ya está
 * declarada** desde `D-37` en `LAMINAS.seccion_id`, y `CONFIG` ya nombra las dos secciones de
 * agregado. `L-034` cuelga de `ecv_alcance_semanal`, `L-036` de `comunicaciones_post`, y
 * `L-031`/`L-032` de `resumen_ejecutivo` — cuyo universo es legítimamente toda la semana de JM
 * (`C-78`). **La pregunta ya tenía dueño en el registro; faltaba que alguien la leyera.**
 *
 * ⚠ **Esto NO es inferir identidad por contenido** —lo que `D-37` prohíbe y lo que costó la N² de
 * las copias—: se lee una declaración, no los tokens que la lámina lleva adentro.
 *
 * ⚠ **Lo que este control NO contesta:** que los cinco tokens compartidos dejen de publicar el
 * universo de `L-031` en `L-034`. Eso es la Parte 2 —resolver dos veces y pintar por slide— y sin
 * ella este recorte no mueve ningún número: `mail_entregados` se resuelve **una vez**, en la
 * primera lámina donde aparece.
 *
 * Uso:
 *   node tools/probar-universo-por-lamina.js
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

/* Las cuatro filas reales, copiadas de `docs/_snapshots/LAMINAS_2026-08-26.tsv`. ⭐ `L-031` y
 * `L-032` están a propósito: son el **control positivo del discriminador** — si el filtro por
 * sección no funcionara, saldrían las cuatro y la afirmación no distinguiría nada. */
const LAMINAS = [
  { lamina_id: 'L-031', informe_id: 'jm', seccion_id: 'resumen_ejecutivo', orden_plantilla: 2 },
  { lamina_id: 'L-032', informe_id: 'jm', seccion_id: 'resumen_ejecutivo', orden_plantilla: 3 },
  { lamina_id: 'L-034', informe_id: 'jm', seccion_id: 'ecv_alcance_semanal', orden_plantilla: 5 },
  { lamina_id: 'L-036', informe_id: 'jm', seccion_id: 'comunicaciones_post', orden_plantilla: 7 },
  { lamina_id: 'L-012', informe_id: 'secco', seccion_id: 'ecv_alcance_semanal', orden_plantilla: 8 }
];

/* Los valores vivos de `CONFIG`, copiados del snapshot del 26/08. */
const CONFIG = { seccion_agregado_semanal: 'ecv_alcance_semanal', seccion_agregado_post: 'comunicaciones_post' };

function contexto(opciones) {
  const o = opciones || {};
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (o.parchear) {
    const antes = texto;
    texto = o.parchear(texto);
    if (texto === antes) return null;   // guarda de que la mutación ocurrió
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });

  ctx.leerConfig = () => ('config' in o ? o.config : CONFIG);
  ctx.leerLaminas_ = () => ('laminas' in o ? o.laminas : { ok: true, filas: LAMINAS });
  return ctx;
}

console.log('\n═══ A · sólo las láminas de las secciones que CONFIG nombra ═══');
{
  const ctx = contexto();
  const r = ctx.laminasGobernadasPorElTemario_('jm');
  const ids = Object.keys(r.por_lamina).sort();
  afirmar(r.ok === true, 'resuelve');
  afirmar(ids.join(',') === 'L-034,L-036',
    '⭐⭐ gobierna L-034 y L-036, y NADA más (' + (ids.join(',') || 'ninguna') + ')');
  afirmar(!r.por_lamina['L-031'] && !r.por_lamina['L-032'],
    '⭐ L-031 y L-032 quedan afuera — su universo es toda la semana de JM (`C-78`), y estaban ' +
    'en el fixture justamente para que esta afirmación pueda fallar');
  afirmar(r.por_lamina['L-034'] === 'ecv_alcance_semanal',
    'y dice de qué sección cuelga cada una, no sólo que sí');
}

console.log('\n═══ B · el informe recorta ═══');
{
  const ctx = contexto();
  afirmar(!ctx.laminasGobernadasPorElTemario_('jm')['por_lamina']['L-012'],
    'L-012 es de `secco` y no entra en `jm`');
  const s = ctx.laminasGobernadasPorElTemario_('secco');
  afirmar(Object.keys(s.por_lamina).join(',') === 'L-012',
    'y para `secco` entra sólo la suya (' + Object.keys(s.por_lamina).join(',') + ')');
}

console.log('\n═══ C · sin declaración en CONFIG no se recorta nada ═══');
{
  const ctx = contexto({ config: {} });
  const r = ctx.laminasGobernadasPorElTemario_('jm');
  afirmar(r.ok === false && Object.keys(r.por_lamina).length === 0,
    'devuelve ok:false y ninguna lámina');
  afirmar(/CONFIG/.test(r.motivo), 'con el motivo, no en silencio — ' + r.motivo);
}

console.log('\n═══ D · registro ilegible: ok:false, y el llamador NO recorta ═══');
{
  const ctx = contexto({ laminas: { ok: false, motivo: 'No existe la hoja LAMINAS' } });
  const r = ctx.laminasGobernadasPorElTemario_('jm');
  afirmar(r.ok === false, '⭐⭐ un registro ilegible NO puede leerse como «ninguna está gobernada»');
  afirmar(/LAMINAS/.test(r.motivo), 'y el motivo viaja — ' + r.motivo);
}

console.log('\n═══ E · la lista de claves no puede envejecer en silencio ═══');
{
  /* ⭐ `CLAVES_DEL_TEMARIO_` es una lista escrita a mano de nombres que se asignan **en otro
   * lado** (`opcionesEtapa4.X = …`). Un nombre que se renombre allá y no acá deja de recortarse y
   * **la clave se filtra a todas las láminas sin fallar** — el universo ancho de vuelta, por un
   * typo. Esto cruza las dos listas contra el código real. */
  const G = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const asignadas = [...G.matchAll(/opcionesEtapa4\.([a-z_]+)\s*=/g)].map((m) => m[1]);
  const ctx = contexto();
  const lista = ctx.CLAVES_DEL_TEMARIO_;
  afirmar(Array.isArray(lista) && lista.length > 0,
    'CLAVES_DEL_TEMARIO_ existe (' + (lista || []).length + ' clave(s))');
  const huerfanas = (lista || []).filter((k) => asignadas.indexOf(k) === -1);
  afirmar(huerfanas.length === 0,
    '⭐⭐ las ' + (lista || []).length + ' se asignan de verdad en la etapa 4' +
    (huerfanas.length ? ' — HUÉRFANAS: ' + huerfanas.join(', ') : ''));
  /* ⚠ La dirección inversa **no se puede decidir sola**: si alguien agrega una clave del temario
   * y no la pone en la lista, ningún patrón sabe que era «del temario». Se dice en vez de fingir
   * que está cubierto. */
  console.log('     ⚠ la dirección inversa —una clave nueva del temario que nadie agregue a la');
  console.log('       lista— NO se puede decidir automáticamente. Queda declarada, no cubierta.');
}

console.log('\n═══ F · control negativo — sin el filtro por sección, salen las cuatro ═══');
{
  const ctx = contexto({ parchear: (t) => t.replace('if (id && secciones[sid]) out.por_lamina[id] = sid;', 'if (id) out.por_lamina[id] = sid;') });
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    const ids = Object.keys(ctx.laminasGobernadasPorElTemario_('jm').por_lamina).sort();
    afirmar(ids.indexOf('L-031') !== -1,
      '⛔ sin el filtro entra L-031 (' + ids.join(',') + ') — o sea que A mide ESE filtro');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que los cinco tokens compartidos dejen de publicar el universo de L-031 en');
console.log('     L-034. Eso es la Parte 2, y sin ella este recorte NO mueve ningún número.');
console.log('   · Qué pasa con una lámina sin sellar. El llamador conserva el comportamiento');
console.log('     anterior a propósito y lo avisa; eso vive en `generarInforme`, no acá.');

process.exit(fallas === 0 ? 0 : 1);
