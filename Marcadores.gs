/**
 * Marcadores.gs — EL CORAZÓN. Toda la aritmética del informe vive acá y en
 * ningún otro módulo (Fuentes.gs/Union.gs leen y ensamblan filas; Parseo.gs
 * normaliza texto; nadie más suma, promedia ni calcula ratios).
 *
 * Paso 2.9 Parte E — corte vertical: en vez del despachador genérico completo
 * de docs/Prompts/Paso-3-v2.md (que lee MARCADORES fila por fila), este primer
 * corte cablea a mano los diez tokens del bloque "alcance objetivo e
 * inscriptos" (`ecv_*`) para una sola reunión — "Uno a uno en Retiro,
 * 24/07/2026, pre" — y valida la cadena completa hasta `VISTA_PREVIA`. El
 * despachador genérico (Parte C de Paso-3-v2) queda para cuando se sID cablear
 * MARCADORES completo.
 *
 * Expone:
 *   opSUMA(ctx) / opCONTEO(ctx) / opULTIMO(ctx) / opRATIO(ctx) / opPCT(ctx) /
 *     opTEXTO(ctx) -> { valor, traza, filas }. `ctx` en este corte:
 *     { marcador, base_id, solapa, campo_logico, columna, valores, valor_fijo }
 *     — `valores` es el arreglo YA resuelto de la columna (no filas crudas):
 *     quien arma `ctx` es responsable de resolver MAPEO y extraer la columna;
 *     estas funciones solo hacen la cuenta, nunca abren una base.
 *   corteVerticalRetiro2407_() -> corre los diez tokens y escribe VISTA_PREVIA
 *     (10 filas de token + 3 de control). Ítem de menú "Calcular corte vertical
 *     (Paso 2.9E)".
 *
 * ⚠ Simplificación deliberada de este corte (documentada, no oculta): los diez
 * tokens se leen DIRECTO de la fila de `rdv` ya emparejada al encuentro (match
 * por barrio + fecha + status=Realizada). El diseño completo de Paso 2.9E pide
 * que `ecv_insc_mail/digital/cc/ivr` salgan de las solapas de canal
 * (`digital/Directa Mail`, `digital/Digital`, `looker/CC`, `digital/Directa
 * IVR`) vía la cuenta/campaña anclada a ese encuentro — no se cableó así acá
 * porque determinar CUÁL cuenta digital corresponde a "Retiro 24/07" requiere
 * inspeccionar la base viva de `digital`, que no está disponible en este
 * entorno de edición. Usar las columnas ya mapeadas de `rdv`
 * (`insc_mail`/`insc_cc`/`insc_ivr`/`insc_digital`/`insc_dif`, sembradas desde
 * el Paso 1.9) ejercita la cadena completa `REUNIONES` → anclaje →
 * `Marcadores.gs` → `VISTA_PREVIA` con datos reales y trazables — que es el
 * objetivo del corte — dejando pendiente, marcado en el código y en el commit,
 * migrar esos cuatro tokens a fuente de canal cuando se confirme el link.
 */

/**
 * SUMA de una columna ya resuelta. Ignora celdas vacías o no numéricas (no las
 * cuenta como 0 silenciosamente en el numerador, pero sí en el total de filas
 * — la traza distingue las dos cosas).
 */
function opSUMA(ctx) {
  var suma = 0;
  var conValor = 0;
  ctx.valores.forEach(function (valor) {
    if (valor === '' || valor === null || valor === undefined) return;
    var numero = Number(valor);
    if (isNaN(numero)) return;
    suma += numero;
    conValor++;
  });
  return {
    valor: suma,
    traza: 'SUMA de "' + ctx.campo_logico + '" (col ' + ctx.columna + ') sobre ' + ctx.valores.length + ' fila(s) de ' +
      ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') + ' (' + conValor + ' con valor numérico)',
    filas: ctx.valores.length
  };
}

function opCONTEO(ctx) {
  return {
    valor: ctx.valores.length,
    traza: 'CONTEO de filas de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : ''),
    filas: ctx.valores.length
  };
}

/**
 * Último valor no vacío del arreglo (recorrido de atrás hacia adelante) — para
 * stocks, para bases `snapshot`, y para una lectura DIRECTA de una sola fila
 * (`ctx.valores` con un único elemento: "último de 1" es exactamente ese valor,
 * con la traza dejando ver que la base fue 1 fila, no una agregación).
 */
