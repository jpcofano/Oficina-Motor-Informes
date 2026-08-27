#!/usr/bin/env node
/**
 * tools/probar-origen-en-traza.js — **el universo del marcador viaja pegado al número**
 * (`docs/Prompts/2026-08-26_2_corrida_nocturna_front.md`, Parte A).
 *
 * ⭐ **Qué se arregló, y por qué era barato.** Las **ocho** ramas de `datosDeMarcador_` ya
 * construían un `origen` largo y preciso —*«las 4 fila(s) de rdv/… de los encuentros del
 * TEMARIO»*, *«agregado global de digital/Directa IVR (sin id_cuenta; 59 fila(s) antes del
 * recorte)»*— **y nadie lo leía**. La **ventana** viajaba en la traza; el **universo**, no.
 *
 * ⚠ **El caso que lo justifica:** cuando `L-036` publicó el Recap de CABA con 2.463.980
 * habitantes, la traza decía `leerFuente(digital/…)` — el texto correcto, disponible— **y el
 * número salió igual**. Visibilidad no impide publicar; es lo único que permite diagnosticar
 * después.
 *
 * ⭐⭐ **Este banco cuenta CUÁNTAS ramas ejercita sobre ocho, y ése es el punto.** Un control que
 * prueba tres no distingue «las ocho andan» de «tres andan» — es la regla de `CLAUDE.md` §4:
 * *un control tiene que declarar cuánto midió; cero unidades es un problema, no un silencio*.
 *
 * ⚠ **Lo que verifica es el RUTEO y el CABLEADO del texto, no el número.** Que una rama diga de
 * qué filas salió no dice que las filas sean las correctas — eso se mira en un deck.
 *
 * Uso:
 *   node tools/probar-origen-en-traza.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let hechas = 0;
function afirmar(condicion, mensaje) {
  hechas++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/* ⚠ **Los `.gs` están en disco con CRLF** —medido: 5.665 de 5.665 en `Generador.gs`—, así que
 * todo parche de «romper a propósito» va por **fragmento de UNA línea**. Un patrón con un salto
 * de línea no matchea y el control correría sobre el código intacto dando verde: es el modo de
 * falla del 24/08, y por eso `contexto()` **exige** que la mutación haya ocurrido. */
function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} },

    // ── lo que sale de una hoja, y sólo eso ────────────────────────────────────────────────
    SOLAPA_MAESTRA_DIGITAL_: 'Seguimiento digital',
    SOLAPAS_CANAL_DIGITAL_: [
      { solapa: 'Digital', prefijo: 'dig' }, { solapa: 'Directa Mail', prefijo: 'dm' },
      { solapa: 'Directa SMS', prefijo: 'ds' }, { solapa: 'Directa IVR', prefijo: 'di' },
      { solapa: 'Alcance', prefijo: 'alc' }
    ],
    /* Sólo `m2/PorCuenta` declara cuenta: es lo que separa la rama declarativa (R7) de la
     * general (R8) sin tocar `rdv` ni `digital`, que tienen ramas propias más arriba. */
    campoIdCuentaDeSolapa_: (baseId, solapa) =>
      (baseId === 'm2' && solapa === 'PorCuenta' ? 'pc_id_cuenta' : ''),
    /* ⚠ La clave de cuenta y el campo del marcador caen en columnas DISTINTAS a propósito: con
     * la misma, el filtro por cuenta compararía el valor contra sí mismo y pasaría por azar. */
    buscarMapeo: (b, s, campo) => ({ ok: true, columna: campo === 'pc_id_cuenta' ? 'A' : 'C' }),
    claveDeLecturaEnColumna_: (b, s, col) => 'enc_' + col,
    encabezadoEnColumna_: (b, s, col) => 'enc_' + col,
    normalizarIdCuenta_: (v) => String(v == null ? '' : v).trim(),
    formatearFecha_: (d) => String(d || ''),
    filasDigitalDeEncuentro: (id) => (id === '3387'
      ? { sd_x: 1, dig_filas: [{ enc_C: 10 }, { enc_C: 20 }] }
      : null),
    leerFuente: () => ({ ok: true, filas: [
      { enc_A: '3387', enc_C: 7 }, { enc_A: '3387', enc_C: 9 }, { enc_A: '9999', enc_C: 1 }
    ] }),

    // ── lo que hace falta sólo para el bloque 2, que corre `resolverMarcadores` entero ──────
    memoRegistro_: () => [],
    resolverVentana: () => ({ ok: true, desde: '01/01', hasta: '07/01', origen: 'fixture' }),
    condicionesDeDimensiones_: () => ({ ok: true, condiciones: '' }),
    despacharOperacion_: () => ({ ok: true, valor: 42, traza: 'ULTIMO fixture' }),
    parsearFechaCelda_: () => null,
    operacionNecesitaCatalogo_: () => false,
    operacionNecesitaSeparador_: () => false,
    SEPARADOR_CONDICIONES_FILTRO_: 'Y'
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    /* ⛔ **La guarda del 24/08: si el parche no aplicó, NO hay «después».** Sin esto el caso
     * negativo corre sobre el código intacto, da verde, y eso se lee como «el negativo pasó». */
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  return ctx;
}

