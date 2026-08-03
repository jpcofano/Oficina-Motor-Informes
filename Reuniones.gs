/**
 * Reuniones.gs — Paso 2.9D: el temario de reuniones (llega por WhatsApp, hoy se
 * transcribe a mano) como registro de configuración. Mismo patrón que CAMPANAS:
 * curado a mano — el motor PROPONE el parseo de una línea cruda, la persona
 * confirma con `mostrar`. R-02 (docs/REGLAS_NEGOCIO.md): el temario define el
 * universo del informe, no la fecha.
 *
 * Expone:
 *   leerReuniones_() -> filas con mostrar='sí', ordenadas por orden. Mismo
 *     contrato que leerCampanas() (Config.gs).
 *   parsearLineaReunion_(lineaCruda) -> objeto fila propuesto. SIEMPRE conserva
 *     `texto_original`; si no pudo interpretar, deja el resto vacío y
 *     `notas='no se pudo parsear'`. Nunca marca `mostrar='sí'` sola — eso lo
 *     decide la persona.
 *   cargarTemarioReuniones_(textoPegado) -> parsea cada línea no vacía y la
 *     agrega a REUNIONES con `mostrar=''`.
 *   menuCargarTemarioReuniones_() -> pide el texto por prompt de UI.
 *
 * Formato esperado de una línea: "[N)] eje | tipo nombre fecha (etapa)".
 * Ver docs/Prompts/Paso-2.9D.md y docs/TEMARIO_Y_PLANTILLA_2026-07-31.md.
 */

var TIPOS_REUNION_CONOCIDOS_ = [
  'Encuentro Temático',
  'Primera persona',
  'Uno a uno',
  'Reuniones de la semana',
  'Campañas y enviados de la semana',
  'ECV'
];

// `eje` -> `tipo` por defecto cuando el texto no trae uno de los TIPOS_REUNION_CONOCIDOS_
// de arriba. Ministros y M2 son bloques agregados de período, no encuentros
// individuales (docs/Prompts/Paso-2.9D.md, contexto).
var TIPO_AGREGADO_POR_EJE_ = { Ministros: 'Agregado', M2: 'Agregado' };

function leerReuniones_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
  if (!hoja) return [];

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });
  if (idx.eje === undefined || idx.mostrar === undefined) return [];

  return datos
    .filter(function (fila) { return fila[idx.eje] && esVerdadero_(fila[idx.mostrar]); })
    .sort(function (a, b) { return (Number(a[idx.orden]) || 0) - (Number(b[idx.orden]) || 0); })
    .map(function (fila) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = fila[i]; });
      return obj;
    });
}

/**
 * Parsea una línea cruda del temario. Devuelve SIEMPRE un objeto con
 * `texto_original` completo; si no se puede interpretar eje/tipo/nombre/fecha,
 * el resto de los campos queda vacío y `notas='no se pudo parsear'` — no lanza,
 * no adivina, y `mostrar` sale siempre `''` (la persona confirma).
 */
