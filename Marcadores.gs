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
 *     opTEXTO(ctx) -> { valor, traza, filas }. Quien arma `ctx` es responsable de
 *     resolver MAPEO y de traer los datos ya leídos y ya filtrados; estas
 *     funciones solo hacen la cuenta, nunca abren una base.
 *   despacharOperacion_(nombre, ctx) -> { ok, valor, traza, filas } | { ok, motivo }
 *     — resuelve por MAPA EXPLÍCITO (`OPERACIONES_`), nunca por `eval` ni contra
 *     el global, y soporta el escape hatch `FN:` contra `FUNCIONES_PROPIAS_`.
 *     Paso 3 (v3) Parte A.
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

/* ============ Paso 3 (v3) Parte A — contrato de `ctx` y despacho ============
 *
 * Las seis operaciones ya existían desde el corte vertical del `Paso-2.9E`. Lo que agrega
 * esta parte es el contrato que el `Paso-3-v3` declara y que el despachador de la Parte C
 * necesita, sin romper al llamador que ya hay (`corteVerticalRetiro2407_`):
 *
 *   ctx = { marcador, base_id, solapa, campo_logico, columna, ventana, filas | valores,
 *           encabezado, valor_fijo }
 *
 * **`filas` y `valores` son dos formas de lo mismo, y se aceptan las dos a propósito.**
 * `valores` es el arreglo de la columna ya extraído — es lo que pasa el corte vertical, que
 * lee una fila sola—. `filas` son los objetos que devuelve `leerFuente()`, YA leídos y YA
 * filtrados por ventana y por `MAPEO.valores_incluidos` (`Paso-2.16`): el despachador pide
 * los datos y confía. De `filas` se extrae con `ctx.encabezado`, que es el **nombre** de la
 * columna, no su letra.
 *
 * **Por qué el nombre y no la letra:** resolver letra → encabezado es leer `MAPEO`, y estas
 * funciones **no resuelven `MAPEO` ni abren bases** — sólo hacen la cuenta. `ctx.columna` va
 * igual, pero sólo para la traza: quien la lee necesita saber de qué columna salió el
 * número.
 */

/** El arreglo de valores sobre el que opera, venga como `valores` o como `filas`. */
function valoresDeCtx_(ctx) {
  if (ctx.valores) return ctx.valores;
  if (!ctx.filas) return [];
  var clave = ctx.encabezado;
  return ctx.filas.map(function (fila) {
    return clave && (clave in fila) ? fila[clave] : '';
  });
}

/** ` , 26/06–02/07` para la traza, o vacío si el `ctx` no trae ventana. */
function trazaDeVentana_(ctx) {
  if (!ctx.ventana || !ctx.ventana.desde || !ctx.ventana.hasta) return '';
  return ', ' + formatearFecha_(ctx.ventana.desde) + '–' + formatearFecha_(ctx.ventana.hasta);
}

/**
 * SUMA de una columna ya resuelta. Ignora celdas vacías o no numéricas (no las
 * cuenta como 0 silenciosamente en el numerador, pero sí en el total de filas
 * — la traza distingue las dos cosas).
 */
function opSUMA(ctx) {
  var valores = valoresDeCtx_(ctx);
  var suma = 0;
  var conValor = 0;
  valores.forEach(function (valor) {
    if (valor === '' || valor === null || valor === undefined) return;
    var numero = Number(valor);
    if (isNaN(numero)) return;
    suma += numero;
    conValor++;
  });
  return {
    valor: suma,
    traza: 'SUMA de "' + ctx.campo_logico + '" (col ' + ctx.columna + ') sobre ' + valores.length + ' fila(s) de ' +
      ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') + ' (' + conValor + ' con valor numérico)' + trazaDeVentana_(ctx),
    filas: valores.length
  };
}

function opCONTEO(ctx) {
  var valores = valoresDeCtx_(ctx);
  return {
    valor: valores.length,
    traza: 'CONTEO de filas de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') + trazaDeVentana_(ctx),
    filas: valores.length
  };
}

/**
 * Último valor no vacío del arreglo (recorrido de atrás hacia adelante) — para
 * stocks, para bases `snapshot`, y para una lectura DIRECTA de una sola fila
 * (`ctx.valores` con un único elemento: "último de 1" es exactamente ese valor,
 * con la traza dejando ver que la base fue 1 fila, no una agregación).
 */
