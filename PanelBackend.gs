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
 * ⛔⛔ **LEER PRIMERO: este bloque es el de 2026-08-20 y DOS de sus afirmaciones vencieron.** Se
 * conserva porque cómo se llegó a una conclusión equivocada es la mitad de su valor, pero **lo
 * vigente es el bloque de más abajo** (`2026-08-26_2` Parte C). Lo que venció, con la fecha:
 * **el 22/08** (`_25`, commit `fd226d1`) el recorte de `D-19` **pasó a aplicarse** también sobre
 * una ventana calculada, cuando alguna fila de `PERIODOS` la describe. Las dos frases de abajo
 * marcadas ⛔ quedaron falsas **ese día**, sin que nadie las tocara — que es exactamente *el
 * comentario que afirma un contrato y sobrevive porque nada lo contradice* (`CLAUDE.md` §4).
 *
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
 *     ⛔ **VENCIDA el 22/08**: hoy sí se aplica si alguna fila de `PERIODOS` describe la ventana.
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
 * ⛔ **VENCIDA el 22/08**, la frase que sigue: hoy el aviso dice las TRES cosas según el caso.
 * es que la persona sepa, antes de esperar cinco minutos, que las secciones repetibles no están
 * recortadas por período.
 */
/* ⛔⛔ `2026-08-26_2` Parte C — **TERCERA generación del mismo aviso diciendo algo que no es, y
 * por eso el arreglo no es al texto: es a la FUENTE.**
 *
 * **Las tres, para que se vea que es una figura y no tres descuidos:**
 *
 *  1. `2026-08-20_2` — nace diciendo *«no se puede correr»*. Falso: la corrida es válida.
 *  2. `2026-08-22_22` §5 — decía *«la semana propuesta **no tiene fila en PERIODOS**»* mirando
 *     sólo el prefijo del `origen`. Medido: `agosto_14_20` **era exactamente esa fila**. La
 *     consecuencia era cierta, la causa no.
 *  3. ⭐ **Ésta.** Desde el `_25` (commit `fd226d1`, 22/08 13:21) `anclarEncuentrosSinCache_`
 *     **sí recorta** sobre una ventana calculada cuando alguna fila de `PERIODOS` la describe —
 *     usa `periodosQueDescribenLaVentana_` y filtra por el conjunto—. El aviso siguió publicando
 *     *«las secciones repetibles NO se recortan por período»*, que pasó a ser **falso** ese día.
 *
 * ⭐⭐ **Que sea la tercera vez ES el hallazgo: un aviso que se corrige tres veces no tiene un
 * bug, tiene la fuente equivocada.** Las tres veces el aviso decidía con **su propio** criterio
 * —el prefijo del `origen`— mientras el motor decidía con otro. Mientras haya dos cálculos, el
 * cuarto arreglo ya está escrito.
 *
 * ⭐ **El arreglo, en una línea: el aviso llama a `periodosQueDescribenLaVentana_`, que es LA
 * función con la que el motor decide.** No es sólo dejar de duplicar: el bucle que estaba acá era
 * **byte por byte** el mismo que el de `Union.gs`, así que ya era la reimplementación que
 * `CLAUDE.md` §4 nombra —*el instrumento que reproduce lógica del motor y la reproduce peor*—,
 * sólo que con la peor variante: **reproducía bien y decidía distinto**.
 *
 * ⚠ **Y el dato correcto ya estaba calculado treinta líneas más abajo**, en el bloque
 * `coincidentes`. Se usaba para **redactar el consejo** y no para **decidir si el aviso
 * corresponde**. Un cálculo que informa el texto pero no la decisión es la forma exacta de este
 * modo de falla.
 *
 * **Los tres casos, que ahora son tres y no dos:**
 *
 *   | ventana | ¿recorta el motor? | qué dice el panel |
 *   |---|---|---|
 *   | `periodo_ref:` (la eligieron) | sí, por ese id | nada |
 *   | calculada, y ≥1 fila la describe | ⭐ **sí, por el conjunto** | informativo: con cuál(es) |
 *   | calculada, y ninguna la describe | no | ⛔ el aviso de siempre, que sigue siendo cierto |
 *
 * ⚠ **El caso del medio pasó de alarma a información, y el `nivel` importa:** pintarlo en rojo
 * sería un aviso que aparece casi siempre, y *un aviso que aparece siempre deja de leerse* — que
 * es lo que este mismo archivo ya tenía escrito cuando se lo redactó por primera vez.
 *
 * ⭐ **Bonus medido, no buscado:** `REUNIONES` ya no se lee en el caso del medio. Antes se leía
 * **siempre**, para un número que ahora sólo hace falta cuando no hay recorte.
 *
 * El aviso **no bloquea el botón** en ningún caso: la corrida es válida y la ventana es la
 * correcta. Lo que hace es que la persona sepa, antes de esperar cinco minutos, qué universo va
 * a salir.
 */
function avisosDeVentanaPropuesta_(ventana) {
  var avisos = [];
  if (!ventana || !ventana.ok) return avisos;

  var origen = String(ventana.origen || '');
  if (origen.indexOf('periodo_ref:') === 0) return avisos;

  /* ⭐ **La misma función con la que el motor decide, no una copia de su cuerpo.** Si algún día
   * `anclarEncuentrosSinCache_` cambia de criterio —una tolerancia de un día, un match por
   * nombre—, este aviso cambia con él y no se entera nadie. Ése es el punto. */
  var periodosDeLaVentana = periodosQueDescribenLaVentana_(ventana);

  if (periodosDeLaVentana.length) {
    /* ⭐ Informativo, no alarma: el recorte **sí** se aplica. Lo único que hay para decir es que
     * la ventana se calculó y con qué período(s) va a recortar — porque un `periodo_id` que
     * ninguna reunión tenga cargado no aporta filas, y verlo antes de esperar es barato.
     *
     * ⚠ **Se nombran TODOS los que coinciden.** Hay dos filas con la ventana
     * `2026-08-14 → 2026-08-20` —`agosto_14_20` y `'vie 14/08 -- jue 20/08 (por defecto)'`— y
     * desde el `_25` el motor usa el **conjunto**, así que no hay ninguna elección que hacer.
     * Mostrar sólo el primero volvería a sugerir que hay que elegir. */
    avisos.push({
      nivel: 'info',
      texto: 'El selector quedó en «por defecto», así que la ventana se calculó y no se eligió. ' +
        'El recorte por período **sí** se aplica: entran las reuniones cuyo `periodo_id` sea ' +
        (periodosDeLaVentana.length === 1
          ? '"' + periodosDeLaVentana[0] + '"'
          : 'alguno de ' + periodosDeLaVentana.map(function (id) { return '"' + id + '"'; }).join(' o ')) +
        '.'
    });
    return avisos;
  }

  /* ── Ninguna fila de `PERIODOS` describe esta ventana ────────────────────────────────────
   * Acá sí no hay período que leer y el motor **no filtra**, así que el aviso de siempre sigue
   * siendo cierto — y es el caso en que hace falta el número.
   *
   * ⚠ El conteo sale de `leerReuniones_()` **tal cual**, sin volver a filtrar por `mostrar`: esa
   * función ya aplica el filtro con `esVerdadero_` y exige `eje`. Reproducir acá ese criterio
   * sería el mismo error que este arreglo viene a cerrar, un escalón más abajo. */
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
      texto: 'Ninguna fila de PERIODOS describe la ventana propuesta, así que las secciones ' +
        'repetibles no se recortan por período (D-19). No pude leer REUNIONES para decir cuántas ' +
        'entrarían.'
    });
    return avisos;
  }

  if (visibles) {
    avisos.push({
      nivel: 'aviso',
      texto: 'Ninguna fila de PERIODOS describe la ventana propuesta. El informe se genera igual ' +
        'y sobre estas fechas, pero las secciones repetibles NO se recortan por período: entran ' +
        'las ' + visibles + ' reunión(es) con mostrar=sí' +
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
     * ⭐ `2026-08-26_2` Parte B — **ese día llegó, y el campo volvió como uno propio.** Lo que
     * decía acá —*«se pierden `desde`, `hasta`, `calculado` y `traza`, y hoy no los lee nadie…
     * el día que el panel quiera marcar una ventana calculada, el campo vuelve como uno propio
     * — no reabriendo el objeto entero»*— **era una instrucción, no una descripción**, y se
     * cumple al pie: `periodo` sigue siendo la etiqueta de la lámina y los campos que hacen
     * falta viajan al lado, **planos**. El objeto no se reabre.
     *
     * ⭐⭐ **Por qué el NIVEL y no sólo las fechas, que es lo que de verdad faltaba.**
     * `resolverVentana` es una cadena de **cinco eslabones** (`D-20`) y el deck no dice por cuál
     * salió: *«el usuario eligió `julio_24_30`»* y *«nadie eligió nada y `R-11` calculó la última
     * semana cerrada»* producen **la misma etiqueta** y mandan a trabajos distintos. Es la misma
     * familia que el glifo que miente sobre la causa: no miente sobre el valor, miente sobre
     * **de dónde salió**.
     *
     * ⚠ **Viajan SIEMPRE, aunque el front decida no pintarlos** — el mismo criterio que los tres
     * avisos de más abajo: el panel elige si los muestra, pero nunca tiene que adivinar si
     * existen. */
    periodo: (r.periodo && r.periodo.lamina) || '',
    periodo_desde: (r.periodo && r.periodo.desde) || '',
    periodo_hasta: (r.periodo && r.periodo.hasta) || '',
    periodo_nivel: (r.periodo && r.periodo.origen) || '',
    periodo_calculado: !!(r.periodo && r.periodo.calculado),
    periodo_traza: (r.periodo && r.periodo.traza) || '',
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
    /* ⭐ `2026-08-27_1` — la fórmula de la clave sale de `nombreBuscadoDeReunion_` (`Union.gs`),
     * que es donde el motor la escribe. Estaba copiada acá y en `panel_archivarAnclaje`: tres
     * copias, y el día que una gane un matiz las otras dejan de matchear **sin fallar**. */
    vigentes[claveAnclaje_('reunion', nombreBuscadoDeReunion_(r))] = true;
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
        if (claveAnclaje_('reunion', nombreBuscadoDeReunion_(r)) === buscada) vigente = true;
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
    informe_id: '', periodo_id: '', ejecucion: 0, se_corto: false,
    /* ⛔⛔ `2026-09-04` — **se declaran SIEMPRE, y no es prolijidad.** El retorno temprano de
     * `!corridaId` no los seteaba, así que salían `undefined` — y el sondeo del panel decide
     * que la corrida terminó con `pendientes === 0`. **Con `undefined` esa comparación es
     * `false` para siempre y el contador no para nunca.** Es la misma regla que ya está
     * escrita para las claves del temario: **se declaran aunque no haya filas**. */
    pendientes: 0, hechas: 0
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

  /* ══════════════════════════════════════════════════════════════════════════════════════
   * ⭐⭐ `2026-09-04_4 Addendum 1` — **el RESUMEN de la corrida, leído de `CORRIDAS`.**
   *
   * ⛔⛔ **Existe porque la rama `listo` NO se puede reusar** (P3): se pinta con ocho campos y el
   * estado desatendido tenía dos. El que decidía era `conteos`, que sale de `r.tokens.*` — el
   * retorno de `generarInforme`, que **sólo existe en la corrida síncrona**.
   *
   * ⭐ **Y NO se persiste nada nuevo: `CORRIDAS` ya tiene las columnas.** Lo que faltaba era
   * leerlas desde acá.
   *
   * ══ LO QUE P5 MIDIÓ, Y SIN ESTO EL NÚMERO SALE MAL DE DOS FORMAS ═══════════════════════
   *
   * ⛔ **Una corrida desatendida deja N FILAS, una por `ejecucion`.** `abrirCorrida_` corre una vez
   * por invocación de `generarInforme`, y `escribirCorrida_` **completa esa misma fila** —por
   * `numeroFila`— en vez de acumular. ⇒ **`tokens_reemplazados` es el PARCIAL de su ejecución.**
   *
   * ⭐ **Por eso se SUMA, y es correcto sumar:** los reemplazos son **disjuntos por construcción**
   * — un token reemplazado deja de ser `{{token}}`, así que la ejecución siguiente no lo vuelve a
   * contar. ⚠ **Los dos modos de equivocarse dan un número plausible:** sumar acumulados daría el
   * doble, tomar la última daría sólo el último tramo, **y ninguno rompe**.
   *
   * ⛔⛔ **`faltantes` NO es un número: es un campo de estado que EMPIEZA con el número.**
   * `avisosDeLaFila_` devuelve el conteo pelado, o `conteo + ' · ' + avisos`, y el cierre le pega
   * `' · gasto: …'`. Una fila abierta trae `'(corrida en curso — …)'`. ⇒ Se lee **el primer
   * segmento** y **`null` significa «esa ejecución no cerró»**, que es un dato y no un cero.
   * ══════════════════════════════════════════════════════════════════════════════════════ */
  /* ⛔⛔ `try/catch`, y **NO es prolijidad: lo encontró `probar-desatendida-en-el-panel.js`.**
   *
   * El resumen es **secundario**; el estado —el plan, el avance, el corte— es **la pantalla**. Una
   * lectura de `CORRIDAS` que tire **mataría toda la pantalla de avance** por no poder mostrar dos
   * conteos. ⭐ **El orden de importancia tiene que estar en el código, no sólo en la cabeza:** si
   * el resumen falla, se dice que falló y el avance sigue. */
  try {
    base.resumen = resumenDeCorrida_(corridaId);
  } catch (e) {
    base.resumen = { ok: false, motivo: 'no se pudo leer `CORRIDAS`: ' + e.message };
  }

  return base;
}

/**
 * Los dos conteos de una corrida, sumando sus ejecuciones. ⛔ `ok:false` si no hay ninguna fila:
 * **la vista tiene que poder decir «no pude leer el resumen» en vez de pintar ceros.**
 */
function resumenDeCorrida_(corridaId) {
  if (!corridaId) return { ok: false, motivo: 'sin `corrida_id`' };
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CORRIDAS');
  if (!hoja) return { ok: false, motivo: 'no existe la hoja CORRIDAS' };
  var datos = hoja.getDataRange().getValues();
  if (datos.length < 2) return { ok: false, motivo: 'CORRIDAS está vacía' };
  var h = datos[0].map(function (c) { return String(c == null ? '' : c).trim(); });
  var iId = h.indexOf('corrida_id'), iEj = h.indexOf('ejecucion');
  var iTok = h.indexOf('tokens_reemplazados'), iFal = h.indexOf('faltantes');
  var iGen = h.indexOf('fecha_generacion');
  if (iId === -1 || iTok === -1 || iFal === -1) {
    return { ok: false, motivo: 'CORRIDAS no tiene las columnas esperadas' };
  }

  var filas = [], reemplazados = 0, faltantes = 0, sinCerrar = 0, algunConteo = false;
  for (var k = 1; k < datos.length; k++) {
    if (String(datos[k][iId] || '').trim() !== corridaId) continue;
    var gen = iGen === -1 ? '' : datos[k][iGen];
    var cerrada = gen instanceof Date;
    var tok = Number(datos[k][iTok]);
    /* ⚠ El primer segmento, porque la columna es mixta. `null` ≠ 0: no cerró. */
    var crudoFal = String(datos[k][iFal] || '').split(' · ')[0].trim();
    var fal = /^\d+$/.test(crudoFal) ? Number(crudoFal) : null;
    if (!isNaN(tok) && String(datos[k][iTok]) !== '') { reemplazados += tok; algunConteo = true; }
    if (fal !== null) faltantes += fal; else sinCerrar++;
    filas.push({ ejecucion: iEj === -1 ? '' : datos[k][iEj], cerrada: cerrada,
      tokens_reemplazados: datos[k][iTok], faltantes_crudo: String(datos[k][iFal] || '') });
  }
  if (!filas.length) return { ok: false, motivo: 'ninguna fila de `CORRIDAS` con ese `corrida_id`' };

  return {
    ok: true,
    ejecuciones: filas.length,
    /* ⭐ Sumados, con su unidad dicha — y `null` cuando NINGUNA fila trajo conteo, que no es 0. */
    tokens_reemplazados: algunConteo ? reemplazados : null,
    faltantes: (sinCerrar === filas.length) ? null : faltantes,
    /* ⚠ Cuántas ejecuciones no cerraron: sin esto, una suma parcial se lee como total. */
    ejecuciones_sin_cerrar: sinCerrar,
    filas: filas
  };
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
 *   - ~~**La lámina.**~~ ✅ **Cerrado por el `2026-08-24_2` Parte C.** `FALTANTES` ahora **guarda
 *     `lamina_id`**, escrito por el motor en el momento de pintar: en una sección repetible viaja
 *     por la asignación —el `lamina_id` del **modelo**, no la posición de la copia— y en los tokens
 *     fijos se resuelve por el ancla de las notas. ⚠ **La celda puede traer varias**, separadas por
 *     ` · `, y eso es correcto: `replaceAllText` pinta el token en todas sus cajas.
 *     ⛔ **Sigue sin derivarse del `mapa_tokens` de `CORRIDAS`**, que guarda el índice de slide del
 *     deck expandido y **no** es un `lamina_id` — y `LAMINAS.orden_plantilla` es reportado y nunca
 *     autoritativo (`A.2`). Lo que cambió es que el motor lo **declara**, no que se pueda deducir.
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
      motivo: idx.motivo === undefined ? '' : String(cruda[idx.motivo] || ''),
      /* ⭐ `2026-08-24_2` Parte C — puede traer varias separadas por ` · `. Vacío significa **«no se
       * midió»**, no «no tiene lámina»: las filas anteriores al 25/08 no tienen la columna, y las
       * del barrido tras un corte la dejan vacía a propósito (ver `Generador.gs`). Las dos se
       * agrupan bajo `(sin lámina)` y **el conteo lo dice**, en vez de inventarles una. */
      laminas: partirLaminasDeFaltante_(idx.lamina_id === undefined ? '' : cruda[idx.lamina_id])
    });
  });

  return { existe: true, filas: filas };
}

