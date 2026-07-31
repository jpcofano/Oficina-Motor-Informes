/**
 * Fechas.gs — Detección de columnas de fecha y contrato `fecha_periodo`.
 * Ver docs/Prompts/Paso-2.3.1.md, docs/Prompts/Paso-2.3.2.md y docs/Prompts/Paso-2.3.3.md.
 * Expone:
 *   detectarColumnasFecha()  -> recorre BASES + todas sus solapas (salvo las que salta
 *     SOLAPAS_EXCLUIDAS_/SOLAPAS_PERMITIDAS_), vuelca candidatas en la hoja DIAG_FECHAS
 *     (la crea si no existe, la limpia y reescribe en cada corrida).
 *   promoverFechasElegidas() -> lee DIAG_FECHAS, toma las filas con `elegida='sí'` y
 *     escribe/actualiza en MAPEO una fila `(base_id, solapa, campo_logico='fecha_periodo')`
 *     por base+solapa. Además migra en el momento cualquier fila que haya quedado con el
 *     prefijo de la versión anterior de este paso (`migrarPrefijosFechaPeriodo_`).
 * Detección automática, elección humana: acá no se decide sola ninguna columna — el
 * humano marca `elegida` en DIAG_FECHAS antes de promover. Mismo espíritu que CAMPANAS.
 * NO calcula marcadores ni toca plantillas — la regla de oro de Marcadores.gs sigue intacta.
 *
 * Paso 2.3.3 — DIAG_FECHAS no guarda conocimiento entre corridas (se borra y reescribe
 * siempre), así que `detectarColumnasFecha()` relee lo ya decidido en MAPEO
 * (`decisionesFechaPrevias_`/`preseleccionFilaDiag_`, en preseleccion_fechas.gs) y
 * preselecciona. Columna nueva `origen` en DIAG_FECHAS:
 *   elegida='sí' origen='MAPEO'   -> ya decidido antes (misma letra), se remarca solo.
 *   elegida=''   origen='REVISAR' -> hay decisión para esa base+solapa pero apunta a otra
 *     columna (la estructura cambió) o la columna decidida dejó de clasificar como FECHA.
 *     Nunca se remarca sola — es el caso que este paso existe para atrapar.
 *   elegida=''   origen=''        -> sin decisión previa, elección humana como siempre.
 * `SOLAPAS_EXCLUIDAS_` (por base_id) salta solapas antes de escanearlas — copias de
 * trabajo y vistas con banner de período (ver "Criterio de fuente cruda", R-02 en
 * docs/REGLAS_NEGOCIO.md, y el detalle en docs/FECHAS_seleccion.md). Para bases con
 * `MAPEO` ya sembrado sin ambigüedad (hoy `m2` — ver docs/MAPEO_completo.md "M2"),
 * `SOLAPAS_PERMITIDAS_` hace lo inverso: solo se escanean las solapas que MAPEO ya usa: no
 * hace falta enumerar por nombre las que no.
 * `rango_plausible` en DIAG_FECHAS marca (no excluye) columnas FECHA cuyo rango cae fuera
 * de [2015, año actual + 2] — ver R-03 en docs/REGLAS_NEGOCIO.md.
 */

var HOJA_DIAG_FECHAS_ = 'DIAG_FECHAS';
var HEADERS_DIAG_FECHAS_ = [
  'base_id', 'sheet_id', 'solapa', 'col_letra', 'encabezado', 'tipo',
  'pct_fecha', 'fecha_min', 'fecha_max', 'rango_plausible',
  'muestra1', 'muestra2', 'muestra3', 'elegida', 'origen'
];
var FILAS_MUESTRA_DETECCION_ = 200;
var UMBRAL_CANDIDATA_FECHA_ = 0.8;
var ANIO_MIN_PLAUSIBLE_ = 2015;

/**
 * Exclusión por (base_id, solapa) — Paso 2.3.3 parte B, para bases con solapas
 * "sin decidir" todavía (`rdv`/`digital` — ver docs/FECHAS_seleccion.md "Sin decidir").
 * Motivo de cada una en docs/FECHAS_seleccion.md "Excluidas y por qué". Para agregar una
 * solapa: sumar su nombre exacto (como figura en la pestaña) al arreglo de su base_id
 * acá, y documentar el motivo en docs/FECHAS_seleccion.md.
 */
var SOLAPAS_EXCLUIDAS_ = {
  rdv: ['Para Revisar', 'Copia de Para Revisar', 'Copia de Para Revisar 1', 'RVD JM-CM - ES Back Up'],
  digital: ['Buscador por periodo digital', 'Buscador por periodo directa']
};

