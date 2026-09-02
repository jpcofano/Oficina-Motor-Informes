#!/usr/bin/env node
/**
 * tools/probar-corridas-link.js — **el historial abre el deck**
 * (`docs/Prompts/2026-09-01_3_panel_navegacion.md`, Parte B.1).
 *
 * ⭐ **Por qué existe, con la regla que lo pide.** La rama que envuelve la fila en un `<a>` es
 * código que **ninguna afirmación tocaba**. `CLAUDE.md` §4: *una rama nueva que nunca se ejecutó
 * no está sin probar, está sin escribir el control*, y las dos cosas se ven igual en un tablero
 * de suites verdes. La pregunta —**¿qué afirmación existente falla si esto no funciona?**— tenía
 * como respuesta «ninguna».
 *
 * **Lo que fija, en orden de qué tan caro sale que se rompa:**
 *
 *  1. ⛔ **Las DOS vistas arman el mismo `href` para la misma corrida.** `vistaCorridas` y la vía
 *     rápida de «Generar» (`corridaPrevia` → `deckCard`) tienen que llevar al mismo deck. Es el
 *     gate que el usuario pidió antes de mover la pestaña «Generar» de lugar.
 *  2. ⛔ **Cerrada sin `deck_id` no dibuja un enlace y LO DICE.** Sin esa rama es indistinguible
 *     de una fila común: *«no hay»* leído como *«no miré»*.
 *  3. **No cerrada sigue sin enlace**, como antes.
 *  4. ⭐ **El control positivo:** al menos una fila SÍ emite `href`. Sin él, un banco que no
 *     encuentra enlaces en ninguna parte da verde por la razón equivocada.
 *  5. **El conteo se declara aunque dé cero**, y dice que habla de las cargadas, no del total.
 *
 * ⚠ **Lo que este banco NO prueba, y hay que decirlo:** que `CORRIDAS` tenga `deck_id` cargado,
 * que el deck exista en Drive, ni que la pantalla se pinte. Eso vive en Apps Script y se ve
 * corriendo el panel.
 *
 * ⛔⛔ **Y el límite del control 1, declarado en vez de descubierto.** Las dos vistas leen **el
 * mismo `c.deck_id` del mismo `S.corridas`**, así que **no fallan distinto**: esto no detecta un
 * `deck_id` equivocado en la hoja. Detecta un error de **construcción** en cualquiera de las dos
 * —exactamente el `[object Object]` del 21/08—, que es lo que el gate necesita saber.
 *
 * Uso:
 *   node tools/probar-corridas-link.js
 *   node tools/probar-corridas-link.js --autoprueba
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const AUTO = process.argv.indexOf('--autoprueba') !== -1;

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

const FUENTE = fs.readFileSync(path.join(RAIZ, 'Panel.html'), 'utf8');

/* Las cinco funciones REALES, extraídas y no reescritas: copiar la lógica acá probaría que sé
 * copiar, que es justo lo que no hace falta verificar (`CLAUDE.md` §4).
 *
 * ⚠ `periodoBuscado` entra porque `corridaPrevia` la llama. **Es parte del camino**, y stubearla
 * mediría un emparejamiento que no es el del panel — la regla de que la función que estás midiendo
 * no es el camino completo. */
const TROZOS = [
  /function esc\(v\)\{[\s\S]*?\r?\n\}/,
  /function periodoBuscado\(\)\{[\s\S]*?\r?\n\}/,
  /function corridaPrevia\(\)\{[\s\S]*?\r?\n\}/,
  /function deckCard\([\s\S]*?\r?\n\}/,
  /function vistaCorridas\(\)\{[\s\S]*?\}\)\.join\(''\);\r?\n\}/
];

function contexto(fuente) {
  const ctx = { console, String, Number, Object, Array };
  vm.createContext(ctx);
  TROZOS.forEach(function (re, i) {
    const m = fuente.match(re);
    if (!m) throw new Error('no se pudo extraer el trozo ' + i + ' de Panel.html');
    vm.runInContext(m[0], ctx, { filename: 'Panel.html' });
  });
  return ctx;
}

/** El fixture: los tres estados juntos, más una corrida de otro informe que no tiene que aparecer
 *  en la vía rápida. `deck_id` sale de la forma real de `panel_ultimasCorridas`: un string. */
function fixture() {
  return {
    corridasCargando: false,
    informeId: 'jm',
    periodoId: '2026_agosto_29_04',
    periodos: [], porDefecto: null,
    informes: [{ id: 'jm', nombre: 'Informe JM' }, { id: 'secco', nombre: 'Informe SECCO' }],
    corridas: [
      { informe_id: 'jm', periodo_id: '2026_agosto_29_04', cerrada: true,
        deck_id: 'DECK_JM_1', fecha_generacion: '2026-09-01 09:00', faltantes: '12' },
      { informe_id: 'jm', periodo_id: '2026_agosto_22_28', cerrada: true,
        deck_id: '', fecha_generacion: '2026-08-25 09:00', faltantes: '9' },
      { informe_id: 'secco', periodo_id: '2026_agosto_29_04', cerrada: false,
        deck_id: '', fecha_generacion: '', faltantes: '' }
    ]
  };
}

