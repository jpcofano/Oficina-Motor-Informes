# Censo — `Id cuentas` de las cuatro campañas destacadas · 19/08/2026

> **Evidencia congelada.** Medido por el validador el 19/08/2026 sobre **`looker/Cuentas`**,
> columnas **`id_cuentas`** y **`nombre_campaña`**. **Ninguno de los cuatro cae en más de un id.**
>
> Envejece como cualquier medición: para saber qué hay hoy se vuelve a medir contra la base.

## Los cuatro

| `Id cuentas` | nombre en `looker/Cuentas` |
|---|---|
| `3305-JULSEGGJ` | Egreso más de 1000 Cadetes |
| `3410-JULSEGGJ` | Operativo de saturación 1-11-14 |
| `3258-JUNJDGGJ` | Decreto: Declaración de servicios esenciales |
| `3139-JUNDHHGC` | Programas y Actividades para personas mayores |

## ⚠ Por qué esto existe: **el nombre no sirve como clave**

**Cuatro solapas dan cuatro nombres distintos para la misma campaña, y ninguno coincide con el del
deck.** El caso más claro: el deck dice *"Egreso de mil cadetes"* y `looker/Cuentas` dice *"Egreso
más de 1000 Cadetes"*. Además hay **espacios finales y mayúsculas inconsistentes dentro de una
misma solapa**.

⚠ **Y el caso que lo cierra, porque no lo arregla ninguna normalización:** en `digital/Directa
Mail`, la fila del **20/07** de la cuenta **`3305`** tiene en la columna de nombre de campaña
*"Vacunación Antirrábica"*, mientras **las otras cuatro columnas de esa misma fila** dicen *"Egreso
de Cadetes"*.

> **Un filtro por nombre pierde esa fila. Uno por `Id cuentas` no.**

**Esto descarta `R-10` como solución.** Normalizar los dos lados arregla espacios y saltos; **no
arregla que la celda diga otra campaña**. Es la diferencia entre un problema de forma y uno de
contenido, y acá es de contenido.

## La consecuencia de diseño

**La cadena nombre → id → métricas NO vive en el motor.** `CAMPANAS` lleva el `Id cuentas` y el
nombre queda como **etiqueta para el deck**. La resolución la hace **una persona, una vez, al
cargar** — no el motor, cada semana, contra cuatro grafías que no coinciden.

Es el mismo criterio que `R-02` para el temario: lo que se publica se declara, no se deduce.

⛔ **Bloqueo medido el 19/08: `CAMPANAS` no tiene columna para el id.** Sus diez columnas son
`periodo_id`, `campana_id`, `nombre`, `informe_id`, `base_id`, `tipo`, `desde`, `hasta`, `mostrar`,
`orden`. **Agregarla es lo que falta antes de cargar.**

## Contraste con el ámbito, que es lo que hace a este caso distinto

`ambito` se identificaba de **cuatro** formas, todas por **valores cerrados** —`Jorge Macri`, una
casilla de mail, `JM` como subcadena—. La campaña se nombra de **once** formas, todas por **texto
libre tipeado**. Por eso lo que funcionó para `D-33` —una tabla de traducción por base— **no
alcanza acá**: no hay valor canónico del que traducir.
