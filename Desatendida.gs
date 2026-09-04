/**
 * `Desatendida.gs` — la corrida que se reanuda sola.
 * (`docs/Prompts/2026-08-20_10_corrida_desatendida.md` `v2` + `2026-08-20_10.1`, 20/08/2026)
 *
 * Una corrida que no entra en seis minutos **termina sola**, en varias ejecuciones, sin que nadie
 * apriete nada. Tres piezas que se sostienen entre sí:
 *
 *   1. **La unidad de trabajo es la sección**, y el estado es *qué secciones faltan* — una lista
 *      corta y, sobre todo, **legible**.
 *   2. **El deck es el checkpoint.** La ejecución siguiente escribe sobre el mismo deck.
 *      ⚠ **Los crudos NO dicen qué falta** — lo dice el plan. Los crudos sólo garantizan que
 *      **repintar es inocuo**. La diferencia está medida: `mapaTokenObjectId_` excluye a propósito
 *      los tokens de láminas escondidas, así que las láminas 12, 21 y 29 dejan **49 crudos
 *      permanentes**. Una reanudación guiada por los crudos **no terminaría nunca**.
 *   3. **Lo caro se persiste y se reusa dentro de la misma corrida** — y ahora se sabe cuánto vale:
 *      el arranque (anclaje + unión digital) cuesta **70–80 s por ejecución**. Con tres
 *      ejecuciones son 210 s, casi una corrida entera. **No es una optimización: es lo que hace
 *      que el mecanismo rinda.**
 *
 * ⭐ **Y la corrección del `10.1`, con el número medido el 20/08: el planificador cuenta
 * ASIGNACIONES, no secciones.** Una asignación es **un ítem × una lámina modelo**, que es lo que
 * el bucle del presupuesto realmente recorre (`Generador.gs`, `expansion.asignaciones`). Medido:
 * **16 ítems lógicos → 36 asignaciones**, o sea 2,25 láminas modelo por ítem. Contar secciones o
 * contar ítems da el número equivocado, y el error es de más del doble.
 */

/** Nombre de la hoja del plan. No es hoja de registro: es operativa, como `CORRIDAS`. */
var HOJA_PLAN_ = 'PLAN_CORRIDA';

var TOPE_CONTINUACIONES_DEFECTO_ = 6;

function topeContinuaciones_() {
  var v = Number(leerConfig().tope_continuaciones);
  return (isNaN(v) || v <= 0) ? TOPE_CONTINUACIONES_DEFECTO_ : v;
}

/**
 * ⭐ **El planificador. Puro y sin planilla** — por eso se puede probar sin generar nada.
 *
 * Elige qué secciones pendientes entran en el presupuesto de **esta** ejecución, contando
 * **asignaciones** y descontando el costo fijo de arranque.
 *
 * Devuelve `{ secciones, asignaciones, motivo, no_entra_sola }`.
 *
 * ⚠ **`no_entra_sola` es la salida que el `10.1` agrega, y existe para que un diagnóstico no se
 * disfrace de otro.** Si la primera sección pendiente **por sí sola** no entra en el presupuesto
 * útil, el plan **no converge nunca**: cada ejecución la toma, no la termina, no la puede marcar
 * `hecha`, y la siguiente vuelve a empezarla. La guarda de progreso la corta —bien— pero diría
 * *«no avanza»* cuando la verdad es *«la unidad de trabajo es demasiado grande»*. **Son dos
 * arreglos distintos** y el reporte tiene que poder nombrarlos distinto.
 *
 * **Al 20/08 ninguna sección lo necesita**, y el número dice cuánto falta: con ~270 s útiles y
 * ~5,7 s por asignación entran **~47 asignaciones**, y `encuentro` —la más grande— tiene 27 con 12
 * encuentros. **El umbral está en ~22 encuentros**, que es una semana cargada. Por eso el chunk
 * por asignación **no se implementa** (punto 3 del `10.1`) pero **sí se detecta**: el día que pase,
 * el diagnóstico está a mano en vez de descubrirse consumiendo los 90 minutos diarios.
 */
function planificarChunk_(pendientes, presupuestoUtilSeg, segPorAsignacion) {
  var elegidas = [];
  var total = 0;
  var costo = (segPorAsignacion > 0) ? segPorAsignacion : 6;

  for (var i = 0; i < pendientes.length; i++) {
    var s = pendientes[i];
    var suyas = Number(s.asignaciones) || 0;
    var loQueCostaria = (total + suyas) * costo;

    if (loQueCostaria <= presupuestoUtilSeg) {
      elegidas.push(s.seccion_id);
      total += suyas;
      continue;
    }

    // No entra. Si es la PRIMERA y va sola, el plan no converge: hay que decirlo con ese nombre.
    if (!elegidas.length) {
      return {
        secciones: [],
        asignaciones: 0,
        no_entra_sola: s.seccion_id,
        motivo: 'la sección "' + s.seccion_id + '" tiene ' + suyas + ' asignación(es) — ' +
          Math.round(suyas * costo) + ' s estimados — y el presupuesto útil de una ejecución es ' +
          Math.round(presupuestoUtilSeg) + ' s. **No entra sola, así que el plan no converge.** ' +
          'No es "no avanza": es que la unidad de trabajo es más grande que la ejecución. ' +
          'Lo destraba partir esta sección por asignación (`2026-08-20_10.1` punto 2).'
      };
    }
    break;   // entró algo; lo que sobra va a la ejecución siguiente
  }

  return {
    secciones: elegidas,
    asignaciones: total,
    no_entra_sola: '',
    motivo: elegidas.length
      ? elegidas.length + ' sección(es) · ' + total + ' asignación(es) · ~' +
        Math.round(total * costo) + ' s de ' + Math.round(presupuestoUtilSeg) + ' disponibles'
      : 'no quedan secciones pendientes'
  };
}

/**
 * Las secciones de un informe con **cuántas asignaciones** produce cada una, medido y no estimado.
 *
 * ⚠ **Se calcula sin expandir**: `itemsDeSeccion_` da los ítems y `slidesModeloDe_` las láminas
 * modelo, y la asignación es el producto. Expandir para contar sería hacer el trabajo dos veces —
 * y peor, dejaría el deck a medio expandir si el conteo falla.
 */
function asignacionesPorSeccion_(presentacion, informeId, ventana) {
  var filas = [];
  /* ⭐ `2026-08-21_11` Parte C — **el conteo sale de `LAMINAS` y del filtro por ítem, no de
   * `items × modelos`.**
   *
   * ⚠ **Con `LAMINAS.filtro` el producto DEJÓ DE SER CIERTO**, y era exactamente el modo de falla
   * que el `2026-08-20_10.1` documenta: *"un planificador que cuenta la unidad equivocada se
   * equivoca por más del doble, y el síntoma es una corrida que corta cuando el plan decía que
   * entraba"*. Ahora **no todos los ítems llevan las mismas láminas**: en `jm`, un "Uno a uno"
   * copia la portada y `L-053`, y un temático la portada y el iceberg — dos cada uno, pero el día
   * que una condición no sea simétrica el producto miente. **Se cuenta sumando, no multiplicando.** */
  var indice = indiceDeLaminasPorAncla_(presentacion);
  var regL = leerLaminas_();
  var filasLaminas = regL.ok ? regL.filas : [];

  seccionesRepetiblesDe_(informeId, filasLaminas).forEach(function (seccion) {
    var r = itemsDeSeccion_(seccion, informeId, ventana);
    var items = (r && r.ok) ? r.items : [];
    var deLamina = laminasDeSeccion_(filasLaminas, informeId, seccion.seccion_id, indice);

    var asignaciones = 0;
    items.forEach(function (item) {
      deLamina.conSlide.forEach(function (l) {
        if (laminaEntraParaItem_(l, item).entra) asignaciones++;
      });
    });

    filas.push({
      seccion_id: seccion.seccion_id,
      items: items.length,
      modelos: deLamina.conSlide.length,
      asignaciones: asignaciones,
      motivo: (r && r.ok) ? '' : ((r && r.motivo) || 'no se pudieron listar los ítems')
    });
  });
  return filas;
}

