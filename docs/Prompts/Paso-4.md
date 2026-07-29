# Paso 4 — Motor de reemplazo en Slides

> Requiere Pasos 0–3. Este paso abre la plantilla de un informe, la copia, y reemplaza
> los `{{tokens}}` por los valores calculados. Trabaja sobre Google Slides.
> NO toca `Marcadores.gs`. El reemplazo va en `Generador.gs`.

Contexto: cada informe (`INFORMES`) apunta a un `plantilla_id` (un Google Slides marcado
con `{{tokens}}`). Convención de token: `{{doble_llave}}`. Las plantillas marcadas ya
existen (JM y SECCO). Ver `docs/JM_tokens_marcados.md` y `docs/SECCO_tokens_marcados.md`.

> Nota: las plantillas que te entregué están como `.pptx`. Para que Slides las use como
> plantilla nativa, deben estar subidas a Drive **como Google Slides** y su ID va en la
> columna `plantilla_id` de `INFORMES`. (Igual que las bases deben ser Sheets nativas.)

1. **Copia de la plantilla** (en `Generador.gs`):
   - `generarInforme(informe_id)`:
     a. Lee la fila de `INFORMES` → `plantilla_id`, `nombre`, `periodicidad`.
     b. Copia el Slides plantilla a la `carpeta_salida` de CONFIG, con nombre
        `{nombre} — {periodo}` (usá el período principal para el nombre).
     c. Devuelve el ID de la copia. NO modifiques la plantilla original.

2. **Recolección de valores**:
   - Filtrar `MARCADORES` por `informe_id` = el informe + los `*` (compartidos).
   - Para cada uno, `calcularMarcador` (Paso 3) → junta un mapa `{ '{{token}}': valor_formateado }`.
   - Guardá también la trazabilidad de cada token para el reporte final.

3. **Reemplazo** (en `Generador.gs`, sobre la copia):
   - Recorré las slides y usá `replaceAllText('{{token}}', valor)` (o la API de Slides
     equivalente) por cada entrada del mapa.
   - Tokens sin valor (⚠️): dejalos marcados de forma visible (ej. reemplazar por
     `«FALTA:token»`) en vez de dejar el `{{token}}` crudo, para que el QA los detecte.
   - Contá reemplazos hechos vs. tokens presentes en la plantilla.

4. **Reporte de corrida**:
   - Al terminar, alert/log con: informe, período, copia generada (link), nº de tokens
     reemplazados, y la lista de ⚠️ (token, motivo). Esta es la "vista previa ✅/⚠️" en
     versión headless.

Todavía NO manejes campañas repetibles (eso es el Paso 5). Este paso reemplaza los
tokens fijos del informe. Si la plantilla tiene el bloque de campaña, dejá sus tokens
como ⚠️ FALTA por ahora.

Prueba del usuario: "Generar informe" para `jm` → se crea una copia del Slides en la
carpeta de salida con los tokens fijos reemplazados por valores reales, y un reporte de
qué quedó pendiente.
Al cerrar: commit `Paso 4 ✅ — motor de reemplazo (tokens fijos)`.
