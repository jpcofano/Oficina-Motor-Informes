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

/**
 * ⭐ **El botón de `diagEnlaceDigitalDeEncuentros_` para la semana `agosto_14_20`.**
 *
 * ⛔ **Sin esto la función no se puede correr, y no es un permiso: no se puede seleccionar.**
 * Apps Script no lista en el desplegable de «Ejecutar» ni las que terminan en `_` —trata el
 * sufijo como privado— **ni las que reciben argumentos**, porque no tiene dónde pedírselos.
 * `diagEnlaceDigitalDeEncuentros_(periodoRef)` falla **las dos** condiciones a la vez.
 *
 * ⚠ **Es la cuarta vez que pasa lo mismo en este repo** (`CLAUDE.md` §2): `diagPlanillaExterna_`,
 * `diffSolapasSinAplicar_`, `censarTokensEnPlantilla(informeId, tokensCsv)` — y ahora ésta. **El
 * síntoma nunca se parece a un error:** la función está pusheada, el código es correcto, y la
 * persona simplemente **no la encuentra en la lista**.
 *
 * ⭐ **Y la salida es la que la regla ya fija: un wrapper SIN argumentos que llama a la que sirve
 * para otros usos**, no cambiarle la firma a aquélla. `diagEnlaceDigitalDeEncuentros_` recibe el
 * `periodoRef` a propósito —sirve para cualquier semana— y eso no se toca.
 *
 * ⚠ **Escribe y tarda ~50 s.** Va por `anclarEncuentros`, que registra en `ANCLAJE_PENDIENTE` los
 * anclajes por debajo del umbral. **Correrla una sola vez y copiar el log entero** antes de hacer
 * cualquier otra cosa: la corrida siguiente pisa el contexto contra el que se lee.
 *
 * **Qué contesta, y por qué hace falta ahora** (`2026-08-22_20` Parte B, addendum): qué cuenta
 * recibió cada ítem de la semana. Los cuatro números de IVR del equipo —96.549 · 304 · 33.139 ·
 * 107.194— el motor **los publica exactos, en la copia equivocada de la lámina**, y con el temario
 * correcto salen `-`. La lámina es la correcta; **la cuenta es la equivocada**, y esto dice cuál
 * recibió cada uno.
 *
 * ⛔ **Y lo que hay que mirar en el log además del reparto:** si el encuentro de Salud aparece en
 * `sinLink`. `ANCLAJE_PENDIENTE` **no lo puede decir** —sólo registra los de baja confianza, así
 * que un encuentro sin cuenta y uno que ancló perfecto se ven idénticos desde la hoja—, y ése es
 * el hueco que bloqueó la medición del 22/08.
 */
function diagEnlaceJM() { return diagEnlaceDigitalDeEncuentros_('agosto_14_20'); }

/**
 * ⭐ **La Parte C.1 del `2026-08-22_25`: el control de VALORES del agregado por temario, sobre
 * `julio_24_30`.**
 *
 * ⭐⭐ **Reproduce números ya validados; no mide de nuevo.** `CLAUDE.md` §1: *un caso `exacto` es un
 * número esperado, y el control es reproducirlo*. Los dos que se comparan salen de
 * `docs/casos_validacion_2026-08-19.csv`, bloque `agregado_semana_jm`:
 *
 *   - **`V-71` — `ecv_inscriptos` = 2333**, `exacto`, con la clave *"los 4 encuentros que el deck
 *     publica individualmente"* y la nota que los desglosa.
 *   - **`ecv_encuentros` = 4**, que es el conjunto que `V-71` declara.
 *
 * ⛔ **Y el control fuerte es el tercero, la IDENTIDAD**: que 2333 sea `138 + 98 + 1344 + 753`,
 * con cada sumando validado por su cuenta —`V-01` San Cristóbal, `V-03` Retiro, Villa Urquiza,
 * `V-05` Orden Público—. **Si el total da 2333 pero un sumando no es el suyo, el número está bien
 * por el camino equivocado**, que es el modo de falla de los `855/186` del 21/08.
 *
 * ⚠ **Esto NO reemplaza una corrida y no lo pretende.** Verifica `resolverMarcadores`, o sea **el
 * valor**; que el deck se expanda, se pinte y salga entero es otra cosa y se ve generando. Se
 * escribe así porque **el valor no necesita un deck** y una corrida de `julio_24_30` cuesta cinco
 * minutos para contestar una pregunta de treinta segundos.
 *
 * ⚠ **ESCRIBE y tarda ~50 s.** Pasa por `anclarEncuentros`, que registra en `ANCLAJE_PENDIENTE` los
 * anclajes por debajo del umbral. Correrla una vez y leer el log entero.
 *
 * ⚠ **`V-38`…`V-44` NO se usan acá, a propósito.** Miden `rdv` recortada por una **ventana de
 * nueve días** —su clave lo dice— y **no el universo del temario**; su nota *"universo del TEMARIO
 * (5 encuentros)"* describe lo que el equipo publicó. Cruzarlos contra esto fue lo que hizo caer al
 * prompt original, y por eso el CSV lleva la advertencia al lado.
 */
