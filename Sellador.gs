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
 * Cruza dos columnas: cuántas filas tienen `columnaA` vacía **y** contienen `aguja` en
 * `columnaB`. **Sólo lectura.**
 *
 * Existe para poner número a un pendiente en vez de dejarlo en prosa: *"las filas sin `estado`
 * quedan afuera"* es una decisión, y **cuántas de ésas son JM** es lo que dice si la decisión
 * cuesta algo hoy. Mismo criterio que el desvío de las campañas mixtas: **cero hoy no es cero por
 * definición**, y el número hay que volver a medirlo.
 */
function cruzarVacioContra(baseId, solapa, columnaVacia, columnaBusqueda, aguja) {
  var abierto = abrirHoja(baseId, solapa);
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };

  var datos = abierto.hoja.getDataRange().getValues();
  var headers = datos[0].map(function (h) { return String(h).trim(); });
  var iV = headers.indexOf(columnaVacia);
  var iB = headers.indexOf(columnaBusqueda);
  if (iV === -1 || iB === -1) return { ok: false, motivo: 'falta alguna columna', columnas: headers };

  var vacias = 0, vaciasConAguja = 0;
  var ejemplos = [];
  for (var f = 1; f < datos.length; f++) {
    if (normalizarValorDeclarado_(datos[f][iV]) !== '') continue;
    vacias++;
    var nombre = normalizarValorDeclarado_(datos[f][iB]);
    if (nombre.indexOf(aguja) !== -1) {
      vaciasConAguja++;
      if (ejemplos.length < 8) ejemplos.push(nombre);
    }
  }
  return {
    ok: true,
    columna_vacia: columnaVacia, columna_busqueda: columnaBusqueda, aguja: aguja,
    filas_con_vacia: vacias,
    de_esas_con_aguja: vaciasConAguja,
    ejemplos: ejemplos
  };
}

/**
 * Valores distintos de una columna, **crudos**, con su conteo. **Sólo lectura.**
 *
 * **Crudo es el punto**: devuelve el valor tal cual está en la celda, sin `trim()` y sin plegar
 * case, y al lado su forma normalizada. Sirve para el contrapunto de una regla **por resta** —
 * `imp_prog` es todo lo que no es Meta ni Google ads—, donde **un `Meta ` con espacio o un
 * `Google Ads` con mayúscula no falla: cae del otro lado y suma en silencio.**
 *
 * `R-23` ya midió que en `nombre_campaña` no hay variantes de case, pero eso se midió en `F`, no
 * en `B`. Cada columna se mide sola.
 */
function valoresDistintosDeColumna(baseId, solapa, columna) {
  var abierto = abrirHoja(baseId, solapa);
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };

  var datos = abierto.hoja.getDataRange().getValues();
  var headers = datos[0].map(function (h) { return String(h).trim(); });
  var col = headers.indexOf(columna);
  if (col === -1) return { ok: false, motivo: 'no existe "' + columna + '"', columnas: headers };

  var crudos = {};
  for (var f = 1; f < datos.length; f++) {
    var v = datos[f][col];
    var clave = (v === null || v === undefined) ? '(vacío)' : String(v);
    crudos[clave] = (crudos[clave] || 0) + 1;
  }

  // Dos valores que sólo difieren en espacios o case son el hallazgo que esta función busca.
  var porCanonico = {};
  Object.keys(crudos).forEach(function (v) {
    var canon = v.replace(/\s+/g, ' ').trim().toLowerCase();
    (porCanonico[canon] = porCanonico[canon] || []).push(v);
  });
  var colisiones = Object.keys(porCanonico).filter(function (k) { return porCanonico[k].length > 1; })
    .map(function (k) { return { canonico: k, variantes: porCanonico[k] }; });

  return {
    ok: true,
    base_id: baseId, solapa: solapa, columna: columna,
    filas: datos.length - 1,
    distintos: Object.keys(crudos).length,
    valores: crudos,
    variantes_que_colisionan: colisiones,
    limpio: colisiones.length === 0
  };
}

/**
 * `_20` `A.3` + `A.4` — la predicción antes de pasar `looker` de punto a solape. **Sólo lectura.**
 *
 * Cuenta las filas que entran con cada criterio y las desglosa por el corte de `R-23`, porque
 * **`imp_total` y `gcba_imp_total` se calculan sobre exactamente ese universo**: cambiar el
 * recorte les mueve el número. La predicción se escribe antes; la medición va al lado después.
 *
 * `punto`  = `fecha_inicio` dentro de la ventana (lo que hace hoy, sin `fecha_fin_periodo`).
 * `solape` = `inicio <= hasta` **y** `fin >= desde` — el criterio de `R-16`, inclusive.
 */