/**
 * La celda `lamina_id` → lista de ids.
 *
 * ⚠ **Sin normalizar el id más allá del `trim`**, por lo mismo que el nombre del ítem viaja sucio:
 * un `l-046` en minúscula o un id con un espacio adentro es un hallazgo del sellado, y una vista que
 * lo lava esconde el bug en el instrumento con el que se diagnostica todo lo demás.
 */
function partirLaminasDeFaltante_(valor) {
  return String(valor == null ? '' : valor)
    .split('·')
    .map(function (x) { return x.trim(); })
    .filter(function (x) { return x !== ''; });
}

/* ═══════════ `2026-08-24_2` Parte B — los tres números del conteo ═════════════════════════
 *
 * ⭐ **El conteo pasa a decir tres cosas, y la que decide el cierre de fase es la PRIMERA:**
 * faltantes reales · fuera de alcance · texto del equipo. Hasta hoy los tres se sumaban en uno, y
 * el número con el que se iba a declarar `D-38` incluía **57 tokens de tres láminas que nadie va a
 * cablear nunca** y el texto que escribe una persona.
 *
 * ⭐⭐ **Se DERIVA en la vista, no se escribe en `causa`, y esa decisión importa.** `causa` sale del
 * estado del marcador en el momento de pintar —dice qué **oficio** cierra el hueco— y el alcance es
 * una **decisión del usuario que puede cambiar sin correr de nuevo**. Metida en `FALTANTES`, cada
 * cambio de alcance exigiría regenerar el deck para verlo; derivada, se declara en `LAMINAS` y el
 * panel lo refleja en la próxima lectura. **Son dos ejes y no uno.**
 *
 * ⚠ **`sin_declarar` es su propio número y no se pliega a «real».** Una lámina cuyo alcance nadie
 * escribió —todo `secco`— no es lo mismo que una declarada en alcance, y contarlas juntas haría que
 * el número que decide el cierre incluyera láminas que nadie miró. *Un control declara cuánto
 * midió*, y ésta es la parte que no está declarada.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/**
 * Lo que `LAMINAS` declara hoy sobre alcance y texto del equipo.
 *
 * ⚠ **Si la hoja no tiene las columnas, devuelve el mapa vacío y lo DICE.** Sin ese aviso, «nadie
 * declaró nada» y «la columna todavía no existe» se ven idénticos desde el conteo — y mandan a
 * trabajos opuestos: llenar la hoja contra correr `instalar()`.
 */
function declaracionesDeLaminas_() {
  var reg = (typeof leerLaminas_ === 'function') ? leerLaminas_() : { ok: false, motivo: 'sin lector' };
  if (!reg.ok) return { ok: false, motivo: reg.motivo, alcance: {}, tokens_equipo: {}, columnas: false };

  var headers = (reg.headers || []).map(function (h) { return String(h == null ? '' : h).trim(); });
  var tieneColumnas = headers.indexOf('alcance') !== -1 && headers.indexOf('tokens_equipo') !== -1;

  var alcance = {};
  var tokensEquipo = {};
  reg.filas.forEach(function (f) {
    var id = String(f.lamina_id || '').trim();
    if (!id) return;
    var a = String(f.alcance == null ? '' : f.alcance).trim();
    if (a) alcance[id] = a;
    var lista = String(f.tokens_equipo == null ? '' : f.tokens_equipo)
      .split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    if (lista.length) {
      tokensEquipo[id] = {};
      lista.forEach(function (t) { tokensEquipo[id][t] = true; });
    }
  });

  return {
    ok: true, alcance: alcance, tokens_equipo: tokensEquipo, columnas: tieneColumnas,
    motivo: tieneColumnas ? '' :
      'LAMINAS todavía NO tiene las columnas `alcance` y `tokens_equipo` — correr `instalar()`. ' +
      'El conteo NO descuenta nada, y eso es distinto de que no haya nada que descontar.'
  };
}

/**
 * En cuál de los cuatro cubos cae una fila de faltantes.
 *
 * ⭐ **El criterio es TODAS sus láminas, nunca alguna**, y es el mismo con el que `solo_escondidas`
 * ya decide: `camp_titulo` aparece en 14 láminas, y si una sola está en alcance el token **hay que
 * cablearlo**. Bastaría con «alguna está fuera de alcance» para que un token vivo desapareciera del
 * conteo que decide el cierre — que es el error caro en la dirección que no avisa.
 *
 * El orden de evaluación no es arbitrario: **el alcance manda sobre el texto del equipo**. Una
 * lámina que no se cablea se lleva su contenido entero, y clasificar sus tokens como *texto del
 * equipo* diría que alguien los va a escribir a mano.
 */
function clasificarFaltante_(fila, decl) {
  if (!fila.laminas.length) return 'sin_lamina';

  var declaradas = fila.laminas.filter(function (id) { return decl.alcance[id]; });
  if (declaradas.length < fila.laminas.length) return 'sin_declarar';

  if (fila.laminas.every(function (id) { return decl.alcance[id] === 'fuera_de_alcance'; })) {
    return 'fuera_de_alcance';
  }

  if (fila.laminas.every(function (id) {
    return decl.tokens_equipo[id] && decl.tokens_equipo[id][fila.token] === true;
  })) {
    return 'texto_equipo';
  }

  return 'real';
}

