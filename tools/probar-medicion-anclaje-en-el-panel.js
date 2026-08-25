/**
 * `2026-08-24_2` Parte D — el lector de `ANCLAJE_MEDICION` en el panel: el vacío que NO es cero, y
 * el desfase contra la última corrida.
 *
 * ⭐ **Extrae las funciones reales de `PanelBackend.gs`, no las reimplementa** (`CLAUDE.md` §4).
 *
 * ⛔⛔ **El bug que este banco fija, y es de los que no fallan:** `registrarFalloAnclaje_` deja los
 * contadores **vacíos a propósito** —*«un 0 se lee como "se intentó anclar cero y salió bien", que
 * es una afirmación y es falsa»*— y el lector hacía `Number(x) || 0`, que **convertía el vacío en
 * cero**. El escritor es del 25/08 y el lector del 23/08: **nunca se cruzaron**, así que una fila de
 * FALLO se veía como una corrida perfecta de cero encuentros. Es la familia del `String(celda)`
 * sobre booleanos: convertir antes de mirar destruye la distinción que el otro lado guardó.
 *
 * Corre con: `node tools/probar-medicion-anclaje-en-el-panel.js`
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

let ok = 0;
let mal = 0;
const avisos = [];

function af(cond, texto, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + texto); }
  else { mal++; console.log('  ❌ ' + texto + (detalle ? ' — ' + detalle : '')); }
}

/** ⚠ Por posición, nunca por regex con `\n}\n`: los `.gs` están en CRLF. */
function extraer(archivo, firma) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const desde = texto.indexOf(firma);
  if (desde === -1) return null;
  const fin = texto.indexOf('\n}', desde);
  return fin === -1 ? null : texto.slice(desde, fin + 2);
}

function hojaDe(headers, filas) {
  const todo = [headers].concat(filas);
  return {
    getLastRow: () => todo.length,
    getLastColumn: () => headers.length,
    getDataRange: () => ({ getValues: () => todo.map(f => f.slice()) })
  };
}

/** Contexto con los tres lectores de `PanelBackend.gs` y la plataforma falseada. */
function contexto(hojas) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, Boolean, isNaN,
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: (n) => hojas[n] || null }) },
    // Formateadores reales del panel: acá sólo hace falta que no tiren y devuelvan algo estable.
    formatearFechaHora_: (d) => d.toISOString().slice(0, 16).replace('T', ' '),
    fechaLegible_: (d) => d.toISOString().slice(0, 10)
  };
  vm.createContext(ctx);
  ['function numeroOVacio_', 'function desfaseContraUltimaCorrida_', 'function panel_ultimaMedicionAnclaje']
    .forEach((firma) => {
      const fn = extraer('PanelBackend.gs', firma);
      if (!fn) {
        mal++;
        console.log('  ❌ no se encontró `' + firma + '` en PanelBackend.gs');
        return;
      }
      vm.runInContext(fn, ctx, { filename: 'PanelBackend.gs (extracto)' });
    });
  return ctx;
}

const HEADERS_MED = ['cuando', 'ventana_desde', 'ventana_hasta', 'periodo_id', 'intentados',
  'anclados', 'baja_confianza', 'sin_link', 'umbral', 'sin_link_detalle', 'excluidas_por_periodo'];
const HEADERS_CORR = ['corrida_id', 'ejecucion', 'informe_id', 'periodo_id', 'deck_id',
  'fecha_generacion', 'tokens_reemplazados', 'faltantes', 'mapa_tokens'];

