#!/usr/bin/env node
/**
 * tools/inventario.js — Parte A del AUD-3: grafo de llamadas de los `.gs`.
 *
 * Produce, sobre el código del repo (no sobre la planilla):
 *   - conteos: archivos, líneas, funciones (de primer nivel y anidadas), duplicados;
 *   - para cada función: archivo:línea, quién la llama, desde qué ítem(es) de menú
 *     o acción de API se alcanza;
 *   - las no alcanzables desde ningún punto de entrada;
 *   - la tabla de menú con su función destino y si el camino toca `getUi()`.
 *
 * Puntos de entrada considerados:
 *   1. `onOpen`, `doGet`, `doPost` — los invoca la plataforma.
 *   2. Los nombres en la tabla `MENU_` (`f: 'nombre'`) — invocados por string.
 *   3. Los valores de `API_LECTORES_` (Api.gs) — ídem.
 *   4. **El código de nivel de módulo** — todo lo que está fuera de una función
 *      corre en CADA ejecución del proyecto, al cargar el scope global. La medición
 *      externa del 01/08 no lo contaba como entrada, y por eso declaró huérfanas a
 *      funciones que corren siempre (`filasSolapa_`, `filaSeccion_`). Acá se cuenta,
 *      con la etiqueta `(carga de módulo)`.
 *
 * La acción `llamar` de la API puede invocar CUALQUIER global por nombre, así que
 * "no alcanzable" siempre significa "por los caminos declarados": nada es
 * inalcanzable en sentido absoluto. Eso no le quita valor al mapa — lo acota.
 *
 * Es sólo lectura y no toca la planilla: lee `*.gs` y `docs/BITACORA.md`.
 * Uso:  node tools/inventario.js [--json]
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

// ============================================================================
// Limpieza — comentarios y contenido de strings fuera, PRESERVANDO longitud
// (mismo offset en crudo y en limpio: los literales se releen del crudo).
// ============================================================================

/* ⛔⛔ `2026-09-03` — **el limpiador reconoce REGEX LITERALES, y sin eso se comía el archivo.**
 *
 * **El caso, medido:** `Auditoria.gs:2917` tiene
 * `/filtro\s+`[^`]*`[^→]*→\s*(\d+)\s+de\s+(\d+)\s+fila/` — una regex **con backticks adentro**.
 * El limpiador no distinguía una regex de una división, así que veía el primer `` ` `` y **entraba
 * en modo template string**: el segundo lo cerraba, el tercero volvía a abrir, y **desde ahí se
 * comía el resto del archivo — 487 líneas de código**, con sus llaves. De ahí el
 * `Llaves desbalanceadas tras limpiar Auditoria.gs (-2)` que dejó a `inventario.js` y a
 * `escritores.js` **rotos desde el 28/08** (commit `6d6fa01`; el anterior daba balance 0).
 *
 * ⭐ **Distinguir regex de división no es ambiguo si se mira el token ANTERIOR:** después de un
 * valor —identificador, número, `)`, `]`— una `/` es división; después de un operador, una coma,
 * un `(`, un `=` o un `return`, es el comienzo de una regex. Es la regla que usa cualquier lexer
 * de JS y acá alcanza de sobra: el archivo es código propio, no entrada arbitraria.
 *
 * ⚠ **Y NO se resuelve reescribiendo la regex de `Auditoria.gs` para sacarle los backticks**: eso
 * arregla este archivo y deja el limpiador roto para la próxima regex que los tenga. El defecto
 * está acá.
 */
function esInicioDeRegex_(texto, i) {
  for (let k = i - 1; k >= 0; k--) {
    const ch = texto[k];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') continue;
    if (/[A-Za-z0-9_$)\]]/.test(ch)) {
      // Puede ser división… salvo que el identificador sea una palabra clave que espera valor.
      let fin = k + 1, ini = k;
      while (ini >= 0 && /[A-Za-z0-9_$]/.test(texto[ini])) ini--;
      const palabra = texto.slice(ini + 1, fin);
      return ['return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'do', 'else']
        .indexOf(palabra) !== -1;
    }
    return true;   // operador, coma, paréntesis de apertura, `=`, `{`, `;`…
  }
  return true;     // principio del archivo
}

