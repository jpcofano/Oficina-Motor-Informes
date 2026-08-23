/**
 * Config.gs — Configuración y lectura de registros.
 * Expone:
 *   leerBases()           -> { base_id: {nombre, sheet_id, hoja_default, fila_encabezado,
 *                               modo_periodo, tipo, activo, notas} }
 *   leerInformes()         -> { informe_id: {nombre, plantilla_id, periodicidad, familias, activo, notas} }
 *   leerConfig()          -> { clave: valor } desde la hoja CONFIG
 *   leerMapeo()           -> { base_id: { solapa: { campo_logico: {hoja, columna, notas} } } }
 *   buscarMapeo(base_id, solapa, campo_logico) -> { ok, hoja, columna } o { ok:false, motivo }
 *     Única vía de resolución de MAPEO (Paso 2.3.2) — `solapa` es obligatoria, sin
 *     default a `hoja_default`: un default silencioso ahí devuelve la fila de otra
 *     solapa sin avisar. Paso 2.6: además exige `SOLAPAS.uso = fuente` para esa
 *     (base_id, solapa) — ver `usoSolapa_` abajo.
 *   validarMapeo()        -> detecta tríos (base_id, solapa, campo_logico) duplicados
 *   leerSolapas()         -> { base_id: { solapa: {uso, fila_encabezado, firma_encabezado,
 *                               filas_datos, filas_crudas, notas} } } — registro `SOLAPAS`
 *                               (Paso 2.6; filas_crudas — Paso 2.10 Parte B)
 *   usoSolapa_(base_id, solapa) -> 'fuente'/'derivada'/'referencia'/'ignorar'/'revisar', o
 *     '' si la solapa no está registrada en SOLAPAS (mismo trato que 'revisar': no se lee)
 *   leerPeriodos()        -> { periodo_id: {desde, hasta, notas} }
 *   leerCampanas()        -> [ {periodo_id, campana_id, nombre, informe_id, base_id, tipo,
 *                               desde, hasta, mostrar, orden} ] — **LISTA, no mapa** (18/08/2026)
 *   escribirConfig(k, v)  -> setea una clave en CONFIG
 * Regla: NADIE hace cuentas de fechas fuera de este módulo y Fuentes.gs.
 * leerBases/leerInformes: Paso 1. leerConfig: Paso 1.6 v2.
 * leerMapeo/leerPeriodos/leerCampanas: Paso 2. buscarMapeo/validarMapeo: Paso 2.3.2.
 * leerSolapas/usoSolapa_: Paso 2.6 (ver Solapas.gs para inventariarSolapas()).
 * escribirConfig: pendiente (fuera de alcance por ahora).
 */

/* ══════════════════════════════════════════════════════════════════════════════
 * Caché de las hojas de registro — `T2.2.2`, 06/08/2026
 *
 * **Medido:** una llamada a `resolverMarcadores` por ítem cuesta ~37 s y **el 90 % es
 * `buscarMapeo`**, invocada 103 veces para 43 marcadores. Cada invocación relee `MAPEO`
 * (346 ms) y `SOLAPAS` (337 ms) **enteras**. Con seis llamadas por corrida, son ~600
 * relecturas de dos hojas que no cambiaron.
 *
 * **Alcance: la invocación, y sólo mientras alguien lo pida.** `cacheRegistros_` es una
 * variable de módulo, así que **muere con la ejecución de Apps Script** — no es
 * `CacheService`, no sobrevive al pedido, no se comparte entre usuarios ni entre corridas.
 *
 * **Y está apagado por defecto**, que es la decisión que hace que esto sea seguro: sólo lo
 * enciende `generarInforme`, y lo apaga al terminar. Todo lo demás —los sembradores, las
 * migraciones, los ítems de menú, el diff de configuración— sigue leyendo la hoja viva en
 * cada llamada, como antes.
 *
 * **Por qué así y no "cachear siempre e invalidar al escribir":** `ESCRITORES.md` censa
 * ~15 escritores de hojas de registro repartidos en cinco archivos. Olvidar uno sería
 * servir config vieja **en silencio**, que es el modo de falla que este repo caza. Con el
 * caché apagado por defecto **no hay ningún escritor que invalidar**: ninguno corre adentro
 * de `generarInforme`, que sólo escribe `CORRIDAS` y `FALTANTES` — y ésas no se leen por
 * acá.
 *
 * Si algún día un escritor sí corre adentro del alcance, tiene que llamar a
 * `invalidarCacheRegistros_()`. Está exportada para eso y hoy no la llama nadie.
 * ══════════════════════════════════════════════════════════════════════════════ */