/* ═══════════════════ El plan: una hoja, no una propiedad ═══════════════════
 *
 * ⭐ **Va a una hoja y no a `PropertiesService` a propósito.** El estado de una corrida desatendida
 * tiene que poder **mirarse mientras corre**, y una propiedad serializada no se mira. Los 9 KB por
 * propiedad alcanzarían de sobra: **la legibilidad es la razón, no el tamaño.**
 */

function hojaPlan_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(HOJA_PLAN_);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_PLAN_);
    hoja.getRange(1, 1, 1, 7).setValues([[
      'corrida_id', 'informe_id', 'seccion_id', 'asignaciones', 'estado', 'ejecucion', 'segundos'
    ]]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function leerPlan_(corridaId) {
  var datos = hojaPlan_().getDataRange().getValues();
  var h = datos[0];
  var filas = [];
  for (var i = 1; i < datos.length; i++) {
    var o = {};
    h.forEach(function (c, j) { o[c] = datos[i][j]; });
    o._fila = i + 1;
    if (String(o.corrida_id).trim() === String(corridaId).trim()) filas.push(o);
  }
  return filas;
}

/**
 * ⭐ `2026-08-21_19` Parte B — **la última corrida que dejó plan, para que la pantalla no quede
 * ciega cuando la corrida termina.**
 *
 * El estado en `PropertiesService` se borra en los cinco caminos de salida —y está bien: es lo
 * que declara que no hay nada corriendo—, pero con él se va el `corrida_id`, que es la clave de
 * `leerPlan_`. Sin esto, **la pantalla muestra el avance mientras corre y se queda muda justo
 * cuando terminó**, que es el momento en que alguien la abre a mirar.
 *
 * `PLAN_CORRIDA` no se borra nunca, así que la respuesta ya está en la hoja: es el `corrida_id`
 * de la última fila. **No se agrega ningún escritor** — es la salida barata frente a guardar una
 * propiedad más, que habría que acordarse de mantener.
 *
 * ⚠ **Es la última por ORDEN DE ESCRITURA, no por fecha**, porque la hoja no tiene fecha.
 * `escribirPlan_` hace append, así que las dos coinciden mientras nadie ordene la hoja a mano.
 * Si alguien la ordena, esto devuelve otra corrida y **no falla** — el modo de siempre.
 */
function ultimaCorridaDelPlan_() {
  var datos = hojaPlan_().getDataRange().getValues();
  var h = datos[0];
  var iC = h.indexOf('corrida_id');
  if (iC < 0) return '';
  for (var i = datos.length - 1; i >= 1; i--) {
    var v = String(datos[i][iC] || '').trim();
    if (v) return v;
  }
  return '';
}

function escribirPlan_(corridaId, informeId, secciones) {
  var hoja = hojaPlan_();
  var filas = secciones.map(function (s) {
    return [corridaId, informeId, s.seccion_id, s.asignaciones, 'pendiente', '', ''];
  });
  if (filas.length) {
    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, 7).setValues(filas);
  }
  SpreadsheetApp.flush();
  return filas.length;
}

/**
 * Marca una sección, **una por una y a medida que terminan**, no al final.
 * ⚠ **Una ejecución que muere no puede dejar el plan mintiendo**, y ésa es toda la razón de que
 * esto escriba de a una celda en vez de un `setValues` al cierre.
 */
function marcarSeccionPlan_(corridaId, seccionId, estado, ejecucion, segundos) {
  var hoja = hojaPlan_();
  var datos = hoja.getDataRange().getValues();
  var h = datos[0];
  var iC = h.indexOf('corrida_id'), iS = h.indexOf('seccion_id'),
      iE = h.indexOf('estado'), iJ = h.indexOf('ejecucion'), iG = h.indexOf('segundos');
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][iC]).trim() !== String(corridaId).trim()) continue;
    if (String(datos[i][iS]).trim() !== String(seccionId).trim()) continue;
    hoja.getRange(i + 1, iE + 1).setValue(estado);
    hoja.getRange(i + 1, iJ + 1).setValue(ejecucion);
    if (segundos !== undefined) hoja.getRange(i + 1, iG + 1).setValue(segundos);
    SpreadsheetApp.flush();
    return true;
  }
  return false;
}

/**
 * ⭐ **Qué secciones RESOLVIÓ esta ejecución — no cuáles expandió.**
 *
 * ⚠ **La primera versión marcaba `hecha` desde `r.repetibles.secciones`, que es
 * `expansion.reporte`: el reporte de la EXPANSIÓN.** Su `ok` significa *«se expandió bien»*, no
 * *«se resolvieron sus ítems»*. Y como la Parte A separó expandir de resolver —`solo_secciones`
 * recorta **después** de expandir— **la ejecución 1 expandía las tres secciones, resolvía cero, y
 * marcaba las tres `hecha`.**
 *
 * **El síntoma medido, deck `jm-20260820-190943`:** tres filas `hecha` en la ejecución 1 **con
 * `segundos` vacío** —porque el resolver nunca las tocó—, la ejecución 2 sin nada pendiente, y un
 * deck con **todos** los tokens crudos.
 *
 * La señal correcta es `r.repetibles.items` (`porItem`), que se llena **dentro del bucle del
 * presupuesto**, una entrada por asignación efectivamente pintada. Una sección está hecha cuando
 * **todas sus asignaciones** aparecen ahí — no algunas: una sección a medio resolver que se marque
 * `hecha` deja tokens crudos que nadie va a volver a mirar.
 */
function seccionesResueltas_(resultado, asignacionesDelChunk) {
  var pintadasPorSeccion = {};
  ((resultado.repetibles && resultado.repetibles.items) || []).forEach(function (i) {
    if (i.ok === false) return;
    pintadasPorSeccion[i.seccion] = (pintadasPorSeccion[i.seccion] || 0) + 1;
  });

  var esperadasPorSeccion = {};
  (asignacionesDelChunk || []).forEach(function (a) {
    esperadasPorSeccion[a.seccion] = (esperadasPorSeccion[a.seccion] || 0) + 1;
  });

  var completas = [], parciales = [];
  Object.keys(esperadasPorSeccion).forEach(function (id) {
    var pintadas = pintadasPorSeccion[id] || 0;
    var esperadas = esperadasPorSeccion[id];
    if (pintadas >= esperadas) completas.push({ seccion_id: id, asignaciones: pintadas });
    else parciales.push({ seccion_id: id, pintadas: pintadas, esperadas: esperadas });
  });
  return { completas: completas, parciales: parciales };
}

