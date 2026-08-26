#!/usr/bin/env node
/**
 * tools/probar-identidades-l046.js — las identidades de `L-046` (Desagregados · Digital).
 *
 * ⭐⭐ **Este banco no tiene UN SOLO NÚMERO ESPERADO, y eso es su diseño, no una carencia.**
 * Decisión del usuario, 26/08/2026, y la regla la fijó el mismo día:
 *
 *   > *Un control contra CONSTANTES de una lectura anterior caduca cada vez que la fuente
 *   > respira. Un control contra IDENTIDADES INTERNAS no caduca nunca.*
 *
 * Las cifras que circularon el 26/08 —`1,64` · `7,20` · `1,87` · `7,17` · `74,81 %` · `66,89 %`—
 * son **mediciones de otra foto de la base** y **no entran como valores esperados en ninguna
 * afirmación**. Se citan sólo en comentarios, fechadas, como referencia.
 *
 * ⭐ **Qué se afirma en su lugar: que las DEFINICIONES sean las identidades.**
 *
 *   frecuencia = impresiones ÷ alcance      ·      VTR = visualizaciones ÷ impresiones
 *
 * Y la afirmación fuerte no es que cada marcador tenga los operandos correctos por separado: es
 * que **el numerador de `camp_frecuencia` sea el MISMO `campo_logico` que publica
 * `camp_impresiones`, y su denominador el mismo que publica `camp_alcance`**. Eso convierte a la
 * lámina en verificable contra sí misma: los tres números están a la vista y el tercero es el
 * cociente de los otros dos. Es la misma forma que cerró `L-053` con `u1_total_clics`.
 *
 * ⚠ **Lo que este banco NO contesta, y hay que decirlo porque el verde es tentador:**
 *   - **No dice que los valores publicados sean correctos.** Lee `Instalar.gs`, no la hoja ni la
 *     base. Una fila editada a mano en `MARCADORES` que difiera del código **no se ve desde acá**.
 *   - **No dice nada del universo.** `camp_frecuencia` puede tener los operandos correctos y salir
 *     de las filas equivocadas (`CLAUDE.md` §4).
 *   - **No reproduce el deck del equipo**, y en un caso el motor **no lo reproduce a propósito**:
 *     ver el bloque 4.
 *
 * Uso:
 *   node tools/probar-identidades-l046.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const FUENTES = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
const GENERADOR = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

const SALTO = String.fromCharCode(10);
const BARRA = String.fromCharCode(92);

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/** Balancea delimitadores salteando cadenas y comentarios. */
function balancear(texto, desde, archivo, que) {
  let nivel = 0, arranco = false, comilla = null, comentario = null;
  for (let j = desde; j < texto.length; j++) {
    const c = texto[j], sig = texto[j + 1];
    if (comentario === 'linea') { if (c === SALTO) comentario = null; continue; }
    if (comentario === 'bloque') { if (c === '*' && sig === '/') { comentario = null; j++; } continue; }
    if (comilla) {
      if (c === BARRA) { j++; continue; }
      if (c === comilla) comilla = null;
      continue;
    }
    if (c === '/' && sig === '/') { comentario = 'linea'; j++; continue; }
    if (c === '/' && sig === '*') { comentario = 'bloque'; j++; continue; }
    if (c === "'" || c === '"' || c === '`') { comilla = c; continue; }
    if (c === '[' || c === '{' || c === '(') { nivel++; arranco = true; }
    else if (c === ']' || c === '}' || c === ')') {
      nivel--;
      if (arranco && nivel === 0) return texto.slice(desde, j + 1);
    }
  }
  throw new Error('`' + que + '` sin cerrar en ' + archivo);
}

function extraerFuncion(texto, nombre, archivo) {
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  const llave = texto.indexOf('{', inicio);
  return texto.slice(inicio, llave) + balancear(texto, llave, archivo, nombre);
}

function extraerLiteral(texto, nombre, archivo) {
  const inicio = texto.indexOf('var ' + nombre + ' =');
  if (inicio === -1) throw new Error('No encontré `var ' + nombre + ' =` en ' + archivo);
  const llaves = [texto.indexOf('{', inicio), texto.indexOf('[', inicio)].filter((n) => n !== -1);
  return balancear(texto, Math.min.apply(null, llaves), archivo, nombre);
}

