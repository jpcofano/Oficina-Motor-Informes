/**
 * Solapas.gs — Paso 2.6 Parte C: `inventariarSolapas()`.
 * Ver docs/Prompts/Paso-2.6_registro_solapas.md y docs/Prompts/Paso-2.7_destrabar_solapas.md.
 *
 * Recorre las bases activas y hace upsert en la hoja SOLAPAS por (base_id, solapa),
 * misma lógica que el resto del motor: descubre, no cablea.
 *   - solapa que no estaba registrada  -> se agrega con uso='revisar' (el default
 *     seguro de todo lo nuevo), origen='auto' y notas='detectada <fecha>'.
 *   - solapa que ya estaba registrada  -> se actualiza SOLO filas_datos y
 *     filas_crudas (Paso 2.10 Parte B). NO toca `uso` ni `origen`, pase lo que
 *     pase (Paso 2.7 Parte A regla 3) — para pisar una clasificación hace falta
 *     `sembrarClasificacionSolapas()` (Instalar.gs), que sí distingue `origen`
 *     y es una siembra explícita y separada.
 *   - solapa registrada que ya no aparece en el archivo -> no se borra: se marca
 *     notas='NO ENCONTRADA <fecha>' y sale ⚠ en el reporte.
 *
 * `origen` (Paso 2.7 Parte A) distingue quién escribió `uso` por última vez:
 * 'auto' (este inventario) / 'seed' (la siembra propuesta) / 'manual' (una persona
 * lo tipeó en la hoja). Es la única forma de que la siembra sepa qué puede pisar sin
 * depender del texto libre de `notas`. Asimetría documentada a propósito: 'auto' y
 * 'seed' se pisan en una re-siembra; 'manual' nunca — quien quiera blindar una fila,
 * escribe `manual` a mano en esa columna.
 *
 * Expone inventariarSolapas() y el menú "Inventariar solapas".
 */

/**
 * Paso 2.11 Parte B — contenido legible de la fila que `fila_encabezado` señala, para
 * que una fila_encabezado mal puesta se vea a simple vista en `SOLAPAS.firma_encabezado`
 * (ej. "3387-JULJDGGC · 44043 · ..." en vez de "ID Cuentas · ID MailUp · ...") en vez de
 * fallar en silencio río abajo. `fila<=0` es "sin fila de títulos" (ver `filaSolapa_`,
 * Instalar.gs) — no hay nada que leer, se documenta así, no como vacío.
 */
function leerFirmaEncabezado_(hojaSheet, fila) {
  if (!fila || fila <= 0) return '(sin fila de títulos)';
  if (fila > hojaSheet.getLastRow()) return '';
  var ultimaCol = hojaSheet.getLastColumn();
  if (!ultimaCol) return '';
  var valores = hojaSheet.getRange(fila, 1, 1, ultimaCol).getValues()[0];
  return valores
    .map(function (v) { return (v === null || v === undefined) ? '' : String(v).trim(); })
    .filter(function (v) { return v !== ''; })
    .join(' · ');
}

