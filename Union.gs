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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * `D-31` conectado — el testigo de `MAPEO.encabezado` deja de ser un dato y pasa a ser alarma
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * **Qué problema resuelve.** El motor lee **por posición**: `buscarMapeo` devuelve una LETRA,
 * `columnaLetraAIndice_` la vuelve índice, de ahí sale el título, y con el título se extrae de
 * la fila. El encabezado es **derivado de la posición**, nunca un criterio propio — no se busca
 * jamás una columna por su nombre.
 *
 * Consecuencia: **insertar una columna corre todas las letras a su derecha y nada falla.** La
 * letra corrida da un índice válido, `headers[idx]` devuelve el título del vecino, y
 * `obj[titulo]` devuelve el valor del vecino. Un `SUMA` sobre la columna de al lado es un
 * número, no una excepción.
 *
 * Y peor: `leerFuente` arma la fila con `obj[h] = fila[i]`, así que **con títulos repetidos gana
 * el último**. En estas bases los repetidos son la norma —`Base_Digital` tiene ocho
 * `ID Cuentas`— así que después de un corrimiento el motor puede devolver **ni siquiera el
 * vecino**, sino el valor de la última columna que comparta ese título.
 *
 * `D-31` pobló 154 filas de `MAPEO` con el encabezado esperado, y hasta hoy **no lo miraba
 * nadie**: `leerMapeoSinCache_` ni siquiera indexaba la columna. El frente 6 dejó el dato y no
 * la alarma. Esto es la alarma.
 *
 * ─── La política es de `D-31`. Acá se aplica, no se reinventa ─────────────────────────────
 *
 *   1. **NUNCA se corrige la letra sola.** Está prohibido *"si el título no coincide, buscá la
 *      columna que sí lo tenga"*. La letra manda y el testigo **no es fallback jamás**. El
 *      motivo: los títulos **se repiten**, así que un fallback por título acertaría a veces y
 *      erraría **en silencio** otras — peor que el problema que vendría a resolver.
 *   2. **Se reportan los DOS valores**, con base, solapa y letra. Un *"no coincide"* a secas no
 *      se puede verificar.
 *   3. **No bloquea la corrida.** Es un aviso, no una excepción: un desalineamiento no puede
 *      dejar sin deck a quien lo necesita el jueves.
 *
 * ─── ⚠ El límite, que es de la herramienta y no una omisión ───────────────────────────────
 *
 * **El testigo compara RÓTULOS, NO CONTENIDO.** Detecta que la columna **se movió**, no que el
 * dato esté mal.
 *
 * `C-09` es la prueba de que el límite es real y no teórico: en `RDV_otros_ministros` los
 * encabezados están corridos **en origen** —el rótulo no describe lo que la columna tiene—, así
 * que ahí el testigo **va a coincidir siempre** y no va a detectar nada. Está escrito acá y no
 * sólo en `D-31` porque una guarda cuyo límite vive en otro documento se lee como si no tuviera
 * límite, y el día que alguien confíe en ella para una pregunta que no responde, el costo lo
 * paga la confianza puesta en el resto.
 */

/**
 * Compara el/los encabezado(s) que `MAPEO` declara esperar en una letra contra el que
 * efectivamente hay ahí. Devuelve `null` si no hay desalineamiento, o `{ esperados, real }`.
 *
 * **Es pura a propósito** —dos textos entran, un veredicto sale— para que su control positivo
 * corra fuera de Apps Script: `node tools/probar-encabezado.js`, que extrae **esta misma
 * función** del repo en vez de una copia.
 *
 * **Recibe una LISTA de esperados, y eso no es generalidad de más: está medido.** En
 * `MAPEO_2026-08-15.tsv` hay **12 grupos (base, solapa, letra) con más de una fila**, porque dos
 * `campo_logico` distintos pueden apuntar a la misma columna física — `looker/
 * resumen_metricas_dinamico/C` tiene tres, y `rdv/RVD JM-CM - ES/E` tiene dos con testigos
 * **distintos** (`''` y `'FECHA'`). Si el real coincide con **alguno** de los declarados, no hay
 * desalineamiento. Tratarlo como valor único produciría avisos falsos sobre doce grupos el
 * primer día, y **una alarma que grita de entrada es una alarma apagada**.
 *
 * **Un testigo vacío se saltea, no se compara contra `''`**: vacío significa *"no declarado"*, y
 * es el estado real de 7 de las 154 filas — las de `promoverFechasElegidas()`.
 *
 * `R-10` para comparar: se normalizan los dos lados colapsando espacios, **preservando
 * mayúsculas y acentos**. Plegar el case colapsaría encabezados que en estas bases son columnas
 * distintas con contenido distinto.
 */
function desalineamientoDeEncabezado_(esperados, real) {
  var lista = (esperados || []).map(normalizarValorDeclarado_).filter(function (e) { return e !== ''; });
  if (!lista.length) return null;

  var encontrado = normalizarValorDeclarado_(real);
  for (var i = 0; i < lista.length; i++) {
    if (lista[i] === encontrado) return null;
  }
  return { esperados: lista, real: encontrado };
}

/**
 * Los avisos de desalineamiento de esta corrida. Variable de módulo, mismo criterio y misma
 * vida que `cacheEncabezadosUnion_`: muere con la ejecución.
 *
 * **Se acumulan en vez de emitirse de a uno** porque `encabezadoEnColumna_` se llama una vez por
 * marcador y por campo —decenas de veces por corrida— y el mismo desalineamiento saldría
 * repetido hasta ser ruido. Se deduplica por (base, solapa, letra).
 */
var avisosEncabezadoUnion_ = {};

/** Los avisos juntados hasta ahora, como lista de texto listo para la traza. */
function avisosDeEncabezado_() {
  return Object.keys(avisosEncabezadoUnion_).sort().map(function (k) {
    return avisosEncabezadoUnion_[k];
  });
}

/**
 * Los encabezados que `MAPEO` declara esperar en una (base, solapa, letra). Devuelve `[]` si
 * ninguna fila lo declara.
 *
 * Se resuelve **por letra y no por `campo_logico`** para que la comparación entre en el único
 * punto donde la letra se vuelve columna —`encabezadoEnColumna_`— sin tocar sus once llamadores.
 * Ese es el motivo de que el comparador reciba una lista: por letra, la relación es de varios a
 * uno.
 */
function encabezadosEsperadosEnColumna_(baseId, solapa, columnaLetra) {
  var mapa = leerMapeo();
  var deLaSolapa = mapa[baseId] && mapa[baseId][solapa];
  if (!deLaSolapa) return [];

  var letra = String(columnaLetra || '').trim().toUpperCase();
  if (!letra) return [];

  var esperados = [];
  Object.keys(deLaSolapa).forEach(function (campoLogico) {
    var fila = deLaSolapa[campoLogico];
    if (String(fila.columna || '').trim().toUpperCase() !== letra) return;
    if (fila.encabezado) esperados.push(fila.encabezado);
  });
  return esperados;
}

function encabezadoEnColumna_(baseId, solapa, columnaLetra) {
  var clave = baseId + '||' + solapa;
  if (!Object.prototype.hasOwnProperty.call(cacheEncabezadosUnion_, clave)) {
    var abierto = abrirHoja(baseId, solapa);
    if (!abierto.ok) {
      cacheEncabezadosUnion_[clave] = null;
    } else {
      /* `_44` (12/08) — **`resolverFilaEncabezado_` y no `BASES.fila_encabezado`**, que es el
       * bug que el comentario de `leerFuente` (`_23`) había dejado escrito y sin arreglar:
       * *"resolverlo por afuera usaría `BASES.fila_encabezado` en vez de
       * `resolverFilaEncabezado_`, y donde las dos difieran el nombre no matchearía ninguna
       * propiedad: todas las claves saldrían vacías **sin fallar**"*.
       *
       * Pasó exactamente así al dar de alta `reuniones`: `leerFuente` leía los títulos de la
       * fila 2 —que es lo que declara `SOLAPAS`— y esta función los buscaba en la 1, que en
       * `Agenda JM` es la banda de grupos. Los nueve marcadores nuevos salieron `sin_datos`
       * con la fila cargada y el filtro bien: **el síntoma no se parece a la causa.**
       *
       * Radio medido antes de tocar: de las 16 solapas `fuente`, sólo **tres** tienen las dos
       * declaraciones distintas — las dos de `reuniones` y `m2/Cuentas M2`, que hoy está
       * leyendo la fila 3 como encabezado y **ya estaba rota** (`m2` no tiene fuente activa,
       * sus tokens publican `«FALTA»`). Así que esto alinea, no cambia comportamiento vivo. */
      var filaEncabezado = resolverFilaEncabezado_(baseId, abierto.hoja.getName(), abierto.base.fila_encabezado);
      if (!(filaEncabezado > 0)) filaEncabezado = 1;
      var ultimaColumna = abierto.hoja.getLastColumn();
      cacheEncabezadosUnion_[clave] = abierto.hoja.getRange(filaEncabezado, 1, 1, ultimaColumna).getValues()[0];
    }
  }
  var headers = cacheEncabezadosUnion_[clave];
  if (!headers) return undefined;
  var real = headers[columnaLetraAIndice_(columnaLetra)];

  /* `D-31` conectado. **Se compara y se avisa; el valor devuelto NO cambia nunca** — ésa es la
   * regla 1 de la política: la letra manda y el testigo no es fallback. Si esto empezara a
   * devolver "la columna que sí tiene el título esperado", el motor pasaría a leer por nombre
   * y **acertaría a veces y erraría en silencio otras**, porque los títulos se repiten.
   *
   * Va envuelto en `try` porque **la regla 3 es que no bloquea la corrida**: un fallo del aviso
   * no puede tirar abajo la lectura que estaba avisando. Un instrumento que rompe lo que mide
   * es peor que no tenerlo. */
  try {
    var claveAviso = clave + '||' + String(columnaLetra || '').trim().toUpperCase();
    if (!Object.prototype.hasOwnProperty.call(avisosEncabezadoUnion_, claveAviso)) {
      var desalineado = desalineamientoDeEncabezado_(
        encabezadosEsperadosEnColumna_(baseId, solapa, columnaLetra), real);
      if (desalineado) {
        avisosEncabezadoUnion_[claveAviso] = '⚠ D-31 · ' + baseId + '/' + solapa + ' col ' +
          columnaLetra + ': MAPEO espera "' + desalineado.esperados.join('" o "') +
          '" y la hoja tiene "' + desalineado.real + '". **La letra manda: el valor se lee igual ' +
          'de ' + columnaLetra + '.** Puede ser una columna insertada que corrió las letras — o ' +
          'un encabezado corrido en origen (C-09), que no es lo mismo.';
      }
    }
  } catch (e) {
    // Silencio deliberado: ver la regla 3, arriba.
  }

  return real;
}

