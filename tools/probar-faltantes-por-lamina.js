/**
 * `2026-08-24_2` Parte C — el banco de `FALTANTES.lamina_id`: quién la escribe, qué guarda y cómo
 * se agrupa.
 *
 * ⭐ **Extrae las funciones reales de `Generador.gs` y `PanelBackend.gs`, no las reimplementa.**
 * `CLAUDE.md` §4: reproducir la lógica en node es el error que este repo ya cometió cuatro veces.
 * Lo único falseado acá es la plataforma —`SpreadsheetApp`, `SlidesApp` y una hoja en memoria—.
 *
 * ⭐ **Cada bloque lleva control POSITIVO** —algo que TIENE que aparecer— y los negativos exigen
 * **el motivo** y que **la mutación haya ocurrido**. Son tres afirmaciones distintas y ninguna
 * implica a las otras dos (`CLAUDE.md` §4, las tres formas de dar verde sin probar nada).
 *
 * Corre con: `node tools/probar-faltantes-por-lamina.js`
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

/* El esquema de `Instalar.gs`, **copiado y no importado** — mismo criterio que las tres listas de
 * hojas de registro de `CLAUDE.md` §2: un banco que lee el esquema del código que audita deja de
 * ser independiente. ⭐ **Y el desajuste falla**, en el bloque 6: una copia que nadie compara es
 * exactamente la deuda que `tools/listas.js` existe para cazar. */
const HOJAS_CONFIG_ = {
  FALTANTES: {
    headers: ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo', 'causa', 'lamina_id']
  },
  FALTANTES_PREVIO: {
    headers: ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo', 'causa', 'lamina_id']
  }
};

function hojaEnMemoria(headers) {
  const filas = [headers.slice()];
  const vivos = headers.slice();
  const hoja = {
    getName: () => 'hoja',
    getLastRow: () => filas.length,
    getLastColumn: () => vivos.length,
    getMaxColumns: () => vivos.length,
    insertColumnsAfter: () => {},
    setFrozenRows: () => {},
    appendRow: (f) => { filas.push(f.slice()); },
    deleteRows: (desde, cuantas) => { filas.splice(desde - 1, cuantas); },
    getDataRange: () => ({ getValues: () => filas.map(f => f.slice()) }),
    getRange: (fila, col, nFilas, nCols) => ({
      getValues: () => {
        const ancho = nCols || vivos.length;
        const out = [];
        for (let i = 0; i < (nFilas || 1); i++) {
          const origen = filas[fila - 1 + i] || [];
          const linea = [];
          for (let k = 0; k < ancho; k++) linea.push(origen[col - 1 + k] !== undefined ? origen[col - 1 + k] : '');
          out.push(linea);
        }
        return out;
      },
      setValues: (m) => {
        m.forEach((f, i) => {
          const n = fila - 1 + i;
          while (filas.length <= n) filas.push([]);
          f.forEach((v, k) => { filas[n][col - 1 + k] = v; });
        });
        if (fila === 1) { vivos.length = 0; filas[0].forEach(h => vivos.push(h)); }
      },
      clearContent: () => { filas.length = 1; }
    })
  };
  hoja.__filas = filas;
  hoja.__headers = vivos;
  return hoja;
}

/**
 * Una presentación falsa que cuenta cuántas veces le pidieron las notas de cada lámina.
 *
 * ⚠ **El contador es el punto**, no un extra: lo caro de `anclaDeLamina_` es la llamada a la API de
 * Slides, y lo que hay que afirmar del resolvedor es justamente que **no la repite**. Sin contar,
 * «memoiza» y «no memoiza» dan el mismo resultado y el banco no distingue.
 */
function presentacionFalsa(anclas) {
  const llamadas = {};
  const slides = anclas.map((texto, i) => ({
    __n: i + 1,
    getNotesPage: () => ({
      getSpeakerNotesShape: () => {
        llamadas[i + 1] = (llamadas[i + 1] || 0) + 1;
        if (texto === null) return null;
        return { getText: () => ({ asString: () => texto }) };
      }
    })
  }));
  return { getSlides: () => slides, __llamadas: llamadas };
}

