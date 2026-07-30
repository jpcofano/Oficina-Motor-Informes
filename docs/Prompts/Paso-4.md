# Paso 4 — Motor de reemplazo en Slides

> Requiere Pasos 0–3. Este paso abre la plantilla de un informe, la copia, y reemplaza
> los `{{tokens}}` por los valores calculados. Trabaja sobre Google Slides.
> NO toca `Marcadores.gs`. El reemplazo va en `Generador.gs`.

Contexto: cada informe (`INFORMES`) apunta a un `plantilla_id` (un Google Slides marcado
con `{{tokens}}`). Convención de token: `{{doble_llave}}`. Las plantillas marcadas ya
existen (JM y SECCO). Ver `docs/TOKENS.md` — fusiona (y reemplaza) los inventarios que
estaban en `Plan Inicial/_archivo/JM_tokens_marcados.md` y
`Plan Inicial/_archivo/SECCO_tokens_marcados.md` (DOC-1 los archivó; **son
documentos archivados**: si contradicen `docs/TOKENS.md` o `PROYECTO.md`, manda el
vivo).

> Estado actual (Paso 2.2.2, regla **C-01** en `docs/REGLAS_NEGOCIO.md`): `INFORMES.
> plantilla_id` **ya apunta a la plantilla canónica** de cada informe (Google Slides
> nativo, en la carpeta de `CONFIG.carpeta_plantillas`) — no hace falta convertir ni
> subir nada. **No copiar la plantilla para "ordenarla" o probar algo:** copiar un
> archivo de Drive genera un ID nuevo, y ese ID no es el que está en `INFORMES.
> plantilla_id` — un cambio hecho sobre la copia no se ve nunca. Cualquier edición de
> diseño va sobre el archivo cuyo ID está en `INFORMES`, punto.

1. **Copia de la plantilla** (en `Generador.gs`):
   - `generarInforme(informe_id)`:
     a. Lee la fila de `INFORMES` → `plantilla_id`, `nombre`, `periodicidad`.
     b. Copia el Slides plantilla a la `carpeta_salida` de CONFIG, con nombre
        `{nombre} — {periodo}` (usá el período principal para el nombre).
     c. Devuelve el ID de la copia. NO modifiques la plantilla original.

2. **Recolección de valores**:
   - Filtrar `MARCADORES` por `informe_id` = el informe + los `*` (compartidos).
   - Para cada uno, `resolverMarcadores(informe_id, periodoGlobal)` (`Paso-3-v2.md`,
     no `calcularMarcador` — ese nombre quedó del `Paso-3.md` viejo, ya reemplazado) →
     junta un mapa `{ '{{token}}': valor_formateado }`.
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
