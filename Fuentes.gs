/**
 * Fuentes.gs — Acceso a bases en vivo y lectura de datos fuente.
 * Expone:
 *   abrirBase(baseId)             -> { ok, base, libro } o { ok:false, motivo }
 *   abrirHoja(baseId, nombreHoja?) -> { ok, base, libro, hoja } o { ok:false, motivo }
 *   probarConexionBases()         -> reporte de estado por base (ítem de menú)
 *   resolverCampo(baseId, campoLogico) -> { ok, hoja, columna } o { ok:false, motivo }
 *   resolverVentana({informe_id, periodo_ref, campana}) -> { ok, desde, hasta, origen }
 *     Prioridad: campaña > periodo_ref (PERIODOS) > período principal (CONFIG).
 *   leerFuente(baseId, ventana, nombreHojaOverride?) -> diagnóstico + filas de esa
 *     ventana (ver docs/Prompts/VERIFICACION_Paso-2.md §1 para el contrato exacto).
 *     Si `modo_periodo=snapshot` (BASES), ignora la ventana y devuelve todas las filas.
 *   probarLecturaPeriodo() -> corre leerFuente sobre las bases activas, para diagnóstico.
 * abrirBase/abrirHoja cachean la base ya abierta por corrida (no reabren).
 * NADIE hace cuentas de fechas fuera de este módulo y Config.gs.
 * abrirBase/abrirHoja/probarConexionBases se completan en: Paso 1.
 * resolverCampo/resolverVentana/leerFuente/probarLecturaPeriodo se completan en: Paso 2.
 */

var cacheBases_ = {};

function abrirBase(baseId) {
  if (Object.prototype.hasOwnProperty.call(cacheBases_, baseId)) {
    return cacheBases_[baseId];
  }

  var base = leerBases()[baseId];
  var resultado;

  if (!base) {
    resultado = { ok: false, motivo: 'La base "' + baseId + '" no está registrada en BASES' };
  } else if (!base.activo) {
    resultado = { ok: false, motivo: 'La base "' + baseId + '" está marcada como inactiva' };
  } else if (!base.sheet_id) {
    resultado = { ok: false, motivo: 'La base "' + baseId + '" no tiene sheet_id cargado' };
  } else {
    try {
      resultado = { ok: true, base: base, libro: SpreadsheetApp.openById(base.sheet_id) };
    } catch (e) {
      resultado = { ok: false, motivo: 'No se pudo abrir la base "' + baseId + '": ' + e.message };
    }
  }

  cacheBases_[baseId] = resultado;
  return resultado;
}

function abrirHoja(baseId, nombreHoja) {
  var resultado = abrirBase(baseId);
  if (!resultado.ok) return resultado;

  var nombre = nombreHoja || resultado.base.hoja_default;
  var hoja = resultado.libro.getSheetByName(nombre);
  if (!hoja) {
    return { ok: false, motivo: 'La hoja "' + nombre + '" no existe en la base "' + baseId + '"' };
  }

  return { ok: true, base: resultado.base, libro: resultado.libro, hoja: hoja };
}

