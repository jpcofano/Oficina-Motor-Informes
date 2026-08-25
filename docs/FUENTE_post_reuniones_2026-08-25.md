# De qué solapa sale el POST de `L-036` — las seis candidatas, medidas

> **Estado:** congelado · **fecha de la medición:** 2026-08-25 · **pedido por el usuario**
>
> ⚠ **Es una foto fechada.** Todo lo de acá sale de dos fixtures en disco y responde por **sus**
> días: la base por el **20/08/2026**, el deck del equipo por el **31/07/2026**. No dice qué hay hoy.
>
> **Instrumento:** `tools/medir-solapas-post.py`, re-corrible. ⚠ **No reimplementa lógica del
> motor**: lee el dato crudo del `.xlsx` y busca dos ids literales. No parsea filtros, no resuelve
> `MAPEO`, no calcula ninguna operación.

---

## La pregunta, y por qué va antes que el `id_cuenta`

`L-036` quedó en `-` con **una sola candidata viva**: el `id_cuenta` del anclaje contra el ID de
`reuniones/Agenda JM | Post`. Antes de volver ahí, el usuario planteó una pregunta previa:

> *«Sólo JM tiene POST. Pero eso dice **quién genera** esos datos, no **en qué solapa están
> cargados**. Son dos cosas distintas.»*

⛔ **Si la fuente está mal elegida, el eslabón que se venía persiguiendo no existe.**

**Los dos encuentros de `julio_24_30` con etapa POST**, ya medidos el 24/08 cruzando por
Barrio/Comuna: `3346-JULJDGAG` (Retiro, 24/07) y `3354-JULJDGAG` (San Cristóbal, 23/07).

---

## Verificación de huellas — antes de citar cualquier número

| fixture | `sha256` | ✓ |
|---|---|---|
| `Seguimiento Digital  2026-08-20.zip` | `f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87` | ✅ coincide |
| `Informe 2026-07-31.zip` | `97310e16f49d2726e0b46d515f13d68d84f5ba13791c7bc57b05c8495e9a0ecb` | ✅ coincide |

⭐ **La base `reuniones` se identificó por su lista de SOLAPAS, no por el nombre del archivo**: se
llama `DGPLES _ Seguimiento ECVs (1).xlsx` y `BASES.reuniones.nombre` dice *«Base reuniones -
Digital - Call Center»*. **24 de 24 solapas** contra `SEED_SOLAPAS_`.

---

## 1 · Dónde aparecen los dos ids — las 24 solapas, no las tres del prompt

⚠ **Se barrieron las 24 a propósito.** El pedido nombraba tres, y *un prompt nombra los casos que
conoce, que es exactamente el sesgo que hay que compensar*. **Aparecen en seis.**

| solapa | ids | filas | encabezado |
|---|---|---|---|
| `Agenda JM` | 2 de 2 | 200 | fila 2 |
| `EDVs \| Estados` | 2 de 2 | 1.402 | — sin títulos conocidos |
| ⭐ **`Agenda JM \| Post`** | **2 de 2** | **650** | **fila 2 · 6 de 6 títulos, margen 6** |
| `Base_Digital` | 2 de 2 | 2.118 | fila 2 |
| `Métricas EDVs` | 2 de 2 | 1.502 | fila 2 |
| `Total` | 2 de 2 | 2.671 | — sin títulos conocidos |
| ⛔ **`Digital \| Base Post`** | **0 de 2** | — | fila 1 |

⛔ **`Digital | Base Post` —la solapa `ignorar` que el pedido listaba como candidata— no contiene
ninguno de los dos ids.** Queda descartada por dato, no sólo por su `uso`.

⭐ **Una sola fila por id en las cuatro solapas de una fila por encuentro.** Se contó: no hay una
fila PRE y otra POST escondidas que la lectura pudiera estar salteando. (`Base_Digital` sí tiene
varias —6 y 4—, porque su grano es campaña × plataforma.)

---

## 2 · Qué trae cada solapa · Retiro (24/07) y San Cristóbal (23/07)

⭐⭐ **Se buscó por CONCEPTO con alias, no por un único título**, y sin eso la medición habría salido
al revés: las dos solapas candidatas **llaman distinto a lo mismo**.

