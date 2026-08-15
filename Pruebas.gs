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
/**
 * ⚠ **Actualizado el 02/08/2026 (Paso 2.14) al contrato que dejó el Paso 2.11 Parte E.**
 * No se ajustó la prueba al código porque sí — una prueba que se acomoda sin decir por qué
 * deja de ser control. Qué cambió y por qué:
 *
 * `alinearSolapasLookerADinamico_` **tocaba tres columnas** (`uso`, `origen`, `notas`) y
 * ahora toca **dos como máximo** (`uso`, `origen`), casi siempre una. La Parte E le sacó
 * `notas` —es del `SEED_SOLAPAS_`, y escribirla desde los dos lados congelaba la peor
 * versión— y le cambió el `origen` deseado de `'manual'` a `'seed'`, porque ese `manual` era
 * vestigial: lo ponía la propia migración y su único efecto vivo era bloquear al sembrador.
 * Evidencia: bajó el piso de `protegidas (con diferencia)` de 10 a 8, con dos corridas
 * idénticas (`docs/BITACORA.md`, Paso 2.11 Parte E).
 *
 * **Esta prueba estuvo fallando un día entero sin que nadie lo viera**, y es el origen de la
 * regla de `CLAUDE.md` §4: *quien toca una función con control positivo corre los controles
 * antes de cerrar*. El protocolo de siete pasos pasa igual aunque los cinco controles estén
 * mal — por eso existen, y por eso no alcanza con verificar contra la planilla.
 */
