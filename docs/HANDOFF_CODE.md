# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-14, al cerrar el `_5` · último commit al escribirlo: `7d05047`

## Dónde estamos: la cola del 14/08, y qué de ella ya corrió

**`_1`, `_4` y `_5` ejecutados; los otros tres no.**

| prompt | estado |
|---|---|
| `2026-08-14_1` — métricas por plataforma de `reuniones` | **ejecutado** (Partes A, A2 y B). `alc_real` mapeado en las dos solapas; `CAMPAÑAS_DESGLOCE_DIGITAL` restituida a `fuente` |
| `2026-08-14_4` — las decisiones sueltas | **ejecutado con un punto frenado** — ver abajo |
| `2026-08-14_5` — el orden de los frentes a `PLAN.md` | **ejecutado.** Los 13 frentes están en `PLAN.md` §2, al frente y con el criterio del orden |
| `2026-08-14_3` — el sembrador no degrada en silencio | pendiente; se apoya en `S-05`, que ya está escrito |
| `2026-08-13_1` — `R-26`, el "1 a 1" sólo digital | pendiente e independiente. **Su Parte A puede falsar la premisa**; si eso pasa, no se escribe nada |
| `2026-08-14_2` — censo de dimensiones y vocabulario global | va **después** de los cuatro |

**El orden de trabajo ya no vive acá: vive en `PLAN.md` §2.** Este handoff dice dónde estamos;
el plan dice hacia dónde. Los tramos `T2.x`…`T5.x` **no se retiraron** — siguen siendo la
especificación de cada pieza; lo que cambió es que el orden lo fija la lista de frentes.

**`R-26` está reservado y libre.** Lo pide el prompt del "1 a 1". El alcance de Meta del `_4`
tomó `R-27` a propósito para no pisarlo; si el "1 a 1" falsa su premisa, `R-26` queda como
**hueco** y así está bien — los IDs no se reutilizan.

## ⚠ Trabado: el alta de las 20 solapas de `reuniones`

**Falta el dato, no la decisión.** El censo de la Parte A2 del `_1` midió las 20 solapas nuevas
y **su reporte quedó en la conversación, no en el repo**: sólo están nombradas las **tres**
excepciones del Addendum 2 —`Desglose impresiones`, `Métricas digital`, `Digital | Base Post`—
y ninguna de las otras 17. Sin la lista no se pueden escribir 19 filas `ignorar` con el motivo
concreto de cada una, y **el motivo inventado es peor que la fila que falta**.

**Qué lo destraba, en orden:**

1. **La lista de las 20 solapas con el motivo de cada una** — del reporte de la Parte A2, o
   re-medida sobre la planilla `12b0v67FbxjuIndK7DgVU3MYxx-k0yBIS9gtyV45rFaY` con
   `diagPlanillaExterna_`.
2. **La medición de las tres excepciones** que el Addendum 2 pide hacer **antes** de
   clasificarlas. El `_4` la da por hecha (*"0 de 25 Uno a uno"*) y no está registrada.
3. **La confirmación del usuario.** El Addendum 2: *"El alta de `SOLAPAS` es una decisión del
   usuario y se confirma antes de escribir."*

El reparto que cierra es **`Base_Digital` en `referencia` + 3 excepciones + 16 = 20** sobre 24
solapas totales. El *"otras 17"* del Addendum 2 del `_1` está corrido en uno.

## El panel es una web app usable, y el acceso está decidido así a propósito

**URL `/exec`** (despliegue `@3`, 13/08):

```
https://script.google.com/macros/s/AKfycbwr2JinpHmrw2UVbQHafyUiAZbD9bbsZoB1zy35xw3Y2omTCmI9VZ4brbKbi6Vh4lac/exec
```

`appsscript.json` declara `access: ANYONE` (cuenta de Google, ya no anónimo) y
`executeAs: USER_DEPLOYING`.

⚠ **Entra sólo la cuenta dueña, y eso NO es un bug abierto.** Medido el 13/08: con
`USER_DEPLOYING` sobre cuentas de consumidor, `Session.getActiveUser().getEmail()` vuelve vacío,
así que la barrera nunca ve el mail — la lista de `CONFIG` está bien cargada y bien leída. **El
usuario decidió dejarlo así**: hoy entra el dueño y con eso se muestra. La identidad de las otras
cuentas se decide más adelante, con `D-15` y su precondición `T4.1` sobre la mesa. **No anotarlo
como defecto ni "arreglarlo" de paso.**

`D-15` ya había decidido `USER_ACCESSING` y por este motivo exacto. Lo desplegado la contradice,
y es deliberado. **`T4.1` sigue sin medirse**: pedía medir con *"ejecuta el usuario que accede"*,
y lo del 13/08 se midió con *"ejecuta yo"*.

**El rechazo del panel muestra un código de motivo** —`sin identidad`, `fuera de lista`, `clave
ausente`, `lista vacía`, `config ilegible`— sin ningún mail en pantalla; el mail va al log. Es la
única vía de diagnóstico porque `clasp logs` no anda: el proyecto no tiene GCP propio.

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

- **`CORRIDAS.periodo_id` tiene dos vocabularios**, y quien empareje contra esa columna tiene que
  saberlo: `abrirCorrida_` escribe `periodoId || ventana.origen`, o sea un id de `PERIODOS` si
  alguien lo eligió, y la **etiqueta de origen** de la cadena si no. Las cuatro corridas medidas
  el 13/08 traen ids, pero la etiqueta puede aparecer igual. El panel lo resuelve buscando el
  período registrado **cuya ventana coincide** con la que el motor resolvería hoy.
- **`clasp push` no mueve el `/exec`.** Sirve HEAD, que es `/dev`. El panel vive en un despliegue
  versionado: después de pushear hay que `clasp deploy --deploymentId <id>` sobre el mismo id
  para no cambiar la URL. Sin eso el usuario prueba código viejo y la medición sale falsa.
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

- **La identidad de las otras tres cuentas**, cuando el usuario lo retome: `D-15`, su precondición
  `T4.1` sin medir, y el costo de `USER_ACCESSING`. **No arrancarlo por cuenta propia.**
- **El selector de secciones de `jm`** — `panel_getEstado()` devuelve las mismas tres secciones
  para `jm` y para `secco`, así que la diferencia que se reportó no está en el backend. Si sigue
  apareciendo, hay que mirar el render.
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
