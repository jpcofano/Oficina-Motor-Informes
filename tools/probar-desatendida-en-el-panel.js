#!/usr/bin/env node
/**
 * tools/probar-desatendida-en-el-panel.js — **el desatendido cableado al panel**
 * (`docs/Prompts/2026-08-21_19_desatendido_al_panel.md`, Partes A, B y D).
 *
 * ⭐ **Por qué existe este banco, dicho con la regla que lo pide:** las tres funciones nuevas de
 * `PanelBackend.gs` y la rama nueva de `iniciarCorridaDesatendida_` son **código que ninguna
 * afirmación tocaba**. `CLAUDE.md` §4: *una rama nueva que nunca se ejecutó no está sin probar,
 * está sin escribir el control* — y las dos cosas se ven igual en un tablero de suites verdes.
 * La pregunta que hay que hacerse al agregar la rama, y no después del primer incidente, es
 * **¿qué afirmación existente falla si esto no funciona?**. La respuesta era «ninguna».
 *
 * **Lo que fija, en orden de qué tan caro sale que se rompa:**
 *
 *  1. ⛔ **`continuable` que llega de afuera se ignora.** Es la guarda que el usuario decidió el
 *     22/08: que el panel pueda pedir una corrida **no** continuable por el camino desatendido no
 *     tiene sentido y sería una forma de romperlo desde afuera — el deck cortaría y no quedaría
 *     plan, o sea el problema que este paso viene a arreglar, reinstalado por la puerta nueva.
 *  2. ⛔ **El período y las secciones viajan.** Es la diferencia entre `agosto_14_20` y
 *     `R-11 (calculado)`, que el 21/08 puso **seis encuentros de junio y julio** en un deck sin
 *     que nada fallara.
 *  3. **Los dos botones mandan lo mismo.** Un solo constructor de opciones; si algún día se
 *     duplica, esto se pone rojo.
 *  4. **La guarda de «ya hay una corrida» devuelve con qué decirlo** — hasta hoy sólo iba al
 *     `Logger`, que en el camino del usuario es no decir nada.
 *  5. **`deckCard` no vuelve a emitir `[object Object]`**, ni un enlace a `/d//edit`.
 *
 * ⚠ **Lo que este banco NO prueba, y hay que decirlo:** que el trigger se cree, que la hoja
 * `PLAN_CORRIDA` se escriba, ni que la pantalla se pinte. Todo eso vive en Apps Script y se ve
 * corriendo el panel. Acá se fija **la decisión**, que es la mitad pura.
 *
 * Uso:
 *   node tools/probar-desatendida-en-el-panel.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const RAIZ = path.join(__dirname, '..');

let fallas = 0;
function afirmar(condicion, mensaje) {
  if (condicion) console.log('  ✅ ' + mensaje);
  else { fallas++; console.log('  ❌ ' + mensaje); }
}

/**
 * Un contexto con `Desatendida.gs` y `PanelBackend.gs` **juntos**, que es como corren de verdad:
 * Apps Script concatena todos los `.gs` en un único scope global (`CLAUDE.md` §1). Cargar uno
 * solo mediría un mundo que no existe.
 */
/**
 * El sello, **sacado del código real** y no copiado acá.
 *
 * ⚠ Vive en `Generador.gs`, que este banco no carga —es enorme y arrastra medio motor—, así que
 * la tentación es escribir `'[en proceso] '` a mano. **Eso sería un fixture inventado en vez de
 * copiado** (`CLAUDE.md` §4): el día que el sello cambie, el banco seguiría verde midiendo un
 * sello que ya no existe. Se lee del archivo.
 */
function selloReal() {
  const texto = fs.readFileSync(path.join(RAIZ, 'Generador.gs'), 'utf8');
  const m = texto.match(/var\s+SELLO_EN_PROCESO_\s*=\s*'([^']*)'/);
  if (!m) throw new Error('No se encontró SELLO_EN_PROCESO_ en Generador.gs.');
  return m[1];
}

