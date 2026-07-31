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
  // solapa/operacion/valor_fijo (DOC-2 Parte A): operacion reemplaza a calculo
  // (migración idempotente en migrarCalculoAOperacion_); valor_fijo es para
  // operacion=TEXTO; solapa entra en la clave de MAPEO y, si viene vacía, la
  // regla de resolución (docs/TOKENS.md, PROYECTO.md §3) decide si se infiere
  // o se exige.
  MARCADORES: {
    headers: ['marcador', 'familia', 'informe_id', 'base_id', 'solapa', 'campo_logico', 'periodo_ref', 'operacion', 'valor_fijo', 'formato', 'notas'],
    ejemplos: [
      ['ecv_inscriptos', 'ecv', '*', 'rdv', '', 'inscriptos', '', 'calcInscriptos', '', 'numero', '* = compartido; solapa vacía: rdv tiene una sola'],
      ['camp_alcance', 'camp', '*', 'looker', '', 'alcance', '', 'calcAlcance', '', 'miles', 'solapa vacía: looker tiene una sola'],
      ['m2_envios', 'm2', 'jm', 'm2', 'M2 periodo DIRECTA', 'envios', 'm2_mensual', 'calcEnvios', '', 'numero', 'solapa cargada: m2 tiene DIRECTA + DIGITAL']
    ]
  },
  // solapa (Paso 2.3.2): entra en la clave junto con base_id + campo_logico.
  // Antes de esto, dos solapas de la misma base no podían mapear el mismo
  // campo_logico sin pisarse en silencio (ver docs/Prompts/Paso-2.3.2.md).
  // `tipo_esperado` (Paso 2.7 Parte F): numero/texto/fecha, o vacío = sin declarar
  // (no se chequea). `DIAG_BASES` solo avisa ⚠ cuando el tipo real difiere del
  // declarado — antes avisaba ⚠ toda columna texto/mixto sin importar si eso era
  // lo esperado, y con 35 avisos casi todos inocentes (`figura`, `*_id_cuenta`, …)
  // la gente aprendía a ignorarlos.
  MAPEO: {
    headers: ['base_id', 'solapa', 'campo_logico', 'hoja', 'columna', 'tipo_esperado', 'notas'],
    ejemplos: [
      ['rdv', 'RVD JM-CM - ES', 'inscriptos', 'RVD JM-CM - ES', 'H', 'numero', ''],
      // Paso 2.8 Parte A: el ejemplo original era 'digital'/'Digital'/'alcance' apuntando
      // a la columna E — esa fila se instaló en MAPEO y quedó viva ahí porque `instalar()`
      // nunca pisa filas cargadas. La columna E de esa solapa es "Fecha de inicio"
      // (`dig_fecha_inicio`, ya mapeada más abajo), no alcance — confirmado por
      // `auditarAlcanceDigital_()` (Paso 2.7 Parte B). Corregido acá para que una
      // instalación nueva no repita el error; `eliminarMapeoAlcanceDigitalObsoleto_()`
      // limpia la fila vieja en instalaciones ya existentes.
      ['digital', 'Digital', 'dig_fecha_inicio', 'Digital', 'E', 'fecha', '']
    ]
  },
  // SOLAPAS (Paso 2.6): declara el uso de CADA solapa de cada base — el motor solo
  // sabía de las que aparecían en MAPEO, y el resto (backups, pivots, vistas con
  // período tipeado a mano) eran invisibles. `uso=fuente` es requisito para que
  // `buscarMapeo()` la deje leer (Config.gs); `fila_encabezado` vive acá (no en BASES)
  // porque es un atributo de la solapa, no de la base — ver docs/Prompts/Paso-2.6_registro_solapas.md
  // Parte B. `firma_encabezado` queda reservada, sin implementar todavía (Parte E).
  // `origen` (Paso 2.7 Parte A): 'auto' (lo escribió inventariarSolapas) / 'seed'
  // (lo escribió la siembra propuesta) / 'manual' (lo tipeó una persona) — sin esto,
  // la siembra no puede distinguir un `uso=revisar` automático de uno elegido a mano,
  // y termina sin poder pisar nada (ver Solapas.gs y sembrarClasificacionSolapas()
  // abajo).
  SOLAPAS: {
    headers: ['base_id', 'solapa', 'uso', 'origen', 'fila_encabezado', 'firma_encabezado', 'filas_datos', 'notas'],
    ejemplos: [
      ['rdv', 'RVD JM-CM - ES', 'fuente', 'seed', 1, '', '', 'base de encuentros, hoja_default'],
      ['rdv', 'RVD JM-CM - ES Back Up', 'ignorar', 'seed', 1, '', '', 'backup']
    ]
  },
  // tipo (Paso 2.2) acepta: campana, uno_a_uno, tematico, primera_persona,
  // ministros, proveedor — ver Plan Inicial/PROYECTO.md §4.
  CAMPANAS: {
    headers: ['campana_id', 'nombre', 'informe_id', 'base_id', 'tipo', 'desde', 'hasta', 'mostrar', 'orden'],
    ejemplos: [
      ['serv_esenciales', 'Servicios esenciales', 'secco', 'looker', 'campana', '2026-06-02', '2026-06-15', 'sí', 1],
      ['encuentros_min', 'Encuentros de ministros', 'secco', 'rdv', 'ministros', '2026-06-01', '2026-06-30', 'sí', 2],
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
    { nombre: 'periodo_ref', indice: 6 },
    // Orden importa: solapa se inserta antes de valor_fijo porque corre
    // primero en el forEach — desplaza campo_logico/periodo_ref/calculo una
    // posición, y valor_fijo asume esa posición ya corrida (ver DOC-2 Parte A).
    { nombre: 'solapa', indice: 5 },
    { nombre: 'valor_fijo', indice: 9 }
  ],
  CAMPANAS: [
    { nombre: 'desde', indice: 6 },
    { nombre: 'hasta', indice: 7 }
  ],
  BASES: [
    { nombre: 'fila_encabezado', indice: 5 },
    { nombre: 'modo_periodo', indice: 6 }
  ],
  MAPEO: [
    { nombre: 'solapa', indice: 2 },
    // Paso 2.7 Parte F: se inserta antes de `notas` (que para MAPEO instalado sin
    // este delta está en la columna 6 antes de correr esto).
    { nombre: 'tipo_esperado', indice: 6 }
  ],
  // Paso 2.7 Parte A: `origen` se inserta después de `uso` (columna 3) para una
  // hoja SOLAPAS instalada con el esquema del Paso 2.6, que todavía no la tenía.
  SOLAPAS: [
    { nombre: 'origen', indice: 4 }
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

  var hojaMapeo = ss.getSheetByName('MAPEO');
  var backfill = hojaMapeo ? backfillSolapaMapeo_(hojaMapeo) : { rellenadas: 0, sinHoja: [] };
  var eliminoAlcance = hojaMapeo ? eliminarMapeoAlcanceDigitalObsoleto_(hojaMapeo) : false;
  var movioFechaPeriodoLooker = hojaMapeo ? moverFechaPeriodoLookerAResumenMetricas_(hojaMapeo) : false;

  var hojaMarcadores = ss.getSheetByName('MARCADORES');
  var migroOperacion = hojaMarcadores ? migrarCalculoAOperacion_(hojaMarcadores) : false;

  limpiarHojaPorDefecto_(ss);

  var resumen =
    'Hojas creadas: ' + (creadas.length ? creadas.join(', ') : 'ninguna') +
    '\nHojas actualizadas: ' + (actualizadas.length ? actualizadas.join(', ') : 'ninguna') +
    (backfill.rellenadas ? '\nMAPEO.solapa completada en ' + backfill.rellenadas + ' fila(s) desde MAPEO.hoja' : '') +
    (backfill.sinHoja.length
      ? '\n⚠️ MAPEO sin "hoja" cargada, no se pudo determinar solapa: ' + backfill.sinHoja.join(', ')
      : '') +
    (eliminoAlcance ? '\nMAPEO: eliminada la fila digital/Digital/alcance (col E era Fecha de inicio, Paso 2.8 Parte A)' : '') +
    (movioFechaPeriodoLooker ? '\nMAPEO: looker/fecha_periodo movida a resumen_metricas (provisorio, Paso 2.8 Parte B)' : '') +
    (migroOperacion ? '\nMARCADORES.calculo renombrada a operacion (valores conservados)' : '');
  SpreadsheetApp.getUi().alert('Instalación completa', resumen, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Paso 2.8 Parte A — migración idempotente: borra la fila digital/Digital/alcance
 * de MAPEO si existe. Esa fila salía del ejemplo sembrado por HOJAS_CONFIG_.MAPEO
 * al crear la hoja de cero (ya corregido arriba) y nunca estuvo en SEED_MAPEO_, así
 * que `seedConfiguracion()` no la iba a pisar ni a borrar por su cuenta. La columna
 * E de esa solapa es "Fecha de inicio" (`dig_fecha_inicio`), no alcance —
 * confirmado por `auditarAlcanceDigital_()` (Paso 2.7 Parte B); el alcance real de
 * digital ya está mapeado en `digital/Alcance/alc_alcance`. Si la fila no está
 * (ya se borró, o la hoja es nueva), no hace nada.
 */
function eliminarMapeoAlcanceDigitalObsoleto_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxCampo = headers.indexOf('campo_logico');
  if (idxBaseId === -1 || idxSolapa === -1 || idxCampo === -1) return false;

  for (var f = datos.length - 1; f >= 1; f--) {
    if (datos[f][idxBaseId] === 'digital' && datos[f][idxSolapa] === 'Digital' && datos[f][idxCampo] === 'alcance') {
      hoja.deleteRow(f + 1);
      return true;
    }
  }
  return false;
}

/**
 * Paso 2.8 Parte B — migración idempotente: destraba «FALTA:fecha_periodo@looker/
 * resumen_metricas». De los ~25 mapeos de looker, 24 cuelgan en vivo de la solapa
 * `resumen_metricas` (seed viejo, previo a DOC-3 Parte A) y `fecha_periodo` quedó
 * sola en `resumen_metricas_dinamico` (la escribió `promoverFechasElegidas()`,
 * Fechas.gs, a partir de la elección congelada en `docs/FECHAS_seleccion.md`).
 * Ninguna de las dos solapas tiene el juego completo, así que `buscarMapeo()`
 * nunca encuentra `fecha_periodo` en la solapa que `BASES.hoja_default` señala hoy
 * (`resumen_metricas`). Mueve SOLO esa fila de solapa — no toca `columna`: las dos
 * hojas tienen el mismo orden de columnas (Paso 2.7 Parte D / `compararResumenesLooker_`),
 * así que sigue apuntando a la celda correcta.
 * PROVISORIO: si la Parte C decide que la fuente real es `resumen_metricas_dinamico`,
 * hay que revertir con `consolidarMapeoLooker_()` (Solapas.gs), que mueve los 25
 * mapeos completos para allá. Si la fila ya está en `resumen_metricas`, o no existe,
 * no hace nada.
 */
function moverFechaPeriodoLookerAResumenMetricas_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxCampo = headers.indexOf('campo_logico');
  var idxHoja = headers.indexOf('hoja');
  var idxNotas = headers.indexOf('notas');
  if (idxBaseId === -1 || idxSolapa === -1 || idxCampo === -1 || idxHoja === -1) return false;

  var NOTA_PROVISORIA_ =
    'Paso 2.8 Parte B: movida de resumen_metricas_dinamico a resumen_metricas para ' +
    'destrabar «FALTA:fecha_periodo» y juntar los 25 mapeos — PROVISORIO, revertir si ' +
    'la Parte C confirma que la fuente real es resumen_metricas_dinamico.';

  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxBaseId] === 'looker' && datos[f][idxCampo] === 'fecha_periodo' &&
        datos[f][idxSolapa] === 'resumen_metricas_dinamico') {
      hoja.getRange(f + 1, idxSolapa + 1).setValue('resumen_metricas');
      hoja.getRange(f + 1, idxHoja + 1).setValue('resumen_metricas');
      if (idxNotas !== -1) {
        var notaActual = datos[f][idxNotas];
        hoja.getRange(f + 1, idxNotas + 1).setValue(notaActual ? notaActual + ' | ' + NOTA_PROVISORIA_ : NOTA_PROVISORIA_);
      }
      return true;
    }
  }
  return false;
}

