/**
 * Sellador.gs — Fase 2 de `D-23`: el ancla de identidad de cada lámina.
 *
 * **Por qué es un módulo propio y no parte de `Armonizar.gs`.** `Armonizar.gs` migra
 * **tokens** del cuerpo de las láminas; esto escribe **identidad** en las notas del orador.
 * Son dos autorizaciones distintas de `C-01` —la armonización ya estaba cubierta por la
 * excepción de migración explícita, el sellado necesitó el `Addendum 1` del 07/08— y
 * mezclarlas haría parecer que una cubre a la otra. Mismo criterio que `Campanas.gs` en el
 * `_5`.
 *
 * **Estado: sólo `B.0`.** Acá vive únicamente el **lector**. No hay backup, no hay escritura,
 * no se crea `LAMINAS`. El `11.1` §5 partió la Parte B en dos con un gate en el medio: primero
 * se mide cuántas láminas tienen ancla hoy, y `B.1` en adelante entra recién con ese número
 * reportado.
 *
 * **Por qué el gate.** «Anclas ejercidas: ninguna» es evidencia documental de los dos addenda
 * de `C-01`, **no una medición**, y es justo el número contra el que `C.4` verifica el
 * resultado. Si alguien selló fuera del motor, anexar sin saberlo duplica el ancla.
 */

/**
 * El prefijo del ancla, en un solo lugar. `D-23` addendum 1 lo acotó a **un solo campo**:
 * `#lamina: L-NNN`. `#seccion:` **no existe** y escribirlo no está autorizado (`C-01`
 * addendum 2) — la clasificación vive en la hoja `LAMINAS`, no en el deck.
 */
var ANCLA_LAMINA_PREFIJO_ = '#lamina:';

/**
 * Texto de las notas del orador de una lámina, o `''` si no tiene.
 *
 * `getSpeakerNotesShape()` puede devolver `null` en una lámina cuyo layout no trae el
 * placeholder de notas, y `getText()` sobre `null` tira. Se devuelve `''` en vez de propagar:
 * "sin notas" y "sin placeholder" son lo mismo para quien pregunta si hay ancla.
 *
 * **Sólo lee.** El sellado usará este mismo lector antes de anexar — la lectura es la mitad
 * de "anexar sin pisar".
 */
function notasDeLamina_(slide) {
  try {
    var shape = slide.getNotesPage().getSpeakerNotesShape();
    if (!shape) return '';
    return String(shape.getText().asString() || '');
  } catch (e) {
    return '';
  }
}

/**
 * Devuelve el `L-NNN` que trae el ancla de esa lámina, o `''` si no tiene.
 *
 * Tolerante a propósito con el espacio y el case del prefijo: el ancla la puede haber escrito
 * una persona a mano, y un `#Lamina:L-007` sigue siendo un ancla. Lo que **no** se tolera es
 * inventar el id: si el prefijo está pero no hay `L-NNN` detrás, devuelve `'(sin id)'` para
 * que el conteo lo separe en vez de contarlo como no sellado.
 */
function anclaDeLamina_(slide) {
  var texto = notasDeLamina_(slide);
  if (!texto) return '';
  var re = new RegExp(ANCLA_LAMINA_PREFIJO_.replace('#', '#') + '\\s*(L-\\d+)?', 'i');
  var m = texto.match(re);
  if (!m) return '';
  return m[1] || '(sin id)';
}

/**
 * Texto de las notas de UNA lámina, por informe y número de orden (1-based). **Sólo lectura.**
 *
 * Existe para un caso puntual y conviene decirlo: **verificar que la copia de una nota que está
 * en el repo sea idéntica a la de la plantilla, antes de borrarla de la plantilla.** Comparar
 * largos no alcanza — dos textos distintos pueden medir lo mismo.
 */
function notasDeLaminaPorOrden(informeId, orden) {
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    return { ok: false, motivo: 'Informe "' + informeId + '" sin plantilla_id en INFORMES' };
  }
  var slides = SlidesApp.openById(informe.plantilla_id).getSlides();
  if (orden < 1 || orden > slides.length) {
    return { ok: false, motivo: 'La lámina ' + orden + ' no existe (la plantilla tiene ' + slides.length + ')' };
  }
  var texto = notasDeLamina_(slides[orden - 1]);
  return { ok: true, informe_id: informeId, orden: orden, chars: texto.length, texto: texto };
}

/**
 * `C.5` — el control de cierre: **compara la plantilla contra la hoja**, y es corrible.
 *
 * **Por qué existe.** El `11.1` §4 fija que la plantilla es autoritativa y la hoja es registro
 * reparable, pero hasta acá **no había forma de verificar que coincidieran desde el motor**: la
 * primera vez que hizo falta —09/08, un estado intermedio durante la corrida viva— se leyó a
 * mano cruzando dos llamadas y comparando a ojo. Un invariante que sólo se puede chequear a mano
 * no es un invariante: es una intención.
 *
 * **Sólo lectura. No repara nada** — reparar es de `sellarPlantilla`, que sabe hacerlo y lo
 * reporta con conteo. Ésta dice qué está mal, no lo arregla.
 *
 * Los cinco desajustes que busca, y son distintos entre sí:
 *
 * 1. **Ancla sin fila** — la plantilla tiene el ancla y `LAMINAS` no la registra. Gana la
 *    plantilla: se repone la fila.
 * 2. **Fila sin ancla** — `LAMINAS` tiene el id y ninguna lámina lo lleva. **Es el peor**: el id
 *    está quemado (`D-23` punto 8, no se reusa) y no señala nada.
 * 3. **Lámina sin ancla** — quedó sin sellar.
 * 4. **Ids repetidos** en la hoja.
 * 5. **Huecos** en la secuencia, y **desajustes de `informe_id` u `orden_plantilla`** entre lo
 *    que dice la fila y dónde está realmente la lámina.
 */
