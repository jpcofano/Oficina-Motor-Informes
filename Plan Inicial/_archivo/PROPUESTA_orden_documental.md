# PROPUESTA — orden documental

> **Archivado (DOC-5 cerrado, 31/07/2026).** La tabla de autoridad, con las correcciones
> T-1 a T-5, G-2 y G-3, quedó **instalada en `CLAUDE.md` §7** — esa es la versión
> vigente; esta es la propuesta que le dio origen, con el inventario y la evidencia.
> El razonamiento de cada caso (Tareas 1–4) sigue siendo consultable acá.

> Producto de `docs/Prompts/DOC-5_orden_documental.md`. Tarea de solo lectura: no se movió,
> no se borró, no se editó ningún archivo. Método: tres agentes de lectura en paralelo
> (`docs/`, `docs/Prompts/`, `Plan Inicial/` + `docs/Sesiones/`) más verificación directa
> con `git log`, `grep` sobre `.gs` y lectura de `Plan Inicial/PROYECTO.md` §7/§9 y
> `docs/PENDIENTES_consistencia.md` en esta misma sesión.
>
> **Nota de método importante:** varios de los hallazgos de este documento ya estaban
> registrados en `docs/PENDIENTES_consistencia.md` antes de escribir esto (RUNBOOK
> desactualizado, referencias rotas a `Plan Inicial/_archivo/`, contadores que no cierran).
> No los repito como si fueran nuevos — los cito y remito al original.

---

## Tarea 1 — Inventario

96 archivos `.md` en el repo. La columna **lo cita** es reconstrucción por inversión de
las citas relevadas durante esta auditoría (no es un grep exhaustivo par-por-par para las
96×96 combinaciones) — cobertura buena pero no garantizada al 100%; donde no se encontró
ninguna cita entrante se lo marca explícitamente para poder cruzarlo con la Tarea 4.

### Raíz del repo

| ruta | tipo | autoridad (de qué es dueño) | últ. commit | lo cita | cita a |
|---|---|---|---|---|---|
| `CLAUDE.md` | gobierno / vivo | Convenciones de repo y ruteo documental | 2026-07-31 | `Plan Inicial/PROYECTO.md` (menciona su alineación, commit `dfe09bf`) | `Plan Inicial/PROYECTO.md`, `docs/RUNBOOK.md`, `docs/HANDOFF_CODE.md`, todos los docs vía tabla de ruteo §3 |

### `Plan Inicial/`

| ruta | tipo | autoridad | últ. commit | lo cita | cita a |
|---|---|---|---|---|---|
| `PROYECTO.md` | gobierno / vivo (documento maestro) | Arquitectura, esquema de datos, estado del proyecto (§7) y convenciones de mantenimiento (§9) | 2026-07-31 | `CLAUDE.md`, `docs/RUNBOOK.md`, casi todos los `docs/Prompts/*.md` | `docs/RUNBOOK.md`, `docs/TOKENS.md`, `docs/PENDIENTES_consistencia.md`, `docs/SUPUESTOS.md`, `docs/REGLAS_NEGOCIO.md`, `docs/BITACORA.md`, `docs/HANDOFF_CODE.md`, `docs/MAPEO_completo.md`, `docs/CONFIG_INFORMES.md`, `docs/DISENO_match_temario.md`, `docs/RDV_otros_ministros_riesgo.md`, `docs/PLANTILLAS_QA_y_armonizacion.md` |

**`Plan Inicial/_archivo/`** — 16 archivos, todos correctamente en estado *archivado* (nadie los edita, ninguno se citó como vigente desde un doc vivo salvo como historial):

| ruta | tipo | autoridad (histórica) | últ. commit | superado por |
|---|---|---|---|---|
| `ARQUITECTURA_registros.md` | archivado | Diseño original de las 6 hojas de registro | 2026-07-28 | `Plan Inicial/PROYECTO.md` §3/§5 |
| `CAMPANAS.md` | archivado | Diseño original de `CAMPANAS` (checklist de panel) | 2026-07-28 | esquema real en `PROYECTO.md` §3 |
| `DECISION-periodicidad-y-periodos.md` | archivado | Propuesta original de periodicidad + `PERIODOS` | 2026-07-31 | `PROYECTO.md` §4 (decisión ya confirmada, DOC-4) |
| `FUENTES.md` | archivado | Primer mapeo de bases/hojas/columnas | 2026-07-28 | `docs/MAPEO_completo.md`, `docs/CONFIG_INFORMES.md` §4.1 |
| `JM_tokens_marcados.md` | archivado | Primer inventario de tokens JM | 2026-07-29 | `docs/TOKENS.md` |
| `M2_mapeo_y_config.md` | archivado | Hallazgo original de `m2` (snapshot, fila 3) | 2026-07-28 | `SEED_MAPEO_` real, Paso 2.11 Parte B |
| `Paso-2.md` | archivado | Primera versión del prompt del Paso 2 | 2026-07-29 | `docs/Prompts/VERIFICACION_Paso-2.md` (descrito en `BITACORA.md` como "describía una función que nunca existió") |
| `Periodos_y_campanias.md` | archivado | Diseño de las 3 capas de período | 2026-07-28 | `PROYECTO.md` §4 |
| `PLAN .md` (con espacio) | archivado | Consolidación intermedia del plan (v3) | 2026-07-28 | `PROYECTO.md` §7 |
| `PLAN.v1_original.md` | archivado | Primera versión del plan (12 pasos) | 2026-07-28 | `PLAN .md`, luego `PROYECTO.md` |
| `Prompts/Paso-1.6.md` | archivado | Prompt original "registrar plantillas" | 2026-07-29 | `docs/Prompts/Paso-1.6-v2.md` |
| `Prompts/Paso-3.md` | archivado | Prompt original del primer cálculo | 2026-07-29 | `docs/Prompts/Paso-3-v2.md` |
| `PROYECTO_MotorInformes.md` | archivado | Versión vieja (28/07) del maestro | 2026-07-28 | `Plan Inicial/PROYECTO.md` (vigente) |
| `README.md` | archivado | README original, mapa de archivos por paso | 2026-07-28 | `CLAUDE.md` (vigente) |
| `SECCO_tokens_marcados.md` | archivado | Primer inventario de tokens SECCO | 2026-07-29 | `docs/TOKENS.md` |
| `TOKENS_diccionario_canonico.md` | archivado | Diccionario canónico de renombres (29/07) | 2026-07-29 | `docs/TOKENS.md`, `docs/PLANTILLAS_QA_y_armonizacion.md` |

### `docs/` (raíz, sin bajar a `Prompts/` ni `Sesiones/`) — 21 archivos

Todos están **ya declarados** en `Plan Inicial/PROYECTO.md` §9 (taxonomía DOC-1/DOC-4). Uso
esa clasificación oficial como `tipo`, marcando las discrepancias que encontré.

