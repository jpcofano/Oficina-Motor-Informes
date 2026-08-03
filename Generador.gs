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

  if (f === 'porcentaje') return (Math.round(numero * 10) / 10) + '%';
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
function datosDeMarcador_(fila, solapa, ventana, cache, opciones) {
  var campo = buscarMapeo(fila.base_id, solapa, fila.campo_logico);
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
    return { ok: true, filas: [registro], encabezado: null, columna: campo.columna, origen: 'union digital por cuenta' };
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

    // 4 · Los datos.
    var datos = datosDeMarcador_(fila, solapa.solapa, ventana, cache, opciones);
    if (!datos.ok) {
      base.estado = 'error';
      base.traza = datos.motivo + ' · ' + trazaVentana;
      return base;
    }

    // 5 · La operación.
    var salida = despacharOperacion_(fila.operacion, {
      marcador: fila.marcador,
      base_id: fila.base_id,
      solapa: solapa.solapa,
      campo_logico: fila.campo_logico,
      columna: datos.columna,
      encabezado: datos.encabezado,
      ventana: ventana,
      filas: datos.filas,
      valor_fijo: fila.valor_fijo
    });
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

/**
 * Paso 4 — copia la plantilla, reemplaza los `{{marcador}}` por `valor_formateado`, resalta
 * los `sin_datos`, guarda en la carpeta de salidas y devuelve link + cobertura.
 *
 * `periodoId` es **opcional** y es la única puerta para pisar la cadena de `D-20`
 * (`Paso-4` Addendum 1): si viene, se usa como override explícito del eslabón `CONFIG` y
 * **la traza tiene que decirlo**. Si no viene —el caso normal— la cadena resuelve sola.
 */
function generarInforme(informeId, periodoId) {
  return { ok: false, motivo: 'generarInforme() se implementa en el Paso 4 (todavía no).' };
}