/**
 * ⭐ **Cierra el deck: barre los crudos y le quita el sello. Los TRES caminos de salida pasan por
 * acá** — cierre normal, cancelación y fallo.
 *
 * ⚠ **La primera versión sólo lo hacía en el cierre normal, y el deck `jm-20260820-190943` quedó
 * marcado `[en proceso]` para siempre:** la ejecución 2 encontró el plan sin pendientes, declaró
 * *«está completa»*, **borró el estado y no tocó el deck**. Después
 * `cancelarCorridaDesatendida()` dijo *«no había ninguna corrida en curso · triggers borrados: 0»*
 * — correcto, y sin nada que arreglar ya: **el estado se había borrado sin quitar el sello.**
 *
 * **Un sello que se pone en un camino y se quita en otro deja decks marcados para siempre**, y un
 * deck con sello permanente vuelve inútil la señal: si algunos terminados lo tienen, el sello deja
 * de significar «no está listo».
 *
 * `barrer` es `false` cuando el deck queda a medio hacer a propósito (cancelación): ahí los crudos
 * son lo que hay, y taparlos con `/////` sería afirmar *«nadie lo cableó»* sobre tokens que nadie
 * llegó a mirar.
 */
function cerrarDeckDesatendido_(deckId, barrer) {
  var r = { sello_quitado: false, barridos: 0, motivo: '' };
  if (!deckId) { r.motivo = 'sin deck_id'; return r; }

  try {
    if (barrer) {
      var pres = SlidesApp.openById(deckId);
      var b = barrerTokensNoAlcanzados_(pres, null, true, false);
      r.barridos = b.barridos.length;
    }
  } catch (e) {
    r.motivo = 'no se pudo barrer: ' + e.message;
  }

  try {
    var archivo = DriveApp.getFileById(deckId);
    var nombre = archivo.getName();
    if (nombre.indexOf(SELLO_EN_PROCESO_) === 0) {
      archivo.setName(nombre.slice(SELLO_EN_PROCESO_.length));
      r.sello_quitado = true;
    }
  } catch (e) {
    r.motivo = (r.motivo ? r.motivo + ' · ' : '') + 'no se pudo quitar el sello: ' + e.message;
  }
  return r;
}

/* ═══════════════════ El ciclo de una ejecución ═══════════════════ */

var FN_CONTINUACION_ = 'continuarCorridaDesatendida';

/**
 * ⚠ **Borra el trigger que disparó ESTA ejecución antes de crear el próximo.**
 * Con 20 slots compartidos por script, un huérfano por corrida agota el cupo en dos semanas.
 * Se borran **todos** los de esta función y no sólo el propio: si alguno quedó de una corrida que
 * murió sin limpiar, éste es el momento en que se nota y se limpia.
 */
function limpiarTriggersDeContinuacion_() {
  var borrados = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === FN_CONTINUACION_) {
      ScriptApp.deleteTrigger(t);
      borrados++;
    }
  });
  return borrados;
}

function crearTriggerDeContinuacion_(segundos) {
  ScriptApp.newTrigger(FN_CONTINUACION_)
    .timeBased()
    .after(Math.max(1, segundos) * 1000)
    .create();
}

/** El estado entre ejecuciones: chico, y por eso sí va a `PropertiesService`. */
function guardarEstadoCorrida_(estado) {
  PropertiesService.getScriptProperties().setProperty('corrida_desatendida', JSON.stringify(estado));
}
function leerEstadoCorrida_() {
  var s = PropertiesService.getScriptProperties().getProperty('corrida_desatendida');
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) { return null; }
}
function borrarEstadoCorrida_() {
  PropertiesService.getScriptProperties().deleteProperty('corrida_desatendida');
}

/**
 * Una ejecución del ciclo. La llaman `iniciarCorridaDesatendida_` y el trigger.
 *
 * **Las cuatro guardas, y las cuatro son obligatorias:**
 *
 *  1. ⭐ **Tope de continuaciones** (`CONFIG.tope_continuaciones`). Al llegar, **para y reporta**.
 *     Una corrida que se reanuda para siempre consume los 90 minutos diarios de runtime de
 *     triggers —cuenta consumer, verificado el 20/08— y deja al motor sin cupo el resto del día.
 *  2. ⭐ **Sin progreso, no hay continuación.** Si una ejecución no marcó **ni una** sección como
 *     hecha, la siguiente no se crea. Es la diferencia entre «tarda» y «no avanza», y sin esta
 *     guarda las dos se ven igual **hasta que se agota la cuota**.
 *  3. **Cada ejecución borra el trigger que la disparó** antes de crear el próximo.
 *  4. ⚠ **El lock.** `LockService`, y **si no lo consigue sale sin hacer nada** — dos ejecuciones
 *     escribiendo el mismo deck es el peor resultado posible de todo el mecanismo.
 *     ⭐ **Desde el `2026-08-28_2` C pasa por `tomarLockDeCorrida_`** (`Generador.gs`) en vez de
 *     pedirle el lock a `LockService` acá. No es cosmética: `generarInforme` ahora **también** lo
 *     toma, así que sin el par re-entrante esta ejecución se bloquearía a sí misma al llamarlo.
 *     Y el timeout deja de estar escrito en dos lugares que pueden separarse.
 */
