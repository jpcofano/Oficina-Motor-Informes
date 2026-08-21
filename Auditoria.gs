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

    // hoja_default vacío (Paso 2.10 Parte C, caso m2) es "sin fuente activa" a
    // propósito, no una referencia rota — no se reporta acá como ⚠.
    if (base.hoja_default && !hojaDefaultExiste) {
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
  var ui = ui_();
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
  var ui = ui_();
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
  var ui = ui_();
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
  var ui = ui_();
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

/**
 * Paso 2.9A — diagnóstico del "colapso por clave" del lector. El fix ya se aplicó
 * en el propio Paso 2.9 (leerFuente() ya no excluye filas por clave vacía ni por
 * fila 100% vacía — Fuentes.gs). Esta función queda como la herramienta de
 * verificación que pedía 2.9A: corre DESPUÉS del fix, así que sirve para
 * CONFIRMAR que quedó resuelto (filas_devueltas ≈ filas_crudas), no para
 * diagnosticar un bug que ya no está en el código.
 *
 * Por cada base con `uso=fuente` en su solapa default (SOLAPAS manda): vuelca
 * `filas_datos` (SOLAPAS), `filas_crudas` (getDataRange() sin encabezado),
 * `filas_devueltas` (leerFuente()) y `valores_distintos_clave` (si la base tiene
 * `clave`/`campana` resoluble en MAPEO — `rdv` no la tiene, y ESO es lo que
 * explicaba su recorte: no un colapso por valor de clave, sino el descarte de
 * filas 100% vacías, ya corregido igual). Escribe en la hoja `DIAG_COLAPSO`, no
 * en un alert — la corrida del 30/07 murió por timeout con el alert como última
 * instrucción y se perdió todo el resultado.
 */
function diagnosticarColapso_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('DIAG_COLAPSO');
  if (!hoja) hoja = ss.insertSheet('DIAG_COLAPSO');
  hoja.clear();

  var headers = ['base_id', 'solapa', 'filas_datos_SOLAPAS', 'filas_crudas', 'filas_devueltas', 'valores_distintos_clave', 'notas'];
  hoja.getRange(1, 1, 1, headers.length).setValues([headers]);
  hoja.setFrozenRows(1);

  var bases = leerBases();
  var ventana = resolverVentana({});
  var filaEscritura = 2;

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.activo || !base.sheet_id) return;

    var abierto = abrirHoja(baseId);
    if (!abierto.ok) {
      hoja.getRange(filaEscritura, 1, 1, headers.length).setValues([[baseId, '', '', '', '', '', abierto.motivo]]);
      filaEscritura++;
      return;
    }

    var nombreHoja = abierto.hoja.getName();
    if (usoSolapa_(baseId, nombreHoja) !== 'fuente') {
      hoja.getRange(filaEscritura, 1, 1, headers.length)
        .setValues([[baseId, nombreHoja, '', '', '', '', 'solapa default no es uso=fuente en SOLAPAS']]);
      filaEscritura++;
      return;
    }

    var solapas = leerSolapas();
    var registroSolapa = solapas[baseId] && solapas[baseId][nombreHoja];
    var filasDatosSolapas = registroSolapa ? registroSolapa.filas_datos : '';

    var filaEncabezado = Number(base.fila_encabezado) || 1;
    var datos = abierto.hoja.getDataRange().getValues();
    var filasCrudas = Math.max(datos.length - filaEncabezado, 0);

    var lectura = leerFuente(baseId, ventana.ok ? ventana : null);
    var filasDevueltas = lectura.ok ? lectura.filas_totales : '(' + lectura.motivo + ')';

    var clave = resolverClave_(baseId, nombreHoja);
    var valoresDistintos = '';
    var notas = '';
    if (clave.ok) {
      var idxClave = columnaLetraAIndice_(clave.columna);
      var vistos = {};
      datos.slice(filaEncabezado).forEach(function (fila) {
        var valor = fila[idxClave];
        if (valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '')) return;
        vistos[String(valor).trim()] = true;
      });
      valoresDistintos = Object.keys(vistos).length;
    } else {
      notas = 'sin clave/campana resoluble en MAPEO (' + clave.motivo + ') — no hay colapso posible por ese mecanismo';
    }

    hoja.getRange(filaEscritura, 1, 1, headers.length)
      .setValues([[baseId, nombreHoja, filasDatosSolapas, filasCrudas, filasDevueltas, valoresDistintos, notas]]);
    filaEscritura++;
  });

  return { ok: true, filas: filaEscritura - 2 };
}

/**
 * Paso 2.9C.2 — SOLAPAS tiene todas sus filas con `origen=manual`: los nombres se
 * tipearon a mano, y un tipeo no se nota hasta que `abrirHoja` falla en plena
 * corrida. Caso puntual que motivó esto: SOLAPAS registra la solapa default de
 * `rdv` como "RVD JM-CM - ES" (con RVD), mientras la misma planilla tiene
 * "RDV CONJUNTO", "RDV_otros_ministros", "RDV_JM_CM_ES" (con RDV) — hay que
 * confirmar contra el archivo vivo, no asumir por parecido.
 * Solo lectura: para cada (base_id, solapa) con `uso=fuente`, abre el archivo y
 * confirma que ese nombre exacto existe entre sus tabs. No corrige nada — decide
 * el usuario cuál es la grafía correcta.
 */
function verificarNombresSolapasFuente_() {
  var solapas = leerSolapas();
  var bases = leerBases();
  var libroCache = {};
  var problemas = [];
  var verificadas = 0;

  Object.keys(solapas).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base || !base.activo || !base.sheet_id) return;

    Object.keys(solapas[baseId]).forEach(function (nombreSolapa) {
      var fila = solapas[baseId][nombreSolapa];
      if (fila.uso !== 'fuente') return;
      verificadas++;

      if (!Object.prototype.hasOwnProperty.call(libroCache, baseId)) {
        try {
          libroCache[baseId] = SpreadsheetApp.openById(base.sheet_id);
        } catch (e) {
          libroCache[baseId] = null;
        }
      }
      var libro = libroCache[baseId];
      if (!libro) {
        problemas.push({ base_id: baseId, solapa: nombreSolapa, motivo: 'no se pudo abrir el archivo' });
        return;
      }
      if (!libro.getSheetByName(nombreSolapa)) {
        problemas.push({ base_id: baseId, solapa: nombreSolapa, motivo: 'no existe ese tab en el archivo vivo' });
      }
    });
  });

  return { ok: true, verificadas: verificadas, problemas: problemas };
}

function menuVerificarNombresSolapasFuente_() {
  var ui = ui_();
  var resultado = verificarNombresSolapasFuente_();

  var lineas = ['Solapas uso=fuente verificadas: ' + resultado.verificadas];
  if (!resultado.problemas.length) {
    lineas.push('', '✅ Todas existen tal cual están registradas en SOLAPAS (incluida la grafía RVD/RDV).');
  } else {
    lineas.push('', '⚠ No coinciden con el archivo vivo — corregir a mano en SOLAPAS:');
    resultado.problemas.forEach(function (p) { lineas.push('  · ' + p.base_id + '/' + p.solapa + ' — ' + p.motivo); });
  }

  ui.alert('Verificación de nombres de solapa (Paso 2.9C.2)', lineas.join('\n'), ui.ButtonSet.OK);
}

function menuDiagnosticarColapso_() {
  var ui = ui_();
  var resultado = diagnosticarColapso_();
  ui.alert(
    'Diagnóstico de colapso (Paso 2.9A)',
    'Volcado en la hoja DIAG_COLAPSO (' + resultado.filas + ' fila(s)). ' +
      'filas_devueltas debería salir ≈ filas_crudas en todas — el fix de Paso 2.9 ya corrió.',
    ui.ButtonSet.OK
  );
}

/* ============ `_31` Parte A — dos censos de sólo lectura ============
 *
 * Los dos existen porque **no había forma de contestar A.1 ni A.3 desde afuera**: `leerFuente`
 * exige `Date` y un JSON no las transporta —medido el 11/08, `formatDate(String,String,String)`—,
 * y `contarAnclasDeLaminas()` cuenta escondidas pero no dice cuáles.
 *
 * **No tocan nada.** Ni planilla, ni plantilla, ni caché. Son instrumentos, no motor.
 */

/**
 * A.1 — los encuentros de `rdv` agrupados por semana de `R-11`, entre dos fechas.
 *
 * `desdeISO`/`hastaISO` en `yyyy-MM-dd`, que es lo único que sobrevive a un JSON.
 *
 * **Reusa `semanaR11_` y no reimplementa el corte viernes–jueves**: el instrumento propio que
 * reproduce lógica del motor y la reproduce peor es el error que este proyecto ya cometió cuatro
 * veces (`CLAUDE.md` §4). El filtro por `STATUS` tampoco se escribe acá — lo aplica `leerFuente`
 * por la lista blanca de `D-21` (`MAPEO.status.valores_incluidos = "Realizada"`).
 */
function diagEncuentrosPorSemana_(desdeISO, hastaISO) {
  var partesDesde = String(desdeISO).split('-');
  var partesHasta = String(hastaISO).split('-');
  var desde = new Date(Number(partesDesde[0]), Number(partesDesde[1]) - 1, Number(partesDesde[2]));
  var hasta = new Date(Number(partesHasta[0]), Number(partesHasta[1]) - 1, Number(partesHasta[2]));

  var ventana = { ok: true, desde: desde, hasta: hasta, origen: 'diag _31 A.1' };
  var lectura = leerFuente('rdv', ventana);
  if (!lectura.ok) return { ok: false, motivo: lectura.motivo };

  var hoja = lectura.hoja;
  var cFigura = buscarMapeo('rdv', hoja, 'figura');
  var cBarrio = buscarMapeo('rdv', hoja, 'barrio');
  var cEvento = buscarMapeo('rdv', hoja, 'evento');
  var cFecha = buscarMapeo('rdv', hoja, 'fecha');
  var cInsc = buscarMapeo('rdv', hoja, 'inscriptos');
  if (!cFigura.ok || !cFecha.ok) return { ok: false, motivo: 'falta MAPEO de figura/fecha para rdv/' + hoja };

  var porSemana = {};
  var descartadas = 0;
  lectura.filas.forEach(function (f) {
    var figura = valorPorColumna_(f, 'rdv', hoja, cFigura.columna);
    if (normalizar_(figura) !== normalizar_('Jorge Macri')) { descartadas++; return; }

    var cruda = valorPorColumna_(f, 'rdv', hoja, cFecha.columna);
    var fecha = (cruda instanceof Date) ? cruda : parsearFechaCelda_(cruda);
    if (!fecha) { descartadas++; return; }

    var sem = semanaR11_(fecha);
    var clave = formatearFecha_(sem.desde);
    if (!porSemana[clave]) {
      porSemana[clave] = { desde: formatearFecha_(sem.desde), hasta: formatearFecha_(sem.hasta), encuentros: [] };
    }
    porSemana[clave].encuentros.push({
      barrio: cBarrio.ok ? valorPorColumna_(f, 'rdv', hoja, cBarrio.columna) : '',
      // `rdv` no tiene columna `tipo` mapeada — la que más se le parece es `evento`, y se
      // devuelve con su nombre real para que nadie la lea como el `tipo` de `REUNIONES`.
      evento: cEvento.ok ? valorPorColumna_(f, 'rdv', hoja, cEvento.columna) : '',
      fecha: formatearFecha_(fecha),
      inscriptos: cInsc.ok ? valorPorColumna_(f, 'rdv', hoja, cInsc.columna) : ''
    });
  });

  var semanas = Object.keys(porSemana).sort().map(function (k) {
    var s = porSemana[k];
    s.cuantos = s.encuentros.length;
    s.encuentros.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    return s;
  });

  return {
    ok: true, hoja: hoja,
    rango: formatearFecha_(desde) + ' → ' + formatearFecha_(hasta),
    filas_leidas: lectura.filas.length,
    descartadas_no_jm_o_sin_fecha: descartadas,
    semanas: semanas
  };
}

/**
 * A.3 — cuáles son las láminas escondidas de una plantilla, por número y por ancla.
 *
 * `contarAnclasDeLaminas()` ya las cuenta y reusa `esLaminaEscondida_`; lo único que le falta es
 * decir cuáles. El ancla sale de las notas del orador, que es donde vive (`_11`).
 */
function diagLaminasEscondidas_(informeId) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) return { ok: false, motivo: 'informe sin plantilla_id: ' + informeId };

  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  var escondidas = [];
  slides.forEach(function (slide, i) {
    if (!esLaminaEscondida_(slide)) return;
    escondidas.push({ orden_plantilla: i + 1, ancla: anclaDeLamina_(slide) || '(sin ancla)' });
  });
  return { ok: true, informe_id: informeId, total_laminas: slides.length, escondidas: escondidas };
}

/**
 * A.2 — los tokens de UNA lámina de la plantilla, por su orden.
 *
 * `tokensSinCablear_` sólo devuelve los que faltan; para censar una lámina hacen falta los dos
 * lados. Reusa `tokensDeSlide_`, que es el mismo recorrido que usa la corrida —baja a tablas y a
 * grupos, que `getShapes()` no ve— así que censa lo mismo que se va a pintar.
 */
function diagTokensDeLamina_(informeId, ordenPlantilla) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) return { ok: false, motivo: 'informe sin plantilla_id: ' + informeId };

  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  var i = Number(ordenPlantilla) - 1;
  if (i < 0 || i >= slides.length) return { ok: false, motivo: 'la plantilla tiene ' + slides.length + ' láminas' };

  var cableados = {};
  leerMarcadores_().forEach(function (m) {
    var suyo = String(m.informe_id || '').trim();
    if (suyo === informeId || suyo === '*') cableados[m.marcador] = m;
  });

  /* ⚠ **No se usa `tokensDeSlide_` y el motivo importa.** Esa función devuelve `[]` para una
   * lámina escondida —guarda del 06/08, correcta para la corrida: lo que no se emite no se
   * pinta—. Pero un **censo** tiene que ver la lámina justamente cuando está escondida, que es
   * el caso de la 5 hoy. Con la guarda, este diagnóstico contestaba `total: 0` y se leía como
   * "la lámina no tiene tokens" en vez de "no la puedo ver".
   *
   * Se replica su recorrido —`piezasDeTextoDeSlide_` + `RE_TOKEN_`, que bajan a tablas y a
   * grupos donde `getShapes()` no llega— sin la guarda, y el retorno dice `escondida` para que
   * quien lea sepa cuál de las dos cosas está mirando. */
  var vistos = {};
  piezasDeTextoDeSlide_(slides[i]).forEach(function (pieza) {
    var m;
    RE_TOKEN_.lastIndex = 0;
    while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) vistos[m[1]] = true;
  });

  var tokens = Object.keys(vistos).sort().map(function (t) {
    var m = cableados[t];
    return m
      ? { token: t, cableado: true, base_id: m.base_id, solapa: m.solapa, campo_logico: m.campo_logico,
          operacion: m.operacion, filtro: m.filtro, periodo_ref: m.periodo_ref }
      : { token: t, cableado: false };
  });

  return {
    ok: true, informe_id: informeId, orden_plantilla: Number(ordenPlantilla),
    escondida: esLaminaEscondida_(slides[i]),
    total: tokens.length,
    con_fila: tokens.filter(function (t) { return t.cableado; }).length,
    sin_fila: tokens.filter(function (t) { return !t.cableado; }).length,
    tokens: tokens
  };
}

/**
 * `_32.1` A.1 — filas de una solapa en una ventana, para reproducir una medición hecha afuera.
 *
 * `desdeISO`/`hastaISO` en `yyyy-MM-dd`: un JSON no transporta `Date`, que es lo que `leerFuente`
 * exige. `aguja` filtra por coincidencia de texto en **cualquier** celda — alcanza para encontrar
 * una cuenta o recortar por nombre de campaña, y evita inventar un mini-lenguaje de filtro que
 * duplicaría el que el motor ya tiene.
 *
 * Sólo lectura. Devuelve los encabezados tal cual los leyó `leerFuente`, que es lo que hace falta
 * para saber **qué columna es cuál** antes de escribir una fila de `MAPEO`.
 */
function diagSolapa_(baseId, solapa, desdeISO, hastaISO, aguja, columnas) {
  var d = String(desdeISO).split('-'), h = String(hastaISO).split('-');
  var ventana = {
    ok: true,
    desde: new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2])),
    hasta: new Date(Number(h[0]), Number(h[1]) - 1, Number(h[2])),
    origen: 'diag _32.1'
  };
  var lectura = leerFuente(baseId, ventana, solapa);
  if (!lectura.ok) return { ok: false, motivo: lectura.motivo };

  var needle = String(aguja || '').toLowerCase();
  var filas = lectura.filas.filter(function (f) {
    if (!needle) return true;
    return Object.keys(f).some(function (k) { return String(f[k]).toLowerCase().indexOf(needle) !== -1; });
  });

  var pedidas = (columnas && columnas.length) ? columnas : null;
  return {
    ok: true,
    hoja: lectura.hoja,
    encabezados: lectura.encabezados,
    filas_en_ventana: lectura.filas.length,
    filas_que_matchean: filas.length,
    filas: filas.slice(0, 20).map(function (f) {
      if (!pedidas) return f;
      var o = {};
      pedidas.forEach(function (c) { o[c] = f[c]; });
      return o;
    })
  };
}

/**
 * `_33` A.2 — el diff entre recortar **por punto** y recortar **por solape**, simulado.
 *
 * **No toca `MAPEO`.** Lee la solapa con una ventana ancha —para traerlas todas— y aplica los dos
 * criterios en memoria sobre `fecha_inicio`/`fecha_fin`, que es lo que `MAPEO` mapearía. Así el
 * impacto se mide **antes** de mover el universo de los marcadores que ya publican.
 *
 * `punto`  = `fecha_inicio` dentro de la ventana (lo que hace hoy `leerFuente`).
 * `solape` = `fecha_inicio <= hasta` **y** `fecha_fin >= desde` (`R-16`).
 */
function diagSolapeVsPunto_(desdeISO, hastaISO, contieneCampana) {
  var d = String(desdeISO).split('-'), h = String(hastaISO).split('-');
  var desde = new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]));
  var hasta = new Date(Number(h[0]), Number(h[1]) - 1, Number(h[2]));

  var ancha = { ok: true, desde: new Date(2020, 0, 1), hasta: new Date(2030, 11, 31), origen: 'diag _33' };
  var lectura = leerFuente('looker', ancha, 'resumen_metricas_dinamico');
  if (!lectura.ok) return { ok: false, motivo: lectura.motivo };

  var needle = String(contieneCampana || '');
  var res = { punto: { cuentas: 0, imp: 0, alc: 0, disc: 0, cont: 0, ids: [] },
              solape: { cuentas: 0, imp: 0, alc: 0, disc: 0, cont: 0, ids: [] } };

  lectura.filas.forEach(function (f) {
    var nom = String(f['nombre_campaña'] || '');
    // `R-23` — el corte JM es por nombre de campaña y es sensible a mayúsculas, igual que `~=`.
    if (needle === 'JM' && nom.indexOf('JM') === -1) return;
    if (needle === '!JM' && nom.indexOf('JM') !== -1) return;

    var ini = parsearFechaCelda_(f.fecha_inicio);
    var fin = parsearFechaCelda_(f.fecha_fin);
    if (!ini) return;

    var esPunto = ini >= desde && ini <= hasta;
    var esSolape = ini <= hasta && (fin ? fin >= desde : ini >= desde);

    ['punto', 'solape'].forEach(function (k) {
      if (k === 'punto' ? !esPunto : !esSolape) return;
      var a = res[k];
      a.cuentas++;
      a.imp += Number(f.digital_impresiones) || 0;
      a.alc += Number(f.meta_alcance) || 0;
      a.disc += Number(f.call_discado) || 0;
      a.cont += Number(f.call_contactados) || 0;
      if (a.ids.length < 30) a.ids.push(String(f.id_cuentas) + ' ' + nom.slice(0, 34));
    });
  });

  res.solo_en_solape = res.solape.ids.filter(function (x) { return res.punto.ids.indexOf(x) === -1; });
  res.ok = true;
  res.ventana = formatearFecha_(desde) + ' → ' + formatearFecha_(hasta);
  res.filas_leidas = lectura.filas.length;
  return res;
}

/**
 * `_36.1` A′.3 — ¿sigue en pie `LAMINAS_CONGELADAS_` después de insertar una lámina?
 *
 * `filtrarRenombresPorLaminasCongeladas_` recibe una `Presentation` y por eso no se puede llamar
 * por API: esto la abre y delega. **Sólo lectura**, igual que la función que envuelve.
 *
 * El testigo existe justamente para este escenario: `LAMINAS_CONGELADAS_` declara la lámina **por
 * número de slide**, y una inserción arriba lo corre. Que devuelva `ok: false` es el testigo
 * haciendo su trabajo, no una falla.
 */
function diagCongeladas_(informeId) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) return { ok: false, motivo: 'informe sin plantilla_id' };

  var presentacion = SlidesApp.openById(informe.plantilla_id);
  var r = filtrarRenombresPorLaminasCongeladas_(informeId, presentacion);

  var declarado = (LAMINAS_CONGELADAS_[informeId] || []).map(function (c) {
    return { slide_declarado: c.slide, testigo: c.testigo };
  });
  var mapa = tokensPorSlide_(presentacion);
  declarado.forEach(function (d) { d.slides_reales_del_testigo = mapa[d.testigo] || []; });

  return { ok: true, informe_id: informeId, declarado: declarado, resultado_del_filtro: r };
}

/**
 * `_37` A.1 — dónde está un token y **qué dice la caja que lo contiene**, literal.
 *
 * El texto de alrededor es el dato: *"3 Campañas"* y *"Subtes, Desalojos, …"* piden operaciones
 * distintas, y el token solo no lo dice. Devuelve `lamina_id` además del orden, porque la
 * identidad de una lámina es su ancla y no su posición (`D-23`).
 */
function diagCajaDeToken_(informeId, token) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) return { ok: false, motivo: 'informe sin plantilla_id: ' + informeId };

  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  var apariciones = [];
  slides.forEach(function (slide, i) {
    piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
      if (String(pieza.texto).indexOf('{{' + token + '}}') === -1) return;
      apariciones.push({
        orden: i + 1,
        lamina_id: anclaDeLamina_(slide) || '(sin ancla)',
        escondida: esLaminaEscondida_(slide),
        texto_caja: String(pieza.texto)
      });
    });
  });
  return { ok: true, informe_id: informeId, token: token, apariciones: apariciones };
}

/**
 * `_37` A.3 — filas, distintos crudos y distintos plegados, sobre una columna de una fuente.
 *
 * **Los tres números salen juntos y ninguno se elige.** La diferencia entre crudos y plegados es
 * la que decide si normalizar tiene consecuencia; con un solo número esa pregunta no se puede
 * contestar. `normalizar_` es el de `Parseo.gs` —pliega case y acentos—, el mismo que usa el
 * matcher, y por eso se reusa en vez de escribir un cuarto normalizador.
 */
function diagDistintos_(baseId, solapa, campoLogico, desdeISO, hastaISO, campoFiltro, contiene) {
  var d = String(desdeISO).split('-'), h = String(hastaISO).split('-');
  var ventana = {
    ok: true,
    desde: new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2])),
    hasta: new Date(Number(h[0]), Number(h[1]) - 1, Number(h[2])),
    origen: 'diag _37'
  };
  var lectura = leerFuente(baseId, ventana, solapa);
  if (!lectura.ok) return { ok: false, motivo: lectura.motivo };

  var col = buscarMapeo(baseId, lectura.hoja, campoLogico);
  if (!col.ok) return { ok: false, motivo: col.motivo };
  var colFiltro = campoFiltro ? buscarMapeo(baseId, lectura.hoja, campoFiltro) : null;
  if (colFiltro && !colFiltro.ok) return { ok: false, motivo: colFiltro.motivo };

  var crudos = {}, plegados = {}, filas = 0;
  lectura.filas.forEach(function (f) {
    if (colFiltro) {
      var v = valorPorColumna_(f, baseId, lectura.hoja, colFiltro.columna);
      if (String(v).indexOf(contiene) === -1) return;
    }
    filas++;
    var valor = valorPorColumna_(f, baseId, lectura.hoja, col.columna);
    var texto = String(valor === undefined || valor === null ? '' : valor);
    if (texto === '') return;
    crudos[texto] = (crudos[texto] || 0) + 1;
    var k = normalizar_(texto);
    (plegados[k] = plegados[k] || []).push(texto);
  });

  var colapsados = Object.keys(plegados)
    .filter(function (k) { return plegados[k].filter(function (v, i, a) { return a.indexOf(v) === i; }).length > 1; })
    .map(function (k) { return k + ' <- ' + plegados[k].filter(function (v, i, a) { return a.indexOf(v) === i; }).join(' | '); });

  return {
    ok: true, hoja: lectura.hoja, columna: col.columna,
    filas_en_ventana: lectura.filas.length,
    filas_que_pasan_el_filtro: filas,
    distintos_crudos: Object.keys(crudos).length,
    distintos_plegados: Object.keys(plegados).length,
    crudos: Object.keys(crudos).sort(),
    colapsados_por_plegado: colapsados
  };
}

