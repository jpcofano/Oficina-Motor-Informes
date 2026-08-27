#!/usr/bin/env node
/**
 * tools/probar-aviso-ventana.js — **el aviso de ventana propuesta decide con el MISMO cálculo que
 * el motor** (`docs/Prompts/2026-08-26_2_corrida_nocturna_front.md`, Parte C).
 *
 * ⛔⛔ **Este banco se dio vuelta el 26/08, y el motivo importa más que el cambio.** Fijaba la
 * **segunda** generación del aviso —*«la semana propuesta sí tiene fila en PERIODOS, pero las
 * secciones repetibles NO se recortan por período»*— y **se puso rojo porque el estado cambió**,
 * que es exactamente para lo que se escribió. `CLAUDE.md` §4: *un banco que se pone rojo cuando el
 * estado cambia está haciendo su trabajo, aunque el cambio sea el correcto; lo que corresponde no
 * es aflojarlo, es darlo vuelta con el motivo escrito y, si se puede, subirle la exigencia.*
 *
 * **Las tres generaciones del mismo aviso, que es el hallazgo de verdad:**
 *
 *  1. `2026-08-20_2` — nace diciendo *«no se puede correr»*. Falso: la corrida es válida.
 *  2. `2026-08-22_22` §5 — decía *«no tiene fila en PERIODOS»* mirando sólo el prefijo del
 *     `origen`. Medido: `agosto_14_20` **era** esa fila. La consecuencia cierta, la causa no.
 *  3. ⭐ **Ésta.** Desde el `_25` (commit `fd226d1`, 22/08 13:21) el motor **sí recorta** sobre
 *     una ventana calculada cuando alguna fila de `PERIODOS` la describe. La frase *«NO se
 *     recortan por período»* pasó a ser falsa **ese día**.
 *
 * ⭐⭐ **Un aviso que se corrige tres veces no tiene un bug, tiene la fuente equivocada.** Las tres
 * veces decidía con **su propio** criterio mientras el motor decidía con otro. Por eso la
 * exigencia sube en vez de bajar: no alcanza con que el texto sea cierto **hoy** — el banco
 * ejercita **la función real del motor** (`periodosQueDescribenLaVentana_`, extraída de
 * `Union.gs`) y afirma que el panel **no tiene un cálculo propio**. Si el motor cambia de
 * criterio, el aviso cambia con él o esto se pone rojo.
 *
 * Uso:
 *   node tools/probar-aviso-ventana.js
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

/**
 * ⭐⭐ **La función con la que el MOTOR decide, extraída de `Union.gs` — no un stub.**
 *
 * Ésta es la mitad que subió la exigencia. Antes el banco falseaba `leerPeriodos` y dejaba que el
 * panel hiciera su propio bucle; medía el texto del aviso y **no** que coincidiera con la
 * decisión. Ahora el aviso corre sobre **la misma función** que `anclarEncuentrosSinCache_`, así
 * que un cambio de criterio del motor llega acá solo.
 *
 * ⚠ Se extrae y no se carga `Union.gs` entero: arrastra medio motor. Y **no se copia el cuerpo**,
 * que sería el fixture inventado en vez de copiado.
 */
function funcionRealDelMotor() {
  const texto = fs.readFileSync(path.join(RAIZ, 'Union.gs'), 'utf8');
  const m = texto.match(/function periodosQueDescribenLaVentana_\([\s\S]*?\r?\n\}/);
  if (!m) throw new Error('No se pudo extraer `periodosQueDescribenLaVentana_` de Union.gs. ' +
    'Sin ella este banco mediría un stub, que es justo lo que vino a dejar de hacer.');
  return m[0];
}

function contexto(periodos, parchear) {
  const ctx = { console, Math, JSON, Date, String, Number, Object, Array, RegExp, isNaN, Error };
  vm.createContext(ctx);
  let texto = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');
  if (parchear) {
    const antes = texto;
    texto = parchear(texto);
    if (texto === antes) throw new Error('El parche de «romper a propósito» no matcheó nada.');
  }
  vm.runInContext(texto, ctx, { filename: 'PanelBackend.gs' });
  // ⭐ La real, después del backend: en Apps Script los dos `.gs` comparten un único scope global.
  vm.runInContext(funcionRealDelMotor(), ctx, { filename: 'Union.gs#periodosQueDescribenLaVentana_' });

  ctx.leerPeriodos = () => periodos;
  // Se replica el contrato mínimo de las dos, no su lógica: lo que se mide es la DECISIÓN del
  // aviso, no cómo se parsea una fecha.
  ctx.parsearFechaCelda_ = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  ctx.formatearFecha_ = (v) => String(v);
  // 14 reuniones con `mostrar=sí`, 12 con período cargado — los números vivos del 22/08.
  ctx.leerReuniones_ = () => {
    const r = [];
    for (let i = 0; i < 12; i++) r.push({ periodo_id: 'julio_24_30' });
    for (let i = 0; i < 2; i++) r.push({ periodo_id: '' });
    return r;
  };
  return ctx;
}

