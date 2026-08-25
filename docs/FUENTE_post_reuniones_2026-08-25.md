# De qué solapa sale el POST de `L-036` — las seis candidatas, medidas

> **Estado:** congelado · **fecha de la medición:** 2026-08-25 · **pedido por el usuario**
>
> ⛔⛔ **SU CONCLUSIÓN PRINCIPAL ES FALSA — ver el ADDENDUM 1 al final, del mismo día.** La fuente
> de `L-036` es `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, no `reuniones/Agenda JM | Post`. El cuerpo se
> conserva sin editar porque **cómo se llegó a la conclusión equivocada es la mitad de su valor**.
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

---
---

# ⛔⛔ ADDENDUM 1 — 25/08/2026, mismo día · **la conclusión de arriba está MAL**

> **No se edita una línea del texto original.** Lo de arriba queda como está, porque **cómo se llegó
> a una conclusión equivocada es la mitad del valor de este documento**. Esto lo corrige.

**Lo trajo el usuario:** `L-036` sale de **`digital/CAMPAÑAS_DESGLOCE_DIGITAL`**, filtrando por
`Id cuentas` + `Nombre Campaña` que trae «Post». **No de `reuniones/Agenda JM | Post`.**

⭐⭐ **Y la pieza ya estaba implementada:** `DIMENSIONES_.etapa` (`Fuentes.gs`) traduce
`post` → `des_campana~=Agenda Post` sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL`. **Es lo que usan los
24 `u1_*` del «1 a 1» desde antes** — y lo medí yo mismo el 25/08 al corregir una premisa del propio
usuario sobre el 1 a 1. **La tenía delante y la busqué en otra base.**

---

## ⛔⛔ El error de método, y es el que hay que anotar

**La fuente se eligió por el NOMBRE DE LA SOLAPA —`Agenda JM | Post`— y nunca se verificó contra el
dato.** La solapa correcta **no tiene «post» en el título: lo tiene en una COLUMNA**.

⚠ **Es la misma trampa que `reuniones`/`REUNIONES`, pero entre una solapa y un VALOR.** Allá dos
cosas se llaman igual; acá **la cosa correcta no se llama como lo que busca**, así que buscar por
nombre **no da un falso positivo: da un cero**, y el cero se lee como *«no existe»*.

⭐ **Y lo que lo hizo durar cuatro días es que el nombre acertaba lo suficiente.**
`Agenda JM | Post` **sí tiene** datos del post, **sí** tiene las columnas, y el `MAPEO` resolvía. La
medición de arriba lo confirmó todo — y **confirmó la solapa equivocada**, porque preguntó *«¿esta
solapa tiene el dato?»* y nunca *«¿de dónde sale este dato?»*. Son dos preguntas y sólo la segunda
elige una fuente.

---

## ⭐⭐⭐ Y hay algo mejor que una corrección: `Agenda JM | Post` es un AGREGADO DERIVADO

**Medido sobre el mismo fixture del 20/08, y cierra AL DÍGITO en las cuatro columnas.** Las filas
POST de `3346-JULJDGAG` (Retiro) en `CAMPAÑAS_DESGLOCE_DIGITAL`, sumadas por plataforma:

| plataforma | impresiones | visualizaciones | ⇒ dónde aparece en `Agenda JM \| Post` |
|---|---:|---:|---|
| Meta | 76.620 | **7.892** | `Visualizaciones` col **17** ✅ |
| Google ads | 29.604 | **12.083** | `Visualizaciones` col **22** ✅ |
| DV360 | 30.747 | **21.229** | `Visualizaciones` col **27** ✅ |
| **TOTAL** | **136.971** | **41.204** | `Impresiones totales` col 9 · `Visualizaciones` col **12** ✅ |

⇒ ⭐⭐ **Los cuatro bloques repetidos de `Agenda JM | Post` son TOTAL · Meta · Google · Programmatic,
y son exactamente la suma de las filas POST del desglose.** El cuerpo de arriba había inferido que
*«los cuatro bloques son las plataformas»* mirando el deck del equipo — **la inferencia era correcta
y la fuente era la derivada.**

