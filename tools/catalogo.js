#!/usr/bin/env node
/**
 * tools/catalogo.js — genera el catálogo de tokens a partir de un snapshot de `MARCADORES`.
 *
 * **Frente 14 del plan, primera versión.** El objetivo declarado de toda la migración de `D-33`
 * es que alguien del equipo arme una filmina eligiendo tokens documentados que digan qué son y
 * cómo se arman. Esto es el primer paso: el catálogo **generado**, no escrito a mano.
 *
 * **Por qué generado.** Un catálogo a mano se desincroniza en la primera migración, y este
 * proyecto ya tiene el precedente escrito: `docs/INVENTARIO_CODIGO.md` es la foto del 01/08 y
 * envejece, mientras `tools/inventario.js` sigue siendo cierto. El dueño de la pregunta *"qué
 * mide cada token"* es **este script re-corrido**, nunca el `.md` que produce.
 *
 * **Lo que NO hace, y es deliberado.** No inventa columnas ni categorías: emite lo que
 * `MARCADORES` ya tiene. Decidir el formato definitivo del catálogo —qué agrupar, qué nombre
 * lleva cada cosa de cara al equipo, si `-` y `---` significan algo— **es una decisión del
 * usuario** y no se toma acá.
 *
 * **Cuándo se re-corre: después de cada tanda de la migración** (usuario, 16/08). Es parte de
 * cerrar la tanda, no una tarea aparte — un catálogo que se regenera cuando alguien se acuerda
 * es exactamente el `.md` a mano que esto vino a reemplazar.
 *
 * **Y para el día que se defina el formato definitivo: la columna `config` se conserva como
 * distinción.** Dice **"la fila está bien armada"**, no *"el token anda"*, y son cosas distintas
 * — ver el bloque de abajo. Llamarla `estado` habría hecho leer lo segundo donde sólo dice lo
 * primero, y ése es el acierto de esta primera versión que no hay que perder al rediseñarla.
 *
 * **La causa de un marcador en error se DERIVA, no se transcribe.** Un catálogo que sólo lista
 * lo que funciona miente por omisión, así que los que fallan entran igual. Pero la causa sale de
 * cruzar los tres registros de la MISMA fecha —`MARCADORES` × `SOLAPAS` × `MAPEO`— y no de citar
 * un documento: una cita envejece y este script tiene que seguir siendo cierto al re-correrlo.
 * Lo que se deriva es mecánico y verificable:
 *
 *   - la solapa del marcador no está `uso = fuente` en `SOLAPAS`  ->  `buscarMapeo` la rechaza
 *     antes de tocar `MAPEO` (`Config.gs:251`)
 *   - el `campo_logico` no tiene fila en `MAPEO` para esa (base, solapa)
 *   - el campo de una condición del `filtro` no tiene fila en `MAPEO` — un filtro **propio** con
 *     el campo sin mapear no filtra: falla
 *
 * ⚠ **Y acá está el límite de esta primera versión, que hay que leer antes de usar la columna.**
 * Lo que se deriva es si la **configuración resuelve**, y nada más. La columna se llama `config`
 * y no `estado` **a propósito**: medido contra el juego del 15/08 da **78 de 78 resuelven**,
 * mientras el motor publica **diez marcadores en error** en una corrida real. No hay
 * contradicción — son dos preguntas distintas:
 *
 *   - lo que esto ve:    la solapa es `fuente`, el campo está en `MAPEO`, el filtro cita campos
 *                        mapeados. **Estático, sobre tres TSV.**
 *   - lo que NO ve:      los errores de ejecución — `D-30` sin `id_cuenta` para el encuentro,
 *                        `«FALTA:@ultimo_sin_fecha_ambiguo»`, cero filas después del recorte por
 *                        ventana. **Ésos necesitan una corrida contra la planilla viva.**
 *
 * Un `config = resuelve` **no dice que el token publique bien**, ni siquiera que publique. Y
 * tampoco dice que el número salga de las filas correctas: un número puede salir del universo
 * equivocado y esto no lo ve.
 *
 * **Escribir esto como `ok` habría sido el error caro** — una etiqueta verde que significa algo
 * más chico de lo que parece, leída como si significara todo, que es el patrón que `CLAUDE.md`
 * §4 documenta con la prueba que probaba lo contrario de lo que decía.
 *
 * Uso:
 *   node tools/catalogo.js                     -> usa el snapshot más reciente de docs/_snapshots/
 *   node tools/catalogo.js 2026-08-15          -> usa el juego de esa fecha
 *   node tools/catalogo.js 2026-08-15 --stdout -> imprime en vez de escribir el archivo
 *   node tools/catalogo.js <fecha> --dir <ruta> -> lee los TSV de otra carpeta (control positivo)
 *
 * **El control positivo, y hay que correrlo al tocar la derivación de causa:** copiar el juego
 * a una carpeta aparte, romper dos filas a mano —una solapa a `ignorar`, un `campo_logico` que
 * no exista en `MAPEO`— y correr con `--dir`. Tiene que marcar exactamente esas dos y con la
 * causa correcta. Que el catálogo salga sin errores **no prueba nada**: sale sin errores
 * también cuando la derivación no funciona.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const SALIDA = path.join(RAIZ, 'docs', 'CATALOGO_tokens.md');

/**
 * De dónde salen los TSV. Es sobreescribible con `--dir` **para poder correr el control
 * positivo**: la única forma de saber que la derivación de causa funciona es alimentarla con un
 * juego roto a propósito y ver que lo marque. Sin esto, el control habría que hacerlo
 * ensuciando `docs/_snapshots/`, que es evidencia fechada y versionada.
 */
