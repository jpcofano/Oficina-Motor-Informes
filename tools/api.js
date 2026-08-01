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
const { obtenerToken } = require('./token');

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
  let opciones = { headers: { Authorization: 'Bearer ' + bearer }, redirect: 'follow' };

  if (porGet) {
    const qs = new URLSearchParams();
    Object.keys(pedido).forEach((k) => qs.set(k, typeof pedido[k] === 'string' ? pedido[k] : JSON.stringify(pedido[k])));
    url = base + '?' + qs.toString();
  } else {
    opciones.method = 'POST';
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(pedido);
  }

  const respuesta = await fetch(url, opciones);
  const texto = await respuesta.text();

  if (opcion(argv, 'crudo')) {
    console.log('HTTP ' + respuesta.status + ' ' + (respuesta.headers.get('content-type') || ''));
    console.log(texto);
    return;
  }

  let sobre;
  try {
    sobre = JSON.parse(texto);
  } catch (e) {
    // El modo de falla que más importa distinguir: HTML es un problema de
    // autenticación de Google, no del código del motor.
    console.error('La respuesta NO es JSON (HTTP ' + respuesta.status + ', ' + (respuesta.headers.get('content-type') || 'sin content-type') + ').');
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
