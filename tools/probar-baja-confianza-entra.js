#!/usr/bin/env node
/**
 * tools/probar-baja-confianza-entra.js — **un encuentro con ancla DIGITAL floja entra igual al
 * temario, sin su cuenta** (`2026-08-27` Parte 4).
 *
 * ⛔ **El bug que fija, y por qué ninguna afirmación existente lo tocaba.** `itemsDeSeccion_`
 * armaba los ítems con `anclaje.encuentros.concat(anclaje.sinLink)` — **`bajaConfianza` quedaba
 * afuera**—, y el comentario que lo justificaba decía *«el ancla decide qué fila de `rdv` se
 * lee»*. **Es falso:** la fila de `rdv` la resuelve `encontrarFilaRdvDeReunion_` por nombre y
 * fecha, y se sella en el ítem **antes** del reparto en las tres listas. El score que manda a
 * `bajaConfianza` mide el match **digital**. **Un `bajaConfianza` y un `sinLink` traen la misma
 * fila de `rdv`, y `sinLink` entraba desde siempre.**
 *
 * ⛔ **La consecuencia sobre `L-034`:** sus `ecv_*` leen **sólo** `rdv`, así que cada encuentro
 * excluido acá se perdía del agregado del temario **sin que nada fallara** — `ecv_encuentros`
 * podía publicar 3 sobre un temario de 4. La traza del marcador tampoco lo decía: `origen` sólo
 * reporta `temario_sin_fila`.
 *
 * ⭐ **Las cuatro reuniones del fixture son las de `julio_24_30`, copiadas del snapshot
 * `docs/_snapshots/REUNIONES_2026-08-26.tsv`** — no inventadas. La de baja confianza es «Orden
 * Público», que es el caso histórico real: dos cuentas homónimas (`3347` / `3387`) que pusieron
 * once números en la cuenta equivocada el 04/08.
 *
 * ⚠ **`filaRdv` va como objeto centinela y eso es correcto acá:** `itemsDeSeccion_` no la mira, la
 * **pasa**, así que lo que hay que afirmar es identidad de objeto. Un fixture con forma de fila de
 * `rdv` mediría el parser de otra función.
 *
 * ⚠ **Lo que este control NO contesta:** si el agregado de `L-034` publica el número correcto. Eso
 * pide una corrida y se cruza contra `V-71`.
 *
 * Uso:
 *   node tools/probar-baja-confianza-entra.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let pasadas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) { pasadas++; console.log('  ✅ ' + mensaje); }
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const SECCION = { seccion_id: 'ecv_alcance_semanal', itera_sobre: 'REUNIONES', filtro: '' };

/* Las filas de `rdv` como centinelas: lo que se afirma es que **la misma** llega al ítem. */
const RDV = {
  sanCristobal: { __fila__: 'San Cristóbal' },
  retiro: { __fila__: 'Retiro' },
  pareto: { __fila__: 'con Pareto' },
  ordenPublico: { __fila__: 'Orden Público' }
};

/**
 * La salida de `anclarEncuentros` con las tres listas pobladas. **Se construye de cero en cada
 * llamada** porque una de las afirmaciones es justamente que el consumidor **no muta** el crudo.
 */
function anclajeFixture() {
  return {
    ok: true,
    umbral: 0.6,
    periodo_id: 'julio_24_30',
    excluidas_por_periodo: [],
    encuentros: [
      { reunion: 'San Cristóbal', etapa: '', tipo: 'Uno a uno', fecha: '23/07/2026',
        idCuenta: '3401-JULJDGAG', score: 0.91, candidatoNombre: 'TE CUENTO | San Cristóbal',
        filaRdv: RDV.sanCristobal, hojaRdv: 'RVD JM-CM - ES' },
      { reunion: 'Retiro', etapa: '', tipo: 'Uno a uno', fecha: '24/07/2026',
        idCuenta: '3412-JULJDGAG', score: 0.88, candidatoNombre: 'TE CUENTO | Retiro',
        filaRdv: RDV.retiro, hojaRdv: 'RVD JM-CM - ES' }
    ],
    /* Sin candidato digital: entra desde siempre, y es el **control positivo** de este banco —
     * comparte camino, lector y fixture con lo que se está midiendo. */
    sinLink: [
      { reunion: 'con Pareto', etapa: '', tipo: 'Primera persona', fecha: '27/07/2026',
        idCuenta: '', score: 0, motivo: 'sin candidato en la ventana',
        filaRdv: RDV.pareto, hojaRdv: 'RVD JM-CM - ES' }
    ],
    /* Ancla digital floja: **tiene fila de `rdv`** —resuelta por nombre y fecha— y una cuenta
     * candidata por debajo del umbral. Es el que hasta hoy desaparecía. */
    bajaConfianza: [
      { reunion: 'Orden Público', etapa: '', tipo: 'Encuentro Temático', fecha: '28/07/2026',
        idCuenta: '3347-JULJDGAG', score: 0.41,
        candidatoNombre: 'TE CUENTO BS AS JM | 21/7 ORDEN PÚBLICO',
        pendiente: true, filaRdv: RDV.ordenPublico, hojaRdv: 'RVD JM-CM - ES' }
    ]
  };
}

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: function () {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    /* ⭐ `CLAUDE.md` §4 — **la guarda de que la mutación OCURRIÓ.** Sin esto, un patrón que no
     * matchea corre sobre el código intacto, da el resultado de siempre y se lee como
     * *«el negativo pasó»*. Falla, no se saltea. */
    if (texto === antes) {
      fallas++;
      console.log('  ❌ ⛔ el parche de «romper a propósito» NO MATCHEÓ NADA — el caso negativo ' +
        'habría corrido sobre el código intacto');
      return null;
    }
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  return ctx;
}

