# Medición — Parte D del `2026-08-31_1`: qué publican `L-031` y `L-032`, y contra qué cierran

**Las dos cosas van juntas y en la misma pantalla, porque leer una sin la otra da una conclusión
falsa:**

✅ **El CORTE cerró.** `L-031` publica **28 de las 29** implementaciones que declara el tablero
—`10/9/9` contra `10/10/9`— y **el faltante tiene nombre**: una fila de Google, la misma que falta
desde la primera medición del corte el 30/08.

⛔ **Las láminas siguen sin poder validarse por SUMA, y eso no es un defecto de este trabajo.** La
fuente **no tiene grano semanal**: `L-031` y `L-032` publican **acumulado**, rotulado como tal, por
decisión del usuario del 30/08. **Que las sumas den por encima es lo que esa decisión predice.**

⚠ **Nadie debería leer «JM cerró» como «las láminas están validadas».** Cerró el universo; la
magnitud es de otra naturaleza.

**Estado:** congelado. **Fecha:** 2026-08-31.
**Corrida:** informe `jm`, `periodo_id = 2026_agosto_21_28`.
**Referencia:** `docs/_fixtures/Tablero_carga_21-28ago_lectura_2026-08-30_1800.png`.

---

## 1 · Los números publicados

**`L-031` — JM**

| | motor | tablero | |
|---|---|---|---|
| Meta | 3.709.430 | 2.254.346 | 164,5 % |
| Google | 1.946.475 | 1.219.244 | 159,6 % |
| Programmatic | 10.608.520 | 6.907.699 | 153,6 % |
| **TOTAL** | **16.264.425** | **10.381.289** | **156,7 %** |

**`L-032` — GCBA**

| | motor | tablero | |
|---|---|---|---|
| Meta | 80.122.796 | 24.164.426 | 331,6 % |
| Google | 54.836.419 | 19.841.789 | 276,4 % |
| Programmatic | 166.397.876 | 61.398.036 | 271,0 % |
| **TOTAL** | **301.357.091** | **105.404.251** | **285,9 %** |

✅ **La identidad `meta + google + prog = total` cierra al dígito en los dos ámbitos.**

⭐ **Uniforme y por encima en las tres plataformas de JM, y las dos mitades se leen juntas:**
**uniforme** dice que **no hay error de selección** —un error de corte se concentraría en una
celda—; **por encima** es **acumulado**. ⛔ **Si hubieran cerrado al 100 % habría que haber parado**:
significaría que la fuente tiene un grano que la medición no encontró.

---

## 2 · ⭐ La corrida usó 21–28, y se puede probar sin mirar la configuración

**Los cuatro `imp_*` de JM dan IDÉNTICOS a la toma del testigo, que fue sobre 21–27. Los
`gcba_imp_*` no.**

⇒ **El día 28 agrega campañas de GCBA y ninguna de JM.**

⚠ **Vale declararlo, porque si no parece un error:** que JM coincida con una toma **de otra ventana**
se lee como si la corrida hubiera usado la ventana del testigo. **No es eso** — es que el día que
las separa no tiene campañas de JM. La discrepancia de GCBA entre las dos tomas es la prueba de que
las ventanas sí eran distintas.

---

## 3 · ⛔⛔ Defecto abierto — la sección de campaña destacada sale DOS VECES

**No son dos láminas: son NUEVE, repetidas completas.** Slides **13–21** e **idénticas en 22–30**:

`Campaña destacada` · `Objetivo` · `Herramientas` · `Formatos` · `Resultados agregados` ·
`Desagregados Digital` · `Desagregados Mail` · `Desagregados respuestas` · `Análisis`

### La causa — ⭐ **confirmada, y ya estaba escrita en el código**

**Medido sobre `CAMPANAS` viva (30/08): dos filas de la misma campaña.**

| `periodo_id` | `campana_id` | `mostrar` |
|---|---|---|
| `2026_agosto_21_27` | `3512-AGOSEGGJ` | sí |
| `2026_agosto_21_28` | `3512-AGOSEGGJ` | sí |

