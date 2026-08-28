#!/usr/bin/env node
/**
 * tools/probar-temario-sin-filas.js — **cuando el temario no trae filas hay TRES salidas, no dos**
 * (`2026-08-27` Parte 3).
 *
 * ⛔⛔ **El P0 que cierra, abierto en `PENDIENTES` desde el 25/08.** Las dos ramas de
 * `datosDeMarcador_` que leen «las filas del TEMARIO» resolvían la misma condición **al revés**: la
 * de `post_*` fallaba con `«FALTA»` y la de `rdv` **se caía a la cadena general** — `rdv` entera
 * recortada por `figura=Jorge Macri` y la ventana, o sea el universo de la semana con forma de
 * acierto, sin fallar y sin avisar. Decisión del usuario del 27/08: **gana la que falla.**
 *
 * ⛔⛔ **Y la partición en TRES la impuso un dato del dominio, no un razonamiento.** El encuentro
 * del temario del 27/08 **no tuvo mail**. Con la regla de la rama de `post_*` aplicada al pie
 * —*declarada y sin filas → `FALTA`*— una caja sin mail publicaría `«FALTA»` sobre un hecho
 * perfectamente normal: la marca que grita cuando no hay nada que arreglar, que es como una marca
 * deja de significar algo.
 *
 * | caso | qué es | qué sale |
 * |---|---|---|
 * | `items === 0` | el temario no resolvió ni un encuentro | ⛔ `«FALTA:…@sin_temario»` |
 * | `items > 0`, `filas` vacío | hubo encuentros y ninguno tiene fila en esa solapa | **sin dato** |
 * | `filas` con algo | el universo del temario | el número |
 *
 * ⭐ **El control positivo comparte camino:** el caso con filas tiene que seguir devolviéndolas. Si
 * el instrumento dejara de ver, ése se cae primero.
 *
 * ⚠ **Lo que NO contesta:** qué publica el deck. Esto mide `datosDeMarcador_` —de qué filas sale el
 * número— y no el formateo ni el pintado. Que `SUMA` sobre cero filas dé «sin dato» y `CONTEO` dé
 * `0` es de `Marcadores.gs` y tiene sus propias afirmaciones.
 *
 * Uso:
 *   node tools/probar-temario-sin-filas.js
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

const SOLAPA_RDV = 'RVD JM-CM - ES';
const FILA_RDV = { Inscriptos: 138 };

/* El marcador: uno de los 21 de `rdv`, copiado de `MARCADORES` del 26/08. */
const MARCADOR = {
  marcador: 'ecv_inscriptos', base_id: 'rdv', solapa: SOLAPA_RDV,
  campo_logico: 'inscriptos', operacion: 'SUMA', dimensiones: 'ambito=jm'
};

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    /* La guarda de que la mutación ocurrió: sin esto el negativo corre sobre el código intacto. */
    if (texto === antes) return null;
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });

  ctx.buscarMapeo = () => ({ ok: true, columna: 'K' });
  ctx.claveDeLecturaEnColumna_ = () => 'Inscriptos';
  /* ⛔ La cadena general **tiene que ser distinguible**, y por eso devuelve una fila centinela con
   * un valor imposible: si alguna rama se cayera hasta acá, el `9999` aparece en el resultado y la
   * afirmación lo caza. Sin este centinela, «no cayó» y «no miré» se ven igual. */
  ctx.leerFuente = () => ({ ok: true, hoja: SOLAPA_RDV, filas: [{ Inscriptos: 9999 }],
    origen: 'la solapa entera por ventana' });
  ctx.aplicarFiltroDeMarcador_ = (filas) => ({ ok: true, filas: filas, traza: '' });
  ctx.condicionesDeDimensiones_ = () => ({ ok: true, condiciones: [] });
  /* Vacío = «esta solapa no se selecciona por cuenta», que es el estado real de
   * `rdv/RVD JM-CM - ES` en `SOLAPAS` y lo que hace que el vacío cayera a `leerFuente`. */
  ctx.campoIdCuentaDeSolapa_ = () => '';
  ctx.formatearFecha_ = (f) => f.toISOString().slice(0, 10);

  return ctx;
}

/* ⭐ El discriminador es el VALOR, no el texto del origen: la cadena general devuelve la fila
 * centinela de `leerFuente`, con 9999. Un control que matchee una cadena mide cómo se redactó el
 * mensaje; éste mide de qué filas salió el número, que es la pregunta. */
const cayoALaGeneral = (r) => r.ok === true && r.filas.length === 1 && r.filas[0].Inscriptos === 9999;

const pedir = (ctx, opciones) =>
  ctx.datosDeMarcador_(MARCADOR, SOLAPA_RDV, { desde: new Date(2026, 7, 21), hasta: new Date(2026, 7, 27) },
    {}, opciones);

