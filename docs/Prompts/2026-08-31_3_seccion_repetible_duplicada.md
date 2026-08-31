# `2026-08-31_3` · La sección de campaña destacada sale dos veces

**Destino:** `docs/Prompts/`. **Estado:** no ejecutado.
**Origen:** `P0` de `PENDIENTES`, detectado en el deck del 31/08.

⛔ **Cambia la ESTRUCTURA del deck, no un número.** Partes B y C en **Opus, effort alto**.

---

## 0 · El defecto

El deck del 31/08 tiene **32 láminas** y **nueve están duplicadas**: los slides **13–21** se repiten
completos en **22–30**, idénticos, con la misma campaña «Operativo Movilidad más segura 2».

```
13/22 Campaña destacada      · 14/23 Objetivo        · 15/24 Herramientas
16/25 Formatos               · 17/26 Res. agregados  · 18/27 Desagregados Digital
19/28 Desagregados Mail      · 20/29 Desagregados respuestas · 21/30 Análisis
```

**Causa medida** (Parte 0 del `_31_2`, ya verificada — **no hay que re-medirla**):

- `CAMPANAS` tiene **dos filas** de `3512-AGOSEGGJ`, una con `periodo_id = 2026_agosto_21_27` y
  otra con `2026_agosto_21_28`.
- `itemsDeSeccion_(seccion, informeId, ventanaInforme)` **no recibe el `periodo_id`**; la rama
  sólo exige que no esté vacío. Dos filas → dos ítems → dos veces la sección.

⭐ **No es un resto del arreglo `b1dc43f`.** Aquél corrigió `filasDeCampana_` —tokens y ventana— y
funcionó. **La selección semanal de la sección nunca se implementó** y está declarada como
pendiente desde el 18/08 en el propio comentario del código.

⛔ **Lo que venció es su justificación**, y eso es lo que hay que registrar: el comentario decía
*«hoy es observablemente un no-op: las tres filas cargadas son de `secco` y las tres tienen
`periodo_id` vacío»*. Era cierto entonces. **Cargar `CAMPANAS` — el trabajo previsto — fue
exactamente lo que lo invalidó.**

---

## Parte 0 — Premisas y la decisión de diseño · **sólo lectura** · Sonnet · effort alto

**P1 · ⭐ ¿Se arregla por configuración?** Antes de tocar código: `SECCIONES` tiene `itera_sobre` y
`filtro`, y `LAMINAS` también. **Averiguar si el recorte por período se puede expresar como una
fila de configuración** —un `filtro` sobre `periodo_id` en la sección repetible— en vez de pasarle
el argumento a `itemsDeSeccion_`.

→ Si se puede, **el prompt cambia de objeto y se vuelve mucho más barato**: filas en vez de
`clasp push`. Reportarlo y parar.

**P2 · ⛔ Qué significa `periodo_id` vacío en `CAMPANAS` — es LA decisión.**

El comentario del 18/08 dice que las filas de `secco` lo tienen vacío. **Un filtro estricto
`periodo_id == el de la corrida` las dejaría afuera y rompería `secco`.** Dos lecturas posibles y
hay que elegir con los conteos a la vista:

| lectura | qué hace con una fila de `periodo_id` vacío |
|---|---|
| **comodín** | aplica a todos los períodos → se conserva siempre |
| **sin asignar** | no pertenece a ninguno → se descarta |

**Medir sobre `CAMPANAS` viva:** cuántas filas hay en total, cuántas con `periodo_id` cargado,
cuántas vacío, y **por `informe_id`** — para ver si el vacío es sólo de `secco` o también de `jm`.
⚠ Si `jm` tiene filas con el vacío, la lectura «sin asignar» le saca láminas al informe que
estamos arreglando.

**P3 · Quién más itera.** Listar **todas** las secciones con `modo` repetible y su `itera_sobre`.
El arreglo toca `itemsDeSeccion_`, que las sirve a todas. ⚠ **Una sección que hoy funciona por
casualidad —porque su fuente no tiene `periodo_id`— puede romperse con el filtro puesto.**
Reportar cuáles están en riesgo.

**P4 · El conteo de láminas, que es el criterio de aceptación.** Registrar cuántas láminas produce
hoy el informe `jm` con `2026_agosto_21_28`, y cuántas debería producir con la sección una sola vez.
Del deck del 31/08: **32 hoy, 23 esperadas**. Confirmarlo contra la corrida, no contra mi conteo.

→ **Terminar acá: reportar y parar.** La decisión de P2 la toma el usuario.

---

## Parte A — Testigo ANTES · Sonnet · effort normal

Un testigo de **estructura**, no de valores: para el informe `jm` con `2026_agosto_21_28`, cuántos
ítems produce cada sección repetible y con qué clave. Guardarlo en el repo.

⭐ Es el instrumento que falta: hasta ahora todos los testigos miden números. **Este defecto no se
ve en ningún valor** — las nueve láminas duplicadas publican cifras correctas. Un testigo de
valores lo habría dado por bueno.

---

## Parte B — El arreglo · **Opus** · effort alto

Según lo que decida P1:

- **por configuración:** las filas que correspondan, con relectura de la hoja.
- **por código:** pasarle el `periodo_id` de la corrida a `itemsDeSeccion_` y aplicarlo con la
  lectura del vacío que el usuario haya elegido en P2. Con `clasp push`.

→ **Y en el mismo cambio, retirar la justificación vencida** del comentario del 18/08 — no
borrarla: marcarla como vencida, con la fecha y el motivo. Es el caso que la regla nueva de
`CLAUDE.md` §4 usa como ejemplo, y borrarlo dejaría la regla sin su instancia.

⭐ **Y escribir la condición de invalidación de lo que quede**, que es lo que la regla pide: si el
arreglo deja algún «por ahora», tiene que nombrar **el evento** que lo invalida, no la fecha.

---

## Parte C — Testigo DESPUÉS y corrida · **Opus** · effort alto

1. Testigo de estructura, misma sesión, y diff sección por sección.
2. Corrida del informe `jm` con **`2026_agosto_21_28`**.

**Responder:**

- ¿El deck tiene **23** láminas y la sección de campaña destacada aparece **una vez**?
- ⚠ ¿Alguna **otra** sección perdió láminas? Es el riesgo de P3 y es el que hay que mirar primero.
  Un deck más corto de lo esperado no es un éxito mayor: es otra sección que se rompió.
- ¿Los valores de las láminas que quedan son los mismos que antes? **Deberían serlo** — esto no
  toca ningún marcador. Si un número cambió, parar.
- ¿`secco` sigue generando sus láminas? Correr también ese informe, aunque no sea el que se estaba
  arreglando: es el que la justificación vencida protegía.

---

## Parte D — Documentación · Sonnet · effort normal

`docs/` con el resultado, y en `PLAN.md` la decisión de P2 —qué significa `periodo_id` vacío—
porque es una regla del vocabulario, no un detalle de implementación.

**Y lo que queda abierto:** `pauta_*` con su entrada faltante en `DIMENSIONES_` y su problema de
magnitud · el default de `R-11` contra la semana del equipo · el testigo sin período · las dos
columnas de estado del desglose · la ventana 21–27 que ajusta mejor sin causa conocida · el `P0`
del `Libro` · el `P2` del `||` · `enc_alcance` · las tres familias de `sin_datos` ·
`3508-AGOSALGC` duplicado con llamados vacío · las filas sin `Id cuentas` · y que las láminas
publican acumulado sin rotularlo, por decisión.
