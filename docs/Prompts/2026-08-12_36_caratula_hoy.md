# `_36` · La carátula, hoy

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Por qué se reabre:** la carátula se postergó por una proyección de ~297 s contra un techo
> efectivo de 320. Esa proyección **no tenía respaldo** y quedó escrito en la bitácora: la corrida
> real dio **146 s** y `seg_expansion` **36 s**. Con ese margen, duplicar las láminas expandidas de
> `encuentro` entra sin discusión. El motivo por el que se postergó dejó de existir.
>
> **El código ya está** —`22dc454`, la Parte B con control verde—. Lo que falta es la plantilla.
>
> **La red es `jm-20260812-110746`.** Nada de esto puede empeorarlo.

---

## Antes de empezar — lo que hace el usuario en la plantilla

La lámina nueva ya está sellada (`L-052`). Falta que quede en condiciones de ser bloque:

1. **Pegada, inmediatamente antes de la lámina de detalle.** Sin nada en el medio. Es el único
   requisito duro: con el bloque no contiguo la sección no expande y lo reporta.
2. **`{{enc_evento}}` en la carátula**, y **sacarlo de la caja compartida de la lámina de detalle**.
   Hoy conviven con `ecv_barrio` en una sola caja —*Estrategia de comunicación:{{ecv_barrio}} /
   {{enc_evento}}*—; `ecv_barrio` se queda en el detalle.
3. **Nada más en la carátula.** Si se armó duplicando la de detalle, hay 31 tokens que borrar. Cada
   uno que quede va a publicar en la carátula el mismo número que la lámina que le sigue.

---

## Parte A · Premisas — sólo lectura, reportar y parar

**Modelo: Sonnet, effort alto.**

**A.1** — Qué láminas reclama hoy `slidesModeloDe_` para `encuentro`. Tienen que ser **dos, y
consecutivas**. Reportar los números y si son contiguas.

**A.2** — Los tokens de la carátula, uno por uno. **Se espera `enc_evento` y nada más.** Si hay
otros, listarlos y **parar**: cada uno publicaría en la carátula el valor de la lámina siguiente.

**A.3** — Los tokens de la lámina de detalle: confirmar que `enc_evento` ya no está y que
`ecv_barrio` sí.

**Reportar y parar.** Si A.1 no da dos contiguas o A.2 encuentra tokens de más, **no se corre la
Parte B**: se reporta qué falta y lo arregla el usuario en la plantilla.

---

## Parte B · Correr y leer

**Modelo: Sonnet.**

Una corrida de julio desde el Panel, casilla de `—` tildada, **`comunicaciones_post` afuera** por
`D-27` — sigue valiendo, sus dos láminas resuelven cero tokens.

Del deck, leído del deck:

- **El orden: seis pares carátula+detalle, no seis y seis.** Ése es el control de la parte.
- Cada carátula con el `enc_evento` de la lámina que le sigue.
- Cada detalle con su `ecv_barrio`, inscriptos y población.
- `seg_expansion` de `encuentro` contra los 36 s de `jm-20260812-110746`. **Es la tercera lectura
  con la misma plantilla y la primera con dos láminas modelo**: sumala a la tabla de la bitácora,
  que es lo que va a permitir decidir el próximo techo con números en vez de deducciones.

**Una sola corrida.** Si cruza el corte o sale peor que `jm-20260812-110746`, ése sigue siendo el
deck que se muestra y se dice en una línea.