/* La declaración tal como la arma la etapa 4. `aplica` sale de `CONFIG`, no del resultado. */
const declarado = (extra) => Object.assign({
  aplica: true, hoja: SOLAPA_RDV, seccion_id: 'ecv_alcance_semanal',
  filas: [], items: 0, sin_fila: 0, motivo: ''
}, extra || {});

console.log('\n═══ A · control positivo — con filas, sale el universo del temario ═══');
{
  const ctx = contexto();
  const r = pedir(ctx, {
    temario_rdv: declarado({ filas: [FILA_RDV], items: 1 }),
    filas_rdv: [FILA_RDV], hoja_rdv: SOLAPA_RDV
  });
  afirmar(r.ok === true, 'resuelve');
  afirmar(r.filas.length === 1 && r.filas[0] === FILA_RDV, 'y devuelve LA fila del temario');
  afirmar(/TEMARIO/.test(r.origen), 'el origen lo dice — es la rama plural, la que ya existía');
}

console.log('\n═══ B · ⭐ hubo encuentros y ninguno tiene fila — SIN DATO, no FALTA ═══');
{
  const ctx = contexto();
  const r = pedir(ctx, { temario_rdv: declarado({ items: 3, sin_fila: 3 }) });
  afirmar(r.ok === true, '⭐⭐ NO falla: tres encuentros sin fila en rdv es un hecho normal');
  afirmar(r.ok && r.filas.length === 0, 'y devuelve CERO filas — de ahí sale «sin dato»');
  afirmar(r.ok && /NINGUNO tiene fila/.test(r.origen),
    'el origen dice por qué, y nombra los 3 encuentros que sí resolvieron');
  afirmar(r.ok && !cayoALaGeneral(r),
    '⛔ y NO cayó a leer la solapa entera — que es lo que publicaba el universo de la semana');
}

console.log('\n═══ C · ⛔ el temario no resolvió nada — FALLA, y con el motivo adentro ═══');
{
  const ctx = contexto();
  const r = pedir(ctx, { temario_rdv: declarado({ items: 0, motivo: 'la sección "ecv_alcance_semanal" no califica: itera_sobre = "" y tiene que ser `REUNIONES`' }) });
  afirmar(r.ok === false, '⭐⭐ falla en vez de caerse al universo ancho');
  afirmar(!r.ok && /@sin_temario/.test(r.motivo), 'con la causa en el token, que es lo que llega a FALTANTES');
  afirmar(!r.ok && /itera_sobre/.test(r.motivo),
    '⭐ y el motivo REAL viaja adentro — no un «mirá el log», que se pierde con la ejecución');
  afirmar(!r.ok && /NO es «el encuentro no tuvo datos»/.test(r.motivo),
    'y dice explícitamente que esto no es el caso B, que es la confusión que costaría el diagnóstico');
}

console.log('\n═══ D · la declaración es de CONFIG, no del resultado ═══');
{
  const ctx = contexto();
  /* Sin declarar —`CONFIG` no nombra la sección— el temario no gobierna y la cadena general es el
   * comportamiento correcto. Es la mitad que hace que B y C signifiquen algo. */
  const r = pedir(ctx, { temario_rdv: declarado({ aplica: false, items: 0 }) });
  afirmar(cayoALaGeneral(r),
    '⭐ sin declarar, sigue por la cadena general — «declarada y sin filas» ≠ «no declarada»');
}

console.log('\n═══ E · otra solapa de rdv no la toca ═══');
{
  const ctx = contexto();
  const r = pedir(ctx, { temario_rdv: declarado({ hoja: 'OTRA SOLAPA', items: 0 }) });
  afirmar(cayoALaGeneral(r),
    'la guarda de solapa vale: el temario gobierna SU solapa y no todas las de la base');
}

console.log('\n═══ F · control negativo — sin la guarda, C se cae al universo ancho ═══');
{
  const ctx = contexto((t) => t.replace(
    'opciones.temario_rdv.hoja === solapa &&', 'false && opciones.temario_rdv.hoja === solapa &&'));
  if (!ctx) {
    fallas++;
    console.log('  ❌ ⛔ la mutación NO matcheó — el negativo habría corrido sobre el código intacto');
  } else {
    const r = pedir(ctx, { temario_rdv: declarado({ items: 0, motivo: 'x' }) });
    afirmar(cayoALaGeneral(r),
      '⛔ sin la guarda vuelve a leer la solapa entera — o sea que C mide ESA guarda');
  }
}

console.log('');
console.log(fallas === 0
  ? '✅ Las ' + pasadas + ' afirmaciones pasaron.'
  : '❌ ' + fallas + ' afirmación(es) fallaron sobre ' + (pasadas + fallas) + '.');
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Qué publica el deck. Esto mide de qué FILAS sale el número, no el formateo.');
console.log('   · La rama de `post_*`, que ganó la misma partición en tres el mismo día y la');
console.log('     cubre `probar-rediseno-l036.js`.');
console.log('   · ⛔ Si el temario de una semana real resuelve. Eso pide una corrida.');

process.exit(fallas === 0 ? 0 : 1);
