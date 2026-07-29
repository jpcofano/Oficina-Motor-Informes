/**
 * Fuentes.gs — Acceso a bases en vivo y lectura de datos fuente.
 * Expone:
 *   abrirBase(baseId)             -> { ok, base, libro } o { ok:false, motivo }
 *   abrirHoja(baseId, nombreHoja?) -> { ok, base, libro, hoja } o { ok:false, motivo }
 *   probarConexionBases()         -> reporte de estado por base (ítem de menú)
 *   leerFuente(nombreHoja, desde, hasta, filtros) -> [ {col: valor}, ... ]
 * abrirBase/abrirHoja cachean la base ya abierta por corrida (no reabren).
 * leerFuente devuelve filas como objetos por encabezado, ya filtradas por período.
 * abrirBase/abrirHoja/probarConexionBases se completan en: Paso 1.
 * leerFuente se completa en: Paso 2.
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
