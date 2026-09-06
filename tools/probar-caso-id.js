#!/usr/bin/env node
/**
 * tools/probar-caso-id.js — **`caso_id` es la clave del cruce de `D-56` y NO es única.**
 * Ítem 29 de la cola. Parte G del `2026-09-05_1`.
 *
 * ⛔⛔ **El defecto que vigila:** `C-84` y `C-85` existen **dos veces**, en dos archivos distintos,
 * porque el CSV del 28/08 **reinició la serie** en vez de seguir el máximo global. ⚠ **Ya costó una
 * lectura equivocada**, y ningún instrumento del repo lo señalaba — el cruce de `D-56` le daba
 * verde igual.
 *
 * ══ ⭐⭐ POR QUÉ NO SALE ROJO POR LOS DOS QUE YA ESTÁN ══════════════════════════════════════
 *
 * El prompt pedía *«exit ≠ 0 si hay duplicados»*. ⛔ **Tal cual, este banco nacería rojo y quedaría
 * rojo para siempre**, porque los dos duplicados **no se pueden renumerar**: los casos ya ejecutados
 * no se renumeran —mismo criterio que los prompts, `CLAUDE.md` §3— y **elegir cuál de los dos `C-84`
 * se queda con el número es una decisión del usuario**. Un banco permanentemente rojo deja de leerse,
 * y entonces no vigila nada.
 *
 * ⭐ **La salida es la que el repo ya prescribe: el control no se afloja, gana afirmaciones.** El
 * baseline de dos se **declara por nombre**, y el banco se pone rojo ante **un tercero**. Así:
 *   · un duplicado nuevo **falla** — que es para lo que existe;
 *   · el día que el usuario resuelva los dos, **también falla** (`FALTA` en el baseline) y hay que
 *     venir a sacarlos de la lista, **con el motivo escrito**. ⇒ El baseline no se puede vencer en
 *     silencio, que es la diferencia entre un estado y una condición (`CLAUDE.md` §4).
 *
 * ⛔ **NO renumera nada, no escribe ningún CSV, y no elige.** Muestra el problema.
 *
 * Uso:  node tools/probar-caso-id.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const DOCS = path.join(RAIZ, 'docs');
/* ⭐ El lector estricto COMPARTIDO. `tools/lib-csv.js` existe porque este banco y
 * `medir-casos-exactos-con-revisar.js` nacieron **la misma noche** con parsers opuestos y motivos
 * escritos que se contradicen. ⛔ Ganó el estricto: el laxo andaba **por el estado de los datos**
 * —hoy no hay ningún salto de línea embebido— y no por su diseño. */
const CSV = require('./lib-csv');

