#!/usr/bin/env node
/**
 * tools/probar-lista-texto.js — `LISTA_TEXTO`, la decimocuarta operación (`emin_lista`).
 *
 * ⭐⭐ **El caso que la justifica es REAL y son las siete filas que el usuario leyó de la base el
 * 03/09**, no un fixture inventado (`CLAUDE.md` §4: un fixture de formato se copia, no se deduce).
 * Tres de ellas dicen *«Seguridad en tu barrio»* **el mismo día**, que es exactamente lo que
 * `LISTA_CRUDA` colapsaría y lo que el condicional viene a distinguir.
 *
 * ⚠ **Se extraen las funciones REALES** —`opLISTA_TEXTO`, `partirTokenDePlantilla_`,
 * `camposDePlantilla_`, `normalizarValorDeclarado_`— y no se reimplementa ninguna.
 *
 * Uso:  node tools/probar-lista-texto.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

/* ⚠ **Se corta por el `}` en COLUMNA 0, no contando llaves**, y eso no es pereza: estas cuatro
 * funciones llevan `/\{([^}:]+)…\}/` adentro, y **un contador de llaves cuenta las del regex**.
 * Es el mismo error que el `2026-09-02` sacó de `tools/inventario.js`. Todas son top-level, así
 * que su cierre es la primera línea que empieza con `}`. */
function extraer(src, firma) {
  const i = src.indexOf(firma);
  if (i === -1) throw new Error('no encontré `' + firma + '`');
  const fin = src.indexOf('\n}', i);
  if (fin === -1) throw new Error('no cerró `' + firma + '`');
  return src.slice(i, fin + 2);
}

const MARC = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');
const GEN = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
const FUE = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');

const ctx = {
  Utilities: { formatDate: (d, tz, f) => {
    const dd = String(d.getDate()).padStart(2, '0'), mm = String(d.getMonth() + 1).padStart(2, '0');
    return f === 'dd/MM' ? dd + '/' + mm : dd + '/' + mm + '/' + d.getFullYear();
  } },
  Session: { getScriptTimeZone: () => 'GMT-3' },
  trazaDeVentana_: () => '',
  parsearFechaCelda_: v => (v instanceof Date ? v : null)
};
vm.createContext(ctx);
vm.runInContext([
  extraer(FUE, 'function normalizarValorDeclarado_'),
  extraer(GEN, 'function partirTokenDePlantilla_'),
  extraer(GEN, 'function camposDePlantilla_'),
  extraer(MARC, 'function opLISTA_TEXTO'),
  extraer(MARC, 'function plantillaSinCondicional_')
].join('\n'), ctx);

/* ── Las SIETE filas reales, leídas de `Agenda funcionarios` el 03/09/2026 ──────────────── */
const FILAS = [
  { fig: 'Ezequiel Sabor',         bar: 'Comuna 2',        f: new Date(2026, 7, 31) },
  { fig: 'Gabriel Sánchez Zinny',  bar: 'Comuna 11',       f: new Date(2026, 7, 31) },
  { fig: 'Gabino Tapia',           bar: 'Comuna 1 Norte',  f: new Date(2026, 8, 3) },
  { fig: 'Seguridad en tu barrio', bar: 'Comuna 1 Sur',    f: new Date(2026, 8, 3) },
  { fig: 'Seguridad en tu barrio', bar: 'Comuna 2',        f: new Date(2026, 8, 3) },
  { fig: 'Seguridad en tu barrio', bar: 'Comuna 3',        f: new Date(2026, 8, 3) },
  { fig: 'Gabriel Mraida',         bar: 'Comuna 9',        f: new Date(2026, 8, 4) }
];
const campos = { figura: { clave: 'fig' }, barrio: { clave: 'bar' }, fecha: { clave: 'f' } };
const base = { base_id: 'reuniones', solapa: 'Agenda funcionarios', plantilla: { campos }, filas: FILAS };
const corre = (plantilla, extra) => ctx.opLISTA_TEXTO(
  Object.assign({}, base, { campo_logico: plantilla, separador: '\n' }, extra || {}));

