# VALIDACIÓN — el deck que genera el motor contra el que publicó el equipo, misma semana

> **Congelado.** Nadie lo edita: si hay una corrida nueva, se crea otro (`CLAUDE.md` §7).
>
> Sesión del 22/08/2026, desatendida. **Es el tercero de su serie** —los anteriores son
> `docs/VALIDACION_2026-07-31.md` (SECCO) y `docs/VALIDACION_2026-08-09.md` (JM, dos semanas)—
> y **el primero que compara lámina por lámina el deck generado contra el deck publicado de la
> misma semana**. Los dos anteriores medían números contra las bases; éste mide **el producto
> terminado contra el producto terminado**.
>
> **Reemplaza a nada.**

---

## 1 · Qué se comparó, y con qué huella

**El deck del equipo** sale del fixture, verificado antes de citar un solo número
(`docs/_fixtures/README.md`, regla de método de `CLAUDE.md` §4):

| | |
|---|---|
| archivo | `docs/_fixtures/Seguimiento Digital  2026-08-20.zip` |
| `sha256` | `f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87` ✅ **coincide con la tabla de huellas** |
| deck adentro | `Informe semanal JM - (14_08 al 21_08).pptx`, 16.131.304 bytes |
| láminas | **19** — medido con `zipfile` sobre `ppt/slides/slideN.xml`, exacto |

**Los decks del motor** se leyeron con el conector de Drive, por ID:

| corrida | deck | período que usó | impresos | láminas | sello |
|---|---|---|---|---|---|
| `jm-20260821-194602` | `1_krz_dTgwVqFm8BbAIhxKl6VAvD3zMy1MYx9BUGlMnI` | `agosto_14_20` | 92 | ≈34 | **sin sello** → cerró |
| `jm-20260821-224727` | `10omnlzVY6nrwg6CX-EqyBIypTgQ6sY7XRB15JNkugC4` | `agosto_14_20` | 65 | — | ⛔ **`[en proceso]`** → cortó |
| `jm-20260821-230048` | `1lg-FcqM5VlDAo4HaFI_0AuKEQ6H1hx4s_nmVWdqhPO0` | `R-11 (calculado)` | 228 | ≈53 | **sin sello** → cerró |

⚠ **Las cuentas de láminas del motor son aproximadas**: el conector devuelve el texto por lámina
pero no las numera, así que salen de contar los separadores del volcado. La del equipo sí es
exacta.

⭐ **El sello cierra 0.3 del `2026-08-21_19` por un camino que no era el que el prompt pedía.**
El deck de la corrida que pintó 65 **conserva el `[en proceso]`** y el de la que pintó 92 no.
`generarInforme` sólo quita el sello con `!corte && !fallo`, así que el nombre del archivo **es la
declaración de que la segunda cortó** — y sobrevive en Drive aunque `FALTANTES` se haya pisado y
`corte` no se persista en ninguna hoja.

⚠ **Y una diferencia de encabezado que conviene tener a la vista:** el equipo titula
*"(14_08 al 21_08)"* y el motor *"vie 14/08 — jue 20/08"*. `R-11` define siete días, viernes a
jueves, extremos inclusive; el título del equipo nombra ocho. **No se resolvió acá** y puede
explicar parte de las diferencias de volumen de abajo.

---

## 2 · ⭐ Lo que reproduce EXACTO, y es más de lo que se esperaba

### 2.1 · La lámina de alcance del encuentro cierra al dígito, las seis cifras

Deck del equipo, lámina 7 (iceberg del Encuentro Temático de Salud) contra la misma lámina del
motor en `194602`:

| medida | equipo | motor | |
|---|---|---|---|
| Mail | 619 (72 %) | **619** (72,4 %) | ✅ |
| Digital | 96 (11 %) | **96** (11,2 %) | ✅ |
| Difusión | 10 (2 %) | **10** (1,2 %) | ✅ |
| Call + IVR | 130 (15 %) | **101 + 29 = 130** | ✅ |
| Inscriptos | 855 | **855** | ✅ |
| Asistentes | 186 (22 %) | **186** | ✅ |

