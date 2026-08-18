# TESTIGO — tanda 4, `frecuencia` / `gcba_frecuencia` · **las tres tomas**

> **Evidencia congelada.** Cierra la tanda 4 y **con ella la migración de `D-33` sobre todo lo
> migrable: 42 de 48**.
>
> ⚠ **El testigo pre-migración NO se tomó para esta tanda: se reconstruyó de corridas anteriores.**
> Las del **16/08 22:20** y **17/08 11:58** registran los dos marcadores con `dimensiones: (vacío)`
> explícito, así que sirven — pero conviene saber que **el orden previsto no se cumplió** y por qué:
> la migración ya estaba aplicada cuando se fue a correr la Parte A.

## Las tres tomas

| toma | cuándo | estado de `dimensiones` |
|---|---|---|
| **pre** | **16/08 22:20** | vacío en los dos |
| **pre** | **17/08 11:58** | vacío en los dos |
| **post** | **17/08 22:21** | `ambito=jm` / `ambito=gcba` |

## Los controles, en el orden invertido que esta tanda declaró

| # | control | resultado |
|---|---|---|
| **1** | **la partición** | **`4 + 22 = 26` en las tres tomas** ✔ |
| 2 | las cuentas de filas | `4/26` y `22/26`, **idénticas** |
| 3 | los valores | ⬇ **el numerador se movió, y eso NO acusa a la migración** |

### ⭐ El control 3 hizo exactamente lo que se lo escribió para hacer

| operando | `frecuencia` | `gcba_frecuencia` |
|---|---|---|
| **denominador** | **475.723** | **1.249.387** |
| | **idéntico en las tres tomas** | **idéntico en las tres tomas** |
| **numerador** | 6.399.346 → 6.282.424 → **6.763.034** | *(no registrado por toma)* |

**Denominador quieto y numerador moviéndose es `looker` acumulando impresiones, no la dimensión
leyendo otras filas.** Si el corte se hubiera traducido mal, **el alcance habría cambiado también**
— es la misma lectura, sobre las mismas filas, en la misma corrida.

⚠ **Este control existió recién el 17/08 a la noche**, después de arreglar `operandosDeRatio_`
—que nunca había matcheado la traza real—, y **en su primera lectura útil resolvió la pregunta que
la tanda tenía abierta desde que se escribió**: cómo distinguir *"se movió `looker`"* de *"la
dimensión lee otras filas"* en la única base que se mueve dentro de ventanas cerradas.

⚠ **Lo que este archivo NO tiene:** los numeradores de `gcba_frecuencia` toma por toma. Se dice
acá para que nadie los cite como si estuvieran. Lo que sí está medido es que **su denominador no
se movió**, que es la mitad que sostiene la conclusión.

## Por qué el criterio de cierre no es la igualdad de valores

**Es la única de las cuatro tandas donde no podía serlo, y estaba anticipado.** `looker` se mueve
**dentro** de ventanas cerradas —+138.427 impresiones en 1h45 el 15/08, un numerador en cero
durante un recálculo— mientras `digital` crecía **fuera**. El prompt lo dejó escrito antes de
correr, justamente para que un valor distinto no se leyera como falla:

> *"la igualdad exacta puede NO darse aunque la migración esté bien"*

**El control principal fue la partición**, y cerró en las tres tomas. **Los valores fueron el dato
más débil, y se leyeron últimos.**

## El hueco de trazabilidad — **no se sabe en qué corrida se aplicó**

**Entre las 11:58 y las 19:08 del 17/08.** A las 19:10 el escritor ya reportó los cuatro campos
como `YA ESTABA`, así que la escritura ocurrió en esa ventana de siete horas y **ninguna corrida
la reclama**.

- **`CORRIDAS` no lo puede responder, y no es una falla suya:** registra **generaciones de
  informe** —`corrida_id`, `informe_id`, `periodo_id`, `deck_id`, `fecha_generacion`,
  `tokens_reemplazados`, `faltantes`, `mapa_tokens`— y es un **insumo, no un log** (`D-07`).
  **Ninguna hoja de registro fecha una escritura sobre `MARCADORES`.**
- **Lo único que acota la ventana son los snapshots**, y alcanzan para el día pero no para la
  hora: `MARCADORES_2026-08-17.tsv` tiene **40** marcadores con `dimensiones`,
  `MARCADORES_2026-08-18.tsv` tiene **42**. Las dos fotos enmarcan la migración; **la corrida que
  la hizo no está en ningún lado**.
- **Es menor acá porque los controles cerraron igual**, y se anota igual: un cambio en una hoja de
  registro sin corrida que lo reclame es justamente el caso en que hace falta poder decir cuándo
  pasó. Queda en `PENDIENTES`.

## Verificado por fuera del motor

`docs/_snapshots/MARCADORES_2026-08-18.tsv` —volcado directo de Google, sin pasar por ningún
`.gs`— muestra las dos filas con `filtro` **vacío** y `dimensiones` en `ambito=jm` y `ambito=gcba`,
y **42 de 78 marcadores con `dimensiones` poblada**.