function verificarLaminas() {
  var reg = leerLaminas_();
  if (!reg.ok) return reg;

  var informes = leerInformes();
  var enPlantilla = {};   // lamina_id -> { informe_id, orden }
  var sinAncla = [];
  var totalLaminas = 0;

  ordenDeSellado_(informes).forEach(function (informeId) {
    var slides;
    try {
      slides = SlidesApp.openById(informes[informeId].plantilla_id).getSlides();
    } catch (e) {
      sinAncla.push({ informe_id: informeId, motivo: 'no se pudo abrir: ' + e.message });
      return;
    }
    totalLaminas += slides.length;
    slides.forEach(function (slide, i) {
      var ancla = anclaDeLamina_(slide);
      if (!ancla || ancla === '(sin id)') {
        sinAncla.push({ informe_id: informeId, orden: i + 1, ancla: ancla || '(ninguna)' });
        return;
      }
      enPlantilla[ancla] = { informe_id: informeId, orden: i + 1 };
    });
  });

  var idsHoja = reg.filas.map(function (f) { return String(f.lamina_id).trim(); });
  var repetidos = idsHoja.filter(function (v, i) { return idsHoja.indexOf(v) !== i; });

  var anclasSinFila = Object.keys(enPlantilla).filter(function (id) { return idsHoja.indexOf(id) === -1; });
  var filasSinAncla = idsHoja.filter(function (id) { return !enPlantilla[id]; });

  var desajustes = [];
  reg.filas.forEach(function (f) {
    var id = String(f.lamina_id).trim();
    var real = enPlantilla[id];
    if (!real) return;
    if (String(f.informe_id).trim() !== real.informe_id) {
      desajustes.push({ lamina_id: id, campo: 'informe_id', en_hoja: f.informe_id, en_plantilla: real.informe_id });
    }
    if (Number(f.orden_plantilla) !== real.orden) {
      desajustes.push({ lamina_id: id, campo: 'orden_plantilla', en_hoja: f.orden_plantilla, en_plantilla: real.orden });
    }
  });

  var numeros = idsHoja.map(function (id) { return Number(id.slice(2)); })
    .filter(function (n) { return !isNaN(n); }).sort(function (a, b) { return a - b; });
  var huecos = [];
  for (var n = 1; n <= (numeros[numeros.length - 1] || 0); n++) {
    if (numeros.indexOf(n) === -1) huecos.push(formatearIdLamina_(n));
  }

  var problemas = anclasSinFila.length + filasSinAncla.length + sinAncla.length +
    repetidos.length + huecos.length + desajustes.length;

  return {
    ok: true,
    laminas_en_plantillas: totalLaminas,
    filas_en_hoja: reg.filas.length,
    anclas_en_plantillas: Object.keys(enPlantilla).length,
    anclas_sin_fila: anclasSinFila,
    filas_sin_ancla: filasSinAncla,
    laminas_sin_ancla: sinAncla,
    ids_repetidos: repetidos,
    huecos: huecos,
    desajustes: desajustes,
    veredicto: problemas === 0
      ? 'VERDE — la hoja y las plantillas coinciden: ' + totalLaminas + ' lámina(s), ' +
        reg.filas.length + ' fila(s), ids sin huecos ni repetidos.'
      : 'ROJO — ' + problemas + ' desajuste(s). La plantilla es autoritativa: reparar la hoja, nunca al revés.'
  };
}

/**
 * Mide **cuántas filas cambian** si `~=` plegara el case. **Sólo lectura.**
 *
 * La pregunta la abre el operador `~=` del `_10`: `normalizarValorDeclarado_` es el canónico de
 * `R-10` y **no pliega case ni acentos**, así que `nombre_campaña~=JM` no matchea `jm`. Antes de
 * decidir si el operador debería plegar, hay que saber si la diferencia **existe en los datos**.
 *
 * Lee por `abrirHoja`, **no por `leerFuente`**: éste exige `fecha_periodo` y las solapas de canal
 * de `looker` no la tienen. `abrirHoja` no consulta `uso` (`Fuentes.gs:623-625`, declarado a
 * propósito), y las dos solapas que mira son `uso = fuente`, así que no se toca ninguna
 * `ignorar`.
 */
function medirSensibilidadDeContiene(baseId, solapa, columna, aguja) {
  var abierto = abrirHoja(baseId, solapa);
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };

  var datos = abierto.hoja.getDataRange().getValues();
  if (!datos.length) return { ok: false, motivo: 'hoja vacía' };

  var headers = datos[0].map(function (h) { return String(h).trim(); });
  var col = headers.indexOf(columna);
  if (col === -1) {
    return { ok: false, motivo: 'la columna "' + columna + '" no existe en ' + baseId + '/' + solapa,
      columnas: headers };
  }

  var sensible = 0, insensible = 0, soloInsensible = [];
  var agujaNorm = normalizarValorDeclarado_(aguja);
  var agujaBaja = agujaNorm.toLowerCase();

  for (var f = 1; f < datos.length; f++) {
    var v = normalizarValorDeclarado_(datos[f][col]);
    if (!v) continue;
    var s = v.indexOf(agujaNorm) !== -1;
    var i = v.toLowerCase().indexOf(agujaBaja) !== -1;
    if (s) sensible++;
    if (i) insensible++;
    if (i && !s && soloInsensible.length < 10) soloInsensible.push({ fila: f + 1, valor: v });
  }

  return {
    ok: true,
    base_id: baseId, solapa: solapa, columna: columna, aguja: aguja,
    filas_con_valor: datos.length - 1,
    matchean_sensible: sensible,
    matchean_insensible: insensible,
    diferencia: insensible - sensible,
    solo_insensible: soloInsensible,
    veredicto: insensible === sensible
      ? 'La diferencia es CERO: la pregunta del case se cierra sola para este caso.'
      : 'Diferencia de ' + (insensible - sensible) + ' fila(s) — hay que decidir, no asumir.'
  };
}

