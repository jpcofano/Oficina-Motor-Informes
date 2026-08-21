# 2026-08-21_1 — El techo no cortó: se llegó al límite duro de Apps Script

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Objetivo único:** que ninguna corrida llegue al muro de los seis minutos. El techo de 350 s
> existe para cortar antes **con dignidad**; si se llega al límite duro, no hay barrida, no hay
> reporte y no hay plan.
>
> ⛔ **Bloquea todo.** Una corrida que muere en el muro no deja evidencia de por qué.

---

## Lo observado — 21/08/2026, mañana

**"Se ha superado el tiempo máximo de ejecución", dos veces**, generando `jm` desde el panel con
el temario del 21/08 cargado.

**El techo declarado es 350 s y el muro está en 360.** Que se haya llegado al muro significa que
**hay tramos donde el presupuesto no se consulta**, o que el reloj arranca después del gasto real.

⚠ **Y apareció dos veces: fueron dos ejecuciones.** Cada una vuelve a pagar el arranque entero
—70-80 s de anclaje y unión— y **el caché del `_11` muere con la ejecución**, así que la segunda no
heredó nada de la primera.

**El contexto que cambió respecto de la última corrida que sí terminó (`171421`, 307 s):** el
temario del 21/08 trae **dos campañas nuevas** y los encuentros de esta semana. Más asignaciones
sobre el mismo techo.

---

## Parte 0 — medir. Sólo lectura. **Reportar y seguir.**

> **Modelo: Sonnet · effort alto.**

1. ⭐ **Dónde se consulta el reloj del presupuesto**, sitio por sitio. **La hipótesis a confirmar o
   matar: sólo se consulta entre asignaciones.** Si es así, el arranque, el mapa de tokens, la
   pasada de tokens fijos y el cierre **corren sin punto de control** y ninguno puede cortar.
2. **Cuándo arranca el cronómetro** respecto del inicio real de la ejecución. Si arranca después de
   abrir bases o de copiar la plantilla, **el presupuesto mide menos de lo que la ejecución
   gasta**, y el techo de 350 no es 350.
3. ⭐ **Cuántas veces se llaman `anclarEncuentros` y `unirDigitalPorCuenta` por corrida.** Con tres
   secciones repetibles y `itemsDeSeccion_` llamándose por sección, **hay que confirmar que el
   caché pega en las tres** y no que se recalcula. Reportar el número, no la intención del caché.
4. **Qué fueron las dos ejecuciones**: si el panel reintentó, si fueron dos clics, o si algo encadenó
   una segunda. **Si el panel reintenta solo al fallar, cada fallo cuesta seis minutos más** y eso
   hay que decirlo.
5. **El costo del arranque en esta corrida**, comparado con los 70-80 s medidos ayer. Con dos
   campañas nuevas, `unirDigitalPorCuenta` tiene más cuentas que cruzar.
6. **Qué queda cuando se llega al muro**: si `CORRIDAS` queda abierta, si el deck queda con sello,
   si hay trigger huérfano. **Es lo que hay que limpiar a mano hoy**, y conviene saberlo antes que
   descubrirlo.

---

## Parte A — el reloj se consulta en todas las etapas

> **Modelo: Opus · effort alto.**

1. ⭐ **Un punto de control del reloj entre cada etapa**, no sólo entre asignaciones. Antes del
   mapa, antes de los tokens fijos, antes del cierre. **Cada punto puede cortar y dejar la corrida
   en un estado declarado.**
2. ⭐ **Dentro de la etapa de arranque también.** Es la más cara y hoy es indivisible: si el
   anclaje ya consumió el presupuesto, **la corrida tiene que abortar ahí** y decir *"el arranque
   no entra en el techo"*, que es un diagnóstico, en vez de morir en el muro sin decir nada.
3. **El cronómetro arranca en la primera línea de la ejecución.** Si hoy arranca después, es la
   causa directa y el arreglo es mover una línea.
4. ⚠ **La reserva tiene que cubrir el cierre completo**: barrida, escritura de `FALTANTES`,
   `CORRIDAS`, sello. Si la reserva de 30 s no alcanza para eso, **el corte ordenado igual muere en
   el muro** y toda la maquinaria de corte no sirve. **Medir el costo del cierre y dimensionar la
   reserva con ese número**, no con uno elegido.

⛔ **No se sube el techo.** El muro está en 360 y no se mueve.

---

## Parte B — el control

> **Modelo: Sonnet · effort alto.**

1. **Con presupuesto ya agotado al entrar a una etapa, esa etapa no arranca** y la corrida sale
   declarada. Una afirmación por etapa.
2. ⭐ **Con el arranque más caro que el techo, la corrida aborta con el diagnóstico correcto** —
   *"el arranque no entra"*— y no con un corte genérico. Son dos arreglos distintos y el reporte
   tiene que distinguirlos.
3. **La reserva alcanza para el cierre**, con el costo medido en la Parte 0.
4. ⚠ **Romper a propósito:** quitar el punto de control de una etapa y verificar que caiga su
   afirmación. Si no cae, el control no mide lo que dice.

---

## Parte C — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/PENDIENTES_consistencia.md`** — la corrida del 21/08 con lo medido, y **qué quedó sucio
   al morir en el muro**.
2. **`CLAUDE.md` §4** — la regla: *un presupuesto que sólo se consulta en el bucle no protege las
   etapas que están fuera del bucle, y el síntoma es llegar al límite duro con techo declarado*.
3. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No sube el techo ni toca la reserva sin medirla.
- ⛔ No optimiza nada: si el arranque es caro, se declara, no se arregla acá.
- ⛔ No toca el mecanismo desatendido.
