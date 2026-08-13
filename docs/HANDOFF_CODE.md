# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-13, al cerrar el `_46` · último commit al escribirlo: `8317e99`

## El panel ya es una web app usable, con un problema de acceso abierto

**URL `/exec`** (despliegue `@1`, creado el 13/08):

```
https://script.google.com/macros/s/AKfycbwr2JinpHmrw2UVbQHafyUiAZbD9bbsZoB1zy35xw3Y2omTCmI9VZ4brbKbi6Vh4lac/exec
```

`appsscript.json` declara `access: ANYONE` (cuenta de Google, ya no anónimo) y
`executeAs: USER_DEPLOYING`.

⚠ **Sólo entra la cuenta dueña.** Las otras tres de la lista reciben la pantalla de rechazo. Lo
está midiendo el `_48` Parte A. **Candidato, nombrado como candidato:** con `executeAs:
USER_DEPLOYING` y cuentas de consumidor, `Session.getActiveUser().getEmail()` puede devolver vacío
para quien no sea el dueño del script — la barrera nunca vería el mail contra el cual comparar. No
es lo único que puede ser.

⚠ **El panel muestra el mismo deck cambie o no el período.** `CORRIDAS` guarda `periodo_id` pero
`panel_ultimasCorridas` no lo devuelve. Es la Parte B del `_48`.

## La Barrera 1 lee `CONFIG`, y falla cerrada

`CONFIG.mails_autorizados` — lista separada por comas. Reemplazó a `API_AUTORIZADOS_`, que estaba
cableada en `Api.gs`. **Pieza 1 de `D-16`**; las piezas 2 y 3 siguen abiertas.

| qué pasó | motivo en la traza |
|---|---|
| la hoja no se pudo leer (incluida "no hay planilla atada") | `config ilegible` |
| la clave no existe en `CONFIG` | `clave ausente` |
| la celda está vacía, o son puras comas | `lista vacía` |

**Ninguno cae a un default de código.** Una lista vacía deja afuera a todo el mundo, incluido el
dueño — es lo contrario de `centinelas_lectura`, y a propósito.

Editar la celda **tiene efecto en el pedido siguiente**: el caché de `leerConfig` es una variable de
módulo que muere con cada ejecución y está apagada fuera de `generarInforme`. No hay que esperar ni
limpiar nada.

## Lo que hay que saber antes de tocar algo

- **Una guarda que lee configuración se despliega DESPUÉS de que esa configuración exista.** El
  `_46` pusheó la barrera antes de sembrar la clave y cerró la API para todos: **el sembrador de
  `CONFIG` se alcanza sólo pasando la barrera**. La salida es en dos fases (seed primero, guarda
  después). `clasp run` no es alternativa — el proyecto no está desplegado como API executable.
- **`tools/api.js` pega a `/dev`, que NO es un despliegue**: es HEAD, y Google lo restringe a
  cuentas con permiso de edición sobre el script. Cambiar `webapp.access` no lo afecta — medido el
  13/08 después del push, no razonado.
- **`SOLAPAS.campo_id_cuenta` (`D-30`)** es lo que hace que un marcador lea la fila de SU encuentro.
  Vacío en las 84 filas salvo las dos de `reuniones`. **Sin `id_cuenta` el marcador falla con
  motivo**, no cae a leer la solapa entera.
- **La supresión del recorte por ventana va por parámetro de `leerFuente`, no por columna.**
  `resumen_metricas_dinamico` se lee por cuenta *y* como agregado semanal: apagárselo al agregado le
  daría la suma de todos los períodos.
- ⚠ **`encabezadoEnColumna_` usaba `BASES.fila_encabezado` y ahora usa `resolverFilaEncabezado_`.**
  Síntoma: los marcadores salen `sin_datos` con la fila cargada y el filtro bien. **El síntoma no se
  parece a la causa.**