/** Ítem de menú del control de cierre. Sólo lectura, así que no pide confirmación. */
function menuVerificarLaminas_() {
  var ui = ui_();
  var r = verificarLaminas();
  if (!r.ok) { ui.alert('Verificar LAMINAS', r.motivo, ui.ButtonSet.OK); return; }

  var lineas = [r.veredicto, '',
    'Láminas en las plantillas: ' + r.laminas_en_plantillas,
    'Con ancla: ' + r.anclas_en_plantillas,
    'Filas en LAMINAS: ' + r.filas_en_hoja];

  function bloque(titulo, lista) {
    if (!lista.length) return;
    lineas.push('', titulo + ' (' + lista.length + '):');
    lista.slice(0, 12).forEach(function (x) { lineas.push('  · ' + JSON.stringify(x)); });
    if (lista.length > 12) lineas.push('  … y ' + (lista.length - 12) + ' más');
  }
  bloque('Anclas sin fila en la hoja — reponer la fila', r.anclas_sin_fila);
  bloque('⚠ Filas sin ancla en la plantilla — id quemado', r.filas_sin_ancla);
  bloque('Láminas sin sellar', r.laminas_sin_ancla);
  bloque('Ids repetidos', r.ids_repetidos);
  bloque('Huecos en la secuencia', r.huecos);
  bloque('Desajustes de informe_id u orden_plantilla', r.desajustes);

  ui.alert('Verificar LAMINAS contra las plantillas', lineas.join('\n'), ui.ButtonSet.OK);
}

/**
 * Lista los backups de plantillas, más nuevo primero. **Sólo lectura.**
 *
 * Existe porque el backup es la red de `C-01` y hasta ahora no había forma de verificar que
 * estuviera puesta sin abrir Drive a mano. Cuando una corrida sobre plantilla viva se
 * diagnostica, la primera pregunta es si el backup llegó a crearse.
 */
