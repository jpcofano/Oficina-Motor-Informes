/**
 * Instalar.gs — Setup inicial.
 * Crea las hojas de configuración por registros (CONFIG, BASES, INFORMES,
 * MARCADORES, MAPEO, CAMPANAS, PERIODOS) con encabezados + filas de ejemplo,
 * y deja el menú instalado.
 * Idempotente: si una hoja ya existe, no la pisa. Para MARCADORES/CAMPANAS,
 * si ya existen con el esquema viejo, inserta las columnas nuevas
 * (periodo_ref / desde / hasta) en su posición sin tocar filas cargadas.
 * También expone seedConfiguracion(): carga (upsert) los valores reales de
 * BASES/MAPEO/CONFIG para no cargarlos a mano; y registrarPlantillasDesdeCarpeta():
 * matchea los Slides de una carpeta de Drive contra INFORMES y completa
 * plantilla_id.
 * Se completa en: Paso 0 (v2) + Paso 0.5 + Paso 1.6 + Paso 1.7 — ver
 * docs/Prompts/Paso-0-v2.md, docs/Prompts/Paso-0.5.md, docs/Prompts/Paso-1.6.md,
 * docs/Prompts/Paso-1.7.md, Plan Inicial/_archivo/ARQUITECTURA_registros.md y
 * Plan Inicial/_archivo/Periodos_y_campanias.md.
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
  { base_id: 'rdv', nombre: 'RDV JM CM ES + funcionarios', sheet_id: '1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo', hoja_default: 'RVD JM-CM - ES', tipo: 'google_sheets', activo: 'sí', notas: 'Encuentros' },
  { base_id: 'digital', nombre: 'Seguimiento Digital', sheet_id: '1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY', hoja_default: 'Digital', tipo: 'google_sheets', activo: 'sí', notas: 'Campaña por canal' },
  { base_id: 'looker', nombre: 'Base Looker', sheet_id: '1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ', hoja_default: 'resumen_metricas', tipo: 'google_sheets', activo: 'sí', notas: 'Consolidado' },
  { base_id: 'm2', nombre: 'M2 Reporte para Fede 2026', sheet_id: '1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY', hoja_default: 'M2 periodo DIRECTA', tipo: 'google_sheets', activo: 'sí', notas: 'Directa + Digital en hojas separadas' },
  { base_id: 'miba', nombre: 'Integración MiBA', sheet_id: '', hoja_default: '', tipo: 'google_sheets', activo: 'no', notas: 'Parqueada' }
];

var SEED_MAPEO_ = [
  { base_id: 'rdv', campo_logico: 'inscriptos', hoja: 'RVD JM-CM - ES', columna: '', notas: 'verificar col real' },
  { base_id: 'rdv', campo_logico: 'fecha', hoja: 'RVD JM-CM - ES', columna: '', notas: 'col de fecha para filtrar' },
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
  { base_id: 'm2', campo_logico: 'campana_dig', hoja: 'M2 periodo DIGITAL', columna: 'B', notas: '' }
];

var SEED_CONFIG_DEFAULTS_ = {
  informe_activo: 'jm',
  periodo_desde: '',
  periodo_hasta: '',
  carpeta_salida: ''
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
 * Ver docs/Prompts/Paso-1.6.md.
 */

var CARPETA_PLANTILLAS_ID_ = '1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi';

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

  var asignados = [];
  var sinInforme = [];
  var sinAsignar = [];

  var archivos = carpeta.getFilesByType(MimeType.GOOGLE_SLIDES);
  while (archivos.hasNext()) {
    var archivo = archivos.next();
    var nombre = archivo.getName();
    var informeId = matchearInformeId_(nombre);

    if (!informeId) {
      sinAsignar.push(nombre);
      continue;
    }

    var filaNum = filaPorInformeId[informeId];
    if (!filaNum) {
      sinInforme.push(informeId + ' (' + nombre + ')');
      continue;
    }

    hojaInformes.getRange(filaNum, idxPlantillaId + 1).setValue(archivo.getId());
    asignados.push({ informeId: informeId, nombre: nombre, plantillaId: archivo.getId() });
  }

  return { ok: true, asignados: asignados, sinInforme: sinInforme, sinAsignar: sinAsignar };
}

function menuRegistrarPlantillas_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = registrarPlantillasDesdeCarpeta(CARPETA_PLANTILLAS_ID_);

  if (!resultado.ok) {
    ui.alert('No se pudo registrar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [];
  resultado.asignados.forEach(function (item) {
    lineas.push('✅ ' + item.informeId + ' ← ' + item.nombre);
  });
  resultado.sinInforme.forEach(function (item) {
    lineas.push('⚠️ Sin fila en INFORMES para: ' + item);
  });
  resultado.sinAsignar.forEach(function (nombre) {
    lineas.push('— Sin asignar (nombre no matchea ningún informe): ' + nombre);
  });

  var resumen = lineas.length ? lineas.join('\n') : 'No se encontraron Slides en la carpeta.';
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