function verificarAgregadoDeJulio() {
  /* ⭐ **Instrumentado y con freno propio (22/08/2026), después de morir en el muro.**
   *
   * La primera versión estimaba ~50 s y **no llegó en 360**: el log completo fue *"ventana:
   * 2026-07-24 → 2026-07-30"* y `Exceeded maximum execution time`. **Resolvió el período y nada
   * más.**
   *
   * ⭐⭐ **Y lo que lo vuelve un problema del motor y no de este botón:** el testigo
   * `jm-20260821-234927` generó **el deck entero en 192 s** sobre `agosto_14_20`, que tiene **2**
   * encuentros. Julio tiene **6** no-`Agregado`. **Tres veces el trabajo, más de siete veces el
   * tiempo** — y esto ni siquiera pinta. Si el anclaje escala peor que lineal con la cantidad de
   * encuentros, **toda corrida con temario grande está en riesgo**, no sólo este botón.
   *
   * ⚠ **Este paso MIDE y no optimiza** (instrucción del usuario). Las etapas se cronometran por
   * separado **llamando a las piezas del motor tal como están** — no se toca `anclarEncuentros` ni
   * `encontrarFilaRdvDeReunion_`. Lo que se busca es **dónde se va el tiempo**, no arreglarlo.
   *
   * ⭐ **La sospecha que el orden de las etapas pone a prueba primero, dicha para que el reporte
   * pueda desmentirla:** `encontrarFilaRdvDeReunion_` arma una ventana de UN DÍA por reunión
   * —`{desde: mediodía, hasta: mediodía}`— y `claveCacheLectura_` incluye las dos fechas, así que
   * **cada reunión sería un cache miss y una lectura completa de `rdv`**. Con 6 reuniones, 6
   * lecturas. **Si la medición dice otra cosa, gana la medición.**
   *
   * ⚠ **El freno va ANTES de cada etapa y no dentro del bucle solamente** — es la lección del
   * `2026-08-21_1`: *un presupuesto que sólo se consulta en el bucle no protege las etapas que
   * están fuera del bucle*. Y la reserva existe para que **el reporte salga siempre**: una corrida
   * que muere en el muro no deja nada, que es justo lo que pasó la primera vez.
   */
  var TECHO_SEG = 270;      // debajo del muro de 360, con margen para loguear
  var t0 = new Date().getTime();
  var etapas = [];
  function seg() { return Math.round((new Date().getTime() - t0) / 1000); }
  function marcar(nombre) { etapas.push({ etapa: nombre, al_seg: seg() }); }
  function entra(nombre) {
    if (seg() < TECHO_SEG) return true;
    Logger.log('');
    Logger.log('⛔ CORTE por presupuesto ANTES de "' + nombre + '", a los ' + seg() + ' s de ' + TECHO_SEG + '.');
    reportar('cortado antes de ' + nombre);
    return false;
  }
  function reportar(estado) {
    Logger.log('');
    Logger.log('══════ dónde se fue el tiempo ══════');
    Logger.log('   estado: ' + estado + ' · total ' + seg() + ' s');
    /* ⚠ Que la caché estuvo encendida se dice EN EL REPORTE, no sólo en el código: sin esa línea,
     * el próximo que lea estos tiempos los va a comparar contra los 49 s de la corrida anterior
     * —que fueron sin caché— y va a restar dos cosas distintas, que es exactamente lo que anuló
     * el `_28`. */
    Logger.log('   ⚠ etapas 3 a 7 corrieron con LAS DOS cachés —cacheRegistros_ y cacheDatosHoja_—');
    Logger.log('     igual que dentro de generarInforme. Corridas anteriores: 49 s sin ninguna,');
    Logger.log('     58 s con sólo la de datos (o sea, sin efecto: la que domina es la otra).');
    var previo = 0;
    etapas.forEach(function (e) {
      Logger.log('   ' + e.etapa + ' · terminó a los ' + e.al_seg + ' s · duró ' + (e.al_seg - previo) + ' s');
      previo = e.al_seg;
    });
  }

  Logger.log('== verificarAgregadoDeJulio · instrumentado · techo propio ' + TECHO_SEG + ' s ==');

  var ventana = resolverVentana({ periodo_ref: 'julio_24_30' });
  marcar('1 · resolverVentana');
  if (!ventana.ok) { Logger.log('⛔ ' + ventana.motivo); reportar('sin ventana'); return ventana; }
  Logger.log('   ventana: ' + formatearFecha_(ventana.desde) + ' → ' + formatearFecha_(ventana.hasta) +
    ' (' + ventana.origen + ')');

  if (!entra('2 · leerReuniones_')) return { ok: false, etapas: etapas };
  var todas = leerReuniones_();
  var delPeriodo = todas.filter(function (r) {
    return r.tipo !== 'Agregado' && String(r.periodo_id || '').trim() === 'julio_24_30';
  });
  marcar('2 · leerReuniones_');
  Logger.log('   ' + todas.length + ' con mostrar=sí · ' + delPeriodo.length + ' de julio_24_30 sin Agregado');

  /* ⭐ **La etapa que se mide primero es la sospechada, y de a una reunión por vez**, para que el
   * reporte diga **por reunión** cuánto cuesta y no un promedio. Un promedio no distingue *"todas
   * cuestan 40 s"* de *"una cuesta 200 y el resto nada"*, y son dos arreglos distintos. */
  if (!entra('3 · fila de rdv por reunión')) return { ok: false, etapas: etapas };

  /* ⭐ **La caché de datos se enciende ACÁ y no al principio del botón** (22/08/2026, tras anular
   * el `_28`).
   *
   * ⛔ **El error que esto corrige es de MEDICIÓN, no de código.** La primera corrida murió en el
   * muro y se comparó contra los 33 s del testigo `jm-20260821-234927` — pero ese testigo es
   * `generarInforme`, que **enciende `cacheDatosHoja_`** (`Generador.gs`, con `try/finally`), y
   * este botón corría **fuera** de esa ventana. **Se restaron dos mediciones que no corrieron en
   * las mismas condiciones**, y la diferencia se leyó como *"trabajo por elemento"*. No lo era:
   * `unirDigitalPorCuenta` hace **6 lecturas fijas** con la ventana de la corrida, con dos
   * encuentros o con seis.
   *
   * ⚠ **Se enciende sólo alrededor de las etapas que LEEN, y se apaga en `finally`.** Que la caché
   * esté apagada por defecto es una decisión del `2026-08-20_11` y tiene motivo:
   * *"un diagnóstico que quiera leer dos veces la misma solapa y ver un cambio sigue pudiendo"*.
   * **Un instrumento que la deja encendida de punta a punta deja de ser un instrumento de
   * diagnóstico** — así que se abre lo más tarde posible y se cierra pase lo que pase, incluidos
   * los cortes por presupuesto y el muro.
   *
   * ⭐ **Y con esto la etapa 3 pasa a medir otra cosa, que hay que leer sabiéndolo:** sus seis
   * llamadas **siguen recortando por seis ventanas de un día distintas** —eso es a propósito y no
   * se toca— pero **dejan de releer `rdv` seis veces**.
   *
   * ⛔⛔ **Y SON DOS CACHÉS, no una. Encender sólo `cacheDatosHoja_` fue el MISMO error de
   * medición, cometido por segunda vez el mismo día.** La corrida con una sola encendida dio
   * etapa 3 en **58 s** —contra 49 sin ninguna, o sea sin efecto— y la etapa 4 murió igual, a los
   * 316 s. `generarInforme` enciende **las dos**:
   *
   * ```
   * abrirCacheRegistros_();     // SOLAPAS, MAPEO, BASES — la planilla de control
   * abrirCacheDatosHoja_();     // los datos crudos de las solapas de las bases
   * ```
   *
   * ⭐ **Y la que faltaba es la que domina acá.** `buscarMapeo` **no cachea por su cuenta**: cada
   * llamada relee `SOLAPAS` y `MAPEO` **enteras**. `encontrarFilaRdvDeReunion_` hace tres por
   * reunión, y `unirDigitalPorCuenta` una por canal más las de dimensión — su propio comentario
   * del 04/08 dice que **eso** era lo que la mataba: *"eran ~13.000 lecturas de la planilla de
   * control y se comían los 6 minutos"*. Con `cacheDatosHoja_` sola, el ahorro de no releer las
   * bases queda **tapado** por el costo de releer la planilla de control.
   *
   * ⭐⭐ **La lección, y es la que evita la tercera vez: un instrumento que quiere medir lo que
   * cuesta una corrida no ARMA su preámbulo, lo COPIA.** Reconstruirlo de memoria es adivinar qué
   * prepara `generarInforme`, y adivinar mal deja al instrumento midiendo otra cosa **sin que nada
   * falle**. Las dos líneas de abajo son las mismas dos de `Generador.gs`, en el mismo orden. */
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {

  Logger.log('');
  Logger.log('== 3 · encontrarFilaRdvDeReunion_, una por una · CON LAS DOS cachés ==');
  var conFila = 0;
  for (var i = 0; i < delPeriodo.length; i++) {
    if (seg() >= TECHO_SEG) {
      Logger.log('   ⛔ corte: se midieron ' + i + ' de ' + delPeriodo.length + ' reuniones.');
      marcar('3 · fila de rdv (CORTADO en ' + i + '/' + delPeriodo.length + ')');
      reportar('cortado en la etapa 3');
      return { ok: false, etapas: etapas };
    }
    var tR = new Date().getTime();
    var fr = encontrarFilaRdvDeReunion_(delPeriodo[i]);
    var dur = Math.round((new Date().getTime() - tR) / 1000);
    if (fr.ok) conFila++;
    Logger.log('   ' + (i + 1) + '/' + delPeriodo.length + ' · ' + delPeriodo[i].nombre +
      (delPeriodo[i].etapa ? ' (' + delPeriodo[i].etapa + ')' : '') +
      ' → ' + (fr.ok ? 'fila encontrada' : 'SIN fila') + ' · ' + dur + ' s' +
      (fr.ok && fr.filasEnVentana !== undefined ? ' · ' + fr.filasEnVentana + ' fila(s) en su día' : ''));
  }
  marcar('3 · fila de rdv por reunión');
  Logger.log('   ' + conFila + ' de ' + delPeriodo.length + ' con fila de rdv');

  if (!entra('4 · unirDigitalPorCuenta')) return { ok: false, etapas: etapas };
  var union = unirDigitalPorCuenta(ventana);
  marcar('4 · unirDigitalPorCuenta');
  Logger.log('');
  Logger.log('   unión: ' + (union.ok ? Object.keys(union.porCuenta).length + ' cuenta(s)' : '⛔ ' + union.motivo));

  if (!entra('5 · anclarEncuentros')) return { ok: false, etapas: etapas };
  var anclaje = anclarEncuentros(ventana);
  marcar('5 · anclarEncuentros');
  Logger.log('   anclaje: ' + (anclaje.ok
    ? anclaje.encuentros.length + ' anclados · ' + anclaje.bajaConfianza.length + ' baja confianza · ' +
      anclaje.sinLink.length + ' sinLink'
    : '⛔ ' + anclaje.motivo));

  if (!entra('6 · filasRdvDelTemario_')) return { ok: false, etapas: etapas };
  var temario = filasRdvDelTemario_('jm', ventana);
  marcar('6 · filasRdvDelTemario_');
  Logger.log('   temario: ' + temario.items + ' encuentro(s) · ' + temario.filas.length + ' fila(s)' +
    (temario.sin_fila ? ' · ⚠ ' + temario.sin_fila + ' sin fila' : ''));

  if (!temario.filas.length) {
    Logger.log('⛔ CERO filas: el agregado por temario no se está aplicando. Revisar que');
    Logger.log('   SECCIONES.ecv_alcance_semanal.itera_sobre diga "REUNIONES" EN LA HOJA.');
    reportar('temario sin filas');
    return { ok: false, etapas: etapas };
  }

  if (!entra('7 · resolverMarcadores')) return { ok: false, etapas: etapas };
  var r = resolverMarcadores('jm', {
    ventana: ventana, filas_rdv: temario.filas, hoja_rdv: temario.hoja,
    temario_sin_fila: temario.sin_fila,
    solo_marcadores: ['ecv_inscriptos', 'ecv_encuentros', 'ecv_asistentes', 'ecv_barrios']
  });
  marcar('7 · resolverMarcadores');

  var por = {};
  r.resultados.forEach(function (x) { por[x.marcador] = x; });
  Logger.log('');
  Logger.log('== valores ==');
  ['ecv_inscriptos', 'ecv_encuentros', 'ecv_asistentes', 'ecv_barrios'].forEach(function (m) {
    var x = por[m];
    Logger.log('   ' + m + ' = ' + (x ? x.valor : '(no resolvió)') + (x ? ' · ' + x.estado : ''));
  });

  /* Los cuatro sumandos validados uno por uno. La identidad se mira **antes** que el total: un
   * total correcto sobre los sumandos equivocados es indistinguible de uno correcto. */
  var vi = por.ecv_inscriptos && Number(por.ecv_inscriptos.valor);
  var ve = por.ecv_encuentros && Number(por.ecv_encuentros.valor);
  var okI = vi === 2333, okE = ve === 4;
  Logger.log('');
  Logger.log('== veredicto ==');
  Logger.log('   ecv_inscriptos : ' + vi + ' contra 2333 (V-71) → ' + (okI ? '✅ REPRODUCE' : '⛔ NO'));
  Logger.log('   ecv_encuentros : ' + ve + ' contra 4 → ' + (okE ? '✅ REPRODUCE' : '⛔ NO'));
  if (!okI || !okE) {
    Logger.log('   ⛔ Reportar el obtenido, el esperado y el camino, y PARAR. Un marcador con caso');
    Logger.log('      `exacto` se corrige o se frena, no se publica con desconfianza.');
  }

  reportar(okI && okE ? 'completo · reproduce' : 'completo · NO reproduce');
  return { ok: okI && okE, inscriptos: vi, encuentros: ve, etapas: etapas };

  } finally {
    /* ⚠ **En `finally` y no al final del cuerpo**: arriba hay seis `return` tempranos —los cortes
     * por presupuesto— y cualquiera de ellos dejaría la caché encendida para la próxima función
     * que corra en esta misma invocación. Una caché que sobrevive a su instrumento es peor que no
     * tenerla: el siguiente diagnóstico leería datos viejos sin enterarse. */
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
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

/**
 * ⭐ **`2026-08-21_14` Parte 0 — cuánto de `resolverMarcadores` es FIJO y cuánto por marcador.**
 *
 * La auditoría del 21/08 midió que cada asignación cuesta **14,6 s** y proyectó el ahorro de
 * resolver sólo los marcadores de la lámina suponiendo que **escala con la cantidad**. ⚠ **Esa
 * suposición no estaba medida**, y si buena parte del costo fuera fijo por llamada, el arreglo
 * rendiría mucho menos de lo prometido. Esto la mide antes de escribir una línea.
 *
 * ⭐ **La medición es limpia porque existe un cero natural: `secco` no tiene NINGÚN marcador
 * cableado** —111 filas de `MARCADORES`, las 111 de `jm`—. Así que:
 *
 *   - `resolverMarcadores('secco')` = **el costo fijo puro**: leer `MARCADORES`, `MAPEO`,
 *     `SOLAPAS`, resolver la ventana, armar el resumen. Cero marcadores resueltos.
 *   - `resolverMarcadores('jm')` = **fijo + 111 marcadores**.
 *
 * La resta da el costo por marcador **sin instrumentar nada por dentro**, que es lo que la haría
 * discutible: un instrumento adentro de la función mediría también su propio costo.
 *
 * ⚠ **Se corre dos veces cada uno y se reporta el segundo**: la primera llamada paga el caché de
 * `2026-08-20_11` —`cacheDatosHoja_`— y la segunda mide el régimen, que es el de una corrida con
 * 22 asignaciones. **Reportar la primera como si fuera el costo típico sería medir el arranque.**
 *
 * Sólo lectura: `resolverMarcadores` no escribe nada. Sin `_` y sin parámetros (`CLAUDE.md` §2).
 */
function medirCostoDeResolverMarcadores() {
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  var r = { ok: true };
  try {
    var medir = function (informeId) {
      var t0 = new Date().getTime();
      var res = resolverMarcadores(informeId, {});
      var seg = (new Date().getTime() - t0) / 1000;
      return { seg: seg, marcadores: (res.resultados || []).length };
    };

    var seccoFrio = medir('secco');
    var seccoTibio = medir('secco');
    var jmFrio = medir('jm');
    var jmTibio = medir('jm');

    r.secco = { frio_seg: seccoFrio.seg, tibio_seg: seccoTibio.seg, marcadores: seccoTibio.marcadores };
    r.jm = { frio_seg: jmFrio.seg, tibio_seg: jmTibio.seg, marcadores: jmTibio.marcadores };

    var fijo = seccoTibio.seg;
    var porMarcador = jmTibio.marcadores > 0
      ? (jmTibio.seg - fijo) / jmTibio.marcadores
      : 0;

    r.fijo_seg = Math.round(fijo * 1000) / 1000;
    r.por_marcador_seg = Math.round(porMarcador * 1000) / 1000;
    r.pct_fijo = jmTibio.seg > 0 ? Math.round(100 * fijo / jmTibio.seg) : 0;

    /* ⭐ Lo que la auditoría necesita saber: con 15 marcadores en vez de 111, ¿cuánto queda? */
    r.proyeccion = {
      hoy_una_asignacion_seg: Math.round(jmTibio.seg * 100) / 100,
      con_15_marcadores_seg: Math.round((fijo + porMarcador * 15) * 100) / 100,
      ahorro_pct: jmTibio.seg > 0
        ? Math.round(100 * (jmTibio.seg - (fijo + porMarcador * 15)) / jmTibio.seg)
        : 0
    };

    Logger.log('── costo de resolverMarcadores ──');
    Logger.log('  secco (0 marcadores): frío ' + seccoFrio.seg + ' s · tibio ' + seccoTibio.seg + ' s');
    Logger.log('  jm (' + jmTibio.marcadores + ' marcadores): frío ' + jmFrio.seg + ' s · tibio ' + jmTibio.seg + ' s');
    Logger.log('');
    Logger.log('  COSTO FIJO por llamada: ' + r.fijo_seg + ' s  (' + r.pct_fijo + ' % del total de jm)');
    Logger.log('  COSTO POR MARCADOR: ' + r.por_marcador_seg + ' s');
    Logger.log('');
    Logger.log('  una asignación hoy (111 marcadores): ' + r.proyeccion.hoy_una_asignacion_seg + ' s');
    Logger.log('  con sólo los ~15 de su lámina:       ' + r.proyeccion.con_15_marcadores_seg + ' s');
    Logger.log('  ahorro: ' + r.proyeccion.ahorro_pct + ' %');
    Logger.log('');
    if (r.pct_fijo > 50) {
      Logger.log('  ⛔ MÁS DE LA MITAD ES FIJO. Resolver menos marcadores NO alcanza:');
      Logger.log('     hay que llamar MENOS VECES (cachear por ítem), no resolver menos por vez.');
    } else {
      Logger.log('  ✅ El costo escala con la cantidad de marcadores: resolver sólo los de la');
      Logger.log('     lámina es la salida correcta, y el ahorro proyectado se sostiene.');
    }
  } catch (e) {
    r.ok = false; r.motivo = e.message; r.stack = String(e.stack || '');
    Logger.log('FALLÓ: ' + e.message);
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
  return r;
}

/**
 * `R-30` — **¿el tope de duración está actuando, y a quién sacó?**
 *
 * ⭐ **Existe porque «el tope no está sembrado» y «el tope está y no saca a nadie» producen el
 * MISMO número publicado**, y mandan a trabajos opuestos: sembrar contra volver a medir el
 * criterio. La corrida del 22/08 sobre `agosto_14_20` public\u00f3 `imp_prog` = **24.783.992**, que es
 * el total SIN tope —`2976-MAYPCCVC` aporta 15,4 M y sigue adentro—, y desde el deck **no se puede
 * saber cuál de las dos causas es**.
 *
 * ⚠ **La sospecha que este bot\u00f3n pone a prueba primero, dicha para que el reporte pueda
 * desmentirla:** `CONFIG` **s\u00f3lo siembra lo ausente** y el sembrador es el \u00edtem de men\u00fa
 * **«Aplicar configuraci\u00f3n»**, no `instalar()`. Un `clasp push` lleva el `SEED_*` al proyecto y
 * **no escribe una sola celda de la hoja**. Si la medici\u00f3n dice otra cosa, gana la medici\u00f3n.
 *
 * Sin par\u00e1metros y sin `_`, para que aparezca en el desplegable (`CLAUDE.md` \u00a72).
 */
function diagTopeDeVentana() {
  Logger.log('== R-30 \u00b7 \u00bfel tope de ventana est\u00e1 actuando? ==');

  var crudo = leerConfig().tope_dias_ventana_cuenta;
  Logger.log('   CONFIG.tope_dias_ventana_cuenta = ' + JSON.stringify(crudo) +
    '  (typeof ' + (typeof crudo) + ')');
  Logger.log('   topeDiasVentanaCuenta_() = ' + topeDiasVentanaCuenta_());
  Logger.log('   el seed declara: ' + (SEED_CONFIG_DEFAULTS_.tope_dias_ventana_cuenta || '(nada)'));

  if (!topeDiasVentanaCuenta_()) {
    Logger.log('');
    Logger.log('\u26d4 EL TOPE EST\u00c1 DESACTIVADO. El default del c\u00f3digo es 0 a prop\u00f3sito, as\u00ed que');
    Logger.log('   ninguna instalaci\u00f3n sin la clave sembrada mueve n\u00fameros en silencio.');
    Logger.log('   \u2192 Correr el \u00edtem de men\u00fa "Aplicar configuraci\u00f3n" (NO alcanza `instalar()`,');
    Logger.log('     que crea y repara hojas pero no siembra), y volver a correr esto.');
  }

  var ventana = resolverVentana({ periodo_ref: 'agosto_14_20' });
  if (!ventana.ok) { Logger.log('\u26d4 ' + ventana.motivo); return ventana; }
  Logger.log('');
  Logger.log('   ventana: ' + formatearFecha_(ventana.desde) + ' \u2192 ' + formatearFecha_(ventana.hasta));

  /* Las dos solapas que hoy toman la ventana prestada. Se descubren leyendo `SOLAPAS`, no de una
   * lista escrita ac\u00e1: si ma\u00f1ana hay una tercera, este diagn\u00f3stico la tiene que ver sola. */
  /* ⛔ **`leerSolapas()` devuelve un MAPA ANIDADO `{base_id: {solapa: {...}}}`, no un array**, y la
   * primera versión de esto le hacía `.forEach` directo — `TypeError` en la corrida del 22/08.
   *
   * ⭐ **El grep que sigue a un bug así, y su resultado, porque el cero también se escribe:** se
   * revisaron **los 18 consumidores** de `leerSolapas()` y **éste era el único** que lo trataba como
   * lista. **No es un lector con dos formas de retorno** —la sospecha razonable— **es un consumidor
   * mal escrito**, y la forma está documentada desde siempre en `Config.gs:15`.
   *
   * ⚠ **Lo que sí explica la confusión, y es la familia de `CLAUDE.md` §4 —*dos cosas que se llaman
   * igual no son la misma cosa*—:** existe `leerFilasSolapas_(hoja)` en `Solapas.gs`, que **sí
   * devuelve una lista**. Dos funciones con nombres casi iguales y formas distintas. */
  var registradas = leerSolapas();
  var conRef = [];
  Object.keys(registradas).forEach(function (baseId) {
    Object.keys(registradas[baseId]).forEach(function (solapa) {
      var s = registradas[baseId][solapa];
      if (String(s.uso || '').trim() === 'ignorar') return; // `CLAUDE.md` §2: no se tocan
      /* ⚠ `2026-08-28` — `ventana_ref = 'propia'` **no es un nombre de solapa**: declara que la
       * solapa se recorta por sus propias fechas aunque la base sea `snapshot`. Sin esta guarda,
       * este diagnóstico buscaría una solapa llamada «propia» y reportaría un cruce roto que no
       * existe. */
      var ref = referenciaDeVentana_(baseId, solapa);
      if (ref && String(ref).trim().toLowerCase() !== VENTANA_PROPIA_) {
        conRef.push({ base_id: baseId, solapa: solapa });
      }
    });
  });
  Logger.log('   solapas con `ventana_ref`: ' + conRef.length);

  conRef.forEach(function (s) {
    var c = conjuntoDeClavesEnVentana_(s.base_id, referenciaDeVentana_(s.base_id, s.solapa), ventana);
    Logger.log('');
    Logger.log('   \u2500\u2500 ' + s.base_id + '/' + s.solapa + ' \u2192 referencia ' +
      referenciaDeVentana_(s.base_id, s.solapa));
    if (!c.ok) { Logger.log('      \u26d4 ' + c.motivo); return; }
    Logger.log('      claves en ventana : ' + c.tamano + ' de ' + c.tamano_universo);
    Logger.log('      tope_dias_aplicado: ' + c.tope_dias_aplicado +
      (c.tope_dias_aplicado ? '' : '   \u2190 0 = DESACTIVADO, distinto de "activo y no sac\u00f3 a nadie"'));
    Logger.log('      fuera por tope    : ' + c.filas_ref_fuera_por_tope);
    var quienes = Object.keys(c.claves_fuera_por_tope || {});
    quienes.sort(function (a, b) { return c.claves_fuera_por_tope[b] - c.claves_fuera_por_tope[a]; });
    quienes.slice(0, 15).forEach(function (k) {
      Logger.log('         ' + k + '  \u00b7 ' + c.claves_fuera_por_tope[k] + ' d\u00edas');
    });
    if (quienes.length > 15) Logger.log('         \u2026 y ' + (quienes.length - 15) + ' m\u00e1s');
    if (c.tope_dias_aplicado && quienes.indexOf('2976-MAYPCCVC') === -1 && s.solapa === 'DIGITAL') {
      Logger.log('      \u26a0 2976-MAYPCCVC NO est\u00e1 en la lista y deber\u00eda: es la de 210 d\u00edas.');
    }
  });

  Logger.log('');
  Logger.log('\u2b50 C\u00d3MO SE LEE: `tope_dias_aplicado: 0` = desactivado (falta sembrar).');
  Logger.log('   `tope_dias_aplicado: 90` con `fuera por tope: 0` = activo y no sac\u00f3 a nadie,');
  Logger.log('   que ser\u00eda un hallazgo distinto y mandar\u00eda a revisar el criterio, no la siembra.');
  return { ok: true, tope: topeDiasVentanaCuenta_() };
}


/**
 * `X-32` — **¿dónde se trunca la frecuencia?** Numerador, denominador, valor crudo del `RATIO` y
 * valor después del formato, para `frecuencia` y `gcba_frecuencia`.
 *
 * ⭐ **Existe porque la anomalía es más fuerte que la definición.** Con `formato = numero`, que hace
 * `Math.round(v*100)/100`, sacar **exactamente `6`** y después **exactamente `6.1`** cae en bandas
 * de **1 % de ancho** dos veces seguidas. Eso es demasiada coincidencia: **algo está truncando a un
 * decimal y no se encontró dónde leyendo el código.** Las tres etapas se imprimen por separado
 * porque **cada una acusa a un culpable distinto**:
 *
 * | si el corte aparece en… | el culpable es |
 * |---|---|
 * | `numerador` o `denominador` | **la fuente** — la columna ya viene redondeada |
 * | `valor crudo` del `RATIO` | **la operación** — `opRATIO` no divide como se cree |
 * | sólo el valor final | **el formato** — y entonces `numero` no es lo que se leyó |
 *
 * ⛔ **Y el criterio fácil está descartado de antemano por `X-19`: «que reproduzca el deck» NO
 * puede decidir esto.** El deck del equipo publica **8,4** donde la cuenta da **8,89** — o sea que
 * **el equipo también se equivoca**. Si el motor truncara para parecerse, **heredaría el error del
 * equipo sin dejar rastro**, que es peor que la diferencia.
 *
 * ⚠ **No toca nada.** Sólo lectura: resuelve los dos marcadores y muestra las etapas.
 *
 * Sin parámetros y sin `_`, para que aparezca en el desplegable (`CLAUDE.md` §2).
 */
function diagTrazaDeFrecuencia() {
  Logger.log('== X-32 · dónde se trunca la frecuencia ==');

  var ventana = resolverVentana({ periodo_ref: 'agosto_14_20' });
  if (!ventana.ok) { Logger.log('⛔ ' + ventana.motivo); return ventana; }
  Logger.log('   ventana: ' + formatearFecha_(ventana.desde) + ' → ' + formatearFecha_(ventana.hasta));

  /* Mismo preámbulo que `generarInforme`, verbatim. `CLAUDE.md` §4: un instrumento que mide una
   * corrida COPIA su preámbulo, no lo arma — y acá además evita 13.000 lecturas de la planilla. */
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    var r = resolverMarcadores('jm', {
      ventana: ventana,
      solo_marcadores: ['frecuencia', 'gcba_frecuencia', 'imp_total', 'gcba_imp_total']
    });

    var por = {};
    r.resultados.forEach(function (x) { por[x.marcador] = x; });

    ['frecuencia', 'gcba_frecuencia'].forEach(function (m) {
      var x = por[m];
      Logger.log('');
      Logger.log('── ' + m + ' ──');
      if (!x) { Logger.log('   (no resolvió)'); return; }

      Logger.log('   estado          : ' + x.estado);
      /* Los operandos NO son campos del resultado: viven en la traza, y se leen con
       * `operandosDeRatio_` (`Auditoria.gs`), que YA existe y ya aprendio la trampa del 17/08
       * —los nombres llevan espacios, `dig_impresiones (col H)`—. Reimplementar el parseo aca
       * seria el instrumento que reproduce logica del motor y la reproduce peor (`CLAUDE.md` §4). */
      var ops = operandosDeRatio_(x.traza);
      if (ops && ops.ok) {
        Logger.log('   numerador       : ' + ops.numerador);
        Logger.log('   denominador     : ' + ops.denominador);
        Logger.log('   division a mano : ' + (ops.denominador ? (ops.numerador / ops.denominador).toFixed(10) : '(cero)'));
      } else {
        Logger.log('   ⚠ no se pudieron leer los operandos de la traza — puede haber cambiado su formato');
      }
      Logger.log('   VALOR CRUDO     : ' + JSON.stringify(x.valor) + '   (typeof ' + (typeof x.valor) + ')');
      /* ⚠ El crudo se imprime con TODOS sus decimales antes de cualquier formato. Si acá ya
       * viene con uno, el corte NO es del formato y hay que mirar la fuente o la operación. */
      if (typeof x.valor === 'number') {
        Logger.log('   crudo sin cortar: ' + x.valor.toFixed(10));
        Logger.log('   round a 2 (lo que hace `numero`) : ' + (Math.round(x.valor * 100) / 100));
        Logger.log('   truncado a 1 (lo que dice V-72)  : ' + (Math.floor(x.valor * 10) / 10));
      }
      Logger.log('   formato declarado: ' + x.formato);
      Logger.log('   VALOR PUBLICADO  : ' + formatearValorMarcador_(x.valor, x.formato));
      if (x.traza) Logger.log('   traza: ' + x.traza);
    });

    Logger.log('');
    Logger.log('⭐ CÓMO SE LEE, y cada línea acusa a otro:');
    Logger.log('   · si `numerador` o `denominador` ya vienen con pocos decimales → LA FUENTE');
    Logger.log('   · si el CRUDO tiene un solo decimal → LA OPERACIÓN (opRATIO no divide plano)');
    Logger.log('   · si el crudo tiene muchos y el publicado uno → EL FORMATO');
    Logger.log('');
    Logger.log('⛔ Y NO se decide por «cuál se parece al deck»: X-19 mide que el equipo publica');
    Logger.log('   8,4 donde la cuenta da 8,89. Truncar para parecerse hereda el error del equipo.');
    return { ok: true };
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}


/**
 * `2026-08-22` — **por qué los tres `ecv_barrio*` publican `---`.** Trae **el motivo**, que es lo
 * único que decide, en vez de deducirlo del símbolo.
 *
 * ⛔ **`---` significa «falló», no «sin dato»**, y el despachador **ya tiene el motivo**: envuelve
 * la excepción en `operacion "ELEMENTO" falló: <mensaje>` y la deja en `traza`. **El síntoma está
 * escrito y nadie lo estaba leyendo** — es la misma familia que el `P2` de `comunicaciones_post`,
 * que el motor reportaba y nadie miraba.
 *
 * ⚠ **Por qué no alcanzó el control de `node`:** `tools/probar-elemento.js` corre 32 afirmaciones,
 * **seis de ellas por el despachador**, y **todas pasan**. Con el catálogo presente el camino
 * funciona. Así que lo que falla está **antes de la operación**, en cómo el marcador llega — y eso
 * sólo se ve contra las hojas vivas.
 *
 * **Qué imprime, y cada línea acusa a un culpable distinto:**
 *
 * | si falla en… | el culpable es |
 * |---|---|
 * | la fila de `MARCADORES` | el alta — `curarMarcadores_` no escribió alguna columna |
 * | `resolverCatalogoDeMarcador_` | el catálogo — `rdv/Comunas` no resuelve |
 * | `despacharOperacion_` | la operación — y el motivo lo dice |
 *
 * ⭐ **Compara contra `ecv_barrios`, que SÍ publica en la misma lámina y la misma corrida.** Las
 * dos filas difieren en tres columnas y nada más; el diff las pone al lado.
 *
 * Sin parámetros y sin `_`, para el desplegable (`CLAUDE.md` §2).
 */
function diagBarriosIndexados() {
  Logger.log('== por qué ecv_barrio1-3 publican --- ==');

  var COLS = ['marcador', 'familia', 'informe_id', 'base_id', 'solapa', 'campo_logico',
    'operacion', 'valor_fijo', 'filtro', 'dimensiones', 'formato', 'catalogo', 'separador'];
  var reg = leerRegistro_('MARCADORES', 'marcador');

  Logger.log('');
  Logger.log('1 · LAS FILAS, la que anda y las tres que no');
  ['ecv_barrios', 'ecv_barrio1', 'ecv_barrio2', 'ecv_barrio3'].forEach(function (m) {
    var f = reg[m];
    if (!f) { Logger.log('   ⛔ ' + m + ' — NO TIENE FILA en MARCADORES'); return; }
    var partes = COLS.map(function (c) { return c + '=' + JSON.stringify(f[c]); });
    Logger.log('   ' + m + ':');
    Logger.log('      ' + partes.join(' · '));
  });

  /* ⚠ El diff explícito: mirar dos listas largas y encontrar la diferencia a ojo es exactamente
   * como se pasan por alto. Se calcula, no se lee. */
  Logger.log('');
  Logger.log('2 · EN QUÉ DIFIEREN de ecv_barrios (que sí publica)');
  var base = reg['ecv_barrios'];
  if (base) {
    ['ecv_barrio1', 'ecv_barrio2', 'ecv_barrio3'].forEach(function (m) {
      var f = reg[m];
      if (!f) return;
      var difs = COLS.filter(function (c) { return String(base[c]) !== String(f[c]); })
        .map(function (c) { return c + ': "' + base[c] + '" → "' + f[c] + '"'; });
      Logger.log('   ' + m + ': ' + (difs.length ? difs.join(' · ') : '(idénticas)'));
    });
  }

  Logger.log('');
  Logger.log('3 · EL CATÁLOGO — resolverCatalogoDeMarcador_ para cada una');
  ['ecv_barrios', 'ecv_barrio1'].forEach(function (m) {
    var f = reg[m];
    if (!f) return;
    var cat = resolverCatalogoDeMarcador_(f);
    Logger.log('   ' + m + ': ok=' + cat.ok +
      (cat.ok ? ' · ' + (cat.catalogo.lista || []).length + ' entrada(s) · origen ' + cat.catalogo.origen
              : ' · ⛔ ' + cat.motivo));
  });

  Logger.log('');
  Logger.log('4 · LA RESOLUCIÓN REAL, con el motivo entero');
  var ventana = resolverVentana({ periodo_ref: 'agosto_14_20' });
  if (!ventana.ok) { Logger.log('   ⛔ ' + ventana.motivo); return ventana; }

  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    var r = resolverMarcadores('jm', {
      ventana: ventana,
      solo_marcadores: ['ecv_barrios', 'ecv_barrio1', 'ecv_barrio2', 'ecv_barrio3']
    });
    r.resultados.forEach(function (x) {
      Logger.log('   ── ' + x.marcador + ' · estado=' + x.estado);
      Logger.log('      valor: ' + JSON.stringify(x.valor));
      Logger.log('      traza: ' + x.traza);
    });
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }

  Logger.log('');
  Logger.log('⭐ CÓMO SE LEE: el motivo del --- está en `traza`, después de');
  Logger.log('   «operacion "ELEMENTO" falló: ». Ese texto es la respuesta, no el símbolo.');
  Logger.log('⚠ Si el punto 3 dice ok=false para ecv_barrio1 y ok=true para ecv_barrios,');
  Logger.log('   el problema es la COLUMNA catalogo de la fila, no la operación.');
  return { ok: true };
}

/**
 * ⭐⭐ `diagL046()` — por qué los 18 de `L-046` salen `/////` teniendo fila, y dónde quedó
 * `{{camp_meta_frecuencia}}`. Público y sin parámetros. **Sólo lee.**
 *
 * ### Lo que ya dice el código, y es lo que hace que este diagnóstico apunte donde apunta
 *
 * `textoFaltante_` (`Generador.gs`) devuelve `/////` **en un solo caso relevante: cuando NO hay
 * resultado para el token.** Un marcador que tiene fila y falla al leer vuelve con `estado`, y
 * eso pinta `---` (error) o `-` (sin dato) — **nunca `/////`**.
 *
 * ⇒ **`/////` sobre un token cableado significa que `resolverMarcadores` no devolvió nada para
 * él**, y esa función tiene exactamente **dos** filtros: `informe_id` (`=== informeId` o `'*'`) y
 * `solo_marcadores`. El segundo no puede ser —la lista sale de los tokens de esa misma lámina—,
 * así que **o el `informe_id` de la fila no matchea, o el texto de `marcador` no es idéntico al
 * del token.**
 *
 * ⚠ **Es una predicción, no una conclusión**, y esta función existe para falsarla: si algún
 * marcador vuelve con `estado` en vez de ausente, **la lectura de arriba está mal y eso es el
 * hallazgo**.
 *
 * ### Bloque 2 — la plantilla, celda por celda
 *
 * `camp_meta_frecuencia` no se puede ubicar desde `MARCADORES`: hay que mirar **dónde está el
 * `{{token}}`**. Este bloque recorre `L-046` **forma por forma y celda por celda de tabla**, así
 * que dice **exactamente qué celda tiene qué token** — que es lo único que permite decir cuál
 * tocar.
 */
function diagL046() {
  var LOS_18 = [
    'camp_meta_impresiones', 'camp_meta_vistas', 'camp_meta_clics', 'camp_meta_ctr', 'camp_meta_vtr',
    'camp_google_impresiones', 'camp_google_vistas', 'camp_google_clics', 'camp_google_ctr', 'camp_google_vtr',
    'camp_prog_impresiones', 'camp_prog_vistas', 'camp_prog_clics', 'camp_prog_ctr', 'camp_prog_vtr',
    'camp_ctr', 'camp_vtr', 'camp_meta_frecuencia'
  ];
  // Los que SÍ publicaron en la corrida. Son el control positivo: si éstos aparecen igual que los
  // 18, el instrumento está midiendo mal y no hay que creerle nada.
  var LOS_QUE_ANDAN = ['camp_impresiones', 'camp_alcance', 'camp_frecuencia', 'camp_clics', 'camp_visualizaciones'];

  Logger.log('== diagL046 · BLOQUE 1 — la fila cruda en MARCADORES ==');
  Logger.log('⚠ El informe_id va con JSON.stringify a propósito: un espacio o un salto invisible');
  Logger.log('  se ve igual que "jm" en la celda y NO matchea en el filtro.');
  Logger.log('');

  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MARCADORES');
  if (!hoja) { Logger.log('⛔ no existe la hoja MARCADORES'); return { ok: false }; }
  var datos = hoja.getDataRange().getValues();
  var hs = datos[0];
  var iMar = hs.indexOf('marcador'), iInf = hs.indexOf('informe_id');
  var iFam = hs.indexOf('familia'), iBase = hs.indexOf('base_id'), iSol = hs.indexOf('solapa');
  var iOp = hs.indexOf('operacion');

  var porNombre = {};
  for (var f = 1; f < datos.length; f++) {
    var nom = String(datos[f][iMar]);
    if (!porNombre[nom]) porNombre[nom] = [];
    porNombre[nom].push(datos[f]);
  }

  var sinFila = [], infRaro = [], conFila = 0;
  LOS_18.concat(LOS_QUE_ANDAN).forEach(function (m) {
    var filas = porNombre[m] || [];
    var esperado = LOS_18.indexOf(m) !== -1 ? '18' : 'anda';
    if (!filas.length) {
      Logger.log('  ⛔ ' + m + ' (' + esperado + ') — SIN FILA en MARCADORES');
      sinFila.push(m);
      return;
    }
    conFila++;
    filas.forEach(function (fila) {
      var inf = fila[iInf];
      var ok = (typeof inf === 'string') && inf === 'jm';
      if (!ok) infRaro.push(m + ' → ' + JSON.stringify(inf));
      Logger.log('  ' + (ok ? '✅' : '⛔') + ' ' + m + ' (' + esperado + ')' +
        ' · informe_id=' + JSON.stringify(inf) + ' [' + (typeof inf) + ']' +
        ' · familia=' + JSON.stringify(fila[iFam]) +
        ' · ' + fila[iBase] + '/' + fila[iSol] + ' · ' + fila[iOp] +
        ' · marcador=' + JSON.stringify(String(fila[iMar])));
    });
  });

  Logger.log('');
  Logger.log('== BLOQUE 2 — qué devuelve resolverMarcadores para los 18 ==');
  Logger.log('⚠ Se llama SIN ítem, así que lo que lea por cuenta va a fallar — y eso está bien:');
  Logger.log('  lo que se mide acá es si el marcador APARECE en el resultado, no su valor.');
  Logger.log('');
  var r = resolverMarcadores('jm', { solo_marcadores: LOS_18.concat(LOS_QUE_ANDAN) });
  var vistos = {};
  (r.resultados || []).forEach(function (x) { vistos[x.marcador] = x; });

  var ausentes = [];
  LOS_18.concat(LOS_QUE_ANDAN).forEach(function (m) {
    var x = vistos[m];
    if (!x) { ausentes.push(m); Logger.log('  ⛔ ' + m + ' — AUSENTE del resultado → pinta /////'); return; }
    Logger.log('  ✅ ' + m + ' — vuelve con estado=' + x.estado + ' → pintaría ' +
      (x.estado === 'ok' ? 'el valor' : (x.estado === 'sin_datos' ? '«-»' : '«---»')));
  });

  Logger.log('');
  Logger.log('== VEREDICTO DEL BLOQUE 1+2 ==');
  Logger.log('  con fila en MARCADORES : ' + conFila + ' de ' + (LOS_18.length + LOS_QUE_ANDAN.length));
  Logger.log('  sin fila               : ' + sinFila.length + (sinFila.length ? ' → ' + sinFila.join(', ') : ''));
  Logger.log('  informe_id sospechoso  : ' + infRaro.length + (infRaro.length ? ' → ' + infRaro.join(' · ') : ''));
  Logger.log('  ausentes del resultado : ' + ausentes.length + (ausentes.length ? ' → ' + ausentes.join(', ') : ''));
  Logger.log('');
  if (!ausentes.length) {
    Logger.log('  ⭐⭐ NINGUNO AUSENTE. Entonces la lectura del símbolo estaba MAL y eso es el');
    Logger.log('     hallazgo: los 18 tienen fila, resuelven, y el ///// vino por otro lado.');
    Logger.log('     Mirar FALTANTES: su columna motivo trae el estado y la traza de cada uno.');
  } else {
    Logger.log('  ⭐ Los ausentes son la causa del /////. Si su fila existe y su informe_id dice');
    Logger.log('     "jm", el que no matchea es el TEXTO del marcador — comparar los');
    Logger.log('     JSON.stringify de arriba contra el token de la plantilla, abajo.');
  }

  Logger.log('');
  Logger.log('== BLOQUE 3 — L-046 en la plantilla, celda por celda ==');
  Logger.log('⚠ Esto es lo único que puede decir QUÉ CELDA tocar. El resto son suposiciones.');
  Logger.log('');

  // ⛔ `leerInformes()`, NO `leerRegistro_('INFORMES')`. Sin la clave primaria,
  // `leerRegistroSinCache_` hace `fila[headers.indexOf(undefined)]` -> `fila[-1]` -> `undefined`,
  // y `if (!clave) return` **saltea todas las filas**: devuelve `{}` sin fallar. Medido el 23/08.
  var informe = leerInformes()['jm'];
  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  var objetivo = null, posicion = 0;
  slides.forEach(function (sl, i) {
    if (anclaDeLamina_(sl) === 'L-046') { objetivo = sl; posicion = i + 1; }
  });
  if (!objetivo) {
    Logger.log('⛔ no encontré L-046 por su ancla en las notas del orador.');
    return { ok: false, motivo: 'L-046 sin ancla' };
  }
  Logger.log('  L-046 es la lámina ' + posicion + ' de ' + slides.length + '.');

  var celdas = [];
  objetivo.getShapes().forEach(function (sh, k) {
    var t = '';
    try { t = sh.getText().asString(); } catch (e) { return; }
    var toks = (t.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || []);
    if (toks.length) celdas.push({ donde: 'forma ' + (k + 1), tokens: toks.join(' ') });
  });
  objetivo.getTables().forEach(function (tabla, nt) {
    for (var fi = 0; fi < tabla.getNumRows(); fi++) {
      for (var ci = 0; ci < tabla.getNumColumns(); ci++) {
        var txt = '';
        try { txt = tabla.getCell(fi, ci).getText().asString(); } catch (e) { continue; }
        var tk = (txt.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || []);
        if (tk.length) {
          celdas.push({
            donde: 'tabla ' + (nt + 1) + ' · fila ' + (fi + 1) + ' · col ' + (ci + 1),
            tokens: tk.join(' ')
          });
        }
      }
    }
  });

  celdas.forEach(function (c) { Logger.log('  ' + c.donde + '  →  ' + c.tokens); });
  Logger.log('');
  Logger.log('  ' + celdas.length + ' celda(s)/forma(s) con token en L-046.');
  Logger.log('  ⭐ Buscar camp_meta_frecuencia acá: dice en qué fila y columna quedó.');
  Logger.log('  ⭐ Y mirar qué token tiene la celda de la fila Meta, columna Frecuencia.');

  return { ok: true, sin_fila: sinFila, ausentes: ausentes, informe_id_sospechoso: infRaro, celdas: celdas };
}

/**
 * ⭐ `diagDondeVivenLosIvr()` — **qué lámina pinta los seis `ivr_*`.** Público, sin parámetros,
 * sólo lee. Recorre **las dos plantillas** (`jm` y `secco`) porque la pregunta admite que la
 * respuesta esté en la otra.
 *
 * **Por qué hace falta, y sale de una medición de corrida:** en `jm-20260823-113545` los seis
 * —`ivr_llamados`, `ivr_atendidos`, `ivr_at_pct`, `ivr_75`, `ivr_75_pct`, `ivr_marque1`— aparecen
 * en `FALTANTES` **sin sufijo `@ítem`**, mientras todo lo demás que itera **sí lo tiene**
 * (`u1_bench_*` dice `@Parque Avellaneda`, los `camp_*` dicen `@3481-AGOINFAN`). **Resolvieron en
 * la etapa de tokens fijos, con la ventana del informe.** O sea que **no los pinta ninguna lámina
 * que itere** — y los cuatro casilleros del iceberg los pinta `enc_*`, no éstos.
 *
 * ⛔ **Las tres respuestas posibles mandan a trabajos distintos, y por eso el reporte las separa:**
 *
 *   1. **Viven en una lámina visible que no itera** → están bien donde están y el `/////` es un
 *      hueco normal.
 *   2. **Viven en una lámina ESCONDIDA** → son crudos permanentes y **no hay nada que arreglar**;
 *      lo que hay que hacer es contarlos en los «49 crudos» y no perseguirlos.
 *   3. ⛔⛔ **No están en ninguna lámina de ninguna plantilla** → **seis filas de `MARCADORES`
 *      cableadas contra una caja que ya no existe.** Ése es el caso que no falla solo: el marcador
 *      resuelve, no encuentra dónde pintarse, **no entra a `FALTANTES` por lámina** y nadie se
 *      entera. Es el mismo modo de falla que `probar-desglose-plataforma.js` previene al cruzar
 *      contra el censo.
 *
 * ⚠ **Y una cuarta que hay que poder distinguir de la 3:** que estén en una lámina **sin ancla**.
 * Ahí sí están, pero `LAMINAS` no las conoce, así que ninguna sección las puede reclamar.
 */
function diagDondeVivenLosIvr() {
  /* ⛔⛔ **La lista sale de `MARCADORES`, NO escrita a mano — y esto se corrige el 23/08 después de
   * que la versión a mano produjera una alarma falsa.** El array literal incluía `ivr_audiencia`,
   * que **no es un marcador**: es un `campo_logico` de `MAPEO` (`digital/Directa IVR`, columna J,
   * encabezado «Audiencia»). El diagnóstico lo reportó como *«fila cableada contra una caja que no
   * existe»* **sobre una fila que nunca existió**.
   *
   * ⭐ **Es la misma regla que `probar-desglose-plataforma.js` aplica al cablear** —*los tokens se
   * cruzan contra el registro, uno por uno, nunca contra una lista de memoria*— y la incumplí en el
   * instrumento en vez de en el cableado. Un nombre de `MAPEO` y uno de `MARCADORES` se parecen
   * demasiado para escribirlos de memoria. */
  var BUSCADOS = leerMarcadores_()
    .filter(function (m) { return String(m.marcador || '').indexOf('ivr_') === 0; })
    .map(function (m) { return String(m.marcador).trim(); })
    .sort();
  // Control positivo: éstos SÍ se pintan hoy. Si salen igual que los buscados, el instrumento
  // está midiendo mal y no hay que creerle nada.
  var CONTROL = ['enc_audiencia', 'enc_atendidos', 'enc_e75', 'enc_marque1'];
  var TODOS = BUSCADOS.concat(CONTROL);
  if (!BUSCADOS.length) {
    // Cero medido es un problema, no un silencio (`CLAUDE.md` §4).
    Logger.log('⛔ MARCADORES no tiene ninguna fila `ivr_*`. No hay nada que buscar — y eso,');
    Logger.log('   si no se esperaba, es el hallazgo.');
    return { ok: false, motivo: 'cero marcadores ivr_* en MARCADORES' };
  }

  // ⛔ Ver la nota de `diagL046()`: `leerRegistro_` sin clave primaria devuelve `{}` en
  // silencio. Acá costó una corrida entera — el recorrido no se ejecutó y el reporte dijo
  // «EN NINGUNA LÁMINA» sobre ocho tokens. **Lo atajó el control positivo, no el código.**
  var informes = leerInformes();
  var donde = {};
  TODOS.forEach(function (t) { donde[t] = []; });

  Object.keys(informes).forEach(function (id) {
    var inf = informes[id];
    if (!inf || !inf.plantilla_id) { Logger.log('  ⚠ ' + id + ' sin plantilla_id, se saltea'); return; }
    var slides;
    try { slides = SlidesApp.openById(inf.plantilla_id).getSlides(); }
    catch (e) { Logger.log('  ⚠ no pude abrir la plantilla de ' + id + ': ' + e.message); return; }

    slides.forEach(function (slide, i) {
      var ancla = anclaDeLamina_(slide);
      var escondida = esLaminaEscondida_(slide);
      var vistos = {};
      // `piezasDeTextoDeSlide_` es el MISMO lector que usa la corrida (`tokensDeSlide_`) y que el
      // censo: llega a tablas y a grupos. Usar otro acá mediría una plantilla distinta.
      piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
        var m; RE_TOKEN_.lastIndex = 0;
        while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) vistos[m[1]] = true;
      });
      TODOS.forEach(function (t) {
        if (vistos[t]) {
          donde[t].push(id + ' · lámina ' + (i + 1) + ' · ' + (ancla || '⚠ SIN ANCLA') +
            (escondida ? ' (ESCONDIDA)' : ''));
        }
      });
    });
  });

  Logger.log('== diagDondeVivenLosIvr ==');
  Logger.log('');
  Logger.log('-- los seis que resolvieron SIN ítem, más sus dos hermanos --');
  var huerfanos = [], escondidos = [], sinAncla = [];
  BUSCADOS.forEach(function (t) {
    var d = donde[t];
    if (!d.length) { huerfanos.push(t); Logger.log('  ⛔⛔ ' + t + ' — EN NINGUNA LÁMINA DE NINGUNA PLANTILLA'); return; }
    d.forEach(function (x) {
      if (x.indexOf('ESCONDIDA') !== -1 && escondidos.indexOf(t) === -1) escondidos.push(t);
      if (x.indexOf('SIN ANCLA') !== -1 && sinAncla.indexOf(t) === -1) sinAncla.push(t);
      Logger.log('  ✅ ' + t + ' → ' + x);
    });
  });

  Logger.log('');
  Logger.log('-- control positivo: los cuatro que SÍ se pintan hoy --');
  CONTROL.forEach(function (t) {
    var d = donde[t];
    Logger.log('  ' + (d.length ? '✅' : '⛔') + ' ' + t + ' → ' + (d.length ? d.join(' | ') : 'EN NINGUNA'));
  });
  var controlOk = CONTROL.filter(function (t) { return donde[t].length; }).length;

  Logger.log('');
  Logger.log('== VEREDICTO ==');
  if (controlOk !== CONTROL.length) {
    Logger.log('  ⛔ EL CONTROL POSITIVO FALLÓ: ' + controlOk + ' de ' + CONTROL.length +
      ' se encontraron. El instrumento está midiendo mal — NO leer nada de arriba.');
    return { ok: false, motivo: 'control positivo en rojo' };
  }
  Logger.log('  ✅ control positivo: los ' + CONTROL.length + ' se encontraron, el lector funciona.');
  Logger.log('  huérfanos (en ninguna lámina) : ' + huerfanos.length + (huerfanos.length ? ' → ' + huerfanos.join(', ') : ''));
  Logger.log('  en lámina escondida           : ' + escondidos.length + (escondidos.length ? ' → ' + escondidos.join(', ') : ''));
  Logger.log('  en lámina sin ancla           : ' + sinAncla.length + (sinAncla.length ? ' → ' + sinAncla.join(', ') : ''));
  Logger.log('');
  if (huerfanos.length) {
    Logger.log('  ⛔⛔ HAY FILAS DE MARCADORES CABLEADAS CONTRA UNA CAJA QUE NO EXISTE.');
    Logger.log('     No fallan solas: resuelven, no encuentran dónde pintarse y nadie se entera.');
  } else if (escondidos.length) {
    Logger.log('  ⭐ Están en lámina escondida: son crudos permanentes y NO hay nada que arreglar.');
    Logger.log('     Lo que corresponde es contarlos con los «49 crudos», no perseguirlos.');
  } else {
    Logger.log('  ⭐ Están en láminas visibles que no iteran: el ///// es un hueco normal.');
  }
  return { ok: true, donde: donde, huerfanos: huerfanos, escondidos: escondidos, sin_ancla: sinAncla };
}

