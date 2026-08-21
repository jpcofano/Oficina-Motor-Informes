# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-21, con la Parte 0 del `_4` completa — falta decidir

---

## ⛔ Lo primero: el deck no está mal por un bug — está mal por tres cosas que faltan

El 21/08 se corrieron seis prompts. Cuatro arreglaron código y están cerrados (`_1`, `_2`, `_5` y
`_6`). **Los otros dos (`_3` y `_4`) son diagnóstico y pararon a propósito**: la medición desmintió
las premisas con las que se habían escrito.

**Lo que NO pasó, y conviene descartarlo antes de seguir buscando:**

- ⛔ **No hubo regresión de código entre el 20 y el 21/08.** `MARCADORES` es **idéntica celda por
  celda** — 87 filas, 0 altas, 0 bajas, 0 cambios en las 11 columnas. `SECCIONES`, `SOLAPAS`,
  `MAPEO`, `BASES`, `INFORMES` y `LAMINAS` también. Lo que cambió es **dato**.
- ⛔ **El `_7` no está aplicado.** Las 87 filas siguen en `informe_id = jm`, **ninguna pasó a `*`**,
  y hay **3** filas `_revisar`, no 32. No hay migración que testificar.
- ⛔ **Los 49 `{{token}}` crudos no son nuevos**: son los *49 crudos permanentes* de las láminas
  escondidas 12, 21 y 29.
- ⛔ **Ninguna corrida reciente pintó los tokens fijos**, ni siquiera la que se recuerda como buena:
  `171421`, `172003`, `175132` y `114540` **cortaron las cuatro en la etapa 4**.

---

## Las tres cosas que sí faltan, en orden

**El detalle medido está en `docs/PENDIENTES_consistencia.md`, entrada del 2026-08-21 (seis
inconsistencias). Acá va sólo el orden.**

| # | qué falta | por qué va antes que lo siguiente |
|---|---|---|
| 1 | ⭐ **Tildar `REUNIONES.mostrar`** en las dos filas de `agosto_14_20` | Sin eso `leerReuniones_` devuelve **cero** encuentros del período, `encuentro` y `comunicaciones_post` emiten **0 ítems**, y sus bloques modelo salen crudos. **Es un paso de dato, no un bug** — el cargador deja `mostrar=''` a propósito |
| 2 | **Sellar la lámina 8 de `jm`** | La plantilla tiene **53 láminas y `LAMINAS` 52 filas**: la del 1 a 1 **no tiene ancla ni fila**. No se le puede declarar `seccion_id` a una fila que no existe |
| 3 | **Cablear los 32 `u1_`** | No tienen **ninguna** fila en `MARCADORES`. Sellar y declarar sección **no la hace publicar nada** |

⚠ **Son tres causas independientes del mismo síntoma**, y hacer una sola mueve el síntoma sin
resolverlo. En particular: **declarar `seccion_id` sin cablear produce N copias vacías en vez de una**.

---

## Sobre el `2026-08-21_4`: la Parte A NO se ejecutó

`verificarLaminas()` —que ya existía, es sólo lectura, y **nadie había corrido**— desmiente cuatro
premisas del prompt:

| premisa | medido |
|---|---|
| *"la lámina 8 de jm es `L-037`"* | **falso** — `L-037` está en la posición **10** |
| *"el 1 a 1 usa `L-037`"* | **falso** — es la lámina **sin sellar** de la posición 8 |
| *"sus 36 tokens son familia `u1_`"* | **32 de 36**; los otros 4 son `ecv_` |
| *"`LAMINAS` 51 filas, las 51 selladas"* | **52 filas y 52 anclas** contra **53 láminas** |

La plantilla real de `jm`: `pos 1-5 = L-030…L-034 · pos 6 = L-052 · pos 7 = L-035 · **pos 8 = SIN
ANCLA** · pos 9 = L-036 · pos 10 = L-037 …`

⭐ **`L-052` está exactamente donde la hoja dice** — el diseño del `lamina_id` funcionó: se insertó
en la 6, corrió a `L-035` a la 7, y no hubo que renumerar nada.

⚠ **Y hay una contradicción a resolver antes de escribir código:** el seed dice que `seccion_id`
vacío significa **hereda de `SECCIONES`**; la Parte A.1 dice que significa **no se expande ni se
resuelve**. **Medido: la A.1 dejaría sin publicar 29 de las 53 láminas**, portadas incluidas.

