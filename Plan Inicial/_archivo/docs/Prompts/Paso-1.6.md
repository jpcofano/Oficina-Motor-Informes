# Paso 1.6 — Registrar plantillas desde una carpeta de Drive

> Requiere Paso 0 (hoja `INFORMES` existe). Las plantillas ya están convertidas a
> Google Slides en una carpeta de Drive; este helper las levanta y llena `INFORMES`.
> NO calcular, NO tocar `Marcadores.gs`. Va en `Instalar.gs` o `Generador.gs` (donde
> respete el contrato de stubs).

Contexto: motor GCBA por registros. `INFORMES` tiene la columna `plantilla_id`. Las
plantillas viven en la carpeta de Drive `1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi`
(compartida con la cuenta robot como editor).

1. **`registrarPlantillasDesdeCarpeta(folderId)`**:
   - Listar los archivos de tipo **Google Slides**
     (`MimeType.GOOGLE_SLIDES`) dentro de `folderId` (usar `DriveApp.getFolderById`).
   - Para cada Slides, **matchear su nombre con un `informe_id`** por convención simple:
     nombre que contenga "JM" (y no "SECCO") → `jm`; nombre que contenga "SECCO" →
     `secco`. Dejá el matcheo en un mapa configurable arriba de la función para poder
     agregar informes nuevos sin tocar la lógica.
   - **Upsert en `INFORMES`**: si ya existe la fila del `informe_id`, actualizá su
     `plantilla_id`; si no, avisá (no inventes filas de informe: el alta del informe
     es decisión del usuario, este helper solo completa el `plantilla_id`).
   - Slides cuyo nombre no matchee ningún `informe_id` → listarlos como "sin asignar"
     en el reporte, sin escribir nada.

2. **Ítem de menú "Registrar plantillas"** que pida/tenga el `folderId` y corra la
   función, mostrando un alert: por cada informe, qué `plantilla_id` quedó cargado,
   y la lista de Slides sin asignar.

3. **Resiliencia:** si la carpeta no existe o no hay permiso, estado ⚠️ con motivo,
   sin excepción cruda. No copiar ni mover archivos: solo leer IDs y escribir en `INFORMES`.

No convertir nada (ya son Slides nativas). No copiar las plantillas (eso lo hace el
motor al generar, Paso 4). Solo registrar IDs.

Prueba del usuario: correr "Registrar plantillas" con el ID de la carpeta →
`INFORMES.plantilla_id` de `jm` y `secco` quedan cargados con los IDs reales.
Al cerrar: commit `Paso 1.6 ✅ — registrar plantillas desde carpeta`.