/**
 * `_38` A — el censo del enlace digital, ítem por ítem: **qué se ancló, y cuántas filas trae
 * esa cuenta con la ventana de la corrida y sin ninguna ventana.**
 *
 * Las tres causas que el prompt separa —sin cuenta enlazada · con cuenta y sin filas · con
 * filas que la ventana deja afuera— se ven idénticas en el deck, y ninguna de las funciones
 * que ya existen las distingue: `resumenAnclaje_` contesta la primera y no mira filas, y
 * `diagSolapa_` cuenta filas de una solapa pero no sabe de qué encuentro son.
 *
 * **Las dos uniones se piden de verdad, no se deduce que son iguales.** `digital` es
 * `modo_periodo = snapshot` y `leerFuente` ignora la ventana en esa rama, así que la
 * predicción es que los dos conteos coincidan — pero eso es exactamente el tipo de premisa
 * que este proyecto se acostumbró a medir en vez de razonar. La ventana ancha va de 2020 a
 * 2030 igual que en `diagSolapeVsPunto_`, y las dos uniones tienen clave de caché distinta.
 *
 * `mail_tipo` viaja aparte porque los seis marcadores de Mail de la lámina de encuentro
 * filtran `mail_tipo=Convocatoria`: una cuenta puede tener filas de Mail y ninguna que pase
 * ese filtro, y eso no es ninguna de las tres causas del prompt.
 *
 * Sólo lectura: no escribe ninguna hoja, no genera y no ancla a mano.
 */
/**
 * `_39` C — el texto de un **deck ya generado**, por su id de Drive.
 *
 * El control de una corrida es *"qué dice el deck"*, y hasta hoy eso se leía a mano abriéndolo.
 * `diagCajaDeToken_` no sirve: abre la **plantilla** de un `informe_id`, que es justamente el
 * archivo donde los tokens **no** están resueltos.
 *
 * Vale la pena decir por qué esto no cae en la trampa de §4: acá **no se reimplementa nada del
 * motor**. Se lee el archivo de salida y se lo compara contra hechos que el motor no puede
 * saber —el `66345` de `D-06`, el `1412` medido en la base—. Ése es el borde en que medir por
 * fuera es cómo se encuentran los bugs, no cómo se fabrican.
 *
 * `aguja` recorta a las láminas que la contienen; sin ella vuelven todas, truncadas.
 */
function diagTextoDeDeck_(deckId, aguja, tope) {
  var slides = SlidesApp.openById(deckId).getSlides();
  var needle = String(aguja || '').toLowerCase();
  var corte = Number(tope) || 220;

  var laminas = [];
  slides.forEach(function (slide, i) {
    var texto = piezasDeTextoDeSlide_(slide)
      .map(function (p) { return String(p.texto); })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (needle && texto.toLowerCase().indexOf(needle) === -1) return;
    laminas.push('sl' + (i + 1) + ': ' + texto.slice(0, corte));
  });

  return { ok: true, deck_id: deckId, total_laminas: slides.length, laminas: laminas };
}

/**
 * `_39` A.3 — el `Alcance` de una cuenta **leído por la rama por cuenta de verdad**.
 *
 * Llama a `datosDeMarcador_` con una fila de marcador simulada, en vez de sacar el valor de
 * `alc_filas` a mano: la pregunta de A.3 es qué le llegaría a un marcador re-apuntado a
 * `digital/Alcance`, y contestarla salteando el despachador sería medir otra cosa. La fila
 * simulada **no se escribe en ninguna hoja** — vive en esta llamada y muere con ella.
 *
 * `ULTIMO` es la operación que tiene hoy `enc_alcance`; acá no se aplica ninguna, se devuelven
 * los valores crudos de la columna para que se vea **cuántas filas hay** antes de decidirla.
 */
function alcanceDeLaCuenta_(idCuenta, ventana) {
  var filaSimulada = {
    marcador: 'enc_alcance (simulado — diag _39 A.3, no se escribe)',
    informe_id: 'jm', base_id: 'digital', solapa: 'Alcance',
    campo_logico: 'alc_alcance', operacion: 'ULTIMO', filtro: ''
  };
  var datos = datosDeMarcador_(filaSimulada, 'Alcance', ventana, {}, { id_cuenta: idCuenta });
  if (!datos.ok) return 'NO LEE — ' + datos.motivo;

  var valores = datos.filas.map(function (f) { return f[datos.encabezado]; });
  return 'columna "' + datos.encabezado + '" · ' + valores.length + ' fila(s) · valores=' +
    valores.join(',') + ' · origen: ' + datos.origen;
}

function diagEnlaceDigitalDeEncuentros_(periodoRef) {
  var ventana = resolverVentana(periodoRef ? { periodo_ref: periodoRef } : {});
  if (!ventana.ok) return { ok: false, motivo: ventana.motivo };

  var anclaje = anclarEncuentros(ventana);
  if (!anclaje.ok) return { ok: false, motivo: anclaje.motivo };

  var ancha = { ok: true, desde: new Date(2020, 0, 1), hasta: new Date(2030, 11, 31), origen: 'diag _38 sin ventana' };
  var conVentana = unirDigitalPorCuenta(ventana);
  var sinVentana = unirDigitalPorCuenta(ancha);
  if (!conVentana.ok) return { ok: false, motivo: 'union con ventana: ' + conVentana.motivo };
  if (!sinVentana.ok) return { ok: false, motivo: 'union sin ventana: ' + sinVentana.motivo };

  // Columna de fecha de cada solapa de canal, resuelta una vez: adentro del bucle serían
  // cinco `buscarMapeo` por cuenta, y `buscarMapeo` relee `SOLAPAS` y `MAPEO` enteras.
  var columnaFecha = {};
  SOLAPAS_CANAL_DIGITAL_.forEach(function (canal) {
    var c = buscarMapeo(BASE_DIGITAL_, canal.solapa, 'fecha_periodo');
    columnaFecha[canal.solapa] = c.ok ? c.columna : null;
  });
  var columnaTipoMail = buscarMapeo(BASE_DIGITAL_, 'Directa Mail', 'mail_tipo');

  /* **Una línea de texto por solapa, no un objeto anidado**, y no es cosmética: el sobre de la
   * API corta a los 5 niveles (`serializar_`, `Api.gs`) y `resultado → items → item → filas →
   * solapa` ya son cinco. Medido en la primera corrida: las cinco solapas volvieron como
   * `"[profundidad máxima]"`. Aplanar acá cuesta menos que subirle el tope al serializador,
   * que protege a todas las demás llamadas. */
  function censarCuenta(idCuenta) {
    var registro = conVentana.porCuenta[idCuenta];
    var registroAncho = sinVentana.porCuenta[idCuenta];
    if (!registro && !registroAncho) return ['(la cuenta no está en la unión de digital)'];

    return SOLAPAS_CANAL_DIGITAL_.map(function (canal) {
      /* **Un cero de acá tiene dos causas y hay que separarlas.** Si la unión no pudo adjuntar
       * la solapa —`digital/Digital` es `uso = ignorar` por `R-22`, y `buscarMapeo` devuelve
       * `«FALTA:dig_id_cuenta@solapa_no_fuente»`— entonces **ninguna** cuenta tiene filas de ese
       * canal, y eso no dice nada sobre esta cuenta en particular. Publicar `0` a secas es
       * exactamente el número plausible que este proyecto persigue. */
      var diag = conVentana.diagnostico[canal.solapa];
      if (diag && !diag.ok) return canal.solapa + ': la unión NO adjunta esta solapa — ' + diag.motivo;

      var filas = (registro && registro[canal.prefijo + '_filas']) || [];
      var filasAnchas = (registroAncho && registroAncho[canal.prefijo + '_filas']) || [];

      var linea = canal.solapa + ': con_ventana=' + filas.length + ' · sin_ventana=' + filasAnchas.length;

      if (columnaFecha[canal.solapa] && filasAnchas.length) {
        var fechas = filasAnchas.map(function (f) {
          var cruda = valorPorColumna_(f, BASE_DIGITAL_, canal.solapa, columnaFecha[canal.solapa]);
          var fecha = (cruda instanceof Date) ? cruda : parsearFechaCelda_(cruda);
          return fecha ? formatearFecha_(fecha) : '(ilegible: ' + String(cruda) + ')';
        });
        linea += ' · fechas=' + fechas.sort().join(',');
      }

      if (canal.solapa === 'Directa Mail' && columnaTipoMail.ok && filasAnchas.length) {
        var tipos = {};
        filasAnchas.forEach(function (f) {
          var t = String(valorPorColumna_(f, BASE_DIGITAL_, canal.solapa, columnaTipoMail.columna) || '(vacío)');
          tipos[t] = (tipos[t] || 0) + 1;
        });
        linea += ' · mail_tipo=' + Object.keys(tipos).map(function (t) { return t + '×' + tipos[t]; }).join(',');
      }

      return linea;
    });
  }

  function describir(item, balde) {
    var salida = {
      item: item.reunion + (item.etapa ? ' (' + item.etapa + ')' : ''),
      fecha: item.fecha instanceof Date ? formatearFecha_(item.fecha) : String(item.fecha),
      balde: balde,
      id_cuenta: item.idCuenta || '',
      puntaje: Number(item.score || 0).toFixed(2),
      campana_digital: item.candidatoNombre || '',
      tiene_fila_rdv: Boolean(item.filaRdv)
    };
    if (item.motivo) salida.motivo = item.motivo;
    if (item.motivoAmbiguo) salida.motivo = item.motivoAmbiguo;
    if (item.confirmadoAMano) salida.confirmado_a_mano = true;
    if (item.idCuenta) {
      salida.filas = censarCuenta(normalizarIdCuenta_(item.idCuenta));
      salida.alcance_por_la_rama_por_cuenta = alcanceDeLaCuenta_(item.idCuenta, ventana);
    }
    return salida;
  }

  var items = []
    .concat(anclaje.encuentros.map(function (e) { return describir(e, 'encuentros'); }))
    .concat(anclaje.bajaConfianza.map(function (e) { return describir(e, 'bajaConfianza'); }))
    .concat(anclaje.sinLink.map(function (e) { return describir(e, 'sinLink'); }));

  return {
    ok: true,
    ventana: formatearFecha_(ventana.desde) + ' → ' + formatearFecha_(ventana.hasta) + ' (' + ventana.origen + ')',
    periodo_filtrado: anclaje.periodo_id || '(sin filtro: la ventana no vino por periodo_ref)',
    umbral: anclaje.umbral,
    excluidas_por_periodo: anclaje.excluidas_por_periodo,
    cuentas_en_la_union: {
      con_ventana: Object.keys(conVentana.porCuenta).length,
      sin_ventana: Object.keys(sinVentana.porCuenta).length
    },
    // Qué solapas entraron de verdad a la unión, antes de mirar ninguna cuenta.
    solapas_de_la_union: Object.keys(conVentana.diagnostico).map(function (s) {
      var d = conVentana.diagnostico[s];
      return s + ': ' + (d.ok ? 'ok · ' + d.filas_leidas + ' fila(s) leída(s)' : 'NO ENTRA — ' + d.motivo);
    }),
    items: items
  };
}

/* ============================================================================
 * `_40` — censo de una planilla EXTERNA, todavía no registrada en `BASES`.
 *
 * Por qué hace falta un lector propio y por qué NO es reimplementar el motor: los
 * lectores del motor (`leerFuente`, `diagSolapa_`, `datosDeMarcador_`) resuelven la
 * planilla por `base_id` contra `BASES`/`SOLAPAS`/`MAPEO`, y esta planilla **no está
 * registrada** — darla de alta para poder mirarla es exactamente la decisión que este
 * censo tiene que informar, no anticipar. Así que se abre por id, se devuelven las
 * celdas crudas, y **no se decide nada**: ni qué columna es qué campo lógico, ni qué
 * fila entra. Eso lo hace el motor, cuando y si la base se da de alta.
 *
 * Cae del lado bueno del borde de §4: no se reproduce lógica del motor, se compara la
 * salida del motor contra un hecho externo que el motor todavía no puede ver.
 *
 * Y el corolario del 09/08 —convertir antes de mirar el tipo destruye el tipo—: cada
 * celda viaja con su `typeof` **del valor crudo**, y aparte el texto formateado que
 * muestra la planilla. Los dos, nunca uno solo.
 *
 * SÓLO LECTURA. Ninguna de las tres abre nada para escribir.
 * ========================================================================== */

/** Recorta para que un sobre de 44 columnas × N filas no reviente el serializador. */
function celdaDeCenso_(crudo, mostrado) {
  var tipo = (crudo instanceof Date) ? 'Date' : typeof crudo;
  var texto = (crudo instanceof Date) ? formatearFecha_(crudo) : String(crudo);
  if (texto.length > 60) texto = texto.slice(0, 60) + '…';
  var visto = String(mostrado === undefined ? '' : mostrado);
  if (visto.length > 60) visto = visto.slice(0, 60) + '…';
  return texto + ' [' + tipo + ']' + (visto && visto !== texto ? ' · muestra "' + visto + '"' : '');
}

/** `_40` A.1 — qué solapas tiene la planilla y qué forma tiene cada una. */
function diagPlanillaExterna_(idPlanilla) {
  var ss = SpreadsheetApp.openById(idPlanilla);
  return {
    ok: true,
    id: idPlanilla,
    nombre: ss.getName(),
    solapas: ss.getSheets().map(function (h) {
      var filas = h.getLastRow();
      var cols = h.getLastColumn();
      var linea = h.getName() + ': ' + filas + ' fila(s) × ' + cols + ' columna(s)';
      if (filas >= 1 && cols >= 1) {
        var tope = Math.min(cols, 12);
        linea += ' · fila1=' + h.getRange(1, 1, 1, tope).getDisplayValues()[0].join('|');
        if (filas >= 2) linea += ' · fila2=' + h.getRange(2, 1, 1, tope).getDisplayValues()[0].join('|');
      }
      return linea;
    })
  };
}

/**
 * `_40` A.1 y A.5 — la forma de UNA solapa: encabezados, unicidad de la clave, rango de
 * fechas, cuántas filas son futuras, y el censo de valores distintos de una columna.
 *
 * `campoFecha` y `columnaCenso` son nombres de encabezado ya normalizados con la forma de
 * `R-10` (`normalizarValorDeclarado_`), porque dos encabezados de esta planilla traen un
 * salto de línea adentro (`"Clics \ntotales"`) y sin colapsar no se los puede nombrar.
 */
function diagFormaDeSolapaExterna_(idPlanilla, solapa, filaEncabezado, campoClave, campoFecha, columnaCenso) {
  var hoja = SpreadsheetApp.openById(idPlanilla).getSheetByName(solapa);
  if (!hoja) return { ok: false, motivo: 'no existe la solapa "' + solapa + '" en ' + idPlanilla };

  var enc = Number(filaEncabezado) || 1;
  var ultimaFila = hoja.getLastRow();
  var cols = hoja.getLastColumn();
  if (ultimaFila <= enc) return { ok: false, motivo: 'la solapa no tiene filas de datos debajo de la fila ' + enc };

  var encabezados = hoja.getRange(enc, 1, 1, cols).getValues()[0].map(normalizarValorDeclarado_);
  var datos = hoja.getRange(enc + 1, 1, ultimaFila - enc, cols).getValues();

  var iClave = encabezados.indexOf(normalizarValorDeclarado_(campoClave));
  var iFecha = encabezados.indexOf(normalizarValorDeclarado_(campoFecha));
  var iCenso = encabezados.indexOf(normalizarValorDeclarado_(columnaCenso));

  // Una fila se cuenta como fila sólo si la clave tiene algo: las planillas del equipo
  // arrastran filas de relleno abajo y `getLastRow()` las incluye.
  var filasConClave = 0;
  var vistas = {};
  var duplicadas = [];
  var tiposClave = {};
  var fechas = [];
  var ilegibles = [];
  var censo = {};
  var hoy = new Date();

  datos.forEach(function (fila, i) {
    var clave = iClave === -1 ? '' : normalizarValorDeclarado_(fila[iClave]);
    if (!clave) return;
    filasConClave++;
    var t = typeof fila[iClave];
    tiposClave[t] = (tiposClave[t] || 0) + 1;
    if (vistas[clave]) duplicadas.push(clave + ' (filas ' + vistas[clave] + ' y ' + (enc + 1 + i) + ')');
    else vistas[clave] = enc + 1 + i;

    if (iFecha !== -1) {
      var cruda = fila[iFecha];
      var f = (cruda instanceof Date) ? cruda : parsearFechaCelda_(cruda);
      if (f) fechas.push(f.getTime());
      else if (String(cruda) !== '') ilegibles.push(clave + '=' + String(cruda));
    }
    if (iCenso !== -1) {
      var v = normalizarValorDeclarado_(fila[iCenso]) || '(vacío)';
      censo[v] = (censo[v] || 0) + 1;
    }
  });

  var futuras = fechas.filter(function (t) { return t > hoy.getTime(); }).length;
  var ordenadas = fechas.slice().sort(function (a, b) { return a - b; });

  return {
    ok: true,
    solapa: solapa,
    fila_encabezado: enc,
    columnas: cols,
    filas_hasta_getLastRow: ultimaFila - enc,
    filas_con_clave: filasConClave,
    encabezados: encabezados.map(function (h, i) { return (i + 1) + '. ' + (h || '(vacío)'); }),
    clave: campoClave + (iClave === -1 ? ' — NO ESTÁ en el encabezado' : ' (columna ' + (iClave + 1) + ')'),
    tipos_de_la_clave: Object.keys(tiposClave).map(function (t) { return t + '×' + tiposClave[t]; }),
    duplicadas: duplicadas,
    fecha: campoFecha + (iFecha === -1 ? ' — NO ESTÁ en el encabezado' : ' (columna ' + (iFecha + 1) + ')'),
    fechas_legibles: fechas.length,
    fechas_ilegibles: ilegibles.slice(0, 20),
    rango_de_fechas: ordenadas.length
      ? formatearFecha_(new Date(ordenadas[0])) + ' → ' + formatearFecha_(new Date(ordenadas[ordenadas.length - 1]))
      : '(sin fechas legibles)',
    filas_con_fecha_futura: futuras,
    hoy: formatearFecha_(hoy),
    censo_de: columnaCenso + (iCenso === -1 ? ' — NO ESTÁ en el encabezado' : ' (columna ' + (iCenso + 1) + ')'),
    valores_distintos: Object.keys(censo).sort().map(function (v) { return v + ' ×' + censo[v]; })
  };
}

/**
 * `_40` A.2, A.3 y A.4 — las filas de las claves pedidas, celda por celda, crudas.
 *
 * `claves` es un array de `id_cuenta`. La comparación es con la forma de `R-10` de los dos
 * lados; no se usa `normalizarIdCuenta_` porque ésa es la clave de join del motor y acá
 * todavía no hay join que hacer — se está mirando si el id **existe** en una planilla ajena.
 */
function diagFilasDeSolapaExterna_(idPlanilla, solapa, filaEncabezado, campoClave, claves) {
  var hoja = SpreadsheetApp.openById(idPlanilla).getSheetByName(solapa);
  if (!hoja) return { ok: false, motivo: 'no existe la solapa "' + solapa + '" en ' + idPlanilla };

  var enc = Number(filaEncabezado) || 1;
  var ultimaFila = hoja.getLastRow();
  var cols = hoja.getLastColumn();
  var encabezados = hoja.getRange(enc, 1, 1, cols).getValues()[0].map(normalizarValorDeclarado_);
  var rango = hoja.getRange(enc + 1, 1, ultimaFila - enc, cols);
  var datos = rango.getValues();
  var mostrados = rango.getDisplayValues();
  var iClave = encabezados.indexOf(normalizarValorDeclarado_(campoClave));
  if (iClave === -1) return { ok: false, motivo: 'la columna clave "' + campoClave + '" no está en la fila ' + enc };

  /* `_43` — **todas las filas de la clave, no la primera.** Devolver una sola escondía el caso que
   * este censo vino a mirar: `looker/CC` tiene **tres** filas para `3387-JULJDGGC`, y con la
   * primera nada más la pregunta *"¿cuál publica la lámina?"* no se puede ni formular. Es el mismo
   * error de universo de siempre — un número correcto salido de las filas equivocadas. */
  var porClave = {};
  datos.forEach(function (fila, i) {
    var clave = normalizarValorDeclarado_(fila[iClave]);
    if (!clave) return;
    if (!porClave[clave]) porClave[clave] = [];
    porClave[clave].push(i);
  });

  var salida = {};
  (claves || []).forEach(function (claveCruda) {
    var clave = normalizarValorDeclarado_(claveCruda);
    var indices = porClave[clave];
    if (!indices || !indices.length) {
      salida[clave] = ['(sin fila en ' + solapa + ')'];
      return;
    }
    var lineas = [];
    indices.forEach(function (i, n) {
      // El número de fila de la planilla va delante: sin él, "la segunda" es una posición del
      // arreglo y no algo que alguien pueda ir a mirar a mano.
      lineas.push('— fila ' + (enc + 1 + i) + ' (' + (n + 1) + ' de ' + indices.length + ') —');
      encabezados.forEach(function (h, j) {
        lineas.push('   ' + (h || '(col ' + (j + 1) + ')') + ' = ' + celdaDeCenso_(datos[i][j], mostrados[i][j]));
      });
    });
    salida[clave] = lineas;
  });

  return { ok: true, solapa: solapa, fila_encabezado: enc, claves_pedidas: (claves || []).length, filas: salida };
}

/**
 * `_40` A.3 — qué publica el motor HOY para una cuenta, **por token y no por texto de deck**.
 *
 * Por qué no alcanzaba con `diagTextoDeDeck_`: el texto de una lámina llega aplanado por
 * recorrido de formas, y etiqueta y número viven en cajas distintas — aparearlos a ojo es
 * adivinar. Acá se le pregunta al despachador, que es el que decide el valor, así que la
 * respuesta no depende de cómo estén acomodadas las cajas.
 *
 * No es reimplementar el motor: **es el motor**. `resolverMarcadores` es el mismo camino que
 * corre la generación; lo único que agrega esta función es resolver la ventana desde un
 * `periodo_ref` —porque un `Date` no sobrevive al JSON de la API— y filtrar por prefijo.
 *
 * SÓLO LECTURA: `resolverMarcadores` no escribe.
 */
function diagMarcadoresDeCuenta_(informeId, periodoRef, cuentas, prefijo) {
  var ventana = resolverVentana(periodoRef ? { periodo_ref: periodoRef } : {});
  if (!ventana.ok) return { ok: false, motivo: ventana.motivo };

  // Varias cuentas en **una** invocación a propósito: el caché de módulo de `Fuentes.gs` vive
  // por invocación, así que la primera cuenta paga la lectura de las bases y las demás no.
  // Medido: 170 s la primera, el resto en el mismo pedido.
  var lista = Array.isArray(cuentas) ? cuentas : [cuentas];
  var filtro = String(prefijo || '');
  var salida = {};

  lista.forEach(function (idCuenta) {
    var corrida = resolverMarcadores(informeId, { id_cuenta: idCuenta, ventana: ventana });
    if (!corrida.ok) {
      salida[idCuenta] = ['(resolverMarcadores no ok)'];
      return;
    }
    salida[idCuenta] = corrida.resultados
      .filter(function (r) { return !filtro || String(r.marcador).indexOf(filtro) === 0; })
      .map(function (r) {
        return r.marcador + ' = ' + (r.valor_formateado === '' ? '(vacío)' : r.valor_formateado) +
          ' · crudo=' + String(r.valor) + ' [' + (r.valor instanceof Date ? 'Date' : typeof r.valor) + ']' +
          ' · estado=' + r.estado;
      });
  });

  return {
    ok: true,
    informe_id: informeId,
    ventana: formatearFecha_(ventana.desde) + ' → ' + formatearFecha_(ventana.hasta) + ' (' + ventana.origen + ')',
    cuentas: salida
  };
}

/**
 * `2026-08-14_1` A2.3 — de dónde sale cada celda de una solapa externa: fórmula o carga a mano.
 *
 * Por qué no alcanza con mirar el valor: una columna escrita a mano y una derivada de otra
 * solapa se ven **idénticas** en `getValues()`, y la diferencia es la que decide si la solapa
 * puede ser `fuente`. Devuelve **el texto** de la fórmula y no un booleano, por el error del
 * `_40`: `getFormulas()` contestó bien "tiene fórmula" y la inferencia "deriva de la otra hoja
 * del par" era falsa — era un `QUERY()` sobre una tercera. La etiqueta no alcanza.
 *
 * Se muestrean varias filas y no una: el arrastre de una fórmula puede empezar más abajo, y
 * mirar sólo la primera diría "a mano" sobre una columna derivada.
 *
 * SÓLO LECTURA: `getFormulas()` no escribe.
 */