| ruta | tipo (según PROYECTO.md §9) | autoridad | últ. commit | cita a (relevante) |
|---|---|---|---|---|
| `AUD-2_union_digital_clave.md` | congelado (30/07) | Confirma que `unirDigitalPorCuenta()` une por `id_cuenta`, no por `clave` | 2026-07-30 | `Paso-2.7_destrabar_solapas.md`, `PROYECTO.md` |
| `BITACORA.md` | vivo, append-only, solo Code | Qué hizo cada paso, cronológico | 2026-07-31 | decenas — es el doc más citado del repo |
| `CONFIG_INFORMES.md` | congelado (según §9) — **discrepancia, ver Tarea 2** | Decisiones editoriales por informe (qué campañas, qué se carga a mano) | 2026-07-30 | `PLANTILLAS_QA_y_armonizacion.md`, `MAPEO_completo.md`, `HALLAZGOS_validacion_decks.md` |
| `DISENO_match_temario.md` | congelado (con addendum del 31/07 transparente) | Diseño del score de confianza para match de temario | 2026-07-31 | `PROYECTO.md`, `Paso-2.6_registro_solapas.md` |
| `FECHAS_seleccion.md` | congelado (self-declarado) | Qué columna de fecha se eligió por solapa | 2026-07-30 | `Paso-2.3.1.md`, `Paso-2.3.2.md`, `RDV_otros_ministros_riesgo.md`, `REGLAS_NEGOCIO.md` |
| `GRANO_TEMPORAL.md` | congelado (doctrina) | Por qué la fecha de reunión no filtra canales | 2026-07-31 | ninguna explícita (sí lo citan `Paso-2.9E.md`, `PENDIENTES_consistencia.md`) |
| `HALLAZGOS_validacion_decks.md` | congelado (29/07) | Por qué el deck JM no es ground truth exacto | 2026-07-29 | ninguna con ruta explícita (sí lo citan `VERIFICACION_Paso-2.md`, `PENDIENTES_consistencia.md`) |
| `HANDOFF_CODE.md` | vivo, se reescribe, solo Code | Dónde estamos ahora (puntero al presente) | 2026-07-31 | `BITACORA.md`, `Paso-2.11...md`, `Paso-2.12...md` |
| `INFORMES_relacion.md` | congelado | Qué tokens comparten JM/SECCO (93) y cuáles son exclusivos | 2026-07-30 | ninguna explícita |
| `MAPEO_completo.md` | congelado (self-declarado) | Relevamiento columna por columna de las 4 bases (28-29/07) | 2026-07-29 | `Paso-1.9.md` (implícito) |
| `OBJETIVO_lamina_nueva.md` | vivo, "se refina" | Diseño del flujo de lámina nueva por lenguaje natural | 2026-07-31 | ninguna explícita |
| `PENDIENTES_consistencia.md` | vivo, lista de trabajo | Inconsistencias documentales abiertas, P0/P1/P2 | 2026-07-31 | numerosas — ver Tarea 2 |
| `PLANTILLAS_QA_y_armonizacion.md` | congelado (29/07) | QA posicional de plantillas + armonización de tokens | 2026-07-29 | `DISENO_match_temario.md`, `PROYECTO.md` |
| `RDV_otros_ministros_riesgo.md` | congelado (self-declarado) | Encabezados de `RDV_otros_ministros` no corresponden a los datos; generaliza el riesgo | 2026-07-30 | `FECHAS_seleccion.md`, `REGLAS_NEGOCIO.md`, `DOC-3_verificacion_bases_vivas.md`, `PROYECTO.md` |
| `REGLAS_NEGOCIO.md` | vivo, append-only, ID `R-NN` | Reglas del dominio que el motor da por ciertas | 2026-07-31 | `FECHAS_seleccion.md`, `DOC-3...md`, `VALIDACION_2026-07-31.md`, `GRANO_TEMPORAL.md`, `Paso-2.10...md` (x2), `REGLAS_R09_R10.md` |
| `RUNBOOK.md` | vivo — **desactualizado, ver Tarea 4** | Guía operativa paso a paso | 2026-07-28 | `Paso-0.5.md`, `Paso-1.6.md` (archivado — referencia rota) |
| `SECCIONES.md` | congelado (v2, verificado) | Inventario real de secciones y modo de emisión | 2026-07-31 | `Paso-2.9H.md` |
| `SUPUESTOS.md` | vivo, append-only, ID `S-NN` | Supuestos asumidos desde el Paso 2.9 | 2026-07-31 | sin cita `.md` explícita (mismo criterio que `REGLAS_NEGOCIO.md`) |
| `TEMARIO_Y_PLANTILLA_2026-07-31.md` | congelado (31/07) | De dónde sale el temario semanal; diff de plantilla | 2026-07-31 | `docs/Sesiones/HANDOFF 2026-07-31.md`, `REGLAS_NEGOCIO.md` |
| `TOKENS.md` | vivo (diccionario) | Diccionario canónico de tokens + bloque de encuentro repetible | 2026-07-30 | `PROYECTO.md`, tokens archivados fusionados, `Paso-2.2.md`, `PLANTILLAS_QA_y_armonizacion.md`, `CONFIG_INFORMES.md` |
| `VALIDACION_2026-07-31.md` | congelado (31/07) | Validación del informe SECCO publicado contra las 4 bases | 2026-07-31 | `docs/Sesiones/HANDOFF 2026-07-31.md`, `REGLAS_NEGOCIO.md` |

### `docs/Prompts/` — 48 archivos

Por diseño (`PROYECTO.md` §9, tabla "Directorios") estos son point-in-time: "no se editan
una vez ejecutados". La tabla marca cuáles quedan reemplazados en la práctica por otro
prompt posterior, con evidencia.