/**
 * ⭐⭐ `diagPostYAnclaje()` — **el instrumento que mide lo que hay que saber ANTES de tocar nada**
 * (25/08/2026). Sólo lectura: no escribe una celda.
 *
 * Contesta **tres** preguntas que hoy están abiertas y que se responden con la misma corrida.
 * Van juntas porque comparten lectura, no por comodidad.
 *
 * ### 1 · Por qué `L-036` salió con cuatro `-` en vez de números plausibles
 *
 * ⛔ **La contradicción, escrita para que no se pierda:** con cero ítems del temario,
 * `filas_temario` queda sin setear y la cadena de `datosDeMarcador_` **cae a la rama general** —
 * `leerFuente('reuniones', …, 'Agenda JM | Post')`, la solapa entera—. Con ~102 filas, `opFILA`
 * **tendría que publicar números**. Cuatro `-` significa que a la operación le llegó otra cosa.
 *
 * **Las tres candidatas que sobreviven, y cada una deja una huella distinta:**
 *
 * | qué pasó | `filas` | `valor` |
 * |---|---|---|
 * | no llegó nada | **0** | — |
 * | llegaron las 102 y la **clave del campo** no matchea | **102** | `''` |
 * | el temario sí funcionó | **2** | las filas 1-2 con valor |
 *
 * ⭐ La tercera columna es la que decide: `opFILA` devuelve `sin_datos` **por conteo** sólo cuando
 * `n > total`; si el conteo alcanza y el valor sale vacío, **el problema es la clave**, no el
 * universo. Esta función imprime las dos cosas.
 *
 * ### 2 · Cuánto cuesta la migración de `ANCLAJE_PENDIENTE`
 *
 * La clave del anclaje es `normalizar_(nombre) + '|' + fecha + '|' + etapa`. **Si `etapa` deja de
 * venir del temario, toda confirmación guardada con `|pre` o `|post` deja de matchear** y el
 * anclaje la vuelve a pedir. ⚠ **Y lo mismo pasa con el arreglo del nombre `: Salud`**: cambia
 * `normalizar_(nombre)`, o sea **el otro tercio de la misma clave**.
 *
 * ⇒ **Los dos cambios invalidan la misma clave, así que la migración es una sola y tiene que
 * cubrir los dos.** Esta función cuenta cuántas filas toca cada uno y cuántas los dos a la vez.
 *
 * ### 3 · Cuántos encuentros del temario tendrían fila POST con la regla nueva
 *
 * *«Métrica de resultado > 0»* — decisión del usuario, 25/08. Se mide **sobre las filas del
 * temario**, no sobre la solapa entera, que es la pregunta que importa.
 *
 * ⚠ **Sin `_` no está** porque **sí** tiene que aparecer en el desplegable, y **sin parámetros**
 * por lo mismo (`CLAUDE.md` §2, las dos condiciones).
 */
function diagPostYAnclaje() {
  var informeId = String(leerConfig().informe_activo || 'jm').trim();
  Logger.log('== diagPostYAnclaje · informe "' + informeId + '" · ' + new Date() + ' ==');
  Logger.log('SOLO LECTURA: esta funcion no escribe ninguna celda.');

  /* ── 1 · la solapa POST, tal como el motor la lee ─────────────────────────────────────── */
  Logger.log('');
  Logger.log('--- 1 · que devuelve leerFuente sobre reuniones/Agenda JM | Post ---');
  var ventana = { ok: true, desde: new Date(2000, 0, 1), hasta: new Date(2100, 0, 1), origen: 'diag' };
  var lectura;
  try {
    lectura = leerFuente('reuniones', ventana, 'Agenda JM | Post');
  } catch (e) {
    Logger.log('  ⛔ leerFuente TIRO: ' + e);
    lectura = null;
  }
  if (!lectura) {
    Logger.log('  ⛔ sin lectura. Esto solo ya explicaria los cuatro `-`: total = 0.');
  } else if (!lectura.ok) {
    Logger.log('  ⛔ leerFuente devolvio ok:false — ' + lectura.motivo);
    Logger.log('  ⇒ CANDIDATA 1 CONFIRMADA: no llega nada, y por eso opFILA da sin_datos.');
  } else {
    Logger.log('  filas devueltas: ' + lectura.filas.length);
    if (!lectura.filas.length) {
      Logger.log('  ⇒ CANDIDATA 1 CONFIRMADA: cero filas.');
    } else {
      /* ⭐ **Las claves de la primera fila son el dato que decide la candidata 2.** Si la solapa se
       * leyo con la fila de encabezado equivocada, las claves son las BANDAS de la fila 1
       * —`Informacion del encuentro`, y muchas vacias— en vez de los titulos de la fila 2. */
      var claves = Object.keys(lectura.filas[0]);
      Logger.log('  claves de la fila 1 (' + claves.length + '): ' + claves.slice(0, 14).join(' · '));
      ['ID', 'Habitantes', 'Alcance', 'Impresiones totales', 'Visualizaciones', '% VTR', 'Fecha']
        .forEach(function (h) {
          var esta = claves.indexOf(h) !== -1;
          Logger.log('    ' + (esta ? '✅' : '⛔') + ' "' + h + '"' +
            (esta ? '' : '  ← si falta, la CANDIDATA 2 es la buena: el valor sale vacio y opFILA da sin_datos'));
        });
    }
  }

  /* ── 2 · el temario del periodo activo y su anclaje ───────────────────────────────────── */
  Logger.log('');
  Logger.log('--- 2 · el temario del periodo activo ---');
  var reuniones = [];
  try { reuniones = leerReuniones_() || []; } catch (e) { Logger.log('  ⛔ no pude leer REUNIONES: ' + e); }
  /* ⛔⛔ `2026-08-25` — **este bloque agrupaba con `.trim()`, y eso lavaba justo lo que hay que
   * ver.** La candidata principal del fallo del 25/08 era que el `periodo_id` recargado trajera un
   * espacio o un carácter invisible, y **el diagnóstico lo normalizaba antes de mostrarlo**.
   *
   * ⭐ **Un instrumento que normaliza su entrada no puede diagnosticar problemas de
   * normalización.** Es la familia del `String(celda)` que disfrazó booleanos de texto y del
   * formato de celda que se leyó como tipo — **tercera vez en la semana**, y las tres veces el
   * instrumento contestó con seguridad sobre algo que ya había destruido.
   *
   * **Ahora se muestra el valor CRUDO**, con delimitadores, largo y tipo. Los tres juntos: los
   * delimitadores muestran espacios de borde, el largo muestra caracteres invisibles que los
   * delimitadores no revelan —un ` ` se ve igual que un espacio— y el tipo muestra el caso
   * `1/3 → fecha` de `C-83`. */
  var porPeriodo = {};
  var crudos = {};
  reuniones.forEach(function (r) {
    var v = r.periodo_id;
    var k = String(v === undefined || v === null ? '' : v);
    if (!porPeriodo[k]) { porPeriodo[k] = []; crudos[k] = v; }
    porPeriodo[k].push(r);
  });
  Logger.log('  filas de REUNIONES en total: ' + reuniones.length +
    '  ·  valores DISTINTOS de periodo_id: ' + Object.keys(porPeriodo).length);
  Logger.log('  ⚠ SIN normalizar: si dos lineas de abajo se ven iguales, NO son iguales.');
  Object.keys(porPeriodo).sort().forEach(function (k) {
    var fs = porPeriodo[k];
    var v = crudos[k];
    var tipo = (v instanceof Date) ? 'Date' : typeof v;
    Logger.log('  · [' + k + ']  largo=' + k.length + '  tipo=' + tipo +
      '  ·  ' + fs.length + ' fila(s)  ·  con etapa=post: ' +
      fs.filter(function (r) { return String(r.etapa || '').trim().toLowerCase() === 'post'; }).length);
    /* ⭐ Y el desglose por codigo de caracter **solo cuando hace falta**: si el valor tiene bordes
     * en blanco o algo fuera de ASCII imprimible, se listan los codigos. Imprimirlo siempre seria
     * ruido; imprimirlo nunca es el bug de arriba. */
    if (/^\s|\s$/.test(k) || /[^\x20-\x7E]/.test(k)) {
      var codigos = [];
      for (var i = 0; i < k.length; i++) codigos.push(k.charCodeAt(i));
      Logger.log('      ⛔ tiene bordes en blanco o caracteres no imprimibles. Codigos: ' + codigos.join(' '));
    }
  });
  /* ⚠ Y lo que decide el caso del 25/08: contra QUE se compara. `anclarEncuentros` filtra
   * `periodo_id` contra los `periodo_id` de PERIODOS que describen la ventana, **con `.trim()` de
   * un solo lado** —el de la fila— asi que un espacio en PERIODOS tambien rompe. Se muestran los
   * dos lados crudos para que la comparacion se pueda hacer a ojo. */
  Logger.log('');
  Logger.log('  --- contra que se compara: los periodo_id de PERIODOS, tambien crudos ---');
  try {
    var pers = leerPeriodos() || {};
    Object.keys(pers).forEach(function (id) {
      Logger.log('  · [' + id + ']  largo=' + id.length +
        '  ·  ' + (pers[id].desde || '?') + ' a ' + (pers[id].hasta || '?'));
    });
    Logger.log('  ⭐ El filtro del anclaje hace `String(fila.periodo_id).trim()` contra ESTOS,');
    Logger.log('    sin trim del otro lado: un espacio del lado de PERIODOS NO se perdona.');
  } catch (e) {
    Logger.log('  ⛔ no pude leer PERIODOS: ' + e);
  }
  var delPeriodo = reuniones;
  Logger.log('  ⇒ si el periodo que corrio tiene 0 con etapa=post, el filtro de');
  Logger.log('    comunicaciones_post no devuelve items — pero eso NO explica los cuatro `-`');
  Logger.log('    por si solo: sin items la cadena cae al agregado y deberia publicar numeros.');
  delPeriodo.forEach(function (r) {
    Logger.log('    · nombre="' + r.nombre + '" · fecha=' + r.fecha + ' · etapa="' +
      (r.etapa || '') + '" · notas="' + (r.notas || '') + '"');
  });

  /* ── 3 · la regla nueva, sobre el temario: metrica de resultado > 0 ───────────────────── */
  Logger.log('');
  Logger.log('--- 3 · con la REGLA NUEVA: cuantos encuentros del temario tendrian fila POST ---');
  Logger.log('  (regla: la cuenta anclada tiene fila en la solapa Y alguna metrica de resultado > 0)');
  var porId = {};
  if (lectura && lectura.ok) {
    lectura.filas.forEach(function (f) {
      var id = String(f['ID'] === undefined ? '' : f['ID']).trim();
      if (id) porId[id] = f;
    });
  }
  var n = function (f, k) { var v = f[k]; return (typeof v === 'number') ? v : 0; };
  delPeriodo.forEach(function (r) {
    var id = String(r.id_cuenta || '').trim();
    var fila = id ? porId[id] : null;
    var res = fila ? (n(fila, 'Alcance') + n(fila, 'Impresiones totales') + n(fila, 'Visualizaciones')) : 0;
    Logger.log('    · "' + r.nombre + '" · id_cuenta="' + id + '" · ' +
      (!id ? '⚠ SIN CUENTA en la fila de REUNIONES (la pone el anclaje, no el temario)'
        : (!fila ? '⛔ sin fila en la solapa POST — NO va'
          : (res > 0 ? '✅ con metrica > 0 — VA' : '⛔ fila TODA EN CEROS — NO va (regla del 25/08)'))));
  });
  Logger.log('  ⚠ `id_cuenta` puede venir vacio acá: lo resuelve el anclaje en la corrida, no la hoja.');
  Logger.log('    Si sale vacio en todas, esta parte no midio la regla — midio que falta el anclaje.');

  /* ── 4 · lo que la MIGRACION de ANCLAJE_PENDIENTE va a costar ─────────────────────────── */
  Logger.log('');
  Logger.log('--- 4 · ANCLAJE_PENDIENTE: cuantas claves invalidan los dos cambios ---');
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ANCLAJE_PENDIENTE');
  if (!hoja) {
    Logger.log('  ⓘ la hoja no existe todavia: migracion de costo CERO.');
  } else {
    var datos = hoja.getDataRange().getValues();
    var hs = datos[0];
    var iNombre = hs.indexOf('nombre_buscado');
    var iElegido = hs.indexOf('elegido');
    if (iNombre === -1) {
      Logger.log('  ⛔ no encuentro la columna `nombre_buscado`. Headers: ' + hs.join(' · '));
    } else {
      var total = 0, confirmadas = 0, conEtapaClave = 0, conNombreSucio = 0, ambas = 0;
      for (var f = 1; f < datos.length; f++) {
        var nb = String(datos[f][iNombre] || '');
        if (!nb) continue;
        total++;
        var elegido = iElegido === -1 ? '' : String(datos[f][iElegido] || '').trim();
        if (elegido) confirmadas++;
        /* La clave es `nombre|fecha|etapa`: el tercer segmento es la etapa. */
        var partes = nb.split('|');
        var etapaEnClave = partes.length >= 3 && String(partes[2]).trim() !== '';
        var nombreSucio = /^[\s:;,.\-]/.test(partes[0] || '');
        if (etapaEnClave) conEtapaClave++;
        if (nombreSucio) conNombreSucio++;
        if (etapaEnClave && nombreSucio) ambas++;
        if (elegido && (etapaEnClave || nombreSucio)) {
          Logger.log('    ⚠ CONFIRMADA y se invalida: "' + nb + '" → elegido "' + elegido + '"' +
            (etapaEnClave ? ' [etapa en la clave]' : '') + (nombreSucio ? ' [nombre sucio]' : ''));
        }
      }
      Logger.log('  filas con clave: ' + total + '  ·  CONFIRMADAS (con `elegido`): ' + confirmadas);
      Logger.log('  con `etapa` en la clave : ' + conEtapaClave + '  ← las invalida sacar etapa del temario');
      Logger.log('  con nombre que arranca en separador: ' + conNombreSucio + '  ← las invalida el arreglo de ": Salud"');
      Logger.log('  las dos cosas a la vez : ' + ambas);
      Logger.log('  ⭐ LO QUE IMPORTA ES `CONFIRMADAS`: una fila sin `elegido` no se pierde,');
      Logger.log('    se vuelve a proponer sola. Lo que cuesta re-hacer es lo que alguien decidio.');
    }
  }

  Logger.log('');
  Logger.log('⚠ Lo que este diagnostico NO contesta: si el id_cuenta que el anclaje asigna');
  Logger.log('  coincide con el de Agenda JM | Post. Eso lo dice la corrida, no esto.');
  return true;
}

/* ═══════════ `2026-08-25` — EL TESTIGO DE `DIMENSIONES_.etapa` ════════════════════════════
 *
 * ⛔ **Se corre ANTES de ampliar el criterio y DESPUÉS, en la misma sesión.** Ampliar `post` de
 * `~=Agenda Post` a `~=Post` **mueve números publicados** de los 24 `u1_*` del «1 a 1», y ésta es
 * la única forma de saber cuánto y hacia dónde.
 *
 * ⭐⭐ **Lleva su propio CANARIO adentro, y es de la clase buena: `u1_total_impresiones`.** Ese
 * marcador tiene `dimensiones` **vacío** —o sea las DOS etapas— sobre la **misma solapa** y con la
 * **misma operación** que los que sí se mueven. **El cambio no lo puede tocar**: mover una fila de
 * `pre` a `post` no cambia la suma de las dos.
 *
 *   ⇒ Si `u1_total_impresiones` se movió, **NO fue este cambio: fue la fuente**, y la comparación
 *     entera no se lee. Es el discriminador que `CLAUDE.md` §4 pide —*dos marcadores que comparten
 *     camino y difieren sólo en el corte*— y vale **dentro de la misma corrida**, así que la
 *     inestabilidad de `looker`/`digital` no lo puede arruinar.
 *
 * ⭐ **Y el criterio de aceptación, que es el que dio el usuario (`V-110`):** el `pre` es el
 * **complemento** del `post` (`des_campana!~=…`), así que ampliar el post **tiene que sacarle filas
 * al pre y a nadie más**. Un `u1_pre_*` que NO se mueve cuando su `u1_post_*` hermano sí, es un
 * hallazgo: significa que la fila entró al post sin salir del pre.
 *
 * ⚠ **Lo que este testigo NO contesta:** si los valores nuevos son los CORRECTOS. Dice qué se movió
 * y en qué dirección; que el número sea el de la semana lo dice el deck del equipo.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Los 21 marcadores que tocan `etapa`, más el canario. El orden agrupa por lo que se compara. */
var MARCADORES_ETAPA_TESTIGO_ = [
  // POST — los que GANAN filas. Tienen que subir o quedar, nunca bajar.
  'u1_post_meta_impresiones', 'u1_post_meta_vistas', 'u1_post_meta_vtr',
  'u1_post_google_impresiones', 'u1_post_google_vistas', 'u1_post_google_vtr',
  'u1_post_prog_impresiones', 'u1_post_prog_vistas', 'u1_post_prog_vtr',
  // PRE — los que PIERDEN las mismas filas. Tienen que bajar o quedar, nunca subir.
  'u1_pre_meta_impresiones', 'u1_pre_meta_clics', 'u1_pre_meta_ctr',
  'u1_pre_google_impresiones', 'u1_pre_google_clics', 'u1_pre_google_ctr',
  'u1_pre_prog_impresiones', 'u1_pre_prog_clics', 'u1_pre_prog_ctr',
  // Totales: dos tienen etapa y se mueven; el tercero es el CANARIO.
  'u1_total_clics',        // `etapa=pre`  → puede bajar
  'u1_total_vistas',       // `etapa=post` → puede subir
  'u1_total_impresiones'   // ⭐ SIN etapa → NO se puede mover. El canario.
];

/**
 * ⭐ **El testigo. Sin `_` y SIN PARÁMETROS**, que son las dos condiciones para que Apps Script lo
 * liste en el desplegable (`CLAUDE.md` §2).
 *
 * Se corre **dos veces**: antes de tocar `DIMENSIONES_.etapa` y después, **en la misma sesión** —
 * el intervalo corto es lo que hace que la comparación signifique algo con una fuente que se mueve
 * sola (`R-31`).
 *
 * Devuelve por `Logger.log` **además** de por `return`: el editor no muestra el valor de retorno.
 */
function testigoDeEtapaPost() {
  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('TESTIGO DE `DIMENSIONES_.etapa` — ' + new Date().toISOString());
  Logger.log('criterio POST vigente en este momento: ' +
    JSON.stringify(DIMENSIONES_.etapa.post['digital|CAMPAÑAS_DESGLOCE_DIGITAL']));
  Logger.log('criterio PRE  vigente en este momento: ' +
    JSON.stringify(DIMENSIONES_.etapa.pre['digital|CAMPAÑAS_DESGLOCE_DIGITAL']));
  Logger.log('══════════════════════════════════════════════════════════════════════');

  /* ⛔ **El criterio se imprime desde `DIMENSIONES_`, no como texto fijo.** Un testigo que declara
   * de memoria bajo qué criterio corrió es indistinguible de uno que corrió bajo el otro — y las
   * dos tomas se llaman igual. Es la mitad barata de *«el reporte declara bajo qué condiciones
   * corrió»*. */

  var r = testigoDeMarcadores_(MARCADORES_ETAPA_TESTIGO_, 'etapa pre/post del «1 a 1»');
  if (!r.ok) {
    Logger.log('⛔ FALLÓ: ' + r.motivo);
    return r;
  }

  Logger.log('');
  Logger.log('── CÓMO LEER LA SEGUNDA TOMA ─────────────────────────────────────────');
  Logger.log('1 ⭐ CANARIO PRIMERO: `u1_total_impresiones` suma las DOS etapas sobre la misma');
  Logger.log('     solapa. Si se movió, NO fue el cambio — fue la fuente, y nada de lo demás');
  Logger.log('     se puede leer. Es lo único que se mira antes que el resto.');
  Logger.log('2  Los nueve `u1_post_*` pueden SUBIR o quedar. Si alguno BAJA, es un bug.');
  Logger.log('3  Los nueve `u1_pre_*` pueden BAJAR o quedar. Si alguno SUBE, es un bug.');
  Logger.log('4 ⭐ Y el par tiene que moverse JUNTO: el `pre` es el complemento del `post`, así');
  Logger.log('     que una fila que entra al post SALE del pre. Un `u1_post_*` que sube con su');
  Logger.log('     `u1_pre_*` hermano quieto significa que la fila entró sin salir de ningún lado.');
  Logger.log('5  `u1_total_clics` (etapa=pre) puede bajar · `u1_total_vistas` (etapa=post) subir.');
  Logger.log('');
  Logger.log('⚠ Lo que este testigo NO contesta: si los valores nuevos son los CORRECTOS.');
  Logger.log('  Dice qué se movió y hacia dónde; que el número sea el de la semana lo dice el');
  Logger.log('  deck del equipo, y esta lámina no está en el fixture del 31/07.');
  return r;
}

/**
 * ⭐ **`2026-08-30` — quién es el `error=1`.** El testigo de ámbito informó
 * `resolverMarcadores(jm) → 220 · ok=188 · sin_datos=31 · error=1` y **el que falla no tiene
 * nombre en ningún lado**. Un marcador que falla hoy y que nadie identificó puede ser justo uno de
 * los que un cambio toca.
 *
 * ⛔ **Se escribió esto en vez de deducirlo de la configuración**, y el motivo es la regla del
 * control positivo: un detector que cruza `MARCADORES` contra `MAPEO` sobre disco **no distingue
 * un problema real de una limitación del propio detector**. El primer intento devolvió **42**
 * marcadores «con problema» — casi todos falsos: plantillas `{token}` en `campo_logico` que el
 * splitter parte mal, y dimensiones cuyo mapa el regex no llegó a cargar. **42 hallazgos
 * plausibles y ninguno verificado es peor que ninguno.** El motor sabe cuál falla; se le pregunta.
 *
 * Sin `_` y sin parámetros. Sólo lectura.
 */
