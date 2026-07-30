/**
 * Solapas.gs — Paso 2.6 Parte C: `inventariarSolapas()`.
 * Ver docs/Prompts/Paso-2.6_registro_solapas.md.
 *
 * Recorre las bases activas y hace upsert en la hoja SOLAPAS por (base_id, solapa),
 * misma lógica que el resto del motor: descubre, no cablea.
 *   - solapa que no estaba registrada  -> se agrega con uso='revisar' (el default
 *     seguro de todo lo nuevo) y notas='detectada <fecha>'.
 *   - solapa que ya estaba registrada  -> se actualiza SOLO filas_datos. El `uso`
 *     cargado por una persona no se pisa nunca acá (para eso está sembrarClasifi-
 *     cacionSolapas_/SEED_SOLAPAS_ en Instalar.gs, que es una siembra explícita).
 *   - solapa registrada que ya no aparece en el archivo -> no se borra: se marca
 *     notas='NO ENCONTRADA <fecha>' y sale ⚠ en el reporte.
 * Expone inventariarSolapas() y el menú "Inventariar solapas".
 */

function inventariarSolapas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('SOLAPAS');
  if (!hoja) {
    return { ok: false, motivo: 'La hoja SOLAPAS no existe. Corré "Instalar / reparar hojas" primero.' };
  }

  var bases = leerBases();
  var fecha = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  var existentes = leerFilasSolapas_(hoja);

  var vivas = {};           // 'base_id||solapa' -> true, solo de bases evaluadas esta corrida
  var basesEvaluadas = {};  // base_id -> true, se pudo abrir el archivo esta corrida
  var nuevas = [];
  var actualizadas = 0;
  var basesSinAcceso = [];

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.activo || !base.sheet_id) return;

    var libro;
    try {
      libro = SpreadsheetApp.openById(base.sheet_id);
    } catch (e) {
      basesSinAcceso.push(baseId + ': ' + e.message);
      return;
    }
    basesEvaluadas[baseId] = true;

    libro.getSheets().forEach(function (hojaSheet) {
      var nombre = hojaSheet.getName();
      var clave = baseId + '||' + nombre;
      vivas[clave] = true;

      var filasDatos = Math.max(hojaSheet.getLastRow() - 1, 0);
      var existente = existentes[clave];

      if (!existente) {
        nuevas.push({
          base_id: baseId,
          solapa: nombre,
          uso: 'revisar',
          fila_encabezado: '',
          firma_encabezado: '',
          filas_datos: filasDatos,
          notas: 'detectada ' + fecha
        });
      } else {
        hoja.getRange(existente.fila, existente.idxFilasDatos + 1).setValue(filasDatos);
        actualizadas++;
      }
    });
  });

  if (nuevas.length) {
    var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    var filasNuevas = nuevas.map(function (fila) {
      return headers.map(function (h) { return (h in fila) ? fila[h] : ''; });
    });
    hoja.getRange(hoja.getLastRow() + 1, 1, filasNuevas.length, headers.length).setValues(filasNuevas);
  }

  // Registradas pero ausentes del archivo en esta corrida: no se borran, se marcan.
  // Solo para bases que sí se pudieron abrir — si una base entera no respondió o
  // está inactiva, sus solapas registradas quedan como estaban, no se asume nada.
  var noEncontradas = [];
  Object.keys(existentes).forEach(function (clave) {
    if (vivas[clave]) return;
    var baseId = clave.split('||')[0];
    if (!basesEvaluadas[baseId]) return;

    var existente = existentes[clave];
    noEncontradas.push(clave);
    if (typeof existente.notas === 'string' && existente.notas.indexOf('NO ENCONTRADA') === 0) return; // ya estaba marcada
    hoja.getRange(existente.fila, existente.idxNotas + 1).setValue('NO ENCONTRADA ' + fecha);
  });

  return {
    ok: true,
    nuevas: nuevas.length,
    actualizadas: actualizadas,
    noEncontradas: noEncontradas,
    basesSinAcceso: basesSinAcceso
  };
}

/**
 * Lee las filas actuales de SOLAPAS indexadas por (base_id, solapa), con el
 * número de fila real en la hoja (1-based) y los índices de columna que
 * `inventariarSolapas()` necesita tocar sin reescribir la fila entera.
 */
function leerFilasSolapas_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var registro = {};
  for (var f = 1; f < datos.length; f++) {
    var fila = datos[f];
    var baseId = fila[idx.base_id];
    var solapa = fila[idx.solapa];
    if (!baseId || !solapa) continue;

    registro[baseId + '||' + solapa] = {
      fila: f + 1,
      idxFilasDatos: idx.filas_datos,
      idxNotas: idx.notas,
      notas: fila[idx.notas]
    };
  }
  return registro;
}

function menuInventariarSolapas_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = inventariarSolapas();

  if (!resultado.ok) {
    ui.alert('No se pudo inventariar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [
    'Solapas nuevas (uso=revisar): ' + resultado.nuevas,
    'Solapas ya registradas — filas_datos actualizado: ' + resultado.actualizadas
  ];

  if (resultado.noEncontradas.length) {
    lineas.push('', '⚠ Registradas en SOLAPAS pero no encontradas en el archivo (no se borran):');
    lineas = lineas.concat(resultado.noEncontradas.map(function (c) { return '  · ' + c.replace('||', '/'); }));
  }

  if (resultado.basesSinAcceso.length) {
    lineas.push('', 'Bases sin acceso:');
    lineas = lineas.concat(resultado.basesSinAcceso.map(function (m) { return '⚠️ ' + m; }));
  }

  lineas.push('', 'Detalle completo en la hoja SOLAPAS. Las filas nuevas quedan en uso=revisar hasta que alguien las clasifique.');

  ui.alert('Inventario de solapas', lineas.join('\n'), ui.ButtonSet.OK);
}
