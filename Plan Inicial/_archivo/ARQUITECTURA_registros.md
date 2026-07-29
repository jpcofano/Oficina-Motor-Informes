# Arquitectura de registros — bases y plantillas extensibles

> Principio: **agregar una base o una plantilla = agregar una fila, no tocar código.**
> El motor no nombra ninguna base ni plantilla en el código: las descubre leyendo
> las hojas-registro y las referencia por un ID lógico (`base_id`, `informe_id`).
> La aritmética sigue viviendo solo en `Marcadores.gs` (regla de oro).

Esto pasa las hojas de config de **5 a 6** (se agrega `BASES`).

---

## Las 6 hojas y su rol

### CONFIG — ajustes globales (clave/valor)
Solo lo transversal. **Ya NO tiene IDs de bases ni de plantillas.**

| clave | ejemplo |
|---|---|
| `periodo_desde` | 2026-06-26 |
| `periodo_hasta` | 2026-07-03 |
| `informe_activo` | `jm` (o vacío = todos los activos) |
| `carpeta_salida` | ID de carpeta Drive donde se guardan los Slides generados |

### BASES — registro de fuentes en vivo (una fila por base) 🆕
Acá se "enchufan" los datos. Agregar base = agregar fila.

| base_id | nombre | sheet_id | hoja_default | tipo | activo | notas |
|---|---|---|---|---|---|---|
| `rdv` | RDV JM CM ES | `1AbC…` | RVD JM-CM - ES | google_sheets | sí | Encuentros |
| `digital` | Seguimiento Digital | `1DeF…` | Digital | google_sheets | sí | Campaña por canal |
| `looker` | Base Looker | `1GhI…` | resumen_metricas | google_sheets | sí | Consolidado |
| `m2` | M2 Reporte 2026 | `1JkL…` | (a confirmar) | google_sheets | sí | Familia `m2_*` |
| `miba` | Integración MiBA | | | google_sheets | **no** | Parqueada |

> `sheet_id` es el ID de la **Google Sheet en vivo** (no el `.xlsx`). Ver §"Nota Sheets vs Excel".

### INFORMES — registro de plantillas/informes (una fila por informe)
Agregar informe = agregar fila apuntando a su Slides marcado.

| informe_id | nombre | plantilla_id | periodicidad | familias | activo | notas |
|---|---|---|---|---|---|---|
| `jm` | Informe semanal JM | `1SlidesJM…` | semanal | ecv,enc,m2,camp,mail,gcba,rrss | sí | 22 slides |
| `secco` | Seguimiento SECCO-SSCDI | `1SlidesSECCO…` | mensual | ecv,et,emin,m2,camp,conv,rep,rrss | sí | 29 slides |

### MARCADORES — un token por fila
Cada token dice de qué base sale y qué función lo calcula.

| marcador | familia | informe_id | base_id | campo_logico | calculo | formato | notas |
|---|---|---|---|---|---|---|---|
| `ecv_inscriptos` | ecv | `*` | rdv | inscriptos | `calcInscriptos` | numero | `*` = compartido |
| `camp_alcance` | camp | `*` | looker | alcance | `calcAlcance` | miles | |
| `m2_envios` | m2 | jm | m2 | envios | `calcEnvios` | numero | |

- `informe_id = *` → marcador compartido por todos los informes.
- `calculo` → nombre de la función en `Marcadores.gs`.

### MAPEO — campo lógico → columna física (por base)
Desacopla el nombre lógico de la columna real. Si la base cambia una columna,
se corrige acá, no en el código.

| base_id | campo_logico | hoja | columna | notas |
|---|---|---|---|---|
| rdv | inscriptos | RVD JM-CM - ES | H | |
| digital | alcance | Digital | E | |

### CAMPANAS — campañas seleccionables
| campana_id | nombre | informe_id | base_id | tipo | mostrar | orden |
|---|---|---|---|---|---|---|
| serv_esenciales | Servicios esenciales | secco | looker | destacada | sí | 1 |
| encuentros_min | Encuentros de ministros | secco | rdv | encuentro_ministros | sí | 2 |
| prov_uber | Uber | secco | digital | proveedor | no | 3 |

`tipo` define qué plantilla de slide repetible consume cada campaña.

---

## Recetas de extensión (cero o mínimo código)

**Agregar una BASE nueva:**
1. Fila en `BASES` (base_id, sheet_id, hoja).
2. Filas en `MAPEO` para los campos lógicos que uses de esa base.
3. Listo. Cero código.

**Agregar una PLANTILLA / INFORME nuevo:**
1. Marcar el pptx/Slides con `{{tokens}}` (como hicimos con JM y SECCO).
2. Fila en `INFORMES` apuntando al `plantilla_id`.
3. Filas en `MARCADORES` para sus tokens (reusando familias existentes donde se pueda).
4. Si un token usa un cálculo que **ya existe** en `Marcadores.gs` → cero código.
   Si trae una métrica nueva → se agrega **una función** en `Marcadores.gs`
   (única excepción permitida por la regla de oro).

**Agregar una CAMPAÑA seleccionable:**
1. Fila en `CAMPANAS` (tipo + base_id + mostrar).

---

## Nota: Sheets vs Excel (importante)
`SpreadsheetApp.openById()` abre **Google Sheets nativas**, no `.xlsx`. Las bases
deben estar convertidas a Google Sheets y el `sheet_id` de BASES debe ser el de
esa versión viva. Los `.xlsx` de `docs/samples/Datos/` son copias para inspección,
no las fuentes en vivo.

---

## Impacto en el plan de pasos

El diseño por registros refina sobre todo el arranque y la lectura:

- **Paso 0** — `instalar()` crea las **6** hojas (con `BASES`) y ejemplos + menú.
- **Paso 1** — Lector de registros: leer `BASES`/`INFORMES` y resolver un `base_id`
  a su Sheet en vivo (prueba: abrir RDV por su ID y listar hojas).
- **Paso 2** — Resolver `campo_logico` vía `MAPEO` y leer una columna real filtrada
  por período.
- **Paso 3** — `Marcadores.gs`: primer cálculo real de un marcador (ej. `ecv_inscriptos`).
- **Paso 4** — Motor de reemplazo: abrir plantilla por `informe_id → plantilla_id`,
  reemplazar `{{tokens}}`, generar copia de Slides.
- **Paso 5** — Correr un informe end-to-end headless (JM).
- **6–9** panel · **10–12** automatización (sin cambios).
