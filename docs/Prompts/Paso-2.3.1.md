# Paso 2.3.1 — Detección de columnas de fecha y contrato `fecha_periodo`

> Va **después del Paso 2.3** y **antes del 2.4**. El 2.4 (unión de `digital` por
> `id_cuenta`) también va a filtrar por ventana, así que esto es prerequisito.
> **Trabajamos en español.** Un paso = un test verificado = un commit.

---

## Problema

Ninguna base tiene declarada cuál es su columna de fecha. El filtrado por ventana de
período (Paso 2) hoy no tiene de dónde leerla.

Detectar las columnas de fecha es trivial. **Elegir cuál es la buena, no.** Casi toda
base tiene más de una: `fecha_carga` / `fecha_encuentro` / `fecha_actualizacion` en RDV,
`fecha_publicacion` / `fecha_reporte` en digital. Filtrar con la equivocada no rompe
nada: devuelve otro universo de filas, en silencio. Es el mismo tipo peligroso que el
`135` y que las fechas hardcodeadas de SECCO.

**Por eso: detección automática, elección humana.** Misma forma que `CAMPANAS`.

---

## Alcance

- **NO** se tocan plantillas ni Slides.
- **NO** se calcula ningún marcador. El conteo del diagnóstico (`% de fechas`, mín, máx)
  es clasificación de tipos, no aritmética de negocio: vive en el módulo nuevo, **no**
  en `Marcadores.gs`. La regla de oro sigue intacta.
- Se toca: módulo nuevo `Fechas.gs`, hoja nueva `DIAG_FECHAS`, filas nuevas en `MAPEO`,
  y el punto del lector de datos que hoy resuelve la columna de fecha.

---

## A) `detectarColumnasFecha()` — diagnóstico

Recorre **todas** las bases de `BASES` (por `sheet_id`, nunca por nombre) y **todas** las
solapas de cada una. Por cada columna:

- Lee encabezado + hasta **200 filas** de datos (`Math.min(getLastRow()-1, 200)`). No
  traer la base entera.
- Clasifica: `n_fechas` = valores que son `instanceof Date` válidos. `n_texto_fecha` =
  strings que matchean `^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$`.
- Es **candidata** si `(n_fechas + n_texto_fecha) / n_no_vacios >= 0.8`.

Vuelca el resultado en la hoja `DIAG_FECHAS` del spreadsheet de control (la crea si no
existe, la limpia y reescribe en cada corrida):

| columna | contenido |
|---|---|
| `base_id` | id lógico de la fila de `BASES` |
| `sheet_id` | id del spreadsheet |
| `solapa` | nombre de la solapa |
| `col_letra` | A, B, C… |
| `encabezado` | texto del encabezado |
| `tipo` | `FECHA` (nativa) o `TEXTO` (parece fecha pero es string) |
| `pct_fecha` | % sobre no vacíos |
| `fecha_min` / `fecha_max` | solo si `tipo=FECHA` |
| `muestra1..3` | tres valores crudos |
| `elegida` | **vacía — la completa el usuario con `sí`** |

**`tipo=TEXTO` se reporta pero no se elige.** Parsear fechas en texto es ambiguo
(`03/04` puede ser 3 de abril o 4 de marzo) y no vale el riesgo. Si la columna buena es
TEXTO, se arregla en la base de origen convirtiéndola a fecha nativa, y se vuelve a
correr la detección. Si el usuario igual marca `elegida=sí` sobre una fila `TEXTO`, la
promoción (B) la rechaza con mensaje explícito.

`fecha_min` / `fecha_max` son la señal que desempata: la columna de negocio tiene rango
amplio y continuo; la de sistema tiene todo apelotonado cerca de la fecha de carga.

## B) `promoverFechasElegidas()` — cierre del loop

Lee `DIAG_FECHAS`, toma las filas con `elegida = sí`, y escribe/actualiza en `MAPEO` una
fila por **base+solapa** con `campo_logico = fecha_periodo` apuntando al encabezado
elegido.

- Va a `MAPEO`, **no** a una columna nueva en `BASES`: hay bases con varias solapas y
  cada solapa puede tener su propia fecha.
- **Respetar el esquema actual de `MAPEO`.** Si las columnas reales no permiten expresar
  esto tal cual, **no inventar columnas ni hojas**: reportarlo y frenar.
- Si hay **dos filas `elegida=sí` para la misma base+solapa**, error explícito y no
  escribe nada. Una sola fecha de período por solapa.
- Idempotente: correrla dos veces no duplica filas.

## C) Consumo en el lector de datos

Donde hoy se resuelve la columna de fecha para filtrar la ventana:

1. Leer `fecha_periodo` desde `MAPEO` para esa base+solapa.
2. **Si no existe la fila, fallar con `«FALTA:fecha_periodo@{base_id}/{solapa}»`.**
   Nunca devolver la base sin filtrar — ese es el modo de falla realmente caro: no
   avisa, y el informe sale con datos de todos los períodos.
3. **Normalizar antes de comparar.** Convertir tanto el valor de la celda como los
   bordes de la ventana con
   `Utilities.formatDate(v, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd')` y comparar los
   strings. Con UTC-3, un `Date` de medianoche comparado crudo contra el borde se come o
   agrega un día en los extremos de cada ventana.
4. **Bordes inclusivos de los dos lados** (`desde <= f <= hasta`). Documentarlo en
   `docs/TOKENS.md`. Si no queda fijado, el mismo registro entra en dos períodos o en
   ninguno según quién escribió el filtro.

## D) Menú

Dos ítems nuevos: `Detectar columnas de fecha` y `Promover fechas elegidas`, en el mismo
bloque de utilidades de registro.

---

## Test de verificación (el usuario lo corre antes del commit)

1. Correr `detectarColumnasFecha()`. `DIAG_FECHAS` tiene ≥1 candidata por cada base de
   `BASES`. Si alguna base queda sin candidatas, eso también es un hallazgo: anotarlo.
2. Revisar mín/máx y elegir a mano. Marcar `elegida = sí`.
3. Correr `promoverFechasElegidas()`. Verificar las filas en `MAPEO`.
4. Correrla de nuevo: no debe duplicar.
5. Marcar dos filas `sí` en la misma solapa a propósito → tiene que fallar con mensaje
   claro. Deshacer.
6. Leer una base con ventana conocida y contar filas contra el conteo hecho a mano en la
   base. Probar **un registro exactamente en cada borde** de la ventana: los dos tienen
   que entrar.
7. Borrar la fila de `fecha_periodo` de una base y leerla → tiene que salir
   `«FALTA:fecha_periodo@…»`, no la base entera.

---

## Fuera de alcance

- Bases sin ninguna columna de fecha: se listan como pendiente, no se resuelven acá.
- Fechas hardcodeadas en las plantillas SECCO (slides 3, 24, 25): siguen en
  `PENDIENTES_consistencia.md`.
