#!/usr/bin/env node
/**
 * tools/api.js — cliente de la API de pruebas del motor (Paso 1.8).
 *
 * Por qué no curl a secas: las dos credenciales (el Bearer de Google y el
 * `MOTOR_API_TOKEN` de la app) quedarían escritas en la línea de comandos, o sea
 * en el historial del shell y en los logs de la sesión. Acá no salen nunca del
 * proceso: el Bearer lo arma `tools/token.js` y el token de app se lee de `.env`.
 *
 * La URL sale de `docs/ENTORNO.local.md`, que está fuera de git y es la fuente
 * única de direcciones y cuentas.
 *
 * Uso:
 *   node tools/api.js ping
 *   node tools/api.js version
 *   node tools/api.js registros hoja=BASES
 *   node tools/api.js bases
 *   node tools/api.js llamar fn=probarConexionBases
 *   node tools/api.js llamar fn=buscarMapeo args='["m2","M2 periodo DIRECTA","or"]'
 *
 * Opciones:
 *   --get           manda todo por query string en vez de body JSON (prueba doGet)
 *   --token=xxx     pisa el MOTOR_API_TOKEN de .env (para probar el rechazo)
 *   --crudo         imprime la respuesta tal cual vino, sin formatear
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { obtenerToken } = require('./token');

/**
 * Corrida nocturna 04/08 — por qué no `fetch()`: undici corta a los **300 s** esperando
 * los headers (`headersTimeout`) y devuelve un `fetch failed` pelado, sin status y sin
 * distinguirse de una caída de red. `anclarEncuentros()` tarda más que eso, así que toda
 * llamada larga se leía como error de conexión. Node no expone el dispatcher de `fetch`
 * para subirle el límite, así que el pedido va por `node:https`, con el tope puesto arriba
 * del límite de ejecución de Apps Script (6 min) y los redirects seguidos a mano.
 */
const TIMEOUT_MS = 9 * 60 * 1000;

function pedir(url, opciones, saltos) {
  saltos = saltos || 0;
  return new Promise((resolve, reject) => {
    if (saltos > 5) return reject(new Error('demasiados redirects'));

    const pedido = https.request(url, { method: opciones.method || 'GET', headers: opciones.headers }, (res) => {
      const ubicacion = res.headers.location;
      if (ubicacion && res.statusCode >= 300 && res.statusCode < 400) {
        res.resume();
        // 303 —y 302 en la práctica— convierten el POST en GET; el /dev de Apps Script
        // redirige a googleusercontent con la respuesta ya armada.
        let siguiente = opciones;
        if (res.statusCode !== 307 && res.statusCode !== 308) {
          // Sin cuerpo no van sus headers: un GET con `Content-Length` lo rechaza Google
          // con un 400 en HTML, que es justo el modo de falla que este cliente distingue.
          const headers = Object.assign({}, opciones.headers);
          delete headers['Content-Type'];
          delete headers['Content-Length'];
          siguiente = { method: 'GET', headers: headers };
        }
        return resolve(pedir(new URL(ubicacion, url).toString(), siguiente, saltos + 1));
      }

      let texto = '';
      res.setEncoding('utf8');
      res.on('data', (trozo) => { texto += trozo; });
      res.on('end', () => resolve({ status: res.statusCode, contentType: res.headers['content-type'] || '', texto }));
    });

    pedido.setTimeout(TIMEOUT_MS, () => {
      pedido.destroy(new Error('sin respuesta después de ' + (TIMEOUT_MS / 1000) + ' s'));
    });
    pedido.on('error', reject);
    if (opciones.body) pedido.write(opciones.body);
    pedido.end();
  });
}

const RAIZ = path.join(__dirname, '..');
const RUTA_ENV = path.join(RAIZ, '.env');
const RUTA_ENTORNO = path.join(RAIZ, 'docs', 'ENTORNO.local.md');

function leerEnv(clave) {
  if (!fs.existsSync(RUTA_ENV)) throw new Error('Falta .env en la raíz del repo (ver docs/RUNBOOK.md § API de pruebas).');
  const linea = fs.readFileSync(RUTA_ENV, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(clave + '='));
  if (!linea) throw new Error('Falta ' + clave + ' en .env');
  return linea.slice(linea.indexOf('=') + 1).trim();
}

function urlDev() {
  if (!fs.existsSync(RUTA_ENTORNO)) {
    throw new Error('Falta docs/ENTORNO.local.md — es la fuente única de URLs. Ver docs/RUNBOOK.md § API de pruebas.');
  }
  const texto = fs.readFileSync(RUTA_ENTORNO, 'utf8');
  const match = texto.match(/https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/dev/);
  if (!match) throw new Error('No encontré una URL /dev en docs/ENTORNO.local.md');
  return match[0];
}

