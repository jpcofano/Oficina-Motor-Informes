#!/usr/bin/env node
/**
 * tools/probar-cuenta-de-campana.js — **la cuenta de la campaña llega a donde el consumidor la
 * busca** (`docs/Prompts/Addendum_2026-08-22_Paso-20_tras_parte_0.md`, §1).
 *
 * ⛔ **El bug que fija, y por qué ninguna afirmación existente lo tocaba.** `itemsDeSeccion_`
 * ponía `id_cuenta` en el ítem de campaña **como hermano de `opciones`**, y la rama por cuenta de
 * `datosDeMarcador_` lee **`opciones.id_cuenta`**. Entre los dos hay un copiado que se lleva
 * **sólo `asignacion.item.opciones`** (`Generador.gs`, la pasada por ítem), así que el hermano
 * nunca viajaba. **El productor llenaba un campo y el consumidor leía otro, y ninguno fallaba.**
 *
 * **La consecuencia publicada:** los ocho `camp_*` de `looker/resumen_metricas_dinamico` leyeron
 * el agregado global de todas las cuentas. En `jm-20260821-234927` `ULTIMO` se negó a elegir entre
 * 160 / 507 / 12.985 / 14.040 / 84.325 / 103.639 — **la guarda de `ULTIMO` es lo único que evitó
 * publicar un número plausible.**
 *
 * ⭐ **La afirmación que faltaba, y es la del medio:** no alcanza con que el ítem *tenga* la
 * cuenta. Hay que afirmar que **sobrevive al copiado**, porque ése era el eslabón que la perdía.
 * Por eso este banco reproduce ese copiado —una línea— en vez de mirar sólo el ítem.
 *
 * ⚠ **Lo que NO prueba:** que `datosDeMarcador_` tome la rama por cuenta, ni que el número que
 * publique sea el correcto. Eso sale de una corrida y se verifica **contra el deck del equipo**,
 * que ya está con su `sha256` en `docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md`.
 *
 * Uso:
 *   node tools/probar-cuenta-de-campana.js
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

/**
 * ⭐ **El copiado real, extraído del código y no reescrito.** Es la línea que perdía la cuenta:
 * `opcionesItem` copia **sólo** `asignacion.item.opciones`. Se saca de `Generador.gs` para que el
 * día que alguien la cambie, este banco mida la nueva y no una copia envejecida — que es
 * exactamente el error del fixture deducido en vez de copiado (`CLAUDE.md` §4).
 */
function copiadoRealDeOpciones() {
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const m = texto.match(/var opcionesItem = \{\};[\s\S]{0,200}?\}\);/);
  if (!m) throw new Error('No se encontró el copiado de `opcionesItem` en Generador.gs.');
  return m[0];
}

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: function () {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });

  /* ⛔ `2026-08-31_3` Parte B — **hay que cargar `Union.gs` también, y este banco lo descubrió
   * poniéndose ROJO.** La rama `CAMPANAS` pasó a llamar `periodosDeLaCorrida_`, que vive allá, y
   * con un solo archivo cargado tiraba `ReferenceError` en la sección A.
   *
   * ⭐ **Cargar los dos es además más fiel:** Apps Script concatena todos los `.gs` en un único
   * scope global, así que un banco que carga uno solo está midiendo un mundo que no existe. El
   * parche de «romper a propósito» sigue aplicándose **sólo a `Generador.gs`**, que es donde vive
   * la línea que muta. */
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8'), ctx, { filename: 'Union.gs' });
  return ctx;
}

/* Las dos campañas reales de `agosto_14_20`, copiadas de `CAMPANAS` viva el 22/08 — no
 * inventadas. La segunda es la que el equipo publica como campaña destacada de la semana. */