function correrUnaEjecucion_() {
  var lock = tomarLockDeCorrida_();
  if (!lock.ok) {
    Logger.log('Otra ejecución tiene el lock. Salgo sin escribir nada — dos ejecuciones sobre el ' +
      'mismo deck es el peor resultado posible. · ' + lock.motivo);
    return { ok: false, motivo: 'lock ocupado' };
  }

  try {
    var estado = leerEstadoCorrida_();
    if (!estado) {
      Logger.log('No hay corrida desatendida en curso.');
      return { ok: false, motivo: 'sin corrida en curso' };
    }

    // Guarda 3, y va PRIMERO: si algo falla más abajo, el trigger que me disparó ya no está.
    limpiarTriggersDeContinuacion_();

    // Guarda 1 · el tope.
    var tope = topeContinuaciones_();
    if (estado.ejecucion >= tope) {
      Logger.log('TOPE DE CONTINUACIONES (' + tope + ') alcanzado. La corrida ' +
        estado.corrida_id + ' PARA acá y NO se reanuda.');
      Logger.log('   Quedan pendientes: ' + leerPlan_(estado.corrida_id)
        .filter(function (f) { return String(f.estado).trim() === 'pendiente'; })
        .map(function (f) { return f.seccion_id; }).join(', '));
      Logger.log('   El deck conserva el sello de en-proceso: NO está terminado.');
      borrarEstadoCorrida_();
      return { ok: false, motivo: 'tope de continuaciones' };
    }

    var plan = leerPlan_(estado.corrida_id);
    var pendientes = plan.filter(function (f) { return String(f.estado).trim() === 'pendiente'; });
    if (!pendientes.length) {
      /* ⭐ **El invariante: si la ejecución anterior se CORTÓ, tiene que quedar al menos una
       * pendiente.** Corte significa *«no terminé»*; cero pendientes significa *«terminé»*. Las dos
       * cosas a la vez son imposibles, y esa contradicción **es el síntoma de que el marcado está
       * mal** — que es exactamente lo que pasó con `jm-20260820-190943`, donde se marcaron tres
       * secciones `hecha` sin resolver ninguna.
       *
       * ⚠ **Va acá y no en una revisión humana porque no hay tiempo humano:** entre el corte y la
       * continuación pasa **un minuto**. Cualquier guarda que dependa de que alguien mire el plan
       * y cancele **no llega**. Éste y la verificación del cierre son las únicas defensas, y por
       * eso van las dos. */
      if (estado.se_corto) {
        Logger.log('⛔ INVARIANTE ROTO: la ejecución anterior se CORTÓ y el plan no tiene ninguna');
        Logger.log('   sección pendiente. Las dos cosas no pueden ser ciertas a la vez.');
        Logger.log('   Significa que algo marcó `hecha` una sección que no se resolvió.');
        Logger.log('   NO se cierra el deck ni se le quita el sello: queda como está, para mirarlo.');
        borrarEstadoCorrida_();
        return { ok: false, motivo: 'invariante roto: corte con cero pendientes', deck_id: estado.deck_id };
      }

      // Cierre normal: se barre y se quita el sello. **Verificado, no supuesto.**
      var cierre = cerrarDeckDesatendido_(estado.deck_id, true);
      Logger.log('No quedan secciones pendientes. La corrida ' + estado.corrida_id + ' está completa.');
      Logger.log('   barridos: ' + cierre.barridos + ' · sello quitado: ' + cierre.sello_quitado +
        (cierre.motivo ? ' · ⚠ ' + cierre.motivo : ''));
      if (!cierre.sello_quitado) {
        Logger.log('   ⛔ EL SELLO SIGUE PUESTO. El deck va a quedar marcado como en proceso para');
        Logger.log('   siempre, y entonces el sello deja de significar nada. Revisar el deck.');
      }
      borrarEstadoCorrida_();
      return { ok: true, terminada: true, cierre: cierre };
    }

    var ejecucion = estado.ejecucion + 1;
    var util = presupuestoCorridaSeg_() - reservaCierreSeg_() - (estado.arranque_seg || 80);
    var chunk = planificarChunk_(pendientes, util, estado.seg_por_asignacion || 6);

    Logger.log('== ejecución ' + ejecucion + '/' + tope + ' · corrida ' + estado.corrida_id + ' ==');
    Logger.log('   ' + chunk.motivo);

    // La salida del `10.1`: la sección no entra sola. Es un diagnóstico distinto de «no avanza».
    if (chunk.no_entra_sola) {
      borrarEstadoCorrida_();
      return { ok: false, motivo: 'seccion_no_entra_sola', seccion: chunk.no_entra_sola };
    }

    var r = generarInforme(estado.informe_id, estado.periodo_id || undefined, {
      deck_id: estado.deck_id,
      corrida_id: estado.corrida_id,
      // `D-41` — el número de tanda baja a `CORRIDAS.ejecucion`. Ya se calcula acá arriba para
      // el tope de continuaciones; lo unico que faltaba era que llegara a la hoja.
      ejecucion: ejecucion,
      asignaciones: estado.asignaciones,
      solo_secciones: chunk.secciones,
      continuable: true,
      faltantes_como_raya: estado.con_simbolos !== false
    });

    if (!r || !r.ok) {
      Logger.log('La ejecución falló: ' + ((r && r.motivo) || '(sin motivo)'));
      return r || { ok: false };
    }

    /* ⭐ Se marca por **resolución**, no por expansión — ver `seccionesResueltas_`. Y sólo las
     * COMPLETAS: una sección a medio resolver marcada `hecha` deja tokens crudos que nadie va a
     * volver a mirar. */
    var delChunk = (estado.asignaciones || []).filter(function (a) {
      return chunk.secciones.indexOf(a.seccion) !== -1;
    });
    var res = seccionesResueltas_(r, delChunk);

    var hechas = 0;
    res.completas.forEach(function (c) {
      if (marcarSeccionPlan_(estado.corrida_id, c.seccion_id, 'hecha', ejecucion, c.asignaciones)) hechas++;
    });
    res.parciales.forEach(function (p) {
      Logger.log('   · ' + p.seccion_id + ': ' + p.pintadas + ' de ' + p.esperadas +
        ' asignación(es) — queda PENDIENTE, no se marca hecha');
    });

    Logger.log('   secciones marcadas `hecha`: ' + hechas + ' de ' + chunk.secciones.length + ' del chunk');

    // Guarda 2 · sin progreso, no hay continuación.
    if (hechas === 0) {
      Logger.log('SIN PROGRESO: esta ejecución no marcó ni una sección. NO se crea la siguiente.');
      Logger.log('   «tarda» y «no avanza» se ven igual hasta que se agota la cuota, y ésta es la ' +
        'guarda que los separa. Mirá el plan y el reporte antes de reanudar a mano.');
      borrarEstadoCorrida_();
      return { ok: false, motivo: 'sin progreso' };
    }

    estado.ejecucion = ejecucion;
    estado.asignaciones = (r.continuacion && r.continuacion.asignaciones) || estado.asignaciones;
    // Lo que la próxima ejecución necesita para chequear el invariante `corte ⇒ pendientes ≥ 1`.
    estado.se_corto = !!r.corte;

    var quedan = leerPlan_(estado.corrida_id)
      .filter(function (f) { return String(f.estado).trim() === 'pendiente'; });

    if (quedan.length) {
      guardarEstadoCorrida_(estado);
      crearTriggerDeContinuacion_(60);
      Logger.log('Quedan ' + quedan.length + ' sección(es). Trigger creado para dentro de 1 minuto.');
      return { ok: true, continua: true, quedan: quedan.length };
    }

    borrarEstadoCorrida_();
    Logger.log('La corrida terminó en ' + ejecucion + ' ejecución(es).');
    return { ok: true, terminada: true, ejecuciones: ejecucion };

  } finally {
    soltarLockDeCorrida_(lock);
  }
}

/**
 * El handler del trigger. **Corre sin usuario delante**, con los permisos del dueño del script.
 *
 * ⚠ **Ese alcance hay que verificarlo antes de confiar en el mecanismo**, y no se puede verificar
 * desde afuera: un trigger corre como el dueño del script, y las bases son planillas **de otras
 * cuentas** compartidas con él. Si el alcance no llega, la primera continuación falla leyendo una
 * base y el plan se queda pendiente. `verificarAlcanceDesatendido()` lo prueba sin generar nada.
 */
function continuarCorridaDesatendida() {
  return correrUnaEjecucion_();
}

/* ═══════════════════ El arranque, y el freno ═══════════════════ */

