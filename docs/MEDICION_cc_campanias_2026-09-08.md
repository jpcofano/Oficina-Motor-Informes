# MEDICIÓN — `cc_campanias`, `cc_contactados` y `cc_contact_pct` · 2026-09-08

> **CONGELADO.** Evidencia fechada, uno nuevo por medición (`CLAUDE.md` §7). Nadie lo edita.
>
> **Distinto de [`MEDICION_universo_call_center_2026-09-08.md`](MEDICION_universo_call_center_2026-09-08.md)**, que mide **qué filas selecciona
> cada criterio de recorte**. Acá el recorte **ya está decidido y no se vuelve a barrer**
> (`V-126`, `V-127`): lo que se compara son **nueve maneras de contar** sobre las mismas filas.

| | |
|---|---|
| **instrumento** | `medirCampaniasCallCenterBaseNueva()` (`Auditoria.gs`) |
| **corrida** | **2026-09-08, 07:05:43 → 07:05:53** |
| **recorte** | `Fecha` (K) en ventana **+** `Remitente` (Q) `= JM` — **3 filas en cada ventana** |
| **fecha de lectura de la REFERENCIA externa** | **22/08/2026** — `V-65`/`V-66`/`V-105` (julio, `exacto`) y `C-80` (agosto, **abierto**) |
| **control positivo** | ⭐ **SINTÉTICO**, en verde antes de leer un dato — 12 afirmaciones con sus mitades negativas |

---

## 1 · Lo que quedó VALIDADO

| token | ventana | medido | esperado | fuente del esperado | |
|---|---|---|---|---|---|
| `cc_contactados` | 24–31/07 | **1.878** | 1.878 | `V-65`/`V-105` · **exacto** | ✅ |
| `cc_contact_pct` | 24–31/07 | 31,24 % → **31** | 31 | `V-66`/`V-105` · **exacto** | ✅ |
| `cc_contactados` | 14–20/08 | **1.616** | 1.616 | `C-80` · *abierto* | ✅ |
| `cc_contact_pct` | 14–20/08 | 23,59 % → **24** | — | ⛔ **no hay valor publicado** | — |

⭐ **Con `cc_base` (`V-126`/`V-127`) son TRES magnitudes independientes que el mismo recorte
reproduce en julio**, sobre las mismas 3 filas. Un recorte que acierta **una** columna puede estar
trayendo filas equivocadas y compensando; que acierte **tres** —incluido un cociente— es evidencia
sobre las filas, no sólo sobre el total.

⚠ **Julio y agosto no pesan igual.** Julio se contrasta contra casos `exacto`; agosto, contra
`C-80`, que está **abierto**.

---

## 2 · `cc_campanias` — las nueve candidatas, con su desglose

**Esperado: 2 en julio · 3 en agosto.** El recorte trae **3 filas en las dos ventanas**.

| # | candidata | julio | agosto | |
|---|---|---|---|---|
| 1 | filas del recorte (línea de base) | 3 ⛔ | 3 ✅ | |
| **2** | **`Tipo de llamado` (R) — DISTINTOS** | **2** ✅ | **3** ✅ | ⭐ |
| **3** | **`Campaña` (A) — DISTINTOS, valor completo** | **2** ✅ | **3** ✅ | ⭐ |
| 4 | filas con `Base Barrida` ≠ 0 — *la NOTA de `C-62`* | 3 ⛔ | 3 ✅ | |
| 5 | `ID BASE` (L) — DISTINTOS | 3 ⛔ | 3 ✅ | |
| 6 | `CUENTA_NO_VACIAS` sobre `Tipo de llamado` — *los CAMPOS de `C-62`* | 3 ⛔ | 3 ✅ | |
| **7** | **`Tipo` (I) — DISTINTOS** | **2** ✅ | **3** ✅ | ⭐ |
| **8** | **prefijo de `Campaña` antes del `:` — DISTINTOS** | **2** ✅ | **3** ✅ | ⭐ |
| 9 | filas con `Contactados U` ≠ 0 | 3 ⛔ | 3 ✅ | |

⛔⛔ **Aciertan CUATRO. Estas dos ventanas NO las discriminan, y acá no se desempata.**

⚠ **Y agosto no separa nada por sí solo: las nueve dan 3.** Todo el poder discriminante de esta
matriz está en julio, donde hay 3 filas y el deck publica 2. **Una sola ventana es la que decide**,
y eso conviene saberlo antes de darle peso al «acierta las dos».

### El desglose — que es donde las cuatro dejan de ser lo mismo

**Julio**

```
candidata 2 · Tipo de llamado (R)   →  "Convocatoria" ×2   ·  "Reconfirmación" ×1
candidata 7 · Tipo (I)              →  "Convocatoria" ×2   ·  "Reconfirmación" ×1
candidata 3 · Campaña (A) completo  →  "Convocatoria: RDV - JM - Primera Persona + Paula Pareto 27/7" ×2
                                       "Confirmación: RDV - JM - Primera Persona + Paula Pareto 27/7" ×1
candidata 8 · prefijo de Campaña    →  "Convocatoria" ×2   ·  "Confirmación" ×1
```

**Agosto**

