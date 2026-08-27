#!/usr/bin/env node
/**
 * tools/probar-asistente-temario.js — **paso 2: un temario con una línea imparseable llega al
 * paso 3 con esa línea marcada** (`2026-08-27_1`, `D-44`).
 *
 * ⛔⛔ **El hueco estaba en el PARTIDOR, no en el cargador — y se midió antes de tocar nada.**
 * `partirTemarioEnBloques_` decide que una línea sin `>`, sin numeración `N)` y sin `|`, de menos
 * de 60 caracteres, **es un encabezado de bloque**. Una línea de temario mal tipeada cumple las
 * tres, así que se convierte en el `titulo` de un bloque vacío **y desaparece de todos los
 * `lineas`**: nunca llega a `cargarTemarioReuniones_`, nunca recibe su fila con
 * `notas = 'no se pudo parsear'`, y el paso 3 no la puede mostrar.
 *
 * ⭐ **Es `CLAUDE.md` §4 literal:** *la función que estás leyendo no es el camino completo; el
 * filtro que te falta suele estar en quien le pasa los datos.* El cargador hacía lo correcto.
 *
 * ⭐⭐ **Y el control negativo es el que importa: si TODAS las líneas parsean, el banco no probó
 * nada.** Un temario limpio satisface *«se cargó todo»* y *«el marcado no funciona»* por igual.
 *
 * Uso:  node tools/probar-asistente-temario.js
 */
'use strict';

const C = require('./asistente-contexto.js');

