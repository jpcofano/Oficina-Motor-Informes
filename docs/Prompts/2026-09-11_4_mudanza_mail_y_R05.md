# 2026-09-11_4 — Mail se muda a `acumulado | Mail`, y ahí `R-05`

> **Objetivo único:** que los seis marcadores de mail de campaña lean `acumulado | Mail` con grano
> por envío, y que `R-05` quede aplicada.
>
> **Subagente: ninguno.** · ⛔ **Un cambio por deck.** Nada más viaja con esto.

⭐ **El caso que la cola de mudanzas exige ya está medido:**

```
121.789 + 145.744 + 176.870 = 444.403   ← acumulado | Mail, grano envío
                              444.403   ← lo que publica camp_entregados hoy
```

**El universo nuevo reproduce el actual al dígito.** La mudanza no va a ciegas.

| parte | modelo | effort |
|---|---|---|
| **0** | Sonnet | medio — reportar y parar |
| **A** | **Opus** | **alto** — la mudanza |
| **B** | Sonnet | medio — ⭐ la mudanza en seco, **sin filtro** |
| **C** | **Opus** | **alto** — el filtro |
| **D** | Sonnet | medio — `SOLAPAS` y documentación |

---

## Parte 0 — SÓLO LECTURA · reportar y parar

**0.1 · ¿Quién más usa `digital | Directa Mail`?** Censo de **todos** los marcadores que la leen,
no sólo los seis de campaña. Los `camp_envN_*` del desagregado y los `m2_*` son candidatos obvios.
⛔ **Si hay otros, la solapa NO se marca `ignorar`** y hay que decir cuáles quedan.

**0.2 · ¿`digital | Directa Mail` tiene las mismas filas?** `looker | MAIL` y `acumulado | Mail`
coinciden en **6.219**. Falta la tercera. ⚠ Si difiere, mudar `camp_dir_impl` cambia **universo
además de fuente**, y eso se reporta antes de escribirlo.

**0.3** Las 8 columnas de `acumulado | Mail` que se van a dar de alta, con **letra Y encabezado**:
`ID cuentas` A · campaña H · `Fecha envio` F · enviados M · entregados N · aperturas O · clics Q ·
**`Remitente` AI**.

**⛔ Reportar y parar.**

---

## Parte A — Opus · la mudanza

**Alta en `MAPEO`** de las 8 columnas de `acumulado | Mail`. ⛔ **Letra Y encabezado siempre** —
el encabezado es testigo (`D-31`); sin él, una inserción de columna mueve todo sin que nada falle.

**Mudar los seis marcadores** de `looker | resumen_metricas_dinamico` a `acumulado | Mail`:

| marcador | antes | después |
|---|---|---|
| `camp_enviados` · `camp_entregados` · `camp_aperturas` · `camp_mail_clics` | `ULTIMO` sobre una fila ya agregada | **`SUMA`** sobre filas por envío |
| `camp_or` · `camp_ctor` | `PCT` | `PCT` con los nuevos |
| `camp_dir_impl` | `digital \| Directa Mail`, `CONTEO` | `acumulado \| Mail`, `CONTEO` |

⭐ **Por qué el destino es `acumulado | Mail` y no `Directa Mail`:** 36 columnas contra 25, tiene la
etiqueta de remitente, y las tres filas coinciden. ⛔ `looker | MAIL` queda descartada con motivo
medido: 5 columnas, sin remitente, sin fecha, sin campaña.

⭐ **Y el motivo de fondo de la mudanza, que no es «para poder filtrar»:**
`resumen_metricas_dinamico` **no tiene remitente** — `R-05` es **inexpresable** desde esa fuente.
Además `looker` es la base que `R-31` midió inestable por CAMBIO.

⛔ **Pertenencia por `id_cuenta`** (`R-06`, `D-30`), nunca por nombre: las tres filas dicen
`Operativo Muro`, `Operativo Muro` y `Operativo Muro | 25/8`.

---

## Parte B — ⭐ la mudanza en seco, ANTES del filtro

⛔⛔ **Mudar y filtrar mueven el mismo número en direcciones opuestas** — mudar lo deja en
`444.403`, filtrar lo baja a `267.533`. Juntos y a ciegas, una diferencia no se puede atribuir.

⇒ **Correr los marcadores ya mudados y SIN filtro por la API (`llamar`) y comprobar que dan
`444.403`.** ⛔ Si dan otra cosa, **parar**: el hallazgo es la mudanza y el filtro espera.