function diagFormulasDeSolapaExterna_(idPlanilla, solapa, filaEncabezado, cuantasFilas) {
  var hoja = SpreadsheetApp.openById(idPlanilla).getSheetByName(solapa);
  if (!hoja) return { ok: false, motivo: 'no existe la solapa "' + solapa + '" en ' + idPlanilla };

  var enc = Number(filaEncabezado) || 1;
  var ultimaFila = hoja.getLastRow();
  var cols = hoja.getLastColumn();
  if (ultimaFila <= enc) return { ok: false, motivo: 'la solapa no tiene filas de datos debajo de la fila ' + enc };

  var muestra = Math.min(Number(cuantasFilas) || 5, ultimaFila - enc);
  var encabezados = hoja.getRange(enc, 1, 1, cols).getValues()[0].map(normalizarValorDeclarado_);
  var formulas = hoja.getRange(enc + 1, 1, muestra, cols).getFormulas();

  var salida = [];
  for (var c = 0; c < cols; c++) {
    var conFormula = 0;
    var texto = '';
    for (var f = 0; f < muestra; f++) {
      if (formulas[f][c]) {
        conFormula++;
        if (!texto) texto = formulas[f][c];
      }
    }
    if (texto.length > 200) texto = texto.slice(0, 200) + '…';
    salida.push(indiceAColumnaLetra_(c) + '. ' + (encabezados[c] || '(vacío)') + ' — ' +
      (conFormula ? conFormula + '/' + muestra + ' con fórmula: ' + texto : 'a mano (0/' + muestra + ')'));
  }

  return { ok: true, solapa: solapa, fila_encabezado: enc, filas_muestreadas: muestra, columnas: salida };
}

/**
 * `2026-08-14_1` A2.6 — buscar por **letra de columna** en vez de por encabezado.
 *
 * `diagFilasDeSolapaExterna_` resuelve la clave por nombre de encabezado, y eso no alcanza en
 * `reuniones/Base_Digital`: la solapa son **ocho bloques lado a lado**, cada uno con su propia
 * columna `ID Cuentas`, así que `indexOf` siempre devuelve la primera y los otros siete quedan
 * inalcanzables. Los bloques además son listas **independientes** —una fila trae dato en uno y
 * vacío en los demás—, con lo cual el número de fila no significa nada entre bloques.
 *
 * Devuelve sólo las columnas pedidas: volcar las 27 por cada coincidencia es ilegible cuando la
 * pregunta es una celda.
 *
 * SÓLO LECTURA.
 */
function diagFilasPorColumnaExterna_(idPlanilla, solapa, filaEncabezado, letraClave, claves, letrasDevueltas) {
  var hoja = SpreadsheetApp.openById(idPlanilla).getSheetByName(solapa);
  if (!hoja) return { ok: false, motivo: 'no existe la solapa "' + solapa + '" en ' + idPlanilla };

  var enc = Number(filaEncabezado) || 1;
  var ultimaFila = hoja.getLastRow();
  var cols = hoja.getLastColumn();
  if (ultimaFila <= enc) return { ok: false, motivo: 'la solapa no tiene filas de datos debajo de la fila ' + enc };

  var iClave = columnaLetraAIndice_(letraClave);
  if (iClave < 0 || iClave >= cols) return { ok: false, motivo: 'la columna ' + letraClave + ' está fuera de la solapa (' + cols + ' columnas)' };

  var encabezados = hoja.getRange(enc, 1, 1, cols).getValues()[0].map(normalizarValorDeclarado_);
  var rango = hoja.getRange(enc + 1, 1, ultimaFila - enc, cols);
  var datos = rango.getValues();
  var mostrados = rango.getDisplayValues();

  var indices = (letrasDevueltas && letrasDevueltas.length)
    ? letrasDevueltas.map(columnaLetraAIndice_)
    : encabezados.map(function (h, i) { return i; });

  var salida = {};
  (claves || []).forEach(function (claveCruda) {
    var clave = normalizarValorDeclarado_(claveCruda);
    var lineas = [];
    datos.forEach(function (fila, i) {
      if (normalizarValorDeclarado_(fila[iClave]) !== clave) return;
      lineas.push('— fila ' + (enc + 1 + i) + ' —');
      indices.forEach(function (j) {
        lineas.push('   ' + indiceAColumnaLetra_(j) + ' ' + (encabezados[j] || '(sin título)') +
          ' = ' + celdaDeCenso_(datos[i][j], mostrados[i][j]));
      });
    });
    salida[clave] = lineas.length ? lineas : ['(sin fila con ' + clave + ' en la columna ' + letraClave + ')'];
  });

  return { ok: true, solapa: solapa, columna_clave: letraClave, filas: salida };
}

/**
 * Censo de solapas de las bases registradas — **sólo lectura**, y **pública a propósito**.
 *
 * **Por qué existe, que es lo único que la justifica.** `diagPlanillaExterna_` y sus hermanas
 * llevan sufijo `_`, así que Apps Script las trata como privadas y **no aparecen en el
 * desplegable «Ejecutar» del editor**; además nadie las llama desde el motor y **devuelven un
 * objeto sin persistir nada**. Corridas desde el editor, su resultado no queda en ningún lado —
 * que es exactamente lo que pasó con el censo del `2026-08-14_1` Parte A2: se midió, y el
 * número sólo existió en un reporte. Esta envoltura manda todo a `Logger`, **que sí es visible
 * en el editor** (`clasp logs` no anda: el proyecto no tiene GCP propio).
 *
 * **No hardcodea ningún id ni ningún nombre**: descubre las bases leyendo `BASES` y cruza contra
 * `SOLAPAS` vivo, así que una base nueva entra sola.
 *
 * Lo que deja por solapa: nombre exacto, filas × columnas, si la registra `SOLAPAS` hoy y con
 * qué `uso`, y las filas 1 y 2 —banda y títulos—, que es de donde sale el motivo medido.
 */
function censarSolapasParaAlta() {
  var bases = leerBases();
  var registradas = leerSolapas();
  var lineas = [];

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.sheet_id) {
      Logger.log('[' + baseId + '] sin sheet_id en BASES — no se censa');
      return;
    }

    var censo = diagPlanillaExterna_(base.sheet_id);
    if (!censo.ok) {
      Logger.log('[' + baseId + '] no se pudo abrir: ' + (censo.motivo || '(sin motivo)'));
      return;
    }

    Logger.log('=== ' + baseId + ' — "' + censo.nombre + '" — ' + censo.solapas.length + ' solapa(s) ===');
    censo.solapas.forEach(function (linea) {
      // `diagPlanillaExterna_` devuelve "nombre: N fila(s) × M columna(s) · fila1=… · fila2=…".
      // El nombre es todo lo anterior al primer ": " — se corta por ahí y no por el último,
      // porque una solapa puede tener ":" adentro y el separador siempre es el primero.
      var corte = linea.indexOf(': ');
      var solapa = corte === -1 ? linea : linea.slice(0, corte);
      var fila = registradas[baseId] && registradas[baseId][solapa];
      var estado = fila ? ('REGISTRADA uso=' + fila.uso) : 'SIN REGISTRAR';
      Logger.log('[' + baseId + '] ' + estado + ' · ' + linea);
      lineas.push(baseId + '\t' + solapa + '\t' + estado);
    });
  });

  Logger.log('--- resumen: ' + lineas.length + ' solapa(s) censada(s) en ' + Object.keys(bases).length + ' base(s) ---');
  return { ok: true, solapas: lineas };
}

/**
 * 15/08/2026 — **la lectura profunda de las solapas sin registrar, antes de clasificarlas.**
 * Sólo lectura.
 *
 * **Por qué hace falta además de la cobertura.** `censarCoberturaDeUniversos()` dijo que `Total`,
 * `Métricas EDVs` y `EDVs | Estados` cubren los 25 `Uno a uno` al 100%. **Cobertura alta dice
 * que están los mismos encuentros, no que traigan algo que sirva** — y las tres iban a `ignorar`
 * sin que nadie las hubiera abierto.
 *
 * **Todo se indexa por letra, nunca por título**, porque `Desglose impresiones` ya mostró que la
 * clave puede ser más de una columna y que los títulos se repiten.
 *
 * Por solapa: banda de la fila 1 y títulos de la fila 2 **textuales y sin normalizar**, si tiene
 * fórmulas **con el texto de la primera** —una que referencie a otra solapa es derivada; una
 * escrita a mano es dato nuevo y necesita dueño (`R-02` excluye los tableros como fuente)—, y la
 * comparación valor a valor contra las solapas `fuente` para los ids que comparten.
 */
var TOPE_IDS_COMPARADOS_ = 2;

function censarSolapasSinRegistrarEnProfundidad() {
  var bases = leerBases();
  var registradas = leerSolapas();

  Object.keys(registradas).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base || !base.sheet_id) return;
    var ss = SpreadsheetApp.openById(base.sheet_id);

    // ── las `fuente` con clave, para comparar contra ellas ───────────────────────────────
    var referencias = [];
    Object.keys(registradas[baseId]).forEach(function (nombre) {
      var reg = registradas[baseId][nombre];
      if (reg.uso !== 'fuente' || !reg.campo_id_cuenta) return;
      var hoja = ss.getSheetByName(nombre);
      if (!hoja) return;
      var mapa = buscarMapeo(baseId, nombre, reg.campo_id_cuenta);
      if (!mapa.ok) return;
      var enc = Number(reg.fila_encabezado) || 1;
      var ultima = hoja.getLastRow();
      if (ultima <= enc) return;
      var cols = hoja.getLastColumn();
      referencias.push({
        nombre: nombre,
        titulos: hoja.getRange(enc, 1, 1, cols).getValues()[0],
        datos: hoja.getRange(enc + 1, 1, ultima - enc, cols).getDisplayValues(),
        iClave: columnaLetraAIndice_(mapa.columna)
      });
    });

    ss.getSheets().forEach(function (hoja) {
      var nombre = hoja.getName();
      if (registradas[baseId][nombre]) return;
      var ultima = hoja.getLastRow();
      var cols = hoja.getLastColumn();
      if (ultima < 1 || cols < 1) return;

      Logger.log('##### ' + baseId + '/' + nombre + ' — ' + ultima + ' filas x ' + cols + ' cols #####');

      // 1 · banda y títulos, por letra y SIN normalizar
      var banda = hoja.getRange(1, 1, 1, cols).getValues()[0];
      var titulos = ultima >= 2 ? hoja.getRange(2, 1, 1, cols).getValues()[0] : [];
      for (var j = 0; j < cols; j++) {
        Logger.log('   ' + indiceAColumnaLetra_(j) + ' | fila1="' + banda[j] + '" | fila2="' +
          (titulos[j] === undefined ? '' : titulos[j]) + '"');
      }

      // 2 · fórmula o carga a mano, con el TEXTO de la primera fórmula que aparezca
      var tope = Math.min(ultima, 200);
      var formulas = hoja.getRange(1, 1, tope, cols).getFormulas();
      var conFormula = 0;
      var ejemplo = '';
      formulas.forEach(function (fila, fi) {
        fila.forEach(function (f, fj) {
          if (!f) return;
          conFormula++;
          if (!ejemplo) ejemplo = indiceAColumnaLetra_(fj) + (fi + 1) + ': ' + f;
        });
      });
      Logger.log('   -> formulas en las primeras ' + tope + ' filas: ' + conFormula +
        (ejemplo ? ' · ejemplo ' + ejemplo : ' · CARGA A MANO'));

      // 3 · comparación contra las `fuente`, por los ids que comparten.
      // La hoja se lee UNA vez: adentro del bucle de columnas eran `cols` × `referencias`
      // lecturas completas — 90 sobre `Métricas EDVs`, que es cómo se mata una corrida por
      // tiempo sin que nada falle.
      var datos = hoja.getRange(1, 1, ultima, cols).getDisplayValues();

      referencias.forEach(function (ref) {
        var idsRef = {};
        ref.datos.forEach(function (f, i) { idsRef[normalizarValorDeclarado_(f[ref.iClave])] = i; });

        for (var jj = 0; jj < cols; jj++) {
          var comunes = [];
          datos.forEach(function (f, i) {
            var v = normalizarValorDeclarado_(f[jj]);
            if (v && idsRef[v] !== undefined && comunes.length < TOPE_IDS_COMPARADOS_) {
              comunes.push({ id: v, filaAca: i, filaRef: idsRef[v] });
            }
          });
          if (comunes.length < TOPE_IDS_COMPARADOS_) continue;

          Logger.log('   ~~ col ' + indiceAColumnaLetra_(jj) + ' es clave contra ' + ref.nombre + ' ~~');
          comunes.forEach(function (c) {
            Logger.log('      id ' + c.id + ' — esta solapa, fila ' + (c.filaAca + 1) + ':');
            Logger.log('         ' + datos[c.filaAca].map(function (v, k) {
              return indiceAColumnaLetra_(k) + '=' + v;
            }).join(' · '));
            Logger.log('      id ' + c.id + ' — ' + ref.nombre + ':');
            Logger.log('         ' + ref.datos[c.filaRef].map(function (v, k) {
              return indiceAColumnaLetra_(k) + '=' + v;
            }).join(' · '));
          });
          break; // una columna clave por referencia alcanza
        }
      });
    });
  });

  return { ok: true };
}

/**
 * `_7` bloque 4 (14/08/2026) — **¿cuántas filas de las solapas SIN REGISTRAR caen dentro del
 * universo de encuentros de las registradas?** Sólo lectura.
 *
 * **Qué destraba.** Es lo último que le falta al alta de `SOLAPAS` del `_4`: el Addendum 2 del
 * `2026-08-14_1` pide medir `Desglose impresiones`, `Métricas digital` y `Digital | Base Post`
 * **contra los 25 `Uno a uno` antes** de mandarlas a `ignorar`.
 *
 * **No hardcodea la solapa, ni el tipo, ni la columna clave**, y las tres cosas importan:
 * - los universos salen de las solapas `fuente` con `campo_id_cuenta` (`D-30`), agrupando por
 *   sus columnas de baja cardinalidad — así aparecen `Uno a uno`, `Recap` y lo que venga;
 * - la cobertura se mide **columna por columna** sobre cada solapa sin registrar, sin asumir
 *   cuál es su clave. **`Desglose impresiones` tiene tres** —`Social`, `Google`,
 *   `Programmatic`— y una función que buscara "la" columna de id mediría un tercio.
 *
 * Reporta sólo las columnas con al menos una coincidencia: una solapa que no comparte ningún id
 * con ningún universo aparece con su cero, que es el dato que el alta necesita.
 */
function censarCoberturaDeUniversos() {
  var bases = leerBases();
  var registradas = leerSolapas();

  Object.keys(registradas).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base || !base.sheet_id) return;
    var ss = SpreadsheetApp.openById(base.sheet_id);

    // ── universos: por cada solapa fuente con `campo_id_cuenta`, los ids de cada valor de sus
    //    columnas de baja cardinalidad ────────────────────────────────────────────────────
    var universos = {}; // "solapa · columna = valor" -> { id: true }
    Object.keys(registradas[baseId]).forEach(function (nombre) {
      var reg = registradas[baseId][nombre];
      if (reg.uso !== 'fuente' || !reg.campo_id_cuenta) return;
      var hoja = ss.getSheetByName(nombre);
      if (!hoja) return;

      var enc = Number(reg.fila_encabezado) || 1;
      var ultima = hoja.getLastRow();
      if (ultima <= enc) return;
      var cols = hoja.getLastColumn();
      var titulos = hoja.getRange(enc, 1, 1, cols).getValues()[0].map(normalizarValorDeclarado_);
      var datos = hoja.getRange(enc + 1, 1, ultima - enc, cols).getDisplayValues();

      var mapa = buscarMapeo(baseId, nombre, reg.campo_id_cuenta);
      if (!mapa.ok) return;
      var iClave = columnaLetraAIndice_(mapa.columna);

      titulos.forEach(function (titulo, j) {
        if (j === iClave || !titulo) return;
        var grupos = {};
        datos.forEach(function (fila) {
          var v = normalizarValorDeclarado_(fila[j]) || '(vacío)';
          if (!grupos[v]) grupos[v] = {};
          grupos[v][normalizarValorDeclarado_(fila[iClave])] = true;
        });
        if (Object.keys(grupos).length > TOPE_CARDINALIDAD_CENSO_) return;
        Object.keys(grupos).forEach(function (v) {
          universos[nombre + ' · ' + titulo + ' = ' + v] = grupos[v];
        });
      });
    });

    var nombresUniverso = Object.keys(universos);
    if (!nombresUniverso.length) return;

    Logger.log('===== ' + baseId + ' — ' + nombresUniverso.length + ' universo(s) de referencia =====');
    nombresUniverso.forEach(function (u) {
      Logger.log('   ' + u + ' → ' + Object.keys(universos[u]).length + ' id(s)');
    });

    // ── cobertura: cada solapa SIN REGISTRAR, columna por columna ────────────────────────
    ss.getSheets().forEach(function (hoja) {
      var nombre = hoja.getName();
      if (registradas[baseId][nombre]) return; // ya registrada: no es de esta pregunta

      var ultima = hoja.getLastRow();
      var cols = hoja.getLastColumn();
      if (ultima < 1 || cols < 1) return;
      // `getDisplayValues()` es de `Range`, no de `Sheet` — la primera versión preguntaba por
      // `hoja.getDisplayValues` y esa guarda daba `false` siempre, así que la función medía
      // cero sin fallar. El mismo modo de falla que viene a medir.
      var datos = hoja.getDataRange().getDisplayValues();
      if (!datos.length) return;

      var lineas = [];
      for (var j = 0; j < cols; j++) {
        var valores = {};
        datos.forEach(function (fila) {
          var v = normalizarValorDeclarado_(fila[j]);
          if (v) valores[v] = true;
        });
        nombresUniverso.forEach(function (u) {
          var universo = universos[u];
          var n = 0;
          Object.keys(valores).forEach(function (v) { if (universo[v]) n++; });
          if (n > 0) {
            lineas.push('     col ' + indiceAColumnaLetra_(j) + ' ∩ [' + u + '] = ' + n +
              ' de ' + Object.keys(universo).length);
          }
        });
      }

      Logger.log('  --- ' + baseId + '/' + nombre + ' (' + ultima + ' filas × ' + cols + ' cols) ---');
      if (!lineas.length) Logger.log('     sin coincidencias con ningún universo');
      lineas.forEach(function (l) { Logger.log(l); });
    });
  });

  return { ok: true };
}

/**
 * `_7` bloque 3 (14/08/2026) — **el diff entre lo que el seed declara y lo que la hoja tiene,
 * SIN aplicar nada.** Sólo lectura, y ése es el punto entero.
 *
 * **Por qué existe.** Hasta `D-32`, la única forma de saber qué iba a cambiar el sembrador era
 * **dejarlo correr y leer el reporte después**. Eso es lo que dejó pasar el caso de
 * `CAMPAÑAS_DESGLOCE_DIGITAL` el 14/08: el cambio se vio cuando ya estaba hecho. Con esto la
 * pregunta *"¿qué me va a pisar?"* se responde **antes**, y sin efectos.
 *
 * **Marca las degradaciones de `uso` aparte**, porque son las únicas que cambian lo que el motor
 * hace: sólo `fuente` se lee. Una fila que pasa de `revisar` a `ignorar` cambia la etiqueta; una
 * que sale de `fuente` **apaga la lectura y no rompe nada** — publica menos, en silencio.
 *
 * Con `D-32` puesto, ninguna de esas degradaciones se aplicaría ya. Esto sirve igual para las
 * otras columnas —`notas`, `fila_encabezado`, `ventana_ref`, `campo_id_cuenta`— que el sembrador
 * **sí** sigue pisando, y para ver el desacuerdo antes de decidir cuál de los dos lados corregir.
 */
function diffSolapasSinAplicar_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SOLAPAS');
  if (!hoja) { Logger.log('no hay hoja SOLAPAS'); return { ok: false, motivo: 'sin hoja SOLAPAS' }; }

  var existentes = leerFilasSolapas_(hoja);
  var columnas = ['uso', 'fila_encabezado', 'ventana_ref', 'campo_id_cuenta', 'notas'];
  var diferencias = [];
  var degradaciones = [];
  var soloEnSeed = [];

  SEED_SOLAPAS_.forEach(function (obj) {
    var clave = obj.base_id + '/' + obj.solapa;
    var existente = existentes[obj.base_id + '||' + obj.solapa];
    if (!existente) { soloEnSeed.push(clave); return; }

    columnas.forEach(function (col) {
      if (!(col in obj)) return;
      var enHoja = existente[col];
      var enSeed = obj[col];
      if (normalizarParaComparar_(enHoja, '') === normalizarParaComparar_(enSeed, '')) return;

      var item = { clave: clave, columna: col, en_hoja: enHoja, en_seed: enSeed,
                   origen: existente.origen };
      diferencias.push(item);
      if (col === 'uso' && esDegradacionDeUso_(enHoja, enSeed)) degradaciones.push(item);
    });
  });

  Logger.log('=== diff seed contra hoja · SOLAPAS · ' + diferencias.length + ' diferencia(s) ===');
  diferencias.forEach(function (d) {
    Logger.log('  ' + d.clave + ' · ' + d.columna + ' · hoja="' + d.en_hoja + '" seed="' + d.en_seed +
      '" · origen=' + d.origen);
  });
  Logger.log('--- ⚠ DEGRADACIONES DE `uso` (saldrian de fuente) (' + degradaciones.length + ') ---');
  degradaciones.forEach(function (d) {
    Logger.log('   ' + d.clave + ': la hoja dice fuente, el seed dice ' + d.en_seed + ' · origen=' + d.origen);
  });
  Logger.log('--- en el seed y no en la hoja (' + soloEnSeed.length + ') ---');
  soloEnSeed.forEach(function (c) { Logger.log('   ' + c); });
  Logger.log('Con D-32 puesto, las degradaciones NO se aplican: el uso de la hoja gana.');

  return { ok: true, diferencias: diferencias, degradaciones: degradaciones, solo_en_seed: soloEnSeed };
}

/**
 * Parte A del `2026-08-14_6` — **qué encabezado hay hoy en la letra que cada fila de `MAPEO`
 * referencia.** Sólo lectura; no escribe ni propone: mide.
 *
 * **Por qué se mide antes de poblar nada.** El día que la columna `encabezado_esperado` se
 * llene con el valor leído, **un mapeo ya corrido queda corrido y bendecido**: el testigo
 * pasaría a certificar el error en vez de detectarlo. Por eso esto corre primero y termina en
 * un gate.
 *
 * **La fila de encabezado la resuelve `resolverFilaEncabezado_`**, que es la del motor —
 * `SOLAPAS.fila_encabezado` con fallback a `BASES`. Reimplementarla acá sería el error del
 * `_39`: dos funciones resolviendo la misma cosa distinto, con el síntoma lejos de la causa.
 *
 * La comparación contra `notas` es **un filtro, no un veredicto**: marca `REVISAR` cuando el
 * encabezado leído no aparece textualmente en las notas de la fila. Muchas notas lo traen
 * entrecomillado porque se venía pidiendo así; las que no, no prueban nada. **Los `REVISAR` se
 * leen a mano.**
 */
