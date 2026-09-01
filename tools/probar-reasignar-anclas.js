#!/usr/bin/env node
/**
 * tools/probar-reasignar-anclas.js — **`reasignarAnclasDeSecco()` reemplaza el ancla, no la anexa**
 * (`2026-08-31_5` Parte B).
 *
 * ⛔⛔ **Por qué este banco y no una corrida:** esta función **escribe en la plantilla del equipo**
 * (`C-01`) y **borra filas de `LAMINAS`**. Los dos son irreversibles desde el lado del motor —hay
 * backup de la plantilla, no de la hoja—, así que las afirmaciones tienen que correr **antes** de
 * que alguien la apriete.
 *
 * ⭐ **La afirmación central es la que separa esta función de `sellarPlantilla`:** allá la slide
 * **no tiene** ancla y `appendText` es correcto; acá **ya tiene una**, y anexar dejaría **dos
 * anclas en la misma slide**. `anclaDeLamina_` devuelve la **primera** que matchea, así que una
 * slide con dos anclas seguiría reportando la vieja: **el bug no sería visible ni en el log ni en
 * el verificador.**
 *
 * ⚠ **Lo que NO prueba:** que las dos slides de `secco` sean las que el usuario dice. Eso lo mide
 * la propia función contra la plantilla viva —las localiza **por su ancla, nunca por posición**— y
 * aborta si no encuentra exactamente una de cada.
 *
 * Uso:
 *   node tools/probar-reasignar-anclas.js
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

/** Una slide de mentira con notas MUTABLES — es lo que permite verificar el reemplazo real. */
function slide(notas) {
  const estado = { texto: notas };
  return {
    __estado: estado,
    getNotesPage: () => ({
      getSpeakerNotesShape: () => ({
        getText: () => ({
          asString: () => estado.texto,
          setText: (t) => { estado.texto = t; },
          appendText: (t) => { estado.texto += t; }
        })
      })
    })
  };
}

const FILAS_BASE = [
  { _fila: 2, lamina_id: 'L-004', informe_id: 'secco', seccion_id: 'encuentro', filtro: 'tipo=Uno a uno' },
  { _fila: 3, lamina_id: 'L-005', informe_id: 'secco', seccion_id: 'encuentro', filtro: 'tipo=Uno a uno' },
  { _fila: 4, lamina_id: 'L-006', informe_id: 'secco', seccion_id: 'encuentro', filtro: 'tipo=Encuentro Temático' },
  { _fila: 5, lamina_id: 'L-007', informe_id: 'secco', seccion_id: 'encuentro', filtro: 'tipo=Encuentro Temático' },
  { _fila: 6, lamina_id: 'L-008', informe_id: 'secco', seccion_id: 'encuentro', filtro: 'tipo!=Uno a uno' },
  { _fila: 7, lamina_id: 'L-052', informe_id: 'jm', seccion_id: 'encuentro', filtro: '' },
  { _fila: 8, lamina_id: 'L-053', informe_id: 'jm', seccion_id: 'encuentro', filtro: 'tipo=Uno a uno' }
];
const HEADERS = ['lamina_id', 'informe_id', 'seccion_id', 'orden_plantilla', 'escondida',
                 'origen', 'modo', 'itera_sobre', 'filtro', 'rol', 'cobertura', 'falta',
                 'alcance', 'tokens_equipo', 'notas'];

function contexto(opciones) {
  opciones = opciones || {};
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: (m) => ctx.__log.push(String(m)) }
  };
  ctx.__log = [];
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Sellador.gs'), 'utf8'), ctx,
    { filename: 'Sellador.gs' });

  const slides = [
    slide('Notas de la portada.'),
    slide('#lamina: L-052'),
    slide('Algo escrito por el equipo.\n#lamina: L-053')
  ];
  ctx.__slides = slides;

  const escritas = [];
  const borradas = [];
  ctx.__escritas = escritas;
  ctx.__borradas = borradas;
  let filas = FILAS_BASE.slice();
  ctx.__filasFinales = () => filas;

  ctx.leerInformes = () => ({ secco: { plantilla_id: 'P_SECCO' } });
  ctx.leerLaminas_ = () => ({
    ok: true, headers: HEADERS, filas: filas,
    hoja: {
      getLastRow: () => filas.length + 1,
      getRange: () => ({ setValues: (v) => {
        escritas.push(v);
        v.forEach((row) => {
          const o = {};
          HEADERS.forEach((h, i) => { o[h] = row[i]; });
          o._fila = filas.length + 2;
          filas.push(o);
        });
      } }),
      deleteRow: (n) => { borradas.push(n); filas = filas.filter((f) => f._fila !== n); }
    }
  });
  ctx.SpreadsheetApp = { flush: () => {} };
  ctx.SlidesApp = {
    openById: () => ({ getName: () => 'Plantilla SECCO', getSlides: () => slides })
  };
  ctx.esLaminaEscondida_ = () => false;
  ctx.asegurarCarpetaBackups_ = () => opciones.backupFalla
    ? { ok: false, motivo: 'carpeta inaccesible (caso negativo)' }
    : { ok: true, carpeta: {} };
  ctx.backupPlantilla_ = () => ({ ok: true, nombre: 'backup-secco-2026-08-31' });
  return ctx;
}

console.log('\n═══ A · la función VUELVE y cierra ═══');
let r;
{
  const ctx = contexto();
  try {
    r = vm.runInContext('reasignarAnclasDeSecco()', ctx);
    afirmar(true, 'corre de punta a punta sin tirar');
  } catch (e) { afirmar(false, '⛔ TIRÓ: ' + e.message); r = null; }
  afirmar(!!r && r.ok === true, 'devuelve `ok: true` — la relectura final cerró');
}

