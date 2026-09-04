# 2026-09-04_6 — Sacar el `_revisar` de lo que el deck del equipo confirmó

**Informe:** `jm` · **Corrida testigo:** `Informe_semanal_JM — vie 28/08 – vie 04/09` (11:42)
**Contraparte:** deck del equipo `Informe semanal JM - 28/08 al 04/09` (11:25), en manos del usuario.

> **De dónde salen los números de este prompt.** El usuario subió los cuatro `.pptx` (dos corridas
> del motor —10:45 y 11:42— y dos del equipo). Los valores citados se extrajeron con
> `markitdown <archivo>.pptx` y se verificaron contra el XML crudo cuando había duda de formato.
> **Ninguno sale de memoria ni de un doc del repo.** Los `.pptx` no están en el repo: si hace falta
> reproducir la extracción, pedírselos al usuario.

> ⚠ **Las bases se mueven (`R-31`) y el equipo carga durante la mañana.** Por eso el criterio de
> este prompt es **identidad exacta, no cercanía**: una coincidencia de seis dígitos no pasa por
> azar, y una diferencia de 4 unidades **no prueba nada** — puede ser drift. Los "casi" de la
> tabla de abajo **no son candidatos**, ni a favor ni en contra.

---

## Parte 0 — Sólo lectura · **Sonnet** · effort normal

⛔ **No escribe nada. Termina en «reportar y parar».**

### 0.1 · Qué marcadores llevan `_revisar` HOY

El snapshot más nuevo de `MARCADORES` en el repo es del **31/08** y el deck del 04/09 publica entre
guiones tokens que **no figuran** en su lista de `_revisar`. El snapshot está vencido para esta
pregunta.

- Censar sobre la hoja **viva** (o sobre un snapshot nuevo que se genere en esta parte): todas las
  filas cuya columna `formato` termina en `_revisar`, con `marcador`, `informe_id` y `formato`.
- Reportar el total y la lista completa.

### 0.2 · ⛔ La contradicción que hay que resolver ANTES de tocar nada

`confirmarNumerosDeUnoAUno()` (en `Instalar.gs`) saca el `_revisar` de **24 marcadores de `L-053`**,
por decisión del usuario del 26/08. El snapshot del 31/08 es coherente con eso: **ningún `u1_*`
aparece con `_revisar`**.

**Pero el deck del 04/09 publica `L-053` con guiones**, entre otros:

```
-21.980-     -10.165- (-46.2-)     -35.877-     -5.996- (-16.7-)
-124- (-66-) -188-                 -11/09-
```

`-11/09-` corresponde a `u1_fecha_fin`, que **está** en la lista de la función.

⛔ **Las dos cosas no pueden ser ciertas a la vez.** Medir cuál de estas tres es, sin elegir de
antemano:

1. `confirmarNumerosDeUnoAUno()` **nunca se corrió** contra la planilla viva (el commit existe, la
   corrida no).
2. Se corrió y **algo volvió a poner** el `_revisar`.
3. **Esos guiones no vienen del `_revisar`** — los pone otra cosa (la plantilla, o un `-` literal
   como en `C-75`).

⚠ **Es una premisa de todo el resto del prompt.** Si los guiones de `L-053` no vienen del
`_revisar`, sacarle el `_revisar` a los marcadores de M2 **puede no cambiar nada en el deck**, y la
Parte C sería un cambio sin efecto verificable.

**Control positivo obligatorio:** tomar **un** marcador que la Parte 0.1 haya visto con `_revisar`
y confirmar que su valor **sí** sale entre guiones en el deck del 11:42. Sin ese control, un
"ninguno viene del `_revisar`" es indistinguible de un detector que no mira nada.

### 0.3 · Reproducir la operación de M2 y la del global de mail de campaña

Para los diez candidatos de la Parte C, reportar de la hoja `MARCADORES`: `base_id`, `solapa`,
`campo_logico`, `operacion`, `filtro`, `dimensiones`, `periodo_ref`, `formato`.

