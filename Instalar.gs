/**
 * Instalar.gs — Setup inicial.
 * Crea las hojas de configuración por registros (CONFIG, BASES, INFORMES,
 * MARCADORES, MAPEO, CAMPANAS, PERIODOS, ...) con encabezados solamente — ninguna
 * fila de datos (Paso 2.11 Parte A: `HOJAS_CONFIG_` es esquema, no siembra) — y deja
 * el menú instalado.
 * Idempotente: si una hoja ya existe, no la pisa. Para MARCADORES/CAMPANAS,
 * si ya existen con el esquema viejo, inserta las columnas nuevas
 * (periodo_ref / desde / hasta) en su posición sin tocar filas cargadas.
 * También expone seedConfiguracion(): carga (upsert) los valores reales de
 * BASES/MAPEO/CONFIG/INFORMES/PERIODOS para no cargarlos a mano; diagnosticarCarpetaPlantillas_():
 * lista sin filtrar qué hay en la carpeta de plantillas; y
 * registrarPlantillasDesdeCarpeta(): recorre esa carpeta (hasta 2 niveles de
 * subcarpetas), matchea los Slides nativos contra INFORMES y completa
 * plantilla_id, reportando .pptx sin convertir y accesos directos; y
 * diagnosticoDrive(): confirma cuenta efectiva + contenido crudo de la
 * carpeta de plantillas por ID fijo, para descartar problemas de scope/
 * autorización antes de tocar registrarPlantillasDesdeCarpeta.
 * Se completa en: Paso 0 (v2) + Paso 0.5 + Paso 1.6 + Paso 1.6 (v2) + Paso 1.7
 * + Paso 1.8-B — ver docs/Prompts/Paso-0-v2.md, docs/Prompts/Paso-0.5.md,
 * docs/Prompts/Paso-1.6.md, docs/Prompts/Paso-1.6-v2.md, docs/Prompts/Paso-1.7.md,
 * docs/Prompts/Paso-1.8-B.md, Plan Inicial/_archivo/ARQUITECTURA_registros.md y
 * Plan Inicial/_archivo/Periodos_y_campanias.md.
 */

/**
 * Paso 1.8-B — diagnóstico de scopes/autorización.
 * Ver docs/Prompts/Paso-1.8-B.md. Temporal: cuando el registro de plantillas
 * funcione de punta a punta, se puede borrar o dejar como herramienta de
 * soporte.
 */
function diagnosticoDrive() {
  Logger.log('Cuenta efectiva: ' + Session.getEffectiveUser().getEmail());

  var id = '1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi'; // carpeta_plantillas
  var carpeta = DriveApp.getFolderById(id);
  Logger.log('Carpeta: ' + carpeta.getName());

  var n = 0;
  var it = carpeta.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    n++;
    Logger.log(f.getName() + ' | ' + f.getMimeType() + ' | ' + f.getId());
  }
  Logger.log('Total archivos: ' + n);

  var c = 0;
  var itc = carpeta.getFolders();
  while (itc.hasNext()) { c++; Logger.log('Subcarpeta: ' + itc.next().getName()); }
  Logger.log('Total subcarpetas: ' + c);
}

// Paso 2.11 Parte A — `HOJAS_CONFIG_` define el ESQUEMA (los `headers`), nada más.
// Antes tenía `ejemplos`: filas que se escribían una sola vez, al crear la hoja de
// cero, y que en la práctica eran datos reales (BASES/MAPEO/MARCADORES) leídos por
// el motor — una segunda fuente de verdad además de los `SEED_*` de más abajo, y las
// dos no siempre decían lo mismo (`m2.hoja_default` llegó a estar en desacuerdo
// consigo mismo entre `ejemplos` y `SEED_BASES_`). `instalar()` ya no escribe filas
// de datos: crea la hoja vacía (headers solamente) y el sembrador correspondiente
// (`seedConfiguracion()`, `sembrarClasificacionSolapas()`, `sembrarSecciones_()`, o
// uno de los `SEED_*` nuevos de más abajo) es la única fuente de las filas.
var HOJAS_CONFIG_ = {
  CONFIG: {
    headers: ['clave', 'valor']
  },
  BASES: {
    headers: ['base_id', 'nombre', 'sheet_id', 'hoja_default', 'fila_encabezado', 'modo_periodo', 'tipo', 'activo', 'notas']
  },
  INFORMES: {
    headers: ['informe_id', 'nombre', 'plantilla_id', 'periodicidad', 'familias', 'activo', 'notas']
  },
  // solapa/operacion/valor_fijo (DOC-2 Parte A): operacion reemplaza a calculo
  // (migración idempotente en migrarCalculoAOperacion_); valor_fijo es para
  // operacion=TEXTO; solapa entra en la clave de MAPEO y, si viene vacía, la
  // regla de resolución (docs/TOKENS.md, PROYECTO.md §3) decide si se infiere
  // o se exige. Sin sembrador: ver "No sembrar las ~200 filas de MARCADORES"
  // en `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` — bloqueado por
  // la armonización de plantillas, se carga a mano hasta que eso se resuelva.
  MARCADORES: {
    headers: ['marcador', 'familia', 'informe_id', 'base_id', 'solapa', 'campo_logico', 'periodo_ref', 'operacion', 'valor_fijo', 'formato', 'notas']
  },
  // solapa (Paso 2.3.2): entra en la clave junto con base_id + campo_logico.
  // Antes de esto, dos solapas de la misma base no podían mapear el mismo
  // campo_logico sin pisarse en silencio (ver docs/Prompts/Paso-2.3.2.md).
  // `tipo_esperado` (Paso 2.7 Parte F): numero/texto/fecha, o vacío = sin declarar
  // (no se chequea). `DIAG_BASES` solo avisa ⚠ cuando el tipo real difiere del
  // declarado — antes avisaba ⚠ toda columna texto/mixto sin importar si eso era
  // lo esperado, y con 35 avisos casi todos inocentes (`figura`, `*_id_cuenta`, …)
  // la gente aprendía a ignorarlos.
  MAPEO: {
    headers: ['base_id', 'solapa', 'campo_logico', 'hoja', 'columna', 'tipo_esperado', 'notas']
  },
  // SOLAPAS (Paso 2.6): declara el uso de CADA solapa de cada base — el motor solo
  // sabía de las que aparecían en MAPEO, y el resto (backups, pivots, vistas con
  // período tipeado a mano) eran invisibles. `uso=fuente` es requisito para que
  // `buscarMapeo()` la deje leer (Config.gs); `fila_encabezado` vive acá (no en BASES)
  // porque es un atributo de la solapa, no de la base — ver docs/Prompts/Paso-2.6_registro_solapas.md
  // Parte B. `firma_encabezado` (Paso 2.11 Parte B): contenido legible de la fila que
  // `fila_encabezado` señala, lo escribe `inventariarSolapas()` (Solapas.gs) — sirve
  // para ver a simple vista si `fila_encabezado` apunta a títulos o a datos.
  // `origen` (Paso 2.7 Parte A): 'auto' (lo escribió inventariarSolapas) / 'seed'
  // (lo escribió la siembra propuesta) / 'manual' (lo tipeó una persona) — sin esto,
  // la siembra no puede distinguir un `uso=revisar` automático de uno elegido a mano,
  // y termina sin poder pisar nada (ver Solapas.gs y sembrarClasificacionSolapas()
  // abajo).
  // filas_crudas (Paso 2.10 Parte B): el valor viejo de filas_datos
  // (getLastRow()-1, cuenta relleno de fórmula como si fuera dato). Se
  // conserva al lado del filas_datos corregido porque la diferencia entre
  // ambas ES el diagnóstico — ver Solapas.gs inventariarSolapas().
  SOLAPAS: {
    headers: ['base_id', 'solapa', 'uso', 'origen', 'fila_encabezado', 'firma_encabezado', 'filas_datos', 'filas_crudas', 'notas']
  },
  // tipo (Paso 2.2) acepta: campana, uno_a_uno, tematico, primera_persona,
  // ministros, proveedor — ver Plan Inicial/PROYECTO.md §4.
  CAMPANAS: {
    headers: ['campana_id', 'nombre', 'informe_id', 'base_id', 'tipo', 'desde', 'hasta', 'mostrar', 'orden']
  },
  PERIODOS: {
    headers: ['periodo_id', 'desde', 'hasta', 'notas']
  },
  // Paso 2.9D — R-02: el temario define el universo del informe, no la fecha.
  // Curado a mano, mismo patrón que CAMPANAS.
  REUNIONES: {
    headers: ['orden', 'eje', 'tipo', 'nombre', 'fecha', 'etapa', 'mostrar', 'texto_original', 'notas']
  },
  // Paso 2.9G v2 — registro jerárquico de secciones (docs/SECCIONES.md, v2,
  // verificada contra tres informes publicados). Se siembra con `SEED_SECCIONES_` +
  // `sembrarSecciones_()` (abajo) — el árbol completo es demasiado para un ejemplo
  // de instalación.
  SECCIONES: {
    headers: ['seccion_id', 'padre', 'orden', 'nombre', 'informes', 'modo', 'itera_sobre', 'filtro', 'opcional', 'condicion', 'familia_tokens', 'estado', 'falta', 'notas']
  },
  // Paso 2.9H — la "foto" de cada token calculado. Nunca se pisa: cada corrida
  // agrega una fila, así un informe pasado se puede reproducir (punteo del
  // 30/07). Ver Valores.gs.
  VALORES: {
    headers: ['periodo', 'informe_id', 'seccion_id', 'item', 'token', 'valor', 'fecha_calculo', 'origen_valor', 'parcial']
  },
  // Paso 2.9H — un token calculado para el mismo (periodo, item) ya dio un
  // valor distinto antes: no se decide sola (recalcular calla la divergencia
  // entre informes; congelar publica un número viejo). Queda acá hasta que la
  // persona completa `decision` (reusar/actualizar).
  VALORES_DIVERGENTES: {
    headers: ['item', 'token', 'valor_anterior', 'fecha_anterior', 'valor_nuevo', 'diferencia', 'parcial', 'decision']
  }
};

// Columnas nuevas que Paso 0.5 suma sobre un esquema ya instalado. Si la hoja
// ya existe (sea del esquema viejo o nuevo), se asegura cada columna por nombre
// en su posición sin recrear la hoja ni tocar las filas ya cargadas.
var COLUMNAS_DELTA_ = {
  MARCADORES: [
    { nombre: 'periodo_ref', indice: 6 },
    // Orden importa: solapa se inserta antes de valor_fijo porque corre
    // primero en el forEach — desplaza campo_logico/periodo_ref/calculo una
    // posición, y valor_fijo asume esa posición ya corrida (ver DOC-2 Parte A).
    { nombre: 'solapa', indice: 5 },
    { nombre: 'valor_fijo', indice: 9 }
  ],
  CAMPANAS: [
    { nombre: 'desde', indice: 6 },
    { nombre: 'hasta', indice: 7 }
  ],
  BASES: [
    { nombre: 'fila_encabezado', indice: 5 },
    { nombre: 'modo_periodo', indice: 6 }
  ],
  MAPEO: [
    { nombre: 'solapa', indice: 2 },
    // Paso 2.7 Parte F: se inserta antes de `notas` (que para MAPEO instalado sin
    // este delta está en la columna 6 antes de correr esto).
    { nombre: 'tipo_esperado', indice: 6 }
  ],
  // Paso 2.7 Parte A: `origen` se inserta después de `uso` (columna 3) para una
  // hoja SOLAPAS instalada con el esquema del Paso 2.6, que todavía no la tenía.
  // Paso 2.10 Parte B: `filas_crudas` se inserta antes de `notas` — sea cual sea
  // el estado previo de la hoja, `origen` (si falta) ya corrió antes en este mismo
  // forEach y corrió `notas` a su posición final, así que el índice de acá asume
  // esquema con `origen` ya presente.
  SOLAPAS: [
    { nombre: 'origen', indice: 4 },
    { nombre: 'filas_crudas', indice: 8 }
  ]
};