var cacheRegistros_ = null;

function abrirCacheRegistros_() { cacheRegistros_ = {}; }
function cerrarCacheRegistros_() { cacheRegistros_ = null; }
function cacheRegistrosAbierto_() { return cacheRegistros_ !== null; }

/** Para un escritor que corra adentro del alcance. Hoy no lo llama nadie, a propósito. */
function invalidarCacheRegistros_() { if (cacheRegistros_) cacheRegistros_ = {}; }

/**
 * Envoltorio único. Con el caché apagado —el default— llama a `leer()` y no guarda nada, o
 * sea que el comportamiento es **idéntico** al de antes de este cambio.
 */
function memoRegistro_(nombre, leer) {
  if (cacheRegistros_ && Object.prototype.hasOwnProperty.call(cacheRegistros_, nombre)) {
    return cacheRegistros_[nombre];
  }
  var valor = leer();
  if (cacheRegistros_) cacheRegistros_[nombre] = valor;
  return valor;
}

function leerBases() {
  return leerRegistro_('BASES', 'base_id');
}

function leerInformes() {
  return leerRegistro_('INFORMES', 'informe_id');
}

function leerPeriodos() {
  return leerRegistro_('PERIODOS', 'periodo_id');
}

/**
 * **`CAMPANAS` se lee como LISTA, no como registro indexado** (18/08/2026).
 *
 * ⚠ **Antes era `leerRegistro_('CAMPANAS', 'campana_id')`, y eso PERDÍA FILAS EN SILENCIO.**
 * `leerRegistroSinCache_` hace `registro[clave] = obj` recorriendo: dos filas con el mismo
 * `campana_id` dejaban **una sola**, sin error y sin aviso.
 *
 * **Por qué la clave era falsa, y lo es por tres motivos a la vez** (decisión del usuario, 18/08):
 *
 *   1. **Las campañas destacadas se eligen cada semana**, como el temario. La misma campaña
 *      vuelve a salir con otro `periodo_id` — «Declaración de servicios esenciales» declara
 *      período **24/06–08/07**, que abarca varios informes semanales.
 *   2. **La campaña no pertenece a un informe.** Puede presentarse en cualquiera: «Programas y
 *      actividades para personas mayores» sale en el deck de `jm` **y** en el de `secco` de la
 *      misma semana, y con la clave vieja una de las dos filas desaparecía.
 *   3. Entonces la identidad real es la **fila**, no la campaña.
 *
 * **El patrón se copia de `REUNIONES`, que ya resolvió exactamente esto:** `leerReuniones_`
 * devuelve un arreglo y por eso admite N filas por lo mismo. **La hoja es una lista de lo que se
 * publica, no un catálogo de lo que existe.**
 */
function leerCampanas() {
  return memoRegistro_('CAMPANAS', leerCampanasSinCache_);
}

function leerCampanasSinCache_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CAMPANAS');
  if (!hoja) return [];

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var iId = headers.indexOf('campana_id');

  return datos
    .filter(function (fila) { return iId === -1 ? false : String(fila[iId]).trim() !== ''; })
    .map(function (fila) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = fila[i]; });
      return obj;
    });
}

/**
 * Las filas de una campaña, opcionalmente acotadas a un `periodo_id`.
 *
 * ⚠ **Existe porque con la lista el id solo puede devolver VARIAS filas**, y quien pregunta por
 * la ventana de una campaña necesita **una**. Devolver la primera sería reinstalar la pérdida
 * silenciosa que el cambio vino a sacar — sólo que en el consumidor en vez de en el lector.
 */