function diagMarcadoresQueFallan() {
  Logger.log('MARCADORES QUE NO RESUELVEN — ' + new Date().toISOString());

  // El preámbulo, copiado de `generarInforme` — mismo motivo que en `testigoDeAmbito`.
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {

  var res = resolverMarcadores('jm');
  if (!res || !res.ok) {
    Logger.log('⛔ resolverMarcadores no devolvió resultados: ' + JSON.stringify(res));
    return { ok: false };
  }
  Logger.log('resumen → total=' + res.resumen.total + ' · ok=' + res.resumen.ok +
    ' · sin_datos=' + res.resumen.sin_datos + ' · error=' + res.resumen.error);

  var errores = [], sinDatos = [];
  res.resultados.forEach(function (r) {
    if (r.estado === 'error') errores.push(r);
    else if (r.estado === 'sin_datos') sinDatos.push(r);
  });

  /* ⭐ El conteo va SIEMPRE, aunque dé cero: «ninguno» y «no miré» se ven igual en un log sin
   * conteo (`CLAUDE.md` §4). */
  Logger.log('');
  Logger.log('── ERROR (' + errores.length + ') ─────────────────────────────────────');
  /* ⚠ **Un cero acá NO cierra la pregunta.** La Parte A del `2026-08-30_2` informó `error=1` sobre
   * los mismos 220 marcadores. Si esta corrida devuelve cero, **el error depende del ESTADO
   * —cachés, período, hoja— y no del marcador**, y eso es una discrepancia entre dos mediciones
   * del mismo motor: se reporta, no se da por resuelta. */
  if (!errores.length) {
    Logger.log('  ⚠ CERO errores acá, pero la Parte A informó error=1 sobre los mismos 220.');
    Logger.log('    Eso NO es «ya no está»: es que el error depende del estado y no del marcador.');
    Logger.log('    Discrepancia entre dos mediciones del mismo motor — hay que explicarla.');
  }
  errores.forEach(function (r) {
    Logger.log('  ⛔ ' + r.marcador + '  valor=' + r.valor);
    Logger.log('     traza: ' + String(r.traza || '').replace(/\s+/g, ' '));
  });

  Logger.log('');
  Logger.log('── SIN_DATOS (' + sinDatos.length + ') ──────────────────────────────');
  sinDatos.forEach(function (r) {
    Logger.log('  · ' + r.marcador + '\t' + String(r.traza || '').replace(/\s+/g, ' ').slice(0, 150));
  });
  if (!sinDatos.length) Logger.log('  (ninguno)');

  return { ok: true, errores: errores.length, sin_datos: sinDatos.length };

  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}

/* ═══════════ `2026-08-30_2` — EL TESTIGO DE `DIMENSIONES_.ambito` ═════════════════════════
 *
 * **Parte A del `2026-08-30_2`.** Mismo patrón que `testigoDeEtapaPost`: se corre **dos veces,
 * antes y después de tocar `DIMENSIONES_.ambito`, en la misma sesión**. El intervalo corto es lo
 * que hace que la comparación signifique algo con dos solapas que `R-31` mide inestables.
 *
 * ⭐⭐ **El radio del cambio está MEDIDO, no supuesto** (30/08, sobre `Motor_de_Informes` vivo):
 * de los **42** marcadores que usan `ambito`, **sólo 10** caen sobre las tres solapas que el
 * prompt cambia — los ocho `imp_*` y `frecuencia`/`gcba_frecuencia`. Los otros 32 viven en
 * `digital|Directa IVR`, `digital|Directa Mail` y `rdv|RVD JM-CM - ES`, que **no se tocan**.
 *
 * ⚠⚠ **Y el dato que hay que leer antes de la corrida: sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL`
 * NO hay hoy ningún marcador con `ambito`.** Esa tercera entrada de la tabla del §1 **no mueve un
 * solo número** — es preparatoria, y se activa el día que los ocho `imp_*` terminen la mudanza que
 * `DIMENSIONES_` ya declara y `MARCADORES` todavía no. **Si algo del desglose se moviera con este
 * cambio, es un efecto no previsto y hay que parar.**
 */
var MARCADORES_AMBITO_TESTIGO_ = [
  // ── LOS QUE TIENEN QUE MOVERSE ─────────────────────────────────────────────────────────
  // Ocho `imp_*` sobre `looker|DIGITAL`. El corte pasa de «JM en el nombre» a `Id cuentas~=JDGAG`,
  // que sobre la ventana medida agarra 5 implementaciones más de JM — así que los `imp_*` de JM
  // suben y los `gcba_imp_*` bajan en la misma cantidad.
  'imp_total', 'imp_meta', 'imp_google', 'imp_prog',
  'gcba_imp_total', 'gcba_imp_meta', 'gcba_imp_google', 'gcba_imp_prog',
  // Dos sobre `looker|resumen_metricas_dinamico`, que también cambia de criterio.
  'frecuencia', 'gcba_frecuencia',

  // ── CANARIOS: misma solapa, mismo camino de lectura, SIN `ambito` ──────────────────────
  // Si alguno se mueve, NO fue el cambio: fue la fuente, y nada de lo demás se puede leer.
  'camp_dig_impl',        // CONTEO de TODAS las filas de `looker|DIGITAL`
  'camp_frecuencia',      // RATIO sobre `resumen_metricas_dinamico`, sin corte
  'u1_total_impresiones', // SUMA sobre el DESGLOSE, sin corte — prueba que la 3ª entrada es inerte

  /* ── ⭐⭐ `2026-08-31_2` — LOS SEIS DE IVR, Y VAN EN LA MISMA TOMA A PROPÓSITO ──────────
   * **El par junto es lo que hace legible el resultado.** `gcba_ivr_llamados` lleva
   * `ambito=gcba` (`ivr_vocero!=JM`) y debería dar **8 de 63**; el deck del 31/08 publica el
   * total en las dos láminas. Medir el de JM y el de GCBA en tomas distintas **vuelve a mezclar
   * causas**, que es el error que costó la vuelta del `gcba_frecuencia` a 6,265 contra 10,08.
   *
   * ⭐ **Cómo se lee, y es un discriminador de una sola corrida:**
   *
   * | `gcba_ivr_llamados` | `ivr_llamados` | qué significa |
   * |---|---|---|
   * | `63/63` | `63/63` | **el filtro NO se aplica** — publican lo mismo por el mismo motivo |
   * | `8/63` | `63/63` | **el filtro SÍ anda** y el problema está en otro lado |
   *
   * ⚠ Los `ivr_*` de JM tienen `dimensiones` **vacío**, así que su `63/63` es lo esperado y **no
   * es el hallazgo**: es la línea de base contra la que se lee el otro. */
  'gcba_ivr_llamados', 'gcba_ivr_atendidos', 'gcba_ivr_at_pct',
  'ivr_llamados', 'ivr_atendidos', 'ivr_at_pct',

  /* ── TRES CANARIOS MÁS, y va escrito por qué NO son una identidad ──────────────────────
   * ⛔ La tentación era exigir `imp_meta + gcba_imp_meta = camp_meta_impresiones`. **No cierra, y
   * no por un bug: es OTRO UNIVERSO.** Los `imp_*` llevan `filtro = estado=Activa` y los `camp_*`
   * **no llevan filtro**. Medido el 30/08 sobre `Base_Looker_2026-08-30.xlsx`: la solapa tiene
   * **5.149** filas y sólo **720** con `estado=Activa` — un factor 13. Escribir esa identidad
   * habría producido un ⛔ en las dos tomas y **habría parecido que el cambio rompió algo**.
   * Sirven igual como canarios: no llevan `ambito`, así que no se pueden mover. */
  'camp_meta_impresiones', 'camp_google_impresiones', 'camp_prog_impresiones'
];

/**
 * ⭐ **El testigo. Sin `_` y SIN PARÁMETROS**, las dos condiciones para que Apps Script lo liste en
 * el desplegable (`CLAUDE.md` §2). Devuelve por `Logger.log` además de por `return`.
 */
function testigoDeAmbito() {
  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('TESTIGO DE `DIMENSIONES_.ambito` — ' + new Date().toISOString());

  /* ⭐⭐ `2026-08-31_1` — **LA VENTANA VA EN EL ENCABEZADO, no sólo dentro de cada traza.**
   * Este testigo **no acepta período**: toma el default de `R-11`. El 30/08 eso hizo que testigo y
   * corrida midieran ventanas distintas —21-27 contra 21-28— y produjo una **contradicción
   * aparente entre dos números correctos**: `gcba_frecuencia` dio 6,265 acá y 10,08 en el deck.
   * Se leyó un rato como dos valores del mismo número, y eran dos ventanas.
   *
   * ⚠ **Esto no arregla el desajuste, lo vuelve VISIBLE en la primera línea**, que es donde se
   * lee. Un instrumento que no declara en qué ventana corrió obliga a abrir las trazas para saber
   * qué midió. El arreglo de fondo —un wrapper por período— sigue en `PENDIENTES`. */
  var vTest = resolverVentana({});
  Logger.log('VENTANA DE ESTA TOMA: ' +
    (vTest && vTest.desde
      ? formatearFecha_(vTest.desde) + ' → ' + formatearFecha_(vTest.hasta) + ' (' + vTest.origen + ')'
      : JSON.stringify(vTest)) +
    '   ⚠ DEFAULT de `R-11` — NO es el período que elija la corrida.');
  Logger.log('══════════════════════════════════════════════════════════════════════');

  /* ⛔ El criterio se imprime DESDE `DIMENSIONES_`, nunca como texto fijo: un testigo que declara
   * de memoria bajo qué criterio corrió es indistinguible de uno que corrió bajo el otro, y las
   * dos tomas se llaman igual. */
  ['looker|DIGITAL', 'digital|CAMPAÑAS_DESGLOCE_DIGITAL', 'looker|resumen_metricas_dinamico',
   'digital|Directa IVR', 'digital|Directa Mail', 'rdv|RVD JM-CM - ES'].forEach(function (k) {
    Logger.log('  ' + k);
    Logger.log('      jm   : ' + JSON.stringify(DIMENSIONES_.ambito.jm[k]));
    Logger.log('      gcba : ' + JSON.stringify(DIMENSIONES_.ambito.gcba[k]));
  });
  Logger.log('');

  /* ⛔⛔ **EL PREÁMBULO, COPIADO — no armado.** La primera versión de este testigo no lo tenía y
   * **murió en el muro de los 6 minutos** el 30/08 a las 18:28, después de imprimir los criterios
   * y colgarse en `resolverMarcadores`. Es exactamente la lección que este archivo ya tiene
   * escrita en `medirAnclajePorEtapas` y que `CLAUDE.md` §4 registra: *«un instrumento que quiere
   * medir lo que cuesta una corrida no ARMA su preámbulo, lo COPIA»*.
   *
   * ⭐ **Y son DOS cachés, no una.** `resolverMarcadores` **no las abre**, y `buscarMapeo` no
   * cachea por su cuenta: cada llamada relee `SOLAPAS` y `MAPEO` enteras. Con una sola encendida
   * el ahorro queda tapado; medido en su momento, `unirDigitalPorCuenta` pasó de 325 s a 6 s con
   * las dos — factor 54.
   *
   * Las dos líneas son las mismas de `generarInforme` (`Generador.gs`), en el mismo orden, y el
   * cierre va en `finally` porque abajo hay un `return` temprano.
   *
   * ⚠ **Y por eso NO van dentro de `testigoDeMarcadores_`, que sería el lugar «correcto» para una
   * guarda compartida:** `abrirCacheDatosHoja_()` **resetea a `{}`** y el cierre lo pone en
   * `null`, así que anidarlas **pisaría la caché de un llamador externo**. Acá es seguro porque
   * esto es un wrapper de nivel superior. Los otros cuatro testigos que usan el helper tienen el
   * mismo hueco y quedan anotados como pendiente, no arreglados de paso. */
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {

  /* ⭐⭐ `2026-08-31_2` — **EL `dimensiones` QUE LEE LA HOJA VIVA, no el que dice un export.**
   * La evidencia de que `gcba_ivr_llamados` lleva `ambito=gcba` salía de un `.xlsx` del 30/08, y
   * eso deja abierta una **cuarta hipótesis que ninguna traza descarta**:
   *
   *   ⭐ **(4) la fila VIVA de `MARCADORES` ya no dice `ambito=gcba`.**
   *
   * **Es la más barata de descartar y la única que explica «63 en silencio» sin inventar un modo
   * de falla nuevo**: con la celda vacía el marcador lee todo **y no falla**, que es exactamente
   * lo que se observa. Y es plausible — `MARCADORES` **se edita a mano**.
   *
   * ⚠ **Se descarta PRIMERO.** Si la celda viva dice `ambito=gcba`, recién ahí estamos ante un
   * modo de falla sin nombre y vale la pena buscarlo. */
  Logger.log('');
  Logger.log('── `dimensiones` LEÍDO DE LA HOJA VIVA (hipótesis 4) ─────────────────');
  var porMarcador = {};
  leerMarcadores_().forEach(function (m) { porMarcador[String(m.marcador || '').trim()] = m; });
  MARCADORES_AMBITO_TESTIGO_.forEach(function (n) {
    var m = porMarcador[n];
    if (!m) { Logger.log('  ⚠ ' + n + '	SIN FILA en MARCADORES'); return; }
    var d = String(m.dimensiones === undefined || m.dimensiones === null ? '' : m.dimensiones).trim();
    Logger.log('  ' + (d ? '   ' : '(∅)') + ' ' + n + '	dimensiones="' + d + '"' +
      '	filtro="' + String(m.filtro || '').trim() + '"');
  });
  Logger.log('  ⭐ Un `dimensiones` vacío donde se esperaba `ambito=gcba` CIERRA el caso acá:');
  Logger.log('     el marcador lee todo y no falla. Si dice `ambito=gcba`, seguir con la traza.');

  var r = testigoDeMarcadores_(MARCADORES_AMBITO_TESTIGO_, 'ámbito JM/GCBA — corte por Id cuentas');
  if (!r.ok) {
    Logger.log('⛔ FALLÓ: ' + r.motivo);
    return r;
  }

  /* ── La identidad interna, evaluada acá y no dejada al lector ──────────────────────────
   * ⭐⭐ `meta + google + prog = total` DENTRO de cada ámbito. Los cuatro comparten solapa, campo,
   * operación y `filtro = estado=Activa`, y sólo difieren en `plataforma` — que este cambio **no
   * toca**. Verificado sobre el fixture del 30/08: cierra al dígito en los dos ámbitos.
   * ⭐ **No depende de que la fuente esté quieta**: si se mueve, se mueven los dos lados. */
  var v = {};
  r.filas.forEach(function (f) { v[f.marcador] = Number(f.valor); });
  Logger.log('');
  Logger.log('── IDENTIDAD INTERNA: meta + google + prog = total, en cada ámbito ───');
  [['jm', 'imp_meta', 'imp_google', 'imp_prog', 'imp_total'],
   ['gcba', 'gcba_imp_meta', 'gcba_imp_google', 'gcba_imp_prog', 'gcba_imp_total']].forEach(function (t) {
    var suma = v[t[1]] + v[t[2]] + v[t[3]];
    var total = v[t[4]];
    var cierra = isFinite(suma) && isFinite(total) && Math.abs(suma - total) < 0.5;
    Logger.log('  ' + (cierra ? '✅' : '⛔') + ' ' + t[0] + ': ' + v[t[1]] + ' + ' + v[t[2]] +
      ' + ' + v[t[3]] + ' = ' + suma + (cierra ? ' = ' : ' ≠ ') + total);
  });
  Logger.log('  ⭐ Tiene que cerrar en las DOS tomas. Si cierra antes y no después, el corte');
  Logger.log('     nuevo perdió filas o las contó dos veces.');
  Logger.log('  ⚠ Lo que NO prueba: que el universo sea el correcto. Cierra igual sobre el');
  Logger.log('     universo equivocado — consistente no es correcto, y son dos preguntas.');

  Logger.log('');
  Logger.log('── CÓMO LEER LA SEGUNDA TOMA ─────────────────────────────────────────');
  Logger.log('1 ⭐ CANARIOS PRIMERO: `camp_dig_impl`, `camp_frecuencia` y `u1_total_impresiones`');
  Logger.log('     no llevan `ambito`. Si alguno se movió, NO fue el cambio — fue la fuente, y');
  Logger.log('     nada de lo demás se puede leer.');
  Logger.log('2 ⚠ `u1_total_impresiones` además prueba que la entrada del DESGLOSE es inerte:');
  Logger.log('     hoy ningún marcador usa `ambito` ahí. Si algo del desglose se mueve, PARAR.');
  Logger.log('3  Los cuatro `imp_*` de JM tienen que SUBIR o quedar. Si alguno baja, es un bug.');
  Logger.log('4  Los cuatro `gcba_imp_*` tienen que BAJAR o quedar. Si alguno sube, es un bug.');
  Logger.log('5 ⭐ Y el par se mueve JUNTO: `gcba` es la NEGACIÓN de `jm`, así que una fila que');
  Logger.log('     entra a JM SALE de GCBA. Un `imp_*` que sube con su `gcba_imp_*` hermano');
  Logger.log('     quieto significa que la fila entró sin salir de ningún lado.');
  Logger.log('6  `frecuencia` y `gcba_frecuencia` son RATIO: pueden moverse en cualquier');
  Logger.log('     dirección, porque cambian numerador y denominador a la vez.');
  Logger.log('');
  Logger.log('⚠ Lo que este testigo NO contesta: si los valores nuevos son los CORRECTOS.');
  Logger.log('  Dice qué se movió y hacia dónde. Que el corte agarre las campañas que');
  Logger.log('  corresponde lo dice el CONTEO contra el tablero (Parte C), y las SUMAS no son');
  Logger.log('  criterio: la lámina publica ACUMULADO por decisión del usuario del 30/08.');
  return r;

  } finally {
    // Orden inverso al de apertura, igual que en `generarInforme`.
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}

/* ═══════════ `2026-08-25` — EL TESTIGO QUE REEMPLAZA AL ENCABEZADO ════════════════════════
 *
 * ⛔⛔ **Por qué hace falta uno nuevo:** el testigo de integridad de `D-31` **era el encabezado** —
 * si la columna se corre, el título deja de coincidir y salta el aviso—. **Con títulos repetidos no
 * puede saltar**, porque el título de al lado es el mismo. Si alguien inserta una columna entre L y
 * M, `vis_totales` pasa a leer `% Cobertura` **y nadie se entera**.
 *
 * ⭐⭐ **El reemplazo es la IDENTIDAD DE LOS BLOQUES, y es más fuerte que un encabezado:**
 *
 *     M (acumulado)  =  R (Meta)  +  W (Google)  +  AB (Programmatic)
 *
 * **Verifica la POSICIÓN y la SEMÁNTICA a la vez.** Un encabezado sólo dice *«el título de esta
 * letra es el esperado»* — y puede coincidir con la columna equivocada cuando el título se repite.
 * **La suma sólo cierra si las cuatro posiciones son las cuatro que se creen.**
 *
 * ⭐ **Y de paso confirma el ORDEN de los bloques**, que es la decisión del usuario del 25/08: el
 * primero es el **acumulado**. Si algún día el equipo reordenara y pusiera Meta primero, la suma
 * **no cerraría** y esto lo diría.
 *
 * **Medido sobre el fixture del 20/08:** **66 de 66** filas evaluables cierran. Las otras 36 traen
 * `-` en **las tres** plataformas —no en una— y por eso no se pueden evaluar; **eso se informa
 * aparte y no se cuenta como fallo**.
 *
 * ⚠ **Sin `_` y SIN PARÁMETROS**, las dos condiciones del desplegable (`CLAUDE.md` §2).
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/**
 * Las cuatro posiciones de los bloques de `Visualizaciones` en `reuniones/Agenda JM | Post`.
 *
 * ⚠ **Índices 0-based, que es como los entrega `leerFuente`**: M = 12, R = 17, W = 22, AB = 27.
 * Coinciden con las letras de `MAPEO` — verificado contra `poblacion` (F = 5), `alc_real` (G = 6) e
 * `imp_totales` (J = 9).
 */
var BLOQUES_VIS_POST_L036_ = { acumulado: 12, meta: 17, google: 22, programmatic: 27 };

/** Tolerancia de la suma: media unidad. Las celdas son enteros; esto sólo absorbe el redondeo. */
var TOLERANCIA_BLOQUES_VIS_ = 0.51;

function verificarBloquesPostReuniones() {
  var BASE = 'reuniones';
  var HOJA = 'Agenda JM | Post';

  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('TESTIGO DE BLOQUES · ' + BASE + '/' + HOJA + ' · ' + new Date().toISOString());
  Logger.log('  M (acumulado) = R (Meta) + W (Google) + AB (Programmatic)');
  Logger.log('  Reemplaza al encabezado como testigo de D-31: con el título repetido cuatro');
  Logger.log('  veces, el encabezado no puede distinguir cuál de las repetidas es.');
  Logger.log('══════════════════════════════════════════════════════════════════════');

  var lectura = leerFuente(BASE, null, HOJA, { sin_recorte_por_ventana: true });
  if (!lectura.ok) {
    Logger.log('⛔ NO se pudo leer: ' + lectura.motivo);
    return { ok: false, motivo: lectura.motivo };
  }

  var num = function (v) {
    if (v === null || v === undefined || v === '' || v === '-') return null;
    var n = Number(v);
    return isNaN(n) ? null : n;
  };
  var celda = function (fila, i) { return num(fila[PREFIJO_COLUMNA_POSICIONAL_ + i]); };

  var evaluadas = 0, cierran = 0, sinPartes = 0, sinAcumulado = 0;
  var fallan = [];

  lectura.filas.forEach(function (fila, n) {
    var acu = celda(fila, BLOQUES_VIS_POST_L036_.acumulado);
    if (acu === null) { sinAcumulado++; return; }
    var partes = [BLOQUES_VIS_POST_L036_.meta, BLOQUES_VIS_POST_L036_.google,
      BLOQUES_VIS_POST_L036_.programmatic].map(function (i) { return celda(fila, i); });
    /* ⚠ **«No evaluable» NO es «falla».** Las 36 filas con `-` en las tres plataformas son filas
     * sin desglose cargado; contarlas como fallo haría que el testigo diera rojo por un dato que
     * falta, y ahí dejaría de distinguir una columna corrida de una carga incompleta. */
    if (partes.indexOf(null) !== -1) { sinPartes++; return; }
    evaluadas++;
    var suma = partes[0] + partes[1] + partes[2];
    if (Math.abs(acu - suma) <= TOLERANCIA_BLOQUES_VIS_) cierran++;
    else if (fallan.length < 10) fallan.push({ fila: n + 1, acumulado: acu, suma: suma, partes: partes });
  });

  var ok = evaluadas > 0 && cierran === evaluadas;
  Logger.log('');
  Logger.log((ok ? '✅' : '⛔') + ' CIERRAN ' + cierran + ' de ' + evaluadas + ' filas evaluables');
  Logger.log('   sin las tres plataformas (no evaluables): ' + sinPartes);
  Logger.log('   sin acumulado (fila vacía o "-"):         ' + sinAcumulado);
  Logger.log('   filas leídas:                             ' + lectura.filas.length);

  /* ⭐⭐ **Cero evaluables es un PROBLEMA, no un silencio** (`CLAUDE.md` §4: *un control tiene que
   * declarar cuánto midió*). Sin esto, «ninguna falló» y «no se probó nada» se ven idénticos — y
   * una columna corrida que dejara las cuatro en `-` daría verde. */
  if (!evaluadas) {
    Logger.log('');
    Logger.log('⛔ CERO FILAS EVALUABLES. El testigo NO verificó nada, que es distinto de que');
    Logger.log('   esté todo bien. Puede ser una columna corrida que dejó las cuatro fuera de');
    Logger.log('   rango, o una lectura vacía.');
    return { ok: false, motivo: 'cero filas evaluables', evaluadas: 0, cierran: 0 };
  }

  if (!ok) {
    Logger.log('');
    Logger.log('⛔ LA IDENTIDAD NO CIERRA. Lo más probable es que alguien haya INSERTADO O');
    Logger.log('   MOVIDO una columna en la solapa: los cuatro bloques dejaron de estar en');
    Logger.log('   M/R/W/AB. ⚠ Y con el título repetido, el encabezado NO lo puede detectar —');
    Logger.log('   por eso este testigo existe.');
    Logger.log('   Primeras filas que fallan:');
    fallan.forEach(function (f) {
      Logger.log('     fila ' + f.fila + ': M=' + f.acumulado + ' contra R+W+AB=' + f.suma +
        '  (' + f.partes.join(' + ') + ')');
    });
  }

  Logger.log('');
  Logger.log('⚠ Lo que este testigo NO contesta:');
  Logger.log('   · Que los valores sean los CORRECTOS. Dice que las cuatro posiciones son las que');
  Logger.log('     se creen y que la parte suma el total — no que el total sea el de la semana.');
  Logger.log('   · Nada sobre las OTRAS columnas de la solapa. Su testigo sigue siendo el');
  Logger.log('     encabezado, que para títulos únicos funciona perfecto.');

  return {
    ok: ok, evaluadas: evaluadas, cierran: cierran, sin_partes: sinPartes,
    sin_acumulado: sinAcumulado, fallan: fallan
  };
}

/* ═══════════ `2026-08-25` — POR QUÉ `L-036` SALIÓ `/////` Y NO ESTÁ EN `FALTANTES` ════════
 *
 * ⛔⛔ **Son DOS síntomas y hay que separarlos, porque mandan a trabajos distintos:**
 *
 *   - **`/////`** significa *«sin fila en `MARCADORES`, nadie lo cableó»* → **falta cablear**.
 *   - **No estar en `FALTANTES`** significa que el motor **ni siquiera miró el token** → falta
 *     entender **por qué no lo miró**, que es otra cosa.
 *
 * ⚠ **Un token con `/////` DEBERÍA estar en `FALTANTES`**: los tres caminos que pintan —etapa 3,
 * etapa 4 y el barrido final— empujan la fila. Que salga uno sin el otro **es la pregunta**.
 *
 * ⭐ **Y lleva CONTROL POSITIVO**: mide también tokens que se pintan todos los días. Si ésos
 * tampoco aparecen, el instrumento está roto y **no** hay hallazgo — es la regla que ya cazó dos
 * falsos dramáticos en `diagDondeVivenLosIvr()`.
 *
 * ⚠ **Sin `_` y SIN PARÁMETROS**, las dos condiciones del desplegable.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Los 20 de `L-036`, derivados de la misma lista que los cablea — acá sí conviene, porque lo que
 *  se pregunta es justamente si **esa** lista llegó a la hoja. */
function tokensPostL036_() {
  var out = [];
  COLUMNAS_POST_L036_.forEach(function (c) {
    for (var n = 1; n <= 4; n++) out.push('post_' + c.tok + n);
  });
  return out;
}

function diagPostL036() {
  var INFORME = 'jm';
  var LAMINA = 'L-036';
  var esperados = tokensPostL036_();

  /* ⭐ El control positivo: tokens que se pintan TODOS los días. Comparten lector, plantilla y
   * camino con los `post_*`, que es lo que los hace válidos como control. */
  var CONTROL = ['ecv_inscriptos', 'ecv_encuentros', 'camp_titulo'];

  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('DIAG L-036 · ' + new Date().toISOString());
  Logger.log('  Dos preguntas separadas: ¿tienen fila? y ¿el motor los miró?');
  Logger.log('══════════════════════════════════════════════════════════════════════');

  /* ── 1 · ¿Tienen fila en MARCADORES? Es lo que decide el `/////` ────────────────────── */
  Logger.log('');
  Logger.log('1 · ¿Tienen fila en MARCADORES?  (sin fila ⇒ /////)');
  var reg = leerRegistro_('MARCADORES', 'marcador');
  var conFila = [], sinFila = [];
  esperados.forEach(function (t) { (reg[t] ? conFila : sinFila).push(t); });
  Logger.log('   con fila: ' + conFila.length + ' de ' + esperados.length);
  if (sinFila.length) Logger.log('   ⛔ SIN FILA (' + sinFila.length + '): ' + sinFila.join(', '));

  var ctrlConFila = CONTROL.filter(function (t) { return !!reg[t]; });
  Logger.log('   ⭐ control positivo: ' + ctrlConFila.length + ' de ' + CONTROL.length +
    ' tokens que se pintan siempre TIENEN fila');
  if (!ctrlConFila.length) {
    Logger.log('   ⛔⛔ NINGÚN control tiene fila: el LECTOR está roto, no la configuración.');
    Logger.log('      Nada de lo de abajo se puede leer. Frenar acá.');
    return { ok: false, motivo: 'el control positivo no aparece: lector roto' };
  }

  /* ── 2 · ¿En qué modo quedó la sección? Decide QUÉ CAMINO los pinta ─────────────────── */
  Logger.log('');
  Logger.log('2 · ¿En qué modo quedó `comunicaciones_post`?  (decide qué etapa los pinta)');
  var sec = leerRegistro_('SECCIONES', 'seccion_id')['comunicaciones_post'];
  if (!sec) {
    Logger.log('   ⛔ NO existe la fila `comunicaciones_post` en SECCIONES.');
  } else {
    Logger.log('   modo: "' + sec.modo + '"  ·  itera_sobre: "' + sec.itera_sobre +
      '"  ·  filtro: "' + sec.filtro + '"  ·  items_por_lamina: "' + sec.items_por_lamina + '"');
    if (String(sec.modo).trim() === 'agregado') {
      Logger.log('   ⇒ AGREGADO: la lámina NO se expande y sus tokens caen a la ETAPA 4');
      Logger.log('     (tokens fijos). La etapa 4 usa `tokensVisiblesDe_`, que EXCLUYE las');
      Logger.log('     láminas escondidas — ver el punto 3.');
    } else {
      Logger.log('   ⇒ REPETIBLE: la lámina se expande por ítem y sus tokens se pintan en la');
      Logger.log('     ETAPA 3, con el sufijo `@ítem`. ⚠ En FALTANTES aparecen como');
      Logger.log('     `post_habitantes1 @Retiro`, NO como `post_habitantes1` a secas.');
    }
  }

  /* ── 3 · ¿La lámina está escondida? Es la causa que explica los DOS síntomas ────────── */
  Logger.log('');
  Logger.log('3 · ¿`' + LAMINA + '` está escondida?  (escondida ⇒ ni se resuelve ni entra a FALTANTES)');
  var fl = leerRegistro_('LAMINAS', 'lamina_id')[LAMINA];
  if (!fl) {
    Logger.log('   ⛔ NO hay fila `' + LAMINA + '` en LAMINAS. Sin ella la sección no la encuentra.');
  } else {
    Logger.log('   escondida: "' + fl.escondida + '"  ·  seccion_id: "' + fl.seccion_id +
      '"  ·  informe_id: "' + fl.informe_id + '"  ·  alcance: "' + (fl.alcance || '') + '"');
    if (esVerdadero_(fl.escondida)) {
      Logger.log('   ⛔⛔ ESCONDIDA. Eso explica los DOS síntomas a la vez: sus tokens no entran');
      Logger.log('      a `tokensVisiblesDe_`, así que no se resuelven NI entran a FALTANTES.');
    }
    if (!String(fl.seccion_id || '').trim()) {
      Logger.log('   ⛔⛔ `seccion_id` VACÍO. Con `D-37`, vacío significa «nadie la clasificó»:');
      Logger.log('      la lámina NO entra a ningún bloque repetible y sus tokens quedan afuera.');
    }
  }

  /* ── 4 · ¿El motor los MIRÓ? El mapa de la última corrida lo dice ───────────────────── */
  Logger.log('');
  Logger.log('4 · ¿Están en el mapa de la última corrida?  (si no, el motor no los vio)');
  var hojaC = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CORRIDAS');
  if (!hojaC || hojaC.getLastRow() < 2) {
    Logger.log('   ⛔ no hay corridas registradas');
  } else {
    var datosC = hojaC.getDataRange().getValues();
    var hc = datosC.shift().map(function (h) { return String(h || '').trim(); });
    var ult = datosC[datosC.length - 1];
    var mapaTxt = String(ult[hc.indexOf('mapa_tokens')] || '');
    Logger.log('   corrida: ' + ult[hc.indexOf('corrida_id')] +
      '  ·  faltantes: ' + ult[hc.indexOf('faltantes')]);
    var enMapa = esperados.filter(function (t) { return mapaTxt.indexOf('"' + t + '"') !== -1; });
    Logger.log('   en el mapa: ' + enMapa.length + ' de ' + esperados.length);
    if (!enMapa.length) {
      Logger.log('   ⛔⛔ NINGUNO está en el mapa ⇒ el motor NO los miró, y por eso no hay');
      Logger.log('      fila en FALTANTES. La causa está en el punto 2 o 3, no en el cableado.');
    }
    var ctrlEnMapa = CONTROL.filter(function (t) { return mapaTxt.indexOf('"' + t + '"') !== -1; });
    Logger.log('   ⭐ control positivo: ' + ctrlEnMapa.length + ' de ' + CONTROL.length + ' en el mapa');
    if (!ctrlEnMapa.length) {
      Logger.log('   ⚠ tampoco los de control: el mapa puede estar truncado o vacío, y entonces');
      Logger.log('     el «ninguno» de arriba NO significa nada.');
    }
  }

  /* ── 5 · Qué dice FALTANTES, buscando por PREFIJO ───────────────────────────────────── */
  Logger.log('');
  Logger.log('5 · ¿Qué filas de FALTANTES mencionan `post_`?  (con y sin sufijo `@ítem`)');
  var hojaF = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('FALTANTES');
  if (!hojaF || hojaF.getLastRow() < 2) {
    Logger.log('   ⛔ FALTANTES vacía o inexistente');
  } else {
    var datosF = hojaF.getDataRange().getValues();
    var hf = datosF.shift().map(function (h) { return String(h || '').trim(); });
    var iTok = hf.indexOf('token'), iCau = hf.indexOf('causa'), iLam = hf.indexOf('lamina_id');
    var post = datosF.filter(function (f) { return String(f[iTok] || '').indexOf('post_') === 0; });
    Logger.log('   filas totales: ' + datosF.length + '  ·  que empiezan con `post_`: ' + post.length);
    post.slice(0, 12).forEach(function (f) {
      Logger.log('     ' + f[iTok] + '\t' + (iCau === -1 ? '' : f[iCau]) +
        '\t' + (iLam === -1 ? '(sin columna lamina_id)' : f[iLam]));
    });
    if (iLam === -1) {
      Logger.log('   ⚠ la hoja NO tiene la columna `lamina_id`: se agregó el 25/08 y la escribe');
      Logger.log('     `reconciliarHeadersDeSalida_` en la PRÓXIMA corrida.');
    }
  }

  Logger.log('');
  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('CÓMO LEER ESTO — cada combinación manda a un trabajo distinto:');
  Logger.log('  · sin fila (1) + SÍ en FALTANTES        ⇒ falta cablear. Corré');
  Logger.log('    `cablearTablaPostReuniones()`.');
  Logger.log('  · sin fila (1) + NO en FALTANTES + no en el mapa (4)  ⇒ el motor no los miró:');
  Logger.log('    mirá `escondida` y `seccion_id` (3) y el `modo` (2).');
  Logger.log('  · con fila (1) + NO en FALTANTES        ⇒ el token no está en la plantilla con');
  Logger.log('    ese nombre, o la lámina no se emitió.');
  Logger.log('  · en FALTANTES con sufijo `@ítem`       ⇒ están, y la sección es `repetible`:');
  Logger.log('    buscá `post_habitantes1 @…`, no `post_habitantes1`.');
  return { ok: true, sin_fila: sinFila, con_fila: conFila };
}

/* ============ `2026-08-25` — ¿un token puede publicar VARIAS LÍNEAS CON BULLET? ============
 *
 * Pregunta previa a cualquier cableado de `m2_campanias` (`L-038`): hoy es `CUENTA_DISTINTOS`
 * —un número— y la caja de la plantilla es un bullet donde van los NOMBRES, uno debajo del otro.
 * Antes de tocarle la operación hay que saber si el **único** camino de escritura que tiene el
 * motor —`replaceAllText`, `Generador.gs`— sabe producir eso.
 *
 * **Se mide sobre una COPIA.** La plantilla es del equipo (`C-01`) y el usuario le está tocando
 * los tokens: escribir sobre la viva mezclaría las dos cosas y además no es reversible.
 *
 * ⭐ **Control positivo, y sin él no hay hallazgo.** Se pinta también `m2_envios`, que hoy sale
 * bien por este mismo camino y en esta misma lámina. Si el control tampoco aparece, lo que falló
 * es el instrumento —no escribió en la copia— y el resultado del otro token no dice nada.
 *
 * ⚠ **No inventa una segunda vía de escritura.** Se mide `replaceAllText` y nada más, que es lo
 * que el motor ya hace. Si no alcanza, eso es el hallazgo y la decisión es de otro prompt.
 */

/** Los saltos no se ven en un log, y son justo lo que se mide. */
function escaparSaltos_(texto) {
  return String(texto === undefined || texto === null ? '' : texto)
    .replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\v/g, '\\v');
}

/**
 * Radiografía de un contenedor de texto, **párrafo por párrafo**: qué dice y si está en lista.
 *
 * El párrafo es la unidad correcta y no el shape: la pregunta no es *"¿entró el texto?"* sino
 * *"¿cuántos párrafos hay y cada uno tiene bullet?"*, y eso sólo se ve a este nivel.
 */
function radiografiaDeRango_(rango) {
  var parrafos = [];
  rango.getParagraphs().forEach(function (p, i) {
    var r = p.getRange();
    var fila = { i: i + 1, texto: escaparSaltos_(r.asString()) };
    try {
      var ls = r.getListStyle();
      fila.en_lista = ls.isInList();
      if (fila.en_lista) {
        fila.glifo = String(ls.getGlyph());
        fila.nivel = ls.getNestingLevel();
        var lista = ls.getList();
        fila.list_id = lista ? String(lista.getListId()) : '(sin id)';
      }
    } catch (e) {
      fila.en_lista = 'ERROR al leer el estilo de lista: ' + e.message;
    }
    try {
      var ps = r.getParagraphStyle();
      fila.indent_start = ps.getIndentStart();
      fila.indent_first = ps.getIndentFirstLine();
    } catch (e) {
      fila.indent_start = '(no legible)';
    }
    parrafos.push(fila);
  });
  return parrafos;
}

/**
 * Dónde vive un token dentro de una lámina: `{ tipo, objectId, fila, col }`.
 *
 * Baja a tablas y a grupos por el mismo motivo que `piezasDeTextoDeSlide_`: `getShapes()` no los
 * ve, y la lámina de M2 **es una grilla con celdas combinadas** — si el token está en una celda,
 * un localizador que sólo mire shapes devuelve "no está" y eso se lee como un hallazgo.
 */
function ubicarContenedorDeToken_(slide, token) {
  var aguja = '{{' + token + '}}';
  var hallado = null;

  function mirar_(elemento, ruta) {
    if (hallado) return;
    var tipo;
    try { tipo = String(elemento.getPageElementType()); } catch (e) { return; }

    if (tipo === 'GROUP') {
      elemento.asGroup().getChildren().forEach(function (h) { mirar_(h, ruta + '>grupo'); });
      return;
    }

    if (tipo === 'TABLE') {
      var t = elemento.asTable();
      for (var f = 0; f < t.getNumRows(); f++) {
        for (var c = 0; c < t.getNumColumns(); c++) {
          try {
            if (t.getCell(f, c).getText().asString().indexOf(aguja) === -1) continue;
          } catch (e) { continue; } // celda combinada que no es la principal
          hallado = { tipo: 'celda', objectId: elemento.getObjectId(), fila: f, col: c, ruta: ruta };
          return;
        }
      }
      return;
    }

    if (tipo === 'SHAPE' || tipo === 'TEXT_BOX') {
      try {
        if (elemento.asShape().getText().asString().indexOf(aguja) === -1) return;
      } catch (e) { return; }
      hallado = { tipo: 'shape', objectId: elemento.getObjectId(), ruta: ruta };
    }
  }

  slide.getPageElements().forEach(function (e) { mirar_(e, 'suelta'); });
  return hallado;
}

/**
 * El `TextRange` del contenedor que describe `desc`, **por `objectId`**.
 *
 * Hace falta porque después de pintar el token ya no está: buscar de nuevo por la aguja
 * devolvería `null` y eso se leería como "la caja desapareció".
 */
function rangoDeContenedor_(slide, desc) {
  var hallado = null;

  function mirar_(elemento) {
    if (hallado) return;
    var tipo;
    try { tipo = String(elemento.getPageElementType()); } catch (e) { return; }
    if (tipo === 'GROUP') { elemento.asGroup().getChildren().forEach(mirar_); return; }
    var id;
    try { id = elemento.getObjectId(); } catch (e) { return; }
    if (id !== desc.objectId) return;
    try {
      hallado = (desc.tipo === 'celda')
        ? elemento.asTable().getCell(desc.fila, desc.col).getText()
        : elemento.asShape().getText();
    } catch (e) { hallado = null; }
  }

  slide.getPageElements().forEach(mirar_);
  return hallado;
}

/**
 * Un caso: copia la plantilla, radiografía la caja, pinta con `replaceAllText` y vuelve a
 * radiografiar **reabriendo el archivo** — lo que importa es lo que quedó, no lo que se pidió.
 */
function diagBulletsSobreCopia_(informeId, token, tokenControl, valor, etiqueta) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    return { ok: false, motivo: 'informe sin plantilla_id: ' + informeId };
  }

  var carpeta = asegurarCarpetaBackups_();
  if (!carpeta.ok) return { ok: false, motivo: 'no se pudo preparar la carpeta de copias: ' + carpeta.motivo };

  var sello = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  var copiaId;
  try {
    copiaId = DriveApp.getFileById(informe.plantilla_id)
      .makeCopy('[DIAG bullets ' + etiqueta + '] ' + informeId + ' ' + sello, carpeta.carpeta).getId();
  } catch (e) {
    return { ok: false, motivo: 'no se pudo copiar la plantilla: ' + e.message };
  }

  var pres = SlidesApp.openById(copiaId);
  var slides = pres.getSlides();
  var ubic = null, orden = 0, laminaId = '';
  for (var i = 0; i < slides.length && !ubic; i++) {
    var u = ubicarContenedorDeToken_(slides[i], token);
    if (u) { ubic = u; orden = i + 1; laminaId = anclaDeLamina_(slides[i]) || '(sin ancla)'; }
  }
  if (!ubic) {
    return { ok: false, motivo: 'el token {{' + token + '}} no está en la plantilla de ' + informeId, copia_id: copiaId };
  }

  var rangoAntes = rangoDeContenedor_(slides[orden - 1], ubic);
  var antes = rangoAntes ? radiografiaDeRango_(rangoAntes) : null;

  // PINTAR — el mismo camino que usa el motor. Ninguna vía nueva.
  var CONTROL = '9.999';
  var ocurrencias = pres.replaceAllText('{{' + token + '}}', valor, true);
  var ocurrenciasControl = pres.replaceAllText('{{' + tokenControl + '}}', CONTROL, true);
  pres.saveAndClose();

  // DESPUÉS — se REABRE el archivo a propósito.
  var slide2 = SlidesApp.openById(copiaId).getSlides()[orden - 1];
  var rangoDespues = rangoDeContenedor_(slide2, ubic);
  var despues = rangoDespues ? radiografiaDeRango_(rangoDespues) : null;

  var textoLamina = piezasDeTextoDeSlide_(slide2).map(function (p) { return p.texto; }).join(' | ');

  return {
    ok: true,
    etiqueta: etiqueta,
    copia_id: copiaId,
    copia_url: 'https://docs.google.com/presentation/d/' + copiaId + '/edit',
    lamina_id: laminaId,
    orden: orden,
    contenedor: ubic,
    valor_pedido: escaparSaltos_(valor),
    ocurrencias_reemplazadas: ocurrencias,
    control: {
      token: tokenControl,
      valor: CONTROL,
      ocurrencias_reemplazadas: ocurrenciasControl,
      pintado: textoLamina.indexOf(CONTROL) !== -1,
      quedo_crudo: textoLamina.indexOf('{{' + tokenControl + '}}') !== -1
    },
    parrafos_antes: antes,
    parrafos_despues: despues
  };
}

