/**
 * Auditoria.gs — AUD-1: auditoría de solapas, `sheet_id` y origen de los
 * nombres. Ver docs/Prompts/AUD-1_auditoria_solapas.md.
 *
 * SOLO LECTURA: no corrige nada, no toca MAPEO, no toca BASES, no modifica
 * Union.gs. `DIAG_BASES` (Fechas.gs, DOC-3) devolvió, para las cuatro bases,
 * solapas que faltan justo donde el motor las tiene cableadas (Union.gs,
 * docs/FECHAS_seleccion.md) — antes de corregir nada hace falta saber de qué
 * archivo salió cada nombre.
 *
 * Expone:
 *   auditarSolapas() -> vuelca el inventario en la hoja AUD_SOLAPAS (la crea
 *     si no existe, la limpia y reescribe en cada corrida) + devuelve el
 *     detalle en el objeto de retorno.
 * Menú: "Auditoría de solapas (AUD-1)".
 */

// Tarea 4 — las 8 filas "Elegidas" de docs/FECHAS_seleccion.md, copiadas acá
// tal cual para poder chequearlas contra el inventario en vivo sin abrir el
// doc a mano. Si ese doc se actualiza, actualizar esta lista también.
var FECHAS_SELECCION_CONGELADAS_ = [
  { base_id: 'rdv', solapa: 'RVD JM-CM - ES' },
  { base_id: 'rdv', solapa: 'RDV_otros_ministros' },
  { base_id: 'digital', solapa: 'Digital' },
  { base_id: 'digital', solapa: 'Directa SMS' },
  { base_id: 'digital', solapa: 'Directa Mail' },
  { base_id: 'digital', solapa: 'Directa IVR' },
  { base_id: 'digital', solapa: 'Seguimiento digital' },
  { base_id: 'looker', solapa: 'resumen_metricas_dinamico' }
];

// Tarea 5 — solapas puntuales a describir (encabezado fila 1 + conteo de
// filas), sin mapear nada.
var SOLAPAS_A_DESCRIBIR_AUD1_ = [
  { base_id: 'digital', solapa: 'RDV JM 2 VECES' },
  { base_id: 'looker', solapa: 'MAIL' },
  { base_id: 'looker', solapa: 'IVR' },
  { base_id: 'looker', solapa: 'SMS' },
  { base_id: 'looker', solapa: 'CC' },
  { base_id: 'looker', solapa: 'DIGITAL' },
  { base_id: 'looker', solapa: 'ALCANCE' },
  { base_id: 'looker', solapa: 'Desglose Alcance' },
  { base_id: 'looker', solapa: 'Audiencias' },
  { base_id: 'm2', solapa: 'Cuentas M2' },
  { base_id: 'm2', solapa: 'Cuentas' }
];

/**
 * Tarea 1 + Tarea 2: por cada base activa, abre por el `sheet_id` que tiene
 * la hoja BASES **en vivo** (no el del seed), compara ese `sheet_id` contra
 * `SEED_BASES_` (Instalar.gs), lee el título real del archivo en Drive
 * (`getName()`) y lista TODAS sus solapas.
 */