function opULTIMO(ctx) {
  for (var i = ctx.valores.length - 1; i >= 0; i--) {
    var valor = ctx.valores[i];
    if (valor !== '' && valor !== null && valor !== undefined) {
      return {
        valor: valor,
        traza: 'ÚLTIMO valor no vacío de "' + ctx.campo_logico + '" (col ' + ctx.columna + ') sobre ' + ctx.valores.length +
          ' fila(s) de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : ''),
        filas: ctx.valores.length
      };
    }
  }
  return {
    valor: '',
    traza: 'ÚLTIMO: ninguna fila con valor no vacío en "' + ctx.campo_logico + '" sobre ' + ctx.valores.length + ' fila(s)',
    filas: ctx.valores.length
  };
}

/**
 * `campo_logico` para RATIO/PCT viene como `numerador/denominador` (Paso-3-v2
 * Parte A). Acá no se resuelve MAPEO: el llamador ya trajo `ctx.valoresNumerador`
 * / `ctx.valoresDenominador` resueltos (cada uno una SUMA propia).
 */
function opRATIO(ctx) {
  var numerador = ctx.valoresNumerador.reduce(function (acc, v) { var n = Number(v); return acc + (isNaN(n) ? 0 : n); }, 0);
  var denominador = ctx.valoresDenominador.reduce(function (acc, v) { var n = Number(v); return acc + (isNaN(n) ? 0 : n); }, 0);
  var valor = denominador ? numerador / denominador : '';
  return {
    valor: valor,
    traza: 'RATIO ' + ctx.numeradorNombre + '/' + ctx.denominadorNombre + ' = ' + numerador + '/' + denominador +
      (denominador ? '' : ' (denominador vacío o cero)'),
    filas: Math.max(ctx.valoresNumerador.length, ctx.valoresDenominador.length)
  };
}

function opPCT(ctx) {
  var ratio = opRATIO(ctx);
  return {
    valor: ratio.valor === '' ? '' : ratio.valor * 100,
    traza: 'PCT — ' + ratio.traza,
    filas: ratio.filas
  };
}

/** Valor literal cargado a mano — no sale de ninguna base. */
function opTEXTO(ctx) {
  return { valor: ctx.valor_fijo, traza: 'TEXTO literal (valor_fijo)', filas: 0 };
}

/**
 * Encuentra, dentro de `rdv/RVD JM-CM - ES`, la fila `Realizada` cuyo barrio
 * contiene "Retiro" el 24/07/2026 — el caso cableado a mano de Paso 2.9E.
 * Delega en `encontrarFilaRdvDeReunion_()` (Union.gs), la misma función que usa
 * el anclaje (Paso 2.9F) para no duplicar el matching REUNIONES→rdv en dos
 * archivos.
 */
function encontrarEncuentroRetiro2407_() {
  return encontrarFilaRdvDeReunion_({ nombre: 'Retiro', fecha: new Date(2026, 6, 24, 12, 0, 0) });
}

/**
 * Lee un `campo_logico` de `rdv` DIRECTO de la fila ya encontrada (una sola
 * fila: `ctx.valores` de un elemento) usando `opULTIMO` — "último de 1" es
 * exactamente esa celda, y la traza deja ver que la base fue 1 fila, no una
 * agregación. Si el campo no está mapeado o la celda vino vacía, devuelve
 * `«FALTA:token»` — no rompe la corrida (Paso 2.9E, "Resiliencia").
 */
function calcularTokenDirectoRdv_(token, hojaRdv, filaObjeto, campoLogico) {
  var campo = buscarMapeo('rdv', hojaRdv, campoLogico);
  if (!campo.ok) {
    return { token: token, valor: '«FALTA:' + token + '»', base: 'rdv', solapa: hojaRdv, columna: '', operacion: 'ÚLTIMO', filas: 0 };
  }

  var valorCrudo = valorPorColumna_(filaObjeto, 'rdv', hojaRdv, campo.columna);
  var resultado = opULTIMO({ campo_logico: campoLogico, columna: campo.columna, base_id: 'rdv', solapa: hojaRdv, valores: [valorCrudo] });

  return {
    token: token,
    valor: (resultado.valor === '' ? '«FALTA:' + token + '»' : resultado.valor),
    base: 'rdv',
    solapa: hojaRdv,
    columna: campo.columna,
    operacion: 'ÚLTIMO',
    filas: resultado.filas
  };
}

var HEADERS_VISTA_PREVIA_ = ['reunion', 'token', 'valor', 'base', 'solapa', 'columna', 'operacion', 'filas'];

