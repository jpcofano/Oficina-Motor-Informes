/**
 * Union.gs — Paso 2.4: capa de ensamblado (vía de datos, en paralelo a la vía
 * de plantillas 2.2 → 2.5). NO toca Slides ni MARCADORES.
 *
 * REGLA DE ORO: acá no hay aritmética (ni SUMA, ni promedios, ni merge con
 * precedencia). Solo se ensamblan filas: join de las 6 solapas de `digital`
 * por `id_cuenta`, y anclaje de cada encuentro de RDV con su(s) cuenta(s)
 * digital(es). La aritmética y el merge RDV→SD→Looker son del Paso 3
 * (`Marcadores.gs`).
 *
 * Expone:
 *   unirDigitalPorCuenta(ventana)  -> { ok, porCuenta, diagnostico }
 *   anclarEncuentros(ventana)     -> { ok, encuentros, sinLink, bajaConfianza }
 *   filasDigitalDeEncuentro(idCuentaOEncuentro, ventana) -> registro unido o null
 *     (contrato estable que el Paso 3 consume en vez de leerFuente directo).
 *
 * Se completa en: Paso 2.4 (docs/Prompts/Paso-2.4.md).
 */

/**
 * `leerFuente` (Fuentes.gs) devuelve cada fila como objeto indexado por el
 * texto real del encabezado, no por `campo_logico`. Para leer un campo
 * resuelto vía `buscarMapeo` (que da una letra de columna) hace falta el
 * encabezado real de esa columna — se lee una vez por (base, solapa) y se
 * cachea por corrida, mismo criterio que `cacheBases_` de Fuentes.gs.
 */
var cacheEncabezadosUnion_ = {};

function encabezadoEnColumna_(baseId, solapa, columnaLetra) {
  var clave = baseId + '||' + solapa;
  if (!Object.prototype.hasOwnProperty.call(cacheEncabezadosUnion_, clave)) {
    var abierto = abrirHoja(baseId, solapa);
    if (!abierto.ok) {
      cacheEncabezadosUnion_[clave] = null;
    } else {
      var filaEncabezado = Number(abierto.base.fila_encabezado) || 1;
      var ultimaColumna = abierto.hoja.getLastColumn();
      cacheEncabezadosUnion_[clave] = abierto.hoja.getRange(filaEncabezado, 1, 1, ultimaColumna).getValues()[0];
    }
  }
  var headers = cacheEncabezadosUnion_[clave];
  if (!headers) return undefined;
  return headers[columnaLetraAIndice_(columnaLetra)];
}

function valorPorColumna_(filaObjeto, baseId, solapa, columnaLetra) {
  var header = encabezadoEnColumna_(baseId, solapa, columnaLetra);
  if (header === undefined || header === null) return undefined;
  return filaObjeto[header];
}

/**
 * Normaliza la clave de join: `String(id).trim()`. Nunca `''` para un valor
 * vacío o ausente — eso se descarta antes de indexar, no se cuenta como cuenta.
 */
