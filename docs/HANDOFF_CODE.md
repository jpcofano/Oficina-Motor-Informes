# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-16, al cerrar la corrida nocturna `2026-08-16_1` (cinco bloques)

## ▶ Empezar por acá: **`docs/CORRIDAS_pendientes_2026-08-16.md`**

**Es la lista única de lo que hay que apretar hoy**, ordenada por lo que destraba. Reemplaza a la
del 15/08. En resumen, y el detalle está allá:

| # | qué correr | qué destraba | ¿decide el usuario? |
|---|---|---|---|
| **1** | **`testigoDeImpresiones()`** — la Parte C del piloto. **⚠ Leer el canario primero: si `gcba_frecuencia` da `0`, `looker` está recalculando y no se lee nada** | el frente 13, la migración por tandas. **La corrida más importante** | **sí, si no reproduce.** La reversión no se corre por criterio propio |
| **2** | **`censarSolapasParaAlta()`** sobre `looker/CC` — qué columnas, qué títulos, qué letras | el frente 7 (`C-61`), que bloquea el embudo de Call Center | **sí, y es previa:** dónde se inserta la columna |
| **3** | **La Parte A de `R-26`** — no es un botón: es el prompt del 13/08, sólo lectura, y **nunca corrió** | el frente 9, **independiente de todo lo demás** | **sí**, gate explícito antes de la Parte B |
| **4** | *(nada que correr)* — el frente 8 está bloqueado por una **decisión**, no por una medición | — | **sí**, las dos de abajo |
| **5** | una corrida del motor para completar el catálogo de tokens | mejora el frente 14, no bloquea | **sí**, pero de **formato** |

## El estado real, en tres líneas

- **El piloto de `D-33` está MIGRADO y SIN VERIFICAR.** No es "en curso": los ocho marcadores de
  `looker/DIGITAL/Impresiones` tienen `dimensiones` poblada y su `filtro` reducido a
  `estado=Activa`. **La Parte C está abierta porque `looker` estaba recalculando**, no por falta
  de tiempo. **No se revierte** mientras tanto.
- **Los frentes 1, 2, 4 y 6 están hechos** (el alta de las 24 solapas, `D-32`, `D-33`, `D-31`).
  **El primer frente vivo es el 7.**
- **El frente 8 cambió de enunciado**, ver abajo.

⚠ **Dos cosas del 15/08 que hay que saber antes de tocar configuración:**

- **`instalar()` NO siembra contenido.** Crea/repara hojas y aplica `COLUMNAS_DELTA_`. Lo que
  siembra es el ítem de menú **Aplicar configuración**. Equivocarse produce **una corrida que
  termina bien y una hoja que no cambia**.
- **`curarCamposMarcadores_` ahora es todo o nada.** Si una columna de algún cambio no existe, no
  escribe ninguna celda. Está así porque la migración del piloto corrió antes de que existiera
  `dimensiones` y **escribió los ocho `filtro` sin escribir el corte**: los ocho quedaron
  publicando el mismo número **y ninguno fallando**.

## Lo que midió la nocturna del 16/08, y que cambia dos frentes

**`C-61` (frente 7) — el motor lee por POSICIÓN, y el riesgo cambió de signo.** La letra de
`MAPEO` se convierte en índice (`columnaLetraAIndice_`), de ahí sale el título, y con el título se
extrae de la fila: **el encabezado es derivado de la posición, nunca un criterio propio.** Y
**`looker/CC` tiene cero filas de `MAPEO` y cero marcadores**, así que hoy no hay mapeo de `CC`
que un corrimiento pueda romper.

⚠ **El testigo de `D-31` hoy no detecta nada, automáticamente.** Está poblado —154 filas— pero
**`leerMapeoSinCache_` ni siquiera indexa la columna `encabezado`**, y `buscarMapeo` devuelve sólo
`{ hoja, columna }`. **No hay un punto del camino de lectura que compare el título esperado contra
el encontrado.** Es coherente con lo decidido —*"la función que valida se difiere"*, usuario
14/08— y hay que saberlo: **el frente 6 dejó el dato, no la alarma.**

