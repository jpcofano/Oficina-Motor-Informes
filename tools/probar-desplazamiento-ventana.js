#!/usr/bin/env node
/**
 * tools/probar-desplazamiento-ventana.js — **el desplazamiento de ventana por solapa** (`R-20`,
 * Parte A del `2026-09-06_1`).
 *
 * ⛔⛔ **El defecto que motiva todo esto NO es un número mal: es un CONTEO QUE COINCIDE SOBRE LAS
 * FILAS EQUIVOCADAS.** Sobre `reuniones / Agenda funcionarios`, la ventana `28/08–03/09` devuelve
 * **7 filas y son otras siete** —sobra Fernán Quirós, falta Ezequiel Sabor—, así que
 * `emin_encuentros = 7` **da verde**: dos diferencias que se cancelan en el total.
 *
 * ⭐⭐ **Por eso la sección C compara IDENTIDAD y no `length`.** Un banco que afirmara *«siguen
 * siendo 7»* **repetiría exactamente el error que viene a arreglar** — y pasaría.
 *
 * ⚠ **Las funciones son las REALES, extraídas de `Fuentes.gs`**, no copias. El fixture de filas es
 * sintético **a propósito**: la solapa viva no está en el repo, y lo que se prueba acá es el
 * **mecanismo** —que correr la ventana cambia qué filas entran—, no el dato de esta semana.
 *
 * Uso:  node tools/probar-desplazamiento-ventana.js
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
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

const FUE = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
function extraer(firma) {
  const i = FUE.indexOf(firma);
  if (i === -1) throw new Error('no encontré `' + firma + '`');
  const fin = FUE.indexOf('\n}', i);
  if (fin === -1) throw new Error('no cerró `' + firma + '`');
  return FUE.slice(i, fin + 2);
}

/* El mapa de `SOLAPAS` que el banco controla, en vez de la hoja. */
let SOLAPAS = {};
/* ⚠⚠ `Date` se PASA al contexto, y no es cosmética: un `vm` tiene su propio realm, así que un
 * `Date` construido acá afuera **no es `instanceof Date` adentro** y `correrFechaDias_` lo
 * devolvería sin tocar. La primera corrida de este banco falló ocho afirmaciones **por eso** —
 * el motor estaba bien y el instrumento medía su propio arnés (`CLAUDE.md` §4: *el instrumento es
 * parte del sistema*). ⭐ En Apps Script hay un solo realm, así que el `instanceof` del motor es
 * correcto y **el que se adapta es el banco**, nunca al revés. */
const ctx = { leerSolapas: () => SOLAPAS, Date: Date };
vm.createContext(ctx);
/* ⭐ La constante también se EXTRAE, no se copia: si alguien renombra una columna en
 * `Fuentes.gs` y el banco tuviera su propia copia, seguiría verde midiendo el nombre viejo. */
function extraerVar(nombre) {
  const i = FUE.indexOf('var ' + nombre);
  if (i === -1) throw new Error('no encontré `var ' + nombre + '`');
  return FUE.slice(i, FUE.indexOf('\n', i) + 1);
}

vm.runInContext([
  extraerVar('COLUMNAS_DESPLAZAMIENTO_'),
  extraer('function diasDeDesplazamiento_'),
  extraer('function desplazamientoDeVentana_'),
  extraer('function correrFechaDias_'),
  extraer('function aplicarDesplazamientoVentana_')
].join('\n\n'), ctx);
const { desplazamientoDeVentana_, aplicarDesplazamientoVentana_ } = ctx;

const d = (iso) => new Date(iso + 'T12:00:00');
const iso = (x) => x.toISOString().slice(0, 10);
function ponerSolapa(campos) { SOLAPAS = { reuniones: { 'Agenda funcionarios': campos } }; }
const VENTANA = { ok: true, desde: d('2026-08-28'), hasta: d('2026-09-03'), origen: 'periodo' };