/**
 * ⭐ `2026-08-21_19` Parte A — **las opciones de la corrida viajan enteras, en la misma forma que
 * `generarInforme` ya recibe.**
 *
 * Hasta hoy la ejecución 1 llamaba con `{ continuable: true }` y nada más, así que un llamador
 * que no fuera el editor **perdía lo que el usuario eligió en pantalla**: la lista de secciones
 * tildadas y el modo de faltantes. El panel arma ese objeto desde el `2026-08-19_2`; se pasa
 * entero en vez de desarmarlo y rearmarlo.
 *
 * **Por qué `opciones` y no `secciones` + `conSimbolos` sueltos** (decisión del usuario,
 * 22/08/2026): es la forma que `generarInforme` ya recibe, así que no nace una tercera firma que
 * se desincronice; y una opción nueva se propaga sin tocar la cadena.
 *
 * ⛔ **`continuable` lo pone el mecanismo, no el llamador.** Si llega en `opciones` se ignora.
 * Que el panel pueda pedir una corrida **no** continuable por el camino desatendido no tiene
 * sentido y sería una forma de romperlo desde afuera.
 *
 * ⚠ **Las cuatro claves de continuación —`deck_id`, `corrida_id`, `asignaciones`,
 * `solo_secciones`— NO se filtran, y eso es una pregunta abierta, no una decisión.** El mismo
 * argumento de `continuable` les aplica: un `deck_id` de afuera haría que la ejecución 1 escriba
 * sobre un deck ajeno. Hoy **ningún llamador las manda** —`panel_opcionesDeGeneracion_` arma tres
 * claves y ninguna es ésas—, así que el agujero es teórico; se deja nombrado para que la decisión
 * la tome quien corresponde y no una línea escrita de apuro.
 */
/**
 * Arranca una corrida desatendida. **La ejecución 1 expande TODO** —fase atómica— y resuelve lo
 * que entre; las siguientes sólo resuelven.
 *
 * ⚠ **Si ya hay una corrida en curso, NO arranca otra.** Dos corridas desatendidas a la vez se
 * pisarían el estado en `PropertiesService` y los triggers, y el lock no alcanza para eso: el lock
 * evita que dos ejecuciones escriban a la vez, no que dos corridas se confundan de deck.
 *
 * ⭐ **Y el motivo de que devuelva `ejecucion` en ese caso:** el panel tiene que poder decir
 * *"hay una corrida en curso, es ésta, va por la ejecución N"* y ofrecer la salida. Hasta hoy eso
 * sólo iba al `Logger`, que en el camino del usuario es no decir nada.
 */
function iniciarCorridaDesatendida_(informeId, periodoId, opciones) {
  /* ── `2026-08-28_2` Parte C · el lock decide la concurrencia, esta guarda NO ────────────────
   *
   * ⭐ **El lock se toma acá y no sólo adentro de `generarInforme`**, porque el arranque escribe
   * antes y después de él: `limpiarTriggersDeContinuacion_()` toca los triggers, y `escribirPlan_`
   * y `marcarSeccionPlan_` corren cuando la ejecución 1 ya volvió. Con el par re-entrante, la
   * llamada anidada lo reconoce y no se bloquea sola.
   *
   * ⛔ **Y la guarda de estado de abajo se CONSERVA, con el rol cambiado.** El addendum la trataba
   * como *«una bandera leída antes de escribir»* que el lock viene a reemplazar. **La medición
   * dice otra cosa, y el propio comentario de esta función ya lo declaraba:** el lock excluye a
   * dos EJECUCIONES simultáneas; esta guarda excluye a dos CORRIDAS, que es otra cosa — una
   * desatendida pausada entre continuaciones no tiene ninguna ejecución viva, así que **no hay
   * lock que la vea** y arrancar otra encima pisaría el estado y los triggers.
   *
   * ⭐ **Son dos mecanismos porque son dos problemas, y ahora está escrito cuál hace qué:** el
   * lock manda sobre la simultaneidad, la guarda sobre «ya hay una corrida abierta». */
  var lock = tomarLockDeCorrida_();
  if (!lock.ok) {
    Logger.log('No arranco: ' + lock.motivo);
    return { ok: false, motivo: lock.motivo };
  }
  try {
    return iniciarCorridaDesatendidaConLock_(informeId, periodoId, opciones);
  } finally {
    soltarLockDeCorrida_(lock);
  }
}