let SNAPSHOTS = path.join(RAIZ, 'docs', '_snapshots');

/* ─────────────────────────── lectura de los TSV ─────────────────────────── */

function leerTsv(archivo) {
  const crudo = fs.readFileSync(archivo, 'utf8').replace(/^﻿/, '');
  const lineas = crudo.split(/\r?\n/).filter((l) => l !== '');
  if (!lineas.length) return { headers: [], filas: [] };
  const headers = lineas.shift().split('\t');
  const filas = lineas.map((linea) => {
    const celdas = linea.split('\t');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = celdas[i] === undefined ? '' : celdas[i]; });
    return obj;
  });
  return { headers, filas };
}

/** La fecha del juego de snapshots a usar: la del `MARCADORES_*` más reciente que haya. */
function fechaMasReciente() {
  const fechas = fs.readdirSync(SNAPSHOTS)
    .map((n) => /^MARCADORES_(\d{4}-\d{2}-\d{2})\.tsv$/.exec(n))
    .filter(Boolean)
    .map((m) => m[1])
    .sort();
  if (!fechas.length) throw new Error('No hay ningún MARCADORES_*.tsv en docs/_snapshots/');
  return fechas[fechas.length - 1];
}

/* ─────────────────────────── normalización, R-10 ─────────────────────────── */

/**
 * `R-10`: colapsar espacios y `trim()`, **preservando mayúsculas y acentos**. Plegar el case
 * colapsaría encabezados reales que son columnas distintas. Es la forma de
 * `normalizarValorDeclarado_` (`Fuentes.gs`) y se repite acá **a propósito**: esta herramienta
 * es el contra-qué del motor, y si importara su normalizador dejaría de ser independiente —
 * mismo criterio que las tres listas de hojas que `tools/listas.js` compara.
 */
function normalizar(valor) {
  return String(valor === undefined || valor === null ? '' : valor).replace(/\s+/g, ' ').trim();
}

/* ─────────────────────────── el cruce que deriva la causa ─────────────────────────── */

/** Los campos lógicos que un marcador necesita resueltos: el propio, partido si es un ratio. */
function camposDelMarcador(fila) {
  const campo = normalizar(fila.campo_logico);
  if (!campo) return [];
  return campo.split('/').map(normalizar).filter(Boolean);
}

