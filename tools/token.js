#!/usr/bin/env node
/**
 * tools/token.js — imprime por stdout un access token de Google válido, derivado
 * del refresh token que ya guardó `clasp login`. Paso 1.8.
 *
 * Por qué existe: la URL /dev del proyecto sólo responde a una sesión con permiso
 * de edición sobre el script. Desde curl eso se resuelve con un
 * `Authorization: Bearer <access_token>`, y el único lugar donde ya hay
 * credenciales de esa cuenta es ~/.clasprc.json.
 *
 * Qué NO hace: no imprime el refresh token, ni el client_secret, ni el id_token.
 * Sólo el access token, que dura una hora.
 *
 * Estructura real de ~/.clasprc.json (clasp 3.3.0, verificada el 01/08/2026):
 *   { "tokens": { "default": { client_id, client_secret, refresh_token,
 *                              access_token, expiry_date, ... } } }
 * clasp 2.x lo guardaba plano en la raíz del archivo, con el par en `oauth2ClientSettings`.
 * Se contemplan las dos formas.
 *
 * Uso:
 *   node tools/token.js            -> imprime el access token
 *   node tools/token.js --info     -> imprime cuenta y scopes del token (sin el token)
 *   node tools/token.js --forzar   -> ignora el cache y refresca
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const RUTA_CLASPRC = path.join(os.homedir(), '.clasprc.json');
const RUTA_CACHE = path.join(__dirname, '.token-cache.json');
const MARGEN_MS = 60 * 1000; // se refresca un minuto antes del vencimiento

function credenciales() {
  if (!fs.existsSync(RUTA_CLASPRC)) {
    throw new Error('No existe ' + RUTA_CLASPRC + ' — correr `clasp login` primero.');
  }
  const crudo = JSON.parse(fs.readFileSync(RUTA_CLASPRC, 'utf8'));

  // clasp 3.x
  if (crudo.tokens && crudo.tokens.default) {
    const t = crudo.tokens.default;
    return {
      client_id: t.client_id,
      client_secret: t.client_secret,
      refresh_token: t.refresh_token
    };
  }

  // clasp 2.x
  if (crudo.token && crudo.oauth2ClientSettings) {
    return {
      client_id: crudo.oauth2ClientSettings.clientId,
      client_secret: crudo.oauth2ClientSettings.clientSecret,
      refresh_token: crudo.token.refresh_token
    };
  }

  throw new Error('No reconozco la estructura de ' + RUTA_CLASPRC + ' — claves de primer nivel: ' + Object.keys(crudo).join(', '));
}

function cacheVigente() {
  if (!fs.existsSync(RUTA_CACHE)) return null;
  try {
    const cache = JSON.parse(fs.readFileSync(RUTA_CACHE, 'utf8'));
    if (!cache.access_token || !cache.expires_at) return null;
    if (Date.now() + MARGEN_MS >= cache.expires_at) return null;
    return cache.access_token;
  } catch (e) {
    return null;
  }
}

async function refrescar() {
  const cred = credenciales();
  for (const clave of ['client_id', 'client_secret', 'refresh_token']) {
    if (!cred[clave]) throw new Error('Falta `' + clave + '` en ' + RUTA_CLASPRC);
  }

  const respuesta = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: cred.client_id,
      client_secret: cred.client_secret,
      refresh_token: cred.refresh_token
    })
  });

  const cuerpo = await respuesta.json();
  if (!respuesta.ok || !cuerpo.access_token) {
    // El cuerpo de error de Google no trae secretos, sólo error/error_description.
    throw new Error('El refresh falló (' + respuesta.status + '): ' + JSON.stringify(cuerpo));
  }

  const expiresAt = Date.now() + (cuerpo.expires_in || 3600) * 1000;
  fs.writeFileSync(RUTA_CACHE, JSON.stringify({ access_token: cuerpo.access_token, expires_at: expiresAt }, null, 2));
  return cuerpo.access_token;
}

async function obtenerToken(forzar) {
  if (!forzar) {
    const vigente = cacheVigente();
    if (vigente) return vigente;
  }
  return refrescar();
}

async function info(token) {
  const r = await fetch('https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(token));
  const j = await r.json();
  // Nunca se imprime el token: sólo a quién pertenece y qué puede hacer.
  console.log('cuenta : ' + (j.email || '(sin email en el token)'));
  console.log('expira : ' + (j.expires_in || '?') + ' s');
  console.log('scopes :');
  String(j.scope || '').split(' ').filter(Boolean).sort().forEach((s) => console.log('  ' + s));
}

module.exports = { obtenerToken };

// Sólo corre como CLI; `require('./token')` desde tools/api.js no imprime nada.
if (require.main !== module) return;

(async () => {
  try {
    const argv = process.argv.slice(2);
    const token = await obtenerToken(argv.includes('--forzar'));
    if (argv.includes('--info')) {
      await info(token);
      return;
    }
    process.stdout.write(token);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