function limpiar(texto) {
  const salida = texto.split('');
  let estado = 'codigo'; // codigo | lineaCom | bloqueCom | sq | dq | tpl | rx
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    const sig = texto[i + 1];
    if (estado === 'codigo') {
      if (c === '/' && sig === '/') { estado = 'lineaCom'; salida[i] = ' '; }
      else if (c === '/' && sig === '*') { estado = 'bloqueCom'; salida[i] = ' '; }
      else if (c === '/' && esInicioDeRegex_(texto, i)) { estado = 'rx'; }
      else if (c === "'") estado = 'sq';
      else if (c === '"') estado = 'dq';
      else if (c === '`') estado = 'tpl';
      continue;
    }
    /* Una regex se cierra con la `/` sin escapar. Las clases `[...]` pueden contener `/` sin
     * cerrarla, así que se lleva la cuenta de si estamos dentro de una. */
    if (estado === 'rx') {
      if (c === '\\') { salida[i] = ' '; if (sig !== '\n') { salida[i + 1] = ' '; i++; } continue; }
      if (c === '[') { estado = 'rxClase'; salida[i] = ' '; continue; }
      if (c === '/') { estado = 'codigo'; continue; }
      if (c !== '\n') salida[i] = ' ';
      continue;
    }
    if (estado === 'rxClase') {
      if (c === '\\') { salida[i] = ' '; if (sig !== '\n') { salida[i + 1] = ' '; i++; } continue; }
      if (c === ']') { estado = 'rx'; salida[i] = ' '; continue; }
      if (c !== '\n') salida[i] = ' ';
      continue;
    }
    if (estado === 'lineaCom') {
      if (c === '\n') estado = 'codigo';
      else salida[i] = ' ';
      continue;
    }
    if (estado === 'bloqueCom') {
      if (c === '*' && sig === '/') { salida[i] = ' '; salida[i + 1] = ' '; i++; estado = 'codigo'; }
      else if (c !== '\n') salida[i] = ' ';
      continue;
    }
    // strings: se conservan las comillas, se blanquea el contenido
    const cierre = estado === 'sq' ? "'" : estado === 'dq' ? '"' : '`';
    if (c === '\\') { salida[i] = ' '; if (sig !== '\n') { salida[i + 1] = ' '; i++; } continue; }
    if (c === cierre) { estado = 'codigo'; continue; }
    if (c !== '\n') salida[i] = ' ';
  }
  return salida.join('');
}

function lineaDe(texto, offset) {
  let linea = 1;
  for (let i = 0; i < offset; i++) if (texto[i] === '\n') linea++;
  return linea;
}

// ============================================================================
// Extracción de funciones (con cuerpo por balance de llaves sobre el limpio)
// ============================================================================

function extraerFunciones(archivo, crudo, limpio) {
  const funciones = [];
  const re = /(^|[^\w$])function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(limpio)) !== null) {
    const nombre = m[2];
    const inicioDecl = m.index + m[1].length;
    // cuerpo: desde la primera '{' después del cierre de parámetros
    let i = re.lastIndex; // justo después de '('
    let par = 1;
    while (i < limpio.length && par > 0) {
      if (limpio[i] === '(') par++;
      if (limpio[i] === ')') par--;
      i++;
    }
    while (i < limpio.length && limpio[i] !== '{') i++;
    const inicioCuerpo = i;
    let llaves = 1; i++;
    while (i < limpio.length && llaves > 0) {
      if (limpio[i] === '{') llaves++;
      if (limpio[i] === '}') llaves--;
      i++;
    }
    const params = limpio.slice(re.lastIndex, inicioCuerpo).replace(/[)({]/g, ' ')
      .split(',').map((p) => p.trim()).filter(Boolean);
    funciones.push({
      nombre, archivo,
      linea: lineaDe(limpio, inicioDecl),
      params,
      iniDecl: inicioDecl, iniCuerpo: inicioCuerpo, finCuerpo: i
    });
  }
  // anidamiento: una función cuyo iniDecl cae dentro del cuerpo de otra
  funciones.forEach((f) => {
    f.padre = null;
    funciones.forEach((g) => {
      if (g === f) return;
      if (f.iniDecl > g.iniCuerpo && f.iniDecl < g.finCuerpo) {
        if (!f.padre || g.iniCuerpo > f.padre.iniCuerpo) f.padre = g;
      }
    });
  });
  return funciones;
}

// ============================================================================
// Carga de todo el proyecto
// ============================================================================