function listarBackupsDePlantillas(limite) {
  var carpeta = asegurarCarpetaBackups_();
  if (!carpeta.ok) return { ok: false, motivo: carpeta.motivo };

  var archivos = carpeta.carpeta.getFiles();
  var salida = [];
  while (archivos.hasNext()) {
    var f = archivos.next();
    salida.push({
      nombre: f.getName(),
      id: f.getId(),
      creado: Utilities.formatDate(f.getDateCreated(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
      url: f.getUrl()
    });
  }
  salida.sort(function (a, b) { return a.creado < b.creado ? 1 : -1; });
  return { ok: true, total: salida.length, backups: salida.slice(0, limite || 12) };
}

/**
 * El orden de sellado, **fijado y no derivado**. `secco` primero, `jm` después.
 *
 * **Por qué está acá y no se toma de `leerInformes()`.** Ese orden es el de las filas de la hoja
 * `INFORMES` —hoy `jm` primero— y **cambiaría los ids si alguien reordena la hoja**. Un
 * `lamina_id` asignado no se reusa nunca (`D-23` punto 8), así que el orden de sellado no puede
 * depender de algo que se edita a mano sin consecuencias aparentes.
 *
 * **El motivo del orden es de legibilidad** y está en `CLAUDE.md` §2: la documentación del
 * proyecto dice *"lámina 2"*, *"lámina 6"*, *"la 10 escondida"* refiriéndose a la **posición en
 * `jm`**. Con `jm` arrancando en `L-030`, ningún `lamina_id` se parece a una de esas posiciones.
 *
 * Un informe activo que no esté en la lista va **después** de los fijados, alfabético: una
 * tercera plantilla toma `L-052` en adelante y eso tiene que ser esperado, no sorpresa.
 *
 * Origen: 09/08. El menú recorría `Object.keys(leerInformes())` y el diálogo listaba `jm`
 * primero; **ese arreglo era también el de ejecución**, así que habría asignado `L-001`–`L-022`
 * a `jm`, al revés del `11.2`. Lo cazó el usuario al leer el diálogo antes de aceptar.
 */
var ORDEN_SELLADO_ = ['secco', 'jm'];

function ordenDeSellado_(informes) {
  var activos = Object.keys(informes).filter(function (id) {
    return informes[id].activo && informes[id].plantilla_id;
  });
  var fijados = ORDEN_SELLADO_.filter(function (id) { return activos.indexOf(id) !== -1; });
  var resto = activos.filter(function (id) { return ORDEN_SELLADO_.indexOf(id) === -1; }).sort();
  return fijados.concat(resto);
}

/**
 * `B.6` — ítem de menú. **Confirmación PREVIA con el detalle**, no `ButtonSet.OK` después.
 *
 * El precedente elegido es `menuConsolidarMapeoLooker_` (`Solapas.gs`), no
 * `menuArmonizarPlantillas_` (`11.1` §3). Los dos existen y son opuestos; se eligió el que
 * pregunta antes porque **es la primera operación del proyecto que escribe sobre una plantilla
 * viva, y una plantilla no tiene `git`**. El backup obligatorio de `C-01` protege contra el
 * error; la confirmación protege contra el arrepentimiento, que es otra cosa.
 *
 * El diálogo dice, antes de tocar nada: cuántas láminas se van a sellar, en qué plantilla, y que
 * se hace backup primero. Sale de un `dryRun`, así que el número es real, no estimado.
 */
function menuSellarPlantillas_() {
  var ui = ui_();
  var informes = leerInformes();

  var orden = ordenDeSellado_(informes);
  if (!orden.length) {
    ui.alert('Sellar plantillas', 'No hay informes activos con plantilla_id cargado.', ui.ButtonSet.OK);
    return;
  }

  // El rango de ids se simula **acumulando**: el contador es global, así que la segunda
  // plantilla arranca donde termina la primera. Calcularlo por plantilla contra el estado
  // actual de la hoja daría el mismo arranque para las dos y mentiría.
  var reg = leerLaminas_();
  if (!reg.ok) { ui.alert('Sellar plantillas', reg.motivo, ui.ButtonSet.OK); return; }
  var siguiente = siguienteIdLamina_(reg.filas);

  var previos = [];
  orden.forEach(function (informeId) {
    var previo = sellarPlantilla(informeId, { dryRun: true });
    if (!previo.ok) return;
    previo.rango_previsto = previo.a_sellar
      ? formatearIdLamina_(siguiente) + ' … ' + formatearIdLamina_(siguiente + previo.a_sellar - 1)
      : '(nada que asignar)';
    siguiente += previo.a_sellar;
    previos.push(previo);
  });

  if (!previos.length) {
    ui.alert('Sellar plantillas', 'No hay informes activos con plantilla_id cargado.', ui.ButtonSet.OK);
    return;
  }

  var total = previos.reduce(function (n, p) { return n + p.a_sellar; }, 0);
  if (!total) {
    ui.alert('Sellar plantillas', 'Nada que sellar: todas las láminas ya tienen ancla.', ui.ButtonSet.OK);
    return;
  }

  var lineas = ['Se va a ESCRIBIR sobre las plantillas vivas, EN ESTE ORDEN:', ''];
  previos.forEach(function (p, i) {
    lineas.push((i + 1) + '. ' + p.plantilla + ' (' + p.informe_id + ')');
    lineas.push('   ' + p.a_sellar + ' de ' + p.laminas + ' lámina(s) sin ancla' +
      (p.ya_tenian_ancla ? ' — ' + p.ya_tenian_ancla + ' ya sellada(s)' : ''));
    // El rango es el único dato irreversible de la operación: un `lamina_id` asignado no se
    // reusa nunca (`D-23` punto 8). El conteo solo no alcanza para revisarlo antes de aceptar.
    lineas.push('   ids que va a asignar: ' + p.rango_previsto);
  });
  lineas.push('', 'El orden importa: los ids son corridos y globales, así que la segunda plantilla');
  lineas.push('arranca donde termina la primera. Un `lamina_id` asignado NO se reusa nunca.');
  lineas.push('', 'Se hace BACKUP de cada plantilla antes de tocarla, y si el backup falla no se escribe nada.');
  lineas.push('El ancla se ANEXA a las notas del orador: no se pisa nada de lo que haya.');
  lineas.push('', '¿Confirmás?');

  var r = ui.alert('Sellar plantillas — ' + total + ' lámina(s)', lineas.join('\n'), ui.ButtonSet.YES_NO);
  if (r !== ui.Button.YES) {
    ui.alert('Sellar plantillas', 'Cancelado. No se tocó ninguna plantilla.', ui.ButtonSet.OK);
    return;
  }

  var salida = ['Sellado terminado.', ''];
  previos.forEach(function (p) {
    var res = sellarPlantilla(p.informe_id, {});
    if (!res.ok) { salida.push('⚠ ' + p.informe_id + ' — ' + res.motivo); return; }
    salida.push('· ' + res.plantilla + ': ' + res.filas_escritas + ' fila(s), ids ' + res.rango_ids +
      (res.filas_a_reparar ? ' · ' + res.filas_a_reparar + ' fila(s) reparada(s)' : ''));
    if (res.backup) salida.push('  backup: ' + res.backup.nombre);
  });

  ui.alert('Sellar plantillas', salida.join('\n'), ui.ButtonSet.OK);
}

/**
 * Escribe **una sola columna** de `LAMINAS`, en las filas que ya existen, buscándolas por
 * `lamina_id`. `mapa` es `{ 'L-031': valor, … }`.
 *
 * **Es el único camino para escribir celdas de `LAMINAS` que no sean filas nuevas.** Si aparece
 * un segundo, es un bug de arquitectura aunque escriba bien: `sellarPlantilla` agrega filas
 * enteras por posición y `borrarFilasDeLaminas` borra; entre esos dos extremos no había nada, y
 * ésa es la razón por la que la Parte D del `2026-08-09_1` quedó frenada.
 *
 * **Cada cláusula del contrato está por un modo de falla conocido:**
 *
 * - **Resuelve la columna por nombre de encabezado, nunca por índice.** La hoja va a ganar
 *   `titulo` con el `_16` y esta función no puede enterarse. Es lo contrario de los dos arrays
 *   posicionales de `sellarPlantilla`, que sí van a tener que cambiar cuando eso pase.
 * - **Una columna por llamada.** Escribir varias de una es lo que hace que un error de alineación
 *   pase inadvertido: con una sola, el valor o cae donde va o no cae.
 * - **No crea filas, no borra filas, no toca ninguna otra columna.** Un `lamina_id` que no está
 *   en la hoja **se reporta y se saltea** — es el caso «fila sin ancla» que `verificarLaminas()`
 *   ya sabe nombrar, y el peor de los cinco; acá no se repara.
 * - **Si el valor es el que ya está, no escribe.** El conteo de `sin_cambio` es lo que permite
 *   correr dos veces y ver cero la segunda.
 * - **Devuelve `anterior` y `nuevo` por celda.** Es el respaldo real de esta función: deshacer
 *   tres celdas con eso a mano es trivial. La red más grande es el TSV de `docs/_snapshots/`
 *   —`tools/snapshot.js`, que desde el 10/08 incluye `LAMINAS`—, porque **no existe ninguna
 *   función que copie el spreadsheet de control**: `backupPlantilla_` copia Slides.
 *
 * `opciones.dryRun === true` calcula todo y no escribe, misma convención que `sellarPlantilla`.
 */
function escribirColumnaLaminas_(mapa, columna, opciones) {
  opciones = opciones || {};
  var dryRun = opciones.dryRun === true;

  if (!mapa || typeof mapa !== 'object') return { ok: false, motivo: 'Falta el mapa { lamina_id: valor }' };
  if (!columna) return { ok: false, motivo: 'Falta el nombre de la columna' };

  var reg = leerLaminas_();
  if (!reg.ok) return reg;

  var col = reg.headers.indexOf(columna);
  if (col === -1) {
    return {
      ok: false,
      motivo: 'La columna "' + columna + '" no existe en LAMINAS — hay ' + reg.headers.length + ': ' +
        reg.headers.join(', ')
    };
  }

  var porId = {};
  reg.filas.forEach(function (f) { porId[String(f.lamina_id).trim()] = f; });

  var escritas = [];
  var sinCambio = [];
  var noEncontradas = [];

  Object.keys(mapa).forEach(function (id) {
    var fila = porId[String(id).trim()];
    if (!fila) { noEncontradas.push(id); return; }

    var anterior = fila[columna];
    var nuevo = mapa[id];
    // Se comparan como texto: la celda puede venir tipada y el valor a escribir es un string.
    if (String(anterior === null || anterior === undefined ? '' : anterior) === String(nuevo)) {
      sinCambio.push(id);
      return;
    }

    if (!dryRun) reg.hoja.getRange(fila._fila, col + 1).setValue(nuevo);
    escritas.push({ lamina_id: id, fila: fila._fila, anterior: anterior, nuevo: nuevo });
  });

  if (escritas.length && !dryRun) SpreadsheetApp.flush();

  return {
    ok: true,
    columna: columna,
    dry_run: dryRun,
    escritas: escritas.length,
    sin_cambio: sinCambio.length,
    no_encontradas: noEncontradas.length,
    detalle_escritas: escritas,
    detalle_no_encontradas: noEncontradas
  };
}

/**
 * Borra filas de `LAMINAS` por `lamina_id`. **Existe para deshacer un error de esta sesión y no
 * debería tener más usos.**
 *
 * Origen, 09/08: la primera corrida de `C.1` selló una copia de prueba y, por un descuido de
 * `sellarPlantilla`, escribió 22 filas en la hoja para láminas de un archivo desechable. La
 * función que lo causó ya está corregida —una copia no deja fila—; ésta limpia lo que quedó.
 *
 * **Pide la lista explícita de ids.** No hay "borrar todo" ni borrado por criterio: `LAMINAS` es
 * hoja de registro y `D-23` punto 11 dice que una fila no se borra, se esconde. Este borrado es
 * la excepción de un error, no un mecanismo.
 */
function borrarFilasDeLaminas(ids) {
  if (!Array.isArray(ids) || !ids.length) {
    return { ok: false, motivo: 'Pasar la lista explícita de lamina_id a borrar' };
  }
  var reg = leerLaminas_();
  if (!reg.ok) return reg;

  var aBorrar = reg.filas.filter(function (f) { return ids.indexOf(String(f.lamina_id).trim()) !== -1; });
  var noEncontrados = ids.filter(function (id) {
    return !reg.filas.some(function (f) { return String(f.lamina_id).trim() === id; });
  });

  // De abajo hacia arriba: borrar de arriba corre los índices de las de abajo.
  aBorrar.sort(function (a, b) { return b._fila - a._fila; })
    .forEach(function (f) { reg.hoja.deleteRow(f._fila); });
  SpreadsheetApp.flush();

  return {
    ok: true,
    borradas: aBorrar.length,
    ids_borrados: aBorrar.map(function (f) { return String(f.lamina_id).trim(); }),
    no_encontrados: noEncontrados,
    filas_restantes: leerLaminas_().filas.length
  };
}

/**
 * `C.1` + `C.2` — corre el sellado sobre una **copia desechable**, nunca sobre la plantilla, y
 * verifica el control que importa: **anexar no pisa**.
 *
 * **El caso de prueba original ya no existe.** El `_11` `0.5` designaba las notas del equipo de
 * `SECCO` 8 y 25; la 8 se borró el 08/08 y la 25 el 09/08 (`C-01` addendum 3 y 4). El reemplazo,
 * acordado el 09/08: **una nota puesta a mano en la copia**, con el control
 * *"mi texto sigue entero **Y** el ancla aparece como línea nueva"*.
 *
 * **Por qué este control sí es un control:** si el sellado no ocurre, el ancla no aparece y da
 * rojo. Un control que sólo verificara "la nota original sobrevive" pasaría con y sin la lógica,
 * que es lo que lo volvería inútil.
 *
 * No toca la plantilla viva en ningún momento: copia, escribe la nota testigo sobre la copia,
 * sella la copia, verifica y **devuelve el id de la copia** para que se pueda mirar a mano.
 */
function probarSelladoSobreCopia(informeId, opciones) {
  opciones = opciones || {};
  // `11.2` — para probar la **numeración corrida** hace falta que las copias registren en
  // `LAMINAS`: el contador es `max(lamina_id) + 1` sobre la hoja, así que sin filas `jm` volvería
  // a arrancar en `L-001` y la prueba no probaría nada. Se corre con `registrar: true`, se
  // verifica, y **se limpia con `borrarFilasDeLaminas` antes de la corrida viva**.
  var registrar = opciones.registrar === true;
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    return { ok: false, motivo: 'Informe "' + informeId + '" sin plantilla_id en INFORMES' };
  }

  var carpeta = asegurarCarpetaBackups_();
  if (!carpeta.ok) return { ok: false, motivo: 'No se pudo preparar la carpeta de copias: ' + carpeta.motivo };

  var sello = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  var copiaArchivo;
  try {
    copiaArchivo = DriveApp.getFileById(informe.plantilla_id)
      .makeCopy('[PRUEBA sellado] ' + informeId + ' ' + sello, carpeta.carpeta);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo copiar la plantilla: ' + e.message };
  }

  var copiaId = copiaArchivo.getId();
  var TESTIGO = 'NOTA TESTIGO ' + sello + ' — si esto desaparece, el sellado pisó en vez de anexar.';

  // La nota testigo va en la PRIMERA lámina de la copia. Se elige la 1 y no una al azar para
  // que el control sea reproducible y para que quien mire la copia la encuentre enseguida.
  var copia = SlidesApp.openById(copiaId);
  var slideTestigo = copia.getSlides()[0];
  var shapeTestigo = slideTestigo.getNotesPage().getSpeakerNotesShape();
  if (!shapeTestigo) {
    return { ok: false, motivo: 'La lámina 1 de la copia no tiene shape de notas', copia_id: copiaId };
  }
  shapeTestigo.getText().setText(TESTIGO);
  SlidesApp.openById(copiaId).saveAndClose();

  var resultado = sellarPlantilla(informeId, { plantillaId: copiaId, registrar: registrar });
  if (!resultado.ok) return { ok: false, motivo: 'El sellado falló: ' + resultado.motivo, copia_id: copiaId };

  // Verificación, y las tres condiciones tienen que darse a la vez.
  var despues = notasDeLamina_(SlidesApp.openById(copiaId).getSlides()[0]);
  var controles = {
    testigo_intacto: despues.indexOf(TESTIGO) !== -1,
    ancla_presente: despues.indexOf(ANCLA_LAMINA_PREFIJO_) !== -1,
    ancla_en_linea_propia: /\n\s*#lamina:/i.test(despues)
  };
  var verificacion = controles.testigo_intacto && controles.ancla_presente && controles.ancla_en_linea_propia;

  return {
    ok: true,
    informe_id: informeId,
    copia_id: copiaId,
    copia_url: copiaArchivo.getUrl(),
    copia_nombre: copiaArchivo.getName(),
    sellado: resultado,
    controles: controles,
    verificacion: verificacion ? 'VERDE — el testigo sobrevivió y el ancla se anexó en línea propia'
      : 'ROJO — revisar: ' + JSON.stringify(controles),
    notas_lamina_1: despues
  };
}

/**
 * El siguiente `L-NNN` a asignar, leído de la hoja `LAMINAS`.
 *
 * **Es el máximo de `lamina_id` + 1, y no se deriva de las notas de las plantillas** (`D-23`
 * addendum 1, punto 9). La diferencia importa: derivarlo de las notas haría que **retirar una
 * lámina hiciera retroceder el contador** y un id se reasignara. Desde la hoja no puede pasar,
 * porque **una lámina no se borra: se esconde** (punto 11) y su fila queda como histórico.
 *
 * **Un solo contador para las dos plantillas** (`A.4`): `L-NNN` es global, no por informe.
 */
function siguienteIdLamina_(filas) {
  var maximo = 0;
  filas.forEach(function (fila) {
    var m = String(fila.lamina_id || '').match(/^L-(\d+)$/);
    if (m) maximo = Math.max(maximo, Number(m[1]));
  });
  return maximo + 1;
}

function formatearIdLamina_(numero) {
  return 'L-' + ('00' + numero).slice(-3);
}

/** Filas actuales de `LAMINAS`, como objetos por encabezado. */
function leerLaminas_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LAMINAS');
  if (!hoja) return { ok: false, motivo: 'No existe la hoja LAMINAS — correr `instalar` primero' };
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var filas = [];
  for (var f = 1; f < datos.length; f++) {
    var o = { _fila: f + 1 };
    headers.forEach(function (h, i) { o[h] = datos[f][i]; });
    if (String(o.lamina_id || '').trim()) filas.push(o);
  }
  return { ok: true, hoja: hoja, headers: headers, filas: filas };
}

