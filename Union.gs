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
  var nombreBuscado = normalizar_(reunion.nombre);
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
var HEADERS_ANCLAJE_PENDIENTE_ = ['tipo', 'nombre_buscado', 'candidato_1', 'puntaje_1', 'candidato_2', 'puntaje_2', 'candidato_3', 'puntaje_3', 'elegido'];

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
  cacheAnclaje_[claveCache] = resultado;
  return resultado;
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
  var periodoDeLaVentana = origen.indexOf(PREFIJO_PERIODO_REF_) === 0
    ? origen.slice(PREFIJO_PERIODO_REF_.length) : '';

  var excluidasPorPeriodo = [];
  if (periodoDeLaVentana) {
    reuniones = reuniones.filter(function (r) {
      var suyo = String(r.periodo_id || '').trim();
      if (suyo === periodoDeLaVentana) return true;
      // `D-19` — una fila sin período no se asigna a la semana vigente: se lista.
      excluidasPorPeriodo.push({
        item: r.nombre + (r.etapa ? ' (' + r.etapa + ')' : ''),
        motivo: 'periodo_id ' + (suyo ? '"' + suyo + '"' : 'vacío') + ' ≠ "' + periodoDeLaVentana + '" (D-19)'
      });
      return false;
    });
  }

  if (!reuniones.length) {
    return {
      ok: false,
      motivo: 'REUNIONES no tiene filas para anclar' +
        (periodoDeLaVentana ? ' en el período "' + periodoDeLaVentana + '"' : ' (mostrar=sí)') +
        ' — excluidas las de tipo Agregado. Descartadas por período: ' + excluidasPorPeriodo.length
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

  Logger.log('anclarEncuentros: arranca — ' + reuniones.length + ' reunión(es), ' + candidatosTodos.length +
    ' cuenta(s) digital · umbral=' + umbral + ' · ' + new Date());

  reuniones.forEach(function (reunion, i) {
    var fecha = (reunion.fecha instanceof Date) ? reunion.fecha : parsearFechaCelda_(reunion.fecha);
    var nombreBuscado = normalizar_(reunion.nombre) + '|' +
      (fecha ? Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd') : 'sin_fecha') +
      '|' + (reunion.etapa || '');

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
    var item = { reunion: reunion.nombre, tipo: reunion.tipo, fecha: reunion.fecha, etapa: reunion.etapa, idCuenta: '', score: 0, registroDigital: null, candidatoNombre: '' };
    var confirmado = anclajeYaConfirmado_(indicePendiente, 'reunion', nombreBuscado);
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
        encuentros.push(item);
      }
    }

    Logger.log('anclarEncuentros: ' + (i + 1) + '/' + reuniones.length + ' — "' + reunion.nombre + '" → ' +
      (item.idCuenta ? item.idCuenta + ' (score ' + item.score.toFixed(2) + ')' : 'sin link') + ' · ' + new Date());
    SpreadsheetApp.flush();
  });

  return {
    ok: true, encuentros: encuentros, sinLink: sinLink, bajaConfianza: bajaConfianza, umbral: umbral,
    // `_31.1` B.4 — quién quedó afuera por período, y con qué período se filtró. `''` significa
    // **no se filtró**, y el consumidor tiene que poder decirlo en el reporte.
    periodo_id: periodoDeLaVentana,
    excluidas_por_periodo: excluidasPorPeriodo
  };
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
    lineas.push('  Umbral (CONFIG.umbral_anclaje_reunion): ' + anclaje.umbral);
    lineas.push('  Reuniones linkeadas: ' + anclaje.encuentros.length);
    lineas.push('  Sin candidato/sin fila en rdv (sinLink): ' + anclaje.sinLink.length);
    lineas.push('  Baja confianza (en ANCLAJE_PENDIENTE): ' + anclaje.bajaConfianza.length);

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
