/**
 * Armonizar.gs — Migración de una sola vez: renombra tokens en las Slides
 * marcadas (JM, SECCO) para que coincidan con el diccionario canónico de
 * `docs/TOKENS.md`, y corrige contenido de caja que un renombre de texto no
 * puede resolver (token en la caja equivocada, no solo con nombre viejo).
 * REGLA DE ORO: acá no hay aritmética. Solo texto de plantillas.
 * No va en `Instalar.gs`: es una migración puntual del Paso 2.2, no parte del
 * ciclo de instalación. Ver docs/Prompts/Paso-2.2.md y
 * docs/PLANTILLAS_QA_y_armonizacion.md (tablas de origen del QA posicional).
 * Se completa en: Paso 2.2.
 */

// Parte A — renombres de texto puros (mismo concepto, nombre viejo → nuevo).
// Listas POR `informe_id` (Paso 2.2.1), no un array único aplicado a todas
// las presentaciones: los nombres de token pueden colisionar entre
// plantillas. `enc_audiencia` en JM significaba "audiencia de pauta" (había
// que renombrarlo a `enc_alcance`); en SECCO ese mismo texto ya significaba
// "alcance digital" de la columna IVR — aplicarle el mismo renombre global
// rompió esa caja (regresión real, corregida en Paso-2.2.md → Paso-2.2.1.md).
// Si un `informe_id` no tiene lista acá, `armonizarPresentacion_` no le
// aplica NINGÚN renombre y lo avisa en el reporte: mejor no tocar nada que
// aplicar la lista de otra plantilla.
//
// Cada lista es un array ORDENADO, no objeto: el orden importa dentro de JM
// — `enc_audiencia`→`enc_alcance` tiene que correr antes de que la Parte B
// escriba `{{enc_audiencia}}` en la caja de IVR de la slide 6, si no el
// segundo renombre se lleva puesto al primero. Siempre con llaves:
// `enc_clics` es prefijo de `enc_clics_ctor`.
var RENOMBRES_ARMONIZACION_POR_INFORME_ = {
  jm: [
    { viejo: '{{enc_audiencia}}', nuevo: '{{enc_alcance}}' },
    { viejo: '{{enc_audiencia_pct}}', nuevo: '{{enc_alcance_pct}}' },
    { viejo: '{{enc_clics}}', nuevo: '{{enc_clics_ctor}}' },
    { viejo: '{{enc_audiencia_ivr}}', nuevo: '{{enc_base_total}}' },
    { viejo: '{{rrss_prom}}', nuevo: '{{rrss_prom_general}}' },
    // M2 slide 10 — nombres por categoría (docs/TOKENS.md §1, tabla
    // "M2 slide 10"; mapeo verificado contra la Sheet viva en
    // docs/Prompts/Paso-2.2.1.md, Problema 2). Cada texto viejo es único en
    // la presentación (a diferencia de `enc_audiencia` en la slide 5, acá no
    // hay colisión), así que el renombre 1 a 1 es seguro pese a que el mapeo
    // real no sigue un patrón simple: `m2_vis_e` está en Desalojos (no en la
    // "e" que sugeriría el sufijo) y `m2_camp1`/`m2_camp2` están cruzados.
    // Si alguna ya está aplicada (p. ej. `m2_camp4` ya es `m2_salud_camp`),
    // el reemplazo da 0 ocurrencias — no rompe nada, es idempotente.
    { viejo: '{{m2_clics_a}}', nuevo: '{{m2_subtes_clics}}' },
    { viejo: '{{m2_aud_a}}', nuevo: '{{m2_subtes_aud}}' },
    { viejo: '{{m2_vis_a}}', nuevo: '{{m2_subtes_vis}}' },
    { viejo: '{{m2_clics_b}}', nuevo: '{{m2_transito_clics}}' },
    { viejo: '{{m2_aud_b}}', nuevo: '{{m2_transito_aud}}' },
    { viejo: '{{m2_clics_c}}', nuevo: '{{m2_desalojos_clics}}' },
    { viejo: '{{m2_aud_c}}', nuevo: '{{m2_desalojos_aud}}' },
    { viejo: '{{m2_vis_e}}', nuevo: '{{m2_desalojos_vis}}' },
    { viejo: '{{m2_clics_d}}', nuevo: '{{m2_salud_clics}}' },
    { viejo: '{{m2_aud_d}}', nuevo: '{{m2_salud_aud}}' },
    { viejo: '{{m2_clics_e}}', nuevo: '{{m2_seguridad_clics}}' },
    { viejo: '{{m2_camp2}}', nuevo: '{{m2_subtes_camp}}' },
    { viejo: '{{m2_camp1}}', nuevo: '{{m2_desalojos_camp}}' },
    { viejo: '{{m2_camp3}}', nuevo: '{{m2_transito_camp}}' },
    { viejo: '{{m2_camp4}}', nuevo: '{{m2_salud_camp}}' },
    { viejo: '{{m2_camp5}}', nuevo: '{{m2_seguridad_camp}}' }
    // No se crean m2_transito_vis / m2_salud_vis / m2_seguridad_vis: esas
    // columnas no tienen caja de Visualizaciones en la plantilla viva.
  ],
  secco: [
    { viejo: '{{rrss_prom}}', nuevo: '{{rrss_prom_general}}' }
    // enc_audiencia → enc_alcance NO va acá: en SECCO ese texto ya era
    // correcto (columna IVR de la slide 8). Ver Paso-2.2.1.md, Problema 1.
  ]
};