function predecirSolapeLooker(baseId, solapa) {
  var abierto = abrirHoja(baseId, solapa);
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };
  var ventana = resolverVentana({});
  if (!ventana.ok) return { ok: false, motivo: ventana.motivo };

  var cIni = buscarMapeo(baseId, solapa, 'fecha_periodo');
  var cFin = buscarMapeo(baseId, solapa, 'fecha_fin');
  var cNom = buscarMapeo(baseId, solapa, 'campana');
  if (!cIni.ok || !cFin.ok || !cNom.ok) {
    return { ok: false, motivo: 'falta mapeo: ' + [cIni, cFin, cNom].filter(function (c) { return !c.ok; })
      .map(function (c) { return c.motivo; }).join(' · ') };
  }

  var datos = abierto.hoja.getDataRange().getValues();
  var iIni = columnaLetraAIndice_(cIni.columna);
  var iFin = columnaLetraAIndice_(cFin.columna);
  var iNom = columnaLetraAIndice_(cNom.columna);
  var iVal = datos[0].map(function (h) { return String(h).trim(); }).indexOf('digital_impresiones');

  var r = {
    punto: { total: 0, jm: 0, gcba: 0, imp_jm: 0, imp_gcba: 0 },
    solape: { total: 0, jm: 0, gcba: 0, imp_jm: 0, imp_gcba: 0 },
    sin_fecha_fin: 0, sin_fecha_inicio: 0, filas: datos.length - 1
  };

  for (var f = 1; f < datos.length; f++) {
    var ini = parsearFechaCelda_(datos[f][iIni]);
    var fin = parsearFechaCelda_(datos[f][iFin]);
    if (!ini) { r.sin_fecha_inicio++; continue; }
    if (!fin) r.sin_fecha_fin++;

    var esJM = normalizarValorDeclarado_(datos[f][iNom]).indexOf('JM') !== -1;
    var val = iVal === -1 ? 0 : (Number(datos[f][iVal]) || 0);

    if (ini >= ventana.desde && ini <= ventana.hasta) {
      r.punto.total++; r.punto[esJM ? 'jm' : 'gcba']++;
      r.punto[esJM ? 'imp_jm' : 'imp_gcba'] += val;
    }
    // `R-16`, inclusive. Una campaña sin fin no es un error —hay campañas abiertas—: se la trata
    // como todavía activa, que es lo que su ausencia de fin significa.
    var finEfectivo = fin || ventana.hasta;
    if (ini <= ventana.hasta && finEfectivo >= ventana.desde) {
      r.solape.total++; r.solape[esJM ? 'jm' : 'gcba']++;
      r.solape[esJM ? 'imp_jm' : 'imp_gcba'] += val;
    }
  }

  r.ok = true;
  r.ventana = formatearFecha_(ventana.desde) + ' → ' + formatearFecha_(ventana.hasta);
  r.control_punto = r.punto.jm + ' + ' + r.punto.gcba + ' = ' + r.punto.total;
  r.control_solape = r.solape.jm + ' + ' + r.solape.gcba + ' = ' + r.solape.total;
  return r;
}

/**
 * `_20` `A.6` — cuánto vale, en un número, que las campañas mixtas caigan enteras en JM.
 *
 * `R-23` cierra **formalmente** —`JM + GCBA = total`, sin resto— **pero no semánticamente**: las
 * campañas que nombran a JM y a GCBA a la vez van enteras a JM por la regla de negación, así que
 * **`gcba_imp_total` queda subestimado por una cantidad conocida**. Una decisión editorial
 * documentada en prosa no alcanza cuando el efecto es un número.
 *
 * Devuelve el desvío **acotado a la ventana del informe**, que es donde se publica — no al
 * universo de la solapa, que sería un número más grande y menos útil.
 */
