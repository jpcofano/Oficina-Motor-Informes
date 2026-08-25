/**
 * `2026-08-25` — **la PARTICIÓN de `etapa`: `pre` + `post` = el total, exacto.**
 *
 * ⛔ **Por qué existe, y es una pregunta del usuario que no se contesta mirando el texto:** el
 * criterio de `post` se amplió de `~=Agenda Post` a `~=Post`. **Si `pre` no se amplió con la misma
 * forma negada, hay filas que no entran a ninguna de las dos, o entran a las dos** — y ninguno de
 * los dos casos falla: uno publica de menos y el otro cuenta doble, los dos en silencio.
 *
 * ⭐ **Se mide con el comparador REAL del motor** —`parsearFiltro_` + `valorPasaFiltro_`— sobre las
 * **5.161 filas** de `CAMPAÑAS_DESGLOCE_DIGITAL` del fixture del 20/08 (sha `f8ef3227…`). Leer que
 * un patrón es la negación del otro **no es lo mismo que contar**: `!~=` podría no ser el negado
 * exacto de `~=`, y eso hay que ejercitarlo, no deducirlo.
 *
 * Corre con: `node tools/probar-particion-etapa.js`
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
function extraer(texto, firma, cierre) {
  const desde = texto.indexOf(firma);
  if (desde === -1) return null;
  const c = cierre || '\n}';
  const fin = texto.indexOf(c, desde);
  return fin === -1 ? null : texto.slice(desde, fin + c.length);
}

/** El motor real cargado en un contexto: nada de reimplementar `~=`. */
function contextoMotor() {
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const fue = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
  const ctx = { console, Math, JSON, String, Number, Object, Array, Boolean, isNaN, RegExp, Error,
    Logger: { log: () => {} } };
  vm.createContext(ctx);
  [[gen, 'var SEPARADOR_CONDICIONES_FILTRO_', ';'],
    [gen, 'var OPERADORES_FILTRO_ = [', '\n];'],
    [fue, 'function normalizarValorDeclarado_'],
    [gen, 'function parsearCondicionFiltro_'],
    [gen, 'function parsearFiltro_'],
    [gen, 'function valorPasaFiltro_'],
    [fue, 'var DIMENSIONES_ = {', '\n};']].forEach(([t, f, c]) => {
    const trozo = extraer(t, f, c);
    if (!trozo) avisos.push('⚠ no se encontró `' + f + '` — el banco lo está leyendo mal.');
    else vm.runInContext(trozo, ctx, { filename: 'motor (extracto)' });
  });
  return ctx;
}

const ctx = contextoMotor();
const pasa = (etapa, nombre) => {
  ctx.__t = ctx.DIMENSIONES_.etapa[etapa]['digital|CAMPAÑAS_DESGLOCE_DIGITAL'];
  ctx.__n = nombre;
  return vm.runInContext(
    'parsearFiltro_(__t).condiciones.every(function (c) { return valorPasaFiltro_(__n, c); })', ctx);
};

