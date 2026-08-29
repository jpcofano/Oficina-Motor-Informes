/**
 * `2026-08-28_4` — **`ambito` sobre `digital/Directa IVR`, y las tres filas del bloque de IVR de
 * `L-032`.**
 *
 * ⭐ **Ejecuta el traductor REAL del motor** —`condicionesDeDimensiones_` de `Fuentes.gs`— sobre la
 * tabla `DIMENSIONES_` real. No reimplementa nada: reproducir la lógica del motor es el error que
 * este repo ya cometió cuatro veces (`CLAUDE.md` §4).
 *
 * ⭐ **Y las tres filas salen de `filasDeGcbaIvr_()`, extraída de `Instalar.gs`**, no de una copia
 * pegada acá. Una copia probaría la copia, y seguiría verde el día que alguien toque el `.gs`.
 *
 * ⚠ **Lo que este banco NO contesta**, dicho para que el verde no se lea de más:
 *   · Qué número publica el marcador. Eso es una corrida, y después el deck del equipo.
 *   · Qué tiene la hoja `MAPEO` hoy. Esto mide lo que el seed va a sembrar.
 *   · Si el universo es el correcto. `X-41` sigue abierto y para GCBA está **en reserva**.
 *
 * Corre con: `node tools/probar-ambito-ivr.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const seedMapeo = require('./seed-mapeo.js');

let ok = 0;
let mal = 0;
const avisos = [];

function af(cond, texto, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + texto); }
  else { mal++; console.log('  ❌ ' + texto + (detalle ? ' — ' + detalle : '')); }
}

/** ⚠ Por posición, nunca por regex con `\n}`: los `.gs` están en CRLF. */
function extraer(texto, firma, cierre) {
  const desde = texto.indexOf(firma);
  if (desde === -1) return null;
  const c = cierre || '\n}';
  const fin = texto.indexOf(c, desde);
  return fin === -1 ? null : texto.slice(desde, fin + c.length);
}

const FUENTES = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');

/**
 * Contexto con el traductor real. Recibe el texto de `Fuentes.gs` para que el caso negativo pueda
 * pasarle una versión mutada.
 */
function contexto(textoFuentes) {
  const fue = textoFuentes !== undefined ? textoFuentes : FUENTES;
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

  const ctx = { console, Math, JSON, String, Number, Object, Array, Boolean, isNaN, RegExp, Error,
    Logger: { log: () => {} } };
  vm.createContext(ctx);

  /* ⚠ El separador se carga **del archivo**. Declararlo acá como `'&&'` dejaría el banco verde si
   * el motor lo cambiara — mediría su propia copia. */
  const sep = extraer(gen, 'var SEPARADOR_CONDICIONES_FILTRO_', ';');
  if (!sep) avisos.push('⚠ no se encontró `SEPARADOR_CONDICIONES_FILTRO_` en Generador.gs.');
  else vm.runInContext(sep, ctx, { filename: 'Generador.gs (extracto)' });

  ['function normalizarValorDeclarado_', 'function condicionesDeDimensiones_'].forEach((firma) => {
    const fn = extraer(fue, firma);
    if (!fn) { avisos.push('⚠ no se encontró `' + firma + '` en Fuentes.gs.'); return; }
    vm.runInContext(fn, ctx, { filename: 'Fuentes.gs (extracto)' });
  });

  const dim = extraer(fue, 'var DIMENSIONES_ = {', '\n};');
  if (!dim) { mal++; console.log('  ❌ no se encontró `DIMENSIONES_` en Fuentes.gs'); }
  else vm.runInContext(dim, ctx, { filename: 'Fuentes.gs (extracto)' });

  return ctx;
}

/** El traductor real: `(base, solapa, 'ambito=gcba')` → `{ ok, condiciones|motivo }`. */
function traducir(ctx, base, solapa, texto) {
  ctx.__b = base; ctx.__s = solapa; ctx.__t = texto;
  return vm.runInContext('condicionesDeDimensiones_(__b, __s, __t)', ctx);
}

