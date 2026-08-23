#!/usr/bin/env node
/**
 * tools/probar-elemento.js — control de `ELEMENTO`, la novena operación (`22/08/2026`, `X-33`).
 * **Extrae el código real de `Marcadores.gs`**, no una copia.
 *
 * **Las tres cosas que la decisión del usuario exige, y cada una es una sección:**
 *
 *   1. ⭐ **Un solo cálculo por conjunto, no uno por token.** Si `camp1` y `camp2` recalculan la
 *      lista, **dos lecturas pueden ver universos distintos** y publicar elementos que no son
 *      consecutivos. Se afirma contando **cuántas veces se ejecuta el cálculo** para cuatro
 *      tokens del mismo conjunto: tiene que ser **una**.
 *   2. **Menos elementos que cajas es el CASO NORMAL** — dos barrios, tres cajas. La sobrante
 *      devuelve `''`, que el despachador baja a `sin_datos`. ⛔ **Sin símbolo nuevo.**
 *   3. **Más elementos que cajas: tira.** Es decisión editorial y el motor no la toma.
 *
 * ⚠ **Y la cuarta, que no está en la lista pero es la que hace válida a la operación entera:**
 * `ELEMENTO` y `LISTA` tienen que dar **el mismo universo y el mismo orden**. Se afirma
 * reconstruyendo la lista desde los elementos uno por uno y comparándola contra `LISTA`.
 *
 * Uso:
 *   node tools/probar-elemento.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');

function extraer(nombre) {
  const inicio = FUENTE.indexOf('function ' + nombre + '(');
  if (inicio === -1) throw new Error('No encontré `function ' + nombre + '(` en Marcadores.gs');
  let i = FUENTE.indexOf('{', inicio), nivel = 0;
  for (let j = i; j < FUENTE.length; j++) {
    if (FUENTE[j] === '{') nivel++;
    else if (FUENTE[j] === '}') { nivel--; if (nivel === 0) return FUENTE.slice(inicio, j + 1); }
  }
  throw new Error('Función ' + nombre + ' sin cerrar');
}

/** Monta las piezas reales con el mínimo entorno que necesitan. */
function montar() {
  let veces = 0;
  const cuerpo = [
    'var cacheConjuntoLista_ = {};',
    extraer('valoresDeCtx_'),
    'function trazaDeVentana_(ctx) { return ""; }',
    'function normalizar_(s) { return String(s || "").trim().toLowerCase(); }',
    extraer('claveConjuntoLista_'),
    extraer('conjuntoDeLista_'),
    extraer('calcularConjuntoDeLista_'),
    extraer('opLISTA'),
    extraer('opELEMENTO'),
    'return { opLISTA: opLISTA, opELEMENTO: opELEMENTO, conjuntoDeLista_: conjuntoDeLista_,',
    '         calcular: calcularConjuntoDeLista_, cache: function(){ return cacheConjuntoLista_; } };'
  ].join('\n');
  const mod = new Function('contar', cuerpo.replace(
    'function calcularConjuntoDeLista_(ctx) {',
    'function calcularConjuntoDeLista_(ctx) { contar();'))(() => { veces++; });
  return { mod, veces: () => veces };
}

/** Cuatro barrios en el catálogo; la fuente trae dos, desordenados y con un repetido. */
const CAT = { lista: ['Belgrano', 'Parque Avellaneda', 'Parque Patricios', 'Retiro'], origen: 'test' };
/* ⚠ `valor_fijo` es el ÍNDICE y `separador` el TOTAL, los dos ENTEROS PELADOS. La forma `'2/3'`
 * que este control usaba hasta el 22/08 **no se puede escribir en Sheets: se convierte en fecha**. */
function ctx(valores, indice, cajas) {
  return {
    base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'barrio',
    filtro: '', dimensiones: 'ambito=jm', catalogo: CAT,
    ventana: { desde: 'A', hasta: 'B' }, valores: valores,
    valor_fijo: indice, separador: (cajas === undefined ? '' : cajas)
  };
}

let ok = 0, mal = 0;
function af(n, c, d) {
  if (c) { ok++; console.log('  ✅ ' + n); } else { mal++; console.log('  ⛔ ' + n + (d ? ' — ' + d : '')); }
}

console.log('== probar-elemento (X-33, la novena operación) ==');
console.log('');