function normalizarIdCuenta_(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

/**
 * Parte A — un registro por `Id Cuentas`, uniendo las 6 solapas de `digital`.
 * `digital` es `modo_periodo=snapshot` (BASES): `leerFuente` ignora `ventana`
 * y trae todas las filas — el recorte por período lo hace `anclarEncuentros`
 * vía el link campaña↔encuentro (R-04, docs/REGLAS_NEGOCIO.md), no una
 * ventana de fecha sobre `digital`.
 */
var BASE_DIGITAL_ = 'digital';
var SOLAPA_MAESTRA_DIGITAL_ = 'Seguimiento digital';

// Campos de dimensión de la maestra (nombre de campaña + pauta por
// plataforma) — no son hechos por canal, viajan una vez por cuenta.
var CAMPOS_DIMENSION_MAESTRA_ = [
  'sd_campana_cuentas', 'sd_campana_digital',
  'sd_pauta_google', 'sd_pauta_prog', 'sd_pauta_meta'
];

// Una fila por solapa de canal: `idCampo` es el campo_logico de su columna de
// join (`docs/Prompts/Paso-2.4.md` "Contexto"); `prefijo` nombra el arreglo de
// filas crudas que cuelga de cada cuenta (`mail_filas`, etc. — Parte A punto 3).
var SOLAPAS_CANAL_DIGITAL_ = [
  { solapa: 'Digital', idCampo: 'dig_id_cuenta', prefijo: 'dig' },
  { solapa: 'Directa Mail', idCampo: 'mail_id_cuenta', prefijo: 'mail' },
  { solapa: 'Directa SMS', idCampo: 'sms_id_cuenta', prefijo: 'sms' },
  { solapa: 'Directa IVR', idCampo: 'ivr_id_cuenta', prefijo: 'ivr' },
  { solapa: 'Alcance', idCampo: 'alc_id_cuenta', prefijo: 'alc' }
];

function unirDigitalPorCuenta(ventana) {
  var maestraLeida = leerFuente(BASE_DIGITAL_, ventana, SOLAPA_MAESTRA_DIGITAL_);
  if (!maestraLeida.ok) return { ok: false, motivo: maestraLeida.motivo };

  var idMaestra = buscarMapeo(BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, 'sd_id_cuenta');
  if (!idMaestra.ok) return { ok: false, motivo: idMaestra.motivo };

  var porCuenta = {};
  var diagnostico = {};
  var cuentasMaestra = 0;

  maestraLeida.filas.forEach(function (fila) {
    var idCuenta = normalizarIdCuenta_(valorPorColumna_(fila, BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, idMaestra.columna));
    if (!idCuenta) return;

    var registro = { sd_id_cuenta: idCuenta };
    CAMPOS_DIMENSION_MAESTRA_.forEach(function (campoLogico) {
      var campo = buscarMapeo(BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, campoLogico);
      if (campo.ok) registro[campoLogico] = valorPorColumna_(fila, BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, campo.columna);
    });

    porCuenta[idCuenta] = registro;
    cuentasMaestra++;
  });

  diagnostico[SOLAPA_MAESTRA_DIGITAL_] = {
    ok: true,
    filas_leidas: maestraLeida.filas.length,
    cuentas: cuentasMaestra
  };

  SOLAPAS_CANAL_DIGITAL_.forEach(function (canal) {
    var leido = leerFuente(BASE_DIGITAL_, ventana, canal.solapa);
    if (!leido.ok) {
      diagnostico[canal.solapa] = { ok: false, motivo: leido.motivo };
      return;
    }

    var idCampo = buscarMapeo(BASE_DIGITAL_, canal.solapa, canal.idCampo);
    if (!idCampo.ok) {
      diagnostico[canal.solapa] = { ok: false, motivo: idCampo.motivo };
      return;
    }

    var claveFilas = canal.prefijo + '_filas';
    var matcheadas = 0;
    var idsVistos = {};
    var huerfanasEnCanal = []; // id presente en el canal, ausente en la maestra

    leido.filas.forEach(function (fila) {
      var idCuenta = normalizarIdCuenta_(valorPorColumna_(fila, BASE_DIGITAL_, canal.solapa, idCampo.columna));
      if (!idCuenta) return;
      idsVistos[idCuenta] = true;

      if (!porCuenta[idCuenta]) {
        huerfanasEnCanal.push(idCuenta);
        return;
      }

      // Punto 3: si una solapa trae varias filas por cuenta (p. ej. Mail:
      // varios envíos), NO se suma — se guarda el arreglo crudo. Sumar es
      // Paso 3.
      if (!porCuenta[idCuenta][claveFilas]) porCuenta[idCuenta][claveFilas] = [];
      porCuenta[idCuenta][claveFilas].push(fila);
      matcheadas++;
    });

    // Huérfanas en el otro sentido: cuentas de la maestra sin ninguna fila en
    // este canal (p. ej. una cuenta sin envío de mail — no es un error, pero
    // no se descarta en silencio).
    var cuentasSinCanal = Object.keys(porCuenta).filter(function (id) { return !idsVistos[id]; });

    diagnostico[canal.solapa] = {
      ok: true,
      filas_leidas: leido.filas.length,
      cuentas_matcheadas: matcheadas,
      huerfanas_en_canal: huerfanasEnCanal,
      cuentas_sin_este_canal: cuentasSinCanal
    };
  });

  return { ok: true, porCuenta: porCuenta, diagnostico: diagnostico };
}

/**
 * Parte B — anclarEncuentros(ventana). Implementa `docs/DISENO_match_temario.md`
 * §5 bis: la hoja ancla es `RVD JM-CM - ES`, se filtra `STATUS REUNIÓN =
 * Realizada`, y la columna `FECHA` de RDV le gana a la fecha del nombre de la
 * campaña digital — el nombre de campaña se usa SOLO para llegar al
 * `Id cuentas`; la similitud se puntúa contra `EVENTO` + `Barrio` de RDV.
 *
 * Precondición explícita (docs/Prompts/Paso-2.4.md Parte B punto 1): requiere
 * `rdv/RVD JM-CM - ES/fecha_periodo` cargado en MAPEO y R-01 verificado
 * (docs/REGLAS_NEGOCIO.md) — agrupar por (Figura, fecha_periodo) y contar
 * grupos con más de una fila tiene que dar cero. Si no, este paso no corre.
 */
var SOLAPA_ANCLA_RDV_ = 'RVD JM-CM - ES';
var VALOR_STATUS_REALIZADA_ = 'Realizada';
var HOJA_COMUNAS_RDV_ = 'Comunas';

// Umbral de confianza (docs/DISENO_match_temario.md §6.4: banda 0,60–0,85 es
// el piso para asumir un link sin marcarlo para revisión humana). Por debajo,
// mejor un huérfano visible en `bajaConfianza` que un número pegado a la
// campaña equivocada (Parte B punto 5 del prompt).
// Paso 2.9F: el umbral sale del código y va a CONFIG (`umbral_anclaje_reunion`).
// Esta constante queda solo como default si CONFIG no lo tiene cargado —
// nunca se usa directo, siempre pasa por `umbralAnclajeReunion_()`.
var UMBRAL_CONFIANZA_ANCLAJE_DEFECTO_ = 0.6;

function umbralAnclajeReunion_() {
  var valor = Number(leerConfig().umbral_anclaje_reunion);
  return isNaN(valor) ? UMBRAL_CONFIANZA_ANCLAJE_DEFECTO_ : valor;
}

// Paso 2.9F, punto 1 del algoritmo: "filtrar candidatos" reduce el universo de
// cuentas digitales antes de puntuar contra cada reunión — es lo que disuelve
// el timeout (puntuar 500 encuentros × 1297 cuentas nunca terminaba en 6
// minutos; puntuar contra 5-20 candidatos cercanos en fecha, sí). Una cuenta
// sin fecha parseable en el nombre no se puede descartar por este criterio:
// pasa como candidata siempre (fallback), igual que antes.
var VENTANA_DIAS_CANDIDATOS_ANCLAJE_ = 14;

function candidatosCercanosPorFecha_(candidatos, fechaObjetivo, ventanaDias) {
  if (!fechaObjetivo) return candidatos;
  var msVentana = ventanaDias * 24 * 60 * 60 * 1000;
  return candidatos.filter(function (c) {
    var fechaCandidato = c.parseado && c.parseado.fecha;
    if (!fechaCandidato) return true;
    return Math.abs(fechaCandidato.getTime() - fechaObjetivo.getTime()) <= msVentana;
  });
}

/**
 * Paso 2.9F, punto 1 — `anclar_()`: una sola función para rankear candidatos
 * contra un objetivo, sin importar si el llamador busca una reunión o una
 * campaña. Lo único que cambia entre esos dos casos es cómo se arma la lista
 * de `candidatos` (ya filtrada por el llamador) y qué `funcionScore` se pasa —
 * hoy `scoreMatchDigitalRdv_` para reuniones; una campaña podría reusar
 * `solapamientoTokens_` de arriba sin tocar esta función.
 */
function anclar_(candidatos, contexto, umbral, funcionScore) {
  var ranking = candidatos
    .map(function (c) { return { candidato: c, score: funcionScore(c, contexto) }; })
    .sort(function (a, b) { return b.score - a.score; });

  var mejor = ranking[0];
  return {
    mejor: mejor ? mejor.candidato : null,
    score: mejor ? mejor.score : 0,
    pasaUmbral: !!mejor && mejor.score >= umbral,
    top3: ranking.slice(0, 3)
  };
}

function verificarPrecondicionAnclaje_() {
  var campoFecha = buscarMapeo('rdv', SOLAPA_ANCLA_RDV_, 'fecha_periodo');
  if (!campoFecha.ok) {
    return {
      ok: false,
      motivo: 'Precondición no cumplida: falta MAPEO rdv/' + SOLAPA_ANCLA_RDV_ + '/fecha_periodo — ' +
        'sin esa columna no se puede verificar R-01. anclarEncuentros() no corre.'
    };
  }

  var campoFigura = buscarMapeo('rdv', SOLAPA_ANCLA_RDV_, 'figura');
  if (!campoFigura.ok) {
    return { ok: false, motivo: 'Precondición no cumplida: falta MAPEO rdv/' + SOLAPA_ANCLA_RDV_ + '/figura.' };
  }

  var abierto = abrirHoja('rdv', SOLAPA_ANCLA_RDV_);
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };

  var filaEncabezado = Number(abierto.base.fila_encabezado) || 1;
  var idxFigura = columnaLetraAIndice_(campoFigura.columna);
  var idxFecha = columnaLetraAIndice_(campoFecha.columna);
  var datos = abierto.hoja.getDataRange().getValues().slice(filaEncabezado);

  var conteoPorClave = {};
  datos.forEach(function (fila) {
    var figura = fila[idxFigura];
    var fecha = fila[idxFecha];
    if (!figura || !fecha) return;
    var claveFecha = (fecha instanceof Date) ? fecha.getTime() : String(fecha).trim();
    var clave = String(figura).trim() + '||' + claveFecha;
    conteoPorClave[clave] = (conteoPorClave[clave] || 0) + 1;
  });

  var gruposConDuplicados = Object.keys(conteoPorClave).filter(function (k) { return conteoPorClave[k] > 1; }).length;
  if (gruposConDuplicados > 0) {
    return {
      ok: false,
      motivo: 'R-01 no se cumple: ' + gruposConDuplicados + ' grupo(s) con más de un encuentro por ' +
        '(Figura, fecha) en rdv/' + SOLAPA_ANCLA_RDV_ + '. anclarEncuentros() no corre hasta resolverlo ' +
        '(ver R-01 en docs/REGLAS_NEGOCIO.md).'
    };
  }

  return { ok: true };
}

