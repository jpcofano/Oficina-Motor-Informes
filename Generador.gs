/**
 * Generador.gs — Despachador de marcadores (Paso 3 v3, Parte C) y, más adelante,
 * copia de la plantilla y reemplazo en Slides (Paso 4).
 *
 * Expone:
 *   resolverMarcadores(informeId, opciones?) -> { ok, informe_id, resultados, resumen }
 *     Recorre las filas de `MARCADORES` de un informe, resuelve la ventana con la cadena
 *     de cinco eslabones (`resolverVentana`, Parte B), resuelve la solapa, pide los datos
 *     a `Fuentes.gs`, despacha a la operación y formatea. Sólo lectura.
 *   generarInforme(informeId, periodoId?) -> Paso 4, todavía no implementado.
 *
 * **REGLA DE ORO: acá no hay aritmética.** Toda cuenta vive en `Marcadores.gs`; este
 * módulo despacha y arma el reporte. Si aparece una suma acá, es un bug de arquitectura
 * aunque el número dé bien.
 *
 * **Resiliencia:** un marcador que falla no corta la corrida (`estado: 'error'`, y en el
 * deck sale `«FALTA:token»`). Un informe con tres huecos visibles es útil; una corrida que
 * aborta, no.
 */

/** `MARCADORES` plano, indexado por `marcador||informe_id` — la clave real de la hoja. */
function leerMarcadores_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MARCADORES');
  if (!hoja) return [];

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  return datos
    .map(function (fila) {
      var obj = {};
      headers.forEach(function (h, i) { if (h) obj[h] = fila[i]; });
      return obj;
    })
    .filter(function (obj) { return obj.marcador; });
}

/**
 * Las solapas de una base que están en `MAPEO` **y** son `uso = fuente`.
 *
 * El filtro por `fuente` no es cosmético: `CLAUDE.md` §2 dice que una solapa `ignorar` no
 * se toca nunca, y `m2/Cuentas` es hoy un caso real de solapa `ignorar` que sin embargo
 * está mapeada (`P1` abierto en `PENDIENTES`). Contarla acá haría que una base de una sola
 * solapa útil pareciera de dos y rompería la inferencia con un `«FALTA:@sin_solapa»`
 * inventado.
 */
function solapasFuenteDeBase_(baseId) {
  var mapa = leerMapeo();
  var deLaBase = mapa[baseId] || {};
  return Object.keys(deLaBase).filter(function (solapa) {
    return usoSolapa_(baseId, solapa) === 'fuente';
  });
}

/**
 * Regla de `docs/TOKENS.md` §4. Devuelve `{ ok, solapa, inferida }` o `{ ok:false, motivo }`.
 *
 * La inferencia **queda escrita en la traza** y el caso ambiguo **falla ruidosamente**: es
 * deliberadamente distinto de un default silencioso, que es el modo de falla que el
 * `Paso-2.3.2` sacó de `buscarMapeo`.
 */
function resolverSolapaDeMarcador_(fila) {
  var declarada = String(fila.solapa || '').trim();
  if (declarada) return { ok: true, solapa: declarada, inferida: false };

  var candidatas = solapasFuenteDeBase_(fila.base_id);
  if (candidatas.length === 1) {
    return { ok: true, solapa: candidatas[0], inferida: true };
  }
  return {
    ok: false,
    motivo: '«FALTA:' + fila.marcador + '@sin_solapa»' +
      ' — `' + fila.base_id + '` tiene ' + candidatas.length + ' solapa(s) fuente en MAPEO' +
      (candidatas.length ? ' (' + candidatas.join(', ') + ')' : '') + ', así que no se puede inferir'
  };
}

/**
 * `formato` de `MARCADORES` → texto para la lámina. No cambia el valor: sólo cómo se ve.
 * El valor crudo viaja igual en el resultado, porque es lo que audita quien revisa.
 */
function formatearValorMarcador_(valor, formato) {
  if (valor === '' || valor === null || valor === undefined) return '';
  var f = String(formato || '').trim().toLowerCase();

  if (f === 'texto' || f === '') return String(valor);
  if (f === 'fecha') {
    var fecha = (valor instanceof Date) ? valor : parsearFechaCelda_(valor);
    return fecha ? Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy') : String(valor);
  }

  var numero = Number(valor);
  if (isNaN(numero)) return String(valor);

  // `porcentaje` asume el valor **ya en unidades de porcentaje** (26.4 → "26.4%"), que es
  // lo que devuelve la operación `PCT`.
  if (f === 'porcentaje') return (Math.round(numero * 10) / 10) + '%';
  // `fraccion` asume el valor **entre 0 y 1** y lo lleva a unidades de porcentaje
  // (0.2818 → "28.2"), **sin el signo**. Corrida nocturna 04/08, las dos mitades del
  // hallazgo, verificadas en el deck generado:
  //  - las columnas `*_or`, `*_ctor` y `*_e75_pct` de `digital` vienen como fracción, y
  //    formatearlas con `porcentaje` imprimía "0.3" donde el número real es 28,2 — un
  //    número plausible y equivocado, el modo de falla más caro del proyecto;
  //  - **las cajas de JM traen su propio `%`** (`{{enc_aperturas}} ({{enc_or}}%)`), así que
  //    agregarlo acá daba "28.2%%". La plantilla es del equipo y el motor se adapta
  //    (`C-01`): el signo lo pone la lámina, la unidad la pone el formato.
  // Son dos formatos y no una heurística sobre el valor a propósito: "0,5" es un 50% en una
  // columna y medio punto en otra, y eso lo sabe la fila de `MARCADORES`, no el formateador.
  if (f === 'fraccion') return String(Math.round(numero * 1000) / 10);
  if (f === 'miles') return Math.round(numero).toLocaleString('es-AR');
  if (f === 'numero') return String(Math.round(numero * 100) / 100);
  return String(valor);
}

/**
 * Caché de lecturas por `(base_id, solapa, desde, hasta)`. Dos marcadores de la misma base,
 * solapa y ventana no releen la hoja — con ~200 marcadores sobre pocas solapas, sin esto
 * cada corrida abre la misma base decenas de veces.
 *
 * Vive por corrida: se crea en `resolverMarcadores` y se pasa hacia abajo. **No es un caché
 * de módulo a propósito**: uno de módulo sobreviviría entre corridas y devolvería datos de
 * una ventana vieja sin que nada lo diga.
 */
