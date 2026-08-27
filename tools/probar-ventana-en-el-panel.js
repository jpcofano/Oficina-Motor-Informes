#!/usr/bin/env node
/**
 * tools/probar-ventana-en-el-panel.js — **la ventana llega al panel, con su NIVEL**
 * (`docs/Prompts/2026-08-26_2_corrida_nocturna_front.md`, Parte B).
 *
 * ⭐ **Qué se arregló, y el propio código escribía el arreglo.** El adaptador `panel_generar`
 * colapsaba el objeto a `periodo: (r.periodo && r.periodo.lamina) || ''` y su comentario decía
 * *«se pierden `desde`, `hasta`, `calculado` y `traza`, y hoy no los lee nadie… el día que el
 * panel quiera marcar una ventana calculada, **el campo vuelve como uno propio — no reabriendo el
 * objeto entero**»*. Era una instrucción, no una descripción, y se cumplió al pie.
 *
 * ⭐⭐ **Por qué el NIVEL y no sólo las fechas.** `resolverVentana` es una cadena de **cinco**
 * eslabones (`D-20`) y el deck no decía por cuál salió: *«el usuario eligió `julio_24_30`»* y
 * *«nadie eligió nada y `R-11` calculó la última semana cerrada»* producen **la misma etiqueta**
 * y mandan a trabajos distintos. El 21/08 esa confusión puso **seis encuentros de junio y julio**
 * en un deck sin que nada fallara.
 *
 * ⚠ **Lo que este banco NO prueba:** que la pantalla se pinte. Eso vive en Apps Script y se ve
 * corriendo el panel. Acá se fija **que el dato viaje y que el texto se arme**, que es la mitad
 * pura — y es la mitad que se rompe en silencio.
 *
 * Uso:
 *   node tools/probar-ventana-en-el-panel.js
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

/* ⚠ `Panel.html` y los `.gs` están en disco con **CRLF**, así que todo parche de «romper a
 * propósito» va por fragmento de UNA línea — y `contexto*()` **exige** que haya mutado. */

/** `PanelBackend.gs` con `generarInforme` espiado: se corta antes de tocar nada de la plataforma. */
function backend(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: function () {} },
    Utilities: { formatDate: function (f) { return f.toISOString(); } },
    Session: { getScriptTimeZone: function () { return 'America/Argentina/Buenos_Aires'; } }
  };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'PanelBackend.gs' });
  return ctx;
}

/**
 * ⭐ **El fixture se COPIA de la forma real, no se deduce.** `generarInforme` devuelve `periodo`
 * como el objeto de `Generador.gs`: `{ lamina, desde, hasta, origen, calculado, traza }`. Un
 * fixture inventado probaría que sé leer el template, que es lo que no hace falta verificar.
 */
function respuestaDelMotor(periodo) {
  return {
    ok: true,
    corrida_id: 'jm-20260826-010203',
    deck: { id: 'ABC', nombre: 'JM', url: 'https://x/ABC', dueno: 'y' },
    periodo: periodo,
    presentacion_faltantes: 'simbolos',
    tokens: { en_plantilla: 3, reemplazados: 2, faltantes: 1, excluidos_por_lamina_escondida: 0,
              cableados_sin_caja_en_plantilla: 0 },
    repetibles: { secciones: [] },
    tiempos_por_seccion: [], marcadores: null,
    corte: null, fallo: null, instrumento: null, presupuesto: null
  };
}

const ELEGIDO = {
  lamina: 'vie 24/07 – jue 30/07', desde: '24/07/2026', hasta: '30/07/2026',
  origen: 'periodo_ref:julio_24_30', calculado: false, traza: 'override explícito'
};
const CALCULADO = {
  lamina: 'vie 24/07 – jue 30/07', desde: '24/07/2026', hasta: '30/07/2026',
  origen: 'R-11 (calculado)', calculado: true, traza: 'cadena de D-20, eslabón "R-11 (calculado)"'
};

/** Corre `panel_generar` con el motor espiado y devuelve lo que el adaptador le manda al front. */
function adaptar(ctx, periodo) {
  ctx.__p = periodo;
  vm.runInContext('generarInforme = function () { return __resp; };', ctx);
  ctx.__resp = respuestaDelMotor(periodo);
  vm.runInContext('panel_opcionesDeGeneracion_ = function () { return {}; };', ctx);
  return vm.runInContext('panel_generar("jm", "julio_24_30", true, [])', ctx);
}

console.log('La ventana en el panel — código cargado de PanelBackend.gs y Panel.html\n');

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 1 · ⭐ El adaptador manda campos PROPIOS — el objeto no se reabre
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('1 · ⭐ los campos propios del adaptador');
{
  const ctx = backend();
  const r = adaptar(ctx, ELEGIDO);

  afirmar(r.ok === true, 'el adaptador devuelve `ok` (si no, lo de abajo no mide nada)');
  afirmar(r.periodo === 'vie 24/07 – jue 30/07',
    '`periodo` SIGUE siendo la etiqueta de la lámina — el arreglo suma, no reemplaza');
  afirmar(r.periodo_nivel === 'periodo_ref:julio_24_30',
    '⭐ y ahora viaja `periodo_nivel`, que es lo que faltaba: por cuál eslabón de D-20 salió');
  afirmar(r.periodo_desde === '24/07/2026' && r.periodo_hasta === '30/07/2026',
    'con `periodo_desde` y `periodo_hasta` planos');
  afirmar(r.periodo_calculado === false, 'y `periodo_calculado` como booleano, no como texto');

  /* ⚠ **Que sean planos es la mitad del punto.** El comentario del adaptador decía *«no
   * reabriendo el objeto entero»*: si `periodo` volviera a ser un objeto, el front haría
   * `esc(r.periodo)` sobre él y volvería el `[object Object]` del `_15`. */
  afirmar(typeof r.periodo === 'string' && typeof r.periodo_nivel === 'string',
    '⚠ los dos son cadenas: el objeto NO se reabrió — volvería el `[object Object]` del `_15`');
}