function censarEncabezadosDeMapeo() {
  var hojaMapeo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MAPEO');
  if (!hojaMapeo) { Logger.log('no hay hoja MAPEO'); return { ok: false, motivo: 'sin hoja MAPEO' }; }

  var datos = hojaMapeo.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  Logger.log('MAPEO tiene ' + datos.length + ' fila(s) y estas columnas: ' + headers.join(' · '));

  var bases = leerBases();

  // Agrupado ANIDADO por base y por solapa, no por una clave concatenada: `Agenda JM | Post`
  // trae barras y espacios, así que cualquier separador de texto es un bug esperando.
  var porBase = {};
  datos.forEach(function (fila, i) {
    var baseId = String(fila[idx.base_id]);
    var solapa = String(fila[idx.solapa]);
    if (!porBase[baseId]) porBase[baseId] = {};
    if (!porBase[baseId][solapa]) porBase[baseId][solapa] = [];
    porBase[baseId][solapa].push({ fila: i + 2, datos: fila });
  });

  var sinEncabezado = [];
  var aRevisar = [];
  var repetidos = [];

  Object.keys(porBase).forEach(function (baseId) {
    var base = bases[baseId];

    Object.keys(porBase[baseId]).forEach(function (nombreSolapa) {
      if (!base || !base.sheet_id) { Logger.log('[' + baseId + '] sin sheet_id — se saltea ' + nombreSolapa); return; }

      var hoja = SpreadsheetApp.openById(base.sheet_id).getSheetByName(nombreSolapa);
      if (!hoja) { Logger.log('[' + baseId + '/' + nombreSolapa + '] la solapa no existe'); return; }

      var enc = resolverFilaEncabezado_(baseId, nombreSolapa, base.fila_encabezado);
      var cols = hoja.getLastColumn();
      var titulos = hoja.getRange(enc, 1, 1, cols).getValues()[0].map(normalizarValorDeclarado_);

      // Cuántas veces aparece cada título en ESTA solapa. Los repetidos no rompen el diseño
      // —la letra manda— pero la validación futura los leería como error si no se los conoce.
      var vecesPorTitulo = {};
      titulos.forEach(function (t) { if (t) vecesPorTitulo[t] = (vecesPorTitulo[t] || 0) + 1; });

      Logger.log('=== ' + baseId + '/' + nombreSolapa + ' — encabezado en fila ' + enc + ', ' + cols + ' columna(s) ===');

      porBase[baseId][nombreSolapa].forEach(function (item) {
        var f = item.datos;
        var letra = String(f[idx.columna] || '').trim();
        var campo = f[idx.campo_logico];
        var notas = String(f[idx.notas] || '');
        var j = columnaLetraAIndice_(letra);
        var titulo = (j >= 0 && j < titulos.length) ? titulos[j] : '';

        var marcas = [];
        if (!titulo) {
          marcas.push('SIN ENCABEZADO');
          sinEncabezado.push(baseId + '/' + nombreSolapa + '/' + campo + ' (' + letra + ')');
        }
        if (titulo && vecesPorTitulo[titulo] > 1) {
          marcas.push('TITULO x' + vecesPorTitulo[titulo]);
          repetidos.push(baseId + '/' + nombreSolapa + ' · "' + titulo + '" x' + vecesPorTitulo[titulo]);
        }
        if (titulo && notas && notas.indexOf(titulo) === -1) {
          marcas.push('REVISAR: no figura en notas');
          aRevisar.push(baseId + '/' + nombreSolapa + '/' + campo + ' · ' + letra + ' -> "' + titulo + '"');
        }

        Logger.log('  fila ' + item.fila + ' · ' + campo + ' · ' + letra + ' -> "' + titulo + '"' +
          (marcas.length ? '   [' + marcas.join(' | ') + ']' : ''));
      });
    });
  });

  Logger.log('--- SIN ENCABEZADO (' + sinEncabezado.length + ') ---');
  sinEncabezado.forEach(function (s) { Logger.log('   ' + s); });
  Logger.log('--- TITULO REPETIDO EN SU SOLAPA (' + repetidos.length + ') ---');
  repetidos.forEach(function (s) { Logger.log('   ' + s); });
  Logger.log('--- REVISAR: el encabezado leido no figura en las notas (' + aRevisar.length + ') ---');
  aRevisar.forEach(function (s) { Logger.log('   ' + s); });

  return { ok: true, filas: datos.length, sin_encabezado: sinEncabezado, repetidos: repetidos, a_revisar: aRevisar };
}

/**
 * Las filas del **temario** (`REUNIONES`) agrupadas por `tipo`, **leídas crudas** — sólo lectura.
 *
 * **El recorte va declarado, porque es la diferencia con el otro lector.** `leerReuniones_()`
 * filtra por `eje` y por `mostrar`, que es correcto para emitir un informe y **equivocado para
 * un censo**: una fila con `mostrar` vacío existe igual y tiene que contarse. Acá se lee la hoja
 * entera y se agrupa **sólo por `tipo`**, sin filtrar nada.
 *
 * ⚠ **`REUNIONES` no tiene `id_cuenta`, y eso no es un hueco: es el diseño.** Sus columnas son
 * `periodo_id · orden · eje · tipo · nombre · fecha · etapa · mostrar · texto_original · notas`
 * (`HOJAS_CONFIG_.REUNIONES`). El `id_cuenta` de un encuentro **lo resuelve el anclaje**
 * (`anclarEncuentros`, `Union.gs`), no el temario. La primera versión de esta función pedía
 * `idx.id_cuenta` y publicaba `''` en todas las filas — un cero fabricado por el instrumento.
 * Se deja escrito porque el síntoma es indistinguible de una columna vacía de verdad.
 *
 * Esta función **no responde cuál es el universo de un tipo de encuentro en la base**: el
 * temario tiene una fila por línea publicada, no una por encuentro de `reuniones`.
 */
function censarTemarioPorTipo() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
  if (!hoja) { Logger.log('no hay hoja REUNIONES'); return { ok: false, motivo: 'sin hoja REUNIONES' }; }

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });
  if (idx.tipo === undefined) { Logger.log('REUNIONES no tiene columna `tipo`'); return { ok: false, motivo: 'sin columna tipo' }; }

  var porTipo = {};
  datos.forEach(function (fila) {
    var tipo = normalizarValorDeclarado_(fila[idx.tipo]) || '(vacío)';
    if (!porTipo[tipo]) porTipo[tipo] = [];
    porTipo[tipo].push({
      nombre: idx.nombre === undefined ? '' : fila[idx.nombre],
      fecha: idx.fecha === undefined ? '' : fila[idx.fecha],
      mostrar: idx.mostrar === undefined ? '' : fila[idx.mostrar],
      periodo_id: idx.periodo_id === undefined ? '' : fila[idx.periodo_id]
    });
  });

  Object.keys(porTipo).forEach(function (tipo) {
    var filas = porTipo[tipo];
    Logger.log('=== tipo="' + tipo + '" — ' + filas.length + ' fila(s) ===');
    filas.forEach(function (f) {
      Logger.log('   mostrar=' + f.mostrar + ' · periodo_id=' + f.periodo_id + ' · ' + f.fecha + ' · ' + f.nombre);
    });
  });

  return { ok: true, por_tipo: porTipo };
}

/**
 * El universo de encuentros de una solapa de base, agrupado por los valores de una columna
 * — sólo lectura. **Es la que responde "cuántos `Uno a uno` hay", que el temario no responde.**
 *
 * **No hardcodea base ni solapa:** recorre las solapas que `SOLAPAS` declara `fuente` **y con
 * `campo_id_cuenta`** —o sea, las que el motor selecciona por encuentro (`D-30`)— y para cada
 * una agrupa por toda columna de **baja cardinalidad** (hasta `TOPE_CARDINALIDAD_CENSO_`
 * valores distintos), listando los ids de cada grupo. Una dimensión nueva aparece sola.
 *
 * Los ids que devuelve son los que `diagFilasDeSolapaExterna_` toma como `claves`.
 */
var TOPE_CARDINALIDAD_CENSO_ = 15;

function censarUniversosDeSolapasDeEncuentro() {
  var bases = leerBases();
  var registradas = leerSolapas();
  var salida = {};

  Object.keys(registradas).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base || !base.sheet_id) return;

    Object.keys(registradas[baseId]).forEach(function (nombreSolapa) {
      var reg = registradas[baseId][nombreSolapa];
      if (reg.uso !== 'fuente' || !reg.campo_id_cuenta) return;

      var hoja = SpreadsheetApp.openById(base.sheet_id).getSheetByName(nombreSolapa);
      if (!hoja) { Logger.log('[' + baseId + '/' + nombreSolapa + '] no existe la solapa'); return; }

      var enc = Number(reg.fila_encabezado) || 1;
      var ultima = hoja.getLastRow();
      var cols = hoja.getLastColumn();
      if (ultima <= enc) { Logger.log('[' + baseId + '/' + nombreSolapa + '] sin filas debajo de la fila ' + enc); return; }

      var encabezados = hoja.getRange(enc, 1, 1, cols).getValues()[0].map(normalizarValorDeclarado_);
      var datos = hoja.getRange(enc + 1, 1, ultima - enc, cols).getDisplayValues();

      // La clave es la columna que `MAPEO` asocia al `campo_id_cuenta` declarado. Se resuelve
      // por el motor y no por texto: los encabezados de estas solapas no son estables.
      var mapa = buscarMapeo(baseId, nombreSolapa, reg.campo_id_cuenta);
      if (!mapa.ok) { Logger.log('[' + baseId + '/' + nombreSolapa + '] sin clave: ' + mapa.motivo); return; }
      var iClave = columnaLetraAIndice_(mapa.columna);

      Logger.log('=== ' + baseId + '/' + nombreSolapa + ' — ' + datos.length + ' fila(s), clave en ' + mapa.columna + ' ===');

      encabezados.forEach(function (titulo, j) {
        if (j === iClave || !titulo) return;
        var grupos = {};
        datos.forEach(function (fila) {
          var v = normalizarValorDeclarado_(fila[j]) || '(vacío)';
          if (!grupos[v]) grupos[v] = [];
          grupos[v].push(fila[iClave]);
        });
        var valores = Object.keys(grupos);
        if (valores.length > TOPE_CARDINALIDAD_CENSO_) return;

        Logger.log('  — columna "' + titulo + '" (' + valores.length + ' valor/es):');
        valores.forEach(function (v) {
          Logger.log('     "' + v + '" → ' + grupos[v].length + ' fila(s) · ids: ' + grupos[v].join(', '));
        });
        salida[baseId + '/' + nombreSolapa + '/' + titulo] = grupos;
      });
    });
  });

  return { ok: true, universos: salida };
}

/**
 * **Wrapper público de `diffSolapasSinAplicar_`** — el nombre que hay que elegir en el
 * desplegable del editor. Ver la convención de `CLAUDE.md` §2: lo que corre una persona a mano
 * va sin `_` final.
 */
function verDiffDeSolapas() {
  return diffSolapasSinAplicar_();
}

/**
 * Parte A del `2026-08-15_1` — **el testigo del piloto: qué publican hoy los marcadores de
 * `Impresiones`, antes de tocar nada.** Sólo lectura.
 *
 * **Los descubre por definición, no por nombre**: toda fila de `MARCADORES` que comparta
 * `base_id`, `solapa`, `campo_logico` y `operacion` con más de una hermana y sólo difiera en el
 * `filtro`. Hoy eso da los ocho de `looker/DIGITAL/Impresiones/SUMA`; si mañana hay un noveno,
 * entra solo. Hardcodear los ocho nombres habría hecho que el testigo mienta el día que cambie
 * el conjunto — y el piloto se verifica **contra este número**.
 *
 * **El ámbito y la plataforma también se leen del filtro, no del prefijo del token.** `~=JM` es
 * `jm` y `!~=JM` es `gcba`; sin `Plataforma=` en el filtro, la fila es el agregado. Así el
 * descuadre se calcula sin depender de que alguien haya nombrado bien el marcador — que es
 * justamente lo que el piloto viene a dejar de necesitar.
 *
 * ⚠ **Reporta la ventana que usó, con todas las letras.** La Parte C tiene que correr sobre la
 * misma o la comparación no significa nada; si el default cambió en el medio, la ventana
 * reportada va a ser distinta y se va a ver.
 */
function testigoDeImpresiones() {
  /* ⚠ **`resolverMarcadores` devuelve un OBJETO, no un array** — medido en `Generador.gs:1095`:
   * `{ ok, informe_id, resultados: [...], resumen: { total, ok, sin_datos, revisar, error,
   * lecturas_cacheadas } }`. El array está en `.resultados`.
   *
   * La primera versión hacía `res.forEach(...)` y rompía con `res.forEach is not a function`
   * **después de 3m30s de lectura**, o sea con todo el trabajo ya hecho y tirado.
   *
   * **No se envuelve en `Array.isArray(res) ? res : [res]`**: eso convertiría un malentendido
   * sobre la forma del dato en código que anda por casualidad, y taparía el día que el contrato
   * cambie de verdad. Se leyó el `return` y se usa la forma que tiene.
   *
   * ⚠ **COSTO: ~3m30s, contra un límite de 6 minutos por invocación.** No hay ningún bucle con
   * lectura adentro acá — el costo es de `resolverMarcadores`, que resuelve **los 78 marcadores
   * del informe** contra las bases, y de esos sólo se necesitan 8. No se acota porque acotarlo
   * sería o tocar el motor o reimplementar los ocho por fuera, y reproducir lógica que el motor
   * ya tiene es el error que este proyecto persigue.
   *
   * **Consecuencia para la Parte C, que hay que saber antes de correrla:** el 58% del
   * presupuesto ya está gastado. Si la resolución de dimensiones agrega costo, la corrida
   * **no falla: devuelve menos**. Si se acerca al límite, la salida es correrlo por informe o
   * con la ventana fijada, no confiar en que entre. */
  var res = resolverMarcadores('jm');
  if (!res || !res.ok || !res.resultados) {
    Logger.log('resolverMarcadores no devolvió resultados: ' + JSON.stringify(res));
    return { ok: false, motivo: 'sin resultados' };
  }
  Logger.log('resolverMarcadores(jm) → ' + res.resumen.total + ' marcadores · ok=' + res.resumen.ok +
    ' · sin_datos=' + res.resumen.sin_datos + ' · revisar=' + res.resumen.revisar +
    ' · error=' + res.resumen.error);

  // `leerMarcadores_()` hace falta: `resultados` trae `marcador`, `base_id` y `operacion`, pero
  // NO `solapa`, `campo_logico` ni `filtro`, que son con los que se agrupa por definición.
  var todos = leerMarcadores_();
  var testigo = [];

  // Agrupar por definición para descubrir el conjunto sin nombrarlo.
  var porDef = {};
  todos.forEach(function (m) {
    var k = [m.base_id, m.solapa, m.campo_logico, m.operacion].join(' | ');
    if (!porDef[k]) porDef[k] = [];
    porDef[k].push(m);
  });

  var valorDe = {};
  var trazaDe = {};
  var estadoDe = {};
  res.resultados.forEach(function (r) {
    valorDe[r.marcador] = r.valor;
    trazaDe[r.marcador] = r.traza || '';
    estadoDe[r.marcador] = r.estado || '';
  });

  /* **Se agrupa por LA MEDIDA — base, solapa, `campo_logico`, `operacion`— y nada más.**
   *
   * La primera versión exigía además que **todos los filtros difirieran**, y con eso el
   * instrumento **dejó de ver los ocho justo después de migrarlos**: ya migrados comparten
   * `filtro = "estado=Activa"` y difieren en `dimensiones`, así que el grupo se descartaba
   * entero. El testigo devolvió 14 marcadores en vez de 22 y el grupo de `Impresiones`
   * desapareció — sin que nada fallara.
   *
   * ⚠ **La lección, que ya va tercera en dos días: el testigo no puede depender de dónde vive
   * el corte, porque eso es justamente lo que la migración cambia.** Es la misma clase de error
   * que el gate de `D-32` probado contra el caso que lo motivaba y no contra el que lo rompía:
   * el criterio se escribió mirando el estado de HOY —el corte en `filtro`— y el instrumento
   * existía para medir el cambio a MAÑANA.
   *
   * Con el criterio por medida, el instrumento ve los tres estados: corte en `filtro` (antes),
   * en `dimensiones` (después), y repartido entre los dos (durante). */
  Object.keys(porDef).forEach(function (k) {
    var grupo = porDef[k];
    if (grupo.length < 2) return;

    Logger.log('===== ' + k + ' — ' + grupo.length + ' marcadores =====');

    /* **El descuadre sólo se calcula donde hay una partición EXHAUSTIVA, y hoy hay una sola:
     * `plataforma`, exhaustiva por `R-24` — `programmatic` es "todo lo que no es Meta ni Google
     * ads", así que las tres partes cubren el total por construcción.**
     *
     * La primera versión lo calculaba sobre todo grupo, y daba dos clases de basura:
     *
     *   1. **Sobre los grupos de mail**, donde `mail_envios` (jm), `gcba_mail_envios` (gcba) y
     *      `m2_mails_enviados` (`tipo_envio=m2`) son **tres cortes distintos de la misma
     *      medida** y no un total con sus partes. El testigo tomaba al `m2_*` por total y
     *      publicaba "suma de partes = 0". **No hay nada que cuadre ahí.**
     *   2. **Sobre `PCT` y `RATIO`**, donde además de romperse la conversión el cálculo no
     *      significa nada: **un ratio no se suma.** `m2_or` = 28,63… salía como
     *      28.637.147.786.083.950.
     *
     * Un testigo archivado con seis "NO CUADRA" falsos es peor que no tenerlo: el día que
     * aparezca uno real nadie lo va a mirar. */
    // El corte de una fila puede estar en `filtro`, en `dimensiones`, o repartido. Se lee de los
    // dos lados **siempre**, que es lo que hace al testigo indiferente al momento de la migración.
    var corteDe = function (m) {
      return String(m.filtro || '') + ' ' + String(m.dimensiones || '');
    };
    var esRatio = String(grupo[0].operacion || '').toUpperCase().indexOf('PCT') !== -1 ||
                  String(grupo[0].operacion || '').toUpperCase().indexOf('RATIO') !== -1;
    var hayParticionPlataforma = grupo.some(function (m) {
      var c = corteDe(m);
      return c.indexOf('Plataforma') !== -1 || c.indexOf('plataforma=') !== -1;
    });
    var calculaDescuadre = !esRatio && hayParticionPlataforma;

    var suma = { jm: 0, gcba: 0 };
    var total = { jm: null, gcba: null };

    grupo.forEach(function (m) {
      var f = corteDe(m);
      var ambito = (f.indexOf('!~=JM') !== -1 || f.indexOf('!=jorge.macri') !== -1 ||
                    f.indexOf('ambito=gcba') !== -1) ? 'gcba' : 'jm';
      var otroEje = f.indexOf('mail_tipo') !== -1 || f.indexOf('tipo_envio=') !== -1;
      var esAgregado = f.indexOf('Plataforma') === -1 && f.indexOf('plataforma=') === -1;
      var v = valorDe[m.marcador];

      Logger.log('  ' + m.marcador + ' = ' + v + '   [ambito=' + ambito +
        (otroEje ? ' · tipo_envio' : (esAgregado ? ' · AGREGADO' : ' · con plataforma')) +
        ' · estado=' + (estadoDe[m.marcador] || '?') + ']');
      Logger.log('      filtro:      ' + (m.filtro || '(vacío)'));
      Logger.log('      dimensiones: ' + (m.dimensiones || '(vacío)'));
      if (trazaDe[m.marcador]) Logger.log('      traza:  ' + trazaDe[m.marcador]);

      if (!calculaDescuadre || otroEje) return;
      var n = Number(String(v).replace(/\./g, '').replace(',', '.'));
      if (isNaN(n)) { Logger.log('      ⚠ no numérico — no entra al descuadre'); return; }
      if (esAgregado) total[ambito] = n; else suma[ambito] += n;
    });

    if (!calculaDescuadre) {
      Logger.log('  -- sin descuadre: ' + (esRatio
        ? 'la operación es ' + grupo[0].operacion + ' y un ratio no se suma'
        : 'este grupo no tiene partición exhaustiva (sólo `plataforma` lo es, por R-24)'));
    } else ['jm', 'gcba'].forEach(function (a) {
      if (total[a] === null) return;
      var d = total[a] - suma[a];
      Logger.log('  -- descuadre ' + a + ': total=' + total[a] + ' · suma de partes=' + suma[a] +
        ' · diferencia=' + d + (d === 0 ? '  ✔ CUADRA' : '  ⚠ NO CUADRA'));
    });

    /* El testigo lleva **la traza al lado del valor**, y no es adorno: `looker` sigue recibiendo
     * datos de una ventana ya cerrada — medido el 15/08, +138.427 impresiones en 1h45 sobre la
     * misma ventana—. **El valor absoluto no distingue "la migración rompió algo" de "entraron
     * filas nuevas".** Las cuentas de filas de la traza sí. */
    Logger.log('  == TESTIGO (copiar tal cual: marcador \t valor \t estado \t dimensiones \t traza) ==');
    grupo.forEach(function (m) {
      var t = (trazaDe[m.marcador] || '').replace(/\s+/g, ' ');
      Logger.log('  ' + m.marcador + '	' + valorDe[m.marcador] + '	' +
        (estadoDe[m.marcador] || '') + '	' + (m.dimensiones || '-') + '	' + t);
      testigo.push({ marcador: m.marcador, valor: valorDe[m.marcador],
                     estado: estadoDe[m.marcador], dimensiones: m.dimensiones || '',
                     filtro: m.filtro || '', traza: t });
    });
  });

  // Los que el motor no pudo resolver. No son del piloto, pero un `error=10` sobre 78 sin
  // nombres es un número que nadie puede accionar.
  var enError = res.resultados.filter(function (r) { return r.estado === 'error'; });
  Logger.log('== MARCADORES EN ERROR (' + enError.length + ') ==');
  enError.forEach(function (r) {
    Logger.log('  ' + r.marcador + ' [' + r.base_id + '] ' + (r.traza || '(sin traza)'));
  });

  Logger.log('== fin del testigo: ' + testigo.length + ' marcador(es) ==');
  return { ok: true, testigo: testigo };
}

/**
 * `D-31` de punta a punta — **barre TODO `MAPEO` y dice si hoy hay algún desalineamiento entre
 * el encabezado declarado y el que la hoja tiene en esa letra.**
 *
 * ⚠ **Wrapper público, sin `_` final**, porque la corre una persona desde el desplegable del
 * editor (`CLAUDE.md` §2) y devuelve por `Logger.log`, no sólo por `return`: el editor no
 * muestra el valor de retorno.
 *
 * **Es de SÓLO LECTURA.** No escribe en `MAPEO`, no corrige ninguna letra y no toca ninguna
 * base. Si encuentra desalineamientos los **reporta y para ahí**: corregirlos es otro prompt y
 * probablemente otra decisión.
 *
 * **Por qué existe además del aviso en la corrida.** El aviso de `encabezadoEnColumna_` sólo se
 * dispara sobre las columnas que **esa** corrida efectivamente leyó, así que un desalineamiento
 * en una solapa que ningún marcador toca **no aparecería nunca**. Esto las mira todas, y sin
 * generar un informe: es la forma barata de saber el estado de hoy.
 *
 * **Qué NO detecta, que es el límite de `D-31` y no un defecto de acá:** compara **rótulos, no
 * contenido**. En las solapas con los encabezados corridos **en origen** —`C-09`,
 * `RDV_otros_ministros`— el rótulo va a coincidir y no va a decir nada. Y al revés: un rótulo
 * que **no** coincide puede ser un corrimiento de origen y no un mapeo mal apuntado. **Antes de
 * llamar hallazgo a una fila de la tabla de abajo, descartar `C-09`.**
 */