console.log('ANCLAJE_MEDICION en el panel — el vacío que no es cero, y el desfase\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · `numeroOVacio_` — `null` y `0` son afirmaciones distintas
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · el vacío viaja como `null`, no como cero');
{
  const ctx = contexto({});
  const n = (v) => { ctx.__v = v; return vm.runInContext('numeroOVacio_(__v)', ctx); };

  /* ⭐⭐ LA afirmación de este banco. `0` dice «se midió y dio cero»; `null` dice «no se midió». Son
   * dos cosas y colapsarlas es lo que hacía que un fallo se leyera como una corrida perfecta. */
  af(n('') === null, "la celda vacía → `null`, NO `0`", JSON.stringify(n('')));
  af(n(null) === null && n(undefined) === null, '`null` y `undefined` también');
  af(n(0) === 0, '⭐ y un CERO REAL sigue siendo `0` — la distinción va en los dos sentidos',
    JSON.stringify(n(0)));
  af(n(6) === 6, 'un número normal pasa');
  af(n('6') === 6, 'y un número que Sheets dejó como texto también');
  af(n('hola') === null, 'algo no numérico → `null`, no `NaN`', JSON.stringify(n('hola')));
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · Una fila de FALLO no se lee como una corrida de cero
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · una fila de fallo se distingue de una corrida que ancló cero');
{
  const cuando = new Date('2026-08-25T20:07:00');
  const ctx = contexto({
    // Lo que escribe `registrarFalloAnclaje_`: contadores VACÍOS y el motivo en `sin_link_detalle`.
    ANCLAJE_MEDICION: hojaDe(HEADERS_MED, [
      [cuando, '', '', 'julio_24_30', '', '', '', '', '', 'REUNIONES no tiene filas para anclar', '']
    ])
  });
  const r = vm.runInContext('panel_ultimaMedicionAnclaje()', ctx);

  af(r.es_fallo === true, '⭐ la fila sin contadores se marca `es_fallo`');
  af(r.intentados === null && r.anclados === null && r.sin_link === null,
    'y los contadores llegan `null` — el front pinta `—`, no `0`',
    JSON.stringify([r.intentados, r.anclados, r.sin_link]));
  af(r.sin_link_detalle.length === 1 && r.sin_link_detalle[0].indexOf('REUNIONES') !== -1,
    'el motivo del fallo viaja en `sin_link_detalle`, que en un fallo no tiene otro uso');
}

console.log('\n2b · y una corrida REAL que ancló cero sigue diciendo cero');
{
  /* ⚠ El control positivo obligatorio: si `numeroOVacio_` devolviera `null` para todo, el bloque de
   * arriba pasaría igual y este banco no distinguiría nada. Un `0` medido tiene que sobrevivir. */
  const ctx = contexto({
    ANCLAJE_MEDICION: hojaDe(HEADERS_MED, [
      [new Date('2026-08-25T17:12:00'), '', '', 'agosto_14_20', 6, 6, 0, 0, 0.6, '', '']
    ])
  });
  const r = vm.runInContext('panel_ultimaMedicionAnclaje()', ctx);

  af(r.es_fallo === false, 'una corrida que midió NO es un fallo');
  af(r.intentados === 6 && r.anclados === 6, 'los contadores llegan como números');
  af(r.sin_link === 0 && r.baja_confianza === 0,
    '⭐ y el CERO medido llega como `0`, no como `null`: «corrí y no hubo dudosos» se puede afirmar',
    JSON.stringify([r.sin_link, r.baja_confianza]));
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · El desfase contra la última corrida
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · el desfase: la fila de las 17:12 contra la corrida de las 20:07');
{
  /* ⛔ El caso REAL del 25/08, copiado y no inventado: hasta `9c48769` un anclaje que fallaba no
   * escribía fila, así que la última se leía como «lo último que pasó» cuando era «lo último que
   * salió bien», y pareció que dos instrumentos se contradecían. */
  const ctx = contexto({
    ANCLAJE_MEDICION: hojaDe(HEADERS_MED, [
      [new Date('2026-08-25T17:12:00'), '', '', 'agosto_14_20', 6, 6, 0, 0, 0.6, '', '']
    ]),
    CORRIDAS: hojaDe(HEADERS_CORR, [
      ['jm-20260825-171200', 1, 'jm', 'agosto_14_20', 'd1', new Date('2026-08-25T17:12:30'), 100, 20, ''],
      ['jm-20260825-200700', 1, 'jm', 'julio_24_30', 'd2', new Date('2026-08-25T20:07:00'), 0, 0, '']
    ])
  });
  const r = vm.runInContext('panel_ultimaMedicionAnclaje()', ctx);

  af(r.desfase.ok === true, 'la comparación corrió');
  af(r.desfase.hay_desfase === true, '⭐ hay desfase: la medición es anterior a la última corrida');
  af(r.desfase.minutos === 175, 'y dice CUÁNTO — 175 minutos', String(r.desfase.minutos));
  af(r.desfase.corrida_id === 'jm-20260825-200700',
    'nombra la corrida contra la que compara — un número que distingue no sirve si nadie lo lee');
}

console.log('\n3b · una corrida sana NO informa desfase');
{
  /* ⚠ El control positivo del margen. La medición se escribe DENTRO de la corrida, unos segundos
   * antes de que su fila cierre, así que sin tolerancia **toda** corrida sana avisaría — y un aviso
   * que aparece siempre deja de avisar. */
  const ctx = contexto({
    ANCLAJE_MEDICION: hojaDe(HEADERS_MED, [
      [new Date('2026-08-25T17:12:00'), '', '', 'agosto_14_20', 6, 6, 0, 0, 0.6, '', '']
    ]),
    CORRIDAS: hojaDe(HEADERS_CORR, [
      ['jm-20260825-171200', 1, 'jm', 'agosto_14_20', 'd1', new Date('2026-08-25T17:12:40'), 100, 20, '']
    ])
  });
  const r = vm.runInContext('panel_ultimaMedicionAnclaje()', ctx);
  af(r.desfase.hay_desfase === false,
    '40 segundos después NO es desfase — la medición se escribe adentro de la corrida');
  af(r.desfase.corrida_cuando, 'y la hora de la corrida se muestra igual, haya desfase o no');
}

console.log('\n3c · sin CORRIDAS con qué comparar, lo dice — y no tira');
{
  const ctx = contexto({
    ANCLAJE_MEDICION: hojaDe(HEADERS_MED, [
      [new Date('2026-08-25T17:12:00'), '', '', '', 6, 6, 0, 0, 0.6, '', '']
    ])
  });
  const r = vm.runInContext('panel_ultimaMedicionAnclaje()', ctx);
  /* ⛔ Un instrumento no puede voltear lo que mide, y acá lo que mide es la única vista del
   * anclaje. «No se pudo comparar» se reporta; no se calla y no rompe la pantalla. */
  af(r.ok === true && r.hay === true, 'la medición se devuelve igual: el instrumento no voltea la vista');
  af(r.desfase.ok === false && r.desfase.motivo.indexOf('corrida') !== -1,
    'y el motivo dice que no hay con qué comparar', JSON.stringify(r.desfase));
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Control NEGATIVO — con motivo y con guarda de mutación aplicada
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · romper a propósito: rojo POR EL MOTIVO correcto');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  const casos = [
    {
      nombre: 'volviendo a `Number(x) || 0`, el fallo se lee como una corrida de cero',
      buscar: '    intentados: numeroOVacio_(m.intentados),',
      poner: '    intentados: Number(m.intentados) || 0,',
      probar: (r) => r.intentados === 0
    },
    {
      nombre: 'sin el margen, una corrida sana informa desfase',
      buscar: '    salida.hay_desfase = minutos > 1;',
      poner: '    salida.hay_desfase = minutos > 0;',
      probar: null   // se evalúa aparte, con el fixture sano
    }
  ];

  /* Caso 1: fixture de fallo. */
  {
    const caso = casos[0];
    const mutado = texto.replace(caso.buscar, caso.poner);
    /* ⭐⭐ La guarda que va ANTES de mirar: si el texto mutado es idéntico al original, el caso
     * FALLA — no se saltea. Sin esto el negativo corre sobre el código intacto y da verde. */
    if (mutado === texto) {
      af(false, 'MUTACIÓN NO APLICADA: «' + caso.nombre + '»', 'el patrón no matcheó');
    } else {
      const ctx = { console, Math, JSON, Date, String, Number, Object, Array, Boolean, isNaN,
        SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => null }) },
        formatearFechaHora_: (d) => String(d), fechaLegible_: (d) => String(d) };
      vm.createContext(ctx);
      ['function numeroOVacio_', 'function desfaseContraUltimaCorrida_', 'function panel_ultimaMedicionAnclaje']
        .forEach((f) => {
          const d = mutado.indexOf(f);
          vm.runInContext(mutado.slice(d, mutado.indexOf('\n}', d) + 2), ctx);
        });
      ctx.__hojas = { ANCLAJE_MEDICION: hojaDe(HEADERS_MED, [
        [new Date('2026-08-25T20:07:00'), '', '', '', '', '', '', '', '', 'falló', '']]) };
      ctx.SpreadsheetApp.getActiveSpreadsheet = () => ({ getSheetByName: (n) => ctx.__hojas[n] || null });
      af(caso.probar(vm.runInContext('panel_ultimaMedicionAnclaje()', ctx)),
        'roto: ' + caso.nombre);
    }
  }

  /* Caso 2: fixture sano, 40 segundos de diferencia. */
  {
    const caso = casos[1];
    const mutado = texto.replace(caso.buscar, caso.poner);
    if (mutado === texto) {
      af(false, 'MUTACIÓN NO APLICADA: «' + caso.nombre + '»', 'el patrón no matcheó');
    } else {
      const ctx = { console, Math, JSON, Date, String, Number, Object, Array, Boolean, isNaN,
        formatearFechaHora_: (d) => String(d), fechaLegible_: (d) => String(d) };
      const hojas = {
        ANCLAJE_MEDICION: hojaDe(HEADERS_MED, [
          [new Date('2026-08-25T17:12:00'), '', '', '', 6, 6, 0, 0, 0.6, '', '']]),
        CORRIDAS: hojaDe(HEADERS_CORR, [
          ['c1', 1, 'jm', '', 'd', new Date('2026-08-25T17:12:40'), 1, 1, '']])
      };
      ctx.SpreadsheetApp = { getActiveSpreadsheet: () => ({ getSheetByName: (n) => hojas[n] || null }) };
      vm.createContext(ctx);
      ['function numeroOVacio_', 'function desfaseContraUltimaCorrida_', 'function panel_ultimaMedicionAnclaje']
        .forEach((f) => {
          const d = mutado.indexOf(f);
          vm.runInContext(mutado.slice(d, mutado.indexOf('\n}', d) + 2), ctx);
        });
      af(vm.runInContext('panel_ultimaMedicionAnclaje()', ctx).desfase.hay_desfase === true,
        'roto: ' + caso.nombre);
    }
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · El front pinta el vacío — y ya sabía hacerlo
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · `Panel.html` distingue el fallo y muestra el desfase');
{
  const html = fs.readFileSync(path.join(RAIZ, 'Panel.html'), 'utf8');

  /* ⭐ Lo que hace caro el bug del backend: `num()` **ya devolvía `—` para `null`** desde antes. El
   * front sabía leer el vacío y el backend nunca se lo dejaba llegar. */
  const desdeNum = html.indexOf('function num(');
  const cuerpoNum = html.slice(desdeNum, html.indexOf('\n}', desdeNum));
  af(cuerpoNum.indexOf("return '—'") !== -1,
    "⭐ `num()` ya pintaba `—` para el vacío — el front sabía y el backend no le dejaba llegar");

  af(html.indexOf('if (m.es_fallo)') !== -1,
    '`bloqueMedicionAnclaje` tiene una rama propia para el fallo');
  af(html.indexOf('function bloqueDesfaseAnclaje') !== -1,
    'y existe el bloque del desfase');
  /* ⚠ Y se llama desde las DOS ramas: un desfase que sólo se ve cuando todo anduvo bien no sirve,
   * porque el caso que lo motiva es justamente el del fallo. */
  // ⚠ Se cuentan las LLAMADAS —concatenadas con `+` de los dos lados—, no las apariciones del
  // nombre: la definición también matchea y haría que el conteo diga 3 con dos llamadas.
  const llamadas = (html.match(/\+\s*bloqueDesfaseAnclaje\(m\)\s*\+/g) || []).length;
  af(llamadas === 2,
    '⭐ y se llama desde las DOS ramas — la del fallo también, que es la que lo motiva',
    'se llama ' + llamadas + ' vez/veces');

  /* ⛔ `CLAUDE.md` §4: el panel no puede declarar por su cuenta un valor que el backend conoce —
   * el `var TECHO_S = 350` contra los 150 de la hoja mintió justo donde la persona mira. */
  af(html.indexOf('S.medAnclaje') !== -1 && html.indexOf('panel_ultimaMedicionAnclaje()') !== -1,
    'el front pregunta al backend en vez de contestar por su cuenta');
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
if (avisos.length) {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.\n');
  console.log('⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach(a => console.log('   · ' + a));
} else {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');
}

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Si el panel PINTA bien: acá no hay DOM. Se afirma que las ramas existen y que');
console.log('     el desfase se llama desde las dos, no cómo se ve.');
console.log('   · Que `registrarFalloAnclaje_` escriba de verdad los contadores vacíos: eso vive en');
console.log('     `Union.gs` y lo cubre `probar-faltantes-causas.js`.');
console.log('   · Que las filas VIEJAS de la hoja tengan sentido. Las anteriores a `9c48769` sólo');
console.log('     registran éxitos, y ninguna lectura puede reponer una fila que nunca se escribió.');

process.exit(mal ? 1 : 0);
