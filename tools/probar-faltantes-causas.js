/**
 * `2026-08-23_1` Partes B y C — el banco de `FALTANTES`: causas, rotado y reconciliación.
 *
 * ⭐ **Extrae las funciones reales de `Generador.gs` y `PanelBackend.gs`, no las reimplementa.**
 * `CLAUDE.md` §4: reproducir la lógica en node es el error que este repo ya cometió cuatro veces.
 * Acá lo único falseado es la plataforma —`SpreadsheetApp` y una hoja en memoria—; el código que
 * se afirma es el que se pushea.
 *
 * ⭐ **Y cada bloque lleva un control POSITIVO: algo que TIENE que aparecer.** Un banco que sólo
 * busca lo que sospecha no distingue «no está» de «no miré», y las dos salidas se leen igual.
 *
 * Corre con: `node tools/probar-faltantes-causas.js`
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

/**
 * Una hoja de Sheets en memoria, con el ancho vivo en `headers`.
 *
 * ⚠ **`setValues` escribe SÓLO las columnas que le mandan, desde `col`.** Pisar la fila entera
 * haría que la reconciliación —que escribe únicamente las columnas nuevas— borrara las viejas, y
 * el banco mediría un bug que la plataforma real no tiene.
 */
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
    // `deleteRows(desde, cuantas)` con `desde` 1-basado. La poda de `ANCLAJE_MEDICION` la usa.
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

/* El esquema de `Instalar.gs`, **copiado y no importado** — mismo criterio que las tres listas de
 * hojas de registro de `CLAUDE.md` §2: un banco que lee el esquema del código que audita deja de
 * ser independiente. El desalineamiento lo delata la afirmación de la reconciliación. */
const HOJAS_CONFIG_ = {
  FALTANTES: {
    headers: ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo', 'causa', 'lamina_id']
  },
  FALTANTES_PREVIO: {
    headers: ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo', 'causa', 'lamina_id']
  }
};

/** El esquema VIEJO, de siete columnas: el que tiene hoy cualquier instalación que ya existía. */
const HEADERS_VIEJOS = ['corrida_id', 'informe_id', 'token', 'base_id', 'solapa', 'campo_logico', 'motivo'];

/**
 * Contexto con `Generador.gs` cargado. `textoGenerador` permite cargar una versión modificada,
 * que es lo que necesita el control negativo.
 */
function contextoGenerador(hojas, textoGenerador) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    parseInt, parseFloat,
    Logger: { log: () => {} },
    HOJAS_CONFIG_,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => hojas[n] || null,
        insertSheet: (n) => (hojas[n] = hojaEnMemoria(HOJAS_CONFIG_[n].headers))
      }),
      flush: () => {}
    }
  };
  vm.createContext(ctx);
  const texto = textoGenerador !== undefined
    ? textoGenerador
    : fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  return ctx;
}