function verificarEncabezadosDeMapeo() {
  var mapa = leerMapeo();
  /* ⚠ **TODOS los contadores cuentan FILAS de `MAPEO`, y eso es el arreglo del 16/08.**
   *
   * La primera versión contaba `revisadas` **por columna** y los otros dos **por fila**, con las
   * unidades mezcladas y sin decirlo. Contra la hoja viva dio `114 + 2 + 35 = 151` sobre **161
   * filas**: **diez filas que no aparecían en ninguna categoría.**
   *
   * **Las diez estaban comparadas** —son el segundo (y tercer) `campo_logico` de nueve grupos
   * donde una misma columna física está mapeada dos veces, como `digital/Directa IVR/D` bajo
   * `ivr_inicio` y bajo `fecha_periodo`—, **así que no había un hueco de cobertura: había un
   * conteo que mentía.** Pero eso no se podía saber leyendo el reporte, que es exactamente el
   * problema: **una guarda que no dice qué dejó afuera tiene un punto ciego del tamaño de ese
   * resto**, y el modo de falla es el de siempre — no avisa nada y parece verde.
   *
   * Se informan **las dos unidades por separado y rotuladas**, porque las dos importan y son
   * distintas: la comparación se hace **por columna** (una letra, un encabezado real), y la
   * cobertura se mide **por fila**, que es lo que `MAPEO` tiene. */
  var filasRevisadas = 0;
  var columnasComparadas = 0;
  var filasSinTestigo = 0;
  var filasNoFuente = 0;
  var filasSinColumna = [];
  var filasIlegibles = 0;
  var ilegibles = [];
  var desalineadas = [];
  var totalFilas = 0;

  Object.keys(mapa).sort().forEach(function (baseId) {
    Object.keys(mapa[baseId]).sort().forEach(function (solapa) {
      var campos = Object.keys(mapa[baseId][solapa]);
      totalFilas += campos.length;

      /* Una solapa que no es `fuente` no se lee nunca, así que compararla sería inventar
       * trabajo — y si es `ignorar`, además está prohibido tocarla (`CLAUDE.md` §2). */
      if (usoSolapa_(baseId, solapa) !== 'fuente') {
        filasNoFuente += campos.length;
        return;
      }

      // Se agrupa por LETRA y no por `campo_logico`, igual que el comparador, porque hay grupos
      // donde varios campos apuntan a la misma columna con testigos distintos.
      var porLetra = {};
      campos.forEach(function (campoLogico) {
        var fila = mapa[baseId][solapa][campoLogico];
        var letra = String(fila.columna || '').trim().toUpperCase();
        if (!letra) {
          // Una fila de `MAPEO` sin letra no se puede comparar — y **no se descarta en
          // silencio**, que es lo que hacía antes. Hoy son cero; el día que aparezca una, sale
          // nombrada en vez de desaparecer del cuadre.
          filasSinColumna.push(baseId + '/' + solapa + '/' + campoLogico);
          return;
        }
        if (!porLetra[letra]) porLetra[letra] = { esperados: [], campos: [] };
        porLetra[letra].campos.push(campoLogico);
        if (fila.encabezado) porLetra[letra].esperados.push(fila.encabezado);
      });

      Object.keys(porLetra).forEach(function (letra) {
        var grupo = porLetra[letra];
        if (!grupo.esperados.length) { filasSinTestigo += grupo.campos.length; return; }

        var real = encabezadoEnColumna_(baseId, solapa, letra);
        if (real === undefined) {
          // La solapa no se pudo abrir. **No es un desalineamiento** y mezclarlo con los otros
          // sería reportar un problema de acceso como si fuera de mapeo.
          ilegibles.push(baseId + '/' + solapa);
          filasIlegibles += grupo.campos.length;
          return;
        }
        columnasComparadas++;
        filasRevisadas += grupo.campos.length;
        var d = desalineamientoDeEncabezado_(grupo.esperados, real);
        if (d) {
          desalineadas.push({
            base_id: baseId, solapa: solapa, columna: letra,
            campos: grupo.campos.join(', '),
            esperados: d.esperados.join('" o "'), real: d.real
          });
        }
      });
    });
  });

  /* ═══ EL CUADRE, y es lo primero que se imprime ═══════════════════════════════════════════
   * Toda fila de `MAPEO` cae en exactamente uno de estos cinco baldes. **Si no suman el total,
   * el reporte lo dice y devuelve `ok: false`**: un resto sin explicar es un punto ciego del
   * tamaño de ese resto, y sin esta guarda se ve igual que un verde. */
  var repartidas = filasRevisadas + filasSinTestigo + filasNoFuente +
                   filasSinColumna.length + filasIlegibles;

  Logger.log('== D-31 · testigo de encabezados, sólo lectura ==');
  Logger.log('  CUADRE · ' + totalFilas + ' fila(s) de MAPEO = ' +
    filasRevisadas + ' comparadas + ' +
    filasSinTestigo + ' sin testigo + ' +
    filasNoFuente + ' en solapas que no son fuente + ' +
    filasSinColumna.length + ' sin letra + ' +
    filasIlegibles + ' en solapas ilegibles');

  if (repartidas !== totalFilas) {
    Logger.log('  ❌ EL CUADRE NO CIERRA: ' + repartidas + ' repartidas contra ' + totalFilas +
      ' filas · **faltan ' + (totalFilas - repartidas) + '**. Este reporte NO se puede leer ' +
      'como cobertura: hay filas que no entraron en ninguna categoría y no se sabe cuáles.');
  }

  Logger.log('  columnas comparadas: ' + columnasComparadas + ' (las ' + filasRevisadas +
    ' filas comparadas se agrupan en esa cantidad de columnas: varios `campo_logico` pueden ' +
    'apuntar a la misma letra) · desalineadas: ' + desalineadas.length);

  if (filasSinColumna.length) {
    Logger.log('  ⚠ ' + filasSinColumna.length + ' fila(s) de MAPEO **sin letra de columna**, ' +
      'imposibles de comparar: ' + filasSinColumna.join(' · '));
  }

  if (ilegibles.length) {
    var unicas = ilegibles.filter(function (v, i) { return ilegibles.indexOf(v) === i; });
    Logger.log('  ⚠ ' + unicas.length + ' solapa(s) no se pudieron abrir (' + filasIlegibles +
      ' fila(s)), y eso NO es un desalineamiento: ' + unicas.join(' · '));
  }

  if (!desalineadas.length) {
    Logger.log('  ✅ Ninguna columna desalineada. ⚠ Y eso NO quiere decir que los datos estén ' +
      'bien: el testigo compara rótulos, no contenido (C-09).');
  } else {
    Logger.log('  ❌ ' + desalineadas.length + ' columna(s) desalineada(s). **No se corrigió ' +
      'ninguna**: la letra manda y el testigo nunca es fallback.');
    desalineadas.forEach(function (d) {
      Logger.log('     ' + d.base_id + '/' + d.solapa + ' col ' + d.columna +
        ' (' + d.campos + '): MAPEO espera "' + d.esperados + '" · la hoja tiene "' + d.real + '"');
    });
    Logger.log('     ⚠ Antes de llamarlo hallazgo, descartar C-09: en las solapas con los ' +
      'encabezados corridos en origen el rótulo miente de entrada.');
  }

  /* `ok` es el CUADRE, no la ausencia de desalineamientos. Son dos cosas distintas: cero
   * desalineadas con el cuadre roto es un reporte que no se puede leer, y tiene que decirlo
   * por el valor de retorno además de por el log. */
  return { ok: repartidas === totalFilas,
           total_filas: totalFilas,
           filas_comparadas: filasRevisadas,
           columnas_comparadas: columnasComparadas,
           filas_sin_testigo: filasSinTestigo,
           filas_no_fuente: filasNoFuente,
           filas_sin_columna: filasSinColumna,
           filas_ilegibles: filasIlegibles,
           ilegibles: ilegibles,
           desalineadas: desalineadas };
}

/**
 * En qué láminas de una plantilla aparece cada uno de los tokens pedidos.
 *
 * ⚠ **Wrapper público, sin `_` final** (`CLAUDE.md` §2): lo corre una persona desde el
 * desplegable y devuelve por `Logger.log`, no sólo por `return`.
 *
 * **Por qué existe, habiendo `diagTokensDeLamina_`:** aquélla contesta *"qué tokens tiene ESTA
 * lámina"* y hay que darle el orden de una. La pregunta inversa —*"¿dónde se usa ESTE token?"*—
 * no la contestaba nadie, y es la que hace falta para decidir sobre un token duplicado: **un
 * número publicado dos veces no se entiende sin saber en qué lámina se publica cada uno.**
 *
 * **Es de sólo lectura**: abre la plantilla y la recorre. No toca `MARCADORES` ni el deck.
 *
 * ⚠ **Recorre la PLANTILLA, no el deck expandido**, así que los órdenes que informa son los de
 * la plantilla — que **no coinciden** con los del deck cuando una sección repetible ya duplicó
 * sus copias. Es la misma advertencia que el cierre de corrida trae sobre las láminas
 * escondidas, y acá hay que repetirla porque el número se lee igual y significa otra cosa.
 *
 * Uso:  censarTokensEnPlantilla('jm', 'pauta_meta, gcba_pauta_meta')
 */
function censarTokensEnPlantilla(informeId, tokensCsv) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    Logger.log('informe sin plantilla_id: ' + informeId);
    return { ok: false, motivo: 'informe sin plantilla_id: ' + informeId };
  }

  var buscados = String(tokensCsv || '').split(',')
    .map(function (t) { return t.replace(/[{}]/g, '').trim(); })
    .filter(function (t) { return t !== ''; });
  if (!buscados.length) {
    Logger.log('no se pidió ningún token');
    return { ok: false, motivo: 'sin tokens' };
  }

  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  var donde = {};
  buscados.forEach(function (t) { donde[t] = []; });

  slides.forEach(function (slide, i) {
    // Se replica el recorrido de `diagTokensDeLamina_` —`piezasDeTextoDeSlide_`, que baja a
    // tablas y a grupos donde `getShapes()` no llega— y **sin la guarda de lámina escondida**:
    // un censo tiene que ver la lámina justamente cuando está escondida.
    var texto = piezasDeTextoDeSlide_(slide).map(function (p) { return p.texto || ''; }).join('\n');
    buscados.forEach(function (t) {
      if (texto.indexOf('{{' + t + '}}') !== -1) {
        donde[t].push(i + 1 + (esLaminaEscondida_(slide) ? ' (escondida)' : ''));
      }
    });
  });

  Logger.log('== Tokens en la plantilla de ' + informeId + ' · ' + slides.length + ' lámina(s) ==');
  Logger.log('   ⚠ Órdenes de la PLANTILLA, no del deck expandido.');
  buscados.forEach(function (t) {
    Logger.log('   ' + t + ': ' + (donde[t].length ? 'lámina(s) ' + donde[t].join(', ') : '— NO aparece'));
  });

  return { ok: true, informe_id: informeId, total_laminas: slides.length, donde: donde };
}

/**
 * Los ocho del piloto, en la plantilla de `jm`. **Wrapper sin argumentos de
 * `censarTokensEnPlantilla`.**
 *
 * ⚠ **Existe porque una función CON PARÁMETROS no aparece en el desplegable del editor**, aunque
 * no termine en `_`. Es la segunda mitad de la convención de `CLAUDE.md` §2, y ya es la tercera
 * vez que aparece: lo que corre una persona tiene que ser invocable **sin `_` final y sin
 * argumentos**.
 *
 * **Qué cierra:** el punto 4 de la Parte A del piloto —*"los consumidores: qué láminas y qué
 * informes usan esos ocho tokens"*—, que quedó medido contra `docs/TOKENS.md` y **no contra la
 * plantilla viva**. Una cita no es la fuente.
 *
 * Y de paso **nombra los cuatro `gcba_imp_*`**, que `TOKENS.md` describe como *"los mismos con
 * prefijo `gcba_`"* sin listarlos — una descripción que no se puede verificar mirando la
 * plantilla.
 */