function instalar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var creadas = [];
  var actualizadas = [];

  Object.keys(HOJAS_CONFIG_).forEach(function (nombre) {
    var def = HOJAS_CONFIG_[nombre];
    var hoja = ss.getSheetByName(nombre);

    if (!hoja) {
      // Paso 2.11 Parte A: solo encabezados. Las filas de datos las escribe el
      // sembrador de esa hoja (seedConfiguracion(), sembrarClasificacionSolapas(),
      // sembrarSecciones_(), o uno de los SEED_* de más abajo) — no HOJAS_CONFIG_.
      hoja = ss.insertSheet(nombre);
      hoja.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
      hoja.setFrozenRows(1);
      creadas.push(nombre);
      return;
    }

    var delta = COLUMNAS_DELTA_[nombre];
    if (delta) {
      // Hoja preexistente con posible esquema viejo: solo insertar las
      // columnas que falten, sin pisar encabezados ni filas ya cargadas.
      var agregoColumna = false;
      delta.forEach(function (columna) {
        if (asegurarColumna_(hoja, columna.nombre, columna.indice)) {
          agregoColumna = true;
        }
      });
      if (agregoColumna) actualizadas.push(nombre);
    } else {
      hoja.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
      actualizadas.push(nombre);
    }
  });

  var hojaMapeo = ss.getSheetByName('MAPEO');
  var backfill = hojaMapeo ? backfillSolapaMapeo_(hojaMapeo) : { rellenadas: 0, sinHoja: [] };
  var eliminadasAlcance = hojaMapeo ? eliminarMapeoAlcanceDigitalObsoleto_(hojaMapeo) : 0;
  var movidasLooker = hojaMapeo ? alinearMapeoLookerADinamico_(hojaMapeo) : 0;

  var hojaSolapas = ss.getSheetByName('SOLAPAS');
  var tocadasSolapasLooker = hojaSolapas ? alinearSolapasLookerADinamico_(hojaSolapas) : 0;
  var corrigioNotaControl = hojaSolapas ? corregirNotaControlAnclaje_(hojaSolapas) : false;
  var reclasificadasM2 = hojaSolapas ? reclasificarSolapasM2Invertidas_(hojaSolapas) : 0;

  var hojaBases = ss.getSheetByName('BASES');
  var alineoHojaDefaultLooker = hojaBases ? alinearBasesHojaDefaultLooker_(hojaBases) : false;

  var hojaMarcadores = ss.getSheetByName('MARCADORES');
  var migroOperacion = hojaMarcadores ? migrarCalculoAOperacion_(hojaMarcadores) : false;

  limpiarHojaPorDefecto_(ss);

  var resumen =
    'Hojas creadas: ' + (creadas.length ? creadas.join(', ') : 'ninguna') +
    '\nHojas actualizadas: ' + (actualizadas.length ? actualizadas.join(', ') : 'ninguna') +
    (backfill.rellenadas ? '\nMAPEO.solapa completada en ' + backfill.rellenadas + ' fila(s) desde MAPEO.hoja' : '') +
    (backfill.sinHoja.length
      ? '\n⚠️ MAPEO sin "hoja" cargada, no se pudo determinar solapa: ' + backfill.sinHoja.join(', ')
      : '') +
    (eliminadasAlcance ? '\nMAPEO: eliminada(s) ' + eliminadasAlcance + ' fila(s) digital/Digital/alcance (col E era Fecha de inicio, Paso 2.8/2.9)' : '') +
    (movidasLooker ? '\nMAPEO: ' + movidasLooker + ' fila(s) de looker alineadas a resumen_metricas_dinamico (S-01, Paso 2.9 Parte C)' : '') +
    (tocadasSolapasLooker ? '\nSOLAPAS: looker resumen_metricas_dinamico=fuente / resumen_metricas=derivada (S-01)' : '') +
    (corrigioNotaControl ? '\nSOLAPAS: nota de digital/RDV JM 2 VECES corregida (texto pegado, no control — Parte C.4)' : '') +
    (reclasificadasM2 ? '\nSOLAPAS: ' + reclasificadasM2 + ' solapa(s) de m2 pasadas a revisar (clasificación invertida — Parte C.5)' : '') +
    (alineoHojaDefaultLooker ? '\nBASES: looker.hoja_default = resumen_metricas_dinamico (S-01)' : '') +
    (migroOperacion ? '\nMARCADORES.calculo renombrada a operacion (valores conservados)' : '');
  SpreadsheetApp.getUi().alert('Instalación completa', resumen, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Paso 2.8 Parte A — migración idempotente: borra la fila digital/Digital/alcance
 * de MAPEO si existe. Esa fila salía del ejemplo sembrado por HOJAS_CONFIG_.MAPEO
 * al crear la hoja de cero (ya corregido arriba) y nunca estuvo en SEED_MAPEO_, así
 * que `seedConfiguracion()` no la iba a pisar ni a borrar por su cuenta. La columna
 * E de esa solapa es "Fecha de inicio" (`dig_fecha_inicio`), no alcance —
 * confirmado por `auditarAlcanceDigital_()` (Paso 2.7 Parte B); el alcance real de
 * digital ya está mapeado en `digital/Alcance/alc_alcance`. Si la fila no está
 * (ya se borró, o la hoja es nueva), no hace nada.
 */
// Paso 2.9 Parte E: comparación tolerante a mayúsculas/acentos/espacios
// (`normalizar_`, Parseo.gs) — el reporte del Paso 2.8 mostró la fila viva con
// `columna` vacía después de correr la migración anterior, señal de que el
// match exacto (`===`) no la encontró (probablemente espacios sueltos cargados
// a mano en algún momento).
function eliminarMapeoAlcanceDigitalObsoleto_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxCampo = headers.indexOf('campo_logico');
  if (idxBaseId === -1 || idxSolapa === -1 || idxCampo === -1) return 0;

  var eliminadas = 0;
  // De abajo hacia arriba y sin cortar en el primer match: si quedó más de una
  // fila duplicada (p. ej. de una corrida anterior de la migración que solo
  // borraba la primera), esta versión las borra todas en la misma corrida.
  for (var f = datos.length - 1; f >= 1; f--) {
    if (normalizar_(datos[f][idxBaseId]) === 'digital' &&
        normalizar_(datos[f][idxSolapa]) === 'digital' &&
        normalizar_(datos[f][idxCampo]) === 'alcance') {
      hoja.deleteRow(f + 1);
      eliminadas++;
    }
  }
  return eliminadas;
}

/**
 * Paso 2.9 Parte C — S-01: la fuente de `looker` es `resumen_metricas_dinamico`
 * (`=QUERY(Cuentas!A2:G; ...)`, consulta viva sobre `Cuentas`), no `resumen_metricas`
 * (pegado de valores que devolvió 899 de 903 filas sin fecha). Esto invierte la
 * decisión del Paso 2.8 Parte C, que había leído "tiene fórmulas = derivada" sin
 * contemplar que la fórmula puede consultar una TERCERA hoja en vez de derivar de
 * la otra — ver docs/SUPUESTOS.md S-01.
 *
 * Reemplaza a `moverFechaPeriodoLookerAResumenMetricas_` (Paso 2.8 Parte B), que
 * movía en sentido contrario y, si seguía corriendo en cada `instalar()`, iba a
 * revertir esta decisión sola en la próxima instalación. Mueve TODAS las filas de
 * `MAPEO` de looker que cuelgan de `resumen_metricas` de vuelta a
 * `resumen_metricas_dinamico` (no solo `fecha_periodo`) — no toca `columna`: las
 * dos hojas tienen el mismo orden de columnas. Idempotente: en una instalación ya
 * alineada no mueve nada.
 */
function alinearMapeoLookerADinamico_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxHoja = headers.indexOf('hoja');
  if (idxBaseId === -1 || idxSolapa === -1 || idxHoja === -1) return 0;

  var movidas = 0;
  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxBaseId] === 'looker' && datos[f][idxSolapa] === 'resumen_metricas') {
      hoja.getRange(f + 1, idxSolapa + 1).setValue('resumen_metricas_dinamico');
      hoja.getRange(f + 1, idxHoja + 1).setValue('resumen_metricas_dinamico');
      movidas++;
    }
  }
  return movidas;
}

/**
 * Paso 2.9 Parte C, punto 1 — mismo criterio que `alinearMapeoLookerADinamico_`
 * pero sobre `SOLAPAS`: `resumen_metricas_dinamico` → `fuente`,
 * `resumen_metricas` → `derivada`, las dos con `origen=manual` (para que
 * `sembrarClasificacionSolapas()` no las vuelva a poner en `revisar`) y nota
 * apuntando a S-01. Idempotente.
 */
function alinearSolapasLookerADinamico_(hoja) {
  var existentes = leerFilasSolapas_(hoja);
  var nota = 'Paso 2.9 Parte C — ver docs/SUPUESTOS.md S-01';
  var tocadas = 0;

  var dinamico = existentes['looker||resumen_metricas_dinamico'];
  if (dinamico) {
    hoja.getRange(dinamico.fila, dinamico.idx.uso + 1).setValue('fuente');
    hoja.getRange(dinamico.fila, dinamico.idx.origen + 1).setValue('manual');
    hoja.getRange(dinamico.fila, dinamico.idx.notas + 1).setValue(nota);
    tocadas++;
  }
  var plana = existentes['looker||resumen_metricas'];
  if (plana) {
    hoja.getRange(plana.fila, plana.idx.uso + 1).setValue('derivada');
    hoja.getRange(plana.fila, plana.idx.origen + 1).setValue('manual');
    hoja.getRange(plana.fila, plana.idx.notas + 1).setValue(nota);
    tocadas++;
  }
  return tocadas;
}

/**
 * Paso 2.9 Parte C, punto 3 — `BASES.hoja_default` de looker vuelve a
 * `resumen_metricas_dinamico`. Idempotente.
 */
function alinearBasesHojaDefaultLooker_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxHojaDefault = headers.indexOf('hoja_default');
  if (idxBaseId === -1 || idxHojaDefault === -1) return false;

  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxBaseId] === 'looker' && datos[f][idxHojaDefault] !== 'resumen_metricas_dinamico') {
      hoja.getRange(f + 1, idxHojaDefault + 1).setValue('resumen_metricas_dinamico');
      return true;
    }
  }
  return false;
}

/**
 * Paso 2.9 Parte C.4 — `digital/RDV JM 2 VECES` no es un conjunto de control: es
 * texto pegado a mano (una foto del link Funcionario/Barrio/Fecha en un momento
 * dado, no datos vivos ni una fórmula). La nota vieja decía "usar para validar el
 * scoring/umbral 0.6" — corregida para que nadie la use así (ver
 * docs/DISENO_match_temario.md §9, marcada inválida). No toca `uso` (sigue
 * `referencia`: no se lee para mapear, pero tampoco se borra el registro).
 * Idempotente.
 */
var NOTA_CONTROL_ANCLAJE_CORREGIDA_ = 'texto pegado — no es fuente ni control. No usar (Paso 2.9 Parte C.4).';

function corregirNotaControlAnclaje_(hoja) {
  var existentes = leerFilasSolapas_(hoja);
  var fila = existentes['digital||RDV JM 2 VECES'];
  if (!fila || fila.notas === NOTA_CONTROL_ANCLAJE_CORREGIDA_) return false;

  hoja.getRange(fila.fila, fila.idx.notas + 1).setValue(NOTA_CONTROL_ANCLAJE_CORREGIDA_);
  return true;
}

/**
 * Paso 2.9 Parte C.5 — SOLAPAS tenía la clasificación de `m2` invertida: `M2 Directa`
 * / `M2 digital` (26 / 67 filas, notas "acumulados") en `uso=fuente`, y `M2 periodo
 * DIRECTA` / `M2 periodo DIGITAL` (29.533 / 2.413 filas) en `uso=derivada`. Una vista
 * filtrada no puede tener mil veces más filas que su origen — misma inversión que
 * tuvo `looker` (S-01). No se decide sola acá: pasan a `uso=revisar` con la nota de
 * sospecha, pendiente de que alguien confirme contra la base viva. Idempotente.
 *
 * Paso 2.10 Parte C — `M2 periodo DIRECTA`/`DIGITAL` SALIERON de esta lista: no era
 * una inversión, es un `GROUP BY id_cuenta` sobre `M2 Directa` con período tipeado a
 * mano (verificado: los 18 `ID` de la vista son exactamente los 18 `ID cuentas`
 * distintos de `M2 Directa`). `SEED_SOLAPAS_` ya las clasifica `referencia` junto con
 * las otras cuatro solapas "periodo" — si siguieran acá, esta función las volvería a
 * `revisar` en cada instalación y pisaría esa clasificación.
 */
var SOLAPAS_M2_INVERTIDAS_ = ['M2 Directa', 'M2 digital'];
var NOTA_M2_INVERTIDA_ = 'clasificación invertida, pendiente de confirmar (Paso 2.9 Parte C.5)';

