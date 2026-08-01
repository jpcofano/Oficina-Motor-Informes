#!/usr/bin/env node
/**
 * tools/escritores.js — Parte E del AUD-3: censo de escritores por hoja.
 *
 * Para cada hoja de registro, TODA mutación de valor o de estructura en los `.gs`:
 *   setValue · setValues · setFormula · setFormulas · appendRow · insertRow* ·
 *   deleteRow* · clearContent(s) · clear
 * con función y archivo:línea. La estructura cuenta igual que el valor: un
 * `deleteRows` desde otro camino borra lo que el sembrador acaba de escribir y
 * eso no aparece en ningún diff de celdas.
 *
 * Cómo atribuye la hoja de cada sitio:
 *   1. la cadena del propio sitio trae `getSheetByName('X')` / `insertSheet('X')`;
 *   2. el receptor es una variable asignada en la misma función desde una de esas
 *      dos, o desde una función que retorna una hoja (se resuelve su `return`);
 *   3. el receptor es un PARÁMETRO: se buscan los llamadores y se resuelve el
 *      argumento en el contexto de cada uno (recursivo, con tope de profundidad).
 *      La atribución dice `vía <cadena de llamadores>`.
 *   4. lo que no se puede resolver va a `(sin resolver)` — listado, nunca
 *      descartado: un sitio mudo es el mismo error que el censo existe para cazar.
 *
 * Control positivo (criterio (b) de la Parte E): el censo tiene que encontrar
 * SOLO los dos escritores conocidos de MAPEO — el camino del upsert de
 * Instalar.gs y `promoverFechasElegidas()` de Fechas.gs. Si no los levanta,
 * el patrón está mal y el resto de la matriz no vale.
 *
 * Sólo lectura sobre `*.gs`. Uso:  node tools/escritores.js
 */

'use strict';

const path = require('path');
const { cargarProyecto, lineaDe } = require('./inventario');

// Las diez hojas de registro (mismo alcance que docs/_snapshots/ y ALCANCE_REGISTROS_;
// duplicado a propósito — leerlo del código bajo prueba anularía la independencia).
const HOJAS_REGISTRO = [
  'BASES', 'MAPEO', 'CONFIG', 'INFORMES', 'PERIODOS',
  'SOLAPAS', 'SECCIONES', 'CAMPANAS', 'REUNIONES', 'MARCADORES'
];