function probarConexionBases() {
  var bases = leerBases();
  var lineas = [];

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.activo) return;

    var resultado = abrirHoja(baseId);
    if (!resultado.ok) {
      lineas.push('⚠️ ' + baseId + ' — ' + resultado.motivo);
      return;
    }

    var nombresHojas = resultado.libro.getSheets().map(function (h) { return h.getName(); });
    lineas.push(
      '✅ ' + resultado.base.nombre + ' (' + baseId + ') — hojas: ' + nombresHojas.join(', ') +
      ' — filas en "' + resultado.hoja.getName() + '": ' + resultado.hoja.getLastRow()
    );
  });

  var resumen = lineas.length ? lineas.join('\n') : 'No hay bases activas registradas en BASES.';
  SpreadsheetApp.getUi().alert('Prueba de conexión a bases', resumen, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Paso 2 — lectura por ventana (MAPEO + período).
 * Ver docs/Prompts/Paso-2.md y docs/Prompts/VERIFICACION_Paso-2.md.
 */

function resolverCampo(baseId, campoLogico) {
  var mapa = leerMapeo();
  var porBase = mapa[baseId];
  var fila = porBase && porBase[campoLogico];

  if (!fila) {
    return { ok: false, motivo: 'No hay fila en MAPEO para "' + baseId + '/' + campoLogico + '"' };
  }
  if (!fila.columna) {
    return { ok: false, motivo: 'MAPEO "' + baseId + '/' + campoLogico + '" no tiene columna cargada' };
  }

  return { ok: true, hoja: fila.hoja, columna: fila.columna };
}

/**
 * Ventana de fechas por token, en orden de prioridad: campaña > periodo_ref
 * (PERIODOS) > período principal (CONFIG). Devuelve fechas como Date.
 */
function resolverVentana(opciones) {
  opciones = opciones || {};

  if (opciones.campana) {
    var campanas = leerCampanas();
    var campana = campanas[opciones.campana];
    if (!campana) {
      return { ok: false, motivo: 'La campaña "' + opciones.campana + '" no existe en CAMPANAS' };
    }
    var desdeCampana = parsearFechaCelda_(campana.desde);
    var hastaCampana = parsearFechaCelda_(campana.hasta);
    if (!desdeCampana || !hastaCampana) {
      return { ok: false, motivo: 'La campaña "' + opciones.campana + '" no tiene desde/hasta válidos' };
    }
    return { ok: true, desde: desdeCampana, hasta: hastaCampana, origen: 'campana:' + opciones.campana };
  }

  if (opciones.periodo_ref) {
    var periodos = leerPeriodos();
    var periodo = periodos[opciones.periodo_ref];
    if (!periodo) {
      return { ok: false, motivo: 'periodo_ref "' + opciones.periodo_ref + '" no existe en PERIODOS' };
    }
    var desdePeriodo = parsearFechaCelda_(periodo.desde);
    var hastaPeriodo = parsearFechaCelda_(periodo.hasta);
    if (!desdePeriodo || !hastaPeriodo) {
      return { ok: false, motivo: 'PERIODOS "' + opciones.periodo_ref + '" no tiene desde/hasta válidos' };
    }
    return { ok: true, desde: desdePeriodo, hasta: hastaPeriodo, origen: 'periodo_ref:' + opciones.periodo_ref };
  }

  var cfg = leerConfig();
  var desdeCfg = parsearFechaCelda_(cfg.periodo_desde);
  var hastaCfg = parsearFechaCelda_(cfg.periodo_hasta);
  if (!desdeCfg || !hastaCfg) {
    return { ok: false, motivo: 'CONFIG.periodo_desde/periodo_hasta no están cargados o no son fechas válidas' };
  }
  return { ok: true, desde: desdeCfg, hasta: hastaCfg, origen: 'config' };
}

/**
 * Convierte letra de columna (A, B, ..., Z, AA, AB, ...) a índice 0-based.
 */
function columnaLetraAIndice_(letra) {
  var resultado = 0;
  var texto = String(letra).trim().toUpperCase();
  for (var i = 0; i < texto.length; i++) {
    resultado = resultado * 26 + (texto.charCodeAt(i) - 64);
  }
  return resultado - 1;
}

/**
 * Parsea fechas de celdas (bases fuente y hojas de config) sin ambigüedad
 * mm/dd y sin el corrimiento de día de `new Date(texto)` sobre ISO (que lo
 * interpreta como UTC medianoche y en Buenos Aires cae en el día anterior).
 * Sheets suele devolver un objeto Date ya resuelto para celdas con formato de
 * fecha; si llega texto, se parte a mano — nunca `new Date(texto)` ni
 * `Date.parse` sobre texto. Acepta `aaaa-mm-dd` (CONFIG/PERIODOS/CAMPANAS) y
 * `dd/mm/aaaa` o `dd-mm-aaaa` (bases fuente).
 */
function parsearFechaCelda_(valor) {
  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : valor;
  }
  if (typeof valor !== 'string' || !valor.trim()) return null;
  var texto = valor.trim();

  var iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    var fechaIso = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return isNaN(fechaIso.getTime()) ? null : fechaIso;
  }

  var m = texto.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!m) return null;

  var dia = Number(m[1]);
  var mes = Number(m[2]);
  var anio = Number(m[3]);
  if (anio < 100) anio += 2000;

  var fecha = new Date(anio, mes - 1, dia);
  return isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * Lee una base filtrando por ventana de fechas (o todas las filas si
 * `modo_periodo=snapshot`). No suma ni promedia — eso es del Paso 3.
 * `nombreHojaOverride` permite leer una hoja distinta a `hoja_default` de la
 * misma base (caso M2: MAPEO tiene campos en "M2 periodo DIGITAL" además de
 * la hoja default "M2 periodo DIRECTA").
 */
