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

  // Sufijo `_revisar` (2026-08-19_1 Parte C) — desconfianza declarada por una PERSONA sobre
  // un número que se publica igual, entre guiones (`-8,89-`). No es un estado nuevo: los
  // cuatro estados ya están cerrados y `REVISAR` significa otra cosa (valor vacío con
  // rechazos, R-18 addendum 1) — reusar ese nombre acá rompería esa afirmación. Se resuelve
  // el formato base (`numero_revisar` → `numero`, etc.) y se envuelve el resultado en
  // guiones; el valor crudo no cambia, así que sigue siendo el que se audita. Quitar la
  // marca el día que se confirme es editar una celda de MARCADORES, sin clasp push (D-01).
  // El motor no pone ni saca este sufijo solo: sólo lo pinta cuando ya está declarado.
  if (f.length > 8 && f.slice(-8) === '_revisar') {
    return '-' + formatearValorMarcador_(valor, f.slice(0, -8)) + '-';
  }

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

  /* ⭐ `2026-08-22_25` Parte A — **el agregado sobre las filas del TEMARIO**, que es lo que `R-21`
   * nivel 1 y el `Addendum 1` de `R-17` mandan desde el 09/08: *"el agregado `ecv_*` suma los
   * encuentros que `R-21` seleccionó, no los que caen en la ventana"*.
   *
   * ⛔ **Lo que reemplaza, y por qué era un proxy y no el temario.** Los 17 marcadores de este par
   * declaran `dimensiones = ambito=jm`, que `DIMENSIONES_` traduce a `figura=Jorge Macri`, y caían
   * a `leerFuente` — o sea **la base entera recortada por figura y por ventana**. Medido el 22/08
   * sobre `agosto_14_20`: `1 de 3 filas`, `ecv_encuentros = 1`, con un temario de **2** ítems. Y
   * peor: el ítem del 12/08 **no puede** entrar por ventana aunque la figura estuviera bien.
   *
   * ⚠ **Va DEBAJO de la rama singular y eso es el invariante que no se puede romper.**
   * `ecv_barrio`, `ecv_poblacion` y `enc_evento` se emiten **también** dentro del bloque de
   * encuentro, donde llegan con `fila_rdv` (una sola) y tienen que seguir dando lo de ese
   * encuentro. **El mismo marcador se comporta distinto según dónde salga**, y el orden de estos
   * dos `if` es lo único que lo sostiene.
   *
   * ⚠ **Y acá `dimensiones` NO se aplica, a propósito:** las filas ya vienen elegidas por el
   * temario, y volver a recortarlas por `figura=Jorge Macri` sería filtrar dos veces por lo mismo
   * — con la diferencia de que la segunda vez sacaría encuentros que el temario **sí** eligió.
   * Es la misma decisión que la rama singular tomó el 11/08.
   *
   * ⭐ **Las filas vienen SIN DUPLICAR, y eso se hace en el productor**, no acá: `julio_24_30`
   * tiene San Cristóbal y Retiro **dos veces cada uno** —`pre` y `post`— y las dos filas del
   * temario apuntan al mismo encuentro de `rdv`. Sumar sin deduplicar publicaría San Cristóbal dos
   * veces, con un total grande y plausible. Ver `filasRdvDelTemario_`. */
  if (fila.base_id === 'rdv' && opciones && opciones.filas_rdv && opciones.filas_rdv.length &&
      opciones.hoja_rdv === solapa) {
    return {
      ok: true,
      filas: opciones.filas_rdv,
      encabezado: encabezadoEnColumna_(fila.base_id, solapa, campo.columna),
      columna: campo.columna,
      origen: 'las ' + opciones.filas_rdv.length + ' fila(s) de rdv/' + solapa + ' de los ' +
        'encuentros del TEMARIO (R-21 nivel 1 · R-17 Addendum 1) — sin recorte por ventana ni por ' +
        '`dimensiones`: el temario ya seleccionó' +
        (opciones.temario_sin_fila
          ? ' · ⚠ ' + opciones.temario_sin_fila + ' ítem(s) del temario NO tienen fila en rdv y NO entran'
          : '')
    };
  }

  /* ⭐⭐ `2026-08-24` — **las filas del TEMARIO en una solapa que NO es `rdv`**, que es lo que
   * `L-036` necesita: su tabla es *una fila por reunión del temario que tuvo comunicación post*.
   *
   * Es la hermana de la rama de arriba con la misma doctrina —**el temario ya seleccionó, no se
   * recorta por ventana ni por `dimensiones`**— y una diferencia: las filas se encontraron por
   * `id_cuenta` del anclaje contra el `campo_id_cuenta` de la solapa (`D-30`), no por
   * `(nombre, fecha)`.
   *
   * ⚠ **La guarda de solapa NO es paranoia, y vale lo mismo que en la rama de `rdv`:** `campo` se
   * resolvió con `buscarMapeo(base, solapa)` y su letra vale para ESA solapa. Si el marcador
   * apunta a otra, la letra no aplica y el valor saldría de la columna equivocada **sin fallar**.
   *
   * ⚠ **Va ANTES de la rama declarativa por `campo_id_cuenta`** —la del aviso *«se emite SIN ítem:
   * se lee como AGREGADO GLOBAL»*—, y ése es el invariante: sin esto, un `post_*` emitido fuera de
   * un ítem caería al agregado de las 102 filas de la solapa y publicaría **un número grande y
   * plausible de todos los encuentros de la historia**. */
  if (opciones && opciones.filas_temario && opciones.base_temario === fila.base_id &&
      opciones.hoja_temario === solapa) {
    var t = opciones.filas_temario;
    return {
      ok: true,
      filas: t.filas,
      encabezado: encabezadoEnColumna_(fila.base_id, solapa, campo.columna),
      columna: campo.columna,
      origen: 'las ' + t.filas.length + ' fila(s) de ' + fila.base_id + '/' + solapa + ' de los ' +
        'encuentros del TEMARIO (sección `' + t.seccion_id + '`, resuelta por `seccion_id` ' +
        'explícito) — por `id_cuenta` del anclaje, sin recorte por ventana ni por `dimensiones`: ' +
        'el temario ya seleccionó' +
        (t.sin_cuenta ? ' · ⚠ ' + t.sin_cuenta + ' ítem(s) SIN CUENTA ANCLADA — no es lo mismo que no existir' : '') +
        (t.sin_fila ? ' · ⚠ ' + t.sin_fila + ' ítem(s) con cuenta pero SIN FILA en esta solapa (encuentro sin comunicación post: caso normal)' : '') +
        (t.con_varias ? ' · ⛔ ' + t.con_varias + ' cuenta(s) con MÁS DE UNA fila — esta solapa está medida con una por encuentro; se tomó la primera y eso es elegir por orden de hoja' : '')
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

    /* ⭐ `2026-08-21_15` — **la rama de `digital` CEDE cuando la solapa declara
     * `campo_id_cuenta`.** No resuelve: deja seguir, y la atiende la rama por cuenta declarativa
     * de `D-30`, más abajo.
     *
     * **El bug que arregla, medido en la corrida `194602`:** los 24 `u1_` salieron `---` con
     * `«FALTA:…@solapa_digital_desconocida»`. `CAMPAÑAS_DESGLOCE_DIGITAL` declara
     * `campo_id_cuenta = des_id_cuenta` en `SOLAPAS`, **pero nunca llegaba a la rama que lo lee**:
     * esta rama la atrapaba antes. El comentario de la rama declarativa lo decía con todas las
     * letras —*"las solapas de `digital` nunca llegan hasta acá"*— y era una descripción del
     * problema, no una decisión.
     *
     * ⚠ **Se descartó agregarla a `SOLAPAS_CANAL_DIGITAL_`**, que era el atajo: eso la metería en
     * la **unión** del Paso 2.4, que responde otra pregunta —unir canales **por cuenta**— y esta
     * solapa tiene grano **campaña × plataforma**. Además tiene 135 filas duplicadas medidas: la
     * unión las cruzaría todas.
     *
     * ⛔ **El fallo NO se afloja: se conserva para las solapas que no declaran nada.** Es el que
     * avisa de una solapa de `digital` que nadie configuró, y perderlo cambiaría un error ruidoso
     * por un silencio. **Ceder y fallar son dos caminos distintos y los dos siguen existiendo.**
     *
     * **Alcance medido antes de escribir esto (Parte A):** exactamente **una** solapa de `digital`
     * declara `campo_id_cuenta`, y **ninguna** de las cinco de canal ni la maestra lo declaran —
     * así que este `if` **no le cambia el camino a ningún marcador que hoy publique**. */
    if (!canal && campoIdCuentaDeSolapa_(fila.base_id, solapa)) {
      // Cede. La rama declarativa de `D-30` la atiende y su `origen` dirá por dónde salió.
    } else if (!canal) {
      return {
        ok: false,
        motivo: '«FALTA:' + fila.marcador + '@solapa_digital_desconocida» — "' + solapa + '" no es una de las ' +
          'solapas de canal que une el Paso 2.4 (' + SOLAPAS_CANAL_DIGITAL_.map(function (c) { return c.solapa; }).join(', ') + ')' +
          ' y tampoco declara `SOLAPAS.campo_id_cuenta`, que es la otra vía (D-30)'
      };
    } else {

      var filasCanal = registro[canal.prefijo + '_filas'] || [];
      return {
        ok: true,
        filas: filasCanal,
        encabezado: encabezadoEnColumna_(fila.base_id, solapa, campo.columna),
        columna: campo.columna,
        origen: 'union digital por cuenta (' + solapa + ', ' + filasCanal.length + ' fila(s) de la cuenta ' + idCuenta + ')'
      };
    }
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

  /* ⭐ `2026-08-21_14` — **`solo_marcadores`: resolver los de UNA lámina en vez de los del informe.**
   *
   * **El problema, medido el 21/08:** la pasada por ítem llama acá **una vez por asignación** y
   * después usa sólo los tokens que esa lámina tiene. Con 111 marcadores y ~15 tokens por lámina,
   * **el 87 % del trabajo se tira**. La etapa 3 se llevaba el **62-88 %** del techo
   * (`docs/AUDITORIA_tiempos_2026-08-21.md`).
   *
   * ⭐ **Y el ahorro es real porque el costo es TODO por marcador, medido y no supuesto:**
   * `resolverMarcadores('secco')` —que tiene **cero** marcadores cableados— tarda **0,000 s**
   * tibio, y `jm` con 111 tarda **19,9 s**. **Costo fijo por llamada: cero. Por marcador: 0,18 s.**
   * Una asignación con 15 marcadores pasa de 19,9 s a **2,7 s**.
   *
   * ⚠ **`resumen` pasa a contar los marcadores de la lámina y no los del informe, y eso CAMBIA el
   * reporte** — para bien: hasta hoy cada ítem publicaba el **mismo** resumen de 111, repetido, que
   * no decía nada del ítem. Ahora dice cuántos de **su** lámina salieron `ok`. Se declara porque un
   * número del reporte que cambia sin aviso se lee como una regresión.
   *
   * ⛔ **Ausente = todos, como siempre.** La etapa 4 y todos los otros llamadores —la API, el
   * previsor, los diagnósticos— no la pasan y **no cambian de comportamiento**. */
  if (opciones.solo_marcadores && opciones.solo_marcadores.length) {
    var quiere = {};
    opciones.solo_marcadores.forEach(function (t) { quiere[String(t).trim()] = true; });
    delInforme = delInforme.filter(function (m) { return quiere[String(m.marcador).trim()] === true; });
  }

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
    /* 5 bis · El catálogo. Se resuelve **acá y no adentro de la operación**: leer una hoja es
     *         acceso a datos, y `Marcadores.gs` sólo hace la cuenta. La operación recibe la lista
     *         ya traída.
     *
     * ⛔⛔ **`2026-08-22` — ACÁ FALTABA `ELEMENTO`, y es el modo de falla que `CLAUDE.md` §4 nombra
     * con todas las letras.** La condición decía `=== 'LISTA'` a secas. La novena operación
     * comparte `conjuntoDeLista_` con `LISTA` y **exige el catálogo igual**, así que sin esta
     * línea **los tres `ecv_barrio*` habrían tirado en la primera corrida**, con el mensaje
     * *"necesita un catálogo"* apuntando a un `MARCADORES.catalogo` **que estaba perfectamente
     * declarado**. El diagnóstico habría mandado a mirar la hoja, que era el único lugar donde no
     * estaba el problema.
     *
     * ⭐ **Lo que lo hace citable: `tools/probar-elemento.js` pasó con 20 afirmaciones y NO lo
     * vio.** El control prueba la operación **en aislamiento** y el hueco estaba **en el
     * despachador**. Es exactamente la pregunta de §4 —*¿qué afirmación existente falla si esta
     * rama nueva no funciona?*— con la respuesta *ninguna*, demostrada.
     *
     * ⚠ **Y por eso la condición pasa a preguntar por una PROPIEDAD y no por un nombre:** la
     * décima operación que use catálogo se va a olvidar de tocar esta línea, igual que se olvidó
     * la novena. */
    if (operacionNecesitaCatalogo_(fila.operacion)) {
      var cat = resolverCatalogoDeMarcador_(fila);
      if (!cat.ok) {
        base.estado = 'error';
        base.traza = cat.motivo + ' · solapa "' + solapa.solapa + '" · ' + trazaVentana;
        return base;
      }
      ctx.catalogo = cat.catalogo;
      ctx.separador = fila.separador;
    }
    /* ⭐ `X-35` (23/08/2026) — **el orden de `FILA`, resuelto acá y no adentro de la operación.**
     *
     * Mismo reparto que `ctx.fechas`: **resolver qué columna es un campo lógico es acceso a datos**
     * y vive en este módulo; `opFILA` sólo ordena y elige (la regla de oro de `CLAUDE.md` §2).
     *
     * `MARCADORES.separador` trae el **campo lógico** por el que ordenar —`mail_fecha`, por
     * ejemplo—, así que el orden va **en configuración y no en el código**: la próxima tabla ordena
     * por otra cosa y no hay que tocar `Marcadores.gs`.
     *
     * ⛔ **Si no resuelve, NO se pasa nada y `opFILA` falla con motivo propio.** No cae a la
     * posición de la hoja: eso es lo que el `_39` sacó de `ULTIMO` el 12/08, y `FILA` no lo
     * reinstala. */
    if (String(fila.operacion || '').trim() === 'FILA') {
      ctx.separador = fila.separador;
      var campoOrden = String(fila.separador || '').trim();
      if (campoOrden) {
        var mapOrden = buscarMapeo(fila.base_id, solapa.solapa, campoOrden);
        if (mapOrden.ok) {
          var claveOrden = claveDeFila_(datos.filas, campoOrden,
            encabezadoEnColumna_(fila.base_id, solapa.solapa, mapOrden.columna));
          ctx.ordenPor = {
            campo: campoOrden,
            valores: datos.filas.map(function (o) {
              var crudoOrden = claveOrden && (claveOrden in o) ? o[claveOrden] : '';
              // Una fecha se compara como fecha; lo demás va tal cual. `opFILA` normaliza `Date`
              // a milisegundos y deja el resto al comparador natural.
              return parsearFechaCelda_(crudoOrden) || crudoOrden;
            })
          };
        }
      }
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
 * para mostrarlo hay un modo que rinde el hueco con un símbolo.
 *
 * `2026-08-20_1` Parte A — **el símbolo sale del estado, no de un booleano.** Hasta hoy los
 * tres casos salían `—` y el deck no distinguía **quién arregla qué**: un token que nadie
 * cableó es trabajo de cableado, y uno que se cableó y falló es trabajo de fuente o de filtro.
 * Con un solo glifo había que abrir `FALTANTES` para saber cuál de los dos oficios hacía falta.
 *
 * **Los cuatro símbolos, y la decisión del usuario del 20/08/2026 que los funda:**
 *
 *   - `/////` — **falta el token**: no hay fila en `MARCADORES`, o el motor no llegó a
 *     resolverlo. Es trabajo de cableado.
 *   - `---` — **falló**: hay fila, se intentó leer y no salió. `error` y `REVISAR`.
 *   - `-` — **no hay dato**: se preguntó bien y la respuesta fue vacía. Sólo `sin_datos`.
 *   - `-1.234-` — **dudoso**: publicado con desconfianza declarada. No es de acá: lo pone el
 *     sufijo `_revisar` de `MARCADORES.formato` en `formatearValorMarcador_`, y por eso un
 *     valor dudoso **no pasa nunca por esta función**.
 *
 * ⚠ **Por qué `REVISAR` va a `---` y no a `-`.** `R-18` addendum 1: **`sin_datos` afirma que
 * no había nada.** `REVISAR` es lo contrario — había filas y ninguna se pudo publicar.
 * Escribirlo como `-` publicaría esa afirmación falsa, que es el modo de falla que este
 * proyecto persigue. Los dos estados se parecen en que el valor vino vacío y **no se parecen
 * en nada más**.
 *
 * ⚠ **Ante ausencia de información, el símbolo es el más ruidoso, y es una regla, no un
 * default accidental.** Quien llama sin resultado —la barrida final, que sólo tiene el nombre
 * del token— obtiene `/////`. **Nunca `-`**: `-` es una afirmación *sobre el dato*, y quien no
 * tiene el resultado no está en condiciones de hacerla. Lo mismo vale para un estado que esta
 * función no conozca: un quinto estado sin símbolo asignado sale `/////` y no se lo adivina.
 *
 * **El mapeo vive acá y en ningún llamador** (Parte A regla 1). Los tres puntos de escritura
 * pasan lo que tienen —el token y el resultado del marcador, que puede no existir— y esta
 * función devuelve el texto. Repartir el mapeo entre los llamadores daría tres convenciones
 * en cuanto alguien toque una.
 *
 * **La contraparte es lo que hace que esto no sea esconder el problema, y es estructural, no
 * una promesa:** esta función sólo decide el TEXTO que va a la caja. Los tres puntos que la
 * llaman empujan su fila a `faltantes` en la línea de al lado, con token y motivo, y de ahí
 * salen `FALTANTES` y los conteos del reporte. **No hay forma de cambiar el glifo y perder el
 * registro**: son dos caminos distintos y ninguna opción toca el segundo. Si algún día se
 * pudieran tocar juntos, el modo no se usa (`_27` 1.2).
 *
 * **El modo crudo se conserva entero**, y es la flexibilidad que sostiene a `S-05` punto 3:
 * con `conSimbolos` en falso los cuatro casos salen `«FALTA:token»` **con el nombre adentro**,
 * igual que hoy. Nada de mezclar: o los cuatro símbolos, o el crudo.
 *
 * El símbolo no vive en `CONFIG` a propósito: no es un parámetro de negocio que alguien vaya a
 * querer cambiar sin tocar código —el criterio de `D-01`— sino cómo se rinde un hueco, y el
 * modo se elige por corrida, no por instalación.
 *
 * `resultado` es el objeto que devuelve `resolverMarcadores` para ese token, o `undefined` /
 * `null` cuando no hay fila en `MARCADORES` o cuando el llamador no lo tiene.
 */
/* ═══════════ `2026-08-21_5` — quién decide el modo, y por qué había que sacarlo del llamador ═══
 *
 * ⭐ **Hasta hoy el default real era el crudo, y no lo había elegido nadie.** El modo salía de
 * `opciones.faltantes_como_raya === true`, y `undefined === true` es `false`: o sea que **un
 * llamador que no pasaba la opción obtenía el crudo**, no por decisión sino por omisión. Medido el
 * 21/08: de los cuatro llamadores de `generarInforme`, **dos no la pasan** —el ítem de menú y la
 * ejecución 1 de la corrida desatendida—.
 *
 * ⚠ **El caso peor es la desatendida**, porque las dos mitades no coinciden: la ejecución 1 escribía
 * en crudo y las continuaciones en símbolos, **sobre el mismo deck**. El deck salía con dos
 * vocabularios y nada lo avisaba.
 *
 * ⚠ **Y el `=== true` NO era un descuido: era una guarda deliberada** —la opción entra desde un
 * `<select>`, desde un JSON de la API y desde una llamada a mano, y un `"false"` de query string
 * **es truthy**—. Lo que faltaba no era aflojarla, sino **distinguir «no vino» de «vino en false»**,
 * que con `=== true` se ven idénticos. Eso es exactamente lo que hace `modoFaltantesDe_`: el
 * ausente cae al default de `CONFIG`, y el presente se interpreta **explícitamente**, con la guarda
 * del string intacta y ahora también en el otro sentido (`"true"` como texto ya no significa crudo).
 */

/** Sólo si `CONFIG` no dice nada. Los símbolos son el default desde el `2026-08-20_1`. */
var MODO_FALTANTES_DEFECTO_ = 'simbolos';

function modoFaltantesDefecto_() {
  var v = normalizarModoFaltantes_(leerConfig().presentacion_faltantes_defecto);
  if (v !== null) return v;
  return MODO_FALTANTES_DEFECTO_ === 'simbolos';
}

/**
 * Un valor suelto → `true` (símbolos), `false` (crudo) o `null` (no dice nada).
 *
 * **`null` es el tercer estado y es el que faltaba.** Sin él, «no vino» y «vino en false» son la
 * misma cosa y el default no tiene dónde aplicarse.
 */
function normalizarModoFaltantes_(v) {
  if (v === true) return true;
  if (v === false) return false;
  if (v === undefined || v === null) return null;
  var s = String(v).trim().toLowerCase();
  if (s === '') return null;
  if (s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'simbolos' || s === 'símbolos') return true;
  if (s === 'false' || s === '0' || s === 'no' || s === 'crudo') return false;
  return null;   // texto que nadie reconoce: no se adivina, cae al default
}

/**
 * El modo de esta corrida. Devuelve `{ simbolos, origen }` — **y el `origen` no es decoración**:
 * *"lo eligió el llamador"* y *"salió del default"* son dos cosas distintas, y un reporte que no
 * las separa hace que nadie pueda saber si la opción llegó.
 */
function modoFaltantesDe_(opciones) {
  opciones = opciones || {};
  var pedido = normalizarModoFaltantes_(opciones.faltantes_como_raya);

  if (pedido === null) {
    var porDefecto = modoFaltantesDefecto_();
    var vino = Object.prototype.hasOwnProperty.call(opciones, 'faltantes_como_raya') &&
      opciones.faltantes_como_raya !== undefined && opciones.faltantes_como_raya !== null &&
      String(opciones.faltantes_como_raya).trim() !== '';
    return {
      simbolos: porDefecto,
      origen: vino
        ? '⚠ el llamador mandó "' + opciones.faltantes_como_raya + '", que no se reconoce — se usó ' +
          'el default de CONFIG.presentacion_faltantes_defecto'
        : 'default de CONFIG.presentacion_faltantes_defecto (el llamador no lo pidió)'
    };
  }

  return { simbolos: pedido, origen: 'lo pidió el llamador' };
}

function textoFaltante_(token, resultado, conSimbolos) {
  if (conSimbolos !== true) return '«FALTA:' + token + '»';

  // Los tres glifos van literales y no en constantes de módulo: Apps Script concatena todos los
  // `.gs` en un único scope global (`CLAUDE.md` §1), y tres nombres nuevos ahí arriba costarían
  // superficie de colisión para algo que se usa una vez cada uno, en esta función y en ninguna otra.

  // Sin resultado no hay nada que afirmar sobre el dato: es el caso de la barrida final, que
  // por diseño sólo tiene el nombre del token, y el de un token sin fila en `MARCADORES`.
  if (!resultado) return '/////';

  var estado = String(resultado.estado || '');
  if (estado === 'error' || estado === 'REVISAR') return '---';
  if (estado === 'sin_datos') return '-';

  // `ok` no debería llegar acá —los dos puntos que pintan vuelven antes— y un estado que esta
  // función no conoce tampoco. En los dos casos falta información para afirmar algo sobre el
  // dato, así que sale el símbolo más ruidoso.
  return '/////';
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

/* ═══════════ `2026-08-23_1` Partes B y C — el vocabulario de causas ═══════════════════════
 *
 * ⭐ **Una causa no describe el hueco: nombra el OFICIO que lo cierra.** Ése es todo el criterio
 * para que exista una causa nueva, y el que evita que la lista crezca por matices: si dos
 * situaciones mandan a la misma persona a hacer lo mismo, son una sola causa.
 *
 * ⚠ **Y es la misma pregunta que fundó los cuatro símbolos** (`2026-08-20_1`, y la regla de
 * `CLAUDE.md` §4 que salió del deck con 269 `/////`): *¿qué trabajo manda a hacer esto, y hay más
 * de una causa que lleve al mismo lugar?* Si dos causas distintas comparten etiqueta **y piden
 * acciones distintas**, falta una etiqueta — no una nota al pie.
 *
 * ⛔ **Dos de las causas que el `2026-08-23_1` pide NO están acá, y hay que saber por qué**:
 * *fuera de alcance* y *texto del equipo*. Las dos son decisiones del usuario y **no viven en
 * ninguna hoja de registro** — `docs/CIERRE_POR_LAMINA.md` lo dice con todas las letras: *"la
 * causa 4 no está en ninguna hoja de registro — `LAMINAS` no tiene columna de alcance"*. El motor
 * no las puede probar, así que **no se las inventa**: el panel declara que el conteo no las
 * descuenta, en vez de fabricar una clasificación que nadie escribió. El mecanismo que
 * destrabaría esto es una columna `alcance` en `LAMINAS`, y necesita a alguien que la llene.
 */
var CAUSAS_FALTANTE_ = {
  sin_fila:      { orden: 1, oficio: 'cablear', texto: 'sin fila en MARCADORES' },
  fallo:         { orden: 2, oficio: 'mirar la traza', texto: 'falló al resolver' },
  sin_datos:     { orden: 3, oficio: 'mirar la fuente o la ventana', texto: 'sin datos' },
  escritor:      { orden: 4, oficio: 'es un bug del escritor', texto: 'resolvió y el escritor no lo pisó' },
  no_alcanzado:  { orden: 5, oficio: 'correr de nuevo o continuar', texto: 'la corrida no llegó a este token' },
  fuera_catalogo:{ orden: 6, oficio: 'mirar el catálogo', texto: 'publicó, con valores fuera del catálogo' },
  sin_clasificar:{ orden: 7, oficio: 'mirar la fila', texto: 'sin clasificar' }
};

/**
 * El resultado de `resolverMarcadores` para un token → su causa.
 *
 * ⚠ **`ok` devuelve `escritor` y no es un caso raro: es el modo de falla que hasta hoy no dejaba
 * rastro en ningún lado** (Parte C). Un token que resolvió bien **no entra a `FALTANTES` por el
 * camino normal** —los dos puntos que pintan vuelven antes— y en el deck sale igual que cualquier
 * otro hueco. Si llega acá, es porque quedó crudo con un valor listo al lado.
 */
function causaDeResultado_(resultado) {
  if (!resultado) return 'sin_fila';
  var estado = String(resultado.estado || '');
  if (estado === 'error' || estado === 'REVISAR') return 'fallo';
  if (estado === 'sin_datos') return 'sin_datos';
  if (estado === 'ok') return 'escritor';
  return 'sin_clasificar';
}

/**
 * ⭐ `2026-08-23_1` Parte B — **las columnas nuevas de una hoja de SALIDA llegan solas.**
 *
 * `hojaDeSalida_` sólo escribe headers cuando la hoja **no existe**, así que una columna
 * agregada a `HOJAS_CONFIG_` no aparece nunca en la hoja de siempre — y `escribirFaltantes_`
 * arma cada fila **contra los headers vivos**, con lo cual el valor se descarta **sin error**.
 * Es el modo de falla de `CLAUDE.md` §2 (*«el síntoma nunca es un error»*) aplicado a salida.
 *
 * ⚠ **Sólo agrega al final, nunca reordena ni renombra.** Una columna que se mueve cambia el
 * significado de las filas ya escritas; una que se agrega al final no le hace nada a nadie. Y por
 * eso esto **no sirve para hojas de registro** —ahí está `COLUMNAS_DELTA_`, que además siembra—:
 * vale porque `FALTANTES` es salida y se pisa entera en la misma llamada.
 *
 * Devuelve los headers vivos ya reconciliados, para no volver a leerlos.
 */
function reconciliarHeadersDeSalida_(hoja, nombre) {
  var esperados = HOJAS_CONFIG_[nombre].headers;
  var vivos = hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), 1)).getValues()[0]
    .map(function (h) { return String(h == null ? '' : h).trim(); });

  var faltan = esperados.filter(function (h) { return vivos.indexOf(h) === -1; });
  if (!faltan.length) return vivos;

  var desde = vivos.length + 1;
  if (hoja.getMaxColumns() < vivos.length + faltan.length) {
    hoja.insertColumnsAfter(hoja.getMaxColumns(), vivos.length + faltan.length - hoja.getMaxColumns());
  }
  hoja.getRange(1, desde, 1, faltan.length).setValues([faltan]);
  return vivos.concat(faltan);
}

/**
 * ⭐ `2026-08-23_1` Parte B — **la corrida anterior se guarda antes de pisar la actual.**
 *
 * `D-12` sigue en pie: `FALTANTES` es la lista de trabajo de la última corrida. Lo que faltaba
 * era poder contestar *«¿este faltante ya estaba antes de mi cambio?»* sin haber copiado la hoja
 * a mano de antemano — que es exactamente lo que hubo que hacer el 23/08 para diagnosticar `X-40`,
 * **y sólo salió bien porque alguien se acordó a tiempo**.
 *
 * ⚠ **Copia lo que la hoja TIENE, no lo que la corrida anterior quiso escribir**, y esa distinción
 * es la que la hace confiable: si la corrida anterior murió en el muro y nunca escribió, acá no
 * hay nada que copiar y `FALTANTES_PREVIO` queda igual que estaba. No se inventa una foto.
 *
 * ⚠ **No falla la corrida.** Corre dentro de la reserva del cierre (`2026-08-21_1` A.4), y un
 * problema al archivar una copia de conveniencia no puede costar el `FALTANTES` de hoy ni la fila
 * de `CORRIDAS`. Si rompe, se dice y se sigue.
 */
function rotarFaltantes_(hojaActual) {
  if (hojaActual.getLastRow() < 2) return { ok: true, filas: 0, motivo: 'la corrida anterior no dejó filas' };
  try {
    var headersOrigen = reconciliarHeadersDeSalida_(hojaActual, 'FALTANTES');
    var datos = hojaActual.getRange(2, 1, hojaActual.getLastRow() - 1, headersOrigen.length).getValues();

    var previo = hojaDeSalida_('FALTANTES_PREVIO');
    var headersDestino = reconciliarHeadersDeSalida_(previo, 'FALTANTES_PREVIO');
    if (previo.getLastRow() > 1) {
      previo.getRange(2, 1, previo.getLastRow() - 1, previo.getLastColumn()).clearContent();
    }
    // Por nombre y no por posición: las dos hojas declaran los mismos headers, pero una de las
    // dos puede venir de un esquema viejo y **copiar por índice mezclaría columnas en silencio**.
    var filas = datos.map(function (fila) {
      return headersDestino.map(function (h) {
        var i = headersOrigen.indexOf(h);
        return i === -1 ? '' : fila[i];
      });
    });
    previo.getRange(2, 1, filas.length, headersDestino.length).setValues(filas);
    return { ok: true, filas: filas.length };
  } catch (e) {
    return { ok: false, filas: 0, motivo: String((e && e.message) ? e.message : e) };
  }
}

/**
 * `B.7` (`D-12`) — `FALTANTES` **se pisa** en cada corrida: es la lista de trabajo de lo
 * que falta cablear, no un historial. Una fila por token faltante, con base, solapa, campo
 * y motivo, para poder atacarlos de a uno.
 *
 * ⭐ `2026-08-23_1` Parte B — antes de pisar, la corrida anterior se archiva en
 * `FALTANTES_PREVIO` (una sola de profundidad, ver el comentario del esquema).
 *
 * Devuelve `{ filas, previo }` — **y ya no un número**. El llamador reportaba `faltantesEscritos`
 * tal cual; ahora también tiene que poder decir si el archivado de la anterior salió bien, porque
 * *«no había nada que archivar»* y *«el archivado falló»* se ven igual desde afuera.
 */
function escribirFaltantes_(faltantes) {
  var hoja = hojaDeSalida_('FALTANTES');
  var previo = rotarFaltantes_(hoja);

  var headers = reconciliarHeadersDeSalida_(hoja, 'FALTANTES');
  if (hoja.getLastRow() > 1) {
    hoja.getRange(2, 1, hoja.getLastRow() - 1, hoja.getLastColumn()).clearContent();
  }
  if (!faltantes.length) return { filas: 0, previo: previo };

  var filas = faltantes.map(function (f) {
    return headers.map(function (h) { return (h in f) ? f[h] : ''; });
  });
  hoja.getRange(2, 1, filas.length, headers.length).setValues(filas);
  return { filas: filas.length, previo: previo };
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

/**
 * `2026-08-20_9` (20/08/2026) — **el rastro de etapas acumulado, en memoria, para que el cierre no
 * lo borre.**
 *
 * ⚠ **El instrumento se estaba borrando a sí mismo, y por eso no había desglose que leer.**
 * `marcarEtapa_` escribe en la columna `faltantes` —que hace de campo de estado (`T2.1.2`)— y el
 * cierre la pisa con `avisosDeLaFila_(...)`, que devuelve el conteo y las advertencias **y no
 * conserva nada del recorrido**. O sea: mientras la corrida vive, la celda dice el desglose; en
 * cuanto cierra, lo reemplaza por un número. **Una corrida que terminó no deja medición de dónde
 * gastó el tiempo.**
 *
 * Es la familia que `CLAUDE.md` §4 ya persigue —*un instrumento que mide un cambio no puede
 * depender de lo que el cambio modifica*— en su versión más literal: acá el instrumento depende de
 * una celda que el cierre reescribe.
 *
 * Se acumula en memoria y el cierre lo antepone. Cuesta nada y hace legible el número que decide
 * el tamaño del chunk de la corrida desatendida (`2026-08-20_10`).
 */
var RASTRO_ETAPAS_ = [];

function marcarEtapa_(numeroFila, etapa, t0) {
  /* ⭐ `2026-08-24` — **el acumulado se registra SIEMPRE, aunque no haya fila.** Va antes del
   * `if (numeroFila)` a propósito: la medición de estimaciones no puede depender de que la hoja
   * `CORRIDAS` esté escribible. Si el instrumento de la celda falla —y tiene su propio contador
   * de fallos, abajo— el desvío se sigue pudiendo leer del reporte. */
  var segEtapa = Math.round((new Date().getTime() - t0) / 1000);
  ACUMULADO_POR_ETAPA_.push({ etapa: etapa, acumulado: segEtapa });

  if (numeroFila) {
    try {
      var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CORRIDAS');
      if (!hoja) throw new Error('la hoja CORRIDAS no existe');
      var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
      var col = headers.indexOf('faltantes') + 1;
      if (col < 1) throw new Error('CORRIDAS no tiene columna `faltantes`');

      var seg = segEtapa;
      var celda = hoja.getRange(numeroFila, col);
      var previo = String(celda.getValue() || '');

      // `T2.7` — **cada marca sobrevive a la siguiente.** Antes las cinco se pisaban en la
      // misma celda y la fila sólo decía la última que llegó a escribirse: una corrida que
      // moría en la etapa 4 podía dejar escrita la 1 si el `setValue` de la 4 no alcanzó a
      // volcarse, y eso se leía como "no arrancó". Acumular cuesta un `getValue` por etapa
      // —cinco en total— y a cambio la fila dice **el recorrido**, no un punto.
      var marca = etapa + ' +' + seg + 's';
      // En memoria además de en la celda: la celda la pisa el cierre.
      if (RASTRO_ETAPAS_.indexOf(marca) === -1) RASTRO_ETAPAS_.push(marca);
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
function seccionesRepetiblesDe_(informeId, filasLaminasOpcional) {
  var todas = leerSeccionesPlano_();
  // El registro se recibe si el llamador ya lo leyó — la expansión lo lee **una vez por corrida**
  // y no conviene releerlo por sección. Sin argumento se lee acá, para los otros llamadores.
  var regL = filasLaminasOpcional ? { ok: true, filas: filasLaminasOpcional } : leerLaminas_();
  var filasLaminas = regL.ok ? regL.filas : [];
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
    /* ⭐ `2026-08-21_11` Parte C punto 5 — **deja de exigir `familia_tokens` y pasa a exigir al
     * menos una lámina declarada.** Con `D-37` la pertenencia la dice `LAMINAS`, así que una
     * sección repetible **sin** `familia_tokens` pero **con** láminas declaradas tiene que poder
     * expandirse — que es justo lo que este cambio vuelve posible.
     *
     * ⚠ **El filtro de `estado = activa` se conserva**, y eso importa: de las cinco secciones
     * `repetible` que hoy no tienen láminas, tres son `manual` y dos `revisar`. **Ninguna
     * despierta por este cambio** — y el control lo afirma en vez de confiar en este comentario. */
    .filter(function (s) {
      return filasLaminas.some(function (f) {
        return String(f.informe_id || '').trim() === String(informeId).trim() &&
               String(f.seccion_id || '').trim() === s.seccion_id;
      });
    });
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

/**
 * ⭐ `2026-08-22_25` Parte A — **las filas de `rdv` de los encuentros del temario, sin duplicar.**
 *
 * Devuelve `{ filas, hoja, items, sin_fila }`. `filas` vacío significa *"no hay agregado por
 * temario que aplicar"* y el llamador no cambia nada — no es un error.
 *
 * **No inventa mecanismo:** `itemsDeSeccion_` ya sabe resolver `itera_sobre === 'REUNIONES'` →
 * `anclarEncuentros` → ítems con su `fila_rdv`. Lo único que agrega esta función es **pedirle ese
 * conjunto a una sección de agregado**, que es lo que no existía.
 *
 * ⭐⭐ **La deduplicación es la mitad del trabajo y no es prolijidad.** `julio_24_30` tiene San
 * Cristóbal y Retiro **dos veces cada uno** —`etapa = pre` y `etapa = post`—: son cuatro filas de
 * `REUNIONES` y **dos encuentros**, que apuntan a la **misma** fila de `rdv`. Sumar sin deduplicar
 * publicaría los inscriptos de San Cristóbal dos veces, con un total **grande y plausible** — el
 * modo de falla de siempre. Se deduplica por `(nombre, fecha)` y **no por identidad del objeto**:
 * la identidad depende de que el caché devuelva la misma referencia, y apoyarse en eso sería que
 * el número dependa de un detalle de implementación del caché.
 *
 * ⚠ **Un ítem sin fila de `rdv` NO aporta una fila vacía: no aporta nada, y se cuenta aparte.**
 * Meterle una fila sintética haría que `ecv_encuentros` diera el número correcto mientras
 * `ecv_inscriptos` suma cero por él — que es peor que un conteo corto, porque el conteo corto se
 * ve. `sin_fila` viaja hasta la traza del marcador.
 *
 * ⭐ **Y con esto `ecv_encuentros` deja de contar sobre `inscriptos` sin tocar su fila de
 * `MARCADORES`:** `opCONTEO` devuelve `valores.length` y `valoresDeCtx_` mapea 1:1 sin filtrar
 * vacíos —verificado—, así que contar sobre estas filas **es** contar encuentros. Lo que cambió es
 * el universo, no la operación.
 */
/* ⛔⛔ **`2026-08-24` — la sección se resuelve por `seccion_id` EXPLÍCITO, nunca por «la primera
 * que califique».**
 *
 * **Lo que había acá, textual:** un bucle que tomaba la primera sección `agregado` + `REUNIONES` +
 * `activa` y salía, con el comentario *«hoy es una sola —`ecv_alcance_semanal`— y el bucle está
 * para que una segunda no exija tocar esto»*.
 *
 * ⛔ **El bucle no hacía eso.** Asignaba `elegida` en el primer match y las demás salían por
 * `if (elegida) return;`. Con dos secciones que califiquen **tomaba una según el orden de
 * `Object.keys`** y la otra desaparecía en silencio — devolviendo las filas del temario **de la
 * sección equivocada**, que es un número plausible salido de las filas de otro universo.
 *
 * ⚠ **Nunca fue un contrato: era una coincidencia** de que hubiera una sola sección que
 * calificara. Es el **tercer contrato-sin-testigo de la semana** (`CLAUDE.md` §4, *un comentario
 * que afirma un contrato es una premisa sin testigo*), y como los otros dos **no fallaba nunca**,
 * porque nada lo contradecía mientras la condición accidental se cumpliera.
 *
 * ⭐ **Y la segunda sección llegaba por la puerta del trabajo que la necesita:**
 * `comunicaciones_post` es la candidata, y el prompt que la vuelve `agregado` es exactamente el
 * que habría destapado esto — en una corrida, con el agregado semanal ya publicando.
 *
 * **Qué hace ahora:** exige el id, verifica que la fila **exista** y que **califique**, y devuelve
 * el motivo cuando no. Los ids viven en `CONFIG` y no en el código (`CLAUDE.md` §2: un parámetro
 * de negocio no debería exigir `clasp push`).
 */
function seccionAgregadaDeReuniones_(secciones, informeId, seccionId) {
  var id = String(seccionId || '').trim();
  if (!id) {
    return { ok: false, motivo: 'no se declaró qué sección agregada leer. Va en `CONFIG` — ver ' +
      'seccionAgregadoSemanal_() / seccionAgregadoPost_(). **No hay default**: elegir «la primera ' +
      'que califique» es lo que este bloque vino a sacar.' };
  }
  var s = secciones[id];
  if (!s) {
    return { ok: false, motivo: 'la sección "' + id + '" no existe en `SECCIONES`. Las que hay: ' +
      Object.keys(secciones).join(', ') };
  }
  var falta = [];
  if (String(s.modo || '').trim() !== 'agregado') falta.push('modo = "' + s.modo + '" y tiene que ser `agregado`');
  if (String(s.itera_sobre || '').trim() !== 'REUNIONES') falta.push('itera_sobre = "' + s.itera_sobre + '" y tiene que ser `REUNIONES`');
  if (String(s.estado || '').trim() !== 'activa') falta.push('estado = "' + s.estado + '" y tiene que ser `activa`');
  var informes = String(s.informes || '').split(',').map(function (i) { return i.trim().toLowerCase(); });
  if (informes.indexOf(String(informeId).toLowerCase()) === -1) {
    falta.push('no declara al informe "' + informeId + '" (declara: "' + s.informes + '")');
  }
  if (falta.length) {
    return { ok: false, motivo: 'la sección "' + id + '" no califica: ' + falta.join(' · ') };
  }
  s.seccion_id = s.seccion_id || id;
  return { ok: true, seccion: s };
}

/** El `seccion_id` del agregado semanal. Vive en `CONFIG`, no acá. */
function seccionAgregadoSemanal_() {
  return String(leerConfig().seccion_agregado_semanal || '').trim();
}

/** El `seccion_id` del agregado de comunicaciones post. Vive en `CONFIG`, no acá. */
function seccionAgregadoPost_() {
  return String(leerConfig().seccion_agregado_post || '').trim();
}

/**
 * ⭐⭐ **`2026-08-24` — las filas de una SOLAPA CUALQUIERA para los encuentros del temario.**
 *
 * Es la análoga de `filasRdvDelTemario_` que `L-036` necesita, y la diferencia está en **por dónde
 * encuentra la fila**:
 *
 * | | cómo llega a la fila |
 * |---|---|
 * | `filasRdvDelTemario_` | por `item.opciones.fila_rdv`, que el anclaje ya resolvió por **nombre y fecha** de la reunión |
 * | ⭐ **ésta** | por **`id_cuenta`** del anclaje, contra el `campo_id_cuenta` que la solapa declara (`D-30`) |
 *
 * **Por eso sirve para `reuniones/Agenda JM | Post`**: `C-50` mide que la PRE y la POST comparten
 * `ID` y viven en dos solapas, así que la clave del par es `(ID, solapa)` — y el `id_cuenta` del
 * ítem alcanza para encontrar la fila POST del mismo encuentro.
 *
 * ⚠ **No recorta por ventana, y es a propósito**, igual que la rama de `rdv`: **el temario ya
 * seleccionó** (`R-17`/`R-21`). Además `reuniones` es `modo_periodo = snapshot` y `leerFuente`
 * ignora la ventana de todos modos.
 *
 * ⚠ **Un ítem sin cuenta anclada no aporta fila, y se CUENTA.** No es lo mismo que no existir: un
 * conteo que no distingue *«no hay encuentros»* de *«ningún encuentro ancló»* manda a trabajos
 * opuestos. Sale en `sin_cuenta` y el `origen` lo dice.
 *
 * ⚠ **Y un ítem cuya cuenta no tiene fila en ESTA solapa tampoco es un error**: es un encuentro
 * sin comunicación post, que es el caso normal. Sale en `sin_fila`.
 */
function filasDeSolapaDelTemario_(informeId, ventanaInforme, seccionId, baseId, solapa) {
  var vacio = { ok: false, filas: [], items: 0, sin_cuenta: 0, sin_fila: 0, motivo: '' };
  var secciones;
  try { secciones = leerSeccionesPlano_(); } catch (e) { vacio.motivo = 'no pude leer SECCIONES: ' + e; return vacio; }

  var elegida = seccionAgregadaDeReuniones_(secciones, informeId, seccionId);
  if (!elegida.ok) { vacio.motivo = elegida.motivo; return vacio; }

  var campoCuenta = campoIdCuentaDeSolapa_(baseId, solapa);
  if (!campoCuenta) {
    vacio.motivo = baseId + '/' + solapa + ' no declara `SOLAPAS.campo_id_cuenta`, que es la ' +
      'única vía para encontrar la fila de un encuentro en esta solapa (`D-30`).';
    return vacio;
  }
  var mapa = buscarMapeo(baseId, solapa, campoCuenta);
  if (!mapa.ok) { vacio.motivo = mapa.motivo; return vacio; }

  var r;
  try { r = itemsDeSeccion_(elegida.seccion, informeId, ventanaInforme); } catch (e) {
    vacio.motivo = 'itemsDeSeccion_ falló: ' + e; return vacio;
  }
  if (!r || !r.ok) { vacio.motivo = (r && r.motivo) || 'itemsDeSeccion_ no devolvió ítems'; return vacio; }

  var lectura = leerFuente(baseId, ventanaInforme, solapa, { sin_recorte_por_ventana: true });
  if (!lectura.ok) { vacio.motivo = lectura.motivo; return vacio; }
  var encClave = encabezadoEnColumna_(baseId, solapa, mapa.columna);

  /* Dedup por `id_cuenta`: `julio_24_30` trae San Cristóbal y Retiro **dos veces cada uno** —`pre`
   * y `post`—, y las dos filas del temario apuntan al MISMO encuentro. Sin esto la tabla
   * publicaría el mismo encuentro en dos ranuras. Es el mismo motivo por el que
   * `filasRdvDelTemario_` deduplica, con otra clave: allá es `(nombre, fecha)` porque la fila de
   * `rdv` se resuelve por ahí; acá la clave natural es la cuenta. */
  var vistos = {};
  var filas = [];
  var sinCuenta = 0, sinFila = 0, conVarias = 0, items = 0;
  (r.items || []).forEach(function (item) {
    var id = normalizarIdCuenta_(item.id_cuenta || '');
    if (!id) { sinCuenta++; return; }
    if (vistos[id]) return;
    vistos[id] = true;
    items++;
    var suyas = filtrarFilasPorCuenta_(lectura.filas, encClave, id);
    if (!suyas.length) { sinFila++; return; }
    /* ⚠ **Una fila por encuentro, y si hay más de una eso se REPORTA.** Quedarse con la primera
     * en silencio sería elegir por el orden de la hoja, que es lo que el `_39` sacó de `ULTIMO`
     * sobre esta misma familia de solapas. La solapa está medida con **una fila por encuentro**
     * (`SOLAPAS`: *"POST — 104 filas al 14/08, mismo ID que la PRE"*), así que `con_varias > 0`
     * es un cambio de forma de la fuente, no un caso normal. */
    if (suyas.length > 1) conVarias++;
    filas.push(suyas[0]);
  });

  return {
    ok: true,
    filas: filas,
    items: items,
    sin_cuenta: sinCuenta,
    sin_fila: sinFila,
    con_varias: conVarias,
    seccion_id: elegida.seccion.seccion_id,
    base_id: baseId,
    hoja: solapa,
    motivo: ''
  };
}

function filasRdvDelTemario_(informeId, ventanaInforme, seccionId) {
  var vacio = { filas: [], hoja: '', items: 0, sin_fila: 0 };
  var secciones;
  try { secciones = leerSeccionesPlano_(); } catch (e) { return vacio; }

  var resuelta = seccionAgregadaDeReuniones_(secciones, informeId,
    seccionId === undefined ? seccionAgregadoSemanal_() : seccionId);
  if (!resuelta.ok) return vacio;
  var elegida = resuelta.seccion;

  var r;
  try { r = itemsDeSeccion_(elegida, informeId, ventanaInforme); } catch (e) { return vacio; }
  if (!r || !r.ok) return vacio;

  var vistos = {};
  var filas = [];
  var hoja = '';
  var sinFila = 0;
  (r.items || []).forEach(function (item) {
    /* La clave es **nombre + fecha**, y `etapa` NO entra: `pre` y `post` son el mismo encuentro y
     * comparten fila de `rdv`. ⚠ **La fecha tampoco sobra**: `junio_sem2` tiene *dos* encuentros
     * en Boedo —12/06 y 17/06— y con el nombre solo se fusionarían en uno. */
    var f = (item.fecha instanceof Date) ? item.fecha : parsearFechaCelda_(item.fecha);
    var clave = normalizar_(item.etiqueta || item.clave) + '|' + (f ? formatearFecha_(f) : 'sin_fecha');
    if (vistos[clave]) return;
    vistos[clave] = true;

    var filaRdv = item.opciones && item.opciones.fila_rdv;
    if (!filaRdv) { sinFila++; return; }
    hoja = hoja || String((item.opciones && item.opciones.hoja_rdv) || '');
    filas.push(filaRdv);
  });

  return { filas: filas, hoja: hoja, items: Object.keys(vistos).length, sin_fila: sinFila };
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
        /* ⭐ `2026-08-21_11` Parte C — **`tipo` y `etapa` viajan con el ítem, y sin eso
         * `LAMINAS.filtro` no puede decidir nada.** El ítem tenía cinco campos y `tipo` no estaba
         * entre ellos: un `filtro = tipo=Uno a uno` sobre una fila de `LAMINAS` leería `undefined`
         * y **no matchearía ninguna lámina, sin fallar**.
         *
         * ⚠ **Es el mismo hueco que el `2026-08-21_8` cerró un escalón más arriba**, en el ítem
         * que arma el anclaje — y volvió a aparecer acá porque **son dos objetos distintos**: el
         * crudo del anclaje y el ítem del generador. Que uno lo tenga no le sirve al otro.
         *
         * **Se agregan estos dos y nada más**, por el mismo motivo que allá: `asignaciones` viaja
         * a `PropertiesService` en la corrida desatendida. Lo que se necesita se declara. */
        tipo: e.tipo || '',
        etapa: e.etapa || '',
        /* ⭐ `2026-08-22_25` — **la fecha viaja con el ítem, y es lo que separa dos encuentros del
         * mismo barrio.** `filasRdvDelTemario_` deduplica por `(nombre, fecha)` para no sumar dos
         * veces la fila de `rdv` que comparten el `pre` y el `post` de un mismo encuentro; con el
         * nombre solo, `junio_sem2` **fusionaría** sus dos Boedo —12/06 y 17/06— en uno y el
         * agregado publicaría un encuentro de menos, sin fallar.
         *
         * ⚠ Es el mismo hueco que el `2026-08-21_11` cerró para `tipo`: el ítem tenía los campos
         * justos y el consumidor nuevo necesitaba uno más. **Se agrega éste y nada más**, por el
         * motivo de siempre: `asignaciones` viaja a `PropertiesService` en la corrida desatendida. */
        fecha: e.fecha || '',
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
      // Sin `ventana`: la campaña es el PRIMER eslabón de `D-20` y `resolverVentana` usa
      // su `desde`/`hasta`. Pasarle la del informe sería justo lo que el paso prohíbe.
      //
      // ⚠ **`periodo_id` viaja con el ítem**, y no es opcional: con la lista, `campana_id` solo
      // ya no identifica una fila. Sin esto `resolverVentana` no puede saber de qué semana es la
      // ventana y falla por ambigua — que es el comportamiento correcto, pero acá tenemos el
      // dato y hay que pasarlo.
      var opcionesCampana = {
        campana: id,
        periodo_id: String(c.periodo_id || '').trim(),
        seccion_id: seccion.seccion_id,
        filtro_seccion: seccion.filtro
      };
      var cuentaCampana = String(c.id_cuenta || '').trim();

      /* ⭐ `2026-08-22_20` Parte A (addendum tras la Parte 0) — **la cuenta entra DONDE EL
       * CONSUMIDOR LA BUSCA, que es adentro de `opciones`.**
       *
       * ⛔ **El bug, medido el 22/08 y con las dos mitades a la vista.** Esto ya ponía
       * `id_cuenta` en el ítem —abajo, como hermano de `opciones`— y **nadie lo leía**: la rama
       * por cuenta de `datosDeMarcador_` lee `opciones.id_cuenta`, y `opciones` es lo único que
       * viaja: `opcionesItem` copia **sólo `asignacion.item.opciones`**. El productor llenaba un
       * campo y el consumidor leía otro, **y ninguno de los dos fallaba**.
       *
       * **La consecuencia publicada:** los ocho `camp_*` de `looker/resumen_metricas_dinamico`
       * leyeron el **agregado global de todas las cuentas** en vez de la campaña destacada, y la
       * corrida `jm-20260821-234927` lo dejó a la vista — `ULTIMO` se negó a elegir entre
       * 160 / 507 / 12.985 / 14.040 / 84.325 / 103.639. **La guarda de `ULTIMO` es lo único que
       * evitó que se publicara un número plausible.**
       *
       * ⚠ **Y el comentario que estaba acá era falso, por eso se reescribe entero.** Decía que
       * esto quedaba *"inerte hasta que la solapa declare su `campo_id_cuenta`"*. **La solapa lo
       * declara desde antes** —`SOLAPAS.looker/resumen_metricas_dinamico.campo_id_cuenta =
       * `id_cuenta`, verificado en la hoja viva el 22/08— y seguía inerte igual. Es la familia de
       * `CLAUDE.md` §4: un comentario que afirma un contrato es una premisa sin testigo, y
       * sobrevive porque nada lo contradice.
       *
       * ⭐ **Se calca la forma de la rama `REUNIONES`** —`if (e.idCuenta) opciones.id_cuenta = …`—
       * y no se toca el consumidor: `REUNIONES` ya funciona contra él, y moverlo rompería lo que
       * anda para arreglar lo que no.
       *
       * ⚠ **Y el hermano se conserva**, porque tiene un lector propio y medido: el reporte
       * `porItem` lo publica (`id_cuenta: asignacion.item.id_cuenta`). Grepeado el 22/08, es el
       * único. Los dos quedan hasta saber cuál sobra — quitar el que parece redundante **antes**
       * de saberlo es cómo se rompe un reporte sin que nada falle. */
      if (cuentaCampana) opcionesCampana.id_cuenta = cuentaCampana;

      items2.push({
        clave: id,
        etiqueta: c.nombre || id,
        opciones: opcionesCampana,
        id_cuenta: cuentaCampana,
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
function duplicarBloquesRepetibles_(presentacion, informeId, ventanaInforme, seccionesElegidas, reloj) {
  var asignaciones = [];
  var reporte = [];
  var reclamadas = {};

  /* ⭐ `2026-08-21_11` Parte C — **el índice y el registro se leen UNA vez, ANTES de duplicar.**
   * No es una optimización: es lo que mata la N². `slide.duplicate()` copia las notas del orador
   * —medido—, así que una copia hereda el ancla de su modelo; resolver por `lamina_id` sobre un
   * deck ya expandido devolvería copias. Calculado acá, no hay copias todavía. */
  var indiceLaminas = indiceDeLaminasPorAncla_(presentacion);
  var regLaminas = leerLaminas_();
  var filasLaminas = regLaminas.ok ? regLaminas.filas : [];
  if (!regLaminas.ok) {
    reporte.push({ seccion: '(todas)', ok: false, motivo: '⛔ no se pudo leer LAMINAS: ' + regLaminas.motivo +
      ' — sin el registro ninguna sección repetible tiene bloque (D-37)' });
  }

  /* ⭐ `2026-08-21_1` A.2 — **el control del reloj DENTRO de la etapa más cara.**
   *
   * Ésta es la etapa que se pasó de los 150 s el 21/08 sin consultar el reloj ni una vez, y no
   * alcanza con un control antes de entrar: la primera sección paga el arranque entero —anclaje
   * y unión digital, 70-80 s— y las siguientes pagan duplicación, que es una llamada a la API
   * de Slides por asignación. Son dos gastos de naturaleza distinta y los dos viven acá.
   *
   * **Dos controles, y hacen falta los dos:**
   *
   *  1. **Después de la primera lectura** — el arranque ya se pagó y lo único que se puede
   *     decidir es no seguir. Si se pasó, el corte sale con clase `arranque_no_entra`, que es
   *     un **diagnóstico** —*"la corrida no tenía con qué empezar"*— y no un corte genérico.
   *  2. **Antes de cada sección siguiente**, contra lo que costó la anterior. Mismo criterio
   *     que el bucle de ítems: el costo es un dato de esta corrida, no una constante.
   *
   * ⚠ **Se corta ENTRE secciones, nunca adentro de una.** Entre el `duplicate()` y el
   * `remove()` de los modelos hay una ventana en la que las copias sin pintar son
   * indistinguibles de un modelo, y cortar ahí devuelve la expansión al cuadrado que describe
   * `2026-08-20_10` A.3. Una sección que no se expande queda **exactamente** en el estado que
   * el motor ya sabe manejar —la misma que una sección destildada en el panel—: su bloque
   * modelo queda como está y sus tokens caen a la pasada de tokens fijos.
   *
   * ⚠ **El arranque se descuenta del costo de la sección que lo pagó, y sin eso la estimación
   * miente por 80 s.** La primera sección que lee paga anclaje + unión + su propia duplicación;
   * las siguientes pagan **sólo** duplicación, porque el caché ya tiene lo caro. Estimar la
   * segunda con lo que costó la primera la haría cortar siempre, y el corte diría *«no entra»*
   * sobre trabajo que entra de sobra. Por eso el descuento es **por iteración** y no una
   * variable que haya que acordarse de poner en cero.
   *
   * ⚠ **Y lo que esto deja abierto, dicho acá porque es donde se va a notar:** una sección que
   * no se expandió **no tiene asignaciones**, así que no entra al plan de la corrida
   * desatendida, que se escribe desde `cont.asignaciones`. La reanudación no la va a ver. Está
   * anotado en `docs/PENDIENTES_consistencia.md` y **no se arregla acá**: tocarlo es tocar el
   * mecanismo desatendido, que este paso declara fuera de alcance. */
  var corteExpansion = null;
  var costoUltimaSeccionSeg = 0;
  var arranqueMedido = false;
  /* ⛔ `D-37` punto 5 — el invariante: un ítem sin ninguna lámina **frena la corrida entera**.
   * Se guarda acá y no se devuelve desde el `forEach`, que no puede frenar nada. */
  var invarianteRoto = null;

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

  seccionesRepetiblesDe_(informeId, filasLaminas).forEach(function (seccion) {
    // Con el invariante roto no se expande nada más: la corrida va a frenar igual.
    if (invarianteRoto) return;

    // Ya se cortó: las que quedan **se reportan** con ese motivo, `D-21`. Un corte que hace
    // desaparecer secciones del reporte es indistinguible de una sección que nadie configuró.
    if (corteExpansion) {
      reporte.push({
        seccion: seccion.seccion_id, ok: true, omitida: true, items: [], excluidos: [],
        motivo: 'no se expandió: la corrida se cortó por presupuesto en la etapa 1 (' +
          corteExpansion.clase + '). El bloque modelo queda como está y sus tokens caen a la ' +
          'pasada de tokens fijos'
      });
      return;
    }

    // Checkpoint · antes de esta sección, contra lo que costó la anterior.
    if (reloj) {
      corteExpansion = controlDeEtapa_(reloj, '1 · expandir secciones repetibles',
        costoUltimaSeccionSeg, CORTE_PRESUPUESTO_, {
          item: seccion.seccion_id,
          motivo: 'expandir la sección "' + seccion.seccion_id + '" se estimó en ' +
            costoUltimaSeccionSeg + ' s (lo que costó la anterior) y quedaban ' +
            entraEnElPresupuesto_(reloj, 0).disponible + ' s por encima de la reserva'
        });
      if (corteExpansion) {
        reporte.push({
          seccion: seccion.seccion_id, ok: true, omitida: true, items: [], excluidos: [],
          motivo: corteExpansion.motivo
        });
        return;
      }
    }

    // `D-21` — una sección que queda afuera **se reporta**, nunca desaparece. Sus slides
    // modelo se quedan como están y sus tokens caen a la pasada de tokens fijos, que es
    // exactamente lo que ya pasa con una sección sin ítems: no es un camino nuevo.
    if (elegidas && !elegidas[seccion.seccion_id]) {
      reporte.push({
        seccion: seccion.seccion_id, ok: true, omitida: true, items: [], excluidos: [],
        motivo: 'fuera de esta corrida — no se la eligió. El bloque modelo queda como está y ' +
          'sus tokens caen a la pasada de tokens fijos',
        // `D-37` — también acá las láminas salen de `LAMINAS`: si el reporte de una sección
        // omitida siguiera infiriendo por familia, diría otras láminas que las que se habrían
        // expandido, y un reporte que no coincide con el motor es peor que uno vacío.
        laminas_modelo: laminasDeSeccion_(filasLaminas, informeId, seccion.seccion_id, indiceLaminas)
          .conSlide.map(function (l) { return l.lamina_id; })
      });
      return;
    }

    var t0Seccion = new Date().getTime();
    /* ⭐ `2026-08-21_11` Parte C — **el bloque sale de `LAMINAS`, no de la familia de tokens.**
     * `slidesModeloDe_(familias)` dejó de decidir (`D-37`). `familias` se conserva **sólo para el
     * mensaje de error**: sigue siendo lo que le dice a una persona qué tokens esperaba ver. */
    var familias = familiasDeSeccion_(seccion);
    var deLamina = laminasDeSeccion_(filasLaminas, informeId, seccion.seccion_id, indiceLaminas);
    var modelos = deLamina.conSlide.map(function (l) { return l.indice; });

    var t0Items = new Date().getTime();
    // Cuánto de ESTA sección fue arranque. Por iteración: no hay nada que poner en cero después.
    var segArranqueAca = 0;
    var resultado = itemsDeSeccion_(seccion, informeId, ventanaInforme);

    /* ⭐ El control del arranque. Va **acá y no antes**: `itemsDeSeccion_` es quien paga
     * `anclarEncuentros` y `unirDigitalPorCuenta`, y el caché los cobra una sola vez por
     * corrida, así que el arranque es exactamente lo que costó esta primera llamada.
     *
     * `estimadoSeg = 0` porque la pregunta ya no es *"¿entra lo que viene?"* sino **"¿ya me
     * pasé?"**. Es indivisible —el anclaje no acepta un subconjunto—, así que la única
     * decisión posible es no seguir. Y el corte sale con nombre propio: *"el arranque no
     * entra en el techo"* manda a subir el techo o a partir el arranque; *"me quedé sin
     * presupuesto"* manda a correr de nuevo. Son dos arreglos distintos. */
    if (reloj && !arranqueMedido) {
      arranqueMedido = true;
      segArranqueAca = Math.round((new Date().getTime() - t0Items) / 1000);
      corteExpansion = controlDeEtapa_(reloj, '1 · expandir secciones repetibles', 0, CORTE_ARRANQUE_,
        { item: seccion.seccion_id });
      if (corteExpansion) {
        reporte.push({
          seccion: seccion.seccion_id, ok: true, omitida: true, items: [], excluidos: [],
          motivo: corteExpansion.motivo
        });
        return;
      }
    }

    if (!resultado.ok) {
      reporte.push({ seccion: seccion.seccion_id, ok: false, motivo: resultado.motivo, slides_modelo: modelos.map(function (i) { return i + 1; }) });
      return;
    }

    if (!modelos.length) {
      /* `D-37` — el motivo cambió de sentido y por eso se reescribe: antes decía *"ninguna slide
       * lleva tokens de X"*, que era una afirmación sobre el CONTENIDO. Ahora es sobre el
       * REGISTRO: nadie declaró ninguna lámina para esta sección. Son dos trabajos distintos —
       * el viejo mandaba a mirar la plantilla, éste manda a mirar `LAMINAS`. */
      reporte.push({
        seccion: seccion.seccion_id, ok: false,
        motivo: '⚠ hay ' + resultado.items.length + ' ítem(s) y **ninguna fila de `LAMINAS` declara ' +
          '`seccion_id = ' + seccion.seccion_id + '` para el informe `' + informeId + '`**' +
          (deLamina.sinSlide.length
            ? ' — ⚠ hay ' + deLamina.sinSlide.length + ' fila(s) que sí la declaran pero su ancla no ' +
              'está en la plantilla: ' + deLamina.sinSlide.join(', ')
            : '') +
          '. (Los tokens que esta sección esperaba son ' + (familias.join('/') || '(sin familia declarada)') + '.)',
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
    /* ⭐ `2026-08-21_11` Parte C — **`LAMINAS.filtro` se evalúa POR ÍTEM**, y es lo que hace que
     * el "1 a 1" lleve `L-053` y el resto el iceberg. La portada, con `filtro` vacío, entra para
     * todos.
     *
     * ⚠ **El bloque de un ítem NO tiene por qué ser contiguo, y el de la sección sí.** Con
     * `L-052 · L-035 · L-053` en las posiciones 6-7-8, el 1 a 1 copia la 6 y la 8 y se saltea la 7.
     * Las copias se ubican con el mismo `inicio + k` corrido, que **nunca depende** de que las
     * copias de un ítem sean tantas como las de otro. */
    var copias = [];
    var porItemLaminas = [];
    for (var iIt = 0; iIt < resultado.items.length; iIt++) {
      var item = resultado.items[iIt];
      var suyas = [];
      var descartadas = [];
      for (var iM = 0; iM < deLamina.conSlide.length; iM++) {
        var decision = laminaEntraParaItem_(deLamina.conSlide[iM], item);
        if (decision.entra) suyas.push({ meta: deLamina.conSlide[iM], slide: modelosSlides[iM] });
        else descartadas.push(deLamina.conSlide[iM].lamina_id + ' (' + decision.motivo + ')');
      }

      /* ⛔ **`D-37` punto 5 — un ítem sin ninguna lámina es un invariante roto, no un caso a
       * manejar.** Decisión del usuario: *"eso no puede pasar"*. Frena nombrando **sección e
       * ítem**, y no se emite un deck a medias con un encuentro que desapareció en silencio. */
      if (!suyas.length) {
        /* ⚠ **`return` desde acá sólo saltea la sección**: estamos dentro del `forEach` de
         * secciones, y un objeto devuelto ahí se descarta. El invariante se guarda afuera y lo
         * lee el llamador — que es lo único que puede frenar de verdad. */
        invarianteRoto = {
          seccion: seccion.seccion_id, item: item.clave, informe_id: informeId,
          motivo: 'ninguna de las ' + deLamina.conSlide.length + ' lámina(s) declaradas para la ' +
            'sección "' + seccion.seccion_id + '" entra para el ítem "' + item.clave + '". ' +
            'Descartes: ' + (descartadas.join(' · ') || '(ninguno — la sección no tiene láminas)') +
            '. Revisar LAMINAS.filtro: con todas las condiciones excluyentes, el ítem se queda sin bloque.'
        };
        return;   // sale del forEach de secciones; el guard de arriba frena a las que siguen
      }

      porItemLaminas.push({ item: item.clave, laminas: suyas.map(function (x) { return x.meta.lamina_id; }) });
      suyas.forEach(function (x) {
        var copia = x.slide.duplicate();
        copias.push(copia);
        asignaciones.push({ objectIdSlide: copia.getObjectId(), item: item, seccion: seccion.seccion_id });
      });
    }

    modelosSlides.forEach(function (modelo) { modelo.remove(); });

    // Ascendente: cada copia queda en su lugar definitivo y las ya ubicadas no se corren.
    copias.forEach(function (copia, k) { copia.move(inicio + k); });

    reporte.push({
      seccion: seccion.seccion_id, ok: true,
      itera_sobre: seccion.itera_sobre,
      slides_modelo: modelos.map(function (i) { return i + 1; }),
      // `2026-08-21_11.2` §3 — **cuántas láminas modelo y CUÁLES**, con su `lamina_id`. Sin esto,
      // un bloque que crece se descubre mirando un deck. Dos crecieron el 21/08: `jm campana`
      // de 8 a 9 y `secco comunicaciones_post` de 1 a 2, las dos por la portada del bloque.
      laminas_modelo: deLamina.conSlide.map(function (l) { return l.lamina_id; }),
      laminas_declaradas_sin_slide: deLamina.sinSlide,
      // Y cuál lámina le tocó a cada ítem — es lo que hace verificable la condición del 1 a 1.
      laminas_por_item: porItemLaminas,
      emitidos: resultado.items.map(function (i) { return i.clave + (i.motivo ? ' ⚠ ' + i.motivo : ''); }),
      excluidos: resultado.excluidos,
      // `_27` bloque 3 — lo que costó DUPLICAR esta sección. Es sólo una parte de lo que
      // cuesta: pintar sus ítems se mide aparte, en la etapa 3, y las dos se suman en
      // `tiempos_por_seccion`. Separadas y no sumadas acá porque se atacan distinto — una
      // sección cara por duplicación tiene muchas slides modelo; una cara por ítems tiene
      // muchos ítems.
      seg_expansion: Math.round((new Date().getTime() - t0Seccion) / 1000)
    });

    // Lo que costó ESTA sección **sin el arranque** es lo que se estima para la siguiente.
    costoUltimaSeccionSeg = Math.max(0,
      Math.round((new Date().getTime() - t0Seccion) / 1000) - segArranqueAca);
  });

  return {
    asignaciones: asignaciones, reporte: reporte, corte: corteExpansion,
    invariante_roto: invarianteRoto,
    // `2026-08-21_11.2` §5 — las láminas del deck **sin ancla**. ⚠ *"Nadie la clasificó"* y *"no
    // tiene tokens"* mandan a trabajos opuestos, y sin este aviso se leen igual.
    laminas_sin_ancla: indiceLaminas.sinAncla
  };
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
/* ⭐ `2026-08-24` (`D-40`) — la **semilla** del costo de UNA lámina de la etapa 4. Sólo la usa la
 * primera: a partir de ahí se mide y se adapta. Ver `costoLaminaEtapa4Seg_()`. */
var COSTO_LAMINA_ETAPA4_SEG_DEFECTO_ = 30;

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

/* `2026-08-21_1` A.1 — los tres costos que faltaban, y van a `CONFIG` por el mismo motivo que
 * los tres de arriba (`CLAUDE.md` §2): bajarlos desde la hoja es la forma barata de probar el
 * corte de cada etapa sin esperar a que la plataforma mate la corrida. */

/** El arranque: anclaje (~50 s) + unión digital (~27 s), medidos el 20/08 en 70-80 s juntos. */
var COSTO_ARRANQUE_SEG_DEFECTO_ = 80;
/** El mapa token→objectId. El comentario de `barrerTokensNoAlcanzados_` lo mide en 10-27 s. */
var COSTO_MAPA_SEG_DEFECTO_ = 25;
/**
 * ⭐ El costo de **un** ítem, y existe para tapar un agujero concreto: `costoUltimoItemSeg`
 * arrancaba en `0`, así que **el primer ítem entraba siempre**, aunque quedaran 2 s sobre la
 * reserva. Un ítem cuesta ~6 s medidos (`seg_por_asignacion`, `2026-08-20_10.1`), así que un
 * primer ítem gratis es hasta 6 s de sobregiro que nadie autorizó. El valor de la corrida sigue
 * pisando a éste en cuanto hay una observación propia: esto es la semilla, no el criterio.
 */
var COSTO_ITEM_SEG_DEFECTO_ = 6;

function costoArranqueSeg_() {
  var valor = Number(leerConfig().costo_arranque_seg);
  return isNaN(valor) || valor <= 0 ? COSTO_ARRANQUE_SEG_DEFECTO_ : valor;
}

function costoMapaSeg_() {
  var valor = Number(leerConfig().costo_mapa_seg);
  return isNaN(valor) || valor <= 0 ? COSTO_MAPA_SEG_DEFECTO_ : valor;
}

function costoItemSeg_() {
  var valor = Number(leerConfig().costo_item_seg);
  return isNaN(valor) || valor <= 0 ? COSTO_ITEM_SEG_DEFECTO_ : valor;
}

/**
 * El único lugar del flujo que hace cuentas de tiempo. Devuelve si entra un trabajo que se
 * estima en `costoSeg`, dejando la reserva del cierre intacta.
 *
 * `reloj` es `{ t0, presupuesto, reserva }`, armado una sola vez al entrar a
 * `generarInforme`. Ninguna otra parte arranca un cronómetro por su lado.
 */
/**
 * `2026-08-21_1` A.3 — **`t0` entra por parámetro.** El arranque del cronómetro pasó a la
 * primera línea de `generarInforme`, que es la primera línea de la ejecución; acá se lo recibe
 * para no tener dos criterios de "cuándo empieza la corrida". Sin argumento sigue arrancando
 * ahora, que es lo que hacen los llamadores de prueba.
 *
 * ⚠ **Lo que esto NO arregla, y hay que saberlo:** la plataforma cuenta desde `doPost`, desde
 * el trigger o desde el click del panel, no desde esta línea. Lo que el llamador gasta **antes**
 * de entrar —el lock y la lectura del plan en `correrUnaEjecucion_`, por ejemplo— sigue fuera
 * del reloj y sale del colchón entre el techo y el muro.
 */
function relojDeCorrida_(t0) {
  return {
    t0: t0 || new Date().getTime(),
    presupuesto: presupuestoCorridaSeg_(),
    reserva: reservaCierreSeg_()
  };
}

function segundosGastados_(reloj) {
  return Math.round((new Date().getTime() - reloj.t0) / 1000);
}

function entraEnElPresupuesto_(reloj, costoSeg) {
  var gastado = (new Date().getTime() - reloj.t0) / 1000;
  var disponible = reloj.presupuesto - reloj.reserva - gastado;
  return { entra: disponible >= costoSeg, disponible: Math.round(disponible), gastado: Math.round(gastado) };
}

/* ═══════════════════ `2026-08-21_1` — el control de etapa ═══════════════════
 *
 * ⭐ **Un presupuesto que sólo se consulta en el bucle no protege las etapas que están fuera del
 * bucle.** Hasta el 21/08 el reloj se miraba en exactamente **dos** sitios —antes de cada ítem de
 * la etapa 3 y antes de la etapa 4—, así que el arranque (anclaje + unión digital + duplicación),
 * el mapa de tokens y el cierre corrían **sin ningún punto de control**: ninguno podía cortar y
 * ninguno podía siquiera informar que se había pasado.
 *
 * **El síntoma medido, corrida `jm` del 21/08 por la mañana:** `CONFIG.presupuesto_corrida_seg`
 * estaba en **150** —quedó bajo de la prueba del mecanismo desatendido de la noche anterior— y la
 * corrida llegó igual al muro duro de Apps Script, **360 s**. Más del doble del techo declarado.
 * No es que hubiera más trabajo del que entra en seis minutos: es que **el presupuesto no se
 * consultaba** en el tramo donde se gastó.
 *
 * ⚠ **Y el corte que muere en el muro no deja nada**: sin barrida, sin `FALTANTES`, sin cerrar la
 * fila de `CORRIDAS` y con el deck sellado `[en proceso]` para siempre.
 *
 * **La clase del corte importa tanto como el corte.** *"El arranque no entra en el techo"* y
 * *"me quedé sin presupuesto en el medio"* mandan a trabajos opuestos: el primero se arregla
 * subiendo el techo o partiendo el arranque, el segundo corriendo de nuevo o eligiendo menos
 * secciones. Un corte genérico los confunde, que es la misma familia del `/////` que no
 * distinguía *«nadie lo cableó»* de *«no se llegó»*.
 */

/** Clases de corte. No son cosmética: cada una manda a un arreglo distinto. */
var CORTE_PRESUPUESTO_ = 'presupuesto';
var CORTE_ARRANQUE_ = 'arranque_no_entra';

/**
 * ⭐ **Las etapas que TIENEN que llevar control, declaradas en un solo lugar.**
 *
 * La lista es la **declaración**; las llamadas a `controlDeEtapa_` en el código son la
 * **implementación**. Son dos cosas distintas a propósito: `controlPorEtapa_()` compara una
 * contra la otra, así que sacar un control del flujo hace caer su afirmación (`CLAUDE.md` §4 —
 * un instrumento no puede depender de lo que el cambio modifica).
 *
 * ⚠ **El cierre no está y no es un olvido:** barrida, `FALTANTES`, `CORRIDAS` y sello **tienen
 * que correr siempre**, cortada la corrida o no. Lo que lo protege no es un punto de control sino
 * la reserva, y por eso el cierre se **mide** (`presupuesto.cierre_seg`) en vez de controlarse.
 */
var ETAPAS_CON_CONTROL_ = [
  '1 · expandir secciones repetibles',
  '2 · mapa token→objectId',
  '3 · pasada por ítem',
  '4 · tokens fijos'
];

/**
 * El punto de control de una etapa. `null` = entra y la etapa arranca; un objeto `corte` = no
 * entra, y la corrida sale **declarada** en vez de morir en el muro.
 *
 * `estimadoSeg` es lo que se estima que cuesta la etapa. Con `0` la pregunta es la otra —
 * *"¿ya me pasé?"*—, que es la forma del control del arranque: ahí el gasto ya ocurrió y lo
 * único que se puede hacer es no seguir.
 */
/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⭐⭐ `2026-08-24` — **la corrida MIDE lo que estimó, y avisa cuando la estimación se aleja.**
 *
 * **El problema, con los tres casos del día y no en abstracto.** El motor tiene tres números en
 * `CONFIG` que son **estimaciones de cosas que crecen**, y ninguno tenía quién se enterara:
 *
 * | constante | con qué se calibró | qué pasó |
 * |---|---|---|
 * | `reserva_cierre_seg = 30` | un cierre **medido en 0,8 s** (06/08) | el cierre pasó a **25 s** |
 * | `costo_resolucion_etapa4_seg = 60` | **~87 marcadores** (06/08: 40,6 / 30,7 / 36,3 s) | hoy son **172**, y la etapa costó **158 s** |
 * | `presupuesto_corrida_seg = 350` | el muro de Apps Script, **no medido** | el arranque creció y nadie lo re-midió |
 *
 * ⛔ **Dos de tres fallaron el 24/08 en la misma corrida**, y el sintoma fue un deck incompleto
 * con 237 faltantes. **Un número elegido a ojo que nadie vuelve a mirar es indistinguible de uno
 * correcto hasta el día que no alcanza.**
 *
 * ⭐ **Qué hace esto, y es lo que rompe el ciclo:** guarda lo **estimado** en cada punto de
 * control y lo **real** de cada etapa, y al cerrar los compara. Una constante con un control que
 * se entera **deja de ser una estimación que envejece en silencio** — es la forma de `C-79`
 * (*medir cuántas veces se dispararía hoy*) aplicada a un presupuesto.
 *
 * ⚠ **NO corrige nada y no cambia ninguna decisión de la corrida.** Mide y avisa. Corregir un
 * techo mientras la corrida usa el viejo sería mover el suelo bajo el reloj.
 *
 * ⚠ **Y los avisos salen ÚLTIMOS, después del veredicto** (`CLAUDE.md` §4): un `⚠` en el medio
 * de un reporte que termina en `✅` se lee como verde, y eso ya pasó dos corridas seguidas con
 * la tanda 4.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Lo que cada punto de control DIJO que iba a costar. Se llena en `controlDeEtapa_`. */
var ESTIMADO_POR_ETAPA_ = {};

/** Lo que cada etapa costó de verdad, en segundos acumulados desde `t0Etapas`. */
var ACUMULADO_POR_ETAPA_ = [];

/**
 * Cuánto se pasa una estimación antes de que valga la pena avisar.
 *
 * ⛔ **No es un cuarto número elegido a ojo, y el motivo importa:** no decide **nada** de la
 * corrida — sólo si se imprime una línea. Un umbral de aviso mal puesto cuesta un aviso de más o
 * de menos; un techo mal puesto cuesta el deck. Son dos clases distintas de número.
 *
 * `1.25` = avisar cuando lo real se pasa **un cuarto** de lo estimado. Con eso, el caso del
 * 24/08 —158 s reales contra 60 estimados, factor **2,6**— habría gritado en la primera corrida
 * después de cablear `L-046`, no tres semanas después.
 */
var FACTOR_AVISO_DESVIO_ = 1.25;

function reiniciarMedicionDeEstimaciones_() {
  ESTIMADO_POR_ETAPA_ = {};
  ACUMULADO_POR_ETAPA_ = [];
}

/** Las duraciones REALES por etapa, derivadas de los acumulados — que es como se leen a mano. */
/** Los segundos REALES de una etapa por nombre. `0` si esa etapa no corrió — que es un dato. */
function segundosDeEtapa_(nombre) {
  var m = duracionPorEtapa_().filter(function (d) { return d.etapa === nombre; });
  return m.length ? m[0].seg : 0;
}

function duracionPorEtapa_() {
  var out = [];
  var previo = 0;
  ACUMULADO_POR_ETAPA_.forEach(function (m) {
    out.push({ etapa: m.etapa, seg: m.acumulado - previo, acumulado: m.acumulado });
    previo = m.acumulado;
  });
  return out;
}

/**
 * ⭐ **El control: estimado contra real, más el cierre contra la reserva.**
 *
 * Devuelve una lista de avisos. **Vacía es un resultado**, y el reporte lo dice con el conteo:
 * *«0 de N estimaciones desviadas»* distingue *«ninguna se pasó»* de *«no se midió nada»*, que
 * es la mitad barata de todo control (`CLAUDE.md` §4).
 */
function desviosDeEstimacion_(cierreSeg, reservaSeg) {
  var avisos = [];
  var reales = duracionPorEtapa_();
  var porNombre = {};
  reales.forEach(function (r) { porNombre[r.etapa] = r.seg; });

  var medidas = 0;
  Object.keys(ESTIMADO_POR_ETAPA_).forEach(function (etapa) {
    var reg = ESTIMADO_POR_ETAPA_[etapa];
    if (!reg || !reg.suma) return;
    if (!(etapa in porNombre)) return;   // el control corrió y la etapa no: no hay par que comparar
    medidas++;
    var real = porNombre[etapa];
    /* ⭐ **La comparación es acumulado contra acumulado.** En una etapa partida, `suma` es lo que
     * los N checkpoints declararon para las N unidades que corrieron, y `real` lo que costaron
     * todas. Comparar una unidad contra el total da un factor que no significa nada — ver el
     * comentario de `controlDeEtapa_`. */
    if (real > reg.suma * FACTOR_AVISO_DESVIO_) {
      var unidades = reg.veces > 1 ? ' en ' + reg.veces + ' unidad(es), o sea ' +
        (Math.round((reg.suma / reg.veces) * 10) / 10) + ' s cada una' : '';
      avisos.push('⚠ la etapa "' + etapa + '" se estimó en ' + reg.suma + ' s' + unidades +
        ' y costó ' + real + ' s (×' + (Math.round((real / reg.suma) * 10) / 10) + '). **La ' +
        'estimación está vieja**: se calibró con un informe más chico. Recalibrarla es una celda ' +
        'de `CONFIG`, y el comentario de `Generador.gs` dice con qué se midió la anterior.');
    }
  });

  /* ⛔ El cierre es el caso más caro y no tiene punto de control: **si la reserva no lo cubre, el
   * corte ordenado muere en el muro y no deja nada**, que es justo lo que la reserva evita. */
  /* El cierre lo evalúa `avisoDeReserva_`, que es la dueña del criterio — **no se duplica acá**.
   * Vivió desde el 21/08 sin un solo llamador; éste es. */
  if (cierreSeg > 0 && reservaSeg > 0) {
    medidas++;
    var aviso = avisoDeReserva_(cierreSeg, reservaSeg);
    if (aviso) avisos.push(aviso);
  }

  return { avisos: avisos, medidas: medidas, reales: reales };
}

/**
 * ⭐ **La etapa 2 no tiene estimación, así que se mide por unidad de trabajo.**
 *
 * Pedido del usuario el 24/08: *«son 61 s de mapa token→objectId y no la miramos nunca. Medila de
 * paso: si crece con la cantidad de tokens, va a ser el próximo»*.
 *
 * **No se le pone un techo** —eso sería inventar la cuarta constante—: se publica el **costo por
 * token**, que es lo único comparable entre corridas con decks de distinto tamaño. Dos corridas
 * con 61 s y 400 tokens contra 61 s y 200 tokens dicen cosas opuestas, y el total solo no las
 * distingue.
 */
function costoDelMapa_(segundos, tokens) {
  if (!segundos || !tokens) return '';
  return 'etapa 2 (mapa token→objectId): ' + segundos + ' s para ' + tokens + ' token(s) distinto(s) = ' +
    Math.round((segundos / tokens) * 1000) + ' ms/token — ⚠ sin techo declarado a propósito. ' +
    'Es la medición base para saber si crece con el deck.';
}

function controlDeEtapa_(reloj, etapa, estimadoSeg, clase, contexto) {
  /* ⭐ El estimado se guarda ACA y no donde se decide entrar, y es a proposito: este es el
   * unico lugar por el que pasan todos los controles, asi que ninguno se puede olvidar de
   * declarar lo que estimo. Un registro que hay que acordarse de llenar no se llena. */
  var chequeo = entraEnElPresupuesto_(reloj, estimadoSeg);
  var chequeoEntra = chequeo.entra;
  /* ⛔⛔ `2026-08-24`, corregido en la primera corrida — **se ACUMULA, no se pisa.**
   *
   * La primera versión hacía `ESTIMADO_POR_ETAPA_[etapa] = estimadoSeg`, y en una etapa que
   * chequea **una vez por unidad** eso deja el estimado de la ÚLTIMA. La corrida de las 17:33 lo
   * mostró de inmediato: la etapa 4 avisó *«se estimó en 1 s y costó 33 s (×33)»* — **el 1 era la
   * estimación de la última lámina y los 33 el total de todas**. La semilla de 30 estaba bien; lo
   * que estaba mal era la comparación.
   *
   * ⚠ **Y el mismo defecto tenía la etapa 3 desde el minuto uno**, que también chequea por unidad.
   * No se había visto porque nunca disparó — un control que no se ejecuta no está probado.
   *
   * ⭐ **Sólo se suma lo que efectivamente ENTRÓ.** El checkpoint que corta declara un estimado
   * para una unidad que no corre: sumarlo compararía N+1 estimaciones contra N unidades de
   * trabajo, que es el mismo error con el signo cambiado. */
  if (estimadoSeg && chequeoEntra) {
    if (!ESTIMADO_POR_ETAPA_[etapa]) ESTIMADO_POR_ETAPA_[etapa] = { suma: 0, veces: 0 };
    ESTIMADO_POR_ETAPA_[etapa].suma += estimadoSeg;
    ESTIMADO_POR_ETAPA_[etapa].veces++;
  }
  if (chequeo.entra) return null;

  contexto = contexto || {};
  clase = clase || CORTE_PRESUPUESTO_;

  var motivo = (clase === CORTE_ARRANQUE_)
    ? 'el arranque de la corrida —anclaje, unión digital y duplicación— gastó ' + chequeo.gastado +
      ' s y el techo útil es ' + (reloj.presupuesto - reloj.reserva) + ' s (techo ' + reloj.presupuesto +
      ' menos reserva ' + reloj.reserva + '). **El arranque no entra en el techo**: no es que la ' +
      'corrida se haya quedado sin tiempo en el medio, es que no tenía con qué empezar. Lo destraba ' +
      'subir el techo o partir el arranque, no correr de nuevo.'
    : 'la etapa "' + etapa + '" se estimó en ' + estimadoSeg + ' s y quedaban ' + chequeo.disponible +
      ' s por encima de la reserva';

  return {
    etapa: etapa,
    clase: clase,
    item: contexto.item || '',
    items_emitidos: contexto.items_emitidos || 0,
    items_sin_emitir: contexto.items_sin_emitir || 0,
    segundos: chequeo.gastado,
    disponible_seg: chequeo.disponible,
    estimado_seg: estimadoSeg,
    motivo: contexto.motivo || motivo
  };
}

/**
 * ⭐ **Qué etapas declaradas tienen efectivamente su control en el flujo.** Es el control
 * positivo de la Parte B.4: se saca una llamada a `controlDeEtapa_` y esta función lo dice.
 *
 * Lee el **código fuente** de las dos funciones que llevan el flujo (`Function.prototype
 * .toString`), no su comportamiento: un control que se pregunta *"¿cortó?"* necesitaría una
 * corrida real de seis minutos por etapa, y eso no es un control que alguien vaya a correr.
 *
 * Devuelve `{ etapas: [{etapa, tiene}], con_control, total }` — **con el `n de m` adentro**,
 * porque «ningún problema» y «no se probó nada» se ven idénticos en un log sin conteo.
 */
function controlPorEtapa_(fuenteOpcional) {
  // El parámetro existe **sólo para el control negativo** de la Parte B: sin él no habría forma
  // de probar que este instrumento sabe decir «no». Un instrumento que siempre dice «sí» y del
  // que nadie vio un «no» no es evidencia de nada.
  var fuente = (typeof fuenteOpcional === 'string')
    ? fuenteOpcional
    : String(generarInformeConCache_) + '\n' + String(duplicarBloquesRepetibles_);
  var etapas = ETAPAS_CON_CONTROL_.map(function (nombre) {
    var patron = new RegExp("controlDeEtapa_\\(\\s*reloj\\s*,\\s*'" +
      nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'");
    return { etapa: nombre, tiene: patron.test(fuente) };
  });
  return {
    etapas: etapas,
    con_control: etapas.filter(function (e) { return e.tiene; }).length,
    total: etapas.length
  };
}

/**
 * ⚠ **A.4 — la reserva tiene que cubrir el cierre COMPLETO**: barrida, `FALTANTES`, `CORRIDAS`
 * y sello. Si no lo cubre, el corte ordenado igual muere en el muro y toda la maquinaria de
 * corte no sirve para nada.
 *
 * **No se elige un número: se mide el cierre y se compara.** `presupuesto.cierre_seg` sale de
 * cada corrida y este aviso es lo que hace que un desajuste se vea en vez de descubrirse la
 * próxima vez que la corrida muera en el muro.
 */
/* ⛔⛔ `2026-08-24` — **el aviso estaba conectado y se quedó callado igual, y ese es el punto.**
 *
 * Vive en `presupuesto.aviso_reserva` desde el 21/08 y se evalúa en cada corrida. El 24/08 el
 * cierre costó **25 s** contra una reserva de **30** y **no dijo nada** — porque su criterio era
 * `cierreSeg <= reservaSeg`. **Un aviso que existe, corre y calla es peor que uno que falta**: el
 * que falta deja el terreno libre, éste da la impresión de que alguien está mirando.
 *
 * ⛔⛔ **Por qué el criterio estaba mal, y sólo se ve leyendo de dónde salió el 30.** El comentario del reloj lo dice: `30` = cierre medido en **0,8 s** + **barrida ~6 s** +
 * margen por varianza de `tokensPorSlide_` (**10,8 s y 26,9 s el mismo día**). O sea que la
 * reserva **no es el presupuesto del cierre: es el del cierre MÁS dos cosas más**.
 *
 * Con `cierreSeg <= reservaSeg` no avisaba, y **el 24/08 el cierre costó 25 contra una reserva de
 * 30**: no avisó, y sin embargo ya no entraba —25 + 6 de barrida + varianza pasa 30 sin
 * discusión—. **Un umbral que sólo mira una de las tres partes deja pasar el caso que importa.**
 */
function avisoDeReserva_(cierreSeg, reservaSeg) {
  if (!(cierreSeg > 0) || !(reservaSeg > 0)) return '';
  /* El `0,8` no es un número elegido: es *«el cierre solo ya se come el 80 % de una reserva que
   * tiene que cubrir tres cosas»*. Con 30 de reserva dispara a los 24 s, y el caso del 24/08
   * —25 s— habría gritado. */
  if (cierreSeg <= reservaSeg * 0.8) return '';
  var minimo = Math.ceil((cierreSeg + 6 + 27) / 10) * 10;
  return '⛔ LA RESERVA YA NO CUBRE EL CIERRE: costó ' + cierreSeg + ' s y ' +
    '`CONFIG.reserva_cierre_seg` es ' + reservaSeg + ' s. ⚠ **La reserva no es sólo el cierre**: ' +
    'se derivó como cierre + barrida (~6 s) + margen por varianza de `tokensPorSlide_` (10,8 s y ' +
    '26,9 s el mismo día). Un corte ordenado que no entra en la reserva **muere en el muro y no ' +
    'deja nada escrito** — ni la causa. Subir `reserva_cierre_seg` a por lo menos ' + minimo + '.';
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
/**
 * ⭐⭐ `2026-08-24` (`D-40`) — **agrupa los tokens fijos POR LÁMINA, que es la unidad de partición.**
 *
 * `tokensVisiblesDe_` devuelve `{token: [nº de slide, …]}`; acá se invierte. **Un token que
 * aparece en varias láminas se asigna a la PRIMERA**, y no es un detalle: si se asignara a todas,
 * la segunda lámina lo volvería a resolver —mismo valor, doble costo— y, peor, **podría
 * resolverlo en otra tanda y publicar dos valores distintos del mismo token en el mismo deck**.
 * Con la primera, el token se resuelve una vez y `replaceAllText` lo pinta en todas sus cajas de
 * una pasada, que es lo que ya hacía.
 *
 * ⚠ **El orden es por número de lámina** y no por cantidad de tokens: el deck se lee de adelante
 * hacia atrás, así que si la corrida corta, lo que queda sin pintar es **el final del deck** y no
 * una lámina salteada del medio. Un corte que deja huecos alternados es más difícil de leer que
 * uno que deja una cola.
 */
function agruparTokensPorLamina_(tokensFijos) {
  var porLamina = {};
  Object.keys(tokensFijos).sort().forEach(function (token) {
    var slides = tokensFijos[token] || [];
    if (!slides.length) return;
    var primera = slides.slice().sort(function (a, b) { return a - b; })[0];
    if (!porLamina[primera]) porLamina[primera] = [];
    porLamina[primera].push(token);
  });
  return Object.keys(porLamina)
    .map(function (n) { return { slide: Number(n), tokens: porLamina[n] }; })
    .sort(function (a, b) { return a.slide - b.slide; });
}

/**
 * El costo de **una lámina** de la etapa 4. Es la **semilla** de la primera: a partir de ahí se
 * mide y se adapta, igual que `costoUltimoItemSeg` en la etapa 3.
 *
 * ⛔ **No es un tamaño de lote**, y la diferencia es la que el usuario pidió que no se pierda: el
 * presupuesto decide **cuántas láminas entran**, y eso sale de comparar lo que quedó de reloj
 * contra lo que costó la última. Un número fijo de marcadores por lote sería la cuarta constante
 * que nadie vuelve a mirar.
 */
function costoLaminaEtapa4Seg_() {
  var valor = Number(leerConfig().costo_lamina_etapa4_seg);
  return isNaN(valor) || valor <= 0 ? COSTO_LAMINA_ETAPA4_SEG_DEFECTO_ : valor;
}

/**
 * Acumula el resultado de resolver una lámina sobre el de las anteriores.
 *
 * ⚠ Existe porque la etapa 4 pasó de **una** llamada a **N**: quedarse con la última haría que el
 * reporte dijera que la etapa resolvió sólo la última lámina, y `resumen` se lee como el total.
 */
function acumularResolucion_(previa, nueva) {
  if (!previa || !previa.resultados) return nueva;
  var out = { ok: nueva.ok !== false && previa.ok !== false, informe_id: nueva.informe_id,
    resultados: previa.resultados.concat(nueva.resultados), resumen: {} };
  [previa.resumen || {}, nueva.resumen || {}].forEach(function (r) {
    Object.keys(r).forEach(function (k) {
      out.resumen[k] = (typeof r[k] === 'number') ? (Number(out.resumen[k] || 0) + r[k]) : r[k];
    });
  });
  return out;
}

/**
 * Pinta los tokens fijos de **una** lámina. Es el cuerpo que antes vivía dentro del `forEach`
 * único de la etapa 4; se extrajo **sin cambiarle una decisión** para poder llamarlo por lámina.
 *
 * ⚠ Los contadores entran por `ctx` en vez de cerrarse sobre las variables de `generarInforme`:
 * así la función es llamable desde un banco sin montar media corrida.
 */
function pintarTokensFijosDeLamina_(tokens, ctx) {
  tokens.forEach(function (token) {
    var resultado = ctx.porMarcador[token];

    // `{{periodo}}` lo produce la generación, no un marcador: es el encabezado de la lámina
    // y sale del período que **efectivamente se usó** (`B.5`). Si alguien le carga una fila
    // en `MARCADORES`, esa fila gana — la hoja de registro manda sobre el default.
    if (!resultado && token === 'periodo') {
      ctx.presentacion.replaceAllText('{{' + token + '}}', ctx.periodoLamina, true);
      ctx.contadores.sumarReemplazado(token);
      return;
    }

    if (resultado && resultado.estado === 'ok') {
      ctx.presentacion.replaceAllText('{{' + token + '}}', String(resultado.valor_formateado), true);
      ctx.contadores.sumarReemplazado(token);
      // `R-18` punto 3 — un valor que el catálogo rechazó **no llega al deck**, pero tampoco
      // puede desaparecer: va a `FALTANTES` con su fila **aunque el token haya publicado bien
      // el resto**. Sin esto, una lista que publica cuatro de cinco se ve idéntica a una que
      // publica los cinco, y el barrio que falta no lo reclama nadie.
      if (resultado.rechazados && resultado.rechazados.length) {
        ctx.faltantes.push({
          corrida_id: ctx.corridaId,
          informe_id: ctx.informeId,
          token: token,
          base_id: resultado.base_id || '',
          solapa: resultado.solapa || '',
          campo_logico: '',
          motivo: 'fuera del catálogo, NO publicado(s): ' + resultado.rechazados.join(' | ') +
            ' — el token publicó los que sí matchean',
          // No es `escritor`: acá el token SÍ se pintó. Lo que falta es parte del contenido, y
          // manda a mirar el catálogo — otro oficio, otra causa.
          causa: 'fuera_catalogo'
        });
      }
      return;
    }

    // `fila` se resuelve ANTES de pintar: el símbolo sale de su `estado`, y el motivo de
    // `FALTANTES` sale de la misma variable. Un solo lector para las dos cosas.
    var fila = ctx.porMarcador[token];
    ctx.presentacion.replaceAllText('{{' + token + '}}', textoFaltante_(token, fila, ctx.conSimbolos), true);
    ctx.faltantes.push({
      corrida_id: ctx.corridaId,
      informe_id: ctx.informeId,
      token: token,
      base_id: fila ? (fila.base_id || '') : '',
      solapa: fila ? (fila.solapa || '') : '',
      campo_logico: '',
      motivo: fila
        ? (fila.estado + ': ' + fila.traza)
        : 'sin fila en MARCADORES — el token está en la plantilla y nadie lo cableó',
      causa: causaDeResultado_(fila)
    });
  });
}

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
  /* ⭐ `2026-08-24` — **`detalle` contesta la pregunta que el diagnóstico venía haciendo.**
   * Hasta hoy `descartados` era una lista de nombres y el aviso de crudos preguntaba *«¿lámina
   * escondida?»*. La respuesta ya estaba acá y se tiraba: por cada token descartado, **en qué
   * slides aparece**, todas escondidas por construcción. Un diagnóstico que pregunta lo que el
   * motor ya sabe manda a alguien a averiguarlo a mano. */
  var detalle = {};
  descartados.forEach(function (t) { detalle[t] = porSlide[t] || []; });
  return { tokens: visibles, descartados: descartados.sort(), detalle: detalle };
}

/**
 * La barrida final: ningún `{{token}}` crudo sobrevive a una corrida, se haya cortado o no.
 *
 * Reusa el mapa de la etapa 2 —`mapaTokenObjectId_` devuelve los mismos tokens que
 * `tokensPorSlide_`, verificado el 06/08: 195 y 195— porque re-escanear el deck cuesta
 * 10-27 s y leer el mapa cuesta cero. Si el corte llegó antes de la etapa 2 no hay mapa, y
 * ahí sí se escanea; el retorno dice por cuál de los dos caminos fue.
 */
/**
 * `2026-08-20_9` Parte A.1 — **el símbolo del corte.**
 *
 * ⭐ **Un token que no se resolvió porque la corrida se cortó NO es `/////`.** Los dos casos se ven
 * igual en el papel y mandan a trabajos opuestos: `/////` manda a **cablear**, el corte manda a
 * **correr de nuevo**. Medido en la corrida del 20/08 a las 15:45: de **269 `/////`, 264 eran del
 * corte** — el deck afirmaba *"nadie cableó esto"* sobre 264 tokens que estaban cableados y que la
 * corrida no alcanzó a mirar. **Es el número plausible y equivocado, en versión símbolo.**
 *
 * ⭐⭐ **ELEGIDO por el usuario el 24/08/2026: `»»»`.** Los tres criterios con que se eligió, para
 * que un cambio futuro los tenga que contestar de nuevo:
 *
 *   1. **Manda a un trabajo y a uno solo** — *«corré de nuevo»*, contra el *«andá a cablear»* de
 *      `/////`. Es la pregunta que `CLAUDE.md` §4 exige al agregar cualquier símbolo.
 *   2. **Se distingue a tamaño chico** de los otros tres —`/////` falta cablearlo, `---` falló,
 *      `-` sin dato—. `···` fue la segunda opción y se descartó por parecerse a `---`.
 *   3. **La dirección se lee como «esto sigue en la próxima corrida»**, que es literalmente lo que
 *      hace el desatendido.
 *
 * ⛔⛔ **Y la regla de asignación importa MÁS que el glifo, porque tiene un borde que no se ve.**
 * NO es *«todo lo crudo después del corte»*: un token **sin fila en `MARCADORES`** tiene que
 * seguir saliendo `/////` **aunque la corrida haya cortado**. Si no, el símbolo nuevo **tapa el
 * cableado que falta** y el deck deja de mandar a cablear justo donde hay que cablear.
 *
 *   `sin_fila`  →  `/////`      ·      crudo + corte + **tiene fila**  →  `»»»`
 *
 * La distinción ya existe en la columna `causa` de `FALTANTES` desde el `2026-08-23_1`; acá se
 * resuelve con el conjunto de marcadores del informe, que ya está cacheado.
 */
var SIMBOLO_CORTE_ = '»»»';

/**
 * `2026-08-20_10` A.0 — **el sello de en-proceso, en el nombre del archivo.**
 *
 * Va adelante y no atrás porque el nombre se lee de izquierda a derecha en la lista de Drive, y la
 * pregunta *«¿este deck está listo?»* tiene que contestarse **antes** de leer el nombre entero.
 *
 * **Con sello y con crudos = checkpoint. Sin sello y con crudos = motor roto.** Lo quita el
 * cierre, que es el único que sabe que la corrida terminó — no la última ejecución, que no puede
 * distinguir *"terminé yo"* de *"me quedé sin presupuesto"*.
 */
var SELLO_EN_PROCESO_ = '[en proceso] ';

/**
 * ⭐ Los tokens del informe que **tienen fila en `MARCADORES`**, como conjunto.
 *
 * Es lo que separa `»»»` de `/////` en la barrida. Lee del mismo `leerMarcadores_()` que resuelve
 * la corrida —cacheado por corrida—, así que no agrega una lectura: **la pregunta ya estaba
 * contestada, sólo no se le preguntaba a nadie.**
 */
function tokensConFilaDe_(informeId) {
  var set = {};
  try {
    leerMarcadores_().forEach(function (m) {
      var suyo = String(m.informe_id || '').trim();
      if (suyo === informeId || suyo === '*') set[String(m.marcador || '').trim()] = true;
    });
  } catch (e) {
    /* ⚠ Sin la lista no se inventa una: se devuelve `null` y la barrida cae al comportamiento
     * viejo —todo `/////`—, que es el conservador. Marcar `»»»` sobre un conjunto que no se pudo
     * leer diría *«esto está cableado»* sin haberlo verificado. */
    return null;
  }
  return set;
}

function barrerTokensNoAlcanzados_(presentacion, tokensDelMapa, conSimbolos, huboCorte, tokensConFila) {
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
    // `null` como resultado, y es la verdad y no un atajo: acá sólo hay el nombre del token.
    // Un token que la barrida alcanza es, por definición, uno que la corrida NO llegó a
    // resolver —cortó por presupuesto o murió antes—, así que no existe un `estado` para él ni
    // aunque le pasáramos el mapa entero. Su único símbolo posible es `/////`, y eso se dice
    // pasando `null` en vez de inventarle un estado (`2026-08-20_1` Parte 0 punto 2).
    // Con corte, el texto sale del símbolo del corte y no del mapeo por estado: acá no hay
    // resultado que mirar y **la causa se sabe** — no es que nadie lo cableó, es que no se llegó.
    /* ⛔ **El borde de la regla, y es lo que evita que el símbolo nuevo tape el cableado que
     * falta:** `»»»` sólo va si el token **tiene fila**. Sin fila, el corte es irrelevante — el
     * token no se habría resuelto igual, y el trabajo que manda a hacer sigue siendo cablearlo.
     * ⚠ Sin `tokensConFila` no se adivina: se cae al comportamiento viejo, que es el conservador. */
    var tieneFila = tokensConFila ? !!tokensConFila[token] : true;
    var texto = (huboCorte && conSimbolos === true && tieneFila)
      ? SIMBOLO_CORTE_
      : textoFaltante_(token, null, conSimbolos);
    var n = presentacion.replaceAllText('{{' + token + '}}', texto, true);
    if (n > 0) barridos.push(token);
  });
  return { barridos: barridos, origen: origen };
}

/* ═══════════ `2026-08-23_1` Parte C — el aviso de crudos, con causa ═══════════════════════
 *
 * ⛔ **Hasta hoy, un token que quedó crudo sin corte y sin excepción salía con UN solo texto:**
 * *«⚠ quedó crudo en el deck sin que hubiera corte por tiempo — revisar»*. Ese aviso era
 * **correcto** y **no decía nada accionable**, porque tapa tres situaciones que mandan a tres
 * oficios distintos:
 *
 *   - **no tiene fila** → cablear;
 *   - ⛔ **tiene fila, resolvió con valor, y el escritor no lo pisó** → es un bug del escritor;
 *   - **tiene fila y falló al resolver** → mirar la traza.
 *
 * ⭐ **El del medio es el que no existía y es el que importa.** Un token que resuelve y no se
 * escribe **no aparece en `FALTANTES` por el camino normal** —los dos puntos que pintan vuelven
 * antes de empujar la fila— **ni se distingue en el deck**, donde su hueco se ve igual que
 * cualquier otro. Era el único de los tres modos de falla que no dejaba rastro en ningún lado.
 *
 * **El caso real contra el que se probó:** el 23/08, `camp_remitente` y `camp_titulo` salieron con
 * ese texto **teniendo fila los dos**. El aviso era correcto para ambos y seguía sin decir por qué.
 *
 * ⚠ **Es la misma familia que el `/////` que mentía sobre la causa** (`CLAUDE.md` §4): el símbolo
 * no miente sobre un valor, miente sobre **por qué no hay valor** — y las causas mandan a trabajos
 * opuestos. Acá, a *cablear* contra *arreglar el escritor*.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/**
 * Los tokens que **tienen fila en `MARCADORES`** para este informe.
 *
 * ⚠ **El filtro es EL MISMO que usa `resolverMarcadores`** —`informe_id === informeId || '*'`— y
 * eso no es una coincidencia que se pueda dejar librada: un diagnóstico que filtre distinto diría
 * *«sin fila»* sobre un token que el resolvedor sí ve, y mandaría a cablear algo que ya está
 * cableado. Es la regla del control positivo que **comparte camino**: sirve porque mira lo mismo.
 * Si algún día cambia el criterio de allá, tiene que cambiar acá.
 *
 * ⚠ **Y si no se puede leer, lo dice en vez de contestar.** Corre en el cierre, después de que la
 * corrida ya pudo morir; `leerMarcadores_()` puede tirar. Un `catch` que devolviera el conjunto
 * vacío haría que **todos** los crudos salieran «nadie lo cableó» — un diagnóstico falso y
 * dramático, exactamente del tipo que manda a borrar configuración.
 */
function tokensConFilaEnMarcadores_(informeId) {
  try {
    var set = {};
    leerMarcadores_().forEach(function (m) {
      var suyo = String(m.informe_id || '').trim();
      if (suyo !== informeId && suyo !== '*') return;
      set[String(m.marcador).trim()] = true;
    });
    return { ok: true, tokens: set };
  } catch (e) {
    return { ok: false, tokens: {}, motivo: String((e && e.message) ? e.message : e) };
  }
}

/** Un valor largo no puede comerse la celda del motivo: es evidencia, no el dato. */
function recorteDeValor_(valor) {
  var texto = String(valor == null ? '' : valor);
  return texto.length > 120 ? texto.slice(0, 117) + '…' : texto;
}

/**
 * Un token que la barrida encontró crudo **sin corte y sin excepción** → `{ causa, motivo }`.
 *
 * `resultado` es lo que dejó la resolución de la etapa 4 para ese token, o `undefined`.
 * `conFila` es lo que devuelve `tokensConFilaEnMarcadores_`.
 */
function diagnosticoDeCrudo_(token, resultado, conFila, escondidas) {
  // Sin poder leer `MARCADORES` no se afirma nada sobre el cableado: se dice que no se sabe.
  if (!conFila.ok) {
    return {
      causa: 'sin_clasificar',
      motivo: '⚠ quedó crudo sin corte por tiempo, y NO se pudo leer MARCADORES para decir por qué: ' +
        conFila.motivo
    };
  }

  if (conFila.tokens[token] !== true) {
    return {
      causa: 'sin_fila',
      motivo: 'quedó crudo y no tiene fila en MARCADORES para este informe — nadie lo cableó'
    };
  }

  /* ⛔⛔ `2026-08-24` — **la quinta causa, y nace de la primera corrida del particionado.**
   *
   * `camp_titulo` salió como *«tiene fila y la corrida NO lo resolvió»* con **14 apariciones** en
   * el `mapa_tokens`, que es una combinación que no cierra: un token en 14 láminas que nadie mira.
   *
   * ⭐ **La respuesta es que las 14 están ESCONDIDAS.** La etapa 4 resuelve `tokensVisiblesDe_`, y
   * un token cuyas apariciones son todas de láminas escondidas queda **legítimamente** afuera:
   * `L-048` está escondida por decisión del usuario (`D-39`) y su único token con fila es
   * justamente `camp_titulo`. **No hay nada que arreglar** — el token no se publica.
   *
   * ⚠ **Por qué aparece recién ahora, y es un efecto de este mismo prompt:** antes la etapa 4
   * resolvía **todos** los marcadores del informe, así que `porMarcador` tenía entrada para
   * `camp_titulo` aunque su lámina estuviera escondida, y el diagnóstico no se disparaba. Con
   * `solo_marcadores` por lámina **deja de resolverse**, que es correcto y más barato. Lo que
   * cambió no es el deck —idéntico— sino **qué se puede afirmar sobre él**.
   *
   * ⛔ **Y es la regla de los símbolos aplicada a las causas:** `no_alcanzado` tapaba dos
   * situaciones que mandan a trabajos **opuestos** —*está escondida, no hagas nada* contra *quedó
   * fuera por un bug, mirá por qué*—. Si dos causas piden acciones distintas, falta una causa. */
  if (!resultado && escondidas && escondidas[token]) {
    var slides = escondidas[token];
    return {
      causa: 'solo_escondidas',
      motivo: 'tiene fila y NO se resolvió, y está bien: sus ' + slides.length + ' aparición(es) ' +
        'están TODAS en láminas escondidas (slide' + (slides.length > 1 ? 's' : '') + ' ' +
        slides.join(', ') + '). No se publica, así que no hay nada que hacer. ⚠ NO es un bug del ' +
        'escritor ni un token sin cablear.'
    };
  }

  if (!resultado) {
    /* La cuarta situación, que el prompt no nombra y existe igual: el token TIENE fila y la
     * resolución nunca lo miró, sin que hubiera corte ni excepción. Pasa cuando queda fuera del
     * conjunto que la etapa 4 resuelve —una lámina escondida, un bloque modelo que no se expandió—.
     * No es «nadie lo cableó» y no es «falló»: **es que no se lo alcanzó**, y el oficio es mirar
     * por qué quedó fuera. Meterlo en cualquiera de los otros dos mandaría al trabajo equivocado. */
    return {
      causa: 'no_alcanzado',
      motivo: '⚠ tiene fila en MARCADORES y la corrida NO lo resolvió, sin corte ni excepción — ' +
        'quedó fuera del conjunto que se resuelve (¿lámina escondida? ¿bloque modelo sin expandir?)'
    };
  }

  var estado = String(resultado.estado || '');
  if (estado === 'ok') {
    /* ⛔ El del medio. **Tiene fila, resolvió con valor, y el deck salió crudo igual.** El motivo
     * lleva el valor adentro a propósito: es la evidencia de que había qué escribir, y sin ella el
     * aviso se lee como una sospecha. */
    return {
      causa: 'escritor',
      motivo: '⛔ tiene fila y RESOLVIÓ con valor ("' + recorteDeValor_(resultado.valor_formateado) +
        '"), y el escritor no lo pisó — es un bug del escritor, no del cableado'
    };
  }

  return {
    causa: causaDeResultado_(resultado),
    motivo: 'tiene fila y no publicó — ' + estado + ': ' + resultado.traza
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
 * `_27` bloque 1.2 — `opciones` es el tercer parámetro y es **opcional**, y por eso no
 * reemplaza a `periodoId`: los dos llamadores que ya existen —el ítem de menú y la API— siguen
 * llamando con uno o dos argumentos y no cambia nada para ellos. Un objeto de opciones que
 * además absorbiera `periodoId` habría obligado a tocar los dos caminos por una opción de
 * presentación.
 *
 * **Las claves son dos**: `faltantes_como_raya` y `secciones`. (El comentario decía "una sola"
 * hasta el 20/08 — `secciones` entró después y nadie lo actualizó. Un comentario no falla
 * nunca, que es por lo que `CLAUDE.md` §4 los manda abrir cuando afirman un contrato.)
 *
 * ⚠ **`faltantes_como_raya` ya no elige una raya** (`2026-08-20_1`): elige el juego de cuatro
 * símbolos —`/////`, `---`, `-`— contra el crudo `«FALTA:token»`. **La clave conserva el
 * nombre a propósito**, porque es formato de cable y la API invoca a esta función por nombre;
 * renombrarla rompería a un llamador que no vive en este repo. Lo que declara el modo hacia
 * afuera es `presentacion_faltantes`, y ése **sí** cambió de valor: `'simbolos'`.
 */
function generarInforme(informeId, periodoId, opciones) {
  /* `2026-08-21_1` A.3 — **el cronómetro arranca en la primera línea de la ejecución.** Antes
   * arrancaba adentro de `generarInformeConCache_`, después de abrir los dos cachés. Medido, la
   * diferencia es de milésimas y **no es la causa de nada**; se mueve igual porque un reloj que
   * arranca después del gasto real es una premisa que hay que volver a verificar cada vez. */
  var t0Corrida = new Date().getTime();
  abrirCacheRegistros_();
  // `2026-08-20_11` — y el de los datos crudos de las solapas de las bases, que es el que se lleva
  // los 200 s de la pasada por ítem: `leerFuente` se llama una vez por MARCADOR y hasta hoy cada
  // llamada releía la solapa entera. Mismo `try/finally` y mismo alcance que el otro.
  abrirCacheDatosHoja_();
  try {
    return generarInformeConCache_(informeId, periodoId, opciones, t0Corrida);
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
}

function generarInformeConCache_(informeId, periodoId, opciones, t0Corrida) {
  opciones = opciones || {};
  /* `2026-08-21_5` — **el modo lo resuelve `modoFaltantesDe_`, no este llamador.** Acá vivía
   * `opciones.faltantes_como_raya === true`, que hacía del crudo el default por omisión; el motivo
   * y la medición están arriba de esa función.
   *
   * ⚠ La clave del pedido sigue llamándose `faltantes_como_raya` y **no se renombra**:
   * `generarInforme` es invocable por la API por nombre (`fn=generarInforme`, `Api.gs`), así que esa
   * clave es formato de cable y cambiarla rompería a un llamador que no está en este repo. El
   * nombre local sí dice lo que la opción significa desde el `2026-08-20_1`: no elige una raya,
   * elige el juego de cuatro símbolos contra el crudo. */
  var modoFaltantes = modoFaltantesDe_(opciones);
  var conSimbolos = modoFaltantes.simbolos;
  // T2.1.1 — el reloj es el único de la corrida. Ojo: la plataforma cuenta desde `doPost` o
  // desde el trigger del menú, no desde esta línea; lo que gasta el llamador antes de entrar
  // ya está descontado en el default de `presupuesto_corrida_seg`.
  // `2026-08-21_1` A.3 — el `t0` viene de la primera línea de `generarInforme`.
  var reloj = relojDeCorrida_(t0Corrida);
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

  /* ── `2026-08-20_10` Parte A · el deck deja de copiarse cuando se continúa ────────────────
   *
   * **Ausente → copia la plantilla, como siempre. Presente → escribe sobre ése.** Un llamador que
   * no conoce la opción no cambia de comportamiento, que es la condición de todo el mecanismo.
   *
   * ⭐ **A.0 — un deck a medio hacer se declara en el NOMBRE del archivo.** La corrida desatendida
   * rompe a propósito el invariante *«ningún `{{token}}` crudo sobrevive a una corrida»*: los
   * crudos son lo que hace que repintar sea inocuo. Pero entonces un deck intermedio abierto por
   * cualquiera **es indistinguible de un motor roto**. Con `SELLO_EN_PROCESO_` en el nombre es un
   * checkpoint; sin sello y con crudos, un error. **La distinción queda en lo primero que se ve,
   * sin abrir nada.**
   *
   * ⚠ Y el sello se pone SIEMPRE, no sólo en corridas desatendidas: una corrida normal que muere
   * por excepción también deja un deck a medio hacer, y hasta hoy salía con nombre de deck final.
   * Se lo quita el cierre, que es el único que sabe que terminó. */
  var deckId;
  var continuando = !!(opciones.deck_id && String(opciones.deck_id).trim());

  if (continuando) {
    deckId = String(opciones.deck_id).trim();
    try {
      DriveApp.getFileById(deckId);
    } catch (e) {
      return { ok: false, motivo: 'No se pudo abrir el deck a continuar (' + deckId + '): ' + e.message };
    }
  } else {
    var copia;
    try {
      copia = DriveApp.getFileById(informe.plantilla_id)
        .makeCopy(SELLO_EN_PROCESO_ + informe.nombre + ' — ' + periodoLamina, carpeta);
    } catch (e) {
      return { ok: false, motivo: 'No se pudo copiar la plantilla: ' + e.message };
    }
    deckId = copia.getId();
  }

  var presentacion = SlidesApp.openById(deckId);
  var corridaId = (continuando && opciones.corrida_id)
    ? String(opciones.corrida_id).trim()
    : informeId + '-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');

  // La fila se abre ACÁ, con el deck ya creado y antes de todo el trabajo pesado. Si la
  // corrida muere en el medio, queda una fila con `deck_id` y sin conteos — que es
  // exactamente el rastro que faltaba para poder diagnosticar.
  var filaCorrida = abrirCorrida_({
    corrida_id: corridaId,
    // `D-40` — qué TANDA es esta fila. Sin ella, saber qué lámina salió de qué momento exige
    // cruzar los `mapa_tokens` de N filas a mano, y nadie lo hace. `1` cuando no viene: una
    // corrida de un solo tiro es la tanda 1, no una tanda desconocida.
    ejecucion: (opciones && opciones.ejecucion) ? Number(opciones.ejecucion) : 1,
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
  RASTRO_ETAPAS_ = [];   // por corrida, no por ejecución del script  var tokensSoloEnEscondidas = {};
  reiniciarMedicionDeEstimaciones_();

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
  /* ⭐ `2026-08-20_10` A.3 — **la expansión es una FASE ATÓMICA y sólo la hace la ejecución 1.**
   *
   * ⚠ **El motivo, medido el 20/08: la expansión no es idempotente y no duplica — multiplica al
   * cuadrado.** `slidesModeloDe_` identifica una lámina modelo por **un solo criterio, que lleve
   * tokens crudos**, y `duplicarBloquesRepetibles_` **borra los modelos después de copiar**. En la
   * ejecución 2 ya no hay modelos, pero **las copias sin pintar todavía tienen crudos y son
   * indistinguibles de uno**: N ítems dan N láminas la primera vez y **N² la segunda**. Con 4
   * encuentros, 4 → 16, y cada ronda vuelve a multiplicar.
   *
   * ⭐ **Por qué atómica y global, y no `expandida` por sección:** marcar por sección deja viva la
   * ventana entre el `duplicate()` y el `remove()` — una ejecución que muere ahí devuelve la N².
   * Con la fase atómica **no hay ninguna decisión que tomar en la ejecución 2** sobre qué es
   * modelo y qué es copia, **porque nadie expande**. La ambigüedad desaparece en vez de
   * administrarse.
   *
   * **Si la corrida muere DURANTE la expansión, el deck se descarta y se empieza de nuevo:**
   * todavía no publicó nada, así que no hay checkpoint que perder. La fase atómica se paga con
   * eso y es barato — el `2026-08-20_11` midió que lo caro de esta etapa es **leer** (anclaje y
   * unión digital), no duplicar. */
  if (continuando && opciones.asignaciones) {
    expansion = { asignaciones: opciones.asignaciones, reporte: opciones.reporte_expansion || [] };
    Logger.log('expansión: NO se expande — se continúa con ' + expansion.asignaciones.length +
      ' asignación(es) del plan.');
  } else {
    /* ⭐ `2026-08-21_1` A.1 — **el primer punto de control, antes de la etapa más cara.**
     *
     * Hasta hoy la etapa 1 arrancaba sin preguntarle nada al reloj, y es la que se lleva el
     * arranque entero: anclaje, unión digital y una llamada a la API de Slides por cada
     * duplicación. Con el techo en 150 s eso se pasó sin que nada lo mirara.
     *
     * Se estima contra `CONFIG.costo_arranque_seg` y **no contra el costo de la expansión**,
     * que nadie midió: lo que se sabe caro es el arranque, y si ése ya no entra, la etapa no
     * tiene por qué empezar. El control fino —por sección, y el del arranque ya gastado— vive
     * adentro de `duplicarBloquesRepetibles_`, que es donde se puede medir de verdad. */
    corte = controlDeEtapa_(reloj, '1 · expandir secciones repetibles', costoArranqueSeg_());
    if (corte) {
      /* `D-21` — **ninguna sección desaparece en silencio, ni siquiera cuando no llegó a
       * mirarse ninguna.** Sin esto la expansión sale con el reporte vacío y el panel muestra
       * cero secciones repetibles, que se lee como *"este informe no tiene"* en vez de
       * *"no se llegó a expandir"*. Son dos cosas distintas y mandan a trabajos distintos. */
      expansion.reporte = seccionesRepetiblesDe_(informeId).map(function (s) {
        return {
          seccion: s.seccion_id, ok: true, omitida: true, items: [], excluidos: [],
          motivo: 'no se expandió: la corrida cortó ANTES de la etapa 1. ' + corte.motivo
        };
      });
    } else {
      expansion = duplicarBloquesRepetibles_(presentacion, informeId, ventana, opciones.secciones, reloj);
      // La expansión puede cortar adentro: por sección, o porque el arranque solo ya se pasó.
      if (expansion.corte) corte = expansion.corte;

      /* ⛔ `D-37` punto 5 — **un ítem sin ninguna lámina FRENA.** No es un caso a manejar: es un
       * invariante roto, y un deck a medias con un encuentro que desapareció en silencio es peor
       * que no tener deck. Se sale por `ok: false`, que es lo que ya usan las precondiciones — y
       * como esto pasa **antes** de pintar nada, el deck copiado no llegó a publicar. */
      if (expansion.invariante_roto) {
        var inv = expansion.invariante_roto;
        Logger.log('⛔ INVARIANTE ROTO (D-37 punto 5): ' + inv.motivo);
        return {
          ok: false,
          motivo: '⛔ La sección "' + inv.seccion + '" dejó al ítem "' + inv.item + '" sin ninguna ' +
            'lámina. ' + inv.motivo,
          invariante_roto: inv,
          deck: { id: deckId }
        };
      }
    }
  }

  /* ⭐ `2026-08-20_10` — **expandir todo y resolver una parte son dos cosas distintas, y hasta hoy
   * eran la misma.** `opciones.secciones` decide **qué se expande**; la corrida desatendida
   * necesita expandir TODO —fase atómica— y resolver **sólo lo que entra en esta ejecución**.
   *
   * Por eso el recorte del trabajo va acá, DESPUÉS de expandir, y por sección: el plan es por
   * sección (`_10` Parte B) y las asignaciones ya vienen etiquetadas con la suya.
   *
   * ⚠ **Ausente significa «todas», igual que `secciones`** — un llamador que no conoce la opción
   * resuelve todo, como siempre. */
  if (opciones.solo_secciones && expansion.asignaciones.length) {
    var pendientes = {};
    opciones.solo_secciones.forEach(function (id) { pendientes[String(id).trim()] = true; });
    var antes = expansion.asignaciones.length;
    expansion.asignaciones = expansion.asignaciones.filter(function (a) { return pendientes[a.seccion]; });
    Logger.log('chunk: se resuelven ' + expansion.asignaciones.length + ' de ' + antes +
      ' asignación(es) — secciones: ' + opciones.solo_secciones.join(', '));
  }

  /* `2026-08-21_1` A.1 — punto de control antes del mapa.
   *
   * ⚠ **Y el mapa se arma igual si el control corta, que no es una contradicción.** El mapa es
   * también el insumo de la barrida final: sin él, `barrerTokensNoAlcanzados_` re-escanea el
   * deck con `tokensVisiblesDe_`, que cuesta **lo mismo** (10-27 s). O sea que saltearlo no
   * ahorra un segundo, sólo mueve el gasto adentro de la reserva, que es el peor lugar posible.
   * Lo que el control decide acá es que **no arranquen las etapas 3 y 4**, no que el mapa no se
   * arme. */
  if (!corte) corte = controlDeEtapa_(reloj, '2 · mapa token→objectId', costoMapaSeg_());
  etapaEnCurso = marcarEtapa_(filaCorrida, '2 · mapa token→objectId', t0Etapas);
  // 2 · El mapa, ANTES de tocar un solo token.
  mapa = mapaTokenObjectId_(presentacion);

  // 3 · La pasada por ítem: cada slide emitida se pinta con **el contexto de su ítem** —
  //     el `id_cuenta` del encuentro, o la campaña con su propia ventana. Es lo que hace
  //     que `digital` deje de salir `«FALTA:…@digital_sin_cuenta»`.
  etapaEnCurso = marcarEtapa_(filaCorrida, '3 · pasada por ítem', t0Etapas);
  /* T2.1.1 — el costo del ítem anterior **de esta misma corrida**.
   *
   * ⭐ `2026-08-21_1` A.1 — **ya no arranca en 0.** Arrancaba así "porque el primer ítem no
   * tiene observación previa", y la consecuencia era que el primer ítem **entraba siempre**:
   * con 2 s por encima de la reserva, el control lo dejaba pasar y el ítem costaba 6. Un ítem
   * gratis por corrida es sobregiro que nadie autorizó, y en una corrida que corta temprano —la
   * que más importa— es el único ítem que hay. La semilla sale de `CONFIG.costo_item_seg`; en
   * cuanto hay una observación propia, ésta la pisa. */
  var costoUltimoItemSeg = costoItemSeg_();
  /* `for` y no `forEach` porque el corte tiene que poder salir del loop sin excepción.
   *
   * ⚠ **`!corte` en la condición, y no es decorativo:** desde el `2026-08-21_1` las etapas 1 y 2
   * también pueden cortar, y el control de adentro **asigna** `corte` —`null` incluido—. Sin esta
   * guarda, un corte de la etapa 2 lo borraba el primer ítem que sí entraba, y la corrida salía
   * declarando que había terminado bien. */
  for (var iAsignacion = 0; !corte && iAsignacion < expansion.asignaciones.length; iAsignacion++) {
    var asignacion = expansion.asignaciones[iAsignacion];

    // Checkpoint 1 · antes de cada ítem.
    corte = controlDeEtapa_(reloj, '3 · pasada por ítem', costoUltimoItemSeg, CORTE_PRESUPUESTO_, {
      item: asignacion.item.clave,
      items_emitidos: porItem.length,
      items_sin_emitir: expansion.asignaciones.length - iAsignacion,
      motivo: 'el próximo ítem se estimó en ' + costoUltimoItemSeg + ' s y quedaban ' +
        entraEnElPresupuesto_(reloj, 0).disponible + ' s por encima de la reserva'
    });
    if (corte) break;
    var t0Item = new Date().getTime();

    var slide = null;
    presentacion.getSlides().forEach(function (s) {
      if (s.getObjectId() === asignacion.objectIdSlide) slide = s;
    });
    if (!slide) {
      porItem.push({ seccion: asignacion.seccion, item: asignacion.item.clave, ok: false, motivo: 'la slide emitida no se encontró por objectId' });
      continue;
    }

    /* ⭐ `2026-08-21_14` — **se resuelven sólo los tokens de ESTA lámina.**
     *
     * `tokensDeSlide_(slide)` se llamaba **tres líneas más abajo** para decidir qué pintar; ahora
     * se calcula antes y también decide **qué resolver**. El dato ya estaba ahí.
     *
     * ⚠ **`periodo` no es un marcador y por eso no molesta si viene en la lista:** el filtro de
     * `resolverMarcadores` lo descarta —no tiene fila— y el pintado lo resuelve por su rama
     * propia, igual que antes.
     *
     * ⚠ **Una lámina escondida devuelve `[]`** y entonces no se resuelve nada, que es correcto:
     * sus tokens tampoco se pintan. Antes se resolvían los 111 para no usar ninguno. */
    var tokensDeEstaSlide = tokensDeSlide_(slide);
    var opcionesItem = {};
    Object.keys(asignacion.item.opciones || {}).forEach(function (k) {
      opcionesItem[k] = asignacion.item.opciones[k];
    });
    opcionesItem.solo_marcadores = tokensDeEstaSlide;

    var resolucionItem = resolverMarcadores(informeId, opcionesItem);
    var porMarcadorItem = {};
    resolucionItem.resultados.forEach(function (r) { porMarcadorItem[r.marcador] = r; });

    var reemplazadosItem = 0;
    tokensDeEstaSlide.forEach(function (token) {
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
      slide.replaceAllText('{{' + token + '}}', textoFaltante_(token, r, conSimbolos), true);
      faltantes.push({
        corrida_id: corridaId,
        informe_id: informeId,
        token: token + ' @' + asignacion.item.clave,
        base_id: r ? (r.base_id || '') : '',
        solapa: r ? (r.solapa || '') : '',
        campo_logico: '',
        motivo: r
          ? (r.estado + ': ' + r.traza)
          : 'sin fila en MARCADORES — el token está en la plantilla y nadie lo cableó',
        causa: causaDeResultado_(r)
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
  /* ⛔⛔ `2026-08-24` — **la compuerta atómica se RETIRA, y el motivo está en la premisa que la
   * sostenía.** Decía: *«la resolución de esta etapa es atómica: `resolverMarcadores` no acepta un
   * subconjunto, así que la única decisión posible es entrar o no entrar»*.
   *
   * **Esa premisa venció el 21/08** y nadie volvió acá: el `2026-08-21_14` le agregó
   * `solo_marcadores` a `resolverMarcadores` **para la etapa 3**, y desde entonces la 4 podía
   * partirse y siguió sin hacerlo. Es un *contrato-sin-testigo* de manual — el comentario afirmaba
   * una limitación del motor que el motor ya no tenía.
   *
   * ⚠ **Y la segunda mitad del comentario también era falsa, y ésa costó los 158 s:** *«el loop de
   * pintado que viene después no lleva checkpoint: cuesta ~6 s»*. El pintado cuesta poco; **lo que
   * costaba era la resolución**, y estaba del lado de adentro sin ningún control.
   *
   * El techo de esta etapa ahora vive **por lámina**, abajo. Un corte de la etapa 3 sigue siendo
   * un corte: el bucle de abajo no abre lámina nueva. */

  if (!corte) {
  /* ⭐ `2026-08-22_25` Parte A — **el contexto del agregado por temario entra acá**, en la única
   * pasada que resuelve marcadores **sin ítem**. Las láminas de `ecv_alcance_semanal` no se
   * expanden —`modo = 'agregado'`— así que sus tokens se pintan en esta etapa, y hasta hoy salían
   * del proxy `figura=Jorge Macri` + ventana.
   *
   * ⚠ **Alcanza a todo marcador de `rdv/RVD JM-CM - ES` de esta etapa, y ése es exactamente el
   * conjunto que `R-17 Addendum 1` cubre.** Los tres que también viven en el bloque de encuentro
   * —`ecv_barrio`, `ecv_poblacion`, `enc_evento`— **ya se pintaron en la etapa 3** con la fila de
   * su ítem; lo que resuelvan acá sólo se usa si su token quedó crudo en una lámina que no se
   * emitió, donde el agregado del temario es una respuesta mejor que la base entera.
   *
   * **Cuesta nada:** `anclarEncuentros` está cacheado por corrida, así que si la sección de
   * encuentro ya corrió, esto no lee una fila más. */
  var opcionesEtapa4 = periodoId ? { ventana: ventana } : {};
  var temario = filasRdvDelTemario_(informeId, ventana);
  if (temario.filas.length) {
    opcionesEtapa4.filas_rdv = temario.filas;
    opcionesEtapa4.hoja_rdv = temario.hoja;
    opcionesEtapa4.temario_sin_fila = temario.sin_fila;
  }

  /* ⭐ `2026-08-24` — **lo mismo para la solapa POST**, que es lo que `L-036` necesita. Las dos
   * secciones se nombran por `seccion_id` desde `CONFIG`: **ninguna se resuelve por «la primera
   * que califique»**, que es lo que este prompt vino a sacar.
   *
   * ⚠ **No frena la corrida si no resuelve.** Si `CONFIG` no la nombra, si la sección no califica
   * todavía —hoy `comunicaciones_post` sigue siendo `repetible`— o si la solapa no declara
   * `campo_id_cuenta`, esto **no aporta filas y el motivo queda en el log**. Los `post_*` caen
   * entonces por donde caían: sin fila en `MARCADORES`, `/////`. **Que la pieza exista no publica
   * nada por sí sola**, y eso es deliberado: el flip de `modo` es una decisión de registro. */
  var postTemario = null;
  var seccionPost = seccionAgregadoPost_();
  if (seccionPost) {
    var basePost = String(leerConfig().base_agregado_post || '').trim();
    var hojaPost = String(leerConfig().solapa_agregado_post || '').trim();
    if (basePost && hojaPost) {
      postTemario = filasDeSolapaDelTemario_(informeId, ventana, seccionPost, basePost, hojaPost);
      if (postTemario.ok && postTemario.filas.length) {
        opcionesEtapa4.filas_temario = postTemario;
        opcionesEtapa4.base_temario = postTemario.base_id;
        opcionesEtapa4.hoja_temario = postTemario.hoja;
      } else {
        Logger.log('ⓘ agregado post: sin filas — ' + (postTemario.motivo ||
          'la sección resolvió pero ningún ítem del temario tiene fila en ' + basePost + '/' + hojaPost));
      }
    }
  }
  /* ═══════════════════════════════════════════════════════════════════════════════════════
   * ⭐⭐ `2026-08-24` — **la etapa 4 se parte POR LÁMINA, y la lámina es la unidad porque el
   * dato lo exige, no porque sea cómoda.**
   *
   * **Lo que había:** una sola llamada a `resolverMarcadores(informeId, …)` **sin subconjunto**,
   * o sea el informe entero, y **atómica**: la única decisión era entrar o no entrar. Medido en
   * `jm-20260824-151555`: **158 s contra los 60 estimados**, con la estimación calibrada el
   * 06/08 sobre **~87 marcadores** cuando hoy son **~172**. Y **adentro no había ningún punto de
   * control**, así que el techo era decorativo para esta etapa.
   *
   * ⛔⛔ **Por qué la unidad es la LÁMINA y no el marcador** (`D-40`, decisión del usuario):
   * dos tandas del mismo deck están separadas en el tiempo, y **dos cajas de la misma lámina
   * que vengan de dos momentos distintos son `C-80`** — se leen como si respondieran la misma
   * pregunta y no lo hacen. La etapa 3 no tenía este problema porque parte por **ítem**, y un
   * ítem **es** una lámina entera. La 4 resuelve los tokens **fijos**, que incluyen el Resumen
   * Ejecutivo: partir por marcador podría dejar `mail_entregados` de la tanda 1 al lado de
   * `imp_meta` de la tanda 2, en la misma caja de la misma lámina.
   *
   * ⇒ **El presupuesto decide cuántas LÁMINAS entran, nunca cuántos marcadores.**
   *
   * ⚠ **Y el límite conocido, declarado y NO resuelto acá** (`D-40`): partir por lámina acota
   * la inconsistencia a *entre* láminas, **no la elimina**. Con `looker/DIGITAL` inestable por
   * CAMBIO (`R-31`), la lámina 2 puede resolverse en la tanda 1 y la 3 en la tanda 2 y publicar
   * números de dos momentos. **Es un límite del deck en tandas, no un problema a resolver
   * ahora** — y por eso la columna `ejecucion` existe: para que se pueda **ver** cuál vino de
   * dónde en vez de descubrirlo comparando.
   *
   * ⭐ **El costo por lámina se MIDE y se adapta**, igual que `costoUltimoItemSeg` en la etapa 3:
   * `CONFIG.costo_lamina_etapa4_seg` es sólo la **semilla** de la primera. Un tamaño de lote
   * fijo sería la cuarta constante que nadie vuelve a mirar, y hoy fallaron tres de tres por eso.
   * ═══════════════════════════════════════════════════════════════════════════════════════ */
  var visiblesEtapa4 = tokensVisiblesDe_(presentacion);
  var tokensFijos = visiblesEtapa4.tokens;
  /* Se guarda para el diagnóstico del cierre: es la diferencia entre *«nadie lo miró»* y *«está
   * en una lámina escondida»*, y el cierre corre mucho después de acá. */
  tokensSoloEnEscondidas = visiblesEtapa4.detalle || {};
  var laminasDeEtapa4 = agruparTokensPorLamina_(tokensFijos);
  var costoUltimaLaminaSeg = costoLaminaEtapa4Seg_();
  var laminasEtapa4Hechas = [];
  var laminasEtapa4Pendientes = [];

  for (var iLam = 0; iLam < laminasDeEtapa4.length; iLam++) {
    var grupo = laminasDeEtapa4[iLam];

    if (corte) { laminasEtapa4Pendientes.push(grupo.slide); continue; }

    // Checkpoint · antes de cada lámina. **Acá vive el techo de esta etapa**, y antes no existía.
    corte = controlDeEtapa_(reloj, '4 · tokens fijos', costoUltimaLaminaSeg, CORTE_PRESUPUESTO_, {
      items_emitidos: porItem.length,
      motivo: 'la próxima lámina de tokens fijos (slide ' + grupo.slide + ', ' +
        grupo.tokens.length + ' token(s)) se estimó en ' + costoUltimaLaminaSeg + ' s y quedaban ' +
        entraEnElPresupuesto_(reloj, 0).disponible + ' s por encima de la reserva. ⭐ La unidad es ' +
        'la LÁMINA y no el marcador: dos cajas de la misma lámina de dos momentos distintos son C-80'
    });
    if (corte) { laminasEtapa4Pendientes.push(grupo.slide); continue; }

    var t0Lamina = new Date().getTime();

    /* ⭐ **Sólo los marcadores de ESTA lámina.** Es lo mismo que el `2026-08-21_14` hizo con la
     * etapa 3 y que a la 4 nunca se le aplicó — y es lo que vuelve al lote barato **además** de
     * partible. Las `opcionesEtapa4` se copian enteras: llevan la ventana, las filas del temario
     * y las de la POST, y perder una cambiaría de qué filas sale el número. */
    var opcionesLamina = {};
    Object.keys(opcionesEtapa4).forEach(function (k) { opcionesLamina[k] = opcionesEtapa4[k]; });
    opcionesLamina.solo_marcadores = grupo.tokens;

    var resolucionLamina = resolverMarcadores(informeId, opcionesLamina);
    resolucionLamina.resultados.forEach(function (r) { porMarcador[r.marcador] = r; });
    /* El resumen del reporte acumula: `resolucion` era una sola llamada y ahora son N.
     * Quedarse con la última diría que la etapa resolvió sólo la última lámina. */
    resolucion = acumularResolucion_(resolucion, resolucionLamina);

    pintarTokensFijosDeLamina_(grupo.tokens, {
      presentacion: presentacion, porMarcador: porMarcador, periodoLamina: periodoLamina,
      conSimbolos: conSimbolos, corridaId: corridaId, informeId: informeId,
      contadores: { sumarReemplazado: function (t) { reemplazados++; conValor.push(t); } },
      faltantes: faltantes
    });

    costoUltimaLaminaSeg = Math.max(1, Math.round((new Date().getTime() - t0Lamina) / 1000));
    laminasEtapa4Hechas.push(grupo.slide);
  }

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
  /* ⭐ `2026-08-20_10` A.2 — **la barrida NO corre si la corrida se cortó Y hay con qué
   * continuar.** Es la condición sin la cual todo el mecanismo no sirve: la barrida convierte los
   * crudos en `/////`, y **ahí se pierde la única garantía de que repintar sea inocuo**. Barrer es
   * un gesto de cierre; una corrida cortada no cerró.
   *
   * ⚠ **La condición es `continuable`, no `corte` a secas, y la diferencia importa.** Una corrida
   * cortada que NADIE va a continuar —el caso de siempre, sin plan— tiene que barrer igual: si no,
   * el deck sale con crudos y sin nadie que los vaya a resolver, que es peor que `/////`. Sólo se
   * saltea la barrida cuando existe un plan que dice que alguien va a volver. */
  /* ⭐ `2026-08-21_1` A.4 — **el cierre se mide.** La reserva existe para cubrirlo entero
   * —barrida, `FALTANTES`, `CORRIDAS`, sello— y hasta hoy su valor (30 s) salía de dos
   * mediciones sueltas del 06/08 y de un margen elegido a mano. Si la reserva se queda corta,
   * el corte ordenado **igual muere en el muro** y toda la maquinaria de corte no sirve.
   * Desde acá el número sale de cada corrida y el aviso está en `avisoDeReserva_`. */
  var t0Cierre = new Date().getTime();

  var continuable = !!(corte && opciones.continuable === true);
  var barrida = continuable
    ? { barridos: [], origen: 'no se barrió: la corrida se cortó y hay plan para continuarla' }
    : barrerTokensNoAlcanzados_(presentacion, mapa.lista.length ? mapa.tokens : null, conSimbolos,
        !!(corte || fallo), tokensConFilaDe_(informeId));
  /* ⭐ `2026-08-23_1` Parte C — el cableado se lee **una sola vez y sólo si hace falta**.
   *
   * Con corte o con excepción la causa ya se sabe —la corrida no llegó— y preguntarle a
   * `MARCADORES` no agregaría nada; además es justo el caso en que menos presupuesto queda. Sin
   * corte, en cambio, hay tres situaciones distintas detrás del mismo hueco y hay que separarlas.
   * `leerMarcadores_()` viene del caché de registros que `generarInforme` tiene encendido, así que
   * en el camino normal ni siquiera toca la planilla. */
  var conFilaEnMarcadores = (barrida.barridos.length && !corte && !fallo)
    ? tokensConFilaEnMarcadores_(informeId)
    : { ok: true, tokens: {} };

  /* El desglose por causa del barrido, para el reporte. **Se acumula acá y no se recalcula
   * después**: recorrer `faltantes` al final volvería a mezclar los barridos con los que ya
   * venían de las etapas 3 y 4, que es justo la distinción que este bloque produce. */
  var barridoPorCausa = {};
  barrida.barridos.forEach(function (token) {
    // Con corte o con fallo la causa **se sabe** y es la misma: la corrida no llegó hasta acá, y
    // el oficio es correr de nuevo, no cablear. Sin ninguno de los dos, la Parte C separa las tres
    // situaciones que hasta hoy compartían un único texto.
    var diag = corte
      ? { causa: 'no_alcanzado', motivo: MOTIVO_CORTE_TIEMPO_ + ' (' + corte.etapa + ')' }
      : (fallo
        ? { causa: 'no_alcanzado', motivo: MOTIVO_EXCEPCION_ + ' (etapa "' + fallo.etapa + '"): ' + fallo.mensaje }
        : diagnosticoDeCrudo_(token, porMarcador[token], conFilaEnMarcadores, tokensSoloEnEscondidas));

    faltantes.push({
      corrida_id: corridaId,
      informe_id: informeId,
      token: token,
      base_id: (porMarcador[token] && porMarcador[token].base_id) || '',
      solapa: (porMarcador[token] && porMarcador[token].solapa) || '',
      campo_logico: '',
      motivo: diag.motivo,
      causa: diag.causa
    });

    if (!barridoPorCausa[diag.causa]) barridoPorCausa[diag.causa] = { tokens: [], cuantos: 0 };
    barridoPorCausa[diag.causa].cuantos++;
    // Hasta cinco nombres: el reporte tiene que poder nombrar el caso, no listarlo entero.
    // Un aviso sin un solo nombre obliga a abrir la hoja, que es lo que se está evitando.
    if (barridoPorCausa[diag.causa].tokens.length < 5) barridoPorCausa[diag.causa].tokens.push(token);
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
    // ⚠ El prefijo NO es `MARCA_ETAPAS_`, y la diferencia importa: ése dice `(en curso)` y es la
    // señal de que la corrida está viva. Reusarlo acá hacía que una fila **cerrada** dijera
    // «425 · (en curso) 1 · expandir…», o sea que el campo de estado afirmaba lo contrario de lo
    // que el resto de la fila decía. Visto en la corrida de las 17:14, en la primera salida real
    // del rastro preservado.
    faltantes: avisosDeLaFila_(faltantes.length, fallo, fallosDelReloj) +
      (RASTRO_ETAPAS_.length ? ' · gasto: ' + RASTRO_ETAPAS_.join(' › ') : '')
  }, mapa.tokens, filaCorrida);

  /* `2026-08-20_10` A.0 — **el sello lo quita el cierre, y sólo si la corrida terminó.** Cortada o
   * muerta, el deck se queda con el sello puesto: es exactamente lo que declara. */
  if (!corte && !fallo) {
    try {
      var archivoDeck = DriveApp.getFileById(deckId);
      var nombreActual = archivoDeck.getName();
      if (nombreActual.indexOf(SELLO_EN_PROCESO_) === 0) {
        archivoDeck.setName(nombreActual.slice(SELLO_EN_PROCESO_.length));
      }
    } catch (e) {
      // Un deck que no se puede renombrar no invalida la corrida: se anota y sigue.
      Logger.log('⚠ no se pudo quitar el sello de en-proceso: ' + e.message);
    }
  }

  /* ⭐ `2026-08-21_2` — **el deck del retorno se resuelve por `deckId`, que existe en los dos
   * caminos.**
   *
   * ⚠ **Acá decía `nombre: copia.getName(), url: copia.getUrl()`, y `copia` sólo se asigna en la
   * rama que copia la plantilla.** Al continuar un deck (`opciones.deck_id`) esa rama no corre,
   * `copia` queda `undefined` y las dos llamadas tiran `TypeError` — **fuera del `try/catch`**
   * que protege las etapas, o sea **después** de que el cierre ya escribió `CORRIDAS` y quitó el
   * sello. `correrUnaEjecucion_` no lo atrapa: no marca secciones `hecha`, no guarda el estado y
   * no crea el trigger siguiente. **La reanudación real no podía terminar nunca.**
   *
   * **Se leen del archivo, no de la variable**, y de un solo `getFileById` — el nombre además
   * puede haber cambiado en esta misma corrida: el cierre le quita el sello de en-proceso, así
   * que `copia.getName()` habría devuelto el nombre **con** sello en el camino que sí andaba.
   *
   * ⚠ **Y el `try/catch` cubre las tres lecturas, no sólo el dueño.** Un deck que no se puede
   * abrir no invalida una corrida que ya escribió su fila y su lista de faltantes; lo que no
   * puede pasar es que la respuesta se pierda por eso. Los valores de reemplazo lo dicen. */
  var dueno = '';
  var nombreDeck = '';
  var urlDeck = '';
  try {
    var archivoFinal = DriveApp.getFileById(deckId);
    nombreDeck = archivoFinal.getName();
    urlDeck = archivoFinal.getUrl();
    var propietario = archivoFinal.getOwner();
    dueno = propietario ? propietario.getEmail() : '(sin dueño legible)';
  } catch (e) {
    if (!nombreDeck) nombreDeck = '(no se pudo leer el nombre: ' + e.message + ')';
    if (!urlDeck) urlDeck = 'https://docs.google.com/presentation/d/' + deckId + '/edit';
    dueno = '(no se pudo leer: ' + e.message + ')';
  }

  /* ⭐⭐ `2026-08-24` — **el cierre se mide y las estimaciones se comparan, ANTES de armar el
   * reporte.** Va acá y no adentro del objeto porque `cierre_seg` se calculaba dos veces con dos
   * `new Date()` distintos: los dos valores podían diferir en un segundo y el aviso se evaluaba
   * contra uno mientras el reporte publicaba el otro. Un número que se mide dos veces es dos
   * números. */
  var cierreSeg = Math.round((new Date().getTime() - t0Cierre) / 1000);
  var desvios = desviosDeEstimacion_(cierreSeg, reloj.reserva);

  return {
    ok: true,
    corrida_id: corridaId,
    informe_id: informeId,
    deck: { id: deckId, nombre: nombreDeck, url: urlDeck, dueno: dueno },
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
    presentacion_faltantes: conSimbolos ? 'simbolos' : '«FALTA:token»',
    // `2026-08-21_5` — **de dónde salió ese modo**, que es una pregunta distinta de cuál fue.
    // Un deck en crudo porque alguien lo pidió y uno en crudo porque el llamador se olvidó de
    // pasar la opción se ven idénticos, y mandan a trabajos opuestos.
    presentacion_faltantes_origen: modoFaltantes.origen,
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
    faltantes_escritos: faltantesEscritos.filas,
    /* ⭐ `2026-08-23_1` Parte B — el archivado de la corrida anterior se REPORTA.
     * `FALTANTES_PREVIO` es lo que hace comparable un cambio contra el estado de ayer, y un
     * archivado que falló en silencio deja al próximo diagnóstico comparando contra una foto
     * que no es la que cree. `filas: 0` con `ok: true` es el caso legítimo —la anterior no
     * dejó nada— y por eso el `ok` viaja al lado del número y no en su lugar. */
    faltantes_previo: faltantesEscritos.previo,
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
      // `2026-08-21_1` A.4 — lo que costó el cierre completo, para poder dimensionar la reserva
      // con un número medido en vez de uno elegido. `aviso_reserva` es `''` cuando entra.
      cierre_seg: cierreSeg,
      aviso_reserva: desvios.avisos.length ? desvios.avisos[desvios.avisos.length - 1] : '',
      /* ⭐⭐ `2026-08-24` — **lo estimado contra lo real, por etapa.** Es lo que evita que
       * esto vuelva en tres semanas: una constante con un control que se entera deja de ser una
       * estimación que envejece en silencio.
       *
       * ⚠ `medidas` va al lado de `avisos` a propósito: **«ninguna se desvió» y «no se midió
       * nada» se ven idénticos en un reporte sin conteo**, y un cero que nadie buscó no se
       * distingue de «no miré». */
      estimado_vs_real: {
        avisos: desvios.avisos,
        medidas: desvios.medidas,
        por_etapa: desvios.reales
      },
      // La etapa 2 no tiene estimación: se publica su costo POR TOKEN, que es lo unico
      // comparable entre corridas con decks de distinto tamaño (pedido del usuario, 24/08).
      costo_del_mapa: costoDelMapa_(segundosDeEtapa_('2 · mapa token→objectId'), mapa.tokens ? Object.keys(mapa.tokens).length : 0),
      // Qué etapas declaradas tienen su punto de control en el flujo, con el `n de m` adentro:
      // «ningún problema» y «no se probó nada» se ven idénticos en un log sin conteo.
      control_por_etapa: controlPorEtapa_(),
      // ⭐ `D-40` — la etapa 4 en láminas: cuáles se pintaron y cuáles quedaron. `pendientes`
      // NO vacío con `corte` es el caso normal; vacío con corte querría decir que el corte no
      // fue de esta etapa.
      etapa4_por_lamina: {
        hechas: laminasEtapa4Hechas,
        pendientes: laminasEtapa4Pendientes,
        total: laminasDeEtapa4.length,
        costo_ultima_seg: costoUltimaLaminaSeg
      },
      barrida: {
        tokens: barrida.barridos.length, origen: barrida.origen,
        // `2026-08-23_1` Parte C — qué oficio manda a hacer cada crudo. Sin esto, el conteo de
        // barridos es un número que no dice si hay que cablear, correr de nuevo o mirar el escritor.
        por_causa: barridoPorCausa
      }
    },
    /* `2026-08-20_10` — lo que la reanudación necesita y hasta hoy moría con la ejecución.
     *
     * ⭐ **`asignaciones` es la pieza clave, y es más que un dato de estado:** lleva el
     * `objectIdSlide` de cada copia, o sea **la respuesta a "qué lámina es de qué ítem" sin tener
     * que volver a expandir**. Es lo que hace posible la fase atómica: la ejecución 2 no decide
     * qué es modelo y qué es copia porque **recibe el mapa ya hecho**. */
    continuacion: {
      deck_id: deckId,
      corrida_id: corridaId,
      se_corto: !!corte,
      sello_puesto: !!(corte || fallo),
      asignaciones: expansion.asignaciones.map(function (a) {
        return { objectIdSlide: a.objectIdSlide, seccion: a.seccion, item: a.item };
      }),
      // Cuáles ya se resolvieron: el índice donde cortó. Las anteriores están pintadas.
      resueltas: porItem.length,
      /* ⭐ `D-40` — **las láminas de tokens fijos que YA se pintaron.** Es lo que la reanudación
       * necesita para no repintarlas: sin esto, la tanda 2 volvería a resolver la lámina 2 —costo
       * de más— y, peor, **podría publicar un valor distinto del que ya está en el deck**, que es
       * justamente la inconsistencia entre tandas que `D-40` acota. */
      laminas_etapa4_hechas: laminasEtapa4Hechas
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
    ''
  ];

  /* ⭐ `2026-08-20_9` Parte A.2 — **el corte va en la PRIMERA línea, antes que cualquier conteo.**
   *
   * Hasta hoy el corte aparecía en un bloque lateral del panel y el deck no lo mencionaba: **un
   * deck cortado era indistinguible de uno completo mirando el deck**, y sus 264 huecos decían
   * `/////`, que manda a cablear. Quien leía el reporte veía primero «Tokens distintos: 343» y un
   * conteo prolijo debajo.
   *
   * Va arriba y no abajo porque **el resto del reporte no significa lo mismo si hubo corte**: los
   * conteos son de una corrida que no terminó, y leerlos como cobertura es el error que esto
   * evita. */
  if (r.corte) {
    /* ⭐ `2026-08-21_1` B.2 — **la clase del corte, en el título.** *«El arranque no entra en el
     * techo»* y *«me quedé sin presupuesto en el medio»* mandan a trabajos opuestos: el primero
     * se destraba subiendo el techo o partiendo el arranque, el segundo corriendo de nuevo. Un
     * corte genérico los confunde, que es la misma familia del `/////` que no distinguía
     * *«nadie lo cableó»* de *«no se llegó»*. */
    if (r.corte.clase === CORTE_ARRANQUE_) {
      lineas.push('⛔ EL ARRANQUE NO ENTRA EN EL TECHO — este deck NO está completo.');
      lineas.push('   No es que la corrida se haya quedado sin tiempo en el medio: **no tenía con');
      lineas.push('   qué empezar**. Correr de nuevo da el mismo resultado. Lo destraba subir');
      lineas.push('   `CONFIG.presupuesto_corrida_seg` o partir el arranque.');
    } else {
      lineas.push('⛔ LA CORRIDA SE CORTÓ — este deck NO está completo.');
    }
    lineas.push('   Etapa: ' + r.corte.etapa + ' · ' + r.corte.motivo);
    if (r.presupuesto && r.presupuesto.barrida) {
      lineas.push('   ' + r.presupuesto.barrida.tokens + ' token(s) quedaron sin resolver POR EL CORTE' +
        ' — no por falta de cableado. ' + (r.corte.clase === CORTE_ARRANQUE_
          ? '**No cablear, y correr de nuevo tampoco: subir el techo.**'
          : '**Correr de nuevo, no cablear.**'));
    }
    lineas.push('   Se cortó a los ' + r.corte.segundos + ' s (techo ' +
      (r.presupuesto ? r.presupuesto.techo_seg : '?') + ' s, reserva ' +
      (r.presupuesto ? r.presupuesto.reserva_seg : '?') + ' s)' +
      (r.corte.items_sin_emitir ? ' · ' + r.corte.items_sin_emitir + ' ítem(s) sin emitir' : ''));
    lineas.push('   ⏸ El glifo propio del corte está sin elegir: por ahora salen como `/////`,' +
      ' igual que los que nadie cableó. Elegirlo es una decisión del usuario.');
    lineas.push('');
  } else if (r.fallo) {
    lineas.push('⛔ LA CORRIDA MURIÓ POR UNA EXCEPCIÓN — este deck NO está completo.');
    lineas.push('   Etapa "' + r.fallo.etapa + '": ' + r.fallo.mensaje);
    lineas.push('');
  }

  /* ⭐ `2026-08-23_1` Parte C — **crudos SIN corte y SIN excepción: el bloque que faltaba.**
   *
   * Va arriba, con el corte y la excepción, y por el mismo motivo: **cambia cómo se lee el resto
   * del reporte**. Un token que la barrida encontró crudo en una corrida que terminó bien no es
   * un faltante más — es que algo pasó y nadie lo dijo.
   *
   * ⚠ **Y el desglose por causa es todo el punto.** Hasta hoy los tres casos —nadie lo cableó, el
   * escritor no lo pisó, no se lo alcanzó— salían con un único texto que era correcto y no era
   * accionable. Cada línea de acá nombra el oficio y da hasta cinco tokens: un aviso sin un solo
   * nombre obliga a abrir la hoja, que es justo lo que la Parte B vino a evitar. */
  var barridoSinCorte = (!r.corte && !r.fallo && r.presupuesto && r.presupuesto.barrida &&
    r.presupuesto.barrida.tokens) ? r.presupuesto.barrida : null;
  if (barridoSinCorte) {
    var causas = barridoSinCorte.por_causa || {};
    // `escritor` primero, siempre: es el único que acusa al motor. Los demás dicen qué falta.
    var orden = ['escritor', 'sin_clasificar', 'no_alcanzado', 'fallo', 'sin_datos', 'sin_fila'];
    var hayBug = causas.escritor || causas.sin_clasificar;
    lineas.push((hayBug ? '⛔' : '⚠') + ' ' + barridoSinCorte.tokens +
      ' token(s) quedaron CRUDOS sin que hubiera corte ni excepción.');
    orden.forEach(function (causa) {
      if (!causas[causa]) return;
      var def = CAUSAS_FALTANTE_[causa] || CAUSAS_FALTANTE_.sin_clasificar;
      lineas.push('   · ' + causas[causa].cuantos + ' — ' + def.texto + ' → ' + def.oficio +
        ': ' + causas[causa].tokens.join(', ') +
        (causas[causa].cuantos > causas[causa].tokens.length ? ', …' : ''));
    });
    if (hayBug) {
      lineas.push('   ⛔ Un token que resolvió con valor y salió crudo NO aparece en el deck como');
      lineas.push('      distinto de cualquier otro hueco. La fila de FALTANTES trae el valor que');
      lineas.push('      se había resuelto: es la evidencia de que había qué escribir.');
    }
    lineas.push('');
  }

  lineas.push(
    'Deck: ' + r.deck.nombre,
    'Informe: ' + r.informe_id + ' · corrida ' + r.corrida_id,
    'Período: ' + r.periodo.lamina + ' (' + r.periodo.origen + (r.periodo.calculado ? ', calculado' : '') + ')',
    'Dueño del archivo: ' + r.deck.dueno,
    '',
    'Tokens distintos en el deck: ' + r.tokens.en_plantilla,
    'Impresiones con valor (token × lámina): ' + r.tokens.reemplazados,
    'Filas en FALTANTES (una por token y por ítem): ' + r.tokens.faltantes,
    'Los huecos se imprimieron como: ' + r.presentacion_faltantes
  );

  /* ⭐ `2026-08-20_9` Parte A.3 — **el previsor se cruza con lo que salió.**
   *
   * `preverSimbolosJM()` declara un piso: cuántos tokens *deberían* publicar. Hasta hoy ese número
   * vivía en un log aparte y **nadie lo comparaba con nada** — o sea que era un cartel, no un
   * control. La corrida del 20/08 publicó **9 números limpios sobre 343 tokens** y el previsor no
   * dijo nada, porque nadie se lo preguntó.
   *
   * El cruce se hace acá, con el previsor corriendo sobre la misma configuración, y **avisa cuando
   * la diferencia es grande**. Es barato: `preverSimbolosDelDeck_` no genera nada.
   *
   * ⚠ **El piso puede fallar en una sola dirección, y por eso el aviso es asimétrico.** Menos
   * números que lo previsto significa que algo pasó —corte, excepción, una fuente caída—; más
   * números que lo previsto significa que **el instrumento está mal**, y eso también se dice.
   * Sin la asimetría, un previsor roto se leería como una corrida buena. */
  try {
    if (typeof preverSimbolosDelDeck_ === 'function') {
      var previsto = preverSimbolosDelDeck_(r.informe_id);
      if (previsto && previsto.ok) {
        var pisoPublica = previsto.cuenta.numero + previsto.cuenta.entre_guiones;
        var salieron = r.tokens.reemplazados;
        lineas.push('');
        lineas.push('Previsto vs obtenido: el piso era ' + pisoPublica + ' token(s) publicando y ' +
          'salieron ' + salieron + '.');
        if (salieron < pisoPublica * 0.9) {
          lineas.push('   ⛔ SALIÓ MUCHO MENOS QUE EL PISO. ' + (r.corte || r.fallo
            ? 'La corrida no terminó — es esperable, y es la medida de cuánto faltó.'
            : 'Y NO hubo corte ni excepción, así que esto hay que mirarlo.'));
        } else if (salieron > pisoPublica) {
          lineas.push('   ⚠ Salió MÁS que el piso, y el piso no puede quedarse corto: ' +
            'el previsor está mal, no la corrida.');
        }
      }
    }
  } catch (e) {
    // Un previsor que falla no puede tumbar el reporte de una corrida que sí salió.
    lineas.push('');
    lineas.push('⚠ No se pudo cruzar contra el previsor: ' + e.message);
  }
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
  // `T2.1.1` decía «si cortó, se dice primero», y el bloque vivía acá — o sea **después** de
  // todos los conteos. `2026-08-20_9` A.2 lo movió arriba de verdad, con el motivo completo, y
  // este duplicado se retiró: repetir el corte en dos lugares hace que el segundo se lea como
  // otra cosa.
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

  /* ⭐ `2026-08-21_1` A.4 — **los avisos del reloj van ÚLTIMOS, después del veredicto.**
   * `CLAUDE.md` §4: un `⚠` en el medio de un reporte que termina en `✅` se lee como verde, y el
   * aviso de la tanda 4 pasó inadvertido dos corridas seguidas por estar en el medio. */
  if (r.presupuesto) {
    lineas.push('');
    lineas.push('Reloj: ' + r.presupuesto.gastado_seg + ' s de un techo de ' + r.presupuesto.techo_seg +
      ' s (reserva ' + r.presupuesto.reserva_seg + ' s) · el cierre costó ' +
      (r.presupuesto.cierre_seg === undefined ? '?' : r.presupuesto.cierre_seg) + ' s.');

    var cpe = r.presupuesto.control_por_etapa;
    if (cpe) {
      // **El `n de m` adentro**: «ningún problema» y «no se probó nada» se ven idénticos sin él.
      lineas.push('   Etapas con punto de control: ' + cpe.con_control + ' de ' + cpe.total + '.');
      if (cpe.con_control < cpe.total) {
        lineas.push('   ⛔ HAY ETAPAS SIN CONTROL DEL RELOJ — una corrida que se pase ahí muere en');
        lineas.push('   el muro de los 360 s sin barrida, sin FALTANTES y sin cerrar CORRIDAS:');
        cpe.etapas.filter(function (e) { return !e.tiene; }).forEach(function (e) {
          lineas.push('      · ' + e.etapa);
        });
      }
    }
    if (r.presupuesto.aviso_reserva) lineas.push('   ' + r.presupuesto.aviso_reserva);
    lineas.push('   ⚠ Lo que este bloque NO cubre: el cierre no tiene punto de control **a');
    lineas.push('   propósito** —tiene que correr siempre— y lo único que lo protege es la');
    lineas.push('   reserva. Y el reloj arranca en la primera línea de `generarInforme`: lo que');
    lineas.push('   gasta el llamador antes de entrar sale del colchón entre el techo y el muro.');
  }

  ui.alert('Generar informe completo', lineas.join('\n'), ui.ButtonSet.OK);
  return r;
}

/* ═══════════ `2026-08-21_11` Parte C — el bloque de una sección sale de `LAMINAS` ═══════════
 *
 * ⭐ **`D-37`: la pertenencia se declara, no se infiere.** `slidesModeloDe_(familias)` deja de
 * decidir qué láminas son el bloque de una sección. Ahora lo dicen las filas de `LAMINAS` con ese
 * `informe_id` y ese `seccion_id`, resueltas a índice de slide **por el ancla** — nunca por
 * `orden_plantilla`, que es reportado y jamás autoritativo (`2026-08-21_6`).
 *
 * **Los dos casos que lo forzaron son el mismo error con dos caras**, y los dos están medidos:
 * la lámina que no pertenece a nada —`L-053`, 32 tokens `u1_` y ninguna sección declara esa
 * familia— y la copia indistinguible del modelo, que es la N² del `2026-08-20_13`.
 */

/**
 * ⭐ **El índice `lamina_id → posición`, calculado UNA vez y ANTES de duplicar. Es lo que mata la
 * N², y el motivo está medido.**
 *
 * `slide.duplicate()` **copia las notas del orador** —medido el 21/08 con
 * `medirSiLaCopiaHeredaElAncla()`: `hereda_ancla: true`—, así que **una copia lleva el ancla de su
 * modelo**. Resolver el modelo por `lamina_id` sobre el deck ya expandido devolvería copias, y una
 * copia sin pintar es indistinguible de un modelo — exactamente el bug que esto viene a matar.
 *
 * ⛔ **La otra salida —borrarle las notas a cada copia, 0,013 s medidos— se descarta**, y conviene
 * que quede el motivo: destruiría notas del orador legítimas. `secco` 8 y 25 tienen texto del
 * equipo, y hay un documento entero del repo dedicado a haberlas rescatado.
 *
 * ⚠ **La fase atómica del `2026-08-20_10` se conserva igual: dos defensas, no una.**
 *
 * `sinAncla` no es un descarte silencioso: son las láminas que el reporte tiene que nombrar.
 */
function indiceDeLaminasPorAncla_(presentacion) {
  var porId = {};
  var sinAncla = [];
  presentacion.getSlides().forEach(function (slide, i) {
    var id = String(anclaDeLamina_(slide) || '').trim();
    if (!id || id === '(sin id)') { sinAncla.push(i + 1); return; }
    // El primero gana. Antes de duplicar no hay copias, así que esto sólo se activa si una
    // plantilla ya trae dos láminas con el mismo ancla — y entonces `verificarLaminas()` lo dice.
    if (!(id in porId)) porId[id] = i;
  });
  return { porId: porId, sinAncla: sinAncla };
}

/**
 * Las filas de `LAMINAS` de una sección, en el orden en que están en el deck.
 *
 * ⚠ **Una fila cuyo `lamina_id` no aparece en el deck NO se ignora**: viaja en `sin_slide` para que
 * el reporte la nombre. Una fila de registro que apunta a una lámina que no existe es un hallazgo,
 * no ruido.
 */
function laminasDeSeccion_(filasLaminas, informeId, seccionId, indice) {
  var conSlide = [];
  var sinSlide = [];
  filasLaminas.forEach(function (f) {
    if (String(f.informe_id || '').trim() !== informeId) return;
    if (String(f.seccion_id || '').trim() !== seccionId) return;
    var id = String(f.lamina_id || '').trim();
    if (id in indice.porId) conSlide.push({ lamina_id: id, indice: indice.porId[id], filtro: f.filtro });
    else sinSlide.push(id);
  });
  conSlide.sort(function (a, b) { return a.indice - b.indice; });
  return { conSlide: conSlide, sinSlide: sinSlide };
}

/**
 * ⭐ **`LAMINAS.filtro`, evaluado POR ÍTEM.** Es lo que hace que el "1 a 1" lleve `L-053` y el
 * resto el iceberg. Vacío = la lámina entra siempre.
 *
 * Usa `parsearFiltro_` y el mismo `leerAtributo` que la rama `REUNIONES` de `itemsDeSeccion_` — el
 * que ya prueba `probar-tipo-en-item.js`. **Una sola sintaxis de filtro en todo el motor.**
 *
 * ⚠ **La columna existía en el esquema desde el `_11` y nunca tuvo lector.** Es el mismo caso que
 * `CLAUDE.md` §4 describe: una columna declarada sin consumidor es letra muerta hasta que alguien
 * la lee, y nadie se entera de que no hace nada.
 */
function laminaEntraParaItem_(filaLamina, item) {
  var f = parsearFiltro_(filaLamina.filtro);
  if (!f.ok) return { entra: false, motivo: 'LAMINAS.filtro de "' + filaLamina.lamina_id + '": ' + f.motivo };
  if (f.vacio) return { entra: true, motivo: '' };

  /* ⚠ **Los atributos se leen del ÍTEM, y por eso el ítem tiene que declararlos.** `itemsDeSeccion_`
   * arma un ítem de cinco campos —`clave`, `etiqueta`, `opciones`, `id_cuenta`, `motivo`— y `tipo`
   * **no estaba entre ellos**: un filtro `tipo=Uno a uno` leía `undefined` y **no matcheaba ninguna
   * lámina, sin fallar**. Es el mismo hueco que el `2026-08-21_8` cerró un escalón más arriba, en
   * el ítem del anclaje — y volvió a aparecer acá porque son dos objetos distintos.
   *
   * `__clave__` se resuelve aparte, igual que en `filtrarItemsPorSeccion_`: **una sola sintaxis de
   * filtro en todo el motor.** */
  var falla = primeraCondicionQueFalla_(f.condiciones, function (campo) {
    return campo === '__clave__' ? item.clave : item[campo];
  });
  return falla
    ? { entra: false, motivo: falla.campo + ' = "' + normalizarValorDeclarado_(item[falla.campo]) + '"' }
    : { entra: true, motivo: '' };
}