function censarTokensDelPiloto() {
  return censarTokensEnPlantilla('jm',
    'imp_total,imp_meta,imp_google,imp_prog,' +
    'gcba_imp_total,gcba_imp_meta,gcba_imp_google,gcba_imp_prog');
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Testigos por lista explícita de marcadores — `2026-08-17`
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * **Por qué hacen falta, habiendo `testigoDeImpresiones()`.** Aquélla agrupa por medida y emite
 * **sólo los grupos de dos o más**, porque nació para el caso *"varios marcadores que sólo
 * difieren en el filtro"*. Medido el 17/08 contra `MARCADORES_2026-08-17.tsv`:
 *
 *   - **de `rdv` no emite NADA**: sus 17 marcadores son todos grupo de uno;
 *   - de los 13 de la tanda 2 emite **4**, los `m2_*` que comparten medida con los `mail_*`.
 *
 * **O sea que el instrumento del piloto no sirve para estas dos tandas**, y no por un defecto:
 * mide otra cosa. Éstos toman una **lista explícita** y reportan lo que esa lista tenga.
 */

/**
 * La cuenta de filas que la traza reporta, o `null` si no se pudo extraer.
 *
 * ⚠ **Lee el TEXTO de la traza, y eso es una dependencia frágil declarada.** El formato es
 * `«filtro ... → N de M fila(s)»` (`Generador.gs`). Si cambia, esto devuelve `null` **y el
 * llamador lo dice** en vez de comparar menos marcadores en silencio — que es el modo de falla
 * que se está tratando de evitar en todo el proyecto.
 *
 * **No se reimplementa el filtrado para obtener el número por otro lado**: eso sería reproducir
 * lógica que el motor ya tiene, peor, que es el error que `CLAUDE.md` §4 documenta.
 */
function filasDeTraza_(traza) {
  var t = String(traza || '');

  /* ⚠ **La traza tiene DOS etapas y cada una dice `N de M`**, así que tomar la primera que
   * aparezca mezcla niveles. Es el bug que se corrigió el 17/08:
   *
   *     filtro `mail_tipo=Convocatoria` … → 359 de 2239 fila(s)      ← etapa FILTRO
   *     recorte por ventana sobre "…": 11 de 359 fila(s)             ← etapa VENTANA
   *
   * Con `11` de una etapa y `359` de la otra, el control de cobertura dio
   * `11 + 25 + 323 = 359`: **una suma que cierra y no significa nada**. Es el mismo patrón que
   * el cuadre de `verificarEncabezadosDeMapeo()` la semana pasada — baldes que cuentan cosas
   * distintas y una suma que cierra igual.
   *
   * Por eso cada etapa se ancla en **su propio rótulo** y se devuelven **las dos por separado**:
   * quien compare tiene que elegir una y **decir cuál**, no recibir un número sin nivel. */
  var f = /filtro\s+`[^`]*`[^→]*→\s*(\d+)\s+de\s+(\d+)\s+fila/.exec(t);
  var v = /recorte por ventana[^:]*:\s*(\d+)\s+de\s+(\d+)\s+fila/.exec(t);

  if (!f && !v) return null;
  return {
    filtro:  f ? { quedan: Number(f[1]), universo: Number(f[2]) } : null,
    ventana: v ? { quedan: Number(v[1]), universo: Number(v[2]) } : null,
    // El número final que el marcador efectivamente usó: la última etapa que haya corrido.
    final:   v ? Number(v[1]) : (f ? Number(f[1]) : null)
  };
}

/**
 * Resuelve el informe una vez y devuelve los marcadores pedidos, con valor, estado, traza y la
 * cuenta de filas extraída. **Sólo lectura.**
 *
 * ⚠ **Costo: ~3m30s contra un límite de 6 minutos**, porque `resolverMarcadores` resuelve los 78
 * del informe y de ésos se usan los de la lista. No se acota por el mismo motivo que en
 * `testigoDeImpresiones()`: acotarlo sería tocar el motor o reimplementarlo por fuera.
 */
function testigoDeMarcadores_(nombres, titulo) {
  var res = resolverMarcadores('jm');
  if (!res || !res.ok || !res.resultados) {
    Logger.log('resolverMarcadores no devolvió resultados: ' + JSON.stringify(res));
    return { ok: false, motivo: 'sin resultados' };
  }

  var por = {};
  res.resultados.forEach(function (r) { por[r.marcador] = r; });

  Logger.log('== ' + titulo + ' == (' + nombres.length + ' marcador(es) pedidos)');
  Logger.log('resolverMarcadores(jm) → ' + res.resumen.total + ' · ok=' + res.resumen.ok +
    ' · sin_datos=' + res.resumen.sin_datos + ' · error=' + res.resumen.error);

  var filas = [];
  var faltantes = [];
  nombres.forEach(function (n) {
    var r = por[n];
    if (!r) { faltantes.push(n); return; }
    var t = String(r.traza || '').replace(/\s+/g, ' ');
    var c = filasDeTraza_(t);
    filas.push({ marcador: n, valor: r.valor, estado: r.estado || '', traza: t, filas: c });
    // Las dos etapas se imprimen **rotuladas y por separado**: un `N de M` sin nivel es lo que
    // produjo la suma sin significado del 17/08.
    var etapas = c
      ? (c.filtro ? 'filtro ' + c.filtro.quedan + '/' + c.filtro.universo : 'filtro —') + ' · ' +
        (c.ventana ? 'ventana ' + c.ventana.quedan + '/' + c.ventana.universo : 'ventana —')
      : '(sin cuenta legible)';
    Logger.log('  ' + n + '\t' + r.valor + '\t' + (r.estado || '') + '\t' + etapas + '\t' + t);
  });

  if (faltantes.length) {
    Logger.log('⚠ NO ESTÁN en el informe (' + faltantes.length + '): ' + faltantes.join(', '));
  }
  var sinCuenta = filas.filter(function (f) { return !f.filas; }).map(function (f) { return f.marcador; });
  if (sinCuenta.length) {
    Logger.log('⚠ SIN CUENTA DE FILAS LEGIBLE (' + sinCuenta.length + '): ' + sinCuenta.join(', ') +
      ' — cambió el formato de la traza; los conteos de abajo cubren menos marcadores de los pedidos.');
  }
  return { ok: true, filas: filas, faltantes: faltantes, sin_cuenta: sinCuenta };
}

/**
 * **`2026-08-17_2` — el testigo de `rdv`.** Sólo lectura, no migra nada.
 *
 * Responde las dos mediciones que el prompt pide con nombre propio, más la toma de valores que
 * sirve para la pregunta 1 (*¿está quieta `rdv`?*), que se contesta **corriendo esto dos veces
 * separadas en el tiempo y comparando**.
 *
 * ⚠ **`rdv` es una base de carga humana** —alguien agrega encuentros—, así que su patrón de
 * cambio puede ser **diario y no continuo**: conviene una segunda toma en **otro día**, no sólo
 * separada por una hora.
 */
function testigoDeRdv() {
  var LOS_17 = [
    'ecv_encuentros', 'ecv_inscriptos', 'ecv_asistentes', 'ecv_barrios', 'ecv_barrio',
    'ecv_poblacion', 'enc_evento',
    'ecv_insc_mail', 'ecv_insc_cc', 'ecv_insc_ivr', 'ecv_insc_digital', 'ecv_insc_dif',
    'ecv_insc_mail_pct', 'ecv_insc_cc_pct', 'ecv_insc_ivr_pct', 'ecv_insc_digital_pct',
    'ecv_insc_dif_pct'
  ];
  var t = testigoDeMarcadores_(LOS_17, 'TESTIGO rdv/RVD JM-CM - ES — 2026-08-17_2');
  if (!t.ok) return t;

  var valor = {};
  t.filas.forEach(function (f) { valor[f.marcador] = f.valor; });

  /* ── HALLAZGO 1 · las 17 cuentas de filas tienen que ser IGUALES ──────────────────────────
   * Los 17 comparten el filtro `figura=Jorge Macri` (medido sobre el snapshot), así que leen el
   * mismo conjunto. **Si alguna difiere, es un hallazgo ANTES de migrar nada** — significa que
   * algo más además del filtro está recortando, y la migración de `ambito` se estaría escribiendo
   * sobre un supuesto falso. */
  var cuentas = {};
  t.filas.forEach(function (f) {
    if (!f.filas) return;
    // Se compara **la firma de las DOS etapas**, no un número suelto: dos marcadores pueden
    // coincidir después de la ventana y haber partido de filtros distintos.
    var c = f.filas;
    var k = (c.filtro ? c.filtro.quedan + '/' + c.filtro.universo : '—') + ' → ' +
            (c.ventana ? c.ventana.quedan + '/' + c.ventana.universo : 'sin recorte');
    if (!cuentas[k]) cuentas[k] = [];
    cuentas[k].push(f.marcador);
  });
  var distintas = Object.keys(cuentas);
  Logger.log('');
  Logger.log('== HALLAZGO 1 · ¿las 17 cuentas de filas son iguales? ==');
  if (distintas.length === 1) {
    Logger.log('  ✅ SÍ — todas ' + distintas[0] + '. Comparten filtro y leen el mismo conjunto.');
  } else {
    Logger.log('  ❌ NO — ' + distintas.length + ' cuentas distintas. **Es un hallazgo y va antes de migrar:**');
    distintas.forEach(function (k) { Logger.log('     ' + k + ' → ' + cuentas[k].join(', ')); });
  }

  /* ── HALLAZGO 2 · las cinco identidades de canal ──────────────────────────────────────────
   * ¿`insc_mail + insc_cc + insc_ivr + insc_digital + insc_dif` da `inscriptos`?
   *
   * **Si cierra, es la invariante estructural equivalente al descuadre del piloto**: sobrevive al
   * drift, porque no depende del momento sino de que las partes cubran el total.
   *
   * ⚠ **Si NO cierra, es un hallazgo PROPIO y NO un obstáculo para la migración.** Significa que
   * los cinco canales no son una partición de `inscriptos` —puede haber inscriptos por una vía no
   * listada, o doble conteo— y eso es una pregunta del dominio, no del vocabulario. **Se reporta
   * aparte para que no se lea como que la migración está bloqueada.** */
  var canales = ['ecv_insc_mail', 'ecv_insc_cc', 'ecv_insc_ivr', 'ecv_insc_digital', 'ecv_insc_dif'];
  var num = function (v) { var n = Number(String(v).replace(/\./g, '').replace(',', '.')); return isNaN(n) ? null : n; };
  var partes = canales.map(function (c) { return num(valor[c]); });
  var total = num(valor['ecv_inscriptos']);

  Logger.log('');
  Logger.log('== HALLAZGO 2 · ¿las cinco identidades de canal cierran? ==');
  if (partes.some(function (p) { return p === null; }) || total === null) {
    Logger.log('  ⚠ NO SE PUDO CALCULAR — algún valor no es numérico. Valores crudos:');
    canales.concat(['ecv_inscriptos']).forEach(function (c) { Logger.log('     ' + c + ' = ' + valor[c]); });
  } else {
    var suma = partes.reduce(function (a, b) { return a + b; }, 0);
    Logger.log('     ' + canales.map(function (c, i) { return c + '=' + partes[i]; }).join(' + '));
    Logger.log('     suma = ' + suma + ' · ecv_inscriptos = ' + total + ' · diferencia = ' + (total - suma));
    if (total - suma === 0) {
      Logger.log('  ✅ CIERRA — es la invariante estructural: sirve como control que sobrevive al drift.');
    } else {
      Logger.log('  ⚠ NO CIERRA — **hallazgo propio, NO bloquea la migración.** Los cinco canales');
      Logger.log('     no son una partición de `inscriptos`: puede faltar una vía o haber doble conteo.');
      Logger.log('     Es una pregunta del dominio, no del vocabulario.');
    }
  }

  Logger.log('');
  Logger.log('== PREGUNTA 1 · ¿está quieta `rdv`? ==');
  Logger.log('   Se contesta corriendo ESTO DOS VECES separadas en el tiempo y comparando.');
  Logger.log('   Si los 17 dan idénticos, la tanda de `rdv` se verifica por igualdad exacta y el canario sobra.');
  Logger.log('   ⚠ `rdv` es de carga humana: la segunda toma conviene en OTRO DÍA, no sólo una hora después.');
  return t;
}

/**
 * **`2026-08-17_1` Parte A — el testigo de la tanda 2 (`tipo_envio`).** Sólo lectura.
 *
 * Mide lo único que quedó abierto: **la cobertura**. Cuántas filas toma `convocatoria`, cuántas
 * `m2`, y **cuántas quedan afuera de los dos** — ese resto es el control de la Parte C: si la
 * dimensión traduce bien, no se mueve.
 *
 * ⚠ **La DISJUNCIÓN no se mide, y no por pereza: está cerrada por CÓDIGO.** `cumpleCondicion_`
 * (`Generador.gs`) hace `v === esperado` para `=` y `indexOf !== -1` para `~=`. Entonces
 * `mail_tipo=Convocatoria` exige la celda **exactamente** `Convocatoria`, y `Convocatoria` **no
 * contiene** `M2`. **Ninguna fila puede caer en los dos, cualquiera sea el dato.** Es una
 * propiedad del código, no del dato, y **no hay que volver a medirla**.
 */
function testigoDeTanda2() {
  /* ⚠ **La tanda son SIETE, no trece — los seis `enc_mails_*` salieron el 17/08.**
   *
   * **Motivo: no publican.** Dan `sin_datos` con `«FALTA:@ultimo_ambiguo»` — dos filas de
   * `Directa Mail` comparten la fecha más alta con valores distintos y `opULTIMO` **se niega a
   * elegir**, que es el comportamiento correcto (guarda del `_39`).
   *
   * **Un marcador que hoy no produce valor no se puede migrar y verificar:** la Parte C
   * compararía `sin_datos` contra `sin_datos`, **reproduce trivialmente y no prueba nada**. Es
   * el mismo razonamiento por el que el piloto no se verificó contra marcadores en error.
   *
   * **Se siguen midiendo igual** —quedan en la lista de abajo— porque su cuenta de filas es la
   * que da el lado `convocatoria` de la cobertura, y esa parte sí funciona: el filtro corre y
   * recorta; lo que falla es la operación `ULTIMO`, después.
   *
   * ⚠ **Consecuencia para `D-33`: `tipo_envio` queda migrada A MEDIAS**, con `m2` en
   * `dimensiones` y `convocatoria` todavía en `filtro`. **Las dos formas conviven**, que es lo
   * que el piloto ya estableció como aceptable — pero hay que saberlo, porque un censo de
   * dimensiones que no lo espere va a leerlo como inconsistencia. */
  var LOS_7 = [
    'm2_envios', 'm2_mails_enviados', 'm2_mails_entregados', 'm2_aperturas', 'm2_clics', 'm2_or', 'm2_ctor'
  ];
  // Se miden pero NO se migran: dan la cuenta de filas del lado `convocatoria` de la cobertura.
  var SEIS_QUE_NO_PUBLICAN = [
    'enc_mails_enviados', 'enc_mails_entregados', 'enc_aperturas', 'enc_clics_ctor', 'enc_or', 'enc_ctor'
  ];
  var LOS_13 = SEIS_QUE_NO_PUBLICAN.concat(LOS_7);
  // El canario de `digital`, ya probado en la tanda 1: filtro vacío en los dos, no se migran.
  var CANARIO = ['enc_atendidos', 'ivr_atendidos'];

  var t = testigoDeMarcadores_(CANARIO.concat(LOS_13), 'TESTIGO tanda 2 · tipo_envio — 2026-08-17_1');
  if (!t.ok) return t;

  var porNombre = {};
  t.filas.forEach(function (f) { porNombre[f.marcador] = f; });

  Logger.log('');
  Logger.log('== CANARIO (primero, antes de leer nada más) ==');
  var a = porNombre['enc_atendidos'], b = porNombre['ivr_atendidos'];
  if (a && b) {
    Logger.log('   enc_atendidos = ' + a.valor + ' · ivr_atendidos = ' + b.valor);
    Logger.log(String(a.valor) === String(b.valor)
      ? '   ✅ coinciden entre sí — el instrumento está sano. Comparar contra 71.234 · 2 de 60.'
      : '   ❌ NO coinciden — el problema es el INSTRUMENTO, no la base. Parar.');
  }

  /* ── LA COBERTURA, que es el control de esta tanda ────────────────────────────────────────
   * Los tres números salen del mismo universo. `convocatoria` y `m2` son subconjuntos **disjuntos
   * pero NO exhaustivos**, así que el resto es lo que hay que mirar.
   *
   * ⚠ **Es un control MÁS DÉBIL que la partición de la tanda 1** —aquélla era exhaustiva y
   * cualquier corte mal traducido rompía la suma— y **no detecta un error que mueva los dos
   * subconjuntos y el resto en la misma proporción.** Se escribe así a propósito: un control débil
   * presentado como fuerte es peor que no tenerlo. **El control principal de esta tanda son los
   * valores idénticos**, que en `digital` alcanzan porque está probada quieta. */
  /* ⚠ **Los tres números salen de LA MISMA ETAPA: la del FILTRO, antes del recorte por ventana.**
   *
   * **El 17/08 esto estaba mal y produjo una suma sin significado:** tomaba `quedan` de la etapa
   * de ventana (11 y 25) y `universo` de la etapa de filtro (359), y reportaba
   * `11 + 25 + 323 = 359`. Cerraba, y no quería decir nada.
   *
   * **Se elige la etapa de FILTRO y no la de ventana**, y el motivo es que es la única donde el
   * universo está disponible: el `M` del filtro **es** el total de la solapa. Después del recorte
   * por ventana, el universo en ventana **no lo publica ningún marcador** —haría falta uno sin
   * filtro sobre esa solapa, y no existe—, así que ahí el control no se puede armar.
   *
   * **Consecuencia que hay que tener presente:** este control mide la traducción de la dimensión
   * **antes** de la ventana. Es exactamente lo que se quiere —la dimensión traduce un corte, no
   * una fecha— pero **no dice nada sobre el recorte temporal**, y eso lo cubren los valores. */
  var etapaDe = function (nombres) {
    for (var i = 0; i < nombres.length; i++) {
      var f = porNombre[nombres[i]];
      if (f && f.filas && f.filas.filtro) return { fuente: nombres[i], etapa: f.filas.filtro };
    }
    return null;
  };
  var eConv = etapaDe(['enc_mails_enviados', 'enc_aperturas', 'enc_or']);
  var eM2 = etapaDe(['m2_mails_enviados', 'm2_aperturas', 'm2_or']);

  Logger.log('');
  Logger.log('== LA COBERTURA — el control de esta tanda · ETAPA: FILTRO (antes de la ventana) ==');
  if (!eConv || !eM2) {
    Logger.log('   ⚠ NO SE PUDO CALCULAR: falta la etapa de filtro en alguno de los dos lados.');
    Logger.log('      Ver el aviso de cuentas ilegibles, arriba. **No inventar el número.**');
  } else if (eConv.etapa.universo !== eM2.etapa.universo) {
    Logger.log('   ❌ LOS DOS LADOS PARTEN DE UNIVERSOS DISTINTOS — ' + eConv.etapa.universo +
      ' (' + eConv.fuente + ') contra ' + eM2.etapa.universo + ' (' + eM2.fuente + ').');
    Logger.log('      **No son comparables y la resta no significa nada. Parar y reportar.**');
  } else {
    var universo = eConv.etapa.universo;
    var conv = eConv.etapa.quedan, m2 = eM2.etapa.quedan;
    var resto = universo - conv - m2;
    Logger.log('   universo (solapa entera):      ' + universo + '  ← el M de la etapa de filtro');
    Logger.log('   convocatoria:                  ' + conv + '  (de ' + eConv.fuente + ')');
    Logger.log('   m2:                            ' + m2 + '  (de ' + eM2.fuente + ')');
    Logger.log('   RESTO (ni convocatoria ni m2): ' + resto + '  ← esto es lo que no se puede mover');
    Logger.log('   comprobación: ' + conv + ' + ' + m2 + ' + ' + resto + ' = ' + universo);
    if (resto < 0) {
      Logger.log('   ❌ RESTO NEGATIVO — los dos conjuntos se superponen, y eso contradice la');
      Logger.log('      disjunción que el código garantiza. **Parar y reportar**: o cambió');
      Logger.log('      `cumpleCondicion_`, o alguno de los dos filtros ya no es el que se midió.');
    }
    Logger.log('   ⚠ Una celda como "Convocatoria M2" NO entra en convocatoria (no es igualdad');
    Logger.log('      estricta) pero SÍ en m2. No rompe la disjunción; cambia qué significa cada conjunto.');
  }
  return t;
}

/**
 * **`2026-08-13_1` Parte A — `R-26`: ¿el "1 a 1" se comunica sólo por digital?** Sólo lectura.
 *
 * ⚠ **Wrapper público sin `_` y sin parámetros** (`CLAUDE.md` §2).
 *
 * **NO escribe nada y NO decide.** Puede **falsar la premisa**: si aparecen encuentros "1 a 1"
 * con inscriptos por mail o call center, la regla *"sólo digital"* no se escribe, y `R-26` queda
 * como hueco — que está bien y es un resultado.
 *
 * ─── Tres decisiones de medición, y cada una tiene su motivo ──────────────────────────────
 *
 * 1. **SIN recorte por ventana** (`sin_recorte_por_ventana`). Se quiere el comportamiento del
 *    **tipo de encuentro**, no el de una semana: una regla del dominio no puede salir de la
 *    muestra de siete días que toque.
 *
 * 2. **NO se asume la forma exacta de `"1 a 1"`.** Se listan **todos** los valores distintos de
 *    `evento` con su conteo, y recién después se marca cuáles matchean. `HALLAZGOS_validacion_decks`
 *    registró la celda como `"1 a 1"`, pero **eso es una cita fechada y no la fuente** — puede
 *    tener otro espaciado, otro case, o convivir con variantes.
 *
 * 3. **El CONTEO de filas con valor distinto de cero importa más que la suma**, y es el punto
 *    fino del prompt: **una sola fila con mail rompe un "siempre cero"**, y en una suma de miles
 *    esa fila desaparece. Por eso se cuentan filas, no se suman valores.
 *
 * ⚠ **Y no se mezcla con `testigoDeRdv()` aunque lean la misma base.** Son universos distintos
 * —aquélla mide **con** la ventana del informe, ésta **sin** ninguna— y ésta **puede falsar su
 * propia premisa**: mezclarlas haría que un resultado arrastre al otro.
 */
function medirUnoAUnoDeRdv() {
  var BASE = 'rdv';
  var solapa = (leerBases()[BASE] || {}).hoja_default;
  if (!solapa) { Logger.log('BASES.rdv no declara hoja_default'); return { ok: false }; }

  var lectura = leerFuente(BASE, null, solapa, { sin_recorte_por_ventana: true });
  if (!lectura.ok) { Logger.log('no se pudo leer ' + BASE + '/' + solapa + ': ' + lectura.motivo); return lectura; }

  // Los campos se resuelven por `MAPEO`, no se adivinan — y si falta alguno se dice **cuál**,
  // nombrando base y solapa: un "no está" sin ámbito no se puede verificar (`CLAUDE.md` §4).
  var CAMPOS = ['evento', 'figura', 'inscriptos', 'insc_mail', 'insc_cc', 'insc_ivr', 'insc_digital', 'insc_dif'];
  var enc = {}, faltan = [];
  CAMPOS.forEach(function (c) {
    var m = buscarMapeo(BASE, solapa, c);
    if (!m.ok) { faltan.push(c + ' (' + m.motivo + ')'); return; }
    enc[c] = encabezadoEnColumna_(BASE, solapa, m.columna);
    if (enc[c] === undefined) faltan.push(c + ' (columna ' + m.columna + ' ilegible)');
  });

  Logger.log('== R-26 Parte A · ' + BASE + '/' + solapa + ' · SIN recorte por ventana ==');
  Logger.log('   ' + lectura.filas.length + ' fila(s) leídas');
  if (faltan.length) {
    Logger.log('⚠ CAMPOS QUE NO RESUELVEN en ' + BASE + '/' + solapa + ' (' + faltan.length + '): ' + faltan.join(' · '));
    Logger.log('   Los conteos de abajo omiten esos canales — no valen como "siempre cero".');
  }

  /* ── 1 · TODOS los valores de `evento`, sin asumir cuál es el "1 a 1" ─────────────────── */
  var porEvento = {};
  lectura.filas.forEach(function (f) {
    var v = normalizarValorDeclarado_(f[enc['evento']]);
    porEvento[v] = (porEvento[v] || 0) + 1;
  });
  var eventos = Object.keys(porEvento).sort(function (a, b) { return porEvento[b] - porEvento[a]; });
  Logger.log('');
  Logger.log('== 1 · valores distintos de `evento` (' + eventos.length + ') ==');
  eventos.forEach(function (v) {
    var marca = /1\s*a\s*1/i.test(v) ? '   ← matchea "1 a 1"' : '';
    Logger.log('   ' + porEvento[v] + '\t"' + v + '"' + marca);
  });

  var candidatos = eventos.filter(function (v) { return /1\s*a\s*1/i.test(v); });
  if (!candidatos.length) {
    Logger.log('');
    Logger.log('❌ NINGÚN valor de `evento` matchea "1 a 1". **La premisa de R-26 no se puede evaluar**');
    Logger.log('   con este dato: o el tipo se llama de otra forma, o no está en esta solapa.');
    Logger.log('   Reportar y parar — NO escribir R-26.');
    return { ok: true, eventos: porEvento, candidatos: [] };
  }

  /* ── 2 y 3 · el universo del "1 a 1" y el reparto por canal ───────────────────────────── */
  var CANALES = ['insc_mail', 'insc_cc', 'insc_ivr', 'insc_digital', 'insc_dif'];
  var num = function (v) {
    if (v === '' || v === null || v === undefined) return 0;
    var n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  candidatos.forEach(function (ev) {
    var filas = lectura.filas.filter(function (f) {
      return normalizarValorDeclarado_(f[enc['evento']]) === ev;
    });
    var conFigura = filas.filter(function (f) {
      return normalizarValorDeclarado_(f[enc['figura']]) === 'Jorge Macri';
    });

    Logger.log('');
    Logger.log('== 2 · universo de "' + ev + '" ==');
    Logger.log('   ' + filas.length + ' fila(s) · ' + conFigura.length + ' con figura = Jorge Macri');

    Logger.log('== 3 · reparto por canal — el CONTEO manda sobre la suma ==');
    Logger.log('   canal            suma        filas con valor ≠ 0');
    CANALES.concat(['inscriptos']).forEach(function (c) {
      if (!enc[c]) { Logger.log('   ' + c + '\t(no resuelve, omitido)'); return; }
      var suma = 0, nz = 0;
      filas.forEach(function (f) {
        var v = num(f[enc[c]]);
        suma += v;
        if (v !== 0) nz++;
      });
      var alerta = (CANALES.indexOf(c) !== -1 && c !== 'insc_digital' && nz > 0)
        ? '   ⚠ ROMPE el "sólo digital"' : '';
      Logger.log('   ' + c + '\t' + suma + '\t' + nz + ' de ' + filas.length + alerta);
    });

    Logger.log('');
    Logger.log('   ⚠ Cómo leer esto: **una sola fila con mail o call center rompe un "siempre cero"**.');
    Logger.log('      Si aparecen, R-26 no se escribe como invariante aritmética sino como RÉGIMEN');
    Logger.log('      de convocatoria, diciendo cuántas filas la contradicen — y esas filas SE');
    Logger.log('      PUBLICAN, no se recortan.');
  });

  Logger.log('');
  Logger.log('== Reportar y parar. La Parte B espera confirmación del usuario. ==');
  return { ok: true, eventos: porEvento, candidatos: candidatos, filas_leidas: lectura.filas.length };
}

/**
 * Los dos operandos de un `RATIO`/`PCT`, leídos de la traza que emite `opRATIO`.
 *
 * **Por qué hace falta, y por qué recién en la tanda 4.** Las tandas 1 a 3 compararon el
 * **valor**; acá el valor puede moverse legítimamente porque `looker` recalcula dentro de
 * ventanas cerradas. Con los dos operandos a la vista, un ratio distinto deja de ser ambiguo:
 *
 *   - **mismos operandos y otro ratio** → imposible; sería un bug de `opRATIO`;
 *   - **otros operandos y la partición cerrando** → es `looker`, que recalculó;
 *   - **otros operandos y la partición rota** → es la migración.
 *
 * Sin esto, las tres se ven igual: «el número cambió».
 *
 * ⚠ **Lee el TEXTO de la traza**, igual que `filasDeTraza_`, y es la misma dependencia frágil
 * declarada: el formato es `RATIO num/den = N/D` (`Marcadores.gs`, `opRATIO`). Si cambia,
 * devuelve `null` **y el llamador lo dice**, en vez de comparar de menos en silencio.
 *
 * **No se recalculan los operandos por fuera del motor.** Sería reimplementar lo que el motor
 * ya hace, que es exactamente el error que `CLAUDE.md` §4 documenta en tres casos.
 */
function operandosDeRatio_(traza) {
  var t = String(traza || '');

  /* ⚠ **Los nombres LLEVAN ESPACIOS, y suponer que no los llevaban fue el bug del 17/08.**
   *
   * La traza real es `RATIO dig_impresiones (col H)/alcance (col K) = 6729844/475723`: el
   * despachador arma los nombres como `nombre + ' (col ' + columna + ')'` (`Generador.gs`), no
   * como el `campo_logico` pelado. La primera versión de esto ancló en `[^\s\/]+` —"un nombre no
   * tiene espacios"— y **no matcheó nada**, así que el testigo informó *"cambió el formato de la
   * traza"* con el texto correcto tres líneas más arriba en el mismo log.
   *
   * **Ahora se ancla en lo estable: el rótulo `RATIO`, el ` = ` y el par `N/D`.** Los nombres se
   * toman como lo que haya en el medio, que es justamente la parte que puede cambiar de forma. */
  var m = /RATIO\s+(.+?)\s*=\s*(-?[\d.]+(?:[eE][+-]?\d+)?)\s*\/\s*(-?[\d.]+(?:[eE][+-]?\d+)?)/.exec(t);
  if (!m) return null;

  // `campo_logico` se declara `numerador/denominador`, así que hay **una** barra separando los
  // dos nombres. Se corta en la primera: `(col H)` no trae barras.
  var nombres = String(m[1]);
  var corte = nombres.indexOf('/');
  return {
    nombre_num: corte === -1 ? nombres.trim() : nombres.slice(0, corte).trim(),
    nombre_den: corte === -1 ? '' : nombres.slice(corte + 1).trim(),
    numerador: Number(m[2]), denominador: Number(m[3])
  };
}

/**
 * **`2026-08-17_4` Parte A — el testigo de la tanda 4 (`frecuencia` / `gcba_frecuencia`).**
 * Sólo lectura, no migra nada.
 *
 * ⚠ **Emite valor nominal, cuenta de filas y los dos operandos ANTES de cualquier veredicto**, y
 * eso es una corrección de método, no un detalle de formato. **Es la tercera vez que un testigo
 * se queda corto y se arregla después de haberlo usado:** el de impresiones nació sin cuentas de
 * filas, el de mail dejó tres valores inferidos del orden, y el de las tandas 2 y 3 cerró sobre
 * *"los siete idénticos"* y *"los 17 idénticos"* **sin un solo valor marcador por marcador** — así
 * que hoy no hay contra qué comparar 20 de esos 24. **Acá son dos marcadores: no hay excusa de
 * volumen.**
 *
 * **El orden importa:** primero los datos crudos y atribuidos, después los controles. Un veredicto
 * impreso antes que el dato del que sale es un veredicto que nadie puede auditar.
 */
function testigoDeFrecuencia() {
  var EL_PAR = ['frecuencia', 'gcba_frecuencia'];
  var t = testigoDeMarcadores_(EL_PAR, 'TESTIGO tanda 4 · frecuencia/gcba_frecuencia — 2026-08-17_4');
  if (!t.ok) return t;

  var porNombre = {};
  t.filas.forEach(function (f) { porNombre[f.marcador] = f; });

  /* ── 1 · LOS DATOS CRUDOS, atribuidos y nominales ─────────────────────────────────────────
   * ⚠ **Esto se imprime SIEMPRE y antes que todo lo demás**, incluso si después algún control
   * falla: es lo que hay que poder copiar al snapshot para que la corrida sirva de referencia
   * dentro de una semana. Un testigo que sólo dice «coinciden» no es un testigo. */
  Logger.log('');
  Logger.log('== 1 · LOS DOS MARCADORES, NOMINALES — copiar TAL CUAL al snapshot ==');
  Logger.log('   marcador\tvalor\testado\tfiltro(N/M)\tventana(N/M)\tnumerador\tdenominador');
  EL_PAR.forEach(function (n) {
    var f = porNombre[n];
    if (!f) { Logger.log('   ' + n + '\t⚠ NO ESTÁ EN EL INFORME'); return; }
    var c = f.filas;
    var o = operandosDeRatio_(f.traza);
    Logger.log('   ' + n +
      '\t' + f.valor +
      '\t' + (f.estado || '') +
      '\t' + (c && c.filtro ? c.filtro.quedan + '/' + c.filtro.universo : '—') +
      '\t' + (c && c.ventana ? c.ventana.quedan + '/' + c.ventana.universo : '—') +
      '\t' + (o ? o.numerador : '⚠ no legible') +
      '\t' + (o ? o.denominador : '⚠ no legible'));
  });
  /* ⚠ **Los avisos se ACUMULAN y se imprimen AL FINAL, después del veredicto.**
   *
   * **Motivo, medido el 17/08:** el aviso *"sin operandos legibles"* salió acá, en el medio del
   * reporte, y **abajo el bloque de la partición terminaba en `✅ CIERRA`**. Se leyó como verde
   * **dos corridas seguidas**. Un `⚠` sepultado arriba de un `✅` no es un aviso: es ruido con
   * forma de aviso.
   *
   * **La combinación exacta a evitar es «partición cerrando sobre un operando ilegible»**, porque
   * el control principal da verde mientras el que distingue *se movió el numerador* de *se movió
   * el denominador* no se puede leer — justo en la tanda donde los valores son el dato débil. */
  var avisos = [];
  var sinOperandos = EL_PAR.filter(function (n) {
    return porNombre[n] && !operandosDeRatio_(porNombre[n].traza);
  });
  if (sinOperandos.length) {
    avisos.push('SIN OPERANDOS LEGIBLES: ' + sinOperandos.join(', ') + '. El control 3 no se ' +
      'puede leer: no se va a poder distinguir si se movió el numerador o el denominador.');
  }
  EL_PAR.forEach(function (n) {
    if (!porNombre[n]) avisos.push('`' + n + '` NO ESTÁ en el informe — el par está incompleto.');
    else if (porNombre[n].estado && porNombre[n].estado !== 'ok') {
      avisos.push('`' + n + '` está en estado `' + porNombre[n].estado + '`, no `ok`.');
    }
  });

  /* ── 2 · LA PARTICIÓN, que es el control principal de esta tanda ──────────────────────────
   * `campana~=JM` y `campana!~=JM` son **complementarios por CÓDIGO**, no por dato:
   * `valorPasaFiltro_` calcula `coincide` una sola vez y devuelve `coincide` o `!coincide` según
   * `negado`. Los dos operadores comparten `op: '~='` y difieren **sólo** en ese booleano
   * (`OPERADORES_FILTRO_`), así que sobre la misma celda devuelven exactamente lo contrario.
   * **Toda fila cae en exactamente una de las dos, cualquiera sea el dato.**
   *
   * ⚠ **Incluida la celda vacía**, que es el único caso que la complementariedad no cubriría si
   * el operador tratara el vacío aparte — y no lo trata: `normalizarValorDeclarado_('')` da `''`,
   * `''.indexOf('JM')` da `-1`, así que `~=` es falso y `!~=` verdadero. **Una fila sin campaña
   * cargada cae en `gcba` y no se pierde**, que es lo mismo que se midió en `Directa Mail` para
   * `=`/`!=` y lo que `D-33` ya dejó escrito: `gcba` es *todo lo que no es `jm`*.
   *
   * **Lo que esto NO garantiza**, y por eso el control se corre igual: que las dos filas lean el
   * **mismo universo**. La complementariedad es sobre una fila; la partición exige además que los
   * dos marcadores partan del mismo conjunto. Si un día difieren en solapa, en ventana o en
   * `periodo_ref`, `4 + 22 = 26` deja de significar algo aunque los operadores sigan siendo
   * complementarios. **Eso sí es del dato y se mide acá.** */
  Logger.log('');
  Logger.log('== 2 · LA PARTICIÓN — el control PRINCIPAL de esta tanda ==');
  var jm = porNombre['frecuencia'], gcba = porNombre['gcba_frecuencia'];
  var cJm = jm && jm.filas && jm.filas.filtro, cGcba = gcba && gcba.filas && gcba.filas.filtro;

  if (!cJm || !cGcba) {
    Logger.log('   ⚠ NO SE PUEDE ARMAR — falta la cuenta de la etapa de FILTRO en ' +
      (!cJm ? 'frecuencia' : '') + (!cJm && !cGcba ? ' y ' : '') + (!cGcba ? 'gcba_frecuencia' : '') + '.');
    Logger.log('   **Parar: el control principal de la tanda no está disponible.**');
  } else if (cJm.universo !== cGcba.universo) {
    // Este es el modo de falla que la suma sola no detectaría: 4 de 26 y 22 de 30 suman 26 igual.
    Logger.log('   ❌ LOS DOS NO LEEN EL MISMO UNIVERSO: ' + cJm.universo + ' vs ' + cGcba.universo + '.');
    Logger.log('   **La partición no se puede evaluar** — la suma daría un número sin significado.');
    Logger.log('   Parar y reportar: es un hallazgo previo a la migración.');
  } else {
    var suma = cJm.quedan + cGcba.quedan;
    Logger.log('   frecuencia (jm)      = ' + cJm.quedan + ' de ' + cJm.universo);
    Logger.log('   gcba_frecuencia      = ' + cGcba.quedan + ' de ' + cGcba.universo);
    Logger.log('   ' + cJm.quedan + ' + ' + cGcba.quedan + ' = ' + suma + ' · universo = ' + cJm.universo);
    if (suma === cJm.universo) {
      Logger.log('   ✅ CIERRA — partición exhaustiva. Es el control que la Parte C tiene que reproducir.');
      if (cJm.universo !== 26) {
        Logger.log('   ⚠ El universo NO es 26 sino ' + cJm.universo + ': `looker` recalculó desde la');
        Logger.log('     medición del 17/08. **No es un problema** — la Parte C compara contra ESTE');
        Logger.log('     número, no contra 26. Anotarlo en el snapshot.');
      }
    } else {
      Logger.log('   ❌ NO CIERRA — sobran o faltan ' + (cJm.universo - suma) + ' fila(s).');
      Logger.log('   ⚠ **PARAR Y NO MIGRAR.** Un control que nace roto no detecta nada después:');
      Logger.log('     si ya no cierra ANTES de tocar nada, en la Parte C no distinguiría la');
      Logger.log('     migración de lo que sea que lo esté rompiendo hoy.');
    }
  }

  /* ── 3 · SIN CANARIO, y es correcto ──────────────────────────────────────────────────────
   * `looker` tiene **exactamente diez** marcadores —los ocho del piloto, ya migrados, y estos
   * dos—, así que después de esta tanda **no queda ninguno sin migrar** que pueda hacer de
   * canario. **Lo reemplaza el intervalo corto**, que es lo que destrabó `rdv` el 17/08.
   *
   * ⚠ **No inventar un canario de otra base**: mediría que **esa** base esté quieta, que no es la
   * pregunta. Es la confusión que la tanda 1 casi comete. */
  Logger.log('');
  Logger.log('== 3 · SIN CANARIO, a propósito ==');
  Logger.log('   `looker` tiene 10 marcadores y 8 ya están migrados: no queda ninguno afuera.');
  Logger.log('   Lo reemplaza el INTERVALO CORTO: migrar y volver a correr esto en la MISMA sesión.');
  Logger.log('   ⚠ Un canario de otra base no sirve — mediría esa base, no `looker`.');

  /* ── 4 · EL ESTADO DEL INSTRUMENTO, LO ÚLTIMO QUE SE IMPRIME ─────────────────────────────
   * **Va al final a propósito**: es lo que quedó tapado el 17/08. Y dice explícitamente que la
   * partición cerrando **no cubre** un instrumento a medias, porque ésa es la lectura que hay que
   * impedir — no alcanza con imprimir el aviso, hay que decir qué NO significa el verde de arriba. */
  Logger.log('');
  Logger.log('== 4 · ESTADO DEL INSTRUMENTO — se lee DESPUÉS del veredicto, no antes ==');
  if (!avisos.length) {
    Logger.log('   ✅ Sin avisos: los dos marcadores publican y los operandos se leen.');
  } else {
    Logger.log('   ⚠⚠ ' + avisos.length + ' AVISO(S) — **el veredicto de arriba NO los cubre:**');
    avisos.forEach(function (a) { Logger.log('      · ' + a); });
    Logger.log('   ⚠ Una partición que cierra sobre un instrumento incompleto NO es luz verde.');
    Logger.log('     Arreglar el instrumento y volver a correr ANTES de migrar.');
  }

  Logger.log('');
  Logger.log('== Guardar en docs/_snapshots/TESTIGO_frecuencia_AAAA-MM-DD_HHMM.md CON LA HORA ==');
  Logger.log('   Después: migrarTanda4DeFrecuencia() y volver a correr ESTO en la misma sesión.');
  Logger.log('   ⚠ La migración tiene que reportar 4 celdas (2 marcadores x 2 columnas).');
  Logger.log('     Si dice 0, ahora FALLA con el motivo en vez de seguir: no se migró nada,');
  Logger.log('     y dos testigos idénticos NO prueban que haya reproducido.');
  Logger.log('   ⚠ En la Parte C el orden de lectura se INVIERTE respecto de las tandas 2 y 3:');
  Logger.log('     (1) la partición — si cierra, la migración está bien;');
  Logger.log('     (2) las cuentas de filas;');
  Logger.log('     (3) los valores, que son el dato MÁS DÉBIL: `looker` recalcula dentro de la');
  Logger.log('         ventana. **Un valor distinto NO detiene la tanda si la partición cierra**,');
  Logger.log('         y los operandos dicen si el que se movió fue el numerador o el denominador.');
  t.avisos = avisos;
  return t;
}

/**
 * **Enumera los tokens de la plantilla de `jm` que NO tienen fila en `MARCADORES`.** Sólo lectura.
 *
 * **Por qué hace falta habiendo `censarTokensEnPlantilla`:** aquélla **busca tokens que ya se
 * conocen** —recibe la lista y dice dónde están—, así que no puede contestar *"¿qué hay en la
 * plantilla que nadie cableó?"*. Ésta va al revés: **enumera lo que hay** y cruza contra el
 * registro. Son preguntas distintas y por eso son dos funciones.
 *
 * **Tampoco lo contesta `FALTANTES`**, y la trampa está escrita en `CLAUDE.md` §4: **lista por
 * ítem, no por token**, con sufijo `@<ítem>` — contar ahí mezcla láminas, y de ahí salió una vez
 * un "nueve" que eran diez.
 *
 * ⚠ **LO QUE ESTO MIDE Y LO QUE NO, porque la diferencia es exactamente el error caro del
 * proyecto.** Mide **«sin fila en `MARCADORES`»**. Eso **NO es lo mismo** que *"publica
 * `«FALTA:»`"*:
 *
 *   - un token de una **sección repetible** puede resolverse desde el ítem y no desde `MARCADORES`,
 *     así que aparecería acá sin estar roto — por eso las láminas que iteran salen **marcadas**;
 *   - y al revés, un token **con** fila puede publicar `«FALTA:»` igual si falla en ejecución —hoy
 *     hay diez así—, y **éstos no los ve este censo**.
 *
 * **Quien lea la salida tiene que saber cuál de las dos preguntas contestó.** Es la misma
 * distinción que la columna `config` del catálogo: *"la fila está bien armada"* no es *"el token
 * anda"*.
 *
 * **Las láminas escondidas se cuentan aparte y no se saltean.** `tokensDeSlide_` las descarta a
 * propósito —no se emiten, así que cablearlas es trabajo sobre algo que nadie ve—, pero **un censo
 * tiene que verlas**: la lámina del "1 a 1" puede estar escondida mientras se arma, y decir que no
 * hay nada que cablear ahí sería falso.
 */
function censarTokensSinMarcador_(informeId) {
  informeId = String(informeId || 'jm').trim();
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    Logger.log('FALLÓ: el informe `' + informeId + '` no tiene `plantilla_id`.');
    return { ok: false, motivo: 'sin plantilla_id' };
  }

  // El registro, indexado por nombre. `leerMarcadores_()` trae la hoja entera.
  var conFila = {};
  leerMarcadores_().forEach(function (m) { conFila[m.marcador] = m.informe_id || ''; });

  /* Qué láminas iteran, para poder marcarlas: sus tokens pueden venir del ítem.
   *
   * ⚠ `leerRegistro_` devuelve un **objeto indexado por la clave**, no un arreglo: se recorren sus
   * valores. Tratarlo como arreglo no falla —`undefined.forEach` sí, pero un `{}` vacío no— y
   * dejaría el marcado de láminas que iteran silenciosamente en cero.
   *
   * ⭐ `2026-08-21_6` — **el mapa se indexa por `lamina_id`, no por `orden_plantilla`.**
   *
   * Acá decía `iteran[String(l.orden_plantilla)] = l.itera_sobre`, y el seed de `LAMINAS` lo
   * prohíbe con todas las letras: *"`orden_plantilla` es reportado, NUNCA autoritativo. **Nada del
   * motor puede decidir en base a ese número**"*. **Con dos láminas del mismo orden, una pisaba a
   * la otra en silencio** — y ese caso ya existe: medido el 21/08, `L-052` y `L-035` declaran las
   * dos `orden_plantilla = 6`, porque `L-052` se insertó después y la hoja de `L-035` quedó vieja.
   *
   * **No se disparaba** sólo porque `itera_sobre` está vacío en las 52 filas, así que el `if` nunca
   * entraba. Era un bug esperando la primera fila que lo declarara.
   *
   * **La identidad es el `lamina_id`, y en el deck vive en el ancla de las notas** — que es
   * exactamente para lo que se selló. Una lámina sin ancla no se adivina por posición: se cuenta
   * aparte y el resumen la nombra. */
  var iteran = {};
  var sinAncla = [];
  try {
    var laminas = leerRegistro_('LAMINAS', 'lamina_id');
    Object.keys(laminas).forEach(function (k) {
      var l = laminas[k];
      if (l.informe_id === informeId && String(l.itera_sobre || '').trim() !== '') {
        iteran[String(l.lamina_id || k).trim()] = l.itera_sobre;
      }
    });
  } catch (e) {
    Logger.log('⚠ no pude leer LAMINAS (' + e.message + '): no voy a poder marcar las que iteran.');
  }

  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  Logger.log('== CENSO de tokens SIN FILA en MARCADORES — plantilla de `' + informeId + '`, ' + slides.length + ' láminas ==');
  Logger.log('⚠ «sin fila» NO es «publica FALTA». Ver el encabezado de la función antes de citar esto.');
  Logger.log('');

  var totalSin = 0, totalTokens = 0;
  var sinPorLamina = [];
  var universoSin = {};

  slides.forEach(function (slide, i) {
    var n = i + 1;
    // `2026-08-21_6` — la identidad de la lámina sale del ancla, no de su posición.
    var idLamina = anclaDeLamina_(slide);
    var escondida = esLaminaEscondida_(slide);
    var vistos = {};
    piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
      var m;
      RE_TOKEN_.lastIndex = 0;
      while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) vistos[m[1]] = true;
    });
    var tokens = Object.keys(vistos).sort();
    if (!tokens.length) return;
    totalTokens += tokens.length;

    var sin = tokens.filter(function (t) { return !(t in conFila); });
    if (!sin.length) return;
    sin.forEach(function (t) { universoSin[t] = true; });
    totalSin += sin.length;
    var itera = idLamina ? (iteran[idLamina] || '') : '';
    if (!idLamina) sinAncla.push(n);

    sinPorLamina.push({
      lamina: n, lamina_id: idLamina || '(sin ancla)', escondida: escondida,
      itera: itera, tokens: sin
    });

    Logger.log('  lámina ' + String(n).padStart(2) + ' · ' + (idLamina || '⚠ SIN ANCLA') +
      (escondida ? ' (ESCONDIDA)' : '') +
      (itera ? ' [itera sobre ' + itera + ']' : '') +
      ' — ' + sin.length + ' de ' + tokens.length + ' sin fila:');
    Logger.log('      ' + sin.join(', '));
  });

  Logger.log('');
  Logger.log('== RESUMEN ==');
  Logger.log('  tokens distintos sin fila: ' + Object.keys(universoSin).length +
    ' · apariciones: ' + totalSin + ' sobre ' + totalTokens + ' tokens leídos');
  Logger.log('  láminas con faltantes: ' + sinPorLamina.length);

  /* La lámina más cargada suele ser la respuesta a *"¿de dónde salen tantos?"*, y conviene que el
   * instrumento la nombre en vez de dejar que alguien la deduzca de la lista. */
  var mayor = sinPorLamina.slice().sort(function (a, b) { return b.tokens.length - a.tokens.length; })[0];
  if (mayor) {
    Logger.log('  la que más concentra: lámina ' + mayor.lamina + ' · ' + mayor.lamina_id +
      ' con ' + mayor.tokens.length + (mayor.escondida ? ' (escondida)' : ''));
  }

  /* ⭐ `2026-08-21_6` — **las láminas sin ancla se cuentan y se nombran.**
   *
   * Antes este censo resolvía por posición, así que una lámina sin sellar se veía igual que
   * cualquier otra: se le buscaba el `itera_sobre` por su número y, si alguna fila declaraba ese
   * número, **se lo asignaba a la lámina equivocada**. Ahora no se adivina — y el hueco se
   * declara, que es lo que lo vuelve accionable.
   *
   * El caso está medido: la lámina 8 de `jm` —la del 1 a 1— no tiene ancla ni fila en `LAMINAS`,
   * y `verificarLaminas()` lo venía diciendo sin que nadie lo corriera. */
  if (sinAncla.length) {
    Logger.log('');
    Logger.log('  ⚠ ' + sinAncla.length + ' lámina(s) SIN ANCLA en las notas: ' + sinAncla.join(', '));
    Logger.log('    No están en `LAMINAS` y el censo no puede saber si iteran. **No se resuelven');
    Logger.log('    por posición**: el `orden_plantilla` es reportado, nunca autoritativo. Correr');
    Logger.log('    `verificarLaminas()` para el cuadro completo, y sellar antes de configurarlas.');
  }

  var conIteracion = sinPorLamina.filter(function (l) { return l.itera; });
  if (conIteracion.length) {
    Logger.log('');
    Logger.log('  ⚠ ' + conIteracion.length + ' lámina(s) ITERAN: sus tokens pueden resolverse desde el');
    Logger.log('    ítem y NO estar rotos. No sumarlos a "lo que falta cablear" sin mirarlos:');
    conIteracion.forEach(function (l) {
      Logger.log('      lámina ' + l.lamina + ' sobre ' + l.itera + ' — ' + l.tokens.length + ' token(s)');
    });
  }

  Logger.log('');
  Logger.log('  Para saber qué publica FALTA de verdad hace falta una corrida: es otra pregunta.');
  return { ok: true, por_lamina: sinPorLamina, distintos: Object.keys(universoSin).sort() };
}

/**
 * Los dos botones del censo. **Van sin `_` y SIN PARÁMETROS las dos**, que son las dos
 * condiciones que Apps Script exige para listar una función en el desplegable (`CLAUDE.md` §2).
 * El interior sigue siendo privado y toma el informe; acá sólo se le pasa el valor del caso.
 *
 * ⚠ **`censarTokensSinMarcador()` era la de `jm` y lo sigue siendo**, con el mismo nombre y el
 * mismo resultado: quien ya la tenía en el desplegable no tiene que buscar otra. Lo que cambió es
 * que **el informe dejó de estar clavado adentro** — hasta el 20/08 la función hacía
 * `leerInformes()['jm']` y era **la única de seis** que hardcodeaba el informe, así que censar
 * `secco` era literalmente imposible sin tocar código. Eso trababa la armonización entera.
 */
function censarTokensSinMarcador() {
  return censarTokensSinMarcador_('jm');
}

function censarTokensSinMarcadorSecco() {
  return censarTokensSinMarcador_('secco');
}


/**
 * **Paso 2 de la carga de campañas: ¿los cuatro `Id cuentas` resuelven en las solapas de los
 * `camp_*`?** Sólo lectura, una pasada, tolerante.
 *
 * ⚠ **CAMBIÓ DE OBJETIVO el 19/08. La versión anterior buscaba NOMBRES y la pregunta estaba mal
 * planteada.** El validador midió que **el nombre no sirve como clave**:
 *
 *   - **cuatro solapas dan cuatro grafías distintas** de la misma campaña, y **ninguna coincide
 *     con el deck** — *"Egreso más de 1000 Cadetes"* contra *"Egreso de mil cadetes"*;
 *   - hay espacios finales y mayúsculas inconsistentes **dentro de una misma solapa**;
 *   - y el caso que lo cierra, **que ninguna normalización arregla**: en `digital/Directa Mail` la
 *     fila del 20/07 de la cuenta `3305` tiene el nombre de **otra campaña** —*Vacunación
 *     Antirrábica*— mientras las otras cuatro columnas de esa fila dicen *Egreso de Cadetes*.
 *     **Un filtro por nombre pierde esa fila. Uno por `Id cuentas` no.**
 *
 * **Por eso `CAMPANAS` va a llevar el `Id cuentas` y el nombre queda como etiqueta del deck.** La
 * resolución la hace una persona una vez, al cargar, no el motor cada semana.
 *
 * **Qué mide esto entonces:** para cada id, **cuántas filas encuentra en cada solapa** de las que
 * salen los `camp_*`. No decide nada: dice dónde hay dato y dónde no.
 *
 * ⚠ **Tolerante a propósito.** Una solapa que no mapea `id_cuenta`, o que no se puede leer, **se
 * reporta y no corta la pasada**: el objetivo es la foto completa en una corrida. Cortar en la
 * primera falta obligaría a correrla cinco veces para ver las cinco faltas.
 *
 * **Los ids salen de `docs/CENSO_ids_campanas_2026-08-19.md`** (`looker/Cuentas`, columnas
 * `id_cuentas` y `nombre_campaña`). Están escritos acá porque son **el insumo de esta medición**,
 * no configuración del motor: cuando `CAMPANAS` tenga la columna, salen de la hoja.
 */
function medirCampanasParaCarga() {
  var IDS = [
    { id: '3305-JULSEGGJ', nombre: 'Egreso más de 1000 Cadetes' },
    { id: '3410-JULSEGGJ', nombre: 'Operativo de saturación 1-11-14' },
    { id: '3258-JUNJDGGJ', nombre: 'Decreto: Declaración de servicios esenciales' },
    { id: '3139-JUNDHHGC', nombre: 'Programas y Actividades para personas mayores' }
  ];

  /* Las solapas de donde salen los `camp_*`, medidas sobre `MAPEO_2026-08-18.tsv`.
   * `looker/resumen_metricas_dinamico` es **la** solapa de campañas: una fila por campaña, con las
   * cinco familias de métrica en la misma fila. Las otras dan los desagregados. */
  var DONDE = [
    { base: 'looker', solapa: 'resumen_metricas_dinamico', campo: 'id_cuenta' },
    { base: 'digital', solapa: 'Directa Mail', campo: 'mail_id_cuenta' },
    { base: 'digital', solapa: 'Alcance', campo: 'alc_id_cuenta' },
    { base: 'digital', solapa: 'Directa IVR', campo: 'ivr_id_cuenta' },
    { base: 'digital', solapa: 'Directa SMS', campo: 'sms_id_cuenta' },
    { base: 'digital', solapa: 'Seguimiento digital', campo: 'sd_id_cuenta' },
    { base: 'digital', solapa: 'Digital 2026 acumulado', campo: 'acum_id_cuenta' },
    { base: 'reuniones', solapa: 'Agenda JM', campo: 'id_cuenta' }
  ];

  Logger.log('== ¿Resuelven los cuatro `Id cuentas`? — sólo lectura, una pasada ==');
  Logger.log('Ids de docs/CENSO_ids_campanas_2026-08-19.md (looker/Cuentas).');
  Logger.log('');

  var total = {};
  IDS.forEach(function (c) { total[c.id] = 0; });
  var solapasOk = 0;

  DONDE.forEach(function (d) {
    var etiqueta = d.base + '/' + d.solapa + ' · ' + d.campo;

    if (usoSolapa_(d.base, d.solapa) === 'ignorar') {
      Logger.log('-- ' + etiqueta + ': solapa `ignorar`, NO se lee (CLAUDE.md §2)');
      return;
    }
    var mapa = buscarMapeo(d.base, d.solapa, d.campo);
    if (!mapa || !mapa.columna) {
      Logger.log('-- ' + etiqueta + ': ⚠ el campo NO está en MAPEO — no se puede filtrar por id acá');
      return;
    }
    /* `sin_recorte_por_ventana`: se busca en TODO el histórico. Recortar haría que un id "no
     * resuelva" sólo porque su campaña es de otra semana — la conclusión falsa más fácil de sacar
     * acá, y justo la que dejaría cargar mal. */
    var lectura = leerFuente(d.base, null, d.solapa, { sin_recorte_por_ventana: true });
    if (!lectura || !lectura.ok) {
      Logger.log('-- ' + etiqueta + ': ⚠ no se pudo leer — ' + (lectura && lectura.motivo));
      return;
    }
    solapasOk++;
    var filas = lectura.filas || [];
    var clave = claveDeFila_(filas, d.campo, encabezadoEnColumna_(d.base, d.solapa, mapa.columna));

    Logger.log('-- ' + etiqueta + ' (col ' + mapa.columna + ') — ' + filas.length + ' fila(s)');
    IDS.forEach(function (c) {
      /* `normalizarIdCuenta_` es el canónico de claves de join (`Union.gs`), no
       * `normalizarValorDeclarado_`: es el mismo camino que el motor usa para emparejar cuentas, y
       * medir con otro sería reimplementar peor lo que ya existe. */
      var buscado = normalizarIdCuenta_(c.id);
      var n = 0;
      filas.forEach(function (f) { if (normalizarIdCuenta_(f[clave]) === buscado) n++; });
      total[c.id] += n;
      Logger.log('     ' + c.id + '  ' + (n ? n + ' fila(s)' : '— sin filas') + '   (' + c.nombre + ')');
    });
  });

  Logger.log('');
  Logger.log('== VEREDICTO ==');
  Logger.log('  solapas leídas: ' + solapasOk + ' de ' + DONDE.length);
  var sinDato = [];
  IDS.forEach(function (c) {
    Logger.log('  ' + c.id + ': ' + total[c.id] + ' fila(s) en total — ' + c.nombre);
    if (!total[c.id]) sinDato.push(c.id);
  });
  if (sinDato.length) {
    Logger.log('');
    Logger.log('  ❌ ' + sinDato.length + ' id(s) SIN NINGUNA FILA: ' + sinDato.join(', '));
    Logger.log('     **Decidir antes de cargar.** Un id sin filas cablea marcadores que van a dar');
    Logger.log('     cero sin fallar, que es el modo de falla más caro del proyecto.');
  } else {
    Logger.log('');
    Logger.log('  ✅ los cuatro ids tienen filas. ⚠ Que HAYA filas no dice que los números salgan');
    Logger.log('     bien: eso lo dice comparar contra el deck, y hoy uno de los cuatro números');
    Logger.log('     publicados no reproduce (`X-19`, la frecuencia).');
  }
  if (solapasOk < DONDE.length) {
    Logger.log('  ⚠ Faltaron ' + (DONDE.length - solapasOk) + ' solapa(s): los totales cubren menos');
    Logger.log('    de lo que parece. Ver los avisos de arriba antes de leer el veredicto.');
  }
  Logger.log('');
  Logger.log('== Reportar y parar. La carga la autoriza el usuario. ==');
  return { total: total, sin_dato: sinDato, solapas_leidas: solapasOk };
}

/**
 * **`2026-08-19_1` Parte 0, ítem 9 — las dos fuentes candidatas de `camp_dir_impl` y
 * `camp_dig_impl`.** Sólo lectura. **No cablea nada y no escribe en ninguna hoja.**
 *
 * Son los dos únicos tokens de la lámina 18 **sin fuente**. Esto mide qué hay hoy para que el
 * usuario decida; **cablearlos es otro prompt** y el `2026-08-19_1` lo dice explícitamente.
 *
 * ⚠ **`camp_dig_impl` se lee CRUDO, y hace falta decir por qué.** `CLAUDE.md` §4 prohíbe
 * reimplementar lo que el motor ya hace —ahí el motor gana siempre—. Acá **no hay nada que
 * reimplementar**: `digital/CAMPAÑAS_DESGLOCE_DIGITAL` **no tiene un solo `campo_logico` en
 * `MAPEO`** (medido el 19/08), así que `buscarMapeo` no resuelve y `leerFuente` no puede
 * direccionar ninguna columna. La lectura cruda es **la única vía**, y es legítima porque mide
 * algo que el motor todavía no puede ver. **El día que la solapa entre a `MAPEO`, esto sobra.**
 *
 * ⚠ **Y el ámbito va nombrado entero en todo el reporte**, porque hay DOS solapas que se llaman
 * igual: `digital/CAMPAÑAS_DESGLOCE_DIGITAL` (`uso = fuente`, 4904 filas) y
 * `m2/CAMPAÑAS_DESGLOCE_DIGITAL` (`uso = ignorar`, 4891 filas). Un *"tiene N filas"* sin base es
 * una conclusión que nadie puede verificar — es la regla de los tres nombres parecidos.
 */
function medirFuentesDeImplementaciones() {
  var IDS = ['3305-JULSEGGJ', '3410-JULSEGGJ', '3258-JUNJDGGJ', '3139-JUNDHHGC'];

  Logger.log('== Parte 0 ítem 9 — las dos fuentes sin cablear. SÓLO LECTURA ==');
  Logger.log('');

  /* ── A · `camp_dir_impl` — `digital/Directa Mail`, por la vía normal ─────────────────────
   * Esta sí está mapeada, así que se lee con `leerFuente` + `buscarMapeo` como cualquier otra:
   * **no se inventa un camino cuando el del motor existe.** */
  Logger.log('-- A · camp_dir_impl · digital/Directa Mail (CONTEO por Id cuentas) --');
  var mapaId = buscarMapeo('digital', 'Directa Mail', 'mail_id_cuenta');
  var mapaFecha = buscarMapeo('digital', 'Directa Mail', 'fecha_periodo');
  if (!mapaId || !mapaId.columna) {
    Logger.log('   ⚠ `mail_id_cuenta` no está en MAPEO — no se puede contar por cuenta.');
  } else {
    var lec = leerFuente('digital', null, 'Directa Mail', { sin_recorte_por_ventana: true });
    if (!lec || !lec.ok) {
      Logger.log('   ⚠ no se pudo leer: ' + (lec && lec.motivo));
    } else {
      var filas = lec.filas || [];
      var kId = claveDeFila_(filas, 'mail_id_cuenta', encabezadoEnColumna_('digital', 'Directa Mail', mapaId.columna));
      var kFecha = (mapaFecha && mapaFecha.columna)
        ? claveDeFila_(filas, 'fecha_periodo', encabezadoEnColumna_('digital', 'Directa Mail', mapaFecha.columna))
        : '';
      Logger.log('   ' + filas.length + ' fila(s) en total, sin recorte por ventana');
      IDS.forEach(function (id) {
        var buscado = normalizarIdCuenta_(id);
        var suyas = filas.filter(function (f) { return normalizarIdCuenta_(f[kId]) === buscado; });
        var fechas = kFecha
          ? suyas.map(function (f) { return formatearFecha_(parsearFechaCelda_(f[kFecha])) || '(sin fecha)'; })
          : ['(fecha_periodo no mapeada)'];
        Logger.log('     ' + id + '  CONTEO = ' + suyas.length + '   fechas: ' + fechas.join(' · '));
      });
      Logger.log('   ⚠ El CONTEO es de FILAS de la solapa, no de "implementaciones" — que nadie');
      Logger.log('     declaró todavía qué son. Si una campaña manda dos veces el mismo envío,');
      Logger.log('     son dos filas y una implementación. **Eso lo decide el usuario.**');
    }
  }

  /* ── B · `camp_dig_impl` — `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, CRUDO ───────────────────
   * Sin `MAPEO`, las columnas se ubican **por texto de encabezado normalizado** (`R-10`: colapsa
   * espacios y `trim`, preservando mayúsculas y acentos). Si no aparecen, **se listan los
   * encabezados que sí hay** en vez de devolver cero: un cero sin explicación es indistinguible
   * de "no hay datos", y acá lo probable es que la columna se llame distinto. */
  Logger.log('');
  Logger.log('-- B · camp_dig_impl · digital/CAMPAÑAS_DESGLOCE_DIGITAL (CRUDO, sin MAPEO) --');
  var SOLAPA = 'CAMPAÑAS_DESGLOCE_DIGITAL';
  if (usoSolapa_('digital', SOLAPA) === 'ignorar') {
    Logger.log('   solapa `ignorar` — no se lee.');
    return { ok: false };
  }
  var abierto = abrirHoja('digital', SOLAPA);
  if (!abierto || !abierto.ok) {
    Logger.log('   ⚠ no se pudo abrir: ' + (abierto && abierto.motivo));
    return { ok: false };
  }
  var datos = abierto.hoja.getDataRange().getValues();
  var filaEnc = resolverFilaEncabezado_('digital', SOLAPA, abierto.base.fila_encabezado);
  var headers = datos[filaEnc - 1] || [];
  var cuerpo = datos.slice(filaEnc);

  var norm = function (v) { return normalizarValorDeclarado_(v); };
  var buscarCol = function (alternativas) {
    for (var i = 0; i < headers.length; i++) {
      var hh = norm(headers[i]);
      for (var j = 0; j < alternativas.length; j++) {
        if (hh.toLowerCase() === alternativas[j].toLowerCase()) return i;
      }
    }
    return -1;
  };

  var iId = buscarCol(['Id cuentas', 'ID Cuentas', 'id_cuentas', 'Id Cuenta']);
  var iPlat = buscarCol(['Plataforma', 'plataforma']);

  Logger.log('   ' + cuerpo.length + ' fila(s) de datos · encabezado en fila ' + filaEnc);
  Logger.log('   encabezados: ' + headers.slice(0, 14).map(function (h, i) {
    return String.fromCharCode(65 + i) + '=' + norm(h);
  }).join(' | '));

  if (iId === -1) {
    Logger.log('   ❌ NO encontré la columna de `Id cuentas` por encabezado. **No se puede contar');
    Logger.log('      por cuenta.** Los encabezados están arriba: la columna se llama distinto.');
    return { ok: false };
  }
  Logger.log('   columna de cuenta: ' + String.fromCharCode(65 + iId) + ' "' + norm(headers[iId]) + '"' +
    (iPlat === -1 ? ' · ⚠ NO encontré `Plataforma`' : ' · plataforma: ' + String.fromCharCode(65 + iPlat)));

  IDS.forEach(function (id) {
    var buscado = normalizarIdCuenta_(id);
    var suyas = cuerpo.filter(function (f) { return normalizarIdCuenta_(f[iId]) === buscado; });
    var plats = {};
    if (iPlat !== -1) suyas.forEach(function (f) { var p = norm(f[iPlat]); if (p) plats[p] = (plats[p] || 0) + 1; });
    var lista = Object.keys(plats);
    Logger.log('     ' + id + '  ' + suyas.length + ' fila(s)' +
      (iPlat !== -1 ? '   ' + lista.length + ' plataforma(s): ' +
        (lista.length ? lista.map(function (p) { return p + '(' + plats[p] + ')'; }).join(' · ') : '—') : ''));
  });

  Logger.log('');
  Logger.log('   ⚠ "Formatos digitales implementados" NO es evidentemente ninguna de estas dos');
  Logger.log('     cuentas: puede ser plataformas distintas, piezas distintas, o filas. **Es una');
  Logger.log('     definición del dominio que falta**, y por eso el prompt no lo cablea.');
  Logger.log('');
  Logger.log('== Reportar y parar. Las partes A–E las autoriza el usuario. ==');
  return { ok: true };
}