/**
 * ⭐⭐ `2026-08-24_2` Parte C — **las filas de faltantes, agrupadas por lámina.**
 *
 * ⚠ **Una fila con varias láminas cuenta en cada una, y por eso la suma de las láminas puede ser
 * MAYOR que el total de filas.** No es doble conteo: `camp_titulo` **falta de verdad** en las 14
 * láminas donde aparece, y decir *«una»* para que los números cierren sería mentir sobre el deck
 * para que cierre una suma. **El campo `filas` de arriba sigue siendo el total real**, y las dos
 * unidades van nombradas — misma disciplina que `filas` contra `tokens` en el corte por causa.
 *
 * ⭐ **El orden es por `lamina_id`, no por cantidad.** El deck se lee de adelante hacia atrás y el
 * tablero que esto alimenta también; ordenar por cuántos faltan pondría arriba la lámina más rota,
 * que es útil para triage y **no** para la pregunta que esta vista contesta —*«voy lámina por
 * lámina, ¿puedo publicar ésta?»*—. La jerarquía por consecuencia vive en el corte por causa.
 *
 * ⚠ **Las filas sin lámina NO entran acá**: se cuentan aparte en `sin_lamina`. Meterlas en un grupo
 * `(sin lámina)` las haría parecer una lámina más del deck.
 */
function agruparFaltantesPorLamina_(filas) {
  var porLamina = {};
  filas.forEach(function (f) {
    f.laminas.forEach(function (id) {
      if (!porLamina[id]) porLamina[id] = [];
      porLamina[id].push(f);
    });
  });

  return Object.keys(porLamina).sort().map(function (id) {
    var suyas = porLamina[id];
    var causas = {};
    var tokens = {};
    suyas.forEach(function (f) {
      causas[f.causa] = (causas[f.causa] || 0) + 1;
      tokens[f.token] = true;
    });
    return {
      lamina_id: id,
      filas: suyas.length,
      cuenta_tokens: Object.keys(tokens).length,
      // Ordenadas por cuánto frena la publicación, igual que los grupos por causa: la lámina se
      // lee de un vistazo y lo primero tiene que ser lo que más pesa.
      causas: Object.keys(causas).map(function (c) {
        var def = CAUSAS_FALTANTE_[c] || CAUSAS_FALTANTE_.sin_clasificar;
        return { causa: c, texto: def.texto, oficio: def.oficio, orden: def.orden, cuantos: causas[c] };
      }).sort(function (a, b) { return a.orden - b.orden; }),
      tokens: Object.keys(tokens).sort()
    };
  });
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
      grupos: [], laminas: [], corridas: [], filas: 0, tokens: 0, sin_lamina: 0,
      conteo: { real: 0, fuera_de_alcance: 0, texto_equipo: 0, sin_declarar: 0, sin_lamina: 0 },
      declaracion: { ok: false, columnas: false, motivo: 'no hay hoja de faltantes que leer' }
    };
  }

  /* ⭐ Parte B — cada fila se clasifica ANTES de agrupar, y la clasificación viaja pegada a la fila:
   * los cortes por causa y por lámina la necesitan los dos, y calcularla dos veces sería la puerta
   * para que difieran. */
  var decl = declaracionesDeLaminas_();
  var conteo = { real: 0, fuera_de_alcance: 0, texto_equipo: 0, sin_declarar: 0, sin_lamina: 0 };
  leido.filas.forEach(function (f) {
    f.clase = clasificarFaltante_(f, decl);
    conteo[f.clase]++;
  });

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
    /* ⭐⭐ `2026-08-24_2` Parte C — **la misma lista, cortada por lámina**, que es como el usuario
     * mira un deck y como está organizado `docs/CIERRE_POR_LAMINA.md`. Hasta hoy cruzar los dos era
     * a mano. **Los dos cortes conviven a propósito**: por causa se responde *«qué oficio cierra
     * esto»* y por lámina *«puedo publicar esta lámina»* — son dos preguntas y la vista da las dos. */
    laminas: agruparFaltantesPorLamina_(leido.filas),
    /* ⚠ Se publica aparte y no adentro de un grupo `(sin lámina)`: **un control declara cuánto
     * midió**, y este número es exactamente la parte del corte por lámina que no se puede leer. */
    sin_lamina: conteo.sin_lamina,
    /* ⭐⭐ Parte B — **los tres números, y el que decide el cierre de fase (`D-38`) es `real`.**
     * Los otros dos son trabajo que nadie va a hacer nunca y hasta hoy se contaban como faltantes.
     * ⚠ `sin_declarar` NO se pliega a `real`: una lámina cuyo alcance nadie escribió no es lo mismo
     * que una declarada en alcance, y sumarlas metería en el número del cierre láminas que nadie
     * miró. `declaracion` dice si la hoja está en condiciones de contestar. */
    conteo: conteo,
    declaracion: { ok: decl.ok, columnas: decl.columnas, motivo: decl.motivo },
    /* ⚠ **Más de un `corrida_id` en la hoja es un hallazgo, no un detalle de presentación.**
     * `escribirFaltantes_` pisa la hoja entera, así que lo normal es **uno**. Dos significa que
     * una corrida murió antes del cierre y dejó la lista de otra mezclada — exactamente el caso
     * que costó medio día el 23/08, cuando el deck que se estaba mirando era el anterior. */
    corridas: Object.keys(corridas).sort().map(function (id) { return { corrida_id: id, filas: corridas[id] }; }),
    filas: leido.filas.length,
    tokens: Object.keys(distintos).length
  };
}

/**
 * ⭐ `2026-08-23_1` Parte D · **la última medición del anclaje — lo que `ANCLAJE_PENDIENTE` no
 * puede decir.**
 *
 * ⛔ Una pantalla de anclajes vacía significa **dos cosas opuestas**: *«no corrió»* y *«corrió y
 * nadie cayó bajo el umbral»*. La primera manda a generar; la segunda, a no tocar nada. Sin una
 * medición escrita, las dos son la misma pantalla en blanco.
 *
 * ⚠ **Los nombres se devuelven TAL CUAL están en la hoja, sin limpiar.** `enc_alcance_pct @: Salud`
 * llega con el separador crudo adentro, y **eso es el requisito, no un descuido**: el sufijo
 * `@ítem` de `FALTANTES` es la herramienta con la que se diagnosticó `X-40`, y un nombre que la
 * vista lava esconde el bug del parseo justo en el instrumento con el que se mira todo lo demás.
 *
 * ⛔ **Leer no escribe.** Si la hoja no existe se devuelve `existe_hoja: false` y **no se la crea**:
 * abrir una pestaña no debe dejar una hoja nueva en la planilla del usuario.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * ⛔⛔ **`2026-08-24_2` Parte D — dos correcciones, y la primera desarmaba lo que `9c48769`
 * acababa de construir.**
 *
 * **1 · `Number(x) || 0` convertía el VACÍO en CERO.** `registrarFalloAnclaje_` deja los
 * contadores **vacíos a propósito**, y su comentario lo dice con todas las letras: *«un 0 se lee
 * como "se intentó anclar cero y salió bien", que es una afirmación y es falsa. Vacío es "no se
 * midió"»*. Este lector es del 23/08 y el escritor de anoche: **nunca se cruzaron**, así que el
 * cuidado del escritor moría en la lectura y **una fila de FALLO se veía como una corrida perfecta
 * de cero encuentros**. Es la familia del `String(celda)` sobre booleanos (`CLAUDE.md` §4):
 * convertir antes de mirar destruye la distinción que el otro lado se tomó el trabajo de guardar.
 *
 * **2 · La fila puede ser vieja y la vista no lo decía.** Hasta `9c48769` un anclaje que fallaba
 * **no escribía fila**, así que la última se lee como *«lo último que pasó»* cuando es *«lo último
 * que salió bien»* — y el 25/08 eso hizo parecer que dos instrumentos de la misma corrida se
 * contradecían: una fila de las 17:12 contra un fallo de las 20:07. **Ahora la vista trae también
 * la hora de la última corrida**, para que el desfase se **vea** en vez de descubrirse comparando.
 *
 * ⚠ **El desfase se reporta, no se interpreta.** Una medición anterior a la última corrida puede
 * ser un fallo sin fila (el caso viejo) o una corrida que no ancló nada (legítimo). La vista dice
 * *«hay desfase»* y **cuánto**; qué significa lo decide quien mira.
 */
function panel_ultimaMedicionAnclaje() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ANCLAJE_MEDICION');
  if (!hoja) {
    return {
      ok: true, existe_hoja: false, hay: false,
      /* ⚠ El texto dice lo que la ausencia significa, y **no dice que no haya corrido**: la hoja
       * nació el 23/08, así que una corrida anterior a eso tampoco la escribió. «No sé» con motivo
       * vale más que una afirmación cómoda. */
      motivo: 'todavía no hay ninguna medición registrada — la hoja se escribe en cada anclaje, ' +
        'y no existe si el motor no ancló desde que esto se instaló'
    };
  }

  var datos = hoja.getDataRange().getValues();
  var headers = datos.shift() || [];
  var filas = datos.filter(function (f) { return f[0] !== '' && f[0] !== null; });
  if (!filas.length) {
    return { ok: true, existe_hoja: true, hay: false, motivo: 'la hoja existe y no tiene ninguna fila' };
  }

  var cruda = filas[filas.length - 1];
  var m = {};
  headers.forEach(function (h, i) { m[String(h || '').trim()] = cruda[i]; });

  var lista = function (v) {
    return String(v || '').split(' | ').filter(function (t) { return t !== ''; });
  };

  var desfase = desfaseContraUltimaCorrida_(m.cuando);

  return {
    ok: true, existe_hoja: true, hay: true,
    mediciones: filas.length,
    cuando: (m.cuando instanceof Date) ? formatearFechaHora_(m.cuando) : String(m.cuando || ''),
    ventana: (m.ventana_desde instanceof Date && m.ventana_hasta instanceof Date)
      ? fechaLegible_(m.ventana_desde) + ' al ' + fechaLegible_(m.ventana_hasta)
      : '',
    periodo_id: String(m.periodo_id || ''),
    /* ⛔ `numeroOVacio_` y NO `Number(x) || 0`: el vacío viaja como `null` y significa **«no se
     * midió»**. Ver el bloque del encabezado — convertirlo a `0` afirmaba «se intentó anclar cero y
     * salió bien», que es lo contrario de lo que una fila de fallo dice. */
    intentados: numeroOVacio_(m.intentados),
    anclados: numeroOVacio_(m.anclados),
    baja_confianza: numeroOVacio_(m.baja_confianza),
    sin_link: numeroOVacio_(m.sin_link),
    /* ⭐ Y la consecuencia legible: una fila **sin contadores** es un FALLO registrado, no una
     * corrida vacía. `registrarFalloAnclaje_` pone el motivo en `sin_link_detalle`, que en un fallo
     * no tiene otro uso — así que la vista puede decir *qué* falló sin una columna nueva. */
    es_fallo: numeroOVacio_(m.intentados) === null,
    umbral: m.umbral,
    // Sin limpiar: si un nombre llega sucio, hay que verlo.
    sin_link_detalle: lista(m.sin_link_detalle),
    excluidas_por_periodo: lista(m.excluidas_por_periodo),
    /* ⚠ La otra mitad de la Parte D: **la hora de la última corrida al lado de la de esta fila.**
     * Sin las dos, «lo último que pasó» y «lo último que salió bien» son la misma pantalla. */
    desfase: desfase
  };
}

