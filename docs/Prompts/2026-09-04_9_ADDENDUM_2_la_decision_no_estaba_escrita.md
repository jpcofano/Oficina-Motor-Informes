# Addendum 2 — `2026-09-04_9_alcance_de_campana.md`

**Fecha:** 05/09/2026 · ⛔ **No hay defecto de mapeo. El `_9` cambia de objeto.**
Se lee junto con el Addendum 1, que ya invalidó el veredicto de las 1031 filas.

> ⚠ **NOTA DE CODE, 05/09/2026 — este archivo tuvo DOS versiones y la primera se ejecutó.**
> La versión anterior de este mismo documento decía en §3 *«la diferencia con el equipo sigue
> abierta, y ahora está sola»*, y su Parte B pedía `camp_alcance` → `contradice` y un caso propio
> para `camp_meta_frecuencia`. **Eso se ejecutó y se commiteó** (`R-34` y `C-93`, commit `7bc5336`).
> Esta versión declara la diferencia **explicada por decisión del usuario** y pide **tres casos,
> ninguno de defecto**. ⇒ El texto de abajo es el vigente; lo que produjo la versión anterior queda
> **superseded por `C-94`…`C-96`** y registrado en `PENDIENTES_consistencia.md`.

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
> ⭐ **Y el deck del equipo publica otro número para lo mismo porque el equipo no actualiza la base:**
> su alcance sale de la plataforma. **La diferencia es esperada y el motor es correcto.**

⭐ Y anotar la consecuencia que ya está publicada, para que no se descubra de nuevo: **la caja de
«alcance de Meta» de `L-046` y la de «alcance total» de `L-045` muestran el mismo número** porque
**es el mismo token pintado dos veces** — no hay marcador de alcance por plataforma. **Es correcto
dada la decisión**, y se ve raro sin ella.

Un commit de documentación.

---

## 3 · ⭐⭐ La diferencia con el equipo está explicada — decisión del usuario, 05/09

| | motor | equipo |
|---|---|---|
| alcance de Meta | **872.827** | **1.271.754** |

> **Se deja el `872.827`. El equipo no actualiza la base**: su número lo saca de la plataforma.

⇒ ⭐ **El motor lee bien.** No es `contradice`: es una diferencia **explicada**, y el explicativo es
que las dos partes miran fuentes distintas.

### ⭐⭐ Y una sola explicación cierra los tres números, no uno

```
motor:   2.080.014 / 872.827   = 2,38   ← meta_frecuencia en la base
equipo:  2.080.014 / 1.271.754 = 1,64   ← calculado con el alcance de la plataforma
         28.540.835 / 872.827  = 32,7  ·  28.540.942 / 1.271.754 = 22,4
```

⇒ **La base es internamente consistente y el deck del equipo también.** Cada uno con su alcance.
⭐ **No hay tres discrepancias: hay una sola fuente distinta**, y todo lo derivado la hereda.

⚠ **Eso cierra también la pregunta que quedaba abierta sobre `camp_meta_frecuencia`.** Ya no hace
falta medir qué dice la columna: el `2,38` es exactamente el cociente de la base, así que **el motor
la lee bien**. ⇒ **Igual conviene confirmarlo en la misma pasada** — es una lectura, y dar por
buena una aritmética que cierra sin verificar la columna es cómo se llegó dos veces a conclusiones
falsas en este mismo prompt.

### Parte B (reemplaza a la del `_9`) — Los casos al CSV · **Opus** · effort alto

`docs/casos_validacion_2026-09-04.csv` ya existe: **agregar filas.**

- **`camp_alcance`** → ⭐ **NO `contradice`.** Va con el estado que corresponda a *«el motor lee la
  fuente correcta y el equipo publica otra»*, con los dos números y la razón escrita. ⚠ **Si no
  existe un estado para eso en el CSV, decirlo en vez de forzarlo en `contradice` o en `exacto`:**
  los dos serían falsos, y un estado mal puesto se cita después como si fuera verdad.
- **`camp_frecuencia` y `camp_meta_frecuencia`** → ⛔ **sin caso propio de defecto.** Se anotan como
  derivados de la misma explicación, apuntando al caso del alcance. ⚠ Mismo criterio que frenó los
  dos `*_vtr` en el `_7`: **un derivado no tiene vida propia respecto de sus insumos.**
- ⭐ **Y escribir la aritmética de arriba en la nota**, no sólo la conclusión. Es lo que permite que
  alguien la vuelva a verificar en un minuto en vez de rehacer el análisis.

---

## 4 · Estado del `_9`

| parte | estado |
|---|---|
| **§1** (`camp_meta_alcance` no existe) | ✅ vale |
| **Parte 0 original** | ⛔ cae — el Addendum 1 mostró que se ancla al ítem |
| **Parte 0.3** (cruce con `C-84`) | ⛔ cae — `C-84` no aplica |
| **Parte A** | ⭐ **reemplazada**: registrar la decisión, no arreglar |
| **Parte B** | ⭐ **reemplazada**: tres casos, ninguno de defecto |
| **Parte C** | ✅ vale sin cambios — diferencias chicas y los tres `*_ctr` |

⭐⭐ **El `_9` ya no tiene nada que arreglar en el motor.** Es registro: una decisión que faltaba
escribir, y tres casos con su explicación. ⚠ **Y ese es el resultado, no un anticlímax** — dos
vueltas de análisis para concluir que el motor hacía lo correcto es exactamente lo que cuesta no
tener la decisión escrita, y por eso escribirla es el trabajo.

⇒ **Lo único que se mide:** confirmar que la columna `meta_frecuencia` dice `2,38`.
