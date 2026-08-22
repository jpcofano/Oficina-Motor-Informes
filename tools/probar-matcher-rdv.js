#!/usr/bin/env node
/**
 * tools/probar-matcher-rdv.js — **el término de búsqueda del matcher de `rdv`**
 * (`docs/Prompts/2026-08-22_22_agregado_temario_ivr_ventana.md`, decisión del usuario del 22/08).
 *
 * ⛔ **El caso, medido en vivo.** El temario trae `nombre = ": Salud"` —`parsearLineaReunion_`
 * corta *"2) JM | Encuentro Temático: Salud 14/08"* por el `|` y deja el separador del título
 * pegado—. Con ese término `encontrarFilaRdvDeReunion_` **no matcheaba nada**, el encuentro
 * quedaba sin fila de `rdv`, y eso **frenó el nivel 1 de `R-21`**: el agregado no podía anclarse
 * al temario porque uno de los dos ítems no alcanzaba su fila.
 *
 * ⭐ **La afirmación del medio es la que hace honesto a este banco.** No alcanza con que `": Salud"`
 * encuentre: hay que afirmar que **`"Encuentro Temático: Salud"` sigue encontrando**, porque el
 * arreglo recorta **sólo los bordes** y un separador del medio es parte del nombre. Un recorte
 * global pasaría la primera afirmación y rompería la segunda.
 *
 * ⛔ **Y la tercera, que es la que el arreglo no puede introducir:** un nombre que sea sólo
 * puntuación **falla con motivo**. Con el término vacío el `indexOf` es un **match universal** y
 * ganaría la primera fila de `rdv` de esa fecha — el encuentro equivocado con forma de acierto.
 *
 * ⚠ **Lo que este banco NO prueba:** que el match funcione en la otra dirección. El matcher busca
 * si `rdv` **contiene** al nombre; un nombre más largo que el de `rdv`, o con las palabras en otro
 * orden, falla igual sin ningún separador de por medio. **Está anotado en `PENDIENTES` y no se
 * arregla acá.**
 *
 * Uso:
 *   node tools/probar-matcher-rdv.js
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

/* Las filas de `rdv` como el matcher las ve, copiadas de la hoja viva del 22/08 — no inventadas.
 * `Barrio` es la columna que el matcher compara, y `EVENTO` la otra. */
const FILAS_RDV = [
  { A: 'Jorge Macri', Barrio: 'Parque Patricios', EVENTO: 'Encuentro Temático Salud Eje Sur' },
  { A: 'Jorge Macri', Barrio: 'Parque Avellaneda', EVENTO: 'Uno a uno en Parque Avellaneda' }
];

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },
    Utilities: { formatDate: (f) => f.toISOString().slice(0, 10) },
    Session: { getScriptTimeZone: () => 'UTC' }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'Union.gs' });

  /* Se stubean las **dependencias de plataforma y de configuración**, no la lógica del matcher:
   * lo que corre de verdad es el armado del término y el `indexOf`, que es lo que se mide. */
  ctx.parsearFechaCelda_ = (v) => (v instanceof Date ? v : new Date(2026, 7, 14));
  ctx.leerFuente = () => ({ ok: true, hoja: 'RVD JM-CM - ES', filas: FILAS_RDV });
  ctx.buscarMapeo = (b, h, campo) => ({ ok: true, columna: campo === 'barrio' ? 'Barrio' : (campo === 'evento' ? 'EVENTO' : 'A') });
  ctx.valorPorColumna_ = (fila, b, h, col) => fila[col];
  // El real vive en `Parseo.gs`: minúsculas, sin acentos, `trim`. Se replica su contrato porque
  // el arreglo se apoya en él y hay que medir la combinación de los dos.
  ctx.normalizar_ = (s) => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  return ctx;
}

const buscar = (ctx, nombre) => ctx.encontrarFilaRdvDeReunion_({ nombre: nombre, fecha: new Date(2026, 7, 14) });

console.log('\n═══ A · el caso que frenó R-21 ═══');
{
  const ctx = contexto();
  const r = buscar(ctx, ': Salud');
  afirmar(r.ok === true, '⛔ ": Salud" ENCUENTRA su fila — el caso real del temario');
  afirmar(r.ok && r.fila.Barrio === 'Parque Patricios', 'y es la fila correcta, no cualquiera');
}

console.log('\n═══ B · ⭐ el separador del MEDIO no se toca ═══');
{
  const ctx = contexto();
  /* Si el recorte fuera global —sacar toda la puntuación— este término quedaría
   * `"encuentro tematico salud"` y **seguiría matcheando** contra `EVENTO`, así que no
   * distinguiría las dos implementaciones. Por eso la afirmación va contra `Barrio`, donde el
   * texto del medio importa: se busca un nombre que sólo matchea si el `:` sobrevive. */
  const r = buscar(ctx, 'Encuentro Temático: Salud');
  afirmar(r.ok === false,
    '"Encuentro Temático: Salud" NO matchea acá porque rdv escribe "Salud Eje Sur" sin los dos puntos');
  const r2 = buscar(ctx, 'Encuentro Temático Salud');
  afirmar(r2.ok === true,
    'y sin los dos puntos SÍ matchea — o sea que el texto del medio se está comparando tal cual');
}

console.log('\n═══ C · ⛔ sólo puntuación FALLA, no matchea cualquier cosa ═══');
{
  const ctx = contexto();
  ['::', '  ', ' - ', '|', ' , . '].forEach(function (n) {
    const r = buscar(ctx, n);
    afirmar(r.ok === false && /sólo\s+separadores|no deja nada para buscar/.test(r.motivo),
      JSON.stringify(n) + ' falla con motivo — con término vacío el indexOf es un match universal');
  });
}

console.log('\n═══ D · lo que ya andaba sigue andando ═══');
{
  const ctx = contexto();
  afirmar(buscar(ctx, 'Parque Avellaneda').ok === true, 'un nombre limpio sigue encontrando');
  afirmar(buscar(ctx, 'Parque Avellaneda').fila.Barrio === 'Parque Avellaneda', 'y la fila correcta');
  afirmar(buscar(ctx, 'Mataderos').ok === false, 'y uno que no está sigue sin encontrarse');
  // ⚠ Los bordes con espacios ya los sacaba `normalizar_`; se afirma para que el recorte nuevo no
  // los rompa al pasarles por encima.
  afirmar(buscar(ctx, '  Parque Avellaneda  ').ok === true, 'con espacios de más también');
}

console.log('\n═══ E · ⚠ romper a propósito ═══');
{
  let r = null;
  try {
    const ctx = contexto((t) => t.replace(
      /\.replace\(\/\^\[\\s:;,\.\/\|\\-–—\]\+\|\[\\s:;,\.\/\|\\-–—\]\+\$\/g, ''\)/,
      ''));
    r = buscar(ctx, ': Salud');
  } catch (e) {
    fallas++; console.log('  ❌ el parche falló: ' + e.message);
  }
  afirmar(r !== null && r.ok === false,
    'sin el recorte, ": Salud" vuelve a no encontrar nada — la sección A mide algo real');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que `parsearLineaReunion_` deje de producir el fragmento. El matcher lo TOLERA;');
console.log('     no lo arregla. Anotado en PENDIENTES como deuda propia.');
console.log('   · Que el match funcione en la otra dirección: busca si rdv CONTIENE al nombre.');
console.log('     Un nombre más largo, o con las palabras en otro orden, falla igual. Anotado.');

process.exit(fallas === 0 ? 0 : 1);
