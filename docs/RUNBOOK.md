# RUNBOOK — De "logueado a clasp" a "motor leyendo datos reales"

> Arquitectura 1: script **bound**, planilla de control propiedad de `jpcofanogcba1`
> (robot), compartida con el usuario. Bases/plantillas en el/los otros Drive,
> compartidas con el robot. El motor accede todo por ID.

---

## Parte A — Re-anclar el proyecto a la cuenta robot (Paso 1.5)

1. **Verificá con qué cuenta estás en clasp:**
   ```
   clasp login --status
   ```
   Tiene que decir `jpcofanogcba1@gmail.com`. Si no:
   ```
   clasp logout
   clasp login          → entrá con jpcofanogcba1 en el navegador
   ```

2. **Evitá choque con el `.clasp.json` viejo** (si quedó uno de la cuenta anterior):
   renombralo a `.clasp.json.old` (no lo borres todavía).

3. **Creá el proyecto nuevo bajo el robot** (desde la raíz del repo):
   ```
   clasp create --type sheets --title "Motor de Informes"
   ```
   Esto crea una planilla nueva + su script, **propiedad de jpcofanogcba1**.
   Anotá la URL de la planilla que imprime.

4. **Subí el código** (ya está en git, no se pierde):
   ```
   clasp push -f
   ```
   Verificá que `.claspignore` esté bien: solo deben subir `appsscript.json`,
   los `.gs` y `Panel.html` (nada de `docs/`, `samples/`, `Plan Inicial/`).

5. **Commit** del nuevo `.clasp.json`:
   ```
   git add .clasp.json && git commit -m "Paso 1.5 — re-anclado a jpcofanogcba1 (standalone bound)"
   ```
   Cuando todo corra, borrás el `.clasp.json.old`.

---

## Parte B — Aplicar el esquema de períodos (Paso 0.5)

6. En Claude Code, pasá el prompt **`docs/Prompts/Paso-0.5.md`** (agrega la hoja
   `PERIODOS` y las columnas `periodo_ref` / `desde` / `hasta`). Luego `clasp push`.

---

## Parte C — Crear las hojas y cargar la config

7. **Abrí la planilla nueva** (URL del paso 3) → recargá → menú **▶ Motor de Informes**
   → **"Instalar / reparar hojas"**. Autorizá el script (OAuth, primera vez).
   Deberían aparecer las 6 hojas + `PERIODOS`.

8. **Cargá `BASES`** — pegá estas filas (ya con los IDs reales):

   | base_id | nombre | sheet_id | hoja_default | tipo | activo | notas |
   |---|---|---|---|---|---|---|
   | rdv | RDV JM CM ES + funcionarios | `1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo` | RVD JM-CM - ES | google_sheets | sí | Encuentros |
   | digital | Seguimiento Digital | `1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY` | Digital | google_sheets | sí | Campaña por canal |
   | looker | Base Looker | `1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ` | resumen_metricas | google_sheets | sí | Consolidado |
   | m2 | M2 Reporte para Fede 2026 | `1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY` | *(verificar)* | google_sheets | sí | Familia m2_* |
   | miba | Integración MiBA | | | google_sheets | no | Parqueada |

   ⚠ Los `hoja_default` son los nombres que vi en los `.xlsx`; verificalos con
   "Probar conexión" (paso 11) porque muestra los nombres reales de las pestañas.
   El de M2 hay que completarlo (no lo tengo).

9. **Cargá `CONFIG`** (valores de la edición actual):
   - `periodo_desde` / `periodo_hasta` → la semana/mes que estés reportando.
   - `informe_activo` → `jm` (o vacío).
   - `carpeta_salida` → ID de una carpeta de Drive donde se guardan los Slides
     generados (creala y compartila con el robot como editor — ver Parte E).

---

## Parte D — Registrar las plantillas (Paso 1.6)

10. Las plantillas ya están como Google Slides en tu carpeta. Dos opciones:
    - **Automático (recomendado):** pasá a Code el prompt `docs/Prompts/Paso-1.6.md`
      → agrega `registrarPlantillasDesdeCarpeta()`; corré esa función con el ID de
      la carpeta `1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi` y llena `INFORMES` sola.
    - **Manual:** abrí cada Slides, copiá su ID de la URL
      (`/presentation/d/`**`ESTE_ID`**`/edit`) y pegalo en `INFORMES.plantilla_id`
      (`jm` y `secco`).

---

## Parte E — Permisos (compartir con el robot)

Todo lo que el motor abre por ID tiene que estar accesible para `jpcofanogcba1`:

11. Compartí con `jpcofanogcba1@gmail.com`:
    - Las **4 bases** → como **Lector** (el motor solo lee datos).
    - La **carpeta de plantillas** (`1Q5At-…`) → como **Editor** (el motor las copia).
    - La **carpeta de salida** → como **Editor**.
    - La **planilla de control** → compartila con la cuenta del **usuario**
      (`reporteseinformesgcba`) como **Editor** (para que configure).

---

## Parte F — Verificar conexión en vivo

12. Menú → **"Probar conexión a bases"**. Esperá:
    - ✅ RDV, Digital, Looker, M2 con sus hojas y nº de filas.
    - ⚠️ solo si falta algo (ej. `hoja_default` de M2 sin completar).
    - MiBA **no** aparece (está `activo=no`).
    Si un `hoja_default` no matchea, corregilo en `BASES` con el nombre real que
    te mostró la prueba.

---

## Y después…

13. Con las bases verdes y `INFORMES` cargado, seguís con el motor headless:
    **Paso 2** (lectura por ventana) → **3** (cálculo) → **4** (reemplazo) →
    **5** (campañas + end-to-end). Los prompts ya están en `docs/Prompts/`.

---

## Mapa de archivos del proyecto (referencia)

- `docs/Prompts/` → `Paso-0-v2.md`, `Paso-0.5.md`, `Paso-1.md`, `Paso-1.6.md`,
  `Paso-2.md`, `Paso-3.md`, `Paso-4.md`, `Paso-5.md` (prompts para Code).
- `Plan Inicial/` → `PLAN_v3_reanalizado.md`, `ARQUITECTURA_registros.md`,
  `Periodos_y_campanias.md`, `PROYECTO_MotorInformes.md` (documentación de diseño).
- `docs/` → `JM_tokens_marcados.md`, `SECCO_tokens_marcados.md` (inventarios de tokens).
- `docs/Plantillas/` → los `.pptx` marcados (referencia; las que usa el motor son
  las Google Slides de tu carpeta de Drive).
