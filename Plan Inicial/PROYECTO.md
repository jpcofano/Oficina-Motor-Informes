# PROYECTO — Motor de Informes

> **Documento maestro vivo.** Único lugar de verdad: se actualiza cada vez que
> cambia algo. Ubicación: `Plan Inicial/PROYECTO.md`.
> Para *ejecutar* (comandos, permisos, orden de corrida) → `docs/RUNBOOK.md`.
> Para los prompts de Code → `docs/Prompts/Paso-*.md`.
>
> Última actualización: 28/07/2026.

---

## 1. Qué es

Sistema **Google Sheets → Apps Script → Google Slides** que genera presentaciones
automatizadas y configurables (período, fuentes, y qué calcula cada valor) sin tocar
código. Contexto: comunicación GCBA.

**Tesis:** no es un informe, es un *motor*. Informe nuevo = plantilla nueva + filas de
config. **Regla de oro:** toda la aritmética vive solo en `Marcadores.gs`.

---

## 2. Arquitectura de ejecución (dos cuentas)

- `jpcofanogcba1` = **cuenta robot** (ejecuta; dueña del script y de la planilla de control).
- `reporteseinformesgcba` = cuenta del **usuario** (dueña de bases y salidas).

**Arq. 1 (elegida):** script **bound** a la planilla de control, ambos propiedad del
robot. `onOpen` (sidebar) para admin; **web app (`doGet`, ejecuta como robot)** para el
usuario final. La planilla se comparte con el usuario (editor). No requiere refactor
(`getActive()` sigue válido).

> Alternativa Arq. 2 (standalone, control propiedad del usuario): pierde el sidebar y
> exige `getActive()`→`openById(CONTROL_ID)`. No elegida.

**Permisos — todo compartido con `jpcofanogcba1`:** bases → lector; plantillas
(Slides) → editor (el motor las copia); carpeta de salida → editor; planilla de control
→ del robot, compartida con el usuario (editor).

**Dos frentes, un motor:** sidebar y web app llaman a las mismas funciones; solo cambia
el disparador y bajo qué cuenta corre.

---

## 3. Diseño por registros (extensibilidad)

**Principio:** agregar una base o plantilla = agregar una **fila**, no tocar código. El
motor nunca nombra una base/plantilla en el código: las descubre leyendo hojas-registro
y las referencia por ID lógico (`base_id`, `informe_id`).

Las **6 hojas de config** (+ `PERIODOS`):

- **CONFIG** (clave/valor global): `periodo_desde`, `periodo_hasta`, `informe_activo`,
  `carpeta_salida`.
- **BASES** (una fila por fuente viva): `base_id | nombre | sheet_id | hoja_default |
  tipo | activo | notas` (+ `fila_encabezado`, `modo_periodo` — ver §5).
- **INFORMES** (una fila por plantilla/informe): `informe_id | nombre | plantilla_id |
  periodicidad | familias | activo | notas`.
- **MARCADORES** (un token por fila): `marcador | familia | informe_id | base_id |
  campo_logico | periodo_ref | calculo | formato | notas`.
- **MAPEO** (campo lógico → columna, por base): `base_id | campo_logico | hoja | columna | notas`.
- **CAMPANAS** (campañas seleccionables): `campana_id | nombre | informe_id | base_id |
  tipo | desde | hasta | mostrar | orden`.
- **PERIODOS** (ventanas con nombre): `periodo_id | desde | hasta | notas`.

**Recetas:**
- *Base nueva* → fila en BASES + filas en MAPEO. Cero código.
- *Plantilla/informe nuevo* → marcar el Slides + fila en INFORMES + filas en MARCADORES.
  Si los cálculos ya existen, cero código; si trae métrica nueva, una función en
  `Marcadores.gs` (única excepción de la regla de oro).
- *Campaña* → fila en CAMPANAS.

**Reparto de responsabilidad por módulo:** estructura → `Instalar.gs`; acceso a datos y
caché → `Fuentes.gs`; aritmética → `Marcadores.gs`; despacho/reemplazo → `Generador.gs`.

---

## 4. Períodos (3 capas)

El período no es global; se resuelve **por token** en este orden de prioridad:
1. ¿el token es de una campaña seleccionada? → fechas propias de esa fila de `CAMPANAS`;
2. ¿el marcador tiene `periodo_ref`? → esa ventana de `PERIODOS`;
3. si no → período principal de `CONFIG`.

Selección de campañas: el motor emite un bloque por cada `CAMPANAS` con `mostrar=sí`,
ordenado por `orden`; cada `tipo` (destacada / encuentro_ministros / proveedor) consume
su plantilla de slide repetible. Varía por edición (no siempre entran las mismas).

---

## 5. Fuente de verdad — DATOS

Bases vivas (Google Sheets nativas), cargadas en `BASES`:

