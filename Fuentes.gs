/**
 * Fuentes.gs — Acceso a bases en vivo y lectura de datos fuente.
 * Expone:
 *   abrirBase(baseId)             -> { ok, base, libro } o { ok:false, motivo }
 *   abrirHoja(baseId, nombreHoja?) -> { ok, base, libro, hoja } o { ok:false, motivo }
 *   probarConexionBases()         -> reporte de estado por base (ítem de menú)
 *   resolverVentana({informe_id, periodo_ref, campana}) -> { ok, desde, hasta, origen }
 *     Prioridad: campaña > periodo_ref (PERIODOS) > período principal (CONFIG).
 *   leerFuente(baseId, ventana, nombreHojaOverride?) -> diagnóstico + filas de esa
 *     ventana (ver docs/Prompts/VERIFICACION_Paso-2.md §1 para el contrato exacto).
 *     Si `modo_periodo=snapshot` (BASES), ignora la ventana y devuelve todas las filas.
 *   probarLecturaPeriodo() -> corre leerFuente sobre las bases activas, para diagnóstico.
 * La resolución de columnas de MAPEO (fecha, clave) pasa por `buscarMapeo`
 * (Config.gs), no por una función propia de este módulo (Paso 2.3.2 — antes
 * había una `resolverCampo` acá que duplicaba esa lógica).
 * abrirBase/abrirHoja cachean la base ya abierta por corrida (no reabren).
 * NADIE hace cuentas de fechas fuera de este módulo y Config.gs.
 * abrirBase/abrirHoja/probarConexionBases se completan en: Paso 1.
 * resolverVentana/leerFuente/probarLecturaPeriodo se completan en: Paso 2.
 *
 * Convención de columna de fecha (Paso 2.3.1): la columna que filtra la ventana
 * de una base es la fila de MAPEO con `campo_logico = 'fecha_periodo'` para ese
 * `base_id` — nunca una constante ni una columna nueva en BASES. Esa fila la
 * puebla `promoverFechasElegidas()` (Fechas.gs) a partir de una elección humana
 * en `DIAG_FECHAS`, no una adivinanza del código: detección automática,
 * elección humana. Si `modo_periodo=snapshot`, no se busca columna de fecha
 * (no aplica ventana, no hay advertencia). Si falta la fila en MAPEO,
 * `leerFuente` nunca devuelve la base sin filtrar: falla con
 * `«FALTA:fecha_periodo@{base_id}/{solapa}»` — ese es el modo de falla caro
 * que hay que evitar, no un silencio.
 *
 * Convención de columna clave (Paso 2.3): igual mecánica que la de fecha, pero
 * con `campo_logico = 'clave'` (o `'campana'` como fallback si no hay `clave`
 * explícita).
 *
 * ⚠ Paso 2.9 Parte B — `leerFuente()` NO EXCLUYE filas por su cuenta. Hasta acá,
 * una fila sin clave (o 100% vacía si no hay clave resoluble) se descartaba del
 * conteo en silencio — parecía prudencia ("filtrar basura") pero era el modo de
 * falla caro: `digital` devolvía 960 de 1297 filas, `rdv` 720 de 1362, `m2` 18
 * de 29.533, todo con ✅. Un lector que decide por su cuenta qué fila "cuenta"
 * hace imposible cualquier `SUMA` correcta río abajo, porque el agregador nunca
 * se entera de lo que faltó. Ahora `leerFuente` devuelve **todas** las filas
 * entre `fila_encabezado` y el final de `getDataRange()` (más el filtro de
 * ventana si `modo_periodo=filtrar`) — "vacía" y "sin clave" pasan a ser
 * conteos informativos (`filas_vacias`, `filas_sin_clave`), nunca un filtro
 * aplicado. Si hace falta deduplicar o descartar basura para algo puntual, es
 * una operación aparte y explícita en la capa que lo necesite — no acá.
 */

var cacheBases_ = {};

function abrirBase(baseId) {
  if (Object.prototype.hasOwnProperty.call(cacheBases_, baseId)) {
    return cacheBases_[baseId];
  }

  var base = leerBases()[baseId];
  var resultado;

  if (!base) {
    resultado = { ok: false, motivo: 'La base "' + baseId + '" no está registrada en BASES' };
  } else if (!base.activo) {
    resultado = { ok: false, motivo: 'La base "' + baseId + '" está marcada como inactiva' };
  } else if (!base.sheet_id) {
    resultado = { ok: false, motivo: 'La base "' + baseId + '" no tiene sheet_id cargado' };
  } else {
    try {
      resultado = { ok: true, base: base, libro: SpreadsheetApp.openById(base.sheet_id) };
    } catch (e) {
      resultado = { ok: false, motivo: 'No se pudo abrir la base "' + baseId + '": ' + e.message };
    }
  }

  cacheBases_[baseId] = resultado;
  return resultado;
}

function abrirHoja(baseId, nombreHoja) {
  var resultado = abrirBase(baseId);
  if (!resultado.ok) return resultado;

  var nombre = nombreHoja || resultado.base.hoja_default;
  // Paso 2.10 Parte C: hoja_default vacío es una decisión explícita (caso m2 — ver
  // SEED_BASES_), no un dato faltante por descuido. Mensaje propio para no confundirlo
  // con "no existe una hoja llamada ''", que no dice nada de por qué.
  if (!nombre) {
    return { ok: false, motivo: 'La base "' + baseId + '" no tiene hoja_default (sin fuente activa) y no se pasó una hoja explícita' };
  }
  var hoja = resultado.libro.getSheetByName(nombre);
  if (!hoja) {
    return { ok: false, motivo: 'La hoja "' + nombre + '" no existe en la base "' + baseId + '"' };
  }

  return { ok: true, base: resultado.base, libro: resultado.libro, hoja: hoja };
}

/**
 * Diagnóstico de conexión a las bases activas, sin UI. Separado de
 * `probarConexionBases()` en el Paso 1.8: el menú alerta, la API devuelve. Una
 * función que sólo sabe hablar por `alert()` no se puede probar desde afuera de
 * la planilla, y `SpreadsheetApp.getUi()` directamente rompe sobre HTTP.
 */
function diagnosticoBases_() {
  var bases = leerBases();
  var lineas = [];

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.activo) return;

    var resultado = abrirHoja(baseId);
    if (!resultado.ok) {
      lineas.push('⚠️ ' + baseId + ' — ' + resultado.motivo);
      return;
    }

    var nombresHojas = resultado.libro.getSheets().map(function (h) { return h.getName(); });
    lineas.push(
      '✅ ' + resultado.base.nombre + ' (' + baseId + ') — hojas: ' + nombresHojas.join(', ') +
      ' — filas en "' + resultado.hoja.getName() + '": ' + resultado.hoja.getLastRow()
    );
  });

  return lineas.length ? lineas : ['No hay bases activas registradas en BASES.'];
}

function probarConexionBases() {
  // Paso 2.14 — era el único caso protegido a mano (Paso 1.8) y pasa a `ui_()`, que
  // hace lo mismo y además anota el texto en `UI_DICHO_`. El retorno no cambia:
  // sigue siendo el resumen pelado, que es lo que verifica la prueba nº 3 del 1.8.
  var resumen = diagnosticoBases_().join('\n');
  var ui = ui_();
  ui.alert('Prueba de conexión a bases', resumen, ui.ButtonSet.OK);
  return resumen;
}

/**
 * Paso 2 — lectura por ventana (MAPEO + período).
 * Ver docs/Prompts/Paso-2.md y docs/Prompts/VERIFICACION_Paso-2.md.
 */

/**
 * Columna clave de una base para descartar filas basura del conteo (Paso
 * 2.3): `campo_logico='clave'` en MAPEO si existe para esa solapa; si no,
 * `campo_logico='campana'` como fallback; si no hay ninguna, `{ ok:false }` —
 * el llamador cae al criterio de fila 100% vacía. `solapa` es obligatoria
 * (Paso 2.3.2, `buscarMapeo`): la resuelve el llamador, que ya sabe qué hoja
 * está leyendo.
 */
function resolverClave_(baseId, solapa) {
  var clave = buscarMapeo(baseId, solapa, 'clave');
  if (clave.ok) return clave;
  return buscarMapeo(baseId, solapa, 'campana');
}

/**
 * Las tres guardas de `R-19`: una fuente que dejó de traer **no es un dato, es una falla**.
 *
 * **Capa 1 · centinela de error en el encabezado.** Si la fila de encabezado contiene un valor
 * de error de Sheets, el espejo se rompió. **La lista vive en `CONFIG.centinelas_lectura`, no
 * acá**: es un valor que puede cambiar sin que cambie la lógica (`D-01`) — Google puede sumar
 * un código de error mañana. Vacío en `CONFIG` = se usa la lista de arranque de
 * `SEED_CONFIG_DEFAULTS_`, no "sin chequeo": desactivarla tiene que ser una decisión escrita,
 * no un descuido.
 *
 * **Capa 2 · cero filas en una solapa `fuente`.** Medido el 08/08: las **19** solapas
 * declaradas `fuente` traen datos, así que ninguna se convierte en falla por esto. Una que
 * empiece a dar cero **cambió**, y eso hay que verlo.
 *
 * **Capa 3 · el piso declarado.** `SOLAPAS.filas_minimas`, **vacío = sin chequeo**. Cubre la
 * degradación parcial —el espejo responde pero trae 12 filas de 4889—, que las dos primeras no
 * ven. Los pisos los fija una persona editando la celda, sin tocar código.
 *
 * **El motivo nombra la solapa y el centinela encontrado**, no dice "error de lectura": quien
 * lo lea a las siete de la mañana necesita saber que se le cayó un permiso del otro lado.
 */
function verificarLecturaDeFuente_(baseId, solapa, headers, filasDeDatos) {
  var uso = usoSolapa_(baseId, solapa);

  // Capa 1 — vale para toda solapa, sea `fuente` o no: un `#REF!` es un `#REF!`.
  var centinelas = centinelasDeLectura_();
  for (var i = 0; i < headers.length; i++) {
    var celda = String(headers[i] === null || headers[i] === undefined ? '' : headers[i]).trim();
    if (!celda) continue;
    if (centinelas.indexOf(celda.toUpperCase()) !== -1) {
      return {
        ok: false,
        motivo: '«FALTA:lectura@' + baseId + '/' + solapa + '» — el encabezado trae "' + celda +
          '" en la columna ' + (i + 1) + '. Es una solapa espejo cuyo `IMPORTRANGE` dejó de ' +
          'traer: revisá el permiso de la planilla de origen, que se revoca del otro lado y no avisa. ' +
          '**No son cero filas: es una fuente caída** (`R-19`).'
      };
    }
  }

  // Las capas 2 y 3 sólo aplican a lo declarado `fuente`: una `referencia` puede estar vacía.
  if (uso !== 'fuente') return { ok: true };

  if (filasDeDatos === 0) {
    return {
      ok: false,
      motivo: '«FALTA:lectura@' + baseId + '/' + solapa + '» — la solapa está declarada ' +
        '`uso = fuente` y devolvió **cero filas de datos**. Una fuente vacía no es un período ' +
        'sin actividad: es una lectura que falló (`R-19`). Si de verdad puede venir vacía, ' +
        'la solapa no es `fuente`.'
    };
  }

  var piso = pisoDeFilasDeSolapa_(baseId, solapa);
  if (piso !== null && filasDeDatos < piso) {
    return {
      ok: false,
      motivo: '«FALTA:lectura@' + baseId + '/' + solapa + '» — trajo ' + filasDeDatos +
        ' fila(s) y `SOLAPAS.filas_minimas` declara un piso de ' + piso + '. Es una fuente que ' +
        'responde pero trae mucho menos de lo habitual (`R-19`).'
    };
  }

  return { ok: true };
}

/** Los centinelas de error, normalizados a mayúsculas. De `CONFIG`, con el seed como piso. */
function centinelasDeLectura_() {
  var declarados = String(leerConfig().centinelas_lectura || '').trim();
  var texto = declarados || SEED_CONFIG_DEFAULTS_.centinelas_lectura || '';
  return String(texto).split(',')
    .map(function (c) { return c.trim().toUpperCase(); })
    .filter(function (c) { return c !== ''; });
}

/** `SOLAPAS.filas_minimas` como número, o `null` si está vacío (= sin chequeo). */
function pisoDeFilasDeSolapa_(baseId, solapa) {
  var todas = leerSolapas();
  var fila = todas[baseId] && todas[baseId][solapa];
  if (!fila) return null;
  var crudo = String(fila.filas_minimas === undefined || fila.filas_minimas === null ? '' : fila.filas_minimas).trim();
  if (crudo === '') return null;
  var n = Number(crudo);
  return isNaN(n) ? null : n;
}

/**
 * Ventana de fechas por token, en orden de prioridad: campaña > periodo_ref
 * (PERIODOS) > período principal (CONFIG). Devuelve fechas como Date.
 */
