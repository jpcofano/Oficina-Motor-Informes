# 2026-08-20_9 — La corrida no llega: el corte por presupuesto y el símbolo que lo esconde

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que una corrida de `jm` termine dentro del techo, y que si no termina **el
> deck lo diga**.
>
> ⛔ **No se cablea ni un token en este prompt.** Mientras la corrida se corte, ningún deck es
> evidencia de nada.

---

## La corrida del 20/08 a las 15:45, medida sobre el `.pptx`

```
corte        el próximo ítem se estimó en 27 s y quedaban 7 s sobre la reserva
presupuesto  techo 350 s · reserva 30 s · gastado 321 s
barrida      264 tokens · origen: mapa de la etapa 2
```

| en el deck | cuántos |
|---|---|
| `/////` | **269** |
| `---` | 0 |
| `-` | 12 |
| entre guiones | 3 |
| números limpios | 9 |
| `{{token}}` crudos, sin tocar | **49** — láminas 12, 21 y 29, las escondidas |

⭐ **264 de los 269 `/////` son del corte.** El símbolo afirma *nadie lo cableó* cuando lo cierto es
*la corrida no llegó hasta acá*. **Es un número plausible y equivocado en versión símbolo**, y entra
por la puerta que abrió el `2026-08-20_1`.

---

## Parte 0 — medir dónde se va el tiempo. Sólo lectura. **Reportar y seguir.**

> **Modelo: Sonnet · effort alto.**

⭐ **La pregunta que ordena todo: ¿son muchos ítems baratos o pocos carísimos?** 321 s para 22
valores impresos es ~15 s por valor, y eso no es normal — el trabajo no está donde se cree.

1. **Qué mide el presupuesto hoy**: dónde está el techo, la reserva, y **qué se contabiliza como
   "el costo del ítem anterior"**. El corte estimó 27 s para el próximo ítem: reportar de dónde
   sale esa estimación.
2. ⭐ **El desglose del gasto por etapa**, con lo que ya se loguee o con lo mínimo para saberlo:
   `anclarEncuentros` · `unirDigitalPorCuenta` · `leerFuente` por base · `resolverMarcadores` · la
   escritura en Slides. **Sin este desglose cualquier optimización es adivinada.**
3. **Cuántas llamadas a la planilla de control se hacen por ítem.** `buscarMapeo` no cachea y relee
   `SOLAPAS` y `MAPEO` enteras con `getDataRange()`: ya se pagó una vez —la corrida nocturna del
   04/08 midió ~13.000 lecturas y `unirDigitalPorCuenta` no volvía—. **Reportar si el mismo patrón
   reapareció** en los caminos nuevos: los `camp_*`, la rama por cuenta, el anclaje en dos pasos.
4. **Cuántas escrituras a Slides** y si van de a una o en lote. `replaceAllText` por token sobre
   ~340 tokens × 32 láminas es un candidato obvio y hay que confirmarlo, no suponerlo.
5. **Los 49 `{{token}}` crudos de las láminas escondidas**: reportar **por qué la barrida no los
   alcanzó**. Que estén escondidas es la hipótesis; medirla.
6. **Qué sabe la barrida sobre el corte** cuando la llaman: si recibe o puede recibir la señal de
   que la corrida se interrumpió, y qué tokens del mapa **sí** se habían resuelto antes del corte.

---

## Parte A — el corte deja de esconderse

> **Modelo: Opus · effort alto.** Cambia qué afirma el deck sobre sí mismo.

**Un token que no se resolvió porque la corrida se cortó NO es `/////`.** Los dos casos se ven
igual en el papel y son trabajos opuestos: `/////` manda a cablear, el corte manda a correr de
nuevo.

**Tres cosas, y la tercera es la que salva la próxima corrida:**

1. **Un símbolo propio para el corte**, distinto de los cuatro. El usuario elige el glifo; el
   prompt no lo inventa — **si no está elegido cuando esto corra, se usa `/////` y se reporta la
   decisión pendiente**, en vez de inventar uno que después haya que cambiar en la plantilla.
2. ⭐ **El reporte de corrida dice, en su primera línea, que hubo corte y cuántos tokens quedaron
   sin resolver por eso.** Hoy el corte aparece en un bloque lateral del panel y el deck no lo
   menciona: **un deck cortado es indistinguible de uno completo mirando el deck**.
3. ⭐ **El previsor se cruza con lo que salió.** `preverSimbolosJM()` declara un piso; esta corrida
   dio muchísimo menos. **Que el reporte compare previsto contra obtenido y avise cuando la
   diferencia es grande** convierte al previsor en un control real en vez de un cartel.

⛔ **No se sube el techo como arreglo.** Apps Script corta a los 6 minutos y el techo existe para
cortar antes con dignidad. Subirlo mueve el problema al límite duro, donde no hay barrida ni
reporte.

---

## Parte B — que la corrida entre

> **Modelo: Opus · effort alto.** Elige entre caminos con costos distintos.

**Se ataca lo que la Parte 0 midió, en orden de gasto, y nada más.** Escribir el motivo de cada
elección.

**Los tres candidatos conocidos, para que la Parte 0 los descarte o los confirme:**

- **Lecturas repetidas de la planilla de control** — el patrón ya medido el 04/08. Cachear
  `buscarMapeo` por corrida es barato y no cambia ningún resultado.
- **Escrituras a Slides de a una** — juntarlas por lámina cambia el tiempo y no el contenido.
- **Anclaje recalculado** — `anclarEncuentros` ya cachea por ventana; verificar que el caché
  efectivamente pegue con la clave que se está usando, y no que se recalcule por ítem.

⭐ **Ninguna de las tres cambia un número publicado**, y ésa es la condición para que entren juntas.
**Cualquier optimización que pueda mover un valor va en un prompt propio**, con su testigo.

**El control:** los valores publicados **idénticos** antes y después, sobre la misma ventana y en la
misma sesión. ⚠ Y como esta vez el testigo sí mide algo —el tiempo— va **con los dos números**:
valores iguales **y** segundos distintos. Si los segundos no bajaron, no se optimizó nada por más
verde que dé.

---

## Parte C — verificar

> **Modelo: Sonnet · effort medio.**

1. Una corrida completa de `jm` **sin corte**, con el gasto reportado. **La corre el usuario.**
2. El cruce previsto/obtenido de la Parte A, punto 3.
3. `node tools/listas.js` · sintaxis validada · snapshots versionados.
4. ⚠ **No se declara éxito con una corrida que volvió a cortarse**: si vuelve a cortar, se reporta
   el desglose nuevo y se para. Optimizar a ciegas dos veces cuesta más que medir una.

---

## Parte D — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/PENDIENTES_consistencia.md`** — la corrida del 20/08 con sus seis números, como línea de
   base contra la cual comparar la próxima.
2. **`docs/PLAN.md`** — el corte como bloqueo, por encima del cableado: **mientras la corrida se
   corte, ningún deck es evidencia**.
3. **`CLAUDE.md` §4** — la regla nueva: *un símbolo que no distingue "no se cableó" de "no se
   llegó" convierte un problema de tiempo en un diagnóstico de cableado*. Es la variante de la
   familia que el repo ya persigue, en la capa de presentación.
4. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No cablea ningún token.
- ⛔ No sube el techo de tiempo.
- ⛔ No toca el anclaje ni el score: eso quedó propuesto y sin aplicar en el `_8`, y sigue así.
- ⛔ No aplica ninguna optimización que pueda mover un valor publicado.