/**
 * Lista de permitidas (en vez de excluidas) — para bases donde `MAPEO` ya está sembrado
 * y sin ambigüedad, así que se sabe con certeza cuáles son las únicas solapas reales
 * (ver docs/MAPEO_completo.md "M2"; hojas sembradas en Instalar.gs `SEED_MAPEO_`). Toda
 * otra solapa del libro (vistas con banner de período u otras) queda afuera del barrido,
 * sin necesidad de enumerarlas por nombre. Si una base aparece acá, gana sobre
 * `SOLAPAS_EXCLUIDAS_` para ese `base_id`.
 */
var SOLAPAS_PERMITIDAS_ = {
  m2: ['M2 periodo DIRECTA', 'M2 periodo DIGITAL']
};
var REGEX_TEXTO_FECHA_ = /^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/;

/**
 * A) Diagnóstico. Recorre las bases activas de BASES (por sheet_id) y, dentro de cada
 * una, TODAS las solapas del libro (no solo hoja_default) — el join de `digital` en el
 * Paso 2.4 necesita fecha por solapa, no solo la default.
 */
function detectarColumnasFecha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaDiag = obtenerOCrearHojaDiagFechas_(ss);
  var decisiones = decisionesFechaPrevias_(filasMapeoPlano_());

  var bases = leerBases();
  var filas = [];
  var basesSinAcceso = [];
  var solapasSalteadas = [];

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

    var filaEncabezado = Number(base.fila_encabezado) || 1;
    var permitidas = SOLAPAS_PERMITIDAS_[baseId];
    var excluidas = SOLAPAS_EXCLUIDAS_[baseId] || [];

    libro.getSheets().forEach(function (solapa) {
      var nombreSolapa = solapa.getName();
      var salteada = permitidas
        ? permitidas.indexOf(nombreSolapa) === -1
        : excluidas.indexOf(nombreSolapa) !== -1;

      if (salteada) {
        solapasSalteadas.push(baseId + '/' + nombreSolapa);
        return;
      }

      var filasSolapa = detectarColumnasFechaEnSolapa_(baseId, base.sheet_id, solapa, filaEncabezado);
      filasSolapa.forEach(function (fila) {
        var pre = preseleccionFilaDiag_(fila, decisiones);
        fila.elegida = pre.elegida;
        fila.origen = pre.origen;
      });
      filas = filas.concat(filasSolapa);
    });
  });

  escribirDiagFechas_(hojaDiag, filas);

  var estados = { mapeo: 0, revisar: 0, sinDecision: 0 };
  filas.forEach(function (f) {
    if (f.origen === 'MAPEO') estados.mapeo++;
    else if (f.origen === 'REVISAR') estados.revisar++;
    else estados.sinDecision++;
  });

  return {
    ok: true,
    filas: filas.length,
    basesSinAcceso: basesSinAcceso,
    solapasSalteadas: solapasSalteadas,
    estados: estados
  };
}

/**
 * Aplana `leerMapeo()` (Config.gs) — objeto anidado base_id → solapa → campo_logico — al
 * arreglo de filas planas que espera `decisionesFechaPrevias_` (preseleccion_fechas.gs).
 */
function filasMapeoPlano_() {
  var mapa = leerMapeo();
  var filas = [];
  Object.keys(mapa).forEach(function (baseId) {
    Object.keys(mapa[baseId]).forEach(function (solapa) {
      Object.keys(mapa[baseId][solapa]).forEach(function (campoLogico) {
        filas.push({
          base_id: baseId,
          solapa: solapa,
          campo_logico: campoLogico,
          columna: mapa[baseId][solapa][campoLogico].columna
        });
      });
    });
  });
  return filas;
}

/**
 * Header y muestra de datos respetan `fila_encabezado` de BASES (no siempre es la fila
 * 1 — m2 lo tiene en la 3) y se asume igual para todas las solapas de una misma base,
 * consistente con cómo ya está sembrado MAPEO (Paso 2.3: "encabezado en fila 1 en TODAS
 * las solapas" para `digital`; m2 comparte la fila 3 en sus dos hojas).
 */
