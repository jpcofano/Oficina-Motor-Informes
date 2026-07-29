# PLAN — Motor de Informes (v3.1)

> Plan vigente. Consolida todas las decisiones tomadas. Reemplaza al PLAN original
> (archivar como `PLAN_v1_original.md`). Ubicación: `Plan Inicial/PLAN.md`.
> Solo se corrió hasta el Paso 1, así que el reordenamiento no obliga a rehacer nada.

---

## Decisión de arquitectura (fundación)

**Modelo de dos cuentas:**
- `jpcofanogcba1` = **cuenta robot** (ejecuta, dueña del script y de la planilla de control).
- `reporteseinformesgcba` = cuenta del **usuario / dueña de bases y salidas**.

**Arquitectura elegida — Arq. 1 (bound, control propiedad del robot):**
- Script **bound** a la planilla de control, ambos propiedad de `jpcofanogcba1`.
- **Sidebar (`onOpen`)** → herramienta de admin (corre como quien la abre).
- **Web app (`doGet`, ejecuta como jpcofanogcba1)** → frente del usuario final; siempre
  corre como robot, con acceso a todo por ID.
- Planilla de control **compartida** con `reporteseinformesgcba` (editor).
- Bases y carpeta de salida en el Drive del usuario, **compartidas con el robot**.
- Ventaja: sidebar + web app funcionan; **no hay refactor** (`getActive()` sigue válido).

> Alternativa Arq. 2 (standalone, control propiedad del usuario): se pierde el sidebar
> y hay que refactorizar `getActive()`→`openById(CONTROL_ID)`.

**Permisos (todo compartido con `jpcofanogcba1`):** bases → lector; plantillas
(Google Slides) → editor (el motor las copia); carpeta de salida → editor;
planilla de control → propiedad del robot, compartida con el usuario como editor.

**Plantillas:** ya convertidas a Google Slides nativas, en una carpeta de Drive. El
`Paso 1.6` lee sus IDs y los carga en `INFORMES`. (clasp no sube archivos, solo código.)

---

## Estado actual

| Paso | Qué | Estado |
|---|---|---|
| 0 | `instalar()` + `onOpen()` + 6 hojas registro | ✅ hecho |
| 1 | Lector de registros + `abrirBase` con caché | ✅ hecho |

Lo hecho es compatible con la Arq. 1 tal cual. Falta re-anclar el proyecto a
`jpcofanogcba1` (Paso 1.5).

---

## Plan por bloques

### Bloque 1 — Fundación y carga de config
- **Paso 0** ✅ — hojas registro + menú.
- **Paso 1** ✅ — lector de registros + `abrirBase` con caché.
- **Paso 1.5** — Re-anclar a la cuenta robot: `clasp create` bajo `jpcofanogcba1`,
  `clasp push`, compartir planilla y permisos. Sin código (Arq. 1). *(ver RUNBOOK)*
- **Paso 0.5** — Esquema de períodos: hoja `PERIODOS`, columnas `periodo_ref`
  (MARCADORES) y `desde`/`hasta` (CAMPANAS).
- **Paso 1.7** — Seed de config: carga `BASES` (5 bases con IDs reales) + `MAPEO` de
  M2 + `CONFIG`, por código (sin copy-paste).
- **Paso 1.6** — Registrar plantillas: lee los Google Slides de la carpeta y llena
  `INFORMES.plantilla_id` (`jm`, `secco`).

### Bloque 2 — Motor headless (leer → calcular → renderizar)
- **Paso 2** — Lectura por ventana: `MAPEO` + resolución de ventana (campaña →
  `periodo_ref` → CONFIG) + `leerColumna`. Incorpora el manejo de `fila_encabezado`
  y `modo_periodo` (por M2, ver nota abajo). Datos crudos, sin cálculo.
- **Paso 3** — Primer cálculo real en `Marcadores.gs` + despachador + trazabilidad.
- **Paso 4** — Motor de reemplazo (tokens fijos) en la copia del Slides.
- **Paso 5** — Campañas repetibles + end-to-end headless.

### Bloque 3 — Capa amigable (dos frentes)
- **Paso 6** — Web app (`doGet`), ejecuta como `jpcofanogcba1`.
- **Paso 7** — Panel: selector de período (escribe CONFIG).
- **Paso 8** — Panel: checklist de campañas (`mostrar` + fechas) + alta con dropdowns.
- **Paso 9** — Panel: vista previa ✅/⚠️ + "explicá este número" (trazabilidad).

### Bloque 4 — Automatización
- **Paso 10** — Auto-conversión de plantillas `.pptx`→Slides (para pptx crudos futuros).
- **Paso 11** — Triggers programados (según `periodicidad`).
- **Paso 12** — Entrega/notificación (mail con el link del Slides + resumen de ⚠️).

---

## Decisiones transversales (incorporadas en todos los pasos)

1. **Regla de oro:** aritmética solo en `Marcadores.gs`. Acceso a datos en `Fuentes.gs`;
   despacho/reemplazo en `Generador.gs`; estructura en `Instalar.gs`.
2. **Todo por registros:** el motor descubre bases/plantillas leyendo `BASES`/`INFORMES`.
   Agregar = fila, no código.
3. **Período por token en 3 capas:** campaña → `periodo_ref` → principal de CONFIG.
4. **Bases con comportamiento propio:** cada base declara cómo leerla. **M2** es
   `snapshot` (las hojas `M2 periodo *` ya vienen al corte del período) y tiene el
   **encabezado en la fila 3** → se manejan con las columnas `modo_periodo` y
   `fila_encabezado` en `BASES`. RDV/Digital/Looker son `filtrar` (por columna de fecha).
5. **Resiliencia sobre fragilidad:** un token que falla produce ⚠️ / `«FALTA:token»`,
   no corta la corrida.
6. **Nativos:** bases = Google Sheets, plantillas = Google Slides.
7. **Dos frentes, un motor:** sidebar (admin) y web app (usuario) llaman a las mismas
   funciones.

---

## Orden de ejecución (desde donde estás, logueado como jpcofanogcba1)

1. **Terminal:** `clasp create --type sheets --title "Motor de Informes"` → `clasp push -f`.
2. **Code:** `Paso-0.5.md` → push.
3. **Planilla:** "Instalar / reparar hojas".
4. **Code:** `Paso-1.7.md` → push → "Cargar config inicial".
5. **Code:** `Paso-1.6.md` → push → "Registrar plantillas" (con el ID de la carpeta).
6. **Drive:** compartir bases (lector) + carpetas plantillas/salida (editor) con el robot.
7. **Planilla:** "Probar conexión a bases" → verde + completar columnas de RDV en MAPEO.
8. **Code:** `Paso-2` → `3` → `4` → `5` (motor headless completo).
9. Luego Bloque 3 (panel) y Bloque 4 (automatización).

---

## Mapa de archivos

- `docs/Prompts/` → prompts para Code (`Paso-*.md`).
- `Plan Inicial/` → este `PLAN.md` + `ARQUITECTURA_registros.md`,
  `Periodos_y_campanias.md`, `M2_mapeo_y_config.md`, `PROYECTO_MotorInformes.md`.
- `docs/` → `JM_tokens_marcados.md`, `SECCO_tokens_marcados.md`, y el `RUNBOOK.md`
  (guía de operación tuya).
- `docs/Plantillas/` → los `.pptx` marcados (referencia; el motor usa las Slides de Drive).