/** Contexto con `Generador.gs` y el trozo de `Sellador.gs` que resuelve el ancla. */
function contextoGenerador(hojas, textoGenerador) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    parseInt, parseFloat,
    Logger: { log: () => {} },
    HOJAS_CONFIG_,
    ANCLA_LAMINA_PREFIJO_: '#Lámina:',
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => hojas[n] || null,
        insertSheet: (n) => (hojas[n] = hojaEnMemoria(HOJAS_CONFIG_[n].headers))
      }),
      flush: () => {}
    }
  };
  vm.createContext(ctx);

  // `Sellador.gs` entero arrastra Slides y Drive; se cargan sólo los dos lectores que hacen falta.
  const sellador = fs.readFileSync(path.join(RAIZ, 'Sellador.gs'), 'utf8');
  ['function notasDeLamina_', 'function anclaDeLamina_'].forEach((firma) => {
    const desde = sellador.indexOf(firma);
    if (desde === -1) {
      avisos.push('⚠ no se encontró `' + firma + '` en Sellador.gs — el banco lo está leyendo mal.');
      return;
    }
    const fin = sellador.indexOf('\n}', desde);
    vm.runInContext(sellador.slice(desde, fin + 2), ctx, { filename: 'Sellador.gs (extracto)' });
  });

  const texto = textoGenerador !== undefined
    ? textoGenerador
    : fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  return ctx;
}