function parsearLineaReunion_(lineaCruda) {
  var textoOriginal = String(lineaCruda === null || lineaCruda === undefined ? '' : lineaCruda).trim();
  // Paso 2.15 Parte B: `periodo_id` sale acá vacío a propósito — no se deduce de la
  // fecha de la línea. Con ventanas variables (R-11 Addendum 1) la fecha no determina
  // el período, así que lo pone el llamador o no lo pone nadie.
  var propuesta = { periodo_id: '', orden: '', eje: '', tipo: '', nombre: '', fecha: '', etapa: '', mostrar: '', texto_original: textoOriginal, notas: '' };
  if (!textoOriginal) return propuesta;

  var texto = textoOriginal;

  var numero = texto.match(/^(\d+)\)\s*/);
  if (numero) {
    propuesta.orden = Number(numero[1]);
    texto = texto.slice(numero[0].length);
  }

  var partes = texto.split('|');
  if (partes.length < 2) {
    propuesta.notas = 'no se pudo parsear';
    return propuesta;
  }
  propuesta.eje = partes[0].trim();
  var resto = partes.slice(1).join('|').trim();

  var parenFinal = resto.match(/\(([^)]*)\)\s*$/);
  var dentroParen = '';
  if (parenFinal) {
    dentroParen = parenFinal[1].trim();
    resto = resto.slice(0, parenFinal.index).trim();
  }
  if (/^pre$/i.test(dentroParen)) {
    propuesta.etapa = 'pre';
  } else if (/^post$/i.test(dentroParen)) {
    propuesta.etapa = 'post';
  } else if (dentroParen) {
    propuesta.notas = dentroParen; // ej. "24/07 al 30/07 inclusive - Acumulado"
  }

  var tipoEncontrado = TIPOS_REUNION_CONOCIDOS_
    .filter(function (t) { return resto.toLowerCase().indexOf(t.toLowerCase()) !== -1; })
    .sort(function (a, b) { return b.length - a.length; })[0]; // el más largo/específico primero

  var nombreYFecha = resto;
  if (tipoEncontrado) {
    propuesta.tipo = tipoEncontrado;
    var idxTipo = resto.toLowerCase().indexOf(tipoEncontrado.toLowerCase());
    nombreYFecha = resto.slice(idxTipo + tipoEncontrado.length).trim();
  } else if (TIPO_AGREGADO_POR_EJE_[propuesta.eje]) {
    propuesta.tipo = TIPO_AGREGADO_POR_EJE_[propuesta.eje];
  }

  var anioDefecto = new Date().getFullYear();
  var fecha = parsearFecha_(nombreYFecha, anioDefecto);
  var matchFecha = nombreYFecha.match(/\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?/);

  if (fecha) {
    propuesta.fecha = fecha;
    var nombre = matchFecha ? nombreYFecha.slice(0, matchFecha.index) : nombreYFecha;
    nombre = nombre.replace(/^(en el|en la|en|del|de la|de)\s+/i, '').trim();
    propuesta.nombre = nombre || nombreYFecha.trim();
  } else {
    propuesta.nombre = nombreYFecha.trim();
    propuesta.notas = (propuesta.notas ? propuesta.notas + ' | ' : '') + 'no se encontró fecha';
  }

  if (!propuesta.tipo && !fecha) {
    // Ni tipo conocido ni fecha: no hay con qué proponer nada, es la línea la
    // que no se pudo interpretar, no un dato parcial.
    propuesta.notas = 'no se pudo parsear';
  }

  return propuesta;
}

/**
 * Agrega a REUNIONES una fila por cada línea no vacía de `textoPegado`, con
 * `mostrar=''` siempre — la persona confirma cuáles entran al informe. No pisa
 * filas existentes, solo agrega (mismo criterio que `inventariarSolapas()`: no
 * se adivina, se descubre y se dejan las decisiones para quien mira la hoja).
 */
function cargarTemarioReuniones_(textoPegado, periodoId) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
  if (!hoja) return { ok: false, motivo: 'La hoja REUNIONES no existe. Corré "Instalar / reparar hojas" primero.' };

  var lineas = String(textoPegado || '').split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
  if (!lineas.length) return { ok: true, agregadas: 0, sinParsear: 0 };

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var sinParsear = 0;
  var filas = lineas.map(function (linea) {
    var propuesta = parsearLineaReunion_(linea);
    // Paso 2.15 Parte B: el período lo pone el llamador, que ya lo validó contra
    // PERIODOS. Acá no se valida de nuevo ni se completa con un default.
    propuesta.periodo_id = periodoId;
    if (propuesta.notas === 'no se pudo parsear' || propuesta.notas.indexOf('no se encontró fecha') !== -1) sinParsear++;
    return headers.map(function (h) { return (h in propuesta) ? propuesta[h] : ''; });
  });

  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
  return { ok: true, agregadas: filas.length, sinParsear: sinParsear };
}