function detectarColumnasFechaEnSolapa_(baseId, sheetId, hojaSheet, filaEncabezado) {
  var ultimaFila = hojaSheet.getLastRow();
  var ultimaColumna = hojaSheet.getLastColumn();
  if (ultimaFila < filaEncabezado || ultimaColumna === 0) return [];

  var headers = hojaSheet.getRange(filaEncabezado, 1, 1, ultimaColumna).getValues()[0];
  var filasDisponibles = ultimaFila - filaEncabezado;
  if (filasDisponibles <= 0) return [];

  var muestraFilas = Math.min(filasDisponibles, FILAS_MUESTRA_DETECCION_);
  var datos = hojaSheet.getRange(filaEncabezado + 1, 1, muestraFilas, ultimaColumna).getValues();

  var filas = [];
  for (var col = 0; col < ultimaColumna; col++) {
    var encabezado = headers[col];
    if (valorVacioFecha_(encabezado)) continue;

    var nFechas = 0, nTextoFecha = 0, nNoVacios = 0;
    var muestras = [];

    for (var f = 0; f < datos.length; f++) {
      var valor = datos[f][col];
      if (valorVacioFecha_(valor)) continue;
      nNoVacios++;
      if (muestras.length < 3) muestras.push(valor);

      if (valor instanceof Date && !isNaN(valor.getTime())) {
        nFechas++;
      } else if (typeof valor === 'string' && REGEX_TEXTO_FECHA_.test(valor.trim())) {
        nTextoFecha++;
      }
    }

    if (nNoVacios === 0) continue;
    var pct = (nFechas + nTextoFecha) / nNoVacios;
    if (pct < UMBRAL_CANDIDATA_FECHA_) continue;

    var tipo = nFechas >= nTextoFecha ? 'FECHA' : 'TEXTO';
    // fecha_min/fecha_max, Paso 2.3.1 (línea "solo si tipo=FECHA"): rango real de
    // toda la columna (no de la muestra de 200 filas), para que el mín/máx que ve
    // el humano en DIAG_FECHAS no dependa de cuánto entró en la muestra.
    var rango = tipo === 'FECHA'
      ? rangoFechasColumna_(hojaSheet, filaEncabezado + 1, col + 1)
      : { min: '', max: '' };

    // rango_plausible (Paso 2.3.3 parte C, R-03): marca, no excluye. Agarra las columnas
    // HORA (Sheets las guarda como fecha 1899-12-30) y tipeos de año como el 20206 real
    // de digital/Directa Mail col F.
    var rangoPlausible = '';
    if (rango.min) {
      var anioMin = Number(rango.min.slice(0, 4));
      var anioMax = Number(rango.max.slice(0, 4));
      var anioLimite = new Date().getFullYear() + 2;
      rangoPlausible = (anioMin < ANIO_MIN_PLAUSIBLE_ || anioMax > anioLimite) ? 'no' : 'sí';
    }

    filas.push({
      base_id: baseId,
      sheet_id: sheetId,
      solapa: hojaSheet.getName(),
      col_letra: indiceAColumnaLetra_(col),
      encabezado: String(encabezado),
      tipo: tipo,
      pct_fecha: Math.round(pct * 100) / 100,
      fecha_min: rango.min,
      fecha_max: rango.max,
      rango_plausible: rangoPlausible,
      muestra1: muestras[0] !== undefined ? String(muestras[0]) : '',
      muestra2: muestras[1] !== undefined ? String(muestras[1]) : '',
      muestra3: muestras[2] !== undefined ? String(muestras[2]) : '',
      elegida: '',
      origen: ''
    });
  }
  return filas;
}

/**
 * Rango real (min/max) de una columna de fechas, escaneando toda la columna
 * desde `filaInicio` (no una muestra) — usada para `fecha_min`/`fecha_max` de
 * columnas `tipo=FECHA` en DIAG_FECHAS. `idxCol` es 1-based (como `getRange`).
 */
function rangoFechasColumna_(hoja, filaInicio, idxCol) {
  var res = { min: '', max: '', nTotal: 0, nFechas: 0 };

  var ultima = hoja.getLastRow();
  if (ultima < filaInicio) return res;   // solapa vacía o solo encabezado

  res.nTotal = ultima - filaInicio + 1;
  var valores = hoja.getRange(filaInicio, idxCol, res.nTotal, 1).getValues();

  var minMs = null;
  var maxMs = null;

  for (var i = 0; i < valores.length; i++) {
    var v = valores[i][0];
    if (!(v instanceof Date)) continue;

    var ms = v.getTime();
    if (isNaN(ms)) continue;            // Date inválido

    res.nFechas++;
    if (minMs === null || ms < minMs) minMs = ms;
    if (maxMs === null || ms > maxMs) maxMs = ms;
  }

  if (minMs !== null) {
    var tz = hoja.getParent().getSpreadsheetTimeZone();
    res.min = Utilities.formatDate(new Date(minMs), tz, 'yyyy-MM-dd');
    res.max = Utilities.formatDate(new Date(maxMs), tz, 'yyyy-MM-dd');
  }

  return res;
}

