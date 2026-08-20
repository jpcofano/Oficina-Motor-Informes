# 2026-08-20_1 — Cuatro símbolos en el deck: `/////`, `---`, `-`, y el dudoso entre guiones

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que el deck distinga **el token que nadie cableó**, **el que se cableó y
> falló**, y **el que se preguntó bien y no tenía dato**. Hoy los tres salen `—`.
>
> ⛔ **No toca `MARCADORES`, no toca ninguna operación, no cambia ningún valor publicado.**
> Cambia **cómo se escribe la ausencia**, y nada más.

---

## La decisión que lo funda — usuario, 20/08/2026

| en el deck | qué significa | de dónde sale |
|---|---|---|
| `/////` | **falta el token**: nadie lo cableó, o el motor no llegó a resolverlo | sin fila en `MARCADORES`, y los tokens que la barrida final no alcanzó |
| `---` | **falló**: hay fila, se intentó leer y no salió | `estado = error` · `estado = REVISAR` |
| `-` | **no hay dato**: se preguntó bien y la respuesta fue vacía | `estado = sin_datos` |
| `-1.234-` | **dudoso**: publicado, con desconfianza declarada por una persona | ya existe — sufijo `_revisar` en `MARCADORES.formato` (`2026-08-19_1` Parte C). **No se toca** |

**La línea que separa `/////` de `---`** es *¿existe la fila de `MARCADORES`?*. Es la pregunta que
decide **quién arregla qué**: `/////` es trabajo de cableado, `---` es trabajo de fuente o de
filtro. Un solo símbolo para los dos obligaría a abrir `FALTANTES` para saber cuál de los dos
oficios hace falta.

**Por qué `REVISAR` va a `---` y no a `-`:** `R-18` addendum 1 dice que `sin_datos` **afirma que
no había nada**. `REVISAR` es lo contrario — había filas y ninguna se pudo publicar. Escribirlo
como `-` publicaría esa afirmación falsa, que es el modo de falla que este repo persigue.

**Ante ausencia de información, el símbolo es el más ruidoso.** Un punto de escritura que no
tiene a mano el resultado del marcador escribe `/////`. **Nunca `-`**: `-` es una afirmación sobre
el dato, y quien no tiene el resultado no está en condiciones de hacerla.

### El modo `«FALTA:token»` se conserva, y es la flexibilidad, no una reserva

El checkbox que hoy elige entre `—` y `«FALTA:token»` pasa a elegir entre **los cuatro símbolos**
y el crudo. **Los símbolos son el default.**

⚠ **Y por eso `S-05` no se cae.** Su punto 3 difiere los símbolos hasta que haya lector externo,
con el argumento de que el crudo dice más durante el desarrollo. Con el crudo disponible detrás de
un checkbox, el argumento se sostiene y el supuesto sigue vivo: **lo que entra es un modo, no un
reemplazo.**

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort alto.** Alto para leer el camino de escritura con cuidado, no para
> decidir nada.

1. **Los puntos donde se escribe una ausencia en el deck.** Al 20/08 son tres llamadas a
   `textoFaltante_` en `Generador.gs` —la de la rama por ítem, la de la pasada de tokens fijos, y
   la que recibe `barrerTokensNoAlcanzados_`—. **Confirmar que son ésos y que no hay un cuarto**,
   incluido cualquier lugar que escriba `'—'` literal.
2. ⭐ **Qué sabe cada punto en el momento de escribir.** Para cada uno de los tres, reportar **si
   tiene a mano el resultado del marcador** (`r`/`fila`) y su `estado`, **si puede distinguir
   "no hay fila en `MARCADORES`" de "hay fila y falló"**, o si sólo tiene el nombre del token.
   **Esta es la medición que decide si los cuatro símbolos son alcanzables en los tres puntos o
   sólo en dos.**
   ⚠ La barrida es el caso sospechoso: si no tiene con qué distinguir, su único símbolo posible
   es `/////`, y eso hay que decirlo en vez de inventarle un estado.
3. **Los estados que existen hoy**, contra el código y no contra la documentación: el conjunto que
   puede tomar `estado` en el resultado de un marcador y **dónde se asigna cada uno**. Al 20/08 se
   esperan `ok`, `sin_datos`, `REVISAR`, `error`. Si hay un quinto, reportarlo y **parar**: un
   estado sin símbolo asignado es una decisión del usuario, no una que se toma acá.
4. **El censo de la última corrida de `jm`**, leído de `FALTANTES` o del reporte: **cuántas filas
   caerían en cada símbolo**. Es la única forma de saber si el cambio se va a ver o si el deck es
   todo `/////`. Al 18/08 el orden de magnitud esperado era ~102 tokens sin fila; **medirlo, no
   citarlo**.
5. **Quién más lee `presentacion_faltantes`.** Hoy `panel_generar` lo devuelve y `Panel.html` lo
   pinta comparando contra `'raya'`. Reportar todas las apariciones: el valor cambia y un lector
   que compare contra `'raya'` va a decir la frase equivocada sin fallar.
6. **El control positivo que ya existe** para `textoFaltante_` o para el formateador, si lo hay.
   Reportar cuál y qué afirma.

**Reportar todo junto y parar.** ⛔ No escribir código en esta corrida.

---

## Parte A — el símbolo sale del estado

> **Modelo: Opus · effort alto.** Mueve lo que se publica en un deck.

