# PLAN — Motor de Informes (Sheets → Apps Script → Slides)

Espina del proyecto. **Un paso = un prompt para Code = algo que vos probás.**
No avanzamos al paso siguiente hasta que el actual pase su prueba.

Regla de oro de arquitectura: la aritmética vive **solo** en `Marcadores.gs`.
Todo lo demás lee config, lee datos, o pinta Slides — pero no hace cuentas.

Documentos de apoyo:
- `docs/CAMPANAS.md` — selección/filtro de campañas ("Nombre de campaña").
- `docs/FUENTES.md` — bases, IDs, hojas y columnas (pendiente de crear al confirmar fuentes).

---

## Orden de construcción

Primero el **motor headless** (pasos 0–5): genera sin UI, se prueba desde el editor.
Después la **capa amigable** (pasos 6–9): panel, selector de campañas, formularios, trazabilidad.
Al final **automatización** (pasos 10–12).

El filtro de campañas se teje en dos partes: el **motor** lo respeta desde el Paso 3
(leyendo la hoja `CAMPANAS`), y la **UI** para elegirlas llega en el Paso 7.

---

### Paso 0 — Scaffold + `instalar()`
- **Archivos:** `Instalar.gs`, `Codigo.gs`
- **Code hace:** `instalar()` crea las hojas `CONFIG`, `INFORMES`, `MARCADORES`,
  `MAPEO` y `CAMPANAS` con encabezados y filas de ejemplo. `onOpen()` arma el menú.
  Idempotente.
- **Probás:** corrés `instalar` → recargás → aparecen las hojas y el menú **▶ Motor de Informes**.

### Paso 1 — Config + período
- **Archivos:** `Config.gs`
- **Code hace:** `leerConfig`, `escribirConfig`, `resolverPeriodo` ("última semana
  cerrada" y "rango", con período anterior para comparar).
- **Probás:** función de prueba que loguea el período resuelto; cambiás a rango y cuadra.

### Paso 2 — Lectura de fuentes (con filtro opcional de campañas)
- **Archivos:** `Fuentes.gs`
- **Code hace:** `leerFuente(hoja, desde, hasta, filtros)` → filas como objetos por
  encabezado, filtradas por fecha. `filtros` acepta `campanas: [nombres...]` opcional.
- **Probás:** loguea la cantidad de filas del período; pasás una lista de campañas y
  loguea el subconjunto correcto.

### Paso 3 — Resolver marcadores (EL CORAZÓN)
- **Archivos:** `Marcadores.gs`
- **Code hace:** `resolverMarcadores(informe, periodo)` recorre `MARCADORES`, aplica la
  operación (SUMA/CONTEO/RATIO/ULTIMO/TEXTO) y devuelve `{valor, valorFormateado,
  estado, traza}`. Para marcadores digitales, lee de `CAMPANAS` las incluidas
  (`incluir=SI`) y filtra la fuente antes de sumar. Sin selección → `sin_datos`.
- **Probás:** con `CAMPANAS` cargada a mano, la tabla de marcadores da los números
  del período restringidos a las campañas elegidas.

### Paso 4 — Generar deck (reemplazo de texto)
- **Archivos:** `Generador.gs`
- **Code hace:** copia la PLANTILLA, reemplaza `{{marcador}}` por `valorFormateado`,
  guarda en Drive, devuelve link.
- **Probás:** generás sobre una plantilla mínima → Slides nuevo con los valores puestos.

### Paso 5 — Cobertura + resaltado amarillo
- **Archivos:** `Generador.gs`
- **Code hace:** los `sin_datos` se resaltan en amarillo, no en blanco. Devuelve
  `% de cobertura`.
- **Probás:** período flojo → huecos en amarillo, no inventados.

### Paso 6 — Panel lateral v1 (período + vista previa)
- **Archivos:** `Panel.html`, `PanelBackend.gs`
- **Code hace:** sidebar con selector de período y botón **Vista previa** (consume Paso 3).
- **Probás:** abrís el panel, elegís período, ves la tabla con ✅/⚠️.

### Paso 7 — Selector de campañas
- **Archivos:** `Panel.html`, `PanelBackend.gs`  ·  ver `docs/CAMPANAS.md`
- **Code hace:** checklist de nombres únicos de "Nombre de campaña" del período, con
  buscador; al guardar escribe las filas en `CAMPANAS`. La vista previa se recalcula
  con la selección.
- **Probás:** tildás 3 campañas, guardás, y los marcadores digitales de la preview
  pasan a reflejar solo esas.

### Paso 8 — Alta de marcador por formulario
- **Archivos:** `Panel.html`, `PanelBackend.gs`
- **Code hace:** "Nuevo valor" con dropdowns de campos (`panel_getCamposFuente`);
  escribe la fila en `MARCADORES`. Nadie tipea nombres de campo.
- **Probás:** agregás "Tasa de asistencia" desde el formulario → aparece en la preview.

### Paso 9 — Insertar marcadores + "explicá este número"
- **Archivos:** `Panel.html`, `PanelBackend.gs`
- **Code hace:** lista de marcadores con botón copiar `{{marcador}}`; clic en un valor
  muestra su `traza`.
- **Probás:** copiás un marcador; clic en un número explica el cálculo.

### Paso 10 — Snapshot reproducible
- **Archivos:** `Snapshot.gs`, `Generador.gs`
- **Code hace:** cada deck guarda una foto de config + datos + selección de campañas.
- **Probás:** regenerás un período viejo y sale idéntico.

### Paso 11 — Trigger semanal + email
- **Archivos:** `Automatizacion.gs`
- **Code hace:** cada lunes genera el informe de la semana cerrada y manda el link.
- **Probás:** activás el trigger, forzás corrida, llega el mail.

### Paso 12 (opcional) — Gráficos vinculados
- **Archivos:** `Generador.gs`
- **Code hace:** `{{CHART_*}}` → gráficos vinculados al Sheet, refrescables desde Slides.
- **Probás:** el deck trae el gráfico y se actualiza al corregir un dato.

---

## Estado

- [ ] Paso 0   - [ ] Paso 1   - [ ] Paso 2   - [ ] Paso 3
- [ ] Paso 4   - [ ] Paso 5   - [ ] Paso 6   - [ ] Paso 7
- [ ] Paso 8   - [ ] Paso 9   - [ ] Paso 10  - [ ] Paso 11  - [ ] Paso 12