function obtenerOCrearHojaDiagFechas_(ss) {
  var hoja = ss.getSheetByName(HOJA_DIAG_FECHAS_);
  if (!hoja) hoja = ss.insertSheet(HOJA_DIAG_FECHAS_);
  return hoja;
}

function escribirDiagFechas_(hoja, filas) {
  hoja.clear();
  hoja.getRange(1, 1, 1, HEADERS_DIAG_FECHAS_.length).setValues([HEADERS_DIAG_FECHAS_]);
  hoja.setFrozenRows(1);
  if (!filas.length) return;

  var valores = filas.map(function (fila) {
    return HEADERS_DIAG_FECHAS_.map(function (h) { return fila[h] !== undefined ? fila[h] : ''; });
  });
  hoja.getRange(2, 1, valores.length, HEADERS_DIAG_FECHAS_.length).setValues(valores);
}

function valorVacioFecha_(valor) {
  return valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');
}

function indiceAColumnaLetra_(indice) {
  var n = indice + 1;
  var letra = '';
  while (n > 0) {
    var resto = (n - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    n = Math.floor((n - 1) / 26);
  }
  return letra;
}

/**
 * B) Cierre del loop. Lee DIAG_FECHAS, valida, y upsertea en MAPEO.
 *
 * `campo_logico` es siempre el nombre plano `fecha_periodo` (Paso 2.3.2): `solapa`
 * ahora es parte de la clave de MAPEO (`base_id`, `solapa`, `campo_logico` — ver
 * Config.gs `leerMapeo`/`buscarMapeo`), así que dos solapas de la misma base no se
 * pisan aunque compartan `campo_logico`. Ya no hace falta prefijar el nombre con la
 * solapa (versión anterior de este paso, corregida en 2.3.2 — ver
 * `migrarPrefijosFechaPeriodo_`).
 */
function promoverFechasElegidas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaMapeo = ss.getSheetByName('MAPEO');
  if (!hojaMapeo) {
    return { ok: false, motivo: 'La hoja MAPEO no existe. Corré "Instalar / reparar hojas" primero.' };
  }

  var migracion = migrarPrefijosFechaPeriodo_(hojaMapeo);

  var lectura = leerDiagFechas_();
  if (!lectura.ok) return lectura;

  var elegidas = lectura.filas.filter(function (f) { return esVerdadero_(f.elegida); });
  if (!elegidas.length) {
    return { ok: false, motivo: 'No hay ninguna fila con elegida = sí en DIAG_FECHAS.' };
  }

  var porSolapa = {};
  elegidas.forEach(function (f) {
    var clave = f.base_id + '||' + f.solapa;
    if (!porSolapa[clave]) porSolapa[clave] = [];
    porSolapa[clave].push(f);
  });

  var errores = [];

  Object.keys(porSolapa).forEach(function (clave) {
    var grupo = porSolapa[clave];
    if (grupo.length > 1) {
      errores.push('Dos columnas elegida=sí en ' + clave.replace('||', '/') + ': ' +
        grupo.map(function (f) { return f.col_letra + ' (' + f.encabezado + ')'; }).join(', '));
    }
  });

  elegidas.forEach(function (f) {
    if (f.tipo === 'TEXTO') {
      errores.push(f.base_id + '/' + f.solapa + ' col ' + f.col_letra + ' ("' + f.encabezado +
        '") está marcada elegida pero es TEXTO, no FECHA nativa — convertí la columna en la ' +
        'base de origen y volvé a correr "Detectar columnas de fecha".');
    }
  });

  if (errores.length) {
    return { ok: false, motivo: errores.join('\n') };
  }

  var seleccion = Object.keys(porSolapa).map(function (clave) { return porSolapa[clave][0]; });

  var filasParaEscribir = seleccion.map(function (f) {
    return {
      base_id: f.base_id,
      solapa: f.solapa,
      campo_logico: 'fecha_periodo',
      hoja: f.solapa,
      columna: f.col_letra,
      notas: 'fecha_periodo elegida en DIAG_FECHAS (Paso 2.3.1/2.3.2)'
    };
  });

  var resultado = upsertPorClave_(hojaMapeo, ['base_id', 'solapa', 'campo_logico'], filasParaEscribir);
  return {
    ok: true,
    escritas: resultado.escritas,
    actualizadas: resultado.actualizadas,
    filas: filasParaEscribir,
    filasMigradas: migracion.renombradas
  };
}