function auditarSolapas() {
  var bases = leerBases();
  var seedPorBase = {};
  SEED_BASES_.forEach(function (s) { seedPorBase[s.base_id] = s; });

  var inventario = [];
  var basesSinAcceso = [];
  var solapasVivas = {}; // 'base_id||solapa' -> true, para la Tarea 4

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.activo || !base.sheet_id) return;

    var seed = seedPorBase[baseId];
    var seedSheetId = seed ? seed.sheet_id : '';
    var coincideSeed = !seed
      ? '(sin fila en SEED_BASES_)'
      : (seedSheetId === base.sheet_id ? 'sí' : 'NO — difiere de SEED_BASES_');

    var libro;
    try {
      libro = SpreadsheetApp.openById(base.sheet_id);
    } catch (e) {
      basesSinAcceso.push(baseId + ': ' + e.message);
      return;
    }

    var titulo = libro.getName();
    var nombresSolapas = libro.getSheets().map(function (h) { return h.getName(); });
    var hojaDefaultExiste = nombresSolapas.indexOf(base.hoja_default) !== -1;

    nombresSolapas.forEach(function (nombre) {
      solapasVivas[baseId + '||' + nombre] = true;
      inventario.push({
        base_id: baseId,
        sheet_id_vivo: base.sheet_id,
        sheet_id_coincide_seed: coincideSeed,
        titulo_drive: titulo,
        solapa: nombre,
        es_hoja_default: nombre === base.hoja_default ? 'sí' : ''
      });
    });

    if (!hojaDefaultExiste) {
      inventario.push({
        base_id: baseId,
        sheet_id_vivo: base.sheet_id,
        sheet_id_coincide_seed: coincideSeed,
        titulo_drive: titulo,
        solapa: '⚠ hoja_default "' + base.hoja_default + '" NO existe en este archivo',
        es_hoja_default: ''
      });
    }
  });

  // Tarea 4 — ¿la fila congelada existe en el inventario en vivo? Si no,
  // buscar un candidato parecido dentro de la misma base (informativo, no se
  // promueve ni se corrige nada acá).
  var filasFechas = FECHAS_SELECCION_CONGELADAS_.map(function (f) {
    var existe = !!solapasVivas[f.base_id + '||' + f.solapa];
    var candidato = '';
    if (!existe) {
      var buscado = normalizar_(f.solapa);
      var enMismaBase = inventario
        .filter(function (i) { return i.base_id === f.base_id; })
        .map(function (i) { return i.solapa; });
      candidato = enMismaBase.filter(function (nombre) {
        var n = normalizar_(nombre);
        return n === buscado || n.indexOf(buscado) !== -1 || buscado.indexOf(n) !== -1;
      }).join(' | ');
    }
    return { base_id: f.base_id, solapa_congelada: f.solapa, existe: existe ? 'sí' : 'NO', candidato_parecido: candidato };
  });

  // Tarea 5 — describir encabezado (fila 1) + conteo de filas de solapas
  // puntuales que aparecieron en DIAG_BASES sin estar en el radar del motor.
  var filasHallazgos = SOLAPAS_A_DESCRIBIR_AUD1_.map(function (h) {
    var base = bases[h.base_id];
    if (!base || !base.sheet_id) return { base_id: h.base_id, solapa: h.solapa, estado: 'base sin sheet_id' };

    var libro;
    try {
      libro = SpreadsheetApp.openById(base.sheet_id);
    } catch (e) {
      return { base_id: h.base_id, solapa: h.solapa, estado: 'sin acceso: ' + e.message };
    }

    var hoja = libro.getSheetByName(h.solapa);
    if (!hoja) return { base_id: h.base_id, solapa: h.solapa, estado: 'no existe' };

    var ultimaCol = hoja.getLastColumn();
    var headers = ultimaCol ? hoja.getRange(1, 1, 1, ultimaCol).getValues()[0] : [];
    return {
      base_id: h.base_id,
      solapa: h.solapa,
      estado: 'existe',
      filas_de_datos: Math.max(hoja.getLastRow() - 1, 0),
      encabezado_fila1: headers.join(' | ')
    };
  });

  // Tarea 6 — reusa el tipado que ya hace diagnosticarBases() (Fechas.gs,
  // DOC-3 Parte B); no se reimplementa la clasificación de tipos acá.
  var tiposExistentes = (typeof diagnosticarBases === 'function') ? diagnosticarBases() : null;

  escribirAuditoriaSolapas_(
    obtenerOCrearHojaAuditoriaSolapas_(SpreadsheetApp.getActiveSpreadsheet()),
    inventario, filasFechas, filasHallazgos
  );

  return {
    ok: true,
    inventario: inventario,
    filasFechas: filasFechas,
    filasHallazgos: filasHallazgos,
    tiposExistentes: tiposExistentes,
    basesSinAcceso: basesSinAcceso
  };
}

function obtenerOCrearHojaAuditoriaSolapas_(ss) {
  var hoja = ss.getSheetByName('AUD_SOLAPAS');
  if (!hoja) hoja = ss.insertSheet('AUD_SOLAPAS');
  return hoja;
}

var HEADERS_AUD_INVENTARIO_ = ['base_id', 'sheet_id_vivo', 'sheet_id_coincide_seed', 'titulo_drive', 'solapa', 'es_hoja_default'];
var HEADERS_AUD_FECHAS_ = ['base_id', 'solapa_congelada', 'existe', 'candidato_parecido'];
var HEADERS_AUD_HALLAZGOS_ = ['base_id', 'solapa', 'estado', 'filas_de_datos', 'encabezado_fila1'];