/**
 * DOC-2 Parte A — migración idempotente `calculo` → `operacion` en MARCADORES.
 * Renombra el encabezado **en su lugar** (misma columna, mismos valores
 * cargados): no crea una columna nueva al lado, que dejaría dos verdades. Si
 * la hoja ya dice `operacion`, no hace nada; si nunca tuvo `calculo` (hoja
 * instalada de cero con el esquema nuevo), tampoco.
 */
function migrarCalculoAOperacion_(hoja) {
  var ultimaColumna = Math.max(hoja.getLastColumn(), 1);
  var headers = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  var idxCalculo = headers.indexOf('calculo');
  if (idxCalculo === -1) return false; // ya migrada o instalación nueva

  hoja.getRange(1, idxCalculo + 1).setValue('operacion');
  return true;
}

/**
 * Paso 2.3.2 — backfill de la columna `solapa` en MAPEO. Regla: `solapa` toma el
 * mismo valor que `hoja` de esa fila — es el dato real de qué solapa mapea esa
 * fila, ya cargado por el Paso 2.3 (incluidas las filas `dig_*`/`mail_*`/`sms_*`,
 * que ya apuntaban a su solapa real, no a `hoja_default`). Nunca cae a
 * `hoja_default`: una fila sin `hoja` cargada queda sin `solapa` y se reporta,
 * no se adivina (ver Paso-2.3.2.md, sección A). Idempotente: no toca filas que
 * ya tengan `solapa`.
 */
