# 2026-08-21_11 — El generador lee `LAMINAS`: la sección se declara y la condición vive en la lámina

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Reemplaza** al `2026-08-21_9` (sección `uno_a_uno` por la vía repetible), que **no se ejecuta**:
> resolvía que `L-053` perteneciera a algo, pero **no** que fuera *en vez del* iceberg. Ver abajo.
>
> **Depende del `2026-08-21_10`**, que escribe `D-37`. Este prompt la implementa y la cita.
>
> **Objetivo único:** que el bloque de una sección repetible salga de `LAMINAS` —qué láminas, y
> cuál de ellas para cada ítem— en vez de deducirse de los tokens que la lámina lleva.

---

## Por qué la forma A no alcanzaba, medido

`encuentro` reclama hoy **exactamente dos** láminas de `jm`: `L-052` (portada, 2 tokens) y `L-035`
(iceberg, 30), **las dos por la familia `enc_`**. Como no se distinguen por prefijo, **sacarle el
iceberg al 1 a 1 sin sacarle también la portada exige granularidad por lámina.** No hay forma de
expresarlo con una fila de `SECCIONES`.

Y hay un segundo motivo, del mismo tamaño: `SECCIONES.filtro` **sólo se lee** para las secciones que
pasan `seccionesRepetiblesDe_` (`repetible` + `activa` + `familia_tokens`). `encuentro_iceberg` es
`unica` + `revisar`, así que un filtro puesto ahí sería **letra muerta** — el mismo caso que la
columna declarada y sin lector hasta el 08/08.

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort alto.**

**Cinco mediciones. Las tres primeras son premisas: si alguna cae, no se ejecuta nada.**

1. ⭐ **La propuesta de `seccion_id` para las 53**, como tabla `lamina_id → seccion_id`, y **la lista
   de secciones que hay que crear** para las que no encajan en ninguna existente. El criterio lo
   fijó el usuario: *"son parte de la sección, no existen láminas sin sección"* y *"asignalas como
   están ahora, que ya funcionaba"*. O sea:
   - las que **hoy reclama** una repetible se le asignan **a esa misma** — la asignación transcribe
     el comportamiento medido, no lo reinterpreta;
   - las demás van a la sección que les corresponde por contenido, y si no hay, se propone una nueva.
2. ⛔ **El control de regresión, y es el punto que decide si esto se puede correr:** cruzar la
   propuesta contra lo que **hoy** reclama cada sección repetible (`slidesModeloDe_` con su familia)
   y reportar **toda diferencia**. En particular:
   - que `L-035` quede en **`encuentro`** y **no** en `encuentro_iceberg` — asignarla al hijo
     `unica` la sacaría del bloque y **el iceberg dejaría de emitirse**;
   - que ninguna lámina que hoy **no** reclama ninguna repetible quede, con la propuesta, **dentro**
     de una repetible: eso la haría expandirse N veces donde hoy sale una.
3. ⭐ **¿La copia hereda el ancla?** `slide.duplicate()` copia las notas del orador, y el ancla vive
   ahí. **Medirlo, no razonarlo.** ⚠ **Si la hereda, resolver el modelo por `lamina_id` NO mata la
   N² por sí solo** — una copia sin pintar seguiría siendo indistinguible de un modelo, que es
   exactamente el bug que se venía a matar. Reportar además qué cuesta una escritura de notas por
   copia, porque de eso depende cuál de las dos salidas es viable.
4. **Cómo se resuelve hoy índice de slide → `lamina_id`**, y si `anclaDeLamina_` alcanza para las 53
   en las dos plantillas. `verificarLaminas()` ya lo contesta: correrlo y pegar el resultado.
5. **Qué secciones quedarían sin ninguna lámina declarada** — `encuentro_iceberg`, `m2_status`,
   `m2_caudal` son candidatas. **No se borra ninguna fila**: es un hallazgo para
   `PENDIENTES_consistencia.md`, porque una sección sin láminas o sobra o le falta algo.

**Reportar y parar.** La tabla del punto 1 la confirma el usuario antes de que se escriba una celda.

---

## Parte A — las secciones que faltan

> **Modelo: Opus · effort alto.**

Las filas nuevas en `SEED_SECCIONES_` que haya pedido la Parte 0. Con dos guardas:

1. ⛔ **Ninguna sección nueva es `repetible`** salvo que el usuario lo pida por su nombre. Una
   sección nueva `repetible` con láminas declaradas **expande**, y este prompt no está agregando
   bloques repetibles: está declarando pertenencia.
2. `sembrarSecciones_` **sólo agrega y jamás pisa una fila existente**, así que las filas entran al
   sembrar y la hoja sigue mandando sobre lo que ya está. **La siembra la corre el usuario.**

---

## Parte B — las 53 celdas

> **Modelo: Sonnet · effort alto.**

`escribirColumnaLaminas_(mapa, 'seccion_id')`, que ya existe y ya trae las guardas que hacen falta:
una columna por llamada, resuelve por nombre de encabezado, no crea ni borra filas, no escribe si el
valor ya es el que está, y devuelve `anterior` y `nuevo` por celda.

1. **`dryRun` primero**, y el reporte va entero: escritas, sin cambio, no encontradas.
2. Después la escritura, con el detalle por celda en el reporte — **es el respaldo real**, junto al
   TSV de `docs/_snapshots/`.
3. **Snapshot de `LAMINAS` después de escribir.**

⛔ **Sólo `seccion_id`.** `filtro` es la Parte C y va con su propio dry-run.

---

## Parte C — el generador lee `LAMINAS`

