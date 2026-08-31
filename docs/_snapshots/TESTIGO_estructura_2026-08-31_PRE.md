# TESTIGO DE ESTRUCTURA — toma **ANTES** · 31/08/2026, 11:14:08 (UTC 14:14)

> ⚠ **Hay DOS corridas y la citable es la segunda.** La de las **11:02** corrió con el instrumento
> defectuoso —contaba `ítems × láminas`, ver el bloque del final— y la de las **11:14** con el
> corregido. **Los ítems y las claves son idénticos en las dos**; lo único que cambia es el total
> de láminas. Se conservan las dos porque la primera es la que encontró el defecto.

> **Estado: congelado.** Evidencia fechada. Es la toma PRE del `2026-08-31_3` (la sección de
> campaña destacada sale dos veces). La toma POST va en un archivo hermano.
>
> **Instrumento:** `testigoDeEstructura()` (`Auditoria.gs`), corrido por el usuario desde el editor.
> **Condiciones declaradas por la propia corrida:** las dos cachés de `generarInforme`
> —`abrirCacheRegistros_` + `abrirCacheDatosHoja_`—, copiadas verbatim del preámbulo.

---

## Lo que mide, y por qué hacía falta un testigo nuevo

**Ítems por sección repetible, con su clave.** El ítem es la unidad de la que sale una tanda de
láminas, así que un ítem de más es una tanda de más.

⭐⭐ **Este defecto no se ve en ningún valor**: las nueve láminas duplicadas del deck del 31/08
publican cifras correctas. **Todos los testigos anteriores del repo miden números, y un testigo de
valores lo habría dado por bueno.**

---

## `jm` · período `2026_agosto_21_28`

```
ventana: 2026-08-21 → 2026-08-28  ·  origen `periodo_ref:2026_agosto_21_28`
versiones de PERIODOS con esta misma ventana: 1 → [2026_agosto_21_28]
secciones repetibles activas con láminas declaradas: 2
```

| sección | itera_sobre | ítems | claves | `periodo_id` declarado |
|---|---|---|---|---|
| `encuentro` | `REUNIONES` | **1** | `Coghlan` | ✅ `2026_agosto_21_28` |
| `campana` | `CAMPANAS` | ⛔ **2** | `3512-AGOSEGGJ` · `3512-AGOSEGGJ` | ⛔ **no devuelve el campo — NO filtra por período** |

```
⛔⛔ CLAVE REPETIDA: [3512-AGOSEGGJ] — 1 tanda de láminas de más.
```

**Láminas declaradas:** `encuentro` 3 (`L-035 L-052 L-053`) · `campana` 9 (`L-040`…`L-048`).

## `secco` · mismo período

| sección | itera_sobre | ítems | claves | `periodo_id` declarado |
|---|---|---|---|---|
| `encuentro` | `REUNIONES` | **1** | `Coghlan` | ✅ `2026_agosto_21_28` |
| `campana` | `CAMPANAS` | ⛔ **2** | `3512-AGOSEGGJ` · `3512-AGOSEGGJ` | ⛔ **no devuelve el campo** |

**Láminas declaradas:** `encuentro` 5 (`L-004`…`L-008`) · `campana` 8 (`L-016`…`L-023`).

⭐ **`secco` también está afectado**, con las mismas dos campañas. El arreglo tiene que mirarlo: un
`secco` que salga sin campaña destacada es un deck más corto que se lee como éxito.

---

## ⭐⭐ El hallazgo de la toma: el control positivo apareció SOLO, en la misma corrida

La lista de excluidos de `encuentro` trae esta línea, en los dos informes:

```
· excluido Coghlan — periodo_id "2026_agosto_21_27" no está en [2026_agosto_21_28] (D-19)
```

⇒ **`REUNIONES` tiene EXACTAMENTE la misma duplicación que `CAMPANAS`** —el temario del 27/08
cargado dos veces, bajo `2026_agosto_21_27` y `2026_agosto_21_28`— y **la sección `encuentro` NO se
duplicó**, porque `leerReuniones_` filtra por período y la excluye citando `D-19`.

⭐ **Es el discriminador de `CLAUDE.md` §4 en su forma más limpia: dos ramas que comparten camino y
difieren sólo en el corte, medidas DENTRO DE LA MISMA CORRIDA.** La inestabilidad de las fuentes no
lo puede arruinar, y no necesita un «antes» de otro día:

