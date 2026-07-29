# M2 — Mapeo y config

Base `M2 Reporte para Fede 2026`. Tiene 12 hojas; para la familia `m2_*` sirven
**dos**: `M2 periodo DIRECTA` y `M2 periodo DIGITAL`.

---

## Fila para `BASES` (reemplaza la que tenía "verificar")

| base_id | nombre | sheet_id | hoja_default | tipo | activo | notas |
|---|---|---|---|---|---|---|
| m2 | M2 Reporte para Fede 2026 | `1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY` | M2 periodo DIRECTA | google_sheets | sí | Directa + Digital en hojas separadas |

---

## Dos hallazgos estructurales de M2 (distinto a las otras bases)

**1. Las hojas de M2 ya vienen filtradas por período (son "snapshots").**
`M2 periodo DIRECTA` y `M2 periodo DIGITAL` tienen en la **fila 1** un `Periodo:`
con las fechas desde/hasta (celdas B1/C1). O sea: el recorte de período ya está
hecho aguas arriba — la hoja *es* el período. A diferencia de RDV/Digital/Looker
(donde filtramos por columna de fecha), para M2 el motor **no debería filtrar por
fecha**: lee la hoja tal cual, y si acaso valida que B1/C1 coincidan con el período
de CONFIG.

**2. El encabezado NO está en la fila 1.** Estructura de esas hojas:
- Fila 1: `Periodo: | desde | hasta`
- Fila 2: en blanco
- Fila 3: **encabezado** (ID, Nombre campaña, …)
- Fila 4+: datos

El lector genérico del Paso 2 asume encabezado en fila 1. Para M2 hay que indicarle
que el encabezado está en la **fila 3** (datos desde la 4).

**Sugerencia (registro-consistente):** agregar dos columnas opcionales a `BASES`:
`fila_encabezado` (default 1; M2 = 3) y `modo_periodo` (`filtrar` | `snapshot`;
M2 = `snapshot`). Así el quirk de M2 queda declarado como dato, no hardcodeado.
Lo incorporamos al prompt del Paso 2.

---

## MAPEO — filas para M2

> `campo_logico` debe ser único por base; por eso los de digital llevan sufijo `_dig`
> (ej. `clics` de directa vs `clics_dig` de digital).

**Directa — hoja `M2 periodo DIRECTA`:**

| base_id | campo_logico | hoja | columna | notas |
|---|---|---|---|---|
| m2 | campana | M2 periodo DIRECTA | B | Nombre campaña |
| m2 | fecha | M2 periodo DIRECTA | C | Fecha de envío |
| m2 | envios | M2 periodo DIRECTA | D | Enviados |
| m2 | entregados | M2 periodo DIRECTA | E | Entregados |
| m2 | aperturas | M2 periodo DIRECTA | F | Aperturas |
| m2 | or | M2 periodo DIRECTA | G | OR% |
| m2 | clics | M2 periodo DIRECTA | H | Clics |
| m2 | ctor | M2 periodo DIRECTA | I | % CTOR |

**Digital — hoja `M2 periodo DIGITAL`:**

| base_id | campo_logico | hoja | columna | notas |
|---|---|---|---|---|
| m2 | campana_dig | M2 periodo DIGITAL | B | Nombre campaña |
| m2 | estado | M2 periodo DIGITAL | E | Estado |
| m2 | impresiones | M2 periodo DIGITAL | F | Impresiones |
| m2 | alcance_dig | M2 periodo DIGITAL | G | Alcance |
| m2 | frecuencia_dig | M2 periodo DIGITAL | H | Frecuencia |
| m2 | views | M2 periodo DIGITAL | I | Views |
| m2 | vtr | M2 periodo DIGITAL | J | % VTR |
| m2 | clics_dig | M2 periodo DIGITAL | K | Clics |
| m2 | ctr | M2 periodo DIGITAL | L | % CTR |

---

## Cómo enganchan con los marcadores `m2_*`

- **Directa (slide 9 JM):** `m2_envios`→envios, `m2_mails_entregados`→entregados,
  `m2_aperturas`→aperturas, `m2_or`→or, `m2_clics`→clics, `m2_ctor`→ctor,
  `m2_campanias`→ contar filas de `M2 periodo DIRECTA`.
- **Digital (slide 10 JM):** los `m2_*_imp`/`aud`/`clics`/`vis` por categoría salen de
  `M2 periodo DIGITAL` (impresiones/alcance/clics/views), agrupando por `Área` o
  `Eje`. Esa slide es la que quedó marcada para revisar posición — conviene decidir
  si se agrupa por categoría en `Marcadores.gs` o se arma como tabla dinámica.

> Nota: las otras hojas de M2 (`M2 Directa`, `M2 digital`, `Alcance`, etc.) son los
> logs completos / auxiliares. Para los marcadores del informe usamos las dos hojas
> `M2 periodo *`, que ya están al corte del período.
