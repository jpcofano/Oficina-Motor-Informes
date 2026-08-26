/**
 * `2026-08-25` (`D-31` addendum) — **la lectura POR POSICIÓN**, y el testigo que reemplaza al
 * encabezado.
 *
 * ⛔ **El caso:** en `reuniones/Agenda JM | Post` el título `Visualizaciones` aparece **cuatro
 * veces** (M/R/W/AB) y `leerFuente` indexa por título, así que **gana el último** —Programmatic—.
 * El motor habría publicado `21.229` donde el total es `41.204`. **La letra de `MAPEO` siempre fue
 * correcta; el lector nunca la usaba.**
 *
 * ⭐ **Ejecuta el código real**, no mira su fuente: `filaAObjeto` de `leerFuente` y
 * `claveDeLecturaEnColumna_` / `leePorPosicion_` de `Union.gs`.
 *
 * Corre con: `node tools/probar-lectura-por-posicion.js`
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

/** ⚠ Por posición, nunca por regex con `\n}\n`: los `.gs` están en CRLF y ese patrón NO matchea.
 *  Ya mordió dos veces en `probar-faltantes-causas.js`. */
function extraer(texto, firma, cierre) {
  const desde = texto.indexOf(firma);
  if (desde === -1) return null;
  const c = cierre || '\n}';
  const fin = texto.indexOf(c, desde);
  return fin === -1 ? null : texto.slice(desde, fin + c.length);
}

const union = fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8');
const fuentes = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
const instalar = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');

