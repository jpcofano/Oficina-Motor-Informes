#!/usr/bin/env node
/**
 * tools/probar-agregado-por-temario.js — **el agregado `ecv_*` toma su universo del temario**
 * (`docs/Prompts/2026-08-22_25_agregado_por_temario.md` + su addendum, Partes A y B).
 *
 * `R-21` nivel 1 y el `Addendum 1` de `R-17` lo mandan **desde el 09/08/2026**: *"el agregado
 * `ecv_*` suma los encuentros que `R-21` seleccionó, no los que caen en la ventana"*. Hasta hoy el
 * motor usaba un **proxy** —`figura=Jorge Macri` + ventana— y sobre `agosto_14_20` publicaba
 * `ecv_encuentros = 1` con un temario de **2** ítems.
 *
 * ⚠ **Este banco fija el MECANISMO, no los valores.** Los valores son dos corridas y salen de
 * casos ya validados (`V-71 = 2333`, `V-01/V-03/V-05` como sumandos): el control de valores es
 * **reproducirlos**, no volver a medirlos, y eso pide la hoja viva.
 *
 * **Lo que fija, en orden de qué tan caro sale que se rompa:**
 *
 *  1. ⛔ **La deduplicación.** `julio_24_30` tiene San Cristóbal y Retiro **dos veces cada uno**
 *     —`pre` y `post`— apuntando a la **misma** fila de `rdv`. Sin deduplicar, el agregado suma
 *     esos encuentros dos veces: un total **grande y plausible**.
 *  2. ⛔ **El orden de las dos ramas.** La singular —un encuentro, una fila— tiene que ganar
 *     siempre, o `ecv_barrio`, `ecv_poblacion` y `enc_evento` dejan de decir lo de su encuentro
 *     dentro del bloque. **El mismo marcador se comporta distinto según dónde salga.**
 *  3. ⛔ **El recorte por período resuelto como CONJUNTO.** Hay dos filas de `PERIODOS` con la
 *     misma ventana y una de ellas no la tiene cargada ninguna reunión: elegir «la primera» puede
 *     dejar el informe **sin ningún encuentro**.
 *
 * Uso:
 *   node tools/probar-agregado-por-temario.js
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

function contexto(archivo, parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: archivo });
  ctx.normalizar_ = (s) => (s || '').toString().toLowerCase().trim();
  ctx.formatearFecha_ = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));
  ctx.parsearFechaCelda_ = (v) => (v instanceof Date ? v : (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T12:00:00Z') : null));
  return ctx;
}

/* Las filas de `rdv`, una por encuentro. San Cristóbal y Retiro tienen **una sola** aunque el
 * temario los liste dos veces (pre/post): es el hecho que obliga a deduplicar. */
const RDV = {
  sancristobal: { Barrio: 'San Cristóbal', Inscriptos: 138 },
  retiro:       { Barrio: 'Retiro',        Inscriptos: 98 },
  urquiza:      { Barrio: 'Villa Urquiza', Inscriptos: 1344 },
  belgrano:     { Barrio: 'Belgrano',      Inscriptos: 753 }
};

/* El temario de `julio_24_30` tal como está en la hoja viva el 22/08: **6 filas no-Agregado, 4
 * encuentros**. Copiado, no inventado. */
function itemsJulio() {
  const it = (nombre, fecha, etapa, filaRdv) => ({
    clave: nombre + (etapa ? ' (' + etapa + ')' : ''),
    etiqueta: nombre,
    fecha: new Date(fecha + 'T12:00:00Z'),
    etapa: etapa,
    opciones: filaRdv ? { fila_rdv: filaRdv, hoja_rdv: 'RVD JM-CM - ES' } : {}
  });
  return [
    it('San Cristóbal', '2026-07-23', 'pre',  RDV.sancristobal),
    it('San Cristóbal', '2026-07-23', 'post', RDV.sancristobal),
    it('Retiro',        '2026-07-24', 'pre',  RDV.retiro),
    it('Retiro',        '2026-07-24', 'post', RDV.retiro),
    it('Villa Urquiza', '2026-07-27', '',     RDV.urquiza),
    it('Orden Público', '2026-07-28', '',     RDV.belgrano)
  ];
}

