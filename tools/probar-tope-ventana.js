#!/usr/bin/env node
/**
 * tools/probar-tope-ventana.js — control de `R-30`, el tope de duración para entrar a una ventana
 * por pertenencia. **Fuera de Apps Script y extrayendo el código real de `Fuentes.gs`.**
 *
 * ⭐ **La afirmación que importa es que el tope NO cambie el conjunto cuando está desactivado.**
 * `R-30` toca el camino que alimenta a los ocho `imp_*`, los cuatro `cc_*` y sus `gcba_*`: si el
 * mecanismo apagado no reprodujera exactamente el comportamiento viejo, **movería números que nadie
 * pidió mover** — y el síntoma sería un total distinto sin nada que lo explique.
 *
 * ⚠ **Y la segunda, que es la mitad que este repo aprendió a los golpes: la exclusión se REPORTA.**
 * Un tope que saca cuentas del universo sin decir cuántas ni cuáles es **el mismo modo de falla que
 * `X-29` vino a arreglar, con el signo cambiado**. Por eso se afirma que `tope_dias_aplicado: 0`
 * (desactivado) se distingue de `filas_ref_fuera_por_tope: 0` (activo y no sacó a nadie).
 *
 * **Los datos NO son inventados: son las duraciones medidas el 22/08** sobre los dos fixtures —las
 * cuentas de encuentro del temario y las genéricas que motivaron la regla—. Un fixture inventado
 * probaría que sé leer el `if`, que es justo lo que no hace falta verificar (`CLAUDE.md` §4).
 *
 * Uso:
 *   node tools/probar-tope-ventana.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');

function extraerFuncion(texto, nombre, archivo) {
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse en vez de dar verde sobre otra cosa.');
  }
  let i = texto.indexOf('{', inicio), nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') { nivel--; if (nivel === 0) return texto.slice(inicio, j + 1); }
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

/** Las cuentas medidas el 22/08: encuentros del temario + las genéricas que motivaron `R-30`. */
const CUENTAS = [
  // julio — encuentros del temario
  { id: '3420-JULJDGGC', dias: 5 }, { id: '3387-JULJDGGC', dias: 6 },
  { id: '3389-JULJDGAG', dias: 8 }, { id: '3346-JULJDGAG', dias: 9 },
  { id: '3308-JULJDGAG', dias: 10 }, { id: '3309-JULJDGAG', dias: 10 },
  { id: '3289-JUNJDGAG-jul', dias: 13 }, { id: '3354-JULJDGAG', dias: 21 },
  // agosto — encuentros del temario. El 34 es 3289 con la fecha_fin YA derivada.
  { id: '3527-AGOJDGAG', dias: 5 }, { id: '3488-AGOJDGAG', dias: 7 },
  { id: '3439-JULJDGAG', dias: 17 }, { id: '3487-AGOJDGAG', dias: 18 },
  { id: '3440-JULJDGAG', dias: 22 }, { id: '3389-JULJDGAG-ago', dias: 24 },
  { id: '3289-JUNJDGAG', dias: 34 },
  // las que motivaron la regla
  { id: '2961-ABRSEGGJ', dias: 108 }, { id: '2975-MAYPCCVC', dias: 210 },
  { id: '2976-MAYPCCVC', dias: 210 }, { id: '2145-OCTVINGC', dias: 228 },
  { id: '2322-NOVEDUGC', dias: 259 },
  // sin fecha: NO se descarta, y eso se afirma abajo
  { id: '3336-JULJDGGC', dias: null }
];

const ENCUENTROS = CUENTAS.filter((c) => /JDGAG|JDGGC/.test(c.id) && c.dias !== null);

/** Reproduce el filtro tal como quedó en `calcularConjuntoDeClaves_`: `dias > topeDias` descarta. */
function conjunto(topeDias) {
  const dentro = [], fuera = [];
  CUENTAS.forEach((c) => {
    if (topeDias > 0 && c.dias !== null && c.dias > topeDias) { fuera.push(c.id); return; }
    dentro.push(c.id);
  });
  return { dentro, fuera, tope_dias_aplicado: topeDias > 0 ? topeDias : 0 };
}

let ok = 0, mal = 0;
function af(nombre, cond, det) {
  if (cond) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (det ? ' — ' + det : '')); }
}

console.log('== probar-tope-ventana (R-30) ==');
console.log('');

console.log('1 · ⭐ DESACTIVADO (0) no cambia nada — la afirmación que protege los números de hoy');
{
  const r = conjunto(0);
  af('entran las ' + CUENTAS.length + ' cuentas', r.dentro.length === CUENTAS.length,
    'entraron ' + r.dentro.length);
  af('no saca a ninguna', r.fuera.length === 0);
  af('tope_dias_aplicado = 0 (desactivado)', r.tope_dias_aplicado === 0);
}

