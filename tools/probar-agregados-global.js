#!/usr/bin/env node
/**
 * tools/probar-agregados-global.js — control de los tres agregados del GLOBAL de `L-047`
 * (24/08/2026): `camp_enviados`, `camp_or`, `camp_mail_clics`.
 *
 * Hermano de `probar-tabla-envios.js`, que guarda las cinco filas de envío de la misma lámina.
 * Éste guarda **la fila de abajo**, que lee otra fuente.
 *
 * ### Las tres cosas que afirma, y por qué cada una
 *
 * ⭐ **1 · Cruce contra el censo, uno por uno.** Los tres tienen que estar en el bloque de `L-047`
 * de `docs/CENSO_tokens_sin_fila_2026-08-22.md`. **Cruzar es una pertenencia; filtrar por prefijo
 * es una regla**, y sólo la primera falla cuando el nombre no está — `camp_env` ya se comió a
 * `camp_enviados` una vez, el 23/08. ⚠ Y por eso acá se afirma **también en negativo** que
 * `camp_enviados` **no** entra en el lote de la tabla de envíos.
 *
 * ⭐⭐ **2 · El denominador de `% OR` está MEDIDO, no elegido**, y esta prueba lo reproduce con las
 * cuatro filas del deck del equipo del 14-21/08. **Tres de las cuatro no distinguen** —`enviados`
 * y `entregados` redondean al mismo entero— **y la cuarta sí**. Que exista una sola fila
 * discriminante es exactamente el caso de `Pruebas.gs:456`: *un fixture cuyo dato satisface más de
 * una afirmación no distingue entre ellas*. Acá se afirma **las dos cosas**: que el denominador
 * correcto cierra, y que el otro **no**.
 *
 * ⛔ **3 · Negativa — `camp_mail_clics` y `camp_clics` no pueden apuntar al mismo campo.** Uno es
 * mail (col Q) y el otro digital (col J), viven en láminas distintas y **elegir mal no falla:
 * publica**. Si algún día los dos leen `dig_clics` o los dos `mail_clics`, esto se pone rojo.
 *
 * El fixture de la tabla del equipo se **copió** de la salida real (`ppt/slides/slide15.xml` del
 * deck del 20/08, sha `f8ef3227…`), no se dedujo — la regla del 17/08.
 *
 * Uso:
 *   node tools/probar-agregados-global.js
 *   node tools/probar-agregados-global.js --autoprueba
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Instalar.gs'), 'utf8');
const CENSO = fs.readFileSync(path.join(RAIZ, 'docs', 'CENSO_tokens_sin_fila_2026-08-22.md'), 'utf8');

const LOS_TRES = ['camp_enviados', 'camp_or', 'camp_mail_clics'];

/** La tabla de `L-047` del deck del equipo, 14-21/08. COPIADA de la salida real. */
const DECK = {
  envios: [
    { aud: 'Barrios cercanos interesados en seguridad', enviados: 18616, entregados: 18393, aperturas: 3570, or: 19, clics: 164 },
    { aud: 'Barrios Priorizados cercanos a Lugano', enviados: 119471, entregados: 118525, aperturas: 18338, or: 15, clics: 194 },
    { aud: 'Apertores de los envios Operativo Saturacion', enviados: 127091, entregados: 126766, aperturas: 77963, or: 62, clics: 617 },
    { aud: 'Vecinos de Villa Lugano', enviados: 36830, entregados: 36114, aperturas: 3323, or: 9, clics: 169 }
  ],
  global: { enviados: 302008, entregados: 299798, aperturas: 103194, or: 34, clics: 1144, ctor: 1.11 }
};

/** El bloque de `L-047` del censo del 22/08, como LISTA — no como regla de prefijo. */
function tokensDelCenso() {
  const m = CENSO.match(/l[áa]mina\s+20\s+·\s+L-047[^\n]*\n((?:\s{4,}[^\n]*\n)+)/);
  if (!m) throw new Error('No encontré el bloque de L-047 en el censo — si el formato cambió, ' +
    'esta prueba tiene que enterarse en vez de dar verde sobre una lista vacía.');
  return m[1].split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);
}

/** Las filas que el wrapper escribe, leídas del seed real. */
function filasDelWrapper(fuente) {
  const i = fuente.indexOf('function cablearAgregadosDelGlobal_()');
  if (i === -1) throw new Error('No encontré `cablearAgregadosDelGlobal_` en Instalar.gs.');
  const ini = fuente.indexOf('curarMarcadores_([], [', i);
  const desde = fuente.indexOf('[', fuente.indexOf('[], [', i) + 4);
  let nivel = 0, fin = -1;
  for (let j = desde; j < fuente.length; j++) {
    if (fuente[j] === '[') nivel++;
    else if (fuente[j] === ']') { nivel--; if (nivel === 0) { fin = j; break; } }
  }
  if (ini === -1 || fin === -1) throw new Error('No pude recortar la lista del wrapper.');
  const cuerpo = fuente.slice(desde, fin + 1);
  // `N(...)` es una función del wrapper; acá sólo interesa la forma de la fila.
  return new Function('N', 'return ' + cuerpo)(() => '');
}

