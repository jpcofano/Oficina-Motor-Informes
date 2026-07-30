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
    { viejo: '{{rrss_prom}}', nuevo: '{{rrss_prom_general}}' }
    // M2 slide 10 (nombres por categoría) se agrega en el Problema 2.
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

function armonizarPresentacion_(informeId, plantillaId) {
  var presentacion;
  try {
    presentacion = SlidesApp.openById(plantillaId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la presentación "' + plantillaId + '": ' + e.message };
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
 */
function limpiarCajasFueraDeCanvas_(slide, reporte) {
  var shapes = slide.getShapes();
  var eliminados = 0;

  shapes.forEach(function (shape) {
    if (shape.getTop() < 0) {
      shape.remove();
      eliminados++;
    }
  });

  reporte.push({ ok: true, etiqueta: 'JM slide 10 — limpieza', eliminados: eliminados });
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

  var lineas = [];
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
