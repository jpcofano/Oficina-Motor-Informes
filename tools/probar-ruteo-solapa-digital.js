#!/usr/bin/env node
/**
 * tools/probar-ruteo-solapa-digital.js — **por dónde sale un marcador de `digital` según su solapa**
 * (`docs/Prompts/2026-08-21_15_digital_cede_a_D-30.md`, Parte B).
 *
 * ⭐ **Los tres asertos, no dos.** El bug que motivó el cambio se arregla con uno solo —que la
 * solapa que declara `campo_id_cuenta` llegue a la rama declarativa—, y ahí está la trampa: el
 * arreglo perezoso es sacar el fallo de una vez y dejar pasar todo. Por eso el tercer aserto es
 * que una solapa de `digital` que **no declara nada** SIGUE fallando con
 * `@solapa_digital_desconocida`. **Ceder y fallar son dos caminos distintos y los dos tienen que
 * seguir existiendo.**
 *
 * ⚠ **Esto verifica el RUTEO, no el número.** Que un `u1_` salga por la rama declarativa no dice
 * que su valor sea correcto — eso se ve en un deck, contra la base. Son dos afirmaciones y ésta
 * hace la primera.
 *
 * Uso:
 *   node tools/probar-ruteo-solapa-digital.js
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

/* Las cinco de canal, la maestra y la que declara — como las tiene `SOLAPAS` viva, medido en la
 * Parte A: exactamente UNA solapa de `digital` declara `campo_id_cuenta`, y ninguna de canal ni
 * la maestra lo declaran. Si eso cambia, este banco deja de describir el mundo y hay que volver
 * a decidir el `if` — no ajustar el fixture. */
const DECLARAN = { 'CAMPAÑAS_DESGLOCE_DIGITAL': 'des_id_cuenta' };

/**
 * Carga `datosDeMarcador_` REAL con las hojas falseadas.
 *
 * ⚠ **Las dependencias que se falsean viven todas FUERA de `Generador.gs`** —`Config.gs`,
 * `Union.gs`, `Fuentes.gs`—, así que sus stubs sobreviven a cargar el archivo. Una declarada
 * adentro pisaría el stub en silencio, que es como se perdió una medición antes — y acá pasó:
 * se habían escrito stubs de `filtrarFilasPorCuenta_` y `planDeLecturaPorCuenta_`, que **están
 * declaradas en `Generador.gs`**. Eran letra muerta. **Se sacaron, y el banco corre las reales**,
 * que es mejor: lo único falseado es lo que sale de una hoja.
 */
function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },
    SOLAPA_MAESTRA_DIGITAL_: 'Seguimiento digital',
    SOLAPAS_CANAL_DIGITAL_: [
      { solapa: 'Digital', prefijo: 'dig' }, { solapa: 'Directa Mail', prefijo: 'dm' },
      { solapa: 'Directa SMS', prefijo: 'ds' }, { solapa: 'Directa IVR', prefijo: 'di' },
      { solapa: 'Alcance', prefijo: 'alc' }
    ],
    campoIdCuentaDeSolapa_: (baseId, solapa) => (baseId === 'digital' ? (DECLARAN[solapa] || '') : ''),
    /* ⚠ La clave de cuenta y el campo del marcador tienen que caer en columnas DISTINTAS, o el
     * filtrado por cuenta compararía el valor contra sí mismo y pasaría por casualidad. */
    buscarMapeo: (b, s, campo) => ({ ok: true, columna: campo === 'des_id_cuenta' ? 'A' : 'C' }),
    normalizarIdCuenta_: (v) => String(v == null ? '' : v).trim(),
    encabezadoEnColumna_: (b, s, col) => 'enc_' + col,
    // La cuenta 3387 existe en la unión, con dos filas del canal `Digital`.
    filasDigitalDeEncuentro: (id) => (id === '3387'
      ? { sd_x: 1, dig_filas: [{ enc_C: 10 }, { enc_C: 20 }], alc_filas: [{ enc_C: 5 }] }
      : null),
    leerFuente: () => ({ ok: true, filas: [
      { enc_A: '3387', enc_C: 7 }, { enc_A: '3387', enc_C: 9 }, { enc_A: '9999', enc_C: 1 }
    ] }),
    // La clave de caché la arma `claveCacheLectura_`, que SÍ vive en `Generador.gs`: no se falsea
    // esa —el stub se perdería— sino la hoja de fechas que usa.
    formatearFecha_: (d) => String(d || '')
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    // ⛔ Si el parche no matchea, se dice — no se mide un verde falso.
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  return ctx;
}

/** Corre `datosDeMarcador_` sobre una solapa y devuelve el resultado crudo. */
function ruta(ctx, solapa, idCuenta) {
  ctx.__f = { marcador: 't', base_id: 'digital', solapa: solapa, campo_logico: 'c' };
  ctx.__s = solapa;
  ctx.__o = idCuenta ? { id_cuenta: idCuenta } : {};
  return vm.runInContext('datosDeMarcador_(__f, __s, {}, {}, __o)', ctx);
}

console.log('Ruteo por solapa dentro de `digital` — código cargado de Generador.gs\n');

