#!/usr/bin/env node
/**
 * tools/probar-confirmar-anclaje.js — **qué `elegido` acepta la pantalla de anclajes**
 * (`docs/Prompts/2026-08-21_16_anclajes_en_el_panel.md`, Parte B).
 *
 * ⭐ **Los cuatro asertos que pide el prompt, y el que más importa es el primero:** un `elegido`
 * que **no está entre los candidatos** se rechaza. Un valor que nadie puntuó hace que el motor
 * ancle contra algo que ningún score miró — **el modo de falla que `D-29` viene a cerrar,
 * entrando por la puerta nueva**. Una pantalla que escribe lo que le manden reabre el agujero
 * que la pantalla venía a tapar.
 *
 * ⚠ **Esto NO prueba que la escritura llegue a la hoja.** Fija la decisión —qué se acepta y qué
 * se rechaza—, que es la mitad pura. La otra mitad se ve corriendo el panel.
 *
 * Uso:
 *   node tools/probar-confirmar-anclaje.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/** El código de un `.gs` sin comentarios: los comentarios citan patrones para explicarlos. */
function codigoDe(archivo) {
  return fs.readFileSync(path.join(RAIZ, archivo), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
}

function contexto(parchear) {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    // ⛔ Si el parche no matchea, se dice — no se mide un verde falso.
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'PanelBackend.gs' });
  return ctx;
}

/* Una fila como la escribe `registrarAnclajePendiente_`: tres candidatos y sus puntajes.
 *
 * ⚠ **Los tres nombres son distintos entre sí y ninguno es prefijo de otro.** Un fixture con
 * `"Post Agenda"` y `"Post Agenda RDV"` pasaría con una comparación por `indexOf` **y** con una
 * por igualdad, así que no distinguiría las dos implementaciones. */
const FILA = {
  tipo: 'reunion', nombre_buscado: 'educacion|2026-06-16|',
  candidato_1: 'Post Agenda RDV Con 1 - Educacion Eje Oeste 16/6', puntaje_1: 0.54,
  candidato_2: 'AU Dellepiane: cambio de sentido calle Rio Negro', puntaje_2: 0.5,
  candidato_3: 'RDV Ministros con 5 - Comuna 15 16/6', puntaje_3: 0.5,
  elegido: ''
};

console.log('Qué `elegido` se acepta — código cargado de PanelBackend.gs\n');

