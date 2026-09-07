#!/usr/bin/env node
/**
 * tools/generar-casos-por-marcador.js — **emite la constante `CASOS_POR_MARCADOR_` para pegar en
 * `Auditoria.gs`.** Parte C.1 del `2026-09-06_3`.
 *
 * ⛔⛔ **Por qué hace falta un generador y no un lector:** los `casos_validacion_*.csv` **no están
 * en Drive** —viven en el repo, y el propio código lo dice: *«el cruce completo se hace en disco»*—.
 * ⇒ Un diagnóstico de Apps Script que quiera cruzar `MARCADORES` **vivo** contra los casos **no los
 * puede leer**. La única forma es que la lista viaje como constante.
 *
 * ⚠ **Y eso es exactamente la «lista congelada» que hundió a `confirmarNumerosDeUnoAUno()`**, cuya
 * lista del 26/08 no pudo enterarse de `X-42` y `X-43` del 28/08. ⭐ **Por eso la constante lleva su
 * FECHA DE GENERACIÓN adentro** y el consumidor la imprime: una lista congelada **que declara
 * cuándo se congeló** se puede auditar; una que no, miente en silencio.
 *
 * ⭐ Aplica **`D-58`** al generar —cuando dos casos hablan del mismo marcador, **manda el más
 * nuevo**— y **desarma** los `token_propuesto` con varios marcadores en una celda (`V-125` trae
 * seis separados por ` / `), porque **contar celdas en vez de marcadores da un número que no
 * corresponde a nada**.
 *
 * Uso:  node tools/generar-casos-por-marcador.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const DOCS = path.join(RAIZ, 'docs');
const CSV = require('./lib-csv');   // el lector estricto compartido

const archivos = fs.readdirSync(DOCS)
  .filter(n => /^casos_validacion_.*\.csv$/.test(n)).sort();   // orden = orden de fecha

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * ⭐⭐ `2026-09-06_5` Parte D — **el desarme de `token_propuesto`, que SUBCONTABA.**
 *
 * ⛔ **Medido el 06/09: 7 de los 24 marcadores de `LEVANTAN_POR_CASO_` quedaban fuera de la
 * constante aunque sus casos existieran.** La causa: se partía sólo por `/`, y `V-113` escribe su
 * celda como `camp_env1-5_{entregados,aperturas} vs camp_entregados / camp_aperturas`. ⇒ El trozo
 * con `vs` y con llaves **no pasaba el filtro**, así que `camp_aperturas` entraba y
 * **`camp_entregados` no**.
 *
 * ⚠ **Fallaba del lado seguro** —un marcador ausente hace que el gate 1 lo rechace— **pero
 * fallaba**: un marcador invisible para la constante es invisible para **todos** los cruces que la
 * usan, y un conteo que subcuenta se cita igual que uno correcto.
 *
 * ⇒ Se parte por **`/`**, por **` vs `** y por **`,`**, y se expanden las **llaves**
 * (`pre_{a,b}` → `pre_a`, `pre_b`). ⭐ El control sintético de abajo prueba las tres formas.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
function desarmar(celda) {
  /* ⛔⛔ Se parte PRIMERO por los separadores de alto nivel y se expanden las llaves DESPUÉS,
   * pieza por pieza. ⚠ Al revés —expandiendo primero— una pieza con DOS grupos de llaves se
   * rompe: `camp_{meta,google,prog}_{impresiones,vistas,clics}` producía `camp_meta`,
   * `camp_google` y `camp_prog`, que **no existen como marcadores**. Medido el 06/09 contra el
   * snapshot: 0 filas cada uno. ⇒ **El desarme pasó de subcontar a INVENTAR NOMBRES**, que es
   * peor: un nombre falso con `exacto` vigente entraría a la lista de levantamiento. */
  return String(celda || '')
    .split(/\s+vs\s+|\//)
    .map(x => x.trim()).filter(Boolean)
    .reduce((acc, pieza) => acc.concat(expandirLlaves(pieza)), [])
    .map(x => x.trim()).filter(Boolean);
}

