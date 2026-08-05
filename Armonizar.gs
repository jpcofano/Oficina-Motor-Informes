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

/* ===================== Recorrido de una presentación (sólo lectura) =====================
 *
 * Extraído a scope de módulo el 03/08/2026 para que `mapaDeTokens_` y el filtro de láminas
 * congeladas usen **el mismo** recorrido. Antes vivía adentro de `mapaDeTokens_`, y dos
 * recorridos distintos sobre las mismas plantillas es exactamente la clase de duplicación
 * que este repo ya pagó cara.
 *
 * Baja a **tablas** (celda por celda) y a **grupos** (recursivo), que es lo que
 * `slide.getShapes()` no hace: medido el 03/08, ese camino no ve 33 tokens de JM ni 48 de
 * SECCO.
 */
var RE_TOKEN_ = /\{\{([a-zA-Z0-9_]+)\}\}/g;

function recorteTexto_(texto, tope) {
  var limpio = String(texto || '').replace(/\s+/g, ' ').trim();
  return limpio.length > tope ? limpio.slice(0, tope) + '…' : limpio;
}

function geometriaElemento_(elemento) {
  try {
    return {
      x: Math.round(elemento.getLeft()),
      y: Math.round(elemento.getTop()),
      w: Math.round(elemento.getWidth()),
      h: Math.round(elemento.getHeight())
    };
  } catch (e) {
    return null; // hay elementos sin geometría propia (celdas de tabla, p. ej.)
  }
}

/**
 * Todo lo que tiene texto en una slide: `{ texto, contenedor, geo, objectId }`.
 *
 * `objectId` se agregó el 04/08 para el `Paso-4` (`B.3`), que necesita registrar
 * `token → objectId` **antes** de reemplazar. Es el id del elemento de página: para una
 * celda de tabla es el de la **tabla**, porque una celda no tiene id propio — por eso
 * `contenedor` dice fila y columna, que es lo que la vuelve a ubicar.
 */
function piezasDeTextoDeSlide_(slide) {
  var salida = [];

  function idDe_(elemento) {
    try { return elemento.getObjectId(); } catch (e) { return ''; }
  }

  function recorrer_(elemento, contenedor, geoHeredada) {
    var tipo;
    try { tipo = String(elemento.getPageElementType()); } catch (e) { return; }

    if (tipo === 'GROUP') {
      var geoGrupo = geometriaElemento_(elemento) || geoHeredada;
      elemento.asGroup().getChildren().forEach(function (hijo) {
        recorrer_(hijo, contenedor === 'suelta' ? 'grupo' : contenedor + '>grupo', geoGrupo);
      });
      return;
    }

    if (tipo === 'TABLE') {
      var tabla = elemento.asTable();
      var geoTabla = geometriaElemento_(elemento) || geoHeredada;
      for (var f = 0; f < tabla.getNumRows(); f++) {
        for (var c = 0; c < tabla.getNumColumns(); c++) {
          // `getCell` tira excepción sobre una celda combinada que no es la principal
          // (la de arriba a la izquierda). Es el caso de la lámina de M2, que es una
          // grilla con combinaciones: saltearlas es correcto, su texto vive en la
          // principal y ya se leyó.
          try {
            salida.push({
              texto: tabla.getCell(f, c).getText().asString(),
              contenedor: 'tabla fila ' + (f + 1) + ' col ' + (c + 1),
              geo: geoTabla,
              objectId: idDe_(elemento)
            });
          } catch (e) {
            continue;
          }
        }
      }
      return;
    }

    if (tipo === 'SHAPE' || tipo === 'TEXT_BOX') {
      salida.push({
        texto: elemento.asShape().getText().asString(),
        contenedor: contenedor,
        geo: geometriaElemento_(elemento) || geoHeredada,
        objectId: idDe_(elemento)
      });
    }
  }

  slide.getPageElements().forEach(function (elemento) {
    recorrer_(elemento, 'suelta', null);
  });
  return salida;
}

/** `{ token: [nº de slide, …] }`, 1-based, sin llaves. Sólo lectura. */
function tokensPorSlide_(presentacion) {
  var mapa = {};
  presentacion.getSlides().forEach(function (slide, i) {
    piezasDeTextoDeSlide_(slide).forEach(function (pieza) {
      var m;
      RE_TOKEN_.lastIndex = 0;
      while ((m = RE_TOKEN_.exec(pieza.texto)) !== null) {
        var t = m[1];
        if (!mapa[t]) mapa[t] = [];
        if (mapa[t].indexOf(i + 1) === -1) mapa[t].push(i + 1);
      }
    });
  });
  return mapa;
}