function medirDesvioCampanasMixtas(baseId, solapa, columnaNombre, columnaValor) {
  var abierto = abrirHoja(baseId, solapa);
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };

  var ventana = resolverVentana({});
  if (!ventana.ok) return { ok: false, motivo: ventana.motivo };

  var campoFecha = buscarMapeo(baseId, solapa, 'fecha_periodo');
  if (!campoFecha.ok) return { ok: false, motivo: campoFecha.motivo };

  var datos = abierto.hoja.getDataRange().getValues();
  var headers = datos[0].map(function (h) { return String(h).trim(); });
  var iNom = headers.indexOf(columnaNombre);
  var iVal = headers.indexOf(columnaValor);
  var iFec = columnaLetraAIndice_(campoFecha.columna);
  if (iNom === -1 || iVal === -1) {
    return { ok: false, motivo: 'falta alguna columna', columnas: headers };
  }

  var mixtas = [];
  var totalUniverso = 0;
  for (var f = 1; f < datos.length; f++) {
    var nombre = normalizarValorDeclarado_(datos[f][iNom]);
    if (!nombre) continue;
    // Mixta = matchea `~=JM` (así que hoy cuenta como JM) y además nombra a GCBA.
    if (nombre.indexOf('JM') === -1 || !/GCBA/.test(nombre)) continue;

    var valor = Number(datos[f][iVal]) || 0;
    totalUniverso += valor;
    var fecha = parsearFechaCelda_(datos[f][iFec]);
    var enVentana = !!(fecha && fecha >= ventana.desde && fecha <= ventana.hasta);
    mixtas.push({ nombre: nombre, valor: valor, fecha: fecha ? formatearFecha_(fecha) : '(sin fecha)', en_ventana: enVentana });
  }

  var enVentana = mixtas.filter(function (m) { return m.en_ventana; });
  return {
    ok: true,
    ventana: formatearFecha_(ventana.desde) + ' → ' + formatearFecha_(ventana.hasta),
    columna_valor: columnaValor,
    mixtas_total: mixtas.length,
    mixtas_en_ventana: enVentana.length,
    desvio_en_ventana: enVentana.reduce(function (a, m) { return a + m.valor; }, 0),
    desvio_universo: totalUniverso,
    detalle: mixtas
  };
}

/**
 * `_18` `0.2` — mide **los bordes** de la regla «el corte JM está en el nombre de la campaña».
 * **Sólo lectura.**
 *
 * La regla la fijó el usuario el 10/08: si el nombre contiene `JM`, la fila es JM; **todo lo
 * demás es GCBA, por negación**. Es expresable hoy con `campana~=JM` y su negado — el operador
 * existe desde el 08/08 y **no hace falta join**.
 *
 * Lo que se mide acá es dónde una regla así **se rompe en silencio**: el nombre viene en
 * segmentos separados por ` | `, así que `JM` puede aparecer **dentro de otra palabra** y sumar
 * una fila que no corresponde, o aparecer en minúscula y restarla — `normalizarValorDeclarado_`
 * **no pliega case** (`R-10`), y eso ya está medido: 594 de 594 el 09/08 sobre otra solapa.
 *
 * Lee por `abrirHoja`, no por `leerFuente`: éste exige ventana con `Date` y acá interesa el
 * universo entero, no el recorte.
 */