⭐ **Las seis coinciden**, y la cuarta es más fuerte que una coincidencia: el equipo publica
`Call + IVR` sumados y el motor los publica **desagregados**, `101` y `29`, que suman exacto.
Eso no puede salir de una casualidad: es la misma partición de filas leída con dos granos
distintos.

**Esto es lo que hay que no romper.** Es la única lámina del deck donde el motor está terminado.

### 2.2 · Mail de JM: difiere en **un** mail

| medida | equipo | motor | diferencia |
|---|---|---|---|
| Mails entregados (JM) | 538.291 | **538.290** | **−1** (0,0002 %) |
| Aperturas (JM) | 208.765 (39 %) | 209.693 (39 %) | +928 (0,44 %), **mismo %** |

**La rama de mail de `R-15` —el corte JM/GCBA por canal— está bien enganchada.** Es coherente
con `VALIDACION_2026-08-09`, que ya la había verificado contra las bases; acá se confirma contra
el número publicado, un mes después y con otra semana.

### 2.3 · La aritmética interna del motor es consistente en los dos resúmenes

Las tres plataformas suman el total, en los dos decks y en los dos ámbitos:

```
equipo JM   2.167.036 + 905.782 + 3.415.037 = 6.487.855      ✅
motor  JM   2.772.092 + 1.422.970 + 24.668.823 = 28.863.885  ✅
equipo GCBA 28.005.174 + 19.363.578 + 45.183.256 = 92.552.008    ✅
motor  GCBA 38.828.661 + 57.987.343 + 163.564.571 = 260.380.575  ✅
```

⭐ **Es un dato que acota el problema y hay que decirlo:** el motor **no** se equivoca sumando.
Lo que difiere es **qué filas entran**, que es exactamente la familia de `R-21` y del *número
plausible*.

---

## 3 · Lo que no cierra, ordenado por qué trabajo manda a hacer

### 3.1 · ⛔ `N envíos de Mail` y `N envíos de SMS` publican **piezas**, no envíos

Tres casilleros, dos láminas, y el número que publican **es correcto para otra pregunta**:

| casillero | equipo | motor | qué está publicando el motor |
|---|---|---|---|
| `envíos de Mail` (JM) | **6** | 541.002 | los mails **enviados** (entregados: 538.290) |
| `envíos de Mail` (GCBA) | **73** | 2.361.163 | ídem (entregados: 2.334.800) |
| `envíos de SMS` (GCBA) | **3** | 29.979 | ídem (entregados: 27.936) |

**La prueba de que es eso y no otra cosa:** en los tres casos el número del motor está apenas por
encima del «entregados» de la misma lámina, que es la relación enviados → entregados. El token
mide **volumen de piezas** donde el rótulo pide **cantidad de tandas**.

⚠ **Es el peor modo de falla del proyecto en su forma más pura:** el número es correcto, la
aritmética cierra, nada falla, y **el rótulo miente**. Un lector que no tenga el deck del equipo
al lado no tiene con qué sospechar.

### 3.2 · ⛔ `Total de contenidos implementados` publica **1**

| | equipo | motor |
|---|---|---|
| JM | 28 — Meta 10 · Google 8 · Programmatic 10 | `/////` — Meta **1** · Google **1** · Programmatic **1** |
| GCBA | 270 — Meta 95 · Google 63 · Programmatic 112 | `/////` — Meta **1** · Google **1** · Programmatic **1** |

**Los seis `pauta_*` publican `1`.** Es la confirmación en producción de lo que `CLAUDE.md` §4 ya
nombraba como corregido a medias —*"los seis `pauta_*` publican un cero falso"*, que era falso:
**publican `1`**—. Seis casilleros, y el total que los corona sale `/////`.

