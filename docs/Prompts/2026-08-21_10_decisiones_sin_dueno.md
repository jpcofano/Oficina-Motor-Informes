# 2026-08-21_10 — Cinco decisiones tomadas que no tienen dueño documental

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Objetivo único:** que cinco decisiones ya tomadas dejen de vivir en una conversación o en un
> mensaje de commit, y pasen al documento que `CLAUDE.md` §7 declara dueño de cada pregunta.
>
> ⛔ **Ninguna decisión se toma acá.** Todas están tomadas; lo que falta es escribirlas donde
> alguien las va a leer. **Ningún `.md` nuevo** (§3).

---

## Por qué existe

Un prompt ejecutado dice **qué se construyó**, no **qué es cierto hoy** (§7). Un mensaje de commit,
menos todavía. Cinco decisiones del 21/08 están ahí y en ningún otro lado, así que un lector nuevo
—o esta misma conversación en dos días— las vuelve a preguntar. Ya pasó: `PENDIENTES` sigue
preguntando *"¿vale la regla gana el padre repetible?"* después de que la medición cerrara el tema.

---

## Parte 0 — verificar antes de escribir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort alto.**

**Grep primero** (§3): si algo de esto ya está escrito, el resultado correcto es **cero ediciones y
se reporta el cero**.

1. **El próximo `R-NN` libre** en `REGLAS_NEGOCIO.md` y el próximo `D-NN` libre en `PLAN.md`. Este
   prompt asume `R-28` y `D-37`; **si no coinciden, mandan los del repo.**
2. **Que existan y digan lo que este prompt cree:** `CONFIG_INFORMES.md` §1.9 (la nota sobre la
   lámina de `secco`) y §4.5 (`D-34`, la desconfianza declarada). Citar la línea que abre cada una.
3. **Las «Preguntas al equipo» del 21/08**: cuáles de las cinco (`D1`…`D5`) siguen abiertas y cuáles
   ya tienen respuesta en el hilo. Listarlas por número.
4. **Si `R-28` ya está dicho en otro lado.** La definición de los `u1_total_*` está hoy en
   `PENDIENTES`; decir si además aparece en `TOKENS.md`, `CATALOGO_tokens.md` o el CSV de casos.

**Reportar y parar.**

---

## Parte A — `R-28`: los totales del 1 a 1 suman UNA etapa

> **Modelo: Opus · effort alto.** ⚠ Rige un número publicable.

En `REGLAS_NEGOCIO.md`, con el ID que dio la Parte 0.

**El enunciado:** en la lámina del "1 a 1", los totales **no** son la suma de las cinco filas de la
campaña. Cada total suma **la etapa que corresponde a lo que esa etapa mide**:

| token | qué suma | por qué |
|---|---|---|
| `u1_total_clics` | sólo las filas **PRE** | el PRE es convocatoria y la lámina lo rotula `CLICS (CTR)` |
| `u1_total_vistas` | sólo las filas **POST** | el POST es difusión y la lámina lo rotula `VISUALIZACIONES (VTR)` |
| `u1_total_impresiones` | **las dos** etapas | es el volumen total, no una medida de una etapa |
| `u1_total_frecuencia` | `impresiones / alcance` | verificado: 377.997 / 55.255 = 6,84, publicado 6,8 |
| `u1_total_alcance` | ⛔ **otra fuente** | son usuarios únicos y **no se suman**. `digital/Alcance` es el candidato — no se asume |

**La evidencia va con la regla**, medida el 21/08 sobre el fixture `Seguimiento Digital
2026-08-20.zip`, cuenta `3487-AGOJDGAG` (Parque Avellaneda, 12/08), cinco filas = etapa × plataforma.

⭐ **Y el contraejemplo va adentro de la regla, no en una nota:** cablearlo como *"SUMA sobre las
tres plataformas"* —que es lo que parece obvio— publicaría **1.879 contra 1.472**. Un 28 % de más,
plausible y equivocado. **Es el modo de falla que este proyecto persigue**, y una regla que no dice
qué error evita se lee como burocracia.

---

## Parte B — `D-37`: la pertenencia de una lámina se declara, no se infiere

> **Modelo: Opus · effort alto.** ⚠ Gobierna el diseño del `2026-08-21_11`.

En `PLAN.md`, con el ID que dio la Parte 0. **Decisión del usuario, 21/08.**

1. **`LAMINAS.seccion_id` es la fuente de la pertenencia.** El generador deja de deducirla de la
   familia de tokens que la lámina lleva.
2. ⭐ **Las 53 láminas la declaran. No existe una lámina sin sección** — si una no encaja en ninguna
   de las que hay, **se agrega la sección que falta**, no se deja la celda vacía.
3. **La celda vacía deja de significar «hereda».** Pasa a significar *"nadie la clasificó"*: se
   reporta con su `lamina_id` y **no entra a ningún bloque repetible**. ⚠ **Esto supersede el
   comentario del seed de `LAMINAS`** (`Instalar.gs`), que hoy dice lo contrario para
   `seccion_id`. `modo`, `itera_sobre` y `filtro` **siguen heredando** — la corrección es sólo
   sobre `seccion_id`, y `D-23` ya lo decía: *"identidad y estado propio no se heredan nunca"*.