const RE_MUTACION = /\.\s*(setValues|setValue|setFormulas|setFormula|appendRow|insertRowsAfter|insertRowsBefore|insertRows|insertRowAfter|insertRowBefore|deleteRows|deleteRow|clearContents|clearContent|clear)\s*\(/g;

// ============================================================================
// Utilidades sobre el texto limpio (offsets idénticos al crudo)
// ============================================================================

/** La función más interna que contiene el offset, o null (nivel de módulo). */
function dueñoDe(a, offset) {
  let dueño = null;
  for (const f of a.funciones) {
    if (offset > f.iniCuerpo && offset < f.finCuerpo) {
      if (!dueño || f.iniCuerpo > dueño.iniCuerpo) dueño = f;
    }
  }
  return dueño;
}

/**
 * Cadena de receptor de una mutación: desde el '.' del método hacia atrás,
 * saltando llamadas y accesos balanceados, hasta el identificador raíz.
 * Devuelve { cadena, raiz } — la cadena en CRUDO (para leer literales).
 */
function cadenaReceptor(a, puntoIdx) {
  let i = puntoIdx - 1;
  let fin = puntoIdx;
  let ultimo = null; // último carácter significativo consumido
  while (i >= 0) {
    const c = a.limpio[i];
    if (c === ')' || c === ']') {
      // saltar el grupo balanceado hacia atrás
      const abre = c === ')' ? '(' : '[';
      let nivel = 1; i--;
      while (i >= 0 && nivel > 0) {
        if (a.limpio[i] === c) nivel++;
        if (a.limpio[i] === abre) nivel--;
        i--;
      }
      ultimo = c;
      continue;
    }
    if (/[\w$.]/.test(c)) { ultimo = c; i--; continue; }
    if (/\s/.test(c) && (ultimo === null || ultimo === '.')) {
      // blanco transparente SOLO al arrancar o tras un '.', para el encadenado
      // multilínea `getRange(...)\n  .setValues(` — nunca tras un identificador,
      // que absorbería el `if (cond)` de `if (cond) hoja.deleteRow(...)`.
      let j = i;
      while (j >= 0 && /\s/.test(a.limpio[j])) j--;
      if (j >= 0 && (a.limpio[j] === ')' || a.limpio[j] === ']')) { i = j; continue; }
    }
    break;
  }
  const cadena = a.crudo.slice(i + 1, fin);
  const m = /^[\s]*([A-Za-z_$][\w$]*)/.exec(a.limpio.slice(i + 1, fin));
  return { cadena, raiz: m ? m[1] : null };
}

/** ¿La cadena nombra la hoja directamente? getSheetByName('X') / insertSheet('X'). */
function hojaEnCadena(cadena) {
  const m = /(?:getSheetByName|insertSheet)\s*\(\s*['"]([^'"]+)['"]/.exec(cadena);
  return m ? m[1] : null;
}

/** `var IDENT = 'LIT'` a nivel de módulo, en cualquier archivo. */
function constanteGlobal(proyecto, ident) {
  const re = new RegExp("var\\s+" + ident + "\\s*=\\s*['\"]([^'\"]+)['\"]");
  for (const a of proyecto.archivos) {
    const m = re.exec(a.crudo);
    if (m) return m[1];
  }
  return null;
}

/** Divide los argumentos de una llamada `fn(...)` que empieza en offset del '('. */
function argumentosDe(a, parIdx) {
  const args = [];
  let nivel = 1; let ini = parIdx + 1;
  for (let i = ini; i < a.limpio.length && nivel > 0; i++) {
    const c = a.limpio[i];
    if (c === '(' || c === '[' || c === '{') nivel++;
    else if (c === ')' || c === ']' || c === '}') {
      nivel--;
      if (nivel === 0) { args.push({ ini, fin: i }); break; }
    } else if (c === ',' && nivel === 1) { args.push({ ini, fin: i }); ini = i + 1; }
  }
  return args.map((r) => ({ limpio: a.limpio.slice(r.ini, r.fin).trim(), crudo: a.crudo.slice(r.ini, r.fin).trim() }));
}

// ============================================================================
// Resolución de una expresión a nombre(s) de hoja
// ============================================================================

function resolver(proyecto, a, fn, expr, exprCrudo, profundidad, via) {
  if (profundidad > 5) return [{ hoja: '(sin resolver)', via, motivo: 'profundidad máxima' }];

  // 1 · la expresión trae el nombre directo
  const directa = hojaEnCadena(exprCrudo);
  if (directa) return [{ hoja: directa, via }];

  // 1b · getSheetByName(variable): resolver la VARIABLE a literal — asignación
  // local (`x = 'LIT'`, `x = x || 'LIT'`) o parámetro con literal en el llamador.
  // Cubre `escribirDiffConfiguracion_`, que abre la hoja por el parámetro
  // `nombreHoja` con default 'DIFF_CONFIGURACION'.
  const mVar = /(?:getSheetByName|insertSheet)\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/.exec(expr);
  if (mVar && fn) {
    const ident = mVar[1];
    const cuerpoCrudo2 = a.crudo.slice(fn.iniCuerpo, fn.finCuerpo);
    const reLit = new RegExp(ident + "\\s*=\\s*(?:" + ident + "\\s*\\|\\|\\s*)?['\"]([^'\"]+)['\"]");
    const mLit = reLit.exec(cuerpoCrudo2);
    const idxP = fn.params.indexOf(ident);
    // si es parámetro, los llamadores mandan (el default local es solo el fallback:
    // mirarlo primero taparía los literales que pasan los llamadores)
    if (mLit && idxP === -1) return [{ hoja: mLit[1], via }];
    if (idxP !== -1) {
      const resultados = [];
      for (const b of proyecto.archivos) {
        const reCall = new RegExp('(^|[^\\w$.])' + fn.nombre + '\\s*\\(', 'g');
        let mc;
        while ((mc = reCall.exec(b.limpio)) !== null) {
          if (/function\s+$/.test(b.limpio.slice(Math.max(0, mc.index - 11), mc.index + mc[1].length))) continue;
          const parIdx = b.limpio.indexOf('(', mc.index + mc[1].length + fn.nombre.length - 1);
          const args = argumentosDe(b, parIdx);
          const llamador = dueñoDe(b, mc.index);
          const nombreLlamador = llamador ? llamador.nombre : '(carga de módulo ' + b.archivo + ')';
          const viaN = via.concat(nombreLlamador + ' (' + b.archivo + ':' + lineaDe(b.limpio, mc.index) + ')');
          const lit = args[idxP] && /^['"]([^'"]+)['"]$/.exec(args[idxP].crudo);
          if (lit) resultados.push({ hoja: lit[1], via: viaN });
          else if (args[idxP] && args[idxP].limpio) resultados.push({ hoja: '(sin resolver)', via: viaN, motivo: 'argumento ' + ident + ' no literal: ' + args[idxP].crudo.slice(0, 30) });
          // sin argumento: cae al default local, ya contemplado arriba si existía
        }
      }
      if (resultados.length) return resultados;
    }
    if (mLit) return [{ hoja: mLit[1], via }];
    return [{ hoja: '(sin resolver)', via, motivo: 'getSheetByName(' + ident + ') sin literal a la vista' }];
  }

  // 2 · llamada a una función que retorna una hoja: resolver sus `return`.
  // El nombre puede venir como literal o como CONSTANTE global (`var X_ = 'LIT'`),
  // caso `obtenerOCrearHojaDiagFechas_` → `HOJA_DIAG_FECHAS_` → 'DIAG_FECHAS'.
  const mLlamada = /^([A-Za-z_$][\w$]*)\s*\(/.exec(expr);
  if (mLlamada && proyecto.porNombre[mLlamada[1]]) {
    const g = proyecto.porNombre[mLlamada[1]];
    const ga = proyecto.archivos.find((x) => x.archivo === g.archivo);
    const cuerpoCrudo = ga.crudo.slice(g.iniCuerpo, g.finCuerpo);
    const rets = [...cuerpoCrudo.matchAll(/(?:getSheetByName|insertSheet)\s*\(\s*['"]([^'"]+)['"]/g)];
    if (rets.length) return rets.map((r) => ({ hoja: r[1], via }));
    const porConst = [...cuerpoCrudo.matchAll(/(?:getSheetByName|insertSheet)\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/g)]
      .map((r) => constanteGlobal(proyecto, r[1])).filter(Boolean);
    if (porConst.length) return [...new Set(porConst)].map((h) => ({ hoja: h, via }));
    return [{ hoja: '(sin resolver)', via, motivo: 'retorno de ' + mLlamada[1] + ' sin literal' }];
  }

  const raiz = (/^([A-Za-z_$][\w$]*)/.exec(expr) || [])[1];
  if (!raiz) return [{ hoja: '(sin resolver)', via, motivo: 'expresión: ' + exprCrudo.slice(0, 40) }];

  if (fn) {
    const cuerpoLimpio = a.limpio.slice(fn.iniCuerpo, fn.finCuerpo);
    const cuerpoCrudo = a.crudo.slice(fn.iniCuerpo, fn.finCuerpo);

    // 3 · asignación local: raiz = <expr2>  (con borde de palabra: sin él,
    // `hoja =` matchea adentro de `nombreHoja =`)
    const reAsig = new RegExp('(?:^|[^\\w$.])(?:var\\s+)?' + raiz + '\\s*=(?!=)\\s*([^;\\n]+)', 'g');
    let asigs = [...cuerpoLimpio.matchAll(reAsig)]
      // `x = x || algo` no re-origina la hoja; se ignora la autorreferencia
      .filter((m2) => !new RegExp('^\\s*' + raiz + '\\b').test(m2[1]));
    if (asigs.length) {
      const resultados = [];
      for (const m2 of asigs) {
        const iniExpr = m2.index + m2[0].length - m2[1].length;
        const crudo2 = cuerpoCrudo.slice(iniExpr, m2.index + m2[0].length);
        resultados.push(...resolver(proyecto, a, fn, m2[1].trim(), crudo2.trim(), profundidad + 1, via));
      }
      return resultados;
    }

    // 4 · parámetro: resolver el argumento en cada llamador
    const idxParam = fn.params.indexOf(raiz);
    if (idxParam !== -1) {
      const resultados = [];
      for (const b of proyecto.archivos) {
        const reCall = new RegExp('(^|[^\\w$.])' + fn.nombre + '\\s*\\(', 'g');
        let mc;
        while ((mc = reCall.exec(b.limpio)) !== null) {
          // la propia declaración no es un llamador
          if (/function\s+$/.test(b.limpio.slice(Math.max(0, mc.index - 11), mc.index + mc[1].length))) continue;
          const parIdx = b.limpio.indexOf('(', mc.index + mc[1].length + fn.nombre.length - 1);
          const args = argumentosDe(b, parIdx);
          if (!args[idxParam]) continue;
          const llamador = dueñoDe(b, mc.index);
          const nombreLlamador = llamador ? llamador.nombre : '(carga de módulo ' + b.archivo + ')';
          if (llamador === fn) continue;
          resultados.push(...resolver(
            proyecto, b, llamador, args[idxParam].limpio, args[idxParam].crudo,
            profundidad + 1, via.concat(nombreLlamador + ' (' + b.archivo + ':' + lineaDe(b.limpio, mc.index) + ')')
          ));
        }
      }
      return resultados.length ? resultados : [{ hoja: '(sin resolver)', via, motivo: 'parámetro ' + raiz + ' sin llamadores' }];
    }
  }

  return [{ hoja: '(sin resolver)', via, motivo: 'raíz ' + raiz + ' sin asignación visible' }];
}

// ============================================================================
// Principal
// ============================================================================

function main() {
  const proyecto = cargarProyecto();
  const sitios = [];

  for (const a of proyecto.archivos) {
    let m;
    RE_MUTACION.lastIndex = 0;
    while ((m = RE_MUTACION.exec(a.limpio)) !== null) {
      const metodo = m[1];
      const puntoIdx = m.index; // el '.'
      const linea = lineaDe(a.limpio, m.index);
      const fn = dueñoDe(a, m.index);
      const receptor = cadenaReceptor(a, puntoIdx);
      const resueltos = resolver(proyecto, a, fn, receptor.cadena.replace(/\s+/g, ' ').trim(),
        receptor.cadena.trim(), 0, []);
      // deduplicar por hoja+via
      const vistos = new Set();
      for (const r of resueltos) {
        const clave = r.hoja + '|' + r.via.join('>');
        if (vistos.has(clave)) continue;
        vistos.add(clave);
        sitios.push({
          hoja: r.hoja, via: r.via, motivo: r.motivo || '',
          metodo, archivo: a.archivo, linea,
          fn: fn ? fn.nombre : '(carga de módulo)'
        });
      }
    }
  }

  // ---- salida ----
  const porHoja = {};
  sitios.forEach((s) => {
    if (!porHoja[s.hoja]) porHoja[s.hoja] = [];
    porHoja[s.hoja].push(s);
  });

  const filaDe = (s) => '| `' + s.fn + '` | `' + s.metodo + '` | ' + s.archivo + ':' + s.linea +
    ' | ' + (s.via.length ? 'vía ' + s.via.join(' → ') : 'directo') + ' |';

  const L = [];
  L.push('## Matriz — hojas de registro (las diez, aunque tengan cero escritores)');
  L.push('');
  for (const hoja of HOJAS_REGISTRO) {
    const lista = (porHoja[hoja] || []);
    L.push('### ' + hoja + (lista.length ? '' : ' — sin escritores en el código'));
    L.push('');
    if (lista.length) {
      L.push('| función | método | sitio | camino |');
      L.push('|---|---|---|---|');
      lista.sort((x, y) => (x.archivo + String(x.linea).padStart(5, '0')).localeCompare(y.archivo + String(y.linea).padStart(5, '0')))
        .forEach((s) => L.push(filaDe(s)));
    }
    L.push('');
  }

  L.push('## Anexo — hojas que no son de registro (reportes, diagnósticos, trabajo)');
  L.push('');
  const otras = Object.keys(porHoja).filter((h) => !HOJAS_REGISTRO.includes(h) && h !== '(sin resolver)').sort();
  for (const hoja of otras) {
    L.push('### ' + hoja);
    L.push('');
    L.push('| función | método | sitio | camino |');
    L.push('|---|---|---|---|');
    porHoja[hoja].forEach((s) => L.push(filaDe(s)));
    L.push('');
  }

  L.push('## Sin resolver — sitios cuya hoja el censo no pudo atribuir');
  L.push('');
  const sinResolver = porHoja['(sin resolver)'] || [];
  if (!sinResolver.length) L.push('(ninguno)');
  sinResolver.forEach((s) => {
    L.push('- `' + s.fn + '` · `' + s.metodo + '` · ' + s.archivo + ':' + s.linea +
      (s.via.length ? ' · vía ' + s.via.join(' → ') : '') + ' — ' + s.motivo);
  });
  L.push('');

  // ---- control positivo (criterio (b)): los dos escritores de MAPEO ----
  const mapeo = porHoja['MAPEO'] || [];
  const desdeInstalar = mapeo.some((s) => s.archivo === 'Instalar.gs' || s.via.some((v) => v.indexOf('Instalar.gs') !== -1));
  const desdeFechas = mapeo.some((s) => s.archivo === 'Fechas.gs' || s.via.some((v) => v.indexOf('Fechas.gs') !== -1) ||
    s.via.some((v) => v.indexOf('promoverFechasElegidas') !== -1));
  L.push('## Control positivo del censo (criterio (b) de la Parte E)');
  L.push('');
  L.push('- Escritor de MAPEO por el camino del upsert (`Instalar.gs`): ' + (desdeInstalar ? '**encontrado**' : '**NO ENCONTRADO — la matriz no vale**'));
  L.push('- Escritor de MAPEO por `promoverFechasElegidas()` (`Fechas.gs`): ' + (desdeFechas ? '**encontrado**' : '**NO ENCONTRADO — la matriz no vale**'));
  if (!desdeInstalar || !desdeFechas) process.exitCode = 1;

  console.log(L.join('\n'));
}

main();
