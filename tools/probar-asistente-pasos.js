#!/usr/bin/env node
/**
 * tools/probar-asistente-pasos.js — **no se puede saltear un paso** (`2026-08-27_1`, `D-44`).
 *
 * ⛔⛔ **La guarda es de HECHOS, nunca de una bandera del front.** Un `paso: 3` que viaja en el
 * estado del HTML es una afirmación del front sobre sí mismo, y el front puede mentir — es la
 * misma familia que el `TECHO_S = 350` escrito a mano que el `2026-08-21_1` sacó del panel, y que
 * el `|| S.faltantesComoRaya` que se retiró el 20/08. Las tres condiciones que
 * `guardaDelAsistente_` mira se leen de las hojas vivas:
 *
 *   · existe la fila de `PERIODOS`           → sin eso no hay sobre qué cargar (`D-19`)
 *   · hay filas de temario para ese período  → sin eso el paso 3 no tiene qué confirmar
 *   · ninguna reunión con `mostrar` vacío    → sin eso `leerReuniones_` la descarta y el deck
 *                                              sale sin ese encuentro, sin que nada falle
 *
 * ⭐ **La CASCADA es la mitad del control.** Si el paso 4 sólo mirara «¿confirmaron?», saltear
 * **dos** pasos pasaría: sin período no hay temario, y sin temario no hay nada que confirmar, así
 * que un estado vacío satisface la última condición **por vacuidad**. Cada paso exige lo del
 * anterior.
 *
 * Uso:  node tools/probar-asistente-pasos.js
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

/** Los hechos de un asistente que llegó hasta el final. Cada caso apaga UNA cosa. */
const COMPLETO = {
  periodo_id: '2026_agosto_21_27',
  periodo_existe: true,
  filas_temario: 5,
  filas_reuniones: 4,
  filas_campanas: 1,
  reuniones_sin_confirmar: 0,
  campanas_sin_id: 0,
  informe_id: 'jm'
};

function guarda(ctx, paso, cambios) {
  ctx.__p = paso;
  ctx.__h = Object.assign({}, COMPLETO, cambios || {});
  return C.vm.runInContext('guardaDelAsistente_(__p, __h)', ctx);
}

const ctx = C.contexto({ PERIODOS: [], REUNIONES: [], CAMPANAS: [] });
const BACKEND = C.fs.readFileSync(C.path.join(C.RAIZ, 'PanelBackend.gs'), 'utf8');

