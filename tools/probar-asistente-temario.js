#!/usr/bin/env node
/**
 * tools/probar-asistente-temario.js — **el temario se parte en UN CORTE POSICIONAL**
 * (`2026-08-27_2`, `D-45` / `D-46`).
 *
 * ⭐⭐ **Los tres temarios REALES son el banco, y ninguno tiene la misma forma.** Ése es el hecho
 * de método: llegó el tercero y no se parece a los dos anteriores.
 *
 *     25/08 · dos semanas    1) JM | Uno a uno en Parque Avellaneda 12/08 (pre + post)
 *     27/08 · ejemplo        > Status Cercanía y M2 · 1) JM | … · > Campañas destacadas
 *     27/08 · REAL           Uno a uno en Coghlan (21/08) · Campaña Destacada · Operativo …
 *
 * ⇒ **Ni `>`, ni `N)`, ni `|`, ni el plural son obligatorios.** Cualquier regla que exija uno de
 * los cuatro falla el lunes siguiente, y falla **escribiendo filas**, que es el modo caro.
 *
 * ⛔⛔ **Lo que reemplaza, y por qué.** `partirTemarioEnBloques_` decidía que una línea sin `>`,
 * sin `N)` y sin `|`, de menos de 60 caracteres, **es un encabezado**. Contra el temario real del
 * 27/08 devolvía **3 bloques con `lineas: []`**: las tres líneas eran títulos y **ninguna era
 * contenido**. Y `cargarTemarioCampanas_` comparaba el título **por igualdad**, así que
 * `Campaña Destacada` —singular— **no matcheaba**.
 *
 * ⭐ **El control que no caduca es la IDENTIDAD**, no una constante:
 * `líneas no vacías = reuniones + campañas + ignoradas`. Ninguna línea puede desaparecer.
 *
 * Uso:  node tools/probar-asistente-temario.js
 */
'use strict';

const C = require('./asistente-contexto.js');