console.log('FALTANTES — causas, rotado y reconciliación · código cargado de Generador.gs y PanelBackend.gs\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · La reconciliación de headers sobre una hoja que YA existe
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · una hoja con el esquema viejo gana la columna `causa` sin perder ninguna');
{
  const hojas = { FALTANTES: hojaEnMemoria(HEADERS_VIEJOS) };
  const ctx = contextoGenerador(hojas);
  ctx.__h = hojas.FALTANTES;
  const salida = vm.runInContext('reconciliarHeadersDeSalida_(__h, "FALTANTES")', ctx);

  af(salida.indexOf('causa') !== -1, '`causa` aparece en los headers devueltos');
  af(hojas.FALTANTES.__filas[0].indexOf('causa') === 7,
    'y quedó ESCRITA en la fila 1, en la columna 8', 'quedó en ' + hojas.FALTANTES.__filas[0].indexOf('causa'));
  /* ⭐ Control positivo: las siete de siempre tienen que seguir donde estaban. Una reconciliación
   * que reordena cambia el significado de las filas ya escritas, que es peor que no tener la
   * columna. Sin esta afirmación, «agregó `causa`» y «reescribió la fila 1» se ven igual. */
  af(HEADERS_VIEJOS.every((h, i) => hojas.FALTANTES.__filas[0][i] === h),
    'y las siete viejas siguen en su posición original — no se reordenó nada');

  // Idempotente: correrla de nuevo no agrega una segunda `causa`.
  vm.runInContext('reconciliarHeadersDeSalida_(__h, "FALTANTES")', ctx);
  af(hojas.FALTANTES.__filas[0].filter(h => h === 'causa').length === 1,
    'correrla dos veces no duplica la columna');
}

/* ⛔ El control NEGATIVO, y con MOTIVO: no alcanza con ver rojo. Se rompe la reconciliación y hay
 * que verificar que caiga **la afirmación de la columna**, no otra por carambola. */
console.log('\n1b · romper la reconciliación a propósito: la columna NO tiene que aparecer');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const buena = '  hoja.getRange(1, desde, 1, faltan.length).setValues([faltan]);';
  if (texto.indexOf(buena) === -1) {
    avisos.push('⚠ no se encontró la línea que escribe los headers nuevos: el control negativo NO corrió. ' +
      'Cambió el código y este banco lo está leyendo mal — que es distinto de que el código esté bien.');
    console.log('  ⚠ salteado: la línea a romper cambió de forma');
  } else {
    const hojas = { FALTANTES: hojaEnMemoria(HEADERS_VIEJOS) };
    const ctx = contextoGenerador(hojas, texto.replace(buena, '  // roto a propósito'));
    ctx.__h = hojas.FALTANTES;
    vm.runInContext('reconciliarHeadersDeSalida_(__h, "FALTANTES")', ctx);
    af(hojas.FALTANTES.__filas[0].indexOf('causa') === -1,
      'con la escritura desactivada, `causa` no aparece — el banco la estaba viendo de verdad');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · El rotado a `FALTANTES_PREVIO`
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · la corrida anterior se archiva antes de que la nueva pise la hoja');
{
  const hojas = { FALTANTES: hojaEnMemoria(HEADERS_VIEJOS) };
  // Lo que dejó "la corrida anterior".
  hojas.FALTANTES.__filas.push(['C-VIEJA', 'jm', 'post_alcance', '', '', '', 'sin fila en MARCADORES']);
  hojas.FALTANTES.__filas.push(['C-VIEJA', 'jm', 'camp_titulo', '', '', '', 'sin fila en MARCADORES']);

  const ctx = contextoGenerador(hojas);
  ctx.__nuevas = [
    { corrida_id: 'C-NUEVA', informe_id: 'jm', token: 'enc_alcance @Boedo', base_id: 'rdv', solapa: 'RDV', campo_logico: '', motivo: 'sin_datos: …', causa: 'sin_datos' }
  ];
  const r = vm.runInContext('escribirFaltantes_(__nuevas)', ctx);

  af(r.filas === 1, 'la hoja nueva quedó con 1 fila', 'quedó con ' + r.filas);
  af(r.previo.ok === true && r.previo.filas === 2,
    'y las 2 de la corrida anterior se archivaron', JSON.stringify(r.previo));

  const previo = hojas.FALTANTES_PREVIO;
  af(!!previo, 'la hoja FALTANTES_PREVIO se creó');
  /* ⭐ Control positivo por nombre y no por conteo: un token que TIENE que estar. Un `filas === 2`
   * solo pasaría igual con las filas copiadas al revés o con columnas cruzadas. */
  const tokens = previo ? previo.__filas.slice(1).map(f => f[2]) : [];
  af(tokens.indexOf('post_alcance') !== -1 && tokens.indexOf('camp_titulo') !== -1,
    'y los dos tokens de la corrida anterior están ahí, por nombre', tokens.join(' | '));
  af(previo && previo.__filas.slice(1).every(f => f[0] === 'C-VIEJA'),
    'con su `corrida_id` — el archivo dice de qué corrida es');

  // Y la hoja viva ya no tiene nada de la anterior: es la lista de trabajo de HOY.
  const vivos = hojas.FALTANTES.__filas.slice(1).map(f => f[0]);
  af(vivos.length === 1 && vivos[0] === 'C-NUEVA',
    'y FALTANTES quedó sólo con la corrida nueva — `D-12` sigue en pie');

  // La `causa` llegó a la hoja, que es todo el punto de la reconciliación.
  const iCausa = hojas.FALTANTES.__filas[0].indexOf('causa');
  af(iCausa !== -1 && hojas.FALTANTES.__filas[1][iCausa] === 'sin_datos',
    'y la columna `causa` se escribió con su valor', 'índice ' + iCausa);
}

console.log('\n2b · la PRIMERA corrida de todas: no hay nada que archivar, y eso no es un fallo');
{
  const hojas = { FALTANTES: hojaEnMemoria(HEADERS_VIEJOS) };
  const ctx = contextoGenerador(hojas);
  ctx.__nuevas = [];
  const r = vm.runInContext('escribirFaltantes_(__nuevas)', ctx);
  /* ⚠ `filas: 0` con `ok: true` es el caso legítimo, y por eso el `ok` viaja al lado del número y
   * no en su lugar: «no había nada» y «el archivado falló» mandan a cosas distintas. */
  af(r.previo.ok === true && r.previo.filas === 0,
    'informa `ok` con 0 filas, y dice el motivo', JSON.stringify(r.previo));
  af(!hojas.FALTANTES_PREVIO, 'y no crea la hoja de archivo sin nada que guardar');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · El vocabulario de causas
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · una causa por oficio — y `ok` es la que no existía');
{
  const ctx = contextoGenerador({ FALTANTES: hojaEnMemoria(HEADERS_VIEJOS) });
  const causa = (r) => { ctx.__r = r; return vm.runInContext('causaDeResultado_(__r)', ctx); };

  af(causa(null) === 'sin_fila', 'sin resultado → `sin_fila` (cablear)');
  af(causa({ estado: 'error' }) === 'fallo', '`error` → `fallo` (mirar la traza)');
  af(causa({ estado: 'REVISAR' }) === 'fallo', '`REVISAR` → `fallo` — no es «sin datos»');
  af(causa({ estado: 'sin_datos' }) === 'sin_datos', '`sin_datos` → `sin_datos` (mirar la fuente)');
  /* ⭐ **La que importa, y la que no existía hasta hoy** (Parte C): un token que resolvió bien y
   * quedó crudo es un bug del escritor, y hasta el 23/08 caía en el mismo texto que «nadie lo
   * cableó» — dos oficios opuestos con el mismo aviso. */
  af(causa({ estado: 'ok' }) === 'escritor', '`ok` → `escritor` — resolvió y el escritor no lo pisó');
  af(causa({ estado: 'algo_nuevo' }) === 'sin_clasificar',
    'un estado que la función no conoce → `sin_clasificar`, no se lo adivina');

  const causas = vm.runInContext('Object.keys(CAUSAS_FALTANTE_)', ctx);
  af(causas.indexOf('no_alcanzado') !== -1,
    'y existe `no_alcanzado`: «no se llegó» no es «nadie lo cableó»');
  const ordenes = vm.runInContext('Object.keys(CAUSAS_FALTANTE_).map(function(k){return CAUSAS_FALTANTE_[k].orden;})', ctx);
  af(new Set(ordenes).size === ordenes.length, 'y ninguna causa comparte `orden` con otra');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · El lector del panel — y el nombre del ítem SIN limpiar
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · el lector del panel parte el sufijo `@ítem` y no lava el nombre');
{
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error };
  vm.createContext(ctx);
  // Sólo la función que se afirma: `PanelBackend.gs` entero arrastra la planilla, y lo que se
  // mide acá es un parseo de texto puro.
  const texto = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  /* ⛔⛔ **El extractor iba por regex `\n}\n` y NO matcheaba NUNCA: los `.gs` están en CRLF**, así
   * que el cierre real es `\r\n}\r\n` y el patrón exige un `\n` justo después de la llave. Corregido
   * el 25/08; **las cinco afirmaciones de abajo no se ejecutaron un solo día desde que se escribieron**
   * (`af45941`), y el banco informaba el fallo como *«no se encontró la función»* — que se lee como
   * un cambio del código y era el instrumento leyéndolo mal.
   *
   * ⭐ Es literalmente la misma causa que ya había dejado dos controles negativos en verde el 24/08,
   * y `CLAUDE.md` §4 lo tiene escrito: **el final de línea es del archivo, no del que escribe la
   * prueba**. Se busca por posición, sin regex multilínea. */
  const desde = texto.indexOf('function partirTokenDeFaltante_');
  const fin = desde === -1 ? -1 : texto.indexOf('\n}', desde);
  if (desde === -1 || fin === -1) {
    mal++;
    console.log('  ❌ no se encontró `partirTokenDeFaltante_` en PanelBackend.gs');
  } else {
    vm.runInContext(texto.slice(desde, fin + 2), ctx, { filename: 'PanelBackend.gs (extracto)' });
    const partir = (v) => { ctx.__v = v; return vm.runInContext('partirTokenDeFaltante_(__v)', ctx); };

    af(partir('camp_titulo').token === 'camp_titulo' && partir('camp_titulo').item === '',
      'un token fijo no tiene ítem');
    af(partir('enc_alcance @Boedo (pre)').token === 'enc_alcance',
      'y con sufijo, el token sale limpio');
    af(partir('enc_alcance @Boedo (pre)').item === 'Boedo (pre)',
      'y el ítem sale entero, con su etapa');
    /* ⭐⭐ **El fixture está COPIADO de una salida real** (`CLAUDE.md` §4: un fixture de formato se
     * copia, nunca se deduce del código que lo emite). `enc_alcance_pct @: Salud` es lo que se vio
     * el 23/08 — el nombre del ítem llega con el separador crudo adentro.
     *
     * ⚠ **La afirmación es que el `: ` SOBREVIVE.** Limpiarlo acá arreglaría la pantalla y
     * escondería el bug del parseo justo en el instrumento con el que se diagnostica todo lo
     * demás. Que se vea sucio ES el requisito. */
    af(partir('enc_alcance_pct @: Salud').item === ': Salud',
      'y un nombre mal parseado llega SUCIO a la vista, con su `: ` — no se lava',
      JSON.stringify(partir('enc_alcance_pct @: Salud').item));
    af(partir('t @Uno @Dos').item === 'Uno @Dos',
      'parte por el PRIMER ` @`: un ítem con arroba adentro no se pierde');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Parte C — el crudo sin corte, separado en sus tres (cuatro) situaciones
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · un token crudo sin corte: cuál de los oficios manda a hacer');
{
  const ctx = contextoGenerador({ FALTANTES: hojaEnMemoria(HEADERS_VIEJOS) });
  ctx.__conFila = { ok: true, tokens: { camp_titulo: true, camp_remitente: true, enc_alcance: true } };
  ctx.__escondidas = {};
  const diag = (token, resultado) => {
    ctx.__t = token; ctx.__r = resultado;
    return vm.runInContext('diagnosticoDeCrudo_(__t, __r, __conFila, __escondidas)', ctx);
  };

  af(diag('post_alcance', undefined).causa === 'sin_fila',
    'sin fila en MARCADORES → `sin_fila` (cablear)');

  /* ⭐⭐ **El caso real del 23/08, y es el que fundó la Parte C.** `camp_remitente` y `camp_titulo`
   * salieron *«quedó crudo sin corte por tiempo — revisar»* **teniendo fila los dos**. El aviso era
   * correcto y no decía por qué. Acá los dos con fila tienen que salir por caminos DISTINTOS. */
  const escritor = diag('camp_titulo', { estado: 'ok', valor_formateado: '1.234' });
  af(escritor.causa === 'escritor',
    'con fila y estado `ok` → `escritor`: resolvió y el escritor no lo pisó');
  /* ⭐ El valor viaja en el motivo, y es la evidencia de que había qué escribir. Sin él, el aviso
   * es una sospecha; con él, es un hallazgo. */
  af(escritor.motivo.indexOf('1.234') !== -1,
    'y el motivo trae el valor resuelto — la evidencia, no una sospecha', escritor.motivo);

  const fallo = diag('camp_remitente', { estado: 'error', traza: 'sin mapeo para "remitente"' });
  af(fallo.causa === 'fallo', 'con fila y estado `error` → `fallo` (mirar la traza)');
  af(fallo.motivo.indexOf('sin mapeo') !== -1, 'y el motivo trae la traza');
  /* ⭐ **Los dos tokens del caso real salen distinto, que es exactamente lo que faltaba.** Sin esta
   * afirmación el bloque pasaría igual con las dos ramas devolviendo lo mismo. */
  af(escritor.causa !== fallo.causa,
    'y los dos del 23/08 —ambos con fila— ya no comparten diagnóstico');

  af(diag('enc_alcance', { estado: 'sin_datos', traza: 'cero filas en la ventana' }).causa === 'sin_datos',
    'con fila y `sin_datos` → `sin_datos` (mirar la fuente o la ventana)');

  /* La cuarta, que el prompt no nombra y existe igual: tiene fila y la resolución nunca lo miró,
   * sin corte ni excepción. No es «nadie lo cableó» y no es «falló». */
  af(diag('enc_alcance', undefined).causa === 'no_alcanzado',
    'con fila y sin resultado → `no_alcanzado`: no se lo alcanzó, y no es ninguna de las otras');

  /* ⛔⛔ **La QUINTA, y salió de la primera corrida del particionado (24/08).** `camp_titulo`
   * apareció como `no_alcanzado` con **14 apariciones en el `mapa_tokens`** — un token en 14
   * láminas que nadie mira no cierra. La respuesta: **las 14 están escondidas**, y `L-048` está
   * escondida por `D-39` con `camp_titulo` como su único token con fila.
   *
   * ⭐ Es la regla de los símbolos aplicada a las causas: `no_alcanzado` tapaba *«está escondida,
   * no hagas nada»* y *«quedó fuera por un bug, mirá por qué»*, que son trabajos **opuestos**. */
  ctx.__escondidas = { camp_titulo: [14, 21, 23] };
  const escondida = diag('camp_titulo', undefined);
  af(escondida.causa === 'solo_escondidas',
    '⭐ con fila, sin resultado y TODAS sus apariciones escondidas → `solo_escondidas` (no hacer nada)');
  af(escondida.motivo.indexOf('14, 21, 23') !== -1,
    'y el motivo NOMBRA las slides — contesta la pregunta en vez de hacerla', escondida.motivo);
  af(escondida.causa !== diag('enc_alcance', undefined).causa,
    '⛔ y NO comparte causa con el que quedó fuera sin estar escondido: son oficios opuestos');
  ctx.__escondidas = {};

  /* ⛔ Y lo que pasa cuando el instrumento no puede leer `MARCADORES`. Un `catch` que devolviera el
   * conjunto vacío haría que TODOS los crudos salieran «nadie lo cableó»: un diagnóstico falso,
   * dramático y del tipo que manda a borrar configuración. */
  ctx.__conFila = { ok: false, tokens: {}, motivo: 'la hoja no existe' };
  const ciego = diag('camp_titulo', { estado: 'ok', valor_formateado: '9' });
  af(ciego.causa === 'sin_clasificar',
    'si no se pudo leer MARCADORES, no afirma nada sobre el cableado');
  af(ciego.motivo.indexOf('la hoja no existe') !== -1,
    'y dice por qué no pudo — «no sé» con motivo, no «nadie lo cableó»');
}

console.log('\n5b · el filtro por informe es EL MISMO que usa resolverMarcadores');
{
  /* ⚠ **Un diagnóstico que filtre distinto que el resolvedor diría «sin fila» sobre un token que el
   * resolvedor sí ve**, y mandaría a cablear algo ya cableado. Las dos expresiones se comparan por
   * texto: si alguien cambia una y no la otra, esto se pone rojo. Es el control positivo que
   * comparte camino, aplicado a un criterio en vez de a un dato. */
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const criterio = "return suyo === informeId || suyo === '*';";
  const enDiagnostico = "if (suyo !== informeId && suyo !== '*') return;";
  af(texto.indexOf(criterio) !== -1,
    '`resolverMarcadores` sigue filtrando por `informe_id === informeId || "*"`');
  af(texto.indexOf(enDiagnostico) !== -1,
    'y `tokensConFilaEnMarcadores_` usa el mismo criterio, negado');
}

console.log('\n5c · con corte o con excepción NO se le pregunta a MARCADORES');
{
  /* ⭐ La causa ya se sabe —la corrida no llegó— y es justo el caso en que menos presupuesto queda.
   * Se afirma sobre el texto porque el efecto es una lectura que NO ocurre, y una lectura que no
   * ocurre no deja rastro que un banco pueda observar. */
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const guarda = 'var conFilaEnMarcadores = (barrida.barridos.length && !corte && !fallo)';
  af(texto.indexOf(guarda) !== -1,
    'la lectura de MARCADORES está detrás de `!corte && !fallo` y de que haya barridos');
}
/* ════════════════════════════════════════════════════════════════════════════════════════
 * 6 · Parte D — la medición del anclaje deja rastro
 * ════════════════════════════════════════════════════════════════════════════════════════ */

/** Contexto con sólo las funciones de medición de `Union.gs`, extraídas del archivo real. */
function contextoMedicion(hojas) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => hojas[n] || null,
        insertSheet: (n) => (hojas[n] = hojaEnMemoria(ctx.HEADERS_ANCLAJE_MEDICION_))
      }),
      flush: () => {}
    }
  };
  vm.createContext(ctx);
  const texto = fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8');
  // Sólo el bloque de la medición: `Union.gs` entero arrastra el motor de unión y no es lo que
  // se mide acá. Se extrae por nombre, que es lo que sobrevive a que el archivo se mueva.
  /* ⛔⛔ **SEGUNDA vez que el patrón `\n}\n` muerde en este mismo banco.** Los `.gs` están en CRLF,
   * así que el cierre real es `\r\n}\r\n` y **el `\n` que el patrón exige después de la llave no
   * está**. La primera vez (bloque 4) dejó **cinco afirmaciones sin ejecutar un día entero**; ésta
   * se destapó el 25/08 al insertar código en `Union.gs`, que corrió lo que el match arrastraba.
   *
   * ⭐ **Por eso acá se extrae por POSICIÓN**, igual que allá: `indexOf` de la firma y del primer
   * `\n}` — que sí existe en CRLF, porque lo que falta es el salto **posterior**, no el previo.
   *
   * ⚠ **Y el fallo fue ruidoso**, que es lo que salva: `if (trozos.some(t => !t)) return null` y el
   * banco lo reporta. Un extractor que devolviera un trozo parcial habría corrido afirmaciones
   * sobre código incompleto. */
  const porPosicion = (firma, cierre) => {
    const desde = texto.indexOf(firma);
    if (desde === -1) return null;
    const fin = texto.indexOf(cierre, desde);
    return fin === -1 ? null : [texto.slice(desde, fin + cierre.length)];
  };
  const trozos = [
    porPosicion('var HEADERS_ANCLAJE_MEDICION_ = ', '];'),
    texto.match(/var TOPE_MEDICIONES_ANCLAJE_ = \d+;/),
    porPosicion('function obtenerHojaAnclajeMedicion_()', '\n}'),
    porPosicion('function registrarMedicionAnclaje_(resultado, ventana)', '\n}')
  ];
  if (trozos.some(t => !t)) return null;
  vm.runInContext(trozos.map(t => t[0]).join('\n'), ctx, { filename: 'Union.gs (extracto)' });
  return ctx;
}