| ruta | tipo | de qué paso/tarea es | últ. commit | ¿reemplazado por? |
|---|---|---|---|---|
| `AUD-1_auditoria_solapas.md` | AUD-1, congelado | Por qué solapas cableadas no aparecían en `DIAG_BASES` (H1–H4) | 2026-07-30 | Conclusión superada por `Paso-2.6_registro_solapas.md` Parte A (el bug era del diagnóstico, no de `sheet_id`) — el doc en sí queda como historial válido |
| `DOC-1_consolidacion.md` | DOC-1, congelado | Consolidación documental 29/07 (13→8 vivos) | 2026-07-29 | Su taxonomía de §9 queda superada por `DOC-4_taxonomia_y_bitacora.md` (dice "hoy tiene 20 más dos directorios") |
| `DOC-2_alineacion_prompts.md` | DOC-2, congelado | Alinear prompts no ejecutados con clave `(base_id,solapa,campo_logico)` | 2026-07-30 | No — resultado vigente, citado como "ya hecho" desde `Paso-3-v2.md` |
| `DOC-3_verificacion_bases_vivas.md` | DOC-3, congelado | Correcciones de config verificadas contra bases reales + R-02 | 2026-07-30 | Parte A (`looker=resumen_metricas`) revertida definitivamente en `Paso-2.9C.md` (S-01) |
| `DOC-4_taxonomia_y_bitacora.md` | DOC-4, congelado | Taxonomía completa (21 docs) + régimen BITACORA/HANDOFF_CODE | 2026-07-31 | No — vigente; continuado por este mismo `DOC-5` |
| `DOC-5_orden_documental.md` | DOC-5, en curso | Este prompt | sin commit (nuevo) | — |
| `Paso-0.md` | Paso-0, congelado | Setup git + 5 hojas de config | 2026-07-27 | Sí — reemplazado explícitamente por `Paso-0-v2.md` |
| `Paso-0-v2.md` | Paso-0 v2, congelado | `instalar()`/`onOpen()` con 6 hojas (agrega `BASES`) | 2026-07-28 | No |
| `Paso-0.5.md` | Paso 0.5, congelado | Hoja `PERIODOS` + `periodo_ref` | 2026-07-28 | No |
| `Paso-1.md` | Paso 1, congelado | Lector de registros + `abrirBase()` con caché | 2026-07-28 | No |
| `Paso-1.6-v2.md` | Paso 1.6 v2, congelado | Registro robusto de plantillas (reemplaza a `Paso-1.6.md` archivado) | 2026-07-28 | No |
| `Paso-1.7.md` | Paso 1.7, congelado | Seed inicial `BASES`+`MAPEO`+`CONFIG` | 2026-07-28 | Su `MAPEO` incompleto de `rdv` lo completa `Paso-1.9.md` |
| `Paso-1.8.md` | Paso 1.8, congelado | Convención "un commit por paso" + timezone/scopes | 2026-07-28 | Parte B extendida por `Paso-1.8-B.md`; Parte C (bitácora en `HANDOFF.md`) superada por el régimen `BITACORA.md`/`HANDOFF_CODE.md` de DOC-4 |
| `Paso-1.8-B.md` | Paso 1.8-B, congelado | Parche de scopes OAuth + `userinfo.email` | 2026-07-28 | No |
| `Paso-1.9.md` | Paso 1.9, congelado | `MAPEO` completo + `fila_encabezado`/`modo_periodo` | 2026-07-28 | Su elección `looker.hoja_default=resumen_metricas` fue disputada/revertida en el ciclo DOC-3→2.7→2.8→2.9C |
| `Paso-2.1.md` | Paso 2.1, congelado | Cerrar el lector: filas vacías + columna de fecha por base | 2026-07-29 | Su contrato de columna `fecha` reemplazado por `fecha_periodo` en `Paso-2.3.1.md`/`Paso-2.3.2.md` |
| `Paso-2.2.md` | Paso 2.2, congelado | Armonizar tokens antes de sembrar `MARCADORES` | 2026-07-29 | Sí — según `Paso-2.2.2.md`, se armonizó el archivo de Drive equivocado; hubo que rehacerlo |
| `Paso-2.2.1.md` | Paso 2.2.1, congelado | Parche: regresión SECCO + matriz M2 | 2026-07-30 | Sí — `Paso-2.2.2.md` revela que nunca se ejecutó contra las Slides reales |
| `Paso-2.2.2.md` | Paso 2.2.2, congelado | Plantilla canónica única + backup + re-armonizar | 2026-07-30 | No — estado más reciente sobre armonización |
| `Paso-2.3.md` | Paso 2.3, congelado | Sembrar `digital` + diagnóstico honesto | 2026-07-29 | Su descarte de filas "sin clave" resulta ser el mismo bug de colapso que corrige `Paso-2.9B.md` |
| `Paso-2.3.1.md` | Paso 2.3.1, congelado | Detección automática de columnas de fecha, contrato `fecha_periodo` | 2026-07-30 | Sí — su decisión de nombrar `<solapa>_fecha_periodo` corregida por `Paso-2.3.2.md` |
| `Paso-2.3.2.md` | Paso 2.3.2, congelado | `solapa` entra en la clave de `MAPEO`; `buscarMapeo()` | 2026-07-30 | No — estándar vigente |
| `Paso-2.3.3.md` | Paso 2.3.3, congelado | Preselección de `DIAG_FECHAS` + guardarraíles | 2026-07-30 | No |
| `Paso-2.4.md` | Paso 2.4, congelado | `Union.gs`: join `digital` + `anclarEncuentros()` | 2026-07-30 | Parte B (portón con timeout) rediseñada de raíz por `Paso-2.9F.md` |
| `Paso-2.5.md` | Paso 2.5, congelado | Sembrar `MARCADORES` desde tokens `{{...}}` | 2026-07-30 | Ver Tarea 3 — `Paso-2.13...md` constata que `MARCADORES` nunca tuvo `SEED_*` |
| `Paso-2.6_registro_solapas.md` | Paso 2.6, congelado | Hoja `SOLAPAS` + fix del bug que motivó AUD-1 | 2026-07-30 | Clasificación inicial reemplazada por `Paso-2.12...md` Parte 2; indecisión de `looker` resuelta en `Paso-2.9C.md` |
| `Paso-2.7_destrabar_solapas.md` | Paso 2.7, congelado | Destrabar siembra de `SOLAPAS`; columna `origen` | 2026-07-30 | Parte D (`looker`=`resumen_metricas`) revertida en `Paso-2.9C.md` |
| `Paso-2.8_cerrar_lectura.md` | Paso 2.8, congelado | `alcance`, `looker`, misterio de `m2`=18 | 2026-07-30 | Decisión de `looker` revertida por `Paso-2.9C.md`; `m2`=18 confirmado correcto (no bug) en `Paso-2.9B.md` |
| `Paso-2.9_v2_lector_y_corte_vertical.md` | Paso 2.9 v2, congelado | Plan íntegro (7 partes A–G) | 2026-07-29 | Sí, confirmado por el propio commit `6c78402`: descompuesto en `Paso-2.9A.md`–`Paso-2.9H.md` |
| `Paso-2.9A.md` | Paso 2.9A, congelado | Diagnóstico del colapso por clave | 2026-07-31 | No |
| `Paso-2.9B.md` | Paso 2.9B, congelado | Fix del colapso por clave | 2026-07-31 | No |
| `Paso-2.9C.md` | Paso 2.9C, congelado | Higiene: revierte `looker`, descarta `RDV JM 2 VECES` | 2026-07-31 | No — cierra definitivamente el ciclo `looker` |
| `Paso-2.9D.md` | Paso 2.9D, congelado | Hoja `REUNIONES` | 2026-07-31 | No |
| `Paso-2.9E.md` | Paso 2.9E, congelado | Corte vertical: 10 tokens ECV "Retiro 24/07" | 2026-07-31 | Sí — el corte vertical cambia de caso en `Paso-2.10_ParteD...md` (pasa a Orden Público 28/07) |
| `Paso-2.9F.md` | Paso 2.9F, congelado | Algoritmo de anclaje genérico (`anclar_()`) | 2026-07-31 | No |
| `Paso-2.9G.md` | Paso 2.9G, congelado | Hoja `SECCIONES` jerárquica | 2026-07-31 | No |
| `Paso-2.9H.md` | Paso 2.9H, congelado | Hoja `VALORES`/`VALORES_DIVERGENTES` | 2026-07-31 | No |
| `Paso-2.10_anclar_a_numeros_verificados.md` | Paso 2.10, congelado — **parcialmente muerto, ver Tarea 4** | Anclar a los 37+ números verificados del 31/07 (Partes A–G) | 2026-07-31 | Partes B y C reemplazadas por `Paso-2.10_PartesBC_verificado.md`; Parte D por `Paso-2.10_ParteD_con_R10.md`; Partes A/E/F/G vigentes |
| `Paso-2.10_PartesBC_verificado.md` | Paso 2.10 (addendum), congelado | Reemplazo verificado de Partes B/C | 2026-07-31 | No — es el vigente (reescrito en el sitio una vez, ver Tarea 2 caso 3) |
| `Paso-2.10_ParteD_con_R10.md` | Paso 2.10 (addendum), congelado | Reemplazo de Parte D, antepone R-10 | 2026-07-31 | No — vigente |
| `Paso-2.11_una_sola_fuente_de_verdad.md` | Paso 2.11, vivo (en ejecución) | Consolidación: config en un solo lugar, con diff | 2026-07-31 | No — Partes D/E/G del 2.10 en espera, no reemplazadas |
| `Paso-2.12_conteos_y_clasificacion.md` | Paso 2.12, vivo (Parte 1 hecha) | Corrige `filas_crudas`; cierra clasificación `revisar` | 2026-07-31 | No |
| `Paso-2.13_una_fuente_por_cosa.md` | Paso 2.13, pendiente de ejecutar | `SEED_MARCADORES_` (no existía) + reconciliar contra CSV validado | sin commit (nuevo) | No — más reciente de la cadena 2.9–2.13 |
| `Paso-3-v2.md` | Paso 3 v2, congelado | `Marcadores.gs`: `SUMA/CONTEO/RATIO/ULTIMO/TEXTO/PCT` | 2026-07-30 | Reemplaza explícitamente a `Paso-3.md` (archivado) |
| `Paso-4.md` | Paso 4, congelado (no ejecutado) | Motor de reemplazo en Slides (`Generador.gs`) | 2026-07-30 | No |
| `Paso-5.md` | Paso 5, congelado (no ejecutado) | Campañas repetibles + end-to-end | 2026-07-30 | No |
| `REGLAS_R09_R10.md` | **mal clasificado — ver Tarea 4** | Contenido normativo (R-09, R-10) "para agregar a `REGLAS_NEGOCIO.md`" | 2026-07-31 | Su R-10 lo implementa `Paso-2.10_ParteD_con_R10.md`; su contenido ya está en `REGLAS_NEGOCIO.md` |
| `VERIFICACION_Paso-2.md` | Verificación/gobierno de un paso | Checklist de aceptación del Paso 2 (P1–P5, A1–A10) | 2026-07-29 | Referencia rota interna (ver Tarea 2) |

