# Paso 2.16 — Registrar M2 (primera medición de `D-01`)

**Estado:** vivo · **Fecha:** 2026-08-02 · **Ubicación:** `docs/Prompts/Paso-2.16_registrar_M2.md`

> Último ítem del Tramo 1 de `PLAN.md §2`. Va solo por `D-01`: es la primera medición del
> eje "base nueva" y compartir commit haría irrespondible **cuántas líneas de `.gs`
> necesitó**.
>
> **Un commit por parte. Se para y se avisa al final de cada una.**
>
> **Depende del `Paso-2.15` ejecutado y cerrado.** Si el 2.15 todavía no corrió, parar acá.

---

## Parte A — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

Este prompt se escribió desde afuera de la planilla. **Todo lo que sigue es hipótesis.** Si
una premisa venció, se reporta y no se edita nada.

**A.1 · Estado actual de `m2` en `BASES`.** Reportar la fila viva y la de `SEED_BASES_`,
campo por campo: `sheet_id`, `hoja_default`, `fila_encabezado`, `modo_periodo`, `activo`,
`notas`. Lo que tengo registrado y hay que confirmar: `hoja_default` **vacío a propósito**
(Paso 2.10 Parte C), `fila_encabezado` **3**, `modo_periodo` **`snapshot`**.

**A.2 · Filas de `MAPEO` con `base_id = m2`.** Listar `campo_logico · hoja · columna ·
notas`, de la hoja viva y del seed. Preguntas a responder con el listado a la vista:

- ¿Existe ya `fecha_periodo` para `m2`? Mi lectura es que **no**, y que lo que hay es
  `fecha` marcada `DEROGADA` (`S-02`), apuntando a `M2 periodo DIRECTA`.
- Las filas vivas de `m2` apuntan a `M2 periodo DIRECTA` / `M2 periodo DIGITAL`. El ítem
  del plan habla de otra solapa, `Directa mail`. **No son la misma solapa.**

**A.3 · La premisa que más chances tiene de estar vencida: cuál es la fuente.**
`PLAN.md §2` pide `fecha_periodo` → `Fecha envio` de la solapa **`Directa mail`**. Pero el
Paso 2.10 Parte C declaró `m2/Directa mail` como **`derivada`**, espejo de
`digital/Directa Mail`, que es la **`fuente`**. Reportar de `SOLAPAS`:

- el renglón de `m2 / Directa mail`: `uso`, `origen`, `fila_encabezado`, `filas_crudas`;
- el renglón de `digital / Directa Mail`: lo mismo.

Y responder: **¿mapear `m2.fecha_periodo` contra una solapa declarada `derivada` contradice
alguna regla vigente?** Si el motor debe leer la fuente y no el espejo, entonces el ítem del
plan está mal escrito y lo que corresponde no es una fila de `MAPEO` en `m2` sino usar
`digital`. **No resolverlo acá: reportarlo.** Es decisión del usuario.

**A.4 · Encabezados reales.** Abrir las dos solapas y reportar, sin interpretar:

- `m2 / Directa mail`: en qué fila está el encabezado, si existe una columna `Fecha envio`
  y en cuál letra, si existe `Estado` y en cuál letra.
- `digital / Directa Mail`: lo mismo.
- Para la columna `Estado` de las dos: los **valores distintos** que aparecen y el conteo de
  filas de cada uno. `REGLAS_NEGOCIO.md` registra `Implementado`, `Proyectado`, `En curso`
  para `digital/Directa Mail`. Confirmar si `m2/Directa mail` tiene los mismos.
- Advertencia a chequear, no a asumir: `FECHAS_seleccion.md` marca la columna de fecha de
  `digital/Directa Mail` con una observación de dato erróneo. Reportar qué dice hoy ese
  documento y si sigue vigente.

**A.5 · Choque de `fila_encabezado`.** `BASES.m2.fila_encabezado` es 3 y la solapa
`Directa mail` está registrada con encabezado en fila 1. Reportar cómo resuelve hoy el
lector esa diferencia: ¿gana el override de `SOLAPAS`, gana `BASES`, o no hay override y
leería la fila equivocada? Grepear el lector antes de responder.