### 3.3 · Las impresiones de digital: Meta y Google en el mismo orden, **Programmatic 7×**

| plataforma | equipo JM | motor JM | ratio | equipo GCBA | motor GCBA | ratio |
|---|---|---|---|---|---|---|
| Meta | 2.167.036 | 2.772.092 | **1,28×** | 28.005.174 | 38.828.661 | **1,39×** |
| Google | 905.782 | 1.422.970 | **1,57×** | 19.363.578 | 57.987.343 | **2,99×** |
| Programmatic | 3.415.037 | 24.668.823 | ⛔ **7,22×** | 45.183.256 | 163.564.571 | ⛔ **3,62×** |
| **total** | 6.487.855 | 28.863.885 | 4,45× | 92.552.008 | 260.380.575 | 2,81× |

⭐ **Los ratios son distintos por plataforma, así que no es un multiplicador global ni una ventana
mal puesta que afecte a todos por igual.** Meta está a un 28-39 % de más; Programmatic, entre
3,6× y 7,2×. **El sospechoso no es la ventana: es qué filas de Programmatic entran.**

⚠ **Y `Frecuencia` no sale en ninguno de los dos ámbitos:** JM `-` contra `6`, GCBA `-5.06-`
contra `18,5`. El `-5.06-` es un valor con símbolo de faltante alrededor, o sea que **hay un
número y el motor lo está marcando como no publicable** — eso es distinto de no tenerlo, y manda
a un trabajo distinto.

### 3.4 · Call Center y Base discada: `/////` en las dos láminas

| | equipo JM | equipo GCBA | motor |
|---|---|---|---|
| campañas de Call Center | 3 | 8 | `/////` |
| Base discada | 6.851 | 19.788 | `/////` |
| Contactados | 1.616 (24 %) | 7.308 (37 %) | `///// (/////%)` |

**Nadie los cableó** — el `/////` significa exactamente eso y acá dice la verdad.

### 3.5 · M2: ⭐ el numerador coincide y el denominador no

| medida | equipo | motor | |
|---|---|---|---|
| Aperturas (OR) | 194.381 | **194.070** | −311 · **0,16 %** |
| Clics (CTOR) | 3.748 | **3.620** | −128 · 3,4 % |
| Mails enviados | 760.702 | 687.457 | ⛔ **−9,6 %** |
| Mails entregados | 752.254 | 679.900 | ⛔ **−9,6 %** |
| % OR publicado | 26 % | **28,5 %** | el % se corre porque el denominador se corre |
| envíos | 24 | 33 | |
| unidad | 14 **Proyectos** | 21 **Campañas** | rótulos distintos, conceptos distintos |

⭐ **Ése es el patrón que `CLAUDE.md` §4 nombra para distinguir qué se movió:** las aperturas
—el numerador— coinciden casi exacto, y los enviados/entregados —el denominador— faltan un 9,6 %.
**Si el motor leyera menos filas, las aperturas también bajarían.** No bajan. Así que el
numerador y el denominador **no salen del mismo conjunto de filas**, y ése es el hallazgo, no el
porcentaje.

### 3.6 · ⛔ La lámina de RRSS publica los datos de la semana pasada, y **nada lo dice**

El motor publica, en el primer bloque: `85 % · 99 % · 98 % · 98 %`, promedio `95 %`, *"8.813
menciones… 4.7M visualizaciones"*, y el tema *"video de un hombre agrediendo a una niña en
Palermo"*. **El deck del equipo trae exactamente eso mismo en su primer bloque** — y en el
segundo trae los datos nuevos: `84 % · 98 % · 94 % · 98 %`, promedio `94 %`, *"9.707 menciones…
3.94M"*, tema *"acto por el 176° aniversario…"*. El segundo bloque del motor sale entero
`/////`.

⭐ **Los dos bloques no son iguales para el motor y hay que entender por qué:** el primero **no
tiene tokens** —es texto fijo de la plantilla— así que el motor no lo toca y sale intacto; el
segundo sí los tiene y sale `/////`.