function reclasificarSolapasM2Invertidas_(hoja) {
  var existentes = leerFilasSolapas_(hoja);
  var tocadas = 0;

  SOLAPAS_M2_INVERTIDAS_.forEach(function (nombreSolapa) {
    var fila = existentes['m2||' + nombreSolapa];
    if (!fila) return;
    if (fila.uso === 'revisar' && fila.notas === NOTA_M2_INVERTIDA_) return; // ya aplicado

    hoja.getRange(fila.fila, fila.idx.uso + 1).setValue('revisar');
    hoja.getRange(fila.fila, fila.idx.notas + 1).setValue(NOTA_M2_INVERTIDA_);
    tocadas++;
  });

  return tocadas;
}

/**
 * DOC-2 Parte A — migración idempotente `calculo` → `operacion` en MARCADORES.
 * Renombra el encabezado **en su lugar** (misma columna, mismos valores
 * cargados): no crea una columna nueva al lado, que dejaría dos verdades. Si
 * la hoja ya dice `operacion`, no hace nada; si nunca tuvo `calculo` (hoja
 * instalada de cero con el esquema nuevo), tampoco.
 */
function migrarCalculoAOperacion_(hoja) {
  var ultimaColumna = Math.max(hoja.getLastColumn(), 1);
  var headers = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  var idxCalculo = headers.indexOf('calculo');
  if (idxCalculo === -1) return false; // ya migrada o instalación nueva

  hoja.getRange(1, idxCalculo + 1).setValue('operacion');
  return true;
}

/**
 * Paso 2.3.2 — backfill de la columna `solapa` en MAPEO. Regla: `solapa` toma el
 * mismo valor que `hoja` de esa fila — es el dato real de qué solapa mapea esa
 * fila, ya cargado por el Paso 2.3 (incluidas las filas `dig_*`/`mail_*`/`sms_*`,
 * que ya apuntaban a su solapa real, no a `hoja_default`). Nunca cae a
 * `hoja_default`: una fila sin `hoja` cargada queda sin `solapa` y se reporta,
 * no se adivina (ver Paso-2.3.2.md, sección A). Idempotente: no toca filas que
 * ya tengan `solapa`.
 */
function backfillSolapaMapeo_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxBaseId = headers.indexOf('base_id');
  var idxSolapa = headers.indexOf('solapa');
  var idxHoja = headers.indexOf('hoja');
  var idxCampo = headers.indexOf('campo_logico');
  if (idxSolapa === -1 || idxHoja === -1) return { rellenadas: 0, sinHoja: [] };

  var rellenadas = 0;
  var sinHoja = [];

  for (var f = 1; f < datos.length; f++) {
    var fila = datos[f];
    if (!fila[idxBaseId]) continue; // fila vacía
    if (fila[idxSolapa] !== '' && fila[idxSolapa] !== null && fila[idxSolapa] !== undefined) continue;

    var valorHoja = fila[idxHoja];
    if (!valorHoja) {
      sinHoja.push(fila[idxBaseId] + '/' + fila[idxCampo]);
      continue;
    }
    hoja.getRange(f + 1, idxSolapa + 1).setValue(valorHoja);
    rellenadas++;
  }

  return { rellenadas: rellenadas, sinHoja: sinHoja };
}

function asegurarColumna_(hoja, nombreColumna, indiceDestino) {
  var ultimaColumna = Math.max(hoja.getLastColumn(), 1);
  var headers = hoja.getRange(1, 1, 1, ultimaColumna).getValues()[0];
  if (headers.indexOf(nombreColumna) !== -1) return false; // ya existe, no duplicar

  hoja.insertColumnBefore(indiceDestino);
  hoja.getRange(1, indiceDestino).setValue(nombreColumna);
  return true;
}

function limpiarHojaPorDefecto_(ss) {
  ['Hoja 1', 'Sheet1'].forEach(function (nombre) {
    var hoja = ss.getSheetByName(nombre);
    if (hoja && ss.getSheets().length > 1 && hoja.getLastRow() === 0 && hoja.getLastColumn() === 0) {
      ss.deleteSheet(hoja);
    }
  });
}

/**
 * Paso 1.7 — seed de configuración inicial (BASES + MAPEO + CONFIG).
 * Ver docs/Prompts/Paso-1.7.md y Plan Inicial/_archivo/M2_mapeo_y_config.md.
 */

// Paso 2.11 Parte A — antes vivía en HOJAS_CONFIG_.INFORMES.ejemplos. 'jm'/'secco'
// son identificadores durables, referenciados en todo SEED_MAPEO_/SEED_SOLAPAS_ —
// misma categoría que BASES/MAPEO, se aplica con el mismo mecanismo (upsertPorClave_
// en seedConfiguracion()).
var SEED_INFORMES_ = [
  { informe_id: 'jm', nombre: 'Informe semanal JM', plantilla_id: '', periodicidad: 'semanal', familias: 'ecv,enc,m2,camp,mail,gcba,rrss', activo: 'sí', notas: '22 slides' },
  { informe_id: 'secco', nombre: 'Seguimiento SECCO-SSCDI', plantilla_id: '', periodicidad: 'mensual', familias: 'ecv,et,emin,m2,camp,conv,rep,rrss', activo: 'sí', notas: '29 slides' }
];

