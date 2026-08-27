#!/usr/bin/env node
/**
 * `tools/probar-lista-cruda.js` — **`LISTA_CRUDA` y la identidad que cierra `L-038`:**
 * *el banner `m2_campanias` tiene que decir exactamente cuántas líneas publica `m2_camp_lista`.*
 *
 * ⭐⭐ **Es la misma forma con la que cerró `u1_total_clics` en `L-053`: la lámina se verifica contra
 * sí misma.** No hace falta el deck del equipo ni una foto de la base — es una identidad **interna**,
 * así que se puede exigir en cada corrida y **no caduca**: si la fuente se mueve, se mueven el conteo
 * y la lista, y la igualdad sigue cerrando.
 *
 * ⛔⛔ **Y la razón por la que el control negativo importa más que el positivo.** La identidad cierra
 * **por construcción** porque las dos operaciones comparten `distintosDeCampo_`. Si `LISTA_CRUDA` se
 * hubiera construido sobre el núcleo de `LISTA` —que era el candidato obvio— **no cerraría**:
 *
 * | | normalizador | qué hace |
 * |---|---|---|
 * | `calcularConjuntoDeLista_` (`LISTA`) | `normalizar_` | **pliega case y saca acentos** |
 * | `distintosDeCampo_` (`CUENTA_DISTINTOS`, `LISTA_CRUDA`) | `normalizarValorDeclarado_` (`R-10`) | los **preserva** |
 *
 * Medido sobre el fixture del 06/08: `R-10` lleva 1.400 grafías a 1.375 y plegar el case colapsa
 * **4 más**. El caso 3 de abajo **rompe la operación a propósito** para que la identidad se ponga
 * **roja** — sin eso, un verde no distingue *«las dos comparten núcleo»* de *«el fixture no tenía
 * ningún par que los separara»*.
 *
 * ⚠ **Lo que NO contesta:** qué publica el deck. Que la caja entre, que el bullet se herede y que los
 * ~30 nombres no empujen lo de abajo lo dice **una corrida**, y el tope **no existe por decisión del
 * usuario** (26/08): se publican todos y el equipo poda.
 *
 * Uso:
 *   node tools/probar-lista-cruda.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

const MARCADORES = fs.readFileSync(path.join(RAIZ, 'Marcadores.gs'), 'utf8');
const GENERADOR = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

/** Saca una función por nombre contando llaves. Falla fuerte si no está: un extractor que no
 *  encuentra lo que busca tiene que romperse, no seguir con una copia vieja. */
function extraerFuncion(texto, nombre, archivo) {
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) {
    throw new Error('No encontré `function ' + nombre + '(` en ' + archivo +
      ' — si se renombró, esta prueba tiene que enterarse.');
  }
  let i = texto.indexOf('{', inicio);
  if (i === -1) throw new Error('Función ' + nombre + ' sin cuerpo en ' + archivo);
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, j + 1);
    }
  }
  throw new Error('Función ' + nombre + ' sin cerrar en ' + archivo);
}

/** Monta el sandbox desde el texto de `Marcadores.gs` que se le pase — el real, o uno mutado. */
function montar(fuenteMarcadores) {
  const cuerpo = [
    extraerFuncion(fuenteMarcadores, 'distintosDeCampo_', 'Marcadores.gs'),
    extraerFuncion(fuenteMarcadores, 'opCUENTA_DISTINTOS', 'Marcadores.gs'),
    extraerFuncion(fuenteMarcadores, 'opLISTA_CRUDA', 'Marcadores.gs'),
    extraerFuncion(fuenteMarcadores, 'valoresDeCtx_', 'Marcadores.gs'),
    extraerFuncion(fuenteMarcadores, 'trazaDeVentana_', 'Marcadores.gs'),
    // Las dos de verdad, de sus archivos: si alguien las cambia allá, esta prueba se entera.
    extraerFuncion(fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8'),
      'normalizarValorDeclarado_', 'Fuentes.gs'),
    extraerFuncion(fs.readFileSync(path.join(RAIZ, 'Parseo.gs'), 'utf8'),
      'normalizar_', 'Parseo.gs')
  ].join('\n');
  // eslint-disable-next-line no-new-func
  return new Function(cuerpo + '\nreturn { opCUENTA_DISTINTOS, opLISTA_CRUDA, distintosDeCampo_ };')();
}