### `docs/Sesiones/` — 9 archivos

Ver Parte 2 más abajo (Tarea 2, caso de duplicación/contradicción de handoffs) — la tabla
de fechas y estado está ahí porque el hallazgo es exactamente sobre inconsistencia entre
estos archivos.

---

## Tarea 2 — Duplicaciones

### Caso 1 — `BASES.m2.hoja_default` (el que pedía el prompt)

**Consistente, no contradictorio.** Cadena completa con evidencia:

- `docs/Prompts/Paso-2.10_PartesBC_verificado.md:207` — ordena dejarlo vacío: *"cambiarlo a
  vacío... para que el fallo sea visible y no silencioso."*
- `docs/BITACORA.md:370` (Paso 2.10 Parte C) — confirma el cambio: *"`SEED_BASES_.m2.hoja_default`
  → `''`"*.
- `docs/BITACORA.md:381-385` — la vuelta de prueba post-siembra queda pendiente ahí mismo.
- `docs/BITACORA.md:392-394` (Paso 2.11 Parte A) — explica la causa raíz de por qué esa
  prueba parecía fallar: `HOJAS_CONFIG_.ejemplos` seguía teniendo `'M2 periodo DIRECTA'`
  hardcodeado y revertía el cambio en silencio si `instalar()` corría después de
  `seedConfiguracion()`. Se elimina esa segunda fuente.
- `docs/HANDOFF_CODE.md:23` — cita el mismo caso como motivación del diff/orden fijo de
  `menuAplicarConfiguracion_()`.
- `Plan Inicial/PROYECTO.md:204` — mismo estado (`m2` sin `hoja_default`).

Las cinco fuentes dicen lo mismo hoy: `m2.hoja_default` está vacío a propósito, y la
causa del vaivén anterior (doble fuente de verdad) ya está corregida. **No verificable
desde el repo**: la columna `notas` de la hoja `BASES` en la planilla viva —no es un
archivo `.md`, no tengo acceso a Sheets desde esta sesión. Si alguien la revisa y no
coincide con lo de arriba, es la planilla la que está atrasada, no la documentación.

### Caso 2 — Fix de `sembrarClasificacionSolapas()`

**El propio prompt DOC-5 asume que este fix "no quedó escrito en ningún documento" — la
premisa está desactualizada.** Sí está documentado, en dos lugares:

- `docs/BITACORA.md:512-517` (entrada "Paso 2.11 Parte C"): *"Corregido de paso:
  `aplicarClasificacionSolapas_()` ya NO escribe `filas_datos` ni `firma_encabezado` al
  clasificar — esas dos las escribe `inventariarSolapas()`..."*
- `docs/HANDOFF_CODE.md:27-29`: mismo hecho, mismo texto en sustancia.

No aparece en ningún doc de referencia (`REGLAS_NEGOCIO.md`, `SUPUESTOS.md`,
`RDV_otros_ministros_riesgo.md`) — pero tampoco tendría que, porque no es una regla de
negocio ni un supuesto: es una corrección de bug, y `docs/BITACORA.md` es exactamente el
lugar declarado por `CLAUDE.md` §3 para "qué hizo un paso". El sistema funcionó como
está diseñado. El riesgo real no es que falte el registro — es que `docs/BITACORA.md` y
`docs/HANDOFF_CODE.md` son los dos únicos lugares donde vive este tipo de fix, y
`HANDOFF_CODE.md` se reescribe: dentro de un par de pasos este hecho va a existir solo en
`BITACORA.md` (que es append-only, así que no se pierde, pero hay que saber buscarlo ahí).

### Caso 3 — `Paso-2.10_PartesBC_verificado.md` — ¿versión vieja pisada por una nueva?

**No es lo que se sospechaba, pero apareció un problema real relacionado.**

Con `git log --follow -p` se confirma: es **un solo archivo**, reescrito en el sitio una
vez (`764dc1e` creación → `a689233` revisión, mismo `path`, ambos el 31/07 antes de que
`fa1d595` "Paso 2.10 Parte C" ejecutara lo que ordena). No hay dos archivos con contenido
duplicado. La revisión (`a689233`) corrigió un error propio: la v1 sostenía que la brecha
de 899 filas sin fecha en `looker` era un bug real; la v2 retira esa afirmación porque
`ac39876` ya la había cerrado. Es exactamente el comportamiento que `CLAUDE.md` pide: un
prompt no ejecutado se puede corregir antes de correrlo.

