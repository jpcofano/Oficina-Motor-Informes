#!/usr/bin/env node
/**
 * tools/probar-anclaje-dos-pasos.js — control positivo del anclaje en dos pasos
 * (`docs/Prompts/2026-08-20_8_anclaje_dos_pasos.md`, Parte B), **sin planilla** y extrayendo el
 * código real de `Union.gs`.
 *
 * ⭐ **La afirmación que distingue "buscó en dos pasos" de "buscó una vez en el conjunto grande" es
 * la 3, no la 2.** Un control que sólo mire el resultado final pasaría igual con las dos
 * implementaciones — y son distintas: con la segunda, el resultado depende de un número de
 * `CONFIG` en vez de los datos.
 *
 * Uso:
 *   node tools/probar-anclaje-dos-pasos.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

function extraerFuncion(archivo, nombre) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  let i = texto.indexOf('{', inicio);
  if (i === -1) throw new Error('Función ' + nombre + ' sin cuerpo en ' + archivo);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, j + 1);
    }
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

// `CONFIG` se stubea porque acá no hay planilla; es lo único que se reemplaza. Las dos funciones
// de ventana y el filtro de cercanía se extraen REALES, así que si alguien les cambia la
// semántica —por ejemplo el `Math.abs` que hace la ventana simétrica— esta prueba se entera.
let CONFIG = {};
const preludio = 'function leerConfig() { return CONFIG_STUB; }\n';

const cuerpo = preludio +
  extraerFuncion('Union.gs', 'ventanaCandidatosAnclajeDias_') + '\n' +
  extraerFuncion('Union.gs', 'ventanaCandidatosAnclajeAmpliadaDias_') + '\n' +
  extraerFuncion('Union.gs', 'candidatosCercanosPorFecha_') + '\n' +
  extraerFuncion('Union.gs', 'anclarEnDosPasos_') + '\n' +
  'var VENTANA_DIAS_CANDIDATOS_ANCLAJE_DEFECTO_ = 14;\n';

let llamadasAAnclar = [];
function construir(cfg) {
  llamadasAAnclar = [];
  // `anclar_` se instrumenta a propósito: la afirmación "el paso 2 NO corrió" no se puede hacer
  // mirando el resultado, sólo contando las llamadas.
  const anclarFalso = function (cands, _x, umbral, puntuar) {
    llamadasAAnclar.push(cands.length);
    let mejor = null, score = 0;
    cands.forEach(function (c) {
      const s = puntuar(c);
      if (s > score) { score = s; mejor = c; }
    });
    return { mejor: mejor, score: score, pasaUmbral: score >= umbral, ambiguo: false };
  };
  // eslint-disable-next-line no-new-func
  return new Function('CONFIG_STUB', 'anclar_',
    cuerpo + '\nreturn { anclarEnDosPasos_, candidatosCercanosPorFecha_, ventanaCandidatosAnclajeAmpliadaDias_ };'
  )(cfg, anclarFalso);
}

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  OK  ' + mensaje);
  else { fallas++; console.log('  XX  ' + mensaje); }
}

const dia = (d) => new Date(2026, 7, d);
const cand = (id, d, score) => ({ idCuenta: id, nombreCampana: id, parseado: { fecha: dia(d) }, _score: score });
const puntuarPorCampo = (c) => c._score;
const ENCUENTRO = dia(20);   // jueves 20/08

console.log('Control positivo del anclaje en dos pasos — código extraído de Union.gs\n');

/* ── 1 · un candidato dentro del acotado se resuelve en el paso 1, y el paso 2 NO corre ─────── */
console.log('1 · el paso 1 resuelve, y el 2 no corre');
{
  const M = construir({ umbral_anclaje_reunion: 0.6, ventana_candidatos_anclaje_dias: 14, ventana_candidatos_anclaje_ampliada_dias: 40 });
  const r = M.anclarEnDosPasos_([cand('cerca', 19, 0.9), cand('lejos', 1, 0.95)], ENCUENTRO, 0.6, puntuarPorCampo);
  afirmar(r.mejor && r.mejor.idCuenta === 'cerca', 'ancla el candidato cercano — vino ' + (r.mejor && r.mejor.idCuenta));
  afirmar(r.paso === 1, 'y declara que lo resolvió el paso 1 — vino ' + r.paso);
  // ⭐ La mitad que no se puede ver en el resultado: que el segundo paso no se ejecutó.
  afirmar(llamadasAAnclar.length === 1,
    'el paso 2 NO corrió: una sola llamada a `anclar_` — vinieron ' + llamadasAAnclar.length);
}