/**
 * Guarda de migración (Paso 2.3.2): la primera versión de `promoverFechasElegidas`
 * prefijaba `campo_logico` con la solapa (`dig_fecha_periodo`, etc.) para esquivar la
 * clave vieja de MAPEO. Con `solapa` ahora en la clave, ese prefijo sobra y hay que
 * volver esas filas a `fecha_periodo` plano — sin tocar `base_id`/`solapa`/`hoja`/
 * `columna`, que ya eran correctos. No hace nada si nunca se corrió la versión vieja.
 */
function migrarPrefijosFechaPeriodo_(hojaMapeo) {
  var datos = hojaMapeo.getDataRange().getValues();
  var headers = datos[0];
  var idxCampo = headers.indexOf('campo_logico');
  if (idxCampo === -1) return { renombradas: 0 };

  var renombradas = 0;
  for (var f = 1; f < datos.length; f++) {
    var valor = datos[f][idxCampo];
    if (typeof valor === 'string' && valor !== 'fecha_periodo' && /_fecha_periodo$/.test(valor)) {
      hojaMapeo.getRange(f + 1, idxCampo + 1).setValue('fecha_periodo');
      renombradas++;
    }
  }

  return { renombradas: renombradas };
}

function leerDiagFechas_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_DIAG_FECHAS_);
  if (!hoja) {
    return { ok: false, motivo: 'No existe la hoja DIAG_FECHAS. Corré "Detectar columnas de fecha" primero.' };
  }

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var filas = datos
    .filter(function (fila) { return fila[idx.base_id]; })
    .map(function (fila) {
      var obj = {};
      HEADERS_DIAG_FECHAS_.forEach(function (h) { obj[h] = fila[idx[h]]; });
      return obj;
    });

  return { ok: true, filas: filas };
}

/** D) Menú. */
function menuDetectarColumnasFecha_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = detectarColumnasFecha();

  var lineas = [
    'Candidatas encontradas: ' + resultado.filas,
    '  · preseleccionadas de MAPEO: ' + resultado.estados.mapeo,
    '  · a revisar (estructura cambió o dejó de ser FECHA): ' + resultado.estados.revisar,
    '  · sin decisión previa: ' + resultado.estados.sinDecision,
    'Solapas salteadas por exclusión: ' + resultado.solapasSalteadas.length
  ];
  if (resultado.solapasSalteadas.length) {
    lineas = lineas.concat(resultado.solapasSalteadas.map(function (s) { return '  · ' + s; }));
  }
  if (resultado.basesSinAcceso.length) {
    lineas.push('', 'Bases sin acceso:');
    lineas = lineas.concat(resultado.basesSinAcceso.map(function (m) { return '⚠️ ' + m; }));
  }
  if (resultado.estados.revisar > 0) {
    lineas.push('', '⚠️ Hay filas "a revisar": no se remarcan solas. Mirar DIAG_FECHAS ' +
      'columna origen=REVISAR antes de promover.');
  }
  lineas.push('', 'Revisá la hoja DIAG_FECHAS: marcá "elegida = sí" en la columna correcta ' +
    'para cada base/solapa sin decisión previa, antes de correr "Promover fechas elegidas".');

  ui.alert('Detección de columnas de fecha', lineas.join('\n'), ui.ButtonSet.OK);
}