console.log('═══ A · ⭐⭐ NEUTRALIDAD — con las columnas vacías NADA cambia ═══');
{
  ponerSolapa({ uso: 'fuente' });                       // ni la columna existe
  const r1 = desplazamientoDeVentana_('reuniones', 'Agenda funcionarios');
  afirmar(r1.ok && r1.desde === 0 && r1.hasta === 0, 'columnas AUSENTES ⇒ 0 y 0');
  afirmar(aplicarDesplazamientoVentana_(VENTANA, r1) === VENTANA,
    '⭐⭐ y devuelve LA MISMA REFERENCIA — el no-op es exacto, no «equivalente»');

  ponerSolapa({ uso: 'fuente', ventana_desde_dias: '', ventana_hasta_dias: '   ' });
  const r2 = desplazamientoDeVentana_('reuniones', 'Agenda funcionarios');
  afirmar(r2.ok && r2.desde === 0 && r2.hasta === 0, 'columnas VACÍAS (y con espacios) ⇒ 0 y 0');

  ponerSolapa({ uso: 'fuente', ventana_desde_dias: 0, ventana_hasta_dias: 0 });
  const r3 = desplazamientoDeVentana_('reuniones', 'Agenda funcionarios');
  afirmar(aplicarDesplazamientoVentana_(VENTANA, r3) === VENTANA, 'con `0` explícito, ídem');

  /* ⚠ Control negativo de la neutralidad: si el banco no distinguiera, esto también pasaría. */
  ponerSolapa({ uso: 'fuente', ventana_desde_dias: -3, ventana_hasta_dias: -2 });
  const r4 = desplazamientoDeVentana_('reuniones', 'Agenda funcionarios');
  afirmar(aplicarDesplazamientoVentana_(VENTANA, r4) !== VENTANA,
    '⭐ y con `-3/-2` NO devuelve la misma — la afirmación de arriba distingue algo');
  afirmar(VENTANA.desde.getTime() === d('2026-08-28').getTime(),
    '⭐⭐ y la ventana original NO se mutó — se devuelve una copia');
}

console.log('\n═══ B · APLICACIÓN — el rango resultante es el esperado ═══');
{
  ponerSolapa({ uso: 'fuente', ventana_desde_dias: -3, ventana_hasta_dias: -2 });
  const desp = desplazamientoDeVentana_('reuniones', 'Agenda funcionarios');
  const v = aplicarDesplazamientoVentana_(VENTANA, desp);
  afirmar(iso(v.desde) === '2026-08-25', '`28/08` con `-3` → ' + iso(v.desde));
  afirmar(iso(v.hasta) === '2026-09-01', '`03/09` con `-2` → ' + iso(v.hasta));
  afirmar(v.origen === 'periodo', '⭐ los demás campos de la ventana viajan intactos');

  /* ⭐ Las dos puntas se mueven distinto: es la razón de que sean DOS columnas. */
  ponerSolapa({ uso: 'fuente', ventana_desde_dias: -3, ventana_hasta_dias: 0 });
  const v2 = aplicarDesplazamientoVentana_(VENTANA, desplazamientoDeVentana_('reuniones', 'Agenda funcionarios'));
  afirmar(iso(v2.desde) === '2026-08-25' && iso(v2.hasta) === '2026-09-03',
    '⭐⭐ una punta sola se mueve y la otra NO — un solo número no podría expresarlo');

  ponerSolapa({ uso: 'fuente', ventana_desde_dias: 2, ventana_hasta_dias: 5 });
  const v3 = aplicarDesplazamientoVentana_(VENTANA, desplazamientoDeVentana_('reuniones', 'Agenda funcionarios'));
  afirmar(iso(v3.desde) === '2026-08-30' && iso(v3.hasta) === '2026-09-08', 'positivos también');

  /* ⚠ Cruce de mes y de año: `setDate` lo resuelve, la aritmética de ms no siempre. */
  const fin = { desde: d('2026-12-30'), hasta: d('2026-12-31') };
  ponerSolapa({ uso: 'fuente', ventana_desde_dias: 3, ventana_hasta_dias: 3 });
  const v4 = aplicarDesplazamientoVentana_(fin, desplazamientoDeVentana_('reuniones', 'Agenda funcionarios'));
  afirmar(iso(v4.desde) === '2027-01-02' && iso(v4.hasta) === '2027-01-03', '⭐ cruza el año bien');
}

