/**
 * Secciones.gs — Paso 2.9G v2: lector del árbol de `SECCIONES`.
 * El esquema y la siembra (`SEED_SECCIONES_`, `sembrarSecciones_()`) viven en
 * Instalar.gs, junto con el resto de las hojas de registro.
 *
 * Expone:
 *   leerSecciones_(informeId) -> árbol (array de nodos de primer nivel, cada
 *     uno con `.hijos`) de las secciones que aplican a ese informe, ordenado
 *     por `orden` dentro de cada nivel. Una sección entra si su columna
 *     `informes` (separada por comas) incluye `informeId` — los bloques
 *     compartidos (JM,SECCO) aparecen en los dos árboles.
 *
 * El contexto de resolución de un token es el ítem que se está emitiendo (la
 * reunión, la campaña, la audiencia), no el informe entero — el mismo token
 * (`ecv_asistentes`, por ejemplo) vale distinto en cada copia del bloque. No
 * se implementa acá (Paso 2.9G no calcula ni emite nada): queda como contrato
 * para cuando el despachador de Marcadores.gs/Generador.gs recorra este árbol.
 */

function leerSecciones_(informeId) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SECCIONES');
  if (!hoja) return [];

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });
  if (idx.seccion_id === undefined || idx.informes === undefined) return [];

  var todas = datos
    .filter(function (fila) { return fila[idx.seccion_id]; })
    .map(function (fila) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = fila[i]; });
      return obj;
    })
    .filter(function (obj) {
      var informes = String(obj.informes || '').split(',').map(function (s) { return s.trim(); });
      return informes.indexOf(informeId) !== -1;
    });

  var porId = {};
  todas.forEach(function (s) { s.hijos = []; porId[s.seccion_id] = s; });

  var raiz = [];
  todas.forEach(function (s) {
    if (s.padre && porId[s.padre]) {
      porId[s.padre].hijos.push(s);
    } else {
      raiz.push(s);
    }
  });

  function ordenarRecursivo(lista) {
    lista.sort(function (a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); });
    lista.forEach(function (s) { ordenarRecursivo(s.hijos); });
  }
  ordenarRecursivo(raiz);

  return raiz;
}