function resolverVentana(opciones) {
  opciones = opciones || {};

  if (opciones.campana) {
    /* `CAMPANAS` pasó a leerse como **lista** (18/08), así que un `campana_id` puede traer
     * **varias filas** —una por semana en que se eligió—. La que vale es la del `periodo_id` del
     * ítem, que `itemsDeSeccion_` pasa junto con el id.
     *
     * ⚠ **Si quedan dos, FALLA en vez de elegir.** Tomar la primera sería mover la pérdida
     * silenciosa del lector al consumidor: el motor publicaría la ventana de una semana ajena y
     * el número saldría plausible. Es el modo de falla más caro del proyecto. */
    var filas = filasDeCampana_(opciones.campana, opciones.periodo_id);
    if (!filas.length) {
      return {
        ok: false,
        motivo: 'La campaña "' + opciones.campana + '" no existe en CAMPANAS' +
          (opciones.periodo_id ? ' para el período "' + opciones.periodo_id + '"' : '')
      };
    }
    if (filas.length > 1) {
      return {
        ok: false,
        motivo: 'La campaña "' + opciones.campana + '" tiene ' + filas.length + ' filas en ' +
          'CAMPANAS' + (opciones.periodo_id ? ' para el período "' + opciones.periodo_id + '"' : '') +
          ' — ambigua. La clave real es (campana_id, periodo_id): dos filas con el mismo par es ' +
          'un duplicado que hay que resolver en la hoja, no acá.'
      };
    }
    var campana = filas[0];
    var desdeCampana = parsearFechaCelda_(campana.desde);
    var hastaCampana = parsearFechaCelda_(campana.hasta);
    if (!desdeCampana || !hastaCampana) {
      return { ok: false, motivo: 'La campaña "' + opciones.campana + '" no tiene desde/hasta válidos' };
    }
    return { ok: true, desde: desdeCampana, hasta: hastaCampana, origen: 'campana:' + opciones.campana };
  }

  if (opciones.periodo_ref) {
    var periodos = leerPeriodos();
    var periodo = periodos[opciones.periodo_ref];
    if (!periodo) {
      return { ok: false, motivo: 'periodo_ref "' + opciones.periodo_ref + '" no existe en PERIODOS' };
    }
    var desdePeriodo = parsearFechaCelda_(periodo.desde);
    var hastaPeriodo = parsearFechaCelda_(periodo.hasta);
    if (!desdePeriodo || !hastaPeriodo) {
      return { ok: false, motivo: 'PERIODOS "' + opciones.periodo_ref + '" no tiene desde/hasta válidos' };
    }
    return { ok: true, desde: desdePeriodo, hasta: hastaPeriodo, origen: 'periodo_ref:' + opciones.periodo_ref };
  }

  // ---- Eslabón 3 (Paso 3 v3 Parte B, D-20): la sección ------------------------------
  // Va DEBAJO del `periodo_ref` del marcador y ENCIMA de `CONFIG`. El criterio es de más
  // específico a más general, y un marcador puntual es más específico que la sección que lo
  // contiene: lo fija el Addendum 1 de `D-20`, que además aclara que el Paso 3 lo
  // **implementa, no lo decide**.
  //
  // Vacío acá significa "usá el eslabón siguiente" — lo contrario que `periodo_id` vacío en
  // `CAMPANAS`/`REUNIONES`, donde la fila **no entra a ningún informe** (`D-19`). Están
  // escritos uno al lado del otro a propósito, para que nadie los unifique.
  if (opciones.seccion_id) {
    var secciones = leerSeccionesPlano_();
    var seccion = secciones[opciones.seccion_id];
    if (!seccion) {
      return { ok: false, motivo: 'La sección "' + opciones.seccion_id + '" no existe en SECCIONES' };
    }
    var refSeccion = String(seccion.periodo_ref || '').trim();
    if (refSeccion) {
      var periodosSeccion = leerPeriodos();
      var periodoSeccion = periodosSeccion[refSeccion];
      if (!periodoSeccion) {
        return {
          ok: false,
          motivo: 'SECCIONES."' + opciones.seccion_id + '".periodo_ref = "' + refSeccion + '" no existe en PERIODOS'
        };
      }
      var desdeSeccion = parsearFechaCelda_(periodoSeccion.desde);
      var hastaSeccion = parsearFechaCelda_(periodoSeccion.hasta);
      if (!desdeSeccion || !hastaSeccion) {
        return { ok: false, motivo: 'PERIODOS "' + refSeccion + '" no tiene desde/hasta válidos' };
      }
      return {
        ok: true, desde: desdeSeccion, hasta: hastaSeccion,
        origen: 'seccion:' + opciones.seccion_id + '→' + refSeccion
      };
    }
    // `periodo_ref` vacío: sigue la cadena, no es un error.
  }

  // ---- Eslabón 4: CONFIG -----------------------------------------------------------
  var cfg = leerConfig();
  var desdeCfg = parsearFechaCelda_(cfg.periodo_desde);
  var hastaCfg = parsearFechaCelda_(cfg.periodo_hasta);
  if (desdeCfg && hastaCfg) {
    return { ok: true, desde: desdeCfg, hasta: hastaCfg, origen: 'config' };
  }

  // ---- Eslabón 5: la semana de `R-11` ----------------------------------------------
  // **Último eslabón de la cadena, no una nota al margen** (`D-20` Addendum 1). Hasta hoy
  // acá la función devolvía error; ahora responde una semana. Lo cargado en `CONFIG` sigue
  // mandando siempre —`R-11` Addendum 1 punto 2: configurar es el caso normal, el cálculo es
  // el piso—, así que este eslabón sólo entra con `CONFIG` vacío o ilegible.
  //
  // `2026-08-20_2` Parte A, camino B (20/08/2026) — **la que se propone es la última semana
  // CERRADA**, no la que contiene a la fecha de corrida. El motivo de elegir B y no dejar el
  // cálculo acá y la propuesta en el panel: "el motor propone la semana por defecto" es **una**
  // afirmación, y con dos definiciones el panel diría una semana y el motor resolvería otra
  // —divergen justo el viernes, que es el día en que se genera `jm`—.
  var semana = ultimaSemanaCerradaR11_(new Date());
  return {
    ok: true, desde: semana.desde, hasta: semana.hasta, origen: 'R-11 (calculado)',
    calculado: true,
    motivo_calculo: desdeCfg || hastaCfg
      ? 'CONFIG tiene una sola de las dos fechas cargada o ilegible'
      : 'CONFIG.periodo_desde/periodo_hasta vacíos'
  };
}

/**
 * Paso 3 (v3) Parte B.3 — la semana de `R-11`: **siete días, viernes a jueves, con los dos
 * extremos inclusive** (`R-11` Addendum 1 punto 1; caso de referencia `vie 24/07 → jue
 * 30/07`). Se calcula respecto de una fecha de corrida.
 *
 * Cuál semana: la que **contiene** a `fechaCorrida`. Se retrocede hasta el viernes anterior
 * o igual, y ese viernes abre la ventana; el jueves siguiente la cierra. Si la corrida cae
 * un viernes, ese mismo viernes es el `desde` — el informe de una semana se arma sobre la
 * semana que arranca ese día, no sobre la anterior.
 *
 * **No valida nada.** Dos períodos consecutivos pueden solaparse o dejar hueco y eso es
 * válido y esperado (`R-11` Addendum 1 punto 3): esta función responde cuando nadie cargó
 * nada, no es un patrón contra el cual comparar lo que cargó una persona.
 */
function semanaR11_(fechaCorrida) {
  var VIERNES = 5; // getDay(): 0 domingo … 5 viernes
  var base = new Date(fechaCorrida.getFullYear(), fechaCorrida.getMonth(), fechaCorrida.getDate());

  var retroceso = (base.getDay() - VIERNES + 7) % 7;
  var desde = new Date(base.getFullYear(), base.getMonth(), base.getDate() - retroceso);
  var hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 6);

  return { desde: desde, hasta: hasta };
}

/**
 * `2026-08-20_2` Parte A (20/08/2026) — **la última semana cerrada**, viernes a jueves.
 *
 * **Decisión del usuario, 20/08/2026:** el motor propone la semana **cerrada** más reciente, no la
 * que contiene a la fecha de corrida. Corriendo el jueves 20/08 propone 14/08–20/08; corriendo el
 * viernes 21/08 **sigue proponiendo 14/08–20/08**, porque la semana que arranca ese viernes todavía
 * no cerró. Entra como Addendum a `R-11`, **no como derogación**: `R-11` define qué es la semana
 * —siete días, viernes a jueves, extremos inclusive— y nunca dijo **cuál** se elige respecto de la
 * fecha de corrida. Eso lo eligió el código sin regla detrás.
 *
 * ⭐ **Reusa `semanaR11_` y NO reimplementa el corte viernes–jueves.** La forma, que es la mitad del
 * valor de esta función: **el jueves anterior o igual a la fecha de corrida es el último día de su
 * propia semana**, así que la última semana cerrada es la que `semanaR11_` devuelve para ese jueves.
 * Un segundo cálculo del corte es el error que este repo ya cometió cuatro veces (`CLAUDE.md` §4);
 * acá el corte sigue viviendo en un solo lugar y esto es una elección de **qué fecha preguntarle**.
 *
 * ⚠ **`semanaR11_` no cambia de comportamiento y su control positivo queda intacto.** Sigue
 * devolviendo la semana que **contiene** a la fecha, que es lo que necesita
 * `diagEncuentrosPorSemana_` para agrupar un encuentro por su semana — ahí "la última cerrada" no
 * significa nada, porque la pregunta es sobre un hecho pasado y no sobre una propuesta.
 *
 * **El viernes es el único día donde las dos lecturas difieren**, y es justo el día en que se
 * genera `jm`. El jueves coinciden —cierra su propia semana en las dos—, así que un fixture de
 * jueves **no distingue las dos funciones**: el caso que las separa es el viernes.
 */
function ultimaSemanaCerradaR11_(fechaCorrida) {
  var JUEVES = 4; // getDay(): 0 domingo … 4 jueves
  var base = new Date(fechaCorrida.getFullYear(), fechaCorrida.getMonth(), fechaCorrida.getDate());

  // El jueves anterior o igual. Si la corrida ES jueves, el retroceso es cero: el jueves cierra
  // su propia semana, y eso vale en las dos lecturas.
  var retroceso = (base.getDay() - JUEVES + 7) % 7;
  var jueves = new Date(base.getFullYear(), base.getMonth(), base.getDate() - retroceso);

  return semanaR11_(jueves);
}

/* ============ Paso 2.16 (D-21) — lista blanca de valores por columna ============ */

/**
 * Normaliza los dos lados antes de comparar: colapsa espacios internos y recorta los
 * bordes, **preservando mayúsculas y acentos**.
 *
 * Por qué no se reusa ninguno de los tres normalizadores que ya existen — la pregunta
 * se hizo explícita antes de escribir el cuarto:
 *   - `normalizar_` (Parseo.gs) baja a minúsculas y saca acentos. Sirve para matchear
 *     nombres de barrio con tolerancia; acá colapsaría `Implementado` con `IMPLEMENTADO`
 *     y con cualquier variante acentuada, que es justo lo que `R-10` decidió NO hacer.
 *   - `normalizarParaComparar_` (Instalar.gs) canonicaliza fechas para el diff; para una
 *     columna de texto es `String(valor)` pelado, sin siquiera `trim()`.
 *   - `normalizarIdCuenta_` (Union.gs) es `String(valor).trim()` — el cuerpo más cercano,
 *     pero no colapsa espacios internos y su nombre dice "id de cuenta": reusarlo para
 *     estados sería mentir sobre qué compara.
 *
 * Esta es **exactamente la forma que `R-10` ya declara** —`colapsar(/\s+/ → ' ').trim()`,
 * sin tocar mayúsculas ni acentos— y que sigue **pendiente de implementar** para
 * encabezados. Se escribe acá con ese contrato para que, cuando la tarea de `R-10` entre,
 * use esta función y no aparezca un quinto normalizador.
 */
function normalizarValorDeclarado_(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace(/\s+/g, ' ').trim();
}

/**
 * Lee de MAPEO las columnas de esta (base, solapa) que declaran lista blanca.
 * Devuelve [] si no hay ninguna — el caso de las 120 filas que no la usan.
 *
 * Replica a propósito la guarda de `buscarMapeo`: sólo una solapa `uso = fuente` puede
 * filtrar. Acá se recorre `leerMapeo()` directo (hace falta el conjunto de columnas de la
 * solapa, no un campo puntual), así que la guarda no se hereda y hay que ponerla.
 */
function filtrosValoresIncluidos_(baseId, solapa) {
  if (usoSolapa_(baseId, solapa) !== 'fuente') return [];

  var mapa = leerMapeo();
  var campos = mapa[baseId] && mapa[baseId][solapa];
  if (!campos) return [];

  var filtros = [];
  Object.keys(campos).forEach(function (campoLogico) {
    var fila = campos[campoLogico];
    var declarado = normalizarValorDeclarado_(fila.valores_incluidos);
    if (!declarado || !fila.columna) return;

    // La coma es el separador (misma convención que INFORMES.familias y
    // SECCIONES.informes). Un valor que la contenga no se puede expresar, así que el
    // motor **para y avisa** en vez de partirlo mal y filtrar de menos en silencio.
    var permitidos = declarado.split(',').map(normalizarValorDeclarado_).filter(function (v) { return v !== ''; });
    if (!permitidos.length) return;

    filtros.push({
      campo_logico: campoLogico,
      columna: fila.columna,
      indice: columnaLetraAIndice_(fila.columna),
      declarado: declarado,
      permitidos: permitidos,
      etiqueta: baseId + '/' + solapa + '/' + campoLogico
    });
  });

  return filtros;
}

/**
 * ¿Pasa la fila todas las listas blancas declaradas para su solapa? Varias columnas con
 * lista blanca se combinan con Y — la fila tiene que pasar todas.
 *
 * Devuelve también el valor que la dejó afuera, que es lo que alimenta el conteo por
 * valor: excluir en silencio es el modo de falla que el motor evita en todo lo demás.
 */
function filaPasaListaBlanca_(fila, filtros) {
  for (var i = 0; i < filtros.length; i++) {
    var filtro = filtros[i];
    var valor = normalizarValorDeclarado_(fila[filtro.indice]);
    if (filtro.permitidos.indexOf(valor) === -1) {
      return { pasa: false, valor: valor, campo_logico: filtro.campo_logico };
    }
  }
  return { pasa: true, valor: '' };
}

/**
 * ¿La coma de la celda declarada es parte de un valor y no un separador? El motor no
 * puede adivinar la intención, pero sí reconocer la **firma exacta** de ese error: la
 * celda entera, sin partir, coincide con un valor real de la columna, y en cambio alguno
 * de los pedazos no coincide con ninguno. Ahí partirla filtraría de menos en silencio, y
 * la respuesta correcta es parar — no seguir con una lista blanca que nadie escribió.
 *
 * Con `Implementado, En curso` no hay falso positivo: esa cadena entera no es el valor de
 * ninguna celda.
 */
function comaDentroDeUnValor_(filasDatos, filtro) {
  if (filtro.permitidos.length < 2) return false;

  var presentes = {};
  filasDatos.forEach(function (fila) {
    presentes[normalizarValorDeclarado_(fila[filtro.indice])] = true;
  });

  if (!presentes[filtro.declarado]) return false;
  return filtro.permitidos.some(function (p) { return !presentes[p]; });
}

/**
 * Valores declarados en una lista blanca que no aparecen en ninguna fila. Casi siempre
 * es un tipeo en la celda de `MAPEO`, y sin este conteo se manifiesta como filas que
 * faltan en el informe, que es mucho más caro de diagnosticar.
 */
function valoresDeclaradosSinFilas_(filasDatos, filtros) {
  var huerfanos = [];
  filtros.forEach(function (filtro) {
    var presentes = {};
    filasDatos.forEach(function (fila) {
      presentes[normalizarValorDeclarado_(fila[filtro.indice])] = true;
    });
    filtro.permitidos.forEach(function (permitido) {
      if (!presentes[permitido]) huerfanos.push(filtro.etiqueta + ' → "' + permitido + '"');
    });
  });
  return huerfanos;
}

