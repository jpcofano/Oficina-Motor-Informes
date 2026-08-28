#!/usr/bin/env node
/**
 * tools/probar-asistente-anclaje.js — **los TRES estados del anclaje se ven en el paso 3**
 * (`2026-08-27_1`, `D-44`).
 *
 * ⛔⛔ **La premisa que este paso corrige:** `panel_getAnclajes` lee `ANCLAJE_PENDIENTE`, y esa
 * hoja **sólo registra los de baja confianza** — `registrarAnclajePendiente_` se llama en la rama
 * `!pasaUmbral` y en ninguna otra. Un encuentro que ancló perfecto y uno que no ancló contra nada
 * **se ven idénticos desde ahí: no están.** Ese hueco ya bloqueó una medición el 22/08.
 *
 * ⭐⭐ **Por eso el control que importa es el POSITIVO: un encuentro de ALTA CONFIANZA tiene que
 * aparecer.** Con la hoja como fuente no aparecería, y una lista sin él se lee como *«ningún
 * encuentro tiene problema»* — que es cierto y no es lo que la pantalla tiene que decir. Sin esa
 * afirmación, *«no hay»* y *«no miré»* son la misma salida.
 *
 * ⭐ **Y la segunda pregunta ya costó caro:** el deck del 04/08 publicó **once números de
 * `3347-JULJDGAG` cuando el encuentro era `3387-JULJDGGC`** — dos cuentas con el mismo nombre de
 * campaña. Ningún número estaba mal formateado ni mal ubicado: **estaba mal la cuenta.**
 *
 * Uso:  node tools/probar-asistente-anclaje.js
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
const UNION = C.fs.readFileSync(C.path.join(C.RAIZ, 'Union.gs'), 'utf8');
const BACKEND = C.fs.readFileSync(C.path.join(C.RAIZ, 'PanelBackend.gs'), 'utf8');

/**
 * ⭐ **El fixture se COPIA de la forma real, no se deduce.** Los tres nombres de lista y los
 * campos del ítem salen de `anclarEncuentrosSinCache_` (`Union.gs`), y el caso 1 afirma que siguen
 * llamándose así — un fixture inventado y el código pueden compartir el mismo supuesto falso, y
 * entonces no hay dato que los distinga (`CLAUDE.md` §4, `Pruebas.gs:456`).
 *
 * ⚠ **Los dos casos de `sinLink` son distintos a propósito**: uno sin fila de `rdv` y uno de
 * homónimos que el desempate no separa. Mandan a trabajos opuestos —mirar el temario contra elegir
 * la cuenta— y un solo caso no los distinguiría.
 */
const ANCLAJE = {
  ok: true,
  umbral: 0.6,
  periodo_id: PERIODO,
  excluidas_por_periodo: [],
  encuentros: [{
    reunion: 'Retiro', tipo: 'Uno a uno', fecha: new Date(2026, 7, 24), etapa: '',
    idCuenta: '3487-AGOJDGAG', score: 0.92, candidatoNombre: 'JM Retiro Agosto',
    nombreBuscado: 'retiro|2026-08-24|', paso_anclaje: 1
  }, {
    reunion: 'Boedo', tipo: 'Uno a uno', fecha: new Date(2026, 7, 25), etapa: '',
    idCuenta: '3490-AGOJDGAG', score: 1, candidatoNombre: 'JM Boedo', confirmadoAMano: true,
    nombreBuscado: 'boedo|2026-08-25|'
  }],
  bajaConfianza: [{
    reunion: 'Salud', tipo: 'Encuentro Temático', fecha: new Date(2026, 7, 26), etapa: '',
    idCuenta: '3491-AGOJDGAG', score: 0.41, candidatoNombre: 'Tematico Salud',
    nombreBuscado: 'salud|2026-08-26|', pendiente: true, paso_anclaje: 2
  }],
  sinLink: [{
    reunion: 'Almagro', tipo: 'Uno a uno', fecha: new Date(2026, 7, 27), etapa: '',
    idCuenta: '', score: 0, candidatoNombre: '', nombreBuscado: 'almagro|2026-08-27|',
    motivo: 'no se encontró la fila de rdv de este encuentro'
  }, {
    reunion: 'Orden Público', tipo: 'Encuentro Temático', fecha: new Date(2026, 7, 27), etapa: '',
    idCuenta: '', score: 0.8, candidatoNombre: '', nombreBuscado: 'orden publico|2026-08-27|',
    motivoAmbiguo: '«FALTA:@homonimo_sin_desempate» — hay 2 candidatos con el mismo score',
    traza_desempate: 'hay 2 candidatos con el mismo score y los dos primeros están a la misma distancia'
  }]
};