var SEED_BASES_ = [
  { base_id: 'rdv', nombre: 'RDV JM CM ES + funcionarios', sheet_id: '1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo', hoja_default: 'RVD JM-CM - ES', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Encuentros' },
  { base_id: 'digital', nombre: 'Seguimiento Digital', sheet_id: '1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY', hoja_default: 'Digital', fila_encabezado: 1, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Campaña por canal. Paso 2.3: snapshot — sus solapas usan fecha de inicio de campaña (lead 3-7 días), el recorte por período lo hace el agregador vía link campaña↔encuentro, no ventana de fecha cruda.' },
  { base_id: 'looker', nombre: 'Base Looker', sheet_id: '1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ', hoja_default: 'resumen_metricas_dinamico', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'sí', notas: 'Consolidado. Fuente = resumen_metricas_dinamico (S-01, Paso 2.9 Parte C, 31/07): QUERY() viva sobre Cuentas; resumen_metricas es un pegado que devolvió 899 de 903 filas sin fecha — DOC-3 Parte A cerrada.' },
  // Paso 2.10 Parte C: hoja_default vacío a propósito — 'M2 periodo DIRECTA' pasó a
  // uso=referencia (banner de período tipeado a mano, no una fuente). Un default que
  // apunta a una solapa no-fuente hacía que los diagnósticos genéricos (probarConexionBases,
  // probarLecturaPeriodo) "leyeran" igual esa vista sin avisar — vacío falla ⚠ y visible
  // en vez de silencioso. m2 queda sin fuente activa para m2_* (ver SOLAPAS_M2_INVERTIDAS_
  // más arriba y Paso-2.10_PartesBC_verificado.md §2.3): el catálogo 'Cuentas M2' se
  // sobrescribe cada semana sin historia, así que ni siquiera apuntando ahí resolvería
  // el período del informe. Los tokens m2_* de MARCADORES usan overrides de solapa, no
  // este default, y van a emitir «FALTA:token» hasta que se decida una fuente real.
  { base_id: 'm2', nombre: 'M2 Reporte para Fede 2026', sheet_id: '1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY', hoja_default: '', fila_encabezado: 3, modo_periodo: 'snapshot', tipo: 'google_sheets', activo: 'sí', notas: 'Directa + Digital en hojas separadas. Sin hoja_default (Paso 2.10 Parte C): m2 sin fuente activa para m2_*.' },
  { base_id: 'miba', nombre: 'Integración MiBA', sheet_id: '', hoja_default: '', fila_encabezado: 1, modo_periodo: 'filtrar', tipo: 'google_sheets', activo: 'no', notas: 'Parqueada' }
];

var SEED_MAPEO_ = [
  // rdv — hoja 'RVD JM-CM - ES'
  { base_id: 'rdv', campo_logico: 'figura', hoja: 'RVD JM-CM - ES', columna: 'A', notas: 'filtro por figura' },
  { base_id: 'rdv', campo_logico: 'barrio', hoja: 'RVD JM-CM - ES', columna: 'B', notas: '' },
  { base_id: 'rdv', campo_logico: 'evento', hoja: 'RVD JM-CM - ES', columna: 'C', notas: '' },
  // DOC-2 Parte C: 'fecha' → 'fecha_periodo' (Paso 2.3.1/2.3.2; leerFuente ya no busca
  // 'fecha', solo 'fecha_periodo' — sin uso vivo que justifique dejar la fila vieja
  // derogada). Alineado con la selección congelada en docs/FECHAS_seleccion.md: columna
  // E, sin advertencias ("limpia").
  { base_id: 'rdv', campo_logico: 'fecha_periodo', hoja: 'RVD JM-CM - ES', columna: 'E', notas: 'filtro de período' },
  { base_id: 'rdv', campo_logico: 'status', hoja: 'RVD JM-CM - ES', columna: 'I', notas: 'filtro (Realizada)' },
  { base_id: 'rdv', campo_logico: 'inscriptos', hoja: 'RVD JM-CM - ES', columna: 'K', notas: '(resuelto)' },
  { base_id: 'rdv', campo_logico: 'insc_mail', hoja: 'RVD JM-CM - ES', columna: 'L', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_cc', hoja: 'RVD JM-CM - ES', columna: 'M', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_ivr', hoja: 'RVD JM-CM - ES', columna: 'N', notas: '' },
  { base_id: 'rdv', campo_logico: 'insc_digital', hoja: 'RVD JM-CM - ES', columna: 'O', notas: 'header real "RRSS" — duda resuelta' },
  { base_id: 'rdv', campo_logico: 'insc_dif', hoja: 'RVD JM-CM - ES', columna: 'P', notas: '' },
  { base_id: 'rdv', campo_logico: 'asistentes', hoja: 'RVD JM-CM - ES', columna: 'Q', notas: '' },
  { base_id: 'rdv', campo_logico: 'comuna', hoja: 'RVD JM-CM - ES', columna: 'AA', notas: '' },
  { base_id: 'rdv', campo_logico: 'poblacion', hoja: 'RVD JM-CM - ES', columna: 'AB', notas: 'habitantes' },

  // looker — hoja 'resumen_metricas_dinamico' (Paso 2.9 Parte C, 31/07 — S-01,
  // docs/SUPUESTOS.md: es una QUERY() viva sobre 'Cuentas', no un derivado de
  // 'resumen_metricas'. Invierte la lectura del Paso 2.8 Parte C, que había tomado
  // "tiene fórmulas → derivada" al pie de la letra sin ver que la fórmula consulta
  // una TERCERA hoja — con eso, 'resumen_metricas_dinamico' es la que crece con
  // 'Cuentas' y 'resumen_metricas' el pegado que queda viejo (899 de 903 filas sin
  // fecha). Las dos hojas tienen el mismo orden de columnas
  // (`compararResumenesLooker_`, Solapas.gs), así que las letras no cambian.
  // Una fila por campaña; prefijos = canal, no familia.
  // DOC-3 Parte C: faltaba id_cuenta (col A) — clave de join con Seguimiento Digital
  // que el Paso 2.4 necesita. Sin prefijo de canal (a diferencia de dig_id_cuenta,
  // mail_id_cuenta, …): looker tiene una sola solapa, no seis, no hace falta desambiguar.
  { base_id: 'looker', campo_logico: 'id_cuenta', hoja: 'resumen_metricas_dinamico', columna: 'A', notas: 'join con Seguimiento Digital (Paso 2.4)' },
  { base_id: 'looker', campo_logico: 'campana', hoja: 'resumen_metricas_dinamico', columna: 'B', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha_inicio', hoja: 'resumen_metricas_dinamico', columna: 'C', notas: '' },
  { base_id: 'looker', campo_logico: 'fecha_fin', hoja: 'resumen_metricas_dinamico', columna: 'D', notas: '' },
  // Paso 2.9 Parte D (S-02): 'fecha' es el contrato viejo — leerFuente() ya solo
  // busca 'fecha_periodo' (verificado: no hay ningún buscarMapeo(..., 'fecha')
  // en el código). No se borra la fila, se marca derogada para que quede
  // constancia de por qué existió (apuntaba a fecha_inicio, columna C).
  { base_id: 'looker', campo_logico: 'fecha', hoja: 'resumen_metricas_dinamico', columna: 'C', notas: 'DEROGADA — ver S-02' },
  // fecha_periodo (Paso 2.8 Parte B/C): la escribió promoverFechasElegidas() (Fechas.gs)
  // contra la elección congelada en FECHAS_seleccion.md — misma columna que 'fecha'.
  { base_id: 'looker', campo_logico: 'fecha_periodo', hoja: 'resumen_metricas_dinamico', columna: 'C', notas: 'filtro de período (elegida en FECHAS_seleccion.md)' },
  { base_id: 'looker', campo_logico: 'eje', hoja: 'resumen_metricas_dinamico', columna: 'E', notas: '' },
  { base_id: 'looker', campo_logico: 'area', hoja: 'resumen_metricas_dinamico', columna: 'F', notas: '' },
  { base_id: 'looker', campo_logico: 'estado', hoja: 'resumen_metricas_dinamico', columna: 'G', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_impresiones', hoja: 'resumen_metricas_dinamico', columna: 'H', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_visualizaciones', hoja: 'resumen_metricas_dinamico', columna: 'I', notas: '' },
  { base_id: 'looker', campo_logico: 'dig_clics', hoja: 'resumen_metricas_dinamico', columna: 'J', notas: '' },
  { base_id: 'looker', campo_logico: 'alcance', hoja: 'resumen_metricas_dinamico', columna: 'K', notas: '' },
  { base_id: 'looker', campo_logico: 'frecuencia', hoja: 'resumen_metricas_dinamico', columna: 'M',
    notas: 'M=frecuencia_total; existe también meta_frecuencia en L — elección sin confirmar con el equipo (DOC-3 Parte C)' },
  { base_id: 'looker', campo_logico: 'mail_enviados', hoja: 'resumen_metricas_dinamico', columna: 'N', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_entregados', hoja: 'resumen_metricas_dinamico', columna: 'O', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_aperturas', hoja: 'resumen_metricas_dinamico', columna: 'P', notas: '' },
  { base_id: 'looker', campo_logico: 'mail_clics', hoja: 'resumen_metricas_dinamico', columna: 'Q', notas: '' },
  { base_id: 'looker', campo_logico: 'cc_contactados', hoja: 'resumen_metricas_dinamico', columna: 'T', notas: '' },
  { base_id: 'looker', campo_logico: 'cc_efectivos', hoja: 'resumen_metricas_dinamico', columna: 'U', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_audiencia', hoja: 'resumen_metricas_dinamico', columna: 'V', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_atendidos', hoja: 'resumen_metricas_dinamico', columna: 'X', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_escucha75', hoja: 'resumen_metricas_dinamico', columna: 'Y', notas: '' },
  { base_id: 'looker', campo_logico: 'ivr_marque1', hoja: 'resumen_metricas_dinamico', columna: 'Z', notas: '' },
  { base_id: 'looker', campo_logico: 'sms_enviados', hoja: 'resumen_metricas_dinamico', columna: 'AA', notas: '' },
  { base_id: 'looker', campo_logico: 'sms_entregados', hoja: 'resumen_metricas_dinamico', columna: 'AB', notas: '' },
  // DOC-3 Parte F: fuente encontrada para el token huérfano post_camp1-3 dinámico —
  // pieza_meta trae la URL del posteo de Facebook de la campaña (anteúltima columna).
  { base_id: 'looker', campo_logico: 'post_meta', hoja: 'resumen_metricas_dinamico', columna: 'AD', notas: 'URL del posteo de Facebook de la campaña — candidato para post_camp1-3 dinámico' },

  // m2 — DIRECTA en 'M2 periodo DIRECTA', DIGITAL en 'M2 periodo DIGITAL'
  { base_id: 'm2', campo_logico: 'campana', hoja: 'M2 periodo DIRECTA', columna: 'B', notas: '' },
  // Paso 2.9 Parte D (S-02): 'fecha' es el contrato viejo, igual que en looker.
  { base_id: 'm2', campo_logico: 'fecha', hoja: 'M2 periodo DIRECTA', columna: 'C', notas: 'DEROGADA — ver S-02' },
  { base_id: 'm2', campo_logico: 'envios', hoja: 'M2 periodo DIRECTA', columna: 'D', notas: '' },
  { base_id: 'm2', campo_logico: 'entregados', hoja: 'M2 periodo DIRECTA', columna: 'E', notas: '' },
  { base_id: 'm2', campo_logico: 'aperturas', hoja: 'M2 periodo DIRECTA', columna: 'F', notas: '' },
  { base_id: 'm2', campo_logico: 'or', hoja: 'M2 periodo DIRECTA', columna: 'G', notas: '' },
  { base_id: 'm2', campo_logico: 'clics', hoja: 'M2 periodo DIRECTA', columna: 'H', notas: '' },
  { base_id: 'm2', campo_logico: 'ctor', hoja: 'M2 periodo DIRECTA', columna: 'I', notas: '' },
  { base_id: 'm2', campo_logico: 'impresiones', hoja: 'M2 periodo DIGITAL', columna: 'F', notas: '' },
  { base_id: 'm2', campo_logico: 'alcance_dig', hoja: 'M2 periodo DIGITAL', columna: 'G', notas: '' },
  { base_id: 'm2', campo_logico: 'views', hoja: 'M2 periodo DIGITAL', columna: 'I', notas: '' },
  { base_id: 'm2', campo_logico: 'clics_dig', hoja: 'M2 periodo DIGITAL', columna: 'K', notas: '' },
  { base_id: 'm2', campo_logico: 'campana_dig', hoja: 'M2 periodo DIGITAL', columna: 'B', notas: '' },
  { base_id: 'm2', campo_logico: 'estado', hoja: 'M2 periodo DIGITAL', columna: 'E', notas: '' },

  // DOC-3 Parte D — solapa 'Cuentas': pasa el criterio de fuente cruda (encabezado en
  // fila 1, sin banner), pero es la tabla de ATRIBUTOS de campaña, no la fuente de los
  // tokens m2_*: no tiene ninguna métrica (clics, visualizaciones, etc.). Se registra
  // como dimensión, no reemplaza a M2 periodo DIRECTA/DIGITAL.
  // Conflicto resuelto en Paso 2.11 Parte B: BASES.fila_encabezado de m2 es 3 (vale
  // para las dos hojas con banner de período), pero 'Cuentas' tiene el encabezado en la
  // fila 1 — antes era un conflicto sin resolver porque fila_encabezado era por base,
  // no por solapa (ver docs/Prompts/DOC-3_verificacion_bases_vivas.md Parte D punto 2).
  // Ahora `leerFuente` resuelve por `SOLAPAS.fila_encabezado` (`resolverFilaEncabezado_`,
  // Fuentes.gs), que para 'Cuentas' ya está en 1 desde el Paso 2.6 Parte D.
  { base_id: 'm2', campo_logico: 'id_cuenta', hoja: 'Cuentas', columna: 'A', notas: '' },
  { base_id: 'm2', campo_logico: 'campana', hoja: 'Cuentas', columna: 'D', notas: '' },
  // 'Estado campaña' (J) y 'Estado' (V) coexisten en esta solapa; se mapea J.
  { base_id: 'm2', campo_logico: 'estado', hoja: 'Cuentas', columna: 'J', notas: 'mapeada "Estado campaña" (J), no "Estado" (V) — las dos columnas coexisten en la hoja' },
  { base_id: 'm2', campo_logico: 'eje', hoja: 'Cuentas', columna: 'K', notas: '' },
  { base_id: 'm2', campo_logico: 'area', hoja: 'Cuentas', columna: 'L', notas: '' },

  // digital (Seguimiento Digital) — sembrado en el Paso 2.3. Snapshot: el
  // recorte por período lo hace el agregador (Paso 3) vía el link
  // campaña↔encuentro, no por ventana de fecha cruda (ver SEED_BASES_.digital).
  // El join entre solapas es por "ID Cuentas", que cada solapa mapea acá.

  // hoja 'Digital' — campaña digital
  { base_id: 'digital', campo_logico: 'clave', hoja: 'Digital', columna: 'A', notas: 'mismo valor que dig_campana; permite que el diagnóstico de "Probar lectura" (que corre sobre hoja_default) descarte filas sin campaña sin depender del prefijo por solapa' },
  { base_id: 'digital', campo_logico: 'dig_campana', hoja: 'Digital', columna: 'A', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_jm_gcba', hoja: 'Digital', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_id_cuenta', hoja: 'Digital', columna: 'T', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'dig_fecha_inicio', hoja: 'Digital', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_fecha_fin', hoja: 'Digital', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_impresiones', hoja: 'Digital', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_alcance', hoja: 'Digital', columna: 'I', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_frecuencia', hoja: 'Digital', columna: 'J', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_views', hoja: 'Digital', columna: 'K', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_vtr', hoja: 'Digital', columna: 'L', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_clics', hoja: 'Digital', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_ctr', hoja: 'Digital', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'dig_impresiones_social', hoja: 'Digital', columna: 'U', notas: '' },

  // hoja 'Directa Mail'
  { base_id: 'digital', campo_logico: 'mail_id_cuenta', hoja: 'Directa Mail', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'mail_campana', hoja: 'Directa Mail', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_fecha', hoja: 'Directa Mail', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_enviados', hoja: 'Directa Mail', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_entregados', hoja: 'Directa Mail', columna: 'N', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_aperturas', hoja: 'Directa Mail', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_or', hoja: 'Directa Mail', columna: 'P', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_clics', hoja: 'Directa Mail', columna: 'Q', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_ctor', hoja: 'Directa Mail', columna: 'R', notas: '' },
  { base_id: 'digital', campo_logico: 'mail_area', hoja: 'Directa Mail', columna: 'T', notas: '' },

  // hoja 'Directa SMS'
  { base_id: 'digital', campo_logico: 'sms_id_cuenta', hoja: 'Directa SMS', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'sms_campana', hoja: 'Directa SMS', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_fecha', hoja: 'Directa SMS', columna: 'D', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_enviados', hoja: 'Directa SMS', columna: 'F', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_entregados', hoja: 'Directa SMS', columna: 'G', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_ent_pct', hoja: 'Directa SMS', columna: 'H', notas: '' },
  { base_id: 'digital', campo_logico: 'sms_clics', hoja: 'Directa SMS', columna: 'I', notas: '' },

  // hoja 'Directa IVR' — sin fecha única (tiene Inicio D y Fin E)
  { base_id: 'digital', campo_logico: 'ivr_id_cuenta', hoja: 'Directa IVR', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'ivr_campana', hoja: 'Directa IVR', columna: 'I', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_inicio', hoja: 'Directa IVR', columna: 'D', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_fin', hoja: 'Directa IVR', columna: 'E', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_audiencia', hoja: 'Directa IVR', columna: 'J', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_llamados', hoja: 'Directa IVR', columna: 'K', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_atendidos', hoja: 'Directa IVR', columna: 'L', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_at_pct', hoja: 'Directa IVR', columna: 'M', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_e75', hoja: 'Directa IVR', columna: 'N', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_e75_pct', hoja: 'Directa IVR', columna: 'O', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_marque1', hoja: 'Directa IVR', columna: 'P', notas: '' },
  { base_id: 'digital', campo_logico: 'ivr_marque1_pct', hoja: 'Directa IVR', columna: 'Q', notas: '' },

  // hoja 'Alcance' — alcance/frecuencia por cuenta
  { base_id: 'digital', campo_logico: 'alc_id_cuenta', hoja: 'Alcance', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'alc_alcance', hoja: 'Alcance', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'alc_frecuencia', hoja: 'Alcance', columna: 'C', notas: '' },

  // hoja maestra 'Seguimiento digital' — dimensión + pauta por plataforma
  { base_id: 'digital', campo_logico: 'sd_id_cuenta', hoja: 'Seguimiento digital', columna: 'A', notas: 'join entre solapas' },
  { base_id: 'digital', campo_logico: 'sd_campana_cuentas', hoja: 'Seguimiento digital', columna: 'B', notas: '' },
  { base_id: 'digital', campo_logico: 'sd_campana_digital', hoja: 'Seguimiento digital', columna: 'C', notas: '' },
  { base_id: 'digital', campo_logico: 'sd_fecha_inicio', hoja: 'Seguimiento digital', columna: 'L', notas: '' },
  { base_id: 'digital', campo_logico: 'sd_pauta_google', hoja: 'Seguimiento digital', columna: 'T', notas: 'conteo de contenidos pauteados en Google, no monto' },
  { base_id: 'digital', campo_logico: 'sd_pauta_prog', hoja: 'Seguimiento digital', columna: 'U', notas: 'conteo de contenidos pauteados en Programmatic, no monto' },
  { base_id: 'digital', campo_logico: 'sd_pauta_meta', hoja: 'Seguimiento digital', columna: 'V', notas: 'conteo de contenidos pauteados en Meta, no monto' }
];

// Paso 2.3.2: `solapa` entra en la clave de MAPEO junto a `base_id` +
// `campo_logico`. Cada fila de arriba ya declara su `hoja` real (incluidas las
// `dig_*`/`mail_*`/`sms_*`, que ya apuntaban a su solapa real, no a
// `hoja_default`) — `solapa` es exactamente ese mismo valor, así que se deriva
// acá en vez de tipearlo dos veces por fila.
SEED_MAPEO_.forEach(function (fila) { fila.solapa = fila.hoja; });

/**
 * Paso 2.7 Parte F — `tipo_esperado` por `campo_logico`, no por fila: el mismo
 * campo lógico tiene el mismo tipo de dato sin importar en qué base/solapa viva
 * (`campana` es texto en las cuatro bases). Solo cubre lo "obvio" que pidió el
 * prompt — identificadores/categóricos → texto, `fecha*` → fecha, lo que un
 * marcador va a sumar → numero. Lo que no está acá queda sin declarar (`''`) a
 * propósito: `DIAG_BASES` no avisa ⚠ sobre lo no declarado, solo lo lista aparte
 * como informativo — no hace falta adivinar el resto para que esto sirva.
 */
var TIPO_ESPERADO_POR_CAMPO_ = {
  // identificadores y categóricos — texto
  figura: 'texto', barrio: 'texto', evento: 'texto', status: 'texto', estado: 'texto',
  comuna: 'texto', eje: 'texto', area: 'texto', campana: 'texto', campana_dig: 'texto',
  clave: 'texto', id_cuenta: 'texto', dig_jm_gcba: 'texto', post_meta: 'texto', mail_area: 'texto',
  dig_campana: 'texto', mail_campana: 'texto', sms_campana: 'texto', ivr_campana: 'texto',
  sd_campana_cuentas: 'texto', sd_campana_digital: 'texto',
  dig_id_cuenta: 'texto', mail_id_cuenta: 'texto', sms_id_cuenta: 'texto',
  ivr_id_cuenta: 'texto', alc_id_cuenta: 'texto', sd_id_cuenta: 'texto',

  // fecha
  fecha_periodo: 'fecha', fecha_inicio: 'fecha', fecha_fin: 'fecha', fecha: 'fecha',
  dig_fecha_inicio: 'fecha', dig_fecha_fin: 'fecha', mail_fecha: 'fecha', sms_fecha: 'fecha',
  ivr_inicio: 'fecha', ivr_fin: 'fecha', sd_fecha_inicio: 'fecha',

  // métricas que un marcador va a sumar — numero
  inscriptos: 'numero', insc_mail: 'numero', insc_cc: 'numero', insc_ivr: 'numero',
  insc_digital: 'numero', insc_dif: 'numero', asistentes: 'numero', poblacion: 'numero',
  dig_impresiones: 'numero', dig_visualizaciones: 'numero', dig_clics: 'numero',
  alcance: 'numero', frecuencia: 'numero',
  mail_enviados: 'numero', mail_entregados: 'numero', mail_aperturas: 'numero',
  mail_clics: 'numero', mail_or: 'numero', mail_ctor: 'numero',
  cc_contactados: 'numero', cc_efectivos: 'numero',
  ivr_audiencia: 'numero', ivr_atendidos: 'numero', ivr_escucha75: 'numero',
  ivr_marque1: 'numero', ivr_llamados: 'numero', ivr_at_pct: 'numero', ivr_e75: 'numero',
  ivr_e75_pct: 'numero', ivr_marque1_pct: 'numero',
  sms_enviados: 'numero', sms_entregados: 'numero', sms_ent_pct: 'numero', sms_clics: 'numero',
  envios: 'numero', entregados: 'numero', aperturas: 'numero', or: 'numero', clics: 'numero',
  ctor: 'numero', impresiones: 'numero', alcance_dig: 'numero', views: 'numero', clics_dig: 'numero',
  dig_alcance: 'numero', dig_frecuencia: 'numero', dig_views: 'numero', dig_vtr: 'numero',
  dig_ctr: 'numero', dig_impresiones_social: 'numero',
  alc_alcance: 'numero', alc_frecuencia: 'numero',
  sd_pauta_google: 'numero', sd_pauta_prog: 'numero', sd_pauta_meta: 'numero'
};
SEED_MAPEO_.forEach(function (fila) { fila.tipo_esperado = TIPO_ESPERADO_POR_CAMPO_[fila.campo_logico] || ''; });

// Paso 2.11 Parte A — antes vivía en HOJAS_CONFIG_.PERIODOS.ejemplos. Períodos
// nombrados reutilizables (referenciados por MARCADORES.periodo_ref, ej.
// 'm2_mensual') — misma categoría durable que BASES/MAPEO/INFORMES, mismo
// mecanismo de aplicación.
var SEED_PERIODOS_ = [
  { periodo_id: 'm2_mensual', desde: '2026-06-01', hasta: '2026-06-30', notas: 'M2 dentro del JM' },
  { periodo_id: 'quincena_rrss', desde: '2026-06-16', hasta: '2026-06-30', notas: 'Análisis RRSS' }
];

// Paso 2.11 Parte A — antes vivían en HOJAS_CONFIG_.CAMPANAS.ejemplos y
// HOJAS_CONFIG_.REUNIONES.ejemplos. A diferencia de INFORMES/PERIODOS, estas dos
// son curadas a mano y cambian cada semana (mismo patrón — ver R-02 en
// docs/REGLAS_NEGOCIO.md): un upsert automático en cada "Cargar config inicial"
// pisaría la campaña/reunión real de la semana con este dato de ejemplo si
// coincidiera la clave. Quedan movidas acá (fuera de HOJAS_CONFIG_, que ya no
// siembra nada) pero SIN sembrador automático — a la espera de que
// `menuCargarEjemplo_()` (Codigo.gs, hoy un stub) las use para una instalación
// de cero, con el humano confirmando antes de escribir.
var SEED_CAMPANAS_EJEMPLO_ = [
  { campana_id: 'serv_esenciales', nombre: 'Servicios esenciales', informe_id: 'secco', base_id: 'looker', tipo: 'campana', desde: '2026-06-02', hasta: '2026-06-15', mostrar: 'sí', orden: 1 },
  { campana_id: 'encuentros_min', nombre: 'Encuentros de ministros', informe_id: 'secco', base_id: 'rdv', tipo: 'ministros', desde: '2026-06-01', hasta: '2026-06-30', mostrar: 'sí', orden: 2 },
  { campana_id: 'prov_uber', nombre: 'Uber', informe_id: 'secco', base_id: 'digital', tipo: 'proveedor', desde: '2026-06-01', hasta: '2026-06-30', mostrar: 'no', orden: 3 }
];

// Paso 2.9D — R-02: el temario define el universo del informe, no la fecha.
// Rescatado de los comentarios de la plantilla SECCO — temario real del 24/07 al
// 30/07/2026 (docs/TEMARIO_Y_PLANTILLA_2026-07-31.md), el único ejemplo real que
// existe del formato en que el equipo piensa el informe. Ver nota de
// SEED_CAMPANAS_EJEMPLO_ arriba: sin sembrador automático, mismo motivo.
var SEED_REUNIONES_EJEMPLO_ = [
  { orden: 1, eje: 'JM', tipo: 'Uno a uno', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'pre', mostrar: 'sí', texto_original: 'JM | Uno a uno en San Cristóbal 23/07 (pre)', notas: '' },
  { orden: 2, eje: 'JM', tipo: 'Uno a uno', nombre: 'Retiro', fecha: '2026-07-24', etapa: 'pre', mostrar: 'sí', texto_original: '2) JM | Uno a uno en Retiro 24/07 (pre)', notas: '' },
  { orden: 3, eje: 'JM', tipo: 'Encuentro Temático', nombre: 'Orden Público', fecha: '2026-07-28', etapa: '', mostrar: 'sí', texto_original: 'JM | Encuentro Temático Orden Público 28/07', notas: '' },
  { orden: 4, eje: 'JM', tipo: 'Uno a uno', nombre: 'San Cristóbal', fecha: '2026-07-23', etapa: 'post', mostrar: 'sí', texto_original: 'JM | Uno a uno en San Cristóbal 23/07 (POST)', notas: '' },
  { orden: 5, eje: 'JM', tipo: 'Uno a uno', nombre: 'Retiro', fecha: '2026-07-24', etapa: 'post', mostrar: 'sí', texto_original: 'JM | Uno a uno en Retiro 24/07 (post)', notas: '' },
  { orden: 6, eje: 'Ministros', tipo: 'Agregado', nombre: 'Reuniones de la semana', fecha: '2026-07-24', etapa: '', mostrar: 'sí', texto_original: 'Ministros | Reuniones de la semana (24/07 al 30/07 inclusive - Acumulado)', notas: '24/07 al 30/07 inclusive' },
  { orden: 7, eje: 'M2', tipo: 'Agregado', nombre: 'Campañas y enviados de la semana', fecha: '2026-07-24', etapa: '', mostrar: 'sí', texto_original: '6) M2 | Campañas y enviados de la semana del 24/07 al 30/07', notas: '' }
];

/**
 * Paso 2.6 Parte D — clasificación PROPUESTA de las ~86 solapas reales de las
 * cuatro bases (relevamiento manual sobre los archivos vivos,
 * docs/Prompts/Paso-2.6_registro_solapas.md Parte D). **No es una decisión**:
 * todo lo que queda en `revisar` lo confirma el usuario, y cualquier fila se
 * puede reclasificar a mano después — por eso se aplica con
 * `sembrarClasificacionSolapas()`, una siembra explícita y separada de
 * `inventariarSolapas()` (Solapas.gs), que nunca toca `uso`.
 *
 * `fila_encabezado` por defecto toma el de la base (`FILA_ENCABEZADO_POR_BASE_`,
 * espejo de `SEED_BASES_`); se pisa puntualmente donde el relevamiento encontró
 * otra cosa (m2 / `Cuentas` y `Cuentas M2`: fila 1, aunque la base tiene
 * `fila_encabezado=3` — DOC-3 Parte D, PROYECTO.md §5bis regla 2).
 *
 * ⚠ Consecuencia real, no cosmética: sembrar esto deja `M2 periodo DIRECTA` /
 * `M2 periodo DIGITAL` (banner de período en fila 1 — viola el criterio de fuente
 * cruda) en `uso=referencia` (Paso 2.10 Parte C — antes decía `revisar`, ya resuelto:
 * no es una clasificación pendiente, es un período tipeado a mano y no reproducible)
 * aunque siguen mapeadas en `MAPEO`. `buscarMapeo()` va a fallar para esos campos con
 * `«FALTA:token»` — visible a propósito, hasta que se decida una fuente real para `m2`.
 * (La ambigüedad de las dos hojas de `looker` que tenía esta misma nota se resolvió
 * en Paso 2.8 Parte C — ver `filaSolapa_('looker', ...)` más abajo, ya con
 * `uso=fuente`/`derivada`.)
 */
// m2: 3 es el default histórico (acertaba para las dos vistas "M2 periodo *", que
// tienen banner de período en fila 1 y encabezados reales en fila 3), pero Paso 2.11
// Parte B midió que es la EXCEPCIÓN, no la regla — el resto de las solapas de m2 tiene
// encabezado en fila 1, como cualquier otra base. Por eso `SOLAPAS.fila_encabezado` es
// la fuente real (ver `resolverFilaEncabezado_`, Fuentes.gs); esto queda solo como
// default para una solapa de m2 que todavía no está declarada en `SOLAPAS`.
var FILA_ENCABEZADO_POR_BASE_ = { rdv: 1, digital: 1, looker: 1, m2: 3 };

// Paso 2.11 Parte B — `fila_encabezado = 0` significa "esta solapa no tiene fila de
// títulos, los datos arrancan en la fila 1" (caso `Mail per`, m2 y digital: es un
// recorte de columnas de otra tabla, pegado sin encabezado propio). Solo válido para
// solapas que NO son `fuente` — una fuente sin fila de títulos no tiene de dónde sacar
// nombres de columna para MAPEO. `resolverFilaEncabezado_` (Fuentes.gs) lo respeta tal
// cual (no cae al default de la base): un cero puesto a propósito no es "sin dato".
function filaSolapa_(baseId, solapa, uso, notas, opciones) {
  opciones = opciones || {};
  return {
    base_id: baseId,
    solapa: solapa,
    uso: uso,
    fila_encabezado: 'fila_encabezado' in opciones ? opciones.fila_encabezado : FILA_ENCABEZADO_POR_BASE_[baseId],
    firma_encabezado: '',
    filas_datos: 'filas_datos' in opciones ? opciones.filas_datos : '',
    notas: notas
  };
}

function filasSolapa_(baseId, solapas, uso, notas, opciones) {
  return solapas.map(function (solapa) { return filaSolapa_(baseId, solapa, uso, notas, opciones); });
}

// Paso 2.10 Parte C — nota compartida por las seis solapas "periodo" (ver más abajo).
var NOTA_PERIODO_MANUAL_ = 'vista con período manual en celda editable — no es fuente; ver VALIDACION_2026-07-31 §1.2';

var SEED_SOLAPAS_ = [].concat(
  // rdv — "RDV JM CM ES + funcionarios"
  [
    filaSolapa_('rdv', 'RVD JM-CM - ES', 'fuente', 'base de encuentros, hoja_default'),
    filaSolapa_('rdv', 'RDV_otros_ministros', 'fuente', 'mapeada; base ajena, ojo con la firma'),
    filaSolapa_('rdv', 'RVD JM-CM - ES Back Up', 'ignorar', 'backup'),
    filaSolapa_('rdv', 'RDV_JM_CM_ES', 'revisar', 'nombre casi idéntico al default — ¿duplicado?')
  ],
  filasSolapa_('rdv', ['Para Revisar', 'Copia de Para Revisar', 'Copia de Para Revisar 1'], 'ignorar', 'copias de trabajo'),
  filasSolapa_('rdv', ['Tabla dinámica 4', 'Tabla dinámica 14', 'Tabla dinámica 16', 'Tabla dinámica 18', 'Tabla dinámica 19', 'Tabla dinámica 20', 'Tabla dinámica 23'], 'ignorar', 'pivots'),
  filasSolapa_('rdv', ['Hoja 56', 'Hoja 59', 'Hoja 68', 'Hoja 78'], 'ignorar', 'hojas sueltas'),
  filasSolapa_('rdv', ['Aux_Maximos', 'Datos_Unpivot'], 'derivada', 'auxiliares de cálculo'),
  filasSolapa_('rdv', ['Visualiz_respuestas_GCBA', 'Visualiz_respuestas_JM', 'Visualiz_mail', 'Visualiz_SMS'], 'derivada', 'vistas'),
  filasSolapa_('rdv', ['Cantidad de reuniones por franja horaria'], 'derivada', 'agregado'),
  filasSolapa_('rdv', ['Desplegables', 'Organigrama', 'Mail propuesta'], 'ignorar', 'validaciones y material suelto'),
  filasSolapa_('rdv', ['Backup respuestas'], 'ignorar', 'backup'),
  filasSolapa_('rdv', ['Funcionarios / Ministros'], 'revisar', 'posible catálogo de personas — cruzar con PERSONAS_equivalencias.csv'),
  filasSolapa_('rdv', ['PPTS', 'RDV CONJUNTO', 'Agenda', 'Comunas', 'Seguimiento', 'Respuestas JM 📩'], 'revisar', 'sin decidir'),

  // digital — "Seguimiento Digital"
  [filaSolapa_('digital', 'Digital', 'fuente', 'hoja_default')],
  filasSolapa_('digital', ['Directa Mail', 'Directa IVR', 'Directa SMS'], 'fuente', 'canales de directa'),
  [filaSolapa_('digital', 'Seguimiento digital', 'fuente', 'maestra de la unión del Paso 2.4')],
  [filaSolapa_('digital', 'Alcance', 'fuente', 'usada por Union.gs')],
  [filaSolapa_('digital', 'RDV', 'ignorar', '⚠ duplica la base rdv — si se lee, hay doble conteo')],
  filasSolapa_('digital', ['Digital 2026 acumulado', 'm2 digital'], 'derivada', 'acumulados'),
  // Paso 2.9 Parte C.4: NO es conjunto de control — es texto pegado (una foto a mano
  // del link Funcionario/Barrio/Fecha, no datos vivos ni una fórmula). Ver
  // docs/DISENO_match_temario.md §9, marcada inválida como fuente de validación.
  [filaSolapa_('digital', 'RDV JM 2 VECES', 'referencia',
    'texto pegado — no es fuente ni control. No usar (Paso 2.9 Parte C.4; ' +
    'antes decía "usar para validar el scoring/umbral 0.6", ver docs/DISENO_match_temario.md §9).',
    { filas_datos: 37 })],
  filasSolapa_('digital', ['Metricas informe', 'INFORME'], 'referencia', 'el informe manual actual'),
  filasSolapa_('digital', ['Nomalización de barrios', 'Barrio Hab', 'Limpia Fun'], 'referencia', 'catálogos de normalización — útiles para el scoring del anclaje'),
  filasSolapa_('digital', ['Cuentas', 'Filter unificado', 'EDV', 'CAMPAÑAS_DESGLOCE_DIGITAL'], 'revisar', 'sin decidir'),

  // Paso 2.10 Parte C — seis solapas "periodo" entre m2 y digital: el recorte de
  // fechas vive en dos celdas editables (fila 1, o fila 2 en las dos de más abajo),
  // no en una fórmula ni un filtro reproducible — mismo defecto que ya tenía
  // 'RDV JM 2 VECES'. Medido el 31/07: cinco ventanas de fecha DISTINTAS entre las
  // seis, ninguna la del período del informe (24-30/07). 'referencia', no 'ignorar':
  // a diferencia de un backup o duplicado, sí documentan un recorte real — solo que
  // no es el que hace falta y no se puede reproducir sin retipear las celdas a mano.
  // No son destino de MAPEO. m2/Mail per y digital/Mail per son hojas DISTINTAS con
  // el mismo nombre (una por base) — la clave compuesta (base_id, solapa) las separa.
  // 'M2 periodo DIRECTA'/'DIGITAL' sí tienen encabezado real en fila 3 (banner de
  // período en fila 1) — usan el default de FILA_ENCABEZADO_POR_BASE_, no se pisa acá.
  filasSolapa_('m2', ['M2 periodo DIRECTA', 'M2 periodo DIGITAL'], 'referencia', NOTA_PERIODO_MANUAL_),
  // Paso 2.11 Parte B — 'Mail per' (m2 y digital) no tiene fila de títulos: la fila 1
  // ya es dato (recorte de columnas de 'Directa mail'/'Directa Mail', pegado sin
  // encabezado propio). fila_encabezado=0, ver la nota de más arriba.
  [filaSolapa_('m2', 'Mail per', 'referencia', NOTA_PERIODO_MANUAL_, { fila_encabezado: 0 })],
  filasSolapa_('digital', ['Buscador por periodo digital', 'Buscador por periodo directa'], 'referencia', NOTA_PERIODO_MANUAL_),
  [filaSolapa_('digital', 'Mail per', 'referencia', NOTA_PERIODO_MANUAL_, { fila_encabezado: 0 })],

  // looker — "Base Looker"
  [
    filaSolapa_('looker', 'resumen_metricas_dinamico', 'fuente', 'Paso 2.9 Parte C (S-01): QUERY() viva sobre Cuentas, no deriva de resumen_metricas — hoja_default'),
    filaSolapa_('looker', 'resumen_metricas', 'derivada', 'Paso 2.9 Parte C (S-01): pegado de valores; devolvió 899 de 903 filas sin fecha'),
    filaSolapa_('looker', 'MAIL', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 5748 }),
    filaSolapa_('looker', 'IVR', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 190 }),
    filaSolapa_('looker', 'SMS', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 86 }),
    filaSolapa_('looker', 'CC', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 1299 }),
    filaSolapa_('looker', 'DIGITAL', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 4563 }),
    filaSolapa_('looker', 'ALCANCE', 'fuente', 'detalle por canal, con ID cuentas', { filas_datos: 727 })
  ],
  filasSolapa_('looker', ['Desglose Alcance', 'Audiencias', 'Audiencias Conectadas', 'URLs', 'Cuentas'], 'revisar', 'sin decidir'),
  [filaSolapa_('looker', 'Desplegables', 'ignorar', 'validaciones')],

  // m2 — "M2 Reporte para Fede 2026"
  [
    filaSolapa_('m2', 'Cuentas M2', 'fuente', '353 filas, encabezado fila 1 — dimensión de campañas M2', { fila_encabezado: 1, filas_datos: 353 }),
    filaSolapa_('m2', 'Cuentas', 'revisar', '3453 filas, mismo encabezado — parece el universo completo, no solo M2', { fila_encabezado: 1, filas_datos: 3453 })
  ],
  // Paso 2.9 Parte C.5: 'M2 Directa'/'M2 digital' (26/67 filas, "acumulados") tienen
  // clasificación sospechada invertida frente a lo que se leía como su detalle.
  // Quedan 'revisar' hasta confirmar contra la base viva (misma duda que resolvió S-01
  // para looker). 'M2 periodo DIRECTA'/'DIGITAL' salieron de este grupo en el Paso 2.10
  // Parte C: no son un "detalle invertido", son las seis solapas "periodo" de más
  // arriba — reclasificarSolapasM2Invertidas_() (abajo) ya no las toca.
  // Paso 2.11 Parte B — fila_encabezado: 1, no el default de m2 (3). Medido contra el
  // archivo del 31/07: primeras celdas reales 'ID cuentas · ID MailUp · Listado de
  // Mail' (M2 Directa) / 'ID Cuentas · Nombre campaña…' (M2 digital) en la fila 1.
  // Con encabezado en fila 3 (el default viejo), leerFuente tomaba una fila de DATOS
  // como si fueran títulos — no fallaba, devolvía columnas con nombres raros.
  filasSolapa_('m2', ['M2 Directa', 'M2 digital'], 'revisar', 'clasificación invertida, pendiente de confirmar (Paso 2.9 Parte C.5)', { fila_encabezado: 1 }),
  // Paso 2.11 Parte B — mismo caso: encabezado real en fila 1 ('ID Cuentas · Nombre
  // campaña…' / 'ID Cuentas · Alcance · Frecuencia' / 'Id accion · Id cuentas · Año').
  filasSolapa_('m2', ['Seguimiento digital', 'Alcance', 'CAMPAÑAS_DESGLOCE_DIGITAL'], 'revisar', '⚠ mismos nombres que solapas de digital — hay que saber cuál manda antes de mapear ninguna', { fila_encabezado: 1 }),
  // Paso 2.10 Parte C: espejo de digital/Directa Mail (2.106 vs 2.107 filas, mismas
  // métricas) — declarada 'derivada' para que no queden las dos vivas dando números
  // casi iguales. MAPEO sigue apuntando a digital/Directa Mail, no se toca acá.
  // Paso 2.11 Parte B — fila_encabezado: 1 ('ID Cuentas · ID MailUp · Listado de Mail').
  [filaSolapa_('m2', 'Directa mail', 'derivada', 'espejo de digital/Directa Mail — ver Paso 2.10 Parte C', { fila_encabezado: 1 })],
  // Paso 2.11 Parte B — fila_encabezado: 1 ('Id · Nombre de la campaña…').
  filasSolapa_('m2', ['Digital acumulado'], 'derivada', 'acumulados', { fila_encabezado: 1 })
);

/**
 * Aplica SEED_SOLAPAS_ sobre la hoja SOLAPAS. A diferencia de `inventariarSolapas()`
 * (Solapas.gs), esto SÍ pisa `uso`/`fila_encabezado`/`notas` de las filas que toca —
 * pero NUNCA una fila con `origen=manual` (Paso 2.7 Parte A regla 2): esa es la única
 * marca que protege una decisión humana de una re-siembra. Toda fila que sí escribe
 * queda con `origen='seed'` — incluidas las que el inventario había dejado en
 * `origen='auto'` (ese es justo el caso que destraba esta parte: antes, un
 * `uso=revisar` puesto por el inventario se confundía con uno puesto a mano y la
 * siembra no podía pisarlo).
 * Pensada para correr una vez después de la primera corrida de "Inventariar
 * solapas"; vive en su propio ítem de menú, separado de "Cargar config inicial".
 */
function sembrarClasificacionSolapas() {
  var ui = SpreadsheetApp.getUi();
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SOLAPAS');
  if (!hoja) {
    ui.alert('No se pudo sembrar', 'La hoja SOLAPAS no existe. Corré "Instalar / reparar hojas" primero.', ui.ButtonSet.OK);
    return;
  }

  var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  var existentes = leerFilasSolapas_(hoja);

  var escritas = 0;
  var actualizadas = 0;
  var protegidas = [];

  SEED_SOLAPAS_.forEach(function (obj) {
    var clave = obj.base_id + '||' + obj.solapa;
    var existente = existentes[clave];

    if (existente && existente.origen === 'manual') {
      protegidas.push(clave);
      return; // Parte A regla 2: nunca pisar una fila marcada a mano
    }

    var filaObj = {
      base_id: obj.base_id,
      solapa: obj.solapa,
      uso: obj.uso,
      origen: 'seed',
      fila_encabezado: obj.fila_encabezado,
      firma_encabezado: obj.firma_encabezado,
      filas_datos: obj.filas_datos,
      notas: obj.notas
    };
    var valores = headers.map(function (h) { return (h in filaObj) ? filaObj[h] : ''; });

    if (existente) {
      hoja.getRange(existente.fila, 1, 1, headers.length).setValues([valores]);
      actualizadas++;
    } else {
      hoja.appendRow(valores);
      escritas++;
    }
  });

  ui.alert(
    'Clasificación inicial sembrada',
    'SOLAPAS — nuevas: ' + escritas + ', actualizadas: ' + actualizadas +
      (protegidas.length ? '\nProtegidas (origen=manual, no tocadas): ' + protegidas.length : '') +
      '\n\nEs una propuesta, no una decisión: las filas en uso=revisar quedan pendientes de que el usuario decida.',
    ui.ButtonSet.OK
  );
}

var SEED_CONFIG_DEFAULTS_ = {
  informe_activo: 'jm',
  periodo_desde: '',
  periodo_hasta: '',
  carpeta_plantillas: '1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi',
  carpeta_salida: '1EyTlfg16vpyrftpUXgacShFk8iSbX_fJ',
  // Paso 2.9F: el umbral de confianza del anclaje sale del código (era una
  // constante en Union.gs) y pasa a ser parámetro de negocio — cambiarlo ya no
  // exige clasp push. Ver umbralAnclajeReunion_() en Union.gs.
  umbral_anclaje_reunion: '0.6'
};

function seedConfiguracion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var vacio = { escritas: 0, actualizadas: 0 };

  var hojaBases = ss.getSheetByName('BASES');
  var resultadoBases = hojaBases ? upsertPorClave_(hojaBases, ['base_id'], SEED_BASES_) : vacio;

  var hojaMapeo = ss.getSheetByName('MAPEO');
  var resultadoMapeo = hojaMapeo ? upsertPorClave_(hojaMapeo, ['base_id', 'solapa', 'campo_logico'], SEED_MAPEO_) : vacio;

  var hojaConfig = ss.getSheetByName('CONFIG');
  var resultadoConfig = hojaConfig ? seedConfigConfig_(hojaConfig) : vacio;

  // Paso 2.11 Parte A: INFORMES y PERIODOS son config durable (como BASES/MAPEO),
  // así que se aplican con el mismo upsertPorClave_. CAMPANAS y REUNIONES no —
  // ver la nota de SEED_CAMPANAS_EJEMPLO_ más arriba.
  var hojaInformes = ss.getSheetByName('INFORMES');
  var resultadoInformes = hojaInformes ? upsertPorClave_(hojaInformes, ['informe_id'], SEED_INFORMES_) : vacio;

  var hojaPeriodos = ss.getSheetByName('PERIODOS');
  var resultadoPeriodos = hojaPeriodos ? upsertPorClave_(hojaPeriodos, ['periodo_id'], SEED_PERIODOS_) : vacio;

  var pendientes = SEED_MAPEO_
    .filter(function (fila) { return !fila.columna; })
    .map(function (fila) { return fila.base_id + '/' + fila.campo_logico; });

  var resumen =
    'BASES — nuevas: ' + resultadoBases.escritas + ', actualizadas: ' + resultadoBases.actualizadas + '\n' +
    'MAPEO — nuevas: ' + resultadoMapeo.escritas + ', actualizadas: ' + resultadoMapeo.actualizadas + '\n' +
    'CONFIG — nuevas: ' + resultadoConfig.escritas + ', completadas: ' + resultadoConfig.actualizadas + '\n' +
    'INFORMES — nuevas: ' + resultadoInformes.escritas + ', actualizadas: ' + resultadoInformes.actualizadas + '\n' +
    'PERIODOS — nuevas: ' + resultadoPeriodos.escritas + ', actualizadas: ' + resultadoPeriodos.actualizadas +
    (pendientes.length
      ? '\n\n⚠️ Pendientes de confirmar columna en MAPEO: ' + pendientes.join(', ')
      : '');

  SpreadsheetApp.getUi().alert('Config inicial cargada', resumen, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Upsert genérico por clave compuesta: si ya hay una fila con esa clave la
 * actualiza en el lugar; si no, la agrega al final. No toca ni borra filas
 * cuya clave no está en `filaObjetos` (respeta lo que haya cargado el usuario).
 */
function upsertPorClave_(hoja, clavesNombres, filaObjetos) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var indices = {};
  headers.forEach(function (h, i) { indices[h] = i; });

  function claveDeFila(fila) {
    return clavesNombres.map(function (k) { return fila[indices[k]]; }).join('||');
  }
  function claveDeObjeto(obj) {
    return clavesNombres.map(function (k) { return obj[k]; }).join('||');
  }

  var filaPorClave = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = claveDeFila(datos[f]);
    if (clave) filaPorClave[clave] = f + 1; // número de fila real en la hoja (1-based)
  }

  var escritas = 0;
  var actualizadas = 0;

  filaObjetos.forEach(function (obj) {
    var clave = claveDeObjeto(obj);
    var valores = headers.map(function (h) { return (h in obj) ? obj[h] : ''; });

    if (filaPorClave[clave]) {
      hoja.getRange(filaPorClave[clave], 1, 1, headers.length).setValues([valores]);
      actualizadas++;
    } else {
      hoja.appendRow(valores);
      filaPorClave[clave] = hoja.getLastRow();
      escritas++;
    }
  });

  return { escritas: escritas, actualizadas: actualizadas };
}

