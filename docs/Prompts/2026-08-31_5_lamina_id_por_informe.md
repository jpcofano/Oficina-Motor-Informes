# `2026-08-31_5` — Que dos informes puedan compartir un `lamina_id`

**Subagente:** ninguno (el prompt no declara uno).
**Destino:** `docs/Prompts/`. **Estado:** no ejecutado.

> ⚠ **Numerado `_5` al copiarlo**: hoy ya existen `_1` … `_4`, y el `N` es un orden **dentro del
> día** (`CLAUDE.md` §3).

**Es prerrequisito duro de todo lo demás y hoy no se puede dar el alta sin romper los censos.**

---

## Parte 0 — Sonnet, effort alto, **sólo lectura, reportar y parar**

Censar **TODOS** los lectores de `LAMINAS` y clasificarlos en dos grupos:

- los que resuelven por **`(informe_id, lamina_id)`**;
- los que indexan **sólo por `lamina_id`**.

**Medición previa a confirmar o desmentir:** `laminasDeSeccion_` compara los dos campos y anda; en
cambio `leerRegistro_('LAMINAS','lamina_id')` indexa por el id solo, y **con el mismo id en dos
informes una fila PISA a la otra en silencio**. Eso lo usa el censo de tokens sin marcador, entre
otros.

⚠ **No dar por completa la lista de dos que se nombra acá: es lo que se encontró desde afuera, no
un censo.**

⭐ **Y hay precedente medido:** `L-052` y `L-035` declaran las dos `orden_plantilla = 6`, y el bug
quedó **dormido porque el `if` nunca entraba**. Ahora la fila que lo despierta existe.

---

## Parte A — Opus, effort alto: el arreglo

Que la identidad de una lámina sea el par **`(informe_id, lamina_id)`** en todos los lectores.

**Con banco:**

- **control positivo** — los ids que hoy no se repiten siguen resolviendo igual;
- **control negativo con mutación verificada** — dos filas con el mismo `lamina_id` y distinto
  `informe_id` se resuelven a una cada una; **sin el parche, una pisa a la otra**.

---

## Parte B — Sonnet: el alta

Recién ahí, el alta de dos filas en `LAMINAS` — **`secco|L-052`** y **`secco|L-053`**, las dos
`seccion_id = encuentro`.

⛔ **Los datos salen de medir la plantilla viva de `secco`, no de este texto:** las dos slides ya
están ancladas y **el ancla manda**.

---

⛔ **No migrar ningún marcador acá. Es el prompt 2.**