function probarMigracionesEnDiff_() {
  var headers = ['base_id', 'solapa', 'uso', 'origen', 'fila_encabezado', 'firma_encabezado', 'filas_datos', 'filas_crudas', 'notas'];
  var notaSeed = 'la que quiera el SEED_SOLAPAS_';

  // 1. Fila desalineada en las DOS columnas que la migración sostiene: tiene que reportar
  //    QUÉ cambia, no un contador. `notas` va distinta a propósito y NO debe aparecer.
  var desalineada = hojaFalsaConEscrituras_('SOLAPAS', [
    headers,
    ['looker', 'resumen_metricas_dinamico', 'revisar', 'auto', 1, '', '', '', 'otra cosa']
  ]);
  var r1 = alinearSolapasLookerADinamico_(desalineada, true);
  afirmar_(r1.cambios.length === 2, 'C.2-3: se esperaban 2 celdas (uso, origen), vinieron ' + r1.cambios.length);
  var porColumna = {};
  r1.cambios.forEach(function (c) { porColumna[c.columna] = c; });
  afirmar_(porColumna.uso && porColumna.uso.anterior === 'revisar' && porColumna.uso.nuevo === 'fuente',
    'C.2-3: la línea de uso tiene que decir de revisar a fuente');
  afirmar_(porColumna.origen && porColumna.origen.nuevo === 'seed',
    'C.2-3: la migración devuelve la fila al sembrador (origen=seed), no la blinda como manual');
  afirmar_(!porColumna.notas, 'C.2-3: `notas` es del SEED_SOLAPAS_ — la migración no puede tocarla (Parte E)');
  afirmar_(porColumna.uso.pisaManual === false, 'C.2-3: origen=auto no es pisar manual');
  afirmar_(desalineada.escrituras.length === 2, 'C.2-3: con aplicar=true tiene que escribir las 2 celdas');

  // 2. Ya alineada: CERO líneas. Sigue siendo el caso que más importa —antes reportaba 2
  //    siempre— y ahora "alineada" quiere decir uso+origen, con la nota que sea.
  var alineada = hojaFalsaConEscrituras_('SOLAPAS', [
    headers,
    ['looker', 'resumen_metricas_dinamico', 'fuente', 'seed', 1, '', '', '', notaSeed],
    ['looker', 'resumen_metricas', 'derivada', 'seed', 1, '', '', '', 'otra nota cualquiera']
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
  // Parte E: sobre una fila `manual` la migración además la DEVUELVE al sembrador. Es un
  // cambio de comportamiento, no un detalle: le saca el blindaje a una fila que alguien
  // pudo haber blindado a propósito. Por eso tiene que salir con `pisaManual` a la vista.
  var porColumna3 = {};
  r3.cambios.forEach(function (c) { porColumna3[c.columna] = c; });
  afirmar_(porColumna3.origen && porColumna3.origen.anterior === 'manual' && porColumna3.origen.nuevo === 'seed',
    'C.2-3: sobre una fila manual la migración tiene que reportar origen manual → seed');

  // 4. Modo cálculo (aplicar=false): reporta lo mismo y NO escribe. Es lo que usa
  //    "Estado de configuración" para incluir las migraciones pendientes.
  //    Mismo fixture que el caso 1 a propósito: lo único que cambia es `aplicar`.
  var simulada = hojaFalsaConEscrituras_('SOLAPAS', [
    headers,
    ['looker', 'resumen_metricas_dinamico', 'revisar', 'auto', 1, '', '', '', 'otra cosa']
  ]);
  var r4 = alinearSolapasLookerADinamico_(simulada, false);
  afirmar_(r4.cambios.length === 2, 'C.2-3: en modo cálculo tiene que reportar los mismos 2 cambios');
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
 * Control positivo de C.2-5 — lo que está en la hoja y no en el seed se reporta.
 *
 * El caso real: la fila `m2 | ahhh | or` del control positivo del protocolo vivió TRES
 * corridas en `MAPEO` sin que ninguna la nombrara. Un diff de upsert por clave reporta
 * cambiadas y agregadas, y omite en silencio justo donde viven las ediciones a mano.
 */
function probarSoloEnHoja_() {
  var headers = ['base_id', 'solapa', 'campo_logico', 'hoja', 'columna', 'notas'];
  var hoja = hojaFalsa_('MAPEO', [
    headers,
    ['m2', 'M2 periodo DIRECTA', 'or', 'M2 periodo DIRECTA', 'G', ''],
    ['m2', 'ahhh', 'or', 'cc', 'G', 'cdcdd'],          // la huérfana real
    ['zz_prueba', 'hoja inventada', 'zz_borrar', 'x', 'A', 'texto'] // la clave inventada
  ]);
  var seed = [
    { base_id: 'm2', solapa: 'M2 periodo DIRECTA', campo_logico: 'or', hoja: 'M2 periodo DIRECTA', columna: 'G', notas: '' }
  ];

  var diff = calcularDiffUpsert_(hoja, ['base_id', 'solapa', 'campo_logico'], seed);

  afirmar_(diff.soloEnHoja.length === 2,
    'C.2-5: se esperaban 2 filas solo_en_hoja (ahhh y zz_prueba), vinieron ' + diff.soloEnHoja.length);
  var claves = diff.soloEnHoja.map(function (s) { return s.clave; }).join(' ');
  afirmar_(claves.indexOf('m2||ahhh||or') !== -1, 'C.2-5: la fila huérfana ahhh tiene que reportarse');
  afirmar_(claves.indexOf('zz_prueba||hoja inventada||zz_borrar') !== -1, 'C.2-5: la clave inventada tiene que reportarse');

  // Y lo que SÍ está en el seed no puede salir como huérfano.
  afirmar_(claves.indexOf('M2 periodo DIRECTA') === -1,
    'C.2-5: una fila que está en el seed no es solo_en_hoja');
  afirmar_(diff.cambios.length === 0 && diff.nuevas.length === 0,
    'C.2-5: la fila del seed coincide, no debería haber cambios ni nuevas');

  // Caso negativo: sin huérfanas, cero líneas.
  var limpia = hojaFalsa_('MAPEO', [headers, ['m2', 'M2 periodo DIRECTA', 'or', 'M2 periodo DIRECTA', 'G', '']]);
  afirmar_(calcularDiffUpsert_(limpia, ['base_id', 'solapa', 'campo_logico'], seed).soloEnHoja.length === 0,
    'C.2-5: una hoja sin huérfanas no puede reportar solo_en_hoja');

  // El upsert NO borra: sigue habiendo 3 filas de datos después de calcular el diff.
  afirmar_(hoja.getLastRow() === 4, 'C.2-5: calcular el diff no puede borrar filas de la hoja');

  // Las filas del reporte llevan el tipo y dicen que no se tocan.
  var filas = filasDiffParaHoja_('MAPEO', { soloEnHoja: diff.soloEnHoja });
  afirmar_(filas.length === 2, 'C.2-5: cada huérfana es una fila del reporte');
  afirmar_(filas[0][1] === 'solo_en_hoja', 'C.2-5: el tipo tiene que ser solo_en_hoja, vino ' + filas[0][1]);
  afirmar_(String(filas[0][5]).indexOf('no se toca') !== -1, 'C.2-5: la línea tiene que aclarar que no se borra');

  // Una fila protegida del seed NO es una huérfana: son categorías opuestas.
  var conProtegida = filasDiffParaHoja_('SOLAPAS', {
    protegidas: ['rdv||RDV CONJUNTO'],
    soloEnHoja: [{ clave: 'zz_prueba||hoja inventada', fila: 9 }]
  });
  var tipos = conProtegida.map(function (f) { return f[1]; }).join(' ');
  afirmar_(tipos.indexOf('protegida') !== -1 && tipos.indexOf('solo_en_hoja') !== -1,
    'C.2-5: protegida y solo_en_hoja tienen que convivir como tipos distintos');

  return 'C.2-5 solo_en_hoja: OK';
}

/**
 * Control positivo de C.2-4 — una fila protegida dice QUÉ se salteó.
 *
 * Las diez protegidas del protocolo salían con `anterior`/`nuevo` vacíos: se sabía que se
 * habían salteado, no si estaban por cambiar. La Parte 2 del Paso 2.12 necesita
 * exactamente ese dato para `rdv/RDV CONJUNTO` y `rdv/Comunas`.
 */
function probarProtegidasConDiferencia_() {
  // Una protegida CON diferencia: el seed la quiere en `ignorar`, la hoja dice `revisar`.
  var conDif = filasDiffParaHoja_('SOLAPAS', {
    protegidas: [{
      clave: 'rdv||RDV CONJUNTO',
      diferencias: [{ columna: 'uso', anterior: 'revisar', nuevo: 'ignorar' }]
    }]
  });
  afirmar_(conDif.length === 1, 'C.2-4: una diferencia, una línea');
  afirmar_(conDif[0][1].indexOf('habría cambiado') !== -1,
    'C.2-4: el tipo tiene que decir que habría cambiado, vino ' + conDif[0][1]);
  afirmar_(conDif[0][3] === 'uso', 'C.2-4: tiene que decir qué columna');
  afirmar_(conDif[0][4] === 'revisar', 'C.2-4: tiene que decir el valor actual');
  afirmar_(String(conDif[0][5]).indexOf('ignorar') !== -1, 'C.2-4: tiene que decir a qué valor');
  afirmar_(String(conDif[0][5]).indexOf('no aplicado') !== -1, 'C.2-4: tiene que aclarar que no se aplicó');

  // Una protegida SIN diferencia: se dice explícito, no con celdas vacías.
  var sinDif = filasDiffParaHoja_('SOLAPAS', {
    protegidas: [{ clave: 'looker||resumen_metricas', diferencias: [] }]
  });
  afirmar_(sinDif.length === 1, 'C.2-4: una protegida sin diferencias igual se reporta');
  afirmar_(sinDif[0][1].indexOf('sin diferencias') !== -1,
    'C.2-4: tiene que decir "sin diferencias" explícito, vino ' + sinDif[0][1]);
  afirmar_(sinDif[0][5] !== '', 'C.2-4: no puede quedar la celda vacía, que era lo ambiguo');

  // Las dos no pueden verse iguales — es el punto entero de la parte.
  afirmar_(conDif[0][1] !== sinDif[0][1],
    'C.2-4: protegida con diferencia y sin diferencia no pueden reportarse igual');

  // Y el cálculo real: aplicarClasificacionSolapas_ arma esas diferencias comparando
  // la fila viva contra el seed. Se verifica el comparador que usa.
  afirmar_(normalizarParaComparar_('revisar', '') !== normalizarParaComparar_('ignorar', ''),
    'C.2-4: el comparador tiene que distinguir dos usos distintos');
  afirmar_(normalizarParaComparar_('ignorar', '') === normalizarParaComparar_('ignorar', ''),
    'C.2-4: el comparador no puede inventar diferencias donde no las hay');

  // Combinado con C.2-3: protegida + tocada por migración lo dice en el mismo tipo.
  var tocadas = { 'rdv||RDV CONJUNTO': true };
  var combinada = filasDiffParaHoja_('SOLAPAS', {
    protegidas: [{ clave: 'rdv||RDV CONJUNTO', diferencias: [{ columna: 'uso', anterior: 'a', nuevo: 'b' }] }]
  }, tocadas);
  afirmar_(combinada[0][1].indexOf('modificada por una migración') !== -1,
    'C.2-4: tiene que seguir marcando la modificación por migración, vino ' + combinada[0][1]);

  return 'C.2-4 protegidas con diferencia: OK';
}

/**
 * Control positivo de C.2-6 — el resumen desagrega, y no lista claves.
 *
 * Un solo total es lo que trajo el problema hasta acá: "celdas cambiadas: 1" no decía si
 * era un cambio real, una migración o una protegida.
 */
function probarResumenDesagregado_() {
  var filas = [
    ['BASES', 'cambio', 'm2', 'hoja_default', 'Cuentas M2', ''],
    ['MAPEO', 'nueva', 'm2||M2 periodo DIRECTA||or', '', '', ''],
    ['SOLAPAS', 'migracion', 'looker||resumen_metricas  [S-01]', 'uso', 'revisar', 'fuente'],
    ['SOLAPAS', 'migracion (pisa manual)', 'looker||x  [S-01]', 'uso', 'a', 'b'],
    ['MAPEO', 'solo_en_hoja', 'm2||ahhh||or', '', 'fila 3', '(no está en el seed)'],
    ['SOLAPAS', 'protegida (habría cambiado)', 'rdv||RDV CONJUNTO', 'uso', 'revisar', 'ignorar (no aplicado)'],
    ['SOLAPAS', 'protegida (sin diferencias)', 'rdv||Comunas', '', '', 'ya coincide con el seed']
  ];
  var r = resumenDesagregado_(filas);

  // Cada categoría se cuenta por separado.
  afirmar_(r.indexOf('cambiadas: 1') !== -1, 'C.2-6: cambiadas mal contadas -> ' + r);
  afirmar_(r.indexOf('agregadas: 1') !== -1, 'C.2-6: agregadas mal contadas -> ' + r);
  afirmar_(r.indexOf('migraciones: 2') !== -1, 'C.2-6: las dos migraciones (con y sin pisa manual) se cuentan juntas -> ' + r);
  afirmar_(r.indexOf('solo_en_hoja: 1') !== -1, 'C.2-6: solo_en_hoja mal contada -> ' + r);
  afirmar_(r.indexOf('protegidas (con diferencia): 1') !== -1, 'C.2-6: protegida con diferencia mal contada -> ' + r);
  afirmar_(r.indexOf('protegidas (sin diferencia): 1') !== -1, 'C.2-6: protegida sin diferencia mal contada -> ' + r);

  // Las siete filas quedan clasificadas: nada desaparece del resumen.
  afirmar_(r.indexOf('sin categoría') === -1, 'C.2-6: no debería quedar ninguna fila sin categoría -> ' + r);

  // El caso que importa: una protegida NO puede contarse como cambio.
  var soloProtegida = resumenDesagregado_([
    ['SOLAPAS', 'protegida (sin diferencias)', 'x', '', '', 'ya coincide']
  ]);
  afirmar_(soloProtegida.indexOf('cambiadas: 0') !== -1,
    'C.2-6: una protegida no es un cambio -> ' + soloProtegida);
  afirmar_(soloProtegida.indexOf('sin cambios: sí') !== -1,
    'C.2-6: solo protegidas significa sin cambios -> ' + soloProtegida);

  // Y una migración SÍ cuenta como que hubo cambios (rompe la idempotencia).
  var conMigracion = resumenDesagregado_([['SOLAPAS', 'migracion', 'x', 'uso', 'a', 'b']]);
  afirmar_(conMigracion.indexOf('sin cambios: no') !== -1,
    'C.2-6: una migración que escribe no es "sin cambios" -> ' + conMigracion);

  // Un tipo desconocido no puede desaparecer del total.
  var raro = resumenDesagregado_([['X', 'tipo_que_no_existe', 'k', '', '', '']]);
  afirmar_(raro.indexOf('sin categoría): 1') !== -1,
    'C.2-6: un tipo sin categoría tiene que verse en el resumen -> ' + raro);

  // No se listan claves en el resumen — eso ya rompió diagnosticarColapso_ por timeout.
  afirmar_(r.indexOf('RDV CONJUNTO') === -1 && r.indexOf('ahhh') === -1,
    'C.2-6: el resumen no puede listar claves, el detalle va a la hoja -> ' + r);

  return 'C.2-6 resumen desagregado: OK';
}

/**
 * Corre todas las pruebas y devuelve el texto del reporte. Sin `alert()` acá adentro para
 * poder llamarla también desde otro lado.
 */
/**
 * Paso 2.16 — control positivo de la lista blanca de `MAPEO.valores_incluidos` (D-21).
 *
 * Por qué hace falta: el protocolo de configuración no lo distingue. Un filtro que no
 * filtra nada y un filtro correcto dan el mismo diff (`CAMPANAS`/`MAPEO` no cambian de
 * tamaño), así que "pasa el protocolo" no dice nada sobre esta función. Las cuatro
 * afirmaciones son sobre el comportamiento, no sobre la forma.
 *
 * Puro: no lee hojas. Se le pasan las filas y los filtros ya armados.
 */
function probarListaBlancaValores_() {
  var filtro = {
    campo_logico: 'mail_estado', columna: 'D', indice: 3,
    declarado: 'Implementado, En curso',
    permitidos: ['Implementado', 'En curso'],
    etiqueta: 'digital/Directa Mail/mail_estado'
  };
  var filas = [
    ['a', 'b', 'c', 'Implementado'],
    ['a', 'b', 'c', '  En   curso '], // espacios de más: tiene que entrar igual
    ['a', 'b', 'c', 'Proyectado'],
    ['a', 'b', 'c', ''],
    ['a', 'b', 'c', 'implementado']   // minúscula: NO entra (R-10, no se pliega el case)
  ];

  var veredictos = filas.map(function (f) { return filaPasaListaBlanca_(f, [filtro]); });
  afirmar_(veredictos[0].pasa === true, 'lista blanca: "Implementado" tiene que entrar');
  afirmar_(veredictos[1].pasa === true, 'lista blanca: los espacios de más se colapsan, "En curso" entra');
  afirmar_(veredictos[2].pasa === false, 'lista blanca: "Proyectado" tiene que quedar afuera');
  afirmar_(veredictos[3].pasa === false, 'lista blanca: el vacío tiene que quedar afuera');
  afirmar_(veredictos[4].pasa === false, 'lista blanca: minúsculas NO se pliegan (R-10)');
  afirmar_(veredictos[2].valor === 'Proyectado', 'lista blanca: el motivo tiene que decir qué valor excluyó');

  // Sin filtros declarados, entra todo — la celda vacía significa "sin filtro".
  afirmar_(filaPasaListaBlanca_(filas[2], []).pasa === true, 'lista blanca: sin filtros no se excluye nada');

  // El tipeo que se manifiesta como filas que faltan.
  var conTipeo = { campo_logico: 'x', columna: 'D', indice: 3, declarado: 'Implementadoo',
    permitidos: ['Implementadoo'], etiqueta: 'x' };
  var huerfanos = valoresDeclaradosSinFilas_(filas, [conTipeo]);
  afirmar_(huerfanos.length === 1, 'lista blanca: un valor declarado que no existe tiene que reportarse');

  // La coma que era parte del valor, no separador.
  var filasConComa = [['a', 'b', 'c', 'Salud, Educación']];
  var filtroComa = { campo_logico: 'y', columna: 'D', indice: 3, declarado: 'Salud, Educación',
    permitidos: ['Salud', 'Educación'], etiqueta: 'y' };
  afirmar_(comaDentroDeUnValor_(filasConComa, filtroComa) === true,
    'lista blanca: una coma dentro de un valor tiene que detectarse');
  afirmar_(comaDentroDeUnValor_(filas, filtro) === false,
    'lista blanca: "Implementado, En curso" NO puede dar falso positivo de coma interna');

  return 'D-21 lista blanca de valores: OK';
}

/**
 * Paso 3 (v3) Parte A — control positivo del despacho de operaciones.
 *
 * Por qué hace falta, y es la misma razón que el de la lista blanca: **nada de esto lo
 * distingue el protocolo de configuración**. Un despachador que resuelve por `eval` y uno
 * que resuelve por mapa dan exactamente el mismo número cuando la configuración es correcta;
 * la diferencia sólo aparece con una `operacion` inventada — que es el caso que este control
 * ejercita y que en producción llega desde una celda que edita una persona.
 *
 * Puro: no lee hojas ni abre bases. Los `ctx` son literales.
 */
function probarDespachoOperaciones_() {
  var filas = [
    { Inscriptos: 10, Barrio: 'Retiro' },
    { Inscriptos: 5, Barrio: 'Palermo' },
    { Inscriptos: '', Barrio: 'Boedo' }
  ];
  var ctx = {
    marcador: 'ecv_inscriptos', base_id: 'rdv', solapa: 'RVD JM-CM - ES',
    campo_logico: 'inscriptos', columna: 'K', encabezado: 'Inscriptos', filas: filas
  };

  // 1 · Las seis genéricas resuelven por nombre, y `filas` + `encabezado` es equivalente a
  //     pasar `valores` ya extraído: es el punto del contrato nuevo.
  var suma = despacharOperacion_('SUMA', ctx);
  afirmar_(suma.ok === true && suma.valor === 15, 'despacho: SUMA sobre `filas` tiene que dar 15');
  var sumaValores = despacharOperacion_('SUMA', {
    base_id: 'rdv', campo_logico: 'inscriptos', columna: 'K', valores: [10, 5, '']
  });
  afirmar_(sumaValores.valor === suma.valor, 'despacho: `filas`+`encabezado` y `valores` tienen que dar lo mismo');

  afirmar_(despacharOperacion_('CONTEO', ctx).valor === 3,
    'despacho: CONTEO cuenta filas, incluida la de valor vacío');
  /* `_39` (12/08) — este control **decía otra cosa de la que probaba**, y la guarda nueva de
   * `opULTIMO` lo dejó a la vista. Corría sobre `ctx`, cuyos valores son `[10, 5, '']`: pasaba
   * porque `5` es el último con valor, o sea que probaba *"ULTIMO elige por posición"* con el
   * rótulo *"saltea la celda vacía del final"*. Son dos afirmaciones distintas y ahora van
   * separadas, cada una con su fixture. */
  afirmar_(despacharOperacion_('ULTIMO', {
    base_id: 'rdv', campo_logico: 'inscriptos', columna: 'K', valores: [5, 5, '']
  }).valor === 5, 'despacho: ULTIMO saltea la celda vacía del final');

  // La guarda: sin fecha y con valores distintos **no se elige**. El fixture son las dos filas
  // reales de `3387-JULJDGGC` en `digital/Alcance`, donde `D-06` valida la primera.
  //
  // Se afirma sobre `valor` y la traza, **no sobre el flag `ambiguo`**: `despacharOperacion_`
  // rearma el sobre y no lo propaga — tampoco el de la rama por fecha, que ya existía. La señal
  // que llega al deck es el valor vacío más el `«FALTA:»`, así que es la que se prueba.
  var ultimoAmbiguo = despacharOperacion_('ULTIMO', {
    base_id: 'digital', solapa: 'Alcance', campo_logico: 'alc_alcance', columna: 'B',
    valores: [66345, 457883]
  });
  afirmar_(ultimoAmbiguo.valor === '' && ultimoAmbiguo.traza.indexOf('«FALTA:@ultimo_sin_fecha_ambiguo»') === 0,
    'despacho: ULTIMO sin fecha no elige entre valores distintos');

  // Y el contraste, para que la guarda no se coma el caso legítimo: mismas dos filas, mismo
  // valor, se resuelve sin ambigüedad.
  afirmar_(despacharOperacion_('ULTIMO', {
    base_id: 'digital', solapa: 'Alcance', campo_logico: 'alc_alcance', columna: 'B',
    valores: [66345, 66345]
  }).valor === 66345, 'despacho: ULTIMO sin fecha sí resuelve si las filas traen lo mismo');
  afirmar_(despacharOperacion_('TEXTO', { valor_fijo: 'hola' }).valor === 'hola',
    'despacho: TEXTO devuelve el literal de valor_fijo');

  // 2 · La ventana entra en la traza. Es lo que permite auditar el número sin abrir la base.
  var conVentana = despacharOperacion_('SUMA', {
    base_id: 'rdv', campo_logico: 'inscriptos', columna: 'K', valores: [1],
    ventana: { desde: new Date(2026, 5, 26), hasta: new Date(2026, 6, 2) }
  });
  afirmar_(conVentana.traza.indexOf('2026-06-26') !== -1 && conVentana.traza.indexOf('2026-07-02') !== -1,
    'despacho: la traza tiene que decir la ventana cuando el ctx la trae');

  // 3 · Una `operacion` desconocida NO rompe la corrida: devuelve motivo legible.
  var desconocida = despacharOperacion_('PROMEDIO', ctx);
  afirmar_(desconocida.ok === false && desconocida.motivo.indexOf('PROMEDIO') !== -1,
    'despacho: una operación desconocida tiene que fallar con su nombre en el motivo');
  afirmar_(despacharOperacion_('', ctx).ok === false,
    'despacho: `operacion` vacía tiene que fallar explícito');

  // 4 · El caso que justifica el mapa explícito: una celda de MARCADORES no puede invocar
  //     una función cualquiera del proyecto. `instalar` existe y escribe hojas.
  var global = despacharOperacion_('instalar', ctx);
  afirmar_(global.ok === false, 'despacho: no se puede alcanzar una función global por nombre');
  var globalFn = despacharOperacion_('FN:instalar', ctx);
  afirmar_(globalFn.ok === false, 'despacho: el escape hatch tampoco resuelve contra el global');

  // 5 · Una excepción adentro de la operación se convierte en motivo, no en corte de corrida.
  var ratioSinDatos = despacharOperacion_('RATIO', { campo_logico: 'a/b' });
  afirmar_(ratioSinDatos.ok === false && ratioSinDatos.motivo.indexOf('valoresNumerador') !== -1,
    'despacho: RATIO sin sus arreglos tiene que decir cuál falta, no tirar TypeError');

  return 'Paso 3 A despacho de operaciones: OK';
}

/**
 * Paso 3 (v3) Parte B.3 — control positivo de la semana de `R-11`.
 *
 * Por qué **este** control y no una corrida de `resolverVentana()`: el último eslabón sólo
 * se alcanza con `CONFIG` vacío, y `CONFIG` está cargado. Vaciarlo para probar sería tocar
 * la planilla; peor, el `P1` del diff ciego a los valores de `CONFIG` dice que ese cambio no
 * lo ve ninguna verificación. `semanaR11_` es pura y toma la fecha por parámetro, así que se
 * prueba entera sin planilla y sin esperar a un viernes.
 */
function probarSemanaR11_() {
  function iso_(d) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  // El caso de referencia del Addendum 1: vie 24/07/2026 → jue 30/07/2026. Siete días.
  var desdeElViernes = semanaR11_(new Date(2026, 6, 24));
  afirmar_(iso_(desdeElViernes.desde) === '2026-07-24',
    'R-11: corriendo un viernes, la semana arranca ESE viernes, no el anterior');
  afirmar_(iso_(desdeElViernes.hasta) === '2026-07-30',
    'R-11: la semana cierra el jueves siguiente, extremo inclusive');

  // Siete días contando los dos extremos, no ocho.
  var dias = Math.round((desdeElViernes.hasta - desdeElViernes.desde) / 86400000) + 1;
  afirmar_(dias === 7, 'R-11: son siete días inclusive, no ocho — es lo que cerró el Addendum 1');

  // Cualquier día de esa semana devuelve la MISMA ventana.
  ['2026-07-25', '2026-07-28', '2026-07-30'].forEach(function (dia) {
    var partes = dia.split('-');
    var v = semanaR11_(new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])));
    afirmar_(iso_(v.desde) === '2026-07-24' && iso_(v.hasta) === '2026-07-30',
      'R-11: ' + dia + ' cae en la semana del 24/07 y tiene que devolver esa ventana');
  });

  // El jueves cierra; el viernes siguiente ya es otra semana. Es el borde que importa.
  var siguiente = semanaR11_(new Date(2026, 6, 31));
  afirmar_(iso_(siguiente.desde) === '2026-07-31',
    'R-11: el viernes siguiente abre una ventana nueva, no extiende la anterior');

  // Cruce de mes y de año, que es donde la aritmética de fechas suele romperse.
  var finDeAnio = semanaR11_(new Date(2027, 0, 2)); // sábado 02/01/2027
  afirmar_(iso_(finDeAnio.desde) === '2027-01-01' && iso_(finDeAnio.hasta) === '2027-01-07',
    'R-11: la semana tiene que cruzar el cambio de año sin romperse');

  // La hora no participa: la ventana es de días.
  var conHora = semanaR11_(new Date(2026, 6, 28, 23, 59, 59));
  afirmar_(iso_(conHora.desde) === '2026-07-24',
    'R-11: la hora de la corrida no puede mover la ventana');

  return 'R-11 semana calculada: OK';
}

