# `_38` · Por qué la lámina de encuentro sale casi vacía

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Sólo lectura. Termina en reportar y parar. No cablea, no corre una generación, no toca la
> plantilla.**
>
> **Lo observado**, en la lámina de San Cristóbal del deck `jm-20260812-110746`: lo que sale de
> `rdv` está bien —138 inscriptos, 9 asistentes, Mail 1, Digital 137, Habitantes 48.611—, y **todo
> lo que viene del enlace digital sale `—`**: los ocho de *Impacto* y los ocho de *Alcances
> objetivo*. Impresiones, audiencia, aperturas, clics, el embudo de IVR y el de Call Center,
> completos en blanco.
>
> **La pregunta es cuál de tres cosas es, y son excluyentes:** que el encuentro no tenga cuenta
> digital enlazada · que la tenga pero sin filas · que tenga filas y **la ventana las deje afuera**.
> Las tres se ven igual en el deck y se arreglan distinto.

---

## Parte A · El censo del enlace, ítem por ítem

**Modelo: Sonnet, effort alto.**

Para **los seis ítems** de la corrida de julio, no sólo San Cristóbal — la comparación entre los que
traen datos y los que no es la mitad del diagnóstico:

**A.1 — qué se ancló.** Por ítem: clave, `id_cuenta` elegida, puntaje del anclaje, y si cayó en
`encuentros`, `sinLink` o `bajaConfianza`. Un `sinLink` explica la lámina vacía por sí solo y no hay
que buscar más lejos.

**A.2 — cuántas filas tiene esa cuenta, por solapa.** Para cada `id_cuenta` anclada, el conteo de
filas en `Digital`, `Directa Mail`, `Directa SMS`, `Directa IVR` y `Alcance` — **dos veces**:

- **dentro de la ventana 24–30/07**, como lo hace la corrida;
- **sin ventana**, todas las filas de esa cuenta.

**Esa comparación es la que decide.** Si sin ventana hay filas y con ventana no, el problema es el
recorte y no el dato. Si no hay filas en ninguno de los dos, el problema es el dato y no el motor.

**A.3 — las fechas.** Para las cuentas que tengan filas fuera de la ventana, **qué fechas traen**.
San Cristóbal es del 23/07 y cae fuera de la ventana del informe por decisión (`R-17`: el temario
selecciona). Si su campaña digital también arranca antes del 24/07, la lámina está vacía **por
construcción**, no por un fallo — y eso es el mismo patrón de recorte por punto que ya se midió en
`resumen_metricas_dinamico` y quedó registrado.

**A.4 — el contraste.** Cuál de los seis ítems **sí** trae datos de impacto, y en qué se diferencia
de los que no. Si ninguno los trae, decirlo: cambia el diagnóstico de "un encuentro sin campaña" a
"el enlace no está funcionando para nadie".

**Reportar y parar.** Una tabla por ítem y **una línea al final que diga cuál de las tres causas es
cada caso.** Sin proponer arreglos: la decisión vuelve con esos números.

---

## Lo que no se hace acá

No se ensancha ninguna ventana, no se baja ningún umbral, no se re-ancla nada a mano y no se cablea
ningún token. Si algo aparece al costado, se anota en el reporte.

**Los tres decks vigentes no se tocan.** Son archivos y siguen siendo los de la demo hasta que haya
uno mejor.
