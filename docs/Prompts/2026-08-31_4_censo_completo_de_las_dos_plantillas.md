# `2026-08-31_4` — El inventario completo de las dos plantillas, para poder planear `secco`

**Subagente:** ninguno.
**Destino:** `docs/Prompts/`.
**Estado:** no ejecutado.

> ⚠ **Renumerado de `_3` a `_4` al copiarlo (31/08/2026).** El `2026-08-31_3` ya existe y **ya se
> ejecutó** —la sección de campaña destacada duplicada, `D-53`, commits `b4a8dce` / `2271b34` /
> `a04f3d5`—, y **lo ejecutado no se renumera** porque los commits lo nombran. Es la colisión que
> `CLAUDE.md` §3 previene: el `N` es un orden **dentro del día**, y se mira la carpeta filtrando por
> la fecha de hoy, no el último número que uno recuerda.

---

## Por qué, y por qué ahora

El plan para rehacer `secco` se apoya entero en **un cruce del 20/08/2026** —49 tokens de `secco`
con fila `jm` ya escrita, 56 compartidos sin fila, 62 sólo de `secco`, 203 sólo de `jm`—. Hoy hay
dos motivos para no planear sobre esos números:

1. **El usuario acaba de actualizar las láminas que estaban distintas entre las dos plantillas.**
   El cruce anterior mide un estado que ya no existe.
2. ⚠ **Ese mismo cruce trae su propia advertencia:** entre las 12:06 y las 13:02 del 20/08, las
   láminas 19 y 20 de `jm` pasaron de 9 y 14 tokens a **31 y 50** — *la plantilla se movió mientras
   se la medía*. **Diez días después, es una foto vieja de un objeto que se mueve.**

⛔ **Y hay un problema de instrumento, que es el motivo real de este prompt.** `censarTokensSinMarcador_`
imprime por lámina *«N de M sin fila»* y **lista solamente los N**. El `M` sale en el total y **los
tokens que sí tienen fila nunca se nombran**. Para un cruce entre dos plantillas hace falta el
**inventario completo**: qué token está en qué lámina de cada una.

⭐ **Ya costó una pregunta sin respuesta:** el 28/08, `L-032` pasó de 19 a 23 tokens y **el cuarto
token nuevo no se pudo identificar** — tenía fila, y el censo sólo nombra los que no la tienen.

---

## Parte 0 — sólo lectura: qué mide hoy el censo y qué no

**Modelo: Sonnet. Effort: alto.** ⛔ **No editar. Reportar y parar.**

1. **Qué imprime exactamente** `censarTokensSinMarcador_`, por lámina y en el resumen, y **qué
   queda afuera**. Confirmar o desmentir la afirmación de arriba: que los tokens *con* fila se
   cuentan y no se nombran.
2. **Cómo decide «tiene fila»**. Medición previa a confirmar: indexa `conFila[m.marcador] =
   m.informe_id` — **por nombre de marcador, sin mirar el informe**. ⭐ Si es así, para `secco`
   *«tiene fila»* significa **«existe una fila, casi siempre de `jm`»**, y eso es exactamente lo
   que el cruce necesita saber — pero **el reporte no lo distingue**, y hay que decirlo.
   ⚠ **Contexto que lo vuelve crítico:** al 26/08 las **210 filas de `MARCADORES` dicen `jm`**.
   Cero `*`, cero `secco`. Verificar ese conteo contra el registro de hoy antes de citarlo.
3. **Las tres trampas que el propio censo ya declara**, y qué hace con cada una: láminas **sin
   ancla** —que no se resuelven por posición, porque `orden_plantilla` es reportado y nunca
   autoritativo—, láminas que **iteran** —cuyos tokens pueden venir del ítem y **no** están
   rotos—, y la advertencia de que *«sin fila» no es «publica FALTA»*.
4. **Si ya existe otra función** que dé el inventario completo. `censarTokensEnPlantilla` recibe una
   lista de tokens, así que **contesta sobre los que se le nombran, no sobre los que hay** — pero
   verificarlo, no asumirlo.

**Reportar y parar.**

---

## Parte A — el volcado, si la Parte 0 confirma que falta

**Modelo: Sonnet.** Instrumento de sólo lectura.

Una función **pública, sin argumentos y sin `_`** que produzca, para **las dos plantillas**, una
tabla con una fila por **(token, lámina)**:

`informe · lamina_id · orden_plantilla · token · tiene_fila · informe_id_de_la_fila · lamina_itera`

⛔ **Sólo lectura, sobre las plantillas vivas.** No toca `MARCADORES` ni ninguna otra hoja.

⚠ **Dos cosas de forma que deciden si el resultado sirve:**

- **`Logger.log` trunca**, y esto son miles de filas. Que la salida se pueda **llevar entera** —a
  una hoja nueva de trabajo, o en bloques numerados que se peguen sin perder ninguno—. Un volcado
  cortado por la mitad **parece completo**.
- **`lamina_id` es la identidad, `orden_plantilla` no.** Va en la tabla como dato reportado, y el
  cruce **no se hace por posición**: ya está medido que `L-052` y `L-035` declaran las dos el orden
  6. ⚠ Y las láminas **sin ancla** van con su marca, **no descartadas ni resueltas por número**.

⛔ **Lo que este prompt NO hace, y conviene que quede escrito porque es la tentación obvia:** no
propone armonizar, no marca ningún marcador como `*`, no decide si `secco` sube a la granularidad de
`jm`. **Eso último toca las plantillas, que son del equipo (`C-01`), y es una decisión del usuario.**
Acá sólo se produce la foto contra la que esa decisión se va a tomar.

Commit propio, `docs/BITACORA.md` en una línea. Después de pushear, **parar**: la corre el usuario.

---

## Lo que viene después, para que el volcado se diseñe sabiendo para qué es

El cruce se va a usar para responder, en este orden:

1. **Qué tokens comparten las dos plantillas hoy**, después de la actualización del usuario.
2. **Cuáles de ésos tienen una sola fila `jm`** — o sea, los candidatos a `informe_id = '*'`. ⛔ Esa
   migración es **prerrequisito duro**: hoy no hay ni una fila compartida, y sin ella *«los mismos
   marcadores para los dos informes»* no se puede expresar.
3. **Qué queda sólo en `secco`** — `emin_*` (ministros) es el bloque grande, y va con **prompt
   propio**: `R-20` es código, no configuración.
4. **Dónde la diferencia es de granularidad y no de tokens.** ⚠ Al 20/08, la lámina de
   comunicaciones post tenía en `jm` **4 campañas ×8 campos** y en `secco` **3 × 2**, con la misma
   tabla de siete columnas. **Si eso sigue así, no se resuelve compartiendo marcadores.**