function claveCacheLectura_(baseId, solapa, ventana) {
  return [baseId, solapa, formatearFecha_(ventana.desde), formatearFecha_(ventana.hasta)].join('||');
}

/**
 * Los datos de un marcador. Devuelve `{ ok, filas, encabezado, columna, origen }`.
 *
 * **Excepción `digital`:** no se pide a `leerFuente` directo sino al proveedor del
 * `Paso-2.4` (`filasDigitalDeEncuentro`, `Union.gs`), porque `ctx.filas` plano no alcanza
 * para reconstruir las seis solapas ya unidas por cuenta. Requiere el contexto del ítem que
 * se está emitiendo —qué cuenta digital corresponde a este encuentro—, así que **sólo
 * aplica cuando `opciones.id_cuenta` viene dado**; sin él, el marcador sale `error` y lo
 * dice, en vez de leer la solapa equivocada.
 */
function datosDeMarcador_(fila, solapa, ventana, cache, opciones, campoOverride) {
  // `campoOverride` lo usa `RATIO`/`PCT`: su `campo_logico` es `numerador/denominador` y no
  // resuelve como uno solo, así que se resuelve con el numerador para traer las filas —y de
  // ahí salen los dos arreglos, de la misma lectura—.
  var campo = buscarMapeo(fila.base_id, solapa, campoOverride || fila.campo_logico);
  if (!campo.ok) return { ok: false, motivo: campo.motivo };

  if (fila.base_id === 'digital') {
    var idCuenta = opciones && opciones.id_cuenta;
    if (!idCuenta) {
      return {
        ok: false,
        motivo: '«FALTA:' + fila.marcador + '@digital_sin_cuenta» — `digital` se lee por el proveedor ' +
          'del Paso 2.4 (`filasDigitalDeEncuentro`), que necesita el `id_cuenta` del ítem que se está ' +
          'emitiendo. El despachador todavía no lo recibe (es del Paso 5, que itera los ítems).'
      };
    }
    var registro = filasDigitalDeEncuentro(idCuenta, ventana);
    if (!registro) {
      return { ok: false, motivo: 'la cuenta "' + idCuenta + '" no está en la unión de digital de esa ventana' };
    }

    // Corrida nocturna 04/08 — el registro unido **no es una fila plana**: los campos de
    // dimensión (`sd_*`) cuelgan de él, pero los hechos de cada canal viven en un arreglo
    // `<prefijo>_filas` con las filas crudas de esa solapa (`Union.gs` Parte A punto 3).
    // Devolver `[registro]` con `encabezado: null` hacía que toda operación leyera un campo
    // inexistente y saliera `sin_datos` — medido: los 13 `enc_*` con `id_cuenta` resuelto.
    // Acá se elige el arreglo del canal que declara la solapa del marcador y se traduce la
    // letra de columna a su encabezado, igual que en la rama de `leerFuente`.
    if (solapa === SOLAPA_MAESTRA_DIGITAL_) {
      // La maestra sí es plana, y sus claves son los `campo_logico`, no los encabezados.
      return {
        ok: true, filas: [registro], encabezado: campoOverride || fila.campo_logico,
        columna: campo.columna, origen: 'union digital por cuenta (' + solapa + ', dimensión)'
      };
    }

    var canal = SOLAPAS_CANAL_DIGITAL_.filter(function (c) { return c.solapa === solapa; })[0];
    if (!canal) {
      return {
        ok: false,
        motivo: '«FALTA:' + fila.marcador + '@solapa_digital_desconocida» — "' + solapa + '" no es una de las ' +
          'solapas de canal que une el Paso 2.4 (' + SOLAPAS_CANAL_DIGITAL_.map(function (c) { return c.solapa; }).join(', ') + ')'
      };
    }

    var filasCanal = registro[canal.prefijo + '_filas'] || [];
    return {
      ok: true,
      filas: filasCanal,
      encabezado: encabezadoEnColumna_(fila.base_id, solapa, campo.columna),
      columna: campo.columna,
      origen: 'union digital por cuenta (' + solapa + ', ' + filasCanal.length + ' fila(s) de la cuenta ' + idCuenta + ')'
    };
  }

  var clave = claveCacheLectura_(fila.base_id, solapa, ventana);
  if (!(clave in cache)) {
    cache[clave] = leerFuente(fila.base_id, ventana, solapa);
  }
  var lectura = cache[clave];
  if (!lectura.ok) return { ok: false, motivo: lectura.motivo };

  // `leerFuente` devuelve las filas como objetos indexados por NOMBRE de columna, así que
  // hace falta traducir la letra de MAPEO a su encabezado. Es resolución de estructura, no
  // aritmética: por eso vive acá y no en `Marcadores.gs`.
  var encabezado = encabezadoEnColumna_(fila.base_id, solapa, campo.columna);

  return {
    ok: true,
    filas: lectura.filas,
    encabezado: encabezado,
    columna: campo.columna,
    origen: 'leerFuente(' + fila.base_id + '/' + solapa + ')'
  };
}

/**
 * Paso 3 (v3) `D.1` Parte C — `RATIO` y `PCT`.
 *
 * `campo_logico` viene como `numerador/denominador`: se parte por `/`, se hacen **dos**
 * `buscarMapeo` sobre la **misma base y solapa**, y se arman los dos arreglos desde las
 * filas **ya leídas** — una sola lectura, la misma que cachea `datosDeMarcador_`, no dos.
 *
 * La aritmética no se toca: sigue entera en `opRATIO`/`opPCT` (`Marcadores.gs`). Acá sólo
 * se resuelve estructura, que es lo que este módulo hace.
 *
 * Devuelve `{ ok, valoresNumerador, valoresDenominador, numeradorNombre, denominadorNombre }`
 * o `{ ok:false, motivo }` con motivo propio — nunca una excepción.
 */
