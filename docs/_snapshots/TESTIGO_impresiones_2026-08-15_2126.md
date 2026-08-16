# TESTIGO — `looker/DIGITAL/Impresiones/SUMA`, 15/08/2026 21:26

> **Evidencia congelada.** Es el estado de los ocho marcadores del piloto `2026-08-15_1`
> **antes** de migrar el corte de `filtro` a `dimensiones`. La Parte C compara contra esto.
>
> **Lleva la hora en el nombre a propósito:** hubo dos tomas el mismo día y **dan distinto**.

## Los ocho

| marcador | valor | ámbito | plataforma |
|---|---|---|---|
| `imp_total` | **33.409.815** | `jm` | *(ausente = todas)* |
| `imp_meta` | **3.229.815** | `jm` | `meta` |
| `imp_google` | **2.203.210** | `jm` | `google` |
| `imp_prog` | **27.976.790** | `jm` | `programmatic` |
| `gcba_imp_total` | **248.880.139** | `gcba` | *(ausente = todas)* |
| `gcba_imp_meta` | 31.204.680 | `gcba` | `meta` |
| `gcba_imp_google` | 53.969.375 | `gcba` | `google` |
| `gcba_imp_prog` | 163.706.084 | `gcba` | `programmatic` |

⚠ **Los cinco en negrita están confirmados nominalmente** contra la tabla de la corrida. **Los
tres `gcba_imp_{meta,google,prog}` traen el valor pero su asignación a cada token se infirió del
orden de la suma** —`31.204.680 + 53.969.375 + 163.706.084`, mismo orden que el ámbito `jm`—.
**Confirmar contra el log antes de usarlos para comparar uno a uno.**

**No afecta al control principal:** el descuadre usa la **suma** de los tres, que es la misma en
cualquier orden.

## El control que no depende del momento

```
jm    33.409.815 − (3.229.815 + 2.203.210 + 27.976.790)  = 0   ✔
gcba  248.880.139 − (31.204.680 + 53.969.375 + 163.706.084) = 0   ✔
```

**`total = suma de partes`, exacto en los dos ámbitos.** Es la invariante que hace utilizable la
decisión de que **una dimensión ausente significa «todas»** (usuario, 15/08): una fila a la que
se le olvidó la plataforma devolvería el total y **descuadraría esto**.

## Por qué el valor absoluto no alcanza como testigo

`looker` **sigue recibiendo datos de una ventana ya cerrada.** Entre las 19:41 y las 21:26 del
mismo día, misma ventana:

| | 19:41 | 21:26 | drift |
|---|---|---|---|
| `imp_total` | 33.374.988 | 33.409.815 | +34.827 |
| `gcba_imp_total` | 248.741.712 | 248.880.139 | +138.427 |
| `imp_prog` | 27.976.790 | 27.976.790 | **0** |

**Y el drift del total es exactamente el drift de las partes**, en los dos ámbitos:
`29.769 + 5.058 + 0 = 34.827` · `63.537 + 74.890 + 0 = 138.427`.

**Eso es lo que vuelve confiable al control:** la invariante no aguantó el movimiento por
casualidad — se mantiene **porque el total y las partes se mueven juntos**, que es lo que uno
espera si `programmatic` se sigue calculando por resta (`R-24`).

**Consecuencia para quien compare:** un valor distinto **no prueba** que la migración falló.
Primero se miran las cuentas de filas de la traza; si cambiaron, es la base.

## Cómo se tomó

`testigoDeImpresiones()` (`Auditoria.gs`), sólo lectura, sobre la ventana que el motor resuelve
por defecto — **la misma que reporta en el log**. Costo ~3m30s: resuelve los 78 marcadores del
informe y de ésos se usan 8.
