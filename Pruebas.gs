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
function correrPruebasDiff_() {
  var pruebas = [
    probarBloqueDeAlcance_,
    probarMigracionesEnDiff_,
    probarSoloEnHoja_,
    probarProtegidasConDiferencia_,
    probarResumenDesagregado_
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