/**
 * Un contador de `ANCLAJE_MEDICION` → número, o `null` si la celda está vacía.
 *
 * ⛔ **`null` y `0` son afirmaciones distintas y no se pueden colapsar**: `0` dice *«se midió y dio
 * cero»*, `null` dice *«no se midió»*. `registrarFalloAnclaje_` deja los contadores vacíos
 * justamente para poder decir la segunda, y un lector que devuelve `0` borra esa distinción sin
 * que nada falle.
 */
function numeroOVacio_(v) {
  if (v === '' || v === null || v === undefined) return null;
  var n = Number(v);
  return isNaN(n) ? null : n;
}

/**
 * ⭐ **La hora de esta medición contra la de la última corrida.** Es lo que vuelve visible el modo
 * de falla del 25/08: una fila de las 17:12 leída como «lo último que pasó» cuando la corrida que
 * importaba era la de las 20:07, que había fallado **sin dejar fila**.
 *
 * ⚠ **Reporta, no interpreta.** Un desfase puede ser un fallo sin fila (el caso viejo, ya
 * corregido) o una corrida que sencillamente no ancló nada. La vista dice cuánto; el significado lo
 * pone quien mira.
 *
 * ⛔ **No puede voltear la pantalla.** Si `CORRIDAS` no está o no se puede leer, se devuelve
 * `ok: false` con el motivo — un instrumento que rompe lo que mide es peor que no tenerlo, y acá lo
 * que mide es la única vista del anclaje.
 */