/**
 * Paso 1.6 — registrar plantillas desde la carpeta de Drive.
 * Ver docs/Prompts/Paso-1.6.md y docs/Prompts/Paso-1.6-v2.md.
 * El folderId sale de CONFIG.carpeta_plantillas (leerConfig()), no de una
 * constante: agregar una base/carpeta no debe pedir clasp push.
 */

// Matcheo nombre de Slides -> informe_id. El primero que matchee gana, así que
// SECCO va antes de JM (un nombre con ambas palabras cae en SECCO).
var MATCHEO_PLANTILLAS_ = [
  { patron: /SECCO/i, informeId: 'secco' },
  { patron: /JM/i, informeId: 'jm' }
];

function matchearInformeId_(nombreArchivo) {
  for (var i = 0; i < MATCHEO_PLANTILLAS_.length; i++) {
    if (MATCHEO_PLANTILLAS_[i].patron.test(nombreArchivo)) {
      return MATCHEO_PLANTILLAS_[i].informeId;
    }
  }
  return null;
}

// Profundidad máxima de recorrido de subcarpetas (getFilesByType no es
// recursivo; las plantillas a veces terminan en una subcarpeta al compartir
// entre las dos cuentas).
var PROFUNDIDAD_MAX_PLANTILLAS_ = 2;