/**
 * `2026-08-20_7` Parte C punto 2 — **cuántos tokens de cada símbolo debería tener el deck, ANTES
 * de generarlo.**
 *
 * ⭐ **Es el control que no existía, y su ausencia tenía un costo concreto:** un deck lleno de
 * `/////` es hoy indistinguible de un deck que no cableó nada. Con el número escrito antes, la
 * corrida se lee en diez segundos en vez de mirando láminas.
 *
 * **No genera nada y no toca la plantilla.** Cruza tres cosas que ya existen:
 *   - los tokens de la plantilla (`tokensPorSlide_`, que baja a tablas y grupos),
 *   - `MARCADORES` filtrado como lo filtra el motor —`informe_id === informeId || '*'`—,
 *   - y `resolverMarcadores`, que devuelve el `estado` real de cada fila sin escribir un deck.
 *
 * ⚠ **Lo que este control NO puede predecir, dicho para que nadie lea el número como una promesa:**
 *   - **la barrida final.** Si la corrida se corta por presupuesto, tokens que acá cuentan como
 *     número van a salir `/////`. Es un piso, no un pronóstico.
 *   - **las secciones repetibles.** Los conteos son de la pasada de tokens fijos; un token de
 *     sección repetible se emite **una vez por ítem** y acá cuenta una sola vez.
 *   - **los rechazos parciales de `R-18` punto 3**, que publican y además dejan fila en
 *     `FALTANTES`.
 *
 * **Por qué igual sirve con esas tres limitaciones:** las tres hacen que el deck real tenga **más**
 * huecos que lo previsto, nunca menos. Así que **si el deck sale con menos números que este
 * número, algo pasó**; si sale con más, el instrumento está mal.
 */