### ⭐ La Parte 0 punto 5 está hecha: la propuesta de `seccion_id` para las 53

`diagTokensDeLamina_` sobre las 53 láminas de las dos plantillas, cruzado contra
`SECCIONES.familia_tokens`. **Nada escrito** — la asignación la hace una persona. Cinco grupos:

| grupo | qué son | cuántas | qué hay que decidir |
|---|---|---|---|
| A | sin ningún token | 13 | nada |
| B | una candidata y repetible (`camp_`, `post_`) | 18 | nada: propuesta directa |
| C | varias candidatas, todas padre/hijo | 6 | **una** regla, no seis decisiones |
| D | una candidata, modo `agregado` | 2 | confirmar |
| E | con tokens y ninguna sección los declara | 14 | separar contenido fijo de hueco real |

**El detalle completo está en `docs/BITACORA.md`**, entrada del 21/08.

⛔ **Y dos premisas más que caen:** `L-037` **no tiene 36 tokens, tiene CERO** — es una lámina de
diseño; los 36 son de la lámina sin ancla. Y **el 1 a 1 existe en las dos plantillas**: `secco`
`L-005` tiene `u1_×3`.

### ⛔ Las cinco decisiones que hacen falta

Están en `docs/PENDIENTES_consistencia.md`, «Preguntas al equipo», entrada del 21/08: qué significa
`seccion_id` vacío · padre o hijo · si `ecv_*` es genérico · si el 1 a 1 es sección propia · de qué
solapa salen los `u1_`. **Ninguna la puede contestar una medición.**

---

## ⏸ Lo que espera una confirmación tuya, y es lo único que bloquea

⭐ **La tabla `lamina_id → seccion_id` de las 53.** La Parte 0 del `2026-08-21_11` la mide y **para
antes de escribir una celda** — es la regla del prompt. Estado:

| | |
|---|---|
| **21 láminas** | sección clara: es la que **hoy** reclama una repetible. La asignación transcribe el comportamiento medido |
| **13 láminas** | **sin ningún token** — el `rol` del addendum §2 las llama `equipo` |
| **19 láminas** | con tokens y **ninguna sección las reclama**. Siete grupos ya tienen destino propuesto; **seis esperan la propuesta contra los decks publicados** (addendum §3) |

⛔ **Nada escrito en `LAMINAS`.** Ni una celda.

---

## ✅ Escrito hoy: `R-28` y `D-37`, más las dos notas editoriales

- **`R-28`** — los totales del 1 a 1 suman **una** etapa. `u1_total_clics` sólo el PRE,
  `u1_total_vistas` sólo el POST. ⭐ Con el contraejemplo adentro: la suma «obvia» publicaría
  **1.879 contra 1.472**.
- **`D-37`** — la pertenencia se declara en `LAMINAS.seccion_id`; vacío deja de significar
  «hereda». ⚠ **Supersede el comentario del seed, y sólo para `seccion_id`.**
- **`CONFIG_INFORMES.md` §1.10** (la condición del 1 a 1) y **§4.5 bis** (el puente
  `MAPEO.notas` → sufijo `_revisar`). ⛔ **§4.4 bis no se tocó.**

⚠ **Y una medición del 21/08 que gobierna el diseño del `_11`:** `slide.duplicate()` **copia las
notas del orador**, así que la copia **hereda el ancla**. Resolver el modelo por `lamina_id` **no
mata la N² por sí solo** — la salida es calcular los modelos **una vez por corrida, antes de
duplicar**. Borrarle las notas a cada copia (0,013 s) **se descarta**: destruiría notas del orador
legítimas. Instrumento: `medirSiLaCopiaHeredaElAncla()`.

---

## ✅ Dos de las seis inconsistencias, cerradas

- **5 · el modo de los huecos** (`2026-08-21_5`). El default era el crudo **y no lo había elegido
  nadie**: `undefined === true` es `false`, y dos de los cuatro llamadores no pasaban la opción.
  Ahora vive en `CONFIG.presentacion_faltantes_defecto` con un solo lector, y el resultado dice **de
  dónde salió** el modo. ⚠ La guarda contra el `"false"` de query string se conservó.