function partirCampoRatio_(fila, solapa, filas) {
  var partes = String(fila.campo_logico || '').split('/');
  if (partes.length !== 2 || !partes[0].trim() || !partes[1].trim()) {
    return {
      ok: false,
      motivo: '«FALTA:' + fila.marcador + '@campo_logico_no_es_ratio» — `' + fila.operacion +
        '` espera "numerador/denominador" y recibió "' + fila.campo_logico + '"' +
        (partes.length > 2 ? ' (tiene más de una barra)' : '')
    };
  }

  var nombreNum = partes[0].trim();
  var nombreDen = partes[1].trim();
  var mapNum = buscarMapeo(fila.base_id, solapa, nombreNum);
  var mapDen = buscarMapeo(fila.base_id, solapa, nombreDen);
  if (!mapNum.ok || !mapDen.ok) {
    return {
      ok: false,
      motivo: 'sin mapeo para ' + (!mapNum.ok ? 'el numerador "' + nombreNum + '"' : '') +
        (!mapNum.ok && !mapDen.ok ? ' ni ' : '') +
        (!mapDen.ok ? 'el denominador "' + nombreDen + '"' : '') +
        ' en ' + fila.base_id + '/' + solapa
    };
  }

  var encNum = encabezadoEnColumna_(fila.base_id, solapa, mapNum.columna);
  var encDen = encabezadoEnColumna_(fila.base_id, solapa, mapDen.columna);
  var extraer = function (encabezado) {
    return filas.map(function (f) { return encabezado && (encabezado in f) ? f[encabezado] : ''; });
  };

  return {
    ok: true,
    valoresNumerador: extraer(encNum),
    valoresDenominador: extraer(encDen),
    numeradorNombre: nombreNum + ' (col ' + mapNum.columna + ')',
    denominadorNombre: nombreDen + ' (col ' + mapDen.columna + ')'
  };
}

/**
 * Paso 3 (v3) Parte C — el despachador.
 *
 * `opciones` es el contexto del ítem que se está emitiendo, y todo es opcional:
 *   { seccion_id, campana, id_cuenta, ventana }
 * `seccion_id` y `campana` entran a la cadena de `resolverVentana`; `id_cuenta` es lo que
 * `digital` necesita; `ventana` permite fijarla desde afuera (el Paso 4 la usa para imprimir
 * el mismo período que calculó).
 *
 * Devuelve un resultado **por marcador**, nunca tira: `estado ∈ { ok, sin_datos, error }`.
 */
function resolverMarcadores(informeId, opciones) {
  opciones = opciones || {};

  var todos = leerMarcadores_();
  var delInforme = todos.filter(function (m) {
    var suyo = String(m.informe_id || '').trim();
    return suyo === informeId || suyo === '*';
  });

  var cache = {};
  var resultados = delInforme.map(function (fila) {
    var base = {
      marcador: fila.marcador,
      informe_id: fila.informe_id,
      base_id: fila.base_id,
      operacion: fila.operacion,
      valor: '',
      valor_formateado: ''
    };

    // 1 · La ventana. La cadena de cinco eslabones; el `periodo_ref` del marcador es el
    //     segundo, y la sección y la campaña vienen del contexto del ítem.
    var ventana = opciones.ventana || resolverVentana({
      campana: opciones.campana,
      periodo_ref: String(fila.periodo_ref || '').trim() || undefined,
      seccion_id: opciones.seccion_id
    });
    if (!ventana.ok) {
      base.estado = 'error';
      base.traza = 'ventana no resuelta: ' + ventana.motivo;
      return base;
    }
    var trazaVentana = formatearFecha_(ventana.desde) + '–' + formatearFecha_(ventana.hasta) +
      ' (' + ventana.origen + ')';

    // 2 · `TEXTO` no toca datos: se resuelve antes de pedir nada.
    if (String(fila.operacion || '').trim() === 'TEXTO') {
      var texto = despacharOperacion_('TEXTO', { valor_fijo: fila.valor_fijo });
      base.valor = texto.valor;
      base.valor_formateado = formatearValorMarcador_(texto.valor, fila.formato);
      base.estado = (texto.valor === '' || texto.valor === null || texto.valor === undefined) ? 'sin_datos' : 'ok';
      base.traza = texto.traza + ' · ' + trazaVentana;
      return base;
    }

    // 3 · La solapa.
    var solapa = resolverSolapaDeMarcador_(fila);
    if (!solapa.ok) {
      base.estado = 'error';
      base.traza = solapa.motivo + ' · ' + trazaVentana;
      return base;
    }

    // 4 · Los datos. `RATIO`/`PCT` traen las filas con el numerador y después parten.
    var esRatio = ['RATIO', 'PCT'].indexOf(String(fila.operacion || '').trim()) !== -1;
    var partido = null;
    if (esRatio) {
      var nombreNum = String(fila.campo_logico || '').split('/')[0].trim();
      if (!nombreNum) {
        base.estado = 'error';
        base.traza = '«FALTA:' + fila.marcador + '@campo_logico_no_es_ratio» — `' + fila.operacion +
          '` espera "numerador/denominador" y recibió "' + fila.campo_logico + '" · ' + trazaVentana;
        return base;
      }
    }

    var datos = datosDeMarcador_(fila, solapa.solapa, ventana, cache, opciones,
      esRatio ? String(fila.campo_logico).split('/')[0].trim() : null);
    if (!datos.ok) {
      base.estado = 'error';
      base.traza = datos.motivo + ' · ' + trazaVentana;
      return base;
    }

    if (esRatio) {
      partido = partirCampoRatio_(fila, solapa.solapa, datos.filas);
      if (!partido.ok) {
        base.estado = 'error';
        base.traza = partido.motivo + ' · ' + trazaVentana;
        return base;
      }
    }

    // 5 · La operación.
    var ctx = {
      marcador: fila.marcador,
      base_id: fila.base_id,
      solapa: solapa.solapa,
      campo_logico: fila.campo_logico,
      columna: datos.columna,
      encabezado: datos.encabezado,
      ventana: ventana,
      filas: datos.filas,
      valor_fijo: fila.valor_fijo
    };
    if (partido) {
      ctx.valoresNumerador = partido.valoresNumerador;
      ctx.valoresDenominador = partido.valoresDenominador;
      ctx.numeradorNombre = partido.numeradorNombre;
      ctx.denominadorNombre = partido.denominadorNombre;
    }
    var salida = despacharOperacion_(fila.operacion, ctx);
    if (!salida.ok) {
      base.estado = 'error';
      base.traza = salida.motivo + ' · solapa "' + solapa.solapa + '" · ' + trazaVentana;
      return base;
    }

    // 6 · El formato. No cambia el valor: el crudo viaja igual, es lo que se audita.
    base.solapa = solapa.solapa;
    base.valor = salida.valor;
    base.valor_formateado = formatearValorMarcador_(salida.valor, fila.formato);
    base.estado = (salida.valor === '' || salida.valor === null || salida.valor === undefined) ? 'sin_datos' : 'ok';
    base.traza = salida.traza +
      ' · solapa "' + solapa.solapa + '"' + (solapa.inferida ? ' (inferida: es la única fuente de la base)' : '') +
      ' · ' + trazaVentana;
    return base;
  });

  var cuenta = function (estado) {
    return resultados.filter(function (r) { return r.estado === estado; }).length;
  };

  return {
    ok: true,
    informe_id: informeId,
    resultados: resultados,
    resumen: {
      total: resultados.length,
      ok: cuenta('ok'),
      sin_datos: cuenta('sin_datos'),
      error: cuenta('error'),
      lecturas_cacheadas: Object.keys(cache).length
    }
  };
}

