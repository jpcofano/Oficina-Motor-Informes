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

  /* ⛔ `2026-08-22_22` §5 — **la premisa de este aviso era FALSA, y el aviso es el único de la
   * pantalla.**
   *
   * Decía *"La semana propuesta **no tiene fila en PERIODOS**"* mirando **sólo** si el `origen`
   * empieza con `periodo_ref:`. Medido el 22/08 en la hoja viva: la ventana propuesta es
   * `2026-08-14 → 2026-08-20` y **`agosto_14_20` es exactamente esa fila**. La consecuencia que
   * el aviso describe —que el recorte de `D-19` no se aplica— **es cierta**; la causa que le
   * atribuye, no.
   *
   * ⚠ **Y eso es tan caro como no avisar nada.** `CLAUDE.md` §4 lo tiene escrito para este mismo
   * aviso, cuando se lo redactó: *"mostrar una advertencia equivocada es tan caro como no mostrar
   * ninguna, porque la próxima se lee con la misma desconfianza"*. Ésta se leyó con desconfianza
   * dos días después de escribirla.
   *
   * ⭐ **El arreglo es buscar la fila que coincide, que es lo que el front ya sabe hacer** —
   * `periodoBuscado()` empareja por `desde`/`hasta` para la vía rápida—. Con eso el aviso deja de
   * ser una alarma y pasa a decir **qué apretar**: *"elegí `agosto_14_20`"*.
   *
   * ⚠ **Se compara por ventana y NO por nombre, y eso importa acá más que en el front:** hay dos
   * filas con la misma ventana —`agosto_14_20` y `'vie 14/08 -- jue 20/08 (por defecto)'`, la
   * fila 9 anotada como P1— y **elegir la equivocada produce un deck con cero encuentros**. Por
   * eso se ofrecen **todas** las que coinciden, no la primera: la pantalla no puede elegir por la
   * persona cuando una de las opciones vacía el informe. */
  var coincidentes = [];
  try {
    var periodos = leerPeriodos();
    Object.keys(periodos).forEach(function (id) {
      var p = periodos[id];
      var d = parsearFechaCelda_(p.desde), h = parsearFechaCelda_(p.hasta);
      if (!d || !h) return;
      if (formatearFecha_(d) === formatearFecha_(ventana.desde) &&
          formatearFecha_(h) === formatearFecha_(ventana.hasta)) coincidentes.push(id);
    });
  } catch (e) {
    // Un panel que no puede leer `PERIODOS` sigue sirviendo: el aviso se degrada, no se cae.
    coincidentes = [];
  }

  if (visibles) {
    var causa = coincidentes.length
      ? 'La semana propuesta **sí** tiene fila en PERIODOS —' +
        coincidentes.map(function (id) { return '"' + id + '"'; }).join(' y ') +
        '—, pero el selector quedó en «por defecto», así que la ventana se calculó y no se eligió.'
      : 'La semana propuesta no tiene fila en PERIODOS.';

    var salida = coincidentes.length === 1
      ? ' Para que el recorte se aplique, elegí "' + coincidentes[0] + '" en el selector.'
      : coincidentes.length > 1
        ? ' Para que el recorte se aplique hay que elegir una de esas filas en el selector. ' +
          '⚠ Son varias con la misma ventana: el recorte usa el `periodo_id`, así que la que ' +
          'ninguna reunión tenga cargada va a dejar el informe SIN encuentros.'
        : ' Para que el recorte se aplique hay que elegir un período de la lista, o crear la fila.';

    avisos.push({
      nivel: 'aviso',
      texto: causa + ' El informe se genera igual y sobre estas fechas, pero las secciones ' +
        'repetibles NO se recortan por período: entran las ' + visibles + ' reunión(es) con ' +
        'mostrar=sí' +
        (deOtros ? ', incluidas ' + deOtros + ' que ya tienen otro período asignado' : '') +
        '.' + salida
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
function panel_getEstado(periodoId) {
  // `2026-08-19_2` — el parámetro es **opcional y nuevo**: el front vuelve a pedir el estado
  // cuando la persona cambia de período, para que los cuadrados de temario digan cuántas filas
  // hay cargadas **para ese** período. Sin argumento se comporta igual que antes.
  periodoId = String(periodoId || '').trim();
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

  // `2026-08-19_2` Parte A — el mapa de cuadrados, uno por FUENTE DE TEMARIO y no por sección.
  // Va por informe porque `secco` y `jm` no comparten ni las secciones ni los modos.
  informes.forEach(function (inf) {
    inf.cuadrados = cuadradosDeInforme_(inf.id, ventana, periodoId);
  });

  return {
    ok: true,
    informes: informes,
    informe_activo: String(leerConfig().informe_activo || '').trim(),
    periodos: periodos,
    por_defecto: porDefecto,
    /* ⭐ `2026-08-21_1` — **el techo que la regla del panel dibuja sale de `CONFIG`, no de una
     * constante del HTML.**
     *
     * `TECHO_S = 350` estaba escrito en `Panel.html` y **el motor no lo leía de ahí**: el techo
     * real es `CONFIG.presupuesto_corrida_seg`. La mañana del 21/08 la hoja decía **150** —quedó
     * bajo de la prueba del mecanismo desatendido— y la regla del panel siguió dibujando una
     * escala hasta 350, así que el cronómetro pasó los 150 sin que nada se pusiera en rojo.
     * **Un techo declarado en dos lugares es un techo que puede mentir en uno de los dos**, y
     * mintió justo en el que la persona mira. Es la regla de `CLAUDE.md` §2 en su forma más
     * literal: un valor de negocio escrito en el código.
     *
     * `muro_seg` es el límite duro de Apps Script y **ése sí es una constante**: no lo elige
     * nadie de este proyecto y no cambia editando una celda. */
    reloj: {
      techo_seg: presupuestoCorridaSeg_(),
      reserva_seg: reservaCierreSeg_(),
      muro_seg: 360
    }
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
/**
 * ⭐ `2026-08-21_19` Parte A — **las opciones de una generación se arman en UN solo lugar.**
 *
 * Los dos botones del panel —la corrida de una ejecución y la desatendida— tienen que mandar
 * exactamente lo mismo, y la única forma de garantizarlo es que no haya dos constructores. Con
 * uno por camino, el día que se agregue una opción entra en uno y no en el otro, **y ninguno de
 * los dos falla**: el segundo botón simplemente empieza a hacer otra cosa. Es la misma familia
 * que las tres listas de hojas de registro de `CLAUDE.md` §2, con la diferencia de que acá la
 * duplicación **no** es el diseño y se puede eliminar.
 */
function panel_opcionesDeGeneracion_(conSimbolos, secciones) {
  return {
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
}

function panel_generar(informeId, periodoId, conSimbolos, secciones) {
  var id = String(informeId || '').trim();
  if (!id) return { ok: false, motivo: 'No se eligió informe.' };

  var ref = String(periodoId || '').trim();
  var opciones = panel_opcionesDeGeneracion_(conSimbolos, secciones);
  var r = generarInforme(id, ref || undefined, opciones);
  if (!r.ok) return { ok: false, motivo: r.motivo };

  return {
    ok: true,
    deck: r.deck,
    /* ⭐ `2026-08-21_15` Parte D — **la lámina, no el objeto.** El panel mostraba
     * `[object Object] · corrida jm-…`: `generarInforme` devuelve `periodo` como un objeto
     * —`lamina`, `desde`, `hasta`, `origen`, `calculado`, `traza`— y el front hace
     * `esc(r.periodo || '')` sobre él.
     *
     * **El arreglo va acá y no en el front, y eso se midió en vez de suponerlo:** el encabezado de
     * este archivo declara que `panel_generar` devuelve *"el reporte de corrida, **ya
     * presentable**"*. El que le debe una cadena al front es este adaptador. `periodo` no se
     * desarma en ningún lado: se imprime como etiqueta y en un solo lugar.
     *
     * ⛔ **Corrección del `2026-08-21_19` Parte D: la frase que seguía acá —*"`deck` viaja como
     * objeto a propósito, el front lo desarma en `deckCard`"*— era FALSA**, y por eso el href
     * decía `/presentation/d/[object Object]/edit`. Medido: `deckCard(deckId, …)` trata su primer
     * argumento como **id**, y de sus dos llamadores uno le pasa un id (`previa.deck_id`, la vía
     * rápida — funciona) y el otro el objeto entero (`r.deck`, la pantalla de listo — no
     * funciona). **Nadie desarmaba nada.**
     *
     * **Es exactamente el caso que `CLAUDE.md` §4 describe:** un comentario que afirma un
     * contrato es una premisa sin testigo, y sobrevive porque nada lo contradice. Éste además
     * mandaba al lector al archivo equivocado. `deck` sigue viajando como objeto —el front ahora
     * sí lo desarma, y usa su `url`, que es la que emitió el motor y no una reconstruida—, pero
     * eso se arregló en `Panel.html`, que es donde estaba el bug.
     *
     * ⚠ Se pierden `desde`, `hasta`, `calculado` y `traza`, y hoy **no los lee nadie** (grepeado:
     * `r.periodo` aparece una sola vez en `Panel.html`). El día que el panel quiera marcar una
     * ventana calculada, el campo vuelve como uno propio — no reabriendo el objeto entero. */
    periodo: (r.periodo && r.periodo.lamina) || '',
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

/* ═══════════════ `2026-08-19_2` — el panel por secciones (20/08/2026) ═══════════════
 *
 * **Un cuadrado por FUENTE DE TEMARIO, no por sección**, y esa diferencia es toda la Parte A.
 * `encuentro` y `comunicaciones_post` son dos secciones que iteran las dos sobre `REUNIONES`; lo
 * que las separa es el **filtro** (`etapa=post`), no la carga. **Un temario, dos secciones.**
 *
 * ⚠ **No es una comodidad de layout: es la guarda.** Con un cuadrado por sección habría dos cajas
 * escribiendo en la misma hoja, y el día que aparezca una tercera sección sobre `REUNIONES` serían
 * tres. `cargarTemarioReuniones_` ya no hace append ciego (Parte C), así que hoy no duplicaría —
 * pero tres cajas para un temario siguen siendo tres formas de contradecirse.
 */

/** Filas de una hoja de registro como objetos, con los encabezados vivos. Sólo lectura. */
function filasDeHojaRegistro_(nombreHoja) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  if (!hoja) return [];
  var datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return [];
  var headers = datos.shift();
  return datos.map(function (fila) {
    var o = {};
    headers.forEach(function (h, i) { o[h] = fila[i]; });
    return o;
  });
}

/**
 * Lo que hay cargado para una fuente y un período. `sin_confirmar` es lo que la persona todavía
 * tiene que mirar, y **cada fuente lo define distinto a propósito** — ver el punto 6 de la Parte 0
 * del prompt, que manda reportarlo y **no unificarlo**:
 *
 *   - `REUNIONES`: `mostrar` vacío. `parsearLineaReunion_` **nunca** marca `sí` — la persona
 *     confirma cuáles entran.
 *   - `CAMPANAS`: `mostrar` ya viene en `sí` (`AJ-1`, *ante la duda entra*), así que lo que queda
 *     por confirmar es el **id**: las notas con `SIN CONFIRMAR` o `SIN ID`.
 *
 * Son **dos criterios distintos para el mismo gesto** y el panel los pone uno al lado del otro.
 * Unificarlos es decisión del usuario, no de este código.
 */
function estadoDeTemario_(fuente, periodoId) {
  var filas = filasDeHojaRegistro_(fuente).filter(function (f) {
    return String(f.periodo_id || '').trim() === String(periodoId || '').trim();
  });

  var sinConfirmar = 0;
  if (fuente === 'REUNIONES') {
    filas.forEach(function (f) { if (!String(f.mostrar || '').trim()) sinConfirmar++; });
  } else if (fuente === 'CAMPANAS') {
    filas.forEach(function (f) {
      var n = String(f.notas || '');
      if (n.indexOf('SIN CONFIRMAR') !== -1 || n.indexOf('SIN ID') !== -1) sinConfirmar++;
    });
  }

  return {
    filas_cargadas: filas.length,
    sin_confirmar: sinConfirmar,
    puede_proponer: fuente === 'REUNIONES' || fuente === 'CAMPANAS'
  };
}

/**
 * Parte A — **el mapa de cuadrados, derivado de `SECCIONES` y nunca escrito a mano.**
 *
 * Las tres reglas de derivación, en el orden en que se evalúan:
 *
 *   1. **`manual`** cuando `SECCIONES.estado = 'manual'`. Gana sobre todo lo demás: si es
 *      redacción, no hay caja ni ventana que ofrecer.
 *   2. **`temario`** cuando es `repetible` **y** su `itera_sobre` está en `FUENTES_ITERACION_`.
 *      Las secciones se agrupan por `itera_sobre`: un cuadrado por fuente.
 *   3. **`ventana`** en el resto.
 *
 * ⚠ **El caso que NO puede caer en la 2 por descuido:** una sección `repetible` cuyo `itera_sobre`
 * **no** es fuente de iteración. Al 20/08 son cinco —`AUDIENCIAS`, `remitente (JM / GCBA)`,
 * `red social`, `proveedor`, `tema`— y **no tienen hoja donde escribir**. Van a `ventana` con el
 * motivo declarado: **ofrecerles una caja sería una caja que no escribe en ningún lado**, y eso es
 * peor que no ofrecerla.
 *
 * ⓘ Medido el 20/08: de esas cinco, **tres ya son `manual`** —`red social`, `proveedor`, `tema`—
 * así que las agarra la regla 1 antes que la 3. Las que llegan a la 3 con motivo son `AUDIENCIAS`
 * y `remitente (JM / GCBA)`, las dos en `estado = revisar`. El resultado visible es el mismo
 * —ninguna ofrece caja— pero por dos caminos distintos, y conviene saberlo antes de "simplificar"
 * el orden de las reglas.
 */
function cuadradosDeInforme_(informeId, ventana, periodoId) {
  var todas = leerSeccionesPlano_();
  var mias = Object.keys(todas)
    .map(function (id) {
      var s = todas[id];
      s.seccion_id = s.seccion_id || id;
      return s;
    })
    .filter(function (s) {
      var informes = String(s.informes || '').split(',').map(function (i) { return i.trim().toLowerCase(); });
      return informes.indexOf(String(informeId).toLowerCase()) !== -1;
    })
    .sort(function (a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); });

  var porFuente = {};   // itera_sobre -> cuadrado de temario
  var sueltos = [];

  mias.forEach(function (s) {
    var resumenSeccion = {
      id: s.seccion_id,
      nombre: String(s.nombre || s.seccion_id),
      filtro: String(s.filtro || '').trim()
    };
    var modo = String(s.modo || '').trim();
    var estado = String(s.estado || '').trim();
    var itera = String(s.itera_sobre || '').trim();

    // 1 · manual
    if (estado === 'manual') {
      sueltos.push({
        clave: 'seccion:' + s.seccion_id,
        titulo: resumenSeccion.nombre,
        modo: 'manual',
        secciones: [resumenSeccion],
        motivo: String(s.falta || '').trim() || 'se carga a mano: es redacción, no dato'
      });
      return;
    }

    // 2 · temario — un cuadrado por fuente, y las secciones se acumulan adentro
    if (modo === 'repetible' && FUENTES_ITERACION_.indexOf(itera) !== -1) {
      if (!porFuente[itera]) {
        porFuente[itera] = {
          clave: itera,
          titulo: 'Temario — ' + (itera === 'REUNIONES' ? 'encuentros' : 'campañas'),
          modo: 'temario',
          secciones: [],
          // Lo cargado se cuenta para el período que la persona tiene elegido. Con el selector
          // en "por defecto" no hay período con nombre y el conteo da cero — que es la verdad:
          // `D-19` dice que una fila sin período no entra a ningún informe, así que "cuántas hay
          // cargadas para esta corrida" **no tiene respuesta** hasta que se elija uno.
          temario: estadoDeTemario_(itera, periodoId)
        };
      }
      porFuente[itera].secciones.push(resumenSeccion);
      return;
    }

    // 3 · ventana — con motivo cuando itera sobre algo que no es un registro del motor
    sueltos.push({
      clave: 'seccion:' + s.seccion_id,
      titulo: resumenSeccion.nombre,
      modo: 'ventana',
      secciones: [resumenSeccion],
      motivo: (modo === 'repetible' && itera)
        ? 'itera sobre "' + itera + '", que no es un registro del motor: no hay hoja donde escribir un temario'
        : '',
      ventana: ventana && ventana.ok ? {
        etiqueta: formatearPeriodoLamina_(ventana),
        desde: formatearFecha_(ventana.desde),
        hasta: formatearFecha_(ventana.hasta),
        origen: ventana.origen
      } : null
    });
  });

  // Los cuadrados de temario van primero: son los que la persona toca.
  var conTemario = FUENTES_ITERACION_
    .filter(function (f) { return porFuente[f]; })
    .map(function (f) { return porFuente[f]; });

  return conTemario.concat(sueltos);
}

/* ─────────────────────────── Parte B — **Proponer** ───────────────────────────
 *
 * ⭐ **La regla que gobierna los dos proponedores: devuelven TEXTO, no filas.** El proponedor arma
 * el texto del temario y lo pone en la caja; **no escribe una sola fila**. La persona lo lee, lo
 * edita, y recién entonces aprieta cargar — el mismo cargador y la misma confirmación de siempre.
 *
 * ⚠ **Por qué, y es `R-02` literal:** *el temario define el universo del informe, no la fecha*. Si
 * Proponer escribiera filas, **la ventana estaría eligiendo qué entra al deck**, que es justo lo
 * que `R-02` prohíbe. Con texto en una caja, lo que entra sigue siendo lo que una persona pegó, y
 * el botón es una comodidad de tipeo y no una fuente de verdad.
 */

/**
 * B.1 — propone reuniones desde `rdv`, en el formato que `parsearLineaReunion_` ya sabe leer.
 *
 * ⭐ **Una línea por etapa: si el encuentro va a tener `pre` y `post`, salen DOS líneas**
 * (decisión del usuario, 20/08/2026), no una sola con `(pre + post)`. El parser reconoce
 * `(pre)` y `(post)` **exactos** y nada más — y eso está bien: es el formato que el temario real
 * usa, y es lo que hace que `claveReunion_` pueda distinguirlas.
 *
 * ⚠ **`status` NO filtra: se muestra.** `rdv` es la fuente de verdad de fecha y estado, y un
 * encuentro cancelado o reprogramado **tiene que verse en la propuesta para que la persona lo
 * saque**. Sacarlo automáticamente sería la ventana eligiendo otra vez.
 *
 * ⚠ **Y dónde va el estado, que es lo que el prompt no podía prever:** el parser lee **un solo**
 * paréntesis, el último de la línea. Con `(pre)`/`(post)` ocupando ese lugar, el estado no puede
 * ir también ahí. Va **antes de la etapa** —`… 23/07 (Cancelada) (post)`—, y se verificó corriendo
 * el parser real: el paréntesis final gana la `etapa`, y `(Cancelada)` queda **después de la
 * fecha**, así que el recorte del nombre lo descarta. Resultado: `nombre` sale limpio, `etapa` sale
 * bien, **la persona ve el estado en la caja** y el texto entero sobrevive en `texto_original`.
 */
function proponerTemarioReuniones_(ventana) {
  var lectura = leerFuente('rdv', ventana);
  if (!lectura.ok) return { ok: false, motivo: 'no pude leer rdv: ' + lectura.motivo };

  var hoja = lectura.hoja;
  var cFecha = buscarMapeo('rdv', hoja, 'fecha');
  var cFigura = buscarMapeo('rdv', hoja, 'figura');
  var cBarrio = buscarMapeo('rdv', hoja, 'barrio');
  var cEvento = buscarMapeo('rdv', hoja, 'evento');
  var cStatus = buscarMapeo('rdv', hoja, 'status');
  if (!cFecha.ok || !cBarrio.ok) {
    return { ok: false, motivo: 'falta MAPEO de fecha/barrio para rdv/' + hoja };
  }

  var lineas = [];
  var afuera = [];
  var orden = 0;

  lectura.filas.forEach(function (f) {
    var cruda = valorPorColumna_(f, 'rdv', hoja, cFecha.columna);
    var fecha = (cruda instanceof Date) ? cruda : parsearFechaCelda_(cruda);
    if (!fecha) { afuera.push({ que: '(fila sin fecha legible)', motivo: 'no se pudo leer la fecha' }); return; }

    var barrio = String(cBarrio.ok ? valorPorColumna_(f, 'rdv', hoja, cBarrio.columna) : '').trim();
    if (!barrio) { afuera.push({ que: formatearFecha_(fecha), motivo: 'sin barrio' }); return; }

    var figura = String(cFigura.ok ? valorPorColumna_(f, 'rdv', hoja, cFigura.columna) : '').trim();
    var evento = String(cEvento.ok ? valorPorColumna_(f, 'rdv', hoja, cEvento.columna) : '').trim();
    var status = String(cStatus.ok ? valorPorColumna_(f, 'rdv', hoja, cStatus.columna) : '').trim();

    // El eje sale de la figura: `Jorge Macri` es `JM` y todo lo demás es `Ministros`, que es el
    // mismo corte que `ambito` (`D-33`) expresado en el vocabulario del temario.
    var eje = normalizar_(figura) === normalizar_('Jorge Macri') ? 'JM' : 'Ministros';

    var dia = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM');
    var cuerpo = (evento ? evento + ' ' : '') + barrio + ' ' + dia + (status ? ' (' + status + ')' : '');

    // Dos líneas: una por etapa. La persona borra la que no corresponda — que es más barato que
    // tipear la que falta.
    ['pre', 'post'].forEach(function (etapa) {
      orden++;
      lineas.push(orden + ') ' + eje + ' | ' + cuerpo + ' (' + etapa + ')');
    });
  });

  return {
    ok: true,
    texto: lineas.join('\n'),
    propuestas: lineas.length,
    encuentros: lineas.length / 2,
    afuera: afuera,
    // B.3 — una propuesta vacía dice POR QUÉ, en vez de devolver una caja vacía indistinguible
    // de "no hay nada esta semana".
    motivo_vacio: lineas.length ? '' : (
      lectura.filas.length
        ? 'rdv trajo ' + lectura.filas.length + ' fila(s) en la ventana y ninguna quedó utilizable — ver el detalle'
        : 'rdv no trajo ninguna fila en la ventana ' + formatearFecha_(ventana.desde) + '–' + formatearFecha_(ventana.hasta)
    )
  };
}

/**
 * B.2 — propone campañas desde `catalogoDeCampanas_()`, en el formato que
 * `parsearLineaCampana_` lee, **con el encabezado `> Campañas destacadas`**: sin ese encabezado el
 * cargador no encuentra el bloque y falla con motivo.
 *
 * ⚠ **Solape, no contención.** Los períodos declarados abarcan varias semanas —*24/06 al 08/07*,
 * *19/06 al 17/07*—, así que exigir que la campaña **empiece** dentro de la ventana dejaría afuera
 * justo las largas, que son las destacadas.
 *
 * ⚠ **El nombre que se propone es el de la base**, no el del deck. Así la resolución nombre → id
 * **acierta sola** y no queda ningún `SIN CONFIRMAR` que revisar. Es la diferencia entre proponer
 * y adivinar: **se propone el texto que ya se sabe que resuelve.**
 */
function proponerTemarioCampanas_(ventana) {
  var cat = catalogoDeCampanas_();
  if (!cat.ok) return { ok: false, motivo: 'no pude leer el catálogo de campañas: ' + cat.motivo };

  var lineas = [];
  var afuera = [];
  var orden = 0;

  cat.lista.forEach(function (c) {
    var desde = (c.desde instanceof Date) ? c.desde : parsearFechaCelda_(c.desde);
    var hasta = (c.hasta instanceof Date) ? c.hasta : parsearFechaCelda_(c.hasta);
    if (!desde || !hasta) { afuera.push({ que: c.nombre || c.id, motivo: 'sin desde/hasta legibles' }); return; }

    // Solape: la campaña entra si su intervalo toca la ventana en algún punto.
    if (hasta < ventana.desde || desde > ventana.hasta) {
      afuera.push({
        que: c.nombre || c.id,
        motivo: 'no solapa la ventana (' + formatearFecha_(desde) + '–' + formatearFecha_(hasta) + ')'
      });
      return;
    }

    orden++;
    lineas.push(orden + ') ' + (c.nombre || c.alterno || c.id));
  });

  return {
    ok: true,
    texto: lineas.length ? '> Campañas destacadas\n' + lineas.join('\n') : '',
    propuestas: lineas.length,
    afuera: afuera,
    motivo_vacio: lineas.length ? '' : (
      cat.lista.length
        ? 'ninguna de las ' + cat.lista.length + ' campañas del catálogo solapa la ventana ' +
          formatearFecha_(ventana.desde) + '–' + formatearFecha_(ventana.hasta)
        : 'el catálogo de campañas vino vacío'
    )
  };
}

/**
 * El botón **Proponer** del panel. `fuente` es `'REUNIONES'` o `'CAMPANAS'`.
 *
 * ⛔ **Sólo lectura, y es la propiedad que hay que poder verificar**: después de apretarlo,
 * `REUNIONES` y `CAMPANAS` tienen exactamente las mismas filas que antes.
 */
function panel_proponerTemario(fuente, periodoId) {
  var ref = String(periodoId || '').trim();
  var ventana = ref ? resolverVentana({ periodo_ref: ref }) : resolverVentana({});
  if (!ventana.ok) return { ok: false, motivo: 'no se pudo resolver el período: ' + ventana.motivo };

  var r = String(fuente) === 'REUNIONES' ? proponerTemarioReuniones_(ventana)
    : String(fuente) === 'CAMPANAS' ? proponerTemarioCampanas_(ventana)
    : { ok: false, motivo: 'fuente desconocida: "' + fuente + '". Las que proponen son REUNIONES y CAMPANAS.' };

  if (!r.ok) return r;
  r.ventana = {
    etiqueta: formatearPeriodoLamina_(ventana),
    desde: formatearFecha_(ventana.desde),
    hasta: formatearFecha_(ventana.hasta),
    origen: ventana.origen
  };
  return r;
}

/**
 * El botón **Cargar** del panel. Pasa por los cargadores de siempre — **no hay un segundo camino
 * de escritura**, que es lo que `docs/ESCRITORES.md` exige de cualquier puerta nueva.
 *
 * El `periodo_id` es obligatorio y no se deduce: `D-19`, y `cargarTemario` ya falla explícito si
 * falta. Acá se valida antes para no llegar con un error de más abajo.
 */
function panel_cargarTemario(fuente, texto, periodoId, informeId) {
  var ref = String(periodoId || '').trim();
  if (!ref) return { ok: false, motivo: 'Elegí un período de la lista antes de cargar: una fila sin período no entra a ningún informe (D-19).' };
  if (!leerPeriodos()[ref]) return { ok: false, motivo: 'El período "' + ref + '" no existe en PERIODOS.' };
  if (!texto || !String(texto).trim()) return { ok: false, motivo: 'La caja está vacía.' };

  if (String(fuente) === 'REUNIONES') return cargarTemarioReuniones_(texto, ref);
  if (String(fuente) === 'CAMPANAS') return cargarTemarioCampanas_(texto, ref, String(informeId || '').trim());
  return { ok: false, motivo: 'fuente desconocida: "' + fuente + '"' };
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════
 * Anclajes — `2026-08-21_16` Partes A y B
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * `D-29` (addendum 21/08/2026) decidió que la pantalla **lee `ANCLAJE_PENDIENTE` y no corre
 * `anclarEncuentros`**, por dos motivos: los ~50 s por apertura —`cacheAnclaje_` es una global de
 * módulo y en Apps Script eso se reinicia entre invocaciones— y, el que de verdad decide, que
 * **la hoja no es un caché**: es el registro que el motor consulta con `anclajeYaConfirmado_`
 * antes de anclar. Confirmar ahí es confirmar lo que la próxima corrida va a leer.
 */

/** La clave de una fila de `ANCLAJE_PENDIENTE`, la misma que arma `indiceAnclajePendiente_`. */
function claveAnclaje_(tipo, nombreBuscado) {
  return String(tipo || '').trim() + '||' + String(nombreBuscado || '').trim();
}

/**
 * Los tres candidatos de una fila, en orden y sin los huecos.
 *
 * ⚠ **Una fila puede traer menos de tres**: `registrarAnclajePendiente_` escribe `''` cuando el
 * top-3 no llega a tres. Un candidato vacío **no es elegible**, y por eso se filtra acá y no en
 * cada consumidor — si cada uno lo filtrara por su cuenta, el que se olvide acepta el `''` como
 * si fuera un candidato y `elegido` queda vacío pareciendo confirmado.
 */
function candidatosDeAnclaje_(fila) {
  var salida = [];
  for (var i = 1; i <= 3; i++) {
    var nombre = String(fila['candidato_' + i] == null ? '' : fila['candidato_' + i]).trim();
    if (!nombre) continue;
    salida.push({ nombre: nombre, puntaje: fila['puntaje_' + i] });
  }
  return salida;
}

/**
 * ⭐ **Pura, y es la mitad que el control positivo puede fijar.** Decide si un `elegido` es
 * aceptable para una fila dada.
 *
 * **La regla y su motivo:** el valor tiene que ser **uno de los candidatos de esa fila**, o
 * **vacío** para desconfirmar. Cualquier otra cosa se rechaza. Un `elegido` que nadie puntuó hace
 * que el motor ancle contra algo que ningún score miró — que es **el modo de falla que `D-29`
 * viene a cerrar, entrando por la puerta nueva**.
 *
 * ⚠ **Desconfirmar tiene que ser posible**, y no es una comodidad: si `elegido` sólo se puede
 * poner y no sacar, un error de tipeo obliga a ir a la planilla y el panel deja de ser el camino.
 *
 * ⚠ **Los dos lados se normalizan** (`CLAUDE.md` §2): el valor viaja por el front y vuelve, y la
 * celda puede traer espacios de más. Comparar crudo falla en silencio.
 */
function validarEleccionAnclaje_(fila, elegido) {
  var valor = String(elegido == null ? '' : elegido).trim();
  if (valor === '') return { ok: true, valor: '' };

  var candidatos = candidatosDeAnclaje_(fila);
  var coincide = candidatos.filter(function (c) { return c.nombre === valor; })[0];
  if (coincide) return { ok: true, valor: coincide.nombre };

  return {
    ok: false,
    motivo: 'el valor "' + valor + '" no es ninguno de los candidatos de esta fila (' +
      (candidatos.length ? candidatos.map(function (c) { return '"' + c.nombre + '"'; }).join(', ')
        : 'no tiene candidatos') + '). Se rechaza: un `elegido` que nadie puntuó ancla contra ' +
      'algo que ningún score miró, que es el modo de falla que `D-29` cierra'
  };
}

/**
 * B.1 · Lee `ANCLAJE_PENDIENTE` para la pantalla.
 *
 * ⛔ **Leer no escribe: si la hoja no existe devuelve vacío y NO la crea.** Por eso va con
 * `getSheetByName` y no con `obtenerHojaAnclajePendiente_`, que la crearía — una pestaña que se
 * abre no debería dejar una hoja nueva en la planilla del usuario.
 *
 * **Separa pendientes de confirmadas** porque son dos cosas distintas en pantalla: las
 * confirmadas son decisiones que la próxima corrida va a respetar **sin volver a preguntar**, y
 * esconderlas las vuelve invisibles.
 *
 * ⛔ **Y marca las que ninguna reunión vigente reclama — el límite 2 del addendum a `D-29`.**
 * `registrarAnclajePendiente_` **nunca borra**: la hoja acumula. Medido el 21/08: de las dos
 * filas que tenía, una venía de una fila de `REUNIONES` con `mostrar = no`, y `leerReuniones_`
 * filtra por `mostrar` — o sea que **hoy no podría escribirse** y quedó de una corrida anterior.
 * Sin este cruce, la pantalla ofrecería confirmar un encuentro que ya no va al deck y **nada la
 * distinguiría de una vigente**.
 *
 * ⚠ **El cruce es por la clave, no por el nombre**: la clave es
 * `normalizar_(nombre)|fecha|etapa` y dos reuniones distintas pueden compartir nombre.
 * ⚠ **Se marca, no se borra ni se esconde** — borrar una decisión que alguien tomó es lo que
 * `CLAUDE.md` §4 prohíbe, y esconderla reinstala el silencio que `D-19`/`D-21` cierran.
 */
function panel_getAnclajes() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ANCLAJE_PENDIENTE');
  if (!hoja) {
    return {
      ok: true, existe_hoja: false, umbral: umbralAnclajeReunion_(),
      pendientes: [], confirmadas: [], sin_reunion: 0
    };
  }

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift() || [];

  // Las claves de las reuniones que HOY se muestran, para el cruce del límite 2.
  var vigentes = {};
  leerReuniones_().forEach(function (r) {
    var fecha = (r.fecha instanceof Date) ? r.fecha : parsearFechaCelda_(r.fecha);
    vigentes[claveAnclaje_('reunion', normalizar_(r.nombre) + '|' +
      (fecha ? Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd') : 'sin_fecha') +
      '|' + (r.etapa || ''))] = true;
  });

  var pendientes = [];
  var confirmadas = [];
  var sinReunion = 0;
  var archivadas = 0;

  datos.forEach(function (cruda) {
    var fila = {};
    headers.forEach(function (h, i) { fila[h] = cruda[i]; });

    var tipo = String(fila.tipo || '').trim();
    var nombreBuscado = String(fila.nombre_buscado || '').trim();
    if (!tipo && !nombreBuscado) return;   // fila en blanco al final de la hoja

    var vigente = vigentes[claveAnclaje_(tipo, nombreBuscado)] === true;
    if (!vigente) sinReunion++;

    /* ⭐ `2026-08-21_19` Parte C — **archivar esconde huérfanas, nunca vigentes.**
     *
     * La condición es `archivada && !vigente`, y ahí está toda la reversibilidad que el paso pide:
     * **si la reunión vuelve a `mostrar = sí`, la fila reaparece sola**, sin que nadie tenga que
     * acordarse de desarchivarla. Archivar significa *«no me muestres esta huérfana»*, no *«no me
     * muestres nunca esta clave»* — son dos cosas distintas y la segunda es la que se olvida
     * encendida.
     *
     * ⚠ **Y la fila NO se borra**: es el registro que el motor consulta antes de anclar
     * (`anclajeYaConfirmado_`), y borrarla haría que la próxima corrida vuelva a preguntar lo
     * mismo — el paso humano dejaría de ser control y pasaría a trámite. */
    var archivada = esVerdadero_(fila.archivada);
    if (archivada && !vigente) { archivadas++; return; }

    var item = {
      tipo: tipo,
      nombre_buscado: nombreBuscado,
      candidatos: candidatosDeAnclaje_(fila),
      elegido: String(fila.elegido == null ? '' : fila.elegido).trim(),
      vigente: vigente,
      // Viaja aunque hoy sólo importe cuando es `false`: una vigente marcada archivada se muestra
      // igual, y la pantalla tiene que poder decir por qué reapareció.
      archivada: archivada
    };
    if (item.elegido) confirmadas.push(item);
    else pendientes.push(item);
  });

  return {
    ok: true,
    existe_hoja: true,
    umbral: umbralAnclajeReunion_(),
    pendientes: pendientes,
    confirmadas: confirmadas,
    // ⚠ Cuenta TODAS las que ninguna reunión vigente reclama, archivadas incluidas. Si contara
    // sólo las visibles, archivar haría bajar el número y **el problema parecería resolverse
    // solo** — que es exactamente lo que archivar no hace.
    sin_reunion: sinReunion,
    // Y cuántas de ésas están escondidas, para que el total nunca baje en silencio.
    archivadas: archivadas
  };
}

/**
 * ⭐ C.2 · Archiva —o desarchiva— una fila huérfana de `ANCLAJE_PENDIENTE`.
 *
 * ⚠ **La clave es `(tipo, nombre_buscado)`, no la posición de fila**, por lo mismo que
 * `panel_confirmarAnclaje`: el panel puede estar mostrando una lista vieja, y escribir por índice
 * pondría la marca en la fila equivocada **sin que nada falle**.
 *
 * ⛔ **No inventa filas.** Si la clave no está, falla con motivo — una corrida que no hizo nada
 * tiene que fallar, no informar cero (`CLAUDE.md` §4).
 *
 * ⛔ **Y no archiva una vigente.** Sería la única forma de esconder algo que la próxima corrida
 * sí va a mirar, y el pedido explícito era el contrario: lo que está marcado *«ninguna reunión
 * vigente la reclama»* es lo archivable. Se rechaza con el motivo dicho en vez de aceptarlo y no
 * tener efecto — una escritura que se acepta y no cambia nada es un cero disfrazado de éxito.
 */
function panel_archivarAnclaje(tipo, nombreBuscado, archivar) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ANCLAJE_PENDIENTE');
  if (!hoja) return { ok: false, motivo: 'la hoja ANCLAJE_PENDIENTE no existe todavía' };

  var col = columnaArchivadaDeAnclaje_(hoja);
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0] || [];
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var buscada = claveAnclaje_(tipo, nombreBuscado);
  for (var f = 1; f < datos.length; f++) {
    if (claveAnclaje_(datos[f][idx.tipo], datos[f][idx.nombre_buscado]) !== buscada) continue;

    if (archivar === true) {
      // La misma clave que arma `panel_getAnclajes`, y por el mismo camino: `leerReuniones_` ya
      // filtra por `mostrar`. Reproducir acá ese criterio sería el instrumento que reimplementa
      // al motor y lo reimplementa peor.
      var vigente = false;
      leerReuniones_().forEach(function (r) {
        var fecha = (r.fecha instanceof Date) ? r.fecha : parsearFechaCelda_(r.fecha);
        var clave = claveAnclaje_('reunion', normalizar_(r.nombre) + '|' +
          (fecha ? Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd') : 'sin_fecha') +
          '|' + (r.etapa || ''));
        if (clave === buscada) vigente = true;
      });
      if (vigente) {
        return {
          ok: false,
          motivo: 'esa fila SÍ la reclama una reunión vigente, así que no se archiva: la próxima ' +
            'corrida la va a mirar y esconderla sería esconder una decisión que hace falta. ' +
            'Archivar es para las que dicen "ninguna reunión vigente la reclama".'
        };
      }
    }

    hoja.getRange(f + 1, col).setValue(archivar === true ? 'sí' : '');
    SpreadsheetApp.flush();
    return {
      ok: true,
      tipo: String(tipo || '').trim(),
      nombre_buscado: String(nombreBuscado || '').trim(),
      archivada: archivar === true,
      accion: archivar === true ? 'archivada' : 'desarchivada'
    };
  }

  return {
    ok: false,
    motivo: 'no hay ninguna fila con tipo="' + tipo + '" y nombre_buscado="' + nombreBuscado +
      '" en ANCLAJE_PENDIENTE. No se inventa la fila.'
  };
}

/**
 * El número de columna de `archivada`, **creándola si la hoja es vieja**.
 *
 * ⚠ La hoja se crea con `HEADERS_ANCLAJE_PENDIENTE_` y sólo esa vez, así que agregar el nombre a
 * la lista no migra ninguna hoja existente. Esto es el `COLUMNAS_DELTA_` de esta hoja —que no es
 * de registro y por eso no lo tiene—, reducido a lo único que hace falta: **agregar al final**.
 *
 * ⭐ **Al final y nunca en el medio.** `registrarAnclajePendiente_` reescribe la fila por posición
 * con nueve valores; una columna insertada antes de la novena haría que ese escritor empiece a
 * poner puntajes donde van nombres, **y no fallaría**.
 */
function columnaArchivadaDeAnclaje_(hoja) {
  var ultima = hoja.getLastColumn();
  var headers = hoja.getRange(1, 1, 1, ultima).getValues()[0];
  var i = headers.indexOf('archivada');
  if (i >= 0) return i + 1;
  hoja.getRange(1, ultima + 1).setValue('archivada');
  SpreadsheetApp.flush();
  return ultima + 1;
}

/**
 * B.2 · Escribe `elegido` en la fila de un `(tipo, nombre_buscado)`.
 *
 * ⚠ **La clave es `(tipo, nombre_buscado)`, no la posición de fila**, y eso no es prolijidad: el
 * panel puede estar mostrando una lista vieja y la fila puede haberse movido. Escribir por índice
 * pondría la decisión en la fila equivocada **sin que nada falle**.
 *
 * ⛔ **No inventa filas.** Si la clave no está en la hoja, falla con motivo — igual que
 * `curarCamposMarcadores_`: una corrida que no hizo nada tiene que fallar, no informar cero.
 */
function panel_confirmarAnclaje(tipo, nombreBuscado, elegido) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ANCLAJE_PENDIENTE');
  if (!hoja) return { ok: false, motivo: 'la hoja ANCLAJE_PENDIENTE no existe todavía' };

  var datos = hoja.getDataRange().getValues();
  var headers = datos[0] || [];
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });
  if (idx.elegido === undefined) {
    return { ok: false, motivo: 'ANCLAJE_PENDIENTE no tiene columna `elegido`' };
  }

  var buscada = claveAnclaje_(tipo, nombreBuscado);
  for (var f = 1; f < datos.length; f++) {
    if (claveAnclaje_(datos[f][idx.tipo], datos[f][idx.nombre_buscado]) !== buscada) continue;

    var fila = {};
    headers.forEach(function (h, i) { fila[h] = datos[f][i]; });

    var v = validarEleccionAnclaje_(fila, elegido);
    if (!v.ok) return { ok: false, motivo: v.motivo };

    hoja.getRange(f + 1, idx.elegido + 1).setValue(v.valor);
    SpreadsheetApp.flush();
    return {
      ok: true,
      tipo: String(tipo || '').trim(),
      nombre_buscado: String(nombreBuscado || '').trim(),
      elegido: v.valor,
      accion: v.valor ? 'confirmado' : 'desconfirmado'
    };
  }

  return {
    ok: false,
    motivo: 'no hay ninguna fila con tipo="' + tipo + '" y nombre_buscado="' + nombreBuscado +
      '" en ANCLAJE_PENDIENTE. No se inventa la fila: el motor la escribe cuando un anclaje ' +
      'cae bajo el umbral'
  };
}

/* ═════════ `2026-08-21_19` — el desatendido entra al camino del usuario (22/08/2026) ═════════
 *
 * `Desatendida.gs` tenía el mecanismo completo desde el 20/08 —plan por sección, encadenado por
 * triggers, autolimpieza, freno y cuatro guardas— y **no estaba cableado a ningún lado**: se
 * arrancaba con `iniciarCorridaDesatendidaJM()` desde el editor.
 *
 * ⛔ **Lo que eso significaba en el camino del usuario, y por qué ya estaba mordiendo:**
 * `panel_generar` llama a `generarInforme` **sin `continuable`**, así que no escribe
 * `PLAN_CORRIDA` ni crea trigger — **el botón podía cortar y dejar un deck incompleto sin forma
 * de continuarlo**. Hasta el 21/08 no se notaba porque ninguna corrida había cortado; esa noche
 * cortaron dos, y la evidencia sobrevive en el nombre del archivo: el deck de
 * `jm-20260821-224727` **todavía conserva el `[en proceso]`** y el de `jm-20260821-194602` no.
 *
 * ⚠ **El botón viejo NO se retira, y no es prudencia genérica:** una corrida que entra en una
 * sola ejecución es más barata —el arranque cuesta 70-80 s **por ejecución**, así que tres
 * ejecuciones pagan 210 s de anclaje y unión que la corrida única paga una vez—. Mientras el
 * desatendido no esté probado punta a punta, sacarle al usuario la única forma que funciona hoy
 * es un cambio en la dirección equivocada. **Dos botones, y la pantalla dice cuál conviene.**
 *
 * Las tres funciones de acá abajo son **el adaptador y nada más**: arrancan, leen y frenan. No
 * reimplementan el mecanismo — `iniciarCorridaDesatendida_`, `leerEstadoCorrida_`, `leerPlan_` y
 * `cancelarCorridaDesatendida()` ya existían y hacen todo el trabajo.
 */

/**
 * Arranca la corrida **desatendida** con lo que el usuario eligió en pantalla.
 *
 * ⭐ **Misma firma que `panel_generar`, a propósito.** El front no tiene que aprender una forma
 * nueva para el segundo botón, y las opciones salen del mismo constructor
 * (`panel_opcionesDeGeneracion_`), que es lo que impide que los dos caminos se separen.
 *
 * ⚠ **La guarda de «ya hay una corrida en curso» se devuelve, no se esconde.** Hasta hoy sólo iba
 * al `Logger`, que en el camino del usuario es no decir nada: el botón parecía no hacer efecto.
 */
function panel_generarDesatendida(informeId, periodoId, conSimbolos, secciones) {
  var id = String(informeId || '').trim();
  if (!id) return { ok: false, motivo: 'No se eligió informe.' };

  var ref = String(periodoId || '').trim();
  var r = iniciarCorridaDesatendida_(id, ref || undefined,
    panel_opcionesDeGeneracion_(conSimbolos, secciones));

  if (!r || !r.ok) {
    return {
      ok: false,
      motivo: (r && r.motivo) || 'La ejecución 1 no devolvió resultado.',
      // Con el motivo «ya hay una corrida en curso» estos dos son la salida: cuál está
      // corriendo y por dónde va. Sin ellos el cartel no dice qué hacer.
      corrida_id: (r && r.corrida_id) || '',
      ejecucion: (r && r.ejecucion) || 0,
      deck: (r && r.deck) || panel_deckDeId_((r && r.deck_id) || '')
    };
  }

  return {
    ok: true,
    // `terminada` = entró en una sola ejecución y no hay nada que reanudar. `continua` = cortó,
    // quedó plan y hay un trigger andando. **Son dos finales distintos y la pantalla los dice
    // distinto**: uno manda a abrir el deck, el otro a mirar el avance.
    terminada: r.terminada === true,
    continua: r.continua === true,
    corrida_id: r.corrida_id || '',
    ejecuciones: r.ejecuciones || 1,
    deck: r.deck || null
  };
}

/**
 * ⭐ **El estado de la corrida desatendida, SÓLO LECTURA.** No recalcula nada: sale de
 * `leerEstadoCorrida_` y `leerPlan_`, que ya existían.
 *
 * Sin esto el botón de la Parte A es **peor** que el actual: hoy el usuario ve el resultado; con
 * el desatendido vería nada durante minutos.
 *
 * ⭐ **Y contesta «¿está listo?» por el sello, no por los tokens.** El sello vive en el nombre del
 * deck y es la única señal que lo dice: **los crudos NO dicen qué falta** — `mapaTokenObjectId_`
 * excluye a propósito los de láminas escondidas, así que las láminas 12, 21 y 29 dejan **49 crudos
 * permanentes en toda corrida**, incluso en una que terminó perfecta.
 *
 * ⚠ **Con la corrida terminada el estado ya no está, y por eso se cae a `PLAN_CORRIDA`.** Los
 * cinco caminos de salida borran la propiedad —bien: es lo que declara que no hay nada
 * corriendo— y con ella se va el `corrida_id`. La hoja del plan no se borra nunca, así que
 * `ultimaCorridaDelPlan_()` recupera la clave sin agregar ningún escritor. Es la diferencia
 * entre una pantalla que se apaga justo cuando terminó y una que muestra en qué terminó.
 */
function panel_estadoDesatendida() {
  var estado = leerEstadoCorrida_();
  var corridaId = estado ? String(estado.corrida_id || '') : ultimaCorridaDelPlan_();

  var base = {
    ok: true,
    en_curso: !!estado,
    corrida_id: corridaId,
    // El reloj de la lectura. **La pantalla tiene que poder decir de cuándo es lo que muestra**;
    // sin esto, una pantalla vieja y una recién leída se ven igual.
    leido: formatearFechaHora_(new Date()),
    tope: topeContinuaciones_(),
    plan: [],
    deck: null,
    informe_id: '', periodo_id: '', ejecucion: 0, se_corto: false
  };

  if (!corridaId) {
    base.motivo = 'No hay ninguna corrida desatendida en curso, y PLAN_CORRIDA no tiene ' +
      'ninguna fila: nunca corrió una.';
    return base;
  }

  var filas = leerPlan_(corridaId);

  if (estado) {
    base.informe_id = String(estado.informe_id || '');
    base.periodo_id = String(estado.periodo_id || '');
    base.ejecucion = Number(estado.ejecucion) || 0;
    base.se_corto = estado.se_corto === true;
    base.deck = panel_deckDeId_(estado.deck_id || '');
  } else {
    base.informe_id = filas.length ? String(filas[0].informe_id || '') : '';
    base.motivo = 'No hay ninguna corrida desatendida en curso. Lo que se muestra es el plan ' +
      'de la última que dejó filas, ' + corridaId + '.';
  }

  base.plan = filas.map(function (f) {
    return {
      seccion_id: String(f.seccion_id || ''),
      asignaciones: Number(f.asignaciones) || 0,
      // Hoy el motor sólo escribe `pendiente` y `hecha`; los otros dos estados están en el
      // vocabulario y **nadie los escribe todavía**. Se pasa el valor crudo en vez de mapearlo:
      // inventarle un estado a una celda vacía es exactamente lo que no hay que hacer.
      estado: String(f.estado || '').trim(),
      ejecucion: (f.ejecucion === '' || f.ejecucion === null) ? '' : Number(f.ejecucion),
      // ⚠ **Vacío acá es una señal, no un hueco.** Una fila `hecha` con `segundos` vacío es la
      // huella que delató el bug del 20/08 —tres secciones marcadas hechas que el resolver
      // nunca tocó—, así que se muestra como está.
      segundos: (f.segundos === '' || f.segundos === null) ? '' : Number(f.segundos)
    };
  });

  base.pendientes = base.plan.filter(function (f) { return f.estado === 'pendiente'; }).length;
  base.hechas = base.plan.filter(function (f) { return f.estado === 'hecha'; }).length;

  /* ⭐ El invariante que el mecanismo chequea entre ejecuciones, dicho también acá para que se
   * vea desde afuera: **corte ⇒ pendientes ≥ 1**. «No terminé» y «no queda nada» no pueden ser
   * ciertas a la vez, y cuando lo son significa que algo marcó `hecha` una sección que no se
   * resolvió. Entre el corte y la continuación pasa **un minuto**, así que nadie llega a mirar
   * esto a tiempo — se muestra para diagnosticar después, no para intervenir. */
  if (estado && base.se_corto && base.pendientes === 0) {
    base.invariante_roto = 'la ejecución anterior CORTÓ y el plan no tiene ninguna sección ' +
      'pendiente. Las dos cosas no pueden ser ciertas a la vez: algo marcó `hecha` una sección ' +
      'que no se resolvió.';
  }

  return base;
}

/**
 * El freno, desde la pantalla. **Un mecanismo desatendido sin botón de freno es peor que
 * ninguno**, y por eso el freno se construyó junto con el arranque.
 *
 * No reimplementa nada: `cancelarCorridaDesatendida()` borra los triggers y el estado, y quita el
 * sello **sin barrer** — el deck queda con sus crudos a propósito, porque taparlos con `/////`
 * afirmaría «nadie lo cableó» sobre tokens que nadie llegó a mirar.
 */
function panel_cancelarDesatendida() {
  var e = leerEstadoCorrida_();
  var deck = e ? panel_deckDeId_(e.deck_id || '') : null;
  var r = cancelarCorridaDesatendida();
  return {
    ok: true,
    // `false` = no había nada que frenar. La pantalla lo dice en vez de festejar una cancelación
    // que no ocurrió: una corrida que no hizo nada tiene que informarlo, no informar éxito.
    habia: !!e,
    corrida_id: (r && r.corrida_id) || '',
    triggers_borrados: (r && r.triggers_borrados) || 0,
    deck: deck
  };
}

/**
 * Un deck presentable a partir de su id: `{ id, url, nombre, sellado }`.
 *
 * ⭐ **`sellado` es lo que contesta «¿está listo?»**, y se lee del nombre del archivo porque es
 * ahí donde vive (`SELLO_EN_PROCESO_`). Un deck sellado **no está terminado**, diga lo que diga
 * el conteo de tokens.
 *
 * ⚠ **Un fallo de Drive no puede voltear la pantalla**: se devuelve el id con `nombre` vacío y
 * `sellado: null`. `null` es "no se pudo saber" y es distinto de `false`, "no está sellado" —
 * dos cosas que mandan a lecturas opuestas y que un booleano solo confundiría.
 */
function panel_deckDeId_(deckId) {
  var id = String(deckId || '').trim();
  if (!id) return null;
  var salida = {
    id: id,
    url: 'https://docs.google.com/presentation/d/' + id + '/edit',
    nombre: '',
    sellado: null
  };
  try {
    var nombre = DriveApp.getFileById(id).getName();
    salida.nombre = nombre;
    salida.sellado = nombre.indexOf(SELLO_EN_PROCESO_) === 0;
  } catch (e) {
    salida.motivo = 'no se pudo leer el nombre del deck: ' + e.message;
  }
  return salida;
}

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-23_1` Parte B — Faltantes con lector
 *
 * ⭐ **El instrumento del cierre de fase, no una mejora.** `D-38` cierra una lámina cuando el
 * usuario la mira y declara que lo que falta no es relevante. Hasta hoy esa declaración se hacía
 * **de memoria**: `FALTANTES` no tenía más lector que el editor de planillas, y se pisaba entera
 * en cada corrida.
 *
 * ⚠ **Lo que esta vista NO contesta, y va dicho acá y no en una nota al pie** (`CLAUDE.md` §4:
 * un control declara cuánto midió):
 *
 *   - **La lámina.** `FALTANTES` no tiene columna de lámina y **no es derivable con confianza**:
 *     el `mapa_tokens` de `CORRIDAS` guarda el índice de slide del **deck expandido**, que no es
 *     `lamina_id` —las secciones repetibles duplican— y `LAMINAS.orden_plantilla` es reportado y
 *     nunca autoritativo. Lo que sí hay es el sufijo `@ítem`, que agrupa por instancia emitida.
 *   - **Fuera de alcance y texto del equipo.** Son decisiones del usuario y no viven en ninguna
 *     hoja de registro (`docs/CIERRE_POR_LAMINA.md`: *"`LAMINAS` no tiene columna de alcance"*).
 *     El conteo **no las descuenta**, y lo dice, en vez de inventar una clasificación.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ **El sufijo `@ítem` es lo que separa «este token falta en todas las láminas» de «falta en
 * una».** Se parte por el PRIMER ` @` y **el resto viaja tal cual, sin limpiar** — Parte D: si el
 * nombre del ítem llega sucio (`enc_alcance_pct @: Salud`), hay que verlo. Un nombre que la vista
 * lava esconde el bug del parseo justo en el instrumento con el que se diagnostica todo lo demás.
 */
function partirTokenDeFaltante_(valor) {
  var texto = String(valor == null ? '' : valor);
  var corte = texto.indexOf(' @');
  if (corte === -1) return { token: texto.trim(), item: '' };
  return { token: texto.slice(0, corte).trim(), item: texto.slice(corte + 2) };
}

/**
 * Una hoja de faltantes → sus filas normalizadas, agrupadas por causa.
 *
 * ⚠ **Una fila sin `causa` no se adivina leyendo el `motivo`.** La columna nació el 23/08; las
 * filas de una corrida anterior no la tienen, y un parser de prosa sobre el motivo produciría una
 * clasificación **que parece medida y no lo es**. Se marcan `sin_clasificar` y el conteo lo dice.
 */
function leerHojaDeFaltantes_(nombreHoja) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  // ⛔ Leer no crea. Una pestaña que se abre no debe dejar una hoja nueva en la planilla.
  if (!hoja) return { existe: false, filas: [] };

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift() || [];
  var idx = {};
  headers.forEach(function (h, i) { idx[String(h || '').trim()] = i; });

  var filas = [];
  datos.forEach(function (cruda) {
    var tokenCrudo = idx.token === undefined ? '' : cruda[idx.token];
    if (!String(tokenCrudo || '').trim()) return;   // filas en blanco al final

    var partes = partirTokenDeFaltante_(tokenCrudo);
    var causa = idx.causa === undefined ? '' : String(cruda[idx.causa] || '').trim();
    if (!CAUSAS_FALTANTE_[causa]) causa = 'sin_clasificar';

    filas.push({
      corrida_id: idx.corrida_id === undefined ? '' : String(cruda[idx.corrida_id] || ''),
      informe_id: idx.informe_id === undefined ? '' : String(cruda[idx.informe_id] || ''),
      token: partes.token,
      item: partes.item,
      base_id: idx.base_id === undefined ? '' : String(cruda[idx.base_id] || ''),
      solapa: idx.solapa === undefined ? '' : String(cruda[idx.solapa] || ''),
      causa: causa,
      motivo: idx.motivo === undefined ? '' : String(cruda[idx.motivo] || '')
    });
  });

  return { existe: true, filas: filas };
}

/**
 * B.1 · Lo que dejó la última corrida (`cual = 'actual'`) o la anterior (`cual = 'previa'`).
 *
 * Devuelve los grupos **ordenados por el `orden` de `CAUSAS_FALTANTE_`**, que no es alfabético ni
 * por tamaño: es por **cuánto frena la publicación**. Un token que resolvió y no se pintó es un
 * bug del escritor y va antes que cien tokens sin cablear, aunque sea uno solo.
 *
 * ⚠ **Los conteos vienen en dos unidades y las dos van nombradas** (`_27` bloque 1.3): `filas`
 * son apariciones —una por token **y por ítem**— y `tokens` son nombres distintos. `filas > tokens`
 * es lo normal en un deck con secciones repetibles y **no es un bug del motor**.
 */
function panel_faltantes(cual) {
  var previa = String(cual || '') === 'previa';
  var hoja = previa ? 'FALTANTES_PREVIO' : 'FALTANTES';
  var leido = leerHojaDeFaltantes_(hoja);

  if (!leido.existe) {
    return {
      ok: true, cual: previa ? 'previa' : 'actual', hoja: hoja, existe_hoja: false,
      grupos: [], corridas: [], filas: 0, tokens: 0
    };
  }

  var porCausa = {};
  var distintos = {};
  var corridas = {};

  leido.filas.forEach(function (f) {
    if (!porCausa[f.causa]) porCausa[f.causa] = {};
    if (!porCausa[f.causa][f.token]) porCausa[f.causa][f.token] = [];
    porCausa[f.causa][f.token].push(f);
    distintos[f.token] = true;
    if (f.corrida_id) corridas[f.corrida_id] = (corridas[f.corrida_id] || 0) + 1;
  });

  var grupos = Object.keys(porCausa).map(function (causa) {
    var def = CAUSAS_FALTANTE_[causa] || CAUSAS_FALTANTE_.sin_clasificar;
    var tokens = Object.keys(porCausa[causa]).sort().map(function (token) {
      var apariciones = porCausa[causa][token];
      return {
        token: token,
        // Los ítems tal cual llegan, sin limpiar y sin deduplicar por nombre normalizado:
        // dos grafías del mismo encuentro son un hallazgo, no ruido a esconder (Parte D).
        items: apariciones.map(function (a) { return a.item; }).filter(function (i) { return i !== ''; }),
        base_id: apariciones[0].base_id,
        solapa: apariciones[0].solapa,
        // Un solo motivo por token: los de un mismo token y causa dicen lo mismo, y repetirlo
        // una vez por ítem convierte la vista en el volcado de la hoja que vino a reemplazar.
        motivo: apariciones[0].motivo,
        apariciones: apariciones.length
      };
    });
    return {
      causa: causa, oficio: def.oficio, texto: def.texto, orden: def.orden,
      tokens: tokens,
      cuenta_tokens: tokens.length,
      cuenta_filas: tokens.reduce(function (n, t) { return n + t.apariciones; }, 0)
    };
  }).sort(function (a, b) { return a.orden - b.orden; });

  return {
    ok: true,
    cual: previa ? 'previa' : 'actual',
    hoja: hoja,
    existe_hoja: true,
    grupos: grupos,
    /* ⚠ **Más de un `corrida_id` en la hoja es un hallazgo, no un detalle de presentación.**
     * `escribirFaltantes_` pisa la hoja entera, así que lo normal es **uno**. Dos significa que
     * una corrida murió antes del cierre y dejó la lista de otra mezclada — exactamente el caso
     * que costó medio día el 23/08, cuando el deck que se estaba mirando era el anterior. */
    corridas: Object.keys(corridas).sort().map(function (id) { return { corrida_id: id, filas: corridas[id] }; }),
    filas: leido.filas.length,
    tokens: Object.keys(distintos).length
  };
}
