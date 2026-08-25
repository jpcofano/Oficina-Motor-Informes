/**
 * `tools/suites.js` — **corre TODOS los bancos y decide por CÓDIGO DE SALIDA.**
 *
 * ⛔⛔ **Existe por un caso medido el 25/08/2026, y es el instrumento con el que se valida todo lo
 * demás.** Hasta ese día las suites se corrían con un `for` improvisado que buscaba el glifo `❌` en
 * la salida. **Hay bancos que reportan su veredicto con `⛔`**, así que el detector **no los veía**:
 * contaba **uno** en rojo donde había **cuatro**.
 *
 * ⭐ **La forma general, que es lo que hay que retener:** un detector que busca un **símbolo**
 * depende de que **todos** los emisores usen el mismo, **y nadie lo garantiza**. **El exit code es
 * un contrato; un glifo en un log es una convención.**
 *
 * ⚠ **Y por eso esto es un archivo y no una línea que cada uno reescribe:** el método vivía en la
 * cabeza de quien corría, así que nada lo fijaba. Acá el criterio está en un solo lugar y el
 * próximo **no se tiene que acordar** — el mismo argumento que pone la guarda en el escritor y no
 * en el llamador.
 *
 * Corre con:  node tools/suites.js
 *             node tools/suites.js --verbose    (imprime la salida de las que fallan)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const RAIZ = path.join(__dirname, '..');
const VERBOSE = process.argv.indexOf('--verbose') !== -1;

const bancos = fs.readdirSync(__dirname)
  .filter((f) => /^probar-.*\.js$/.test(f))
  .sort();

const rojos = [];
const verdes = [];
let afirmaciones = 0;

bancos.forEach((f) => {
  const r = cp.spawnSync(process.execPath, [path.join(__dirname, f)],
    { cwd: RAIZ, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

  /* ⭐⭐ **El veredicto es `status`, y nada más.** No se mira la salida, no se busca ningún glifo:
   * un banco puede escribir `❌`, `⛔`, `FAIL` o nada, y el contrato sigue siendo el mismo. */
  const ok = r.status === 0;
  (ok ? verdes : rojos).push({ archivo: f, status: r.status, salida: (r.stdout || '') + (r.stderr || '') });

  /* Cuánto midió cada banco, para poder decir el total. ⚠ Es **informativo**: sale de leer el
   * texto, así que un banco que cambie su formato deja de aportar — y eso **no** afecta al
   * veredicto, que es el punto. */
  const m = /(\d+)\s+de\s+(\d+)\s+verificadas/.exec(r.stdout || '') ||
            /Las?\s+(\d+)\s+afirmaciones?\s+pasaron/.exec(r.stdout || '');
  if (m) afirmaciones += Number(m[1]);
});

console.log('SUITES · ' + bancos.length + ' bancos · veredicto por CÓDIGO DE SALIDA\n');

if (rojos.length) {
  rojos.forEach((x) => {
    console.log('  ⛔ ROJO (exit ' + x.status + ')  ' + x.archivo);
    if (VERBOSE) {
      console.log(x.salida.split('\n').map((l) => '        ' + l).join('\n'));
    } else {
      /* Sin `--verbose`, las líneas que el propio banco marcó como fallo — como pista, no como
       * criterio. ⚠ Acá SÍ se buscan los dos glifos, y está bien: es para **mostrar**, y ya se
       * sabe que el banco falló. */
      const pistas = x.salida.split('\n').filter((l) => /❌|⛔/.test(l)).slice(0, 3);
      pistas.forEach((l) => console.log('        ' + l.trim()));
    }
  });
  console.log('');
}

console.log((rojos.length ? '⛔ ' + rojos.length + ' banco(s) EN ROJO' : '✅ los ' + verdes.length + ' bancos pasaron') +
  '  ·  ~' + afirmaciones + ' afirmaciones');

if (!bancos.length) {
  /* ⭐ **Cero bancos es un problema, no un silencio.** Sin esto, un patrón que dejara de matchear
   * daría «✅ los 0 bancos pasaron» — el mismo modo de falla que este archivo vino a cerrar. */
  console.log('⛔ NO SE ENCONTRÓ NINGÚN BANCO. El patrón `probar-*.js` no matcheó nada: esto NO es');
  console.log('   «todo bien», es «no se corrió nada».');
  process.exit(1);
}

console.log('\n⚠ Lo que este runner NO contesta:');
console.log('   · Si los bancos verifican lo CORRECTO. Dice que ninguno falló, no que cubran algo.');
console.log('   · El conteo de afirmaciones sale de leer el texto y es informativo: un banco que');
console.log('     cambie su formato deja de sumar, y eso no afecta al veredicto.');
console.log('   · Nada sobre `tools/listas.js` ni los `medir-*`: corren aparte.');

process.exit(rojos.length ? 1 : 0);