console.log('═══ A · ⭐⭐ el condicional: el literal vive en la PLANTILLA, no en el .gs ═══');
{
  const r = corre('{figura=Seguridad en tu barrio?barrio} {fecha:dd/MM}');
  const lineas = r.valor.split('\n');
  afirmar(lineas.length === 7, 'publica las SIETE filas (dio ' + lineas.length + ')');
  afirmar(lineas[0] === 'Ezequiel Sabor 31/08', 'una persona sale con su nombre: ' + lineas[0]);
  afirmar(lineas[3] === 'Comuna 1 Sur 03/09', '⭐⭐ el ciclo sale con su BARRIO: ' + lineas[3]);
  afirmar(lineas[4] === 'Comuna 2 03/09' && lineas[5] === 'Comuna 3 03/09',
    '⭐⭐ y las tres se distinguen entre sí — ése era el punto');
  afirmar(new Set(lineas).size === 7, '⭐ las siete líneas son DISTINTAS');
  afirmar(/3 condicional\(es\) aplicado\(s\)/.test(r.traza), 'la traza dice cuántos aplicaron: ' +
    (r.traza.match(/\d+ condicional\(es\)[^·]*/) || [''])[0].trim());
}

console.log('\n═══ B · ⛔ SIN el condicional, tres líneas quedan IDÉNTICAS ═══');
{
  /* ⭐ Es el control que prueba que el condicional hace algo: sin él, el defecto aparece. */
  const r = corre('{figura} {fecha:dd/MM}');
  const lineas = r.valor.split('\n');
  afirmar(lineas.length === 7, 'siguen siendo siete filas — `LISTA_TEXTO` NO deduplica');
  afirmar(new Set(lineas).size === 5, '⛔ pero sólo CINCO son distintas (dio ' +
    new Set(lineas).size + ') — las tres del ciclo colapsan visualmente');
  afirmar(lineas.filter(x => x === 'Seguridad en tu barrio 03/09').length === 3,
    '⛔ y las tres dicen exactamente lo mismo');
  afirmar(/ningún condicional aplicó/.test(r.traza) === false,
    '⚠ y NO avisa «ningún condicional aplicó»: la plantilla no tiene ninguno, no es un hallazgo');
}

console.log('\n═══ C · ⭐ NO deduplica, y ésa es la decisión que la define ═══');
{
  /* ⛔ `LISTA_CRUDA` sobre `figura` daría 5. El motivo de que exista esta operación. */
  const distintas = new Set(FILAS.map(x => x.fig)).size;
  afirmar(distintas === 5, 'sobre `figura` hay 5 valores distintos y 7 filas');
  const r = corre('{figura} {fecha:dd/MM}');
  afirmar(r.valor.split('\n').length === 7,
    '⭐⭐ `LISTA_TEXTO` publica 7 — deduplicar habría PERDIDO dos encuentros, en silencio');
  afirmar(r.filas === 7, 'y `filas` informa 7');
}

console.log('\n═══ D · ⚠ la comparación se normaliza de los dos lados (`R-10`) ═══');
{
  /* Una celda tipeada a mano trae espacios de más; comparar crudo fallaría EN SILENCIO. */
  const sucias = FILAS.map(x => Object.assign({}, x,
    { fig: x.fig === 'Seguridad en tu barrio' ? '  Seguridad  en   tu barrio ' : x.fig }));
  const r = ctx.opLISTA_TEXTO(Object.assign({}, base, { filas: sucias, separador: '\n',
    campo_logico: '{figura=Seguridad en tu barrio?barrio} {fecha:dd/MM}' }));
  afirmar(/3 condicional\(es\)/.test(r.traza),
    '⭐⭐ con espacios de más y dobles, los tres SIGUEN aplicando');
  afirmar(r.valor.split('\n')[3] === 'Comuna 1 Sur 03/09', '   y publican el barrio igual');
}