```
candidata 2 · Tipo de llamado (R)   →  "Convocatoria" · "IVR convocatoria" · "Reconfirmación"
candidata 7 · Tipo (I)              →  "Convocatoria" · "IVR convocatoria" · "Reconfirmación"
candidata 8 · prefijo de Campaña    →  "Convocatoria" · "IVR Convocatoria" · "Confirmación"
candidata 5 · ID BASE (L)           →  CM1440RVFUNC-CP-001 · CM1441RVFUNC-RP-001 · CM1442RVFUNC-IVRP-002
```

⭐⭐ **Coinciden en el NÚMERO y difieren en el VALOR** — y eso sólo se ve con el desglose al lado.
Son **dos familias**:

| familia | candidatas | dice |
|---|---|---|
| **columnas tipadas** | 2 (`Tipo de llamado`) y 7 (`Tipo`) | `Reconfirmación` · `IVR convocatoria` |
| **texto libre** | 3 y 8 (`Campaña`) | `Confirmación` · `IVR Convocatoria` |

⇒ **Las dos familias etiquetan la MISMA fila con palabras distintas.** Y `Tipo` (I) y
`Tipo de llamado` (R) devuelven **exactamente lo mismo** en las dos ventanas: son redundantes entre
sí sobre estas 6 filas.

### ⭐ Un argumento estructural, que NO sale de estas dos ventanas

`V-91` y `S-01` ya recortan el iceberg por **`Tipo de llamado IN (Convocatoria; IVR convocatoria)`**,
y esas dos cadenas aparecen **textuales** en la columna `R` de la base nueva. `C-69` también usó
`Reconfirmacion`. ⇒ **La familia tipada habla el vocabulario que el repo ya validó; la de texto
libre no.**

⛔ **Esto no elige.** Va escrito para que la decisión —que es del usuario— tenga delante lo que hay,
y no para desempatar por la puerta de atrás.

---

## 3 · Por qué todo lo que cuenta FILAS falla en julio

El recorte de julio trae **3 filas** y el deck publica **2 campañas**:

```
"Convocatoria: RDV - JM - Primera Persona + Paula Pareto 27/7"   24/07   Base Barrida 3.000
"Convocatoria: RDV - JM - Primera Persona + Paula Pareto 27/7"   27/07   Base Barrida 1.726
"Confirmación: RDV - JM - Primera Persona + Paula Pareto 27/7"   27/07   Base Barrida 1.285
```

**Las dos primeras son la MISMA campaña enviada dos veces.**

⚠ **El porqué NO se repite acá: está medido en
[`MEDICION_universo_call_center_2026-09-08.md`](MEDICION_universo_call_center_2026-09-08.md),
`ADDENDUM 1` § la sonda** — `looker/CC` agrega por campaña y la base nueva tiene **una fila por
fecha de envío**, con `3.000 + 1.726 = 4.726` cerrando al dígito contra la fila única de allá.

⇒ **La consecuencia, que sí es de este documento: el deck cuenta CAMPAÑAS, no envíos.** Por eso las
candidatas 1, 4, 5, 6 y 9 —que todas cuentan filas bajo distintos disfraces— dan 3 donde hace falta
2.

⚠ **En agosto ninguna de las tres filas comparte campaña**, así que todas dan 3 y la ventana no
distingue nada.

---

## 4 · `C-62` no se traslada, y el motivo es citable

`C-62` cerró `cc_campanias` sobre `looker/CC` con *«el conteo son las filas con valores distintos de
cero»* — la cuenta `3488` tenía `Convocatoria 6.000`, **`Reconfirmacion 0`**, `IVR convocatoria 245`.

**Sus dos lecturas se midieron por separado y las dos fallan julio:**

- **los CAMPOS** (`columna = Tipo de llamado`, `operacion = CUENTA_NO_VACIAS`) → candidata 6 → **3**.
  ⭐ El censo del 08/09 lo explica sin ambigüedad: esa columna tiene **1980 de 1980 con dato**, así
  que contar no-vacías **es** contar filas.
- **la NOTA** (filas con valor ≠ 0) → candidata 4 → **3**. En la base nueva **no hay ninguna fila en
  cero**: las tres de julio traen 3.000, 1.726 y 1.285.

⇒ ⛔ **El cero era de `looker/CC`, no del negocio.** El criterio de `C-62` acertaba **por un
artefacto de esa cuenta en esa fuente**, y no sobrevive al cambio de fuente.

⚠ **`C-62` no se retracta**: su medición sobre `looker/CC` sigue siendo correcta.

---

## 5 · Qué NO cubre esta medición

- ⛔ **Mide DEFINICIONES DE NEGOCIO, no el motor.** La base no está de alta, y **no existe ningún
  marcador `cc_*` vivo** — medido sobre `MARCADORES_2026-08-31.tsv`: **cero**.
- ⛔ **`cc_campanias` sigue sin criterio elegido**, y eso bloquea su cableado. No bloquea `cc_base`,
  `cc_contactados` ni `cc_contact_pct`.
- ⛔ **El `%` de agosto no tiene testigo** — se mide 24 y no hay valor publicado contra el cual
  contrastarlo (`C-116`).
- ⚠ **El cruce caso → marcador no scopea por base** (`C-115`): hoy es inerte porque no hay
  marcadores `cc_*`, y **deja de serlo el día del alta**.
- ⛔ Es una **FOTO del 2026-09-08**.