/* ── 2 · un candidato a 10 días, fuera del acotado, se encuentra en el paso 2 ────────────────
 * ⚠ Con la ventana acotada REAL (14 días) los 10 quedan adentro, así que este caso se arma con
 * una acotada chica a propósito: lo que se prueba es el MECANISMO, no el número de `CONFIG`. */
console.log('2 · el paso 2 encuentra lo que el acotado dejó afuera');
{
  const M = construir({ umbral_anclaje_reunion: 0.6, ventana_candidatos_anclaje_dias: 3, ventana_candidatos_anclaje_ampliada_dias: 20 });
  const r = M.anclarEnDosPasos_([cand('a10dias', 10, 0.9)], ENCUENTRO, 0.6, puntuarPorCampo);
  afirmar(r.mejor && r.mejor.idCuenta === 'a10dias', 'lo encuentra — vino ' + (r.mejor && r.mejor.idCuenta));
  afirmar(r.paso === 2, 'y dice que fue el paso 2 — vino ' + r.paso);
  afirmar(llamadasAAnclar.length === 2, 'corrieron los dos pasos — vinieron ' + llamadasAAnclar.length);
  afirmar(r.candidatos_paso1 === 0 && r.candidatos_paso2 === 1,
    'y la traza dice cuántos candidatos entraron en cada paso: ' + r.candidatos_paso1 + ' y ' + r.candidatos_paso2);
}

/* ── 3 · ⭐ DETERMINISMO: lo que el paso 1 resuelve queda resuelto ──────────────────────────
 * El conjunto ampliado tiene un candidato de MEJOR score. Gana igual el del paso 1. Sin esta
 * afirmación la regla de corte es una intención y no un comportamiento. */
console.log('3 · determinismo — un mejor candidato en el ampliado NO desplaza al del paso 1');
{
  const M = construir({ umbral_anclaje_reunion: 0.6, ventana_candidatos_anclaje_dias: 3, ventana_candidatos_anclaje_ampliada_dias: 40 });
  const r = M.anclarEnDosPasos_([cand('delPaso1', 21, 0.7), cand('mejorPeroLejos', 1, 0.99)], ENCUENTRO, 0.6, puntuarPorCampo);
  afirmar(r.mejor && r.mejor.idCuenta === 'delPaso1',
    'gana el del paso 1 aunque el ampliado tenga uno mejor — vino ' + (r.mejor && r.mejor.idCuenta));
  afirmar(r.paso === 1, 'y el paso 2 ni se intentó — paso=' + r.paso);
  afirmar(llamadasAAnclar.length === 1, 'una sola llamada a `anclar_`');

  // Y el corolario que lo vuelve útil: el resultado NO depende del número de CONFIG.
  const M2 = construir({ umbral_anclaje_reunion: 0.6, ventana_candidatos_anclaje_dias: 3, ventana_candidatos_anclaje_ampliada_dias: 400 });
  const r2 = M2.anclarEnDosPasos_([cand('delPaso1', 21, 0.7), cand('mejorPeroLejos', 1, 0.99)], ENCUENTRO, 0.6, puntuarPorCampo);
  afirmar(r2.mejor.idCuenta === 'delPaso1',
    'con la ampliada en 400 días da lo MISMO: el resultado no depende de `CONFIG`');
}