console.log('`ambito` en digital/Directa IVR — con el traductor real de Fuentes.gs\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · CONTROL POSITIVO — las solapas que ya declaraban `ambito` siguen resolviendo
 *
 * ⭐ Comparte lector, tabla y traductor con lo que se mide abajo: si el extractor estuviera
 * leyendo mal el archivo, estas cuatro caerían primero. Sin ellas, «no está declarada» y «no
 * pude leer la tabla» se ven idénticas.
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · control positivo: las que YA estaban siguen traduciendo');
{
  const ctx = contexto();
  const jmMail = traducir(ctx, 'digital', 'Directa Mail', 'ambito=jm');
  af(jmMail.ok && /mail_remitente=/.test(jmMail.condiciones),
    'digital|Directa Mail · ambito=jm → ' + (jmMail.condiciones || jmMail.motivo));

  const gcbaMail = traducir(ctx, 'digital', 'Directa Mail', 'ambito=gcba');
  af(gcbaMail.ok && /mail_remitente!=/.test(gcbaMail.condiciones),
    'digital|Directa Mail · ambito=gcba → ' + (gcbaMail.condiciones || gcbaMail.motivo));

  const gcbaLooker = traducir(ctx, 'looker', 'DIGITAL', 'ambito=gcba');
  af(gcbaLooker.ok && gcbaLooker.condiciones === 'nombre_campaña!~=JM',
    'looker|DIGITAL · ambito=gcba → ' + (gcbaLooker.condiciones || gcbaLooker.motivo));

  /* ⚠ Y una solapa que NO declara `ambito` tiene que seguir fallando. Es la mitad negativa del
   * control positivo: si todo resolviera, el traductor no estaría discriminando nada. */
  const sms = traducir(ctx, 'digital', 'Directa SMS', 'ambito=gcba');
  af(sms.ok === false && /Directa SMS/.test(sms.motivo || ''),
    '⭐ digital|Directa SMS sigue SIN declarar ambito, y falla nombrando la clave',
    JSON.stringify(sms));
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · Lo nuevo: `digital|Directa IVR`
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · digital|Directa IVR traduce los dos ámbitos');
{
  const ctx = contexto();
  const jm = traducir(ctx, 'digital', 'Directa IVR', 'ambito=jm');
  af(jm.ok && jm.condiciones === 'ivr_vocero=JM',
    'ambito=jm → `ivr_vocero=JM`', JSON.stringify(jm));

  const gcba = traducir(ctx, 'digital', 'Directa IVR', 'ambito=gcba');
  af(gcba.ok && gcba.condiciones === 'ivr_vocero!=JM',
    'ambito=gcba → `ivr_vocero!=JM`', JSON.stringify(gcba));

  /* ⭐⭐ La regla de `D-33`: `gcba` es **todo lo que no es `jm`**, no un valor propio. La columna
   * tiene un `GCBA` literal que invita a escribir `ivr_vocero=GCBA`, y con la igualdad una fila con
   * el vocero vacío quedaría **afuera de los dos ámbitos y en silencio**. Se afirma sobre el texto
   * porque es exactamente el error que se puede cometer sin que nada falle. */
  af(gcba.ok && jm.ok && gcba.condiciones === jm.condiciones.replace('=', '!='),
    '⭐⭐ y GCBA es la NEGACIÓN de JM, no `ivr_vocero=GCBA` (D-33)',
    JSON.stringify({ jm: jm.condiciones, gcba: gcba.condiciones }));
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · CONTROL NEGATIVO — con la mutación verificada
 *
 * ⭐ Tres afirmaciones separadas, y ninguna implica a las otras (`CLAUDE.md` §4): que la mutación
 * OCURRIÓ, que el resultado cae, y que cae **por el motivo correcto**.
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · control negativo: sin la línea de IVR, `ambito=gcba` tiene que FALLAR');
{
  /* ⚠ El patrón va por fragmento de UNA línea, nunca por bloques con `\n`: el final de línea es
   * del archivo (CRLF), no de quien escribe la prueba. */
  const LINEA = "      'digital|Directa IVR': 'ivr_vocero!=JM',";
  const mutado = FUENTES.replace(LINEA, '');

  af(mutado !== FUENTES,
    '⭐ la MUTACIÓN OCURRIÓ — sin esto el caso correría sobre el código intacto y daría verde');

  if (mutado !== FUENTES) {
    const ctx = contexto(mutado);
    const r = traducir(ctx, 'digital', 'Directa IVR', 'ambito=gcba');
    af(r.ok === false, 'sin la declaración, `ambito=gcba` cae', JSON.stringify(r));
    af(r.ok === false && /digital\|Directa IVR/.test(r.motivo || ''),
      '⭐ y cae POR EL MOTIVO correcto: el motivo nombra `digital|Directa IVR`',
      JSON.stringify(r));

    /* Y el ámbito JM, que la mutación no tocó, tiene que seguir resolviendo: si cayeran los dos,
     * la prueba estaría midiendo que rompí el archivo, no que falta esa línea. */
    const jm = traducir(ctx, 'digital', 'Directa IVR', 'ambito=jm');
    af(jm.ok === true, 'y `ambito=jm`, que la mutación no tocó, sigue resolviendo');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · `MAPEO` — el campo del filtro tiene que estar mapeado, o el filtro no filtra: FALLA
 *
 * ⚠ Se lee el seed **post-procesado** (`tools/seed-mapeo.js`), no la lista inline: `Instalar.gs`
 * corre cuatro sentencias después que pisan `encabezado` y `tipo_esperado`.
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · MAPEO declara `ivr_vocero`, con letra y encabezado');
{
  const seed = seedMapeo.leer();
  const fila = seed.porClave['digital|Directa IVR|ivr_vocero'];
  af(!!fila, 'existe la fila `digital|Directa IVR|ivr_vocero`');
  if (fila) {
    af(fila.columna === 'G', 'columna G — la que el fixture del 28/08 midió como `Vocero`',
      String(fila.columna));
    /* ⭐ `D-31`: la letra es la referencia operativa y el encabezado el testigo. Escribir una sin
     * la otra deja el hueco abierto justo donde la documentación dice que está cerrado. */
    af(seedMapeo.testigo(seed, 'digital', 'Directa IVR', 'ivr_vocero') === 'Vocero',
      '⭐ y el encabezado testigo sobrevive al post-proceso (D-31)',
      JSON.stringify(fila.encabezado));
    af(fila.tipo_esperado === 'texto', 'tipo esperado `texto`', String(fila.tipo_esperado));
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Las tres filas de `filasDeGcbaIvr_()`, extraídas de `Instalar.gs`
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · las tres filas del alta');

/* ⭐⭐ **Los tres nombres están COPIADOS del censo del 28/08 18:13**, no generados por prefijo. Un
 * `grep gcba_ivr` sobre la plantilla es una lista generada y no un cruce contra el censo — es como
 * `camp_enviados` entró a una tabla de la que no era (`CLAUDE.md` §4). */
const DEL_CENSO = ['gcba_ivr_at_pct', 'gcba_ivr_atendidos', 'gcba_ivr_llamados'];

{
  const fn = extraer(INSTALAR, 'function filasDeGcbaIvr_');
  let filas = null;
  if (!fn) {
    mal++;
    console.log('  ❌ no se encontró `filasDeGcbaIvr_` en Instalar.gs');
  } else {
    filas = new Function(fn + '\nreturn filasDeGcbaIvr_();')();
  }

  if (filas) {
    af(filas.length === 3, 'emite 3 filas', String(filas.length));

    const nombres = filas.map((f) => f.marcador).sort();
    af(JSON.stringify(nombres) === JSON.stringify(DEL_CENSO),
      '⭐ y los tres nombres son EXACTAMENTE los del censo del 28/08',
      JSON.stringify(nombres));

    /* ⚠ Afirmación NEGATIVA: el bloque de JM tiene `ivr_campanias` y el de GCBA **no trae esa
     * caja**. Un marcador cuyo token no existe en ninguna lámina no falla — resuelve, no encuentra
     * dónde pintarse y queda como una fila que nadie va a poder explicar. */
    af(nombres.indexOf('gcba_ivr_campanias') === -1,
      '⚠ y NO inventa `gcba_ivr_campanias`: esa caja no existe en L-032');

    filas.forEach((f) => {
      af(f.dimensiones === 'ambito=gcba' && f.filtro === '',
        f.marcador + ': el corte va en `dimensiones`, y `filtro` queda vacío (D-33)',
        JSON.stringify({ dimensiones: f.dimensiones, filtro: f.filtro }));
      af(f.base_id === 'digital' && f.solapa === 'Directa IVR',
        f.marcador + ': lee digital/Directa IVR');
      /* ⭐ Ninguna nace con `_revisar`, y el motivo está medido: `R-31` lista esta solapa entre las
       * ESTABLES. Marcar «por las dudas» es lo que hace que `_revisar` deje de significar algo. */
      af(String(f.formato).slice(-8) !== '_revisar',
        f.marcador + ': sin `_revisar` — R-31 lista Directa IVR entre las ESTABLES', f.formato);
    });

    const pct = filas.filter((f) => f.marcador === 'gcba_ivr_at_pct')[0];
    af(pct && pct.operacion === 'PCT' && pct.campo_logico === 'ivr_atendidos/ivr_llamados',
      '⭐ el % es PCT sobre los AGREGADOS, no el promedio de la columna «% Atendidos»',
      pct && pct.campo_logico);

    /* ⭐ Y el cruce que cierra el paso: cada campo lógico que las filas usan tiene que estar en
     * `MAPEO`. Un filtro propio con campo no mapeado **no filtra: falla**. */
    const seed = seedMapeo.leer();
    const campos = [];
    filas.forEach((f) => String(f.campo_logico).split('/').forEach((c) => campos.push(c)));
    campos.forEach((c) => {
      af(!!seed.porClave['digital|Directa IVR|' + c],
        'el campo `' + c + '` está en MAPEO');
    });
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');

if (avisos.length) {
  console.log('\n⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach((a) => console.log('   · ' + a));
}

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Qué número publica cada marcador: eso es una corrida, y después el deck.');
console.log('   · Qué tiene `MAPEO` hoy: esto mide lo que el seed va a sembrar.');
console.log('   · Si el universo es el correcto. Los tres publican el agregado de la VENTANA');
console.log('     (`X-41`), que para GCBA está EN RESERVA desde el 25/08 y sin resolver.');
console.log('   · Que el bloque de JM siga conteniendo a GCBA: los cuatro `ivr_*` de `L-031`');
console.log('     tienen `dimensiones` vacío, y eso es otro paso.');

process.exit(mal ? 1 : 0);
