/**
 * Instalar.gs — Setup inicial.
 * Crea las hojas de configuración por registros (CONFIG, BASES, INFORMES,
 * MARCADORES, MAPEO, CAMPANAS, PERIODOS) con encabezados + filas de ejemplo,
 * y deja el menú instalado.
 * Idempotente: si una hoja ya existe, no la pisa. Para MARCADORES/CAMPANAS,
 * si ya existen con el esquema viejo, inserta las columnas nuevas
 * (periodo_ref / desde / hasta) en su posición sin tocar filas cargadas.
 * También expone seedConfiguracion(): carga (upsert) los valores reales de
 * BASES/MAPEO/CONFIG para no cargarlos a mano; diagnosticarCarpetaPlantillas_():
 * lista sin filtrar qué hay en la carpeta de plantillas; y
 * registrarPlantillasDesdeCarpeta(): recorre esa carpeta (hasta 2 niveles de
 * subcarpetas), matchea los Slides nativos contra INFORMES y completa
 * plantilla_id, reportando .pptx sin convertir y accesos directos; y
 * diagnosticoDrive(): confirma cuenta efectiva + contenido crudo de la
 * carpeta de plantillas por ID fijo, para descartar problemas de scope/
 * autorización antes de tocar registrarPlantillasDesdeCarpeta.
 * Se completa en: Paso 0 (v2) + Paso 0.5 + Paso 1.6 + Paso 1.6 (v2) + Paso 1.7
 * + Paso 1.8-B — ver docs/Prompts/Paso-0-v2.md, docs/Prompts/Paso-0.5.md,
 * docs/Prompts/Paso-1.6.md, docs/Prompts/Paso-1.6-v2.md, docs/Prompts/Paso-1.7.md,
 * docs/Prompts/Paso-1.8-B.md, Plan Inicial/_archivo/ARQUITECTURA_registros.md y
 * Plan Inicial/_archivo/Periodos_y_campanias.md.
 */

/**
 * Paso 1.8-B — diagnóstico de scopes/autorización.
 * Ver docs/Prompts/Paso-1.8-B.md. Temporal: cuando el registro de plantillas
 * funcione de punta a punta, se puede borrar o dejar como herramienta de
 * soporte.
 */
function diagnosticoDrive() {
  Logger.log('Cuenta efectiva: ' + Session.getEffectiveUser().getEmail());

  var id = '1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi'; // carpeta_plantillas
  var carpeta = DriveApp.getFolderById(id);
  Logger.log('Carpeta: ' + carpeta.getName());

  var n = 0;
  var it = carpeta.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    n++;
    Logger.log(f.getName() + ' | ' + f.getMimeType() + ' | ' + f.getId());
  }
  Logger.log('Total archivos: ' + n);

  var c = 0;
  var itc = carpeta.getFolders();
  while (itc.hasNext()) { c++; Logger.log('Subcarpeta: ' + itc.next().getName()); }
  Logger.log('Total subcarpetas: ' + c);
}

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
    headers: ['base_id', 'nombre', 'sheet_id', 'hoja_default', 'fila_encabezado', 'modo_periodo', 'tipo', 'activo', 'notas'],
    ejemplos: [
      ['rdv', 'RDV JM CM ES', '', 'RVD JM-CM - ES', 1, 'filtrar', 'google_sheets', 'sí', 'Encuentros'],
      ['digital', 'Seguimiento Digital', '', 'Digital', 1, 'filtrar', 'google_sheets', 'sí', 'Campaña por canal'],
      ['looker', 'Base Looker', '', 'resumen_metricas', 1, 'filtrar', 'google_sheets', 'sí', 'Consolidado'],
      ['m2', 'M2 Reporte 2026', '', 'M2 periodo DIRECTA', 3, 'snapshot', 'google_sheets', 'sí', 'Familia m2_*'],
      ['miba', 'Integración MiBA', '', '', 1, 'filtrar', 'google_sheets', 'no', 'Parqueada']
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
    headers: ['marcador', 'familia', 'informe_id', 'base_id', 'campo_logico', 'periodo_ref', 'calculo', 'formato', 'notas'],
    ejemplos: [
      ['ecv_inscriptos', 'ecv', '*', 'rdv', 'inscriptos', '', 'calcInscriptos', 'numero', '* = compartido'],
      ['camp_alcance', 'camp', '*', 'looker', 'alcance', '', 'calcAlcance', 'miles', ''],
      ['m2_envios', 'm2', 'jm', 'm2', 'envios', 'm2_mensual', 'calcEnvios', 'numero', '']
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
    headers: ['campana_id', 'nombre', 'informe_id', 'base_id', 'tipo', 'desde', 'hasta', 'mostrar', 'orden'],
    ejemplos: [
      ['serv_esenciales', 'Servicios esenciales', 'secco', 'looker', 'destacada', '2026-06-02', '2026-06-15', 'sí', 1],
      ['encuentros_min', 'Encuentros de ministros', 'secco', 'rdv', 'encuentro_ministros', '2026-06-01', '2026-06-30', 'sí', 2],
      ['prov_uber', 'Uber', 'secco', 'digital', 'proveedor', '2026-06-01', '2026-06-30', 'no', 3]
    ]
  },
  PERIODOS: {
    headers: ['periodo_id', 'desde', 'hasta', 'notas'],
    ejemplos: [
      ['m2_mensual', '2026-06-01', '2026-06-30', 'M2 dentro del JM'],
      ['quincena_rrss', '2026-06-16', '2026-06-30', 'Análisis RRSS']
    ]
  }
};

