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
  var propuesta = { orden: '', eje: '', tipo: '', nombre: '', fecha: '', etapa: '', mostrar: '', texto_original: textoOriginal, notas: '' };
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
function cargarTemarioReuniones_(textoPegado) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
  if (!hoja) return { ok: false, motivo: 'La hoja REUNIONES no existe. Corré "Instalar / reparar hojas" primero.' };

  var lineas = String(textoPegado || '').split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
  if (!lineas.length) return { ok: true, agregadas: 0, sinParsear: 0 };

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var sinParsear = 0;
  var filas = lineas.map(function (linea) {
    var propuesta = parsearLineaReunion_(linea);
    if (propuesta.notas === 'no se pudo parsear' || propuesta.notas.indexOf('no se encontró fecha') !== -1) sinParsear++;
    return headers.map(function (h) { return (h in propuesta) ? propuesta[h] : ''; });
  });

  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
  return { ok: true, agregadas: filas.length, sinParsear: sinParsear };
}

function menuCargarTemarioReuniones_() {
  var ui = SpreadsheetApp.getUi();
  var respuesta = ui.prompt(
    'Cargar temario de reuniones',
    'Pegá el texto del temario (una línea por reunión). Se agrega a REUNIONES con mostrar vacío — confirmás cada una a mano.',
    ui.ButtonSet.OK_CANCEL
  );
  if (respuesta.getSelectedButton() !== ui.Button.OK) return;

  var resultado = cargarTemarioReuniones_(respuesta.getResponseText());
  if (!resultado.ok) {
    ui.alert('No se pudo cargar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  ui.alert(
    'Temario cargado',
    'Filas agregadas: ' + resultado.agregadas +
      (resultado.sinParsear ? '\n⚠ ' + resultado.sinParsear + ' no se pudieron interpretar del todo — revisar notas y texto_original.' : '') +
      '\n\nNinguna quedó con mostrar=sí: confirmá a mano cuáles entran al informe.',
    ui.ButtonSet.OK
  );
}