⚠ **Y eso hace que la misma lámina mienta de dos formas opuestas a la vez:** el bloque que el
motor **no toca** publica datos viejos **sin ninguna marca**, y el que sí toca declara
correctamente que nadie lo cableó. **Un número obsoleto sin marca es peor que un `/////`**: el
`/////` manda a cablear, el número viejo no manda a nada porque nadie sabe que está viejo.

### 3.7 · ⛔ La campaña destacada no coincide, y en la última corrida sale vacía

| | |
|---|---|
| equipo | *Desarticulación de banda narco en Barrio Mugica (Lugano)* |
| motor `194602` | *Cambio de sentido calle: Futaleufú* |
| motor `230048` | `-` (vacía) |

**Las tres son distintas.** La sección `campana` emitió **dos** ítems en `194602` —el segundo con
el nombre vacío— y **uno** en `230048`, también vacío. `docs/CONFIG_INFORMES.md` es dueño de *"qué
campañas lleva cada informe"*; esto es evidencia para esa decisión, no una corrección del motor.

### 3.8 · Las cuatro láminas de campaña salen prácticamente enteras en `/////`

*Herramientas y audiencias*, *Formatos digitales*, *Resultados desagregados | Digital* y
*Resultados desagregados | Directa: envío de mail* salen con todas sus celdas en `/////` contra
una tabla completa del lado del equipo (láminas 11 a 15 de su deck). **Nadie las cableó** — y son,
en volumen, la mayor parte de los faltantes del deck.

---

## 4 · Los defectos estructurales, que no son de número

### 4.1 · ⛔⛔ En la última corrida las portadas no corresponden a su contenido

Medido sobre `230048`, y es el hallazgo más grave del documento:

| portada | lámina que le sigue |
|---|---|
| *Encuentro con Vecinos — **Boedo*** | *Estrategia de comunicación: **San Cristóbal*** |
| *Encuentro Temático "Salud" — Parque Patricios* | tres icebergs **distintos**, con tres juegos de números |
| — | un iceberg de **Retiro** sin portada propia delante |

⭐ **Y la prueba de que los datos se repartieron mal, no de que falten:** la lámina del Encuentro
Temático de Salud aparece **tres veces con tres juegos de cifras**, y una sola es la buena:

| copia | Digital | Inscriptos | Asistentes | Mails entregados |
|---|---|---|---|---|
| A | 1.141 | 1.901 | 203 | `-` |
| B | 223 | 983 | 196 | `-` |
| **C** | **96** | **855** | **186** | 12.149 |

**La C es la correcta** — coincide con el equipo (§2.1). Las otras dos publican números de otros
ítems bajo el mismo título.

### 4.2 · ⭐⭐ Los números de IVR y Call Center del equipo **el motor los tiene, exactos, en la copia equivocada**

En la copia **B** de arriba —la que dice *Parque Patricios* y trae los inscriptos de otro ítem—
aparecen estos cuatro:

| medida | equipo | motor, copia B |
|---|---|---|
| Atendidos | 96.549 (90 %) | **96.549** ✅ |
| Marque 1 | 304 | **304** ✅ |
| Escucha +75 % | 33.139 (34 %) | **33.139 (34,3 %)** ✅ |
| Audiencia / Llamados | 107.194 | **107.194** ✅ |

⛔ **En la corrida con el temario correcto (`194602`) esos mismos cuatro casilleros salen `-`.**

⭐ **Lo que esto significa, y cambia una prioridad:** el cableado de IVR y Call Center del iceberg
**existe y da exacto contra el número publicado**. Lo que falla no es el cableado: es **qué ítem
le llega**. Es un trabajo mucho más chico que "cablear IVR", y estaba escondido detrás de un
`-`.

