# Paso 5 — Campañas repetibles + corrida end-to-end

> Requiere Pasos 0–4. Cierra el motor headless: agrega el bloque de campañas
> seleccionables (que se repite por cada campaña con `mostrar=sí`) y deja un informe
> completo generándose de punta a punta. NO toca `Marcadores.gs`.

Contexto: `CAMPANAS` define campañas seleccionables con su `tipo`
(destacada / encuentro_ministros / proveedor), sus fechas propias (`desde`/`hasta`),
`mostrar` y `orden`. Cada `tipo` consume una plantilla de slide repetible dentro del
Slides del informe. Ver `Plan Inicial/PROYECTO.md` §4 y §6 (bloque de encuentro
repetible) y `docs/TOKENS.md` §3 — reemplazan a
`Plan Inicial/_archivo/Periodos_y_campanias.md` y `Plan Inicial/_archivo/CAMPANAS.md`
(DOC-1 los archivó; **son documentos archivados**: si contradicen `docs/TOKENS.md` o
`PROYECTO.md`, manda el vivo).

1. **Identificar el bloque plantilla de cada tipo** (en `Generador.gs`):
   - En el Slides plantilla, el bloque de campaña es un conjunto de slides "modelo"
     con tokens `camp_*` (y `emin_*` / `prov_*` según tipo). Definí una convención para
     marcar dónde empieza/termina el bloque modelo de cada tipo (ej. una slide con un
     marcador guía como `{{__camp_destacada__}}` al inicio del bloque, o por rango de
     slides declarado en una hoja/const). Documentá la convención elegida en el encabezado.

2. **Expansión por campaña**:
   - `expandirCampanias(informe_id, copiaId)`:
     a. Filtrar `CAMPANAS` por `informe_id` + `mostrar=sí`, ordenar por `orden`.
     b. Por cada campaña: duplicar el bloque modelo de su `tipo`, y reemplazar sus
        tokens usando la **ventana de esa campaña** (`desde`/`hasta` de su fila) — el
        despachador del Paso 3 ya resuelve la ventana si le pasás la campaña.
     c. Al terminar, eliminar el/los bloque(s) modelo originales de la copia.
   - Si no hay campañas `mostrar=sí` de un tipo, eliminar ese bloque modelo.

3. **Orquestación end-to-end**:
   - `generarInforme(informe_id)` (extender el del Paso 4):
     1. copia plantilla → 2. reemplazo de tokens fijos → 3. `expandirCampanias` →
     4. reporte final (tokens fijos + campañas emitidas + ⚠️).

4. **Prueba** (ítem de menú "Generar informe completo"):
   - Correr `jm` y `secco` de punta a punta. Verificar: los tokens fijos con valores
     reales, una slide por cada campaña seleccionada (con sus propias fechas), y el
     reporte de ⚠️ vacío o con motivos claros.

Este paso deja el **motor headless completo**: dado un `informe_id`, genera el Slides
final leyendo todo desde las hojas-registro, sin nombres hardcodeados. Después vienen
el panel (6–9) y la automatización (10–12).

Prueba del usuario: "Generar informe completo" para `secco` → Slides con tokens reales
+ N slides de campaña según lo tildado en `CAMPANAS`, cada una con su período.
Al cerrar: commit `Paso 5 ✅ — campañas repetibles + end-to-end headless`.
