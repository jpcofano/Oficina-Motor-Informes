# Motor de Informes — Documento maestro (fuente de verdad)

> Consolidado al **28/07/2026**. Pensado para que, si se abre el proyecto desde
> otra cuenta o máquina, toda la información necesaria esté acá.
> Ubicación sugerida: raíz del repo, o como cabecera de `Plan Inicial/PLAN.md`.
> Si el `PLAN.md` actual tiene el detalle fino de los 12 pasos, conservalo: este
> doc consolida **contexto, fuentes, plantillas, setup y estado**, no reemplaza
> la lista de pasos.

---

## 1. Qué es

Sistema **Google Sheets → Apps Script → Google Slides** que genera presentaciones
automatizadas y configurables (período, fuentes, y qué calcula cada valor) sin
tocar código. Contexto: comunicación GCBA.

**Tesis:** no es un informe, es un *motor*. Informe nuevo = plantilla nueva + filas
de config. **Regla de oro:** toda la aritmética vive solo en `Marcadores.gs`.

El motor lee las bases de datos en vivo por su ID; la planilla de control es el
tablero (no tiene los datos).

---

## 2. Fuente de verdad — DATOS

Bases reales inspeccionadas, en `docs/samples/Datos/`:

| Base | Archivo | Contenido |
|---|---|---|
| RDV | `RDV JM CM ES + funcionarios.xlsx` | Encuentros con vecinos (hoja `RVD JM-CM - ES`) |
| Seguimiento Digital | `Seguimiento Digital  (1).xlsx` | Campaña por canal (hojas `Digital`, `Directa Mail/IVR/SMS`, `CAMPAÑAS_DESGLOCE_DIGITAL`) |
| Looker | `Base Looker.xlsx` | Consolidado por campaña (hoja `resumen_metricas`) |
| **M2** *(nuevo)* | `M2 Reporte para Fede 2026.xlsx` | Base de la familia `m2_*` — **falta darla de alta en FUENTES/MAPEO** |

**Decisiones de fuente pendientes (FUENTES §4) — no resueltas:**
1. Bloque ECV: ¿`ecv_insc_digital` = columna `RRSS`?
2. **Fuente de verdad digital/directa: `Seguimiento_Digital` vs `Looker`** ← sin definir.
3. Columna de campaña canónica para el selector.
4. Columna de fecha para filtrar período en cada base.
5. MiBA: fuente **parqueada** (a definir).

---

## 3. Fuente de verdad — PLANTILLAS

Crudos y referencia, en `docs/samples/Informes ejemplo/`:

| Archivo | Rol |
|---|---|
| `PLANTILLA_marcada.pptx` | JM vieja (9 slides) — **referencia de convención de tokens** |
| `Informe semanal JM 26_06 AL 03_07.pptx` | JM crudo (con datos) |
| `Copia de Seguimiento SECCO - SSCDI (03-07).pptx` | SECCO crudo, período jul |
| `Copia de Seguimiento SECCO - SSCDI (08-05).pptx` | SECCO crudo, período may |

Plantillas EN BLANCO (con `xx`) que fueron la base para marcar:
`Plantilla_SECCO.pptx` (29 slides) y `Plantilla__Informe_semanal_JM.pptx` (22 slides).

**Plantillas MARCADAS (entregables) → van en `docs/Plantillas/` (hoy vacía):**
- `SECCO_marcada.pptx` (29 slides, valida OK) — inventario en `docs/SECCO_tokens_marcados.md`
- `JM_marcada.pptx` (22 slides, valida OK) — inventario en `docs/JM_tokens_marcados.md`

SECCO se presenta **mensual**; JM, **semanal**.

---

## 4. Convención de marcadores

- Sintaxis: **`{{doble_llave}}`**, snake_case, agrupados por familia.
- El motor reemplaza **solo texto**: datos dentro de imágenes (`.jpg`) NO son tokenizables.

**Familias en uso (compartidas entre plantillas):**

| Familia | Qué mide | Aparece en |
|---|---|---|
| `ecv_*` | Encuentros con vecinos / inscriptos / asistentes | JM, SECCO |
| `enc_*` | Iceberg de encuentro (alcance, clics, aperturas…) | JM (iceberg ECV), SECCO (encuentro temático) |
| `et_*` | Encuentro temático (SECCO) | SECCO |
| `emin_*` | Encuentros de ministros (campaña seleccionable) | SECCO |
| `m2_*` | Comunicaciones M2 (directa + digital por categoría) | JM, SECCO |
| `camp_*` | **Bloque único de campaña destacada** (repetible por campaña) | JM, SECCO — idénticos |
| `mail_/ivr_/cc_/imp_/pauta_*` | Resumen ejecutivo digital/directa | JM |
| `gcba_*` | Versión GCBA del resumen ejecutivo | JM |
| `conv_/rep_/rrss_*` | Análisis de conversación en X / RRSS | JM, SECCO |
| `post_/u1_*` | Comunicaciones post / uno a uno | SECCO |
| `miba_*` | Integración MiBA (fuente parqueada) | deck lleno SECCO (referencia) |

