# El inventario clasificable de las 26 láminas huérfanas, y la taxonomía

**Un objetivo.** Producir la mesa de trabajo para clasificar. **Sólo lectura: no se escribe
ningún `.gs`, ninguna hoja, ninguna plantilla, ningún `.md`.** Termina en reportar y parar.

**Por qué antes de la Parte A.** `0.3.b` del prompt `_7` contó 26 láminas sin sección
deducible (9 en `jm`, 17 en `secco`). El usuario decidió clasificarlas ahora y que la
clasificación quede sembrada. Para eso hace falta primero la lista, que no existe: `0.3.b`
reportó el número y una muestra, no el detalle.

**No confundir con la Fase 3.** Esto no crea la hoja `LAMINAS` ni la anticipa. Es material
para que el usuario decida, y para que el sellador de la Fase 2 llegue con menos láminas sin
deducir.

---

## Parte 0 — el inventario (sólo lectura)

`0.1` · **Las 26, una por fila.** Para cada lámina sin sección deducible de `jm` y `secco`:

| columna | de dónde sale |
|---|---|
| informe | `jm` / `secco` |
| número | posición en la plantilla viva, dicho como referencia, no como identidad |
| primer texto | los primeros ~80 caracteres, para reconocerla |
| tokens | cuántos, y la lista si son ≤ 6; si son más, los prefijos distintos y su conteo |
| `getLayout()` | el `PredefinedLayout` de la lámina — `TITLE`, `SECTION_HEADER`, `BLANK`, etc. Es la pista de la industria para separar carátulas de láminas de datos |
| escondida | `isSkipped()` |
| notas | si tiene texto en las notas del orador (`0.5` del `_7` encontró dos en `secco`) |

Ordenar por informe y número. **Separar en dos bloques**, porque son dos problemas distintos:

- **Bloque A — sin ningún token.** No están sin clasificar: no llevan datos nunca. Es trabajo
  mecánico.
- **Bloque B — con tokens y sin sección.** Cada una necesita una decisión editorial. `0.3.b`
  ya vio que son las caras: `jm` 2 (21 tokens), 3 (19), 21 (21).

Reportar el tamaño de cada bloque por informe.

`0.2` · **Para el bloque B, qué secciones son candidatas.** Por cada lámina, qué prefijos de
token lleva y si alguna fila de `SECCIONES` ya declara ese prefijo en `familia_tokens` — o si
existe una sección que conceptualmente le corresponde pero **no declara `familia_tokens`**
(de 36 filas, sólo 9 lo declaran). Es la diferencia entre "falta la sección" y "la sección
está y le falta una celda", y cambia el trabajo por completo.

`0.3` · **Las secciones que existen para nombrar una lámina.** Listar las filas
`modo = unica` cuyo `familia_tokens` comparte prefijo con otra sección
(`encuentro_iceberg`, `m2_status`, `m2_caudal` según la lectura de afuera), más
`ecv_alcance_semanal`, que enumera diez tokens exactos. Es el `AJ-5` del addendum del `_7`,
adelantado acá porque el usuario lo va a mirar junto con lo demás.

`0.4` · **El estado real de `modo`.** Confirmar leyendo el código: qué valores de `modo`
consulta el motor y dónde. La lectura de afuera es que **sólo `repetible` tiene código
detrás** (`Generador.gs`) y que `agregado` y `unica` son etiquetas sin comportamiento.
Confirmarlo o desmentirlo: de eso depende si la taxonomía nueva describe algo que el motor
hace o algo que sólo leen las personas.

`0.5` · **Qué puede escribir cada camino.** Decir, en dos líneas: `sembrarSecciones_` sólo
agrega filas nuevas y nunca pisa una existente; `curarSecciones_` es la puerta para corregir
un campo de una fila que ya existe. Cuál de los dos toca cada cambio propuesto —fila nueva
contra celda vacía en fila vieja— es lo que decide si "que el seed las deje clasificadas" es
posible o si hace falta curar.

**Reportar `0.1`–`0.5` y parar. No proponer la clasificación de cada lámina: eso lo decide el
usuario con esta tabla a la vista.**

---

## Lo que NO se hace en esta corrida

- No se escribe `familia_tokens` en ninguna fila.
- No se agregan filas a `SEED_SECCIONES_`.
- No se toca `modo` ni se agrega ninguna columna.
- No se escriben las Partes A/B/C del `_7` ni el `D-23`. Este prompt es material para ellas.

## Verificación

Se cierra cuando el usuario tiene la tabla y decide. **No seguir sin luz verde.**