function escribirAuditoriaSolapas_(hoja, inventario, filasFechas, filasHallazgos) {
  hoja.clear();
  var fila = 1;

  fila = escribirBloqueAud_(hoja, fila, 'Tarea 1/2 — inventario de solapas por sheet_id vivo (vs SEED_BASES_)', HEADERS_AUD_INVENTARIO_, inventario);
  fila = escribirBloqueAud_(hoja, fila, 'Tarea 4 — FECHAS_seleccion.md contra el inventario en vivo', HEADERS_AUD_FECHAS_, filasFechas);
  escribirBloqueAud_(hoja, fila, 'Tarea 5 — solapas puntuales a describir', HEADERS_AUD_HALLAZGOS_, filasHallazgos);

  hoja.setFrozenRows(1);
}

function escribirBloqueAud_(hoja, filaInicio, titulo, headers, filas) {
  hoja.getRange(filaInicio, 1).setValue(titulo);
  filaInicio++;
  hoja.getRange(filaInicio, 1, 1, headers.length).setValues([headers]);
  filaInicio++;
  if (filas.length) {
    var valores = filas.map(function (f) {
      return headers.map(function (h) { return f[h] !== undefined ? f[h] : ''; });
    });
    hoja.getRange(filaInicio, 1, valores.length, headers.length).setValues(valores);
    filaInicio += valores.length;
  }
  return filaInicio + 1; // fila en blanco antes del próximo bloque
}

function menuAuditarSolapas_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = auditarSolapas();

  var lineas = [
    'Solapas relevadas: ' + resultado.inventario.length,
    'Bases sin acceso: ' + resultado.basesSinAcceso.length
  ];
  if (resultado.basesSinAcceso.length) {
    lineas.push('');
    lineas = lineas.concat(resultado.basesSinAcceso.map(function (m) { return '⚠ ' + m; }));
  }

  lineas.push('', 'sheet_id vivo (BASES) vs SEED_BASES_:');
  var difierenSeed = {};
  resultado.inventario.forEach(function (f) {
    if (f.sheet_id_coincide_seed !== 'sí') difierenSeed[f.base_id] = f.sheet_id_coincide_seed;
  });
  if (!Object.keys(difierenSeed).length) {
    lineas.push('  (ninguna base difiere — BASES en vivo coincide con SEED_BASES_)');
  } else {
    Object.keys(difierenSeed).forEach(function (baseId) {
      lineas.push('  ⚠ ' + baseId + ' — ' + difierenSeed[baseId]);
    });
  }

  lineas.push('', 'FECHAS_seleccion.md — filas que NO existen en el archivo vivo:');
  var faltantes = resultado.filasFechas.filter(function (f) { return f.existe === 'NO'; });
  if (!faltantes.length) {
    lineas.push('  (ninguna — las 8 filas congeladas existen tal cual)');
  } else {
    faltantes.forEach(function (f) {
      lineas.push('  ⚠ ' + f.base_id + '/' + f.solapa_congelada +
        (f.candidato_parecido ? ' → candidato: ' + f.candidato_parecido : ' (sin candidato parecido)'));
    });
  }

  lineas.push('', 'Detalle completo (título de Drive por base, hallazgos de la Tarea 5) en la hoja AUD_SOLAPAS.');

  ui.alert('Auditoría de solapas (AUD-1)', lineas.join('\n'), ui.ButtonSet.OK);
}

/**
 * Paso 2.7 Parte B — auditoría de solo lectura: `digital/Digital/alcance` (columna E)
 * tipó `mixto` en DIAG_BASES, con ejemplo de fecha ("Thu Aug 29 2024..."). Las otras
 * dos filas de MAPEO que apuntan a la columna E (`dig_fecha_inicio`, `fecha_periodo`)
 * son coherentes entre sí — `alcance` no. Ya existe `digital/Alcance/alc_alcance`
 * mapeado aparte, así que la fila `digital/Digital/alcance` probablemente sobra.
 * NO corrige nada: vuelca el encabezado real de la columna y sus vecinas, y una
 * recomendación — decide el usuario. Ver docs/Prompts/Paso-2.7_destrabar_solapas.md
 * Parte B.
 */