/**
 * El wrapper que corre una persona: **sin `_` y sin parámetros**, las dos condiciones de §2.
 *
 * Corre los dos casos en orden y **para si el control positivo del primero falla**: sobre una
 * copia en la que no se escribió, lo que diga el segundo no significa nada.
 *
 * `\n` y `\v` no son dos formas de lo mismo y por eso van los dos: en Slides el primero abre
 * PÁRRAFO y el segundo es un salto BLANDO dentro del párrafo. La diferencia decide si el bullet
 * se repite por línea o si las líneas cuelgan de un solo bullet — que es exactamente la pregunta.
 */
function medirBulletsDeM2Campanias() {
  var casos = [
    { etiqueta: 'salto-n', valor: 'Alfa uno\nBeta dos\nGamma tres' },
    { etiqueta: 'salto-v', valor: 'Alfa uno\vBeta dos\vGamma tres' }
  ];

  var salida = [];
  for (var i = 0; i < casos.length; i++) {
    var r = diagBulletsSobreCopia_('jm', 'm2_campanias', 'm2_envios', casos[i].valor, casos[i].etiqueta);
    salida.push(r);
    Logger.log('=== CASO ' + casos[i].etiqueta + ' ===');
    Logger.log(JSON.stringify(r, null, 2));
    if (!r.ok) { Logger.log('⛔ el caso falló — no se corre el siguiente'); break; }
    if (!r.control.pintado) {
      Logger.log('⛔ CONTROL POSITIVO EN ROJO: `m2_envios` no quedó pintado en la copia.');
      Logger.log('   El instrumento no escribió — NO hay hallazgo sobre los bullets. Se para acá.');
      break;
    }
  }
  return salida;
}

/**
 * `2026-08-25` — cuántas campañas M2 DISTINTAS hay por ventana.
 *
 * Tercera pata de la medición de bullets: si son tres, la caja de `L-038` las aguanta; si son
 * doce, el problema deja de ser el formato y pasa a ser el desborde.
 *
 * ⭐ **Enciende las DOS cachés y con el `try/finally` de `generarInforme`, copiado verbatim**
 * (`CLAUDE.md` §4). Sin `abrirCacheRegistros_`, `buscarMapeo` relee `SOLAPAS` y `MAPEO` enteras
 * en cada llamada: medido, un factor 54 — y las tres ventanas de acá se comen el reloj sin eso.
 * Un instrumento que corre en otras condiciones mide otra cosa.
 */
function medirCampaniasM2PorVentana() {
  var VENTANAS = [
    { etiqueta: 'julio_24_30 (PERIODOS)',        desde: '2026-07-24', hasta: '2026-07-30' },
    { etiqueta: '24-31/07 (la del deck, X-18)',  desde: '2026-07-24', hasta: '2026-07-31' },
    { etiqueta: 'agosto_14_20 (PERIODOS)',       desde: '2026-08-14', hasta: '2026-08-20' }
  ];

  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    var salida = [];
    VENTANAS.forEach(function (v) {
      var r = diagDistintos_('digital', 'Directa Mail', 'mail_campana', v.desde, v.hasta, 'mail_tipo', 'M2');
      r.ventana = v.etiqueta;
      salida.push(r);
      Logger.log('=== ' + v.etiqueta + ' ===');
      Logger.log(JSON.stringify(r, null, 2));
    });
    return salida;
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}

/**
 * `2026-08-25` — la geometría de la caja de un token y su autoajuste.
 *
 * Va con la medición de bullets y no aparte: *"el bullet se hereda"* y *"las líneas entran"* son
 * dos preguntas, y contestar sólo la primera manda a cablear algo que se va a desbordar. La
 * altura declarada en `PENDIENTES` (`h=24`) es del 03/08 y es evidencia fechada — se re-mide.
 *
 * ⭐ **`2026-08-26` — toma el TOKEN por parámetro.** Estaba cableada a `m2_campanias` y eso alcanzó
 * hasta que hubo dos cajas en la misma lámina: la del **banner** —que comparte shape con el literal
 * «Campañas», `autofit: NONE`, `h: 24`— y la del **bullet**, donde vive `{{m2_camp_lista}}`. **Son
 * dos cajas distintas y sus números no se parecen**, así que medir una y hablar de la otra es la
 * figura del artefacto equivocado (`CLAUDE.md` §4).
 *
 * Sólo lectura, y **sobre la plantilla viva no escribe nada**: `getHeight` no muta.
 */
function medirCajaDeToken_(token) {
  var informe = leerInformes()['jm'];
  if (!informe || !informe.plantilla_id) return { ok: false, motivo: 'jm sin plantilla_id' };

  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  var salida = null;
  for (var i = 0; i < slides.length && !salida; i++) {
    var u = ubicarContenedorDeToken_(slides[i], token);
    if (!u || u.tipo !== 'shape') continue;
    slides[i].getPageElements().forEach(function (el) {
      var id;
      try { id = el.getObjectId(); } catch (e) { return; }
      if (id !== u.objectId) return;
      var sh = el.asShape();
      var rango = sh.getText();
      var estilo = rango.getTextStyle();
      salida = {
        ok: true,
        token: token,
        lamina_id: anclaDeLamina_(slides[i]) || '(sin ancla)',
        orden: i + 1,
        objectId: id,
        x: Math.round(sh.getLeft()), y: Math.round(sh.getTop()),
        w: Math.round(sh.getWidth()), h: Math.round(sh.getHeight()),
        autofit: (function () {
          try { return String(sh.getAutofit().getAutofitType()); } catch (e) { return 'no legible: ' + e.message; }
        })(),
        tamanio_fuente_pt: (function () {
          try { return estilo.getFontSize(); } catch (e) { return 'no legible (mixto)'; }
        })(),
        texto_actual: escaparSaltos_(rango.asString())
      };
    });
  }
  if (!salida) return { ok: false, motivo: 'no se encontró la caja de {{' + token + '}} como shape' };

  // Cuántas líneas entran, con la altura de línea aproximada del tamaño de fuente. Es una
  // ESTIMACIÓN y se rotula como tal: la medida exacta la da mirar el deck.
  var pt = Number(salida.tamanio_fuente_pt);
  if (pt > 0) {
    salida.lineas_que_entran_estimadas = Math.floor(salida.h / (pt * 1.2));
    salida.nota_estimacion = 'h / (fuente * 1.2). ESTIMACIÓN, no medición: el alto real de línea ' +
      'lo decide Slides. Sirve para el orden de magnitud, no para un número citable.';
  }
  Logger.log(JSON.stringify(salida, null, 2));
  return salida;
}

/** La caja del BANNER — comparte shape con el literal «Campañas». Sin `_` y sin parámetros. */
function medirCajaDeM2Campanias() {
  return medirCajaDeToken_('m2_campanias');
}

/**
 * La caja del BULLET, donde se pinta la lista cruda de campañas. Sin `_` y sin parámetros.
 *
 * ⚠ **Es OTRA caja que la del banner** y por eso hay dos wrappers: el 25/08 se midió la del banner
 * —`autofit: NONE`, `h: 24`— y esa medición se citó como si fuera la de la lista. **No hay tope**
 * (decisión del usuario, 26/08): con ~30 nombres la caja crece y puede empujar lo de abajo, y eso
 * es esperado. Esto **mide y reporta**; no decide nada.
 */
function medirCajaDeM2CampLista() {
  return medirCajaDeToken_('m2_camp_lista');
}

/* ================= `2026-08-25_6` Parte 0 — medir antes de tocar la ventana =================
 *
 * Sólo lectura. No escribe ninguna hoja de registro, no genera y no toca la plantilla.
 *
 * ⭐ **Enciende las DOS cachés con el `try/finally` de `generarInforme`, copiado verbatim.**
 * Sin `abrirCacheRegistros_`, `buscarMapeo` relee `SOLAPAS` y `MAPEO` enteras por llamada.
 */

/** `0.1` — todos los marcadores que leen una solapa, con su lámina. */
function medirLectoresDeDirectaMail() {
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    var filas = leerMarcadores_().filter(function (f) {
      return String(f.base_id).trim() === 'digital' &&
             String(f.solapa).trim() === 'Directa Mail';
    });

    // `token -> [lamina_id]`, leído de la PLANTILLA VIVA de cada informe. No se deduce del
    // nombre del marcador: `L-047` y `L-038` comparten prefijo `camp_`/`m2_` y un filtro por
    // prefijo generaría una lista en vez de cruzar contra lo que hay (`CLAUDE.md` §4).
    var porToken = {};
    var informes = leerInformes();
    Object.keys(informes).forEach(function (id) {
      if (!informes[id].plantilla_id) return;
      SlidesApp.openById(informes[id].plantilla_id).getSlides().forEach(function (slide) {
        var lamina = anclaDeLamina_(slide) || '(sin ancla)';
        piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
          var m, re = /\{\{([a-zA-Z0-9_]+)\}\}/g;
          while ((m = re.exec(String(pieza.texto))) !== null) {
            var k = id + '|' + m[1];
            if (!porToken[k]) porToken[k] = [];
            if (porToken[k].indexOf(lamina) === -1) porToken[k].push(lamina);
          }
        });
      });
    });

    var salida = filas.map(function (f) {
      var k = f.informe_id + '|' + f.marcador;
      return {
        marcador: f.marcador, informe_id: f.informe_id,
        laminas: porToken[k] || [],
        operacion: f.operacion, campo_logico: f.campo_logico,
        filtro: f.filtro || '', dimensiones: f.dimensiones || '',
        separador: f.separador === undefined ? '' : String(f.separador),
        periodo_ref: f.periodo_ref || ''
      };
    });

    var porOperacion = {};
    salida.forEach(function (s) { porOperacion[s.operacion] = (porOperacion[s.operacion] || 0) + 1; });
    var sinLamina = salida.filter(function (s) { return s.laminas.length === 0; })
                          .map(function (s) { return s.marcador; });

    Logger.log(JSON.stringify({ total: salida.length, por_operacion: porOperacion,
                                sin_lamina: sinLamina, filas: salida }, null, 2));
    return { ok: true, total: salida.length, por_operacion: porOperacion,
             sin_lamina: sinLamina, filas: salida };
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}

/**
 * `0.2` + `0.3` — la columna de fecha, la columna `Asunto` y el conteo de la ventana.
 *
 * ⚠ **La ventana se aplica A MANO y eso va rotulado**: `digital` es `snapshot`, así que
 * `leerFuente` devuelve todas las filas y **no existe hoy un camino del motor que recorte esta
 * solapa**. Lo único que se reusa del motor es `parsearFechaCelda_` —el parseo es la parte
 * riesgosa y reimplementarlo es el error que este repo ya cometió cuatro veces—; la comparación
 * de la ventana es del instrumento y por eso se declara.
 */
