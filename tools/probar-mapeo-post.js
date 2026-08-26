#!/usr/bin/env node
/**
 * tools/probar-mapeo-post.js — control del `MAPEO` de `reuniones/Agenda JM | Post`
 * (24/08/2026, la fuente de `L-036`), **fuera de Apps Script** y leyendo el seed real.
 *
 * Hermano de `probar-mapeo-cc.js`, y guarda lo mismo: **el seed**. Que la letra `M` siga siendo
 * `Visualizaciones` **hoy** lo contesta `verificarEncabezadosDeMapeo()` contra la planilla viva,
 * que es mejor testigo que cualquier fixture; reimplementar acá un lector de `.xlsx` sería *el
 * instrumento que reproduce lógica del motor y la reproduce peor* (`CLAUDE.md` §4).
 *
 * ### Lo que afirma, y por qué cada cosa
 *
 * ⭐ **El control positivo son `id_cuenta` (A) y `alc_real` (G)**, que existen desde el 14/08 y
 * **comparten lector, lista y camino** con las tres que quedan. Si el extractor se rompe o la lista
 * se renombra, esos dos desaparecen también — y entonces el verde de las otras afirmaciones no
 * estaría diciendo nada. Un control que sólo busca lo que sospecha **no distingue «no está» de
 * «no miré»**.
 *
 * ⛔ **Las dos negativas son las que de verdad importan:**
 *
 *   1. **Las bandas por plataforma (O–AC) NO se mapean.** Es la decisión del usuario del 14/08,
 *      escrita en `SOLAPAS` y en el seed: *digital manda* para el desglose, y las cuatro celdas
 *      medidas empatan exacto (`V-21`…`V-24`). Los títulos de la fila 2 **se repiten cuatro
 *      veces** —hay cuatro `% CTR` y cuatro `Visualizaciones`—, así que una fila de más acá es
 *      una segunda respuesta a una pregunta que ya tiene una, y elegir mal no falla: publica.
 *   2. **`post_camp`, `post_periodo` y `post_formato` NO están mapeados en ninguna parte.** No es
 *      un olvido: **ninguna solapa `fuente` de `reuniones` ni de `digital` tiene esas columnas**
 *      —barrido por `formato|campa|período|pieza` sobre las diez, 24/08— y quedaron como pregunta
 *      al equipo, sin prioridad (usuario, 24/08). ⚠ **El día que alguien las agregue, esto tiene
 *      que ponerse rojo** y mandarlo a leer `PENDIENTES`: una columna elegida a ojo para llenar
 *      un casillero es exactamente cómo nace un número plausible.
 *
 * ⚠ **`vis_totales` y `vis_vtr_pct` son nombres NUEVOS y eso se afirma aparte.**
 * `TIPO_ESPERADO_POR_CAMPO_` es **por campo lógico y global**, así que un nombre reusado se lleva
 * el tipo del otro dueño sin avisar. `poblacion` e `imp_totales` **sí** se reusan, a propósito.
 *
 * Uso:
 *   node tools/probar-mapeo-post.js
 *   node tools/probar-mapeo-post.js --autoprueba    (control negativo: rompe y exige el MOTIVO)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');

const SOLAPA = 'Agenda JM | Post';

/** Extrae una `var NOMBRE_ = [ … ];` o `= { … };` contando delimitadores. Falla fuerte si no está. */
function extraer(texto, nombre, abre, cierra) {
  const inicio = texto.indexOf('var ' + nombre + ' = ' + abre);
  if (inicio === -1) {
    throw new Error('No encontré `var ' + nombre + ' = ' + abre + '` en Instalar.gs — si se ' +
      'renombró, esta prueba tiene que enterarse en vez de dar verde sobre otra cosa.');
  }
  let i = texto.indexOf(abre, inicio), nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === abre) nivel++;
    else if (texto[j] === cierra) { nivel--; if (nivel === 0) return texto.slice(i, j + 1); }
  }
  throw new Error('`' + nombre + '` sin cerrar.');
}