`textoFaltante_` deja de decidir con un booleano y pasa a decidir con **el estado, y con la
existencia de la fila**.

**Tres reglas, y ninguna se infiere en el llamador:**

1. **El mapeo vive en una sola función.** Los tres puntos de escritura le pasan lo que tienen y
   ella devuelve el texto. Si el mapeo se reparte entre los llamadores, mañana hay tres
   convenciones y dos están mal.
2. **Sin información suficiente → `/////`.** Escrito como regla y no como default accidental.
3. **El modo crudo se conserva entero.** Con `«FALTA:token»`, los cuatro casos siguen saliendo
   como hoy, con el nombre del token adentro. Nada de mezclar: **o los cuatro símbolos, o el
   crudo**.

**`presentacion_faltantes` pasa a declarar el modo con un valor nuevo** —`'simbolos'` en vez de
`'raya'`— **y todos sus lectores se actualizan en este prompt**. Un valor viejo que sobreviva en
un `if` hace que el panel afirme lo que ya no es cierto, sin fallar.

⭐ **El lector roto está medido y tiene un agravante que hay que quitar, no sólo actualizar.**
`Panel.html` compara `r.presentacion_faltantes === 'raya' || S.faltantesComoRaya`: **el segundo
término es estado local del front**, así que con el checkbox tildado la frase diría "una raya"
aunque el backend mande `'simbolos'`. **El `||` se retira**: quien dice qué se imprimió es el
backend, que es el que lo imprimió. Un front que responde por su cuenta una pregunta del backend
es la misma clase de falla que un testigo que no mide el cambio.
`PanelDemo.html` tiene la frase escrita a mano y ya está desactualizada: se corrige o se marca,
pero **no se la deja afirmando lo que no pasa**.

⛔ **Lo que no cambia:** `FALTANTES` sigue recibiendo su fila con el motivo completo, igual que
hoy, en los cuatro casos. **El símbolo es del deck; el motivo es de la hoja.** Un deck más callado
con una hoja igual de habladora es exactamente el intercambio que esta decisión hace.

---

## Parte B — el control positivo

> **Modelo: Sonnet · effort medio.**

Sobre la función pura, en `tools/` o donde ya vivan los controles de formateo, **sin planilla**.

1. **Los cuatro casos dan cuatro salidas**, cada uno con su afirmación propia.
   ⭐ **`sin fila` → `/////` y `error` → `---` van como dos afirmaciones separadas**: un mapeo que
   devolviera `---` para todo pasaría un control que sólo mire `error`.
2. **`REVISAR` → `---`**, con la afirmación escrita como tal. Es el caso que más fácil se
   confunde con `sin_datos`.
3. **Sin estado y sin fila → `/////`.** El caso de la barrida.
4. **Modo crudo → `«FALTA:token»` en los cuatro**, con el token adentro.
5. **El dudoso no se toca**: `formatearValorMarcador_(8.89, 'numero_revisar')` sigue dando
   **`-8.89-`, con punto** — `numero` es `String(Math.round(n*100)/100)` y no pasa por
   `toLocaleString`. ⚠ **La ilustración con coma es un error de redacción de prompt que ya entró
   dos veces por el mismo camino** y que `tools/probar-formato-revisar.js` documenta en su
   encabezado. Va acá aunque no sea de este cambio, porque los símbolos conviven en la misma
   lámina y **`-8.89-` y `-` se parecen lo suficiente como para que alguien los unifique
   después**. El separador decimal de `numero` **no se arregla en este prompt** (preexistente
   desde el 05/08, anotado).

---

## Parte C — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/CONFIG_INFORMES.md`** — la tabla de los cuatro símbolos, como decisión editorial del
   usuario del 20/08/2026, con la línea `/////` vs `---` escrita como *quién arregla qué*.
2. **`docs/SUPUESTOS.md`, `S-05` punto 3** — hoy difiere los símbolos hasta que haya lector
   externo. **Anotar que entraron antes, como modo de corrida y sin retirar el crudo**, así que
   el supuesto **no se cae**. ⚠ No borrar el punto: la reversión que describe sigue siendo la
   correcta el día que `S-05` caiga.
3. **`docs/PLAN.md` §3** — la fila *"Los estados `-` y `---`"* pasa a hecha, con la fecha y con la
   diferencia respecto de lo que decía: son **cuatro** símbolos y no dos, y `-` quedó reservado a
   `sin_datos`.
4. `docs/BITACORA.md` — la entrada, con el censo del punto 4 de la Parte 0.

---

## Parte D — verificar

> **Modelo: Sonnet · effort medio.**

1. Los controles de la Parte B pasan.
2. `node tools/listas.js` pasa.
3. **El reporte de corrida sigue distinguiendo los cuatro estados** aunque el deck use símbolos.
   Es la salvaguarda que `PLAN.md` §3 declara junto a esta decisión: *"no calculable"* y *"falló
   el cableado"* tienen que seguir separados en el reporte.
4. **No se corre una generación para verificar esto.** El cambio es puro y la Parte B lo cubre;
   una corrida de cinco minutos no agrega evidencia y mezcla este cambio con el drift de las
   bases.

## Lo que este prompt **no** hace

- ⛔ No toca `MARCADORES` ni ningún valor.
- ⛔ No retira el modo `«FALTA:token»`.
- ⛔ No cambia qué se escribe en `FALTANTES`.
- ⛔ No toca el sufijo `_revisar` ni el formateador de valores.