function filasDeCampana_(campanaId, periodoId) {
  var id = normalizarValorDeclarado_(campanaId);
  var per = normalizarValorDeclarado_(periodoId);
  return leerCampanas().filter(function (c) {
    if (normalizarValorDeclarado_(c.campana_id) !== id) return false;
    return per === '' || normalizarValorDeclarado_(c.periodo_id) === per;
  });
}

/**
 * Paso 3 (v3) Parte B — `SECCIONES` **plano**, indexado por `seccion_id`.
 * Distinto de `leerSecciones_(informeId)` (`Secciones.gs`), que arma el **árbol** de un
 * informe: `resolverVentana()` necesita mirar una sección por su id, sin recorrer padres ni
 * filtrar por informe.
 */
function leerSeccionesPlano_() {
  return leerRegistro_('SECCIONES', 'seccion_id');
}

function leerConfig() {
  return memoRegistro_('CONFIG', leerConfigSinCache_);
}

function leerConfigSinCache_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CONFIG');
  if (!hoja) return {};

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idxClave = headers.indexOf('clave');
  var idxValor = headers.indexOf('valor');

  var config = {};
  datos.forEach(function (fila) {
    var clave = fila[idxClave];
    if (!clave) return;
    config[clave] = fila[idxValor];
  });

  return config;
}

/**
 * MAPEO tiene clave compuesta (base_id, solapa, campo_logico) — Paso 2.3.2 —, a
 * diferencia de las demás hojas de registro (clave simple), por eso no usa
 * leerRegistro_. `solapa` es parte de la clave porque una misma base puede
 * mapear el mismo campo_logico en solapas distintas (`digital` tiene 6); sin
 * `solapa` en la clave, una se pisaba a la otra en silencio.
 */
function leerMapeo() {
  return memoRegistro_('MAPEO', leerMapeoSinCache_);
}

function leerMapeoSinCache_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MAPEO');
  if (!hoja) return {};

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxCampoLogico = headers.indexOf('campo_logico');
  var idxHoja = headers.indexOf('hoja');
  var idxColumna = headers.indexOf('columna');
  // `D-31` (16/08) — **la columna existía desde el 14/08 y esta función no la indexaba**, así
  // que el testigo era un dato que no miraba nadie. Sin esta línea, `buscarMapeo` no lo puede
  // devolver y la comparación de `Union.gs` no tiene contra qué comparar.
  var idxEncabezado = headers.indexOf('encabezado');
  var idxTipoEsperado = headers.indexOf('tipo_esperado');
  var idxValoresIncluidos = headers.indexOf('valores_incluidos'); // Paso 2.16
  var idxNotas = headers.indexOf('notas');

  var mapa = {};
  datos.forEach(function (fila) {
    var baseId = fila[idxBaseId];
    var solapa = fila[idxSolapa];
    var campoLogico = fila[idxCampoLogico];
    if (!baseId || !solapa || !campoLogico) return;

    if (!mapa[baseId]) mapa[baseId] = {};
    if (!mapa[baseId][solapa]) mapa[baseId][solapa] = {};
    mapa[baseId][solapa][campoLogico] = {
      hoja: fila[idxHoja],
      columna: fila[idxColumna],
      // `D-31`: el rótulo que se espera encontrar en esa letra. **Testigo, nunca fallback** — lo
      // compara `desalineamientoDeEncabezado_` (Union.gs) y no lo usa nadie para resolver.
      encabezado: idxEncabezado !== -1 ? fila[idxEncabezado] : '',
      tipo_esperado: idxTipoEsperado !== -1 ? fila[idxTipoEsperado] : '',
      valores_incluidos: idxValoresIncluidos !== -1 ? fila[idxValoresIncluidos] : '',
      notas: fila[idxNotas]
    };
  });

  return mapa;
}

/**
 * Registro SOLAPAS (Paso 2.6): declara el uso de cada solapa de cada base —
 * `fuente` / `derivada` / `referencia` / `ignorar` / `revisar`. Clave
 * compuesta (base_id, solapa), igual criterio que `leerMapeo()`.
 */
function leerSolapas() {
  return memoRegistro_('SOLAPAS', leerSolapasSinCache_);
}