/**
 * Fila completamente vacía (todas las celdas '', null, undefined o solo
 * espacios) — se descarta antes de clasificar por fecha, para que
 * `filas_sin_fecha` sirva para lo único que tiene que servir: filas con
 * datos pero sin fecha, no el resto en blanco de la hoja.
 */
function filaVacia_(fila) {
  for (var i = 0; i < fila.length; i++) {
    var valor = fila[i];
    if (valor === null || valor === undefined) continue;
    if (typeof valor === 'string' && valor.trim() === '') continue;
    return false;
  }
  return true;
}

/**
 * Convierte letra de columna (A, B, ..., Z, AA, AB, ...) a índice 0-based.
 */
function columnaLetraAIndice_(letra) {
  var resultado = 0;
  var texto = String(letra).trim().toUpperCase();
  for (var i = 0; i < texto.length; i++) {
    resultado = resultado * 26 + (texto.charCodeAt(i) - 64);
  }
  return resultado - 1;
}

/**
 * Parsea fechas de celdas (bases fuente y hojas de config) sin ambigüedad
 * mm/dd y sin el corrimiento de día de `new Date(texto)` sobre ISO (que lo
 * interpreta como UTC medianoche y en Buenos Aires cae en el día anterior).
 * Sheets suele devolver un objeto Date ya resuelto para celdas con formato de
 * fecha; si llega texto, se parte a mano — nunca `new Date(texto)` ni
 * `Date.parse` sobre texto. Acepta `aaaa-mm-dd` (CONFIG/PERIODOS/CAMPANAS) y
 * `dd/mm/aaaa` o `dd-mm-aaaa` (bases fuente).
 */
function parsearFechaCelda_(valor) {
  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : valor;
  }
  if (typeof valor !== 'string' || !valor.trim()) return null;
  var texto = valor.trim();

  var iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    var fechaIso = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return isNaN(fechaIso.getTime()) ? null : fechaIso;
  }

  var m = texto.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!m) return null;

  var dia = Number(m[1]);
  var mes = Number(m[2]);
  var anio = Number(m[3]);
  if (anio < 100) anio += 2000;

  var fecha = new Date(anio, mes - 1, dia);
  return isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * Paso 2.11 Parte B — `fila_encabezado` es un atributo de la SOLAPA, no de la base
 * (`BASES.fila_encabezado=3` acertaba para las dos vistas "M2 periodo *" de `m2` y
 * fallaba en silencio para las otras siete: leía una fila de datos como si fueran
 * títulos, sin fallar — devolvía columnas con nombres raros y números plausibles).
 * `SOLAPAS.fila_encabezado` es la fuente; `filaEncabezadoBase` (`BASES.fila_encabezado`)
 * es solo el default para una solapa que todavía no está declarada en `SOLAPAS`.
 * `0` es un valor explícito ("sin fila de títulos", ver `filaSolapa_`, Instalar.gs) y
 * se respeta tal cual — no cae al default de la base, que sería tratarlo como "sin dato".
 */
function resolverFilaEncabezado_(baseId, solapa, filaEncabezadoBase) {
  var solapas = leerSolapas();
  var fila = solapas[baseId] && solapas[baseId][solapa];
  if (fila && fila.fila_encabezado !== '' && fila.fila_encabezado !== null && fila.fila_encabezado !== undefined) {
    var n = Number(fila.fila_encabezado);
    if (!isNaN(n)) return n;
  }
  return Number(filaEncabezadoBase) || 1;
}

/* ===================== `R-16` — la ventana entra por SOLAPE (07/08/2026) =====================
 *
 * **Una fila entra si sus días activos tocan la ventana**, no si empieza adentro:
 * `inicio ≤ hasta` **y** `fin ≥ desde`. Es `R-14` aplicada, y el motivo de dominio está en
 * `R-16`: **las campañas suelen empezar unos tres días antes**, así que "empieza en la
 * ventana" pierde justo las que importan. El caso medido: las dos campañas de IVR del
 * encuentro de Orden Público arrancan el 22 y el 23/07 con ventana 24–30/07, y siguen activas
 * toda la semana — IVR daba **cero por un día**.
 *
 * **Vive acá, en un solo lugar, a propósito.** El recorte por ventana se decide en **dos**
 * puntos del motor: la rama `filtrar` de `leerFuente` (bases `rdv`, `looker`) y el recorte del
 * agregado global de `Generador.gs` (`digital`, que es `snapshot`). Dos criterios distintos
 * sobre la misma pregunta es exactamente la divergencia que este repo ya pagó con los 195
 * contra 172; los dos llaman a esta función.
 *
 * **Comparación por string `yyyy-MM-dd`, no por epoch**, por el mismo motivo que ya estaba
 * escrito en `leerFuente`: V8 construye `Date` en UTC aunque el spreadsheet tenga otro huso, y
 * comparar timestamps crudos corre un día en los bordes. Bordes inclusivos de los dos lados.
 *
 * **Sin fecha de fin, el criterio NO cambia** (`R-16`, y `A.2` del prompt del 07/08): la fila
 * entra por su fecha única, como siempre. **No se le asume un fin implícito** — un criterio
 * distinto aplicado en silencio a un subconjunto es el número plausible que este proyecto
 * persigue. Quién tiene fin y quién no lo declara `MAPEO.fecha_fin_periodo`, y el que llama
 * **dice en la traza cuál de los dos criterios usó**.
 */
/* ===================== La ventana POR REFERENCIA (`_23`, 10/08/2026) =====================
 *
 * **El problema.** `looker/DIGITAL` tiene todo lo que hace falta para las impresiones menos
 * el tiempo: `nombre_campaña` resuelve el corte JM, `estado` el filtro, `Plataforma` e
 * `Impresiones` el desglose. **No tiene ninguna columna temporal** (`C-19`): `fecha_inicio` y
 * `fecha_fin` viven en `looker/Cuentas`. Hasta hoy eso la dejaba fallando con
 * `«FALTA:fecha_periodo@looker/DIGITAL»`, que es el modo de falla correcto y también el
 * final del camino.
 *
 * **Y no es un join, que es lo que decide el diseño.** Un join produce filas nuevas; esto
 * sólo tiene que decidir si una fila entra o no. `DIGITAL` **no toma ningún dato** de
 * `Cuentas` —ni el nombre, ni el estado, ni las fechas—: necesita saber si su clave está
 * **dentro del conjunto** de las que caen en la ventana.
 *
 * La consecuencia práctica sola justifica el enfoque: **si la clave estuviera repetida del
 * lado de la referencia, un join multiplicaría las filas y las impresiones se contarían dos
 * veces sin fallar.** Un conjunto de pertenencia es inmune —un id repetido entra una vez—,
 * así que el modo de falla más caro desaparece por construcción y no por cuidado. (Medido el
 * 10/08 por las dudas: `Cuentas` tiene 1011 filas y 1011 ids distintos, cero repetidos.)
 *
 * **Dónde se declara, y por qué en dos hojas distintas.** Son dos preguntas de grano
 * distinto y `CLAUDE.md` §7 pide un dueño por pregunta:
 *
 *   - *¿De qué solapa saca la fecha ésta?* → **`SOLAPAS.ventana_ref`**. No es una columna de
 *     la solapa: es una propiedad de la solapa, del mismo grano que `uso` y
 *     `fila_encabezado`, que es exactamente lo que `SOLAPAS` registra.
 *   - *¿Cuál es la columna de la clave?* → **`MAPEO`, campo lógico `clave_ventana`**, una
 *     fila de cada lado. Eso es literalmente para lo que existe `MAPEO`, y resuelve gratis un
 *     problema medido: los encabezados **no coinciden** —`Cuentas` dice `id_cuentas` y
 *     `DIGITAL` dice `Id cuentas`—, así que la clave nunca puede resolverse por texto.
 *
 * **Lo descartado, con el motivo:** meter las dos cosas en `MAPEO`, con campos lógicos
 * `ventana_ref_solapa` y `ventana_ref_clave`. Obligaba a poner un **nombre de solapa** en la
 * columna `columna`, que en esa hoja significa una letra: `columnaLetraAIndice_` haría
 * cualquier cosa con ese string, `tipo_esperado` dejaría de aplicar y `backfillSolapaMapeo_`
 * y las auditorías leerían una fila que miente sobre su propio grano. La segunda descartada
 * —las dos cosas en `SOLAPAS`, con la letra de la clave en una columna nueva— pone «qué
 * columna es qué» en un segundo lugar además de `MAPEO`, que es la divergencia que §7 existe
 * para evitar.
 *
 * **Un solo nivel, y el segundo falla con motivo propio** (`validarReferenciaVentana_`). Sin
 * ese tope una referencia circular cuelga la corrida, y el ciclo más corto —una solapa que se
 * referencia a sí misma— es el más fácil de tipear.
 *
 * **Los cuatro conteos, y por qué van separados.** Es `R-20` aplicado: *un vacío no es un
 * valor*. Una fila que sale por no tener clave no salió por la misma razón que una cuya clave
 * no existe del otro lado, ni que una cuya clave existe pero cayó fuera de la ventana. Los
 * tres números son lo que hace que un total corto se pueda explicar en vez de discutir, y por
 * eso **suman**:
 *
 *     filas_en_ventana + filas_fuera_de_ventana + filas_sin_clave_ventana
 *       + filas_clave_huerfana + filas_excluidas_por_valor  =  filas_totales
 *
 * **El costo.** La solapa de referencia se lee **una vez por corrida y por ventana**, no una
 * vez por marcador: `cacheClavesVentana_` es una variable de módulo, misma vida y mismo
 * criterio que `cacheBases_` — muere con la ejecución de Apps Script, no es `CacheService`,
 * no cruza pedidos. La clave del caché incluye las dos fechas, así que dos ventanas distintas
 * en la misma corrida no se pisan. Lo invalida el fin de la ejecución y nada más: ningún
 * escritor del motor toca una base, que son de dueños ajenos y sólo se leen.
 * ======================================================================================= */

/** El conjunto de claves en ventana de cada (base, solapa de referencia, ventana). */
var cacheClavesVentana_ = {};

/**
 * `_44` / `D-30` — `SOLAPAS.campo_id_cuenta` normalizado. `''` = esta solapa **no** se selecciona
 * por cuenta y se lee como hasta hoy.
 *
 * Devuelve el **campo lógico** que lleva el `id_cuenta` en esa solapa, no la letra de columna: la
 * letra vive en `MAPEO`, que es su dueño, y ponerla acá sería la segunda copia de un dato que ya
 * tiene lugar. Mismo criterio que `ventana_ref`, que declara la solapa de referencia y deja la
 * clave del cruce en `MAPEO.clave_ventana` (`D-24`).
 *
 * **Por solapa y no por base**, y no es simetría: `C-50` midió que el par PRE/POST comparte el
 * mismo `ID` en **dos solapas distintas** de la misma base, así que la clave del par es
 * `(ID, solapa)`. Una declaración por base no podría distinguirlas.
 */
function campoIdCuentaDeSolapa_(baseId, solapa) {
  var solapas = leerSolapas();
  var fila = solapas[baseId] && solapas[baseId][solapa];
  if (!fila) return '';
  var crudo = fila.campo_id_cuenta;
  return String(crudo === null || crudo === undefined ? '' : crudo).trim();
}

/* ⭐ 2026-08-28 - el valor reservado de `SOLAPAS.ventana_ref`: no es el nombre de una solapa,
 * es la declaracion de que ESTA solapa manda sobre el `modo_periodo` de su base. */
var VENTANA_PROPIA_ = 'propia';

/** `SOLAPAS.ventana_ref` normalizado. `''` = esta solapa tiene su propia `fecha_periodo`. */
function referenciaDeVentana_(baseId, solapa) {
  var solapas = leerSolapas();
  var fila = solapas[baseId] && solapas[baseId][solapa];
  if (!fila) return '';
  var crudo = fila.ventana_ref;
  return String(crudo === null || crudo === undefined ? '' : crudo).trim();
}

/**
 * La regla de un nivel. **Pura y con el mapa de solapas por parámetro** para que el control
 * positivo pueda armar el caso circular sin escribir en `SOLAPAS` — mismo criterio que
 * `hojaFalsa_` en `Pruebas.gs`: una regla que sólo se puede probar rompiendo la planilla no
 * se prueba nunca.
 */
function validarReferenciaVentana_(mapaSolapas, baseId, solapa) {
  var propia = mapaSolapas[baseId] && mapaSolapas[baseId][solapa];
  var ref = String((propia && propia.ventana_ref) || '').trim();
  if (!ref) return { ok: true, hay: false };

  var etiqueta = baseId + '/' + solapa;
  if (ref === solapa) {
    return {
      ok: false,
      motivo: '«FALTA:ventana_ref@' + etiqueta + '» — la solapa se declara a sí misma como ' +
        'referencia de ventana. Es un ciclo de largo uno: si tiene fecha propia, `ventana_ref` ' +
        'va vacía; si no la tiene, la referencia es a otra solapa.'
    };
  }

  var destino = mapaSolapas[baseId] && mapaSolapas[baseId][ref];
  if (!destino) {
    return {
      ok: false,
      motivo: '«FALTA:ventana_ref@' + etiqueta + '» — declara `ventana_ref = "' + ref + '"` y ' +
        'esa solapa no está registrada en SOLAPAS para la base "' + baseId + '".'
    };
  }
  if (destino.uso !== 'fuente') {
    return {
      ok: false,
      motivo: '«FALTA:ventana_ref@' + etiqueta + '» — la solapa de referencia "' + ref +
        '" está declarada `uso = ' + (destino.uso || '(sin registrar)') + '` y no `fuente`. ' +
        'Una solapa que no se puede leer tampoco puede prestar su ventana.'
    };
  }

  var segundoNivel = String(destino.ventana_ref || '').trim();
  if (segundoNivel) {
    return {
      ok: false,
      motivo: '«FALTA:ventana_ref@' + etiqueta + '» — la referencia es de **un solo nivel** y ' +
        'ésta tiene dos: "' + solapa + '" apunta a "' + ref + '", que a su vez apunta a "' +
        segundoNivel + '". Sin este tope una cadena circular cuelga la corrida en vez de fallar.'
    };
  }

  return { ok: true, hay: true, solapa_ref: ref };
}

/**
 * El conjunto de claves de la solapa de referencia: las que caen en la ventana, y el universo
 * completo. Los dos hacen falta y no son lo mismo — sin el universo, una clave que existe del
 * otro lado pero cayó fuera de la ventana se confunde con una huérfana, que es la diferencia
 * entre "esta semana no corrió" y "este id no existe en ninguna parte".
 *
 * **Las en-ventana salen de `leerFuente` sobre la solapa de referencia**, no de una relectura
 * propia: así el recorte usa el mismo `entraPorSolape_`, el mismo fallback a
 * `getDisplayValues()` y las mismas guardas de `R-19` que cualquier otra fuente. Reimplementar
 * acá el recorte sería la forma más cara de que las dos ventanas empiecen a diferir.
 *
 * **El universo sí se lee directo, y sólo esa columna**: "qué claves existen" no es una
 * pregunta de ventana, así que no hay lógica del motor que reproducir — sólo la fila de
 * encabezado, que se resuelve con `resolverFilaEncabezado_`, la misma que usa `leerFuente`.
 */