/** Redondeo al entero como lo publica el deck. */
const pct = (num, den) => Math.round((num / den) * 100);

function correr(fuente, silencioso) {
  const censo = tokensDelCenso();
  const filas = filasDelWrapper(fuente);
  const porNombre = {};
  filas.forEach((f) => { porNombre[f.marcador] = f; });

  const fallas = [];
  let ok = 0;
  const di = (t) => { if (!silencioso) console.log(t); };
  const af = (nombre, cond, detalle) => {
    if (cond) { ok++; di('  ✅ ' + nombre); }
    else { fallas.push(nombre); di('  ⛔ ' + nombre + (detalle ? ' — ' + detalle : '')); }
  };

  di('');
  di('1 · control positivo — el censo se leyó de verdad (' + censo.length + ' tokens en L-047)');
  af('el bloque de L-047 trae los 46 tokens del censo', censo.length === 46,
    'trae ' + censo.length + ' — sin esto, «no está en el censo» y «no leí el censo» se ven igual');
  af('y trae `camp_env1_rem`, que es del lote de envíos', censo.indexOf('camp_env1_rem') !== -1);

  di('');
  di('2 · cruce UNO POR UNO contra el censo (pertenencia, no filtro por prefijo)');
  LOS_TRES.forEach((t) => {
    af(t + ' está en el bloque de L-047 del censo', censo.indexOf(t) !== -1);
    af(t + ' tiene fila en el wrapper', !!porNombre[t]);
  });
  af('los tres, y nada más — el wrapper no escribe de más', filas.length === 3,
    'escribe ' + filas.length);

  di('');
  di('3 · ⛔ NEGATIVA — `camp_enviados` NO es del lote de la tabla de envíos (la trampa del prefijo)');
  af('`camp_enviados` empieza con `camp_env` y NO es un envío',
    'camp_enviados'.indexOf('camp_env') === 0 && !/^camp_env\d/.test('camp_enviados'));
  af('ninguna fila del wrapper tiene la forma `camp_envN_`',
    filas.every((f) => !/^camp_env\d/.test(f.marcador)),
    'un `grep camp_env` mete el GLOBAL en la tabla; ya pasó el 23/08');

  di('');
  di('4 · ⭐⭐ el denominador de `% OR`, reproducido contra las 4 filas del deck del equipo');
  const conEntregados = DECK.envios.filter((e) => pct(e.aperturas, e.entregados) === e.or).length;
  const conEnviados = DECK.envios.filter((e) => pct(e.aperturas, e.enviados) === e.or).length;
  af('aperturas/ENTREGADOS reproduce las 4 filas', conEntregados === 4, 'reproduce ' + conEntregados);
  af('aperturas/ENVIADOS NO reproduce las 4 — hay una fila que discrimina', conEnviados === 3,
    'reproduce ' + conEnviados + '; si fueran 4, este fixture no distingue las dos definiciones y ' +
    'la afirmación de arriba no prueba lo que dice');
  const discriminante = DECK.envios.filter((e) => pct(e.aperturas, e.entregados) !== pct(e.aperturas, e.enviados));
  af('y la fila discriminante es exactamente una', discriminante.length === 1,
    'son ' + discriminante.length);
  af('`camp_or` usa ese denominador', porNombre.camp_or &&
    porNombre.camp_or.campo_logico === 'mail_aperturas/mail_entregados',
    porNombre.camp_or ? 'dice ' + porNombre.camp_or.campo_logico : 'no hay fila');
  af('`camp_or` es PCT, no promedio de tasas', porNombre.camp_or && porNombre.camp_or.operacion === 'PCT');

  di('');
  di('5 · ⭐ la identidad interna de la fila GLOBAL, sobre los números del equipo');
  af('% OR global = aperturas/entregados', pct(DECK.global.aperturas, DECK.global.entregados) === DECK.global.or);
  af('% CTOR global = clics/aperturas → 1,11',
    Math.round((DECK.global.clics / DECK.global.aperturas) * 10000) / 100 === DECK.global.ctor);
  ['enviados', 'entregados', 'aperturas', 'clics'].forEach((c) => {
    const suma = DECK.envios.reduce((a, e) => a + e[c], 0);
    af('GLOBAL.' + c + ' = la suma de los 4 envíos (' + suma.toLocaleString('es') + ')',
      suma === DECK.global[c], 'suma ' + suma + ' contra ' + DECK.global[c]);
  });

  di('');
  di('6 · ⛔ NEGATIVA — `camp_mail_clics` (mail) no puede leer lo mismo que `camp_clics` (digital)');
  const clicsDigital = /marcador: 'camp_clics'[\s\S]{0,220}?campo_logico: '([^']+)'/.exec(fuente);
  af('`camp_clics` sigue leyendo `dig_clics`', !!clicsDigital && clicsDigital[1] === 'dig_clics',
    clicsDigital ? 'dice ' + clicsDigital[1] : 'no lo encontré');
  af('`camp_mail_clics` lee `mail_clics`', porNombre.camp_mail_clics &&
    porNombre.camp_mail_clics.campo_logico === 'mail_clics');
  af('y los dos campos son distintos', !!clicsDigital && porNombre.camp_mail_clics &&
    clicsDigital[1] !== porNombre.camp_mail_clics.campo_logico,
    'son dos hechos distintos en dos láminas distintas, y elegir mal no falla: publica');

  di('');
  di('7 · la forma de las filas — misma que sus tres hermanas del GLOBAL');
  filas.forEach((f) => {
    af(f.marcador + ' lee looker/resumen_metricas_dinamico',
      f.base_id === 'looker' && f.solapa === 'resumen_metricas_dinamico');
    af(f.marcador + ' sin filtro y sin dimensiones (la campaña es el ítem, no un corte)',
      !f.filtro && !f.dimensiones);
    af(f.marcador + ' no lleva `_revisar` (ninguna hermana la lleva)',
      String(f.formato || '').indexOf('_revisar') === -1, 'dice ' + f.formato);
  });

  return { ok: ok, fallas: fallas };
}

