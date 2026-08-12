# `_33` · El recorte por solape, medido antes de aplicarlo

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Qué cambió:** hay hasta mañana. El `_32.2` cerró los `cc_*` en `—` con un motivo que era
> correcto **para tres horas**: mapear `fecha_fin_periodo` mueve el universo de todos los
> marcadores de `resumen_metricas_dinamico`, incluidos los que ya publican, y no había tiempo de
> re-mirar `frecuencia`. **Ahora sí lo hay.** Lo que no cambia es el orden: **primero se mide el
> impacto, después se decide.**
>
> `jm-20260811-234158` es la red y nada puede empeorarlo.

---

## Parte A · El impacto, simulado — sólo lectura, reportar y parar

**Modelo: Sonnet, effort alto.**

**A.1 — quiénes están expuestos.** Todos los marcadores cuya fuente sea
`looker/resumen_metricas_dinamico`, con su `campo_logico`, `operacion`, `filtro` y `periodo_ref`.
Marcar cuáles **publican hoy** con valor y cuáles salen `—` o sin dato.

**A.2 — el diff, sin tocar `MAPEO`.** Para la ventana 24–30/07 y para `junio_sem2`, calcular cada
uno de esos marcadores **dos veces**:

- **hoy**: recorte por punto, `fecha_periodo` = `fecha_inicio` dentro de la ventana;
- **con solape**: la cuenta entra si su `[fecha_inicio, fecha_fin]` **se cruza** con la ventana.

Reportar una tabla `marcador · hoy · con solape · Δ`, y **cuántas cuentas entran en cada criterio**.

**Simulado, en un diagnóstico de sólo lectura. No se agrega la fila de `MAPEO` en esta parte.**

**A.3 — `frecuencia` y `gcba_frecuencia` aparte.** Son los dos que ya publican y los que más pesan.
Además del valor, reportar cuántas cuentas suman en cada criterio. `C-22` está abierto porque *el
universo del total JM de `frecuencia` no cierra*: decir si el criterio de solape lo acerca, lo aleja
o no lo mueve. **Es un dato para el reporte, no una conclusión.**

**Reportar y parar.**

---

## Parte B · Aplicar, o no

**Modelo: Opus, effort alto.** Mueve números publicados.

**La puerta:** que A.2 muestre un diff **explicable**, no sólo chico. Un marcador que cambia porque
entran campañas que estaban activas toda la semana es explicable. Uno que cambia sin que se pueda
decir qué cuenta entró o salió, no — y ahí se para.

**Si abre:** la fila de `MAPEO` para `fecha_fin_periodo` en esa solapa, y las tres de `MARCADORES`:

- `cc_base` → `call_discado`, `SUMA`
- `cc_contactados` → `call_contactados`, `SUMA` *(el `MAPEO` de la columna ya existe)*
- `cc_contact_pct` → `call_contactados / call_discado`, `PCT`

Las tres con `notas` = `SIN VALIDAR — demo 12/08`.

**Si no abre:** los `cc_*` se quedan en `—` y el `_32.2` sigue siendo la última palabra. **Es una
salida legítima, no un fracaso**, y la Parte A ya habrá dejado el hallazgo medido, que era el valor
real del ejercicio.

**Prohibido igual que ayer:** darle a los `cc_*` un `periodo_ref` propio, elegir fuente a ojo para
`alcance` o `clics`, inventar una operación posicional o un `DISTINCT`.

---

## Parte C · Regenerar

**Modelo: Sonnet.**

**Sólo si la Parte B cambió algo.** Las dos corridas, julio y `junio_sem2`, con la casilla de `—`
tildada. Leer del deck: láminas de encuentro, lámina 5 token por token, lámina de `m2`.

Controles: **julio 6 ítems, `junio_sem2` 3** —Educación sigue sin anclar y eso está decidido, es del
front— y barrios disjuntos entre decks.

**Si algo sale peor que `jm-20260811-234158`, ése sigue siendo el deck que se muestra** y se dice en
una línea.

---

## Lo que sigue pendiente del `_32`

**C** (las dos filas huérfanas de `CORRIDAS`) · **D** (el CSV de 95 casos, que el usuario ya pasa) ·
**F** (la `D-NN` del umbral de anclaje) · **G** del `_32.2` (escribir el recorte por punto). La
Parte A de este prompt **le da a esa G los números** que le faltaban.
