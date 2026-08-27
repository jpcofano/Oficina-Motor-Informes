#!/usr/bin/env node
/**
 * tools/probar-tabla-post.js — **la tabla de `L-036`**: los 12 marcadores y los tres bordes que
 * `julio_24_30` ejercita (25/08/2026).
 *
 * Hermano de `probar-tabla-envios.js`. Guarda dos cosas distintas y conviene no mezclarlas:
 *
 *   - **el seed** — que los 12 existan, y que las CINCO que NO se cablean no aparezcan, con sus dos motivos
 *   - **el comportamiento de `opFILA`** sobre los datos reales de `julio_24_30`, que es lo que
 *     hace que este control valga como control y no como inventario.
 *
 * ⭐ **El fixture NO es inventado: son las dos filas reales de `reuniones/Agenda JM | Post`** del
 * export del 20/08 (`DGPLES _ Seguimiento ECVs`, sha `f8ef3227…`), copiadas y no deducidas — la
 * regla del 17/08. Y por eso los tres bordes son los de verdad y no tres casos elegidos:
 *
 *   1. **Retiro** tiene el camino entero, y las tres columnas salen de **su misma fila**.
 *   2. **San Cristóbal** está en **ceros** → *cero real*, que NO es *sin dato*.
 *   3. Son **2 ítems para 4 ranuras** → las filas 3 y 4 salen `sin_datos`, que **no es error**.
 *
 * ⚠ **Lo que este control NO dice, y está anotado en `PENDIENTES`:** que el `id_cuenta` del
 * anclaje coincida con el de la solapa. El cruce del 24/08 fue por `Barrio / Comuna`. **Eso lo
 * cierra una corrida, no un banco.**
 *
 * Uso:
 *   node tools/probar-tabla-post.js
 *   node tools/probar-tabla-post.js --autoprueba
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const MARCADORES_GS = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');
const CENSO = fs.readFileSync(path.join(RAIZ, 'docs', 'CENSO_tokens_sin_fila_2026-08-22.md'), 'utf8');

let fallas = [];
let ok = 0;
function af(cond, msg, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + msg); }
  else { fallas.push(msg); console.log('  ⛔ ' + msg + (detalle ? ' — ' + detalle : '')); }
}

/** El bloque de `L-036` del censo, como LISTA. Cruzar es pertenencia; filtrar por prefijo es regla. */
function tokensDelCenso() {
  const m = CENSO.match(/l[áa]mina\s+9\s+·\s+L-036[^\n]*\n((?:\s{4,}[^\n]*\n)+)/);
  if (!m) throw new Error('No encontré el bloque de L-036 en el censo — si el formato cambió, ' +
    'esta prueba tiene que enterarse en vez de dar verde sobre una lista vacía.');
  return m[1].split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);
}

/** Las filas que el wrapper escribe, ejecutando el seed real con `curarMarcadores_` stubeado. */
function filasDelWrapper(fuente) {
  const ctx = { console, Math, JSON, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} } };
  vm.createContext(ctx);
  const bloque = fuente.match(/var COLUMNAS_POST_L036_ = \[[\s\S]*?\n\];/);
  if (!bloque) throw new Error('No encontré `COLUMNAS_POST_L036_` — si se renombró, esta prueba ' +
    'tiene que enterarse en vez de dar verde sobre otra cosa.');
  const fn = fuente.match(/function cablearTablaPostReuniones_\(\) \{[\s\S]*?\n\}/);
  if (!fn) throw new Error('No encontré `cablearTablaPostReuniones_`.');
  let capturadas = null;
  ctx.curarMarcadores_ = (quitar, agregar) => { capturadas = agregar; return { ok: true }; };
  vm.runInContext(bloque[0] + '\n' + fn[0] + '\ncablearTablaPostReuniones_();', ctx);
  return capturadas;
}

