/**
 * Fuentes.gs — Acceso a bases en vivo y lectura de datos fuente.
 * Expone:
 *   abrirBase(baseId)             -> { ok, base, libro } o { ok:false, motivo }
 *   abrirHoja(baseId, nombreHoja?) -> { ok, base, libro, hoja } o { ok:false, motivo }
 *   probarConexionBases()         -> reporte de estado por base (ítem de menú)
 *   resolverVentana({informe_id, periodo_ref, campana}) -> { ok, desde, hasta, origen }
 *     Prioridad: campaña > periodo_ref (PERIODOS) > período principal (CONFIG).
 *   leerFuente(baseId, ventana, nombreHojaOverride?) -> diagnóstico + filas de esa
 *     ventana (ver docs/Prompts/VERIFICACION_Paso-2.md §1 para el contrato exacto).
 *     Si `modo_periodo=snapshot` (BASES), ignora la ventana y devuelve todas las filas.
 *   probarLecturaPeriodo() -> corre leerFuente sobre las bases activas, para diagnóstico.
 * La resolución de columnas de MAPEO (fecha, clave) pasa por `buscarMapeo`
 * (Config.gs), no por una función propia de este módulo (Paso 2.3.2 — antes
 * había una `resolverCampo` acá que duplicaba esa lógica).
 * abrirBase/abrirHoja cachean la base ya abierta por corrida (no reabren).
 * NADIE hace cuentas de fechas fuera de este módulo y Config.gs.
 * abrirBase/abrirHoja/probarConexionBases se completan en: Paso 1.
 * resolverVentana/leerFuente/probarLecturaPeriodo se completan en: Paso 2.
 *
 * Convención de columna de fecha (Paso 2.3.1): la columna que filtra la ventana
 * de una base es la fila de MAPEO con `campo_logico = 'fecha_periodo'` para ese
 * `base_id` — nunca una constante ni una columna nueva en BASES. Esa fila la
 * puebla `promoverFechasElegidas()` (Fechas.gs) a partir de una elección humana
 * en `DIAG_FECHAS`, no una adivinanza del código: detección automática,
 * elección humana. Si `modo_periodo=snapshot`, no se busca columna de fecha
 * (no aplica ventana, no hay advertencia). Si falta la fila en MAPEO,
 * `leerFuente` nunca devuelve la base sin filtrar: falla con
 * `«FALTA:fecha_periodo@{base_id}/{solapa}»` — ese es el modo de falla caro
 * que hay que evitar, no un silencio.
 *
 * Convención de columna clave (Paso 2.3): igual mecánica que la de fecha, pero
 * con `campo_logico = 'clave'` (o `'campana'` como fallback si no hay `clave`
 * explícita).
 *
 * ⚠ Paso 2.9 Parte B — `leerFuente()` NO EXCLUYE filas por su cuenta. Hasta acá,
 * una fila sin clave (o 100% vacía si no hay clave resoluble) se descartaba del
 * conteo en silencio — parecía prudencia ("filtrar basura") pero era el modo de
 * falla caro: `digital` devolvía 960 de 1297 filas, `rdv` 720 de 1362, `m2` 18
 * de 29.533, todo con ✅. Un lector que decide por su cuenta qué fila "cuenta"
 * hace imposible cualquier `SUMA` correcta río abajo, porque el agregador nunca
 * se entera de lo que faltó. Ahora `leerFuente` devuelve **todas** las filas
 * entre `fila_encabezado` y el final de `getDataRange()` (más el filtro de
 * ventana si `modo_periodo=filtrar`) — "vacía" y "sin clave" pasan a ser
 * conteos informativos (`filas_vacias`, `filas_sin_clave`), nunca un filtro
 * aplicado. Si hace falta deduplicar o descartar basura para algo puntual, es
 * una operación aparte y explícita en la capa que lo necesite — no acá.
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
  // Paso 2.10 Parte C: hoja_default vacío es una decisión explícita (caso m2 — ver
  // SEED_BASES_), no un dato faltante por descuido. Mensaje propio para no confundirlo
  // con "no existe una hoja llamada ''", que no dice nada de por qué.
  if (!nombre) {
    return { ok: false, motivo: 'La base "' + baseId + '" no tiene hoja_default (sin fuente activa) y no se pasó una hoja explícita' };
  }
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

/**
 * Columna clave de una base para descartar filas basura del conteo (Paso
 * 2.3): `campo_logico='clave'` en MAPEO si existe para esa solapa; si no,
 * `campo_logico='campana'` como fallback; si no hay ninguna, `{ ok:false }` —
 * el llamador cae al criterio de fila 100% vacía. `solapa` es obligatoria
 * (Paso 2.3.2, `buscarMapeo`): la resuelve el llamador, que ya sabe qué hoja
 * está leyendo.
 */