function anioDefectoDesdeVentana_(ventana) {
  return (ventana && ventana.desde) ? ventana.desde.getFullYear() : new Date().getFullYear();
}

function tokenizarTexto_(texto) {
  return normalizar_(texto).split(/[^a-z0-9]+/).filter(function (t) { return t.length > 2; });
}

function solapamientoTokens_(a, b) {
  var tokensA = tokenizarTexto_(a);
  var tokensB = tokenizarTexto_(b);
  if (!tokensA.length || !tokensB.length) return 0;

  var setB = {};
  tokensB.forEach(function (t) { setB[t] = true; });
  var comunes = tokensA.filter(function (t) { return setB[t]; }).length;
  return comunes / Math.max(tokensA.length, tokensB.length);
}

/**
 * Score de similitud entre una cuenta digital (candidato, ya parseado con
 * `parsearNombreCampana_`) y un encuentro de RDV (`evento` + `barrio`).
 * Reusa los parsers de Parseo.gs (barrio/comuna/eje/tipo) — no reescribe
 * parseo de fecha ni de tipo (docs/Prompts/Paso-2.4.md, namespace §9).
 *
 * Señales, igual criterio que docs/DISENO_match_temario.md §6.3:
 *   - barrio/comuna/eje del nombre de campaña == el del encuentro -> señal alta
 *     (es lo que salva los casos de fecha cruzada del nombre, §4.1);
 *   - tipo de encuentro compatible -> señal media;
 *   - solapamiento de tokens del texto completo -> desempate residual.
 */
