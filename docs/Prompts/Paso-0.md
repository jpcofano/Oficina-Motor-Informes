# Paso 0 — Setup de backup (git) + `instalar()` + `onOpen()`

> **Regla de oro del proyecto:** toda la aritmética vive SOLO en `Marcadores.gs`.
> Este paso NO calcula nada, NO lee bases en vivo. Solo: control de versiones,
> estructura de hojas y menú.

---

## Parte A — Inicializar git (backup + un commit por paso)

Contexto: motor de informes GCBA, Apps Script vinculado a la planilla de control
"Motor de Informes", sincronizado con `clasp`. Quiero versionar el proyecto para
que cada paso del `PLAN.md` que pase la prueba del usuario quede como un commit
(punto de retorno limpio).

Desde la raíz del proyecto (`motor-informes/`):

1. Si todavía no existe un repo git, inicializalo (`git init`).
2. Creá un `.gitignore` mínimo. Apps Script es liviano; ignorá solo:
   ```
   node_modules/
   .DS_Store
   ```
   **NO** ignores `.clasp.json` (tiene el `scriptId`, no es secreto y ayuda a
   reproducir el setup). Las credenciales de `clasp login` viven en
   `~/.clasprc.json`, fuera de esta carpeta, así que no hay nada sensible que
   proteger acá.
3. Verificá que no haya quedado un `.clasp.json` ni un `appsscript.json`
   duplicado dentro de `Plan Inicial/` (fue el blocker del push). Si existen,
   confirmá conmigo antes de borrarlos.
4. Hacé el primer commit con TODO el scaffold actual:
   ```bash
   git add -A
   git commit -m "Scaffold inicial: stubs, PLAN.md, docs, config clasp"
   ```

**Convención para los próximos pasos:** al terminar cada paso que pase la prueba
del usuario, hacé un commit con mensaje descriptivo, formato:
`Paso N ✅ — <resumen corto>`.

*(Opcional, backup off-site)* Si te paso un remoto de GitHub, agregalo con
`git remote add origin …` y `git push -u origin main`. La red permite
`github.com`, así que el push debería funcionar desde este entorno.

---

## Parte B — `instalar()` + `onOpen()` (NO calcular nada)

Los stubs ya están en la raíz, cada uno con su contrato en el encabezado.
Este paso solo crea estructura y menú.

1. **Ubicá los stubs** que declaran `instalar()` y `onOpen()` leyendo los
   encabezados de los `.gs`. Respetá las firmas y contratos ya escritos; si mis
   columnas sugeridas de abajo difieren del contrato, **mandá lo del contrato**.

2. **`onOpen()`**: crear el menú **"▶ Motor de Informes"** con al menos el ítem
   **"Instalar / reparar hojas"** que llame a `instalar()`. Los futuros ítems del
   panel dejalos como placeholders (toast "próximamente").

3. **`instalar()`**: crear de forma **IDEMPOTENTE** las 5 hojas de config, cada
   una con encabezados y 1–2 filas de ejemplo:

   - **CONFIG** — pares clave/valor. Claves: `periodo_desde`, `periodo_hasta`,
     `id_base_rdv`, `id_base_digital`, `id_base_looker`, `id_plantilla_slides`,
     `carpeta_salida`.
   - **INFORMES** — `informe_id`, `nombre`, `plantilla_slides_id`,
     `familias_marcadores`, `activo`. Fila ejemplo: *JM semanal*.
   - **MARCADORES** — `marcador`, `familia`, `fuente`, `calculo` (ref. a la
     función en `Marcadores.gs`), `formato`, `notas`. Ejemplos de las familias
     `ecv_*`, `mail_*`, `enc_*`.
   - **MAPEO** — `base`, `campo_logico`, `hoja`, `columna`, `notas`.
   - **CAMPANAS** — `campana_id`, `nombre`, `base`, `mostrar`, `orden`.

   **Idempotencia:** si la hoja existe, reescribí encabezados sin duplicarla y
   sin pisar filas cargadas por el usuario. Borrá "Hoja 1"/"Sheet1" si quedó
   vacía. Al terminar, mostrá un toast/alert con el resumen (hojas creadas vs.
   actualizadas).

**No toques `Marcadores.gs`. No agregues lógica de cálculo ni lectura de bases en vivo.**

---

## Prueba del usuario

1. `clasp push` en verde → los stubs suben.
2. Recargar la planilla → aparece el menú **▶ Motor de Informes**.
3. Correr **"Instalar / reparar hojas"** → aparecen las 5 hojas con ejemplos.
4. Correr **dos veces seguidas** no duplica nada.
5. El repo git tiene el commit del scaffold + (al cerrar el paso) el commit
   `Paso 0 ✅ — instalar() + onOpen()`.

---

## Fuera de alcance (a propósito)

Las decisiones de `FUENTES.md §4` (bloque ECV, fuente de verdad digital,
columna de campaña canónica, columna de fecha, 3er informe) **no bloquean este
paso** — acá son solo ejemplos, no la config final.