function conjuntoDeClavesEnVentana_(baseId, solapaRef, ventana) {
  var ssTz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  var desdeStr = Utilities.formatDate(ventana.desde, ssTz, 'yyyy-MM-dd');
  var hastaStr = Utilities.formatDate(ventana.hasta, ssTz, 'yyyy-MM-dd');
  var claveCache = baseId + '||' + solapaRef + '||' + desdeStr + '||' + hastaStr;
  if (Object.prototype.hasOwnProperty.call(cacheClavesVentana_, claveCache)) {
    return cacheClavesVentana_[claveCache];
  }

  var resultado = calcularConjuntoDeClaves_(baseId, solapaRef, ventana);
  cacheClavesVentana_[claveCache] = resultado;
  return resultado;
}

/**
 * `R-30` — el tope de duración de `CONFIG`, leído con la misma forma que `umbralAnclajeReunion_()`
 * en `Union.gs`: la constante es **sólo el default si `CONFIG` no lo trae**, y nunca se usa directo.
 *
 * ⚠ **El default es `0` = desactivado, y es deliberado.** Un default distinto de cero cambiaría
 * números publicados **en cualquier instalación que todavía no sembró la clave**, en silencio. El
 * valor de negocio lo pone el seed (`SEED_CONFIG_DEFAULTS_`), que sí es visible en el diff de
 * `instalar()`.
 */
var TOPE_DIAS_VENTANA_CUENTA_DEFECTO_ = 0;

function topeDiasVentanaCuenta_() {
  var valor = Number(leerConfig().tope_dias_ventana_cuenta);
  if (isNaN(valor) || valor < 0) return TOPE_DIAS_VENTANA_CUENTA_DEFECTO_;
  return valor;
}

function calcularConjuntoDeClaves_(baseId, solapaRef, ventana) {
  var etiqueta = baseId + '/' + solapaRef;

  var campoClave = buscarMapeo(baseId, solapaRef, 'clave_ventana');
  if (!campoClave.ok) {
    return {
      ok: false,
      motivo: '«FALTA:clave_ventana@' + etiqueta + '» — es la solapa de referencia de una ' +
        'ventana y no declara con qué columna se cruza: ' + campoClave.motivo
    };
  }

  var lectura = leerFuente(baseId, ventana, solapaRef);
  if (!lectura.ok) {
    return {
      ok: false,
      motivo: 'no se pudo recortar la solapa de referencia ' + etiqueta + ': ' + lectura.motivo
    };
  }

  var idx = columnaLetraAIndice_(campoClave.columna);
  var encabezado = lectura.encabezados[idx];
  var enVentana = {};
  var tamano = 0;
  var sinClave = 0;

  /* `R-30` (22/08/2026) — **el tope de duración: una cuenta cuya ventana declarada es más larga
   * que el tope NO entra a una ventana semanal por pertenencia.**
   *
   * **Por qué existe, con el número que lo motivó:** `X-29` midió que **la `fecha_fin` de una
   * cuenta se extiende sola** —27 de 959 entre dos exports, mediana 21 días, **máximo 157**— y que
   * la ventana **14–20/08** pasa de **14 cuentas a 32**: **18 entran sólo por la deriva, +129 %**.
   * La peor es `2976-MAYPCCVC`, *"Campañas genéricias RDV JM"*, **27/07 → 31/12**, que aporta
   * **15,4 M de los 25,6 M** de Programmatic y **entra por las tres plataformas**. Una campaña
   * genérica de siete meses **solapa cualquier semana del año**, así que atribuirla a una es
   * exactamente el número plausible de `CLAUDE.md` §4, producido por el dato.
   *
   * ⭐ **Por qué acá y no en `leerFuente`:** esto corrige **la pertenencia**, no el recorte por
   * fecha propia. Una solapa con su columna temporal ya se recorta bien; el problema es sólo de
   * las que **toman la ventana prestada** (`ventana_ref`, `_23`/`D-24`). Ponerlo en `leerFuente`
   * cambiaría también lo que ya funciona.
   *
   * ⚠ **La descartada, y el motivo, porque va a volver a proponerse:** la otra salida era
   * **congelar la ventana de una cuenta la primera vez que se la ve**. Se midió y **se cayó por su
   * propio caso**: de las 27 extendidas **17 movieron de verdad** —tienen filas nuevas o valores
   * que crecieron— y **`2976` es una de ellas**. O sea que congelar habría dado el número correcto
   * **por casualidad**, y habría hecho depender el resultado de **cuándo se vio la cuenta por
   * primera vez**, que no es una propiedad del negocio. Beneficiaba a 2 cuentas y perjudicaba a 17.
   *
   * ⛔ **Y esto NO resuelve `X-28`.** Que `duración ≤ 30 d` fuera uno de los tres desempates que
   * `X-28` no pudo separar **no es evidencia** de que sirva para aquello: `X-28` es *qué cuenta de
   * Call Center publica el Resumen* y necesita un tercer **deck publicado**. Son dos preguntas y se
   * cierran por separado.
   *
   * **El tope vive en `CONFIG.tope_dias_ventana_cuenta`** (`D-01`, `CLAUDE.md` §2: nada de valores
   * de negocio en el código). **`0` o vacío lo desactiva**, y eso es a propósito: el mecanismo
   * tiene que poder apagarse sin `clasp push` para comparar contra el comportamiento viejo.
   *
   * ⚠ **Las filas sin fecha NO se descartan acá.** No tener fecha no es tener una ventana larga:
   * `leerFuente` ya las cuenta en `filas_sin_fecha` y ésa es su discusión, no ésta. */
  var topeDias = topeDiasVentanaCuenta_();
  var mapIni = buscarMapeo(baseId, solapaRef, 'fecha_periodo');
  var mapFin = buscarMapeo(baseId, solapaRef, 'fecha_fin_periodo');
  var puedeTopar = topeDias > 0 && mapIni.ok && mapFin.ok;
  var encIni = puedeTopar ? lectura.encabezados[columnaLetraAIndice_(mapIni.columna)] : null;
  var encFin = puedeTopar ? lectura.encabezados[columnaLetraAIndice_(mapFin.columna)] : null;
  var fueraPorTope = 0;
  var clavesPorTope = {};

  lectura.filas.forEach(function (o) {
    var v = normalizarIdCuenta_(o[encabezado]);
    if (v === '') { sinClave++; return; }
    if (puedeTopar) {
      var d1 = parsearFechaCelda_(o[encIni]);
      var d2 = parsearFechaCelda_(o[encFin]);
      if (d1 && d2) {
        var dias = Math.round((d2.getTime() - d1.getTime()) / 86400000);
        if (dias > topeDias) { fueraPorTope++; clavesPorTope[v] = dias; return; }
      }
    }
    if (!Object.prototype.hasOwnProperty.call(enVentana, v)) { enVentana[v] = true; tamano++; }
  });

  var universo = universoDeClaves_(baseId, solapaRef, idx);
  if (!universo.ok) return universo;

  return {
    ok: true,
    solapa_ref: solapaRef,
    clave_ref: encabezado,
    claves: enVentana,
    tamano: tamano,
    todas: universo.claves,
    tamano_universo: universo.tamano,
    criterio_ventana_ref: lectura.criterio_ventana,
    filas_ref_totales: lectura.filas_totales,
    filas_ref_en_ventana: lectura.filas_en_ventana,
    filas_ref_sin_fecha: lectura.filas_sin_fecha,
    filas_ref_sin_clave: sinClave,
    /* ⭐ **La exclusión por tope se REPORTA, no se hace en silencio**, y es la mitad de `R-30`. Sin
     * estos dos campos el mecanismo saca cuentas del universo y nadie se entera — que es
     * literalmente el modo de falla que la regla vino a arreglar, con el signo cambiado.
     * `CLAUDE.md` §4: *un control tiene que declarar CUÁNTO midió; cero unidades es un problema, no
     * un silencio*. `tope_dias_aplicado: 0` significa **desactivado**, y se distingue de
     * `fuera_por_tope: 0`, que significa **activo y no sacó a nadie**. */
    tope_dias_aplicado: puedeTopar ? topeDias : 0,
    filas_ref_fuera_por_tope: fueraPorTope,
    claves_fuera_por_tope: clavesPorTope
  };
}

/** Todas las claves que existen en la solapa de referencia, sin mirar la ventana. */
function universoDeClaves_(baseId, solapaRef, idxClave) {
  var abierto = abrirHoja(baseId, solapaRef);
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };

  var filaEncabezado = resolverFilaEncabezado_(baseId, solapaRef, abierto.base.fila_encabezado);
  var datos = abierto.hoja.getDataRange().getValues();
  var claves = {};
  var tamano = 0;
  for (var f = filaEncabezado; f < datos.length; f++) {
    var v = normalizarIdCuenta_(datos[f][idxClave]);
    if (v === '') continue;
    if (!Object.prototype.hasOwnProperty.call(claves, v)) { claves[v] = true; tamano++; }
  }
  return { ok: true, claves: claves, tamano: tamano };
}

function entraPorSolape_(inicioStr, finStr, desdeStr, hastaStr) {
  if (!inicioStr) return false;
  // Sin fin declarado o sin fin en la fila: criterio de punto, el de siempre.
  var derecho = finStr || inicioStr;
  // Una fila con fin anterior al inicio está mal cargada. No se corrige ni se descarta acá:
  // se la trata como puntual sobre su inicio, que es lo que el motor hacía antes de `R-16`.
  if (derecho < inicioStr) derecho = inicioStr;
  return inicioStr <= hastaStr && derecho >= desdeStr;
}

/**
 * Lee una base filtrando por ventana de fechas (o todas las filas si
 * `modo_periodo=snapshot`). No suma ni promedia — eso es del Paso 3.
 * `nombreHojaOverride` permite leer una hoja distinta a `hoja_default` de la
 * misma base (caso M2: MAPEO tiene campos en "M2 periodo DIGITAL" además de
 * la hoja default "M2 periodo DIRECTA").
 */
/**
 * `2026-08-20_11` Parte A (20/08/2026) — **los datos crudos de una solapa, leídos UNA vez por
 * corrida.**
 *
 * ⭐ **El hallazgo: `leerFuente` no cacheaba nada.** `cacheBases_` guarda el **archivo abierto**,
 * pero cada llamada hacía su propio `getDataRange().getValues()` — una lectura completa de la
 * solapa. Y `leerFuente` se llama **una vez por marcador**, no una vez por solapa.
 *
 * **Medido sobre `MARCADORES` al 20/08:** un ítem de encuentro resuelve **38 marcadores** de las
 * familias `ecv_`/`enc_`, y esos 38 tocan **5 solapas distintas**:
 *
 * ```
 * rdv/RVD JM-CM - ES     17 marcadores -> 17 lecturas completas
 * reuniones/Agenda JM     9 marcadores ->  9
 * digital/Directa Mail    6 marcadores ->  6
 * digital/Directa IVR     5 marcadores ->  5
 * digital/Alcance         1 marcador   ->  1
 * ```
 *
 * **38 lecturas completas por ítem × 8 encuentros = 304.** Con caché, **40**. A ~0,65 s cada una
 * eso explica los **200 s** de la pasada por ítem, que era exactamente el número a bajar.
 *
 * ⚠ **La clave es `base‖hoja` y NO lleva la ventana, y eso es lo correcto — no un atajo.** Lo que
 * se cachea son **los datos crudos de la hoja**, que no dependen de ninguna ventana. Todo lo que
 * viene después —la fila de encabezado, las tres guardas de `R-19`, el recorte por ventana— sigue
 * corriendo igual sobre esos datos. **El recorte da exactamente las mismas filas**: lo único que
 * se evita es volver a pedirle a Sheets un array que ya está en memoria.
 *
 * ⚠ **Y por eso la trampa que el prompt marca no se toca:** `encontrarFilaRdvDeReunion_` arma una
 * ventana de un día por reunión, y **sigue armándola**. Sus ocho llamadas siguen recortando por
 * ocho ventanas distintas y devolviendo ocho conjuntos distintos de filas — lo que dejan de hacer
 * es releer `rdv` ocho veces. **Usar una ventana común habría cambiado qué filas ve el matcher, y
 * eso queda afuera.**
 *
 * **Apagado por defecto**, igual que `cacheRegistros_`: `null` significa *sin caché* y el
 * comportamiento es idéntico al de antes. Sólo `generarInforme` lo enciende, con `try/finally`.
 * Un diagnóstico que quiera leer dos veces la misma solapa y ver un cambio sigue pudiendo.
 */
var cacheDatosHoja_ = null;

function abrirCacheDatosHoja_() { cacheDatosHoja_ = {}; }
function cerrarCacheDatosHoja_() { cacheDatosHoja_ = null; }

/** Los valores crudos de la solapa, memoizados por corrida si el caché está abierto. */
function datosDeHoja_(baseId, hoja) {
  if (cacheDatosHoja_ === null) return hoja.getDataRange().getValues();
  var clave = baseId + '||' + hoja.getName();
  if (!Object.prototype.hasOwnProperty.call(cacheDatosHoja_, clave)) {
    cacheDatosHoja_[clave] = hoja.getDataRange().getValues();
  }
  return cacheDatosHoja_[clave];
}