**Dos filas, dos ítems, dos veces nueve láminas. El conteo cuadra.**

Y la rama `CAMPANAS` de `itemsDeSeccion_` (`Generador.gs`) **sólo exige que `periodo_id` no esté
vacío — no que coincida con el período de la corrida**. Su propio comentario, del 18/08, lo dice
con todas las letras y **predijo dónde se iba a notar**:

> *«lo único que decide en qué corrida sale una campaña es `periodo_id` — y esta rama sólo exige
> que **no esté vacío**, no que **coincida con el período de la corrida**. […] **La selección
> semanal todavía no está implementada**, y `itemsDeSeccion_` ni siquiera recibe el `periodo_id` de
> la corrida (recibe `ventanaInforme`).»*

✅ Confirmado en la firma: `itemsDeSeccion_(seccion, informeId, ventanaInforme)` — **el `periodo_id`
no llega**.

### ⭐⭐ Y una corrección a la hipótesis de trabajo, que cambia dónde buscar

**No es que el arreglo `b1dc43f` haya «dejado afuera» a la sección.** Aquél corrigió
`filasDeCampana_` —el camino de los **tokens** y la **ventana**— y funcionó. **Acá no hay nada que
se haya roto: la selección semanal de la sección NUNCA SE IMPLEMENTÓ**, y está declarada como
decisión de diseño pendiente desde el 18/08.

⛔⛔ **Lo que sí pasó es lo otro: la justificación que volvía inofensivo ese hueco VENCIÓ.** El
mismo comentario dice *«hoy es observablemente un no-op: las tres filas cargadas son de `secco` y
las tres tienen `periodo_id` vacío»*. **Eso era cierto el 18/08 y dejó de serlo**: hoy `CAMPANAS`
tiene dos filas de `jm` con `periodo_id` cargado. Es exactamente la forma que `CLAUDE.md` §4 ya
nombra — **un hueco justificado por el estado actual del cableado, con fecha de vencimiento que
nadie mira**, y el trabajo previsto es la fecha.

⚠ **El arreglo va en prompt propio**: toca la **iteración de secciones**, que es código y **mueve la
estructura del deck**, no un número.

---

## 4 · ⚠ Segundo hallazgo, menor y ya conocido — el `1 / 1 / 1`

Las dos láminas de Resumen Ejecutivo publican *«Total de contenidos implementados · Meta 1 ·
Google 1 · Programmatic 1»*, con **10/9/9 implementaciones medidas**.

**El token es `pauta_meta` / `pauta_google` / `pauta_prog`**, y hay un discriminador limpio que lo
separa del otro candidato:

| candidato | fila en `MARCADORES` | qué publicaría |
|---|---|---|
| ⭐ `pauta_meta/google/prog` | ✅ existe — `digital\|Seguimiento digital` · `SUMA` sobre `sd_pauta_*` | **un número** |
| `contenidos_total` · `gcba_contenidos_total` | ⛔ **sin fila** (censo del 22/08, sigue igual el 30/08) | el glifo de *no cableado*, **no un `1`** |

⇒ **Si la caja muestra `1`, es `pauta_*`.**

### ⛔ Corrección a la primera versión de este apartado, medida el 31/08

**Escribí que las columnas son booleanas y que `SUMA` da 1 porque `Number(true) === 1`. Medido, eso
es insuficiente y la mitad es falso.** En la solapa viva `digital|Seguimiento digital` (978 filas)
las tres columnas son **flags `0`/`1`**, y los unos son **22 · 43 · 36**:

| campo | col | valores |
|---|---|---|
| `sd_pauta_google` | T | `0` 927 · `1` **22** · vacío 29 |
| `sd_pauta_meta` | V | `0` 912 · `1` **43** · vacío 23 |
| `sd_pauta_prog` | U | `0` 918 · `1` **36** · vacío 24 |

⇒ **`SUMA` sobre la solapa entera daría 22/43/36, no 1.** El `1/1/1` sale del **recorte por
ventana**: dentro de 21–28 queda ~una campaña con la marca en cada plataforma.