**Campañas seleccionables** (vía hoja `CAMPANAS`, no marcadores fijos): campaña
destacada, **encuentros de ministros** (bloque entero), y **nuevos proveedores**
(Uber/Twitch/ML, cada proveedor con sus campañas en tabla). MiBA y Nuevos
Proveedores **no** están en la plantilla base de SECCO (son secciones ocasionales).

**Definiciones de nombres pendientes:**
- Confirmar los `camp_*` (cambiarlos se propaga a JM **y** SECCO).
- `enc_*` vs `et_*`: definir si se fusionan o quedan separadas.

---

## 5. Setup técnico

**clasp** (Apps Script vinculado a la planilla de control):
- Cuenta: `jpcofano@gmail.com`
- `scriptId`: `1F1LKmgg…` (en `.clasp.json`)
- Planilla "Motor de Informes" `id 1V2a2rj…`
- ⚠ **Arreglar:** el archivo `claspignore` está **sin el punto inicial**. clasp
  busca `.claspignore` → renombrarlo a `.claspignore` o no ignora nada.
- Manifiesto `appsscript.json` en la raíz (timezone AR + oauthScopes). Un solo
  `.clasp.json` y un solo `appsscript.json` (el problema del push duplicado ya
  se resolvió sacando el código de `Plan Inicial/`).

**git** (backup / un commit por paso):
- Repo inicializado, `.gitignore` presente, **remoto `origin` configurado** (hay
  `refs/remotes/origin/main`) → backup off-site activo.
- Convención de commit: `Paso N ✅ — <resumen>`.
- Credenciales de `clasp login` viven en `~/.clasprc.json` (fuera del repo) → nada
  sensible se commitea.

---

## 6. Estructura del proyecto (28/07/2026)

```
Motor Informes/
├─ .clasp.json                 (scriptId)
├─ appsscript.json             (manifiesto, raíz)
├─ .gitignore
├─ claspignore                 ⚠ renombrar a .claspignore
├─ .claude/  .git/
├─ *.gs                        Código (raíz): Instalar, Codigo, Config, Fuentes,
│                              Generador, Marcadores, Automatizacion, PanelBackend, Snapshot
├─ Panel.html
├─ Plan Inicial/               PLAN.md · FUENTES.md · CAMPANAS.md · README.md
└─ docs/
   ├─ JM_tokens_marcados.md
   ├─ SECCO_tokens_marcados.md
   ├─ Plantillas/              ⬅ poner acá SECCO_marcada.pptx y JM_marcada.pptx (hoy vacía)
   ├─ Prompts/                 Paso-0.md
   └─ samples/
      ├─ Datos/                4 bases reales (ver §2)
      └─ Informes ejemplo/     crudos + PLANTILLA_marcada (ver §3)
```

**Convención de carpetas:** código en la raíz; docs en `Plan Inicial/`,
`docs/Prompts/`, `docs/`. Datos y ejemplos en `docs/samples/`.

---

## 7. Cómo trabajamos

`PLAN.md` tiene 12 pasos (0–12). Un paso = un prompt para Claude Code = una prueba
del usuario. Orden: motor headless (0–5) → panel (6–9) → automatización (10–12).
Los prompts se guardan en `docs/Prompts/`.

**Hojas de config del motor:** `CONFIG`, `INFORMES`, `MARCADORES`, `MAPEO`, `CAMPANAS`.

---

## 8. Estado actual y próximos pasos

**Hecho:**
- Scaffold + setup clasp + git con remoto.
- Tres plantillas resueltas: `PLANTILLA_marcada` (referencia), `SECCO_marcada`,
  `JM_marcada`, compartiendo familias (sobre todo `camp_*`).

**Pendiente inmediato:**
1. Renombrar `claspignore` → `.claspignore`.
2. Mover `SECCO_marcada.pptx` y `JM_marcada.pptx` a `docs/Plantillas/`.
3. QA visual de las plantillas marcadas (slides señaladas en los `*_tokens_marcados.md`:
   SECCO 8/12/27 · JM 5/6/10/21).
4. Dar de alta la base **M2** en `FUENTES.md` y `MAPEO`.
5. Resolver decisiones de fuente (§2) y nombres (§4).
6. Consolidar los tokens de las 3 plantillas en la hoja `MARCADORES`.
7. Continuar con el motor: dar cuerpo a `instalar()` + `onOpen()` (Paso 0).