/**
 * Paso 3 (v3) Parte C — control positivo del formateo de marcadores.
 *
 * Por qué éste y no el despachador entero: `resolverMarcadores` lee hojas y bases, así que
 * probarlo de verdad es la Parte D (el corte vertical). Lo que sí se puede aislar es
 * `formatearValorMarcador_`, y conviene: **es lo único que decide qué ve una persona en la
 * lámina**, y un error de formato no se manifiesta como error — se manifiesta como un número
 * plausible y equivocado, que es el modo de falla más caro del proyecto.
 *
 * Puro: no lee hojas.
 */
function probarFormatoMarcador_() {
  afirmar_(formatearValorMarcador_(1234.567, 'numero') === '1234.57',
    'formato: `numero` redondea a dos decimales');
  afirmar_(formatearValorMarcador_(0, 'numero') === '0',
    'formato: el CERO tiene que salir "0", no vacío — es un dato, no la ausencia de uno');
  afirmar_(formatearValorMarcador_(44.05, 'porcentaje') === '44.1%',
    'formato: `porcentaje` va a un decimal y con el signo');
  // El par que hay que mantener separado: el mismo 0,2818 es "0.3%" leído como porcentaje y
  // 28,2 leído como fracción. Es el error que la corrida del 04/08 encontró en el deck.
  afirmar_(formatearValorMarcador_(0.2818181818, 'fraccion') === '28.2',
    'formato: `fraccion` lleva el 0–1 de la base a unidades de porcentaje');
  afirmar_(formatearValorMarcador_(0.2818181818, 'porcentaje') === '0.3%',
    'formato: `porcentaje` NO multiplica — si multiplicara, un PCT ya calculado saldría x100');
  // La otra mitad del hallazgo: las cajas de JM traen su propio `%`, así que `fraccion` no
  // lo agrega. Si esta afirmación se cae, el deck vuelve a decir "28.2%%".
  afirmar_(formatearValorMarcador_(0.2818181818, 'fraccion').indexOf('%') === -1,
    'formato: `fraccion` NO pone el signo — lo trae la caja de la plantilla (C-01)');
  afirmar_(formatearValorMarcador_(0, 'fraccion') === '0',
    'formato: el CERO en `fraccion` es un dato, sale "0" y no vacío');

  // `T2.5` (07/08) — la cuarta casilla: entrada ya en unidades de porcentaje, sin signo.
  afirmar_(formatearValorMarcador_(25.416407620701392, 'porcentaje_sin_signo') === '25.4',
    'formato: `porcentaje_sin_signo` va a UN decimal, como `porcentaje` y `fraccion`');
  afirmar_(formatearValorMarcador_(25.416407620701392, 'porcentaje_sin_signo').indexOf('%') === -1,
    'formato: `porcentaje_sin_signo` NO pone el signo — lo trae la caja de la plantilla (C-01)');
  // La razón de existir del formato, escrita como afirmación: `numero` NO es equivalente.
  // Redondea a dos decimales y mezcla precisiones en la misma lámina.
  afirmar_(formatearValorMarcador_(25.416407620701392, 'numero') === '25.42',
    'formato: `numero` da dos decimales — por eso no servía de reemplazo del porcentaje sin signo');
  afirmar_(formatearValorMarcador_(26.4, 'porcentaje_sin_signo') + '%' === formatearValorMarcador_(26.4, 'porcentaje'),
    'formato: `porcentaje_sin_signo` es `porcentaje` sin el signo, mismo redondeo');
  afirmar_(formatearValorMarcador_(0, 'porcentaje_sin_signo') === '0',
    'formato: el CERO en `porcentaje_sin_signo` es un dato, sale "0" y no vacío');
  afirmar_(formatearValorMarcador_('hola', 'texto') === 'hola',
    'formato: `texto` no toca el valor');
  afirmar_(formatearValorMarcador_('sin formato declarado', '') === 'sin formato declarado',
    'formato: sin `formato` declarado se devuelve el valor tal cual');

  // Vacío y no numérico: no se inventa un 0 ni un NaN.
  afirmar_(formatearValorMarcador_('', 'miles') === '',
    'formato: el vacío sigue vacío, no se convierte en 0');
  afirmar_(formatearValorMarcador_(null, 'numero') === '',
    'formato: null sigue vacío');
  afirmar_(formatearValorMarcador_('n/d', 'numero') === 'n/d',
    'formato: un valor no numérico con formato numérico sale tal cual, nunca NaN');

  // `miles` separa; el punto es que 15793427 no se lea como 15.79.
  var miles = formatearValorMarcador_(15793427, 'miles');
  afirmar_(miles.indexOf('15') === 0 && miles.length > 8,
    'formato: `miles` tiene que separar los miles, dio "' + miles + '"');

  return 'Paso 3 C formato de marcadores: OK';
}