console.log('\n6 · la medición del anclaje: cuántos se intentaron, cuántos anclaron, quiénes no');
{
  const hojas = {};
  const ctx = contextoMedicion(hojas);
  if (!ctx) {
    mal++;
    console.log('  ❌ no se pudieron extraer las funciones de medición de Union.gs');
  } else {
    // Hay que agregar la hoja en memoria con los headers que declara el propio código.
    hojas.ANCLAJE_MEDICION = undefined;
    ctx.__r = {
      encuentros: [{ reunion: 'Boedo', etapa: 'pre' }, { reunion: 'Almagro', etapa: '' }],
      // ⭐ El nombre SUCIO, copiado del caso real del 23/08: llega con el separador crudo adentro.
      sinLink: [{ reunion: ': Salud', etapa: '', motivo: 'sin fila en rdv' }],
      bajaConfianza: [{ reunion: 'Flores', etapa: 'post' }],
      umbral: 0.6,
      periodo_id: 'agosto_14_20',
      excluidas_por_periodo: [{ item: 'Once' }]
    };
    ctx.__v = { desde: new Date(2026, 7, 14), hasta: new Date(2026, 7, 20) };
    const r = vm.runInContext('registrarMedicionAnclaje_(__r, __v)', ctx);

    af(r.ok === true, 'la medición se escribió', JSON.stringify(r));
    /* ⭐ **El denominador es lo que separa «no corrió» de «corrió y no hubo dudosos»**, y es la
     * suma de las TRES listas, no de las que anclaron. Contar mal la unidad es contar otra cosa. */
    af(r.intentados === 4, 'y los intentados son 2 + 1 + 1 = 4, las tres listas', 'dio ' + r.intentados);

    const hoja = hojas.ANCLAJE_MEDICION;
    af(!!hoja, 'la hoja ANCLAJE_MEDICION se creó');
    const headers = hoja ? hoja.__filas[0] : [];
    const fila = hoja ? hoja.__filas[1] : [];
    const val = (h) => fila[headers.indexOf(h)];

    /* ⭐ Control positivo por nombre: los cinco números tienen que estar y en su columna. Un
     * `getLastRow() === 2` pasaría igual con las columnas cruzadas. */
    af(val('intentados') === 4 && val('anclados') === 2 && val('baja_confianza') === 1 && val('sin_link') === 1,
      'y los cuatro conteos quedaron cada uno en su columna',
      [val('intentados'), val('anclados'), val('baja_confianza'), val('sin_link')].join('/'));
    af(val('umbral') === 0.6, 'con el umbral al lado — un puntaje sin umbral no significa nada');
    af(String(val('periodo_id')) === 'agosto_14_20', 'y el período con el que se filtró');

    /* ⭐⭐ **Los nombres, y SUCIOS.** El conteo dice que hubo un problema; el nombre dice cuál. Y
     * limpiarlo acá escondería el bug del parseo justo en el instrumento con el que se diagnostica
     * todo lo demás (`X-40` se diagnosticó mirando estos sufijos). */
    af(String(val('sin_link_detalle')).indexOf(': Salud') !== -1,
      'y el que no ancló está NOMBRADO, con el `: ` crudo adentro — no se lava',
      String(val('sin_link_detalle')));
    af(String(val('sin_link_detalle')).indexOf('sin fila en rdv') !== -1,
      'y con su motivo al lado');
  }
}

