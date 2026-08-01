/**
 * Pruebas.gs — controles positivos del diff de configuración.
 *
 * Por qué existe (Paso 2.11 C.2, lote del 01/08/2026): **el protocolo de siete pasos pasa
 * igual aunque C.2-2 a C.2-6 estén mal implementadas.** Cero cambios sigue siendo cero
 * cambios. Sin un control que introduzca una discrepancia CONOCIDA y afirme que se
 * detecta, no hay forma de distinguir "anda" de "no miré" — que es exactamente el modo de
 * falla que este paso vino a eliminar del diff.
 *
 * Cada `probar_*()` es un control positivo: arma una discrepancia sintética, afirma que la
 * función bajo prueba la reporta, y afirma también el caso negativo (sin discrepancia, no
 * reporta). **No tocan la planilla**: alimentan las funciones con hojas falsas
 * (`hojaFalsa_`), que es posible porque `calcularDiffUpsert_` y `construirBloqueAlcance_`
 * reciben la hoja/el accessor por parámetro en vez de ir a buscarla adentro. No hay nada
 * que revertir porque no se escribe nada.
 *
 * Se corren desde el menú (Diagnóstico → "Correr pruebas del diff"). Un fallo se reporta
 * con el nombre de la prueba y qué se esperaba.
 */

/**
 * Hoja sintética con la superficie mínima que usan `calcularDiffUpsert_` y
 * `construirBloqueAlcance_`. `matriz[0]` son los encabezados.
 */
function hojaFalsa_(nombre, matriz) {
  return {
    getName: function () { return nombre; },
    getLastRow: function () { return matriz.length; },
    getDataRange: function () {
      return { getValues: function () { return matriz; } };
    }
  };
}