/**
 * `B.1`–`B.5` — sella una plantilla: por cada lámina **sin ancla**, toma el siguiente id,
 * escribe la fila en `LAMINAS` y **anexa** `#lamina: L-NNN` a las notas del orador.
 *
 * **La plantilla es autoritativa** (`11.1` §4). La idempotencia se evalúa contra el ancla de la
 * lámina, no contra la hoja: si el ancla está, no se vuelve a anexar. Si la hoja no tiene la
 * fila pero la plantilla sí el ancla, **la fila se repara** y se reporta con conteo — una
 * reparación silenciosa convierte a la hoja en algo que siempre coincide y nunca informa nada.
 *
 * **Backup primero, siempre, y aborta si falla** (`B.1`). Es condición de `C-01`, no de acá.
 *
 * `opciones.dryRun` corre todo sin escribir: es lo que usa `C.1` para reportar antes de tocar
 * una plantilla viva.
 */
function sellarPlantilla(informeId, opciones) {
  opciones = opciones || {};
  var dryRun = opciones.dryRun === true;
  var plantillaIdOverride = opciones.plantillaId || null;

  // **Una copia no es la plantilla del informe, así que no deja fila.** Lo encontró la primera
  // corrida de `C.1` (09/08): sellar una copia de prueba escribió 22 filas en `LAMINAS` con
  // `informe_id = jm`, apuntando a láminas de un archivo desechable. Esas filas habrían quedado
  // como histórico de algo que no existe, y peor: **habrían movido el contador**, así que la
  // plantilla viva habría empezado en `L-023`.
  //
  // Con `plantillaId` override el sellado escribe el ancla en la copia —que es lo que la prueba
  // verifica— y **no toca la hoja**. Se puede forzar con `registrar: true`, pero hay que pedirlo.
  var registrar = plantillaIdOverride ? opciones.registrar === true : true;

  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    return { ok: false, motivo: 'Informe "' + informeId + '" sin plantilla_id en INFORMES' };
  }
  var plantillaId = plantillaIdOverride || informe.plantilla_id;

  var reg = leerLaminas_();
  if (!reg.ok) return reg;

  var presentacion;
  try {
    presentacion = SlidesApp.openById(plantillaId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la presentación "' + plantillaId + '": ' + e.message };
  }

  var slides = presentacion.getSlides();
  var yaConAncla = [];
  var aSellar = [];

  slides.forEach(function (slide, i) {
    var ancla = anclaDeLamina_(slide);
    if (ancla) yaConAncla.push({ orden: i + 1, ancla: ancla });
    else aSellar.push({ orden: i + 1, slide: slide });
  });

  // Reparación de la hoja: anclas que están en la plantilla y no tienen fila. Gana la plantilla.
  var porId = {};
  reg.filas.forEach(function (f) { porId[String(f.lamina_id).trim()] = f; });
  var aReparar = yaConAncla.filter(function (x) { return x.ancla !== '(sin id)' && !porId[x.ancla]; });

  var resumen = {
    ok: true,
    informe_id: informeId,
    plantilla_id: plantillaId,
    plantilla: presentacion.getName(),
    dry_run: dryRun,
    laminas: slides.length,
    ya_tenian_ancla: yaConAncla.length,
    a_sellar: aSellar.length,
    filas_a_reparar: aReparar.length
  };

  if (!aSellar.length && !aReparar.length) {
    resumen.mensaje = 'Nada que hacer: las ' + slides.length + ' láminas ya tienen ancla y su fila.';
    return resumen;
  }

  if (dryRun) {
    resumen.mensaje = 'DRY RUN — no se escribió nada.';
    resumen.ids_que_asignaria = aSellar.map(function (x, k) {
      return { orden: x.orden, lamina_id: formatearIdLamina_(siguienteIdLamina_(reg.filas) + k) };
    });
    return resumen;
  }

  var carpeta = asegurarCarpetaBackups_();
  if (!carpeta.ok) return { ok: false, motivo: 'Backup abortado (no se tocó la plantilla): ' + carpeta.motivo };
  var backup = backupPlantilla_(plantillaId, presentacion.getName(), carpeta.carpeta);
  if (!backup.ok) return { ok: false, motivo: 'Backup abortado (no se tocó la plantilla): ' + backup.motivo };
  resumen.backup = backup;

  var siguiente = siguienteIdLamina_(reg.filas);
  var nuevas = [];
  var asignados = [];

  aSellar.forEach(function (x) {
    var id = formatearIdLamina_(siguiente++);
    var shape = x.slide.getNotesPage().getSpeakerNotesShape();
    if (!shape) { return; }

    // **Anexar, nunca `setText` sobre lo que hay** (`C-01` addendum 1). `appendText` conserva
    // el texto previo por construcción; el salto va delante sólo si ya había algo escrito.
    var previo = String(shape.getText().asString() || '');
    var linea = (previo.trim() ? '\n' : '') + ANCLA_LAMINA_PREFIJO_ + ' ' + id;
    shape.getText().appendText(linea);

    nuevas.push([id, informeId, '', x.orden, esLaminaEscondida_(x.slide) ? 'sí' : '', 'sellador',
      '', '', '', '', '', '', '']);
    asignados.push({ orden: x.orden, lamina_id: id });
  });

  aReparar.forEach(function (x) {
    nuevas.push([x.ancla, informeId, '', x.orden, '', 'reparada', '', '', '', '', '', '',
      'fila repuesta: el ancla estaba en la plantilla y la fila no']);
  });

  if (nuevas.length && registrar) {
    reg.hoja.getRange(reg.hoja.getLastRow() + 1, 1, nuevas.length, nuevas[0].length).setValues(nuevas);
    SpreadsheetApp.flush();
  }

  resumen.registrado_en_laminas = registrar;
  if (!registrar) {
    resumen.nota_registro = 'Sellado sobre una copia: el ancla se escribió, la hoja LAMINAS NO se tocó.';
  }
  resumen.filas_escritas = registrar ? nuevas.length : 0;
  resumen.asignados = asignados;
  resumen.rango_ids = asignados.length
    ? asignados[0].lamina_id + ' … ' + asignados[asignados.length - 1].lamina_id
    : '(ninguno)';
  return resumen;
}

