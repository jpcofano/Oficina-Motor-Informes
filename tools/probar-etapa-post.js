/**
 * `2026-08-25` — el criterio de `DIMENSIONES_.etapa`: qué toma, qué no, y que `pre` sea el
 * complemento EXACTO de `post`.
 *
 * ⭐ **Ejecuta el comparador REAL del motor** —`parsearFiltro_` + `valorPasaFiltro_` de
 * `Generador.gs`— sobre los nombres de campaña, y lee `DIMENSIONES_` de `Fuentes.gs`. No
 * reimplementa el `~=` (`CLAUDE.md` §4: reproducir lógica del motor es el error que este repo ya
 * cometió cuatro veces).
 *
 * ⭐⭐ **Los fixtures de nombres están COPIADOS de la solapa, no inventados** — `CLAUDE.md` §4: un
 * fixture de formato se copia de una salida real, nunca se deduce del código que lo emite.
 *
 * Corre con: `node tools/probar-etapa-post.js`
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

/* ⭐⭐ NOMBRES REALES, copiados de `CAMPAÑAS_DESGLOCE_DIGITAL` (fixture del 20/08, sha
 * `f8ef3227…`). Las cuatro formas de escribir «Post» que el equipo usa, más los PRE que las
 * acompañan. **Ninguno está inventado**: deducirlos del patrón probaría que sé leer el patrón, que
 * es justo lo que no hace falta verificar. */
const POST_REALES = [
  'Agenda Post con 1 - 1 A 1 - Retiro - 24/7',          // «Agenda Post» — la forma vieja
  'Post Agenda RDV Con 1 - Salud Eje Norte 10/6',       // «Post» al principio
  'Agenda con 1 Post - 1 A 1 - Comuna 1 - 17/4',        // «Post» en el medio
  'RDV Post Agenda con 1 - Primera Persona 1/6',        // «Post» en segunda posición
  'Día Mundia del la Salud Post',                        // «Post» al final
  'Post Vacaciones de Invierno'                          // sin «Agenda» en ninguna parte
];

const PRE_REALES = [
  'Agenda RDV Con 1 - Salud Eje Norte 10/6',
  'Agenda con 1 - 1 A 1 - Retiro - 24/7',
  'Agenda RDV Con 1 - Orden Publico Eje Norte 28/7',
  'Verano BA | Generico'
];

/** Contexto con el comparador real y `DIMENSIONES_`. */
function contexto(textoFuentes) {
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const fue = textoFuentes !== undefined
    ? textoFuentes
    : fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');

  const ctx = { console, Math, JSON, String, Number, Object, Array, Boolean, isNaN, RegExp, Error,
    Logger: { log: () => {} } };
  vm.createContext(ctx);

  /* ⚠ Las constantes se cargan **del archivo**, no como literales acá: un banco que declara `'&&'`
   * o la tabla de operadores de su lado seguiría verde si el motor los cambiara — mediría su propia
   * copia en vez del motor. */
  [['var SEPARADOR_CONDICIONES_FILTRO_', ';'], ['var SEPARADOR_ALTERNATIVAS_FILTRO_', ';'],
   ['var OPERADORES_FILTRO_ = [', '\n];']]
    .forEach(([firma, cierre]) => {
      const c = extraer(gen, firma, cierre);
      if (!c) avisos.push('⚠ no se encontró `' + firma + '` en Generador.gs.');
      else vm.runInContext(c, ctx, { filename: 'Generador.gs (extracto)' });
    });

  /* ⭐ `2026-08-28` — se agregan `alternativasDeCondicion_` y `primeraCondicionQueFalla_`: el banco
   * pasa a usar **el evaluador real** en vez de rehacer el bucle `AND` de su lado, y así entiende
   * el separador `||` que el motor ganó hoy. Rehacerlo acá lo dejaba verde sobre un motor cambiado
   * — el mismo argumento que el comentario de arriba da para las constantes. */
  ['function normalizarValorDeclarado_', 'function parsearCondicionFiltro_',
    'function alternativasDeCondicion_', 'function parsearFiltro_', 'function valorPasaFiltro_',
    'function primeraCondicionQueFalla_'].forEach((firma) => {
    const fuente = firma === 'function normalizarValorDeclarado_' ? fue : gen;
    const fn = extraer(fuente, firma);
    if (!fn) {
      avisos.push('⚠ no se encontró `' + firma + '` — el banco lo está leyendo mal.');
      return;
    }
    vm.runInContext(fn, ctx, { filename: 'motor (extracto)' });
  });

  const dim = extraer(fue, 'var DIMENSIONES_ = {', '\n};');
  if (!dim) {
    mal++;
    console.log('  ❌ no se encontró `DIMENSIONES_` en Fuentes.gs');
  } else {
    vm.runInContext(dim, ctx, { filename: 'Fuentes.gs (extracto)' });
  }
  return ctx;
}