function preverSimbolosDelDeck_(informeId) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    Logger.log('FALLÓ: el informe `' + informeId + '` no tiene `plantilla_id`.');
    return { ok: false };
  }

  var enPlantilla = Object.keys(tokensPorSlide_(SlidesApp.openById(informe.plantilla_id)));

  // `MARCADORES` como lo ve el motor para ESTE informe: el suyo y los compartidos.
  var suyas = {};
  leerMarcadores_().forEach(function (m) {
    var suyo = String(m.informe_id || '').trim();
    if (suyo === informeId || suyo === '*') suyas[m.marcador] = m;
  });

  var resolucion = resolverMarcadores(informeId);
  var estadoDe = {};
  if (resolucion && resolucion.ok) {
    resolucion.resultados.forEach(function (r) { estadoDe[r.marcador] = r; });
  }

  var cuenta = { numero: 0, entre_guiones: 0, barra: 0, fallo: 0, sin_dato: 0 };
  var detalle = { barra: [], fallo: [], sin_dato: [], entre_guiones: [] };

  enPlantilla.forEach(function (t) {
    var fila = suyas[t];
    if (!fila) { cuenta.barra++; detalle.barra.push(t); return; }

    var r = estadoDe[t];
    var estado = r ? String(r.estado || '') : '';
    if (estado === 'error' || estado === 'REVISAR') { cuenta.fallo++; detalle.fallo.push(t); return; }
    if (estado === 'sin_datos') { cuenta.sin_dato++; detalle.sin_dato.push(t); return; }
    if (estado !== 'ok') { cuenta.barra++; detalle.barra.push(t); return; }

    // Publica. La pregunta que queda es si lo hace con desconfianza declarada.
    var f = String(fila.formato || '').trim().toLowerCase();
    if (f.length > 8 && f.slice(-8) === '_revisar') { cuenta.entre_guiones++; detalle.entre_guiones.push(t); }
    else cuenta.numero++;
  });

  Logger.log('== SÍMBOLOS ESPERADOS · `' + informeId + '` · ' + enPlantilla.length + ' tokens en la plantilla ==');
  Logger.log('   número limpio            : ' + cuenta.numero);
  Logger.log('   -entre guiones-          : ' + cuenta.entre_guiones + '   (publican, con desconfianza declarada)');
  Logger.log('   /////  falta cablearlo   : ' + cuenta.barra);
  Logger.log('   ---    falló             : ' + cuenta.fallo);
  Logger.log('   -      sin dato          : ' + cuenta.sin_dato);
  Logger.log('   ─────────────────────────────');
  Logger.log('   PUBLICAN ALGO            : ' + (cuenta.numero + cuenta.entre_guiones) +
    ' de ' + enPlantilla.length);
  if (detalle.fallo.length) Logger.log('   los `---`: ' + detalle.fallo.sort().join(', '));
  if (detalle.sin_dato.length) Logger.log('   los `-`  : ' + detalle.sin_dato.sort().join(', '));
  Logger.log('');
  Logger.log('   ⚠ Es un PISO, no un pronóstico: la barrida final, las secciones repetibles y los');
  Logger.log('     rechazos parciales sólo pueden AGREGAR huecos. Si el deck sale con menos');
  Logger.log('     números que esto, algo pasó; si sale con más, el instrumento está mal.');

  return { ok: true, informe_id: informeId, en_plantilla: enPlantilla.length, cuenta: cuenta, detalle: detalle };
}

function preverSimbolosJM() { return preverSimbolosDelDeck_('jm'); }

function preverSimbolosSecco() { return preverSimbolosDelDeck_('secco'); }

/**
 * `2026-08-21_11.1` §3 — **el título real de cada lámina DE LA PLANTILLA, con su `lamina_id`.**
 *
 * ⭐ **Existe porque el método que el addendum propone no funciona por posición.** El addendum
 * manda cruzar cada lámina "contra los decks de los informes publicados que están en
 * `docs/_fixtures/`". **Medido el 21/08: el deck publicado de `secco` tiene 61 láminas y su
 * plantilla 29** — el deck sale *expandido*, así que su posición **no** corresponde a `L-0NN`.
 * Indexar el deck por posición asigna la lámina equivocada: la 12 del deck es el "1 a 1" y
 * `L-012` de la plantilla es la de ministros.
 *
 * ⚠ Es el mismo error que `2026-08-21_6` sacó del censo, entrando por otra puerta: **la posición
 * no es la identidad.** Acá el título se lee de la plantilla y el id sale del **ancla**.
 *
 * Sólo lectura: abre las dos plantillas y no escribe nada.
 *
 * Sin `_` y sin parámetros — las dos condiciones para que Apps Script la liste (`CLAUDE.md` §2).
 */
function titularLaminasDeLasPlantillas() {
  var salida = [];
  Object.keys(leerInformes()).forEach(function (informeId) {
    var informe = leerInformes()[informeId];
    if (!informe.plantilla_id) return;
    var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
    Logger.log('== ' + informeId + ' — ' + slides.length + ' láminas en la PLANTILLA ==');
    slides.forEach(function (slide, i) {
      var textos = [];
      piezasDeTextoDeSlide_(slide).forEach(function (p) {
        var t = String(p.texto || '').replace(/\s+/g, ' ').trim();
        // Se saltean las cajas que son sólo tokens: el título es texto fijo.
        if (t && !/^(\{\{[^}]+\}\}\s*)+$/.test(t)) textos.push(t);
      });
      var fila = {
        informe_id: informeId,
        lamina_id: anclaDeLamina_(slide) || '(sin ancla)',
        orden: i + 1,
        escondida: esLaminaEscondida_(slide),
        titulo: textos.slice(0, 3).join(' · ').slice(0, 110)
      };
      salida.push(fila);
      Logger.log('  ' + fila.lamina_id + ' · pos ' + fila.orden + (fila.escondida ? ' (esc)' : '') +
        ' — ' + (fila.titulo || '(sin texto fijo)'));
    });
    Logger.log('');
  });
  return { ok: true, laminas: salida };
}

/* ═══════════ `2026-08-21_11` Parte B — el mapa `lamina_id → seccion_id` de las 53 ═══════════
 *
 * ⭐ **Confirmado por el usuario el 21/08, contra el título real de cada lámina.** El título salió
 * de `titularLaminasDeLasPlantillas()` sobre las **plantillas**, no sobre los decks publicados: el
 * deck de `secco` tiene 61 láminas contra 29 de su plantilla —sale expandido—, así que cruzarlo por
 * posición asigna la lámina equivocada.
 *
 * **El criterio, en dos reglas y en este orden:**
 *
 * 1. ⭐ **La que hoy reclama una sección repetible se le asigna a ESA MISMA.** La asignación
 *    **transcribe el comportamiento medido, no lo reinterpreta** — es lo que hace que esto no sea
 *    una regresión. ⚠ Por eso las ocho de campaña van a `campana` y **no** a las ocho secciones
 *    hijas `campana_*`, que existen y describen exactamente esas ocho láminas por nombre: son
 *    `modo = unica`, y asignarlas ahí **las sacaría del bloque y `campana` dejaría de expandirse**.
 *    Las hijas quedan como documentación. Mismo motivo por el que `L-035` va a `encuentro` y no a
 *    `encuentro_iceberg`.
 * 2. Las demás, a la sección que les corresponde por contenido; y si no había, se creó (Parte A).
 *
 * ⚠ **`secco` `L-004` y `L-005` NO van en `encuentro`** — decisión del usuario, 21/08: son
 * `uno_a_uno_comunas`, sección propia. Con eso el bloque de `encuentro` de `secco` queda **6-7-8**
 * y sigue siendo contiguo.
 */
var MAPA_SECCION_LAMINAS_ = {
  // ── jm ──────────────────────────────────────────────────────────────────────────────────
  'L-030': 'portada',                 // pos 1 · sin texto fijo, sólo {{periodo}}
  'L-031': 'resumen_ejecutivo',       // pos 2 · "Resumen Ejecutivo - JM"
  'L-032': 'resumen_ejecutivo',       // pos 3 · "Resumen Ejecutivo - GCBA"
  'L-033': 'ecv_alcance_semanal',     // pos 4 · "Encuentros con vecinos · Alcance semanal"
  'L-034': 'ecv_alcance_semanal',     // pos 5 · "…alcance semanal por herramienta"
  'L-052': 'encuentro',               // pos 6 · portada del encuentro — va SIEMPRE
  'L-035': 'encuentro',               // pos 7 · el iceberg — filtro tipo!=Uno a uno
  'L-053': 'encuentro',               // pos 8 · el 1 a 1 — filtro tipo=Uno a uno
  'L-036': 'comunicaciones_post',     // pos 9 · "Campañas · DIGITAL · Período"
  'L-037': 'm2',                      // pos 10 · "Comunicaciones M2 · Alcance semanal"
  'L-038': 'm2_status',               // pos 11 · "Directa | Status semanal de M2"
  'L-039': 'm2',                      // pos 12 (escondida) · "M2 · Clics · Audiencia"
  'L-040': 'campana',                 // pos 13 · "Campañas destacadas GCBA"
  'L-041': 'campana',                 // pos 14 · "Campaña destacada {{camp_titulo}}"
  'L-042': 'campana',                 // pos 15 · objetivo y período
  'L-043': 'campana',                 // pos 16 · herramientas y audiencias
  'L-044': 'campana',                 // pos 17 · formatos digitales
  'L-045': 'campana',                 // pos 18 · resultados agregados
  'L-046': 'campana',                 // pos 19 · desagregados Digital
  'L-047': 'campana',                 // pos 20 · desagregados Directa: mail
  'L-048': 'campana',                 // pos 21 (escondida) · desagregados Directa: respuestas
  'L-049': 'analisis_datos',          // pos 22 · "Análisis y datos · INFORME SEMANAL"
  'L-050': 'resumen_ejecutivo',       // pos 23 · "Resumen Ejecutivo · Sentiment" — D-23 lo nombra
  'L-051': 'cierre',                  // pos 24 · "MUCHAS GRACIAS"

  // ── secco ───────────────────────────────────────────────────────────────────────────────
  'L-001': 'portada',                 // pos 1 · "Seguimiento · {{fecha_dia}} de {{fecha_mes}}"
  'L-002': 'indice',                  // pos 2 · "3 · 4 · 5"
  'L-003': 'portada_digital_directa', // pos 3 · "Comunicación Digital y Directa"
  /* ⭐ `2026-08-21_11.2` §1 — **van a `encuentro`, no a `uno_a_uno_comunas`.** Decisión del
   * usuario, 21/08, y el motivo está medido: **`REUNIONES` no tiene `informe_id`**, así que
   * `encuentro` expande **los mismos dos ítems en las dos plantillas**. Con la condición sólo en
   * `jm`, el 1 a 1 de `secco` saldría con el iceberg.
   *
   * Con esto el bloque de `encuentro` de `secco` es **4-5-6-7-8**, verificado contiguo **por el
   * ancla** y no por `orden_plantilla`. */
  'L-004': 'encuentro',               // pos 4 · "Uno a uno en comunas · Comuna {{ecv_comuna}}"
  'L-005': 'encuentro',               // pos 5 · "Plataforma · Objetivo · Alcance"
  'L-006': 'encuentro',               // pos 6 · "Encuentro temático · {{et_nombre}}"
  'L-007': 'encuentro',               // pos 7 · estrategia de comunicación
  'L-008': 'encuentro',               // pos 8 · el iceberg
  'L-009': 'comunicaciones_post',     // pos 9 · "Comunicaciones Post · Semana JM"
  'L-010': 'comunicaciones_post',     // pos 10 · "Digital | Comunicaciones post"
  'L-011': 'ministros',               // pos 11 · "Encuentros de ministros · Métricas"
  'L-012': 'ministros',               // pos 12 · "Encuentros de ministros · Semana del {{periodo}}"
  'L-013': 'm2',                      // pos 13 · "M2 · Alcance semanal"
  'L-014': 'm2_status',               // pos 14 · "Directa | Status semanal de M2"
  'L-015': 'm2_caudal',               // pos 15 · "Caudal semanal de M2"
  'L-016': 'campana',                 // pos 16 · "Campaña destacada {{camp_titulo}}"
  'L-017': 'campana',                 // pos 17 · objetivo y período
  'L-018': 'campana',                 // pos 18 · herramientas y audiencias
  'L-019': 'campana',                 // pos 19 · formatos digitales
  'L-020': 'campana',                 // pos 20 · resultados agregados
  'L-021': 'campana',                 // pos 21 · desagregados Digital
  'L-022': 'campana',                 // pos 22 · desagregados Directa: mail
  'L-023': 'campana',                 // pos 23 (escondida) · desagregados Directa: respuestas
  'L-024': 'analisis_datos',          // pos 24 · "{{fecha_mes}} 2026 · Análisis y Datos"
  'L-025': 'semana_jm_conversacion',  // pos 25 (esc) · "Semana JM - Conversación en X"
  'L-026': 'otros_temas',             // pos 26 (esc) · "xx · xx · xx" — placeholder del equipo
  'L-027': 'impacto_comunicacional',  // pos 27 (esc) · "Repercusiones en X - JM + GCBA"
  'L-028': 'impacto_comunicacional',  // pos 28 (esc) · "Semana JM - Interacción positiva en RRSS"
  'L-029': 'cierre'                   // pos 29 · "¡Muchas gracias!"
};

/** Dry-run: dice qué escribiría y no escribe. Sin `_` y sin parámetros (`CLAUDE.md` §2). */
function preverSeccionIdDeLaminas() {
  var r = escribirColumnaLaminas_(MAPA_SECCION_LAMINAS_, 'seccion_id', { dryRun: true });
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}

/** Escribe de verdad. El detalle por celda del retorno **es el respaldo**. */
function escribirSeccionIdDeLaminas() {
  var r = escribirColumnaLaminas_(MAPA_SECCION_LAMINAS_, 'seccion_id');
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}

/* ═══════════ `2026-08-21_11.1` §2 — `rol`: quién llena cada lámina ═══════════
 *
 * **Decisión del usuario, 21/08.** Muchas láminas son de relleno: el equipo escribe su contenido a
 * mano. Eso **no** es *"no tiene sección"* —siguen perteneciendo a su bloque— sino una propiedad
 * distinta, y la columna para decirlo **ya existía y nunca se había definido**.
 *
 * ⛔ **NINGÚN código lee `rol`, y esto no le da lectores.** Es documentación operativa, y hay que
 * decirlo: **una columna que parece una guarda y no lo es es peor que ninguna.**
 *
 * **El criterio es medible y no se opina:**
 *
 * - una lámina **sin ningún token** → `equipo` — son **13**;
 * - una lámina **con tokens** → `motor` — son **40**.
 *
 * ⚠ **Y el borde que importa: las que tienen tokens y NINGUNO cableado son `motor` igual.** El rol
 * dice quién **debe** llenarla, no quién la llena hoy. Medido el 21/08: **25 de las 40** están en
 * ese caso — entre ellas `L-053` y `L-005`, las dos del "1 a 1", y `L-036` con sus 32 `post_`.
 * Leer `rol = motor` como *"esta lámina publica"* sería exactamente el error que la columna no
 * puede evitar por sí sola.
 */
var MAPA_ROL_LAMINAS_ = {
  'L-001': 'motor',
  'L-002': 'equipo',
  'L-003': 'equipo',
  'L-004': 'motor',
  'L-005': 'motor',
  'L-006': 'motor',
  'L-007': 'motor',
  'L-008': 'motor',
  'L-009': 'equipo',
  'L-010': 'motor',
  'L-011': 'equipo',
  'L-012': 'motor',
  'L-013': 'equipo',
  'L-014': 'motor',
  'L-015': 'equipo',
  'L-016': 'motor',
  'L-017': 'motor',
  'L-018': 'motor',
  'L-019': 'motor',
  'L-020': 'motor',
  'L-021': 'motor',
  'L-022': 'motor',
  'L-023': 'motor',
  'L-024': 'motor',
  'L-025': 'motor',
  'L-026': 'equipo',
  'L-027': 'motor',
  'L-028': 'motor',
  'L-029': 'equipo',
  'L-030': 'motor',
  'L-031': 'motor',
  'L-032': 'motor',
  'L-033': 'equipo',
  'L-034': 'motor',
  'L-035': 'motor',
  'L-036': 'motor',
  'L-037': 'equipo',
  'L-038': 'motor',
  'L-039': 'motor',
  'L-040': 'equipo',
  'L-041': 'motor',
  'L-042': 'motor',
  'L-043': 'motor',
  'L-044': 'motor',
  'L-045': 'motor',
  'L-046': 'motor',
  'L-047': 'motor',
  'L-048': 'motor',
  'L-049': 'equipo',
  'L-050': 'motor',
  'L-051': 'equipo',
  'L-052': 'motor',
  'L-053': 'motor'
};

/** Dry-run del `rol`. Sin `_` y sin parámetros (`CLAUDE.md` §2). */
function preverRolDeLaminas() {
  var r = escribirColumnaLaminas_(MAPA_ROL_LAMINAS_, 'rol', { dryRun: true });
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}

/** Escribe el `rol` de verdad. El detalle por celda del retorno **es el respaldo**. */
function escribirRolDeLaminas() {
  var r = escribirColumnaLaminas_(MAPA_ROL_LAMINAS_, 'rol');
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}

/* ═════ `2026-08-21_11.2` §2 — los `LAMINAS.filtro` de la condición del "1 a 1" ═════
 *
 * ⭐ **Es lo que hace que el 1 a 1 lleve su lámina de plataforma y el resto el iceberg.** La
 * portada va con `filtro` vacío: entra para todos.
 *
 * ⚠ **`tipo!=Uno a uno` y no una enumeración de tipos, por dos motivos medidos:**
 *
 * 1. **`REUNIONES` tiene filas sin `tipo`**, y lo decidido es que lleven iceberg. Con una
 *    enumeración se quedarían sin ninguna lámina — y eso frena la corrida por `D-37` punto 5.
 * 2. **El iceberg es genérico**: `docs/SECCIONES.md` Corrección 5 lo midió sobre informes
 *    publicados — aparece con un ECV, no sólo con el temático.
 *
 * **Las cuatro grafías de `tipo` medidas el 21/08**: `Uno a uno` (6) · `Encuentro Temático` (4,
 * **con tilde**) · `Primera persona` (1) · `Agregado` (2). Las tres últimas caen en
 * `tipo!=Uno a uno`.
 *
 * ⚠ **Y `secco` `L-006`/`L-007` llevan `tipo=Encuentro Temático`, así que un `Primera persona`
 * NO recibe la lámina de estrategia** — le quedan la portada y el iceberg, que son dos, así que el
 * invariante no se rompe. Está dicho porque es el caso que se olvida.
 */
var MAPA_FILTRO_LAMINAS_ = {
  // jm — bloque 6-7-8, contiguo verificado por el ancla
  'L-052': '',                          // portada del encuentro: va para todos
  'L-035': 'tipo!=Uno a uno',           // el iceberg
  'L-053': 'tipo=Uno a uno',            // resultados de plataforma del 1 a 1

  // secco — bloque 4-5-6-7-8, contiguo verificado por el ancla
  'L-004': 'tipo=Uno a uno',            // "Uno a uno en comunas" — portada del 1 a 1
  'L-005': 'tipo=Uno a uno',            // resultados de plataforma
  'L-006': 'tipo=Encuentro Temático',   // portada del temático
  'L-007': 'tipo=Encuentro Temático',   // estrategia de comunicación
  'L-008': 'tipo!=Uno a uno'            // el iceberg
};

/** Dry-run de los filtros. Sin `_` y sin parámetros (`CLAUDE.md` §2). */
function preverFiltroDeLaminas() {
  var r = escribirColumnaLaminas_(MAPA_FILTRO_LAMINAS_, 'filtro', { dryRun: true });
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}

/** Escribe los filtros. El detalle por celda del retorno **es el respaldo**. */
function escribirFiltroDeLaminas() {
  var r = escribirColumnaLaminas_(MAPA_FILTRO_LAMINAS_, 'filtro');
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}