⚠ Interesa especialmente si `m2_or` y `m2_ctor` son **`PCT` calculados** o campos leídos: el equipo
publica esos dos **redondeados a entero** (`32%`, `3%`) y el motor a un decimal (`32.4`, `2.8`).
Coinciden al redondeo, pero **la coincidencia al redondeo no es identidad** — decirlo en el reporte
en vez de darlo por bueno.

**Reportar y parar.**

---

## Parte A — Resolver la contradicción de `L-053` · **Opus** · effort alto

⛔ **Sólo si la Parte 0.2 la dejó determinada.** Si quedó ambigua, reportar y parar: es una
decisión del usuario, no de Code.

Según cuál de las tres sea:

- **(1) nunca se corrió** — no se arregla escribiendo código: se corre la función. Decirlo,
  registrar en `docs/BITACORA.md` que el commit `de la función` estuvo desde el 26/08 sin corrida
  detrás, y **anotar la lección**: un commit que escribe en la planilla y no se corre es
  indistinguible de uno que no existe. Actualizar `docs/PENDIENTES_consistencia.md`.
- **(2) el `_revisar` volvió** — medir **qué** lo repuso antes de proponer nada. Es el modo de falla
  de «varios dueños por celda» que ya está documentado.
- **(3) los guiones no vienen del `_revisar`** — entonces hay un segundo mecanismo que envuelve
  valores en guiones y **no está documentado**. Localizarlo, y agregarlo al ruteo de `CLAUDE.md`
  §7, porque hoy la única respuesta escrita a *"¿por qué este número sale entre guiones?"* es el
  sufijo `_revisar`.

Un commit. **Reportar y parar antes de la Parte B.**

---

## Parte B — Incorporar los casos de validación del 04/09 · **Opus** · effort alto

Crear `docs/casos_validacion_2026-09-04.csv` con el mismo encabezado que
`docs/casos_validacion_2026-09-02.csv`. **No editar los CSV anteriores** (`D-56`: un caso es una
comparación fechada).

### B.1 · Los que cierran exacto — candidatos a `exacto`

**Bloque M2 de `L-038`** — motor 11:42 vs equipo 11:25:

| token | motor | equipo | |
|---|---|---|---|
| `m2_mails_enviados` | `-1.348.720-` | 1.348.720 | ✅ |
| `m2_mails_entregados` | `-1.337.392-` | 1.337.392 | ✅ |
| `m2_aperturas` | `-433.403-` | 433.403 | ✅ |
| `m2_or` | `-32.4-` | 32% | ✅ al redondeo |
| `m2_clics` | `-12.316-` | 12.316 | ✅ |
| `m2_ctor` | `-2.8-` | 3% | ✅ al redondeo |

⭐ **Es la segunda confirmación de los mismos seis en otra ventana.** `V-124` los validó `exacto`
para la semana del 21/08. Que vuelvan a cerrar sobre la semana del 28/08, con las bases movidas en
el medio, es evidencia de otra clase: **no es el mismo número dos veces, es el mismo camino dos
veces.** Decirlo en la nota del caso nuevo y apuntar a `V-124`.

⭐ Y los seis **no se movieron entre la corrida de las 10:45 y la de las 11:42**, mientras casi
todo el resto del deck sí. Verificable: `diff` de los dos `markitdown`.

**Global de `L-047` (Directa: envío de mail de campaña):**

| token | motor | equipo | |
|---|---|---|---|
| enviados global | `-367.638-` | 367.638 | ✅ |
| `% OR` global | `-41.9-` | 42% | ✅ al redondeo |
| clics global | `-2.457-` | 2.457 | ✅ |
| `% CTOR` global | `-1.6-` | 2% | ✅ al redondeo |

⚠ **Y las cuatro filas por envío de esa misma lámina cierran enteras** —enviados, entregados,
aperturas, OR, clics, CTOR de los cuatro envíos— y **ya publican sin guiones**. La lámina cierra
completa salvo por dos cosas que no son números, en B.3.