⚠ **Y eso cambia el estatus de `Agenda JM | Post`:** no es *«otra fuente candidata»*, es **la misma
fuente pre-sumada por el equipo**. Leerla no está mal por el dato — está mal porque **es un agregado
de alguien más**, sin trazabilidad de qué filas entraron, y con los títulos repetidos que ya
obligaron a retirar dos columnas del `MAPEO` (`ae06a3b`).

---

## ⛔⛔ El hallazgo grave, y NO es de `L-036`: hay DOS convenciones de nombre y el motor ve una sola

Medido sobre las 5.161 filas de datos de `CAMPAÑAS_DESGLOCE_DIGITAL`:

| regla | filas | |
|---|---:|---|
| **contiene «Agenda Post»** — lo que hace `DIMENSIONES_.etapa` | **166** | 2025: 9 · 2026: 151 |
| **empieza con «Post»** — como lo describió el pedido | **137** | 2026: 136 |
| ⛔ **intersección** | **0** | **son DISJUNTAS** |

**Dos convenciones para lo mismo, y conviven en 2026:**

- `Agenda Post con 1 - 1 A 1 - Retiro - 24/7` → el motor **la ve**
- `Post Agenda RDV Con 1 - Salud Eje Norte 10/6` → el motor **NO la ve**

⛔⛔ **El ejemplo que pasó el usuario es del segundo grupo.** `3143-JUNJDGAG` reproduce exacto —Meta
902.299/87.872, Google ads 325.764/278.982, DV360 1.296.072/716.921— y **sus tres filas POST son
invisibles para `des_campana~=Agenda Post`**.

⚠ **Esto no es un problema de `L-036`: es de los 24 `u1_*` que ya están en producción.** Para las
cuentas de **julio** la convención es `Agenda Post …` y el filtro funciona; para **junio** es
`Post Agenda …` y **no**. Un `etapa=post` sobre un encuentro de junio devuelve **cero filas**, y eso
no falla — publica `sin_datos`.

⭐ **Va como hallazgo aparte y con su propia medición.** Arreglarlo es cambiar el patrón de
`DIMENSIONES_.etapa`, que **mueve números publicados de los `u1_*`** — no entra en una corrida sin
usuario.

---

## Las tres preguntas que el usuario pidió medir

### 1 · Los encuentros de `julio_24_30` en el desglose

⛔ **El temario real de esa semana tiene TRES encuentros, no cuatro**
(`docs/TEMARIOS_reales_2026-08-25.md`): San Cristóbal 23/07, Retiro 24/07, Orden Público 28/07.

| encuentro | `Id cuentas` | filas POST | plataformas |
|---|---|---:|---|
| San Cristóbal (23/07) | `3354-JULJDGAG` | **0** | — |
| Retiro (24/07) | `3346-JULJDGAG` | 5 | Meta ×2 · Google ads ×2 · DV360 |
| Orden Público (28/07) | `3387-JULJDGGC` | 3 | Meta · Google ads · DV360 ×2 |

⚠ **`3387` es `…JDGGC`, no `…JDGAG`** — el sufijo de la cuenta cambia y **no se puede derivar**.

⭐ Y dentro de la ventana 24-30/07 hay **otros dos** con POST que el temario no nombra: `3389`
(Nueva Pompeya 29/7) y `3420` (Caballito 29/7). **Qué encuentros entran lo decide `R-21`, no el
desglose** — se anota para que nadie lo tome como que son cuatro.

### 2 · Qué columnas cubren las ocho de la lámina

Las 26 columnas de `CAMPAÑAS_DESGLOCE_DIGITAL`, contra las 8 de `L-036`:

| columna de la lámina | en el desglose | |
|---|---|---|
| **Campañas** | `Nombre Campaña` (4) | ✅ |
| **Período** | `Fecha inicio` (8) · `Fecha fin` (9) | ✅ y ⚠ ver abajo |
| **Formato** | `Nomenclatura` (11) | ⚠ **campos variables**, ver abajo |
| **Impresiones** | `Impresiones` (14) | ✅ |
| **Visualizaciones** | `Visualizaciones` (15) | ✅ |
| **VTR%** | — | ⭐ **derivable**: `Visualizaciones / Impresiones` |
| **Alcance** | ⛔ **NO existe** | |
| **Habitantes** | ⛔ **NO existe** | |

