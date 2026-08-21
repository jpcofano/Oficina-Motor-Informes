#!/usr/bin/env node
/**
 * tools/probar-reloj-etapas.js — el reloj de la corrida se consulta en TODAS las etapas
 * (`docs/Prompts/2026-08-21_1_limite_duro.md`, Parte B), **fuera de Apps Script** y cargando el
 * código real del repo — mismo criterio que `tools/probar-tanda4.js` y `probar-formato-revisar.js`:
 * una copia pegada acá probaría la copia, y seguiría en verde sobre código que ya no existe.
 *
 * ⭐ **Qué agrega sobre `verificarRelojDeEtapas()` de `Pruebas.gs`, que es lo que justifica que
 * exista:** las cuatro pruebas de allá son puras y estructurales — miden la decisión y miden que
 * los controles estén cableados—, pero **ninguna hace correr la etapa 1**. Acá se ejecuta
 * `duplicarBloquesRepetibles_` de verdad, con dependencias falsas y **con `Date` reemplazado**,
 * así que el reloj del presupuesto y los cronómetros por sección leen el mismo tiempo simulado.
 * Sin ese reemplazo el banco no mediría nada: las secciones falsas tardan 0 s de reloj de pared,
 * y `costoUltimaSeccionSeg` —que es justamente lo que hay que verificar— saldría siempre 0.
 *
 * ⚠ **Y la parte que este banco NO puede contestar, dicha acá y no al final:** cuánto cuesta cada
 * etapa de verdad. Los segundos de acá son inventados a propósito para recorrer los casos. Lo
 * único que se afirma es **qué decide el motor dado un gasto**, no cuál es el gasto.
 *
 * El caso que lo motiva, medido el 21/08/2026: `CONFIG.presupuesto_corrida_seg` estaba en **150**
 * y la corrida llegó igual al muro duro de Apps Script, **360 s** — más del doble del techo
 * declarado, porque el reloj sólo se consultaba entre asignaciones y el arranque queda fuera
 * de ese bucle.
 *
 * Uso:
 *   node tools/probar-reloj-etapas.js
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

/* ── el contexto, con el reloj simulado ────────────────────────────────────────────────────
 *
 * `Date` se reemplaza entero. `controlDeEtapa_` y los cronómetros por sección hacen
 * `new Date().getTime()`, así que los dos leen `AHORA` y avanzan sólo cuando `gastar()` lo dice. */
let AHORA = 1000000000000;
function gastar(segundos) { AHORA += segundos * 1000; }

const FakeDate = function () { this.getTime = () => AHORA; };
FakeDate.now = () => AHORA;

function nuevoContexto(config) {
  const ctx = {
    console,
    Math,
    Date: FakeDate,
    Logger: { log: () => {} },
    leerConfig: () => config || {}
  };
  vm.createContext(ctx);
  return ctx;
}

/** Carga `Generador.gs` tal cual. Falla ruidosamente si el archivo se movió o no parsea. */
function cargarGenerador(ctx, textoOpcional) {
  const texto = (textoOpcional !== undefined)
    ? textoOpcional
    : fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  return texto;
}