/* ============================== Paso 4 — generación ==============================
 *
 * Acá tampoco hay aritmética: se copia, se pinta y se registra. Los números los calculó
 * `resolverMarcadores`, que a su vez despacha a `Marcadores.gs`.
 */

/** Un token sin valor se escribe así, nunca crudo y nunca borrando la caja (`B.4`). */
function textoFaltante_(token) {
  return '«FALTA:' + token + '»';
}

/**
 * `B.3` — `token → objectId`, **antes** de reemplazar. Este barrido es irreversible en el
 * sentido que importa: cuando `{{ecv_total}}` pasa a ser "1.234", el token deja de existir
 * y el mapa no se puede reconstruir.
 *
 * Reusa `piezasDeTextoDeSlide_` (`Armonizar.gs`), que **sí** baja a tablas y a grupos —
 * `slide.getShapes()` no ve 33 tokens de JM, medido el 03/08. El `objectId` sobrevive a que
 * cambie el contenido de la caja: es lo que habilita la etapa 2 de `D-06`.
 *
 * Devuelve `{ tokens: { token: [{ slide, objectId, contenedor }] }, lista: [tokens ordenados] }`.
 */
/** Los tokens distintos de una slide, ordenados. Mismo recorrido que el mapa. */
function tokensDeSlide_(slide) {
  var vistos = {};
  piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
    var m;
    RE_TOKEN_.lastIndex = 0;
    while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) vistos[m[1]] = true;
  });
  return Object.keys(vistos).sort();
}

function mapaTokenObjectId_(presentacion) {
  var tokens = {};

  presentacion.getSlides().forEach(function (slide, i) {
    piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
      var m;
      RE_TOKEN_.lastIndex = 0;
      while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) {
        var token = m[1];
        if (!tokens[token]) tokens[token] = [];
        var ubicacion = { slide: i + 1, objectId: pieza.objectId || '', contenedor: pieza.contenedor };
        var repetida = tokens[token].some(function (u) {
          return u.slide === ubicacion.slide && u.objectId === ubicacion.objectId && u.contenedor === ubicacion.contenedor;
        });
        if (!repetida) tokens[token].push(ubicacion);
      }
    });
  });

  return { tokens: tokens, lista: Object.keys(tokens).sort() };
}

/**
 * `B.5` — el período tal como se imprime en la lámina: **inclusive en los dos extremos**,
 * con el día de la semana adelante (`R-11`: siete días, viernes a jueves). `vie 24/07 —
 * jue 30/07`, no `24/07 — 31/07`.
 *
 * Es formato, no cuenta: la ventana ya viene resuelta por `resolverVentana`.
 */
var DIAS_ABREVIADOS_ = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function formatearPeriodoLamina_(ventana) {
  var tz = Session.getScriptTimeZone();
  var pieza = function (fecha) {
    return DIAS_ABREVIADOS_[fecha.getDay()] + ' ' + Utilities.formatDate(fecha, tz, 'dd/MM');
  };
  return pieza(ventana.desde) + ' — ' + pieza(ventana.hasta);
}

/** La hoja se crea si falta, con los headers de `HOJAS_CONFIG_` — una sola fuente de esquema. */
function hojaDeSalida_(nombre) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(nombre);
  if (hoja) return hoja;

  hoja = ss.insertSheet(nombre);
  hoja.getRange(1, 1, 1, HOJAS_CONFIG_[nombre].headers.length).setValues([HOJAS_CONFIG_[nombre].headers]);
  hoja.setFrozenRows(1);
  return hoja;
}

/**
 * `B.7` (`D-12`) — `FALTANTES` **se pisa** en cada corrida: es la lista de trabajo de lo
 * que falta cablear, no un historial. Una fila por token faltante, con base, solapa, campo
 * y motivo, para poder atacarlos de a uno.
 */
function escribirFaltantes_(faltantes) {
  var hoja = hojaDeSalida_('FALTANTES');
  if (hoja.getLastRow() > 1) {
    hoja.getRange(2, 1, hoja.getLastRow() - 1, hoja.getLastColumn()).clearContent();
  }
  if (!faltantes.length) return 0;

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var filas = faltantes.map(function (f) {
    return headers.map(function (h) { return (h in f) ? f[h] : ''; });
  });
  hoja.getRange(2, 1, filas.length, headers.length).setValues(filas);
  return filas.length;
}

/**
 * `B.6` (`D-07`) — la fila de `CORRIDAS`. Append: cada generación agrega una.
 *
 * El límite de una celda de Sheets es 50.000 caracteres. Si el mapa no entra, **no se
 * trunca en silencio**: se escribe el motivo en la celda y el mapa entero viaja igual en la
 * respuesta, que es de donde se puede recuperar.
 */
var TOPE_CELDA_MAPA_TOKENS_ = 45000;

function escribirCorrida_(fila, mapaTokens) {
  var serializado = JSON.stringify(mapaTokens);
  var entra = serializado.length <= TOPE_CELDA_MAPA_TOKENS_;
  fila.mapa_tokens = entra
    ? serializado
    : '(no entra en la celda: ' + serializado.length + ' caracteres — está en la respuesta de la corrida)';

  var hoja = hojaDeSalida_('CORRIDAS');
  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  hoja.appendRow(headers.map(function (h) { return (h in fila) ? fila[h] : ''; }));
  return { entra: entra, caracteres: serializado.length };
}

/* ========================= Paso 5 — secciones repetibles =========================
 *
 * **La convención no se inventó acá: ya estaba declarada en `SECCIONES`** (`Paso-5-v2`
 * Parte A pedía elegir una y preferir la hoja de registro sobre una marca en el deck).
 * Una sección con `modo = repetible` declara sobre qué itera (`itera_sobre`) y con qué
 * familias de token se la reconoce en la plantilla (`familia_tokens`). El bloque modelo
 * **no se marca en el Slides**: se deriva de en qué slides viven esos tokens, igual que el
 * filtro de láminas congeladas de `Armonizar.gs` deriva su corte del inventario.
 *
 * Las dos fuentes de iteración que hoy tienen datos:
 *   `REUNIONES` → los encuentros anclados (`anclarEncuentros`), y de ahí sale el
 *                 `id_cuenta` que `digital` necesita para devolver número;
 *   `CAMPANAS`  → filtradas por `informe_id` + `mostrar=sí` + `periodo_id` no vacío (`D-19`).
 *
 * Un `itera_sobre` que no es ninguna de las dos **no se expande y se reporta**: la sección
 * queda como está y sus tokens caen a la pasada de tokens fijos. Inventarle una fuente
 * sería peor que dejarla visible.
 */
