/**
 * `2026-08-24_2` Parte B — el banco del alcance: qué descuenta el conteo y qué NO.
 *
 * ⭐ **Extrae las funciones reales de `PanelBackend.gs` e `Instalar.gs`, no las reimplementa**
 * (`CLAUDE.md` §4). Lo único falseado es la plataforma.
 *
 * ⭐⭐ **Y el control que más importa acá es el que impide que este banco se afloje:** las listas de
 * `ALCANCE_LAMINAS_JM_` y `TOKENS_EQUIPO_JM_` se cruzan contra el **censo del 22/08**, que es
 * evidencia fechada. Si mañana aparece un token legítimo posterior al censo, **la evidencia no está
 * mal — lo nuevo es posterior**, y va con su propio control de otra clase.
 *
 * Corre con: `node tools/probar-alcance-de-laminas.js`
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

let ok = 0;
let mal = 0;
const avisos = [];

function af(cond, texto, detalle) {
  if (cond) { ok++; console.log('  ✅ ' + texto); }
  else { mal++; console.log('  ❌ ' + texto + (detalle ? ' — ' + detalle : '')); }
}

/** Extrae una función o un `var` de un `.gs` por posición. ⚠ Nunca por regex con `\n}\n`: los
 *  `.gs` están en CRLF y ese patrón no matchea — ya dejó cinco afirmaciones sin correr un día. */
