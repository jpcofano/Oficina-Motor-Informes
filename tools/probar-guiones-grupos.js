#!/usr/bin/env node
/**
 * tools/probar-guiones-grupos.js — **la constante `CASOS_POR_MARCADOR_` y la separación en tres
 * grupos.** Parte C del `2026-09-06_3`.
 *
 * ⛔⛔ **Lo que este banco protege:** que un marcador con caso **`contradice`**, **`abierto`** o
 * **`cerrado`** NO caiga en el grupo (a). Sólo **`exacto`** habilita a levantar la marca, y meter
 * cualquiera de los otros ahí **publicaría sin aviso un número que nadie validó** — que es el modo
 * de falla más caro del repo.
 *
 * ⚠ **Lo que NO puede probar, y se dice:** el diagnóstico lee `MARCADORES` **vivo**, que no está en
 * disco. Acá se verifica **la constante y el criterio de clasificación**, no el resultado.
 *
 * Uso:  node tools/probar-guiones-grupos.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const RAIZ = path.join(__dirname, '..');
const CSV = require('./lib-csv');

let fallas = 0, afirmaciones = 0;
function afirmar(condicion, mensaje) {
  afirmaciones++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ⛔ ' + mensaje); }
}

const AUD = fs.readFileSync(path.join(RAIZ, 'Auditoria.gs'), 'utf8');

console.log('═══ A · la constante está en `Auditoria.gs` y declara su fecha ═══');
let CASOS = null, GENERADA = null, ARCHIVOS = null;
{
  const mF = AUD.match(/var CASOS_POR_MARCADOR_GENERADA_ = '([\d-]+)';/);
  const mA = AUD.match(/var CASOS_POR_MARCADOR_ARCHIVOS_ = (\d+);/);
  const i = AUD.indexOf('var CASOS_POR_MARCADOR_ = {');
  afirmar(!!mF, 'declara `CASOS_POR_MARCADOR_GENERADA_`' + (mF ? ' = ' + mF[1] : ''));
  afirmar(!!mA, 'declara de cuántos CSV salió' + (mA ? ' = ' + mA[1] : ''));
  afirmar(i !== -1, 'existe `CASOS_POR_MARCADOR_`');
  if (!mF || !mA || i === -1) { console.log('⛔ sin la constante no se puede seguir'); process.exit(1); }
  GENERADA = mF[1]; ARCHIVOS = Number(mA[1]);
  const cuerpo = AUD.slice(i, AUD.indexOf('\n};', i) + 3);
  CASOS = {};
  cuerpo.split(/\r?\n/).forEach(l => {
    const m = l.match(/'([a-z0-9_]+)': \{ estado: '([a-z_]*)', caso: '([A-Z]+-\d+)'.*previos: \[([^\]]*)\]/);
    if (m) CASOS[m[1]] = { estado: m[2], caso: m[3],
      previos: m[4] ? m[4].split(',').map(x => x.replace(/'/g, '').trim()) : [] };
  });
  afirmar(Object.keys(CASOS).length > 100,
    'se parsearon ' + Object.keys(CASOS).length + ' marcadores de la constante');
}

console.log('\n═══ B · ⭐⭐ la constante COINCIDE con los CSV de hoy ═══');
{
  /* ⛔ Es la afirmación que vuelve auditable a una lista congelada: si alguien agrega un CSV y no
   * regenera, esto se pone rojo **diciendo la verdad** — la constante quedó vieja. */
  const dir = fs.readdirSync(path.join(RAIZ, 'docs'))
    .filter(f => /^casos_validacion_.*\.csv$/.test(f));
  afirmar(dir.length === ARCHIVOS,
    '⭐⭐ la constante dice ' + ARCHIVOS + ' CSV y en disco hay ' + dir.length +
    (dir.length === ARCHIVOS ? '' : ' ⇒ **REGENERAR**: node tools/generar-casos-por-marcador.js'));

  /* ⭐ Y el contenido: se regenera y se compara, en vez de confiar en el conteo. */
  const salida = execFileSync(process.execPath,
    [path.join(__dirname, 'generar-casos-por-marcador.js')], { encoding: 'utf8' });
  const frescos = {};
  salida.split(/\r?\n/).forEach(l => {
    const m = l.match(/'([a-z0-9_]+)': \{ estado: '([a-z_]*)', caso: '([A-Z]+-\d+)'.*previos: \[([^\]]*)\]/);
    if (m) frescos[m[1]] = { estado: m[2], caso: m[3],
      previos: m[4] ? m[4].split(',').map(x => x.replace(/'/g, '').trim()) : [] };
  });
  const difieren = Object.keys(frescos).filter(n =>
    !CASOS[n] || CASOS[n].estado !== frescos[n].estado || CASOS[n].caso !== frescos[n].caso ||
    CASOS[n].previos.join('|') !== frescos[n].previos.join('|'));
  const sobran = Object.keys(CASOS).filter(n => !frescos[n]);
  afirmar(difieren.length === 0 && sobran.length === 0,
    '⭐⭐ la constante es IDÉNTICA a lo que sale de los CSV hoy' +
    (difieren.length ? ' — ⛔ difieren ' + difieren.length + ': ' + difieren.slice(0, 5).join(', ') : '') +
    (sobran.length ? ' — ⛔ sobran ' + sobran.length : ''));
}

console.log('\n═══ C · ⛔⛔ SÓLO `exacto` habilita — los otros tres estados NO ═══');
{
  /* ⭐ El criterio se extrae del código REAL, no se copia: si alguien agregara `cerrado` a la
   * rama de (a), esta afirmación tiene que caer. */
  const i = AUD.indexOf('function diagGuionesPorLamina');
  const cuerpo = AUD.slice(i, AUD.indexOf('\n}', i));
  afirmar(/if \(caso\.estado === 'exacto'\) a\.push/.test(cuerpo),
    "⭐⭐ el grupo (a) se arma con `estado === 'exacto'` y nada más");
  afirmar(/else if \(caso\.estado === 'contradice'\) b\.push/.test(cuerpo),
    "`contradice` va al grupo (b), que NO se toca");
  afirmar(!/a\.push[\s\S]{0,80}'cerrado'/.test(cuerpo) && !/'abierto'[\s\S]{0,40}a\.push/.test(cuerpo),
    '⛔ ni `cerrado` ni `abierto` caen en (a) — no afirman que el número coincida');
  afirmar(/otros\.push/.test(cuerpo), '⭐ y tienen su propio grupo, en vez de caer en (c) en silencio');
}

console.log('\n═══ D · ⭐ `camp_titulo` NO puede estar en (a) ═══');
{
  /* ⛔⛔ Es el guion que más se ve en el deck y el que NO se levanta: el ítem 9 sigue abierto. */
  const c = CASOS['camp_titulo'];
  afirmar(!c || c.estado !== 'exacto',
    '⛔⛔ `camp_titulo` ' + (c ? 'tiene caso ' + c.caso + ' (' + c.estado + ')' : 'NO tiene caso') +
    ' ⇒ no puede caer en (a). **Levantarlo declararía validado lo que está en investigación.**');
  afirmar(AUD.indexOf("x.n === 'camp_titulo'") !== -1,
    '⭐ y el diagnóstico lo nombra explícitamente en el log, para que nadie lo pida');
}

console.log('\n═══ E · ⛔⛔ levantar son DOS escrituras, no una ═══');
{
  const i = AUD.indexOf('function guionesValidados_');
  const cuerpo = AUD.slice(i, AUD.indexOf('\n}\n', i));
  afirmar(/SIN VALIDAR/.test(cuerpo),
    '⭐⭐ toca `notas` además de `formato` — `revisarASinValidar_` repondría la marca si no');
  afirmar(/getRange\(p\.fila, iFmt \+ 1\)/.test(cuerpo) && /getRange\(p\.fila, iNot \+ 1\)/.test(cuerpo),
    'escribe las dos columnas');
  afirmar(/GATE `D-58`|gate D-58/.test(cuerpo), '⭐ tiene el gate de `D-58` antes de escribir');
  afirmar(/motivo: 'lista vacía'/.test(cuerpo) && /motivo: 'nada que hacer'/.test(cuerpo),
    '⭐⭐ una corrida que no haría nada ABORTA — no informa cero');
  afirmar(/releido/.test(cuerpo) && /RELECTURA/.test(cuerpo),
    '⭐ relee la HOJA para verificar lo que quedó, no lo que pidió escribir');
  afirmar(/respaldo/.test(cuerpo), 'deja backup antes de escribir');
}

console.log('\n═══ F · ⛔ la lista nace VACÍA y el modo seco es el default ═══');
{
  /* ⭐⭐ `2026-09-06_4` — **esta afirmación se DIO VUELTA, y con el motivo escrito.**
   * Decía *«`GUIONES_A_LEVANTAR_` está vacía»*, y se puso roja **diciendo la verdad**: el
   * `2026-09-06_4` pidió llenarla. ⛔ **Aflojarla habría sido perder el control**; lo que
   * corresponde es darla vuelta y **subirle la exigencia** —`CLAUDE.md` §4, *«un banco que se pone
   * rojo cuando el estado cambia está haciendo su trabajo»*—.
   *
   * ⇒ La protección que la lista vacía daba —**que nada se escriba por accidente**— ahora la dan
   * tres cosas distintas, y las tres se afirman: la lista es **literal y congelada** (no calculada
   * al correr), **declara su fecha**, y el default sigue siendo **modo seco**. */
  afirmar(!/var GUIONES_A_LEVANTAR_ = \[\];/.test(AUD),
    '⭐⭐ la lista YA NO está vacía — el `_4` la llenó, y esta afirmación se dio vuelta a propósito');
  const decl = AUD.match(/var GUIONES_A_LEVANTAR_ = \[([\s\S]*?)\];/);
  afirmar(decl && !/\bfilter\b|\bmap\b|\bconcat\b|Object\.keys/.test(decl[1]),
    '⛔⛔ y sigue siendo LITERAL, no un filtro que se recalcule al correr — una lista se audita');
  afirmar(/var GUIONES_A_LEVANTAR_FECHA_ = '\d{4}-\d{2}-\d{2}';/.test(AUD),
    '⭐ y declara su FECHA ⇒ el gate de `D-58` puede saber si venció');
  afirmar(/function confirmarGuionesValidados\(\) \{ return guionesValidados_\(false\); \}/.test(AUD),
    '⭐ `confirmar…()` es MODO SECO; escribir es otro botón (`aplicar…()`)');
  /* ⚠ Las dos públicas, sin `_` y SIN PARÁMETROS, o no aparecen en el desplegable del editor. */
  ['diagGuionesPorLamina', 'confirmarGuionesValidados', 'aplicarGuionesValidados'].forEach(f => {
    afirmar(AUD.indexOf('function ' + f + '()') !== -1,
      '⭐ `' + f + '()` es pública y sin parámetros — se puede correr desde el editor');
  });
}

console.log('\n═══ G · ⛔⛔ LA MITAD INSEGURA DE `D-58` — se lista y se PARA ═══');
{
  /* ⛔⛔ `D-58` declara una **pregunta abierta** y manda aplicar sólo la mitad segura: el más nuevo
   * gana **cuando AGREGA** la marca; los casos donde la **sacaría** *«se listan y se paran»*.
   * ⇒ `guionesValidados_` **saca** la marca, así que sin este gate aplicaría la mitad prohibida. */
  const cruzan = Object.keys(CASOS).filter(n =>
    CASOS[n].estado === 'exacto' && CASOS[n].previos.indexOf('contradice') !== -1);
  console.log('  marcadores que cruzaron `contradice` → `exacto`: ' + cruzan.length +
    (cruzan.length ? ' — ' + cruzan.join(', ') : ''));
  afirmar(cruzan.length > 0,
    '⭐⭐ CONTROL POSITIVO: el historial detecta al menos uno — si diera 0, `previos` no sirve');
  afirmar(AUD.indexOf("var INSEGUROS_ = ['contradice'];") !== -1,
    '⭐ el gate existe en `guionesValidados_`');
  const i = AUD.indexOf('function guionesValidados_');
  const cuerpo = AUD.slice(i, AUD.indexOf('\n}\n', i));
  afirmar(/motivo: 'gate D-58 mitad insegura'/.test(cuerpo),
    '⛔⛔ y PARA con motivo propio — no los saltea en silencio');
  afirmar(/cruzan\.length[\s\S]{0,900}return \{ ok: false/.test(cuerpo),
    '⭐ el `return` está DENTRO de la rama que los encontró');
  /* ⚠ La mitad negativa: un marcador sin `contradice` previo NO puede caer en el gate. */
  const limpios = Object.keys(CASOS).filter(n =>
    CASOS[n].estado === 'exacto' && CASOS[n].previos.indexOf('contradice') === -1);
  afirmar(limpios.length > 0,
    '⭐ y hay ' + limpios.length + ' `exacto` SIN `contradice` previo — el gate no bloquea todo');
}

console.log('\n═══ H · ⭐⭐ LA LISTA REAL — SIETE NOMBRES, NO «siete» ═══');
{
  /* ⛔⛔ Se afirma sobre los NOMBRES y no sobre la cantidad. Un banco que dijera `length === 7`
   * pasaría con siete nombres equivocados — que es el defecto que costó la semana: **un conteo que
   * coincide sobre las filas equivocadas.** */
  const m = AUD.match(/var GUIONES_A_LEVANTAR_ = \[([\s\S]*?)\];/);
  afirmar(!!m, 'existe `GUIONES_A_LEVANTAR_`');
  const lista = m ? (m[1].match(/'([a-z0-9_]+)'/g) || []).map(x => x.replace(/'/g, '')) : [];
  const ESPERADOS = ['camp_enviados', 'camp_or', 'camp_mail_clics', 'camp_ctor',
                     'emin_or', 'emin_ctor', 'emin_ctr'];
  afirmar(lista.join('|') === ESPERADOS.join('|'),
    '⭐⭐ la lista es EXACTAMENTE los ' + ESPERADOS.length + ' esperados  (dio: ' + lista.join(', ') + ')');

  /* ⛔⛔ Los tres frenados, por nombre y con motivo: **omitirlos en silencio sería indistinguible
   * de olvidarlos.** */
  const frenados = AUD.slice(AUD.indexOf('var GUIONES_FRENADOS_'));
  ['imp_prog', 'emin_lista', 'emin_encuentros'].forEach(n => {
    afirmar(lista.indexOf(n) === -1, '⛔ `' + n + '` NO está en la lista');
    afirmar(new RegExp("'" + n + "':").test(frenados),
      '⭐ y está DECLARADO en `GUIONES_FRENADOS_` con su motivo');
  });

  /* ⭐ Y los frenados lo son por lo que el gate mide, no por gusto. */
  afirmar(CASOS['imp_prog'] && CASOS['imp_prog'].previos.indexOf('contradice') !== -1,
    '⭐ `imp_prog` cruza la mitad insegura — el motivo declarado es el medido');
  ['emin_lista', 'emin_encuentros'].forEach(n => {
    afirmar(CASOS[n] && CASOS[n].estado === 'contradice',
      '⭐ `' + n + '` tiene caso vigente `contradice` (' + (CASOS[n] || {}).caso +
      ') ⇒ el gate 1 lo rechazaría');
  });
  /* ⚠ La mitad negativa: los siete de la lista NO pueden estar frenados. */
  afirmar(ESPERADOS.every(n => CASOS[n] && CASOS[n].estado === 'exacto' && !CASOS[n].previos.length),
    '⭐⭐ los siete son `exacto` con `previos: []` — pasan los dos primeros gates');
}

console.log('\n═══ I · ⛔⛔ EL GATE 3 — aborta SIN ESCRIBIR NADA ═══');
{
  const i = AUD.indexOf('function guionesValidados_');
  const cuerpo = AUD.slice(i, AUD.indexOf('\n}\n', i));
  afirmar(/universoAgendaOk_\(\)/.test(cuerpo), 'el gate 3 llama a `universoAgendaOk_()`');
  afirmar(/motivo: 'gate 3 universo'/.test(cuerpo), '⛔ y ABORTA con motivo propio');
  /* ⛔⛔ Lo que importa: el `return` del gate 3 tiene que estar ANTES de cualquier `setValue`, o
   * la operación a medias es posible — y dejaría la hoja en un estado que nadie midió. */
  const iG3 = cuerpo.indexOf("motivo: 'gate 3 universo'");
  const iEsc = cuerpo.indexOf('setValue');
  afirmar(iG3 !== -1 && iEsc !== -1 && iG3 < iEsc,
    '⭐⭐ el abort está ANTES del primer `setValue` ⇒ no escribe **ni los `camp_*`**');
  afirmar(/tocaMinistros/.test(cuerpo),
    '⭐ y sólo corre si la lista toca `emin_*` — no cobra el costo cuando no aplica');

  const j = AUD.indexOf('function universoAgendaOk_');
  const g = AUD.slice(j, AUD.indexOf('\n}\n', j));
  afirmar(/diagCorteAgenda\(\)/.test(g), '⭐ reusa `diagCorteAgenda()`, no reimplementa el recorte');
  afirmar(/sabor/i.test(g) && /quir/i.test(g), '⛔⛔ compara por NOMBRE: Sabor y Quirós');
  afirmar(/control positivo del gate/.test(g),
    '⭐⭐ y tiene control positivo propio: si no ve a NINGUNO de los dos, aborta');
  afirmar(/es la ventana/.test(g),
    '⭐ distingue los dos veredictos: corte sin aplicar vs. problema de VENTANA');
  afirmar(!/\.length === 7|\.length === 6/.test(g),
    '⛔ y NO decide por cantidad — 6 por `D` contra 7 por `E`, el conteo no sirve');
}

console.log('');
console.log('⚠ Lo que este verde NO dice: qué grupos salen sobre la hoja viva. `MARCADORES` no está');
console.log('  en disco. Prueba la constante y el CRITERIO, no el resultado.');
if (fallas) { console.log('⛔ ' + fallas + ' afirmación(es) FALLARON'); process.exit(1); }
console.log('✅ Las ' + afirmaciones + ' afirmaciones pasaron');