| base_id | nombre | sheet_id | hoja_default | modo |
|---|---|---|---|---|
| rdv | RDV JM CM ES + funcionarios | `1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo` | RVD JM-CM - ES | filtrar |
| digital | Seguimiento Digital | `1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY` | Digital | filtrar |
| looker | Base Looker | `1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ` | resumen_metricas | filtrar |
| m2 | M2 Reporte para Fede 2026 | `1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY` | M2 periodo DIRECTA | **snapshot** |
| miba | Integración MiBA | *(vacío)* | | parqueada (activo=no) |

**Quirk de M2** (por eso las columnas `modo_periodo` / `fila_encabezado` en BASES):
las hojas `M2 periodo DIRECTA` / `M2 periodo DIGITAL` **ya vienen al corte del período**
(no se filtran por fecha) y tienen el **encabezado en la fila 3** (fila 1 = período,
fila 2 = vacía, datos desde fila 4). Config M2: `modo_periodo=snapshot`, `fila_encabezado=3`.

**MAPEO de M2** (directa en `M2 periodo DIRECTA`, digital en `M2 periodo DIGITAL`):
directa → campana B, fecha C, envios D, entregados E, aperturas F, or G, clics H, ctor I.
digital → campana_dig B, estado E, impresiones F, alcance_dig G, views I, clics_dig K.

**Pendiente de MAPEO:** columnas de **RDV** (`inscriptos`, `fecha`) a confirmar contra la
hoja real (se ven con "Probar conexión"). Decisiones de fuente aún abiertas: ECV block,
`Seguimiento_Digital` vs `Looker` como verdad digital, columna de campaña canónica.

---

## 6. Fuente de verdad — PLANTILLAS

- Plantillas **marcadas** convertidas a **Google Slides nativas**, en la carpeta de Drive
  `1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi`. Sus IDs se cargan en `INFORMES.plantilla_id` con
  el helper del `Paso 1.6` (matchea por nombre: "JM"→jm, "SECCO"→secco).
- Informes: `jm` (semanal, 22 slides) y `secco` (mensual, 29 slides).
- Convención de token: **`{{doble_llave}}`**, snake_case, por familia. El motor
  reemplaza solo **texto** (datos en imágenes no son tokenizables).
- Inventarios de tokens: `docs/JM_tokens_marcados.md`, `docs/SECCO_tokens_marcados.md`.
- `.pptx` marcados (referencia) en `docs/Plantillas/`.

**Familias:** `ecv_*`, `enc_*`, `et_*`, `emin_*`, `m2_*`, `camp_*` (bloque único de
campaña, idéntico JM/SECCO), `mail_/ivr_/cc_/imp_/pauta_*`, `gcba_*`,
`conv_/rep_/rrss_*`, `post_/u1_*`, `miba_*`.
Decisiones de nombres abiertas: confirmar `camp_*` (se propagan a ambas plantillas);
definir si `enc_*` y `et_*` se fusionan.

---

## 7. Plan por pasos y estado

**Bloque 1 — Fundación y config**
- Paso 0 ✅ hojas registro + menú · Paso 1 ✅ lector + `abrirBase` con caché.
- Paso 1.5 — re-anclar a `jpcofanogcba1` (clasp create + push + permisos). *(RUNBOOK)*
- Paso 0.5 — esquema de períodos (PERIODOS + periodo_ref + desde/hasta).
- Paso 1.7 — seed de BASES/MAPEO/CONFIG por código.
- Paso 1.6 — registrar plantillas desde la carpeta.

**Bloque 2 — Motor headless**
- Paso 2 — lectura por ventana (MAPEO + período; maneja `modo_periodo`/`fila_encabezado`).
- Paso 3 — primer cálculo en `Marcadores.gs` + trazabilidad.
- Paso 4 — motor de reemplazo (tokens fijos).
- Paso 5 — campañas repetibles + end-to-end.

**Bloque 3 — Panel** · Paso 6 web app (`doGet`) · 7 período · 8 campañas · 9 preview+trazabilidad.
**Bloque 4 — Automatización** · 10 auto-convertir plantillas · 11 triggers · 12 entrega por mail.

**Orden de corrida detallado → `docs/RUNBOOK.md`.**

---

## 8. Setup técnico

- clasp: cuenta `jpcofanogcba1`. `.clasp.json` con el `scriptId` (commiteado).
  `.claspignore` deja subir solo `appsscript.json`, `.gs`, `.html`.
- git: repo con remoto `origin`. Convención de commit: `Paso N ✅ — <resumen>`.
- Nativos obligatorios: bases = Google Sheets, plantillas = Google Slides.

---

## 9. Convenciones de mantenimiento

- **Este `PROYECTO.md` es el único doc que se actualiza.** Al cerrar cada bloque, se
  refresca (estado, decisiones resueltas, deltas de esquema).
- Prompts `Paso-*.md` en `docs/Prompts/` — no van acá.
- Docs viejos consolidados acá quedan archivados en `Plan Inicial/_archivo/`.
