/**
 * PanelBackend.gs — Funciones que Panel.html invoca vía google.script.run.
 * Sin lógica de negocio: orquesta módulos y devuelve datos planos.
 *
 * `_27` bloque 1.1 (11/08/2026) — deja de ser un TODO de los Pasos 6-8. El panel mínimo
 * hace **lo único que el camino del usuario necesita**: elegir informe, elegir período,
 * generar, y ver el link con lo que el deck tiene adentro.
 *
 * **Lo que NO hace, y es a propósito:** no agrega marcadores, no lee campos de fuente, no
 * edita ninguna hoja de registro. Los tres TODO viejos (`panel_addMarcador`,
 * `panel_getCamposFuente`, `panel_getPreview`) siguen sin existir — un panel que escribe en
 * `MARCADORES` necesita su propio camino declarado en `ESCRITORES.md`, y eso no es de hoy.
 *
 * Expone:
 *   panel_getEstado()                  -> informes, períodos y la ventana que saldría hoy
 *   panel_generar(informeId, periodoId) -> el reporte de corrida, ya presentable
 */

/**
 * Una fecha de celda para mostrar, o un texto que dice que no se pudo leer.
 *
 * No es un normalizador nuevo (`CLAUDE.md` §2): no compara ni canonicaliza nada, sólo
 * envuelve a `formatearFecha_`, que llama a `Utilities.formatDate` y **tira con `null`**.
 * Sin esto, una sola fila de `PERIODOS` con la fecha mal tipeada voltea `panel_getEstado()`
 * entero y el panel no se pinta — un dato malo de una fila apagaría las dos listas y el
 * botón. Acá esa fila se muestra rota y las demás siguen andando.
 */
function fechaLegible_(valor) {
  var fecha = parsearFechaCelda_(valor);
  return fecha ? formatearFecha_(fecha) : '(fecha ilegible)';
}

/**
 * `2026-08-20_2` Parte B (20/08/2026) — **qué le falta a la ventana propuesta para ser
 * confiable.** Devuelve una lista de `{ nivel, texto }`; vacía significa que no falta nada.
 *
 * ⚠ **Corrige una premisa del prompt, y la corrección importa más que el aviso.** El prompt daba
 * por medido que *"una ventana propuesta sin fila en `PERIODOS` no se puede correr"*, y **eso es
 * falso para el camino por defecto**. Medido el 20/08 sobre el código:
 *
 *   - `generarInforme(id, periodoId, opciones)` sólo exige que el `periodo_id` exista en
 *     `PERIODOS` **cuando se le pasa uno**. El panel manda `''` cuando la persona deja el selector
 *     en "por defecto", y ahí la cadena de `D-20` resuelve sola — **hasta el eslabón 5, que ahora
 *     calcula la semana cerrada**. El deck se genera, sobre la ventana correcta, sin fila alguna.
 *   - Lo que **sí** cambia sin período es otra cosa, y es peor porque no se ve:
 *     `anclarEncuentrosSinCache_` saca el período **del `origen` de la ventana**, mirando si
 *     empieza con `periodo_ref:`. Una ventana calculada trae `origen = 'R-11 (calculado)'`, así
 *     que **el recorte de `D-19` no se aplica** y entran todas las filas con `mostrar=sí`.
 *
 * **El número que lo vuelve concreto, medido el 20/08 en la hoja viva:** `REUNIONES` tiene 12
 * filas con `mostrar=sí` y son de **dos períodos distintos** —8 de `julio_24_30` y 4 de
 * `junio_sem2`—. Sobre una ventana calculada, las 12 entran al anclaje. Las que no anclen contra
 * `rdv` van a caer solas, **pero por el motivo equivocado**: no las excluye el período, las excluye
 * no haber encontrado fila. Y cualquiera que sí ancle, entra.
 *
 * ⭐ **Por eso el aviso dice lo que dice.** *"No se puede correr"* habría sido falso y habría
 * frenado a la persona sin motivo; *"salen todas las reuniones visibles"* es lo que efectivamente
 * pasa. **Mostrar una advertencia equivocada es tan caro como no mostrar ninguna**, porque la
 * próxima se lee con la misma desconfianza.
 *
 * El aviso **no bloquea el botón**: la corrida es válida y la ventana es la correcta. Lo que hace
 * es que la persona sepa, antes de esperar cinco minutos, que las secciones repetibles no están
 * recortadas por período.
 */