/** Corre `datosDeMarcador_` REAL y devuelve el resultado crudo. */
function rama(ctx, fila, solapa, opciones) {
  ctx.__f = Object.assign({ marcador: 't', campo_logico: 'c' }, fila);
  ctx.__s = solapa;
  ctx.__o = opciones || {};
  return vm.runInContext('datosDeMarcador_(__f, __s, {}, {}, __o)', ctx);
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Las OCHO ramas, cada una con lo mínimo que la dispara y en el orden en que el `if` las mira.
 * ⚠ El orden importa: R1 tapa a R2 si viene `fila_rdv`, y R3 tapa a R4-R6 si `claves_temario`
 *   matchea. Cada caso pasa **sólo** lo que su rama necesita.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
const RAMAS = [
  { n: 'R1 · rdv, la fila singular del encuentro',
    fila: { base_id: 'rdv' }, solapa: 'RVD JM-CM - ES',
    opciones: { fila_rdv: { enc_C: 5 }, hoja_rdv: 'RVD JM-CM - ES' },
    espera: /^la fila de rdv\// },

  { n: 'R2 · rdv, las filas del TEMARIO',
    fila: { base_id: 'rdv' }, solapa: 'RVD JM-CM - ES',
    opciones: { filas_rdv: [{ enc_C: 5 }, { enc_C: 6 }], hoja_rdv: 'RVD JM-CM - ES' },
    espera: /^las 2 fila\(s\) de rdv\/.*encuentros del TEMARIO/ },

  { n: 'R3 · el TEMARIO en una solapa que no es rdv',
    fila: { base_id: 'digital' }, solapa: 'Agenda JM | Post',
    opciones: {
      claves_temario: { 'digital|Agenda JM | Post': true },
      filas_temario: { 'digital|Agenda JM | Post': { filas: [{ enc_C: 1 }], califica: true, seccion_id: 's' } }
    },
    espera: /^las 1 fila\(s\) de digital\/.*encuentros del TEMARIO/ },

  { n: 'R4 · digital SIN id_cuenta, el agregado global',
    fila: { base_id: 'digital' }, solapa: 'Directa IVR', opciones: {},
    espera: /^agregado global de digital\/Directa IVR \(sin id_cuenta; 3 fila\(s\)/ },

  { n: 'R5 · digital por cuenta, la solapa maestra (plana)',
    fila: { base_id: 'digital' }, solapa: 'Seguimiento digital',
    opciones: { id_cuenta: '3387' },
    espera: /^union digital por cuenta \(.*dimensión\)/ },

  { n: 'R6 · digital por cuenta, una solapa de canal',
    fila: { base_id: 'digital' }, solapa: 'Digital',
    opciones: { id_cuenta: '3387' },
    espera: /^union digital por cuenta \(Digital, 2 fila\(s\) de la cuenta 3387\)/ },

  { n: 'R7 · la rama por cuenta declarativa (D-30)',
    fila: { base_id: 'm2' }, solapa: 'PorCuenta',
    opciones: { id_cuenta: '3387' },
    espera: /^rama por cuenta declarativa \(m2\/PorCuenta.*2 de 3 fila\(s\)/ },

  { n: 'R8 · la rama general, `leerFuente`',
    fila: { base_id: 'm2' }, solapa: 'Otra', opciones: {},
    espera: /^leerFuente\(m2\/Otra\)/ }
];

console.log('El `origen` de las ocho ramas y su llegada a la traza — código cargado de Generador.gs\n');

console.log('1 · ⭐ las OCHO ramas producen `origen`, y cada una el suyo');
let ejercitadas = 0;
{
  const ctx = contexto();
  const vistos = {};
  RAMAS.forEach((r) => {
    const res = rama(ctx, r.fila, r.solapa, r.opciones);
    const ok = res.ok === true && typeof res.origen === 'string' && res.origen.trim() !== '';
    afirmar(ok && r.espera.test(res.origen), r.n);
    if (ok) { ejercitadas++; vistos[res.origen] = (vistos[res.origen] || 0) + 1; }
  });

  /* ⭐ **El conteo es una afirmación, no una decoración.** Sin él, un caso que dejara de disparar
   * bajaría el alcance en silencio y las que quedan seguirían en verde. */
  afirmar(ejercitadas === 8,
    '⭐ se ejercitaron ' + ejercitadas + ' de 8 ramas — el `if` de `datosDeMarcador_` tiene ocho');

  /* ⚠ Y que los ocho textos sean DISTINTOS: ocho ramas que devolvieran el mismo `origen` pasarían
   * la afirmación de «no vacío» sin distinguir nada, que es el fixture que satisface dos cosas. */
  afirmar(Object.keys(vistos).length === 8,
    'y los ocho `origen` son textos DISTINTOS — si dos coincidieran, la traza no distinguiría');
}

console.log('\n2 · ⭐ y llega a `base.traza`, que es lo que se lee en FALTANTES');
{
  const ctx = contexto();
  ctx.__marc = [{
    marcador: 'tok', informe_id: 'jm', base_id: 'm2', solapa: 'Otra',
    campo_logico: 'c', operacion: 'ULTIMO', filtro: '', dimensiones: '', formato: ''
  }];
  vm.runInContext('memoRegistro_ = function () { return __marc; };', ctx);
  const r = vm.runInContext('resolverMarcadores("jm", {})', ctx);
  const uno = r.resultados[0];

  afirmar(uno && uno.estado === 'ok',
    'el marcador del fixture resuelve `ok` (si no, lo de abajo no mide nada)');
  afirmar(!!uno && /universo: leerFuente\(m2\/Otra\)/.test(uno.traza),
    '⭐ la traza dice `universo: leerFuente(m2/Otra)` — antes decía la ventana y no el universo');
  afirmar(!!uno && uno.origen_datos === 'leerFuente(m2/Otra)',
    'y viaja además en el campo propio `origen_datos`, sin obligar a parsear la traza');
  afirmar(!!uno && /\(fixture\)/.test(uno.traza),
    '⚠ y la ventana SIGUE en la traza — el campo se suma, no reemplaza');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⚠ Romper a propósito — y exigiendo el MOTIVO, no sólo el rojo
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · ⚠ los dos controles negativos');
{
  // 3.1 · sin el cableado en la traza, el bloque 2 cae — y sólo por eso.
  const ctx = contexto((t) => t.replace('      trazaOrigen +', '      // ROTO A PROPOSITO'));
  ctx.__marc = [{
    marcador: 'tok', informe_id: 'jm', base_id: 'm2', solapa: 'Otra',
    campo_logico: 'c', operacion: 'ULTIMO', filtro: '', dimensiones: '', formato: ''
  }];
  vm.runInContext('memoRegistro_ = function () { return __marc; };', ctx);
  const uno = vm.runInContext('resolverMarcadores("jm", {})', ctx).resultados[0];
  afirmar(!!uno && uno.estado === 'ok' && !/universo:/.test(uno.traza),
    'sacado `trazaOrigen` de la traza, el universo desaparece del texto — cae el aserto 2.2');
  afirmar(!!uno && uno.origen_datos === 'leerFuente(m2/Otra)',
    'y el campo propio sobrevive: son dos cableados distintos y el negativo distingue cuál rompió');
}
{
  /* 3.2 · ⭐ **el que de verdad importa: una rama que deja de setear `origen`.** Es el caso que
   * el prompt pide — «si una rama nueva no lo setea, tiene que ponerse rojo». Se muta la rama
   * general (R8), que es la que atiende a todo lo que no declara nada. */
  const ctx = contexto((t) => t.replace(
    "    origen: 'leerFuente(' + fila.base_id + '/' + solapa + ')' + avisoAgregadoDeclarado",
    "    origen: ''   // ROTO A PROPOSITO"));
  const res = rama(ctx, { base_id: 'm2' }, 'Otra', {});
  afirmar(res.ok === true && String(res.origen || '').trim() === '',
    '⭐ una rama sin `origen` se detecta — el aserto 1.R8 cae, y por el motivo correcto');
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.' : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Si las filas de cada rama son las CORRECTAS. Esto verifica que el universo se');
console.log('     DIGA, no que sea el que corresponde — eso se mira en un deck, contra la base.');
console.log('   · Los `return` de error posteriores a la lectura —dimensión, filtro, ratio,');
console.log('     catálogo— no suman el universo al TEXTO de la traza; sí llevan `origen_datos`.');
console.log('   · Que las ramas sigan siendo ocho. Si `datosDeMarcador_` gana una novena, el');
console.log('     aserto del conteo NO se entera: hay que agregarle su caso a `RAMAS`.');

process.exit(fallas === 0 ? 0 : 1);