/** A→1, AC→29. Para decidir si una letra cae en la zona de bandas por plataforma. */
function indiceDeColumna(letra) {
  let n = 0;
  for (const ch of String(letra || '').toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}
const COL_O = indiceDeColumna('O');   // 15 — arranca la banda Meta
const COL_AC = indiceDeColumna('AC'); // 29 — termina la banda Programmatic

/* Lo que cada casillero de `L-036` necesita, con la letra y el encabezado MEDIDOS sobre el fixture
 * del 20/08 (`DGPLES _ Seguimiento ECVs`, sha `f8ef3227…`), encabezado en la fila 2. */
const ESPERADAS = [
  { campo: 'fecha_periodo', columna: 'E', encabezado: 'Fecha', tipo: 'fecha', nuevo: false },
  { campo: 'poblacion', columna: 'F', encabezado: 'Habitantes', tipo: 'numero', nuevo: false },
  { campo: 'imp_totales', columna: 'J', encabezado: 'Impresiones totales', tipo: 'numero', nuevo: false }
];

/** Los tres tokens que quedaron sin fuente y sin prioridad. Ninguno puede tener fila. */
/** Los tres sin columna. ⚠ Y los DOS campos retirados el 25/08, que es otro motivo. */
const PARQUEADOS = ['post_camp', 'post_periodo', 'post_formato'];
/* ⭐⭐ `2026-08-25` (tarde) — **`vis_totales` y `vis_vtr_pct` VUELVEN, y con `por_posicion`.**
 *
 * ⛔ **Estuvieron RETIRADOS unas horas del mismo día**, y la afirmación negativa que los vigilaba
 * **se puso roja hoy y tenía razón**: el estado cambió. Se habían sacado porque `Visualizaciones` y
 * `% VTR` aparecen CUATRO veces en el encabezado y `leerFuente` indexa **por título**, así que
 * ganaba Programmatic —`21.229` donde el total es `41.204`—.
 *
 * ⭐ **Lo que cambió es el LECTOR, no el mapeo:** con `MAPEO.por_posicion` la celda se lee por
 * índice (M = 12, N = 13). La letra siempre fue correcta.
 *
 * ⭐⭐ **Y el control no se afloja: la afirmación cambia de sentido y gana EXIGENCIA.** Antes pedía
 * *«que no estén»*; ahora pide que estén **Y que declaren `por_posicion`**. Mapearlas sin esa
 * columna volvería a publicar Programmatic, y eso tiene que ponerse rojo. */
const POR_POSICION = ['vis_totales', 'vis_vtr_pct'];

/** El mismo criterio que `esVerdadero_` de `Config.gs`: `sí` con o sin tilde, `true`, `x`, `1`. */
function esVerdadero(v) {
  return ['sí', 'si', 'true', 'x', '1'].indexOf(String(v == null ? '' : v).trim().toLowerCase()) !== -1;
}

function correr(fuente, silencioso) {
  const filas = new Function('return ' + extraer(fuente, 'SEED_MAPEO_REUNIONES_', '[', ']'))();
  const tipos = new Function('return ' + extraer(fuente, 'TIPO_ESPERADO_POR_CAMPO_', '{', '}'))();
  const testigos = new Function('return ' + extraer(fuente, 'ENCABEZADO_POR_MAPEO_', '{', '}'))();

  const post = {};
  filas.forEach((f) => { if (f.hoja === SOLAPA) post[f.campo_logico] = f; });

  const fallas = [];
  let ok = 0;
  const di = (t) => { if (!silencioso) console.log(t); };
  const af = (nombre, cond, detalle) => {
    if (cond) { ok++; di('  ✅ ' + nombre); }
    else { fallas.push(nombre); di('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
  };

  di('');
  di('1 · control positivo — lo que YA estaba y comparte camino con lo nuevo');
  af('id_cuenta sigue en la A', !!post.id_cuenta && post.id_cuenta.columna === 'A',
    'sin esto, el verde de abajo no distingue «está bien» de «no leí la lista»');
  af('alc_real sigue en la G', !!post.alc_real && post.alc_real.columna === 'G');

  di('');
  di('2 · las TRES columnas de L-036 que se pueden leer sin ambigüedad (3 de 8)');
  ESPERADAS.forEach((e) => {
    const f = post[e.campo];
    af('`' + e.campo + '` está mapeado', !!f, 'no hay fila para ' + SOLAPA);
    if (!f) return;
    af('  ' + e.campo + ' → columna ' + e.columna, f.columna === e.columna, 'dice ' + f.columna);
    af('  ' + e.campo + ' lleva encabezado testigo (D-31) "' + e.encabezado + '"',
      testigos['reuniones|' + SOLAPA + '|' + e.campo] === e.encabezado,
      'dice ' + JSON.stringify(testigos['reuniones|' + SOLAPA + '|' + e.campo]));
    af('  ' + e.campo + ' resuelve tipo_esperado = ' + e.tipo, tipos[e.campo] === e.tipo,
      'dice ' + JSON.stringify(tipos[e.campo]));
  });

  di('');
  di('3 · ⛔ NEGATIVA — las bandas por plataforma (O–AC) no se mapean: digital manda (14/08)');
  const bandas = Object.keys(post).filter((c) => {
    const n = indiceDeColumna(post[c].columna);
    return n >= COL_O && n <= COL_AC;
  });
  af('ninguna fila de esta solapa apunta a O–AC', bandas.length === 0,
    'apuntan ' + bandas.join(', ') + ' — los títulos de la fila 2 se repiten CUATRO veces en esta ' +
    'solapa; mapear una banda es una segunda respuesta a una pregunta que ya tiene una (V-21…V-24)');

  di('');
  di('4 · ⛔ NEGATIVA — lo que NO se mapea, y son DOS motivos distintos');
  /* ⭐⭐ La afirmación cambió de sentido el 25/08 y GANÓ exigencia: ahora son DOS condiciones y
   * hay que cumplir las dos. Mapearlas **sin** `por_posicion` volvería a publicar Programmatic
   * —`21.229` donde el total es `41.204`— **sin fallar**, que es justo lo que hay que impedir. */
  POR_POSICION.forEach((campo) => {
    af('`' + campo + '` está mapeado', !!post[campo],
      'volvieron el 25/08 con MAPEO.por_posicion: la celda se lee por índice, no por título');
    /* ⭐⭐ `2026-08-26` — **dada vuelta.** Pedía `por_posicion` y pasaba; el mecanismo nunca
     * corrió y estos dos leyeron Programmatic igual. Con títulos únicos la declaración se
     * retiró, y lo que se exige ahora es el ENCABEZADO MEDIDO, que sí es el testigo real. */
    af('  …y NO declara `por_posicion` — títulos únicos desde el 26/08',
      !!post[campo] && !esVerdadero(post[campo].por_posicion),
      'declararlo sobre un mecanismo inerte es lo que hizo leer el bug como resuelto');
  });
  PARQUEADOS.forEach((t) => {
    const hay = new RegExp('campo_logico:\\s*.' + t + '.').test(fuente);
    af(t + ' NO tiene fila en ningún seed de MAPEO', !hay,
      'apareció una fila — si es deliberado, actualizá PENDIENTES y este control; si se eligió ' +
      'una columna a ojo para llenar el casillero, eso es un número plausible naciendo');
  });

  di('');
  di('5 · los dos nombres NUEVOS no pisan a nadie (TIPO_ESPERADO_POR_CAMPO_ es global)');
  ESPERADAS.filter((e) => e.nuevo).forEach((e) => {
    const usos = filas.filter((f) => f.campo_logico === e.campo).length;
    af('`' + e.campo + '` lo usa una sola solapa de reuniones', usos === 1, 'lo usan ' + usos);
  });
  ESPERADAS.filter((e) => !e.nuevo && e.campo !== 'fecha_periodo').forEach((e) => {
    af('`' + e.campo + '` se REUSA a propósito y ya tenía dueño en otra base o solapa',
      filas.some((f) => f.campo_logico === e.campo && f.hoja !== SOLAPA) ||
      new RegExp('campo_logico: .' + e.campo + '.').test(fuente));
  });

  return { ok: ok, fallas: fallas };
}

if (process.argv.indexOf('--autoprueba') !== -1) {
  /* ⭐ Romper y ver rojo NO alcanza: hay que mirar **cuál** afirmación cae y **por qué motivo**.
   * Una afirmación que sigue en verde con la causa desactivada no mide lo que dice medir. */
  console.log('== autoprueba: control negativo CON MOTIVO ==');
  let malas = 0;
  const casos = [
    {
      nombre: 'saco la fila de `imp_totales`',
      mutar: (s) => s.replace(/[^\r\n]*campo_logico: 'imp_totales', hoja: 'Agenda JM [|] Post'[^\r\n]*/, ''),
      esperaQueCaiga: '`imp_totales` está mapeado'
    },
    {
      nombre: 'inyecto una fila para `post_formato`',
      mutar: (s) => s.replace("{ base_id: 'reuniones', campo_logico: 'poblacion'",
        "{ base_id: 'reuniones', campo_logico: 'post_formato', hoja: 'Agenda JM | Post', columna: 'D' }, " +
        "{ base_id: 'reuniones', campo_logico: 'poblacion'"),
      esperaQueCaiga: 'post_formato NO tiene fila en ningún seed de MAPEO'
    },
    {
      /* ⛔⛔ El caso que guarda lo del 25/08: si alguien vuelve a mapear `vis_totales`, la
       * afirmación NEGATIVA tiene que caer. Sin este caso, esa afirmación podría estar pasando
       * porque el campo no existe en ningún lado, y no porque el control lo vigile. */
      /* ⭐ El negativo también se da vuelta: ahora rompe el ENCABEZADO, que es el testigo que
       * de verdad decide qué columna se lee en esta solapa. */
      nombre: 'le devuelvo a `vis_totales` el encabezado viejo, el que se repetía',
      mutar: (s) => s.replace("columna: 'M', encabezado: 'Visualizaciones totales'",
        "columna: 'M', encabezado: 'Visualizaciones'"),
      esperaQueCaiga: '  …lleva el encabezado ÚNICO medido el 26/08'
    },
    {
      nombre: 'le cambio el encabezado testigo a `poblacion`',
      mutar: (s) => s.replace("'reuniones|Agenda JM | Post|poblacion': 'Habitantes'",
        "'reuniones|Agenda JM | Post|poblacion': 'Poblacion'"),
      esperaQueCaiga: '  poblacion lleva encabezado testigo (D-31) "Habitantes"'
    }
  ];
  casos.forEach((c) => {
    const mutado = c.mutar(FUENTE);
    if (mutado === FUENTE) {
      console.log('  ⛔ ' + c.nombre + ' — la mutación NO cambió nada, así que este caso no prueba nada');
      malas++;
      return;
    }
    const r = correr(mutado, true);
    if (r.fallas.indexOf(c.esperaQueCaiga) !== -1) {
      console.log('  ✅ ' + c.nombre + ' → cae la correcta ("' + c.esperaQueCaiga + '"), ' +
        r.fallas.length + ' afirmación(es) en rojo');
    } else {
      malas++;
      console.log('  ⛔ ' + c.nombre + ' → NO cayó la esperada. Cayeron: ' +
        (r.fallas.join(' · ') || '(ninguna — el control no ve la causa)'));
    }
  });
  console.log('');
  console.log(malas ? '⛔ la autoprueba encontró ' + malas + ' caso(s) mal medido(s).'
    : '✅ los ' + casos.length + ' casos negativos caen por el motivo correcto.');
  process.exit(malas ? 1 : 0);
}

console.log('== probar-mapeo-post — `reuniones/Agenda JM | Post`, la fuente de L-036 ==');
const r = correr(FUENTE, false);
console.log('');
console.log(r.fallas.length
  ? '⛔ ' + r.fallas.length + ' de ' + (r.ok + r.fallas.length) + ' afirmaciones en rojo.'
  : '✅ Las ' + r.ok + ' afirmaciones pasaron.');
console.log('⚠ Lo que este control NO dice: que la columna E siga llamándose `Fecha` en la ' +
  'planilla VIVA. Eso lo contesta `verificarEncabezadosDeMapeo()`, y necesita una corrida.');
process.exit(r.fallas.length ? 1 : 0);