**A.6 · El punto que mide `D-01`: el filtro por `Estado`.** Excluir `Estado = Proyectado`
es una **exclusión de filas por valor de columna**. Reportar si el motor ya tiene un
mecanismo **declarativo** para eso —una columna de filtro en `BASES` o en `MAPEO`, algo en
`Fuentes.gs` / `Parseo.gs`— o si hoy sólo se puede haciendo un `if` en `.gs`. Grepear los
filtros que ya existen (`status`, `Realizada`) y decir cómo están implementados: si están
hardcodeados, ése es el hallazgo.

**A.7 · Consumidores.** ¿Qué depende hoy de `m2`? Grepear `m2_` en `SEED_MARCADORES_` /
`MARCADORES` y en `Marcadores.gs`, y reportar si algún cálculo vivo cambia de resultado al
pasar `modo_periodo` de `snapshot` a `filtrar`. Si `m2` sigue sin fuente activa, el cambio
puede no mover nada y conviene saberlo antes.

**A.8 · Número libre.** Confirmar que no exista otro `Paso-2.16` en `docs/Prompts/` ni
citado en `BITACORA.md` / `PLAN.md`.

**Reportar A.1–A.8 y PARAR.** No editar nada todavía.

---

## Parte B — Cambios de configuración. **Sólo si A no venció ninguna premisa.**

Si A.3 mostró que la fuente correcta no es `m2/Directa mail`, **parar y pedir decisión**:
la Parte B cambia de destino y este prompt se corrige antes de ejecutarse.

**Predicción antes de correr — en celdas, no en filas** (`PLAN.md`, nota de método 3).
Escribir la predicción en el reporte **antes** de aplicar, y compararla después.

**B.1 · `modo_periodo` de `m2`: `snapshot` → `filtrar`,** en `SEED_BASES_` y en la hoja.
`BASES` ya está en `COLUMNAS_DELTA_`, así que no hay riesgo de reescritura de encabezados.
Actualizar también la `notas` de la fila: hoy dice que `m2` no tiene fuente activa; si eso
dejó de ser cierto, la nota miente.

**B.2 · `fecha_periodo` para `m2`** en `SEED_MAPEO_`, con la solapa y la columna que
confirmó A.4 — no con las que asume este prompt. No borrar la fila `fecha` derogada:
`S-02` la mantiene como constancia.

**B.3 · Exclusión de `Estado = Proyectado`,** por el camino que haya reportado A.6. Si el
camino es declarativo, es configuración. **Si exige tocar `.gs`, hacerlo y anotar el
número de líneas y el motivo** — ése es el dato del paso, no un efecto secundario.

**B.4 · Registrar la medición de `D-01`.** En `BITACORA.md`, para esta base nueva: qué se
resolvió con configuración, qué exigió `.gs`, cuántas líneas y **por qué**. La lista de
"por qué" es la hoja de ruta de `D-01`; sin ella el paso no cumple su función.

---

## Parte C — Verificación

1. Correr el diff de configuración y comparar contra la predicción de B. Reportar el
   resumen completo: `cambiadas · agregadas · migraciones · solo_en_hoja · protegidas (con
   diferencia) · protegidas (sin diferencia) · sin cambios`. **La referencia del 02/08 es
   `protegidas (con diferencia): 0`** — si sube, el paso no cierra.
2. Correr los controles de la(s) función(es) tocada(s) en B.3, si hubo.
3. `probarLecturaPeriodo` sobre `m2` con un período conocido: reportar filas leídas antes y
   después del filtro.

---

## Cierre

`BITACORA.md` (entrada del paso, con la medición de `D-01`), `HANDOFF_CODE.md` reescrito, y
`PLAN.md §2` con el ítem "Registrar M2" tachado y el resultado de la predicción que ese
mismo ítem dejó anotada. Un commit por parte.