function leerFuente(baseId, ventana, nombreHojaOverride, opcionesLectura) {
  var abierto = abrirHoja(baseId, nombreHojaOverride);
  if (!abierto.ok) return { ok: false, base_id: baseId, motivo: abierto.motivo };

  var base = abierto.base;
  var hoja = abierto.hoja;
  var filaEncabezado = resolverFilaEncabezado_(baseId, hoja.getName(), base.fila_encabezado);
  var modo = base.modo_periodo || 'filtrar';

  /* ⭐⭐ `2026-08-28` — **`SOLAPAS.ventana_ref = 'propia'`: esta solapa se recorta por SUS fechas,
   * aunque la base sea `snapshot`.**
   *
   * ⛔ **El problema que resuelve, medido.** `BASES.digital.modo_periodo = 'snapshot'` corta acá
   * abajo y devuelve **todas** las filas, así que `digital/CAMPAÑAS_DESGLOCE_DIGITAL` no llega
   * nunca a la lógica de fechas. Y el Resumen Ejecutivo del equipo **sí** recorta por solape de
   * campaña: medido contra el dashboard de Looker el 28/08, `JM` da **8 campañas** con
   * `inicio ≤ hasta && fin ≥ desde` y **4 o 5** con cualquier otro criterio.
   *
   * ⚠ **Por qué NO se infiere de que la solapa mapee las dos fechas**, que era la salida obvia:
   * **cuatro solapas de `digital` ya declaran `fecha_fin_periodo`** —`Digital`, `Directa IVR`,
   * `Seguimiento digital` y `Digital 2026 acumulado`—, así que inferirlo les cambiaría el universo
   * a tres solapas vivas sin que nadie lo pidiera. La declaración es explícita **por eso**.
   *
   * ⚠ **Y por qué NO se cambia `BASES.digital.modo_periodo` a `filtrar`:** eso toca **todas** sus
   * solapas, incluida `Directa Mail`, de donde salen los `mail_*` con casos validados. El alcance
   * de esto es **una celda, una solapa**.
   *
   * ⭐ **Reusa `ventana_ref` en vez de una columna nueva** porque es la misma pregunta —*¿de dónde
   * sale la ventana de esta solapa?*— con una tercera respuesta: un nombre de solapa es
   * pertenencia, vacío es «lo que diga la base», y `propia` es «mis propias fechas, y mando yo».
   *
   * ⚠ **El parámetro sigue ganando**: `sin_recorte_por_ventana` se aplica DESPUÉS, así que la
   * lectura por cuenta —los `u1_*`, el temario— sigue trayendo todo. El recorte no es propiedad de
   * la solapa sino de cómo se la lee, y esto no cambia esa doctrina: sólo agrega qué hace la
   * solapa cuando **nadie** pidió lo contrario. */
  var refCruda = referenciaDeVentana_(baseId, hoja.getName());
  var ventanaPropiaDeclarada = (String(refCruda || '').trim().toLowerCase() === VENTANA_PROPIA_);
  if (ventanaPropiaDeclarada) modo = 'filtrar';

  /* `_44` / `D-30` — **el llamador puede pedir la solapa sin recortar**, y sólo el llamador.
   *
   * Lo usa la rama por cuenta de `datosDeMarcador_`: cuando el ítem trae `id_cuenta`, **la
   * cuenta es el recorte** y volver a recortar por fecha dejaría láminas vacías —San Cristóbal
   * es del 23/07 y la ventana de julio arranca el 24 (`R-17`: el temario ya seleccionó)—. Es la
   * misma razón por la que la rama de `rdv` no recorta desde el `_28`.
   *
   * ⚠ **Va por parámetro y NO por una columna de `SOLAPAS`, y la diferencia importa.** Una
   * declaración por solapa apagaría el recorte para **todos** los lectores de esa solapa, y
   * `looker/resumen_metricas_dinamico` se lee de las dos formas: por cuenta para los `enc_*` y
   * como **agregado de la semana** para `frecuencia` y `gcba_frecuencia`. Apagárselo al agregado
   * le daría la suma de todos los períodos: grande, plausible y equivocada. El recorte no es
   * propiedad de la solapa — es propiedad de **cómo se la está leyendo**.
   *
   * Reusa la rama `snapshot` en vez de escribir un camino nuevo: "devolver todas las filas" ya
   * está implementado ahí, y duplicarlo sería tener dos definiciones de lo mismo. */
  if (opcionesLectura && opcionesLectura.sin_recorte_por_ventana) modo = 'snapshot';

  // Paso 2.11 Parte B: fila_encabezado=0 ("sin fila de títulos") no tiene de dónde
  // sacar nombres de columna — MAPEO no puede apuntar acá (buscarMapeo ya exige
  // uso=fuente, y ninguna solapa fuente puede tener 0), pero se guarda explícito por
  // si alguna vez se llama leerFuente directo sobre una de estas, sin pasar por MAPEO.
  if (filaEncabezado <= 0) {
    return { ok: false, base_id: baseId, motivo: 'La hoja "' + hoja.getName() + '" no tiene fila de encabezado (fila_encabezado=0 en SOLAPAS)' };
  }

  var datos = datosDeHoja_(baseId, hoja);
  if (datos.length < filaEncabezado) {
    return { ok: false, base_id: baseId, motivo: 'La hoja "' + hoja.getName() + '" no tiene fila de encabezado ' + filaEncabezado };
  }

  var headers = datos[filaEncabezado - 1];
  var filasCrudas = datos.slice(filaEncabezado);

  /* ── Las tres guardas del espejo (`R-19`, 08/08) ──────────────────────────────────────
   * Tres de las solapas fuente de `digital` son **espejos**: su contenido entra por
   * `IMPORTRANGE` desde planillas de terceros a las que esta cuenta no tiene acceso. **No hay
   * alternativa** —el espejo es la fuente— así que lo que se puede hacer es detectar cuándo
   * dejó de traer.
   *
   * **El modo de falla es silencioso y está medido (08/08).** Un `IMPORTRANGE` roto —permiso
   * revocado del otro lado, planilla borrada, id cambiado— **no tira, no vacía la hoja y no
   * devuelve un error**: deja **una fila** cuyo único valor es el **string** `"#REF!"`.
   * `getLastRow()` da 1, `typeof` da `string`. Sin estas guardas la cadena es: encabezado
   * `#REF!` → cero filas de datos → `SUMA` devuelve `sin_datos` → el token publica `«FALTA»`
   * → **nada falla**. Un permiso caído se vería igual que una semana sin campañas.
   * ─────────────────────────────────────────────────────────────────────────────────── */
  var guarda = verificarLecturaDeFuente_(baseId, hoja.getName(), headers, filasCrudas.length);
  if (!guarda.ok) {
    return { ok: false, base_id: baseId, solapa: hoja.getName(), motivo: guarda.motivo };
  }

  /* ⚠ **La colisión del prefijo posicional se MIDE, no se supone.** Si una solapa tuviera una
   * columna titulada `__pos__12`, su celda pisaría a la de la posición 12 y el marcador que lee por
   * posición devolvería el valor equivocado **sin fallar**. Es improbable y por eso mismo hay que
   * avisarlo: un supuesto que nadie verifica es el que muerde. */
  headers.forEach(function (h) {
    if (h && String(h).indexOf(PREFIJO_COLUMNA_POSICIONAL_) === 0) {
      Logger.log('⚠ D-31 · ' + baseId + '/' + hoja.getName() + ' tiene una columna titulada "' + h +
        '", que colisiona con el prefijo de lectura por posición. Los marcadores con ' +
        '`MAPEO.por_posicion` sobre esta solapa pueden leer la celda equivocada.');
    }
  });

  /* ⭐⭐ `2026-08-25` (`D-31` addendum) — **cada celda viaja TAMBIÉN por posición.**
   *
   * ⛔ **El problema que resuelve, medido:** este objeto se indexa **por título**, y en
   * `reuniones/Agenda JM | Post` el título `Visualizaciones` aparece **cuatro veces** (M, R, W, AB)
   * y `% VTR` otras cuatro. `obj[h] = fila[i]` hace que **gane el último** —Programmatic— y el
   * motor publicaba `21.229` donde el total es `41.204`. **La letra de `MAPEO` era correcta y el
   * lector nunca la usaba**: `valorPorColumna_` traduce la letra a título y ahí se pierde otra vez.
   *
   * ⭐ **Se agrega, no se reemplaza.** Las claves por título siguen exactamente igual, así que
   * ningún consumidor cambia de comportamiento. Lo único nuevo es que **existe una vía por
   * posición** para el marcador que la declare en `MAPEO` (`por_posicion`).
   *
   * ⚠ **El prefijo tiene que ser imposible como título de Sheets**, o una columna llamada
   * `__pos__12` pisaría la celda 12. Se verifica y se avisa abajo en vez de suponerlo. */
  function filaAObjeto(fila) {
    var obj = {};
    headers.forEach(function (h, i) {
      if (h) obj[h] = fila[i];
      obj[PREFIJO_COLUMNA_POSICIONAL_ + i] = fila[i];
    });
    return obj;
  }

  function celdaVacia_(valor) {
    return valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');
  }

  // Paso 2.9 Parte B: "vacía" y "sin clave" son conteos informativos, NUNCA un
  // filtro. `filasDatos` es SIEMPRE `filasCrudas` completo — todas las filas
  // entre `fila_encabezado` y el final de `getDataRange()`, sin excluir nada acá.
  var filasDatos = filasCrudas;
  var filasVacias = 0;
  var filasSinClave = 0;
  var clave = resolverClave_(baseId, hoja.getName());

  if (clave.ok) {
    var idxClave = columnaLetraAIndice_(clave.columna);
    filasCrudas.forEach(function (fila) {
      if (celdaVacia_(fila[idxClave])) filasSinClave++;
      if (filaVacia_(fila)) filasVacias++;
    });
  } else {
    filasCrudas.forEach(function (fila) {
      if (filaVacia_(fila)) filasVacias++;
    });
  }

  // Paso 2.16 (D-21) — lista blanca declarada en MAPEO.valores_incluidos. Se calcula
  // ANTES de bifurcar por modo, porque aplica igual a `snapshot` y a `filtrar`: la
  // primera base que lo usa (`digital`) es snapshot.
  //
  // NO toca `filasDatos`: el invariante del Paso 2.9 Parte B dice que es siempre
  // `filasCrudas` completo y que los conteos informativos cuentan sobre TODO. Se calcula
  // un vector de inclusión paralelo, así los índices siguen alineados con
  // `filasCrudasDisplay` (que la rama `filtrar` indexa por posición) y los conteos
  // viejos siguen significando lo mismo.
  var listaBlanca = filtrosValoresIncluidos_(baseId, hoja.getName());

  // Para y avisa antes de filtrar: una coma que era parte de un valor, no un separador.
  for (var f = 0; f < listaBlanca.length; f++) {
    if (comaDentroDeUnValor_(filasDatos, listaBlanca[f])) {
      return {
        ok: false,
        base_id: baseId,
        motivo: 'MAPEO.valores_incluidos de "' + listaBlanca[f].etiqueta + '" tiene una coma que ' +
          'parece parte del valor y no un separador: "' + listaBlanca[f].declarado + '" existe como ' +
          'valor de la columna, y alguno de los pedazos no. Partirla filtraría de menos en silencio.'
      };
    }
  }

  var incluida = [];
  var excluidasPorValor = {};
  var filasExcluidas = 0;
  filasDatos.forEach(function (fila, j) {
    var veredicto = filaPasaListaBlanca_(fila, listaBlanca);
    incluida[j] = veredicto.pasa;
    if (!veredicto.pasa) {
      filasExcluidas++;
      var etiqueta = veredicto.valor === '' ? '(vacío)' : veredicto.valor;
      excluidasPorValor[etiqueta] = (excluidasPorValor[etiqueta] || 0) + 1;
    }
  });

  var resultado = {
    ok: true,
    base_id: baseId,
    hoja: hoja.getName(),
    modo: modo,
    filas_excluidas_por_valor: filasExcluidas,
    excluidas_por_valor: excluidasPorValor,
    // Un valor declarado que no aparece en ninguna fila es casi siempre un tipeo
    // ('Implementadoo'), y sin este conteo se manifiesta como filas que faltan.
    valores_declarados_sin_filas: valoresDeclaradosSinFilas_(filasDatos, listaBlanca),
    fila_encabezado: filaEncabezado,
    columna_fecha: null,
    ventana_aplicada: null,
    filas_totales: filasDatos.length,
    filas_vacias: filasVacias,
    filas_sin_clave: filasSinClave,
    filas_en_ventana: 0,
    filas_sin_fecha: 0,
    filas_fecha_invalida: 0,
    // `_23` — la fila de encabezado tal cual se leyó. La necesita
    // `calcularConjuntoDeClaves_` para resolver el nombre real de la columna de la clave
    // sobre las filas que este mismo resultado devuelve. Resolverlo por afuera
    // (`encabezadoEnColumna_`, Union.gs) usaría `BASES.fila_encabezado` en vez de
    // `resolverFilaEncabezado_`, y donde las dos difieran el nombre no matchearía ninguna
    // propiedad: todas las claves saldrían vacías y el conjunto quedaría en cero **sin
    // fallar**. Devolver el encabezado que de verdad se usó saca esa clase de bug de raíz.
    encabezados: headers,
    filas: []
  };

  if (modo === 'snapshot') {
    resultado.filas = filasDatos.filter(function (fila, j) { return incluida[j]; }).map(filaAObjeto);
    resultado.filas_en_ventana = resultado.filas.length;
    return resultado;
  }

  /* ── `_23` · la tercera rama de la decisión de ventana ──────────────────────────────
   * Las otras dos —punto y solape— las decide `MAPEO.fecha_fin_periodo`, más abajo. Ésta la
   * decide `SOLAPAS.ventana_ref`, y **gana sobre la fecha propia cuando está declarada**: es
   * una declaración humana explícita y una columna de fecha en la misma solapa sería, en el
   * mejor caso, redundante. La traza dice cuál de las tres se usó, así que no hay forma de
   * que la elección quede muda. */
  /* ⚠ Con `propia` NO hay solapa de referencia: la declaracion ya se consumio arriba y aca
   * seguiria el camino de pertenencia, que buscaria una solapa llamada "propia". */
  var solapaRef = ventanaPropiaDeclarada ? '' : referenciaDeVentana_(baseId, hoja.getName());
  if (solapaRef) {
    var validacion = validarReferenciaVentana_(leerSolapas(), baseId, hoja.getName());
    if (!validacion.ok) {
      return { ok: false, base_id: baseId, solapa: hoja.getName(), motivo: validacion.motivo };
    }

    var campoClaveAca = buscarMapeo(baseId, hoja.getName(), 'clave_ventana');
    if (!campoClaveAca.ok) {
      return {
        ok: false, base_id: baseId, solapa: hoja.getName(),
        motivo: '«FALTA:clave_ventana@' + baseId + '/' + hoja.getName() + '» — la solapa toma ' +
          'su ventana de "' + solapaRef + '" y sin la columna de la clave no hay con qué ' +
          'decidir qué fila entra: ' + campoClaveAca.motivo
      };
    }

    var conjunto = conjuntoDeClavesEnVentana_(baseId, solapaRef, ventana);
    if (!conjunto.ok) return { ok: false, base_id: baseId, solapa: hoja.getName(), motivo: conjunto.motivo };

    var idxClaveAca = columnaLetraAIndice_(campoClaveAca.columna);
    resultado.ventana_aplicada = { desde: ventana.desde, hasta: ventana.hasta };
    resultado.criterio_ventana = 'referencia — la ventana sale de ' + baseId + '/' + solapaRef +
      ', cruzada por `clave_ventana` ("' + headers[idxClaveAca] + '" acá, "' + conjunto.clave_ref +
      '" allá); esa solapa se recortó con criterio: ' + conjunto.criterio_ventana_ref;
    resultado.ventana_referencia = {
      solapa: solapaRef,
      clave_aca: headers[idxClaveAca],
      clave_alla: conjunto.clave_ref,
      criterio_ventana_ref: conjunto.criterio_ventana_ref,
      filas_ref_totales: conjunto.filas_ref_totales,
      filas_ref_en_ventana: conjunto.filas_ref_en_ventana,
      filas_ref_sin_fecha: conjunto.filas_ref_sin_fecha,
      filas_ref_sin_clave: conjunto.filas_ref_sin_clave,
      // `R-30`: viaja hasta acá para que la traza de CUALQUIER marcador que lea por pertenencia
      // pueda decir si el tope estaba activo y a quién sacó. Ver `calcularConjuntoDeClaves_`.
      tope_dias_aplicado: conjunto.tope_dias_aplicado,
      filas_ref_fuera_por_tope: conjunto.filas_ref_fuera_por_tope,
      claves_fuera_por_tope: conjunto.claves_fuera_por_tope
    };
    // Los tres conteos que hacen explicable un total corto, más el universo de referencia.
    resultado.claves_en_ventana = conjunto.tamano;
    resultado.claves_de_referencia = conjunto.tamano_universo;
    resultado.filas_sin_clave_ventana = 0;
    resultado.filas_clave_huerfana = 0;
    resultado.filas_fuera_de_ventana = 0;
    var clavesHuerfanas = {};

    filasDatos.forEach(function (fila, j) {
      if (!incluida[j]) return; // excluida por lista blanca, ya contada arriba (`D-21`)
      var claveFila = normalizarIdCuenta_(fila[idxClaveAca]);
      if (claveFila === '') { resultado.filas_sin_clave_ventana++; return; }
      if (!Object.prototype.hasOwnProperty.call(conjunto.todas, claveFila)) {
        resultado.filas_clave_huerfana++;
        clavesHuerfanas[claveFila] = (clavesHuerfanas[claveFila] || 0) + 1;
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(conjunto.claves, claveFila)) {
        resultado.filas_fuera_de_ventana++;
        return;
      }
      resultado.filas_en_ventana++;
      resultado.filas.push(filaAObjeto(fila));
    });

    resultado.claves_huerfanas = Object.keys(clavesHuerfanas).length;
    resultado.ejemplo_claves_huerfanas = Object.keys(clavesHuerfanas).slice(0, 8);
    return resultado;
  }

  var campoFecha = buscarMapeo(baseId, hoja.getName(), 'fecha_periodo');
  if (!campoFecha.ok) {
    return { ok: false, base_id: baseId, motivo: '«FALTA:fecha_periodo@' + baseId + '/' + hoja.getName() + '»' };
  }

  var idxFecha = columnaLetraAIndice_(campoFecha.columna);
  resultado.columna_fecha = headers[idxFecha] || campoFecha.columna;
  resultado.ventana_aplicada = { desde: ventana.desde, hasta: ventana.hasta };

  // `R-16` (07/08) — el extremo derecho del rango, si la solapa lo declara. **Es opcional a
  // propósito**: una fila de `Directa Mail` es **un envío** y tiene una sola fecha por
  // naturaleza; forzarle un fin sería inventar un dato. Sin `fecha_fin_periodo` mapeado, el
  // criterio sigue siendo el de punto y `resultado.criterio_ventana` lo dice.
  var campoFin = buscarMapeo(baseId, hoja.getName(), 'fecha_fin_periodo');
  var idxFin = campoFin.ok ? columnaLetraAIndice_(campoFin.columna) : -1;
  resultado.columna_fecha_fin = campoFin.ok ? (headers[idxFin] || campoFin.columna) : '';
  resultado.criterio_ventana = campoFin.ok ? 'solape (R-16)' : 'punto — la solapa no declara fecha_fin_periodo';
  resultado.filas_sin_fecha_fin = 0;

  // Fallback a texto renderizado (Paso 2.3, hallazgo `looker`): una columna
  // de fecha armada con `QUERY()` puede devolver "" en `getValues()` para
  // celdas que sí muestran una fecha en pantalla — es la celda derramada de
  // la fórmula, no una celda propia. `getDisplayValues()` lee lo que se ve,
  // no lo que `getValues()` cree que hay. Solo se usa cuando el valor crudo
  // vino vacío, así que no cambia nada para bases sin ese problema.
  var filasCrudasDisplay = hoja.getDataRange().getDisplayValues().slice(filaEncabezado);

  // Comparación por string yyyy-MM-dd (Paso 2.3.1), no por epoch ms: el
  // runtime V8 de Apps Script construye `Date` en UTC aunque el spreadsheet
  // tenga otro huso horario, así que comparar timestamps crudos puede correr
  // un día en los bordes. Formatear con el huso del spreadsheet y comparar
  // strings evita esa ambigüedad. Bordes inclusivos de los dos lados.
  var ssTz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  var desdeStr = Utilities.formatDate(ventana.desde, ssTz, 'yyyy-MM-dd');
  var hastaStr = Utilities.formatDate(ventana.hasta, ssTz, 'yyyy-MM-dd');

  filasDatos.forEach(function (fila, j) {
    if (!incluida[j]) return; // Paso 2.16: excluida por lista blanca, ya contada arriba
    var crudo = fila[idxFecha];
    if (celdaVacia_(crudo)) {
      var mostrado = filasCrudasDisplay[j][idxFecha];
      if (mostrado && mostrado.trim() !== '') crudo = mostrado;
    }
    if (crudo === '' || crudo === null || crudo === undefined) {
      resultado.filas_sin_fecha++;
      return;
    }

    var fecha = parsearFechaCelda_(crudo);
    if (!fecha) {
      resultado.filas_fecha_invalida++;
      return;
    }

    var fechaStr = Utilities.formatDate(fecha, ssTz, 'yyyy-MM-dd');

    // `R-16` — el extremo derecho, con el mismo fallback a display que el izquierdo.
    var finStr = '';
    if (idxFin !== -1) {
      var crudoFin = fila[idxFin];
      if (celdaVacia_(crudoFin)) {
        var mostradoFin = filasCrudasDisplay[j][idxFin];
        if (mostradoFin && mostradoFin.trim() !== '') crudoFin = mostradoFin;
      }
      var fechaFin = parsearFechaCelda_(crudoFin);
      if (fechaFin) finStr = Utilities.formatDate(fechaFin, ssTz, 'yyyy-MM-dd');
      else resultado.filas_sin_fecha_fin++;
    }

    if (entraPorSolape_(fechaStr, finStr, desdeStr, hastaStr)) {
      resultado.filas_en_ventana++;
      resultado.filas.push(filaAObjeto(fila));
    }
  });

  return resultado;
}