/**
 * Paso 3 (v3) `D.1` Parte C — control positivo de `RATIO`/`PCT`.
 *
 * El caso que obliga a que exista: **un `PCT` con denominador cero no puede salir `NaN` ni
 * `0` en la lámina**. Los dos serían números plausibles y equivocados — un `0%` de
 * asistencia se lee como "no fue nadie", no como "no había base para calcularlo".
 *
 * Puro: los `ctx` son literales, no se lee ninguna hoja.
 */
function probarRatioEnDespachador_() {
  // El caso real del corte: 199 asistentes sobre 753 inscriptos.
  var pct = despacharOperacion_('PCT', {
    campo_logico: 'asistentes/inscriptos',
    valoresNumerador: [199], valoresDenominador: [753]
  });
  afirmar_(pct.ok === true, 'ratio: un PCT con los dos arreglos tiene que resolver');
  afirmar_(Math.abs(pct.valor - 26.4276) < 0.01, 'ratio: 199/753 tiene que dar 26,43%, dio ' + pct.valor);
  afirmar_(formatearValorMarcador_(pct.valor, 'porcentaje') === '26.4%',
    'ratio: formateado a un decimal con signo');

  // Denominador cero: ni NaN ni 0.
  var cero = despacharOperacion_('PCT', {
    campo_logico: 'asistentes/inscriptos',
    valoresNumerador: [199], valoresDenominador: [0]
  });
  afirmar_(cero.ok === true, 'ratio: denominador cero NO es un error de despacho');
  afirmar_(cero.valor === '', 'ratio: denominador cero devuelve vacío, no 0 ni NaN — dio ' + JSON.stringify(cero.valor));
  afirmar_(formatearValorMarcador_(cero.valor, 'porcentaje') === '',
    'ratio: en la lámina un denominador cero sale VACÍO, nunca "0%" ni "NaN%"');
  afirmar_(cero.traza.indexOf('denominador') !== -1,
    'ratio: la traza tiene que decir que el denominador estaba vacío o en cero');

  // El denominador cero se traduce a `sin_datos`, que es lo que `resolverMarcadores` mira.
  afirmar_((cero.valor === '' ? 'sin_datos' : 'ok') === 'sin_datos',
    'ratio: un denominador cero es sin_datos, no error');

  // La traza muestra los dos campos y los dos totales, que es lo que permite auditarlo.
  afirmar_(pct.traza.indexOf('asistentes') !== -1 && pct.traza.indexOf('inscriptos') !== -1,
    'ratio: la traza tiene que nombrar numerador y denominador');
  afirmar_(pct.traza.indexOf('199') !== -1 && pct.traza.indexOf('753') !== -1,
    'ratio: la traza tiene que mostrar los dos totales');

  // Sumar antes de dividir, no dividir por fila y promediar: son números distintos.
  var agregado = despacharOperacion_('RATIO', {
    campo_logico: 'a/b',
    valoresNumerador: [1, 2, 3], valoresDenominador: [10, 10, 10]
  });
  afirmar_(Math.abs(agregado.valor - 0.2) < 1e-9,
    'ratio: suma los dos lados y DESPUÉS divide (6/30 = 0,2), no promedia razones por fila');

  return 'Paso 3 D.1 RATIO/PCT: OK';
}

/* ============ Paso 3 (v3) `D.1` Parte D — el cableado del corte vertical ============
 *
 * Once tokens, **todos con prefijo `prueba_`**, y el prefijo no es cosmético:
 * `ecv_inscriptos`, `ecv_asistentes` y `enc_alcance` son tokens **por encuentro** en
 * `docs/TOKENS.md`, y acá se calculan **agregados sobre la ventana**. Cablearlos con el
 * nombre canónico plantaría un número plausible y equivocado bajo un nombre que después se
 * usa en el deck — el modo de falla que un corte vertical existe para evitar.
 *
 * **Se retiran al cerrar la Parte D** (`retirarMarcadoresDePrueba_`).
 *
 * `poblacion` queda afuera a propósito: sumarla cuenta dos veces el mismo barrio si hay dos
 * encuentros ahí.
 */
var MARCADORES_PRUEBA_ = [
  { marcador: 'prueba_inscriptos', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'inscriptos', operacion: 'SUMA', formato: 'numero', notas: 'corte vertical Paso 3 D.1 — se retira al cerrar' },
  { marcador: 'prueba_asistentes', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'asistentes', operacion: 'SUMA', formato: 'numero', notas: 'corte vertical Paso 3 D.1 — se retira al cerrar' },
  { marcador: 'prueba_insc_mail', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'insc_mail', operacion: 'SUMA', formato: 'numero', notas: 'corte vertical Paso 3 D.1 — se retira al cerrar' },
  { marcador: 'prueba_insc_cc', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'insc_cc', operacion: 'SUMA', formato: 'numero', notas: 'corte vertical Paso 3 D.1 — se retira al cerrar' },
  { marcador: 'prueba_insc_ivr', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'insc_ivr', operacion: 'SUMA', formato: 'numero', notas: 'corte vertical Paso 3 D.1 — se retira al cerrar' },
  { marcador: 'prueba_insc_digital', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'insc_digital', operacion: 'SUMA', formato: 'numero', notas: 'corte vertical Paso 3 D.1 — se retira al cerrar' },
  { marcador: 'prueba_insc_dif', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'insc_dif', operacion: 'SUMA', formato: 'numero', notas: 'corte vertical Paso 3 D.1 — se retira al cerrar' },
  { marcador: 'prueba_encuentros', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'inscriptos', operacion: 'CONTEO', formato: 'numero', notas: 'corte vertical Paso 3 D.1 — se retira al cerrar' },
  { marcador: 'prueba_asistencia_pct', familia: 'prueba', informe_id: 'jm', base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'asistentes/inscriptos', operacion: 'PCT', formato: 'porcentaje', notas: 'corte vertical Paso 3 D.1 — el unico PCT, ejercita RATIO' },
  // Solapa VACÍA a propósito: `looker` tiene una sola mapeada, así que se infiere. Es el
  // único caso que ejercita la inferencia de solapa (ver el `P2` de PENDIENTES).
  { marcador: 'prueba_alcance', familia: 'prueba', informe_id: 'jm', base_id: 'looker', solapa: '', campo_logico: 'alcance', operacion: 'SUMA', formato: 'miles', notas: 'corte vertical Paso 3 D.1 — solapa vacia a proposito: ejercita la inferencia' },
  { marcador: 'prueba_fecha', familia: 'prueba', informe_id: 'jm', base_id: '', solapa: '', campo_logico: '', operacion: 'TEXTO', valor_fijo: '24/07 al 30/07', formato: 'texto', notas: 'corte vertical Paso 3 D.1 — literal, ejercita TEXTO' }
];

function cablearMarcadoresDePrueba_() {
  return curarMarcadores_([], MARCADORES_PRUEBA_);
}

function retirarMarcadoresDePrueba_() {
  return curarMarcadores_(MARCADORES_PRUEBA_.map(function (m) { return m.marcador; }), []);
}

/**
 * `D.4` — el corte corrido, con sus controles. Sólo lectura: no escribe hojas.
 *
 * **El control externo:** `prueba_inscriptos` contra los **753** de `Orden Público 28/07`,
 * verificados dígito a dígito en `docs/VALIDACION_2026-07-31.md` (caso `V-05`). Con **12
 * encuentros en la ventana**, el criterio fijado en `0.2` es **753 o más**; un 753 exacto se
 * reporta como **sospechoso**, no como acierto.
 *
 * **Los dos controles internos, y la distinción importa:**
 *  - *por fila* — los cinco canales de la fila de Orden Público (361+169+43+180+vacío)
 *    tienen que dar sus 753 `Inscriptos`;
 *  - *agregado* — la suma de los cinco `prueba_insc_*` sobre las 12 filas tiene que dar
 *    `prueba_inscriptos`.
 *
 * **Si cierra por fila pero no en el agregado, el problema está en el despachador y no en
 * los datos.** Ésa es la distinción que hace útil el corte, y por eso se reportan separados.
 */
