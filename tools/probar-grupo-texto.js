#!/usr/bin/env node
/**
 * tools/probar-grupo-texto.js — **`GRUPO_TEXTO`, la operación del `Período` de `L-036`**
 * (`docs/Prompts/2026-08-25_3_L036_periodo_desde_desglose.md`, Parte 3 + su ADDENDUM 1).
 *
 * ⛔⛔ **Lo que este banco existe para impedir, en orden de qué tan caro sale:**
 *
 *  1. **Agrupar por `fecha_periodo` en vez de por `id_cuenta`.** Dentro de `julio_24_30` hay **dos
 *     encuentros el 29/07** —`3389` Nueva Pompeya y `3420` Caballito—. Agrupados por fecha caen en
 *     **un solo grupo** y el período publicado abarca los dos: un rango más ancho, **plausible**, y
 *     de dos encuentros distintos. `fecha_periodo` es el campo de **orden**; `id_cuenta` es el de
 *     **identidad** (`D-30`).
 *  2. **Tomar «el n-ésimo grupo PRESENTE» en vez de la RANURA.** Un encuentro sin filas en el
 *     desglose correría todas las ranuras siguientes, y la ranura 3 mostraría el período de un
 *     encuentro al lado de los números de otro, **sin fallar**.
 *  3. **Indexar filas en vez de grupos.** Un encuentro tiene hasta cinco filas de plataforma con
 *     cinco pares de fechas: `FILA_TEXTO` publicaría las de *una* como si fueran las del encuentro.
 *
 * ⚠ **Este banco fija el MECANISMO, no los valores.** Los datos son construidos —dicho, no
 * disimulado—: no hay caso validado del `Período` de `L-036`, así que cualquier número que saliera
 * de acá **nacería sin validar** y no se puede citar (`CLAUDE.md` §1). Lo que sí se fija es la
 * identidad interna: **las filas POST del desglose de un encuentro suman lo que `Agenda JM | Post`
 * declara para ese mismo encuentro**, y eso vale en cada corrida sin depender del deck del equipo.
 *
 * Uso:
 *   node tools/probar-grupo-texto.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let corridas = 0;
function afirmar(condicion, mensaje) {
  corridas++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/* Formateador mínimo de fechas, con las dos formas que la plantilla usa. ⚠ Es un stub de la
 * PLATAFORMA (`Utilities`), no de lógica del motor: reimplementar `formatDate` no reimplementa
 * nada que este repo haya escrito. */