- **3 · `orden_plantilla` como clave** (`2026-08-21_6`). El seed lo prohíbe y el censo lo hacía.
  Ahora se indexa por `lamina_id` y la identidad sale del ancla. **Medido: indexar por orden pierde
  1 de las 23 láminas de `jm` en silencio.**

⚠ **Ninguna de las dos cambia lo que sale en el deck de esta semana.** Lo que lo cambia es la lista
de arriba, y el punto 1 es tuyo.

---

## Lo que cerró hoy y está pusheado

- **`2026-08-21_1`** — el reloj se consulta en **todas** las etapas, no sólo en el bucle. Con el
  techo en 150 la corrida llegaba al muro de 360. `controlDeEtapa_` + `ETAPAS_CON_CONTROL_`, con la
  **clase** del corte (`arranque_no_entra` vs `presupuesto`). El cierre se **mide**
  (`presupuesto.cierre_seg`) en vez de controlarse. El techo del panel sale de `CONFIG`.
- **`2026-08-21_2`** — `generarInforme` tiraba `TypeError` al continuar un deck (`copia.getName()`
  sobre una variable de una sola rama). **La reanudación real no podía terminar nunca.** Arreglado
  con un solo `getFileById(deckId)`.

**Las seis suites en verde:** `probar-reloj-etapas` (17), `probar-continuacion-deck` (22),
`probar-modo-faltantes` (24), `probar-lamina-por-id` (11), `probar-planificador` (18),
`probar-resueltas` (14). **Las cuatro primeras traen la rotura a propósito automatizada**: sacan del
fuente la línea que protegen y verifican que la afirmación caiga.

---

## ⏸ Los botones que esperan

| # | qué correr | qué destraba |
|---|---|---|
| 1 | ⭐ **Tildar `mostrar`** en las dos filas de `REUNIONES` de `agosto_14_20` | que el deck tenga encuentros |
| 2 | **Aplicar configuración** | siembra `costo_arranque_seg`, `costo_mapa_seg`, `costo_item_seg` y **`presentacion_faltantes_defecto`**, que no están en `CONFIG`. El motor usa los defaults de módulo, así que no rompe nada — pero mientras no se siembre, el default de los huecos vive sólo en el código |
| 3 | **`verificarRelojDeEtapas()`** | las cuatro pruebas del reloj dentro de Apps Script; dice el techo vigente |
| 4 | **`verificarLaminas()`** | el cruce ancla ↔ `LAMINAS`. **Correrlo cada vez que se toca una plantilla** |
| 5 | **`preverSimbolosJM()`** | el conteo esperado **antes** de generar |

⚠ **`presupuesto_corrida_seg` ya está en 350** — eso ya se subió.

⚠ **`verificarAlcanceDesatendido()` antes de confiar en el mecanismo desatendido.** Un trigger corre
**sin usuario delante**, con los permisos del **dueño del script**.

---

## ⛔ Evidencia que no se puede perder

- **El deck de `171421`** (`1iPQcoQY11lVhxM-P16R-8iVp5xS1D6YrfDELuU3XRDw`) es **el único testigo
  que queda** de qué publicaba el motor el 20/08: `FALTANTES` se pisa en cada corrida (`D-12`) y
  `con_valor` muere con la ejecución. **No borrarlo.**
- **`jm-20260821-100211` es la corrida que nunca cerró** — `094731` sí cerró, contra lo que se
  documentó a la mañana del 21/08. Hubo **cuatro** corridas ese día, no dos.

---

## Cómo leer esto desde afuera

- **Qué se hizo y qué se midió** → `docs/BITACORA.md`, seis entradas del 2026-08-21: `_1`, `_2`,
  `_3` Parte 0, `_4` Parte 0, `_5` y `_6`.
- **Qué sigue abierto, con el número medido** → `docs/PENDIENTES_consistencia.md`, entrada del
  2026-08-21.
- **Qué decía cada hoja de registro hoy** → `docs/_snapshots/*_2026-08-21.tsv`, las 11 hojas.
- **Las dos reglas nuevas** → `CLAUDE.md` §4: *un presupuesto que sólo se consulta en el bucle no
  protege las etapas que están fuera del bucle*, y *una rama nueva que nunca se ejecutó no está sin
  probar, está sin escribir el control*.