/**
 * Paso 2.14 — el trabajo, con el texto por parámetro. Invocable por API.
 *
 * El `prompt` del ítem de menú no era una guarda de confirmación: era **el insumo
 * del paso**. Sobre HTTP no hay a quién pedirle el temario, y no se inventa — si
 * falta el texto, **falla explícito**. Ésa es la diferencia con un `confirm`, que
 * degrada solo a "no confirmado" (ver `ui_()` en `Codigo.gs`).
 */
function cargarTemario(texto, periodoId) {
  if (!texto || !String(texto).trim()) {
    throw new Error('cargarTemario: falta el texto del temario. Desde el menú lo pide un ' +
      'prompt; por API entra por parámetro — una línea por reunión.');
  }
  // Paso 2.15 Parte B (D-19): el período es obligatorio y NO se asume el vigente.
  // Sin `periodo_id` la fila entra sin período y la curaduría de esta semana pisa la
  // de la anterior sin dejar rastro — el modo de falla que D-08 vino a cerrar. Falla
  // explícito, como con el texto: cuando falta una definición, el motor no la inventa
  // (D-10).
  if (!periodoId || !String(periodoId).trim()) {
    throw new Error('cargarTemario: falta el periodo_id. Una fila sin período no entra a ' +
      'ningún informe (D-19), y asumir el vigente en silencio es justo lo que periodo_id ' +
      'viene a evitar. Períodos disponibles: ' + Object.keys(leerPeriodos()).join(', '));
  }
  periodoId = String(periodoId).trim();
  if (!leerPeriodos()[periodoId]) {
    throw new Error('cargarTemario: el periodo_id "' + periodoId + '" no existe en PERIODOS. ' +
      'Cargalo ahí primero — el motor no crea períodos. Disponibles: ' +
      Object.keys(leerPeriodos()).join(', '));
  }

  var ui = ui_();
  var resultado = cargarTemarioReuniones_(texto, periodoId);
  if (!resultado.ok) {
    ui.alert('No se pudo cargar', resultado.motivo, ui.ButtonSet.OK);
    return ui.texto();
  }

  ui.alert(
    'Temario cargado',
    'Período: ' + periodoId + '\nFilas agregadas: ' + resultado.agregadas +
      (resultado.sinParsear ? '\n⚠ ' + resultado.sinParsear + ' no se pudieron interpretar del todo — revisar notas y texto_original.' : '') +
      '\n\nNinguna quedó con mostrar=sí: confirmá a mano cuáles entran al informe.',
    ui.ButtonSet.OK
  );
  return ui.texto();
}

/**
 * Envoltorio de menú: consigue el texto con el `prompt` y delega. Con planilla se
 * comporta igual que siempre; sin planilla no se llega acá (el ítem de menú no
 * existe sobre HTTP) y quien quiera correrlo por API llama a `cargarTemario(texto)`.
 */
function menuCargarTemarioReuniones_() {
  var ui = ui_();

  // Paso 2.15 Parte B: el período se pide primero. Si se pidiera después del texto,
  // cancelar acá tiraría un temario ya pegado.
  var disponibles = Object.keys(leerPeriodos());
  if (!disponibles.length) {
    ui.alert('Falta configuración', 'No hay ninguna fila en PERIODOS. Cargá el período ' +
      'antes de cargar el temario: una reunión sin período no entra a ningún informe (D-19).',
      ui.ButtonSet.OK);
    return;
  }
  var respuestaPeriodo = ui.prompt(
    'Período del temario',
    '¿A qué período pertenecen estas reuniones?\nDisponibles: ' + disponibles.join(', '),
    ui.ButtonSet.OK_CANCEL
  );
  if (respuestaPeriodo.getSelectedButton() !== ui.Button.OK) return;

  var respuesta = ui.prompt(
    'Cargar temario de reuniones',
    'Pegá el texto del temario (una línea por reunión). Se agrega a REUNIONES con mostrar vacío — confirmás cada una a mano.',
    ui.ButtonSet.OK_CANCEL
  );
  if (respuesta.getSelectedButton() !== ui.Button.OK) return;

  return cargarTemario(respuesta.getResponseText(), respuestaPeriodo.getResponseText());
}