function auditarAlcanceDigital_() {
  var bases = leerBases();
  var base = bases.digital;
  if (!base || !base.sheet_id) {
    return { ok: false, motivo: 'La base "digital" no está configurada (sin sheet_id).' };
  }

  var libro;
  try {
    libro = SpreadsheetApp.openById(base.sheet_id);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir digital: ' + e.message };
  }

  var hoja = libro.getSheetByName('Digital');
  if (!hoja) {
    return { ok: false, motivo: 'No existe la solapa "Digital" en la base digital.' };
  }

  var ultimaCol = hoja.getLastColumn();
  var headers = ultimaCol ? hoja.getRange(1, 1, 1, ultimaCol).getValues()[0] : [];

  var columnasVecinas = ['D', 'E', 'F'].map(function (letra) {
    var idx = columnaLetraAIndice_(letra);
    return { columna: letra, encabezado: headers[idx] !== undefined ? String(headers[idx]) : '' };
  });

  var mapa = leerMapeo();
  var filaAlcance = mapa.digital && mapa.digital['Digital'] && mapa.digital['Digital'].alcance;
  var yaExisteAlcAlcance = !!(mapa.digital && mapa.digital['Alcance'] && mapa.digital['Alcance'].alc_alcance);

  var recomendacion = yaExisteAlcAlcance
    ? '"digital/Alcance/alc_alcance" ya cubre el alcance de digital — la fila "digital/Digital/alcance" ' +
      '(col ' + (filaAlcance ? filaAlcance.columna : '?') + ') probablemente sobra. Confirmá contra el ' +
      'encabezado real de la columna antes de eliminarla.'
    : 'No hay otra fila de MAPEO cubriendo el alcance de digital — confirmá el encabezado real antes de ' +
      'decidir si se corrige la columna o se elimina la fila.';

  return {
    ok: true,
    filaMapeoExiste: !!filaAlcance,
    filaMapeoColumna: filaAlcance ? filaAlcance.columna : '',
    columnasVecinas: columnasVecinas,
    yaExisteAlcAlcance: yaExisteAlcAlcance,
    recomendacion: recomendacion
  };
}

function menuAuditarAlcanceDigital_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = auditarAlcanceDigital_();

  if (!resultado.ok) {
    ui.alert('No se pudo auditar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [
    'MAPEO tiene digital/Digital/alcance → columna ' + (resultado.filaMapeoColumna || '(no encontrada)'),
    '',
    'Encabezado real de las columnas vecinas en digital/Digital:'
  ];
  resultado.columnasVecinas.forEach(function (c) {
    lineas.push('  ' + c.columna + ': "' + c.encabezado + '"');
  });
  lineas.push('', resultado.recomendacion, '', 'No se corrigió nada — esto es un reporte, decide el usuario.');

  ui.alert('Auditoría: digital/Digital/alcance (Paso 2.7 Parte B)', lineas.join('\n'), ui.ButtonSet.OK);
}

/**
 * Paso 2.8 Parte D — auditoría de solo lectura: `m2` devolvió 18 filas de las
 * 29.533 que `SOLAPAS` registra para `M2 periodo DIRECTA`, en modo snapshot, SIN
 * fallar — el modo de falla caro en su forma más pura, porque un marcador río
 * abajo suma esas 18 filas y produce un número plausible. `BASES` declara
 * `fila_encabezado=3` para `m2` (banner de período en las filas 1-2); esta función
 * vuelca las filas 1 a 8 completas y las cifras que `leerFuente()` usa para
 * decidir el corte (`getDataRange()`, la clave resuelta y cuántas filas quedan
 * afuera por ella), para encontrar la línea exacta donde se pierden las filas.
 * NO corrige nada — ni acá ni a mano: si el banner de período resulta ser la
 * causa, la conclusión no es ajustar `fila_encabezado`, es que la solapa no es
 * fuente cruda (ver docs/Prompts/Paso-2.8_cerrar_lectura.md Parte D).
 */
