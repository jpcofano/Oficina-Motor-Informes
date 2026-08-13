# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-12, al cerrar el `_42` · último commit al escribirlo: `78fc620`

## Los dos decks vigentes — sin cambios, el `_40` no los tocó

| deck | corrida | período | para qué |
|---|---|---|---|
| **`1K7z5uNT0E_54z22zNUt7fTDL52scCRGlSQtrkruIp2U`** | `jm-20260812-172902` | julio 24–30/07 | **El que se muestra.** 6 pares carátula+detalle, 126 impresiones con valor, 148 s de 350 |
| **`1estvqWRoOwTrBoNP9r4yEjodY2eqE5SMiW49PkujUgY`** | `jm-20260812-174147` | `junio_sem2` | **El selector de período cambia los encuentros.** 3 pares, barrios disjuntos de julio, 104 con valor, 203 s |

⚠ Siguen las **dos filas huérfanas en `CORRIDAS`** por muerte de transporte, con la fila abierta
—sin `fecha_generacion`— como rastro. `CORRIDAS` no tiene fila en `ESCRITORES.md` ni escritor que
cierre una fila existente desde afuera, así que se dejan a propósito.

## Lo último que se hizo — el `_40`, censo de la base nueva

`Base reuniones - Digital - Call Center` (`12b0v67FbxjuIndK7DgVU3MYxx-k0yBIS9gtyV45rFaY`, dueño
`jpcofano2@gmail.com`). **Sólo lectura: la base NO está de alta.** No se tocó `BASES`, `SOLAPAS`,
`MAPEO` ni un marcador. La decisión de darla de alta **está abierta y vuelve con la tabla de A.3**.

**Qué mide.** 152 filas en `Agenda JM`, encabezado en la fila 2, `ID` único y **es el mismo
`id_cuenta` del anclaje**. Las 7 cuentas ancladas de julio y `junio_sem2` tienen fila; ninguna
falta. Sobre 70 celdas: **15 coinciden, 1 difiere, 53 sólo las tiene la base y 1 sólo el motor**.

- **IVR coincide 7/7.** **Mail coincide exacto** con `digital/Directa Mail` donde el motor publica.
- **Impresiones coincide 1/7. Call Center 3/7, y los tres son ceros.**
- Las 42 celdas de Call Center son "sólo la base" porque **esos seis tokens no tienen fila en
  `MARCADORES`** — el hueco de 8 tokens del `_38`.

## Un defecto vivo, no dos — el `_42` corrigió el otro

- **Boedo publica `258.684` de `enc_alcance` y ninguna otra fuente sostiene ese número** — la base
  nueva y `looker` traen la celda vacía, y grepeado el número sobre `docs/` entero, incluidos los
  tres CSV de casos, **no aparece en ningún caso validado**. Sale de la segunda fila de
  `digital/Alcance`; la guarda del `_39` no lo tapa porque **la primera está vacía y entonces no
  hay dos valores distintos**: la guarda cubre el empate, no el hueco.
- ⚠ **Lo de "Orden Público publica ~1/6 de sus mails" era mío y estaba al revés.** `44.043` es el
  valor **validado**: `enc_mails_enviados` lleva `filtro = mail_tipo=Convocatoria`, y la nota de esa
  fila —del 11/08, confirmada hoy contra la hoja viva— ya decía el número y el motivo. La bitácora
  del `_40` lo dejó escrito como defecto y **no se edita** (append-only): la corrección vive en
  `docs/PENDIENTES_consistencia.md` y en la entrada del `_42`.

**Los cuatro hallazgos del censo ya están en `docs/PENDIENTES_consistencia.md`** (`_42`), que es el
dueño de *qué sigue abierto*. Antes estaban sólo en la bitácora, que es el dueño de *qué se hizo*.

## Lo que el censo cerró

**Cuál de las dos filas de `digital/Alcance` es la buena — hay respuesta, de dos fuentes
independientes.** `looker/resumen_metricas_dinamico.meta_alcance` y `Alcance manual` de la base
nueva **coinciden en 6 de 7 cuentas**, y en los cuatro casos ambiguos **las dos eligen la primera**
fila: `3289` 157.580, `3387` **66.345**, `3201` 20.876, `3178` 104.438. Excepción: Retiro (`3346`),
donde la base dice `0` y las otras dos `47.753` — esa fila trae todo el bloque digital en cero.
**Falta la decisión del usuario; el motor no la toma solo.**

⚠ **Y esto no alcanza para escribir la regla, por un motivo que conviene tener a mano:** *"la
primera"* **es orden de lectura de la solapa, no una propiedad del dato** — alguien reordena las
filas y la regla cambia de respuesta sin que nada falle. De paso cae la candidata vieja: *"siempre
la menor"* vale para `3387`, `3201` y `3178`, pero en `3289` los dos testigos eligen **la mayor**.
Los casos ambiguos además **son cuatro, no dos**: `3201` y `3178` no estaban en la sección original.

**Una base nueva no se resuelve con un filtro.** `datosDeMarcador_` cablea la rama por cuenta a
`fila.base_id === 'digital'`, y `parsearCondicionFiltro_` toma el valor **literal** — no hay
marcador de posición para el `id_cuenta` del ítem que se emite. Hace falta **una tercera rama, o
que el ruteo por cuenta pase a ser declarativo** (la dirección de `D-01`).

