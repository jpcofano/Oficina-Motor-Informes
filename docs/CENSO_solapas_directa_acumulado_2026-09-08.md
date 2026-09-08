# CENSO DE SOLAPAS — `DGPLES - Directa acumulado` · 2026-09-08

> **CONGELADO.** Evidencia fechada, **uno nuevo por corrida de censo** (`CLAUDE.md` §7). Nadie lo
> edita. Para saber qué hay hoy, se re-corre `censarBaseNuevaCallCenterIVR()`.
>
> **Reemplaza en la práctica a [`CENSO_solapas_directa_acumulado_2026-09-07.md`](CENSO_solapas_directa_acumulado_2026-09-07.md)**, que quedó
> con el log perdido y declaraba sus huecos. ⛔ **Aquél no se edita ni se borra**: es el registro de
> lo que cuesta que un censo viva sólo en una conversación.
>
> **Por qué un archivo nuevo y no un addendum:** §7 dice literalmente *«uno nuevo por corrida de
> censo»*, y la del 05:55 **es otra corrida**.

| | |
|---|---|
| **instrumento** | `censarBaseNuevaCallCenterIVR()` (`Auditoria.gs`) |
| **corrida** | **2026-09-08, 05:55:46 → 05:56:33** |
| **`sheet_id`** | `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60` |
| **nombre del archivo** | **`DGPLES - Directa acumulado`** |
| **solapas** | **38** |

⚠ **Este censo NO clasifica.** Decir cuáles van a `SOLAPAS` como `fuente`, cuáles como `ignorar` y
con qué `ventana_ref` es del alta, no de acá.

⭐ **El nombre del archivo no se parece a su contenido**, igual que `reuniones` → `DGPLES _
Seguimiento ECVs`. **La firma de una base es su lista de solapas, nunca el nombre del archivo**
(`CLAUDE.md` §4). Ésta es esa lista.

---

## Las 38 solapas

| # | solapa | filas | cols |
|---|---|---|---|
| 1 | `Consolidado` | 3394 | 7 |
| 2 | `Barrios Priorizados` | 226 | 17 |
| 3 | `BP 2` | 70 | 14 |
| 4 | `Campañas + Rtas` | 19 | 11 |
| 5 | `Mail` | 6154 | 36 |
| 6 | **`IVR`** | **197** | **31** |
| 7 | `SMS` | 103 | 21 |
| 8 | **`Call Center - Métricas`** | **1981** | **22** |
| 9 | ⭐ `Call Center - Campañas` | 2973 | 7 |
| 10 | `Call - Google` | 699 | 7 |
| 11 | `Mail - Google` | 363 | 2 |
| 12 | `Base original SALUD oeste` | 719 | 8 |
| 13 | `M2 semanal - Proyectos` | 76 | 78 |
| 14 | `Proyectos M2` | 35 | 2 |
| 15 | `Proyectos M2 (ok)` | 40 | 2 |
| 16 | ⭐ `Remitentes` | 30 | 2 |
| 17 | `M2 x semana AGO - Gestión` | 1 | 11 |
| 18 | `M2 semanas de picos +35` | 178 | 30 |
| 19 | `Hoja 46` | 6721 | 2 |
| 20 | `TD-Respuestas` | 6261 | 4 |
| 21 | ⭐ `Call - Creación de campañas` | 1356 | 26 |
| 22 | `Implementaciones` | 11656 | 57 |
| 23 | `Herramientas x Semana` | 974 | 66 |
| 24 | `SMS MANUAL` | 30 | 4 |
| 25 | `Mail x Sem x Rem` | 92 | 10 |
| 26 | `Herramientas x Mes` | 3677 | 25 |
| 27 | `Cantidad de RTA` | 2163 | 5 |
| 28 | `Positivas - RTA` | 1984 | 12 |
| 29 | `Gráficos M2` | 68 | 27 |
| 30 | `M2` | 1616 | 16 |
| 31 | `Desplegables` | 91 | 4 |
| 32 | `M2 - Gráficos` | 1000 | 40 |
| 33 | **`M2 - Gráficos2`** | **1000** | **11** |
| 34 | `M2 - Solo gráficos` | 15 | 21 |
| 35 | `Semana y Mes` | 263 | 4 |
| 36 | `Import cuentas` | 3648 | 12 |
| 37 | `Mail + tasa Respuestas` | 2500 | 37 |
| 38 | `Pivot` | 2144 | 16 |

### ⚠ Varias no tienen fila de títulos, y el censo lo muestra

