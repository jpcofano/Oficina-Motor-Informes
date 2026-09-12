#!/usr/bin/env node
/**
 * `tools/probar-r05-primer-envio.js` — **`R-05`: el ámbito de una campaña sale de su PRIMER
 * ENVÍO, el corte es positivo, y el empate ABORTA.** (`2026-09-11_4` Parte C.)
 *
 * ⛔⛔ **Por qué existe, y es la regla de `CLAUDE.md` §4 al pie:** *una rama nueva que nunca se
 * ejecutó no está sin probar, está sin escribir el control.* Las **101** suites quedaron en verde
 * el mismo día en que estas dos ramas entraron, y **ninguna las tocaba**. La pregunta que ordena
 * este archivo es la que §4 manda hacerse al agregar la rama: *¿qué afirmación existente falla si
 * esto no funciona?* — la respuesta era **ninguna**.
 *
 * **Lo que se afirma, y cada cosa por separado:**
 *
 *   1. **elige la etiqueta de la fecha mínima**, no la mayoritaria ni la primera del arreglo;
 *   2. ⛔ **el empate con etiquetas distintas ABORTA** — medido: 8 campañas de 1.247 el 11/09;
 *   3. ⭐ **el empate con la MISMA etiqueta NO aborta**, que es lo que separa *«hay dos filas en la
 *      mínima»* de *«no se puede decidir»*. Sin este caso, el anterior pasaría igual con un
 *      criterio que abortara ante cualquier empate, y **serían dos afirmaciones indistinguibles**;
 *   4. ⛔ **la etiqueta vacía ABORTA** — medido: 9 de 1.247. Sin esto filtraría por «vacío» y
 *      dejaría adentro sólo las filas sin etiqueta, que es el corte por resta que la decisión del
 *      usuario prohíbe;
 *   5. **las filas sin fecha no compiten pero no abortan**, y sin ninguna fecha sí aborta;
 *   6. ⛔ **el corte es POSITIVO por los dos lados**: `@primer_envio` con `!=` o `~=` falla. La
 *      etiqueta tiene 21 valores y 33 vacías, así que un `!=` mete todo lo demás adentro;
 *   7. **`TODAS:` en un operando de ratio** se desarma bien y **no confunde** un campo que
 *      simplemente empiece parecido.
 *
 * ⭐ **Los fixtures son sintéticos y NO dependen de la hoja** (`CLAUDE.md` §4, la quinta forma):
 * el control de un detector no puede ser un defecto presente en los datos reales, porque se apaga
 * cuando el sistema se arregla. Los 8 empates y las 9 vacías **son el resultado**, no el control.
 *
 * ⚠ **Lo que NO contesta:** qué publica el motor en una corrida. Eso es la corrida, y es otra
 * pregunta — acá se prueban las dos funciones con el evaluador real cargado del `.gs`.
 *
 * Uso:
 *   node tools/probar-r05-primer-envio.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0, pasadas = 0;
function afirmar(condicion, mensaje, detalle) {
  if (condicion) { pasadas++; console.log('  ✅ ' + mensaje); }
  else { fallas++; console.log('  ⛔ ' + mensaje + (detalle ? ' — ' + detalle : '')); }
}

/** Carga las funciones REALES. `parsearFechaCelda_` y `normalizarValorDeclarado_` viven en
 *  `Fuentes.gs`, y se cargan de ahí: copiarlas sería el instrumento que reproduce lógica del
 *  motor y la reproduce peor. */
function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error, parseInt,
    parseFloat, Logger: { log: () => {} }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) return null;   // ⛔ guarda: la mutación TIENE que haber ocurrido
  }
  vm.runInContext(texto, ctx, { filename: 'Generador.gs' });
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8'), ctx,
    { filename: 'Fuentes.gs' });
  return ctx;
}

/** Corre `valorDelPrimerEnvio_` con las claves que usan los fixtures. */
function primero(ctx, filas) {
  ctx.__filas = filas;
  return vm.runInContext("valorDelPrimerEnvio_(__filas, 'etq', 'fecha')", ctx);
}

const F = (fecha, etq) => ({ fecha: fecha, etq: etq });

const CTX = contexto(null);