function formatearStub(d, tz, patron) {
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const aaaa = String(d.getUTCFullYear());
  return String(patron).replace(/dd/g, dd).replace(/MM/g, mm).replace(/yyyy/g, aaaa);
}

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error, parseInt,
    Logger: { log: () => {} },
    Utilities: { formatDate: formatearStub },
    Session: { getScriptTimeZone: () => 'UTC' }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    /* ⭐ **La guarda de mutación**, y no es opcional: si el parche no matchea, el caso negativo
     * corre sobre el código intacto, da verde, y eso se lee como «el negativo pasó» (`CLAUDE.md`
     * §4, 24/08). El archivo está en CRLF, así que los patrones van por fragmento de UNA línea. */
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'Marcadores.gs' });
  ctx.parsearFechaCelda_ = (v) => (v instanceof Date ? v
    : (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T12:00:00Z') : null));
  return ctx;
}

const F = (d) => new Date(d + 'T12:00:00Z');
const PLANTILLA = '{des_fecha_inicio:min:dd/MM} — {des_fecha_fin:max:dd/MM}';

/* Los campos de la plantilla ya resueltos a su clave de lectura — es lo que el despachador arma con
 * `resolverPlantillaTexto_`. */
const CAMPOS = {
  campos: {
    des_fecha_inicio: { clave: 'Fecha inicio', columna: 'I' },
    des_fecha_fin: { clave: 'Fecha fin', columna: 'J' }
  }
};

/** Una fila de desglose sellada por el temario, como la entrega `temarioPorSolapas_`. */
function fila(slot, id, plataforma, inicio, fin, extra) {
  const f = {
    __temario_slot__: slot, __temario_id__: id, __temario_fecha__: null,
    'Id cuentas': id, Plataforma: plataforma,
    'Fecha inicio': F(inicio), 'Fecha fin': F(fin)
  };
  Object.keys(extra || {}).forEach((k) => { f[k] = extra[k]; });
  return f;
}

function ctxOp(filas, n, extra) {
  const base = {
    filas: filas, valor_fijo: n, separador: 'fecha_periodo', campo_logico: PLANTILLA,
    plantilla: CAMPOS, base_id: 'digital', solapa: 'CAMPAÑAS_DESGLOCE_DIGITAL'
  };
  Object.keys(extra || {}).forEach((k) => { base[k] = extra[k]; });
  return base;
}

console.log('\n═══ A · ⭐ un encuentro con CINCO filas de plataforma publica UN período ═══');
{
  /* Es el caso que hace falta la operación: la unidad de la tabla es el encuentro, la de la fuente
   * es la fila de plataforma. `FILA_TEXTO` publicaría las fechas de una sola. */
  const filas = [
    fila(1, '3387', 'Meta', '2026-07-24', '2026-07-31'),
    fila(1, '3387', 'Google ads', '2026-07-26', '2026-08-06'),
    fila(1, '3387', 'Google ads', '2026-07-26', '2026-07-30'),
    fila(1, '3387', 'DV360', '2026-07-25', '2026-08-02'),
    fila(1, '3387', 'TikTok', '2026-07-28', '2026-08-01')
  ];
  const ctx = contexto();
  const r = ctx.opGRUPO_TEXTO(ctxOp(filas, 1));

  afirmar(r.valor === '24/07 — 06/08',
    '⭐ min de las cinco fechas de inicio y max de las cinco de fin: «' + r.valor + '»');
  afirmar(r.filas === 5, 'y declara que agregó sobre 5 filas (' + r.filas + ')');
  afirmar(/id_cuenta/.test(r.traza) && /3387/.test(r.traza),
    '⭐ la traza dice por qué agrupó y con qué identidad');
  afirmar(!r.ambiguo && !r.sin_datos, 'sin hueco ni ambigüedad');
  /* ⚠ El control que separa «tomó el min» de «tomó la primera»: la fila de menor inicio NO es la
   * primera, y la de mayor fin tampoco es la última. */
  afirmar(filas[0]['Fecha inicio'].getTime() === F('2026-07-24').getTime() &&
    filas[1]['Fecha fin'].getTime() === F('2026-08-06').getTime(),
    '⚠ y el fixture lo distingue: el max de fin está en la fila 2, no en la última');
}

console.log('\n═══ B · ⛔⛔ DOS encuentros el MISMO día son DOS grupos — la identidad es `id_cuenta` ═══');
{
  /* El caso real de `julio_24_30`: `3389` Nueva Pompeya y `3420` Caballito, los dos el 29/07.
   * Agrupados por fecha darían un solo grupo con el rango de los dos. */
  const dia = F('2026-07-29');
  const filas = [
    fila(1, '3389', 'Meta', '2026-07-29', '2026-08-02', { __temario_fecha__: dia }),
    fila(1, '3389', 'Google ads', '2026-07-30', '2026-08-03', { __temario_fecha__: dia }),
    fila(2, '3420', 'Meta', '2026-08-05', '2026-08-12', { __temario_fecha__: dia }),
    fila(2, '3420', 'DV360', '2026-08-06', '2026-08-15', { __temario_fecha__: dia })
  ];
  const ctx = contexto();
  const r1 = ctx.opGRUPO_TEXTO(ctxOp(filas, 1));
  const r2 = ctx.opGRUPO_TEXTO(ctxOp(filas, 2));

  afirmar(r1.valor === '29/07 — 03/08', '⭐ ranura 1 = Nueva Pompeya: «' + r1.valor + '»');
  afirmar(r2.valor === '05/08 — 15/08', '⭐ ranura 2 = Caballito: «' + r2.valor + '»');
  afirmar(r1.valor !== r2.valor, '⛔⛔ y son DISTINTOS: dos encuentros del mismo día, dos períodos');
  afirmar(/3389/.test(r1.traza) && /3420/.test(r2.traza),
    'cada traza nombra la cuenta de SU grupo');
  /* ⭐ El valor que se habría publicado agrupando por fecha, escrito para que se vea el daño: un
   * rango que abarca los dos encuentros, perfectamente plausible. */
  afirmar(r1.valor !== '29/07 — 15/08' && r2.valor !== '29/07 — 15/08',
    '⛔ ninguno publica «29/07 — 15/08», que es lo que daría el grupo fusionado');
}

console.log('\n═══ B bis · ⚠ romper a propósito: agrupar por `fecha_periodo` ═══');
{
  /* Control negativo con sus tres mitades: la mutación ocurre (guarda en `contexto`), cae por el
   * MOTIVO correcto —el rango fusionado exacto, no un rojo cualquiera— y prueba que el bloque B
   * mide de verdad la corrección. */
  const dia = F('2026-07-29');
  const filas = [
    fila(1, '3389', 'Meta', '2026-07-29', '2026-08-02', { __temario_fecha__: dia }),
    fila(1, '3389', 'Google ads', '2026-07-30', '2026-08-03', { __temario_fecha__: dia }),
    fila(2, '3420', 'Meta', '2026-08-05', '2026-08-12', { __temario_fecha__: dia }),
    fila(2, '3420', 'DV360', '2026-08-06', '2026-08-15', { __temario_fecha__: dia })
  ];
  const ctx = contexto((t) => t.replace(
    '    var r = f[CLAVE_SLOT_GRUPO_];',
    '    var r = String(f[\'__temario_fecha__\']);'
  ));
  const r1 = ctx.opGRUPO_TEXTO(ctxOp(filas, 1));

  afirmar(r1.valor === undefined || r1.valor === '' || r1.valor === '29/07 — 15/08',
    '⛔ agrupando por fecha, los dos encuentros caen en un grupo o la ranura deja de existir');
  const fusionado = (r1.valor === '29/07 — 15/08');
  const perdido = (r1.sin_datos === true);
  afirmar(fusionado || perdido,
    '⛔⛔ y el daño es uno de los dos: rango fusionado «29/07 — 15/08», o la ranura se pierde' +
    ' (valor=«' + r1.valor + '» sin_datos=' + !!r1.sin_datos + ')');
  afirmar(r1.valor !== '29/07 — 03/08',
    '⭐ o sea que el bloque B mide de verdad la corrección, y no está pasando por casualidad');
}

console.log('\n═══ C · ⛔⛔ una ranura sin grupo NO corre las demás ═══');
{
  /* San Cristóbal —ranura 2— no tiene filas en el desglose. Con «el n-ésimo grupo presente», la
   * ranura 2 publicaría el período de Villa Urquiza. */
  const filas = [
    fila(1, 'A-RET', 'Meta', '2026-07-24', '2026-07-31'),
    fila(3, 'A-URQ', 'Meta', '2026-07-27', '2026-08-04'),
    fila(4, 'A-ORD', 'Meta', '2026-07-28', '2026-08-05')
  ];
  const ctx = contexto();
  const r1 = ctx.opGRUPO_TEXTO(ctxOp(filas, 1));
  const r2 = ctx.opGRUPO_TEXTO(ctxOp(filas, 2));
  const r3 = ctx.opGRUPO_TEXTO(ctxOp(filas, 3));

  afirmar(r1.valor === '24/07 — 31/07', 'ranura 1 = Retiro: «' + r1.valor + '»');
  afirmar(r2.sin_datos === true && !r2.valor,
    '⛔⛔ ranura 2 queda VACÍA — el encuentro no tiene filas acá, y su casillero queda en su lugar');
  afirmar(r3.valor === '27/07 — 04/08',
    '⛔⛔ y la ranura 3 sigue siendo Villa Urquiza: la 2 no corrió a las demás («' + r3.valor + '»)');
  afirmar(/\[1, 3, 4\]/.test(r2.traza),
    '⭐ y la traza del hueco DICE qué ranuras sí tienen filas — «no hay» distinto de «no miré»');
  afirmar(/no corre las dem/i.test(r2.traza) || /NO corre/.test(r2.traza),
    '⚠ y declara que el hueco no desplaza nada, que es lo que un lector necesita saber');
}

console.log('\n═══ D · ⛔ sin RANURA sellada NO inventa un orden: falla ═══');
{
  /* Es la guarda que hace imposible el modo de falla del bloque C. Ordenar acá lo que llegó sería
   * «el n-ésimo grupo presente» con otro nombre. */
  const filas = [
    { 'Id cuentas': '3387', 'Fecha inicio': F('2026-07-24'), 'Fecha fin': F('2026-07-31') },
    { 'Id cuentas': '3389', 'Fecha inicio': F('2026-07-29'), 'Fecha fin': F('2026-08-02') }
  ];
  const ctx = contexto();
  const r = ctx.opGRUPO_TEXTO(ctxOp(filas, 1));

  afirmar(r.ambiguo === true && /grupo_sin_ranura/.test(r.traza),
    '⛔ sin `__temario_slot__` falla con `@grupo_sin_ranura`, no adivina');
  afirmar(!r.valor, 'y no publica ningún valor');
  afirmar(/temarioPorSolapas_/.test(r.traza),
    '⭐ y el motivo dice DÓNDE se sella la ranura — el que lee sabe qué arreglar');
  afirmar(/PRESENTE/.test(r.traza),
    '⚠ y nombra el bug que evita, no sólo la condición que no se cumplió');
}

console.log('\n═══ E · ⚠ el contrato: índice, orden y agregador ═══');
{
  const filas = [fila(1, '3387', 'Meta', '2026-07-24', '2026-07-31')];
  const ctx = contexto();

  const sinOrden = ctx.opGRUPO_TEXTO(ctxOp(filas, 1, { separador: '' }));
  afirmar(sinOrden.ambiguo === true && /grupo_sin_orden/.test(sinOrden.traza),
    '⛔ sin `separador` falla — misma doctrina que `FILA`: no hay orden por defecto');

  /* `C-83`: Sheets convierte `1/3` en fecha y `01` pierde el cero. */
  const barra = ctx.opGRUPO_TEXTO(ctxOp(filas, '1/3'));
  afirmar(barra.ambiguo === true && /grupo_indice_invalido/.test(barra.traza),
    '⛔ `valor_fijo = "1/3"` falla con el crudo adelante (`C-83`)');
  afirmar(/1\/3/.test(barra.traza), 'y la traza muestra qué llegó, sin deducir');

  const cero = ctx.opGRUPO_TEXTO(ctxOp(filas, 0));
  afirmar(cero.ambiguo === true, '⛔ la ranura es 1-based: `0` no es válida');

  const desconocido = ctx.opGRUPO_TEXTO(ctxOp(filas, 1, {
    campo_logico: '{des_fecha_inicio:promedio:dd/MM}'
  }));
  afirmar(/«\?des_fecha_inicio»/.test(desconocido.valor),
    '⚠ un agregador desconocido deja HUECO VISIBLE, no adivina un default («' + desconocido.valor + '»)');
  afirmar(/promedio/.test(desconocido.traza) && /min\/max/.test(desconocido.traza),
    '⭐ y la traza nombra el que llegó y los que hay');

  const sinCampo = ctx.opGRUPO_TEXTO(ctxOp(filas, 1, {
    campo_logico: '{des_impresiones:suma}', plantilla: { campos: { des_impresiones: { clave: null } } }
  }));
  afirmar(/«\?des_impresiones»/.test(sinCampo.valor),
    '⚠ un campo sin mapeo también deja hueco visible en vez de frenar el marcador');
}

console.log('\n═══ F · ⭐ `suma` y `conteo` sobre el grupo — los otros dos agregadores ═══');
{
  const filas = [
    fila(1, '3387', 'Meta', '2026-07-24', '2026-07-31', { Impresiones: 100, Visualizaciones: 40 }),
    fila(1, '3387', 'Google ads', '2026-07-26', '2026-08-06', { Impresiones: 250, Visualizaciones: 90 }),
    fila(1, '3387', 'DV360', '2026-07-25', '2026-08-02', { Impresiones: 50, Visualizaciones: 20 })
  ];
  const CAMPOS_NUM = { campos: {
    des_impresiones: { clave: 'Impresiones', columna: 'O' },
    des_plataforma: { clave: 'Plataforma', columna: 'F' }
  } };
  const ctx = contexto();
  const r = ctx.opGRUPO_TEXTO(ctxOp(filas, 1, {
    campo_logico: '{des_impresiones:suma} en {des_plataforma:conteo} plataforma(s)',
    plantilla: CAMPOS_NUM
  }));
  afirmar(r.valor === '400 en 3 plataforma(s)', '⭐ suma y conteo sobre el mismo grupo: «' + r.valor + '»');
}

console.log('\n═══ G · ⭐⭐ la identidad interna: el desglose de un encuentro CUADRA con `Agenda JM | Post` ═══');
{
  /* ⭐⭐ **Es el control primario de que las dos fuentes están alineadas fila por fila**, y no
   * depende del deck del equipo ni de una foto de la base: `Agenda JM | Post` es un agregado
   * derivado del desglose. Se puede exigir en CADA corrida y **no envejece** — ni la inestabilidad
   * por CAMBIO de `R-31` lo rompe, porque si la fuente se mueve se mueven las partes Y el total.
   *
   * ⚠ **Los números son construidos**, no medidos: fija la relación, no los valores. Un número
   * medido acá nacería sin validar y no se podría citar (`CLAUDE.md` §1). */
  const desglose = [
    fila(1, '3387', 'Meta', '2026-07-24', '2026-07-31', { Impresiones: 136971, Visualizaciones: 41204 }),
    fila(1, '3387', 'Google ads', '2026-07-26', '2026-08-06', { Impresiones: 81000, Visualizaciones: 25000 }),
    fila(1, '3387', 'DV360', '2026-07-25', '2026-08-02', { Impresiones: 12029, Visualizaciones: 3796 }),
    fila(2, '3389', 'Meta', '2026-07-29', '2026-08-02', { Impresiones: 5000, Visualizaciones: 1000 })
  ];
  /* La fila del encuentro en la solapa que califica, con col J (impresiones) y col M
   * (visualizaciones) — las dos columnas que el agregado declara. */
  const AGENDA = { '3387': { J: 230000, M: 70000 }, '3389': { J: 5000, M: 1000 } };

  const ctx = contexto();
  const CAMPOS_NUM = { campos: { des_impresiones: { clave: 'Impresiones', columna: 'O' } } };
  const CAMPOS_VIS = { campos: { des_visualizaciones: { clave: 'Visualizaciones', columna: 'P' } } };

  const imp1 = ctx.opGRUPO_TEXTO(ctxOp(desglose, 1, {
    campo_logico: '{des_impresiones:suma}', plantilla: CAMPOS_NUM
  }));
  const vis1 = ctx.opGRUPO_TEXTO(ctxOp(desglose, 1, {
    campo_logico: '{des_visualizaciones:suma}', plantilla: CAMPOS_VIS
  }));
  afirmar(Number(imp1.valor) === AGENDA['3387'].J,
    '⭐⭐ la suma de las filas POST del desglose = `Agenda JM | Post` col J (' + imp1.valor + ')');
  afirmar(Number(vis1.valor) === AGENDA['3387'].M,
    '⭐⭐ y lo mismo para col M, visualizaciones (' + vis1.valor + ')');

  const imp2 = ctx.opGRUPO_TEXTO(ctxOp(desglose, 2, {
    campo_logico: '{des_impresiones:suma}', plantilla: CAMPOS_NUM
  }));
  afirmar(Number(imp2.valor) === AGENDA['3389'].J,
    '⭐ y el segundo encuentro cuadra con SU fila, no con la del primero (' + imp2.valor + ')');
  afirmar(Number(imp1.valor) !== Number(imp2.valor),
    '⚠ y los dos totales son distintos: el control distingue encuentros, no sólo suma');
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + corridas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' de ' + corridas + ' afirmación(es) fallaron.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Ningún valor publicado. Los datos son construidos y no hay caso validado del');
console.log('     `Período` de `L-036` — un número que saliera de acá nacería SIN VALIDAR.');
console.log('   · Que el cableado apunte a las columnas correctas: eso lo dice `MAPEO`, y la');
console.log('     identidad del bloque G se exige contra la fuente viva en la corrida.');
console.log('   · Que la RANURA esté bien calculada: eso es `temarioPorSolapas_`, y lo fijan los');
console.log('     bloques O/P/Q de `probar-agregado-por-temario.js`.');

process.exit(fallas === 0 ? 0 : 1);