/* ═══════════ `2026-08-25` — `D-31` ADDENDUM: la lectura POR POSICIÓN ══════════════════════
 *
 * ⭐⭐ **La regla, y su borde:** *«la letra es la referencia y el encabezado sólo testigo»* **no se
 * sostiene en un lector que indexa por título.** Cuando el título de una columna **se repite en la
 * solapa**, la letra manda **y el encabezado deja de ser testigo** — porque no puede distinguir cuál
 * de las repetidas es. **La lectura por posición se declara en `MAPEO`, no en el código.**
 *
 * **El caso:** `reuniones/Agenda JM | Post` tiene `Visualizaciones` cuatro veces (M, R, W, AB) y
 * `% VTR` otras cuatro (N, S, X, AC). Son **los cuatro bloques**: ⭐ **el primero es el ACUMULADO**
 * y los otros tres Meta, Google y Programmatic (decisión del usuario, 25/08, y medido:
 * `col12 = col17 + col22 + col27` cierra en **66 de 66** filas evaluables).
 *
 * ⛔⛔ **Y con esto el testigo de integridad de `D-31` DEJA DE FUNCIONAR para estas columnas.** El
 * testigo era el **encabezado**: si la columna se corre, el título ya no coincide y salta el aviso.
 * **Con títulos repetidos no puede saltar**, porque el título de al lado es el mismo. Si alguien
 * inserta una columna entre L y M, `vis_totales` pasa a leer `% Cobertura` **y nadie se entera**.
 *
 * ⭐⭐ **El testigo que lo reemplaza, y es más fuerte: la IDENTIDAD DE LOS BLOQUES.**
 *
 *     col12 (acumulado)  =  col17 (Meta) + col22 (Google) + col27 (Programmatic)
 *
 * **Verifica la POSICIÓN y la SEMÁNTICA a la vez**, que es lo que un encabezado no hace: un título
 * puede coincidir con la columna equivocada, pero **la suma sólo cierra si las cuatro posiciones son
 * las cuatro que se creen**. Lo corre `verificarBloquesPostReuniones()`.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** El prefijo de las claves posicionales que `leerFuente` agrega a cada fila. */
var PREFIJO_COLUMNA_POSICIONAL_ = '__pos__';

/**
 * La clave con la que un marcador tiene que leer esa columna: el **título**, o la **posición** si
 * `MAPEO` lo declara.
 *
 * ⭐ **Se resuelve acá y no en cada llamador**, que es el mismo argumento de siempre: los siete
 * puntos de `datosDeMarcador_` lo heredan sin tocarlos, y el próximo que se agregue **no se tiene
 * que acordar**. La guarda va en el punto por el que pasan todos.
 *
 * ⚠ **Sigue llamando a `encabezadoEnColumna_` aunque vaya a devolver la posición**, y no es
 * desperdicio: esa función es la que emite el aviso de `D-31`, y **querer leer por posición no es
 * motivo para dejar de mirar qué hay en la columna**. El aviso cambia de sentido —ya no es el
 * testigo— pero sigue siendo información.
 */
function claveDeLecturaEnColumna_(baseId, solapa, columnaLetra) {
  var real = encabezadoEnColumna_(baseId, solapa, columnaLetra);
  if (!leePorPosicion_(baseId, solapa, columnaLetra)) return real;
  return PREFIJO_COLUMNA_POSICIONAL_ + columnaLetraAIndice_(columnaLetra);
}

