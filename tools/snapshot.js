#!/usr/bin/env node
/**
 * tools/snapshot.js — vuelca las diez hojas de registro a TSV de texto plano.
 *
 * Por qué NO usa la API del motor (`tools/api.js`, acción `registros`): el punto de
 * un snapshot es tener contra qué comparar si el diff está mal, y ese contra-qué no
 * puede salir del mismo código que se está probando. Acá no interviene ni un `.gs`:
 * se le pide el volcado a Google directo, con el mismo Bearer de `tools/token.js`,
 * por el endpoint de exportación de Sheets. No pasa por `calcularDiffUpsert_`, ni
 * por los `SEED_*`, ni por los lectores de `Config.gs`.
 *
 * Qué sale: exactamente lo que la celda muestra (`export?format=tsv`), una hoja por
 * archivo, con la fecha en el nombre. Texto plano y diffeable — `.gitignore` bloquea
 * `*.xlsx` justamente para que nadie versione la alternativa binaria.
 *
 * El id de la planilla de control sale de `.clasp.json` (`parentId`), que es el
 * mismo libro al que está atado el proyecto de Apps Script. No hay ningún id
 * escrito acá.
 *
 * ⚠ **UN SNAPSHOT NO SE PISA NUNCA** (17/08/2026). Si el archivo del día ya existe y el contenido
 * cambió, el volcado nuevo va a `<HOJA>_<fecha>_<HHMM>.tsv` y **el original queda intacto**. Si el
 * contenido es idéntico, no se escribe nada.
 *
 * **El daño ya ocurrió y por eso esto es así.** Re-correr el script el mismo día sobrescribió
 * `MARCADORES_2026-08-17.tsv` —el estado **pre-migración** de la tanda 4— con el estado posterior.
 * Ese archivo es la línea base que citan los cierres de las tandas 1 a 3 **y de donde salen los
 * filtros de reversión de la 4**: perderlo dejaba las cuatro tandas sin contra-qué. Se recuperó de
 * git, de casualidad.
 *
 * **La propiedad que esto garantiza, y que es la que lo hace evidencia:** un archivo de snapshot
 * **nunca cambia de contenido una vez escrito**. Una cita a `MARCADORES_2026-08-17.tsv` significa
 * hoy lo mismo que dentro de seis meses. Sin eso, la fecha del nombre no ordena nada.
 *
 * Uso:
 *   node tools/snapshot.js                  -> docs/_snapshots/<HOJA>_<AAAA-MM-DD>.tsv
 *   node tools/snapshot.js --destino=ruta   -> a otra carpeta (revisión previa)
 *   node tools/snapshot.js --fecha=AAAA-MM-DD
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { obtenerToken } = require('./token');

const RAIZ = path.join(__dirname, '..');

/**
 * Las once hojas de registro. Son las mismas —y en el mismo orden— que declara
 * `ALCANCE_REGISTROS_` en `Instalar.gs`. La lista está duplicada a propósito: si
 * la leyera del código bajo prueba, el snapshot dejaría de ser independiente.
 *
 * ⚠ `LAMINAS` entró el 10/08. Es además el **respaldo declarado** de esa hoja: no existe
 * ninguna función que copie el spreadsheet de control —`backupPlantilla_` copia Slides—, así
 * que antes de la primera escritura de `escribirColumnaLaminas_` el TSV de acá es la red.
 * Ver `docs/Prompts/2026-08-10_19.1_addendum_alcance.md` §3.1.
 */
const HOJAS = [
  'BASES', 'MAPEO', 'CONFIG', 'INFORMES', 'PERIODOS',
  'SOLAPAS', 'SECCIONES', 'CAMPANAS', 'REUNIONES', 'MARCADORES', 'LAMINAS'
];

function idPlanilla() {
  const clasp = JSON.parse(fs.readFileSync(path.join(RAIZ, '.clasp.json'), 'utf8'));
  if (!clasp.parentId) throw new Error('.clasp.json no tiene `parentId` — no sé qué libro volcar.');
  return clasp.parentId;
}

function opcion(argv, nombre, porDefecto) {
  const flag = argv.find((a) => a.startsWith('--' + nombre + '='));
  return flag ? flag.slice(flag.indexOf('=') + 1) : porDefecto;
}

const dosCifras = (n) => String(n).padStart(2, '0');