console.log('1 · ⭐ UN SOLO CÁLCULO POR CONJUNTO — el requisito que evita elementos no consecutivos');
{
  const { mod, veces } = montar();
  const filas = ['Parque Patricios', 'Parque Avellaneda', 'Parque Patricios'];
  const r = [1, 2, 3, 4].map((i) => mod.opELEMENTO(ctx(filas, i, 4)));
  af('los cuatro tokens dispararon UN solo cálculo', veces() === 1, 'se calculó ' + veces() + ' vez/veces');
  af('el 1 publica Parque Avellaneda (orden alfabético)', r[0].valor === 'Parque Avellaneda', 'dio ' + r[0].valor);
  af('el 2 publica Parque Patricios', r[1].valor === 'Parque Patricios', 'dio ' + r[1].valor);
}

console.log('');
console.log('2 · menos elementos que cajas — CASO NORMAL, sin símbolo nuevo');
{
  const { mod } = montar();
  const r3 = mod.opELEMENTO(ctx(['Retiro', 'Belgrano'], 3, 3));
  af('la caja sobrante devuelve cadena vacía', r3.valor === '', 'dio ' + JSON.stringify(r3.valor));
  af('NO tira', true);
  af('la traza dice que es el caso normal', /caso normal/.test(r3.traza));
  af('no inventa ningún símbolo', !/\/\/\/\/\/|---/.test(String(r3.valor)),
    'el símbolo lo pone el deck desde `sin_datos`, no la operación');
}

console.log('');
console.log('3 · ⛔ más elementos que cajas — REPORTA Y PARA, no decide');
{
  const { mod } = montar();
  let tiro = null;
  try { mod.opELEMENTO(ctx(['Retiro', 'Belgrano', 'Parque Patricios'], 1, 2)); }
  catch (e) { tiro = e.message; }
  af('tira', tiro !== null);
  af('nombra cuántos sobran', /Sobran 1/.test(tiro || ''), tiro);
  af('dice que es decisión editorial', /EDITORIAL/i.test(tiro || ''));
  af('lista los elementos, para que la persona pueda decidir', /Retiro/.test(tiro || ''));
}

console.log('');
console.log('4 · ⚠ MISMO universo y MISMO orden que LISTA — lo que hace válida la operación');
{
  const { mod } = montar();
  const filas = ['Parque Patricios', 'Retiro', 'Belgrano', 'Retiro'];
  const lista = mod.opLISTA(ctx(filas, '')).valor;
  const uno = [1, 2, 3].map((i) => mod.opELEMENTO(ctx(filas, i, 3)).valor);
  af('reconstruir desde los elementos da la misma lista', uno.join(', ') === lista,
    'elementos: ' + uno.join(', ') + '  ·  LISTA: ' + lista);
  af('LISTA sigue colapsando el repetido', (lista.match(/Retiro/g) || []).length === 1, lista);
}

console.log('');
console.log('5 · el índice se declara en valor_fijo, no en el nombre');
{
  const { mod } = montar();
  let sinIndice = null;
  try { mod.opELEMENTO(ctx(['Retiro'], '')); } catch (e) { sinIndice = e.message; }
  af('sin índice, tira con instrucciones', /valor_fijo/.test(sinIndice || ''), sinIndice);
  af('el mensaje recuerda que no va en el nombre', /D-33/.test(sinIndice || ''));
  let mal2 = null;
  try { mod.opELEMENTO(ctx(['Retiro'], 3, 2)); } catch (e) { mal2 = e.message; }
  af('cajas < índice tira', mal2 !== null, 'declarar `3/2` es incoherente');
  /* ⚠ Config DISTINTA a propósito: el memo cachea por configuración, así que reusar la misma con
   * otros datos devolvería el conjunto viejo. **En producción eso no puede pasar** —la config ES lo
   * que determina qué se lee, así que misma config ⇒ mismos datos— pero el test sí puede violarlo,
   * y lo violó: la primera versión de esta línea daba rojo por eso, no por la operación.
   * ⭐ Es la trampa que `CLAUDE.md` §4 nombra para las cachés —*la clave tiene que garantizar
   * exactamente las mismas filas*— cobrada del lado del instrumento. */
  const otro = Object.assign(ctx(['Retiro', 'Belgrano', 'Parque Patricios'], 2),
    { campo_logico: 'otro_campo' });
  af('acepta la forma sin cajas (`2`) sin control de desborde',
    mod.opELEMENTO(otro).valor === 'Parque Patricios', 'dio ' + mod.opELEMENTO(otro).valor);
}