`BP 2`, `M2 semanal - Proyectos`, `Implementaciones`, `Herramientas x Semana`, `Mail x Sem x Rem`,
`Herramientas x Mes`, `Positivas - RTA`, `Gráficos M2`, `M2`, `M2 - Solo gráficos`,
`Mail + tasa Respuestas` y `Pivot` traen en la fila 1 celdas vacías o un título de bloque
(`|M2 2025|||…`, `|Solapa Mail (Solo JM y GCBA)|…`), con los encabezados reales una fila más abajo
o directamente ausentes. **`R-02` veta una solapa sin fila de títulos**, y el alta tiene que
declararles `fila_encabezado` o dejarlas en `ignorar`.

### ⭐⭐ Tres solapas que nadie había nombrado y que el alta va a querer mirar

| solapa | por qué importa |
|---|---|
| **`Call Center - Campañas`** · 2973 × 7 | `F. Llamado \| Estado \| ID cuentas \| Nombre de la campaña \| Remitente \| Audiencia \| Herramienta`. ⭐ **Tiene `Remitente` Y una fecha propia**, y es de Call Center: es una **segunda candidata** para el mismo corte que `Call Center - Métricas` |
| **`Consolidado`** · 3394 × 7 | `Fecha \| Estado \| ID Cuentas \| Campaña \| Remitente \| Audiencia \| Herramienta`, con `Herramienta` = `Mail`/`Call Center`/… ⭐ Parece el **cruce de todos los canales** con el mismo esquema |
| **`Remitentes`** · 30 × 2 | `Mail \| Remitente` — p. ej. `infovecinos@buenosaires.gob.ar → GCBA`. ⭐ Es **la tabla que define el mapeo** que `R-15` describe a mano para el canal Mail |

⛔ **Nada de esto se decide acá.** Que existan candidatas alternativas es un dato del censo; elegir
es del alta, y la evidencia de qué universo produce cada una está en `MEDICION_*`, que midió
**sólo** `Call Center - Métricas`.

### ⚠ `Call - Google` tiene los acentos rotos en la fuente

Su fila 1 dice `Id de CampaÃ±a`, `CampaÃ±a`, `NÃºmero`, y su fila 2 `ConfirmaciÃ³n: RDV - Encuentro
TemÃ¡tico "Salud"…`. Es **UTF-8 leído como Latin-1**, y está así **en la planilla**, no en el
instrumento —el resto de las solapas sale con los acentos bien en la misma corrida—. Cualquier
comparación de texto contra esa solapa va a fallar en silencio.

---

## `Call Center - Métricas` — 1981 × 22

### Encabezados, celda por celda

| letra | encabezado | | letra | encabezado |
|---|---|---|---|---|
| A | `Campaña` | | L | `ID BASE` |
| B | `Base total` | | M | `Estado` |
| C | `Base Barrida` | | N | `Audiencia` |
| D | `Contactados U` | | O | `Área` |
| E | `Efectivos` | | P | `ID cuentas` |
| F | `Positiva` | | Q | `Remitente` |
| G | `Neutral` | | R | `Tipo de llamado` |
| H | `Negativa` | | S | `Año` |
| I | `Tipo` | | T | `Mes` |
| J | `Operadores` | | U | `Semana` |
| K | `Fecha` | | V | `Herramienta` |

✅ **Las 22 coinciden exactamente con lo que el prompt `2026-09-07_1` traía declarado**, y **ninguna
trae saltos de línea ni espacios de borde** — el normalizado `R-10` es idéntico al crudo en las 22.

### Filas con dato por columna — sobre 1980

| conteo | columnas |
|---|---|
| **1980** | A `Campaña` · B `Base total` · C `Base Barrida` · D `Contactados U` · E `Efectivos` · I `Tipo` · K `Fecha` · L `ID BASE` · M `Estado` · O `Área` · P `ID cuentas` · **R `Tipo de llamado`** · S `Año` · T `Mes` · U `Semana` · V `Herramienta` |
| **1970** | Q `Remitente` — **10 vacías** |
| **1715** | F `Positiva` · G `Neutral` · H `Negativa` |
| **1510** | J `Operadores` |
| **1040** | N `Audiencia` |

`conteos distintos entre columnas: 5 (1040, 1510, 1715, 1970, 1980)`

⭐⭐ **Y un dato que decide una candidata de `cc_campanias` antes de medirla: `Tipo de llamado` (R)
tiene 1980 de 1980 — NUNCA está vacía.** ⇒ Un `CUENTA_NO_VACIAS` sobre esa columna **es
idénticamente el conteo de filas**, siempre. Eso es exactamente lo que declaran los campos
`columna` + `operacion` de `C-62`, así que **esa lectura de `C-62` degenera en la línea de base** y
no puede dar `2` donde hay 3 filas.

⚠ Las **10 vacías de `Remitente`** son las que hacen que el corte positivo por los dos lados no sea
una precaución teórica (ver `C-108`).

---

## `IVR` — 197 × 31