function correr(ctx, anclaje) {
  ctx.anclarEncuentros = () => anclaje;
  ctx.__s = SECCION;
  return vm.runInContext('itemsDeSeccion_(__s, "jm", null)', ctx);
}

console.log('\n═══ A · control positivo — los que YA entraban siguen entrando igual ═══');
{
  const ctx = contexto();
  const anclaje = anclajeFixture();
  const r = correr(ctx, anclaje);
  afirmar(r.ok === true, 'la rama REUNIONES devuelve ok');

  const sc = r.items.filter((i) => i.clave === 'San Cristóbal')[0];
  afirmar(!!sc && sc.opciones.id_cuenta === '3401-JULJDGAG',
    'un encuentro anclado conserva su `opciones.id_cuenta`');
  afirmar(!!sc && sc.opciones.fila_rdv === RDV.sanCristobal,
    'y su fila de rdv, que es la llave del ítem en esa base');

  const pareto = r.items.filter((i) => i.clave === 'con Pareto')[0];
  afirmar(!!pareto, '⭐ el `sinLink` sigue entrando — es el control positivo: comparte camino');
  afirmar(!!pareto && !('id_cuenta' in pareto.opciones),
    'y sigue entrando SIN la clave de cuenta, así que sus marcadores de digital caen a «FALTA»');
}

console.log('\n═══ B · lo nuevo — el de ancla floja entra, y entra sin cuenta ═══');
{
  const ctx = contexto();
  const anclaje = anclajeFixture();
  const r = correr(ctx, anclaje);

  afirmar(r.items.length === 4,
    '⭐⭐ salen los CUATRO encuentros del temario, no tres (' + r.items.length + ')');

  const op = r.items.filter((i) => i.clave === 'Orden Público')[0];
  afirmar(!!op, '⭐⭐ el de baja confianza está entre los ítems');
  afirmar(!!op && op.opciones.fila_rdv === RDV.ordenPublico,
    '⭐ y trae SU fila de rdv — que es lo que lo mete en el agregado de `L-034`');
  afirmar(!!op && op.id_cuenta === '',
    '⭐⭐ con la cuenta digital VACIADA (' + JSON.stringify(op && op.id_cuenta) + ')');
  afirmar(!!op && !('id_cuenta' in op.opciones),
    'y sin la clave en `opciones`, así que sus `enc_*` salen «FALTA» y no un número de `3347`');
  afirmar(!!op && /umbral/.test(op.motivo) && /ANCLAJE_PENDIENTE/.test(op.motivo),
    'su `motivo` nombra el umbral y ANCLAJE_PENDIENTE — se ve por qué no tiene cuenta');

  afirmar(!r.excluidos.some((e) => String(e.item || '').indexOf('Orden Público') !== -1),
    'y ya NO figura entre los excluidos: dejó de estar excluido, no dejó de verse');
}

console.log('\n═══ C · el crudo NO se muta — `anclarEncuentros` está cacheado por corrida ═══');
{
  const ctx = contexto();
  const anclaje = anclajeFixture();
  correr(ctx, anclaje);
  afirmar(anclaje.bajaConfianza[0].idCuenta === '3347-JULJDGAG',
    '⭐ el objeto crudo conserva su cuenta — el vaciado fue sobre una copia');
  afirmar(anclaje.bajaConfianza[0].score === 0.41,
    'y su puntaje, que es lo que el reporte de Union.gs sigue teniendo que decir');
}

console.log('\n═══ D · control negativo — sin la línea nueva, el encuentro desaparece ═══');
{
  /* El patrón va por fragmento de UNA línea: el final de línea es del archivo (CRLF), no de
   * quien escribe la prueba (`CLAUDE.md` §4). */
  const ctx = contexto((t) => t.replace('.concat(deBajaConfianza);', ';'));
  if (ctx) {
    const r = correr(ctx, anclajeFixture());
    afirmar(r.items.length === 3,
      '⛔ sin `.concat(deBajaConfianza)` salen 3 y no 4 (' + r.items.length + ')');
    afirmar(!r.items.some((i) => i.clave === 'Orden Público'),
      '⛔ y el de baja confianza NO está — o sea que la afirmación de B mide ESA línea');
  }
}

console.log('');
/* ⚠ La frase es la que `tools/suites.js` cuenta —`/Las? (\d+) afirmaciones? pasaron/`—. Escribirla
 * de otra forma no rompe el veredicto (ése sale del exit code) pero deja las afirmaciones fuera
 * del total, que es cómo un banco pasa a sumar cero sin que nada avise. */
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si `L-034` publica el número correcto. Eso pide una corrida y se cruza contra V-71.');
console.log('   · Si el umbral de `CONFIG.umbral_anclaje_reunion` está bien calibrado. Otra pregunta.');
console.log('   · ⛔ Si conviene que el encuentro de ancla floja EMITA su lámina de encuentro. Ahora');
console.log('     la emite, con los `enc_*` en «FALTA» — es lo mismo que ya hacía un `sinLink`.');

process.exit(fallas === 0 ? 0 : 1);