function correrCorteVerticalMarcadores_() {
  var r = resolverMarcadores('jm');
  var porNombre = {};
  r.resultados.forEach(function (x) { porNombre[x.marcador] = x; });

  var num = function (nombre) {
    var v = porNombre[nombre] && porNombre[nombre].valor;
    return (v === '' || v === null || v === undefined) ? null : Number(v);
  };

  var inscriptos = num('prueba_inscriptos');
  var canales = ['prueba_insc_mail', 'prueba_insc_cc', 'prueba_insc_ivr', 'prueba_insc_digital', 'prueba_insc_dif'];
  var sumaCanales = canales.reduce(function (acc, n) { return acc + (num(n) || 0); }, 0);
  var asistentes = num('prueba_asistentes');

  // Control externo, con el criterio de 0.2.
  var externo;
  if (inscriptos === null) {
    externo = { ok: false, veredicto: 'prueba_inscriptos no dio número' };
  } else if (inscriptos === 753) {
    externo = { ok: false, veredicto: 'SOSPECHOSO: dio 753 exacto con 12 encuentros en la ventana — se esperaba 753 o más' };
  } else if (inscriptos > 753) {
    externo = { ok: true, veredicto: 'cierra: ' + inscriptos + ' ≥ 753 (Orden Público 28/07, caso V-05)' };
  } else {
    externo = { ok: false, veredicto: 'NO cierra: ' + inscriptos + ' < 753. Diferencia: ' + (753 - inscriptos) };
  }

  return {
    ok: true,
    ventana: porNombre['prueba_inscriptos'] ? porNombre['prueba_inscriptos'].traza : '',
    resumen: r.resumen,
    control_externo: externo,
    control_interno_agregado: {
      prueba_inscriptos: inscriptos,
      suma_de_los_cinco_canales: sumaCanales,
      cierra: inscriptos !== null && sumaCanales === inscriptos,
      diferencia: inscriptos === null ? null : (sumaCanales - inscriptos)
    },
    control_asistentes_menor: {
      asistentes: asistentes,
      inscriptos: inscriptos,
      cierra: asistentes !== null && inscriptos !== null && asistentes < inscriptos
    },
    resultados: r.resultados
  };
}

function menuCalcularMarcadoresPrueba_() {
  var ui = ui_();
  var r = correrCorteVerticalMarcadores_();
  var lineas = ['Ventana: ' + r.ventana, ''];
  r.resultados.forEach(function (x) {
    lineas.push('[' + x.estado + '] ' + x.marcador + ' = ' + x.valor_formateado);
    lineas.push('    ' + x.traza);
  });
  lineas.push('', 'Control externo: ' + r.control_externo.veredicto);
  lineas.push('Control interno agregado: ' + (r.control_interno_agregado.cierra ? 'cierra' : 'NO cierra') +
    ' (' + r.control_interno_agregado.suma_de_los_cinco_canales + ' vs ' + r.control_interno_agregado.prueba_inscriptos + ')');
  ui.alert('Marcadores de prueba', lineas.join('\n'), ui.ButtonSet.OK);
  return lineas.join('\n');
}

/**
 * ⏳ **TEMPORAL — se retira junto con los `prueba_*`.** Censo del `−54` del corte vertical:
 * `prueba_inscriptos` = 2919 contra 2865 de la suma de los cinco canales.
 *
 * **Por qué `getValues()` crudo y no `leerFuente`, que es todo el punto:** `leerFuente`
 * normaliza, y al normalizar **colapsa en un solo caso** las tres cosas que este censo tiene
 * que distinguir — celda vacía, cero explícito y texto no numérico—. `opSUMA` las saltea a
 * las tres igual y en la traza salen idénticas. Leer crudo además no pasa por
 * `modo_periodo` ni por la lista blanca de `D-21`, así que el censo no hereda ninguna
 * decisión del lector: filtra por fecha y por `status` acá mismo, a la vista.
 *
 * Sólo lectura: **no corrige ninguna celda**. La base la cura una persona.
 */
function censoCanalesRdv_() {
  var VENTANA = { desde: '2026-07-24', hasta: '2026-07-30' };
  var abierto = abrirHoja('rdv', 'RVD JM-CM - ES');
  if (!abierto.ok) return { ok: false, motivo: abierto.motivo };

  var filaEncabezado = Number(abierto.base.fila_encabezado) || 1;
  var datos = abierto.hoja.getDataRange().getValues();
  var headers = datos[filaEncabezado - 1];
  var idx = function (letra) { return columnaLetraAIndice_(letra); };
  var C = { figura: idx('A'), barrio: idx('B'), evento: idx('C'), fecha: idx('E'), status: idx('I'),
            inscriptos: idx('K'), mail: idx('L'), cc: idx('M'), ivr: idx('N'), digital: idx('O'), dif: idx('P') };
  var CANALES = ['mail', 'cc', 'ivr', 'digital', 'dif'];
  var tz = Session.getScriptTimeZone();

  // Los tres casos que `leerFuente` colapsa en uno.
  function clasificar(celda) {
    if (celda === '' || celda === null || celda === undefined) return { tipo: 'vacía', n: 0 };
    if (typeof celda === 'number') return celda === 0 ? { tipo: 'cero explícito', n: 0 } : { tipo: 'número', n: celda };
    var t = String(celda).trim();
    if (t === '') return { tipo: 'vacía (espacios)', n: 0 };
    var n = Number(t);
    if (isNaN(n)) return { tipo: 'texto "' + t + '"', n: 0 };
    return n === 0 ? { tipo: 'cero explícito (texto)', n: 0 } : { tipo: 'número (texto)', n: n };
  }

  var filas = [];
  var cobertura = {};
  CANALES.forEach(function (k) { cobertura[k] = { numero: 0, vacia: 0, cero: 0, texto: 0 }; });
  var totalInscriptos = 0, totalCanales = 0, exactas = 0, cortas = 0, largas = 0;

  datos.slice(filaEncabezado).forEach(function (fila) {
    var f = fila[C.fecha];
    if (!(f instanceof Date)) f = parsearFechaCelda_(f);
    if (!f) return;
    var iso = Utilities.formatDate(f, tz, 'yyyy-MM-dd');
    if (iso < VENTANA.desde || iso > VENTANA.hasta) return;
    if (String(fila[C.status] || '').trim() !== 'Realizada') return;

    var insc = clasificar(fila[C.inscriptos]);
    var partes = CANALES.map(function (k) { return clasificar(fila[C[k]]); });
    var suma = partes.reduce(function (a, p) { return a + p.n; }, 0);
    var dif = suma - insc.n;
    totalInscriptos += insc.n; totalCanales += suma;
    if (dif === 0) exactas++; else if (dif < 0) cortas++; else largas++;

    partes.forEach(function (p, k) {
      var c = cobertura[CANALES[k]];
      if (p.tipo.indexOf('número') === 0) c.numero++;
      else if (p.tipo.indexOf('vacía') === 0) c.vacia++;
      else if (p.tipo.indexOf('cero') === 0) c.cero++;
      else c.texto++;
    });

    filas.push({
      fecha: iso,
      evento: String(fila[C.evento] || '').slice(0, 44),
      barrio: String(fila[C.barrio] || ''),
      inscriptos: insc.n,
      suma_canales: suma,
      diferencia: dif,
      detalle: CANALES.map(function (k, i) { return k + '=' + partes[i].tipo; }).join(' · ')
    });
  });

  return {
    ok: true,
    ventana: VENTANA.desde + '–' + VENTANA.hasta,
    filas_en_ventana: filas.length,
    total_inscriptos: totalInscriptos,
    total_canales: totalCanales,
    diferencia: totalCanales - totalInscriptos,
    cierran_exacto: exactas,
    quedan_cortas: cortas,
    quedan_LARGAS: largas,
    cobertura: cobertura,
    filas: filas
  };
}

/**
 * `_23` — control positivo de la regla de un nivel de `validarReferenciaVentana_`.
 *
 * Existe por el mismo motivo que todo este archivo: **una referencia circular no falla, cuelga
 * la corrida**, y un tope que nadie ejercitó es un tope que no se sabe si está. Probarlo contra
 * la planilla obligaría a escribir un ciclo en `SOLAPAS` y después sacarlo, así que la función
 * recibe el mapa de solapas por parámetro y acá se le pasa uno sintético. No toca nada.
 */
function probarReferenciaVentanaUnNivel_() {
  var mapa = {
    looker: {
      // El caso bueno: una solapa sin fecha propia que apunta a una que sí la tiene.
      DIGITAL: { uso: 'fuente', ventana_ref: 'Cuentas' },
      Cuentas: { uso: 'fuente', ventana_ref: '' },
      // Dos niveles: la referencia de DOS a su vez referencia.
      DOS: { uso: 'fuente', ventana_ref: 'DIGITAL' },
      // Ciclo de largo uno.
      SOLA: { uso: 'fuente', ventana_ref: 'SOLA' },
      // Apunta a una solapa que no se puede leer.
      ANO_FUENTE: { uso: 'fuente', ventana_ref: 'IGNORADA' },
      IGNORADA: { uso: 'ignorar', ventana_ref: '' },
      // Apunta a una que no está registrada.
      AFANTASMA: { uso: 'fuente', ventana_ref: 'NO_EXISTE' }
    }
  };

  var buena = validarReferenciaVentana_(mapa, 'looker', 'DIGITAL');
  afirmar_(buena.ok && buena.hay && buena.solapa_ref === 'Cuentas',
    'un nivel: DIGITAL→Cuentas debería resolver, vino ' + JSON.stringify(buena));

  var sinRef = validarReferenciaVentana_(mapa, 'looker', 'Cuentas');
  afirmar_(sinRef.ok && sinRef.hay === false,
    'un nivel: Cuentas no declara referencia, debería dar hay=false');

  var dos = validarReferenciaVentana_(mapa, 'looker', 'DOS');
  afirmar_(!dos.ok, 'un nivel: DOS→DIGITAL→Cuentas son dos niveles y debería fallar');
  afirmar_(dos.motivo.indexOf('un solo nivel') !== -1,
    'un nivel: el motivo tiene que decir por qué falló, vino "' + dos.motivo + '"');

  var ciclo = validarReferenciaVentana_(mapa, 'looker', 'SOLA');
  afirmar_(!ciclo.ok, 'un nivel: una solapa que se referencia a sí misma debería fallar');
  afirmar_(ciclo.motivo.indexOf('a sí misma') !== -1,
    'un nivel: el ciclo de largo uno tiene motivo propio, vino "' + ciclo.motivo + '"');

  var noFuente = validarReferenciaVentana_(mapa, 'looker', 'ANO_FUENTE');
  afirmar_(!noFuente.ok && noFuente.motivo.indexOf('ignorar') !== -1,
    'un nivel: una referencia a una solapa `ignorar` debería fallar nombrando el uso');

  var fantasma = validarReferenciaVentana_(mapa, 'looker', 'AFANTASMA');
  afirmar_(!fantasma.ok && fantasma.motivo.indexOf('NO_EXISTE') !== -1,
    'un nivel: una referencia a una solapa no registrada debería fallar nombrándola');

  return 'referencia de ventana: un nivel resuelve; dos niveles, ciclo, `ignorar` y solapa ' +
    'inexistente fallan con motivo propio (4 casos negativos, 2 positivos)';
}

