# Paso 1.8-B — Scopes explícitos + zona horaria + re-autorización

> **Bloqueante.** "Registrar plantillas" ve la carpeta vacía aunque los permisos de
> Drive estén bien (el robot es Editor y las plantillas son Slides nativas). La causa
> es que **la autorización guardada quedó vieja**: se autorizó el script cuando el
> código todavía no usaba `DriveApp`, y Apps Script congela los scopes al momento de
> autorizar. Google no vuelve a pedirlos solo.
>
> **Evidencia:** `Session.getEffectiveUser()` falló con
> `Specified permissions are not sufficient … Required: userinfo.email`. Ese error es
> de **scope**, no de Drive — confirma que el token concedido se quedó corto.
>
> **Regla de oro:** este paso no calcula nada. Solo config del proyecto.
>
> **Un commit.**

---

## Parte 1 — `appsscript.json`

Hoy:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

Dejalo así:

```json
{
  "timeZone": "America/Argentina/Buenos_Aires",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}
```

Por qué cada uno:

- **`timeZone`** → `America/Argentina/Buenos_Aires`. No es cosmético: desde el Paso 2 el
  motor filtra por ventana de fechas, y `new Date()`, la lectura de celdas de fecha y
  `Utilities.formatDate()` usan la zona del proyecto. Con New York (3 h de offset) los
  registros del borde del período caen del lado equivocado y los totales dan mal **sin
  tirar ningún error**.
- **`drive`** (no `drive.file`) → el motor abre bases y plantillas **por ID** que no creó
  el script, y `registrarPlantillasDesdeCarpeta()` enumera una carpeta ajena.
  `drive.file` solo da acceso a lo que la app creó: **con ese scope la carpeta se ve
  vacía**, que es exactamente el síntoma.
- **`presentations`** → `SlidesApp` en el Paso 4.
- **`spreadsheets`** → bases y hojas de config.
- **`script.container.ui`** → menú y sidebar.
- **`userinfo.email`** → `Session.getEffectiveUser()`, necesario para diagnosticar bajo
  qué cuenta corre el script.

> **No agregues** `script.scriptapp` ni `send_mail` todavía: son del Paso 10 (trigger
> semanal y aviso por mail). Se suman cuando ese paso llegue.

Después de editar: **`clasp push`**.

---

## Parte 2 — Función de diagnóstico

Dejá esta función en `Instalar.gs` (no en `Automatizacion.gs`, que es del Paso 10):

```javascript
function diagnosticoDrive() {
  Logger.log('Cuenta efectiva: ' + Session.getEffectiveUser().getEmail());

  var id = '1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi'; // carpeta_plantillas
  var carpeta = DriveApp.getFolderById(id);
  Logger.log('Carpeta: ' + carpeta.getName());

  var n = 0;
  var it = carpeta.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    n++;
    Logger.log(f.getName() + ' | ' + f.getMimeType() + ' | ' + f.getId());
  }
  Logger.log('Total archivos: ' + n);

  var c = 0;
  var itc = carpeta.getFolders();
  while (itc.hasNext()) { c++; Logger.log('Subcarpeta: ' + itc.next().getName()); }
  Logger.log('Total subcarpetas: ' + c);
}
```

Es temporal: cuando el registro de plantillas funcione, se puede borrar o dejar como
herramienta de soporte.

---

## Parte 3 — Forzar la re-autorización (lo hace el usuario, no Code)

**Declarar los scopes no alcanza.** Mientras exista una autorización previa, Apps Script
la reutiliza y nunca pide los permisos nuevos. Hay que revocarla:

1. Entrar a `myaccount.google.com` **con la cuenta `jpcofanogcba1`**.
2. **Seguridad** → *Aplicaciones de terceros con acceso a tu cuenta* (o
   *Acceso de terceros*).
3. Buscar **"Motor de Informes"** → **Quitar acceso**.
4. Volver al editor de Apps Script y correr `diagnosticoDrive`.
5. Ahora sí aparece la pantalla de autorización **con todos los scopes juntos**.
   Aceptar. (Si sale "Google no verificó esta aplicación": *Configuración avanzada* →
   *Ir a Motor de Informes*. Es esperable en un script propio sin verificar.)

---

## Prueba del usuario

1. `clasp push` → confirmar en el editor que `appsscript.json` tiene los 5 scopes y la
   zona horaria de Buenos Aires. (Si el editor no muestra el manifiesto:
   ⚙ Configuración → *Mostrar "appsscript.json"*.)
2. Revocar el acceso (Parte 3) y correr `diagnosticoDrive`.
3. En el log tienen que aparecer:
   - `Cuenta efectiva: jpcofanogcba1@gmail.com` ← **si dice otra cosa, avisá: el script
     no corre con la cuenta que creemos y eso cambia todo el diagnóstico.**
   - `JM_marcada | application/vnd.google-apps.presentation | <id>`
   - `SECCO_marcada | application/vnd.google-apps.presentation | <id>`
   - `Total archivos: 2`
4. Menú → **"Registrar plantillas"** → `INFORMES.plantilla_id` cargado en `jm` y `secco`.

---

## Si después de esto sigue en 0 archivos

Entonces no es scope ni autorización, y hay que mirar otra cosa. Reportá el log completo
antes de tocar más código. **No sigas ajustando `registrarPlantillasDesdeCarpeta`**: si
`diagnosticoDrive` no ve los archivos, el problema no está en esa función.

**Camino alternativo, siempre disponible:** copiar el ID de cada plantilla desde su URL
(`/presentation/d/ESTE_ID/edit`) y pegarlo a mano en `INFORMES.plantilla_id`. Son dos
celdas, y el motor consume el ID de la fila — el escaneo de carpeta es una comodidad,
no arquitectura. **Esto no debe bloquear el avance al Paso 2.**

---

## Commit

```
Paso 1.8-B ✅ — oauthScopes explícitos + timeZone Buenos Aires + diagnóstico Drive
```
