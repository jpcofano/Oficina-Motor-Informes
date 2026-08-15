# 2026-08-15_1 — Piloto: los ocho de `Impresiones` a una medida con dimensiones

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que los ocho marcadores de `looker/DIGITAL/Impresiones` dejen de
> declarar su corte en un `filtro` de texto libre y lo declaren en dimensiones, **sin que
> cambie un solo número publicado**.
>
> **Es el primer prompt de la migración que toca `MARCADORES`.** No renombra ningún token, no
> toca plantillas, no migra ninguna otra familia.

---

## Por qué éstos ocho

Medidos contra la línea base `docs/_snapshots/MARCADORES_2026-08-15.tsv`: los ocho comparten
base, solapa, `campo_logico` (`Impresiones`) y `operacion` (`SUMA`). Todos llevan
`estado=Activa`, que `D-33` ya clasificó como restricción técnica y no como dimensión. Lo
único que los distingue son dos cortes: el ámbito y la plataforma.

Es el caso más limpio que tiene el proyecto y por eso es el piloto. Si acá no reproduce, la
migración se detiene y sale barato.

---

## La decisión de diseño que el piloto tiene que resolver

**`imp_total` y `gcba_imp_total` no tienen plataforma.** Son el agregado sobre las tres. Así
que la matriz no es 2 × 3 = 6, es 2 × (3 + el total) = 8, y la dimensión `plataforma` necesita
un cuarto estado.

Lo que propongo, y es lo que hacen los semantic layers: **una dimensión ausente significa
"todas"**. `plataforma` vacía es el agregado; si no pedís el corte, obtenés el total. Simple,
y no inventa un valor `todas` que después hay que mantener sincronizado con la lista real.

El riesgo de esa elección hay que decirlo: **ausente y "todas" se ven igual**. Una fila a la
que alguien se olvidó de ponerle plataforma va a devolver el total en vez de fallar. Con
`R-24` en pie —`programmatic` se calcula por resta— eso es tolerable, porque el total y la
suma de las partes tienen que coincidir y el descuadre es medible. **Que quede escrito como
el control que lo detecta.**

---

## Y lo que el piloto **no** cambia, que es lo que lo hace verificable

**Los nombres de los ocho marcadores quedan exactamente como están.** `imp_meta` sigue
llamándose `imp_meta`, y la plantilla no se toca.

Esto no es una concesión: es lo que permite comparar. Si en la misma corrida cambiaran la
definición **y** el nombre, un número distinto no diría si falló la estructura o el cableado.
Se estructura la definición, se verifica que los ocho números no se muevan, y recién después
se discute si los nombres se unifican — que además ya no urge, porque con el corte declarado
en dimensiones el nombre pasa a ser una etiqueta.

---

## Parte A — el testigo, **sólo lectura** · modelo: **Sonnet** · effort: alto

**No editar nada. Termina en reportar y parar.**

1. **Los ocho valores de hoy.** Correr los ocho marcadores sobre una ventana concreta y
   registrar el número que produce cada uno, **con la ventana nombrada**. Ése es el testigo
   contra el que se compara todo lo demás; sin él, el piloto no se puede verificar.

2. **Guardarlo en el repo**, fechado. Un testigo que existe sólo en un log no sirve para
   comparar la semana que viene — es la lección del `_4`.

3. **El descuadre, medido antes de tocar.** ¿`imp_total` es igual a `imp_meta + imp_google +
   imp_prog`? ¿Y del lado GCBA? **Si hoy no cuadran, hay que saberlo antes**, porque después
   de la migración un descuadre parecería causado por ella.

4. **Los consumidores.** Qué láminas y qué informes usan esos ocho tokens. Si alguno no está
   en ninguna plantilla, decirlo: un marcador sin consumidor se migra igual, pero no se puede
   verificar contra un deck.

5. **Dónde se traduce hoy el `filtro` a una condición.** Nombrar la función, sin cambiarla. La
   Parte B necesita saber dónde se engancha la resolución de dimensiones.

**Reportar y parar.**

---

## Gate — decisión del usuario

Con el testigo delante: **¿`plataforma` ausente significa "todas"**, o se prefiere un valor
explícito? La Parte B no arranca sin esto.

---

## Parte B — estructurar · modelo: **Opus** · effort: alto

1. **Las columnas de dimensión en `MARCADORES`**, en la hoja y en el seed **por el mismo
   camino**. Escribir en los dos lados por separado es lo que produjo las reversiones
   silenciosas.

2. **Poblar sólo esos ocho.** Los otros 70 quedan como están, con su `filtro` de texto. **Las
   dos formas conviven durante el piloto** y eso es deliberado: si el piloto falla, revertir es
   borrar ocho filas de dimensiones, no deshacer una migración.

3. **La resolución de dimensión a condición física**, según `D-33`, en el módulo que
   corresponda —datos y fuentes, no aritmética ni despacho—. `estado=Activa` **sigue siendo
   `filtro`**: es restricción técnica, no dimensión, y mezclarlas rompería la frontera que
   `D-33` acaba de trazar.

4. **`R-24` no se deroga.** `programmatic` se sigue calculando por resta. Si la
   implementación de la dimensión sugiere darle un valor propio, **se reporta y no se hace**.

---

## Parte C — verificar · modelo: **Opus** · effort: alto

**Es la parte que decide si la migración sigue.**

1. **Los ocho números, otra vez, sobre la misma ventana**, comparados uno a uno contra el
   testigo de la Parte A.

2. **Tienen que dar exactamente igual.** No "parecido", no "dentro de un margen". Un solo
   valor distinto detiene el piloto: se reporta, no se ajusta la dimensión hasta que cuadre.
   Ajustar hasta que dé es cómo se fabrica un número que reproduce por casualidad.

3. **Si reproducen los ocho**, dejar escrito en `PLAN.md` que el piloto pasó, con la ventana y
   los números. Es lo que autoriza el frente 13, la migración por tandas.

4. **Si no reproducen**, revertir las dimensiones de esos ocho y reportar. `MARCADORES` vuelve
   al estado de la línea base y el frente 13 queda bloqueado hasta entender por qué.

5. Commits separados entre configuración, código y documentación.

---

## Lo que este prompt **no** hace

- **No renombra nada.** Ni los ocho, ni los `gcba_*`, ni ninguna familia.
- **No migra los otros 70.** Eso es el frente 13 y depende de que esto pase.
- **No toca los `pauta_*` ni los `enc_*`/`ivr_*`.** Tienen sus propios destinos en `D-33`.
- **No toca plantillas.**