function extraerCadena(texto, nombre, archivo) {
  const m = texto.match(new RegExp('var\\s+' + nombre + "\\s*=\\s*'([^']*)'"));
  if (!m) throw new Error('No encontré `var ' + nombre + " = '…'` en " + archivo);
  return m[1];
}

/**
 * La fila de un marcador, leída del texto del `cablear*` que la declara.
 *
 * ⚠ **No se evalúa el objeto y el motivo importa:** sus `notas` llaman a `N(RAMA_CUENTA + …)`,
 * que no existe fuera de la función. Se leen los campos por texto, que es lo único que hace falta.
 *
 * El corte va de `marcador: 'X'` hasta el próximo `marcador:` — en este archivo `marcador` es
 * siempre la primera clave del objeto, así que el tramo contiene exactamente sus campos.
 * **Falla si el marcador no está**, para que un renombre no pase en silencio.
 */
function filaDe(cuerpo, marcador, donde) {
  const ancla = "marcador: '" + marcador + "'";
  const inicio = cuerpo.indexOf(ancla);
  if (inicio === -1) {
    throw new Error('No encontré `' + ancla + '` en ' + donde +
      ' — si el marcador se renombró o se movió, esta prueba tiene que enterarse.');
  }
  const siguiente = cuerpo.indexOf('marcador:', inicio + ancla.length);
  const tramo = cuerpo.slice(inicio, siguiente === -1 ? cuerpo.length : siguiente);
  const campo = (nombre) => {
    const m = tramo.match(new RegExp(nombre + ":\\s*'([^']*)'"));
    return m ? m[1] : null;
  };
  return {
    marcador: marcador,
    campo_logico: campo('campo_logico'),
    operacion: campo('operacion'),
    dimensiones: campo('dimensiones'),
    formato: campo('formato'),
    base_id: campo('base_id'),
    solapa: campo('solapa')
  };
}

const ALTA = extraerFuncion(INSTALAR, 'altaMarcadoresDeCampana_', 'Instalar.gs');
const DESGLOSE = extraerFuncion(INSTALAR, 'cablearDesglosePorPlataforma', 'Instalar.gs');

console.log('Identidades de `L-046` — sin constantes esperadas, por diseño\n');

/* ── 1 · ⭐⭐ frecuencia = impresiones ÷ alcance, con los operandos de la PROPIA LÁMINA ────── */
console.log('1 · ⭐⭐ `camp_frecuencia` es el cociente de dos marcadores que la lámina publica');
{
  const frecuencia = filaDe(ALTA, 'camp_frecuencia', 'altaMarcadoresDeCampana_');
  const impresiones = filaDe(ALTA, 'camp_impresiones', 'altaMarcadoresDeCampana_');
  const alcance = filaDe(ALTA, 'camp_alcance', 'altaMarcadoresDeCampana_');

  afirmar(frecuencia.operacion === 'RATIO',
    'la operación es `RATIO` — vino ' + JSON.stringify(frecuencia.operacion));

  const partes = String(frecuencia.campo_logico).split('/');
  afirmar(partes.length === 2,
    'el `campo_logico` es un cociente de dos operandos — vino ' +
    JSON.stringify(frecuencia.campo_logico));

  /* ⭐ La afirmación que da sentido al bloque: los operandos NO son campos cualesquiera que
   * casualmente signifiquen eso — son **los mismos que publican los otros dos casilleros**. */
  afirmar(partes[0] === impresiones.campo_logico,
    '⭐ el NUMERADOR es el mismo `campo_logico` que publica `camp_impresiones` (' +
    partes[0] + ')');
  afirmar(partes[1] === alcance.campo_logico,
    '⭐ el DENOMINADOR es el mismo `campo_logico` que publica `camp_alcance` (' + partes[1] + ')');

  /* ⛔ Control negativo: la solapa tiene una columna `frecuencia_total` (col M) y el marcador
   * NO la usa. Si algún día la usara, la identidad dejaría de ser verificable contra la lámina
   * —el número vendría de afuera— y este banco tiene que ponerse rojo. */
  afirmar(String(frecuencia.campo_logico).indexOf('frecuencia_total') === -1,
    '⛔ y NO lee la columna `frecuencia_total`: el número se calcula, no se copia');

  afirmar(frecuencia.base_id === impresiones.base_id && frecuencia.solapa === impresiones.solapa,
    'los tres salen de la misma base y solapa (' + frecuencia.base_id + '/' + frecuencia.solapa + ')');
}