console.log('== probar-r05-primer-envio ==');
console.log('');
console.log('0 · control positivo — que las funciones REALES se hayan cargado');
/* ⭐ Sin esto, un `vm` que no evaluara nada dejaría todo lo de abajo en un `undefined` que los
 * `!r.ok` leerían como «abortó», y los casos de aborto pasarían **sin que exista la función**. */
afirmar(typeof vm.runInContext('typeof valorDelPrimerEnvio_', CTX) === 'string' &&
  vm.runInContext('typeof valorDelPrimerEnvio_', CTX) === 'function',
  '`valorDelPrimerEnvio_` está definida en el contexto');
afirmar(vm.runInContext('typeof desarmarOperandoRatio_', CTX) === 'function',
  '`desarmarOperandoRatio_` está definida en el contexto');
afirmar(vm.runInContext('typeof parsearFechaCelda_', CTX) === 'function',
  '`parsearFechaCelda_` se cargó de `Fuentes.gs` — no es una copia');

console.log('');
console.log('1 · elige por la FECHA MÍNIMA, no por mayoría ni por posición');
/* ⚠ El fixture está armado para distinguir las tres cosas a la vez: `GCBA` es **mayoritario**
 * (2 de 3) y está **primero** en el arreglo, y la mínima es la de `JM`. Un criterio que eligiera
 * por mayoría o por posición daría `GCBA` y este caso lo separa. Es la lección de `Pruebas.gs:456`:
 * un fixture que satisface más de una afirmación no distingue entre ellas. */
{
  const r = primero(CTX, [
    F(new Date(2026, 8, 5), 'GCBA'),
    F(new Date(2026, 7, 28), 'JM'),
    F(new Date(2026, 8, 9), 'GCBA')
  ]);
  afirmar(r && r.ok && r.valor === 'JM',
    'con la mínima en `JM` y `GCBA` mayoritario Y primero, devuelve «JM»',
    'devolvió ' + JSON.stringify(r));
}
{
  /* La decisión del usuario lo dice explícito: las campañas donde la primera etiqueta NO es la
   * mayoritaria **la regla las respeta**. Acá `GCBA` es 3 de 4 y gana `PC` igual. */
  const r = primero(CTX, [
    F(new Date(2026, 5, 1), 'PC'),
    F(new Date(2026, 5, 10), 'GCBA'),
    F(new Date(2026, 5, 11), 'GCBA'),
    F(new Date(2026, 5, 12), 'GCBA')
  ]);
  afirmar(r && r.ok && r.valor === 'PC',
    'la primera que no es la mayoritaria se respeta igual (3 de 4 son `GCBA` y gana `PC`)',
    'devolvió ' + JSON.stringify(r));
}

console.log('');
console.log('2 · ⛔ el empate con etiquetas distintas ABORTA, y no elige');
{
  const r = primero(CTX, [
    F(new Date(2026, 7, 28), 'JM'),
    F(new Date(2026, 7, 28), 'GCBA'),
    F(new Date(2026, 8, 5), 'JM')
  ]);
  afirmar(r && !r.ok && r.codigo === 'empate_en_el_primer_envio',
    'dos filas en la mínima con etiquetas distintas → `empate_en_el_primer_envio`',
    'devolvió ' + JSON.stringify(r));
  afirmar(!!(r && !r.ok && String(r.motivo).indexOf('JM') !== -1 && String(r.motivo).indexOf('GCBA') !== -1),
    'el motivo NOMBRA las etiquetas que empataron',
    'un aborto que no dice cuáles empataron manda a mirar la hoja entera');
}

console.log('');
console.log('3 · ⭐ el empate con la MISMA etiqueta NO aborta — la mitad que distingue');
/* ⭐⭐ Sin este caso, el 2 pasaría igual con un criterio que abortara ante **cualquier** empate de
 * fecha, y las dos afirmaciones serían la misma. Es exactamente el `[5, 5, '']` de `Pruebas.gs`. */
{
  const r = primero(CTX, [
    F(new Date(2026, 7, 28), 'JM'),
    F(new Date(2026, 7, 28), 'JM'),
    F(new Date(2026, 8, 5), 'GCBA')
  ]);
  afirmar(r && r.ok && r.valor === 'JM' && r.filas_en_la_minima === 2,
    'dos filas en la mínima con la MISMA etiqueta → resuelve «JM», sin abortar',
    'devolvió ' + JSON.stringify(r));
}