**`R-24` no se deroga.** Las tres columnas de impresiones de la base parten `Impresiones totales`
exacto en las 7, pero parten un total que difiere del de `looker` en 6 de 7, y tres columnas fijas
no absorben una plataforma nueva ni un `Twitch ` con espacio — el motivo escrito de la regla.

## Pendiente, en orden

- **La rama por cuenta para `looker`** — contraparte exacta de las de `rdv` y `digital`. Destraba
  los 8 tokens sin fila más `enc_impresiones`: las columnas existen y están medidas
  (`call_discado`, `call_contactados`, `digital_impresiones`, `meta_alcance` en
  `resumen_metricas_dinamico`, clave `id_cuentas`). **No se cablea ninguno hasta que exista.**
  El `_40` le agrega peso: es también la forma de generalizar el ruteo por cuenta.
- **El `enc_alcance` de Boedo** — el único defecto vivo que dejó el censo, y está en un deck que se
  muestra.
- **Decidir la fila de `digital/Alcance`** — ahora con dos testigos que coinciden, pero **sigue
  faltando la columna que discrimina**. Hasta que se decida, esas láminas publican `—` con motivo.
- **Decidir si la base nueva se da de alta** — con la tabla de A.3 del `_40` delante.
- **`m2_campanias`** — espera una definición del usuario, no un cableado.
- **`_34`, el censo de `EVENTO`** — dejó de ser bloqueante, sigue valiendo la pena.
- **Los hallazgos de plantilla** en `docs/PENDIENTES_consistencia.md`. El que importa: **la lámina
  modelo de una sección se infiere de los tokens, así que editar la plantilla la mueve en silencio.**
- **`Educación 16/06` no ancla** (0,54 contra umbral 0,6). Decidido por `D-29`: lo resuelve el
  usuario, no el motor, y el umbral no se baja.

## Lo que hay que saber antes de tocar algo

- **`digital` es `snapshot` y el recorte por ventana se decide en dos lugares**: la rama `filtrar`
  de `leerFuente` (`rdv`, `looker`) y el agregado global de `Generador.gs`. **La rama por cuenta no
  recorta**, y es a propósito.
- **`resumen_metricas_dinamico` se recorta por punto y sólo dos marcadores la leen** — `frecuencia`
  y `gcba_frecuencia`. Mapear `fecha_fin_periodo` está medido y descartado.
- **`leerReuniones_` filtra por `periodo_id`**, y el período sale del `origen` de la ventana
  (`periodo_ref:<id>`). **Sin override no se filtra**, y el reporte lo dice.
- **`FALTANTES` cuenta por ítem y la plantilla por token.**
- **El reporte numera las láminas sobre el DECK EXPANDIDO**, no sobre la plantilla.
- ⚠ **El texto de un deck llega aplanado por recorrido de formas: etiqueta y valor viven en cajas
  distintas.** `diagTextoDeDeck_` sirve para ver qué dice una lámina, **no para atribuir un número a
  un token** — en `sl7` la lectura ingenua da *"Alcance Potencial 91.563"* y el `91.563` es de
  `Habitantes del Barrio`. Para eso está `diagMarcadoresDeCuenta_`, que le pregunta al motor.

## Instrumentos nuevos, todos de sólo lectura

| función | para qué |
|---|---|
| `diagEnlaceDigitalDeEncuentros_(periodoRef)` | el censo del `_38`: anclaje por ítem y filas por solapa, con ventana y sin ventana |
| `alcanceDeLaCuenta_(idCuenta, ventana)` | el `Alcance` por la rama por cuenta real, vía `datosDeMarcador_` |
| `diagTextoDeDeck_(deckId, aguja, tope)` | el texto de un **deck ya generado** — con la salvedad de arriba |
| `diagPlanillaExterna_(id)` | `_40`: solapas, filas y columnas de una planilla **no registrada en `BASES`** |
| `diagFormaDeSolapaExterna_(id, solapa, filaEnc, clave, fecha, censo)` | `_40`: encabezados, unicidad de la clave, rango de fechas, filas futuras, valores distintos |
| `diagFilasDeSolapaExterna_(id, solapa, filaEnc, clave, claves)` | `_40`: las filas de unas claves, celda por celda, **con el `typeof` del valor crudo** |
| `diagMarcadoresDeCuenta_(informeId, periodoRef, cuentas, prefijo)` | `_40`: qué publica el motor **por token**, vía `resolverMarcadores`. Varias cuentas en una invocación: el caché de `Fuentes.gs` vive por invocación |

## El patrón que ya lleva seis casos

**Cuando algo parece roto, medir primero cómo se está mirando** — con su borde: vale cuando el
instrumento propio reproduce lógica que el motor ya tiene, **no** cuando se compara la salida del
motor contra un hecho externo.

| se creyó | era |
|---|---|
| `looker` ilegible entero | ventana con fechas en texto |
| los `pauta_*` publican cero | `String(celda)` disfraza un booleano |
| `ignorar` bloquea la lectura | bloquea `buscarMapeo`, no `leerFuente` |
| `Cuentas` no tiene ni un id | el encabezado se llama distinto |
| el `m2` visible está escondido | el reporte numera sobre el deck expandido |
| junio no pierde datos | la sonda medía julio |
| la cuenta no tiene filas de `Digital` | la unión no adjunta la solapa: es `ignorar` |
| **el `6011` de `V-64` era `4726 + 1285`** | **la solapa que lo decía ya no existe: hoy es una sola fila** |