console.log('\n6b · cero sin_link con intentados > 0 NO es lo mismo que no haber corrido');
{
  const hojas = {};
  const ctx = contextoMedicion(hojas);
  if (ctx) {
    ctx.__r = { encuentros: [{ reunion: 'A' }, { reunion: 'B' }], sinLink: [], bajaConfianza: [], umbral: 0.6 };
    ctx.__v = null;
    const r = vm.runInContext('registrarMedicionAnclaje_(__r, __v)', ctx);
    /* ⛔ **Ésta es la afirmación por la que existe toda la Parte D.** Hoy `ANCLAJE_PENDIENTE`
     * vacío es indistinguible de «no corrió»; con la fila escrita, `intentados: 2` con `sin_link: 0`
     * dice *«corrí y no hubo dudosos»*, que es lo que no se podía afirmar. */
    af(r.ok === true && r.intentados === 2,
      'una corrida sin ningún dudoso deja fila igual, con `intentados` > 0');
    const hoja = hojas.ANCLAJE_MEDICION;
    const headers = hoja.__filas[0];
    af(hoja.__filas[1][headers.indexOf('sin_link')] === 0,
      'y `sin_link` en 0 — un resultado, no un silencio');
    af(String(hoja.__filas[1][headers.indexOf('periodo_id')]) === '',
      'y sin período: la celda vacía significa «no se filtró», y el consumidor lo puede decir');
  }
}