/** Un contexto con el período y el temario ya cargados, y el anclaje falseado. */
function armar(parchear) {
  const ctx = C.contexto({
    PERIODOS: [[PERIODO, '2026-08-21', '2026-08-27', '']],
    REUNIONES: [
      [PERIODO, 1, 'JM', 'Uno a uno', 'Retiro', new Date(2026, 7, 24), '', '', '1) JM | Uno a uno en Retiro 24/08', ''],
      [PERIODO, 2, 'JM', 'Uno a uno', 'Boedo', new Date(2026, 7, 25), '', '', '2) JM | Uno a uno en Boedo 25/08', ''],
      [PERIODO, '', '', '', '', '', '', '', 'esto no parsea', 'no se pudo parsear']
    ],
    CAMPANAS: [
      [PERIODO, '3488-AGOJDGAG', 'Egreso de cadetes', 'jm', 'digital', 'destacada', '', '', 'sí', 1, '3488-AGOJDGAG', '']
    ]
  }, parchear);

  /* ⚠ **Se falsean sólo las dos que necesitan las bases externas.** `anclarEncuentros` abre cuatro
   * planillas por `openById` y `resolverVentana` recorre la cadena de `D-20`; lo que este banco
   * mide es qué hace el paso 3 con el resultado, y **los dos curadores que escriben `mostrar` son
   * los REALES**. */
  ctx.resolverVentana = () => ({
    ok: true, desde: new Date(2026, 7, 21), hasta: new Date(2026, 7, 27), origen: 'periodo_ref:' + PERIODO
  });
  ctx.formatearPeriodoLamina_ = () => '21/08 — 27/08';
  ctx.umbralAnclajeReunion_ = () => 0.6;
  ctx.abrirCacheRegistros_ = () => { ctx.__abrio = (ctx.__abrio || 0) + 1; };
  ctx.cerrarCacheRegistros_ = () => { ctx.__cerro = (ctx.__cerro || 0) + 1; };
  ctx.abrirCacheDatosHoja_ = () => { ctx.__abrioDatos = (ctx.__abrioDatos || 0) + 1; };
  ctx.cerrarCacheDatosHoja_ = () => { ctx.__cerroDatos = (ctx.__cerroDatos || 0) + 1; };
  ctx.anclarEncuentros = () => {
    /* ⭐ El anclaje falseado **registra a quién vio**, para poder afirmar que corrió DESPUÉS de
     * escribir `mostrar` y no antes. */
    ctx.__anclo = ctx.__hojas.REUNIONES.__filas
      .filter((f) => String(f[7] || '').trim().toLowerCase() === 'sí')
      .map((f) => f[4]);
    return ANCLAJE;
  };
  return ctx;
}