/**
 * `_24` — control positivo del filtro de más de una condición.
 *
 * Los cinco casos que el prompt declara imprescindibles, y el que más importa es el tercero:
 * **`&` simple vive en los datos** —dos URLs de `looker/…/post_meta`— y el corte tiene que ser
 * en `&&` y sólo en `&&`. Sin este control, la elección de separador es una afirmación.
 *
 * Se prueban `parsearFiltro_` y `primeraCondicionQueFalla_` directo, sin planilla: la
 * resolución por `MAPEO` es del llamador y tiene su propio caso, el quinto, que se arma con un
 * campo que ninguna base mapea.
 */
function probarFiltroMulticondicion_() {
  function condicionesDe_(texto) {
    var r = parsearFiltro_(texto);
    afirmar_(r.ok, 'multicondición: "' + texto + '" no parseó — ' + r.motivo);
    return r.condiciones;
  }

  // 1 · Una condición sola: misma forma, lista de uno.
  var una = parsearFiltro_('estado=Activa');
  afirmar_(una.ok && !una.vacio, 'multicondición: una condición debería parsear');
  afirmar_(una.condiciones.length === 1, 'multicondición: `estado=Activa` es 1 condición, vinieron ' + una.condiciones.length);
  afirmar_(una.condiciones[0].campo === 'estado' && una.condiciones[0].valor === 'Activa' &&
    una.condiciones[0].op === '=' && una.condiciones[0].negado === false,
    'multicondición: la condición sola quedó ' + JSON.stringify(una.condiciones[0]));

  var vacio = parsearFiltro_('');
  afirmar_(vacio.ok && vacio.vacio && vacio.condiciones.length === 0,
    'multicondición: el filtro vacío debería seguir siendo `vacio` con lista de cero');

  // 2 · Tres condiciones — el caso real que viene: todas verdaderas, y una falsa.
  var tres = condicionesDe_('nombre_campaña~=JM && estado=Activa && Plataforma=Meta');
  afirmar_(tres.length === 3, 'multicondición: se esperaban 3 condiciones, vinieron ' + tres.length);
  afirmar_(tres[0].op === '~=' && tres[1].campo === 'estado' && tres[2].valor === 'Meta',
    'multicondición: las tres quedaron ' + JSON.stringify(tres));

  var filaBuena = { 'nombre_campaña': 'RDV JM | Caballito 17/12', estado: 'Activa', 'Plataforma': 'Meta' };
  var filaMala = { 'nombre_campaña': 'RDV JM | Caballito 17/12', estado: 'Finalizada', 'Plataforma': 'Meta' };
  var lee = function (o) { return function (campo) { return o[campo]; }; };
  afirmar_(primeraCondicionQueFalla_(tres, lee(filaBuena)) === null,
    'multicondición: la fila con las tres verdaderas tendría que pasar');
  var falla = primeraCondicionQueFalla_(tres, lee(filaMala));
  afirmar_(falla && falla.campo === 'estado',
    'multicondición: la fila con `estado` distinto tendría que fallar por `estado`, falló por ' + JSON.stringify(falla));

  // Y el negado en conjunción, que es como se escribe `imp_prog` por resta (`R-24`).
  var resta = condicionesDe_('Plataforma!=Meta && Plataforma!=Google ads');
  afirmar_(resta.length === 2 && resta[0].negado && resta[1].negado,
    'multicondición: las dos negaciones de la resta quedaron ' + JSON.stringify(resta));
  afirmar_(primeraCondicionQueFalla_(resta, lee({ 'Plataforma': 'DV360' })) === null,
    'multicondición: DV360 tendría que pasar las dos negaciones');
  afirmar_(primeraCondicionQueFalla_(resta, lee({ 'Plataforma': 'Google ads' })) !== null,
    'multicondición: Google ads NO tendría que pasar la resta');

  // 3 · Un `&` simple **no** parte. Es una de las dos URLs medidas en los datos el 10/08.
  var url = 'https://www.facebook.com/photo?fbid=1447021517457493&set=p.1447021517457493';
  var conAmpersand = condicionesDe_('post_meta=' + url);
  afirmar_(conAmpersand.length === 1,
    'multicondición: una URL con `&` simple NO se parte — vinieron ' + conAmpersand.length + ' condiciones');
  afirmar_(conAmpersand[0].valor === url,
    'multicondición: el valor con `&` llegó recortado: ' + conAmpersand[0].valor);
  afirmar_(valorPasaFiltro_(url, conAmpersand[0]),
    'multicondición: la URL con `&` tendría que matchearse a sí misma');

  // 4 · Una condición mal escrita entre dos buenas: falla, y el motivo dice CUÁL.
  var mala = parsearFiltro_('estado=Activa && Plataforma Meta && eje=M2');
  afirmar_(!mala.ok, 'multicondición: `Plataforma Meta` no tiene operador y debería fallar');
  afirmar_(mala.motivo.indexOf('condición 2 de 3') !== -1,
    'multicondición: el motivo tiene que decir cuál falló, vino "' + mala.motivo + '"');

  var doble = parsearFiltro_('estado=Activa && && eje=M2');
  afirmar_(!doble.ok && doble.motivo.indexOf('condición 2 de 3') !== -1,
    'multicondición: dos `&&` seguidos deberían fallar nombrando la condición vacía, vino "' + doble.motivo + '"');

  // Con una sola condición el mensaje queda como antes del `_24`: sin «condición N de M».
  var solaMala = parsearFiltro_('Plataforma Meta');
  afirmar_(!solaMala.ok && solaMala.motivo.indexOf('condición') === -1,
    'multicondición: con una sola condición el motivo no debería numerarla, vino "' + solaMala.motivo + '"');

  // 5 · Un campo que MAPEO no tiene hace fallar el filtro ENTERO, no filtra por los otros dos.
  //     Se prueba contra el llamador real, con una base y solapa que existen.
  var fila = { marcador: '(prueba _24)', base_id: 'looker' };
  var filas = [{ 'nombre_campaña': 'RDV JM | x', 'estado': 'Activa' }];
  var r = aplicarFiltroDeMarcador_('estado=Activa && no_existe_este_campo_24=x', fila,
    'resumen_metricas_dinamico', filas, false);
  afirmar_(!r.ok, 'multicondición: un campo sin MAPEO tiene que hacer fallar el filtro entero');
  afirmar_(r.motivo.indexOf('filtro_campo_no_mapeado') !== -1 &&
    r.motivo.indexOf('no_existe_este_campo_24') !== -1 &&
    r.motivo.indexOf('condición 2 de 2') !== -1,
    'multicondición: el motivo tiene que nombrar el campo y la condición, vino "' + r.motivo + '"');
  afirmar_(r.filas === undefined,
    'multicondición: un filtro que falla NO devuelve filas — devolvió ' + JSON.stringify(r.filas));

  // Y la guarda que hace ruidoso el cambio de firma.
  var rompio = false;
  try { valorPasaFiltro_('x', parsearFiltro_('a=b')); } catch (e) { rompio = true; }
  afirmar_(rompio, 'multicondición: pasarle el resultado de parsearFiltro_ a valorPasaFiltro_ tiene que romper, no filtrar mal');

  return 'filtro multicondición: `&&` parte, `&` simple no; 3 condiciones y la resta de `R-24`; ' +
    'el motivo nombra la condición; un campo sin MAPEO falla entero (5 casos + la guarda de firma)';
}

/**
 * `_25` §0.2 — **los tres `imp_*` por plataforma particionan su universo**, así que
 * `imp_total` tiene que ser exactamente su suma. Sintético: se le dan filas armadas a mano que
 * cubren los ocho valores de `Plataforma` medidos el 10/08 —incluido **`Twitch ` con el espacio
 * al final**— y se afirma que cada fila cae en **uno y sólo uno** de los tres.
 *
 * Es la mitad sintética del control; la que mira la planilla viva es
 * `controlParticionImpresiones_`, abajo. Esta prueba el **mecanismo** —que la negación conjunta
 * sea el complemento de las dos igualdades— y por eso puede vivir adentro de la suite sin
 * romper su contrato de no tocar la hoja.
 */
function probarParticionImpresiones_() {
  var jm = 'nombre_campaña~=JM && estado=Activa';
  var meta = parsearFiltro_(jm + ' && Plataforma=Meta');
  var google = parsearFiltro_(jm + ' && Plataforma=Google ads');
  var prog = parsearFiltro_(jm + ' && Plataforma!=Meta && Plataforma!=Google ads');
  var total = parsearFiltro_(jm);
  afirmar_(meta.ok && google.ok && prog.ok && total.ok, 'partición: los cuatro filtros tienen que parsear');

  // Los ocho valores medidos el 10/08 sobre `looker/DIGITAL.Plataforma`, más los dos casos que
  // el diseño por resta existe para cubrir: una plataforma nueva y una mal escrita.
  var plataformas = ['Meta', 'Google ads', 'DV360', 'TikTok', 'Mercado Libre', 'Twitter',
    'Twitch ', 'Uber', 'PlataformaQueTodaviaNoExiste', ''];
  var filas = plataformas.map(function (p) {
    return { 'nombre_campaña': 'RDV JM | Caballito', 'estado': 'Activa', 'Plataforma': p, 'Impresiones': 10 };
  });
  // Y dos que NO son del universo: una GCBA y una que no está `Activa`.
  filas.push({ 'nombre_campaña': 'CAMPAÑA GCBA | x', 'estado': 'Activa', 'Plataforma': 'Meta', 'Impresiones': 10 });
  filas.push({ 'nombre_campaña': 'RDV JM | x', 'estado': 'Finalizada', 'Plataforma': 'Meta', 'Impresiones': 10 });

  function pasa(o, f) {
    return primeraCondicionQueFalla_(f.condiciones, function (c) { return o[c]; }) === null;
  }

  var enTotal = 0, sumaDeTres = 0;
  filas.forEach(function (o, i) {
    var enM = pasa(o, meta), enG = pasa(o, google), enP = pasa(o, prog), enT = pasa(o, total);
    var cuantos = (enM ? 1 : 0) + (enG ? 1 : 0) + (enP ? 1 : 0);
    if (enT) {
      enTotal++;
      sumaDeTres += cuantos;
      afirmar_(cuantos === 1, 'partición: la fila ' + i + ' (Plataforma "' + o['Plataforma'] +
        '") cae en ' + cuantos + ' de los tres tokens, tiene que caer en exactamente 1');
    } else {
      afirmar_(cuantos === 0, 'partición: la fila ' + i + ' está fuera del universo JM+Activa ' +
        'y sin embargo cae en ' + cuantos + ' token(s)');
    }
  });

  afirmar_(enTotal === 10, 'partición: se esperaban 10 filas en el universo JM+Activa, hubo ' + enTotal);
  afirmar_(sumaDeTres === enTotal,
    'partición: la suma de los tres (' + sumaDeTres + ') tiene que igualar el total (' + enTotal + ')');

  // El caso que la regla existe para cubrir, dicho aparte porque es el que se olvida: una
  // plataforma que nadie enumeró cae en `imp_prog`, no afuera.
  afirmar_(pasa({ 'nombre_campaña': 'RDV JM', 'estado': 'Activa', 'Plataforma': 'PlataformaQueTodaviaNoExiste' }, prog),
    'partición: una plataforma nueva tiene que caer en imp_prog por resta');
  afirmar_(pasa({ 'nombre_campaña': 'RDV JM', 'estado': 'Activa', 'Plataforma': 'Twitch ' }, prog),
    'partición: `Twitch ` con espacio tiene que caer en imp_prog, no desaparecer');

  return 'partición de impresiones: 10 filas del universo, cada una en exactamente 1 de los 3 ' +
    'tokens; una plataforma nueva y una con espacio caen en imp_prog por resta';
}

