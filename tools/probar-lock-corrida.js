#!/usr/bin/env node
/**
 * tools/probar-lock-corrida.js — el control del cerrojo de corrida (`2026-08-28_2` Parte C).
 *
 * **Por qué existe, y por qué no alcanzaba con «ya está pusheado».** `tomarLockDeCorrida_` y
 * `soltarLockDeCorrida_` son ramas nuevas, y una rama nueva que nunca se ejecutó **no está sin
 * probar: está sin escribir el control** (`CLAUDE.md` §4). La pregunta que corresponde hacerse al
 * agregarla es *¿qué afirmación existente falla si esto no funciona?* — y la respuesta, antes de
 * este archivo, era **ninguna**: los 71 bancos seguían en verde con el lock roto.
 *
 * ⭐ **Lo que hace caro el modo de falla acá es que el bug NO se ve como un bug.** Un par
 * re-entrante mal escrito tiene dos formas y las dos son silenciosas:
 *   · **se bloquea a sí mismo** — `correrUnaEjecucion_` toma el lock y `generarInforme` pide otro:
 *     la continuación de la desatendida muere sin escribir y parece «no había nada que hacer»;
 *   · **suelta de más** — la llamada anidada libera el lock de la de afuera, y otra corrida entra
 *     **en el medio**, que es exactamente lo que el mecanismo existe para impedir.
 *
 * ⚠ **Extrae el código real, no una copia.** Lee `Generador.gs` por texto y evalúa las funciones
 * por nombre. Una copia pegada acá probaría la copia, y seguiría en verde el día que alguien toque
 * el `.gs` — mismo criterio que `probar-encabezado.js` y `tools/listas.js`.
 *
 * **Lo que NO cubre, dicho para que nadie lo lea de más:** esto prueba el **par**, con un
 * `LockService` de mentira. No prueba que Apps Script se comporte así, ni que `generarInforme` lo
 * llame, ni nada sobre la corrida real. Eso necesita una corrida y va por otro lado.
 *
 * Uso:
 *   node tools/probar-lock-corrida.js
 *   node tools/probar-lock-corrida.js --autoprueba    (los casos negativos)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTE = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');

let fallas = 0;
const lineas = [];
function afirmar(cond, texto) {
  lineas.push((cond ? '  ok    ' : '  FALLA ') + texto);
  if (!cond) fallas++;
}

/**
 * Saca una función por nombre contando llaves desde la primera `{`. Tosco a propósito: si no la
 * encuentra **falla en vez de seguir**, que es lo único que le pedimos.
 */
function extraerFuncion(texto, nombre) {
  const inicio = texto.indexOf('function ' + nombre + '(');
  if (inicio === -1) throw new Error('no se encontró `function ' + nombre + '(` en Generador.gs');
  let i = texto.indexOf('{', inicio);
  if (i === -1) throw new Error('la función ' + nombre + ' no tiene cuerpo');
  let nivel = 0;
  for (let j = i; j < texto.length; j++) {
    if (texto[j] === '{') nivel++;
    else if (texto[j] === '}') {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, j + 1);
    }
  }
  throw new Error('llaves sin cerrar en ' + nombre);
}

/** Saca `var NOMBRE = <valor>;` de una línea. Se usa para el timeout, que es parte del contrato. */
function extraerVar(texto, nombre) {
  const m = new RegExp('var\\s+' + nombre + '\\s*=\\s*([^;]+);').exec(texto);
  if (!m) throw new Error('no se encontró `var ' + nombre + '` en Generador.gs');
  return m[1].trim();
}

/**
 * Monta el par sobre un `LockService` de mentira que **cuenta lo que le piden**. El contador es lo
 * que permite distinguir «no pidió un lock nuevo» de «pidió uno y funcionó igual» — sin él, la
 * re-entrancia y una re-toma exitosa se ven idénticas.
 */
