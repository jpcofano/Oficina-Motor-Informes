# TESTIGO — tandas 2 y 3, 17/08/2026 · **las cuatro tomas**

> **Evidencia congelada.** Las cuatro tomas de las dos tandas del 17/08, con sus horas. Las dos
> cerraron por **igualdad exacta de valores**.
>
> ⚠ **Este archivo registra los CONTROLES y las horas, no los valores marcador por marcador**, que
> no se reportaron individualmente: las dos tandas se cerraron sobre *"los siete idénticos"* y
> *"los 17 idénticos"*. **Los valores de referencia de cuatro de los siete `m2_*` están en
> `TESTIGO_mail_2026-08-16_2220.md`** (`m2_mails_enviados` 1.442.363, `m2_mails_entregados`
> 1.424.241, `m2_aperturas` 407.862, `m2_or` 28,6371478). **Para `m2_envios`, `m2_clics`,
> `m2_ctor` y los 17 de `rdv` no hay valor nominal registrado** — se dice acá para que nadie los
> cite como si lo hubiera.

## Tanda 2 — los siete `m2_*` → `tipo_envio=m2`

| toma | hora | qué |
|---|---|---|
| **testigo** | **13:59** | antes de migrar |
| *(migración)* | **14:04** | `migrarTanda2DeM2()` |
| **verificación** | **14:10** | después |

**Once minutos entre las dos lecturas.**

| control | resultado |
|---|---|
| **0 · canario** `enc_atendidos`/`ivr_atendidos` | **71.234** |
| **1 · valores** | los siete, **idénticos** |
| **2 · cobertura** | `361 + 745 + 1.136 = 2.242` ✔ |
| **3 · universo** | **sin moverse entre las dos tomas** |

⚠ **El universo estable entre tomas es lo que hace legible la cobertura**, y no estaba
garantizado: el mismo universo pasó de **2.239 (16/08 23:31) → 2.241 (17/08 12:54) → 2.242
(13:59)**. **Crece de a poco y todo el tiempo.** Que no se moviera en esos once minutos es lo que
permitió leer el `RESTO` directo, sin descontar nada.

## Tanda 3 — los 17 de `rdv` → `ambito=jm`

| toma | hora | qué |
|---|---|---|
| **testigo** | **14:19:06** | antes de migrar |
| *(migración)* | **14:19:39** | `migrarTanda3DeRdv()` |
| **verificación** | **14:24:58** | después |

**Cinco minutos y 52 segundos entre las dos lecturas. La migración tardó 33 segundos.**

| control | resultado |
|---|---|
| **1 · valores** | los 17, **idénticos** |
| **2 · las 17 cuentas de filas** | **iguales entre sí: 4 de 15** |
| **3 · identidad de canales** | `insc_mail + insc_cc + insc_ivr + insc_digital + insc_dif = inscriptos` = **2.307 exacto** |

**Sin canario, y sin necesitarlo** — los 17 comparten filtro, así que no existe ninguno posible en
`rdv`. Los controles 2 y 3 **no dependen del drift**: son estructurales.

⚠ **Los cinco `_pct` NO cuentan como control.** Comparten filtro con sus dos sumas, así que el
`PCT` es el ratio de dos sumas **sobre las mismas filas** y un corte mal traducido lo dejaría
igual. **Se cumplen por construcción**, igual que `mail_or` en la tanda 1.

## Lo que estas dos tandas probaron sobre el MÉTODO

**La verificación en la misma sesión funciona, y es lo que destrabó `rdv` sin esperar días.**

Con **minutos** entre tomas, el drift de la fuente no alcanza a intervenir — y si interviniera,
**las cuentas de filas lo delatarían antes que los valores**. Eso vale aunque la base se mueva:

| base | ¿se mueve? | ¿se pudo verificar por igualdad exacta? |
|---|---|---|
| `digital` | **sí**, +1 a +2 filas por hora, fuera de la ventana | **sí** — en 11 minutos no se movió |
| `rdv` | no medido dentro del intervalo; idéntica a 12 h | **sí** — en 6 minutos no se movió |
| `looker` | **sí**, y dentro de ventana cerrada | **probablemente no** — es la tanda 4 |

**El criterio corregido, que quedó en `CLAUDE.md` §4:** la pregunta no es *"¿está quieta la
base?"* sino **"¿se mueve dentro del intervalo de la verificación?"**. Una base que se mueve **no
bloquea** la verificación si el intervalo es corto; lo que bloquea es comparar contra un testigo
**de otro día**, que es lo que pasó en el piloto y por eso allá el canario sí hizo falta.

## Verificado contra la hoja, por fuera del motor

`docs/_snapshots/MARCADORES_2026-08-17.tsv` —volcado directo de Google, sin pasar por ningún
`.gs`— muestra **40 de 78 marcadores con `dimensiones` poblada**, y los 24 de estas dos tandas con
`filtro` vacío y su dimensión escrita.