/** El cuerpo del arranque, ya con el lock tomado por `iniciarCorridaDesatendida_`. */
function iniciarCorridaDesatendidaConLock_(informeId, periodoId, opciones) {
  if (leerEstadoCorrida_()) {
    var e = leerEstadoCorrida_();
    Logger.log('Ya hay una corrida desatendida en curso: ' + e.corrida_id + ' (ejecución ' +
      e.ejecucion + '). Cancelala con `cancelarCorridaDesatendida()` antes de arrancar otra.');
    return {
      ok: false, motivo: 'ya hay una corrida en curso',
      corrida_id: e.corrida_id, ejecucion: e.ejecucion, deck_id: e.deck_id || ''
    };
  }

  limpiarTriggersDeContinuacion_();

  // La ejecución 1 es una corrida normal, continuable, sobre un deck nuevo. Expande todo.
  var opc = {};
  Object.keys(opciones || {}).forEach(function (k) { opc[k] = opciones[k]; });
  opc.continuable = true;   // se pone DESPUÉS de copiar: pisa lo que haya venido de afuera
  var r = generarInforme(informeId, periodoId || undefined, opc);
  if (!r || !r.ok) {
    Logger.log('La ejecución 1 falló: ' + ((r && r.motivo) || '(sin motivo)'));
    return r || { ok: false };
  }

  var cont = r.continuacion || {};
  Logger.log('== corrida desatendida ' + cont.corrida_id + ' ==');
  Logger.log('   deck: ' + r.deck.url);

  // El plan se escribe DESPUÉS de la ejecución 1, con las asignaciones ya medidas de verdad —
  // no estimadas. Las secciones que la 1 resolvió entran ya como `hecha`.
  var porSeccion = {};
  (cont.asignaciones || []).forEach(function (a) {
    porSeccion[a.seccion] = (porSeccion[a.seccion] || 0) + 1;
  });
  var filas = Object.keys(porSeccion).map(function (id) {
    return { seccion_id: id, asignaciones: porSeccion[id] };
  });
  escribirPlan_(cont.corrida_id, informeId, filas);

  var hechas = 0;
  if (!r.corte) {
    // Sin corte, la ejecución 1 hizo todo. `generarInforme` ya barrió y ya quitó el sello.
    /* ⛔⛔ `2026-09-04` — **el retorno de `marcarSeccionPlan_` SE MIRA, igual que en la rama de
     * abajo.** Acá se ignoraba y `hechas++` corría igual, así que una sección que **no se pudo
     * marcar** se contaba como hecha y la corrida devolvía `terminada: true` **sin guardar
     * estado y sin crear trigger**. ⇒ El plan se quedaba con una fila `pendiente` **para
     * siempre**, y nadie se enteraba.
     *
     * ⭐ **Medido el 04/09 en `secco-20260904-153514`: 2 filas, 1 hecha, 1 pendiente, sin
     * estado y sin trigger.** Exactamente esta forma.
     *
     * ⚠ **La rama del corte YA lo miraba** —`if (marcarSeccionPlan_(...)) hechas++;`— así que
     * esto no inventa un comportamiento: **restaura la simetría que ya estaba del otro lado.** */
    var noMarcadas = [];
    filas.forEach(function (f) {
      if (marcarSeccionPlan_(cont.corrida_id, f.seccion_id, 'hecha', 1, f.asignaciones)) hechas++;
      else noMarcadas.push(f.seccion_id);
    });
    /* ⛔ El invariante SIMÉTRICO del que ya existe abajo: **sin corte, todo tiene que quedar
     * marcado.** Si algo no se marcó, la corrida NO se declara terminada — declararlo es lo que
     * deja el trabajo huérfano. */
    if (noMarcadas.length) {
      Logger.log('⛔⛔ INVARIANTE ROTO: la corrida NO se cortó y ' + noMarcadas.length + ' sección(es)');
      Logger.log('   no se pudieron marcar `hecha` en el plan: ' + noMarcadas.join(', '));
      Logger.log('   NO se declara terminada. El deck conserva el sello y dice lo que es.');
      Logger.log('   deck: ' + r.deck.url);
      return { ok: false, motivo: 'invariante roto: sin corte y ' + noMarcadas.length +
        ' sección(es) sin marcar — ' + noMarcadas.join(', '), deck: r.deck };
    }
    Logger.log('La corrida entró en una sola ejecución. No hace falta reanudar nada.');
    return { ok: true, terminada: true, ejecuciones: 1, deck: r.deck };
  }

  /* ⭐ Cortó. Se marcan **sólo las secciones RESUELTAS**, y resuelto significa que sus asignaciones
   * se pintaron — no que se expandieron. Ver `seccionesResueltas_`: marcar desde el reporte de
   * expansión es lo que dejó tres secciones `hecha` sin resolver ninguna. */
  var res = seccionesResueltas_(r, cont.asignaciones || []);
  res.completas.forEach(function (c) {
    if (marcarSeccionPlan_(cont.corrida_id, c.seccion_id, 'hecha', 1, c.asignaciones)) hechas++;
  });
  res.parciales.forEach(function (p) {
    Logger.log('   · ' + p.seccion_id + ': ' + p.pintadas + ' de ' + p.esperadas +
      ' asignación(es) — queda PENDIENTE');
  });

  /* ⭐ El invariante, chequeado ya en la ejecución 1: **cortó, así que tiene que quedar algo
   * pendiente.** Si no queda nada, el marcado está mal y reanudar sería declarar completo un deck
   * que no lo está. ⚠ Y no hay margen para que alguien lo mire: **el trigger dispara en un
   * minuto.** */
  var quedanTrasUno = leerPlan_(cont.corrida_id)
    .filter(function (f) { return String(f.estado).trim() === 'pendiente'; });
  if (!quedanTrasUno.length) {
    Logger.log('⛔ INVARIANTE ROTO en la ejecución 1: la corrida se cortó y no quedó ninguna');
    Logger.log('   sección pendiente. NO se crea el trigger. El deck conserva el sello.');
    Logger.log('   deck: ' + r.deck.url);
    return { ok: false, motivo: 'invariante roto: corte con cero pendientes', deck: r.deck };
  }

  // El costo por asignación medido en ESTA corrida, que es mejor que cualquier default.
  var gastado = (r.presupuesto && r.presupuesto.gastado_seg) || 0;
  var arranque = 80;
  var resueltasN = cont.resueltas || 1;
  var segPorAsignacion = Math.max(1, Math.round(((gastado - arranque) / resueltasN) * 10) / 10);

  guardarEstadoCorrida_({
    corrida_id: cont.corrida_id,
    informe_id: informeId,
    periodo_id: periodoId || '',
    deck_id: cont.deck_id,
    asignaciones: cont.asignaciones,
    ejecucion: 1,
    arranque_seg: arranque,
    seg_por_asignacion: segPorAsignacion,
    /* `2026-08-21_5` — **el modo que la ejecución 1 usó DE VERDAD, no uno afirmado acá.**
     *
     * ⚠ Decía `true` fijo, y eso era falso justo cuando importaba: la ejecución 1 no pasaba la
     * opción, así que salía en **crudo**, y las continuaciones leían este `true` y salían en
     * **símbolos** — dos vocabularios en el mismo deck, sin que nada lo avisara.
     *
     * Ahora las dos mitades resuelven lo mismo porque la segunda **hereda lo que la primera
     * midió**, en vez de volver a declararlo. Es la misma familia que el comentario que afirma un
     * contrato (`CLAUDE.md` §4): una constante puesta a mano no se entera de que dejó de ser
     * cierta. */
    con_simbolos: r.presentacion_faltantes === 'simbolos',
    se_corto: true
  });

  crearTriggerDeContinuacion_(60);
  Logger.log('La corrida se cortó y quedó plan. Trigger creado para dentro de 1 minuto.');
  Logger.log('   secciones hechas en la ejecución 1: ' + hechas);
  Logger.log('   costo medido por asignación: ' + segPorAsignacion + ' s');
  Logger.log('   Para frenarla: `cancelarCorridaDesatendida()`.');
  return { ok: true, continua: true, corrida_id: cont.corrida_id, deck: r.deck };
}

/**
 * ⭐ **El botón de freno. Un mecanismo desatendido sin él es peor que ninguno.**
 *
 * Borra los triggers y el estado. **No toca el deck ni el plan**: quedan para poder mirar dónde
 * se paró — el deck con su sello de en-proceso, que es lo que declara que no está terminado.
 */
function cancelarCorridaDesatendida() {
  var e = leerEstadoCorrida_();
  var borrados = limpiarTriggersDeContinuacion_();
  borrarEstadoCorrida_();
  if (e) {
    /* ⭐ **La cancelación también quita el sello, y es el tercer camino de salida.**
     *
     * ⚠ **NO se barre**: el deck queda a medio hacer a propósito, y tapar sus crudos con `/////`
     * afirmaría *«nadie lo cableó»* sobre tokens que nadie llegó a mirar. Lo que sí se quita es el
     * sello, porque **no hay nadie que vaya a volver**: un deck cancelado que conserva el sello
     * queda marcado «en proceso» para siempre, y entonces el sello deja de significar nada. */
    var cierre = cerrarDeckDesatendido_(e.deck_id, false);
    Logger.log('Cancelada la corrida ' + e.corrida_id + ' en la ejecución ' + e.ejecucion + '.');
    Logger.log('   sello quitado: ' + cierre.sello_quitado + (cierre.motivo ? ' · ⚠ ' + cierre.motivo : ''));
    Logger.log('   El deck queda con sus tokens crudos y el plan sin tocar: es lo que hay para mirar.');
    Logger.log('   NO se barrió a propósito: `/////` diría «nadie lo cableó», y nadie llegó a mirarlos.');
  } else {
    Logger.log('No había ninguna corrida desatendida en curso.');
    Logger.log('   ⚠ Si hay un deck con `' + SELLO_EN_PROCESO_ + '` en el nombre, el sello quedó');
    Logger.log('   huérfano: el estado se borró sin pasar por el cierre. Quitáselo a mano.');
  }
  Logger.log('   triggers borrados: ' + borrados);
  return { ok: true, triggers_borrados: borrados, corrida_id: e ? e.corrida_id : '' };
}

/** Los dos botones. Sin `_` y **sin argumentos**, que es lo que Apps Script exige para listarlos. */
function iniciarCorridaDesatendidaJM() { return iniciarCorridaDesatendida_('jm'); }
function iniciarCorridaDesatendidaSecco() { return iniciarCorridaDesatendida_('secco'); }

