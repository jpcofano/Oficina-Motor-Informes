# Paso 2 — Lector de datos por ventana (MAPEO + período)

> Requiere Pasos 0, 0.5 y 1 (registros + abrirBase con caché). Este paso lee datos
> reales de una base, resolviendo la columna vía MAPEO y filtrando por una ventana
> de fechas. TODAVÍA no calcula marcadores ni reemplaza slides. La aritmética sigue
> solo en `Marcadores.gs` — este paso solo LEE y ENTREGA filas/valores crudos, en
> `Fuentes.gs`.

Contexto: motor GCBA por registros. El período no es global: se resuelve por token en
tres capas (campaña → `periodo_ref` → principal de CONFIG). Detalle en
`Plan Inicial/Periodos_y_campanias.md` y `ARQUITECTURA_registros.md`. Respetá contratos de stubs.

1. **Resolución de columna** (en `Fuentes.gs`):
   - `resolverCampo(base_id, campo_logico)` → lee `MAPEO`, devuelve `{hoja, columna}`
     para ese par. Estado `ok=false` con motivo si no está mapeado.

2. **Resolución de ventana** (en `Fuentes.gs` o donde indique el contrato):
   - `resolverVentana({informe_id, periodo_ref, campana})` → devuelve `{desde, hasta}`
     aplicando la prioridad:
     1. si viene una campaña → sus `desde`/`hasta` de `CAMPANAS`;
     2. si el marcador trae `periodo_ref` → esa fila de `PERIODOS`;
     3. si no → `periodo_desde`/`periodo_hasta` de `CONFIG`.
   - Devolver fechas como `Date`. Estado claro si una ventana referida no existe.

3. **Lectura filtrada** (en `Fuentes.gs`):
   - `leerColumna(base_id, campo_logico, ventana, {columna_fecha?})`:
     a. `abrirHoja(base_id)` (usa el caché del Paso 1).
     b. `resolverCampo` para saber qué columna leer.
     c. Filtra filas por la `ventana` usando la columna de fecha de la base
        (definila por ahora como parámetro o como un campo lógico `fecha` en MAPEO;
        elegí lo que respete el contrato del stub y dejalo documentado en el encabezado).
     d. Devuelve el array de valores de esa columna dentro de la ventana + metadatos
        (`{base_id, hoja, columna, desde, hasta, filas_leidas}`) para trazabilidad.
   - No hagas sumas ni promedios acá: devolvé los valores crudos. El agregado es del Paso 3.

4. **Prueba** (ítem de menú "Probar lectura"):
   - Leer una columna real de RDV (ej. `inscriptos`) para el período principal de CONFIG
     y mostrar en alert/log: base, hoja, columna, ventana usada, y cuántas filas cayeron
     dentro. Repetir con una `ventana` de campaña para verificar que cambia el recorte.

No calcules marcadores, no reemplaces slides, no toques `Marcadores.gs`.

Prueba del usuario: con `sheet_id` de RDV cargado y un `MAPEO` mínimo (`rdv/inscriptos`
+ `rdv/fecha`), correr "Probar lectura" → ver las filas que caen en la semana de CONFIG,
y que al pasar una ventana de campaña el recorte cambia.
Al cerrar: commit `Paso 2 ✅ — lectura por ventana (MAPEO + períodos)`.