/**
 * Vacía las notas del orador de UNA lámina nombrada. **Es la única función del repo que
 * escribe sobre las notas de una plantilla viva, y la única que llama `setText`.**
 *
 * **Autorizada por `C-01` addendum 4 (09/08/2026) y por nada más.** Los addenda 1 y 2 autorizan
 * **anexar** y prohíben `setText` con todas las letras; borrar necesitó su propia autorización,
 * escrita antes de ejercerse.
 *
 * **Las tres guardas son precondiciones de esa autorización, no precauciones de esta función:**
 *
 * 1. `textoEsperado` es obligatorio y tiene que coincidir **carácter por carácter** con lo que
 *    hay en la plantilla. Comparar largos no alcanza: dos cadenas distintas miden lo mismo. Si
 *    no coincide, **no se toca nada** — significa que la copia del repo no es del texto que se
 *    está por borrar.
 * 2. **Backup primero, y aborto si falla.** Es de `C-01` y no se negocia.
 * 3. Una lámina, por número de orden. **No hay barrido y no lo va a haber**: el addendum 4 lo
 *    prohíbe explícitamente.
 *
 * Devuelve qué borró y dónde quedó el backup, para que el reporte de la corrida pueda decirlo.
 */
function borrarNotasDeLamina(informeId, orden, textoEsperado) {
  if (typeof textoEsperado !== 'string' || !textoEsperado.length) {
    return { ok: false, motivo: 'Falta `textoEsperado`: sin el texto a confirmar no se borra nada (C-01 addendum 4, precondición 2)' };
  }

  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    return { ok: false, motivo: 'Informe "' + informeId + '" sin plantilla_id en INFORMES' };
  }

  var presentacion = SlidesApp.openById(informe.plantilla_id);
  var slides = presentacion.getSlides();
  if (orden < 1 || orden > slides.length) {
    return { ok: false, motivo: 'La lámina ' + orden + ' no existe (la plantilla tiene ' + slides.length + ')' };
  }

  var slide = slides[orden - 1];
  var actual = notasDeLamina_(slide);
  if (actual !== textoEsperado) {
    return {
      ok: false,
      motivo: 'El texto de la lámina ' + orden + ' NO coincide con el esperado — no se tocó nada. ' +
        'Esperado ' + textoEsperado.length + ' char(s), encontrado ' + actual.length + '.',
      encontrado: actual
    };
  }

  var carpeta = asegurarCarpetaBackups_();
  if (!carpeta.ok) return { ok: false, motivo: 'Backup abortado (no se tocó la plantilla): ' + carpeta.motivo };

  var backup = backupPlantilla_(informe.plantilla_id, presentacion.getName(), carpeta.carpeta);
  if (!backup.ok) return { ok: false, motivo: 'Backup abortado (no se tocó la plantilla): ' + backup.motivo };

  var shape = slide.getNotesPage().getSpeakerNotesShape();
  if (!shape) return { ok: false, motivo: 'La lámina ' + orden + ' no tiene shape de notas', backup: backup };
  shape.getText().setText('');

  return {
    ok: true,
    informe_id: informeId,
    orden: orden,
    chars_borrados: actual.length,
    texto_borrado: actual,
    backup: backup,
    chars_ahora: notasDeLamina_(slide).length
  };
}