/**
 * Corre leerFuente sobre todas las bases activas para el período principal de
 * CONFIG. Función de diagnóstico manual — ítem de menú "Probar lectura".
 */
function probarLecturaPeriodo() {
  var ventana = resolverVentana({});
  var bases = leerBases();
  var reportes = [];

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.activo) return;

    if (!ventana.ok) {
      reportes.push({ ok: false, base_id: baseId, motivo: 'Ventana no resuelta: ' + ventana.motivo });
      return;
    }

    reportes.push(leerFuente(baseId, ventana));
  });

  return { ventana: ventana, reportes: reportes };
}

/**
 * 03/08/2026 — `probarLecturaPeriodo()` con los mismos conteos pero **una sola base y sin
 * las filas**. Sólo lectura; no escribe nada.
 *
 * Por qué existe, y es una limitación del transporte, no del motor: `probarLecturaPeriodo`
 * recorre las cuatro bases activas y devuelve `filas` completo en cada reporte — miles de
 * objetos. Sobre `/dev` esa respuesta no vuelve: contesta 404 o la página de login de
 * Google con HTTP 200, que es el mismo síntoma que un token vencido y por eso se diagnostica
 * mal (`RUNBOOK`, Parte G). Medido el 03/08: `ping` responde en 33 ms y
 * `probarLecturaPeriodo` falla cuatro veces seguidas con el token recién renovado.
 *
 * Es lo que destraba medir `D-21` sobre `rdv`: para saber cuántas filas deja afuera una
 * lista blanca hay que leer la base **con la ventana de `CONFIG` aplicada**, y una ventana
 * no se puede mandar por JSON — `leerFuente` espera dos `Date` y `Utilities.formatDate`
 * rechaza strings. Acá la ventana se resuelve adentro, como en `probarLecturaPeriodo`.
 */
function contarLecturaBase_(baseId, nombreHojaOverride) {
  var ventana = resolverVentana({});
  if (!ventana.ok) return { ok: false, base_id: baseId, motivo: 'Ventana no resuelta: ' + ventana.motivo };

  var r = leerFuente(baseId, ventana, nombreHojaOverride);
  if (!r.ok) return r;

  // Se devuelve todo menos `filas`: los conteos son el dato, las filas son el peso.
  return {
    ok: true,
    base_id: r.base_id,
    hoja: r.hoja,
    modo: r.modo,
    ventana: { desde: formatearFecha_(ventana.desde), hasta: formatearFecha_(ventana.hasta) },
    fila_encabezado: r.fila_encabezado,
    columna_fecha: r.columna_fecha,
    filas_totales: r.filas_totales,
    filas_en_ventana: r.filas_en_ventana,
    filas_excluidas_por_valor: r.filas_excluidas_por_valor,
    excluidas_por_valor: r.excluidas_por_valor,
    valores_declarados_sin_filas: r.valores_declarados_sin_filas,
    filas_vacias: r.filas_vacias,
    filas_sin_clave: r.filas_sin_clave,
    filas_sin_fecha: r.filas_sin_fecha,
    filas_fecha_invalida: r.filas_fecha_invalida,
    // `_23` — sólo aparecen cuando la ventana entró por referencia; `undefined` en el resto.
    criterio_ventana: r.criterio_ventana,
    ventana_referencia: r.ventana_referencia,
    claves_de_referencia: r.claves_de_referencia,
    claves_en_ventana: r.claves_en_ventana,
    claves_huerfanas: r.claves_huerfanas,
    ejemplo_claves_huerfanas: r.ejemplo_claves_huerfanas,
    filas_fuera_de_ventana: r.filas_fuera_de_ventana,
    filas_sin_clave_ventana: r.filas_sin_clave_ventana,
    filas_clave_huerfana: r.filas_clave_huerfana
  };
}

/**
 * `_23`, el control que cierra la capacidad — y es barato porque no necesita un dato nuevo:
 * **`looker/Cuentas` sí tiene fecha propia**, así que se la puede recortar por los dos
 * caminos y los dos tienen que dar exactamente lo mismo.
 *
 * El camino por referencia se arma **contra sí misma**, pero sin escribir esa referencia en
 * `SOLAPAS`: `validarReferenciaVentana_` rechaza el ciclo de largo uno, y con razón. Lo que se
 * hace es llamar a la maquinaria por abajo —`conjuntoDeClavesEnVentana_` sobre `Cuentas`, y
 * después filtrar las filas de `Cuentas` por pertenencia a ese conjunto— que es exactamente lo
 * que `leerFuente` hace del lado de `DIGITAL`. Si difiere, la capacidad está mal y se ve
 * **antes** de tocar `DIGITAL`.
 *
 * No escribe nada. Se corre por API: `llamar fn=controlVentanaPorReferencia_`.
 */
function controlVentanaPorReferencia_() {
  var BASE = 'looker';
  var SOLAPA = 'Cuentas';

  var ventana = resolverVentana({});
  if (!ventana.ok) return { ok: false, motivo: 'Ventana no resuelta: ' + ventana.motivo };

  // Camino 1 — el recorte directo, por la `fecha_periodo` de la propia solapa.
  var directo = leerFuente(BASE, ventana, SOLAPA);
  if (!directo.ok) return { ok: false, motivo: 'el recorte directo falló: ' + directo.motivo };

  // Camino 2 — el conjunto de pertenencia, la misma maquinaria que usa `DIGITAL`.
  var conjunto = conjuntoDeClavesEnVentana_(BASE, SOLAPA, ventana);
  if (!conjunto.ok) return { ok: false, motivo: 'el conjunto por referencia falló: ' + conjunto.motivo };

  var campoClave = buscarMapeo(BASE, SOLAPA, 'clave_ventana');
  if (!campoClave.ok) return { ok: false, motivo: campoClave.motivo };

  var todas = leerFuente(BASE, { desde: new Date(1900, 0, 1), hasta: new Date(2999, 11, 31) }, SOLAPA);
  if (!todas.ok) return { ok: false, motivo: 'no se pudo leer el universo: ' + todas.motivo };

  var encabezado = directo.encabezados[columnaLetraAIndice_(campoClave.columna)];
  var porReferencia = todas.filas.filter(function (o) {
    var v = normalizarIdCuenta_(o[encabezado]);
    return v !== '' && Object.prototype.hasOwnProperty.call(conjunto.claves, v);
  });

  // La comparación es por el conjunto de claves de las filas devueltas: es lo que la
  // pertenencia puede prometer. Las filas sin clave no entran por referencia **y no pueden**,
  // y por eso se cuentan aparte en vez de hacer fallar el control sin decir por qué.
  function clavesDe(filas) {
    var set = {};
    filas.forEach(function (o) {
      var v = normalizarIdCuenta_(o[encabezado]);
      if (v !== '') set[v] = true;
    });
    return set;
  }
  var setDirecto = clavesDe(directo.filas);
  var setReferencia = clavesDe(porReferencia);
  var soloDirecto = Object.keys(setDirecto).filter(function (k) { return !setReferencia[k]; });
  var soloReferencia = Object.keys(setReferencia).filter(function (k) { return !setDirecto[k]; });

  var sinClaveDirecto = directo.filas.length - Object.keys(setDirecto).length;

  return {
    ok: soloDirecto.length === 0 && soloReferencia.length === 0,
    base: BASE,
    solapa: SOLAPA,
    ventana: { desde: formatearFecha_(ventana.desde), hasta: formatearFecha_(ventana.hasta) },
    criterio_directo: directo.criterio_ventana,
    filas_directo: directo.filas.length,
    filas_por_referencia: porReferencia.length,
    claves_directo: Object.keys(setDirecto).length,
    claves_por_referencia: Object.keys(setReferencia).length,
    claves_del_conjunto: conjunto.tamano,
    universo_de_claves: conjunto.tamano_universo,
    // Una fila de `Cuentas` en ventana **sin** `id_cuentas` no la puede traer la pertenencia.
    // Medido 10/08: cero. Si algún día no es cero, el número explica la diferencia.
    filas_en_ventana_sin_clave: sinClaveDirecto,
    solo_en_directo: soloDirecto.slice(0, 10),
    solo_en_referencia: soloReferencia.slice(0, 10)
  };
}