// MIME de acceso directo de Drive: no tiene constante en el enum MimeType.
var MIME_SHORTCUT_ = 'application/vnd.google-apps.shortcut';

function registrarPlantillasDesdeCarpeta(folderId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaInformes = ss.getSheetByName('INFORMES');
  if (!hojaInformes) {
    return { ok: false, motivo: 'La hoja INFORMES no existe. Corré "Instalar / reparar hojas" primero.' };
  }

  var carpeta;
  try {
    carpeta = DriveApp.getFolderById(folderId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la carpeta "' + folderId + '": ' + e.message };
  }

  var datos = hojaInformes.getDataRange().getValues();
  var headers = datos[0];
  var idxInformeId = headers.indexOf('informe_id');
  var idxPlantillaId = headers.indexOf('plantilla_id');

  var filaPorInformeId = {};
  for (var f = 1; f < datos.length; f++) {
    var id = datos[f][idxInformeId];
    if (id) filaPorInformeId[id] = f + 1;
  }

  var resultado = {
    ok: true,
    asignados: [],
    sinInforme: [],
    sinAsignar: [],
    pptxSinConvertir: [],
    accesosDirectos: [],
    conflictos: [],
    totalArchivosVistos: 0
  };

  recorrerCarpetaPlantillas_(carpeta, 0, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);

  return resultado;
}

function recorrerCarpetaPlantillas_(carpeta, profundidad, filaPorInformeId, hojaInformes, idxPlantillaId, resultado) {
  var archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    var archivo = archivos.next();
    resultado.totalArchivosVistos++;
    clasificarArchivoPlantilla_(archivo, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);
  }

  if (profundidad < PROFUNDIDAD_MAX_PLANTILLAS_) {
    var subcarpetas = carpeta.getFolders();
    while (subcarpetas.hasNext()) {
      recorrerCarpetaPlantillas_(subcarpetas.next(), profundidad + 1, filaPorInformeId, hojaInformes, idxPlantillaId, resultado);
    }
  }
}