function avisosDeVentanaPropuesta_(ventana) {
  var avisos = [];
  if (!ventana || !ventana.ok) return avisos;

  var origen = String(ventana.origen || '');
  var traeperiodo = origen.indexOf('periodo_ref:') === 0;
  if (traeperiodo) return avisos;

  // Sin `periodo_ref:` en el origen no hay recorte de `D-19`. Se dice con el número adelante,
  // porque "hay reuniones de otros períodos" y "hay 4 reuniones de junio" no se leen igual.
  //
  // ⚠ El conteo sale de `leerReuniones_()` **tal cual**, sin volver a filtrar por `mostrar`:
  // esa función ya aplica el filtro con `esVerdadero_` y exige `eje`. Reproducir acá ese criterio
  // sería el error que `CLAUDE.md` §4 documenta —*el instrumento que reproduce lógica del motor y
  // la reproduce peor*—, y encima el aviso quedaría diciendo un número distinto del que el motor
  // va a usar, que es justo lo que este aviso existe para evitar.
  var deOtros = 0;
  var visibles = 0;
  try {
    leerReuniones_().forEach(function (r) {
      visibles++;
      if (String(r.periodo_id || '').trim()) deOtros++;
    });
  } catch (e) {
    // Un panel que no puede leer `REUNIONES` sigue sirviendo para generar: el aviso se degrada
    // a genérico en vez de tumbar la pantalla.
    avisos.push({
      nivel: 'aviso',
      texto: 'La ventana propuesta no tiene período con nombre, así que las secciones repetibles ' +
        'no se recortan por período (D-19). No pude leer REUNIONES para decir cuántas entrarían.'
    });
    return avisos;
  }

  if (visibles) {
    avisos.push({
      nivel: 'aviso',
      texto: 'La semana propuesta no tiene fila en PERIODOS. El informe se genera igual y sobre ' +
        'estas fechas, pero las secciones repetibles NO se recortan por período: entran las ' +
        visibles + ' reunión(es) con mostrar=sí' +
        (deOtros ? ', incluidas ' + deOtros + ' que ya tienen otro período asignado' : '') +
        '. Para que el recorte se aplique hay que elegir un período de la lista, o crear la fila.'
    });
  }

  return avisos;
}

/**
 * Todo lo que el panel necesita para pintarse, en **una** llamada.
 *
 * Tres round-trips de `google.script.run` sobre un sidebar son tres esperas visibles y tres
 * estados intermedios que hay que dibujar. Acá el panel se pinta una vez o falla una vez.
 *
 * La ventana por defecto se resuelve con `resolverVentana({})` — la misma cadena de `D-20`
 * que va a usar la corrida— y **no leyendo `CONFIG.periodo_desde` a mano**: si algún día un
 * eslabón de más arriba gana, el panel muestra lo que realmente va a pasar y no lo que dice
 * una celda. Es la diferencia entre mostrar el estado y reimplementarlo.
 */
