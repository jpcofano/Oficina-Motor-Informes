#!/usr/bin/env node
/**
 * tools/probar-generador-periodos.js — **el generador de `PERIODOS` es INSERT-ONLY**
 * (`docs/Prompts/2026-08-26_2_corrida_nocturna_front.md`, Parte F).
 *
 * ⭐⭐ **El banco que importa es el de la hoja a MEDIO llenar, no el de la hoja vacía.** Generar
 * sobre una hoja vacía prueba que sabe escribir; lo único que puede romper de verdad es **tocar
 * una fila que ya estaba** — y está medido que `upsertPorClave_` **pisa sin preguntar**:
 * `agosto_14_20` con otras fechas devolvió `{escritas: 0, actualizadas: 1}`, reescrita en silencio.
 *
 * ⛔ **Por qué eso es caro acá y no en cualquier hoja:** un `periodo_id` es una **clave
 * referenciada**. `julio_24_30` aparece en 119 líneas del repo; moverle las fechas cambia el
 * universo de todo lo que lo cita **sin que nada falle**.
 *
 * ⚠ **Y la comprobación de existencia va contra las FILAS CRUDAS.** `leerPeriodos()` es
 * `leerRegistro_`, que **colapsa las repetidas**: hoy ve 8 donde la hoja tiene 9. Preguntarle
 * «¿existe?» a un mapa por clave es preguntarle a quien ya perdió el dato que hace falta.
 *
 * Uso:
 *   node tools/probar-generador-periodos.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
let hechas = 0;
function afirmar(condicion, mensaje) {
  hechas++;
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

const HEADERS = ['periodo_id', 'desde', 'hasta', 'notas'];

/** Una hoja `PERIODOS` en memoria, con las filas que se le pasen. */
function hojaPeriodos(filasIniciales) {
  const filas = [HEADERS.slice()].concat(filasIniciales.map((f) => f.slice()));
  return {
    __filas: filas,
    getName: () => 'PERIODOS',
    getLastRow: () => filas.length,
    getLastColumn: () => HEADERS.length,
    getDataRange: () => ({ getValues: () => filas.map((f) => f.slice()) }),
    getRange: (fila, col, nFilas, nCols) => ({
      setValues: (m) => {
        m.forEach((f, i) => {
          const n = fila - 1 + i;
          while (filas.length <= n) filas.push([]);
          f.forEach((v, k) => { filas[n][col - 1 + k] = v; });
        });
      },
      getValues: () => {
        const out = [];
        for (let i = 0; i < (nFilas || 1); i++) {
          const o = filas[fila - 1 + i] || [];
          const l = [];
          for (let k = 0; k < (nCols || HEADERS.length); k++) l.push(o[col - 1 + k] !== undefined ? o[col - 1 + k] : '');
          out.push(l);
        }
        return out;
      }
    })
  };
}

/**
 * Carga `Instalar.gs` REAL con la hoja falseada.
 *
 * ⭐ **`semanaR11_` se extrae de `Fuentes.gs`, no se stubea:** el corte viernes–jueves es lo que el
 * generador tiene que reusar, y un stub probaría que el banco sabe contar días. Si `semanaR11_`
 * cambiara, esto se entera.
 */
function contexto(filasIniciales, parchear) {
  const hoja = hojaPeriodos(filasIniciales);
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    parseInt, parseFloat,
    Logger: { log: () => {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheetByName: (n) => (n === 'PERIODOS' ? hoja : null) }),
      flush: () => {}
    },
    /* Plataforma, falseada con la forma real: `yyyy-MM-dd` sobre la fecha local. */
    Utilities: {
      formatDate: (f) => {
        const dd = (n) => (n < 10 ? '0' : '') + n;
        return f.getFullYear() + '-' + dd(f.getMonth() + 1) + '-' + dd(f.getDate());
      }
    },
    Session: { getScriptTimeZone: () => 'America/Argentina/Buenos_Aires' },
    /* De `Fuentes.gs`, y son las dos que el generador usa para leer de vuelta lo que escribió. */
    parsearFechaCelda_: (v) => {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ''));
      return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
    },
    formatearFecha_: (f) => {
      const dd = (n) => (n < 10 ? '0' : '') + n;
      return dd(f.getDate()) + '/' + dd(f.getMonth() + 1) + '/' + f.getFullYear();
    }
  };
  vm.createContext(ctx);

  /* `semanaR11_` REAL, extraída de `Fuentes.gs`. */
  const fuentes = fs.readFileSync(path.join(RAIZ, 'Fuentes.gs'), 'utf8');
  const m = fuentes.match(/function semanaR11_\([\s\S]*?\r?\n\}/);
  if (!m) throw new Error('No se pudo extraer `semanaR11_` de Fuentes.gs — sin ella este banco ' +
    'mediría un corte propio, que es justo lo que el generador no tiene que tener.');
  vm.runInContext(m[0], ctx, { filename: 'Fuentes.gs#semanaR11_' });

  let texto = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    /* ⛔ La guarda del 24/08: si el parche no aplicó, no hay «después». */
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'Instalar.gs' });

  ctx.__hoja = hoja;
  return ctx;
}

