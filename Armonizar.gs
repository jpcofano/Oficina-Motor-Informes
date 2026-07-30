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
// Array ORDENADO, no objeto: el orden importa. `enc_audiencia`→`enc_alcance`
// tiene que correr antes de que la Parte B escriba `{{enc_audiencia}}` en la
// caja de IVR de la slide 6 — si no, el segundo renombre se lleva puesto al
// primero. Siempre con llaves: `enc_clics` es prefijo de `enc_clics_ctor`.
var RENOMBRES_ARMONIZACION_ = [
  { viejo: '{{enc_audiencia}}', nuevo: '{{enc_alcance}}' },
  { viejo: '{{enc_audiencia_pct}}', nuevo: '{{enc_alcance_pct}}' },
  { viejo: '{{enc_clics}}', nuevo: '{{enc_clics_ctor}}' },
  { viejo: '{{enc_audiencia_ivr}}', nuevo: '{{enc_base_total}}' },
  { viejo: '{{rrss_prom}}', nuevo: '{{rrss_prom_general}}' }
];

function armonizarPlantillas() {
  var informes = leerInformes();
  var reporte = [];

  Object.keys(informes).forEach(function (informeId) {
    var informe = informes[informeId];
    if (!informe.activo || !informe.plantilla_id) return;

    var resultado = armonizarPresentacion_(informe.plantilla_id);
    reporte.push({ informeId: informeId, nombre: informe.nombre, plantillaId: informe.plantilla_id, resultado: resultado });
  });

  return reporte;
}

function armonizarPresentacion_(plantillaId) {
  var presentacion;
  try {
    presentacion = SlidesApp.openById(plantillaId);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir la presentación "' + plantillaId + '": ' + e.message };
  }

  var renombres = [];
  RENOMBRES_ARMONIZACION_.forEach(function (par) {
    var ocurrencias = presentacion.replaceAllText(par.viejo, par.nuevo, true);
    renombres.push({ viejo: par.viejo, nuevo: par.nuevo, ocurrencias: ocurrencias });
  });

  return {
    ok: true,
    id: presentacion.getId(),
    nombre: presentacion.getName(),
    renombres: renombres
  };
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
    item.resultado.renombres.forEach(function (r) {
      var marca = r.ocurrencias === 0 ? ' ⚠️ 0 — ya aplicado, token no existe, o plantilla equivocada' : '';
      lineas.push('   ' + r.viejo + ' → ' + r.nuevo + ': ' + r.ocurrencias + marca);
    });
  });

  ui.alert('Armonizar tokens de plantillas', lineas.join('\n'), ui.ButtonSet.OK);
}