console.log('FALTANTES.lamina_id — resolución, escritura y agrupado · código real de Generador.gs, Sellador.gs y PanelBackend.gs\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · `resolvedorDeLaminaId_` — perezoso, memoizado, y no inventa ids
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · el resolvedor lee el ancla una sola vez por lámina');
{
  const ctx = contextoGenerador({});
  const pres = presentacionFalsa([
    '#Lámina:L-030',
    'notas del equipo, sin ancla',
    '#Lámina:',            // prefijo sin id → `(sin id)`
    '#Lámina:L-046 y algo más después'
  ]);
  ctx.__p = pres;
  vm.runInContext('var __r = resolvedorDeLaminaId_(__p)', ctx);
  const r = (n) => { ctx.__n = n; return vm.runInContext('__r(__n)', ctx); };

  af(r(1) === 'L-030', 'lámina 1 → `L-030`', r(1));
  af(r(4) === 'L-046', 'el ancla con texto detrás igual resuelve → `L-046`', r(4));

  /* ⭐ Control POSITIVO del perezoso: la lámina 2, que NUNCA se consultó, no puede haber costado
   * una llamada. Sin esto, «perezoso» y «barre todo el deck» se ven igual desde el resultado. */
  af(pres.__llamadas[2] === undefined,
    'la lámina que nadie consultó NO costó ninguna llamada a la API — el resolvedor es perezoso');

  r(1); r(1); r(1);
  af(pres.__llamadas[1] === 1,
    'cuatro consultas a la lámina 1 = UNA sola llamada a la API', 'fueron ' + pres.__llamadas[1]);

  /* ⛔ Lo que no puede pasar: rellenar con la posición. Un número en una columna que se llama
   * `lamina_id` es la clase de dato que alguien después cruza contra `LAMINAS`, y
   * `orden_plantilla` es reportado y **nunca** autoritativo (`A.2`). */
  af(r(2) === '', 'una lámina sin ancla devuelve vacío — NO su número de posición', JSON.stringify(r(2)));
  af(r(3) === '', 'y `(sin id)` también devuelve vacío: «no está sellada» no es un id', JSON.stringify(r(3)));
  af(r(99) === '' && r(0) === '', 'fuera de rango devuelve vacío sin tirar');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · `laminasDeTokenFijo_` — TODAS las láminas, no la primera
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · un token fijo declara todas sus láminas, ordenadas y sin repetir');
{
  const ctx = contextoGenerador({});
  const pres = presentacionFalsa(['#Lámina:L-030', '#Lámina:L-046', 'sin ancla', '#Lámina:L-046']);
  ctx.__p = pres;
  vm.runInContext('var __r = resolvedorDeLaminaId_(__p)', ctx);
  const laminas = (slides) => { ctx.__s = slides; return vm.runInContext('laminasDeTokenFijo_(__s, __r)', ctx); };

  /* ⭐ La afirmación que define la columna. `replaceAllText` pinta el token en TODAS sus cajas, así
   * que un faltante falta en todas — decir sólo la primera sería medir una y publicarla como total.
   * Es lo que la Parte B necesita para poder afirmar «todas sus láminas están fuera de alcance». */
  af(laminas([2, 1]) === 'L-030 · L-046',
    'dos láminas → las dos, ORDENADAS por número de slide y no por orden de aparición', laminas([2, 1]));
  af(laminas([2, 4]) === 'L-046',
    'dos slides de la MISMA lámina modelo → un solo id, sin repetir', laminas([2, 4]));
  af(laminas([1]) === 'L-030', 'una sola lámina → sin separador', laminas([1]));

  /* Una lámina sin ancla no rompe la lista ni deja un separador colgando: se omite. */
  af(laminas([1, 3]) === 'L-030', 'una lámina sin ancla se omite y no deja un ` · ` suelto', laminas([1, 3]));
  af(laminas([3]) === '' && laminas([]) === '' && laminas(null) === '',
    'sin láminas resolubles devuelve vacío, y `null` no tira');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · La columna llega a la hoja
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · `escribirFaltantes_` escribe `lamina_id` — y una hoja vieja gana la columna');
{
  const HEADERS_SIN_LAMINA = ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo', 'causa'];
  const hojas = { FALTANTES: hojaEnMemoria(HEADERS_SIN_LAMINA) };
  const ctx = contextoGenerador(hojas);
  ctx.__f = [
    { corrida_id: 'C-1', informe_id: 'jm', token: 'camp_titulo', causa: 'sin_fila', motivo: 'x', lamina_id: 'L-046 · L-048' },
    { corrida_id: 'C-1', informe_id: 'jm', token: 'post_alcance @Retiro', causa: 'sin_datos', motivo: 'y', lamina_id: 'L-036' }
  ];
  const salida = vm.runInContext('escribirFaltantes_(__f)', ctx);

  const headers = hojas.FALTANTES.__filas[0];
  const iLam = headers.indexOf('lamina_id');
  af(iLam === 8, '`lamina_id` quedó escrita en la columna 9, al final', 'quedó en ' + iLam);
  /* ⭐ Control positivo obligatorio: las ocho de siempre siguen donde estaban. Una reconciliación
   * que reordena cambia el significado de las filas ya escritas — peor que no tener la columna. */
  af(HEADERS_SIN_LAMINA.every((h, i) => headers[i] === h),
    'y las ocho viejas siguen en su posición original — no se reordenó nada');
  af(salida.filas === 2, 'las dos filas se escribieron');
  af(hojas.FALTANTES.__filas[1][iLam] === 'L-046 · L-048',
    'la celda guarda las DOS láminas tal cual', JSON.stringify(hojas.FALTANTES.__filas[1][iLam]));
  af(hojas.FALTANTES.__filas[2][iLam] === 'L-036', 'y la de una sección repetible guarda UNA');
}

console.log('\n3b · una fila SIN `lamina_id` no rompe: la celda queda vacía, no `undefined`');
{
  const hojas = { FALTANTES: hojaEnMemoria(HOJAS_CONFIG_.FALTANTES.headers) };
  const ctx = contextoGenerador(hojas);
  ctx.__f = [{ corrida_id: 'C-1', informe_id: 'jm', token: 'x', causa: 'no_alcanzado', motivo: 'm' }];
  vm.runInContext('escribirFaltantes_(__f)', ctx);
  const v = hojas.FALTANTES.__filas[1][8];
  /* ⚠ Es el caso del barrido tras un corte, que deja la celda vacía A PROPÓSITO para no gastar
   * llamadas a la API dentro de la reserva de cierre. Vacío dice «no se midió». */
  af(v === '', 'vacío, no la cadena "undefined" — el `"undefined"` como texto ya costó un mes en `_44`',
    JSON.stringify(v));
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · El panel: parseo y agrupado
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · el panel parte la celda y agrupa por lámina');
{
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error };
  vm.createContext(ctx);

  // `CAUSAS_FALTANTE_` vive en `Generador.gs` y `agruparFaltantesPorLamina_` lo usa: se cargan los
  // dos en el MISMO contexto, que es como corren de verdad en el scope global de Apps Script.
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const mCausas = gen.match(/var CAUSAS_FALTANTE_ = \{[\s\S]*?\n\};/);
  if (!mCausas) {
    mal++;
    console.log('  ❌ no se encontró `CAUSAS_FALTANTE_` en Generador.gs');
  } else {
    vm.runInContext(mCausas[0], ctx, { filename: 'Generador.gs (extracto)' });
  }

  const panel = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  ['function partirLaminasDeFaltante_', 'function agruparFaltantesPorLamina_'].forEach((firma) => {
    const desde = panel.indexOf(firma);
    if (desde === -1) {
      mal++;
      console.log('  ❌ no se encontró `' + firma + '` en PanelBackend.gs');
      return;
    }
    const fin = panel.indexOf('\n}', desde);
    vm.runInContext(panel.slice(desde, fin + 2), ctx, { filename: 'PanelBackend.gs (extracto)' });
  });

  const partir = (v) => { ctx.__v = v; return vm.runInContext('partirLaminasDeFaltante_(__v)', ctx); };

  af(partir('L-046 · L-048').join('|') === 'L-046|L-048', 'parte por `·` y trimea', partir('L-046 · L-048').join('|'));
  af(partir('L-036').join('|') === 'L-036', 'una sola lámina');
  af(partir('').length === 0 && partir(null).length === 0 && partir(undefined).length === 0,
    'vacío, `null` y `undefined` dan lista vacía — no una lista con un id vacío adentro');
  af(partir('L-046 ·  · L-048').length === 2, 'un separador de más no produce un id vacío');

  const filas = [
    { token: 'camp_titulo', causa: 'sin_fila', laminas: ['L-046', 'L-048'] },
    { token: 'camp_ctr', causa: 'sin_fila', laminas: ['L-046'] },
    { token: 'camp_vtr', causa: 'escritor', laminas: ['L-046'] },
    { token: 'post_alcance', causa: 'sin_datos', laminas: ['L-036'] },
    { token: 'post_alcance', causa: 'sin_datos', laminas: ['L-036'] },   // otro ítem, mismo token
    { token: 'imp_meta', causa: 'no_alcanzado', laminas: [] }            // sin lámina: no agrupa
  ];
  ctx.__filas = filas;
  const grupos = vm.runInContext('agruparFaltantesPorLamina_(__filas)', ctx);
  const porId = {};
  grupos.forEach(g => { porId[g.lamina_id] = g; });

  af(grupos.length === 3, 'tres láminas agrupadas', 'fueron ' + grupos.length);
  af(grupos.map(g => g.lamina_id).join('|') === 'L-036|L-046|L-048',
    'ordenadas por `lamina_id`, no por cantidad', grupos.map(g => g.lamina_id).join('|'));

  /* ⭐ La afirmación que define el conteo: una fila con dos láminas cuenta en LAS DOS. La suma de
   * las láminas (2+3+1 = 6) es MAYOR que las filas con lámina (5), y eso es correcto — `camp_titulo`
   * falta de verdad en las dos. Hacer que cierre sería mentir sobre el deck para que cierre una suma. */
  af(porId['L-046'].filas === 3 && porId['L-048'].filas === 1,
    '`camp_titulo` cuenta en L-046 Y en L-048 — no se le asigna una sola');
  af(grupos.reduce((n, g) => n + g.filas, 0) === 6,
    'y por eso la suma por lámina (6) supera a las filas con lámina (5): son dos unidades distintas');

  af(porId['L-036'].filas === 2 && porId['L-036'].cuenta_tokens === 1,
    'dos ítems del mismo token: 2 filas, 1 token — las dos unidades van nombradas');

  /* ⭐ Las causas de una lámina se ordenan por cuánto frenan la publicación, igual que los grupos
   * por causa: `escritor` (orden 4) antes que `sin_fila` (orden 1)? No — `sin_fila` es 1 y va primero. */
  af(porId['L-046'].causas[0].causa === 'sin_fila' && porId['L-046'].causas[0].cuantos === 2,
    'las causas de una lámina salen ordenadas por `orden` y con su conteo',
    JSON.stringify(porId['L-046'].causas));
  af(porId['L-046'].causas.every(c => c.oficio && c.texto),
    'y cada causa trae su oficio y su texto — la vista no vuelve a buscarlos');

  /* ⛔ La de lámina vacía NO puede aparecer como una lámina más del deck. */
  af(!porId[''] && !porId['(sin lámina)'],
    'una fila sin lámina no fabrica un grupo — se cuenta aparte en `sin_lamina`');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Controles NEGATIVOS — con motivo, y exigiendo que la mutación haya ocurrido
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · romper a propósito: hay que ver rojo POR EL MOTIVO correcto');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

  /* ⚠ Los patrones van por fragmento de UNA línea, nunca por bloques con `\n`: los `.gs` están en
   * CRLF y un patrón multilínea no matchea nada. Eso ya dejó dos negativos en verde sin tocar el
   * código (`CLAUDE.md` §4, la tercera forma de dar verde sin probar nada). */
  const casos = [
    {
      nombre: 'sin memoización, la segunda consulta vuelve a llamar a la API',
      buscar: '    if (n in cache) return cache[n];',
      poner: '    // roto a propósito',
      probar: (ctx, pres) => {
        ctx.__p = pres;
        vm.runInContext('var __r = resolvedorDeLaminaId_(__p)', ctx);
        vm.runInContext('__r(1); __r(1); __r(1);', ctx);
        return pres.__llamadas[1] > 1;
      }
    },
    {
      nombre: 'sin el filtro de `(sin id)`, ese texto se cuela como si fuera un id',
      buscar: "      if (id === '(sin id)') id = '';",
      poner: '      // roto a propósito',
      probar: (ctx, pres) => {
        ctx.__p = pres;
        vm.runInContext('var __r = resolvedorDeLaminaId_(__p)', ctx);
        ctx.__n = 3;
        return vm.runInContext('__r(__n)', ctx) === '(sin id)';
      }
    },
    {
      nombre: 'sin la deduplicación, dos slides de la misma lámina la repiten',
      buscar: '    if (id && ids.indexOf(id) === -1) ids.push(id);',
      poner: '    if (id) ids.push(id);',
      probar: (ctx, pres) => {
        ctx.__p = pres;
        vm.runInContext('var __r = resolvedorDeLaminaId_(__p)', ctx);
        ctx.__s = [2, 4];
        return vm.runInContext('laminasDeTokenFijo_(__s, __r)', ctx) === 'L-046 · L-046';
      }
    }
  ];

  casos.forEach((caso) => {
    /* ⭐⭐ La guarda que hace falta ANTES de mirar el resultado: si el texto mutado es idéntico al
     * original, el caso **falla** — no se saltea. Sin esto el negativo corre sobre el código intacto,
     * da verde, y eso se lee como «el negativo pasó». */
    const mutado = texto.replace(caso.buscar, caso.poner);
    if (mutado === texto) {
      af(false, 'MUTACIÓN NO APLICADA: «' + caso.nombre + '»',
        'el patrón no matcheó — el banco está leyendo un código que cambió de forma');
      return;
    }
    const pres = presentacionFalsa(['#Lámina:L-030', '#Lámina:L-046', '#Lámina:', '#Lámina:L-046']);
    const ctx = contextoGenerador({}, mutado);
    af(caso.probar(ctx, pres), 'roto: ' + caso.nombre);
  });
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 6 · La copia del esquema contra `Instalar.gs` — el desajuste FALLA
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · el esquema copiado acá coincide con el de `Instalar.gs`');
{
  /* ⭐ La copia es deliberada —un banco que importa el esquema del código que audita deja de ser
   * independiente— pero **una copia que nadie compara es deuda**: `LAMINAS` nació el 09/08, entró en
   * una de las tres listas y no en las otras dos, y nada lo señaló. Ésta es la afirmación que
   * convierte la duplicación en diseño en vez de en olvido. */
  const instalar = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
  ['FALTANTES', 'FALTANTES_PREVIO'].forEach((hoja) => {
    const re = new RegExp('\\b' + hoja + ': \\{\\s*[\\r\\n]+\\s*headers: \\[([^\\]]*)\\]');
    const m = instalar.match(re);
    if (!m) {
      af(false, 'se encontró el bloque `' + hoja + '` en Instalar.gs',
        'cambió de forma — la comparación NO corrió, que es distinto de que coincidan');
      return;
    }
    const real = m[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
    af(real.join('|') === HOJAS_CONFIG_[hoja].headers.join('|'),
      hoja + ': el esquema real y la copia de este banco coinciden',
      'real=' + real.join('|'));
  });
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
if (avisos.length) {
  // ⚠ Los avisos van ÚLTIMOS, después del veredicto: un `⚠` en el medio de un reporte que termina
  // en `✅` se lee como verde (`CLAUDE.md` §4).
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.\n');
  console.log('⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach(a => console.log('   · ' + a));
} else {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');
}

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Que una corrida REAL escriba el `lamina_id` correcto. Acá las notas del orador son');
console.log('     un fixture; que `slide.duplicate()` copie el ancla está medido aparte (21/08).');
console.log('   · Que la etapa 3 pase el `lamina_id` del modelo: eso vive en `duplicarBloquesRepetibles_`,');
console.log('     necesita media corrida montada y sólo lo prueba una corrida de `jm`.');
console.log('   · Cuánto cuesta el resolvedor en un deck real. Se afirma que NO barre; cuántas');
console.log('     láminas con faltante tiene una corrida lo dice la corrida.');
console.log('   · Si el panel PINTA bien lo que el backend devuelve. Acá no hay DOM.');

process.exit(mal ? 1 : 0);