function cargarProyecto() {
  const archivos = fs.readdirSync(RAIZ).filter((a) => a.endsWith('.gs')).sort();
  const proyecto = { archivos: [], funciones: [], porNombre: {}, duplicados: [] };

  for (const archivo of archivos) {
    const crudo = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
    const limpio = limpiar(crudo);
    // sanidad del limpiador: si las llaves no balancean, el resto no es confiable
    const balance = (limpio.match(/{/g) || []).length - (limpio.match(/}/g) || []).length;
    if (balance !== 0) {
      throw new Error('Llaves desbalanceadas tras limpiar ' + archivo + ' (' + balance + ') — revisar el limpiador.');
    }
    const funciones = extraerFunciones(archivo, crudo, limpio);
    proyecto.archivos.push({ archivo, crudo, limpio, lineas: crudo.split('\n').length, funciones });
    funciones.forEach((f) => {
      // Duplicados: solo importan entre funciones de PRIMER NIVEL — dos anidadas
      // con el mismo nombre viven en scopes distintos y no se pisan (caso real:
      // `celdaVacia_` existe dentro de leerFuente y dentro de una función de
      // Auditoria.gs, y no hay colisión).
      if (!f.padre && proyecto.porNombre[f.nombre] && !proyecto.porNombre[f.nombre].padre) {
        proyecto.duplicados.push(f.nombre);
      }
      if (!proyecto.porNombre[f.nombre] || proyecto.porNombre[f.nombre].padre) proyecto.porNombre[f.nombre] = f;
      proyecto.funciones.push(f);
    });
  }
  return proyecto;
}

// ============================================================================
// Grafo: llamadas identificador( ; referencias por string; nivel de módulo
// ============================================================================

function construirGrafo(proyecto) {
  const nombres = new Set(proyecto.funciones.map((f) => f.nombre));
  const llama = {};    // nombre -> Set de llamados
  const llamadaPor = {}; // nombre -> Set de llamadores
  const refsString = []; // { nombre, archivo, linea, contexto }
  proyecto.funciones.forEach((f) => { llama[f.nombre] = new Set(); llamadaPor[f.nombre] = new Set(); });

  const nodoCarga = '(carga de módulo)';
  llama[nodoCarga] = new Set();

  for (const a of proyecto.archivos) {
    // dueño de cada offset: la función más interna, o el nivel de módulo
    const dueñoDe = (offset) => {
      let dueño = null;
      for (const f of a.funciones) {
        if (offset > f.iniCuerpo && offset < f.finCuerpo) {
          if (!dueño || f.iniCuerpo > dueño.iniCuerpo) dueño = f;
        }
      }
      return dueño ? dueño.nombre : nodoCarga;
    };

    // Usos: identificador que coincide con una función conocida — con o sin '('.
    // La referencia sin invocación cuenta como uso a propósito (conservador):
    // `correrPruebasDiff_` arma un array de referencias a las cinco `probar*_` y
    // las invoca por variable; sin esto, las ocho de Pruebas.gs salen huérfanas
    // estando cableadas al menú.
    const reUso = /([A-Za-z_$][\w$]*)/g;
    let m;
    while ((m = reUso.exec(a.limpio)) !== null) {
      const nombre = m[1];
      if (!nombres.has(nombre)) continue;
      const antes = a.limpio.slice(Math.max(0, m.index - 12), m.index);
      if (/function\s+$/.test(antes)) continue;           // la propia declaración
      if (/\.\s*$/.test(antes)) continue;                  // propiedad de un objeto
      const quien = dueñoDe(m.index);
      if (quien === nombre) continue; // recursión directa no aporta al mapa
      llama[quien].add(nombre);
      llamadaPor[nombre].add(quien === nodoCarga ? nodoCarga + ' ' + a.archivo : quien);
    }

    // referencias por string (se leen del crudo, el limpio las blanqueó)
    const reString = /['"]([A-Za-z_$][\w$]*)['"]/g;
    while ((m = reString.exec(a.crudo)) !== null) {
      if (!nombres.has(m[1])) continue;
      refsString.push({ nombre: m[1], archivo: a.archivo, linea: lineaDe(a.crudo, m.index), offset: m.index });
    }
  }
  return { llama, llamadaPor, refsString, nodoCarga };
}

// ============================================================================
// Menú y API: los dos despachos por string declarados
// ============================================================================

function bloque(proyecto, archivo, reInicio) {
  const a = proyecto.archivos.find((x) => x.archivo === archivo);
  if (!a) return null;
  const m = reInicio.exec(a.limpio);
  if (!m) return null;
  let i = a.limpio.indexOf('{', m.index);
  let llaves = 1; let j = i + 1;
  while (j < a.limpio.length && llaves > 0) {
    if (a.limpio[j] === '{') llaves++;
    if (a.limpio[j] === '}') llaves--;
    j++;
  }
  return { archivo, ini: m.index, fin: j, crudo: a.crudo };
}

function itemsDeMenu(proyecto) {
  const b = bloque(proyecto, 'Codigo.gs', /var\s+MENU_\s*=/);
  if (!b) throw new Error('No encontré la tabla MENU_ en Codigo.gs');
  const texto = b.crudo.slice(b.ini, b.fin);
  const items = [];
  const re = /\{\s*t:\s*'((?:[^'\\]|\\.)*)'\s*,\s*f:\s*'([A-Za-z_$][\w$]*)'\s*\}/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    items.push({ etiqueta: m[1], fn: m[2], linea: lineaDe(b.crudo, b.ini + m.index) });
  }
  return items;
}