⭐⭐ **La causa real, entonces, no es el tipo: es que la columna es un FLAG.** `SUMA` sobre un flag
**no falla — devuelve el conteo de verdaderos**, o sea *cuántas campañas tuvieron pauta*. Y la caja
promete *«Total de contenidos implementados»*, que es **otra magnitud**. La columna no puede darla.

⚠ **Generalización, con el barrido hecho y el cero declarado:** de los 220 marcadores, **exactamente
6 hacen `SUMA` sobre un campo `sd_*`** — y son estos seis. **No hay otros**, así que el defecto está
acotado.

⛔⛔ **Y el barrido destapó un segundo defecto que no estaba buscado: los seis tienen `dimensiones`
VACÍO.** `pauta_meta` y `gcba_pauta_meta` leen **la misma columna, sin filtro y sin corte** ⇒
**publican el mismo número**. Son **seis tokens con tres valores**, y las láminas de JM y GCBA
muestran lo mismo.

⚠ **Y ese mismo token ya tiene su propia historia de medición mal hecha**, que conviene no repetir:
el hallazgo *«los seis `pauta_*` publican un cero falso»* **era falso** —publican `1`, con estado
`ok`— y **llegó a un prompt antes de que nadie lo verificara contra el motor**.

⚠ `contenidos_total` ya está registrado en `CIERRE_POR_LAMINA.md` como **pregunta al equipo** desde
el 22/08. **No se arregla acá**, como pedía el prompt.

---

## 5 · La lista parqueada, tal como quedó

⛔ **El grano temporal no es un pendiente: es el límite.** GCBA queda en ~286 % y la lámina lo
publica como **acumulado rotulado**. No es un error corregible con un corte ni con una ventana.

**Abiertos, y ninguno bloquea lo cerrado acá:**

- ⛔ **La sección duplicada** (§3) — prompt propio, toca código.
- **La fila de JM que falta** (28 de 29), desde la primera medición del corte.
- **El default de `R-11`** contra la semana que el equipo publica.
- **El testigo sin período** — arreglado a medias: ahora imprime su ventana en el encabezado.
- **La ventana 21–27 que ajusta mejor sin causa conocida** — sigue **abierta**: la explicación que
  la había cerrado se cayó.
- **Las dos columnas de estado del desglose** — 160 de 343 filas discrepan; dejó de ser bloqueante
  con el `filtro` vacío. Y las **4 filas `PENDIENTE`** como refinamiento sin medir.
- **`P0` del `Libro`** · **`P2` del `||`** · **`enc_alcance`** · **las tres familias de
  `sin_datos`** · **el `1/1/1`** (§4).

---

## 6 · Lo que sigue — ⛔ el prompt del rótulo SE CANCELA

**Decisión del usuario, 31/08:** **no se hace** el `D-NN`, ni el rótulo en la lámina, ni el aviso de
los dos días de DV360. La decisión del 30/08 —las dos láminas publican **acumulado**— **sigue en pie
y está registrada acá y en `MEDICION_cableado_JDGAG_2026-08-30.md`**; lo que no se hace es **tocar la
plantilla**, que es del equipo (`C-01`).

⚠ **Consecuencia que hay que dejar dicha:** `L-031` y `L-032` publican acumulado **y no lo rotulan**.
Quien lea el deck dentro de seis meses ve ~157 % y ~286 % contra el tablero **sin nada en la lámina
que lo explique**. ⭐ **Es una OMISIÓN DECIDIDA, no un olvido**, y esa diferencia está anotada en
`PENDIENTES` para que se pueda distinguir.

**Dos prompts propios quedan, cuando el usuario los pida:**

1. **IVR** — los siete `ivr_*` sin `ambito`, y el hallazgo 2 sin cerrar: por qué `gcba_ivr_llamados`
   publica el global **teniendo `ambito=gcba`**. ⚠ **Parte 0 de sólo lectura primero**: si la causa
   está en la plantilla, **agregar `ambito=jm` no alcanza**.
2. **El duplicado de la campaña destacada** — `P0`, §3, con el conteo de láminas como criterio de
   aceptación.

**Y la lista parqueada (§5) queda tal como está, sin trabajarla.**