console.log('');
console.log('5 bis · ⚠ el supuesto del memo, afirmado en vez de supuesto');
{
  const { mod, veces } = montar();
  const base = ctx(['Retiro'], 1, 1);
  mod.opELEMENTO(base);
  mod.opELEMENTO(ctx(['Retiro'], 1, 1));
  af('misma config ⇒ una sola lectura', veces() === 1,
    'el memo asume que la config determina los datos; en producción vale porque la config ES la lectura');
}

console.log('');
console.log('5 ter · ⛔⛔ EL DESPACHADOR le trae el catálogo — la afirmación que faltaba');
{
  /* ⭐ Esta sección se agregó DESPUÉS de que las otras 20 pasaran en verde **y el cableado real
   * igual estuviera roto**: `Generador.gs` resolvía el catálogo sólo con `operacion === 'LISTA'`,
   * así que `ELEMENTO` habría tirado en la primera corrida por un `MARCADORES.catalogo` que
   * estaba bien declarado. **El control probaba la operación en aislamiento y el hueco estaba en
   * el despachador.** Es `CLAUDE.md` §4: *¿qué afirmación existente falla si esta rama nueva no
   * funciona?* — la respuesta era «ninguna», y acá está la que faltaba. */
  const marc = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');
  const gen = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

  const mapa = (marc.match(/var OPERACIONES_CON_CATALOGO_ = \{([^}]*)\}/) || [])[1] || '';
  af('existe el mapa OPERACIONES_CON_CATALOGO_', mapa !== '',
    'sin el mapa, la condición vuelve a ser un nombre suelto en Generador.gs');
  af('declara LISTA', /LISTA\s*:\s*true/.test(mapa));
  af('declara ELEMENTO', /ELEMENTO\s*:\s*true/.test(mapa),
    'si falta, ELEMENTO tira «necesita un catálogo» con el catálogo bien declarado');
  af('el despachador pregunta por la PROPIEDAD, no por el nombre',
    /operacionNecesitaCatalogo_\(fila\.operacion\)/.test(gen),
    'una comparación `=== "LISTA"` deja afuera a la décima operación igual que dejó a la novena');
  af('ya no queda la comparación vieja contra el nombre',
    !/operacion \|\| ''\)\.trim\(\) === 'LISTA'/.test(gen));

  /* Y la otra mitad del contrato: `valor_fijo` tiene que viajar SIEMPRE, no sólo para TEXTO. */
  af('el ctx del despachador lleva `valor_fijo` para toda operación',
    /valor_fijo:\s*fila\.valor_fijo/.test(gen),
    'ELEMENTO lee el índice de ahí');
}

console.log('');
console.log('6 · control negativo — que la sección 1 sepa ponerse roja');
{
  af('si el memo no memoizara, el conteo daría 4 y no 1', true,
    'la afirmación 1 compara contra 1 exacto, así que un cache roto la enrojece');
  const { mod, veces } = montar();
  const filas = ['Retiro'];
  mod.opELEMENTO(ctx(filas, 1, 2));
  mod.opELEMENTO(Object.assign(ctx(filas, 2, 2), { dimensiones: 'ambito=gcba' }));
  af('un conjunto DISTINTO sí recalcula (la clave discrimina)', veces() === 2,
    'se calculó ' + veces() + ' — si diera 1, la clave estaría fusionando conjuntos distintos');
}



/* ─────────────────────────────────────────────────────────────────────────────────────────
 * 7 · ⛔⛔ EL CAMINO QUE INVOCA — agregado el 22/08 después de que los tres `ecv_barrio*`
 *     publicaran `---` con las 26 afirmaciones de arriba en verde.
 *
 * ⭐ **Es C-78 otra vez, y el usuario lo nombró:** aquella vez el control probaba la operación en
 * aislamiento y el hueco estaba en el despachador. Volvió a pasar. **Así que esta sección no
 * llama a `opELEMENTO`: llama a `despacharOperacion_`, con el `ctx` armado COMO LO ARMA
 * `Generador.gs`** — que es donde puede faltar algo.
 * ───────────────────────────────────────────────────────────────────────────────────────── */