console.log('\n═══ B · ⭐ el ancla se REEMPLAZA, no se anexa ═══');
{
  const ctx = contexto();
  vm.runInContext('reasignarAnclasDeSecco()', ctx);
  const n1 = ctx.__slides[1].__estado.texto;
  const n2 = ctx.__slides[2].__estado.texto;
  afirmar((n1.match(/#lamina:/g) || []).length === 1,
    '⭐⭐ UNA sola ancla en la slide — anexar dejaría dos y `anclaDeLamina_` leería la vieja');
  afirmar(n1.indexOf('L-052') === -1, 'el id viejo `L-052` ya no está');
  afirmar(/#lamina: L-054/.test(n1), 'y quedó `L-054` — el siguiente libre');
  afirmar(n2.indexOf('Algo escrito por el equipo.') === 0,
    '⭐ el texto del equipo se CONSERVA — `C-01`: la plantilla es del equipo');
  afirmar(/#lamina: L-055/.test(n2) && n2.indexOf('L-053') === -1,
    'y la segunda pasó a `L-055`');
}

console.log('\n═══ C · el id sale de `siguienteIdLamina_`, no escrito a mano ═══');
{
  /* ⭐ Con `L-060` en la hoja, los nuevos tienen que ser `L-061`/`L-062`. Si estuvieran
   * hardcodeados como 054/055, este caso los delata. */
  const ctx = contexto();
  const previas = ctx.leerLaminas_().filas;
  previas.push({ _fila: 99, lamina_id: 'L-060', informe_id: 'jm', seccion_id: 'x', filtro: '' });
  vm.runInContext('reasignarAnclasDeSecco()', ctx);
  afirmar(/#lamina: L-061/.test(ctx.__slides[1].__estado.texto),
    '⭐ con `L-060` en la hoja el siguiente es `L-061` — el contador es `max+1` de la hoja entera');
}

console.log('\n═══ D · los filtros se COPIAN de jm, y no van vacíos ═══');
{
  const ctx = contexto();
  vm.runInContext('reasignarAnclasDeSecco()', ctx);
  const fila = ctx.__escritas[0];
  const iF = HEADERS.indexOf('filtro');
  afirmar(fila[0][iF] === '', 'la copia de `L-052` lleva filtro vacío — entra siempre');
  afirmar(fila[1][iF] === 'tipo=Uno a uno',
    '⭐ la copia de `L-053` lleva `tipo=Uno a uno` — con el filtro vacío se duplicaría de más');
  const iS = HEADERS.indexOf('seccion_id');
  afirmar(fila[0][iS] === 'encuentro' && fila[1][iS] === 'encuentro', 'las dos con `seccion_id = encuentro`');
}

console.log('\n═══ E · la baja borra las CUATRO, de atrás para adelante ═══');
{
  const ctx = contexto();
  vm.runInContext('reasignarAnclasDeSecco()', ctx);
  afirmar(ctx.__borradas.length === 4, 'borra 4 filas (' + ctx.__borradas.length + ')');
  const ordenado = ctx.__borradas.slice().sort((a, b) => b - a);
  afirmar(JSON.stringify(ctx.__borradas) === JSON.stringify(ordenado),
    '⭐ de atrás para adelante — al revés, `deleteRow` corre los índices y borra la fila equivocada');
  const quedan = ctx.__filasFinales()
    .filter((f) => f.informe_id === 'secco' && f.seccion_id === 'encuentro')
    .map((f) => f.lamina_id).sort();
  afirmar(JSON.stringify(quedan) === JSON.stringify(['L-008', 'L-054', 'L-055']),
    '⭐ la sección queda con L-008 + las dos nuevas (' + quedan.join(', ') + ')');
}

console.log('\n═══ F · control NEGATIVO — si el backup falla, NO se toca nada ═══');
{
  /* ⛔ `C-01`: toda migración que escriba sobre una plantilla crea backup antes. El caso mide que
   * el aborto ocurre **antes** de la primera escritura, no que informe el fallo. */
  const ctx = contexto({ backupFalla: true });
  const antes = ctx.__slides[1].__estado.texto;
  const salida = vm.runInContext('reasignarAnclasDeSecco()', ctx);
  afirmar(salida && salida.ok === false, 'devuelve `ok: false`');
  afirmar(ctx.__slides[1].__estado.texto === antes,
    '⭐⭐ la nota de la slide quedó INTACTA — el aborto es antes de escribir, no después');
  afirmar(ctx.__escritas.length === 0 && ctx.__borradas.length === 0,
    '⭐ y no se escribió ni se borró ninguna fila de LAMINAS');
}

console.log('\n═══ G · control NEGATIVO — un ancla que aparece dos veces ABORTA ═══');
{
  /* ⚠ Si la plantilla trajera dos slides con el mismo ancla —que es justo lo que pasa al copiar—
   * elegir «la primera» sería adivinar. Tiene que abortar sin tocar nada. */
  const ctx = contexto();
  ctx.__slides.push(slide('#lamina: L-052'));
  const antes = ctx.__slides[1].__estado.texto;
  const salida = vm.runInContext('reasignarAnclasDeSecco()', ctx);
  afirmar(salida && salida.ok === false, 'aborta con `ok: false`');
  afirmar(ctx.__slides[1].__estado.texto === antes, '⭐ y no tocó ninguna nota');
  afirmar(ctx.__log.join('\n').indexOf('2 slide(s) con ese ancla') !== -1,
    'y el motivo dice CUÁNTAS encontró, no sólo que falló');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