| | misma duplicación en la fuente | ¿filtra por período? | ¿duplicó láminas? |
|---|---|---|---|
| `encuentro` / `REUNIONES` | sí — Coghlan ×2 | ✅ sí | **no** |
| `campana` / `CAMPANAS` | sí — `3512-AGOSEGGJ` ×2 | ⛔ no | **sí** |

**A `CAMPANAS` no le falta *otro* mecanismo: le falta *el mismo* que `REUNIONES` ya tiene.** Esto
cierra la pregunta (a)/(b) del prompt sin necesidad de una corrida del deck.

⚠ Y el resto de los excluidos confirma que el filtro de `REUNIONES` funciona sobre todo el
histórico: 11 encuentros descartados por período —`junio_sem2` ×4, `julio_24_30` ×4,
`agosto_14_20` ×2, `2026_agosto_21_27` ×1— sobre 12 filas leídas.

---

## ⛔ Un defecto del INSTRUMENTO, encontrado por esta misma toma y corregido antes del POST

La primera versión del testigo calculaba las láminas como **`ítems × láminas declaradas`**. **Está
mal:** `LAMINAS.filtro` se evalúa **por ítem** (`laminaEntraParaItem_`), así que una sección puede
declarar N láminas y emitir menos.

| | declara | entra para «Coghlan» (`tipo = Uno a uno`) |
|---|---|---|
| `jm` · `encuentro` | 3 | **2** — `L-035` lleva `tipo!=Uno a uno` |
| `secco` · `encuentro` | 5 | **2** — `L-006`/`L-007` piden `Encuentro Temático`, `L-008` pide `tipo!=Uno a uno` |

⇒ **El `TOTAL: 21` que imprimió la corrida de las 11:02 es falso en los dos informes.**

✅ **Corregido y RE-MEDIDO a las 11:14, con `laminaEntraParaItem_`:**

| informe | `encuentro` | `campana` | **TOTAL** | láminas que no entran, con su motivo |
|---|---|---|---|---|
| `jm` | **2** (de 3) | 18 (de 18) | **20** | `L-035 ✕ Coghlan (tipo = "Uno a uno")` |
| `secco` | **2** (de 5) | 16 (de 16) | **18** | `L-006`, `L-007`, `L-008` ✕ Coghlan |

**Los ítems y las claves no se movieron entre las dos corridas** — que es lo que prueba que el
defecto era del conteo de láminas y no de la lectura.

⚠ **No mueve el número que este prompt mide.** Las 17 filas de `campana` —9 en `jm`, 8 en `secco`—
tienen el `filtro` **vacío**, verificado en `LAMINAS_2026-08-31.tsv`. El defecto movía el **TOTAL**,
que es justo lo que hay que cruzar contra el conteo del deck en la Parte C.

⭐ **El arreglo usa la función real del motor** —`laminaEntraParaItem_`— y no una copia de su
lógica: reimplementarla sería el instrumento que reproduce el motor y lo reproduce peor, y dejaría
dos lugares que tienen que decir lo mismo.

**Lo citable de esta toma son los ÍTEMS y las CLAVES**, que el defecto no tocaba. El total de
láminas se vuelve a tomar con el instrumento corregido.

---

## Dos notas menores de la re-corrida, anotadas y no arregladas

⚠ **El motivo de `laminaEntraParaItem_` dice el valor del ÍTEM, no la condición que falló.** Las
tres láminas de `secco` imprimen `tipo = "Uno a uno"` aunque pidan cosas distintas —`L-006`/`L-007`
piden `Encuentro Temático` y `L-008` pide `tipo!=Uno a uno`—. Es legible pero no distingue **por
qué** no entró cada una. **Es del motor, funciona, y no se toca acá**: queda anotado.

⚠ **`digital` se movió entre las dos corridas** — `831` → `832` cuentas, en doce minutos. No afecta
esta medición y **conviene que se vea**: un testigo de **estructura** es inmune a la inestabilidad
de las fuentes porque cuenta ítems y no valores. El anclaje dio el mismo resultado las dos veces
(«Coghlan» → `3527-AGOJDGAG`, score 1.00).

## Lo que este testigo NO contesta

- Si los **valores** de las láminas son correctos. No mira un solo marcador.
- Si la **plantilla** tiene las slides que `LAMINAS` declara. Eso es abrir el deck.
- El **conteo real de láminas del deck**: el testigo predice la expansión, no la corrida.