function scoreMatchDigitalRdv_(candidato, evento, barrio) {
  var parseado = candidato.parseado;
  var barrioEncuentroNorm = normalizar_(barrio);
  var comunaEncuentro = parsearComuna_(barrio) || parsearComuna_(evento);
  var ejeEncuentro = parsearEje_(evento);

  var score = 0;

  if (parseado.barrio && barrioEncuentroNorm && normalizar_(parseado.barrio) === barrioEncuentroNorm) {
    score += 0.5;
  } else if (parseado.comuna && comunaEncuentro && parseado.comuna === comunaEncuentro) {
    score += 0.5;
  } else if (parseado.eje && ejeEncuentro && parseado.eje === ejeEncuentro) {
    score += 0.4;
  }

  var tipoEncuentro = parsearTipoEncuentro_(evento);
  if (parseado.tipo && tipoEncuentro && parseado.tipo === tipoEncuentro) {
    score += 0.2;
  }

  score += 0.3 * solapamientoTokens_(candidato.nombreCampana, (evento || '') + ' ' + (barrio || ''));

  return Math.min(score, 1);
}

/**
 * Encuentra la fila de `rdv` (Realizada) que corresponde a una fila de
 * `REUNIONES` (match por nombre~barrio/evento + fecha, mismo día). Generaliza
 * el matching cableado a mano del corte vertical (Paso 2.9E,
 * `encontrarEncuentroRetiro2407_` en Marcadores.gs) para que el anclaje
 * (Paso 2.9F) lo reuse en vez de reimplementarlo.
 */