console.log('\n═══ E · ⛔ cero filas NO es una lista vacía ═══');
{
  const r = ctx.opLISTA_TEXTO(Object.assign({}, base, { filas: [], separador: '\n',
    campo_logico: '{figura} {fecha:dd/MM}' }));
  afirmar(r.ambiguo === true, '⭐ marca `ambiguo` en vez de publicar cadena vacía');
  afirmar(/lista_sin_filas/.test(r.traza), '   con su símbolo propio: ' +
    (r.traza.match(/«[^»]+»/) || [''])[0]);
  afirmar(/universo vac/.test(r.traza),
    '⭐⭐ y dice el motivo: «no hubo encuentros» y «el recorte los dejó afuera» son dos cosas');
}

console.log('\n═══ F · ⚠ un campo sin mapeo deja hueco VISIBLE, no vacío ═══');
{
  const r = ctx.opLISTA_TEXTO(Object.assign({}, base, { separador: '\n',
    plantilla: { campos: { figura: { clave: 'fig' }, fecha: { clave: 'f' } } },   // falta `barrio`
    campo_logico: '{figura=Seguridad en tu barrio?barrio} {fecha:dd/MM}' }));
  afirmar(/«\?barrio»/.test(r.valor), '⭐ publica `«?barrio»`, no una celda vacía');
  afirmar(/campos sin resolver: barrio \(sin mapeo\)/.test(r.traza),
    '   y la traza nombra el campo y la causa');
  afirmar(r.valor.split('\n').length === 7, '   sin perder ninguna fila');
}

console.log('\n═══ G · `partirTokenDePlantilla_` — y las plantillas viejas no cambian ═══');
{
  const p = ctx.partirTokenDePlantilla_;
  afirmar(p('figura').campo === 'figura' && p('figura').igual === null,
    '⭐ `{campo}` se parte igual que antes — `FILA_TEXTO`/`GRUPO_TEXTO` no se tocan');
  const c = p('figura=Seguridad en tu barrio?barrio');
  afirmar(c.campo === 'figura' && c.igual === 'Seguridad en tu barrio' && c.alterno === 'barrio',
    '⭐⭐ el condicional se parte en tres, con el literal CON espacios: ' + JSON.stringify(c.igual));
  /* ⚠ El alterno tiene que entrar a `camposDePlantilla_`, o nadie lo mapea. */
  const cs = ctx.camposDePlantilla_('{figura=Seguridad en tu barrio?barrio} {fecha:dd/MM}');
  afirmar(cs.indexOf('barrio') !== -1,
    '⭐⭐ `barrio` entra como campo — si no, se publicaría `«?barrio»` sin que nada dijera por qué');
  afirmar(cs.length === 3 && cs.indexOf('figura') !== -1 && cs.indexOf('fecha') !== -1,
    '   y los tres campos salen: ' + cs.join(', '));
  /* Control de no-regresión de la sintaxis vieja, con una plantilla real del repo. */
  const vieja = ctx.camposDePlantilla_('{figura} — {tipo_encuentro} en {barrio} ({fecha_periodo:dd/MM})');
  afirmar(vieja.join(',') === 'figura,tipo_encuentro,barrio,fecha_periodo',
    '⭐ una plantilla vieja da exactamente los mismos campos que antes');
}

console.log('\n═══ H · control NEGATIVO — el banco PUEDE fallar ═══');
{
  /* ⛔ Si el condicional NO existiera, la sección A tendría que caer. Se verifica que la mutación
   * ocurra: sin eso, el negativo correría sobre la plantilla intacta y daría verde igual. */
  const sinCond = '{figura} {fecha:dd/MM}';
  const conCond = '{figura=Seguridad en tu barrio?barrio} {fecha:dd/MM}';
  afirmar(sinCond !== conCond, '⭐⭐ la mutación ocurrió: las dos plantillas son distintas');
  const a = corre(conCond).valor.split('\n'), b = corre(sinCond).valor.split('\n');
  afirmar(new Set(a).size === 7 && new Set(b).size === 5,
    '⭐⭐ y distinguen: 7 líneas únicas con condicional contra 5 sin él');
  afirmar(a[3] !== b[3], '   la línea 4 cambia — el fixture SÍ separa las dos definiciones');
}

console.log('');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ todas las afirmaciones pasaron');
console.log('⚠ Lo que este verde NO dice: qué filas le van a llegar. El universo lo decide la');
console.log('  ventana, y eso es el hallazgo del 6 contra 7 — abierto, en PENDIENTES.');