/* ========================= Láminas congeladas (03/08/2026) =========================
 *
 * Decisión del usuario del 03/08/2026: la lámina de la grilla de cinco ejes de M2 **no se
 * retira y no se corrige**. Si vuelve a aparecer en un informe, ahí se decide. Hasta
 * entonces no se le aplica el diccionario de renombres — aplicarlo dejaría dos cajas con el
 * token `{{m2_salud_camp}}`, colisión que la plantilla ya trae y que el renombre **revela**,
 * no crea (ver `docs/PENDIENTES_consistencia.md`).
 *
 * **El filtro NO es una lista de renombres escrita a mano.** Se deriva del inventario de la
 * plantilla: para cada entrada del diccionario se mira en qué slides vive su token de
 * origen, y se excluye únicamente si vive **sólo** en una lámina congelada. Así el filtro se
 * recalcula solo cuando la plantilla cambia, y el día que la lámina se descongele no queda
 * una lista que nadie se acuerde de actualizar.
 *
 * `testigo` es la red de seguridad: un token que **tiene que** estar en esa slide para que
 * el número de slide se considere válido. Si el equipo reordena las láminas, el testigo no
 * aparece y el filtro **para y avisa** en vez de excluir la lámina equivocada — que sería
 * peor que no filtrar. (El número de slide solo no sirve: la misma lámina es la 10 en la
 * plantilla canónica y la 11 en la obsoleta.)
 */
var LAMINAS_CONGELADAS_ = {
  jm: [
    { slide: 10, testigo: 'm2_salud_camp', motivo: 'grilla de cinco ejes de M2 — congelada 03/08/2026, no está en el informe publicado' }
  ]
};

/**
 * Parte la lista de renombres de un informe en las que se aplican y las que no, **derivando
 * el corte del inventario de la plantilla**. Sólo lectura: no escribe nada.
 *
 * Devuelve `{ ok, dentro, fuera, conflictos, sin_ocurrencias, laminas }`.
 *
 * **`ok: false` en dos casos, los dos a propósito:**
 *  - un `testigo` no está en la slide que declara `LAMINAS_CONGELADAS_` (la plantilla se
 *    reordenó, o es otra);
 *  - una entrada tiene su token de origen **dentro y fuera** de la lámina congelada. Ésa no
 *    se puede excluir sin perder el renombre bueno, ni aplicar sin tocar la lámina. Se
 *    reporta y se para: no hay opción correcta que el código pueda elegir solo.
 */
function filtrarRenombresPorLaminasCongeladas_(informeId, presentacion) {
  var lista = RENOMBRES_ARMONIZACION_POR_INFORME_[informeId] || [];
  var congeladas = LAMINAS_CONGELADAS_[informeId] || [];

  if (!congeladas.length) {
    return { ok: true, dentro: lista, fuera: [], conflictos: [], sin_ocurrencias: [], laminas: [] };
  }

  var mapa = tokensPorSlide_(presentacion);

  // Red de seguridad antes de excluir nada.
  var laminas = [];
  for (var i = 0; i < congeladas.length; i++) {
    var c = congeladas[i];
    var slidesDelTestigo = mapa[c.testigo] || [];
    if (slidesDelTestigo.indexOf(c.slide) === -1) {
      return {
        ok: false,
        motivo: 'El testigo "' + c.testigo + '" de la lámina congelada ' + c.slide + ' no está en esa slide' +
          (slidesDelTestigo.length ? ' (está en la ' + slidesDelTestigo.join(', ') + ')' : ' (no está en la presentación)') +
          '. La plantilla se reordenó o es otra: no se filtra nada y no se armoniza.'
      };
    }
    laminas.push({ slide: c.slide, testigo: c.testigo, motivo: c.motivo });
  }

  var numerosCongelados = congeladas.map(function (c) { return c.slide; });
  var dentro = [];
  var fuera = [];
  var conflictos = [];
  var sinOcurrencias = [];

  lista.forEach(function (par) {
    var token = String(par.viejo).replace(/[{}]/g, '');
    var slides = mapa[token] || [];

    if (!slides.length) {
      // No existe en la plantilla: `replaceAllText` daría 0 ocurrencias. Se deja dentro
      // —es inofensivo— pero se reporta, porque suele significar que ya se aplicó.
      sinOcurrencias.push(token);
      dentro.push(par);
      return;
    }

    var enCongelada = slides.filter(function (s) { return numerosCongelados.indexOf(s) !== -1; });
    var enOtras = slides.filter(function (s) { return numerosCongelados.indexOf(s) === -1; });

    if (enCongelada.length && enOtras.length) {
      conflictos.push({ token: token, en_congelada: enCongelada, en_otras: enOtras });
      return;
    }
    if (enCongelada.length) {
      fuera.push({ viejo: par.viejo, nuevo: par.nuevo, slides: enCongelada });
      return;
    }
    dentro.push(par);
  });

  if (conflictos.length) {
    return {
      ok: false,
      motivo: 'Hay ' + conflictos.length + ' renombre(s) cuyo token de origen vive dentro Y fuera de la lámina ' +
        'congelada. No se pueden excluir sin perder el renombre bueno. No se armoniza.',
      conflictos: conflictos,
      laminas: laminas
    };
  }

  return {
    ok: true,
    dentro: dentro,
    fuera: fuera,
    conflictos: [],
    sin_ocurrencias: sinOcurrencias,
    laminas: laminas
  };
}

