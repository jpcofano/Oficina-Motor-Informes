# Respuesta al pedido de la rama de código — 10/08

> Par de `docs/casos_validacion_2026-08-09_addendum.csv`. Casos nuevos: `V-67`, `C-19`, `C-20`,
> `A-04`, `X-16`.
> **Medido sobre `Base Looker.xlsx` del informe del 31/07**, `openpyxl` en `read_only=True,
> data_only=True`. Nada del motor, nada fuera de `docs/`.

---

## 1 · El join es necesario, pero no por lo que se pensaba — `C-19`, `V-67`

**`looker/DIGITAL` sí trae el nombre de campaña.** Encabezados completos, y son nueve:

| col | campo |
|---|---|
| `A` | `Id cuentas` |
| `B` | `Plataforma` |
| `C` | `Impresiones` |
| `D` | `Visualizaciones` |
| `E` | `Clics` |
| `F` | **`nombre_campaña`** |
| `G` | `eje` |
| `H` | `area` |
| `I` | **`estado`** |

`J` a `S` vacías. **4.569 filas: 565 contienen `JM`, 4.004 no. Suman el total.**

**Entonces el corte JM no necesita el join.** `R-23` se aplica sobre la columna `F` de la propia
solapa.

**Pero el join hace falta igual, y por la ventana.** `DIGITAL` **no tiene ninguna columna
temporal**; `fecha_inicio` y `fecha_fin` viven sólo en `Cuentas`. De los tres criterios que
`A-01` declara —figura, estado, ventana— **dos se resuelven sin cruzar y el temporal no**.

**La capacidad de cruzar por `id_cuenta` hay que construirla.** Lo que cambia es el motivo, y con
él la forma: no es un join para saber de quién es la campaña, es un join **para saber cuándo
corrió**. Si mañana `looker` publicara fechas por fila, el join desaparecería.

## 2 · `estado` vive en las dos solapas — `C-20`

`DIGITAL` columna `I`, `Cuentas` columna `G`. En `DIGITAL`, sobre 4.569 filas:

| valor | filas |
|---|---|
| `Finalizada` | 3.519 |
| `Activa` | 932 |
| `Cancelada` | 48 |
| `Pendiente` | 25 |
| `Pausada` | 23 |
| vacío | 22 |

**Aplicar `Activa` deja afuera 3.637 filas, el 79,6 %.** Es un filtro fuerte y conviene que la
traza lo diga.

⚠ **Hay 22 filas con `estado` vacío.** No son `Activa` ni dejan de serlo: hoy caen del lado de
afuera por omisión. Es el mismo modo de falla que `R-20` resolvió para los encuentros —**un vacío
no es un valor**— y merece decisión, no default.

## 3 · No son tres plataformas, son seis — `A-04`

Sobre **toda** la solapa, no sobre la ventana:

| plataforma | filas |
|---|---|
| Meta | 1.680 |
| DV360 | 1.513 |
| Google ads | 1.294 |
| **TikTok** | **51** |
| **Mercado Libre** | **19** |
| **Twitter** | **12** |

`A-03` decía que DV360 era la única tercera **y era cierto para esa ventana**: las tres chicas no
aparecían. Ésa es exactamente la falla que el pedido anticipaba.

**Y la decisión ya existe: el usuario resolvió el 09/08 que las plataformas sueltas entran a
Programmatic.** Entonces:

> **`imp_prog` no es `Plataforma = DV360`. Es `Plataforma != Meta` y `!= Google ads`.**

Cableado como `= DV360` **pierde 82 filas en silencio** — y en una semana donde una campaña
grande corra en TikTok, pierde mucho más que 82.

**Nota para el cableado:** la decisión del 09/08 nombraba también Twitch y Uber. **No están en
`looker/DIGITAL`** — estaban en `CAMPAÑAS_DESGLOCE_DIGITAL`, que quedó en `uso = ignorar`. La
regla por resta las cubre igual si algún día aparecen.

## 4 · `C-12` sigue abierto, con cuatro unidades descartadas — `X-16`

Objetivo publicado: **9 / 7 / 14** (Meta / Google ads / DV360).

| unidad contada | resultado |
|---|---|
| filas · JM + ventana + `Activa` | 6 / 5 / 10 |
| filas · JM + ventana, todos los estados | 12 / 12 / 18 |
| cuentas distintas · `Activa` | 6 / 5 / 6 |
| cuentas distintas · todos los estados | **9** / 8 / 9 |

**Ninguna reproduce.** Contar nombres de campaña distintos da lo mismo que contar cuentas, así que
esa vía no agrega nada.

**Lo que el resultado negativo dice, y es más útil que la lista:** Meta acierta en la última fila
y las otras dos no. **Que una plataforma dé exacto y las otras dos fallen dentro de la misma
unidad no es un error de unidad: es evidencia de que el conteo no sale de esta solapa.** Y los 14
de DV360 caen **entre** las 9 cuentas distintas y las 18 filas, así que no hay agregación de este
conjunto que los produzca.

**Queda abierto.** La hipótesis viva es que el deck cuente piezas o líneas de pauta desde otra
tabla —o que se cuente a mano, que es compatible con los dos errores de tipeo ya encontrados en
estos decks.

---

## Lo que este pedido no tocó

No se re-midieron `imp_meta`, `imp_google` ni `imp_prog`; no se decidió si el join se construye; no
se tocó nada fuera de `docs/`.

**Y una consecuencia que sí hay que llevar al cableado:** `A-04` corrige a `A-03`. Si el prompt de
cableado ya salió con `imp_prog = DV360`, **hay que corregirlo antes de que se ejecute**.