/* Las dos filas reales con la MISMA ventana, copiadas de `PERIODOS` viva el 22/08. La segunda es
 * el P1 de la fila 9: se lee «por defecto» y ninguna reunión la tiene cargada. */
const PERIODOS_VIVOS = {
  'julio_24_30': { desde: '2026-07-24', hasta: '2026-07-30' },
  'agosto_14_20': { desde: '2026-08-14', hasta: '2026-08-20' },
  'vie 14/08 -- jue 20/08 (por defecto)': { desde: '2026-08-14', hasta: '2026-08-20' }
};
const VENTANA_CALCULADA = { ok: true, desde: '2026-08-14', hasta: '2026-08-20', origen: 'R-11 (calculado)' };

console.log('El aviso de ventana propuesta — PanelBackend.gs + la función real de Union.gs\n');

console.log('A · ⭐ con una fila que coincide, el recorte SÍ se aplica y el aviso lo dice');
{
  const ctx = contexto({ 'agosto_14_20': { desde: '2026-08-14', hasta: '2026-08-20' } });
  const a = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA);

  afirmar(a.length === 1, 'sigue diciendo algo — la ventana se calculó y eso vale la pena saberlo');
  const t = a[0].texto;

  /* ⛔ **La afirmación DADA VUELTA.** Hasta el 26/08 este banco exigía que el texto dijera
   * `NO se recortan por período`. Es falso desde el `_25`: con una fila que describe la ventana,
   * `anclarEncuentrosSinCache_` filtra por el conjunto. La frase no se suavizó — se invirtió. */
  afirmar(!/NO se recortan por período/.test(t),
    '⛔ ya NO afirma «las secciones repetibles NO se recortan» — es falso desde el `_25` (22/08)');
  afirmar(/recorte por período \*\*sí\*\* se aplica/.test(t),
    '⭐ dice lo contrario, que es lo que el motor hace: el recorte SÍ se aplica');
  afirmar(/agosto_14_20/.test(t),
    'y nombra el período por el que va a recortar — sin eso el aviso no sirve de nada');

  /* ⭐ **La exigencia nueva: el `nivel`.** Pintar esto en rojo sería un aviso que aparece casi
   * siempre, y un aviso que aparece siempre deja de leerse. */
  afirmar(a[0].nivel === 'info',
    '⭐ y viaja como `info`, no como `aviso`: el recorte se aplica, no hay nada que advertir');

  /* ⚠ La afirmación mide **que no haya un NÚMERO**, no que no aparezca la palabra: el texto
   * sí nombra a las reuniones —dice por qué `periodo_id` entran— y eso está bien. Lo que no puede
   * hacer es contarlas. El caso C, que sí dice «las 14 reunión(es)», la deja roja. */
  afirmar(!/\d+ reuni/.test(t),
    '⚠ y no cuenta reuniones: decir cuántas entran sería reimplementar el filtro que ya corre');
}

console.log('\nB · ⚠ con VARIAS filas de la misma ventana, las nombra a todas');
{
  const ctx = contexto(PERIODOS_VIVOS);
  const a = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA);
  const t = a[0].texto;

  afirmar(/agosto_14_20/.test(t) && /por defecto/.test(t),
    'nombra las DOS que coinciden con la ventana');

  /* ⛔ **La otra afirmación dada vuelta, y ésta es la que más cambió de sentido.** Antes exigía
   * `SIN encuentros`: la advertencia de que elegir la fila 9 vacía el informe. **Eso dejó de ser
   * posible el 22/08**: el `_25` usa el CONJUNTO —*«con el conjunto no hay nada que elegir»*—, así
   * que ya no hay una elección equivocada que hacer. Seguir advirtiéndolo mandaría a la persona a
   * cuidarse de algo que el motor resolvió. */
  afirmar(!/SIN encuentros/.test(t),
    '⛔ ya NO advierte que una elección vacía el informe — el `_25` usa el CONJUNTO, no una fila');
  afirmar(a[0].nivel === 'info', 'y también acá es informativo');
}

console.log('\nC · con ninguna fila que la describa, el aviso de siempre SÍ es cierto');
{
  const ctx = contexto({ 'julio_24_30': { desde: '2026-07-24', hasta: '2026-07-30' } });
  const a = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA);
  const t = a[0].texto;

  /* ⚠ El arreglo no es «sacar la frase»: es decirla **cuando es cierta**. Un banco que sólo
   * afirmara que la frase no aparece nunca pasaría con el aviso vacío. */
  afirmar(/NO se recortan por período/.test(t),
    '⭐ ahí sí la dice — la frase no se borró, se condicionó al caso en que es verdad');
  afirmar(/Ninguna fila de PERIODOS describe la ventana/.test(t),
    'y la causa que declara es la verificada, no el prefijo del `origen`');
  afirmar(/14 reuni/.test(t),
    'con el número adelante — «hay reuniones de otros períodos» y «hay 14» no se leen igual');
  afirmar(a[0].nivel === 'aviso',
    '⭐ y ACÁ sí es `aviso`: es el único de los tres casos que pide hacer algo');
  afirmar(/crear la fila/.test(t), 'y ofrece la salida que corresponde a ese caso');
}