**El problema real está en otro archivo: `Paso-2.10_anclar_a_numeros_verificados.md`
(el prompt original) sigue vivo hoy con sus Partes B y C originales**, con el criterio de
aceptación viejo (`filas_datos=18`, "cuatro" solapas `periodo` en vez de seis) — pese a
que tanto la v1 como la v2 de `Paso-2.10_PartesBC_verificado.md` dicen explícitamente que
lo reemplazan. Nadie marcó esas dos partes como superadas dentro del archivo original, ni
se archivó, ni se recortó. Sus Partes A, D, E, F y G siguen vigentes y las cita
`Paso-2.11...md` como pendientes — así que no se puede simplemente archivar el archivo
entero. Es un caso de **partes vivas y partes muertas conviviendo en el mismo prompt**, sin
nota. Va a Tarea 5 como `se decide arriba`.

### Caso 4 — `CLAUDE.md` duplicado

**No hay duplicado hoy.** `Glob **/CLAUDE.md` devuelve solo la raíz. Sí hubo una copia
histórica en `docs/` (según `docs/Sesiones/_archivo/HANDOFF 2026-07-31-3.md`: *"antes en
`docs/`, por eso Code nunca lo leía y corría los pasos de corrido sin frenar"*), resuelta
por el commit `dfe09bf` ("CLAUDE.md alineado con la taxonomía de §9", 31/07). Nada que
hacer acá.

### Caso 5 — Handoffs: ¿un solo handoff vivo?

**Contradicción real, la más seria de esta auditoría.** La regla (`CLAUDE.md` §5,
`PROYECTO.md` §9): archivo nuevo por sesión, nunca se edita uno anterior, el más
reciente por fecha es el vivo, el resto va a `_archivo/`.

| archivo | fecha en nombre/contenido | ubicación hoy | en git |
|---|---|---|---|
| `docs/Sesiones/HANDOFF 2026-07-31-2.md` | 31/07, sesión 2 de 3 | **vivo** (fuera de `_archivo/`) | commiteado (`ca9e74a`) |
| `docs/Sesiones/_archivo/HANDOFF 2026-07-31-3.md` | 31/07, sesión 3 de 3 — el propio texto dice "continúa a HANDOFF 2026-07-31-2.md" (o sea, es posterior) | archivado | **no commiteado — único `.md` sin trackear del repo entero** |

`git log --oneline -- docs/Sesiones/` confirma que el commit `ca9e74a` (13:41, 31/07) que
fijó "un solo handoff vivo: HANDOFF 2026-07-31-2.md" es anterior a la existencia del
archivo `-3`: en ese momento `-3` todavía no existía, así que la regla se aplicó
correctamente *en su momento*. El archivo `-3` se depositó después, directo en `_archivo/`,
por fuera de git — consistente con que sea claude.ai quien lo dejó ahí (`CLAUDE.md` §5:
"Code no escribe ahí nunca, ni crea archivos nuevos"), pero el efecto es que **el handoff
más nuevo terminó archivado sin pasar nunca por "vivo"**, y el que hoy se lee como punto de
partida (`-2`) es en realidad el penúltimo.

Contenido contradictorio entre ambos:
- `-2` cierra con una pregunta sin resolver sobre si `leerFuente()` colapsa por clave en
  `m2`. `-3` la resuelve explícitamente: *"El colapso del lector no existe — cerrado...
  `leerFuente` siempre estuvo bien."*
- `-3` documenta la existencia de `Paso-2.13`, la clasificación decidida de las 17 solapas
  `revisar`, y que `MARCADORES` no tiene sembrador — nada de esto está en
  `docs/HANDOFF_CODE.md` (que cubre hasta Paso 2.12 Parte 1) ni en `PROYECTO.md`.

Quien arranque la próxima sesión leyendo solo el handoff "vivo" (`-2`) persigue un
fantasma ya cerrado en `-3`. Va a Tarea 5 como `se decide arriba` — no es una decisión que
me corresponda tomar sola (implica mover un archivo fuera de `_archivo/`, que la
restricción de esta tarea prohíbe).

### Caso 6 — S-01 (`looker/resumen_metricas_dinamico`)

**Consistente en todo lo verificable desde el repo.**

- `docs/SUPUESTOS.md` (fila S-01, ID estable): la formulación canónica.
- `docs/BITACORA.md:248` (Paso 2.9): origen del supuesto.
- `docs/Prompts/Paso-2.9_v2_lector_y_corte_vertical.md:23,86-113`: prompt de origen,
  redacción casi idéntica.
- `docs/Prompts/Paso-2.10_PartesBC_verificado.md:37-39`: confirma que sigue vigente al
  31/07 (*"la fuente ya está movida al dinámico (S-01)"*).

**No verificable desde el repo:** las `notas` de `BASES` y `SOLAPAS` en la planilla viva
(mismo motivo que el Caso 1 — no es un `.md`, no hay acceso a Sheets desde acá). No
aparece S-01 en ningún otro `.md` de `docs/` fuera de `SUPUESTOS.md` y `BITACORA.md`
(confirmado por grep global de "S-01" — no se repitió el texto en más archivos).

### Duplicaciones adicionales encontradas (no pedidas explícitamente, aparecieron solas)

- **`PROYECTO.md` §7 vs. `docs/BITACORA.md`/`docs/HANDOFF_CODE.md` — mismo hecho ("en qué
  paso estamos"), versiones distintas.** §7 se detiene en el Paso 2.4 y dice "Firma de
  encabezados... **Sin implementar**"; `docs/BITACORA.md` "Paso 2.11 Parte B" y
  `docs/HANDOFF_CODE.md` dicen que `firma_encabezado` **ya está implementada**. §7 no
  menciona ningún paso del 2.6 al 2.13. Encima la cabecera de `PROYECTO.md` dice "Última
  actualización: 30/07/2026" pero el cuerpo (§9) ya cita eventos del 31/07 — el propio
  timestamp de portada no coincide con el contenido que lo rodea. Ver Tarea 4.
- **`docs/CONFIG_INFORMES.md` se autodeclara "Documento vivo / Estado: borrador" en su
  propio encabezado, pero `Plan Inicial/PROYECTO.md` §9 lo clasifica entre los
  *congelados*.** Dos fuentes de gobierno documental (el propio archivo y el maestro) dicen
  cosas distintas sobre el mismo archivo. Ninguna es obviamente la correcta: si el
  contenido de configuración por informe todavía se toca a mano (razonable, dado que dice
  "borrador"), el maestro está mal; si ya se cerró, el propio archivo no se actualizó.
- **`docs/RUNBOOK.md` describe un estado del proyecto que ya no es este** — ya registrado
  en `docs/PENDIENTES_consistencia.md` P1 con el detalle completo (clasp create para un
  proyecto que ya existe, "6 hojas" cuando son 7+`PERIODOS`, faltan columnas de `BASES`,
  manda a un prompt archivado, omite 8 pasos). No lo repito acá punto por punto — remito al
  original. Lo nuevo que aporto: **nadie desde entonces amplió esa lista** pese a que
  siguieron 2.6–2.13; el RUNBOOK está aún más atrás hoy que cuando se escribió el pendiente.

---

## Tarea 3 — Hechos sin respaldo documental

**El caso conocido, confirmado por código:** `MARCADORES` no tiene sembrador. Grep directo
sobre `Instalar.gs`:

```
$ grep -n "^var SEED_" Instalar.gs
SEED_INFORMES_, SEED_BASES_, SEED_MAPEO_, SEED_PERIODOS_, SEED_CAMPANAS_EJEMPLO_,
SEED_REUNIONES_EJEMPLO_, SEED_SOLAPAS_, SEED_CONFIG_DEFAULTS_, SEED_SECCIONES_
```

Nueve `SEED_*`, ninguno para `MARCADORES` — pese a que `CLAUDE.md` §2 la nombra
explícitamente como una de las hojas de registro del motor. Sus filas viven únicamente en
la planilla instalada. **Ya está en la cola:** `docs/Prompts/Paso-2.13_una_fuente_por_cosa.md`
(no ejecutado todavía, sin commit) dice explícitamente que va a crear `SEED_MARCADORES_`.
No es un hallazgo nuevo — es la confirmación de que el prompt que ya existe para resolverlo
sigue pendiente de correr.

No encontré otras hojas de registro (de las nombradas en `CLAUDE.md` §2: `CONFIG`, `BASES`,
`INFORMES`, `MARCADORES`, `MAPEO`, `CAMPANAS`, `PERIODOS`) sin `SEED_*` — las siete
restantes están cubiertas. `SOLAPAS` y `SECCIONES`, aunque no están en la lista original de
`CLAUDE.md` §2, también tienen sembrador.

---

## Tarea 4 — Documentos huérfanos y muertos

### Huérfanos

**Ninguno confirmado.** Los cuatro candidatos que no citan a ningún otro `.md`
(`GRANO_TEMPORAL.md`, `HALLAZGOS_validacion_decks.md`, `INFORMES_relacion.md`,
`OBJETIVO_lamina_nueva.md`) sí están citados desde otro lado — como mínimo, los 21
documentos de `docs/` raíz están todos declarados por nombre en `Plan Inicial/PROYECTO.md`
§9, que cuenta como cita. Un huérfano de verdad requiere las dos condiciones (nadie lo cita
y él no cita a nadie); acá siempre falta la primera.

### Muertos (o parcialmente muertos)

1. **`Plan Inicial/PROYECTO.md` §7 — el hallazgo más importante de esta auditoría, y el
   mismo tipo de problema que motivó este prompt.** Describe el estado del proyecto como
   detenido en el Paso 2.4, con "Firma de encabezados... Sin implementar", y salta directo
   a "Paso 3 — primer cálculo... pendiente". Evidencia de que es falso: `docs/BITACORA.md`
   registra Pasos 2.6, 2.7, 2.8, 2.9 (A–H completo, incluye el primer cálculo real en
   `Marcadores.gs` con `opSUMA`/`opCONTEO`/etc.), 2.10 (Partes B/C), 2.11 (A/B/C) y 2.12
   (Parte 1) — todos con commit. `docs/HANDOFF_CODE.md` dice que estamos en Paso 2.11 Parte
   C. Es exactamente "el documento que dice algo razonable y desactualizado" que
   `DOC-5_orden_documental.md` cita en su propio "Por qué". §9 del mismo archivo, en
   cambio, está al día (taxonomía DOC-4, 31/07). El desfasaje es solo en §7.

2. **`docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md`, Partes B y C** — contenido
   contradicho sin marca (ver Tarea 2, Caso 3). No es archivable entero porque sus Partes
   A/D/E/F/G siguen vigentes.

3. **`docs/Prompts/REGLAS_R09_R10.md`** — no es un prompt: no tiene Partes con instrucción
   de tarea, no define commit esperado, no tiene protocolo de prueba. Su propio encabezado
   dice *"para agregar a `docs/REGLAS_NEGOCIO.md`"* — es contenido normativo (R-09, R-10)
   parqueado en el directorio equivocado, sin el prefijo `DOC-N` que pide `CLAUDE.md` §3
   para "prompt de trabajo documental". Su contenido ya está efectivamente en
   `docs/REGLAS_NEGOCIO.md` (confirmado: la propia regla lo cita como origen). Vive como un
   duplicado parcial de algo que ya migró a su lugar correcto.

4. **`docs/Prompts/VERIFICACION_Paso-2.md`** — hallazgo menor: el propio archivo se
   autorreferencia con la ruta `docs/VERIFICACION_Paso-2.md` en vez de
   `docs/Prompts/VERIFICACION_Paso-2.md` (señalado también desde `Paso-2.1.md`). Referencia
   rota interna, sin corregir.

5. **`docs/AUD-2_union_digital_clave.md` y `docs/Prompts/AUD-1_auditoria_solapas.md`** — no
   están muertos, pero corresponde una nota: son investigaciones de solo lectura fechadas,
   y en el caso de AUD-1 su hipótesis principal terminó siendo la equivocada (el bug era del
   diagnóstico, no de `sheet_id`). Como AUD son honestas — documentan el proceso de
   descarte, no una conclusión falsa presentada como vigente — así que quedan bien como
   *congeladas*, no como muertas. Las menciono para que quien las lea sepa que la
   conclusión de AUD-1 fue revisada después.

---

## Tarea 5 — La propuesta

> **Parte 2 (31/07/2026) — decisiones tomadas y aplicadas.** Cinco filas quedaron en `se
> decide arriba` en la Parte 1. Las cinco se decidieron y ya están aplicadas: D-1
> (handoffs), D-2 (`PROYECTO.md` §7), D-3 (`CONFIG_INFORMES.md`/taxonomía de §9) y D-4
> (`REGLAS_R09_R10.md`) — commits `b9d57c5`+`d916e94` (D-1) y el commit de esta Parte 2
> (D-2 a D-4). La tabla de abajo se actualiza in situ para que quede como referencia de
> qué se decidió, no como snapshot de lo que faltaba decidir; el razonamiento original de
> cada caso sigue completo en la Tarea 2.

### Tabla de acciones

Regla general: los 96 archivos ya están, en su enorme mayoría, en el estado correcto según
la taxonomía existente de `PROYECTO.md` §9 y la convención "no se editan una vez
ejecutados" de `docs/Prompts/`. La propuesta no es reorganizar el repo — es resolver los
puntos concretos que aparecieron.

| archivo(s) | acción | por qué |
|---|---|---|
| Los 21 de `docs/` raíz (excepto `RUNBOOK.md`) | `queda` | Coinciden con la taxonomía de `PROYECTO.md` §9 (ya sin estado central, D-3) |
| `docs/CONFIG_INFORMES.md` | **`queda`, vivo de forma permanente** — D-3 aplicado | No era transitorio: el contenido editorial es curado a mano por diseño. El error estaba en que `PROYECTO.md` §9 lo listara congelado — corregido de raíz sacando el estado de la taxonomía (ver §9 nuevo) |
| `docs/RUNBOOK.md` | `queda`, con prioridad alta de actualización | Ya diagnosticado en `PENDIENTES_consistencia.md` P1; sigue siendo el único doc con instrucciones ejecutables, así que archivarlo o fusionarlo no resuelve nada — hay que refrescarlo, tarea aparte |
| `Plan Inicial/PROYECTO.md` §9 | `queda`, reescrito — D-3 aplicado | Deja de asignar vivo/congelado por documento; pasa a índice de ruteo (ruta/qué contiene/quién edita). El estado, cuando aplica, lo autodeclara cada documento |
| `Plan Inicial/PROYECTO.md` §7 | `queda`, reescrito — D-2 aplicado | Deja de narrar avance con ✅/pendiente; pasa a roadmap por bloques sin estado + puntero a `docs/HANDOFF_CODE.md`/`docs/BITACORA.md` |
| Los 16 de `Plan Inicial/_archivo/` | `queda` | Correctamente archivados, sin acción pendiente |
| `docs/Prompts/*.md` (la gran mayoría — Paso-N ya ejecutados) | `queda` | Es su función: registro point-in-time. Que estén "superados" por un paso posterior es el diseño esperado, no un error, siempre que quede citado desde algún lado (y en todos los casos revisados, queda) |
| `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` | `queda`, sin editar | Se resuelve con el mecanismo nuevo: el reemplazo lo declara el que reemplaza, no el reemplazado. `Paso-2.10_PartesBC_verificado.md` y `Paso-2.10_ParteD_con_R10.md` ya llevan el campo `reemplaza:` en su encabezado — el original no se toca, "un prompt ejecutado no se edita nunca" queda intacto |
| `docs/Prompts/_archivo/REGLAS_R09_R10.md` | `archivado` — D-4 aplicado | Movido de `docs/Prompts/` (no era un prompt) a `docs/Prompts/_archivo/`, con nota de que se fusionó en `docs/REGLAS_NEGOCIO.md` R-09/R-10 |
| `docs/Prompts/VERIFICACION_Paso-2.md` | `queda` | La referencia rota es cosmética (ruta propia mal escrita), no justifica ninguna de las cinco acciones — es un fix de una línea para otro paso |
| `docs/Prompts/DOC-5_orden_documental.md` (este mismo prompt) | `queda`, con addendum marcado | La premisa del Caso 2 (Tarea 2) estaba desactualizada — corregida con un addendum fechado, no en silencio (mismo patrón que `docs/DISENO_match_temario.md`) |
| `docs/Sesiones/HANDOFF 2026-07-31-3.md` | **vivo** — D-1 aplicado | Es el más nuevo por su propia cadena "continúa a" — pasó de `_archivo/` a vivo, commit `b9d57c5` |
| `docs/Sesiones/_archivo/HANDOFF 2026-07-31-2.md` | `archivado` — D-1 aplicado | Era penúltimo, no último; pasó a `_archivo/`, commit `b9d57c5` |
| Los 7 restantes de `docs/Sesiones/_archivo/` | `queda` | Correctamente archivados |

### a) El mapa resultante

Extiende la tabla ya existente en `Plan Inicial/PROYECTO.md` §9 — no la reemplaza, la
completa con lo que faltaba nombrar:

| qué hecho | qué archivo lo posee | quién escribe ahí |
|---|---|---|
| Arquitectura, esquema, decisiones estructurales | `Plan Inicial/PROYECTO.md` (§1–§6, §8) | humano y Code |
| Qué va a hacer el motor si corro ahora (config operativa real) | **la hoja viva de Google Sheets** — autoridad total sobre el comportamiento, ninguna sobre si es lo correcto (ver C-1, Tarea 5b) | el motor mismo, vía sembradores |
| Qué debería decir esa config (qué es correcto) | el sembrador en código (`SEED_*` de `Instalar.gs`) y, cuando exista, `docs/ESCRITORES.md` | humano y Code |
| Estado del proyecto, en qué paso estamos **ahora mismo** | `docs/HANDOFF_CODE.md` (`PROYECTO.md` §7 ya no lleva estado — D-2, Tarea 4.1) | solo Code |
| Qué hizo cada paso, para siempre | `docs/BITACORA.md` | solo Code |
| Qué se verificó/decidió en la sesión de claude.ai más reciente | el handoff de `docs/Sesiones/` que **ningún otro handoff declara como su predecesor** (cadena "continúa a", no ubicación de carpeta) | solo claude.ai |
| Reglas del dominio (ID `R-NN`) — qué se construyó y cómo se verifica | `docs/REGLAS_NEGOCIO.md` (no autoridad sobre si ya está implementada — eso es `docs/PENDIENTES_consistencia.md`/`BITACORA.md`) | humano y Code |
| Supuestos asumidos (ID `S-NN`) | `docs/SUPUESTOS.md` | humano y Code |
| Diccionario de tokens | `docs/TOKENS.md` | humano y Code |
| Inconsistencias documentales abiertas | `docs/PENDIENTES_consistencia.md` | humano y Code |
| Convenciones de proceso y aprendizajes | `Plan Inicial/PROYECTO.md` §9 | humano y Code |
| Ruteo y reglas de convivencia entre herramientas | `CLAUDE.md` (raíz) | humano y Code |
| Qué se construyó en un paso puntual y cómo se verifica | `docs/Prompts/Paso-N.md` / `AUD-N_*.md` / `DOC-N_*.md` vigente — vigente es el que ningún otro prompt declara reemplazar (campo `reemplaza:`) | humano y Code, no se edita una vez ejecutado |
| Decisiones editoriales por informe (qué campañas, qué se carga a mano) | `docs/CONFIG_INFORMES.md` — vivo de forma permanente (D-3) | humano y Code |

### b) La regla de precedencia (reescrita, DOC-5 Parte 2 — corrige C-1, C-2, C-3 de la
revisión del 31/07/2026)

**Propuesta. No instalada todavía en `CLAUDE.md` §7** — queda acá como output hasta que se
revise aparte.

**Mecanismo general primero, porque todo lo demás depende de él.** El Caso 5 de la
Tarea 2 (el handoff vivo no era el más nuevo) no se arregla ordenando documentos — se
vuelve imposible si la cadena de versiones es autodeclarada y verificable en vez de
inferida por ubicación de carpeta o fecha de archivo. Ya existe para los handoffs
("Continúa a `HANDOFF <fecha>`" en el encabezado). Se generaliza: **todo documento que
reemplaza a otro lo declara en su propio encabezado** — los handoffs hacia atrás
("continúa a"), los prompts hacia adelante (campo `reemplaza:`, ver `docs/Prompts/
Paso-2.10_PartesBC_verificado.md` y `Paso-2.10_ParteD_con_R10.md`). El vigente es
siempre el que **nadie más declara haber reemplazado**. Esto no es parte de la regla de
precedencia — es lo que hace que la mayoría de los casos nunca lleguen a necesitarla.

**Excepción — addenda fechados (DOC-5 Parte 2, corrección de la propia sesión).** "No se
edita" significa que no se altera una sola línea del texto original — no que el documento
quede mudo ante un error propio. Un prompt ejecutado admite un addendum fechado y marcado
que corrige una premisa sin tocar el párrafo original, mismo patrón que ya usa
`docs/DISENO_match_temario.md` y que se aplicó acá mismo en `docs/Prompts/
DOC-5_orden_documental.md` (el propio prompt cargaba un hecho desactualizado). Sin esta
excepción escrita, la regla se contradice la primera vez que hace falta corregir un
prompt vigente.

**La forma correcta no es un ranking.** Un orden lineal de 1 a 7 implica que cualquier
par de documentos es comparable, y no lo es: "qué dice R-07" y "qué se hizo el 28/07" no
compiten nunca, tienen dueños distintos. La regla es **una pregunta → un dueño único**;
el orden de precedencia entra solo como desempate, para el caso raro en que dos
documentos reclamen la misma pregunta.

| pregunta | dueño único |
|---|---|
| ¿Qué va a hacer el motor si corro ahora? | **La hoja viva de Google Sheets.** Autoridad total e indiscutible — pero solo sobre esta pregunta (ver nota C-1 abajo) |
| ¿Qué *debería* decir esa configuración — qué es correcto? | El sembrador en código (`SEED_*` de `Instalar.gs`) y, cuando exista, `docs/ESCRITORES.md` |
| ¿Dónde estamos ahora mismo (qué paso, qué falta)? | `docs/HANDOFF_CODE.md` |
| ¿Qué se hizo y cuándo, historial completo? | `docs/BITACORA.md` |
| ¿Qué se verificó/decidió en la sesión de claude.ai más reciente? | El handoff de `docs/Sesiones/` que ningún otro handoff declara como su predecesor (mecanismo general de arriba) |
| ¿Qué se construyó en un paso puntual y cómo se verifica? | El prompt vigente de su cadena (mecanismo general de arriba) — autoridad sobre **qué se construyó y cómo se verifica**, no sobre si ya corrió o sigue vigente hoy (eso lo dicen `BITACORA.md`/`HANDOFF_CODE.md`, no el prompt) |
| ¿Qué dice una regla del dominio (`R-NN`)? | `docs/REGLAS_NEGOCIO.md` |
| ¿Qué supuesto se está asumiendo (`S-NN`)? | `docs/SUPUESTOS.md` |
| ¿Cómo se llama este token? | `docs/TOKENS.md` |
| ¿Arquitectura o decisión estructural? | `Plan Inicial/PROYECTO.md` — pero solo la fila o sección que **lleve su propia fecha escrita** (ej. "DOC-4, 31/07/2026"). Git versiona archivos, no secciones; una fecha de commit no sirve para esto. Una sección sin fecha propia no puede invocarse como más nueva que `BITACORA.md`/`HANDOFF_CODE.md` en un conflicto |
| ¿Qué inconsistencia documental sigue abierta? | `docs/PENDIENTES_consistencia.md` |
| ¿Cómo se rutea algo nuevo, cómo conviven las herramientas? | `CLAUDE.md` |

**Nota C-1 — la hoja viva es estado, no verdad.** Este proyecto existe porque una vez no
lo fue: `BASES.m2.hoja_default` tenía un valor que `instalar()` reponía en silencio, y una
Parte C commiteada y pusheada no cambió nada en la hoja. Si "qué va a hacer el motor" y
"qué debería decir esa celda" (código) no coinciden, **eso no es una contradicción
documental que la hoja resuelve ganando** — es un hallazgo, y va a
`docs/PENDIENTES_consistencia.md`, no se cierra invocando esta tabla.

**Desempate, para el caso raro en que dos documentos reclamen la misma pregunta:** gana
el que `CLAUDE.md` §3 declara dueño de ese tipo de hecho en su tabla de ruteo; si ninguno
de los dos es el dueño declarado, gana el que lleve la fecha escrita más reciente —
nunca la fecha de commit, nunca la ubicación de carpeta (por la misma razón que el
mecanismo general de arriba: la ubicación fue justo lo que falló en el Caso 5).

---

```
— PARADA — (Parte 1, 31/07/2026)
Archivos inventariados: 96
Duplicaciones encontradas: 8 (contradictorias: 3 — CONFIG_INFORMES vivo/congelado, PROYECTO.md §7 vs BITACORA/HANDOFF_CODE, handoffs -2/-3)
Hechos sin respaldo: 1 (MARCADORES sin SEED_, ya en cola vía Paso-2.13)
Huérfanos / muertos: 0 huérfanos, 5 muertos o parcialmente muertos (PROYECTO.md §7, Paso-2.10_anclar Partes B/C, REGLAS_R09_R10.md, VERIFICACION_Paso-2.md referencia rota, nota sobre AUD-1)
Filas en `se decide arriba`: 5 (CONFIG_INFORMES.md, PROYECTO.md §7, Paso-2.10_anclar_a_numeros_verificados.md, HANDOFF 2026-07-31-2.md, HANDOFF 2026-07-31-3.md)
```

```
— PARADA — (Parte 2, 31/07/2026)
Decisiones D-1 a D-4: 4 de 4 aplicadas.
D-1 — commits b9d57c5, d916e94 (docs/Sesiones/, handoff vivo pasa a ser -3).
D-2 — Plan Inicial/PROYECTO.md §7: roadmap sin estado + puntero a HANDOFF_CODE.md/BITACORA.md.
D-3 — Plan Inicial/PROYECTO.md §9: taxonomía sin vivo/congelado central; CONFIG_INFORMES.md
  queda vivo de forma permanente.
D-4 — docs/Prompts/REGLAS_R09_R10.md archivado a docs/Prompts/_archivo/, con nota de fusión.
Además: campo `reemplaza:` agregado a Paso-2.10_PartesBC_verificado.md y
  Paso-2.10_ParteD_con_R10.md (resuelve el caso sin editar el prompt original); addendum
  fechado en docs/Prompts/DOC-5_orden_documental.md (premisa del Caso 2 corregida, no
  retirada en silencio); regla de precedencia reescrita como asignación de dominio
  (pregunta → dueño único) en vez de ranking — propuesta, no instalada en CLAUDE.md §7.
Filas en `se decide arriba`: 0.
Pendiente para un paso aparte, explícito: generalizar el campo `reemplaza:` al resto de
  prompts con "reemplazado por" ya detectado en la Tarea 1 (Paso-0→Paso-0-v2,
  Paso-1.6→Paso-1.6-v2, Paso-3→Paso-3-v2, Paso-2.2→Paso-2.2.2, etc.) — no se tocó acá,
  fuera del alcance que se dio para esta parte.
```

y espero.
