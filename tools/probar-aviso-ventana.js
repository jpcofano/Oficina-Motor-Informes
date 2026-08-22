#!/usr/bin/env node
/**
 * tools/probar-aviso-ventana.js — **el aviso de ventana propuesta no puede afirmar una causa
 * falsa** (`docs/Prompts/Addendum_2026-08-22_Paso-22_R21_no_es_diseno.md`, §5).
 *
 * ⛔ **El bug, medido en la hoja viva el 22/08.** `avisosDeVentanaPropuesta_` decía *"La semana
 * propuesta **no tiene fila en PERIODOS**"* mirando **sólo** si el `origen` empieza con
 * `periodo_ref:`. La ventana propuesta era `2026-08-14 → 2026-08-20` y **`agosto_14_20` es
 * exactamente esa fila**. La consecuencia que el aviso describe era cierta; la causa, no.
 *
 * ⚠ **Y `CLAUDE.md` §4 tiene la lección escrita para este mismo aviso**, del día que se redactó:
 * *"mostrar una advertencia equivocada es tan caro como no mostrar ninguna, porque la próxima se
 * lee con la misma desconfianza"*.
 *
 * ⭐ **Lo que este banco fija, y es más que «no mentir»:** que el aviso diga **qué apretar**. Con
 * una fila que coincide, nombrarla; con varias, advertir que elegir la equivocada **vacía el
 * informe** —hay dos con la misma ventana y una de ellas es el P1 de la fila 9—; con ninguna,
 * decir la verdad de antes.
 *
 * Uso:
 *   node tools/probar-aviso-ventana.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

function contexto(periodos, parchear) {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'PanelBackend.gs' });

  ctx.leerPeriodos = () => periodos;
  // Se replica el contrato mínimo de las dos, no su lógica: lo que se mide es la DECISIÓN del
  // aviso, no cómo se parsea una fecha.
  ctx.parsearFechaCelda_ = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  ctx.formatearFecha_ = (v) => String(v);
  // 14 reuniones con `mostrar=sí`, 12 con período cargado — los números vivos del 22/08.
  ctx.leerReuniones_ = () => {
    const r = [];
    for (let i = 0; i < 12; i++) r.push({ periodo_id: 'julio_24_30' });
    for (let i = 0; i < 2; i++) r.push({ periodo_id: '' });
    return r;
  };
  return ctx;
}

/* Las dos filas reales con la MISMA ventana, copiadas de `PERIODOS` viva el 22/08. La segunda es
 * el P1 de la fila 9: se lee «por defecto» y ninguna reunión la tiene cargada. */
const PERIODOS_VIVOS = {
  'julio_24_30': { desde: '2026-07-24', hasta: '2026-07-30' },
  'agosto_14_20': { desde: '2026-08-14', hasta: '2026-08-20' },
  'vie 14/08 -- jue 20/08 (por defecto)': { desde: '2026-08-14', hasta: '2026-08-20' }
};
const VENTANA_CALCULADA = { ok: true, desde: '2026-08-14', hasta: '2026-08-20', origen: 'R-11 (calculado)' };

console.log('\n═══ A · ⛔ con una fila que coincide, NO dice que no la tiene ═══');
{
  const ctx = contexto({ 'agosto_14_20': { desde: '2026-08-14', hasta: '2026-08-20' } });
  const a = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA);

  afirmar(a.length === 1, 'sigue avisando — la consecuencia es real y no se calla');
  const t = a[0].texto;
  /* ⭐ La afirmación que el bug rompía. Con `!/no tiene fila/` sola pasaría un aviso que no diga
   * nada; por eso va junto con la de abajo, que exige que nombre la fila. */
  afirmar(!/no tiene fila en PERIODOS/.test(t),
    '⛔ ya NO afirma «no tiene fila en PERIODOS» — era falso y es la causa, no la consecuencia');
  afirmar(/agosto_14_20/.test(t),
    'y nombra la fila que coincide, que es lo que la persona tiene que apretar');
  afirmar(/NO se recortan por período/.test(t),
    'la consecuencia verdadera se conserva: el recorte de D-19 no se aplica');
  afirmar(/14 reuni/.test(t),
    'con el número adelante — «hay reuniones de otros períodos» y «hay 14» no se leen igual');
}

