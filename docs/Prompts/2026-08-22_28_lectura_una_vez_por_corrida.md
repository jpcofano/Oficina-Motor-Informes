# 2026-08-22_28 — Cada fuente se lee una vez por corrida

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **P0.** Con seis encuentros el deck **no sale**, y el síntoma es el muro de los 360 s, que **no
> deja rastro**. El testigo `jm-20260821-234927` corrió con dos.
>
> ⛔ **Este paso no vuelve a medir dónde está el costo.** Ya está medido: `unirDigitalPorCuenta`
> tarda 33 s con dos encuentros y más de 325 con seis. **Tres veces el trabajo, diez veces el
> tiempo.** Una fuente lenta escala lineal; esto no. La causa es un trabajo que **se repite por
> elemento**, y el arreglo es el mismo sin importar en qué solapa esté.

---

## El precedente, que es lo que hace innecesaria otra medición

Este patrón ya apareció dos veces en el proyecto y las dos se arreglaron igual:

1. **`encontrarFilaRdvDeReunion_`** — arma una ventana de un día y `claveCacheLectura_` incluye las
   dos fechas, así que **la caché nunca acierta y cada reunión paga una lectura completa de `rdv`**.
   Se ve en los tiempos medidos: 7 a 10 s por reunión, **uniformes**, que es la firma de una lectura
   repetida. Son 49 s de las seis.
2. **El N² de `duplicate()`** — la solución escrita fue **calcular el conjunto una vez por corrida,
   antes de cualquier duplicación**.

⭐ **La misma forma resuelve los dos costos**, y por eso entran en un solo paso.

---

## Parte A — premisas. Sólo lectura de **código**, ninguna corrida · **Sonnet** · effort alto

1. Cómo arma `claveCacheLectura_` la clave, y **qué la hace variar entre dos llamadas de la misma
   corrida**.
2. Cuántas veces se llama a la lectura de fuente dentro de `unirDigitalPorCuenta`, **y si la ventana
   que le pasa varía por cuenta o por encuentro**.
3. Si la caché tiene alcance de corrida o se pierde entre llamadas.

**Si las tres confirman que la lectura se repite por elemento: seguir sin parar.** El freno de este
paso es condicional, a propósito.

⛔ **Parar y reportar sólo si la premisa cae** — si la lectura ya se hace una vez y el costo está en
otro lado. En ese caso el arreglo de abajo no aplica y hace falta la medición por solapa que Code
propuso.

---

## Parte B — el arreglo · **Opus** · effort alto

**Cada fuente se lee una vez por corrida.** El conjunto se arma antes de iterar y los elementos se
sirven de él, en vez de que cada elemento dispare su propia lectura.

Alcance: `unirDigitalPorCuenta` y `encontrarFilaRdvDeReunion_`.

⛔ **Ni un número cambia.** Se lee lo mismo, menos veces. Si el resultado se mueve, **el arreglo
está mal y se reporta**, no se ajusta.

⚠ **Y la ventana es parte de la identidad de lo leído.** Si dos elementos necesitan ventanas
distintas de la misma fuente, **leer una vez con la ventana ancha y recortar en memoria no es lo
mismo** que leer dos veces — hay que verificar que el recorte reproduzca lo que hoy devuelve cada
lectura. Ése es el punto donde este arreglo podría cambiar un número sin querer.

---

## Parte C — el control, que es el cronómetro · **Sonnet**

| | esperado |
|---|---|
| `verificarAgregadoDeJulio()` sobre `julio_24_30`, 6 encuentros | **entra en el techo** |
| las seis lecturas de `rdv` | bajan de los 49 s medidos |
| `agosto_14_20`, 2 encuentros | **no empeora** — la unión estaba en 33 s |
| los valores del agregado | **idénticos** a los de antes del cambio |

⭐ **Y el control que decide si el diagnóstico era correcto:** que el tiempo **deje de crecer más
rápido que el temario**. Si con seis sigue costando diez veces lo de dos, el arreglo no tocó la
causa y ahí sí va la medición por solapa.

⛔ **La última fila es la que puede frenar todo.** Un valor distinto significa que el recorte en
memoria no equivale a la lectura por ventana. **Reportar y parar.**

---

## Parte D — que no vuelva a pasar · **Sonnet**

1. **`CLAUDE.md` §2, como invariante:** una fuente se lee **una vez por corrida**; lo que varía por
   elemento se recorta en memoria, no con una lectura nueva. Con los dos casos como evidencia.
2. **En `PENDIENTES`**, el P0 pasa a resuelto con los tiempos nuevos, o queda abierto con el número
   medido si el control de la Parte C no dio.
3. **La limitación del freno queda anotada, no arreglada:** el presupuesto se chequea **antes** de
   cada etapa y la etapa 4 entró con 49 s de 270, con toda la razón, y murió igual. Es la lección
   del `2026-08-21_1` que `CLAUDE.md` §4 ya tiene escrita, cobrada de nuevo. **Un freno que sólo
   mira la entrada no protege contra una etapa indivisible que se pasa sola.**

---

## Orden de sacrificabilidad

`A` → `B` → `C` no se parten. `D` es la única que puede caer por tiempo.

## Commits

Uno por parte. Sin `Co-Authored-By`.