/**
 * Expande TODOS los grupos de llaves de una pieza como **producto cruzado**.
 * `camp_{a,b}_{x,y}` → `camp_a_x`, `camp_a_y`, `camp_b_x`, `camp_b_y`.
 * ⚠ Sin llaves, la pieza se parte por coma —así `a, b` sigue dando dos—; con llaves, **no**,
 * porque ahí la coma es del grupo.
 */
function expandirLlaves(pieza) {
  if (pieza.indexOf('{') === -1) return pieza.split(',').map(x => x.trim()).filter(Boolean);
  let salida = [''];
  const partes = pieza.split(/(\{[^}]*\})/);
  partes.forEach(p => {
    if (/^\{[^}]*\}$/.test(p)) {
      const ops = p.slice(1, -1).split(',').map(x => x.trim());
      salida = salida.reduce((acc, base) => acc.concat(ops.map(o => base + o)), []);
    } else if (p) {
      salida = salida.map(base => base + p);
    }
  });
  return salida;
}

/* ── ⭐ CONTROL POSITIVO SINTÉTICO, y aborta si no pasa ──────────────────────────────────────
 * ⛔ **Un desarme que devuelve de menos no se distingue de uno que no mira nada**, y su salida es
 * una lista plausible. Los tres casos cubren las tres formas que aparecen en los CSV. */
[
  ['a_uno / a_dos', ['a_uno', 'a_dos']],
  ['a_uno vs a_dos', ['a_uno', 'a_dos']],
  ['pre_{uno,dos}', ['pre_uno', 'pre_dos']],
  /* ⛔⛔ EL CASO QUE FALTABA, y es el que destapó el bug: DOS grupos de llaves ⇒ producto
   * cruzado. Sin él, el desarme inventaba `camp_meta` y `camp_google`, que no existen. */
  ['camp_{meta,google}_{impresiones,clics}',
    ['camp_meta_impresiones', 'camp_meta_clics', 'camp_google_impresiones', 'camp_google_clics']],
  ['camp_env1-5_{entregados,aperturas} vs camp_entregados / camp_aperturas',
    ['camp_env1-5_entregados', 'camp_env1-5_aperturas', 'camp_entregados', 'camp_aperturas']]
].forEach(([entrada, esperado]) => {
  const dio = desarmar(entrada);
  if (dio.join('|') !== esperado.join('|')) {
    console.error('⛔⛔ ABORTA: el control sintético del desarme FALLÓ.');
    console.error('   entrada : ' + entrada);
    console.error('   esperado: ' + esperado.join(' · '));
    console.error('   dio     : ' + dio.join(' · '));
    console.error('   ⇒ Un desarme que devuelve de menos no se distingue de uno que no mira nada.');
    process.exit(1);
  }
});

const porMarcador = {};
let referencias = 0, celdasMulti = 0;
archivos.forEach(nombre => {
  const filas = CSV.parsear(fs.readFileSync(path.join(DOCS, nombre), 'utf8'));
  const head = filas[0].map(h => h.trim());
  const iId = head.indexOf('caso_id'), iTok = head.indexOf('token_propuesto'), iEst = head.indexOf('estado');
  if (iId < 0 || iTok < 0 || iEst < 0) { console.error('⛔ ' + nombre + ': faltan columnas'); process.exit(1); }
  filas.slice(1).forEach(f => {
    const id = (f[iId] || '').trim();
    if (!/^[A-Z]+-\d+$/.test(id)) return;
    const trozos = desarmar(f[iTok] || '');
    if (trozos.length > 1) celdasMulti++;
    trozos.forEach(t => {
      /* ⛔ Se exige un `_` **y** un largo mínimo: sin eso entra la prosa de las celdas —`varios`,
       * `alcance`, `clics`, `digital`— y hereda un estado que no le corresponde. Medido: **8 de
       * 140** eran palabras sueltas. ⚠ Hoy son inertes porque ningún marcador vivo se llama así,
       * pero el día que nazca uno llamado `alcance` arrastra el caso de otra cosa. */
      if (!/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(t) || t.length < 5) return;
      referencias++;
      /* ⭐ `D-58` aplicado al generar: el último que se ve gana, y el recorrido va por fecha.
       * ⛔⛔ **Pero el HISTORIAL se conserva, y no es prolijidad: es lo que `D-58` necesita.**
       * Esa decisión declara una **pregunta abierta** y manda aplicar **sólo la mitad segura** —el
       * más nuevo gana **cuando AGREGA** la marca; los casos donde la **sacaría** *«se listan y se
       * paran»*—. ⇒ Guardar sólo el ganador **destruye el dato que decide cuál mitad es**, y el
       * gate quedaría ciego justo en el caso peligroso. */
      var previo = porMarcador[t];
      porMarcador[t] = { estado: (f[iEst] || '').trim(), caso: id,
        archivo: nombre.replace('casos_validacion_', '').replace('.csv', ''),
        previos: (previo ? previo.previos.concat([previo.estado]) : []) };
    });
  });
});