/**
 * Los campos que menciona el `filtro`. Se extrae el lado izquierdo de cada condición, con los
 * cuatro comparadores que el motor entiende. **Es una aproximación y se dice acá**: el parser
 * de verdad vive en `parsearFiltro_` y esto no lo reimplementa — sólo saca nombres para poder
 * chequearlos contra `MAPEO`. Un falso positivo se ve en la tabla; un falso negativo deja un
 * marcador marcado `ok` que el motor podría rechazar, que es el borde conocido.
 */
function camposDelFiltro(filtro) {
  const texto = normalizar(filtro);
  if (!texto) return [];
  const campos = [];
  texto.split('&&').forEach((cond) => {
    const m = /^\s*([^!~=<>]+?)\s*(!~=|~=|!=|=)/.exec(cond);
    if (m) campos.push(normalizar(m[1]));
  });
  return campos;
}

function construirIndiceMapeo(mapeo) {
  const idx = {};
  mapeo.filas.forEach((f) => {
    const clave = normalizar(f.base_id) + '||' + normalizar(f.solapa) + '||' + normalizar(f.campo_logico);
    idx[clave] = f;
  });
  return idx;
}

function construirIndiceSolapas(solapas) {
  const idx = {};
  solapas.filas.forEach((f) => {
    idx[normalizar(f.base_id) + '||' + normalizar(f.solapa)] = normalizar(f.uso);
  });
  return idx;
}

/**
 * Devuelve `{ estado, causa }` para un marcador. `estado` es `resuelve` o `no resuelve`, y se
 * refiere **sólo a la configuración**: es lo único que se puede afirmar sin correr el motor.
 */
function evaluar(fila, idxSolapas, idxMapeo) {
  const base = normalizar(fila.base_id);
  const solapa = normalizar(fila.solapa);
  const causas = [];

  // Un marcador de valor fijo no lee ninguna base: no tiene solapa que resolver.
  if (!base && !solapa && normalizar(fila.valor_fijo)) {
    return { estado: 'resuelve', causa: 'valor fijo — no lee ninguna base' };
  }

  const uso = idxSolapas[base + '||' + solapa];
  if (uso === undefined) {
    causas.push('la solapa `' + base + '/' + solapa + '` no está registrada en `SOLAPAS`');
  } else if (uso !== 'fuente') {
    causas.push('`' + base + '/' + solapa + '` está `uso = ' + uso + '`, y `buscarMapeo` exige `fuente`');
  }

  camposDelMarcador(fila).forEach((campo) => {
    if (!idxMapeo[base + '||' + solapa + '||' + campo]) {
      causas.push('`' + campo + '` no tiene fila en `MAPEO` para `' + base + '/' + solapa + '`');
    }
  });

  camposDelFiltro(fila.filtro).forEach((campo) => {
    if (!idxMapeo[base + '||' + solapa + '||' + campo]) {
      causas.push('el filtro menciona `' + campo + '`, sin fila en `MAPEO` para `' + base + '/' + solapa + '`');
    }
  });

  if (!causas.length) return { estado: 'resuelve', causa: '' };
  return { estado: 'no resuelve', causa: causas.join(' · ') };
}

/* ─────────────────────────── la salida ─────────────────────────── */

function celda(valor) {
  const texto = normalizar(valor);
  if (!texto) return '—';
  return '`' + texto.replace(/\|/g, '\\|') + '`';
}

