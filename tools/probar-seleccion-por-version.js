#!/usr/bin/env node
/**
 * tools/probar-seleccion-por-version.js — **la rama `CAMPANAS` selecciona por VERSIÓN del informe**
 * (`D-53`, `docs/Prompts/2026-08-31_3_seccion_repetible_duplicada.md` Parte B).
 *
 * ⛔ **El bug que fija.** `itemsDeSeccion_` exigía que `periodo_id` **no estuviera vacío** y nada
 * más. Con dos filas de la misma campaña —una por versión del informe— emitía **dos ítems**, y el
 * deck del 31/08 salió con **nueve láminas duplicadas**: los slides 13–21 repetidos en 22–30.
 *
 * ⭐⭐ **Por qué ninguna afirmación existente lo tocaba, que es la mitad que importa.** Los dos
 * bancos que ejercitan esta rama —`probar-cuenta-de-campana.js` y `probar-baja-confianza-entra.js`—
 * llaman `itemsDeSeccion_(s, 'jm', null)`. **Con ventana `null` no se filtra**, así que los dos
 * siguen verdes **sin medir nada de esto**. Es la familia del testigo insensible: un control que no
 * distingue el antes del después no es control, y por eso esto va en banco propio en vez de
 * aflojar o ensanchar los que ya están.
 *
 * ⚠ **Lo que NO prueba:** que el deck salga con 23 láminas. Eso es una corrida, y se cruza contra
 * `docs/_snapshots/TESTIGO_estructura_2026-08-31_*.md`.
 *
 * Uso:
 *   node tools/probar-seleccion-por-version.js
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

/* Las dos filas REALES de `CAMPANAS` viva al 31/08, copiadas de
 * `docs/_snapshots/CAMPANAS_2026-08-31.tsv` — no inventadas. Son la misma campaña bajo dos
 * versiones del informe, que es exactamente el caso que produjo el deck duplicado. */
const CAMPANAS_VIVAS = [
  {
    periodo_id: '2026_agosto_21_27', campana_id: '3512-AGOSEGGJ',
    nombre: 'Operativo Movilidad Más Segura', informe_id: 'jm', base_id: 'digital',
    tipo: 'destacada', mostrar: 'sí', id_cuenta: '3512-AGOSEGGJ', orden: ''
  },
  {
    periodo_id: '2026_agosto_21_28', campana_id: '3512-AGOSEGGJ',
    nombre: 'Operativo Movilidad Más Segura', informe_id: 'jm', base_id: 'digital',
    tipo: 'destacada', mostrar: 'sí', id_cuenta: '3512-AGOSEGGJ', orden: ''
  }
];

/* ⭐ **El control positivo del fixture: una fila que TIENE que salir siempre**, con `periodo_id`
 * vacío… no. Con `periodo_id` vacío `D-19` la excluye — y ése es justamente el caso D. Ésta es la
 * de la versión `_28`, y su presencia es lo que distingue «filtró bien» de «filtró todo». */
const SECCION = { seccion_id: 'campana', itera_sobre: 'CAMPANAS', filtro: '' };

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: function () {} }
  };
  vm.createContext(ctx);

  ['Generador.gs', 'Union.gs'].forEach(function (archivo) {
    let texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
    if (parchear) {
      const antes = texto;
      texto = parchear(texto, archivo);
      /* ⭐⭐ **La mutación se VERIFICA, no se supone** (`CLAUDE.md` §4, 24/08). Si el parche no
       * matchea, el caso negativo corre sobre el código intacto, da verde, y eso se lee como «el
       * negativo pasó». El archivo está en CRLF, así que los patrones van por fragmento de UNA
       * línea — nunca por bloques con `\n`. */
      if (archivo === 'Generador.gs' && texto === antes) {
        throw new Error('⛔ EL PARCHE NO MATCHEÓ NADA en Generador.gs — el caso negativo habría ' +
          'corrido sobre el código intacto. Revisar el patrón (¿CRLF? ¿la línea cambió?).');
      }
    }
    vm.runInContext(texto, ctx, { filename: archivo });
  });

  // `PERIODOS` con las dos versiones del caso, más el par de la semana 14-20 que comparte ventana.
  ctx.leerPeriodos = () => ({
    '2026_agosto_21_27': { desde: '2026-08-21', hasta: '2026-08-27' },
    '2026_agosto_21_28': { desde: '2026-08-21', hasta: '2026-08-28' },
    'agosto_14_20': { desde: '2026-08-14', hasta: '2026-08-20' },
    'vie 14/08 -- jue 20/08 (por defecto)': { desde: '2026-08-14', hasta: '2026-08-20' }
  });
  return ctx;
}