console.log('\n6c · el instrumento no puede voltear el anclaje, pero deja rastro de su fallo');
{
  const ctx = contextoMedicion({});
  if (ctx) {
    // Una planilla que tira al pedir la hoja: el peor caso del instrumento.
    ctx.SpreadsheetApp = {
      getActiveSpreadsheet: () => { throw new Error('la planilla no responde'); },
      flush: () => {}
    };
    ctx.__r = { encuentros: [], sinLink: [], bajaConfianza: [], umbral: 0.6 };
    ctx.__v = null;
    let tiro = false;
    let r = null;
    try { r = vm.runInContext('registrarMedicionAnclaje_(__r, __v)', ctx); } catch (e) { tiro = true; }
    af(!tiro, 'no tira: un instrumento no puede costar el trabajo que estaba midiendo');
    /* ⚠ Y no se lo traga: `marcarEtapa_` empezó con un `catch` vacío y eso hacía que la fila
     * quedara diciendo una etapa vieja, que se lee como «murió ahí» — una conclusión falsa
     * fabricada por el instrumento mismo. */
    af(r && r.ok === false && String(r.motivo).indexOf('la planilla no responde') !== -1,
      'y devuelve `ok: false` con el motivo — el fallo se publica, no se traga', JSON.stringify(r));
  }
}