function diagnosticoCorteFilasM2_() {
  var abierto = abrirHoja('m2', 'M2 periodo DIRECTA');
  if (!abierto.ok) { Logger.log('No se pudo abrir: ' + abierto.motivo); return { ok: false, motivo: abierto.motivo }; }

  var hoja = abierto.hoja;
  var filaEncabezado = Number(abierto.base.fila_encabezado) || 1;

  Logger.log('Hoja: ' + hoja.getName() + ' · getLastRow=' + hoja.getLastRow() + ' · getLastColumn=' + hoja.getLastColumn() +
    ' · fila_encabezado (BASES)=' + filaEncabezado);

  var datos = hoja.getDataRange().getValues();
  Logger.log('getDataRange(): ' + datos.length + ' filas × ' + (datos[0] ? datos[0].length : 0) + ' columnas');

  var filasVolcadas = [];
  var filasAVolcar = Math.min(8, datos.length);
  for (var f = 0; f < filasAVolcar; f++) {
    filasVolcadas.push(datos[f]);
    Logger.log('fila ' + (f + 1) + ': ' + JSON.stringify(datos[f]));
  }

  // Paso 2.9 Parte B: "sin clave" ya no se descarta en leerFuente() — el conteo
  // de acá es solo para chequear que el bug quedó atrás (filas_totales debería
  // salir igual a filasTrasEncabezado, no filasTrasEncabezado - sinClave).
  var claveInfo = null;
  var clave = resolverClave_('m2', hoja.getName());
  if (clave.ok) {
    var idxClave = columnaLetraAIndice_(clave.columna);
    var filasCrudas = datos.slice(filaEncabezado);
    var sinClave = 0;
    filasCrudas.forEach(function (fila) {
      var valor = fila[idxClave];
      var vacia = valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');
      if (vacia) sinClave++;
    });
    claveInfo = { columna: clave.columna, filasTrasEncabezado: filasCrudas.length, sinClave: sinClave };
    Logger.log('Clave resuelta: columna ' + clave.columna + ' — de ' + filasCrudas.length +
      ' filas tras fila_encabezado, ' + sinClave + ' tienen la clave vacía (informativo, ya no se descartan).');
  } else {
    Logger.log('Sin clave resoluble para m2/' + hoja.getName() + ': ' + clave.motivo);
  }

  var lectura = leerFuente('m2', null, hoja.getName());
  Logger.log('leerFuente() resultado: ok=' + lectura.ok + ' filas_totales=' + lectura.filas_totales +
    ' filas_vacias=' + lectura.filas_vacias + ' filas_sin_clave=' + lectura.filas_sin_clave);

  var solapas = leerSolapas();
  var registro = solapas.m2 && solapas.m2[hoja.getName()];
  var filasDatosRegistradas = registro ? Number(registro.filas_datos) : null;
  Logger.log('SOLAPAS.filas_datos registrado: ' + (registro ? registro.filas_datos : '(sin fila en SOLAPAS)'));

  return {
    ok: true,
    getLastRow: hoja.getLastRow(),
    getLastColumn: hoja.getLastColumn(),
    filaEncabezado: filaEncabezado,
    filasVolcadas: filasVolcadas,
    claveInfo: claveInfo,
    lectura: lectura,
    filasDatosRegistradas: filasDatosRegistradas
  };
}

function menuDiagnosticarCorteFilasM2_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = diagnosticoCorteFilasM2_();

  if (!resultado.ok) {
    ui.alert('No se pudo diagnosticar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [
    'M2 periodo DIRECTA — getLastRow=' + resultado.getLastRow + ', getLastColumn=' + resultado.getLastColumn +
      ', fila_encabezado(BASES)=' + resultado.filaEncabezado,
    'leerFuente(): filas_totales=' + resultado.lectura.filas_totales +
      ', vacías (informativo)=' + resultado.lectura.filas_vacias +
      ', sin clave (informativo)=' + resultado.lectura.filas_sin_clave,
    'SOLAPAS.filas_datos registrado: ' + (resultado.filasDatosRegistradas !== null ? resultado.filasDatosRegistradas : '(sin fila en SOLAPAS)')
  ];
  if (resultado.claveInfo) {
    lineas.push('Clave (col ' + resultado.claveInfo.columna + '): ' + resultado.claveInfo.filasTrasEncabezado +
      ' filas tras fila_encabezado, ' + resultado.claveInfo.sinClave + ' con clave vacía (ya no se descartan)');
  }
  lineas.push('', 'Filas 1-8 completas volcadas en Ver → Registros de ejecución (Logger).', '', 'No se corrigió nada — es un reporte.');

  ui.alert('Diagnóstico: corte de filas en m2 (Paso 2.8 Parte D)', lineas.join('\n'), ui.ButtonSet.OK);
}

/**
 * Paso 2.8 Parte E — auditoría de solo lectura: de 1297 filas de `digital/Digital`,
 * 337 (26%) se descartan del conteo por no tener `clave` (columna A, campo_logico
 * `clave` en MAPEO). Puede ser correcto (campañas sin `id_cuenta` asignado) o puede
 * ser que la columna clave esté mal elegida — AUD-2 concluyó que
 * `unirDigitalPorCuenta` une por `*_id_cuenta` (columna T, `dig_id_cuenta`), no por
 * `clave`, así que el descarte del conteo y el join de verdad podrían estar usando
 * dos columnas distintas. Vuelca hasta 10 filas descartadas (columnas A y T) para
 * ver si están vacías en A, en T, o en las dos, y si son filas reales o relleno del
 * final de la hoja. NO corrige nada — decide el usuario.
 */
