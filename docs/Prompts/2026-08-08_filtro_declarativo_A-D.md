# El filtro declarativo — Partes A a D. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-08 · **Ubicación:** `docs/Prompts/2026-08-08_filtro_declarativo_A-D.md`

> **Formato nuevo, decidido por el usuario el 07/08: un prompt, un objetivo.** Las tres corridas
> anteriores produjeron dieciocho commits y **un solo cambio de código**. La causa fue de
> dimensionamiento: prompts de cinco puntos que mezclaban documentación barata con código caro, con
> la documentación primero. La documentación salía siempre; el código, nunca.
>
> **Acá no hay puntos 2, 3 ni 4.** El objetivo es que `MARCADORES.filtro` y `SECCIONES.filtro`
> funcionen y que el corte JM/GCBA quede cableado. Nada más entra, por barato que parezca.
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit, la necesaria para
> que otro pueda seguir. **La documentación completa se escribe al final**, cuando el código
> funcione — no antes, y no intercalada. Si el código no llega, la documentación completa tampoco:
> se documenta lo que se hizo, no lo que se planeaba.

---

## El objetivo

`docs/Prompts/2026-08-04_Pedido-3_filtro_declarativo.md`, **Partes A, B, C y D**. Su **Parte 0 ya
corrió** el 06/08 y **no se repite**. Las Partes **E, F y G no entran en este prompt** — quedan para
el siguiente.

Correr las cuatro partes tal como están escritas, con las correcciones que dejó la propia Parte 0 y
que van abajo.

---

## Las tres correcciones que manda la Parte 0

Están medidas y verificadas; mandan sobre lo que diga el texto del prompt original.

1. **`SECCIONES.filtro` está declarada y muerta.** La usa una sola fila —`comunicaciones_post` con
   `etapa=post`— y **ningún código la lee**: el único lugar del repo que la menciona es el sembrador
   que la escribe. El prompt original está escrito como si funcionara. **La Parte D es implementarla
   desde cero, no extenderla.** Presupuestar en consecuencia: es la parte más cara de las cuatro, no
   la más barata.
2. **`MARCADORES` no tiene columna `filtro`.** Confirmado. La Parte A la crea, y va por
   `COLUMNAS_DELTA_` **antes** que por `headers`.
3. **El corte de la Parte C existe y clasifica bien.** `dig_jm_gcba` es `digital/Digital` columna
   **B**, encabezado `JM | GCBA | POLICIA`. Valores medidos: `GCBA` 739 · `JM` 205 · `POLICIA` 16,
   con **334 filas sin valor** sobre **877 cuentas**, y **29 cuentas con dos valores distintos**.
   Esos dos números son parte del resultado, no ruido: decir en el reporte **cómo los trata el
   filtro** — qué pasa con una fila sin valor y qué pasa con una cuenta que aparece con dos.

---

## Cómo se trabaja

**No se pide permiso.** Donde el prompt original diga "reportar y PARAR", se reporta en la bitácora
y **se sigue**, salvo los límites del final.

**Un commit por parte que funciona**, con `git push`. Si una parte se rompe, se arregla en el commit
siguiente; no se revierte el trabajo.

**Si una parte se traba, se salta y se sigue con la que viene.** El orden natural es A → B → C → D,
pero **D no depende de C**: si el cableado del corte se complica, D se puede hacer igual. La única
dependencia dura es que **B necesita A**.

**Diff antes y después en todo cambio de configuración**, con `protegidas (con diferencia): 0` como
referencia.

**Verificar antes de aplicar una premisa del prompt, incluso las de arriba.** El 07/08 este prompt
pidió corregir `TOKENS.md` sobre una premisa falsa y Code lo frenó verificando primero — eso estuvo
bien y es lo que se espera. Una premisa vencida se reporta y se sigue por otro lado.

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.**
2. **No se edita ninguna plantilla `.pptx`.** La autorización del 07/08 era para cinco tokens de la
   lámina 18 y **murió con el punto**: las celdas estaban combinadas y agregarlas exigía descombinar,
   que es estructural. **No se descombina nada.**
3. **No se agrega `seccion_id` a `MARCADORES`.** Sigue pospuesto. La columna que se agrega acá es
   `filtro`, que es otra cosa.
4. **No se toca ninguno de los 7 tokens `ecv_` ambiguos.**
5. **No se cablean los tres remitentes sueltos ni `camp_bench_*`.** Diferidos el 07/08.
6. **No se toca `m2_`.** Tiene un `P1` abierto y bloqueante —dos generaciones de nombres en la lámina
   M2 y la caja `{{m2_salud_camp}}` huérfana— que decide el usuario. **No es autocontenido**, contra
   lo que dijeron los dos prompts anteriores.
7. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.**
8. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git** ni se borra
   nada curado por una persona.

Y lo específico del prompt original, que sigue vigente: **no usar `≠`, la sintaxis es `!=`**; **no
mover el filtro dentro de `leerFuente`**; **no escribir un normalizador nuevo**.

---

## Cuándo está hecho

El objetivo se cumplió si, al final:

- **`MARCADORES.filtro` existe y el despachador la aplica.** Un marcador con filtro devuelve menos
  que el mismo marcador sin filtro, y la diferencia es explicable.
- **`SECCIONES.filtro` está implementada** y `comunicaciones_post` —la única fila que la usa— hace
  algo distinto de lo que hacía cuando la columna era decorativa.
- **El corte JM/GCBA está cableado** y hay al menos un token que devuelve el número de JM y no el
  total.
- **Se generó un informe** y se sabe cuántos tokens tienen valor y cuántos faltan, contra la base de
  18 con valor / 304 faltantes de la corrida `jm-20260805-005053`.

Si tres de los cuatro se cumplen, la corrida fue buena. Si ninguno, el reporte tiene que decir en cuál
se trabó y qué haría falta.

---

## El reporte

Corto:

1. **Las cuatro partes: cuáles corrieron y cuáles no.**
2. **Los cuatro criterios de "cuándo está hecho": cuáles se cumplen.**
3. **Cómo trata el filtro las 334 filas sin valor y las 29 cuentas con dos valores.**
4. **Tokens con valor y faltantes**, con la hora, como medición y no como referencia.
5. **Qué decisiones tomaste solo y por qué.**
6. **Qué premisa de este prompt resultó falsa**, si alguna.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después del reporte, la documentación completa**: bitácora, `HANDOFF_CODE.md` reescrito, y
`PLAN.md` si algo cambió estructuralmente. Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