function contexto(parchear) {
  const ctx = {
    console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error,
    Logger: { log: function () {} },
    // `formatearFechaHora_` es de `PanelBackend.gs` y usa las dos. No se stubea la función —se
    // stubean sus dependencias de plataforma—, así que lo que corre es el formateo real.
    Utilities: { formatDate: function (f) { return f.toISOString(); } },
    Session: { getScriptTimeZone: function () { return 'America/Argentina/Buenos_Aires'; } },
    SELLO_EN_PROCESO_: selloReal()
  };
  vm.createContext(ctx);
  ['Desatendida.gs', 'PanelBackend.gs'].forEach(function (archivo) {
    let texto = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
    if (parchear) {
      const antes = texto;
      texto = parchear(texto, archivo);
      // ⛔ Un parche de «romper a propósito» que no matchea mide un verde falso, no un control.
      if (parchear.exige === archivo && texto === antes) {
        throw new Error('El parche no matcheó nada en ' + archivo + '.');
      }
    }
    vm.runInContext(texto, ctx, { filename: archivo });
  });
  return ctx;
}

/**
 * Deja `iniciarCorridaDesatendida_` llegando hasta `generarInforme` y **ahí corta**: devolviendo
 * `{ok:false}` la función retorna sin tocar planilla, triggers ni propiedades.
 *
 * ⭐ **Cortar ahí es deliberado y es lo que hace honesto al control.** Lo que se mide es **qué
 * opciones se le pasan al motor**, no el ciclo entero; simular la planilla para llegar más lejos
 * sería reimplementar lo que se está midiendo — el error que `CLAUDE.md` §4 nombra como *el
 * instrumento que reproduce lógica del motor y la reproduce peor*.
 */
function espiarGenerarInforme(ctx) {
  const espia = { llamadas: [] };
  ctx.leerEstadoCorrida_ = function () { return null; };
  ctx.limpiarTriggersDeContinuacion_ = function () { return 0; };
  ctx.generarInforme = function (informeId, periodoId, opciones) {
    espia.llamadas.push({ informeId: informeId, periodoId: periodoId, opciones: opciones });
    return { ok: false, motivo: '(cortado por el banco)' };
  };
  return espia;
}

console.log('\n═══ A · las opciones se arman en un solo lugar ═══');
{
  const ctx = contexto();
  const o = ctx.panel_opcionesDeGeneracion_(true, ['encuentro', 'campana']);

  afirmar(o.faltantes_como_raya === true,
    'conSimbolos=true → faltantes_como_raya=true');
  afirmar(ctx.panel_opcionesDeGeneracion_(false, []).faltantes_como_raya === false,
    'conSimbolos=false → faltantes_como_raya=false');
  /* ⚠ **`=== true` y no truthy**, y el fixture lo distingue: `google.script.run` serializa, y una
   * cadena `'false'` es truthy. Con `!!conSimbolos` esta afirmación pasaría igual y la de abajo
   * no — por eso están las dos. */
  afirmar(ctx.panel_opcionesDeGeneracion_('false', []).faltantes_como_raya === false,
    'la cadena "false" NO prende los símbolos — se compara con === true, no por truthy');
  afirmar(Array.isArray(o.secciones) && o.secciones.length === 2,
    'las secciones tildadas viajan como lista');
  /* Destildar todas es una elección válida —«ninguna sección repetible»— y no un pedido de
   * correrlas todas. Si llegara `undefined`, `generarInforme` las correría todas. */
  afirmar(Array.isArray(ctx.panel_opcionesDeGeneracion_(true, undefined).secciones),
    'sin secciones viaja [] y no undefined: destildar todas es una elección, no un silencio');
}

console.log('\n═══ B · el botón desatendido manda lo que el usuario eligió ═══');
{
  const ctx = contexto();
  const espia = espiarGenerarInforme(ctx);

  ctx.panel_generarDesatendida('jm', 'agosto_14_20', true, ['encuentro']);

  afirmar(espia.llamadas.length === 1, 'llamó a generarInforme una vez');
  const ll = espia.llamadas[0];
  afirmar(ll.periodoId === 'agosto_14_20',
    'el período elegido VIAJA — sin esto la ventana la calcula R-11 y cambia el temario');
  afirmar(JSON.stringify(ll.opciones.secciones) === JSON.stringify(['encuentro']),
    'la lista de secciones tildadas viaja');
  afirmar(ll.opciones.faltantes_como_raya === true,
    'el modo de faltantes viaja');
  afirmar(ll.opciones.continuable === true,
    'la ejecución 1 sale continuable: es lo que escribe PLAN_CORRIDA y crea el trigger');
}