function resolverClave_(baseId, solapa) {
  var clave = buscarMapeo(baseId, solapa, 'clave');
  if (clave.ok) return clave;
  return buscarMapeo(baseId, solapa, 'campana');
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
 * Fila completamente vacía (todas las celdas '', null, undefined o solo
 * espacios) — se descarta antes de clasificar por fecha, para que
 * `filas_sin_fecha` sirva para lo único que tiene que servir: filas con
 * datos pero sin fecha, no el resto en blanco de la hoja.
 */
function filaVacia_(fila) {
  for (var i = 0; i < fila.length; i++) {
    var valor = fila[i];
    if (valor === null || valor === undefined) continue;
    if (typeof valor === 'string' && valor.trim() === '') continue;
    return false;
  }
  return true;
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
  var filasCrudas = datos.slice(filaEncabezado);

  function filaAObjeto(fila) {
    var obj = {};
    headers.forEach(function (h, i) {
      if (h) obj[h] = fila[i];
    });
    return obj;
  }

  function celdaVacia_(valor) {
    return valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');
  }

  // Paso 2.9 Parte B: "vacía" y "sin clave" son conteos informativos, NUNCA un
  // filtro. `filasDatos` es SIEMPRE `filasCrudas` completo — todas las filas
  // entre `fila_encabezado` y el final de `getDataRange()`, sin excluir nada acá.
  var filasDatos = filasCrudas;
  var filasVacias = 0;
  var filasSinClave = 0;
  var clave = resolverClave_(baseId, hoja.getName());

  if (clave.ok) {
    var idxClave = columnaLetraAIndice_(clave.columna);
    filasCrudas.forEach(function (fila) {
      if (celdaVacia_(fila[idxClave])) filasSinClave++;
      if (filaVacia_(fila)) filasVacias++;
    });
  } else {
    filasCrudas.forEach(function (fila) {
      if (filaVacia_(fila)) filasVacias++;
    });
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
    filas_vacias: filasVacias,
    filas_sin_clave: filasSinClave,
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

  var campoFecha = buscarMapeo(baseId, hoja.getName(), 'fecha_periodo');
  if (!campoFecha.ok) {
    return { ok: false, base_id: baseId, motivo: '«FALTA:fecha_periodo@' + baseId + '/' + hoja.getName() + '»' };
  }

  var idxFecha = columnaLetraAIndice_(campoFecha.columna);
  resultado.columna_fecha = headers[idxFecha] || campoFecha.columna;
  resultado.ventana_aplicada = { desde: ventana.desde, hasta: ventana.hasta };

  // Fallback a texto renderizado (Paso 2.3, hallazgo `looker`): una columna
  // de fecha armada con `QUERY()` puede devolver "" en `getValues()` para
  // celdas que sí muestran una fecha en pantalla — es la celda derramada de
  // la fórmula, no una celda propia. `getDisplayValues()` lee lo que se ve,
  // no lo que `getValues()` cree que hay. Solo se usa cuando el valor crudo
  // vino vacío, así que no cambia nada para bases sin ese problema.
  var filasCrudasDisplay = hoja.getDataRange().getDisplayValues().slice(filaEncabezado);

  // Comparación por string yyyy-MM-dd (Paso 2.3.1), no por epoch ms: el
  // runtime V8 de Apps Script construye `Date` en UTC aunque el spreadsheet
  // tenga otro huso horario, así que comparar timestamps crudos puede correr
  // un día en los bordes. Formatear con el huso del spreadsheet y comparar
  // strings evita esa ambigüedad. Bordes inclusivos de los dos lados.
  var ssTz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  var desdeStr = Utilities.formatDate(ventana.desde, ssTz, 'yyyy-MM-dd');
  var hastaStr = Utilities.formatDate(ventana.hasta, ssTz, 'yyyy-MM-dd');

  filasDatos.forEach(function (fila, j) {
    var crudo = fila[idxFecha];
    if (celdaVacia_(crudo)) {
      var mostrado = filasCrudasDisplay[j][idxFecha];
      if (mostrado && mostrado.trim() !== '') crudo = mostrado;
    }
    if (crudo === '' || crudo === null || crudo === undefined) {
      resultado.filas_sin_fecha++;
      return;
    }

    var fecha = parsearFechaCelda_(crudo);
    if (!fecha) {
      resultado.filas_fecha_invalida++;
      return;
    }

    var fechaStr = Utilities.formatDate(fecha, ssTz, 'yyyy-MM-dd');
    if (fechaStr >= desdeStr && fechaStr <= hastaStr) {
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

/**
 * Diagnóstico manual (no lo llama el menú): para cuando `probarLecturaPeriodo`
 * cuenta filas "sin fecha" que a simple vista sí tienen fecha en la hoja —
 * caso real (Paso 2.3): `looker`, cuya hoja `resumen_metricas` se arma con
 * `QUERY()` y `getValues()` devuelve "" en filas que sí muestran fecha en
 * pantalla (celda derramada de la fórmula). Loguea, por fila, el valor crudo
 * de `getValues()` junto con el valor mostrado de `getDisplayValues()`: si
 * difieren (crudo vacío, mostrado con texto), es este caso — `leerFuente` ya
 * tiene el fallback a `getDisplayValues()` para eso. Ej.: `diagnosticoColumnaFecha_('looker')`.
 */
function diagnosticoColumnaFecha_(baseId, nombreHojaOverride) {
  var abierto = abrirHoja(baseId, nombreHojaOverride);
  if (!abierto.ok) { Logger.log('No se pudo abrir: ' + abierto.motivo); return; }

  var campoFecha = buscarMapeo(baseId, abierto.hoja.getName(), 'fecha_periodo');
  if (!campoFecha.ok) { Logger.log('No se pudo resolver la columna fecha_periodo: ' + campoFecha.motivo); return; }

  var filaEncabezado = Number(abierto.base.fila_encabezado) || 1;
  var idxFecha = columnaLetraAIndice_(campoFecha.columna);
  var datos = abierto.hoja.getDataRange().getValues();
  var datosDisplay = abierto.hoja.getDataRange().getDisplayValues();
  var headers = datos[filaEncabezado - 1];

  Logger.log('Hoja: ' + abierto.hoja.getName() + ' · fila_encabezado: ' + filaEncabezado +
    ' · columna fecha: ' + campoFecha.columna + ' (idx ' + idxFecha + ', header "' + headers[idxFecha] + '")');

  for (var f = filaEncabezado; f < Math.min(datos.length, filaEncabezado + 20); f++) {
    var crudo = datos[f][idxFecha];
    var mostrado = datosDisplay[f][idxFecha];
    Logger.log('fila ' + (f + 1) + ': crudo(typeof=' + typeof crudo + ' esDate=' + (crudo instanceof Date) + ')=' + JSON.stringify(crudo) + ' · mostrado="' + mostrado + '"');
  }
}

// Sin argumentos para poder correrla con el botón ▶ del editor de Apps
// Script (que no permite pasar parámetros a mano).
function diagnosticoLooker_() {
  diagnosticoColumnaFecha_('looker');
}

/**
 * Paso 2.8 Parte D, guardarraíl — un lector que devuelve una fracción chica de
 * lo que `SOLAPAS.filas_datos` registra para esa (base_id, hoja) **sin fallar**
 * es el modo de falla caro en su forma más pura: río abajo, un marcador suma esas
 * pocas filas y produce un número plausible (caso real: `m2` devolvió 18 filas de
 * 29.533, con ✅). No es un error — `filas_datos` es un conteo de referencia
 * (`inventariarSolapas()`, puede estar desactualizado), así que esto solo avisa
 * ⚠, nunca bloquea la lectura. Sin fila en SOLAPAS o sin `filas_datos` cargado,
 * no hay con qué comparar: `{ ok: false }`.
 *
 * Paso 2.9 Parte B punto 5: el umbral del Paso 2.8 (50%) no habría agarrado
 * 960/1297 (74%) ni 720/1362 (53%) — los dos venían del mismo bug (exclusión
 * silenciosa) que la Parte B corrige. Sube a 90% y el porcentaje se muestra
 * siempre, no solo por debajo del umbral: con `leerFuente()` devolviendo todas
 * las filas, la cobertura debería rondar el 100% salvo un corte real en
 * `getDataRange()` — cualquier desvío, aunque no dispare el ⚠, es dato útil.
 */
var UMBRAL_COBERTURA_LECTURA_ = 0.9;

function evaluarCoberturaLectura_(baseId, nombreHoja, filasLeidas) {
  var solapas = leerSolapas();
  var fila = solapas[baseId] && solapas[baseId][nombreHoja];
  var registradas = fila ? Number(fila.filas_datos) : NaN;
  if (!fila || isNaN(registradas) || registradas <= 0) {
    return { ok: false };
  }

  var ratio = filasLeidas / registradas;
  return { ok: true, registradas: registradas, ratio: ratio, bajoUmbral: ratio < UMBRAL_COBERTURA_LECTURA_ };
}

function sufijoCobertura_(cobertura) {
  if (!cobertura.ok) return '';
  var icono = cobertura.bajoUmbral ? ' ⚠' : '';
  return icono + ' cobertura ' + Math.round(cobertura.ratio * 100) + '% de SOLAPAS.filas_datos (' + cobertura.registradas + ')';
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

    // Paso 2.9 Parte B: "sin clave"/"vacías" ya no se descartan del conteo —
    // son dato informativo, se muestran junto al total, no restadas de él.
    var sufijoClave = r.filas_sin_clave > 0 ? ' (' + r.filas_sin_clave + ' sin clave)' : '';
    var sufijoVacias = r.filas_vacias > 0 ? ' (' + r.filas_vacias + ' vacías)' : '';
    var cobertura = evaluarCoberturaLectura_(r.base_id, r.hoja, r.filas_totales);
    var sufijoCob = sufijoCobertura_(cobertura);

    if (r.modo === 'snapshot') {
      var iconoSnapshot = cobertura.bajoUmbral ? '⚠️' : '✅';
      lineas.push(iconoSnapshot + ' ' + r.base_id + ' (' + r.hoja + ', snapshot) — ' + r.filas_totales + ' filas (todas, sin ventana)' + sufijoClave + sufijoVacias + sufijoCob);
      return;
    }

    // Diagnóstico honesto (Paso 2.3): el ✅ solo dice "pude leer y resolver la
    // columna", no "la data sirve". Se degrada a ⚠️ si no cayó nada en la
    // ventana, si más de la mitad de las filas no tienen fecha, o si la
    // cobertura contra SOLAPAS.filas_datos está por debajo del umbral (Paso 2.9
    // Parte B).
    var icono = '✅';
    if (r.filas_en_ventana === 0 || (r.filas_totales > 0 && (r.filas_sin_fecha / r.filas_totales) > 0.5) || cobertura.bajoUmbral) {
      icono = '⚠️';
    }

    lineas.push(
      icono + ' ' + r.base_id + ' (' + r.hoja + ', col fecha "' + r.columna_fecha + '") — ' +
      r.filas_totales + ' totales, ' + r.filas_en_ventana + ' en ventana, ' +
      r.filas_sin_fecha + ' sin fecha, ' + r.filas_fecha_invalida + ' fecha inválida' + sufijoClave + sufijoVacias + sufijoCob
    );
  });

  ui.alert('Prueba de lectura por ventana', lineas.join('\n'), ui.ButtonSet.OK);
}
