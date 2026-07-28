/**
 * Instalar.gs — Setup inicial.
 * Crea las hojas de configuración por registros (CONFIG, BASES, INFORMES,
 * MARCADORES, MAPEO, CAMPANAS) con encabezados + filas de ejemplo, y deja
 * el menú instalado.
 * Idempotente: si una hoja ya existe, no la pisa.
 * Se completa en: Paso 0 (v2) — ver docs/Prompts/Paso-0-v2.md y
 * Plan Inicial/ARQUITECTURA_registros.md.
 */

var HOJAS_CONFIG_ = {
  CONFIG: {
    headers: ['clave', 'valor'],
    ejemplos: [
      ['periodo_desde', '2026-06-26'],
      ['periodo_hasta', '2026-07-03'],
      ['informe_activo', ''],
      ['carpeta_salida', '']
    ]
  },
  BASES: {
    headers: ['base_id', 'nombre', 'sheet_id', 'hoja_default', 'tipo', 'activo', 'notas'],
    ejemplos: [
      ['rdv', 'RDV JM CM ES', '', 'RVD JM-CM - ES', 'google_sheets', 'sí', 'Encuentros'],
      ['digital', 'Seguimiento Digital', '', 'Digital', 'google_sheets', 'sí', 'Campaña por canal'],
      ['looker', 'Base Looker', '', 'resumen_metricas', 'google_sheets', 'sí', 'Consolidado'],
      ['m2', 'M2 Reporte 2026', '', '(a confirmar)', 'google_sheets', 'sí', 'Familia m2_*'],
      ['miba', 'Integración MiBA', '', '', 'google_sheets', 'no', 'Parqueada']
    ]
  },
  INFORMES: {
    headers: ['informe_id', 'nombre', 'plantilla_id', 'periodicidad', 'familias', 'activo', 'notas'],
    ejemplos: [
      ['jm', 'Informe semanal JM', '', 'semanal', 'ecv,enc,m2,camp,mail,gcba,rrss', 'sí', '22 slides'],
      ['secco', 'Seguimiento SECCO-SSCDI', '', 'mensual', 'ecv,et,emin,m2,camp,conv,rep,rrss', 'sí', '29 slides']
    ]
  },
  MARCADORES: {
    headers: ['marcador', 'familia', 'informe_id', 'base_id', 'campo_logico', 'calculo', 'formato', 'notas'],
    ejemplos: [
      ['ecv_inscriptos', 'ecv', '*', 'rdv', 'inscriptos', 'calcInscriptos', 'numero', '* = compartido'],
      ['camp_alcance', 'camp', '*', 'looker', 'alcance', 'calcAlcance', 'miles', ''],
      ['m2_envios', 'm2', 'jm', 'm2', 'envios', 'calcEnvios', 'numero', '']
    ]
  },
  MAPEO: {
    headers: ['base_id', 'campo_logico', 'hoja', 'columna', 'notas'],
    ejemplos: [
      ['rdv', 'inscriptos', 'RVD JM-CM - ES', 'H', ''],
      ['digital', 'alcance', 'Digital', 'E', '']
    ]
  },
  CAMPANAS: {
    headers: ['campana_id', 'nombre', 'informe_id', 'base_id', 'tipo', 'mostrar', 'orden'],
    ejemplos: [
      ['serv_esenciales', 'Servicios esenciales', 'secco', 'looker', 'destacada', 'sí', 1],
      ['encuentros_min', 'Encuentros de ministros', 'secco', 'rdv', 'encuentro_ministros', 'sí', 2],
      ['prov_uber', 'Uber', 'secco', 'digital', 'proveedor', 'no', 3]
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
