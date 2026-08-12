# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-12, al cerrar el `_39` · último commit al escribirlo: `428d786`

## Los dos decks vigentes — los dos con carátula y con `enc_alcance`

| deck | corrida | período | para qué |
|---|---|---|---|
| **`1K7z5uNT0E_54z22zNUt7fTDL52scCRGlSQtrkruIp2U`** | `jm-20260812-172902` | julio 24–30/07 | **El que se muestra.** 6 pares carátula+detalle, 126 impresiones con valor, 148 s de 350 |
| **`1estvqWRoOwTrBoNP9r4yEjodY2eqE5SMiW49PkujUgY`** | `jm-20260812-174147` | `junio_sem2` | **El selector de período cambia los encuentros.** 3 pares, barrios disjuntos de julio, 104 con valor, 203 s |

Los dos salieron de una sola pasada cada uno, con la casilla de `—` tildada y
`comunicaciones_post` afuera por `D-27` (`opciones.secciones = ["encuentro","campana"]`).

**Reemplazan a `jm-20260812-164443`**, que tenía la carátula pero no `enc_alcance` (122 contra 126).
Los anteriores —`110746`, `234158`, `234622`— quedan superados.

⚠ Siguen las **dos filas huérfanas en `CORRIDAS`** por muerte de transporte, con la fila abierta
—sin `fecha_generacion`— como rastro. `CORRIDAS` no tiene fila en `ESCRITORES.md` ni escritor que
cierre una fila existente desde afuera, así que se dejan a propósito.

## Qué cambió en las últimas horas

**`enc_alcance` cambió de solapa** (`_39` Parte B): de `digital/Digital` —`uso = ignorar` por
`R-22`, congelada en diciembre de 2025— a **`digital/Alcance`**, campo `alc_alcance`. Lo valida
`D-06`: Orden Público 28/07 = `66345` exacto. Publica **1.412** en San Cristóbal y **47.753** en
Retiro.

**`opULTIMO` ya no elige por posición cuando no hay fecha** (`_39`). Sin fecha utilizable y con
valores distintos devuelve `«FALTA:@ultimo_sin_fecha_ambiguo»`. Sin esto, `enc_alcance` habría
publicado `457.883` en Orden Público en vez de `66.345` — 7× más grande y plausible. Por eso Villa
Urquiza y Belgrano salen `—`: **es la guarda funcionando, no una falta.**

**El control de `Pruebas.gs:456` decía una cosa y probaba otra** y quedó partido en dos, más la
guarda y su contraste. Las 13 pruebas pasan.

## Lo que se midió y cierra preguntas viejas

**Por qué la lámina de encuentro sale casi vacía** (`_38`, censo de los seis ítems):

- **Los seis anclan.** Cero `sinLink`, cero `bajaConfianza`. Cinco con puntaje `1.00`.
- **La ventana no recorta nada en la rama por cuenta.** `con_ventana` y `sin_ventana` dieron
  idénticos en las 30 celdas. `digital` es `snapshot` y la rama por cuenta de `datosDeMarcador_`
  no lleva `recortar_por_ventana`.
- **La causa real es que el dato no existe.** San Cristóbal (`3354`) y Retiro (`3346`) traen cero
  filas de Mail, SMS e IVR **en toda la base**, no sólo en la ventana. Se barrieron las solapas
  enteras. Esos tokens publican `—` para siempre y está bien que lo hagan.
- **Y una cuarta causa, la más grande, que no tiene que ver con el enlace:** de los 30 tokens de la
  lámina modelo (`L-035`, orden 7), **8 no tienen fila en `MARCADORES`** — los cuatro `enc_ll_*`,
  `enc_base_llamada`, `enc_base_total`, `enc_alcance_pct`, `enc_alcance_potencial`.

**Un cero de la unión no es un cero de la cuenta.** `digital/Digital` es `ignorar`, así que
`buscarMapeo` falla y **la unión no adjunta esa solapa a ninguna cuenta**. El instrumento del `_38`
lo dice ahora antes de contar.

## Pendiente, en orden

- **La rama por cuenta para `looker`** — contraparte exacta de las de `rdv` y `digital`. Destraba
  los 8 tokens sin fila más `enc_impresiones`: las columnas existen y están medidas
  (`call_discado`, `call_contactados`, `digital_impresiones`, `meta_alcance` en
  `resumen_metricas_dinamico`, clave `id_cuentas`). **No se cablea ninguno hasta que exista**:
  sin la rama publicarían el agregado de la semana en las seis láminas.
- **Cuál de las dos filas de `digital/Alcance` es la buena** para `3387-JULJDGGC` y
  `3289-JUNJDGAG`. Son idénticas en las seis columnas salvo el número, y las impresiones implícitas
  coinciden: son dos definiciones del mismo hecho. `D-06` valida la de alcance más chico. Hasta que
  se decida, esas dos láminas publican `—` con motivo.
- **`m2_campanias`** — espera una definición del usuario, no un cableado.
- **`_34`, el censo de `EVENTO`** — dejó de ser bloqueante. Sigue valiendo la pena: los valores
  crudos que el deck publica (`"1 a 1"` con comillas) muestran por qué.
- **Los hallazgos de plantilla** en `docs/PENDIENTES_consistencia.md`. El que importa: **la lámina
  modelo de una sección se infiere de los tokens, así que editar la plantilla la mueve en silencio.**
- **`Educación 16/06` no ancla** (0,54 contra umbral 0,6), así que `junio_sem2` emite 3 y no 4.
  Decidido por `D-29`: lo resuelve el usuario, no el motor, y el umbral no se baja.

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
- **`seg_expansion` depende mucho menos de la cantidad de láminas que `seg_items`**: con el doble de
  láminas duplicadas pasó de 36 a 38 s, mientras `seg_items` fue de 34 a 76.

## Instrumentos nuevos, todos de sólo lectura

| función | para qué |
|---|---|
| `diagEnlaceDigitalDeEncuentros_(periodoRef)` | el censo del `_38`: anclaje por ítem y filas por solapa, con ventana y sin ventana |
| `alcanceDeLaCuenta_(idCuenta, ventana)` | el `Alcance` por la rama por cuenta real, vía `datosDeMarcador_` |
| `diagTextoDeDeck_(deckId, aguja, tope)` | el texto de un **deck ya generado**. `diagCajaDeToken_` no sirve: abre la plantilla, donde los tokens no están resueltos |

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
| **la cuenta no tiene filas de `Digital`** | **la unión no adjunta la solapa: es `ignorar`** |