/** ¿El nombre pasa el filtro de esa etapa, según el motor? */
function pasa(ctx, etapa, nombre) {
  ctx.__t = ctx.DIMENSIONES_.etapa[etapa]['digital|CAMPAÑAS_DESGLOCE_DIGITAL'];
  ctx.__n = nombre;
  return vm.runInContext(
    'primeraCondicionQueFalla_(parsearFiltro_(__t).condiciones, function () { return __n; }) === null', ctx);
}

console.log('DIMENSIONES_.etapa — el criterio de POST, con el comparador real del motor\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · Las cuatro formas reales de escribir «Post» entran todas
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · el criterio nuevo toma las CUATRO posiciones de «Post»');
{
  const ctx = contexto();
  POST_REALES.forEach((n) => {
    af(pasa(ctx, 'post', n) === true, 'POST: ' + n.slice(0, 52));
  });

  /* ⭐ Control positivo obligatorio: la forma VIEJA tiene que seguir entrando. Un criterio nuevo
   * que gana casos y pierde otros no es una ampliación — y las dos salidas se leen igual desde el
   * conteo de filas. */
  af(pasa(ctx, 'post', POST_REALES[0]) === true,
    '⭐ y la forma VIEJA «Agenda Post» SIGUE entrando — es ampliación, no reemplazo');
}

console.log('\n1b · y los PRE reales NO entran al post');
{
  const ctx = contexto();
  PRE_REALES.forEach((n) => {
    af(pasa(ctx, 'post', n) === false, 'no es POST: ' + n.slice(0, 52));
  });
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · `pre` es el COMPLEMENTO EXACTO de `post`
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · toda fila cae en exactamente UNA etapa — el pre es el complemento');
{
  const ctx = contexto();
  /* ⭐⭐ Es el invariante que hace válido el criterio de aceptación del testigo: si una fila que
   * entra al post NO sale del pre, el par se movería en la misma dirección y la comparación del
   * usuario (`V-110`) dejaría de significar algo. */
  const todos = POST_REALES.concat(PRE_REALES);
  const rotos = todos.filter((n) => pasa(ctx, 'post', n) === pasa(ctx, 'pre', n));
  af(rotos.length === 0,
    'los ' + todos.length + ' nombres caen en exactamente una etapa, nunca en las dos ni en ninguna',
    'rotos: ' + rotos.join(' | '));

  af(POST_REALES.every((n) => pasa(ctx, 'pre', n) === false),
    'ninguno de los POST cae también en el pre');
  af(PRE_REALES.every((n) => pasa(ctx, 'pre', n) === true),
    'y los cuatro PRE sí caen en el pre');

  /* Y que la definición sea literalmente la negación, no dos patrones que hoy coinciden. */
  const p = ctx.DIMENSIONES_.etapa.post['digital|CAMPAÑAS_DESGLOCE_DIGITAL'];
  const q = ctx.DIMENSIONES_.etapa.pre['digital|CAMPAÑAS_DESGLOCE_DIGITAL'];
  af(q === p.replace('~=', '!~='),
    '⭐ `pre` es la NEGACIÓN literal de `post`, no un segundo patrón que hoy coincide',
    JSON.stringify([p, q]));
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · Los límites declarados — el case, y los falsos positivos
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · lo que el criterio NO toma, medido y no supuesto');
{
  const ctx = contexto();
  /* ⚠ `~=` es sensible al case: `R-10` preserva mayúsculas. Medido sobre el fixture: las 318
   * apariciones son **una sola grafía**, `Post`. Esta afirmación FIJA el límite — si algún día
   * alguien lo hace insensible, se pone roja y hay que venir a leer por qué estaba así. */
  af(pasa(ctx, 'post', 'post agenda con 1 - Comuna 5') === false,
    '⚠ «post» en minúscula NO entra — `~=` es sensible al case (límite declarado, no bug)');
  af(pasa(ctx, 'post', 'POST AGENDA CON 1 - COMUNA 5') === false,
    '⚠ ni «POST» en mayúsculas');

  /* ⭐ Los falsos positivos que un patrón por subcadena podría traer. Medido sobre el fixture:
   * «Post» aparece 318 veces y SIEMPRE como palabra entera — ninguno de éstos existe hoy. La
   * afirmación documenta que **sí entrarían** si aparecieran, que es el riesgo asumido. */
  af(pasa(ctx, 'post', 'Agenda Poste de luz Comuna 3') === true,
    '⚠ «Poste» SÍ entraría — riesgo asumido: medido, hoy no existe ninguno en las 318 apariciones');

  /* ⭐ Control positivo del banco entero: si `contexto()` no cargara `DIMENSIONES_`, todo lo de
   * arriba tiraría o daría `undefined`, y algunas afirmaciones de ausencia pasarían igual. */
  af(typeof ctx.DIMENSIONES_ === 'object' && !!ctx.DIMENSIONES_.etapa,
    '⭐ control positivo: `DIMENSIONES_` se cargó de verdad — el banco lo está leyendo');
  af(ctx.DIMENSIONES_.etapa.post['digital|CAMPAÑAS_DESGLOCE_DIGITAL'] === 'des_campana~=Post',
    'y el criterio vigente es el ampliado',
    ctx.DIMENSIONES_.etapa.post['digital|CAMPAÑAS_DESGLOCE_DIGITAL']);
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Control NEGATIVO — volver al criterio viejo pierde las tres formas nuevas
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · romper a propósito: con el criterio viejo, tres de las formas se pierden');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
  const buscar = "    post: { 'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_campana~=Post' },";
  const poner = "    post: { 'digital|CAMPAÑAS_DESGLOCE_DIGITAL': 'des_campana~=Agenda Post' },";

  /* ⭐⭐ La guarda que va ANTES de mirar el resultado: si el texto mutado es idéntico al original,
   * el caso FALLA — no se saltea. Sin esto el negativo corre sobre el código intacto, da verde, y
   * eso se lee como «el negativo pasó». */
  const mutado = texto.replace(buscar, poner);
  if (mutado === texto) {
    af(false, 'MUTACIÓN NO APLICADA', 'el patrón no matcheó — el banco lee un código que cambió');
  } else {
    const ctx = contexto(mutado);
    const perdidos = POST_REALES.filter((n) => pasa(ctx, 'post', n) === false);
    af(perdidos.length === 5,
      'roto: con «Agenda Post» se pierden 5 de las 6 formas reales',
      'se perdieron ' + perdidos.length + ': ' + perdidos.join(' | '));
    af(pasa(ctx, 'post', POST_REALES[0]) === true,
      'y la que sobrevive es justamente la vieja — el negativo cae por el MOTIVO correcto');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Los 21 marcadores del testigo existen en el seed
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · el testigo nombra marcadores que el seed realmente construye');
{
  const aud = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');
  const lista = extraer(aud, 'var MARCADORES_ETAPA_TESTIGO_ = [', '\n];');
  if (!lista) {
    af(false, 'se encontró `MARCADORES_ETAPA_TESTIGO_` en Auditoria.gs');
  } else {
    const nombres = (lista.match(/'(u1_[a-z_]+)'/g) || []).map(s => s.slice(1, -1));
    af(nombres.length === 21, 'el testigo lista 21 marcadores', nombres.length + '');

    /* ⭐⭐ El CANARIO tiene que estar, y es lo que hace legible la segunda toma: suma las DOS
     * etapas sobre la misma solapa, así que el cambio no lo puede mover. Sin él, «se movió por el
     * cambio» y «se movió la fuente» se ven igual. */
    af(nombres.indexOf('u1_total_impresiones') !== -1,
      '⭐ y el canario `u1_total_impresiones` está en la lista');

    const seed = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
    /* Los `u1_*` se construyen por concatenación (`'u1_pre_' + p.tok + '_impresiones'`), así que se
     * verifican sus PIEZAS: que el seed arme esa familia con esas tres plataformas. */
    ['u1_pre_', 'u1_post_', 'u1_total_impresiones', 'u1_total_clics', 'u1_total_vistas']
      .forEach((p) => {
        af(seed.indexOf(p) !== -1, 'el seed construye `' + p + '…`');
      });
    af(seed.indexOf("{ tok: 'meta'") !== -1 && seed.indexOf("{ tok: 'google'") !== -1 &&
      seed.indexOf("{ tok: 'prog'") !== -1,
      'y con las tres plataformas meta/google/prog que el testigo nombra');
  }
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
console.log('   · CUÁNTO se mueve cada número. Eso lo dice `testigoDeEtapaPost()`, corriendo el');
console.log('     motor contra la base viva, dos veces y en la misma sesión.');
console.log('   · Si los valores nuevos son los CORRECTOS. Este banco afirma qué filas entran al');
console.log('     corte; que el número publicado sea el de la semana lo dice el deck del equipo.');
console.log('   · Nada sobre los decks YA publicados con el POST incompleto — 22 cuentas y seis');
console.log('     meses, medido aparte en `tools/medir-impacto-etapa-post.py`.');

process.exit(mal ? 1 : 0);