console.log('\n═══ C · ⭐⭐ IDENTIDAD, NO CONTEO — cambia QUÉ filas entran, no cuántas ═══');
{
  /* ⭐⭐ El fixture está armado para que el conteo NO distinga: con la ventana original entran 3
   * filas y con la corrida entran 3 también, **pero son otras**. Es la forma exacta del defecto
   * real —sobra uno, falta otro, el total coincide— y un banco que comparara `length` PASARÍA. */
  const filas = [
    { quien: 'Sabor',   fecha: d('2026-08-26') },   // sólo con la ventana CORRIDA
    { quien: 'Bou',     fecha: d('2026-08-29') },   // en las dos
    { quien: 'Giordano',fecha: d('2026-08-31') },   // en las dos
    { quien: 'Quirós',  fecha: d('2026-09-02') }    // sólo con la ventana ORIGINAL
  ];
  const entran = (v) => filas.filter(f => f.fecha >= v.desde && f.fecha <= v.hasta)
    .map(f => f.quien).sort();

  ponerSolapa({ uso: 'fuente', ventana_desde_dias: -3, ventana_hasta_dias: -2 });
  const corrida = aplicarDesplazamientoVentana_(VENTANA, desplazamientoDeVentana_('reuniones', 'Agenda funcionarios'));
  const antes = entran(VENTANA), despues = entran(corrida);
  console.log('     sin correr : ' + antes.join(', '));
  console.log('     corrida    : ' + despues.join(', '));

  afirmar(antes.length === despues.length,
    '⚠ el CONTEO coincide (' + antes.length + ' = ' + despues.length + ') — y por eso NO sirve');
  afirmar(antes.join('|') !== despues.join('|'),
    '⭐⭐ y las LISTAS diferen ⇒ el desplazamiento cambió QUÉ filas entran');
  afirmar(despues.indexOf('Sabor') !== -1 && antes.indexOf('Sabor') === -1,
    '⭐ entra el que faltaba (`Sabor`), que sin correr quedaba afuera');
  afirmar(antes.indexOf('Quirós') !== -1 && despues.indexOf('Quirós') === -1,
    '⭐ y sale el que sobraba (`Quirós`), cuyo encuentro cae fuera de la semana');
  afirmar(despues.indexOf('Bou') !== -1 && despues.indexOf('Giordano') !== -1,
    '   los dos del medio siguen en las dos ventanas');
}

console.log('\n═══ D · ⛔ un valor ilegible es `«FALTA:…»`, NO un `0` silencioso ═══');
{
  ['tres', '-3.5', '1/3', 'abc', '--3'].forEach(malo => {
    ponerSolapa({ uso: 'fuente', ventana_desde_dias: malo });
    const r = desplazamientoDeVentana_('reuniones', 'Agenda funcionarios');
    afirmar(!r.ok && /^«FALTA:ventana_desde_dias@/.test(r.motivo || ''),
      JSON.stringify(malo) + ' → ' + (r.ok ? '⛔ pasó como ' + r.desde : 'hueco visible'));
  });
  /* ⭐ Y la mitad negativa: los legales NO pueden dar hueco. Sin esto, un validador que
   * devolviera `false` siempre pasaría el bloque de arriba. */
  [-3, '0', '  2  ', 7, '-10'].forEach(bueno => {
    ponerSolapa({ uso: 'fuente', ventana_desde_dias: bueno });
    afirmar(desplazamientoDeVentana_('reuniones', 'Agenda funcionarios').ok,
      '⭐ ' + JSON.stringify(bueno) + ' es legal y NO da hueco');
  });
  /* ⚠ Y la punta de FIN se valida igual que la de inicio — es la clase de asimetría que
   * pasa inadvertida cuando se copia una guarda y se olvida la otra. */
  ponerSolapa({ uso: 'fuente', ventana_desde_dias: 0, ventana_hasta_dias: 'dos' });
  const rf = desplazamientoDeVentana_('reuniones', 'Agenda funcionarios');
  afirmar(!rf.ok && /ventana_hasta_dias@/.test(rf.motivo || ''),
    '⭐⭐ la punta de FIN también valida, y el hueco NOMBRA su columna');
}

console.log('\n═══ E · una solapa que no está en `SOLAPAS` ═══');
{
  SOLAPAS = {};
  const r = desplazamientoDeVentana_('reuniones', 'Agenda funcionarios');
  afirmar(r.ok && r.desde === 0 && r.hasta === 0,
    '⚠ sin fila en SOLAPAS ⇒ 0 y 0, no un error — el desplazamiento no es obligatorio');
}

console.log('');
console.log('⚠ Lo que este verde NO dice: qué filas trae la solapa viva. El fixture es sintético');
console.log('  y prueba el MECANISMO. El valor de la Agenda lo carga el usuario, y su celda');
console.log('  nace vacía a propósito.');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ Las ' + afirmaciones + ' afirmaciones pasaron');