console.log('D-31 addendum — lectura por posición, con el código real\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · `leePorPosicion_` — lo declara el `MAPEO`, no el código
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · la decisión sale de `MAPEO.por_posicion`, no de una lista en el código');
{
  const ctx = { console, Math, JSON, String, Number, Object, Array, Boolean, isNaN, RegExp, Error };
  vm.createContext(ctx);
  // El `MAPEO` es un stub: lo que se afirma es el LECTOR, no el contenido de la hoja.
  ctx.leerMapeo = () => ({
    reuniones: {
      'Agenda JM | Post': {
        vis_totales: { columna: 'M', por_posicion: 'sí' },
        imp_totales: { columna: 'J', por_posicion: '' },
        poblacion: { columna: 'F' }
      }
    }
  });
  ctx.esVerdadero_ = (v) => ['sí', 'si', 'true', 'x', '1'].indexOf(String(v).trim().toLowerCase()) !== -1;
  const fn = extraer(union, 'function leePorPosicion_');
  if (!fn) { af(false, 'se encontró `leePorPosicion_` en Union.gs'); }
  else {
    vm.runInContext(fn, ctx, { filename: 'Union.gs (extracto)' });
    const lee = (col) => { ctx.__c = col; return vm.runInContext('leePorPosicion_("reuniones", "Agenda JM | Post", __c)', ctx); };

    af(lee('M') === true, 'la columna con `por_posicion = sí` se lee por posición');
    af(lee('J') === false, 'la que lo tiene vacío, NO — vacío es el comportamiento de siempre');
    af(lee('F') === false, 'y la que no declara la columna tampoco');
    af(lee('m') === true, '⭐ la letra se compara sin case: `m` es la misma columna que `M`');
    af(lee('Z') === false && lee('') === false,
      'una letra que el `MAPEO` no menciona devuelve `false`, no tira');

    /* ⭐ Control positivo del stub: si `leerMapeo` devolviera vacío, TODAS las de arriba darían
     * `false` y las cuatro afirmaciones de ausencia pasarían igual. Que `M` dé `true` es lo que
     * prueba que el lector está mirando el mapa. */
    af(lee('M') === true && lee('J') === false,
      '⭐ control positivo: distingue entre dos columnas del mismo `MAPEO` — no devuelve fijo');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐⭐ `filaAObjeto` — la celda viaja TAMBIÉN por posición
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · con títulos repetidos, la posición devuelve la celda correcta');
{
  /* ⭐ El fixture está COPIADO de la solapa real: cuatro `Visualizaciones` (M/R/W/AB) con los
   * valores medidos de Retiro. **No es inventado** — deducirlo del código probaría que sé leer el
   * código, que es justo lo que no hace falta verificar. */
  const headers = [];
  for (let i = 0; i < 30; i++) headers.push('c' + i);
  headers[9] = 'Impresiones totales';
  headers[12] = 'Visualizaciones';
  headers[17] = 'Visualizaciones';
  headers[22] = 'Visualizaciones';
  headers[27] = 'Visualizaciones';

  const fila = [];
  for (let i = 0; i < 30; i++) fila.push(0);
  fila[9] = 136971; fila[12] = 41204; fila[17] = 7892; fila[22] = 12083; fila[27] = 21229;

  const ctx = { console, Math, JSON, String, Number, Object, Array, Boolean, headers,
    PREFIJO_COLUMNA_POSICIONAL_: '__pos__' };
  vm.createContext(ctx);
  const fn = extraer(fuentes, '  function filaAObjeto(fila) {', '\n  }');
  if (!fn) { af(false, 'se encontró `filaAObjeto` en Fuentes.gs'); }
  else {
    vm.runInContext(fn.replace(/^\s+/, ''), ctx, { filename: 'Fuentes.gs (extracto)' });
    ctx.__f = fila;
    const obj = vm.runInContext('filaAObjeto(__f)', ctx);

    /* ⛔ LA afirmación: por título gana el último, que es Programmatic. Es el bug entero en una
     * línea, y queda fijado para que nadie lo lea como un detalle. */
    af(obj['Visualizaciones'] === 21229,
      '⛔ por TÍTULO gana el último (21.229 = Programmatic) — el bug, fijado',
      String(obj['Visualizaciones']));
    af(obj['__pos__12'] === 41204,
      '⭐ por POSICIÓN devuelve el ACUMULADO: 41.204', String(obj['__pos__12']));
    af(obj['__pos__17'] === 7892 && obj['__pos__22'] === 12083 && obj['__pos__27'] === 21229,
      'y las tres plataformas quedan accesibles por su índice');

    /* ⚠ Se AGREGA, no reemplaza: ningún consumidor por título cambia de comportamiento. */
    af(obj['Impresiones totales'] === 136971,
      '⭐ las claves por título siguen funcionando — se agrega, no se reemplaza');
    af(obj['__pos__9'] === 136971, 'y la misma celda es accesible por las dos vías');

    /* ⭐⭐ La identidad de bloques, que es el testigo nuevo. */
    af(obj['__pos__12'] === obj['__pos__17'] + obj['__pos__22'] + obj['__pos__27'],
      '⭐⭐ y la identidad del testigo cierra: M = R + W + AB');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · El esquema y el delta declaran la columna
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · `por_posicion` está en `MAPEO`, y las dos filas volvieron');
{
  const esquema = instalar.slice(instalar.indexOf('  MAPEO: {'), instalar.indexOf('  },', instalar.indexOf('  MAPEO: {')));
  af(esquema.indexOf("'por_posicion'") !== -1, '`por_posicion` está en los headers de `MAPEO`');

  const delta = instalar.slice(instalar.indexOf('var COLUMNAS_DELTA_'), instalar.indexOf('function aplicarInstalacion_'));
  af(delta.indexOf("{ nombre: 'por_posicion'") !== -1,
    'y entra por `COLUMNAS_DELTA_` — recrear `MAPEO` borraría las 200+ filas curadas');

  /* Las dos filas, buscadas UNA POR UNA. */
  ['vis_totales', 'vis_vtr_pct'].forEach((campo) => {
    const i = instalar.indexOf("campo_logico: '" + campo + "'");
    af(i !== -1, campo + ' volvió al `SEED_MAPEO_`');
    if (i === -1) return;
    const fila = instalar.slice(i, instalar.indexOf('\n', i));
    /* ⭐⭐ `2026-08-26` — **DADAS VUELTA, y el motivo es el hallazgo.** Estas dos afirmaciones
     * pedían `por_posicion: 'sí'` y una nota que dijera `TÍTULO REPETIDO`. Las dos pasaban, y
     * **las dos daban verde sobre la creencia que produjo el bug**: que declarar `por_posicion`
     * bastaba. No bastaba —el mecanismo nunca corrió— y del 25 al 26/08 estos dos marcadores
     * leyeron Programmatic con este banco en verde.
     *
     * Hoy la solapa tiene **títulos únicos** y la declaración se retiró. Se exige lo contrario,
     * y más fuerte: que NO esté, y que la nota **no** siga afirmando lo viejo. */
    af(fila.indexOf("por_posicion: 'sí'") === -1,
      '  …y NO declara `por_posicion` — la solapa tiene títulos únicos desde el 26/08',
      'declararlo sobre un mecanismo que no corre es lo que produjo el bug');
    /* ⚠ NO se exige que la nota OMITA «POR POSICIÓN»: se exige que la MARQUE FALSA. Omitirla
     * borraría el registro de por qué el bug vivió, que es la mitad del valor de la nota. */
    af(fila.toLowerCase().indexOf('falso') !== -1,
      '  …y su nota marca como FALSA la afirmación vieja de que se leía por posición',
      'esa afirmación es la que hacía leer el bug como resuelto');
    af(fila.indexOf('PROGRAMMATIC') !== -1,
      '  …y su nota REGISTRA que estuvo publicando Programmatic hasta el 26/08');
  });

  /* ⭐ La letra no cambió —siempre fue correcta—; lo que cambió es el TÍTULO de esa letra. Las
   * cadenas salen de MEDIR la hoja viva el 26/08, no de dictarlas. */
  af(instalar.indexOf("columna: 'M', encabezado: 'Visualizaciones totales'") !== -1,
    '⭐ `vis_totales` apunta a M con el título ÚNICO medido «Visualizaciones totales»');
  af(instalar.indexOf("columna: 'N', encabezado: '% VTR total'") !== -1,
    'y `vis_vtr_pct` a N con «% VTR total»');

  /* ⛔⛔ **El testigo que faltaba, y sin él nada de lo de arriba prueba que el mecanismo ande.**
   * `leerMapeoSinCache_` arma el objeto de `MAPEO` campo por campo y **no incluye
   * `por_posicion`**, así que `leePorPosicion_` evalúa `esVerdadero_(undefined)` y devuelve
   * `false` SIEMPRE, para toda columna de toda solapa. El mecanismo está **inerte**.
   *
   * ⭐ **Cuando alguien lo arregle, esta afirmación se pone ROJA. Dala vuelta, no la borres** —
   * y ahí sí las de arriba empiezan a significar algo. */
  const lector = extraer(fs.readFileSync(path.join(RAIZ, 'Config.gs'), 'utf8'),
    'function leerMapeoSinCache_');
  af(lector !== null && lector.indexOf('por_posicion') === -1,
    '⛔ HUECO CONOCIDO: `leerMapeoSinCache_` NO indexa `por_posicion` → mecanismo INERTE',
    'si esto se puso rojo, el lector se arregló: dar vuelta la afirmación');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Los siete puntos que resuelven el campo de un marcador usan el resolvedor nuevo
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · el resolvedor está en UN punto, y los llamadores lo heredan');
{
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const usos = (gen.match(/claveDeLecturaEnColumna_\(/g) || []).length;
  af(usos >= 10, '`Generador.gs` resuelve por `claveDeLecturaEnColumna_` en ' + usos + ' puntos');

  /* ⭐⭐ La afirmación que impide que alguien agregue un punto nuevo con la función vieja: en
   * `Generador.gs` **no puede quedar ninguna llamada** a `encabezadoEnColumna_`. Si vuelve una, ese
   * marcador no leería por posición **y no fallaría**. */
  const viejas = (gen.match(/[^_a-zA-Z]encabezadoEnColumna_\(/g) || []).length;
  af(viejas === 0,
    '⭐ y NINGUNA llamada quedó con `encabezadoEnColumna_` — un punto olvidado no fallaría, leería mal',
    viejas + ' quedaron');

  /* Y la función vieja sigue existiendo, porque `Union.gs` necesita el título REAL para el aviso. */
  af(union.indexOf('function encabezadoEnColumna_') !== -1,
    'la función vieja sigue: `Union.gs` necesita el título real para el aviso de `D-31`');
  af(union.indexOf('function claveDeLecturaEnColumna_') !== -1, 'y la nueva la envuelve');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · ⭐⭐ El testigo que reemplaza al encabezado
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · `verificarBloquesPostReuniones()` — el testigo nuevo');
{
  const aud = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');
  af(aud.indexOf('function verificarBloquesPostReuniones()') !== -1,
    'existe, sin `_` y SIN PARÁMETROS — las dos condiciones del desplegable');

  const bloques = extraer(aud, 'var BLOQUES_VIS_POST_L036_', ';');
  af(bloques && bloques.indexOf('acumulado: 12') !== -1 && bloques.indexOf('meta: 17') !== -1 &&
    bloques.indexOf('google: 22') !== -1 && bloques.indexOf('programmatic: 27') !== -1,
    '⭐ y declara las cuatro posiciones con el ORDEN confirmado: acumulado primero', bloques || '');

  const cuerpo = extraer(aud, 'function verificarBloquesPostReuniones()');
  if (!cuerpo) { af(false, 'se pudo extraer el cuerpo'); }
  else {
    /* ⭐⭐ «Cero evaluables es un problema, no un silencio». Sin esto, una columna corrida que
     * dejara las cuatro en `-` daría verde — que es el modo de falla que el testigo viene a cazar. */
    af(cuerpo.indexOf('CERO FILAS EVALUABLES') !== -1,
      '⭐⭐ y cero filas evaluables FALLA — «no se probó nada» no puede leerse como «todo bien»');
    af(cuerpo.indexOf('evaluadas > 0') !== -1, '  …con la condición explícita en el veredicto');
    /* ⚠ Y las no evaluables se cuentan aparte: contarlas como fallo haría que el testigo diera
     * rojo por una carga incompleta, y ahí dejaría de distinguir una columna corrida. */
    af(cuerpo.indexOf('sinPartes') !== -1,
      '  …y las no evaluables se cuentan APARTE, no como fallo');
    af(cuerpo.indexOf('INSERTADO O') !== -1 || cuerpo.indexOf('MOVIDO') !== -1,
      '⭐ y cuando falla nombra la causa probable: una columna insertada o movida');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
if (avisos.length) {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.\n');
  console.log('⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach((a) => console.log('   · ' + a));
} else {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');
}

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Que la hoja VIVA tenga los bloques en M/R/W/AB. Eso lo dice');
console.log('     `verificarBloquesPostReuniones()` corriendo contra la planilla.');
console.log('   · Que `instalar()` cree la columna `por_posicion`: se afirma que está declarada,');
console.log('     no que la hoja la tenga.');
console.log('   · Que el deck publique 41.204. Eso lo dice una corrida de `jm`.');

process.exit(mal ? 1 : 0);