function encontrarFilaRdvDeReunion_(reunion) {
  var fecha = (reunion.fecha instanceof Date) ? reunion.fecha : parsearFechaCelda_(reunion.fecha);
  if (!fecha) return { ok: false, motivo: 'REUNIONES "' + reunion.nombre + '" no tiene fecha válida.' };

  var mediodia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0);
  var ventanaDia = { ok: true, desde: mediodia, hasta: mediodia, origen: 'reunion:' + reunion.nombre };

  var lectura = leerFuente('rdv', ventanaDia);
  if (!lectura.ok) return { ok: false, motivo: lectura.motivo };

  var campoBarrio = buscarMapeo('rdv', lectura.hoja, 'barrio');
  var campoEvento = buscarMapeo('rdv', lectura.hoja, 'evento');
  var campoStatus = buscarMapeo('rdv', lectura.hoja, 'status');
  if (!campoBarrio.ok || !campoStatus.ok) {
    return { ok: false, motivo: 'Falta MAPEO de barrio/status para rdv/' + lectura.hoja };
  }

  var nombreBuscado = normalizar_(reunion.nombre);
  var encontrada = null;
  lectura.filas.forEach(function (fila) {
    if (encontrada) return;
    var barrio = valorPorColumna_(fila, 'rdv', lectura.hoja, campoBarrio.columna);
    var evento = campoEvento.ok ? valorPorColumna_(fila, 'rdv', lectura.hoja, campoEvento.columna) : '';
    var status = valorPorColumna_(fila, 'rdv', lectura.hoja, campoStatus.columna);
    var coincide = normalizar_(barrio).indexOf(nombreBuscado) !== -1 || normalizar_(evento).indexOf(nombreBuscado) !== -1;
    if (coincide && String(status || '').trim() === VALOR_STATUS_REALIZADA_) encontrada = fila;
  });

  if (!encontrada) {
    return {
      ok: false,
      motivo: 'No se encontró un encuentro "' + VALOR_STATUS_REALIZADA_ + '" para "' + reunion.nombre + '" (' +
        Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy') + ') en rdv/' + lectura.hoja
    };
  }
  return { ok: true, hoja: lectura.hoja, fila: encontrada, filasEnVentana: lectura.filas.length };
}

/**
 * Paso 2.9F, punto 4/5 — hoja `ANCLAJE_PENDIENTE`: los candidatos por debajo
 * del umbral se registran acá, con sus tres mejores opciones y una columna
 * `elegido` que completa la persona. Una vez completada, no se vuelve a
 * preguntar en la corrida siguiente (`anclajeYaConfirmado_`) — si cada corrida
 * repreguntara lo mismo, el paso humano deja de ser control y pasa a trámite.
 */
var HEADERS_ANCLAJE_PENDIENTE_ = ['tipo', 'nombre_buscado', 'candidato_1', 'puntaje_1', 'candidato_2', 'puntaje_2', 'candidato_3', 'puntaje_3', 'elegido'];

