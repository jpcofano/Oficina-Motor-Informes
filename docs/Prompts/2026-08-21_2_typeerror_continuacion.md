# 2026-08-21_2 — La rama de continuación tira `TypeError` y no tiene una sola afirmación

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Objetivo único:** que continuar un deck existente devuelva `ok` en vez de tirar. Nada más.
>
> ⛔ **Bloquea la prueba del ciclo desatendido.** Sin esto, la reanudación real no puede terminar
> nunca, así que probar el ciclo es probar un camino que se sabe roto.

---

## El bug

`generarInformeConCache_` (`Generador.gs`) arma su retorno con:

```js
deck: { id: deckId, nombre: copia.getName(), url: copia.getUrl(), dueno: dueno },
```

**`copia` sólo se asigna en la rama que copia la plantilla.** Al continuar un deck
(`opciones.deck_id`), esa rama no corre, `copia` queda `undefined` y `copia.getName()` tira
`TypeError` — **fuera del `try/catch`** que protege las etapas, o sea después de que el cierre ya
escribió `CORRIDAS` y quitó el sello.

**Consecuencia:** `correrUnaEjecucion_` no marca secciones `hecha`, no guarda el estado y no crea el
trigger siguiente. La corrida se detiene con el plan a medias.

---

## Parte 0 — barrer la MISMA clase de bug. Sólo lectura. **Reportar y seguir.**

> **Modelo: Sonnet · effort alto.**

⭐ **No alcanza con esta línea.** **Toda variable que se asigne únicamente en la rama que copia la
plantilla y se lea después es el mismo error esperando**, y las dos ramas compilan igual.

1. Listar **todas** las variables asignadas sólo dentro del `else` que copia la plantilla, y todos
   sus usos posteriores. `copia` es una; **decir si hay más**.
2. Lo mismo para lo que se asigna sólo bajo `if (continuando)`: el error simétrico existe.
3. **Reportar la lista aunque esté vacía.** Un cero medido y dicho es un resultado; un cero que
   nadie buscó no se distingue de «no miré».

---

## Parte A — el arreglo

> **Modelo: Opus · effort alto.**

1. El retorno resuelve el archivo por **`deckId`**, que existe en los dos caminos. Ni `copia` ni
   ninguna otra variable de una sola rama.
2. Y lo que la Parte 0 haya encontrado, si encontró algo.

⛔ **Nada más.** No se toca el planificador, ni el marcado, ni el cierre, ni el reloj.

---

## Parte B — el control que faltaba

> **Modelo: Sonnet · effort alto.**

⭐ **El control mínimo: continuar sobre un deck existente devuelve `ok`, sin excepción.** Y **no
es el del camino feliz**: hoy las tres suites — **18** afirmaciones del planificador, **14** de
`resueltas`, **17** del reloj — están **todas en verde** y **ninguna toca la rama de continuación**.
Esa rama no tiene una sola afirmación.

1. Un control que llame a `generarInforme` con `deck_id` y `asignaciones` y afirme que **vuelve**.
2. ⚠ **Romper a propósito:** devolver `copia` a la línea y verificar que el control caiga con
   `TypeError`. Si no cae, no mide lo que dice.
3. Y el caso simétrico en la misma prueba: **sin** `deck_id` también vuelve. Un arreglo que
   rompiera el camino de siempre pasaría el punto 1.

---

## Parte C — la documentación

> **Modelo: Sonnet · effort medio.**

1. ⚠ **`CLAUDE.md` §4 — por qué esto se publicó, que es lo que hay que no repetir:** *una rama
   nueva que nunca se ejecutó no está sin probar, está sin escribir el control*. La única corrida
   desatendida real salió por el camino que **devuelve antes** de llamar a `generarInforme`, así que
   el verde de las tres suites **no cubría nada de lo que se había agregado**.
2. `docs/PENDIENTES_consistencia.md` — cerrar la entrada abierta del 21/08.
3. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No prueba el ciclo desatendido. Eso viene después y es otra corrida.
- ⛔ No toca el reloj ni el mecanismo de corte.
