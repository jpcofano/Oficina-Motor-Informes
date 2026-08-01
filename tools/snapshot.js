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
 * Las diez hojas de registro. Son las mismas —y en el mismo orden— que declara
 * `ALCANCE_REGISTROS_` en `Instalar.gs`. La lista está duplicada a propósito: si
 * la leyera del código bajo prueba, el snapshot dejaría de ser independiente.
 */
const HOJAS = [
  'BASES', 'MAPEO', 'CONFIG', 'INFORMES', 'PERIODOS',
  'SOLAPAS', 'SECCIONES', 'CAMPANAS', 'REUNIONES', 'MARCADORES'
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

(async () => {
  const argv = process.argv.slice(2);
  const fecha = opcion(argv, 'fecha', new Date().toISOString().slice(0, 10));
  const destino = path.resolve(RAIZ, opcion(argv, 'destino', path.join('docs', '_snapshots')));

  fs.mkdirSync(destino, { recursive: true });

  const bearer = await obtenerToken(false);
  const id = idPlanilla();
  const mapa = await gids(id, bearer);

  const faltantes = HOJAS.filter((h) => !mapa[h]);
  if (faltantes.length) throw new Error('No existen en el libro: ' + faltantes.join(', '));

  for (let i = 0; i < HOJAS.length; i++) {
    const hoja = HOJAS[i];
    if (i > 0) await esperar(3000);
    const tsv = (await volcar(id, bearer, mapa[hoja])).replace(/\r\n/g, '\n');
    const archivo = path.join(destino, hoja + '_' + fecha + '.tsv');
    // Sin BOM y con \n: el archivo tiene que diffear limpio.
    fs.writeFileSync(archivo, tsv, 'utf8');
    const lineas = tsv.replace(/\n$/, '').split('\n').length;
    console.log(hoja.padEnd(12) + ' gid ' + mapa[hoja].padStart(12) + ' · ' + String(lineas).padStart(4) + ' líneas → ' + path.basename(archivo));
  }

  console.log('\n' + HOJAS.length + ' hojas volcadas a ' + destino);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