/**
 * `_25` §0.2, la mitad que mira la planilla viva — **y por eso está FUERA de
 * `correrPruebasDiff_`**, cuyo contrato es no tocar la hoja. Se corre a mano:
 * `node tools/api.js llamar fn=controlParticionImpresiones_`.
 *
 * Lee los filtros **tal como están cableados en `MARCADORES`** —no una copia— y afirma sobre las
 * filas de la ventana en curso que `imp_total` es exactamente la suma de los tres. **El día que
 * alguien convierta `imp_prog` en una lista explícita, falla acá y no en un deck**, que es todo
 * el punto: la prueba sintética de arriba no lo agarraría, porque no lee lo que está cableado.
 */
function controlParticionImpresiones_() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MARCADORES');
  if (!hoja) return { ok: false, motivo: 'La hoja MARCADORES no existe.' };
  var datos = hoja.getDataRange().getValues();
  var h = datos[0];
  var iM = h.indexOf('marcador'), iF = h.indexOf('filtro'),
      iS = h.indexOf('solapa'), iC = h.indexOf('campo_logico'), iB = h.indexOf('base_id');

  var filtroDe = {}, fuenteDe = {};
  for (var f = 1; f < datos.length; f++) {
    filtroDe[datos[f][iM]] = String(datos[f][iF] || '');
    fuenteDe[datos[f][iM]] = datos[f][iB] + '/' + datos[f][iS] + '/' + datos[f][iC];
  }

  var grupos = [
    { total: 'imp_total', partes: ['imp_meta', 'imp_google', 'imp_prog'] },
    { total: 'gcba_imp_total', partes: ['gcba_imp_meta', 'gcba_imp_google', 'gcba_imp_prog'] }
  ];

  var faltan = [];
  grupos.forEach(function (g) {
    [g.total].concat(g.partes).forEach(function (t) { if (!(t in filtroDe)) faltan.push(t); });
  });
  if (faltan.length) return { ok: false, motivo: 'sin fila en MARCADORES: ' + faltan.join(', ') };

  // Todos tienen que salir de la MISMA fuente, o la igualdad no significa nada.
  var fuentes = {};
  Object.keys(fuenteDe).forEach(function (t) {
    if (t.indexOf('imp_') !== -1) fuentes[fuenteDe[t]] = (fuentes[fuenteDe[t]] || 0) + 1;
  });

  var ventana = resolverVentana({});
  if (!ventana.ok) return { ok: false, motivo: 'Ventana no resuelta: ' + ventana.motivo };
  var lectura = leerFuente('looker', ventana, 'DIGITAL');
  if (!lectura.ok) return { ok: false, motivo: lectura.motivo };

  function medir(token) {
    var r = aplicarFiltroDeMarcador_(filtroDe[token], { marcador: token, base_id: 'looker' },
      'DIGITAL', lectura.filas, false);
    if (!r.ok) return { ok: false, motivo: r.motivo };
    var suma = 0;
    r.filas.forEach(function (o) { var v = o['Impresiones']; if (typeof v === 'number') suma += v; });
    return { ok: true, filas: r.filas.length, suma: suma };
  }

  var reporte = [];
  var todoCierra = true;
  grupos.forEach(function (g) {
    var t = medir(g.total);
    var partes = g.partes.map(medir);
    if (!t.ok || partes.some(function (p) { return !p.ok; })) {
      todoCierra = false;
      reporte.push({ total: g.total, ok: false, motivo: (t.motivo || '') + partes.map(function (p) { return p.motivo || ''; }).join(' ') });
      return;
    }
    var sumaPartes = partes.reduce(function (a, p) { return a + p.suma; }, 0);
    var filasPartes = partes.reduce(function (a, p) { return a + p.filas; }, 0);
    var cierra = (sumaPartes === t.suma) && (filasPartes === t.filas);
    if (!cierra) todoCierra = false;
    reporte.push({
      total: g.total, ok: cierra,
      importe_total: t.suma, importe_partes: sumaPartes, delta_importe: sumaPartes - t.suma,
      filas_total: t.filas, filas_partes: filasPartes, delta_filas: filasPartes - t.filas,
      partes: g.partes.map(function (n, i) { return n + ': ' + partes[i].filas + ' fila(s), ' + partes[i].suma; })
    });
  });

  return {
    ok: todoCierra,
    ventana: { desde: formatearFecha_(ventana.desde), hasta: formatearFecha_(ventana.hasta) },
    filas_en_ventana: lectura.filas.length,
    fuentes_de_los_ocho: fuentes,
    grupos: reporte
  };
}

/**
 * `_44` / `D-30` — control positivo de la rama por cuenta declarativa.
 *
 * Prueba las dos funciones puras directo, sin planilla: `planDeLecturaPorCuenta_` recibe el
 * resultado de `buscarMapeo` por parámetro justamente para esto.
 *
 * **Los fixtures están elegidos para distinguir afirmaciones, no sólo para pasar** (`CLAUDE.md`
 * §4). El del filtro es el caso: con `[3387, 3289, 3387]` y buscando `3289`, el resultado —una
 * fila, la del medio— **no coincide** ni con "devuelve la primera", ni con "devuelve la última",
 * ni con "devuelve todas". Un fixture de dos filas donde la buscada fuera la primera habría
 * pasado con las cuatro implementaciones.
 */
function probarRamaPorCuentaDeclarativa_() {
  // ── 1 · filtra por la cuenta del ítem ──────────────────────────────────────────────────
  var filas = [
    { ID: '3387-JULJDGGC', v: 10 },
    { ID: '  3289-JUNJDGAG ', v: 20 },
    { ID: '3387-JULJDGGC', v: 30 }
  ];

  var unaSola = filtrarFilasPorCuenta_(filas, 'ID', '3289-JUNJDGAG');
  afirmar_(unaSola.length === 1 && unaSola[0].v === 20,
    'rama por cuenta: buscando 3289 sobre [3387, 3289, 3387] tiene que volver esa sola fila ' +
    '(la del medio), vinieron ' + unaSola.length + ' con v=' + unaSola.map(function (f) { return f.v; }));

  // El id de la fila trae espacios de más a propósito: si el filtro comparara crudo, el caso de
  // arriba daría cero. Esto verifica que se normalizan **los dos lados**, no sólo el buscado.
  var dosIguales = filtrarFilasPorCuenta_(filas, 'ID', ' 3387-JULJDGGC');
  afirmar_(dosIguales.length === 2,
    'rama por cuenta: una cuenta con dos filas tiene que devolver las dos, vinieron ' + dosIguales.length);

  var ninguna = filtrarFilasPorCuenta_(filas, 'ID', '9999-NOEXISTE');
  afirmar_(ninguna.length === 0,
    'rama por cuenta: una cuenta sin filas devuelve cero, no todas — vinieron ' + ninguna.length);

  // ── 2 · sin `id_cuenta` falla, y falla POR ESO ─────────────────────────────────────────
  // El mapeo se pasa **ok** a propósito: si estuviera mal, el caso pasaría por el motivo
  // equivocado y no distinguiría esta afirmación de la siguiente.
  var sinCuenta = planDeLecturaPorCuenta_('enc_x', 'reuniones', 'Agenda JM', 'id_cuenta', '',
    { ok: true, columna: 'A' });
  afirmar_(!sinCuenta.ok,
    'rama por cuenta: sin `id_cuenta` NO puede caer a leer la solapa entera');
  afirmar_(sinCuenta.motivo.indexOf('@sin_id_cuenta') !== -1,
    'rama por cuenta: el motivo tiene que nombrar el hueco, vino "' + sinCuenta.motivo + '"');

  // ── 3 · la guarda del campo declarado dispara, y dispara POR ESO ───────────────────────
  // La cuenta viene bien a propósito, por lo mismo que arriba y al revés.
  var sinMapeo = planDeLecturaPorCuenta_('enc_x', 'reuniones', 'Agenda JM', 'id_cuenta',
    '3289-JUNJDGAG', { ok: false, motivo: 'falta MAPEO: reuniones/Agenda JM/id_cuenta' });
  afirmar_(!sinMapeo.ok,
    'rama por cuenta: un `campo_id_cuenta` que MAPEO no tiene no puede filtrar contra una ' +
    'columna inventada — dejaría pasar todas las filas');
  afirmar_(sinMapeo.motivo.indexOf('@campo_id_cuenta_no_mapeado') !== -1,
    'rama por cuenta: el motivo de la guarda es propio, vino "' + sinMapeo.motivo + '"');

  // ── 4 · el control de que las dos guardas no disparan de más ──────────────────────────
  var bueno = planDeLecturaPorCuenta_('enc_x', 'reuniones', 'Agenda JM', 'id_cuenta',
    '3289-JUNJDGAG', { ok: true, columna: 'A' });
  afirmar_(bueno.ok && bueno.columnaClave === 'A',
    'rama por cuenta: con cuenta y con mapeo tiene que resolver a la columna del mapeo, vino ' +
    JSON.stringify(bueno));

  return 'rama por cuenta declarativa: filtra la cuenta del ítem normalizando los dos lados; ' +
    'sin `id_cuenta` y sin mapeo falla con motivo propio y distinto; el caso bueno resuelve ' +
    '(3 negativos, 4 positivos)';
}

/**
 * `_46` Parte B — la Barrera 1 lee la lista de `CONFIG` y **falla cerrada**.
 *
 * Los fixtures están separados a propósito, y la separación es el punto: un dato que
 * satisface dos afirmaciones a la vez no distingue entre ellas (`CLAUDE.md` §4, el caso de
 * `opULTIMO`). Por eso la clave ausente y la lista vacía son **dos** casos y no uno — los dos
 * rechazan, pero uno significa "nadie sembró la clave" y el otro "alguien borró la celda", y
 * se investigan distinto. Si los dos motivos se colapsaran a `'no autorizado'`, esta prueba
 * seguiría pasando y no probaría nada: por eso afirma que los motivos **difieren**.
 *
 * No toca la planilla: `apiListaAutorizados_` recibe el lector por parámetro.
 */
