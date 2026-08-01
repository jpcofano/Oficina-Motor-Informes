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
 * Corre todas las pruebas y devuelve el texto del reporte. Sin `alert()` acá adentro para
 * poder llamarla también desde otro lado.
 */
function correrPruebasDiff_() {
  var pruebas = [
    probarBloqueDeAlcance_
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