function armonizarPlantillas() {
  var informes = leerInformes();
  var reporte = [];

  Object.keys(informes).forEach(function (informeId) {
    var informe = informes[informeId];
    if (!informe.activo || !informe.plantilla_id) return;

    var resultado = armonizarPresentacion_(informeId, informe.plantilla_id);
    reporte.push({ informeId: informeId, nombre: informe.nombre, plantillaId: informe.plantilla_id, resultado: resultado });
  });

  return reporte;
}

/**
 * Backup obligatorio (Paso 2.2.2): la armonización escribe directo sobre la
 * plantilla del equipo (SlidesApp.openById(), sin copiar — el que copia y
 * escribe sobre la copia es el Paso 4, en la generación semanal, todavía sin
 * hacer). Sin backup, cada corrida es destructiva y sin vuelta atrás — ya
 * costó una regresión real en SECCO (Paso 2.2.1). Si el backup falla, se
 * aborta esa presentación: mejor no armonizar que armonizar sin red.
 */
function asegurarCarpetaBackups_() {
  var carpetaPlantillasId = leerConfig().carpeta_plantillas;
  if (!carpetaPlantillasId) {
    return { ok: false, motivo: 'CONFIG.carpeta_plantillas no está cargado' };
  }

  var carpetaPlantillas;
  try {
    carpetaPlantillas = DriveApp.getFolderById(carpetaPlantillasId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la carpeta de plantillas: ' + e.message };
  }

  var existentes = carpetaPlantillas.getFoldersByName('_backups');
  var carpetaBackups = existentes.hasNext() ? existentes.next() : carpetaPlantillas.createFolder('_backups');
  return { ok: true, carpeta: carpetaBackups };
}

function backupPlantilla_(plantillaId, nombreOriginal, carpetaBackups) {
  try {
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    var copia = DriveApp.getFileById(plantillaId).makeCopy(nombreOriginal + ' — backup ' + timestamp, carpetaBackups);
    return { ok: true, id: copia.getId(), url: copia.getUrl(), nombre: copia.getName() };
  } catch (e) {
    return { ok: false, motivo: e.message };
  }
}

function armonizarPresentacion_(informeId, plantillaId) {
  var presentacion;
  try {
    presentacion = SlidesApp.openById(plantillaId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la presentación "' + plantillaId + '": ' + e.message };
  }

  var carpetaBackups = asegurarCarpetaBackups_();
  if (!carpetaBackups.ok) {
    return { ok: false, motivo: 'Backup abortado (no se tocó la plantilla): ' + carpetaBackups.motivo };
  }

  var backup = backupPlantilla_(plantillaId, presentacion.getName(), carpetaBackups.carpeta);
  if (!backup.ok) {
    return { ok: false, motivo: 'Backup abortado (no se tocó la plantilla): ' + backup.motivo };
  }

  var listaRenombres = RENOMBRES_ARMONIZACION_POR_INFORME_[informeId];
  var renombres = [];
  var renombresOmitidos = !listaRenombres;

  if (listaRenombres) {
    listaRenombres.forEach(function (par) {
      var ocurrencias = presentacion.replaceAllText(par.viejo, par.nuevo, true);
      renombres.push({ viejo: par.viejo, nuevo: par.nuevo, ocurrencias: ocurrencias });
    });
  }

  // Parte B corre siempre DESPUÉS de los renombres de texto de la Parte A,
  // sobre la misma presentación ya abierta — el orden es a propósito (ver
  // comentario de RENOMBRES_ARMONIZACION_).
  var cajas = corregirCajasPresentacion_(informeId, presentacion);

  return {
    ok: true,
    id: presentacion.getId(),
    nombre: presentacion.getName(),
    backup: backup,
    renombres: renombres,
    renombres_omitidos: renombresOmitidos,
    cajas: cajas
  };
}

/* ========================= Parte B — correcciones de caja ========================= */

/**
 * Estas correcciones NO son renombres: la caja tiene un token que no
 * corresponde a esa posición (rotación entre grupos, cruce puntual), no un
 * token con nombre viejo del mismo concepto. `replaceAllText` no alcanza.
 *
 * Identificación por ETIQUETA + proximidad, no por el token actual de la
 * caja de valor: en JM slide 5 dos cajas de valor distintas comparten, por
 * error, el mismo token actual (`{{ivr_atendidos}}` en "Clics" y en "Mails
 * entregados") — buscar por contenido actual sería ambiguo. La etiqueta es
 * estable (es el texto fijo de la slide); la caja de valor es la más
 * cercana en posición a su etiqueta, tal como se armó el marcado original.
 */

function buscarShapePorTexto_(shapes, texto) {
  for (var i = 0; i < shapes.length; i++) {
    var shape = shapes[i];
    if (typeof shape.getText !== 'function') continue;
    var rango = shape.getText();
    if (rango && rango.asString().trim() === texto) return shape;
  }
  return null;
}

function shapeValorMasCercano_(shapes, shapeEtiqueta) {
  var refLeft = shapeEtiqueta.getLeft();
  var refTop = shapeEtiqueta.getTop();
  var mejor = null;
  var mejorDistancia = Infinity;

  shapes.forEach(function (shape) {
    if (shape === shapeEtiqueta || typeof shape.getText !== 'function') return;
    var dx = shape.getLeft() - refLeft;
    var dy = shape.getTop() - refTop;
    var distancia = Math.sqrt(dx * dx + dy * dy);
    if (distancia < mejorDistancia) {
      mejorDistancia = distancia;
      mejor = shape;
    }
  });

  return mejor;
}

function corregirCajaPorEtiqueta_(slide, etiqueta, tokenNuevo, reporte) {
  var shapes = slide.getShapes();
  var shapeEtiqueta = buscarShapePorTexto_(shapes, etiqueta);
  if (!shapeEtiqueta) {
    reporte.push({ ok: false, etiqueta: etiqueta, motivo: 'no se encontró la etiqueta "' + etiqueta + '" en la slide' });
    return;
  }

  var shapeValor = shapeValorMasCercano_(shapes, shapeEtiqueta);
  if (!shapeValor) {
    reporte.push({ ok: false, etiqueta: etiqueta, motivo: 'no se encontró una caja de valor cerca de "' + etiqueta + '"' });
    return;
  }

  var tokenAnterior = shapeValor.getText().asString();
  shapeValor.getText().setText(tokenNuevo);
  reporte.push({ ok: true, etiqueta: etiqueta, token_anterior: tokenAnterior, token_nuevo: tokenNuevo });
}

/**
 * Agrega una línea a una caja de texto multilínea existente, ubicándola por
 * un texto ancla que ya está en la caja (ej. "Difusión"). Idempotente: si la
 * línea ya está, no la duplica — necesario porque correr la armonización dos
 * veces no puede cambiar nada (criterio de aceptación del Paso 2.2).
 */
function agregarLineaCaja_(slide, textoAncla, lineaNueva, reporte, etiquetaReporte) {
  var shapes = slide.getShapes();
  var shape = null;
  for (var i = 0; i < shapes.length; i++) {
    if (typeof shapes[i].getText !== 'function') continue;
    var rango = shapes[i].getText();
    if (rango && rango.asString().indexOf(textoAncla) !== -1) { shape = shapes[i]; break; }
  }

  if (!shape) {
    reporte.push({ ok: false, etiqueta: etiquetaReporte, motivo: 'no se encontró la caja que contiene "' + textoAncla + '"' });
    return;
  }

  var textoActual = shape.getText().asString();
  if (textoActual.indexOf(lineaNueva) !== -1) {
    reporte.push({ ok: true, etiqueta: etiquetaReporte, motivo: 'la línea ya estaba — no se duplicó' });
    return;
  }

  shape.getText().appendText('\n' + lineaNueva);
  reporte.push({ ok: true, etiqueta: etiquetaReporte, linea_agregada: lineaNueva });
}

/**
 * Los 14 números hardcodeados de JM slide 10 están fuera del área visible
 * (`top` negativo) — no se imprimen, pero ensucian cualquier búsqueda de
 * texto. Se identifican por posición, no por contenido: no hace falta saber
 * qué número tiene cada uno para saber que no debería estar ahí.
 *
 * Paso 2.2.1: la primera versión usaba `slide.getShapes()`, que solo trae
 * elementos de primer nivel — si los números viejos están agrupados (Group),
 * no aparecen ahí y la limpieza no encontraba nada (síntoma real: seguían
 * los 14 números tras correr la armonización). Ahora recorre
 * `getPageElements()` y entra un nivel en cada Group.
 */
function eliminarElementosFueraDeCanvas_(elementos) {
  var eliminados = 0;
  var lista = elementos.slice(); // copia: remove() muta la colección en vivo

  lista.forEach(function (el) {
    if (el.getTop() < 0) {
      el.remove(); // si es un Group entero fuera de canvas, se va con todo su contenido
      eliminados++;
      return;
    }
    if (el.getPageElementType && el.getPageElementType() === SlidesApp.PageElementType.GROUP) {
      eliminados += eliminarElementosFueraDeCanvas_(el.asGroup().getChildren());
    }
  });

  return eliminados;
}

function limpiarCajasFueraDeCanvas_(slide, reporte) {
  var eliminados = eliminarElementosFueraDeCanvas_(slide.getPageElements());
  reporte.push({ ok: true, etiqueta: 'JM slide 10 — limpieza', eliminados: eliminados });
}

/**
 * Diagnóstico manual (no lo llama el menú ni `armonizarPlantillas`): lista
 * cada elemento de una slide con tipo, posición y texto si tiene, recursando
 * en grupos. Para cuando `limpiarCajasFueraDeCanvas_` no encuentra lo que se
 * espera — correr esto y mirar el log antes de ajustar el código a ciegas.
 * Ej.: `diagnosticoElementosSlide_('<id de la plantilla JM>', 10)`.
 */
function diagnosticoElementosSlide_(plantillaId, numeroSlideUnoIndexado) {
  var presentacion = SlidesApp.openById(plantillaId);
  var slide = slideEn_(presentacion.getSlides(), numeroSlideUnoIndexado);
  if (!slide) {
    Logger.log('No existe la slide ' + numeroSlideUnoIndexado);
    return;
  }
  logElementosSlide_(slide.getPageElements(), 0);
}

function logElementosSlide_(elementos, profundidad) {
  var sangria = new Array(profundidad + 1).join('  ');
  elementos.forEach(function (el) {
    var tipo = el.getPageElementType ? el.getPageElementType() : '?';
    var texto = (typeof el.getText === 'function') ? el.getText().asString().replace(/\n/g, ' ⏎ ').slice(0, 40) : '';
    Logger.log(sangria + tipo + ' · top=' + el.getTop() + ' left=' + el.getLeft() + ' · "' + texto + '"');
    if (tipo === SlidesApp.PageElementType.GROUP) {
      logElementosSlide_(el.asGroup().getChildren(), profundidad + 1);
    }
  });
}

function slideEn_(slides, numeroUnoIndexado) {
  var idx = numeroUnoIndexado - 1;
  return (idx >= 0 && idx < slides.length) ? slides[idx] : null;
}

// JM slide 5 — los nueve tokens rotados + el literal 135 → token nuevo.
// Tabla completa: docs/PLANTILLAS_QA_y_armonizacion.md §4.
var CORRECCIONES_JM_SLIDE5_ = [
  { etiqueta: 'Impresiones', tokenNuevo: '{{imp_total}}' },
  { etiqueta: 'Clics', tokenNuevo: '{{clics}}' },
  { etiqueta: '*Audiencia Alcanzada', tokenNuevo: '{{alcance}}' },
  { etiqueta: 'Mails entregados', tokenNuevo: '{{mail_entregados}}' },
  { etiqueta: 'Aperturas (OR)', tokenNuevo: '{{mail_aperturas}} ({{mail_or}}%)' },
  { etiqueta: 'Base llamada', tokenNuevo: '{{cc_base}}' },
  { etiqueta: 'Llamados Contactados', tokenNuevo: '{{cc_contactados}} ({{cc_contact_pct}}%)' },
  { etiqueta: 'Atendidos', tokenNuevo: '{{ivr_atendidos}}' },
  { etiqueta: 'Escucharon +75%', tokenNuevo: '{{ivr_75}} ({{ivr_75_pct}}%)' },
  { etiqueta: 'Marque 1', tokenNuevo: '{{ivr_marque1}}' }
];

// JM slide 6 — dos cajas cruzadas. docs/PLANTILLAS_QA_y_armonizacion.md §5.
var CORRECCIONES_JM_SLIDE6_ = [
  { etiqueta: 'Mails Enviados', tokenNuevo: '{{enc_mails_enviados}}' },
  { etiqueta: 'Audiencia', tokenNuevo: '{{enc_audiencia}}' }
];

function corregirCajasPresentacion_(informeId, presentacion) {
  var reporte = [];
  var slides = presentacion.getSlides();

  try {
    if (informeId === 'jm') {
      var slide5 = slideEn_(slides, 5);
      var slide6 = slideEn_(slides, 6);
      var slide10 = slideEn_(slides, 10);

      if (slide5) {
        CORRECCIONES_JM_SLIDE5_.forEach(function (c) {
          corregirCajaPorEtiqueta_(slide5, c.etiqueta, c.tokenNuevo, reporte);
        });
        agregarLineaCaja_(slide5, 'Difusión', 'IVR: {{ecv_insc_ivr}}({{ecv_insc_ivr_pct}}%)', reporte, 'JM slide 5 — línea IVR');
      } else {
        reporte.push({ ok: false, etiqueta: 'JM slide 5', motivo: 'la presentación no tiene slide 5' });
      }

      if (slide6) {
        CORRECCIONES_JM_SLIDE6_.forEach(function (c) {
          corregirCajaPorEtiqueta_(slide6, c.etiqueta, c.tokenNuevo, reporte);
        });
        agregarLineaCaja_(slide6, 'Difusión', 'IVR: {{ecv_insc_ivr}}', reporte, 'JM slide 6 — línea IVR');
      } else {
        reporte.push({ ok: false, etiqueta: 'JM slide 6', motivo: 'la presentación no tiene slide 6' });
      }

      if (slide10) {
        limpiarCajasFueraDeCanvas_(slide10, reporte);
      } else {
        reporte.push({ ok: false, etiqueta: 'JM slide 10', motivo: 'la presentación no tiene slide 10' });
      }
    } else if (informeId === 'secco') {
      var slide8 = slideEn_(slides, 8);
      if (slide8) {
        // Paso 2.2.1, Problema 1: restaurar la caja "Audiencia" (columna
        // IVR) a {{enc_audiencia}} — la Parte A global del 2.2 la había
        // renombrado por error a {{enc_alcance}}, dejando dos cajas
        // ("Audiencia" y "Alcance") con el mismo token. Por etiqueta, no por
        // valor: hay dos cajas con {{enc_alcance}} y buscar por valor actual
        // sería ambiguo — mismo criterio que la Parte B.1.
        corregirCajaPorEtiqueta_(slide8, 'Audiencia', '{{enc_audiencia}}', reporte);
        agregarLineaCaja_(slide8, 'Difusión', 'IVR: {{ecv_insc_ivr}} ({{ecv_insc_ivr_pct}}%)', reporte, 'SECCO slide 8 — línea IVR');
      } else {
        reporte.push({ ok: false, etiqueta: 'SECCO slide 8', motivo: 'la presentación no tiene slide 8' });
      }
    }
  } catch (e) {
    reporte.push({ ok: false, motivo: 'Error corrigiendo cajas de "' + informeId + '": ' + e.message });
  }

  return reporte;
}

function menuArmonizarPlantillas_() {
  var ui = SpreadsheetApp.getUi();
  var reporte = armonizarPlantillas();

  if (!reporte.length) {
    ui.alert('Armonizar tokens de plantillas', 'No hay informes activos con plantilla_id cargado en INFORMES.', ui.ButtonSet.OK);
    return;
  }

  // Backups arriba de todo: si algo sale mal, es lo primero que hace falta.
  var lineas = ['Backups:'];
  reporte.forEach(function (item) {
    if (!item.resultado.ok || !item.resultado.backup) return;
    lineas.push('  ' + item.informeId + ': ' + item.resultado.backup.nombre);
    lineas.push('    ' + item.resultado.backup.url);
  });
  lineas.push('');

  reporte.forEach(function (item) {
    if (!item.resultado.ok) {
      lineas.push('⚠️ ' + item.informeId + ' — ' + item.resultado.motivo);
      return;
    }
    lineas.push('— ' + item.informeId + ' (' + item.resultado.nombre + ' · ' + item.resultado.id + ')');
    if (item.resultado.renombres_omitidos) {
      lineas.push('   ⚠️ sin lista de renombres definida para "' + item.informeId + '" — no se tocó texto');
    }
    item.resultado.renombres.forEach(function (r) {
      var marca = r.ocurrencias === 0 ? ' ⚠️ 0 — ya aplicado, token no existe, o plantilla equivocada' : '';
      lineas.push('   ' + r.viejo + ' → ' + r.nuevo + ': ' + r.ocurrencias + marca);
    });
    lineas.push('   Correcciones de caja:');
    item.resultado.cajas.forEach(function (c) {
      var detalle = c.motivo || (c.token_anterior + ' → ' + c.token_nuevo) || (c.linea_agregada ? 'línea agregada: ' + c.linea_agregada : '');
      if (c.eliminados !== undefined) detalle = c.eliminados + ' caja(s) fuera de canvas eliminadas';
      lineas.push('   ' + (c.ok ? '✅' : '⚠️') + ' ' + (c.etiqueta || '') + ' — ' + detalle);
    });
  });

  ui.alert('Armonizar tokens de plantillas', lineas.join('\n'), ui.ButtonSet.OK);
}

/* ========================= Paso 2.2.2 — inventario de plantillas ========================= */

/**
 * Tokens que solo deberían aparecer en una plantilla sin armonizar. Sirve
 * para responder de un vistazo "¿esta está armonizada o no?" — surgió porque
 * había dos presentaciones JM parecidas y ninguna forma rápida de saber cuál
 * era cuál (docs/Prompts/Paso-2.2.2.md).
 */
var TOKENS_VIEJOS_DIAGNOSTICO_ = [
  '{{enc_audiencia_ivr}}', '{{enc_audiencia_pauta}}', '{{enc_clics}}',
  '{{rrss_prom}}', '{{m2_clics_a}}'
];

function inventarioPlantillas() {
  var informes = leerInformes();
  var reporte = [];

  Object.keys(informes).forEach(function (informeId) {
    var informe = informes[informeId];
    if (!informe.plantilla_id) {
      reporte.push({ informeId: informeId, ok: false, motivo: 'sin plantilla_id cargado en INFORMES' });
      return;
    }
    reporte.push(inventariarPresentacion_(informeId, informe.plantilla_id));
  });

  return reporte;
}

function inventariarPresentacion_(informeId, plantillaId) {
  var archivo, presentacion;

  try {
    archivo = DriveApp.getFileById(plantillaId);
  } catch (e) {
    return { informeId: informeId, ok: false, motivo: 'No se pudo abrir el archivo de Drive "' + plantillaId + '": ' + e.message };
  }
  try {
    presentacion = SlidesApp.openById(plantillaId);
  } catch (e) {
    return { informeId: informeId, ok: false, motivo: 'No se pudo abrir como presentación "' + plantillaId + '": ' + e.message };
  }

  var slides = presentacion.getSlides();
  var titulos = slides.map(function (slide, i) {
    return (i + 1) + '. ' + (primerTextoDeSlide_(slide) || '(sin texto)');
  });

  var tokens = contarTokensDistintos_(presentacion);
  var tokensViejosEncontrados = TOKENS_VIEJOS_DIAGNOSTICO_.filter(function (t) {
    return tokens.textoCompleto.indexOf(t) !== -1;
  });
  if (/(^|[^0-9{])135([^0-9}]|$)/.test(tokens.textoCompleto)) {
    tokensViejosEncontrados.push('135 (literal suelto, sin llaves)');
  }

  var carpetas = archivo.getParents();
  var carpeta = carpetas.hasNext() ? carpetas.next().getName() : '(sin carpeta)';

  return {
    informeId: informeId,
    ok: true,
    nombre: archivo.getName(),
    id: plantillaId,
    url: archivo.getUrl(),
    carpeta: carpeta,
    modificado: archivo.getLastUpdated(),
    slides: slides.length,
    titulos: titulos,
    tokensDistintosCount: tokens.cantidad,
    tokensViejosEncontrados: tokensViejosEncontrados
  };
}

function primerTextoDeSlide_(slide) {
  var shapes = slide.getShapes();
  for (var i = 0; i < shapes.length; i++) {
    if (typeof shapes[i].getText !== 'function') continue;
    var texto = shapes[i].getText().asString().trim();
    if (texto) return texto.split('\n')[0];
  }
  return '';
}

function contarTokensDistintos_(presentacion) {
  var vistos = {};
  var partes = [];

  presentacion.getSlides().forEach(function (slide) {
    slide.getShapes().forEach(function (shape) {
      if (typeof shape.getText !== 'function') return;
      var texto = shape.getText().asString();
      partes.push(texto);
      var encontrados = texto.match(/\{\{[a-zA-Z0-9_]+\}\}/g);
      if (encontrados) encontrados.forEach(function (t) { vistos[t] = true; });
    });
  });

  return { cantidad: Object.keys(vistos).length, textoCompleto: partes.join('\n') };
}

function menuInventarioPlantillas_() {
  var ui = SpreadsheetApp.getUi();
  var reporte = inventarioPlantillas();

  if (!reporte.length) {
    ui.alert('Inventario de plantillas', 'No hay filas en INFORMES.', ui.ButtonSet.OK);
    return;
  }

  var lineas = [];
  reporte.forEach(function (item) {
    if (!item.ok) {
      lineas.push('⚠️ ' + item.informeId + ' — ' + item.motivo);
      lineas.push('');
      return;
    }

    lineas.push('— ' + item.informeId + ': ' + item.nombre);
    lineas.push('   ID: ' + item.id);
    lineas.push('   URL: ' + item.url);
    lineas.push('   Carpeta: ' + item.carpeta + ' · modificado: ' + formatearFecha_(item.modificado));
    lineas.push('   Slides: ' + item.slides + ' · tokens {{...}} distintos: ' + item.tokensDistintosCount);
    lineas.push('   Tokens viejos: ' + (item.tokensViejosEncontrados.length ? item.tokensViejosEncontrados.join(', ') : 'ninguno — parece armonizada'));
    lineas.push('   Títulos:');
    item.titulos.forEach(function (t) { lineas.push('     ' + t); });
    lineas.push('');
  });

  Logger.log(lineas.join('\n'));
  ui.alert('Inventario de plantillas', lineas.join('\n'), ui.ButtonSet.OK);
}

/* ========================= Paso 2.2.2 — plantilla canónica de JM ========================= */

/**
 * Migración puntual, correr una sola vez: había dos presentaciones JM en
 * Drive con distinto orden de slides. `INFORMES.jm.plantilla_id` apuntaba a
 * la que NO usa el equipo (`1JrHvs_p…`, que además ya tiene la armonización
 * del Paso 2.2.1 aplicada por error). La canónica es `117I0qn1…`.
 * Ver docs/Prompts/Paso-2.2.2.md.
 *
 * Regla que queda fija (Plan Inicial/PROYECTO.md §6): la plantilla es del
 * equipo, el motor se adapta — `INFORMES.plantilla_id` es la única verdad
 * sobre qué archivo usa cada informe.
 */
var PLANTILLA_JM_CANONICA_ = '117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI';
var PLANTILLA_JM_OBSOLETA_ = '1JrHvs_pdvdwWGZ1CQNmuJr9Bi3XvqyOMJhRweeJAzbE';

function repuntarPlantillaCanonicaJM_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('INFORMES');
  if (!hoja) return { ok: false, motivo: 'La hoja INFORMES no existe' };

  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idxInformeId = headers.indexOf('informe_id');
  var idxPlantillaId = headers.indexOf('plantilla_id');
  var filaJM = null;

  for (var f = 1; f < datos.length; f++) {
    if (datos[f][idxInformeId] === 'jm') { filaJM = f + 1; break; }
  }
  if (!filaJM) return { ok: false, motivo: 'No hay fila "jm" en INFORMES' };

  var pasos = [];
  var anterior = hoja.getRange(filaJM, idxPlantillaId + 1).getValue();

  if (anterior === PLANTILLA_JM_CANONICA_) {
    pasos.push('INFORMES.jm.plantilla_id ya apuntaba a la canónica — no se tocó');
  } else {
    hoja.getRange(filaJM, idxPlantillaId + 1).setValue(PLANTILLA_JM_CANONICA_);
    pasos.push('INFORMES.jm.plantilla_id: "' + anterior + '" → "' + PLANTILLA_JM_CANONICA_ + '"');
  }

  try {
    var archivoObsoleto = DriveApp.getFileById(PLANTILLA_JM_OBSOLETA_);
    var nombreActual = archivoObsoleto.getName();
    if (nombreActual.indexOf('[OBSOLETA') === 0) {
      pasos.push('La plantilla vieja ya estaba marcada como obsoleta en Drive — no se tocó');
    } else {
      archivoObsoleto.setName('[OBSOLETA — no usar] ' + nombreActual);
      pasos.push('Renombrada en Drive: "' + nombreActual + '" → "[OBSOLETA — no usar] ' + nombreActual + '"');
    }
  } catch (e) {
    pasos.push('⚠️ No se pudo renombrar la plantilla obsoleta en Drive: ' + e.message);
  }

  return { ok: true, pasos: pasos };
}

function menuRepuntarPlantillaCanonicaJM_() {
  var ui = SpreadsheetApp.getUi();
  var resultado = repuntarPlantillaCanonicaJM_();

  if (!resultado.ok) {
    ui.alert('No se pudo repuntar la plantilla canónica', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  ui.alert('Plantilla canónica de JM', resultado.pasos.join('\n'), ui.ButtonSet.OK);
}
