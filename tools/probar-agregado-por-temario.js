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
  /* ⭐ `2026-08-24` — **`CONFIG` es de dónde salen los `seccion_id` ahora**, y se stubea acá en vez
   * de pasarlos por parámetro **a propósito**: así el banco recorre el mismo camino que producción.
   * Pasarlos a mano probaría que la función acepta un argumento, que no es lo que hay que verificar. */
  ctx.leerConfig = () => ({
    seccion_agregado_semanal: 'ecv_alcance_semanal',
    seccion_agregado_post: 'comunicaciones_post',
    base_agregado_post: 'reuniones',
    solapa_agregado_post: 'Agenda JM | Post'
  });
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
    ctx.leerConfig = () => ({ seccion_agregado_semanal: 'ecv_alcance_semanal' });
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

/* ══════════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-24` — la sección se resuelve por `seccion_id` EXPLÍCITO, y la pieza de `L-036`.
 *
 * ⚠ **Estas afirmaciones existen porque NINGUNA de las de arriba falla si la rama nueva no
 * funciona** (`CLAUDE.md` §4: *una rama nueva que nunca se ejecutó no está sin probar: está sin
 * escribir el control*). El fixture de arriba tiene **una sola** sección que califica, así que
 * *«la primera que califique»* y *«la que se pidió»* dan lo mismo — y el verde no distingue nada.
 * ══════════════════════════════════════════════════════════════════════════════════════════════ */