console.log('');
console.log('4 · ⛔ la etiqueta vacía del primer envío ABORTA');
{
  const r = primero(CTX, [F(new Date(2026, 7, 28), ''), F(new Date(2026, 8, 5), 'JM')]);
  afirmar(r && !r.ok && r.codigo === 'etiqueta_vacia_en_el_primer_envio',
    'la mínima con etiqueta vacía → `etiqueta_vacia_en_el_primer_envio`',
    'devolvió ' + JSON.stringify(r));
}
{
  /* ⚠ Y su hermana: una etiqueta de **espacios** es vacía. Sin normalizar, `' '` pasaría el
   * chequeo y el filtro cortaría por un valor que ninguna fila tiene → cero filas, sin motivo. */
  const r = primero(CTX, [F(new Date(2026, 7, 28), '   '), F(new Date(2026, 8, 5), 'JM')]);
  afirmar(r && !r.ok && r.codigo === 'etiqueta_vacia_en_el_primer_envio',
    'una etiqueta de espacios también es vacía (`R-10` normaliza los dos lados)',
    'devolvió ' + JSON.stringify(r));
}

console.log('');
console.log('5 · las filas SIN fecha no compiten, y sin ninguna fecha aborta');
{
  const r = primero(CTX, [F('', 'GCBA'), F(new Date(2026, 8, 5), 'JM'), F(null, 'PC')]);
  afirmar(r && r.ok && r.valor === 'JM' && r.sin_fecha === 2,
    'dos filas sin fecha no compiten y se declaran (`sin_fecha = 2`)',
    'devolvió ' + JSON.stringify(r));
}
{
  const r = primero(CTX, [F('', 'GCBA'), F(null, 'JM')]);
  afirmar(r && !r.ok && r.codigo === 'primer_envio_sin_fecha',
    'ninguna fecha utilizable → `primer_envio_sin_fecha`, no una elección por posición',
    'devolvió ' + JSON.stringify(r));
}

console.log('');
console.log('6 · ⛔ el corte es POSITIVO por los dos lados');
/* Se prueba contra `resolverValorRelativo_`, que es donde vive el gate. Las `resueltas` se arman a
 * mano porque lo que se mide es el rechazo del operador, que ocurre ANTES de mirar ninguna fila. */
function relativo(ctx, texto) {
  ctx.__texto = texto;
  return vm.runInContext(
    'var __f = parsearFiltro_(__texto);' +
    'var __planas = []; __f.condiciones.forEach(function (c) {' +
    '  alternativasDeCondicion_(c).forEach(function (x) { __planas.push(x); }); });' +
    'var __res = __planas.map(function (c) { return { cond: c, clave: "etq", columna: "AI" }; });' +
    'resolverValorRelativo_(__f.condiciones, __res, [], { base_id: "acumulado", marcador: "x" }, "Mail")',
    ctx);
}
{
  const r = relativo(CTX, 'acm_remitente!=@primer_envio');
  afirmar(r && !r.ok && r.codigo === 'valor_relativo_con_corte_negativo',
    '`!=@primer_envio` se rechaza — el corte negativo mete los otros 20 valores adentro',
    'devolvió ' + JSON.stringify(r));
}
{
  const r = relativo(CTX, 'acm_remitente~=@primer_envio');
  afirmar(r && !r.ok && r.codigo === 'valor_relativo_con_corte_negativo',
    '`~=@primer_envio` también se rechaza — `JM` matchearía dentro de otra etiqueta',
    'devolvió ' + JSON.stringify(r));
}
{
  /* ⭐ La mitad negativa del gate, sin la cual no prueba nada: un filtro que NO usa el valor
   * relativo tiene que pasar de largo. Un gate que rechazara siempre pasaría los dos de arriba. */
  const r = relativo(CTX, 'acm_remitente!=JM');
  afirmar(r && r.ok && !r.traza,
    'un filtro SIN `@primer_envio` no se toca, ni siquiera con `!=` (es otro criterio)',
    'devolvió ' + JSON.stringify(r));
}