/**
 * `B.0` — la medición del gate. **Sólo lectura, no escribe nada.**
 *
 * Recorre las plantillas de todos los informes activos con `plantilla_id` y cuenta, por
 * plantilla: cuántas láminas hay, cuántas tienen ancla, cuáles, y cuántas están escondidas.
 *
 * `escondida` se **refleja**, nunca decide (`C-01` addendum 1: leer está permitido, esconder
 * o mostrar no). Se reusa `esLaminaEscondida_` de `Armonizar.gs`, que es la única llamada a
 * `isSkipped()` del repo.
 */
function contarAnclasDeLaminas() {
  var informes = leerInformes();
  var salida = { ok: true, total_laminas: 0, total_con_ancla: 0, plantillas: [] };

  Object.keys(informes).forEach(function (informeId) {
    var informe = informes[informeId];
    if (!informe.activo || !informe.plantilla_id) return;

    var presentacion;
    try {
      presentacion = SlidesApp.openById(informe.plantilla_id);
    } catch (e) {
      salida.plantillas.push({
        informe_id: informeId, ok: false,
        motivo: 'No se pudo abrir la presentación "' + informe.plantilla_id + '": ' + e.message
      });
      salida.ok = false;
      return;
    }

    var slides = presentacion.getSlides();
    var conAncla = [];
    var conNotas = [];
    var escondidas = 0;

    slides.forEach(function (slide, i) {
      if (esLaminaEscondida_(slide)) escondidas++;
      var ancla = anclaDeLamina_(slide);
      if (ancla) conAncla.push({ orden: i + 1, ancla: ancla });

      // Las láminas que YA tienen texto en las notas, con su largo. Son las que el sellado
      // tiene que anexar sin pisar, así que hay que saber cuáles son **antes** de escribir —
      // es la otra mitad del gate. `C-01` addendum 1 se fundó en dos de éstas (`secco` 8 y
      // 25); el addendum 3 registra que se borraron. Esto lo verifica contra la plantilla en
      // vez de arrastrar la cita.
      var texto = notasDeLamina_(slide);
      if (texto.trim()) conNotas.push({ orden: i + 1, chars: texto.trim().length });
    });

    salida.total_laminas += slides.length;
    salida.total_con_ancla += conAncla.length;
    salida.plantillas.push({
      informe_id: informeId,
      ok: true,
      nombre: presentacion.getName(),
      plantilla_id: informe.plantilla_id,
      laminas: slides.length,
      escondidas: escondidas,
      con_ancla: conAncla.length,
      anclas: conAncla,
      con_notas: conNotas.length,
      notas: conNotas
    });
  });

  // El veredicto del gate, escrito acá y no en quien lea: si hay una sola ancla, alguien selló
  // fuera del motor y la Parte B **no arranca** hasta saber quién y con qué formato.
  salida.veredicto = salida.total_con_ancla === 0
    ? 'GATE OK — cero anclas: la evidencia documental queda confirmada por medición y C.4 tiene su línea de base.'
    : 'GATE CERRADO — ' + salida.total_con_ancla + ' lámina(s) ya tienen ancla. Alguien selló fuera del motor: ' +
      'frenar la Parte B hasta saber quién y con qué formato.';

  return salida;
}
