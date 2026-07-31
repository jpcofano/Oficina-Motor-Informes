# Paso 2.10 — Partes B y C, versión verificada contra los archivos del 31/07

> Reemplaza las Partes B y C de `Paso-2.10_anclar_a_numeros_verificados.md`.
> Todo lo de acá está medido sobre las cuatro bases descargadas el 31/07, no inferido.
> **Trabajamos en español.**

---

## Advertencia previa: `filas_crudas` no significa lo mismo en `.xlsx` que en Sheets

Los conteos de abajo salen de los `.xlsx` descargados. **La columna "crudas" del `.xlsx` no
es comparable con `getDataRange().getNumRows()` de Apps Script**, y confundirlas produce
exactamente el tipo de número plausible que este proyecto viene persiguiendo:

- En Sheets, `getDataRange()` corta en la última fila con contenido. Una celda con fórmula
  que evalúa a `""` **cuenta como contenido**.
- El export a `.xlsx` arrastra además el rango con formato aplicado, que suele ser mayor.

Caso concreto: `digital/Digital` da **1711** filas en el `.xlsx` y el motor reportó **1297**.
Las dos son correctas para su medio. `filas_datos` (filas con al menos una celda no vacía
tras `trim()`) **sí** es comparable entre ambos, y es la única columna contra la que se
deben validar estos números.

---

## Parte B — `filas_datos` cuenta filas vacías

### Sin cambios respecto del original

Tareas 1, 2 y 3 quedan como estaban. `filas_datos` = filas con al menos una celda no vacía
tras `trim()`; `filas_crudas` al lado; guardarraíl recalibrado con ⚠ bajo 90%.

### Precisión que hay que agregar a la tarea 1

Contar "filas con alguna celda no vacía" **incluye las filas de encabezado y las filas de
período**. En `M2 periodo DIRECTA` eso da **20**, no 18:

```
fila 1  → 'Periodo: ' | 03/07 | 10/07     ← período escrito a mano
fila 2  → vacía
fila 3  → ID | Nombre de la campaña | ...  ← encabezados
filas 4–21 → 18 filas de datos
```

Si el criterio de aceptación dice `filas_datos=18` y la implementación reporta 20, alguien
va a "arreglarlo" restando 2 en el lugar equivocado. Elegir una de las dos definiciones y
escribirla en el comentario:

- **`filas_datos` = filas no vacías** → esperar **20**, y que `SOLAPAS` lleve además
  `fila_encabezado` para que el resto del motor sepa dónde empieza el detalle.
- **`filas_datos` = filas no vacías por debajo del encabezado** → esperar **18**, y
  entonces `filas_datos` depende de detectar el encabezado, que en `Mail per` **no existe**
  (los datos arrancan en la fila 2, sin fila de títulos).

Recomendación: la primera. `Mail per` demuestra que no se puede asumir encabezado.

### Tarea 4 — las tres brechas: son tres causas distintas, no una

Esto es lo que el prompt pedía dejar abierto o cerrar sin inventar. Está medido:

| brecha | veredicto | evidencia |
|---|---|---|
| **`rdv` 720/1362** | ✅ **CERRADA — relleno de fórmula** | `rdv/RVD JM-CM - ES`: 1363 crudas, **721** no vacías = 1 encabezado + **720** de datos. El lector devolvió 720 porque hay 720. |
| **`digital` 960/1297** | ❌ **NO es relleno de fórmula** | `digital/Digital`: 1294 filas de datos, de las cuales **334 no tienen `ID Cuentas`**. 1294 − 334 = **960** exacto. |
| **`looker` 903 «899 sin fecha»** | ❌ **NO es un problema del dato — es del motor** | `looker/resumen_metricas_dinamico`: **905 filas, 905 con `fecha_inicio` y `fecha_fin` como `datetime` válido. Cero vacías, cero texto.** |

**Sobre `digital` (334 sin clave):** las mismas 334 filas **sí tienen métricas** — la
columna `Impresiones` tiene una sola celda vacía en toda la solapa. Son 334 filas con datos
y sin identificador, el 26% de la solapa. Es el **caso C-2 / R-04 a escala**, mucho mayor que
la fila única de 1-11-14 que motivó la regla. El control de "filas con métricas y sin
`id_cuenta` válido" que propone R-04 hay que implementarlo en este paso, no más adelante:
es lo que convierte estas 334 filas de brecha silenciosa en un ⚠ visible.

**Sobre `looker` (899 sin fecha):** el archivo no tiene ninguna fila sin fecha. La hipótesis
más probable es que `MAPEO` apunte a una columna llamada `fecha` que **no existe**: los
nombres reales son `fecha_inicio` y `fecha_fin`. Un lector que busca un encabezado inexistente
devuelve vacío para todas las filas y el filtro por ventana las descarta a todas.

