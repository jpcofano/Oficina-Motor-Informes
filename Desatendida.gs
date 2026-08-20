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
  seccionesRepetiblesDe_(informeId).forEach(function (seccion) {
    var r = itemsDeSeccion_(seccion, informeId, ventana);
    var items = (r && r.ok) ? r.items.length : 0;
    var modelos = slidesModeloDe_(presentacion, familiasDeSeccion_(seccion)).length;
    filas.push({
      seccion_id: seccion.seccion_id,
      items: items,
      modelos: modelos,
      asignaciones: items * modelos,
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
 */
function correrUnaEjecucion_() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    Logger.log('Otra ejecución tiene el lock. Salgo sin escribir nada — dos ejecuciones sobre el ' +
      'mismo deck es el peor resultado posible.');
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
      Logger.log('No quedan secciones pendientes. La corrida ' + estado.corrida_id + ' está completa.');
      borrarEstadoCorrida_();
      return { ok: true, terminada: true };
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
      asignaciones: estado.asignaciones,
      solo_secciones: chunk.secciones,
      continuable: true,
      faltantes_como_raya: estado.con_simbolos !== false
    });

    if (!r || !r.ok) {
      Logger.log('La ejecución falló: ' + ((r && r.motivo) || '(sin motivo)'));
      return r || { ok: false };
    }

    // Se marcan las secciones que esta ejecución resolvió, una por una y a medida que se confirman.
    var hechas = 0;
    (r.repetibles && r.repetibles.secciones ? r.repetibles.secciones : []).forEach(function (s) {
      if (chunk.secciones.indexOf(s.seccion) === -1) return;
      if (!s.ok) return;
      if (marcarSeccionPlan_(estado.corrida_id, s.seccion, 'hecha', ejecucion, s.seg_expansion || '')) hechas++;
    });

    Logger.log('   secciones marcadas `hecha`: ' + hechas);

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
    lock.releaseLock();
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
 * Arranca una corrida desatendida. **La ejecución 1 expande TODO** —fase atómica— y resuelve lo
 * que entre; las siguientes sólo resuelven.
 *
 * ⚠ **Si ya hay una corrida en curso, NO arranca otra.** Dos corridas desatendidas a la vez se
 * pisarían el estado en `PropertiesService` y los triggers, y el lock no alcanza para eso: el lock
 * evita que dos ejecuciones escriban a la vez, no que dos corridas se confundan de deck.
 */
function iniciarCorridaDesatendida_(informeId, periodoId) {
  if (leerEstadoCorrida_()) {
    var e = leerEstadoCorrida_();
    Logger.log('Ya hay una corrida desatendida en curso: ' + e.corrida_id + ' (ejecución ' +
      e.ejecucion + '). Cancelala con `cancelarCorridaDesatendida()` antes de arrancar otra.');
    return { ok: false, motivo: 'ya hay una corrida en curso', corrida_id: e.corrida_id };
  }

  limpiarTriggersDeContinuacion_();

  // La ejecución 1 es una corrida normal, continuable, sobre un deck nuevo. Expande todo.
  var r = generarInforme(informeId, periodoId || undefined, { continuable: true });
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
  var resueltas = {};
  (r.repetibles && r.repetibles.secciones ? r.repetibles.secciones : []).forEach(function (s) {
    if (s.ok && !s.omitida) resueltas[s.seccion] = true;
  });

  var filas = Object.keys(porSeccion).map(function (id) {
    return { seccion_id: id, asignaciones: porSeccion[id] };
  });
  escribirPlan_(cont.corrida_id, informeId, filas);

  var hechas = 0;
  if (!r.corte) {
    // Sin corte, la ejecución 1 hizo todo.
    filas.forEach(function (f) {
      marcarSeccionPlan_(cont.corrida_id, f.seccion_id, 'hecha', 1, '');
      hechas++;
    });
    Logger.log('La corrida entró en una sola ejecución. No hace falta reanudar nada.');
    return { ok: true, terminada: true, ejecuciones: 1, deck: r.deck };
  }

  Object.keys(resueltas).forEach(function (id) {
    if (marcarSeccionPlan_(cont.corrida_id, id, 'hecha', 1, '')) hechas++;
  });

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
    con_simbolos: true
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
    Logger.log('Cancelada la corrida ' + e.corrida_id + ' en la ejecución ' + e.ejecucion + '.');
    Logger.log('   El deck y el plan NO se tocaron: quedan para mirar dónde se paró.');
    Logger.log('   El deck conserva el sello de en-proceso, que dice que no está terminado.');
  } else {
    Logger.log('No había ninguna corrida desatendida en curso.');
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
 */
function verificarAlcanceDesatendido() {
  var problemas = [];
  Logger.log('== alcance para la corrida desatendida ==');

  Object.keys(leerBases()).forEach(function (baseId) {
    var b = leerBases()[baseId];
    if (String(b.activo || '').trim().toLowerCase() !== 'sí') return;
    if (!b.sheet_id) return;
    try {
      SpreadsheetApp.openById(b.sheet_id).getName();
      Logger.log('   ok   base ' + baseId);
    } catch (e) {
      Logger.log('   FALLA base ' + baseId + ': ' + e.message);
      problemas.push('base ' + baseId);
    }
  });

  try {
    var triggers = ScriptApp.getProjectTriggers().length;
    Logger.log('   ok   triggers: ' + triggers + ' instalado(s) de 20 slots');
    if (triggers >= 18) problemas.push('quedan menos de 3 slots de trigger');
  } catch (e) {
    Logger.log('   FALLA no se pudieron listar los triggers: ' + e.message);
    problemas.push('triggers');
  }

  try {
    var l = LockService.getScriptLock();
    if (l.tryLock(1000)) { l.releaseLock(); Logger.log('   ok   LockService'); }
    else problemas.push('el lock estaba tomado');
  } catch (e) { problemas.push('LockService: ' + e.message); }

  Logger.log('');
  Logger.log(problemas.length
    ? 'NO confiar en el mecanismo todavía: ' + problemas.join(' · ')
    : 'Alcance ok. Ojo: esto corre COMO VOS. Un trigger corre como el dueño del script, y si no ' +
      'sos vos, hay que re-correrlo desde esa cuenta.');
  return { ok: problemas.length === 0, problemas: problemas };
}