**El frente 8 cambió de enunciado, y el viejo era falso.** *"`enc_*` filtra por tipo de llamado,
`cc_*` no filtra"* es falso en las dos mitades: **no existe ningún marcador `cc_*`** —son tokens
de las láminas 2 y 5 sin fila, que publican `—` por decisión de `_32.2`— **y ningún `enc_*` filtra
por `Tipo de llamado`**; los nueve de Call Center leen `reuniones/Agenda JM` con guardas `!=0`. El
único filtro `Convocatoria` es `mail_tipo=Convocatoria`, que es **mail**. **El enunciado bueno:**
los nueve leen un **agregado por encuentro calculado río arriba y nadie declaró qué tipos de
llamado entran en él**. El corte vive en `reuniones/Call`, hoy **`ignorar`**.

## La cola de prompts

| prompt | estado |
|---|---|
| `2026-08-16_1` — corrida nocturna | **cerrada**, cinco bloques. El 3 paró por premisa falsa, con el motivo escrito |
| `2026-08-15_1` — piloto de `imp_total` | **Partes A y B hechas; la C abierta**, esperando que `looker` se estabilice |
| `2026-08-14_2` — censo de dimensiones y vocabulario global | **cerrado**, `D-33` escrita |
| `2026-08-13_1` — `R-26`, el "1 a 1" sólo digital | **no arrancó.** Independiente; su Parte A puede falsar la premisa |

**El orden de trabajo vive en `PLAN.md` §2.** Este handoff dice dónde estamos; el plan, hacia
dónde; y `CORRIDAS_pendientes_2026-08-16.md`, qué botón se aprieta.

## El catálogo de tokens existe, y su columna verde significa menos de lo que parece

`docs/CATALOGO_tokens.md`, generado por **`tools/catalogo.js`** desde el juego del 15/08. El dueño
de la pregunta es el script re-corrido, no el `.md` (§7).

⚠ **La columna `config` dice sólo que la configuración resuelve.** Da **78 de 78** mientras el
motor publica **diez marcadores en error**: ésos fallan en **ejecución** y ninguna de sus causas
deja rastro en `MARCADORES`, `SOLAPAS` ni `MAPEO`. **No es una contradicción, son dos preguntas** —
y por eso la columna no se llama `estado`.

**`R-26` sigue reservado y libre.** El alcance de Meta tomó `R-27` a propósito; si el "1 a 1"
falsa su premisa, `R-26` queda como hueco y así está bien.

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
- **Los `cc_*` del Resumen Ejecutivo y de la lámina 5 publican `—` y no se cablean** (`_32.2`), y
  `X-21` sigue abierto sobre `looker/CC`. **Medido el 16/08 y conviene tenerlo derecho:** los
  nueve `enc_*` de Call Center **ya no leen `looker`** — leen `reuniones/Agenda JM`. `cc_*` como
  prefijo de token y `cc_*` como prefijo de campo lógico son dos cosas distintas que se llaman
  igual.
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

## El patrón que ya lleva once casos

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
| `campo_id_cuenta` se perdió de la hoja | `leerFilasSolapas_` no la exponía — `String(undefined)` |
| un mapeo apuntaba a la columna equivocada | los encabezados de esa solapa están corridos (`C-09`): la letra estaba bien |
| **`D-32` bloqueaba el alta de solapas** | **`instalar()` no siembra: la corrida era la equivocada** |
| el piloto migrado publicaba mal | **`looker` estaba recalculando**: las ocho cuentas de filas eran idénticas y dos marcadores **sin migrar** se movieron igual o más |
| **`enc_*` y `cc_*` eran dos universos de Call Center conviviendo** | **no existe ningún marcador `cc_*`**: son tokens sin fila que publican `—` por decisión, y ningún `enc_*` filtra por tipo de llamado |