⭐ **Habitantes y Alcance son lo que `Agenda JM | Post` sí aportaba**, como el usuario sospechaba.
Habitantes vive en tres solapas de `reuniones` (`Agenda JM | Post` col 5, `Métricas EDVs` col 13,
`Agenda JM` col 30) y **es del barrio, no de la campaña** — así que no puede salir de una solapa por
plataforma. **`Alcance` no está en el desglose en ningún nombre.**

⚠ **`Nomenclatura` es de campos variables y su posición cambia por plataforma** — para Retiro, Meta
trae `… | Meta | 15 | Alcance | …` y Google `… | YouTube | Video | Vistas`. Es el mismo bloqueo que
`CIERRE_POR_LAMINA.md` ya declaró para `camp_formato1-3` de `L-043`.

⚠ **Y el período cruza meses:** las dos filas de Google ads de Retiro son `mes = JULIO` y
`mes = AGOSTO`, con el mismo `Fecha inicio`. Un recorte por `Mes` partiría el encuentro.

### 3 · ⭐⭐ Si la lámina es por PLATAFORMA — **sí, y hay tres evidencias que apuntan igual**

**La tabla, extraída del testigo `2026-08-22` (sha `cd6f0050…`), es 4 filas × 8 columnas**, con la
primera columna rotulada `Campañas` y un `DIGITAL` con `gridSpan=7` encima de las otras siete.

| evidencia | qué dice |
|---|---|
| ⭐⭐ **`Formato` es por plataforma** | `Nomenclatura` da `Video` en Google y `Banners` en DV360 **para la misma campaña**. Una fila por encuentro **no puede** tener un solo formato |
| ⭐⭐ **El deck del equipo publica así** | su lámina *«Uno a uno en X»* trae el POST desglosado **Meta · Google · Programmatic**, con `IMPRESIONES` y `VISUALIZACIONES (VTR)` por plataforma |
| ⭐⭐ **`Agenda JM \| Post` tiene 4 bloques** | TOTAL + las mismas tres plataformas, y **cierra al dígito** con la suma del desglose |
| ⚠ **el temario da 3, no 4** | por encuentro la tabla tendría **tres** filas y una vacía; por plataforma tiene **3 + total**, o 4 ranuras para hasta 4 plataformas (`TikTok` aparece en otras cuentas) |

⇒ ⛔ **El diseño entero cambia, y por eso esto para acá:** `FILA` sobre las filas POST de **UNA**
cuenta agregadas por plataforma, **no** sobre los encuentros del temario. Eso invalida:

- **Los 12 marcadores vigentes** (`post_{habitantes,alcance,impresiones}{1..4}`), que hacen `FILA`
  con `valor_fijo = n` sobre `reuniones/Agenda JM | Post` ordenado por `fecha_periodo`.
- **`filasDeSolapaDelTemario_`**, que elige las filas **por el `id_cuenta` del anclaje de cada
  encuentro del temario** — la unidad equivocada.
- **Las 7 filas de `MAPEO`** de esa solapa.
- ⭐ **Y la regla de «métrica > 0»**, que existía para descartar encuentros sin post: con el desglose,
  **un encuentro sin post simplemente no tiene filas** — la regla deja de hacer falta.

⚠ **Lo que NO cambia:** `Habitantes` y `Alcance` siguen sin fuente en el desglose. **Son la pregunta
abierta del rediseño**, y `Alcance` no está en ninguna solapa medida hasta ahora.

---

## ⛔ Lo que sigue sin poder medirse

- **Cuál de las 4 ranuras es el TOTAL, o si son 4 plataformas.** Necesita ver la lámina **pintada**
  del equipo para esta semana, y el deck del 31/07 **no tiene esta lámina**.
- **De dónde sale `Alcance`.** No está en el desglose ni se midió en otra solapa con ese grano.
- **Si el `Formato` se puede extraer de `Nomenclatura`** sin un parser por plataforma.