console.log('\nD · una ventana ELEGIDA no dispara ningún aviso');
{
  const ctx = contexto(PERIODOS_VIVOS);
  const a = ctx.avisosDeVentanaPropuesta_({
    ok: true, desde: '2026-08-14', hasta: '2026-08-20', origen: 'periodo_ref:agosto_14_20'
  });
  afirmar(a.length === 0,
    'con override explícito el recorte SÍ se aplica y no hay nada que avisar');
}

console.log('\nE · si PERIODOS no se puede leer, el panel no se cae');
{
  const ctx = contexto(PERIODOS_VIVOS);
  ctx.leerPeriodos = () => { throw new Error('boom'); };
  const a = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA);
  /* ⭐ **Y cae al caso C, que es lo correcto y no una degradación arbitraria:** sin `PERIODOS`
   * legible el motor tampoco filtra —`periodosQueDescribenLaVentana_` devuelve `[]` en su
   * `catch`—, así que el panel y el motor siguen diciendo lo mismo. */
  afirmar(a.length === 1 && /NO se recortan por período/.test(a[0].texto),
    'se degrada al aviso del caso C — y el motor tampoco filtra ahí, así que coinciden');
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * F · ⭐⭐ La exigencia NUEVA: una sola fuente, para que no haya cuarta generación
 * ══════════════════════════════════════════════════════════════════════════════════════════ */
console.log('\nF · ⭐⭐ una sola fuente — lo que impide la cuarta corrección');
{
  const backend = fs.readFileSync(path.join(RAIZ, 'PanelBackend.gs'), 'utf8');

  afirmar(/periodosQueDescribenLaVentana_\(ventana\)/.test(backend),
    '⭐ el aviso llama a `periodosQueDescribenLaVentana_`, que es con la que el motor decide');

  /* ⛔ **Y esto es lo que de verdad cierra el caso.** El bucle que estaba acá era **byte por
   * byte** el mismo que el de `Union.gs`: reproducía bien y decidía distinto. Si alguien lo
   * vuelve a escribir, esto se pone rojo. */
  const bloqueAviso = backend.slice(
    backend.indexOf('function avisosDeVentanaPropuesta_'),
    backend.indexOf('function panel_getEstado'));
  afirmar(bloqueAviso.indexOf('leerPeriodos()') === -1,
    '⛔ y NO tiene un bucle propio sobre `leerPeriodos()` — mientras haya dos cálculos, el ' +
    'cuarto arreglo ya está escrito');
}

console.log('\nG · ⚠ romper a propósito — exigiendo el motivo, no sólo el rojo');
{
  let t = null;
  try {
    /* ⚠ Fragmento de UNA línea: los `.gs` están en CRLF y un patrón con salto de línea no
     * matchea. Ya falló así una vez, el 22/08, y lo cazó la guarda que exige que el parche mute. */
    const ctx = contexto({ 'agosto_14_20': { desde: '2026-08-14', hasta: '2026-08-20' } },
      (x) => x.replace('  var periodosDeLaVentana = periodosQueDescribenLaVentana_(ventana);',
                       '  var periodosDeLaVentana = [];   // ROTO A PROPOSITO'));
    t = ctx.avisosDeVentanaPropuesta_(VENTANA_CALCULADA)[0].texto;
  } catch (e) {
    fallas++; hechas++; console.log('  ❌ el parche falló: ' + e.message);
  }
  /* Sin preguntarle al motor, el aviso vuelve a afirmar que no se recorta — con una fila que
   * describe la ventana, o sea la tercera generación del bug, exacta. */
  afirmar(t !== null && /NO se recortan por período/.test(t),
    '⭐ anulada la consulta al motor, vuelve la afirmación falsa — la sección A mide algo real');
}

console.log('');
console.log(fallas === 0 ? '✅ Las ' + hechas + ' afirmaciones pasaron.'
                         : '❌ ' + fallas + ' de ' + hechas + ' afirmación(es) fallaron.');

console.log('');
console.log('⚠ Lo que este control NO contesta:');
console.log('   · Que el recorte de D-19 funcione. Eso es de `anclarEncuentrosSinCache_`; acá se');
console.log('     verifica que el panel DIGA lo mismo que el motor HACE, no que el motor acierte.');
console.log('   · Que la fila 9 de PERIODOS deje de existir. Es config y la decide el usuario.');
console.log('   · Que la pantalla pinte el `info` distinto del `aviso`. El backend lo declara;');
console.log('     que `Panel.html` lo respete se ve corriendo el panel.');

process.exit(fallas === 0 ? 0 : 1);
