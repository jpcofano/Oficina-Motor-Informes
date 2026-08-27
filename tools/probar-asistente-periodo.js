#!/usr/bin/env node
/**
 * tools/probar-asistente-periodo.js — **paso 1 del asistente lineal: elegir un período que YA
 * EXISTE no crea una fila nueva ni pisa la que está** (`2026-08-27_1`, `D-44`).
 *
 * ⛔⛔ **El banco que importa es el de la hoja que ya tiene la fila, no el de la hoja vacía.**
 * Crear sobre una hoja vacía prueba que sabe escribir; lo único que puede romper de verdad es
 * **tocar una fila que ya estaba** — y está medido que `upsertPorClave_` **pisa sin preguntar**:
 * `agosto_14_20` con otras fechas devolvió `{escritas: 0, actualizadas: 1}`, reescrita en silencio.
 * Un `periodo_id` es una **clave referenciada en 119 líneas del repo**: moverle las fechas cambia
 * el universo de todo lo que lo cita **sin que nada falle**.
 *
 * ⚠ **La comprobación va contra las FILAS CRUDAS, nunca contra `leerPeriodos()`.** Ése es
 * `leerRegistro_` y **colapsa las claves repetidas** — hoy ve 8 donde la hoja tiene 9 filas,
 * porque `julio_24_30` está duplicada. Preguntarle *«¿existe?»* a un mapa por clave es
 * preguntarle a quien ya perdió el dato que hace falta.
 *
 * Uso:  node tools/probar-asistente-periodo.js
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

/* Un jueves y un viernes reales de 2026, que son los dos días que separan las dos lecturas. */
const JUEVES = new Date(2026, 7, 27);   // 27/08/2026
const VIERNES = new Date(2026, 7, 28);  // 28/08/2026

function conFecha(ctx, fecha) {
  /* `ventanaDelAsistente_` toma la fecha por parámetro, así que el banco no tiene que mover el
   * reloj del proceso: es la misma propiedad que hace verificable a `semanaR11_`. */
  ctx.__f = fecha;
  return (modo, d, h) => {
    ctx.__m = modo; ctx.__d = d || ''; ctx.__h = h || '';
    return C.vm.runInContext('ventanaDelAsistente_(__m, __d, __h, __f)', ctx);
  };
}