/**
 * Reporte del filtro **sin armonizar nada**. Es lo que hay que mirar antes de correr
 * "Armonizar tokens de plantillas": cuántas entradas quedan dentro, cuántas fuera y por qué.
 */
function previsualizarArmonizacion(informeId) {
  var informes = leerInformes();
  var informe = informes[informeId];
  if (!informe) return { ok: false, motivo: 'No hay fila "' + informeId + '" en INFORMES' };
  if (!informe.plantilla_id) return { ok: false, motivo: 'INFORMES.' + informeId + '.plantilla_id está vacío' };

  var presentacion;
  try {
    presentacion = SlidesApp.openById(informe.plantilla_id);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la presentación: ' + e.message };
  }

  var lista = RENOMBRES_ARMONIZACION_POR_INFORME_[informeId] || [];
  var filtro = filtrarRenombresPorLaminasCongeladas_(informeId, presentacion);

  return {
    ok: filtro.ok,
    informe_id: informeId,
    plantilla: presentacion.getName(),
    total_declarados: lista.length,
    dentro: filtro.ok ? filtro.dentro.length : 0,
    fuera: filtro.ok ? filtro.fuera.length : 0,
    detalle_dentro: filtro.ok ? filtro.dentro.map(function (p) { return p.viejo + ' → ' + p.nuevo; }) : [],
    detalle_fuera: filtro.ok ? filtro.fuera.map(function (p) { return p.viejo + ' → ' + p.nuevo + ' (slide ' + p.slides.join(',') + ')'; }) : [],
    sin_ocurrencias: filtro.sin_ocurrencias || [],
    laminas_congeladas: filtro.laminas || [],
    conflictos: filtro.conflictos || [],
    motivo: filtro.motivo || ''
  };
}

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

  // El filtro de láminas congeladas corre ANTES del backup: si no se va a armonizar, no
  // tiene sentido dejar una copia más en `_backups`.
  var filtro = filtrarRenombresPorLaminasCongeladas_(informeId, presentacion);
  if (!filtro.ok) {
    return { ok: false, motivo: 'No se armonizó (no se tocó la plantilla): ' + filtro.motivo, conflictos: filtro.conflictos || [] };
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

  // `replaceAllText` es de TODA la presentación (`P2` en PENDIENTES: la solución de fondo es
  // escribir por `objectId`). Mientras tanto, lo que acota el alcance es qué entradas se le
  // pasan, y eso lo decide `filtro.dentro` — derivado del inventario, no escrito a mano.
  filtro.dentro.forEach(function (par) {
    var ocurrencias = presentacion.replaceAllText(par.viejo, par.nuevo, true);
    renombres.push({ viejo: par.viejo, nuevo: par.nuevo, ocurrencias: ocurrencias });
  });

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
    // Qué quedó afuera por lámina congelada, y por qué. Va en el reporte a propósito: una
    // armonización que aplica menos renombres de los declarados tiene que decirlo, si no
    // el próximo que mire la plantilla va a ver tokens viejos y no va a saber si es un bug.
    excluidos_por_lamina_congelada: (filtro.fuera || []).map(function (p) {
      return p.viejo + ' → ' + p.nuevo + ' (slide ' + p.slides.join(',') + ')';
    }),
    laminas_congeladas: filtro.laminas || [],
    sin_ocurrencias: filtro.sin_ocurrencias || [],
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
 * JM slide 10, matriz de M2: hay una caja `{{m2_salud_camp}}` de más, resto
 * de una disposición anterior — no está fuera de canvas, así que
 * `limpiarCajasFueraDeCanvas_` no la toca. Decisión del usuario (HANDOFF
 * 2026-07-30-2, "La caja huérfana: resuelta"): es un sobrante, se borra; el
 * renombre `m2_camp4 → m2_salud_camp` de la Parte A queda como está.
 *
 * Esta función corre DESPUÉS de la Parte A, así que la celda real de la
 * columna Salud ya se llama `{{m2_salud_camp}}` igual que la huérfana — no
 * se puede distinguir por texto. Se distinguen por ancho: la celda de
 * columna mide ~1.14", la huérfana es una franja de ancho completo (~7.13").
 * Comparar por proporción (no por pulgadas/puntos absolutos) para no
 * depender de la unidad que use `getWidth()`.
 */