function menuPromoverFechasElegidas_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = promoverFechasElegidas();

  if (!resultado.ok) {
    ui.alert('No se pudo promover', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = resultado.filas.map(function (f) {
    return '✅ ' + f.base_id + '/' + f.solapa + '/' + f.campo_logico + ' ← ' + f.hoja + '!' + f.columna;
  });

  var migracion = resultado.filasMigradas > 0
    ? '\nMigradas del prefijo viejo: ' + resultado.filasMigradas
    : '';

  ui.alert(
    'Fechas promovidas a MAPEO',
    'Nuevas: ' + resultado.escritas + ', actualizadas: ' + resultado.actualizadas + migracion + '\n\n' + lineas.join('\n'),
    ui.ButtonSet.OK
  );
}

/**
 * DOC-3 Parte B — diagnóstico de solapas y tipo de columna. Clasificación de tipos, no
 * aritmética de negocio (mismo criterio que detectarColumnasFecha()): la regla de oro
 * de Marcadores.gs sigue intacta.
 *
 * Motivo concreto (ver docs/Prompts/DOC-3_verificacion_bases_vivas.md): los números de
 * `looker` vienen formateados con punto de miles ("201.273.767"). Si en la hoja son
 * texto en vez de número nativo, una operación SUMA (Paso 3) va a devolver 0 o
 * concatenar, sin lanzar error.
 *
 * Paso 2.7 Parte F — el aviso ⚠ ahora compara contra `MAPEO.tipo_esperado`, no contra
 * una regla fija ("texto o mixto es sospechoso"). Esa regla fija marcaba 35 columnas de
 * las cuales la enorme mayoría eran texto **a propósito** (`figura`, `barrio`,
 * `*_id_cuenta`, …) — un aviso que salta siempre y casi nunca es nada entrena a
 * ignorarlo. Ahora: si `tipo_esperado` está declarado y el tipo real difiere, ⚠ real.
 * Si no está declarado, sale en una sección informativa aparte, sin ⚠ — no bloquea nada,
 * es simplemente lo que todavía no se clasificó (`TIPO_ESPERADO_POR_CAMPO_`, Instalar.gs).
 *
 * Paso 2.6 Parte A — clasificación exhaustiva: toda solapa real del archivo sale con
 * exactamente una etiqueta (`hoja_default ok` / `mapeada` / `sin mapear (informativo)`).
 * Antes faltaba la categoría `mapeada`: una solapa mapeada en MAPEO que no fuera
 * hoja_default no caía en ninguna de las otras dos y desaparecía del reporte sin avisar
 * — así se perdieron `RDV_otros_ministros`, `Directa Mail/IVR/SMS`, `Seguimiento
 * digital`, `Alcance`, `resumen_metricas_dinamico` y `M2 periodo DIGITAL` el 30/07 (AUD-1
 * confirmó que esas solapas sí existen; el bug estaba en el reporte, no en los datos). El
 * reporte cierra con una fila `TOTAL` que compara solapas reales contra filas emitidas —
 * si no coinciden, ⚠.
 */
var HEADERS_DIAG_BASES_SOLAPAS_ = ['base_id', 'solapa', 'estado'];
var HEADERS_DIAG_BASES_TIPOS_ = ['base_id', 'solapa', 'campo_logico', 'columna', 'tipo_esperado', 'tipo', 'muestra', 'alerta'];
var FILAS_MUESTRA_TIPO_ = 20;

function diagnosticarBases() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bases = leerBases();
  var mapa = leerMapeo();

  var filasSolapas = [];
  var filasTipos = [];
  var basesSinAcceso = [];
  var totalSolapasArchivo = 0;
  var totalFilasClasificadas = 0;

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

    var nombresSolapas = libro.getSheets().map(function (h) { return h.getName(); });
    var solapasMapeadas = mapa[baseId] ? Object.keys(mapa[baseId]) : [];
    var filaEncabezado = Number(base.fila_encabezado) || 1;

    // Referencias de config que no corresponden a ninguna solapa real del archivo.
    // No cuentan en el control de totales de abajo, que es sobre solapas reales.
    // hoja_default vacío (Paso 2.10 Parte C, caso m2) es una decisión explícita —
    // "sin fuente activa", no una referencia rota — no se reporta acá como ⚠.
    if (base.hoja_default && nombresSolapas.indexOf(base.hoja_default) === -1) {
      filasSolapas.push({
        base_id: baseId,
        solapa: base.hoja_default,
        estado: '⚠ hoja_default no existe en el archivo — la base se lee vacía o lee otra cosa'
      });
    }
    solapasMapeadas.forEach(function (solapa) {
      if (nombresSolapas.indexOf(solapa) === -1) {
        filasSolapas.push({ base_id: baseId, solapa: solapa, estado: '⚠ mapeada en MAPEO pero no existe en el archivo' });
      }
    });

    // Clasificación exhaustiva: toda solapa real del archivo sale con exactamente
    // una etiqueta. Antes, una solapa mapeada en MAPEO que no fuera hoja_default no
    // caía en ninguna de las dos categorías y desaparecía del reporte en silencio
    // (Paso 2.6 Parte A).
    nombresSolapas.forEach(function (nombre) {
      var estado;
      if (nombre === base.hoja_default) {
        estado = 'hoja_default ok';
      } else if (solapasMapeadas.indexOf(nombre) !== -1) {
        estado = 'mapeada';
      } else {
        estado = 'sin mapear (informativo)';
      }
      filasSolapas.push({ base_id: baseId, solapa: nombre, estado: estado });
      totalFilasClasificadas++;
    });
    totalSolapasArchivo += nombresSolapas.length;

    solapasMapeadas.forEach(function (solapa) {
      var hojaSheet = libro.getSheetByName(solapa);
      if (!hojaSheet) return; // ya reportada como ⚠ arriba, no hay de dónde tipar

      Object.keys(mapa[baseId][solapa]).forEach(function (campoLogico) {
        var fila = mapa[baseId][solapa][campoLogico];
        if (!fila.columna) return;

        var tipo = tipificarColumna_(hojaSheet, fila.columna, filaEncabezado);
        var tipoEsperado = fila.tipo_esperado || '';
        // Paso 2.7 Parte F: ⚠ solo si hay tipo_esperado declarado Y el real difiere.
        // Sin declarar, no se chequea — informativo aparte (menuDiagnosticarBases_).
        var alerta = (tipoEsperado && tipo.tipo !== tipoEsperado) ? '⚠' : '';
        filasTipos.push({
          base_id: baseId,
          solapa: solapa,
          campo_logico: campoLogico,
          columna: fila.columna,
          tipo_esperado: tipoEsperado,
          tipo: tipo.tipo,
          muestra: tipo.muestra,
          alerta: alerta
        });
      });
    });
  });

  // Paso 2.7 Parte E: contar ⚠ y "solapas revisadas" ANTES de agregar la fila TOTAL
  // de abajo — si no, la fila de control se cuenta a sí misma como si fuera una
  // solapa más (por eso el resumen decía "85" con SOLAPAS en 84: la fila TOTAL sumaba
  // uno de más). `advertenciasSolapas` son las ⚠ de config (hoja_default/mapeada que
  // no existen), no la clasificación exhaustiva en sí, que nunca lleva ⚠.
  var advertenciasSolapas = filasSolapas.filter(function (f) { return f.estado.indexOf('⚠') === 0; }).length;

  // Línea de control (Paso 2.6 Parte A): un diagnóstico que puede omitir filas de
  // solapas reales en silencio no sirve para lo que se usa. Compara el total de
  // solapas reales de los archivos contra el total de filas que la clasificación
  // exhaustiva de arriba efectivamente emitió — tienen que coincidir siempre.
  var totalesCoinciden = totalSolapasArchivo === totalFilasClasificadas;
  filasSolapas.push({
    base_id: 'TOTAL',
    solapa: '',
    estado: (totalesCoinciden ? '' : '⚠ ') + 'solapas del archivo: ' + totalSolapasArchivo +
      ' vs. filas emitidas: ' + totalFilasClasificadas
  });

  escribirDiagBases_(obtenerOCrearHojaDiagBases_(ss), filasSolapas, filasTipos);

  return {
    ok: true,
    filasSolapas: filasSolapas,
    filasTipos: filasTipos,
    basesSinAcceso: basesSinAcceso,
    advertenciasSolapas: advertenciasSolapas,
    advertenciasTipos: filasTipos.filter(function (f) { return f.alerta === '⚠'; }).length,
    totalSolapasArchivo: totalSolapasArchivo,
    totalFilasClasificadas: totalFilasClasificadas,
    totalesCoinciden: totalesCoinciden
  };
}