console.log('La partición de `etapa` — `pre` + `post` = el total, contado con el motor real\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · Los dos criterios son negación literal uno del otro
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · la forma de los dos patrones');
{
  const p = ctx.DIMENSIONES_.etapa.post['digital|CAMPAÑAS_DESGLOCE_DIGITAL'];
  const q = ctx.DIMENSIONES_.etapa.pre['digital|CAMPAÑAS_DESGLOCE_DIGITAL'];
  console.log('   post: ' + p);
  console.log('   pre : ' + q);
  af(q === p.replace('~=', '!~='),
    '`pre` es la negación LITERAL de `post` — mismo campo, mismo valor, operador negado',
    JSON.stringify([p, q]));
  /* ⚠ Que el TEXTO sea la negación no prueba que el COMPARADOR particione: eso es el bloque 2.
   * Es la distinción entre leer el patrón y ejercitarlo. */
  af(p.indexOf('Agenda') === -1,
    '⭐ y ninguno quedó con el `Agenda Post` viejo — si uno se amplió y el otro no, acá se ve');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐⭐ El conteo sobre las filas REALES: pre + post = total, exacto
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · el conteo sobre las 5.161 filas del fixture');
{
  const nombres = leerNombresDelFixture();
  if (!nombres) {
    avisos.push('⚠ el fixture no está en disco: el conteo NO corrió. Es distinto de que dé bien.');
    console.log('  ⚠ salteado: `docs/_fixtures/…20.zip` no está');
  } else {
    const post = nombres.filter((n) => pasa('post', n));
    const pre = nombres.filter((n) => pasa('pre', n));
    const ambas = nombres.filter((n) => pasa('post', n) && pasa('pre', n));
    const ninguna = nombres.filter((n) => !pasa('post', n) && !pasa('pre', n));

    console.log('   filas      ' + nombres.length);
    console.log('   post       ' + post.length);
    console.log('   pre        ' + pre.length);
    console.log('   pre+post   ' + (pre.length + post.length));

    /* ⭐⭐ LA afirmación. Si sobra, alguna fila entra a las dos y se cuenta doble; si falta, alguna
     * no entra a ninguna y desaparece del deck. **Los dos casos publican en silencio.** */
    af(pre.length + post.length === nombres.length,
      '⭐ `pre` + `post` = el total EXACTO — la partición no pierde ni duplica ninguna fila',
      pre.length + ' + ' + post.length + ' = ' + (pre.length + post.length) +
        ' contra ' + nombres.length);
    af(ambas.length === 0,
      'ninguna fila entra a las DOS etapas', ambas.length + ': ' + ambas.slice(0, 3).join(' | '));
    af(ninguna.length === 0,
      'ninguna fila queda FUERA de las dos', ninguna.length + ': ' + ninguna.slice(0, 3).join(' | '));

    /* ⭐ Control positivo: si `pasa()` devolviera siempre `false`, las dos afirmaciones de
     * «ninguna» pasarían igual y la suma daría 0 ≠ total. Que haya filas de las dos clases es lo
     * que prueba que el comparador está viendo el dato. */
    af(post.length > 0 && pre.length > 0,
      '⭐ control positivo: hay filas de las dos clases — el comparador está leyendo de verdad',
      'post=' + post.length + ' pre=' + pre.length);
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · Y la partición por CUENTA, que es donde se lee
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · la partición se cumple TAMBIÉN dentro de cada cuenta');
{
  const porCuenta = leerPorCuentaDelFixture();
  if (!porCuenta) {
    console.log('  ⚠ salteado: el fixture no está');
  } else {
    const ids = Object.keys(porCuenta);
    const rotas = ids.filter((id) => {
      const ns = porCuenta[id];
      const p = ns.filter((n) => pasa('post', n)).length;
      const q = ns.filter((n) => pasa('pre', n)).length;
      return p + q !== ns.length;
    });
    /* ⚠ El total global podría cerrar por compensación —una fila de más acá, una de menos allá—
     * y el consumidor lee **por cuenta**. Por eso se verifica también en ese grano. */
    af(rotas.length === 0,
      '⭐ las ' + ids.length + ' cuentas cumplen `pre` + `post` = sus filas',
      rotas.length + ' rotas: ' + rotas.slice(0, 5).join(', '));

    // El ejemplo que pasó el usuario, con sus números.
    const ej = porCuenta['3143-JUNJDGAG'];
    if (!ej) {
      avisos.push('⚠ `3143-JUNJDGAG` no está en el fixture: su afirmación no corrió.');
    } else {
      const p = ej.filter((n) => pasa('post', n)).length;
      const q = ej.filter((n) => pasa('pre', n)).length;
      af(ej.length === 8 && p === 3 && q === 5,
        '⭐ `3143-JUNJDGAG`: 8 filas = 3 POST + 5 PRE, como midió el usuario',
        ej.length + ' = ' + p + ' + ' + q);
    }
  }
}

/* -- Lectura del fixture: la hace PYTHON, que ya tiene un lector probado -------------- */

/* ⭐ **Acá se compara, allá se lee.** El comparador tiene que ser el del motor —que es JS—, pero el
 * lector de `.xlsx` ya existe y funciona en `tools/medir-post-en-desglose.py`. Un primer intento
 * escribió un lector de zip en JS y **no matcheó la entrada**: reescribir lo que ya existe y
 * funciona es el error que `CLAUDE.md` §4 nombra —*el instrumento que reproduce lógica y la
 * reproduce peor*—, aplicado a la lectura del fixture en vez de al cálculo. */
/* ⛔⛔ **`typeof`, y no `_cache !== null`.** Las funciones se hoistean y los bloques de prueba están
 * **arriba** de esta línea, así que cuando el bloque 2 llama, `var _cache` todavía vale `undefined`
 * — y `undefined !== null` es **true**, con lo cual la función **retornaba sin leer nada**.
 *
 * ⚠ **Y el banco dio «✅ 2 de 2» con el conteo sin correr.** Lo único que lo delató fue el **aviso
 * al final**: *«el conteo NO corrió — es distinto de que dé bien»*. Es la cuarta forma de dar verde
 * sin probar nada, y la que `CLAUDE.md` §4 previene poniendo los avisos **después** del veredicto. */
var _cache = null;
function filasDelDesglose() {
  if (typeof _cache !== 'undefined' && _cache !== null) return _cache;
  try {
    var salida = require('child_process').execFileSync(
      'python', [path.join(RAIZ, 'tools/volcar-nombres-desglose.py')],
      { cwd: RAIZ, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    _cache = JSON.parse(salida).filas;
  } catch (e) {
    avisos.push('⚠ no se pudo leer el fixture (' + String(e.message).slice(0, 90) +
      '): el conteo NO corrio. Es distinto de que de bien.');
    _cache = false;
  }
  return _cache;
}

function leerNombresDelFixture() {
  var f = filasDelDesglose();
  return f ? f.map(function (x) { return x.nombre; }) : null;
}

function leerPorCuentaDelFixture() {
  var f = filasDelDesglose();
  if (!f) return null;
  var out = {};
  f.forEach(function (x) {
    if (!x.cuenta) return;
    if (!out[x.cuenta]) out[x.cuenta] = [];
    out[x.cuenta].push(x.nombre);
  });
  return out;
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
console.log('   · Que la partición sea la CORRECTA. Prueba que es una partición —nada se pierde ni');
console.log('     se duplica—, no que cada fila esté del lado que le toca.');
console.log('   · Qué dice la base HOY: es el export del 20/08/2026.');

process.exit(mal ? 1 : 0);
