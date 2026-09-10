#!/usr/bin/env node
/**
 * tools/probar-censo-cajas.js — **el censo posicional ve la POSICIÓN, y aborta si no la ve**
 * (`docs/Prompts/2026-09-10_4_destrabar_push_y_altas.md`, Parte A).
 *
 * ⛔⛔ **Lo que protege, y es lo único que importa acá:** un censo ciego y un censo sin hallazgos
 * **se ven idénticos en un log**. Si `geo` viniera `null` en todas las piezas, el censo imprimiría
 * una tabla perfecta con todas las cajas en la misma posición y **nadie se enteraría** — y encima
 * su salida se usa para decidir si `C-126` es de la plantilla o del motor, que mandan a trabajos
 * opuestos. Por eso el control 1 **aborta** en vez de informar cero.
 *
 * ⭐ **El control positivo es SINTÉTICO, no el defecto que el censo busca.** Un control positivo
 * que fuera *«tiene que encontrar el cruce de `C-126`»* se apagaría el día que el usuario corrige
 * la plantilla — que es exactamente lo que pasó el 10/09 a las 15:55. Acá el fixture se arma a
 * mano y funciona con la plantilla sana, rota o vacía.
 *
 * Uso:  node tools/probar-censo-cajas.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0, afirmaciones = 0;
function afirmar(condicion, mensaje) {
  afirmaciones++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const FUENTE = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');

/**
 * Extrae `censarCajasDeInforme_` del `.gs` REAL y la corre con stubs.
 *
 * ⛔ **Se EXTRAE, no se copia.** Reescribir la función acá sería el instrumento que reproduce la
 * lógica del motor y la reproduce peor — y este banco existe justamente para vigilar esa función,
 * no una gemela suya.
 *
 * `mutar` permite romper a propósito. ⛔ **Y la guarda de mutación no es opcional:** si el texto
 * parcheado sale idéntico al original, el caso **falla** en vez de saltearse. Sin eso, un patrón
 * que no matchea produce un «negativo» que corrió sobre el código intacto y dio verde.
 */
function correr(piezasPorSlide, escondidas, mutar) {
  let texto = FUENTE;
  if (mutar) {
    const antes = texto;
    texto = mutar(texto);
    if (texto === antes) {
      throw new Error('LA MUTACIÓN NO OCURRIÓ — el patrón no matcheó nada y el caso habría ' +
        'corrido sobre el código intacto');
    }
  }
  // Sólo el bloque del censo: el resto de `Auditoria.gs` arrastra medio motor.
  // ⚠ Arranca en `selloDePlantilla_`, que `censarCajasDeInforme_` llama: recortar justo en la
  // función que se quiere probar deja afuera lo que necesita y el banco muere por el recorte.
  const i = texto.indexOf('function selloDePlantilla_');
  const j = texto.indexOf('\nfunction contrastarConSegundoLector_');
  if (i === -1 || j === -1) throw new Error("no encuentro el bloque del censo en Auditoria.gs");

  const ctx = {
    console, Math, JSON, String, Number, Object, Array, RegExp, Error, Date,
    RE_TOKEN_: /\{\{([a-zA-Z0-9_]+)\}\}/g,
    leerInformes: () => ({ prueba: { plantilla_id: 'ID_DE_PRUEBA' } }),
    DriveApp: { getFileById: () => ({ getName: () => 'PLANTILLA_DE_PRUEBA',
                                      getLastUpdated: () => new Date('2026-09-10T18:55:00Z') }) },
    SlidesApp: { openById: () => ({ getSlides: () => piezasPorSlide.map((_, n) => ({ __n: n })) }) },
    piezasDeTextoDeSlide_: (slide) => piezasPorSlide[slide.__n],
    esLaminaEscondida_: (slide) => !!(escondidas || {})[slide.__n]
  };
  vm.createContext(ctx);
  vm.runInContext(texto.slice(i, j), ctx, { filename: 'censo.gs' });
  return vm.runInContext('censarCajasDeInforme_("prueba")', ctx);
}

/** Una caja: texto, posición y contenedor. */
const caja = (texto, y, x) => ({ texto, geo: { x, y, w: 10, h: 5 }, contenedor: 'suelta',
                                 objectId: 'p_' + y + '_' + x });