console.log('1 · ⭐ los tres caminos, con `id_cuenta` presente');
{
  const ctx = contexto();

  const canal = ruta(ctx, 'Digital', '3387');
  afirmar(canal.ok && /^union digital por cuenta/.test(canal.origen),
    'una solapa de CANAL va a la unión del Paso 2.4');

  const declarativa = ruta(ctx, 'CAMPAÑAS_DESGLOCE_DIGITAL', '3387');
  afirmar(declarativa.ok && /^rama por cuenta declarativa/.test(declarativa.origen),
    'una solapa que DECLARA `campo_id_cuenta` va a la rama declarativa (D-30) — ' +
    'era el bug: salía «@solapa_digital_desconocida»');

  /* ⚠ El tercero es el que no se puede saltear: sin él, «ceder» y «no fallar nunca» dan igual. */
  const muda = ruta(ctx, 'Una Solapa Nueva', '3387');
  afirmar(muda.ok === false && /@solapa_digital_desconocida/.test(muda.motivo),
    'y una solapa que NO declara nada SIGUE fallando con `@solapa_digital_desconocida`');
}

console.log('\n2 · el `origen` distingue «salió bien» de «salió plausible»');
{
  const ctx = contexto();
  const r = ruta(ctx, 'CAMPAÑAS_DESGLOCE_DIGITAL', '3387');
  afirmar(/des_id_cuenta` = "3387"/.test(r.origen),
    'el `origen` nombra el campo declarado y la cuenta');
  afirmar(/2 de 3 fila\(s\)/.test(r.origen),
    'y dice cuántas filas quedaron de cuántas — 2 de 3, no las 3');
  afirmar(r.filas.length === 2, 'y devuelve esas 2 filas, no la solapa entera');
}

console.log('\n3 · lo que el cambio NO tocó');
{
  const ctx = contexto();

  const maestra = ruta(ctx, 'Seguimiento digital', '3387');
  afirmar(maestra.ok && /dimensión/.test(maestra.origen),
    'la maestra sigue por su rama plana — el `if` está DESPUÉS de su guarda');

  const sinCuenta = ruta(ctx, 'Digital', null);
  afirmar(sinCuenta.ok && /^agregado global de digital/.test(sinCuenta.origen),
    '`digital` sin `id_cuenta` sigue publicando el agregado global');

  /* ⛔ **HALLAZGO, y salió de un rojo de este mismo control — no se ajustó el fixture.**
   *
   * La afirmación escrita primero fue *"la que declara, emitida SIN ítem, cae al agregado **con el
   * aviso** del 19/08"*, que es lo que dice A.4 y lo que la Parte C.2 iba a citar como la
   * contención del riesgo. **Es falso para las solapas de `digital`**, y por una razón de orden:
   * el aviso `avisoAgregadoDeclarado` vive en la **rama declarativa**, y la rama de `digital` la
   * atrapa antes con su propio `if (!idCuenta)` — que devuelve su `origen` **sin aviso**.
   *
   * ⚠ **La cesión de la Parte B no lo arregla ni pretende hacerlo:** está después, y la regla 3
   * del prompt dice explícitamente que el agregado global de `digital` sin `id_cuenta` **no se
   * toca**. Se deja como está y **se anota**: la Parte C lo registra como riesgo abierto, y con un
   * agravante que no estaba escrito — para esta solapa el riesgo **no tiene la contención que A.4
   * daba por existente**.
   *
   * Este aserto fija el comportamiento REAL de hoy. Si algún día se agrega el aviso, este control
   * se pone rojo, y eso es exactamente lo que tiene que pasar. */
  const declaraSinItem = ruta(ctx, 'CAMPAÑAS_DESGLOCE_DIGITAL', null);
  afirmar(declaraSinItem.ok && /^agregado global de digital/.test(declaraSinItem.origen) &&
    !/AGREGADO GLOBAL de todas las cuentas/.test(declaraSinItem.origen),
    '⛔ y la que declara, emitida SIN ítem, cae al agregado — pero SIN el aviso del 19/08: ' +
    'lo atrapa la rama de `digital` antes de la declarativa (hallazgo, riesgo abierto)');
}

console.log('\n4 · ⚠ romper a propósito: sin la cesión vuelve el bug');
{
  const ctx = contexto((t) => t.replace(
    'if (!canal && campoIdCuentaDeSolapa_(fila.base_id, solapa)) {',
    'if (false) {   // ROTO A PROPÓSITO'));
  const r = ruta(ctx, 'CAMPAÑAS_DESGLOCE_DIGITAL', '3387');
  afirmar(r.ok === false && /@solapa_digital_desconocida/.test(r.motivo),
    'anulada la cesión, la solapa que declara vuelve a fallar — el aserto 1.2 cae');
}

console.log('');
console.log(fallas === 0 ? '✅ Todas las afirmaciones pasaron.' : '❌ ' + fallas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si los 24 `u1_` publican el número correcto. Esto fija el RUTEO; el valor sale');
console.log('     de la base y se mira en el deck.');
console.log('   · Si `SOLAPAS` sigue teniendo UNA sola solapa de `digital` que declara. El fixture');
console.log('     copia lo medido el 21/08; si la hoja cambia, hay que volver a decidir el `if`.');

process.exit(fallas === 0 ? 0 : 1);