### Encabezados, celda por celda — ⭐ los seis con salto de línea, confirmados

| letra | crudo | → `R-10` |
|---|---|---|
| A | `ID cuentas` | |
| B | `Estado` | |
| C | `Implementador` | |
| D | `Inicio` | |
| E | `Fin` | |
| F | `Dias` | |
| G | **`Vocero`** | |
| H | `Telefono` | |
| I | `Nombre campaña \| Directa` | |
| J | `Audiencia` | |
| **K** | ⚠ `"Llamados\nRealizados"` | `Llamados Realizados` |
| **L** | ⚠ `"Llamados\nAtendidos"` | `Llamados Atendidos` |
| **M** | ⚠ `"%\nAtendidos"` | `% Atendidos` |
| **N** | ⚠ `"Escucharon\n +75%"` | `Escucharon +75%` |
| **O** | ⚠ `"%\n+75%"` | `% +75%` |
| P | `Marque 1` | |
| **Q** | ⚠ `"%\nMarque 1"` | `% Marque 1` |
| R | `Segmentacion` | |
| S | `Área` | |
| T | `Eje` | |
| U | `Audio` | |
| V | `Nomenclatura` | |
| W | `semana` | |
| X | `semana_año` | |
| Y | `mes_nro` | |
| Z | `mes_nro_año` | |
| AA | `mes_texto` | |
| AB | `año` | |
| AC | `Nombre campaña Mail` | |
| AD | `Nombre campaña \| Cuentas` | |
| AE | `Herramienta` | |

⭐⭐ **Los seis saltos de línea existen y están medidos, con el `JSON.stringify` que los hace
visibles.** `N` trae además **un espacio antes del `+`** — `"Escucharon\n +75%"`, que `R-10` colapsa
a `Escucharon +75%`.

⛔ **Esto es lo que `MAPEO.encabezado` tiene que llevar como testigo, y se COPIA de esta tabla, no
se tipea.** Un testigo tipeado a mano sobre uno de estos seis nace desalineado y **no falla nada**
(`D-31`: el encabezado es testigo, nunca fallback).

⚠ **`Vocero` está en `G`**, la misma letra que en `digital/Directa IVR`. Que coincidan **no prueba
que sean la misma tabla** — el usuario declaró que ésta es **acumulado**, y eso sigue sin medirse.

### Filas con dato por columna — sobre 196

| conteo | columnas |
|---|---|
| **196** | todas menos las tres de abajo |
| **194** | U `Audio` |
| **190** | AC `Nombre campaña Mail` |
| **186** | V `Nomenclatura` |

`conteos distintos entre columnas: 4 (186, 190, 194, 196)`

---

## `M2 - Gráficos2` — 1000 × 11

### Encabezados

`A Año` · `B Semana` · `C Entregados` · `D Aperturas` · `E Clics` · `F Promedio` ·
`G Entregados / 1000` · `H Implementados` · `I Proyectos` · `J Promedio2` · `K Proyectos2`

Ninguno trae saltos de línea. ✅ El `7 + 4 = 11` que el `2026-09-07_1` declaraba **se confirma**.

### Filas con dato por columna — sobre 999

**37** en diez columnas · **36** en `H Implementados`. `conteos distintos: 2 (36, 37)`

⛔ **La premisa del `2026-09-07_1` sobre esta solapa NO se sostiene.** Declaraba *«un bloque `A:G`
filtrado a 2026 y cuatro columnas sin filtrar, **de largo distinto**»*, y el conteo por columna —que
existe justamente para eso— muestra **37 contra 36**: una fila de diferencia, no dos bloques
desalineados. **El conteo por columna sirvió: sólo que la respuesta fue que no hacía falta.**

⚠ **Y una trampa de lectura para quien la mapee: `getLastRow()` devuelve 1000 y hay 37 filas con
dato.** Los 999 renglones restantes son el rango de derrame de las fórmulas. Quien lea esta solapa
sin mirar los conteos por columna va a creer que tiene 999 filas.

---

## Lo que este censo NO contesta

- ⛔ **Si `IVR` es la misma tabla que `digital/Directa IVR`.** Coinciden en `Vocero` en la columna
  `G` y en 31 columnas, pero el usuario declaró que ésta es **acumulado** — y eso **no está medido**.
- ⛔ **Cuál de las tres solapas de Call Center sirve** — `Call Center - Métricas`,
  `Call Center - Campañas`, `Consolidado`. Sólo la primera está medida
  (`MEDICION_universo_call_center_2026-09-08.md`).
- ⛔ **Qué `fila_encabezado` lleva cada una de las doce sin fila de títulos.**
- ⛔ **Nada sobre `Mail` ni `SMS`**, que existen y no se dan de alta ahora.
