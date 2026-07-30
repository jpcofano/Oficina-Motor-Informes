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
var UMBRAL_CONFIANZA_ANCLAJE_ = 0.6;

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

function anclarEncuentros(ventana) {
  var precondicion = verificarPrecondicionAnclaje_();
  if (!precondicion.ok) return { ok: false, motivo: precondicion.motivo };

  var rdvLeido = leerFuente('rdv', ventana);
  if (!rdvLeido.ok) return { ok: false, motivo: rdvLeido.motivo };

  var campoEvento = buscarMapeo('rdv', SOLAPA_ANCLA_RDV_, 'evento');
  var campoBarrio = buscarMapeo('rdv', SOLAPA_ANCLA_RDV_, 'barrio');
  var campoStatus = buscarMapeo('rdv', SOLAPA_ANCLA_RDV_, 'status');
  var campoFecha = buscarMapeo('rdv', SOLAPA_ANCLA_RDV_, 'fecha_periodo');
  if (!campoEvento.ok || !campoBarrio.ok || !campoStatus.ok || !campoFecha.ok) {
    return {
      ok: false,
      motivo: 'Falta MAPEO de evento/barrio/status/fecha_periodo para rdv/' + SOLAPA_ANCLA_RDV_
    };
  }

  var realizadas = rdvLeido.filas.filter(function (fila) {
    var status = valorPorColumna_(fila, 'rdv', SOLAPA_ANCLA_RDV_, campoStatus.columna);
    return String(status || '').trim() === VALOR_STATUS_REALIZADA_;
  });

  var digitalUnido = unirDigitalPorCuenta(ventana);
  if (!digitalUnido.ok) return { ok: false, motivo: digitalUnido.motivo };

  var catalogo = catalogoBarriosDesdeBase_('rdv', HOJA_COMUNAS_RDV_);
  var anioDefecto = anioDefectoDesdeVentana_(ventana);

  var candidatos = Object.keys(digitalUnido.porCuenta).map(function (idCuenta) {
    var registro = digitalUnido.porCuenta[idCuenta];
    var nombreCampana = registro.sd_campana_digital || registro.sd_campana_cuentas || '';
    return {
      idCuenta: idCuenta,
      registro: registro,
      nombreCampana: nombreCampana,
      parseado: parsearNombreCampana_(nombreCampana, { catalogoBarrios: catalogo.barrios, anioDefecto: anioDefecto })
    };
  });

  var encuentros = [];
  var sinLink = [];
  var bajaConfianza = [];

  realizadas.forEach(function (fila) {
    var evento = valorPorColumna_(fila, 'rdv', SOLAPA_ANCLA_RDV_, campoEvento.columna);
    var barrio = valorPorColumna_(fila, 'rdv', SOLAPA_ANCLA_RDV_, campoBarrio.columna);
    // La fecha del encuentro sale de RDV, nunca del nombre de campaña (§5 bis).
    var fecha = valorPorColumna_(fila, 'rdv', SOLAPA_ANCLA_RDV_, campoFecha.columna);

    var ranking = candidatos
      .map(function (c) { return { candidato: c, score: scoreMatchDigitalRdv_(c, evento, barrio) }; })
      .sort(function (a, b) { return b.score - a.score; });

    var mejor = ranking[0];
    var item = {
      fecha: fecha,
      barrio: barrio,
      evento: evento,
      idCuenta: mejor ? mejor.candidato.idCuenta : '',
      score: mejor ? mejor.score : 0,
      registroDigital: mejor ? mejor.candidato.registro : null,
      candidatoNombre: mejor ? mejor.candidato.nombreCampana : ''
    };

    if (!mejor || mejor.score <= 0) {
      sinLink.push(item);
    } else if (mejor.score < UMBRAL_CONFIANZA_ANCLAJE_) {
      bajaConfianza.push(item);
    } else {
      encuentros.push(item);
    }
  });

  return { ok: true, encuentros: encuentros, sinLink: sinLink, bajaConfianza: bajaConfianza };
}