const CAMPANAS_VIVAS = [
  {
    periodo_id: 'agosto_14_20', campana_id: '3481-AGOINFAN', nombre: 'Autódromo: avance de obra',
    informe_id: 'jm', base_id: 'digital', tipo: 'destacada', mostrar: 'sí',
    id_cuenta: '3481-AGOINFAN', orden: 1
  },
  {
    periodo_id: 'agosto_14_20', campana_id: '3509-AGOSEGGJ',
    nombre: 'Desarticulación de banda narco en el Barrio Mugica',
    informe_id: 'jm', base_id: 'digital', tipo: 'destacada', mostrar: 'sí',
    id_cuenta: '3509-AGOSEGGJ', orden: 2
  },
  // ⚠ Una campaña **sin** cuenta: el caso que separa «pone la clave siempre» de «la pone cuando
  // hay dato». Sin ella, un `id_cuenta: ''` pasaría las dos afirmaciones por igual.
  {
    periodo_id: 'agosto_14_20', campana_id: 'sin_cuenta', nombre: 'Campaña sin cuenta',
    informe_id: 'jm', base_id: 'digital', tipo: 'destacada', mostrar: 'sí',
    id_cuenta: '', orden: 3
  }
];

const SECCION = { seccion_id: 'campana', itera_sobre: 'CAMPANAS', filtro: '' };

function itemsDeCampana(ctx) {
  ctx.leerCampanas = () => CAMPANAS_VIVAS;
  ctx.__s = SECCION;
  return vm.runInContext('itemsDeSeccion_(__s, "jm", null)', ctx);
}

console.log('\n═══ A · la cuenta entra DENTRO de opciones ═══');
{
  const ctx = contexto();
  const r = itemsDeCampana(ctx);
  afirmar(r.ok === true, 'la rama CAMPANAS devuelve ok');
  afirmar(r.items.length === 3, 'salen las tres campañas (' + r.items.length + ')');

  const narco = r.items.filter((i) => i.clave === '3509-AGOSEGGJ')[0];
  afirmar(!!narco, 'está la campaña destacada del equipo');
  afirmar(narco.opciones.id_cuenta === '3509-AGOSEGGJ',
    '⭐ `opciones.id_cuenta` viene puesta — es donde `datosDeMarcador_` la busca');
  /* ⚠ El hermano se conserva a propósito: lo lee el reporte `porItem`
   * (`id_cuenta: asignacion.item.id_cuenta`), grepeado el 22/08 y único. */
  afirmar(narco.id_cuenta === '3509-AGOSEGGJ',
    'y el hermano sigue ahí — lo lee el reporte por ítem, que es otro consumidor');

  const sin = r.items.filter((i) => i.clave === 'sin_cuenta')[0];
  /* Una campaña sin cuenta **no** debe traer la clave: es lo que hace que caiga a la rama general
   * en vez de a una rama por cuenta con la cuenta vacía. Calca `if (e.idCuenta)` de `REUNIONES`. */
  afirmar(!('id_cuenta' in sin.opciones),
    'una campaña SIN cuenta no lleva la clave en `opciones` — cae a la rama general');
  afirmar(sin.id_cuenta === '',
    'y su hermano queda vacío, que es lo que el reporte por ítem tiene que mostrar');
}

console.log('\n═══ B · ⭐ y sobrevive al copiado, que es el eslabón que la perdía ═══');
{
  const ctx = contexto();
  const r = itemsDeCampana(ctx);
  const narco = r.items.filter((i) => i.clave === '3509-AGOSEGGJ')[0];

  // El copiado real de `Generador.gs`, corriendo sobre este ítem.
  const sub = { console, Object, asignacion: { item: narco } };
  vm.createContext(sub);
  vm.runInContext(copiadoRealDeOpciones() + '\nglobalThis.__salida = opcionesItem;', sub);
  const copiado = sub.__salida;

  afirmar(copiado.id_cuenta === '3509-AGOSEGGJ',
    '⭐ la cuenta SOBREVIVE al copiado que alimenta a `resolverMarcadores`');
  afirmar(copiado.campana === '3509-AGOSEGGJ' && copiado.periodo_id === 'agosto_14_20',
    'y lo que ya viajaba sigue viajando — no se rompió nada de lo que andaba');
}