console.log('\n═══ C · continuable lo pone el mecanismo, NO el llamador ═══');
{
  const ctx = contexto();
  const espia = espiarGenerarInforme(ctx);

  // Un llamador malicioso o distraído que manda `continuable: false` por el camino desatendido.
  ctx.panel_opcionesDeGeneracion_ = function () {
    return { faltantes_como_raya: true, secciones: [], continuable: false };
  };
  ctx.panel_generarDesatendida('jm', 'agosto_14_20', true, []);

  afirmar(espia.llamadas[0].opciones.continuable === true,
    '⛔ continuable:false que llega de afuera se IGNORA — si ganara, el deck cortaría sin dejar plan');
}

console.log('\n═══ D · los dos botones mandan lo mismo ═══');
{
  const ctx = contexto();
  const espia = espiarGenerarInforme(ctx);

  ctx.panel_generar('jm', 'agosto_14_20', true, ['encuentro', 'campana']);
  ctx.panel_generarDesatendida('jm', 'agosto_14_20', true, ['encuentro', 'campana']);

  afirmar(espia.llamadas.length === 2, 'los dos caminos llegaron al motor');
  const normal = Object.assign({}, espia.llamadas[0].opciones);
  const desat  = Object.assign({}, espia.llamadas[1].opciones);
  delete desat.continuable;   // la única diferencia legítima
  /* ⭐ **Esto es lo que impide que los dos botones se separen.** El día que alguien agregue una
   * opción a un camino y no al otro, el segundo botón **empieza a hacer otra cosa y no falla** —
   * el modo de siempre. Acá se pone rojo. */
  afirmar(JSON.stringify(normal) === JSON.stringify(desat),
    'salvo continuable, las opciones de los dos botones son IDÉNTICAS');
  afirmar(espia.llamadas[0].periodoId === espia.llamadas[1].periodoId,
    'los dos mandan el mismo período');
}

console.log('\n═══ E · la guarda «ya hay una corrida en curso» se puede mostrar ═══');
{
  const ctx = contexto();
  espiarGenerarInforme(ctx);
  ctx.leerEstadoCorrida_ = function () {
    return { corrida_id: 'jm-20260821-230048', ejecucion: 2, deck_id: 'DECK-1' };
  };
  ctx.DriveApp = { getFileById: function () { return { getName: function () { return selloReal() + 'Informe'; } }; } };

  const r = ctx.panel_generarDesatendida('jm', '', true, []);
  afirmar(r.ok === false, 'no arranca una segunda corrida');
  afirmar(r.corrida_id === 'jm-20260821-230048', 'dice CUÁL está corriendo');
  /* ⚠ Sin la ejecución, el cartel dice «hay una corriendo» y no dice si va por la 1 o por la 6 —
   * que es la diferencia entre esperar y frenar. */
  afirmar(r.ejecucion === 2, 'dice por qué ejecución va');
  afirmar(r.deck && r.deck.sellado === true, 'y trae el deck, sellado: no está terminado');
}

console.log('\n═══ F · el estado de la corrida, sólo lectura ═══');
{
  const ctx = contexto();
  ctx.leerEstadoCorrida_ = function () {
    return {
      corrida_id: 'jm-1', informe_id: 'jm', periodo_id: 'agosto_14_20',
      ejecucion: 2, deck_id: 'DECK-1', se_corto: true
    };
  };
  ctx.topeContinuaciones_ = function () { return 6; };
  ctx.leerPlan_ = function () {
    return [
      { corrida_id: 'jm-1', informe_id: 'jm', seccion_id: 'encuentro', asignaciones: 27, estado: 'hecha', ejecucion: 1, segundos: 150 },
      { corrida_id: 'jm-1', informe_id: 'jm', seccion_id: 'campana', asignaciones: 9, estado: 'pendiente', ejecucion: '', segundos: '' },
      // ⚠ La huella del bug del 20/08: marcada `hecha` y sin tiempo, o sea que el resolver
      // nunca la tocó. Tiene que llegar al front tal cual para que se pueda ver.
      { corrida_id: 'jm-1', informe_id: 'jm', seccion_id: 'm2', asignaciones: 2, estado: 'hecha', ejecucion: 1, segundos: '' }
    ];
  };
  ctx.DriveApp = { getFileById: function () { return { getName: function () { return selloReal() + 'Informe semanal JM'; } }; } };

  const d = ctx.panel_estadoDesatendida();
  afirmar(d.ok === true && d.en_curso === true, 'devuelve ok y declara que hay una en curso');
  afirmar(d.corrida_id === 'jm-1' && d.ejecucion === 2 && d.tope === 6,
    'corrida, ejecución y tope');
  afirmar(d.periodo_id === 'agosto_14_20', 'el período de la corrida viaja al panel');
  afirmar(d.plan.length === 3 && d.hechas === 2 && d.pendientes === 1, 'cuenta el plan');
  afirmar(d.plan[2].segundos === '',
    '⚠ una fila `hecha` sin segundos llega VACÍA — es la huella del marcado que miente, no se rellena');
  afirmar(d.deck && d.deck.sellado === true && /^https:\/\/docs\.google\.com/.test(d.deck.url),
    'el deck viene con url y con el sello leído del NOMBRE, que es donde vive');
  /* ⭐ El invariante: «cortó» y «no queda nada pendiente» no pueden ser ciertas a la vez. Acá
   * queda una pendiente, así que NO tiene que avisar. */
  afirmar(!d.invariante_roto, 'con una sección pendiente y corte, el invariante NO se dispara');
}