console.log('\n═══ B · ⚠ con VARIAS filas de la misma ventana, avisa que una vacía el informe ═══');
{
  const ctx = contexto(PERIODOS_VIVOS);
  const t = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA)[0].texto;

  afirmar(/agosto_14_20/.test(t) && /por defecto/.test(t),
    'ofrece las DOS que coinciden — la pantalla no elige por la persona');
  /* ⛔ Y es lo que separa este aviso de uno cómodo: elegir la fila 9 produce un deck con cero
   * encuentros **sin que nada falle**. Ofrecer sólo la primera habría escondido eso. */
  afirmar(/SIN encuentros/.test(t),
    'y advierte que la que ninguna reunión tenga cargada deja el informe SIN encuentros');
  afirmar(!/no tiene fila en PERIODOS/.test(t),
    'tampoco acá afirma la causa falsa');
}

console.log('\n═══ C · con ninguna fila que coincida, la frase vieja SÍ es cierta ═══');
{
  const ctx = contexto({ 'julio_24_30': { desde: '2026-07-24', hasta: '2026-07-30' } });
  const t = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA)[0].texto;
  /* ⚠ El arreglo no es «sacar la frase»: es decirla **cuando es cierta**. Un banco que sólo
   * afirmara que la frase no aparece nunca pasaría con el aviso vacío. */
  afirmar(/no tiene fila en PERIODOS/.test(t),
    'ahí sí la dice — la frase no se borró, se condicionó');
  afirmar(/crear la fila/.test(t), 'y ofrece la salida que corresponde a ese caso');
}

console.log('\n═══ D · una ventana ELEGIDA no dispara ningún aviso ═══');
{
  const ctx = contexto(PERIODOS_VIVOS);
  const a = ctx.avisosDeVentanaPropuesta_({
    ok: true, desde: '2026-08-14', hasta: '2026-08-20', origen: 'periodo_ref:agosto_14_20'
  });
  afirmar(a.length === 0,
    'con override explícito el recorte SÍ se aplica y no hay nada que avisar');
}

console.log('\n═══ E · si PERIODOS no se puede leer, el panel no se cae ═══');
{
  const ctx = contexto(PERIODOS_VIVOS);
  ctx.leerPeriodos = () => { throw new Error('boom'); };
  const a = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA);
  afirmar(a.length === 1 && /no tiene fila en PERIODOS/.test(a[0].texto),
    'se degrada al aviso genérico en vez de tumbar la pantalla');
}

console.log('\n═══ F · ⚠ romper a propósito ═══');
{
  let t = null;
  try {
    const ctx = contexto({ 'agosto_14_20': { desde: '2026-08-14', hasta: '2026-08-20' } },
      /* ⚠ Regex y no cadena literal: los `.gs` de este repo están en CRLF y un `\n` literal no
       * matchea nada. Ya falló así una vez, el 22/08, y lo cazó la guarda que exige que el parche
       * matchee — sin ella la sección habría quedado en verde sin haber roto nada. */
      (x) => x.replace(/var coincidentes = \[\];\s*try \{/, 'var coincidentes = []; if (true) { } else try {'));
    t = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA)[0].texto;
  } catch (e) {
    fallas++; console.log('  ❌ el parche falló: ' + e.message);
  }
  /* Sin la búsqueda de coincidencias vuelve la causa falsa. Si esta afirmación no se pusiera
   * roja, la sección A no estaría midiendo nada. */
  afirmar(t !== null && /no tiene fila en PERIODOS/.test(t),
    'anulada la búsqueda, vuelve a afirmar la causa falsa — la sección A mide algo real');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que la fila 9 de PERIODOS deje de existir. Es config y la decide el usuario;');
console.log('     esto sólo hace que el aviso la nombre en vez de esconderla.');
console.log('   · Que el recorte de D-19 funcione. Eso es de anclarEncuentros y no se toca acá.');

process.exit(fallas === 0 ? 0 : 1);
