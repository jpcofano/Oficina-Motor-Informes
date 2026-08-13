# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-13, al cerrar el `_45` · último commit al escribirlo: `346acf1`

## Los dos decks vigentes — recién generados, con los ocho tokens nuevos

| deck | corrida | período | qué tiene |
|---|---|---|---|
| **`12nlfJZfccD_kIS4UxAdYzqsvo7fNuHDFct4NsMH3csY`** | `jm-20260813-070639` | julio 24–30/07 | **El que se muestra.** 6 pares, **142 impresiones con valor** (eran 126), 188 tokens distintos, 214 filas en `FALTANTES`, 199 s |
| **`1iu2KSIp13JLr4fbgwGrIAyuVwFxDGTE3qY4LRRgB148`** | `jm-20260813-072331` | `junio_sem2` | El selector de período cambia los encuentros. 145 filas en `FALTANTES` |

**Reemplazan a `jm-20260812-172902` y `jm-20260812-174147`.** La diferencia son los ocho tokens del
`_44`: el embudo de Call Center, `enc_alcance_potencial`, `enc_alcance_pct` y `enc_impresiones`.

⚠ **La corrida de `junio_sem2` volvió en HTML y NO se reintentó** (escribe). Se verificó contra
`CORRIDAS` que **sí ejecutó y cerró**: sólo se perdió la respuesta HTTP.

## El panel ya es web app, y hay un paso manual pendiente

`doGet` **despacha por la presencia de `accion`**: con `accion` va a la API de pruebas, sin `accion`
sirve `Panel.html`. Era un bloqueante real — `doGet` es uno solo en todo el proyecto y un segundo
en otro archivo **habría pisado al primero en silencio** (`CLAUDE.md` §1).

**Falta desplegar `/exec` a mano** desde el editor de Apps Script, y al hacerlo:

- ⚠ **`appsscript.json` declara `access: ANYONE_ANONYMOUS`.** `servirPanel_` aplica la barrera de
  mail de la API —la de token no sirve para un navegador— así que hoy un anónimo recibe *"esta
  cuenta no tiene acceso"*. Igual, **el `access` hay que cambiarlo al publicar**.
- `executeAs` define con qué cuenta corre el motor.

## Lo que quedó cableado y lo que publica

**Nueve marcadores** contra la base nueva `reuniones/Agenda JM`, verificados en el deck:

| lámina | qué publica ahora |
|---|---|
| Villa Urquiza | `5387` BBDD · `4726` Base llamada · `1380 (29.2%)` Contactados · `1181 (85.6%)` Efectivos · `4.656.054` Impresiones · `531.900` Alcance Potencial |
| San Cristóbal | `42.500` Impresiones · `41.240` Alcance Potencial · `1.412 (3.4%)` |
| Orden Público | `2.293.110` Impresiones · `1.400.000` Alcance Potencial · embudo en `—` |
| Retiro | Alcance y Audiencia; impresiones en `—` (la base trae 0) |

**El `—` de Orden Público es la decisión, no una falla.** `Agenda JM` declara cero en los cuatro
campos de Call Center con el resto de la fila cargada, y publicar `0` sería una afirmación falsa
(`C-58`). Se implementa con `filtro = campo!=0`.

## Lo que hay que saber antes de tocar algo

- **`SOLAPAS.campo_id_cuenta` (`D-30`)** es lo que hace que un marcador lea la fila de SU encuentro.
  Vacío en las 84 filas salvo las dos de `reuniones`. **Sin `id_cuenta` el marcador falla con
  motivo**, no cae a leer la solapa entera.
- **La supresión del recorte por ventana va por parámetro de `leerFuente`, no por columna.**
  `resumen_metricas_dinamico` se lee por cuenta *y* como agregado semanal: apagárselo al agregado le
  daría la suma de todos los períodos.
- ⚠ **`encabezadoEnColumna_` usaba `BASES.fila_encabezado` y ahora usa `resolverFilaEncabezado_`.**
  Era el bug que el comentario del `_23` había dejado escrito sin arreglar. Síntoma: los marcadores
  salen `sin_datos` con la fila cargada y el filtro bien. **El síntoma no se parece a la causa.**
- **`looker/CC` y `looker/DIGITAL` están `uso = fuente` y ninguna de las dos es legible**: sin
  `fecha_periodo` en `MAPEO` y sin columna de fecha que mapear. `Base enviada` es un **serial
  disfrazado de fecha** (`C-54`).
- **`digital` es `snapshot` y la rama por cuenta no recorta**, a propósito.
- **`FALTANTES` cuenta por ítem y la plantilla por token.**
- **El texto de un deck llega aplanado por recorrido de formas**: `diagTextoDeDeck_` sirve para ver
  qué dice una lámina, **no para atribuir un número a un token**. Para eso está
  `diagMarcadoresDeCuenta_`.

## Pendiente, en orden

- **Desplegar `/exec` y arreglar el `access`** — es lo único que falta para que el panel se use.
- **`enc_alcance` sigue en `—`** mientras la regla de `digital/Alcance` esté abierta. `C-51` la
  reencuadró: las dos filas son **PRE y POST**, no dos definiciones. Lo que falta es cómo se
  combinan, y eso es `A-12`.
- **El `enc_alcance` de Boedo** — publica `258.684` y ninguna otra fuente lo sostiene.
- **Los `enc_*` de Call Center del Resumen Ejecutivo** siguen en `looker`: `X-21` está abierto —la
  lámina publica dos de las tres filas de `looker/CC` y nada dice cuál queda afuera—.
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
| **los marcadores nuevos salen `sin_datos`** | **dos funciones resolvían la fila de encabezado distinto** |
