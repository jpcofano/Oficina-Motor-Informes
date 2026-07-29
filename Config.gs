/**
 * Config.gs — Configuración y lectura de registros.
 * Expone:
 *   leerBases()           -> { base_id: {nombre, sheet_id, hoja_default, tipo, activo, notas} }
 *   leerInformes()         -> { informe_id: {nombre, plantilla_id, periodicidad, familias, activo, notas} }
 *   leerConfig()          -> { clave: valor } desde la hoja CONFIG
 *   escribirConfig(k, v)  -> setea una clave en CONFIG
 *   resolverPeriodo(cfg)  -> { desde, hasta, etiqueta, prevDesde, prevHasta }
 * Regla: NADIE hace cuentas de fechas fuera de este módulo.
 * leerBases/leerInformes se completan en: Paso 1. leerConfig: Paso 1.6 v2.
 * escribirConfig/resolverPeriodo: pendientes (fuera de alcance por ahora).
 */

function leerBases() {
  return leerRegistro_('BASES', 'base_id');
}

function leerInformes() {
  return leerRegistro_('INFORMES', 'informe_id');
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
