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
  return memoRegistro_('MARCADORES', leerMarcadoresSinCache_);
}

function leerMarcadoresSinCache_() {
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
/**
 * El catálogo canónico de una fila con `operacion = LISTA` (`R-18` punto 2).
 *
 * `MARCADORES.catalogo` se declara como **`base/solapa`** — `rdv/Comunas`—. Ni la base ni la
 * solapa pueden vivir adentro de la operación: una operación con `'rdv'` adentro sirve para un
 * token y para ninguno más, y eso es lo que `D-01` mide.
 *
 * **Por qué no se declara en `MAPEO` como cualquier fuente:** `Comunas` está registrada en
 * `SOLAPAS` con `uso = 'referencia'` y `buscarMapeo` exige `uso = 'fuente'` — medido el
 * 07/08: devuelve `«FALTA:barrio@solapa_no_fuente(rdv/Comunas)»`. Y está bien que así sea: un
 * catálogo **no es una fuente de filas del informe**, es la lista contra la que se valida. Por
 * eso el camino es `catalogoBarriosDesdeBase_`, que abre la hoja por su cuenta.
 *
 * **El `resolver` sale del catálogo, no del token.** Hoy sólo hay uno —`parsearBarrio_`, que
 * cubre las 11 variantes ortográficas de `Parseo.gs`— y se asocia a la solapa que lo necesita.
 * Un catálogo sin `resolver` matchea sólo por forma normalizada, que es el caso común.
 */
function resolverCatalogoDeMarcador_(fila) {
  var decl = String(fila.catalogo || '').trim();
  if (!decl) {
    return {
      ok: false,
      motivo: '«FALTA:' + fila.marcador + '@sin_catalogo» — `operacion = LISTA` necesita ' +
        '`MARCADORES.catalogo` con la forma `base/solapa` (`R-18` punto 2)'
    };
  }

  var partes = decl.split('/');
  if (partes.length !== 2 || !partes[0].trim() || !partes[1].trim()) {
    return {
      ok: false,
      motivo: '«FALTA:' + fila.marcador + '@catalogo_mal_escrito» — `' + decl +
        '` no tiene la forma `base/solapa`'
    };
  }

  var baseId = partes[0].trim();
  var solapa = partes[1].trim();
  var leido = catalogoBarriosDesdeBase_(baseId, solapa);

  // Lista vacía **con motivo** es el modo de falla documentado de esa función cuando la hoja
  // no abre. Se devuelve como error y no como catálogo vacío: si pasara vacío, `LISTA`
  // rechazaría todos los valores buenos y el informe diría que el dato está sucio cuando el
  // problema es de acceso.
  if (!leido || !leido.barrios || !leido.barrios.length) {
    return {
      ok: false,
      motivo: '«FALTA:' + fila.marcador + '@catalogo_vacio» — ' + baseId + '/' + solapa +
        ' no devolvió ninguna entrada' + (leido && leido.motivo ? ': ' + leido.motivo : '')
    };
  }

  return {
    ok: true,
    catalogo: {
      lista: leido.barrios,
      resolver: parsearBarrio_,
      origen: baseId + '/' + solapa
    }
  };
}

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
  // `T2.5` (07/08) — la cuarta casilla del cuadro, la que faltaba. Los cuatro formatos son un
  // 2×2 de **unidad de entrada** × **lleva el signo**, y la fila de `MARCADORES` es la que
  // sabe las dos cosas:
  //
  //   entrada en unidades de pct + con signo  → `porcentaje`            26.4  → "26.4%"
  //   entrada en unidades de pct + sin signo  → `porcentaje_sin_signo`  26.4  → "26.4"
  //   entrada 0–1                + sin signo  → `fraccion`              0.2818 → "28.2"
  //   entrada 0–1                + con signo  → no existe, nadie lo pidió
  //
  // El hueco lo dejó anotado la corrida del 05/08 en las notas de los cinco `ecv_insc_*_pct`
  // y de `enc_e75_pct`: *"falta el formato 'unidades de pct sin signo'; se usa `numero`"*.
  // `numero` no es equivalente — redondea a **dos** decimales (25.42) donde el resto del deck
  // muestra **uno** (25.4), así que la misma lámina mezclaba dos precisiones.
  if (f === 'porcentaje_sin_signo') return String(Math.round(numero * 10) / 10);
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

  /* `_28` — un marcador de `rdv` emitido DENTRO de una lámina de encuentro lee **la fila de
   * ese encuentro**, no la ventana entera.
   *
   * Es la contraparte de la rama por cuenta de `digital`, y por el mismo motivo: sin esto los
   * seis `ecv_*` publicaban el agregado semanal en las cinco láminas —`1169` de Mail en todas—
   * y la sección repetible poblaba sin filtrar.
   *
   * **No se recorta por ventana, y es a propósito.** El temario selecciona (`R-17`): San
   * Cristóbal es del 23/07 y la ventana del informe arranca el 24/07, así que volver a
   * recortar dejaría su lámina vacía. La fila ya la eligió `encontrarFilaRdvDeReunion_` por
   * nombre y fecha de la reunión, y ya viene filtrada por la lista blanca de `D-21`.
   *
   * **La guarda de solapa no es paranoia:** `campo` se resolvió con `buscarMapeo(base, solapa)`
   * y su letra de columna vale para ESA solapa. Si el marcador apunta a una solapa distinta de
   * aquella donde se encontró la fila, la letra no aplica y el valor saldría de la columna
   * equivocada **sin fallar** — un número plausible. Ahí se cae a la rama general.
   */
  if (fila.base_id === 'rdv' && opciones && opciones.fila_rdv && opciones.hoja_rdv === solapa) {
    return {
      ok: true,
      filas: [opciones.fila_rdv],
      encabezado: encabezadoEnColumna_(fila.base_id, solapa, campo.columna),
      columna: campo.columna,
      origen: 'la fila de rdv/' + solapa + ' de este encuentro (1 fila, sin recorte por ventana: la eligió el temario)'
    };
  }

  if (fila.base_id === 'digital') {
    var idCuenta = opciones && opciones.id_cuenta;
    if (!idCuenta) {
      /* ── El agregado global de `digital` (15/08) ────────────────────────────
       * Hasta hoy, un marcador de `digital` **sin `id_cuenta` fallaba**: la única
       * forma de leer esta base era el proveedor por cuenta del Paso 2.4. Eso
       * alcanzaba para los `enc_*`, que siempre se emiten dentro de un encuentro,
       * y **bloqueaba de raíz** cualquier agregado del período — que es justo lo
       * que necesita el Resumen Ejecutivo: *"cuántos mails se mandaron esta
       * semana"*, sin cuenta.
       *
       * Cae a `leerFuente`, que es la rama general de más abajo. **La rama por
       * cuenta no se toca**: los `enc_*` siguen leyendo por el proveedor unido.
       *
       * ⚠ **Y por eso hace falta recortar por ventana acá.** `digital` es
       * `modo_periodo = snapshot` **por diseño** —sus solapas usan fecha de inicio
       * con lead de 3 a 7 días y el recorte lo hace el link campaña↔encuentro
       * (`R-04`)—, así que `leerFuente` **devuelve todas las filas de todos los
       * períodos**. Medido: 2108 filas sobre la ventana 24–30/07. Un `SUMA` sobre
       * eso da un número **grande, plausible y equivocado**, que es el modo de
       * falla de siempre. El recorte va abajo, sobre `datos.filas`, y **no** se
       * toca `BASES.modo_periodo`, que sostiene a los `enc_*`.
       * ──────────────────────────────────────────────────────────────────── */
      // `T2.2.2` (06/08) — **por el caché, igual que la rama general de más abajo.** Estaba
      // llamando a `leerFuente` directo y por eso la llamada global de la etapa 4 hacía **38
      // lecturas de fuente con `lecturas_cacheadas: 1`**: 37 de los 43 marcadores son de
      // `digital` sin `id_cuenta` y caían todos acá. Medido: 94,8 s de los 178 s de esa
      // llamada. Las solapas distintas son ~8, no 38.
      var claveAgregada = claveCacheLectura_(fila.base_id, solapa, ventana);
      if (!(claveAgregada in cache)) {
        cache[claveAgregada] = leerFuente(fila.base_id, ventana, solapa);
      }
      var lecturaAgregada = cache[claveAgregada];
      if (!lecturaAgregada.ok) return { ok: false, motivo: lecturaAgregada.motivo };
      return {
        ok: true,
        filas: lecturaAgregada.filas,
        encabezado: encabezadoEnColumna_(fila.base_id, solapa, campo.columna),
        columna: campo.columna,
        recortar_por_ventana: true,
        origen: 'agregado global de ' + fila.base_id + '/' + solapa + ' (sin id_cuenta; ' +
          lecturaAgregada.filas.length + ' fila(s) antes del recorte por ventana)'
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

  /* ── `_44` / `D-30` · la rama por cuenta declarativa ────────────────────────────────────
   * Las dos ramas de arriba están cableadas a un `base_id` literal —`rdv` y `digital`— y por eso
   * **cualquier otra base publica el mismo agregado en las seis láminas**: es el bug que el `_28`
   * arregló para `rdv`, esperando a la tercera base para repetirse. Ésta no nombra ninguna base:
   * se activa cuando la solapa **declara** cuál de sus campos lógicos lleva la cuenta.
   *
   * Va **después** de las dos cableadas y no antes: aquéllas ya están medidas y validadas, y
   * `digital` además no es un filtro sino una unión de seis solapas por cuenta (`Union.gs`), que
   * esta rama no sabría reproducir. El orden es deliberado.
   *
   * `id_cuenta` sale del contexto del ítem que se está emitiendo, no de la fila de `MARCADORES`:
   * un filtro declarativo no sirve acá porque `parsearCondicionFiltro_` toma el valor **literal**,
   * el mismo texto para las seis láminas. */
  var campoCuenta = campoIdCuentaDeSolapa_(fila.base_id, solapa);
  var idCuentaItem = opciones && opciones.id_cuenta;

  /* ── `A` (19/08/2026) · **`campo_id_cuenta` deja de ser todo-o-nada** ──────────────────────
   *
   * **El problema que resuelve.** Declarar `campo_id_cuenta` en una solapa obligaba a que **todos**
   * sus marcadores se emitieran dentro de un ítem con cuenta. Para poner los `camp_*` a leer por
   * campaña había que declararlo en `looker/resumen_metricas_dinamico`, y eso **rompía
   * `frecuencia` y `gcba_frecuencia`** —la tanda 4— que son agregados globales legítimos y no
   * tienen ítem del que sacar una cuenta.
   *
   * **Alcance real, medido el 19/08 y más chico de lo que parecía:** son **2** marcadores, no 36.
   * Las solapas de `digital` **nunca llegan hasta acá** —la rama de `digital` de más arriba las
   * atrapa y ya tiene su propio agregado global desde el 15/08—, así que declarar
   * `campo_id_cuenta` en ellas no cambiaba nada. La colisión existía **sólo** en las bases que no
   * son `rdv` ni `digital`.
   *
   * **Qué hace ahora:** con cuenta, la rama por cuenta —base entera, sin ventana, `R-17`—. Sin
   * cuenta, **cae a la rama general** en vez de fallar, que es lo mismo que `digital` ya hacía.
   *
   * ⚠ **Y lo que se pierde con esto, dicho porque es real y fue una decisión, no un descuido.** La
   * guarda que se afloja existía por un buen motivo, escrito en `planDeLecturaPorCuenta_`: *leer
   * una solapa de grano cuenta sin cuenta no es una lectura más amplia, es otra pregunta*. Con la
   * guarda, un marcador que **debía** leer por cuenta y se emitió sin ítem fallaba ruidoso; ahora
   * **publica el agregado**, que es un número grande y plausible.
   *
   * **La contención es la traza, y por eso el origen lo dice con todas las letras** —
   * `agregado global … la solapa declara campo_id_cuenta`—: el caso no desaparece, se vuelve
   * legible. **Se evaluó declararlo por marcador** (una columna en `MARCADORES`) en vez de
   * inferirlo de la ausencia; el usuario eligió esta vía el 19/08. Si el agregado plausible
   * aparece, **ésa es la salida y ya está pensada**. */
  var avisoAgregadoDeclarado = '';
  if (campoCuenta && !idCuentaItem) {
    avisoAgregadoDeclarado = ' — ⚠ la solapa declara `campo_id_cuenta = ' + campoCuenta +
      '` y este marcador se emite SIN ítem: se lee como AGREGADO GLOBAL de todas las cuentas (A, 19/08)';
    campoCuenta = null;
  }

  if (campoCuenta) {
    var plan = planDeLecturaPorCuenta_(fila.marcador, fila.base_id, solapa, campoCuenta,
      idCuentaItem, buscarMapeo(fila.base_id, solapa, campoCuenta));
    if (!plan.ok) return { ok: false, motivo: plan.motivo };

    /* **Clave de caché propia**: es la misma solapa leída de otra forma —sin recortar—, así que
     * compartir entrada con la lectura recortada devolvería filas de más a quien pidió el
     * agregado, o de menos a quien pidió la cuenta. Dos lecturas distintas, dos claves. */
    var claveCuenta = claveCacheLectura_(fila.base_id, solapa, ventana) + '||por_cuenta';
    if (!(claveCuenta in cache)) {
      cache[claveCuenta] = leerFuente(fila.base_id, ventana, solapa, { sin_recorte_por_ventana: true });
    }
    var lecturaCuenta = cache[claveCuenta];
    if (!lecturaCuenta.ok) return { ok: false, motivo: lecturaCuenta.motivo };

    var encClave = encabezadoEnColumna_(fila.base_id, solapa, plan.columnaClave);
    var filasDeLaCuenta = filtrarFilasPorCuenta_(lecturaCuenta.filas, encClave, idCuentaItem);

    return {
      ok: true,
      filas: filasDeLaCuenta,
      encabezado: encabezadoEnColumna_(fila.base_id, solapa, campo.columna),
      columna: campo.columna,
      origen: 'rama por cuenta declarativa (' + fila.base_id + '/' + solapa + ', `' + campoCuenta +
        '` = "' + idCuentaItem + '": ' + filasDeLaCuenta.length + ' de ' + lecturaCuenta.filas.length +
        ' fila(s), sin recorte por ventana — el temario ya seleccionó, R-17)'
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
    origen: 'leerFuente(' + fila.base_id + '/' + solapa + ')' + avisoAgregadoDeclarado
  };
}

/**
 * `_44` / `D-30` — las dos decisiones de la rama por cuenta, **puras y con todo por parámetro**.
 *
 * Están afuera de `datosDeMarcador_` por el mismo criterio que `validarReferenciaVentana_`
 * (`Fuentes.gs`): *una regla que sólo se puede probar rompiendo la planilla no se prueba nunca*.
 * Acá el resultado de `buscarMapeo` entra como argumento, así que el control positivo arma los
 * tres casos sin escribir en `SOLAPAS` ni en `MAPEO`.
 *
 * `mapeoClave` es el `{ ok, columna, motivo }` que devolvió `buscarMapeo` para el campo declarado.
 */
function planDeLecturaPorCuenta_(marcador, baseId, solapa, campoCuenta, idCuenta, mapeoClave) {
  /* **Sin cuenta NO se cae a leer la solapa entera, y ésta es la decisión que importa.**
   * Caer a la rama general daría una `SUMA` sobre todas las filas de todos los períodos —el
   * número grande, plausible y equivocado que este proyecto persigue— y encima **sin decirlo**.
   * Una solapa que declara `campo_id_cuenta` afirma que su grano es la cuenta: leerla sin cuenta
   * no es una lectura más amplia, **es otra pregunta**. Falla con motivo propio. */
  if (!idCuenta) {
    return {
      ok: false,
      motivo: '«FALTA:' + marcador + '@sin_id_cuenta» — ' + baseId + '/' + solapa +
        ' declara `campo_id_cuenta = ' + campoCuenta + '` en SOLAPAS, así que su grano es la ' +
        'cuenta, y este marcador se está emitiendo sin `id_cuenta` en el contexto del ítem. ' +
        'Leerla entera devolvería el agregado de todas las cuentas y de todos los períodos.'
    };
  }

  /* La guarda de solapa, en la forma que le corresponde a esta rama. La de `rdv` compara la
   * solapa del marcador contra aquella de donde salió la fila; acá el campo del marcador y el
   * campo de la cuenta se resuelven **contra la misma solapa**, así que ese desalineamiento no
   * puede darse. Lo que sí puede pasar es que el campo lógico declarado no exista en `MAPEO`, y
   * eso se falla acá en vez de filtrar contra una columna inventada: sin la clave, el filtro
   * dejaría pasar **todas** las filas y el marcador publicaría el agregado creyendo que publicó
   * la cuenta. Es el modo de falla de siempre — el número plausible del universo equivocado. */
  if (!mapeoClave || !mapeoClave.ok) {
    return {
      ok: false,
      motivo: '«FALTA:' + marcador + '@campo_id_cuenta_no_mapeado» — SOLAPAS declara `' +
        campoCuenta + '` como la cuenta de ' + baseId + '/' + solapa + ' y MAPEO no lo tiene. ' +
        ((mapeoClave && mapeoClave.motivo) || '')
    };
  }

  return { ok: true, columnaClave: mapeoClave.columna };
}

/**
 * `_44` — el filtro por cuenta. Usa `normalizarIdCuenta_` de los dos lados, que es **la** clave de
 * join del proyecto (`Union.gs`): un quinto normalizador acá desalinearía esta rama de la unión de
 * `digital`, que es justo lo que no se quiere.
 */
function filtrarFilasPorCuenta_(filas, encabezadoClave, idCuenta) {
  var buscada = normalizarIdCuenta_(idCuenta);
  return (filas || []).filter(function (o) {
    return normalizarIdCuenta_(o[encabezadoClave]) === buscada;
  });
}

/* ===================== El filtro declarativo (08/08) =====================
 *
 * Sintaxis: `campo=valor` y `campo!=valor`. **`!=` y no `≠`**: el símbolo matemático se
 * rompe al copiar, pegar y exportar una hoja, y el corte de GCBA es precisamente una
 * negación — la forma que más se va a escribir.
 *
 * **Se aplica DESPUÉS de leer, sobre las filas del `ctx`, nunca dentro de `leerFuente`.**
 * Ésa es la diferencia con `MAPEO.valores_incluidos` (`D-21`) y es todo el punto: aquél
 * filtra al leer la solapa, **para toda la corrida**, así que dos marcadores de la misma
 * solapa no pueden pedir mitades distintas del mismo universo. Éste sí.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * **QUÉ FILTRA CADA COLUMNA — la aclaración que faltaba (09/08).**
 *
 * Hay **dos** filtros con sintaxis idéntica y dominios distintos, y confundirlos cuesta:
 *
 * - **`MARCADORES.filtro` filtra FILAS DE LA BASE.** Su `campo` se resuelve por
 *   `buscarMapeo` contra la base y solapa **del marcador**. Vocabulario: `MAPEO`.
 * - **`SECCIONES.filtro` filtra ÍTEMS DE LA ITERACIÓN** — ver `filtrarItemsPorSeccion_`.
 *   Su `campo` es un atributo del ítem crudo de la fuente de iteración (`etapa`, `tipo`,
 *   `eje` en `REUNIONES`; los de la campaña en `CAMPANAS`). Vocabulario: la fuente.
 *   **Ése es su uso principal y el que tiene caso real** (`comunicaciones_post`).
 *
 * Además, `SECCIONES.filtro` **se hereda** al marcador que no declara el suyo, y ahí pasa a
 * filtrar filas de la base — **pero sólo si su campo existe en `MAPEO` para esa solapa**.
 * Si no existe, se ignora en silencio y se dice en la traza, porque los dos vocabularios no
 * tienen por qué coincidir. **El filtro propio del marcador siempre gana.**
 * ────────────────────────────────────────────────────────────────────────────
 */
/**
 * Los cuatro operadores, **del más largo al más corto, y ese orden es el algoritmo**: buscar
 * `=` antes que `!=` partiría `campo!=valor` en `campo!` y `valor`. La misma razón por la que
 * `!=` ya se buscaba antes que `=`, extendida a los dos nuevos.
 *
 * **`~=` y no `CONTIENE`** (`_10` Parte A, 09/08). El requisito no negociable era **sobrevivir a
 * exportar la hoja** — `≠` se descartó por eso mismo (`Pedido-3`, 04/08) —, y `~` es ASCII 126:
 * no se transforma al copiar, pegar ni exportar a TSV. Una palabra como `CONTIENE` tiene un
 * riesgo que el símbolo no tiene: **aparecería dentro del valor** de un filtro sobre texto libre.
 *
 * Medido antes de elegirlo: de los **7 textos de filtro** que existen hoy en `MARCADORES` y
 * `SECCIONES`, **ninguno contiene `~`**. Cero colisiones.
 */
var OPERADORES_FILTRO_ = [
  { simbolo: '!~=', op: '~=', negado: true },
  { simbolo: '~=', op: '~=', negado: false },
  { simbolo: '!=', op: '=', negado: true },
  { simbolo: '=', op: '=', negado: false }
];

/* ── La conjunción: `&&` entre condiciones (`_24`, 10/08/2026) ─────────────────────────────
 *
 * `campo=valor && campo=valor && …`. Sólo **Y**, y eso es una decisión, no una etapa: `OR`
 * exige precedencia, paréntesis y una gramática de verdad, y **no hay un solo caso medido que
 * lo pida**. Los 33 textos de filtro vivos son de una condición y las nueve demandas nuevas
 * —tres `imp_*`, seis `pauta_*`— son todas conjunciones. El caso que **parece** `OR` y no lo
 * es: `imp_prog` es «todo lo que no es Meta ni Google ads» (`R-24`), que se escribe con dos
 * negaciones en conjunción —`Plataforma!=Meta && Plataforma!=Google ads`— y no con una
 * disyunción. **La regla por resta ya evitó el `OR` sin proponérselo.**
 *
 * **Por qué `&&` y no los otros cinco que sobrevivieron la medición.** El barrido del 10/08
 * midió dos cosas distintas, y ahí está todo el aprendizaje: contra los **33 textos de filtro**
 * quedaban doce candidatos libres; contra los **valores reales de las 31 columnas** que un
 * filtro puede direccionar hoy, sólo seis: `&&`, `;`, `::`, `^`, `AND` y `&`.
 *
 * - **`|` es el caso que justifica haber medido los datos.** Sale limpio contra los 33 textos
 *   —igual que `~` en su momento— y aparece en **447 de 709 valores** de
 *   `looker/DIGITAL.nombre_campaña`, que es la columna exacta que los `imp_*` van a filtrar:
 *   `RDV JM | Villa Devoto 15/12`. Adoptarlo habría partido más de la mitad de los nombres de
 *   campaña por el medio, sin fallar. Es el mismo modo de falla que `comaDentroDeUnValor_`
 *   (`D-21`) ya cubre para `valores_incluidos`.
 * - **`AND` se descarta por el mismo motivo que se descartó `CONTIENE` a favor de `~=`**: una
 *   palabra aparecería dentro del valor de un filtro sobre texto libre.
 * - **`&` solo se descarta porque no está libre en los datos** — aparece en dos URLs de
 *   `post_meta`. `&&` sí lo está, y el doble carácter es justamente lo que lo separa del
 *   simple. **El parseo corta en `&&` y nunca en `&`**, y eso tiene control positivo propio.
 * - **`;` se descarta por un riesgo que el barrido no mide**: es el separador de campos de CSV
 *   en configuraciones regionales es-AR, y el requisito no negociable de `~=` era sobrevivir a
 *   exportar la hoja.
 * - **`^` y `::` sobreviven todo pero no dicen nada.** Entre dos candidatos técnicamente
 *   equivalentes gana el que se entiende sin abrir la documentación — el criterio de `~=`.
 *
 * `&&` es ASCII 38 duplicado, no se transforma al copiar, pegar ni exportar a TSV, está libre
 * en los 33 textos vivos y en las 31 columnas barridas, y significa «y» para cualquiera.
 *
 * **La herencia no cambia:** el filtro propio del marcador sigue **reemplazando** al de la
 * sección, no sumándose. Cambiarlo movería el resultado de los 33 filtros vivos, y este paso
 * no mueve ningún número.
 * ─────────────────────────────────────────────────────────────────────────────────────── */
var SEPARADOR_CONDICIONES_FILTRO_ = '&&';

/**
 * Devuelve **una lista de condiciones**, no un objeto: una condición sola es una lista de uno.
 * No hay dos caminos, hay uno con `n = 1` — que es lo que evita que el caso viejo y el nuevo
 * diverjan, igual que `entraPorSolape_` tiene un solo criterio con y sin fecha de fin.
 *
 * **Se corta primero por condiciones y después por operadores.** Al revés, un valor que
 * contenga `&&` rompería el corte.
 *
 * `{ ok, vacio, condiciones: [{campo, valor, negado, op}] }` o `{ ok: false, motivo }`.
 */
function parsearFiltro_(texto) {
  var t = String(texto || '').trim();
  if (t === '') return { ok: true, vacio: true, condiciones: [] };

  var piezas = t.split(SEPARADOR_CONDICIONES_FILTRO_);
  var condiciones = [];
  for (var p = 0; p < piezas.length; p++) {
    var parseada = parsearCondicionFiltro_(piezas[p]);
    if (!parseada.ok) {
      // El motivo dice **cuál** de las condiciones está mal: un `filtro_mal_escrito` sobre un
      // texto de tres es inútil si no dice dónde. Con una sola condición el mensaje queda
      // idéntico al de antes de este cambio, que es lo que ven los 33 filtros vivos.
      var donde = piezas.length > 1 ? ', condición ' + (p + 1) + ' de ' + piezas.length : '';
      return { ok: false, motivo: 'filtro mal escrito' + donde + ': ' + parseada.motivo };
    }
    condiciones.push(parseada.condicion);
  }

  return { ok: true, vacio: false, condiciones: condiciones };
}

/** Una condición suelta, con la lógica de siempre y el mismo orden de operadores. */
function parsearCondicionFiltro_(texto) {
  var t = String(texto || '').trim();
  if (t === '') {
    return { ok: false, motivo: 'está vacía — hay dos `' + SEPARADOR_CONDICIONES_FILTRO_ +
      '` seguidos, o uno al principio o al final' };
  }

  for (var i = 0; i < OPERADORES_FILTRO_.length; i++) {
    var o = OPERADORES_FILTRO_[i];
    var corte = t.indexOf(o.simbolo);
    if (corte === -1) continue;
    var campo = t.slice(0, corte).trim();
    var valor = t.slice(corte + o.simbolo.length).trim();
    if (!campo || !valor) break;
    return { ok: true, condicion: { campo: campo, valor: valor, negado: o.negado, op: o.op } };
  }

  return {
    ok: false,
    motivo: '"' + t + '" — se espera `campo=valor`, `campo!=valor`, ' +
      '`campo~=valor` (contiene) o `campo!~=valor` (no contiene)' +
      (t.indexOf('≠') !== -1 ? ' (y `!=`, no `≠`: el símbolo matemático se rompe al exportar la hoja)' : '')
  };
}

/**
 * **La única comparación de filtros del motor.** Antes había tres copias de
 * `f.negado ? v !== esperado : v === esperado` —`aplicarFiltroDeMarcador_`,
 * `filtrarItemsPorSeccion_` y la rama `CAMPANAS` de `itemsDeSeccion_`, esta última inline— y
 * agregar un operador en una sola habría dejado las otras dos **filtrando mal en silencio**:
 * `f.op` sería `~=` y `f.negado` `false`, así que caerían a igualdad exacta sin fallar.
 *
 * Los dos lados pasan por `normalizarValorDeclarado_`, el canónico de `R-10`. **No pliega case
 * ni acentos**, así que `~=` es sensible a mayúsculas: `nombre_campana~=JM` no matchea `jm`.
 */
function valorPasaFiltro_(valorCelda, cond) {
  // `_24` — la guarda que hace ruidoso el único modo de falla del cambio de firma. Ahora
  // `parsearFiltro_` devuelve `{ok, vacio, condiciones}` y **no** tiene `op` ni `valor`, así
  // que un llamador que le pase el resultado entero en vez de una de sus condiciones no
  // filtraría mal en silencio —`undefined === undefined` es `true` y todo pasaría— sino que
  // rompe acá diciendo qué se le pasó. Es el mismo criterio que hizo que la comparación viva
  // en un solo lugar: el peligro no es equivocarse, es equivocarse sin que se note.
  if (!cond || !cond.op) {
    throw new Error('valorPasaFiltro_ espera UNA condición ({campo, valor, negado, op}) y ' +
      'recibió ' + JSON.stringify(cond) + '. ¿Le pasaron el resultado de `parsearFiltro_` en ' +
      'vez de un elemento de su `condiciones`?');
  }
  var v = normalizarValorDeclarado_(valorCelda);
  var esperado = normalizarValorDeclarado_(cond.valor);
  var coincide = cond.op === '~=' ? v.indexOf(esperado) !== -1 : v === esperado;
  return cond.negado ? !coincide : coincide;
}

/**
 * `_24` — la primera condición que no pasa, o `null` si pasan todas. Devuelve **cuál** y no un
 * booleano porque los dos llamadores que reportan exclusiones necesitan nombrar el motivo, y
 * porque un filtro de tres condiciones que deja cero filas es indepurable sin eso.
 *
 * `leerValor(campo)` la arma cada llamador: el marcador resuelve por `MAPEO` + encabezado, la
 * sección lee un atributo del ítem crudo, y la rama `CAMPANAS` lee la campaña. La comparación,
 * en cambio, es una sola para los tres — que es la regla que ya regía y que ahora también
 * cubre el recorrido.
 */
function primeraCondicionQueFalla_(condiciones, leerValor) {
  for (var i = 0; i < condiciones.length; i++) {
    if (!valorPasaFiltro_(leerValor(condiciones[i].campo), condiciones[i])) return condiciones[i];
  }
  return null;
}

/**
 * Aplica el filtro de un marcador sobre las filas ya leídas.
 *
 * El `campo` se resuelve por `buscarMapeo` sobre la base y solapa **del marcador**: si no
 * está mapeado, **falla con motivo propio**, no con excepción ni con un filtro que no filtra.
 * Los dos lados se normalizan con `normalizarValorDeclarado_`, que es el canónico de `R-10`.
 *
 * Devuelve `{ ok, filas, traza }`. Cero filas **no** es un error acá: lo trata el
 * despachador, que lo baja a `sin_datos` con el motivo — un filtro mal escrito que devuelve
 * cero se lee igual que un dato faltante si no se distingue.
 */
function aplicarFiltroDeMarcador_(textoFiltro, fila, solapa, filas, heredado) {
  var f = parsearFiltro_(textoFiltro);
  if (!f.ok) {
    return { ok: false, motivo: '«FALTA:' + fila.marcador + '@filtro_mal_escrito» — ' + f.motivo };
  }
  if (f.vacio) return { ok: true, filas: filas, traza: '' };

  /* `_24` — **todas las condiciones se resuelven contra `MAPEO` antes de filtrar una fila.**
   * Nunca se aplica un subconjunto: filtrar por dos de tres devuelve un número plausible
   * sacado del universo equivocado, que es el modo de falla más caro de este proyecto.
   *
   * **Y la decisión nueva, que con una sola condición no existía: qué pasa si UNA de las
   * heredadas no mapea.** Se ignora el filtro heredado **entero**. Dos motivos:
   *
   *   1. Con `n = 1` las dos opciones coinciden, así que ignorar entero es la generalización
   *      estricta del comportamiento de hoy — no cambia ningún número de los 33 vivos.
   *   2. Aplicar el subconjunto mapeado haría que **el mismo texto de `SECCIONES.filtro`
   *      signifique cosas distintas en cada solapa**, en silencio. Alguien lo escribió como un
   *      criterio único; media condición no es una versión suave del criterio, es otro.
   *
   * **Descartado:** aplicar las condiciones que sí mapean y anotar las otras en la traza. Suena
   * más útil y es exactamente el subconjunto que el párrafo de arriba prohíbe para el filtro
   * propio; no hay razón para que la herencia tenga una regla más laxa sobre el universo. */
  var resueltas = [];
  var n = f.condiciones.length;
  for (var i = 0; i < n; i++) {
    var cond = f.condiciones[i];
    var campo = buscarMapeo(fila.base_id, solapa, cond.campo);
    if (!campo.ok) {
      // Un filtro **heredado** de la sección cuyo campo no está mapeado para esta solapa
      // **no se aplica y no es un error**: `SECCIONES.filtro` se escribe en el vocabulario de
      // la *fuente de iteración* (`etapa=post` es una columna de `REUNIONES`), y ese
      // vocabulario no tiene por qué existir en la base que lee un marcador. Sin esta guarda,
      // `comunicaciones_post` rompería **todos** sus marcadores con
      // `@filtro_campo_no_mapeado`. Un filtro **propio** sí falla: ahí alguien lo declaró
      // para ese marcador y contra esa solapa, y el campo tiene que existir.
      if (heredado) {
        return { ok: true, filas: filas, traza: '', ignorado: 'el filtro de sección `' + textoFiltro +
          '` no aplica acá: `' + cond.campo + '` no es un campo de ' + fila.base_id + '/' + solapa +
          (n > 1 ? ' — y con una condición que no mapea se ignora el filtro entero, nunca las otras sueltas' : '') };
      }
      return {
        ok: false,
        motivo: '«FALTA:' + fila.marcador + '@filtro_campo_no_mapeado» — el filtro declara `' + cond.campo +
          '`' + (n > 1 ? ' (condición ' + (i + 1) + ' de ' + n + ')' : '') +
          ' y MAPEO no lo tiene para ' + fila.base_id + '/' + solapa + '. ' + campo.motivo
      };
    }

    // Las filas vienen indexadas por ENCABEZADO (igual que en `datosDeMarcador_`), salvo la
    // maestra de digital leída **por la unión**, cuyas claves son los `campo_logico`.
    //
    // `T2.6` (07/08) — mismo arreglo que en el recorte por ventana, y por el mismo motivo: el
    // caso especial estaba puesto **por nombre de solapa** y la maestra llega por dos caminos.
    // Acá el error todavía era latente —ningún marcador filtra sobre `Seguimiento digital`—,
    // pero el primero que lo hiciera (`sd_estado`, por ejemplo) habría filtrado sobre
    // `undefined` y dejado cero filas sin decir por qué.
    resueltas.push({
      cond: cond,
      columna: campo.columna,
      clave: claveDeFila_(filas, cond.campo, encabezadoEnColumna_(fila.base_id, solapa, campo.columna))
    });
  }

  function leerDeFila_(o) {
    return function (nombreCampo) {
      for (var k = 0; k < resueltas.length; k++) {
        if (resueltas[k].cond.campo === nombreCampo) return o[resueltas[k].clave];
      }
      return undefined;
    };
  }

  var vacias = 0;
  var quedan = filas.filter(function (o) {
    resueltas.forEach(function (r) {
      if (normalizarValorDeclarado_(o[r.clave]) === '') vacias++;
    });
    return primeraCondicionQueFalla_(f.condiciones, leerDeFila_(o)) === null;
  });

  // Con una sola condición el texto es **idéntico** al de antes del `_24`: es lo que leen los
  // 33 filtros vivos y lo que sale en los reportes de corrida.
  var descripcion = n === 1
    ? 'sobre "' + resueltas[0].clave + '" (col ' + resueltas[0].columna + ')'
    : '(' + n + ' condiciones: ' + resueltas.map(function (r) {
        return '"' + r.clave + '" col ' + r.columna;
      }).join(', ') + ')';

  // Cero filas con varias condiciones es indepurable sin saber cuál cortó. El desglose se
  // calcula **sólo en ese caso**: en el normal sería ruido, que es justo lo que la traza no
  // tiene que tener.
  var desglose = '';
  if (!quedan.length && n > 1) {
    desglose = ' · sola, cada condición deja: ' + resueltas.map(function (r) {
      var sobreviven = filas.filter(function (o) { return valorPasaFiltro_(o[r.clave], r.cond); }).length;
      return '`' + r.cond.campo + '` ' + sobreviven;
    }).join(', ');
  }

  return {
    ok: true,
    filas: quedan,
    // El conteo de vacías va en la traza a propósito: una celda sin valor **pasa** el filtro
    // negado y **no pasa** el afirmativo, y esa asimetría explica diferencias que si no
    // parecen datos faltantes. Es el mismo criterio que `excluidas_por_valor` en `D-21`.
    // Con varias condiciones cuenta celdas, no filas — se dice en el texto.
    traza: 'filtro `' + textoFiltro + '` ' + descripcion + ' → ' +
      quedan.length + ' de ' + filas.length + ' fila(s)' +
      (vacias ? ' · ' + vacias + (n === 1 ? ' con la celda vacía' : ' celda(s) vacía(s) en las columnas filtradas') : '') +
      desglose
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

    // 4 bis · El filtro declarativo. Va acá —después de leer, antes de partir el ratio y
    //         antes de la operación— porque filtrar dentro de `leerFuente` es exactamente
    //         lo que impide que dos marcadores de la misma solapa pidan mitades distintas.
    //         El del marcador gana; si no declara ninguno, hereda el de su sección.
    var filtroPropio = String(fila.filtro || '').trim();
    var filtroEfectivo = filtroPropio || String((opciones && opciones.filtro_seccion) || '').trim();

    /* `D-33` (15/08/2026) — **las dimensiones se traducen a condiciones y se suman al filtro.**
     *
     * **El camino de aplicación no se toca**, y eso es deliberado: `aplicarFiltroDeMarcador_`
     * recibe texto y no se entera de que una parte vino de una dimensión. Si los ocho números
     * del piloto se movieran, no habría que preguntarse si fue la estructura o el aplicador —
     * el aplicador es exactamente el mismo.
     *
     * **La traducción vive en `Fuentes.gs`** (`condicionesDeDimensiones_`), que es resolución de
     * datos contra la forma de cada base. Acá sólo se compone.
     *
     * **Un marcador con dimensiones NO hereda el filtro de su sección**: declaró su corte, así
     * que el conjunto es propio. Sin esto, un corte explícito y uno heredado se mezclarían con
     * la regla de `_24` —que ignora el heredado entero si una condición no mapea— y el mismo
     * texto significaría cosas distintas según la solapa. */
    var dims = condicionesDeDimensiones_(fila.base_id, solapa.solapa, fila.dimensiones);
    if (!dims.ok) {
      base.estado = 'error';
      base.traza = '«FALTA:' + fila.marcador + '@dimension_no_resuelta» — ' + dims.motivo +
        ' · ' + trazaVentana;
      return base;
    }
    var hayDimensiones = dims.condiciones !== '';
    if (hayDimensiones) {
      filtroEfectivo = filtroPropio
        ? dims.condiciones + ' ' + SEPARADOR_CONDICIONES_FILTRO_ + ' ' + filtroPropio
        : dims.condiciones;
    }
    var esPropio = filtroPropio !== '' || hayDimensiones;
    var filtrado = aplicarFiltroDeMarcador_(filtroEfectivo, fila, solapa.solapa, datos.filas, !esPropio);
    if (!filtrado.ok) {
      base.estado = 'error';
      base.traza = filtrado.motivo + ' · ' + trazaVentana;
      return base;
    }
    if (filtrado.traza) {
      // Un filtro que deja cero filas sale `sin_datos` **con el motivo**, no `0`: un filtro
      // mal escrito y un dato que no existe dan el mismo número y no son lo mismo.
      if (!filtrado.filas.length) {
        base.estado = 'sin_datos';
        base.traza = 'sin_datos: el ' + filtrado.traza + ' · ' + trazaVentana;
        return base;
      }
      base.filtro_aplicado = filtrado.traza;
    }
    datos.filas = filtrado.filas;

    // 4 ter · Las fechas de cada fila, para que `ULTIMO` elija por fecha y no por posición
    //         (12/08). Resolver **qué columna es la fecha** es estructura y por eso vive acá;
    //         `opULTIMO` sólo elige. Si la solapa no tiene `fecha_periodo` mapeada, no se
    //         pasa nada y `opULTIMO` cae a su comportamiento viejo diciéndolo en la traza.
    var fechasDeFilas = null;
    var campoFechaMarcador = buscarMapeo(fila.base_id, solapa.solapa, 'fecha_periodo');
    if (campoFechaMarcador.ok) {
      // `T2.6` (07/08) — se elige por lo que la fila tiene, no por el nombre de la solapa.
      // El caso especial por nombre daba `undefined` en las 979 filas de la maestra leída por
      // `leerFuente`, y con eso las seis `pauta_*` recortaban a cero teniendo fecha.
      var claveFecha = claveDeFila_(datos.filas, 'fecha_periodo',
        encabezadoEnColumna_(fila.base_id, solapa.solapa, campoFechaMarcador.columna));
      fechasDeFilas = datos.filas.map(function (o) {
        return parsearFechaCelda_(o[claveFecha]) || null;
      });

      // El recorte por ventana del agregado global (15/08). Sólo cuando la lectura lo pide
      // —`digital` leída sin `id_cuenta`—: la rama por cuenta y las bases `filtrar`, que ya
      // vienen recortadas por `leerFuente`, no pasan por acá.
      if (datos.recortar_por_ventana && ventana && ventana.desde && ventana.hasta) {
        var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
        var desdeStr = Utilities.formatDate(ventana.desde, tz, 'yyyy-MM-dd');
        var hastaStr = Utilities.formatDate(ventana.hasta, tz, 'yyyy-MM-dd');

        // `R-16` (07/08) — el extremo derecho, si la solapa lo declara. Misma resolución de
        // clave que el izquierdo: la maestra de `digital` llega por dos caminos con filas de
        // forma distinta y elegir por nombre de solapa es lo que rompió `T2.6`.
        var campoFinMarcador = buscarMapeo(fila.base_id, solapa.solapa, 'fecha_fin_periodo');
        var claveFin = campoFinMarcador.ok
          ? claveDeFila_(datos.filas, 'fecha_fin_periodo',
            encabezadoEnColumna_(fila.base_id, solapa.solapa, campoFinMarcador.columna))
          : null;

        var antes = datos.filas.length;
        var filasRecortadas = [], fechasRecortadas = [], sinFecha = 0, sinFin = 0;
        datos.filas.forEach(function (o, i) {
          var f = fechasDeFilas[i];
          if (!f) { sinFecha++; return; }
          var s = Utilities.formatDate(f, tz, 'yyyy-MM-dd');
          var finStr = '';
          if (claveFin) {
            var ff = parsearFechaCelda_(o[claveFin]);
            if (ff) finStr = Utilities.formatDate(ff, tz, 'yyyy-MM-dd');
            else sinFin++;
          }
          if (entraPorSolape_(s, finStr, desdeStr, hastaStr)) {
            filasRecortadas.push(o);
            fechasRecortadas.push(f);
          }
        });
        datos.filas = filasRecortadas;
        fechasDeFilas = fechasRecortadas;
        // La traza dice **qué criterio se usó**, no sólo el resultado: sin eso, un conteo que
        // sube no se distingue de un dato que cambió. Y dice cuántas filas se quedaron sin el
        // extremo derecho, que son las que siguen entrando por punto (`R-16`, `A.2`).
        base.recorte_ventana = 'recorte por ventana sobre "' + claveFecha + '" · ' +
          (claveFin ? 'SOLAPE contra "' + claveFin + '" (R-16)' : 'punto — la solapa no declara fecha_fin_periodo') +
          ': ' + filasRecortadas.length + ' de ' + antes + ' fila(s)' +
          (sinFecha ? ' · ' + sinFecha + ' sin fecha, excluidas' : '') +
          (sinFin ? ' · ' + sinFin + ' sin fecha de fin, entran por punto' : '');
      }
    } else if (datos.recortar_por_ventana) {
      // Sin `fecha_periodo` mapeada no hay con qué recortar, y devolver el total de todos los
      // períodos sería el número plausible y equivocado. Se falla con motivo propio.
      base.estado = 'error';
      base.traza = '«FALTA:' + fila.marcador + '@sin_fecha_para_recortar» — el agregado global de ' +
        fila.base_id + '/' + solapa.solapa + ' necesita recortar por la ventana del informe y esa ' +
        'solapa no tiene `fecha_periodo` en MAPEO · ' + trazaVentana;
      return base;
    }

    // 4 quater · `RATIO`/`PCT` parten **después** del filtro y del recorte por ventana, no
    //            antes. Estaba al revés y se midió el 16/08: `mail_or` dividía
    //            4.859.412 / 21.268.081 —todas las filas de todos los períodos— mientras su
    //            `SUMA` hermana sumaba 211.357 sobre las 7 filas recortadas. **Dos números
    //            del mismo marcador salidos de universos distintos.**
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
      fechas: fechasDeFilas,
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
    // 5 bis · El catálogo de `LISTA`. Se resuelve **acá y no adentro de la operación**: leer
    //         una hoja es acceso a datos, y `Marcadores.gs` sólo hace la cuenta. La
    //         operación recibe la lista ya traída.
    if (String(fila.operacion || '').trim() === 'LISTA') {
      var cat = resolverCatalogoDeMarcador_(fila);
      if (!cat.ok) {
        base.estado = 'error';
        base.traza = cat.motivo + ' · solapa "' + solapa.solapa + '" · ' + trazaVentana;
        return base;
      }
      ctx.catalogo = cat.catalogo;
      ctx.separador = fila.separador;
    }
    var salida = despacharOperacion_(fila.operacion, ctx);
    if (!salida.ok) {
      base.estado = 'error';
      base.traza = salida.motivo + ' · solapa "' + solapa.solapa + '" · ' + trazaVentana;
      return base;
    }
    base.rechazados = salida.rechazados || [];

    // 6 · El formato. No cambia el valor: el crudo viaja igual, es lo que se audita.
    base.solapa = solapa.solapa;
    base.valor = salida.valor;
    base.valor_formateado = formatearValorMarcador_(salida.valor, fila.formato);
    /* ── `REVISAR` (08/08) — el cuarto estado, y no es un `sin_datos` con etiqueta ────────
     * `R-18` addendum 1: **`sin_datos` afirma que no había nada.** Si había filas y **ninguna
     * se pudo publicar** —todas quedaron fuera del catálogo— decir `sin_datos` es publicar una
     * afirmación que el motor no midió, que es el modo de falla que este proyecto persigue.
     *
     * **El corte es "vacío Y hubo rechazos"**, no "hubo rechazos": una lista que publica tres
     * de cinco **sí resolvió** y va `ok` — sus dos rechazados ya viajan a `FALTANTES` con su
     * fila propia desde el 08/08. Lo que `REVISAR` marca es el caso en que el token no pudo
     * decir nada **teniendo datos que decir**.
     *
     * **No hace falta tocar el pintado**, y se verificó antes de escribir esto: los dos puntos
     * que pintan preguntan `estado === 'ok'` y **todo lo demás cae al mismo camino** — publica
     * `«FALTA:token»` y deja su fila en `FALTANTES` con `estado + ': ' + traza`. Así que
     * `REVISAR` hereda el precedente en vez de inventar una forma nueva, y la diferencia vive
     * donde sirve: en el estado, en la traza y en el listado.
     * ──────────────────────────────────────────────────────────────────────────────────── */
    var vacio = (salida.valor === '' || salida.valor === null || salida.valor === undefined);
    var huboRechazos = !!(salida.rechazados && salida.rechazados.length);
    base.estado = vacio ? (huboRechazos ? 'REVISAR' : 'sin_datos') : 'ok';
    base.traza = salida.traza +
      (base.recorte_ventana ? ' · ' + base.recorte_ventana : '') +
      (base.filtro_aplicado ? ' · ' + base.filtro_aplicado : '') +
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
      // `REVISAR` (08/08) va en el resumen y no sólo en la traza: un estado que no se cuenta
      // es un estado que nadie mira. Distinto de `sin_datos` a propósito — ver el comentario
      // del corte, arriba.
      revisar: cuenta('REVISAR'),
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

/**
 * Un token sin valor se escribe así, nunca crudo y nunca borrando la caja (`B.4`).
 *
 * `_27` bloque 1.2 (11/08/2026) — segundo modo, **opción de la corrida y nunca default**.
 * `«FALTA:token»` es el modo de trabajo y sigue siéndolo: dice qué token es y se ve de lejos.
 * Pero una lámina con veinte de ésos se lee como un motor roto aunque el motor esté bien, y
 * para mostrarlo hay un modo que rinde el hueco como una raya.
 *
 * **La contraparte es lo que hace que esto no sea esconder el problema, y es estructural, no
 * una promesa:** esta función sólo decide el TEXTO que va a la caja. Los tres puntos que la
 * llaman empujan su fila a `faltantes` en la línea de al lado, con token y motivo, y de ahí
 * salen `FALTANTES` y los conteos del reporte. **No hay forma de cambiar el glifo y perder el
 * registro**: son dos caminos distintos y ninguna opción toca el segundo. Si algún día se
 * pudieran tocar juntos, el modo no se usa (`_27` 1.2).
 *
 * La raya no vive en `CONFIG` a propósito: no es un parámetro de negocio que alguien vaya a
 * querer cambiar sin tocar código —el criterio de `D-01`— sino cómo se rinde un hueco, y el
 * modo se elige por corrida, no por instalación.
 */
function textoFaltante_(token, comoRaya) {
  return comoRaya === true ? '—' : '«FALTA:' + token + '»';
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
/**
 * Los tokens distintos de una slide, ordenados. Mismo recorrido que el mapa.
 *
 * **Una slide escondida devuelve la lista vacía** (06/08). Hoy no puede pasar —ninguna slide
 * modelo de `jm` está escondida, medido— pero `duplicate()` copia el estado de la modelo, así
 * que el día que alguien esconda una modelo sus copias nacen escondidas y esto las saltea sin
 * que haya que acordarse. La guarda es barata; descubrirlo en un deck, no.
 */
function tokensDeSlide_(slide) {
  if (esLaminaEscondida_(slide)) return [];
  var vistos = {};
  piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
    var m;
    RE_TOKEN_.lastIndex = 0;
    while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) vistos[m[1]] = true;
  });
  return Object.keys(vistos).sort();
}

/**
 * **El mapa excluye las láminas escondidas** (06/08). Su único llamador es la etapa 2 de
 * `generarInforme`, y desde acá se corrigen de un saque las cuatro cosas que salen de él: el
 * denominador `tokens.en_plantilla`, `cableados_sin_caja_en_plantilla`, el `mapa_tokens` que
 * se guarda en `CORRIDAS`, y la barrida final de `T2.1.1`.
 *
 * El motivo es el mismo que el de `mapaDeTokens_` desde el 16/08: una lámina omitida **no se
 * emite**, así que sus tokens no se pueden llenar nunca y pintarlos es trabajo sobre algo que
 * nadie va a ver. Era la diferencia entre los 195 que veía la corrida y los 172 que declara
 * el mapa: los 23 tokens de la lámina 10 de M2.
 *
 * **Nada se excluye en silencio** (`D-21`): lo excluido sale en `escondidas`, con la lista de
 * tokens y de láminas, y el resultado de la corrida lo publica.
 */
function mapaTokenObjectId_(presentacion) {
  var tokens = {};
  var slides = presentacion.getSlides();
  var escondidas = laminasEscondidas_(slides);
  var tokensEscondidos = {};

  slides.forEach(function (slide, i) {
    var estaEscondida = escondidas[i + 1] === true;
    piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
      var m;
      RE_TOKEN_.lastIndex = 0;
      while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) {
        var token = m[1];
        if (estaEscondida) {
          if (!tokensEscondidos[token]) tokensEscondidos[token] = [];
          if (tokensEscondidos[token].indexOf(i + 1) === -1) tokensEscondidos[token].push(i + 1);
          continue;
        }
        if (!tokens[token]) tokens[token] = [];
        var ubicacion = { slide: i + 1, objectId: pieza.objectId || '', contenedor: pieza.contenedor };
        var repetida = tokens[token].some(function (u) {
          return u.slide === ubicacion.slide && u.objectId === ubicacion.objectId && u.contenedor === ubicacion.contenedor;
        });
        if (!repetida) tokens[token].push(ubicacion);
      }
    });
  });

  return {
    tokens: tokens,
    lista: Object.keys(tokens).sort(),
    escondidas: {
      laminas: Object.keys(escondidas).map(Number).sort(function (a, b) { return a - b; }),
      tokens: Object.keys(tokensEscondidos).sort(),
      cuantos: Object.keys(tokensEscondidos).length
    }
  };
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

/**
 * `CORRIDAS` se abre al EMPEZAR, no al terminar (17/08).
 *
 * **Medido:** hay **22 decks en la carpeta de salida y 12 filas en `CORRIDAS`**. El motor
 * copia la plantilla y crea el deck **siempre**; lo que a veces no llega a pasar es la
 * escritura de la fila, que estaba **al final de todo**. Una corrida que moría después de
 * crear el deck **no dejaba ningún rastro, por diseño** — y sin rastro no se puede
 * diagnosticar: los últimos cuatro objetivos quedaron sin verificar por esto.
 *
 * Abre la fila con lo que ya se sabe —`corrida_id`, `informe_id`, `periodo_id`, hora de
 * inicio— y devuelve su número para que `escribirCorrida_` la **complete** en vez de
 * agregar una nueva. Si la corrida muere en el medio, la fila queda con el `deck_id` vacío
 * y los conteos vacíos: **eso mismo es el diagnóstico**.
 */
function abrirCorrida_(fila) {
  var hoja = hojaDeSalida_('CORRIDAS');
  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  hoja.appendRow(headers.map(function (h) { return (h in fila) ? fila[h] : ''; }));
  return hoja.getLastRow();
}

/**
 * Deja la etapa en curso en la fila abierta de `CORRIDAS` (18/08).
 *
 * **Escribe en el momento, no acumula.** Si acumulara y volcara al final, una corrida que
 * muere no dejaría nada — que es exactamente el problema que `abrirCorrida_` acaba de
 * resolver. Cuesta un `setValue` por etapa (cinco en total) y a cambio la fila dice **hasta
 * dónde llegó**.
 *
 * Va en la columna `faltantes` a propósito: está libre hasta el final —ahí vive el marcador
 * de "corrida en curso"— y `escribirCorrida_` la pisa con el número real al terminar. Sin
 * columna nueva, sin `COLUMNAS_DELTA_`, sin tocar el esquema.
 */
/**
 * `T2.7` (07/08) — el prefijo que distingue "esto es el rastro de etapas" de la marca inicial
 * que deja `abrirCorrida_`. Sin él, la primera etapa se pegaría al texto de "corrida en curso"
 * y la celda quedaría ilegible.
 */
var MARCA_ETAPAS_ = '(en curso) ';

/**
 * `T2.7` (07/08) — los fallos del propio instrumento.
 *
 * `marcarEtapa_` **no puede voltear la corrida**: eso está bien y no cambia. Lo que estaba mal
 * es que tampoco dejaba rastro — un `catch` vacío. Si el instrumento falla, la fila queda
 * diciendo una etapa vieja y **eso se lee como "murió ahí"**, que es una conclusión falsa
 * fabricada por el instrumento mismo. Ahora el fallo se guarda y la corrida lo publica.
 *
 * Vive en una variable de módulo, así que **muere con la ejecución de Apps Script**. Se
 * reinicia al empezar cada corrida para que no arrastre lo de la anterior en la misma
 * invocación.
 */
var fallosInstrumento_ = [];

function reiniciarInstrumento_() { fallosInstrumento_ = []; }

function fallosDelInstrumento_() { return fallosInstrumento_.slice(); }

/**
 * `T2.7` (07/08) — lo que la columna `faltantes` de `CORRIDAS` dice al cerrar.
 *
 * Esa columna hace de campo de estado desde `abrirCorrida_`, y ahora puede tener que contar
 * **dos cosas a la vez**: que la corrida murió por una excepción y que el instrumento que
 * anotaba las etapas también falló. **No compiten.** Un ternario las hacía competir, y el
 * control positivo cazó el caso: con las dos, la celda contaba sólo la excepción — justo
 * cuando más importa saber que el rastro de etapas no es confiable.
 *
 * Sin advertencias devuelve el número pelado, que es el caso normal y el que hace que la
 * columna siga sirviendo para contar.
 */
function avisosDeLaFila_(cuantosFaltantes, fallo, fallosInstrumento) {
  var avisos = [];
  if (fallo) {
    avisos.push('⚠ excepción en la etapa "' + fallo.etapa + '": ' + fallo.mensaje);
  }
  if (fallosInstrumento && fallosInstrumento.length) {
    avisos.push('⚠ el instrumento falló ' + fallosInstrumento.length + ' vez/veces — el rastro ' +
      'de etapas no es confiable: ' +
      fallosInstrumento.map(function (f) { return f.etapa + ' → ' + f.mensaje; }).join(' · '));
  }
  return avisos.length ? cuantosFaltantes + ' · ' + avisos.join(' · ') : cuantosFaltantes;
}

function marcarEtapa_(numeroFila, etapa, t0) {
  if (numeroFila) {
    try {
      var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CORRIDAS');
      if (!hoja) throw new Error('la hoja CORRIDAS no existe');
      var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
      var col = headers.indexOf('faltantes') + 1;
      if (col < 1) throw new Error('CORRIDAS no tiene columna `faltantes`');

      var seg = Math.round((new Date().getTime() - t0) / 1000);
      var celda = hoja.getRange(numeroFila, col);
      var previo = String(celda.getValue() || '');

      // `T2.7` — **cada marca sobrevive a la siguiente.** Antes las cinco se pisaban en la
      // misma celda y la fila sólo decía la última que llegó a escribirse: una corrida que
      // moría en la etapa 4 podía dejar escrita la 1 si el `setValue` de la 4 no alcanzó a
      // volcarse, y eso se leía como "no arrancó". Acumular cuesta un `getValue` por etapa
      // —cinco en total— y a cambio la fila dice **el recorrido**, no un punto.
      var marca = etapa + ' +' + seg + 's';
      celda.setValue(previo.indexOf(MARCA_ETAPAS_) === 0
        ? previo + ' › ' + marca
        : MARCA_ETAPAS_ + marca);
      SpreadsheetApp.flush(); // sin esto el buffer puede morir con la corrida
    } catch (e) {
      // Sigue sin poder voltear la corrida. Pero ya no desaparece.
      fallosInstrumento_.push({
        etapa: etapa,
        mensaje: String((e && e.message) ? e.message : e)
      });
      try { console.error('marcarEtapa_ falló en "' + etapa + '": ' + e); } catch (e2) { /* ni el log */ }
    }
  }
  // `T2.1.2` — devuelve la etapa para que la corrida sepa en cuál está sin repetir el
  // literal en una variable paralela. Si adentro salta una excepción, el cierre tiene que
  // poder nombrar dónde murió, y dos copias del mismo string se desincronizan solas.
  return etapa;
}

function escribirCorrida_(fila, mapaTokens, numeroFila) {
  var serializado = JSON.stringify(mapaTokens);
  var entra = serializado.length <= TOPE_CELDA_MAPA_TOKENS_;
  fila.mapa_tokens = entra
    ? serializado
    : '(no entra en la celda: ' + serializado.length + ' caracteres — está en la respuesta de la corrida)';

  var hoja = hojaDeSalida_('CORRIDAS');
  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var valores = headers.map(function (h) { return (h in fila) ? fila[h] : ''; });

  // Completa la fila que abrió `abrirCorrida_`. Sin número de fila —llamada vieja— agrega,
  // que es el comportamiento de antes y no rompe a ningún otro llamador.
  if (numeroFila) hoja.getRange(numeroFila, 1, 1, headers.length).setValues([valores]);
  else hoja.appendRow(valores);

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

/**
 * `T2.6` (07/08) — con qué clave se lee un campo de una fila, cuando la misma solapa llega
 * por dos caminos con filas de forma distinta.
 *
 * Por la unión (`Union.gs`) el registro de la maestra de `digital` es **plano y sus claves son
 * los `campo_logico`**. Por `leerFuente` —el agregado global, sin `id_cuenta`— las filas
 * vienen **indexadas por el encabezado real de la planilla**. Dos formas, la misma solapa.
 *
 * Hasta hoy la elección se hacía **por el nombre de la solapa**: si era la maestra, clave
 * lógica; si no, encabezado. Eso es correcto por el camino de la unión y **falso por el otro**,
 * y el precio fue silencioso: `pauta_google/meta/prog` y sus tres `gcba_*` recortaban
 * `0 de 979 fila(s) · 979 sin fecha` porque `o['fecha_periodo']` era `undefined` en las 979.
 * Medido: por el encabezado real (`"Fecha de inicio"`, columna `L`) **751 de 979 filas tienen
 * fecha** y 16 caen en la ventana del informe.
 *
 * Se elige por **lo que la fila realmente tiene**, que es lo único que no puede mentir.
 */
function claveDeFila_(filas, claveLogica, encabezadoReal) {
  var muestra = (filas && filas.length) ? filas[0] : null;
  if (muestra && Object.prototype.hasOwnProperty.call(muestra, claveLogica)) return claveLogica;
  return encabezadoReal;
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
/**
 * `SECCIONES.filtro`, implementada desde cero (08/08).
 *
 * **Estaba declarada y muerta:** la columna existía desde el Paso 2.9G, una sola fila la
 * usaba —`comunicaciones_post` con `etapa=post`— y **ningún código la leía**; el único lugar
 * del repo que la mencionaba era `filaSeccion_`, que la escribe. Medido en la Parte 0 del
 * `Pedido-3` (06/08).
 *
 * Filtra **los ítems de la iteración**, no las filas de la base — que es lo que su único
 * caso real necesita: `comunicaciones_post` itera sobre `REUNIONES` y tiene que emitir sólo
 * las reuniones con `etapa = post`, no las cinco. El atributo se busca **en el ítem crudo**
 * de la fuente de iteración, con la misma sintaxis del filtro de marcador.
 *
 * Los excluidos se devuelven y se reportan: una sección que emite de menos en silencio es el
 * modo de falla que el motor evita en todo lo demás.
 */
function filtrarItemsPorSeccion_(seccion, crudos, leerAtributo) {
  var f = parsearFiltro_(seccion.filtro);
  if (!f.ok) return { ok: false, motivo: 'SECCIONES.filtro de "' + seccion.seccion_id + '": ' + f.motivo };
  if (f.vacio) return { ok: true, crudos: crudos, excluidos: [], traza: '' };

  var excluidos = [];
  var quedan = crudos.filter(function (c) {
    // `_24` — con varias condiciones el motivo nombra **la primera que falla**, no las tres:
    // quien lee el reporte necesita saber por qué salió este ítem, y la primera alcanza.
    var falla = primeraCondicionQueFalla_(f.condiciones, function (campo) { return leerAtributo(c, campo); });
    if (falla) {
      excluidos.push({
        item: leerAtributo(c, '__clave__'),
        motivo: falla.campo + ' = "' + normalizarValorDeclarado_(leerAtributo(c, falla.campo)) + '"'
      });
    }
    return !falla;
  });

  return {
    ok: true, crudos: quedan, excluidos: excluidos,
    traza: 'SECCIONES.filtro `' + String(seccion.filtro).trim() + '` → ' + quedan.length + ' de ' + crudos.length + ' ítem(s)'
  };
}

function itemsDeSeccion_(seccion, informeId, ventanaInforme) {
  var fuente = String(seccion.itera_sobre || '').trim();

  if (fuente === 'REUNIONES') {
    var anclaje = anclarEncuentros(ventanaInforme);
    if (!anclaje.ok) return { ok: false, motivo: 'no se pudo anclar: ' + anclaje.motivo };

    // Los sin link entran igual como ítem: la reunión existe en el temario (`R-02`) y tiene
    // que salir en el deck aunque sus números de digital queden en `«FALTA»`. Callarla sería
    // el modo de falla caro — un informe que se ve completo y le falta un encuentro.
    /* `_31.3` Parte G — **`bajaConfianza` se excluye, pero deja de hacerlo en silencio.**
     *
     * `anclarEncuentros` devuelve TRES listas y acá se concatenaban dos: los de baja confianza
     * desaparecían del deck sin una línea en `excluidos`. Medido el 11/08: `junio_sem2` emitió 3
     * de 4 y Almagro no figuraba ni entre los emitidos ni entre los excluidos.
     *
     * **No entran como ítem, y esa parte es correcta.** Un ancla por debajo del umbral es un ancla
     * flojo, y el ancla decide **qué fila de `rdv` se lee**: emitir la lámina publicaría barrio,
     * inscriptos y población de una fila que el motor no está seguro de haber acertado. Es el
     * número plausible que el umbral existe para evitar. `sinLink` sí entra porque ahí el ancla de
     * `rdv` está bien y lo que falta es el enlace digital — son dos faltas distintas.
     *
     * Lo que cambia es que ahora se ven, con el puntaje y el umbral adentro del motivo.
     */
    var crudos = anclaje.encuentros.concat(anclaje.sinLink);
    var excluidosBajaConfianza = (anclaje.bajaConfianza || []).map(function (e) {
      return {
        item: e.reunion + (e.etapa ? ' (' + e.etapa + ')' : ''),
        motivo: 'anclaje por debajo del umbral: puntaje ' + (e.score || 0).toFixed(2) +
          ' < ' + anclaje.umbral + ' (CONFIG.umbral_anclaje_reunion) — registrado en ANCLAJE_PENDIENTE, ' +
          'no se emite para no publicar la fila de rdv equivocada'
      };
    });
    var filtroR = filtrarItemsPorSeccion_(seccion, crudos, function (e, campo) {
      return campo === '__clave__' ? (e.reunion + (e.etapa ? ' (' + e.etapa + ')' : '')) : e[campo];
    });
    if (!filtroR.ok) return { ok: false, motivo: filtroR.motivo };

    var items = filtroR.crudos.map(function (e) {
      // La ventana es la del informe: el recorte de `digital` lo hace el link
      // campaña↔encuentro (`R-04`), no una ventana de fecha sobre la base.
      var opciones = { ventana: ventanaInforme, seccion_id: seccion.seccion_id, filtro_seccion: seccion.filtro };
      // `digital` se recorta por cuenta…
      if (e.idCuenta) opciones.id_cuenta = e.idCuenta;
      // …y `rdv` por su fila, que es la llave del ítem en esa base (`_28`). Las dos viajan
      // juntas y son independientes: un encuentro puede tener fila de `rdv` y no tener cuenta
      // digital anclada, y entonces sus `ecv_*` salen y sus `enc_*` no.
      if (e.filaRdv) {
        opciones.fila_rdv = e.filaRdv;
        opciones.hoja_rdv = e.hojaRdv;
      }
      return {
        clave: e.reunion + (e.etapa ? ' (' + e.etapa + ')' : ''),
        etiqueta: e.reunion,
        opciones: opciones,
        id_cuenta: e.idCuenta || '',
        motivo: e.idCuenta ? '' : ('sin cuenta digital anclada' + (e.motivo ? ': ' + e.motivo : ''))
      };
    });
    // `_31.1` B.4 — las excluidas por `periodo_id` se suman a las que excluye `SECCIONES.filtro`.
    // Van en la misma lista a propósito: para quien lee el reporte son lo mismo —un ítem que no
    // salió y por qué— y separarlas en dos listas obligaría a mirar dos lugares para responder
    // "¿por qué no está este encuentro?".
    var excluidos = (anclaje.excluidas_por_periodo || [])
      .concat(excluidosBajaConfianza)
      .concat(filtroR.excluidos || []);
    return {
      ok: true, items: items, excluidos: excluidos, filtro: filtroR.traza,
      // `''` = no se filtró por período. El reporte lo dice en vez de dejarlo suponer.
      periodo_id: anclaje.periodo_id || ''
    };
  }

  if (fuente === 'CAMPANAS') {
    /* `CAMPANAS` es una **lista** desde el 18/08: se recorren filas, no claves. */
    var campanas = leerCampanas();
    var items2 = [];
    var excluidos = [];
    campanas.forEach(function (c) {
      var id = String(c.campana_id || '').trim();
      /* ⚠ **El filtro por `informe_id` SE SACÓ** (decisión del usuario, 18/08): *"no importa de
       * qué informe sean las campañas — la campaña no pertenece a un informe"*. Puede presentarse
       * en cualquiera, y los decks lo muestran: «Programas y actividades para personas mayores»
       * sale en `jm` y en `secco` la misma semana.
       *
       * **Hoy es observablemente un no-op**: las tres filas cargadas son de `secco` y las tres
       * tienen `periodo_id` vacío, así que `D-19` ya las excluía a todas. Se anota para que el
       * día que cambie el conteo nadie lo lea como una regresión.
       *
       * ⚠ **Y lo que esto DEJA ABIERTO, dicho acá porque es donde se va a notar:** con el
       * `informe_id` afuera, lo único que decide en qué corrida sale una campaña es `periodo_id`
       * — y esta rama sólo exige que **no esté vacío**, no que **coincida con el período de la
       * corrida**. Con campañas cargadas, las tres saldrían en **todos** los informes. **La
       * selección semanal todavía no está implementada**, y `itemsDeSeccion_` ni siquiera recibe
       * el `periodo_id` de la corrida (recibe `ventanaInforme`). Es una decisión de diseño
       * pendiente, no un olvido de este cambio. */
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
      // `SECCIONES.filtro` sobre los atributos de la campaña, misma sintaxis.
      //
      // ⚠ `fc.ok &&` — un filtro de sección **mal escrito se saltea en silencio acá**, mientras
      // que `filtrarItemsPorSeccion_` (la rama `REUNIONES`) falla con motivo. Son dos
      // comportamientos distintos para el mismo error, y es de antes del `_24`: se conserva tal
      // cual para no mover números, y queda anotado como hallazgo.
      var fc = parsearFiltro_(seccion.filtro);
      if (fc.ok && !fc.vacio) {
        var falla = primeraCondicionQueFalla_(fc.condiciones, function (campo) { return c[campo]; });
        if (falla) {
          excluidos.push({
            campana: id,
            motivo: 'SECCIONES.filtro: ' + falla.campo + ' = "' + normalizarValorDeclarado_(c[falla.campo]) + '"'
          });
          return;
        }
      }
      items2.push({
        clave: id,
        etiqueta: c.nombre || id,
        // Sin `ventana`: la campaña es el PRIMER eslabón de `D-20` y `resolverVentana` usa
        // su `desde`/`hasta`. Pasarle la del informe sería justo lo que el paso prohíbe.
        //
        // ⚠ **`periodo_id` viaja con el ítem**, y no es opcional: con la lista, `campana_id` solo
        // ya no identifica una fila. Sin esto `resolverVentana` no puede saber de qué semana es la
        // ventana y falla por ambigua — que es el comportamiento correcto, pero acá tenemos el
        // dato y hay que pasarlo.
        opciones: {
          campana: id,
          periodo_id: String(c.periodo_id || '').trim(),
          seccion_id: seccion.seccion_id,
          filtro_seccion: seccion.filtro
        },
        id_cuenta: '',
        motivo: '',
        orden: Number(c.orden || 0)
      });
    });
    // El orden viaja en el ítem: con la lista ya no hay `campanas[clave]` al que volver.
    items2.sort(function (a, b) { return a.orden - b.orden; });
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
function duplicarBloquesRepetibles_(presentacion, informeId, ventanaInforme, seccionesElegidas) {
  var asignaciones = [];
  var reporte = [];
  var reclamadas = {};

  // `_27` bloque 3 — qué secciones entran en ESTA corrida.
  //
  // **Ausente = todas; una lista = exactamente ésas, y la lista vacía significa ninguna.**
  // La distinción es entre `undefined` y `[]`, y es a propósito: con "lista vacía = todas",
  // destildar todo en el panel habría pedido lo contrario de lo que hacía, y ése es el tipo
  // de default silencioso que `D-19`/`D-21` prohíben. Un llamador que no conoce la opción
  // sigue sin pasarla y no cambia nada.
  //
  // Por qué existe: la corrida de `jm` del 11/08 gastó **316 s de un techo de 350**, y eso
  // con `campana` emitiendo cero ítems. Sus ocho slides modelo con ítems reales no entran, y
  // un corte por tiempo a mitad de una presentación no se puede deshacer. Elegir secciones es
  // lo que hace que la corrida entre en el techo.
  var elegidas = null;
  if (seccionesElegidas) {
    elegidas = {};
    seccionesElegidas.forEach(function (id) { elegidas[String(id).trim()] = true; });
  }

  seccionesRepetiblesDe_(informeId).forEach(function (seccion) {
    // `D-21` — una sección que queda afuera **se reporta**, nunca desaparece. Sus slides
    // modelo se quedan como están y sus tokens caen a la pasada de tokens fijos, que es
    // exactamente lo que ya pasa con una sección sin ítems: no es un camino nuevo.
    if (elegidas && !elegidas[seccion.seccion_id]) {
      reporte.push({
        seccion: seccion.seccion_id, ok: true, omitida: true, items: [], excluidos: [],
        motivo: 'fuera de esta corrida — no se la eligió. El bloque modelo queda como está y ' +
          'sus tokens caen a la pasada de tokens fijos',
        slides_modelo: slidesModeloDe_(presentacion, familiasDeSeccion_(seccion)).map(function (i) { return i + 1; })
      });
      return;
    }

    var t0Seccion = new Date().getTime();
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

    /* `_35` Parte B — **el bloque se duplica por ítem, no cada lámina por separado.**
     *
     * Antes era *por cada modelo, N copias*: dos láminas modelo daban `[A×N][B×N]`, o sea seis
     * carátulas seguidas y después seis detalles. Ahora es **por cada ítem, una copia del bloque
     * modelo completo**, en orden: `[A₁B₁][A₂B₂]…`
     *
     * **Con una sola lámina modelo la salida es idéntica a la de antes**, y ése es el control de
     * la parte: `encuentro` y `comunicaciones_post` tienen una cada una, así que hoy no cambia
     * nada. `campana` tiene ocho, pero emite cero ítems y no expande por ningún camino — el día
     * que tenga ítems **va a cambiar, y ése es el objetivo**: sus ocho modelos salían como
     * `[L12×N]…[L19×N]`, que no es lo que nadie quiso.
     *
     * **Todas las asignaciones de un mismo ítem comparten su contexto**, así que la carátula
     * resuelve contra la misma fila de `rdv` que su lámina de detalle. Es lo que hace que el
     * `EVENTO` de la carátula sea el del encuentro que le sigue y no el de otro.
     */
    var ordenados = modelos.slice().sort(function (a, b) { return a - b; });
    var inicio = ordenados[0];
    var largo = ordenados.length;

    // **El bloque tiene que ser contiguo.** Con láminas modelo salteadas no hay "bloque" que
    // repetir: habría que decidir si lo de en medio se repite o no, y eso no se adivina. Se
    // reporta y no se expande, igual que el choque de dos secciones sobre la misma lámina.
    var contiguo = ordenados.every(function (idx, k) { return idx === inicio + k; });
    if (!contiguo) {
      reporte.push({
        seccion: seccion.seccion_id, ok: false,
        motivo: '⚠ las láminas modelo ' + ordenados.map(function (i) { return i + 1; }).join(', ') +
          ' no son consecutivas — un bloque repetible tiene que ser contiguo. No se expande y la ' +
          'plantilla no se reordena.',
        items: resultado.items.map(function (i) { return i.clave; }),
        excluidos: resultado.excluidos,
        slides_modelo: ordenados.map(function (i) { return i + 1; })
      });
      return;
    }

    var slidesAhora = presentacion.getSlides();
    var modelosSlides = ordenados.map(function (i) { return slidesAhora[i]; });

    // Dos pasadas, y la separación es lo que la hace correcta: `duplicate()` inserta la copia
    // **pegada a su original**, así que mover mientras se duplica corre los índices de lo que
    // todavía falta copiar. Primero se duplica todo, después se quitan los modelos, y recién
    // entonces se ordenan las copias con posiciones que ya no se mueven.
    var copias = [];
    resultado.items.forEach(function (item) {
      modelosSlides.forEach(function (modelo) {
        var copia = modelo.duplicate();
        copias.push(copia);
        asignaciones.push({ objectIdSlide: copia.getObjectId(), item: item, seccion: seccion.seccion_id });
      });
    });

    modelosSlides.forEach(function (modelo) { modelo.remove(); });

    // Ascendente: cada copia queda en su lugar definitivo y las ya ubicadas no se corren.
    copias.forEach(function (copia, k) { copia.move(inicio + k); });

    reporte.push({
      seccion: seccion.seccion_id, ok: true,
      itera_sobre: seccion.itera_sobre,
      slides_modelo: modelos.map(function (i) { return i + 1; }),
      emitidos: resultado.items.map(function (i) { return i.clave + (i.motivo ? ' ⚠ ' + i.motivo : ''); }),
      excluidos: resultado.excluidos,
      // `_27` bloque 3 — lo que costó DUPLICAR esta sección. Es sólo una parte de lo que
      // cuesta: pintar sus ítems se mide aparte, en la etapa 3, y las dos se suman en
      // `tiempos_por_seccion`. Separadas y no sumadas acá porque se atacan distinto — una
      // sección cara por duplicación tiene muchas slides modelo; una cara por ítems tiene
      // muchos ítems.
      seg_expansion: Math.round((new Date().getTime() - t0Seccion) / 1000)
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

// ============================================================================
// T2.1.1 — el reloj de la corrida
// ============================================================================

/**
 * Los tres valores viven en `CONFIG` (`T2.1.1`, addendum del 06/08). Estas constantes son
 * **sólo el default si la hoja no los tiene cargados**: nunca se leen directo, siempre por
 * su helper. Mismo patrón que `umbralAnclajeReunion_()` (`Paso 2.9F`) — cambiar cualquiera
 * de los tres no exige `clasp push`.
 *
 * De dónde sale cada número, porque no son de la misma clase:
 *   - `350` **no es medido**: es el techo duro de Apps Script (360 s) menos lo que el
 *     llamador de menú gasta antes de entrar (~2 s) y un colchón. La plataforma cuenta desde
 *     `doPost` o desde el trigger, no desde acá.
 *   - `30` sale del cierre **medido** en 0,8 s (`escribirFaltantes_` 455 ms +
 *     `escribirCorrida_` 117 ms + dueño/nombre/url 259 ms) más la barrida (~6 s reusando el
 *     mapa de la etapa 2) más margen por varianza: `tokensPorSlide_` dio 10,8 s y 26,9 s el
 *     mismo día.
 *   - `240` sale del **banco de medición del 06/08, no de una corrida**:
 *     `resolverMarcadores('jm', {})` costó 238,9 s.
 */
var PRESUPUESTO_CORRIDA_SEG_DEFECTO_ = 350;
var RESERVA_CIERRE_SEG_DEFECTO_ = 30;
var COSTO_RESOLUCION_ETAPA4_SEG_DEFECTO_ = 240;

/** Motivo de `FALTANTES` que distingue el corte por tiempo de un token sin cablear. */
var MOTIVO_CORTE_TIEMPO_ = 'corte por tiempo: la corrida se quedó sin presupuesto antes de resolver este token';

/**
 * `T2.1.2` — el tercer motivo. Un token puede quedar crudo por tres razones distintas y las
 * tres se leen igual en el deck: nadie lo cableó, la corrida se quedó sin tiempo, o algo
 * explotó en el medio. Sin un motivo propio, la muerte por excepción se disfrazaba de corte
 * por tiempo y el diagnóstico apuntaba al presupuesto, que no tenía nada que ver.
 */
var MOTIVO_EXCEPCION_ = 'la corrida murió por una excepción antes de resolver este token';

function presupuestoCorridaSeg_() {
  var valor = Number(leerConfig().presupuesto_corrida_seg);
  return isNaN(valor) || valor <= 0 ? PRESUPUESTO_CORRIDA_SEG_DEFECTO_ : valor;
}

function reservaCierreSeg_() {
  var valor = Number(leerConfig().reserva_cierre_seg);
  return isNaN(valor) || valor <= 0 ? RESERVA_CIERRE_SEG_DEFECTO_ : valor;
}

function costoResolucionEtapa4Seg_() {
  var valor = Number(leerConfig().costo_resolucion_etapa4_seg);
  return isNaN(valor) || valor <= 0 ? COSTO_RESOLUCION_ETAPA4_SEG_DEFECTO_ : valor;
}

/**
 * El único lugar del flujo que hace cuentas de tiempo. Devuelve si entra un trabajo que se
 * estima en `costoSeg`, dejando la reserva del cierre intacta.
 *
 * `reloj` es `{ t0, presupuesto, reserva }`, armado una sola vez al entrar a
 * `generarInforme`. Ninguna otra parte arranca un cronómetro por su lado.
 */
function relojDeCorrida_() {
  return { t0: new Date().getTime(), presupuesto: presupuestoCorridaSeg_(), reserva: reservaCierreSeg_() };
}

function segundosGastados_(reloj) {
  return Math.round((new Date().getTime() - reloj.t0) / 1000);
}

function entraEnElPresupuesto_(reloj, costoSeg) {
  var gastado = (new Date().getTime() - reloj.t0) / 1000;
  var disponible = reloj.presupuesto - reloj.reserva - gastado;
  return { entra: disponible >= costoSeg, disponible: Math.round(disponible), gastado: Math.round(gastado) };
}

/**
 * `tokensPorSlide_` filtrado por lámina visible — **el filtro en el punto de llamada** (06/08).
 *
 * `tokensPorSlide_` vive en `Armonizar.gs` y **no se toca**: sus otros dos consumidores la
 * usan para inventariar (`filtrarRenombresPorLaminasCongeladas_` busca el testigo de una
 * lámina congelada, que puede estar escondida; `tokensSinCablear_` reporta el trabajo que
 * queda) y ésos **necesitan ver todo**. Sólo la corrida quiere el recorte, así que el recorte
 * es de la corrida.
 *
 * Un token sobrevive si aparece **en al menos una lámina visible**: el mismo token puede estar
 * en la 10 —escondida— y en la 5, y ahí sí hay que pintarlo.
 */
function tokensVisiblesDe_(presentacion) {
  var porSlide = tokensPorSlide_(presentacion);
  var escondidas = laminasEscondidas_(presentacion.getSlides());
  var visibles = {};
  var descartados = [];
  Object.keys(porSlide).forEach(function (token) {
    var enVisible = porSlide[token].some(function (n) { return escondidas[n] !== true; });
    if (enVisible) visibles[token] = porSlide[token];
    else descartados.push(token);
  });
  return { tokens: visibles, descartados: descartados.sort() };
}

/**
 * La barrida final: ningún `{{token}}` crudo sobrevive a una corrida, se haya cortado o no.
 *
 * Reusa el mapa de la etapa 2 —`mapaTokenObjectId_` devuelve los mismos tokens que
 * `tokensPorSlide_`, verificado el 06/08: 195 y 195— porque re-escanear el deck cuesta
 * 10-27 s y leer el mapa cuesta cero. Si el corte llegó antes de la etapa 2 no hay mapa, y
 * ahí sí se escanea; el retorno dice por cuál de los dos caminos fue.
 */
function barrerTokensNoAlcanzados_(presentacion, tokensDelMapa, comoRaya) {
  var origen = 'mapa de la etapa 2';
  var tokens = tokensDelMapa ? Object.keys(tokensDelMapa) : null;
  if (!tokens) {
    // `T2.1.2` — decía "el corte llegó antes de la etapa 2" y desde hoy hay una segunda vía
    // para llegar sin mapa: una excepción. El origen no tiene por qué adivinar cuál fue.
    origen = 'tokensVisiblesDe_ (no había mapa: la corrida no llegó a terminar la etapa 2)';
    tokens = Object.keys(tokensVisiblesDe_(presentacion).tokens);
  }

  var barridos = [];
  tokens.sort().forEach(function (token) {
    // `replaceAllText` no falla si el token ya no está: los que la corrida sí alcanzó
    // devuelven cero reemplazos y no cuestan una lectura previa.
    var n = presentacion.replaceAllText('{{' + token + '}}', textoFaltante_(token, comoRaya), true);
    if (n > 0) barridos.push(token);
  });
  return { barridos: barridos, origen: origen };
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
/**
 * `T2.2.2` (06/08) — el caché de hojas de registro se enciende **acá y sólo acá**.
 *
 * Una corrida lee `MAPEO` y `SOLAPAS` unas 600 veces y ninguna de las dos cambia mientras
 * corre: `buscarMapeo` era el **90 %** de cada llamada a `resolverMarcadores`. El caché vive
 * en una variable de módulo, así que **muere con la ejecución de Apps Script** — no es
 * `CacheService`, no sobrevive al pedido.
 *
 * El `finally` no es prolijidad: `generarInforme` tiene seis `return` tempranos y puede
 * lanzar. Sin él, un camino de error dejaría el caché encendido para lo que corra después en
 * la misma invocación —el ítem de menú, por ejemplo— sirviéndole config leída hace minutos.
 */
/**
 * `_27` bloque 1.2 — `opciones` es el tercer parámetro y es **opcional**. Hoy lleva una sola
 * clave, `faltantes_como_raya`, y por eso no reemplaza a `periodoId`: los dos llamadores que
 * ya existen —el ítem de menú y la API— siguen llamando con uno o dos argumentos y no cambia
 * nada para ellos. Un objeto de opciones que además absorbiera `periodoId` habría obligado a
 * tocar los dos caminos por una opción de presentación.
 */
function generarInforme(informeId, periodoId, opciones) {
  abrirCacheRegistros_();
  try {
    return generarInformeConCache_(informeId, periodoId, opciones);
  } finally {
    cerrarCacheRegistros_();
  }
}

function generarInformeConCache_(informeId, periodoId, opciones) {
  opciones = opciones || {};
  // `=== true` y no truthy: la opción entra desde un `<select>`, desde un JSON de la API y
  // desde una llamada a mano. Un `"false"` de un query string es truthy y encendería el modo
  // justo por el camino en que nadie lo está mirando.
  var faltantesComoRaya = opciones.faltantes_como_raya === true;
  // T2.1.1 — el reloj arranca acá y es el único de la corrida. Ojo: la plataforma cuenta
  // desde `doPost` o desde el trigger del menú, no desde esta línea; lo que gasta el
  // llamador antes de entrar ya está descontado en el default de `presupuesto_corrida_seg`.
  var reloj = relojDeCorrida_();
  var corte = null;

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

  // La fila se abre ACÁ, con el deck ya creado y antes de todo el trabajo pesado. Si la
  // corrida muere en el medio, queda una fila con `deck_id` y sin conteos — que es
  // exactamente el rastro que faltaba para poder diagnosticar.
  var filaCorrida = abrirCorrida_({
    corrida_id: corridaId,
    informe_id: informeId,
    periodo_id: periodoId || ventana.origen,
    deck_id: deckId,
    fecha_generacion: '',
    tokens_reemplazados: '',
    faltantes: '(corrida en curso — si esto queda así, murió antes de terminar)'
  });

  // `T2.7` — el instrumento arranca limpio: lo que falle de acá en más es de esta corrida.
  reiniciarInstrumento_();

  var t0Etapas = new Date().getTime();

  var reemplazados = 0;
  var conValor = [];
  var faltantes = [];

  /* `T2.1.2` — el cierre se escribe SIEMPRE.
   *
   * `T2.1.1` puso el corte por tiempo y el cierre corre bien por esa vía. Lo que quedaba
   * abierto es la otra: una excepción inesperada adentro de las etapas se llevaba puesta la
   * función entera y la fila de `CORRIDAS` quedaba diciendo "corrida en curso" para siempre
   * — exactamente el problema que `T2.1.1` vino a resolver, entrando por otra puerta.
   *
   * Por eso todo lo que el cierre necesita se declara **acá afuera**, con un valor vacío que
   * sirve igual: si la corrida muere en la etapa 1, `mapa` sigue siendo un mapa vacío y la
   * barrida final lo lee sin explotar. No alcanza con el hoisting de `var`: un `undefined`
   * volvería a tirar en el cierre, que es el único lugar que no se puede permitir tirar.
   */
  var expansion = { asignaciones: [], reporte: [] };
  var mapa = { tokens: {}, lista: [], escondidas: { laminas: [], tokens: [], cuantos: 0 } };
  var porItem = [];
  // `_27` bloque 3 — segundos de la etapa 3 acumulados por sección. Se declara acá afuera con
  // el resto de los defaults del cierre: si la corrida muere en la etapa 1, el reporte de
  // tiempos sale vacío en vez de tirar.
  var segPorSeccion = {};
  var resolucion = { resultados: [], resumen: null };
  var porMarcador = {};
  var sinCajaEnPlantilla = [];
  var etapaEnCurso = '';
  var fallo = null;

  try {
  etapaEnCurso = marcarEtapa_(filaCorrida, '1 · expandir secciones repetibles', t0Etapas);

  // 1 · Paso 5 — duplicar los bloques repetibles. **Sin reemplazar nada**: las copias
  //     tienen `objectId` propios y el mapa de `B.3` se toma después, una sola vez, sobre
  //     el deck ya expandido y todavía intacto.
  expansion = duplicarBloquesRepetibles_(presentacion, informeId, ventana, opciones.secciones);

  etapaEnCurso = marcarEtapa_(filaCorrida, '2 · mapa token→objectId', t0Etapas);
  // 2 · El mapa, ANTES de tocar un solo token.
  mapa = mapaTokenObjectId_(presentacion);

  // 3 · La pasada por ítem: cada slide emitida se pinta con **el contexto de su ítem** —
  //     el `id_cuenta` del encuentro, o la campaña con su propia ventana. Es lo que hace
  //     que `digital` deje de salir `«FALTA:…@digital_sin_cuenta»`.
  etapaEnCurso = marcarEtapa_(filaCorrida, '3 · pasada por ítem', t0Etapas);
  // T2.1.1 — el costo del ítem anterior **de esta misma corrida**. Arranca en 0 a propósito:
  // el primer ítem no tiene observación previa, así que entra si queda algo sobre la reserva.
  // No hay ninguna constante de segundos acá: el costo por ítem es un dato de la corrida.
  var costoUltimoItemSeg = 0;
  // `for` y no `forEach` porque el corte tiene que poder salir del loop sin excepción.
  for (var iAsignacion = 0; iAsignacion < expansion.asignaciones.length; iAsignacion++) {
    var asignacion = expansion.asignaciones[iAsignacion];

    // Checkpoint 1 · antes de cada ítem.
    var chequeoItem = entraEnElPresupuesto_(reloj, costoUltimoItemSeg);
    if (!chequeoItem.entra) {
      corte = {
        etapa: '3 · pasada por ítem',
        item: asignacion.item.clave,
        items_emitidos: porItem.length,
        items_sin_emitir: expansion.asignaciones.length - iAsignacion,
        segundos: chequeoItem.gastado,
        disponible_seg: chequeoItem.disponible,
        estimado_seg: costoUltimoItemSeg,
        motivo: 'el próximo ítem se estimó en ' + costoUltimoItemSeg + ' s (lo que costó el ' +
          'anterior) y quedaban ' + chequeoItem.disponible + ' s por encima de la reserva'
      };
      break;
    }
    var t0Item = new Date().getTime();

    var slide = null;
    presentacion.getSlides().forEach(function (s) {
      if (s.getObjectId() === asignacion.objectIdSlide) slide = s;
    });
    if (!slide) {
      porItem.push({ seccion: asignacion.seccion, item: asignacion.item.clave, ok: false, motivo: 'la slide emitida no se encontró por objectId' });
      continue;
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
      slide.replaceAllText('{{' + token + '}}', textoFaltante_(token, faltantesComoRaya), true);
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
    var segItem = Math.ceil((new Date().getTime() - t0Item) / 1000);
    porItem.push({
      seccion: asignacion.seccion,
      item: asignacion.item.clave,
      id_cuenta: asignacion.item.id_cuenta,
      ok: true,
      reemplazados: reemplazadosItem,
      resumen: resolucionItem.resumen,
      motivo: asignacion.item.motivo,
      // `_27` bloque 3 — el costo de este ítem, que ya se medía para el checkpoint y se
      // tiraba. Publicarlo es lo que permite decir **qué sección** se come el techo.
      seg: segItem
    });
    segPorSeccion[asignacion.seccion] = (segPorSeccion[asignacion.seccion] || 0) + segItem;

    costoUltimoItemSeg = segItem;
  }

  etapaEnCurso = marcarEtapa_(filaCorrida, '4 · tokens fijos', t0Etapas);
  // 4 · Los tokens fijos, sobre todo lo que quedó. Los de las slides emitidas ya no están:
  //     la pasada anterior los reemplazó por valor o por `«FALTA»`.
  //
  //     La ventana se le fija **sólo** cuando vino un `periodoId`: eso es lo que significa
  //     un override explícito. Sin él no se le pasa nada, para que cada marcador resuelva
  //     su propia cadena — un marcador con `periodo_ref` propio tiene que seguir usándolo
  //     (`B.5`: el encabezado dice el período del informe, pero un token con ventana propia
  //     se calcula con la suya).
  //
  // Checkpoint 2 (`T2.1.1`) · **la resolución de esta etapa es atómica**: `resolverMarcadores`
  // no acepta un subconjunto —verificado en la Parte 0—, así que la única decisión posible es
  // entrar o no entrar, contra `costo_resolucion_etapa4_seg`. El loop de pintado que viene
  // después **no lleva checkpoint**: cuesta ~6 s, menos que la reserva, y cortarlo por la
  // mitad dejaría tokens crudos sin ganar nada.
  if (corte) {
    // Ya se cortó en la etapa 3. Un corte es un corte: no se abre una etapa nueva.
  } else {
    var costoEtapa4 = costoResolucionEtapa4Seg_();
    var chequeoEtapa4 = entraEnElPresupuesto_(reloj, costoEtapa4);
    if (!chequeoEtapa4.entra) {
      corte = {
        etapa: '4 · tokens fijos',
        item: '',
        items_emitidos: porItem.length,
        items_sin_emitir: 0,
        segundos: chequeoEtapa4.gastado,
        disponible_seg: chequeoEtapa4.disponible,
        estimado_seg: costoEtapa4,
        motivo: 'la resolución de la etapa 4 es atómica y se estima en ' + costoEtapa4 +
          ' s; quedaban ' + chequeoEtapa4.disponible + ' s por encima de la reserva'
      };
    }
  }

  if (!corte) {
  var resolucionEtapa4 = resolverMarcadores(informeId, periodoId ? { ventana: ventana } : {});
  resolucion = resolucionEtapa4;
  resolucion.resultados.forEach(function (r) { porMarcador[r.marcador] = r; });

  // El filtro en el punto de llamada: `tokensPorSlide_` sigue viendo todo para quien la use
  // para inventariar; la corrida no pinta láminas que no se emiten.
  var tokensFijos = tokensVisiblesDe_(presentacion).tokens;
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
      // `R-18` punto 3 — un valor que el catálogo rechazó **no llega al deck**, pero tampoco
      // puede desaparecer: va a `FALTANTES` con su fila **aunque el token haya publicado bien
      // el resto**. Sin esto, una lista que publica cuatro de cinco se ve idéntica a una que
      // publica los cinco, y el barrio que falta no lo reclama nadie.
      if (resultado.rechazados && resultado.rechazados.length) {
        faltantes.push({
          corrida_id: corridaId,
          informe_id: informeId,
          token: token,
          base_id: resultado.base_id || '',
          solapa: resultado.solapa || '',
          campo_logico: '',
          motivo: 'fuera del catálogo, NO publicado(s): ' + resultado.rechazados.join(' | ') +
            ' — el token publicó los que sí matchean'
        });
      }
      return;
    }

    presentacion.replaceAllText('{{' + token + '}}', textoFaltante_(token, faltantesComoRaya), true);
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
  }

  // 5 · Marcadores cableados que la plantilla no tiene. No es un faltante del informe: es
  //     una fila de `MARCADORES` sin caja donde escribirse, y hay que verla.
  sinCajaEnPlantilla = Object.keys(porMarcador).filter(function (t) { return !(t in mapa.tokens); });

  } catch (e) {
    // `T2.1.2` — no se traga y no se relanza. Se guarda con la etapa en la que estaba y el
    // cierre de abajo corre igual, que es todo el punto: relanzar dejaría la fila abierta,
    // que es justo lo que esto viene a evitar. La excepción viaja entera en el resultado.
    fallo = {
      etapa: etapaEnCurso || '(antes de la primera etapa)',
      mensaje: String((e && e.message) ? e.message : e),
      stack: String((e && e.stack) ? e.stack : ''),
      segundos: segundosGastados_(reloj)
    };
  }

  // T2.1.1 · la barrida final. **Corre siempre, haya habido corte o no**: es lo único que
  // garantiza que el deck no salga con `{{token}}` crudos, y por eso vive adentro de la
  // reserva y no detrás de un checkpoint. En una corrida completa no encuentra nada.
  // `T2.1.2` · `mapa.lista.length` y no `mapa.tokens` a secas: el default de arriba es un
  // mapa **vacío pero truthy**, así que pasarlo tal cual haría que la barrida recorriera
  // cero tokens y el deck saliera con `{{token}}` crudos — justo lo contrario de lo que
  // esta barrida garantiza. Si la corrida murió antes de la etapa 2 no hay mapa y hay que
  // re-escanear, que es para lo que `barrerTokensNoAlcanzados_` acepta `null`.
  var barrida = barrerTokensNoAlcanzados_(presentacion, mapa.lista.length ? mapa.tokens : null, faltantesComoRaya);
  barrida.barridos.forEach(function (token) {
    faltantes.push({
      corrida_id: corridaId,
      informe_id: informeId,
      token: token,
      base_id: '',
      solapa: '',
      campo_logico: '',
      // Tres motivos distintos que en el deck se leen igual. Sin corte y sin fallo no
      // debería quedar ninguno: si aparece, no se lo disfraza de ninguna de las dos cosas.
      motivo: corte
        ? MOTIVO_CORTE_TIEMPO_ + ' (' + corte.etapa + ')'
        : (fallo
          ? MOTIVO_EXCEPCION_ + ' (etapa "' + fallo.etapa + '"): ' + fallo.mensaje
          : '⚠ quedó crudo en el deck sin que hubiera corte por tiempo — revisar')
    });
  });

  marcarEtapa_(filaCorrida, '5 · escribir faltantes', t0Etapas);
  // `T2.7` — se leen **después** de la última marca: cualquier fallo del instrumento ya
  // ocurrió, y esta lista es lo que impide que un rastro incompleto se lea como diagnóstico.
  var fallosDelReloj = fallosDelInstrumento_();
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
    // `T2.1.2` — la columna `faltantes` ya venía haciendo de campo de estado: ahí escribe
    // `marcarEtapa_` la etapa en curso y ahí deja `abrirCorrida_` el "corrida en curso".
    // Una muerte por excepción sigue el mismo camino, con el conteo adelante para no
    // perderlo. Sin esto la fila cerraba con un número prolijo y no decía que murió.
    // `T2.7` — las dos advertencias se **acumulan**, no compiten. El primer intento las puso
    // en un ternario y el control lo cazó: con excepción **y** instrumento roto, la celda
    // sólo contaba la excepción. Justamente el caso en que más importa saber que el rastro
    // de etapas no es confiable.
    faltantes: avisosDeLaFila_(faltantes.length, fallo, fallosDelReloj)
  }, mapa.tokens, filaCorrida);

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
    // `_27` 1.2 — con qué modo salió ESTE deck. Sin esto, un deck en modo raya y uno con
    // todos los datos se leen igual una semana después, que es justo cuando alguien lo va a
    // mirar sin acordarse de cómo lo generó.
    presentacion_faltantes: faltantesComoRaya ? 'raya' : '«FALTA:token»',
    tokens: {
      en_plantilla: mapa.lista.length,
      reemplazados: reemplazados,
      faltantes: faltantes.length,
      con_valor: conValor.sort(),
      cableados_sin_caja_en_plantilla: sinCajaEnPlantilla.sort(),
      // `A.3` / `D-21` — nada se excluye en silencio. Una exclusión que no se reporta es
      // indistinguible de un token que se perdió, y el denominador cambia de 195 a 172 sin
      // esto. La lámina escondida se vuelve a mostrar en un clic: los tokens siguen ahí.
      excluidos_por_lamina_escondida: {
        laminas: mapa.escondidas.laminas,
        cuantos: mapa.escondidas.cuantos,
        tokens: mapa.escondidas.tokens
      }
    },
    marcadores: resolucion.resumen,
    // Paso 5 — qué se expandió, qué se emitió y **qué quedó excluido con su motivo**. Lo
    // excluido va en el reporte final a propósito: una campaña que el usuario tildó y no
    // salió por `D-19` no puede desaparecer en silencio.
    repetibles: { secciones: expansion.reporte, items: porItem },
    // `_27` bloque 3 — cuánto costó cada sección, para poder decidir cuáles entran en la
    // próxima corrida con un número y no con una corazonada.
    //
    // **Las dos etapas van separadas y el total es la suma de las dos**, no del gasto de la
    // corrida: el resto —copiar la plantilla, el mapa, la etapa 4, el cierre— no es de ninguna
    // sección, y repartirlo entre ellas inventaría un número. Por eso la suma de esta tabla es
    // MENOR que `presupuesto.gastado_seg`, y tiene que serlo.
    tiempos_por_seccion: expansion.reporte.map(function (s) {
      var items = segPorSeccion[s.seccion] || 0;
      var exp = s.seg_expansion || 0;
      return {
        seccion: s.seccion,
        omitida: s.omitida === true,
        seg_expansion: exp,
        seg_items: items,
        seg_total: exp + items,
        items: porItem.filter(function (i) { return i.seccion === s.seccion; }).length
      };
    }),
    faltantes_escritos: faltantesEscritos,
    mapa_tokens: { cabe_en_la_celda: celdaMapa.entra, caracteres: celdaMapa.caracteres },
    // `T2.1.1` · `null` si la corrida hizo todo el trabajo. **Una corrida cortada no es una
    // corrida fallida**: produjo un deck y una lista, así que sigue siendo `ok: true` —
    // `ok: false` queda para los casos que ya lo devolvían, que son precondiciones que ni
    // llegan a copiar la plantilla.
    corte: corte,
    // `T2.1.2` · `null` si nada explotó. **Sigue siendo `ok: true`** por el mismo motivo que
    // el corte: hubo deck, hubo fila cerrada y hubo lista de faltantes. `ok: false` queda
    // para las precondiciones que ni llegan a copiar la plantilla, y meter acá una muerte
    // por excepción haría que el menú mostrara sólo el mensaje de error y escondiera el
    // deck parcial, que es la evidencia.
    fallo: fallo,
    // `T2.7` — el instrumento se reporta a sí mismo. Lista vacía es la respuesta normal, y es
    // la que habilita a leer el rastro de etapas como evidencia.
    instrumento: { fallos: fallosDelReloj },
    presupuesto: {
      techo_seg: reloj.presupuesto,
      reserva_seg: reloj.reserva,
      gastado_seg: segundosGastados_(reloj),
      barrida: { tokens: barrida.barridos.length, origen: barrida.origen }
    }
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

  // `_27` bloque 1.3 — el link ARRIBA DE TODO. Es lo que se viene a buscar, y estaba cuarto,
  // detrás de dos identificadores y del nombre del archivo.
  //
  // Y los conteos con su unidad dicha. El renglón anterior era
  // `83 con valor de 159 · 207 en FALTA`, y `207 > 159` se lee como un bug del motor. No lo
  // es: son **dos unidades distintas** metidas en la misma frase — `159` son tokens distintos
  // del deck expandido, `207` son filas de `FALTANTES`, que se escriben una por token **y por
  // ítem** (`CLAUDE.md` §4: «FALTANTES lista por ítem, no por token»). Medido en la corrida
  // del 11/08, que es de donde salen esos tres números.
  //
  // No se suma nada: `reemplazados + faltantes` parece el total de impresiones y no lo es,
  // porque `R-18` punto 3 escribe una fila para un token que **sí publicó**.
  var lineas = [
    r.deck.url,
    '',
    'Deck: ' + r.deck.nombre,
    'Informe: ' + r.informe_id + ' · corrida ' + r.corrida_id,
    'Período: ' + r.periodo.lamina + ' (' + r.periodo.origen + (r.periodo.calculado ? ', calculado' : '') + ')',
    'Dueño del archivo: ' + r.deck.dueno,
    '',
    'Tokens distintos en el deck: ' + r.tokens.en_plantilla,
    'Impresiones con valor (token × lámina): ' + r.tokens.reemplazados,
    'Filas en FALTANTES (una por token y por ítem): ' + r.tokens.faltantes,
    'Los huecos se imprimieron como: ' + r.presentacion_faltantes
  ];
  // El desglose de la pasada de tokens fijos, que el alert nunca mostraba: `4 en error` es lo
  // que manda a mirar el deck, y estaba sólo en el JSON del retorno.
  if (r.marcadores) {
    lineas.push('Marcadores: ' + r.marcadores.ok + ' resueltos · ' + r.marcadores.sin_datos +
      ' sin dato · ' + r.marcadores.revisar + ' a revisar · ' + r.marcadores.error + ' en error');
  }
  // `A.3` — lo excluido se dice, no se descuenta en silencio.
  //
  // 07/08 — y **dice contra qué numeración**. Los números salen de `mapaTokenObjectId_`, que
  // recorre el **deck ya expandido**: la lámina 10 de la plantilla de `jm` aparece acá como
  // la 14, porque la sección de encuentro ya duplicó sus copias antes. Sin esta aclaración el
  // aviso manda a buscar una lámina que en la plantilla es otra cosa, y eso ya pasó.
  if (r.tokens.excluidos_por_lamina_escondida.cuantos) {
    lineas.push('  (' + r.tokens.excluidos_por_lamina_escondida.cuantos +
      ' token(s) fuera del conteo: lámina(s) ' +
      r.tokens.excluidos_por_lamina_escondida.laminas.join(', ') +
      ' escondida(s) — no se emiten. Numeradas sobre el DECK EXPANDIDO, no sobre la plantilla)');
  }
  /* `D-31` conectado (16/08) — los desalineamientos de encabezado que esta corrida encontró.
   *
   * **Va acá porque un reporte que no se lee es una función que no existe.** El comparador vive
   * en `encabezadoEnColumna_`, pero si el aviso se quedara en una variable de módulo moriría con
   * la ejecución sin que nadie lo viera.
   *
   * **No bloquea nada** —regla 3 de `D-31`— y por eso va DESPUÉS de los números del deck: el
   * deck salió, y esto es una advertencia sobre de dónde salieron algunos valores.
   *
   * ⚠ Sólo cubre **las columnas que esta corrida efectivamente leyó**. Para el barrido completo
   * de `MAPEO`, sin generar informe, está `verificarEncabezadosDeMapeo()`. */
  var avisosEnc = (typeof avisosDeEncabezado_ === 'function') ? avisosDeEncabezado_() : [];
  if (avisosEnc.length) {
    lineas.push('');
    lineas.push('⚠ D-31 — ' + avisosEnc.length + ' columna(s) con el encabezado desalineado. **El ' +
      'valor se leyó igual, por la letra**: el testigo nunca corrige. Puede ser una columna ' +
      'insertada que corrió las letras, o un encabezado corrido en origen (C-09), que no es lo mismo:');
    avisosEnc.forEach(function (a) { lineas.push('   ' + a); });
  }
  // `T2.7` — antes que nada: si el instrumento falló, **nada de lo que sigue se puede leer
  // como diagnóstico**. Va arriba porque cambia cómo se lee el resto, no porque sea grave.
  if (r.instrumento && r.instrumento.fallos.length) {
    lineas.push('');
    lineas.push('⚠ EL INSTRUMENTO FALLÓ ' + r.instrumento.fallos.length + ' vez/veces — el rastro ' +
      'de etapas de la fila de CORRIDAS está incompleto y no sirve para diagnosticar:');
    r.instrumento.fallos.forEach(function (f) { lineas.push('   ' + f.etapa + ' → ' + f.mensaje); });
  }
  // `T2.1.2` — si murió, va primero que el corte: son dos cosas distintas y confundirlas
  // manda el diagnóstico al presupuesto, que no tuvo nada que ver.
  if (r.fallo) {
    lineas.push('');
    lineas.push('⚠ LA CORRIDA MURIÓ POR UNA EXCEPCIÓN en la etapa ' + r.fallo.etapa +
      ' a los ' + r.fallo.segundos + ' s. NO es corte por tiempo.');
    lineas.push('   ' + r.fallo.mensaje);
    lineas.push('   El cierre se escribió igual: la fila de CORRIDAS está cerrada y los ' +
      r.presupuesto.barrida.tokens + ' token(s) crudos quedaron en FALTANTES con este motivo.');
  }
  // `T2.1.1` — si cortó, se dice primero: el deck es válido pero está incompleto, y quien
  // lo mira tiene que saberlo antes que ningún conteo.
  if (r.corte) {
    lineas.push('');
    lineas.push('⚠ CORTE POR TIEMPO en la etapa ' + r.corte.etapa +
      ' a los ' + r.corte.segundos + ' s (techo ' + r.presupuesto.techo_seg +
      ' s, reserva ' + r.presupuesto.reserva_seg + ' s).');
    lineas.push('   ' + r.corte.motivo);
    if (r.corte.items_sin_emitir) lineas.push('   Ítems sin emitir: ' + r.corte.items_sin_emitir);
    lineas.push('   El deck no tiene tokens crudos: ' + r.presupuesto.barrida.tokens +
      ' quedaron como «FALTA:…» y están en FALTANTES con el motivo del corte.');
  }
  r.repetibles.secciones.forEach(function (s) {
    lineas.push('  ' + (s.ok ? '·' : '⚠') + ' ' + s.seccion + ': ' + (s.motivo || ((s.emitidos || []).length + ' emitido(s)')));
    // 07/08 — `e.campana` a secas daba `excluida undefined`. Los excluidos vienen de dos
    // lados con forma distinta: los de `CAMPANAS` traen `campana` y los que filtra
    // `filtroDeSeccion_` sobre los crudos traen `item`. Una exclusión que no dice **qué**
    // excluyó es indistinguible de un ítem perdido, que es lo que `D-21` pide evitar.
    (s.excluidos || []).forEach(function (e) {
      lineas.push('      excluida ' + (e.campana || e.item || '(el ítem no trae nombre)') + ' — ' + e.motivo);
    });
  });
  ui.alert('Generar informe completo', lineas.join('\n'), ui.ButtonSet.OK);
  return r;
}