function probarBarreraDeMails_() {
  var devuelve_ = function (valor) {
    return function () { return valor; };
  };

  // ── 1 · un mail de la lista pasa, con la mugre de una carga a mano ────────────────────
  var t1 = [];
  var r1 = apiListaAutorizados_(t1, devuelve_('  JPCofano@gmail.com , otro@gmail.com'));
  afirmar_(r1.ok, 'barrera de mails: la lista buena tenía que resolver, vino ' + JSON.stringify(r1));
  afirmar_(r1.mails.indexOf('jpcofano@gmail.com') !== -1,
    'barrera de mails: espacios + mayúsculas tenían que normalizar, vino ' + JSON.stringify(r1.mails));
  // El segundo separa `trim` de plegar el case: no tiene mayúsculas, así que si esto pasa y
  // lo de arriba falla, lo que está roto es el `toLowerCase()` y no el `trim()`.
  afirmar_(r1.mails.indexOf('otro@gmail.com') !== -1,
    'barrera de mails: el espacio de adelante tenía que caer solo, vino ' + JSON.stringify(r1.mails));

  // ── 2 · uno que no está en la lista, no aparece resuelto ──────────────────────────────
  afirmar_(r1.mails.indexOf('ajeno@gmail.com') === -1,
    'barrera de mails: un mail que no está en la lista no puede resolver');

  // ── 3 · la clave vacía rechaza ────────────────────────────────────────────────────────
  var t3 = [];
  var r3 = apiListaAutorizados_(t3, devuelve_(''));
  afirmar_(!r3.ok && r3.motivo === 'lista vacía',
    'barrera de mails: la clave vacía tiene que rechazar por `lista vacía`, vino ' + JSON.stringify(r3));

  // Una celda con sólo comas y espacios es "vacía" también, y es el caso realista de alguien
  // que borró los mails pero no la celda.
  var r3b = apiListaAutorizados_([], devuelve_(' , , '));
  afirmar_(!r3b.ok && r3b.motivo === 'lista vacía',
    'barrera de mails: una celda de puras comas tiene que rechazar, vino ' + JSON.stringify(r3b));

  // ── 4 · la clave ausente rechaza, y por un motivo DISTINTO al de la vacía ─────────────
  var t4 = [];
  var r4 = apiListaAutorizados_(t4, devuelve_(null));
  afirmar_(!r4.ok && r4.motivo === 'clave ausente',
    'barrera de mails: la clave ausente tiene que rechazar por `clave ausente`, vino ' + JSON.stringify(r4));
  afirmar_(r4.motivo !== r3.motivo,
    'barrera de mails: `clave ausente` y `lista vacía` no pueden compartir motivo — sin eso ' +
    'la traza no distingue "nadie la sembró" de "alguien la borró"');

  // ── 5 · el fallo de lectura rechaza: no deja pasar "porque no pudo verificar" ─────────
  var t5 = [];
  var r5 = apiListaAutorizados_(t5, function () { throw new Error('no existe la hoja CONFIG'); });
  afirmar_(!r5.ok && r5.motivo === 'config ilegible',
    'barrera de mails: el fallo de lectura tiene que rechazar por `config ilegible`, vino ' + JSON.stringify(r5));

  // ── 6 · sin planilla atada: rechaza con motivo propio y NO explota (`_46.1`) ──────────
  // Es el caso real de `servirPanel_`, que llama a la barrera sin nada atado. Que esta línea
  // devuelva en vez de tirar ES la afirmación: si `apiListaAutorizados_` dejara propagar la
  // excepción, la prueba moriría acá con el mensaje de `apiHojaControl_`.
  var t6 = [];
  var r6 = apiListaAutorizados_(t6, function () {
    throw new Error('No hay hoja de control: getActiveSpreadsheet() devolvió null y la ' +
      'propiedad HOJA_CONTROL_ID no está seteada');
  });
  afirmar_(!r6.ok, 'barrera de mails: sin planilla atada tiene que rechazar, vino ' + JSON.stringify(r6));
  afirmar_(t6.join(' ').indexOf('no se pudo leer CONFIG') !== -1,
    'barrera de mails: sin planilla atada la traza tiene que decir por qué, vino ' + JSON.stringify(t6));

  return 'barrera 1 desde CONFIG: normaliza espacios y mayúsculas por separado; clave vacía, ' +
    'clave ausente y fallo de lectura rechazan los tres con motivos distinguibles; sin planilla ' +
    'atada rechaza y no explota (6 negativos, 3 positivos)';
}

function correrPruebasDiff_() {
  var pruebas = [
    probarBloqueDeAlcance_,
    probarMigracionesEnDiff_,
    probarSoloEnHoja_,
    probarProtegidasConDiferencia_,
    probarResumenDesagregado_,
    probarListaBlancaValores_,
    probarDespachoOperaciones_,
    probarSemanaR11_,
    probarFormatoMarcador_,
    probarRatioEnDespachador_,
    probarReferenciaVentanaUnNivel_,
    probarFiltroMulticondicion_,
    probarParticionImpresiones_,
    probarRamaPorCuentaDeclarativa_,
    probarBarreraDeMails_
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
  var ui = ui_();
  ui.alert('Pruebas del diff de configuración', correrPruebasDiff_(), ui.ButtonSet.OK);
}

/**
 * `D-32` — **el sembrador no degrada un `uso` en silencio.** Escrita el 14/08/2026 por el
 * bloque 3 del `_7` y **NO corrida**: la parte que importa necesita la planilla.
 *
 * **El control positivo es el caso real, no uno inventado:** `digital/CAMPAÑAS_DESGLOCE_DIGITAL`
 * en `uso = fuente` contra un seed que decía `ignorar`. Es exactamente lo que pasó el 14/08 y lo
 * que `D-32` viene a impedir. Un cambio de este tipo verificado contra un caso distinto del que
 * lo originó no está verificado.
 *
 * **Los fixtures separan lo que hay que separar.** `fuente → ignorar` y `fuente → revisar` son
 * las dos degradaciones reales; `revisar → ignorar` **no lo es** —ninguna de las dos se lee— y
 * está puesta a propósito para que la prueba distinga *"salió de fuente"* de *"cambió de
 * etiqueta"*. Sin ese tercer caso, una implementación que marcara **todo** cambio de `uso` como
 * degradación pasaría igual, y el aviso terminaría ignorado por ruidoso.
 */
function probarGateDeUsoDeSolapas_() {
  // ── 1 · las degradaciones: salir de `fuente` ──────────────────────────────────────────
  afirmar_(esDegradacionDeUso_('fuente', 'ignorar') === true,
    'D-32: fuente → ignorar es degradación (el caso de CAMPAÑAS_DESGLOCE_DIGITAL del 14/08)');
  afirmar_(esDegradacionDeUso_('fuente', 'revisar') === true,
    'D-32: fuente → revisar también apaga la lectura, buscarMapeo sólo acepta fuente');
  afirmar_(esDegradacionDeUso_('fuente', 'derivada') === true,
    'D-32: fuente → derivada apaga la lectura igual');

  // ── 2 · lo que NO es degradación, y es lo que le da valor a la prueba ─────────────────
  // Si esto diera `true`, la implementación estaría marcando cualquier cambio de `uso` y el
  // aviso serviría para nada. Éste es el fixture que distingue las dos implementaciones.
  afirmar_(esDegradacionDeUso_('revisar', 'ignorar') === false,
    'D-32: revisar → ignorar NO es degradación — ninguna de las dos se lee');
  afirmar_(esDegradacionDeUso_('ignorar', 'fuente') === false,
    'D-32: ignorar → fuente es lo contrario de una degradación');
  afirmar_(esDegradacionDeUso_('fuente', 'fuente') === false,
    'D-32: sin cambio no hay degradación');

  // ── 3 · la mugre de una carga a mano no puede cambiar el veredicto ────────────────────
  // `R-10`: se normalizan los dos lados. Una celda tipeada con espacios de más es el caso
  // realista, y si el gate se salteara por eso la protección no existiría justo donde hace falta.
  afirmar_(esDegradacionDeUso_('  fuente ', 'ignorar') === true,
    'D-32: el `uso` de la hoja llega con espacios y tiene que normalizar igual');

  return 'probarGateDeUsoDeSolapas_: 7 afirmaciones OK (la parte pura de D-32)';
}

/**
 * ⚠ **PREPARADA Y SIN CORRER — necesita la planilla.** La corre una persona a la mañana.
 *
 * Verifica `D-32` **de punta a punta**, que es lo único que prueba que el gate sirve: la parte
 * pura de arriba sólo mide `esDegradacionDeUso_`, y el gate podría estar bien calculado y mal
 * cableado dentro de `aplicarClasificacionSolapas_`.
 *
 * **Es de sólo lectura y no modifica `SOLAPAS`**: compara lo que la hoja tiene hoy contra lo que
 * el seed declara, y verifica que el sembrador **conservaría** el `uso` de la hoja. No corre
 * `aplicarClasificacionSolapas_` — correrla sería escribir.
 *
 * **Precondición para que la prueba signifique algo:** que exista al menos una fila donde la
 * hoja diga `fuente` y el seed diga otra cosa. Si no existe, la prueba **no pasa: se abstiene**,
 * y lo dice — una prueba verde sobre cero casos es exactamente el modo de falla del `Pruebas.gs`
 * del 12/08.
 */
function probarGateDeUsoContraLaHoja_() {
  var d = diffSolapasSinAplicar_();
  if (!d.ok) return 'ABSTENIDA: ' + d.motivo;

  if (!d.degradaciones.length) {
    return 'ABSTENIDA — no hay ninguna fila donde la hoja diga `fuente` y el seed otra cosa. ' +
      'La prueba no tiene caso que verificar hoy; eso NO es un verde. Para forzar el caso: ' +
      'poner una solapa en `fuente` cuyo seed diga `ignorar` y volver a correr.';
  }

  var lineas = ['Casos de degradación encontrados: ' + d.degradaciones.length];
  d.degradaciones.forEach(function (x) {
    lineas.push('  ' + x.clave + ': hoja=fuente · seed=' + x.en_seed + ' · origen=' + x.origen);
  });
  lineas.push('', 'Con `D-32`, `aplicarClasificacionSolapas_` conserva el `uso` de la hoja en las ' +
    d.degradaciones.length + ' y las reporta en `usosConservados`.');
  lineas.push('VERIFICACIÓN A MANO, que es la que cierra: correr el sembrador y confirmar que ' +
    'esas filas siguen en `fuente` y aparecen listadas en el resumen.');
  return lineas.join('\n');
}