function clasificarArchivoPlantilla_(archivo, filaPorInformeId, hojaInformes, idxPlantillaId, resultado) {
  var nombre = archivo.getName();
  var mime = archivo.getMimeType();

  if (mime === MimeType.MICROSOFT_POWERPOINT) {
    resultado.pptxSinConvertir.push(nombre);
    return;
  }
  if (mime === MIME_SHORTCUT_) {
    resultado.accesosDirectos.push(nombre);
    return;
  }
  if (mime !== MimeType.GOOGLE_SLIDES) {
    return; // cualquier otro tipo: ignorar en silencio
  }

  var informeId = matchearInformeId_(nombre);
  if (!informeId) {
    resultado.sinAsignar.push(nombre);
    return;
  }

  var filaNum = filaPorInformeId[informeId];
  if (!filaNum) {
    resultado.sinInforme.push(informeId + ' (' + nombre + ')');
    return;
  }

  var idActual = hojaInformes.getRange(filaNum, idxPlantillaId + 1).getValue();
  if (idActual && idActual !== archivo.getId()) {
    resultado.conflictos.push(informeId + ' — ya tiene "' + idActual + '", se encontró "' + archivo.getId() + '" (' + nombre + ')');
    return;
  }

  hojaInformes.getRange(filaNum, idxPlantillaId + 1).setValue(archivo.getId());
  resultado.asignados.push({ informeId: informeId, nombre: nombre, plantillaId: archivo.getId() });
}

/**
 * Paso 1.6 v2 (Parte B) — diagnóstico de la carpeta de plantillas.
 * `getFilesByType(GOOGLE_SLIDES)` falla en silencio si hay .pptx sin convertir,
 * accesos directos, o si las plantillas están en una subcarpeta. Este helper
 * recorre TODO (sin filtrar por tipo) para ver qué hay realmente antes de
 * intentar registrar.
 */