console.log('\n═══ G · el invariante corte ⇒ pendientes ≥ 1 ═══');
{
  const ctx = contexto();
  ctx.leerEstadoCorrida_ = function () {
    return { corrida_id: 'jm-1', informe_id: 'jm', ejecucion: 2, deck_id: '', se_corto: true };
  };
  ctx.topeContinuaciones_ = function () { return 6; };
  ctx.leerPlan_ = function () {
    return [{ corrida_id: 'jm-1', informe_id: 'jm', seccion_id: 'encuentro', asignaciones: 27, estado: 'hecha', ejecucion: 1, segundos: 150 }];
  };
  const d = ctx.panel_estadoDesatendida();
  afirmar(!!d.invariante_roto,
    '⛔ cortó y no queda ninguna pendiente → se avisa: algo marcó `hecha` algo que no se resolvió');
}

console.log('\n═══ H · terminada la corrida, la pantalla no se queda muda ═══');
{
  const ctx = contexto();
  // El estado ya se borró —los cinco caminos de salida lo borran— y con él el corrida_id.
  ctx.leerEstadoCorrida_ = function () { return null; };
  ctx.ultimaCorridaDelPlan_ = function () { return 'jm-viejo'; };
  ctx.topeContinuaciones_ = function () { return 6; };
  ctx.leerPlan_ = function () {
    return [{ corrida_id: 'jm-viejo', informe_id: 'jm', seccion_id: 'encuentro', asignaciones: 27, estado: 'hecha', ejecucion: 2, segundos: 90 }];
  };

  const d = ctx.panel_estadoDesatendida();
  afirmar(d.en_curso === false, 'declara que no hay ninguna en curso');
  afirmar(d.corrida_id === 'jm-viejo' && d.plan.length === 1,
    'y aún así muestra el plan de la última: PLAN_CORRIDA no se borra, así que la clave se recupera');
  afirmar(d.informe_id === 'jm', 'el informe sale del plan cuando ya no hay estado');
  afirmar(!!d.motivo, 'y dice que lo que se ve es de una corrida terminada, no de una en curso');
}

console.log('\n═══ I · sin ninguna corrida y sin plan, se dice ═══');
{
  const ctx = contexto();
  ctx.leerEstadoCorrida_ = function () { return null; };
  ctx.ultimaCorridaDelPlan_ = function () { return ''; };
  ctx.topeContinuaciones_ = function () { return 6; };
  const d = ctx.panel_estadoDesatendida();
  afirmar(d.ok === true && d.en_curso === false && d.plan.length === 0 && !!d.motivo,
    'devuelve ok con el motivo dicho — no un error y no un silencio');
}

console.log('\n═══ J · el freno ═══');
{
  const ctx = contexto();
  let cancelada = 0;
  ctx.leerEstadoCorrida_ = function () { return null; };
  ctx.cancelarCorridaDesatendida = function () {
    cancelada++; return { ok: true, triggers_borrados: 0, corrida_id: '' };
  };
  const r = ctx.panel_cancelarDesatendida();
  afirmar(cancelada === 1, 'llama al freno que ya existía — no reimplementa nada');
  /* ⭐ «No había ninguna» **no es un éxito**: una operación que no hizo nada tiene que poder
   * decirlo, o el panel festeja una cancelación que no ocurrió (`CLAUDE.md` §4). */
  afirmar(r.habia === false, 'y distingue «frenada» de «no había nada que frenar»');
}