var FUENTES_ITERACION_ = ['REUNIONES', 'CAMPANAS'];

/** `familia_tokens` es una lista separada por coma de **prefijos** (`ecv_,enc_`). */
function familiasDeSeccion_(seccion) {
  return String(seccion.familia_tokens || '')
    .split(',')
    .map(function (f) { return f.trim(); })
    .filter(function (f) { return f !== ''; });
}

function tokenEsDeFamilia_(token, familias) {
  return familias.some(function (f) { return token.indexOf(f) === 0; });
}

/** Las secciones `repetible` y `activa` que declaran a este informe y tienen familias. */
function seccionesRepetiblesDe_(informeId) {
  var todas = leerSeccionesPlano_();
  return Object.keys(todas)
    .map(function (id) {
      var s = todas[id];
      s.seccion_id = s.seccion_id || id;
      return s;
    })
    .filter(function (s) {
      if (String(s.modo || '').trim() !== 'repetible') return false;
      if (String(s.estado || '').trim() !== 'activa') return false;
      var informes = String(s.informes || '').split(',').map(function (i) { return i.trim().toLowerCase(); });
      return informes.indexOf(String(informeId).toLowerCase()) !== -1;
    })
    .filter(function (s) { return familiasDeSeccion_(s).length > 0; });
}

/**
 * Los ítems sobre los que itera una sección. Devuelve `{ ok, items, excluidos, motivo }`.
 *
 * Cada ítem trae el **contexto del despachador** ya armado: `opciones` es lo que
 * `resolverMarcadores` espera. Ahí está la pieza que faltaba — el `id_cuenta` del encuentro
 * que se emite, sin el cual `digital` sale `«FALTA:…@digital_sin_cuenta»`.
 */
function itemsDeSeccion_(seccion, informeId, ventanaInforme) {
  var fuente = String(seccion.itera_sobre || '').trim();

  if (fuente === 'REUNIONES') {
    var anclaje = anclarEncuentros(ventanaInforme);
    if (!anclaje.ok) return { ok: false, motivo: 'no se pudo anclar: ' + anclaje.motivo };

    // Los sin link entran igual como ítem: la reunión existe en el temario (`R-02`) y tiene
    // que salir en el deck aunque sus números de digital queden en `«FALTA»`. Callarla sería
    // el modo de falla caro — un informe que se ve completo y le falta un encuentro.
    var items = anclaje.encuentros.concat(anclaje.sinLink).map(function (e) {
      return {
        clave: e.reunion + (e.etapa ? ' (' + e.etapa + ')' : ''),
        etiqueta: e.reunion,
        // La ventana es la del informe: el recorte de `digital` lo hace el link
        // campaña↔encuentro (`R-04`), no una ventana de fecha sobre la base.
        opciones: e.idCuenta
          ? { id_cuenta: e.idCuenta, ventana: ventanaInforme, seccion_id: seccion.seccion_id }
          : { ventana: ventanaInforme, seccion_id: seccion.seccion_id },
        id_cuenta: e.idCuenta || '',
        motivo: e.idCuenta ? '' : ('sin cuenta digital anclada' + (e.motivo ? ': ' + e.motivo : ''))
      };
    });
    return { ok: true, items: items, excluidos: [] };
  }

  if (fuente === 'CAMPANAS') {
    var campanas = leerCampanas();
    var items2 = [];
    var excluidos = [];
    Object.keys(campanas).forEach(function (id) {
      var c = campanas[id];
      if (String(c.informe_id || '').trim() !== informeId) return;
      if (String(c.mostrar || '').trim().toLowerCase() !== 'sí') {
        excluidos.push({ campana: id, motivo: 'mostrar ≠ sí' });
        return;
      }
      // `D-19`: sin `periodo_id` la fila no entra a ningún informe. Se reporta, nunca se
      // emite en silencio ni se asume el período vigente.
      if (!String(c.periodo_id || '').trim()) {
        excluidos.push({ campana: id, motivo: 'periodo_id vacío (D-19)' });
        return;
      }
      items2.push({
        clave: id,
        etiqueta: c.nombre || id,
        // Sin `ventana`: la campaña es el PRIMER eslabón de `D-20` y `resolverVentana` usa
        // su `desde`/`hasta`. Pasarle la del informe sería justo lo que el paso prohíbe.
        opciones: { campana: id, seccion_id: seccion.seccion_id },
        id_cuenta: '',
        motivo: ''
      });
    });
    items2.sort(function (a, b) { return Number(campanas[a.clave].orden || 0) - Number(campanas[b.clave].orden || 0); });
    return { ok: true, items: items2, excluidos: excluidos };
  }

  return {
    ok: false,
    motivo: '`itera_sobre` = "' + fuente + '" no es una fuente de iteración con datos (las que hay: ' +
      FUENTES_ITERACION_.join(', ') + '). La sección no se expande y queda como está.'
  };
}

/** Índices 0-based de las slides que llevan algún token de estas familias. */
function slidesModeloDe_(presentacion, familias) {
  var indices = [];
  presentacion.getSlides().forEach(function (slide, i) {
    var tieneFamilia = piezasDeTextoDeSlide_(slide).some(function (pieza) {
      var m;
      RE_TOKEN_.lastIndex = 0;
      while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) {
        if (tokenEsDeFamilia_(m[1], familias)) return true;
      }
      return false;
    });
    if (tieneFamilia) indices.push(i);
  });
  return indices;
}

/**
 * Duplica los bloques modelo, **sin reemplazar nada todavía**. La separación es a propósito:
 * `B.3` del Paso 4 exige registrar `token → objectId` antes del primer reemplazo, y las
 * slides copiadas tienen `objectId` propios que no existían cuando se copió la plantilla.
 * Así el mapa se toma una sola vez, sobre el deck ya expandido y todavía intacto.
 *
 * Devuelve `{ asignaciones: [{ slide, item }], reporte: [...] }` con `slide` 1-based.
 */