/**
 * ⚠ **Verifica que un trigger tenga alcance a lo que la corrida necesita, SIN generar nada.**
 *
 * El trigger corre con los permisos del dueño del script y **sin usuario delante**. Las bases son
 * planillas de otras cuentas compartidas con él, así que ese alcance **no es obvio y hay que
 * probarlo**: si no llega, la primera continuación falla leyendo una base y el plan se queda
 * pendiente sin que nadie entienda por qué.
 *
 * Se corre **una vez, a mano**, antes de confiar en el mecanismo.
 *
 * ═══ ⭐ Por qué esta función tiene una guarda de cobertura, y es una corrección de sí misma ═══
 *
 * **La primera versión no verificó ni una base y dio veredicto igual.** El bloque de bases no
 * imprimió **ni una línea** —ni `ok` ni `FALLA`— y la función reportó como único problema el de
 * triggers. **Un control que no controla y emite diagnóstico es peor que no tenerlo, porque su
 * verde se cita.**
 *
 * **La causa, y es exactamente la que `CLAUDE.md` §4 documenta:** `leerRegistro_` hace
 * `obj.activo = esVerdadero_(obj.activo)`, así que **`activo` es un booleano real**. El filtro
 * escrito acá era `String(b.activo || '').trim().toLowerCase() !== 'sí'` — y `String(true)` es
 * `'true'`, que nunca es `'sí'`. **Descartaba las cinco bases, en silencio.** Los otros seis
 * lectores del repo usan el idioma correcto —`if (!base.activo || !base.sheet_id) return;`— y este
 * verificador fue el único que convirtió antes de mirar. *Convertir antes de mirar el tipo destruye
 * el tipo*, y acá lo destruyó dentro de un verificador, que es donde más caro sale.
 *
 * **Por eso la guarda: cero bases verificadas es un PROBLEMA, no un silencio.** Y el log dice
 * `n de m`, porque un conteo es lo único que distingue *"todas pasaron"* de *"no se probó ninguna"*.
 */
function verificarAlcanceDesatendido() {
  var problemas = [];
  Logger.log('== alcance para la corrida desatendida ==');
  Logger.log('');

  // ── las bases ────────────────────────────────────────────────────────────────────────────
  var bases = leerBases();
  var candidatas = [];
  Object.keys(bases).forEach(function (baseId) {
    var b = bases[baseId];
    // El idioma del repo, no una conversión propia: `activo` ya viene booleano.
    if (!b.activo || !b.sheet_id) return;
    candidatas.push(baseId);
  });

  var verificadas = 0;
  candidatas.forEach(function (baseId) {
    try {
      SpreadsheetApp.openById(bases[baseId].sheet_id).getName();
      Logger.log('   ok    base ' + baseId);
      verificadas++;
    } catch (e) {
      Logger.log('   FALLA base ' + baseId + ': ' + e.message);
      problemas.push('base ' + baseId);
      verificadas++;
    }
  });

  Logger.log('   → ' + verificadas + ' de ' + candidatas.length + ' base(s) activa(s) con `sheet_id` verificadas' +
    ' (sobre ' + Object.keys(bases).length + ' fila(s) en BASES)');

  /* ⭐ La guarda de cobertura. **Cero verificadas es un problema, no un silencio** — y las tres
   * causas posibles se nombran, porque cada una manda a mirar otro lado. */
  if (!candidatas.length) {
    Logger.log('   ⛔ NINGUNA base para verificar. Esto NO es "todo bien": es que el control no midió.');
    Logger.log('      Puede ser (a) BASES vacía, (b) ninguna fila con `activo` verdadero, o');
    Logger.log('      (c) ninguna activa con `sheet_id` cargado. Mirar la hoja antes de seguir.');
    problemas.push('cero bases verificadas — el control no midió');
  }

  // ── los triggers ─────────────────────────────────────────────────────────────────────────
  Logger.log('');
  try {
    var triggers = ScriptApp.getProjectTriggers();
    var mios = triggers.filter(function (t) { return t.getHandlerFunction() === FN_CONTINUACION_; });
    Logger.log('   ok    triggers: ' + triggers.length + ' instalado(s) de 20 slots · ' +
      mios.length + ' de continuación');
    if (triggers.length >= 18) problemas.push('quedan menos de 3 slots de trigger');
  } catch (e) {
    Logger.log('   FALLA no se pudieron listar los triggers: ' + e.message);
    Logger.log('      ⚠ Si dice que falta autorización, es el scope `script.scriptapp` de');
    Logger.log('      `appsscript.json`. Sin él el mecanismo desatendido NO puede funcionar.');
    problemas.push('triggers: ' + e.message);
  }

  // ── el lock ──────────────────────────────────────────────────────────────────────────────
  try {
    var l = LockService.getScriptLock();
    if (l.tryLock(1000)) { l.releaseLock(); Logger.log('   ok    LockService'); }
    else { Logger.log('   FALLA el lock estaba tomado'); problemas.push('el lock estaba tomado'); }
  } catch (e) {
    Logger.log('   FALLA LockService: ' + e.message);
    problemas.push('LockService: ' + e.message);
  }

  // ── el veredicto, que ahora sabe cuánto midió ────────────────────────────────────────────
  Logger.log('');
  if (problemas.length) {
    Logger.log('⛔ NO confiar en el mecanismo todavía:');
    problemas.forEach(function (p) { Logger.log('   · ' + p); });
  } else {
    Logger.log('✅ Alcance ok, sobre ' + verificadas + ' base(s) verificada(s).');
    Logger.log('   ⚠ Ojo: esto corrió COMO VOS. Un trigger corre como el DUEÑO DEL SCRIPT, y si no');
    Logger.log('   sos vos, hay que re-correr esto desde esa cuenta — el verde de acá no la cubre.');
  }
  return { ok: problemas.length === 0, problemas: problemas, bases_verificadas: verificadas, bases_candidatas: candidatas.length };
}


