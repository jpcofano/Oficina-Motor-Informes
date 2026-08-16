# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-16, al cerrar la segunda corrida nocturna `2026-08-16_3`

## ⭐ La decisión que ordena todo: **primero se cierra la migración, después se cablea**

Usuario, 16/08. La secuencia viva es **una sola línea y no tiene ramas**:

```
Parte C del piloto  →  12 bis (conectar el testigo de D-31)  →  tanda 1
```

**El frente 7 (`C-61`) y el 8 bajaron a `PLAN.md` §3 como bloqueados por esa decisión**, no como
pendientes sueltos. **Los `cc_*` siguen publicando `—` por `_32.2`** — eso está decidido y no se
reabre.

## ▶ Empezar por acá: **`docs/CORRIDAS_pendientes_2026-08-16.md`**

**Es la lista única de lo que hay que apretar hoy**, ordenada por lo que destraba. Reemplaza a la
del 15/08. En resumen, y el detalle está allá:

| # | qué correr | qué destraba | ¿decide el usuario? |
|---|---|---|---|
| ~~1~~ | ~~**`testigoDeImpresiones()`** — la Parte C del piloto~~ | ✅ **corrida el 16/08 11:58. El piloto pasó** y el frente 13 quedó autorizado | — |
| **1 bis** | **`verificarEncabezadosDeMapeo()`** — el testigo de `D-31`, **ya conectado anoche**. Barre todo `MAPEO` sin generar informe | nada, pero es la **primera medición** de una guarda que ya está en el código | **sólo si encuentra algo** |
| **1 ter** | **La tanda 1** — prompt escrito, `2026-08-16_4`. **No es corrida: el usuario lo revisa antes** | el frente 13. Su precondición dura es la Parte C | **sí**, lo revisa antes |
| **2** | **La Parte A de `R-26`** — no es un botón: es el prompt del 13/08, sólo lectura, y **nunca corrió** | el frente 9, **independiente de todo lo demás** | **sí**, gate explícito antes de la Parte B |
| **3** | **`censarSolapasParaAlta()`** sobre `looker/CC` — sólo lectura, se puede adelantar | el frente 7, hoy **diferido detrás de la migración** | la decisión de **dónde se inserta la columna** está **diferida** |
| **3 bis** | **`censarTokensEnPlantilla()`** + el testigo, para los `pauta_*` — prompt `2026-08-16_5`, **el usuario lo revisa antes** | saca a los `pauta_*` del limbo: no entran a ninguna tanda | **sí, después de medir** |
| **4** | una corrida del motor para completar el catálogo de tokens | mejora el frente 14, no bloquea | **sí**, pero de **formato** |
| — | *(nada que correr para el frente 8)* — bloqueado por una **decisión**, no por una medición | — | **media tomada:** los `cc_*` siguen en `—` |

**El orden:** `R-26` está arriba porque es lo único **independiente de la migración**, y el censo
de `looker/CC` abajo porque lo que destrabaría está diferido.

## El estado real, en tres líneas

- ✅ **El piloto de `D-33` PASÓ — 16/08/2026 11:58.** Los ocho de `looker/DIGITAL/Impresiones`
  quedan migrados y verificados: **ocho cuentas de filas idénticas**, descuadre **cero** en los
  dos ámbitos, y el canario sin migrar (`frecuencia` 12,63 → 13,20) confirmando desde afuera que
  **se movió la base, no el motor**. **Esto autoriza el frente 13.**
  - ⚠ **No se verificó por igualdad de valores, y no se podía**: con `looker` recibiendo datos de
    una ventana ya cerrada, el valor absoluto no es un testigo estable. Se verificó por
    **identidad de filas + descuadre + canario**. Los ocho números de hoy **son distintos** a los
    del testigo, y eso está bien. **No leerlo como una comparación exacta que nunca hubo.**
- **Los frentes 1, 2, 4 y 6 están hechos** (el alta de las 24 solapas, `D-32`, `D-33`, `D-31`).
- ✅ **El frente 12 bis está HECHO** (noche del 16/08): el testigo de `D-31` **está conectado**.
  Lo que falta es su primera medición contra la planilla, que es la 1 bis de la lista.
- **El frente 8 cambió de enunciado** —el viejo era falso— y bajó a bloqueado, ver abajo.

⚠ **`frecuencia`/`gcba_frecuencia` SALEN de la tanda 1, y el motivo hay que saberlo.** Medido el
16/08: **`looker` tiene exactamente diez marcadores** —los ocho del piloto y ese par—, así que si
la tanda 1 se los lleva **quedan cero marcadores de `looker` sin migrar** y se pierde el canario
de la base que demostró moverse. **La tanda 1 queda en `mail_*`/`gcba_mail_*`**, que además viven
en `digital/Directa Mail` y **nunca necesitaron un canario de `looker`**: necesitan uno de
`digital`, y ahí sí hay —los cuatro grupos de `digital/Directa IVR`, con `filtro` vacío, que no se
migran en ninguna tanda. **Lo que generaliza: la propiedad de un canario no es "nunca migrado",
es "no lo toca el cambio que estoy midiendo".**

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

✅ **El testigo de `D-31` ya detecta — conectado la noche del 16/08.** `leerMapeoSinCache_` indexa
`encabezado` (ésa era la causa raíz: la columna existía desde el 14/08 y no la leía nadie), la
comparación vive en `encabezadoEnColumna_`, y **el aviso sale por el cierre de corrida**.

Tres cosas que hay que saber antes de leer un aviso suyo:

- **El valor devuelto NO cambia nunca.** La letra manda y el testigo **no es fallback jamás** —
  los títulos se repiten, así que un fallback por título acertaría a veces y erraría en silencio
  otras.
- **Compara rótulos, NO contenido.** Detecta que la columna **se movió**, no que el dato esté mal.
  En `RDV_otros_ministros` los encabezados están corridos **en origen** (`C-09`) y ahí va a
  coincidir siempre. **Cero desalineadas no quiere decir que los datos estén bien.**
- **El comparador recibe una LISTA de esperados**, y eso está medido: hay **12 grupos
  (base, solapa, letra) con más de una fila** porque dos `campo_logico` pueden apuntar a la misma
  columna. Tratarlo como valor único habría dado avisos falsos sobre doce grupos el primer día, y
  **una alarma que grita de entrada es una alarma apagada**.

Control positivo: `node tools/probar-encabezado.js` — 13 afirmaciones, **fuera de Apps Script y
extrayendo el código real del repo**, no una copia.

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
| `2026-08-16_3` — segunda corrida nocturna | **cerrada**, tres bloques. El 1 ejecutó el `_2` entero |
| `2026-08-16_2` — conectar el testigo de `D-31` | **ejecutado.** Falta su medición contra la planilla |
| `2026-08-16_4` — tanda 1 de la migración | **escrito, sin ejecutar.** El usuario lo revisa. Precondición dura: la Parte C |
| `2026-08-16_5` — los `pauta_*` duplicados | **escrito, sin ejecutar.** El usuario lo revisa. Es validación, no migración |
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