function lectoresApi(proyecto) {
  const b = bloque(proyecto, 'Api.gs', /var\s+API_LECTORES_\s*=/);
  if (!b) return [];
  const texto = b.crudo.slice(b.ini, b.fin);
  const lectores = [];
  const re = /([A-Z_]+):\s*'([A-Za-z_$][\w$]*)'/g;
  let m;
  while ((m = re.exec(texto)) !== null) lectores.push({ hoja: m[1], fn: m[2] });
  return lectores;
}

// ============================================================================
// Alcanzabilidad
// ============================================================================

function alcanzables(grafo, semillas) {
  const visto = new Set();
  const cola = [...semillas];
  while (cola.length) {
    const n = cola.pop();
    if (visto.has(n)) continue;
    visto.add(n);
    (grafo.llama[n] || new Set()).forEach((s) => { if (!visto.has(s)) cola.push(s); });
  }
  return visto;
}

// ============================================================================
// Principal
// ============================================================================

function main() {
  const proyecto = cargarProyecto();
  const grafo = construirGrafo(proyecto);
  const menu = itemsDeMenu(proyecto);
  const api = lectoresApi(proyecto);

  const totalLineas = proyecto.archivos.reduce((s, a) => s + a.lineas, 0);
  const nivel1 = proyecto.funciones.filter((f) => !f.padre);
  const anidadas = proyecto.funciones.filter((f) => f.padre);

  // getUi por función (sitios directos)
  const usaUi = {};
  for (const a of proyecto.archivos) {
    const re = /getUi\s*\(/g;
    let m;
    while ((m = re.exec(a.limpio)) !== null) {
      let dueño = null;
      for (const f of a.funciones) {
        if (m.index > f.iniCuerpo && m.index < f.finCuerpo) {
          if (!dueño || f.iniCuerpo > dueño.iniCuerpo) dueño = f;
        }
      }
      if (dueño) usaUi[dueño.nombre] = (usaUi[dueño.nombre] || 0) + 1;
    }
  }

  // entradas
  const plataforma = ['onOpen', 'doGet', 'doPost'].filter((n) => proyecto.porNombre[n]);
  const desdeMenu = menu.map((i) => i.fn).filter((n) => proyecto.porNombre[n]);
  const desdeApi = api.map((l) => l.fn).filter((n) => proyecto.porNombre[n]);
  const semillas = [...plataforma, ...desdeMenu, ...desdeApi, grafo.nodoCarga];

  const vivas = alcanzables(grafo, semillas);
  const huerfanas = nivel1.filter((f) => !vivas.has(f.nombre)).map((f) => f.nombre).sort();

  // qué ítem de menú alcanza cada función
  const itemsQueAlcanzan = {};
  for (const item of menu) {
    const alc = alcanzables(grafo, [item.fn]);
    alc.forEach((n) => {
      if (!itemsQueAlcanzan[n]) itemsQueAlcanzan[n] = [];
      itemsQueAlcanzan[n].push(item.etiqueta);
    });
  }
  const accionesApi = { manejarPedido_: 'todas', apiPedido_: 'todas', apiBarrera1_: 'todas', apiBarrera2_: 'todas' };
  const alcApi = alcanzables(grafo, desdeApi);

  // funciones que corren en carga de módulo
  const enCarga = [...(grafo.llama[grafo.nodoCarga] || [])];
  const alcCarga = alcanzables(grafo, [grafo.nodoCarga]);

  // ---- salida ----
  const L = [];
  L.push('## Resumen');
  L.push('');
  L.push('| medida | valor |');
  L.push('|---|---|');
  L.push('| archivos `.gs` | ' + proyecto.archivos.length + ' |');
  L.push('| líneas | ' + totalLineas + ' |');
  L.push('| funciones con nombre | ' + proyecto.funciones.length + ' (nivel 1: ' + nivel1.length + ' · anidadas: ' + anidadas.length + ') |');
  L.push('| nombres duplicados | ' + (proyecto.duplicados.length ? '⚠ ' + proyecto.duplicados.join(', ') : '0') + ' |');
  L.push('| ítems de menú (hoja en `MENU_`) | ' + menu.length + ' |');
  L.push('| lectores de API (`API_LECTORES_`) | ' + api.length + ' |');
  L.push('| llamadas en carga de módulo | ' + enCarga.sort().join(', ') + ' |');
  L.push('| no alcanzables desde las entradas | ' + huerfanas.length + ' |');
  L.push('');
  L.push('## No alcanzables (desde onOpen/MENU_, doGet/doPost, API_LECTORES_ y carga de módulo)');
  L.push('');
  huerfanas.forEach((n) => {
    const f = proyecto.porNombre[n];
    const llamadores = [...(grafo.llamadaPor[n] || [])].sort();
    L.push('- `' + n + '` — ' + f.archivo + ':' + f.linea +
      (llamadores.length ? ' · la llaman (también inalcanzables): ' + llamadores.join(', ') : ' · sin llamadores'));
  });
  // última mención de cada función de menú en la bitácora (mecánico: última
  // sección `## ` de docs/BITACORA.md cuyo texto la nombra)
  const bitacora = fs.readFileSync(path.join(RAIZ, 'docs', 'BITACORA.md'), 'utf8');
  const secciones = bitacora.split(/^## /m).slice(1).map((s) => ({
    titulo: s.split('\n')[0].trim(),
    texto: s
  }));
  const ultimaMencion = (nombre) => {
    for (let i = secciones.length - 1; i >= 0; i--) {
      if (secciones[i].texto.indexOf(nombre) !== -1) return secciones[i].titulo.replace(/\s*—.*$/, '');
    }
    return '—';
  };

  L.push('');
  L.push('## Ítems de menú');
  L.push('');
  L.push('| ítem | función | existe | `getUi()` en el camino | última mención en BITACORA |');
  L.push('|---|---|---|---|---|');
  for (const item of menu) {
    const f = proyecto.porNombre[item.fn];
    const alcItem = alcanzables(grafo, [item.fn]);
    const conUi = [...alcItem].filter((n) => usaUi[n]).sort();
    const protegido = conUi.length && [...alcItem].some((n) => (grafo.llama[n] || new Set()).has('hayUi_'));
    L.push('| ' + item.etiqueta + ' | `' + item.fn + '` | ' + (f ? f.archivo + ':' + f.linea : '⚠ NO EXISTE') +
      ' | ' + (conUi.length ? 'sí — ' + conUi.join(', ') + (protegido ? ' (con `hayUi_` en el camino)' : '') : 'no') +
      ' | ' + ultimaMencion(item.fn) + ' |');
  }
  L.push('');
  L.push('## Las ' + proyecto.funciones.length + ' funciones');
  L.push('');
  L.push('| función | archivo:línea | la llaman | ítems de menú que la alcanzan | API |');
  L.push('|---|---|---|---|---|');
  for (const f of [...proyecto.funciones].sort((a, b) => (a.archivo + a.nombre).localeCompare(b.archivo + b.nombre))) {
    const llamadores = [...(grafo.llamadaPor[f.nombre] || [])].sort();
    const items = (itemsQueAlcanzan[f.nombre] || []);
    const marcaMulti = items.length > 1 ? ' **[' + items.length + ' ítems]**' : '';
    const porApi = alcApi.has(f.nombre) ? 'sí' : (accionesApi[f.nombre] || 'no');
    L.push('| `' + f.nombre + '`' + (f.padre ? ' (anidada en `' + f.padre.nombre + '`)' : '') +
      ' | ' + f.archivo + ':' + f.linea +
      ' | ' + (llamadores.length ? llamadores.join('; ') : (alcCarga.has(f.nombre) && enCarga.includes(f.nombre) ? '(carga de módulo)' : '—')) +
      ' | ' + (items.length ? items.join('; ') + marcaMulti : '—') +
      ' | ' + porApi + ' |');
  }
  L.push('');
  L.push('## Menciones por string que NO son despacho (posibles falsos vivos si se contaran)');
  L.push('');
  const menuFns = new Set(desdeMenu);
  const apiFns = new Set(desdeApi);
  const otras = grafo.refsString.filter((r) => !menuFns.has(r.nombre) && !apiFns.has(r.nombre));
  const vistasOtras = new Set();
  otras.forEach((r) => {
    const clave = r.nombre + '@' + r.archivo + ':' + r.linea;
    if (vistasOtras.has(clave)) return;
    vistasOtras.add(clave);
    L.push('- `' + r.nombre + '` citado en ' + r.archivo + ':' + r.linea);
  });

  console.log(L.join('\n'));
}

module.exports = { cargarProyecto, construirGrafo, limpiar, lineaDe, itemsDeMenu, alcanzables };

if (require.main === module) main();