function opULTIMO(ctx) {
  var valores = valoresDeCtx_(ctx);

  // `ULTIMO` por FECHA (12/08) — antes era "la última posición del array", o sea **el orden
  // de filas de la hoja**. Con el filtro `mail_tipo=Convocatoria` quedan tres filas —22/07
  // ×2 y 25/07— y el número correcto (44.043) salía sólo porque la del 25/07 está última.
  // Las del 22/07 son **201.515** y **25.560**: reordenar la hoja cambiaba el número a uno
  // grande, plausible y con el rótulo correcto al lado, sin que saltara nada. Es el mismo
  // modo de falla que la cuenta `3347`, que sobrevivió tres semanas por eso.
  //
  // `ctx.fechas` lo arma el despachador (resolver qué columna es la fecha es **estructura**,
  // y vive en `Generador.gs`; acá sólo se elige, que es la parte que sí es de este módulo).
  // Si no viene, se cae al comportamiento viejo **y la traza lo dice** — hay marcadores sobre
  // solapas sin fecha mapeada que hoy funcionan así y no se rompen por esto.
  var fechas = ctx.fechas;
  if (fechas && fechas.length === valores.length) {
    var candidatos = [];
    for (var f = 0; f < valores.length; f++) {
      var v = valores[f];
      if (v === '' || v === null || v === undefined) continue;
      if (!fechas[f]) continue;
      candidatos.push({ valor: v, fecha: fechas[f] });
    }

    if (candidatos.length) {
      candidatos.sort(function (a, b) { return b.fecha.getTime() - a.fecha.getTime(); });
      var tope = candidatos[0].fecha.getTime();
      var empatados = candidatos.filter(function (c) { return c.fecha.getTime() === tope; });
      var distintos = {};
      empatados.forEach(function (c) { distintos[String(c.valor)] = true; });

      // Empate real: misma fecha máxima y **valores distintos**. No se elige. Si los valores
      // empatados son idénticos no hay nada que decidir y elegir cualquiera es lo mismo.
      if (Object.keys(distintos).length > 1) {
        return {
          valor: '',
          ambiguo: true,
          traza: '«FALTA:@ultimo_ambiguo» — ÚLTIMO por fecha: ' + empatados.length + ' filas comparten la fecha ' +
            'más alta (' + Utilities.formatDate(candidatos[0].fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy') +
            ') con valores distintos (' + Object.keys(distintos).join(' / ') + ') en "' + ctx.campo_logico +
            '". No se elige: un número plausible de la fila equivocada es peor que un hueco' + trazaDeVentana_(ctx),
          filas: valores.length
        };
      }

      return {
        valor: candidatos[0].valor,
        traza: 'ÚLTIMO por fecha de "' + ctx.campo_logico + '" (col ' + ctx.columna + '): se eligió la fila del ' +
          Utilities.formatDate(candidatos[0].fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy') + ', la más alta de ' +
          candidatos.length + ' fila(s) con valor y fecha, sobre ' + valores.length + ' fila(s) de ' +
          ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') + trazaDeVentana_(ctx),
        filas: valores.length
      };
    }
  }

  for (var i = valores.length - 1; i >= 0; i--) {
    var valor = valores[i];
    if (valor !== '' && valor !== null && valor !== undefined) {
      return {
        valor: valor,
        traza: 'ÚLTIMO por POSICIÓN (sin fecha utilizable) de "' + ctx.campo_logico + '" (col ' + ctx.columna +
          ') sobre ' + valores.length + ' fila(s) de ' + ctx.base_id + (ctx.solapa ? '/' + ctx.solapa : '') +
          trazaDeVentana_(ctx),
        filas: valores.length
      };
    }
  }
  return {
    valor: '',
    traza: 'ÚLTIMO: ninguna fila con valor no vacío en "' + ctx.campo_logico + '" sobre ' + valores.length + ' fila(s)' +
      trazaDeVentana_(ctx),
    filas: valores.length
  };
}

/**
 * `campo_logico` para RATIO/PCT viene como `numerador/denominador` (Paso-3-v2
 * Parte A). Acá no se resuelve MAPEO: el llamador ya trajo `ctx.valoresNumerador`
 * / `ctx.valoresDenominador` resueltos (cada uno una SUMA propia).
 */
function opRATIO(ctx) {
  // Paso 3 (v3): el contrato exige los dos arreglos resueltos. Si falta alguno, se dice
  // cuál — un TypeError acá sale en la traza como "Cannot read properties of undefined",
  // que no le dice nada a quien mira el informe.
  if (!ctx.valoresNumerador || !ctx.valoresDenominador) {
    throw new Error('RATIO/PCT necesita `valoresNumerador` y `valoresDenominador` ya resueltos; ' +
      'falta ' + (!ctx.valoresNumerador ? '`valoresNumerador`' : '`valoresDenominador`') +
      '. `campo_logico` se declara como "numerador/denominador" y lo resuelve el despachador, no esta función.');
  }

  var numerador = ctx.valoresNumerador.reduce(function (acc, v) { var n = Number(v); return acc + (isNaN(n) ? 0 : n); }, 0);
  var denominador = ctx.valoresDenominador.reduce(function (acc, v) { var n = Number(v); return acc + (isNaN(n) ? 0 : n); }, 0);
  var valor = denominador ? numerador / denominador : '';

  // Los nombres son para la traza. Si el llamador no los pasa, se parten de `campo_logico`,
  // que el prompt declara con la forma `numerador/denominador`.
  var partes = String(ctx.campo_logico || '').split('/');
  var nombreNum = ctx.numeradorNombre || partes[0] || 'numerador';
  var nombreDen = ctx.denominadorNombre || partes[1] || 'denominador';

  return {
    valor: valor,
    traza: 'RATIO ' + nombreNum + '/' + nombreDen + ' = ' + numerador + '/' + denominador +
      (denominador ? '' : ' (denominador vacío o cero)') + trazaDeVentana_(ctx),
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

/**
 * Valor literal cargado a mano — no sale de ninguna base.
 *
 * ⚠ **`TEXTO` no arma listas.** Lee un literal de `valor_fijo` y nada más. Una caja que
 * enumera —los doce nombres de campaña de la lámina M2— **no tiene operación todavía**:
 * ninguna de las seis devuelve un arreglo concatenado, y meter esa lista en `valor_fijo`
 * sería curaduría manual disfrazada de configuración, que cambia cada semana. Está anotado
 * como `P1` en `docs/PENDIENTES_consistencia.md`, con sus candidatos.
 */
function opTEXTO(ctx) {
  return { valor: ctx.valor_fijo, traza: 'TEXTO literal (valor_fijo)', filas: 0 };
}

/**
 * Mapa explícito `operacion -> función`. **Nunca `eval`, y nunca `this[nombre]`**: en Apps
 * Script todos los `.gs` comparten un único scope global, así que resolver por nombre contra
 * el global convierte una celda de `MARCADORES` en la capacidad de invocar cualquier función
 * del proyecto — incluidas las que escriben. Un mapa es la lista blanca.
 */
var OPERACIONES_ = {
  SUMA: opSUMA,
  CONTEO: opCONTEO,
  ULTIMO: opULTIMO,
  RATIO: opRATIO,
  PCT: opPCT,
  TEXTO: opTEXTO
};

/**
 * Escape hatch del `Paso-3-v3`: `operacion = FN:nombreDeLaFuncion`, con la misma firma y
 * viviendo también en este módulo. **Es la excepción.** Si al terminar JM hay más de un
 * puñado de `FN:`, falta una operación genérica y conviene agregarla en vez de multiplicar
 * funciones — la regla está en el prompt y se repite acá porque es donde se va a leer.
 */
var PREFIJO_FN_ = 'FN:';

/**
 * Resuelve el nombre de operación de una fila de `MARCADORES` y la ejecuta.
 * Devuelve `{ ok, valor, traza, filas }` o `{ ok: false, motivo }`.
 *
 * No decide qué operación va: la lee de la configuración. No lee bases ni resuelve `MAPEO`.
 */
function despacharOperacion_(nombreOperacion, ctx) {
  var nombre = String(nombreOperacion || '').trim();
  if (!nombre) {
    return { ok: false, motivo: 'La fila de MARCADORES no declara `operacion`' };
  }

  var fn;
  if (nombre.indexOf(PREFIJO_FN_) === 0) {
    var propio = nombre.slice(PREFIJO_FN_.length).trim();
    // El escape hatch tampoco resuelve contra el global: se declara acá.
    fn = FUNCIONES_PROPIAS_[propio];
    if (!fn) {
      return {
        ok: false,
        motivo: 'operacion "' + nombre + '": no hay una función "' + propio + '" declarada en `FUNCIONES_PROPIAS_` ' +
          '(Marcadores.gs). Las que hay: ' + (Object.keys(FUNCIONES_PROPIAS_).join(', ') || '(ninguna)')
      };
    }
  } else {
    fn = OPERACIONES_[nombre];
    if (!fn) {
      return {
        ok: false,
        motivo: 'operacion "' + nombre + '" desconocida. Las genéricas son: ' + Object.keys(OPERACIONES_).join(', ') +
          '; para una propia, `' + PREFIJO_FN_ + 'nombre`'
      };
    }
  }

  var resultado;
  try {
    resultado = fn(ctx);
  } catch (e) {
    // Resiliencia: un token que falla no corta la corrida (Parte C del prompt). Acá se
    // convierte la excepción en un motivo legible; quien despacha decide qué hacer con él.
    return { ok: false, motivo: 'operacion "' + nombre + '" falló: ' + (e && e.message ? e.message : e) };
  }

  return {
    ok: true,
    valor: resultado.valor,
    traza: resultado.traza,
    filas: resultado.filas
  };
}

/**
 * Funciones propias del escape hatch `FN:`. **Vacío a propósito**: cada entrada acá es una
 * operación que no se pudo expresar con las seis genéricas, y esa lista es la medición de
 * `D-01` para el despachador — si crece, falta una genérica.
 */
var FUNCIONES_PROPIAS_ = {};

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
  var ui = ui_();
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