console.log('1 · ⭐ el caso positivo SINTÉTICO — no depende de ningún defecto real');
{
  const r = correr([[caja('Aperturas', 82, 71), caja('{{camp_clics}} ({{camp_ctor}}%)', 67, 69),
                     caja('{{camp_entregados}}', 67, 25), caja('Entregados', 82, 24)]]);
  afirmar(r.ok, 'el censo corre y devuelve `ok`');
  const p = r.laminas[0].piezas;
  afirmar(p.length === 4, 'censa las 4 cajas — ' + p.length);
  /* ⚠ El fixture son DOS pares: `{{camp_entregados}}` rotulado «Entregados», y
   * `{{camp_clics}} ({{camp_ctor}}%)` rotulado «Aperturas» — que es el cruce de `C-126` en
   * miniatura. ⇒ 2 con token y 2 rótulos. La primera versión de esta afirmación decía `1 / 3` y
   * **se puso roja diciendo la verdad**: el mal contado era yo, no el censo. */
  afirmar(r.laminas[0].con_token === 2 && r.laminas[0].sin_token === 2,
    '⭐⭐ emite LAS DOS listas: 2 con token y 2 rótulos (las cajas sin token son los rótulos, ' +
    'y sin ellas el censo no puede decir en qué casillero cae nada) — ' +
    r.laminas[0].con_token + ' / ' + r.laminas[0].sin_token);
  afirmar(p[0].geo.y === 67 && p[1].geo.y === 67 && p[0].geo.x < p[1].geo.x,
    '⭐ ordena por `(y, x)`, que es como se lee una lámina — no por el orden del XML');
  afirmar(p[0].tokens.join(',') === 'camp_entregados' &&
          p[1].tokens.join(',') === 'camp_clics,camp_ctor',
    '⛔⛔ una caja con DOS tokens los devuelve a los dos — es el caso de `L-020`, ' +
    '`{{camp_clics}} ({{camp_ctor}}%)` en la caja rotulada «Aperturas»');
}

console.log('\n2 · ⛔⛔ el NEGATIVO — sin `geo`, el censo ABORTA y no informa cero');
{
  let r = null, error = null;
  try {
    r = correr([[caja('Aperturas', 82, 71), caja('{{camp_clics}}', 67, 69)]],
      null, (t) => t.replace('geo: p.geo,', 'geo: null,'));
  } catch (e) { error = e; }
  afirmar(!error, 'la mutación ocurrió (si no, esto falla en vez de saltearse) — ' +
    (error ? error.message : 'geo forzada a `null`'));
  afirmar(!!r && r.ok === false, '⛔⛔ ABORTA: `ok: false`, no un censo de cero hallazgos');
  afirmar(!!r && /NO ve la posicion/.test(r.motivo || ''),
    '⛔ y cae POR EL MOTIVO CORRECTO, no por otro: «' + ((r || {}).motivo || '').slice(0, 60) + '…»');
}

console.log('\n3 · ⚠ el borde que NO tiene que abortar — una lámina de UNA sola caja');
{
  /* ⭐ Con una pieza sola no hay par que comparar, y eso NO es ceguera: es una lámina de una caja.
   * Si el control abortara acá estaría midiendo el tamaño de la lámina, no la vista del censo. */
  const r = correr([[caja('Muchas gracias', 50, 10)]]);
  afirmar(r.ok, 'no aborta con una sola caja — el control mira pares, no cantidad');
  afirmar(r.laminas[0].sin_token === 1 && r.laminas[0].con_token === 0,
    'y la cuenta como rótulo, no como hallazgo');
}

console.log('\n4 · ⭐ el sello y las escondidas viajan en el censo');
{
  const r = correr([[caja('a', 1, 1), caja('b', 2, 1)], [caja('c', 1, 1), caja('d', 2, 1)]],
    { 1: true });
  afirmar(r.plantilla && r.plantilla.ok && /PLANTILLA_DE_PRUEBA/.test(r.plantilla.nombre),
    '⭐ declara CONTRA QUÉ VERSIÓN midió — un censo sin sello no se puede cruzar con nada');
  afirmar(JSON.stringify(r.escondidas) === '[2]',
    '⛔ y el inventario de escondidas: ' + JSON.stringify(r.escondidas) +
    ' — sus tokens quedan crudos por diseño (`C-130`), no por falta de cableado');
  afirmar(r.total_laminas === 2 && r.laminas.length === 2,
    '⭐ y declara `n de m`: cero unidades censadas es un problema, no un silencio');
}

console.log('\n5 · ⚠ lo que este banco NO prueba, dicho y no omitido');
console.log('   · Nada sobre la plantilla VIVA: corre con piezas sintéticas. Que el censo mida bien');
console.log('     una plantilla real lo dice el control 2 —el segundo lector— **al correrlo**.');
console.log('   · Y ese segundo lector comparte `piezasDeTextoDeSlide_` con el censo, así que');
console.log('     cubre el FILTRADO y no el recorrido. Los dos límites están en el `.gs`.');

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' de ' + afirmaciones + ' afirmaciones FALLARON'); process.exit(1); }
console.log('✅ Las ' + afirmaciones + ' afirmaciones pasaron');