function medirBordesDeCorteJM(baseId, solapa, columna) {
  var abierto = abrirHoja(baseId, solapa);
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };

  var datos = abierto.hoja.getDataRange().getValues();
  var headers = datos[0].map(function (h) { return String(h).trim(); });
  var col = headers.indexOf(columna);
  if (col === -1) return { ok: false, motivo: 'no existe la columna "' + columna + '"', columnas: headers };

  var conJM = 0, sinJM = 0, vacias = 0;
  var falsosPositivos = [];   // `JM` dentro de otra palabra, no como segmento propio
  var variantes = {};         // `jm` en otro case — `~=` no los matchea (`R-10` no pliega)
  var ambiguos = {};          // nombran a JM y a GCBA a la vez
  var segmentosJM = 0;        // `JM` como segmento propio

  for (var f = 1; f < datos.length; f++) {
    var v = normalizarValorDeclarado_(datos[f][col]);
    if (!v) { vacias++; continue; }

    // La semántica de `~=`: `indexOf` sobre el valor normalizado, sensible a mayúsculas.
    var matchea = v.indexOf('JM') !== -1;
    if (matchea) conJM++; else sinJM++;

    var segs = v.split('|').map(function (s) { return s.trim(); });
    if (segs.indexOf('JM') !== -1) segmentosJM++;

    // **El falso positivo real es `JM` DENTRO de una palabra**, no `JM` fuera de un segmento
    // propio. Corregido el 10/08: el primer criterio marcaba `RDV JM | Villa Devoto` como falso
    // positivo, y ésa **es** una campaña de JM — sólo que el nombre no usa ` | ` como separador.
    // El instrumento medía la forma del nombre, no la pertenencia. Es el error que `CLAUDE.md`
    // §4 describe: acertar el hecho y errar la inferencia.
    if (matchea && !/(^|[^A-Za-zÁÉÍÓÚÑáéíóúñ])JM([^A-Za-zÁÉÍÓÚÑáéíóúñ]|$)/.test(v)) {
      falsosPositivos.push(v);
    }

    // Variantes de escritura: `jm` en otro case, que `~=` **no** matchearía (`R-10` no pliega).
    if (!matchea && v.toLowerCase().indexOf('jm') !== -1) {
      variantes[v] = (variantes[v] || 0) + 1;
    }
    // Y los nombres que mencionan a los dos: no son falsos positivos, son ambiguos de verdad.
    if (matchea && /GCBA/.test(v)) ambiguos[v] = (ambiguos[v] || 0) + 1;
  }

  var total = datos.length - 1;
  return {
    ok: true,
    base_id: baseId, solapa: solapa, columna: columna,
    filas_totales: total,
    con_JM: conJM,
    sin_JM: sinJM,
    vacias: vacias,
    suma_cierra: (conJM + sinJM + vacias) === total,
    JM_como_segmento_propio: segmentosJM,
    falsos_positivos: falsosPositivos.slice(0, 20),
    falsos_positivos_total: falsosPositivos.length,
    variantes_de_escritura: variantes,
    ambiguos_JM_y_GCBA: ambiguos,
    // Las vacías no caen en JM ni en GCBA: por la regla de negación terminarían contadas como
    // GCBA sin que nadie lo decida. Se nombran a propósito.
    nota_vacias: vacias + ' fila(s) sin nombre de campaña — por negación irían a GCBA'
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

/* ═══════════ `2026-08-21_11` Parte 0 punto 3 — ¿la copia hereda el ancla? ═══════════
 *
 * ⭐ **Es la medición de la que depende la Parte C punto 7, y hay que MEDIRLA, no razonarla.**
 * El ancla `#lamina: L-0NN` vive en las notas del orador. Si `slide.duplicate()` las copia, la
 * copia queda con el ancla del modelo — y entonces **resolver el modelo por `lamina_id` NO mata
 * la N² por sí solo**: una copia sin pintar seguiría siendo indistinguible de un modelo, que es
 * exactamente el bug que ese cambio venía a matar.
 *
 * ⚠ **Y no alcanza con leer el comentario que ya existe.** `Generador.gs` afirma que
 * *"`duplicate()` copia el estado de la modelo"*, pero lo dice sobre `escondida` — otra
 * propiedad. `CLAUDE.md` §4: un comentario que afirma un contrato es una premisa sin testigo.
 *
 * **Qué toca y qué no.** Copia la plantilla a la carpeta de backups, duplica UNA lámina sobre la
 * copia, lee, y **manda la copia a la papelera**. ⛔ **No toca la plantilla, ni `LAMINAS`, ni
 * ninguna hoja de registro.** Es el mismo camino que `probarSelladoSobreCopia`.
 *
 * Sin `_` y sin parámetros: las dos condiciones para que Apps Script la liste (`CLAUDE.md` §2).
 */
function medirSiLaCopiaHeredaElAncla() {
  var informeId = 'jm';
  var informe = leerInformes()[informeId];
  if (!informe || !informe.plantilla_id) {
    Logger.log('FALLÓ: el informe `' + informeId + '` no tiene plantilla_id.');
    return { ok: false, motivo: 'sin plantilla_id' };
  }

  var copia = null;
  var r = { ok: true, informe_id: informeId };
  try {
    // ⚠ `asegurarCarpetaBackups_` devuelve `{ ok, carpeta }`, no un `Folder`. Pasarlo entero
    // hace que `makeCopy` falle con "los parámetros no coinciden con la firma" — medido.
    var backups = asegurarCarpetaBackups_();
    if (!backups.ok) {
      Logger.log('FALLÓ: ' + backups.motivo);
      return { ok: false, motivo: backups.motivo };
    }

    var t0 = new Date().getTime();
    copia = DriveApp.getFileById(informe.plantilla_id)
      .makeCopy('[temporal] medición de duplicate() — ' + new Date().toISOString(), backups.carpeta);
    r.seg_copia = Math.round((new Date().getTime() - t0) / 1000);

    var pres = SlidesApp.openById(copia.getId());
    var slides = pres.getSlides();

    // Se elige una lámina que TENGA ancla: sin ancla, la medición no distingue nada.
    var modelo = null, iModelo = -1;
    for (var i = 0; i < slides.length; i++) {
      if (anclaDeLamina_(slides[i])) { modelo = slides[i]; iModelo = i; break; }
    }
    if (!modelo) {
      r.ok = false; r.motivo = 'ninguna lámina de la copia tiene ancla — no hay nada que medir';
      Logger.log('⛔ ' + r.motivo);
      return r;
    }

    r.modelo = { posicion: iModelo + 1, ancla: anclaDeLamina_(modelo), notas: notasDeLamina_(modelo) };

    var t1 = new Date().getTime();
    var dup = modelo.duplicate();
    r.seg_duplicate = ((new Date().getTime() - t1) / 1000);

    r.copia = { ancla: anclaDeLamina_(dup), notas: notasDeLamina_(dup) };
    r.hereda_ancla = r.copia.ancla === r.modelo.ancla && r.copia.ancla !== '';
    r.hereda_notas = r.copia.notas === r.modelo.notas;

    /* ⭐ La segunda mitad de la medición: **cuánto cuesta borrarle el ancla a la copia**, que es
     * una de las dos salidas de la Parte C punto 7. Sin este número no se puede decir si esa
     * salida es viable — con 36 asignaciones, un segundo por copia son 36 s del techo. */
    var t2 = new Date().getTime();
    try {
      var shape = dup.getNotesPage().getSpeakerNotesShape();
      if (shape) shape.getText().setText('');
      r.seg_borrar_notas = ((new Date().getTime() - t2) / 1000);
      r.ancla_tras_borrar = anclaDeLamina_(dup);
    } catch (e) {
      r.seg_borrar_notas = null;
      r.error_al_borrar = e.message;
    }

  } catch (e) {
    r.ok = false; r.motivo = e.message; r.stack = String(e.stack || '');
  } finally {
    // ⚠ La copia se tira SIEMPRE, haya salido bien o mal. Un temporal que sobrevive a una
    // medición se confunde con un deck real dos días después.
    if (copia) {
      try { copia.setTrashed(true); r.copia_borrada = true; }
      catch (e) { r.copia_borrada = false; r.copia_id_a_borrar_a_mano = copia.getId(); }
    }
  }

  Logger.log('── ¿la copia hereda el ancla? ──');
  Logger.log('  modelo: lámina ' + (r.modelo ? r.modelo.posicion : '?') + ' · ancla ' + (r.modelo ? r.modelo.ancla : '?'));
  Logger.log('  copia:  ancla ' + (r.copia ? (r.copia.ancla || '(ninguna)') : '?'));
  Logger.log('');
  Logger.log('  HEREDA EL ANCLA: ' + (r.hereda_ancla ? 'SÍ' : 'NO'));
  Logger.log('  hereda las notas enteras: ' + (r.hereda_notas ? 'sí' : 'no'));
  Logger.log('');
  Logger.log('  costo copiar la plantilla: ' + r.seg_copia + ' s');
  Logger.log('  costo de un duplicate(): ' + r.seg_duplicate + ' s');
  Logger.log('  costo de borrarle las notas a una copia: ' + r.seg_borrar_notas + ' s');
  Logger.log('  ancla tras borrar las notas: "' + (r.ancla_tras_borrar || '(ninguna)') + '"');
  Logger.log('  copia temporal borrada: ' + (r.copia_borrada ? 'sí' : '⚠ NO — ' + r.copia_id_a_borrar_a_mano));
  Logger.log('');
  if (r.hereda_ancla) {
    Logger.log('⚠ HEREDA: resolver el modelo por `lamina_id` NO mata la N² por sí solo. La copia');
    Logger.log('  sin pintar es indistinguible del modelo, igual que con los tokens crudos.');
    Logger.log('  Salidas: borrarle el ancla a la copia (' + r.seg_borrar_notas + ' s cada una), o');
    Logger.log('  calcular el conjunto de modelos UNA vez por corrida, antes de duplicar.');
  } else {
    Logger.log('✅ NO hereda: el ancla distingue modelo de copia por sí sola, y eso sí mata la N².');
  }
  return r;
}


/* ══════════════════════════════════════════════════════════════════════════════════════════
 * `2026-08-31_5` Parte B — LAS DOS SLIDES DE `secco` CON IDS DE `jm` TOMAN IDS PROPIOS
 *
 * ⭐⭐ **Esto CONFIRMA `CLAUDE.md` §2, no la deroga.** La regla dice que `lamina_id` es **global y
 * corrido**, que **la clave de unicidad es `lamina_id` sola** y que *«una tercera plantilla toma
 * `L-052` en adelante»*. El caso de hoy es exactamente el que la regla previó: dos slides copiadas
 * de `jm` a `secco` **con su ancla adentro** —`slide.duplicate()` copia las notas del orador—, así
 * que llegaron con `L-052` y `L-053` puestos. **Toman los dos siguientes ids libres.**
 *
 * ⛔ **La alternativa era compartir el id entre los dos informes, y se descartó con motivo**
 * (decisión del usuario, 31/08): **ocho lectores de `LAMINAS` indexan por `lamina_id` solo** —dos
 * de ellos escriben y uno borra— y `siguienteIdLamina_` se quedaría sin invariante. Están
 * censados en `PENDIENTES` con su reproductor, **dormidos y no arreglados**.
 *
 * ══ QUÉ HACE, EN ORDEN, Y POR QUÉ ESE ORDEN ═════════════════════════════════════════════════
 *
 *   1. **Backup de la plantilla de `secco`** — `C-01`: toda migración que escriba sobre una
 *      plantilla crea backup antes. Si el backup falla, **no se toca nada**.
 *   2. **Reescribe el ancla** de las dos slides. ⚠ **Reemplaza, no anexa** — y es la diferencia
 *      con `sellarPlantilla`: allá la slide **no tiene** ancla y `appendText` es correcto; acá ya
 *      tiene una, y anexar dejaría **dos anclas en la misma slide**, que es peor que ninguna.
 *   3. **Alta de las dos filas** en `LAMINAS`, con el `filtro` **copiado de `jm`**.
 *   4. **Baja de las cuatro filas escondidas** (`L-004`…`L-007`).
 *
 * **El ancla va ANTES que las filas** porque el ancla es la identidad: si fallara al revés,
 * quedarían filas apuntando a slides que todavía dicen `L-052`.
 *
 * ⚠ **Lo que esta operación DEJA a propósito, y no es un error:** las cuatro slides escondidas
 * siguen en la plantilla, ancladas, y quedan **sin fila en `LAMINAS`**. `verificarLaminas()` las
 * va a nombrar como *«anclada sin fila»*. **Es información verdadera —cuatro slides que no se
 * usan— y NO hay que «arreglarla» dándoles el alta de vuelta.**
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

/* Los dos ids heredados de `jm` que hay que reasignar en `secco`, y el `filtro` que cada uno lleva
 * **copiado de la fila de `jm` de la que salió la slide**. Verificado contra `LAMINAS` el 31/08:
 * `jm|L-052` filtro vacío · `jm|L-053` filtro `tipo=Uno a uno` · `jm|L-035` = `secco|L-008`, que
 * ya lo tiene igual.
 *
 * ⭐ **El filtro NO va vacío**, y eso es lo que hace que `encuentro` de `secco` quede con la misma
 * estructura que `jm`: para un «Uno a uno» entran la portadilla y la del 1 a 1; para el resto, la
 * portadilla y `L-008`. */
var ANCLAS_HEREDADAS_SECCO_ = [
  { viejo: 'L-052', filtro: '', nota: 'portadilla de encuentro — copiada de jm|L-052, filtro vacío: entra siempre' },
  { viejo: 'L-053', filtro: 'tipo=Uno a uno', nota: 'bloque 1 a 1 — copiada de jm|L-053' }
];

/** Las cuatro filas escondidas que salen. Sus datos completos quedan en el commit del alta. */
var LAMINAS_ESCONDIDAS_A_BAJA_ = ['L-004', 'L-005', 'L-006', 'L-007'];

/**
 * El botón. **Sin `_` y sin parámetros** (`CLAUDE.md` §2). ⚠ **ESCRIBE en la plantilla de `secco`
 * y en `LAMINAS`.** Relee las dos y **falla en rojo si no quedó como se pidió**.
 */
function reasignarAnclasDeSecco() {
  Logger.log('══════════════════════════════════════════════════════════════════════');
  Logger.log('ALTA `encuentro` de `secco` — ' + new Date().toISOString());
  Logger.log('══════════════════════════════════════════════════════════════════════');

  var informe = leerInformes()['secco'];
  if (!informe || !informe.plantilla_id) {
    Logger.log('⛔ ABORTA: `secco` no tiene `plantilla_id`.');
    return { ok: false, motivo: 'sin plantilla_id' };
  }

  var reg = leerLaminas_();
  if (!reg.ok) { Logger.log('⛔ ABORTA: ' + reg.motivo); return { ok: false, motivo: reg.motivo }; }

  /* ⭐ **El id lo calcula `siguienteIdLamina_`, nunca se elige a mano** — es el contador de
   * `CLAUDE.md` §2, `max(lamina_id) + 1` **sobre la hoja entera**. Escribirlo a ojo es cómo se
   * rompe la unicidad global que esta operación viene justamente a preservar. */
  var siguiente = siguienteIdLamina_(reg.filas);
  Logger.log('  siguiente id libre (siguienteIdLamina_): ' + formatearIdLamina_(siguiente));

  var presentacion = SlidesApp.openById(informe.plantilla_id);
  var slides = presentacion.getSlides();

  // ── Localizar las dos slides POR SU ANCLA, nunca por posición ────────────────────────────
  var plan = [];
  ANCLAS_HEREDADAS_SECCO_.forEach(function (x) {
    var encontradas = [];
    slides.forEach(function (slide, i) {
      if (anclaDeLamina_(slide) === x.viejo) encontradas.push({ slide: slide, pos: i + 1 });
    });
    if (encontradas.length !== 1) {
      plan.push({ viejo: x.viejo, error: encontradas.length + ' slide(s) con ese ancla (se esperaba 1)' });
      return;
    }
    plan.push({
      viejo: x.viejo, filtro: x.filtro, nota: x.nota,
      slide: encontradas[0].slide, pos: encontradas[0].pos,
      nuevo: formatearIdLamina_(siguiente++)
    });
  });

  var errores = plan.filter(function (p) { return p.error; });
  if (errores.length) {
    Logger.log('⛔ ABORTA — no se tocó nada:');
    errores.forEach(function (e) { Logger.log('   ' + e.viejo + ': ' + e.error); });
    return { ok: false, motivo: 'anclas no localizadas', errores: errores };
  }

  plan.forEach(function (p) {
    Logger.log('  ' + p.viejo + ' (slide ' + p.pos + ') → ' + p.nuevo +
      '  · filtro `' + (p.filtro || '(vacío)') + '`');
  });

  /* ⛔ **Backup ANTES de escribir una letra** (`C-01`). Si falla, la plantilla queda intacta. */
  var carpeta = asegurarCarpetaBackups_();
  if (!carpeta.ok) {
    Logger.log('⛔ ABORTA (no se tocó la plantilla): backup — ' + carpeta.motivo);
    return { ok: false, motivo: 'backup: ' + carpeta.motivo };
  }
  var backup = backupPlantilla_(informe.plantilla_id, presentacion.getName(), carpeta.carpeta);
  if (!backup.ok) {
    Logger.log('⛔ ABORTA (no se tocó la plantilla): backup — ' + backup.motivo);
    return { ok: false, motivo: 'backup: ' + backup.motivo };
  }
  Logger.log('  ✅ backup: ' + (backup.nombre || backup.id || '(sin nombre)'));

  // ── 1 · el ancla: REEMPLAZAR el id dentro de la línea, no anexar otra ────────────────────
  var reAncla = new RegExp(ANCLA_LAMINA_PREFIJO_ + '\\s*L-\\d+', 'i');
  plan.forEach(function (p) {
    var shape = p.slide.getNotesPage().getSpeakerNotesShape();
    if (!shape) { p.fallo = 'la slide no tiene placeholder de notas'; return; }
    var antes = String(shape.getText().asString() || '');
    var despues = antes.replace(reAncla, ANCLA_LAMINA_PREFIJO_ + ' ' + p.nuevo);
    if (despues === antes) { p.fallo = 'el reemplazo no matcheó nada'; return; }
    shape.getText().setText(despues);
  });

  var fallosAncla = plan.filter(function (p) { return p.fallo; });
  if (fallosAncla.length) {
    Logger.log('⛔ El ancla falló en ' + fallosAncla.length + ' slide(s). NO se toca LAMINAS.');
    fallosAncla.forEach(function (p) { Logger.log('   ' + p.viejo + ': ' + p.fallo); });
    Logger.log('   ⚠ La plantilla puede haber quedado A MEDIAS. El backup es ' + (backup.nombre || backup.id));
    return { ok: false, motivo: 'ancla', backup: backup };
  }

  /* ⭐⭐ **La relectura sale de la plantilla, no del retorno del escritor** (`CLAUDE.md` §4). Un
   * escritor que informa lo que escribió no verifica nada: *«se pidió reemplazar»* y *«quedó
   * reemplazado»* serían la misma afirmación hecha dos veces por el mismo camino. */
  SlidesApp.openById(informe.plantilla_id);   // fuerza el flush del lado de Slides
  var releidas = SlidesApp.openById(informe.plantilla_id).getSlides();
  var malRelectura = [];
  plan.forEach(function (p) {
    var real = anclaDeLamina_(releidas[p.pos - 1]);
    if (real !== p.nuevo) malRelectura.push(p.viejo + ' → esperaba ' + p.nuevo + ', la slide dice `' + real + '`');
  });
  if (malRelectura.length) {
    Logger.log('⛔ RELECTURA FALLIDA — NO se toca LAMINAS:');
    malRelectura.forEach(function (m) { Logger.log('   ' + m); });
    return { ok: false, motivo: 'relectura del ancla', backup: backup };
  }
  Logger.log('  ✅ ancla reescrita y RELEÍDA en las ' + plan.length + ' slides.');

  // ── 2 · alta de las dos filas ───────────────────────────────────────────────────────────
  var headers = reg.headers.map(function (h) { return String(h == null ? '' : h).trim(); });
  var nuevas = plan.map(function (p) {
    var obj = {
      lamina_id: p.nuevo, informe_id: 'secco', seccion_id: 'encuentro',
      orden_plantilla: p.pos, escondida: '', origen: '2026-08-31_5',
      modo: '', itera_sobre: '', filtro: p.filtro, rol: 'motor',
      cobertura: '', falta: '', alcance: '', tokens_equipo: '',
      notas: p.nota + '. Reasignada desde `' + p.viejo + '` (heredado de jm al copiar la slide).'
    };
    return headers.map(function (h) { return (h in obj) ? obj[h] : ''; });
  });
  reg.hoja.getRange(reg.hoja.getLastRow() + 1, 1, nuevas.length, headers.length).setValues(nuevas);
  SpreadsheetApp.flush();
  Logger.log('  ✅ ' + nuevas.length + ' fila(s) agregadas a LAMINAS.');

  // ── 3 · baja de las cuatro escondidas ───────────────────────────────────────────────────
  /* ⚠ **De atrás para adelante**: `deleteRow` corre los índices de todo lo que está debajo. */
  var reg2 = leerLaminas_();
  var aBorrar = reg2.filas.filter(function (f) {
    return String(f.informe_id || '').trim() === 'secco' &&
           LAMINAS_ESCONDIDAS_A_BAJA_.indexOf(String(f.lamina_id || '').trim()) !== -1;
  });
  if (aBorrar.length !== LAMINAS_ESCONDIDAS_A_BAJA_.length) {
    Logger.log('  ⚠ se esperaban ' + LAMINAS_ESCONDIDAS_A_BAJA_.length + ' filas para dar de baja y hay ' +
      aBorrar.length + '. NO se borra ninguna — el alta SÍ quedó hecha.');
    return { ok: false, motivo: 'baja: conteo inesperado', alta_hecha: true, backup: backup };
  }
  aBorrar.sort(function (a, b) { return b._fila - a._fila; })
    .forEach(function (f) { reg2.hoja.deleteRow(f._fila); });
  SpreadsheetApp.flush();
  Logger.log('  ✅ ' + aBorrar.length + ' fila(s) dadas de baja: ' + LAMINAS_ESCONDIDAS_A_BAJA_.join(', '));

  // ── 4 · relectura final de la hoja ──────────────────────────────────────────────────────
  var reg3 = leerLaminas_();
  var deSecco = reg3.filas.filter(function (f) {
    return String(f.informe_id || '').trim() === 'secco' &&
           String(f.seccion_id || '').trim() === 'encuentro';
  });
  Logger.log('');
  Logger.log('  ── `encuentro` de `secco`, RELEÍDO de la hoja ──');
  deSecco.forEach(function (f) {
    Logger.log('     ' + f.lamina_id + '  orden ' + f.orden_plantilla +
      '  filtro `' + (String(f.filtro || '') || '(vacío)') + '`');
  });

  var esperado = plan.map(function (p) { return p.nuevo; }).concat(['L-008']).sort();
  var real = deSecco.map(function (f) { return String(f.lamina_id || '').trim(); }).sort();
  var cierra = esperado.join(',') === real.join(',');
  Logger.log('');
  Logger.log(cierra
    ? '  ✅ CIERRA: la sección queda con ' + real.join(', ') + ' — ninguna oculta, ninguna muerta.'
    : '  ⛔ NO CIERRA: esperaba [' + esperado.join(', ') + '] y la hoja dice [' + real.join(', ') + ']');

  Logger.log('');
  Logger.log('  ⚠ ESPERADO Y CORRECTO: las cuatro slides escondidas siguen en la plantilla, ancladas');
  Logger.log('    y ahora SIN fila. `verificarLaminas()` las va a nombrar «anclada sin fila».');
  Logger.log('    Es información verdadera —cuatro slides que no se usan—. NO darles el alta de vuelta.');

  return { ok: cierra, backup: backup, nuevas: plan.map(function (p) {
    return { de: p.viejo, a: p.nuevo, slide: p.pos, filtro: p.filtro };
  }), bajas: LAMINAS_ESCONDIDAS_A_BAJA_ };
}