/**
 * La fecha **local**, no UTC.
 *
 * ⚠ **`new Date().toISOString()` es UTC y adelantaba un día.** Con la máquina en ART (UTC−3), toda
 * corrida posterior a las **21:00 locales** archivaba con la fecha del día siguiente: la del 17/08
 * a las 22:31 escribió once archivos `*_2026-08-18.tsv`.
 *
 * **No es cosmético.** Estos archivos son evidencia fechada y **la fecha del nombre es lo único que
 * los ordena**: un snapshot adelantado hace que una cita al *"snapshot del 18"* describa el estado
 * del 17. `--fecha` ya permitía corregirlo a mano, pero **un default que hay que acordarse de
 * corregir es deuda de la clase que no falla** — el archivo se escribe igual, con el nombre
 * equivocado, y nada avisa.
 */
function fechaLocal(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + dosCifras(d.getMonth() + 1) + '-' + dosCifras(d.getDate());
}

/** `HHMM` local, para desempatar dos volcados del mismo día. */
function horaLocal(d) {
  return dosCifras(d.getHours()) + dosCifras(d.getMinutes());
}

/**
 * A qué archivo escribir **sin pisar nunca uno que ya existe**.
 *
 * Tres salidas, y la del medio es la que evita ensuciar la carpeta:
 *
 *   - `nuevo` — no había nada con ese nombre;
 *   - `identico` — ya existe y **el contenido es el mismo**: no se escribe nada. Re-correr el
 *     script sobre una hoja quieta no tiene por qué dejar rastro;
 *   - `versionado` — ya existe **con otro contenido**: va a `<HOJA>_<fecha>_<HHMM>.tsv` y el
 *     original **no se toca**.
 *
 * **El primero del día se queda con el nombre pelado, y eso es a propósito:** las citas existentes
 * —`MARCADORES_2026-08-17.tsv` en cuatro documentos— tienen que seguir apuntando a lo mismo. La
 * toma nueva es la que se corre, no la que ya está citada.
 *
 * Puro y sin red: recibe el contenido y el reloj, así que se puede probar sin tocar Google.
 */
function rutaSinPisar(destino, hoja, fecha, tsv, ahora, existe, leer) {
  existe = existe || fs.existsSync;
  leer = leer || ((p) => fs.readFileSync(p, 'utf8'));

  const base = path.join(destino, hoja + '_' + fecha + '.tsv');
  if (!existe(base)) return { archivo: base, estado: 'nuevo' };
  if (leer(base) === tsv) return { archivo: base, estado: 'identico' };

  // Dos volcados distintos en el mismo minuto: se agregan segundos antes que pisar.
  let candidato = path.join(destino, hoja + '_' + fecha + '_' + horaLocal(ahora) + '.tsv');
  if (existe(candidato)) {
    candidato = path.join(destino, hoja + '_' + fecha + '_' + horaLocal(ahora) +
      dosCifras(ahora.getSeconds()) + '.tsv');
  }
  return { archivo: candidato, estado: 'versionado', preservado: base };
}

/**
 * Mapa nombre de solapa -> gid. La exportación a TSV pide `gid`, no nombre.
 * `htmlview` los trae en un bloque `items.push({name: "...", ... gid: "..."})`.
 */
