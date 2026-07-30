/**
 * Preselección de DIAG_FECHAS a partir de decisiones ya tomadas.
 *
 * DIAG_FECHAS se borra y reescribe en cada corrida, así que `elegida` no guarda
 * conocimiento. La fuente de verdad de lo ya decidido es MAPEO. Estas dos funciones
 * releen esas decisiones y las vuelven a marcar, para que volver a correr la detección
 * no obligue a re-elegir a mano.
 *
 * NO elige sola por heurística. Una columna elegida por regla no falla: filtra otro
 * conjunto de filas y el informe sale con números plausibles. Lo que no está decidido
 * queda vacío, para que una persona lo mire.
 *
 * Ambas funciones son puras: no leen hojas. Los datos se les pasan.
 */


/**
 * Índice de las decisiones ya promovidas.
 *
 * @param {Array<Object>} filasMapeo  Filas de MAPEO como objetos con al menos
 *                                    {base_id, solapa, campo_logico, columna}.
 *                                    ADAPTAR: si en MAPEO la columna se guarda con otro
 *                                    nombre (p.ej. `col` o `encabezado`), cambiar la
 *                                    lectura de `f.columna` acá abajo y nada más.
 * @return {Object} mapa "base_id|solapa" -> columna decidida.
 */
function decisionesFechaPrevias_(filasMapeo) {
  var mapa = {};
  if (!filasMapeo) return mapa;

  for (var i = 0; i < filasMapeo.length; i++) {
    var f = filasMapeo[i];
    if (String(f.campo_logico).trim() !== 'fecha_periodo') continue;

    var clave = String(f.base_id).trim() + '|' + String(f.solapa).trim();
    mapa[clave] = String(f.columna).trim();
  }
  return mapa;
}


/**
 * Decide qué escribir en `elegida` y `origen` para una fila de DIAG_FECHAS.
 *
 * @param {Object} fila       {base_id, solapa, col_letra, tipo}
 * @param {Object} decisiones Salida de decisionesFechaPrevias_().
 * @return {{elegida: string, origen: string}}
 *
 *   elegida='sí'  origen='MAPEO'    -> ya decidido antes, se remarca solo.
 *   elegida=''    origen='REVISAR'  -> hay decisión para esa solapa pero apunta a otra
 *                                      columna: la estructura cambió. Nadie la marca
 *                                      automáticamente.
 *   elegida=''    origen=''         -> sin decisión previa. Elección humana.
 */
function preseleccionFilaDiag_(fila, decisiones) {
  var clave = String(fila.base_id).trim() + '|' + String(fila.solapa).trim();
  var decidida = decisiones[clave];

  if (!decidida) return { elegida: '', origen: '' };

  if (decidida === String(fila.col_letra).trim()) {
    // No re-marcar si dejó de ser candidata FECHA: eso es justamente lo que hay que ver.
    if (String(fila.tipo).trim().toUpperCase() !== 'FECHA') {
      return { elegida: '', origen: 'REVISAR' };
    }
    return { elegida: 'sí', origen: 'MAPEO' };
  }

  return { elegida: '', origen: 'REVISAR' };
}