> **Tarea nueva B-5:** verificar que toda fila de `MAPEO` con `columna_fecha` referencie un
> encabezado que exista en la solapa destino. Si no existe, `«FALTA:columna»` y ⚠ en el
> diagnóstico — nunca fila descartada en silencio. Este control habría cazado las tres
> brechas de un saque.

### Criterio de aceptación (ampliado)

`SOLAPAS` reporta, contra estos valores medidos:

| base | solapa | filas_datos esperado |
|---|---|---|
| `m2` | `M2 periodo DIRECTA` | **20** |
| `m2` | `M2 periodo DIGITAL` | **15** |
| `m2` | `M2 Directa` | **27** |
| `m2` | `Mail per` | **73** |
| `rdv` | `RVD JM-CM - ES` | **721** |
| `digital` | `Digital` | **1295** |
| `digital` | `Directa Mail` | **2107** |
| `digital` | `Directa IVR` | **57** |
| `digital` | `CAMPAÑAS_DESGLOCE_DIGITAL` | **4570** |
| `digital` | `Mail per` | **6** |
| `looker` | `resumen_metricas_dinamico` | **906** |
| `looker` | `MAIL` | **5750** |

Y el diagnóstico deja de reportar un colapso que no existe. Una fila esperada que no dé
±3 (deriva de un día) es un hallazgo, no un ajuste.

---

## Parte C — Las solapas `periodo` bajan a `referencia`

### Corrección: son SEIS solapas, no cuatro

`VALIDACION §1.2` y la Parte C listan cuatro. Hay dos más en `digital` con la misma
patología —recorte escrito a mano en celdas editables— que quedarían vivas como `uso=fuente`:

| # | base | solapa | período en el archivo | filas_datos | ¿estaba en el prompt? |
|---|---|---|---|---|---|
| 1 | `m2` | `M2 periodo DIRECTA` | 03/07 → 10/07 | 20 | sí |
| 2 | `m2` | `M2 periodo DIGITAL` | 22/05 → 29/05 | 15 | sí |
| 3 | `m2` | `Mail per` | 03/07 → 10/07 | 73 | sí |
| 4 | `digital` | `Mail per` | 10/07 → 11/07 | 6 | sí |
| 5 | `digital` | **`Buscador por periodo digital`** | **10/07 → 17/07** | 61 | **NO** |
| 6 | `digital` | **`Buscador por periodo directa`** | **10/07 → 11/07** | 8 | **NO** |

Las dos nuevas guardan el período en la **fila 2** bajo encabezados `Periodo | Desde | Hasta`
en la fila 1, en vez de en la fila 1 como las otras cuatro. Misma mecánica, distinta
disposición — probablemente por eso se pasaron por alto.

**Cinco ventanas distintas entre seis solapas, ninguna la del informe (24–30/07).**

### Tarea (corregida)

1. En `SEED_SOLAPAS_`, poner **las seis** en `uso=referencia`, `origen=seed`, con
   `notas='vista con período manual en celda editable — no es fuente; ver VALIDACION_2026-07-31 §1.2'`.
2. Verificar que ninguna fila de `MAPEO` apunte a esas **seis**. Reapuntar a la tabla de
   detalle: `m2/M2 Directa`, `digital/Directa Mail`, `digital/Digital`.
3. La siembra pisa `auto` y `seed`, **nunca `manual`**.

### Criterio de aceptación (corregido)

Las 9 solapas en `revisar` bajan a **3**, no a 5. Ninguna fila de `MAPEO` lee una solapa con
período manual.

---

## Hallazgo lateral que conviene registrar antes de la Parte E

El corte vertical de la Parte E cablea `enc_mails_enviados` a `digital/Directa Mail`,
`id 3387 + fecha 25/07`. Verificado: la fila existe y da 44.043 / 43.439 / 4.652 / 145,
exacto.

Pero el vínculo entre esa cuenta y la reunión **no es derivable de ningún dato**:

- `rdv/RVD JM-CM - ES` fila 709 → `Encuentro Temático "Orden Público" – Eje Norte`, **28/07**
- `digital/Directa Mail` cuenta `3387-JULJDGGC` → `Te Cuento Bs As 21/7 Orden Público Eje Norte`

Ni la fecha (21/7 contra 28/07 — el encuentro se movió y el nombre de la cuenta quedó viejo)
ni el nombre (`Encuentro Temático` contra `Te Cuento Bs As`) permiten el join. Peor: existe
una cuenta predecesora cancelada, **`3347-JULJDGAG`**, con el texto casi idéntico
`Te Cuento Bs As 21/7 Orden Público Eje Norte`. Un match difuso por nombre levanta las dos y
duplica.

**Consecuencia:** `REUNIONES` necesita `id_cuenta` como columna curada, y —por §3.3— también
qué envío (`ID MailUp`). Es la misma familia que R-04, pero en la dirección contraria: R-04
dice que el nombre nunca decide pertenencia dentro de una cuenta; esto dice que **tampoco
decide qué cuenta pertenece a qué reunión**. Vale escribirlo como R-06.