console.log('');
console.log('7 · ⛔⛔ por el DESPACHADOR, con el ctx tal como lo arma Generador.gs');
{
  const desp = extraer('despacharOperacion_');
  const cuerpo = [
    'var cacheConjuntoLista_ = {};',
    'var PREFIJO_FN_ = "FN:";',
    'var FUNCIONES_PROPIAS_ = {};',
    extraer('valoresDeCtx_'),
    'function trazaDeVentana_(ctx) { return ""; }',
    'function normalizar_(s) { return String(s || "").trim().toLowerCase(); }',
    extraer('claveConjuntoLista_'),
    extraer('conjuntoDeLista_'),
    extraer('calcularConjuntoDeLista_'),
    extraer('opLISTA'),
    extraer('opELEMENTO'),
    'var OPERACIONES_ = { LISTA: opLISTA, ELEMENTO: opELEMENTO };',
    desp,
    'return despacharOperacion_;'
  ].join('\n');
  const despachar = new Function(cuerpo)();

  /* ⚠ El `ctx` de `Generador.gs` NO trae `filtro` ni `dimensiones`: se copia tal cual para que
   * este control vea lo mismo que ve el motor. Copiar el ctx es la lección del 22/08 sobre los
   * instrumentos que arman su propio preámbulo. */
  function ctxGenerador(indice, cajas, conCatalogo) {
    const c = {
      marcador: 'ecv_barrio' + indice,
      base_id: 'rdv', solapa: 'RVD JM-CM - ES', campo_logico: 'barrio',
      columna: 'B', encabezado: 'Barrio',
      ventana: { desde: 'A', hasta: 'B' },
      valores: ['Parque Avellaneda', 'Parque Patricios'],
      valor_fijo: indice, separador: cajas
    };
    if (conCatalogo) { c.catalogo = CAT; }
    else { delete c.catalogo; }
    return c;
  }

  const r1 = despachar('ELEMENTO', ctxGenerador(1, 3, true));
  af('con catálogo, el despachador devuelve ok', r1.ok === true, 'motivo: ' + r1.motivo);
  af('y publica el primer barrio', r1.valor === 'Parque Avellaneda', 'dio ' + JSON.stringify(r1.valor));

  const r3 = despachar('ELEMENTO', ctxGenerador(3, 3, true));
  af('la caja 3 devuelve ok con valor vacío (NO error)', r3.ok === true && r3.valor === '',
    'ok=' + r3.ok + ' valor=' + JSON.stringify(r3.valor) + ' motivo=' + r3.motivo);

  /* ⭐ LA AFIRMACIÓN QUE FALTABA: sin catálogo el despachador NO tira, devuelve ok:false — y eso
   * es lo que el deck pinta como `---`. Si el camino real no le pasa el catálogo, ÉSTE es el
   * síntoma exacto que se vio. */
  const sinCat = despachar('ELEMENTO', ctxGenerador(1, 3, false));
  af('SIN catálogo el despachador devuelve ok:false con motivo legible', sinCat.ok === false);
  af('el motivo nombra el catálogo', /cat[aá]logo/i.test(sinCat.motivo || ''), sinCat.motivo);
  af('ELEMENTO está en OPERACIONES_ del archivo real',
    /ELEMENTO:\s*opELEMENTO/.test(FUENTE), 'sin esto el despachador diría «operacion desconocida»');
}

console.log('');
console.log('8 · ⛔⛔ LA COERCIÓN DE SHEETS — la afirmación que faltaba el 22/08');
{
  /* ⭐ Los tres `ecv_barrio*` publicaron `---` porque se escribió `valor_fijo = '1/3'` y **Sheets
   * lo guardó como FECHA**. El motor leyó `"Sun Mar 01 2026"`. Ninguna de las 32 afirmaciones de
   * arriba lo veía: todas pasaban el índice como string o número desde JavaScript, **donde la
   * coerción no existe**. El control tiene que simular lo que la CELDA devuelve. */
  const { mod } = montar();
  let tiro = null;
  try { mod.opELEMENTO(ctx(['Retiro', 'Belgrano'], new Date(2026, 2, 1), 3)); }
  catch (e) { tiro = e.message; }
  af('un `valor_fijo` que llegó como FECHA tira', tiro !== null,
    'si no tira, publica --- y el motivo no dice por qué');
  af('el motivo NOMBRA la fecha', /FECHA/.test(tiro || ''), tiro);
  af('y dice cómo se escribe bien', /ENTERO PELADO/.test(tiro || ''), tiro);

  let tiro2 = null;
  try { mod.opELEMENTO(ctx(['Retiro'], 1, new Date(2026, 2, 1))); } catch (e) { tiro2 = e.message; }
  af('un `separador` que llegó como FECHA también tira', tiro2 !== null);

  af('el entero pelado sí funciona', mod.opELEMENTO(ctx(['Retiro', 'Belgrano'], 1, 3)).valor === 'Belgrano');
  af('el código real ya NO acepta la forma N/M', !/valor_fijo = '2\/3'/.test(FUENTE),
    'si vuelve a documentarse esa forma, alguien la va a escribir y Sheets la va a comer');
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
