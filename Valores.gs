/**
 * Valores.gs — Paso 2.9H: snapshot de cada token calculado + decisión explícita
 * de reusar o actualizar cuando dos informes que comparten un bloque (JM es un
 * subconjunto de SECCO, docs/SECCIONES.md "JM es un subconjunto de SECCO") lo
 * calculan en momentos distintos y el valor cambió.
 *
 * El problema que resuelve: las campañas siguen corriendo entre que sale JM y
 * sale SECCO. Recalcular en silencio hace que los dos informes digan un número
 * distinto sin que nadie sepa por qué (el desvío de 867 vs 1.026 clics del
 * punteo del 30/07). Congelar en silencio publica un número viejo de una
 * campaña que siguió. Ninguna de las dos puede ser automática — la persona
 * decide, una sola vez por divergencia, y la decisión se guarda.
 *
 * Expone:
 *   registrarValorCalculado_({periodo, informe_id, seccion_id, item, token,
 *     valor, parcial}) -> { ok, valor, origen_valor, pendienteDecision? }
 *     `valor` es el que hay que usar en la corrida — si hay una divergencia
 *     sin decidir, es el valor ANTERIOR (nunca se elige solo cuál usar).
 *   leerDivergenciasPendientes_() -> filas de VALORES_DIVERGENTES sin
 *     `decision`, ordenadas: primero las de campaña CERRADA (⚠, más grave —
 *     un dato que cambia cuando no debería), después las `parcial` (esperable
 *     que suban).
 *
 * Toda la aritmética sigue viviendo en Marcadores.gs — esto solo compara y
 * persiste, no calcula nada.
 */

function hojaValores_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('VALORES');
}

function hojaValoresDivergentes_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('VALORES_DIVERGENTES');
}

/**
 * Última fila de VALORES para (periodo, item, token), sin importar de qué
 * `informe_id` salió — es la comparación que pide el punto 2 del prompt.
 */
function buscarUltimoValor_(hoja, periodo, item, token) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var ultimo = null;
  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idx.periodo] === periodo && datos[f][idx.item] === item && datos[f][idx.token] === token) {
      var candidato = { valor: datos[f][idx.valor], fecha_calculo: datos[f][idx.fecha_calculo] };
      if (!ultimo || String(candidato.fecha_calculo) >= String(ultimo.fecha_calculo)) ultimo = candidato;
    }
  }
  return ultimo;
}

function escribirFilaValores_(hoja, periodo, informeId, seccionId, item, token, valor, fechaCalculo, origenValor, parcial) {
  hoja.appendRow([periodo, informeId, seccionId, item, token, valor, fechaCalculo, origenValor, parcial]);
}

/**
 * Última fila de VALORES_DIVERGENTES para (item, token) — puede o no tener
 * `decision` cargada. Buscar de abajo hacia arriba: si hubo más de una
 * divergencia histórica, la última es la vigente.
 */
function buscarDivergencia_(hoja, item, token) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  for (var f = datos.length - 1; f >= 1; f--) {
    if (datos[f][idx.item] === item && datos[f][idx.token] === token) {
      return { fila: f + 1, idx: idx, decision: datos[f][idx.decision], valor_nuevo: datos[f][idx.valor_nuevo] };
    }
  }
  return null;
}

function registrarOActualizarDivergencia_(hoja, item, token, valorAnterior, fechaAnterior, valorNuevo, parcial) {
  var diferenciaTexto = '';
  var anteriorNum = Number(valorAnterior);
  var nuevoNum = Number(valorNuevo);
  if (!isNaN(anteriorNum) && !isNaN(nuevoNum) && anteriorNum !== 0) {
    diferenciaTexto = (((nuevoNum - anteriorNum) / anteriorNum) * 100).toFixed(1) + '%';
  } else {
    diferenciaTexto = valorAnterior + ' → ' + valorNuevo;
  }

  var existente = buscarDivergencia_(hoja, item, token);
  var fila = [item, token, valorAnterior, fechaAnterior, valorNuevo, diferenciaTexto, parcial, existente ? existente.decision : ''];

  if (existente && existente.valor_nuevo === valorNuevo) {
    // Misma divergencia que ya está registrada (mismo valor nuevo) — no
    // duplica la fila, solo la deja como está (con o sin decisión).
    return existente;
  }
  if (existente && !existente.decision) {
    // Divergencia previa sin decidir, pero con un valor nuevo distinto al de
    // antes (la campaña parcial siguió corriendo) — actualiza en el lugar en
    // vez de acumular filas sin decisión para el mismo (item, token).
    hoja.getRange(existente.fila, 1, 1, fila.length).setValues([fila]);
    return { fila: existente.fila, decision: '' };
  }

  hoja.appendRow(fila);
  return { fila: hoja.getLastRow(), decision: '' };
}

