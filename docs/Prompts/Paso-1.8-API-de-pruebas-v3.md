# Paso 1.8 — API de pruebas sobre `/dev` (v3)

**Objetivo:** que Claude Code pueda invocar funciones del motor contra HEAD y leer
el resultado, sin deploy versionado y sin intervención manual en cada ciclo.

**Depende de:** Paso 0 y Paso 1 (hojas registro + lector + `abrirBase`).
**No toca:** `Marcadores.gs`, `Fuentes.gs`, `Registros.gs` ni ningún cálculo.

**Decisión de diseño:** se usa la URL `/dev` (HEAD), no `/exec`. `/dev` refleja el
último `clasp push` sin republicar, y Google exige sesión con permiso de edición
sobre el script antes de que corra nuestro código. Esa exigencia es la que habilita
la acción `llamar` con nombre de función dinámico: el endpoint no es alcanzable
anónimamente. `clasp deploy` no se usa en este paso.

---

## Regla de oro (aplica también acá)

Toda la aritmética vive solo en `Marcadores.gs`. `Api.gs` enruta y serializa: no
calcula, no lee celdas directo, no arma fechas.

---

## 1. `Api.gs` en la raíz

### 1.1 Entradas

- `doGet(e)` y `doPost(e)` → ambos delegan en `manejarPedido_(e)`.
- Pedido unificado: `e.postData.contents` parseado como JSON si existe y es válido;
  `e.parameter` para lo que falte.

Apps Script no lee headers HTTP custom. El `Authorization: Bearer` lo consume la
infraestructura de Google antes de llegar acá — no intentar leerlo desde el código.
`API_TOKEN` va por query string o body.

### 1.2 Doble barrera de autenticación

Las dos condiciones se evalúan **siempre**, en este orden, antes de cualquier acción:

**Barrera 1 — identidad.** `const mail = Session.getActiveUser().getEmail();`

- En `/dev` devuelve el mail del que llama (Google ya validó el Bearer).
- En `/exec` anónimo devuelve string vacío.

Constante `AUTORIZADOS` con la lista de mails permitidos (arrancar con el mail que
indique el usuario). Si `mail` está vacío o no figura en la lista → `ok:false`,
`error:'no autorizado'`, cortar.

**Barrera 2 — token.** Comparar `pedido.token` contra
`PropertiesService.getScriptProperties().getProperty('API_TOKEN')`.

- Si la propiedad no está seteada → rechazar. Nunca dejar pasar por ausencia.
- Comparación de longitud fija: recorrer todos los caracteres acumulando
  diferencias, sin cortar en el primer mismatch.
- El token nunca se escribe en código, en `appsscript.json`, en la traza ni en un
  mensaje de error. Si apareciera, enmascarar.

### 1.3 Acciones

| acción | qué hace |
|---|---|
| `ping` | `{ pong: true, mail, fecha }` — verifica las dos barreras de una |
| `version` | versión del motor + hoja de control en uso |
| `registros` | dump de una hoja registro; param `hoja` |
| `bases` | resultado de `probarConexionBases()` |
| `llamar` | invoca una función del motor por nombre |

Acción desconocida → `ok:false` + lista de acciones válidas.

### 1.4 Acción `llamar`

Params: `fn` (string) y `args` (array, opcional, default `[]`).

- Resolver con `this[fn]` y validar `typeof === 'function'`. Si no existe →
  `ok:false`, `error:'funcion no encontrada: <fn>'`.
- Invocar con `fn.apply(null, args)`.
- **Guard adicional:** rechazar `doGet`, `doPost` y `manejarPedido_` (recursión).
- Traza: nombre de la función y cantidad de args. No los valores.

**Serialización del retorno.** Pasar el resultado por `serializar_(v)` que:

- Devuelve primitivas y `null` tal cual.
- `Date` → ISO string.
- Arrays y objetos planos → recursivo, tope de profundidad 5.
- Lo que no sobreviva a `JSON.stringify` (`Spreadsheet`, `Range`, `Presentation`) →
  `'[objeto no serializable]'` + `Object.prototype.toString.call(v)`.

Las funciones `void` devuelven `null` por diseño: para probar una, hay que hacer que
retorne algo. Documentarlo en el RUNBOOK.

### 1.5 Traza y respuesta

Array `traza` que se llena durante el pedido (acción, función invocada, hojas
abiertas, ms totales) y se devuelve **siempre**, en éxito y en error. Es el único log
que ve quien llama por HTTP.

Salida: `ContentService.createTextOutput(JSON.stringify(...))` con
`.setMimeType(ContentService.MimeType.JSON)`.

Apps Script no permite setear status HTTP: todo sale 200, el estado va en el JSON.

```json
{ "ok": true, "accion": "llamar", "resultado": {}, "traza": ["..."], "ms": 123 }
```

En error: mismo sobre con `"ok": false` y `"error": "mensaje"`, sin `resultado`.

Todo `manejarPedido_` dentro de `try/catch`. Una excepción no atrapada devuelve HTML
y rompe al cliente. El `catch` devuelve el sobre con `ok:false`, `err.message`,
`err.stack` si existe, y la traza acumulada.

---

## 2. `appsscript.json`

```json
"webapp": { "access": "ANYONE_ANONYMOUS", "executeAs": "USER_DEPLOYING" }
```

`ANYONE_ANONYMOUS` acá no abre nada: `/dev` sigue exigiendo sesión con permiso de
edición, y la Barrera 1 rechaza cualquier llamada sin mail. La misma config sirve
después para el Paso 6.

Declarar los `oauthScopes` explícitamente (Sheets, Slides, Drive). Si no, Google los
infiere distinto en cada push y obliga a re-autorizar sin aviso.

---

## 3. Helper de access token (`tools/token.js`)