⭐ Esto no gasta un deck: es una llamada. La atribución queda intacta con **una sola corrida**.

---

## Parte C — Opus · `R-05`

```
etiqueta_de_campaña = el Remitente (col AI) de la fila con `Fecha envio` MÍNIMA de esa cuenta

camp_enviados · camp_entregados · camp_dir_impl  →  sólo filas con ESA etiqueta
camp_aperturas · camp_mail_clics                 →  TODAS las filas
camp_or · camp_ctor                              →  se calculan con las cifras nuevas
```

⭐ **La etiqueta (AI), no la dirección (G), y está medido por qué:** `jmacri@` 424 +
`jorge.macri@` 384 = **808 = el conteo exacto de `JM`**. La dirección se parte en dos para el mismo
funcionario —32 direcciones distintas en la columna— y la etiqueta las agrupa. Con la dirección,
una campaña que cambie de grafía perdería un envío del mismo universo.

⛔⛔ **Corte POSITIVO por los dos lados, y acá es más grave que nunca:** `AI` tiene **21 valores
distintos y 33 vacías**. Un `!= JM` metería 2.942 `GCBA` + 1.723 `PC` + todo lo demás. Es la misma
decisión del 07/09 para Call Center, donde eran 6 valores; acá son 21.

⛔ **El empate aborta, no elige.** Hoy da 0 sobre 544 cuentas, pero el día que aparezca, elegir en
silencio convierte un empate en un número equivocado que nadie ve.

⛔ **La fila del desagregado NO se toca.** Es una operación distinta **por métrica**, no un filtro
de filas — sacar la fila es el error del equipo.

**Se escribe en los dos lugares a la vez:** el GLOBAL de `L-019` y el agregado de `L-017`
(`L-022`/`L-020` en `secco`), o el agregado deja de cuadrar con su propio desagregado.

### ⛔ La identidad que se rompe, y su reemplazo en el mismo acto

```
GLOBAL enviados y entregados = suma de las filas con la etiqueta del primer envío
GLOBAL aperturas y clics     = suma de TODAS las filas
```

⚠ Sin eso, el próximo que mire la lámina ve un GLOBAL que no suma sus propias filas y lo lee como
defecto — **que es exactamente `C-124`**. La nota de lámina es texto de plantilla — `C-01`, la
escribe el usuario.

---

## Parte D — `SOLAPAS` y documentación

⛔ **`digital | Directa Mail` pasa a `uso = ignorar` SÓLO si la Parte 0.1 devolvió cero
marcadores.** Si queda uno solo, no se marca y se dice cuál.

⚠ **Y no se usa `inventariarSolapasDeBase_` para esto** — da de alta con `uso = revisar` y una vez
escrita esa fila el seed ya no la puede promover (`D-32`).

| qué | dónde |
|---|---|
| `R-05` de **hipótesis a regla cerrada** — su texto decía *«hasta que el equipo la confirme»* | `REGLAS_NEGOCIO.md`, con fecha y vía |
| La decisión del 10/09, **derogada** | `CONFIG_INFORMES.md` §2.5 — tachada, no borrada |
| `C-125` de `contradice` a **explicado** | CSV del 10/09 |
| La mudanza y su caso de validación | CSV del 11/09 |
| ⛔ El límite del discriminador | ⭐ **en el caso, no al pie**: si un reenvío saliera con la **misma etiqueta**, el filtro **no lo saca** y la duplicación vuelve **sin fallar** |

⭐ **Y de la decisión del 10/09, lo que hay que escribir es el error:** se apoyaba en que el deck
cerraba consigo mismo. **Y cierra — sobre un número duplicado.** Una identidad verifica
**coherencia, no corrección**. Lo mismo explica por qué `444.403` coincidía en las dos fuentes: la
fuente ya acumulaba las tres, no las sumaba el motor.

---

## ⛔ Hard stops

1. ⛔ **Si la Parte B no da `444.403`, no se escribe el filtro.**
2. ⛔ **Corte positivo por los dos lados.** 21 valores + 33 vacías.
3. ⛔ **El empate aborta.**
4. ⛔ **No sacar la fila del desagregado.**
5. ⛔ **`ignorar` sólo con cero usuarios medidos.**
6. ⛔ **Un cambio por deck.** ⛔ **No tocar la plantilla.**