| concepto | `Agenda JM \| Post` | `Métricas EDVs` |
|---|---|---|
| Habitantes | `Habitantes` (5) | `Habitantes` (13) |
| Alcance | `Alcance` (6) | **`Alcance manual`** (14) |
| Impresiones | `Impresiones totales` (9) | **`Impr. totales`** (18) |
| Visualizaciones | `Visualizaciones` ×4 (12, 17, 22, 27) | ⛔ **no existe** |
| % VTR | `% VTR` ×4 (13, 18, 23, 28) | ⛔ **no existe** |

### ⭐ `Agenda JM | Post` — la única con las cuatro métricas Y con datos

| | Retiro (fila 95) | San Cristóbal (fila 94) |
|---|---|---|
| Habitantes | **41.475** | **41.240** |
| Alcance | **47.753** | 0 |
| Impresiones totales | **136.971** | 0 |
| Visualizaciones | col12 **41.204** · col17 7.892 · col22 12.083 · col27 21.229 | 0 en las cuatro |
| % VTR | col13 **0,30082** · col18 0,10300 · col23 0,40815 · col28 0,69044 | 0 en las cuatro |

### ⛔ `Métricas EDVs` — la candidata fuerte del pedido, REFUTADA

| | Retiro (fila 712) | San Cristóbal (fila 707) |
|---|---|---|
| Habitantes | 41.475 | 41.240 |
| `Alcance manual` | **0** | **0** |
| `Impr. totales` | **0** | **0** |
| `Cobertura` | **0** | **0** |
| Visualizaciones · % VTR | ⛔ **la columna no existe** | ⛔ ídem |

⭐ **Es superconjunto por ESQUEMA y no por DATO.** Sus 45 columnas cubren mail, digital, call e IVR
—y para el Recap de CABA (`1976-SEPJDGAG`) sí traen `Impr. totales = 9.063.800`—, pero **para los
dos encuentros de julio las métricas del POST están en cero**. Y **no tiene visualizaciones en
ningún nombre**, que son dos de las cinco columnas que `L-036` pedía.

⚠ **Su clasificación como `referencia` y no `fuente` era una decisión de alguien, no una medición
— y esta medición la respalda**: para lo que `L-036` necesita, no tiene el dato.

### Las otras cuatro

| solapa | qué tiene | por qué no sirve |
|---|---|---|
| `Agenda JM` | Habitantes (30), `Impresiones totales` (26), `% Cobertura` (33) | es el **PRE**: Retiro trae `Impresiones = 0` y San Cristóbal **42.500** — otros números, otra etapa. **Sin Alcance ni Visualizaciones** |
| `Base_Digital` | sólo `Visualizaciones` ×3 | grano campaña × plataforma, varias filas por id |
| `EDVs \| Estados` · `Total` | ninguna de las cinco | son solapas de **estado**, no de métricas |

---

## ⇒ Respuesta a la pregunta previa: **la fuente NO está mal elegida**

**`reuniones/Agenda JM | Post` es la única solapa de las 24 que tiene las cinco columnas de `L-036`
con datos para los encuentros de julio.** Las dos alternativas que el pedido señalaba quedan
descartadas **con dato**, no por descarte:

- `Métricas EDVs` **no tiene visualizaciones** y trae las demás **en cero**.
- `Digital | Base Post` **no contiene los ids**.

⇒ ⭐ **El `id_cuenta` sigue siendo la candidata viva de `L-036`.** La pregunta previa se contestó y
**no cambió el rumbo** — que es un resultado, no un trámite: la alternativa era descubrirlo después
de gastar el prompt siguiente en el eslabón equivocado.

---

## 3 · Contra el deck del equipo — ⛔ NO se puede cerrar con lo que hay en disco

El pedido lo ponía como el criterio que decide: *«la solapa correcta es la que reproduce los números
que el deck del equipo publica en esa lámina para julio»* — el método que cerró el Call Center.

⛔⛔ **No se puede aplicar, y por dos motivos que se suman:**

