# Paso 0.5 — Delta de esquema para períodos múltiples

> Requiere Paso 0 v2 hecho (6 hojas creadas). Este paso SOLO agrega estructura de
> períodos: una hoja nueva y tres columnas. NO calcular nada, NO leer bases en vivo,
> NO tocar `Marcadores.gs`. Sigue siendo trabajo de `instalar()`.

Contexto: el período dejó de ser global. Hay tres capas — período principal del
informe (CONFIG), secciones con otro corte (hoja PERIODOS), y período propio por
campaña (CAMPANAS). Detalle en `Plan Inicial/Periodos_y_campanias.md`.

Reescribí `HOJAS_CONFIG_` / `instalar()` en `Instalar.gs` para sumar, de forma
IDEMPOTENTE (sin duplicar ni pisar filas cargadas por el usuario):

1. **Hoja nueva `PERIODOS`** — ventanas con nombre:
   `periodo_id | desde | hasta | notas`
   Filas de ejemplo:
   - `m2_mensual | 2026-06-01 | 2026-06-30 | M2 dentro del JM`
   - `quincena_rrss | 2026-06-16 | 2026-06-30 | Análisis RRSS`

2. **Columna nueva en `MARCADORES`: `periodo_ref`** (vacío = usa período principal).
   Insertar la columna respetando el orden lógico, quedando:
   `marcador | familia | informe_id | base_id | campo_logico | periodo_ref | calculo | formato | notas`
   En las filas de ejemplo: `ecv_inscriptos` y `camp_alcance` con `periodo_ref` vacío;
   `m2_envios` con `periodo_ref = m2_mensual`.

3. **Columnas nuevas en `CAMPANAS`: `desde` y `hasta`** (fechas propias de cada campaña).
   Quedando: `campana_id | nombre | informe_id | base_id | tipo | desde | hasta | mostrar | orden`
   Ejemplos:
   - `serv_esenciales | Servicios esenciales | secco | looker | destacada | 2026-06-02 | 2026-06-15 | sí | 1`
   - `encuentros_min | Encuentros de ministros | secco | rdv | encuentro_ministros | 2026-06-01 | 2026-06-30 | sí | 2`
   - `prov_uber | Uber | secco | digital | proveedor | 2026-06-01 | 2026-06-30 | no | 3`

Idempotencia importante: si las hojas/columnas ya existen, NO recrees ni pises datos
del usuario; solo asegurá que existan los encabezados nuevos en la posición correcta.
Si `MARCADORES`/`CAMPANAS` ya tienen filas cargadas, insertá las columnas nuevas sin
borrar el contenido existente. Al terminar, toast/alert con el resumen.

No toques `Marcadores.gs`. No agregues lógica de cálculo ni lectura de bases.

Prueba del usuario: "Instalar / reparar hojas" → aparece `PERIODOS`, y `MARCADORES`
tiene `periodo_ref`, y `CAMPANAS` tiene `desde`/`hasta`. Correr dos veces no duplica.
Al cerrar: commit `Paso 0.5 ✅ — esquema de períodos (PERIODOS + periodo_ref + desde/hasta)`.