/**
 * Registra el cálculo de un token para (periodo, informe, item). Compara
 * contra el último valor conocido de (periodo, item, token) sin importar de
 * qué informe salió:
 *   - no hay valor previo -> se calcula, origen_valor='nuevo'.
 *   - el valor coincide -> se reusa, origen_valor='reusado' (se agrega una
 *     fila igual, nunca se pisa la anterior).
 *   - el valor difiere y ya hay una `decision` cargada para ese (item, token)
 *     -> se aplica esa decisión (no se vuelve a preguntar).
 *   - el valor difiere sin decisión -> se registra en VALORES_DIVERGENTES y se
 *     devuelve el valor ANTERIOR, marcado pendiente. Nunca se elige solo.
 */
function registrarValorCalculado_(opciones) {
  var hojaVal = hojaValores_();
  var hojaDiv = hojaValoresDivergentes_();
  if (!hojaVal || !hojaDiv) {
    return { ok: false, motivo: 'Faltan las hojas VALORES/VALORES_DIVERGENTES. Corré "Instalar / reparar hojas" primero.' };
  }

  var periodo = opciones.periodo;
  var informeId = opciones.informe_id;
  var seccionId = opciones.seccion_id || '';
  var item = opciones.item;
  var token = opciones.token;
  var valorNuevo = opciones.valor;
  var parcial = opciones.parcial ? 'sí' : 'no';
  var ahora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');

  var ultimo = buscarUltimoValor_(hojaVal, periodo, item, token);

  if (!ultimo) {
    escribirFilaValores_(hojaVal, periodo, informeId, seccionId, item, token, valorNuevo, ahora, 'nuevo', parcial);
    return { ok: true, valor: valorNuevo, origen_valor: 'nuevo' };
  }

  if (String(ultimo.valor) === String(valorNuevo)) {
    escribirFilaValores_(hojaVal, periodo, informeId, seccionId, item, token, valorNuevo, ahora, 'reusado', parcial);
    return { ok: true, valor: valorNuevo, origen_valor: 'reusado' };
  }

  // Divergencia. ¿Ya hay una decisión humana vigente para este (item, token)?
  var divergenciaVigente = buscarDivergencia_(hojaDiv, item, token);
  var decisionPrevia = divergenciaVigente && divergenciaVigente.valor_nuevo === valorNuevo ? String(divergenciaVigente.decision || '').trim().toLowerCase() : '';

  if (decisionPrevia === 'actualizar') {
    escribirFilaValores_(hojaVal, periodo, informeId, seccionId, item, token, valorNuevo, ahora, 'nuevo', parcial);
    return { ok: true, valor: valorNuevo, origen_valor: 'nuevo', decisionAplicada: 'actualizar' };
  }
  if (decisionPrevia === 'reusar') {
    escribirFilaValores_(hojaVal, periodo, informeId, seccionId, item, token, ultimo.valor, ahora, 'reusado', parcial);
    return { ok: true, valor: ultimo.valor, origen_valor: 'reusado', decisionAplicada: 'reusar' };
  }

  registrarOActualizarDivergencia_(hojaDiv, item, token, ultimo.valor, ultimo.fecha_calculo, valorNuevo, parcial);
  return { ok: true, valor: ultimo.valor, origen_valor: 'pendiente', pendienteDecision: true };
}

/**
 * Divergencias sin `decision`, ordenadas: primero las de campaña CERRADA
 * (`parcial='no'`) — un dato que cambia cuando no debería es más grave que uno
 * que cambia como corresponde (Paso 2.9H, punto 4) — después las `parcial`.
 */
function leerDivergenciasPendientes_() {
  var hoja = hojaValoresDivergentes_();
  if (!hoja) return [];

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  return datos
    .filter(function (fila) { return fila[idx.item] && !fila[idx.decision]; })
    .map(function (fila) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = fila[i]; });
      return obj;
    })
    .sort(function (a, b) {
      var aCerrada = a.parcial !== 'sí' ? 0 : 1;
      var bCerrada = b.parcial !== 'sí' ? 0 : 1;
      return aCerrada - bCerrada;
    });
}

function menuRevisarDivergenciasValores_() {
  var ui = ui_();
  var pendientes = leerDivergenciasPendientes_();

  if (!pendientes.length) {
    ui.alert('Sin divergencias pendientes', 'VALORES_DIVERGENTES no tiene filas sin decisión.', ui.ButtonSet.OK);
    return;
  }

  var lineas = ['Divergencias sin decisión (' + pendientes.length + '), campañas cerradas primero:', ''];
  pendientes.forEach(function (d) {
    var marca = d.parcial === 'sí' ? '' : '⚠ ';
    lineas.push(marca + d.item + ' / ' + d.token + ': ' + d.valor_anterior + ' → ' + d.valor_nuevo +
      ' (' + d.diferencia + ')' + (d.parcial === 'sí' ? ' — parcial' : ' — CERRADA'));
  });
  lineas.push('', 'Completar "decision" (reusar/actualizar) en VALORES_DIVERGENTES — acciones en bloque si son muchas.');

  ui.alert('Revisar divergencias de VALORES (Paso 2.9H)', lineas.join('\n'), ui.ButtonSet.OK);
}