function items(ctx, campanas, ventana) {
  ctx.leerCampanas = () => campanas;
  ctx.__s = SECCION;
  ctx.__v = ventana;
  return vm.runInContext('itemsDeSeccion_(__s, "jm", __v)', ctx);
}

const V28 = { ok: true, desde: new Date(2026, 7, 21), hasta: new Date(2026, 7, 28), origen: 'periodo_ref:2026_agosto_21_28' };
const V27 = { ok: true, desde: new Date(2026, 7, 21), hasta: new Date(2026, 7, 27), origen: 'periodo_ref:2026_agosto_21_27' };

console.log('\n═══ A · con override, sale UNA sola versión ═══');
{
  const r = items(contexto(), CAMPANAS_VIVAS, V28);
  afirmar(r.ok === true, 'la rama CAMPANAS devuelve ok');
  afirmar(r.items.length === 1, '⭐ UN ítem, no dos (' + r.items.length + ') — era el defecto');
  afirmar(r.items[0] && r.items[0].opciones.periodo_id === '2026_agosto_21_28',
    'y es la versión de la corrida, no «la primera de la hoja»');
  afirmar(r.excluidos.length === 1 && /D-53/.test(r.excluidos[0].motivo),
    '⭐ la otra versión sale por `excluidos` citando D-53 — nada desaparece en silencio (D-21)');
  afirmar(r.periodo_id === '2026_agosto_21_28',
    '⭐ el retorno DECLARA qué versión tomó — antes esta rama no devolvía el campo');
}

console.log('\n═══ B · con la OTRA versión, sale la otra — no elige por posición ═══');
{
  const r = items(contexto(), CAMPANAS_VIVAS, V27);
  /* ⚠ **Este caso es el que separa «filtra» de «se queda con la primera».** Sin él, un `slice(0,1)`
   * pasaría el caso A entero. */
  afirmar(r.items.length === 1 && r.items[0].opciones.periodo_id === '2026_agosto_21_27',
    '⭐ con `periodo_ref:_27` sale la fila `_27` — el filtro compara, no recorta');
}

console.log('\n═══ C · SIN origen no se filtra, y es deliberado ═══');
{
  /* ⭐ **La afirmación que convierte un accidente silencioso en una decisión.** Los dos bancos
   * viejos pasan `null` y por eso siguen verdes sin medir el período. Se declara acá, con su
   * motivo: la cadena de `D-20` puede terminar en `CONFIG`, que no tiene `periodo_id`, y **emitir
   * de más y avisar es recuperable; emitir cero en silencio, no**. Calca `REUNIONES`. */
  const r = items(contexto(), CAMPANAS_VIVAS, null);
  afirmar(r.items.length === 2, 'con ventana `null` salen las DOS — no se filtra por período');
  afirmar(r.periodo_id === '', 'y el retorno lo dice: `periodo_id` vacío = no se filtró');

  const sinOrigen = { ok: true, desde: new Date(2026, 0, 1), hasta: new Date(2026, 0, 7), origen: 'R-11 (calculado)' };
  const r2 = items(contexto(), CAMPANAS_VIVAS, sinOrigen);
  afirmar(r2.items.length === 2,
    'y con una ventana calculada que NINGÚN período describe, tampoco se filtra');
}