function panel_getEstado() {
  var informes = [];
  var registro = leerInformes();
  var cableados = {};
  // Cuántos marcadores tiene cableados cada informe. Medido el 11/08: `jm` 57 y **`secco`
  // cero**, o sea que su deck sale con 289 huecos y un valor. Un informe sin marcadores no se
  // esconde del selector —está en `INFORMES` y es real— pero el panel tiene que poder decirlo
  // antes de que alguien espere cinco minutos por un deck vacío.
  leerMarcadores_().forEach(function (m) {
    var suyo = String(m.informe_id || '').trim();
    cableados[suyo] = (cableados[suyo] || 0) + 1;
  });

  Object.keys(registro).forEach(function (id) {
    var fila = registro[id];
    // `INFORMES.activo` es la señal del registro: un informe dado de baja no se ofrece.
    if (fila.activo !== true) return;
    informes.push({
      id: id,
      nombre: fila.nombre || id,
      notas: fila.notas || '',
      marcadores_cableados: cableados[id] || 0,
      // Las secciones repetibles que ese informe tiene activas. El panel las ofrece para que
      // la corrida entre en el techo (`_27` bloque 3).
      secciones: seccionesRepetiblesDe_(id).map(function (s) {
        return { id: s.seccion_id, itera_sobre: s.itera_sobre || '' };
      })
    });
  });

  var periodos = [];
  var registroPeriodos = leerPeriodos();
  Object.keys(registroPeriodos).forEach(function (id) {
    var fila = registroPeriodos[id];
    periodos.push({
      id: id,
      desde: fechaLegible_(fila.desde),
      hasta: fechaLegible_(fila.hasta),
      notas: fila.notas || ''
    });
  });

  // La opción por defecto. Si la cadena no resuelve, el panel tiene que poder decirlo en vez
  // de ofrecer un botón que va a fallar recién dentro de cinco minutos.
  var ventana = resolverVentana({});
  var porDefecto = ventana.ok
    ? {
      ok: true,
      etiqueta: formatearPeriodoLamina_(ventana),
      desde: formatearFecha_(ventana.desde),
      hasta: formatearFecha_(ventana.hasta),
      origen: ventana.origen,
      // `2026-08-20_2` Parte B — la propuesta viaja **con lo que le falta para ser confiable**.
      // Ver `avisosDeVentanaPropuesta_`: NO es "no se puede correr" (sí se puede), es que las
      // secciones repetibles no se recortan por período si la ventana no trae uno.
      avisos: avisosDeVentanaPropuesta_(ventana)
    }
    : { ok: false, motivo: ventana.motivo };

  return {
    ok: true,
    informes: informes,
    informe_activo: String(leerConfig().informe_activo || '').trim(),
    periodos: periodos,
    por_defecto: porDefecto
  };
}

/**
 * Genera y devuelve el reporte **ya presentable** (`_27` bloque 1.3).
 *
 * `periodoId` vacío = sin override: la cadena de `D-20` resuelve sola, que es el caso normal.
 * Se manda `''` y no `null` porque un `<select>` devuelve string siempre; la normalización a
 * `undefined` se hace acá y no en el HTML, para que `generarInforme` reciba lo que su firma
 * declara.
 *
 * **Los dos denominadores van separados y nombrados, y ése es el punto del bloque.** La
 * corrida del 11/08 imprimía `83 con valor de 159 · 207 en FALTA`, y `207 > 159` se lee como
 * un bug del motor. No lo es: `159` son **tokens distintos** del deck expandido y `207` son
 * **filas de `FALTANTES`**, que se escriben una por token **y por ítem** (`CLAUDE.md` §4). Son
 * dos unidades distintas en la misma frase. Acá cada número dice de qué es.
 *
 * **No se suma nada.** `reemplazados + faltantes` parece el total de impresiones y no lo es:
 * `R-18` punto 3 escribe una fila de `FALTANTES` para un token que **sí publicó** cuando el
 * catálogo le rechazó parte de la lista. Un total inventado acá sería exactamente el número
 * plausible que este proyecto viene cazando.
 */
function panel_generar(informeId, periodoId, conSimbolos, secciones) {
  var id = String(informeId || '').trim();
  if (!id) return { ok: false, motivo: 'No se eligió informe.' };

  var ref = String(periodoId || '').trim();
  var opciones = {
    // ⚠ La clave sigue siendo `faltantes_como_raya` porque es formato de cable hacia
    // `generarInforme`, que la API puede invocar por nombre (`2026-08-20_1` Parte A). Lo que
    // el tercer argumento significa desde el 20/08 es otra cosa —los cuatro símbolos contra el
    // crudo—, y por eso el parámetro sí se llama como lo que es.
    faltantes_como_raya: conSimbolos === true,
    // El panel manda SIEMPRE la lista de las tildadas, aunque esté vacía: destildar todas es
    // una elección válida —"ninguna sección repetible"— y no un pedido de correrlas todas.
    // `undefined` queda para los llamadores que no conocen la opción.
    secciones: secciones || []
  };
  var r = generarInforme(id, ref || undefined, opciones);
  if (!r.ok) return { ok: false, motivo: r.motivo };

  return {
    ok: true,
    deck: r.deck,
    periodo: r.periodo,
    corrida_id: r.corrida_id,
    presentacion_faltantes: r.presentacion_faltantes,
    // Cada conteo con su unidad dicha. `marcadores` es el resumen de la pasada de tokens
    // fijos y lo produce `resolverMarcadores`: no se recalcula acá.
    conteos: {
      tokens_distintos: r.tokens.en_plantilla,
      impresiones_con_valor: r.tokens.reemplazados,
      filas_en_faltantes: r.tokens.faltantes,
      marcadores: r.marcadores || null
    },
    escondidas: r.tokens.excluidos_por_lamina_escondida,
    cableados_sin_caja: r.tokens.cableados_sin_caja_en_plantilla,
    secciones: r.repetibles.secciones,
    tiempos_por_seccion: r.tiempos_por_seccion,
    // Los tres avisos que cambian **cómo se lee todo lo de arriba**. Viajan siempre, aunque
    // sean `null`: el panel decide si los pinta, pero nunca tiene que adivinar si existen.
    corte: r.corte,
    fallo: r.fallo,
    instrumento: r.instrumento,
    presupuesto: r.presupuesto
  };
}