/** ¿Alguna fila de `MAPEO` declara `por_posicion` para esa letra de esa solapa? */
function leePorPosicion_(baseId, solapa, columnaLetra) {
  var mapa = leerMapeo();
  var deLaSolapa = mapa[baseId] && mapa[baseId][solapa];
  if (!deLaSolapa) return false;
  var letra = String(columnaLetra || '').trim().toUpperCase();
  if (!letra) return false;
  return Object.keys(deLaSolapa).some(function (campoLogico) {
    var f = deLaSolapa[campoLogico];
    return String(f.columna || '').trim().toUpperCase() === letra && esVerdadero_(f.por_posicion);
  });
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

/**
 * Caché de la unión por ventana. Corrida nocturna 04/08: `filasDigitalDeEncuentro` rehace
 * la unión entera **en cada llamada**, y el Paso 5 la llama una vez por marcador y por
 * ítem — 13 marcadores × 5 encuentros × 27 s no entra en los 6 minutos de Apps Script.
 *
 * Es de módulo, o sea **por ejecución**, mismo criterio que `cacheBases_` (`Fuentes.gs`):
 * las cuatro bases son de sólo lectura para el motor, así que no hay escritura propia que
 * lo pueda dejar viejo dentro de una corrida.
 */
var cacheUnionDigital_ = {};

function unirDigitalPorCuenta(ventana) {
  var claveCache = ventana && ventana.desde && ventana.hasta
    ? formatearFecha_(ventana.desde) + '||' + formatearFecha_(ventana.hasta)
    : '(sin ventana)';
  if (Object.prototype.hasOwnProperty.call(cacheUnionDigital_, claveCache)) {
    return cacheUnionDigital_[claveCache];
  }
  var resultado = unirDigitalPorCuentaSinCache_(ventana);
  cacheUnionDigital_[claveCache] = resultado;
  return resultado;
}

function unirDigitalPorCuentaSinCache_(ventana) {
  var maestraLeida = leerFuente(BASE_DIGITAL_, ventana, SOLAPA_MAESTRA_DIGITAL_);
  if (!maestraLeida.ok) return { ok: false, motivo: maestraLeida.motivo };

  var idMaestra = buscarMapeo(BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, 'sd_id_cuenta');
  if (!idMaestra.ok) return { ok: false, motivo: idMaestra.motivo };

  var porCuenta = {};
  var diagnostico = {};
  var cuentasMaestra = 0;

  // Corrida nocturna 04/08 — las columnas de dimensión se resuelven UNA vez, fuera del
  // bucle. Adentro eran cinco `buscarMapeo` por fila sobre ~1300 cuentas, y `buscarMapeo`
  // no cachea: cada llamada relee `SOLAPAS` y `MAPEO` enteras con `getDataRange()`. Eran
  // ~13.000 lecturas de la planilla de control y se comían los 6 minutos de Apps Script —
  // `unirDigitalPorCuenta` sola no volvía, y con ella se caía `anclarEncuentros()`.
  var columnasDimension = [];
  CAMPOS_DIMENSION_MAESTRA_.forEach(function (campoLogico) {
    var campo = buscarMapeo(BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, campoLogico);
    if (campo.ok) columnasDimension.push({ campo_logico: campoLogico, columna: campo.columna });
  });

  maestraLeida.filas.forEach(function (fila) {
    var idCuenta = normalizarIdCuenta_(valorPorColumna_(fila, BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, idMaestra.columna));
    if (!idCuenta) return;

    var registro = { sd_id_cuenta: idCuenta };
    columnasDimension.forEach(function (dim) {
      registro[dim.campo_logico] = valorPorColumna_(fila, BASE_DIGITAL_, SOLAPA_MAESTRA_DIGITAL_, dim.columna);
    });

    porCuenta[idCuenta] = registro;
    cuentasMaestra++;
  });

  // `N4` (09/08) — el diagnóstico no podía ver la pisada, y ése era el problema.
  //
  // `cuentasMaestra` cuenta **filas con id**, no ids distintos, y se publicaba como `cuentas`:
  // informaba 840 donde los ids reales son 763, así que comparar `filas_leidas` contra `cuentas`
  // **no detectaba que 77 filas de maestra desaparecen** en la asignación de la línea 143.
  //
  // Ahora se publican las dos cosas y la diferencia como campo propio. **Esto no cambia el
  // comportamiento de la unión**: sigue pisando exactamente igual, y con qué reemplazarla es una
  // decisión de diseño que espera al usuario. Lo único que cambia es que el problema se ve.
  var idsDistintosMaestra = Object.keys(porCuenta).length;
  diagnostico[SOLAPA_MAESTRA_DIGITAL_] = {
    ok: true,
    filas_leidas: maestraLeida.filas.length,
    filas_con_id: cuentasMaestra,
    cuentas: idsDistintosMaestra,
    filas_pisadas: cuentasMaestra - idsDistintosMaestra
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

    // `N5` (09/08) — `huerfanas_en_canal` es una lista de ids **con repetidos**: se pushea una
    // vez por fila descartada, así que su `.length` son filas, no cuentas, y el rótulo decía
    // "huérfanas" a secas. Es el mismo error de conteo que `cuentasMaestra` (ver `N4`), en el
    // otro campo.
    //
    // Medido el 09/08: `Directa Mail` descarta 631 filas de 2162 (292 ids) y `Digital` 922 de
    // 1297 (842 ids). No es una nota al pie: es el 29 % y el 71 % de dos canales cayéndose sin
    // que la corrida lo diga. `R-19` fijó que una fuente que dejó de traer es una falla; esto es
    // hacerlo visible.
    //
    // **No cambia qué se descarta** — eso es diseño y espera al usuario. El campo original se
    // conserva con su forma para no romper a nadie.
    var filasPorIdHuerfano = {};
    huerfanasEnCanal.forEach(function (id) {
      filasPorIdHuerfano[id] = (filasPorIdHuerfano[id] || 0) + 1;
    });
    var idsHuerfanos = Object.keys(filasPorIdHuerfano);
    var mayoresHuerfanos = idsHuerfanos
      .sort(function (a, b) { return filasPorIdHuerfano[b] - filasPorIdHuerfano[a]; })
      .slice(0, 5)
      .map(function (id) { return { id_cuenta: id, filas: filasPorIdHuerfano[id] }; });

    diagnostico[canal.solapa] = {
      ok: true,
      filas_leidas: leido.filas.length,
      cuentas_matcheadas: matcheadas,
      huerfanas_en_canal: huerfanasEnCanal,
      huerfanas_filas: huerfanasEnCanal.length,
      huerfanas_ids: idsHuerfanos.length,
      huerfanas_mayores: mayoresHuerfanos,
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
//
// `T2.9.2` (07/08): el número sale del código y va a `CONFIG`
// (`ventana_candidatos_anclaje_dias`), mismo patrón que `umbralAnclajeReunion_()`. Esta
// constante queda **sólo como default** si `CONFIG` no lo tiene cargado — nunca se usa
// directo, siempre pasa por el helper.
var VENTANA_DIAS_CANDIDATOS_ANCLAJE_DEFECTO_ = 14;

function ventanaCandidatosAnclajeDias_() {
  var valor = Number(leerConfig().ventana_candidatos_anclaje_dias);
  return (isNaN(valor) || valor <= 0) ? VENTANA_DIAS_CANDIDATOS_ANCLAJE_DEFECTO_ : valor;
}

/**
 * `T2.9.2` / `R-12` — la ventana **ampliada**, la segunda mitad que hoy no existe.
 *
 * Devuelve `null` cuando `CONFIG.ventana_candidatos_anclaje_ampliada_dias` está vacía, y
 * **`null` significa "no ampliar"** — que es exactamente lo que el motor hace hoy. Por eso
 * este paso no cambia ningún comportamiento: saca el número del código y deja la clave a la
 * vista, vacía, esperando la decisión de cuántos días.
 *
 * **Nadie la consume todavía.** `R-12` lo dice con todas las letras: el cambio de
 * comportamiento —reintentar con la ventana ampliada antes de declarar `sin_link`— es de otro
 * paso. Si algún día se carga un número acá y nada lo lee, eso es un bug de ese paso, no de
 * éste.
 */
function ventanaCandidatosAnclajeAmpliadaDias_() {
  var crudo = String(leerConfig().ventana_candidatos_anclaje_ampliada_dias || '').trim();
  if (!crudo) return null;
  var valor = Number(crudo);
  return (isNaN(valor) || valor <= 0) ? null : valor;
}

/**
 * `2026-08-20_8` Parte A (20/08/2026) — **el anclaje busca en dos pasos: acotado primero, ampliado
 * si no encuentra.** Completa la mitad que `R-12` declaró y `T2.9.2` dejó sin implementar.
 *
 * ⭐ **La propiedad que lo hace seguro: el recorte es PERFORMANCE, no criterio.** El primer paso
 * decide **cuánto se tarda**, nunca **qué se encuentra**. Un recorte que pudiera cambiar el
 * resultado sería un filtro disfrazado de optimización, y ésos fallan sin avisar.
 *
 * ⭐ **La regla de corte —lo que el paso 1 resuelve queda resuelto— NO es una optimización: es
 * determinismo.** Sin ella, ampliar podría traer un candidato con mejor score y el mismo encuentro
 * se anclaría distinto según cuántos días haya configurados. El resultado dependería de un número
 * de `CONFIG` en vez de los datos.
 *
 * ⚠ **Y lo que este mecanismo NO arregla, medido antes de escribirlo** (Parte 0 del `2026-08-20_8`):
 * **ninguno de los dos recortes pierde un candidato que arrancó 10 días antes.**
 *
 *   - el **universo** no se recorta: `digital` es `modo_periodo = snapshot`, así que `leerFuente`
 *     *"ignora la ventana y devuelve todas las filas"*;
 *   - la **cercanía** es `Math.abs(...) <= msVentana`, o sea **±14 días simétricos**, que cubre los
 *     10 con margen.
 *
 * **Lo que sí lo pierde es el SCORE**, y ampliar no lo toca: `scoreMatchDigitalRdv_` da `+0.5` a
 * menos de un día, `+0.25` hasta dos, y **cero más allá**. A 10 días el candidato **está en el
 * conjunto y no suma nada por fecha**, así que sólo ancla si barrio + tipo + tokens lo llevan solos
 * por encima del umbral (0,6). Traer más candidatos **no ayuda y puede empeorar**: la fecha es
 * *"la única señal que separa"* dos campañas del mismo eje, y por eso existe el desempate.
 *
 * Por eso esto entra **con la ampliada vacía**, que es el comportamiento de hoy, y la decisión de
 * los 10 días queda propuesta donde corresponde —el score— y **no aplicada acá**.
 */
function anclarEnDosPasos_(candidatosTodos, fecha, umbral, puntuar) {
  var acotada = ventanaCandidatosAnclajeDias_();
  var cercanos = candidatosCercanosPorFecha_(candidatosTodos, fecha, acotada);
  var r = anclar_(cercanos, null, umbral, puntuar, fecha);
  r.paso = 1;
  r.candidatos_paso1 = cercanos.length;
  r.ventana_paso1 = acotada;

  // Lo que el paso 1 resuelve queda resuelto. La condición es **pasa el umbral**, no "hay algún
  // candidato": un `bajaConfianza` del paso 1 sí merece el segundo intento.
  if (r.pasaUmbral) return r;

  var ampliada = ventanaCandidatosAnclajeAmpliadaDias_();
  if (ampliada === null) return r;          // vacía = no ampliar, que es lo de siempre
  if (ampliada <= acotada) return r;        // una ampliada más chica no amplía nada

  var masCercanos = candidatosCercanosPorFecha_(candidatosTodos, fecha, ampliada);
  if (masCercanos.length === cercanos.length) return r;   // no entró ninguno nuevo

  var r2 = anclar_(masCercanos, null, umbral, puntuar, fecha);
  r2.paso = 2;
  r2.candidatos_paso1 = cercanos.length;
  r2.candidatos_paso2 = masCercanos.length;
  r2.ventana_paso1 = acotada;
  r2.ventana_paso2 = ampliada;
  return r2;
}

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
/**
 * Desempate temporal (09/08) — **el arreglo de la cuenta homónima.**
 *
 * `scoreMatchDigitalRdv_` puntúa barrio/comuna/eje, tipo y solapamiento de tokens. **La
 * fecha no suma nada**, así que dos cuentas que comparten el nombre de campaña sacan
 * **exactamente el mismo score** y `sort` deja adelante a la que vino primero: la cuenta se
 * elegía **por orden de aparición**. Fue lo que puso los once números de Orden Público en
 * `3347-JULJDGAG` (16–17/07) cuando el encuentro era `3387-JULJDGGC` (22–26/07).
 *
 * **Se desempata, no se re-puntúa.** Tocar los pesos del score movería los cinco anclajes
 * que hoy funcionan; esto sólo actúa **cuando hay empate en el máximo**, que es exactamente
 * el caso roto y sólo ése.
 *
 * **Un empate que no se puede desempatar devuelve `ambiguo`, no una cuenta al azar.** Es la
 * regla que este bug enseñó: un número plausible de la cuenta equivocada es peor que un
 * hueco — sobrevivió meses porque `37763` parecía bien.
 */
function desempatarPorFecha_(empatados, fechaObjetivo) {
  if (!fechaObjetivo) {
    return { ok: false, motivo: 'hay ' + empatados.length + ' candidatos con el mismo score y el encuentro no tiene fecha para desempatar' };
  }

  var sinFecha = empatados.filter(function (e) { return !(e.candidato.parseado && e.candidato.parseado.fecha); });
  if (sinFecha.length) {
    return {
      ok: false,
      motivo: 'hay ' + empatados.length + ' candidatos con el mismo score y ' + sinFecha.length +
        ' no tiene(n) fecha en el nombre de campaña: no se pueden comparar por proximidad'
    };
  }

  var conDistancia = empatados.map(function (e) {
    return { item: e, dias: Math.abs(e.candidato.parseado.fecha.getTime() - fechaObjetivo.getTime()) / 86400000 };
  }).sort(function (a, b) { return a.dias - b.dias; });

  if (conDistancia.length > 1 && conDistancia[0].dias === conDistancia[1].dias) {
    return {
      ok: false,
      motivo: 'hay ' + empatados.length + ' candidatos con el mismo score y los dos primeros están a la misma ' +
        'distancia del encuentro (' + Math.round(conDistancia[0].dias) + ' día(s)): el desempate temporal no alcanza'
    };
  }

  return {
    ok: true,
    elegido: conDistancia[0].item,
    motivo: 'desempate temporal entre ' + empatados.length + ' homónimos: se eligió ' +
      (conDistancia[0].item.candidato.idCuenta || '?') + ' a ' + Math.round(conDistancia[0].dias) +
      ' día(s) del encuentro, contra ' + Math.round(conDistancia[1].dias) + ' del siguiente'
  };
}

function anclar_(candidatos, contexto, umbral, funcionScore, fechaObjetivo) {
  var ranking = candidatos
    .map(function (c) { return { candidato: c, score: funcionScore(c, contexto) }; })
    .sort(function (a, b) { return b.score - a.score; });

  var mejor = ranking[0];
  var traza = '';
  var ambiguo = false;

  // El empate se mide sobre el score máximo, y sólo entre los que lo comparten.
  if (mejor && mejor.score > 0) {
    var empatados = ranking.filter(function (r) { return r.score === mejor.score; });
    if (empatados.length > 1) {
      var d = desempatarPorFecha_(empatados, fechaObjetivo);
      if (d.ok) {
        mejor = d.elegido;
        traza = d.motivo;
      } else {
        ambiguo = true;
        traza = d.motivo;
      }
    }
  }

  return {
    mejor: (mejor && !ambiguo) ? mejor.candidato : null,
    score: mejor ? mejor.score : 0,
    pasaUmbral: !ambiguo && !!mejor && mejor.score >= umbral,
    ambiguo: ambiguo,
    traza_desempate: traza,
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

  // Corrida nocturna 04/08 — la asimetría que trababa el anclaje: esta verificación leía
  // con `getDataRange()` directo, así que contaba duplicados de `R-01` sobre filas que
  // `anclarEncuentros()` nunca mira (sólo empareja las `Realizada`). El filtro sale de
  // `MAPEO.valores_incluidos` (`D-21`) reusando el mismo par de funciones que `leerFuente`
  // —`filtrosValoresIncluidos_` / `filaPasaListaBlanca_` (`Fuentes.gs`)—, no de un literal:
  // cambiar la lista blanca no debe exigir `clasp push`.
  var listaBlanca = filtrosValoresIncluidos_('rdv', SOLAPA_ANCLA_RDV_);
  var filasExcluidas = 0;
  var consideradas = [];
  datos.forEach(function (fila, j) {
    // Se guarda el número de fila de la planilla junto con la fila: las excluidas corren
    // los índices, así que después no se puede reconstruir desde la posición.
    if (filaPasaListaBlanca_(fila, listaBlanca).pasa) consideradas.push({ fila: fila, numero: filaEncabezado + j + 1 });
    else filasExcluidas++;
  });

  // Columnas de contexto para poder anotar los grupos enteros si alguno queda duplicado.
  // Opcionales a propósito: si una no está en `MAPEO`, el reporte pierde una columna, no
  // la verificación.
  var contexto = {};
  ['evento', 'barrio', 'status'].forEach(function (nombre) {
    var campo = buscarMapeo('rdv', SOLAPA_ANCLA_RDV_, nombre);
    if (campo.ok) contexto[nombre] = columnaLetraAIndice_(campo.columna);
  });

  var gruposPorClave = {};
  consideradas.forEach(function (registro) {
    var fila = registro.fila;
    var figura = fila[idxFigura];
    var fecha = fila[idxFecha];
    if (!figura || !fecha) return;
    var claveFecha = (fecha instanceof Date) ? formatearFecha_(fecha) : String(fecha).trim();
    var clave = String(figura).trim() + '||' + claveFecha;
    if (!gruposPorClave[clave]) gruposPorClave[clave] = [];
    gruposPorClave[clave].push({
      fila: registro.numero,
      figura: String(figura).trim(),
      fecha: claveFecha,
      evento: 'evento' in contexto ? String(fila[contexto.evento] || '').trim() : '',
      barrio: 'barrio' in contexto ? String(fila[contexto.barrio] || '').trim() : '',
      status: 'status' in contexto ? String(fila[contexto.status] || '').trim() : ''
    });
  });

  var duplicados = Object.keys(gruposPorClave).filter(function (k) { return gruposPorClave[k].length > 1; });
  if (duplicados.length) {
    return {
      ok: false,
      motivo: 'R-01 no se cumple: ' + duplicados.length + ' grupo(s) con más de un encuentro por ' +
        '(Figura, fecha) en rdv/' + SOLAPA_ANCLA_RDV_ + ', sobre ' + consideradas.length + ' fila(s) que ' +
        'pasan la lista blanca de MAPEO. anclarEncuentros() no corre hasta resolverlo ' +
        '(ver R-01 en docs/REGLAS_NEGOCIO.md).',
      filas_consideradas: consideradas.length,
      filas_excluidas_por_valor: filasExcluidas,
      grupos: duplicados.map(function (k) { return gruposPorClave[k]; })
    };
  }

  return {
    ok: true,
    filas_consideradas: consideradas.length,
    filas_excluidas_por_valor: filasExcluidas
  };
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
function scoreMatchDigitalRdv_(candidato, evento, barrio, fechaEncuentro) {
  var parseado = candidato.parseado;
  var barrioEncuentroNorm = normalizar_(barrio);
  var comunaEncuentro = parsearComuna_(barrio) || parsearComuna_(evento);
  var ejeEncuentro = parsearEje_(evento);

  var score = 0;

  // La fecha, que es la mitad de la clave del negocio (`Figura · Barrio · Fecha`, 10/08) y
  // hasta hoy **no entraba al score**: se usaba sólo como prefiltro de ±14 días.
  //
  // Es lo que puso once números de Orden Público en la cuenta equivocada. Medido el 10/08:
  // `3387-JULJDGGC` se llama "Agenda RDV Con 1 - Orden Público Eje Norte **28/7**" y
  // `3347-JULJDGAG` "…Orden Publico Eje Norte **21/7**". El encuentro es el **28/07**. Las
  // dos comparten eje, tipo y casi todos los tokens, así que sacaban prácticamente el mismo
  // score — **la única señal que las separa es la fecha, y no se estaba mirando**.
  //
  // Pesa 0,5, igual que el barrio: no es un desempate residual, es clave.
  if (parseado.fecha && fechaEncuentro) {
    var dias = Math.abs(parseado.fecha.getTime() - fechaEncuentro.getTime()) / 86400000;
    if (dias < 1) score += 0.5;
    else if (dias <= 2) score += 0.25;
    // Más de dos días: no suma. No resta, porque el nombre de campaña puede traer la fecha
    // de la convocatoria y no la del encuentro — restar convertiría un match flojo en un
    // `sinLink` y perdería encuentros que hoy anclan bien.
  }

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

  // `T2.9.4` (07/08) — **el filtro por status se retiró de acá.** Lo hace `leerFuente` por la
  // lista blanca de `D-21`: `MAPEO.rdv/RVD JM-CM - ES/status.valores_incluidos = "Realizada"`,
  // y su propia nota ya decía *"el consumidor duplicado de `Union.gs` se retira en el paso del
  // matcher"*. Filtrar dos veces por lo mismo no daba un resultado distinto, pero **sostenía
  // una constante de módulo con un valor de negocio adentro** (`VALOR_STATUS_REALIZADA_`), que
  // es deuda desde la línea uno (`CLAUDE.md` §2): cambiar qué status entra exigía `clasp push`
  // en vez de editar una celda.
  //
  // `campoStatus` se sigue exigiendo más arriba a propósito: si el mapeo de `status`
  // desapareciera, la lista blanca dejaría de filtrar y este matcher empezaría a encontrar
  // encuentros suspendidos **sin decirlo**. La precondición se queda; el filtro se va.
  /* ⭐ `2026-08-22_22` — **al término de búsqueda se le recortan los separadores de los bordes.**
   *
   * **El caso, medido en vivo el 22/08:** el temario trae `nombre = ": Salud"` —con los dos puntos
   * adelante—, porque `parsearLineaReunion_` corta *"2) JM | Encuentro Temático: Salud 14/08"* por
   * el `|` y deja el separador del título pegado al nombre. Con ese término, el `indexOf` de abajo
   * **no matchea nada**: `rdv` dice `Salud`, no `: Salud`. El encuentro quedaba sin fila de `rdv`,
   * y con él **sin los `ecv_*` de su lámina y sin poder entrar al agregado del temario** — que es
   * lo que frenó el nivel 1 de `R-21`.
   *
   * ⛔ **Y por qué acá y NO en `normalizar_`** (decisión del usuario, 22/08): `normalizar_` lo usa
   * **todo el proyecto**, incluido el scoring del anclaje digital. Sacarle la puntuación ahí
   * cambiaría matcheos que hoy funcionan, en lugares que este paso no midió. Esto es **local al
   * matcher**, no cambia ningún otro matcheo, y no obliga a nadie a editar la base.
   *
   * ⚠ **Sólo los bordes, y eso es la mitad del arreglo.** Un separador **en el medio** es parte
   * del nombre: `"Encuentro Temático: Salud"` matchea bien hoy si `rdv` dice lo mismo, y
   * recortarlo por dentro rompería ese caso para arreglar el otro.
   *
   * **No es un normalizador nuevo** en el sentido de `CLAUDE.md` §2 —no canonicaliza para
   * comparar dos lados, ni se aplica al dato de la base—: recorta **un término de búsqueda**, de
   * un solo lado, dentro de una sola función. Los cuatro que ya existen se miraron y ninguno hace
   * esto; `normalizar_` es el que se le aplica antes y sigue haciendo su trabajo. */
  var nombreBuscado = normalizar_(reunion.nombre).replace(/^[\s:;,./|\-–—]+|[\s:;,./|\-–—]+$/g, '');

  /* ⛔ **Vacío no se busca: falla.** Un `nombreBuscado` vacío convierte el `indexOf` de abajo en un
   * **match universal** —`''` está contenido en cualquier cadena—, así que **la primera fila de
   * `rdv` de esa fecha ganaría**, y sería la fila equivocada con forma de acierto. Es exactamente
   * el modo de falla que este arreglo no puede introducir: un número plausible del encuentro de
   * otro. */
  if (!nombreBuscado) {
    return {
      ok: false,
      motivo: 'REUNIONES "' + reunion.nombre + '" no deja nada para buscar: el nombre es sólo ' +
        'separadores o espacios. NO se busca con un término vacío — encontraría la primera fila ' +
        'de rdv de esa fecha, que sería la del encuentro equivocado. Corregí el nombre en REUNIONES.'
    };
  }

  var encontrada = null;
  lectura.filas.forEach(function (fila) {
    if (encontrada) return;
    var barrio = valorPorColumna_(fila, 'rdv', lectura.hoja, campoBarrio.columna);
    var evento = campoEvento.ok ? valorPorColumna_(fila, 'rdv', lectura.hoja, campoEvento.columna) : '';
    if (normalizar_(barrio).indexOf(nombreBuscado) !== -1 || normalizar_(evento).indexOf(nombreBuscado) !== -1) {
      encontrada = fila;
    }
  });

  if (!encontrada) {
    return {
      ok: false,
      motivo: 'No se encontró un encuentro para "' + reunion.nombre + '" (' +
        Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy') + ') en rdv/' + lectura.hoja +
        ' — las filas que llegan acá ya vienen filtradas por MAPEO.status.valores_incluidos (D-21)'
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
/* ⭐ `2026-08-21_19` Parte C — **`archivada` va AL FINAL, y es una columna propia y no un valor
 * reservado en `elegido`.**
 *
 * **Por qué no un centinela en `elegido`, que era la otra salida posible:** `elegido` tiene un
 * significado que el motor consulta —`anclajeYaConfirmado_` devuelve su contenido como el
 * candidato elegido— y `validarEleccionAnclaje_` **rechaza a propósito** todo lo que no sea un
 * candidato de esa fila o vacío, porque *"un `elegido` que nadie puntuó reabre por la puerta nueva
 * el agujero que `D-29` cierra"*. Meterle un centinela obligaría a que **todos** los lectores lo
 * conozcan, y al primero que se olvide el motor ancla contra una cadena inventada. **Archivar y
 * elegir son dos decisiones distintas: una columna cada una.**
 *
 * ⚠ **Al final del array, y eso importa:** `registrarAnclajePendiente_` reescribe la fila con
 * `getRange(fila, 1, 1, fila.length)` y arma **nueve** valores por posición. Con la columna décima,
 * esa reescritura **no la toca** — o sea que una fila archivada sigue archivada aunque la corrida
 * siguiente le refresque los candidatos. Una columna insertada en el medio habría corrido las
 * posiciones y el escritor habría empezado a poner puntajes donde van nombres, **sin fallar**.
 *
 * ⚠ **Y la hoja vieja no tiene esta columna.** `obtenerHojaAnclajePendiente_` sólo escribe los
 * encabezados cuando CREA la hoja, así que agregar el nombre acá no migra nada: eso lo hace
 * `columnaArchivadaDeAnclaje_`, que la crea al vuelo la primera vez que alguien archiva. Es el
 * mismo problema que `COLUMNAS_DELTA_` resuelve para las hojas de registro — y esta hoja no es
 * una: es operativa, como `CORRIDAS` y `PLAN_CORRIDA`, y no está en ninguna de las tres listas. */
var HEADERS_ANCLAJE_PENDIENTE_ = ['tipo', 'nombre_buscado', 'candidato_1', 'puntaje_1', 'candidato_2', 'puntaje_2', 'candidato_3', 'puntaje_3', 'elegido', 'archivada'];

/* ═══════════ `2026-08-23_1` Parte D — la medición del anclaje deja rastro ═════════════════
 *
 * *«Un instrumento que no declara cuánto midió contamina toda conclusión que se apoye en él.»*
 *
 * ⛔ **Hoy `ANCLAJE_PENDIENTE` vacío no distingue «no corrió» de «corrió y nadie cayó bajo el
 * umbral».** Las dos son la misma pantalla vacía y mandan a cosas opuestas: la primera a correr, la
 * segunda a no tocar nada. Y los `sinLink` —los encuentros que no ancló— **no dejan rastro en
 * ninguna hoja**: viven en el retorno de `anclarEncuentros` y mueren con la ejecución.
 *
 * ⭐ **Lo mínimo que arregla las dos cosas es lo mismo: escribir cuántos se intentaron, cuántos
 * anclaron y cuántos no, con nombre.** Una fila por corrida del anclaje. Con ella, una hoja **con
 * filas y cero pendientes** dice *«corrí y no hubo dudosos»*, que es exactamente lo que hoy no se
 * puede afirmar.
 *
 * ⚠ **No es hoja de registro**: es operativa, como `CORRIDAS`, `FALTANTES` y `PLAN_CORRIDA`. No
 * entra a `ALCANCE_REGISTROS_` ni a las tres listas que compara `tools/listas.js`, y eso es a
 * propósito — nadie la siembra y nadie la edita a mano.
 *
 * ⚠ **Y acumula, a diferencia de `FALTANTES`.** Acá el valor está justamente en la serie: *«esta
 * semana anclaron 4 de 6 y la anterior 6 de 6»* es la lectura que hace falta, y una fila por
 * corrida no crece como 190. El tope lo pone `TOPE_MEDICIONES_ANCLAJE_`, que poda las viejas.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐⭐ `2026-08-27` Parte 0-bis — **escribe en `REUNIONES.id_cuenta` las cuentas que el anclaje
 * resolvió por encima del umbral.**
 *
 * ⭐ **Reusa `curarCamposReuniones_` y no escribe por su cuenta**, y eso no es comodidad: esa
 * función escribe **sólo los campos nombrados**, por clave `texto_original`, y **no pasa por
 * `upsertPorClave_`** — o sea que **no blanquea las demás columnas**, que es el modo de falla que
 * `CLAUDE.md` §2 documenta con tres casos en una semana. Un escritor propio acá habría sido el
 * cuarto.
 *
 * ⚠ **No puede voltear el anclaje.** Mismo criterio que `registrarMedicionAnclaje_` y que
 * `marcarEtapa_`: un fallo al dejar rastro no puede costar el trabajo que se estaba haciendo. Lo
 * que sí hace es **dejar rastro de su propio fallo** — un `catch` vacío haría que la hoja mienta
 * por omisión.
 *
 * ⚠ **`sin_fila` no es un detalle:** significa que el `texto_original` del encuentro no está en la
 * hoja, o sea que la fila se editó o vino de otro lado. Se informa; no se inventa la fila.
 */
function escribirCuentasAncladas_(pendientes) {
  var salida = { intentadas: (pendientes || []).length, escritas: 0, sin_fila: [], motivo: '' };
  if (!salida.intentadas) return salida;

  try {
    var r = curarCamposReuniones_(pendientes);
    if (!r || !r.ok) {
      salida.motivo = (r && r.motivo) || 'curarCamposReuniones_ no devolvió ok';
      Logger.log('⚠ anclarEncuentros: no se pudo escribir REUNIONES.id_cuenta — ' + salida.motivo);
      return salida;
    }
    salida.escritas = r.cambios_escritos;
    salida.sin_fila = r.sin_fila || [];
    Logger.log('anclarEncuentros: REUNIONES.id_cuenta — ' + salida.escritas + ' de ' +
      salida.intentadas + ' cuenta(s) quedaron declaradas' +
      (salida.sin_fila.length ? ' · ⚠ sin fila en la hoja: ' + salida.sin_fila.join(' | ') : ''));
  } catch (e) {
    salida.motivo = String((e && e.message) ? e.message : e);
    Logger.log('⚠ anclarEncuentros: excepción al escribir REUNIONES.id_cuenta — ' + salida.motivo +
      '. El anclaje sigue: esto es rastro, no resultado.');
  }
  return salida;
}

var HEADERS_ANCLAJE_MEDICION_ = ['cuando', 'ventana_desde', 'ventana_hasta', 'periodo_id',
  'intentados', 'anclados', 'baja_confianza', 'sin_link', 'umbral', 'sin_link_detalle', 'excluidas_por_periodo'];

/**
 * Cuántas mediciones se guardan. Una fila por corrida del anclaje: con dos o tres corridas por
 * semana, 200 filas son más de un año. **Se poda desde arriba** —las viejas— para que la hoja no
 * crezca sin límite en un libro que ya tiene veinte hojas.
 */
var TOPE_MEDICIONES_ANCLAJE_ = 200;

function obtenerHojaAnclajeMedicion_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('ANCLAJE_MEDICION');
  if (!hoja) {
    hoja = ss.insertSheet('ANCLAJE_MEDICION');
    hoja.getRange(1, 1, 1, HEADERS_ANCLAJE_MEDICION_.length).setValues([HEADERS_ANCLAJE_MEDICION_]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

/**
 * Escribe la medición de una corrida del anclaje.
 *
 * ⚠ **No puede voltear el anclaje.** Es un instrumento, y `CLAUDE.md` §4 ya tiene el precedente
 * con `marcarEtapa_`: un fallo del instrumento no puede costar el trabajo que estaba midiendo. Lo
 * que sí hace, y `marcarEtapa_` no hacía al principio, es **dejar rastro de su propio fallo** — un
 * `catch` vacío haría que la hoja mienta por omisión, que es el modo de falla que esto viene a
 * cerrar.
 *
 * ⚠ **Los nombres van TAL CUAL** —sin normalizar, sin limpiar—. Si el nombre de un encuentro llega
 * sucio, eso es un hallazgo sobre el parseo y tiene que verse. Un instrumento que lava sus datos
 * de entrada esconde el bug justo donde se diagnostica.
 */
function registrarMedicionAnclaje_(resultado, ventana) {
  try {
    var hoja = obtenerHojaAnclajeMedicion_();
    var intentados = resultado.encuentros.length + resultado.sinLink.length + resultado.bajaConfianza.length;
    var nombre = function (e) { return String(e.reunion || '') + (e.etapa ? ' (' + e.etapa + ')' : ''); };

    hoja.appendRow([
      new Date(),
      ventana && ventana.desde ? ventana.desde : '',
      ventana && ventana.hasta ? ventana.hasta : '',
      // `''` significa **no se filtró por período**, y el consumidor tiene que poder decirlo.
      resultado.periodo_id || '',
      intentados,
      resultado.encuentros.length,
      resultado.bajaConfianza.length,
      resultado.sinLink.length,
      resultado.umbral,
      // ⭐ Con nombre y motivo: un conteo de `sin_link` sin los nombres dice que hubo un problema
      // y no dice cuál. Los nombres son lo que permite ir a mirar la fila de `rdv`.
      resultado.sinLink.map(function (e) { return nombre(e) + ' — ' + (e.motivo || e.motivoAmbiguo || 'sin motivo'); }).join(' | '),
      (resultado.excluidas_por_periodo || []).map(function (e) { return String(e.item || e.campana || ''); }).join(' | ')
    ]);

    // Poda de las viejas. `getLastRow()` cuenta el encabezado, así que el excedente se mide
    // contra `TOPE + 1`.
    var sobran = hoja.getLastRow() - (TOPE_MEDICIONES_ANCLAJE_ + 1);
    if (sobran > 0) hoja.deleteRows(2, sobran);
    SpreadsheetApp.flush();
    return { ok: true, intentados: intentados };
  } catch (e) {
    var mensaje = String((e && e.message) ? e.message : e);
    try { Logger.log('registrarMedicionAnclaje_ falló: ' + mensaje); } catch (e2) { /* ni el log */ }
    return { ok: false, motivo: mensaje };
  }
}

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
/**
 * Mismo criterio que `cacheUnionDigital_`: el anclaje tarda ~50 s y el Paso 5 lo pide una
 * vez por sección repetible que itere `REUNIONES` —hoy dos—. Por ejecución, no entre
 * ejecuciones.
 */
var cacheAnclaje_ = {};

/**
 * ⛔⛔ `2026-08-25` — **un anclaje que FALLA también deja fila, y ésta es la mitad que faltaba.**
 *
 * **El hueco, medido el 25/08:** `registrarMedicionAnclaje_` se llama en **una sola línea, al
 * final** de `anclarEncuentrosSinCache_`. Los `return { ok: false }` tempranos —*«REUNIONES no
 * tiene filas para anclar»*, la precondición, la unión digital— **están 160 líneas antes y nunca
 * llegan ahí**. ⇒ **La hoja registraba sólo los éxitos.**
 *
 * ⭐⭐ **Y eso hace que su última fila se lea como «lo último que pasó» cuando es «lo último que
 * salió bien».** El 25/08 se comparó una fila de las 17:12 contra un fallo de las 20:07 y pareció
 * que dos instrumentos de la misma corrida decían cosas opuestas. **Nadie mentía: al fallo le
 * faltaba fila.**
 *
 * ⚠ **Es el mismo hueco que esta hoja vino a cerrar, un nivel más arriba.** `ANCLAJE_PENDIENTE`
 * vacío significaba dos cosas opuestas y por eso nació `ANCLAJE_MEDICION`; ahora el cero tiene
 * denominador **y el fallo no tiene fila**. La forma del bug sobrevivió al arreglo.
 *
 * ⭐ **Va en el punto CACHEADO y no en cada `return`**, y eso no es comodidad: los
 * `return { ok: false }` son varios y **el próximo que se agregue no se va a acordar de
 * registrar**. Un solo punto por el que pasan todos es la única forma de que ninguno se escape —
 * el mismo argumento que puso el registro de estimaciones en `controlDeEtapa_`.
 *
 * ⛔⛔ **Y NO se agrega una columna, aunque una `resultado` sería más prolija.** `ANCLAJE_MEDICION`
 * se crea a demanda y **sus headers sólo se escriben cuando la hoja no existe**: una columna nueva
 * no llegaría nunca a la hoja viva, y el `appendRow` de 12 valores contra 11 encabezados
 * **correría todas las columnas una posición, en silencio**. Es exactamente lo que `CLAUDE.md` §2
 * describe para las hojas de salida. El motivo va en `sin_link_detalle`, que en un fallo no tiene
 * otro uso.
 *
 * ⚠ **Y no puede voltear la corrida**, igual que `registrarMedicionAnclaje_`: un instrumento que
 * rompe lo que mide es peor que no tenerlo.
 */
function registrarFalloAnclaje_(resultado, ventana) {
  try {
    var hoja = obtenerHojaAnclajeMedicion_();
    hoja.appendRow([
      new Date(),
      ventana && ventana.desde ? ventana.desde : '',
      ventana && ventana.hasta ? ventana.hasta : '',
      /* ⚠ En un fallo temprano el período **puede no haberse resuelto todavía**, y eso es un dato:
       * vacío acá significa *«ni llegó a mirarlo»*, no *«no filtró»*. */
      (resultado && resultado.periodo_id) || '',
      /* ⛔⛔ **Los contadores van VACÍOS, nunca en cero.** Un `0` se lee como *«se intentó anclar
       * cero encuentros y salió bien»*, que es una afirmación — y falsa. **Vacío es «no se
       * midió»**, que es la verdad. Es la distinción de `CLAUDE.md` §4: *cero con denominador es
       * un resultado; cero sin denominador es un silencio*, y acá ni siquiera hubo denominador. */
      '', '', '', '', '',
      '⛔ FALLÓ: ' + String((resultado && resultado.motivo) || '(sin motivo)'),
      ''
    ]);

    // Misma poda que el registro de éxito. `getLastRow()` cuenta el encabezado.
    var sobran = hoja.getLastRow() - (TOPE_MEDICIONES_ANCLAJE_ + 1);
    if (sobran > 0) hoja.deleteRows(2, sobran);
    SpreadsheetApp.flush();
    return { ok: true, registrado: 'fallo' };
  } catch (e) {
    var mensaje = String((e && e.message) ? e.message : e);
    try { Logger.log('registrarFalloAnclaje_ falló: ' + mensaje); } catch (e2) { /* ni el log */ }
    return { ok: false, motivo: mensaje };
  }
}

/**
 * ⭐⭐ **La clave con la que una reunión se busca en `ANCLAJE_PENDIENTE`, escrita UNA vez.**
 *
 * `normalizar_(nombre) | yyyy-MM-dd | etapa`. Es lo que `anclarEncuentrosSinCache_` guarda como
 * `nombre_buscado` y lo que `anclajeYaConfirmado_` consulta antes de anclar.
 *
 * ⛔ **Estaba copiada en TRES lugares** —acá, `panel_getAnclajes` y `panel_archivarAnclaje`— y el
 * paso 3 del asistente habría sido el cuarto. Tres copias de una clave es la figura del techo
 * declarado en dos lugares: **el día que una gane un matiz, las otras dejan de matchear y no
 * falla** — la pantalla simplemente deja de encontrar la fila, que es indistinguible de que no
 * exista. Pura y sin planilla, así que se puede fijar con un banco.
 *
 * ⚠ **La fecha se normaliza a `yyyy-MM-dd` porque los dos lados llegan distintos:** de la hoja
 * viene un `Date` de Sheets y del parser uno construido. `'sin_fecha'` es un valor, no un hueco:
 * una reunión sin fecha legible sigue teniendo clave, y sigue siendo la misma entre corridas.
 */
function nombreBuscadoDeReunion_(reunion) {
  var fecha = (reunion.fecha instanceof Date) ? reunion.fecha : parsearFechaCelda_(reunion.fecha);
  return normalizar_(reunion.nombre) + '|' +
    (fecha ? Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd') : 'sin_fecha') +
    '|' + (reunion.etapa || '');
}

function anclarEncuentros(ventana) {
  // `_31.1` B.4 — el `origen` entra en la clave. Dos períodos pueden tener el mismo rango de
  // fechas y seleccionar temarios distintos: sin esto, el segundo leería el anclaje del primero.
  var claveCache = ventana && ventana.desde && ventana.hasta
    ? formatearFecha_(ventana.desde) + '||' + formatearFecha_(ventana.hasta) + '||' + String(ventana.origen || '')
    : '(sin ventana)';
  if (Object.prototype.hasOwnProperty.call(cacheAnclaje_, claveCache)) {
    return cacheAnclaje_[claveCache];
  }
  var resultado = anclarEncuentrosSinCache_(ventana);
  /* ⭐ El fallo se registra **acá y sólo en el miss de caché**: una fila por intento real, no una
   * por consulta. El éxito ya lo registra `anclarEncuentrosSinCache_` en su última línea. */
  if (resultado && resultado.ok === false) registrarFalloAnclaje_(resultado, ventana);
  cacheAnclaje_[claveCache] = resultado;
  return resultado;
}

/**
 * ⭐ `2026-08-22_25` Parte B — **qué filas de `PERIODOS` describen esta ventana.** Devuelve una
 * lista de `periodo_id`, vacía si ninguna coincide.
 *
 * **Leer no es adivinar**, y ésa es toda la diferencia con lo que `R-21` prohíbe: acá no se deduce
 * un período del rango, se le pregunta al registro cuáles de sus filas **son** ese rango.
 *
 * ⚠ **Devuelve lista y no una sola, porque hoy hay dos filas con la misma ventana** y elegir una
 * sería exactamente el paso que hay que no dar. Ver el comentario del llamador.
 *
 * ⚠ **Una fila con fechas ilegibles se saltea en silencio y eso es deliberado:** su ventana no se
 * puede comparar, así que no puede describir ninguna. Tumbar el anclaje por una fila mal tipeada
 * de `PERIODOS` sería peor — y `panel_getEstado` ya la muestra como `(fecha ilegible)`.
 */
function periodosQueDescribenLaVentana_(ventana) {
  if (!ventana || !ventana.desde || !ventana.hasta) return [];
  var salida = [];
  try {
    var periodos = leerPeriodos();
    Object.keys(periodos).forEach(function (id) {
      var p = periodos[id];
      var d = parsearFechaCelda_(p.desde), h = parsearFechaCelda_(p.hasta);
      if (!d || !h) return;
      if (formatearFecha_(d) === formatearFecha_(ventana.desde) &&
          formatearFecha_(h) === formatearFecha_(ventana.hasta)) salida.push(id);
    });
  } catch (e) {
    // Sin `PERIODOS` legible no se filtra, que es el comportamiento de antes.
    return [];
  }
  return salida;
}

/**
 * ⭐ Las filas de `REUNIONES` que **`leerReuniones_` descarta por `mostrar`**, con su período.
 *
 * **Existe para un solo uso: el mensaje de «no hay filas para anclar».** `leerReuniones_` filtra
 * `esVerdadero_(mostrar)` **antes** de que el anclaje vea nada, así que una fila sin confirmar es
 * indistinguible de una que no existe — y el aviso terminaba señalando al filtro de período, que
 * era inocente.
 *
 * ⚠ **No se cachea y no se llama en el camino feliz.** Es una lectura entera de la hoja; pagarla
 * en cada corrida para un mensaje que casi nunca sale sería el gasto que `CLAUDE.md` §4 llama *un
 * costo por ítem que parece trabajo real*.
 *
 * ⚠ **Y el criterio es EL MISMO que el de `leerReuniones_`** a proposito: un diagnostico que
 * filtre distinto del filtro que explica **nombra filas que el otro si dejo pasar**, y manda a
 * arreglar algo que no esta roto. Si alla cambia, aca tambien.
 *
 * ⛔⛔ **Y alla cambio el 27/08** (`D-46`): de `fila[eje]` a `fila[texto_original]`. Este
 * comentario decia *«si alla cambia, aca tambien»* y **esta vez se cumplio** -no es una promesa
 * retorica-. El `if (!fila[idx.eje]) return;` de abajo **descartaba sin contar exactamente la fila
 * que causo el fallo del 27/08**: una linea sin interpretar, con `eje` vacio y `mostrar = 'si'`,
 * era invisible para el unico diagnostico que existia para explicarla.
 */
function reunionesOcultasPorMostrar_() {
  try {
    var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
    if (!hoja) return [];
    var datos = hoja.getDataRange().getValues();
    var headers = datos.shift();
    var idx = {};
    headers.forEach(function (h, i) { idx[h] = i; });
    if (idx.texto_original === undefined || idx.mostrar === undefined) return [];
    var out = [];
    datos.forEach(function (fila) {
      if (!fila[idx.texto_original]) return;            // sin texto_original no es una fila de temario
      if (esVerdadero_(fila[idx.mostrar])) return;      // confirmada: no es de las ocultas
      if (idx.tipo !== undefined && String(fila[idx.tipo]).trim() === 'Agregado') return;
      out.push({
        nombre: String(fila[idx.nombre] || '(sin nombre)'),
        periodo_id: String(idx.periodo_id !== undefined ? fila[idx.periodo_id] : '') || '(sin período)',
        /* El valor CRUDO de `mostrar`, sin normalizar: si alguien escribió `x` o `1`, eso es un
         * hallazgo sobre la convención y tiene que verse. Un instrumento que lava su entrada no
         * puede diagnosticar problemas de entrada. */
        mostrar_crudo: JSON.stringify(fila[idx.mostrar])
      });
    });
    return out;
  } catch (e) {
    /* Un instrumento no puede voltear lo que mide: sin la hoja, el mensaje sale sin este dato en
     * vez de reemplazar un fallo de anclaje por una excepción. */
    return [];
  }
}

/**
 * ⛔⛔ `2026-08-27_2` Parte D.3 - **el filtro NUEVO tambien se cuenta.**
 *
 * `D-46` cambio el criterio de `leerReuniones_` de `eje` a `texto_original`, y un filtro que
 * descarta y **no cuenta** es invisible: el que si cuenta se lleva la culpa. Es **la tercera vez
 * en dos semanas** que la misma figura cuesta una vuelta -el 25/08 el aviso decia *«descartadas
 * por periodo: 6»* cuando las cuatro de julio se habian ido antes por `mostrar`-. **Un filtro
 * nuevo nace contandose.**
 *
 * ⚠ **Y habla tambien cuando NO encuentra nada.** *«Ninguna quedo afuera sin `texto_original`»*
 * descarta una causa; una lista vacia no descarta nada, solo se calla. Es la misma forma que el
 * control positivo.
 *
 * ⚠ **No se cachea y no corre en el camino feliz**, igual que `reunionesOcultasPorMostrar_`: es
 * una lectura entera de la hoja para un mensaje que casi nunca sale.
 */
function reunionesSinTextoOriginal_() {
  try {
    var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REUNIONES');
    if (!hoja) return [];
    var datos = hoja.getDataRange().getValues();
    var headers = datos.shift();
    var idx = {};
    headers.forEach(function (h, i) { idx[h] = i; });
    if (idx.texto_original === undefined) return [];
    var out = [];
    datos.forEach(function (fila, i) {
      /* ⚠ Una fila **enteramente** vacia no es un descarte: es el final de la hoja. Contarla
       * inflaria el numero con filas que nadie escribio. */
      var vacia = headers.every(function (h, k) {
        return String(fila[k] == null ? '' : fila[k]).trim() === '';
      });
      if (vacia) return;
      if (String(fila[idx.texto_original] || '').trim()) return;
      out.push({
        fila: i + 2,
        nombre: String(idx.nombre !== undefined ? fila[idx.nombre] : '') || '(sin nombre)',
        periodo_id: String(idx.periodo_id !== undefined ? fila[idx.periodo_id] : '') || '(sin periodo)',
        mostrar_crudo: JSON.stringify(idx.mostrar !== undefined ? fila[idx.mostrar] : '')
      });
    });
    return out;
  } catch (e) {
    return [];
  }
}
function anclarEncuentrosSinCache_(ventana) {
  var precondicion = verificarPrecondicionAnclaje_();
  if (!precondicion.ok) return { ok: false, motivo: precondicion.motivo };

  var reuniones = leerReuniones_().filter(function (r) { return r.tipo !== 'Agregado'; });

  /* `_31.1` B.4 — **el temario se recorta por `periodo_id`.**
   *
   * Hasta hoy `leerReuniones_` filtraba por `eje` y `mostrar` y nada más, así que toda fila con
   * `mostrar = sí` entraba a **todo** informe y a toda semana (`R-21`: *"es una omisión, no un
   * diseño"*). Con dos temarios cargados eso emitiría los doce encuentros en las dos corridas.
   *
   * **El período sale del `origen` de la ventana y no de un parámetro nuevo.** `resolverVentana`
   * ya devuelve `periodo_ref:<id>` cuando la corrida trae override, y esa ventana viaja hasta acá:
   * agregar un `periodoId` a cuatro firmas para transportar un dato que ya está sería duplicarlo.
   *
   * ⚠ **Sin override no se filtra**, y eso se dice en el retorno. Es deliberado: la cadena de
   * `D-20` puede terminar en `CONFIG`, que no tiene `periodo_id`, y filtrar por un período
   * adivinado a partir del rango sería exactamente la "semana adivinada" que `R-21` prohíbe.
   * Emitir de más y avisar es recuperable; emitir cero en silencio, no.
   */
  var PREFIJO_PERIODO_REF_ = 'periodo_ref:';
  var origen = String((ventana && ventana.origen) || '');

  /* ⭐ `2026-08-22_25` Parte B — **el recorte se EXTIENDE a la ventana calculada. No se agrega un
   * segundo filtro: se le ensancha el disparador al que ya estaba.**
   *
   * ⛔ **El hueco, que es el nivel 1 de `R-21` sin implementar.** El párrafo de arriba dice *"sin
   * override no se filtra"* y lo justificaba con que la cadena de `D-20` puede terminar en `CONFIG`
   * y **filtrar por un período adivinado a partir del rango sería la «semana adivinada» que `R-21`
   * prohíbe**. El razonamiento sigue siendo bueno; lo que estaba mal es la conclusión, porque
   * **preguntarle a `PERIODOS` cuáles de sus filas describen esta ventana no es adivinar: es
   * leer.** Medido el 21/08: sin override entran **12 encuentros en vez de 2**, con junio y julio
   * adentro, y el deck sale sin que nada falle.
   *
   * ⭐ **Se resuelve como CONJUNTO y no como uno solo, y eso no es prolijidad.** Hay dos filas de
   * `PERIODOS` con la ventana `2026-08-14 → 2026-08-20` —`agosto_14_20` y
   * `'vie 14/08 -- jue 20/08 (por defecto)'`, la fila 9 anotada como P1—. Elegir "la primera" sería
   * adivinar, y elegir la equivocada **deja el informe sin ningún encuentro**. Con el conjunto no
   * hay nada que elegir: **una reunión entra si su `periodo_id` es cualquiera de los que describen
   * esta ventana**, y la fila que ninguna reunión tenga cargada simplemente no aporta a nadie.
   *
   * ⚠ **Y si NINGUNA fila describe la ventana, no se filtra** — que es el comportamiento de antes y
   * sigue siendo el correcto: ahí sí no hay período que leer, y `avisosDeVentanaPropuesta_` ya lo
   * dice en el panel antes de generar. **Emitir de más y avisar es recuperable; emitir cero en
   * silencio, no.** */
  var periodosDeLaVentana = origen.indexOf(PREFIJO_PERIODO_REF_) === 0
    ? [origen.slice(PREFIJO_PERIODO_REF_.length)]
    : periodosQueDescribenLaVentana_(ventana);

  var excluidasPorPeriodo = [];
  if (periodosDeLaVentana.length) {
    reuniones = reuniones.filter(function (r) {
      var suyo = String(r.periodo_id || '').trim();
      if (suyo && periodosDeLaVentana.indexOf(suyo) !== -1) return true;
      // `D-19` — una fila sin período no se asigna a la semana vigente: se lista.
      excluidasPorPeriodo.push({
        item: r.nombre + (r.etapa ? ' (' + r.etapa + ')' : ''),
        motivo: 'periodo_id ' + (suyo ? '"' + suyo + '"' : 'vacío') + ' no está en [' +
          periodosDeLaVentana.join(', ') + '] (D-19)'
      });
      return false;
    });
  }

  // Se conserva el nombre `periodoDeLaVentana` para los consumidores del retorno —`itemsDeSeccion_`
  // y `diagEnlaceDigitalDeEncuentros_`—, que lo imprimen. `''` sigue significando **no se filtró**.
  var periodoDeLaVentana = periodosDeLaVentana.join(', ');

  if (!reuniones.length) {
    /* ⛔⛔ `2026-08-25` — **el mensaje contaba el filtro de PERÍODO y callaba el de `mostrar`, que
     * corre ANTES.** Costó una vuelta entera de diagnóstico.
     *
     * **El caso:** las cuatro filas de `julio_24_30` tenían `mostrar` vacío, así que
     * `leerReuniones_` —que filtra `esVerdadero_(mostrar)` **antes de que este código las vea**—
     * las descartó. Las **6** que este mensaje reportaba *«descartadas por período»* eran de junio
     * y agosto. ⇒ El aviso decía la verdad y **mandaba a mirar el período, que estaba bien**.
     *
     * ⭐ **Un filtro que descarta antes y no cuenta es invisible**, y el que sí cuenta se lleva la
     * culpa. Es la familia del glifo que miente sobre la causa: el número era correcto y señalaba
     * al lugar equivocado.
     *
     * ⚠ **La cuenta se hace SÓLO acá, en el camino del fallo**, y por eso no cuesta nada cuando
     * todo anda: es una segunda lectura de la hoja que sólo ocurre cuando ya no hay nada que
     * anclar. */
    var ocultas = reunionesOcultasPorMostrar_();
    /* ⛔ `D-46` - el filtro nuevo nace contandose. Ver `reunionesSinTextoOriginal_`. */
    var sinTexto = reunionesSinTextoOriginal_();
    return {
      ok: false,
      motivo: 'REUNIONES no tiene filas para anclar' +
        (periodoDeLaVentana ? ' en el período "' + periodoDeLaVentana + '"' : ' (mostrar=sí)') +
        ' — excluidas las de tipo Agregado. Descartadas por período: ' + excluidasPorPeriodo.length +
        /* ⭐ El dato que faltaba, y va con los nombres: un conteo sin nombres obliga a abrir la
         * hoja, que es lo que este mensaje existe para evitar. */
        (ocultas.length
          ? ' · ⛔ Y ANTES DE ESO, ' + ocultas.length + ' fila(s) quedaron afuera por `mostrar` ' +
            'vacío o distinto de sí — se filtran en `leerReuniones_` y NUNCA llegan al filtro de ' +
            'período, así que el conteo de arriba no las incluye: ' +
            ocultas.slice(0, 6).map(function (o) {
              return o.nombre + ' [' + o.periodo_id + ']';
            }).join(' · ') + (ocultas.length > 6 ? ' …' : '') +
            '. ⚠ Si alguna es del período que buscás, ÉSA es la causa y el período no tiene nada ' +
            'que ver. `R-02`: el temario propone y la persona confirma poniendo `sí`.'
          : ' · ⭐ y NINGUNA quedó afuera por `mostrar`.') +
        /* ⛔ `D-46` - el otro filtro, con la misma forma: conteo, nombres hasta seis, y una
         * frase para el caso en que NO haya ninguna. Sin la segunda mitad, *«no hay»* y *«no
         * mire»* se ven igual. */
        (sinTexto.length
          ? ' · ⛔ Y ' + sinTexto.length + ' fila(s) quedaron afuera por no tener ' +
            '`texto_original` — se filtran en `leerReuniones_` (`D-46`) y tampoco llegan al ' +
            'filtro de período: ' +
            sinTexto.slice(0, 6).map(function (o) {
              return 'fila ' + o.fila + ' "' + o.nombre + '" [' + o.periodo_id + ']';
            }).join(' · ') + (sinTexto.length > 6 ? ' …' : '') +
            '. ⚠ Una fila de temario SIEMPRE tiene `texto_original`: si aparece alguna acá, la ' +
            'escribió algo que no es el cargador.'
          : ' · ⭐ y NINGUNA por falta de `texto_original`, así que el problema es el período.')
    };
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
  /* ⭐⭐ `2026-08-27` Parte 0-bis — las cuentas que este anclaje resolvió y **hay que dejar
   * escritas** en `REUNIONES.id_cuenta`. Se juntan acá y se escriben **una sola vez** después del
   * bucle: una llamada por reunión sería una lectura y una escritura de la hoja por vuelta, dentro
   * de la etapa que el presupuesto ya aprieta. */
  var aDeclarar = [];

  Logger.log('anclarEncuentros: arranca — ' + reuniones.length + ' reunión(es), ' + candidatosTodos.length +
    ' cuenta(s) digital · umbral=' + umbral + ' · ' + new Date());

  reuniones.forEach(function (reunion, i) {
    var fecha = (reunion.fecha instanceof Date) ? reunion.fecha : parsearFechaCelda_(reunion.fecha);
    /* ⭐ La clave sale de `nombreBuscadoDeReunion_`, que es el único lugar donde vive la fórmula.
     * Ver su encabezado: estaba copiada en tres sitios y el paso 3 habría sido el cuarto. */
    var nombreBuscado = nombreBuscadoDeReunion_(reunion);

    /* ⭐ `2026-08-21_8` — **`tipo` viaja con el ítem, y sin eso ningún filtro por tipo funciona.**
     *
     * `leerReuniones_` devuelve la fila entera de `REUNIONES` —`tipo` incluido— pero este objeto
     * la recortaba a seis campos, así que **`tipo` se perdía justo acá**, entre la hoja y el
     * generador. `filtrarItemsPorSeccion_` lee los atributos con `e[campo]` sobre este mismo
     * objeto: un `SECCIONES.filtro = tipo=Uno a uno` leía `undefined` y **no matcheaba ninguna
     * fila, sin fallar** — el modo de falla de siempre, una sección que emite de menos en
     * silencio.
     *
     * Es la misma familia que `CLAUDE.md` §2 describe al revés: allá una columna nueva llega al
     * seed y no a todos los lectores; acá la columna existe hace meses en la hoja y **no llega al
     * consumidor**. El síntoma es idéntico: un `undefined` que nadie ve.
     *
     * ⚠ **Se agrega `tipo` y nada más.** Copiar la fila entera al ítem sería más simple y es
     * peor: `asignaciones` viaja a `PropertiesService` en la corrida desatendida
     * (`2026-08-20_10`), y engordar el ítem con diez columnas que nadie pidió agranda un estado
     * que tiene tope de tamaño. Lo que se necesita se declara. */
    /* ⭐ `2026-08-27_1` — **`nombreBuscado` viaja con el ítem, y sin eso el paso 3 no puede
     * escribir la decisión.** Es la clave con la que `panel_confirmarAnclaje` encuentra la fila de
     * `ANCLAJE_PENDIENTE`; ya se calculaba acá y **se descartaba**, así que la pantalla habría
     * tenido que recalcularla — la cuarta copia de la fórmula.
     *
     * ⚠ Es **una cadena corta por ítem**. El comentario de abajo pide no engordar este objeto
     * porque viaja a `PropertiesService` en la corrida desatendida, y el criterio es el mismo que
     * él declara: *lo que se necesita se declara*. */
    var item = { reunion: reunion.nombre, tipo: reunion.tipo, fecha: reunion.fecha, etapa: reunion.etapa, idCuenta: '', score: 0, registroDigital: null, candidatoNombre: '', nombreBuscado: nombreBuscado };
    var confirmado = anclajeYaConfirmado_(indicePendiente, 'reunion', nombreBuscado);

    /* ⭐⭐ `2026-08-27` Parte 0-bis — **la cuenta DECLARADA en la fila del encuentro gana sobre
     * cualquier deducción.** Es el régimen que `CAMPANAS` ya tiene: ahí la cuenta se lee de la
     * hoja y no hay anclaje que correr.
     *
     * ⭐ **Y lo que esto arregla no es sólo trazabilidad:** hasta hoy la cuenta se **volvía a
     * deducir en cada corrida**, así que dos corridas de la misma semana podían anclar distinto
     * porque `digital` se movió en el medio (`R-31`) **y nada lo mostraría**. Con la cuenta
     * declarada, la corrida es reproducible.
     *
     * ⚠ **Vacío significa «deducila», que es el comportamiento de siempre.** La columna nace vacía
     * en las 11 filas vivas, así que esto no cambia ni un número hasta que una celda tenga valor.
     *
     * ⚠ **Y el riesgo, escrito porque es real y ya ocurrió:** una cuenta mal anclada que se
     * escribe queda **congelada** — es el caso `3347` del 04/08, once números plausibles de la
     * cuenta equivocada. Lo que cambia es que ahora está **en una celda que se ve y se corrige**,
     * en vez de estar mal y ser invisible. */
    var declarada = normalizarIdCuenta_(reunion.id_cuenta || '');
    if (declarada && confirmado && normalizarIdCuenta_(confirmado) !== declarada) {
      /* Dos declaraciones que no coinciden **no se resuelven en silencio**. Gana la de
       * `REUNIONES` —es la fila del encuentro—, la otra queda intacta y el conflicto se dice. */
      Logger.log('⚠ anclarEncuentros: "' + nombreBuscado + '" tiene cuenta declarada en REUNIONES (' +
        declarada + ') y otra distinta confirmada en ANCLAJE_PENDIENTE (' + confirmado + '). Gana la ' +
        'de REUNIONES; la de ANCLAJE_PENDIENTE queda sin tocar y hay que resolverla a mano.');
    }

    var filaRdv = encontrarFilaRdvDeReunion_(reunion);

    /* `_28` (11/08/2026) — **la fila de `rdv` de ESTE encuentro viaja con el ítem.**
     *
     * Ya se buscaba acá, para puntuar el anclaje, y se descartaba: sólo sobrevivían `evento` y
     * `barrio` como variables locales del score. Sin ella, un marcador de `rdv` emitido dentro
     * de una lámina de encuentro **no tiene forma de saber de qué encuentro es** y cae a la
     * lectura por ventana, que es el agregado de la semana. Medido el 11/08: los seis `ecv_*`
     * publicaban `1169` de Mail y `272` de Call Center **en las cinco láminas**, y 45 de 64
     * marcadores daban idéntico en las tres cuentas ancladas.
     *
     * Es la contraparte exacta de lo que `digital` ya tenía con `filasDigitalDeEncuentro`: la
     * iteración expandía la lámina y cambiaba el `id_cuenta`, pero `id_cuenta` es un concepto
     * de `digital` y `rdv` no lo mira. Cada base necesita su propia llave del ítem.
     *
     * Se guarda **antes** del reparto en `encuentros`/`sinLink`/`bajaConfianza` para que la
     * tenga cualquier ítem que llegue a emitirse: un encuentro sin cuenta digital anclada sigue
     * saliendo en el deck (`R-02`) y sus números de `rdv` son igual de suyos.
     */
    if (filaRdv.ok) {
      item.filaRdv = filaRdv.fila;
      item.hojaRdv = filaRdv.hoja;
    }

    if (!filaRdv.ok) {
      item.motivo = filaRdv.motivo;
      sinLink.push(item);
    } else if (declarada) {
      /* Va **antes** que `confirmado` a propósito: las dos son declaraciones de una persona, y la
       * de la fila del encuentro es la que manda. Se resuelve el candidato para poder nombrarlo en
       * el reporte, pero **la cuenta es la declarada aunque no aparezca entre los candidatos**. */
      var candidatoDeclarado = candidatosTodos.filter(function (c) { return c.idCuenta === declarada; })[0];
      item.idCuenta = declarada;
      item.registroDigital = candidatoDeclarado ? candidatoDeclarado.registro : null;
      item.candidatoNombre = candidatoDeclarado ? candidatoDeclarado.nombreCampana : '';
      item.score = 1;
      item.declaradaEnHoja = true;
      /* ⚠ **Una cuenta declarada que no existe en la ventana no se corrige ni se ignora: se
       * dice.** Sin este aviso, el encuentro entra, sus marcadores de digital salen «FALTA» y el
       * motivo —*«la cuenta que alguien escribió no está»*— no aparece en ningún lado. */
      if (!candidatoDeclarado) {
        Logger.log('⚠ anclarEncuentros: "' + nombreBuscado + '" declara la cuenta ' + declarada +
          ' en REUNIONES.id_cuenta y esa cuenta NO está entre las ' + candidatosTodos.length +
          ' de digital en esta ventana. El encuentro entra igual; sus marcadores de digital van a ' +
          'salir «FALTA». Revisá la celda o la ventana.');
      }
      encuentros.push(item);
    } else if (confirmado) {
      var candidatoConfirmado = candidatosTodos.filter(function (c) { return c.idCuenta === confirmado || c.nombreCampana === confirmado; })[0];
      item.idCuenta = candidatoConfirmado ? candidatoConfirmado.idCuenta : confirmado;
      item.registroDigital = candidatoConfirmado ? candidatoConfirmado.registro : null;
      item.candidatoNombre = confirmado;
      item.score = 1;
      item.confirmadoAMano = true;
      encuentros.push(item);
    } else {
      var campoEvento = buscarMapeo('rdv', filaRdv.hoja, 'evento');
      var campoBarrio = buscarMapeo('rdv', filaRdv.hoja, 'barrio');
      var evento = campoEvento.ok ? valorPorColumna_(filaRdv.fila, 'rdv', filaRdv.hoja, campoEvento.columna) : '';
      var barrio = campoBarrio.ok ? valorPorColumna_(filaRdv.fila, 'rdv', filaRdv.hoja, campoBarrio.columna) : '';

      var resultado = anclarEnDosPasos_(candidatosTodos, fecha, umbral,
        function (c) { return scoreMatchDigitalRdv_(c, evento, barrio, fecha); });
      // Qué paso resolvió y con cuántos candidatos: sin esto el cambio es invisible, y el conteo
      // de cuántos encuentros necesitaron el paso 2 es lo único que dice si el recorte está bien
      // calibrado — si casi todos amplían, no sirve de nada; si no amplía ninguno, sospechar que
      // no se aplicó.
      item.paso_anclaje = resultado.paso;
      item.candidatos_anclaje = (resultado.paso === 2 ? resultado.candidatos_paso2 : resultado.candidatos_paso1);

      item.idCuenta = resultado.mejor ? resultado.mejor.idCuenta : '';
      item.score = resultado.score;
      item.registroDigital = resultado.mejor ? resultado.mejor.registro : null;
      item.candidatoNombre = resultado.mejor ? resultado.mejor.nombreCampana : '';
      // La traza dice **qué cuenta se eligió y por qué**: sin esto, el próximo homónimo se
      // detecta como se detectó éste — a mano, contra un informe publicado.
      if (resultado.traza_desempate) item.traza_desempate = resultado.traza_desempate;

      if (resultado.ambiguo) {
        // Homónimos que el desempate no puede separar: **no se elige ninguna**. El ítem
        // entra igual (la reunión existe en el temario, `R-02`) y sus números salen
        // `«FALTA»` con motivo, en vez de un número plausible de la cuenta equivocada.
        item.motivoAmbiguo = '«FALTA:@homonimo_sin_desempate» — ' + resultado.traza_desempate;
        sinLink.push(item);
      } else if (!resultado.mejor || resultado.score <= 0) {
        sinLink.push(item);
      } else if (!resultado.pasaUmbral) {
        item.pendiente = true;
        bajaConfianza.push(item);
        registrarAnclajePendiente_(hojaPendiente, indicePendiente, 'reunion', nombreBuscado, resultado.top3);
      } else {
        /* ⭐⭐ `2026-08-27` Parte 0-bis — **el anclaje que acierta deja rastro.** Hasta hoy éste era
         * el único de los tres repartos que no escribía nada en ninguna hoja.
         *
         * ⛔ **Sólo se escribe acá, y la frontera importa:** los de `bajaConfianza` **no** se
         * escriben. Declarar una cuenta que el propio motor considera dudosa convertiría una duda
         * en un hecho, y sería la peor versión de esto — un número plausible congelado. Ésos
         * siguen yendo a `ANCLAJE_PENDIENTE`, que es donde una persona los resuelve.
         *
         * ⚠ La clave es `texto_original` porque es la que usa `curarCamposReuniones_`, y es la
         * única que **toda** fila de temario tiene por construcción (`D-46`). Sin ella no hay
         * dónde escribir, y eso no es un error: es una fila que no vino del asistente. */
        if (!declarada && reunion.texto_original) {
          aDeclarar.push({ texto_original: String(reunion.texto_original), id_cuenta: item.idCuenta });
        }
        encuentros.push(item);
      }
    }

    Logger.log('anclarEncuentros: ' + (i + 1) + '/' + reuniones.length + ' — "' + reunion.nombre + '" → ' +
      (item.idCuenta ? item.idCuenta + ' (score ' + item.score.toFixed(2) + ')' : 'sin link') + ' · ' + new Date());
    SpreadsheetApp.flush();
  });

  /* ⭐ La escritura va **fuera del bucle y una sola vez**: `curarCamposReuniones_` lee la hoja
   * entera para armar su índice, así que llamarla por reunión sería esa lectura por vuelta. */
  var declaradas = escribirCuentasAncladas_(aDeclarar);

  var salida = {
    ok: true, encuentros: encuentros, sinLink: sinLink, bajaConfianza: bajaConfianza, umbral: umbral,
    // `2026-08-27` Parte 0-bis — cuántas cuentas quedaron escritas en `REUNIONES.id_cuenta`.
    declaradas: declaradas,
    // `_31.1` B.4 — quién quedó afuera por período, y con qué período se filtró. `''` significa
    // **no se filtró**, y el consumidor tiene que poder decirlo en el reporte.
    periodo_id: periodoDeLaVentana,
    excluidas_por_periodo: excluidasPorPeriodo
  };

  /* ⭐ `2026-08-23_1` Parte D — **la medición se escribe acá y no en `anclarEncuentros`.**
   *
   * Esta función es la que **de verdad ancla**; la de afuera puede devolver el caché y entonces no
   * midió nada. Escribir desde allá produciría una fila por cada consumidor —`itemsDeSeccion_` la
   * llama una vez por sección— y el conteo pasaría a decir cuántas veces se preguntó, no cuántos
   * encuentros se intentaron. Es la misma familia que *«contar la unidad correcta es parte de la
   * guarda»* de `CLAUDE.md` §4.
   *
   * ⚠ **El resultado del instrumento viaja en la salida**, en vez de descartarse: si la medición
   * falló, nada de lo que se lea después en `ANCLAJE_MEDICION` se puede tomar como completo, y una
   * hoja incompleta que nadie sabe que lo está es peor que ninguna hoja. */
  salida.medicion = registrarMedicionAnclaje_(salida, ventana);
  return salida;
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
 * Corrida nocturna 04/08 — el mismo diagnóstico que `menuProbarUnionYAnclaje_`, pero
 * devuelto como objeto chico en vez de como `alert`. Por qué existe: el ítem de menú
 * arma su reporte con los encuentros enteros adentro y **la respuesta no vuelve por
 * `/dev`** (el modo de falla ya medido el 03/08: una respuesta grande se disfraza de
 * token vencido). Acá viajan conteos y nombres, nunca los registros unidos.
 */
function resumenAnclaje_(ventana) {
  var ventanaResuelta = ventana || resolverVentana({});
  if (!ventanaResuelta.ok) return { ok: false, motivo: ventanaResuelta.motivo };

  var anclaje = anclarEncuentros(ventanaResuelta);
  if (!anclaje.ok) return { ok: false, motivo: anclaje.motivo };

  return {
    ok: true,
    ventana: formatearFecha_(ventanaResuelta.desde) + ' → ' + formatearFecha_(ventanaResuelta.hasta) +
      ' (' + ventanaResuelta.origen + ')',
    umbral: anclaje.umbral,
    anclados: anclaje.encuentros.length,
    sin_link: anclaje.sinLink.length,
    baja_confianza: anclaje.bajaConfianza.length,
    cuentas: anclaje.encuentros.map(function (e) {
      return e.reunion + ' → ' + e.idCuenta + ' (' + Number(e.score).toFixed(2) + ')';
    }),
    sin_link_detalle: anclaje.sinLink.map(function (e) { return e.reunion + ' — ' + (e.motivo || 'sin motivo'); })
  };
}

/**
 * Ítem de menú "Probar unión y anclaje" (submenú Configuración, al lado de
 * "Probar lectura por ventana"). Corre Parte A y B sobre el período de CONFIG
 * y muestra el diagnóstico — no persiste nada, es solo lectura.
 */
function menuProbarUnionYAnclaje_() {
  var ui = ui_();
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
      lineas.push('  ' + solapa + ' (maestra): ' + d.filas_leidas + ' filas leídas, ' +
        d.filas_con_id + ' con id, ' + d.cuentas + ' cuentas distintas');
      // `N4` — la pisada se nombra sólo cuando existe, y se dice qué significa: un `0` acá no
      // merece renglón, pero un número distinto de cero es trabajo perdido que no se veía.
      if (d.filas_pisadas > 0) {
        lineas.push('    ⚠ ' + d.filas_pisadas + ' fila(s) de maestra pisadas por id repetido — ' +
          'sobrevive la última leída, las demás se descartan sin quedar en el diagnóstico');
      }
    } else {
      lineas.push(
        '  ' + solapa + ': ' + d.filas_leidas + ' filas, ' + d.cuentas_matcheadas + ' matcheadas, ' +
        d.cuentas_sin_este_canal.length + ' cuentas sin este canal'
      );
      // `N5` — las huérfanas con su peso: filas **e** ids, más los cinco mayores. El porcentaje
      // va al lado porque "631 huérfanas" no dice nada y "29 % del canal" sí.
      if (d.huerfanas_filas > 0) {
        var pct = d.filas_leidas ? Math.round(1000 * d.huerfanas_filas / d.filas_leidas) / 10 : 0;
        lineas.push('    ⚠ ' + d.huerfanas_filas + ' fila(s) descartadas (' + pct + ' % del canal) ' +
          'en ' + d.huerfanas_ids + ' id(s) que no están en la maestra');
        lineas.push('      mayores: ' + d.huerfanas_mayores.map(function (h) {
          return h.id_cuenta + ' ×' + h.filas;
        }).join(', '));
      }
    }
  });

  lineas.push('', 'Anclaje (Paso 2.9F — sobre REUNIONES, no sobre un recorte por fecha de rdv):');

  var anclaje = anclarEncuentros(ventana);
  if (!anclaje.ok) {
    lineas.push('  ⚠ ' + anclaje.motivo);
  } else {
    /* ⭐ `2026-08-23_1` Parte D — **el denominador primero.** Los tres conteos de abajo no dicen
     * nada sin él: «0 sin link» sobre 6 intentos es un resultado, y sobre 0 intentos es que no se
     * midió nada. Un control que no declara cuánto midió contamina toda conclusión que se apoye
     * en él (`CLAUDE.md` §4). */
    var intentadosAnclaje = anclaje.encuentros.length + anclaje.sinLink.length + anclaje.bajaConfianza.length;
    lineas.push('  Encuentros que se intentaron anclar: ' + intentadosAnclaje +
      (intentadosAnclaje === 0 ? '  ⚠ CERO — los conteos de abajo no dicen nada' : ''));
    lineas.push('  Umbral (CONFIG.umbral_anclaje_reunion): ' + anclaje.umbral);
    lineas.push('  Reuniones linkeadas: ' + anclaje.encuentros.length);
    lineas.push('  Sin candidato/sin fila en rdv (sinLink): ' + anclaje.sinLink.length);
    lineas.push('  Baja confianza (en ANCLAJE_PENDIENTE): ' + anclaje.bajaConfianza.length);

    /* ⭐ Los `sinLink` CON NOMBRE. Hasta hoy sólo se contaban, y un conteo sin nombres dice que
     * hubo un problema sin decir cuál — para ir a mirar la fila de `rdv` hace falta el nombre.
     * Van con su motivo, tal cual lo dejó el anclaje y sin limpiar. */
    if (anclaje.sinLink.length) {
      lineas.push('', '  Sin link — quiénes, y por qué:');
      anclaje.sinLink.slice(0, 15).forEach(function (item) {
        lineas.push('    · ' + item.reunion + (item.etapa ? ' (' + item.etapa + ')' : '') +
          ' — ' + (item.motivo || item.motivoAmbiguo || 'sin motivo'));
      });
      if (anclaje.sinLink.length > 15) lineas.push('    · … y ' + (anclaje.sinLink.length - 15) + ' más');
    }

    // ⚠ Si el instrumento falló, se dice: una hoja de mediciones incompleta que nadie sabe que
    // lo está es peor que ninguna hoja.
    if (anclaje.medicion && anclaje.medicion.ok === false) {
      lineas.push('  ⚠ la medición NO se pudo escribir en ANCLAJE_MEDICION: ' + anclaje.medicion.motivo);
    }

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