console.log('');
console.log('7 · `TODAS:` en un operando de ratio');
function desarmar(ctx, t) {
  ctx.__op = t;
  return vm.runInContext('desarmarOperandoRatio_(__op)', ctx);
}
{
  const a = desarmar(CTX, 'TODAS:acm_aperturas');
  afirmar(a && a.todas === true && a.campo === 'acm_aperturas',
    '`TODAS:acm_aperturas` → campo `acm_aperturas`, sin filtro', JSON.stringify(a));
  const b = desarmar(CTX, ' acm_entregados ');
  afirmar(b && b.todas === false && b.campo === 'acm_entregados',
    '`acm_entregados` sin prefijo → filtrado, y se le hace `trim`', JSON.stringify(b));
  /* ⚠ El caso que separa «prefijo» de «empieza parecido»: un campo llamado `TODASOTRACOSA` no
   * lleva el prefijo. Es la familia de *un prefijo es una convención de nombre, no una clave*. */
  const c = desarmar(CTX, 'TODAS_totales');
  afirmar(c && c.todas === false && c.campo === 'TODAS_totales',
    'un campo que EMPIEZA con «TODAS» pero sin los dos puntos no activa el prefijo',
    JSON.stringify(c));
}

console.log('');
console.log('8 · control negativo — CON MOTIVO: cuál cae y por qué');
/* ⚠ La mutación se EXIGE: `contexto()` devuelve `null` si el parche no cambió nada, y entonces el
 * caso FALLA en vez de correr sobre el código intacto y dar verde sin probar. */
const NEGATIVOS = [
  {
    nombre: 'le saco el aborto por empate (que elija la primera)',
    mutar: (s) => s.replace('if (distintos.length > 1) {', 'if (false) {'),
    correr: (ctx) => primero(ctx, [F(new Date(2026, 7, 28), 'JM'), F(new Date(2026, 7, 28), 'GCBA')]),
    cae: (r) => !(r && !r.ok && r.codigo === 'empate_en_el_primer_envio'),
    afirmacion: 'el empate con etiquetas distintas aborta'
  },
  {
    nombre: 'le saco el aborto por etiqueta vacía',
    mutar: (s) => s.replace("if (distintos[0] === '') {", 'if (false) {'),
    correr: (ctx) => primero(ctx, [F(new Date(2026, 7, 28), ''), F(new Date(2026, 8, 5), 'JM')]),
    cae: (r) => !(r && !r.ok && r.codigo === 'etiqueta_vacia_en_el_primer_envio'),
    afirmacion: 'la etiqueta vacía aborta'
  },
  {
    nombre: 'le doy vuelta la comparación de la mínima (que elija el máximo)',
    mutar: (s) => s.replace('if (conFecha[j].ms < min) min = conFecha[j].ms;',
                            'if (conFecha[j].ms > min) min = conFecha[j].ms;'),
    correr: (ctx) => primero(ctx, [F(new Date(2026, 7, 28), 'JM'), F(new Date(2026, 8, 9), 'GCBA')]),
    cae: (r) => !(r && r.ok && r.valor === 'JM'),
    afirmacion: 'elige por la fecha mínima'
  },
  {
    nombre: 'le saco el gate del corte positivo',
    mutar: (s) => s.replace('return c.negado || c.op !== \'=\';', 'return false;'),
    correr: (ctx) => relativo(ctx, 'acm_remitente!=@primer_envio'),
    cae: (r) => !(r && !r.ok && r.codigo === 'valor_relativo_con_corte_negativo'),
    afirmacion: 'el corte negativo se rechaza'
  }
];
NEGATIVOS.forEach((c) => {
  const ctx = contexto(c.mutar);
  if (!ctx) {
    afirmar(false, '[negativo] ' + c.nombre,
      '⛔ la mutación NO cambió nada: correría sobre el código intacto y daría verde sin probar');
    return;
  }
  let r = null;
  try { r = c.correr(ctx); } catch (e) { r = { __excepcion: String(e) }; }
  afirmar(c.cae(r), '[negativo] ' + c.nombre + ' → cae «' + c.afirmacion + '»',
    'la afirmación siguió en verde con la causa puesta: no mide lo que dice · ' + JSON.stringify(r));
});

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + pasadas + ' afirmación(es) en verde · ' + fallas + ' en rojo');
console.log('  ⚠ No cubre: qué publica el motor en una corrida, ni si `acumulado | Mail` sigue');
console.log('     teniendo la etiqueta en AI — eso es la corrida y el export de la hoja.');
if (fallas) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