function backfillSolapaMapeo_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxHoja = headers.indexOf('hoja');
  var idxCampo = headers.indexOf('campo_logico');
  if (idxSolapa === -1 || idxHoja === -1) return { rellenadas: 0, sinHoja: [] };

  var rellenadas = 0;
  var sinHoja = [];

  for (var f = 1; f < datos.length; f++) {
    var fila = datos[f];
    if (!fila[idxBaseId]) continue; // fila vacía
    if (fila[idxSolapa] !== '' && fila[idxSolapa] !== null && fila[idxSolapa] !== undefined) continue;

    var valorHoja = fila[idxHoja];
    if (!valorHoja) {
      sinHoja.push(fila[idxBaseId] + '/' + fila[idxCampo]);
      continue;
    }
    hoja.getRange(f + 1, idxSolapa + 1).setValue(valorHoja);
    rellenadas++;
  }

  return { rellenadas: rellenadas, sinHoja: sinHoja };
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
  { base_id: 'looker', nombre: 'Base Looker', sheet_id: '1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ', hoja_default: 'resumen_metricas', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Consolidado. Fuente decidida por getFormulas() (Paso 2.8 Parte C, 31/07): resumen_metricas tiene valores planos, resumen_metricas_dinamico se recalcula desde ahí (fórmulas) — DOC-3 Parte A cerrada.' },
  { base_id: 'm2', nombre: 'M2 Reporte para Fede 2026', sheet_id: '1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY', hoja_default: 'M2 periodo DIRECTA', fila_encabezado: 3, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Directa + Digital en hojas separadas' },
  { base_id: 'miba', nombre: 'Integración MiBA', sheet_id: '', hoja_default: '', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'no', notas: 'Parqueada' }
];

var SEED_MAPEO_ = [
  // rdv — hoja 'RVD JM-CM - ES'
  { base_id: 'rdv', campo_logico: 'figura', hoja: 'RVD JM-CM - ES', columna: 'A', notas: 'filtro por figura' },
  { base_id: 'rdv', campo_logico: 'barrio', hoja: 'RVD JM-CM - ES', columna: 'B', notas: '' },
  { base_id: 'rdv', campo_logico: 'evento', hoja: 'RVD JM-CM - ES', columna: 'C', notas: '' },
  // DOC-2 Parte C: 'fecha' → 'fecha_periodo' (Paso 2.3.1/2.3.2; leerFuente ya no busca
  // 'fecha', solo 'fecha_periodo' — sin uso vivo que justifique dejar la fila vieja
  // derogada). Alineado con la selección congelada en docs/FECHAS_seleccion.md: columna
  // E, sin advertencias ("limpia").
  { base_id: 'rdv', campo_logico: 'fecha_periodo', hoja: 'RVD JM-CM - ES', columna: 'E', notas: 'filtro de período' },
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

  // looker — hoja 'resumen_metricas' (Paso 2.8 Parte C, 31/07: fuente decidida por
  // getFormulas() sobre las filas 2-4 — resumen_metricas tiene valores planos,
  // resumen_metricas_dinamico se recalcula desde ahí (fórmulas) y quedó uso=derivada
  // en SOLAPAS. Reemplaza la elección previa de DOC-3 Parte A (30/07, basada en
  // metadata de Drive — "primera solapa del archivo" no es lo mismo que "solapa con
  // los valores reales"). Las dos hojas tienen el mismo orden de columnas
  // (`compararResumenesLooker_`, Solapas.gs), así que las letras no cambian.
  // Una fila por campaña; prefijos = canal, no familia.
  // DOC-3 Parte C: faltaba id_cuenta (col A) — clave de join con Seguimiento Digital
  // que el Paso 2.4 necesita. Sin prefijo de canal (a diferencia de dig_id_cuenta,
  // mail_id_cuenta, …): looker tiene una sola solapa, no seis, no hace falta desambiguar.
  { base_id: 'looker', campo_logico: 'id_cuenta', hoja: 'resumen_metricas', columna: 'A', notas: 'join con Seguimiento Digital (Paso 2.4)' },
  { base_id: 'looker', campo_logico: 'campana', hoja: 'resumen_metricas', columna: 'B', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha_inicio', hoja: 'resumen_metricas', columna: 'C', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha_fin', hoja: 'resumen_metricas', columna: 'D', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha', hoja: 'resumen_metricas', columna: 'C',
    notas: 'apunta a fecha_inicio. Es el arranque de la pauta de convocatoria, entre 3 y 7 días antes del encuentro (DISENO_match_temario.md §5). Sirve para acotar la lectura, NO para elegir qué campaña entra al informe.' },
  // fecha_periodo (Paso 2.8 Parte B/C): la escribió promoverFechasElegidas() (Fechas.gs)
  // contra la elección congelada en FECHAS_seleccion.md — misma columna que 'fecha'.
  { base_id: 'looker', campo_logico: 'fecha_periodo', hoja: 'resumen_metricas', columna: 'C', notas: 'filtro de período (elegida en FECHAS_seleccion.md)' },
  { base_id: 'looker', campo_logico: 'eje', hoja: 'resumen_metricas', columna: 'E', notas: '' },
  { base_id: 'looker', campo_logico: 'area', hoja: 'resumen_metricas', columna: 'F', notas: '' },
  { base_id: 'looker', campo_logico: 'estado', hoja: 'resumen_metricas', columna: 'G', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_impresiones', hoja: 'resumen_metricas', columna: 'H', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_visualizaciones', hoja: 'resumen_metricas', columna: 'I', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_clics', hoja: 'resumen_metricas', columna: 'J', notas: '' },
  { base_id: 'looker', campo_logico: 'alcance', hoja: 'resumen_metricas', columna: 'K', notas: '' },
  { base_id: 'looker', campo_logico: 'frecuencia', hoja: 'resumen_metricas', columna: 'M',
    notas: 'M=frecuencia_total; existe también meta_frecuencia en L — elección sin confirmar con el equipo (DOC-3 Parte C)' },
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
  // DOC-3 Parte F: fuente encontrada para el token huérfano post_camp1-3 dinámico —
  // pieza_meta trae la URL del posteo de Facebook de la campaña (anteúltima columna).
  { base_id: 'looker', campo_logico: 'post_meta', hoja: 'resumen_metricas', columna: 'AD', notas: 'URL del posteo de Facebook de la campaña — candidato para post_camp1-3 dinámico' },

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

  // DOC-3 Parte D — solapa 'Cuentas': pasa el criterio de fuente cruda (encabezado en
  // fila 1, sin banner), pero es la tabla de ATRIBUTOS de campaña, no la fuente de los
  // tokens m2_*: no tiene ninguna métrica (clics, visualizaciones, etc.). Se registra
  // como dimensión, no reemplaza a M2 periodo DIRECTA/DIGITAL.
  // ⚠ Conflicto sin resolver: BASES.fila_encabezado de m2 es 3 (vale para las hojas con
  // banner de período); 'Cuentas' tiene el encabezado en la fila 1. fila_encabezado es
  // por base, no por solapa — no se resuelve acá (ver docs/Prompts/DOC-3_verificacion_bases_vivas.md
  // Parte D punto 2, "Lo que este prompt NO decide").
  { base_id: 'm2', campo_logico: 'id_cuenta', hoja: 'Cuentas', columna: 'A', notas: '' },
  { base_id: 'm2', campo_logico: 'campana', hoja: 'Cuentas', columna: 'D', notas: '' },
  // 'Estado campaña' (J) y 'Estado' (V) coexisten en esta solapa; se mapea J.
  { base_id: 'm2', campo_logico: 'estado', hoja: 'Cuentas', columna: 'J', notas: 'mapeada "Estado campaña" (J), no "Estado" (V) — las dos columnas coexisten en la hoja' },
  { base_id: 'm2', campo_logico: 'eje', hoja: 'Cuentas', columna: 'K', notas: '' },
  { base_id: 'm2', campo_logico: 'area', hoja: 'Cuentas', columna: 'L', notas: '' },

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

// Paso 2.3.2: `solapa` entra en la clave de MAPEO junto a `base_id` +
// `campo_logico`. Cada fila de arriba ya declara su `hoja` real (incluidas las
// `dig_*`/`mail_*`/`sms_*`, que ya apuntaban a su solapa real, no a
// `hoja_default`) — `solapa` es exactamente ese mismo valor, así que se deriva
// acá en vez de tipearlo dos veces por fila.
SEED_MAPEO_.forEach(function (fila) { fila.solapa = fila.hoja; });

/**
 * Paso 2.7 Parte F — `tipo_esperado` por `campo_logico`, no por fila: el mismo
 * campo lógico tiene el mismo tipo de dato sin importar en qué base/solapa viva
 * (`campana` es texto en las cuatro bases). Solo cubre lo "obvio" que pidió el
 * prompt — identificadores/categóricos → texto, `fecha*` → fecha, lo que un
 * marcador va a sumar → numero. Lo que no está acá queda sin declarar (`''`) a
 * propósito: `DIAG_BASES` no avisa ⚠ sobre lo no declarado, solo lo lista aparte
 * como informativo — no hace falta adivinar el resto para que esto sirva.
 */
var TIPO_ESPERADO_POR_CAMPO_ = {
  // identificadores y categóricos — texto
  figura: 'texto', barrio: 'texto', evento: 'texto', status: 'texto', estado: 'texto',
  comuna: 'texto', eje: 'texto', area: 'texto', campana: 'texto', campana_dig: 'texto',
  clave: 'texto', id_cuenta: 'texto', dig_jm_gcba: 'texto', post_meta: 'texto', mail_area: 'texto',
  dig_campana: 'texto', mail_campana: 'texto', sms_campana: 'texto', ivr_campana: 'texto',
  sd_campana_cuentas: 'texto', sd_campana_digital: 'texto',
  dig_id_cuenta: 'texto', mail_id_cuenta: 'texto', sms_id_cuenta: 'texto',
  ivr_id_cuenta: 'texto', alc_id_cuenta: 'texto', sd_id_cuenta: 'texto',

  // fecha
  fecha_periodo: 'fecha', fecha_inicio: 'fecha', fecha_fin: 'fecha', fecha: 'fecha',
  dig_fecha_inicio: 'fecha', dig_fecha_fin: 'fecha', mail_fecha: 'fecha', sms_fecha: 'fecha',
  ivr_inicio: 'fecha', ivr_fin: 'fecha', sd_fecha_inicio: 'fecha',

  // métricas que un marcador va a sumar — numero
  inscriptos: 'numero', insc_mail: 'numero', insc_cc: 'numero', insc_ivr: 'numero',
  insc_digital: 'numero', insc_dif: 'numero', asistentes: 'numero', poblacion: 'numero',
  dig_impresiones: 'numero', dig_visualizaciones: 'numero', dig_clics: 'numero',
  alcance: 'numero', frecuencia: 'numero',
  mail_enviados: 'numero', mail_entregados: 'numero', mail_aperturas: 'numero',
  mail_clics: 'numero', mail_or: 'numero', mail_ctor: 'numero',
  cc_contactados: 'numero', cc_efectivos: 'numero',
  ivr_audiencia: 'numero', ivr_atendidos: 'numero', ivr_escucha75: 'numero',
  ivr_marque1: 'numero', ivr_llamados: 'numero', ivr_at_pct: 'numero', ivr_e75: 'numero',
  ivr_e75_pct: 'numero', ivr_marque1_pct: 'numero',
  sms_enviados: 'numero', sms_entregados: 'numero', sms_ent_pct: 'numero', sms_clics: 'numero',
  envios: 'numero', entregados: 'numero', aperturas: 'numero', or: 'numero', clics: 'numero',
  ctor: 'numero', impresiones: 'numero', alcance_dig: 'numero', views: 'numero', clics_dig: 'numero',
  dig_alcance: 'numero', dig_frecuencia: 'numero', dig_views: 'numero', dig_vtr: 'numero',
  dig_ctr: 'numero', dig_impresiones_social: 'numero',
  alc_alcance: 'numero', alc_frecuencia: 'numero',
  sd_pauta_google: 'numero', sd_pauta_prog: 'numero', sd_pauta_meta: 'numero'
};
SEED_MAPEO_.forEach(function (fila) { fila.tipo_esperado = TIPO_ESPERADO_POR_CAMPO_[fila.campo_logico] || ''; });

/**
 * Paso 2.6 Parte D — clasificación PROPUESTA de las ~86 solapas reales de las
 * cuatro bases (relevamiento manual sobre los archivos vivos,
 * docs/Prompts/Paso-2.6_registro_solapas.md Parte D). **No es una decisión**:
 * todo lo que queda en `revisar` lo confirma el usuario, y cualquier fila se
 * puede reclasificar a mano después — por eso se aplica con
 * `sembrarClasificacionSolapas()`, una siembra explícita y separada de
 * `inventariarSolapas()` (Solapas.gs), que nunca toca `uso`.
 *
 * `fila_encabezado` por defecto toma el de la base (`FILA_ENCABEZADO_POR_BASE_`,
 * espejo de `SEED_BASES_`); se pisa puntualmente donde el relevamiento encontró
 * otra cosa (m2 / `Cuentas` y `Cuentas M2`: fila 1, aunque la base tiene
 * `fila_encabezado=3` — DOC-3 Parte D, PROYECTO.md §5bis regla 2).
 *
 * ⚠ Consecuencia real, no cosmética: sembrar esto deja `M2 periodo DIRECTA` /
 * `M2 periodo DIGITAL` (banner de período en fila 1 — viola el criterio de fuente
 * cruda) en `uso=revisar` aunque HOY están mapeadas y en uso. `buscarMapeo()` va a
 * fallar para esos campos hasta que alguien reclasifique esas filas a mano.
 * (La ambigüedad de las dos hojas de `looker` que tenía esta misma nota se resolvió
 * en Paso 2.8 Parte C — ver `filaSolapa_('looker', ...)` más abajo, ya con
 * `uso=fuente`/`derivada`.)
 */
var FILA_ENCABEZADO_POR_BASE_ = { rdv: 1, digital: 1, looker: 1, m2: 3 };

function filaSolapa_(baseId, solapa, uso, notas, opciones) {
  opciones = opciones || {};
  return {
    base_id: baseId,
    solapa: solapa,
    uso: uso,
    fila_encabezado: 'fila_encabezado' in opciones ? opciones.fila_encabezado : FILA_ENCABEZADO_POR_BASE_[baseId],
    firma_encabezado: '',
    filas_datos: 'filas_datos' in opciones ? opciones.filas_datos : '',
    notas: notas
  };
}

function filasSolapa_(baseId, solapas, uso, notas) {
  return solapas.map(function (solapa) { return filaSolapa_(baseId, solapa, uso, notas); });
}

var SEED_SOLAPAS_ = [].concat(
  // rdv — "RDV JM CM ES + funcionarios"
  [
    filaSolapa_('rdv', 'RVD JM-CM - ES', 'fuente', 'base de encuentros, hoja_default'),
    filaSolapa_('rdv', 'RDV_otros_ministros', 'fuente', 'mapeada; base ajena, ojo con la firma'),
    filaSolapa_('rdv', 'RVD JM-CM - ES Back Up', 'ignorar', 'backup'),
    filaSolapa_('rdv', 'RDV_JM_CM_ES', 'revisar', 'nombre casi idéntico al default — ¿duplicado?')
  ],
  filasSolapa_('rdv', ['Para Revisar', 'Copia de Para Revisar', 'Copia de Para Revisar 1'], 'ignorar', 'copias de trabajo'),
  filasSolapa_('rdv', ['Tabla dinámica 4', 'Tabla dinámica 14', 'Tabla dinámica 16', 'Tabla dinámica 18', 'Tabla dinámica 19', 'Tabla dinámica 20', 'Tabla dinámica 23'], 'ignorar', 'pivots'),
  filasSolapa_('rdv', ['Hoja 56', 'Hoja 59', 'Hoja 68', 'Hoja 78'], 'ignorar', 'hojas sueltas'),
  filasSolapa_('rdv', ['Aux_Maximos', 'Datos_Unpivot'], 'derivada', 'auxiliares de cálculo'),
  filasSolapa_('rdv', ['Visualiz_respuestas_GCBA', 'Visualiz_respuestas_JM', 'Visualiz_mail', 'Visualiz_SMS'], 'derivada', 'vistas'),
  filasSolapa_('rdv', ['Cantidad de reuniones por franja horaria'], 'derivada', 'agregado'),
  filasSolapa_('rdv', ['Desplegables', 'Organigrama', 'Mail propuesta'], 'ignorar', 'validaciones y material suelto'),
  filasSolapa_('rdv', ['Backup respuestas'], 'ignorar', 'backup'),
  filasSolapa_('rdv', ['Funcionarios / Ministros'], 'revisar', 'posible catálogo de personas — cruzar con PERSONAS_equivalencias.csv'),
  filasSolapa_('rdv', ['PPTS', 'RDV CONJUNTO', 'Agenda', 'Comunas', 'Seguimiento', 'Respuestas JM 📩'], 'revisar', 'sin decidir'),

  // digital — "Seguimiento Digital"
  [filaSolapa_('digital', 'Digital', 'fuente', 'hoja_default')],
  filasSolapa_('digital', ['Directa Mail', 'Directa IVR', 'Directa SMS'], 'fuente', 'canales de directa'),
  [filaSolapa_('digital', 'Seguimiento digital', 'fuente', 'maestra de la unión del Paso 2.4')],
  [filaSolapa_('digital', 'Alcance', 'fuente', 'usada por Union.gs')],
  [filaSolapa_('digital', 'RDV', 'ignorar', '⚠ duplica la base rdv — si se lee, hay doble conteo')],
  filasSolapa_('digital', ['Buscador por periodo digital', 'Buscador por periodo directa'], 'ignorar', 'período tipeado a mano: violan el criterio de fuente cruda'),
  filasSolapa_('digital', ['Digital 2026 acumulado', 'm2 digital'], 'derivada', 'acumulados'),
  [filaSolapa_('digital', 'RDV JM 2 VECES', 'referencia',
    'conjunto de control del anclaje: 37 encuentros con el link (Funcionario, Barrio, Fecha) ' +
    'ya hecho a mano, misma salida que busca Union.gs/anclarEncuentros(). No mapear — usar para ' +
    'validar el scoring/umbral 0.6. Detalle: docs/DISENO_match_temario.md §9.',
    { filas_datos: 37 })],
  filasSolapa_('digital', ['Metricas informe', 'INFORME'], 'referencia', 'el informe manual actual'),
  filasSolapa_('digital', ['Nomalización de barrios', 'Barrio Hab', 'Limpia Fun'], 'referencia', 'catálogos de normalización — útiles para el scoring del anclaje'),
  filasSolapa_('digital', ['Cuentas', 'Filter unificado', 'EDV', 'CAMPAÑAS_DESGLOCE_DIGITAL', 'Mail per'], 'revisar', 'sin decidir'),

  // looker — "Base Looker"
  [
    filaSolapa_('looker', 'resumen_metricas_dinamico', 'derivada', 'Paso 2.8 Parte C: getFormulas() en filas 2-4 → tiene fórmulas, se recalcula desde resumen_metricas'),
    filaSolapa_('looker', 'resumen_metricas', 'fuente', 'Paso 2.8 Parte C: getFormulas() en filas 2-4 → valores planos; hoja_default'),
    filaSolapa_('looker', 'MAIL', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 5748 }),
    filaSolapa_('looker', 'IVR', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 190 }),
    filaSolapa_('looker', 'SMS', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 86 }),
    filaSolapa_('looker', 'CC', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 1299 }),
    filaSolapa_('looker', 'DIGITAL', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 4563 }),
    filaSolapa_('looker', 'ALCANCE', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 727 })
  ],
  filasSolapa_('looker', ['Desglose Alcance', 'Audiencias', 'Audiencias Conectadas', 'URLs', 'Cuentas'], 'revisar', 'sin decidir'),
  [filaSolapa_('looker', 'Desplegables', 'ignorar', 'validaciones')],

  // m2 — "M2 Reporte para Fede 2026"
  [
    filaSolapa_('m2', 'Cuentas M2', 'fuente', '353 filas, encabezado fila 1 — dimensión de campañas M2', { fila_encabezado: 1, filas_datos: 353 }),
    filaSolapa_('m2', 'Cuentas', 'revisar', '3453 filas, mismo encabezado — parece el universo completo, no solo M2', { fila_encabezado: 1, filas_datos: 3453 })
  ],
  filasSolapa_('m2', ['M2 periodo DIGITAL', 'M2 periodo DIRECTA'], 'revisar', 'el nombre sugiere vista por período; sin confirmar'),
  filasSolapa_('m2', ['Directa mail', 'Seguimiento digital', 'Alcance', 'CAMPAÑAS_DESGLOCE_DIGITAL', 'Mail per'], 'revisar', '⚠ mismos nombres que solapas de digital — hay que saber cuál manda antes de mapear ninguna'),
  filasSolapa_('m2', ['Digital acumulado', 'M2 Directa', 'M2 digital'], 'derivada', 'acumulados')
);

