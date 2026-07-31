# Paso 2.10 — Partes B y C, verificadas contra el repo y contra los archivos del 31/07

**reemplaza:** `Paso-2.10_anclar_a_numeros_verificados.md` (Partes B y C — el original no
se edita, ver `docs/PROPUESTA_orden_documental.md` Tarea 2 Caso 3, corrección DOC-5 Parte 2)

> Reemplaza las Partes B y C de `Paso-2.10_anclar_a_numeros_verificados.md`.
> Repo leído en `852f79b`. Bases: las cuatro descargadas el 31/07.
> **Trabajamos en español.**

---

## 0. Estado del repo: nada del 2.10 está hecho

| parte | estado | evidencia |
|---|---|---|
| A · incorporar validación | **no hecha** | no existen `docs/VALIDACION_2026-07-31.md`, `docs/casos_validacion_2026-07-31.csv`, `docs/Prompts/Paso-2.10*`, ni `docs/Sesiones/HANDOFF_2026-07-31-2.md` |
| B · `filas_datos` | **no hecha** | `Solapas.gs:61` → `Math.max(hojaSheet.getLastRow() - 1, 0)`. `HEADERS` de `SOLAPAS` no tiene `filas_crudas` |
| C · solapas `periodo` | **no hecha** | ver §2 — es más caro de lo que dice el prompt |
| D · hoja `VALIDACION` | **no hecha** | no existe la hoja ni `menuCorrerValidacion_` |
| E · corte vertical | **apunta a Retiro** | `Codigo.gs:34` → `menuCorteVerticalRetiro2407_`; `Marcadores.gs:21` documenta los diez tokens de Retiro |
| F · reglas nuevas | **no hecha, y hay colisión de numeración** | ver §3 |
| G · `REUNIONES` | **no hecha** | `Instalar.gs:156` → `['orden','eje','tipo','nombre','fecha','etapa','mostrar','texto_original','notas']`. Sin `bloque`, sin `orden_informe`; `mostrar` sin `pendiente` |
| R-05 · `fecha_corte` | **no hecha** | `Snapshot.gs` sigue siendo un comentario de 5 líneas con *"Se completa en: Paso 9"* |

---

## 1. Corrección a mi análisis anterior: la brecha de `looker` YA estaba resuelta

En la versión previa de este documento afirmé que las 899 filas sin fecha de `looker` eran
un bug de `MAPEO` apuntando a una columna inexistente. **Era falso**, y el repo lo dice
desde el commit `ac39876`.

Medido sobre `Base Looker.xlsx`:

```
resumen_metricas             → 905 filas · fecha_inicio:  899 vacías, 6 fechas válidas
resumen_metricas_dinamico    → 905 filas · fecha_inicio:  905 fechas válidas, 0 vacías
```

Las 899 son de **`resumen_metricas`**, el pegado estático — no de `resumen_metricas_dinamico`.
`Instalar.gs:550` ya lo documenta y la fuente ya está movida al dinámico (S-01). `MAPEO`
apunta a `resumen_metricas_dinamico` columna C = `fecha_inicio`, que es correcto.

**La brecha de `looker` está cerrada y bien cerrada. No hay tarea B-5.** Retiro la propuesta.

> El error es del mismo tipo que el paso viene persiguiendo: 899 sobre 905 filas es un
> número perfectamente plausible para "el motor no lee las fechas", y lo era también para
> "la solapa equivocada no tiene fechas". La diferencia sólo aparece abriendo las dos
> solapas y comparando.

---

## Parte B — `filas_datos` cuenta filas vacías

### Advertencia: `filas_crudas` no significa lo mismo en `.xlsx` que en Sheets

Los conteos de abajo salen de los `.xlsx`. **No son comparables con `getLastRow()`**:

- En Sheets, `getLastRow()` corta en la última fila con contenido, y una fórmula que
  evalúa a `""` **cuenta como contenido**.
- El `.xlsx` arrastra además el rango con formato aplicado, que suele ser mayor.

`digital/Digital` da **1711** en el `.xlsx` y el motor reportó **1297**. Las dos son
correctas para su medio. **Sólo `filas_datos` es comparable**, y es contra lo único que se
deben validar estos números.

### Precisión sobre la definición

Contar "filas con alguna celda no vacía tras `trim()`" **incluye encabezados y fila de
período**. En `M2 periodo DIRECTA` eso da **20**, no 18:

```
fila 1     'Periodo: ' | 03/07 | 10/07     ← período escrito a mano
fila 2     vacía
fila 3     ID | Nombre de la campaña | …   ← encabezados
filas 4–21                                 ← 18 filas de datos
```

Si el criterio dice 18 y la implementación reporta 20, alguien lo va a "arreglar" restando
2 en el lugar equivocado. Hay que elegir una definición y escribirla en el comentario:

