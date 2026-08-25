# 2026-08-24_2 — El front, segunda tanda: que el conteo de faltantes sea confiable

> **Estado:** no ejecutado · **corrida nocturna, sin usuario disponible** · **subagente:** ninguno
>
> ⭐ **Por qué esta tanda se puede hacer de noche:** nada de acá mueve un número publicado. Todo lo
> que se toca es **cómo se muestra y cómo se cuenta** lo que el motor ya calculó.
>
> ⛔ **Regla dura de esta corrida:** si algo pide tocar `Marcadores.gs`, `MARCADORES`, `MAPEO`,
> `SOLAPAS` o cualquier cosa que cambie un valor, **anotarlo y saltear la parte**. No hay nadie
> para verificar un número.
>
> ⛔ **Y `L-036` no se toca.** Quedó en `-` con una sola candidata viva —el `id_cuenta` del
> anclaje contra el ID de `Agenda JM | Post`— y se retoma mañana con el usuario.

---

## El problema, en una línea

**El conteo de faltantes es el instrumento con el que se va a declarar el cierre de fase (`D-38`),
y hoy no se puede confiar en él.**

La vista agrupa por causa y por ítem, que ya es mucho más que antes. Pero **no descuenta lo que no
es un faltante** —las láminas fuera de alcance, el texto que escribe el equipo— y **no agrupa por
lámina**, que es como el usuario mira un deck.

⭐ **Y hoy 24/08 el conteo mintió en las dos direcciones:** el censo lista 57 tokens de tres
láminas escondidas que **no son faltantes**, y a la vez `L-036` publicó el Recap de CABA con forma
de acierto sin que ningún conteo se enterara.

---

## Parte A — medir. Sólo lectura. **Reportar y seguir** · Sonnet · effort alto

⚠ **Bifurcación, no freno.** Reportar y continuar salvo que caiga una premisa.

1. **`LAMINAS`** — sus columnas, y confirmar que no tiene ninguna que declare alcance. El
   `CIERRE_POR_LAMINA.md` lo afirma; verificarlo contra la hoja viva.
2. **`FALTANTES`** — sus columnas hoy, incluida `causa`, y qué se escribe en cada una. Y de dónde
   sale el sufijo `@ítem`.
3. **`CORRIDAS.mapa_tokens`** — qué guarda exactamente. Al 24/08 guarda el **índice de slide del
   deck expandido**, que no es un `lamina_id`. Confirmar si hay algún otro lugar donde el
   `lamina_id` viva junto al token.
4. **`ANCLAJE_MEDICION`** — sus columnas y qué escribe hoy, incluidos los fallos que se agregaron
   en `9c48769`.
5. **El panel** — dónde está la pestaña Faltantes y qué muestra.

---

## Parte B — las dos causas que faltan · **Opus** · effort alto

**Hoy el conteo suma como faltantes cosas que nadie va a cablear nunca.**

| causa | ejemplo real del 24/08 |
|---|---|
| **fuera de alcance** | los 57 tokens de `L-039`, `L-048` y `L-050` (`D-39`) |
| **texto del equipo** | los seis `camp_bench_*`, `camp_dig_insight`, `camp_mail_insight` |

**Lo que hace falta es que la lámina declare su alcance.** Alta de columna en `LAMINAS`, poblada
desde lo que ya está escrito en `CIERRE_POR_LAMINA.md` y en `D-39`.

⛔ **Y el token de texto del equipo es por token, no por lámina** — `L-046` está en alcance y sus
seis `camp_bench_*` no. Así que son dos declaraciones distintas y no una.

⚠ **Si poblar la columna obliga a decidir el alcance de alguna lámina que no esté ya escrito,
anotarla y dejarla sin declarar.** No inventar clasificación: es exactamente lo que el turno
anterior decidió bien al no implementar esto a ciegas.

**El conteo pasa a decir tres números**: faltantes reales · fuera de alcance · texto del equipo.
Y **el que decide el cierre es el primero**.

---

## Parte C — agrupar por lámina · **Opus** · effort alto