/** `opFILA` real, extraída de `Marcadores.gs`. No se reimplementa (`CLAUDE.md` §4). */
function contextoFila() {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: () => {} } };
  vm.createContext(ctx);
  const trozos = ['cacheFilasOrdenadas_', 'huellaDeFilas_', 'filasOrdenadas_', 'opFILA'];
  trozos.forEach((n) => {
    const re = n === 'cacheFilasOrdenadas_'
      ? /var cacheFilasOrdenadas_ = \{\};/
      : new RegExp('function ' + n + '\\([\\s\\S]*?\\n\\}');
    const m = MARCADORES_GS.match(re);
    if (!m) throw new Error('No encontré `' + n + '` en Marcadores.gs.');
    vm.runInContext(m[0], ctx);
  });
  ctx.trazaDeVentana_ = () => '';
  return ctx;
}

/* ⭐ Las DOS filas reales de `Agenda JM | Post` para los ítems de `etapa=post` de `julio_24_30`.
 * Copiadas del fixture del 20/08. Las claves son los encabezados de la fila 2 de la solapa. */
const RETIRO = { ID: '3346-JULJDGAG', Habitantes: 41475, Alcance: 47753,
  'Impresiones totales': 136971, Visualizaciones: 41204, '% VTR': 0.300822801906973, Fecha: 46227 };
const SAN_CRISTOBAL = { ID: '3354-JULJDGAG', Habitantes: 41240, Alcance: 0,
  'Impresiones totales': 0, Visualizaciones: 0, '% VTR': 0, Fecha: 46226 };

console.log('== probar-tabla-post — los 24 de `L-036` y los tres bordes de julio_24_30 ==');

console.log('\n1 · control positivo — el censo se leyó (32 tokens en L-036)');
const censo = tokensDelCenso();
af(censo.length === 32, 'el bloque de L-036 trae los 32 tokens (' + censo.length + ')');
af(censo.indexOf('post_camp1') !== -1, 'y trae `post_camp1`, que es de los que NO se cablean');

console.log('\n2 · cruce UNO POR UNO contra el censo — 3 columnas × 4 filas');
const filas = filasDelWrapper(FUENTE);
af(filas.length === 28, 'el wrapper escribe 28 y nada más (' + filas.length + ')');
const porNombre = {};
filas.forEach((f) => { porNombre[f.marcador] = f; });
['habitantes', 'alcance', 'impresiones', 'vistas', 'vtr', 'camp', 'periodo'].forEach((col) => {
  for (let n = 1; n <= 4; n++) {
    const t = 'post_' + col + n;
    af(censo.indexOf(t) !== -1 && !!porNombre[t], t + ' está en el censo y tiene fila');
  }
});

console.log('\n3 · ⛔ NEGATIVA — las DOS que NO se cablean, por dos motivos distintos');
/* ⭐⭐ `2026-08-25_1` — **`camp` sale de esta lista y su afirmación GANA exigencia.**
 *
 * ⛔ La negativa decía *«NO HAY COLUMNA en ninguna solapa fuente»*, y **era cierta**: se barrieron
 * las 29 columnas de `Agenda JM | Post` buscando `nombre`, `campaña`, `evento` y `encuentro`, y
 * dieron **cero**. **Se puso roja hoy porque el estado cambió** — que es para lo que se escribió.
 *
 * ⭐ **Y lo que cambió no es que apareciera una columna: es que el nombre se COMPONE** de cuatro
 * (B/C/D/E) con `FILA_TEXTO`. Por eso la afirmación nueva no es *«existe»* sino **las cuatro
 * condiciones del bloque 4 bis**: sin ellas el marcador compila, corre, y publica un nombre corrido
 * de fila **sin fallar**. */
['formato'].forEach((col) => {
  const cableadas = [1, 2, 3, 4].filter((n) => !!porNombre['post_' + col + n]).length;
  af(cableadas === 0, 'post_' + col + '1-4 NO tienen fila',
    'si aparecen, se eligió una columna a ojo y eso publica texto distinto del que el equipo publica');
});