- **`filas_datos` = filas no vacías** → esperar **20**. `SOLAPAS` ya tiene `fila_encabezado`,
  así que el resto del motor puede derivar el detalle. **Recomendada.**
- **`filas_datos` = filas no vacías bajo el encabezado** → esperar **18**, pero depende de
  detectar encabezado, y `Mail per` **no tiene fila de títulos**: los datos arrancan en la 2.

### Tarea 4 — las tres brechas: dos causas distintas y una ya cerrada

| brecha | veredicto | evidencia |
|---|---|---|
| **`rdv` 720/1362** | ✅ **relleno de fórmula** | `RVD JM-CM - ES`: 1363 crudas → **721** no vacías = 1 encabezado + **720** de datos. El lector devolvió 720 porque hay 720. |
| **`digital` 960/1297** | ❌ **no es relleno de fórmula** | `digital/Digital`: 1294 filas de datos, **334 sin `ID Cuentas`**. 1294 − 334 = **960** exacto. |
| **`looker` 903 / 899 sin fecha** | ✅ **ya cerrada en `ac39876`** | era `resumen_metricas`, no el dinámico. Ver §1. |

**Sobre las 334 de `digital`:** esas filas **sí tienen métricas** — `Impresiones` tiene una
sola celda vacía en las 1294. Son 334 filas con datos y sin identificador: el **26% de la
solapa**. Es el caso C-2 / R-04 a una escala mucho mayor que la fila única de 1-11-14 que
motivó la regla.

`menuDiagnosticarFilasSinClaveDigital_` ya existe (Paso 2.8 Parte E) y `leerFuente` ya
reporta `filas_sin_clave` como conteo informativo. Lo que falta es que deje de ser
informativo: **334 filas con métricas y sin clave tienen que dar ⚠ en el diagnóstico**, no
una nota al pie.

### Criterio de aceptación (ampliado)

`SOLAPAS` reporta, contra estos valores medidos el 31/07:

| base | solapa | filas_datos |
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

Una fila que no dé ±3 (deriva de un día) es un hallazgo, no un ajuste.

---

## Parte C — Las solapas `periodo` bajan a `referencia`

### 2.1 Son SEIS solapas, no cuatro

`VALIDACION §1.2` y la Parte C listan cuatro. Hay dos más en `digital` con la misma
patología, que quedarían vivas:

| # | base | solapa | período en el archivo | filas_datos | ¿en el prompt? |
|---|---|---|---|---|---|
| 1 | `m2` | `M2 periodo DIRECTA` | 03/07 → 10/07 | 20 | sí |
| 2 | `m2` | `M2 periodo DIGITAL` | 22/05 → 29/05 | 15 | sí |
| 3 | `m2` | `Mail per` | 03/07 → 10/07 | 73 | sí |
| 4 | `digital` | `Mail per` | 10/07 → 11/07 | 6 | sí |
| 5 | `digital` | **`Buscador por periodo digital`** | **10/07 → 17/07** | 61 | **NO** |
| 6 | `digital` | **`Buscador por periodo directa`** | **10/07 → 11/07** | 8 | **NO** |

Las dos nuevas guardan el período en la **fila 2**, bajo encabezados `Periodo | Desde | Hasta`
en la fila 1, en vez de en la fila 1 como las otras cuatro. Misma mecánica, distinta
disposición — probablemente por eso se pasaron por alto.

**Cinco ventanas distintas entre seis solapas, ninguna la del informe (24–30/07).**

### 2.2 Las originales, verificadas

Las seis vistas `periodo` no contienen ningún dato que no esté en una tabla original. Medido:

```
Mail per                            72 filas · 3.553.236 enviados
Directa mail filtrada 03/07-10/07   72 filas · 3.553.236 enviados
mismos ID MailUp: True — cero filas de diferencia
```

`Mail per` es literalmente `Directa mail` recortada por las dos celdas de su fila 1. Mismo
layout de 26 columnas, mismas métricas en las posiciones 13–18, pero **sin fila de títulos**.

| familia | solapa original | filas | encabezados | fila de período |
|---|---|---|---|---|
| digital | `CAMPAÑAS_DESGLOCE_DIGITAL` | 4.570 | sí | no |
| mail | `Directa Mail` (`digital`) | 2.107 | sí | no |

Las dos son mapeables por nombre de columna y ya están en uso: `CAMPAÑAS_DESGLOCE_DIGITAL`
en los casos V-21 a V-26, `Directa Mail` en V-12 a V-15 y V-27 a V-32. Todos verdes.

**`m2/Directa mail` (2.106) es espejo de `digital/Directa Mail` (2.107).** Declarar la de
`digital` como `fuente` y la de `m2` como `derivada`, para que no queden las dos vivas
dando números casi iguales.

### 2.3 `m2` no se reapunta: se declara sin fuente

`M2 digital` y `Seguimiento digital` **no tienen columnas de métricas** — son catálogos de
identidad de campaña y banderas de plataforma. No pueden ser destino del mapeo.