/* ── 2 · ⭐ VTR = visualizaciones ÷ impresiones, en los cuatro ───────────────────────────────
 * ⚠ Los «seis VTR» del 26/08 son **3 marcadores × 2 campañas**, no seis filas de `MARCADORES`.
 * Acá se afirman los 3 de plataforma más el total. */
console.log('\n2 · ⭐ los cuatro VTR son `PCT` de visualizaciones sobre impresiones');
{
  const total = filaDe(DESGLOSE, 'camp_vtr', 'cablearDesglosePorPlataforma');
  const plataformas = ['camp_meta_vtr', 'camp_google_vtr', 'camp_prog_vtr']
    .map((m) => filaDe(DESGLOSE, m, 'cablearDesglosePorPlataforma'));

  for (const f of plataformas.concat([total])) {
    afirmar(f.operacion === 'PCT', f.marcador + ' · operación `PCT` — vino ' + f.operacion);
    const partes = String(f.campo_logico).split('/');
    afirmar(partes.length === 2, f.marcador + ' · el campo es un cociente');
    afirmar(/visualizaciones/i.test(partes[0]),
      f.marcador + ' · numerador = visualizaciones (' + partes[0] + ')');
    afirmar(/impresiones/i.test(partes[1]),
      f.marcador + ' · denominador = impresiones (' + partes[1] + ')');
  }

  /* ⭐⭐ La lección de `L-053`, aplicada antes de que duela: tres marcadores que contestan la
   * MISMA pregunta con cortes distintos se ven igual en un deck. Los tres de plataforma tienen
   * que diferir **sólo** en `dimensiones`. */
  const formas = new Set(plataformas.map((f) => f.campo_logico + '|' + f.operacion));
  afirmar(formas.size === 1,
    '⭐⭐ los tres de plataforma comparten EXACTAMENTE la misma forma y difieren sólo en el corte — ' +
    'formas distintas: ' + formas.size);

  const cortes = plataformas.map((f) => f.dimensiones).sort();
  afirmar(cortes.join(' · ') === 'plataforma=google · plataforma=meta · plataforma=programmatic',
    'y los cortes son las tres plataformas — ' + cortes.join(' · '));

  /* ⛔ El total NO lleva corte: es la suma de las tres. Un `dimensiones` acá sería el bug que
   * `R-33` cerró en `L-053`. */
  afirmar(!total.dimensiones,
    '⛔ `camp_vtr` (el total) lleva `dimensiones` VACÍO — vino ' + JSON.stringify(total.dimensiones));
}

/* ── 3 · ⭐ `plataforma=programmatic` agrega DV360 **y** Mercado Libre, por RESTA ────────────
 * Medido el 26/08 sobre la base viva, y va como referencia fechada, no como afirmación:
 * Autódromo `3481-AGOINFAN` → DV360 4.077.181 + Mercado Libre 119.936 = 4.197.117, que es lo que
 * publicó `camp_prog_impresiones`. Mugica `3509-AGOSEGGJ` trae sólo DV360.
 *
 * ⭐ Lo que SÍ se afirma es la propiedad que hace que eso funcione **y que siga funcionando con
 * una etiqueta que todavía no existe**: la dimensión se define por resta y no por lista. */