console.log('\n═══ C · la rama REUNIONES no se tocó ═══');
{
  /* ⛔ El arreglo NO cambia el consumidor, y esto lo fija: `REUNIONES` ya ponía la cuenta adentro
   * de `opciones` y funciona. Mover el consumidor habría roto lo que anda para arreglar lo que
   * no — se afirma sobre el fuente porque ejecutar esa rama pide anclaje, unión y planilla. */
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  afirmar(/if \(e\.idCuenta\) opciones\.id_cuenta = e\.idCuenta;/.test(texto),
    'la rama REUNIONES sigue poniendo la cuenta dentro de `opciones`, sin cambios');
  afirmar(/var idCuentaItem = opciones && opciones\.id_cuenta;/.test(texto),
    'y el consumidor sigue leyendo `opciones.id_cuenta` — no se movió');
}

console.log('\n═══ D · ⚠ romper a propósito: volver a dejarla como hermana ═══');
{
  let dentro = null;
  try {
    const ctx = contexto((t) => t.replace(
      'if (cuentaCampana) opcionesCampana.id_cuenta = cuentaCampana;',
      '/* ROTO A PROPÓSITO: la cuenta vuelve a quedar sólo como hermana */'));
    const r = itemsDeCampana(ctx);
    const narco = r.items.filter((i) => i.clave === '3509-AGOSEGGJ')[0];

    const sub = { console, Object, asignacion: { item: narco } };
    vm.createContext(sub);
    vm.runInContext(copiadoRealDeOpciones() + '\nglobalThis.__salida = opcionesItem;', sub);
    dentro = sub.__salida.id_cuenta;
  } catch (e) {
    fallas++; console.log('  ❌ el parche falló: ' + e.message);
  }
  /* ⭐ Éste es el bug tal como estaba: el ítem **tenía** la cuenta y el copiado la perdía. Si esta
   * afirmación no se pusiera roja, la sección B no estaría midiendo nada. */
  afirmar(dentro === undefined,
    'sin la línea, la cuenta NO sobrevive al copiado — es exactamente el bug del 22/08');
}

/* ⭐⭐ `2026-08-31_3` Parte B — **el `null` de este banco pasa de accidente a DECISIÓN.**
 *
 * ⛔ Desde hoy la rama `CAMPANAS` **filtra por versión del informe** (`D-53`). Este banco llama
 * `itemsDeSeccion_(__s, "jm", null)` y sus tres campañas **siguen saliendo las tres** — porque con
 * una ventana sin `origen` el filtro no corre. **Eso es correcto y deliberado**, pero mientras no
 * estuviera afirmado era indistinguible de un banco que dejó de medir sin que nadie se enterara:
 * la familia del testigo insensible, un control que no distingue el antes del después.
 *
 * ⚠ **Este banco NO se migra a una ventana con `origen`, y es a propósito:** mide **dónde va la
 * cuenta**, no el período, y sus tres fixtures son de `agosto_14_20`. Ponerle una ventana lo
 * obligaría a mantener dos cosas a la vez. **El control del período vive en su banco propio**,
 * `tools/probar-seleccion-por-version.js` — lo nuevo va aparte, no aflojando lo viejo. */
{
  console.log('\n═══ E · el `null` de arriba significa «sin filtro por período», y se afirma ═══');
  const ctx = contexto();
  const r = itemsDeCampana(ctx);
  afirmar(r.items.length === 3,
    '⭐ con ventana `null` NO se filtra por período — las tres salen (D-53 no aplica sin `origen`)');
  afirmar(r.periodo_id === '',
    '   y el retorno lo declara: `periodo_id` vacío = no se filtró. Antes ni devolvía el campo.');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si `datosDeMarcador_` toma la rama por cuenta. Eso pide una corrida.');
console.log('   · Si el número publicado es el CORRECTO. Se verifica contra el deck del equipo,');
console.log('     que ya está con su sha256 en docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md.');
console.log('   · ⛔ Si `ULTIMO` sigue dando `@ultimo_ambiguo` después del cambio: eso significaría');
console.log('     que la solapa tiene varias filas por cuenta y fecha, que es OTRO problema.');

process.exit(fallas === 0 ? 0 : 1);