console.log('\n═══ K · deckCard: el [object Object] no vuelve ═══');
{
  /* `deckCard` vive en `Panel.html`. Se extrae la función real en vez de reescribirla: copiar la
   * lógica acá probaría que sé copiar, que es justo lo que no hace falta verificar. */
  const html = fs.readFileSync(path.join(RAIZ, 'Panel.html'), 'utf8');
  const m = html.match(/function deckCard\([\s\S]*?\n\}/);
  if (!m) { fallas++; console.log('  ❌ no se pudo extraer deckCard de Panel.html'); }
  else {
    const ctx = { console, String, esc: function (v) { return String(v === null || v === undefined ? '' : v); } };
    vm.createContext(ctx);
    vm.runInContext(m[0], ctx, { filename: 'Panel.html#deckCard' });

    const objeto = ctx.deckCard({ id: 'ABC', url: 'https://docs.google.com/presentation/d/ABC/edit' }, 'JM', 'meta');
    afirmar(objeto.indexOf('[object Object]') === -1,
      '⛔ con el objeto {id,url} NO aparece [object Object] — el bug del _15 que quedó abierto');
    afirmar(objeto.indexOf('href="https://docs.google.com/presentation/d/ABC/edit"') !== -1,
      'y usa la url que emitió el motor, no una reconstruida');

    const cadena = ctx.deckCard('XYZ', 'JM', 'meta');
    afirmar(cadena.indexOf('/presentation/d/XYZ/edit') !== -1,
      'con un id suelto sigue andando: la vía rápida le pasa previa.deck_id');

    /* ⚠ **Un enlace roto y uno ausente no son lo mismo**, y el que miente es el roto: un `<a>` a
     * `/d//edit` parece bueno y lleva a un error de Drive. */
    const vacio = ctx.deckCard(null, 'JM', 'meta');
    afirmar(vacio.indexOf('<a ') === -1 && vacio.indexOf('/d//edit') === -1,
      'sin id NO dibuja un enlace roto: dibuja una tarjeta que dice que el deck no viajó');
  }
}

console.log('\n═══ L · romper a propósito ═══');
{
  /* El control positivo del control: si `continuable` se pusiera ANTES de copiar las opciones del
   * llamador, un `continuable:false` de afuera ganaría. La sección C tiene que ponerse roja. */
  /* ⚠ El patrón es una **regex tolerante al fin de línea**, no una cadena literal: los `.gs` de
   * este repo están en CRLF y un `\n` literal no matchea nada. El primer intento falló así — y
   * falló **ruidosamente**, que es para lo que está la guarda `parche.exige`. Una guarda que no
   * estuviera habría dejado la sección L en verde sin haber roto nada. */
  const parche = function (texto, archivo) {
    if (archivo !== 'Desatendida.gs') return texto;
    return texto.replace(
      /var opc = \{\};\s*Object\.keys\(opciones \|\| \{\}\)\.forEach\(function \(k\) \{ opc\[k\] = opciones\[k\]; \}\);\s*opc\.continuable = true;/,
      'var opc = { continuable: true }; Object.keys(opciones || {}).forEach(function (k) { opc[k] = opciones[k]; });'
    );
  };
  parche.exige = 'Desatendida.gs';

  let roto = null;
  try {
    const ctx = contexto(parche);
    const espia = espiarGenerarInforme(ctx);
    ctx.panel_opcionesDeGeneracion_ = function () {
      return { faltantes_como_raya: true, secciones: [], continuable: false };
    };
    ctx.panel_generarDesatendida('jm', 'agosto_14_20', true, []);
    roto = espia.llamadas[0].opciones.continuable;
  } catch (e) {
    fallas++; console.log('  ❌ el parche de romper a propósito falló: ' + e.message);
  }
  afirmar(roto === false,
    'con el orden invertido, el continuable:false de afuera GANA — la sección C mide algo real');
}

console.log('\n' + (fallas ? '❌ ' + fallas + ' afirmación(es) fallaron' : '✅ todo verde'));
process.exit(fallas ? 1 : 0);