function obtenerHojaAnclajePendiente_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('ANCLAJE_PENDIENTE');
  if (!hoja) {
    hoja = ss.insertSheet('ANCLAJE_PENDIENTE');
    hoja.getRange(1, 1, 1, HEADERS_ANCLAJE_PENDIENTE_.length).setValues([HEADERS_ANCLAJE_PENDIENTE_]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function indiceAnclajePendiente_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var porClave = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = datos[f][idx.tipo] + '||' + datos[f][idx.nombre_buscado];
    porClave[clave] = { fila: f + 1, elegido: datos[f][idx.elegido] };
  }
  return porClave;
}

function anclajeYaConfirmado_(indice, tipo, nombreBuscado) {
  var entrada = indice[tipo + '||' + nombreBuscado];
  if (entrada && entrada.elegido !== '' && entrada.elegido !== null && entrada.elegido !== undefined) {
    return entrada.elegido;
  }
  return null;
}

/**
 * Registra (o actualiza) una fila de candidatos de baja confianza. Si ya
 * existe con `elegido` cargado, no la toca — la decisión humana no se pisa.
 */
function registrarAnclajePendiente_(hoja, indice, tipo, nombreBuscado, top3) {
  var clave = tipo + '||' + nombreBuscado;
  var existente = indice[clave];
  if (existente && existente.elegido) return;

  var fila = [tipo, nombreBuscado];
  for (var i = 0; i < 3; i++) {
    var item = top3[i];
    fila.push(item ? (item.candidato.nombreCampana || item.candidato.idCuenta || '') : '');
    fila.push(item ? Number(item.score.toFixed(2)) : '');
  }
  fila.push(existente ? existente.elegido : '');

  if (existente) {
    hoja.getRange(existente.fila, 1, 1, fila.length).setValues([fila]);
  } else {
    hoja.appendRow(fila);
    indice[clave] = { fila: hoja.getLastRow(), elegido: '' };
  }
  SpreadsheetApp.flush();
}

/**
 * Paso 2.9F — reescrito sobre `REUNIONES` (Paso 2.9D), no sobre un recorte por
 * fecha de `rdv`: R-02 dice que el temario define el universo, así que el
 * anclaje corre sobre las reuniones con `mostrar=sí` (excluidas las de
 * `tipo=Agregado` — Ministros/M2 no son encuentros individuales que anclar).
 * Acotado así, y con los candidatos digitales pre-filtrados por cercanía de
 * fecha (`candidatosCercanosPorFecha_`), el timeout de `menuProbarUnionYAnclaje_`
 * desaparece sin tocar el scoring (`scoreMatchDigitalRdv_` no cambia).
 * Deja rastro mientras corre (Logger + `SpreadsheetApp.flush()` por reunión):
 * si el script se corta, `ANCLAJE_PENDIENTE` y el log ya tienen lo que se
 * alcanzó a procesar.
 */