⚠ **Lo que este documento NO puede decir es por qué.** Dos candidatos y ninguno medido: que el
anclaje le asigne al ítem la cuenta de otro, o que la ventana sin filtro de `R-11` traiga la fila
que el temario recortado deja afuera. **Se mide, no se razona.**

### 4.3 · ⛔ La lámina de M2 digital y la portada de campañas se duplican por ítem de campaña

En `194602`, con dos ítems de campaña, la lámina `M2 | Digital | Status semanal` —la que lleva sus
**veinte `{{m2_*}}` crudos**— aparece **dos veces**, y la portada *Campañas destacadas · GCBA*
también. `LAMINAS` declara `L-039` como `seccion_id = m2`, no `campana`:

```
L-038  jm  m2_status  9        L-039  jm  m2  10  escondida
L-040  jm  campana    11  …    L-048  jm  campana  19  escondida
```

**Una lámina declarada `m2` no debería multiplicarse con los ítems de `campana`.** Va como
hallazgo: la causa —si el bloque modelo se calcula por rango de `orden_plantilla` y se lleva
puesta la lámina de al lado— **hay que medirla**, no deducirla.

### 4.4 · Los dos bloques de campaña no salen simétricos

El primer bloque de `194602` tiene **ocho** láminas y el segundo **nueve**: la de *Directa:
respuestas* —con sus `{{camp_resp_*}}` crudos— aparece **una sola vez**, al final del segundo.
Anotado; no medido.

### 4.5 · El universo del deck: 19 láminas contra ≈34 y ≈53

| deck | láminas | encuentros que publica |
|---|---|---|
| equipo | **19** (exacto) | **2** — Parque Avellaneda (1 a 1) y Salud en Eje Sur |
| motor `194602` | ≈34 | **2** — los mismos ✅ |
| motor `230048` | ≈53 | ⛔ **Villa Urquiza · Boedo · San Cristóbal · Retiro · Mataderos · Parque Patricios** — junio y julio adentro |

⭐ **`230048` es la evidencia publicada del pendiente P1 del 21/08** (`PENDIENTES_consistencia.md`):
el período calculado y el elegido dan la misma ventana de fechas y **distinto temario**, porque
`anclarEncuentros` sólo recorta `REUNIONES` cuando el `origen` empieza con `periodo_ref:`. Acá se
ve en el producto: **un deck de veinte láminas de más, con encuentros de dos meses atrás, que
salió sin que nada fallara.**

⚠ **Y `194602` prueba lo otro que el pendiente afirmaba:** con el período elegido, los dos
encuentros que salen **son exactamente los dos del deck del equipo**.

---

## 5 · El tablero, en una tabla

| bloque | veredicto |
|---|---|
| Alcance del encuentro (6 cifras) | ✅ **exacto** |
| Mail JM del resumen ejecutivo | ✅ **exacto salvo 1 mail** |
| Aperturas M2 | ✅ 0,16 % |
| Aritmética de los resúmenes | ✅ **consistente** |
| Selección de encuentros con período elegido | ✅ **los dos correctos** |
| IVR / Call Center del iceberg | ⚠ **exacto, en la copia equivocada** |
| Mails/SMS entregados GCBA | ⚠ 3 % |
| M2 enviados/entregados | ⛔ −9,6 %, con el numerador quieto |
| Impresiones Meta / Google | ⛔ 1,3–3× |
| Impresiones Programmatic | ⛔ **3,6–7,2×** |
| `N envíos de Mail` / `de SMS` | ⛔ **mide piezas, no envíos** |
| `Total de contenidos` (6 `pauta_*`) | ⛔ **publica 1** |
| Frecuencia | ⛔ no publica |
| Call Center del resumen | ⛔ sin cablear |
| Cuatro láminas de campaña | ⛔ sin cablear |
| Campaña destacada | ⛔ no coincide / vacía |
| RRSS | ⛔ **publica la semana pasada sin marcarlo** |
| Reparto de ítems entre copias | ⛔⛔ **mezclado** |
| Selección de encuentros sin período | ⛔⛔ **seis encuentros de más** |

