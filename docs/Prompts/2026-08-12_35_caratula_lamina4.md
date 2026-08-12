# `_35` · La carátula de la lámina 4 — el orden antes que el token

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Corre después del `_33`.** Esto es presentación; el `_33` son números.
>
> **La advertencia primero, porque es la que evita perder una corrida:** si se le pone a la lámina 4
> un token de la familia de `encuentro`, `slidesModeloDe_` la reclama como **segunda lámina modelo**
> de la sección. Y hoy `duplicarBloquesRepetibles_` **duplica cada modelo N veces por separado**:
> dos modelos dan `[carátula ×N][detalle ×N]`, no `[carátula₁ detalle₁][carátula₂ detalle₂]`.
>
> O sea que poner el token hoy, sin tocar el anidamiento, produce **seis carátulas seguidas y
> después seis láminas de detalle**. Es peor que no tener carátula. **El orden va primero.**

---

## Parte A · Premisas — sólo lectura, reportar y parar

**Modelo: Sonnet, effort alto.**

**A.1** — La familia de tokens de la sección `encuentro` (`familia_tokens` en `SECCIONES`) y qué
láminas reclama hoy `slidesModeloDe_`. **Con la lámina 4 todavía sin token**, para tener el estado
previo.

**A.2** — La columna `EVENTO` de `rdv`: su nombre lógico en `MAPEO`, si lo tiene, y el valor que
trae la fila de cada uno de los 6 ítems de julio. La rama de `rdv` por ítem —la que hace viajar
`opciones.fila_rdv`— ya existe desde `f9443d1`: confirmar que un marcador `TEXTO` sobre `rdv` la usa
y devuelve el valor **de la fila del ítem**, no del agregado.

**A.3** — En `duplicarBloquesRepetibles_`, qué secciones repetibles tienen **más de una** lámina
modelo hoy. **Si ninguna tiene más de una, la Parte B no cambia ninguna salida existente**, y eso hay
que decirlo explícito en el reporte porque es lo que la hace segura.

**Reportar y parar.**

---

## Parte B · El bloque por ítem

**Modelo: Opus, effort alto.** Cambia el orden de emisión.

Invertir el anidamiento de `duplicarBloquesRepetibles_`: en vez de *por cada modelo, N copias*, pasa
a ser **por cada ítem, una copia del bloque modelo completo, en orden**.

**Requisitos, y son duros:**

- **El bloque modelo tiene que ser contiguo.** Si las láminas modelo de una sección no son
  consecutivas, **no se expande y se reporta** — igual que hoy se reporta el choque de dos secciones
  reclamando la misma lámina. No se reordena la plantilla para hacerlas contiguas.
- **Una sección con una sola lámina modelo tiene que dar salida idéntica a la de hoy.** Ése es el
  control de la parte: si `junio_sem2` o `m2` cambian aunque sea de posición, algo está mal.
- El `objectId` de cada copia se sigue registrando **antes** del primer reemplazo, que es lo que
  pide `B.3` del Paso 4. No mover esa separación.

---

## Parte C · El token de la carátula

**Modelo: Opus, effort alto.** Publica un valor.

**Sólo después de que la Parte B pase su control.**

Una fila de `MARCADORES` contra `rdv`, campo `EVENTO`, operación de texto, resuelta **por ítem** por
la rama que ya existe. El nombre del token **lo dicta A.1**: tiene que caer dentro de
`familia_tokens` de `encuentro`, o la sección no reclama la lámina 4 y la carátula queda fuera de la
expansión.

⚠ **Ojo con `tokenEsDeFamilia_`, que compara con `indexOf(f) === 0`.** Es lo que dejó a `ecv_barrio`
sin dueño por ser prefijo de `ecv_barrio1/2/3`. Elegir un nombre que no sea prefijo de otro token
existente ni tenga a otro como prefijo, y **decirlo en el reporte**.

**El valor sale crudo, sin normalizar.** El `_34` está censando `EVENTO` justamente porque hay cinco
pares que son el mismo evento escrito distinto. Normalizar acá, a ojo, sería fijar un catálogo por
la puerta de atrás. La carátula muestra lo que dice `rdv`.

El usuario pone el token en la lámina 4 **cuando la Parte B haya pasado**, no antes.

---

## Parte D · Regenerar y leer

**Modelo: Sonnet.**

Una corrida de julio. Del deck: **el orden de las láminas**, y que cada carátula traiga el `EVENTO`
de la lámina de detalle que le sigue. Seis pares, no seis y seis.

Si sale peor que el mejor deck vigente, se vuelve al commit anterior y se dice.