function diagnosticoFilasSinClaveDigital_() {
  var abierto = abrirHoja('digital', 'Digital');
  if (!abierto.ok) { Logger.log('No se pudo abrir: ' + abierto.motivo); return { ok: false, motivo: abierto.motivo }; }

  var hoja = abierto.hoja;
  var filaEncabezado = Number(abierto.base.fila_encabezado) || 1;

  var clave = resolverClave_('digital', hoja.getName());
  var idCuenta = buscarMapeo('digital', hoja.getName(), 'dig_id_cuenta');
  if (!clave.ok) { Logger.log('Sin clave resoluble: ' + clave.motivo); return { ok: false, motivo: clave.motivo }; }
  if (!idCuenta.ok) { Logger.log('Sin dig_id_cuenta resoluble: ' + idCuenta.motivo); return { ok: false, motivo: idCuenta.motivo }; }

  var idxClave = columnaLetraAIndice_(clave.columna);
  var idxIdCuenta = columnaLetraAIndice_(idCuenta.columna);

  function celdaVacia_(valor) {
    return valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');
  }

  var datos = hoja.getDataRange().getValues();
  var totalFilas = datos.length - filaEncabezado;
  var descartadas = [];

  for (var f = filaEncabezado; f < datos.length && descartadas.length < 10; f++) {
    var fila = datos[f];
    if (celdaVacia_(fila[idxClave])) {
      descartadas.push({
        filaHoja: f + 1,
        valorA: fila[idxClave],
        valorT: fila[idxIdCuenta],
        vaciaA: true,
        vaciaT: celdaVacia_(fila[idxIdCuenta])
      });
    }
  }

  Logger.log('digital/Digital — clave: columna ' + clave.columna + ', dig_id_cuenta: columna ' + idCuenta.columna +
    ' · ' + totalFilas + ' filas tras fila_encabezado');
  descartadas.forEach(function (d) {
    Logger.log('fila ' + d.filaHoja + ': A(clave)=' + JSON.stringify(d.valorA) + ' · T(dig_id_cuenta)=' + JSON.stringify(d.valorT) +
      (d.vaciaT ? ' [T también vacía]' : ' [T tiene valor]'));
  });

  var conTVacia = descartadas.filter(function (d) { return d.vaciaT; }).length;
  var conTValor = descartadas.length - conTVacia;
  Logger.log('De las ' + descartadas.length + ' volcadas: ' + conTVacia + ' con T también vacía, ' + conTValor + ' con T con valor (A vacía pero T no).');

  return {
    ok: true,
    columnaClave: clave.columna,
    columnaIdCuenta: idCuenta.columna,
    totalFilas: totalFilas,
    descartadas: descartadas,
    conTVacia: conTVacia,
    conTValor: conTValor
  };
}

function menuDiagnosticarFilasSinClaveDigital_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = diagnosticoFilasSinClaveDigital_();

  if (!resultado.ok) {
    ui.alert('No se pudo diagnosticar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [
    'digital/Digital — clave: col ' + resultado.columnaClave + ' · dig_id_cuenta: col ' + resultado.columnaIdCuenta,
    'Filas volcadas (primeras ' + resultado.descartadas.length + ' sin clave en A):',
    ''
  ];
  resultado.descartadas.forEach(function (d) {
    lineas.push('  fila ' + d.filaHoja + ': A=' + JSON.stringify(d.valorA) + ' · T=' + JSON.stringify(d.valorT) +
      (d.vaciaT ? ' [T también vacía]' : ' [T con valor]'));
  });
  lineas.push('', resultado.conTValor + ' de ' + resultado.descartadas.length + ' tienen T (dig_id_cuenta) CON valor mientras A (clave) está vacía' +
    (resultado.conTValor > 0 ? ' — son dos claves distintas para la misma solapa.' : '.'));
  lineas.push('', 'Detalle completo en Ver → Registros de ejecución. No se corrigió nada — es un reporte.');

  ui.alert('Diagnóstico: filas sin clave en digital (Paso 2.8 Parte E)', lineas.join('\n'), ui.ButtonSet.OK);
}