function afirmar_(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

/**
 * Control positivo de C.2-2 — el bloque de alcance distingue "auditada" de "no auditada"
 * y no confunde "cero líneas" con "no la miré".
 */
function probarBloqueDeAlcance_() {
  var hojas = {
    HOJA_AUDITADA: hojaFalsa_('HOJA_AUDITADA', [['clave'], ['a'], ['b']]),
    HOJA_EXCLUIDA: hojaFalsa_('HOJA_EXCLUIDA', [['clave'], ['x']])
    // HOJA_FANTASMA a propósito no está: tiene que salir "la hoja no existe".
  };
  var descriptores = [
    { hoja: 'HOJA_AUDITADA', auditada: true, seed: function () { return [1, 2, 3]; } },
    { hoja: 'HOJA_EXCLUIDA', auditada: false, motivo: 'excluida a propósito' },
    { hoja: 'HOJA_FANTASMA', auditada: true, seed: function () { return [1]; } }
  ];

  var filas = construirBloqueAlcance_(descriptores, function (n) { return hojas[n] || null; });
  afirmar_(filas.length === 3, 'alcance: se esperaban 3 filas, vinieron ' + filas.length);

  // Auditada: sí, con los dos conteos y sin motivo.
  afirmar_(filas[0][1] === 'sí', 'alcance: HOJA_AUDITADA debería decir auditada=sí');
  afirmar_(filas[0][2] === 2, 'alcance: filas_en_hoja debería ser 2 (3 filas menos el encabezado), vino ' + filas[0][2]);
  afirmar_(filas[0][3] === 3, 'alcance: filas_en_seed debería ser 3, vino ' + filas[0][3]);

  // La discrepancia conocida: una hoja excluida NO puede verse igual que una auditada sin cambios.
  afirmar_(filas[1][1] === 'no', 'alcance: HOJA_EXCLUIDA debería decir auditada=no');
  afirmar_(filas[1][4].indexOf('excluida a propósito') === 0, 'alcance: HOJA_EXCLUIDA debería declarar su motivo');

  // Una hoja declarada auditada pero ausente no puede reportarse como auditada.
  afirmar_(filas[2][1] === 'no', 'alcance: una hoja que no existe no puede figurar como auditada');
  afirmar_(filas[2][4].indexOf('la hoja no existe') !== -1, 'alcance: debería decir que la hoja no existe');

  // Y el caso real: MARCADORES tiene que estar en la tabla viva, declarada sin sembrador.
  var marcadores = null;
  ALCANCE_REGISTROS_.forEach(function (d) { if (d.hoja === 'MARCADORES') marcadores = d; });
  afirmar_(marcadores, 'alcance: MARCADORES tiene que estar declarada en ALCANCE_REGISTROS_');
  afirmar_(marcadores.auditada === false, 'alcance: MARCADORES no se audita (no tiene sembrador)');
  afirmar_(marcadores.motivo.indexOf('sin sembrador') !== -1, 'alcance: el motivo de MARCADORES tiene que decir "sin sembrador"');

  return 'C.2-2 bloque de alcance: OK';
}

/**
 * Hoja falsa de SOLAPAS: `leerFilasSolapas_` espera encabezados reales y devuelve un
 * mapa por clave con `.idx`. Se le agrega `getRange` que registra las escrituras en vez
 * de hacerlas, para poder afirmar TAMBIÉN que en modo cálculo no se escribe nada.
 */
function hojaFalsaConEscrituras_(nombre, matriz) {
  var hoja = hojaFalsa_(nombre, matriz);
  hoja.escrituras = [];
  hoja.getRange = function (fila, columna) {
    return {
      setValue: function (v) { hoja.escrituras.push({ fila: fila, columna: columna, valor: v }); }
    };
  };
  return hoja;
}

/**
 * Control positivo de C.2-3 — la migración de S-01 deja de escribir a ciegas.
 *
 * El caso testigo del prompt: `alinearSolapasLookerADinamico_` aparecía en el resumen de
 * TODAS las corridas del protocolo con cero celdas cambiadas, y no había forma de saber
 * si estaba escribiendo o no.
 */
function probarMigracionesEnDiff_() {
  var headers = ['base_id', 'solapa', 'uso', 'origen', 'fila_encabezado', 'firma_encabezado', 'filas_datos', 'filas_crudas', 'notas'];
  var notaS01 = 'Paso 2.9 Parte C — ver docs' + '/SUPUESTOS.md S-01';

  // 1. Fila desalineada: la migración tiene que reportar QUÉ cambia, no un contador.
  var desalineada = hojaFalsaConEscrituras_('SOLAPAS', [
    headers,
    ['looker', 'resumen_metricas_dinamico', 'revisar', 'seed', 1, '', '', '', 'otra cosa']
  ]);
  var r1 = alinearSolapasLookerADinamico_(desalineada, true);
  afirmar_(r1.cambios.length === 3, 'C.2-3: se esperaban 3 celdas (uso, origen, notas), vinieron ' + r1.cambios.length);
  var porColumna = {};
  r1.cambios.forEach(function (c) { porColumna[c.columna] = c; });
  afirmar_(porColumna.uso && porColumna.uso.anterior === 'revisar' && porColumna.uso.nuevo === 'fuente',
    'C.2-3: la línea de uso tiene que decir de revisar a fuente');
  afirmar_(porColumna.uso.pisaManual === false, 'C.2-3: origen=seed no es pisar manual');
  afirmar_(desalineada.escrituras.length === 3, 'C.2-3: con aplicar=true tiene que escribir las 3 celdas');

  // 2. Ya alineada: CERO líneas. Esta es la que fallaba antes — reportaba 2 siempre.
  var alineada = hojaFalsaConEscrituras_('SOLAPAS', [
    headers,
    ['looker', 'resumen_metricas_dinamico', 'fuente', 'manual', 1, '', '', '', notaS01],
    ['looker', 'resumen_metricas', 'derivada', 'manual', 1, '', '', '', notaS01]
  ]);
  var r2 = alinearSolapasLookerADinamico_(alineada, true);
  afirmar_(r2.cambios.length === 0, 'C.2-3: una hoja ya alineada no puede reportar cambios, vinieron ' + r2.cambios.length);
  afirmar_(alineada.escrituras.length === 0, 'C.2-3: una hoja ya alineada no puede recibir escrituras');

  // 3. Pisando una fila puesta a mano: tiene que decirlo.
  var manual = hojaFalsaConEscrituras_('SOLAPAS', [
    headers,
    ['looker', 'resumen_metricas_dinamico', 'ignorar', 'manual', 1, '', '', '', 'lo puso una persona']
  ]);
  var r3 = alinearSolapasLookerADinamico_(manual, true);
  afirmar_(r3.cambios.length > 0, 'C.2-3: debería reportar que pisa la fila manual');
  afirmar_(r3.cambios[0].pisaManual === true, 'C.2-3: tiene que marcar pisaManual sobre una fila origen=manual');

  // 4. Modo cálculo (aplicar=false): reporta lo mismo y NO escribe. Es lo que usa
  //    "Estado de configuración" para incluir las migraciones pendientes.
  var simulada = hojaFalsaConEscrituras_('SOLAPAS', [
    headers,
    ['looker', 'resumen_metricas_dinamico', 'revisar', 'seed', 1, '', '', '', 'otra cosa']
  ]);
  var r4 = alinearSolapasLookerADinamico_(simulada, false);
  afirmar_(r4.cambios.length === 3, 'C.2-3: en modo cálculo tiene que reportar los mismos 3 cambios');
  afirmar_(simulada.escrituras.length === 0, 'C.2-3: en modo cálculo NO puede escribir ninguna celda');

  // 5. Las filas del diff llevan tipo migracion, y "pisa manual" cuando corresponde.
  var filas = filasDiffMigraciones_([{ hoja: 'SOLAPAS', nombre: 'S-01', cambios: r3.cambios }]);
  afirmar_(filas.length === r3.cambios.length, 'C.2-3: cada cambio de migración es una fila del diff');
  afirmar_(filas[0][1] === 'migracion (pisa manual)', 'C.2-3: el tipo tiene que declarar que pisa manual, vino ' + filas[0][1]);

  // 6. Una fila protegida por el seed pero modificada por una migración no puede salir
  //    reportada como "protegida" a secas.
  var tocadas = clavesTocadasPorMigracion_([{ hoja: 'SOLAPAS', nombre: 'S-01', cambios: r3.cambios }], 'SOLAPAS');
  var filasSolapas = filasDiffParaHoja_('SOLAPAS', { protegidas: ['looker||resumen_metricas_dinamico'] }, tocadas);
  afirmar_(filasSolapas[0][1].indexOf('modificada por una migración') !== -1,
    'C.2-3: una fila protegida y a la vez modificada tiene que decirlo, vino ' + filasSolapas[0][1]);

  return 'C.2-3 migraciones por el diff: OK';
}

/**
 * Corre todas las pruebas y devuelve el texto del reporte. Sin `alert()` acá adentro para
 * poder llamarla también desde otro lado.
 */
function correrPruebasDiff_() {
  var pruebas = [
    probarBloqueDeAlcance_,
    probarMigracionesEnDiff_
  ];
  var lineas = [];
  var fallas = 0;
  pruebas.forEach(function (p) {
    try {
      lineas.push('✅ ' + p());
    } catch (e) {
      fallas++;
      lineas.push('❌ ' + (e && e.message ? e.message : e));
    }
  });
  lineas.push('', fallas === 0
    ? 'Las ' + pruebas.length + ' pruebas pasaron.'
    : fallas + ' de ' + pruebas.length + ' fallaron.');
  return lineas.join('\n');
}

function menuCorrerPruebasDiff_() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('Pruebas del diff de configuración', correrPruebasDiff_(), ui.ButtonSet.OK);
}