console.log('\n2 · ⭐ y el caso que motivó todo: calculado vs. elegido');
{
  const ctx = backend();
  const calc = adaptar(ctx, CALCULADO);
  const eleg = adaptar(ctx, ELEGIDO);

  afirmar(calc.periodo === eleg.periodo,
    '⛔ las dos ventanas dan LA MISMA etiqueta — por eso mirarla no alcanzaba');
  afirmar(calc.periodo_nivel !== eleg.periodo_nivel,
    '⭐ y el nivel SÍ las distingue: es la diferencia que el 21/08 costó seis encuentros');
  afirmar(calc.periodo_calculado === true && eleg.periodo_calculado === false,
    'y `calculado` marca la que nadie eligió');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 3 · El traductor del front — la función REAL, extraída de `Panel.html`
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n3 · `nivelDeVentana` traduce los cinco eslabones');
{
  const html = fs.readFileSync(path.join(RAIZ, 'Panel.html'), 'utf8');
  const m = html.match(/function nivelDeVentana\([\s\S]*?\r?\n\}/);
  if (!m) { fallas++; hechas++; console.log('  ❌ no se pudo extraer `nivelDeVentana` de Panel.html'); }
  else {
    const ctx = { console, String };
    vm.createContext(ctx);
    vm.runInContext(m[0], ctx, { filename: 'Panel.html#nivelDeVentana' });

    /* ⭐ Los cinco eslabones **copiados de `resolverVentana`** (`Fuentes.gs`), no inventados:
     * `campana:`, `periodo_ref:`, `seccion:`, `config` y `R-11 (calculado)`. */
    const CINCO = [
      ['periodo_ref:julio_24_30', /período elegido: julio_24_30/],
      ['campana:mi_campana', /campaña mi_campana/],
      ['seccion:encuentros→ref', /sección encuentros/],
      ['config', /la ventana de CONFIG/],
      ['R-11 (calculado)', /última semana cerrada/]
    ];
    let traducidos = 0;
    CINCO.forEach(function (c) {
      const salida = ctx.nivelDeVentana(c[0]);
      const ok = c[1].test(salida);
      afirmar(ok, 'el eslabón `' + c[0] + '` se traduce → ' + salida);
      if (ok) traducidos++;
    });
    /* ⭐ El conteo es una afirmación: sin él, un eslabón que dejara de traducirse bajaría el
     * alcance en silencio. */
    afirmar(traducidos === 5,
      '⭐ se tradujeron ' + traducidos + ' de 5 eslabones — `resolverVentana` tiene cinco');

    /* ⚠⚠ **El aserto que importa más que los cinco de arriba.** */
    afirmar(ctx.nivelDeVentana('un_eslabon_nuevo_que_no_existe') === 'un_eslabon_nuevo_que_no_existe',
      '⚠ un nivel DESCONOCIDO se muestra crudo, no se inventa una frase — el precedente del ' +
      '`|| S.faltantesComoRaya` que se retiró el 20/08');
    afirmar(ctx.nivelDeVentana('') === '' && ctx.nivelDeVentana(null) === '',
      'y sin nivel no dibuja nada: ausente y desconocido no son lo mismo');
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * 4 · ⚠ Romper a propósito — exigiendo el motivo, no sólo el rojo
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\n4 · ⚠ los controles negativos');
{
  const ctx = backend((t) => t.replace(
    "    periodo_nivel: (r.periodo && r.periodo.origen) || '',",
    "    periodo_nivel: '',   // ROTO A PROPOSITO"));
  const r = adaptar(ctx, ELEGIDO);
  afirmar(r.periodo_nivel === '' && r.periodo === 'vie 24/07 – jue 30/07',
    'sin `periodo_nivel` en el adaptador el nivel se pierde — caen los asertos 1.3 y 2.2');
  afirmar(r.periodo_desde === '24/07/2026',
    'y los otros campos sobreviven: el negativo distingue CUÁL de los cinco rompió');
}
{
  /* ⭐ Y el que fija el cableado del front: sin la llamada a `nivelDeVentana` en la pantalla de
   * listo, el dato viaja y nadie lo pinta — que es exactamente el estado del que se venía. */
  const html = fs.readFileSync(path.join(RAIZ, 'Panel.html'), 'utf8');
  afirmar(/r\.periodo_nivel \? ' · ' \+ esc\(nivelDeVentana\(r\.periodo_nivel\)\)/.test(html),
    '⭐ la pantalla de «listo» LLAMA a `nivelDeVentana` — un campo que viaja y nadie lee es ' +
    'la columna declarada sin lector');
  afirmar(/Ventana: ' \+ esc\(c\.ventana\.etiqueta\)/.test(html) &&
          html.split('nivelDeVentana(').length - 1 >= 3,
    'y el cuadro de TEMARIO también la muestra — el dato ya viajaba en `panel_getEstado`');
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

/* ⚠ Los avisos van ÚLTIMOS, después del veredicto. */
console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que la pantalla se PINTE. Eso corre en Apps Script; acá se fija que el dato');
console.log('     viaje y que el texto se arme.');
console.log('   · Que la ventana sea la CORRECTA. Esto dice de qué eslabón salió, no si ese');
console.log('     eslabón eligió bien — eso es `R-21` y se mira contra el temario.');
console.log('   · `panel_generarDesatendida` no pasa por este adaptador: su pantalla de listo');
console.log('     reusa `vistaListo`, así que hereda el arreglo, pero no está medido acá.');

process.exit(fallas === 0 ? 0 : 1);