async function gids(id, bearer) {
  const r = await fetch('https://docs.google.com/spreadsheets/d/' + id + '/htmlview', {
    headers: { Authorization: 'Bearer ' + bearer },
    redirect: 'follow'
  });
  if (!r.ok) throw new Error('htmlview devolvió HTTP ' + r.status);
  const html = await r.text();

  const mapa = {};
  for (const m of html.matchAll(/items\.push\(\{name:\s*"((?:[^"\\]|\\.)*)"[\s\S]{0,400}?gid:\s*"(\d+)"/g)) {
    mapa[JSON.parse('"' + m[1] + '"')] = m[2];
  }
  if (!Object.keys(mapa).length) {
    throw new Error('No pude leer ninguna solapa de htmlview — cambió el formato de la página.');
  }
  return mapa;
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Diez exportaciones seguidas dan 429: el endpoint de exportación de Sheets tiene
 * cuota por minuto y es más estricta que la de la API. Espera entre pedidos y
 * reintenta con backoff, en vez de dejar el volcado a medias — un snapshot con
 * cinco hojas de diez es peor que ninguno, porque parece completo.
 */
async function volcar(id, bearer, gid) {
  const url = 'https://docs.google.com/spreadsheets/d/' + id + '/export?format=tsv&gid=' + gid;

  for (let intento = 1; intento <= 5; intento++) {
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + bearer }, redirect: 'follow' });
    if (r.status === 429) {
      const espera = intento * 15000;
      console.error('  429 — espero ' + (espera / 1000) + ' s y reintento (' + intento + '/5)');
      await esperar(espera);
      continue;
    }
    const tipo = r.headers.get('content-type') || '';
    if (!r.ok) throw new Error('export devolvió HTTP ' + r.status);
    if (tipo.indexOf('tab-separated') === -1) {
      // Igual que en tools/api.js: HTML acá es un problema de autenticación, no de datos.
      throw new Error('export no devolvió TSV sino ' + tipo + ' — revisar el Bearer.');
    }
    return await r.text();
  }

  throw new Error('export siguió devolviendo 429 después de 5 intentos.');
}

async function principal() {
  const argv = process.argv.slice(2);
  const ahora = new Date();
  const fecha = opcion(argv, 'fecha', fechaLocal(ahora));
  const destino = path.resolve(RAIZ, opcion(argv, 'destino', path.join('docs', '_snapshots')));

  fs.mkdirSync(destino, { recursive: true });

  const bearer = await obtenerToken(false);
  const id = idPlanilla();
  const mapa = await gids(id, bearer);

  const faltantes = HOJAS.filter((h) => !mapa[h]);
  if (faltantes.length) throw new Error('No existen en el libro: ' + faltantes.join(', '));

  const versionados = [];
  const identicos = [];

  for (let i = 0; i < HOJAS.length; i++) {
    const hoja = HOJAS[i];
    if (i > 0) await esperar(3000);
    const tsv = (await volcar(id, bearer, mapa[hoja])).replace(/\r\n/g, '\n');
    const r = rutaSinPisar(destino, hoja, fecha, tsv, ahora);
    const lineas = tsv.replace(/\n$/, '').split('\n').length;
    const cabeza = hoja.padEnd(12) + ' gid ' + mapa[hoja].padStart(12) + ' · ' +
      String(lineas).padStart(4) + ' líneas → ';

    if (r.estado === 'identico') {
      identicos.push(hoja);
      console.log(cabeza + '(sin cambios, no se reescribe ' + path.basename(r.archivo) + ')');
      continue;
    }
    // Sin BOM y con \n: el archivo tiene que diffear limpio.
    fs.writeFileSync(r.archivo, tsv, 'utf8');
    if (r.estado === 'versionado') versionados.push({ hoja: hoja, nuevo: r.archivo, previo: r.preservado });
    console.log(cabeza + path.basename(r.archivo) + (r.estado === 'versionado' ? '   ⚠ VERSIONADO' : ''));
  }

  console.log('\n' + HOJAS.length + ' hojas volcadas a ' + destino);
  if (identicos.length) {
    console.log('Sin cambios (' + identicos.length + '): ' + identicos.join(', '));
  }

  /* ⚠ **El aviso va ÚLTIMO y explica qué significa**, no sólo que pasó. Un `⚠` en el medio de la
   * lista se lee como ruido — es la misma lección que el testigo de la tanda 4, donde un aviso
   * quedó sepultado arriba de un `✅` y pasó inadvertido dos corridas. */
  if (versionados.length) {
    console.log('\n⚠ ' + versionados.length + ' hoja(s) YA TENÍAN snapshot de ' + fecha +
      ' con OTRO contenido. **No se pisó ninguno.**');
    versionados.forEach((v) => {
      console.log('   · ' + v.hoja + ': se conservó ' + path.basename(v.previo) +
        ' y la toma nueva quedó en ' + path.basename(v.nuevo));
    });
    console.log('   El archivo con el nombre pelado sigue siendo el de la PRIMERA toma del día,');
    console.log('   que es a la que apuntan las citas ya escritas. Si lo que querías era la foto');
    console.log('   nueva, citá el archivo con hora.');
  }
}

if (require.main === module) {
  principal().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

module.exports = { fechaLocal, horaLocal, rutaSinPisar, HOJAS };