function medirAsuntoYVentanaDirectaMail() {
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    var ventanaAncha = { ok: true, desde: new Date(2000, 0, 1), hasta: new Date(2040, 0, 1),
                         origen: 'parte 0 · sin recorte (digital es snapshot)' };
    var lectura = leerFuente('digital', ventanaAncha, 'Directa Mail');
    if (!lectura.ok) return { ok: false, motivo: lectura.motivo };

    // La solapa, tal como la declara el registro.
    var solapas = leerSolapas();
    var claveSolapa = null;
    Object.keys(solapas).forEach(function (k) {
      if (k.indexOf('digital') === 0 && k.indexOf('Directa Mail') !== -1) claveSolapa = k;
    });
    var decl = claveSolapa ? solapas[claveSolapa] : null;

    // `Asunto`: se busca por ENCABEZADO en la fila real, no por una letra supuesta.
    var encabezados = lectura.encabezados || [];
    var asunto = [];
    encabezados.forEach(function (h, i) {
      if (String(h).toLowerCase().indexOf('asunto') !== -1) {
        asunto.push({ letra: indiceAColumnaLetra_(i), encabezado: String(h), indice: i });
      }
    });

    var COL_FECHA = 'F', COL_TIPO = 'I', COL_CAMPANA = 'H';
    var desde = new Date(2026, 6, 24), hasta = new Date(2026, 6, 31); // 24-31/07, la del deck

    var totalFilas = lectura.filas.length;
    var sinFecha = 0, fechaInvalida = 0, conFecha = 0;
    var enVentanaM2 = [];

    lectura.filas.forEach(function (fila) {
      var crudo = valorPorColumna_(fila, 'digital', lectura.hoja, COL_FECHA);
      var vacio = (crudo === undefined || crudo === null || String(crudo).trim() === '');
      if (vacio) { sinFecha++; return; }
      var f = (crudo instanceof Date) ? crudo : parsearFechaCelda_(crudo);
      if (!f || isNaN(f.getTime())) { fechaInvalida++; return; }
      conFecha++;
      if (f < desde || f > hasta) return;
      var tipo = String(valorPorColumna_(fila, 'digital', lectura.hoja, COL_TIPO) || '');
      if (tipo.toUpperCase().indexOf('M2') === -1) return;
      enVentanaM2.push({
        fecha: Utilities.formatDate(f, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        campana: String(valorPorColumna_(fila, 'digital', lectura.hoja, COL_CAMPANA) || ''),
        asunto: asunto.length ? String(valorPorColumna_(fila, 'digital', lectura.hoja, asunto[0].letra) || '') : '(sin columna asunto)'
      });
    });

    function distintos_(lista) {
      var vistos = {}, orden = [];
      lista.forEach(function (v) { if (!(v in vistos)) { vistos[v] = 0; orden.push(v); } vistos[v]++; });
      return { cuantos: orden.length, conteo: vistos, lista: orden };
    }
    var dAsunto = distintos_(enVentanaM2.map(function (r) { return r.asunto; }));
    var dCampana = distintos_(enVentanaM2.map(function (r) { return r.campana; }));

    var conToken = dAsunto.lista.filter(function (a) { return /\[[a-zA-Z0-9_]+\]/.test(a); });
    var conTest = dAsunto.lista.filter(function (a) { return /test/i.test(a); });
    // ⚠ El token sin resolver corta en dirección contraria: un asunto plantilla puede cubrir
    // varios envíos. Se mide cuántas FILAS caen bajo cada asunto con token, que es lo que dice
    // si el 26 se sostiene o si es coincidencia.
    var filasPorAsuntoConToken = conToken.map(function (a) {
      return { asunto: a, filas: dAsunto.conteo[a] };
    });

    var salida = {
      ok: true,
      solapa_declarada: decl ? { uso: decl.uso, ventana_ref: decl.ventana_ref || '(vacío)',
                                campo_id_cuenta: decl.campo_id_cuenta || '(vacío)' } : '(no está en SOLAPAS)',
      modo_lectura: lectura.modo,
      columna_asunto: asunto.length ? asunto : '(ningún encabezado contiene "asunto")',
      total_filas_solapa: totalFilas,
      col_F_sin_fecha: sinFecha,
      col_F_no_es_fecha: fechaInvalida,
      col_F_con_fecha_valida: conFecha,
      ventana_medida: '2026-07-24 a 2026-07-31 (aplicada A MANO por el instrumento)',
      filas_en_ventana_M2: enVentanaM2.length,
      asuntos_distintos: dAsunto.cuantos,
      campanas_distintas: dCampana.cuantos,
      asuntos_con_token_sin_resolver: filasPorAsuntoConToken,
      asuntos_con_TEST: conTest,
      lista_asuntos: dAsunto.lista,
      lista_campanas: dCampana.lista
    };
    Logger.log(JSON.stringify(salida, null, 2));
    return salida;
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}

/**
 * `2026-08-25_6` Parte 0.4 — ¿sobrevive un SALTO DE LÍNEA el viaje por Sheets?
 *
 * Hace falta para poder usar `separador: '\n'` en `opLISTA`. **Se verifica releyendo lo que
 * quedó, no escribiendo a ciegas** — es la familia del `valor_fijo = '1/3'` que Sheets guardó
 * como fecha y el alta reportó «3 filas agregadas» diciendo la verdad sobre lo que pidió y
 * mintiendo sobre lo que quedó.
 *
 * ⛔ **No toca `MARCADORES` ni ninguna hoja de registro.** Crea una planilla temporal en la
 * carpeta de copias, escribe, relee y la manda a la papelera.
 *
 * ⭐ **El camino de lectura es el mismo que el del motor**: `getDataRange().getValues()`, que es
 * lo que hace `leerMarcadoresSinCache_`. Leer con `getValue()` mediría otra cosa.
 *
 * ⭐ **Control positivo, y sin él no hay hallazgo:** en el mismo viaje va un valor que NO puede
 * fallar —`' · '`, el separador que ya usa `ecv_barrios`—. Si ése tampoco vuelve, lo que falló es
 * el instrumento y el resultado del salto de línea no dice nada.
 */
function medirSaltoDeLineaPorSheets() {
  var carpeta = asegurarCarpetaBackups_();
  if (!carpeta.ok) return { ok: false, motivo: 'sin carpeta de copias: ' + carpeta.motivo };

  var CASOS = [
    { etiqueta: 'CONTROL · separador de ecv_barrios', escrito: ' · ' },
    { etiqueta: 'salto de línea real (Alt+Enter)',    escrito: '\n' },
    { etiqueta: 'salto entre dos textos',             escrito: 'Alfa\nBeta' },
    { etiqueta: 'la BARRA-ENE tipeada, no un salto',  escrito: '\\n' }
  ];

  var sello = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  var libro = SpreadsheetApp.create('[DIAG salto de linea] ' + sello);
  var idLibro = libro.getId();
  var salida = [];
  try {
    DriveApp.getFileById(idLibro).moveTo(carpeta.carpeta);
    var hoja = libro.getSheets()[0];
    hoja.getRange(1, 1).setValue('separador');           // encabezado, como en la hoja real
    CASOS.forEach(function (c, i) { hoja.getRange(i + 2, 1).setValue(c.escrito); });
    SpreadsheetApp.flush();

    // Se REABRE el libro: releer el mismo objeto podría devolver lo que se pidió escribir.
    var valores = SpreadsheetApp.openById(idLibro).getSheets()[0].getDataRange().getValues();
    CASOS.forEach(function (c, i) {
      var leido = valores[i + 1][0];
      salida.push({
        caso: c.etiqueta,
        escrito: escaparSaltos_(c.escrito),
        leido: escaparSaltos_(leido),
        tipo_leido: typeof leido,
        identico: String(leido) === String(c.escrito),
        // Lo que de verdad decide: ¿el valor que vuelve ABRE PÁRRAFO en Slides?
        tiene_salto_real: String(leido).indexOf('\n') !== -1
      });
    });
  } finally {
    try { DriveApp.getFileById(idLibro).setTrashed(true); } catch (e) {}
  }

  var control = salida[0];
  Logger.log(JSON.stringify({ ok: true, libro_borrado: true, casos: salida }, null, 2));
  if (!control || !control.identico) {
    Logger.log('⛔ CONTROL POSITIVO EN ROJO: ni el separador conocido volvió igual.');
    Logger.log('   El instrumento no está midiendo el viaje — NO hay hallazgo.');
    return { ok: false, motivo: 'control positivo en rojo', casos: salida };
  }
  return { ok: true, casos: salida };
}

/**
 * `2026-08-25_6` Parte 0.4, control positivo del OTRO eje — que la cadena de ventana existe y
 * funciona **para una solapa que no es `snapshot`**.
 *
 * ⭐ Sin esto, *«`Directa Mail` no recorta»* es indistinguible de *«el instrumento no sabe pedir
 * una ventana»*. Se lee `rdv` —`modo_periodo = filtrar`— por el mismo `leerFuente`, con dos
 * ventanas distintas: si los conteos difieren, la cadena está viva y el `snapshot` de `digital`
 * es una decisión declarada y no una falla de medición.
 */
function medirControlDeVentana() {
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    function leer_(baseId, solapa, d, h, etiqueta) {
      var v = { ok: true, desde: d, hasta: h, origen: 'control de ventana 0.4' };
      var r = leerFuente(baseId, v, solapa);
      return {
        etiqueta: etiqueta, base: baseId, solapa: r.ok ? r.hoja : solapa,
        ok: r.ok, motivo: r.motivo || '',
        modo: r.modo || '', filas_totales: r.filas_totales, filas_en_ventana: r.filas_en_ventana
      };
    }
    var bases = leerBases();
    var solapaRdv = bases.rdv ? bases.rdv.hoja_default : 'RVD JM-CM - ES';

    var salida = {
      control_filtrar: [
        leer_('rdv', solapaRdv, new Date(2026, 6, 24), new Date(2026, 6, 30), 'rdv · 24-30/07'),
        leer_('rdv', solapaRdv, new Date(2026, 7, 14), new Date(2026, 7, 20), 'rdv · 14-20/08')
      ],
      caso_medido: [
        leer_('digital', 'Directa Mail', new Date(2026, 6, 24), new Date(2026, 6, 30), 'Directa Mail · 24-30/07'),
        leer_('digital', 'Directa Mail', new Date(2026, 7, 14), new Date(2026, 7, 20), 'Directa Mail · 14-20/08')
      ]
    };
    var a = salida.control_filtrar[0], b = salida.control_filtrar[1];
    salida.control_positivo_verde = !!(a.ok && b.ok && a.filas_en_ventana !== b.filas_en_ventana);
    var c = salida.caso_medido[0], d2 = salida.caso_medido[1];
    salida.directa_mail_no_recorta = !!(c.ok && d2.ok && c.filas_en_ventana === d2.filas_en_ventana);

    Logger.log(JSON.stringify(salida, null, 2));
    if (!salida.control_positivo_verde) {
      Logger.log('⛔ CONTROL POSITIVO EN ROJO: `rdv` da lo mismo con dos ventanas distintas.');
      Logger.log('   El instrumento no sabe pedir una ventana — NO hay hallazgo sobre Directa Mail.');
    }
    return salida;
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}

/**
 * `2026-08-25_6` ADDENDUM — ¿qué marcadores de `digital/Directa Mail` recortan HOY?
 *
 * ⛔⛔ **Corrige un hallazgo propio de la Parte 0.** Allá se midió `leerFuente` en aislamiento y
 * se concluyó *«ningún marcador de esta solapa recorta»*. **Es falso, y el error es de método:**
 * el recorte del agregado de `digital` **no vive en `leerFuente`** —que devuelve todo por ser
 * `snapshot`— sino un nivel más arriba, en `resolverMarcadores` (`Generador.gs`, el bloque
 * `recortar_por_ventana` del 15/08). Es exactamente *«la función que estás leyendo no es el
 * camino completo»* (`CLAUDE.md` §4), cometido midiendo.
 *
 * Por eso este instrumento **no vuelve a leer la fuente**: resuelve los marcadores por el camino
 * real y lee lo que la **traza** dice de cada uno. La traza es el único lugar donde se ve por qué
 * rama salió y cuántas filas quedaron.
 *
 * Sólo lectura: no escribe ninguna hoja, no genera deck, no toca plantillas.
 */
function medirRecorteRealDeDirectaMail() {
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    var objetivo = {};
    leerMarcadores_().forEach(function (f) {
      if (String(f.base_id).trim() === 'digital' && String(f.solapa).trim() === 'Directa Mail') {
        objetivo[f.marcador] = { operacion: f.operacion, campo_logico: f.campo_logico,
                                 dimensiones: f.dimensiones || '', separador: f.separador === undefined ? '' : String(f.separador) };
      }
    });

    var res = resolverMarcadores('jm');
    if (!res || !res.ok) return { ok: false, motivo: 'resolverMarcadores no devolvió ok: ' + JSON.stringify(res && res.resumen) };

    var filas = [], sinResolver = [];
    var vistos = {};
    res.resultados.forEach(function (r) {
      if (!(r.marcador in objetivo)) return;
      vistos[r.marcador] = true;
      var t = String(r.traza || '').replace(/\s+/g, ' ');
      // Las dos marcas que distinguen la rama, tomadas de la traza y no deducidas del nombre.
      var recorte = t.match(/recorte por ventana sobre [^·]*·[^:]*: (\d+) de (\d+) fila\(s\)/);
      var porCuenta = t.indexOf('sin recorte por ventana') !== -1 ||
                      t.indexOf('rama por cuenta') !== -1 ||
                      t.indexOf('union digital por cuenta') !== -1;
      filas.push({
        marcador: r.marcador,
        operacion: objetivo[r.marcador].operacion,
        dimensiones: objetivo[r.marcador].dimensiones,
        valor: r.valor,
        estado: r.estado || '',
        rama: recorte ? 'AGREGADO — recorta por ventana' : (porCuenta ? 'POR CUENTA — sin recorte, la cuenta es el recorte' : '(no se pudo leer de la traza)'),
        filas_despues: recorte ? Number(recorte[1]) : null,
        filas_antes: recorte ? Number(recorte[2]) : null,
        traza: t
      });
    });
    Object.keys(objetivo).forEach(function (m) { if (!vistos[m]) sinResolver.push(m); });

    var porRama = {};
    filas.forEach(function (f) { porRama[f.rama] = (porRama[f.rama] || 0) + 1; });

    var salida = {
      ok: true,
      declarados_en_MARCADORES: Object.keys(objetivo).length,
      resueltos: filas.length,
      no_devueltos_por_resolverMarcadores: sinResolver,
      por_rama: porRama,
      resumen_corrida: res.resumen,
      filas: filas
    };
    Logger.log(JSON.stringify(salida, null, 2));
    return salida;
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}

/* ═══════════ `2026-08-26` — LA IDENTIDAD DE `L-036`, EXIGIDA SOBRE EL DECK ═══════════
 *
 * ⛔⛔ **Por qué existe, y es el hallazgo que lo paga:** la identidad
 * `%VTR = Visualizaciones / Impresiones` estaba declarada *«exacta en 98 de 98»* y se había medido
 * **sobre el FIXTURE**. Ahí no puede fallar: en la fuente la terna del ACUMULADO cierra (`M/J = N`)
 * y la de Programmatic cierra consigo misma (`AB/Y = AC`), así que **las dos dan verde** — y la
 * MEZCLA que el motor publicaba, `J` con `AB` y `AC`, **sólo aparece en el deck**.
 *
 * Del 25 al 26/08 `L-036` publicó `Visualizaciones` y `% VTR` de **Programmatic** con la identidad
 * en verde, porque nadie la exigía sobre lo publicado. Con los números de Parque Avellaneda:
 * `55.946 / 450.295 = 12,4 %` contra el `63,5 %` que salía al lado. **Eso es lo que este control
 * caza y el del fixture no.**
 *
 * ⭐ **No hardcodea la geometría de la tabla: la aprende de la PLANTILLA.** Busca cada
 * `{{post_*}}` en `L-036` de la plantilla, se guarda su `fila`/`col`, y lee **esas mismas celdas**
 * en el deck. Si alguien mueve una columna, el control la sigue.
 *
 * ⭐ **Control positivo:** si en la plantilla no encuentra las 12 posiciones, **aborta**. Un
 * instrumento que no ve lo conocido no vio nada, y «no falla» se leería como «cierra».
 *
 * ⚠ **Y declara QUÉ DECK leyó**, con nombre y fecha: dos corridas seguidas producen nombres casi
 * idénticos y ya costó medio día mirar el deck de la corrida anterior (`C-84`).
 */
var TOKENS_IDENTIDAD_L036_ = { imp: 'post_impresiones', vis: 'post_vistas', vtr: 'post_vtr' };

/** Número publicado a `Number`. `miles` viene `1.234.567`; `fraccion`, `62.7`. */
function numeroPublicado_(texto) {
  var t = String(texto || '').trim();
  if (t === '') return null;
  // Los símbolos de hueco no son números y no se cuentan como cero.
  if (t.indexOf('/////') !== -1 || t === '---' || t === '-' || t.indexOf('FALTA') !== -1) return null;
  var soloGuiones = t.replace(/[-\s]/g, '');
  if (soloGuiones === '') return null;
  // `_revisar` publica entre guiones: se le sacan para leer el número.
  t = t.replace(/^-+/, '').replace(/-+$/, '').trim();
  // Miles con punto y decimal con coma o punto: se normaliza a punto decimal.
  if (/^\d{1,3}(\.\d{3})+([,.]\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(',', '.');
  var n = Number(t.replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? null : n;
}

/** `{ 'post_vistas1': { fila: 3, col: 5 }, … }` leído de la PLANTILLA. */
function posicionesDeTokensL036_(informeId) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) return { ok: false, motivo: 'informe sin plantilla_id' };

  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  var pos = {}, orden = null;
  for (var i = 0; i < slides.length; i++) {
    if (anclaDeLamina_(slides[i]) !== 'L-036') continue;
    orden = i + 1;
    piezasDeTextoDeSlide_(slides[i]).forEach(function (pieza) {
      var m = /^tabla fila (\d+) col (\d+)$/.exec(String(pieza.contenedor || ''));
      if (!m) return;
      var t;
      RE_TOKEN_.lastIndex = 0;
      while ((t = RE_TOKEN_.exec(pieza.texto)) !== null) {
        pos[t[1]] = { fila: Number(m[1]), col: Number(m[2]) };
      }
    });
    break;
  }
  if (orden === null) return { ok: false, motivo: 'L-036 no está en la plantilla de ' + informeId };
  return { ok: true, orden_plantilla: orden, posiciones: pos };
}

/** El Slides más reciente de la carpeta de salida cuyo nombre nombre a este informe. */
function ultimoDeckDe_(informeId) {
  var carpetaId = leerConfig().carpeta_salida;
  if (!carpetaId) return { ok: false, motivo: 'CONFIG.carpeta_salida no está cargado' };
  var archivos;
  try {
    archivos = DriveApp.getFolderById(carpetaId).getFilesByType(MimeType.GOOGLE_SLIDES);
  } catch (e) {
    return { ok: false, motivo: 'no pude abrir la carpeta de salida: ' + e.message };
  }
  var mejor = null;
  while (archivos.hasNext()) {
    var f = archivos.next();
    if (String(f.getName()).indexOf(informeId) === -1) continue;
    if (!mejor || f.getDateCreated() > mejor.getDateCreated()) mejor = f;
  }
  if (!mejor) return { ok: false, motivo: 'ningún deck de `' + informeId + '` en la carpeta de salida' };
  return { ok: true, id: mejor.getId(), nombre: mejor.getName(), fecha: mejor.getDateCreated() };
}

/**
 * ⭐ **El botón.** Sin `_` y sin parámetros — las dos condiciones de `CLAUDE.md` §2.
 * Se corre **después** de generar `jm`, y contesta una sola cosa: *¿el `% VTR` que publicó el deck
 * es el cociente de las otras dos celdas de SU MISMA FILA?*
 */
function verificarIdentidadPublicadaL036() {
  var INFORME = 'jm';
  var FILAS = 4;

  var plant = posicionesDeTokensL036_(INFORME);
  if (!plant.ok) { Logger.log('⛔ FALLÓ: ' + plant.motivo); return plant; }

  /* ── Control positivo: las 12 posiciones tienen que estar ─────────────────────────── */
  var faltan = [];
  for (var n = 1; n <= FILAS; n++) {
    ['imp', 'vis', 'vtr'].forEach(function (k) {
      var tok = TOKENS_IDENTIDAD_L036_[k] + n;
      if (!plant.posiciones[tok]) faltan.push(tok);
    });
  }
  Logger.log('CONTROL POSITIVO · posiciones halladas en la plantilla: ' +
    (12 - faltan.length) + ' de 12');
  if (faltan.length) {
    Logger.log('⛔ ABORTA: no encontré ' + faltan.length + ' token(s) en la tabla de L-036: ' +
      faltan.join(', '));
    Logger.log('   Un instrumento que no ve lo conocido no vio nada. NO se lee el deck.');
    return { ok: false, motivo: 'control positivo en rojo', faltan: faltan };
  }

  var deck = ultimoDeckDe_(INFORME);
  if (!deck.ok) { Logger.log('⛔ FALLÓ: ' + deck.motivo); return deck; }
  Logger.log('');
  Logger.log('⭐ DECK LEÍDO: "' + deck.nombre + '"  ·  creado ' + deck.fecha.toISOString());
  Logger.log('   (dos corridas seguidas producen nombres casi idénticos: por eso se declara)');

  /* ── Las celdas del deck, en las MISMAS posiciones que la plantilla ────────────────── */
  var slides = SlidesApp.openById(deck.id).getSlides();
  var celdas = {};
  var laminas = 0;
  slides.forEach(function (slide) {
    if (anclaDeLamina_(slide) !== 'L-036') return;
    laminas++;
    piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
      var m = /^tabla fila (\d+) col (\d+)$/.exec(String(pieza.contenedor || ''));
      if (m) celdas[m[1] + ',' + m[2]] = String(pieza.texto || '').trim();
    });
  });
  if (!laminas) {
    Logger.log('⛔ FALLÓ: el deck no tiene ninguna lámina con ancla `L-036`.');
    return { ok: false, motivo: 'L-036 no está en el deck' };
  }
  if (laminas > 1) Logger.log('⚠ el deck tiene ' + laminas + ' láminas `L-036`: se leyó la última.');

  /* ── La identidad, fila por fila ───────────────────────────────────────────────────── */
  Logger.log('');
  Logger.log('IDENTIDAD  %VTR = Visualizaciones / Impresiones  (sobre lo PUBLICADO)');
  var evaluadas = 0, cierran = 0, fallan = [];
  var detalle = [];
  for (var f = 1; f <= FILAS; f++) {
    var leer = function (k) {
      var pp = plant.posiciones[TOKENS_IDENTIDAD_L036_[k] + f];
      return celdas[pp.fila + ',' + pp.col];
    };
    var tImp = leer('imp'), tVis = leer('vis'), tVtr = leer('vtr');
    var imp = numeroPublicado_(tImp), vis = numeroPublicado_(tVis), vtr = numeroPublicado_(tVtr);
    var fila = { fila: f, impresiones: tImp, visualizaciones: tVis, vtr: tVtr };

    if (imp === null || vis === null || vtr === null) {
      Logger.log('  fila ' + f + ' · sin datos en alguna celda — NO se evalúa  ' +
        '(imp="' + tImp + '" vis="' + tVis + '" vtr="' + tVtr + '")');
      fila.veredicto = 'sin_datos';
      detalle.push(fila);
      continue;
    }
    if (imp === 0) {
      Logger.log('  fila ' + f + ' · impresiones = 0 — NO se evalúa, no se divide por cero');
      fila.veredicto = 'denominador_cero';
      detalle.push(fila);
      continue;
    }
    evaluadas++;
    /* El `%VTR` se publica con UN decimal (`fraccion` = `Math.round(v*1000)/10`), así que la
     * comparación es a un decimal. Exigir más sería exigirle al formato, no al dato. */
    var esperado = Math.round((vis / imp) * 1000) / 10;
    var ok = Math.abs(esperado - vtr) <= 0.1;
    if (ok) cierran++; else fallan.push(f);
    fila.esperado = esperado;
    fila.veredicto = ok ? 'cierra' : 'NO CIERRA';
    detalle.push(fila);
    Logger.log('  fila ' + f + ' · ' + (ok ? '✅' : '⛔') + '  ' + tVis + ' / ' + tImp +
      ' = ' + esperado + '  ·  publicado ' + tVtr);
  }

  Logger.log('');
  Logger.log(fallan.length
    ? '⛔ NO CIERRA en ' + fallan.length + ' de ' + evaluadas + ' fila(s) con datos: ' + fallan.join(', ')
    : '✅ cierra en ' + cierran + ' de ' + evaluadas + ' fila(s) con datos');
  Logger.log('   evaluadas ' + evaluadas + ' de ' + FILAS + ' filas ' +
    '(un control tiene que declarar CUÁNTO midió: cero es un problema, no un silencio)');

  if (!evaluadas) {
    Logger.log('');
    Logger.log('⛔ CERO filas evaluadas. Esto NO es «cierra»: es que el deck no publicó números.');
    return { ok: false, motivo: 'cero filas evaluadas', deck: deck.nombre, detalle: detalle };
  }

  /* Los avisos van ÚLTIMOS, después del veredicto (`CLAUDE.md` §4). */
  Logger.log('');
  Logger.log('⚠ Lo que este control NO contesta:');
  Logger.log('   · Si los valores son los de la SEMANA. Cierra sobre lo que el motor leyó —');
  Logger.log('     consistente no es correcto, y una fila entera de Programmatic cerraría igual');
  Logger.log('     si las TRES celdas salieran de ese bloque.');
  Logger.log('   · Nada sobre las otras cuatro columnas de la tabla.');

  return {
    ok: fallan.length === 0, deck: deck.nombre, deck_id: deck.id,
    evaluadas: evaluadas, cierran: cierran, fallan: fallan, detalle: detalle
  };
}

/**
 * El acompañante de lectura: las mismas celdas **como las trae la FUENTE**, con el ANTES —lo que
 * el título repetido entregaba, el bloque Programmatic— al lado del DESPUÉS.
 *
 * ⚠ **No reemplaza al control de arriba.** Esto lee la fuente; aquél lee el deck, y la diferencia
 * entre los dos es justamente lo que dejó vivir el bug.
 */