function inventariarSolapas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName('SOLAPAS');
  if (!hoja) {
    return { ok: false, motivo: 'La hoja SOLAPAS no existe. Corré "Instalar / reparar hojas" primero.' };
  }

  var bases = leerBases();
  var fecha = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  var existentes = leerFilasSolapas_(hoja);

  var vivas = {};           // 'base_id||solapa' -> true, solo de bases evaluadas esta corrida
  var basesEvaluadas = {};  // base_id -> true, se pudo abrir el archivo esta corrida
  var nuevas = [];
  var actualizadas = 0;
  var basesSinAcceso = [];

  Object.keys(bases).forEach(function (baseId) {
    var base = bases[baseId];
    if (!base.activo || !base.sheet_id) return;

    var libro;
    try {
      libro = SpreadsheetApp.openById(base.sheet_id);
    } catch (e) {
      basesSinAcceso.push(baseId + ': ' + e.message);
      return;
    }
    basesEvaluadas[baseId] = true;

    libro.getSheets().forEach(function (hojaSheet) {
      var nombre = hojaSheet.getName();
      var clave = baseId + '||' + nombre;
      vivas[clave] = true;

      // Paso 2.10 Parte B: `getLastRow()-1` cuenta relleno de fórmula como si
      // fuera dato (una fórmula que evalúa a "" sigue extendiendo getLastRow()).
      // `filas_crudas` conserva ese valor viejo como referencia; `filas_datos`
      // pasa a contar filas con alguna celda no vacía tras trim(), sobre TODO
      // el rango — incluye encabezados y banners de período a propósito, porque
      // separar eso depende de detectar encabezado por solapa (no todas lo
      // tienen, ej. `Mail per`). La diferencia entre las dos columnas ES el
      // diagnóstico: no perderla resumiéndola en una sola.
      var filasCrudas = hojaSheet.getLastRow();
      var valoresHoja = hojaSheet.getDataRange().getValues();
      var filasDatos = 0;
      valoresHoja.forEach(function (fila) {
        if (!filaVacia_(fila)) filasDatos++;
      });
      var existente = existentes[clave];

      if (!existente) {
        // Sin fila_encabezado declarada todavía: se lee la 1 como mejor default para
        // dar una primera pista (el clasificador humano corrige si hace falta).
        nuevas.push({
          base_id: baseId,
          solapa: nombre,
          uso: 'revisar',
          origen: 'auto',
          fila_encabezado: '',
          firma_encabezado: leerFirmaEncabezado_(hojaSheet, 1),
          filas_datos: filasDatos,
          filas_crudas: filasCrudas,
          notas: 'detectada ' + fecha
        });
      } else {
        // Paso 2.11 Parte B: se lee la fila_encabezado YA declarada en SOLAPAS, no un
        // default — es lo que hace visible una fila_encabezado mal puesta. Blanco
        // (todavía sin clasificar) cae a la fila 1 como mejor pista, igual que una
        // solapa nueva; 0 explícito SÍ se respeta como "sin fila de títulos".
        var feDeclarada = existente.fila_encabezado;
        var feParaFirma = (feDeclarada === '' || feDeclarada === null || feDeclarada === undefined) ? 1 : Number(feDeclarada);
        var firma = leerFirmaEncabezado_(hojaSheet, feParaFirma);
        hoja.getRange(existente.fila, existente.idx.filas_datos + 1).setValue(filasDatos);
        hoja.getRange(existente.fila, existente.idx.filas_crudas + 1).setValue(filasCrudas);
        hoja.getRange(existente.fila, existente.idx.firma_encabezado + 1).setValue(firma);
        actualizadas++;
      }
    });
  });

  if (nuevas.length) {
    var headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
    var filasNuevas = nuevas.map(function (fila) {
      return headers.map(function (h) { return (h in fila) ? fila[h] : ''; });
    });
    hoja.getRange(hoja.getLastRow() + 1, 1, filasNuevas.length, headers.length).setValues(filasNuevas);
  }

  // Registradas pero ausentes del archivo en esta corrida: no se borran, se marcan.
  // Solo para bases que sí se pudieron abrir — si una base entera no respondió o
  // está inactiva, sus solapas registradas quedan como estaban, no se asume nada.
  var noEncontradas = [];
  Object.keys(existentes).forEach(function (clave) {
    if (vivas[clave]) return;
    var baseId = clave.split('||')[0];
    if (!basesEvaluadas[baseId]) return;

    var existente = existentes[clave];
    noEncontradas.push(clave);
    if (typeof existente.notas === 'string' && existente.notas.indexOf('NO ENCONTRADA') === 0) return; // ya estaba marcada
    hoja.getRange(existente.fila, existente.idx.notas + 1).setValue('NO ENCONTRADA ' + fecha);
  });

  return {
    ok: true,
    nuevas: nuevas.length,
    actualizadas: actualizadas,
    noEncontradas: noEncontradas,
    basesSinAcceso: basesSinAcceso
  };
}