function eliminarCajaHuerfanaM2Salud_(slide, reporte) {
  var candidatas = slide.getShapes().filter(function (shape) {
    return typeof shape.getText === 'function' && shape.getText().asString().trim() === '{{m2_salud_camp}}';
  });

  if (candidatas.length < 2) {
    reporte.push({ ok: true, etiqueta: 'JM slide 10 — caja huérfana M2 Salud', motivo: candidatas.length + ' caja(s) con ese token — ya estaba limpia o la celda de columna no existe' });
    return;
  }
  if (candidatas.length > 2) {
    reporte.push({ ok: false, etiqueta: 'JM slide 10 — caja huérfana M2 Salud', motivo: candidatas.length + ' cajas con ese token — no se borra nada, revisar a mano' });
    return;
  }

  candidatas.sort(function (a, b) { return b.getWidth() - a.getWidth(); });
  var huerfana = candidatas[0];
  var columna = candidatas[1];
  if (huerfana.getWidth() < columna.getWidth() * 2) {
    reporte.push({ ok: false, etiqueta: 'JM slide 10 — caja huérfana M2 Salud', motivo: 'las dos cajas tienen ancho parecido (' + huerfana.getWidth() + ' vs ' + columna.getWidth() + ') — no se puede distinguir cuál es la huérfana, no se borra nada' });
    return;
  }

  huerfana.remove();
  reporte.push({ ok: true, etiqueta: 'JM slide 10 — caja huérfana M2 Salud', motivo: 'borrada (ancho ' + huerfana.getWidth() + ' vs celda de columna ' + columna.getWidth() + ')' });
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
        eliminarCajaHuerfanaM2Salud_(slide10, reporte);
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
  var ui = ui_();
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

/**
 * 03/08/2026 — mapa de tokens de una plantilla, **sólo lectura**. No escribe ni en la
 * presentación ni en ninguna hoja.
 *
 * Por qué no alcanzaba lo que había: `contarTokensDistintos_` y `armonizarPresentacion_`
 * recorren **sólo `getShapes()`**. Greppeado el 03/08: **ningún `.gs` del repo llama a
 * `getTables()` ni a `getGroups()`**. Un token dentro de una tabla o de un grupo es
 * invisible para el conteo y para el renombre — y la lámina de M2 es exactamente una
 * grilla. Esta función recorre `getPageElements()` y baja a tablas (celda por celda) y a
 * grupos (recursivo), que es lo que el `Paso-2.5` ya pedía para sembrar `MARCADORES`.
 *
 * Devuelve poco a propósito: `/dev` no devuelve respuestas grandes (ver `RUNBOOK` Parte G).
 * Sólo las slides que tienen alguna coincidencia, con los textos recortados.
 *
 * @param {string} plantillaId  ID del Slides.
 * @param {string} patron       Regex como string, p. ej. 'm2_.*_camp'. Sin llaves.
 */
function mapaDeTokens_(plantillaId, patron) {
  var presentacion;
  try {
    presentacion = SlidesApp.openById(plantillaId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir "' + plantillaId + '": ' + e.message };
  }

  var re = new RegExp(patron);
  var TOKEN = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  var slides = presentacion.getSlides();
  var slidesConCoincidencia = [];
  var contexto = [];
  var vecinos = [];
  var todosLosTokens = {};
  var enFormaSuelta = {};
  var slidesPorToken = {};

  /* ── El mapa excluye las láminas escondidas (16/08) ────────────────────────
   * Una lámina marcada como omitida (`skipped`) **no se emite en el deck**, así que
   * sus tokens **no se pueden llenar nunca** y contarlos como faltantes infla el
   * denominador. Pasó al esconder la slide 10: el mapa seguía diciendo **195**
   * cuando la plantilla emite **172**, y los 23 tokens de M2 quedaban como deuda
   * eterna. Es el mismo problema que tuvo el conteo cuando `SUMA` devolvía ceros
   * falsos: **el número dejaba de significar lo que parecía.**
   *
   * **Se excluyen del conteo, NO se borran del reporte.** Van aparte, en
   * `tokens_en_laminas_escondidas`: una lámina escondida se vuelve a mostrar en un
   * clic, y si sus tokens desaparecieran del reporte nadie se acordaría de que
   * existen. Decisión del usuario, 16/08.
   * ──────────────────────────────────────────────────────────────────────── */
  var escondidas = {};
  var tokensEscondidos = {};
  slides.forEach(function (slide, i) {
    try { if (slide.isSkipped()) escondidas[i + 1] = true; } catch (e) { /* servicio sin isSkipped: se cuenta como visible */ }
  });

  slides.forEach(function (slide, i) {
    var piezas = piezasDeTextoDeSlide_(slide);

    if (escondidas[i + 1]) {
      piezas.forEach(function (pieza) {
        var mE; TOKEN.lastIndex = 0;
        while ((mE = TOKEN.exec(pieza.texto)) !== null) {
          if (!tokensEscondidos[mE[1]]) tokensEscondidos[mE[1]] = [];
          if (tokensEscondidos[mE[1]].indexOf(i + 1) === -1) tokensEscondidos[mE[1]].push(i + 1);
        }
      });
      return;
    }

    var coincidencias = [];
    var tokensDeLaSlide = {};
    var textosSinToken = [];

    piezas.forEach(function (pieza) {
      var encontrados = [];
      var m;
      TOKEN.lastIndex = 0;
      while ((m = TOKEN.exec(pieza.texto)) !== null) encontrados.push(m[1]);

      if (!encontrados.length) {
        var suelto = recorteTexto_(pieza.texto, 40);
        if (suelto) {
          textosSinToken.push({
            y: pieza.geo ? pieza.geo.y : '',
            x: pieza.geo ? pieza.geo.x : '',
            w: pieza.geo ? pieza.geo.w : '',
            texto: suelto
          });
        }
        return;
      }

      encontrados.forEach(function (t) {
        tokensDeLaSlide[t] = true;
        todosLosTokens[t] = true;
        // `contarTokensDistintos_` sólo mira `slide.getShapes()`, que son las formas de
        // primer nivel — lo que acá se etiqueta `suelta`. Todo token que nunca aparezca
        // en una `suelta` es invisible para ese conteo y para cualquier diagnóstico que
        // lo use. Se anota para poder listarlos.
        if (pieza.contenedor === 'suelta') enFormaSuelta[t] = true;
        if (!slidesPorToken[t]) slidesPorToken[t] = [];
        if (slidesPorToken[t].indexOf(i + 1) === -1) slidesPorToken[t].push(i + 1);
        if (!re.test(t)) return;
        coincidencias.push({
          token: t,
          contenedor: pieza.contenedor,
          texto: recorteTexto_(pieza.texto, 120),
          geo: pieza.geo
        });
      });
    });

    if (!coincidencias.length) return;

    // Plano a propósito: `Api.gs` serializa hasta profundidad 5, y una geometría anidada
    // dos niveles más abajo se pierde entera sin avisar. Cada coincidencia es un renglón.
    coincidencias.forEach(function (c) {
      slidesConCoincidencia.push({
        slide: i + 1,
        token: c.token,
        contenedor: c.contenedor,
        x: c.geo ? c.geo.x : '',
        y: c.geo ? c.geo.y : '',
        w: c.geo ? c.geo.w : '',
        h: c.geo ? c.geo.h : '',
        texto: c.texto
      });
    });

    contexto.push({
      slide: i + 1,
      titulo: recorteTexto_(primerTextoDeSlide_(slide), 80),
      tokens_de_la_slide: Object.keys(tokensDeLaSlide).sort().join(' ')
    });

    // Plano, por lo mismo que `cajas`: la geometría anidada se pierde a profundidad 5.
    textosSinToken.slice(0, 80).forEach(function (t) {
      vecinos.push({ slide: i + 1, y: t.y, x: t.x, w: t.w, texto: t.texto });
    });
  });

  var queCoinciden = Object.keys(todosLosTokens).filter(function (t) { return re.test(t); }).sort();

  // Los que `contarTokensDistintos_` no ve: nunca aparecieron en una forma de primer nivel.
  var invisibles = Object.keys(todosLosTokens).filter(function (t) { return !enFormaSuelta[t]; }).sort();
  var invisiblesPorSlide = {};
  invisibles.forEach(function (t) {
    var clave = slidesPorToken[t].sort(function (a, b) { return a - b; }).join('+');
    if (!invisiblesPorSlide[clave]) invisiblesPorSlide[clave] = [];
    invisiblesPorSlide[clave].push(t);
  });
  var invisiblesTexto = Object.keys(invisiblesPorSlide).sort(function (a, b) {
    return Number(a.split('+')[0]) - Number(b.split('+')[0]);
  }).map(function (clave) {
    return 'slide ' + clave + ': ' + invisiblesPorSlide[clave].join(' ');
  });

  return {
    ok: true,
    id: plantillaId,
    nombre: DriveApp.getFileById(plantillaId).getName(),
    slides_total: slides.length,
    tokens_distintos_total: Object.keys(todosLosTokens).length,
    // No se borran: se reportan aparte. Una lámina escondida vuelve en un clic.
    laminas_escondidas: Object.keys(escondidas).map(Number).sort(function (a, b) { return a - b; }),
    tokens_en_laminas_escondidas: Object.keys(tokensEscondidos).sort(),
    cuantos_en_laminas_escondidas: Object.keys(tokensEscondidos).length,
    tokens_que_coinciden: queCoinciden.join(' '),
    tokens_en_forma_suelta: Object.keys(enFormaSuelta).length,
    tokens_invisibles_al_conteo_viejo: invisibles.length,
    invisibles_por_slide: invisiblesTexto,
    cajas: slidesConCoincidencia,
    contexto: contexto,
    vecinos: vecinos
  };
}

function menuInventarioPlantillas_() {
  var ui = ui_();
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

/* ================= Paso 2.2.2 — plantilla canónica de JM (retirado 03/08/2026) =================
 *
 * Acá vivían `PLANTILLA_JM_CANONICA_`, `PLANTILLA_JM_OBSOLETA_` y la migración puntual
 * `repuntarPlantillaCanonicaJM_()` (más su ítem de menú "Fijar plantilla canónica de JM").
 * Se retiran los tres, por decisión del usuario del 03/08/2026: el ID de una plantilla es
 * un dato de registro y su lugar es `INFORMES.plantilla_id`, no una constante de módulo.
 * Es el sub-ítem `PLANTILLA_JM_CANONICA_ hardcodeada` del `P0` de direccionabilidad de
 * `docs/PENDIENTES_consistencia.md`.
 *
 * La migración ya había corrido y sus dos mitades están hechas y verificadas el 03/08:
 * la obsoleta figura en Drive como `[OBSOLETA — no usar] JM_marcada`, dentro de la
 * subcarpeta `_backups` de la carpeta de plantillas, y la canónica (`117I0qn1…`) queda
 * declarada en `SEED_INFORMES_`. Una migración de un solo uso que ya corrió no se
 * conserva "por las dudas": lo que queda es el estado, no el instrumento.
 *
 * Lo único que esta función sabía y ningún otro lado decía —cuál de las dos JM es la
 * buena— ahora lo dice la hoja de registro, que es lo que declara `CLAUDE.md` §2:
 * la plantilla es del equipo, el motor se adapta, y `INFORMES.plantilla_id` es la única
 * verdad sobre qué archivo usa cada informe.
 */