console.log('\n3 bis · ⭐⭐ `2026-08-25_3` — `periodo` SE CABLEA, y su afirmación gana EXIGENCIA');
/* ⛔ La negativa de arriba decía *«NO HAY COLUMNA en ninguna solapa fuente»*, y **era cierta**: se
 * barrieron las 29 columnas de `Agenda JM | Post` y ninguna trae fecha de inicio ni de fin. **Se
 * puso roja hoy porque el estado cambió** — que es exactamente para lo que se escribió, y es el
 * tercer caso de esta misma familia en este archivo (`camp`, `vistas`/`vtr`, y ahora éste).
 *
 * ⭐ **Lo que cambió no es que apareciera una columna: es que el rango sale de OTRA SOLAPA**, con
 * una operación que agrupa por encuentro. Por eso la afirmación nueva no es *«existe»* sino las
 * **cuatro condiciones** de abajo: sin ellas el marcador compila, corre, y publica un rango
 * plausible del universo equivocado **sin fallar**.
 *
 * ⚠ **Y el control no se aflojó para que entre**: `formato` sigue en la negativa, y estas cuatro
 * afirmaciones son **más** exigentes que el `cableadas === 0` que reemplazan. */
{
  const cableadas = [1, 2, 3, 4].filter((n) => !!porNombre['post_periodo' + n]).length;
  af(cableadas === 4, '⭐ post_periodo1-4 SE CABLEAN — el rango sale del desglose',
    'Agenda JM | Post no trae fecha de inicio ni de fin: se barrieron sus 29 columnas');
  const p1 = porNombre.post_periodo1 || {};
  af(p1.base_id === 'digital' && p1.solapa === 'CAMPAÑAS_DESGLOCE_DIGITAL',
    '⛔ apunta a `digital/CAMPAÑAS_DESGLOCE_DIGITAL` — la ÚNICA de las siete que cruza de solapa',
    'contra Agenda JM | Post no hay columna de fecha de inicio: publicaría un hueco o la columna equivocada');
  af(p1.operacion === 'GRUPO_TEXTO',
    '⛔⛔ y usa `GRUPO_TEXTO`, no `FILA_TEXTO`: un encuentro tiene hasta CINCO filas de plataforma',
    '`opFILA` indexa FILAS — publicaría las fechas de una plataforma como si fueran las del encuentro');
  af(String(p1.dimensiones || '').indexOf('etapa=post') !== -1,
    '⭐ y el corte POST va en `dimensiones` (`etapa=post`), no en un `filtro` nuevo (`D-33`)',
    'sin el corte, el rango abarcaría también las campañas PRE del mismo encuentro');
  af(String(p1.filtro || '').trim() === '',
    '⚠ y `filtro` queda vacío — es para restricciones técnicas, no para cortes que el equipo pediría');
  af(String(p1.valor_fijo) === '1' && p1.separador === 'fecha_periodo',
    '⭐ ranura entero pelado (`C-83`) y el campo de orden declarado, igual que las otras seis');
}
/* ⭐⭐ `2026-08-25` (tarde) — **`vistas` y `vtr` VUELVEN, y su afirmación gana EXIGENCIA.**
 *
 * ⛔ Estuvieron retiradas unas horas del mismo día, y la afirmación negativa que las vigilaba **se
 * puso roja hoy y tenía razón**: el estado cambió. `Visualizaciones` y `% VTR` aparecen **cuatro
 * veces cada uno** y el lector indexaba por título, así que ganaba Programmatic.
 *
 * ⭐ **Lo que cambió es el LECTOR:** `MAPEO.por_posicion` hace que se lean por índice (M = 12,
 * N = 13). Por eso ahora se exige **que estén cableadas Y que su campo declare la lectura por
 * posición** — cablearlas sin eso volvería a publicar `21.229` en vez de `41.204`, **sin fallar**. */
['vistas', 'vtr'].forEach((col) => {
  const cableadas = [1, 2, 3, 4].filter((n) => !!porNombre['post_' + col + n]).length;
  af(cableadas === 4, '⭐ post_' + col + '1-4 SE CABLEAN — vuelven con lectura por posición',
    'se retiraron la mañana del 25/08 y volvieron esa tarde: lo que cambió es el lector');
});

/* ⭐⭐ Y la condición que las hace correctas, afirmada aparte porque es la que se puede olvidar:
 * su campo lógico tiene que declarar `por_posicion` en el `SEED_MAPEO_`. Sin eso el cableado
 * compila, corre, y publica la columna de Programmatic. */