function duplicarBloquesRepetibles_(presentacion, informeId, ventanaInforme) {
  var asignaciones = [];
  var reporte = [];
  var reclamadas = {};

  seccionesRepetiblesDe_(informeId).forEach(function (seccion) {
    var familias = familiasDeSeccion_(seccion);
    var modelos = slidesModeloDe_(presentacion, familias);

    var resultado = itemsDeSeccion_(seccion, informeId, ventanaInforme);
    if (!resultado.ok) {
      reporte.push({ seccion: seccion.seccion_id, ok: false, motivo: resultado.motivo, slides_modelo: modelos.map(function (i) { return i + 1; }) });
      return;
    }

    if (!modelos.length) {
      reporte.push({
        seccion: seccion.seccion_id, ok: false,
        motivo: '⚠ hay ' + resultado.items.length + ' ítem(s) pero ninguna slide de la plantilla lleva tokens de ' +
          familias.join('/') + ' — es una sección curada contra una plantilla que no la contempla',
        items: resultado.items.map(function (i) { return i.clave; }),
        excluidos: resultado.excluidos
      });
      return;
    }

    // Una slide reclamada por dos secciones no se resuelve adivinando: se reporta y no se
    // toca ninguna de las dos.
    var choque = modelos.filter(function (i) { return reclamadas[i]; });
    if (choque.length) {
      reporte.push({
        seccion: seccion.seccion_id, ok: false,
        motivo: '⚠ las slides ' + choque.map(function (i) { return i + 1; }).join(', ') +
          ' ya las reclamó la sección "' + reclamadas[choque[0]] + '" — no se expande ninguna de las dos'
      });
      return;
    }
    modelos.forEach(function (i) { reclamadas[i] = seccion.seccion_id; });

    if (!resultado.items.length) {
      reporte.push({
        seccion: seccion.seccion_id, ok: true, items: [], excluidos: resultado.excluidos,
        motivo: 'sin ítems — el bloque modelo queda como está y sus tokens caen a la pasada de tokens fijos',
        slides_modelo: modelos.map(function (i) { return i + 1; })
      });
      return;
    }

    // De atrás para adelante: duplicar corre los índices de todo lo que viene después.
    modelos.slice().sort(function (a, b) { return b - a; }).forEach(function (indiceModelo) {
      var modelo = presentacion.getSlides()[indiceModelo];
      resultado.items.forEach(function (item, n) {
        var copia = modelo.duplicate();
        copia.move(indiceModelo + 1 + n);
        asignaciones.push({ objectIdSlide: copia.getObjectId(), item: item, seccion: seccion.seccion_id });
      });
      modelo.remove();
    });

    reporte.push({
      seccion: seccion.seccion_id, ok: true,
      itera_sobre: seccion.itera_sobre,
      slides_modelo: modelos.map(function (i) { return i + 1; }),
      emitidos: resultado.items.map(function (i) { return i.clave + (i.motivo ? ' ⚠ ' + i.motivo : ''); }),
      excluidos: resultado.excluidos
    });
  });

  return { asignaciones: asignaciones, reporte: reporte };
}

/**
 * Corrida nocturna 04/08, punto 6 — qué tokens de la plantilla siguen sin marcador
 * cableado. `FALTANTES` responde lo mismo pero **por instancia emitida**, con el sufijo
 * `@ítem`: sirve para atacar una corrida, no para ver el trabajo que queda. Esto agrupa por
 * token distinto y separa las tres razones, que se atacan distinto.
 *
 * Sólo lectura: no toca la plantilla ni `MARCADORES`.
 */
function tokensSinCablear_(informeId) {
  var informe = leerInformes()[informeId];
  if (!informe) return { ok: false, motivo: 'No hay fila "' + informeId + '" en INFORMES' };
  if (!informe.plantilla_id) return { ok: false, motivo: 'INFORMES.' + informeId + '.plantilla_id está vacío' };

  var enPlantilla = tokensPorSlide_(SlidesApp.openById(informe.plantilla_id));
  var cableados = {};
  leerMarcadores_().forEach(function (m) {
    var suyo = String(m.informe_id || '').trim();
    if (suyo === informeId || suyo === '*') cableados[m.marcador] = m;
  });

  var familias = {};
  var sinCablear = [];
  Object.keys(enPlantilla).sort().forEach(function (token) {
    if (cableados[token]) return;
    // `periodo` lo produce la generación, no un marcador: no es trabajo pendiente.
    if (token === 'periodo') return;
    sinCablear.push({ token: token, slides: enPlantilla[token].join(',') });
    var familia = token.indexOf('_') !== -1 ? token.slice(0, token.indexOf('_') + 1) : '(sin prefijo)';
    familias[familia] = (familias[familia] || 0) + 1;
  });

  return {
    ok: true,
    informe_id: informeId,
    plantilla: informe.plantilla_id,
    tokens_en_plantilla: Object.keys(enPlantilla).length,
    cableados_y_presentes: Object.keys(cableados).filter(function (t) { return t in enPlantilla; }).length,
    cableados_sin_caja: Object.keys(cableados).filter(function (t) { return !(t in enPlantilla); }).sort(),
    sin_cablear: sinCablear.length,
    por_familia: familias,
    detalle: sinCablear
  };
}

/**
 * Paso 4, "Control de la etapa 2" — el mapa de `CORRIDAS` **tiene que ser utilizable**, y
 * eso hay que saberlo ahora y no en tres meses: si no lo es, `D-06` etapa 2 queda sin
 * insumo. Toma un token del mapa de una corrida, abre el deck por su `deck_id`, busca el
 * elemento por `objectId` y devuelve el texto que hay hoy ahí.
 *
 * Sólo lectura. No repara nada: si el id no resuelve, lo dice.
 */