Script Node que imprime un access token por stdout:

1. Leer `~/.clasprc.json` (Windows: `%USERPROFILE%\.clasprc.json`).
   **Inspeccionar la estructura real antes de escribir el parser** — clasp 2.x y 3.x
   guardan `refresh_token`, `client_id` y `client_secret` en rutas distintas.
2. POST a `https://oauth2.googleapis.com/token` con `grant_type=refresh_token` + los
   tres campos.
3. Imprimir `access_token`.

Cachear en `tools/.token-cache.json` con su `expires_at`; refrescar solo si vencido o
si la llamada anterior dio 401.

---

## 4. `docs/ENTORNO.local.md` — fuente única de direcciones y cuentas

Crear este archivo **fuera de git**. Es donde viven las URLs y la referencia a las
credenciales. Ninguno de estos valores se repite en `RUNBOOK.md`, en `PROYECTO.md`,
en `.env` ni en comentarios del código.

Estructura, con dos ranuras:

```markdown
# Entorno — Motor de Informes
> Archivo local, fuera de git. Si clonaste el repo limpio, este archivo no existe:
> reconstruilo con los datos del editor de Apps Script.

## Web app

| uso | URL | cuenta que ejecuta | quién la llama | verificada |
|---|---|---|---|---|
| pruebas (HEAD) | `.../macros/s/<SCRIPT_ID>/dev` | <cuenta robot> | Claude Code | <fecha> |
| producción | *(pendiente — Paso 6)* | <cuenta robot> | cuenta de reportes | — |

## Credenciales
- `API_TOKEN` → Propiedades del script en el editor. No se copia acá.
- Bearer de Claude Code → derivado de `~/.clasprc.json` por `tools/token.js`.

## Notas
- `/dev` solo responde a cuentas con permiso de **edición** sobre el script.
  La cuenta de reportes **no** puede usar esta URL: va a usar `/exec` desde el Paso 6.
- La URL `/dev` se puede reconstruir siempre desde el `scriptId` de `.clasp.json`.
```

El usuario completa los valores. Code lee este archivo para armar sus llamadas.

`.env` en la raíz guarda únicamente `MOTOR_API_TOKEN`.

---

## 5. `.gitignore` y `.claspignore`

Agregar al `.gitignore`:

```
docs/ENTORNO.local.md
.env
tools/.token-cache.json
.clasprc.json
```

Renombrar `claspignore` → `.claspignore`, e incluir `Plan Inicial/`, `docs/`,
`tools/`, `*.md`, `.env`.

---

## 6. `docs/RUNBOOK.md`

Sección **"API de pruebas"** con la operatoria, **sin valores concretos**:

- Qué es `/dev` y por qué no se usa `clasp deploy` en este paso.
- Tabla de acciones (la de 1.3), a mantener a medida que crecen los pasos.
- Ciclo de trabajo: `clasp push` → `llamar` → leer JSON.
- Las dos barreras y dónde vive cada credencial.
- **Puntero explícito:** URLs y cuentas están en `docs/ENTORNO.local.md`, que no está
  versionado. Incluir cómo reconstruirlo en un clon limpio (el `scriptId` de
  `.clasp.json` + la URL `/dev` que muestra *Implementar → Probar implementaciones*).
- Cuándo hace falta re-autorizar a mano: solo al agregar un scope nuevo.
- La nota sobre funciones `void` y objetos no serializables.

Actualizar el estado del paso en `Plan Inicial/PROYECTO.md`.

---

## 7. Prueba de aceptación

Code toma la URL de `docs/ENTORNO.local.md` y el token de `.env`.

```bash
TOKEN=$(node tools/token.js)
URL=<url /dev de ENTORNO.local.md>

# 1. ping — valida las dos barreras
curl -L -H "Authorization: Bearer $TOKEN" "$URL?accion=ping&token=$MOTOR_API_TOKEN"

# 2. token de app inválido → ok:false, "no autorizado"
curl -L -H "Authorization: Bearer $TOKEN" "$URL?accion=ping&token=xx"

# 3. llamar a una función real del Paso 1
curl -L -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"accion\":\"llamar\",\"fn\":\"probarConexionBases\",\"args\":[],\"token\":\"$MOTOR_API_TOKEN\"}" \
  "$URL"

# 4. función inexistente → ok:false, "funcion no encontrada"
```

En Windows/PowerShell usar `curl.exe`, no `curl`.

**Pasa cuando:** las cuatro devuelven JSON válido (nunca HTML), `ping` reporta el
mail correcto, `llamar` devuelve lo mismo que el menú de la planilla, y ninguna
respuesta contiene el `API_TOKEN`.

### Si falla con 401 / 403 y devuelve HTML

No es el código: es el scope del access token.

1. Confirmar que el refresh dio un token (imprimirlo truncado).
2. Verificar el scope: `https://oauth2.googleapis.com/tokeninfo?access_token=<token>`.
3. Si no incluye un scope que Google acepte para `/dev`, no insistir con `.clasprc.json`.

**Plan B:** token de OAuth Playground con scope
`https://www.googleapis.com/auth/drive`, guardado en `.env` como `MOTOR_BEARER`.
Dura una hora — sirve para confirmar que el resto funciona.

**Plan C:** pasar a `clasp run` (proyecto GCP estándar + Apps Script API +
`clasp login --creds`). Reportarlo antes de empezar, no arrancarlo por cuenta propia.

---

## 8. Fuera de alcance

- Generación de Slides (Paso 4–5).
- HTML e interfaz (Paso 6).
- `clasp deploy` y URLs `/exec` (Paso 6, publicando desde el editor).
- Escritura en las hojas vía API: `llamar` se usa solo con funciones de lectura y
  cálculo.
