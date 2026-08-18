#!/usr/bin/env node
/**
 * tools/probar-campanas.js — control positivo de `CAMPANAS` como lista (18/08/2026).
 *
 * **Lo que prueba, y es una sola cosa: que ya no se pierden filas.** La clave `campana_id` era
 * falsa por tres motivos a la vez —la campaña se elige cada semana, no pertenece a un informe, y
 * por eso la identidad es la fila— y el lector viejo dejaba **una sola** de cada grupo, sin error.
 *
 * ⚠ **El caso 1 reproduce el lector VIEJO** para que la prueba muestre la pérdida en vez de
 * afirmarla. Sin eso, el resto de las afirmaciones son verdes que no dicen contra qué mejoraron.
 *
 * Los tres casos salen de campañas reales, con evidencia en los decks del repo:
 *   1. «Declaración de servicios esenciales» — período declarado **24/06–08/07**, dos semanas.
 *   2. «Programas y actividades para personas mayores» — sale en el deck de `jm` **y** en el de
 *      `secco` de la misma semana. **Es la que el lector viejo perdía.**
 *   3. «Egreso de mil cadetes» — informe 24/07–31/07.
 *
 * ⚠ **El sistema de archivos y la planilla NO se tocan:** se extrae `filasDeCampana_` del repo y
 * se le inyecta la lista. No hay red, no hay Apps Script, no hay disco.
 *
 * Uso:
 *   node tools/probar-campanas.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

function extraerFuncion(archivo, nombre) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) throw new Error('No encontré `function ' + nombre + '(` en ' + archivo);
  let i = texto.indexOf('{', inicio);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') { nivel--; if (nivel === 0) return texto.slice(inicio, j + 1); }
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

/* Un solo scope, como concatena Apps Script. `leerCampanas` se inyecta. */
let CAMPANAS = [];
const cuerpo = [
  extraerFuncion('Fuentes.gs', 'normalizarValorDeclarado_'),
  extraerFuncion('Config.gs', 'filasDeCampana_')
].join('\n\n');
// eslint-disable-next-line no-new-func
const filasDeCampana_ = new Function('leerCampanas',
  cuerpo + '\nreturn filasDeCampana_;')(() => CAMPANAS);

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/** El lector VIEJO, reproducido: `registro[clave] = obj` recorriendo filas. */
function lectorViejo(filas) {
  const registro = {};
  filas.forEach((f) => { if (f.campana_id) registro[f.campana_id] = f; });
  return registro;
}

const FILAS = [
  // (1) la misma campaña, dos semanas — su período declarado abarca las dos.
  { periodo_id: '2026-W26', campana_id: 'serv_esenciales', nombre: 'Declaración de servicios esenciales', informe_id: 'jm', desde: '2026-06-24', hasta: '2026-07-08', mostrar: 'sí', orden: 1 },
  { periodo_id: '2026-W27', campana_id: 'serv_esenciales', nombre: 'Declaración de servicios esenciales', informe_id: 'jm', desde: '2026-06-24', hasta: '2026-07-08', mostrar: 'sí', orden: 1 },
  // (2) la misma campaña, misma semana, DOS INFORMES — la que el lector viejo perdía.
  { periodo_id: '2026-W26', campana_id: 'personas_mayores', nombre: 'Programas y actividades para personas mayores', informe_id: 'jm', desde: '2026-06-19', hasta: '2026-07-17', mostrar: 'sí', orden: 2 },
  { periodo_id: '2026-W26', campana_id: 'personas_mayores', nombre: 'Programas y actividades para personas mayores', informe_id: 'secco', desde: '2026-06-19', hasta: '2026-07-17', mostrar: 'sí', orden: 2 },
  // (3) una sola fila, el caso simple que no puede romperse.
  { periodo_id: '2026-W30', campana_id: 'mil_cadetes', nombre: 'Egreso de mil cadetes', informe_id: 'jm', desde: '2026-07-24', hasta: '2026-07-31', mostrar: 'sí', orden: 3 }
];
CAMPANAS = FILAS;

