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
 * **comparten lector, lista y camino** con las cinco nuevas. Si el extractor se rompe o la lista
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
  { campo: 'imp_totales', columna: 'J', encabezado: 'Impresiones totales', tipo: 'numero', nuevo: false },
  { campo: 'vis_totales', columna: 'M', encabezado: 'Visualizaciones', tipo: 'numero', nuevo: true },
  { campo: 'vis_vtr_pct', columna: 'N', encabezado: '% VTR', tipo: 'numero', nuevo: true }
];

/** Los tres tokens que quedaron sin fuente y sin prioridad. Ninguno puede tener fila. */
const PARQUEADOS = ['post_camp', 'post_periodo', 'post_formato'];

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
  di('2 · las cinco columnas de L-036 que SÍ tienen fuente (5 de 8)');
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
  di('4 · ⛔ NEGATIVA — los tres tokens sin fuente siguen sin fila (pregunta al equipo, 24/08)');
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
      nombre: 'saco la fila de `vis_totales`',
      mutar: (s) => s.replace(/\n[^\n]*campo_logico: 'vis_totales'[^\n]*\n/, '\n'),
      esperaQueCaiga: '`vis_totales` está mapeado'
    },
    {
      nombre: 'inyecto una fila para `post_formato`',
      mutar: (s) => s.replace("  { base_id: 'reuniones', campo_logico: 'vis_totales'",
        "  { base_id: 'reuniones', campo_logico: 'post_formato', hoja: 'Agenda JM | Post', columna: 'D' },\n" +
        "  { base_id: 'reuniones', campo_logico: 'vis_totales'"),
      esperaQueCaiga: 'post_formato NO tiene fila en ningún seed de MAPEO'
    },
    {
      nombre: 'muevo `vis_totales` a la banda de Meta (O)',
      mutar: (s) => s.replace("campo_logico: 'vis_totales', hoja: 'Agenda JM | Post', columna: 'M'",
        "campo_logico: 'vis_totales', hoja: 'Agenda JM | Post', columna: 'O'"),
      esperaQueCaiga: 'ninguna fila de esta solapa apunta a O–AC'
    },
    {
      nombre: 'le cambio el encabezado testigo a `vis_vtr_pct`',
      mutar: (s) => s.replace("'reuniones|Agenda JM | Post|vis_vtr_pct': '% VTR'",
        "'reuniones|Agenda JM | Post|vis_vtr_pct': 'VTR'"),
      esperaQueCaiga: '  vis_vtr_pct lleva encabezado testigo (D-31) "% VTR"'
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