console.log('');
console.log('2 · con el tope de 90 — el número que R-30 fija');
{
  const r = conjunto(90);
  af('NINGÚN encuentro del temario queda afuera',
    ENCUENTROS.every((c) => r.dentro.indexOf(c.id) !== -1),
    'quedaron afuera: ' + ENCUENTROS.filter((c) => r.dentro.indexOf(c.id) === -1).map((c) => c.id).join(', '));
  ['2976-MAYPCCVC', '2975-MAYPCCVC', '2145-OCTVINGC', '2322-NOVEDUGC'].forEach((id) => {
    af(id + ' queda AFUERA', r.fuera.indexOf(id) !== -1);
  });
  af('2961-ABRSEGGJ (108 d) queda afuera — el de 332 M, y hay que verificarlo en la corrida',
    r.fuera.indexOf('2961-ABRSEGGJ') !== -1);
  af('el tope se reporta como aplicado', r.tope_dias_aplicado === 90);
}

console.log('');
console.log('3 · ⛔ POR QUÉ NO 30 — la medición que fijó el número');
{
  const r = conjunto(30);
  const cortados = ENCUENTROS.filter((c) => r.fuera.indexOf(c.id) !== -1);
  af('con tope 30 SE CORTA al menos un encuentro real', cortados.length >= 1,
    'si no corta ninguno, la premisa de R-30 cambió y hay que volver a medir');
  af('el cortado es el de 34 días', cortados.some((c) => c.dias === 34),
    'cortados: ' + cortados.map((c) => c.id + '(' + c.dias + 'd)').join(', '));
  af('el margen de 90 sobre el encuentro más largo es ≥ 2×',
    90 / Math.max.apply(null, ENCUENTROS.map((c) => c.dias)) >= 2);
}

console.log('');
console.log('4 · ⚠ una fila SIN fecha no se descarta — no tener fecha no es tener ventana larga');
{
  const r = conjunto(90);
  af('la cuenta sin fecha entra igual', r.dentro.indexOf('3336-JULJDGGC') !== -1);
}

console.log('');
console.log('5 · el código real declara lo que este control asume');
{
  const fn = extraerFuncion(FUENTE, 'calcularConjuntoDeClaves_', 'Fuentes.gs');
  af('lee el tope por `topeDiasVentanaCuenta_()`, no de una constante',
    /topeDias\s*=\s*topeDiasVentanaCuenta_\(\)/.test(fn));
  af('descarta con `dias > topeDias`', /dias\s*>\s*topeDias/.test(fn));
  af('exige las DOS fechas antes de topar (`if (d1 && d2)`)', /if\s*\(d1\s*&&\s*d2\)/.test(fn));
  af('reporta `filas_ref_fuera_por_tope`', /filas_ref_fuera_por_tope:/.test(fn));
  af('reporta `tope_dias_aplicado`', /tope_dias_aplicado:/.test(fn));
  af('reporta QUIÉNES con `claves_fuera_por_tope`', /claves_fuera_por_tope:/.test(fn));

  const lector = extraerFuncion(FUENTE, 'topeDiasVentanaCuenta_', 'Fuentes.gs');
  af('el tope sale de CONFIG, no del código',
    /leerConfig\(\)\.tope_dias_ventana_cuenta/.test(lector));
  af('el default es 0 = desactivado',
    /TOPE_DIAS_VENTANA_CUENTA_DEFECTO_\s*=\s*0/.test(FUENTE),
    'un default distinto de cero movería números en cualquier instalación sin la clave sembrada');
  af('CONFIG lo siembra en 90',
    /tope_dias_ventana_cuenta:\s*'90'/.test(fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8')));
}

console.log('');
console.log('6 · control negativo — que esto sepa ponerse rojo');
{
  const marca = /dias > topeDias/;
  const fn = extraerFuncion(FUENTE, 'calcularConjuntoDeClaves_', 'Fuentes.gs');
  if (!marca.test(fn)) {
    af('el parche exige su marca', false, 'no encontré `dias > topeDias`');
  } else {
    // Invertido: el filtro dejaría pasar lo largo y cortaría lo corto.
    const roto = (t) => {
      const d = [], f = [];
      CUENTAS.forEach((c) => {
        if (t > 0 && c.dias !== null && c.dias < t) { f.push(c.id); return; }
        d.push(c.id);
      });
      return { dentro: d, fuera: f };
    };
    const r = roto(90);
    af('con el comparador invertido, la afirmación 2 se pone roja',
      !ENCUENTROS.every((c) => r.dentro.indexOf(c.id) !== -1),
      'el control no distingue el código bueno del roto: no prueba nada');
  }
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · sobre ' +
  CUENTAS.length + ' cuentas medidas (' + ENCUENTROS.length + ' de encuentro)');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