console.log('Control positivo de CAMPANAS como lista — código extraído de Config.gs y Fuentes.gs\n');

/* ── 1 · el lector VIEJO perdía filas, y acá se ve ────────────────────────────────────────── */
console.log('1 · el lector viejo (mapa por campana_id) pierde filas — la referencia de la mejora');
{
  const viejo = lectorViejo(FILAS);
  afirmar(Object.keys(viejo).length === 3, '5 filas entran, quedan 3 claves — vino ' + Object.keys(viejo).length);
  afirmar(viejo['serv_esenciales'].periodo_id === '2026-W27',
    'de las dos semanas sobrevive la ÚLTIMA, en silencio — quedó ' + viejo['serv_esenciales'].periodo_id);
  afirmar(viejo['personas_mayores'].informe_id === 'secco',
    'y de los dos informes sobrevive el ÚLTIMO: el de `jm` desaparece — quedó ' + viejo['personas_mayores'].informe_id);
  afirmar(FILAS.length - Object.keys(viejo).length === 2, 'se perdían 2 de 5 filas, sin error');
}

/* ── 2 · la lista las conserva todas ──────────────────────────────────────────────────────── */
console.log('\n2 · la lista conserva las cinco');
{
  afirmar(CAMPANAS.length === 5, 'cinco filas — vino ' + CAMPANAS.length);
  afirmar(filasDeCampana_('serv_esenciales').length === 2, '(1) dos semanas conviven');
  afirmar(filasDeCampana_('personas_mayores').length === 2, '(2) dos informes conviven — el caso que se perdía');
  afirmar(filasDeCampana_('mil_cadetes').length === 1, '(3) la de una fila sigue dando una');
}

/* ── 3 · el `periodo_id` desambigua ───────────────────────────────────────────────────────── */
console.log('\n3 · con periodo_id se resuelve a UNA fila');
{
  const w26 = filasDeCampana_('serv_esenciales', '2026-W26');
  afirmar(w26.length === 1 && w26[0].periodo_id === '2026-W26', 'W26 devuelve su propia fila');
  const w27 = filasDeCampana_('serv_esenciales', '2026-W27');
  afirmar(w27.length === 1 && w27[0].periodo_id === '2026-W27', 'W27 devuelve la otra');
  // El control negativo: sin periodo_id NO se resuelve a una, y eso tiene que seguir siendo así.
  afirmar(filasDeCampana_('serv_esenciales').length === 2,
    'sin periodo_id siguen siendo 2 — el consumidor tiene que fallar por ambigua, no elegir');
}

/* ── 4 · el caso que sigue siendo ambiguo, y DEBE serlo ───────────────────────────────────── */
console.log('\n4 · (campana_id, periodo_id) repetido sigue siendo ambiguo — es un duplicado real');
{
  afirmar(filasDeCampana_('personas_mayores', '2026-W26').length === 2,
    'dos filas con el mismo par: la hoja tiene un duplicado y el motor tiene que decirlo');
}

/* ── 5 · normalización de los dos lados (`R-10`) ──────────────────────────────────────────── */
console.log('\n5 · se normalizan los dos lados (R-10)');
{
  afirmar(filasDeCampana_('  serv_esenciales ').length === 2, 'espacios de más no rompen el match');
  afirmar(filasDeCampana_('serv_esenciales', ' 2026-W26 ').length === 1, 'tampoco en el periodo_id');
  afirmar(filasDeCampana_('SERV_esenciales').length === 0,
    'el case NO se pliega: R-10 preserva mayúsculas');
}

/* ── 6 · una campaña que no existe da cero, no una excepción ──────────────────────────────── */
console.log('\n6 · lo que no existe da cero');
{
  afirmar(filasDeCampana_('no_existe').length === 0, 'cero filas, sin romper');
}

console.log('\n' + (fallas === 0
  ? '✅ Todo en verde. Las 2 filas que el lector viejo perdía ahora sobreviven.'
  : '❌ ' + fallas + ' afirmación(es) fallando.'));
process.exit(fallas === 0 ? 0 : 1);