const M = montar(MARCADORES);

let ok = 0, mal = 0;
function af(nombre, condicion, detalle) {
  if (condicion) { ok++; console.log('  ✅ ' + nombre); }
  else { mal++; console.log('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
}

const SALTO = '\n';
const ctx = (valores, separador) => ({
  valores: valores, separador: separador,
  campo_logico: 'mail_campana', base_id: 'digital', solapa: 'Directa Mail'
});

/* ⭐ El fixture está elegido para DISTINGUIR implementaciones, no para confirmar una. Tiene, a
 * propósito y en este orden: un repetido exacto, dos grafías de espacio de lo mismo, una celda
 * vacía y otra de sólo espacios, **un par que difiere sólo en el CASE** y **otro que difiere sólo
 * en un ACENTO**. Los dos últimos son los que separan `R-10` de `normalizar_`: con `R-10` son
 * cuatro nombres, con el normalizador de `LISTA` son dos. */
const CAMPANAS = [
  'Poda pre',
  'Poda pre',
  ' Poda  pre ',
  '',
  '   ',
  'PODA PRE',
  'Vacunación antirrábica',
  'Vacunacion antirrabica',
  'Luminarias peatonales'
];
const ESPERADOS_R10 = 5; // Poda pre · PODA PRE · Vacunación antirrábica · Vacunacion antirrabica · Luminarias peatonales

console.log('== probar-lista-cruda ==');

console.log('');
console.log('0 · control positivo — la operación existe, corre, y NO pide catálogo');
af('`LISTA_CRUDA` está registrada en `OPERACIONES_`',
  /^\s*LISTA_CRUDA:\s*opLISTA_CRUDA\s*$/m.test(MARCADORES),
  'sin la entrada en el mapa, el despachador no la encuentra y el token sale «FALTA»');
/* ⛔ Si entrara acá, `resolverCatalogoDeMarcador_` le exigiría `MARCADORES.catalogo` y el token
 * saldría «FALTA:m2_camp_lista@sin_catalogo» — que es exactamente el bloqueo que esta operación
 * vino a levantar. La afirmación es NEGATIVA a propósito. */
af('⛔ y NO está en `OPERACIONES_CON_CATALOGO_`',
  !/OPERACIONES_CON_CATALOGO_\s*=\s*\{[^}]*LISTA_CRUDA/.test(MARCADORES),
  'si entra ahí, el despachador le exige catálogo y vuelve el bloqueo que motivó la operación');
{
  const r = M.opLISTA_CRUDA(ctx(CAMPANAS, SALTO));
  af('publica ' + ESPERADOS_R10 + ' nombres sobre el fixture',
    r.publicados === ESPERADOS_R10, 'publicó ' + r.publicados + ': ' + JSON.stringify(r.valor));
  af('  y la traza dice que leyó ' + CAMPANAS.length + ' fila(s)', r.filas === CAMPANAS.length);
  af('  y que dos celdas vacías NO son rechazo', r.vacias === 2, 'dice ' + r.vacias);
  af('  y declara que no hay catálogo, para que nadie busque uno',
    r.traza.indexOf('SIN catálogo: no hay rechazo posible') !== -1, r.traza);
}

console.log('');
console.log('1 · el orden es alfabético y REPRODUCIBLE, no el de la hoja');
{
  const alReves = CAMPANAS.slice().reverse();
  const a = M.opLISTA_CRUDA(ctx(CAMPANAS, SALTO)).valor;
  const b = M.opLISTA_CRUDA(ctx(alReves, SALTO)).valor;
  af('dar vuelta las filas NO cambia lo publicado', a === b,
    'el orden de aparición depende de en qué fila quedó el dato y cambia entre corridas');
  const lineas = a.split(SALTO);
  af('  y las líneas están ordenadas con `localeCompare(es)`',
    JSON.stringify(lineas) === JSON.stringify(lineas.slice().sort((x, y) => x.localeCompare(y, 'es'))),
    JSON.stringify(lineas));
}

console.log('');
console.log('2 · ⭐⭐ LA IDENTIDAD DE LA LÁMINA — `m2_campanias` == líneas de `m2_camp_lista`');
{
  const cuenta = M.opCUENTA_DISTINTOS(ctx(CAMPANAS, SALTO));
  const lista = M.opLISTA_CRUDA(ctx(CAMPANAS, SALTO));
  const lineas = lista.valor.split(SALTO).length;
  af('el banner dice ' + cuenta.valor + ' y la lista tiene ' + lineas + ' línea(s)',
    cuenta.valor === lineas,
    'el deck publicaría un número y una lista de otro largo, uno al lado del otro, sin fallar');
  af('  y el número no es trivial (más de una campaña)', cuenta.valor === ESPERADOS_R10,
    'con un fixture de 1 la identidad cerraría sola y no probaría nada');
}

console.log('');
console.log('3 · ⛔⛔ CONTROL NEGATIVO CON MOTIVO — con el núcleo de `LISTA`, la identidad cae');
/* ⚠ La mutación se EXIGE: si el texto no cambió, el caso corre sobre el código intacto y su verde
 * no prueba nada. Y se muta **sólo el lado de la lista**, que es lo que habría pasado de verdad:
 * `CUENTA_DISTINTOS` seguía con `R-10` y `LISTA_CRUDA` habría heredado `normalizar_` de `LISTA`. */
{
  const ancla = '  var publicados = d.distintos.slice().sort(' +
    'function (a, b) { return a.localeCompare(b, \'es\'); });';
  const reemplazo = '  var publicados = (function () { var vis = {}, out = []; ' +
    'valores.forEach(function (v) { var k = normalizar_(v === undefined || v === null ? \'\' : String(v)); ' +
    'if (!k || (k in vis)) return; vis[k] = true; out.push(k); }); return out; })()' +
    '.sort(function (a, b) { return a.localeCompare(b, \'es\'); });';

  if (MARCADORES.indexOf(ancla) === -1) {
    af('[negativo] el parche encuentra su ancla', false,
      '⛔ no encontré la línea de `publicados` en `opLISTA_CRUDA`: el caso correría sobre código intacto');
  } else {
    const mutado = MARCADORES.replace(ancla, reemplazo);
    af('[negativo] la mutación OCURRIÓ', mutado !== MARCADORES,
      'sin esto, un parche que no aplica se lee como «el negativo pasó»');
    const R = montar(mutado);
    const cuenta = R.opCUENTA_DISTINTOS(ctx(CAMPANAS, SALTO));
    const lista = R.opLISTA_CRUDA(ctx(CAMPANAS, SALTO));
    const lineas = lista.valor.split(SALTO).length;
    af('con `normalizar_` la lista publica MENOS que el banner (' + lineas + ' < ' + cuenta.valor + ')',
      lineas < cuenta.valor,
      'si publicara lo mismo, el fixture no tiene ningún par que separe los dos normalizadores y ' +
      'la afirmación 2 no mide la diferencia que motivó la operación');
    af('  y la identidad de la afirmación 2 se pone ROJA', cuenta.valor !== lineas);
    /* ⭐⭐ **Medido acá y corrige la forma en que se venía contando el problema: los dos
     * normalizadores NO están ordenados por severidad — cada uno junta lo que el otro separa.**
     * `normalizar_` pliega case y acentos **y no toca los espacios internos**; `R-10` colapsa los
     * espacios **y preserva case y acentos**. Sobre este fixture: `normalizar_` junta
     * `Poda pre`+`PODA PRE` y las dos vacunaciones (−2) **y parte** ` Poda  pre ` en un nombre
     * aparte por el espacio doble (+1). Da 4 contra 5, y **no es «4 menos»: es OTRO conjunto**.
     * ⇒ La divergencia entre el banner y la lista no tendría una dirección conocida, que es peor
     * que un error con signo: no se puede leer «bueno, serán algunos menos». */
    const lineasMutadas = lista.valor.split(SALTO);
    af('  y lo que publica es OTRO conjunto, no uno más chico (' + lineas + ' contra ' +
      cuenta.valor + ')', lineas === 4,
      'medido: junta los pares de case y acento, y PARTE la grafía de espacio doble');
    af('  · junta lo que R-10 separa: `PODA PRE` ya no está',
      lineasMutadas.indexOf('PODA PRE') === -1);
    af('  · y separa lo que R-10 junta: aparece `poda  pre` con espacio DOBLE',
      lineasMutadas.some(function (l) { return l.indexOf('poda  pre') !== -1; }),
      'ese nombre nunca sale de `R-10`, que colapsa los espacios internos');
  }
}

console.log('');
console.log('4 · ⚠ el SALTO REAL y los dos caracteres `\\`+`n` se ven iguales y hacen lo opuesto');
/* ⛔ Vuelven **idénticos** de Sheets como texto de una celda, y en un log se leen parecido. Uno abre
 * párrafo en Slides —y cada párrafo hereda bullet, nivel y sangría— y el otro imprime dos caracteres
 * en la misma línea. Un banco lo afirma porque el ojo no los distingue. */
{
  const conSalto = M.opLISTA_CRUDA(ctx(CAMPANAS, '\n')).valor;
  const conDosChars = M.opLISTA_CRUDA(ctx(CAMPANAS, '\\n')).valor;
  af('el salto REAL produce ' + ESPERADOS_R10 + ' línea(s)',
    conSalto.split('\n').length === ESPERADOS_R10, 'dio ' + conSalto.split('\n').length);
  af('⛔ los caracteres `\\`+`n` producen UNA sola línea',
    conDosChars.split('\n').length === 1, 'dio ' + conDosChars.split('\n').length);
  af('  y el de dos caracteres lleva la barra literal adentro',
    conDosChars.indexOf('\\n') !== -1);
  af('  ⚠ y los dos separadores tienen LARGO distinto — 1 contra 2, que es la única forma barata de ' +
    'distinguirlos al leerlos de una celda', '\n'.length === 1 && '\\n'.length === 2);
  af('  ⚠ y crudos NO se distinguen: hay que escaparlos para verlos',
    JSON.stringify('\n') !== JSON.stringify('\\n'),
    'si se imprimen sin escapar, los dos se leen como un corte de línea');
}

console.log('');
console.log('5 · ⛔ el despachador le pasa `separador` — la grieta que se llevó a `ELEMENTO`');
/* `ctx.separador` vivía DENTRO del `if` del catálogo, así que sólo llegaba a las operaciones que
 * además usan catálogo. `LISTA_CRUDA` no usa catálogo y sí usa `separador`: sin la línea afuera,
 * habría publicado con el default `', '` **sin fallar** — una lista correcta, en una sola línea,
 * donde la plantilla espera un bullet por nombre. */
{
  af('`ctx.separador = fila.separador;` está en el nivel de arriba, fuera de la rama del catálogo',
    /\n {4}ctx\.separador = fila\.separador;/.test(GENERADOR),
    'sin esto `LISTA_CRUDA` recibe `undefined` y cae al default `, `');
  af('⛔ y YA NO está adentro de la rama del catálogo',
    !/ctx\.catalogo = cat\.catalogo;\s*\r?\n\s*ctx\.separador/.test(GENERADOR),
    'si vuelve adentro, las operaciones sin catálogo dejan de recibirlo y publican en una línea');
}

console.log('');
console.log('6 · ⭐⭐ LA FILA — mismo universo que su hermano, y el separador es un salto REAL');
/* ⚠ Se **evalúa** el objeto del seed, no se greppea el texto: en el fuente el separador se escribe
 * con dos caracteres —barra y ene— que JavaScript convierte en **uno**. Buscar la cadena por texto
 * mediría el fuente y no el valor, que es la figura del artefacto equivocado (`CLAUDE.md` §4). */
{
  const INSTALAR = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
  /* ⚠ **El nombre aparece más de una vez y sólo una es la DEFINICIÓN.** `m2_campanias` sale también
   * en el anotador de notas, con un objeto de tres campos que ni siquiera evalúa fuera de su
   * función. Se recorren todas las apariciones y se toma **la que declara `operacion:`** — buscar
   * la primera daba la equivocada, y el síntoma fue un `ReferenceError`, que es lo que corresponde:
   * un extractor que agarra otra cosa tiene que romperse, no devolver algo plausible. */
  const bloqueDesde = (i) => {
    let ini = INSTALAR.lastIndexOf('{', i);
    let nivel = 0;
    for (let j = ini; j < INSTALAR.length; j++) {
      if (INSTALAR[j] === '{') nivel++;
      else if (INSTALAR[j] === '}') {
        nivel--;
        if (nivel === 0) return INSTALAR.slice(ini, j + 1);
      }
    }
    return null;
  };
  const filaDe = (nombre) => {
    const aguja = "marcador: '" + nombre + "'";
    for (let i = INSTALAR.indexOf(aguja); i !== -1; i = INSTALAR.indexOf(aguja, i + 1)) {
      const txt = bloqueDesde(i);
      if (!txt || txt.indexOf('operacion:') === -1) continue;
      // eslint-disable-next-line no-new-func
      return new Function('return ' + txt)();
    }
    throw new Error('No encontré la fila de definición de `' + nombre + '` en Instalar.gs — ' +
      'ninguna aparición declara `operacion:`.');
  };

  const lista = filaDe('m2_camp_lista');
  const banner = filaDe('m2_campanias');

  af('`m2_camp_lista` declara `operacion: LISTA_CRUDA`', lista.operacion === 'LISTA_CRUDA',
    'dice ' + JSON.stringify(lista.operacion));
  af('  y `formato: texto`', lista.formato === 'texto', 'dice ' + JSON.stringify(lista.formato));
  af('  y NO declara `catalogo`', !lista.catalogo,
    'un catálogo acá rechazaría campañas legítimas y no llegarían al deck');

  /* ⭐⭐ La identidad de la afirmación 2 sólo vale si los dos leen LO MISMO. Acá se verifica sobre
   * la configuración, que es donde puede romperse sin que ninguna cuenta falle. */
  ['base_id', 'solapa', 'campo_logico', 'dimensiones'].forEach((campo) => {
    af('  · `' + campo + '` idéntico al de `m2_campanias` (' + JSON.stringify(banner[campo]) + ')',
      lista[campo] === banner[campo],
      'lista dice ' + JSON.stringify(lista[campo]) + ' — si difieren, el banner cuenta OTRO ' +
      'universo y la identidad de la lámina deja de significar algo');
  });
  af('  · y su hermano sigue siendo `CUENTA_DISTINTOS`', banner.operacion === 'CUENTA_DISTINTOS',
    'dice ' + JSON.stringify(banner.operacion));

  af('⭐ `separador` es UN salto de línea real (charCode 10)',
    typeof lista.separador === 'string' && lista.separador.length === 1 &&
    lista.separador.charCodeAt(0) === 10,
    'vino ' + JSON.stringify(lista.separador) + ' · largo ' +
    (lista.separador || '').length + ' · charCodes [' +
    String(lista.separador || '').split('').map((c) => c.charCodeAt(0)).join(', ') + ']');
  af('  ⛔ y NO son los dos caracteres barra+ene', lista.separador !== '\\n',
    'con esos dos la lista sale en UNA línea y sin bullets, y en un log se ve igual');

  /* ⛔ El alta reescribe la fila entera, así que el wrapper tiene que releer lo que quedó en la
   * celda — un carácter invisible es justo donde `C-83` muerde. */
  af('el wrapper RELEE el separador de la hoja y exige charCode 10',
    /charCodeAt\(0\) === 10/.test(INSTALAR) && /r\.releido/.test(INSTALAR),
    'sin la relectura, «se pidió escribir un salto» y «quedó un salto» son dos cosas distintas');
  af('  y si no quedó bien, NO anota la nota del hermano (sería falsa)',
    /NO se anota la nota del hermano/.test(INSTALAR));
}

console.log('');
console.log('══════════════════════════════════════════');
console.log('  ' + ok + ' afirmación(es) en verde · ' + mal + ' en rojo · sobre ' + CAMPANAS.length +
  ' fila(s) de fixture, con el código extraído de Marcadores.gs, Fuentes.gs y Parseo.gs');
console.log('  ⚠ No cubre: qué publica el deck, ni si la caja entra. El tope NO existe por');
console.log('     decisión del usuario (26/08): se publican todos los nombres y el equipo poda.');
if (mal) { console.log('  ⛔ HAY ROJAS'); process.exit(1); }
console.log('  ✅ TODO VERDE');