function formatearFecha_(fecha) {
  return Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Diagnóstico manual (no lo llama el menú): para cuando `probarLecturaPeriodo`
 * cuenta filas "sin fecha" que a simple vista sí tienen fecha en la hoja —
 * caso real (Paso 2.3): `looker`, cuya hoja `resumen_metricas` se arma con
 * `QUERY()` y `getValues()` devuelve "" en filas que sí muestran fecha en
 * pantalla (celda derramada de la fórmula). Loguea, por fila, el valor crudo
 * de `getValues()` junto con el valor mostrado de `getDisplayValues()`: si
 * difieren (crudo vacío, mostrado con texto), es este caso — `leerFuente` ya
 * tiene el fallback a `getDisplayValues()` para eso. Ej.: `diagnosticoColumnaFecha_('looker')`.
 */
function diagnosticoColumnaFecha_(baseId, nombreHojaOverride) {
  var abierto = abrirHoja(baseId, nombreHojaOverride);
  if (!abierto.ok) { Logger.log('No se pudo abrir: ' + abierto.motivo); return; }

  var campoFecha = buscarMapeo(baseId, abierto.hoja.getName(), 'fecha_periodo');
  if (!campoFecha.ok) { Logger.log('No se pudo resolver la columna fecha_periodo: ' + campoFecha.motivo); return; }

  var filaEncabezado = Number(abierto.base.fila_encabezado) || 1;
  var idxFecha = columnaLetraAIndice_(campoFecha.columna);
  var datos = abierto.hoja.getDataRange().getValues();
  var datosDisplay = abierto.hoja.getDataRange().getDisplayValues();
  var headers = datos[filaEncabezado - 1];

  Logger.log('Hoja: ' + abierto.hoja.getName() + ' · fila_encabezado: ' + filaEncabezado +
    ' · columna fecha: ' + campoFecha.columna + ' (idx ' + idxFecha + ', header "' + headers[idxFecha] + '")');

  for (var f = filaEncabezado; f < Math.min(datos.length, filaEncabezado + 20); f++) {
    var crudo = datos[f][idxFecha];
    var mostrado = datosDisplay[f][idxFecha];
    Logger.log('fila ' + (f + 1) + ': crudo(typeof=' + typeof crudo + ' esDate=' + (crudo instanceof Date) + ')=' + JSON.stringify(crudo) + ' · mostrado="' + mostrado + '"');
  }
}

// Sin argumentos para poder correrla con el botón ▶ del editor de Apps
// Script (que no permite pasar parámetros a mano).
function diagnosticoLooker_() {
  diagnosticoColumnaFecha_('looker');
}

/**
 * Paso 2.8 Parte D, guardarraíl — un lector que devuelve una fracción chica de
 * lo que `SOLAPAS.filas_datos` registra para esa (base_id, hoja) **sin fallar**
 * es el modo de falla caro en su forma más pura: río abajo, un marcador suma esas
 * pocas filas y produce un número plausible (caso real: `m2` devolvió 18 filas de
 * 29.533, con ✅). No es un error — `filas_datos` es un conteo de referencia
 * (`inventariarSolapas()`, puede estar desactualizado), así que esto solo avisa
 * ⚠, nunca bloquea la lectura. Sin fila en SOLAPAS o sin `filas_datos` cargado,
 * no hay con qué comparar: `{ ok: false }`.
 *
 * Paso 2.9 Parte B punto 5: el umbral del Paso 2.8 (50%) no habría agarrado
 * 960/1297 (74%) ni 720/1362 (53%) — los dos venían del mismo bug (exclusión
 * silenciosa) que la Parte B corrige. Sube a 90% y el porcentaje se muestra
 * siempre, no solo por debajo del umbral: con `leerFuente()` devolviendo todas
 * las filas, la cobertura debería rondar el 100% salvo un corte real en
 * `getDataRange()` — cualquier desvío, aunque no dispare el ⚠, es dato útil.
 */
var UMBRAL_COBERTURA_LECTURA_ = 0.9;

function evaluarCoberturaLectura_(baseId, nombreHoja, filasLeidas) {
  var solapas = leerSolapas();
  var fila = solapas[baseId] && solapas[baseId][nombreHoja];
  var registradas = fila ? Number(fila.filas_datos) : NaN;
  if (!fila || isNaN(registradas) || registradas <= 0) {
    return { ok: false };
  }

  var ratio = filasLeidas / registradas;
  return { ok: true, registradas: registradas, ratio: ratio, bajoUmbral: ratio < UMBRAL_COBERTURA_LECTURA_ };
}

function sufijoCobertura_(cobertura) {
  if (!cobertura.ok) return '';
  var icono = cobertura.bajoUmbral ? ' ⚠' : '';
  return icono + ' cobertura ' + Math.round(cobertura.ratio * 100) + '% de SOLAPAS.filas_datos (' + cobertura.registradas + ')';
}

function menuProbarLectura_() {
  var ui = ui_();
  var resultado = probarLecturaPeriodo();

  if (!resultado.ventana.ok) {
    ui.alert('No se pudo resolver el período', resultado.ventana.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [
    'Ventana (' + resultado.ventana.origen + '): ' +
    formatearFecha_(resultado.ventana.desde) + ' → ' + formatearFecha_(resultado.ventana.hasta),
    ''
  ];

  if (!resultado.reportes.length) {
    lineas.push('No hay bases activas registradas en BASES.');
  }

  resultado.reportes.forEach(function (r) {
    if (!r.ok) {
      lineas.push('⚠️ ' + r.base_id + ' — ' + r.motivo);
      return;
    }

    // Paso 2.9 Parte B: "sin clave"/"vacías" ya no se descartan del conteo —
    // son dato informativo, se muestran junto al total, no restadas de él.
    var sufijoClave = r.filas_sin_clave > 0 ? ' (' + r.filas_sin_clave + ' sin clave)' : '';
    var sufijoVacias = r.filas_vacias > 0 ? ' (' + r.filas_vacias + ' vacías)' : '';
    var cobertura = evaluarCoberturaLectura_(r.base_id, r.hoja, r.filas_totales);
    var sufijoCob = sufijoCobertura_(cobertura);

    if (r.modo === 'snapshot') {
      var iconoSnapshot = cobertura.bajoUmbral ? '⚠️' : '✅';
      lineas.push(iconoSnapshot + ' ' + r.base_id + ' (' + r.hoja + ', snapshot) — ' + r.filas_totales + ' filas (todas, sin ventana)' + sufijoClave + sufijoVacias + sufijoCob);
      return;
    }

    // Diagnóstico honesto (Paso 2.3): el ✅ solo dice "pude leer y resolver la
    // columna", no "la data sirve". Se degrada a ⚠️ si no cayó nada en la
    // ventana, si más de la mitad de las filas no tienen fecha, o si la
    // cobertura contra SOLAPAS.filas_datos está por debajo del umbral (Paso 2.9
    // Parte B).
    var icono = '✅';
    if (r.filas_en_ventana === 0 || (r.filas_totales > 0 && (r.filas_sin_fecha / r.filas_totales) > 0.5) || cobertura.bajoUmbral) {
      icono = '⚠️';
    }

    lineas.push(
      icono + ' ' + r.base_id + ' (' + r.hoja + ', col fecha "' + r.columna_fecha + '") — ' +
      r.filas_totales + ' totales, ' + r.filas_en_ventana + ' en ventana, ' +
      r.filas_sin_fecha + ' sin fecha, ' + r.filas_fecha_invalida + ' fecha inválida' + sufijoClave + sufijoVacias + sufijoCob
    );
  });

  ui.alert('Prueba de lectura por ventana', lineas.join('\n'), ui.ButtonSet.OK);
}

/* ===================== `D-33` — dimensiones a condición física (15/08/2026) =====================
 *
 * **Traduce un corte lógico —`ambito=jm`— a la condición que esa base entiende.** Es lo que
 * `MAPEO` hace con las medidas, del lado de los cortes.
 *
 * **Vive acá y no en `Generador.gs` por el reparto de `CLAUDE.md` §2:** esto es resolución de
 * datos contra la forma de cada base, no despacho. `Generador.gs` sigue siendo el que **aplica**
 * el filtro; lo que recibe es texto, y no se entera de que una parte vino de una dimensión.
 *
 * **Y ése es el punto del piloto:** el camino de aplicación —`parsearFiltro_`,
 * `aplicarFiltroDeMarcador_`— **no se toca**. Si los ocho números se movieran, no habría que
 * preguntarse si fue la estructura o el aplicador, porque el aplicador es el mismo.
 *
 * ⚠ **DEUDA DECLARADA, y hay que decirla porque `D-33` promete otra cosa.** `D-33` funda la
 * decisión en la **simetría con `MAPEO`** — y `MAPEO` es una **hoja**. Esta tabla es un mapa en
 * código, así que **agregar una dimensión o un valor todavía pide `clasp push`**, que es
 * exactamente lo que `D-01` mide. Para el piloto alcanza: prueba la estructura, no la
 * configurabilidad. **La versión que se quede tiene que ser una hoja de registro**, y hasta
 * entonces esto es andamio.
 */
var DIMENSIONES_ = {
  ambito: {
    // El valor es una función de (base_id, solapa) porque la misma dimensión se dice distinto
    // en cada base — las cuatro formas medidas el 15/08 sobre las 78 filas vivas.
    jm: {
      'rdv|RVD JM-CM - ES': 'figura=Jorge Macri',
      'digital|Directa Mail': 'mail_remitente=jorge.macri@buenosaires.gob.ar',
      /* ⭐⭐ `2026-08-30_2` — **EL CORTE PASA DEL NOMBRE AL `Id cuentas`.** Reemplaza a
       * `nombre_campaña~=JM` (15/08) acá, a `des_campana_2~=JM || des_campana_3~=JM` (28/08) en el
       * desglose y a `campana~=JM` en `resumen_metricas_dinamico`. Las tres inferían el ámbito del
       * TEXTO del nombre; ahora sale de una columna.
       *
       * ⭐ **Qué reemplaza y por qué, con los conteos del tablero (lectura 30/08, ventana 21–27):**
       * el corte por nombre **pierde 5 de las 29 implementaciones JM**; el corte por `Id cuentas`
       * **pierde 1**. Sobre la lámina JM da `10/9/9` contra `10/10/9` del tablero, mientras el
       * criterio viejo da `8/7/7`.
       *
       * ⭐⭐ **Pero la evidencia que DECIDIÓ no son los totales: es el DIFERENCIAL.** De las 343
       * filas de la ventana, **sólo 6 discrepan** entre los dos criterios — las seis de
       * `3487-AGOJDGAG` y `3488-AGOJDGAG`, las seis campañas **POST del «1 a 1» y de RDV**, o sea
       * **JM** — y el corte por id **acierta las seis**. El sufijo **corrige** el error; no lo
       * mueve de lugar. (`3487-AGOJDGAG` es la cuenta de Coghlan, con seis casos `exacto`
       * validados el 28/08, `V-114`…`V-121`.)
       *
       * ⭐ **Por qué `JDGAG` y NO la terminación `AG`.** En la ventana los dos son
       * indistinguibles —el único sufijo terminado en `AG` es `JDGAG`—, pero en la solapa entera se
       * separan por **9 filas**: `2475-ENESEGAG`, *«Recorrida por Servicio Penitenciario de Marcos
       * Paz»*. Ahí el prefijo de área es **`SEG`, no `JDG`**, ninguna de las nueve dice «JM» en sus
       * tres columnas de nombre, y la columna `JM | GCBA | POLICIA` dice **`GCBA`** en las nueve.
       * Tres criterios en contra. ⚠ *«Marcos Paz»* es **el lugar** —el complejo penitenciario—, no
       * una persona: la inferencia «agenda de otro funcionario» que circuló se retiró.
       *
       * ⛔ **Por qué NO se usó la columna T, que se llama literalmente `JM | GCBA | POLICIA`:**
       * **contradice al nombre en 530 de las 620 filas** cuyo nombre dice JM —el 85 %— y sus marcas
       * `JM` **se cortan en abril de 2026**. Decidido el 27/08 sobre `3527-AGOJDGAG` y confirmado
       * con esta medición.
       *
       * ⭐ **`~=` alcanza y no hace falta un operador «termina en».** Medido sobre los artefactos
       * del 30/08 y verificado con dos lectores: `JDGAG` aparece **531** veces en `looker|DIGITAL`,
       * **531** en el desglose y **67** en `resumen_metricas_dinamico`, **siempre como sufijo** y
       * **en ninguna otra columna**.
       *
       * ⚠ **La entrada del DESGLOSE no mueve ningún número hoy**, y va igual: medido sobre
       * `MARCADORES` del 30/08, de los 42 marcadores que usan `ambito` **ninguno** está sobre esa
       * solapa. Es **preparatoria** — se activa el día que los ocho `imp_*` terminen la mudanza que
       * este mismo archivo declara y `MARCADORES` todavía no.
       *
       * ⛔ **Y lo que este cambio NO arregla, para que nadie lo lea como que sí:** la fuente no
       * tiene grano semanal. `L-031` y `L-032` publican **ACUMULADO** —total de vida de las
       * campañas activas en la ventana— por decisión del usuario del 30/08, rotulado como tal. Los
       * **conteos** son el criterio; las sumas dan 134 % y 251 % y **no son un error**. */
      'looker|DIGITAL': 'ldig_id_cuenta~=JDGAG',
      /* ⭐⭐ `2026-08-31_1` — **LA MUDANZA QUE ESTE BLOQUE ANUNCIABA YA TIENE SU EJECUTOR.**
       * El comentario de abajo, del 28/08, decía que *«los ocho `imp_*` cambian de fuente»* y esta
       * entrada de `DIMENSIONES_` **existe desde entonces esperándolos**, mientras `MARCADORES`
       * seguía apuntando a `looker|DIGITAL`. Eso es la «mudanza a medias» que se citó como
       * pendiente durante tres días: **el código declaraba un camino que la configuración no
       * usaba.**
       *
       * **La cierra `mudarImpresionesAlDesglose()` (`Instalar.gs`)**, que mueve las ocho filas de
       * `MARCADORES` y **deja el `filtro` vacío a propósito** —el motivo largo está allá—.
       * ✅ **CORRIÓ el 31/08/2026 y la mudanza quedó cerrada**, verificado releyendo la hoja: las
       * ocho filas en `digital|CAMPAÑAS_DESGLOCE_DIGITAL` sobre `des_impresiones`, con `filtro`
       * vacío. La toma DESPUÉS del testigo lo confirma del otro lado — `imp_total` pasó de
       * **486.982** a **16.264.425** y el conteo de JM de 6 a **28 filas**, contra las **29**
       * implementaciones que declara el tablero.
       *
       * ⚠ Y desde entonces esta entrada **deja de ser preparatoria**: pasa a ser la que decide el
       * ámbito de los dos números publicados en `L-031` y `L-032`.
       */
      /* ⛔ **SUPERSEDIDO el 30/08 por el bloque de arriba** — este comentario describe la regla
       * `des_campana_2~=JM || des_campana_3~=JM`, que ya NO es la que está en la línea de abajo.
       * Se conserva porque su último párrafo sigue vigente y es la razón por la que la columna
       * `des_ambito` tampoco se usa ahora.
       *
       * ⭐⭐ `2026-08-28` — **el desglose, con la MISMA regla que `looker/DIGITAL`.** Los ocho
       * `imp_*` cambian de fuente por decisión del usuario —*«que usen la misma fuente, y que el
       * criterio sea el mismo»*—, y `des_campana_2` (col V) **es la misma columna** que
       * `nombre_campaña` (col F) allá: mismo nombre de encabezado y mismo contenido.
       *
       * ⭐ **Copiar la regla en vez de elegir una nueva es lo que hace ATRIBUIBLE el cambio:** la
       * única variable pasa a ser la solapa, así que si las dos traen la misma información —las dos
       * miden **4.904 filas**— `L-031` tiene que publicar el mismo número. Si no lo publica, **ése
       * es el hallazgo** y no ruido.
       *
       * ⛔ **Y por eso NO se usó `des_ambito` (col T), que parecía la salida limpia.** Medido el
       * 27/08 sobre las seis filas de `3527-AGOJDGAG`: esa columna dice **`GCBA`** mientras
       * `des_campana_2` dice `1 A 1 JM | 21/8 COGHLAN`. **Los dos criterios se contradicen sobre la
       * misma fila**, y eso ya estaba registrado el 26/08 como *«dos criterios, disjuntos»*.
       * Elegirlo acá habría cambiado el corte además de la fuente — dos variables a la vez. */
      'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_id_cuenta~=JDGAG',
      /* (*) `2026-08-28_4` — **la solapa de IVR, y es la unica base que trae el ambito escrito
       * en una columna propia.** Medido sobre el fixture del 28/08 (`sha256` 0ce0086d...ac79):
       * 63 filas con `ID cuentas`, `Vocero` (col G) con **dos** valores y ninguno vacio —
       * `JM` 55 y `GCBA` 8.
       *
       * (-) **NO se calco `nombre_campaña~=JM` de `looker|DIGITAL`**, que era la salida obvia:
       * da 53 y pierde las dos filas de `2961-ABRSEGGJ / ORDEN Y SEGURIDAD 2026`, con
       * `Vocero = JM` y ningun «JM» en el nombre. **Las habria puesto en GCBA sin fallar.**
       * Es la disyuntiva del desglose del 27/08 al reves: alla la columna de ambito
       * contradecia al nombre y gano el nombre; aca la columna explicita es la que acierta.
       * Por eso se mide una por una y no se hereda la regla de la solapa de al lado. */
      'digital|Directa IVR': 'ivr_vocero=JM',
      'looker|resumen_metricas_dinamico': 'id_cuenta~=JDGAG'
    },
    // `gcba` es **todo lo que no es `jm`** (`D-33`), no un valor propio: se implementa negando
    // la misma condición. La consecuencia está escrita en `D-33` y es que una fila sin el campo
    // cargado cae acá, no afuera de las dos.
    gcba: {
      'rdv|RVD JM-CM - ES': 'figura!=Jorge Macri',
      'digital|Directa Mail': 'mail_remitente!=jorge.macri@buenosaires.gob.ar',
      // `2026-08-30_2` — la negación de la de arriba. `gcba` sigue siendo **todo lo que no es
      // `jm`** (`D-33`), no un valor propio: una fila sin `Id cuentas` cargado cae acá **y se ve**.
      'looker|DIGITAL': 'ldig_id_cuenta!~=JDGAG',
      // `2026-08-28` — la negación de la de arriba, por lo mismo que dice `D-33`: `gcba` es
      // **todo lo que no es `jm`**, no un valor propio.
      /* ⛔ **SUPERSEDIDO el 30/08.** La nota de De Morgan valía para el `||` del criterio por
       * nombre; el corte por `Id cuentas` es una sola condición y su negación también. */
      'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_id_cuenta!~=JDGAG',
      /* `2026-08-28_4` — la negacion de la de arriba, por lo que dice `D-33`: `gcba` es **todo
       * lo que no es `jm`**. Aca eso importa mas que en otras bases porque la columna tiene un
       * valor `GCBA` literal que invita a escribir `ivr_vocero=GCBA`: con la igualdad, una fila
       * con el vocero vacio o mal tipeado **quedaria afuera de los dos ambitos y en silencio**.
       * Con la negacion cae en GCBA y se ve. */
      'digital|Directa IVR': 'ivr_vocero!=JM',
      'looker|resumen_metricas_dinamico': 'id_cuenta!~=JDGAG'
    }
  },
  plataforma: {
    /* `2026-08-21_13` — la segunda solapa que declara `plataforma`. Los valores de
     * `digital|CAMPAÑAS_DESGLOCE_DIGITAL` se **midieron** sobre el fixture del 20/08 y **no** son
     * los mismos textos que en `looker|DIGITAL`: acá son `Meta` 1840 · `DV360` 1678 ·
     * `Google ads` 1417 · `TikTok` 55 · `Mercado Libre` 27 · `Twitter` 12 · `Twitch` 5 · `Uber` 5.
     * ⚠ **Que la dimensión se llame igual no quiere decir que el valor físico sea el mismo** — es
     * exactamente para eso que `DIMENSIONES_` indexa por `base|solapa`. */
    meta: {
      'looker|DIGITAL': 'Plataforma=Meta',
      'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_plataforma=Meta'
    },
    google: {
      'looker|DIGITAL': 'Plataforma=Google ads',
      'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_plataforma=Google ads'
    },
    // `R-24` NO se deroga: `programmatic` es **todo lo que no es Meta ni Google ads**, por resta
    // y no por lista. Darle un valor propio sería enumerar en vez de derivar, y el día que
    // aparezca una plataforma nueva quedaría afuera en silencio.
    //
    // ⭐ **Y acá la resta se gana el sueldo**: en esta solapa la tercera plataforma se llama
    // `DV360` y el deck la rotula `Programmatic`. Enumerarla habría exigido saber ese nombre;
    // restando, entra sola — junto con TikTok, Twitter, Twitch, Mercado Libre y Uber, que es lo
    // que el deck agrupa bajo el mismo rótulo.
    programmatic: {
      'looker|DIGITAL': 'Plataforma!=Meta && Plataforma!=Google ads',
      'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_plataforma!=Meta && des_plataforma!=Google ads'
    }
  },
  /* ⭐ `2026-08-21_13` — **`etapa`: la cuarta dimensión del vocabulario global.**
   *
   * Un encuentro tiene **dos campañas**: la de convocatoria (*pre*) y la de difusión (*post*).
   * **Comparten `Id cuentas` y comparten `Plataforma`**, así que las dos claves juntas NO las
   * separan — medido el 21/08 sobre `3487-AGOJDGAG`, cinco filas = etapa × plataforma.
   *
   * **Lo que las separa es el NOMBRE de la campaña**: `Agenda con 1 A 1 - X` contra
   * `Agenda Post con 1 A 1 - X`.
   *
   * ⚠ **`pre` se define por resta, igual que `gcba` y `programmatic`**, y por el mismo motivo: si
   * mañana aparece una tercera etapa con otro nombre, cae en `pre` y se ve, en vez de quedar
   * afuera de las dos en silencio (`D-33`).
   *
   * ⚠ **Y esto es lo que hace que los tokens `u1_pre_*` / `u1_post_*` sean correctos aunque su
   * NOMBRE tenga el corte adentro**: el nombre lo fija la plantilla, que es del equipo (`C-01`);
   * la definición pone el corte donde `D-33` manda, en `dimensiones`. */
  /* ⛔⛔ **`2026-08-25` — el criterio se AMPLÍA de `Agenda Post` a `Post`** (decisión del usuario).
   *
   * **El defecto, medido:** el equipo escribe «Post» **en cualquier posición del nombre**, y el
   * patrón viejo exigía la secuencia `Agenda Post`. Las dos formas son **disjuntas**: `~=Agenda
   * Post` daba **166** filas y `~=Post` da **318** — con **intersección cero** entre lo que una
   * toma y la otra no. Conviven en 2026 y **no hay que preguntarle al equipo por qué**.
   *
   *   `Agenda Post con 1 - 1 A 1 - Retiro - 24/7`   ← la vieja tomaba ésta
   *   `Post Agenda RDV Con 1 - Salud Eje Norte 10/6` ← y NO ésta
   *   `Agenda con 1 Post - 1 A 1 - Comuna 1 - 17/4`  ← ni ésta
   *   `RDV Post Agenda con 1 - Primera Persona 1/6`  ← ni ésta
   *
   * ⛔⛔ **El alcance NO era una semana: son SEIS MESES.** Medido sobre el fixture del 20/08 —
   * **22 cuentas del «1 a 1»** y **71 filas**, repartidas marzo 1 · abril 11 · mayo 16 · junio 32 ·
   * julio 8 · agosto 3. **Hay decks publicados con el POST incompleto**, y eso queda dicho acá y en
   * `PENDIENTES` en vez de descubrirse comparando.
   *
   * ⭐ **Cero falsos positivos, y el cero se midió:** «Post» aparece **318 veces y siempre como
   * palabra entera** — ningún `Poste`, `Postulación`, `Posta`. Es la pregunta que `camp_env` →
   * `camp_enviados` obliga a hacer antes de un patrón por subcadena (`CLAUDE.md` §4), y acá la
   * respuesta es limpia. Sin esa medición, ampliar el patrón habría sido exactamente ese error.
   *
   * ⚠ **Y el límite que queda declarado: `~=` es SENSIBLE AL CASE.** `normalizarValorDeclarado_`
   * sigue `R-10` —colapsa espacios y `trim`, **preservando mayúsculas**—, así que esto matchea
   * `Post` y **no** `post` ni `POST`. Medido: hoy existe **una sola grafía**, `Post`, en las 318.
   * El día que alguien escriba `post` en minúscula, **no se ve y no falla**. No se pliega el case
   * acá porque `valorPasaFiltro_` es el comparador de **todos** los filtros del motor y cambiarlo
   * movería mucho más que esto.
   *
   * ⚠ **`pre` sigue siendo el COMPLEMENTO**, y por eso se edita igual: es lo que garantiza que una
   * fila que entra al post **salga del pre y de ningún otro lado**. Es el criterio de aceptación
   * del testigo (`testigoDeEtapaPost`). */
  etapa: {
    post: { 'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_campana~=Post' },
    pre: { 'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_campana!~=Post' }
  },
  tipo_envio: {
    convocatoria: { 'digital|Directa Mail': 'mail_tipo=Convocatoria' },
    m2: { 'digital|Directa Mail': 'mail_tipo~=M2' }
  }
};

/**
 * `D-33` — el texto de `MARCADORES.dimensiones` a condiciones de `filtro`.
 *
 * **Una dimensión ausente significa «todas»** (decisión del usuario, 15/08/2026): sin
 * `plataforma`, la fila es el agregado sobre las tres. No se inventa un valor `todas` que después
 * haya que mantener sincronizado con la lista real.
 *
 * ⚠ **Ausente y «todas» se ven igual, y el control que lo detecta está medido:** sobre
 * `looker/DIGITAL/Impresiones`, **total = suma de partes**, exacto, en los dos ámbitos. Una fila
 * a la que se le olvidó la plataforma devuelve el total y **descuadra esa invariante**. Es la
 * razón por la que `R-24` tiene que seguir calculando `programmatic` por resta.
 *
 * **Falla ruidoso**: una dimensión o un valor que no existen, o que esa base no sabe expresar,
 * devuelven `ok: false` con el motivo. Silenciarlos devolvería el universo entero — el modo de
 * falla más caro del proyecto.
 */
function condicionesDeDimensiones_(baseId, solapa, texto) {
  var t = String(texto || '').trim();
  if (t === '') return { ok: true, condiciones: '' };

  var clave = baseId + '|' + solapa;
  var partes = t.split(SEPARADOR_CONDICIONES_FILTRO_);
  var salida = [];

  for (var i = 0; i < partes.length; i++) {
    var p = String(partes[i]).trim();
    if (p === '') continue;
    var corte = p.indexOf('=');
    if (corte === -1) {
      return { ok: false, motivo: 'dimensión mal escrita: "' + p + '" (falta `=`)' };
    }
    var dim = normalizarValorDeclarado_(p.slice(0, corte));
    var val = normalizarValorDeclarado_(p.slice(corte + 1));

    if (!DIMENSIONES_[dim]) {
      return { ok: false, motivo: 'dimensión desconocida: "' + dim + '"' };
    }
    if (!DIMENSIONES_[dim][val]) {
      return { ok: false, motivo: 'valor desconocido para `' + dim + '`: "' + val + '"' };
    }
    var fisica = DIMENSIONES_[dim][val][clave];
    if (!fisica) {
      return { ok: false, motivo: '`' + dim + '=' + val + '` no está definida para ' + clave };
    }
    salida.push(fisica);
  }

  /* El separador se emite **con espacios a los dos lados**, igual que el resto del motor.
   *
   * Con `join(SEPARADOR_CONDICIONES_FILTRO_)` pelado el filtro generado salía
   * `nombre_campaña~=JM&&Plataforma=Meta && estado=Activa` — sin espacios en el `&&` que une las
   * dimensiones entre sí, y con espacios en el que las une al `filtro`. **Las tres condiciones
   * parseaban bien igual**, porque `parsearFiltro_` hace `trim` de cada pieza.
   *
   * Se arregla porque el día que un valor contenga un `&` la diferencia deja de ser cosmética:
   * un separador que a veces lleva espacios y a veces no obliga a que el parser adivine, y un
   * filtro mal partido **no falla — recorta mal**. */
  var SEP = ' ' + SEPARADOR_CONDICIONES_FILTRO_ + ' ';
  return { ok: true, condiciones: salida.join(SEP) };
}