4. **La condición por lámina vive en `LAMINAS.filtro`**, que existe en el esquema desde el `_11` y
   nunca tuvo lector. Se evalúa **por ítem**, con la misma sintaxis de `SECCIONES.filtro`.
5. ⛔ **Un ítem que se queda sin ninguna lámina es un invariante roto, no un caso a manejar**
   (decisión del usuario: *"eso no puede pasar"*). Se reporta nombrando sección e ítem y **no se
   emite un deck a medias**.
6. **Qué se gana, y hay que decirlo sin exagerar:** deja de escanearse cada lámina y cada caja de
   texto una vez por sección repetible. ⚠ **El ahorro no está medido** — el usuario decidió avanzar
   sin medirlo. La razón que sí está verificada es otra: **el motor deja de adivinar**, y la lámina
   del 1 a 1 —que hoy no pertenece a nada porque nadie declara `u1_`— pasa a tener dueño.

**Y lo que `D-37` NO hace:** no retira `familia_tokens`. La columna queda; deja de ser el mecanismo
de pertenencia. Retirarla es la Fase 4 de `D-23` y tiene su propio costo.

---

## Parte C — las dos notas editoriales

> **Modelo: Sonnet · effort alto.**

Las dos en `CONFIG_INFORMES.md`, cada una en la sección que ya existe.

⛔ **`ventana_candidatos_anclaje_dias` no se toca, y tampoco se le agrega una nota.** El 21/08 se
evaluó llevarla de 14 a 15 y el usuario decidió dejar §4.4 bis **exactamente como está**.

**1 · §1 — la condición del 1 a 1.** Decisión del usuario, 21/08. El bloque de un encuentro son
**dos** láminas: la portada (`L-052` en `jm`) y una segunda que **depende del tipo**:

- `tipo = Uno a uno` → la lámina de resultados de plataforma (`L-053`);
- **todo el resto** → la del iceberg (`L-035`). ⚠ **Incluidos los de `tipo` vacío**: la condición
  se escribe como `tipo!=Uno a uno`, así que un tipo en blanco lleva iceberg. Está dicho a
  propósito porque `REUNIONES` tiene filas sin `tipo`.
- **La portada va en los dos casos.**

**2 · §4.5 — el puente entre `MAPEO.notas` y el deck.** Las ocho columnas dudosas de
`digital/CAMPAÑAS_DESGLOCE_DIGITAL` quedaron marcadas `REVISAR` en `notas`, porque `MAPEO` no tiene
columna de estado. ⭐ **Esa marca no llega sola al deck.** Cuando se cablee un token sobre una de
esas columnas, el marcador lleva **sufijo `_revisar` en `MARCADORES.formato`**, y entonces publica
`-1.234-` en vez de un número liso — que es exactamente lo que `D-34` significa: *hay número y no
está validado*. **Sin ese puente, una columna que nadie confirmó publica igual que una verificada.**

---

## Parte D — `PENDIENTES_consistencia.md`

> **Modelo: Sonnet · effort alto.**

1. **Tachar las preguntas que ya tienen respuesta**, sin borrar el texto original —mismo criterio
   que las inconsistencias 3 y 5— y con la respuesta del usuario del 21/08 arriba:
   - `D1` (qué significa `seccion_id` vacío) → resuelta por `D-37`.
   - `D2` (padre o hijo) → ⭐ **no había ambigüedad y la medición lo cierra**: `seccionesRepetiblesDe_`
     exige `modo = repetible` **y** `estado = activa` **y** `familia_tokens` no vacía, así que de
     cada grupo hay **una sola sección elegible**. `encuentro_iceberg` es `unica` + `revisar`: falla
     dos de las tres. **Nunca estuvieron en disputa para la expansión.**
   - `D4` (¿el 1 a 1 es sección propia o variante?) → variante de `encuentro`, con la condición de
     la Parte C punto 1.
   - `D5` (de qué solapa salen los `u1_`) → ya estaba resuelta desde el 14/08; el `_7` la mapeó.
   - `D3` (¿`ecv_*` es genérico?) → **sigue abierta.**
2. **Los dos `.pptx` en el historial** (`7e48725`). Decisión del usuario, 21/08: **queda anotado
   como riesgo asumido y no se reescribe historia.** Escribir qué son, dónde están, y qué haría
   falta para sacarlos —reescritura de historia y `force-push`— para que el día que alguien decida
   hacerlo no tenga que investigarlo de nuevo. ⚠ Y que quede dicho que **ya no están rastreados**:
   lo que sobrevive es el historial, no el árbol.

---

## Parte E — cierre

> **Modelo: Sonnet · effort alto.**

`docs/BITACORA.md` y `docs/HANDOFF_CODE.md`.

**Un commit por parte.**
