# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-12, al cerrar el `_35` · último commit al escribirlo: `c6ea467`

## Los dos decks vigentes

| deck | corrida | para qué |
|---|---|---|
| **`1rSpgB26M9T2G_wvVb-sy2dxK_zEC06E3cudw3J-W2-c`** | `jm-20260812-110746` | **El que se muestra.** julio 24–30/07, 6 encuentros con su `enc_evento`, 146 s, 116 impresiones con valor |
| `1TaOSazUr2qYaLniUefME4FEnS9UN6jLgsEZufZtC8v0` | `jm-20260811-234158` | **La red y nada más.** Mismo período, 246 s, 110 con valor. Sólo si algo rompe el de arriba |
| `1_H4bFSWrgrxqH01jWwN8nnS2aNge9ZH7sORsfAQAdUo` | `jm-20260811-234622` | El de `junio_sem2`, para mostrar que **el selector de período cambia los encuentros**. 3 encuentros, barrios disjuntos de julio |

⚠ Hay **dos filas huérfanas en `CORRIDAS`** por muerte de transporte, con la fila abierta —sin
`fecha_generacion`— como rastro. `CORRIDAS` **no tiene fila en `ESCRITORES.md`** ni escritor que
cierre una fila existente desde afuera, así que se dejan a propósito.

## Qué publica valor hoy

`MARCADORES`: **70 filas, las 70 de `jm`.** Última corrida: **61 ok · 7 sin dato · 2 error.**

Cableado en las últimas 48 h, todo con `notas = SIN VALIDAR — demo 12/08`:

- **`m2_*` (7)** — `digital/Directa Mail`, filtro `mail_tipo~=M2`. La ruta por la base `m2` está
  descartada con motivo: `m2/M2 periodo DIRECTA` es `referencia` y `buscarMapeo` exige `fuente`.
- **`frecuencia` y `gcba_frecuencia`** — `looker/resumen_metricas_dinamico`, `RATIO
  dig_impresiones/alcance`. **Sin `estado=Activa`**, y no es un olvido: con ese filtro las únicas 2
  filas `Activa` de la ventana son las dos JM y `gcba_frecuencia` daba 0 de 26.
- **`ecv_barrio` y `ecv_poblacion`** — `rdv`, `ULTIMO`, por ítem.
- **`ivr_75`, `ivr_75_pct`, `ivr_marque1`** — `digital/Directa IVR`. El `pct` calca a `ivr_at_pct`:
  cada porcentaje del embudo es la etapa sobre la anterior.
- **`enc_evento`** — `rdv/evento`, `ULTIMO`, por ítem. **`ULTIMO` y no `TEXTO`**: `opTEXTO` devuelve
  `valor_fijo`, un literal, y habría publicado vacío en las seis láminas.

## Qué publica «—», y el motivo de cada uno

Ninguno es "falta de tiempo". Los seis motivos son distintos y conviene no mezclarlos:

| token(s) | motivo |
|---|---|
| `cc_base`, `cc_contactados`, `cc_contact_pct` | **Medido y cerrado.** La fuente existe —`call_discado` col S, `call_contactados` col T de `resumen_metricas_dinamico`, y la fila `3289-JUNJDGAG` reproduce `V-64`/`V-65` exacto— pero la solapa **se recorta por punto**: esa cuenta arrancó el 17/07 y la ventana 24–30/07 la deja afuera. Las 4 que sí entran tienen todo en cero. **Un cero se lee como "hubo cero llamados", que es falso; una raya dice "no tengo el dato".** |
| `alcance`, `clics` | Sin prefijo y sin fuente evidente. Elegirla es enumerar a ojo. |
| `ecv_barrio1/2/3` | Piden una **operación posicional** que el motor no tiene. |
| `m2_campanias` | Pide un **`DISTINCT`** que el motor no tiene. `OPERACIONES_` son `SUMA, CONTEO, ULTIMO, RATIO, PCT, TEXTO, LISTA`. |
| los 32 `post_*` de la lámina 7 | Ninguno tiene fila. Serían 32 de 32 en «—», muy por encima del tercio. |
| `enc_impresiones`, `enc_alcance` | **Son los 2 errores.** Apuntan a `digital/Digital`, que es `ignorar` por `R-22`. Fallan en los seis encuentros, no en cuatro. Necesitan la rama por cuenta (`C-23`) y eso es código. |

## Listo y sin usar

**El bloque repetible ya soporta dos láminas modelo por sección** (`_35` Parte B, `34d373d`). La
expansión pasó de *"por cada modelo, N copias"* a **"por cada ítem, una copia del bloque completo"**,
con control verde: salida idéntica sobre `junio_sem2`.

**Todavía no hay carátula.** Para tenerla hace falta, del lado del usuario:

1. Una **lámina nueva pegada a la de detalle** —el bloque **tiene que ser contiguo** o la sección no
   se expande y lo reporta—.
2. Con `{{enc_evento}}` y **nada más**. Si se hace duplicando la de detalle, **borrarle los 31
   tokens** o la carátula publica los mismos números que la lámina que le sigue.
3. **Separar `enc_evento` de `ecv_barrio`**, que hoy **comparten caja de texto** en la lámina de
   detalle. `ecv_barrio` se queda; `enc_evento` se va a la carátula.

No necesita prompt ni código.

## Pendiente

- **`_34` — el censo de `EVENTO`.** Dejó de ser bloqueante: la carátula no agrupa, así que no hace
  falta catálogo. Sigue valiendo la pena — los valores crudos que el deck publica (`"1 a 1"` con
  comillas, `Encuentro Temático "Orden Público" – Eje Norte`) muestran por qué.
- **La carátula por ítem** — arriba.
- **Los cuatro hallazgos de plantilla** en `docs/PENDIENTES_consistencia.md`, con fecha. El que
  importa: **la lámina modelo de una sección se infiere de los tokens, así que editar la plantilla
  la mueve en silencio** — `comunicaciones_post` pasó de la 11 a la 7 y nadie se enteró.
- **`Educación 16/06` no ancla** (puntaje 0,54 contra umbral 0,6), así que `junio_sem2` emite 3 y no
  4. **Está decidido por `D-29`: lo resuelve el usuario, no el motor**, y el umbral no se baja.

## Lo que hay que saber antes de tocar algo

- **`resumen_metricas_dinamico` se recorta por punto y sólo dos marcadores la leen** —`frecuencia` y
  `gcba_frecuencia`—. Mapear `fecha_fin_periodo` **está medido y descartado**: el solape lleva JM de
  4 a 11 cuentas y GCBA de 22 a 81, con ids de septiembre y mayo. **Y refuta la hipótesis sobre
  `C-22`**: punto da 23,52, solape 71,48, publicado 11,9 — el solape aleja.
- **`leerReuniones_` filtra por `periodo_id`**, y el período **sale del `origen` de la ventana**
  (`periodo_ref:<id>`). **Sin override no se filtra**, y el reporte lo dice.
- **`FALTANTES` cuenta por ítem y la plantilla por token.** Por eso 234 puede ser mayor que 188.
- **El reporte numera las láminas sobre el DECK EXPANDIDO**, no sobre la plantilla.
- **`seg_expansion` tiene dos mediciones y ninguna conclusión** — ver la entrada del 12/08 en la
  bitácora. La próxima decisión de techo se toma con esos números, no con una deducción.

## El patrón que ya lleva cinco casos

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
| **junio no pierde datos** | **la sonda medía julio: `resolverMarcadores` no honra `periodo_ref`** |
