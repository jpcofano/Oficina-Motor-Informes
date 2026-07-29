# HANDOFF — Motor de Informes (GCBA)

> Para arrancar una conversación nueva con contexto completo. Trabajamos en español.

## Plantilla de entrada por paso

Antes de cada commit de paso (convención instaurada en el Paso 1.8, ver
`Plan Inicial/PROYECTO.md` §9), agregar una entrada con este formato en
**Bitácora por paso** (más abajo):

```
## Paso <N> — <nombre corto> (<AAAA-MM-DD>)
- **Qué hace el prompt:** <1–2 líneas, el objetivo>.
- **Qué se hizo:** <archivos/funciones editados, hojas/columnas/menús tocados>.
- **Prueba:** <cómo se probó y resultado>.
- **Pendientes/decisiones:** <si quedó algo abierto; si no, "ninguno">.
```

## Qué es
Motor **Google Sheets → Apps Script → Google Slides** que genera presentaciones
configurables sin tocar código. Diseño por **registros**: agregar base o plantilla =
agregar fila. **Regla de oro:** la aritmética vive solo en `Marcadores.gs`.

## Arquitectura (dos cuentas — Arq. 1)
Script **bound** a la planilla de control, ambos propiedad de **`jpcofanogcba1`** (robot
que ejecuta). **Web app (`doGet`, como robot)** = frente del usuario; **sidebar
(`onOpen`)** = admin. Bases/plantillas en Drive compartidas con el robot. Cuenta usuario:
`reporteseinformesgcba`.

## Config (6 hojas + PERIODOS)
CONFIG, BASES, INFORMES, MARCADORES, MAPEO, CAMPANAS, PERIODOS.
**Período por token en 3 capas:** campaña (`CAMPANAS.desde/hasta`) → `periodo_ref`
(PERIODOS) → principal (CONFIG).

## Bases vivas (Google Sheets)
| base_id | sheet_id | hoja | modo |
|---|---|---|---|
| rdv | `1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo` | RVD JM-CM - ES | filtrar |
| digital | `1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY` | Digital | filtrar |
| looker | `1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ` | resumen_metricas | filtrar |
| m2 | `1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY` | M2 periodo DIRECTA | **snapshot** (encabezado fila 3) |
| miba | *(parqueada)* | | activo=no |

## Plantillas
JM (22 slides) y SECCO (29 slides), marcadas y convertidas a **Google Slides nativas**,
en la carpeta `1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi`. El `Paso 1.6` las registra por nombre
en `INFORMES`. Token: `{{doble_llave}}`. Familias: `ecv_ enc_ et_ emin_ m2_ camp_ mail_
ivr_ cc_ imp_ pauta_ gcba_ conv_ rep_ rrss_ post_ u1_ miba_`.

## MAPEO — ESTADO (novedad de esta sesión)
**Se completó el relevamiento de columnas de las 4 bases** (estaba pendiente; el mapeo
detallado nunca se había hecho, solo el análisis de estructura). Detalle en
`MAPEO_completo.md`. Resumen:
- **RDV** mapeado (`ecv_*`). **Duda resuelta: `ecv_insc_digital` = columna RRSS (O).**
- **Looker** mapeado (consolidado por campaña, 31 columnas).
- **Seguimiento Digital** mapeado (hojas Digital / Directa Mail/IVR/SMS / DESGLOCE).
- **M2** mapeado (snapshot).
- ⚠ **Decisión pendiente clave: Looker vs Seguimiento Digital cubren lo mismo**
  (digital/directa por campaña). Hay que **elegir una como fuente de verdad** antes de
  cablear MARCADORES, para no tener doble verdad.

## Estado del build
- **Pasos 0 y 1 hechos** (hojas registro + menú; lector de registros + `abrirBase` con caché).
- **En curso: migración a `jpcofanogcba1`.** Logueado OK. Al correr `clasp create` hubo
  un error por copiar la flecha `→` del runbook (son **dos comandos separados**:
  `clasp create --type sheets --title "Motor de Informes"` y luego `clasp push -f`).
  **Falta verificar** si el `.clasp.json` de la carpeta es de la cuenta vieja (→ renombrar
  a `.old` antes de `clasp create`) o ya es del robot (→ solo `clasp push -f`).

## Próximos pasos (orden)
1. Resolver la migración clasp (crear bajo robot o solo pushear).
2. Correr prompts: `Paso-0.5` (esquema períodos) → `Paso-1.7` (seed BASES/MAPEO/CONFIG)
   → `Paso-1.6` (registrar plantillas). Todos en `docs/Prompts/`.
3. Permisos: compartir bases (lector) + carpetas plantillas/salida (editor) con el robot.
4. "Probar conexión a bases" → verde.
5. **Decidir fuente de verdad digital (Looker vs Seguimiento Digital).**
6. Cargar MAPEO completo (desde `MAPEO_completo.md`) y cablear MARCADORES.
7. Motor headless: `Paso-2` → `3` → `4` → `5`.
8. Panel: `Paso-6` (web app) → 7–9. Automatización: 10–12.

