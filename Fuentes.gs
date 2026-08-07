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
 * Ventana de fechas por token, en orden de prioridad: campaña > periodo_ref
 * (PERIODOS) > período principal (CONFIG). Devuelve fechas como Date.
 */
function resolverVentana(opciones) {
  opciones = opciones || {};

  if (opciones.campana) {
    var campanas = leerCampanas();
    var campana = campanas[opciones.campana];
    if (!campana) {
      return { ok: false, motivo: 'La campaña "' + opciones.campana + '" no existe en CAMPANAS' };
    }
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
  var semana = semanaR11_(new Date());
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
function leerFuente(baseId, ventana, nombreHojaOverride) {
  var abierto = abrirHoja(baseId, nombreHojaOverride);
  if (!abierto.ok) return { ok: false, base_id: baseId, motivo: abierto.motivo };

  var base = abierto.base;
  var hoja = abierto.hoja;
  var filaEncabezado = resolverFilaEncabezado_(baseId, hoja.getName(), base.fila_encabezado);
  var modo = base.modo_periodo || 'filtrar';

  // Paso 2.11 Parte B: fila_encabezado=0 ("sin fila de títulos") no tiene de dónde
  // sacar nombres de columna — MAPEO no puede apuntar acá (buscarMapeo ya exige
  // uso=fuente, y ninguna solapa fuente puede tener 0), pero se guarda explícito por
  // si alguna vez se llama leerFuente directo sobre una de estas, sin pasar por MAPEO.
  if (filaEncabezado <= 0) {
    return { ok: false, base_id: baseId, motivo: 'La hoja "' + hoja.getName() + '" no tiene fila de encabezado (fila_encabezado=0 en SOLAPAS)' };
  }

  var datos = hoja.getDataRange().getValues();
  if (datos.length < filaEncabezado) {
    return { ok: false, base_id: baseId, motivo: 'La hoja "' + hoja.getName() + '" no tiene fila de encabezado ' + filaEncabezado };
  }

  var headers = datos[filaEncabezado - 1];
  var filasCrudas = datos.slice(filaEncabezado);

  function filaAObjeto(fila) {
    var obj = {};
    headers.forEach(function (h, i) {
      if (h) obj[h] = fila[i];
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
    filas: []
  };

  if (modo === 'snapshot') {
    resultado.filas = filasDatos.filter(function (fila, j) { return incluida[j]; }).map(filaAObjeto);
    resultado.filas_en_ventana = resultado.filas.length;
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
    filas_fecha_invalida: r.filas_fecha_invalida
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