console.log('\n3 · ⭐ `programmatic` se define por RESTA, así que agrega etiquetas sin enumerarlas');
{
  const SEP = extraerCadena(GENERADOR, 'SEPARADOR_CONDICIONES_FILTRO_', 'Generador.gs');
  const M = new Function(  // eslint-disable-line no-new-func
    'var SEPARADOR_CONDICIONES_FILTRO_ = ' + JSON.stringify(SEP) + ';\n' +
    'var DIMENSIONES_ = ' + extraerLiteral(FUENTES, 'DIMENSIONES_', 'Fuentes.gs') + ';\n' +
    extraerFuncion(FUENTES, 'normalizarValorDeclarado_', 'Fuentes.gs') + '\n' +
    extraerFuncion(FUENTES, 'condicionesDeDimensiones_', 'Fuentes.gs') + '\n' +
    'return { condicionesDeDimensiones_: condicionesDeDimensiones_, DIMENSIONES_: DIMENSIONES_ };')();

  const prog = M.condicionesDeDimensiones_('looker', 'DIGITAL', 'plataforma=programmatic');
  afirmar(prog.ok, '`plataforma=programmatic` resuelve sobre `looker|DIGITAL` — ' +
    JSON.stringify(prog.condiciones || prog.motivo));

  afirmar(/!=/.test(prog.condiciones),
    '⭐ la condición es NEGATIVA (por resta) — ' + JSON.stringify(prog.condiciones));
  afirmar(/Meta/.test(prog.condiciones) && /Google ads/.test(prog.condiciones),
    'y nombra a las dos que EXCLUYE, Meta y Google ads');

  /* ⛔ La afirmación que protege a Mercado Libre y a la próxima etiqueta: no hay enumeración.
   * Si alguien "arreglara" esto poniendo `Plataforma=DV360 || Plataforma=Mercado Libre`, las
   * dos de hoy seguirían andando y la próxima quedaría afuera **en silencio** — que es el modo
   * de falla que `R-24` previene. */
  for (const etiqueta of ['DV360', 'Mercado Libre', 'TikTok', 'Twitch', 'Uber']) {
    afirmar(prog.condiciones.indexOf(etiqueta) === -1,
      '⛔ no enumera `' + etiqueta + '`: entra por resta, no por lista');
  }

  /* Control negativo: una dimensión POSITIVA sí produce una igualdad. Sin esto, el bloque pasaría
   * con un `condicionesDeDimensiones_` que devolviera `!=` para cualquier cosa. */
  const meta = M.condicionesDeDimensiones_('looker', 'DIGITAL', 'plataforma=meta');
  afirmar(meta.ok && /=Meta/.test(meta.condiciones) && !/!=/.test(meta.condiciones),
    '⭐ control negativo — `plataforma=meta` SÍ produce una igualdad: ' +
    JSON.stringify(meta.condiciones));
}

/* ── 4 · ⛔ el `_revisar` de esta lámina SE QUEDA ────────────────────────────────────────────
 * A diferencia de `L-053`, que perdió la marca el 26/08 al validarse. El motivo está medido:
 * `camp_frecuencia` depende del alcance de `looker`, que se movió **+56,7 % en dos días sobre una
 * ventana cerrada** (19/08). El número es provisorio y la marca lo dice. */
console.log('\n4 · ⛔ el `_revisar` de `L-046` se queda — no es deuda, es el estado del dato');
{
  const frecuencia = filaDe(ALTA, 'camp_frecuencia', 'altaMarcadoresDeCampana_');
  afirmar(String(frecuencia.formato).slice(-8) === '_revisar',
    '`camp_frecuencia` conserva `_revisar` — vino ' + JSON.stringify(frecuencia.formato));

  const vtrs = ['camp_meta_vtr', 'camp_google_vtr', 'camp_prog_vtr']
    .map((m) => filaDe(DESGLOSE, m, 'cablearDesglosePorPlataforma'));
  for (const f of vtrs) {
    afirmar(String(f.formato).slice(-8) === '_revisar',
      f.marcador + ' conserva `_revisar` — vino ' + JSON.stringify(f.formato));
  }

  /* ⚠ Y la asimetría con `L-053` es deliberada: allá la marca salió porque la lámina se validó;
   * acá se queda porque la FUENTE se mueve. Son dos motivos distintos para el mismo glifo, y por
   * eso conviene que un banco lo afirme en vez de que dependa de que alguien se acuerde. */
  const alcance = filaDe(ALTA, 'camp_alcance', 'altaMarcadoresDeCampana_');
  afirmar(String(alcance.formato).slice(-8) !== '_revisar',
    '⚠ y `camp_alcance` NO la lleva, a propósito: reproduce con drift, y marcarlo todo diluye ' +
    'la marca hasta volverla decorativa — vino ' + JSON.stringify(alcance.formato));
}

console.log('\n' + (fallas === 0
  ? '✅ TODO OK — identidades verificadas sobre el código, sin una sola constante esperada.'
  : '❌ ' + fallas + ' afirmación(es) fallaron.'));
process.exit(fallas === 0 ? 0 : 1);