function verificarObjectIdDeCorrida_(corridaId, token) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CORRIDAS');
  if (!hoja) return { ok: false, motivo: 'La hoja CORRIDAS no existe' };

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var fila = null;
  datos.forEach(function (f) { if (String(f[idx.corrida_id]) === String(corridaId)) fila = f; });
  if (!fila) return { ok: false, motivo: 'No hay corrida "' + corridaId + '" en CORRIDAS' };

  var mapa;
  try {
    mapa = JSON.parse(fila[idx.mapa_tokens]);
  } catch (e) {
    return { ok: false, motivo: 'La celda `mapa_tokens` de esa corrida no es JSON: ' + fila[idx.mapa_tokens] };
  }

  var ubicaciones = mapa[token];
  if (!ubicaciones || !ubicaciones.length) {
    return { ok: false, motivo: 'El token "' + token + '" no está en el mapa de esa corrida' };
  }

  var presentacion = SlidesApp.openById(fila[idx.deck_id]);
  return {
    ok: true,
    corrida_id: corridaId,
    token: token,
    deck_id: fila[idx.deck_id],
    ubicaciones: ubicaciones.map(function (u) {
      var elemento = null;
      try { elemento = presentacion.getPageElementById(u.objectId); } catch (e) { elemento = null; }
      if (!elemento) {
        return { slide: u.slide, objectId: u.objectId, contenedor: u.contenedor, resuelve: false, texto: '' };
      }
      var texto = '';
      try { texto = recorteTexto_(elemento.asShape().getText().asString(), 120); } catch (e) { texto = '(el elemento no es una forma con texto: ' + u.contenedor + ')'; }
      return { slide: u.slide, objectId: u.objectId, contenedor: u.contenedor, resuelve: true, texto: texto };
    })
  };
}

/**
 * Paso 4 — copia la plantilla, reemplaza los `{{token}}` por su `valor_formateado`, escribe
 * `«FALTA:token»` en los que no tienen valor, guarda en `CONFIG.carpeta_salida` y devuelve
 * el reporte de corrida.
 *
 * `periodoId` es **opcional** y es la única puerta para pisar la cadena de `D-20`
 * (`Paso-4` `B.1`): si viene, se resuelve contra `PERIODOS` como override explícito y **la
 * traza lo dice**. Si no viene —el caso normal, y el que usa el `Paso-5`— la cadena de
 * cinco eslabones resuelve sola.
 *
 * **Nunca escribe sobre la plantilla.** La única escritura autorizada sobre una plantilla
 * es la armonización (`Armonizar.gs`), y es otra función.
 */