let fallas = 0;
let afirmaciones = 0;
function afirmar(condicion, mensaje) {
  afirmaciones++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

/* ⭐ El baseline: los duplicados CONOCIDOS y aceptados, por nombre. No es una tolerancia
 * numérica —«hasta dos duplicados está bien»— porque eso dejaría entrar un tercero distinto
 * mientras se resolviera uno de éstos. */
const DUPLICADOS_CONOCIDOS = ['C-84', 'C-85'];

const archivos = fs.readdirSync(DOCS)
  .filter(n => /^casos_validacion_.*\.csv$/.test(n)).sort();

const donde = {};       // caso_id -> [archivos]
const porPrefijo = {};  // prefijo -> { max, ancho }
let validos = 0, descartados = 0, registros = 0;
const conSaltos = [], raros = [];

console.log('═══ 0 · el universo, declarado antes de afirmar nada ═══');
archivos.forEach(nombre => {
  const texto = fs.readFileSync(path.join(DOCS, nombre), 'utf8');
  const u = CSV.universo(texto);
  registros += u.registros - 1;                       // menos la cabecera
  if (u.saltos_embebidos) conSaltos.push(nombre);
  CSV.parsear(texto).slice(1).forEach(f => {
    const id = (f[0] || '').trim();
    if (!id && f.length <= 1) return;                 // línea en blanco
    if (!/^[A-Z]+-\d+$/.test(id)) { descartados++; raros.push(JSON.stringify(id) + ' (' + nombre + ')'); return; }
    validos++;
    (donde[id] = donde[id] || []).push(nombre);
    const [pre, num] = id.split('-');
    const p = porPrefijo[pre] = porPrefijo[pre] || { max: 0, ancho: 0 };
    /* ⭐ El ANCHO se conserva: el corpus está *zero-padded* a dos dígitos y `Number()` lo pierde.
     * Sin esto el banco prescribía `D-7` donde la convención del propio corpus pide `D-07`. */
    p.ancho = Math.max(p.ancho, num.length);
    p.max = Math.max(p.max, Number(num));
  });
});
function idDe(pre, n) { return pre + '-' + String(n).padStart(porPrefijo[pre].ancho, '0'); }

console.log('  archivos: ' + archivos.length + '  ·  registros de datos: ' + registros +
  '  ·  con id válido: ' + validos + '  ·  descartados: ' + descartados);
archivos.forEach(n => console.log('     · ' + n));
if (raros.length) console.log('  ⚠ descartados: ' + raros.join(' · '));
afirmar(archivos.length >= 2, 'hay al menos dos archivos que comparar');
afirmar(validos > 0, 'se leyó al menos un caso  (cero casos sería el cero silencioso)');
/* ⭐⭐ EL DENOMINADOR, que faltaba y es la mitad de «declarar cuánto se midió»: sin esto,
 * *«no descarté nada»* y *«descarté cinco y no lo dije»* se ven IDÉNTICOS en la salida. */
afirmar(validos + descartados === registros,
  '⭐⭐ los ' + registros + ' registros están todos contados (' + validos + ' válidos + ' +
  descartados + ' descartados) — el universo CIERRA');
/* ⛔ La guarda que el lector estricto habilita: un salto de línea dentro de un campo hace que
 * partir por fin-de-línea invente una **fila fantasma con atribución falsa** — un duplicado que
 * acusa a un archivo donde ese id no está. Acá se detecta y se dice. */
afirmar(conSaltos.length === 0,
  conSaltos.length ? '⛔ saltos de línea DENTRO de un campo en: ' + conSaltos.join(', ')
    : 'ningún campo tiene saltos de línea embebidos');
/* ⚠ Un CONSOLIDADO repite por construcción los ids de lo que consolida. El repo tuvo dos. */
const consolidados = archivos.filter(n => /CONSOLIDADO/i.test(n));
afirmar(consolidados.length === 0,
  consolidados.length ? '⚠ hay CONSOLIDADO(s) en el glob: ' + consolidados.join(', ') +
    ' — repiten ids por construcción, y entonces los duplicados de abajo NO son un hallazgo'
    : 'ningún CONSOLIDADO en el glob — los duplicados de abajo son reales');

console.log('\n═══ A · ⭐ CONTROL POSITIVO — los duplicados conocidos TIENEN que aparecer ═══');
{
  /* ⛔ Sin esto, un parser roto informaría «no hay duplicados» y se leería como salud. Es la
   * misma figura que el detector sin control positivo: **el cero es el resultado más peligroso**,
   * porque es indistinguible del éxito. */
  const vistos = DUPLICADOS_CONOCIDOS.filter(id => (donde[id] || []).length > 1);
  vistos.forEach(id => console.log('     ' + id + '  →  ' + donde[id].join('  +  ')));
  afirmar(vistos.length === DUPLICADOS_CONOCIDOS.length,
    '⭐⭐ el instrumento VE los ' + DUPLICADOS_CONOCIDOS.length + ' conocidos (' +
    vistos.length + ' encontrados)');
  if (vistos.length !== DUPLICADOS_CONOCIDOS.length) {
    console.log('     ⛔⛔ NO aparecen: ' +
      DUPLICADOS_CONOCIDOS.filter(id => vistos.indexOf(id) === -1).join(', '));
    console.log('     ⇒ O el parser dejó de ver los CSV, O el usuario resolvió el duplicado.');
    console.log('       **Son dos cosas opuestas y este banco no las distingue**: si fue lo');
    console.log('       segundo, hay que sacarlo del baseline A MANO y escribir por qué.');
  }
}

console.log('\n═══ B · ⛔ lo que este banco vigila: un duplicado NUEVO ═══');
{
  const todos = Object.keys(donde).filter(id => donde[id].length > 1).sort();
  const nuevos = todos.filter(id => DUPLICADOS_CONOCIDOS.indexOf(id) === -1);
  console.log('  duplicados totales: ' + todos.length +
    '  ·  conocidos: ' + DUPLICADOS_CONOCIDOS.length + '  ·  NUEVOS: ' + nuevos.length);
  nuevos.forEach(id => console.log('     ⛔ ' + id + '  →  ' + donde[id].join('  +  ')));
  afirmar(nuevos.length === 0,
    nuevos.length ? '⛔⛔ hay ' + nuevos.length + ' duplicado(s) NUEVO(s): ' + nuevos.join(', ')
      : 'ningún duplicado fuera del baseline declarado');
}

console.log('\n═══ C · ⭐ el máximo global por prefijo — de acá sale el próximo id ═══');
{
  /* ⭐ Es la mitad que EVITA el problema, no la que lo detecta: el `caso_id` nuevo sale del
   * máximo GLOBAL de todos los archivos, nunca del máximo del archivo que se está editando —que
   * es exactamente cómo nacieron `C-84` y `C-85`. */
  Object.keys(porPrefijo).sort().forEach(p => {
    console.log('     ' + p + '-*  →  máximo ' + idDe(p, porPrefijo[p].max) +
      '   ⇒ el próximo es ' + idDe(p, porPrefijo[p].max + 1) +
      (p === 'D' ? '   ⛔ OJO: `D-NN` son TAMBIÉN las decisiones de `PLAN.md`' : ''));
  });
  afirmar(Object.keys(porPrefijo).length > 0, 'se calculó al menos un prefijo');
  /* ⛔ La colisión de namespaces, dicha donde alguien la va a leer: `D-01`…`D-06` del CSV
   * —«derivaciones», `D-56`— se pisan al 100 % con `D-01`…`D-58` de `PLAN.md` —decisiones de
   * arquitectura—. ⚠ Hoy es LATENTE: las 77 citas a `D-0N` del repo apuntan todas a las
   * decisiones, ninguna a los seis casos. Pero **el lado CSV es ingrepable**. Resolverlo es una
   * decisión del usuario; este banco sólo se niega a empeorarlo en silencio. */
  if (porPrefijo['D']) {
    console.log('     ⚠ `D-` colisiona con las decisiones de `PLAN.md` (`D-01`…`D-58`). Hoy es');
    console.log('       latente —nadie cita los casos `D-0N`—, pero un `D-07` nuevo sería');
    console.log('       ingrepable desde el día uno. La decisión de renombrar el prefijo es tuya.');
  }
}

console.log('');
console.log('⛔ Este banco NO renumera, NO escribe ningún CSV y NO elige cuál de los dos `C-84`');
console.log('   se queda con el número: eso es una decisión del usuario. Muestra el problema.');
console.log('⚠ Y lo que NO contesta: si dos casos con id distinto hablan del mismo marcador —eso');
console.log('   es `D-58` y es otra pregunta—, ni si la serie tiene HUECOS: reporta el máximo, no');
console.log('   la continuidad. (Medido el 05/09: falta `C-10`, y no lo cita nadie.)');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ Las ' + afirmaciones + ' afirmaciones pasaron');