// campo_logico (rdv) -> token ecv_* — los diez del bloque de alcance objetivo
// e inscriptos (docs/Prompts/Paso-2.9E.md).
var TOKENS_CORTE_VERTICAL_ = [
  { campo: 'comuna', token: 'ecv_comuna' },
  { campo: 'fecha_periodo', token: 'ecv_fecha' },
  { campo: 'insc_mail', token: 'ecv_insc_mail' },
  { campo: 'insc_digital', token: 'ecv_insc_digital' },
  { campo: 'insc_cc', token: 'ecv_insc_cc' },
  { campo: 'insc_dif', token: 'ecv_insc_dif' },
  { campo: 'insc_ivr', token: 'ecv_insc_ivr' },
  { campo: 'inscriptos', token: 'ecv_inscriptos' },
  { campo: 'asistentes', token: 'ecv_asistentes' },
  { campo: 'poblacion', token: 'ecv_poblacion' }
];

function corteVerticalRetiro2407_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('VISTA_PREVIA');
  if (!hoja) hoja = ss.insertSheet('VISTA_PREVIA');
  hoja.clear();
  hoja.getRange(1, 1, 1, HEADERS_VISTA_PREVIA_.length).setValues([HEADERS_VISTA_PREVIA_]);
  hoja.setFrozenRows(1);

  var reunionEtiqueta = 'Retiro 24/07 pre';

  var encuentro = encontrarEncuentroRetiro2407_();
  if (!encuentro.ok) {
    hoja.getRange(2, 1, 1, HEADERS_VISTA_PREVIA_.length)
      .setValues([[reunionEtiqueta, '(todos)', '«FALTA:encuentro» — ' + encuentro.motivo, 'rdv', '', '', '', 0]]);
    return { ok: false, motivo: encuentro.motivo };
  }

  var valoresPorToken = {};
  var filasHoja = TOKENS_CORTE_VERTICAL_.map(function (t) {
    var resultado = calcularTokenDirectoRdv_(t.token, encuentro.hoja, encuentro.fila, t.campo);
    valoresPorToken[t.token] = (typeof resultado.valor === 'number') ? resultado.valor : NaN;
    return [reunionEtiqueta, resultado.token, resultado.valor, resultado.base, resultado.solapa, resultado.columna, resultado.operacion, resultado.filas];
  });
  hoja.getRange(2, 1, filasHoja.length, HEADERS_VISTA_PREVIA_.length).setValues(filasHoja);

  // Validación (Paso 2.9E, "Validación"): los diez se controlan entre sí.
  var sumaCanales = ['ecv_insc_mail', 'ecv_insc_digital', 'ecv_insc_cc', 'ecv_insc_dif', 'ecv_insc_ivr']
    .reduce(function (acc, t) { return acc + (isNaN(valoresPorToken[t]) ? 0 : valoresPorToken[t]); }, 0);
  var inscriptos = valoresPorToken['ecv_inscriptos'];
  var asistentes = valoresPorToken['ecv_asistentes'];
  var poblacion = valoresPorToken['ecv_poblacion'];

  var check1 = !isNaN(inscriptos) && sumaCanales === inscriptos;
  var check2 = !isNaN(asistentes) && !isNaN(inscriptos) && asistentes < inscriptos;
  var check3 = !isNaN(inscriptos) && !isNaN(poblacion) && inscriptos < poblacion;

  var filasControl = [
    [reunionEtiqueta, 'control: suma canales = ecv_inscriptos', (check1 ? '✅ ' : '⚠ ') + sumaCanales + ' vs ' + inscriptos, '', '', '', 'CONTROL', ''],
    [reunionEtiqueta, 'control: asistentes < inscriptos', (check2 ? '✅ ' : '⚠ ') + asistentes + ' vs ' + inscriptos, '', '', '', 'CONTROL', ''],
    [reunionEtiqueta, 'control: inscriptos << poblacion', (check3 ? '✅ ' : '⚠ ') + inscriptos + ' vs ' + poblacion, '', '', '', 'CONTROL', '']
  ];
  hoja.getRange(2 + filasHoja.length, 1, filasControl.length, HEADERS_VISTA_PREVIA_.length).setValues(filasControl);

  return { ok: true, filas: filasHoja.length, controles: filasControl.length, cierraSuma: check1 };
}

function menuCorteVerticalRetiro2407_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = corteVerticalRetiro2407_();

  if (!resultado.ok) {
    ui.alert('No se pudo calcular el corte vertical', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  ui.alert(
    'Corte vertical (Paso 2.9E)',
    'VISTA_PREVIA: ' + resultado.filas + ' tokens + ' + resultado.controles + ' fila(s) de control.\n' +
      (resultado.cierraSuma
        ? '✅ La suma de canales cierra contra ecv_inscriptos.'
        : '⚠ La suma de canales NO cierra contra ecv_inscriptos — ver el detalle en VISTA_PREVIA, no se ajustó el total.'),
    ui.ButtonSet.OK
  );
}