---

## 6 · Lo que este documento NO contesta

- **Ninguna causa está medida contra las bases.** Todo lo de arriba es *deck contra deck*. El
  camino del fixture —abrir los `.xlsx` del mismo zip y reproducir la definición— **no se
  recorrió**, y es lo que separa *"la definición está mal"* de *"el motor la lee mal"*
  (`CLAUDE.md` §4, los tres caminos).
- **La ventana de ocho días del título del equipo** (*14_08 al 21_08*) contra los siete de `R-11`
  no se descartó como causa de las diferencias de volumen. Es lo primero que hay que medir antes
  de perseguir Programmatic.
- **`224727` no se leyó**: cortó, y su deck sigue sellado. Se lo cita sólo por el sello.
- **Los 552 faltantes de `230048`** no se miraron; van contra `FALTANTES`, no contra un deck.

---

## Addendum · 2026-08-22 (tarde) · Dos correcciones al documento de arriba

**No se edita una línea del texto original** — describe lo que se midió el 22/08 a la mañana y ése
es el dato. Lo que sigue lo corrige con lo medido después, el mismo día (`CLAUDE.md` §7, addenda
fechados).

### A.1 · ⏸ La recomendación «mirar primero la ventana de ocho días» queda **condicionada**

§6 y la tabla del §5 dicen que antes de perseguir Programmatic hay que descartar la ventana de ocho
días del título del equipo. **Eso sigue siendo lo correcto como orden**, pero ya no es una tarea
abierta: **la mide la Parte 0.2 del `2026-08-22_21`**, con un dato que este documento no tenía.

⭐ **El dato, del usuario, 22/08: las bases de ese zip se bajaron el jueves.** Eso no bloquea la
medición — **la hace más limpia**, porque una base que corta el jueves **no puede** haber producido
un número de ocho días. Los dos desenlaces y qué le pasa a este documento en cada uno:

| desenlace | qué le pasa a este reporte |
|---|---|
| **los siete días reproducen** | el título del equipo es decorativo, `R-11` estaba bien, y **la ventana queda descartada como causa**. ⛔ Entonces la recomendación de arriba **queda vencida** y hay que leerla al revés: Programmatic 3,6–7,2× y las demás diferencias de volumen **vuelven a estar sin explicar**, y el trabajo es buscarlas en otro lado |
| **no reproducen** | el equipo generó su deck con una base **más fresca** que este fixture. Entonces **este fixture no puede cerrar volúmenes**, y eso es un límite del fixture y no un bug del motor. Los marcadores de volumen van `sin_resolver` **por fixture desactualizado** — no con un veredicto que la evidencia no sostiene |

⚠ **En los dos casos, todo lo que siga usa siete días.**

### A.2 · ⭐ Hay una cuarta corrida, y es mejor testigo que las tres de la tabla

La tabla del §1 lista tres corridas. **Falta la que corrió después y es la buena**, leída de
`CORRIDAS` el 22/08:

| corrida | período | impresos | faltaron | etapa 4 | corte |
|---|---|---|---|---|---|
| `jm-20260821-234927` | `agosto_14_20` | **127** | 277 | **48 s** (209 → 257) | **ninguno** |

⭐ **Cierra retroactivamente el 0.3 del `2026-08-21_19`, y por el lado que faltaba.** Aquél
concluyó que `224727` pintó menos **porque cortó**, no por una regresión del `_15`. Ésta lo
confirma por el otro extremo: **mismo período, mismo universo de 404 datos, sin corte, y 127
impresos** — 35 más que los 92 de `194602`, que es el efecto del `_15` que la corrida cortada no
dejó ver. **La conclusión no dependía de esta corrida, pero ahora tiene su control positivo.**

⚠ **Y es el testigo que hay que citar de acá en más**, no `194602`: mismo período y temario, y **la
única de la semana que llegó al final sin cortar**.