## Bitácora por paso

## Paso 1.6 v2 — carpetas por CONFIG + registro de plantillas robusto (2026-07-28)
- **Qué hace el prompt:** "Registrar plantillas" no encontraba ningún Slides aunque el
  ID de carpeta era correcto. Reemplaza al Paso 1.6: saca los IDs de carpeta del
  código, agrega un diagnóstico y reescribe el registro para que sea recursivo y
  distinga por MIME.
- **Qué se hizo:**
  - `Config.gs` — nueva `leerConfig()` (clave→valor desde `CONFIG`).
  - `Instalar.gs` — `SEED_CONFIG_DEFAULTS_` suma `carpeta_plantillas` y completa
    `carpeta_salida`; eliminada la constante `CARPETA_PLANTILLAS_ID_`;
    `menuRegistrarPlantillas_` lee la carpeta desde `CONFIG` vía `leerConfig()`.
  - `Instalar.gs` — nuevas `diagnosticarCarpetaPlantillas_()` / menú "Diagnosticar
    carpeta de plantillas" (lista archivos y subcarpetas sin filtrar por tipo).
  - `Instalar.gs` — `registrarPlantillasDesdeCarpeta()` reescrita: recorre hasta 2
    niveles de subcarpetas (`recorrerCarpetaPlantillas_`), clasifica cada archivo por
    MIME (`clasificarArchivoPlantilla_`: Slides / `.pptx` sin convertir / acceso
    directo / otro), no pisa un `plantilla_id` distinto ya cargado (reporta
    conflicto), y distingue "carpeta vacía" de "sin Slides que matcheen".
  - `Codigo.gs` — ítem de menú nuevo "Diagnosticar carpeta de plantillas".
- **Prueba:** pendiente del usuario — `clasp push` → menú → "Diagnosticar carpeta de
  plantillas" (ver qué MIME salen JM/SECCO) → convertir/mover si hace falta → "Registrar
  plantillas" → verificar `plantilla_id` en `INFORMES` y `carpeta_plantillas` /
  `carpeta_salida` en `CONFIG` → correr de nuevo y confirmar que no duplica ni pisa.
- **Pendientes/decisiones:** ninguno.

## Paso 1.8B — timeZone Buenos Aires + oauthScopes (2026-07-28)
- **Qué hace el prompt:** cerrar higiene de proyecto antes del Paso 2: zona horaria y
  scopes explícitos en `appsscript.json`.
- **Qué se hizo:** `appsscript.json` — `timeZone` de `America/New_York` a
  `America/Argentina/Buenos_Aires`; agregado `oauthScopes` explícito
  (`spreadsheets`, `drive`, `presentations`, `script.container.ui`).
- **Prueba:** pendiente del usuario — `clasp push`, re-autorizar desde el menú y correr
  `probarConexionBases()`.
- **Pendientes/decisiones:** ninguno.

## Paso 1.8A — Convención un commit por paso (2026-07-28)
- **Qué hace el prompt:** dejar fija la regla de un commit por paso (sin bundles), para
  no repetirla en cada prompt.
- **Qué se hizo:** `Plan Inicial/PROYECTO.md` §9 — nueva sub-sección "Convención de
  trabajo: un commit por paso" con las 6 reglas y la excepción de commits internos por
  partes cuando el prompt lo pide explícitamente (como este mismo Paso 1.8).
- **Prueba:** `git log --oneline` debe mostrar los commits de este paso separados, no
  bundleados.
- **Pendientes/decisiones:** ninguno.

## Docs vivos (fuente de verdad)
- `Plan Inicial/PROYECTO.md` — maestro (se actualiza siempre).
- `docs/RUNBOOK.md` — guía de operación (comandos, permisos, orden).
- `docs/MAPEO_completo.md` — mapeo de columnas de las 4 bases.
- `docs/Prompts/Paso-*.md` — prompts para Code.
- Resto de docs viejos → archivados en `Plan Inicial/_archivo/`.

## Cómo trabajamos
Un paso = un prompt para Code = una prueba del usuario. Claude no ejecuta clasp ni toca
el repo; deja prompts y docs. Yo (usuario) corro y verifico. Windows, carpeta
`C:\Users\20243359679\OneDrive\Documentos\AppsScript\Oficina\Motor Informes`.

## Primer pedido sugerido para la conversación nueva
"Retomo el Motor de Informes. Adjunto el HANDOFF. Ayudame a: (1) cerrar la migración
clasp a jpcofanogcba1, y (2) decidir la fuente de verdad digital (Looker vs Seguimiento
Digital) para poder cablear MARCADORES."