console.log('Paso 3 del asistente — los tres estados, y los curadores reales\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · El fixture COPIA la forma real — si el motor la cambia, esto se entera
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · el fixture copia la forma de `anclarEncuentros`, no la deduce');
{
  /* ⚠ Un fixture inventado y el código pueden compartir el mismo supuesto falso, y entonces no hay
   * dato que los distinga. Acá se afirma contra la fuente. */
  afirmar(/ok: true, encuentros: encuentros, sinLink: sinLink, bajaConfianza: bajaConfianza/.test(UNION),
    '⭐ `anclarEncuentrosSinCache_` sigue devolviendo `encuentros` · `sinLink` · `bajaConfianza`');
  afirmar(/registrarAnclajePendiente_\(hojaPendiente, indicePendiente/.test(UNION) &&
          UNION.split('registrarAnclajePendiente_(hojaPendiente').length === 2,
    '⛔⛔ y `ANCLAJE_PENDIENTE` se escribe en UNA sola rama — por eso la hoja no puede ser la fuente');
  afirmar(/nombreBuscado: nombreBuscado/.test(UNION),
    '⭐ el ítem lleva `nombreBuscado`: sin él, elegir desde el paso 3 no tendría dónde escribir');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐⭐ EL CONTROL POSITIVO — el de ALTA CONFIANZA aparece
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · ⭐⭐ los tres estados se ven, y el que importa es el de ALTA confianza');
{
  const ctx = armar();
  ctx.__a = ANCLAJE;
  const e = C.vm.runInContext('estadosDeAnclaje_(__a)', ctx);

  afirmar(e.ok === true, 'devuelve `ok`');
  afirmar(e.filas.length === 5, 'las cinco filas del anclaje entran: ' + e.filas.length);

  const alta = e.filas.filter((f) => f.estado === 'alta');
  afirmar(alta.length === 2,
    '⭐⭐ los DOS de alta confianza APARECEN — con `ANCLAJE_PENDIENTE` como fuente no estarían');
  afirmar(alta[0].reunion === 'Retiro' && alta[0].id_cuenta === '3487-AGOJDGAG',
    '⭐ y traen la CUENTA que les ancló: Retiro → ' + alta[0].id_cuenta);
  afirmar(alta[0].score === 0.92, '   con su puntaje crudo, sin redondear: ' + alta[0].score);
  afirmar(alta[1].confirmado_a_mano === true,
    '⚠ y el que ya se había confirmado a mano lo dice — no se vuelve a preguntar');

  afirmar(e.filas.filter((f) => f.estado === 'baja').length === 1, 'el de baja confianza aparece');
  afirmar(e.filas.filter((f) => f.estado === 'sin_link').length === 2, 'y los dos sin link también');

  /* ⭐ Los tres conteos declarados: «cero de baja confianza» y «no se midió» se ven igual en una
   * lista vacía, y sólo uno de los dos es un resultado. */
  afirmar(e.conteos.alta === 2 && e.conteos.baja === 1 && e.conteos.sin_link === 2,
    '⭐ y los tres conteos van declarados: 2 · 1 · 2');
  afirmar(e.umbral === 0.6, 'el umbral viaja al lado del score, para poder compararlos');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · Los DOS motivos de «sin link» son distintos y no se colapsan
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · ⭐ los dos motivos de «sin link» mandan a trabajos opuestos');
{
  const ctx = armar();
  ctx.__a = ANCLAJE;
  const e = C.vm.runInContext('estadosDeAnclaje_(__a)', ctx);
  const sin = e.filas.filter((f) => f.estado === 'sin_link');

  afirmar(/fila de rdv/.test(sin[0].motivo),
    '⭐ «no se encontró la fila de rdv» — manda a mirar el TEMARIO');
  afirmar(/homonimo_sin_desempate/.test(sin[1].motivo),
    '⭐ «homónimos sin desempate» — manda a ELEGIR la cuenta. Es el caso 3347 / 3387');
  afirmar(sin[0].motivo !== sin[1].motivo,
    '⛔ y no se colapsan en un motivo genérico: dos causas con el mismo símbolo mienten sobre por qué');
  afirmar(/misma distancia/.test(sin[1].traza_desempate || ''),
    '⚠ con la traza del desempate, que dice POR QUÉ no se pudo elegir');

  /* La clave para escribir la decisión viaja con cada fila. */
  afirmar(e.filas.every((f) => f.nombre_buscado),
    '⭐ las cinco traen `nombre_buscado` — la clave con la que `panel_confirmarAnclaje` escribe');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · ⛔⛔ La corrección de premisa MEDIDA — el anclaje corre DESPUÉS de confirmar
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · ⛔⛔ el anclaje corre DESPUÉS de escribir `mostrar`, no antes');
{
  /* `anclarEncuentrosSinCache_` ancla sobre `leerReuniones_()`, que filtra `esVerdadero_(mostrar)`
   * **antes de que el anclaje vea nada**, y `cargarTemarioReuniones_` deja `mostrar` vacío. Un
   * temario recién cargado tiene CERO filas anclables: anclar al entrar al paso 3 ancla NADA, y
   * tres listas vacías se leen como «ningún encuentro tiene problema».
   *
   * ⭐ Es el caso del 25/08 que ya está en `CLAUDE.md` §4: *«REUNIONES no tiene filas para anclar
   * en julio_24_30 — descartadas por período: 6»*, con las cuatro filas de julio en `mostrar`
   * vacío. **El filtro que faltaba estaba un nivel arriba.** */
  afirmar(/esVerdadero_\(fila\[idx\.mostrar\]\)/.test(
    C.fs.readFileSync(C.path.join(C.RAIZ, 'Reuniones.gs'), 'utf8')),
    '⛔ medido en la fuente: `leerReuniones_` filtra por `mostrar` antes de devolver nada');

  const ctx = armar();
  /* El paso 3 abre y **no ancla**: sólo lee lo que hay para el check. */
  const p3 = C.vm.runInContext('panel_asistentePaso3("' + PERIODO + '", "jm")', ctx);
  afirmar(p3.ok === true, 'el paso 3 abre' + (p3.ok ? '' : ' — ' + p3.motivo));
  afirmar(ctx.__anclo === undefined,
    '⭐⭐ y NO ancló: con `mostrar` vacío en las tres filas, anclar devolvería tres listas vacías');
  afirmar(p3.reuniones.length === 3 && p3.campanas.length === 1,
    'trae las 3 reuniones y la campaña — TODAS, no las que `leerReuniones_` deja pasar');
  afirmar(p3.reuniones.every((f) => f.sin_decidir === true),
    '⭐ las tres marcadas `sin_decidir`: `mostrar` vacío es «nadie decidió», no «decidieron que no»');
  afirmar(p3.sin_parsear === 1 && p3.reuniones.filter((f) => f.sin_parsear).length === 1,
    '⛔⛔ y la línea que no se pudo interpretar se VE acá, marcada: ' + p3.sin_parsear);
  afirmar(p3.campanas[0].mostrar === true && p3.campanas[0].sin_decidir === false,
    '⚠ la campaña nace en `mostrar = sí` (`AJ-1`) — las dos fuentes se comportan distinto y se dice');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · ⭐⭐ Confirmar ESCRIBE `mostrar` por los curadores, y recién ahí ancla
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · ⭐⭐ confirmar escribe y después ancla, en una sola respuesta');
{
  const ctx = armar();
  ctx.__d = [
    { fuente: 'REUNIONES', clave: '1) JM | Uno a uno en Retiro 24/08', mostrar: true },
    { fuente: 'REUNIONES', clave: '2) JM | Uno a uno en Boedo 25/08', mostrar: true },
    { fuente: 'REUNIONES', clave: 'esto no parsea', mostrar: false },
    { fuente: 'CAMPANAS', clave: '3488-AGOJDGAG', mostrar: true }
  ];
  const r = C.vm.runInContext('panel_asistenteConfirmar("' + PERIODO + '", "jm", __d)', ctx);

  afirmar(r.ok === true, 'confirma' + (r.ok ? '' : ' — ' + r.motivo));

  const filas = ctx.__hojas.REUNIONES.__filas;
  const retiro = filas.filter((f) => f[8] === '1) JM | Uno a uno en Retiro 24/08')[0];
  const rota = filas.filter((f) => f[8] === 'esto no parsea')[0];
  afirmar(retiro[7] === 'sí', '⭐ el check tildado escribe `mostrar = sí` en la fila de Retiro');
  afirmar(rota[7] === 'no',
    '⭐⭐ y el DESTILDADO escribe `no`, nunca vacío: vacío es «nadie decidió», y la guarda del ' +
    'paso 4 lo usa para saber si este paso ocurrió');
  afirmar(filas.filter((f) => String(f[7]).trim() === '' && f[0] === PERIODO).length === 0,
    '⛔ no queda ninguna fila del período sin decidir');

  /* ⭐⭐ El anclaje corrió DESPUÉS, y vio exactamente las dos que quedaron en `sí`. */
  afirmar(Array.isArray(ctx.__anclo) && ctx.__anclo.length === 2,
    '⭐⭐ y el anclaje corrió DESPUÉS de escribir: vio 2 filas, las que quedaron en `sí`');
  afirmar(ctx.__anclo.indexOf('Retiro') !== -1 && ctx.__anclo.indexOf('Boedo') !== -1,
    '   y son Retiro y Boedo — la rota quedó afuera, que es lo que se pidió');

  /* Las tres listas vuelven en la MISMA respuesta: las dos preguntas del paso 3 son una pantalla. */
  afirmar(r.anclaje.ok === true && r.anclaje.filas.length === 5,
    '⭐ el anclaje vuelve en la misma respuesta — no hay que apretar otra vez para verlo');
  afirmar(r.anclaje.conteos.alta === 2, '   con los de alta confianza incluidos: ' + r.anclaje.conteos.alta);
  afirmar(r.puede_generar === true,
    '⭐⭐ y el paso 4 queda habilitado — por `guardaDelAsistente_`, con hechos releídos de la hoja');

  /* ⭐ Las dos cachés, copiadas del preámbulo de `generarInforme` y no armadas de nuevo. */
  /* ⭐⭐ `2026-08-28` — **la afirmación pasó de un número a un INVARIANTE, y con motivo.** Pedía
   * `=== 1` y se puso roja cuando el paso 3 ganó un segundo consumidor de cachés
   * (`contrapartesPorCuenta_`, que lee los canales de cada cuenta). El número era correcto el día
   * que se escribió y **caducaba con el próximo consumidor**; lo que de verdad importa es que
   * **cada apertura tenga su cierre** y que **alguien las haya abierto**.
   *
   * ⚠ Un `abrir` sin `cerrar` deja las cachés vivas más allá de la llamada, y ahí un diagnóstico
   * posterior leería datos viejos creyendo que relee — que es justo lo que las cachés apagadas por
   * defecto existen para evitar. */
  afirmar(ctx.__abrio >= 1 && ctx.__abrio === ctx.__cerro,
    '⭐⭐ la caché de registros se abrió (' + ctx.__abrio + ') y se cerró las mismas veces: ' +
    '`unirDigitalPorCuenta` pasa de 6 s a 325 sin ella, y una que queda abierta miente después');
  afirmar(ctx.__abrioDatos >= 1 && ctx.__abrioDatos === ctx.__cerroDatos,
    '⭐ y la de datos igual (' + ctx.__abrioDatos + ') — balanceada, que es el invariante que no caduca');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 6 · Una decisión sobre una fila que no existe se REPORTA, no se inventa
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
/* ⭐⭐ `2026-08-28` — **este caso se dio vuelta, y con MÁS exigencia.** Hasta hoy pedía
 * `r.ok === true` con la clave en `sin_fila`: o sea que una confirmación que **no llegó a ninguna
 * fila** se reportaba como éxito y el flujo **seguía al anclaje**.
 *
 * ⛔ **Eso es exactamente lo que se publicó el 28/08.** Con dos filas del mismo `texto_original`
 * —el mismo temario pegado para dos períodos— el tilde fue a la fila del período viejo, la nueva
 * quedó con `mostrar` vacío, y el anclaje falló con *«REUNIONES no tiene filas para anclar»*
 * **culpando al período, que era inocente**. La causa estaba dos pasos antes y nadie la vio.
 *
 * ⭐ **La garantía nueva, que es la que faltaba: sobre una confirmación a medias NO se corre el
 * anclaje.** Su resultado ahí no significa nada y su mensaje manda al lugar equivocado. */
console.log('\n6 · ⛔ una clave que no matchea FALLA, y no se sigue al anclaje');
{
  const ctx = armar();
  ctx.__d = [{ fuente: 'REUNIONES', clave: 'una linea que ya no esta', mostrar: true }];
  const r = C.vm.runInContext('panel_asistenteConfirmar("' + PERIODO + '", "jm", __d)', ctx);

  afirmar(r.ok === false, '⭐⭐ la confirmación FALLA: no llegó a ninguna fila, y eso no es un cero');
  afirmar(/una linea que ya no esta/.test(r.motivo || ''),
    '⛔ y el motivo NOMBRA la clave — el panel puede estar mostrando una lista vieja');
  afirmar(ctx.__hojas.REUNIONES.__filas.filter((f) => String(f[7]).trim() !== '' && f[0] === PERIODO).length === 0,
    '⛔⛔ y NO escribió en ninguna otra fila: escribir por índice pondría la decisión en la equivocada');
  /* ⚠ Se mira `__anclo` y no `__abrio`: las cachés las abre también la guarda del paso 3, así que
   * ese contador no distingue «corrió el anclaje» de «se leyeron los hechos». `__anclo` lo escribe
   * el anclaje falseado y sólo él. */
  afirmar(ctx.__anclo === undefined,
    '⭐⭐ y el anclaje NO corrió: sobre una confirmación a medias su mensaje culparía al período');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 7 · ⚠ El control negativo — leer sólo `bajaConfianza` es la premisa vieja
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n7 · ⚠ el control negativo: con la fuente vieja, los de alta confianza desaparecen');
{
  /* Se anula la lista de `encuentros`, que es exactamente lo que `ANCLAJE_PENDIENTE` no tiene. */
  const romper = function (x) {
    return x.archivo === 'PanelBackend.gs'
      ? x.texto.replace(
        ".concat((anclaje.encuentros || []).map(function (i) { return comoFila(i, 'alta'); }))",
        '.concat([])   // ROTO A PROPOSITO')
      : x.texto;
  };
  romper.__archivo = 'PanelBackend.gs';

  const ctx = armar(romper);
  ctx.__a = ANCLAJE;
  const e = C.vm.runInContext('estadosDeAnclaje_(__a)', ctx);

  afirmar(e.filas.filter((f) => f.estado === 'alta').length === 0,
    '⭐⭐ leyendo como la hoja vieja, los de ALTA CONFIANZA desaparecen — el aserto 2.3 cae');
  afirmar(e.filas.length === 3,
    '⛔ y quedan 3 filas donde hay 5: una lista que se lee como «ningún encuentro tiene problema»');
  afirmar(e.conteos.alta === 2,
    '⚠ y el conteo los sigue contando: por eso los tres números van declarados aunque la lista mienta');
  afirmar(true, '⚠ y la mutación OCURRIÓ: sin el parche aplicado, `contexto()` tira antes de medir');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 8 · El panel cableado, y sin un camino de escritura nuevo
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n8 · el paso 3 cableado, y por los curadores declarados');
{
  const html = C.fs.readFileSync(C.path.join(C.RAIZ, 'Panel.html'), 'utf8');

  ['panel_asistentePaso3', 'panel_asistenteConfirmar'].forEach((fn) => {
    afirmar(BACKEND.indexOf('function ' + fn + '(') !== -1 && html.indexOf('.' + fn + '(') !== -1,
      '`' + fn + '` existe en el backend Y el front la llama');
  });

  const i = BACKEND.indexOf('function panel_asistenteConfirmar');
  const bloque = BACKEND.slice(i, i + 3500);
  afirmar(bloque.indexOf('setValue') === -1 && bloque.indexOf('appendRow') === -1,
    '⛔⛔ el paso 3 NO escribe por su cuenta: delega en los dos curadores');
  afirmar(bloque.indexOf('curarCamposReuniones_(') !== -1 && bloque.indexOf('curarCamposCampanas_(') !== -1,
    '⭐ y los llama a los dos por nombre');

  /* ⭐ El anclaje va por el preámbulo copiado, no por `anclarEncuentros` pelado. */
  afirmar(bloque.indexOf('anclarParaElAsistente_(') !== -1 && bloque.indexOf('anclarEncuentros(') === -1,
    '⭐⭐ y ancla por `anclarParaElAsistente_`, que copia el preámbulo de cachés de `generarInforme`');

  /* ⛔ La ventana se resuelve CON el período: sin él el anclaje no recorta y entran 12 en vez de 2. */
  afirmar(/resolverVentana\(\{ periodo_ref: ref \}\)/.test(bloque),
    '⛔ la ventana se resuelve con `periodo_ref` — sin él entran 12 encuentros en vez de 2');
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que `anclarEncuentros` ancle BIEN. Está falseado acá —abre cuatro planillas por');
console.log('     `openById`— y lo que se mide es qué hace el paso 3 con su resultado.');
console.log('   · ⛔ ELEGIR una cuenta para un `sin_link` sin fila en `ANCLAJE_PENDIENTE`. El motor');
console.log('     sólo registra fila en la rama de baja confianza, así que `panel_confirmarAnclaje`');
console.log('     no tiene dónde escribir. La pantalla lo DICE en vez de ofrecer un botón que falla.');
console.log('   · Los tiempos. Que el anclaje entre en la espera de una pantalla lo dice una corrida.');

process.exit(fallas === 0 ? 0 : 1);