['vis_totales', 'vis_vtr_pct'].forEach((campo) => {
  const i = FUENTE.indexOf("campo_logico: '" + campo + "'");
  const fila = i === -1 ? '' : FUENTE.slice(i, FUENTE.indexOf('\n', i));
  /* ⭐⭐ `2026-08-26` — dada vuelta: lo que hace legible esta columna es el TÍTULO ÚNICO de la
   * solapa nueva, no `por_posicion`, que nunca corrió. */
  af(i !== -1 && fila.indexOf("por_posicion: 'sí'") === -1,
    '⭐ `' + campo + '` NO declara `por_posicion` — lo que la hace legible es el título único',
    'la letra M/N siempre fue correcta; lo que faltaba era que el lector la usara');
});

console.log('\n4 · la forma: FILA/FILA_TEXTO, MISMO orden, índice entero');
/* ⭐⭐ **Las seis columnas tienen que elegir LA MISMA FILA**, y eso son dos condiciones: el mismo
 * `separador` —el campo de orden— y el mismo `valor_fijo` —el índice—. Si el nombre se ordenara
 * distinto, la fila 2 del deck mostraría el nombre de un encuentro y los números de otro **sin
 * fallar**. Es el modo de falla que este banco existe para impedir. */
filas.forEach((f) => {
  const n = Number(f.marcador.slice(-1));
  if (f.marcador !== 'post_habitantes1' && n !== 1) return;   // una muestra por columna basta
  af(['FILA', 'FILA_TEXTO', 'GRUPO_TEXTO'].indexOf(f.operacion) !== -1 && f.separador === 'fecha_periodo',
    f.marcador + ' es FILA/FILA_TEXTO/GRUPO_TEXTO ordenada por `fecha_periodo` (no hay default: falla sin orden)');
});

console.log('\n4 bis · ⭐ el nombre compuesto: sus condiciones, y son varias');
{
  const c1 = porNombre['post_camp1'];
  af(!!c1, '`post_camp1` tiene fila');
  if (c1) {
    af(c1.operacion === 'FILA_TEXTO',
      '⭐ es `FILA_TEXTO` — con `FILA` a secas buscaría la plantilla entera como campo lógico',
      c1.operacion);
    af(c1.separador === 'fecha_periodo',
      '⭐⭐ ordena por el MISMO `fecha_periodo` que las otras cinco — es lo que alinea el nombre con sus números',
      c1.separador);
    af(String(c1.valor_fijo) === '1' && String(Number(c1.valor_fijo)) === String(c1.valor_fijo),
      'índice entero pelado (`C-83`: Sheets convierte `1/4` en fecha)', String(c1.valor_fijo));
    af(c1.formato === 'texto',
      '⭐ formato `texto` — con `miles` el nombre saldría vacío o coercionado', c1.formato);
    /* ⚠ Y que la plantilla mencione las cuatro columnas que el usuario decidió. Sin esto, alguien
     * podría dejar `{barrio}` solo y seguiría pasando todo lo de arriba. */
    ['figura', 'tipo_encuentro', 'barrio', 'fecha_periodo'].forEach((campo) => {
      af(String(c1.campo_logico).indexOf('{' + campo) !== -1,
        '  …y su plantilla menciona `' + campo + '`', c1.campo_logico);
    });
  }
}
af(filas.every((f) => typeof f.valor_fijo === 'number' && f.valor_fijo >= 1 && f.valor_fijo <= 4),
  '⛔ los 12 índices son ENTEROS PELADOS 1-4 — `1/4` lo convierte Sheets en fecha (C-83)');