/**
 * Aplica SEED_SOLAPAS_ sobre la hoja SOLAPAS. A diferencia de `inventariarSolapas()`
 * (Solapas.gs), esto SÍ pisa `uso`/`fila_encabezado`/`notas` de las filas que toca —
 * pero NUNCA una fila con `origen=manual` (Paso 2.7 Parte A regla 2): esa es la única
 * marca que protege una decisión humana de una re-siembra. Toda fila que sí escribe
 * queda con `origen='seed'` — incluidas las que el inventario había dejado en
 * `origen='auto'` (ese es justo el caso que destraba esta parte: antes, un
 * `uso=revisar` puesto por el inventario se confundía con uno puesto a mano y la
 * siembra no podía pisarlo).
 * Pensada para correr una vez después de la primera corrida de "Inventariar
 * solapas"; vive en su propio ítem de menú, separado de "Cargar config inicial".
 */
function sembrarClasificacionSolapas() {
  var ui = SpreadsheetApp.getUi();
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SOLAPAS');
  if (!hoja) {
    ui.alert('No se pudo sembrar', 'La hoja SOLAPAS no existe. Corré "Instalar / reparar hojas" primero.', ui.ButtonSet.OK);
    return;
  }

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var existentes = leerFilasSolapas_(hoja);

  var escritas = 0;
  var actualizadas = 0;
  var protegidas = [];

  SEED_SOLAPAS_.forEach(function (obj) {
    var clave = obj.base_id + '||' + obj.solapa;
    var existente = existentes[clave];

    if (existente && existente.origen === 'manual') {
      protegidas.push(clave);
      return; // Parte A regla 2: nunca pisar una fila marcada a mano
    }

    var filaObj = {
      base_id: obj.base_id,
      solapa: obj.solapa,
      uso: obj.uso,
      origen: 'seed',
      fila_encabezado: obj.fila_encabezado,
      firma_encabezado: obj.firma_encabezado,
      filas_datos: obj.filas_datos,
      notas: obj.notas
    };
    var valores = headers.map(function (h) { return (h in filaObj) ? filaObj[h] : ''; });

    if (existente) {
      hoja.getRange(existente.fila, 1, 1, headers.length).setValues([valores]);
      actualizadas++;
    } else {
      hoja.appendRow(valores);
      escritas++;
    }
  });

  ui.alert(
    'Clasificación inicial sembrada',
    'SOLAPAS — nuevas: ' + escritas + ', actualizadas: ' + actualizadas +
      (protegidas.length ? '\nProtegidas (origen=manual, no tocadas): ' + protegidas.length : '') +
      '\n\nEs una propuesta, no una decisión: las filas en uso=revisar quedan pendientes de que el usuario decida.',
    ui.ButtonSet.OK
  );
}

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
  var resultadoMapeo = hojaMapeo ? upsertPorClave_(hojaMapeo, ['base_id', 'solapa', 'campo_logico'], SEED_MAPEO_) : vacio;

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