function ctxGenerador(items) {
  const ctx = contexto('Generador.gs');
  ctx.leerSeccionesPlano_ = () => ({
    ecv_alcance_semanal: { modo: 'agregado', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM,SECCO' },
    // ⚠ Distractores reales: `m2` y `ministros` son agregado y NO iteran REUNIONES; `encuentro`
    // itera pero es repetible. Ninguna de las tres tiene que ser elegida.
    m2:         { modo: 'agregado',  itera_sobre: '',          estado: 'activa', informes: 'JM,SECCO' },
    ministros:  { modo: 'agregado',  itera_sobre: '',          estado: 'activa', informes: 'SECCO' },
    encuentro:  { modo: 'repetible', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM,SECCO' }
  });
  ctx.itemsDeSeccion_ = (s) => {
    if (s.seccion_id !== 'ecv_alcance_semanal') throw new Error('sección equivocada: ' + s.seccion_id);
    return { ok: true, items: items };
  };
  return ctx;
}

console.log('\n═══ A · ⛔ la deduplicación: 6 filas de temario, 4 encuentros ═══');
{
  const ctx = ctxGenerador(itemsJulio());
  const r = ctx.filasRdvDelTemario_('jm', null);

  afirmar(r.items === 4, 'cuenta 4 encuentros distintos y no 6 filas (' + r.items + ')');
  afirmar(r.filas.length === 4, 'y devuelve 4 filas de rdv (' + r.filas.length + ')');
  /* ⭐ El control de verdad: la suma. Sin deduplicar daría 138+138+98+98+1344+753 = 2569 en vez de
   * 2333 — grande, plausible, y coincidiendo con nada. */
  const suma = r.filas.reduce((a, f) => a + f.Inscriptos, 0);
  afirmar(suma === 2333,
    '⭐ la suma da 2333 = 138 + 98 + 1344 + 753 (V-71). Sin deduplicar daría 2569 (' + suma + ')');
  afirmar(r.hoja === 'RVD JM-CM - ES', 'y trae la hoja, que es lo que la rama plural exige');
  afirmar(r.sin_fila === 0, 'ningún ítem quedó sin fila');
}

console.log('\n═══ B · ⚠ dos encuentros del mismo barrio en fechas distintas NO se fusionan ═══');
{
  /* `junio_sem2` tiene dos Boedo: 12/06 y 17/06. Con el nombre solo como clave, el agregado
   * publicaría **un** encuentro de menos, sin fallar. */
  const boedo1 = { Barrio: 'Boedo', Inscriptos: 40 };
  const boedo2 = { Barrio: 'Boedo', Inscriptos: 60 };
  const items = [
    { clave: 'Boedo', etiqueta: 'Boedo', fecha: new Date('2026-06-12T12:00:00Z'), opciones: { fila_rdv: boedo1, hoja_rdv: 'RVD JM-CM - ES' } },
    { clave: 'Boedo', etiqueta: 'Boedo', fecha: new Date('2026-06-17T12:00:00Z'), opciones: { fila_rdv: boedo2, hoja_rdv: 'RVD JM-CM - ES' } }
  ];
  const r = ctxGenerador(items).filasRdvDelTemario_('jm', null);
  afirmar(r.items === 2 && r.filas.length === 2,
    'los dos Boedo entran: la clave es nombre + FECHA, no el nombre solo');
  afirmar(r.filas.reduce((a, f) => a + f.Inscriptos, 0) === 100, 'y suman los dos');
}

console.log('\n═══ C · ⚠ un ítem sin fila de rdv no aporta una fila vacía: se cuenta aparte ═══');
{
  const items = itemsJulio();
  items.push({ clave: 'Sin fila', etiqueta: 'Sin fila', fecha: new Date('2026-07-29T12:00:00Z'), opciones: {} });
  const r = ctxGenerador(items).filasRdvDelTemario_('jm', null);
  afirmar(r.filas.length === 4, 'sigue habiendo 4 filas — no se inventa una vacía');
  /* ⛔ Una fila sintética haría que `ecv_encuentros` diera 5 mientras `ecv_inscriptos` suma cero
   * por ella: el conteo correcto tapando una suma incompleta. Mejor el conteo corto, que se ve. */
  afirmar(r.sin_fila === 1, 'y se reporta 1 ítem sin fila, que viaja hasta la traza del marcador');
}

console.log('\n═══ D · la sección se elige por modo + itera_sobre, no por nombre ═══');
{
  const ctx = ctxGenerador(itemsJulio());
  afirmar(ctx.filasRdvDelTemario_('jm', null).filas.length === 4, 'la elige para jm');
  // `ministros` declara `informes: 'SECCO'` y no itera; `ecv_alcance_semanal` sí declara SECCO.
  afirmar(ctx.filasRdvDelTemario_('secco', null).filas.length === 4, 'y para secco, que también la declara');
  afirmar(ctx.filasRdvDelTemario_('otro', null).filas.length === 0,
    'y para un informe que no la declara devuelve vacío — no es un error, es que no aplica');
}

console.log('\n═══ E · ⛔ la rama SINGULAR gana sobre la plural ═══');
{
  const ctx = contexto('Generador.gs');
  ctx.buscarMapeo = () => ({ ok: true, columna: 'Inscriptos' });
  ctx.encabezadoEnColumna_ = () => 'Inscriptos';
  const fila = { base_id: 'rdv', campo_logico: 'inscriptos', marcador: 'ecv_inscriptos' };

  const conLasDos = ctx.datosDeMarcador_(fila, 'RVD JM-CM - ES', null, null, {
    fila_rdv: RDV.urquiza, hoja_rdv: 'RVD JM-CM - ES',
    filas_rdv: [RDV.sancristobal, RDV.retiro], // el agregado, que NO tiene que ganar
  });
  /* ⭐ Es el invariante del punto 4 de la Parte A: dentro del bloque de encuentro, `ecv_barrio`,
   * `ecv_poblacion` y `enc_evento` tienen que seguir diciendo lo de SU encuentro. */
  afirmar(conLasDos.filas.length === 1 && conLasDos.filas[0] === RDV.urquiza,
    'con las dos presentes gana la fila del ítem — el camino por ítem no se mueve');

  const soloPlural = ctx.datosDeMarcador_(fila, 'RVD JM-CM - ES', null, null, {
    filas_rdv: [RDV.sancristobal, RDV.retiro], hoja_rdv: 'RVD JM-CM - ES'
  });
  afirmar(soloPlural.filas.length === 2, 'sin ítem, entra el agregado del temario');
  afirmar(/TEMARIO/.test(soloPlural.origen) && /R-21/.test(soloPlural.origen),
    'y el origen lo dice, con la regla citada — la traza es la contención');
}

console.log('\n═══ F · ⚠ la rama plural exige la MISMA solapa ═══');
{
  const ctx = contexto('Generador.gs');
  ctx.buscarMapeo = () => ({ ok: true, columna: 'Inscriptos' });
  ctx.encabezadoEnColumna_ = () => 'Inscriptos';
  // Vive en `Solapas.gs`, que este banco no carga: con otra solapa el flujo pasa por acá camino a
  // la rama general, y lo que se mide es que NO se haya quedado en la plural.
  ctx.campoIdCuentaDeSolapa_ = () => '';
  ctx.leerFuente = () => ({ ok: false, motivo: '(cortado por el banco: cayó a la rama general)' });
  const fila = { base_id: 'rdv', campo_logico: 'inscriptos', marcador: 'x' };
  /* La letra de columna vale para la solapa donde se resolvió el `MAPEO`. Si el marcador apunta a
   * otra, la letra no aplica y el valor saldría de la columna equivocada **sin fallar**. Misma
   * guarda que la rama singular tiene desde el 11/08. */
  const ventana = { ok: true, desde: new Date('2026-07-24T12:00:00Z'), hasta: new Date('2026-07-30T12:00:00Z') };
  const otra = ctx.datosDeMarcador_(fila, 'OTRA SOLAPA', ventana, {}, {
    filas_rdv: [RDV.urquiza], hoja_rdv: 'RVD JM-CM - ES'
  });
  afirmar(otra.ok === false && /cortado por el banco/.test(otra.motivo),
    'con otra solapa NO usa el agregado: llega a la rama general, que es donde el banco lo corta');
}

console.log('\n═══ G · ⛔ el recorte por período es un CONJUNTO ═══');
{
  const ctx = contexto('Union.gs');
  ctx.leerPeriodos = () => ({
    julio_24_30: { desde: '2026-07-24', hasta: '2026-07-30' },
    agosto_14_20: { desde: '2026-08-14', hasta: '2026-08-20' },
    'vie 14/08 -- jue 20/08 (por defecto)': { desde: '2026-08-14', hasta: '2026-08-20' }
  });
  const v = (d, h) => ({ ok: true, desde: new Date(d + 'T12:00:00Z'), hasta: new Date(h + 'T12:00:00Z') });

  const dos = ctx.periodosQueDescribenLaVentana_(v('2026-08-14', '2026-08-20'));
  /* ⭐ Las DOS. Elegir «la primera» sería adivinar, y si sale la fila 9 —que ninguna reunión tiene
   * cargada— el informe queda **sin ningún encuentro** y nada falla. */
  afirmar(dos.length === 2 && dos.indexOf('agosto_14_20') !== -1,
    'devuelve las dos filas que describen la ventana, no una elegida');

  afirmar(ctx.periodosQueDescribenLaVentana_(v('2026-07-24', '2026-07-30')).length === 1,
    'con una sola coincidencia devuelve una');
  afirmar(ctx.periodosQueDescribenLaVentana_(v('2026-05-01', '2026-05-07')).length === 0,
    'y con ninguna devuelve vacío — ahí NO se filtra, que es el comportamiento de antes');
  afirmar(ctx.periodosQueDescribenLaVentana_(null).length === 0, 'sin ventana, vacío');

  ctx.leerPeriodos = () => { throw new Error('boom'); };
  afirmar(ctx.periodosQueDescribenLaVentana_(v('2026-08-14', '2026-08-20')).length === 0,
    'y si PERIODOS no se puede leer, tampoco filtra: no tumba el anclaje');
}

console.log('\n═══ H · ⚠ romper a propósito: volver al filtro de uno solo ═══');
{
  let r = null;
  try {
    const ctx = contexto('Generador.gs', (t) => t.replace(
      /var clave = normalizar_\(item\.etiqueta \|\| item\.clave\) \+ '\|' \+ \(f \? formatearFecha_\(f\) : 'sin_fecha'\);/,
      "var clave = normalizar_(item.etiqueta || item.clave) + '|SIEMPRE_DISTINTO' + Math.random();"));
    ctx.leerSeccionesPlano_ = () => ({ ecv_alcance_semanal: { modo: 'agregado', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM' } });
    ctx.itemsDeSeccion_ = () => ({ ok: true, items: itemsJulio() });
    r = ctx.filasRdvDelTemario_('jm', null);
  } catch (e) {
    fallas++; console.log('  ❌ el parche falló: ' + e.message);
  }
  const suma = r ? r.filas.reduce((a, f) => a + f.Inscriptos, 0) : 0;
  afirmar(r !== null && r.filas.length === 6 && suma === 2569,
    'anulada la deduplicación, salen 6 filas y 2569 — el número grande y plausible que la sección A evita');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

console.log('');
console.log('⚠ Lo que este control NO contesta — son las dos corridas de la Parte C:');
console.log('   · julio_24_30 → ecv_inscriptos = 2333 (V-71) y ecv_encuentros = 4, con los cuatro');
console.log('     sumandos validados uno por uno: V-01 138 · V-03 98 · Villa Urquiza 1344 · V-05 753.');
console.log('   · agosto_14_20 → ecv_encuentros = 2 (hoy publica 1) y ecv_barrios con los dos barrios.');
console.log('   ⛔ Si el total da 2333 pero un sumando no es el suyo, el número está bien por el');
console.log('     camino equivocado — que es el modo de falla de los 855/186.');

process.exit(fallas === 0 ? 0 : 1);