console.log('\n═══ I · ⛔⛔ con DOS secciones agregado+REUNIONES, se elige la PEDIDA ═══');
{
  const ctx = ctxGenerador(itemsJulio());
  /* ⭐ El orden importa: `comunicaciones_post` va **primero** en el objeto, así que un
   * `Object.keys(...)[0]` la elegiría a ella. Es exactamente el caso que el código viejo perdía. */
  ctx.leerSeccionesPlano_ = () => ({
    comunicaciones_post: { modo: 'agregado', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM,SECCO' },
    ecv_alcance_semanal: { modo: 'agregado', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM,SECCO' }
  });
  let pedidas = [];
  ctx.itemsDeSeccion_ = (s) => { pedidas.push(s.seccion_id); return { ok: true, items: itemsJulio() }; };

  const r = ctx.filasRdvDelTemario_('jm', null);
  afirmar(pedidas.length === 1 && pedidas[0] === 'ecv_alcance_semanal',
    '⭐ pidió los ítems de `ecv_alcance_semanal`, NO de la primera del objeto (pidió: ' + pedidas.join(',') + ')');
  afirmar(r.filas.length === 4, 'y sigue devolviendo las 4 filas del agregado semanal');
}

console.log('\n═══ J · el resolver por id: existe, califica, y los motivos ═══');
{
  const ctx = ctxGenerador(itemsJulio());
  const secciones = ctx.leerSeccionesPlano_();

  const ok = ctx.seccionAgregadaDeReuniones_(secciones, 'jm', 'ecv_alcance_semanal');
  afirmar(ok.ok === true, 'la que califica resuelve');

  const noExiste = ctx.seccionAgregadaDeReuniones_(secciones, 'jm', 'no_existe');
  afirmar(noExiste.ok === false && /no existe/.test(noExiste.motivo),
    '⛔ un id que no existe falla NOMBRÁNDOLO, no en silencio');

  const repetible = ctx.seccionAgregadaDeReuniones_(secciones, 'jm', 'encuentro');
  afirmar(repetible.ok === false && /modo/.test(repetible.motivo),
    '⛔ una `repetible` falla y el motivo dice `modo` — hoy `comunicaciones_post` cae acá');

  const otroInforme = ctx.seccionAgregadaDeReuniones_(secciones, 'otro', 'ecv_alcance_semanal');
  afirmar(otroInforme.ok === false && /no declara al informe/.test(otroInforme.motivo),
    '⛔ un informe que la sección no declara falla con su motivo');

  const sinId = ctx.seccionAgregadaDeReuniones_(secciones, 'jm', '');
  afirmar(sinId.ok === false && /No hay default|no hay default/.test(sinId.motivo),
    '⭐ sin id NO elige una: falla diciendo que no hay default');
}

console.log('\n═══ K · `filasDeSolapaDelTemario_` — la pieza de L-036, por `id_cuenta` ═══');
{
  const ctx = ctxGenerador(itemsJulio());
  ctx.leerSeccionesPlano_ = () => ({
    comunicaciones_post: { modo: 'agregado', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM,SECCO' }
  });
  /* Seis filas de temario y cuatro encuentros, igual que arriba — dos comparten cuenta (pre/post).
   * `Retiro` NO tiene fila en la solapa POST: es un encuentro sin comunicación post, el caso
   * normal. Y uno de los ítems no ancló: eso NO es lo mismo que no existir. */
  const its = [
    { id_cuenta: 'A-1', clave: 'San Cristóbal (pre)' },
    { id_cuenta: 'A-1', clave: 'San Cristóbal (post)' },
    { id_cuenta: 'A-2', clave: 'Retiro (pre)' },
    { id_cuenta: 'A-3', clave: 'Villa Urquiza' },
    { id_cuenta: '',    clave: 'Orden Público' }
  ];
  ctx.itemsDeSeccion_ = () => ({ ok: true, items: its });
  ctx.campoIdCuentaDeSolapa_ = () => 'id_cuenta';
  ctx.buscarMapeo = () => ({ ok: true, columna: 'A' });
  ctx.encabezadoEnColumna_ = () => 'ID';
  ctx.normalizarIdCuenta_ = (s) => String(s || '').trim();
  ctx.filtrarFilasPorCuenta_ = (filas, enc, id) => filas.filter((f) => f[enc] === id);
  ctx.leerFuente = () => ({ ok: true, filas: [
    { ID: 'A-1', Visualizaciones: 45806, Impresiones: 218662 },
    { ID: 'A-3', Visualizaciones: 868747, Impresiones: 9063800 }
  ] });

  const r = ctx.filasDeSolapaDelTemario_('jm', null, 'comunicaciones_post', 'reuniones', 'Agenda JM | Post');
  afirmar(r.ok === true, 'resuelve');
  afirmar(r.items === 3, '⭐ cuenta 3 encuentros distintos sobre 5 filas de temario — dedup por cuenta (' + r.items + ')');
  afirmar(r.filas.length === 2, 'y devuelve 2 filas: sólo las que existen en la solapa POST (' + r.filas.length + ')');
  afirmar(r.sin_cuenta === 1, '⚠ 1 ítem SIN CUENTA anclada, contado aparte (' + r.sin_cuenta + ')');
  afirmar(r.sin_fila === 1, '⚠ 1 ítem con cuenta y sin fila POST — encuentro sin comunicación post (' + r.sin_fila + ')');
  afirmar(r.con_varias === 0, 'ninguna cuenta trajo más de una fila');
  /* ⭐ El control que importa: la identidad interna de `L-036` sobre las filas que salieron. Si la
   * pieza devolviera las filas de otro encuentro, esto seguiría cerrando —cierra sobre cualquier
   * fila— así que **no reemplaza** a los conteos de arriba; los acompaña. */
  const vtr = r.filas.map((f) => f.Visualizaciones / f.Impresiones);
  afirmar(Math.abs(vtr[0] - 0.20948312921312345) < 1e-12 && Math.abs(vtr[1] - 0.09584798870231029) < 1e-12,
    'y las dos filas reproducen % VTR = Visualizaciones / Impresiones al dígito');
}

console.log('\n═══ L · ⛔ la rama nueva de `datosDeMarcador_` y su guarda de solapa ═══');
{
  const ctx = ctxGenerador(itemsJulio());
  ctx.buscarMapeo = () => ({ ok: true, columna: 'M' });
  ctx.encabezadoEnColumna_ = () => 'Visualizaciones';
  ctx.campoIdCuentaDeSolapa_ = () => '';
  ctx.leerFuente = () => ({ ok: false, motivo: '(cortado por el banco: cayó a la rama general)' });
  const fila = { base_id: 'reuniones', campo_logico: 'vis_totales', marcador: 'post_vistas1' };
  const temario = {
    filas: [{ Visualizaciones: 45806 }], seccion_id: 'comunicaciones_post',
    sin_cuenta: 1, sin_fila: 1, con_varias: 0, base_id: 'reuniones', hoja: 'Agenda JM | Post'
  };

  const buena = ctx.datosDeMarcador_(fila, 'Agenda JM | Post', null, {}, {
    filas_temario: temario, base_temario: 'reuniones', hoja_temario: 'Agenda JM | Post'
  });
  afirmar(buena.ok === true && buena.filas.length === 1, 'con la solapa correcta, devuelve la fila del temario');
  afirmar(/TEMARIO/.test(buena.origen) && /seccion_id. expl/.test(buena.origen),
    '⭐ y el origen declara que la sección se resolvió por `seccion_id` explícito');
  afirmar(/SIN CUENTA ANCLADA/.test(buena.origen) && /SIN FILA/.test(buena.origen),
    '⚠ y nombra los dos casos que NO son lo mismo: sin cuenta y sin fila');

  /* ⚠ Acá sí hace falta una ventana: el punto de la afirmación es que **cae a la rama general**,
   * y ésa arma su clave de caché con las fechas. Que necesite ventana es la prueba de que cayó. */
  const otraSolapa = ctx.datosDeMarcador_(fila, 'Agenda JM',
    { desde: new Date('2026-08-14T12:00:00Z'), hasta: new Date('2026-08-20T12:00:00Z') }, {}, {
      filas_temario: temario, base_temario: 'reuniones', hoja_temario: 'Agenda JM | Post'
    });
  afirmar(!(otraSolapa.ok && /TEMARIO/.test(otraSolapa.origen || '')),
    '⛔ con OTRA solapa NO usa esas filas — la letra de columna vale para una solapa sola');
}

console.log('\n═══ N · ⭐⭐ la regla del 25/08: «métrica de resultado > 0», o la fila NO va ═══');
{
  const ctx = ctxGenerador(itemsJulio());
  ctx.leerSeccionesPlano_ = () => ({
    comunicaciones_post: { modo: 'agregado', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM,SECCO' }
  });
  /* ⭐ Las filas son las REALES del fixture del 20/08: Retiro con datos, San Cristóbal TODO EN
   * CEROS — una fila creada y nunca cargada, que es el caso que la regla saca. */
  const RETIRO = { ID: 'A-RET', Habitantes: 41475, Alcance: 47753, 'Impresiones totales': 136971, Visualizaciones: 41204 };
  const SANCRIS = { ID: 'A-SCR', Habitantes: 41240, Alcance: 0, 'Impresiones totales': 0, Visualizaciones: 0 };
  ctx.itemsDeSeccion_ = () => ({ ok: true, items: [
    { id_cuenta: 'A-RET', clave: 'Retiro' },
    { id_cuenta: 'A-SCR', clave: 'San Cristóbal' }
  ] });
  ctx.campoIdCuentaDeSolapa_ = () => 'id_cuenta';
  ctx.encabezadoEnColumna_ = (b, s, col) => ({ A: 'ID', G: 'Alcance', J: 'Impresiones totales', M: 'Visualizaciones' }[col] || col);
  ctx.buscarMapeo = (b, s, campo) => ({ ok: true, columna:
    ({ id_cuenta: 'A', alc_real: 'G', imp_totales: 'J', vis_totales: 'M' }[campo] || '?') });
  ctx.normalizarIdCuenta_ = (x) => String(x || '').trim();
  ctx.filtrarFilasPorCuenta_ = (fs, enc, id) => fs.filter((f) => f[enc] === id);
  ctx.leerFuente = () => ({ ok: true, filas: [RETIRO, SANCRIS] });

  const METRICAS = ['alc_real', 'imp_totales', 'vis_totales'];
  const r = ctx.filasDeSolapaDelTemario_('jm', null, 'comunicaciones_post', 'reuniones', 'Agenda JM | Post', METRICAS);

  afirmar(r.ok === true, 'resuelve');
  afirmar(r.filas.length === 1 && r.filas[0].ID === 'A-RET',
    '⭐ solo entra Retiro: San Cristobal tiene fila y NINGUNA metrica > 0 (' + r.filas.length + ')');
  afirmar(r.sin_metrica === 1,
    '⚠ y se cuenta en `sin_metrica`, NO en `sin_fila` — «no hubo post» y «nadie cargo la base» son dos oficios');
  afirmar(r.sin_fila === 0, 'y `sin_fila` queda en 0: la fila existia');
  afirmar(r.items === 2, 'los dos items se contaron igual (' + r.items + ')');

  /* ⛔ Control negativo del propio control: SIN la lista de metricas, San Cristobal entra. Si esta
   * afirmacion fallara, la de arriba estaria pasando por otro motivo. */
  const sinRegla = ctx.filasDeSolapaDelTemario_('jm', null, 'comunicaciones_post', 'reuniones', 'Agenda JM | Post', []);
  afirmar(sinRegla.filas.length === 2 && sinRegla.sin_metrica === 0,
    '⛔ y SIN la lista de campos entran los dos — la regla es lo que saca a San Cristobal');

  /* ⚠ Un campo que no mapea no puede volver la regla mas laxa en silencio sin que se vea: si
   * ninguno resuelve, el conjunto queda vacio y no se filtra. Se afirma para que sea una decision
   * y no una sorpresa. */
  /* ⚠ Se rompe SOLO el mapeo de las metricas, no el de la clave: si la clave no mapea la funcion
   * falla entera y con motivo -verificado al escribir esto-, que es otro caso y esta bien asi. */
  ctx.buscarMapeo = (b, s2, campo) => (campo === 'id_cuenta'
    ? { ok: true, columna: 'A' }
    : { ok: false, motivo: 'no mapeado' });
  const sinMapeo = ctx.filasDeSolapaDelTemario_('jm', null, 'comunicaciones_post', 'reuniones', 'Agenda JM | Post', METRICAS);
  afirmar(sinMapeo.filas.length === 2,
    '⚠ con los campos SIN MAPEAR no se filtra: entran los dos, y se ve en `sin_metrica`=0');
}

console.log('\n═══ M · ⚠ romper a propósito: volver a «la primera que califique» ═══');
{
  /* ⭐ La sección `I` sólo prueba algo si **cae** cuando el resolver vuelve al comportamiento
   * viejo. Sin esto, `I` podría estar pasando por cualquier motivo — es la mitad que
   * `CLAUDE.md` §4 exige: mirar CUÁL afirmación cae y con qué motivo.
   *
   * ⚠ **Y el parche verifica que ocurrió**: `contexto()` tira si el `replace` no matchea nada.
   * Un parche que no aplica corre sobre el código intacto y da verde sin haber probado nada. */
  let elegida = null;
  try {
    const ctx = contexto('Generador.gs', (t) => t.replace(
      '  var s = secciones[id];',
      '  var s = secciones[id] || secciones[Object.keys(secciones)[0]];\n  id = s ? (s.seccion_id || Object.keys(secciones)[0]) : id;'));
    ctx.leerConfig = () => ({ seccion_agregado_semanal: 'NO_EXISTE_A_PROPOSITO' });
    ctx.leerSeccionesPlano_ = () => ({
      comunicaciones_post: { modo: 'agregado', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM,SECCO' },
      ecv_alcance_semanal: { modo: 'agregado', itera_sobre: 'REUNIONES', estado: 'activa', informes: 'JM,SECCO' }
    });
    ctx.itemsDeSeccion_ = (s) => { elegida = s.seccion_id; return { ok: true, items: itemsJulio() }; };
    ctx.filasRdvDelTemario_('jm', null);
  } catch (e) {
    fallas++; console.log('  ❌ el parche falló: ' + e.message);
  }
  afirmar(elegida === 'comunicaciones_post',
    '⭐ con el resolver roto elige la PRIMERA del objeto (' + elegida + ') — o sea que la sección I ' +
    'mide de verdad la corrección, y no está pasando por casualidad');
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
