#!/usr/bin/env node
/**
 * tools/probar-tipo-en-item.js — **`tipo` viaja del temario al ítem, y un filtro por tipo matchea**
 * (`docs/Prompts/2026-08-21_8_condicion_del_1_a_1.md`, Parte B), fuera de Apps Script y cargando el
 * código real del repo — mismo criterio que `probar-reloj-etapas.js`.
 *
 * ⭐ **Qué estaba roto.** `leerReuniones_` devuelve la fila entera de `REUNIONES` —`tipo` incluido—
 * pero `anclarEncuentrosSinCache_` recortaba el ítem a seis campos y **`tipo` se perdía ahí**, entre
 * la hoja y el generador. `filtrarItemsPorSeccion_` lee los atributos con `e[campo]` sobre ese mismo
 * objeto, así que un `SECCIONES.filtro = tipo=Uno a uno` leía `undefined` y **no matcheaba ninguna
 * fila, sin fallar**. Es el modo de falla de siempre: una sección que emite de menos en silencio.
 *
 * ⚠ **Y por eso el control no mira sólo que el campo exista: mira que el FILTRO matchee.** Que
 * `item.tipo` esté poblado y que `filtrarItemsPorSeccion_` sepa usarlo son dos afirmaciones
 * distintas, y la segunda es la que importa.
 *
 * Uso:
 *   node tools/probar-tipo-en-item.js
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

/** El código de un `.gs`, sin comentarios: los comentarios citan el patrón viejo para explicarlo. */
function codigoDe(archivo) {
  return fs.readFileSync(path.join(RAIZ, archivo), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
}

console.log('`tipo` del temario al ítem — código cargado del repo\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · ⭐ El ítem que arma el anclaje declara `tipo`
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · el ítem del anclaje lleva `tipo`');
{
  const union = codigoDe('Union.gs');
  const m = union.match(/var item = \{[^}]*\}/);

  afirmar(!!m, 'se encontró la construcción del ítem en Union.gs');
  if (m) {
    afirmar(/tipo:\s*reunion\.tipo/.test(m[0]),
      'y declara `tipo: reunion.tipo` — «' + m[0].slice(0, 96) + '…»');

    // ⚠ El control negativo que hace que la de arriba signifique algo: `reunion.tipo` tiene que
    // existir. `leerReuniones_` copia la fila entera, así que sale de la hoja sin recorte.
    const reuniones = codigoDe('Reuniones.gs');
    afirmar(/headers\.forEach\(function \(h, i\) \{ obj\[h\] = fila\[i\]; \}\)/.test(reuniones),
      'y `leerReuniones_` copia la fila entera, así que `reunion.tipo` viene de la hoja');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐ Un filtro por tipo separa los ítems — que es lo que de verdad importa
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Se carga `filtrarItemsPorSeccion_` REAL con el mismo `leerAtributo` que usa `itemsDeSeccion_`
 * para la rama `REUNIONES`, y se le pasan ítems con la forma exacta que arma el anclaje. */
console.log('\n2 · `SECCIONES.filtro = tipo=Uno a uno` separa los ítems');
{
  const ctx = { console, Math, JSON, String, Number, Object, Array, RegExp, isNaN, Error,
                Logger: { log: () => {} } };
  vm.createContext(ctx);
  for (const f of ['Parseo.gs', 'Fuentes.gs', 'Generador.gs']) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
  }

  // La forma exacta del ítem que arma `anclarEncuentrosSinCache_`.
  ctx.__crudos = [
    { reunion: 'Parque Avellaneda', tipo: 'Uno a uno', fecha: '12/08/2026', etapa: '', idCuenta: '3487-AGOJDGAG' },
    { reunion: ': Salud', tipo: 'Encuentro Temático', fecha: '14/08/2026', etapa: '', idCuenta: '' }
  ];
  // Idéntico al de la rama REUNIONES de `itemsDeSeccion_`.
  vm.runInContext(`
    __leer = function (e, campo) {
      return campo === '__clave__' ? (e.reunion + (e.etapa ? ' (' + e.etapa + ')' : '')) : e[campo];
    };`, ctx);

  const filtrar = (filtro) => {
    ctx.__sec = { seccion_id: 'x', filtro: filtro };
    return vm.runInContext('filtrarItemsPorSeccion_(__sec, __crudos, __leer)', ctx);
  };

  const soloU1 = filtrar('tipo=Uno a uno');
  afirmar(soloU1.ok, 'el filtro parsea' + (soloU1.ok ? '' : ' — ' + soloU1.motivo));
  afirmar(soloU1.ok && soloU1.crudos.length === 1 && soloU1.crudos[0].tipo === 'Uno a uno',
    '`tipo=Uno a uno` deja 1 de 2 ítems, y es el correcto');
  afirmar(soloU1.ok && soloU1.excluidos.length === 1 &&
    /Encuentro Tem/.test(soloU1.excluidos[0].item + soloU1.excluidos[0].motivo),
    'y el excluido se REPORTA con su motivo — ninguno desaparece en silencio');

  // El complemento: sin él, un filtro que devolviera siempre uno pasaría la afirmación de arriba.
  const soloTem = filtrar('tipo=Encuentro Temático');
  afirmar(soloTem.ok && soloTem.crudos.length === 1 && soloTem.crudos[0].tipo === 'Encuentro Temático',
    'y el filtro complementario deja el OTRO — no es que siempre devuelva uno');

  // Sin filtro entran los dos, que es el comportamiento de `encuentro` hoy.
  const sinFiltro = filtrar('');
  afirmar(sinFiltro.ok && sinFiltro.crudos.length === 2,
    'sin filtro entran los 2 — `encuentro` no cambia de comportamiento');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⚠ Romper a propósito
 * ══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Se quita `tipo` del ítem y se verifica que el filtro deje de matchear. Sin este bloque, el
 * control no distingue «el filtro anda» de «el filtro devuelve lo que sea». */
console.log('\n3 · romper a propósito: sin `tipo` en el ítem, el filtro no matchea nada');
{
  const ctx = { console, Math, JSON, String, Number, Object, Array, RegExp, isNaN, Error,
                Logger: { log: () => {} } };
  vm.createContext(ctx);
  for (const f of ['Parseo.gs', 'Fuentes.gs', 'Generador.gs']) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
  }
  // Los mismos ítems, con el recorte de antes: seis campos y sin `tipo`.
  ctx.__crudos = [
    { reunion: 'Parque Avellaneda', fecha: '12/08/2026', etapa: '', idCuenta: '3487-AGOJDGAG' },
    { reunion: ': Salud', fecha: '14/08/2026', etapa: '', idCuenta: '' }
  ];
  vm.runInContext(`
    __leer = function (e, campo) {
      return campo === '__clave__' ? (e.reunion + (e.etapa ? ' (' + e.etapa + ')' : '')) : e[campo];
    };
    __sec = { seccion_id: 'x', filtro: 'tipo=Uno a uno' };`, ctx);
  const r = vm.runInContext('filtrarItemsPorSeccion_(__sec, __crudos, __leer)', ctx);

  afirmar(r.ok && r.crudos.length === 0,
    'con el ítem viejo el filtro deja 0 de 2 — la sección habría emitido NADA');
  afirmar(r.ok && r.excluidos.length === 2,
    'y los dos salen como excluidos: el reporte lo dice, pero el deck sale vacío igual');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Qué `tipo` traen las filas vivas de `REUNIONES`. Acá van fijos para recorrer los');
console.log('     casos; al 21/08 la hoja dice "Uno a uno" y "Encuentro Temático", con esa grafía.');
console.log('   · Que una LÁMINA distinta entre según el tipo. Eso necesita que el generador lea');
console.log('     `LAMINAS`, y hoy no la lee en absoluto — sólo la leen el censo y el sellador.');

process.exit(fallas === 0 ? 0 : 1);
