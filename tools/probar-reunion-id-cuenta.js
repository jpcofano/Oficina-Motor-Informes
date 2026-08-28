#!/usr/bin/env node
/**
 * tools/probar-reunion-id-cuenta.js — **`REUNIONES.id_cuenta`: la cuenta declarada gana, y la
 * que el anclaje deduce queda escrita** (`2026-08-27` Parte 0-bis).
 *
 * ⚠ **No confundir con `tools/probar-id-cuenta-declarada.js`**, que es el control de `X-39`:
 * aquél verifica que `SOLAPAS.campo_id_cuenta` resuelva en `MAPEO`; éste, la columna nueva de
 * `REUNIONES`. Dos cosas distintas con nombres parecidos — la familia de *dos cosas que se llaman
 * igual no son la misma cosa* (`CLAUDE.md` §4).
 *
 * ⛔ **El hueco que cierra, medido el 27/08 sobre las cuatro hojas operativas y las once de
 * registro:** un encuentro que anclaba bien **no dejaba rastro en ninguna hoja**. La cuenta vivía
 * en el `Logger.log` de la corrida y en el `porItem` en memoria, y las dos cosas mueren con la
 * ejecución. La asimetría era al revés de lo útil: un `sinLink` queda con nombre y motivo en
 * `ANCLAJE_MEDICION.sin_link_detalle`, uno de baja confianza queda con sus tres candidatos en
 * `ANCLAJE_PENDIENTE`, **y el que acierta no quedaba en ningún lado**.
 *
 * ⭐ **El precedente es `CAMPANAS.id_cuenta`** —ahí la cuenta se declara en la fila y no hay
 * anclaje que correr—, y el mecanismo de «declarado gana» **ya existía** para reuniones
 * (`anclajeYaConfirmado_`), sólo que llaveado contra `ANCLAJE_PENDIENTE`: alcanzaba a las
 * **dudosas** y no a las que anclaban bien. Esto lo empareja.
 *
 * ⭐⭐ **El discriminador del caso B, que es lo que lo hace un control y no una ilustración:** el
 * matcher stubeado devuelve **otra** cuenta distinta de la declarada. Si la rama nueva no
 * existiera, el ítem saldría con la del matcher — así que la afirmación no puede pasar por
 * casualidad. Es lo que `Pruebas.gs:456` enseña: un fixture cuyo dato satisface más de una
 * afirmación no distingue entre ellas.
 *
 * ⚠ **Lo que este control NO contesta:** si la escritura llega a la hoja. `curarCamposReuniones_`
 * está stubeado —acá se mide **qué se le manda**, no qué escribe Sheets—. Que la celda quede
 * poblada lo dice una corrida.
 *
 * Uso:
 *   node tools/probar-id-cuenta-declarada.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let pasadas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) { pasadas++; console.log('  ✅ ' + mensaje); }
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/* La cuenta que el MATCHER elegiría, distinta de la declarada a propósito: es el discriminador. */
const CUENTA_MATCHER = '3555-AGOMATCH';
const CUENTA_DECLARADA = '3499-AGODECLA';
const CUENTA_FLOJA = '3477-AGOFLOJA';

/**
 * Las tres reuniones. Copiadas de la forma que devuelve `leerReuniones_` —la fila entera de la
 * hoja—, con `texto_original` poblado, que es la clave de escritura (`D-46`).
 */
function reunionesFixture() {
  return [
    { periodo_id: 'agosto_21_27', orden: 1, eje: 'JM', tipo: 'Uno a uno', nombre: 'Coghlan',
      fecha: new Date(2026, 7, 21), etapa: '', mostrar: 'sí', id_cuenta: '',
      texto_original: 'Uno a uno en Coghlan (21/08)', notas: '' },
    { periodo_id: 'agosto_21_27', orden: 2, eje: 'JM', tipo: 'Uno a uno', nombre: 'Boedo',
      fecha: new Date(2026, 7, 22), etapa: '', mostrar: 'sí', id_cuenta: CUENTA_DECLARADA,
      texto_original: 'Uno a uno en Boedo (22/08)', notas: '' },
    { periodo_id: 'agosto_21_27', orden: 3, eje: 'JM', tipo: 'Encuentro Temático', nombre: 'Salud',
      fecha: new Date(2026, 7, 23), etapa: '', mostrar: 'sí', id_cuenta: '',
      texto_original: 'Encuentro Temático Salud (23/08)', notas: '' }
  ];
}

/**
 * Monta `Union.gs` y stubea **plataforma y dependencias de otros módulos**, no la lógica que se
 * mide: el reparto en las tres listas, la resolución de `declarada` y el armado de lo que se manda
 * a escribir corren de verdad. `normalizarIdCuenta_` también es el real.
 */