function compararAntesYDespuesPostL036() {
  var COLS = {
    'Impresiones totales': 'J', 'Visualizaciones totales': 'M', '% VTR total': 'N',
    'Visualizaciones Programmatic': 'AB', '% VTR Programmatic': 'AC'
  };
  var lectura = leerFuente('reuniones',
    { ok: true, desde: new Date(2020, 0, 1), hasta: new Date(2030, 11, 31), origen: 'diag 26/08' },
    'Agenda JM | Post');
  if (!lectura.ok) { Logger.log('⛔ FALLÓ: ' + lectura.motivo); return lectura; }

  Logger.log('ANTES/DESPUÉS de las celdas de `L-036`, leídas de la FUENTE — ' + new Date().toISOString());
  Logger.log('  ANTES  = lo que entregaba el título repetido: el bloque Programmatic (AB/AC)');
  Logger.log('  DESPUÉS= lo que entrega el título único: el acumulado (M/N)');
  Logger.log('');
  var filas = 0;
  lectura.filas.forEach(function (o) {
    var vistas = o['Visualizaciones totales'], vtr = o['% VTR total'];
    var antesV = o['Visualizaciones Programmatic'], antesP = o['% VTR Programmatic'];
    if (vistas === '' || vistas === undefined) return;
    filas++;
    if (filas > 12) return;
    Logger.log('  ' + o['ID'] + ' · ' + o['Barrio / Comuna'] +
      '  ·  Visualizaciones ' + antesV + ' → ' + vistas +
      '  ·  %VTR ' + (Math.round(Number(antesP) * 1000) / 10) + ' → ' + (Math.round(Number(vtr) * 1000) / 10));
  });
  Logger.log('');
  Logger.log('  ' + filas + ' fila(s) con visualizaciones (se listan hasta 12)');
  Logger.log('⚠ Qué filas entran a `L-036` lo decide el TEMARIO, no esta lista.');
  return { ok: true, filas: filas };
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-27_2` Parte A — **los dos GATES, contra la hoja VIVA**
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * ⛔⛔ **Esto no se puede contestar desde el repo, y por eso existe.** `A.7` y `A.8` preguntan por
 * **todas las filas vivas de `REUNIONES`**, y el snapshot más reciente en disco es del **26/08** —
 * anterior a las filas que el asistente escribió el 27 y que causaron el fallo. Un gate contra una
 * foto vieja **no es el gate**: es otra medición, la del día que se sacó la foto.
 *
 * ⚠ **Sin `_` final y SIN PARÁMETROS**, que son las dos condiciones para que Apps Script la liste
 * en el desplegable (`CLAUDE.md` §2). Y devuelve por `Logger.log`: desde el editor, una función
 * que sólo retorna es una que no dice nada.
 *
 * ⛔ **SÓLO LECTURA.** No escribe una celda, no crea hojas, no borra nada.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */
function verificarGatesDelTemario() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
  if (!hoja) {
    Logger.log('⛔ La hoja REUNIONES no existe.');
    return { ok: false, motivo: 'no existe REUNIONES' };
  }

  var datos = hoja.getDataRange().getValues();
  var headers = (datos.shift() || []).map(function (h) { return String(h || '').trim(); });
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var faltan = ['periodo_id', 'eje', 'nombre', 'fecha', 'etapa', 'mostrar', 'texto_original']
    .filter(function (c) { return idx[c] === undefined; });
  if (faltan.length) {
    Logger.log('⛔ A REUNIONES le faltan columnas: ' + faltan.join(', '));
    return { ok: false, motivo: 'faltan columnas: ' + faltan.join(', ') };
  }

  var filas = [];
  datos.forEach(function (f, i) {
    /* ⚠ **Se cuentan TODAS las filas con algo escrito, no las que pasan un filtro.** Filtrar acá
     * por `eje` sería preguntarle al filtro que se está por cambiar cuáles filas existen — que es
     * exactamente el error que `reunionesOcultasPorMostrar_` comete hoy. */
    var vacia = headers.every(function (h, k) { return String(f[k] == null ? '' : f[k]).trim() === ''; });
    if (vacia) return;
    var o = { fila: i + 2 };
    headers.forEach(function (h, k) { o[h] = f[k]; });
    filas.push(o);
  });

  Logger.log('== GATES del temario · REUNIONES viva ==');
  Logger.log('Filas con contenido: ' + filas.length);

  /* ── A.7 · la clave SIN `eje` no puede colisionar ─────────────────────────────────────── */
  var claveSinEje = function (o) {
    /* ⭐ Se arma con `claveReunion_` REAL sobre una copia con `eje` en blanco, en vez de escribir
     * una segunda fórmula: si la clave cambia, este gate se entera. */
    var copia = {};
    Object.keys(o).forEach(function (k) { copia[k] = o[k]; });
    copia.eje = '';
    return claveReunion_(copia);
  };

  var conEje = {};
  var sinEje = {};
  filas.forEach(function (o) {
    var kc = claveReunion_(o);
    conEje[kc] = (conEje[kc] || 0) + 1;
    var k = claveSinEje(o);
    if (!sinEje[k]) sinEje[k] = [];
    sinEje[k].push(o);
  });

  var colisiones = Object.keys(sinEje).filter(function (k) { return sinEje[k].length > 1; });
  Logger.log('');
  Logger.log('A.7 · claves CON eje: ' + Object.keys(conEje).length +
    ' · claves SIN eje: ' + Object.keys(sinEje).length + ' · sobre ' + filas.length + ' fila(s)');
  if (colisiones.length) {
    Logger.log('⛔ GATE A.7 FALLA — sacar `eje` de la clave declararía duplicado lo que no lo es:');
    colisiones.forEach(function (k) {
      Logger.log('   clave "' + k + '" la comparten ' + sinEje[k].length + ' filas:');
      sinEje[k].forEach(function (o) {
        Logger.log('      fila ' + o.fila + ' · eje=' + JSON.stringify(String(o.eje || '')) +
          ' · texto=' + JSON.stringify(String(o.texto_original || '').slice(0, 60)));
      });
    });
  } else {
    Logger.log('✅ GATE A.7 pasa — ninguna colisión al sacar `eje`.');
  }

  /* ⚠ **Y la colisión que YA existe hoy, con `eje` adentro.** Medido el 27/08 sobre el temario
   * real: tres líneas que no parsean dan la misma clave las tres, así que el dedupe colapsa
   * **tres líneas en una fila**. No la causa sacar `eje` — ya está — pero quien lea A.7 tiene que
   * verla, o va a atribuir al cambio una colisión que es anterior. */
  var colisionHoy = Object.keys(conEje).filter(function (k) { return conEje[k] > 1; });
  Logger.log('⚠ Colisiones que YA existen hoy, con `eje` en la clave: ' +
    (colisionHoy.length ? colisionHoy.join(' | ') : 'ninguna'));

  /* ── A.8 · `texto_original` sirve como reemplazo del filtro ───────────────────────────── */
  var sinTexto = filas.filter(function (o) { return String(o.texto_original || '').trim() === ''; });
  var sinTextoYMostrar = sinTexto.filter(function (o) { return esVerdadero_(o.mostrar); });
  Logger.log('');
  Logger.log('A.8 · filas con `texto_original` VACÍO: ' + sinTexto.length +
    ' · de ésas con `mostrar` verdadero: ' + sinTextoYMostrar.length);
  sinTexto.forEach(function (o) {
    Logger.log('   fila ' + o.fila + ' · periodo=' + JSON.stringify(String(o.periodo_id || '')) +
      ' · eje=' + JSON.stringify(String(o.eje || '')) +
      ' · nombre=' + JSON.stringify(String(o.nombre || '')) +
      ' · mostrar=' + JSON.stringify(String(o.mostrar || '')));
  });
  if (sinTextoYMostrar.length) {
    Logger.log('⛔ GATE A.8 FALLA — con el criterio nuevo esas filas NO entrarían, y hoy sí entran.');
  } else {
    Logger.log('✅ GATE A.8 pasa — ninguna fila viva depende de `eje` para entrar.');
  }

  /* ── A.9 · estado de la hoja hoy ──────────────────────────────────────────────────────── */
  var conEjeVacio = filas.filter(function (o) { return String(o.eje || '').trim() === ''; });
  Logger.log('');
  Logger.log('A.9 · filas con `eje` VACÍO: ' + conEjeVacio.length);
  conEjeVacio.forEach(function (o) {
    Logger.log('   fila ' + o.fila + ' · periodo=' + JSON.stringify(String(o.periodo_id || '')) +
      ' · mostrar=' + JSON.stringify(String(o.mostrar || '')) +
      ' · texto=' + JSON.stringify(String(o.texto_original || '').slice(0, 70)) +
      ' · notas=' + JSON.stringify(String(o.notas || '').slice(0, 40)));
  });

  var porPeriodo = {};
  filas.forEach(function (o) {
    var p = String(o.periodo_id || '(sin periodo)').trim();
    if (!porPeriodo[p]) porPeriodo[p] = { total: 0, sin_eje: 0, mostrando: 0 };
    porPeriodo[p].total++;
    if (String(o.eje || '').trim() === '') porPeriodo[p].sin_eje++;
    if (esVerdadero_(o.mostrar)) porPeriodo[p].mostrando++;
  });
  Logger.log('');
  Logger.log('A.9 · por período — total · sin eje · con mostrar verdadero:');
  Object.keys(porPeriodo).forEach(function (p) {
    var x = porPeriodo[p];
    Logger.log('   ' + p + ': ' + x.total + ' · ' + x.sin_eje + ' · ' + x.mostrando);
  });

  var ok = colisiones.length === 0 && sinTextoYMostrar.length === 0;
  Logger.log('');
  Logger.log(ok ? '✅ LOS DOS GATES PASAN — la Parte D se puede ejecutar.'
                : '⛔ ALGÚN GATE FALLA — la Parte D NO se ejecuta. Ver arriba.');
  Logger.log('');
  Logger.log('⚠ Lo que esto NO contesta:');
  Logger.log('   · Si las filas con `eje` vacío hay que borrarlas. Eso lo decidís vos: con el');
  Logger.log('     cambio de la Parte D pasan de inertes a poder ENTRAR al informe si están');
  Logger.log('     tildadas.');
  Logger.log('   · Nada sobre CAMPANAS: esa hoja es otra pregunta.');

  return {
    ok: ok,
    filas: filas.length,
    a7: {
      claves_con_eje: Object.keys(conEje).length,
      claves_sin_eje: Object.keys(sinEje).length,
      colisiones: colisiones,
      colisiones_hoy: colisionHoy
    },
    a8: { sin_texto_original: sinTexto.length, y_con_mostrar: sinTextoYMostrar.length },
    a9: { sin_eje: conEjeVacio.length, por_periodo: porPeriodo }
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-28_2` A.5 — ¿la plantilla trae elementos VINCULADOS a una fuente externa?
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */


/**
 * Censo de elementos vinculados de las plantillas vivas — **sólo lectura**.
 *
 * ⭐ **Por qué existe, y por qué no lo contesta un `grep`.** La nocturna del 28/08 midió que el
 * motor **sólo hace `replaceAllText`** —25 apariciones, cero de `insertSheetsChart`,
 * `setLinkUrl`, `insertImage`— y de ahí se quiso concluir *«el deck es texto sellado, compartirlo
 * no filtra nada»*. **Esa conclusión no se sigue:** la plantilla es del equipo (`C-01`), el motor
 * la **copia entera**, y un gráfico vinculado que ya viene de fábrica **sobrevive a la copia**.
 * Lo que el motor no inserta y lo que el deck no lleva son dos afirmaciones distintas.
 *
 * ⛔ **Es el gate de la Parte B del `2026-08-28_2`.** Un `SHEETS_CHART` exige que quien abre el
 * deck tenga acceso a **la planilla de origen** para poder renderizarlo, así que compartir el
 * deck con la lista de `mails_autorizados` sería, por la ventana del gráfico, compartir la base.
 * Si esto devuelve cero, la propiedad queda **afirmada con su comando** en vez de supuesta.
 *
 * ⭐ **El control positivo es el histograma completo, y no es adorno.** Un censo que sólo informa
 * lo que sospecha **no distingue «no hay» de «no miré»**: las dos salidas se ven idénticas en el
 * log. Acá el contraste lo dan los `SHAPE` —los `{{token}}` viven ahí, así que **tienen que
 * aparecer**— y los conteos `n de m` de plantillas, láminas y elementos. ⛔ **Si una plantilla
 * devuelve cero elementos, esto FALLA en vez de informar «sin vínculos»**, porque un cero de
 * lectura y un cero de hallazgo mandan a trabajos opuestos.
 *
 * ⚠ **Los errores de lectura se cuentan aparte y NO se tragan.** Un `try/catch` que devuelve
 * «nada» sobre un elemento ilegible convierte una falla en un verde — es la figura que este repo
 * ya pagó. Cada fallo va al reporte con el tipo y la lámina.
 *
 * ⭐ **Las plantillas salen de `INFORMES`, no de una lista en el código** (`D-01`): una tercera
 * plantilla entra sola.
 *
 * ⛔ **No escribe nada.** Abre por id, recorre y reporta.
 */
function censarElementosVinculadosDePlantillas() {
  var informes = leerInformes();
  var ids = Object.keys(informes);

  var res = {
    plantillas_declaradas: ids.length,
    plantillas_leidas: 0,
    laminas: 0,
    elementos: 0,
    por_tipo: {},
    vinculados: [],
    links: [],
    imagenes_con_origen: [],
    notas_con_url: [],
    errores: [],
    plantillas: []
  };

  ids.forEach(function (informeId) {
    var informe = informes[informeId];
    var plantillaId = String((informe && informe.plantilla_id) || '').trim();
    if (!plantillaId) {
      res.errores.push({ informe_id: informeId, donde: 'INFORMES', que: 'plantilla_id vacío' });
      return;
    }

    var pres;
    try {
      pres = SlidesApp.openById(plantillaId);
    } catch (e) {
      res.errores.push({ informe_id: informeId, donde: 'openById', que: String(e && e.message ? e.message : e) });
      return;
    }

    var slides = pres.getSlides();
    var antesElementos = res.elementos;

    slides.forEach(function (slide, i) {
      res.laminas++;
      var nro = i + 1;
      censarElementosA5_(slide.getPageElements(), informeId, nro, '', res);

      // Las notas del orador viajan con `slide.duplicate()` —medido, `2026-08-21`— y el sellado
      // escribe ahí. Una URL pegada en una nota se copia al deck igual que una en una forma.
      try {
        var notas = slide.getNotesPage().getSpeakerNotesShape();
        if (notas) {
          var txt = notas.getText().asString();
          if (/https?:\/\//.test(txt)) {
            res.notas_con_url.push({ informe_id: informeId, lamina: nro, muestra: txt.slice(0, 120) });
          }
        }
      } catch (e) {
        res.errores.push({ informe_id: informeId, lamina: nro, donde: 'notas', que: String(e && e.message ? e.message : e) });
      }
    });

    res.plantillas_leidas++;
    res.plantillas.push({
      informe_id: informeId,
      plantilla_id: plantillaId,
      nombre: pres.getName(),
      laminas: slides.length,
      elementos: res.elementos - antesElementos
    });
  });

  // ── El control positivo, y falla en vez de informar cero ───────────────────────────────────
  var fallas = [];
  if (!res.plantillas_leidas) fallas.push('no se pudo leer NINGUNA plantilla');
  res.plantillas.forEach(function (p) {
    if (!p.laminas) fallas.push(p.informe_id + ': la plantilla no devolvió ninguna lámina');
    if (!p.elementos) fallas.push(p.informe_id + ': la plantilla no devolvió ningún elemento');
  });
  if (!res.por_tipo.SHAPE) {
    fallas.push('ninguna plantilla devolvió un SHAPE — los `{{token}}` viven ahí, así que ' +
      'un cero es un fallo de lectura y no un hallazgo');
  }
  res.control_positivo = fallas.length ? { ok: false, fallas: fallas } : { ok: true };

  // ── El reporte, y el veredicto ANTES de los avisos ─────────────────────────────────────────
  Logger.log('CENSO de elementos vinculados — plantillas ' + res.plantillas_leidas + ' de ' +
    res.plantillas_declaradas + ' · láminas ' + res.laminas + ' · elementos ' + res.elementos);
  res.plantillas.forEach(function (p) {
    Logger.log('   ' + p.informe_id + ' · «' + p.nombre + '» · ' + p.laminas + ' láminas · ' +
      p.elementos + ' elementos');
  });

  Logger.log('— histograma (control positivo: SHAPE tiene que estar) —');
  Object.keys(res.por_tipo).sort().forEach(function (t) {
    Logger.log('   ' + t + ': ' + res.por_tipo[t]);
  });

  if (!res.control_positivo.ok) {
    Logger.log('⛔ CONTROL POSITIVO EN ROJO — el censo NO midió lo que dice medir:');
    res.control_positivo.fallas.forEach(function (f) { Logger.log('   · ' + f); });
    Logger.log('⛔ El resto de este reporte no se puede leer como «no hay vínculos».');
    return res;
  }

  var total = res.vinculados.length + res.links.length + res.imagenes_con_origen.length +
    res.notas_con_url.length;
  Logger.log(total === 0
    ? '✅ CERO elementos vinculados, cero links, cero imágenes con origen externo y cero notas ' +
      'con URL. El deck es texto sellado: compartirlo no expone ninguna fuente.'
    : '⛔ HAY ' + total + ' elemento(s) que atan el deck a una fuente externa — la Parte B del ' +
      '`2026-08-28_2` NO se ejecuta: es una decisión del usuario.');

  [['vinculados', res.vinculados], ['links', res.links],
   ['imágenes con origen', res.imagenes_con_origen], ['notas con URL', res.notas_con_url]
  ].forEach(function (par) {
    if (!par[1].length) return;
    Logger.log('— ' + par[0] + ' (' + par[1].length + ') —');
    par[1].forEach(function (x) { Logger.log('   ' + JSON.stringify(x)); });
  });

  // Los avisos van ÚLTIMOS, después del veredicto: un `⚠` en el medio de un reporte que termina
  // en `✅` se lee como verde (`CLAUDE.md` §4).
  if (res.errores.length) {
    Logger.log('⚠ ' + res.errores.length + ' elemento(s)/lámina(s) NO se pudieron leer. El ' +
      'veredicto de arriba no cubre a éstos:');
    res.errores.forEach(function (e) { Logger.log('   ' + JSON.stringify(e)); });
  }
  Logger.log('⚠ Lo que este censo NO contesta: qué trae un deck YA generado. Mide la plantilla, ' +
    'que es de donde el deck sale — no los archivos de la carpeta de salida.');

  return res;
}

/**
 * El recorrido, recursivo un nivel por cada `GROUP` — la misma forma que
 * `eliminarElementosFueraDeCanvas_` (`Armonizar.gs`), que ya la tenía escrita.
 *
 * ⚠ Cada lectura va en su propio `try`: un elemento ilegible **suma a `errores`** y no
 * desaparece del conteo.
 */
function censarElementosA5_(elementos, informeId, lamina, prefijo, res) {
  elementos.forEach(function (el) {
    res.elementos++;

    var tipo;
    try {
      tipo = String(el.getPageElementType());
    } catch (e) {
      res.errores.push({ informe_id: informeId, lamina: lamina, donde: 'getPageElementType', que: String(e && e.message ? e.message : e) });
      return;
    }
    res.por_tipo[tipo] = (res.por_tipo[tipo] || 0) + 1;
    var donde = { informe_id: informeId, lamina: lamina, ruta: prefijo + tipo };

    if (tipo === 'GROUP') {
      try {
        censarElementosA5_(el.asGroup().getChildren(), informeId, lamina, prefijo + 'GROUP/', res);
      } catch (e) {
        res.errores.push({ informe_id: informeId, lamina: lamina, donde: 'GROUP', que: String(e && e.message ? e.message : e) });
      }
      return;
    }

    if (tipo === 'SHEETS_CHART') {
      try {
        var ch = el.asSheetsChart();
        res.vinculados.push({
          informe_id: informeId, lamina: lamina, tipo: tipo,
          spreadsheet_id: ch.getSpreadsheetId(), chart_id: ch.getChartId()
        });
      } catch (e) {
        // Un gráfico que no se deja leer **igual es un gráfico vinculado**: se registra como
        // hallazgo Y como error, porque no saber de qué planilla cuelga es peor, no mejor.
        res.vinculados.push({ informe_id: informeId, lamina: lamina, tipo: tipo, spreadsheet_id: '(no legible)' });
        res.errores.push({ informe_id: informeId, lamina: lamina, donde: 'SHEETS_CHART', que: String(e && e.message ? e.message : e) });
      }
      return;
    }

    if (tipo === 'VIDEO') {
      try {
        res.vinculados.push({ informe_id: informeId, lamina: lamina, tipo: tipo, url: el.asVideo().getUrl() });
      } catch (e) {
        res.vinculados.push({ informe_id: informeId, lamina: lamina, tipo: tipo, url: '(no legible)' });
        res.errores.push({ informe_id: informeId, lamina: lamina, donde: 'VIDEO', que: String(e && e.message ? e.message : e) });
      }
      return;
    }

    if (tipo === 'IMAGE') {
      try {
        var src = el.asImage().getSourceUrl();
        // `null` es lo normal en una imagen pegada: sólo se anota la que declara origen.
        if (src) res.imagenes_con_origen.push({ informe_id: informeId, lamina: lamina, source_url: src });
      } catch (e) {
        res.errores.push({ informe_id: informeId, lamina: lamina, donde: 'IMAGE', que: String(e && e.message ? e.message : e) });
      }
      return;
    }

    if (tipo === 'SHAPE') {
      censarLinksDeTextoA5_(function () { return el.asShape().getText(); }, donde, res);
      return;
    }

    if (tipo === 'TABLE') {
      try {
        var tabla = el.asTable();
        for (var f = 0; f < tabla.getNumRows(); f++) {
          for (var c = 0; c < tabla.getNumColumns(); c++) {
            (function (fi, ci) {
              censarLinksDeTextoA5_(function () { return tabla.getCell(fi, ci).getText(); },
                { informe_id: informeId, lamina: lamina, ruta: prefijo + 'TABLE[' + fi + ',' + ci + ']' }, res);
            })(f, c);
          }
        }
      } catch (e) {
        res.errores.push({ informe_id: informeId, lamina: lamina, donde: 'TABLE', que: String(e && e.message ? e.message : e) });
      }
    }
  });
}

/** Links de un `TextRange`, más el barrido por texto para lo que `getLinks()` no ve. */
function censarLinksDeTextoA5_(obtenerTexto, donde, res) {
  var texto;
  try {
    texto = obtenerTexto();
  } catch (e) {
    res.errores.push({ informe_id: donde.informe_id, lamina: donde.lamina, donde: donde.ruta + '/getText', que: String(e && e.message ? e.message : e) });
    return;
  }
  if (!texto) return;

  try {
    (texto.getLinks() || []).forEach(function (l) {
      var url = '';
      try { url = l.getLink().getUrl(); } catch (e2) { url = '(no legible)'; }
      res.links.push({ informe_id: donde.informe_id, lamina: donde.lamina, ruta: donde.ruta, url: url });
    });
  } catch (e) {
    res.errores.push({ informe_id: donde.informe_id, lamina: donde.lamina, donde: donde.ruta + '/getLinks', que: String(e && e.message ? e.message : e) });
  }

  // ⚠ Una URL **tipeada** no es un `Link` y `getLinks()` no la ve, pero expone la fuente igual
  // que una: quien la lee la copia y la pega. Se cuenta como link, con el motivo.
  try {
    var s = texto.asString();
    if (/https?:\/\//.test(s)) {
      res.links.push({ informe_id: donde.informe_id, lamina: donde.lamina, ruta: donde.ruta,
        url: '(texto plano) ' + s.slice(0, 120) });
    }
  } catch (e) { /* asString sobre un texto ilegible ya se anotó arriba */ }
}


/* ══════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-31_3` Parte A — TESTIGO DE ESTRUCTURA
 *
 * ⭐⭐ **Es el instrumento que faltaba, y su razón de ser es lo que NO mide.** Todos los testigos
 * de este archivo miden **números**. El defecto que este prompt arregla —la sección de campaña
 * destacada expandida dos veces, nueve láminas repetidas— **no se ve en ningún valor**: las
 * dieciocho láminas publican cifras correctas. **Un testigo de valores lo habría dado por bueno.**
 *
 * Lo que mide: por cada sección repetible del informe, **cuántos ítems produce y con qué clave**.
 * Ésa es la unidad de la que sale una lámina, así que un ítem de más es una tanda de láminas de
 * más — y el diff antes/después lo dice sin abrir el deck.
 *
 * ⚠ **Cuenta LÁMINAS DECLARADAS en `LAMINAS`, no slides de la plantilla.** Son dos preguntas
 * distintas (`D-37`: la pertenencia la declara el registro) y sólo la segunda necesita abrir el
 * deck. Lo que este testigo predice es **cuántas láminas debería producir la expansión**; que la
 * plantilla las tenga es de la corrida.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

/* El caso que se está midiendo. ⚠ **No es configuración del motor**: es el período del incidente
 * del 31/08, y vive acá porque un instrumento declara qué midió. Si mañana se mide otro, se cambia
 * acá y el encabezado del log lo dice solo. */
var PERIODO_TESTIGO_ESTRUCTURA_ = '2026_agosto_21_28';

/* ⭐ **El control positivo, y comparte camino con lo que se mide** (`CLAUDE.md` §4). `encuentro`
 * TIENE que dar al menos un ítem: `REUNIONES` viva trae «Coghlan» con este mismo `periodo_id`.
 *
 * ⛔ **Sin esto, un instrumento roto es indistinguible de uno que mide bien.** Si el anclaje
 * falla, o `leerSeccionesPlano_` devuelve un mapa vacío en silencio —ya pasó, con `leerRegistro_`
 * sin clave primaria—, **todas las secciones darían cero ítems** y el log diría «campana: 0», que
 * se lee como «el arreglo ya está». El control lo convierte en un aborto con motivo. */
var SECCION_CONTROL_ESTRUCTURA_ = 'encuentro';

/**
 * Testigo de estructura de `jm` y de `secco`, en ese orden. **Sin parámetros y sin `_`**, para que
 * aparezca en el desplegable del editor (`CLAUDE.md` §2: son las dos condiciones, y hay que
 * cumplir las dos).
 *
 * ⭐ **Corre los DOS informes**, y no es de más: `secco` también declara la sección `campana` —ocho
 * láminas, `L-016`–`L-023`— y es el que la justificación vencida del 18/08 decía proteger. Un
 * arreglo que arregle `jm` y deje a `secco` sin campaña destacada **es un deck más corto que se
 * lee como éxito**.
 */
function testigoDeEstructura() {
  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('TESTIGO DE ESTRUCTURA (ítems por sección repetible) — ' + new Date().toISOString());
  Logger.log('══════════════════════════════════════════════════════════════════════');

  /* ⛔⛔ **EL PREÁMBULO, COPIADO — no armado.** Las dos líneas son las de `generarInforme`, en el
   * mismo orden. `itemsDeSeccion_('encuentro')` paga `anclarEncuentros` y `unirDigitalPorCuenta`,
   * y sin las dos cachés eso midió **325 s** contra 6 s — factor 54 (`CLAUDE.md` §4). Un
   * instrumento que corre afuera de las cachés mide otra cosa, y el reporte lo declara abajo. */
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    ['jm', 'secco'].forEach(function (informeId) {
      testigoDeEstructuraDeInforme_(informeId, PERIODO_TESTIGO_ESTRUCTURA_);
    });
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }

  Logger.log('');
  Logger.log('── CONDICIONES DE ESTA TOMA ──────────────────────────────────────────');
  Logger.log('  cachés: abrirCacheRegistros_ + abrirCacheDatosHoja_ (las dos de `generarInforme`)');
  Logger.log('  láminas: contadas con `laminaEntraParaItem_`, la función real — por ÍTEM, no N×M.');
  Logger.log('  ⚠ Lo que este testigo NO contesta: si los VALORES de las láminas son correctos, y');
  Logger.log('    si la plantilla tiene las slides que LAMINAS declara. Las dos piden una corrida.');
}

/** Una pasada por informe. Privada: la pública de arriba es la que se corre. */
function testigoDeEstructuraDeInforme_(informeId, periodoId) {
  Logger.log('');
  Logger.log('╔═════════════════════════════════════════════════════════════════════');
  Logger.log('║ INFORME `' + informeId + '`  ·  período pedido `' + periodoId + '`');

  var ventana = resolverVentana({ periodo_ref: periodoId });
  if (!ventana.ok) {
    Logger.log('║ ⛔ ABORTA: no se pudo resolver el período — ' + ventana.motivo);
    Logger.log('╚═════════════════════════════════════════════════════════════════════');
    return;
  }
  Logger.log('║ ventana: ' + formatearFecha_(ventana.desde) + ' → ' + formatearFecha_(ventana.hasta) +
    '  ·  origen `' + ventana.origen + '`');

  /* ⭐ **El conjunto de versiones que describen esta ventana** (`D-53`, consecuencia 2). No es un
   * empate a desempatar: `PERIODOS` puede traer varias filas con la misma ventana porque son
   * **varias versiones del mismo informe**, y lo que corresponde es **decir cuál se tomó**, no
   * elegir una. Con override explícito manda el id de `origen`; esto se imprime igual, para que el
   * día que aparezca una segunda versión se vea acá y no en un número raro. */
  var versiones = periodosQueDescribenLaVentana_(ventana);
  Logger.log('║ versiones de PERIODOS con esta misma ventana: ' +
    (versiones.length ? versiones.length + ' → [' + versiones.join(' · ') + ']' : '0'));
  Logger.log('╚═════════════════════════════════════════════════════════════════════');

  var regL = leerLaminas_();
  var filasLaminas = regL.ok ? regL.filas : [];
  if (!regL.ok) Logger.log('  ⚠ no se pudo leer LAMINAS (' + regL.motivo + ') — las cuentas van en cero');

  var secciones = seccionesRepetiblesDe_(informeId, filasLaminas);
  Logger.log('  secciones repetibles activas con láminas declaradas: ' + secciones.length);

  if (!secciones.length) {
    /* ⛔ **Cero unidades es un problema, no un silencio** (`CLAUDE.md` §4): «ningún ítem de más» y
     * «no se midió nada» se ven idénticos en un log sin conteo. */
    Logger.log('  ⛔ ABORTA: CERO secciones para medir. No es «no hay ítems de más»: es que este');
    Logger.log('     testigo no midió nada. Revisar SECCIONES.estado y LAMINAS.seccion_id.');
    return;
  }

  var totalLaminas = 0;
  var vioElControl = false;
  var itemsDelControl = 0;

  secciones.forEach(function (s) {
    var filasDeLaSeccion = filasLaminas.filter(function (f) {
      return String(f.informe_id || '').trim() === informeId &&
             String(f.seccion_id || '').trim() === s.seccion_id;
    });
    var laminas = filasDeLaSeccion.map(function (f) { return String(f.lamina_id || '').trim(); });

    Logger.log('');
    Logger.log('  ── `' + s.seccion_id + '`  (itera_sobre = ' + (s.itera_sobre || '—') +
      ', modo = ' + s.modo + ')');
    Logger.log('     láminas declaradas: ' + laminas.length + ' [' + laminas.join(' ') + ']');

    var r;
    try { r = itemsDeSeccion_(s, informeId, ventana); }
    catch (e) { Logger.log('     ⛔ EXCEPCIÓN: ' + e); return; }

    if (!r || !r.ok) {
      Logger.log('     ⛔ sin ítems: ' + ((r && r.motivo) || 'itemsDeSeccion_ no devolvió nada'));
      return;
    }

    var claves = (r.items || []).map(function (i) { return String(i.clave || '(sin clave)'); });
    Logger.log('     ⭐ ÍTEMS: ' + claves.length);
    claves.forEach(function (c, i) { Logger.log('        [' + (i + 1) + '] ' + c); });

    /* ⚠ **Las claves repetidas se nombran, y es el defecto que este prompt arregla.** Dos ítems
     * con la misma clave son la misma cosa emitida dos veces — que en el deck son dos tandas de
     * láminas idénticas, con cifras correctas y ningún síntoma. */
    var vistas = {}, repetidas = [], distintas = 0;
    claves.forEach(function (c) {
      if (vistas[c]) { if (repetidas.indexOf(c) === -1) repetidas.push(c); }
      else { vistas[c] = true; distintas++; }
    });
    if (repetidas.length) {
      Logger.log('     ⛔⛔ CLAVE REPETIDA: [' + repetidas.join(' · ') + '] — la sección se expande');
      Logger.log('        más de una vez sobre el MISMO ítem. Son ' + (claves.length - distintas) +
        ' tanda(s) de láminas de más.');
    }

    /* El `periodo_id` que la sección declara haber usado. Vacío significa **no se filtró por
     * período** — y hoy la rama `CAMPANAS` ni siquiera devuelve el campo, que es exactamente el
     * hueco. Se imprime la diferencia entre «no filtró» y «no lo dice». */
    Logger.log('     periodo_id declarado por la sección: ' +
      (r.periodo_id === undefined ? '(no devuelve el campo — NO filtra por período)'
        : (r.periodo_id === '' ? '(vacío — no se filtró por período)' : '`' + r.periodo_id + '`')));

    (r.excluidos || []).forEach(function (x) {
      Logger.log('     · excluido ' + (x.item || x.campana || '?') + ' — ' + (x.motivo || '?'));
    });
    if (!(r.excluidos || []).length) Logger.log('     · excluidos: 0');

    /* ⛔⛔ **`ítems × láminas` ESTÁ MAL, y la primera corrida de este testigo lo publicó.**
     *
     * `LAMINAS.filtro` se evalúa **POR ÍTEM** (`laminaEntraParaItem_`), así que una sección puede
     * declarar N láminas y emitir menos. Medido el 31/08 sobre la toma de las 11:02: `encuentro`
     * de `jm` declara **3** —`L-035 tipo!=Uno a uno`, `L-052` sin filtro, `L-053 tipo=Uno a uno`—
     * y Coghlan es «Uno a uno», así que **entran 2 y no 3**. En `secco` es peor: declara **5** y
     * entran **2**. El producto sobreestimaba las dos.
     *
     * ⭐ **Se usa la función REAL del motor, no una copia de su lógica.** Reimplementar el filtro
     * acá sería el instrumento que reproduce lógica del motor y la reproduce peor (`CLAUDE.md`
     * §4), y además dejaría dos lugares que tienen que decir lo mismo.
     *
     * ⚠ **Esto NO afecta a `campana`**, cuyas 17 filas —9 en `jm`, 8 en `secco`— tienen el
     * `filtro` vacío, verificado en `LAMINAS_2026-08-31.tsv`. El defecto no movía el número que
     * este prompt mide; movía el TOTAL, que es lo que hay que cruzar contra el deck. */
    var laminasEmitidas = 0;
    var detalleFiltradas = [];
    (r.items || []).forEach(function (item) {
      filasDeLaSeccion.forEach(function (f) {
        var v = laminaEntraParaItem_(f, item);
        if (v.entra) laminasEmitidas++;
        else detalleFiltradas.push(String(f.lamina_id || '').trim() + ' ✕ ' +
          String(item.clave || '?') + ' (' + v.motivo + ')');
      });
    });
    Logger.log('     ⇒ láminas que produciría: ' + laminasEmitidas +
      '   (NO es ' + claves.length + ' × ' + laminas.length + ': `LAMINAS.filtro` corre por ítem)');
    detalleFiltradas.forEach(function (d) { Logger.log('        · no entra ' + d); });
    totalLaminas += laminasEmitidas;

    if (s.seccion_id === SECCION_CONTROL_ESTRUCTURA_) {
      vioElControl = true;
      itemsDelControl = claves.length;
    }
  });

  Logger.log('');
  Logger.log('  ═══ TOTAL de láminas de secciones repetibles: ' + totalLaminas + ' ═══');

  /* ⭐ **El control positivo, y va ÚLTIMO a propósito.** Un aviso en el medio de un reporte que
   * termina bien se lee como verde (`CLAUDE.md` §4): los avisos se acumulan y se imprimen después
   * del veredicto, no antes. */
  Logger.log('');
  Logger.log('  ── CONTROL POSITIVO ────────────────────────────────────────────────');
  if (!vioElControl) {
    Logger.log('  ⚠ la sección de control `' + SECCION_CONTROL_ESTRUCTURA_ + '` no está entre las');
    Logger.log('    repetibles de `' + informeId + '` — no hay control, y los conteos de arriba no');
    Logger.log('    distinguen «cero ítems de más» de «el instrumento no vio nada».');
  } else if (itemsDelControl === 0) {
    Logger.log('  ⛔⛔ EL CONTROL FALLÓ: `' + SECCION_CONTROL_ESTRUCTURA_ + '` devolvió CERO ítems.');
    Logger.log('     REUNIONES trae al menos un encuentro con periodo_id = ' + periodoId + ', así');
    Logger.log('     que esto NO es «no hay ítems»: es que algo del camino no está midiendo.');
    Logger.log('     ⇒ NADA de lo de arriba se puede citar.');
  } else {
    Logger.log('  ✅ `' + SECCION_CONTROL_ESTRUCTURA_ + '` devolvió ' + itemsDelControl +
      ' ítem(s) — el camino de lectura funciona, así que un CERO de otra sección es un cero real.');
  }
}


