# `X-28` — se cablea el criterio **más plausible**, declarado `_revisar`

**Decisión del usuario, 25/08.** El Call Center deja de esperar la respuesta del equipo. Se cablea la
regla más plausible y **el número se publica marcado**, con el mecanismo que ya existe: el sufijo
`_revisar` (`R-18` addendum 1), *desconfianza declarada por una persona sobre un número que se
publica igual*.

⭐ **Esto no cierra `X-28`.** `X-28` sigue abierto hasta que el equipo conteste. Lo que cambia es que
el casillero deja de estar en `/////` y pasa a tener un número **que el deck declara dudoso**.

## Lo que ya está resuelto y no se remide

- **La definición cerró exacta** (`V-105`), contra el deck del equipo del 31/07 y la `Base Looker`
  del mismo archivo: 2 campañas · 6.011 · 1.878 (31 %). **Cuatro de cuatro.**
- **`MAPEO` de `looker/CC` está escrito**: `lcc_id_cuenta` (A), `lcc_base_barrida` (C),
  `lcc_contactados` (D), con `clave_ventana` y `ventana_ref: 'Cuentas'` en `SOLAPAS`.
  **`Base enviada` no se mapea, a propósito.**
- **«Base discada» es `Base barrida`** — `V-66` lo decide por el porcentaje, que no se deriva del
  otro número publicado.
- **El Resumen NO filtra por `Tipo de llamado`**: las «3 campañas» son las tres filas,
  `Reconfirmación` incluida. El filtro `Convocatoria + IVR convocatoria` es de **la lámina del
  iceberg**, que es otra.

**Lo único que falta es qué cuenta entra.**

---

## Parte 0 — medir los tres desempates, reportar y parar

**Modelo: Opus. Effort alto.** Elige la regla que va a publicar un número.

Actualizá el clon. Leé `CLAUDE.md` §4, `docs/PLAN.md`, `docs/CONFIG_INFORMES.md` y la sección del
Call Center de `docs/CIERRE_POR_LAMINA.md`.

### Lo medido el 22/08, que es el punto de partida

De **13 propiedades declaradas a ciegas, 0 aciertan en los dos períodos.** Sobreviven 21 reglas y
**`JDGAG` está en las 21** — ninguna prescinde de él. Acierta solo en julio; **en agosto da dos
cuentas**, `3289` y `3488`. Y los tres desempates —`Finalizada`, `duración ≤ 30 d`, `duración ≤ 14
d`— **aciertan los dos períodos por igual**.

⚠ **`JDGAG` no señala al encuentro de la semana:** hay **124 cuentas `JDGAG` con filas en `CC`**. Lo
que recorta es la ventana. Los «1 a 1» `3354-JULJDGAG` y `3346-JULJDGAG` también son `JDGAG`.

### Lo que hay que medir

1. **Los tres desempates, sobre los dos períodos**, con `JDGAG` + pertenencia como base. Reportá qué
   cuenta elige cada uno y qué números publica, contra los dos valores conocidos: julio **2 · 6.011 ·
   1.878 · 31 %**, agosto **3 · 19.788 · 7.308 · 37 %**.
2. ⭐⭐ **Cuál de los tres depende de una columna que se mueve sola.** `fecha_fin` de una cuenta **se
   extiende**: `3289-JUNJDGAG` decía `30/07` en el export del 31/07 y `20/08` en el del 20/08. Por
   eso una cuenta de **junio** sigue cayendo dentro en agosto.
   ⭐ **Ése es el criterio de desempate entre los desempates, y es el único argumento de negocio
   disponible:** los dos de `duración` se calculan sobre `fecha_fin` y heredan la deriva; el de
   `estado` cambia cuando alguien finaliza la campaña, que es un hecho, no un artefacto.
   **Si la medición lo confirma, la regla es `JDGAG` + pertenencia + estado `Finalizada`.**
   Si la medición dice otra cosa, **reportá y pará**: no la fuerces para que dé lo que este prompt
   supone.
3. ⚠ **Los tres tokens viven en DOS láminas** —la 2 y la 5— y **los cuatro casos que los validan
   están etiquetados `resumen_ejecutivo_jm`: ninguno mide la lámina 5.** Reportá qué publicaría cada
   uno en la lámina 5 con esta regla. **Un token verificado en una lámina no está verificado en la
   otra.**

⭐ **Control positivo, y frená si no aparece:** una cuenta cuyo valor ya está cerrado por `V-105`,
leída por el mismo camino. Si no reproduce, el instrumento no está leyendo `looker/CC` y **no hay
hallazgo**.

**Reportá y pará.**

---

## Parte 1 — cablear, con el número marcado

**Modelo: Opus. Effort alto.** Publica cuatro números en dos láminas.

**Sólo si la Parte 0 eligió una regla con su medición.** Si los tres siguieron empatados y ninguno se
distingue por robustez, **reportá y pará**: publicar marcado está bien, elegir a ciegas no.

- Las filas de `MARCADORES` para `cc_campanias`, `cc_base`, `cc_contactados` y `cc_contact_pct`.
- ⭐ **Los cuatro con formato `*_revisar`.** El motor no pone ni saca ese sufijo solo: se declara acá
  y se quita el día que el equipo conteste, **editando una celda de `MARCADORES`, sin `clasp push`**
  (`D-01`).
- **La nota de cada fila dice la regla completa y que está sin confirmar**, con el número de `X-28`.
  Una nota que dice *«pendiente»* sin decir **qué** se decidió provisoriamente no sirve dentro de
  seis semanas.
- ⚠ **El corte va en `dimensiones`, no en `filtro`** — es un corte que el equipo pediría por nombre.
  `filtro` queda para guardas técnicas.

**El banco** tiene que afirmar **las dos cosas**: que la regla elige la cuenta esperada en los dos
períodos, **y que el formato lleva el sufijo**. Cablearlo sin el sufijo publicaría un número dudoso
con cara de verificado, **sin fallar**.

Corré `node tools/suites.js` y reportá el veredicto **por exit code**.

Un commit.

---

## Parte 2 — documentación

**Modelo: Sonnet.** Rutear por `CLAUDE.md` §7.

- **`docs/CONFIG_INFORMES.md`** — la regla provisoria como decisión editorial, con fecha y con la
  condición de salida: *se quita el `_revisar` cuando el equipo conteste `X-28`*.
  ⭐ **Un `_revisar` sin fecha ni condición de salida es un pendiente disfrazado de estado.**
- **`docs/CIERRE_POR_LAMINA.md`** — el Call Center pasa de *«cableado frenado por `X-28`»* a
  *«cableado en `_revisar`»*. ⚠ `X-28` **sigue abierto**: esto no lo cierra.
  ⚠ Y la lámina 5 sigue **«pintada sin control»** — anotá qué publica ahí, medido en la Parte 0.
- **`docs/PENDIENTES_consistencia.md`** — `X-28` con su estado nuevo y la reformulación de `C-80`:
  la pregunta al equipo **no** es *«cuál de las cuentas entra»* sino ***«por qué el bloque Call
  Center mira otro universo»***, y se contesta en una frase.
- **`docs/BITACORA.md`** y **`docs/HANDOFF_CODE.md`** — la vuelta.

Commit separado.