console.log('\n═══ D · `D-19` sigue PRIMERO, y los dos motivos se distinguen ═══');
{
  const conVacio = CAMPANAS_VIVAS.concat([{
    periodo_id: '', campana_id: 'sin_periodo', nombre: 'Sin período', informe_id: 'jm',
    base_id: 'digital', tipo: 'destacada', mostrar: 'sí', id_cuenta: '', orden: 9
  }]);
  const r = items(contexto(), conVacio, V28);
  afirmar(r.items.length === 1, 'la fila sin período no entra (D-19)');
  const porD19 = r.excluidos.filter((x) => /D-19/.test(x.motivo));
  const porD53 = r.excluidos.filter((x) => /D-53/.test(x.motivo));
  afirmar(porD19.length === 1 && porD19[0].campana === 'sin_periodo',
    '⭐ «no está asignada a ninguna versión» sale con D-19…');
  afirmar(porD53.length === 1 && porD53[0].campana === '3512-AGOSEGGJ',
    '   …y «está asignada a OTRA versión» sale con D-53 — son dos cosas y el reporte las separa');
}

console.log('\n═══ E · control positivo — el filtro no se come todo ═══');
{
  /* ⛔ Sin esto, un filtro que excluyera **siempre** pasaría A, B y D: en todos, «1 ítem» y «la
   * otra excluida» se cumplen igual si lo que sale es una sola cosa. Acá tres versiones distintas
   * y **la de la corrida tiene que estar, con su nombre**. */
  const tres = CAMPANAS_VIVAS.concat([{
    periodo_id: 'agosto_14_20', campana_id: '3481-AGOINFAN', nombre: 'Autódromo: avance de obra',
    informe_id: 'jm', base_id: 'digital', tipo: 'destacada', mostrar: 'sí',
    id_cuenta: '3481-AGOINFAN', orden: 1
  }]);
  const r = items(contexto(), tres, V28);
  afirmar(r.items.length === 1 && r.items[0].clave === '3512-AGOSEGGJ',
    '⭐ de tres filas de dos campañas distintas, sale la de la versión de la corrida');
  afirmar(r.excluidos.length === 2, 'y las otras dos se reportan (' + r.excluidos.length + ')');
}

console.log('\n═══ F · control NEGATIVO — con el filtro desactivado, el defecto vuelve ═══');
{
  /* ⭐ **Romper a propósito y exigir el MOTIVO, no sólo el resultado.** Y la mutación se verifica
   * arriba: si el patrón no matchea, `contexto()` tira en vez de dar verde. */
  const ctx = contexto((texto, archivo) => archivo === 'Generador.gs'
    ? texto.replace('if (periodosCorrida.length && periodosCorrida.indexOf(suyo) === -1) {',
                    'if (false) {')
    : texto);
  const r = items(ctx, CAMPANAS_VIVAS, V28);
  afirmar(r.items.length === 2,
    '⭐ sin el filtro vuelven los DOS ítems — la afirmación A mide ESA línea y no otra cosa');
  afirmar(!r.excluidos.some((x) => /D-53/.test(x.motivo)),
    '   y desaparece el excluido por D-53, que es el motivo correcto de la caída');
}

console.log('\n═══ G · el helper es UNO SOLO, compartido con `REUNIONES` ═══');
{
  /* ⛔ *«Dos formas de decidir lo mismo no fallan el día que difieren: cargan otra cosa»*
   * (`Campanas.gs`, `2026-08-27_2`). Este caso falla si alguien vuelve a escribir el parseo del
   * `periodo_ref:` a mano en cualquiera de las dos ramas. */
  const texto = fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8');
  const usos = (texto.match(/periodosDeLaCorrida_\(/g) || []).length;
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  afirmar(/function periodosDeLaCorrida_\(/.test(texto), 'el helper existe en Union.gs');
  afirmar(usos >= 2, '`leerReuniones_` lo usa en vez de su copia (' + usos + ' menciones)');
  afirmar(/periodosDeLaCorrida_\(ventanaInforme\)/.test(gen),
    '⭐ y la rama CAMPANAS usa el MISMO — no una segunda copia');
  afirmar(!/periodo_ref:'\s*;?[\s\S]{0,80}indexOf\(PREFIJO_PERIODO_REF_/.test(texto),
    'y no quedó el parseo suelto de antes en `leerReuniones_`');
}

console.log('');
if (fallas) {
  console.log('⛔ ' + fallas + ' afirmación(es) FALLARON');
  process.exit(1);
}
console.log('✅ todas las afirmaciones pasaron');