console.log('Reloj de etapas — código cargado de Generador.gs\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · Las etapas declaradas tienen su punto de control EN EL FLUJO
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Un control perfecto que nadie llama deja la etapa desprotegida igual, que es exactamente lo
 * que pasaba hasta el 21/08 con el arranque y el mapa. */
console.log('1 · cada etapa declarada tiene su control en el flujo');
{
  const ctx = nuevoContexto();
  cargarGenerador(ctx);
  const r = vm.runInContext('controlPorEtapa_()', ctx);
  const sin = r.etapas.filter(e => !e.tiene).map(e => e.etapa);

  afirmar(r.total > 0, 'hay ' + r.total + ' etapa(s) declaradas — cero sería el problema, no un silencio');
  afirmar(sin.length === 0,
    r.con_control + ' de ' + r.total + ' etapas tienen su punto de control' +
    (sin.length ? ' · SIN CONTROL: ' + sin.join(', ') : ''));

  // Control negativo: el instrumento sabe decir «no». Sin este par, un `controlPorEtapa_` que
  // devolviera siempre `tiene: true` pasaría la afirmación de arriba sin medir nada.
  const vacio = vm.runInContext('controlPorEtapa_("function nada() { return 1; }")', ctx);
  afirmar(vacio.con_control === 0,
    'sobre una fuente sin controles informa 0 de ' + vacio.total + ' — sabe decir «no»');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · Romper a propósito
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Se saca del fuente la llamada de control de la etapa 2 y se verifica que **caiga su
 * afirmación, nombrando esa etapa**. Si no cae, el control no mide lo que dice. */
console.log('\n2 · romper a propósito: sin el control de la etapa 2, la afirmación cae');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const linea = "  if (!corte) corte = controlDeEtapa_(reloj, '2 · mapa token→objectId', costoMapaSeg_());";

  if (texto.indexOf(linea) === -1) {
    fallas++;
    console.log('  ❌ no encontré la línea a romper — si se reescribió, esta prueba tiene que enterarse:');
    console.log('     ' + linea);
  } else {
    const ctx = nuevoContexto();
    cargarGenerador(ctx, texto.replace(linea, '  // ROTA A PROPÓSITO por tools/probar-reloj-etapas.js'));
    const r = vm.runInContext('controlPorEtapa_()', ctx);
    const sin = r.etapas.filter(e => !e.tiene).map(e => e.etapa);

    afirmar(r.con_control === r.total - 1 && sin.length === 1,
      'el instrumento baja a ' + r.con_control + ' de ' + r.total);
    afirmar(sin[0] === '2 · mapa token→objectId',
      'y nombra la etapa rota: "' + (sin[0] || '(ninguna)') + '"');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · La decisión, sobre relojes sintéticos
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · `controlDeEtapa_` decide bien, y las dos clases de corte se distinguen');
{
  const ctx = nuevoContexto();
  cargarGenerador(ctx);
  ctx.__reloj = (gastadoSeg, techo, reserva) => ({ t0: AHORA - gastadoSeg * 1000, presupuesto: techo, reserva });

  const agotado = vm.runInContext("controlDeEtapa_(__reloj(200, 150, 30), '4 · tokens fijos', 5)", ctx);
  afirmar(agotado !== null && agotado.clase === 'presupuesto',
    'con 200 s gastados de un techo útil de 120, la etapa no arranca (clase ' +
    (agotado ? agotado.clase : 'null') + ')');
  afirmar(agotado && agotado.segundos === 200, 'y el corte informa los 200 s gastados');

  const holgado = vm.runInContext("controlDeEtapa_(__reloj(10, 150, 30), '4 · tokens fijos', 5)", ctx);
  afirmar(holgado === null, 'con 110 s disponibles y un costo de 5, arranca');

  // ⭐ La clase la elige la pregunta que hizo el sitio de llamada, no el estado del reloj: los
  // dos casos que siguen usan el MISMO reloj y la MISMA etapa, y salen distinto.
  const arranque = vm.runInContext(
    "controlDeEtapa_(__reloj(190, 150, 30), '1 · expandir secciones repetibles', 0, CORTE_ARRANQUE_)", ctx);
  const generico = vm.runInContext(
    "controlDeEtapa_(__reloj(190, 150, 30), '1 · expandir secciones repetibles', 5)", ctx);
  afirmar(arranque && arranque.clase === 'arranque_no_entra' && generico && generico.clase === 'presupuesto',
    'mismo reloj y misma etapa, dos clases distintas — la elige la pregunta, no el reloj');
  afirmar(arranque && arranque.motivo.indexOf('no correr de nuevo') !== -1,
    'y el motivo del arranque descarta el consejo equivocado («correr de nuevo»)');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · La etapa 1 corriendo de verdad
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * `duplicarBloquesRepetibles_` real, con dependencias falsas y el reloj simulado. Es la parte
 * que `Pruebas.gs` no puede cubrir: allá se mide la decisión, acá se mide el recorrido. */
console.log('\n4 · la etapa 1, corriendo con el reloj simulado');

const SECCIONES_FALSAS = ['encuentro', 'comunicaciones_post', 'campana'];

/**
 * `lectura[i]` — lo que tarda `itemsDeSeccion_` de la sección i. El arranque (anclaje + unión)
 * cae **entero en la primera**, porque el caché lo cobra una sola vez por corrida.
 * `duplic[i]` — lo que tarda duplicar su bloque.
 */
function correrEtapa1(lectura, duplic, techo) {
  AHORA = 1000000000000;
  const ctx = nuevoContexto();
  cargarGenerador(ctx);

  const reloj = { t0: AHORA, presupuesto: techo, reserva: 30 };
  let n = 0;

  ctx.seccionesRepetiblesDe_ = () => SECCIONES_FALSAS.map(id => ({ seccion_id: id, itera_sobre: 'REUNIONES' }));
  ctx.familiasDeSeccion_ = (s) => [s.seccion_id];
  ctx.slidesModeloDe_ = (p, fam) => [SECCIONES_FALSAS.indexOf(fam[0])];
  ctx.itemsDeSeccion_ = () => {
    gastar(lectura[n] || 0);
    return { ok: true, items: [{ clave: 'i1', opciones: {} }], excluidos: [] };
  };
  const slideFalsa = (i) => ({
    getObjectId: () => 'oid' + i,
    duplicate: () => { gastar(duplic[n] || 0); n++; return slideFalsa(i); },
    remove: () => {},
    move: () => {}
  });
  ctx.__pres = { getSlides: () => SECCIONES_FALSAS.map((_, i) => slideFalsa(i)) };
  ctx.__reloj = reloj;

  const r = vm.runInContext('duplicarBloquesRepetibles_(__pres, "jm", {}, null, __reloj)', ctx);
  r.__gastado = (AHORA - reloj.t0) / 1000;
  r.__omitidas = r.reporte.filter(s => s.omitida).map(s => s.seccion);
  return r;
}

// 4.1 · techo holgado: nada corta y las tres se expanden.
{
  const r = correrEtapa1([80, 0, 0], [5, 5, 5], 350);
  afirmar(!r.corte && r.asignaciones.length === 3,
    'techo 350 · arranque 80 + 5 s por sección → sin corte, 3 asignaciones (' + r.__gastado + ' s)');
}

// 4.2 · ⭐ el arranque solo se pasa del techo. Es el caso del 21/08 y el que hasta hoy moría
//       en el muro sin decir nada.
{
  const r = correrEtapa1([200, 0, 0], [1, 1, 1], 150);
  afirmar(r.corte && r.corte.clase === 'arranque_no_entra',
    'techo 150 · el arranque solo cuesta 200 → corta con clase "' +
    (r.corte ? r.corte.clase : 'ninguna') + '"');
  afirmar(r.asignaciones.length === 0 && r.__omitidas.length === 3,
    'y las 3 secciones quedan REPORTADAS como omitidas — `D-21`, ninguna desaparece en silencio');
}

// 4.3 · ⭐ el arranque entra pero la segunda sección ya no. Verifica **el descuento del
//       arranque**: si no se descontara, la estimación de la segunda diría 115 s en vez de 35
//       y el corte llegaría una sección antes, culpando a trabajo que sí entraba.
{
  const r = correrEtapa1([80, 0, 0], [35, 35, 35], 150);
  afirmar(r.corte && r.corte.clase === 'presupuesto' && r.asignaciones.length === 1,
    'techo 150 · arranque 80 + 35 s por sección → expande 1 y corta en la 2ª');
  afirmar(!!(r.corte && r.corte.motivo.indexOf('35 s') !== -1),
    'y estima la 2ª en 35 s, no en 115: el arranque se descuenta de la sección que lo pagó' +
    (r.corte ? ' — «' + r.corte.motivo.slice(0, 70) + '…»' : ''));
  afirmar(r.__omitidas.length === 2, 'las 2 secciones que no se expandieron quedan reportadas');
}

// 4.4 · el mismo trabajo con el techo real: entra entero. **El control no corta de más**, que
//       es la mitad que suele faltar — un control que corta siempre satisface «corta cuando no
//       hay presupuesto» y no sirve para nada.
{
  const r = correrEtapa1([80, 0, 0], [35, 35, 35], 350);
  afirmar(!r.corte && r.asignaciones.length === 3,
    'techo 350 · el mismo trabajo (' + r.__gastado + ' s) entra entero, sin corte');
}

console.log('');
if (fallas === 0) {
  console.log('✅ Todas las afirmaciones pasaron.');
} else {
  console.log('❌ ' + fallas + ' afirmación(es) fallaron.');
}

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto, y dicen qué NO cubre el verde de arriba.
 * `CLAUDE.md` §4: un `⚠` en el medio de un reporte que termina en `✅` se lee como verde. */
console.log('');
console.log('⚠ Lo que este banco NO contesta:');
console.log('   · Cuánto cuesta cada etapa de verdad. Los segundos de arriba son inventados para');
console.log('     recorrer los casos; lo que se afirma es qué DECIDE el motor dado un gasto.');
console.log('   · Si el cierre entra en la reserva. Eso sale de `presupuesto.cierre_seg` de una');
console.log('     corrida real — el cierre no lleva punto de control a propósito: corre siempre.');
console.log('   · Qué techo tiene la hoja hoy. `CONFIG.presupuesto_corrida_seg` no se lee desde acá,');
console.log('     y el 21/08 el problema empezó ahí: decía 150 y nadie lo miró.');

process.exit(fallas === 0 ? 0 : 1);