function desfaseContraUltimaCorrida_(cuandoMedicion) {
  try {
    var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CORRIDAS');
    if (!hoja || hoja.getLastRow() < 2) {
      return { ok: false, motivo: 'no hay ninguna corrida registrada con qué comparar' };
    }
    var datos = hoja.getDataRange().getValues();
    var headers = datos.shift().map(function (h) { return String(h == null ? '' : h).trim(); });
    var iFecha = headers.indexOf('fecha_generacion');
    var iId = headers.indexOf('corrida_id');
    if (iFecha === -1) return { ok: false, motivo: 'CORRIDAS no tiene columna `fecha_generacion`' };

    var ultima = null;
    datos.forEach(function (f) {
      if (f[iFecha] instanceof Date) ultima = { fecha: f[iFecha], corrida_id: iId === -1 ? '' : String(f[iId] || '') };
    });
    if (!ultima) return { ok: false, motivo: 'ninguna fila de CORRIDAS tiene fecha utilizable' };

    var salida = {
      ok: true,
      corrida_id: ultima.corrida_id,
      corrida_cuando: formatearFechaHora_(ultima.fecha)
    };
    if (!(cuandoMedicion instanceof Date)) {
      salida.hay_desfase = null;
      salida.nota = 'la medición no tiene fecha utilizable: no se puede comparar';
      return salida;
    }
    var minutos = Math.round((ultima.fecha.getTime() - cuandoMedicion.getTime()) / 60000);
    salida.minutos = minutos;
    /* Un minuto de tolerancia: la medición se escribe **dentro** de la corrida, unos segundos antes
     * de que la fila de `CORRIDAS` se cierre. Sin margen, toda corrida sana informaría desfase. */
    salida.hay_desfase = minutos > 1;
    return salida;
  } catch (e) {
    return { ok: false, motivo: 'no se pudo leer CORRIDAS: ' + ((e && e.message) ? e.message : e) };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-26_2` Parte F — **los dos botones de período del panel**
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * ⛔⛔ **«Semana en curso» DEROGA `R-11` Addendum 2**, y va dicho acá porque el que lo lea tiene
 * que enterarse antes de tocarlo. El Addendum 2 (20/08) decidió que **el motor propone la última
 * semana CERRADA**: corriendo el viernes 21/08 sigue proponiendo 14/08–20/08, porque la semana que
 * arranca ese viernes todavía no cerró.
 *
 * ⭐ **Qué cambia y qué NO.** La **propuesta por defecto** del panel sigue siendo la cerrada — el
 * Addendum 2 sigue gobernando `resolverVentana` y el selector. Lo que se agrega es un camino donde
 * **la persona pide explícitamente la semana en curso**, que es un pedido distinto: no es el motor
 * adivinando, es alguien decidiendo. La derogación es de *«el motor nunca ofrece la semana sin
 * cerrar»*, no de *«el motor propone la cerrada»*.
 *
 * ⭐⭐ **Y el aviso va al ELEGIRLA, no al terminar.** Una semana sin cerrar trae datos
 * **parciales**, y el caso está medido: `3488-AGOJDGAG` en el export del 20/08 tenía **11.000 de
 * 54.107 llamados** por fila, y el deck del equipo se armó después. **Un número parcial no se
 * distingue de uno completo mirándolo** — así que el único momento útil para decirlo es antes,
 * no en un pie de página cuando el deck ya salió.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/**
 * Botón «generar la semana en curso». Crea (insert-only) el período de la semana que **contiene a
 * hoy**, y devuelve si esa semana **todavía no cerró**.
 *
 * ⚠ `sin_cerrar` se calcula comparando contra `ultimaSemanaCerradaR11_`, que es la función del
 * Addendum 2 — no con una cuenta de días propia. Las dos lecturas **sólo difieren el viernes**, y
 * el viernes es justo el día en que se genera `jm`.
 */
function panel_generarSemanaEnCurso() {
  var hoy = new Date();
  var enCurso = semanaR11_(hoy);
  var cerrada = ultimaSemanaCerradaR11_(hoy);
  var sinCerrar = formatearFecha_(enCurso.desde) !== formatearFecha_(cerrada.desde);

  var r = crearPeriodos_([{ desde: enCurso.desde, hasta: enCurso.hasta }],
    'Semana en curso, creada desde el panel el ' +
    Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd') +
    (sinCerrar ? ' — ⚠ la semana NO había cerrado al crearla' : ''));

  r.periodo_id = periodoIdDeVentana_(enCurso.desde, enCurso.hasta);
  r.desde = formatearFecha_(enCurso.desde);
  r.hasta = formatearFecha_(enCurso.hasta);
  r.sin_cerrar = sinCerrar;
  /* ⭐ El aviso viaja **siempre**, aunque el front decida no pintarlo: el panel elige si lo
   * muestra, pero nunca tiene que adivinar si existe. Mismo criterio que los tres de la corrida. */
  /* ⚠ El texto sale de `AVISO_SEMANA_SIN_CERRAR_` y ya no está escrito acá: el asistente lo usa
   * también, y dos redacciones del mismo aviso es el modo de falla que el aviso de ventana vino a
   * cerrar en la Parte C del `2026-08-26_2` —dos fuentes que se corrigen por separado—. */
  r.aviso_parcial = sinCerrar ? AVISO_SEMANA_SIN_CERRAR_ : '';
  return r;
}

/**
 * Botón «período personalizado». Valida y delega en `crearPeriodoPersonalizado_`.
 *
 * ⚠ El `periodo_id` **se deriva, no se pide**: dejar que alguien lo escriba a mano reabre la
 * puerta a `'vie 14/08 -- jue 20/08 (por defecto)'`, que es una **etiqueta de origen usada como
 * clave primaria** y sigue en la hoja.
 */
function panel_generarPeriodoPersonalizado(desdeTexto, hastaTexto) {
  return crearPeriodoPersonalizado_(desdeTexto, hastaTexto);
}

/**
 * Lo que el panel necesita para **mostrar la semana en curso ANTES de crearla**: qué ventana es,
 * qué `periodo_id` va a tener, si ya existe y si todavía no cerró.
 *
 * ⭐ Existe para que el aviso salga **al elegirla**. Sin esta llamada el panel tendría que crear
 * primero y avisar después, que es el orden que este bloque vino a evitar.
 */
function panel_previaSemanaEnCurso() {
  var hoy = new Date();
  var enCurso = semanaR11_(hoy);
  var cerrada = ultimaSemanaCerradaR11_(hoy);
  var id = periodoIdDeVentana_(enCurso.desde, enCurso.hasta);
  var crudas = filasCrudasDePeriodos_();
  return {
    ok: true,
    periodo_id: id,
    desde: formatearFecha_(enCurso.desde),
    hasta: formatearFecha_(enCurso.hasta),
    /* ⚠ Contra las filas CRUDAS: `leerPeriodos()` colapsa las repetidas. */
    ya_existe: !!(crudas.ok && crudas.porClave[id]),
    sin_cerrar: formatearFecha_(enCurso.desde) !== formatearFecha_(cerrada.desde),
    ultima_cerrada: formatearFecha_(cerrada.desde) + ' → ' + formatearFecha_(cerrada.hasta)
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-27_1` — **el asistente lineal de cuatro pasos** (`D-44`, decisión del usuario)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * ⭐ **Es un asistente lineal, no un formulario navegable:** los pasos se hacen en orden y
 * **cambiar el período es empezar de nuevo**. Eso no es una limitación de la UI, es lo que
 * previene el problema: si el período se pudiera cambiar después de cargar el temario, las
 * reuniones quedarían atadas al `periodo_id` viejo. **El diseño lineal lo hace imposible en vez
 * de tener que detectarlo.**
 *
 * ⭐⭐ **Los cuatro pasos ya estaban construidos por separado.** Lo que faltaba —y es todo lo que
 * este bloque agrega— es **la máquina de estados que los encadena y que impide saltearlos**:
 *
 *   1 · período   → `semanaR11_` / `ultimaSemanaCerradaR11_` + `crearPeriodos_` (`D-43`)
 *   2 · temario   → `partirTemarioEnBloques_` + los dos cargadores de siempre
 *   3 · confirmar → `anclarEncuentros`, sus TRES listas, y el `mostrar` de cada fila
 *   4 · generar   → `generarInforme`, por el adaptador de siempre
 *
 * ⛔⛔ **La guarda es de HECHOS, nunca de una bandera del front.** Un `paso: 3` que viaja en el
 * `S` del HTML es una afirmación del front sobre sí mismo, y el front puede mentir —es el mismo
 * `TECHO_S = 350` escrito a mano que el `2026-08-21_1` sacó de acá—. Las tres condiciones que
 * `guardaDelAsistente_` mira se leen de las hojas vivas: **existe la fila de `PERIODOS`**, **hay
 * filas de temario para ese período**, **ninguna reunión quedó con `mostrar` vacío**.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Los cuatro pasos, en orden. El índice es el número de paso menos uno. */
var PASOS_ASISTENTE_ = ['periodo', 'temario', 'confirmar', 'generar'];

/**
 * ⭐⭐ **El aviso de la semana en curso, escrito UNA vez.**
 *
 * Estaba redactado dentro de `panel_generarSemanaEnCurso` y el HTML tiene su propia copia. Tres
 * textos para un aviso es la figura de *«un techo declarado en dos lugares es un techo que puede
 * mentir en uno de los dos»*: el front conserva el suyo —es el que se lee **al elegir**, antes de
 * llamar a nadie— y el backend deja de tener dos.
 */
var AVISO_SEMANA_SIN_CERRAR_ =
  'Esta semana TODAVÍA NO CERRÓ (cierra el jueves). Los datos de las bases van a estar ' +
  'parciales, y un número parcial no se distingue de uno completo mirándolo: medido, ' +
  '3488-AGOJDGAG tenía 11.000 de 54.107 llamados en el export del 20/08.';

/**
 * ⭐⭐ **La guarda, y es PURA — por eso se puede fijar con un banco.**
 *
 * Recibe el paso al que se quiere entrar y los **hechos** medidos sobre las hojas vivas, y
 * decide. **Cascada:** el paso 4 exige lo del 3, que exige lo del 2. Sin eso, «no se puede
 * saltear» sería *«no se puede saltear uno»*, y saltear dos pasaría.
 *
 * ⚠ **El límite, declarado en vez de descubierto.** El hecho que prueba que el paso 3 ocurrió es
 * `reuniones_sin_confirmar === 0`: `cargarTemarioReuniones_` escribe `mostrar` **vacío** y sólo el
 * paso 3 lo llena. **Para las campañas no hay hecho equivalente**, porque `cargarTemarioCampanas_`
 * las escribe con `mostrar = 'sí'` de entrada (`AJ-1`, *ante la duda entra*) — o sea que **nacen
 * confirmadas**. Un temario que trae **sólo** campañas satisface esta guarda sin haber pasado por
 * la pantalla. No se inventa una columna para taparlo: se dice.
 */
function guardaDelAsistente_(paso, hechos) {
  var n = Number(paso) || 0;
  var h = hechos || {};

  if (n <= 1) return { ok: true };

  if (!h.periodo_id) {
    return {
      ok: false, falta: 'periodo',
      motivo: 'Todavía no hay período elegido. El paso 1 es elegirlo o crearlo: una fila sin ' +
        'período no entra a ningún informe (`D-19`).'
    };
  }
  if (h.periodo_existe !== true) {
    return {
      ok: false, falta: 'periodo',
      motivo: 'El período "' + h.periodo_id + '" no está en `PERIODOS`. El motor no crea períodos ' +
        'al pasar: el paso 1 lo crea, y hasta que exista no hay sobre qué cargar.'
    };
  }
  if (n === 2) return { ok: true };

  if (!(Number(h.filas_temario) > 0)) {
    return {
      ok: false, falta: 'temario',
      motivo: 'No hay ninguna fila de temario cargada para "' + h.periodo_id + '". El paso 2 es ' +
        'pegar el temario: sin filas, el paso 3 no tiene qué confirmar y el anclaje no tiene qué ' +
        'anclar.'
    };
  }
  if (n === 3) return { ok: true };

  if (Number(h.reuniones_sin_confirmar) > 0) {
    return {
      ok: false, falta: 'confirmar',
      motivo: 'Quedan ' + h.reuniones_sin_confirmar + ' reunión(es) con `mostrar` vacío en "' +
        h.periodo_id + '". El paso 3 es decidir cuáles entran: `leerReuniones_` filtra por ' +
        '`mostrar` **antes** de que el anclaje vea nada, así que una fila sin confirmar es ' +
        'indistinguible de una que no existe y el deck saldría sin ese encuentro.'
    };
  }
  if (!String(h.informe_id || '').trim()) {
    return { ok: false, falta: 'informe', motivo: 'No se eligió informe.' };
  }
  return { ok: true };
}

/**
 * Los **hechos** que la guarda mira, leídos de las hojas vivas. Impura a propósito: es la mitad
 * que va a la planilla, y por eso la decisión está en la otra.
 *
 * ⚠ **La existencia del período se pregunta contra las filas CRUDAS**, no contra `leerPeriodos()`:
 * ése es `leerRegistro_` y **colapsa las claves repetidas** —hoy ve 8 donde la hoja tiene 9—. Es
 * el mismo motivo por el que `crearPeriodos_` lee crudo.
 */
function hechosDelAsistente_(periodoId, informeId) {
  var ref = String(periodoId || '').trim();
  var crudas = filasCrudasDePeriodos_();
  var reuniones = estadoDeTemario_('REUNIONES', ref);
  var campanas = estadoDeTemario_('CAMPANAS', ref);

  return {
    periodo_id: ref,
    periodo_existe: !!(ref && crudas.ok && crudas.porClave[ref]),
    filas_temario: reuniones.filas_cargadas + campanas.filas_cargadas,
    filas_reuniones: reuniones.filas_cargadas,
    filas_campanas: campanas.filas_cargadas,
    reuniones_sin_confirmar: reuniones.sin_confirmar,
    campanas_sin_id: campanas.sin_confirmar,
    informe_id: String(informeId || '').trim()
  };
}

/**
 * ⭐ **La ventana del paso 1 — tres opciones, y NO una lista que crece.**
 *
 * ⚠ **Ninguna de las tres reimplementa el corte viernes–jueves.** `semanaR11_` es el único lugar
 * donde vive, y acá sólo se elige **qué fecha preguntarle** — que es exactamente la forma que
 * `ultimaSemanaCerradaR11_` ya usa. Un segundo cálculo del corte es el error que este repo ya
 * cometió cuatro veces (`CLAUDE.md` §4).
 *
 * ⚠ **Valida y NO corrige** en el personalizado, por lo mismo que `crearPeriodoPersonalizado_`:
 * un rango invertido **no falla en ningún lado**, publica una ventana vacía.
 *
 * Devuelve `{ ok, modo, desde, hasta, sin_cerrar, avisos }` con `Date` en `desde`/`hasta`.
 */
function ventanaDelAsistente_(modo, desdeTexto, hastaTexto, hoy) {
  var cuando = hoy || new Date();
  var m = String(modo || '').trim();

  if (m === 'en_curso' || m === 'anterior') {
    var enCurso = semanaR11_(cuando);
    var cerrada = ultimaSemanaCerradaR11_(cuando);
    var elegida = (m === 'en_curso') ? enCurso : cerrada;
    /* ⚠ `sin_cerrar` se calcula comparando las DOS lecturas, no con una cuenta de días propia:
     * sólo difieren el viernes, y el viernes es justo el día en que se genera `jm`. */
    var sinCerrar = m === 'en_curso' &&
      formatearFecha_(enCurso.desde) !== formatearFecha_(cerrada.desde);
    return {
      ok: true, modo: m, desde: elegida.desde, hasta: elegida.hasta,
      sin_cerrar: sinCerrar,
      avisos: sinCerrar ? [AVISO_SEMANA_SIN_CERRAR_] : []
    };
  }

  if (m !== 'personalizado') {
    return {
      ok: false, modo: m,
      motivo: 'modo desconocido: "' + modo + '". Los tres son `en_curso`, `anterior` y ' +
        '`personalizado` — y son tres a propósito, no una lista que crece.'
    };
  }

  /* Las mismas tres validaciones que `crearPeriodoPersonalizado_`, y por el mismo lector: un
   * tercer parser de fechas acá sería el quinto normalizador de este repo. */
  var desde = parsearFechaCelda_(desdeTexto);
  var hasta = parsearFechaCelda_(hastaTexto);
  if (!desde || !hasta) {
    return {
      ok: false, modo: m,
      motivo: 'no pude leer las fechas: desde="' + desdeTexto + '" hasta="' + hastaTexto +
        '". Se leen con el mismo parser que usa el motor (`parsearFechaCelda_`).'
    };
  }
  if (desde.getTime() > hasta.getTime()) {
    return {
      ok: false, modo: m,
      motivo: 'el `desde` (' + formatearFecha_(desde) + ') es posterior al `hasta` (' +
        formatearFecha_(hasta) + '). Un rango invertido no falla: publica una ventana vacía.'
    };
  }
  var anio = desde.getFullYear();
  if (anio < 2015 || anio > 2100) {
    return { ok: false, modo: m, motivo: 'el año ' + anio + ' está fuera del rango plausible (2015-2100).' };
  }
  return { ok: true, modo: m, desde: desde, hasta: hasta, sin_cerrar: false, avisos: [] };
}

/**
 * Paso 1 · **lo que el panel necesita para dibujar las tres opciones ANTES de elegir.**
 *
 * ⭐ Las tres traen su ventana, su `periodo_id` derivado y **si ya existe** — porque elegir un
 * período que ya está **no crea nada**: se reusa. Y la de «en curso» trae su aviso de datos
 * parciales **acá**, al elegirla, no cuando el deck ya salió.
 */
function panel_asistenteOpcionesDePeriodo() {
  var hoy = new Date();
  var crudas = filasCrudasDePeriodos_();
  var opciones = ['anterior', 'en_curso'].map(function (m) {
    var v = ventanaDelAsistente_(m, '', '', hoy);
    var id = periodoIdDeVentana_(v.desde, v.hasta);
    return {
      modo: m,
      periodo_id: id,
      desde: formatearFecha_(v.desde),
      hasta: formatearFecha_(v.hasta),
      sin_cerrar: v.sin_cerrar === true,
      /* ⚠ Contra las filas CRUDAS: `leerPeriodos()` colapsa las repetidas. */
      ya_existe: !!(crudas.ok && crudas.porClave[id]),
      avisos: v.avisos || []
    };
  });

  return {
    ok: true,
    opciones: opciones,
    /* La lista de los que ya están, para que «reusar» sea una elección visible y no un efecto. */
    periodos: (crudas.ok ? crudas.filas : []).map(function (f) {
      var iD = crudas.headers.indexOf('desde');
      var iH = crudas.headers.indexOf('hasta');
      return { id: f.id, desde: fechaLegible_(f.valores[iD]), hasta: fechaLegible_(f.valores[iH]) };
    }),
    claves_repetidas: crudas.ok
      ? Object.keys(crudas.porClave).filter(function (k) { return crudas.porClave[k] > 1; })
      : []
  };
}

/* ── Paso 2 · el temario, en UN SOLO pegado ───────────────────────────────────────────────
 *
 * ⭐ **Vuelve el formato único:** la lista de reuniones + el título «Campañas destacadas» + las
 * campañas, todo junto. `partirTemarioEnBloques_` **ya hacía la partición** — esto es recuperar
 * una pieza, no construirla — pero **le faltaba una cosa, y se midió antes de tocarla.**
 *
 * ⛔⛔ **Lo que le falta, medido el 27/08/2026: se COME la línea que no parsea.** Su heurística
 * dice que una línea sin `>`, sin numeración `N)` y sin `|`, de menos de 60 caracteres, **es un
 * encabezado de bloque**. Una línea de temario mal tipeada cumple las tres, así que se convierte
 * en el `titulo` de un bloque vacío **y desaparece de todos los `lineas`**.
 *
 *     texto:  "1) JM | Uno a uno en Retiro 24/07"   →  bloque 1, línea
 *             "esto no parsea"                      →  ⛔ bloque 2, TÍTULO — se perdió
 *             "> Campañas destacadas"               →  bloque 3, título
 *
 * ⇒ **Nunca llega a `cargarTemarioReuniones_`, así que nunca recibe su fila con
 * `notas = 'no se pudo parsear'`, así que el paso 3 no la puede mostrar.** El hueco no estaba en
 * el cargador —que hace lo correcto— sino un escalón antes, en el partidor. Es la regla de
 * `CLAUDE.md` §4 en su forma literal: *la función que estás leyendo no es el camino completo; el
 * filtro que te falta suele estar en quien le pasa los datos*.
 *
 * ⭐ **La salida es devolver el título comido a la lista de líneas**, y no tocar
 * `partirTemarioEnBloques_`: su heurística es correcta para lo que hace —encontrar el bloque de
 * campañas, que es su único uso— y cambiarla movería el cargador de campañas, que hoy anda.
 *
 * ⚠ **Y el efecto lateral, declarado en vez de descubierto:** un encabezado legítimo **sin `>`**
 * —`DGAYD`, el caso que la heurística existe para tolerar— también vuelve a la lista y produce una
 * fila `no se pudo parsear`. **Se eligió a sabiendas:** una fila de más se ve en el paso 3 y se
 * destilda; una línea perdida en silencio publica un informe al que le falta un encuentro. Un
 * encabezado **con `>`** no tiene el problema: se reconoce y se descarta.
 */

/* ⛔⛔ `2026-08-27_2` Parte B.1 - **`esBloqueDeCampanas_` y `partirTemarioDelAsistente_` se
 * RETIRARON.** Eran la segunda forma de decidir cual es el bloque de campanias, y la primera -la
 * de `cargarTemarioCampanas_`- **ya fallaba**: comparaba por igualdad y el temario real del 27/08
 * dice `Campania Destacada` en **singular** (A.2). *Dos formas de decidir lo mismo no fallan el
 * dia que difieren: cargan otra cosa.*
 *
 * ⭐ Hoy hay **una**: `partirTemario_` (`Campanas.gs`), posicional, y la usan los tres
 * llamadores. El asistente ya no recorta nada: **le pasa el texto entero a los dos cargadores**,
 * que parten cada uno con esa funcion y toman su balde. Lo unico que hace aca es pedirle la lista
 * de `ignoradas` para mostrarla. */

/**
 * Paso 2 · **carga el pegado único: reuniones y campañas, por los cargadores de siempre.**
 *
 * ⛔ **No hay un segundo camino de escritura.** `cargarTemarioReuniones_` y
 * `cargarTemarioCampanas_` son los escritores declarados de sus hojas (`docs/ESCRITORES.md`), y
 * esto es un **ruteador**: decide qué texto va a cada uno y junta los dos reportes.
 *
 * ⚠ **El `periodo_id` lo pone el llamador y ya está validado** — por `guardaDelAsistente_`, contra
 * las filas crudas de `PERIODOS`. No se valida de nuevo ni se completa con un default (`D-19`).
 *
 * ⭐⭐ **Y las líneas que NO se pudieron interpretar viajan con nombre, no con un conteo.** «3 sin
 * parsear» no deja saber cuáles, y el paso 3 tiene que poder señalarlas: un temario que carga 4 de
 * 5 y no lo dice publica un informe al que le falta un encuentro.
 */
function panel_asistenteCargarTemario(periodoId, texto, informeId) {
  var hechos = hechosDelAsistente_(periodoId, informeId);
  var permiso = guardaDelAsistente_(2, hechos);
  if (!permiso.ok) return { ok: false, motivo: permiso.motivo, falta: permiso.falta };

  if (!texto || !String(texto).trim()) return { ok: false, motivo: 'La caja está vacía.' };

  var ref = String(periodoId || '').trim();
  /* ⭐ El partidor UNICO, y **se lo llama para mirar, no para recortar**: a los dos cargadores se
   * les pasa el texto entero y cada uno parte con esta misma funcion. Una sola definicion de donde
   * corta el temario, tres llamadores. */
  var partido = partirTemario_(texto);
  var salida = {
    ok: true,
    periodo_id: ref,
    hay_campanas: partido.campanas.length > 0,
    lineas_reuniones: partido.reuniones.length,
    reuniones: null,
    campanas: null,
    /* ⭐⭐ Parte F - lo que no fue a ninguna hoja viaja SIEMPRE, aunque este vacio: el panel
     * elige si lo pinta, pero nunca tiene que adivinar si existe. */
    ignoradas: partido.ignoradas.slice(),
    avisos: []
  };

  if (partido.reuniones.length) {
    var rr = cargarTemarioReuniones_(texto, ref);
    if (!rr.ok) return { ok: false, motivo: 'reuniones: ' + rr.motivo };
    salida.reuniones = rr;
    /* Las que el cargador descarto por su cuenta -los ejes agregados de B.2- se suman a la lista,
     * sin repetir las que ya trae el partidor. */
    (rr.ignoradas || []).forEach(function (x) {
      if (x.motivo === 'eje agregado') salida.ignoradas.push(x);
    });
  } else {
    salida.avisos.push('ⓘ No quedó ninguna línea del lado de las reuniones.');
  }

  if (partido.campanas.length) {
    var rc = cargarTemarioCampanas_(texto, ref, String(informeId || '').trim());
    if (!rc.ok) return { ok: false, motivo: 'campañas: ' + rc.motivo };
    salida.campanas = rc;
  } else {
    /* ⚠ **No es un error**: un temario puede no traer campañas. Pero se dice, porque una línea
     * mal escrita produce exactamente el mismo silencio que la ausencia. */
    salida.avisos.push('ⓘ No apareció ninguna línea que anuncie las campañas. Si el temario traía ' +
      'campañas, la línea tiene que empezar con «Campaña» o «Campañas» —singular y plural sirven, ' +
      'con `>` o sin él— y no puede tener `|`.');
  }

  /* ⛔⛔ Parte F - **si no quedo ninguna linea de reuniones Y hay ignoradas, se dice.** No se
   * inventa un modo degradado que cargue igual: una carga que no escribio nada tiene que decirlo,
   * y decir POR QUE. */
  if (!partido.reuniones.length && salida.ignoradas.length) {
    salida.avisos.push('⛔ No entró ninguna reunión, y ' + salida.ignoradas.length +
      ' línea(s) quedaron afuera. Revisá la lista de abajo: si alguna era un encuentro, el corte ' +
      'de campañas se disparó antes de tiempo.');
  }

  /* ⭐ Los hechos DESPUÉS de cargar: es lo que decide si el paso 3 abre, y sale de la hoja. */
  salida.hechos = hechosDelAsistente_(ref, informeId);
  salida.puede_confirmar = guardaDelAsistente_(3, salida.hechos).ok;
  return salida;
}

/* ── Paso 3 · confirmar, en UNA sola pantalla ─────────────────────────────────────────────
 *
 * ⭐ **Dos preguntas al mismo tiempo, y viven juntas porque las dos deciden el número:** si la
 * fila **entra** al informe, y **contra qué cuenta ancló**. La segunda ya costó caro — el deck del
 * 04/08 publicó **once números de `3347-JULJDGAG` cuando el encuentro era `3387-JULJDGGC`**, dos
 * cuentas con el mismo nombre de campaña. **Ningún número estaba mal formateado ni mal ubicado:
 * estaba mal la cuenta.**
 *
 * ⛔⛔ **La premisa que este paso corrige, y estaba en el prompt: `panel_getAnclajes` lee
 * `ANCLAJE_PENDIENTE`, que SÓLO registra los de baja confianza.** Un encuentro que ancló perfecto
 * y uno que no ancló contra nada **se ven idénticos desde esa hoja: no están.** Ese hueco ya
 * bloqueó una medición el 22/08.
 *
 * ⇒ **Esta pantalla lee el RESULTADO de `anclarEncuentros`** —que devuelve `encuentros`,
 * `bajaConfianza` y `sinLink`—, no la hoja. `ANCLAJE_PENDIENTE` sigue guardando las decisiones
 * para que no se vuelva a preguntar, y **eso no cambia**.
 *
 * ⛔⛔ **Y la corrección de premisa que salió al medir: el anclaje NO puede correr antes de que se
 * confirmen los checks.** `anclarEncuentrosSinCache_` ancla sobre `leerReuniones_()`, que filtra
 * `esVerdadero_(mostrar)` **antes de que el anclaje vea nada** — y `cargarTemarioReuniones_` deja
 * `mostrar` vacío a propósito. Un temario recién cargado tiene **cero** filas anclables, así que
 * *«el anclaje corre al entrar al paso 3»* ancla **nada**.
 *
 *   ⭐ **Es un caso ya medido, y está en `CLAUDE.md` §4:** el 25/08 el aviso dijo *«REUNIONES no
 *   tiene filas para anclar en `julio_24_30` — descartadas por período: 6»* y las cuatro filas de
 *   julio tenían `mostrar` vacío. **El filtro que faltaba estaba un nivel arriba, en quien le pasa
 *   los datos.**
 *
 *   ⇒ **El paso 3 es una pantalla con dos momentos:** se marcan los checks, se aprieta
 *   *Confirmar y anclar*, y **en la misma respuesta** vuelven las tres listas del anclaje. Los dos
 *   datos quedan a la vista juntos, que es lo que el paso pide.
 *
 *   ⛔ **No se cambió el criterio de `mostrar` de `cargarTemarioReuniones_`** para esquivar esto.
 *   El propio cargador declara que unificarlo con el de `CAMPANAS` **es decisión del usuario, no
 *   del código**, y cambiarlo acá habría sido tomarla de costado.
 */

/**
 * ⭐⭐ **Las tres listas del anclaje, aplanadas — y es PURA, así que se puede fijar con un banco.**
 *
 * Recibe el retorno de `anclarEncuentros` y devuelve una fila por encuentro con su `estado`:
 *
 *   · `alta`      — ancló por encima del umbral. Sale ✅, la persona no hace nada
 *   · `baja`      — ancló por debajo. **Elige** entre los candidatos
 *   · `sin_link`  — ninguna cuenta, u homónimos que el desempate no separa
 *
 * ⛔ **`alta` NO existe en `ANCLAJE_PENDIENTE`, y ése es el punto.** El motor sólo registra fila
 * cuando el score queda bajo el umbral, así que leyendo la hoja los de alta confianza **no
 * aparecen** — y el control positivo del banco es justamente que aparezcan acá.
 */
function estadosDeAnclaje_(anclaje) {
  if (!anclaje || anclaje.ok !== true) {
    return { ok: false, motivo: (anclaje && anclaje.motivo) || 'el anclaje no devolvió resultado' };
  }

  var comoFila = function (item, estado) {
    return {
      estado: estado,
      reunion: item.reunion,
      tipo: item.tipo || '',
      fecha: item.fecha instanceof Date ? formatearFecha_(item.fecha) : String(item.fecha || ''),
      etapa: item.etapa || '',
      id_cuenta: item.idCuenta || '',
      candidato: item.candidatoNombre || '',
      /* ⚠ El score viaja **crudo**, sin redondear ni convertir a porcentaje: el umbral con el que
       * se compara está en `CONFIG` y viene al lado. Que el front decida cómo mostrarlo. */
      score: typeof item.score === 'number' ? item.score : null,
      confirmado_a_mano: item.confirmadoAMano === true,
      /* La clave con la que `panel_confirmarAnclaje` encuentra la fila. Sin ella, elegir un
       * candidato desde esta pantalla no tendría dónde escribir. */
      nombre_buscado: item.nombreBuscado || '',
      /* ⛔ Los dos motivos son distintos y no se colapsan: «no hay fila de `rdv`» manda a mirar el
       * temario, y «homónimos sin desempate» manda a elegir la cuenta. */
      motivo: item.motivoAmbiguo || item.motivo || '',
      traza_desempate: item.traza_desempate || '',
      paso_anclaje: item.paso_anclaje || null
    };
  };

  var filas = []
    .concat((anclaje.encuentros || []).map(function (i) { return comoFila(i, 'alta'); }))
    .concat((anclaje.bajaConfianza || []).map(function (i) { return comoFila(i, 'baja'); }))
    .concat((anclaje.sinLink || []).map(function (i) { return comoFila(i, 'sin_link'); }));

  return {
    ok: true,
    umbral: anclaje.umbral,
    periodo_id: anclaje.periodo_id || '',
    excluidas_por_periodo: anclaje.excluidas_por_periodo || [],
    filas: filas,
    /* ⭐ Los tres conteos van declarados: «cero de baja confianza» y «no se midió» se ven igual en
     * una lista vacía, y sólo uno de los dos es un resultado. */
    conteos: {
      alta: (anclaje.encuentros || []).length,
      baja: (anclaje.bajaConfianza || []).length,
      sin_link: (anclaje.sinLink || []).length
    }
  };
}

/**
 * Las filas del temario **tal como están**, para el check del paso 3.
 *
 * ⚠ **Lee TODAS las filas del período, no las que `leerReuniones_` deja pasar.** Ése filtra por
 * `mostrar`, y acá `mostrar` es justamente lo que se está por decidir: preguntarle a él sería
 * preguntarle al filtro cuáles pasan el filtro.
 *
 * ⭐ **La fila se direcciona por su clave de curación, no por su posición.** Para `REUNIONES` es
 * `texto_original` —lo que `curarCamposReuniones_` ya usa, y es estable porque es exactamente la
 * línea que originó la fila—; para `CAMPANAS`, `campana_id` + `periodo_id`. El panel puede estar
 * mostrando una lista vieja, y escribir por índice pondría la decisión en la fila equivocada
 * **sin que nada falle**.
 */
function filasParaConfirmar_(periodoId) {
  var ref = String(periodoId || '').trim();
  var mismas = function (f) { return String(f.periodo_id || '').trim() === ref; };

  var reuniones = filasDeHojaRegistro_('REUNIONES').filter(mismas).map(function (f) {
    var notas = String(f.notas || '');
    return {
      fuente: 'REUNIONES',
      clave: String(f.texto_original || ''),
      etiqueta: String(f.nombre || '').trim() || String(f.texto_original || '(sin texto)'),
      detalle: [String(f.tipo || ''), String(f.eje || '')].filter(function (x) { return x; }).join(' · '),
      fecha: f.fecha instanceof Date ? formatearFecha_(f.fecha) : String(f.fecha || ''),
      etapa: String(f.etapa || ''),
      /* ⭐ `mostrar` vacío es «todavía nadie decidió», y es distinto de «decidieron que no». Los
       * tres estados viajan separados: el front no tiene que deducir cuál es cuál. */
      mostrar: esVerdadero_(f.mostrar),
      sin_decidir: String(f.mostrar || '').trim() === '',
      notas: notas,
      /* ⛔⛔ La línea que no se pudo interpretar, marcada. `cargarTemarioReuniones_` ya escribía
       * esta nota y **no la leía nadie**: un temario que carga 4 de 5 y no lo dice publica un
       * informe al que le falta un encuentro. */
      sin_parsear: notas === 'no se pudo parsear' || notas.indexOf('no se encontró fecha') !== -1,
      nombre_buscado: nombreBuscadoDeReunion_(f)
    };
  });

  var campanas = filasDeHojaRegistro_('CAMPANAS').filter(mismas).map(function (f) {
    var notas = String(f.notas || '');
    return {
      fuente: 'CAMPANAS',
      clave: String(f.campana_id || ''),
      etiqueta: String(f.nombre || '').trim() || String(f.campana_id || '(sin nombre)'),
      detalle: String(f.id_cuenta || '') ? 'id_cuenta ' + f.id_cuenta : '',
      fecha: '',
      etapa: '',
      mostrar: esVerdadero_(f.mostrar),
      /* ⚠ Para campañas `mostrar` nace en `'sí'` (`AJ-1`, *ante la duda entra*), así que
       * `sin_decidir` es casi siempre `false`. Se emite igual, con la misma forma que reuniones:
       * el front no tiene que saber que las dos fuentes se comportan distinto. */
      sin_decidir: String(f.mostrar || '').trim() === '',
      notas: notas,
      /* Para campañas «lo que hay que mirar» no es el parseo sino el **id**: `SIN CONFIRMAR` es un
       * id resuelto por similitud y `SIN ID` es uno que no resolvió. Son dos criterios distintos
       * para el mismo gesto, y el panel los pone al lado en vez de unificarlos. */
      sin_parsear: notas.indexOf('SIN CONFIRMAR') !== -1 || notas.indexOf('SIN ID') !== -1
    };
  });

  return { reuniones: reuniones, campanas: campanas };
}

/**
 * ⭐ **El anclaje del paso 3, con las DOS cachés abiertas.**
 *
 * ⛔⛔ **Un instrumento que mide lo que cuesta una corrida no ARMA su preámbulo: lo COPIA**
 * (`CLAUDE.md` §4). `generarInforme` enciende `abrirCacheRegistros_()` y `abrirCacheDatosHoja_()`
 * con `try/finally`, y las dos están **apagadas por defecto a propósito**. Correr el anclaje sin
 * ellas mide otra cosa: `unirDigitalPorCuenta` pasó de **6 s a 325** — un factor **54** — porque
 * `buscarMapeo` no cachea por su cuenta y relee `SOLAPAS` y `MAPEO` enteras en cada llamada.
 *
 * ⚠ **La que domina es la de REGISTROS.** Con `cacheDatosHoja_` sola no cambió nada. Encender «la
 * que parece» es peor que no encender ninguna, porque produce un número que parece corregido.
 */
function anclarParaElAsistente_(ventana) {
  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    return anclarEncuentros(ventana);
  } finally {
    cerrarCacheRegistros_();
    cerrarCacheDatosHoja_();
  }
}

/**
 * Paso 3 · **lo que hay cargado, para el check.** Sólo lectura: no escribe ni ancla.
 *
 * ⚠ **No corre el anclaje**, y no es por costo: con el temario recién cargado **no hay ninguna
 * fila con `mostrar = sí`**, así que anclaría sobre cero y devolvería tres listas vacías — que se
 * leen como *«ningún encuentro tiene problema»*. Ver el encabezado del bloque.
 */
function panel_asistentePaso3(periodoId, informeId) {
  var hechos = hechosDelAsistente_(periodoId, informeId);
  var permiso = guardaDelAsistente_(3, hechos);
  if (!permiso.ok) return { ok: false, motivo: permiso.motivo, falta: permiso.falta };

  var filas = filasParaConfirmar_(periodoId);
  return {
    ok: true,
    periodo_id: String(periodoId || '').trim(),
    reuniones: filas.reuniones,
    campanas: filas.campanas,
    hechos: hechos,
    umbral: umbralAnclajeReunion_(),
    /* ⭐ Cuántas líneas no se pudieron interpretar, dicho arriba y no al pie: cambia cómo se lee
     * toda la lista de abajo. */
    sin_parsear: filas.reuniones.filter(function (f) { return f.sin_parsear; }).length
  };
}

/**
 * Paso 3 · **confirma los checks y ancla, en una sola llamada.**
 *
 * `decisiones` es `[{ fuente: 'REUNIONES'|'CAMPANAS', clave: '…', mostrar: true|false }]`.
 *
 * ⛔ **Escribe por los curadores declarados**, no por un camino nuevo: `curarCamposReuniones_` y
 * `curarCamposCampanas_`. Los dos son angostos —no crean filas, no borran filas, no tocan la
 * clave— y devuelven el **antes y el después** de cada celda.
 *
 * ⛔ **Una decisión sobre una fila que no existe se reporta y no se inventa.** Si el panel estaba
 * mostrando una lista vieja, la clave no matchea y sale en `sin_fila`: es preferible a escribir en
 * la fila de al lado, que no falla.
 *
 * ⭐ **Y devuelve el anclaje en la misma respuesta**, porque las dos preguntas del paso 3 son una
 * pantalla: si volviera sólo el resultado de la escritura, la persona tendría que apretar otra vez
 * para ver contra qué cuenta ancló cada encuentro.
 */
function panel_asistenteConfirmar(periodoId, informeId, decisiones) {
  var ref = String(periodoId || '').trim();
  var permiso = guardaDelAsistente_(3, hechosDelAsistente_(ref, informeId));
  if (!permiso.ok) return { ok: false, motivo: permiso.motivo, falta: permiso.falta };

  var lista = decisiones || [];
  var deReuniones = [];
  var deCampanas = [];
  lista.forEach(function (d) {
    /* ⚠ `mostrar` se escribe como `'sí'` / `'no'`, **nunca vacío**: vacío es «todavía nadie
     * decidió», y confundir «decidieron que no» con «nadie miró» es lo que la guarda del paso 4
     * usa para saber si este paso ocurrió. */
    var valor = d.mostrar === true ? 'sí' : 'no';
    if (String(d.fuente) === 'CAMPANAS') {
      deCampanas.push({ campana_id: String(d.clave || ''), periodo_id: ref, mostrar: valor });
    } else {
      /* ⛔ `2026-08-28` — **el `periodo_id` viaja con el cambio, y sin él el tilde va a la fila
       * equivocada.** `claveReunion_` incluye el período, así que pegar el mismo temario para un
       * período nuevo crea otra fila con el MISMO `texto_original`; sin este campo, la escritura
       * acertaba «la primera», o sea la del período viejo, y la nueva quedaba con `mostrar` vacío.
       * Medido el 28/08 con dos filas de Coghlan. */
      deReuniones.push({ texto_original: String(d.clave || ''), periodo_id: ref, mostrar: valor });
    }
  });

  var escrituras = { reuniones: null, campanas: null };
  if (deReuniones.length) {
    escrituras.reuniones = curarCamposReuniones_(deReuniones);
    if (!escrituras.reuniones.ok) return { ok: false, motivo: 'reuniones: ' + escrituras.reuniones.motivo };
    /* ⚠ `ok` con `sin_fila` o `ambiguas` es una confirmación PARCIAL: algunas decisiones se
     * escribieron y otras no llegaron a su fila. El anclaje de abajo va a fallar por eso y su
     * mensaje va a culpar al período, así que la causa real tiene que decirse acá. */
    var perdidas = (escrituras.reuniones.sin_fila || []).concat(escrituras.reuniones.ambiguas || []);
    if (perdidas.length) {
      return {
        ok: false,
        motivo: 'se confirmaron ' + escrituras.reuniones.cambios_escritos + ' de ' +
          deReuniones.length + ' reunión(es), y ' + perdidas.length + ' NO llegó a su fila: ' +
          perdidas.join(' | ') + '. ⚠ No se corrió el anclaje: sobre una confirmación a medias su ' +
          'resultado no significa nada, y su mensaje culparía al período.'
      };
    }
  }
  if (deCampanas.length) {
    escrituras.campanas = curarCamposCampanas_(deCampanas);
    if (!escrituras.campanas.ok) return { ok: false, motivo: 'campañas: ' + escrituras.campanas.motivo };
  }
  SpreadsheetApp.flush();

  /* ⭐ **La ventana sale de `resolverVentana({ periodo_ref })`, con el período explícito.** Sin él
   * `anclarEncuentros` **no recorta por período** —está medido: entran 12 encuentros en vez de 2—
   * y el paso 3 mostraría el anclaje de medio semestre. */
  var ventana = resolverVentana({ periodo_ref: ref });
  if (!ventana.ok) {
    return { ok: false, motivo: 'no se pudo resolver la ventana de "' + ref + '": ' + ventana.motivo };
  }

  var anclaje = anclarParaElAsistente_(ventana);
  var estados = estadosDeAnclaje_(anclaje);

  /* ⭐⭐ `2026-08-28` — **primero el id, después los canales.** Con la cuenta ya resuelta, la
   * pregunta siguiente es si esa cuenta **existe en los otros canales**: sin contraparte en
   * `Directa Mail` no va a haber mails, sin contraparte en el desglose no va a haber impresiones,
   * y hoy eso se descubre mirando el deck vacío.
   *
   * ⚠ Se piden **las cuentas de las reuniones Y las de las campañas** en una sola llamada, porque
   * el costo es por SOLAPA y no por cuenta: pedirlas por separado duplicaría las lecturas. */
  var idsParaCanales = [];
  if (estados.ok) {
    (estados.filas || []).forEach(function (f) { if (f.id_cuenta) idsParaCanales.push(f.id_cuenta); });
  }
  filasDeHojaRegistro_('CAMPANAS').forEach(function (c) {
    if (String(c.periodo_id || '').trim() === ref && c.id_cuenta) idsParaCanales.push(c.id_cuenta);
  });
  var canales = contrapartesPorCuenta_(idsParaCanales, ventana);
  if (estados.ok) {
    (estados.filas || []).forEach(function (f) {
      f.canales = (f.id_cuenta && canales.por_id[f.id_cuenta]) || [];
    });
  }

  var hechos = hechosDelAsistente_(ref, informeId);
  return {
    ok: true,
    periodo_id: ref,
    escrituras: escrituras,
    /* ⚠ Las claves que no matchearon viajan **siempre**: una decisión que no se escribió y de la
     * que nadie se entera es peor que un error. */
    sin_fila: []
      .concat((escrituras.reuniones && escrituras.reuniones.sin_fila) || [])
      .concat((escrituras.campanas && escrituras.campanas.sin_fila) || []),
    anclaje: estados,
    /* ⭐ `2026-08-28` — qué canales se pudieron consultar y cuáles fallaron. Va al lado de los
     * conteos porque **sin esta lista el panel no puede decir si un canal vacío es «no hay» o «no
     * se miró»**, que es la distinción que este repo persigue en todos lados. */
    canales_consultados: canales.solapas,
    canales_fallidos: canales.fallidas,
    canales_por_cuenta: canales.por_id,
    ventana: {
      etiqueta: formatearPeriodoLamina_(ventana),
      desde: formatearFecha_(ventana.desde),
      hasta: formatearFecha_(ventana.hasta),
      origen: ventana.origen
    },
    hechos: hechos,
    puede_generar: guardaDelAsistente_(4, hechos).ok
  };
}

/**
 * Paso 4 · **generar, sobre ese período y con lo confirmado en el 3.**
 *
 * ⛔⛔ **No hay un segundo camino de generación.** Delega en `panel_generar` y
 * `panel_generarDesatendida`, que son los adaptadores de siempre y comparten
 * `panel_opcionesDeGeneracion_`. Dos constructores de opciones es la figura que ese constructor
 * vino a cerrar: el día que se agregue una opción entra en uno y no en el otro, **y ninguno de los
 * dos falla** — el segundo botón simplemente empieza a hacer otra cosa.
 *
 * ⭐⭐ **Lo que este paso agrega es la guarda, y el período EXPLÍCITO.** `panel_generar` acepta
 * `periodoId` vacío y ahí la cadena de `D-20` resuelve sola; desde el asistente **nunca** se manda
 * vacío, y eso arregla un caso medido: `anclarEncuentros` recorta `REUNIONES` **sólo si la ventana
 * vino por `periodo_ref`**, así que sin período entran **12 encuentros en vez de 2** — el deck
 * `jm-20260821-230048` es exactamente eso, y salió sin que nada fallara.
 */
function panel_asistenteGenerar(informeId, periodoId, conSimbolos, secciones, desatendida) {
  var ref = String(periodoId || '').trim();
  var hechos = hechosDelAsistente_(ref, informeId);
  var permiso = guardaDelAsistente_(4, hechos);
  if (!permiso.ok) return { ok: false, motivo: permiso.motivo, falta: permiso.falta };

  var r = (desatendida === true)
    ? panel_generarDesatendida(informeId, ref, conSimbolos, secciones)
    : panel_generar(informeId, ref, conSimbolos, secciones);

  /* ⚠ Se marca de dónde vino, y no es cosmético: una corrida del asistente **siempre** tiene
   * período explícito, y una del camino libre puede no tenerlo. Cuando alguien compare dos decks
   * del mismo informe, eso es lo que explica un temario distinto con la misma ventana. */
  if (r && r.ok) {
    r.via = 'asistente';
    r.periodo_explicito = true;
  }
  return r;
}

/**
 * Paso 1 · **elegir el período: lo crea si no está, lo REUSA si está.**
 *
 * ⛔ **Reusar es no escribir nada.** Está medido que `upsertPorClave_` **pisa sin preguntar**
 * —`agosto_14_20` con otras fechas dio `{escritas: 0, actualizadas: 1}`, reescrita en silencio— y
 * un `periodo_id` es una **clave referenciada en 119 líneas**: moverle las fechas cambia el
 * universo de todo lo que lo cita **sin que nada falle**. Por eso el alta pasa por
 * `crearPeriodos_`, que es insert-only, y por eso este camino **no tiene ninguna rama que
 * escriba sobre una fila existente**.
 *
 * ⚠ **Y el `periodo_id` se DERIVA, nunca se pide.** Dejar que alguien lo escriba reabre la puerta
 * a `'vie 14/08 -- jue 20/08 (por defecto)'`, que es una etiqueta de origen usada como clave
 * primaria y sigue en la hoja.
 */
function panel_asistenteCrearPeriodo(modo, desdeTexto, hastaTexto) {
  var hoy = new Date();
  var v = ventanaDelAsistente_(modo, desdeTexto, hastaTexto, hoy);
  if (!v.ok) return { ok: false, motivo: v.motivo };

  var id = periodoIdDeVentana_(v.desde, v.hasta);
  var crudas = filasCrudasDePeriodos_();
  if (!crudas.ok) return { ok: false, motivo: crudas.motivo };

  var dias = Math.round((v.hasta.getTime() - v.desde.getTime()) / 86400000) + 1;
  var avisos = (v.avisos || []).slice();

  /* ⭐ El tope de `R-30` **avisa y no bloquea**: una ventana larga mete cuentas por pertenencia
   * que no corresponden —la de 14–20/08 pasó de 14 a 32 cuentas—, pero cuánto dura un período es
   * una decisión editorial y la toma la persona. */
  var tope = Number(leerConfig().tope_dias_ventana_cuenta || 0);
  if (tope > 0 && dias > tope) {
    avisos.push('⚠ El período dura ' + dias + ' días y `CONFIG.tope_dias_ventana_cuenta` es ' +
      tope + '. `R-30` existe porque una ventana larga mete cuentas por pertenencia que no ' +
      'corresponden. Se crea igual, pero el universo va a ser más ancho.');
  }
  if (dias !== 7) {
    avisos.push('ⓘ No es una semana de 7 días (son ' + dias + '). Es válido: `R-11` Addendum 1 ' +
      'punto 3 dice que dos períodos pueden solaparse o dejar hueco.');
  }

  /* ⭐⭐ **Si ya existe, se REUSA y no se toca.** Y se dice: «creado» y «ya estaba» mandan a
   * lecturas distintas, y colapsarlos es lo que hace que una corrida que no hizo nada se lea como
   * éxito (`CLAUDE.md` §4). */
  if (crudas.porClave[id]) {
    return {
      ok: true, periodo_id: id, modo: v.modo,
      desde: formatearFecha_(v.desde), hasta: formatearFecha_(v.hasta),
      creado: false, reusado: true,
      filas_antes: crudas.filas.length, filas_despues: crudas.filas.length,
      sin_cerrar: v.sin_cerrar === true,
      avisos: avisos,
      claves_repetidas: Object.keys(crudas.porClave).filter(function (k) { return crudas.porClave[k] > 1; })
    };
  }

  var r = crearPeriodos_([{ desde: v.desde, hasta: v.hasta }],
    'Asistente · paso 1 (' + v.modo + ') el ' +
    Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd') +
    (v.sin_cerrar ? ' — ⚠ la semana NO había cerrado al crearla' : ''));
  if (!r.ok) return { ok: false, motivo: r.motivo, avisos: avisos };

  return {
    ok: true, periodo_id: id, modo: v.modo,
    desde: formatearFecha_(v.desde), hasta: formatearFecha_(v.hasta),
    creado: true, reusado: false,
    filas_antes: r.filas_antes, filas_despues: r.filas_despues,
    sin_cerrar: v.sin_cerrar === true,
    avisos: avisos,
    claves_repetidas: r.claves_repetidas
  };
}

/**
 * ⭐⭐ `2026-08-28` — **para cada cuenta anclada: en qué CANALES existe.** Pedido del usuario:
 * *«primer check el id, después las plataformas»*.
 *
 * **Los canales NO se escriben a mano: son las solapas que declaran `SOLAPAS.campo_id_cuenta`.**
 * Ésa es la única vía para encontrar la fila de una cuenta fuera de `rdv` (`D-30`), así que la
 * lista es exactamente la de lo que se puede chequear. Una lista literal acá se desincronizaría
 * con el registro en el primer alta — `CLAUDE.md` §2.
 *
 * ⚠ **Una lectura por SOLAPA, no una por (solapa × cuenta).** Se lee cada solapa una vez y se
 * cuentan todas las cuentas contra esas filas. Con la caché de datos abierta son 7 lecturas para
 * todo el temario; una por par serían decenas.
 *
 * ⚠ **`uso = 'ignorar'` no se toca nunca** (`CLAUDE.md` §2): son pivots, backups y duplicados, y
 * `digital/RDV` duplica la base `rdv` — contarla sería doble conteo con forma de contraparte.
 *
 * ⚠ **Se lee SIN recorte por ventana, y eso es parte del resultado.** La pregunta es *«¿esta cuenta
 * existe en este canal?»*, no *«¿entra en la semana?»*. Son distintas: una fila fuera de la ventana
 * existe y **no publica**. El panel lo dice con esas palabras para que nadie lea de más.
 */
function contrapartesPorCuenta_(ids, ventana) {
  var salida = { por_id: {}, solapas: [], fallidas: [], ok: true, motivo: '' };

  var unicos = {};
  (ids || []).forEach(function (x) {
    var s = String(x === null || x === undefined ? '' : x).trim();
    if (s) unicos[s] = true;
  });
  var lista = Object.keys(unicos);
  lista.forEach(function (id) { salida.por_id[id] = []; });
  if (!lista.length) return salida;

  abrirCacheRegistros_();
  abrirCacheDatosHoja_();
  try {
    var solapas = leerSolapas();
    Object.keys(solapas).forEach(function (baseId) {
      Object.keys(solapas[baseId] || {}).forEach(function (nombre) {
        var s = solapas[baseId][nombre] || {};
        if (String(s.uso || '').trim() !== 'fuente') return;
        var campo = String(s.campo_id_cuenta || '').trim();
        if (!campo) return;   // no se puede buscar por cuenta acá; no es un error, es que no aplica

        var mapa = buscarMapeo(baseId, nombre, campo);
        if (!mapa.ok) {
          /* ⛔ Declarada y sin `MAPEO` **sí** es un error, y hay que verlo: es el estado en que
           * `planDeLecturaPorCuenta_` falla con `@campo_id_cuenta_no_mapeado`. */
          salida.fallidas.push(baseId + '/' + nombre + ' — `' + campo + '` sin fila en MAPEO');
          return;
        }
        var lectura = leerFuente(baseId, ventana, nombre, { sin_recorte_por_ventana: true });
        if (!lectura.ok) {
          salida.fallidas.push(baseId + '/' + nombre + ' — ' + lectura.motivo);
          return;
        }
        var clave = claveDeLecturaEnColumna_(baseId, nombre, mapa.columna);
        salida.solapas.push(baseId + '/' + nombre);
        lista.forEach(function (id) {
          salida.por_id[id].push({
            base_id: baseId, solapa: nombre,
            filas: filtrarFilasPorCuenta_(lectura.filas, clave, id).length
          });
        });
      });
    });
  } catch (e) {
    salida.ok = false;
    salida.motivo = String((e && e.message) ? e.message : e);
  } finally {
    cerrarCacheDatosHoja_();
    cerrarCacheRegistros_();
  }
  return salida;
}