/* ⭐ `2026-08-25_3` — **la afirmación se parte en dos y GANA exigencia.** Decía *«las 24 leen
 * `Agenda JM | Post`»*, y con `periodo` dejó de ser cierta. La salida no es aflojarla a *«leen
 * alguna solapa»* —eso no fallaría nunca— sino **nombrar exactamente cuáles leen dónde**: 24 la
 * solapa del par de `C-50`, 4 el desglose, y **ninguna otra**. */
{
  const enPost = filas.filter((f) => f.base_id === 'reuniones' && f.solapa === 'Agenda JM | Post');
  const enDesglose = filas.filter((f) => f.base_id === 'digital' && f.solapa === 'CAMPAÑAS_DESGLOCE_DIGITAL');
  af(enPost.length === 24, 'las 24 de las seis columnas leen `reuniones/Agenda JM | Post` (' + enPost.length + ')');
  af(enDesglose.length === 4, '⭐ y las 4 de `periodo` leen el desglose (' + enDesglose.length + ')');
  af(enPost.length + enDesglose.length === filas.length,
    '⛔ y no hay ninguna en una tercera solapa — el conjunto cierra');
  af(enDesglose.every((f) => f.marcador.indexOf('post_periodo') === 0),
    '⛔ y las del desglose son EXACTAMENTE las de `periodo`, verificadas por nombre completo',
    'un filtro por prefijo no alcanza: es una convención de nombre, no una clave');
}
{
  const conFiltro = filas.filter((f) => String(f.filtro || '').trim() !== '');
  const conDim = filas.filter((f) => String(f.dimensiones || '').trim() !== '');
  af(conFiltro.length === 0,
    '⛔ ninguna de las 28 declara `filtro`: el temario ya seleccionó (' + conFiltro.length + ')');
  /* ⭐ Y el corte dimensional está SÓLO donde hace falta. Las 24 de `Agenda JM | Post` no lo
   * necesitan —esa solapa ya es la POST—; las 4 del desglose sí, porque ahí conviven PRE y POST en
   * la misma solapa y se distinguen por el nombre de campaña (`D-33`). */
  af(conDim.length === 4 && conDim.every((f) => f.marcador.indexOf('post_periodo') === 0),
    '⭐ y `dimensiones` está SÓLO en las 4 del desglose, donde PRE y POST conviven (' + conDim.length + ')');
}

console.log('\n5 · ⭐ BORDE 1 — Retiro: FILA elige la fila correcta y las tres columnas son de ELLA');
{
  const ctx = contextoFila();
  const ctxFila = (campo, n, enc) => ({
    filas: [RETIRO, SAN_CRISTOBAL], separador: 'fecha_periodo', valor_fijo: n,
    ordenPor: { valores: [RETIRO.Fecha, SAN_CRISTOBAL.Fecha] },
    campo_logico: campo, encabezado: enc, columna: '?', base_id: 'reuniones', solapa: 'Agenda JM | Post'
  });
  /* Ordenado por fecha ascendente, San Cristóbal (46226) va PRIMERO y Retiro (46227) segundo. */
  const impres = ctx.opFILA(ctxFila('imp_totales', 2, 'Impresiones totales'));
  const hab = ctx.opFILA(ctxFila('poblacion', 2, 'Habitantes'));
  const alc = ctx.opFILA(ctxFila('alc_real', 2, 'Alcance'));
  af(impres.valor === 136971 && hab.valor === 41475 && alc.valor === 47753,
    '⭐ la fila 2 es Retiro y las TRES columnas salen de la MISMA fila — coherencia de fila');
  af(!impres.sin_datos && !impres.ambiguo, 'y sale con valor, no con hueco');
  /* ⚠ La identidad se verifica sobre el DATO, no sobre lo publicado: las dos columnas ya no se
   * mapean. Queda como afirmación de que el fixture es el real — y la diferencia entre eso y un
   * control del motor es exactamente lo que se perdió al retirarlas. */
  af(Math.abs((RETIRO.Visualizaciones / RETIRO['Impresiones totales']) - RETIRO['% VTR']) < 1e-12,
    '⚠ la identidad sigue siendo cierta EN EL DATO (41.204/136.971) pero YA NO SE PUBLICA');
}

console.log('\n6 · ⭐ BORDE 2 — San Cristóbal en CEROS: cero real, que NO es sin dato');
{
  const ctx = contextoFila();
  const c = {
    filas: [RETIRO, SAN_CRISTOBAL], separador: 'fecha_periodo', valor_fijo: 1,
    ordenPor: { valores: [RETIRO.Fecha, SAN_CRISTOBAL.Fecha] },
    campo_logico: 'imp_totales', encabezado: 'Impresiones totales', columna: 'J',
    base_id: 'reuniones', solapa: 'Agenda JM | Post'
  };
  const r = ctx.opFILA(c);
  af(r.valor === 0, 'la fila 1 es San Cristóbal y su valor es 0');
  af(!r.sin_datos,
    '⛔ y NO es `sin_datos`: un cero medido y un hueco mandan a trabajos distintos');
  /* ⚠ Y el habitantes SÍ tiene dato aunque el resto sea cero — la fila existe, la campaña no midió. */
  c.campo_logico = 'poblacion'; c.encabezado = 'Habitantes';
  af(ctx.opFILA(c).valor === 41240, 'y `poblacion` de esa misma fila sí trae 41.240');
}