console.log('1 · ⭐ los cuatro asertos del prompt');
{
  const ctx = contexto();
  const validar = (fila, v) => {
    ctx.__f = fila; ctx.__v = v;
    return vm.runInContext('validarEleccionAnclaje_(__f, __v)', ctx);
  };

  const fuera = validar(FILA, 'Una campaña que nadie puntuó');
  afirmar(fuera.ok === false && /no es ninguno de los candidatos/.test(fuera.motivo),
    'un `elegido` que NO está entre los candidatos se rechaza, con motivo');

  const dentro = validar(FILA, FILA.candidato_2);
  afirmar(dentro.ok === true && dentro.valor === FILA.candidato_2,
    'uno que SÍ está se acepta — y no sólo el primero: se probó con el segundo');

  const vacio = validar(FILA, '');
  afirmar(vacio.ok === true && vacio.valor === '',
    'vacío se acepta: desconfirmar tiene que ser posible o el panel deja de ser el camino');

  /* El cuarto —clave inexistente— no vive en la función pura sino en el escritor, así que se
   * afirma sobre el código: que exista el camino de fallo y que NO cree la fila. */
  const gs = codigoDe('PanelBackend.gs');
  afirmar(/No se inventa la fila/.test(gs) && /return \{\s*ok: false,\s*motivo: 'no hay ninguna fila/.test(gs),
    'una clave inexistente falla con motivo y NO inventa la fila');
}

console.log('\n2 · los bordes que el fixture de arriba no toca');
{
  const ctx = contexto();
  const validar = (fila, v) => {
    ctx.__f = fila; ctx.__v = v;
    return vm.runInContext('validarEleccionAnclaje_(__f, __v)', ctx);
  };

  afirmar(validar(FILA, '   ').ok === true && validar(FILA, '   ').valor === '',
    'sólo espacios cuenta como vacío — se normalizan los dos lados (`CLAUDE.md` §2)');
  afirmar(validar(FILA, '  ' + FILA.candidato_1 + ' ').valor === FILA.candidato_1,
    'y un candidato con espacios de más se acepta y se guarda limpio');

  // ⛔ Una fila con menos de tres candidatos: los `''` NO son elegibles.
  const corta = Object.assign({}, FILA, { candidato_2: '', candidato_3: '' });
  const conVacio = validar(corta, '');
  afirmar(conVacio.ok === true && conVacio.valor === '',
    'en una fila con un solo candidato, vacío sigue siendo desconfirmar');
  afirmar(validar(corta, corta.candidato_1).ok === true,
    'y su único candidato se acepta');

  /* ⚠ El caso que separa «filtro los vacíos» de «no los filtro»: si `''` se colara como
   * candidato, esta afirmación seguiría pasando por el camino equivocado — por eso se mira que
   * `candidatosDeAnclaje_` devuelva UNO y no tres. */
  ctx.__c = corta;
  const cuantos = vm.runInContext('candidatosDeAnclaje_(__c).length', ctx);
  afirmar(cuantos === 1,
    'y `candidatosDeAnclaje_` devuelve 1, no 3: un candidato vacío no es elegible (' + cuantos + ')');
}

console.log('\n3 · la lectura no escribe, y la clave no es la posición');
{
  const gs = codigoDe('PanelBackend.gs');

  /* ⛔ `obtenerHojaAnclajePendiente_` CREA la hoja. Que el lector no la use es la diferencia
   * entre abrir una pestaña y dejarle una hoja nueva en la planilla al usuario. */
  const lector = gs.slice(gs.indexOf('function panel_getAnclajes'),
    gs.indexOf('function panel_confirmarAnclaje'));
  afirmar(!/obtenerHojaAnclajePendiente_/.test(lector),
    'el lector NO llama a `obtenerHojaAnclajePendiente_`, que crearía la hoja');
  afirmar(/getSheetByName\('ANCLAJE_PENDIENTE'\)/.test(lector) && /existe_hoja: false/.test(lector),
    'usa `getSheetByName` y devuelve vacío si no existe — leer no escribe');

  const escritor = gs.slice(gs.indexOf('function panel_confirmarAnclaje'));
  afirmar(/claveAnclaje_\(datos\[f\]\[idx\.tipo\], datos\[f\]\[idx\.nombre_buscado\]\)/.test(escritor),
    'el escritor busca por la clave `(tipo, nombre_buscado)`, no por índice de fila');

  // ⚠ Y escribe UNA celda, no la fila: `upsertPorClave_` blanquearía lo que el objeto no traiga.
  afirmar(/getRange\(f \+ 1, idx\.elegido \+ 1\)\.setValue\(v\.valor\)/.test(escritor),
    'y escribe SÓLO la celda `elegido` — no reescribe la fila, que borraría los candidatos');
}

console.log('\n4 · ⚠ el cruce contra REUNIONES — el límite 2 del addendum a `D-29`');
{
  const gs = codigoDe('PanelBackend.gs');
  const lector = gs.slice(gs.indexOf('function panel_getAnclajes'),
    gs.indexOf('function panel_confirmarAnclaje'));

  afirmar(/leerReuniones_\(\)/.test(lector),
    'el lector cruza contra `leerReuniones_`, que filtra por `mostrar`');
  afirmar(/vigente: vigente/.test(lector) && /sin_reunion: sinReunion/.test(lector),
    'marca cada fila como vigente o no, y cuenta las que sobran');
  // ⛔ Marcar, no borrar ni esconder: las dos serían destruir/ocultar una decisión tomada.
  afirmar(!/deleteRow|\.remove\(\)/.test(lector),
    'y NO borra ninguna fila — se marca, no se destruye una decisión que alguien tomó');
}

console.log('\n5 · ⚠ romper a propósito: sin la validación entra cualquier cosa');
{
  const ctx = contexto((t) => t.replace(
    '  var candidatos = candidatosDeAnclaje_(fila);',
    '  return { ok: true, valor: valor };   // ROTO A PROPÓSITO\n  var candidatos = candidatosDeAnclaje_(fila);'));
  ctx.__f = FILA; ctx.__v = 'Una campaña que nadie puntuó';
  const r = vm.runInContext('validarEleccionAnclaje_(__f, __v)', ctx);
  afirmar(r.ok === true,
    'anulada la validación, un valor no puntuado se acepta — la afirmación 1.1 cae');
}

/* ═══ `2026-08-21_19` Parte C — archivar una huérfana ═══════════════════════════════════════
 *
 * ⭐ **Esta sección EJECUTA el lector en vez de mirarle el código**, y es a propósito: lo que hay
 * que fijar no es que la palabra `archivada` aparezca, sino **la condición** —esconder sólo
 * `archivada && !vigente`— que es donde vive toda la reversibilidad. Una regex sobre el fuente
 * pasaría igual con la condición al revés.
 */
function planillaFalsa(filas, headers) {
  const datos = [headers].concat(filas);
  const escrituras = [];
  const hoja = {
    getDataRange: () => ({ getValues: () => datos.map((f) => f.slice()) }),
    getLastColumn: () => headers.length,
    getRange: (f, c) => ({
      getValues: () => [datos[f - 1].slice()],
      setValue: (v) => { escrituras.push({ fila: f, col: c, valor: v }); datos[f - 1][c - 1] = v; }
    })
  };
  return { hoja, escrituras, datos };
}

function ctxAnclajes(planilla, reuniones) {
  const ctx = contexto();
  ctx.SpreadsheetApp = {
    getActiveSpreadsheet: () => ({ getSheetByName: () => planilla.hoja }),
    flush: () => {}
  };
  ctx.umbralAnclajeReunion_ = () => 0.6;
  ctx.leerReuniones_ = () => reuniones;
  ctx.normalizar_ = (s) => String(s || '').toLowerCase();
  ctx.parsearFechaCelda_ = (v) => (v instanceof Date ? v : null);
  ctx.Utilities = { formatDate: (f) => f.toISOString().slice(0, 10) };
  ctx.Session = { getScriptTimeZone: () => 'UTC' };
  // ⚠ El real vive en `Config.gs` y devuelve booleano; se replica su contrato mínimo, no su
  // lógica: lo que se mide acá es la CONDICIÓN del lector, no cómo se lee un `sí`.
  ctx.esVerdadero_ = (v) => v === true || String(v || '').trim().toLowerCase() === 'sí';
  return ctx;
}

const H10 = ['tipo', 'nombre_buscado', 'candidato_1', 'puntaje_1', 'candidato_2', 'puntaje_2',
  'candidato_3', 'puntaje_3', 'elegido', 'archivada'];
// `almagro` es la huérfana real de la hoja viva —su reunión está en `mostrar = no`—; `salud` sí
// la reclama una reunión vigente. El fixture copia el caso, no lo inventa.
const HUERFANA = ['reunion', 'almagro|2026-06-16|', 'Cand A', 0.5, '', '', '', '', '', ''];
const VIGENTE  = ['reunion', 'salud|2026-08-14|', 'Cand B', 0.5, '', '', '', '', '', ''];
const REUNIONES_VIVAS = [{ nombre: 'salud', fecha: new Date(Date.UTC(2026, 7, 14)), etapa: '' }];

console.log('\n6 · ⭐ archivar esconde huérfanas y NUNCA vigentes');
{
  const p = planillaFalsa([HUERFANA.slice(), VIGENTE.slice()], H10);
  const ctx = ctxAnclajes(p, REUNIONES_VIVAS);

  const antes = ctx.panel_getAnclajes();
  afirmar(antes.pendientes.length === 2 && antes.sin_reunion === 1 && antes.archivadas === 0,
    'sin archivar: las dos se ven, una marcada como huérfana');

  const r = ctx.panel_archivarAnclaje('reunion', 'almagro|2026-06-16|', true);
  afirmar(r.ok === true && r.archivada === true, 'la huérfana se archiva');

  const despues = ctx.panel_getAnclajes();
  afirmar(despues.pendientes.length === 1 && despues.pendientes[0].nombre_buscado === 'salud|2026-08-14|',
    'y desaparece de la lista — queda sólo la vigente');
  /* ⭐ **El total NO baja**, y ésa es la mitad del valor: si `sin_reunion` contara sólo las
   * visibles, archivar haría parecer que el problema se resolvió solo. */
  afirmar(despues.sin_reunion === 1 && despues.archivadas === 1,
    'el total de huérfanas SIGUE en 1 y se dice que 1 está archivada: archivar no baja el número');
  // ⛔ Y la fila sigue en la hoja: es el registro que el motor consulta antes de anclar.
  afirmar(p.datos.length === 3, 'la fila NO se borró: sigue en la hoja');
}

console.log('\n7 · ⛔ una vigente no se puede archivar');
{
  const p = planillaFalsa([HUERFANA.slice(), VIGENTE.slice()], H10);
  const ctx = ctxAnclajes(p, REUNIONES_VIVAS);
  const r = ctx.panel_archivarAnclaje('reunion', 'salud|2026-08-14|', true);
  /* Una escritura que se acepta y no tiene efecto es un cero disfrazado de éxito: se rechaza con
   * el motivo dicho. */
  afirmar(r.ok === false && /reclama una reunión vigente/.test(r.motivo),
    'se rechaza con motivo — esconder algo que la próxima corrida SÍ va a mirar');
  afirmar(p.escrituras.length === 0, 'y no escribió nada');
}

console.log('\n8 · ⭐ reversible sola: si la reunión vuelve, la fila reaparece');
{
  // Misma fila archivada, pero ahora una reunión vigente la reclama otra vez.
  const archivada = HUERFANA.slice();
  archivada[9] = 'sí';
  const p = planillaFalsa([archivada], H10);
  const ctx = ctxAnclajes(p, [{ nombre: 'almagro', fecha: new Date(Date.UTC(2026, 5, 16)), etapa: '' }]);

  const d = ctx.panel_getAnclajes();
  /* ⭐ **Nadie tuvo que desarchivarla.** Archivar significa «no me muestres esta huérfana», no
   * «no me muestres nunca esta clave» — y la segunda es la que se olvida encendida. */
  afirmar(d.pendientes.length === 1 && d.archivadas === 0,
    'vuelve sola: la condición es `archivada && !vigente`, no `archivada`');
  afirmar(d.pendientes[0].archivada === true && d.pendientes[0].vigente === true,
    'y llega con las dos marcas, para que la pantalla pueda decir por qué reapareció');
}

console.log('\n9 · la hoja vieja de 9 columnas se migra sola');
{
  const H9 = H10.slice(0, 9);
  const p = planillaFalsa([HUERFANA.slice(0, 9)], H9);
  const ctx = ctxAnclajes(p, []);
  const r = ctx.panel_archivarAnclaje('reunion', 'almagro|2026-06-16|', true);
  afirmar(r.ok === true, 'archiva igual sobre una hoja sin la columna');
  afirmar(p.datos[0][9] === 'archivada',
    'y creó el encabezado `archivada` en la columna 10 — al FINAL, que es lo que no corre las ' +
    'posiciones que `registrarAnclajePendiente_` reescribe');
}

console.log('\n10 · ⚠ romper a propósito: esconder por `archivada` a secas');
{
  const p = planillaFalsa([HUERFANA.slice(), VIGENTE.slice()], H10);
  const ctx = ctxAnclajes(p, REUNIONES_VIVAS);
  // La vigente, marcada archivada. Con la condición correcta se muestra igual.
  p.datos[2][9] = 'sí';
  const d = ctx.panel_getAnclajes();
  afirmar(d.pendientes.length === 2,
    'una VIGENTE marcada archivada se muestra igual — si se escondiera, la sección 8 no probaría nada');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si la escritura llega a la hoja. Eso se ve corriendo el panel.');
console.log('   · Si el motor respeta el `elegido` escrito. Lo hace `anclajeYaConfirmado_`, que');
console.log('     este banco no toca — y el circuito completo nunca corrió de punta a punta.');
console.log('   · ⛔ Los anclajes que EMPATAN arriba del umbral. No pasan por ANCLAJE_PENDIENTE,');
console.log('     así que ni esta pantalla ni este control los ven (límite 3 del addendum a D-29).');

process.exit(fallas === 0 ? 0 : 1);