/**
 * Las últimas corridas, de la más nueva a la más vieja. **Sólo lectura.**
 *
 * Nace de un problema real del 11/08 y no de una idea de producto: una llamada de generación
 * volvió en HTML y no hubo forma de saber **si había llegado a correr**, porque `CORRIDAS`
 * era la única hoja de registro sin ningún lector — `verificarObjectIdDeCorrida_` existe pero
 * exige el `corrida_id` que justamente es lo que falta cuando la llamada se cae.
 *
 * Que el panel muestre esto es lo que evita el error que importa mañana: **abrir el deck
 * equivocado.** Con dos decks del mismo informe y del mismo período en la misma carpeta, el
 * nombre no alcanza para distinguirlos; la `fecha_generacion` sí.
 */
function panel_ultimasCorridas(cuantas) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CORRIDAS');
  if (!hoja) return { ok: false, motivo: 'La hoja CORRIDAS no existe.' };

  var datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return { ok: true, corridas: [] };

  var headers = datos.shift();
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var filas = datos.filter(function (f) { return f[idx.corrida_id]; }).map(function (f) {
    var gen = f[idx.fecha_generacion];
    return {
      corrida_id: String(f[idx.corrida_id]),
      informe_id: String(f[idx.informe_id] || ''),
      // `_48` Parte B — **tal como está en la fila**, sin derivarlo de `fecha_generacion`: una
      // corrida de hoy puede ser de junio, y el panel emparejaba por informe solo, así que
      // mostraba el deck de otro período con total naturalidad.
      //
      // ⚠ **Ojo con qué guarda esta columna.** `abrirCorrida_` escribe
      // `periodoId || ventana.origen`, así que una corrida **sin período explícito** no deja un
      // `periodo_id` de `PERIODOS`: deja la **etiqueta de origen** de la cadena de `D-20`
      // (hoy `config`). Son dos vocabularios en una columna. El panel lo resuelve comparando
      // contra el origen cuando la elección es "por defecto"; acá no se traduce nada, porque
      // traducirlo sería inventar a qué período pertenece una corrida vieja.
      periodo_id: String(f[idx.periodo_id] || ''),
      deck_id: String(f[idx.deck_id] || ''),
      // Cruda y formateada: la primera ordena, la segunda se lee. Una corrida que murió antes
      // del cierre la deja vacía, y ése es justamente el rastro que la delata.
      fecha_generacion: gen instanceof Date ? formatearFechaHora_(gen) : String(gen || ''),
      cerrada: gen instanceof Date,
      tokens_reemplazados: f[idx.tokens_reemplazados],
      faltantes: String(f[idx.faltantes] || '')
    };
  });

  filas.reverse();
  return { ok: true, corridas: filas.slice(0, cuantas || 10), total: filas.length };
}

/** Fecha y hora de una corrida, para distinguir dos decks del mismo informe y período. */
function formatearFechaHora_(fecha) {
  return Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Abre el panel como barra lateral.
 *
 * `Paso 6` lo dejó como TODO y el `_27` lo cierra. Es la única función de este archivo que
 * toca UI, y por eso es la única que no puede correr por API.
 */
function abrirPanel() {
  var html = HtmlService.createHtmlOutputFromFile('Panel')
    .setTitle('Motor de Informes');
  SpreadsheetApp.getUi().showSidebar(html);
}