console.log('\n6d · la medición se escribe donde SE ANCLA, no donde se pregunta');
{
  /* ⚠ `anclarEncuentros` cachea; `anclarEncuentrosSinCache_` es la que de verdad ancla.
   * `itemsDeSeccion_` llama a la primera **una vez por sección**, así que escribir desde allá
   * daría una fila por consumidor y el conteo pasaría a decir cuántas veces se preguntó. Es
   * *«contar la unidad correcta es parte de la guarda»* (`CLAUDE.md` §4). */
  const texto = fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8');
  const desdeSinCache = texto.indexOf('function anclarEncuentrosSinCache_');
  const llamada = texto.indexOf('salida.medicion = registrarMedicionAnclaje_(salida, ventana);');
  af(desdeSinCache !== -1 && llamada > desdeSinCache,
    'la llamada vive adentro de `anclarEncuentrosSinCache_`, después de su apertura');
  const cuerpoCacheado = texto.slice(texto.indexOf('function anclarEncuentros(ventana) {'), desdeSinCache);
  af(cuerpoCacheado.indexOf('registrarMedicionAnclaje_') === -1,
    'y NO en la envoltura que cachea — si no, contaría preguntas y no anclajes');
}
/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
if (avisos.length) {
  // ⚠ Los avisos van ÚLTIMOS, después del veredicto, porque un `⚠` en el medio de un reporte que
  // termina en `✅` se lee como verde (`CLAUDE.md` §4, la tanda 4).
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.\n');
  console.log('⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach(a => console.log('   · ' + a));
} else {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');
}
console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Si el panel PINTA bien lo que el backend devuelve. Acá no hay DOM.');
console.log('   · Si una corrida real deja las causas correctas: eso necesita una corrida de `jm`.');
console.log('   · Nada sobre «fuera de alcance» ni «texto del equipo» — no están en ninguna hoja');
console.log('     de registro, así que el motor no los puede clasificar y este banco tampoco.');

process.exit(mal ? 1 : 0);