const nombres = Object.keys(porMarcador).sort();
const hoy = new Date().toISOString().slice(0, 10);
const cuenta = e => nombres.filter(n => porMarcador[n].estado === e).length;

console.log('/* ══════════════════════════════════════════════════════════════════════════════');
console.log(' * ⭐⭐ `CASOS_POR_MARCADOR_` — GENERADA, NO ESCRITA A MANO.');
console.log(' *');
console.log(' * Regenerar con:  node tools/generar-casos-por-marcador.js');
console.log(' *');
console.log(' * ⛔ **Es una lista CONGELADA y lleva su fecha adentro a propósito.** Los');
console.log(' * `casos_validacion_*.csv` no están en Drive, así que un diagnóstico de Apps Script no');
console.log(' * los puede leer: la única forma es que la lista viaje como constante. ⚠ Es la misma');
console.log(' * figura que hundió a `confirmarNumerosDeUnoAUno()` —lista del 26/08 que no pudo');
console.log(' * enterarse de `X-42` y `X-43` del 28/08— y lo único que la hace auditable es que');
console.log(' * **declare cuándo se congeló**. El consumidor imprime esa fecha, siempre.');
console.log(' *');
console.log(' * ⭐ `D-58` aplicado al generar: cuando dos casos hablan del mismo marcador, manda el');
console.log(' * más nuevo. Y los `token_propuesto` con varios marcadores en una celda vienen');
console.log(' * DESARMADOS —' + celdasMulti + ' celdas, ' + referencias + ' referencias— porque contar celdas');
console.log(' * en vez de marcadores da un número que no corresponde a nada.');
console.log(' * ══════════════════════════════════════════════════════════════════════════════ */');
/* ⚠ Comillas SIMPLES, como todo el repo: el banco las busca así y `JSON.stringify` emite dobles. */
console.log("var CASOS_POR_MARCADOR_GENERADA_ = '" + hoy + "';");
console.log('var CASOS_POR_MARCADOR_ARCHIVOS_ = ' + archivos.length + ';');
console.log('/* ' + nombres.length + ' marcadores · exacto ' + cuenta('exacto') +
  ' · contradice ' + cuenta('contradice') + ' · cerrado ' + cuenta('cerrado') +
  ' · abierto ' + cuenta('abierto') + ' */');
console.log('var CASOS_POR_MARCADOR_ = {');
nombres.forEach((n, i) => {
  const c = porMarcador[n];
  console.log("  '" + n + "': { estado: '" + c.estado + "', caso: '" + c.caso + "', csv: '" +
    c.archivo + "', previos: [" + c.previos.map(function (x) { return "'" + x + "'"; }).join(',') +
    "] }" + (i < nombres.length - 1 ? ',' : ''));
});
console.log('};');
console.error('⇒ ' + nombres.length + ' marcadores desde ' + archivos.length + ' CSV · ' +
  referencias + ' referencias · ' + celdasMulti + ' celdas con varios');