**1 · El deck del equipo del 24-31/07 NO TIENE la lámina que `L-036` reproduce.** Se listaron sus
**30 láminas**: las de encuentro son *«Uno a uno en barrios»* (slides 4-7), y **ninguna se llama ni
se parece a «Digital | ECVs: post reuniones»**. `Habitantes` aparece en dos láminas del deck
—slides 9 y 11, que son las de Primera Persona y Encuentro Temático—, **no en las de encuentro**.

**2 · La base y el deck son de días distintos, y esta solapa acumula.** El único fixture con la base
`reuniones` es el del **20/08**; el único deck del equipo con encuentros de julio es el del
**31/07**. Se verificó: **los cuatro libros del fixture del 31/07 son `looker`, `m2`, `rdv` y
`digital`** — `reuniones` **no está**. Veinte días de diferencia sobre una métrica que sigue
sumando.

⚠ **Es el caso `X-17` otra vez**, y conviene citarlo en vez de volver a descubrirlo: *no se puede
cerrar con lo que hay en disco*.

**Los números, para que quede el registro de que no cierran y por qué:**

| | deck del equipo (31/07) | `Agenda JM \| Post` (20/08) |
|---|---|---|
| Retiro · alcance | 36.694 | 47.753 |
| Retiro · impresiones | 378.880 | 136.971 |
| San Cristóbal · alcance | 47.232 | 0 |
| San Cristóbal · impresiones | 190.805 | 0 |

⚠ **Y el deck rotula «PRE + POST»**, así que su número **no es el POST solo** — es la suma de las
dos etapas. Aunque los fixtures fueran del mismo día, la comparación pediría sumar `Agenda JM` y
`Agenda JM | Post`, que es otra medición.

---

## ⭐⭐ El hallazgo lateral, y es el más valioso: los cuatro bloques son las PLATAFORMAS

`Agenda JM | Post` repite `Visualizaciones` y `% VTR` **cuatro veces**, y hasta hoy eso era *«un
título repetido que rompe `leerFuente`»*. **El deck del equipo dice qué son.** Su lámina de
encuentro publica el POST desglosado —`Meta` · `Google` · `Programmatic`, cada uno con sus
`IMPRESIONES` y `VISUALIZACIONES (VTR)`— con **la misma forma**.

⭐ **Y la identidad interna lo confirma al dígito**, sin depender del deck ni de una foto:

```
col12 / col9  =  41.204 / 136.971  =  0,300822801906973  =  col13 exacto
```

⇒ **`col12`/`col13` es el TOTAL**, y las otras tres son las plataformas. El `% VTR` de cada bloque
cierra contra **las impresiones de su plataforma**, no contra las totales — por eso `col28` da
`0,69044` sobre un denominador distinto.

### Lo que esto significa para `ae06a3b`, y es una decisión del usuario

El 25/08 se sacaron `vis_totales` y `vis_vtr_pct` del `MAPEO` porque `leerFuente` indexa por título
y **gana el último**, que es Programmatic. **Esa decisión sigue siendo correcta** — la medición la
respalda con los números: el motor habría publicado `21.229` y `69,0 %` donde el total es `41.204`
y `30,1 %`.

⭐ **Lo que la medición agrega es que el dato SÍ EXISTE**: está en la columna 12, es la primera
aparición del título, y su identidad interna cierra exacta. **Lo que falta no es la fuente: es una
forma de llegar a una columna cuyo título se repite.**

⛔ **No se propone ninguna acá**, y es a propósito: `D-31` ya midió que *de 12 solapas fuente, una
sola tiene títulos repetidos*, y su addendum decidió **no** hacer una excepción de lectura por letra
para un solo caso —*«nadie la va a recordar en un mes, y una regla que vale en un solo lugar es una
trampa con fecha»*—. Reabrirlo es del usuario.

---

## Lo que esta medición NO contesta

- **Cuál solapa reproduce el deck.** No hay par base-deck del mismo día para esta lámina, y el deck
  del equipo **ni siquiera tiene la lámina**. Queda abierto y necesita un fixture nuevo.
- **Qué dice la base hoy.** Esto es el export del **20/08/2026**.
- **Si el motor la lee así.** Se midió **qué trae la solapa**, no qué hace `leerFuente` con ella.
  Son dos afirmaciones distintas y ésta es la primera.
- **Nada sobre el `id_cuenta`**, que sigue siendo la candidata viva y se retoma con el usuario.
