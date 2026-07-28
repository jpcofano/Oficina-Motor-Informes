/**
 * Instalar.gs — Setup inicial.
 * Crea las hojas de configuración (CONFIG, INFORMES, MARCADORES, MAPEO)
 * con encabezados + filas de ejemplo, y deja el menú instalado.
 * Idempotente: si una hoja ya existe, no la pisa.
 * Se completa en: Paso 0.
 */

var HOJAS_CONFIG_ = {
  CONFIG: {
    headers: ['clave', 'valor'],
    ejemplos: [
      ['periodo_desde', ''],
      ['periodo_hasta', ''],
      ['id_base_rdv', ''],
      ['id_base_digital', ''],
      ['id_base_looker', ''],
      ['id_plantilla_slides', ''],
      ['carpeta_salida', '']
    ]
  },
  INFORMES: {
    headers: ['informe_id', 'nombre', 'plantilla_slides_id', 'familias_marcadores', 'activo'],
    ejemplos: [
      ['jm_semanal', 'JM semanal', '', 'ecv,mail,enc', 'SI']
    ]
  },
  MARCADORES: {
    headers: ['marcador', 'familia', 'fuente', 'calculo', 'formato', 'notas'],
    ejemplos: [
      ['ecv_total', 'ecv', 'rdv', 'calcularEcvTotal', '#,##0', 'Ejemplo familia ecv_*'],
      ['mail_enviados', 'mail', 'digital', 'calcularMailEnviados', '#,##0', 'Ejemplo familia mail_*'],
      ['enc_respuestas', 'enc', 'looker', 'calcularEncRespuestas', '#,##0', 'Ejemplo familia enc_*']
    ]
  },
  MAPEO: {
    headers: ['base', 'campo_logico', 'hoja', 'columna', 'notas'],
    ejemplos: [
      ['rdv', 'fecha', 'Hoja1', 'A', 'Ejemplo de mapeo']
    ]
  },
  CAMPANAS: {
    headers: ['campana_id', 'nombre', 'base', 'mostrar', 'orden'],
    ejemplos: [
      ['camp_01', 'Campaña ejemplo', 'digital', 'SI', 1]
    ]
  }
};

function instalar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var creadas = [];
  var actualizadas = [];

  Object.keys(HOJAS_CONFIG_).forEach(function (nombre) {
    var def = HOJAS_CONFIG_[nombre];
    var hoja = ss.getSheetByName(nombre);
    if (!hoja) {
      hoja = ss.insertSheet(nombre);
      hoja.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
      if (def.ejemplos.length) {
        hoja.getRange(2, 1, def.ejemplos.length, def.headers.length).setValues(def.ejemplos);
      }
      hoja.setFrozenRows(1);
      creadas.push(nombre);
    } else {
      hoja.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
      actualizadas.push(nombre);
    }
  });

  limpiarHojaPorDefecto_(ss);

  var resumen =
    'Hojas creadas: ' + (creadas.length ? creadas.join(', ') : 'ninguna') +
    '\nHojas actualizadas: ' + (actualizadas.length ? actualizadas.join(', ') : 'ninguna');
  SpreadsheetApp.getUi().alert('Instalación completa', resumen, SpreadsheetApp.getUi().ButtonSet.OK);
}

function limpiarHojaPorDefecto_(ss) {
  ['Hoja 1', 'Sheet1'].forEach(function (nombre) {
    var hoja = ss.getSheetByName(nombre);
    if (hoja && ss.getSheets().length > 1 && hoja.getLastRow() === 0 && hoja.getLastColumn() === 0) {
      ss.deleteSheet(hoja);
    }
  });
}