function leerSolapasSinCache_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SOLAPAS');
  if (!hoja) return {};

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var registro = {};
  datos.forEach(function (fila) {
    var baseId = fila[idx.base_id];
    var solapa = fila[idx.solapa];
    if (!baseId || !solapa) return;

    if (!registro[baseId]) registro[baseId] = {};
    registro[baseId][solapa] = {
      uso: fila[idx.uso],
      origen: fila[idx.origen],
      fila_encabezado: fila[idx.fila_encabezado],
      firma_encabezado: fila[idx.firma_encabezado],
      filas_datos: fila[idx.filas_datos],
      filas_crudas: fila[idx.filas_crudas],
      // `R-19` — el piso de la capa 3. **Vacío = sin chequeo**, y es el estado con el que
      // nace: el número lo fija una persona, no el seed.
      filas_minimas: fila[idx.filas_minimas],
      // `_23` — de qué solapa de la misma base toma la ventana. Vacío = tiene fecha propia.
      // La lee `referenciaDeVentana_` (Fuentes.gs); nadie más la consulta.
      ventana_ref: fila[idx.ventana_ref],
      // `_44` (`D-30`) — qué campo lógico lleva el `id_cuenta` en esta solapa. Vacío = la solapa
      // no se selecciona por cuenta. La lee `campoIdCuentaDeSolapa_` (Fuentes.gs).
      campo_id_cuenta: fila[idx.campo_id_cuenta],
      notas: fila[idx.notas]
    };
  });

  return registro;
}

/**
 * `uso` de una (base_id, solapa) registrada en SOLAPAS. Devuelve '' si la
 * solapa no está registrada — mismo trato práctico que 'revisar': no es
 * `fuente`, así que `buscarMapeo` la rechaza igual.
 */
function usoSolapa_(baseId, solapa) {
  var solapas = leerSolapas();
  var fila = solapas[baseId] && solapas[baseId][solapa];
  return fila ? fila.uso : '';
}

/**
 * Única vía de resolución de MAPEO (Paso 2.3.2). `solapa` es obligatoria: sin
 * ella no hay forma de saber a cuál de las varias solapas posibles de una base
 * se refiere `campo_logico`, y devolver un default silencioso ahí es
 * exactamente el modo de falla que esto reemplaza (ver Paso-2.3.2.md).
 *
 * Paso 2.6, Parte B regla 1: `uso=fuente` en SOLAPAS es requisito para mapear.
 * Una solapa `derivada`/`referencia`/`ignorar`/`revisar` (o ni siquiera
 * registrada todavía) falla acá, ANTES de tocar MAPEO — así una hoja marcada
 * `revisar` (el default de todo lo nuevo) nunca se lee sola.
 */
function buscarMapeo(baseId, solapa, campoLogico) {
  if (!solapa) {
    return { ok: false, motivo: 'buscarMapeo requiere solapa (base_id="' + baseId + '", campo_logico="' + campoLogico + '")' };
  }

  var uso = usoSolapa_(baseId, solapa);
  if (uso !== 'fuente') {
    return { ok: false, motivo: '«FALTA:' + campoLogico + '@solapa_no_fuente(' + baseId + '/' + solapa + ')»' };
  }

  var mapa = leerMapeo();
  var fila = mapa[baseId] && mapa[baseId][solapa] && mapa[baseId][solapa][campoLogico];
  if (!fila) {
    return { ok: false, motivo: 'falta MAPEO: ' + baseId + '/' + solapa + '/' + campoLogico };
  }
  if (!fila.columna) {
    return { ok: false, motivo: 'MAPEO "' + baseId + '/' + solapa + '/' + campoLogico + '" existe pero no tiene columna cargada' };
  }

  return { ok: true, hoja: fila.hoja, columna: fila.columna };
}

/**
 * Detecta tríos (base_id, solapa, campo_logico) repetidos en MAPEO — no debería
 * pasar si todo se escribe vía upsertPorClave_ con esa clave, pero una edición
 * a mano en la hoja puede introducir uno. Paso 2.3.2, sección E.
 */