if (process.argv.indexOf('--autoprueba') !== -1) {
  console.log('== autoprueba: control negativo CON MOTIVO ==');
  let malas = 0;
  const casos = [
    {
      nombre: 'le pongo `mail_enviados` de denominador a `camp_or`',
      mutar: (s) => s.replace("campo_logico: 'mail_aperturas/mail_entregados'",
        "campo_logico: 'mail_aperturas/mail_enviados'"),
      esperaQueCaiga: '`camp_or` usa ese denominador'
    },
    {
      nombre: 'le hago leer `dig_clics` a `camp_mail_clics`',
      /* ⚠ Los patrones van por FRAGMENTO DE UNA LÍNEA, nunca por bloques con `\n`: `Instalar.gs`
       * está en **CRLF** y una mutación con `\n` pelado no matchea nada. Lo detectó la guarda de
       * «la mutación NO cambió nada», que existe justamente para esto — sin ella, dos de los tres
       * casos negativos habrían pasado en verde sin tocar una línea. */
      mutar: (s) => s.replace("campo_logico: 'mail_clics', operacion: 'ULTIMO'",
        "campo_logico: 'dig_clics', operacion: 'ULTIMO'"),
      esperaQueCaiga: 'y los dos campos son distintos'
    },
    {
      nombre: 'le pongo `miles_revisar` a `camp_enviados`',
      mutar: (s) => s.replace(/(marcador: 'camp_enviados'[\s\S]{0,240}?formato: ')miles'/, "$1miles_revisar'"),
      esperaQueCaiga: 'camp_enviados no lleva `_revisar` (ninguna hermana la lleva)'
    }
  ];
  casos.forEach((c) => {
    const mutado = c.mutar(FUENTE);
    if (mutado === FUENTE) {
      console.log('  ⛔ ' + c.nombre + ' — la mutación NO cambió nada, así que no prueba nada');
      malas++;
      return;
    }
    const r = correr(mutado, true);
    if (r.fallas.indexOf(c.esperaQueCaiga) !== -1) {
      console.log('  ✅ ' + c.nombre + ' → cae la correcta ("' + c.esperaQueCaiga + '"), ' +
        r.fallas.length + ' en rojo');
    } else {
      malas++;
      console.log('  ⛔ ' + c.nombre + ' → NO cayó la esperada. Cayeron: ' +
        (r.fallas.join(' · ') || '(ninguna — el control no ve la causa)'));
    }
  });
  console.log('');
  console.log(malas ? '⛔ la autoprueba encontró ' + malas + ' caso(s) mal medido(s).'
    : '✅ los ' + casos.length + ' casos negativos caen por el motivo correcto.');
  process.exit(malas ? 1 : 0);
}

console.log('== probar-agregados-global — los tres del GLOBAL de L-047 ==');
const r = correr(FUENTE, false);
console.log('');
console.log(r.fallas.length
  ? '⛔ ' + r.fallas.length + ' de ' + (r.ok + r.fallas.length) + ' afirmaciones en rojo.'
  : '✅ Las ' + r.ok + ' afirmaciones pasaron.');
console.log('⚠ Lo que NO dice: qué número va a publicar el motor. La solapa que leen no tiene su');
console.log('  estabilidad medida en `R-31`, así que nacen SIN VALIDAR — y eso no es lo mismo que');
console.log('  validados. El control que sí se puede exigir en cada corrida es la identidad de la');
console.log('  fila: % OR = aperturas/entregados y % CTOR = clics/aperturas.');
process.exit(r.fallas.length ? 1 : 0);