/* ══════════════════════════════════════════════════════════════════════════════════════════
 * ⭐⭐ `2026-09-04` — **`diagCorridaEnCurso()`: por qué el contador no para.**
 *
 * ⛔⛔ **Existe porque el panel no puede distinguir las tres causas, y mandan a trabajos opuestos:**
 *
 *   1. **La corrida sigue viva y se está reanudando** ⇒ ⭐ **el contador tiene razón**. No hay nada
 *      que hacer: esperar. Con tope 6 y 60 s entre ejecuciones, 20 minutos **entran de sobra**.
 *   2. ⛔ **Cortó y el trigger NO se creó** ⇒ **no se reanuda nunca**. Es exactamente lo que `D-57`
 *      viene a eliminar, y el contador correría para siempre sin que nada avise.
 *   3. ⛔ **Terminó y el panel no se enteró** ⇒ defecto del sondeo, no de la corrida.
 *
 * ⭐ **Las tres se ven IGUAL desde la pantalla: un cronómetro que sube.** Y el cronómetro además
 * está dibujado contra `TECHO_S`, que es el techo de **UNA** ejecución — así que a los 20 minutos
 * **está en rojo sin que eso signifique nada malo**. Es el borde que quedó declarado al implementar
 * `D-57` y que este diagnóstico compensa mientras tanto.
 *
 * ⛔ SÓLO LECTURA. No frena nada, no borra triggers, no toca el deck.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
function diagCorridaEnCurso() {
  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('¿POR QUÉ NO PARA EL CONTADOR? · ' + new Date().toISOString());
  Logger.log('⛔ SÓLO LECTURA — no frena nada.');
  Logger.log('══════════════════════════════════════════════════════════════════════');

  /* 1 · El estado entre ejecuciones. Su existencia ES `en_curso`. */
  var estado = null;
  try { estado = leerEstadoCorrida_(); } catch (e) { Logger.log('  ⚠ no pude leer el estado: ' + e.message); }
  Logger.log('── 1 · estado entre ejecuciones (`PropertiesService`)');
  if (!estado) {
    Logger.log('     ⭐ NO HAY. La corrida **terminó o se canceló** ⇒ `en_curso` es false.');
  } else {
    Logger.log('     corrida_id : ' + (estado.corrida_id || '(vacío)'));
    Logger.log('     informe    : ' + (estado.informe_id || '') + ' · período ' + (estado.periodo_id || ''));
    Logger.log('     ejecución  : ' + (estado.ejecucion || '?') + ' de ' + topeContinuaciones_());
    Logger.log('     ⭐ se_corto : ' + (estado.se_corto === true ? 'SÍ — esperando la continuación' : 'no'));
    Logger.log('     deck_id    : ' + (estado.deck_id || '(vacío)'));
  }

  /* 2 · ⛔⛔ EL TRIGGER. Sin él, «cortó» y «cortó y se quedó ahí» son la misma pantalla. */
  Logger.log('');
  Logger.log('── 2 · ⭐⭐ ¿hay trigger de continuación agendado?');
  var triggers = [];
  try {
    ScriptApp.getProjectTriggers().forEach(function (t) {
      if (t.getHandlerFunction() === FN_CONTINUACION_) triggers.push(t.getUniqueId());
    });
  } catch (e) { Logger.log('     ⚠ no pude leer los triggers: ' + e.message); }
  Logger.log('     triggers de `' + FN_CONTINUACION_ + '`: ' + triggers.length);
  if (estado && !triggers.length) {
    Logger.log('     ⛔⛔ HAY ESTADO Y NO HAY TRIGGER: la corrida cortó y **no se va a reanudar sola**.');
    Logger.log('        Es la causa 2 y es la mala. El contador correría para siempre.');
  } else if (estado && triggers.length) {
    Logger.log('     ✅ hay estado Y hay trigger ⇒ **se está reanudando**. Es la causa 1: esperar.');
  } else if (!estado && triggers.length) {
    Logger.log('     ⚠ trigger sin estado: quedó un trigger huérfano de una corrida ya cerrada.');
  } else {
    Logger.log('     ⭐ ni estado ni trigger ⇒ **la corrida TERMINÓ**. Si el contador sigue, es la');
    Logger.log('        causa 3: el sondeo del panel no se enteró.');
  }

  /* 3 · El plan: qué falta de verdad. */
  Logger.log('');
  Logger.log('── 3 · el plan');
  var cid = estado ? String(estado.corrida_id || '') : ultimaCorridaDelPlan_();
  if (!cid) {
    Logger.log('     ⚠ no hay `corrida_id` ni en el estado ni en `PLAN_CORRIDA`.');
  } else {
    var filas = [];
    try { filas = leerPlan_(cid) || []; } catch (e) { Logger.log('     ⚠ ' + e.message); }
    var pend = filas.filter(function (f) { return String(f.estado || '').trim() === 'pendiente'; });
    var hech = filas.filter(function (f) { return String(f.estado || '').trim() === 'hecha'; });
    Logger.log('     corrida ' + cid + ' · ' + filas.length + ' fila(s): ' +
      hech.length + ' hecha(s), ' + pend.length + ' pendiente(s)');
    /* ⚠ **El campo es `seccion_id`.** El 04/09 este log imprimió `pendiente: ?` porque adiviné
     * `seccion`/`item` — justo cuando saber CUÁL era el dato que faltaba. */
    pend.forEach(function (f) {
      Logger.log('        pendiente: ' + (f.seccion_id || f.seccion || f.item || '(sin nombre)'));
    });
    /* ⛔⛔ El invariante SIMÉTRICO, que este diagnóstico no tenía y era el caso real: **la
     * corrida terminó —sin estado, sin trigger— y quedó trabajo pendiente.** */
    if (!estado && !triggers.length && pend.length) {
      Logger.log('     ⛔⛔ TERMINÓ INCOMPLETA: no hay estado ni trigger, y quedan ' + pend.length +
        ' pendiente(s).');
      Logger.log('        La corrida se declaró terminada dejando trabajo sin hacer y SIN forma');
      Logger.log('        de retomarlo. Es el defecto de la rama sin corte que ignoraba el');
      Logger.log('        retorno de `marcarSeccionPlan_` — arreglado el 04/09.');
    }
    /* ⛔ El invariante que el mecanismo chequea entre ejecuciones, dicho también acá. */
    if (estado && estado.se_corto === true && !pend.length) {
      Logger.log('     ⛔⛔ INVARIANTE ROTO: cortó y NO queda nada pendiente. Las dos no pueden ser');
      Logger.log('        ciertas a la vez — algo marcó `hecha` una sección que no se resolvió.');
    }
  }

  /* 4 · El sello del deck: es lo que el usuario ve en Drive. */
  Logger.log('');
  Logger.log('── 4 · el sello «en proceso» del deck');
  var deckId = estado ? String(estado.deck_id || '') : '';
  if (!deckId) {
    Logger.log('     (sin `deck_id` en el estado — si la corrida cerró, el deck ya no lo tiene acá)');
  } else {
    try {
      var nombre = DriveApp.getFileById(deckId).getName();
      var sellado = nombre.indexOf(SELLO_EN_PROCESO_) === 0;
      Logger.log('     ' + nombre);
      Logger.log('     ⭐ sello puesto: ' + (sellado ? 'SÍ' : 'no'));
      if (sellado) {
        Logger.log('        ⚠ El sello lo quita **el cierre, y sólo si la corrida terminó**. Cortada');
        Logger.log('        o muerta, el deck se queda sellado **a propósito**: declara lo que es.');
      }
    } catch (e) { Logger.log('     ⚠ no pude abrir el deck: ' + e.message); }
  }

  /* 5 · Qué hacer, según lo de arriba. Un diagnóstico que no manda a un trabajo no sirve. */
  Logger.log('');
  Logger.log('── VEREDICTO ──');
  if (estado && triggers.length) {
    Logger.log('  ⭐ CAUSA 1 — se está reanudando. **Esperar.** Con tope ' + topeContinuaciones_() +
      ' y 60 s entre ejecuciones, 20 minutos entran de sobra.');
  } else if (estado && !triggers.length) {
    Logger.log('  ⛔⛔ CAUSA 2 — cortó y NO hay trigger: **no se reanuda sola.**');
    Logger.log('     ⚠ Antes de tocar nada: mirar si el tope se agotó (ejecución ' +
      (estado.ejecucion || '?') + ' de ' + topeContinuaciones_() + '). Si se agotó, el mecanismo');
    Logger.log('     hizo lo correcto y el trabajo es otro. Si no, es un defecto del agendado.');
  } else if (!estado) {
    Logger.log('  ⭐ La corrida NO está en curso. Si el panel sigue contando, el defecto es del');
    Logger.log('     sondeo y **el deck está donde el paso 4 diga** — no hay nada corriendo.');
  }
  return { ok: true, en_curso: !!estado, triggers: triggers.length, corrida_id: cid };
}