function validarMapeo() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MAPEO');
  if (!hoja) return { ok: false, motivo: 'La hoja MAPEO no existe.' };

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxCampo = headers.indexOf('campo_logico');

  var vistos = {};
  var duplicados = [];

  datos.forEach(function (fila, i) {
    var baseId = fila[idxBaseId];
    if (!baseId) return;
    var clave = baseId + '||' + fila[idxSolapa] + '||' + fila[idxCampo];
    if (vistos[clave]) {
      duplicados.push({
        clave: baseId + '/' + fila[idxSolapa] + '/' + fila[idxCampo],
        filas: [vistos[clave], i + 2]
      });
    } else {
      vistos[clave] = i + 2; // fila real en la hoja (1-based + encabezado)
    }
  });

  return { ok: true, duplicados: duplicados };
}

function menuValidarMapeo_() {
  var ui = ui_();
  var resultado = validarMapeo();

  if (!resultado.ok) {
    ui.alert('No se pudo validar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }
  if (!resultado.duplicados.length) {
    ui.alert('MAPEO sin duplicados', 'No se encontraron tríos (base_id, solapa, campo_logico) repetidos.', ui.ButtonSet.OK);
    return;
  }

  var lineas = resultado.duplicados.map(function (d) {
    return '⚠️ ' + d.clave + ' — filas ' + d.filas.join(' y ');
  });
  ui.alert('Duplicados en MAPEO', lineas.join('\n'), ui.ButtonSet.OK);
}

/** Cubre `BASES`, `INFORMES`, `PERIODOS`, `CAMPANAS` y `SECCIONES` de un saque. */
function leerRegistro_(nombreHoja, clavePrimaria) {
  return memoRegistro_(nombreHoja, function () { return leerRegistroSinCache_(nombreHoja, clavePrimaria); });
}

function leerRegistroSinCache_(nombreHoja, clavePrimaria) {
  /* ⛔⛔ **`clavePrimaria` NO es opcional, y hasta el 23/08/2026 se comportaba como si lo fuera.**
   *
   * **El modo de falla, medido:** sin el argumento, `headers.indexOf(undefined)` da `-1`,
   * `fila[-1]` da `undefined`, y el `if (!clave) return` de abajo **saltea todas las filas**. La
   * funcion devolvia **`{}` sin fallar** — un registro vacio indistinguible de una hoja vacia.
   *
   * **Lo que costo:** `diagDondeVivenLosIvr()` llamo `leerRegistro_('INFORMES')` sin clave, el
   * recorrido no se ejecuto, **no se imprimio ningun aviso** porque `Object.keys({})` no itera, y
   * el reporte salio limpio diciendo que **ocho tokens no estaban en ninguna lamina**. Falso. Lo
   * atajo el control positivo del propio diagnostico, no el codigo.
   *
   * ⭐ **Por eso tira en vez de devolver vacio:** es *una corrida que no hizo nada tiene que
   * fallar, no informar cero* (`CLAUDE.md` §4) aplicado al lector. Los **siete** llamadores sanos
   * del repo pasan la clave, asi que esta guarda **no puede romper ninguno**: solo alcanza a los
   * que ya estaban leyendo mal. */
  if (!clavePrimaria) {
    throw new Error('leerRegistro_("' + nombreHoja + '") sin `clavePrimaria`. No es opcional: ' +
      'sin ella se saltean TODAS las filas y el registro vuelve vacio sin fallar. ' +
      'Para INFORMES usa leerInformes(); ver Config.gs para el resto de los lectores.');
  }
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  if (!hoja) return {};

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift();
  var registro = {};

  datos.forEach(function (fila) {
    var clave = fila[headers.indexOf(clavePrimaria)];
    if (!clave) return; // fila vacía

    var obj = {};
    headers.forEach(function (h, i) { obj[h] = fila[i]; });
    if ('activo' in obj) obj.activo = esVerdadero_(obj.activo);
    registro[clave] = obj;
  });

  return registro;
}

function esVerdadero_(valor) {
  if (typeof valor === 'boolean') return valor;
  var texto = String(valor).trim().toLowerCase();
  return texto === 'sí' || texto === 'si' || texto === 'true';
}