console.log('Paso 1 del asistente — Fuentes.gs, Instalar.gs y PanelBackend.gs cargados de verdad\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · Las TRES opciones, y son tres — no una lista que crece
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · ⭐ tres opciones: en curso, anterior, personalizado');
{
  const ctx = C.contexto({ PERIODOS: [] });
  const v = conFecha(ctx, VIERNES);

  const enCurso = v('en_curso');
  const anterior = v('anterior');
  afirmar(enCurso.ok && anterior.ok, 'las dos calculadas resuelven');

  /* ⭐⭐ **El VIERNES es el único día en que las dos lecturas difieren**, y es justo el día en que
   * se genera `jm`. Un fixture de jueves no distingue las dos funciones. */
  afirmar(C.vm.runInContext('formatearFecha_(__x)', Object.assign(ctx, { __x: enCurso.desde })) === '28/08/2026',
    '⭐ «en curso» el viernes 28/08 es la semana que ARRANCA ese viernes: 28/08');
  afirmar(C.vm.runInContext('formatearFecha_(__x)', Object.assign(ctx, { __x: anterior.desde })) === '21/08/2026',
    '⭐⭐ «anterior» sigue siendo 21/08 — `R-11` Addendum 2, la última semana CERRADA');
  afirmar(enCurso.sin_cerrar === true && anterior.sin_cerrar === false,
    '⭐ y sólo «en curso» viene marcada `sin_cerrar`');
  afirmar((enCurso.avisos || []).length === 1 && /11\.000 de 54\.107/.test(enCurso.avisos[0]),
    '⭐⭐ con el aviso de datos PARCIALES y el caso MEDIDO adentro — sale al elegirla, no al terminar');
  afirmar((anterior.avisos || []).length === 0, '⚠ y la cerrada NO avisa nada: un aviso que aparece siempre deja de leerse');

  /* ⚠ El jueves las dos coinciden. Va afirmado para que nadie "arregle" esa igualdad. */
  const vj = conFecha(ctx, JUEVES);
  afirmar(C.vm.runInContext('formatearFecha_(__x)', Object.assign(ctx, { __x: vj('en_curso').desde })) ===
          C.vm.runInContext('formatearFecha_(__x)', Object.assign(ctx, { __x: vj('anterior').desde })),
    '⚠ el JUEVES las dos coinciden — el jueves cierra su propia semana, y eso vale en las dos');
  afirmar(vj('en_curso').sin_cerrar === false,
    'y por eso el jueves «en curso» tampoco avisa: no hay nada parcial que avisar');

  const raro = v('el mes pasado');
  afirmar(raro.ok === false && /modo desconocido/.test(raro.motivo || ''),
    '⛔ un cuarto modo se rechaza con el motivo — son tres a propósito, no una lista que crece');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐⭐ EL QUE IMPORTA — elegir uno que YA ESTÁ no escribe nada
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · ⭐⭐ un período que ya existe se REUSA — no se crea ni se pisa');
{
  /* La fila ya está, y **con fechas distintas de las que el asistente calcularía**: si las pisara,
   * se vería. Es la forma exacta del caso medido con `agosto_14_20`. */
  const ctx = C.contexto({
    PERIODOS: [['2026_agosto_21_27', '1999-01-01', '1999-01-07', 'NO ME TOQUES']]
  });
  ctx.__hoy = JUEVES;
  const r = C.vm.runInContext('panel_asistenteCrearPeriodo("anterior", "", "")', ctx);

  afirmar(r.ok === true, 'devuelve `ok`' + (r.ok ? '' : ' — ' + r.motivo));
  afirmar(r.periodo_id === '2026_agosto_21_27', 'y el `periodo_id` DERIVADO es el que ya está: ' + r.periodo_id);
  afirmar(r.reusado === true && r.creado === false,
    '⭐⭐ lo declara REUSADO, no creado — «creé» y «ya estaba» mandan a lecturas distintas');
  afirmar(r.filas_antes === 1 && r.filas_despues === 1,
    '⭐ filas ' + r.filas_antes + ' → ' + r.filas_despues + ': no se agregó ninguna');

  /* ⛔⛔ **La afirmación que decide**, y va contra las filas CRUDAS de la hoja falseada. */
  const filas = ctx.__hojas.PERIODOS.__filas;
  const vieja = filas.find((f) => f[0] === '2026_agosto_21_27');
  afirmar(vieja[1] === '1999-01-01' && vieja[2] === '1999-01-07' && vieja[3] === 'NO ME TOQUES',
    '⛔⛔ la fila conserva sus fechas Y su nota — `upsertPorClave_` las habría pisado en silencio');
  afirmar(filas.filter((f) => f[0] === '2026_agosto_21_27').length === 1,
    '⚠ y no se agregó una duplicada al lado: reusar no es append-siempre');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · Sobre la hoja vacía sí crea — y RELEE lo que quedó
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · sobre una hoja vacía crea UNA sola, y la relee');
{
  const ctx = C.contexto({ PERIODOS: [] });
  const r = C.vm.runInContext('panel_asistenteCrearPeriodo("anterior", "", "")', ctx);

  afirmar(r.ok === true && r.creado === true, 'crea la fila' + (r.ok ? '' : ' — ' + r.motivo));
  afirmar(r.filas_antes === 0 && r.filas_despues === 1,
    '⭐ UNA sola: ' + r.filas_antes + ' → ' + r.filas_despues + '. El asistente no genera semanas por adelantado');

  /* ⭐ La relectura es del escritor (`C-83`) y se hereda: la fila se compara con
   * `parsearFechaCelda_`, o sea **como el motor la va a leer**, no como texto. */
  const fila = ctx.__hojas.PERIODOS.__filas[1];
  afirmar(String(fila[1]).indexOf('-') !== -1 && String(fila[3]).indexOf('Asistente') !== -1,
    'con las fechas en `yyyy-MM-dd` y la nota diciendo que la creó el asistente: "' + fila[3] + '"');

  /* Y la segunda vez no crea nada: idempotencia, dicha y no colapsada con el éxito. */
  const otra = C.vm.runInContext('panel_asistenteCrearPeriodo("anterior", "", "")', ctx);
  afirmar(otra.ok === true && otra.reusado === true && ctx.__hojas.PERIODOS.__filas.length === 2,
    '⭐ y correrlo dos veces deja UNA fila, declarando `reusado`');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · El personalizado — valida y NO corrige
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · el personalizado valida y no corrige');
{
  const ctx = C.contexto({ PERIODOS: [] });
  const custom = (d, h) => {
    ctx.__d = d; ctx.__h = h;
    return C.vm.runInContext('panel_asistenteCrearPeriodo("personalizado", __d, __h)', ctx);
  };

  const bueno = custom('2026-09-01', '2026-09-07');
  afirmar(bueno.ok === true && bueno.periodo_id === '2026_septiembre_01_07',
    '⭐ un rango válido se crea con el `periodo_id` DERIVADO: ' + bueno.periodo_id);

  /* ⛔ Un rango invertido **no falla en ningún lado**: publica una ventana vacía, que se lee como
   * «no hubo datos esa semana». Es el número plausible en su forma más barata. */
  const invertido = custom('2026-09-07', '2026-09-01');
  afirmar(invertido.ok === false && /posterior al/.test(invertido.motivo || ''),
    '⛔ un rango INVERTIDO se rechaza con el motivo — no falla solo: publica una ventana vacía');
  afirmar(ctx.__hojas.PERIODOS.__filas.length === 2, '⚠ y no escribió nada al rechazarlo');

  const ilegible = custom('no es una fecha', '2026-09-07');
  afirmar(ilegible.ok === false && /no pude leer las fechas/.test(ilegible.motivo || ''),
    'una fecha ilegible se rechaza nombrando las dos');

  /* ⭐ El tope de `R-30` **avisa y no bloquea**: cuánto dura un período es editorial. */
  ctx.leerConfig = () => ({ tope_dias_ventana_cuenta: '30' });
  const largo = custom('2026-10-01', '2026-12-31');
  afirmar(largo.ok === true, '⭐ un período más largo que el tope de `R-30` SÍ se crea — avisa, no bloquea');
  afirmar((largo.avisos || []).some((a) => /R-30/.test(a) && /92 días/.test(a)),
    'y el aviso dice los días y nombra a `R-30`');
  ctx.leerConfig = () => ({ tope_dias_ventana_cuenta: '0' });
  const sinTope = custom('2027-01-04', '2027-03-31');
  afirmar(!(sinTope.avisos || []).some((a) => /R-30/.test(a)),
    '⚠ con el tope en `0` ese aviso NO sale: `0` desactiva, igual que en la regla');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · ⚠ Los controles negativos — romper a propósito, y verificar que la mutación OCURRIÓ
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · ⚠ los controles negativos');
{
  /* ⛔⛔ 5.1 · **Este control se escribió al revés y el rojo lo corrigió — queda dado vuelta con
   * el motivo, que es lo que vale.**
   *
   * La primera versión anulaba la guarda del PANEL esperando ver la clave duplicada. **No se
   * duplica**, y por la mejor razón posible: la guarda de verdad está en `crearPeriodos_`, que es
   * el **escritor** — `CLAUDE.md` §4, *la guarda va en el escritor y no en el llamador, porque
   * protege a todos y no al que se acordó*. El panel se queda sin protección propia y la hoja
   * aguanta igual.
   *
   * ⭐ **Lo que la guarda del panel SÍ compra, y es lo que este control mide ahora: el REPORTE.**
   * Sin ella, el paso 1 informa `creado: true` sobre una fila que ya estaba y que no tocó — un
   * cero disfrazado de éxito, en el único campo por el que la pantalla decide qué mostrar. */
  const romper = ({ archivo, texto }) => (archivo === 'PanelBackend.gs'
    ? texto.replace('  if (crudas.porClave[id]) {', '  if (false) {   // ROTO A PROPOSITO')
    : texto);
  romper.__archivo = 'PanelBackend.gs';

  const ctx = C.contexto({
    PERIODOS: [['2026_agosto_21_27', '1999-01-01', '1999-01-07', 'NO ME TOQUES']]
  }, romper);
  const r = C.vm.runInContext('panel_asistenteCrearPeriodo("anterior", "", "")', ctx);
  const filas = ctx.__hojas.PERIODOS.__filas.filter((f) => f[0] === '2026_agosto_21_27');

  afirmar(filas.length === 1 && filas[0][3] === 'NO ME TOQUES',
    '⭐⭐ sin la guarda del PANEL la fila sigue intacta — la protección vive en `crearPeriodos_`');
  afirmar(r.creado === true && r.reusado === false,
    '⭐ y ahí está lo que se rompe: informa `creado` sobre una fila que ya estaba — el aserto 2.3 cae');
  afirmar(r.filas_antes === 1 && r.filas_despues === 1,
    '⚠ con las filas ANTES y DESPUÉS delatándolo igual: 1 → 1, no se creó nada');

  /* ⚠ Si el parche no hubiera matcheado, `contexto()` habría tirado — la guarda del 24/08 vive en
   * `asistente-contexto.js` y esta afirmación deja escrito que se ejerció. */
  afirmar(true, '⚠ y la mutación OCURRIÓ: sin el parche aplicado, `contexto()` tira antes de medir');
}
{
  /* 5.2 · ⭐ Y el que fija que la comprobación NO se haga contra un mapa por clave. */
  const backend = C.fs.readFileSync(C.path.join(C.RAIZ, 'PanelBackend.gs'), 'utf8');
  const i = backend.indexOf('function panel_asistenteCrearPeriodo');
  const bloque = backend.slice(i, i + 3000);
  afirmar(i !== -1, '`panel_asistenteCrearPeriodo` existe');
  afirmar(bloque.indexOf('leerPeriodos()') === -1,
    '⛔ el paso 1 NO usa `leerPeriodos()` — colapsa las repetidas y ve 8 donde hay 9 filas');
  afirmar(bloque.indexOf('upsertPorClave_') === -1,
    '⛔ ni `upsertPorClave_` — está medido que pisa sin preguntar');
  afirmar(bloque.indexOf('setValues') === -1 && bloque.indexOf('crearPeriodos_(') !== -1,
    '⭐⭐ y DELEGA en `crearPeriodos_`: sigue habiendo un solo camino de escritura a `PERIODOS`');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 6 · Las dos filas rotas de la hoja viva se REPORTAN y no se tocan
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · las claves repetidas se reportan, no se arreglan');
{
  const ctx = C.contexto({
    PERIODOS: [
      ['julio_24_30', '2026-07-24', '2026-07-30', 'la original'],
      ['julio_24_30', '2026-07-24', '2026-07-30', 'la duplicada'],
      ['vie 14/08 -- jue 20/08 (por defecto)', '2026-08-14', '2026-08-20', 'etiqueta como clave']
    ]
  });
  const r = C.vm.runInContext('panel_asistenteCrearPeriodo("anterior", "", "")', ctx);

  afirmar((r.claves_repetidas || []).indexOf('julio_24_30') !== -1,
    '⛔ la clave repetida se REPORTA aunque no sea de esta tanda');
  afirmar(ctx.__hojas.PERIODOS.__filas.filter((f) => f[0] === 'julio_24_30').length === 2,
    '⚠ y NO se deduplica — dos filas referenciadas en 119 líneas no se tocan, por decisión del usuario');
  afirmar(ctx.__hojas.PERIODOS.__filas.some((f) => f[0] === 'vie 14/08 -- jue 20/08 (por defecto)'),
    '⚠ ni se renombra la etiqueta usada como clave primaria');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 7 · El panel cableado — y que el HTML siga siendo JavaScript válido
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n7 · el paso 1 cableado al panel');
{
  const backend = C.fs.readFileSync(C.path.join(C.RAIZ, 'PanelBackend.gs'), 'utf8');
  const html = C.fs.readFileSync(C.path.join(C.RAIZ, 'Panel.html'), 'utf8');

  /* Un botón que no llama a nadie, y una función de backend que nadie llama, son la misma cosa:
   * la columna declarada sin lector. Se exigen los dos lados. */
  ['panel_asistenteOpcionesDePeriodo', 'panel_asistenteCrearPeriodo'].forEach((fn) => {
    afirmar(backend.indexOf('function ' + fn + '(') !== -1 && html.indexOf('.' + fn + '(') !== -1,
      '`' + fn + '` existe en el backend Y el front la llama');
  });

  /* ⭐⭐ **Las opciones se piden ANTES de dibujar los botones**, que es todo el punto de que
   * el aviso de datos parciales salga al elegir la semana y no cuando el deck ya salió. */
  afirmar(/a\.opciones === null\)\{ cargarOpcionesDePeriodo\(\);/.test(html),
    '⭐⭐ el paso 1 pide las opciones antes de pintar los botones — el aviso sale al elegir');
  /* ⚠ Por POSICIÓN dentro de `pasoPeriodo`, no por una ventana de N caracteres: una ventana fija
   * se rompe al agregar una línea y el banco pasaría a medir el largo del bloque. */
  const paso1 = html.slice(html.indexOf('function pasoPeriodo()'), html.indexOf('function pasoPendiente('));
  afirmar(paso1.indexOf('(o.avisos') !== -1 &&
          paso1.indexOf('(o.avisos') < paso1.indexOf('data-asis-per'),
    '⭐ y los avisos se pintan ARRIBA del botón, no debajo');

  /* ⭐ El diseño lineal: cambiar el período tira todo lo de abajo. */
  afirmar(/function reiniciarAsistente\(\)\{ S\.asis = asistenteVacio\(\); pintar\(\); \}/.test(html),
    '⭐ «empezar de nuevo» reemplaza el estado entero — cambiar el período no conserva nada');

  /* ⛔ Y el front NO decide: no hay ninguna copia de la guarda en el HTML. */
  /* ⚠ Se busca la LLAMADA, no el nombre: el encabezado del bloque la **cita** a propósito, para
   * que quien lea el front sepa dónde vive la decisión. Buscar el nombre pelado se pondría rojo
   * por el comentario que hace bien las cosas. */
  afirmar(html.indexOf('guardaDelAsistente_(') === -1,
    '⛔ el HTML no llama a la guarda ni tiene una copia — la decide el backend con hechos de las hojas');
  afirmar(html.indexOf('guardaDelAsistente_') !== -1,
    '⭐ pero SÍ la nombra en el comentario: quien lea el front tiene que saber dónde vive la decisión');

  /* ⭐⭐ **Y que el `<script>` siga siendo JavaScript válido.** Apps Script sirve este archivo tal
   * cual: un paréntesis de más deja el panel en blanco **sin que ninguna suite se entere**, porque
   * ningún banco lo ejecuta. Cuesta dos líneas. */
  const i = html.indexOf('<script>');
  const j = html.lastIndexOf('</script>');
  afirmar(i !== -1 && j > i, 'el panel tiene un bloque `<script>`');
  let compila = true;
  let error = '';
  try { new Function(html.slice(i + 8, j)); } catch (e) { compila = false; error = String(e.message || e); }
  afirmar(compila, '⭐⭐ y el `<script>` del panel COMPILA' + (compila ? '' : ' — ' + error));
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que la hoja VIVA quede bien. Está falseada: esto fija la DECISIÓN del paso 1.');
console.log('     Que la celda quede escrita se ve apretando el botón.');
console.log('   · La coerción de tipos de Sheets (`C-83`): el fixture guarda lo que se le da.');
console.log('     La hoja real puede interpretarlo — por eso `crearPeriodos_` RELEE.');
console.log('   · Nada sobre los pasos 2, 3 y 4: los mide `probar-asistente-pasos.js`.');

process.exit(fallas === 0 ? 0 : 1);