- **`looker/CC` y `looker/DIGITAL` están `uso = fuente` y ninguna de las dos es legible**: sin
  `fecha_periodo` en `MAPEO` y sin columna de fecha que mapear. `Base enviada` es un **serial
  disfrazado de fecha** (`C-54`).
- **`digital` es `snapshot` y la rama por cuenta no recorta**, a propósito.
- **`FALTANTES` cuenta por ítem y la plantilla por token.**
- **El texto de un deck llega aplanado por recorrido de formas**: `diagTextoDeDeck_` sirve para ver
  qué dice una lámina, **no para atribuir un número a un token**. Para eso está
  `diagMarcadoresDeCuenta_`.

## Los dos decks vigentes

| deck | corrida | período |
|---|---|---|
| **`12nlfJZfccD_kIS4UxAdYzqsvo7fNuHDFct4NsMH3csY`** | `jm-20260813-070639` | julio 24–30/07 — **el que se muestra** |
| **`1iu2KSIp13JLr4fbgwGrIAyuVwFxDGTE3qY4LRRgB148`** | `jm-20260813-072331` | `junio_sem2` |

Sirven de fixture para la Parte B del `_48`: son dos períodos distintos en `CORRIDAS`.

## Pendiente, en orden

- **El `_48`** — acceso de las otras tres cuentas (A), deck por período (B), textos de la
  interfaz (C), censo de secciones (D).
- **`enc_alcance` sigue en `—`** mientras la regla de `digital/Alcance` esté abierta. `C-51` la
  reencuadró: las dos filas son **PRE y POST**, no dos definiciones. Lo que falta es cómo se
  combinan, y eso es `A-12`.
- **El `enc_alcance` de Boedo** — publica `258.684` y ninguna otra fuente lo sostiene.
- **Los `enc_*` de Call Center del Resumen Ejecutivo** siguen en `looker`: `X-21` está abierto.
- **`m2_campanias`** — espera una definición del usuario.
- **`Educación 16/06` no ancla** (0,54 contra 0,6). `D-29`: lo resuelve el usuario.

## Instrumentos, todos de sólo lectura

| función | para qué |
|---|---|
| `diagEnlaceDigitalDeEncuentros_(periodoRef)` | anclaje por ítem y filas por solapa |
| `diagMarcadoresDeCuenta_(informeId, periodoRef, cuentas, prefijo)` | **qué publica el motor por token**, vía `resolverMarcadores` |
| `diagTextoDeDeck_(deckId, aguja, tope)` | el texto de un deck generado — con la salvedad de arriba |
| `diagPlanillaExterna_` · `diagFormaDeSolapaExterna_` · `diagFilasDeSolapaExterna_` | censar una planilla **no registrada en `BASES`**, con el `typeof` del valor crudo |
| `alcanceDeLaCuenta_(idCuenta, ventana)` | el `Alcance` por la rama por cuenta real |

## El patrón que ya lleva ocho casos

**Cuando algo parece roto, medir primero cómo se está mirando** — con su borde: vale cuando el
instrumento propio reproduce lógica que el motor ya tiene, **no** cuando se compara la salida del
motor contra un hecho externo.

| se creyó | era |
|---|---|
| `looker` ilegible entero | ventana con fechas en texto |
| los `pauta_*` publican cero | `String(celda)` disfraza un booleano |
| `ignorar` bloquea la lectura | bloquea `buscarMapeo`, no `leerFuente` |
| `Cuentas` no tiene ni un id | el encabezado se llama distinto |
| junio no pierde datos | la sonda medía julio |
| la cuenta no tiene filas de `Digital` | la unión no adjunta la solapa: es `ignorar` |
| el `6011` de `V-64` era una cita vencida | era correcto: miré la solapa equivocada |
| los marcadores nuevos salen `sin_datos` | dos funciones resolvían la fila de encabezado distinto |
| **`tools/api.js` postea sin sesión de Google** | **manda un Bearer, y además pega a `/dev`, que no es un despliegue** |
