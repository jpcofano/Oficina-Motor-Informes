/**
 * Solapas.gs — Paso 2.6 Parte C: `inventariarSolapas()`.
 * Ver docs/Prompts/Paso-2.6_registro_solapas.md y docs/Prompts/Paso-2.7_destrabar_solapas.md.
 *
 * Recorre las bases activas y hace upsert en la hoja SOLAPAS por (base_id, solapa),
 * misma lógica que el resto del motor: descubre, no cablea.
 *   - solapa que no estaba registrada  -> se agrega con uso='revisar' (el default
 *     seguro de todo lo nuevo), origen='auto' y notas='detectada <fecha>'.
 *   - solapa que ya estaba registrada  -> se actualiza SOLO filas_datos. NO toca
 *     `uso` ni `origen`, pase lo que pase (Paso 2.7 Parte A regla 3) — para pisar
 *     una clasificación hace falta `sembrarClasificacionSolapas()` (Instalar.gs),
 *     que sí distingue `origen` y es una siembra explícita y separada.
 *   - solapa registrada que ya no aparece en el archivo -> no se borra: se marca
 *     notas='NO ENCONTRADA <fecha>' y sale ⚠ en el reporte.
 *
 * `origen` (Paso 2.7 Parte A) distingue quién escribió `uso` por última vez:
 * 'auto' (este inventario) / 'seed' (la siembra propuesta) / 'manual' (una persona
 * lo tipeó en la hoja). Es la única forma de que la siembra sepa qué puede pisar sin
 * depender del texto libre de `notas`. Asimetría documentada a propósito: 'auto' y
 * 'seed' se pisan en una re-siembra; 'manual' nunca — quien quiera blindar una fila,
 * escribe `manual` a mano en esa columna.
 *
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
          origen: 'auto',
          fila_encabezado: '',
          firma_encabezado: '',
          filas_datos: filasDatos,
          notas: 'detectada ' + fecha
        });
      } else {
        hoja.getRange(existente.fila, existente.idx.filas_datos + 1).setValue(filasDatos);
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
    hoja.getRange(existente.fila, existente.idx.notas + 1).setValue('NO ENCONTRADA ' + fecha);
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
 * Lee las filas actuales de SOLAPAS indexadas por (base_id, solapa): número de fila
 * real en la hoja (1-based), el mapa completo de índices de columna por nombre de
 * encabezado (`idx`, para que el llamador pueda tocar cualquier columna sin
 * reescribir la fila entera) y los valores de `uso`/`origen`/`notas`, que son los
 * que `inventariarSolapas()` y `sembrarClasificacionSolapas()` (Instalar.gs)
 * necesitan para decidir qué pisar.
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
      idx: idx,
      uso: fila[idx.uso],
      origen: fila[idx.origen],
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

/**
 * Paso 2.6 Parte G — `looker` tiene DOS hojas de resumen conviviendo en el mismo
 * archivo: `resumen_metricas_dinamico` y `resumen_metricas`. `hoja_default` (BASES)
 * apunta a `resumen_metricas`, pero `DIAG_FECHAS` del 30/07 y la metadata de Drive
 * vieron `_dinamico` como primera solapa, y las letras de columna que carga `MAPEO`
 * (`SEED_MAPEO_`, Instalar.gs) corresponden a `_dinamico`. Antes de aplicar DOC-3
 * Parte A hace falta saber si tienen el mismo orden de columnas: si no, `MAPEO` está
 * leyendo la solapa equivocada por letra, sin fallar. Esta función solo describe
 * (fila 1 + conteo de filas de las dos) — no decide cuál queda `fuente` en SOLAPAS,
 * esa decisión es del usuario (ver Plan Inicial/PROYECTO.md §5).
 */
function compararResumenesLooker_() {
  var bases = leerBases();
  var base = bases.looker;
  if (!base || !base.sheet_id) {
    return { ok: false, motivo: 'La base "looker" no está configurada (sin sheet_id).' };
  }

  var libro;
  try {
    libro = SpreadsheetApp.openById(base.sheet_id);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir looker: ' + e.message };
  }

  var nombres = ['resumen_metricas_dinamico', 'resumen_metricas'];
  var filas = nombres.map(function (nombre) {
    var hoja = libro.getSheetByName(nombre);
    if (!hoja) return { solapa: nombre, estado: 'no existe' };

    var ultimaCol = hoja.getLastColumn();
    var headers = ultimaCol ? hoja.getRange(1, 1, 1, ultimaCol).getValues()[0] : [];
    return {
      solapa: nombre,
      estado: 'existe',
      es_hoja_default: nombre === base.hoja_default ? 'sí' : '',
      filas_de_datos: Math.max(hoja.getLastRow() - 1, 0),
      encabezado_fila1: headers.join(' | ')
    };
  });

  var existen = filas.filter(function (f) { return f.estado === 'existe'; });
  var mismoOrdenColumnas = existen.length === 2 ? (existen[0].encabezado_fila1 === existen[1].encabezado_fila1) : null;

  return { ok: true, filas: filas, mismoOrdenColumnas: mismoOrdenColumnas };
}

function menuCompararResumenesLooker_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = compararResumenesLooker_();

  if (!resultado.ok) {
    ui.alert('No se pudo comparar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [];
  resultado.filas.forEach(function (f) {
    if (f.estado !== 'existe') {
      lineas.push('⚠ ' + f.solapa + ' — ' + f.estado);
      return;
    }
    lineas.push((f.es_hoja_default === 'sí' ? '★ ' : '  ') + f.solapa +
      ' (hoja_default=' + (f.es_hoja_default || 'no') + ') — ' + f.filas_de_datos + ' filas de datos');
    lineas.push('    ' + f.encabezado_fila1);
  });

  lineas.push('');
  if (resultado.mismoOrdenColumnas === true) {
    lineas.push('✅ Mismo orden de columnas en las dos — MAPEO por letra apunta a la solapa correcta en cualquiera de las dos.');
  } else if (resultado.mismoOrdenColumnas === false) {
    lineas.push('⚠ Orden de columnas DISTINTO entre las dos — si MAPEO sigue leyendo por letra la solapa equivocada, ' +
      'todo lo leído de looker hasta hoy salió de la columna de al lado, sin fallar. Falta decidir cuál queda ' +
      'uso=fuente en SOLAPAS antes de tocar DOC-3 Parte A.');
  }

  ui.alert('looker: resumen_metricas vs resumen_metricas_dinamico', lineas.join('\n'), ui.ButtonSet.OK);
}