console.log('La máquina de estados del asistente — PanelBackend.gs cargado de verdad\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · El control POSITIVO — con todo hecho, los cuatro pasos abren
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · ⭐ el control positivo: con todo hecho, los cuatro abren');
{
  /* ⭐ Sin esto, «ningún paso abre» y «la guarda funciona» se ven idénticos: un instrumento que
   * sólo busca lo que sospecha no distingue *«no está»* de *«no miré»* (`CLAUDE.md` §4). */
  [1, 2, 3, 4].forEach(function (p) {
    const r = guarda(ctx, p);
    afirmar(r.ok === true, 'el paso ' + p + ' abre con todo hecho' + (r.ok ? '' : ' — ' + r.motivo));
  });
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · Cada paso, sin lo suyo — y el motivo EXIGIDO, no sólo el rojo
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · ⛔ cada paso sin lo suyo, y con el motivo exigido');
{
  /* ⭐ `CLAUDE.md` §4: un control negativo puede dar rojo **por el motivo equivocado**. Por eso
   * cada caso exige `falta`, que dice CUÁL condición cayó, y no sólo `ok === false`. */
  const sinPeriodo = guarda(ctx, 2, { periodo_id: '' });
  afirmar(sinPeriodo.ok === false && sinPeriodo.falta === 'periodo',
    '⛔ al paso 2 sin período elegido: cae por `periodo`');
  afirmar(/D-19/.test(sinPeriodo.motivo || ''),
    '   y el motivo cita `D-19` — una fila sin período no entra a ningún informe');

  const fantasma = guarda(ctx, 2, { periodo_existe: false });
  afirmar(fantasma.ok === false && fantasma.falta === 'periodo',
    '⛔ y con un `periodo_id` que NO está en `PERIODOS` tampoco abre: el motor no crea períodos al pasar');

  const sinTemario = guarda(ctx, 3, { filas_temario: 0 });
  afirmar(sinTemario.ok === false && sinTemario.falta === 'temario',
    '⛔⛔ al paso 3 SIN TEMARIO: cae por `temario` — el banco 4 del prompt, primera mitad');
  afirmar(/anclar/.test(sinTemario.motivo || ''),
    '   y el motivo dice por qué importa: sin filas, el anclaje no tiene qué anclar');

  const sinConfirmar = guarda(ctx, 4, { reuniones_sin_confirmar: 2 });
  afirmar(sinConfirmar.ok === false && sinConfirmar.falta === 'confirmar',
    '⛔⛔ al paso 4 SIN CONFIRMAR: cae por `confirmar` — el banco 4, segunda mitad');
  afirmar(/leerReuniones_/.test(sinConfirmar.motivo || ''),
    '   ⭐ y el motivo nombra la causa MEDIDA: `leerReuniones_` filtra por `mostrar` antes de que ' +
    'el anclaje vea nada');

  const sinInforme = guarda(ctx, 4, { informe_id: '' });
  afirmar(sinInforme.ok === false && sinInforme.falta === 'informe',
    '⛔ y al paso 4 sin informe elegido: cae por `informe`');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⭐⭐ LA CASCADA — saltear DOS pasos también tiene que fallar
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · ⭐⭐ la cascada: saltear dos pasos falla, y por la condición de MÁS ATRÁS');
{
  /* Un asistente recién abierto: nada elegido, nada cargado, nada confirmado. Con una guarda que
   * sólo mirara la condición de su propio paso, `reuniones_sin_confirmar === 0` sería **cierto por
   * vacuidad** y el paso 4 abriría sobre la nada. */
  const vacio = {
    periodo_id: '', periodo_existe: false, filas_temario: 0, filas_reuniones: 0,
    filas_campanas: 0, reuniones_sin_confirmar: 0, campanas_sin_id: 0, informe_id: 'jm'
  };

  const r4 = guarda(ctx, 4, vacio);
  afirmar(r4.ok === false && r4.falta === 'periodo',
    '⭐⭐ del 1 al 4 de un salto: cae por `periodo`, la condición de MÁS ATRÁS — no por `confirmar`');
  const r3 = guarda(ctx, 3, vacio);
  afirmar(r3.ok === false && r3.falta === 'periodo', '⭐ y del 1 al 3 también');

  /* Y con período pero sin temario, el 4 cae por `temario` y no por `confirmar`. */
  const soloPeriodo = guarda(ctx, 4, { filas_temario: 0, reuniones_sin_confirmar: 0 });
  afirmar(soloPeriodo.ok === false && soloPeriodo.falta === 'temario',
    '⭐ con período pero sin temario, el paso 4 cae por `temario`, no por `confirmar`');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · ⚠ El LÍMITE, declarado en vez de descubierto
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · ⚠ el límite de la guarda, afirmado para que nadie lo descubra en una corrida');
{
  /* ⚠ `cargarTemarioCampanas_` escribe `mostrar = 'sí'` de entrada (`AJ-1`, *ante la duda entra*),
   * así que una campaña **nace confirmada** y no hay hecho que pruebe que alguien la miró. Un
   * temario de sólo campañas satisface la guarda sin haber pasado por la pantalla del paso 3.
   * **No se inventa una columna para taparlo: se dice, y se afirma acá.** */
  const soloCampanas = guarda(ctx, 4, {
    filas_reuniones: 0, filas_campanas: 3, filas_temario: 3, reuniones_sin_confirmar: 0
  });
  afirmar(soloCampanas.ok === true,
    '⚠ un temario de SÓLO CAMPAÑAS abre el paso 4 sin haber pasado por el 3 — límite conocido');
  /* ⚠ Se busca en el ENCABEZADO de la guarda, no en cualquier lugar del archivo: `AJ-1` también
   * está citado en `estadoDeTemario_`, 1.500 líneas más arriba, y matchear ahí daría verde sin que
   * el límite estuviera declarado donde alguien lo va a leer. */
  const iGuarda = BACKEND.indexOf('function guardaDelAsistente_');
  const encabezado = BACKEND.slice(Math.max(0, iGuarda - 1800), iGuarda);
  afirmar(/AJ-1/.test(encabezado) && /nacen/.test(encabezado),
    '   ⭐ y el límite está DECLARADO en el encabezado de la guarda, citando `AJ-1` — no escondido');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Los HECHOS salen de las hojas vivas, no de un parámetro del front
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · ⭐ los hechos se leen de las hojas, no los manda el front');
{
  const con = C.contexto({
    PERIODOS: [['2026_agosto_21_27', '2026-08-21', '2026-08-27', '']],
    REUNIONES: [
      ['2026_agosto_21_27', 1, 'JM', 'Uno a uno', 'Retiro', '2026-08-24', '', 'sí', 'crudo', ''],
      ['2026_agosto_21_27', 2, 'JM', 'Uno a uno', 'Boedo', '2026-08-25', '', '', 'crudo', ''],
      ['julio_24_30', 3, 'JM', 'Uno a uno', 'Otro', '2026-07-25', '', '', 'crudo', '']
    ],
    CAMPANAS: [
      ['2026_agosto_21_27', '3488-AGOJDGAG', 'Una', 'jm', 'digital', 'destacada', '', '', 'sí', 1, '3488', '']
    ]
  });
  const h = C.vm.runInContext('hechosDelAsistente_("2026_agosto_21_27", "jm")', con);

  afirmar(h.periodo_existe === true, 'la fila de `PERIODOS` se encuentra');
  afirmar(h.filas_reuniones === 2 && h.filas_campanas === 1,
    '⭐ y sólo cuenta las de ESE período: 2 reuniones y 1 campaña, no la de `julio_24_30`');
  afirmar(h.filas_temario === 3, 'el temario son las dos fuentes juntas: 3');
  afirmar(h.reuniones_sin_confirmar === 1,
    '⭐⭐ y la reunión con `mostrar` VACÍO se cuenta como sin confirmar: 1');

  const r = C.vm.runInContext(
    'guardaDelAsistente_(4, hechosDelAsistente_("2026_agosto_21_27", "jm"))', con);
  afirmar(r.ok === false && r.falta === 'confirmar',
    '⛔⛔ y con esos hechos reales el paso 4 NO abre — que es todo el punto de la guarda');

  /* ⚠ Un `periodo_id` que no está en la hoja: el hecho lo dice, no el front. */
  const fantasma = C.vm.runInContext('hechosDelAsistente_("no_existe", "jm")', con);
  afirmar(fantasma.periodo_existe === false && fantasma.filas_temario === 0,
    '⚠ un período que no está da `periodo_existe: false` y cero filas');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 6 · ⚠ El control negativo — romper la cascada y ver QUÉ afirmación cae
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · ⚠ el control negativo: sin cascada, saltear dos pasos deja de fallar');
{
  /* Se corre el corte de arriba del 1 al 3: con eso, el paso 3 deja de exigir lo del 2 y el 1. */
  const romper = function (x) {
    return x.archivo === 'PanelBackend.gs'
      ? x.texto.replace('  if (n <= 1) return { ok: true };',
                        '  if (n <= 3) return { ok: true };   // ROTO A PROPOSITO')
      : x.texto;
  };
  romper.__archivo = 'PanelBackend.gs';

  const roto = C.contexto({ PERIODOS: [] }, romper);
  roto.__p = 3;
  roto.__h = {
    periodo_id: '', periodo_existe: false, filas_temario: 0, informe_id: 'jm',
    reuniones_sin_confirmar: 0
  };
  const r = C.vm.runInContext('guardaDelAsistente_(__p, __h)', roto);

  afirmar(r.ok === true,
    '⭐ sin la cascada, el paso 3 abre sobre la nada — los asertos 2.3 y 3.2 caen, y por el motivo correcto');
  /* ⚠ Si el parche no hubiera matcheado, `contexto()` habría tirado antes de llegar acá: la
   * guarda del 24/08 —*el control negativo verifica que la MUTACIÓN ocurrió*— vive en
   * `asistente-contexto.js`, y esta afirmación deja escrito que se ejerció. */
  afirmar(true, '⚠ y la mutación OCURRIÓ: sin el parche aplicado, `contexto()` tira antes de medir');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 7 · ⛔⛔ El paso 4 corre la guarda, y manda el período EXPLÍCITO
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n7 · ⛔⛔ el paso 4: guarda de verdad, y período explícito');
{
  const con = C.contexto({
    PERIODOS: [['2026_agosto_21_27', '2026-08-21', '2026-08-27', '']],
    REUNIONES: [
      ['2026_agosto_21_27', 1, 'JM', 'Uno a uno', 'Retiro', '2026-08-24', '', 'sí', 'a', ''],
      ['2026_agosto_21_27', 2, 'JM', 'Uno a uno', 'Boedo', '2026-08-25', '', '', 'b', '']
    ],
    CAMPANAS: []
  });
  /* Se falsean los dos adaptadores para poder ver **qué les llega** sin generar un deck. */
  con.__llamadas = [];
  con.panel_generar = function (i, p, s, sec) {
    con.__llamadas.push({ cual: 'directa', informe: i, periodo: p, simbolos: s, secciones: sec });
    return { ok: true, deck: { url: 'x' } };
  };
  con.panel_generarDesatendida = function (i, p) {
    con.__llamadas.push({ cual: 'desatendida', informe: i, periodo: p });
    return { ok: true };
  };

  /* ⛔ Con Boedo sin decidir, el paso 4 NO corre — y lo que prueba que la guarda es de verdad es
   * que **no llamó a nadie**. Una guarda que deja pasar y después informa error ya generó. */
  const bloqueado = C.vm.runInContext(
    'panel_asistenteGenerar("jm", "2026_agosto_21_27", true, [], false)', con);
  afirmar(bloqueado.ok === false && bloqueado.falta === 'confirmar',
    '⛔⛔ con una reunión sin decidir, el paso 4 no abre');
  afirmar(con.__llamadas.length === 0,
    '⭐⭐ y NO llamó al generador: una guarda que deja pasar y después informa error ya generó');

  /* Ahora sí: se decide la que faltaba. */
  con.__hojas.REUNIONES.__filas[2][7] = 'no';
  const r = C.vm.runInContext(
    'panel_asistenteGenerar("jm", "2026_agosto_21_27", true, ["encuentro"], false)', con);
  afirmar(r.ok === true, 'con todo decidido, genera' + (r.ok ? '' : ' — ' + r.motivo));
  afirmar(con.__llamadas.length === 1 && con.__llamadas[0].cual === 'directa',
    '⭐ y va por `panel_generar`, el adaptador de siempre — no hay un segundo camino');
  afirmar(con.__llamadas[0].periodo === '2026_agosto_21_27',
    '⭐⭐ con el período EXPLÍCITO: sin él `anclarEncuentros` no recorta y entran 12 encuentros en vez de 2');
  afirmar(con.__llamadas[0].secciones.join(',') === 'encuentro' && con.__llamadas[0].simbolos === true,
    '   y las opciones de pantalla llegan tal cual: secciones y símbolos');
  afirmar(r.via === 'asistente' && r.periodo_explicito === true,
    '⚠ el resultado dice que vino del asistente: es lo que explica un temario distinto con la misma ventana');

  /* El otro botón manda exactamente lo mismo por el otro adaptador. */
  const des = C.vm.runInContext(
    'panel_asistenteGenerar("jm", "2026_agosto_21_27", true, [], true)', con);
  afirmar(des.ok === true && con.__llamadas[1].cual === 'desatendida' &&
          con.__llamadas[1].periodo === '2026_agosto_21_27',
    '⭐ y el botón desatendido manda lo mismo, por `panel_generarDesatendida`');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 8 · El panel cableado, y el orden en la pantalla
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n8 · el asistente cableado al panel');
{
  const html = C.fs.readFileSync(C.path.join(C.RAIZ, 'Panel.html'), 'utf8');

  afirmar(BACKEND.indexOf('function panel_asistenteGenerar(') !== -1 &&
          html.indexOf('.panel_asistenteGenerar(') !== -1,
    '`panel_asistenteGenerar` existe en el backend Y el front la llama');

  /* ⭐ El front NUNCA llama a `panel_generar` desde el asistente: si lo hiciera, se saltearía la
   * guarda del paso 4 y podría mandar el período vacío. */
  const bloqueAsis = html.slice(html.indexOf('function generarDesdeAsistente'),
                                html.indexOf('function conectarAsistente'));
  afirmar(bloqueAsis.indexOf('.panel_generar(') === -1 &&
          bloqueAsis.indexOf('.panel_generarDesatendida(') === -1,
    '⛔⛔ y el asistente NO llama a los adaptadores directos: se saltearía la guarda del paso 4');
  afirmar(/panel_asistenteGenerar\(S\.informeId, a\.periodoId/.test(bloqueAsis),
    '⭐ manda `a.periodoId`, el del asistente — nunca vacío ni «por defecto»');

  /* ⛔ El botón del paso 4 cuelga de lo que dice el backend, no de una bandera del front. */
  afirmar(/a\.anclaje && a\.puedeGenerar/.test(html),
    '⛔ el botón «seguir al paso 4» aparece sólo si el backend dijo `puede_generar`');
  afirmar(/puedeGenerar = r\.puede_generar === true/.test(html),
    '   y `puedeGenerar` sale de la respuesta del backend, no se deriva en el front');

  /* Los cuatro pasos, en orden, en la barra. */
  afirmar(/\['Período', 'Temario', 'Confirmar', 'Generar'\]/.test(html),
    '⭐ la barra de pasos nombra los cuatro, en orden');
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que el FRONT respete el orden. Fija que el BACKEND no deja saltear; que la');
console.log('     pantalla no ofrezca el botón es otra afirmación, y la mide el banco del HTML.');
console.log('   · ⚠ Un temario de SÓLO CAMPAÑAS abre el paso 4 sin pasar por el 3 (caso 4). Es un');
console.log('     límite conocido: `AJ-1` las escribe con `mostrar = sí` y nacen confirmadas.');
console.log('   · Nada sobre lo que cada paso HACE: eso lo miden los otros bancos del asistente.');

process.exit(fallas === 0 ? 0 : 1);