function extraer(archivo, firma, cierre) {
  const texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
  const desde = texto.indexOf(firma);
  if (desde === -1) return null;
  const fin = texto.indexOf(cierre || '\n}', desde);
  return fin === -1 ? null : texto.slice(desde, fin + (cierre || '\n}').length);
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 1 · `clasificarFaltante_` — los cuatro cubos, y el criterio de TODAS
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('El alcance de una lámina — clasificación, conteo y cruce contra el censo\n');
console.log('1 · la clasificación exige TODAS las láminas, nunca alguna');
{
  const ctx = { console, Math, JSON, String, Number, Object, Array, Boolean };
  vm.createContext(ctx);
  const fn = extraer('PanelBackend.gs', 'function clasificarFaltante_');
  if (!fn) {
    mal++;
    console.log('  ❌ no se encontró `clasificarFaltante_` en PanelBackend.gs');
  } else {
    vm.runInContext(fn, ctx, { filename: 'PanelBackend.gs (extracto)' });

    ctx.__decl = {
      alcance: {
        'L-039': 'fuera_de_alcance', 'L-048': 'fuera_de_alcance', 'L-050': 'fuera_de_alcance',
        'L-046': 'en_alcance', 'L-047': 'en_alcance', 'L-036': 'en_alcance'
      },
      tokens_equipo: {
        'L-046': { camp_bench_meta_ctr: true, camp_dig_insight: true },
        'L-047': { camp_mail_insight: true }
      }
    };
    const clase = (token, laminas) => {
      ctx.__f = { token, laminas };
      return vm.runInContext('clasificarFaltante_(__f, __decl)', ctx);
    };

    af(clase('camp_resp_total', ['L-048']) === 'fuera_de_alcance',
      'un token de una lámina fuera de alcance → `fuera_de_alcance`', clase('camp_resp_total', ['L-048']));
    af(clase('camp_meta_ctr', ['L-046']) === 'real',
      'un token cableable de una lámina en alcance → `real`', clase('camp_meta_ctr', ['L-046']));
    af(clase('camp_bench_meta_ctr', ['L-046']) === 'texto_equipo',
      'un token declarado del equipo → `texto_equipo`', clase('camp_bench_meta_ctr', ['L-046']));

    /* ⭐⭐ LA afirmación de este banco. `camp_titulo` vive en 14 láminas: si una sola está en
     * alcance, HAY QUE CABLEARLO. Con el criterio «alguna está fuera de alcance» el token
     * desaparecería del número que decide el cierre de fase — el error caro en la dirección que no
     * avisa. Es el mismo criterio con el que `solo_escondidas` ya decide. */
    af(clase('camp_titulo', ['L-046', 'L-048']) === 'real',
      '⭐ un token en DOS láminas, una en alcance y una fuera → `real`: alcanza con una viva',
      clase('camp_titulo', ['L-046', 'L-048']));
    af(clase('camp_titulo', ['L-039', 'L-048', 'L-050']) === 'fuera_de_alcance',
      'y con las TRES fuera de alcance sí sale del conteo');

    /* Lo mismo para el texto del equipo: declarado en una lámina y no en la otra, sigue siendo
     * trabajo real — alguien lo tiene que poner en la que no lo declara. */
    af(clase('camp_mail_insight', ['L-046', 'L-047']) === 'real',
      'un token del equipo en L-047 pero NO declarado en L-046 → `real`',
      clase('camp_mail_insight', ['L-046', 'L-047']));

    /* ⛔ El alcance manda sobre el texto del equipo: una lámina que no se cablea se lleva su
     * contenido entero, y decir «texto del equipo» afirmaría que alguien lo va a escribir. */
    ctx.__decl.tokens_equipo['L-048'] = { camp_resp_insight: true };
    af(clase('camp_resp_insight', ['L-048']) === 'fuera_de_alcance',
      'el alcance manda sobre el texto del equipo, no al revés');

    af(clase('imp_meta', []) === 'sin_lamina',
      'sin lámina → `sin_lamina`, no `real`: no se puede clasificar lo que no se sabe dónde está');
    af(clase('secco_algo', ['L-007']) === 'sin_declarar',
      'una lámina cuyo alcance nadie escribió → `sin_declarar`, su propio cubo',
      clase('secco_algo', ['L-007']));
    /* ⚠ Parcialmente declarada también es `sin_declarar`: con una sola lámina sin declarar no se
     * puede afirmar «todas fuera de alcance», y asumir que la que falta está en alcance sería
     * fabricar la declaración que la columna existe para no fabricar. */
    af(clase('camp_titulo', ['L-046', 'L-007']) === 'sin_declarar',
      'y una fila con UNA lámina sin declarar tampoco se resuelve a medias');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 2 · `declaracionesDeLaminas_` — y el aviso cuando las columnas no existen
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · el lector de LAMINAS, y qué dice cuando la hoja todavía no tiene las columnas');
{
  function contexto(headers, filas) {
    const ctx = {
      console, Math, JSON, String, Number, Object, Array, Boolean,
      leerLaminas_: () => ({
        ok: true, headers,
        filas: filas.map(f => { const o = {}; headers.forEach((h, i) => { o[h] = f[i]; }); return o; })
      })
    };
    vm.createContext(ctx);
    vm.runInContext(extraer('PanelBackend.gs', 'function declaracionesDeLaminas_'), ctx,
      { filename: 'PanelBackend.gs (extracto)' });
    return vm.runInContext('declaracionesDeLaminas_()', ctx);
  }

  const con = contexto(
    ['lamina_id', 'alcance', 'tokens_equipo'],
    [
      ['L-039', 'fuera_de_alcance', ''],
      ['L-046', 'en_alcance', ' camp_bench_meta_ctr , camp_dig_insight '],
      ['L-030', '', ''],
      ['', '', '']                                   // fila en blanco al final
    ]
  );
  af(con.columnas === true, 'con las columnas presentes lo declara');
  af(con.alcance['L-039'] === 'fuera_de_alcance' && con.alcance['L-046'] === 'en_alcance',
    'lee el alcance de las dos declaradas');
  af(con.alcance['L-030'] === undefined,
    'una celda vacía NO entra al mapa — «sin declarar» no es un valor');
  af(con.tokens_equipo['L-046'].camp_bench_meta_ctr === true &&
    con.tokens_equipo['L-046'].camp_dig_insight === true,
    'la lista se parte por comas y se trimea');
  af(Object.keys(con.tokens_equipo['L-046']).length === 2,
    'y no fabrica un token vacío con los espacios de más');
  af(con.tokens_equipo['L-030'] === undefined, 'una lista vacía no crea entrada');

  /* ⭐⭐ La afirmación que separa «nadie declaró nada» de «la columna no existe». Las dos se ven
   * idénticas desde el conteo y mandan a trabajos opuestos: llenar la hoja contra correr
   * `instalar()`. Es la familia del glifo que miente sobre la causa. */
  const sin = contexto(['lamina_id', 'notas'], [['L-039', 'x']]);
  af(sin.columnas === false, 'sin las columnas lo declara `false`');
  af(sin.motivo.indexOf('instalar()') !== -1,
    'y el motivo manda al trabajo correcto: correr `instalar()`, no llenar la hoja', sin.motivo);
  af(Object.keys(sin.alcance).length === 0, 'y no inventa clasificación con lo que hay');

  /* Sin hoja: no puede tirar. El panel se abre igual. */
  const ctxSin = { console, Math, JSON, String, Number, Object, Array, Boolean,
    leerLaminas_: () => ({ ok: false, motivo: 'No existe la hoja LAMINAS' }) };
  vm.createContext(ctxSin);
  vm.runInContext(extraer('PanelBackend.gs', 'function declaracionesDeLaminas_'), ctxSin);
  const nada = vm.runInContext('declaracionesDeLaminas_()', ctxSin);
  af(nada.ok === false && nada.columnas === false && Object.keys(nada.alcance).length === 0,
    'sin hoja LAMINAS devuelve vacío y `ok:false` — no tira y no inventa');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 3 · Las listas contra el CENSO del 22/08 — evidencia fechada, no se afloja
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · cada token declarado del equipo existe en el censo, en SU lámina');
{
  const censo = fs.readFileSync(path.join(RAIZ, 'docs/CENSO_tokens_sin_fila_2026-08-22.md'), 'utf8');

  /* El censo lista, por lámina, los tokens sin fila. Se parsea el bloque de cada lámina y se cruza
   * **token por token**: pertenencia, no filtro por prefijo. `CLAUDE.md` §4 — filtrar por prefijo
   * *se siente* como leer el censo y **genera** en vez de **cruzar**. */
  function tokensDelCenso(laminaId) {
    const marca = '· ' + laminaId;
    const desde = censo.indexOf(marca);
    if (desde === -1) return null;
    const finLinea = censo.indexOf('\n', desde);
    const proxima = censo.indexOf('  lámina ', finLinea);
    const bloque = censo.slice(finLinea, proxima === -1 ? censo.length : proxima);
    return bloque.split(/[,\s]+/).map(s => s.trim()).filter(s => /^[a-z][a-z0-9_]+$/.test(s));
  }

  const ctxI = { console, Math, JSON, String, Number, Object, Array };
  vm.createContext(ctxI);
  vm.runInContext(extraer('Instalar.gs', 'var ALCANCE_LAMINAS_JM_', '\n};'), ctxI);
  vm.runInContext(extraer('Instalar.gs', 'var TOKENS_EQUIPO_JM_', '\n};'), ctxI);
  const alcance = vm.runInContext('ALCANCE_LAMINAS_JM_', ctxI);
  const equipo = vm.runInContext('TOKENS_EQUIPO_JM_', ctxI);

  Object.keys(equipo).forEach((laminaId) => {
    const delCenso = tokensDelCenso(laminaId);
    if (!delCenso) {
      af(false, laminaId + ': se encontró su bloque en el censo del 22/08',
        'el censo cambió de forma — el cruce NO corrió, que es distinto de que coincidan');
      return;
    }
    const declarados = equipo[laminaId].split(',').map(s => s.trim()).filter(Boolean);
    const huerfanos = declarados.filter(t => delCenso.indexOf(t) === -1);
    af(huerfanos.length === 0,
      laminaId + ': los ' + declarados.length + ' tokens declarados del equipo están en el censo',
      'no están: ' + huerfanos.join(', '));
  });

  /* ⭐⭐ EL control que fija el hallazgo del prompt, escrito como afirmación NEGATIVA para que no se
   * pierda: el prompt ubicaba `camp_mail_insight` en `L-046` y el censo lo pone en `L-047`. Si
   * algún día apareciera en L-046, esto se pone rojo — y estaría diciendo la verdad. */
  af(equipo['L-046'].indexOf('camp_mail_insight') === -1,
    '⭐ `camp_mail_insight` NO está declarado en L-046 — el censo lo pone en L-047');
  af(equipo['L-047'].indexOf('camp_mail_insight') !== -1,
    'y sí en L-047, que es donde el censo lo lista');
  af(equipo['L-046'].split(',').length === 7,
    'L-046 declara SIETE tokens del equipo, no ocho', equipo['L-046'].split(',').length + '');

  /* ⏸ `camp_bench_remitente` queda SIN DECLARAR a propósito: ningún documento lo dice texto del
   * equipo, y deducirlo del prefijo es el error que esta lista evita. La afirmación negativa lo
   * fija — si alguien lo agrega sin una decisión escrita, esto se pone rojo. */
  af(Object.keys(equipo).every(k => equipo[k].indexOf('camp_bench_remitente') === -1),
    '⏸ `camp_bench_remitente` NO está declarado: falta la decisión del usuario, no el prefijo');

  /* Las tres fuera de alcance son `D-39`, y el censo las nombra. */
  af(alcance.fuera_de_alcance.join('|') === 'L-039|L-048|L-050',
    'las tres fuera de alcance son las de `D-39`', alcance.fuera_de_alcance.join('|'));
  af(alcance.fuera_de_alcance.every(id => alcance.en_alcance.indexOf(id) === -1),
    'ninguna lámina está en las dos listas a la vez');
  af(alcance.en_alcance.length + alcance.fuera_de_alcance.length === 24,
    'entre las dos listas están las 24 filas de `jm` (23 del tablero + L-052)',
    (alcance.en_alcance.length + alcance.fuera_de_alcance.length) + '');

  /* ⚠ `secco` sin declarar, y es la afirmación que impide que alguien lo "complete" sin decisión. */
  af(alcance.en_alcance.concat(alcance.fuera_de_alcance).every(id => Number(id.slice(2)) >= 30),
    '⚠ ninguna lámina de `secco` (L-001–L-029) se declara: nadie escribió su alcance');
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Controles NEGATIVOS — con motivo y con guarda de mutación aplicada
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · romper a propósito: rojo POR EL MOTIVO correcto');
{
  const texto = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  const casos = [
    {
      nombre: 'con `some` en vez de `every`, un token vivo desaparece del conteo del cierre',
      buscar: "  if (fila.laminas.every(function (id) { return decl.alcance[id] === 'fuera_de_alcance'; })) {",
      poner: "  if (fila.laminas.some(function (id) { return decl.alcance[id] === 'fuera_de_alcance'; })) {",
      probar: (clase) => clase('camp_titulo', ['L-046', 'L-048']) === 'fuera_de_alcance'
    },
    {
      nombre: 'sin la guarda de `sin_declarar`, una lámina que nadie declaró se cuenta como real',
      buscar: '  if (declaradas.length < fila.laminas.length) return \'sin_declarar\';',
      poner: '  // roto a propósito',
      probar: (clase) => clase('secco_algo', ['L-007']) === 'real'
    }
  ];

  casos.forEach((caso) => {
    /* ⭐⭐ La guarda que va ANTES de mirar el resultado: si el texto mutado es idéntico al original,
     * el caso **falla** — no se saltea. Sin esto el negativo corre sobre el código intacto y da
     * verde, que se lee como «el negativo pasó». */
    const mutado = texto.replace(caso.buscar, caso.poner);
    if (mutado === texto) {
      af(false, 'MUTACIÓN NO APLICADA: «' + caso.nombre + '»',
        'el patrón no matcheó — el banco está leyendo un código que cambió de forma');
      return;
    }
    const ctx = { console, Math, JSON, String, Number, Object, Array, Boolean };
    vm.createContext(ctx);
    const desde = mutado.indexOf('function clasificarFaltante_');
    vm.runInContext(mutado.slice(desde, mutado.indexOf('\n}', desde) + 2), ctx);
    ctx.__decl = {
      alcance: { 'L-046': 'en_alcance', 'L-048': 'fuera_de_alcance' },
      tokens_equipo: {}
    };
    const clase = (token, laminas) => {
      ctx.__f = { token, laminas };
      return vm.runInContext('clasificarFaltante_(__f, __decl)', ctx);
    };
    af(caso.probar(clase), 'roto: ' + caso.nombre);
  });
}

/* ════════════════════════════════════════════════════════════════════════════════════════
 * 5 · Las columnas están en el esquema Y en el delta
 * ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · `alcance` y `tokens_equipo` entran por `COLUMNAS_DELTA_`, no recreando LAMINAS');
{
  const instalar = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
  const delta = instalar.slice(instalar.indexOf('var COLUMNAS_DELTA_'), instalar.indexOf('function aplicarInstalacion_'));

  af(delta.indexOf("{ nombre: 'alcance', indice: 13 }") !== -1,
    '`alcance` está en `COLUMNAS_DELTA_.LAMINAS`');
  af(delta.indexOf("{ nombre: 'tokens_equipo', indice: 14 }") !== -1,
    'y `tokens_equipo` también');

  /* ⛔ Recrear `LAMINAS` borraría el sellado, que es irreproducible sin volver a tocar las notas de
   * las plantillas. Que estén en el delta es lo que lo impide. */
  const esquema = instalar.slice(instalar.indexOf('  LAMINAS: {'), instalar.indexOf('};', instalar.indexOf('  LAMINAS: {')));
  af(esquema.indexOf('alcance') !== -1 && esquema.indexOf('tokens_equipo') !== -1,
    'y las dos están también en el esquema — si no, una hoja nueva nacería sin ellas');

  /* ⚠ El array literal de `sellarPlantilla` sigue teniendo 13 posiciones. Con las columnas AL FINAL
   * eso es seguro —las celdas nacen vacías, que es «sin declarar»—; metidas en el medio correría
   * todo lo de la derecha una posición en silencio. La afirmación fija que sigan al final. */
  const sellador = fs.readFileSync(path.join(RAIZ, 'Sellador.gs'), 'utf8');
  const push = sellador.indexOf("nuevas.push([id, informeId, ''");
  if (push === -1) {
    avisos.push('⚠ no se encontró el `nuevas.push` de `sellarPlantilla`: la afirmación del ancho NO corrió.');
  } else {
    const linea = sellador.slice(push, sellador.indexOf(');', push));
    const posiciones = (linea.match(/,/g) || []).length + 1;
    /* 13 son exactamente los headers ORIGINALES: el array no llega a la columna 14 (`alcance`) ni a
     * la 15 (`tokens_equipo`), así que las filas nuevas nacen con las dos vacías — «sin declarar»,
     * que es lo correcto. Si algún día alguien lo alarga, esto se pone rojo **antes** de que el
     * sellador escriba una clasificación que nadie decidió. */
    af(posiciones <= 13,
      'el array posicional de `sellarPlantilla` NO llega a las columnas nuevas — nacen vacías',
      'tiene ' + posiciones + ' posiciones y `alcance` es la 14');
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════ */
console.log('');
if (avisos.length) {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.\n');
  console.log('⚠ Avisos — el verde de arriba NO los cubre:');
  avisos.forEach(a => console.log('   · ' + a));
} else {
  console.log(mal ? '❌ ' + mal + ' afirmación(es) fallaron.' : '✅ Todas las afirmaciones pasaron.');
  console.log('   ' + ok + ' de ' + (ok + mal) + ' verificadas.');
}

console.log('\n⚠ Lo que este control NO contesta:');
console.log('   · Que `declararAlcanceDeLaminas()` escriba bien: necesita la planilla viva. Lo que');
console.log('     sí está fijado es QUÉ va a escribir, cruzado contra el censo del 22/08.');
console.log('   · Que el conteo del panel baje. Eso lo dice una corrida, no esta escritura: el');
console.log('     descuento se aplica sobre FALTANTES, y FALTANTES lo llena una corrida.');
console.log('   · Si el alcance declarado es el CORRECTO. Sale de `D-39` y del tablero; que esas');
console.log('     decisiones sigan vigentes es del usuario, no de un banco.');

process.exit(mal ? 1 : 0);