/**
 * Lee las filas actuales de SOLAPAS indexadas por (base_id, solapa): número de fila
 * real en la hoja (1-based), el mapa completo de índices de columna por nombre de
 * encabezado (`idx`, para que el llamador pueda tocar cualquier columna sin
 * reescribir la fila entera) y los valores de `uso`/`origen`/`notas`, que son los
 * que `inventariarSolapas()` y `sembrarClasificacionSolapas()` (Instalar.gs)
 * necesitan para decidir qué pisar.
 */
function leerFilasSolapas_(hoja) {
  var datos = hoja.getDataRange().getValues();
  var headers = datos[0];
  var idx = {};
  headers.forEach(function (h, i) { idx[h] = i; });

  var registro = {};
  for (var f = 1; f < datos.length; f++) {
    var fila = datos[f];
    var baseId = fila[idx.base_id];
    var solapa = fila[idx.solapa];
    if (!baseId || !solapa) continue;

    registro[baseId + '||' + solapa] = {
      fila: f + 1,
      idx: idx,
      uso: fila[idx.uso],
      origen: fila[idx.origen],
      fila_encabezado: fila[idx.fila_encabezado],
      // `_23` — las cuatro columnas que el sembrador NO es dueño de escribir, expuestas para
      // que pueda devolverlas tal cual. Ver el comentario de `aplicarClasificacionSolapas_`:
      // `upsertPorClave_` reescribe la fila entera, así que «no incluirlas» las blanquea.
      firma_encabezado: fila[idx.firma_encabezado],
      filas_datos: fila[idx.filas_datos],
      filas_crudas: fila[idx.filas_crudas],
      filas_minimas: fila[idx.filas_minimas],
      // `_23` — la lee `aplicarClasificacionSolapas_` para el diff de una fila protegida
      // (`origen=manual`): sin esto, una `ventana_ref` tipeada a mano que difiera del seed
      // se salteaba **sin salir en el reporte**, que es la mitad de lo que arregló `C.2-4`.
      ventana_ref: fila[idx.ventana_ref],
      notas: fila[idx.notas]
    };
  }
  return registro;
}