console.log('\n7 · ⭐ BORDE 3 — 2 ítems para 4 ranuras: las filas 3 y 4 son `sin_datos`');
{
  const ctx = contextoFila();
  [3, 4].forEach((n) => {
    const r = ctx.opFILA({
      filas: [RETIRO, SAN_CRISTOBAL], separador: 'fecha_periodo', valor_fijo: n,
      ordenPor: { valores: [RETIRO.Fecha, SAN_CRISTOBAL.Fecha] },
      campo_logico: 'imp_totales', encabezado: 'Impresiones totales', columna: 'J',
      base_id: 'reuniones', solapa: 'Agenda JM | Post'
    });
    af(r.sin_datos === true && !r.ambiguo,
      'la fila ' + n + ' sale `sin_datos` y NO es error — no hay tanto encuentro');
  });
}


console.log('\n8 · ⛔⛔ la lista de REVERSIÓN cubre lo que se llegó a escribir, no lo que se escribe hoy');
{
  /* El caso del 25/08: `revertirTablaPostReuniones()` derivaba sus nombres de
   * `COLUMNAS_POST_L036_`. Cuando esa constante pasó de 5 columnas a 3, el reversor **dejó de ver
   * los 8 que había que sacar** — quitó 12, informó 12, y no falló. Es `CLAUDE.md` §4 literal: un
   * instrumento que mide un cambio no puede depender de lo que el cambio modifica. */
  const m = FUENTE.match(/var MARCADORES_POST_L036_TODOS_ = \[([\s\S]*?)\n\];/);
  af(!!m, 'existe `MARCADORES_POST_L036_TODOS_` — la lista literal de reversión');
  const todos = m ? (m[1].match(/'post_[a-z0-9_]+'/g) || []).map((s) => s.replace(/'/g, '')) : [];
  /* ⭐ Este número **sólo crece**: la lista cubre lo que `L-036` llegó a tener **alguna vez**, no lo
   * que tiene hoy. Si alguna vez baja, alguien la podó — y eso deja huérfanos que el reversor no
   * puede sacar, informando éxito. Es exactamente lo que pasó el 25/08 con los ocho de `vistas`
   * y `vtr`. */
  af(todos.length === 28, 'cubre los 28 que L-036 llegó a tener (' + todos.length + ')');
  af(todos.indexOf('post_camp1') !== -1 && todos.indexOf('post_camp4') !== -1,
    '⭐ y los cuatro `post_camp*` del nombre compuesto entraron a la lista de reversión');
  af(todos.indexOf('post_periodo1') !== -1 && todos.indexOf('post_periodo4') !== -1,
    '⭐ y los cuatro `post_periodo*` también — apuntan a OTRA base, y la reversión es por nombre');

  /* ⭐ Los 12 vigentes tienen que estar, y también los 8 RETIRADOS. Sin los retirados, el reversor
   * vuelve a quedar ciego exactamente como el 25/08. */
  filas.forEach((f) => {
    af(todos.indexOf(f.marcador) !== -1, 'la reversión cubre el vigente ' + f.marcador);
  });
  ['vistas', 'vtr'].forEach((col) => {
    for (let n = 1; n <= 4; n++) {
      const t = 'post_' + col + n;
      af(todos.indexOf(t) !== -1,
        '⛔ y cubre el RETIRADO ' + t + ' — si se poda, queda huérfano y nadie lo puede sacar');
    }
  });

  /* ⛔ Y la afirmación que hace que esto no se pueda romper como la vez pasada: la lista NO puede
   * derivarse de `COLUMNAS_POST_L036_`. */
  const cuerpo = FUENTE.slice(FUENTE.indexOf('function revertirTablaPostReuniones'),
    FUENTE.indexOf('function repararTablaPostReuniones'));
  af(cuerpo.indexOf('COLUMNAS_POST_L036_') === -1,
    '⛔ y el reversor NO deriva de `COLUMNAS_POST_L036_` — derivar de lo que el cambio achica es lo que falló');
}

if (process.argv.indexOf('--autoprueba') !== -1) {
  console.log('\n== autoprueba: control negativo CON MOTIVO ==');
  let malas = 0;
  /* ⛔⛔ `2026-08-26_2` Parte G — **los dos patrones envejecieron, y la lección es el TAMAÑO del
   * ancla.** Los dos incluían `operacion: 'FILA', ` adelante; el día que la operación pasó a salir
   * de la columna —`c.operacion || 'FILA'`, para que la del nombre pudiera ser `FILA_TEXTO`—
   * **dejaron de matchear**, y este autotest quedó en rojo sin que nadie lo viera, porque
   * `tools/suites.js` corre los bancos **sin** `--autoprueba`.
   *
   * ⭐ **Lo accionable: el ancla es el fragmento MÍNIMO que expresa la mutación, y se verifica que
   * sea ÚNICO.** `valor_fijo: n, separador:` aparece **1** sola vez en `Instalar.gs` y no menciona
   * la operación, así que sobrevive a este cambio y a los que vengan. El patrón viejo arrastraba
   * contexto que no se estaba mutando — **cada palabra de más es una forma más de envejecer**.
   *
   * ⚠ **Y el ancla larga NO era más segura por ser más específica:** `separador: 'fecha_periodo',`
   * solo aparece **41** veces en el archivo, así que ahí sí hacía falta acompañarlo con algo. La
   * unicidad se **cuenta**, no se supone.
   *
   * ⭐ Lo que salvó al banco de mentir fue la guarda del 24/08 —*si el texto mutado es idéntico al
   * original, el caso FALLA*—: sin ella habría informado «los 2 casos negativos caen por el motivo
   * correcto» sin haber tocado una línea. */
  const casos = [
    {
      nombre: 'le saco el `separador` a las 12 filas',
      mutar: (s) => s.replace("valor_fijo: n, separador: 'fecha_periodo',",
        "valor_fijo: n, separador: '',"),
      probar: (f) => f.every((x) => x.separador === 'fecha_periodo')
    },
    {
      nombre: 'le pongo el índice como texto `1/4`',
      mutar: (s) => s.replace('valor_fijo: n, separador:',
        'valor_fijo: n + \'/4\', separador:'),
      probar: (f) => f.every((x) => typeof x.valor_fijo === 'number')
    }
  ];
  casos.forEach((c) => {
    const mutado = c.mutar(FUENTE);
    if (mutado === FUENTE) {
      console.log('  ⛔ ' + c.nombre + ' — la mutación NO cambió nada, así que no prueba nada');
      malas++;
      return;
    }
    let sigueVerde;
    try { sigueVerde = c.probar(filasDelWrapper(mutado)); } catch (e) { sigueVerde = false; }
    if (!sigueVerde) console.log('  ✅ ' + c.nombre + ' → la afirmación cae');
    else { malas++; console.log('  ⛔ ' + c.nombre + ' → la afirmación SIGUE en verde: no mide lo que dice'); }
  });
  console.log('');
  console.log(malas ? '⛔ la autoprueba encontró ' + malas + ' caso(s) mal medido(s).'
    : '✅ los ' + casos.length + ' casos negativos caen por el motivo correcto.');
  process.exit(malas ? 1 : 0);
}

console.log('');
console.log(fallas.length ? '⛔ ' + fallas.length + ' de ' + (ok + fallas.length) + ' en rojo.'
  : '✅ Las ' + ok + ' afirmaciones pasaron.');
console.log('⚠ Lo que NO dice: que el `id_cuenta` del anclaje coincida con el de la solapa.');
console.log('  El cruce del 24/08 fue por `Barrio / Comuna`. Eso lo cierra una corrida.');
process.exit(fallas.length ? 1 : 0);
