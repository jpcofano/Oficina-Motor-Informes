# Pedido — Paso 2.11 C.2-7 · documentación y snapshots

**Cierra:** el último punto abierto de `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`.
**No es un prompt nuevo:** no crear un `.md` de prompt para esto (`CLAUDE.md` §3). Lo que se
escribe va a los documentos que ya son dueños de cada pregunta.

**Contexto verificado por el usuario el 01/08/2026** (esto ya pasó, no hay que re-correrlo):

- Las cinco `probar_*()` corrieron por la API sobre `/dev`: 5 de 5 OK.
- Protocolo desde el menú: `menuEstadoConfiguracion_` (16:06) y dos `menuAplicarConfiguracion_`
  (16:29:14 y 16:30:56). Las dos corridas de apply son **idénticas**:
  `cambiadas: 0 · agregadas: 0 · migraciones: 0 · solo_en_hoja: 7 · protegidas (con
  diferencia): 10 · protegidas (sin diferencia): 0 · sin cambios: sí`.
- Estado y Aplicar coinciden. **Los dos P0 se cierran**: el de idempotencia y el de
  "Estado no coincide con Aplicar".

---

## 1 · Bajar C.2-7 punto 1 — a `Paso-2.11_una_sola_fuente_de_verdad.md`

Como lo pide el prompt: todo lo de la Parte C.2, más **el fix de
`sembrarClasificacionSolapas()`** hecho en la Parte C y nunca documentado (dejó de pisar
`filas_datos` / `firma_encabezado` con el valor vacío de `SEED_SOLAPAS_`, porque esas dos
columnas son de `inventariarSolapas()`).

Si ese prompt ya está ejecutado, va como **addendum fechado**, no editando el texto original.

## 2 · Snapshots — `docs/_snapshots/`

El prompt dice **nueve** hojas de registro. **C.2-2 estableció diez** (las nueve + `MARCADORES`),
y el bloque ALCANCE de la corrida de hoy emite diez filas. Exportar **las diez** y dejar
constancia de la corrección: es una premisa vencida del propio prompt, del tipo que este
proyecto ya encontró cuatro veces.

- Formato de texto plano, diffeable (TSV o Markdown), no binario. `.gitignore` ya bloquea
  `*.xlsx`.
- Nombre con fecha.
- **Antes de commitear, revisar que no entre ningún dato personal.** El repo es público y hay
  un P0 abierto por eso. `CAMPANAS` y `REUNIONES` son las candidatas a tener nombres propios:
  si los tienen, avisar y **parar** en vez de decidir solo.
- El punto de los snapshots es tener contra qué comparar si el diff está mal, y ese
  contra-qué **no puede salir del mismo código que se está probando**. Exportar leyendo las
  hojas directo, sin pasar por `calcularDiffUpsert_` ni por los `SEED_*`.

## 3 · Documentación de cierre

- **`docs/BITACORA.md`** — una línea por punto cerrado, y la entrada del protocolo con los
  números de arriba. Que diga **qué se probó cómo**, no "pasó":
  - C.2-2, C.2-4, C.2-5, C.2-6 → probados **en vivo** contra la planilla.
  - C.2-3 → **sólo sintético** (`probarMigracionesEnDiff_`). `migraciones: 0` es correcto,
    pero cero no distingue *no hay migraciones pendientes* de *ese camino no se ejecuta*.
  - `cambiadas` / `agregadas` → el camino central del upsert **no se ejecutó** en ninguna de
    las dos corridas. Es lo que probaría el control positivo de cinco ediciones.
- **`docs/PROTOCOLO_2.11-C_corrida_2026-08-01.md`** — congelado, uno nuevo por corrida
  (`CLAUDE.md` §7). Ojo: **no editar** el de `2026-07-31`.
- **`docs/HANDOFF_CODE.md`** — reescrito.
- **`docs/PENDIENTES_consistencia.md`**:
  - Tachar los dos P0 cerrados, con puntero a la corrida.
  - Reescribir el P0 de API con la forma nueva: sobre `/dev` el desfasaje de versión no
    aplica; la lista blanca `EJECUTABLES_REMOTOS_` se **difiere al Paso 6**, decisión del
    usuario del 01/08/2026.
  - **Abrir tres hallazgos** (ver abajo).

## 4 · Los tres hallazgos a abrir

**P0 — las siete filas huérfanas de `MAPEO` son columnas de fecha, no basura.**

```
rdv||RVD JM-CM - ES||fecha               fila 3
rdv||RDV_otros_ministros||fecha_periodo  fila 108
digital||Digital||fecha_periodo          fila 109
digital||Directa Mail||fecha_periodo     fila 110
digital||Directa IVR||fecha_periodo      fila 111
digital||Directa SMS||fecha_periodo      fila 112
digital||Seguimiento digital||fecha_periodo  fila 113
```

Seis consecutivas, cargadas a mano de una vez. Son las columnas con las que se filtra la
ventana temporal y **ningún `SEED_MAPEO_` las conoce**: una re-siembra desde cero deja el
filtrado por período sin mapeo y no lo avisa nadie. El informe saldría con números calculados
sobre la ventana equivocada — el modo de falla caro. Además contesta una de las preguntas
abiertas de `PENDIENTES` ("qué columna de fecha usa cada base para filtrar"): alguien ya la
contestó y la respuesta vive sólo en la planilla.

**P1 — asimetría Estado / Aplicar en las protegidas.** Aplicar emite diez líneas
`protegida (habría cambiado)`; Estado, sobre la misma planilla, ninguna. C.2-4 vive en
`aplicarClasificacionSolapas_`, que sólo corre en el apply. El criterio contrario está escrito
como comentario en `Instalar.gs:2064` para `solo_en_hoja` — *"si Aplicar lo va a reportar,
Estado tiene que verlo"*. Es el P0 recién cerrado en versión chica.

**P2 — `diagnosticoBases_()` lista solapas `uso = 'ignorar'`.** Enumera `getSheets()` crudo y
nunca consulta `usoSolapa_()` (`Config.gs:146`). En la salida aparecen `RVD JM-CM - ES Back Up`,
`Copia de Para Revisar`, cinco tablas dinámicas y `digital||RDV JM 2 VECES` — el duplicado que
`CLAUDE.md` §2 nombra como causa de doble conteo, y que la regla protege justamente para no
reabrir la discusión. **Es preexistente**, no de este paso: `diagnosticoBases_()` se extrajo tal
cual de `probarConexionBases()` en el Paso 1.8. Se veía poco porque vivía dentro de un `alert()`.

---

## Qué NO hacer

- No tocar `BASES.m2.hoja_default`. Sigue `sin_fuente` a propósito hasta resolver las 6 cuentas
  que están en `M2 Directa` y no en `Cuentas M2`.
- No arreglar ninguno de los tres hallazgos. Este paso los **anota**.
- No tocar `Instalar.gs` ni ninguna lógica. C.2-7 es documentación y export.
- No tocar la clasificación de las 17 filas en `revisar` de `SOLAPAS` (Paso 2.12 Parte 2) ni
  `SEED_MARCADORES_` (Paso 2.13).
- Sin trailer `Co-Authored-By`: ningún commit del repo lo tiene.

## Verificación

Antes del commit, y reportando el resultado, no la afirmación:

1. `git status --porcelain --untracked-files=all` limpio salvo lo que este paso agrega.
2. `grep -rn "<pendiente>" docs/BITACORA.md` — sin hashes olvidados.
3. Los snapshots abren como texto y tienen las **diez** hojas.
4. Ningún dato personal en lo que se va a commitear.

Commits separados: uno de export (snapshots), uno de documentación.
