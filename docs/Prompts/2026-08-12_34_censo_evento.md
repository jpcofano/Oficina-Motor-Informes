# `_34` · Censo de `EVENTO` — el catálogo antes del agrupamiento

> **Sólo lectura.** No cablea, no agrupa, no toca la plantilla. Es el insumo de una decisión del
> usuario, no una implementación.
>
> El usuario quiere agrupar las láminas de encuentro por evento, con una carátula por grupo. **La
> clave de agrupamiento sería `EVENTO` de `rdv`, que es texto libre**, y sobre la muestra que pasó
> —19 valores— hay cinco pares que son el mismo evento escrito distinto: `Movilidad` con espacio al
> final, `SALUD`/`Salud`, `EDUCACION`/`Educación`, `Orden Público`/`Orden público`,
> `Ciudad Atractiva`/`Ciudad atractiva`. Agrupar por el valor crudo produciría **19 grupos donde
> hay 14**, en silencio.
>
> Es literalmente el caso de `§5.1` —Twitch con un espacio al final— y por eso el primer paso no es
> código.

---

## Parte A · El censo

**Modelo: Sonnet, effort alto.**

Sobre `rdv/RVD JM-CM - ES`, columna `EVENTO`, **todas las filas, sin recorte de figura ni de
ventana**:

1. **Los valores crudos distintos, con su conteo de filas y su rango de fechas.** Tal cual, sin
   normalizar y sin corregir: los espacios y las mayúsculas son el dato.
2. **Los mismos valores agrupados por una normalización de referencia** —minúsculas, sin acentos,
   sin comillas, espacios colapsados—, mostrando **qué crudos caen en cada normalizado**. Es para
   ver el tamaño del problema, **no una propuesta de catálogo**.
3. **Un nivel más arriba**: cuántos caen en cada familia aparente —`Encuentro Temático`,
   `Primera Persona`, `Encuentro con Vecinos`, `Café con vecinos`, `1 a 1`— y **cuáles no encajan en
   ninguna**. Los que no encajan importan más que los que sí.
4. Cuántas filas tienen `EVENTO` vacío.

**Reportar y parar.** Ninguna corrección, ninguna fila tocada, ningún catálogo escrito. La
normalización es curaduría del usuario y se decide con la tabla a la vista.

---

## Por qué no hay Parte B

El agrupamiento con carátula necesita, en este orden:

1. **Un catálogo de equivalencias de `EVENTO`** — dueño: el usuario. Sin él, agrupar es adivinar.
   El repo ya tiene el patrón para esto y conviene reusarlo, no inventar uno nuevo.
2. **Decidir el nivel de agrupamiento**: por evento normalizado (unos 14) o por familia (unos 5).
   Son dos decks distintos. Depende de lo que muestre el censo.
3. **Recién ahí, el motor.** Hoy `duplicarBloquesRepetibles_` duplica **cada lámina modelo N veces**,
   una por ítem: dos modelos dan `[A×N][B×N]`, no `[A₁B₁][A₂B₂]`. El bloque por ítem es invertir ese
   anidamiento. El bloque por **grupo**, con ítems adentro, es un segundo nivel y cambia el orden de
   emisión de todas las secciones repetibles.

Los tres pasos son baratos por separado. Saltearse el 1 es lo que sale caro.