function hrefsDe(html) {
  const out = [];
  const re = /href="([^"]*)"/g;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

function correr(fuente) {
  const ctx = contexto(fuente);
  ctx.S = fixture();
  const html = ctx.vistaCorridas();
  const hrefs = hrefsDe(html);

  console.log('\n═══ A · el control positivo: la vista emite enlaces ═══');
  afirmar(hrefs.length === 1,
    '⭐ emite exactamente 1 href sobre el fixture de 3 corridas — dio ' + hrefs.length +
    ' (sin esto, «no hay enlaces» y «no miré» se ven igual)');

  console.log('\n═══ B · las DOS vistas llevan al mismo deck ═══');
  const previa = ctx.corridaPrevia();
  afirmar(!!previa && previa.deck_id === 'DECK_JM_1',
    'la vía rápida empareja la corrida cerrada de jm de este período');
  const hrefTarjeta = hrefsDe(ctx.deckCard(previa && previa.deck_id, 'Informe JM', 'meta'));
  afirmar(hrefTarjeta.length === 1 && hrefs.length === 1 && hrefTarjeta[0] === hrefs[0],
    '⛔ el href de «Corridas» y el de la vía rápida de «Generar» son el MISMO — ' +
    (hrefs[0] || '(ninguno)') + ' vs ' + (hrefTarjeta[0] || '(ninguno)'));
  afirmar(!!hrefs[0] && hrefs[0].indexOf('[object Object]') === -1 && hrefs[0].indexOf('/d//edit') === -1,
    'y no es un enlace roto: ni [object Object] ni /d//edit');

  console.log('\n═══ C · cerrada SIN deck_id ═══');
  afirmar(html.indexOf('cerró sin registrar el deck_id') !== -1,
    '⛔ lo dice con todas las letras — sin esta rama sería una fila común');
  afirmar(html.indexOf('DECK_JM_1') !== -1 && hrefs.length === 1,
    'y no le inventa un enlace: el único href es el de la que sí tiene deck');

  console.log('\n═══ D · no cerrada ═══');
  afirmar(html.indexOf('no cerró — sin fecha de generación') !== -1,
    'sigue diciendo que murió, y sin enlace');

  console.log('\n═══ E · el conteo se declara, y dice sobre qué corrió ═══');
  afirmar(/3 corrida\(s\) cargadas/.test(html), 'declara cuántas cargó: 3');
  afirmar(/2 cerrada\(s\)/.test(html) && /1 con deck/.test(html),
    'y las parte: 2 cerradas, 1 con deck');
  afirmar(/1 cerró sin registrar el deck_id/.test(html),
    '⭐ y nombra el tercer estado con su número');
  afirmar(html.indexOf('no el total') !== -1,
    '⚠ y declara que habla de las cargadas, no del total de CORRIDAS');
}

correr(FUENTE);

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * F · romper a propósito
 *
 * ⭐⭐ **La mutación tiene que OCURRIR.** Un parche que no matchea deja el control corriendo
 * sobre el código intacto, da verde, y eso se lee como «el negativo pasó» (`CLAUDE.md` §4,
 * 24/08). Por eso el patrón va por **fragmento de una línea** —el fin de línea es del archivo,
 * no de quien escribe la prueba— y se exige que el texto haya cambiado.
 *
 * ⭐ **Y se exige el MOTIVO, no el resultado:** sin la rama del enlace no puede quedar NINGÚN
 * href. Un rojo por otra causa no probaría lo que dice.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */
if (AUTO) {
  console.log('\n═══ F · autoprueba: sin la rama del enlace no queda ningún href ═══');
  const ORIGINAL = 'if (c.cerrada && deckId){';
  if (FUENTE.indexOf(ORIGINAL) === -1) {
    fallas++;
    console.log('  ⛔ el patrón de la mutación no está en Panel.html — el caso negativo no midió nada');
  } else {
    const mutado = FUENTE.replace(ORIGINAL, 'if (false && c.cerrada && deckId){');
    if (mutado === FUENTE) {
      fallas++;
      console.log('  ⛔ la mutación NO ocurrió — el negativo habría corrido sobre el código intacto');
    } else {
      console.log('  ✅ la mutación ocurrió: el texto cambió');
      const ctx2 = contexto(mutado);
      ctx2.S = fixture();
      const sinLink = hrefsDe(ctx2.vistaCorridas()).length;
      afirmar(sinLink === 0,
        '⭐ y cae por el MOTIVO correcto: sin la rama no queda ningún href (quedaron ' + sinLink + ')');
    }
  }
}

console.log('\n' + (fallas === 0 ? '✅ todo pasó.' : '⛔ ' + fallas + ' afirmación(es) fallaron.'));
process.exit(fallas === 0 ? 0 : 1);