> **Modelo: Opus · effort alto.** ⚠ Cambia cómo se arma el deck entero.

1. ⭐ **El bloque modelo de una sección sale de `LAMINAS`**, no de `slidesModeloDe_(familias)`: las
   filas con ese `informe_id` y ese `seccion_id`, resueltas a índice de slide **por el ancla**,
   nunca por `orden_plantilla` (`2026-08-21_6`).
2. ⭐ **`LAMINAS.filtro` se evalúa por ítem**, con `parsearFiltro_` y el mismo `leerAtributo` que usa
   la rama `REUNIONES` de `itemsDeSeccion_` — el que ya prueba `probar-tipo-en-item.js`. Vacío =
   entra siempre. **Es lo que hace que el 1 a 1 lleve `L-053` y el resto el iceberg.**
3. **El bloque sigue teniendo que ser contiguo**, y la verificación es sobre **el conjunto completo**
   de la sección. El subconjunto de un ítem **no** tiene por qué serlo: con `L-052 · L-035 · L-053`
   en las posiciones 6-7-8, el 1 a 1 copia la 6 y la 8. Las copias se ubican con el mismo
   `inicio + k` corrido, que ya no depende de que las copias de un ítem sean tantas como las de otro.
4. ⛔ **El invariante de `D-37` punto 5:** un ítem sin ninguna lámina **frena**, nombrando sección e
   ítem. No hay deck a medias ni encuentro que desaparezca en silencio.
5. **`seccionesRepetiblesDe_` deja de exigir `familia_tokens` no vacía** y pasa a exigir **al menos
   una lámina declarada**. Si no, una sección repetible sin `familia_tokens` no se expandiría nunca
   — que es justo lo que este cambio vuelve posible.
6. ⛔ **Sin camino de compatibilidad.** Con las 53 declaradas, la inferencia por familia **se
   retira**. Una lámina sin `seccion_id` se reporta con su `lamina_id` y no entra a ningún bloque.
7. ⭐ **La N², según lo que haya medido la Parte 0 punto 3.** Si la copia hereda el ancla, el modelo
   no se puede identificar sólo por tenerla: hace falta que la copia sea distinguible —quitarle o
   marcarle el ancla al duplicar— **o** que el conjunto de modelos se calcule una sola vez por
   corrida, antes de cualquier duplicación. ⚠ **La fase atómica del `2026-08-20_10` se conserva
   igual: dos defensas, no una.**

⛔ **No se toca** el pintado, ni el reloj, ni el mecanismo desatendido, ni `familia_tokens` (queda
la columna; deja de decidir pertenencia — retirarla es la Fase 4 de `D-23`).

---

## Parte D — el control

> **Modelo: Sonnet · effort alto.**

`tools/probar-laminas-declaradas.js`, con la técnica de extracción del fuente real que ya usan
`probar-tipo-en-item.js` y `probar-lamina-por-id.js`.

| # | afirmación | por qué no alcanza sin ella |
|---|---|---|
| 1 | con las 53 declaradas, `encuentro` arma el **mismo** conjunto de láminas que hoy | es el control de no-regresión |
| 2 | ⭐ con el ítem `tipo = Uno a uno` el bloque es **portada + `L-053`**; con `Encuentro Temático`, **portada + iceberg** | es el objetivo del prompt |
| 3 | con `tipo` vacío el bloque lleva **iceberg** | la decisión lo dice explícito y es el caso que se olvida |
| 4 | ⛔ un ítem que se queda sin ninguna lámina **frena con motivo**, y el motivo nombra la sección y el ítem | sin esto el invariante es una intención |
| 5 | una lámina **sin** `seccion_id` no entra a ningún bloque y se reporta con su id | es lo que reemplaza a la inferencia |
| 6 | **romper a propósito:** volver la resolución a la familia de tokens y verificar que caiga la 2 | si no cae, el control no mide lo que dice |

⚠ **Y el número que hay que reportar aparte, porque es el que se lee mal:** `encuentro` emite hoy
**4** asignaciones (2 ítems × 2 láminas) y después del cambio emite **4** también. **El conteo no
cambia; cambia cuál lámina le toca a cada ítem.** Un control que sólo mire el total daría verde sin
haber aplicado nada.

Correr **las ocho suites** y reportar los conteos.

---

## Parte E — la documentación

> **Modelo: Sonnet · effort alto.** Grep primero (§3); si ya está escrito, cero ediciones y se
> reporta el cero.

1. `docs/PLAN.md` — `D-23` Fase 2 cerrada del lado del consumo, y `D-37` marcada como implementada.
2. `docs/PENDIENTES_consistencia.md` — las inconsistencias **1**, **2** y **6** del 21/08, revisadas
   contra este cambio; y el hallazgo de la Parte 0 punto 5 (secciones sin láminas).
3. `CLAUDE.md` §4 — sólo si la lección no está ya dicha: *inferir la identidad de algo por su
   contenido funciona hasta que el contenido cambia; la lámina que no pertenecía a nada y la copia
   indistinguible de un modelo son el mismo error con dos caras.*
4. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No cablea ningún `u1_`: la lámina va a pertenecer y a emitirse, y sus tokens siguen en `/////`.
- ⛔ No toca plantillas ni sella nada.
- ⛔ No retira `familia_tokens`.
- ⛔ No aplica la condición en `secco` **más allá de lo que salga de la sección compartida**: si la
  sección declara los dos informes, `secco` la hereda por su propia fila de `LAMINAS`. Las dos `[?]`
  de `CONFIG_INFORMES.md` §2.1 siguen abiertas y **no se contestan acá**.

**Un commit por parte.**