/**
 * Clasifica hasta FILAS_MUESTRA_TIPO_ celdas no vacías de una columna:
 * 'numero' / 'fecha' / 'texto' (todas del mismo tipo) o 'mixto' (tipos mezclados).
 * `columnaLetra` usa la misma convención que MAPEO.columna (letra, no índice).
 */
function tipificarColumna_(hoja, columnaLetra, filaEncabezado) {
  var idx = columnaLetraAIndice_(columnaLetra);
  var filaInicio = filaEncabezado + 1;
  var ultimaFila = hoja.getLastRow();
  if (ultimaFila < filaInicio) return { tipo: 'vacio', muestra: '' };

  var muestraFilas = Math.min(ultimaFila - filaInicio + 1, FILAS_MUESTRA_TIPO_);
  var valores = hoja.getRange(filaInicio, idx + 1, muestraFilas, 1).getValues();

  var nNumero = 0, nFecha = 0, nTexto = 0;
  var muestra = '';

  for (var i = 0; i < valores.length; i++) {
    var v = valores[i][0];
    if (v === '' || v === null || v === undefined) continue;
    if (!muestra) muestra = String(v);

    if (v instanceof Date) nFecha++;
    else if (typeof v === 'number') nNumero++;
    else nTexto++;
  }

  var nNoVacios = nNumero + nFecha + nTexto;
  if (nNoVacios === 0) return { tipo: 'vacio', muestra: '' };

  var tipo;
  if (nNumero === nNoVacios) tipo = 'numero';
  else if (nFecha === nNoVacios) tipo = 'fecha';
  else if (nTexto === nNoVacios) tipo = 'texto';
  else tipo = 'mixto';

  return { tipo: tipo, muestra: muestra };
}