let fallas = 0;
let hechas = 0;
function afirmar(condicion, mensaje) {
  hechas++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const PERIODO = '2026_agosto_21_27';

/* ── Los tres temarios reales, COPIADOS y no deducidos ──────────────────────────────────── */

/** 27/08 · el que llegó de verdad. Ni `>`, ni `N)`, ni `|`, y el título en SINGULAR. */
const REAL_2708 = [
  'Uno a uno en Coghlan (21/08)',
  'Campaña Destacada ',
  'Operativo Movilidad Más Segura'
].join('\n');

/** 27/08 · el ejemplo que pasó el usuario. Con marcas, con numeración y con «Otros temas». */
const EJEMPLO_2708 = [
  '> Status Cercanía y M2',
  '1) JM | Uno a uno en Coghlan 21/08',
  '2) JM | Encuentro Temático: Salud 25/08',
  '4) M2 | Campañas y enviados de la semana',
  '> Campañas destacadas',
  '1) Operativo Movilidad Más Segura',
  '> Otros temas',
  'Reunión de gabinete',
  'Varios'
].join('\n');

/** 25/08 · el de agosto, tal como está en `docs/TEMARIOS_reales_2026-08-25.md`. */
const REAL_2508 = [
  '1) JM | Uno a uno en Parque Avellaneda 12/08 (pre + post)',
  '2) JM | Encuentro Temático: Salud 14/08'
].join('\n');

const ctx = C.contexto({ PERIODOS: [] });
function partir(texto) {
  ctx.__t = texto;
  return C.vm.runInContext('partirTemario_(__t)', ctx);
}
function parsear(linea) {
  ctx.__l = linea;
  return C.vm.runInContext('parsearLineaReunion_(__l)', ctx);
}
function iso(f) { return f instanceof Date ? f.toISOString().slice(0, 10) : String(f || ''); }

console.log('El partidor único y el parser — Campanas.gs y Reuniones.gs cargados de verdad\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · ⭐⭐ LA IDENTIDAD, sobre los tres — y no caduca cuando cambie el temario
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · ⭐⭐ la identidad: ninguna línea desaparece del retorno');
{
  /* ⭐ Es un control **por identidad y no por constante**: si mañana llega un cuarto temario con
   * otra forma, esto sigue siendo cierto o el partidor está perdiendo líneas. Una constante
   * («da 3 reuniones») caduca el lunes; esto no. */
  [['27/08 real', REAL_2708], ['27/08 ejemplo', EJEMPLO_2708], ['25/08', REAL_2508]]
    .forEach(function (par) {
      const nombre = par[0];
      const texto = par[1];
      const r = partir(texto);
      const entraron = texto.split('\n').filter(function (l) { return l.trim().length; }).length;
      const salieron = r.reuniones.length + r.campanas.length + r.ignoradas.length;
      afirmar(entraron === salieron,
        nombre + ': ' + entraron + ' línea(s) entran y ' + salieron + ' salen — ninguna se pierde');
    });

  /* ⚠ Y el caso degenerado, que es donde una identidad suele romperse. */
  const vacio = partir('   \n\n  \n');
  afirmar(vacio.reuniones.length === 0 && vacio.campanas.length === 0 && vacio.ignoradas.length === 0,
    '⚠ un pegado de puras líneas vacías da los tres baldes vacíos, sin inventar nada');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · ⭐⭐ EL 27/08 REAL — el caso que hoy escribía una fila rota y perdía dos líneas
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · ⭐⭐ el temario REAL del 27/08 — ni `>`, ni `N)`, ni `|`, y en SINGULAR');
{
  const r = partir(REAL_2708);

  afirmar(r.reuniones.length === 1 && r.reuniones[0] === 'Uno a uno en Coghlan (21/08)',
    '⭐ 1 reunión, y es la de Coghlan');
  afirmar(r.campanas.length === 1 && r.campanas[0] === 'Operativo Movilidad Más Segura',
    '⭐ 1 campaña, la que estaba debajo del corte');
  afirmar(r.ignoradas.length === 1 && r.ignoradas[0].motivo === 'separador',
    '⭐ y 1 ignorada: la línea que corta, con motivo `separador`');
  afirmar(r.ignoradas[0].texto === 'Campaña Destacada',
    '⛔⛔ el corte lo hace «Campaña Destacada» en SINGULAR — el comparador viejo pedía igualdad ' +
    'contra el plural y no matcheaba');

  /* ⭐⭐ Y la línea que era el fallo entero: sin `|`, y ahora parsea completa. */
  const p = parsear(r.reuniones[0]);
  afirmar(p.tipo === 'Uno a uno', '⭐ `tipo` reconocido sin `|`: ' + JSON.stringify(p.tipo));
  afirmar(p.nombre === 'Coghlan', '⭐ `nombre` limpio: ' + JSON.stringify(p.nombre));
  afirmar(iso(p.fecha) === '2026-08-21',
    '⭐⭐ y la fecha SALE DEL PARÉNTESIS: ' + iso(p.fecha) + ' — antes quedaba vacía');
  afirmar(p.eje === '',
    '⛔⛔ `eje` queda VACÍO y NO se completa con un default: el universo lo declara el temario (`R-02`)');
  afirmar(p.notas === '', 'y `notas` sale limpia — ya no dice «no se pudo parsear»');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⛔⛔ EL SEPARADOR NO SE DISPARA SOBRE UNA REUNIÓN — la guarda del `|`
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · ⛔⛔ `4) M2 | Campañas y enviados de la semana` NO corta');
{
  const r = partir(EJEMPLO_2708);

  /* La linea contiene «Campanias» y **es una reunion**: `Campanias y enviados de la semana` esta
   * en `TIPOS_REUNION_CONOCIDOS_`.
   *
   * ⚠⚠ **La separan DOS cerrojos, y el caso 7.1 midio cual aguanta hoy:** el `eje |` sigue
   * en el cuerpo, asi que ni siquiera empieza con `campan` -ese es el primero-; la guarda del `|`
   * es el segundo, e independiente. La afirmacion de abajo mide el primero. */
  const m2 = '4) M2 | Campañas y enviados de la semana';
  afirmar(r.reuniones.indexOf(m2) !== -1,
    '⛔⛔ queda del lado de las REUNIONES — un separador ingenuo cortaría acá');
  afirmar(C.vm.runInContext('cuerpoDeLineaDeTemario_("' + m2.replace(/"/g, '\\"') + '")', ctx)
    .indexOf('campan') !== 0,
    '⚠ y su cuerpo sin `N)` sigue teniendo el `M2 |` adelante, así que ni siquiera empieza con `campan`');

  /* Lo que sí corta, y lo que no. */
  afirmar(r.campanas.length === 1 && r.campanas[0] === '1) Operativo Movilidad Más Segura',
    '⭐ corta `> Campañas destacadas` y queda 1 campaña');
  const descartadas = r.ignoradas.filter(function (x) { return x.motivo === 'bloque descartado'; });
  afirmar(descartadas.length === 2,
    '⭐ y las 2 líneas debajo de «Otros temas» quedan ignoradas: ' + descartadas.length);
  afirmar(descartadas.map(function (x) { return x.texto; }).join('|') === 'Reunión de gabinete|Varios',
    '   con su texto, no con un conteo: ' + descartadas.map(function (x) { return x.texto; }).join(' · '));

  /* ⭐ El encabezado marcado con `>` que no es ninguno de los dos separadores. */
  const enc = r.ignoradas.filter(function (x) { return x.motivo === 'encabezado'; });
  afirmar(enc.length === 1 && enc[0].texto === '> Status Cercanía y M2',
    '⭐ `> Status Cercanía y M2` va a `ignoradas` como `encabezado` — no escribe una fila rota');
  afirmar(r.reuniones.length === 3,
    '   y quedan 3 reuniones: las dos de JM y la de M2');
}
{
  /* ⭐⭐ **El MISMO texto sin la línea `> Otros temas`, para documentar qué pasa** — sin fingir que
   * da lo mismo. Sin el corte, esas dos líneas caen en el balde de CAMPAÑAS, y
   * `cargarTemarioCampanas_` las escribe con `mostrar = 'sí'` (`AJ-1`): **nacen confirmadas**. */
  const sinOtros = EJEMPLO_2708.split('\n').filter(function (l) { return l !== '> Otros temas'; }).join('\n');
  const r = partir(sinOtros);
  afirmar(r.campanas.length === 3,
    '⛔ sin la línea «Otros temas», las 2 de abajo caen en CAMPAÑAS: ' + r.campanas.length);
  afirmar(r.campanas.indexOf('Reunión de gabinete') !== -1,
    '⚠ y «Reunión de gabinete» quedaría como campaña, con `mostrar = sí` por `AJ-1`');
  afirmar(r.ignoradas.filter(function (x) { return x.motivo === 'bloque descartado'; }).length === 0,
    '   No se inventa una heurística de contenido para adivinar dónde termina el bloque: se acepta y se ve');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · El 25/08 sigue dando lo que daba — control de NO REGRESIÓN
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · el 25/08 no cambia');
{
  const r = partir(REAL_2508);
  afirmar(r.reuniones.length === 2 && r.campanas.length === 0 && r.ignoradas.length === 0,
    '⭐ las 2 líneas siguen siendo reuniones, sin campañas ni ignoradas');

  const a = parsear(r.reuniones[0]);
  afirmar(a.eje === 'JM' && a.tipo === 'Uno a uno' && a.nombre === 'Parque Avellaneda' &&
          iso(a.fecha) === '2026-08-12',
    '⭐ Parque Avellaneda: eje JM, 12/08, nombre limpio');
  afirmar(a.notas === '',
    '⚠ y `(pre + post)` sigue reconociéndose como anotación de etapa y se descarta — no ensucia `notas`');

  const b = parsear(r.reuniones[1]);
  afirmar(b.nombre === 'Salud' && iso(b.fecha) === '2026-08-14',
    '⭐ y `Encuentro Temático: Salud` sigue dando `Salud`, sin los dos puntos');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Las líneas de A.4 — el paréntesis, la fecha y el nombre
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · ⭐ el paréntesis final que ES una fecha');
{
  const casos = [
    ['JM | Uno a uno en Coghlan (21/08)', 'Coghlan', '2026-08-21', ''],
    ['JM | Uno a uno en Coghlan 21/08', 'Coghlan', '2026-08-21', ''],
    ['JM | Uno a uno en Coghlan (21/08) (pre + post)', 'Coghlan', '2026-08-21', '']
  ];
  casos.forEach(function (c) {
    const p = parsear(c[0]);
    afirmar(p.nombre === c[1] && iso(p.fecha) === c[2] && p.notas === c[3],
      JSON.stringify(c[0]) + ' → nombre=' + JSON.stringify(p.nombre) + ' fecha=' + iso(p.fecha));
  });

  /* ⚠⚠ **«ES una fecha», no «CONTIENE una fecha»**, y la diferencia es una regresión medida: el
   * paréntesis del agregado de Ministros contiene `24/07` y **tiene que seguir siendo una nota**. */
  const min = parsear('Ministros | Reuniones de la semana (24/07 al 30/07 inclusive - Acumulado)');
  afirmar(iso(min.fecha) === '' && /24\/07 al 30\/07/.test(min.notas),
    '⚠⚠ un paréntesis que CONTIENE una fecha pero no ES una fecha sigue yendo a `notas`');

  /* ⭐ C.2 · el recorte del nombre corre haya fecha o no. */
  const sinFecha = parsear('JM | Uno a uno en Coghlan');
  afirmar(sinFecha.nombre === 'Coghlan',
    '⭐ sin fecha, el nombre igual sale limpio: ' + JSON.stringify(sinFecha.nombre) +
    ' — antes quedaba "en Coghlan"');
  afirmar(/no se encontró fecha/.test(sinFecha.notas),
    '   y la falta de fecha se sigue diciendo en `notas`');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 6 · ⭐⭐ `claveReunion_` sin `eje` — la misma reunión con y sin `|` es UNA
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · ⭐⭐ la clave sin `eje`');
{
  const con = parsear('JM | Uno a uno en Coghlan 21/08');
  const sin = parsear('Uno a uno en Coghlan 21/08');
  con.periodo_id = PERIODO;
  sin.periodo_id = PERIODO;
  ctx.__a = con;
  ctx.__b = sin;
  const ka = C.vm.runInContext('claveReunion_(__a)', ctx);
  const kb = C.vm.runInContext('claveReunion_(__b)', ctx);

  afirmar(con.eje === 'JM' && sin.eje === '', 'las dos filas difieren SÓLO en `eje`');
  afirmar(ka === kb,
    '⭐⭐ y dan la MISMA clave — la misma reunión pegada con y sin `|` no se duplica: ' + ka);
  afirmar(ka.indexOf('JM') === -1, '⛔ `eje` ya no está en la clave');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 7 · ⚠ Los controles negativos — romper a propósito
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n7 · ⚠ los controles negativos');
{
  /* ⛔⛔ **7.1 · Este control se escribio al reves y el rojo lo corrigio - queda dado vuelta
   * con el motivo, que es lo que vale.**
   *
   * La primera version anulaba la guarda del `|` sobre el temario de ejemplo esperando ver la
   * reunion de M2 cambiar de balde. **MEDIDO: no cambia NADA** - las dos corridas dan
   * `reuniones=3 · campanias=1 · ignoradas=5`, identicas. O sea que el control **no medía nada**,
   * que es exactamente el modo de falla de `CLAUDE.md` seccion 4.
   *
   * ⭐⭐ **Y el motivo es un hallazgo de diseno que hay que dejar escrito: hay DOS cerrojos, y
   * el que hoy aguanta no es el del `|`.**
   *
   *   1. `cuerpoDeLineaDeTemario_` saca `>` y `N)` **y NO saca el `eje |`**. Por eso
   *      `4) M2 | Campanias y enviados de la semana` da `m2 | campanias...`, que **no empieza con
   *      `campan`**. Ese es el cerrojo que sostiene el caso real de A.3.
   *   2. La guarda `no tiene |` es el **segundo**, e independiente: sostiene cualquier linea de
   *      reunion **diga lo que diga su texto**.
   *
   * ⚠⚠ **El segundo se vuelve el unico el dia que alguien "mejore" el primero** sacando el
   * eje del cuerpo -que es lo que A.3 sugeria hacer-. Por eso el control de abajo lo aisla con un
   * fixture que lo ejercita de verdad: una linea que **empieza con `campan` Y tiene `|`**. */
  const conPipe = [
    '1) JM | Uno a uno en Coghlan 21/08',
    'Campañas y enviados de la semana | M2',
    '2) JM | Encuentro Temático: Salud 25/08'
  ].join(String.fromCharCode(10));

  const intacto = partir(conPipe);
  afirmar(intacto.reuniones.length === 3 && intacto.campanas.length === 0,
    '⭐⭐ con la guarda, una linea que EMPIEZA con «Campanias» pero tiene `|` es una reunion: 3 reuniones');

  const romper = function (x) {
    return x.archivo === 'Campanas.gs'
      ? x.texto.replace("    if (linea.indexOf('|') === -1) {", '    if (true) {   // ROTO A PROPOSITO')
      : x.texto;
  };
  romper.__archivo = 'Campanas.gs';

  const roto = C.contexto({ PERIODOS: [] }, romper);
  roto.__t = conPipe;
  const r = C.vm.runInContext('partirTemario_(__t)', roto);

  afirmar(r.reuniones.length === 1,
    '⭐ sin la guarda, esa linea CORTA y el temario cambia de balde: ' + r.reuniones.length + ' reunion(es)');
  afirmar(r.campanas.length === 1 && r.campanas[0] === '2) JM | Encuentro Temático: Salud 25/08',
    '⛔⛔ y un ENCUENTRO termina cargado como CAMPANIA: ' + JSON.stringify(r.campanas[0]));
  afirmar(true, '⚠ y la mutacion OCURRIO: sin el parche aplicado, `contexto()` tira antes de medir');

  /* ⭐ Y el primer cerrojo, afirmado para que nadie lo saque sin enterarse. */
  ctx.__x = '4) M2 | Campañas y enviados de la semana';
  afirmar(C.vm.runInContext('cuerpoDeLineaDeTemario_(__x)', ctx) === 'm2 | campanas y enviados de la semana',
    '⭐⭐ y `cuerpoDeLineaDeTemario_` NO saca el `eje |` - ese es el cerrojo que aguanta el caso de A.3');
}
{
  /* 7.2 · ⭐⭐ El control negativo del DEFAULT de `eje`, que es la decisión que más cuesta si se
   * revierte: con un default, la misma reunión con y sin `|` contaría como dos. */
  /* ⛔⛔ `2026-09-01` — **el patrón va por fragmento de UNA línea, y el salto se toma del propio
   * archivo.** Antes era un bloque de dos líneas unido con `\n` literal, así que **no matcheaba
   * sobre un archivo en CRLF** y este banco quedaba en rojo con el mensaje de «la mutación no
   * ocurrió». Es la regla de `CLAUDE.md` §4 —*nunca por bloques con `\n`*— y su forma completa:
   * **el final de línea es del archivo, nunca del que escribe la prueba.**
   *
   * ⭐ Lo destapó normalizar el árbol a CRLF: este banco pasó de verde a rojo **sin que cambiara
   * una afirmación**, que es justo lo que el `.gitattributes` vino a hacer visible. */
  const conDefault = function (x) {
    if (x.archivo !== 'Reuniones.gs') return x.texto;
    const ANCLA = '  var resto = texto.trim();';
    const salto = x.texto.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
    return x.texto.replace(ANCLA, ANCLA + salto + '  propuesta.eje = \'JM\';   // ROTO A PROPOSITO');
  };
  conDefault.__archivo = 'Reuniones.gs';

  const roto = C.contexto({ PERIODOS: [] }, conDefault);
  roto.__l = 'Uno a uno en Coghlan 21/08';
  const p = C.vm.runInContext('parsearLineaReunion_(__l)', roto);
  afirmar(p.eje === 'JM',
    '⭐ con un default, la línea sin `|` sale con `eje = "JM"` inventado — el aserto 2.7 cae');
  afirmar(true, '⚠ y la mutación OCURRIÓ');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 8 · Un partidor, tres llamadores — y los dos retirados no vuelven
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n8 · ⛔ un solo partidor, y los dos viejos retirados');
{
  const campanas = C.fs.readFileSync(C.path.join(C.RAIZ, 'Campanas.gs'), 'utf8');
  const reuniones = C.fs.readFileSync(C.path.join(C.RAIZ, 'Reuniones.gs'), 'utf8');
  const backend = C.fs.readFileSync(C.path.join(C.RAIZ, 'PanelBackend.gs'), 'utf8');

  /* ⭐⭐ Afirmaciones NEGATIVAS: se ponen en rojo el día que alguno de los dos vuelva sin decisión. */
  afirmar(campanas.indexOf('function partirTemarioEnBloques_') === -1,
    '⛔ `partirTemarioEnBloques_` NO está: se comía el contenido cuando no había marcas');
  afirmar(backend.indexOf('function partirTemarioDelAsistente_') === -1 &&
          backend.indexOf('function esBloqueDeCampanas_') === -1,
    '⛔ ni `partirTemarioDelAsistente_` ni `esBloqueDeCampanas_` — eran la segunda forma de decidir');

  /* ⭐ Y los tres llamadores usan la única que queda. */
  afirmar(campanas.indexOf('partirTemario_(textoPegado)') !== -1,
    '⭐ `cargarTemarioCampanas_` parte con `partirTemario_`');
  afirmar(reuniones.indexOf('partirTemario_(textoPegado)') !== -1,
    '⭐ `cargarTemarioReuniones_` también');
  afirmar(backend.indexOf('partirTemario_(texto)') !== -1,
    '⭐ y el asistente también — una definición, tres llamadores');

  /* ⛔ Y los dos cargadores siguen recibiendo el TEXTO ENTERO, sin recortes del llamador. */
  const iCarga = backend.indexOf('function panel_asistenteCargarTemario');
  const bloque = backend.slice(iCarga, iCarga + 3000);
  afirmar(/cargarTemarioReuniones_\(texto, ref\)/.test(bloque) &&
          /cargarTemarioCampanas_\(texto, ref/.test(bloque),
    '⛔⛔ el asistente les pasa el TEXTO ENTERO a los dos — contrato intacto, sin recortes armados');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 9 · Punta a punta — el 27/08 real, con los cargadores y las hojas falseadas
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n9 · ⭐ punta a punta sobre el 27/08 real');
{
  const con = C.contexto({
    PERIODOS: [[PERIODO, '2026-08-21', '2026-08-27', '']],
    REUNIONES: [],
    CAMPANAS: []
  });
  con.catalogoDeCampanas_ = () => ({ ok: true, lista: [] });
  con.__t = REAL_2708;
  const r = C.vm.runInContext('panel_asistenteCargarTemario("' + PERIODO + '", __t, "jm")', con);

  afirmar(r.ok === true, 'carga' + (r.ok ? '' : ' — ' + r.motivo));
  afirmar(r.reuniones.agregadas === 1 && r.reuniones.sinParsear === 0,
    '⭐⭐ 1 reunión agregada y CERO sin parsear — hoy daba 1 fila rota y perdía 2 líneas');
  afirmar((r.campanas.escritas || []).length === 1,
    '⭐ y 1 campaña escrita: el singular ya no rompe el cargador');

  const filas = con.__hojas.REUNIONES.__filas;
  const fila = filas[1];
  afirmar(String(fila[2]) === '' && String(fila[4]) === 'Coghlan',
    '⭐ la fila queda con `eje` vacío y `nombre = "Coghlan"`');
  afirmar(String(fila[8]) === 'Uno a uno en Coghlan (21/08)',
    '⭐⭐ y con `texto_original`, que es lo que `leerReuniones_` ahora mira para dejarla entrar');

  afirmar((r.ignoradas || []).length === 1 && r.ignoradas[0].motivo === 'separador',
    '⭐ y la línea del corte viaja en `ignoradas`, para que el paso 3 la muestre');
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · El COSTO del corte, que está declarado y no resuelto: si un día llega');
console.log('     `M2 | Campañas y enviados de la semana` SIN el `|`, corta. Se acepta y se ve —');
console.log('     la línea queda en `ignoradas` y el paso 3 la muestra.');
console.log('   · Un temario sin la línea «Otros temas»: el caso 3 bis lo documenta, no lo arregla.');
console.log('     No se inventa una heurística de contenido para adivinar dónde termina el bloque.');
console.log('   · Que la hoja VIVA quede bien: está falseada. Eso lo dice una corrida.');

process.exit(fallas === 0 ? 0 : 1);