function montar(fuente, opciones) {
  opciones = opciones || {};
  const espia = { getScriptLock: 0, tryLock: 0, releaseLock: 0, esperas: [], logs: [] };

  const LockService = {
    getScriptLock() {
      espia.getScriptLock++;
      if (opciones.getScriptLockTira) throw new Error('LockService no disponible');
      return {
        tryLock(ms) {
          espia.tryLock++;
          espia.esperas.push(ms);
          return opciones.tryLockDevuelve !== false;
        },
        releaseLock() {
          espia.releaseLock++;
          if (opciones.releaseLockTira) throw new Error('no se pudo soltar');
        }
      };
    }
  };
  const Logger = { log(s) { espia.logs.push(String(s)); } };

  const codigo = [
    'var LOCK_CORRIDA_ = null;',
    'var ESPERA_LOCK_CORRIDA_MS_ = ' + extraerVar(fuente, 'ESPERA_LOCK_CORRIDA_MS_') + ';',
    extraerFuncion(fuente, 'tomarLockDeCorrida_'),
    extraerFuncion(fuente, 'soltarLockDeCorrida_'),
    'return { tomar: tomarLockDeCorrida_, soltar: soltarLockDeCorrida_,',
    '         tenido: function () { return LOCK_CORRIDA_ !== null; },',
    '         espera: ESPERA_LOCK_CORRIDA_MS_ };'
  ].join('\n');

  // eslint-disable-next-line no-new-func
  const api = new Function('LockService', 'Logger', codigo)(LockService, Logger);
  api.espia = espia;
  return api;
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Caso negativo — `--autoprueba`
 *
 * ⭐⭐ **Verifica que la MUTACIÓN OCURRIÓ, y no es opcional** (`CLAUDE.md` §4, 24/08): una prueba
 * que rompe a propósito compara *antes* contra *después*, y **si el parche no aplicó no hay
 * después** — el caso corre sobre el código intacto, da verde, y eso se lee como «el negativo
 * pasó». Por eso los patrones van por fragmento de UNA línea: el final de línea es del archivo
 * (`Generador.gs` está en CRLF), no de quien escribe la prueba.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */
const MUTACIONES = [
  {
    nombre: 'sin re-entrancia: pide un lock nuevo aunque ya lo tengamos',
    de: 'if (LOCK_CORRIDA_) return { ok: true, reentrante: true };',
    a: '',
    espera: 'la toma anidada'
  },
  {
    nombre: 'suelta de más: la llamada anidada libera el lock de la de afuera',
    de: 'if (!tomado || !tomado.ok || tomado.reentrante) return false;',
    a: 'if (!tomado || !tomado.ok) return false;',
    espera: 'la anidada al soltar'
  },
  {
    nombre: 'falla abierta: un LockService que tira se convierte en permiso',
    de: "return { ok: false, reentrante: false, motivo: 'no se pudo pedir el lock de corrida: '",
    a: "return { ok: true, reentrante: false, motivo: 'no se pudo pedir el lock de corrida: '",
    espera: 'falla cerrada'
  },
  {
    nombre: 'el tryLock ocupado deja pasar igual',
    de: 'if (!lock.tryLock(ESPERA_LOCK_CORRIDA_MS_)) {',
    a: 'if (false) {',
    espera: 'devuelve ok:false'
  }
];

if (process.argv.indexOf('--autoprueba') !== -1) {
  console.log('AUTOPRUEBA — cada mutación tiene que poner en rojo la afirmación que le toca\n');
  let malos = 0;
  MUTACIONES.forEach((m) => {
    const mutado = FUENTE.split(m.de).join(m.a);
    if (mutado === FUENTE) {
      console.log('  ⛔ ' + m.nombre + ' — EL PARCHE NO APLICÓ: el patrón no matcheó nada. ' +
        'Este caso no midió nada.');
      malos++;
      return;
    }
    let cayo = null;
    try {
      cayo = correrAfirmaciones(mutado, true);
    } catch (e) {
      cayo = ['(excepción) ' + e.message];
    }
    const acerto = cayo.some((t) => t.indexOf(m.espera) !== -1);
    console.log((acerto ? '  ok    ' : '  ⛔ ') + m.nombre +
      ' → cayeron ' + cayo.length + ': ' + JSON.stringify(cayo.slice(0, 3)));
    if (!acerto) {
      console.log('        se esperaba que cayera «' + m.espera + '» — un rojo por otro motivo ' +
        'no prueba lo que dice probar.');
      malos++;
    }
  });
  console.log(malos ? '\n⛔ ' + malos + ' mutación(es) no midieron lo que dicen medir.'
    : '\n✅ Las ' + MUTACIONES.length + ' mutaciones cayeron por el motivo correcto.');
  process.exit(malos ? 1 : 0);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Las afirmaciones
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */
function correlacionar(cond, texto, caidas) {
  if (!cond) caidas.push(texto);
  return cond;
}

function correrAfirmaciones(fuente, silencioso) {
  const caidas = [];
  const decir = (cond, texto) => {
    if (silencioso) return correlacionar(cond, texto, caidas);
    afirmar(cond, texto);
    return cond;
  };

  if (!silencioso) console.log('1 · la primera toma');
  {
    const a = montar(fuente);
    const r = a.tomar();
    decir(r.ok === true && r.reentrante === false, 'la primera toma devuelve ok y no re-entrante');
    decir(a.tenido() === true, 'y deja el lock registrado en el módulo');
    decir(a.espia.getScriptLock === 1 && a.espia.tryLock === 1,
      'pidió exactamente un lock — control positivo: si esto fuera 0, el stub no se usó');
    decir(a.espia.esperas[0] === a.espera,
      'esperó `ESPERA_LOCK_CORRIDA_MS_` y no un número suelto — vino ' + a.espia.esperas[0]);
  }

  if (!silencioso) console.log('\n2 · la toma anidada (lo que salva a la desatendida)');
  {
    const a = montar(fuente);
    a.tomar();
    const dentro = a.tomar();
    decir(dentro.ok === true && dentro.reentrante === true,
      'la toma anidada devuelve ok y re-entrante');
    decir(a.espia.getScriptLock === 1,
      'y NO pidió un lock nuevo — sin esto `correrUnaEjecucion_` se bloquea a sí misma al ' +
      'llamar a `generarInforme`');
  }

  if (!silencioso) console.log('\n3 · sólo suelta el que tomó');
  {
    const a = montar(fuente);
    const fuera = a.tomar();
    const dentro = a.tomar();
    decir(a.soltar(dentro) === false && a.espia.releaseLock === 0,
      'la anidada al soltar NO libera nada — soltar de más abre la puerta en el medio de la corrida');
    decir(a.tenido() === true, 'y el lock sigue tomado después de que la anidada "soltó"');
    decir(a.soltar(fuera) === true && a.espia.releaseLock === 1,
      'la externa sí libera, y una sola vez');
    decir(a.tenido() === false, 'y deja el módulo limpio para la próxima');
  }

  if (!silencioso) console.log('\n4 · cuando ya hay una corrida');
  {
    const a = montar(fuente, { tryLockDevuelve: false });
    const r = a.tomar();
    decir(r.ok === false, 'un `tryLock` que no lo consigue devuelve ok:false');
    decir(typeof r.motivo === 'string' && r.motivo.length > 0, 'y con un motivo escrito');
    decir(/corrida/i.test(r.motivo), 'que nombra la causa, no un código pelado');
    decir(!/@/.test(r.motivo),
      'y SIN mail ni identidad — `C.2`: el motivo dice qué pasa, nunca quién está corriendo');
    decir(a.tenido() === false, 'y no deja el módulo creyendo que lo tiene');
    decir(a.soltar(r) === false && a.espia.releaseLock === 0,
      'soltar un intento fallido no libera el lock de nadie');
  }

  if (!silencioso) console.log('\n5 · falla cerrada');
  {
    const a = montar(fuente, { getScriptLockTira: true });
    const r = a.tomar();
    decir(r.ok === false,
      'falla cerrada: un `LockService` que tira NO puede volverse permiso para correr');
    decir(a.tenido() === false, 'y tampoco deja el lock registrado');
  }

  if (!silencioso) console.log('\n6 · soltar cuando el release tira');
  {
    const a = montar(fuente, { releaseLockTira: true });
    const t = a.tomar();
    let exploto = false;
    try { a.soltar(t); } catch (e) { exploto = true; }
    decir(exploto === false,
      'un release que falla no tumba la corrida — ya terminó, y la ejecución lo libera igual');
    decir(a.tenido() === false, 'y el módulo queda limpio de todas formas');
    decir(a.espia.logs.some((l) => /lock/i.test(l)),
      'pero lo dice: un fallo tragado en silencio es la mitad del bug');
  }

  return caidas;
}

console.log('BANCO — el cerrojo de corrida (`2026-08-28_2` C)\n');
correrAfirmaciones(FUENTE, false);

console.log('\n' + lineas.join('\n'));

if (fallas) {
  console.log('\n❌ ' + fallas + ' afirmación(es) fallaron.');
  process.exit(1);
}
console.log('\n✅ Las ' + lineas.length + ' afirmaciones pasaron.');
console.log('⚠ NO cubre: que Apps Script se comporte así, que `generarInforme` lo llame, ni nada ' +
  'de la corrida real. Prueba el par con un `LockService` de mentira.');