let fallas = 0;
let hechas = 0;
function afirmar(condicion, mensaje) {
  hechas++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const PERIODO = '2026_agosto_21_27';

/** Un contexto con el período ya creado y el catálogo de campañas falseado. */
function armar(parchear) {
  const ctx = C.contexto({
    PERIODOS: [[PERIODO, '2026-08-21', '2026-08-27', '']],
    REUNIONES: [],
    CAMPANAS: []
  }, parchear);
  /* ⚠ `catalogoDeCampanas_` lee la base `digital` por `openById`. Se falsea porque lo que este
   * banco mide es el RUTEO del pegado único, no la resolución nombre → `ID Cuentas`, que tiene su
   * propio banco (`probar-campanas.js`). */
  ctx.catalogoDeCampanas_ = () => ({
    ok: true,
    lista: [{ id: '3488-AGOJDGAG', nombre: 'Egreso más de 1000 Cadetes', alterno: '',
      desde: '2026-08-01', hasta: '2026-08-30' }]
  });
  return ctx;
}

function cargar(ctx, texto) {
  ctx.__t = texto;
  return C.vm.runInContext('panel_asistenteCargarTemario("' + PERIODO + '", __t, "jm")', ctx);
}

/* El temario real: reuniones, una línea rota en el medio, el título y las campañas. */
const CON_ROTA = [
  '1) JM | Uno a uno en Retiro 24/07',
  '2) JM | Encuentro Temático: Salud 25/07',
  'esto no parsea',
  '> Campañas destacadas',
  '1) Egreso de cadetes'
].join('\n');

/* El mismo, sin la línea rota. ⭐ Es el par que distingue las dos afirmaciones. */
const LIMPIO = [
  '1) JM | Uno a uno en Retiro 24/07',
  '2) JM | Encuentro Temático: Salud 25/07',
  '> Campañas destacadas',
  '1) Egreso de cadetes'
].join('\n');

console.log('Paso 2 del asistente — el pegado único, con los dos cargadores reales\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · ⛔⛔ Lo que le faltaba al partidor, MEDIDO — la línea rota se perdía
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · ⛔⛔ el partidor se comía la línea rota, y ahora la devuelve');
{
  const ctx = armar();
  ctx.__t = CON_ROTA;

  /* La medición que fundó el paso: el partidor de siempre la convierte en TÍTULO de un bloque
   * vacío. Va afirmado para que se vea por qué hizo falta el ruteador, y no como reproche. */
  const bloques = C.vm.runInContext('partirTemarioEnBloques_(__t)', ctx);
  const comida = bloques.filter((b) => b.titulo === 'esto no parsea')[0];
  afirmar(!!comida && comida.lineas.length === 0,
    '⛔⛔ `partirTemarioEnBloques_` la toma como TÍTULO de un bloque vacío — así se perdía');
  afirmar(bloques.every((b) => b.lineas.indexOf('esto no parsea') === -1),
    '   y no aparece en las `lineas` de ningún bloque: desaparecía del todo');

  /* ⭐ Y el ruteador la devuelve a la lista, en su lugar. */
  const partido = C.vm.runInContext('partirTemarioDelAsistente_(__t)', ctx);
  const lineas = partido.reuniones_texto.split('\n');
  afirmar(lineas.indexOf('esto no parsea') === 2,
    '⭐ `partirTemarioDelAsistente_` la devuelve, y EN SU LUGAR — tercera línea, como en el pegado');
  afirmar(lineas.length === 3 && lineas.indexOf('1) Egreso de cadetes') === -1,
    '⭐ y las campañas NO entran al texto de reuniones: 3 líneas, sin la del bloque de campañas');
  afirmar(partido.campanas_texto === CON_ROTA,
    '⚠ a campañas se le pasa el texto ENTERO: su cargador busca su propio bloque, y un recorte ' +
    'armado acá sería una segunda forma de decidir cuál es');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐⭐ EL QUE IMPORTA — la línea rota llega al paso 3 marcada
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · ⭐⭐ la línea rota llega al paso 3, con nombre y con motivo');
{
  const ctx = armar();
  const r = cargar(ctx, CON_ROTA);

  afirmar(r.ok === true, 'el paso 2 carga' + (r.ok ? '' : ' — ' + r.motivo));
  afirmar(r.reuniones.agregadas === 3, '⭐ las 3 líneas de reuniones entran, la rota INCLUIDA');
  afirmar(r.reuniones.sinParsear === 1, 'y una queda contada como sin parsear');

  /* ⭐⭐ **Con NOMBRE, no con un conteo.** «1 sin parsear» no deja saber cuál, y el paso 3 tiene
   * que poder señalarla: un temario que carga 4 de 5 y no lo dice publica un informe al que le
   * falta un encuentro. */
  const detalle = r.reuniones.sinParsearDetalle || [];
  afirmar(detalle.length === 1 && detalle[0].texto === 'esto no parsea',
    '⭐⭐ y viaja CON NOMBRE: "' + (detalle[0] || {}).texto + '" — no sólo el conteo');
  afirmar(/no se pudo parsear/.test((detalle[0] || {}).motivo || ''),
    '   con el motivo dicho: "' + (detalle[0] || {}).motivo + '"');

  /* Y la fila quedó en la hoja con su nota — que es lo que el paso 3 va a leer. */
  const filas = ctx.__hojas.REUNIONES.__filas;
  const fila = filas.filter((f) => f[8] === 'esto no parsea')[0];
  afirmar(!!fila && fila[9] === 'no se pudo parsear',
    '⭐ y la fila está en `REUNIONES` con `notas = "no se pudo parsear"`');
  afirmar(!!fila && String(fila[7]) === '',
    '⚠ con `mostrar` VACÍO, como todas: la persona confirma cuáles entran (paso 3)');

  /* Las campañas fueron por su cargador, no por el de reuniones. */
  afirmar(r.hay_campanas === true && (r.campanas.escritas || []).length === 1,
    '⭐ la campaña entró por `cargarTemarioCampanas_`: 1 escrita');
  afirmar(ctx.__hojas.CAMPANAS.__filas.length === 2,
    '   y en `CAMPANAS`, no en `REUNIONES`');
  afirmar(filas.filter((f) => String(f[8]).indexOf('Egreso') !== -1).length === 0,
    '⛔ ninguna línea de campañas se coló a `REUNIONES` — sin el ruteo, el pegado único las duplicaba');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⭐⭐ EL CONTROL NEGATIVO — si todas parsean, el banco no probó nada
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · ⭐⭐ el control negativo: con el temario LIMPIO no hay nada marcado');
{
  /* ⭐ Sin este par, «se cargó todo» y «el marcado no funciona» se ven idénticos: el dato limpio
   * satisface las dos afirmaciones por igual. Es `Pruebas.gs:456` otra vez. */
  const ctx = armar();
  const r = cargar(ctx, LIMPIO);

  afirmar(r.ok === true && r.reuniones.agregadas === 2,
    'el temario limpio carga sus 2 reuniones' + (r.ok ? '' : ' — ' + r.motivo));
  afirmar(r.reuniones.sinParsear === 0 && (r.reuniones.sinParsearDetalle || []).length === 0,
    '⭐⭐ y NADA queda marcado — el caso 2 mide el marcado, no el conteo de filas');
  afirmar(ctx.__hojas.REUNIONES.__filas.filter((f) => f[9] === 'no se pudo parsear').length === 0,
    '   ninguna fila con la nota: la marca aparece sólo cuando hay algo que marcar');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Sin el bloque de campañas — no es un error, y se DICE
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · un temario sin campañas carga igual, y lo dice');
{
  const ctx = armar();
  const r = cargar(ctx, '1) JM | Uno a uno en Retiro 24/07');

  afirmar(r.ok === true && r.reuniones.agregadas === 1, 'carga la reunión sola');
  afirmar(r.hay_campanas === false && r.campanas === null, 'y no inventa ninguna campaña');
  /* ⚠ Sin distinguir mayúsculas: `BLOQUE_CAMPANAS_` es `'campañas destacadas'` en minúscula —el
   * comparador normaliza los dos lados—, así que exigir la capital mediría la grafía de una
   * constante y no que el aviso salga. */
  afirmar((r.avisos || []).some((a) => /campañas destacadas/i.test(a)),
    '⭐ pero lo DICE, con los bloques leídos: un título mal escrito produce el mismo silencio que ' +
    'la ausencia');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · La guarda del paso 2 — no se carga sobre un período que no existe
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · ⛔ la guarda del paso 2');
{
  const ctx = armar();
  ctx.__t = CON_ROTA;
  const fantasma = C.vm.runInContext('panel_asistenteCargarTemario("no_existe", __t, "jm")', ctx);
  afirmar(fantasma.ok === false && fantasma.falta === 'periodo',
    '⛔ un `periodo_id` que no está en `PERIODOS` se rechaza — el motor no crea períodos al pasar');
  afirmar(ctx.__hojas.REUNIONES.__filas.length === 1,
    '⚠ y NO escribió nada: la hoja sigue con el encabezado solo');

  const vacio = C.vm.runInContext('panel_asistenteCargarTemario("' + PERIODO + '", "  ", "jm")', ctx);
  afirmar(vacio.ok === false && /caja está vacía/.test(vacio.motivo || ''),
    'una caja vacía se rechaza con el motivo');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 6 · ⚠ El control negativo del ruteo — sin devolver el título comido, la línea se pierde
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · ⚠ el control negativo del ruteo');
{
  const romper = function (x) {
    return x.archivo === 'PanelBackend.gs'
      ? x.texto.replace(
        "    if (!b.con_marca && b.titulo !== '(sin encabezado)') lineas.push(b.titulo);",
        '    if (false) { }   // ROTO A PROPOSITO')
      : x.texto;
  };
  romper.__archivo = 'PanelBackend.gs';

  const ctx = armar(romper);
  const r = cargar(ctx, CON_ROTA);

  afirmar(r.reuniones.agregadas === 2 && r.reuniones.sinParsear === 0,
    '⭐ sin devolver el título comido, la línea rota DESAPARECE: 2 agregadas y cero marcadas');
  afirmar(ctx.__hojas.REUNIONES.__filas.filter((f) => f[8] === 'esto no parsea').length === 0,
    '⛔⛔ y no queda ninguna fila con ella — los asertos 2.4 y 2.6 caen, y por el motivo correcto');
  /* ⚠ Si el parche no hubiera matcheado, `contexto()` habría tirado antes de medir. */
  afirmar(true, '⚠ y la mutación OCURRIÓ: sin el parche aplicado, `contexto()` tira antes de medir');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 7 · El panel cableado, y un solo camino de escritura
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n7 · el paso 2 cableado, y sin un segundo escritor');
{
  const backend = C.fs.readFileSync(C.path.join(C.RAIZ, 'PanelBackend.gs'), 'utf8');
  const html = C.fs.readFileSync(C.path.join(C.RAIZ, 'Panel.html'), 'utf8');

  afirmar(backend.indexOf('function panel_asistenteCargarTemario(') !== -1 &&
          html.indexOf('.panel_asistenteCargarTemario(') !== -1,
    '`panel_asistenteCargarTemario` existe en el backend Y el front la llama');

  const i = backend.indexOf('function partirTemarioDelAsistente_');
  const bloque = backend.slice(i, backend.indexOf('function panel_asistenteCrearPeriodo'));
  afirmar(bloque.indexOf('setValues') === -1 && bloque.indexOf('appendRow') === -1,
    '⛔⛔ el paso 2 NO escribe por su cuenta: rutea hacia los dos cargadores declarados');
  afirmar(bloque.indexOf('cargarTemarioReuniones_(') !== -1 &&
          bloque.indexOf('cargarTemarioCampanas_(') !== -1,
    '⭐ y llama a los dos por nombre — no hay un segundo camino de escritura');
  afirmar(bloque.indexOf('BLOQUE_CAMPANAS_') !== -1,
    '⭐ el título del bloque sale de `BLOQUE_CAMPANAS_`, no de un literal nuevo');
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · La resolución nombre → `ID Cuentas` de una campaña: `catalogoDeCampanas_` está');
console.log('     falseado acá y tiene su banco propio (`probar-campanas.js`).');
console.log('   · ⚠ Un encabezado LEGÍTIMO sin `>` —`DGAYD`— también vuelve a la lista y produce');
console.log('     una fila «no se pudo parsear». Se eligió a sabiendas: una fila de más se ve en');
console.log('     el paso 3 y se destilda; una línea perdida en silencio no se ve nunca.');
console.log('   · Que la hoja VIVA quede bien: está falseada. Eso lo dice una corrida.');

process.exit(fallas === 0 ? 0 : 1);