function generar(ctx, fecha, cuantas) {
  ctx.__f = fecha;
  ctx.__n = cuantas;
  return vm.runInContext('generarPeriodosSemanales_(__f, __n)', ctx);
}

console.log('El generador de PERÍODOS — Instalar.gs y semanaR11_ cargados de verdad\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · La convención del nombre, incluido el caso que cruza mes
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · ⭐ `<AAAA>_<mes_del_INICIO>_<dd_inicio>_<dd_fin>`');
{
  const ctx = contexto([]);
  const id = (a, m, d1, d2) => vm.runInContext(
    'periodoIdDeVentana_(new Date(' + a + ',' + m + ',' + d1 + '), new Date(' + a + ',' + m + ',' + d2 + '))', ctx);

  afirmar(id(2026, 7, 14, 20) === '2026_agosto_14_20', 'una semana dentro del mes: 2026_agosto_14_20');

  /* ⭐ El caso del prompt, y el que un generador ingenuo escribe al revés. */
  ctx.__d = new Date(2026, 7, 28);
  ctx.__h = new Date(2026, 8, 3);
  afirmar(vm.runInContext('periodoIdDeVentana_(__d, __h)', ctx) === '2026_agosto_28_03',
    '⭐ y una que CRUZA mes toma el mes del INICIO, con `dd_fin` menor: 2026_agosto_28_03');

  ctx.__d = new Date(2026, 11, 25);
  ctx.__h = new Date(2027, 0, 0 + 31);
  afirmar(/^2026_diciembre_25_/.test(vm.runInContext('periodoIdDeVentana_(__d, __h)', ctx)),
    'y una que cruza AÑO también toma el del inicio — sin el año adelante colisionarían');

  afirmar(id(2026, 8, 4, 10) === '2026_septiembre_04_10',
    '⚠ los días llevan cero a la izquierda (`04`) — `C-83`: un `4/10` pelado sería una FECHA');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 2 · Sobre la hoja vacía — el caso fácil, que es el control positivo
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n2 · sobre una hoja vacía');
{
  const ctx = contexto([]);
  const r = generar(ctx, new Date(2026, 7, 26), 4);

  afirmar(r.ok === true, 'devuelve `ok`' + (r.ok ? '' : ' — ' + r.motivo));
  afirmar(r.creadas.length === 4, 'crea las 4 pedidas');
  afirmar(r.filas_antes === 0 && r.filas_despues === 4,
    '⭐ y lo dice con filas ANTES y DESPUÉS: ' + r.filas_antes + ' → ' + r.filas_despues);

  /* ⭐ Las cuatro son consecutivas de siete días, calculadas con `semanaR11_` y no acá. */
  afirmar(r.creadas[0].desde === '21/08/2026' && r.creadas[0].hasta === '27/08/2026',
    'la primera es la semana que CONTIENE al 26/08: 21/08 → 27/08');
  afirmar(r.creadas[3].desde === '11/09/2026',
    'y la cuarta arranca tres semanas después: ' + r.creadas[3].desde);
  afirmar(r.creadas.map((c) => c.id).join(' ') ===
    '2026_agosto_21_27 2026_agosto_28_03 2026_septiembre_04_10 2026_septiembre_11_17',
    '⭐ con la convención aplicada, cruce de mes incluido');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · ⭐⭐ EL QUE IMPORTA — la hoja a medio llenar
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · ⭐⭐ sobre una hoja que YA tiene la mitad — no toca lo que está');
{
  /* Las dos primeras ya están, y **con fechas distintas de las que el generador calcularía**:
   * si las pisara, se vería. Es la forma del caso medido con `agosto_14_20`. */
  const ctx = contexto([
    ['2026_agosto_21_27', '1999-01-01', '1999-01-07', 'NO ME TOQUES'],
    ['2026_agosto_28_03', '1999-02-02', '1999-02-08', 'NI A MÍ']
  ]);
  const r = generar(ctx, new Date(2026, 7, 26), 4);

  afirmar(r.ok === true, 'devuelve `ok`' + (r.ok ? '' : ' — ' + r.motivo));
  afirmar(r.creadas.length === 2, 'crea SÓLO las 2 que faltaban');
  afirmar(r.ya_estaban.length === 2, 'y declara las 2 que ya estaban');
  afirmar(r.filas_antes === 2 && r.filas_despues === 4,
    'filas ' + r.filas_antes + ' → ' + r.filas_despues + ', no 2 → 6');

  /* ⛔⛔ **La afirmación que decide.** Las dos viejas conservan sus fechas absurdas y su nota. */
  const filas = ctx.__hoja.__filas;
  const vieja1 = filas.find((f) => f[0] === '2026_agosto_21_27');
  const vieja2 = filas.find((f) => f[0] === '2026_agosto_28_03');
  afirmar(vieja1[1] === '1999-01-01' && vieja1[2] === '1999-01-07' && vieja1[3] === 'NO ME TOQUES',
    '⛔⛔ la fila que ya estaba conserva sus fechas Y su nota — `upsertPorClave_` las habría pisado');
  afirmar(vieja2[1] === '1999-02-02' && vieja2[3] === 'NI A MÍ',
    '⛔ y la segunda también, con nota y todo');

  afirmar(filas.filter((f) => f[0] === '2026_agosto_21_27').length === 1,
    '⚠ y no se agregó una fila DUPLICADA al lado: insert-only no es append-siempre');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · Idempotencia y claves repetidas
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · correr dos veces, y la hoja con una clave repetida');
{
  const ctx = contexto([]);
  const primera = generar(ctx, new Date(2026, 7, 26), 3);
  const segunda = generar(ctx, new Date(2026, 7, 26), 3);

  afirmar(primera.creadas.length === 3 && segunda.creadas.length === 0,
    'la segunda corrida no crea nada: 3 y después 0');
  /* ⭐ «Ya estaban todas» es idempotencia, no rotura — pero se DICE, no se colapsa con el éxito. */
  afirmar(segunda.ok === true && segunda.idempotente === true,
    '⭐ y lo declara con `idempotente: true` — «no hice nada» y «hice todo» no se ven igual');
  afirmar(ctx.__hoja.__filas.length === 4, 'y la hoja sigue con 3 filas de datos, no 6');
}
{
  /* ⛔ El caso real de la hoja viva: `julio_24_30` está DUPLICADA. */
  const ctx = contexto([
    ['julio_24_30', '2026-07-24', '2026-07-30', 'la original'],
    ['julio_24_30', '2026-07-24', '2026-07-30', 'la duplicada']
  ]);
  const r = generar(ctx, new Date(2026, 7, 26), 1);

  afirmar(r.claves_repetidas.indexOf('julio_24_30') !== -1,
    '⛔ la clave repetida de la hoja se REPORTA, aunque no sea de esta tanda');
  afirmar(r.ok === true && r.creadas.length === 1,
    'y no bloquea la generación: el escritor informa la inconsistencia, no la arregla');
  afirmar(ctx.__hoja.__filas.filter((f) => f[0] === 'julio_24_30').length === 2,
    '⚠ y NO la deduplica — dos filas referenciadas en 119 líneas no se tocan por decisión del usuario');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 5 · ⚠ Romper a propósito
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n5 · ⚠ los controles negativos');
{
  /* 5.1 · Si la existencia se preguntara con `upsertPorClave_`, las viejas se pisarían. Se simula
   * anulando la guarda de «ya estaba» y verificando que el banco 3 lo cazaría. */
  const ctx = contexto([
    ['2026_agosto_21_27', '1999-01-01', '1999-01-07', 'NO ME TOQUES']
  ], (t) => t.replace('    if (crudas.porClave[p.id]) {', '    if (false) {   // ROTO A PROPOSITO'));
  const r = generar(ctx, new Date(2026, 7, 26), 1);
  const filas = ctx.__hoja.__filas.filter((f) => f[0] === '2026_agosto_21_27');

  afirmar(filas.length === 2,
    '⭐ sin la guarda, la clave se DUPLICA — el aserto 3.5 cae, y por el motivo correcto');
  /* ⚠ Y la relectura lo caza: `filasCrudasDePeriodos_` encuentra dos filas con la misma clave. */
  afirmar(r.ok === false && /quedó en 2 fila/.test(r.motivo || ''),
    '⭐⭐ y la RELECTURA lo detecta sola: `ok: false` con «quedó en 2 fila(s)» — el escritor que ' +
    'no relee es la mitad del bug');
}
{
  /* 5.2 · ⭐ Y el que fija que la comprobación NO se haga contra un mapa por clave. */
  const instalar = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
  const bloque = instalar.slice(instalar.indexOf('function generarPeriodosSemanales_'),
    instalar.indexOf('function generarProximasSemanas'));
  afirmar(bloque.indexOf('leerPeriodos()') === -1,
    '⛔ el generador NO usa `leerPeriodos()` — colapsa las repetidas y ve 8 donde hay 9 filas');
  afirmar(bloque.indexOf('upsertPorClave_') === -1,
    '⛔ ni `upsertPorClave_` — está medido que pisa sin preguntar');
  afirmar(bloque.indexOf('semanaR11_') !== -1,
    '⭐ y SÍ usa `semanaR11_`: el corte viernes-jueves vive en un solo lugar');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 6 · El período PERSONALIZADO — valida y NO corrige
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n6 · el período personalizado');
{
  const ctx = contexto([]);
  ctx.leerConfig = () => ({ tope_dias_ventana_cuenta: '30' });
  const custom = (d, h) => {
    ctx.__d = d; ctx.__h = h;
    return vm.runInContext('crearPeriodoPersonalizado_(__d, __h)', ctx);
  };

  const bueno = custom('2026-09-01', '2026-09-07');
  afirmar(bueno.ok === true && bueno.creadas.length === 1,
    'un rango válido se crea' + (bueno.ok ? '' : ' — ' + bueno.motivo));
  afirmar(bueno.creadas[0].id === '2026_septiembre_01_07',
    '⭐ con el `periodo_id` DERIVADO, no pedido — nadie escribe la clave a mano');

  /* ⛔ Un rango invertido **no falla en ningún lado**: publica una ventana vacía, que se lee como
   * «no hubo datos esa semana». Es el número plausible en su forma más barata. */
  const invertido = custom('2026-09-07', '2026-09-01');
  afirmar(invertido.ok === false && /posterior al/.test(invertido.motivo || ''),
    '⛔ un rango INVERTIDO se rechaza con el motivo — no falla solo: publica una ventana vacía');
  afirmar(ctx.__hoja.__filas.length === 2,
    '⚠ y no escribió nada: la hoja sigue con la fila del caso bueno');

  const ilegible = custom('no es una fecha', '2026-09-07');
  afirmar(ilegible.ok === false && /no pude leer las fechas/.test(ilegible.motivo || ''),
    'una fecha ilegible se rechaza nombrando las dos');

  /* ⭐ El tope de `R-30` **avisa y no bloquea**: es una decisión editorial y la toma la persona. */
  const largo = custom('2026-09-01', '2026-11-30');
  afirmar(largo.ok === true, '⭐ un período más largo que el tope de R-30 SÍ se crea — avisa, no bloquea');
  afirmar((largo.avisos || []).some((a) => /R-30/.test(a) && /91 días/.test(a)),
    'y el aviso dice los días y nombra a `R-30` — ' + (largo.avisos || []).length + ' aviso(s)');
  afirmar((largo.avisos || []).some((a) => /No es una semana de 7 días/.test(a)),
    '⚠ y avisa que no son 7 días, que es válido (R-11 Add 1 punto 3) pero conviene ver');

  /* ⚠ Con el tope en `0` ese aviso no sale — `0` desactiva, igual que en la regla. */
  ctx.leerConfig = () => ({ tope_dias_ventana_cuenta: '0' });
  const sinTope = custom('2026-12-01', '2027-02-28');
  afirmar(!(sinTope.avisos || []).some((a) => /R-30/.test(a)),
    '⚠ y con el tope en `0` ese aviso NO sale: `0` desactiva, como en la regla');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 7 · ⭐⭐ UN SOLO escritor, y el cableado del panel
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n7 · ⭐⭐ un solo escritor, y el panel cableado');
{
  const instalar = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
  const backend = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  const html = fs.readFileSync(path.join(RAIZ, 'Panel.html'), 'utf8');

  /* ⭐⭐ **Dos caminos de escritura sobre la misma hoja es la figura que la Parte C de esta misma
   * corrida vino a cerrar.** Mientras haya dos, el día que uno gane una guarda el otro se queda
   * sin ella — y no falla, publica. Los dos botones tienen que pasar por `crearPeriodos_`. */
  const bloqueF = instalar.slice(instalar.indexOf('function crearPeriodos_'),
    instalar.indexOf('function generarProximasSemanas'));
  const escrituras = (bloqueF.match(/setValues/g) || []).length;
  afirmar(escrituras === 1,
    '⭐⭐ hay UNA sola escritura en todo el bloque del generador (' + escrituras + ') — ' +
    'los dos botones pasan por `crearPeriodos_`');

  const bloqueCustom = instalar.slice(instalar.indexOf('function crearPeriodoPersonalizado_'),
    instalar.indexOf('function generarProximasSemanas'));
  afirmar(bloqueCustom.indexOf('crearPeriodos_(') !== -1 && bloqueCustom.indexOf('setValues') === -1,
    '⚠ el personalizado DELEGA y no escribe por su cuenta');

  /* El backend expone las tres y el front las llama. Un botón que no llama a nadie es la columna
   * declarada sin lector, otra vez. */
  ['panel_previaSemanaEnCurso', 'panel_generarSemanaEnCurso', 'panel_generarPeriodoPersonalizado']
    .forEach((fn) => {
      afirmar(backend.indexOf('function ' + fn + '(') !== -1 && html.indexOf('.' + fn + '(') !== -1,
        '`' + fn + '` existe en el backend Y el front la llama');
    });

  /* ⭐⭐ **El aviso de la semana sin cerrar sale al ELEGIRLA.** La previa se pide ANTES de que
   * exista el botón, no después de generar — que es todo el punto de que haya una previa. */
  afirmar(/if \(S\.previaSemana === null\) cargarPreviaSemana\(\);[\s\S]{0,200}h \+= bloqueCrearPeriodo\(\);/.test(html),
    '⭐⭐ la previa se pide ANTES de pintar el botón — el aviso sale al elegirla, no al terminar');
  afirmar(/p\.sin_cerrar[\s\S]{0,400}todavía no cerró/.test(html),
    'y el texto del aviso cuelga de `sin_cerrar`, no se pinta siempre');
  afirmar(/11\.000 de 54\.107/.test(html),
    '⚠ con el caso MEDIDO adentro — «los datos pueden estar parciales» no convence a nadie');

  /* ⛔ Y que la derogación esté declarada donde alguien la va a leer antes de tocarlo. */
  afirmar(/DEROGA `R-11` Addendum 2/.test(backend),
    '⛔ y el backend DECLARA que esto deroga `R-11` Addendum 2, con el alcance de la derogación');
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que la hoja VIVA quede bien. La hoja está falseada: esto fija la DECISIÓN del');
console.log('     escritor. Que la celda quede escrita se ve corriendo `generarProximasSemanas()`.');
console.log('   · La coerción de tipos de Sheets (`C-83`). El fixture guarda lo que se le da; la');
console.log('     hoja real puede interpretarlo — por eso el generador RELEE, y eso sí se ve acá.');
console.log('   · Las cuatro semanas que faltan NO están cargadas: eso pide una corrida del');
console.log('     usuario desde el editor de Apps Script.');

process.exit(fallas === 0 ? 0 : 1);