function menuInventariarSolapas_() {
  var ui = ui_();
  var resultado = inventariarSolapas();

  if (!resultado.ok) {
    ui.alert('No se pudo inventariar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [
    'Solapas nuevas (uso=revisar): ' + resultado.nuevas,
    'Solapas ya registradas — filas_datos actualizado: ' + resultado.actualizadas
  ];

  if (resultado.noEncontradas.length) {
    lineas.push('', '⚠ Registradas en SOLAPAS pero no encontradas en el archivo (no se borran):');
    lineas = lineas.concat(resultado.noEncontradas.map(function (c) { return '  · ' + c.replace('||', '/'); }));
  }

  if (resultado.basesSinAcceso.length) {
    lineas.push('', 'Bases sin acceso:');
    lineas = lineas.concat(resultado.basesSinAcceso.map(function (m) { return '⚠️ ' + m; }));
  }

  lineas.push('', 'Detalle completo en la hoja SOLAPAS. Las filas nuevas quedan en uso=revisar hasta que alguien las clasifique.');

  ui.alert('Inventario de solapas', lineas.join('\n'), ui.ButtonSet.OK);
}

/**
 * Paso 2.6 Parte G — `looker` tiene DOS hojas de resumen conviviendo en el mismo
 * archivo: `resumen_metricas_dinamico` y `resumen_metricas`. `hoja_default` (BASES)
 * apunta a `resumen_metricas`, pero `DIAG_FECHAS` del 30/07 y la metadata de Drive
 * vieron `_dinamico` como primera solapa, y las letras de columna que carga `MAPEO`
 * (`SEED_MAPEO_`, Instalar.gs) corresponden a `_dinamico`. Antes de aplicar DOC-3
 * Parte A hace falta saber si tienen el mismo orden de columnas: si no, `MAPEO` está
 * leyendo la solapa equivocada por letra, sin fallar. Esta función solo describe
 * (fila 1 + conteo de filas de las dos) — no decide cuál queda `fuente` en SOLAPAS,
 * esa decisión es del usuario (ver Plan Inicial/PROYECTO.md §5).
 */
function compararResumenesLooker_() {
  var bases = leerBases();
  var base = bases.looker;
  if (!base || !base.sheet_id) {
    return { ok: false, motivo: 'La base "looker" no está configurada (sin sheet_id).' };
  }

  var libro;
  try {
    libro = SpreadsheetApp.openById(base.sheet_id);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir looker: ' + e.message };
  }

  var nombres = ['resumen_metricas_dinamico', 'resumen_metricas'];
  var filas = nombres.map(function (nombre) {
    var hoja = libro.getSheetByName(nombre);
    if (!hoja) return { solapa: nombre, estado: 'no existe' };

    var ultimaCol = hoja.getLastColumn();
    var headers = ultimaCol ? hoja.getRange(1, 1, 1, ultimaCol).getValues()[0] : [];
    return {
      solapa: nombre,
      estado: 'existe',
      es_hoja_default: nombre === base.hoja_default ? 'sí' : '',
      filas_de_datos: Math.max(hoja.getLastRow() - 1, 0),
      encabezado_fila1: headers.join(' | ')
    };
  });

  var existen = filas.filter(function (f) { return f.estado === 'existe'; });
  var mismoOrdenColumnas = existen.length === 2 ? (existen[0].encabezado_fila1 === existen[1].encabezado_fila1) : null;

  return { ok: true, filas: filas, mismoOrdenColumnas: mismoOrdenColumnas };
}

function menuCompararResumenesLooker_() {
  var ui = ui_();
  var resultado = compararResumenesLooker_();

  if (!resultado.ok) {
    ui.alert('No se pudo comparar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [];
  resultado.filas.forEach(function (f) {
    if (f.estado !== 'existe') {
      lineas.push('⚠ ' + f.solapa + ' — ' + f.estado);
      return;
    }
    lineas.push((f.es_hoja_default === 'sí' ? '★ ' : '  ') + f.solapa +
      ' (hoja_default=' + (f.es_hoja_default || 'no') + ') — ' + f.filas_de_datos + ' filas de datos');
    lineas.push('    ' + f.encabezado_fila1);
  });

  lineas.push('');
  if (resultado.mismoOrdenColumnas === true) {
    lineas.push('✅ Mismo orden de columnas en las dos — MAPEO por letra apunta a la solapa correcta en cualquiera de las dos.');
  } else if (resultado.mismoOrdenColumnas === false) {
    lineas.push('⚠ Orden de columnas DISTINTO entre las dos — si MAPEO sigue leyendo por letra la solapa equivocada, ' +
      'todo lo leído de looker hasta hoy salió de la columna de al lado, sin fallar. Falta decidir cuál queda ' +
      'uso=fuente en SOLAPAS antes de tocar DOC-3 Parte A.');
  }

  ui.alert('looker: resumen_metricas vs resumen_metricas_dinamico', lineas.join('\n'), ui.ButtonSet.OK);
}

/**
 * Paso 2.7 Parte D / Paso 2.8 Parte C — `MAPEO` tiene los ~25 campos de `looker`
 * partidos entre las dos solapas (Parte B de Paso 2.8: 24 en `resumen_metricas`,
 * `fecha_periodo` movida ahí también, provisorio). Encabezados y conteos son
 * idénticos (903 filas, mismo orden de columnas — `compararResumenesLooker_` de
 * arriba lo confirma), así que no hay riesgo de leer la columna equivocada, pero
 * obliga a declarar `fuente` a las dos, justo lo que `SOLAPAS` busca evitar.
 *
 * Test para decidir cuál es la fuente real: `getFormulas()` sobre las filas **2 a
 * 4** de cada una (Paso 2.8 Parte C amplía de "solo fila 2", Paso 2.7 Parte D, para
 * no decidir con una sola fila que puede ser una excepción). La que tiene fórmulas
 * es la derivada (se recalcula a partir de la otra); la que tiene valores planos es
 * la fuente. Si las DOS tienen valores planos, no hay vínculo entre ellas — no se
 * puede decidir por código, hay que preguntarle al dueño
 * (`dgples.comunicacion@gmail.com`) cuál actualiza. Cada celda con fórmula se
 * registra con su literal (`celdasConFormula`) y se vuelca completo a Logger.log
 * — el resumen de la UI solo lista las celdas que tienen fórmula, no las ~30×3
 * que no.
 */
var FILAS_TEST_FORMULAS_LOOKER_ = [2, 3, 4];

/**
 * ⚠ INFERENCIA INVERTIDA — NO USAR. Fuera del menú desde el 01/08/2026 (Paso 2.11
 * Parte E). Ver el P1 en `docs/PENDIENTES_consistencia.md`.
 *
 * El párrafo de arriba dice "la que tiene fórmulas es la derivada". **Es falso para
 * este caso.** La fórmula de `resumen_metricas_dinamico` es
 * `=QUERY(Cuentas!A2:G; …)`: consulta una TERCERA hoja, no la otra del par — o sea
 * que es la consulta **viva**, la fuente. `resumen_metricas` es el pegado congelado.
 * Corrido el 01/08 devuelve `fuente: 'resumen_metricas'`, exactamente al revés de
 * S-01 (`docs/SUPUESTOS.md`), y con esa dirección alimentaba a
 * `consolidarMapeoLooker_`.
 *
 * Acierta el hecho ("hay una fórmula") y erra la inferencia ("por lo tanto deriva de
 * la otra hoja del par"). Es el caso que dejó escrita la regla de `CLAUDE.md` §4:
 * cuando un instrumento devuelve una etiqueta, verificar el dato crudo del que salió.
 * El literal de la fórmula ya estaba en `celdasConFormula` desde el Paso 2.8 —
 * faltaba mirarlo.
 */
function auditarFormulasResumenesLooker_() {
  var bases = leerBases();
  var base = bases.looker;
  if (!base || !base.sheet_id) {
    return { ok: false, motivo: 'La base "looker" no está configurada (sin sheet_id).' };
  }

  var libro;
  try {
    libro = SpreadsheetApp.openById(base.sheet_id);
  } catch (e) {
    return { ok: false, motivo: 'No se pudo abrir looker: ' + e.message };
  }

  var nombres = ['resumen_metricas_dinamico', 'resumen_metricas'];
  var info = {};
  for (var i = 0; i < nombres.length; i++) {
    var hoja = libro.getSheetByName(nombres[i]);
    if (!hoja) return { ok: false, motivo: 'No existe la solapa "' + nombres[i] + '" en looker.' };
    if (hoja.getLastRow() < 2) return { ok: false, motivo: 'La solapa "' + nombres[i] + '" no tiene fila 2 (sin datos).' };

    var ultimaCol = hoja.getLastColumn();
    var headers = hoja.getRange(1, 1, 1, ultimaCol).getValues()[0];
    var celdasConFormula = [];

    FILAS_TEST_FORMULAS_LOOKER_.forEach(function (fila) {
      if (fila > hoja.getLastRow()) return; // menos de 4 filas de datos
      var formulasFila = hoja.getRange(fila, 1, 1, ultimaCol).getFormulas()[0];
      formulasFila.forEach(function (formula, col) {
        if (formula && formula.length > 0) {
          celdasConFormula.push({ fila: fila, columna: indiceAColumnaLetra_(col), header: headers[col], formula: formula });
        }
      });
    });

    Logger.log('auditarFormulasResumenesLooker_ — ' + nombres[i] + ': ' +
      (celdasConFormula.length
        ? celdasConFormula.length + ' celda(s) con fórmula — ' +
          celdasConFormula.map(function (c) { return 'fila' + c.fila + '/' + c.columna + '(' + c.header + ')=' + c.formula; }).join(' | ')
        : 'sin fórmulas en filas ' + FILAS_TEST_FORMULAS_LOOKER_.join(',')));

    info[nombres[i]] = { hoja: hoja, celdasConFormula: celdasConFormula, tieneFormulas: celdasConFormula.length > 0 };
  }

  var dinamico = info['resumen_metricas_dinamico'];
  var plana = info['resumen_metricas'];

  if (dinamico.tieneFormulas && !plana.tieneFormulas) {
    return {
      ok: true, estado: 'una_es_derivada', derivada: 'resumen_metricas_dinamico', fuente: 'resumen_metricas',
      celdasConFormula: dinamico.celdasConFormula,
      recomendacion: '"resumen_metricas_dinamico" tiene fórmulas en filas 2-4 (derivada); "resumen_metricas" tiene valores planos (fuente).'
    };
  }
  if (plana.tieneFormulas && !dinamico.tieneFormulas) {
    return {
      ok: true, estado: 'una_es_derivada', derivada: 'resumen_metricas', fuente: 'resumen_metricas_dinamico',
      celdasConFormula: plana.celdasConFormula,
      recomendacion: '"resumen_metricas" tiene fórmulas en filas 2-4 (derivada); "resumen_metricas_dinamico" tiene valores planos (fuente).'
    };
  }
  if (!dinamico.tieneFormulas && !plana.tieneFormulas) {
    var muestraDinamico = dinamico.hoja.getRange(2, 1, Math.min(4, dinamico.hoja.getLastRow() - 1), 1).getValues().map(function (r) { return r[0]; });
    var muestraPlana = plana.hoja.getRange(2, 1, Math.min(4, plana.hoja.getLastRow() - 1), 1).getValues().map(function (r) { return r[0]; });
    var difierenYa = JSON.stringify(muestraDinamico) !== JSON.stringify(muestraPlana);

    return {
      ok: true,
      estado: 'ambas_valores_planos',
      muestraDinamico: muestraDinamico,
      muestraPlana: muestraPlana,
      difierenYa: difierenYa,
      recomendacion: 'Las dos hojas tienen valores planos en filas 2-4 — no hay vínculo de fórmula entre ellas. ' +
        (difierenYa
          ? '⚠ Los primeros id_cuentas YA difieren entre las dos — la pregunta de cuál actualiza es urgente.'
          : 'Los primeros id_cuentas coinciden hoy, pero eso no prueba que se actualicen juntas.') +
        ' No se puede decidir por código: preguntale al dueño (dgples.comunicacion@gmail.com) cuál mantiene.'
    };
  }

  return {
    ok: true,
    estado: 'ambas_formulas',
    celdasConFormulaDinamico: dinamico.celdasConFormula,
    celdasConFormulaPlana: plana.celdasConFormula,
    recomendacion: 'Las dos hojas tienen fórmulas en filas 2-4 — caso no previsto por el prompt. Revisar a mano (detalle en Logger).'
  };
}

/** ⚠ Sin ítem de menú desde el 01/08/2026 (Paso 2.11 Parte E) — ver el encabezado de
 *  `auditarFormulasResumenesLooker_`. No se borra: es la vía de re-lectura si algún día
 *  se arregla la inferencia. Su texto de cierre manda a correr la consolidación, que es
 *  justamente lo que no hay que hacer con la dirección actual. */
function menuAuditarFormulasResumenesLooker_() {
  var ui = ui_();
  var resultado = auditarFormulasResumenesLooker_();

  if (!resultado.ok) {
    ui.alert('No se pudo auditar', resultado.motivo, ui.ButtonSet.OK);
    return;
  }

  var lineas = [resultado.recomendacion];
  if (resultado.estado === 'una_es_derivada') {
    lineas.push('', 'Celdas con fórmula en "' + resultado.derivada + '":');
    resultado.celdasConFormula.forEach(function (c) {
      lineas.push('  fila ' + c.fila + ', ' + c.columna + ' (' + c.header + '): ' + c.formula);
    });
    lineas.push('', 'Correr "Consolidar mapeos de looker (Parte D)" para aplicar esta decisión.');
  } else if (resultado.estado === 'ambas_valores_planos') {
    lineas.push('', 'Primeros id_cuentas de resumen_metricas_dinamico: ' + resultado.muestraDinamico.join(', '));
    lineas.push('Primeros id_cuentas de resumen_metricas: ' + resultado.muestraPlana.join(', '));
  }
  lineas.push('', 'Detalle completo (todas las celdas revisadas, filas 2-4) en Ver → Registros de ejecución.');

  ui.alert('Auditoría de fórmulas — resúmenes de looker (Parte C/D)', lineas.join('\n'), ui.ButtonSet.OK);
}

/**
 * ⚠ MIGRACIÓN EJECUTADA (S-01 aplicado). Fuera del menú desde el 01/08/2026
 * (Paso 2.11 Parte E). **No re-invocar sin arreglar antes el P1 de
 * `auditarFormulasResumenesLooker_`** (`docs/PENDIENTES_consistencia.md`): ese
 * diagnóstico es el que le pasaba `hojaFuente`/`hojaDerivada`, y devuelve la
 * dirección INVERTIDA — un click revertía S-01 sobre las tres hojas.
 *
 * No se borra. Está **parametrizada por dirección**, así que sigue siendo la única
 * forma de mover la decisión sin tocar código si el dueño externo cambia cuál de
 * las dos hojas mantiene. Verificado el 01/08 contra `docs/_snapshots/`: la
 * consolidación ya está hecha (27/27 filas de `MAPEO` en `_dinamico`, `SOLAPAS` y
 * `BASES.hoja_default` alineadas), y la sostienen en cada corrida las tres
 * migraciones idempotentes `alinear*LookerADinamico_`/`alinearBasesHojaDefaultLooker_`
 * de `Instalar.gs`.
 *
 * Qué hace: mueve las filas de `MAPEO` de `looker` que cuelgan de `hojaDerivada` a
 * `hojaFuente`, marca `hojaDerivada` como `uso=derivada` y `hojaFuente` como
 * `uso=fuente` en `SOLAPAS` (con `origen=manual`), y alinea `BASES.hoja_default`.
 */
function consolidarMapeoLooker_(hojaFuente, hojaDerivada) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var hojaMapeo = ss.getSheetByName('MAPEO');
  var datosMapeo = hojaMapeo.getDataRange().getValues();
  var headersMapeo = datosMapeo[0];
  var idxBaseId = headersMapeo.indexOf('base_id');
  var idxSolapa = headersMapeo.indexOf('solapa');
  var idxHoja = headersMapeo.indexOf('hoja');

  var filasMovidas = 0;
  for (var f = 1; f < datosMapeo.length; f++) {
    if (datosMapeo[f][idxBaseId] === 'looker' && datosMapeo[f][idxSolapa] === hojaDerivada) {
      hojaMapeo.getRange(f + 1, idxSolapa + 1).setValue(hojaFuente);
      hojaMapeo.getRange(f + 1, idxHoja + 1).setValue(hojaFuente);
      filasMovidas++;
    }
  }

  var hojaSolapas = ss.getSheetByName('SOLAPAS');
  var existentesSolapas = leerFilasSolapas_(hojaSolapas);
  var notaConsolidacion = 'Paso 2.7 Parte D: consolidado por getFormulas() — ';

  var filaDerivada = existentesSolapas['looker||' + hojaDerivada];
  if (filaDerivada) {
    hojaSolapas.getRange(filaDerivada.fila, filaDerivada.idx.uso + 1).setValue('derivada');
    hojaSolapas.getRange(filaDerivada.fila, filaDerivada.idx.origen + 1).setValue('manual');
    hojaSolapas.getRange(filaDerivada.fila, filaDerivada.idx.notas + 1).setValue(notaConsolidacion + 'MAPEO movido a ' + hojaFuente);
  }
  var filaFuente = existentesSolapas['looker||' + hojaFuente];
  if (filaFuente) {
    hojaSolapas.getRange(filaFuente.fila, filaFuente.idx.uso + 1).setValue('fuente');
    hojaSolapas.getRange(filaFuente.fila, filaFuente.idx.origen + 1).setValue('manual');
    hojaSolapas.getRange(filaFuente.fila, filaFuente.idx.notas + 1).setValue(notaConsolidacion + 'recibe los mapeos de ' + hojaDerivada);
  }

  var hojaBases = ss.getSheetByName('BASES');
  var datosBases = hojaBases.getDataRange().getValues();
  var headersBases = datosBases[0];
  var idxBaseIdBases = headersBases.indexOf('base_id');
  var idxHojaDefault = headersBases.indexOf('hoja_default');
  for (var b = 1; b < datosBases.length; b++) {
    if (datosBases[b][idxBaseIdBases] === 'looker') {
      hojaBases.getRange(b + 1, idxHojaDefault + 1).setValue(hojaFuente);
      break;
    }
  }

  return { filasMovidas: filasMovidas };
}

/** ⚠ Sin ítem de menú desde el 01/08/2026 (Paso 2.11 Parte E) — ver el encabezado de
 *  `consolidarMapeoLooker_`. Era la única vía de invocación, y derivaba la dirección de
 *  `auditarFormulasResumenesLooker_`, que la devuelve invertida. No se borra. */
function menuConsolidarMapeoLooker_() {
  var ui = ui_();
  var diagnostico = auditarFormulasResumenesLooker_();

  if (!diagnostico.ok) {
    ui.alert('No se pudo diagnosticar', diagnostico.motivo, ui.ButtonSet.OK);
    return;
  }
  if (diagnostico.estado !== 'una_es_derivada') {
    ui.alert('Sin decisión automática — Parte D', diagnostico.recomendacion, ui.ButtonSet.OK);
    return; // Parte D: si las dos tienen valores planos, no se decide acá, se pregunta al dueño.
  }

  var confirmacion = ui.alert(
    'Consolidar MAPEO de looker',
    diagnostico.recomendacion + '\n\nSe van a mover las filas de MAPEO de looker a "' + diagnostico.fuente +
      '", marcar "' + diagnostico.derivada + '" como uso=derivada en SOLAPAS, y alinear BASES.hoja_default. ¿Confirmás?',
    ui.ButtonSet.YES_NO
  );
  if (confirmacion !== ui.Button.YES) return;

  var resultado = consolidarMapeoLooker_(diagnostico.fuente, diagnostico.derivada);
  ui.alert(
    'Looker consolidado',
    'MAPEO — filas movidas a "' + diagnostico.fuente + '": ' + resultado.filasMovidas +
      '\nSOLAPAS — "' + diagnostico.derivada + '" = derivada, "' + diagnostico.fuente + '" = fuente (origen=manual).' +
      '\nBASES.hoja_default (looker) = "' + diagnostico.fuente + '".' +
      '\n\nPendiente (Parte D, punto 4): dejar escrito en PROYECTO.md por qué DOC-3 Parte A se cierra así.',
    ui.ButtonSet.OK
  );
}
