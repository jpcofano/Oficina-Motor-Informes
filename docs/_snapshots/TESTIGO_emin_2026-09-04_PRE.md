# TESTIGO — `L-012` ministros · **ANTES** del `2026-09-04_5` · 04/09/2026

> **Estado: congelado.** Evidencia fechada. Deck **`secco-20260903-234123`** — corrida **completa,
> 1 ejecución, 46 slides**, leído con `markitdown`.
> ⭐ **Ventana: `2026_agosto_28_04` (28/08–04/09)**, en el encabezado porque un valor sin su ventana
> no se puede comparar contra nada.

## Los diez `emin_*`, tal como salieron

| caja del deck | marcador | publicado | estado |
|---|---|---|---|
| Alcance semanal | `emin_encuentros` | `-7-` | ✅ `ok` — **es el control** |
| Impresiones | `emin_alcance` | `-893351-` | `ok` |
| Mails entregados | `emin_alcance_semanal` | `-491344-` | `ok` |
| Aperturas (OR) | `emin_aperturas` | `-90023-` | `ok` |
| Clics (CTOR) | `emin_clics_ctor` | `-1699-` | `ok` |
| Clics (CTR) | `emin_clics_ctr` | `-2638-` | `ok` |
| Aperturas (OR) · `%` | `emin_or` | ⛔ **`-18.3%-%`** | `ok`, con el `%` **duplicado** |
| Clics (CTOR) · `%` | `emin_ctor` | ⛔ **`-1.9%-%`** | `ok`, ídem |
| Clics (CTR) · `%` | `emin_ctr` | ⛔ **`-0.3%-%`** | `ok`, ídem |
| Encuentros contempladas | **`emin_lista`** | ⛔ **`-`** | ⛔ **`sin_datos`** — el control de este paso |
| «Alcance» | *(sin token)* | *(vacío)* | ⚠ ninguna fila apunta ahí |

⭐ **Los tres números de `%` son CORRECTOS** — verificado con `opPCT` y `formatearValorMarcador_`
reales: `90023/491344 → 18.32`, `1699/90023 → 1.89`, `2638/893351 → 0.30`. **Lo único mal es el
signo repetido.**

## Los tres candidatos a levantar el `_revisar` (lista 1 de P3)

| marcador | formato **hoy** | casos `exacto` |
|---|---|---|
| `imp_total` | `miles_revisar` | `V-73` · `V-79` · `X-10` |
| `frecuencia` | `numero_revisar` | `V-68` · `V-69` · `V-72` |
| `gcba_imp_total` | `miles_revisar` | `V-59` · `V-74` |

⚠ **Fuente: snapshot de `MARCADORES` del 31/08** — el más reciente en el repo. Las altas del 01–03/09
(los 3 `gcba_ivr_*` y los 10 `emin_*`) **no están**, así que el censo **puede quedarse corto**, nunca
largo: los que lista, lista bien.