/* ══════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-31_4` Parte A — EL INVENTARIO COMPLETO DE LAS DOS PLANTILLAS
 *
 * ⭐⭐ **Existe porque el censo cuenta lo que no puede nombrar.** `censarTokensSinMarcador_`
 * imprime `N de M sin fila` y lista **sólo los N**: los tokens que **sí** tienen fila se cuentan en
 * el `M` y **no aparecen nunca**, ni en el log ni en el retorno. Para cruzar dos plantillas hace
 * falta exactamente lo contrario — **qué token está en qué lámina de cada una**.
 *
 * ⛔ **Y hay un segundo agujero, medido el 31/08 y peor que el anterior:** el censo hace
 * `if (!sin.length) return`, así que **una lámina con TODOS sus tokens cableados no se imprime en
 * absoluto** — ni siquiera como `0 de M`. **Desaparece del reporte.** A medida que el cableado
 * avanza, el censo ve **menos** láminas, y su conteo de láminas baja sin que nada falle.
 *
 * ══ QUÉ ES ESTA HOJA, Y QUÉ NO ══════════════════════════════════════════════════════════════
 *
 * ⚠ **`_INVENTARIO_TOKENS_<fecha>` es una hoja EFÍMERA DE SALIDA, no un registro.** Se recrea
 * entera en cada corrida y **nadie más la lee**: no está en `ALCANCE_REGISTROS_`, no tiene
 * `SEED_*`, no entra a `instalar()` ni a «Aplicar configuración», y ningún camino del motor la
 * consulta. **Borrarla no rompe nada.**
 *
 * ⭐ **Por qué eso no contradice el «sólo lectura» del prompt:** ese requisito apunta a **las hojas
 * de registro y a las plantillas**, que son las que deciden qué hace el motor y de quién es el
 * dato. Una hoja de salida que el motor ignora no es eso. **Dicho acá y con todas las letras para
 * que dentro de tres meses nadie la confunda con un registro** — que es exactamente cómo nacieron
 * los documentos sueltos que `CLAUDE.md` §3 previene.
 *
 * ⛔ **Lo que esta función NO toca:** `MARCADORES`, `LAMINAS`, `SECCIONES` y las dos plantillas se
 * **leen** y nada más.
 *
 * ⛔ **Y lo que NO hace, porque es la tentación obvia:** no propone armonizar, **no migra ningún
 * marcador a `*`** y no decide si `secco` sube a la granularidad de `jm`. Produce la foto contra la
 * que esa decisión se toma.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

var PREFIJO_HOJA_INVENTARIO_ = '_INVENTARIO_TOKENS_';

var COLUMNAS_INVENTARIO_ = [
  'informe', 'lamina_id', 'orden_plantilla', 'slide_pos', 'token',
  'tiene_fila', 'informe_id_de_la_fila', 'candidato_asterisco',
  'lamina_itera', 'lamina_modo', 'laminas_itera_sobre_crudo',
  'seccion_id', 'escondida'
];

/**
 * El botón. **Sin `_` y sin parámetros**, las dos condiciones del desplegable (`CLAUDE.md` §2).
 */
function volcarInventarioDeTokens() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var nombreHoja = PREFIJO_HOJA_INVENTARIO_ + hoy;

  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('INVENTARIO DE TOKENS — las dos plantillas · ' + new Date().toISOString());
  Logger.log('══════════════════════════════════════════════════════════════════════');

  /* El registro, indexado **por nombre de marcador**, igual que el censo — y guardando el
   * `informe_id`, que allá se guarda y **nunca se lee**. Ése es justamente el dato que el cruce
   * necesita, y por eso acá sale a una columna. */
  var conFila = {};
  var porInformeDeLaFila = {};
  leerMarcadores_().forEach(function (m) {
    var nombre = String(m.marcador || '').trim();
    if (!nombre) return;
    conFila[nombre] = true;
    porInformeDeLaFila[nombre] = String(m.informe_id || '').trim();
  });
  Logger.log('  filas en MARCADORES: ' + Object.keys(conFila).length);

  /* ⭐ **`lamina_itera` sale de `LAMINAS.seccion_id` → `SECCIONES`, que es donde `D-37` lo puso** —
   * y NO de `LAMINAS.itera_sobre`.
   *
   * ⛔ **Medido el 31/08: `LAMINAS.itera_sobre` está VACÍO en las 53 filas**, así que el bloque
   * «N lámina(s) ITERAN» de `censarTokensSinMarcador_` **nunca se disparó**. Su propio comentario
   * ya lo decía para «las 52 filas» y sigue igual con 53.
   *
   * ⭐⭐ **Y por eso la columna cruda va AL LADO, aunque salga vacía:** que el volcado **muestre**
   * el vacío es el testigo de que ese bloque está mudo. **Una columna vacía visible vale más que un
   * dato correcto que tapa el hueco** — sin ella, alguien lee `lamina_itera` lleno y concluye que
   * el censo funcionaba. */
  var secciones = {};
  try { secciones = leerSeccionesPlano_(); }
  catch (e) { Logger.log('  ⚠ no pude leer SECCIONES (' + e.message + '): `lamina_itera` sale vacío.'); }

  var porLamina = {};
  var declaradasPorInforme = {};   // informe → { lamina_id: true }
  var totalFilasLaminas = 0;
  var crudoNoVacio = [];
  try {
    var regL = leerLaminas_();
    (regL.ok ? regL.filas : []).forEach(function (f) {
      var id = String(f.lamina_id || '').trim();
      if (!id) return;
      totalFilasLaminas++;
      var inf = String(f.informe_id || '').trim();
      var sec = secciones[String(f.seccion_id || '').trim()] || {};
      var crudo = String(f.itera_sobre || '').trim();
      if (crudo) crudoNoVacio.push(id + '=' + crudo);
      if (!declaradasPorInforme[inf]) declaradasPorInforme[inf] = {};
      declaradasPorInforme[inf][id] = true;
      porLamina[id] = {
        orden: f.orden_plantilla,
        informe_de_la_fila: inf,
        seccion_id: String(f.seccion_id || '').trim(),
        itera: String(sec.itera_sobre || '').trim(),
        modo: String(sec.modo || '').trim(),
        crudo: crudo
      };
    });
  } catch (e) {
    Logger.log('  ⚠ no pude leer LAMINAS (' + e.message + '): las columnas de lámina salen vacías.');
  }

  /* Los tokens de la plantilla de `secco`, **con la misma función que usa el migrador**
   * (`tokensDePlantilla_`, `Instalar.gs`) — no con un criterio propio. Dos formas de decidir lo
   * mismo terminan cargando otra cosa. */
  var enSecco = {};
  var deSecco = tokensDePlantilla_('secco');
  if (deSecco) deSecco.forEach(function (t) { enSecco[t] = true; });
  else Logger.log('  ⚠ `secco` sin `plantilla_id`: la columna `candidato_asterisco` sale vacía.');

  var filas = [];
  var resumen = {};
  var informes = leerInformes();

  ['jm', 'secco'].forEach(function (informeId) {
    var informe = informes[informeId];
    if (!informe || !informe.plantilla_id) {
      Logger.log('  ⛔ `' + informeId + '` no tiene `plantilla_id` — se saltea.');
      return;
    }
    var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
    var r = { slides: slides.length, conTokens: 0, sinTokens: 0, todosCableados: 0,
              apariciones: 0, distintos: {}, sinAncla: [], candidatos: {},
              anclasVistas: {}, ordenDeAncla: [],
              /* ⭐ `2026-08-31` — **en qué tokens aparece al menos una vez en una lámina VISIBLE.**
               * El estado sale de `esLaminaEscondida_(slide)`, o sea **de la slide**, nunca de
               * `LAMINAS.escondida`, que es una foto del sellado y hoy está vacía (`P2`, `D-55`).
               * Es la pasada compartida de `D-55` aplicada acá: el mismo `forEach` que resuelve el
               * ancla lee el estado. */
              visibles: {}, laminasEscondidas: [] };

    slides.forEach(function (slide, i) {
      /* ⛔⛔ **El ancla se lee ANTES de cortar por tokens, y el corte al revés era un bug del
       * instrumento.** La versión del 31/08 hacía `if (!tokens.length) return` **antes** de mirar
       * el ancla, así que las **8** láminas de `secco` sin ningún token **no se evaluaban** — y su
       * «cero sin ancla» no cubría ese subconjunto. **Un cero que no midió el subconjunto donde
       * puede estar la respuesta no es un cero**, es la familia de *«no hay» y «no miré» se ven
       * igual*. Y justamente ahí puede estar la slide 30 de `secco` que no cierra contra `LAMINAS`. */
      var idLamina = anclaDeLamina_(slide);
      var escondida = esLaminaEscondida_(slide);
      var vistos = {};
      piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
        var m; RE_TOKEN_.lastIndex = 0;
        while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) vistos[m[1]] = true;
      });
      var tokens = Object.keys(vistos).sort();

      if (idLamina) {
        if (!r.anclasVistas[idLamina]) r.ordenDeAncla.push(idLamina);
        r.anclasVistas[idLamina] = { pos: i + 1, tokens: tokens.length, escondida: escondida };
      } else {
        r.sinAncla.push({ pos: i + 1, tokens: tokens.length });
      }

      if (escondida) r.laminasEscondidas.push(idLamina || '(sin ancla, slide ' + (i + 1) + ')');

      if (!tokens.length) { r.sinTokens++; return; }
      r.conTokens++;

      /* ⭐ **El conteo que el censo no puede dar**: láminas donde NINGÚN token está sin fila. Son
       * las que `censarTokensSinMarcador_` omite enteras, y por eso todo censo anterior las
       * subestima. */
      var algunoSinFila = tokens.some(function (t) { return !(t in conFila); });
      if (!algunoSinFila) r.todosCableados++;

      var meta = (idLamina && porLamina[idLamina]) || {};
      tokens.forEach(function (t) {
        r.apariciones++;
        r.distintos[t] = true;
        if (!escondida) r.visibles[t] = true;
        var tiene = (t in conFila);
        var infFila = tiene ? (porInformeDeLaFila[t] || '') : '';
        /* ⭐ **`D-54`: candidato a `*`** = el token está en la plantilla de `secco`, tiene fila, y
         * esa fila **no es ya `*`**. Mismo criterio que `aplicarAsteriscoCompartidos()`. */
        var candidato = tiene && enSecco[t] && infFila !== '*';
        if (candidato) r.candidatos[t] = true;

        filas.push([
          informeId, idLamina || '(sin ancla)', meta.orden === undefined ? '' : meta.orden, i + 1, t,
          tiene ? 'sí' : 'no', infFila, candidato ? 'sí' : '',
          meta.itera || '', meta.modo || '', meta.crudo || '',
          meta.seccion_id || '', escondida ? 'sí' : ''
        ]);
      });
    });
    resumen[informeId] = r;
  });

  // ── La hoja, recreada entera ───────────────────────────────────────────────────────────
  var vieja = ss.getSheetByName(nombreHoja);
  if (vieja) ss.deleteSheet(vieja);
  var hoja = ss.insertSheet(nombreHoja);
  hoja.getRange(1, 1, 1, COLUMNAS_INVENTARIO_.length).setValues([COLUMNAS_INVENTARIO_]);
  if (filas.length) hoja.getRange(2, 1, filas.length, COLUMNAS_INVENTARIO_.length).setValues(filas);
  hoja.setFrozenRows(1);

  // ── El reporte ────────────────────────────────────────────────────────────────────────
  Logger.log('');
  Logger.log('  ✅ hoja `' + nombreHoja + '` — ' + filas.length + ' fila(s) de (token, lámina).');
  Logger.log('     ⚠ Es una hoja EFÍMERA de salida: nadie más la lee, no está en ningún seed.');
  Logger.log('');

  var candidatosGlobal = {};
  /* ⚠ El parámetro se llama `informeId` y NO `id`: adentro hay un `forEach` sobre láminas que usa
   * `id` para el `lamina_id`, y con el mismo nombre en los dos niveles el interno **sombrea** al
   * externo. Dos scopes anidados con la misma variable no fallan al leerlos — fallan al correr. */
  ['jm', 'secco'].forEach(function (informeId) {
    var r = resumen[informeId];
    if (!r) return;
    Logger.log('  ── `' + informeId + '` ─────────────────────────────────────────────────');
    Logger.log('     slides en la plantilla        : ' + r.slides);
    Logger.log('     con al menos un token         : ' + r.conTokens + '   (sin ningún token: ' + r.sinTokens + ')');
    Logger.log('     ⛔ TODOS sus tokens cableados : ' + r.todosCableados +
      '   ← el censo NO las imprime');
    Logger.log('     tokens distintos              : ' + Object.keys(r.distintos).length +
      '   · apariciones: ' + r.apariciones);
    Logger.log('     ⭐ candidatos a `*` (D-54)     : ' + Object.keys(r.candidatos).length);

    /* ⭐⭐ **El cruce ancla ↔ `LAMINAS`, y NUNCA por posición.** `orden_plantilla` es reportado y
     * jamás autoritativo, así que *«la slide 30 es la que falta»* no es una respuesta: la
     * identidad la da el ancla de las notas, que es para lo que se selló.
     *
     * ⭐ **Y hay TRES estados, no dos.** El tercero es el que importa acá: una slide **copiada de
     * otra plantilla** trae la nota del orador —y con ella el ancla— **adentro de la copia**
     * (medido: `slide.duplicate()` copia las notas). Entonces su `lamina_id` **existe en `LAMINAS`
     * pero declarado para el OTRO informe**, y eso no es *«falta un alta»* genérico: es un alta
     * concreta y sabida. */
    var declaradas = declaradasPorInforme[informeId] || {};
    var sobran = [], deOtroInforme = [], faltan = [];
    r.ordenDeAncla.forEach(function (id) {
      var v = r.anclasVistas[id];
      if (declaradas[id]) return;
      var meta = porLamina[id];
      if (meta && meta.informe_de_la_fila) {
        deOtroInforme.push(id + ' (slide ' + v.pos + ', ' + v.tokens + ' token(s)) — declarada para `' +
          meta.informe_de_la_fila + '`');
      } else {
        sobran.push(id + ' (slide ' + v.pos + ', ' + v.tokens + ' token(s)) — sin fila en LAMINAS');
      }
    });
    Object.keys(declaradas).forEach(function (id) {
      if (!r.anclasVistas[id]) faltan.push(id);
    });

    Logger.log('     ── cruce ancla ↔ LAMINAS (por ancla, NUNCA por posición) ──');
    Logger.log('     slides ancladas: ' + r.ordenDeAncla.length + ' · sin ancla: ' + r.sinAncla.length +
      ' · filas en LAMINAS: ' + Object.keys(declaradas).length);
    if (r.sinAncla.length) {
      Logger.log('     ⚠ SIN ANCLA: ' + r.sinAncla.map(function (s) {
        return 'slide ' + s.pos + ' (' + s.tokens + ' token(s))';
      }).join(' · '));
      Logger.log('        ⭐ Se miran TENGAN O NO tokens — el corte anterior las salteaba.');
    }
    if (deOtroInforme.length) {
      Logger.log('     ⛔ ANCLADA A UNA LÁMINA DE OTRO INFORME — ' + deOtroInforme.length + ':');
      deOtroInforme.forEach(function (x) { Logger.log('        ' + x); });
      Logger.log('        ⇒ Es el alta que falta: la misma lámina existe en las dos plantillas y');
      Logger.log('          `LAMINAS` sólo la declara para una. Con `D-37`, acá NO pertenece a');
      Logger.log('          ninguna sección: no se expande, no se resuelve y nadie la nombra.');
    }
    if (sobran.length) {
      Logger.log('     ⚠ ANCLADA Y SIN NINGUNA FILA — ' + sobran.length + ':');
      sobran.forEach(function (x) { Logger.log('        ' + x); });
    }
    if (faltan.length) {
      Logger.log('     ⚠ DECLARADA EN LAMINAS Y SIN SLIDE — ' + faltan.length + ': ' + faltan.join(', '));
    }
    if (!deOtroInforme.length && !sobran.length && !faltan.length && !r.sinAncla.length) {
      Logger.log('     ✅ cierra: cada slide tiene ancla, y cada ancla su fila de este informe.');
    }

    Object.keys(r.candidatos).forEach(function (t) { candidatosGlobal[t] = true; });
  });

  /* ⭐ **El cruce de tokens entre las dos plantillas** — la pregunta 1 de «lo que viene después»,
   * que la primera versión no resumía: daba los candidatos (que **exigen tener fila**) y no la
   * intersección. Son dos conjuntos distintos y el segundo es más grande. */
  var dj = (resumen.jm && resumen.jm.distintos) || {};
  var ds = (resumen.secco && resumen.secco.distintos) || {};
  var vj = (resumen.jm && resumen.jm.visibles) || {};
  var vs = (resumen.secco && resumen.secco.visibles) || {};
  var compartidos = [], soloJm = [], soloSecco = [];
  Object.keys(dj).forEach(function (t) { (ds[t] ? compartidos : soloJm).push(t); });
  Object.keys(ds).forEach(function (t) { if (!dj[t]) soloSecco.push(t); });

  /* ⭐⭐ **La partición que cambia el tamaño del trabajo.** Sumar los «sólo secco» **sobreestima**:
   * un token que sólo vive en láminas **escondidas** no es deuda de cableado — es una lámina que no
   * se usa. Las dos cosas se veían igual y mandan a trabajos opuestos: cablear contra no hacer nada. */
  var soloSeccoVisible = soloSecco.filter(function (t) { return vs[t]; });
  var soloSeccoOculto = soloSecco.filter(function (t) { return !vs[t]; });
  var soloJmVisible = soloJm.filter(function (t) { return vj[t]; });
  var soloJmOculto = soloJm.filter(function (t) { return !vj[t]; });

  Logger.log('');
  Logger.log('  ── CRUCE DE TOKENS ENTRE LAS DOS PLANTILLAS ──────────────────────');
  Logger.log('     compartidos : ' + compartidos.length);
  Logger.log('     sólo `jm`   : ' + soloJm.length +
    '   → ' + soloJmVisible.length + ' en visibles · ' + soloJmOculto.length + ' sólo en escondidas');
  Logger.log('     sólo `secco`: ' + soloSecco.length +
    '   → ⭐ ' + soloSeccoVisible.length + ' en visibles · ' + soloSeccoOculto.length +
    ' sólo en escondidas');
  Logger.log('');
  Logger.log('     ⭐ EL TRABAJO REAL de `secco` son los ' + soloSeccoVisible.length +
    ' visibles, no los ' + soloSecco.length + ':');
  for (var iv = 0; iv < soloSeccoVisible.length; iv += 8) {
    Logger.log('        ' + soloSeccoVisible.slice(iv, iv + 8).join(', '));
  }
  var famVis = {};
  soloSeccoVisible.forEach(function (t) {
    var f = t.indexOf('_') > 0 ? t.slice(0, t.indexOf('_') + 1) : '(sin prefijo)';
    famVis[f] = (famVis[f] || 0) + 1;
  });
  Logger.log('        por familia: ' + Object.keys(famVis).sort().map(function (f) {
    return f + ' ' + famVis[f];
  }).join(' · '));
  Logger.log('     ⚠ Los ' + soloSeccoOculto.length + ' que quedan sólo en escondidas NO son deuda:');
  var famOc = {};
  soloSeccoOculto.forEach(function (t) {
    var f = t.indexOf('_') > 0 ? t.slice(0, t.indexOf('_') + 1) : '(sin prefijo)';
    famOc[f] = (famOc[f] || 0) + 1;
  });
  Logger.log('        por familia: ' + Object.keys(famOc).sort().map(function (f) {
    return f + ' ' + famOc[f];
  }).join(' · '));

  Logger.log('');
  Logger.log('     láminas ESCONDIDAS (leído de la slide, no de LAMINAS):');
  ['jm', 'secco'].forEach(function (id) {
    var rr = resumen[id];
    if (!rr) return;
    Logger.log('        ' + id + ': ' + rr.laminasEscondidas.length +
      (rr.laminasEscondidas.length ? ' → ' + rr.laminasEscondidas.join(', ') : ''));
  });

  /* ⚠ **Testigo contra una medición externa, y por eso va FECHADO y con su fuente.** Son los
   * números que el usuario midió sobre el `.pptx` exportado el 31/08. **No son la verdad: son la
   * otra lectura.** Si esta corrida difiere, **el desajuste ES el hallazgo** —la plantilla se
   * movió, o uno de los dos lectores se equivoca— y hay que resolverlo antes de usar el número.
   *
   * ⛔ Esto **caduca**: es una constante de una lectura anterior, no una identidad interna
   * (`CLAUDE.md` §4). Se conserva mientras sirva de contraste y se borra cuando estorbe. */
  var ESPERADO_31_08 = { solo_secco: 55, visibles: 13, ocultas: 42 };
  Logger.log('');
  Logger.log('     ── contraste con la medición del usuario sobre el `.pptx` del 31/08 ──');
  Logger.log('        esperado: sólo secco ' + ESPERADO_31_08.solo_secco + ' → ' +
    ESPERADO_31_08.visibles + ' visibles · ' + ESPERADO_31_08.ocultas + ' ocultas');
  Logger.log('        medido  : sólo secco ' + soloSecco.length + ' → ' +
    soloSeccoVisible.length + ' visibles · ' + soloSeccoOculto.length + ' ocultas');
  var coincide = soloSecco.length === ESPERADO_31_08.solo_secco &&
                 soloSeccoVisible.length === ESPERADO_31_08.visibles &&
                 soloSeccoOculto.length === ESPERADO_31_08.ocultas;
  Logger.log(coincide
    ? '        ✅ COINCIDE — dos lecturas independientes del mismo hecho'
    : '        ⛔ NO COINCIDE — ESO es el hallazgo. La plantilla se movió, o uno de los dos ' +
      'lectores se equivoca. Resolverlo ANTES de usar el número.');
  Logger.log('     ⭐ De los ' + compartidos.length + ' compartidos, los que YA tienen fila son los');
  Logger.log('        candidatos a `*`; los que no, son trabajo de cableado.');
  var sinFilaCompartidos = compartidos.filter(function (t) { return !(t in conFila); });
  Logger.log('     compartidos SIN fila: ' + sinFilaCompartidos.length +
    (sinFilaCompartidos.length ? ' → ' + sinFilaCompartidos.slice(0, 40).join(', ') +
      (sinFilaCompartidos.length > 40 ? ' …' : '') : ''));
  /* La lista completa de «sólo secco» sale abajo **partida por visibilidad**, que es la forma
   * accionable. Acá se conserva sólo el `⚠` de que son los que ningún cableado de `jm` miró. */
  Logger.log('     ⚠ los «sólo secco» son los que NINGÚN cableado de `jm` miró — se listan abajo,');
  Logger.log('       partidos por visibilidad, porque sumarlos sobreestima el trabajo.');

  /* ⭐ El chequeo que la primera corrida dejó sin verificar: la columna cruda de `LAMINAS`. Se
   * **espera vacía** en todas las filas, y ése es el testigo de que el bloque «N láminas ITERAN»
   * del censo nunca se disparó. Si sale llena, el censo cambió de comportamiento. */
  Logger.log('');
  Logger.log('  ── TESTIGO · `LAMINAS.itera_sobre` (columna cruda) ───────────────');
  Logger.log('     filas leídas: ' + totalFilasLaminas + ' · con valor: ' + crudoNoVacio.length +
    (crudoNoVacio.length ? ' ⛔ ' + crudoNoVacio.join(' · ') : ' ✅ vacía, como se esperaba'));
  if (!crudoNoVacio.length) {
    Logger.log('     ⇒ Confirma que el bloque «N lámina(s) ITERAN» de `censarTokensSinMarcador_`');
    Logger.log('       NUNCA se disparó: su `if` exige esta columna, y está vacía en las ' +
      totalFilasLaminas + '.');
  }

  /* ⭐⭐ **El alcance de la migración de `D-54`, que es el número que hoy nadie tiene.** El cruce
   * del 20/08 decía **49** y es de otra plantilla: el usuario actualizó las láminas desde
   * entonces, y ese mismo cruce ya venía con su propia advertencia —las láminas 19 y 20 de `jm`
   * pasaron de 9 y 14 tokens a 31 y 50 **mientras se las medía**—.
   *
   * ⛔ **No se migra acá.** `aplicarAsteriscoCompartidos()` (`Instalar.gs`) es quien lo hace, y
   * **escribe directo: no tiene modo seco**, así que correrlo para «ver cuántos son» los migraría.
   * Esta lista es el mismo conjunto, calculado **sin escribir una celda**. */
  var lista = Object.keys(candidatosGlobal).sort();
  Logger.log('');
  Logger.log('  ═══ CANDIDATOS A `informe_id = "*"` (D-54): ' + lista.length + ' ═══');
  Logger.log('  ⚠ Es el ALCANCE de la migración, no la migración. Nada se escribió en MARCADORES.');
  Logger.log('  ⚠ El cruce del 20/08 decía 49 — de otra plantilla, y ese número NO es comparable.');
  var porFamilia = {};
  lista.forEach(function (t) {
    var fam = t.indexOf('_') > 0 ? t.slice(0, t.indexOf('_') + 1) : '(sin prefijo)';
    porFamilia[fam] = (porFamilia[fam] || 0) + 1;
  });
  Logger.log('  por familia: ' + Object.keys(porFamilia).sort().map(function (f) {
    return f + ' ' + porFamilia[f];
  }).join(' · '));
  for (var i = 0; i < lista.length; i += 8) {
    Logger.log('     ' + lista.slice(i, i + 8).join(', '));
  }

  Logger.log('');
  Logger.log('── LO QUE ESTE VOLCADO NO CONTESTA ───────────────────────────────────');
  Logger.log('  · Si un token compartido publica el número CORRECTO en `secco`. `D-54` dice que es');
  Logger.log('    el mismo número; la validación que existe es de `jm` — otra ventana, otro corte.');
  Logger.log('  · La GRANULARIDAD. Si `secco` tiene 3 ranuras donde `jm` tiene 4, son tokens');
  Logger.log('    distintos y `*` no lo resuelve (D-54, el límite).');
  Logger.log('  · Qué publica `FALTA` de verdad: eso pide una corrida.');
  Logger.log('  · Si una lámina que existe en las dos plantillas es la MISMA lámina o dos que se');
  Logger.log('    parecen. El ancla dice que comparten identidad; la GRANULARIDAD sigue abierta');
  Logger.log('    (`D-54`, el límite): 3 ranuras contra 4 son tokens distintos, no un token igual.');

  return { ok: true, hoja: nombreHoja, filas: filas.length, resumen: resumen, candidatos: lista };
}
