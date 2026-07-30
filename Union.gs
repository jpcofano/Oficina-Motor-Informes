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