function obtenerOCrearHojaDiagBases_(ss) {
  var hoja = ss.getSheetByName('DIAG_BASES');
  if (!hoja) hoja = ss.insertSheet('DIAG_BASES');
  return hoja;
}

function escribirDiagBases_(hoja, filasSolapas, filasTipos) {
  hoja.clear();

  hoja.getRange(1, 1, 1, HEADERS_DIAG_BASES_SOLAPAS_.length).setValues([HEADERS_DIAG_BASES_SOLAPAS_]);
  var filaSiguiente = 2;
  if (filasSolapas.length) {
    var valoresSolapas = filasSolapas.map(function (f) {
      return HEADERS_DIAG_BASES_SOLAPAS_.map(function (h) { return f[h] !== undefined ? f[h] : ''; });
    });
    hoja.getRange(filaSiguiente, 1, valoresSolapas.length, HEADERS_DIAG_BASES_SOLAPAS_.length).setValues(valoresSolapas);
    filaSiguiente += valoresSolapas.length;
  }

  filaSiguiente += 1; // fila en blanco entre las dos tablas
  hoja.getRange(filaSiguiente, 1, 1, HEADERS_DIAG_BASES_TIPOS_.length).setValues([HEADERS_DIAG_BASES_TIPOS_]);
  filaSiguiente += 1;
  if (filasTipos.length) {
    var valoresTipos = filasTipos.map(function (f) {
      return HEADERS_DIAG_BASES_TIPOS_.map(function (h) { return f[h] !== undefined ? f[h] : ''; });
    });
    hoja.getRange(filaSiguiente, 1, valoresTipos.length, HEADERS_DIAG_BASES_TIPOS_.length).setValues(valoresTipos);
  }

  hoja.setFrozenRows(1);
}

function menuDiagnosticarBases_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = diagnosticarBases();

  var lineas = [
    'Solapas revisadas: ' + resultado.totalFilasClasificadas + ' (⚠ ' + resultado.advertenciasSolapas + ')',
    'Columnas mapeadas tipadas: ' + resultado.filasTipos.length + ' (⚠ difieren de tipo_esperado: ' + resultado.advertenciasTipos + ')',
    (resultado.totalesCoinciden ? '✅' : '⚠') + ' Control de totales — solapas del archivo: ' +
      resultado.totalSolapasArchivo + ' vs. filas emitidas: ' + resultado.totalFilasClasificadas
  ];

  if (resultado.basesSinAcceso.length) {
    lineas.push('', 'Bases sin acceso:');
    lineas = lineas.concat(resultado.basesSinAcceso.map(function (m) { return '⚠️ ' + m; }));
  }

  if (resultado.advertenciasSolapas > 0) {
    lineas.push('', '⚠️ Hay solapas con problema (hoja_default o mapeo apuntando a una solapa que no existe):');
    lineas = lineas.concat(resultado.filasSolapas
      .filter(function (f) { return f.base_id !== 'TOTAL' && f.estado.indexOf('⚠') === 0; })
      .map(function (f) { return '  · ' + f.base_id + '/' + f.solapa + ' — ' + f.estado; }));
  }

  if (resultado.advertenciasTipos > 0) {
    lineas.push('', '⚠️ Columnas mapeadas cuyo tipo real difiere de tipo_esperado (revisar antes de sumarlas en el Paso 3):');
    lineas = lineas.concat(resultado.filasTipos
      .filter(function (f) { return f.alerta === '⚠'; })
      .slice(0, 20)
      .map(function (f) {
        return '  · ' + f.base_id + '/' + f.solapa + '/' + f.campo_logico + ' (col ' + f.columna + ') esperado=' +
          f.tipo_esperado + ', real=' + f.tipo + ', ej. "' + f.muestra + '"';
      }));
  }

  var sinTipoEsperado = resultado.filasTipos.filter(function (f) { return !f.tipo_esperado; }).length;
  if (sinTipoEsperado > 0) {
    lineas.push('', 'ℹ️ ' + sinTipoEsperado + ' columna(s) mapeada(s) sin tipo_esperado declarado (informativo, no se chequean).');
  }

  lineas.push('', 'Detalle completo en la hoja DIAG_BASES.');

  ui.alert('Solapas y tipos de columnas mapeadas', lineas.join('\n'), ui.ButtonSet.OK);
}