function diagnosticarCarpetaPlantillas_(folderId) {
  var carpeta;
  try {
    carpeta = DriveApp.getFolderById(folderId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la carpeta "' + folderId + '": ' + e.message };
  }

  var archivos = [];
  var iterArchivos = carpeta.getFiles();
  while (iterArchivos.hasNext()) {
    var archivo = iterArchivos.next();
    archivos.push(archivo.getName() + ' · ' + archivo.getMimeType() + ' · ' + archivo.getId());
  }

  var subcarpetas = [];
  var iterCarpetas = carpeta.getFolders();
  while (iterCarpetas.hasNext()) {
    var sub = iterCarpetas.next();
    subcarpetas.push(sub.getName() + ' · ' + sub.getId());
  }

  return { ok: true, nombreCarpeta: carpeta.getName(), archivos: archivos, subcarpetas: subcarpetas };
}

function menuDiagnosticarCarpetaPlantillas_() {
  var ui = SpreadsheetApp.getUi();
  var folderId = leerConfig().carpeta_plantillas;

  if (!folderId) {
    ui.alert('Falta configuración', 'Cargá "carpeta_plantillas" en CONFIG antes de diagnosticar.', ui.ButtonSet.OK);
    return;
  }

  var resultado = diagnosticarCarpetaPlantillas_(folderId);
  if (!resultado.ok) {
    ui.alert('No se pudo diagnosticar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = ['Carpeta: ' + resultado.nombreCarpeta, ''];
  lineas.push('Archivos (' + resultado.archivos.length + '):');
  lineas = lineas.concat(resultado.archivos.length ? resultado.archivos : ['(ninguno)']);
  lineas.push('');
  lineas.push('Subcarpetas (' + resultado.subcarpetas.length + '):');
  lineas = lineas.concat(resultado.subcarpetas.length ? resultado.subcarpetas : ['(ninguna)']);

  ui.alert('Diagnóstico de carpeta de plantillas', lineas.join('\n'), ui.ButtonSet.OK);
}

function menuRegistrarPlantillas_() {
  var ui = SpreadsheetApp.getUi();
  var folderId = leerConfig().carpeta_plantillas;

  if (!folderId) {
    ui.alert('Falta configuración', 'Cargá "carpeta_plantillas" en CONFIG antes de registrar plantillas.', ui.ButtonSet.OK);
    return;
  }

  var resultado = registrarPlantillasDesdeCarpeta(folderId);

  if (!resultado.ok) {
    ui.alert('No se pudo registrar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  if (resultado.totalArchivosVistos === 0) {
    ui.alert('Plantillas registradas', 'La carpeta está vacía o el robot no ve su contenido.', ui.ButtonSet.OK);
    return;
  }

  var lineas = [];
  resultado.asignados.forEach(function (item) {
    lineas.push('✅ ' + item.informeId + ' ← ' + item.nombre);
  });
  resultado.pptxSinConvertir.forEach(function (nombre) {
    lineas.push('⚠ ' + nombre + ' es .pptx — convertir a Google Slides nativo (Drive → Abrir con Presentaciones de Google → Archivo → Guardar como Presentaciones de Google)');
  });
  resultado.accesosDirectos.forEach(function (nombre) {
    lineas.push('⚠ ' + nombre + ' es un acceso directo — poner el archivo real en la carpeta o compartirlo directo con el robot');
  });
  resultado.conflictos.forEach(function (item) {
    lineas.push('⚠ conflicto de ID en ' + item);
  });
  resultado.sinAsignar.forEach(function (nombre) {
    lineas.push('— Sin match de nombre: ' + nombre);
  });
  resultado.sinInforme.forEach(function (item) {
    lineas.push('— Sin fila en INFORMES para: ' + item);
  });

  var resumen = lineas.length ? lineas.join('\n') : 'No se encontraron Slides, .pptx ni accesos directos en la carpeta.';
  ui.alert('Plantillas registradas', resumen, ui.ButtonSet.OK);
}

/**
 * CONFIG es distinto: solo completa claves ausentes o vacías, nunca pisa un
 * valor que el usuario ya haya cargado a mano.
 */
function seedConfigConfig_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxClave = headers.indexOf('clave');
  var idxValor = headers.indexOf('valor');

  var filaPorClave = {};
  for (var f = 1; f < datos.length; f++) {
    var clave = datos[f][idxClave];
    if (clave) filaPorClave[clave] = f + 1;
  }

  var escritas = 0;
  var actualizadas = 0;

  Object.keys(SEED_CONFIG_DEFAULTS_).forEach(function (clave) {
    var valorDefault = SEED_CONFIG_DEFAULTS_[clave];
    var fila = filaPorClave[clave];

    if (!fila) {
      hoja.appendRow([clave, valorDefault]);
      escritas++;
      return;
    }

    var valorActual = hoja.getRange(fila, idxValor + 1).getValue();
    if ((valorActual === '' || valorActual === null) && valorDefault !== '') {
      hoja.getRange(fila, idxValor + 1).setValue(valorDefault);
      actualizadas++;
    }
  });

  return { escritas: escritas, actualizadas: actualizadas };
}

/**
 * Paso 2.9G v2 — árbol de `SECCIONES`, verificado contra tres informes
 * publicados (docs/SECCIONES.md). `laminas` NO es una columna: cuántas
 * láminas salen es el resultado de qué sub-secciones se activaron, no un dato
 * de configuración fijo.
 * `estado`: `activa` (el motor la emite) / `manual` (existe en informes
 * reales, hoy la llena una persona) / `revisar` (registrada, atributo sin
 * confirmar). Regla dura: ninguna fila con `estado` distinto de `activa`
 * puede tener `falta` vacío.
 */
function filaSeccion_(datos) {
  return {
    seccion_id: datos.id,
    padre: datos.padre || '',
    orden: datos.orden,
    nombre: datos.nombre,
    informes: datos.informes,
    modo: datos.modo,
    itera_sobre: datos.itera || '',
    filtro: datos.filtro || '',
    opcional: datos.opcional || 'no',
    condicion: datos.condicion || '',
    familia_tokens: datos.familia || '',
    estado: datos.estado || 'activa',
    falta: datos.falta || '',
    notas: datos.notas || ''
  };
}

var SEED_SECCIONES_ = [
  // Primer nivel
  filaSeccion_({ id: 'portada', orden: 1, nombre: 'Portada', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'indice', orden: 2, nombre: 'Índice', informes: 'SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'resumen_ejecutivo', orden: 3, nombre: 'Resumen Ejecutivo', informes: 'JM', modo: 'repetible', itera: 'entidad (JM / GCBA)', estado: 'manual', falta: 'es redacción, no dato' }),
  filaSeccion_({ id: 'analisis_comparativo', orden: 4, nombre: 'Análisis comparativo Imagen (interanual)', informes: 'SECCO', modo: 'repetible', itera: 'red social', estado: 'manual', falta: 'sin marcar en la plantilla; fuente de la serie interanual' }),
  filaSeccion_({ id: 'semana_jm_conversacion', orden: 5, nombre: 'Semana JM — conversación X', informes: 'SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'miba', orden: 6, nombre: 'Integración MiBA', informes: 'SECCO', modo: 'unica', estado: 'manual', falta: 'fuente sin definir en el motor; el bloque ya se publica lleno a mano' }),
  filaSeccion_({ id: 'portada_digital_directa', orden: 7, nombre: 'Portada Digital/Directa', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'encuentro', orden: 8, nombre: 'Bloque de encuentro', informes: 'JM,SECCO', modo: 'repetible', itera: 'REUNIONES', familia: 'ecv_,enc_' }),
  filaSeccion_({ id: 'comunicaciones_post', orden: 9, nombre: 'Comunicaciones post', informes: 'JM,SECCO', modo: 'repetible', itera: 'REUNIONES', filtro: 'etapa=post', familia: 'post_' }),
  filaSeccion_({ id: 'impacto_comunicacional', orden: 10, nombre: 'Semana JM — Impacto comunicacional', informes: 'SECCO', modo: 'unica', estado: 'manual', falta: 'sin marcar en la plantilla' }),
  filaSeccion_({ id: 'ministros', orden: 11, nombre: 'Encuentros de ministros', informes: 'SECCO', modo: 'agregado', familia: 'emin_' }),
  filaSeccion_({ id: 'm2', orden: 12, nombre: 'M2', informes: 'JM,SECCO', modo: 'agregado', familia: 'm2_' }),
  filaSeccion_({ id: 'campana', orden: 13, nombre: 'Campaña destacada', informes: 'JM,SECCO', modo: 'repetible', itera: 'CAMPANAS', familia: 'camp_' }),
  filaSeccion_({ id: 'nuevos_proveedores', orden: 14, nombre: 'Nuevos Proveedores', informes: 'SECCO', modo: 'repetible', itera: 'proveedor', estado: 'manual', falta: 'sin marcar; falta base de Uber / Twitch / Mercado Libre' }),
  filaSeccion_({ id: 'analisis_tematico', orden: 15, nombre: 'Análisis temático ad-hoc', informes: 'SECCO', modo: 'repetible', itera: 'tema', estado: 'manual', falta: 'ad-hoc por tema, puede no ser automatizable' }),
  filaSeccion_({ id: 'otros_temas', orden: 16, nombre: 'Otros temas', informes: 'SECCO', modo: 'unica', estado: 'manual', falta: 'sin marcar en la plantilla' }),
  filaSeccion_({ id: 'cierre', orden: 17, nombre: 'Cierre', informes: 'JM,SECCO', modo: 'unica' }),

  // Hijos de 'campana' — largo variable (3 a 21 láminas según canales usados,
  // docs/SECCIONES.md Corrección 1).
  filaSeccion_({ id: 'campana_portada', padre: 'campana', orden: 1, nombre: 'Campaña — portada', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'campana_objetivo', padre: 'campana', orden: 2, nombre: 'Campaña — objetivo y período', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'campana_herramientas', padre: 'campana', orden: 3, nombre: 'Campaña — herramientas y audiencias', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'campana_formatos', padre: 'campana', orden: 4, nombre: 'Campaña — formatos digitales implementados', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'hubo piezas digitales', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_agregados', padre: 'campana', orden: 5, nombre: 'Campaña — resultados agregados', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'ya hay resultados', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_audiencia', padre: 'campana', orden: 6, nombre: 'Campaña — por audiencia', informes: 'JM,SECCO', modo: 'repetible', itera: 'AUDIENCIAS', opcional: 'sí', condicion: 'la campaña se segmenta por audiencia', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_desag_digital', padre: 'campana', orden: 7, nombre: 'Campaña — desagregados Digital', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'hubo digital', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_desag_mail', padre: 'campana', orden: 8, nombre: 'Campaña — desagregados Directa: envío de mail', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'hubo mail', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'campana_desag_respuestas', padre: 'campana', orden: 9, nombre: 'Campaña — desagregados Directa: respuestas', informes: 'JM,SECCO', modo: 'repetible', itera: 'remitente (JM / GCBA)', opcional: 'sí', condicion: 'hubo respuestas', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),

  // Hijos de 'campana_audiencia' — Grandes Generadores (21 láminas) repite por
  // audiencia, no por campaña (docs/SECCIONES.md Corrección 2).
  filaSeccion_({ id: 'aud_formatos', padre: 'campana_audiencia', orden: 1, nombre: 'Audiencia — formatos y resultados', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'la audiencia usó formatos digitales', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'aud_directa', padre: 'campana_audiencia', orden: 2, nombre: 'Audiencia — directa', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'la audiencia recibió directa', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'aud_contacto_ciudadano', padre: 'campana_audiencia', orden: 3, nombre: 'Audiencia — contacto ciudadano', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'la audiencia tuvo call center', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),

  // Hijos de 'encuentro' — ni siquiera dos Uno a uno tienen la misma cantidad
  // de láminas (docs/SECCIONES.md Corrección 6).
  filaSeccion_({ id: 'encuentro_portada', padre: 'encuentro', orden: 1, nombre: 'Encuentro — portada', informes: 'JM,SECCO', modo: 'unica' }),
  filaSeccion_({ id: 'encuentro_estrategia', padre: 'encuentro', orden: 2, nombre: 'Encuentro — estrategia', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'el tipo de encuentro tiene bloque de estrategia (temático/uno a uno)', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),
  filaSeccion_({ id: 'encuentro_iceberg', padre: 'encuentro', orden: 3, nombre: 'Encuentro — iceberg', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'el encuentro tiene datos de convocatoria por canal', familia: 'enc_', estado: 'revisar', falta: 'ecv_* se usa para ECV y para Uno a uno — definir si es genérico' }),
  filaSeccion_({ id: 'encuentro_resultados', padre: 'encuentro', orden: 4, nombre: 'Encuentro — resultados', informes: 'JM,SECCO', modo: 'unica', opcional: 'sí', condicion: 'hay resultados post-encuentro', estado: 'revisar', falta: 'condición de activación inferida de 3 informes' }),

  // Hijos de 'm2' — Status semanal + Caudal semanal (2-3 láminas).
  filaSeccion_({ id: 'm2_status', padre: 'm2', orden: 1, nombre: 'M2 — status semanal', informes: 'JM,SECCO', modo: 'unica', familia: 'm2_' }),
  filaSeccion_({ id: 'm2_caudal', padre: 'm2', orden: 2, nombre: 'M2 — caudal semanal', informes: 'SECCO', modo: 'unica', familia: 'm2_' })
];

/**
 * Siembra `SEED_SECCIONES_` — SOLO agrega filas de `seccion_id` que todavía no
 * existen. A diferencia de `upsertPorClave_` (BASES/MAPEO), esta siembra NUNCA
 * pisa una fila existente, sea `manual`, `revisar` o lo que sea: no hay columna
 * `origen` en `SECCIONES` para distinguir "lo escribió la siembra" de "lo tocó
 * una persona", así que la regla simple y segura es "solo agregar lo que
 * falta". Correr `instalar()` dos veces no duplica ni pisa nada (Paso 2.9G,
 * test de aceptación).
 */
function sembrarSecciones_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxId = headers.indexOf('seccion_id');
  if (idxId === -1) return 0;

  var existentes = {};
  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxId]) existentes[datos[f][idxId]] = true;
  }

  var nuevas = SEED_SECCIONES_.filter(function (s) { return !existentes[s.seccion_id]; });
  if (!nuevas.length) return 0;

  var filas = nuevas.map(function (s) { return headers.map(function (h) { return (h in s) ? s[h] : ''; }); });
  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
  return filas.length;
}

function menuSembrarSecciones_() {
  var ui = SpreadsheetApp.getUi();
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SECCIONES');
  if (!hoja) {
    ui.alert('No se pudo sembrar', 'La hoja SECCIONES no existe. Corré "Instalar / reparar hojas" primero.', ui.ButtonSet.OK);
    return;
  }
  var agregadas = sembrarSecciones_(hoja);
  ui.alert('Secciones sembradas', 'Filas nuevas agregadas: ' + agregadas + ' (las existentes no se tocaron).', ui.ButtonSet.OK);
}