Los nombres exactos de estos cuatro tokens **no los afirmo**: salen de la Parte 0.3. En el CSV van
los que la hoja diga.

### B.2 · ⭐ El hallazgo que vale más que los guiones: la frecuencia no tiene bug propio

En `L-046` los tres números que más llaman la atención son la frecuencia:

| | motor | equipo |
|---|---|---|
| `camp_meta_frecuencia` | `-2.38-` | 1,64 |
| `camp_frecuencia` (total) | `-32.7-` | 22,4 |
| `camp_meta_alcance` | `-872.827-` | 1.271.754 |

Pero las dos frecuencias **son aritméticamente correctas en los dos decks**:

```
motor:   2.080.014 / 872.827   = 2,38     28.540.835 / 872.827   = 32,7
equipo:  2.080.014 / 1.271.754 = 1,64     28.540.942 / 1.271.754 = 22,4
```

⭐ **Las dos frecuencias del motor no están mal: cuelgan de un solo número que sí lo está, el
alcance de Meta.** No hay tres defectos, hay uno. Registrarlo como caso —tipo `C-NN`— apuntando a
`X-43` (`u1_post_meta_alcance`, `contradice`) y a `C-84` (`digital/Alcance` tiene **dos filas por
cuenta**), porque **es plausible que sea el mismo defecto en otra lámina** y eso ya está medido.

⛔ **No arreglar el alcance en este prompt.** Se registra; el arreglo se decide después, con la
medición de `C-84` delante.

### B.3 · Lo que no cierra, y no es lo mismo entre sí

Separar tres cosas que la lectura rápida confunde:

**(a) Diferencias chicas — NO son evidencia de nada, con las bases moviéndose:**
`camp_google_impresiones` 1.109.613 vs 1.109.617 · `camp_google_vistas` 1.028.855 vs 1.028.857 ·
`camp_prog_impresiones` 25.351.208 vs 25.351.311 · `camp_prog_clics` 36.494 vs 36.423 ·
impresiones totales 28.540.835 vs 28.540.942. **No van al CSV como `contradice`.** Si van, van como
`abierto` y con la razón escrita: *no se puede distinguir drift de defecto con dos capturas a 17
minutos de distancia.*

**(b) Coinciden, pero el formato del motor tapa el dígito que decidiría:**
`camp_meta_ctr` `0.1` vs `0,15%` · `camp_google_ctr` `0.2` vs `0,17%` · `camp_prog_ctr` `0.1` vs
`0,14%`. El formato `porcentaje_sin_signo` publica **un** decimal y el equipo usa **dos**. ⛔ **A
estos tres NO se les saca el `_revisar`**: no hay con qué afirmar que coinciden. Es una decisión de
formato pendiente, no un caso de validación — va a `docs/PENDIENTES_consistencia.md`.

**(c) Diferencias grandes, que sí son señal:** el bloque digital del Resumen Ejecutivo. Motor
16.342.168 de impresiones `jm` contra 10.166.581 del equipo; Meta 2.560.372 vs 1.548.095; Google
1.648.150 vs 1.114.536; Programmatic 12.133.646 vs 7.503.950. **Los dos decks son internamente
consistentes** —las tres plataformas suman su total en ambos— así que no es un error de suma: el
motor **toma más filas**. Y los contadores de implementaciones lo dicen igual de fuerte: motor
`1/1/1`, equipo `7/8/8`. Mismo cuadro en `L-032` (GCBA), con el motor 2,4× arriba.
Registrar como caso abierto. ⛔ **No tocar nada del Resumen Ejecutivo en este prompt.**

---

## Parte C — Sacar el `_revisar` a los confirmados · **Opus** · effort alto

⛔ **Bloqueada por la Parte A.** Si `L-053` quedó sin explicar, esta parte no corre.
⚠ **Sacrificable**: si algo de arriba no cierra, se entrega hasta B y listo.

