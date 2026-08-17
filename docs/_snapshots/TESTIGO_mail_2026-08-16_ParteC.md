# TESTIGO — `digital/Directa Mail`, Parte C de la tanda 1 · 16/08/2026, después de migrar

> **Evidencia congelada.** Es el estado de los ocho marcadores de la tanda 1 **después** de mover
> el corte de `ambito` de `filtro` a `dimensiones`. Se compara contra
> `TESTIGO_mail_2026-08-16_2220.md`.
>
> ⚠ **El nombre no lleva hora porque no se reportó la del run.** La convención pide
> `AAAA-MM-DD_HHMM` —dos tomas del mismo día son valores distintos— y acá el sufijo `ParteC` la
> distingue sin ambigüedad de la única otra toma del día, la de las 22:20. **Si aparece la hora,
> renombrar.**

## Resultado: reprodujo por **igualdad exacta de valores**

**Los ocho dan el mismo número dígito por dígito contra el testigo de las 22:20.**

| control | resultado |
|---|---|
| **0 · canario** | `enc_atendidos` = `ivr_atendidos` = **71.234**, 2 de 60 — **igual en las dos tomas** |
| **1 · filas** | **7 de 311** (`jm`) y **80 de 1.928** (`gcba`) — **idénticas** |
| **2 · valores** | los ocho, **idénticos** |
| **3 · partición** | **311 + 1.928 = 2.239** ✔ |

Los valores son los mismos de `TESTIGO_mail_2026-08-16_2220.md` y no se repiten acá: **duplicarlos
sería crear una segunda copia que puede divergir**, que es justo lo que la convención de snapshots
existe para evitar.

## ⚠ Acá el criterio fue MÁS FUERTE que en el piloto, y el motivo importa

**`digital` está registrada como `snapshot` y no se movió**, así que se pudo comparar por
**igualdad exacta** — que es lo que el prompt del piloto pedía originalmente y allá **no se pudo**.

**En el piloto la comparación exacta era imposible**, y no por descuido: `looker` recibe datos de
una ventana ya cerrada. Se cerró por **identidad de filas + descuadre + canario**, con los ocho
números **distintos** a los del testigo.

**No leer esto como que la comparación exacta es siempre posible.** Depende de la base:

| base | comportamiento | criterio que admite |
|---|---|---|
| `digital` | `snapshot`, quieta | **igualdad exacta de valores** |
| `looker` | recibe datos de ventanas ya cerradas | **identidad de filas + invariante + canario** |

## El contraste que lo prueba, medido en la misma hora

**`looker` se movió mientras `digital` no:** `imp_total` pasó de **34.289.779 a 34.293.287** en la
misma hora en que los ocho de mail no cambiaron ni un dígito.

**Eso responde la duda de fondo del piloto:** el instrumento **distingue una base viva de una
quieta**. No es que "los números siempre se mueven" ni que "siempre están quietos" — es una
propiedad de cada base, y el mismo instrumento la mide bien en los dos casos.

## Los consumidores — punto 5 de la Parte A

`censarTokensDeTanda1Mail()`, contra la plantilla viva de `jm`:

| token | láminas |
|---|---|
| `mail_entregados` · `mail_aperturas` · `mail_or` | **2 y 5** |
| `mail_envios` | 2 |
| `gcba_mail_envios` · `gcba_mail_entregados` · `gcba_mail_aperturas` · `gcba_mail_or` | 3 |

**Los ocho tienen consumidor**, así que los ocho se pueden verificar contra un deck.

⚠ **Tres están en dos láminas, no uno.** En el piloto sólo `imp_total` estaba repetido; acá son
**tres**. **El mismo token en dos láminas tiene que dar el mismo número en las dos** — y si
difiere, **no es la migración**: es la lámina 5, que tiene historia propia (`R-15` addendum 1, los
seis marcadores de `ecv_alcance_semanal` contando doce figuras en vez de una).

**Y la partición de láminas ya no coincide con la de ámbito**, a diferencia del piloto: allá los
cuatro de `jm` estaban en la 2 y los cuatro de `gcba` en la 3, limpio. Acá los `jm` se reparten
entre la 2 y la 5, mientras los `gcba` siguen solos en la 3.

## Cómo se tomó

`testigoDeImpresiones()` (`Auditoria.gs`), sólo lectura, sobre la misma ventana que la Parte A.
La migración la escribió `migrarTanda1DeMail()` (`Instalar.gs`), por `curarCamposMarcadores_`.

**Verificado además contra la hoja, por fuera del motor:** `docs/_snapshots/MARCADORES_2026-08-17.tsv`
—volcado directo de Google, sin pasar por ningún `.gs`— muestra los ocho con `filtro` vacío y
`dimensiones` en `ambito=jm` / `ambito=gcba`.