/* ── 4 · sin candidato en ninguno de los dos pasos ──────────────────────────────────────────── */
console.log('4 · sin candidato en ninguno de los dos');
{
  const M = construir({ umbral_anclaje_reunion: 0.6, ventana_candidatos_anclaje_dias: 3, ventana_candidatos_anclaje_ampliada_dias: 20 });
  const r = M.anclarEnDosPasos_([], ENCUENTRO, 0.6, puntuarPorCampo);
  afirmar(!r.mejor && r.score === 0, 'no ancla nada, score 0 — el llamador lo manda a `sinLink`');
  afirmar(r.paso === 1, 'y no se inventa un paso 2 sobre un conjunto vacío');
}

/* ── 5 · la ampliada vacía se comporta EXACTAMENTE como hoy ─────────────────────────────────
 * Es la garantía de que el cambio se puede apagar desde `CONFIG` sin tocar código. */
console.log('5 · la ampliada vacía = el comportamiento de siempre');
{
  const M = construir({ umbral_anclaje_reunion: 0.6, ventana_candidatos_anclaje_dias: 3, ventana_candidatos_anclaje_ampliada_dias: '' });
  afirmar(M.ventanaCandidatosAnclajeAmpliadaDias_() === null, 'vacía devuelve `null`, que significa no ampliar');
  const r = M.anclarEnDosPasos_([cand('a10dias', 10, 0.9)], ENCUENTRO, 0.6, puntuarPorCampo);
  afirmar(!r.mejor, 'el candidato de 10 días NO se encuentra: es lo que hace el motor hoy');
  afirmar(llamadasAAnclar.length === 1, 'y el paso 2 no existe — una sola llamada');

  // Una ampliada más chica que la acotada tampoco amplía nada.
  const M2 = construir({ umbral_anclaje_reunion: 0.6, ventana_candidatos_anclaje_dias: 14, ventana_candidatos_anclaje_ampliada_dias: 5 });
  M2.anclarEnDosPasos_([cand('x', 10, 0.9)], ENCUENTRO, 0.6, puntuarPorCampo);
  afirmar(llamadasAAnclar.length === 1, 'una ampliada MENOR que la acotada no dispara el paso 2');
}

/* ── 6 · la ventana de cercanía es SIMÉTRICA, y eso es lo que hace que los 10 días ya entren ──
 * Es la medición de la Parte 0 convertida en afirmación: si alguien la vuelve asimétrica, esta
 * prueba se entera antes que un deck. */
console.log('6 · ±14 días, simétrica — los 10 días del negocio ya están adentro');
{
  const M = construir({ ventana_candidatos_anclaje_dias: 14, ventana_candidatos_anclaje_ampliada_dias: '' });
  const antes = M.candidatosCercanosPorFecha_([cand('diez_antes', 10, 1)], ENCUENTRO, 14);
  const despues = M.candidatosCercanosPorFecha_([cand('diez_despues', 30, 1)], ENCUENTRO, 14);
  afirmar(antes.length === 1, 'una campaña que arrancó 10 días ANTES entra en el acotado de 14');
  afirmar(despues.length === 1, 'y una 10 días DESPUÉS también: la ventana es simétrica');
  const lejos = M.candidatosCercanosPorFecha_([cand('quince', 5, 1)], ENCUENTRO, 14);
  afirmar(lejos.length === 0, 'a 15 días queda afuera, que es el borde');

  // Un candidato sin fecha parseable pasa siempre (fallback), y eso no cambió.
  const sinFecha = M.candidatosCercanosPorFecha_([{ idCuenta: 'x', parseado: {} }], ENCUENTRO, 14);
  afirmar(sinFecha.length === 1, 'un candidato sin fecha parseable sigue pasando el prefiltro');
}

console.log('\n' + (fallas === 0
  ? 'TODO EN VERDE. Dos pasos, con la regla de corte sosteniendo el determinismo.'
  : 'FALLAN ' + fallas + ' afirmacion(es).'));
process.exit(fallas === 0 ? 0 : 1);