function leerFuente(baseId, ventana, nombreHojaOverride) {
  var abierto = abrirHoja(baseId, nombreHojaOverride);
  if (!abierto.ok) return { ok: false, base_id: baseId, motivo: abierto.motivo };

  var base = abierto.base;
  var hoja = abierto.hoja;
  var filaEncabezado = Number(base.fila_encabezado) || 1;
  var modo = base.modo_periodo || 'filtrar';

  var datos = hoja.getDataRange().getValues();
  if (datos.length < filaEncabezado) {
    return { ok: false, base_id: baseId, motivo: 'La hoja "' + hoja.getName() + '" no tiene fila de encabezado ' + filaEncabezado };
  }

  var headers = datos[filaEncabezado - 1];
  var filasDatos = datos.slice(filaEncabezado);

  function filaAObjeto(fila) {
    var obj = {};
    headers.forEach(function (h, i) {
      if (h) obj[h] = fila[i];
    });
    return obj;
  }

  var resultado = {
    ok: true,
    base_id: baseId,
    hoja: hoja.getName(),
    modo: modo,
    fila_encabezado: filaEncabezado,
    columna_fecha: null,
    ventana_aplicada: null,
    filas_totales: filasDatos.length,
    filas_en_ventana: 0,
    filas_sin_fecha: 0,
    filas_fecha_invalida: 0,
    filas: []
  };

  if (modo === 'snapshot') {
    resultado.filas = filasDatos.map(filaAObjeto);
    resultado.filas_en_ventana = resultado.filas.length;
    return resultado;
  }

  var campoFecha = resolverCampo(baseId, 'fecha');
  if (!campoFecha.ok) {
    return { ok: false, base_id: baseId, motivo: 'Sin columna de fecha mapeada para filtrar — ' + campoFecha.motivo };
  }

  var idxFecha = columnaLetraAIndice_(campoFecha.columna);
  resultado.columna_fecha = headers[idxFecha] || campoFecha.columna;
  resultado.ventana_aplicada = { desde: ventana.desde, hasta: ventana.hasta };

  var desdeMs = new Date(ventana.desde.getFullYear(), ventana.desde.getMonth(), ventana.desde.getDate(), 0, 0, 0, 0).getTime();
  var hastaMs = new Date(ventana.hasta.getFullYear(), ventana.hasta.getMonth(), ventana.hasta.getDate(), 23, 59, 59, 999).getTime();

  filasDatos.forEach(function (fila) {
    var crudo = fila[idxFecha];
    if (crudo === '' || crudo === null || crudo === undefined) {
      resultado.filas_sin_fecha++;
      return;
    }

    var fecha = parsearFechaCelda_(crudo);
    if (!fecha) {
      resultado.filas_fecha_invalida++;
      return;
    }

    var ms = fecha.getTime();
    if (ms >= desdeMs && ms <= hastaMs) {
      resultado.filas_en_ventana++;
      resultado.filas.push(filaAObjeto(fila));
    }
  });

  return resultado;
}

/**
 * Corre leerFuente sobre todas las bases activas para el período principal de
 * CONFIG. Función de diagnóstico manual — ítem de menú "Probar lectura".
 */
function probarLecturaPeriodo() {
  var ventana = resolverVentana({});
  var bases = leerBases();
  var reportes = [];

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.activo) return;

    if (!ventana.ok) {
      reportes.push({ ok: false, base_id: baseId, motivo: 'Ventana no resuelta: ' + ventana.motivo });
      return;
    }

    reportes.push(leerFuente(baseId, ventana));
  });

  return { ventana: ventana, reportes: reportes };
}

function formatearFecha_(fecha) {
  return Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function menuProbarLectura_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = probarLecturaPeriodo();

  if (!resultado.ventana.ok) {
    ui.alert('No se pudo resolver el período', resultado.ventana.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [
    'Ventana (' + resultado.ventana.origen + '): ' +
    formatearFecha_(resultado.ventana.desde) + ' → ' + formatearFecha_(resultado.ventana.hasta),
    ''
  ];

  if (!resultado.reportes.length) {
    lineas.push('No hay bases activas registradas en BASES.');
  }

  resultado.reportes.forEach(function (r) {
    if (!r.ok) {
      lineas.push('⚠️ ' + r.base_id + ' — ' + r.motivo);
      return;
    }

    if (r.modo === 'snapshot') {
      lineas.push('✅ ' + r.base_id + ' (' + r.hoja + ', snapshot) — ' + r.filas_totales + ' filas (todas, sin ventana)');
      return;
    }

    lineas.push(
      '✅ ' + r.base_id + ' (' + r.hoja + ', col fecha "' + r.columna_fecha + '") — ' +
      r.filas_totales + ' totales, ' + r.filas_en_ventana + ' en ventana, ' +
      r.filas_sin_fecha + ' sin fecha, ' + r.filas_fecha_invalida + ' fecha inválida'
    );
  });

  ui.alert('Prueba de lectura por ventana', lineas.join('\n'), ui.ButtonSet.OK);
}