Y `M2 periodo DIRECTA` no es un filtro por fecha: es un `GROUP BY id_cuenta` sobre el
catálogo `M2 Directa`. Verificado — los 18 `ID` de la vista son **exactamente** los 18
`ID cuentas` distintos de las 26 filas del catálogo, intersección perfecta en ambos
sentidos. Las 26 son piezas (Pre / Durante / Post); las 18 son campañas. La lámina que dice
"18 envíos" en realidad muestra 18 campañas: el detalle de esas 18 tiene 249 envíos.

Además el catálogo **se sobrescribe cada semana y no tiene historia**: hoy contiene las
campañas de principios de julio y suma 961.242, no los 995.194 del informe. Por eso el
"test de un minuto" de `VALIDACION §1.2` no puede funcionar — mover las celdas a 24–30/07
deja las mismas 18 campañas viejas.

**Consecuencia:** ningún caso de `casos_validacion_2026-07-31.csv` usa `m2` (las 43 filas
con traza son 20 `digital`, 16 `rdv`, 7 `looker`; `m2` aparece solo en X-02, `sin_fuente`).
Bajar las seis vistas no rompe ninguna validación.

Entonces **no reapuntar `MAPEO` a nada**. Dejar las 9 filas de `m2` emitiendo
`«FALTA:token»` y declarar `m2` como `sin_fuente`, igual que X-02, hasta que se decida si
la lista curada de campañas M2 vive en `CAMPANAS`. Apuntarla a `M2 Directa` (sin métricas)
o a `Directa Mail` (sin saber cuáles son M2) daría un número plausible.

### 2.4 Tarea (corregida)

1. En `SEED_SOLAPAS_`, poner **las seis** vistas `periodo` en `uso=referencia`,
   `origen=seed`, `notas='vista con período manual en celda editable — no es fuente;
   ver VALIDACION_2026-07-31 §1.2'`.
2. Sacar `M2 periodo DIRECTA` / `M2 periodo DIGITAL` de `SOLAPAS_M2_INVERTIDAS_`, o cambiar
   su destino de `derivada` a `referencia`.
3. Declarar `digital/Directa Mail` como `fuente` y `m2/Directa mail` como `derivada`.
4. **No tocar las filas de `MAPEO` de `m2`.** Dejar constancia en `SOLAPAS.notas` de que
   `m2` queda sin fuente y por qué (ver §2.3).
5. `BASES.m2.hoja_default` queda apuntando a una solapa `referencia`: cambiarlo a vacío o
   marcar la base `activo=no` con nota, para que el fallo sea visible y no silencioso.
6. La siembra pisa `auto` y `seed`, **nunca `manual`**.

### 2.5 Criterio de aceptación (corregido)

- Las 9 solapas en `revisar` bajan a **3**.
- Ninguna fila de `MAPEO` activa lee una solapa con período manual.
- Los tokens `m2_*` emiten `«FALTA:token»` — **visible, no cero**.
- Los 43 casos con traza de `VALIDACION` siguen resolviendo: ninguno depende de `m2`.

---

## 3. Parte F: colisión de numeración

`docs/REGLAS_NEGOCIO.md` ya tiene:

```
R-01  Un encuentro por Figura por día
R-02  Criterio de fuente cruda (exclusión de solapas)
R-03  Rango plausible de una columna de fecha
C-01  La plantilla es del equipo, el motor se adapta
R-04  El temario define el universo, no la fecha
```

El 2.10 propone agregar **R-03** (agregado JM/GCBA), **R-04** (el id manda) y **R-05**
(`fecha_corte`). Los dos primeros pisan reglas existentes con contenido distinto.

**Renumerar a R-05, R-06 y R-07**, y agregar la que falta:

- **R-08 · El vínculo reunión ↔ cuenta es curado, no derivable.**
  `rdv` fila 709 dice `Encuentro Temático "Orden Público" – Eje Norte`, 28/07.
  `digital/Directa Mail` cuenta `3387-JULJDGGC` dice `Te Cuento Bs As 21/7 Orden Público
  Eje Norte`. Ni la fecha (el encuentro se movió del 21 al 28 y el nombre de la cuenta
  quedó viejo) ni el nombre permiten el join. Y existe una cuenta predecesora **cancelada**,
  `3347-JULJDGAG`, con texto casi idéntico: un match difuso levanta las dos y duplica.
  R-06 dice que el nombre no decide pertenencia *dentro* de una cuenta; R-08 dice que
  tampoco decide *qué cuenta es de qué reunión*. `REUNIONES` necesita `id_cuenta` y
  —por `VALIDACION §3.3`— también `id_envio`.

Esto toca la Parte E: sin R-08 resuelta, `enc_mails_enviados` no tiene cómo llegar a la
fila del 25/07 salvo cableada a mano.
