/**
 * Config.gs — Configuración y lectura de registros.
 * Expone:
 *   leerBases()           -> { base_id: {nombre, sheet_id, hoja_default, fila_encabezado,
 *                               modo_periodo, tipo, activo, notas} }
 *   leerInformes()         -> { informe_id: {nombre, plantilla_id, periodicidad, familias, activo, notas} }
 *   leerConfig()          -> { clave: valor } desde la hoja CONFIG
 *   leerMapeo()           -> { base_id: { solapa: { campo_logico: {hoja, columna, notas} } } }
 *   buscarMapeo(base_id, solapa, campo_logico) -> { ok, hoja, columna } o { ok:false, motivo }
 *     Única vía de resolución de MAPEO (Paso 2.3.2) — `solapa` es obligatoria, sin
 *     default a `hoja_default`: un default silencioso ahí devuelve la fila de otra
 *     solapa sin avisar.
 *   validarMapeo()        -> detecta tríos (base_id, solapa, campo_logico) duplicados
 *   leerPeriodos()        -> { periodo_id: {desde, hasta, notas} }
 *   leerCampanas()        -> { campana_id: {nombre, informe_id, base_id, tipo, desde, hasta, mostrar, orden} }
 *   escribirConfig(k, v)  -> setea una clave en CONFIG
 * Regla: NADIE hace cuentas de fechas fuera de este módulo y Fuentes.gs.
 * leerBases/leerInformes: Paso 1. leerConfig: Paso 1.6 v2.
 * leerMapeo/leerPeriodos/leerCampanas: Paso 2. buscarMapeo/validarMapeo: Paso 2.3.2.
 * escribirConfig: pendiente (fuera de alcance por ahora).
 */

function leerBases() {
  return leerRegistro_('BASES', 'base_id');
}

function leerInformes() {
  return leerRegistro_('INFORMES', 'informe_id');
}

function leerPeriodos() {
  return leerRegistro_('PERIODOS', 'periodo_id');
}

function leerCampanas() {
  return leerRegistro_('CAMPANAS', 'campana_id');
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

/**
 * MAPEO tiene clave compuesta (base_id, solapa, campo_logico) — Paso 2.3.2 —, a
 * diferencia de las demás hojas de registro (clave simple), por eso no usa
 * leerRegistro_. `solapa` es parte de la clave porque una misma base puede
 * mapear el mismo campo_logico en solapas distintas (`digital` tiene 6); sin
 * `solapa` en la clave, una se pisaba a la otra en silencio.
 */
function leerMapeo() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MAPEO');
  if (!hoja) return {};

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxCampoLogico = headers.indexOf('campo_logico');
  var idxHoja = headers.indexOf('hoja');
  var idxColumna = headers.indexOf('columna');
  var idxNotas = headers.indexOf('notas');

  var mapa = {};
  datos.forEach(function (fila) {
    var baseId = fila[idxBaseId];
    var solapa = fila[idxSolapa];
    var campoLogico = fila[idxCampoLogico];
    if (!baseId || !solapa || !campoLogico) return;

    if (!mapa[baseId]) mapa[baseId] = {};
    if (!mapa[baseId][solapa]) mapa[baseId][solapa] = {};
    mapa[baseId][solapa][campoLogico] = {
      hoja: fila[idxHoja],
      columna: fila[idxColumna],
      notas: fila[idxNotas]
    };
  });

  return mapa;
}

/**
 * Única vía de resolución de MAPEO (Paso 2.3.2). `solapa` es obligatoria: sin
 * ella no hay forma de saber a cuál de las varias solapas posibles de una base
 * se refiere `campo_logico`, y devolver un default silencioso ahí es
 * exactamente el modo de falla que esto reemplaza (ver Paso-2.3.2.md).
 */
function buscarMapeo(baseId, solapa, campoLogico) {
  if (!solapa) {
    return { ok: false, motivo: 'buscarMapeo requiere solapa (base_id="' + baseId + '", campo_logico="' + campoLogico + '")' };
  }

  var mapa = leerMapeo();
  var fila = mapa[baseId] && mapa[baseId][solapa] && mapa[baseId][solapa][campoLogico];
  if (!fila) {
    return { ok: false, motivo: 'falta MAPEO: ' + baseId + '/' + solapa + '/' + campoLogico };
  }
  if (!fila.columna) {
    return { ok: false, motivo: 'MAPEO "' + baseId + '/' + solapa + '/' + campoLogico + '" existe pero no tiene columna cargada' };
  }

  return { ok: true, hoja: fila.hoja, columna: fila.columna };
}

/**
 * Detecta tríos (base_id, solapa, campo_logico) repetidos en MAPEO — no debería
 * pasar si todo se escribe vía upsertPorClave_ con esa clave, pero una edición
 * a mano en la hoja puede introducir uno. Paso 2.3.2, sección E.
 */
function validarMapeo() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MAPEO');
  if (!hoja) return { ok: false, motivo: 'La hoja MAPEO no existe.' };

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxCampo = headers.indexOf('campo_logico');

  var vistos = {};
  var duplicados = [];

  datos.forEach(function (fila, i) {
    var baseId = fila[idxBaseId];
    if (!baseId) return;
    var clave = baseId + '||' + fila[idxSolapa] + '||' + fila[idxCampo];
    if (vistos[clave]) {
      duplicados.push({
        clave: baseId + '/' + fila[idxSolapa] + '/' + fila[idxCampo],
        filas: [vistos[clave], i + 2]
      });
    } else {
      vistos[clave] = i + 2; // fila real en la hoja (1-based + encabezado)
    }
  });

  return { ok: true, duplicados: duplicados };
}

function menuValidarMapeo_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = validarMapeo();

  if (!resultado.ok) {
    ui.alert('No se pudo validar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }
  if (!resultado.duplicados.length) {
    ui.alert('MAPEO sin duplicados', 'No se encontraron tríos (base_id, solapa, campo_logico) repetidos.', ui.ButtonSet.OK);
    return;
  }

  var lineas = resultado.duplicados.map(function (d) {
    return '⚠️ ' + d.clave + ' — filas ' + d.filas.join(' y ');
  });
  ui.alert('Duplicados en MAPEO', lineas.join('\n'), ui.ButtonSet.OK);
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