// Columnas nuevas que Paso 0.5 suma sobre un esquema ya instalado. Si la hoja
// ya existe (sea del esquema viejo o nuevo), se asegura cada columna por nombre
// en su posición sin recrear la hoja ni tocar las filas ya cargadas.
var COLUMNAS_DELTA_ = {
  MARCADORES: [
    { nombre: 'periodo_ref', indice: 6 }
  ],
  CAMPANAS: [
    { nombre: 'desde', indice: 6 },
    { nombre: 'hasta', indice: 7 }
  ],
  BASES: [
    { nombre: 'fila_encabezado', indice: 5 },
    { nombre: 'modo_periodo', indice: 6 }
  ]
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
      return;
    }

    var delta = COLUMNAS_DELTA_[nombre];
    if (delta) {
      // Hoja preexistente con posible esquema viejo: solo insertar las
      // columnas que falten, sin pisar encabezados ni filas ya cargadas.
      var agregoColumna = false;
      delta.forEach(function (columna) {
        if (asegurarColumna_(hoja, columna.nombre, columna.indice)) {
          agregoColumna = true;
        }
      });
      if (agregoColumna) actualizadas.push(nombre);
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

function asegurarColumna_(hoja, nombreColumna, indiceDestino) {
  var ultimaColumna = Math.max(hoja.getLastColumn(), 1);
  var headers = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  if (headers.indexOf(nombreColumna) !== -1) return false; // ya existe, no duplicar

  hoja.insertColumnBefore(indiceDestino);
  hoja.getRange(1, indiceDestino).setValue(nombreColumna);
  return true;
}

function limpiarHojaPorDefecto_(ss) {
  ['Hoja 1', 'Sheet1'].forEach(function (nombre) {
    var hoja = ss.getSheetByName(nombre);
    if (hoja && ss.getSheets().length > 1 && hoja.getLastRow() === 0 && hoja.getLastColumn() === 0) {
      ss.deleteSheet(hoja);
    }
  });
}

/**
 * Paso 1.7 — seed de configuración inicial (BASES + MAPEO + CONFIG).
 * Ver docs/Prompts/Paso-1.7.md y Plan Inicial/_archivo/M2_mapeo_y_config.md.
 */

var SEED_BASES_ = [
  { base_id: 'rdv', nombre: 'RDV JM CM ES + funcionarios', sheet_id: '1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo', hoja_default: 'RVD JM-CM - ES', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Encuentros' },
  { base_id: 'digital', nombre: 'Seguimiento Digital', sheet_id: '1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY', hoja_default: 'Digital', fila_encabezado: 1, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Campaña por canal. Paso 2.3: snapshot — sus solapas usan fecha de inicio de campaña (lead 3-7 días), el recorte por período lo hace el agregador vía link campaña↔encuentro, no ventana de fecha cruda.' },
  { base_id: 'looker', nombre: 'Base Looker', sheet_id: '1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ', hoja_default: 'resumen_metricas', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Consolidado' },
  { base_id: 'm2', nombre: 'M2 Reporte para Fede 2026', sheet_id: '1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY', hoja_default: 'M2 periodo DIRECTA', fila_encabezado: 3, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Directa + Digital en hojas separadas' },
  { base_id: 'miba', nombre: 'Integración MiBA', sheet_id: '', hoja_default: '', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'no', notas: 'Parqueada' }
];

var SEED_MAPEO_ = [
  // rdv — hoja 'RVD JM-CM - ES'
  { base_id: 'rdv', campo_logico: 'figura', hoja: 'RVD JM-CM - ES', columna: 'A', notas: 'filtro por figura' },
  { base_id: 'rdv', campo_logico: 'barrio', hoja: 'RVD JM-CM - ES', columna: 'B', notas: '' },
  { base_id: 'rdv', campo_logico: 'evento', hoja: 'RVD JM-CM - ES', columna: 'C', notas: '' },
  { base_id: 'rdv', campo_logico: 'fecha', hoja: 'RVD JM-CM - ES', columna: 'E', notas: 'filtro de período' },
  { base_id: 'rdv', campo_logico: 'status', hoja: 'RVD JM-CM - ES', columna: 'I', notas: 'filtro (Realizada)' },
  { base_id: 'rdv', campo_logico: 'inscriptos', hoja: 'RVD JM-CM - ES', columna: 'K', notas: '(resuelto)' },
  { base_id: 'rdv', campo_logico: 'insc_mail', hoja: 'RVD JM-CM - ES', columna: 'L', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_cc', hoja: 'RVD JM-CM - ES', columna: 'M', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_ivr', hoja: 'RVD JM-CM - ES', columna: 'N', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_digital', hoja: 'RVD JM-CM - ES', columna: 'O', notas: 'header real "RRSS" — duda resuelta' },
  { base_id: 'rdv', campo_logico: 'insc_dif', hoja: 'RVD JM-CM - ES', columna: 'P', notas: '' },
  { base_id: 'rdv', campo_logico: 'asistentes', hoja: 'RVD JM-CM - ES', columna: 'Q', notas: '' },
  { base_id: 'rdv', campo_logico: 'comuna', hoja: 'RVD JM-CM - ES', columna: 'AA', notas: '' },
  { base_id: 'rdv', campo_logico: 'poblacion', hoja: 'RVD JM-CM - ES', columna: 'AB', notas: 'habitantes' },

  // looker — hoja 'resumen_metricas' (una fila por campaña; prefijos = canal, no familia)
  { base_id: 'looker', campo_logico: 'campana', hoja: 'resumen_metricas', columna: 'B', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha_inicio', hoja: 'resumen_metricas', columna: 'C', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha_fin', hoja: 'resumen_metricas', columna: 'D', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha', hoja: 'resumen_metricas', columna: 'C',
    notas: 'apunta a fecha_inicio. Es el arranque de la pauta de convocatoria, entre 3 y 7 días antes del encuentro (DISENO_match_temario.md §5). Sirve para acotar la lectura, NO para elegir qué campaña entra al informe.' },
  { base_id: 'looker', campo_logico: 'eje', hoja: 'resumen_metricas', columna: 'E', notas: '' },
  { base_id: 'looker', campo_logico: 'area', hoja: 'resumen_metricas', columna: 'F', notas: '' },
  { base_id: 'looker', campo_logico: 'estado', hoja: 'resumen_metricas', columna: 'G', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_impresiones', hoja: 'resumen_metricas', columna: 'H', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_visualizaciones', hoja: 'resumen_metricas', columna: 'I', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_clics', hoja: 'resumen_metricas', columna: 'J', notas: '' },
  { base_id: 'looker', campo_logico: 'alcance', hoja: 'resumen_metricas', columna: 'K', notas: '' },
  { base_id: 'looker', campo_logico: 'frecuencia', hoja: 'resumen_metricas', columna: 'M', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_enviados', hoja: 'resumen_metricas', columna: 'N', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_entregados', hoja: 'resumen_metricas', columna: 'O', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_aperturas', hoja: 'resumen_metricas', columna: 'P', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_clics', hoja: 'resumen_metricas', columna: 'Q', notas: '' },
  { base_id: 'looker', campo_logico: 'cc_contactados', hoja: 'resumen_metricas', columna: 'T', notas: '' },
  { base_id: 'looker', campo_logico: 'cc_efectivos', hoja: 'resumen_metricas', columna: 'U', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_audiencia', hoja: 'resumen_metricas', columna: 'V', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_atendidos', hoja: 'resumen_metricas', columna: 'X', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_escucha75', hoja: 'resumen_metricas', columna: 'Y', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_marque1', hoja: 'resumen_metricas', columna: 'Z', notas: '' },
  { base_id: 'looker', campo_logico: 'sms_enviados', hoja: 'resumen_metricas', columna: 'AA', notas: '' },
  { base_id: 'looker', campo_logico: 'sms_entregados', hoja: 'resumen_metricas', columna: 'AB', notas: '' },

  // m2 — DIRECTA en 'M2 periodo DIRECTA', DIGITAL en 'M2 periodo DIGITAL'
  { base_id: 'm2', campo_logico: 'campana', hoja: 'M2 periodo DIRECTA', columna: 'B', notas: '' },
  { base_id: 'm2', campo_logico: 'fecha', hoja: 'M2 periodo DIRECTA', columna: 'C', notas: '' },
  { base_id: 'm2', campo_logico: 'envios', hoja: 'M2 periodo DIRECTA', columna: 'D', notas: '' },
  { base_id: 'm2', campo_logico: 'entregados', hoja: 'M2 periodo DIRECTA', columna: 'E', notas: '' },
  { base_id: 'm2', campo_logico: 'aperturas', hoja: 'M2 periodo DIRECTA', columna: 'F', notas: '' },
  { base_id: 'm2', campo_logico: 'or', hoja: 'M2 periodo DIRECTA', columna: 'G', notas: '' },
  { base_id: 'm2', campo_logico: 'clics', hoja: 'M2 periodo DIRECTA', columna: 'H', notas: '' },
  { base_id: 'm2', campo_logico: 'ctor', hoja: 'M2 periodo DIRECTA', columna: 'I', notas: '' },
  { base_id: 'm2', campo_logico: 'impresiones', hoja: 'M2 periodo DIGITAL', columna: 'F', notas: '' },
  { base_id: 'm2', campo_logico: 'alcance_dig', hoja: 'M2 periodo DIGITAL', columna: 'G', notas: '' },
  { base_id: 'm2', campo_logico: 'views', hoja: 'M2 periodo DIGITAL', columna: 'I', notas: '' },
  { base_id: 'm2', campo_logico: 'clics_dig', hoja: 'M2 periodo DIGITAL', columna: 'K', notas: '' },
  { base_id: 'm2', campo_logico: 'campana_dig', hoja: 'M2 periodo DIGITAL', columna: 'B', notas: '' },
  { base_id: 'm2', campo_logico: 'estado', hoja: 'M2 periodo DIGITAL', columna: 'E', notas: '' },

  // digital (Seguimiento Digital) — sembrado en el Paso 2.3. Snapshot: el
  // recorte por período lo hace el agregador (Paso 3) vía el link
  // campaña↔encuentro, no por ventana de fecha cruda (ver SEED_BASES_.digital).
  // El join entre solapas es por "ID Cuentas", que cada solapa mapea acá.

  // hoja 'Digital' — campaña digital
  { base_id: 'digital', campo_logico: 'clave', hoja: 'Digital', columna: 'A', notas: 'mismo valor que dig_campana; permite que el diagnóstico de "Probar lectura" (que corre sobre hoja_default) descarte filas sin campaña sin depender del prefijo por solapa' },
  { base_id: 'digital', campo_logico: 'dig_campana', hoja: 'Digital', columna: 'A', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_jm_gcba', hoja: 'Digital', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_id_cuenta', hoja: 'Digital', columna: 'T', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'dig_fecha_inicio', hoja: 'Digital', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_fecha_fin', hoja: 'Digital', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_impresiones', hoja: 'Digital', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_alcance', hoja: 'Digital', columna: 'I', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_frecuencia', hoja: 'Digital', columna: 'J', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_views', hoja: 'Digital', columna: 'K', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_vtr', hoja: 'Digital', columna: 'L', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_clics', hoja: 'Digital', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_ctr', hoja: 'Digital', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_impresiones_social', hoja: 'Digital', columna: 'U', notas: '' },

  // hoja 'Directa Mail'
  { base_id: 'digital', campo_logico: 'mail_id_cuenta', hoja: 'Directa Mail', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'mail_campana', hoja: 'Directa Mail', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_fecha', hoja: 'Directa Mail', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_enviados', hoja: 'Directa Mail', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_entregados', hoja: 'Directa Mail', columna: 'N', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_aperturas', hoja: 'Directa Mail', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_or', hoja: 'Directa Mail', columna: 'P', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_clics', hoja: 'Directa Mail', columna: 'Q', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_ctor', hoja: 'Directa Mail', columna: 'R', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_area', hoja: 'Directa Mail', columna: 'T', notas: '' },

  // hoja 'Directa SMS'
  { base_id: 'digital', campo_logico: 'sms_id_cuenta', hoja: 'Directa SMS', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'sms_campana', hoja: 'Directa SMS', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_fecha', hoja: 'Directa SMS', columna: 'D', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_enviados', hoja: 'Directa SMS', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_entregados', hoja: 'Directa SMS', columna: 'G', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_ent_pct', hoja: 'Directa SMS', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_clics', hoja: 'Directa SMS', columna: 'I', notas: '' },

  // hoja 'Directa IVR' — sin fecha única (tiene Inicio D y Fin E)
  { base_id: 'digital', campo_logico: 'ivr_id_cuenta', hoja: 'Directa IVR', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'ivr_campana', hoja: 'Directa IVR', columna: 'I', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_inicio', hoja: 'Directa IVR', columna: 'D', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_fin', hoja: 'Directa IVR', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_audiencia', hoja: 'Directa IVR', columna: 'J', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_llamados', hoja: 'Directa IVR', columna: 'K', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_atendidos', hoja: 'Directa IVR', columna: 'L', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_at_pct', hoja: 'Directa IVR', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_e75', hoja: 'Directa IVR', columna: 'N', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_e75_pct', hoja: 'Directa IVR', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_marque1', hoja: 'Directa IVR', columna: 'P', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_marque1_pct', hoja: 'Directa IVR', columna: 'Q', notas: '' },

  // hoja 'Alcance' — alcance/frecuencia por cuenta
  { base_id: 'digital', campo_logico: 'alc_id_cuenta', hoja: 'Alcance', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'alc_alcance', hoja: 'Alcance', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'alc_frecuencia', hoja: 'Alcance', columna: 'C', notas: '' },

  // hoja maestra 'Seguimiento digital' — dimensión + pauta por plataforma
  { base_id: 'digital', campo_logico: 'sd_id_cuenta', hoja: 'Seguimiento digital', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'sd_campana_cuentas', hoja: 'Seguimiento digital', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'sd_campana_digital', hoja: 'Seguimiento digital', columna: 'C', notas: '' },
  { base_id: 'digital', campo_logico: 'sd_fecha_inicio', hoja: 'Seguimiento digital', columna: 'L', notas: '' },
  { base_id: 'digital', campo_logico: 'sd_pauta_google', hoja: 'Seguimiento digital', columna: 'T', notas: 'conteo de contenidos pauteados en Google, no monto' },
  { base_id: 'digital', campo_logico: 'sd_pauta_prog', hoja: 'Seguimiento digital', columna: 'U', notas: 'conteo de contenidos pauteados en Programmatic, no monto' },
  { base_id: 'digital', campo_logico: 'sd_pauta_meta', hoja: 'Seguimiento digital', columna: 'V', notas: 'conteo de contenidos pauteados en Meta, no monto' }
];

var SEED_CONFIG_DEFAULTS_ = {
  informe_activo: 'jm',
  periodo_desde: '',
  periodo_hasta: '',
  carpeta_plantillas: '1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi',
  carpeta_salida: '1EyTlfg16vpyrftpUXgacShFk8iSbX_fJ'
};

function seedConfiguracion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var vacio = { escritas: 0, actualizadas: 0 };

  var hojaBases = ss.getSheetByName('BASES');
  var resultadoBases = hojaBases ? upsertPorClave_(hojaBases, ['base_id'], SEED_BASES_) : vacio;

  var hojaMapeo = ss.getSheetByName('MAPEO');
  var resultadoMapeo = hojaMapeo ? upsertPorClave_(hojaMapeo, ['base_id', 'campo_logico'], SEED_MAPEO_) : vacio;

  var hojaConfig = ss.getSheetByName('CONFIG');
  var resultadoConfig = hojaConfig ? seedConfigConfig_(hojaConfig) : vacio;

  var pendientes = SEED_MAPEO_
    .filter(function (fila) { return !fila.columna; })
    .map(function (fila) { return fila.base_id + '/' + fila.campo_logico; });

  var resumen =
    'BASES — nuevas: ' + resultadoBases.escritas + ', actualizadas: ' + resultadoBases.actualizadas + '\n' +
    'MAPEO — nuevas: ' + resultadoMapeo.escritas + ', actualizadas: ' + resultadoMapeo.actualizadas + '\n' +
    'CONFIG — nuevas: ' + resultadoConfig.escritas + ', completadas: ' + resultadoConfig.actualizadas +
    (pendientes.length
      ? '\n\n⚠️ Pendientes de confirmar columna en MAPEO: ' + pendientes.join(', ')
      : '');

  SpreadsheetApp.getUi().alert('Config inicial cargada', resumen, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Upsert genérico por clave compuesta: si ya hay una fila con esa clave la
 * actualiza en el lugar; si no, la agrega al final. No toca ni borra filas
 * cuya clave no está en `filaObjetos` (respeta lo que haya cargado el usuario).
 */
function upsertPorClave_(hoja, clavesNombres, filaObjetos) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var indices = {};
  headers.forEach(function (h, i) { indices[h] = i; });

  function claveDeFila(fila) {
    return clavesNombres.map(function (k) { return fila[indices[k]]; }).join('||');
  }
  function claveDeObjeto(obj) {
    return clavesNombres.map(function (k) { return obj[k]; }).join('||');
  }

  var filaPorClave = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = claveDeFila(datos[f]);
    if (clave) filaPorClave[clave] = f + 1; // número de fila real en la hoja (1-based)
  }

  var escritas = 0;
  var actualizadas = 0;

  filaObjetos.forEach(function (obj) {
    var clave = claveDeObjeto(obj);
    var valores = headers.map(function (h) { return (h in obj) ? obj[h] : ''; });

    if (filaPorClave[clave]) {
      hoja.getRange(filaPorClave[clave], 1, 1, headers.length).setValues([valores]);
      actualizadas++;
    } else {
      hoja.appendRow(valores);
      filaPorClave[clave] = hoja.getLastRow();
      escritas++;
    }
  });

  return { escritas: escritas, actualizadas: actualizadas };
}

/**
 * Paso 1.6 — registrar plantillas desde la carpeta de Drive.
 * Ver docs/Prompts/Paso-1.6.md y docs/Prompts/Paso-1.6-v2.md.
 * El folderId sale de CONFIG.carpeta_plantillas (leerConfig()), no de una
 * constante: agregar una base/carpeta no debe pedir clasp push.
 */

// Matcheo nombre de Slides -> informe_id. El primero que matchee gana, así que
// SECCO va antes de JM (un nombre con ambas palabras cae en SECCO).
var MATCHEO_PLANTILLAS_ = [
  { patron: /SECCO/i, informeId: 'secco' },
  { patron: /JM/i, informeId: 'jm' }
];

function matchearInformeId_(nombreArchivo) {
  for (var i = 0; i < MATCHEO_PLANTILLAS_.length; i++) {
    if (MATCHEO_PLANTILLAS_[i].patron.test(nombreArchivo)) {
      return MATCHEO_PLANTILLAS_[i].informeId;
    }
  }
  return null;
}

// Profundidad máxima de recorrido de subcarpetas (getFilesByType no es
// recursivo; las plantillas a veces terminan en una subcarpeta al compartir
// entre las dos cuentas).
var PROFUNDIDAD_MAX_PLANTILLAS_ = 2;

// MIME de acceso directo de Drive: no tiene constante en el enum MimeType.
var MIME_SHORTCUT_ = 'application/vnd.google-apps.shortcut';

function registrarPlantillasDesdeCarpeta(folderId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInformes = ss.getSheetByName('INFORMES');
  if (!hojaInformes) {
    return { ok: false, motivo: 'La hoja INFORMES no existe. Corré "Instalar / reparar hojas" primero.' };
  }

  var carpeta;
  try {
    carpeta = DriveApp.getFolderById(folderId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la carpeta "' + folderId + '": ' + e.message };
  }

  var datos = hojaInformes.getDataRange().getValues();
  var headers = datos[0];
  var idxInformeId = headers.indexOf('informe_id');
  var idxPlantillaId = headers.indexOf('plantilla_id');

  var filaPorInformeId = {};
  for (var f = 1; f < datos.length; f++) {
    var id = datos[f][idxInformeId];
    if (id) filaPorInformeId[id] = f + 1;
  }

  var resultado = {
    ok: true,
    asignados: [],
    sinInforme: [],
    sinAsignar: [],
    pptxSinConvertir: [],
    accesosDirectos: [],
    conflictos: [],
    totalArchivosVistos: 0
  };

  recorrerCarpetaPlantillas_(carpeta, 0, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);

  return resultado;
}

function recorrerCarpetaPlantillas_(carpeta, profundidad, filaPorInformeId, hojaInformes, idxPlantillaId, resultado) {
  var archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    var archivo = archivos.next();
    resultado.totalArchivosVistos++;
    clasificarArchivoPlantilla_(archivo, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);
  }

  if (profundidad < PROFUNDIDAD_MAX_PLANTILLAS_) {
    var subcarpetas = carpeta.getFolders();
    while (subcarpetas.hasNext()) {
      recorrerCarpetaPlantillas_(subcarpetas.next(), profundidad + 1, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);
    }
  }
}

function clasificarArchivoPlantilla_(archivo, filaPorInformeId, hojaInformes, idxPlantillaId, resultado) {
  var nombre = archivo.getName();
  var mime = archivo.getMimeType();

  if (mime === MimeType.MICROSOFT_POWERPOINT) {
    resultado.pptxSinConvertir.push(nombre);
    return;
  }
  if (mime === MIME_SHORTCUT_) {
    resultado.accesosDirectos.push(nombre);
    return;
  }
  if (mime !== MimeType.GOOGLE_SLIDES) {
    return; // cualquier otro tipo: ignorar en silencio
  }

  var informeId = matchearInformeId_(nombre);
  if (!informeId) {
    resultado.sinAsignar.push(nombre);
    return;
  }

  var filaNum = filaPorInformeId[informeId];
  if (!filaNum) {
    resultado.sinInforme.push(informeId + ' (' + nombre + ')');
    return;
  }

  var idActual = hojaInformes.getRange(filaNum, idxPlantillaId + 1).getValue();
  if (idActual && idActual !== archivo.getId()) {
    resultado.conflictos.push(informeId + ' — ya tiene "' + idActual + '", se encontró "' + archivo.getId() + '" (' + nombre + ')');
    return;
  }

  hojaInformes.getRange(filaNum, idxPlantillaId + 1).setValue(archivo.getId());
  resultado.asignados.push({ informeId: informeId, nombre: nombre, plantillaId: archivo.getId() });
}

/**
 * Paso 1.6 v2 (Parte B) — diagnóstico de la carpeta de plantillas.
 * `getFilesByType(GOOGLE_SLIDES)` falla en silencio si hay .pptx sin convertir,
 * accesos directos, o si las plantillas están en una subcarpeta. Este helper
 * recorre TODO (sin filtrar por tipo) para ver qué hay realmente antes de
 * intentar registrar.
 */
function diagnosticarCarpetaPlantillas_(folderId) {
  var carpeta;
  try {
    carpeta = DriveApp.getFolderById(folderId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la carpeta "' + folderId + '": ' + e.message };
  }

  var archivos = [];
  var iterArchivos = carpeta.getFiles();
  while (iterArchivos.hasNext()) {
    var archivo = iterArchivos.next();
    archivos.push(archivo.getName() + ' · ' + archivo.getMimeType() + ' · ' + archivo.getId());
  }

  var subcarpetas = [];
  var iterCarpetas = carpeta.getFolders();
  while (iterCarpetas.hasNext()) {
    var sub = iterCarpetas.next();
    subcarpetas.push(sub.getName() + ' · ' + sub.getId());
  }

  return { ok: true, nombreCarpeta: carpeta.getName(), archivos: archivos, subcarpetas: subcarpetas };
}

function menuDiagnosticarCarpetaPlantillas_() {
  var ui = SpreadsheetApp.getUi();
  var folderId = leerConfig().carpeta_plantillas;

  if (!folderId) {
    ui.alert('Falta configuración', 'Cargá "carpeta_plantillas" en CONFIG antes de diagnosticar.', ui.ButtonSet.OK);
    return;
  }

  var resultado = diagnosticarCarpetaPlantillas_(folderId);
  if (!resultado.ok) {
    ui.alert('No se pudo diagnosticar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = ['Carpeta: ' + resultado.nombreCarpeta, ''];
  lineas.push('Archivos (' + resultado.archivos.length + '):');
  lineas = lineas.concat(resultado.archivos.length ? resultado.archivos : ['(ninguno)']);
  lineas.push('');
  lineas.push('Subcarpetas (' + resultado.subcarpetas.length + '):');
  lineas = lineas.concat(resultado.subcarpetas.length ? resultado.subcarpetas : ['(ninguna)']);

  ui.alert('Diagnóstico de carpeta de plantillas', lineas.join('\n'), ui.ButtonSet.OK);
}

function menuRegistrarPlantillas_() {
  var ui = SpreadsheetApp.getUi();
  var folderId = leerConfig().carpeta_plantillas;

  if (!folderId) {
    ui.alert('Falta configuración', 'Cargá "carpeta_plantillas" en CONFIG antes de registrar plantillas.', ui.ButtonSet.OK);
    return;
  }

  var resultado = registrarPlantillasDesdeCarpeta(folderId);

  if (!resultado.ok) {
    ui.alert('No se pudo registrar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  if (resultado.totalArchivosVistos === 0) {
    ui.alert('Plantillas registradas', 'La carpeta está vacía o el robot no ve su contenido.', ui.ButtonSet.OK);
    return;
  }

  var lineas = [];
  resultado.asignados.forEach(function (item) {
    lineas.push('✅ ' + item.informeId + ' ← ' + item.nombre);
  });
  resultado.pptxSinConvertir.forEach(function (nombre) {
    lineas.push('⚠ ' + nombre + ' es .pptx — convertir a Google Slides nativo (Drive → Abrir con Presentaciones de Google → Archivo → Guardar como Presentaciones de Google)');
  });
  resultado.accesosDirectos.forEach(function (nombre) {
    lineas.push('⚠ ' + nombre + ' es un acceso directo — poner el archivo real en la carpeta o compartirlo directo con el robot');
  });
  resultado.conflictos.forEach(function (item) {
    lineas.push('⚠ conflicto de ID en ' + item);
  });
  resultado.sinAsignar.forEach(function (nombre) {
    lineas.push('— Sin match de nombre: ' + nombre);
  });
  resultado.sinInforme.forEach(function (item) {
    lineas.push('— Sin fila en INFORMES para: ' + item);
  });

  var resumen = lineas.length ? lineas.join('\n') : 'No se encontraron Slides, .pptx ni accesos directos en la carpeta.';
  ui.alert('Plantillas registradas', resumen, ui.ButtonSet.OK);
}

/**
 * CONFIG es distinto: solo completa claves ausentes o vacías, nunca pisa un
 * valor que el usuario ya haya cargado a mano.
 */
function seedConfigConfig_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxClave = headers.indexOf('clave');
  var idxValor = headers.indexOf('valor');

  var filaPorClave = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = datos[f][idxClave];
    if (clave) filaPorClave[clave] = f + 1;
  }

  var escritas = 0;
  var actualizadas = 0;

  Object.keys(SEED_CONFIG_DEFAULTS_).forEach(function (clave) {
    var valorDefault = SEED_CONFIG_DEFAULTS_[clave];
    var fila = filaPorClave[clave];

    if (!fila) {
      hoja.appendRow([clave, valorDefault]);
      escritas++;
      return;
    }

    var valorActual = hoja.getRange(fila, idxValor + 1).getValue();
    if ((valorActual === '' || valorActual === null) && valorDefault !== '') {
      hoja.getRange(fila, idxValor + 1).setValue(valorDefault);
      actualizadas++;
    }
  });

  return { escritas: escritas, actualizadas: actualizadas };
}
