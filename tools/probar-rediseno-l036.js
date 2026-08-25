/**
 * `2026-08-25` — el rediseño de `L-036` por PLATAFORMA: la parte estructural.
 *
 * ⛔ **Este banco NO cubre el cableado**, y eso es a propósito: los 32 marcadores **no se
 * escribieron**. `S-06` declara por qué — el **grano** está decidido (por plataforma) pero el
 * **orden de las cuatro ranuras** no está medido, y cablearlo publicaría *un número correcto en la
 * fila equivocada*, que es el modo de falla más caro del repo y el único que no avisa.
 *
 * Lo que sí se afirma acá es lo que quedó hecho y es verificable sin la planilla.
 *
 * Corre con: `node tools/probar-rediseno-l036.js`
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

let ok = 0;
let mal = 0;

function af(cond, texto, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + texto); }
  else { mal++; console.log('  ❌ ' + texto + (detalle ? ' — ' + detalle : '')); }
}

const instalar = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const fuentes = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');

console.log('L-036 por plataforma — la parte estructural del rediseño\n');

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · El botón que quedó invalidado FRENA, y no se borró
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · `declararModoDelAgregadoPost()` frena en vez de correr');
{
  const desde = instalar.indexOf('function declararModoDelAgregadoPost()');
  af(desde !== -1, 'la función sigue existiendo — no se borró');
  const cuerpo = instalar.slice(desde, instalar.indexOf('\n}', desde));

  /* ⭐⭐ La afirmación que importa: el `return` de freno tiene que estar ANTES de la llamada a
   * `curarSecciones_`. Un comentario que diga «invalidado» con el código vivo debajo es
   * exactamente un botón-trampa: sigue siendo apretable y rompe el rediseño en silencio. */
  const iFreno = cuerpo.indexOf('return {');
  const iCurar = cuerpo.indexOf('curarSecciones_');
  af(iFreno !== -1 && iCurar !== -1 && iFreno < iCurar,
    '⭐ el `return` de freno va ANTES de `curarSecciones_` — no es sólo un comentario');
  af(cuerpo.indexOf('frenado: true') !== -1, 'y el resultado lo declara `frenado`');
  af(cuerpo.indexOf('ok: false') !== -1, 'con `ok: false`, así que ningún llamador lo lee como éxito');
  af(cuerpo.indexOf('repetible') !== -1,
    'y el motivo dice qué tiene que pasar en su lugar: la sección se queda `repetible`');

  /* Su reverso sigue existiendo, por si alguien ya lo corrió antes del 25/08. */
  af(instalar.indexOf('function volverComunicacionesPostARepetible') !== -1,
    'y `volverComunicacionesPostARepetible()` sigue ahí — alguien pudo haberlo corrido antes');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · La sección: una lámina, un ítem
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · `comunicaciones_post` queda `repetible` con UN ítem por lámina');
{
  const desde = instalar.indexOf("filaSeccion_({ id: 'comunicaciones_post'");
  af(desde !== -1, 'la fila del seed existe');
  const fila = instalar.slice(desde, instalar.indexOf('\n', desde));

  /* ⭐ El grano de la lámina: las cuatro filas son PLATAFORMAS de UN encuentro, así que una
   * lámina lleva un ítem. El `4` de antes decía «cuatro encuentros en una lámina». */
  af(fila.indexOf("itemsPorLamina: '1'") !== -1,
    '⭐ `itemsPorLamina` es 1 — las cuatro filas son plataformas, no encuentros',
    fila.match(/itemsPorLamina: '\d+'/) ? fila.match(/itemsPorLamina: '\d+'/)[0] : '(no está)');
  af(fila.indexOf("modo: 'repetible'") !== -1,
    'y `modo` sigue en `repetible` — es lo que recorta por encuentro');
  af(fila.indexOf("itera: 'REUNIONES'") !== -1 && fila.indexOf("filtro: 'etapa=post'") !== -1,
    'con `itera: REUNIONES` y `filtro: etapa=post`, igual que `L-053` con el «1 a 1»');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · El `MAPEO` que el rediseño necesita
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · las columnas del desglose que `L-036` va a leer');
{
  /* Cada campo se busca UNO POR UNO contra el seed — pertenencia, no un filtro por prefijo
   * `des_`, que es lo que `CLAUDE.md` §4 prohíbe: filtrar GENERA en vez de CRUZAR. */
  const necesarios = {
    des_id_cuenta: 'la clave del encuentro',
    des_plataforma: 'el corte de las cuatro filas',
    des_campana: 'de acá sale el pre/post',
    des_impresiones: 'columna Impresiones de la lámina',
    des_visualizaciones: 'columna Visualizaciones',
    des_fecha_inicio: 'columna Período',
    des_fecha_fin: 'columna Período',
    des_nomenclatura: 'columna Formato — ⭐ el alta de hoy'
  };
  Object.keys(necesarios).forEach((campo) => {
    af(instalar.indexOf("campo_logico: '" + campo + "'") !== -1,
      campo + ' — ' + necesarios[campo]);
  });

  const desde = instalar.indexOf("campo_logico: 'des_nomenclatura'");
  const fila = desde === -1 ? '' : instalar.slice(desde, instalar.indexOf('\n', desde));
  af(fila.indexOf("columna: 'L'") !== -1, '`des_nomenclatura` apunta a la columna L');
  af(fila.indexOf("encabezado: 'Nomenclatura'") !== -1,
    'y declara su encabezado — `D-31`: la letra manda, el título es testigo');
  /* ⚠ El bloqueo va escrito en la propia fila: campos variables cuya posición cambia por
   * plataforma. Sin esto, alguien la lee como lista para usar. */
  // Sin case: la nota grita `POSICIÓN` en mayúscula y el aviso vale igual escrito de las dos formas.
  af(fila.indexOf('REVISAR') !== -1 && fila.toLowerCase().indexOf('posición') !== -1,
    '⚠ y avisa que sus campos son variables y la POSICIÓN cambia por plataforma');
}

console.log('\n3b · lo que el desglose NO tiene, y por eso `Agenda JM | Post` no se saca');
{
  /* ⭐⭐ Medido sobre el fixture del 20/08: las 26 columnas de `CAMPAÑAS_DESGLOCE_DIGITAL` NO
   * incluyen Alcance ni Habitantes, en ningún nombre. Ésta es la afirmación que impide que
   * alguien lea «fuente equivocada» y borre las siete filas de `MAPEO` de la solapa derivada. */
  af(instalar.indexOf("campo_logico: 'des_alcance'") === -1,
    '⭐ no existe `des_alcance` — el desglose no tiene Alcance en ningún nombre');
  af(instalar.indexOf("campo_logico: 'des_habitantes'") === -1,
    'ni `des_habitantes`');
  af(instalar.indexOf("campo_logico: 'poblacion'") !== -1 &&
    instalar.indexOf("campo_logico: 'alc_real'") !== -1,
    '⭐ y `poblacion` y `alc_real` siguen mapeados sobre `Agenda JM | Post` — es la fuente CORRECTA para esas dos');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Las dimensiones que el cableado va a usar ya existen
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · `plataforma` y `etapa` ya declaran esta solapa — cero código nuevo');
{
  const dim = fuentes.slice(fuentes.indexOf('var DIMENSIONES_ = {'), fuentes.indexOf('\n};', fuentes.indexOf('var DIMENSIONES_ = {')));
  ['meta', 'google', 'programmatic'].forEach((p) => {
    const i = dim.indexOf(p + ': {');
    const bloque = i === -1 ? '' : dim.slice(i, dim.indexOf('}', i));
    af(bloque.indexOf('digital|CAMPAÑAS_DESGLOCE_DIGITAL') !== -1,
      '`plataforma=' + p + '` declara `digital|CAMPAÑAS_DESGLOCE_DIGITAL`');
  });

  /* ⭐ `programmatic` por RESTA y no por lista (`R-24`): en esta solapa la tercera plataforma se
   * llama `DV360` y el deck la rotula `Programmatic`. Enumerarla habría exigido saber ese nombre. */
  const iProg = dim.indexOf('programmatic: {');
  af(dim.slice(iProg, dim.indexOf('}', iProg)).indexOf('!=') !== -1,
    '⭐ y `programmatic` se define por RESTA — así `DV360` y `TikTok` entran solas (`R-24`)');

  af(dim.indexOf("post: { 'digital|CAMPAÑAS_DESGLOCE_DIGITAL'") !== -1,
    '`etapa=post` también, con el criterio ampliado de hoy');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · ⛔ Lo que NO se hizo, afirmado para que no se lea como olvido
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · el cableado NO está escrito, y `S-06` dice por qué');
{
  /* ⭐⭐ Afirmaciones NEGATIVAS a propósito. Si mañana alguien cablea sin resolver el orden de las
   * ranuras, estas dos se ponen ROJAS — y estarían diciendo la verdad: que se cableó sobre un
   * supuesto sin confirmar. Es la forma que `CLAUDE.md` §4 fija: *el control viejo gana
   * afirmaciones negativas en vez de perder exigencia*. */
  af(instalar.indexOf('cablearTablaPostPorPlataforma_') === -1,
    '⛔ `cablearTablaPostPorPlataforma_` NO existe todavía — el orden de las ranuras no está medido');
  af(instalar.indexOf("dimensiones: 'etapa=post && plataforma=") === -1,
    'y ningún marcador `post_*` declara todavía el corte por plataforma');

  const sup = fs.readFileSync(path.join(RAIZ, 'docs/SUPUESTOS.md'), 'utf8');
  af(sup.indexOf('**S-06**') !== -1, '⭐ y `S-06` está registrado con su reversión');
  af(sup.indexOf('TOTAL · Meta · Google · Programmatic') !== -1,
    'nombrando el orden que se asumiría y no está medido');

  /* El cableado viejo sigue en pie hasta que el nuevo lo reemplace: retirarlo antes dejaría la
   * lámina sin nada y sin nada mejor. */
  af(instalar.indexOf('MARCADORES_POST_L036_TODOS_') !== -1,
    'el cableado viejo y su reversión siguen en pie — no se retira lo que hay sin reemplazo');
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Nada sobre los 32 marcadores: NO se escribieron (`S-06`).');
console.log('   · Que la hoja viva refleje el `itemsPorLamina: 1`. `sembrarSecciones_` sólo agrega');
console.log('     filas AUSENTES y nunca pisa una existente — hace falta `curarSecciones_`.');
console.log('   · Cómo extraer el `Formato` de `Nomenclatura`: la columna está mapeada, el');
console.log('     extractor no existe y sus campos son variables por plataforma.');

process.exit(mal ? 1 : 0);