function generar(fecha) {
  const rutaMarcadores = path.join(SNAPSHOTS, 'MARCADORES_' + fecha + '.tsv');
  const rutaSolapas = path.join(SNAPSHOTS, 'SOLAPAS_' + fecha + '.tsv');
  const rutaMapeo = path.join(SNAPSHOTS, 'MAPEO_' + fecha + '.tsv');
  [rutaMarcadores, rutaSolapas, rutaMapeo].forEach((r) => {
    if (!fs.existsSync(r)) throw new Error('Falta el snapshot ' + path.basename(r));
  });

  const marcadores = leerTsv(rutaMarcadores);
  const idxSolapas = construirIndiceSolapas(leerTsv(rutaSolapas));
  const idxMapeo = construirIndiceMapeo(leerTsv(rutaMapeo));

  // `dimensiones` nació el 15/08, DESPUÉS de este snapshot. Si la columna no está, se dice —
  // no se finge que el corte no existe.
  const tieneDimensiones = marcadores.headers.indexOf('dimensiones') !== -1;

  const evaluadas = marcadores.filas.map((f) => {
    const ev = evaluar(f, idxSolapas, idxMapeo);
    return { fila: f, estado: ev.estado, causa: ev.causa };
  });

  const enError = evaluadas.filter((e) => e.estado === 'no resuelve');
  const familias = {};
  evaluadas.forEach((e) => {
    const fam = normalizar(e.fila.familia) || '(sin familia)';
    if (!familias[fam]) familias[fam] = [];
    familias[fam].push(e);
  });

  const out = [];
  out.push('# Catálogo de tokens — generado desde `MARCADORES_' + fecha + '.tsv`');
  out.push('');
  out.push('> **Generado por `tools/catalogo.js` desde `docs/_snapshots/MARCADORES_' + fecha +
    '.tsv`, `SOLAPAS_' + fecha + '.tsv` y `MAPEO_' + fecha + '.tsv` — los tres del ' +
    fecha.split('-').reverse().join('/') + '.** Es **evidencia fechada, no el estado de hoy**: ' +
    'para saber qué hay ahora se re-corre el script contra un snapshot nuevo. El dueño de la ' +
    'pregunta es el script, nunca este archivo.');
  out.push('');
  out.push('**Primera versión (frente 14).** Emite lo que `MARCADORES` ya tiene, sin columnas ni ' +
    'categorías inventadas: **el formato definitivo del catálogo es una decisión del usuario y ' +
    'no está tomada.**');
  out.push('');
  out.push('## ⚠ Qué mide la columna `config`, y qué NO — leer esto antes de usarla');
  out.push('');
  out.push('**`config` dice si la configuración resuelve, y nada más.** Sale de cruzar los tres ' +
    'registros de esta misma fecha: la solapa tiene que estar `uso = fuente` en `SOLAPAS`, y ' +
    'cada campo lógico —el del marcador y los que menciona el filtro— tiene que tener fila en ' +
    '`MAPEO`.');
  out.push('');
  out.push('**Contra el juego del ' + fecha + ' da ' + (evaluadas.length - enError.length) +
    ' de ' + evaluadas.length + ' que resuelven, y el motor publica DIEZ marcadores en error en ' +
    'una corrida real.** No es una contradicción: son dos preguntas distintas, y confundirlas ' +
    'es el modo de falla que este proyecto ya pagó.');
  out.push('');
  out.push('| | |');
  out.push('|---|---|');
  out.push('| **lo que esto ve** | estático, sobre tres TSV: la solapa es `fuente`, el campo está ' +
    'en `MAPEO`, el filtro cita campos mapeados |');
  out.push('| **lo que NO ve** | los errores de **ejecución** — `D-30` sin `id_cuenta` para el ' +
    'encuentro, `«FALTA:@ultimo_sin_fecha_ambiguo»`, cero filas después del recorte por ventana. ' +
    'Necesitan una corrida contra la planilla viva |');
  out.push('| **lo que no ve nadie acá** | **de qué filas sale el número.** Un número correcto ' +
    'puede salir del universo equivocado, y eso no se ve ni estático ni en una corrida |');
  out.push('');
  out.push('Por eso la columna se llama `config` y **no** `estado`: una etiqueta verde que ' +
    'significa algo más chico de lo que parece se lee como si significara todo.');
  out.push('');
  if (!tieneDimensiones) {
    out.push('⚠ **Este snapshot no tiene la columna `dimensiones`.** Nació el 15/08 con el piloto ' +
      'de `D-33`, después de esta toma, así que el catálogo **no puede mostrar el corte por ' +
      'dimensión de ningún marcador** — sólo el `filtro` de texto. No es que no haya cortes: es ' +
      'que esta foto es anterior a que se declararan.');
    out.push('');
  }
  out.push('**' + evaluadas.length + ' marcadores** · **' + (evaluadas.length - enError.length) +
    ' con la configuración resuelta** · **' + enError.length + ' sin resolver**.');
  out.push('');

  Object.keys(familias).sort().forEach((fam) => {
    out.push('## Familia `' + fam + '` — ' + familias[fam].length + ' token(s)');
    out.push('');
    out.push('| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro' +
      (tieneDimensiones ? ' | dimensiones' : '') + ' | formato | config |');
    out.push('|---|---|---|---|---|---|' + (tieneDimensiones ? '---|' : '') + '---|---|');
    familias[fam].forEach((e) => {
      const f = e.fila;
      const ubicacion = normalizar(f.base_id) && normalizar(f.solapa)
        ? '`' + normalizar(f.base_id) + '/' + normalizar(f.solapa) + '`'
        : '—';
      const cols = [
        '**`' + normalizar(f.marcador) + '`**',
        celda(f.informe_id),
        celda(f.campo_logico),
        ubicacion,
        celda(f.operacion),
        celda(f.filtro)
      ];
      if (tieneDimensiones) cols.push(celda(f.dimensiones));
      cols.push(celda(f.formato));
      cols.push(e.estado === 'resuelve' ? 'resuelve' : '**no resuelve**');
      out.push('| ' + cols.join(' | ') + ' |');
    });
    out.push('');
  });

  out.push(enError.length === 1
    ? '## El que no resuelve la configuración, con la causa derivada'
    : '## Los ' + enError.length + ' que no resuelven la configuración, con la causa derivada');
  out.push('');
  if (!enError.length) {
    out.push('**Ninguno.** Los ' + evaluadas.length + ' marcadores de este snapshot resuelven su ' +
      'solapa y sus campos.');
    out.push('');
    out.push('⚠ **Y eso NO quiere decir que los ' + evaluadas.length + ' publiquen bien.** Los ' +
      'diez que el motor reporta en error fallan **en ejecución**, y esta tabla es estática: ' +
      'ninguna de sus causas —`D-30` sin `id_cuenta`, `ULTIMO` sin fecha utilizable, cero filas ' +
      'tras el recorte— deja rastro en `MARCADORES`, `SOLAPAS` ni `MAPEO`. **Para que entren al ' +
      'catálogo hace falta una corrida contra la planilla viva**, y esa corrida está en la lista ' +
      'de pendientes. Es la limitación principal de esta primera versión.');
  } else {
    out.push('**Entran al catálogo a propósito.** Uno que sólo listara lo que funciona mentiría ' +
      'por omisión. La causa de abajo es **derivada del cruce**, no citada de un documento.');
    out.push('');
    out.push('| token | base / solapa | causa |');
    out.push('|---|---|---|');
    enError.forEach((e) => {
      const f = e.fila;
      out.push('| **`' + normalizar(f.marcador) + '`** | `' + normalizar(f.base_id) + '/' +
        normalizar(f.solapa) + '` | ' + e.causa + ' |');
    });
  }
  out.push('');

  return out.join('\n') + '\n';
}

/* ─────────────────────────── entrada ─────────────────────────── */

function main() {
  const args = process.argv.slice(2);
  const aStdout = args.indexOf('--stdout') !== -1;

  const iDir = args.indexOf('--dir');
  if (iDir !== -1) {
    if (!args[iDir + 1]) throw new Error('--dir necesita una ruta');
    SNAPSHOTS = path.resolve(args[iDir + 1]);
  }

  const fecha = args.filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))[0] || fechaMasReciente();

  const texto = generar(fecha);
  if (aStdout) {
    process.stdout.write(texto);
    return;
  }
  fs.writeFileSync(SALIDA, texto, 'utf8');
  console.log('Catálogo escrito en docs/CATALOGO_tokens.md desde el juego del ' + fecha + '.');
}

main();
