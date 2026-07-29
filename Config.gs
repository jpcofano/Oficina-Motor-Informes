/**
 * Config.gs — Configuración y lectura de registros.
 * Expone:
 *   leerBases()           -> { base_id: {nombre, sheet_id, hoja_default, fila_encabezado,
 *                               modo_periodo, tipo, activo, notas} }
 *   leerInformes()         -> { informe_id: {nombre, plantilla_id, periodicidad, familias, activo, notas} }
 *   leerConfig()          -> { clave: valor } desde la hoja CONFIG
 *   leerMapeo()           -> { base_id: { campo_logico: {hoja, columna, notas} } }
 *   leerPeriodos()        -> { periodo_id: {desde, hasta, notas} }
 *   leerCampanas()        -> { campana_id: {nombre, informe_id, base_id, tipo, desde, hasta, mostrar, orden} }
 *   escribirConfig(k, v)  -> setea una clave en CONFIG
 * Regla: NADIE hace cuentas de fechas fuera de este módulo y Fuentes.gs.
 * leerBases/leerInformes: Paso 1. leerConfig: Paso 1.6 v2.
 * leerMapeo/leerPeriodos/leerCampanas: Paso 2.
 * escribirConfig: pendiente (fuera de alcance por ahora).
 */

function leerBases() {
  return leerRegistro_('BASES', 'base_id');
}

function leerInformes() {
  return leerRegistro_('INFORMES', 'informe_id');
}

function leerPeriodos() {
  return leerRegistro_('PERIODOS', 'periodo_id');
}

function leerCampanas() {
  return leerRegistro_('CAMPANAS', 'campana_id');
}

function leerConfig() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');
  if (!hoja) return {};

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idxClave = headers.indexOf('clave');
  var idxValor = headers.indexOf('valor');

  var config = {};
  datos.forEach(function (fila) {
    var clave = fila[idxClave];
    if (!clave) return;
    config[clave] = fila[idxValor];
  });

  return config;
}

/**
 * MAPEO tiene clave compuesta (base_id, campo_logico), a diferencia de las
 * demás hojas de registro (clave simple) — por eso no usa leerRegistro_.
 */
function leerMapeo() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MAPEO');
  if (!hoja) return {};

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idxBaseId = headers.indexOf('base_id');
  var idxCampoLogico = headers.indexOf('campo_logico');
  var idxHoja = headers.indexOf('hoja');
  var idxColumna = headers.indexOf('columna');
  var idxNotas = headers.indexOf('notas');

  var mapa = {};
  datos.forEach(function (fila) {
    var baseId = fila[idxBaseId];
    var campoLogico = fila[idxCampoLogico];
    if (!baseId || !campoLogico) return;

    if (!mapa[baseId]) mapa[baseId] = {};
    mapa[baseId][campoLogico] = {
      hoja: fila[idxHoja],
      columna: fila[idxColumna],
      notas: fila[idxNotas]
    };
  });

  return mapa;
}

function leerRegistro_(nombreHoja, clavePrimaria) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  if (!hoja) return {};

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var registro = {};

  datos.forEach(function (fila) {
    var clave = fila[headers.indexOf(clavePrimaria)];
    if (!clave) return; // fila vacía

    var obj = {};
    headers.forEach(function (h, i) { obj[h] = fila[i]; });
    if ('activo' in obj) obj.activo = esVerdadero_(obj.activo);
    registro[clave] = obj;
  });

  return registro;
}

function esVerdadero_(valor) {
  if (typeof valor === 'boolean') return valor;
  var texto = String(valor).trim().toLowerCase();
  return texto === 'sí' || texto === 'si' || texto === 'true';
}