function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },
    Utilities: { formatDate: (f) => f.toISOString().slice(0, 10) },
    Session: { getScriptTimeZone: () => 'UTC' },
    SpreadsheetApp: { flush: () => {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    /* ⭐ La guarda de que la mutación ocurrió (`CLAUDE.md` §4): si el patrón no matchea, el caso
     * negativo corre sobre el código intacto y su verde no significa nada. Falla, no se saltea. */
    if (texto === antes) return null;
  }
  vm.runInContext(texto, ctx, { filename: 'Union.gs' });

  ctx.escrituras = [];

  ctx.verificarPrecondicionAnclaje_ = () => ({ ok: true });
  ctx.leerReuniones_ = () => reunionesFixture();
  ctx.reunionesOcultasPorMostrar_ = () => [];
  ctx.reunionesSinTextoOriginal_ = () => [];
  ctx.periodosQueDescribenLaVentana_ = () => [];
  ctx.unirDigitalPorCuenta = () => ({
    ok: true,
    porCuenta: {
      [CUENTA_MATCHER]: { sd_campana_digital: 'JM | campaña del matcher' },
      [CUENTA_DECLARADA]: { sd_campana_digital: 'JM | campaña declarada' }
    }
  });
  ctx.catalogoBarriosDesdeBase_ = () => ({ barrios: [] });
  ctx.anioDefectoDesdeVentana_ = () => 2026;
  ctx.parsearNombreCampana_ = () => ({});
  ctx.umbralAnclajeReunion_ = () => 0.6;
  ctx.obtenerHojaAnclajePendiente_ = () => ({});
  ctx.indiceAnclajePendiente_ = () => ({});
  ctx.anclajeYaConfirmado_ = () => '';
  ctx.encontrarFilaRdvDeReunion_ = (r) => ({ ok: true, fila: { Barrio: r.nombre }, hoja: 'RVD JM-CM - ES' });
  ctx.buscarMapeo = () => ({ ok: true, columna: 'Barrio' });
  ctx.valorPorColumna_ = (fila, b, h, col) => fila[col];
  ctx.normalizar_ = (s) => (s || '').toString().toLowerCase().trim();
  ctx.parsearFechaCelda_ = (v) => (v instanceof Date ? v : new Date(2026, 7, 21));
  ctx.registrarAnclajePendiente_ = () => {};
  ctx.registrarMedicionAnclaje_ = () => {};

  /* El matcher: elige `CUENTA_MATCHER` con puntaje alto, salvo para «Salud», que queda por debajo
   * del umbral. Así el fixture tiene los tres repartos a la vez. */
  ctx.anclarEnDosPasos_ = (candidatos, fecha, umbral, score) => {
    const flojo = fecha && fecha.getDate() === 23;
    const mejor = flojo
      ? { idCuenta: CUENTA_FLOJA, nombreCampana: 'JM | floja', registro: {} }
      : { idCuenta: CUENTA_MATCHER, nombreCampana: 'JM | campaña del matcher', registro: {} };
    return { mejor: mejor, score: flojo ? 0.41 : 0.92, pasaUmbral: !flojo, ambiguo: false,
      paso: 1, candidatos_paso1: candidatos.length, top3: [] };
  };

  /* ⭐ El espía. Se mide **qué se le manda al escritor**, que es la frontera de esta parte: lo que
   * Sheets haga con eso es de la corrida. */
  ctx.curarCamposReuniones_ = (cambios) => {
    ctx.escrituras.push(...cambios);
    return { ok: true, aplicados: cambios, sin_fila: [], cambios_escritos: cambios.length };
  };

  return ctx;
}

const correr = (ctx) => ctx.anclarEncuentrosSinCache_({ desde: new Date(2026, 7, 21), hasta: new Date(2026, 7, 27), origen: 'ventana' });

console.log('\n═══ A · control positivo — la que NO declara se ancla como siempre ═══');
{
  const ctx = contexto();
  const r = correr(ctx);
  afirmar(r.ok === true, 'el anclaje devuelve ok');
  const coghlan = r.encuentros.filter((e) => e.reunion === 'Coghlan')[0];
  afirmar(!!coghlan, 'Coghlan entra como encuentro anclado');
  afirmar(!!coghlan && coghlan.idCuenta === CUENTA_MATCHER,
    'y su cuenta es la que dedujo el matcher (' + (coghlan && coghlan.idCuenta) + ')');
  afirmar(!!coghlan && !coghlan.declaradaEnHoja,
    'sin marca de declarada — no pasó por la rama nueva');
}

console.log('\n═══ B · lo nuevo — la cuenta DECLARADA gana sobre la deducida ═══');
{
  const ctx = contexto();
  const r = correr(ctx);
  const boedo = r.encuentros.filter((e) => e.reunion === 'Boedo')[0];
  afirmar(!!boedo, 'Boedo entra como encuentro anclado');
  afirmar(!!boedo && boedo.idCuenta === CUENTA_DECLARADA,
    '⭐⭐ su cuenta es la DECLARADA (' + (boedo && boedo.idCuenta) + '), no la del matcher (' +
    CUENTA_MATCHER + ') — el matcher habría elegido otra, así que esto no pasa por casualidad');
  afirmar(!!boedo && boedo.score === 1, 'con score 1, como el confirmado a mano');
  afirmar(!!boedo && boedo.declaradaEnHoja === true, 'y marcada como declarada en la hoja');
}