function anclarEncuentros(ventana) {
  var precondicion = verificarPrecondicionAnclaje_();
  if (!precondicion.ok) return { ok: false, motivo: precondicion.motivo };

  var reuniones = leerReuniones_().filter(function (r) { return r.tipo !== 'Agregado'; });
  if (!reuniones.length) {
    return { ok: false, motivo: 'REUNIONES no tiene filas con mostrar=sí para anclar (excluidas las de tipo Agregado).' };
  }

  var digitalUnido = unirDigitalPorCuenta(ventana);
  if (!digitalUnido.ok) return { ok: false, motivo: digitalUnido.motivo };

  var catalogo = catalogoBarriosDesdeBase_('rdv', HOJA_COMUNAS_RDV_);
  var anioDefecto = anioDefectoDesdeVentana_(ventana);

  var candidatosTodos = Object.keys(digitalUnido.porCuenta).map(function (idCuenta) {
    var registro = digitalUnido.porCuenta[idCuenta];
    var nombreCampana = registro.sd_campana_digital || registro.sd_campana_cuentas || '';
    return {
      idCuenta: idCuenta,
      registro: registro,
      nombreCampana: nombreCampana,
      parseado: parsearNombreCampana_(nombreCampana, { catalogoBarrios: catalogo.barrios, anioDefecto: anioDefecto })
    };
  });

  var umbral = umbralAnclajeReunion_();
  var hojaPendiente = obtenerHojaAnclajePendiente_();
  var indicePendiente = indiceAnclajePendiente_(hojaPendiente);

  var encuentros = [];
  var sinLink = [];
  var bajaConfianza = [];

  Logger.log('anclarEncuentros: arranca — ' + reuniones.length + ' reunión(es), ' + candidatosTodos.length +
    ' cuenta(s) digital · umbral=' + umbral + ' · ' + new Date());

  reuniones.forEach(function (reunion, i) {
    var fecha = (reunion.fecha instanceof Date) ? reunion.fecha : parsearFechaCelda_(reunion.fecha);
    var nombreBuscado = normalizar_(reunion.nombre) + '|' +
      (fecha ? Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd') : 'sin_fecha') +
      '|' + (reunion.etapa || '');

    var item = { reunion: reunion.nombre, fecha: reunion.fecha, etapa: reunion.etapa, idCuenta: '', score: 0, registroDigital: null, candidatoNombre: '' };
    var confirmado = anclajeYaConfirmado_(indicePendiente, 'reunion', nombreBuscado);
    var filaRdv = encontrarFilaRdvDeReunion_(reunion);

    if (!filaRdv.ok) {
      item.motivo = filaRdv.motivo;
      sinLink.push(item);
    } else if (confirmado) {
      var candidatoConfirmado = candidatosTodos.filter(function (c) { return c.idCuenta === confirmado || c.nombreCampana === confirmado; })[0];
      item.idCuenta = candidatoConfirmado ? candidatoConfirmado.idCuenta : confirmado;
      item.registroDigital = candidatoConfirmado ? candidatoConfirmado.registro : null;
      item.candidatoNombre = confirmado;
      item.score = 1;
      item.confirmadoAMano = true;
      encuentros.push(item);
    } else {
      var candidatosCercanos = candidatosCercanosPorFecha_(candidatosTodos, fecha, VENTANA_DIAS_CANDIDATOS_ANCLAJE_);
      var campoEvento = buscarMapeo('rdv', filaRdv.hoja, 'evento');
      var campoBarrio = buscarMapeo('rdv', filaRdv.hoja, 'barrio');
      var evento = campoEvento.ok ? valorPorColumna_(filaRdv.fila, 'rdv', filaRdv.hoja, campoEvento.columna) : '';
      var barrio = campoBarrio.ok ? valorPorColumna_(filaRdv.fila, 'rdv', filaRdv.hoja, campoBarrio.columna) : '';

      var resultado = anclar_(candidatosCercanos, null, umbral, function (c) { return scoreMatchDigitalRdv_(c, evento, barrio); });

      item.idCuenta = resultado.mejor ? resultado.mejor.idCuenta : '';
      item.score = resultado.score;
      item.registroDigital = resultado.mejor ? resultado.mejor.registro : null;
      item.candidatoNombre = resultado.mejor ? resultado.mejor.nombreCampana : '';

      if (!resultado.mejor || resultado.score <= 0) {
        sinLink.push(item);
      } else if (!resultado.pasaUmbral) {
        item.pendiente = true;
        bajaConfianza.push(item);
        registrarAnclajePendiente_(hojaPendiente, indicePendiente, 'reunion', nombreBuscado, resultado.top3);
      } else {
        encuentros.push(item);
      }
    }

    Logger.log('anclarEncuentros: ' + (i + 1) + '/' + reuniones.length + ' — "' + reunion.nombre + '" → ' +
      (item.idCuenta ? item.idCuenta + ' (score ' + item.score.toFixed(2) + ')' : 'sin link') + ' · ' + new Date());
    SpreadsheetApp.flush();
  });

  return { ok: true, encuentros: encuentros, sinLink: sinLink, bajaConfianza: bajaConfianza, umbral: umbral };
}

/**
 * Parte C — proveedor con contrato estable para el Paso 3.
 *
 * filasDigitalDeEncuentro(idCuenta | encuentro, ventana?) -> registro | null
 *
 * Acepta un `id_cuenta` (string) o un encuentro ya anclado (objeto con
 * `.idCuenta`, tal como devuelve `anclarEncuentros().encuentros`). Devuelve el
 * registro unido de `unirDigitalPorCuenta()` para esa cuenta — la dimensión
 * (`sd_*`) más un arreglo `<prefijo>_filas` por canal con datos — listo para
 * que una operación de `Marcadores.gs` lo sume. `null` si la cuenta no está
 * en la unión de esa ventana (huérfana o sin datos). El Paso 3 debe llamar
 * a esta función para digital en vez de `leerFuente` directo: `ctx.filas`
 * plano no alcanza para reconstruir las 6 solapas unidas.
 */
function filasDigitalDeEncuentro(idCuentaOEncuentro, ventana) {
  var idCuenta = (typeof idCuentaOEncuentro === 'string')
    ? idCuentaOEncuentro
    : (idCuentaOEncuentro && idCuentaOEncuentro.idCuenta);
  if (!idCuenta) return null;

  var ventanaResuelta = ventana || resolverVentana({});
  if (!ventanaResuelta.ok) return null;

  var union = unirDigitalPorCuenta(ventanaResuelta);
  if (!union.ok) return null;

  return union.porCuenta[normalizarIdCuenta_(idCuenta)] || null;
}

/**
 * Ítem de menú "Probar unión y anclaje" (submenú Configuración, al lado de
 * "Probar lectura por ventana"). Corre Parte A y B sobre el período de CONFIG
 * y muestra el diagnóstico — no persiste nada, es solo lectura.
 */
function menuProbarUnionYAnclaje_() {
  var ui = SpreadsheetApp.getUi();
  var ventana = resolverVentana({});
  if (!ventana.ok) {
    ui.alert('No se pudo resolver el período', ventana.motivo, ui.ButtonSet.OK);
    return;
  }

  var union = unirDigitalPorCuenta(ventana);
  if (!union.ok) {
    ui.alert('No se pudo unir digital', union.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [
    'Ventana (' + ventana.origen + '): ' + formatearFecha_(ventana.desde) + ' → ' + formatearFecha_(ventana.hasta),
    '',
    'Unión digital por cuenta (' + BASE_DIGITAL_ + '):'
  ];

  Object.keys(union.diagnostico).forEach(function (solapa) {
    var d = union.diagnostico[solapa];
    if (!d.ok) {
      lineas.push('  ⚠ ' + solapa + ' — ' + d.motivo);
      return;
    }
    if (solapa === SOLAPA_MAESTRA_DIGITAL_) {
      lineas.push('  ' + solapa + ' (maestra): ' + d.filas_leidas + ' filas, ' + d.cuentas + ' cuentas');
    } else {
      lineas.push(
        '  ' + solapa + ': ' + d.filas_leidas + ' filas, ' + d.cuentas_matcheadas + ' matcheadas, ' +
        d.huerfanas_en_canal.length + ' huérfanas en canal, ' + d.cuentas_sin_este_canal.length + ' cuentas sin este canal'
      );
    }
  });

  lineas.push('', 'Anclaje (Paso 2.9F — sobre REUNIONES, no sobre un recorte por fecha de rdv):');

  var anclaje = anclarEncuentros(ventana);
  if (!anclaje.ok) {
    lineas.push('  ⚠ ' + anclaje.motivo);
  } else {
    lineas.push('  Umbral (CONFIG.umbral_anclaje_reunion): ' + anclaje.umbral);
    lineas.push('  Reuniones linkeadas: ' + anclaje.encuentros.length);
    lineas.push('  Sin candidato/sin fila en rdv (sinLink): ' + anclaje.sinLink.length);
    lineas.push('  Baja confianza (en ANCLAJE_PENDIENTE): ' + anclaje.bajaConfianza.length);

    if (anclaje.bajaConfianza.length) {
      lineas.push('', '  Baja confianza — candidato y score, para ver por qué no cerró:');
      anclaje.bajaConfianza.slice(0, 15).forEach(function (item) {
        lineas.push(
          '    · ' + item.reunion + (item.etapa ? ' (' + item.etapa + ')' : '') +
          ' → ' + (item.candidatoNombre || '(sin candidato)') + ' (score ' + item.score.toFixed(2) + ')'
        );
      });
      lineas.push('', '  Completá "elegido" en ANCLAJE_PENDIENTE y volvé a correr: no se vuelve a preguntar.');
    }
  }

  ui.alert('Probar unión y anclaje', lineas.join('\n'), ui.ButtonSet.OK);
}