function generarInforme(informeId, periodoId) {
  var informe = leerInformes()[informeId];
  if (!informe) return { ok: false, motivo: 'No hay fila "' + informeId + '" en INFORMES' };
  if (!informe.plantilla_id) return { ok: false, motivo: 'INFORMES.' + informeId + '.plantilla_id está vacío' };

  var carpetaId = leerConfig().carpeta_salida;
  if (!carpetaId) return { ok: false, motivo: 'CONFIG.carpeta_salida no está cargado (precondición dura de D-03)' };

  var ventana = periodoId
    ? resolverVentana({ periodo_ref: periodoId })
    : resolverVentana({});
  if (!ventana.ok) return { ok: false, motivo: 'No se pudo resolver el período: ' + ventana.motivo };

  var trazaPeriodo = periodoId
    ? 'override explícito por periodo_id="' + periodoId + '" (' + ventana.origen + ') — pisa la cadena de D-20'
    : 'cadena de D-20, eslabón "' + ventana.origen + '"';
  var periodoLamina = formatearPeriodoLamina_(ventana);

  var carpeta;
  try {
    carpeta = DriveApp.getFolderById(carpetaId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir CONFIG.carpeta_salida: ' + e.message };
  }

  var copia;
  try {
    copia = DriveApp.getFileById(informe.plantilla_id).makeCopy(informe.nombre + ' — ' + periodoLamina, carpeta);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo copiar la plantilla: ' + e.message };
  }
  var deckId = copia.getId();

  var presentacion = SlidesApp.openById(deckId);
  var corridaId = informeId + '-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  var reemplazados = 0;
  var conValor = [];
  var faltantes = [];

  // 1 · Paso 5 — duplicar los bloques repetibles. **Sin reemplazar nada**: las copias
  //     tienen `objectId` propios y el mapa de `B.3` se toma después, una sola vez, sobre
  //     el deck ya expandido y todavía intacto.
  var expansion = duplicarBloquesRepetibles_(presentacion, informeId, ventana);

  // 2 · El mapa, ANTES de tocar un solo token.
  var mapa = mapaTokenObjectId_(presentacion);

  // 3 · La pasada por ítem: cada slide emitida se pinta con **el contexto de su ítem** —
  //     el `id_cuenta` del encuentro, o la campaña con su propia ventana. Es lo que hace
  //     que `digital` deje de salir `«FALTA:…@digital_sin_cuenta»`.
  var porItem = [];
  expansion.asignaciones.forEach(function (asignacion) {
    var slide = null;
    presentacion.getSlides().forEach(function (s) {
      if (s.getObjectId() === asignacion.objectIdSlide) slide = s;
    });
    if (!slide) {
      porItem.push({ seccion: asignacion.seccion, item: asignacion.item.clave, ok: false, motivo: 'la slide emitida no se encontró por objectId' });
      return;
    }

    var resolucionItem = resolverMarcadores(informeId, asignacion.item.opciones);
    var porMarcadorItem = {};
    resolucionItem.resultados.forEach(function (r) { porMarcadorItem[r.marcador] = r; });

    var reemplazadosItem = 0;
    tokensDeSlide_(slide).forEach(function (token) {
      var r = porMarcadorItem[token];
      if (r && r.estado === 'ok') {
        slide.replaceAllText('{{' + token + '}}', String(r.valor_formateado), true);
        reemplazadosItem++;
        conValor.push(token + ' @' + asignacion.item.clave);
        return;
      }
      if (!r && token === 'periodo') {
        slide.replaceAllText('{{' + token + '}}', periodoLamina, true);
        reemplazadosItem++;
        conValor.push(token + ' @' + asignacion.item.clave);
        return;
      }
      slide.replaceAllText('{{' + token + '}}', textoFaltante_(token), true);
      faltantes.push({
        corrida_id: corridaId,
        informe_id: informeId,
        token: token + ' @' + asignacion.item.clave,
        base_id: r ? (r.base_id || '') : '',
        solapa: r ? (r.solapa || '') : '',
        campo_logico: '',
        motivo: r
          ? (r.estado + ': ' + r.traza)
          : 'sin fila en MARCADORES — el token está en la plantilla y nadie lo cableó'
      });
    });

    reemplazados += reemplazadosItem;
    porItem.push({
      seccion: asignacion.seccion,
      item: asignacion.item.clave,
      id_cuenta: asignacion.item.id_cuenta,
      ok: true,
      reemplazados: reemplazadosItem,
      resumen: resolucionItem.resumen,
      motivo: asignacion.item.motivo
    });
  });

  // 4 · Los tokens fijos, sobre todo lo que quedó. Los de las slides emitidas ya no están:
  //     la pasada anterior los reemplazó por valor o por `«FALTA»`.
  //
  //     La ventana se le fija **sólo** cuando vino un `periodoId`: eso es lo que significa
  //     un override explícito. Sin él no se le pasa nada, para que cada marcador resuelva
  //     su propia cadena — un marcador con `periodo_ref` propio tiene que seguir usándolo
  //     (`B.5`: el encabezado dice el período del informe, pero un token con ventana propia
  //     se calcula con la suya).
  var resolucion = resolverMarcadores(informeId, periodoId ? { ventana: ventana } : {});
  var porMarcador = {};
  resolucion.resultados.forEach(function (r) { porMarcador[r.marcador] = r; });

  var tokensFijos = tokensPorSlide_(presentacion);
  Object.keys(tokensFijos).sort().forEach(function (token) {
    var resultado = porMarcador[token];

    // `{{periodo}}` lo produce la generación, no un marcador: es el encabezado de la lámina
    // y sale del período que **efectivamente se usó** (`B.5`). Si alguien le carga una fila
    // en `MARCADORES`, esa fila gana — la hoja de registro manda sobre el default.
    if (!resultado && token === 'periodo') {
      presentacion.replaceAllText('{{' + token + '}}', periodoLamina, true);
      reemplazados++;
      conValor.push(token);
      return;
    }

    if (resultado && resultado.estado === 'ok') {
      presentacion.replaceAllText('{{' + token + '}}', String(resultado.valor_formateado), true);
      reemplazados++;
      conValor.push(token);
      return;
    }

    presentacion.replaceAllText('{{' + token + '}}', textoFaltante_(token), true);
    var fila = porMarcador[token];
    faltantes.push({
      corrida_id: corridaId,
      informe_id: informeId,
      token: token,
      base_id: fila ? (fila.base_id || '') : '',
      solapa: fila ? (fila.solapa || '') : '',
      campo_logico: '',
      motivo: fila
        ? (fila.estado + ': ' + fila.traza)
        : 'sin fila en MARCADORES — el token está en la plantilla y nadie lo cableó'
    });
  });

  // 5 · Marcadores cableados que la plantilla no tiene. No es un faltante del informe: es
  //     una fila de `MARCADORES` sin caja donde escribirse, y hay que verla.
  var sinCajaEnPlantilla = Object.keys(porMarcador).filter(function (t) { return !(t in mapa.tokens); });

  var faltantesEscritos = escribirFaltantes_(faltantes);
  var celdaMapa = escribirCorrida_({
    corrida_id: corridaId,
    informe_id: informeId,
    // El override si vino; si no, de qué eslabón salió la ventana — sin esto la fila no
    // dice contra qué período se generó.
    periodo_id: periodoId || ventana.origen,
    deck_id: deckId,
    fecha_generacion: new Date(),
    tokens_reemplazados: reemplazados,
    faltantes: faltantes.length
  }, mapa.tokens);

  var dueno = '';
  try {
    var propietario = DriveApp.getFileById(deckId).getOwner();
    dueno = propietario ? propietario.getEmail() : '(sin dueño legible)';
  } catch (e) {
    dueno = '(no se pudo leer: ' + e.message + ')';
  }

  return {
    ok: true,
    corrida_id: corridaId,
    informe_id: informeId,
    deck: { id: deckId, nombre: copia.getName(), url: copia.getUrl(), dueno: dueno },
    periodo: {
      lamina: periodoLamina,
      desde: formatearFecha_(ventana.desde),
      hasta: formatearFecha_(ventana.hasta),
      origen: ventana.origen,
      // `B.5`: calculado y cargado a mano se leen igual en el deck y no se auditan igual,
      // así que la distinción va acá y no en la lámina. La marca la pone el eslabón 5 de
      // `resolverVentana`, no una comparación de strings contra el nombre del origen.
      calculado: ventana.calculado === true,
      traza: trazaPeriodo
    },
    tokens: {
      en_plantilla: mapa.lista.length,
      reemplazados: reemplazados,
      faltantes: faltantes.length,
      con_valor: conValor.sort(),
      cableados_sin_caja_en_plantilla: sinCajaEnPlantilla.sort()
    },
    marcadores: resolucion.resumen,
    // Paso 5 — qué se expandió, qué se emitió y **qué quedó excluido con su motivo**. Lo
    // excluido va en el reporte final a propósito: una campaña que el usuario tildó y no
    // salió por `D-19` no puede desaparecer en silencio.
    repetibles: { secciones: expansion.reporte, items: porItem },
    faltantes_escritos: faltantesEscritos,
    mapa_tokens: { cabe_en_la_celda: celdaMapa.entra, caracteres: celdaMapa.caracteres }
  };
}

/**
 * Ítem de menú "Generar informe completo" (`Paso-5-v2` Parte D). El motor headless corre
 * igual por API; esto es la puerta desde la planilla.
 */
function menuGenerarInformeCompleto_() {
  var ui = ui_();
  var informeId = String(leerConfig().informe_activo || '').trim();
  if (!informeId) {
    ui.alert('Generar informe completo', 'CONFIG.informe_activo está vacío.', ui.ButtonSet.OK);
    return;
  }

  var r = generarInforme(informeId);
  if (!r.ok) {
    ui.alert('Generar informe completo', 'No se generó: ' + r.motivo, ui.ButtonSet.OK);
    return r;
  }

  var lineas = [
    'Informe: ' + r.informe_id + ' · corrida ' + r.corrida_id,
    'Período: ' + r.periodo.lamina + ' (' + r.periodo.origen + (r.periodo.calculado ? ', calculado' : '') + ')',
    'Deck: ' + r.deck.nombre,
    r.deck.url,
    'Dueño del archivo: ' + r.deck.dueno,
    '',
    'Tokens: ' + r.tokens.reemplazados + ' con valor de ' + r.tokens.en_plantilla + ' · ' + r.tokens.faltantes + ' en FALTA'
  ];
  r.repetibles.secciones.forEach(function (s) {
    lineas.push('  ' + (s.ok ? '·' : '⚠') + ' ' + s.seccion + ': ' + (s.motivo || ((s.emitidos || []).length + ' emitido(s)')));
    (s.excluidos || []).forEach(function (e) { lineas.push('      excluida ' + e.campana + ' — ' + e.motivo); });
  });
  ui.alert('Generar informe completo', lineas.join('\n'), ui.ButtonSet.OK);
  return r;
}
