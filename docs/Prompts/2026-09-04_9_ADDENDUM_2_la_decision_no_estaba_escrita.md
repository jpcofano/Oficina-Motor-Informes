# Addendum 2 — `2026-09-04_9_alcance_de_campana.md`

**Fecha:** 05/09/2026 · ⛔ **No hay defecto de mapeo. El `_9` cambia de objeto.**
Se lee junto con el Addendum 1, que ya invalidó el veredicto de las 1031 filas.

---

## 1 · Lo que el usuario fijó, y lo que cae

> **El alcance de las campañas destacadas sale del mismo lugar que los demás datos de campaña.**
> **Se usa `meta_alcance` porque es el único que hay.**
> **Probablemente los alcances no cierren.**

⇒ **`alcance` → `meta_alcance` no es un error de una celda: es una decisión tomada.** No hay
columna de alcance total en la solapa, y se publica la única disponible.

⛔ **Cae la Parte A del `_9` y cae mi lectura entera del mapeo.** Escribí que *«un total que lee la
columna de una plataforma no es un total»* y que se arreglaba en `MAPEO`. **No hay nada que
arreglar.**

⚠ **Y también cae la explicación que daba por cerrada:** dije que el mapeo explicaba «de una» todo
lo observado. **No explica nada** — el número que publica el motor es el que la fuente tiene para
Meta, y la diferencia con el equipo sigue entera y sin causa.

---

## 2 · ⭐⭐ Lo que sí queda, y es lo que hace falta escribir

La decisión existe y **no está registrada en ninguna parte del repo**. Por eso el análisis del deck
la leyó como un bug, y por eso el diagnóstico se fue a buscar desempates en 1031 filas.

⭐ **Ese es el costo medido, no hipotético:** dos vueltas de análisis, un diagnóstico mal apuntado y
dos addenda. Todo por una justificación que vive en la cabeza del usuario y no en el repo.

⚠ Y **una justificación que describe un estado vence sola.** *«`meta_alcance` es el único que hay»*
es un estado: el día que la fuente agregue una columna de alcance total, la decisión queda vencida
y nadie se entera. ⇒ Se escribe la **condición** que la invalida, para que un censo pueda mirarla.

### Parte A (reemplaza a la del `_9`) — Registrar la decisión · **Opus** · effort alto

⇒ **Consultar el ruteo de `CLAUDE.md` §7 para saber dónde va** —`REGLAS_NEGOCIO.md`,
`CONFIG_INFORMES.md` o `PLAN.md`—. **No elegir por costumbre**, y **greppear antes de asignar** un
`R-NN` o `D-NN`.

La forma, escrita como condición y no como estado:

> **El alcance total de campaña (`camp_alcance`) publica el alcance de Meta**, porque
> `resumen_metricas_dinamico` no tiene columna de alcance total. **Decisión del usuario, 05/09/2026.**
> ⚠ **Vence si esa solapa incorpora una columna de alcance total o multiplataforma.**
> ⛔ **No se suma por plataforma:** la suma no es un alcance —una persona alcanzada por dos
> plataformas contaría dos veces—, y por eso la ausencia de columna no se resuelve sumando.

⭐ Y anotar la consecuencia que ya está publicada, para que no se descubra de nuevo: **la caja de
«alcance de Meta» de `L-046` y la de «alcance total» de `L-045` muestran el mismo número** porque
**es el mismo token pintado dos veces** — no hay marcador de alcance por plataforma. **Es correcto
dada la decisión**, y se ve raro sin ella.

Un commit de documentación.

---

## 3 · La diferencia con el equipo sigue abierta, y ahora está sola

| | motor | equipo |
|---|---|---|
| alcance de Meta | **872.827** | **1.271.754** |

⭐⭐ **Es la misma métrica, de la misma plataforma, en la misma semana.** Sin el mapeo como
explicación, lo que queda es que **`meta_alcance` en `looker` no dice lo que el equipo publica para
Meta** — y eso es de la fuente, no del motor.

⚠ **El usuario ya avisó que probablemente no cierren.** ⇒ **Eso no es una razón para no
registrarlo**: una diferencia esperada y una diferencia no medida se ven igual dentro de un mes.

### Parte B (reemplaza a la del `_9`) — Los casos al CSV · **Opus** · effort alto

`docs/casos_validacion_2026-09-04.csv` ya existe: **agregar filas.**

- **`camp_alcance`** → `contradice`, con los dos números, la columna que lee y **la decisión de la
  Parte A citada**, para que el próximo no lo lea como bug de mapeo. ⭐ **El caso registra la
  diferencia; la decisión explica por qué el motor hace lo que hace. Son dos cosas y las dos hacen
  falta.**
- **`camp_frecuencia`** → ⛔ **no lleva caso propio de defecto.** Es un `RATIO` sobre `alcance`: su
  `32,7` es correcto para el alcance que publica. **Anotarlo como derivado**, apuntando al caso del
  alcance. ⚠ Es el mismo criterio que frenó los dos `*_vtr` en el `_7`: **un derivado no tiene vida
  propia respecto de sus insumos, ni para bien ni para mal.**
- **`camp_meta_frecuencia`** → ⭐ **caso propio, y es el único que todavía puede medirse acá.** Es
  `ULTIMO` sobre la columna `meta_frecuencia`: **no lo calcula el motor.** Motor `2,38`, equipo
  `1,64`.
  ⇒ **Reportar qué dice esa columna para la campaña del deck.** Si dice `2,38`, el motor lee bien y
  la diferencia es de la fuente. Si dice `1,64`, el motor no la está leyendo. **Son dos trabajos
  distintos y hoy no se sabe cuál es.**
  ⚠ **Y ojo con la coincidencia:** `2.080.014 / 872.827 = 2,38`, exactamente lo publicado. Que un
  valor leído coincida al decimal con un cálculo que el motor no hace **es un dato, no una
  casualidad que se pueda pasar por alto.**

---

## 4 · Estado del `_9`

| parte | estado |
|---|---|
| **§1** (`camp_meta_alcance` no existe) | ✅ vale |
| **Parte 0 original** | ⛔ cae — el Addendum 1 mostró que se ancla al ítem |
| **Parte 0.3** (cruce con `C-84`) | ⛔ cae — `C-84` no aplica |
| **Parte A** | ⭐ **reemplazada**: registrar la decisión, no arreglar |
| **Parte B** | ⭐ **reemplazada**: tres casos, uno solo medible |
| **Parte C** | ✅ vale sin cambios — diferencias chicas y los tres `*_ctr` |

⭐ **Lo único que queda por medir en todo el `_9` es qué dice la columna `meta_frecuencia`.** Todo
lo demás es registro.
