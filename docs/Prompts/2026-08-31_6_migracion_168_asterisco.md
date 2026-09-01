# `2026-08-31_6` — La migración de los 168 a `informe_id = '*'` (`D-54`)

**Subagente:** ninguno.
**Destino:** `docs/Prompts/`.
**Estado:** no ejecutado.
**Prerrequisito ya cumplido:** el alta de `secco | L-054` y `L-055` y el refresco de
`orden_plantilla` corrieron y cerraron.

---

## El estado, medido por dos vías independientes

`volcarInventarioDeTokens()` del 31/08 23:23, contra las plantillas vivas:

- **168 candidatos a `*`** — `camp_` 74 · `post_` 24 · `enc_` 22 · `u1_` 30 · `ecv_` 10 · `m2_` 8.
- **213 tokens compartidos** entre las dos plantillas; los 45 que no tienen fila son cableado, no
  migración.
- **El trabajo propio de `secco` son 13 tokens visibles**, de los cuales **10 son `emin_*`**. Los
  otros 42 «sólo secco» viven en láminas escondidas y **no son deuda**.

⭐ **Y un control que hice desde afuera y conviene reproducir adentro: de los 168, cero viven en
`secco` sólo en láminas escondidas.** Los 168 están todos en slides visibles de las dos plantillas,
así que la migración no arrastra nada muerto.

---

## Parte 0 — sólo lectura

**Modelo: Sonnet. Effort: alto.** ⛔ **No editar. Reportar y parar.**

### 0.1 · La función ya existe, y hay que leerla antes de escribir una línea

`aplicarAsteriscoCompartidos()` (`Instalar.gs`) **ya hace esta migración**. Medición previa a
confirmar o desmentir:

- **No tiene modo seco.** Calcula y **escribe en el mismo paso**.
- **No hace backup de `MARCADORES`.**
- ⭐ **No toma una lista: define el conjunto por sí misma**, con `tokensDePlantilla_('secco')` — toda
  fila cuyo marcador aparezca en la plantilla de `secco` pasa a `*`.
- Agrega `SELLO_VALIDACION_` a `notas`.

⚠ **Que defina el conjunto sola es correcto —una sola fuente— pero significa que el alcance real lo
decide la función y no el inventario.** ⇒ **Verificar que su conjunto sea exactamente los 168**, y
si difiere, **ése es el hallazgo y se para acá**. Los dos números tienen que salir del mismo día:
la plantilla de `secco` se movió tres veces en las últimas horas.

### 0.2 · `tokensDePlantilla_` y las escondidas

¿Lee **todas** las slides o saltea las ocultas? Hoy la respuesta no cambia el resultado —los 168
están todos en visibles— **pero sí cambia el futuro**: `secco` tiene **nueve** láminas escondidas
(`L-004`…`L-007`, `L-023`, `L-025`…`L-028`), y el día que una de ellas tenga un token con fila, la
función lo migraría sin que nadie lo pida. **Medirlo y dejarlo dicho, no arreglarlo.**

### 0.3 · La regla de precedencia, leída entera

`docs/PLAN.md`, *«Precedencia entre `informe_id = '*'` y un informe concreto: se cae»*. Lo que dice
es más corto de lo que el nombre sugiere: **no hay régimen de dos sistemas**, hay un solo lector, y
un override por informe **se decidiría el día que haga falta**.

⇒ **La consecuencia operativa, y es la que hay que verificar antes de migrar:** con `*` puesto,
**no existe forma de que `secco` tenga una excepción para uno de los 168**. Confirmar que ninguno
la necesita —y si alguno la necesita, decirlo antes, porque después el camino de vuelta es otra
migración.

⚠ Y verificar el modo de falla que ya está anotado: **dos filas con el mismo `marcador` y distinto
`informe_id` hacen ganar a la última en silencio.** Si alguno de los 168 tuviera hoy dos filas, la
migración crearía ese caso. **Medir cuántos marcadores duplicados hay en la hoja, si es que hay.**

### 0.4 · `m2_campanias`

Está entre los 168, y el `2026-08-20_7` lo nombra como **un token cuya fuente no existe**. Pasarlo
a `*` lo publicaría roto en las **dos** plantillas en vez de en una. **Verificar contra la
configuración de hoy** —no contra aquel prompt, que tiene once días— y **proponer excluirlo con
motivo, o confirmar que está sano**.

### 0.5 · El orden de los dos botones

`verificarCierreParaGenerar()` corre `aplicarRevisarASinValidar()` **antes** y frena si falla, con
un motivo escrito: *el escritor indexa por `marcador||informe_id`, así que mover el ámbito ahora
dejaría el formato a medio aplicar*. ⇒ **Decir si la migración tiene que correrse por ese wrapper y
no sola.** Si es así, es parte del procedimiento y no un detalle.

**Reportar y parar.**

---

## Parte A — modo seco y backup, antes de tocar nada

**Modelo: Opus. Effort: alto.** Mueve 168 marcadores que publican en dos informes.

1. **Modo seco**: lista qué filas tocaría, con su `marcador`, su `informe_id` actual y la `notas`
   resultante, **y para**. ⛔ **Nada se escribe.** Es el primer entregable y el usuario lo corre.
2. **Backup de `MARCADORES` antes de escribir**, y ⛔ **si el backup falla, no se toca nada** — como
   en `reasignarAnclasDeSecco()`, y que sea un caso del banco y no una promesa del comentario.
3. **Todo o nada**, como ya hace: se validan las filas antes de escribir.
4. **El límite de `D-54`, escrito en el commit y en `notas`:** dice que el **número** es el mismo,
   **no** que esté **validado** para `secco`. Los 168 heredan el sello de `jm`, que se midió con
   otra ventana y otro corte. ⚠ **Un sello heredado que parezca validación es peor que ninguno.**

**Reportar y parar.** El usuario corre el modo seco y decide.

---

## Parte B — aplicar, después del visto bueno

**Modelo: Sonnet.**

Con banco: **control positivo** (una fila que no está en `secco` se queda en `jm`), **control
negativo con mutación verificada** (si el parche no aplica, el caso falla), y un caso que fije que
**el backup fallido aborta sin escribir**.

⛔ **No cablear ninguno de los 45 compartidos sin fila.** Eso es otro objetivo.
⛔ **No tocar los `emin_*`.** Ministros es prompt propio: `R-20` es código, no configuración.

Commit propio, `docs/BITACORA.md` en una línea.