**Es como el usuario mira un deck**, y hoy la vista no lo puede hacer porque `FALTANTES` no guarda
de qué lámina viene cada token.

**Lo mínimo:** que `escribirFaltantes_` guarde el `lamina_id`. El dato existe en el momento de
escribir —el motor sabe qué lámina está pintando— y lo que falta es que llegue a la hoja.

⚠ **Ojo con el mismo token en varias láminas.** `camp_titulo` aparece en 14, `ecv_barrio` en 4. Un
token puede faltar en una y publicar en otra, así que la fila de `FALTANTES` es **por token y por
lámina**, que es lo que el propio conteo del deck ya dice —*"uno por dato y por lámina"*—.

⭐ **Y con esto el tablero y la vista pasan a hablar el mismo idioma:** `CIERRE_POR_LAMINA.md` está
organizado por lámina y `FALTANTES` no, así que hoy cruzarlos es a mano.

---

## Parte D — `sinLink` en el panel · **Opus** · effort alto

`ANCLAJE_MEDICION` existe desde el 23/08 y **ya demostró su valor hoy**: contestó *"intentados 6 ·
anclados 6 · sin_link 0"* donde *"no hay anclajes pendientes"* no distinguía nada.

**Lo que falta es que se lea sin abrir la planilla.** La última fila, con `intentados`, `anclados`,
`sin_link` y los nombres de los que no anclaron.

⛔ **Y con la trampa que se descubrió hoy declarada en la propia vista:** hasta `9c48769` un
anclaje que fallaba **no escribía fila**, así que la última fila se leía como *"lo último que
pasó"* cuando era *"lo último que salió bien"*. La vista tiene que mostrar **la fecha de la fila y
la de la corrida actual**, para que un desfase se vea en vez de descubrirse comparando.

---

## Parte E — el pase de estilo · **Opus** · effort alto

⚠ **Guía de diseño, escrita acá porque no hay ninguna que Code pueda leer** — el turno anterior
apuntó a una ruta que no existe en esa máquina.

**Quién lo usa y para qué:** una persona que acaba de generar un deck y necesita saber, en diez
segundos, **si puede publicarlo**. No es un dashboard.

1. **Lo que frena la publicación va arriba y sin scroll.** Un número viejo publicado sin marca es
   peor que un `/////`.
2. **Los cinco símbolos con su leyenda**, que ya está, y ahora con los tres conteos separados de
   la Parte B.
3. **Jerarquía por consecuencia, no por cantidad.** Una lámina con un dato mal es más urgente que
   una con veinte sin cablear.
4. ⛔ **Sin `localStorage` ni `sessionStorage`**, sin dependencias nuevas. Corre en Apps Script.
5. **Es un pase de estilo sobre una sección existente, no un rediseño.** Si obliga a tocar la
   lógica de una `panel_*`, **anotarlo y no hacerlo**.

---

## Orden de sacrificabilidad — importa, nadie va a estar mirando

`A` → `B` → `C` es lo que justifica la noche: son las dos mitades de que el conteo sea confiable.

`D` y `E` en ese orden, y las dos pueden caer enteras.

⛔ **Si algo se rompe, parar y dejarlo escrito.** Un `HANDOFF` con *"llegué hasta acá"* vale más
que una parte a medias que haya que auditar mañana.

---

## Lo que NO se toca

- Ningún número publicado ni publicable.
- **`L-036`** — una sola candidata viva, se retoma con el usuario.
- `X-41` — el universo ancho de las láminas fijas. Marcado, espera mecanismo.
- El parseo del nombre del ítem más allá de lo ya hecho.
- La frecuencia, `X-32`, `X-19`.

## Antes de empezar

⚠ **La bitácora y el handoff están atrasados ocho commits.** Si no se cerraron en el turno
anterior, **eso es lo primero de esta corrida**, antes de la Parte A. Esta semana ya mostró dos
veces lo que pasa cuando los docs cruzan el turno.

## Commits

Uno por parte. Y al final un `HANDOFF` corto con qué quedó hecho, qué no, y qué necesita una
corrida para verificarse.
