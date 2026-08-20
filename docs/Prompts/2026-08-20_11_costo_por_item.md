# 2026-08-20_11 — Los 200 segundos de la pasada por ítem

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Objetivo único:** bajar el costo por ítem sin mover un solo valor publicado.
>
> ⛔ **Ninguna optimización que pueda cambiar un número entra en este prompt.** Si aparece una que
> lo haría, se reporta y se deja para un prompt propio con su testigo.

---

## El desglose que lo funda — corrida `jm-20260820-171421`

```
expansión entera (anclaje + unión digital + duplicar)    80 s   ← el costo fijo
mapa token→objectId                                      16 s
⭐ pasada por ítem                                      200 s   ← 8 encuentros, ~25 s cada uno
tokens fijos                                             11 s
cierre                                                    3 s
```

**La respuesta a la pregunta que ordenaba el `_9`: pocos ítems carísimos.** Y el número coincide con
los 27 s que el corte de las 15:45 había estimado para el próximo ítem, así que no es ruido.

**Por qué esto va antes del `2026-08-20_10`:** la corrida entró con 43 s de margen. En cuanto entren
las 49 `*` de `secco` y más ítems, vuelve a cortar — y el `_10` habría construido triggers, lock y
plan **para sostener un motor que gasta 25 s por ítem**. Bajar el costo puede volver innecesario el
mecanismo; el mecanismo no baja el costo.

---

## Parte 0 — medir el gasto DENTRO de un ítem. Sólo lectura. **Reportar y seguir.**

> **Modelo: Sonnet · effort alto.**

⭐ **La pregunta: ¿los 25 s son muchas operaciones baratas o pocas lecturas de base repetidas?**

1. ⭐ **Cuántas veces se lee cada base por corrida, y con qué clave de caché.** No cuántas llamadas
   a `leerFuente` — **cuántas efectivamente releyeron** porque la clave no pegó. Reportar la lista
   de claves distintas por base.
   **La hipótesis a confirmar o matar:** `encontrarFilaRdvDeReunion_` arma una ventana propia por
   reunión —el mediodía de ese día— y llama a `leerFuente('rdv', ventanaDia)`. Si el caché indexa
   por base + ventana, **cada reunión tiene su clave y relee `rdv` entera**. Ocho encuentros, ocho
   lecturas completas. **Si es esto, el arreglo es chico y no toca ningún valor.**
2. **El desglose dentro de un ítem**: cuánto va a leer bases, cuánto a resolver marcadores, cuánto a
   escribir en Slides. Con instrumentación mínima, del mismo tipo que la que sobrevive al cierre.
3. **Cuántos marcadores se resuelven por ítem** y cuántas lecturas de base hace cada uno.
4. **El `flush()` por reunión** dentro del anclaje: dónde está, por qué se puso, y qué se rompe si
   se saca. ⚠ **Un `flush()` suele estar porque algo lo necesitaba** — sacarlo sin saber qué es
   cambiar comportamiento, no optimizar.
5. **Las 8 escrituras individuales a Slides**: cuántas ocurren por ítem y cuántos segundos suman.
   ⚠ Y confirmar el costo real de la salida: `batchUpdate` exige declarar el servicio avanzado en
   `appsscript.json` y **re-autorizar**. Reportarlo como lo que es —un costo operativo para el
   usuario— antes de proponerlo.

---

## Parte A — atacar, en orden de gasto y nada más

> **Modelo: Opus · effort alto.** Toca el camino de lectura de datos, de donde salen los números.

**Se ataca lo que la Parte 0 midió, empezando por lo más caro. Cada cambio lleva escrito su motivo
y qué se descartó.**

**La condición que define qué entra:** ⭐ **ninguna optimización puede cambiar el conjunto de filas
que un marcador ve.** Cachear una lectura que ya se hacía no lo cambia. Ampliar una ventana para
que la clave pegue **sí lo cambia**, y queda afuera aunque sea más rápido.

⚠ **La trampa específica de este caso, escrita para que no se caiga en ella:** si el problema es
que cada reunión arma su ventana de un día, **la salida NO es usar una ventana común** —eso cambia
qué filas ve el matcher—. La salida es **leer la base una vez y recortar en memoria**, o cachear por
base sin la ventana en la clave y filtrar después. **El recorte por ventana tiene que seguir dando
exactamente las mismas filas.**

⛔ **`batchUpdate` no entra en este prompt.** Cambia `appsscript.json` y obliga a re-autorizar, y
esa decisión es del usuario. Si la Parte 0 muestra que ahí está el gasto principal, **se reporta con
el número al lado** y se decide aparte.

---

## Parte B — el testigo, con los dos números

> **Modelo: Sonnet · effort alto.**

⭐ **Valores idénticos Y segundos distintos.** Es la regla del 19/08 aplicada acá: un testigo que
sólo compara valores daría verde si no se optimizó nada.

1. **Los valores publicados idénticos** antes y después, misma ventana, misma sesión, minutos entre
   tomas. ⚠ **Sobre los ocho encuentros anclados**, que son los que pasan por el camino tocado —
   un testigo de tokens fijos no mide esta parte.
2. **El desglose por etapa antes y después**, leído del rastro que ahora sobrevive al cierre.
   **Si los segundos de la pasada por ítem no bajaron, no se optimizó nada** por más verde que dé
   el punto 1.
3. **El anclaje da los mismos ocho encuentros a las mismas ocho cuentas, con los mismos scores.**
   Es el control que atrapa una optimización que cambió qué filas ve el matcher.

---

## Parte C — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/PENDIENTES_consistencia.md`** — el desglose de la corrida `171421` como línea de base, y
   el desglose después, para poder comparar la próxima.
2. **`docs/PLAN.md`** — si el costo baja lo suficiente, **el `2026-08-20_10` deja de ser urgente y
   pasa a ser lo que siempre fue: el mecanismo para que el viernes corra sin nadie.** Escribirlo.
3. **`CLAUDE.md` §4** — la regla, si la hipótesis del punto 1 se confirma: *una clave de caché que
   incluye un parámetro que varía por ítem no cachea nada, y el síntoma es un costo por ítem que
   parece trabajo real*.
4. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No toca `appsscript.json` ni pide re-autorizar.
- ⛔ No cambia ninguna ventana, ningún filtro, ninguna dimensión.
- ⛔ No cablea ni migra ningún marcador.
- ⛔ No implementa nada del `2026-08-20_10`.