console.log('\n═══ C · la que se dedujo QUEDA ESCRITA, y la declarada no se pisa ═══');
{
  const ctx = contexto();
  correr(ctx);
  afirmar(ctx.escrituras.length === 1,
    '⭐ se manda a escribir UNA sola fila (' + ctx.escrituras.length + ')');
  const e = ctx.escrituras[0] || {};
  afirmar(e.texto_original === 'Uno a uno en Coghlan (21/08)',
    'y es la de Coghlan, por clave `texto_original`');
  afirmar(e.id_cuenta === CUENTA_MATCHER, 'con la cuenta que resolvió el anclaje');
  afirmar(!ctx.escrituras.some((x) => x.id_cuenta === CUENTA_DECLARADA),
    '⭐ la DECLARADA no se manda a escribir — no se pisa lo que ya está');
}

console.log('\n═══ D · la frontera — una de BAJA CONFIANZA no se declara ═══');
{
  const ctx = contexto();
  const r = correr(ctx);
  afirmar(r.bajaConfianza.length === 1 && r.bajaConfianza[0].reunion === 'Salud',
    'Salud queda en bajaConfianza (puntaje 0.41 < 0.6)');
  afirmar(!ctx.escrituras.some((x) => x.id_cuenta === CUENTA_FLOJA),
    '⭐⭐ y su cuenta NO se escribe: declarar una cuenta que el motor considera dudosa ' +
    'convertiría una duda en un hecho');
}

console.log('\n═══ E · control negativo — sin la rama nueva, la declarada se pierde ═══');
{
  const ctx = contexto((t) => t.replace('} else if (declarada) {', '} else if (false) {'));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación de la rama NO matcheó — el negativo habría corrido intacto');
  } else {
    const boedo = correr(ctx).encuentros.filter((e) => e.reunion === 'Boedo')[0];
    afirmar(!!boedo && boedo.idCuenta === CUENTA_MATCHER,
      '⛔ sin la rama, Boedo sale con la cuenta del matcher — o sea que B mide ESA rama');
  }
}

console.log('\n═══ F · control negativo — sin la línea, no se escribe nada ═══');
{
  const ctx = contexto((t) => t.replace('if (!declarada && reunion.texto_original) {', 'if (false) {'));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación de la escritura NO matcheó — el negativo habría corrido intacto');
  } else {
    correr(ctx);
    afirmar(ctx.escrituras.length === 0,
      '⛔ sin la línea no se manda nada a escribir — o sea que C mide ESA línea');
  }
}

console.log('\n═══ G · la columna está DECLARADA, y sin pisar la que ya estaba ═══');
{
  /* ⛔ `2026-08-27` — esta sección existe por un error cometido el mismo día: se agregó un
   * `REUNIONES: [{ id_cuenta }]` a `COLUMNAS_DELTA_` **sin grepear**, y esa clave **ya existía**
   * con `periodo_id`. En un objeto literal la segunda pisa a la primera **en silencio**, así que
   * el delta viejo desaparecía y `instalar()` dejaba de asegurar `periodo_id`. La entrada correcta
   * es una sola clave con las **dos** columnas. */
  const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');

  const iDelta = INSTALAR.indexOf('var COLUMNAS_DELTA_');
  const iReu = INSTALAR.indexOf('\n  REUNIONES: [', iDelta);
  const bloque = iReu === -1 ? '' : INSTALAR.slice(iReu, INSTALAR.indexOf('],', iReu));
  afirmar(iReu !== -1, 'COLUMNAS_DELTA_ tiene entrada para REUNIONES');
  afirmar(bloque.indexOf("nombre: 'id_cuenta'") !== -1,
    '⭐ declara `id_cuenta` — sin esto la columna nunca entra a la hoja y la escritura no tiene dónde ir');
  afirmar(bloque.indexOf("nombre: 'periodo_id'") !== -1,
    '⭐⭐ y sigue declarando `periodo_id`: la entrada nueva se FUSIONÓ, no pisó la que ya estaba');

  afirmar(INSTALAR.indexOf("'texto_original', 'id_cuenta', 'notas'") !== -1,
    'y `HOJAS_CONFIG_.REUNIONES.headers` la pone antes de `notas`, que es la convención de la hoja');
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si la celda queda poblada en la hoja. `curarCamposReuniones_` está stubeado:');
console.log('     se mide qué se le manda, no qué escribe Sheets. Eso lo dice una corrida.');
console.log('   · Si la columna `id_cuenta` existe en la hoja viva. Eso lo aplica `instalar()`');
console.log('     por `COLUMNAS_DELTA_.REUNIONES`, y hasta que corra la escritura no tiene dónde ir.');
console.log('   · ⛔ Si la cuenta declarada es la CORRECTA. Una mal anclada que se escribe queda');
console.log('     congelada — visible y corregible en la celda, que es lo que antes no pasaba.');

process.exit(fallas === 0 ? 0 : 1);