/** `clave=valor` sueltos en argv; el valor se parsea como JSON si puede. */
function pedidoDeArgv(argv) {
  const pedido = {};
  for (const arg of argv) {
    if (arg.startsWith('--')) continue;
    const i = arg.indexOf('=');
    if (i === -1) continue;
    const clave = arg.slice(0, i);
    const bruto = arg.slice(i + 1);
    try {
      pedido[clave] = JSON.parse(bruto);
    } catch (e) {
      pedido[clave] = bruto;
    }
  }
  return pedido;
}

function opcion(argv, nombre) {
  const flag = argv.find((a) => a === '--' + nombre || a.startsWith('--' + nombre + '='));
  if (!flag) return null;
  return flag.includes('=') ? flag.slice(flag.indexOf('=') + 1) : true;
}

(async () => {
  const argv = process.argv.slice(2);
  const accion = argv.find((a) => !a.startsWith('--') && !a.includes('='));
  if (!accion) {
    console.error('Uso: node tools/api.js <accion> [clave=valor ...] [--get] [--token=xxx] [--crudo]');
    process.exit(2);
  }

  const pisado = opcion(argv, 'token');
  const pedido = Object.assign({ accion }, pedidoDeArgv(argv), {
    token: typeof pisado === 'string' ? pisado : leerEnv('MOTOR_API_TOKEN')
  });

  const bearer = await obtenerToken(false);
  const base = urlDev();
  const porGet = Boolean(opcion(argv, 'get'));

  let url = base;
  let opciones = { headers: { Authorization: 'Bearer ' + bearer } };

  if (porGet) {
    const qs = new URLSearchParams();
    Object.keys(pedido).forEach((k) => qs.set(k, typeof pedido[k] === 'string' ? pedido[k] : JSON.stringify(pedido[k])));
    url = base + '?' + qs.toString();
  } else {
    opciones.method = 'POST';
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(pedido);
    opciones.headers['Content-Length'] = Buffer.byteLength(opciones.body);
  }

  // Corrida nocturna 04/08 — el frontend de Google devuelve, de a ratos y sin patrón, un
  // 404 en HTML o un pedido con el body perdido (el script corre con `accion: (vacía)` y
  // rechaza por token). No es el motor ni la credencial: es transporte, y el reintento lo
  // resuelve. Una respuesta JSON del motor, sea `ok` o no, se devuelve tal cual: eso sí se
  // sabe que corrió.
  //
  // ⚠ **El caso HTML no se puede distinguir** de una corrida que sí ejecutó y cuya
  // respuesta se perdió. Si la llamada escribe, el reintento puede escribir dos veces —
  // hoy eso es un deck de más en la carpeta de salidas, que se borra. Antes de usar este
  // cliente para algo con efecto irreversible, mirar esta línea.
  let respuesta = await pedir(url, opciones);
  for (let intento = 1; intento <= 2; intento++) {
    const esHtml = /^\s*<!DOCTYPE|^\s*<html/i.test(respuesta.texto);
    let cuerpoPerdido = false;
    if (!esHtml) {
      try {
        const previo = JSON.parse(respuesta.texto);
        cuerpoPerdido = previo && previo.ok === false && Array.isArray(previo.traza) &&
          previo.traza.indexOf('accion: (vacía)') !== -1;
      } catch (e) { /* no es JSON: cae por `esHtml` o se reporta abajo */ }
    }
    if (!esHtml && !cuerpoPerdido) break;
    console.error('Transporte: la respuesta ' + (esHtml ? 'vino en HTML (HTTP ' + respuesta.status + ')' : 'llegó sin el pedido') +
      ' — reintento ' + intento + '/2');
    respuesta = await pedir(url, opciones);
  }
  const texto = respuesta.texto;

  if (opcion(argv, 'crudo')) {
    console.log('HTTP ' + respuesta.status + ' ' + respuesta.contentType);
    console.log(texto);
    return;
  }

  let sobre;
  try {
    sobre = JSON.parse(texto);
  } catch (e) {
    // El modo de falla que más importa distinguir: HTML es un problema de
    // autenticación de Google, no del código del motor.
    console.error('La respuesta NO es JSON (HTTP ' + respuesta.status + ', ' + (respuesta.contentType || 'sin content-type') + ').');
    console.error(texto.slice(0, 400));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify(sobre, null, 2));
  if (!sobre.ok) process.exit(1);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
