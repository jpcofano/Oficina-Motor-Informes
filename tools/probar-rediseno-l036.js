/**
 * `2026-08-25` — `L-036` POR REUNIÓN: la parte estructural, y el anclaje del sufijo `GC`.
 *
 * ⛔ **Este banco se dio vuelta el mismo día que se escribió**, y el vaivén queda porque el motivo
 * sirve: por unas horas `L-036` se diseñó **por plataforma** —el `Formato` difiere por plataforma,
 * el deck del equipo publica el POST desglosado, y los cuatro bloques de `Agenda JM | Post` son
 * TOTAL·Meta·Google·Programmatic—. **Decisión del usuario: no.** Ese desglose es del «1 a 1»
 * (`L-053`); `L-036` es **una fila por reunión, con el TOTAL de esa reunión**.
 *
 * ⭐ **Y lo medido en el medio no se descartó: encaja.** `col12` **es el TOTAL** —41.204 para
 * Retiro, al dígito contra la suma de sus filas POST— y los otros tres bloques son las plataformas,
 * que esta lámina no usa.
 *
 * Corre con: `node tools/probar-rediseno-l036.js`
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

let ok = 0;
let mal = 0;

function af(cond, texto, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + texto); }
  else { mal++; console.log('  ❌ ' + texto + (detalle ? ' — ' + detalle : '')); }
}

const instalar = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const union = fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8');

console.log('L-036 por reunión — estructura, y el anclaje de la cuenta con sufijo GC\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · La sección vuelve a `agregado` con cuatro ranuras
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · `comunicaciones_post`: cuatro ranuras, una por encuentro');
{
  const desde = instalar.indexOf("filaSeccion_({ id: 'comunicaciones_post'");
  af(desde !== -1, 'la fila del seed existe');
  const fila = instalar.slice(desde, instalar.indexOf('\n', desde));

  af(fila.indexOf("itemsPorLamina: '4'") !== -1,
    '⭐ `itemsPorLamina` es 4 — cuatro ranuras para cuatro encuentros',
    (fila.match(/itemsPorLamina: '\d+'/) || ['(no está)'])[0]);
  af(fila.indexOf("filtro: 'etapa=post'") !== -1 && fila.indexOf("itera: 'REUNIONES'") !== -1,
    'itera `REUNIONES` con `filtro: etapa=post`');
}

console.log('\n1b · y `declararModoDelAgregadoPost()` volvió a estar operativo');
{
  const desde = instalar.indexOf('function declararModoDelAgregadoPost()');
  af(desde !== -1, 'la función existe');
  const cuerpo = instalar.slice(desde, instalar.indexOf('\n}', desde));

  /* ⭐ Estuvo frenado unas horas del mismo día. La afirmación fija que el freno se sacó **de
   * verdad** y no sólo del comentario: `curarSecciones_` tiene que ser lo primero que corre. */
  af(cuerpo.indexOf('frenado: true') === -1, 'ya no devuelve `frenado`');
  const iCurar = cuerpo.indexOf('curarSecciones_');
  const iReturnTemprano = cuerpo.indexOf('return {');
  af(iCurar !== -1 && (iReturnTemprano === -1 || iCurar < iReturnTemprano),
    '⭐ y `curarSecciones_` corre ANTES de cualquier `return` — el freno se sacó, no se comentó');
  af(cuerpo.indexOf("modo: 'agregado'") !== -1, 'y pone la sección en `agregado`');

  /* ⚠ El aviso de las tres ranuras que sí se llenan tiene que estar: `julio_24_30` tiene TRES
   * encuentros con métricas POST, no cuatro. Sin decirlo, la cuarta en `sin_datos` se lee como bug. */
  const bloque = instalar.slice(Math.max(0, desde - 2200), desde);
  af(bloque.indexOf('TRES') !== -1 && bloque.toLowerCase().indexOf('sin_datos') !== -1,
    '⚠ y su comentario avisa que la cuarta ranura puede salir `sin_datos`, que es correcto');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐ El anclaje NO discrimina por el sufijo de la cuenta
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · el sufijo `GC` no participa de ninguna comparación del anclaje');
{
  /* ⭐⭐ La pregunta del usuario, y hay que separarla del `X-28` porque **se parecen y no son lo
   * mismo**: allá el problema NO era el anclaje sino un filtro **por nombre de campaña** (`~=JM`)
   * para decidir qué cuentas entran al Call Center, y `3488-AGOJDGAG` no dice «JM» en su nombre.
   * Acá el anclaje matchea por **nombre parseado** —tipo, barrio/comuna/eje, fecha— y el id sólo se
   * usa como clave. */
  const desde = union.indexOf('function normalizarIdCuenta_');
  const cuerpo = union.slice(desde, union.indexOf('\n}', desde));
  af(cuerpo.indexOf('trim()') !== -1, '`normalizarIdCuenta_` sólo hace `trim()`');
  af(!/JDGAG|JDGGC|slice|substring|replace\(/.test(cuerpo),
    '⭐ y NO corta, reemplaza ni compara sufijos — el id viaja entero');

  /* Los candidatos salen de TODOS los ids de la solapa maestra, sin filtrar por nombre. */
  const iCand = union.indexOf('var candidatosTodos = Object.keys(digitalUnido.porCuenta)');
  af(iCand !== -1,
    '⭐ los candidatos son TODOS los ids de la solapa maestra — no hay filtro previo por nombre');
  const bloqueCand = union.slice(iCand, iCand + 420);
  af(!/JDG|filter\(/.test(bloqueCand),
    'y ese armado no filtra: `Object.keys(...).map(...)`, sin `filter`');
}

console.log('\n2b · y el parser REAL reconoce las cinco cuentas de julio, GC incluida');
{
  /* ⭐ Se ejecuta `parsearNombreCampana_` de `Parseo.gs`, no se razona sobre él. Los nombres están
   * COPIADOS de la solapa `Seguimiento digital` del fixture del 20/08 (sha `f8ef3227…`). */
  const ctx = { console, Math, JSON, String, Number, Object, Array, Boolean, isNaN, RegExp, Error,
    Date, parseInt, parseFloat, Logger: { log: () => {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Parseo.gs'), 'utf8'), ctx, { filename: 'Parseo.gs' });
  ctx.__op = {
    catalogoBarrios: ['Retiro', 'San Cristóbal', 'Nueva Pompeya', 'Caballito'],
    anioDefecto: 2026
  };
  const parse = (n) => { ctx.__n = n; return vm.runInContext('parsearNombreCampana_(__n, __op)', ctx); };

  const casos = [
    ['3346-JULJDGAG', 'Agenda Post con 1 - 1 A 1 - Retiro - 24/7', 'Retiro'],
    ['3354-JULJDGAG', 'Agenda Post con 1 - 1 A 1 - San Cristobal - 23/7', 'San Cristóbal'],
    ['3389-JULJDGAG', 'Agenda Post 1 A 1 - Nueva Pompeya - 29/7', 'Nueva Pompeya'],
    ['3420-JULJDGGC', 'Agenda Post con 1 - 1 A 1 - Caballito 29/7', 'Caballito']
  ];
  casos.forEach(([id, nombre, barrio]) => {
    const r = parse(nombre);
    af(r.reconocido === true && r.barrio === barrio && r.es_post === true,
      id + ' → reconocido, barrio ' + barrio + ', post',
      JSON.stringify({ rec: r.reconocido, barrio: r.barrio, post: r.es_post }));
  });

  /* ⭐⭐ LA afirmación que contesta la pregunta: la cuenta con sufijo `GC` y SIN barrio en el
   * nombre igual se reconoce, porque `reconocido` acepta barrio **o comuna o EJE**. */
  const orden = parse('Agenda Post RDV Con 1 - Orden Publico Eje Norte 28/7');
  af(orden.reconocido === true,
    '⭐ `3387-JULJDGGC` (Orden Público) se reconoce IGUAL, con sufijo GC');
  af(orden.barrio === '' || orden.barrio === null || orden.barrio === undefined,
    '   …y NO por barrio: su nombre no trae ninguno', JSON.stringify(orden.barrio));
  af(!!orden.eje, '   sino por el EJE — «' + orden.eje + '»');
  af(orden.tipo === 'Temático',
    '   y su tipo coincide con el temario: «Encuentro Temático Orden Público 28/07»', orden.tipo);
  af(orden.fecha instanceof Date && orden.fecha.toISOString().slice(0, 10) === '2026-07-28',
    '   con la fecha correcta, 28/07');

  /* ⚠ El control negativo del reconocimiento: un nombre sin fecha NO se reconoce, pase lo que pase
   * con el resto. Sin esto, «reconocido siempre true» pasaría todas las afirmaciones de arriba. */
  af(parse('Agenda Post RDV Con 1 - Orden Publico Eje Norte').reconocido === false,
    '⭐ control negativo: sin fecha NO se reconoce — el `true` de arriba significa algo');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · La fuente de `L-036` es `Agenda JM | Post`, y el desglose es de `L-053`
 *
 * ⛔ **Este bloque decía «las dos fuentes» y estuvo mal unas horas.** El `ADDENDUM 2` de
 * `docs/FUENTE_post_reuniones_2026-08-25.md` lo retracta: `Agenda JM | Post` tiene **las cinco
 * columnas, con datos, una fila por reunión**. El desglose es su **origen**, no su reemplazo — y
 * *«de dónde salen»* no es *«dónde están cargados»*.
 *
 * ⭐ **Las afirmaciones no cambian, sólo el marco:** los `des_*` siguen mapeados porque **`L-053`
 * sí lee el desglose**, y `poblacion`/`alc_real` siguen sobre la solapa POST.
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · `Agenda JM | Post` es la fuente de L-036; el desglose es de L-053');
{
  /* Cada campo se busca UNO POR UNO — pertenencia, no un filtro por prefijo `des_`, que GENERA en
   * vez de CRUZAR (`CLAUDE.md` §4). */
  ['des_id_cuenta', 'des_campana', 'des_impresiones', 'des_visualizaciones',
    'des_fecha_inicio', 'des_fecha_fin', 'des_nomenclatura'].forEach((campo) => {
    af(instalar.indexOf("campo_logico: '" + campo + "'") !== -1, campo + ' está en `MAPEO`');
  });

  /* ⭐⭐ Y la afirmación que resume por qué la fuente nunca estuvo mal elegida: el desglose **no
   * tiene** Alcance ni Habitantes, en ningún nombre — medido sobre el fixture. Una lámina que las
   * necesita **no puede** salir de ahí. */
  af(instalar.indexOf("campo_logico: 'des_alcance'") === -1 &&
    instalar.indexOf("campo_logico: 'des_habitantes'") === -1,
    '⭐ el desglose NO tiene `Alcance` ni `Habitantes` — `L-036` no podría salir de ahí');
  af(instalar.indexOf("campo_logico: 'poblacion'") !== -1 &&
    instalar.indexOf("campo_logico: 'alc_real'") !== -1,
    '⭐ y `poblacion` / `alc_real` están sobre `Agenda JM | Post`, que es LA fuente de `L-036`');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · ⛔ Lo que NO se hizo — afirmado para que no se lea como olvido
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · el cableado de los marcadores sigue sin escribirse');
{
  /* ⚠ El grano ya no está en duda —`S-06` se cerró— pero los marcadores **todavía no se
   * reescribieron** contra el desglose: los 12 vigentes siguen apuntando a la derivada. Esta
   * afirmación se pone roja cuando alguien lo haga, y ahí hay que venir a actualizarla. */
  af(instalar.indexOf('MARCADORES_POST_L036_TODOS_') !== -1,
    'el cableado viejo y su reversión siguen en pie — no se retira lo que hay sin reemplazo');
  af(instalar.indexOf('cablearTablaPostPorPlataforma_') === -1,
    '⛔ y NO existe ningún cableado por plataforma — ese diseño se descartó');

  const sup = fs.readFileSync(path.join(RAIZ, 'docs/SUPUESTOS.md'), 'utf8');
  af(sup.indexOf('**S-06**') !== -1 && sup.indexOf('derogado') !== -1,
    '⭐ `S-06` está registrado y marcado derogado — no se borra la fila');
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Que el anclaje REALMENTE ancle `3387-JULJDGGC`. Se afirma que el sufijo no lo');
console.log('     excluye y que su nombre se reconoce; el SCORE contra el umbral lo dice la corrida.');
console.log('   · Que la hoja viva refleje `itemsPorLamina: 4` — `sembrarSecciones_` sólo agrega');
console.log('     filas ausentes. Hace falta `curarSecciones_`.');
console.log('   · Los marcadores contra el desglose: no se escribieron todavía.');

process.exit(mal ? 1 : 0);