Precedente a seguir en forma: `confirmarNumerosDeUnoAUno()` en `Instalar.gs` — un bloque de
documentación con el motivo, una constante con la lista agrupada por `formato` destino, escritura
**sólo** de la columna `formato`, **sólo** de esas filas, **relectura de la hoja** para verificar
que quedó como se pidió, y `⛔` explícito de que no toca `_revisar` fuera de su alcance.

- **Alcance:** los seis de M2 (B.1) y los cuatro del global de `L-047` (B.1). **Diez.**
- ⛔ **Fuera de alcance, y dicho en el código:** los tres `*_ctr` de B.3(b), todo el Resumen
  Ejecutivo, todo `L-046` salvo lo listado, y `camp_meta_alcance` / las dos frecuencias.
- **Backup de `MARCADORES` antes de escribir**, como toda migración.
- Sin botón inverso, por el mismo motivo que el precedente: **sacar una marca no es una deuda;
  volver a ponerla es una decisión nueva.**

⚠ **La función NO se corre desde acá.** La corre el usuario, y hasta que la corra el cambio no
existe — que es exactamente lo que la Parte 0.2 puede estar por demostrar que ya pasó una vez.

Un commit.

---

## Parte D — Lo que no son números · **Sonnet** · effort normal

Cuatro cosas del deck del 04/09 que no entran en ninguna parte de arriba. **Sólo registrarlas** en
`docs/PENDIENTES_consistencia.md`, una línea cada una, sin arreglar nada:

1. ⛔ **`camp_env4_fecha}}` se publicó crudo** en `L-047`. En el XML del slide el run dice
   literalmente `camp_env4_fecha}}`: **le faltan las llaves de apertura**. El motor hizo lo
   correcto —no era un token— pero el resultado rompe el invariante *«ningún `{{token}}` crudo
   sobrevive a una corrida»* sin que nada lo detecte. Está en las **dos** corridas del día, así que
   es de la plantilla. ⚠ **El detector de tokens crudos busca `{{`; éste no lo tiene.** Un
   detector que no puede ver este caso vale menos de lo que parece.
2. **`L-039` (Digital M2), `L-048` (respuestas) y `L-050` (RRSS) publican tokens crudos `{{…}}`**
   —del orden de 25, 13 y 15 respectivamente—. En `L-048` el equipo **sí tiene los datos** (396
   respuestas moderadas, tasa 0,26%): no es que no exista la fuente.
3. **El remitente sigue sin normalizar**: motor `jorge.macri@buenosaires.gob.ar` en la primera fila
   y `/////` en las otras tres; equipo `JM` en la primera y vacías las demás. Ya está esperando
   decisión del usuario — sólo apuntar que sigue abierto y que se vio de nuevo el 04/09.
4. ⭐ **La campaña destacada cambió entre las 10:45 y las 11:42**: `Operativo Muro | 25/8` en la
   primera corrida, `Fin de las mafias de los celulares robados` en la segunda. Es el ítem 9 de la
   cola (`camp_titulo`), pero con un dato que la nota de ese ítem no tiene: **cuál campaña sale
   depende de a qué hora se corra.** Agregarlo a la nota del ítem 9 en `docs/PLAN.md §2`.

⚠ **Y una que sí es buena noticia, para que no se pierda:** el encabezado publicó
`vie 28/08 – vie 04/09`. **La ventana viernes a viernes está aplicada** — el handoff del 04/09 la
daba por dudosa.

Un commit.

---

## Orden y sacrificabilidad

```
0 (Sonnet)  →  A (Opus)  →  B (Opus)  →  C (Opus)
                                D (Sonnet, independiente de todo)
```

- **0** siempre.
- **A** es la que decide si el resto tiene sentido. Si no cierra, se para ahí.
- **B** vale sola, aunque C no corra: el CSV fechado es la fuente de verdad de la validación.
- **C** es sacrificable.
- **D** puede correr en cualquier momento; no depende de las otras.
