# BITÁCORA — qué hizo cada paso

> Una entrada por paso, en orden cronológico, **append-only**: nunca se edita ni se borra
> una entrada anterior. Se escribe *antes* del commit del paso, no después.
>
> **Este archivo lo escribe solo Claude Code.** Un solo autor, por eso puede ser un archivo
> único sin repetir el conflicto de sincronización que partió el `HANDOFF.md` original.
>
> Diferencia con los handoffs: `HANDOFF_CODE.md` dice **dónde estamos** y se reescribe;
> los de `docs/Sesiones/` narran una **conversación de claude.ai**. Esta bitácora registra
> un **paso** y es un formulario. Si buscás "qué cambió en el Paso 2.7", se busca acá.

## Plantilla

```markdown
## Paso <N> — <nombre corto> (<AAAA-MM-DD>) — commit `<hash>`
- **Qué pedía el prompt:** 1–2 líneas, el objetivo.
- **Qué se hizo:** archivos y funciones editados, hojas/columnas/menús tocados.
- **Prueba:** cómo se probó y con qué resultado.
- **Pendientes/decisiones:** si quedó algo abierto → también a `PENDIENTES_consistencia.md`.
  Si no, "ninguno".
```

## Entradas

**Nota de reconstrucción (DOC-4, 31/07/2026):** estas entradas se reconstruyeron leyendo
`git log` (114 commits al momento de escribir esto) y los handoffs de `docs/Sesiones/`.
Se agrupó por paso, no por commit — varios commits de doc/sync sin número de paso propio
(reorganizaciones, sincronizaciones desde claude.ai, cierres de handoff) no tienen entrada
individual porque no son un paso, están mencionados dentro del paso al que pertenecen
cuando aporta contexto. Donde el campo no surge de la evidencia disponible, dice
**sin registro** — no se inventó nada.

---

## Scaffold inicial (2026-07-2x) — commits `75f510d`, `073a53b`
- **Qué pedía el prompt:** arrancar el repo: stubs de cada módulo, `PLAN.md`, config de
  `clasp`, orden de carpetas.
- **Qué se hizo:** stubs de todos los `.gs`, `.claspignore`, plantillas marcadas.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno.

## Paso 0 — hojas de registro + menú (2026-07-2x) — commit `fb26d7f`
- **Qué pedía el prompt:** `instalar()` + `onOpen()`: crear las 6 hojas de configuración
  por registros y el menú de la planilla.
- **Qué se hizo:** `Instalar.gs` (`HOJAS_CONFIG_`, `instalar()`), `Codigo.gs` (`onOpen()`).
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno.

## Paso 1.5 — re-anclado de cuenta (2026-07-2x) — commit `7b28060`
- **Qué pedía el prompt:** mover el proyecto standalone a la cuenta `jpcofanogcba1`.
- **Qué se hizo:** re-anclado del binding de Apps Script.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno.

## Paso 1 + 0.5 + 1.6 + 1.7 — lector de registros, períodos, seed y plantillas (2026-07-2x) — commit `8f76cc5`
- **Qué pedía el prompt:** `leerBases()`/`leerInformes()` con caché (`abrirBase`), esquema
  de `PERIODOS` (Paso 0.5), seed de `BASES`/`MAPEO`/`CONFIG` (Paso 1.7), registro de
  plantillas desde carpeta de Drive (Paso 1.6).
- **Qué se hizo:** `Config.gs`, `Fuentes.gs` (caché por corrida), `SEED_BASES_`/
  `SEED_MAPEO_`/`SEED_CONFIG_DEFAULTS_` en `Instalar.gs`, `registrarPlantillasDesdeCarpeta()`.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno (siguientes commits 1.6 v2 lo endurecen).

## Paso 1.6 v2 — registro de plantillas robusto (2026-07-2x) — commits `395253d`, `6887095`, `07a996e`
- **Qué pedía el prompt:** carpetas de plantillas/salida por `CONFIG`, diagnóstico de
  carpeta, registro recursivo (subcarpetas) + filtro por MIME.
- **Qué se hizo:** `diagnosticarCarpetaPlantillas_()`, recorrido recursivo con
  `PROFUNDIDAD_MAX_PLANTILLAS_`, detección de `.pptx` sin convertir y accesos directos.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno.

## Paso 1.8-B — timeZone/scopes + diagnóstico Drive (2026-07-2x) — commits `f03f904`, `9899c14`
- **Qué pedía el prompt:** `oauthScopes` explícitos, `timeZone` Buenos Aires,
  `diagnosticoDrive()` para descartar problemas de scope antes de tocar el registro de
  plantillas.
- **Qué se hizo:** `appsscript.json` con scopes explícitos y timeZone; `diagnosticoDrive()`
  en `Instalar.gs`.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno.

## Paso 1.9 — MAPEO completo + fila_encabezado/modo_periodo (2026-07-2x) — commits `326f686`, `a8d7630`
- **Qué pedía el prompt:** completar `SEED_MAPEO_` (rdv + looker + m2) y agregar
  `fila_encabezado`/`modo_periodo` a `BASES`.
- **Qué se hizo:** `SEED_MAPEO_` con las tres bases; columnas nuevas en `BASES`
  (`COLUMNAS_DELTA_`).
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno. Cierra el Bloque 1 (Fundación y config) —
  `PROYECTO.md` §7 lo marca `✅ completo`.

## Paso 2 — lectura por ventana (2026-07-29) — commit `67884cb`
- **Qué pedía el prompt:** `resolverVentana()`/`leerFuente()` en `Fuentes.gs`: `MAPEO` +
  período, con `modo_periodo`/`fila_encabezado` de `BASES`.
- **Qué se hizo:** `resolverVentana()`, `leerFuente()`, `probarLecturaPeriodo()`, menú
  "Probar lectura por ventana".
- **Prueba:** `PROYECTO.md` §7 registra "falta que el usuario corra la prueba real y
  cierre P1–P5/A1–A10 de `VERIFICACION_Paso-2.md`" — es decir, **no se cerró en su
  momento**; ver Paso 2.1/2.3 y Paso 2.9 para las correcciones posteriores sobre este
  mismo lector.
- **Pendientes/decisiones:** verificación real quedó pendiente (`PENDIENTES_consistencia.md`
  P0 "Verificación real del Paso 2").

## Paso 2.1 — filas vacías fuera del diagnóstico + columna de fecha por convención (2026-07-29) — commits `bc2e862`, `5cfdb64`, `6a68346`
- **Qué pedía el prompt:** sacar las filas 100% vacías del diagnóstico de cobertura;
  columna de fecha por convención de `MAPEO` (`campo_logico=fecha_periodo`), incluido
  looker.
- **Qué se hizo:** `filaVacia_()`, convención de columna de fecha documentada en
  `Fuentes.gs`; archivado de `Paso-2.md` (describía una función que nunca existió).
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno.

## Paso 2.3 — digital sembrado + diagnóstico honesto (2026-07-29) — commit `631c61c`
- **Qué pedía el prompt:** sembrar `digital` completo (6 solapas, `modo_periodo=snapshot`),
  columna clave para descartar filas basura sin depender de fila 100% vacía, diagnóstico
  que degrada a ⚠️ si no hay filas en ventana o hay demasiadas sin fecha.
- **Qué se hizo:** `SEED_MAPEO_` de `digital` (53 filas), `resolverClave_()`, degradación
  del ícono en `menuProbarLectura_()`.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno (el criterio de descarte por clave se revisó de
  fondo en Paso 2.9 Parte B — dejó de ser una exclusión silenciosa).

## Paso 2.2 + 2.2.1 + 2.2.2 — armonización de plantillas (2026-07-29/30) — commits `970c969`, `a64dbf2`, `486850d`, `c5d9f02`, `e0cd96f`, `cf2c249`, `f75a059`, `b7a1524`, `0749f1c`
- **Qué pedía el prompt:** `armonizarPlantillas()` (renombres del diccionario canónico),
  correcciones de caja (JM 5/6/10), `CAMPANAS` con tipos de encuentro, inventario de
  plantillas, backup obligatorio antes de armonizar, plantilla canónica única en
  `INFORMES`, borrar caja huérfana `m2_salud_camp`.
- **Qué se hizo:** `Armonizar.gs` completo; `RENOMBRES_ARMONIZACION_POR_INFORME_`
  (renombres **por informe_id**, no globales — un renombre global rompió `enc_audiencia`
  en SECCO); limpieza de caja recorriendo `Group` (la versión anterior solo miraba
  elementos de primer nivel); `menuInventarioPlantillas_()`, `menuRepuntarPlantillaCanonicaJM_()`.
- **Prueba:** `PROYECTO.md` §7: "primera corrida ya confirmada por el usuario (JM slide 5
  y slide 6 correctas)". **El parche 2.2.1/2.2.2 todavía no se había corrido contra la
  plantilla real** al momento de esa nota.
- **Pendientes/decisiones:** advertencia de `docs/TOKENS.md` Parte D sin sacar;
  `enc_audiencia_ivr`→`enc_base_total` sin confirmar (`PLANTILLAS_QA_y_armonizacion.md` §9).

## Paso 2.3.1 + 2.3.2 + 2.3.3 — fecha_periodo, solapa en clave de MAPEO, preselección (2026-07-30) — commit `83bcf00`
- **Qué pedía el prompt:** `fecha_periodo` como contrato único de columna de fecha
  (derogando `fecha`); `solapa` entra en la clave compuesta de `MAPEO`
  (`base_id`+`solapa`+`campo_logico`) porque una base puede mapear el mismo campo en
  varias solapas; preselección de columnas candidatas.
- **Qué se hizo:** columna `solapa` en `MAPEO` (`COLUMNAS_DELTA_`, `backfillSolapaMapeo_()`),
  `leerMapeo()`/`buscarMapeo()` con clave de tres partes.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** ninguno.

## DOC-1 — taxonomía de documentos y consolidación (2026-07-29) — commit `1225962` (+ sincronizaciones relacionadas)
- **Qué pedía el prompt:** declarar taxonomía vivo/congelado/archivado de los primeros 9
  documentos; resolver Looker-vs-SD (cuatro documentos con tres respuestas distintas);
  archivar docs superados.
- **Qué se hizo:** taxonomía inicial en `PROYECTO.md` §9; decisión SD-primaria escrita una
  sola vez en `CONFIG_INFORMES.md` §4.1; fusión de tres docs de tokens en `docs/TOKENS.md`;
  `MAPEO_completo.md` pasa a congelado.
- **Prueba:** documental, no aplica.
- **Pendientes/decisiones:** los P0-P2 que no cerró quedaron en `docs/PENDIENTES_consistencia.md`
  (creado en esta misma pasada).

## DOC-2 — alineación de prompts con el esquema nuevo (2026-07-30) — commits `dc6d568`, `883507c`, `fd21731`, `7d33049`, `dd5dc52`, `800e9f3`, `6820f56`, `803585b`
- **Qué pedía el prompt:** migrar `MARCADORES.calculo`→`operacion` + `valor_fijo` +
  `solapa` (idempotente); alinear `Paso-2.4`/`Paso-2.5`/`Paso-3-v2`/`Paso-4`/`Paso-5` con
  la clave nueva de `MAPEO`; regla de resolución de `solapa` en `MARCADORES`
  (`docs/TOKENS.md` §4).
- **Qué se hizo:** `migrarCalculoAOperacion_()` en `Instalar.gs`; `SEED_MAPEO_`/
  `SEED_BASES_` con la clave nueva; prompts reescritos.
- **Prueba:** sin registro (queda como pendiente correr el instalador dos veces y
  confirmar que `MARCADORES` no tiene más `calculo` — anotado varias veces en handoffs
  posteriores, sigue sin cerrar al 31/07).
- **Pendientes/decisiones:** ver "Pendiente de DOC-2" en handoffs del 30/07 y 31/07.

## DOC-3 — verificación de bases vivas (2026-07-30) — commits `b859d4d`, `74399a3`, `54bfb5f`, `145348a`, `307a09c`, `cff79c7`, `0120fd6`
- **Qué pedía el prompt:** confirmar contra la base viva la solapa de looker, tipar
  columnas mapeadas (`DIAG_BASES`), resolver ambigüedad de `frecuencia`, registrar
  `m2/Cuentas` como dimensión, escribir R-04 (el temario define el universo, no la
  fecha), encontrar fuente para tokens huérfanos (`ivr_marque1`, `pieza_meta`),
  generalizar el riesgo de firma de encabezados a las cuatro bases.
- **Qué se hizo:** `SEED_BASES_.looker.hoja_default = resumen_metricas_dinamico` (revertido
  después, ver Paso 2.8/2.9 más abajo); `diagnosticarBases()` en `Fechas.gs`; R-04 en
  `docs/REGLAS_NEGOCIO.md`; `docs/RDV_otros_ministros_riesgo.md` generalizado.
- **Prueba:** confirmado contra la base viva (metadata de Drive) según el propio commit
  `b859d4d` — pero ver Paso 2.9 Parte C: esa confirmación resultó estar mal fundada
  (criterio de "primera solapa del archivo", no de contenido real).
- **Pendientes/decisiones:** firma de encabezados sin implementar (copiado a
  `PENDIENTES_consistencia.md` en DOC-4).

## Paso 2.4 — capa de ensamblado (2026-07-30) — commits `320a314`, `0f6a3c2`, `1517f43`
- **Qué pedía el prompt:** `unirDigitalPorCuenta()` (join de 6 solapas de `digital` por
  `id_cuenta`), `anclarEncuentros()` (anclaje RDV↔digital, `docs/DISENO_match_temario.md`
  §5 bis, precondición R-01 + umbral de confianza), `filasDigitalDeEncuentro()` como
  proveedor estable para el Paso 3.
- **Qué se hizo:** `Union.gs` completo (esta versión), menú "Probar unión y anclaje".
- **Prueba:** sin registro en el momento; el timeout de `menuProbarUnionYAnclaje_` (6 min)
  se detectó después (30/07) y se diagnosticó/corrigió recién en Paso 2.9 Parte F.
- **Pendientes/decisiones:** ✅ en `PROYECTO.md` §7 al momento, con la nota de que la firma
  de encabezados queda como paso propio.

## AUD-1 — auditoría de solapas y sheet_id (2026-07-30) — commit `e1860da`
- **Qué pedía el prompt:** inventario de solapas por `sheet_id` vivo, comparación contra
  `SEED_BASES_`, verificación de `FECHAS_seleccion.md` contra el archivo vivo — solo
  lectura, sin corregir nada.
- **Qué se hizo:** `Auditoria.gs` (`auditarSolapas()`, hoja `AUD_SOLAPAS`).
- **Prueba:** corrida real contra las bases vivas (es la naturaleza del propio paso).
- **Pendientes/decisiones:** lista de solapas que quedaron bloqueando el motor — resuelta
  en Paso 2.6/2.7.

## Paso 2.6 — registro SOLAPAS (2026-07-30) — commits `36a7e7e`, `595109a`, `161dce2`, `a90f78b`, `3c482fa`, `d034967`, `71a9f36`
- **Qué pedía el prompt:** hoja `SOLAPAS` (uso/origen/fila_encabezado/firma_encabezado/
  filas_datos) — declarar qué solapa se lee y cuál se ignora, no solo las que aparecen en
  `MAPEO`. `firma_encabezado` reservada, sin implementar. Registrar `RDV JM 2 VECES` como
  conjunto de control del anclaje.
- **Qué se hizo:** `Solapas.gs` (`inventariarSolapas()`), `SEED_SOLAPAS_` con clasificación
  propuesta de 84 solapas, `usoSolapa_()`/`buscarMapeo()` exige `uso=fuente`.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** 9 solapas quedaron en `revisar` (ver handoff 31/07); `RDV JM 2
  VECES` como conjunto de control **se descartó después** (Paso 2.9 Parte C.4: es texto
  pegado, no sirve como control).

## Paso 2.7 — destrabar la siembra de SOLAPAS (2026-07-30) — commits `933b36c`, `85baca9`, `01622c3`, `ca4d977`, `6fe28a2`, `af14ca7`
- **Qué pedía el prompt:** distinguir `origen=auto`/`seed`/`manual` en `SOLAPAS` para que
  la siembra pueda pisar lo automático sin pisar decisiones humanas; auditar
  `digital/Digital/alcance` (columna E, resultó ser fecha, no alcance) y el campo de unión
  de `unirDigitalPorCuenta` (AUD-2: es `*_id_cuenta`, no `clave`); consolidar los mapeos de
  looker en una sola solapa; `tipo_esperado` en `MAPEO`.
- **Qué se hizo:** columna `origen` en `SOLAPAS`; `auditarAlcanceDigital_()`,
  `compararResumenesLooker_()`, `auditarFormulasResumenesLooker_()`,
  `consolidarMapeoLooker_()` en `Solapas.gs`; `tipo_esperado` en `MAPEO`.
- **Prueba:** sin registro.
- **Pendientes/decisiones:** el resultado del test de fórmulas de looker (Parte D) recién
  se aplicó en Paso 2.8, y se revirtió en Paso 2.9 Parte C — ver esas entradas.

## Paso 2.8 — cerrar la lectura (2026-07-30/31) — commits `8a4ca69`, `9e60863`, `15ddf94`, `613d676`, `800e5c4`, `eac337f`
- **Qué pedía el prompt:** terminar de borrar `digital/Digital/alcance` de `MAPEO`
  (Paso 2.7 solo auditó); consolidar los 25 mapeos de looker en una solapa; reforzar
  `getFormulas()` a filas 2-4; diagnosticar el corte de filas de `m2` (18 de 29.533) y
  las 337 filas sin clave de `digital`; cerrar DOC-3 Parte A.
- **Qué se hizo:** `eliminarMapeoAlcanceDigitalObsoleto_()`, `moverFechaPeriodoLookerAResumenMetricas_()`
  (reemplazada en Paso 2.9), guardarraíl de cobertura al 50%, `diagnosticoCorteFilasM2_()`,
  `diagnosticoFilasSinClaveDigital_()`. Cierre de DOC-3 Parte A: `resumen_metricas` elegida
  como fuente de looker por el criterio "fórmulas = derivada, valores = fuente".
- **Prueba:** commit `eac337f` — decisión tomada con evidencia parcial (no se leyó qué
  consultaba la fórmula). **Revertida en Paso 2.9 Parte C** (commit `ac39876`): la fórmula
  de `resumen_metricas_dinamico` consulta `Cuentas` (`QUERY()`), no deriva de
  `resumen_metricas` — el criterio no aplicaba.
- **Pendientes/decisiones:** el diagnóstico de `m2` (18 filas) y de `digital` (337 sin
  clave) quedaron como preguntas abiertas hasta Paso 2.9 Parte B (causa raíz: exclusión
  silenciosa en `leerFuente()`, no un problema específico de cada base).

## Paso 2.9 (versión inicial, Partes A-E) — arreglar el lector + revertir looker (2026-07-31) — commits `355c3c0`, `718e1c7`, `ac39876`, `e0e1ea5`, `022676e`
- **Qué pedía el prompt:** `docs/SUPUESTOS.md` (S-01 a S-03); investigar y corregir el
  colapso/descarte del lector; revertir looker a `resumen_metricas_dinamico`; `fecha_periodo`
  como contrato único; terminar de borrar `digital/Digital/alcance`.
- **Qué se hizo:** `leerFuente()` ya no excluye filas por clave vacía ni por fila 100%
  vacía — las devuelve todas, con esos conteos como dato informativo
  (`filas_vacias`/`filas_sin_clave`); guardarraíl de cobertura sube de 50% a 90%;
  `alinearMapeoLookerADinamico_()`/`alinearSolapasLookerADinamico_()`/
  `alinearBasesHojaDefaultLooker_()` (migraciones idempotentes en `instalar()`, reemplazan
  a la migración de Paso 2.8 que iba en sentido contrario); dos filas `campo_logico='fecha'`
  marcadas `DEROGADA — ver S-02`; `eliminarMapeoAlcanceDigitalObsoleto_()` con comparación
  tolerante (`normalizar_`) y borrado de todas las filas que matcheen.
- **Prueba:** investigación de código (grep, sin Map/Set de colapso encontrado en
  `Fuentes.gs`) documentada en el commit `718e1c7`. **No se verificó contra la planilla
  viva en esta sesión** — ver `docs/Sesiones/HANDOFF 2026-07-31-2.md`: el número que
  debía confirmar la hipótesis (valores distintos de `clave` en `rdv` = 720) no quedó
  registrado, y el caso de `m2` (18 de 29.533) sigue sin verificación directa post-fix.
- **Pendientes/decisiones:** **verificar contra datos en vivo** que `m2`/`rdv`/`digital`
  devuelvan del orden de sus `SOLAPAS.filas_datos` — es el pendiente más importante de
  todo Paso 2.9, señalado por la sesión de claude.ai del 31/07 (segunda sesión).

## Paso 2.9 (extendida, Partes A-H) — corte vertical, anclaje, SECCIONES, VALORES (2026-07-31) — commits `6c78402`, `a6add53`, `45ba178`, `6572f24`, `12afd0e`, `4d68429`, `e7ab8eb`, `48beb2a`, `e7c29fc`
- **Qué pedía el prompt:** ocho sub-prompts (`docs/Prompts/Paso-2.9A.md` a `Paso-2.9H.md`)
  escritos por la sesión de claude.ai, más precisos que la versión inicial: diagnóstico
  del lector con hoja `DIAG_COLAPSO`; higiene de registros (grafía RVD/RDV, `RDV JM 2
  VECES` descartada como control, `m2` reclasificada por clasificación invertida); hoja
  `REUNIONES` + parser de temario; corte vertical de 10 tokens `ecv_*` en `VISTA_PREVIA`;
  anclaje reescrito sobre `REUNIONES` con umbral en `CONFIG` y confirmación humana
  (`ANCLAJE_PENDIENTE`); hoja `SECCIONES` jerárquica; hoja `VALORES`/`VALORES_DIVERGENTES`.
- **Qué se hizo:** `diagnosticarColapso_()` (Auditoria.gs); `verificarNombresSolapasFuente_()`;
  `corregirNotaControlAnclaje_()`/`reclasificarSolapasM2Invertidas_()` (Instalar.gs);
  `Reuniones.gs` (`leerReuniones_()`, `parsearLineaReunion_()`, `cargarTemarioReuniones_()`);
  `Marcadores.gs` completo por primera vez (`opSUMA`/`opCONTEO`/`opULTIMO`/`opRATIO`/`opPCT`/
  `opTEXTO`, `corteVerticalRetiro2407_()`); `Union.gs` reescrito (`anclar_()` genérico,
  `candidatosCercanosPorFecha_()`, `encontrarFilaRdvDeReunion_()`, `ANCLAJE_PENDIENTE`);
  `Secciones.gs` (`leerSecciones_()`); `Valores.gs` (`registrarValorCalculado_()`,
  `leerDivergenciasPendientes_()`).
- **Prueba:** los ocho sub-prompts se ejecutaron de corrido en la misma sesión, sin pausa
  entre pasos, por pedido explícito del usuario. Verificación real: `SECCIONES` y
  `VALORES` se probaron con Node (reglas del prompt) y con un mock de hoja
  (reproduce 867→1026) — **auto-verificación, no contra la planilla real**. El lector, el
  revert de looker y la higiene de registros sí corrieron contra archivos vivos en algún
  punto de la sesión, pero el reporte no dejó los conteos concretos. El corte vertical
  (`VISTA_PREVIA`) y el anclaje (¿desapareció el timeout?) **no tienen resultado
  registrado** — ver `docs/Sesiones/HANDOFF 2026-07-31-2.md`, que es la fuente de este
  matiz y llegó **después** de que estos commits ya estuvieran hechos.
- **Pendientes/decisiones:** los cinco puntos de "Cómo seguir" de
  `docs/Sesiones/HANDOFF 2026-07-31-2.md` — releer conteos de lectura (sobre todo `m2`),
  mirar `VISTA_PREVIA` (los diez tokens + tres controles + columna `filas` + columna
  `operacion`), correr el anclaje de verdad, probar `SECCIONES`/`VALORES` contra la
  planilla real, resolver el origen de `CLAUDE.md`/`DOC-4`. Todos siguen abiertos al
  momento de escribir esta bitácora.

## DOC-4 — taxonomía y bitácora (2026-07-31) — commit `c1081a6` (Parte A; B en curso al escribir esta entrada)
- **Qué pedía el prompt:** declarar los 21 documentos de `docs/` (+ `CLAUDE.md` +
  `PROYECTO.md`) en la taxonomía de `PROYECTO.md` §9; confirmar y archivar
  `DECISION-periodicidad-y-periodos.md`; revivir `docs/HANDOFF_CODE.md` +
  `docs/BITACORA.md`; ordenar los handoffs de `docs/Sesiones/`; verificar `CLAUDE.md`.
- **Qué se hizo:** ver el propio commit `c1081a6` y los siguientes de esta misma serie.
- **Prueba:** ver "Prueba del usuario" de `docs/Prompts/DOC-4_taxonomia_y_bitacora.md`.
- **Pendientes/decisiones:** se completa con las Partes B/C/D de este mismo prompt.

## REGLAS_R09_R10 — R-05 a R-10 en REGLAS_NEGOCIO.md (2026-07-31) — commit `764dc1e`
- **Qué pedía el prompt:** `docs/Prompts/REGLAS_R09_R10.md` pedía agregar R-09 ("lo
  cancelado no entra al informe") y R-10 ("encabezados se normalizan por espacios, nunca
  por mayúsculas"), asumiendo que R-05 a R-08 ya existían en `REGLAS_NEGOCIO.md`.
- **Qué se hizo:** R-05 a R-08 **no existían todavía** — estaban descriptas, con
  numeración distinta (R-03/R-04/R-05 y una R-06 propuesta), dentro de
  `docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md` Parte F y
  `docs/Prompts/Paso-2.10_PartesBC_verificado.md` ("hallazgo lateral"). Se reconciliaron
  los dos numerados para no dejar un salto: R-05 (agregado JM/GCBA, hipótesis sin
  confirmar), R-06 (`id_cuenta` manda), R-07 (`fecha_corte` obligatoria), R-08 (vínculo
  reunión↔cuenta curado), R-09 y R-10 (las dos del prompt pedido, completas). Las seis
  quedaron escritas en `docs/REGLAS_NEGOCIO.md` con el mismo formato que R-01 a R-04
  (Enunciado/Origen/Cómo se verifica/Si falla). Entrada nueva en
  `docs/PENDIENTES_consistencia.md` (P0) para las tres que piden código nuevo (R-06, R-09,
  R-10) y todavía no lo tienen.
- **Prueba:** documental — cada regla cita el caso medido contra las cuatro bases del
  31/07 (`docs/VALIDACION_2026-07-31.md`/`casos_validacion_2026-07-31.csv`), no se
  reverificó de nuevo acá.
- **Pendientes/decisiones:** ninguna regla se implementó en código en este commit — es
  documentación pura, igual que pedía el prompt de origen. R-06/R-09/R-10 quedan
  pendientes de implementar (`PENDIENTES_consistencia.md`). El resto de `Paso-2.10`
  (Partes B-E, G: correcciones a `SOLAPAS`, hoja `VALIDACION`, corte vertical a Orden
  Público) sigue sin ejecutar.

## Paso 2.10 Parte B — `filas_datos` deja de contar relleno de fórmula (2026-07-31) — commit `7dcc564`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.10_PartesBC_verificado.md` Parte B —
  `getLastRow()-1` cuenta como dato cualquier fila con fórmula que evalúe a `""`
  (`m2/M2 periodo DIRECTA` devolvía 29.533 en vez de 18-20 reales). Cambiar `filas_datos`
  a "filas con alguna celda no vacía tras `trim()`", sobre todo `getDataRange()` (incluye
  encabezados y banners de período a propósito — definición "Recomendada" del prompt,
  para no depender de detectar encabezado por solapa). Agregar `filas_crudas` al lado con
  el valor viejo, porque la diferencia entre las dos ES el diagnóstico.
- **Qué se hizo:** `Instalar.gs` — columna `filas_crudas` en `HOJAS_CONFIG_.SOLAPAS.headers`
  (entre `filas_datos` y `notas`) y en `COLUMNAS_DELTA_.SOLAPAS` (para instalaciones ya
  existentes). `Solapas.gs` (`inventariarSolapas()`) — `filasCrudas` conserva
  `Math.max(getLastRow()-1, 0)`; `filasDatos` ahora recorre `getDataRange().getValues()`
  completo y cuenta con `filaVacia_()` (Fuentes.gs, reusada). Se escriben las dos columnas
  tanto para solapas nuevas como ya registradas. `Config.gs` (`leerSolapas()`) expone
  `filas_crudas` en el registro.
- **Prueba:** confirmada por el usuario contra la planilla en vivo (`clasp push` +
  "Instalar / reparar hojas" + "Inventariar solapas").
- **Pendientes/decisiones:** Partes C (bajar seis solapas `periodo` a `referencia`) y D
  (R-10 `normalizar()` + hoja `VALIDACION`) de `Paso-2.10_PartesBC_verificado.md` y
  `Paso-2.10_ParteD_con_R10.md` siguen sin ejecutar — van en pasos separados.

## Paso 2.10 Parte C — seis solapas "periodo" bajan a `referencia`, `m2` sin fuente (2026-07-31) — commit `fa1d595`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.10_PartesBC_verificado.md` Parte C —
  no son cuatro solapas "periodo" sino **seis** (dos más en `digital`, con el período en
  la fila 2 en vez de la 1); bajarlas todas a `uso=referencia`. Sacar `M2 periodo
  DIRECTA`/`DIGITAL` de `SOLAPAS_M2_INVERTIDAS_` (no es clasificación invertida, es un
  `GROUP BY` sobre `M2 Directa` con período tipeado a mano). Declarar `digital/Directa
  Mail`=`fuente` (ya lo era) y `m2/Directa mail`=`derivada` (espejo, 2.106 vs 2.107
  filas). No tocar `MAPEO` de `m2`: queda sin fuente, y el fallo tiene que ser visible
  (`«FALTA:token»`), no un número plausible.
- **Qué se hizo:** `Instalar.gs` — `SEED_SOLAPAS_`: las seis solapas periodo
  (`m2/M2 periodo DIRECTA`, `m2/M2 periodo DIGITAL`, `m2/Mail per`, `digital/Mail per`,
  `digital/Buscador por periodo digital`, `digital/Buscador por periodo directa`) pasan
  a `referencia` con nota compartida (`NOTA_PERIODO_MANUAL_`); `digital/Buscador por
  periodo *` salieron de `ignorar` (estaban mal clasificadas: no son un pivot/backup, sí
  documentan un recorte real). `m2/Directa mail` → `derivada`. `SOLAPAS_M2_INVERTIDAS_`
  perdió las dos `M2 periodo *` (si seguían, `reclasificarSolapasM2Invertidas_()` las
  volvía a pisar a `revisar` en cada instalación). `SEED_BASES_.m2.hoja_default` → `''`
  (antes apuntaba a una solapa ahora `referencia`; en `modo_periodo=snapshot` `leerFuente`
  no pasa por `buscarMapeo()`, así que sin este cambio seguiría leyendo esa vista entera
  sin avisar). `Fuentes.gs` (`abrirHoja`): mensaje propio cuando `hoja_default` está
  vacío, para no confundirlo con "no existe una hoja llamada ''". `Fechas.gs`
  (`diagnosticarBases`) y `Auditoria.gs` (`auditarSolapas`): un `hoja_default` vacío ya
  no se reporta como referencia rota en esos dos diagnósticos.
- **Prueba:** el usuario corrió "Probar lectura por ventana" contra la planilla en vivo
  antes de aplicar `SEED_BASES_`/`SEED_SOLAPAS_` (`Cargar config inicial` +
  `Sembrar clasificación inicial de solapas` corren aparte de `Instalar / reparar
  hojas`, que no los toca): `rdv`/`digital`/`looker` salieron ✅ con los números
  esperados, `m2` todavía leía `M2 periodo DIRECTA` (29.531 filas, snapshot) porque el
  cambio de `hoja_default` no se había sembrado todavía. **Falta la vuelta de prueba
  después de sembrar** — pendiente de confirmación del usuario.
- **Pendientes/decisiones:** confirmar que, tras `Cargar config inicial` +
  `Sembrar clasificación inicial de solapas`, `m2` sale ⚠ "sin hoja_default" en
  "Probar lectura por ventana" y las 9 solapas en `revisar` bajan a 3 en `SOLAPAS`.
  Parte D (`Paso-2.10_ParteD_con_R10.md`: `normalizar_()` + hoja `VALIDACION`) sigue sin
  ejecutar.

## Paso 2.11 Parte A — `HOJAS_CONFIG_.ejemplos` deja de sembrar datos (2026-07-31) — commit `52e129a`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md` Parte
  A. Explica, con evidencia, la causa raíz de "falta la vuelta de prueba" que quedó
  pendiente en el Paso 2.10 Parte C: `BASES.m2.hoja_default` estaba escrito dos veces
  (`HOJAS_CONFIG_.BASES.ejemplos` con `'M2 periodo DIRECTA'`, `SEED_BASES_` con `''`),
  por dos caminos distintos (`instalar()` vs `seedConfiguracion()`), y correr el primero
  después del segundo revertía la Parte C sin avisar. Mismo problema en `MARCADORES`
  (`ejemplos` tenía una fila `m2_envios` apuntando a `M2 periodo DIRECTA`). Tarea:
  `HOJAS_CONFIG_` pasa a ser solo esquema (`headers`); `instalar()` no vuelve a escribir
  filas de datos.
- **Qué se hizo:** `Instalar.gs` — `ejemplos` eliminado de las 12 hojas de
  `HOJAS_CONFIG_`; el bloque `if (!hoja)` de `instalar()` ya no escribe la segunda fila.
  Los datos reales que vivían en `ejemplos`: `SEED_INFORMES_` y `SEED_PERIODOS_` (config
  durable, misma categoría que `BASES`/`MAPEO`) se cablearon a `seedConfiguracion()` con
  `upsertPorClave_`, igual que las demás. `SEED_CAMPANAS_EJEMPLO_` y
  `SEED_REUNIONES_EJEMPLO_` se movieron pero **sin sembrador automático** — son curadas a
  mano y cambian cada semana (mismo riesgo que ya se vio con `m2`: un upsert automático
  en cada "Cargar config inicial" pisaría la campaña/reunión real de la semana si
  coincide la clave); quedan a la espera de `menuCargarEjemplo_()` (hoy un stub en
  `Codigo.gs`), que el usuario dispara a mano cuando de verdad quiere cargar el ejemplo.
  Grep de control (tarea 4 del prompt) confirmado: `'M2 periodo DIRECTA'` ya no aparece
  en ningún `ejemplos`, `hoja_default` ni fila de `MARCADORES` — solo en `SEED_SOLAPAS_`
  (como `referencia`), `SEED_MAPEO_` (fuera de alcance de esta parte) y comentarios.
- **Prueba:** confirmada por el usuario contra la planilla en vivo. "Instalar / reparar
  hojas" reportó `BASES`/`MAPEO`/`MARCADORES` **fuera** de "Hojas actualizadas" (criterio
  de aceptación cumplido — antes las revertía). Las demás hojas sin `COLUMNAS_DELTA_`
  (`CONFIG`, `INFORMES`, `PERIODOS`, `REUNIONES`, `SECCIONES`, `VALORES`,
  `VALORES_DIVERGENTES`) sí salieron en "actualizadas" — comportamiento preexistente
  (`instalar()` reescribe la fila de encabezados sin comparar si cambió), no algo que
  esta parte haya introducido; queda para la Parte C (diff real en vez de conteo).
  "Cargar config inicial" corrida después: `INFORMES — actualizadas: 2` y
  `PERIODOS — actualizadas: 2` confirman que el nuevo cableado a `seedConfiguracion()`
  funciona contra las filas reales ya cargadas.
- **Pendientes/decisiones:** ninguna nueva. Sigue la Parte B del mismo prompt
  (`fila_encabezado` por solapa, no por base, en `m2`).

## Paso 2.11 Parte B — `fila_encabezado` es por solapa, no por base (2026-07-31) — commit `429a719`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md` Parte
  B — `BASES.m2.fila_encabezado=3` se aplicaba a toda la base, pero solo es correcto
  para `M2 periodo DIRECTA`/`DIGITAL`. Siete solapas de `m2` decían 3 y son 1 (`Directa
  mail`, `M2 Directa`, `M2 digital`, `Seguimiento digital`, `CAMPAÑAS_DESGLOCE_DIGITAL`,
  `Alcance`, `Digital acumulado`), y `Mail per` (`m2` y `digital`) no tiene fila de
  títulos. Leer con encabezado en fila 3 donde no corresponde no falla: toma una fila de
  datos como si fueran títulos, columnas con nombres raros y números plausibles — el modo
  de falla caro otra vez.
- **Qué se hizo:** `Fuentes.gs` — `resolverFilaEncabezado_(baseId, solapa,
  filaEncabezadoBase)`: busca primero en `SOLAPAS.fila_encabezado`, cae al default de
  `BASES` solo si la solapa no está declarada; `0` es un valor explícito ("sin fila de
  títulos") y se respeta tal cual. `leerFuente` ya la usa, con guardarraíl (`ok:false`)
  si da 0 — ninguna solapa `fuente` puede tener `0`, pero se cubre por si algo llama
  `leerFuente` directo. `Instalar.gs` — `SEED_SOLAPAS_` corregido con la tabla del
  prompt (las siete de `m2` a `fila_encabezado:1`, `Mail per` ×2 a `0`);
  `filasSolapa_()` ahora acepta `opciones` para pasar el override a un lote.
  `Solapas.gs` — `firma_encabezado` (columna reservada desde el Paso 2.6, nunca
  implementada) ahora la escribe `inventariarSolapas()` vía `leerFirmaEncabezado_()`:
  vuelca el contenido real de la fila que señala `fila_encabezado`, para que una
  fila mal puesta se vea a simple vista en la propia hoja `SOLAPAS`.
- **Prueba:** confirmada indirectamente — el usuario corrió "Sembrar clasificación
  inicial de solapas" + "Inventariar solapas" contra la planilla en vivo y usó los
  `filas_datos`/`filas_crudas` resultantes (ya con `fila_encabezado` corregido) para el
  análisis que motivó el Paso 2.12 (ver entrada siguiente): quince de las dieciséis
  solapas `fuente` dieron 100% o 99,8% de cobertura, patrón que solo es posible si el
  encabezado se está leyendo donde corresponde.
- **Pendientes/decisiones:** queda anotado, sin resolver acá, que `Auditoria.gs`,
  `Fechas.gs` y `Union.gs` tienen sus propios `Number(base.fila_encabezado) || 1` que NO
  pasan por `resolverFilaEncabezado_()` — el prompt de esta parte solo pedía corregir
  `leerFuente`. Si alguno de esos diagnósticos corre sobre una de las siete solapas
  corregidas, puede repetir el síntoma viejo.

## Paso 2.12 Parte 1 — `filas_crudas` deja de restar el encabezado (2026-07-31) — commit `53098f2`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.12_conteos_y_clasificacion.md` Parte 1
  — de las 84 filas de `SOLAPAS`, 65 dan `filas_datos = filas_crudas + 1`, exactamente
  +1 sin excepción: `filas_datos` (Paso 2.10 Parte B) cuenta el encabezado, `filas_crudas`
  seguía restándolo (`getLastRow() - 1`, el valor viejo). Un subconjunto no puede ser
  mayor que el conjunto — el guardarraíl del 90% de cobertura (`UMBRAL_COBERTURA_LECTURA_`,
  Fuentes.gs) no podía dispararse nunca, con el cociente pasado de 100% en 65 de 84 filas.
- **Qué se hizo:** `Solapas.gs` — `filasCrudas = hojaSheet.getLastRow()`, sin el `- 1`.
  Una línea, nada más; el prompt lo pide explícito como commit aislado, bloqueante para
  la Parte C del Paso 2.11 (cualquier diff que arme esa parte sobre `SOLAPAS` iba a
  mostrar números incoherentes sin poder distinguir si era el diff o el dato de base).
- **Prueba:** pendiente de que el usuario corra "Inventariar solapas" contra la planilla
  en vivo y confirme: (1) invariante `filas_datos <= filas_crudas` en las 84 filas — si
  alguna lo viola, es otra definición desalineada, no se ajusta el número; (2) con la
  clasificación ACTUAL (sin la Parte 2 de este mismo prompt, que todavía no corrió),
  dispara **una sola** ⚠ de cobertura entre las `fuente`: `rdv/RVD JM-CM - ES`,
  721/1363 ≈ 53% (relleno de fórmula, 720 encuentros reales). La segunda del criterio
  completo (`digital/Cuentas`, 79%) recién aparece cuando `digital/Cuentas` pase a
  `fuente` en la Parte 2.
- **Pendientes/decisiones:** Parte 2 (17 disposiciones de `SOLAPAS.uso`, queda para
  después de la Parte C del Paso 2.11 — necesita el diff de esa parte) y Parte 3
  (retirar `reclasificarSolapasM2Invertidas_`, entra dentro de la Parte D del Paso 2.11)
  siguen sin ejecutar.

## Paso 2.11 Parte C — un solo "Aplicar configuración", con diff (2026-07-31) — commit `2979f03`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md` Parte
  C — la configuración se aplicaba desde cuatro ítems de menú sin orden escrito
  (`instalar`, `seedConfiguracion`, `sembrarClasificacionSolapas`,
  `menuSembrarSecciones_`), y correr uno después de otro podía revertir en silencio lo
  que el anterior acababa de aplicar (exactamente lo que le pasó a `m2.hoja_default` en
  el Paso 2.10 Parte C). Tareas: un `menuAplicarConfiguracion_()` que corre los cuatro en
  orden fijo y reporta un **diff** (qué cambió, de qué valor a qué valor), no un conteo;
  un `menuEstadoConfiguracion_()` de solo lectura con las discrepancias código↔planilla.
- **Qué se hizo:** `Instalar.gs` — `calcularDiffUpsert_()`: motor de diff genérico por
  clave compuesta, sin escribir nada. `upsertPorClave_()` pasa a ser un wrapper que
  aplica ese diff (antes reescribía TODA fila existente sin comparar — "MAPEO —
  actualizadas: 106" no distinguía cambio real de reescritura idéntica). `instalar()`,
  `seedConfiguracion()` y `sembrarClasificacionSolapas()` se partieron en un núcleo sin
  `alert()` (`aplicarInstalacion_`, `aplicarSeedConfiguracion_`,
  `aplicarClasificacionSolapas_`, que devuelven el resultado) y un wrapper delgado que
  arma el texto y lo muestra — los tres ítems de menú individuales siguen andando igual
  que antes, ahora sobre el núcleo compartido. `seedConfigConfig_()` (CONFIG) y
  `sembrarSecciones_()` (SECCIONES) se enriquecieron para devolver el mismo tipo de
  detalle (`cambios`/`nuevasClaves`) sin cambiar su lógica, que ya era diff-aware.
  `menuAplicarConfiguracion_()` corre los cuatro núcleos en orden fijo
  (instalar → seed BASES/MAPEO/CONFIG/INFORMES/PERIODOS → clasificar SOLAPAS → sembrar
  SECCIONES) y escribe el diff completo en la hoja `DIFF_CONFIGURACION` (un `alert()`
  con cientos de líneas es el mismo modo de falla que ya rompió
  `diagnosticarColapso_()` por timeout) con un resumen de conteos en el `alert()`.
  `menuEstadoConfiguracion_()` recalcula los mismos diffs sin aplicarlos, agrega
  distribución de `origen` para `SOLAPAS`, y escribe todo en `ESTADO_CONFIGURACION`.
  `Codigo.gs` — los cuatro ítems individuales bajan a un submenú `Avanzado`; los dos
  nuevos quedan arriba en `Configuración`.
  **Corregido de paso:** `aplicarClasificacionSolapas_()` ya NO escribe `filas_datos` ni
  `firma_encabezado` al clasificar — esas dos las escribe `inventariarSolapas()` contra
  el archivo vivo, y el código viejo las pisaba con el valor casi siempre vacío de
  `SEED_SOLAPAS_` en cada siembra (bug preexistente, invisible mientras "Sembrar
  clasificación" se corría una sola vez; se vuelve real ahora que entra en un ítem
  pensado para correrse seguido).
- **Prueba:** protocolo de siete pasos de `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`,
  corrido dos veces por el usuario contra la planilla — evidencia completa en
  `docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md` (cuerpo = primera corrida, addendum =
  segunda). **Primera corrida: 5 de 7.** Fallaron el paso 4 (idempotencia: la nota de
  `SOLAPAS.digital||RDV JM 2 VECES` se reescribía en cada corrida) y el 5 ("Estado" decía
  ✅ y un "Aplicar" inmediato cambiaba una celda). **Segunda corrida, con C.2-1 completo:
  los siete pasos ✅** — apply ×2 con `nuevas: 0 · cambiadas: 0`, `DIFF_CONFIGURACION`
  con las 10 protegidas y ninguna línea de cambio, y "Estado" en cero **consistente** con
  las dos corridas de apply (que era exactamente lo que el paso 5 tenía que descartar).
  El control positivo de la primera corrida cerró con evidencia una duda abierta desde el
  31/07: `BASES` y `MAPEO` **sí** se auditan — el "cero líneas" era ausencia de cambios,
  no ceguera del diff.
- **Pendientes/decisiones:** **el diff funciona pero todavía no es auditable**: C.2-2 a
  C.2-7 siguen sin hacer (sin marca de corrida ni bloque de alcance — hay que vaciar las
  hojas de reporte a mano; las migraciones escriben por fuera del diff; las protegidas no
  dicen qué se habrían perdido; no hay línea `solo_en_hoja`). Pasar el protocolo no es
  tener un diff auditable. El resto del menú era la Parte D del mismo prompt y ya se
  resolvió aparte (commit `9fd16c6`, menú declarado por tabla); queda de esa parte retirar
  `reclasificarSolapasM2Invertidas_` (Parte 3 de `Paso-2.12`).

## Paso 2.11 Parte C.2-1 — el diff deja de reportar un cambio que no existe (2026-08-01) — commit `2979f03`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md` C.2-1. La
  premisa original (el seed degradó `PERIODOS` de fecha a texto y cualquier filtro por
  ventana devuelve cero filas) resultó **falsa en las dos mitades**, y las dos correcciones
  quedaron como addenda fechados en el propio prompt: no hay ningún consumidor que compare
  el valor crudo (`resolverVentana` pasa todo por `parsearFechaCelda_`, que acepta texto
  ISO), y el diagnóstico mostró que **las doce celdas son `Date`** — lo que cambió fue el
  formato de visualización, no el tipo.
- **Qué se hizo:** `Fechas.gs` — `diagnosticoTiposFechasConfig_()`, solo lectura, reporta
  `typeof` / `instanceof Date` / display de `PERIODOS`, `CAMPANAS`, `CONFIG` y (agregada
  después, por el hallazgo del protocolo) `BASES.fila_encabezado`. `Instalar.gs` —
  `normalizarParaComparar_(valor, tipoColumna)` + `COLUMNAS_FECHA_REGISTRO_`, integradas
  en `calcularDiffUpsert_()`: `Date` y string-fecha se llevan a ISO `yyyy-mm-dd` **solo
  para comparar**, nunca se escribe el valor normalizado. Estricta a propósito: un string
  se canonicaliza únicamente si es exactamente una fecha, para no tapar un cambio real en
  una nota. Se **retiró** `corregirNotaControlAnclaje_()` entera: comparaba contra su
  propia constante vieja y revertía en cada corrida la nota que `SEED_SOLAPAS_` ya traía
  bien — una migración que corrige lo que el seed vuelve a escribir bien es un parche
  permanente, no una migración.
- **Prueba:** los siete pasos del protocolo, ver la entrada de arriba. El bloqueante 2
  (paso 5) **no tuvo arreglo propio**: se cayó como consecuencia de resolver el 1.
- **Pendientes/decisiones:** `BASES.fila_encabezado` es `number` en las cinco filas
  (`m2 = 3`) — el `31/12/1899 → 1900-01-02` era solo formato de celda, así que el hallazgo
  baja a cosmético; **H-2 sigue en pie por otra razón** (`BASES.m2 = 3` contra
  `SOLAPAS.m2/Cuentas M2 = 1`, más los dos accesos directos de `Union.gs`). Ver
  `docs/PENDIENTES_consistencia.md`.

## DOC-5 — Orden documental: un solo dueño por hecho (2026-07-31) — commits `b9d57c5`…`ceeef86` y el de esta entrada
- **Qué pedía el prompt:** `docs/Prompts/DOC-5_orden_documental.md` — inventario de los
  ~96 `.md`, duplicaciones, hechos sin respaldo, huérfanos/muertos, y propuesta de mapa
  de autoridad. Las partes siguientes las dirigió la revisión humana por PARADAs
  (decisiones D-1–D-4, correcciones T-1–T-5, hallazgos G-1–G-3).
- **Qué se hizo:** handoff vivo pasó a `HANDOFF 2026-07-31-3.md` (estaba archivado y sin
  trackear); `PROYECTO.md` §7 dejó de llevar estado (roadmap + puntero a esta bitácora y
  al handoff); §9 dejó de asignar vivo/congelado central (lo declara cada doc);
  `REGLAS_R09_R10.md` a `docs/Prompts/_archivo/` (no era un prompt); campo único
  `reemplaza:` para declarar reemplazo (prompts y handoffs, admite partición); addenda
  fechados permitidos sobre prompts ejecutados; `.gitignore` con motivo (datos reales
  fuera del repo público, el `.zip` nunca llegó a commitearse); auditoría G-1c del
  historial → P0 en `PENDIENTES_consistencia.md` (datos personales reales desde
  `75f510d`, decisión del equipo, fuera del alcance de Code); **tabla de autoridad
  instalada en `CLAUDE.md` §7** (una pregunta → un dueño único → quién escribe, con
  desempate propio; la tabla de ruteo de §3 desaparece); `PROPUESTA_orden_documental.md`
  archivada con nota de instalación.
- **Prueba:** revisión humana parte por parte (cada PARADA); verificaciones git en vivo
  (`check-ignore` por las tres fuentes, `ls-tree` de HEAD, historial completo de
  binarios; el bug de `git mv` con edición sin stagear se reprodujo en un repo de prueba
  aislado antes de afirmarlo).
- **Pendientes\decisiones:** P0 de datos en historial (equipo, diferido); generalizar
  `reemplaza:` a los prompts viejos con reemplazo ya detectado (Paso-0→0-v2, 1.6→1.6-v2,
  3→3-v2, 2.2→2.2.2); `ESCRITORES.md` (Paso 2.11 Parte E) para que la fila del sembrador
  quede operativa; `docs/Prompts/Paso-2.13` referencia `docs/_archivo/`, que no existe —
  al ejecutarlo, usar `Plan Inicial/_archivo/`.

## Protocolo 2.11-C corrido — 5 de 7 pasos pasados (2026-07-31/08-01) — commit `641ba42`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`, protocolo de
  siete pasos, para decidir si la Parte C + C.2-1 se puede commitear.
- **Qué se hizo:** el usuario corrió el protocolo desde la planilla (snapshot previo, cinco
  ediciones de control positivo, aplicar ×2 + estado). Code documentó la corrida en
  `docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md` (archivo nuevo, congelado, con su fila en
  `CLAUDE.md` §7 y en `PROYECTO.md` §9) y verificó la causa del bloqueante contra el código.
- **Prueba:** pasos 1, 2, 3, 6 y 7 ✅; pasos 4 (idempotencia) y 5 (estado = apply) ❌.
  El control positivo cerró con evidencia la duda abierta desde el 31/07: `BASES` y `MAPEO`
  **sí** se auditan — el "cero líneas" anterior era ausencia de cambios, no ceguera.
- **Pendientes/decisiones:** **sin commit del código** (Parte C + C.2-1 siguen en el working
  tree). Bloqueante 1 verificado —la migración `corregirNotaControlAnclaje_` revertía la
  nota que `SEED_SOLAPAS_` ya traía bien, roles invertidos respecto de la hipótesis— y
  arreglado retirando la migración; falta re-correr los pasos 3-5. Bloqueante 2 debería
  caerse con eso, se verifica. Hallazgo nuevo: `BASES.fila_encabezado` con formato de fecha
  (P1, se une a H-2). Los tres en `docs/PENDIENTES_consistencia.md`.

## Paso 2.11 C.2-2 a C.2-6 — el diff pasa a ser auditable (2026-08-01) — commits `63095d9`, `3401861`, `f0d12ea`, `d561b6d`, `45fe14e`
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md` (con sus tres
  addenda), puntos C.2-2 a C.2-6. La Parte C pasó los siete pasos del protocolo y aun así
  el diff **funcionaba pero no decía qué había mirado**: "cero líneas" y "no auditado"
  daban el mismo output, y hubo que vaciar las hojas de reporte a mano tres veces porque
  no había marca de corrida. Lote nocturno encadenado, un commit por parte.
- **Qué se hizo:**
  - **C.2-2** (`63095d9`) — cabecera de corrida (`ejecutado_por`, `fecha_hora`,
    `version_codigo`) en las dos hojas de reporte, que se limpian enteras antes de
    escribir. `ALCANCE_REGISTROS_` declara las **diez** hojas de registro con `auditada`,
    `filas_en_hoja`, `filas_en_seed` y el motivo cuando no se audita; `MARCADORES` va con
    `sin sembrador`, a la vista. Separados los dos sentidos de "actualizada": `instalar()`
    verifica/repara **estructura**, y eso ya no se lista junto a hojas con cambios de
    contenido (`REUNIONES`/`VALORES`/`VALORES_DIVERGENTES` aparecían ahí).
  - **C.2-3** (`3401861`) — las siete migraciones devolvían un contador opaco; ahora
    devuelven `cambios` y salen en el diff con `tipo = migracion`, o
    `migracion (pisa manual)`. Una fila protegida por el seed pero modificada por una
    migración en la misma corrida ya no sale como `protegida` a secas. Cada migración
    acepta `aplicar=false` (calcula sin escribir), y `menuEstadoConfiguracion_()` lo usa
    para incluir las migraciones pendientes sin aplicarlas. Caso testigo: S-01
    (`alinearSolapasLookerADinamico_`) escribía las tres celdas **siempre**, sin comparar.
  - **C.2-5** (`f0d12ea`) — `calcularDiffUpsert_` devuelve `soloEnHoja`: lo que está en la
    hoja y no en el seed se reporta y **no se borra**. Es donde vivía la fila `m2||ahhh||or`
    del control positivo, que sobrevivió tres corridas sin que nadie la nombrara. En
    `SOLAPAS` las protegidas se descuentan, o habrían salido como huérfanas siendo la
    categoría contraria.
  - **C.2-4** (`d561b6d`) — `aplicarClasificacionSolapas_` calcula el diff que **no**
    aplica: cada protegida dice columna, valor actual, valor del seed y "no aplicado:
    origen=manual". Si no había nada por cambiar lo dice explícito en vez de dejar celdas
    vacías. Lo necesita la Parte 2 del Paso 2.12 para `rdv/RDV CONJUNTO` y `rdv/Comunas`.
  - **C.2-6** (`45fe14e`) — `resumenDesagregado_`: cambiadas · agregadas · migraciones ·
    solo_en_hoja · protegidas (con y sin diferencia) · sin cambios, más `otras líneas (sin
    categoría)` para que un tipo desconocido no desaparezca del total. Sigue sin listar
    claves (el `alert()` con cientos de líneas ya rompió `diagnosticarColapso_()`).
- **Prueba:** **ninguna contra la planilla — eso es del humano.** Cada parte tiene su
  control positivo en `Pruebas.gs` (archivo nuevo), porque el protocolo de siete pasos
  pasa igual aunque las cinco estén mal implementadas: cero cambios sigue siendo cero
  cambios. Los controles alimentan las funciones con hojas sintéticas y afirman que la
  discrepancia conocida se detecta. Verificado además por **mutación**: se rompió cada
  función a propósito, incluido reintroducir el bug original de cada parte, y los
  controles cazaron **18 de 18**. `clasp push` hecho.
- **Pendientes/decisiones:** C.2-7 sin hacer (`docs/_snapshots/` nunca se versionó). El
  prompt citaba `CLAUDE.md` §5 para la convención `probar_<nombre>()`; §5 es "Handoffs" y
  esa convención no estaba escrita en ningún lado — queda anotada en
  `docs/PENDIENTES_consistencia.md` junto con la nota de API executable (versión desplegada
  ≠ HEAD).

## Paso 1.8 — API de pruebas sobre `/dev` (2026-08-01) — commits de esta entrada
- **Qué pedía el prompt:** `docs/Prompts/Paso-1.8-API-de-pruebas-v3.md`. Que Code pueda
  invocar funciones del motor contra HEAD y leer el resultado, sin deploy versionado y sin
  que un humano apriete un botón del menú en cada ciclo. Decisión de diseño del prompt: la
  URL `/dev`, no `/exec`; `clasp deploy` no se usa en este paso.
- **Qué se hizo:**
  - **`Api.gs`** (archivo nuevo) — `doGet`/`doPost` delegan en `manejarPedido_`, todo
    adentro de un `try/catch` porque una excepción no atrapada devuelve HTML y rompe al
    cliente. Pedido unificado (body JSON pisa query string). Dos barreras siempre, en
    orden: identidad contra `API_AUTORIZADOS_`, y token contra la propiedad de script
    `API_TOKEN` con comparación de longitud fija. Propiedad ausente **rechaza**. Cinco
    acciones: `ping`, `version`, `registros`, `bases`, `llamar`. La `traza` sale siempre,
    en éxito y en error. `serializar_` con tope de profundidad 5 y nombre del tipo para lo
    que no sobrevive a `JSON.stringify`.
  - **`Fuentes.gs`** — el prompt lo declaraba intacto, pero su propia prueba de aceptación
    nº 3 (`llamar` a `probarConexionBases`) era imposible: la función alertaba con
    `SpreadsheetApp.getUi()`, que sobre HTTP tira excepción. Se extrajo
    `diagnosticoBases_()`, que devuelve las líneas; la de menú alerta sólo si `hayUi_()`
    (nuevo, en `Codigo.gs`) y ahora retorna el resumen. Cero aritmética tocada.
  - **`Api.gs` · `apiHojaControl_()`** — sobre HTTP no hay planilla activa y **todos** los
    módulos leen con `getActiveSpreadsheet()`. Si devuelve `null`, ata la planilla por la
    propiedad opcional `HOJA_CONTROL_ID`. El id no va en el código.
  - **`tools/token.js`** — access token derivado de `~/.clasprc.json`, con cache y
    `--info` (imprime cuenta y scopes, nunca el token). Estructura real de clasp 3.3.0:
    `tokens.default.{client_id, client_secret, refresh_token}`; se contempla también la
    forma de clasp 2.x.
  - **`tools/api.js`** (no lo pedía el prompt) — cliente que lee las dos credenciales
    adentro del proceso. El prompt proponía `curl` con las credenciales en la línea de
    comandos, o sea en el historial del shell y en los logs; el `CLAUDE.md` de usuario lo
    prohíbe. La URL sale de `docs/ENTORNO.local.md`.
  - **`appsscript.json`** — bloque `webapp` (`ANYONE_ANONYMOUS` + `USER_DEPLOYING`), que
    acá no abre nada: `/dev` exige permiso de edición y la Barrera 1 rechaza sin mail.
  - **`docs/ENTORNO.local.md`** (fuera de git) — fuente única de URLs y cuentas. Con su
    fila en `CLAUDE.md` §7 y en la taxonomía de `PROYECTO.md` §9, en este mismo commit.
  - **`.gitignore`** — `docs/ENTORNO.local.md`, `.env`, `tools/.token-cache.json`,
    `.clasprc.json`. **`.claspignore`** — `Plan Inicial/`, `docs/`, `tools/`, `*.md`,
    `.env` explícitos después de las negaciones.
  - **`docs/RUNBOOK.md`** — Parte G nueva, con la operatoria y **sin un solo valor
    concreto**: apunta a `ENTORNO.local.md` para URLs y cuentas.
- **Prueba:** las cuatro de aceptación **no corrieron**: falta que el humano cargue
  `API_TOKEN` en las propiedades del script, y sin eso la Barrera 2 rechaza por diseño.
  Sí corrió la primera llamada real contra `/dev`: devolvió **JSON** (no HTML) con
  `barrera 1: ok` y `barrera 2: API_TOKEN no está seteado` — o sea que el Bearer derivado
  de `.clasprc.json` alcanza y que `Session.getActiveUser()` devuelve el mail sobre `/dev`,
  que era el supuesto central del prompt. Verificadas aparte con node, fuera de la
  planilla, `serializar_` (primitivas, `null`, `NaN`, `Date`→ISO, anidado, objeto de clase,
  tope de profundidad) y la comparación de longitud fija (igual, distinto, vacío, prefijo,
  más largo): 12 de 12. `clasp push` hecho.
- **Pendientes/decisiones:**
  - **La URL `/dev` NO se arma con el `scriptId`**, contra lo que afirmaba el prompt en dos
    lugares: probado, devuelve 404 en HTML. El id de la URL es el de la implementación
    `@HEAD`, que da `clasp list-deployments`.
  - La cuenta que pasa la Barrera 1 es **`jpcofanogcba1@gmail.com`** (la de clasp), no la
    del usuario en otros productos. Verificada con `node tools/token.js --info`, que además
    confirmó el scope `script.webapp.deploy`: no hizo falta ni el Plan B ni el Plan C.
  - No se actualizó el estado del paso en `PROYECTO.md`: DOC-5 le sacó el estado de avance
    a ese documento (§7). Va a `HANDOFF_CODE.md`.
  - `llamar` **no** tiene lista blanca de sólo lectura — sigue siendo el punto 2 del
    pendiente P0. Lo que sí queda cerrado para `/dev` es el punto 1 (código viejo): `/dev`
    es HEAD. P0 revive cuando el Paso 6 publique `/exec`.

## Paso 2.11 C.2-7 — documentación y snapshots (2026-08-01) — commits `e62b8bd` + el de esta entrada
- **Qué pedía el prompt:** `docs/Prompts/Pedido_C.2-7.md`, que cierra el último punto abierto
  de `docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`. No es un paso de código: bajar la
  Parte C.2 al prompt dueño, exportar los snapshots y anotar lo que la corrida dejó a la
  vista. No crea un `.md` de prompt propio (`CLAUDE.md` §3).
- **Qué se hizo:**
  - **`tools/snapshot.js`** (archivo nuevo) — vuelca las diez hojas de registro a TSV.
    **No usa `tools/api.js`**: el contra-qué de un diff no puede salir del mismo código que
    se está probando, así que le pide el volcado a Google directo por el endpoint de
    exportación de Sheets, con el mismo Bearer de `tools/token.js`. No pasa por
    `calcularDiffUpsert_`, ni por los `SEED_*`, ni por los lectores de `Config.gs`. La lista
    de las diez hojas está duplicada a propósito de `ALCANCE_REGISTROS_`: leerla del código
    bajo prueba anularía la independencia. El id de la planilla sale del `parentId` de
    `.clasp.json` y los `gid` de la página `htmlview`; no hay ningún id en el script.
  - **`docs/_snapshots/`** — diez archivos `<HOJA>_2026-08-01.tsv`. **Diez, no nueve**: el
    prompt de C.2 pedía nueve y C.2-2 estableció diez (las nueve más `MARCADORES`); el
    bloque ALCANCE de la corrida emite diez filas. Premisa vencida del propio prompt, la
    cuarta de este tipo en el proyecto.
  - **`docs/RUNBOOK.md` Parte H** — cuándo se corre el snapshot, por qué no usa la API del
    motor, y el 429 de la cuota de exportación (el script espera y reintenta; un volcado a
    medias es peor que ninguno porque parece completo).
  - **`docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`** — addendum 1 fechado (el
    prompt ya estaba ejecutado, no se tocó una línea del texto original): la Parte C.2
    entera en una tabla punto por punto, las dos cosas que se diseñaron y no fueron
    (`tipo_degradado` y la migración `corregirNotaControlAnclaje_`, con el porqué), los
    controles positivos, y **el fix de `sembrarClasificacionSolapas()`** que la Parte C hizo
    y nunca se documentó — dejó de pisar `filas_datos` / `firma_encabezado` con el valor
    vacío de `SEED_SOLAPAS_`, porque esas dos columnas son de `inventariarSolapas()`.
  - **`docs/PROTOCOLO_2.11-C_corrida_2026-08-01.md`** (nuevo, congelado) — la corrida. No
    reemplaza al de `2026-07-31`, que cubre otras dos corridas con otro código; ese no se
    editó.
  - **`docs/PENDIENTES_consistencia.md`** — dos P0 tachados, el P0 de la API reescrito y
    tres hallazgos abiertos (abajo).
- **Prueba:** las cinco `probar*_()` corrieron **por la API sobre `/dev`**: 5 de 5 OK. Es la
  primera vez que Code corre parte del protocolo sin que nadie abra la planilla. El
  protocolo desde el menú lo corrió el usuario: `menuEstadoConfiguracion_` (16:06) y dos
  `menuAplicarConfiguracion_` (16:29:14 y 16:30:56), **idénticos**:
  `cambiadas: 0 · agregadas: 0 · migraciones: 0 · solo_en_hoja: 7 · protegidas (con
  diferencia): 10 · protegidas (sin diferencia): 0 · sin cambios: sí`. Estado y Aplicar
  coinciden. Qué se probó **cómo**, que es lo que importa acá:
  - **C.2-2, C.2-4, C.2-5, C.2-6 — en vivo contra la planilla.** Diez filas de alcance, diez
    protegidas con su `habría cambiado`, siete `solo_en_hoja` reportadas y todavía en la
    hoja, resumen desagregado. Números distintos de cero: la corrida los ejercitó.
  - **C.2-3 — sólo sintético** (`probarMigracionesEnDiff_`). `migraciones: 0` es correcto,
    pero cero no distingue *no hay migraciones pendientes* de *ese camino no se ejecuta*.
  - **`cambiadas` / `agregadas` — el camino central del upsert no se ejecutó** en ninguna de
    las dos corridas. Lo probaría el control positivo de cinco ediciones, que no se repuso
    (la planilla se limpió antes: `zz_prueba` y la huérfana `ahhh` ya no están, verificado
    en los snapshots).
  - Los snapshots se revisaron **antes** de commitear: ninguna de las diez hojas tiene datos
    personales. `REUNIONES` trae barrios y temas, `CAMPANAS` nombres de campaña, y los ids
    de Drive de `BASES`/`CONFIG` ya estaban en `Instalar.gs` desde antes.
- **Pendientes/decisiones:**
  - **P1 (se pidió como P0) · las siete filas huérfanas de `MAPEO` son columnas de fecha.**
    Las escribe `promoverFechasElegidas()` (`Fechas.gs:378`), no un sembrador: dos
    escritores para la misma hoja. Baja a P1 porque, verificado contra el código, **no se
    pierde un número en silencio**: `leerFuente()` corta con `«FALTA:fecha_periodo@…»`
    (`Fuentes.gs:367-370`), las cinco de `digital` no se consumen (`modo_periodo = snapshot`
    retorna antes, `Fuentes.gs:361-365`) y la fila 3 es el contrato viejo derogado, que el
    seed ya cubre como `fecha_periodo` (`Instalar.gs:673`). La única que un re-sembrado
    rompería es la 108 (`rdv||RDV_otros_ministros`), y rompe fuerte.
  - **P1 · asimetría Estado / Aplicar en las protegidas.** C.2-4 vive en
    `aplicarClasificacionSolapas_()`, que sólo corre en el apply; `menuEstadoConfiguracion_()`
    reimplementa la comparación (`Instalar.gs:2136-2153`) y saltea las `origen=manual` con un
    `return` seco, además de comparar con `String()` en vez de `normalizarParaComparar_()`.
  - **P2 · `diagnosticoBases_()` lista solapas `uso = 'ignorar'`.** `getSheets()` crudo
    (`Fuentes.gs:117`), sin `usoSolapa_()`. **Preexistente**: se extrajo tal cual de
    `probarConexionBases()` en el Paso 1.8 y se veía poco porque vivía en un `alert()`.
  - **El P0 de la API se reescribió y baja a P1.** Sobre `/dev` el desfasaje de versión no
    aplica (`/dev` es HEAD); revive cuando el Paso 6 publique `/exec`. La lista blanca
    `EJECUTABLES_REMOTOS_` **se difiere al Paso 6, decisión del usuario del 01/08/2026**.
  - **Dos correcciones al prompt de este pedido**, las dos verificadas: son siete filas
    huérfanas pero **una es de otra clase** (la 3, derogada, no una pérdida); y el duplicado
    de `digital` que causa doble conteo es `digital||RDV` (`uso = ignorar`), no
    `digital||RDV JM 2 VECES` (`uso = referencia`). En la salida real de `diagnosticoBases_()`
    hay **siete** tablas dinámicas, no cinco.
  - `docs/Prompts/AUD-3_inventario_codigo.md` sigue sin commitear: es de otro paso, no se
    bundlea (`CLAUDE.md` §4.5).

## Config — el scratchpad entra al `additionalDirectories` de usuario (2026-08-01) — commit de esta entrada

No es un paso del motor y **no tocó un solo archivo del repo**: el cambio vive en
`~/.claude/settings.json`, fuera de git. Se anota igual porque el hallazgo del final cambia
qué esperar de la configuración de permisos, y porque un archivo fuera de git no lo ve
nadie más.

- **Qué se cambió.** Una sola clave: `permissions.additionalDirectories` pasó de `[]` a
  `["C:\\Users\\20243359679\\AppData\\Local\\Temp\\claude"]`. El scratchpad de sesión cuelga
  de ahí con un ID que cambia en cada arranque, así que aprobar la ruta puntual no servía:
  la sesión siguiente era otra ruta. Verificado tras reiniciar — escribir y leer archivos en
  el scratchpad ya no pide autorización. Ése era el problema real.
- **Se corrió `/fewer-permission-prompts` y el resultado fue no agregar nada.** Escaneados
  los 50 `.jsonl` más recientes de los siete proyectos. Todo comando líder con tres o más
  usos ya está cubierto: o lo auto-permite Claude Code (`grep` 158, `ls` 54, `cat` 20,
  `find` 19, `which`/`wc`/`tail`/`sed`/`echo`), o ya está en el allowlist de usuario
  (`git` 131, `node` 43, `cp` 14, `npx` 13, `python3` 11), o está en `ask` a propósito
  (`taskkill`, `pkill`). Del lado PowerShell la herramienta casi no se usa: 47 `cd`, 8
  `git`, 5 `ls`, 5 `Copy-Item`. Agregar reglas que no matchean sólo ensucia el archivo.
- **Un error de método que conviene no repetir.** El primer conteo contaba *tramos de
  pipeline* (`grep … | sort | uniq`) y daba candidatos falsos como `Select-Object`. Las
  reglas de permiso matchean contra el **comando líder**, no contra cada tramo. Recontado
  por líder, la lista de candidatos quedó vacía.
- **Lo que sí queda y no se arregla con allowlist.** Unas 34 invocaciones arrancan con
  formas compuestas —`for f in …`, `export LC_ALL=…`, prefijos de variable como
  `SCRATCH=… comando`— que no matchean limpio contra reglas de prefijo. Si son la causa de
  los prompts residuales, el arreglo es de conducta y ya está escrito: comandos simples, sin
  cadenas largas (`CLAUDE.md` de usuario, §Comandos simples). No está confirmado cómo parte
  Claude Code los compuestos antes de evaluar permisos.
- **Límite del método, para no llevarse una falsa tranquilidad.** Los transcripts registran
  los rechazos, no las autorizaciones concedidas: en las 50 sesiones hay **un solo** rechazo
  real. "No hay candidatos" significa *ningún patrón frecuente sin cubrir*, no *no te van a
  preguntar nunca*.
- **Corrección a un dato que Code dio mal en esta misma sesión.** Se afirmó que en
  `defaultMode: "auto"` el clasificador puede pedir confirmación aunque exista una regla de
  allow que matchee. **Es falso.** El esquema de settings documenta `autoMode.classifyAllShell`
  como *"When true, every Bash/PowerShell allow rule is suspended … so all shell commands are
  routed through the classifier"*, con **default `false`**: por defecto las reglas de allow
  ganan y el comando no llega al clasificador. El flag no está puesto en ninguno de los dos
  settings. Consecuencia práctica: ampliar el allowlist **sí** elimina esos prompts de raíz.
- **Pendientes, dejados a propósito.** (a) `Bash(rm *)` y `Bash(curl *)` del allowlist de
  usuario son anchos y se angostan en una sesión dedicada; (b) el `additionalDirectories`
  con `/tmp` del settings del proyecto y el `Read(//tmp/**)` del de usuario son rutas POSIX
  que en Windows no cubren nada — ruido muerto conocido, sin urgencia.

## AUD-3 — inventario del código, sólo lectura (2026-08-01) — commits `3bc7c50` (prompt) + el de esta entrada
- **Qué pedía el prompt:** `docs/Prompts/AUD-3_inventario_codigo.md` (editado en el lugar
  en `3bc7c50`, no ejecutado hasta entonces). Un mapa del código sin tocar una línea:
  grafo de llamadas (A), huérfanas clasificadas (B), trabajos de `Instalar.gs` (C), menú
  (D) y censo de escritores por hoja (E). Dos entregables separados por ciclo de vida.
- **Qué se hizo:**
  - **`tools/inventario.js`** (nuevo) — Parte A mecánica: limpieza de comentarios/strings
    preservando offsets, extracción de funciones con cuerpo por balance de llaves,
    grafo de usos (invocación **y referencia sin paréntesis**), entradas declaradas
    (`onOpen`/`MENU_`/`doGet`/`doPost`/`API_LECTORES_`/**carga de módulo**), tabla de
    menú con `getUi()` en el camino y última mención en bitácora.
  - **`tools/escritores.js`** (nuevo) — Parte E mecánica: las nueve mutaciones sobre las
    diez hojas, atribución por resolución de receptor con propagación por parámetros
    (cadena `vía`), constantes globales y literales de llamadores. Lo no atribuible va a
    `(sin resolver)`, listado — 7 sitios, todos explicados.
  - **`docs/INVENTARIO_CODIGO.md`** (nuevo, congelado) — Partes A a D + salida del script
    embebida. Con su fila en `PROYECTO.md` §9 y en la lista de evidencia congelada de
    `CLAUDE.md` §7, este commit.
  - **`docs/ESCRITORES.md`** (nuevo, vivo) — Parte E: contrato hoja por hoja + matriz
    embebida. Pasa a ser co-dueño real de "¿qué debería decir esa configuración?"
    (`CLAUDE.md` §7 actualizado: la fila dejó de decir "cuando exista").
- **Prueba (criterios del prompt, resultado y no afirmación):**
  - **(a) Reproducibilidad:** 235 funciones de primer nivel ✅ exacto · 21 archivos ✅ ·
    0 duplicados ✅ · `Instalar.gs` 2.204/44 ✅. Líneas: **8.410**, no ~8.100 — la cifra
    externa no coincide con ninguna revisión del 01/08 (medido por commit: 7.304 →
    7.986 → 8.410); menú: **36**, no ~34; `getUi()`: **40**, no 37.
  - **(b) Control positivo del censo — encontró los dos y uno más:** MAPEO vía upsert
    (`Instalar.gs:1391/1400` vía `aplicarSeedConfiguracion_`) ✅ · MAPEO vía
    `promoverFechasElegidas` (`Fechas.gs:385` + `migrarPrefijosFechaPeriodo_:412`) ✅ ·
    y **`consolidarMapeoLooker_` (`Solapas.gs:455-456`), tercer escritor no soplado**,
    que además escribe `BASES` (:485) y `SOLAPAS` (:467-475).
  - Las diez hojas están en la matriz, `CAMPANAS` con cero escritores ✅. `MARCADORES`:
    un solo escritor y es una migración — H-6 confirmado desde el código.
  - Cero cambios en `.gs` ✅ (`git status`: solo `tools/` y `docs/`).
- **La discrepancia como hallazgo (el prompt mandaba parar y reportarla):** las 18
  huérfanas eran **20** — 2 falsas (`filasSolapa_`, `filaSeccion_`: corren en la carga
  de módulo, 18 y 35 llamadas en `SEED_SOLAPAS_`/`SEED_SECCIONES_`; la medición externa
  no contaba el nivel de módulo como entrada) y 4 omitidas (`diagnosticoColumnaFecha_`,
  `diagnosticoElementosSlide_`, `logElementosSlide_`, `filasDigitalDeEncuentro`). Más
  una trampa cazada en el propio script: las 8 de `Pruebas.gs` parecen huérfanas si no
  se cuentan referencias sin paréntesis (`correrPruebasDiff_` las invoca por variable).
  Clasificación final: **8 adelantadas + 6 colgadas + 6 muertas = 20**, ninguna en dos,
  ninguna borrada. Correcciones a hipótesis del prompt: `abrirPanel` y
  `parsearPersonas_` eran candidatas a muertas y son adelantadas (evidencia en el doc);
  `Valores.gs` no está "entero" colgado — la mitad de lectura está cableada al menú, lo
  colgado es el camino de escritura, y el punto de cableado que falta ya existe
  (`corteVerticalRetiro2407_` calcula sin registrar).
- **Pendientes/decisiones:**
  - El tercer escritor de `MAPEO` (`consolidarMapeoLooker_`) queda **declarado** en
    `ESCRITORES.md` §2.1 con regla operativa provisoria; formalizarla es del 2.11 Parte E.
  - Los dos P1/P2 de C.2-7 quedan con más evidencia (asimetría Estado/Aplicar:
    `Instalar.gs:2136-2153`; el seed desactualizado en las 8 `uso` manuales:
    `ESCRITORES.md` §2.2). No se arregló nada — AUD-3 es sólo lectura.
  - **El Paso 1.8 sigue sin su ✅**: el chequeo pedido lo confirma — `fd58902` no trae
    ningún cierre del 1.8 (su entrada de bitácora es de `4fa54f5` y dice "las cuatro de
    aceptación no corrieron"; nada posterior registra que hayan corrido como tales).

## DOC-6 — Una sola fuente de verdad: catálogo, plan y decisiones (2026-08-01) — commits `0185cb7`, `b1e8885`, `97fea9e`, `777c83b`, `760947d`
- **Qué pedía el prompt:** `docs/Prompts/DOC-6_plan_y_fuente_unica.md`. Sacar el plan del
  `§6` del handoff de claude.ai —el artefacto más volátil del repo— y ponerlo en un archivo
  propio; deduplicar reglas **borrando una, no sincronizando dos**; y congelar
  `PROYECTO.md`. Cero código. Un commit por parte, con parada y aviso entre cada una.
- **Qué se hizo, parte por parte:**
  - **A · censo (sólo lectura, sin commit).** 83 `.md` fuera de `_archivo/` y
    `docs/Sesiones/`, 13 vivos. **Catorce enunciados normativos duplicados**, trece de ellos
    entre `CLAUDE.md` y `PROYECTO.md` §9. El decimocuarto ("la plantilla es del equipo")
    estaba en **tres** archivos. La causa raíz quedó identificada en el propio censo: `§3`
    de `CLAUDE.md` **obligaba** a registrar cada documento nuevo en dos índices.
  - **B · IDs `R-` (`0185cb7`).** El prompt decía que la numeración vieja quedaba en un
    archivo; son **tres**. `Paso-2.10_anclar` (nota general), `Paso-2.10_PartesBC`
    (**nota acotada a las líneas 23 y 97** — el resto del archivo ya cita el canon porque es
    el que diagnosticó la colisión, y una nota general habría sido falsa) y
    `VALIDACION_2026-07-31` (congelado pero no es un prompt; decisión del usuario).
    `REGLAS_NEGOCIO.md` se declara canon y explica la causa. **B.4 sin trabajo:** las 34
    citas de la bitácora son todas correctas.
  - **C · `docs/PLAN.md` (`b1e8885` + `97fea9e`).** Archivo nuevo y único del prompt: 14
    decisiones `D-NN`, Próximo/Bloqueado/Backlog, con la frontera y la prueba escritas
    (*si no podés decir qué lo desbloquea, es backlog*). Addendum con dos notas de método.
  - **D · `CLAUDE.md` (`777c83b`).** §9 nueva (10 líneas), mapa del repo, filas de dueño, y
    **§3 deja de exigir el doble registro**: §7 es el único índice.
  - **E · congelar `PROYECTO.md` (`760947d`).** Encabezado con tabla sección por sección de
    adónde fue cada cosa, §9 vaciada con el mapa de sus trece duplicados.
- **Prueba:** no hay protocolo posible —es documentación—, así que el criterio fue el
  censo mismo: `grep` reproducible por enunciado, y verificación de **cada** cita contra su
  destino. Verificado antes de commitear: `BITACORA.md:708` e `Instalar.gs:1965` (las dos
  citas a línea de `D-02`/`D-08`) son exactas; `CONFIG_INFORMES.md:175` ya era dueño de la
  precedencia de merge, así que la de `PROYECTO.md` §5 era duplicado y no pérdida.
  `git status` limpio al cerrar cada parte; **un solo `.md` nuevo en todo el prompt**.
  `wc -l CLAUDE.md`: 225 → **275**.
- **Pendientes/decisiones:**
  - **La Parte E era ruteo, no borrado.** Congelar `PROYECTO.md` dejaba **cinco rutas vivas
    de `CLAUDE.md`** apuntando a un documento que ya no acepta escritura, y **dos eran filas
    de dueño**: "¿arquitectura, esquema, decisión estructural?" y "¿convención de proceso o
    aprendizaje?" se quedaban **sin dueño**. Decisión del usuario: arquitectura →
    `docs/PLAN.md` §1 como `D-NN`; aprendizaje → `CLAUDE.md`, en la sección donde se aplica
    (no un depósito aparte). Las otras tres rutas (`:70`, `:78`, `:99`) se cayeron con la
    primera.
  - **`PROYECTO.md` §2 no estaba duplicado: estaba al revés.** Decía que ejecuta
    `jpcofanogcba1` y que `reporteseinformesgcba` es dueña de las bases; `D-02` (escrito el
    día anterior) lo invierte, y `D-04` descarta la barra lateral que §2 proponía.
    Congelarlo sin marcar la superseción habría dejado un documento que en seis meses enseña
    los roles de cuenta al revés. Marcado en el encabezado.
  - **Tres reglas vivas sin destino, resueltas por el usuario:** las tres capas de
    resolución de período → `docs/TOKENS.md` §5 (el período se resuelve **por token**); el
    bloqueante `{{m2_salud_camp}}` y la mejora de `ultima_carga` → `PENDIENTES`; la lección
    del `getFormulas()` → `CLAUDE.md` §4.
  - **Cuatro referencias cruzadas del propio prompt estaban mal**, las cuatro verificadas
    contra su destino: `D-05`→`D-09` (era `D-11`), `D-09`→`R-02` (era `R-04`), y las dos
    premisas de la Parte B sobre cuántos archivos tenían numeración vieja. La de
    `D-09`→`R-02` es la **cuarta aparición** de la numeración vieja de `R-04`, escrita un
    commit después de que la Parte B cerrara las otras tres. De ahí salió la nota de método
    2 de `PLAN.md`.
  - **La fila de dueños que el `AUD-3` dejó conflada** ("¿qué debería decir la config?" y
    "¿quién puede escribirla?" eran la misma fila) se partió en dos en la Parte D. Es un
    hallazgo, no prolijidad: son preguntas distintas, y las dejó juntas justamente el paso
    que existía para separar dueños.
  - **`CLAUDE.md` quedó en 275 líneas**, por encima del ~250 que sugiere la convención. Se
    decidió no recortar: lo que engordó son invariantes y aprendizajes, o sea contenido de
    primera clase. Candidato futuro con paso propio: §7, que ya tiene 29 filas.
  - No se agregó la fila de `PLAN.md` a `PROYECTO.md` §9 aunque `§3` lo exigía al momento
    del commit: `D.4` retiraba la exigencia y `E` congelaba el archivo dos commits después.
    Declarado en el momento, no en silencio.

## Paso 1.8 ✅ — cierre: las cuatro pruebas de aceptación corridas (2026-08-01) — commit de esta entrada
- **Qué faltaba:** el Paso 1.8 se implementó el 01/08 (`4fa54f5`) pero sus cuatro pruebas
  de aceptación (§7 de `docs/Prompts/Paso-1.8-API-de-pruebas-v3.md`) **nunca corrieron**:
  dependían de que el humano cargara la propiedad de script `API_TOKEN`, y sin eso la
  Barrera 2 rechaza por diseño. El `DOC-6` verificó que ningún commit posterior traía el
  cierre, y lo dejó como punto 1 de `docs/PLAN.md` §2. Esto es ese punto.
- **Qué se hizo:** cero código. Se corrieron las cuatro pruebas contra `/dev`.
- **Prueba — 4 de 4, con qué instrumento y qué devolvió:**

  | # | prueba | vía | resultado |
  |---|---|---|---|
  | 1 | `ping` — valida las dos barreras | query string (`doGet`) | `ok:true`, `barrera 1: ok`, `barrera 2: ok`, mail `jpcofanogcba1@gmail.com`, 93 ms |
  | 2 | token de app inválido | query string | `ok:false`, `error: no autorizado`, traza `barrera 2: token inválido` — **rechaza sin decirle al que llama por qué**, 47 ms |
  | 3 | `llamar` a `probarConexionBases` | body JSON (`doPost`) | `ok:true`, las cuatro bases con sus solapas y conteos, 20.984 ms |
  | 4 | función inexistente | body JSON | `ok:false`, `error: funcion no encontrada: noExisteEstaFuncion_`, 40 ms |

  **Los cuatro criterios de aceptación del prompt, uno por uno:**
  - *JSON válido, nunca HTML* — ✅ las cuatro, `content-type: application/json`, HTTP 200.
  - *`ping` reporta el mail correcto* — ✅ `jpcofanogcba1@gmail.com`, que es el único de
    `API_AUTORIZADOS_` (`Api.gs:29`).
  - *`llamar` devuelve lo mismo que el menú* — ✅ `probarConexionBases` **es** la función
    del ítem "Probar conexión a bases"; sobre HTTP corre igual y devuelve el resumen porque
    `hayUi_()` da false y no alerta. Contrastado además contra la acción `bases` del mismo
    día (que llama a `diagnosticoBases_()`, el núcleo compartido): salida idéntica. Lo
    único no verificado es el `alert()` visual, que requiere abrir la planilla.
  - *ninguna respuesta contiene el `API_TOKEN`* — ✅ verificado por programa sobre los
    cuerpos crudos de las cuatro: ni el token de app (48 caracteres) ni el Bearer de Google
    aparecen en ninguna. El valor no se imprimió en ningún momento, sólo el largo.
- **Desvío respecto del prompt, deliberado:** §7 escribía las cuatro como `curl` con el
  Bearer y el `MOTOR_API_TOKEN` **en la línea de comandos**, o sea en el historial del
  shell y en los logs de la sesión — lo prohíbe el `CLAUDE.md` de usuario. Se corrieron con
  `tools/api.js`, que lee las dos credenciales adentro del proceso. Es el mismo motivo por
  el que ese cliente existe (ver la entrada del Paso 1.8, `4fa54f5`).
- **Pendientes/decisiones:** ninguno nuevo. Los dos que arrastraba el paso siguen donde
  estaban: `llamar` no tiene lista blanca de sólo lectura (`P1` en
  `docs/PENDIENTES_consistencia.md`, **diferido al Paso 6** por decisión del usuario del
  01/08), y el desfasaje de versión no aplica sobre `/dev` porque `/dev` es HEAD.

## Paso 2.11 Parte E — el escritor de looker: retirar la migración ejecutada (2026-08-02) — commits de esta entrada
- **Qué pedía el prompt:** addendum al final de `docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`.
  Cerrar el tercer escritor de `MAPEO` que el censo del `AUD-3` encontró solo,
  `consolidarMapeoLooker_`. Parte A de evidencia con parada obligatoria, Parte B recién con
  la decisión del usuario.
- **Hallazgo previo, y quedó escrito:** **la "Parte E" del Paso 2.11 no existía.** Ese
  prompt tiene A, B, C y D. Cuatro documentos la citaban como dueña del contrato de
  escritores (`BITACORA.md`, `ESCRITORES.md` §2.1, `AUD-3`). El addendum es el primer texto
  que se escribe bajo ese nombre.
- **Qué se hizo (decisión (a) del usuario — migración ejecutada):**
  - **`Codigo.gs`** — **dos** bajas en la tabla `MENU_`, no una: `menuConsolidarMapeoLooker_`
    y `menuAuditarFormulasResumenesLooker_`. El segundo muestra la misma recomendación
    invertida y remata mandando a correr el primero; retirar uno solo dejaba un consejo
    equivocado sin salida. De 36 ítems a **34**, verificado con `tools/inventario.js`:
    ningún ítem quedó apuntando a una función inexistente.
  - **`Solapas.gs`** — encabezados en las cuatro funciones que quedan sin camino de
    invocación. **Ninguna se borró.** `consolidarMapeoLooker_` queda marcada como migración
    ejecutada y **parametrizada por dirección**: es la única forma de mover la decisión sin
    tocar código si el dueño externo cambia cuál hoja mantiene.
  - **`Instalar.gs`** — `alinearSolapasLookerADinamico_` dejó de escribir `notas` y pasó
    `origen` de `'manual'` a `'seed'`.
  - **`docs/ESCRITORES.md`** — `MAPEO` baja a dos escritores de contenido vivos; `BASES` y
    `SOLAPAS` pasan a ✅ con todos sus caminos declarados; §2.1 reescrita con el contrato
    vigente; §2.2 explica por qué las dos de `looker` no eran decisiones humanas.
  - **`docs/PENDIENTES_consistencia.md`** — P1 nuevo (abajo).
- **La corrección a la instrucción, hecha antes de ejecutar:** el prompt pedía que
  `alinearSolapasLookerADinamico_` dejara de escribir `notas` **manteniendo
  `origen='manual'`**. Verificado contra el código, eso **no bajaba el piso de 10 a 8**:
  `aplicarClasificacionSolapas_` saltea con `return` toda fila `origen=manual`, así que la
  nota buena del seed no podía llegar nunca y la línea `protegida (habría cambiado)` iba a
  seguir saliendo. Se reportó antes de tocar nada y el usuario eligió `origen: 'seed'`. El
  `manual` era **vestigial**: lo había escrito la propia migración cuando `SEED_SOLAPAS_`
  todavía mandaba esas filas a `revisar`; hoy el seed ya dice `fuente`/`derivada`, o sea lo
  mismo, y la protección sólo servía para congelar la peor versión de las notas.
- **Prueba — predicción y resultado, las dos:**
  - **Simulación antes de tocar la planilla** (`aplicarInstalacion_(false)` por la API,
    verificado que con `aplicar=false` no escribe): exactamente **2 cambios**, los dos
    `origen: manual → seed`, ninguna línea de `notas`, cero en las demás migraciones.
  - **Corrida real desde el menú**, por el usuario:

    | corrida | resultado |
    |---|---|
    | Aplicar 1ª | `migraciones: 2` · `cambiadas: 2` (las dos notas que el seed por fin escribe) · **`protegidas (con diferencia): 8`** · `solo_en_hoja: 7` |
    | Aplicar 2ª | todo cero, `protegidas: 8`, `sin cambios: sí` — **idempotencia intacta** |
    | Estado | `SOLAPAS 84 filas [manual: 8, seed: 76]`, 0 discrepancias, 0 migraciones pendientes |

    El `manual: 8` de "Estado" es el control positivo desde el otro lado: quedan
    **exactamente** las ocho decisiones humanas de `rdv`.
- **Pendientes/decisiones:**
  - **P1 nuevo · `auditarFormulasResumenesLooker_` tiene la inferencia invertida.**
    Verificado corriéndolo: devuelve `fuente: 'resumen_metricas'`, al revés de `S-01`.
    Clasifica "tiene fórmula → derivada" sin mirar que la fórmula es un `QUERY()` sobre una
    **tercera** hoja — la prueba misma de que `_dinamico` es la fuente viva. Es la lección
    de `CLAUDE.md` §4 en vivo. **Se anotó, no se arregló.** Mitigación: los dos ítems
    fuera del menú. Falta un estado `ambas_independientes` para cuando la fórmula apunta a
    una hoja que no es la otra del par.
  - Con el menú de por medio, un click revertía `S-01` sobre `MAPEO`, `SOLAPAS` y `BASES`,
    bajo un texto de confirmación que sonaba autorizado. Eso es lo que se cerró.
  - `promoverFechasElegidas()` sigue siendo escritor de `MAPEO` sin declarar — es el P1
    original de `C.2-7` y no era de este paso.

## Paso 2.12 Partes 3 y 2 — disposición de las solapas: cero filas en `revisar` (2026-08-02) — commits `f3fbc33` + el de esta entrada
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.12_Parte2_disposicion_solapas.md`, escrito
  el 02/08 y que **reemplaza** la Parte 2 del `Paso-2.12_conteos_y_clasificacion.md`
  original. Cerrar `SOLAPAS.uso`: Grupo A (filas en `revisar`, `origen=seed`) y Grupo B
  (protegidas de `rdv`, alinear el seed sin tocar `origen`).
- **El orden de las partes se invirtió, y no en silencio.** Al ejecutar apareció que
  `reclasificarSolapasM2Invertidas_` fuerza `m2/M2 Directa` y `m2/M2 digital` a
  `uso='revisar'` en cada corrida, y las migraciones corren **antes** del sembrador de
  `SOLAPAS`. Sembrar `ignorar` con esa migración cableada daba 4 líneas de `migracion` + 2
  de `cambio` en cada corrida, para siempre — el patrón de `corregirNotaControlAnclaje_`, y
  rompe el criterio 3 del propio prompt. Se paró, se reportó, y el usuario eligió correr la
  **Parte 3 primero**. Anotado en el prompt con el porqué.
  - **El razonamiento ya estaba hecho y aplicado a la mitad del caso:** el comentario de
    `Instalar.gs` (Paso 2.10 Parte C) explica que `M2 periodo DIRECTA`/`DIGITAL` salieron de
    `SOLAPAS_M2_INVERTIDAS_` porque *"si siguieran acá, esta función las volvería a
    `revisar` en cada instalación y pisaría esa clasificación"*. El par que quedó en la
    lista tenía el mismo problema, latente hasta que la Parte 2 le diera clasificación.
- **Qué se hizo:**
  - **Parte 3** — `reclasificarSolapasM2Invertidas_` sale de `aplicarInstalacion_`, de la
    lista de `migraciones` y del resumen: una migración que ya no corre no puede seguir
    figurando entre las activas aunque reporte cero. **No se borró**, ni ella ni
    `SOLAPAS_M2_INVERTIDAS_`/`NOTA_M2_INVERTIDA_`, que quedan marcadas sin uso. Verificado
    con el grafo: no la llama nadie.
  - **Parte 2, Grupo A (15)** — `digital/Cuentas` y `digital/CAMPAÑAS_DESGLOCE_DIGITAL` a
    `fuente`; `digital/EDV` y `looker/Audiencias` a `referencia`; las once restantes a
    `ignorar`. `m2/M2 Directa` y `M2 digital` con su **condición de reversión escrita**: se
    ignoran porque `m2` quedó `sin_fuente`, no porque no sirvan.
  - **Parte 2, Grupo B (8)** — sólo `uso`; `origen` no se tocó.
- **La corrección dentro de la ejecución:** el Grupo B iba a llevar notas nuevas y mejores.
  Verificado antes de aplicar: el diff compara también `notas`, y como son `origen=manual`
  el sembrador no puede escribirlas — habrían quedado **ocho `protegida (habría cambiado)`
  sobre `notas` en cada corrida**, el mismo piso permanente que la Parte E acababa de sacar
  del lado de `looker`. Las notas quedaron textualmente iguales. Que digan "sin decidir"
  sobre filas decididas es un P2 nuevo en `PENDIENTES`, con las dos formas de cerrarlo.
- **Prueba (simulación previa, contra la planilla real):** se tomó un snapshot fresco de
  `SOLAPAS` del 02/08 —el del 01/08 es anterior a la Parte E y habría dado dos falsos
  positivos— y se evaluó `SEED_SOLAPAS_` contra él: **15 filas en `revisar` → `cambiadas:
  15`, `protegidas (con diferencia): 0`, `protegidas (sin diferencia): 8`.** El seed quedó
  con **cero filas en `revisar`** (84 filas: 18 `fuente`, 16 `referencia`, 12 `derivada`,
  38 `ignorar`). `clasp push` hecho. **Falta la corrida real desde el menú.**
- **Pendientes/decisiones:**
  - **P2 nuevo** · las notas de las ocho protegidas de `rdv` dicen "sin decidir" sobre filas
    decididas. Se cierra editando las ocho a mano en la planilla, o devolviéndolas al
    sembrador como se hizo con las dos de `looker` — la segunda cierra el caso de verdad,
    pero es una decisión sobre ocho filas curadas a mano.
  - `H-4` sigue abierto y **no era de este paso**: `m2/Cuentas` pasó a `ignorar` y las cinco
    filas de `MAPEO` que la mapean quedan huérfanas. Mapear una solapa que se ignora es una
    inconsistencia distinta de clasificarla.

## Paso 2.12 — cierre: la corrida real (2026-08-02) — commit de esta entrada
- **Qué faltaba:** la entrada anterior (`f3fbc33` + `b15ec09`) cerró el código con la
  simulación hecha y decía *"falta la corrida real desde el menú"*. Esto es esa corrida.
- **Prueba — "Aplicar configuración" ×2, corrida por el usuario:**

  | corrida | resultado |
  |---|---|
  | 1ª | `cambiadas: 30` · `agregadas: 0` · `migraciones: 0` · `solo_en_hoja: 7` · **`protegidas (con diferencia): 0`** · `protegidas (sin diferencia): 8` · `sin cambios: no` |
  | 2ª | todo en cero · `protegidas (con diferencia): 0` · `protegidas (sin diferencia): 8` · `sin cambios: sí` |

  **`protegidas (con diferencia): 0` — el diff quedó sin ruido por primera vez.** El piso
  que arrastraba desde el Paso 2.11 C.2 (diez líneas, después ocho) llegó a cero: no queda
  ninguna fila donde el seed quiera algo distinto de lo que hay en la planilla.
- **Criterio 1 verificado aparte, con evidencia y no por inferencia:** snapshot fresco de
  `SOLAPAS` después de aplicar → **84 filas, cero en `uso=revisar`** (18 `fuente`, 16
  `referencia`, 12 `derivada`, 38 `ignorar`), `origen=manual` en 8. Confirmado además que
  el seed escribió las notas del Grupo A (`digital||Cuentas` y `m2||M2 Directa` con su
  texto nuevo).
- **La predicción y la medición no estaban en la misma unidad.** Se predijo `cambiadas: 15`
  y dio **30**: las mismas 15 filas × 2 columnas (`uso` + `notas`). El resultado es el
  esperado —no hubo desviación— pero **la predicción contaba filas y el diff cuenta
  celdas**, y dos números en unidades distintas no se pueden comparar, que es justamente
  para lo que sirve predecir. Anotado como nota de método 3 en `docs/PLAN.md`.
- **Pendientes/decisiones:**
  - **El P2 de las notas de `rdv` ganó su causa raíz, y es más de fondo que las notas.** En
    las 15 del Grupo A el seed pisó las notas viejas sin resistencia, porque son
    `origen=seed`; las ocho que quedan mal son sólo las de `rdv` y sólo por ser
    `origen=manual`. O sea que **`origen` hace dos trabajos a la vez**: *"lo decidió una
    persona"* (procedencia) y *"el sembrador no lo toca"* (protección). Mientras sean la
    misma columna, marcar la procedencia obliga a congelar la fila entera y hay que elegir
    entre nota correcta y protección. Es la raíz común de este P2 y del piso de `looker`
    que cerró la Parte E. Separar los dos trabajos es un paso propio.
  - `H-4` sigue abierto: `m2/Cuentas` quedó `ignorar` y las cinco filas de `MAPEO` que la
    mapean están huérfanas. No era de este paso.

---

## Doc — `D-15` y `D-16`: autenticación del panel y acceso por usuario (2026-08-02) — commits `11f2667` + el de esta entrada

- **Qué se agregó a `docs/PLAN.md` §1.** Dos decisiones nuevas, las primeras del bloque de
  panel desde `D-04`:
  - **`D-15` — el panel se despliega como "ejecuta el usuario que accede".** La web app de
    `D-04` va con esa opción y acceso a cualquiera con cuenta de Google: Google exige login
    antes de que corra el código, así que `Session.getActiveUser().getEmail()` devuelve
    identidad confiable y se filtra contra lista blanca. De las tres opciones evaluadas es
    la única que **combina identidad con lista blanca** — con *ejecutar como: yo* sobre
    cuentas Gmail personales `getActiveUser()` suele volver vacío y el filtro deja de
    servir. **Acoplada a `D-02`**, no independiente: si alguna vez se pasara a *ejecutar
    como: yo*, las bases dejarían de necesitar compartirse y `D-02` cambiaría de sentido.
  - **`D-16` — cada usuario accede sólo a sus informes y a sus datos.** El permiso es por
    informe, no por URL: una sola app que arma la selección según quién entró; URLs
    distintas por grupo serían apps que divergen. Tres piezas — (1) la lista de accesos
    sale de una hoja y no del código (hoy `API_AUTORIZADOS_` está cableada en `Api.gs:29`,
    lo contrario de `D-01`); (2) el panel filtra qué informes ofrece; (3) **sin resolver**,
    el acceso al **dato** y no al panel.
- **La pieza 3 es el trabajo real y quedó nombrada como tal.** Filtrar la selección del
  panel no alcanza: un deck generado es un archivo de Drive con permisos propios y las
  bases son planillas con los suyos, así que si el usuario abre el deck directo —o si el
  motor corre con su identidad (`D-15`) y necesita leer una base que él no debería ver— el
  control del panel no interviene. Va a `§3` como bloqueada, destrabada por el diseño
  end-to-end y con el panel construido (`D-04`) como precondición para probar contra algo
  real. **No hay solución elegida: es trabajo de diseño, no de implementación.**
- **La precondición de `D-15` subió a `§2` Tramo 4 como primer ítem**, con el resto del
  tramo dependiendo de ella: verificar qué devuelve `getActiveUser()` con el despliegue
  real, entrando desde `reporteseinformesgcba`; si vuelve vacío, `D-15` se revisa antes de
  escribir código del panel. En la decisión quedó el **puntero**, no la instrucción — una
  precondición escondida adentro de la decisión que la motiva no se ejecuta.
- **Nota de método 4 nueva, y el disparador fue una colisión real.** La nota del 02/08 bajo
  `D-02` cerraba con *"sería un `D-15` que cite a ésta"*, nombrando un ID futuro
  hipotético. **`D-15` se asignó esa misma tarde**, a la autenticación del panel, que no
  supersede a `D-02` sino que la cita: el número no estuvo libre ni un día. Se le sacó el
  número a la nota (*"haría falta una decisión nueva que cite a ésta"*) con addendum
  fechado que deja constancia de qué decía antes, y la regla quedó como **nota de método
  4** en el encabezado del plan. Cubre el hueco entre las otras dos: la nota 2 cubre
  **citar** un ID existente y `§1` cubre **asignar** uno nuevo; ninguna cubría
  **anunciar** uno.
- **Colisión de numeración al escribir, resuelta en el momento.** Entre el commit `11f2667`
  y esta entrada, otra sesión agregó al encabezado su propia *"nota 3"* (la de unidades de
  predicción, del cierre del Paso 2.12). Quedaron **dos notas numeradas 3**: la de
  predicción conserva el 3 —es la que ya está citada así desde la bitácora del 2.12— y la
  de IDs futuros pasó a **4**, con su referencia cruzada bajo `D-02` corregida. El mismo
  repo editado desde dos herramientas que no se ven entre sí, que es el riesgo de
  `CLAUDE.md` §1, esta vez sobre numeración de notas en vez de nombres de función.
- **Pendientes/decisiones:**
  - `D-16` pieza 3 abierta y sin solución elegida (`§3`).
  - `API_AUTORIZADOS_` sigue cableada en `Api.gs:29`. Migrarla a hoja es parte de `D-16`
    pieza 1, no de este commit: acá no se tocó código.

## MENÚ declarado por tabla (2026-08-01) — commit `9fd16c6` · **entrada retroactiva, escrita el 02/08/2026**
> ⚠ **Reconstruida desde el código y el commit, no desde la memoria de la corrida.** El paso
> se ejecutó el 01/08 y **no dejó entrada**: lo encontró el censo del `DOC-7`. La fecha del
> título es la real del commit; la de escritura de esta entrada es el 02/08. No se falsea
> ninguna de las dos.
>
> Se escapó del cruce habitual porque **no tiene número de paso** —se declara "paso no
> funcional, sin número"— y la bitácora se cruza por designador. Es el hueco que el censo
> encontró y la razón de la nueva regla de `CLAUDE.md` §3.
- **Qué pedía el prompt:** `docs/Prompts/MENU_declarado_por_tabla.md`. Dos problemas: cada
  paso agregaba su ítem y ninguno se sacaba nunca aunque el caso se cerrara, y el número de
  paso viajaba en la etiqueta (`(Paso 2.9E)`, `(Parte D)`, `(AUD-1)`), así que a las seis
  semanas nadie iba a saber cuáles seguían sirviendo.
- **Qué se hizo** (verificado contra `Codigo.gs` y el diff de `9fd16c6`, 174 líneas):
  - `MENU_` pasa a ser una **tabla declarativa** y `construirMenu_()` la recorre. Agregar un
    ítem es agregar una fila; `onOpen()` no se toca más.
  - **La etiqueta dice qué hace el ítem.** El paso que lo creó vive en el encabezado de la
    función, no en la etiqueta — una sola fuente de verdad. Única excepción declarada: el
    submenú `Archivo (casos cerrados)`, donde el paso **es** la identidad del caso.
  - Reagrupado en seis submenús (`Configuración`, `Datos y decisiones`, `Diagnóstico`,
    `Plantillas`, más `Avanzado` y `Archivo` anidados).
  - **Un diagnóstico de un caso cerrado se mueve a `Archivo`, no se borra.**
  - `onOpen()` no puede tirar excepción: si `MENU_` queda mal, cae a un menú mínimo
    degradado y deja el error en el log. Un `onOpen()` que falla deja la planilla sin menú.
- **Prueba:** no consta cuál se corrió. Lo verificable hoy: `tools/inventario.js` lee la
  tabla y reporta **34 ítems, ninguno apuntando a una función inexistente**, y el menú
  degradado existe en el código. La verificación original del prompt no quedó registrada —
  es la consecuencia de no haber escrito la entrada en su momento.
- **Pendientes/decisiones:** este paso es el que dejó **cumplidas las tareas 1, 2 y 3 de la
  Parte D del `Paso-2.11`**, que por eso se archivó el 02/08 (`DOC-7`). Su tarea 3 se
  resolvió mejor que como estaba pedida: en vez de retirar los diagnósticos de casos
  cerrados, se conservan en `Archivo` declarando su intención.

## Paso 2.14 ✅ — generalizar `hayUi_()`: el protocolo entero corre por API (2026-08-02) — commits `bfb8679` + el de esta entrada
- **Qué pedía el prompt:** `docs/Prompts/Paso-2.14_generalizar_hayUi.md`. Que `Estado` y
  `Aplicar` corran por HTTP sin que nadie abra la planilla. Parte A de inventario con parada
  obligatoria, Parte B recién con la decisión sobre los casos (b).
- **Parte A — el inventario corrigió dos cosas antes de empezar:**
  - **Son 38 sitios ejecutables, no 40.** Las 40 del `INVENTARIO_CODIGO.md` se contaron con
    `grep -o`, que incluye comentarios: dos eran texto explicando que `getUi()` rompe sobre
    HTTP. Ya estaba mal el 01/08, no lo cambió este paso.
  - **Los casos (b) son dos, y uno estaba muerto.** El prompt temía *"un `confirm` que se
    auto-responde «sí» convierte una guarda en nada"*. El único (b) vivo
    —`menuCargarTemarioReuniones_`— **no es una guarda: es el insumo**. El otro
    (`menuConsolidarMapeoLooker_`) ya estaba fuera del menú desde la Parte E. La
    preocupación era razonable y no se cumplió; queda el caso, no la predicción.
- **Qué se hizo:**
  - **`ui_()` (`Codigo.gs`)** — sustituto que delega en la UI real cuando la hay y **anota
    siempre** en `UI_DICHO_`. Se eligió sobre tocar los 61 `ui.alert(...)`: las 31 funciones
    cambiaron **una línea cada una**, con planilla no cambia nada de lo que ve una persona,
    y **los 40 `return;` tempranos no pierden su mensaje** porque el texto viaja por el
    buffer y no por el retorno. `Api.gs` lo vacía antes de cada llamada y lo devuelve en
    `dicho`, mismo criterio que la `traza`.
  - **Las dos degradaciones, escritas como decisiones:** `alert` sin UI devuelve `null`, así
    que un `alert(…, YES_NO)` usado como confirmación falla la comparación contra
    `ui.Button.YES` y el llamador corta — **un confirm degrada a *no confirmado*, nunca a
    "sí"**. `prompt` sin UI **tira**: no hay a quién preguntarle y no se inventa.
  - **(b)** — `cargarTemario(texto)` hace el trabajo y es invocable por API; si falta el
    texto **falla explícito**. El envoltorio de menú lo consigue con el `prompt` y delega.
  - **`hayUi_`** conserva su forma, con el encabezado que le faltaba: es el **único lugar del
    repo donde `getUi()` puede tirar a propósito**, y si aparece otro `try { getUi() }` suelto
    esa garantía se pierde.
  - **`onOpen`** queda con la UI real. El reemplazo masivo lo tocó y se revirtió: necesita
    `createMenu`, que el sustituto **no expone a propósito** — un menú sin planilla no
    significa nada. Es la categoría (c), no aplica.
  - **`probarConexionBases`** pasó de su guarda a mano (Paso 1.8) a `ui_()`. El retorno no
    cambió: sigue siendo el resumen pelado, que es lo que verifica la prueba nº 3 del 1.8.
- **Prueba — los cinco controles del prompt:**
  1. Controles positivos por HTTP: **4 de 5**. El que falla se explica abajo y **no lo causó
     este paso**.
  2. **Estado y Aplicar por API devuelven lo mismo que el menú, carácter por carácter.**
     Estado por API: `SOLAPAS 84 [manual: 8, seed: 76]`, 0 discrepancias, 0 migraciones
     pendientes. Aplicar por API: `cambiadas: 0 · agregadas: 0 · migraciones: 0 ·
     solo_en_hoja: 7 · protegidas (con diferencia): 0 · protegidas (sin diferencia): 8 ·
     sin cambios: sí`.
  3. Aplicar ×2 por API: **idénticas**.
  4. **Los dos desde el menú, con planilla** (usuario, 15:36 / 15:38 / 15:40): idénticos a
     los de la API. `Cargar temario de reuniones` abre su `prompt` normalmente. **Generalizar
     `hayUi_()` no rompió el camino con UI**, que es lo que este control tenía que descartar.
  5. `git status` limpio salvo lo del paso.
- **Nota obligatoria de cierre:** `INVENTARIO_CODIGO.md` **no se rehizo**. Se le agregó la
  tabla de cifras vencidas: 40 `getUi()` → 3 (y las 40 ya venían infladas), 36 ítems de menú
  → 34, 235 funciones → 239, 8.410 líneas → 8.693. Lo que no envejeció —el grafo, la
  clasificación de las huérfanas, los seis trabajos de `Instalar.gs`— queda como está.
- **Pendientes/decisiones:**
  - **P1 nuevo · `probarMigracionesEnDiff_` está vencido y falló un día sin que nadie lo
    viera.** Es una **prueba vencida, no un bug**: la Parte E del 2.11 cambió
    `alinearSolapasLookerADinamico_` y la prueba sigue afirmando el contrato viejo. No se
    arregló acá: el 2.14 es sólo capa de UI.
  - **La regla que faltaba, ya escrita en `CLAUDE.md` §4:** *quien toca una función con
    control positivo corre los controles antes de cerrar*. En la Parte E cambié una función
    con control positivo, verifiqué contra la planilla —el número dio bien— y cerré sin
    re-correr los controles. El protocolo desde el menú **pasa igual aunque los cinco estén
    mal**, así que nada avisó.
  - **`docs/RUNBOOK.md`** — un Bearer vencido devuelve **HTML con HTTP 200** y se lee como
    motor roto. Pasó en este paso: un control figuró como error y era sólo el token. Anotado
    con el remedio (`node tools/token.js --forzar`) antes de diagnosticar nada.

## Paso 2.14 addendum — saldar la prueba vencida de `C.2-3` (2026-08-02) — commit de esta entrada
- **Qué faltaba:** el `P1` que abrió el 2.14. Se saldó **antes** de entrar al Tramo 1, porque
  ese tramo toca `Instalar.gs` y hasta acá el control de `C.2-3` no protegía nada.
- **Qué se hizo:**
  - **`Pruebas.gs` · `probarMigracionesEnDiff_`** actualizado al contrato que dejó el
    `Paso-2.11` Parte E. Casos 1 y 4: **2 celdas** (`uso`, `origen`) en vez de 3, con fixture
    `origen='auto'` para que las dos difieran. Caso 2: "alineada" ahora es `uso`+`origen`, con
    la nota que sea — se afirma explícitamente que **`notas` no puede aparecer**, que es lo
    que la Parte E le sacó. Caso 3 **suma una afirmación**: sobre una fila `manual` la
    migración la **devuelve al sembrador** (`origen: manual → seed`); es un cambio de
    comportamiento, no un detalle —le saca el blindaje a una fila que alguien pudo blindar a
    propósito— y por eso tiene que salir con `pisaManual` a la vista. Casos 5 y 6 no se
    tocaron: seguían válidos.
  - **El encabezado de la prueba declara qué cambió, con fecha, paso y evidencia.** Una
    prueba que se ajusta al código sin decir por qué deja de ser control.
  - **`docs/PENDIENTES_consistencia.md`** — el `P1` queda tachado, y el `P2` de
    `Paso-2.5`↔`Paso-3-v2` se reescribe (abajo).
- **Prueba:** `correrPruebasDiff_` por API, **5 de 5**. Es la regla de `CLAUDE.md` §4
  aplicada a su propio caso: quien toca una función con control positivo corre los controles
  antes de cerrar.
- **Pendientes/decisiones:**
  - **El `P2` de `Paso-2.5`↔`Paso-3-v2` se cerró y se reemplazó, no se agendó.** Sus dos
    puntos (`calculo` en vez de `operacion` y sin `valor_fijo`; el bloque repetible) ya
    estaban corregidos en el reemplazo del `Paso-2.5`, verificado contra el archivo. **No se
    delegó al cierre del 2.5**: una corrección delegada a un paso futuro ya se evaporó una vez
    (Reconciliación 1 del `Paso-2.4`) y es lo que dice `CLAUDE.md` §3.
  - **Lo que quedó vivo cambió de contraparte y subió a `P1`:** `Paso-2.5` y `Paso-2.13`
    proponen **dos dueños para `MARCADORES`** —sembrar desde las plantillas vs.
    `SEED_MARCADORES_` en código—, que es lo que `ESCRITORES.md` existe para evitar, esta vez
    visible **antes** de que ocurra. Bloquea a los dos y la decisión es del usuario.
  - **`/dev` devuelve 404 intermitente.** Medido: cuatro pedidos idénticos seguidos dieron
    **200, 404, 404, 200**, con la URL correcta y `@HEAD` sin cambios. Costó una
    investigación —se llegó a verificar la sintaxis de los 21 `.gs`, que parsean bien— antes
    de ver que era del lado de Google. Anotado en el `RUNBOOK` junto al caso del Bearer
    vencido, con el atajo para descartar el código en un segundo.

## D-17 — el dueño de `MARCADORES` es la plantilla (2026-08-02) — commit de esta entrada
- **Qué se decidió:** las filas de `MARCADORES` se siembran leyendo los `{{token}}` de las
  plantillas de Slides (`sembrarMarcadoresDesdePlantillas` + `upsertSoloVacias_`,
  `Paso-2.5`). **`SEED_MARCADORES_` no se hace.** Decisión del usuario.
- **La razón, que es `D-01` en su forma más directa:** con el seed en código, agregar un
  informe exige editar un `.gs` — el número que `D-01` mide y quiere bajar. La plantilla
  **ya es** la fuente de verdad de qué tokens existen: si un token no está en la lámina, no
  hay nada que reemplazar. Un seed sería una segunda copia de un dato que ya vive en otro
  lado. **El contraargumento fuerte del seed —idempotencia y diff auditable, que la C.2
  costó tres corridas de protocolo— queda cubierto sin él:** la idempotencia la da
  `upsertSoloVacias_`, que sólo completa celdas vacías y nunca pisa lo configurado a mano.
- **Qué se escribió:**
  - **`docs/PLAN.md` §1 — `D-17`**, citando `D-01` y el `P1` que cierra. Verificado antes de
    asignarlo que el número estuviera libre (`D-16` era el último, cero menciones de `D-17`
    en el repo) — la advertencia del propio §1 aplicada a sí misma.
  - **`docs/Prompts/Paso-2.13`** — la fila de su cuadro pasa a "sembrado desde las plantillas
    (`Paso-2.5`)", con nota fechada: la Parte 1 queda sin efecto, **el resto del prompt sigue
    vivo**. Se corrige **en el lugar** por no haber corrido nunca (`DOC-7`). Se deja anotado
    qué de esa Parte 1 sí sobrevive: el hallazgo `H-6` (tres filas contra 43 trazas) y la
    tarea de exportar la hoja a `docs/_snapshots/` antes de que nada la escriba — sigue
    siendo la primera tarea, sólo que ahora el escritor es el 2.5.
  - **`docs/Prompts/Paso-2.5` §0.3** — la tensión queda **resuelta, no borrada**: el planteo
    completo y los dos argumentos se conservan, con cuál ganó y por qué. Es lo que va a hacer
    falta si alguien la reabre, y el caso vale por sí mismo — fue la única vez que se vieron
    dos dueños para la misma hoja **antes** de que ocurriera, en vez de descubrirlos después
    con un censo.
  - **`docs/PENDIENTES_consistencia.md`** — el `P1` tachado, con puntero a `D-17`.
- **Prueba:** no hay código. Verificado que no queda ninguna referencia contradictoria: las
  siete menciones restantes a `SEED_MARCADORES_` son históricas (bitácora, prompts
  congelados) o son la decisión misma.
- **Pendientes/decisiones:** **`Paso-2.5` y `Paso-2.13` quedan desbloqueados**, los dos. El
  orden entre ellos no está decidido y no es de esta entrada.

## D-18 — los terceros acceden por el panel, nunca por la planilla de control (2026-08-02) — commit de esta entrada
- **Qué se decidió:** el motor es invisible para el usuario final. `reporteseinformesgcba`
  ejecuta y tiene las cuatro bases (`D-02`); cualquier otra persona entra **sólo** por la web
  app del panel (`D-15`). Lo que se comparte con terceros son **las salidas**: el deck en la
  carpeta de reportes (`D-03`), compartido según la hoja de accesos (`D-16`), sin acceso a
  ninguna base.
- **Razón:** la planilla de control **es** la superficie de configuración — compartirla da
  edición sobre `BASES`, `MAPEO`, `CONFIG` y el resto. Y no se le puede generar una planilla
  propia a cada usuario: el script está *bound* a esa planilla y una copia sería un **segundo
  script que diverge**.
- **Corolario:** no se copia código a mano a ninguna cuenta. Lo que el panel necesite va al
  script del motor —versionado con `clasp` y git— y se expone por la web app.
- **Dónde quedó la cuenta de prueba, y por qué no en `PLAN.md`:** en
  `docs/ENTORNO.local.md`, que es el dueño de "con qué cuenta" (`CLAUDE.md` §7) y **está
  fuera de git**. El repo es público y hay un `P0` abierto por datos personales en el
  historial; meter una dirección nueva en un archivo versionado lo habría agrandado. `D-18`
  la referencia sin nombrarla. Verificado con `git check-ignore` y con un grep sobre todo lo
  versionado: la dirección no aparece en ningún archivo que entre al repo.
- **Prueba:** ninguna todavía — `D-18` deja una **disponible antes del panel**: compartirle un
  deck de salida a la cuenta de prueba y confirmar que lo abre sin acceso a las bases. Es la
  mitad de `D-16` que no depende del panel, y se puede correr en cuanto el Paso 4 genere el
  primer deck.
- **Pendientes/decisiones:** verificado antes de asignar que `D-18` estuviera libre (`D-17`
  era el último, cero menciones en el repo) y que las cuatro decisiones que cita existan.

## Paso 2.15 ✅ — `carpeta_salida` a reportes y `periodo_id` en la curaduría (2026-08-02) — commits `aca39bf`, `555880c`, `c4797d8`, `4de320a`
- **Qué pedía el prompt:** dos ítems del Tramo 1 en una sola pasada, un commit por parte.
  Parte A: repuntar `CONFIG.carpeta_salida` a la carpeta de reportes (`D-03`). Parte B:
  columna `periodo_id` en `CAMPANAS` y `REUNIONES` como clave foránea a `PERIODOS` (`D-08`).
- **La Parte 0 devolvió cuatro hallazgos y ninguna premisa vencida.** Los esquemas vivos de
  las tres hojas coinciden con lo registrado (3 · 7 · 2 filas). Lo que no coincidía:
  `CAMPANAS` viva difiere de `SEED_CAMPANAS_EJEMPLO_` en `tipo` (dos de tres filas editadas
  a mano), invisible porque la hoja está `auditada: false`; ningún período de `PERIODOS`
  cubre la ventana activa de `CONFIG`; `cargarTemario` habría escrito `periodo_id` vacío en
  silencio, porque arma la fila mapeando encabezados; y la carpeta nueva verificada contra
  Drive. Se corrigió además el **motivo escrito** del punto 0.2: la rama con delta pushea
  condicionalmente y la sin delta siempre, así que aparecer en la lista de hojas
  actualizadas **sí** discrimina — la conclusión del addendum era correcta, su justificación
  no.
- **La Parte A cambió de alcance al ejecutarse.** No era repuntar un valor: una clave estaba
  haciendo de dos. `carpeta_salida` apuntaba a la carpeta **donde vive la planilla de
  control**, así que el primer deck del Paso 4 habría caído al lado del motor, en el Drive de
  `jpcofanogcba1`. Se repuntó a `Salidas Reportes` (de `reporteseinformesgcba`,
  `canAddChildren` verificado) y el ID viejo entró como clave nueva `carpeta_motor`, **sin
  lector**, para que no se pierda y para que quede dicho que son dos carpetas distintas.
  `diagnosticoDrive()` dejó de hardcodear el ID de plantillas y lo lee de `CONFIG`.
- **Qué se hizo en la Parte B:** `periodo_id` primera columna de las dos hojas. `REUNIONES`
  entró a `COLUMNAS_DELTA_` **antes** de que su `headers` ganara la columna —sin eso, la rama
  sin delta reescribe la fila 1 sin mover los datos, sobre siete filas curadas a mano—, y la
  entrada de `CAMPANAS` va **al final** de su array porque las entradas se evalúan en orden.
  `cargarTemario(texto, periodoId)` exige el período, lo valida contra `PERIODOS` y **falla
  explícito**; el ítem de menú lo pide **antes** del texto, para que cancelar no tire un
  temario ya pegado. Las diez filas existentes quedaron con `periodo_id` vacío (`D-19`).
- **Medición de `.gs`: +74 / −19, en dos archivos** (`Instalar.gs` +28/−13, `Reuniones.gs`
  +46/−6). Buena parte de `Instalar.gs` son los comentarios que explican el orden de las dos
  operaciones. No es una medición de `D-01` —eso es del `Paso-2.16`—, pero queda anotada.
- **Prueba:** `Aplicar configuración` ×2 en las dos partes, por API. Parte A: primera corrida
  `cambiadas 1 · agregadas 1`, exactamente la predicción (3 celdas: la fila nueva más el
  valor); segunda `sin cambios: sí`, `CONFIG` en 7 filas y 0 sin completar. Parte B: el diff
  **no se movió** en ninguna de las dos (`0 · 0 · 0 · solo_en_hoja 7 · protegidas 0/8`), y
  `REUNIONES` **desapareció** de "hojas verificadas/reparadas" en la segunda corrida — el
  efecto que la Parte 0 había predicho al meterla en el delta. Las hojas quedaron en 3 y 7
  filas con los valores intactos. Los cinco controles de `Pruebas.gs`, 5 de 5, en las dos
  partes. `cargarTemario` probado en sus **dos caminos de falla** (sin período y con uno
  inexistente): las dos lanzan antes de escribir y `REUNIONES` siguió en 7 filas.
- **Pendientes/decisiones:**
  - **`D-19` nuevo:** una fila sin `periodo_id` no entra a ningún informe. El vacío significa
    "sin período asignado", no "el vigente". La razón es `R-11` Addendum 1: como las ventanas
    pueden solaparse o dejar hueco, **la fecha de una fila no determina su período**.
  - **`R-11` y su Addendum 1** (fuera del alcance del prompt, pedidos aparte): la semana del
    informe son siete días, viernes a jueves; lo cargado a mano manda sobre el default.
  - **Cinco entradas nuevas en `PENDIENTES`**, dos de ellas `P1` y una `P0`: el diff es ciego
    a los **valores** de `CONFIG`; `upsertPorClave_` reescribe la fila entera y borraría una
    columna que el seed no conozca; `SEED_CAMPANAS_EJEMPLO_` ya no describe lo que hay; dos
    carpetas de Drive homónimas; y el `P0` de **direccionabilidad** — 14 IDs de recursos
    internos en un repo público, con la decisión del usuario de dejarlo público por ahora y
    revisarlo al llegar a producción o a una versión de prueba.
  - **Documentación nueva con dueño declarado:** la tabla "Las carpetas de Drive" en el
    `RUNBOOK`, con su fila propia en `CLAUDE.md` §7, y la frontera de `ENTORNO.local.md`
    dicha explícita — credenciales y URLs de acceso, no identificadores que ya viven en un
    seed versionado.

## Paso 2.16 ✅ — el filtro declarativo, y `m2` que no había que activar (2026-08-02/03) — commits `9dda191` + el de esta entrada
- **Qué pedía el prompt:** "registrar M2" con tres cambios —`modo_periodo` a `filtrar`,
  una fila `fecha_periodo`, y excluir `Estado = Proyectado`—, como primera medición de
  `D-01` por el eje "base nueva".
- **La Parte A tiró abajo dos de los tres, y el prompt estaba diseñado para eso.** Su A.3
  preguntaba cuál es la fuente, porque el ítem del plan mandaba mapear contra
  `m2/Directa mail`, que el Paso 2.10 Parte C declaró **derivada**. Se verificó contra el
  dato crudo y no contra la etiqueta: las dos solapas tienen el **mismo
  `firma_encabezado` carácter por carácter**, **2114 filas cada una** y la misma
  distribución de `Estado`. Son el mismo contenido. **Decisión del usuario: la fuente es
  `digital/Directa Mail`.** `buscarMapeo` la habría rechazado igual — exige `uso = fuente`.
- **Qué quedó de los tres cambios:** **(a)** descartado — `filtrar` sin `fecha_periodo` en
  ninguna solapa de `m2` habría convertido toda lectura en `«FALTA:fecha_periodo»`, latente
  porque nada lee `m2`. **(b)** ya existía: `digital/Directa Mail.fecha_periodo` = F,
  promovida en el Paso 2.3.x. **(c)** todo el paso.
- **`m2` no aporta nada que `digital` no tenga.** Sus 19 filas de `MAPEO` están duplicadas
  campo por campo; catorce apuntan a vistas `referencia` con período tipeado a mano y cinco
  a una solapa `ignorar`. **Ninguna apunta a una solapa `fuente`**, y la única que `m2`
  tiene declarada (`Cuentas M2`, 354 filas) no está mapeada. Queda abierto y fuera del
  tramo.
- **Qué se hizo:** `MAPEO.valores_incluidos` (columna nueva vía `COLUMNAS_DELTA_`, entrada
  al final del array por la lección del 2.15), el filtro y sus conteos en `Fuentes.gs`,
  `normalizarValorDeclarado_`, el control positivo `probarListaBlancaValores_`, y la fila
  `digital/Directa Mail/mail_estado` con `Implementado, En curso`. **Lista blanca y no
  exclusión** (`D-21`): con "todo lo que no sea Proyectado", un estado nuevo entraría solo
  y en silencio.
- **Tres decisiones de diseño que no se resolvieron en el código:** el filtro se aplica
  **antes** de bifurcar por modo (la primera base que lo usa es `snapshot`); **no toca
  `filasDatos`**, para no romper el invariante del Paso 2.9 Parte B —se usa un vector de
  inclusión paralelo, así los índices siguen alineados con `filasCrudasDisplay`—; y **no se
  escribió un cuarto normalizador a ciegas**: se compararon los tres que ya existen, se
  escribió por qué ninguno servía, y el nuevo implementa **exactamente la forma que `R-10`
  ya declara** y que sigue pendiente para encabezados.
- **Medición de `D-01`: +253 / −5 líneas en cuatro archivos** (`Fuentes.gs` +170,
  `Pruebas.gs` +56, `Instalar.gs` +25, `Config.gs` +2). El renglón de "por qué hubo que
  tocar código" es uno solo y es reusable: **el motor no tenía forma declarativa de excluir
  filas por valor**. El único filtro que existía (`status = Realizada`) está hardcodeado en
  `Union.gs`, con el valor guardado en una `notas` que ningún código lee.
- **Prueba:** por API. `digital/Directa Mail` pasa de **2114 a 2073** filas, con **41
  excluidas** (`Proyectado` 30, vacío 11), cero valores declarados sin filas y sólo
  `Implementado` y `En curso` en el resultado; `filas_totales` sigue en 2114, o sea que el
  invariante de `filasDatos` se sostuvo. `Aplicar configuración` ×2: `cambiadas 2 ·
  agregadas 0` y después `sin cambios: sí`, con `protegidas (con diferencia): 0`. Los
  **6 controles** de `Pruebas.gs`, incluido el nuevo, pasan.
- **Pendientes/decisiones:**
  - **`D-21` nuevo**, con el tercer significado del vacío escrito al lado de los otros dos
    (`D-19`: la fila no entra; `D-20`: usa el default) para que nadie los unifique.
  - **`rdv/status` quedó SIN declarar, contra lo planeado.** Al verificar apareció que con
    este diseño **declarar es conectar**: `leerFuente` aplica toda lista blanca declarada,
    así que cargar `Realizada` cambiaría en el acto lo que ve *cualquier* lectura de `rdv`,
    no sólo el matcher. Es decisión del usuario y está en `HANDOFF_CODE.md`.
  - **Dos hallazgos preexistentes a `PENDIENTES`**: `m2/Cuentas` está en `ignorar` y sin
    embargo la mapea `MAPEO` y la audita `SOLAPAS_A_DESCRIBIR_AUD1_`, contra el invariante
    de `CLAUDE.md` §2; y la columna U de `Directa Mail` tiene `#REF!` como encabezado.
  - **La advertencia del año `20206` no se reproduce**: 2079 filas con fecha, todas de
    2026. Va a "Preguntas al equipo" porque desde el motor no se puede saber si la
    corrigieron, si borraron la fila o si el envío se recargó. La lista blanca además deja
    el universo con fecha completa: de las 2073 que entran, **cero sin fecha**.
  - **El `/dev` alternó 404 y página de login durante la verificación**, con el token
    válido y los 21 `.gs` parseando bien. Costó varios reintentos y **se perdió el reporte
    de la primera corrida de `Aplicar`** —la llamada se ejecutó pero la respuesta no
    volvió—; el estado final se verificó leyendo la hoja.

## Doc — los prompts del Tramo 2 reemplazados: `Paso-3-v3` y `Paso-5-v2` (2026-08-03) — commit de esta entrada
- **Qué pedía:** entregar al repo las dos versiones nuevas que escribió claude.ai a partir de
  la auditoría de premisas del 03/08 —los dos prompts que esa auditoría marcó como "hay que
  reescribirlo"—, archivar los superados y actualizar el censo y las referencias del plan.
  **No se ejecutó ninguno de los dos.**
- **Qué se hizo:**
  - **`docs/Prompts/Paso-3-v3.md`** (nuevo). Resuelve la ventana en los **cinco eslabones**
    de `D-20` Addendum 1 —campaña > marcador > `SECCIONES.periodo_ref` > `CONFIG` > la
    semana de `R-11`— en vez de las tres capas del `v2`. Suma la columna de período en `SECCIONES`
    (que entra a `COLUMNAS_DELTA_` **antes**, por lo que midió el `Paso-2.15` 0.2), el
    cálculo del default de `R-11`, y los **tres significados distintos del vacío** escritos
    juntos para que nadie los unifique (`D-19` la fila no entra, `D-20` usa el eslabón
    siguiente, `D-21` sin filtro). Su Parte 0 verifica siete premisas y para.
  - **`docs/Prompts/Paso-5-v2.md`** (nuevo). Agrega `periodo_id` no vacío al filtro de
    `CAMPANAS` (`D-19`) y obliga a **reportar las excluidas con su motivo** — una campaña
    tildada que no sale en silencio es el modo de falla más caro del paso. Su `0.2` para si
    las tres filas siguen sin `periodo_id`: curarlas es del usuario.
  - **Archivados en `docs/Prompts/_archivo/`:** `Paso-3-v2.md` y `Paso-5.md`.
  - **`docs/PLAN.md` §2** — el ítem del Tramo 2 nombra los tres prompts vigentes, anota el
    bloqueo de `INFORMES.plantilla_id` y **deja escrito qué del Tramo 2 no está en el
    `Paso-3-v3`** (ver abajo).
  - **`docs/HANDOFF_CODE.md`** — las dos filas del censo pasan de "hay que reescribirlo" a
    "reescrito 03/08" con el archivo que las reemplaza; "Trabado" queda con una sola cosa
    del usuario para arrancar el Tramo 2.
  - **`docs/PENDIENTES_consistencia.md`** — la "Nota sobre `Paso-3-v2.md`" se cierra **por
    reemplazo**: el `v3` no tiene bloque "Antes de empezar", así que la Reconciliación 1 del
    `Paso-2.4` se queda sin objeto.
- **Prueba:** ninguna, no se tocó código. Verificado que los dos archivos nuevos están en
  `docs/Prompts/`, que los dos superados están en `_archivo/`, y que ningún documento vivo
  apunta a `docs/Prompts/Paso-5.md` como ruta vigente.
- **Pendientes/decisiones:**
  - **`Paso-3.md` no se archivó porque ya estaba archivado.** El `v3` pide archivar "los
    dos"; el original vive en `Plan Inicial/_archivo/Prompts/Paso-3.md` desde el commit
    `a0dab72`. Cero ediciones, y se registra el cero (`CLAUDE.md` §3).
  - **El `Paso-3-v3` no cubre cuatro cosas que `PLAN.md` §2 le asignaba al Paso 3:** `R-12`,
    los dos valores de ventana a `CONFIG`, el empate técnico del match
    (`DISENO_match_temario.md` §6.4) y la migración del filtro `status = Realizada` de
    `Union.gs` a `MAPEO.valores_incluidos` (`D-21`). **No se editó el prompt**: la lista del
    plan es la dueña de "qué sigue y en qué orden", y ahí quedó anotado. Salen como paso
    aparte o como addendum al ejecutarlo.
  - **`Paso-4.md` sigue siendo el único addendum pendiente** del tramo: le falta absorber la
    impresión del período en la lámina, `D-19`/`D-20`, y la firma de `generarInforme`, que
    no coincide con la del Paso 5.

## Doc — Addendum 1 al `Paso-4` y corrección de alcance del `Paso-3-v3` (2026-08-03) — commit `a5262bb`
- **Qué pedía:** anexar al final de `docs/Prompts/Paso-4.md` el Addendum 1 entregado por
  claude.ai, sin alterar el texto original, y corregir el destino de los cuatro ítems que la
  entrada anterior de esta bitácora dejó anotados como "no cubiertos por el `Paso-3-v3`".
- **Qué se hizo:**
  - **`docs/Prompts/Paso-4.md`** — Addendum 1 al final, cinco puntos: `periodo_id` pasa a
    **parámetro opcional** de `generarInforme` (manda la cadena de `D-20`, y un override
    tiene que decirlo en la traza), **imprimir el período en la lámina** con los dos extremos
    inclusive y el que efectivamente se usó —no el de `CONFIG`—, `D-19` en el reemplazo de
    tokens fijos, la carpeta de salidas y la propiedad del deck generado, y qué NO cubre.
    Con eso los tres prompts del Tramo 2 quedan alineados: se cierra el choque de firma con
    el `Paso-5-v2`.
  - **`docs/Prompts/Paso-3-v3.md`** — nota al pie fechada, sin tocar el texto de arriba.
  - **`docs/PLAN.md` §2** — la línea de los cuatro ítems queda, corregida con su destino:
    `R-12`, los dos valores de ventana a `CONFIG` y el empate técnico del match son del
    **matcher** (`Union.gs`) y van en un **paso propio todavía sin escribir**; `D-21` es
    **configuración suelta**. El hecho era cierto —el `v3` no los cubre— y la inferencia de
    que le faltaban al Paso 3, no.
  - **`docs/PLAN.md` §1** — nota fechada bajo `D-01`: no tocar código al agregar un informe o
    una base es **deseable, no requisito**; no bloquea un paso ni obliga a rediseñar. El
    texto de `D-01` decía *"no es criterio de aceptación **hoy**"*, que dejaba abierto que
    algún día sí. No lo va a ser.
  - **`docs/PLAN.md` §3** — fila nueva para `m2` en `MAPEO`: la decisión **se mueve al
    `Paso-2.5`**, y el criterio queda fijado — `Cuentas M2` es un **catálogo de cuentas**, no
    una fuente de métricas; se mapea sólo si algún token de las plantillas pide esos
    atributos. Las métricas de M2 salen de `digital`.
- **Prueba:** ninguna, no se tocó código.
- **Pendientes/decisiones:** las cuatro respuestas del usuario del 03/08 entraron acá (las
  dos de `PLAN.md`) y en la entrada siguiente (plantillas y acceso de las bases).

## Config + código — los dos `INFORMES.plantilla_id`, y lo que apareció al cargarlos (2026-08-03) — commit `95d048b`
- **Qué pedía:** cargar `INFORMES.plantilla_id` para `jm` y `secco` verificando contra la
  carpeta de plantillas cuál es cuál y que sean Google Slides nativas; confirmar que la
  declaración de `Armonizar.gs` (`117I0qn1…` canónica, `1JrHvs_p…` obsoleta) siga siendo
  cierta; y sacar esos dos IDs del `.gs` a `INFORMES`, que es su lugar.
- **Qué se hizo:**
  - **Verificación contra Drive.** Las dos son `application/vnd.google-apps.presentation`
    (nativas, no `.pptx`), dueño `reporteseinformesgcba`. `JM_marcada` = `117I0qn1…`, 22
    slides, 158 tokens distintos. `SECCO_marcada` = `1_ZKjWhL…`, 29 slides, 119 tokens. La
    declaración de `Armonizar.gs` **sigue siendo cierta**: `1JrHvs_p…` está en Drive como
    `[OBSOLETA — no usar] JM_marcada`, dentro de la subcarpeta `_backups`.
  - **`SEED_INFORMES_` (`Instalar.gs`)** declara los dos IDs. "Aplicar configuración" los
    llevó a la hoja; la corrida siguiente da `cambiadas 0 · agregadas 0 · migraciones 0 ·
    solo_en_hoja 7 · protegidas (con diferencia) 0 · protegidas (sin diferencia) 8 · sin
    cambios: sí` — los mismos números de referencia del cierre del `2.16`.
  - **Retirados de `Armonizar.gs`:** `PLANTILLA_JM_CANONICA_`, `PLANTILLA_JM_OBSOLETA_` y la
    migración de un solo uso `repuntarPlantillaCanonicaJM_()`, más su ítem de menú en
    `Codigo.gs`. Cierra el sub-ítem `PLANTILLA_JM_CANONICA_ hardcodeada` del `P0` de
    direccionabilidad.
  - **`docs/ESCRITORES.md`** — censo re-corrido (`node tools/escritores.js`, 03/08) y §2.4
    nueva: `INFORMES.plantilla_id` **cambió de dueño**, del registro de plantillas al seed.
  - **`docs/RUNBOOK.md`** — Parte D reescrita (el registro automático **ya no es la opción
    recomendada** para esta carpeta), Parte E con el acceso verificado, y la tabla de
    carpetas con la anidación real.
- **Prueba:** los 21 `.gs` parsean (`new vm.Script`); `menuAplicarConfiguracion_` sin
  cambios; **los 6 controles de `Pruebas.gs` pasan**; `inventarioPlantillas()` abre las dos
  plantillas leyendo `INFORMES`.
- **Pendientes/decisiones:**
  - **Por qué al seed y no sólo a la hoja.** `upsertPorClave_` reescribe la **fila entera**
    desde el seed, y `SEED_INFORMES_` declaraba `plantilla_id: ''`: cada "Aplicar
    configuración" borraba el ID. Es por eso que la celda llegó vacía al 03/08 **aunque
    `repuntarPlantillaCanonicaJM_` había corrido el 30/07** —su otra mitad, el renombre en
    Drive, sigue hecha—. El bloqueo que tapó a los Pasos 3, 4 y 5 durante cuatro días salió
    de ahí. **No se tocó `upsertPorClave_`**: es maquinaria de cinco hojas y el arreglo
    cambia la semántica de todas. Queda como `P0` en `PENDIENTES`, con la parte de `SOLAPAS`
    que **sí puede dispararse hoy** sobre 65 de 84 filas.
  - **Dos hallazgos nuevos, los dos `P0` en `PENDIENTES`:** (1) `JM_marcada` **es invisible
    al listado** de la carpeta —desde `DriveApp` y desde la Drive API, por padre y por
    nombre— y se abre perfecto por ID; el recorrido del registro **baja a `_backups`**, así
    que con las celdas vacías habría cargado la obsoleta. Medido con las celdas ya cargadas:
    8 archivos vistos, 1 asignado, **7 conflictos**, todos contra backups. (2) `rdv` está
    compartida como **`anyoneWithLink = writer`**, que pisa el `reader` explícito: la bajada
    a Lector se hizo en las cuatro bases y se verificó, pero sobre `rdv` no cambia nada en la
    práctica. Acción del usuario sobre Drive, con el dueño de la base.
  - **No había entrada en `PENDIENTES` sobre el acceso de `reportes` para cerrar:** se
    greppeó y dio cero. Se registra el cero (`CLAUDE.md` §3) y la verificación queda en
    `PLAN.md` §2, que es donde vivía el ítem.

## Config — `D-21` activado sobre `rdv/status`, con la medición que el 2.16 no pudo hacer (2026-08-03) — commit `66ff042`
- **Qué pedía:** declarar `rdv/status = Realizada` en `MAPEO.valores_incluidos` (decisión del
  usuario), **midiendo antes cuántas filas entran y cuántas quedan afuera** y qué lecturas
  además del matcher se ven afectadas. Si no se podía medir por API, activarlo igual pero con
  los números antes y después en la bitácora.
- **Qué se hizo:**
  - **Se pudo medir, y el `2.16` se había equivocado en la conclusión, no en el hecho.** Es
    cierto que `leerFuente` no acepta una ventana por JSON —espera dos `Date` y
    `Utilities.formatDate` rechaza strings—, pero `probarLecturaPeriodo()` ya la resolvía
    adentro. Lo que fallaba era **el tamaño de la respuesta**: recorre las cuatro bases y
    devuelve `filas` completo, y sobre `/dev` esa respuesta no vuelve. Con el token recién
    renovado y `ping` en 33 ms, falló cuatro veces alternando 404 y página de login — los dos
    síntomas que el `RUNBOOK` atribuía al endpoint y al Bearer.
  - **`contarLecturaBase_(baseId)` (`Fuentes.gs`)**, sólo lectura: los mismos conteos de una
    base y sin las filas. Responde en 5-6 s. Nombre greppeado antes (`CLAUDE.md` §1): libre.
  - **`SEED_MAPEO_`** — `rdv/RVD JM-CM - ES/status` pasa a `valores_incluidos: 'Realizada'`.
    "Aplicar configuración" da **`cambiadas: 2`**, que es **1 fila × 2 columnas**
    (`valores_incluidos` + `notas`) — la unidad de la nota de método 3 de `PLAN.md`.
- **Prueba — los números, ventana de `CONFIG` 26/06 → 03/07:**

  | | antes | después |
  |---|---|---|
  | `filas_totales` | 1362 | **1362** (invariante del `2.9` B) |
  | `filas_en_ventana` | 16 | **13** |
  | `filas_excluidas_por_valor` | 0 | **709** |
  | `filas_sin_fecha` | 642 | **0** |

  Desglose de las 709: vacío **642**, `Suspendida` **58**, `en agenda` **6**,
  `Reprogramada` **2**, `Se modifico el barrio` **1**. Entran **653 de 1362**.
  `valores_declarados_sin_filas` vacío: `Realizada` no es un tipeo. **Los 6 controles de
  `Pruebas.gs` pasan.**
- **Pendientes/decisiones:**
  - **`filas_sin_fecha` 642 → 0 no es un arreglo.** No se llenó ninguna fecha: las 642 filas
    vacías quedan afuera por valor **antes** del bucle de fechas, así que dejan de contarse
    ahí. `filas_vacias` sigue en 642. Anotado para que nadie lo lea como una mejora de datos.
  - **Quién ve la lista y quién no.** Por `leerFuente`: el matcher (`buscarEncuentroDelDia_`),
    que **ya filtraba por su cuenta** con `VALOR_STATUS_REALIZADA_` cableado —ahora filtra dos
    veces por lo mismo, sin cambiar el resultado— y dos diagnósticos. **No la ve
    `verificarPrecondicionAnclaje_`**, que lee con `getDataRange()` directo. Retirar el
    duplicado y resolver la asimetría van con el **paso del matcher**.
  - **`R-01` no se cumple: 5 grupos** con más de un encuentro por (Figura, fecha), medido con
    `verificarPrecondicionAnclaje_()`. **`anclarEncuentros()` no corre** mientras falle. **No
    lo causó `D-21`** —esa función no pasa por `leerFuente`, ninguna lista blanca puede
    moverla— pero sí cuenta duplicados sobre las 709 filas que ahora se excluyen. Reportado
    como pregunta al equipo en `PENDIENTES`, que es lo que `R-01` manda hacer.
  - **Si algún día se suma `En agenda`:** en la base viva está escrito **`en agenda`, en
    minúscula**, y `R-10` compara sin plegar mayúsculas. Con la capitalización equivocada esas
    6 filas se excluirían en silencio.

## Paso 2.5 — Parte 0 corrida, y **para**: la plantilla canónica de JM sigue sin armonizar (2026-08-03) — commit de esta entrada
- **Qué pedía:** arrancar el `Paso-2.5` por su Parte 0, que es verificación de premisas, sólo
  lectura, "reportar y **PARAR**".
- **Qué se hizo — las cuatro premisas, verificadas contra el estado de hoy:**
  - **0.1 · El bloqueo — ❌ NO cerró. Es el que para el paso.** El prompt dice que no arranca
    hasta que la armonización de la JM canónica esté verificada. **No lo está.**
    `inventariarPresentacion_('jm', '117I0qn1…')` encuentra **los cinco tokens viejos** de
    `TOKENS_VIEJOS_DIAGNOSTICO_` —`enc_audiencia_ivr`, `enc_audiencia_pauta`, `enc_clics`,
    `rrss_prom`, `m2_clics_a`— más el literal `135` suelto. `docs/TOKENS.md` lo dice en su
    encabezado con estas palabras: *"No sembrar `MARCADORES` asumiendo que las plantillas ya
    están armonizadas"*. **Y el número real es peor que el que devuelve el diagnóstico:**
    esa lista es una **muestra de cinco**, no un censo; la lista de renombres de JM
    (`RENOMBRES_ARMONIZACION_POR_INFORME_`) tiene **23 entradas**. Sembrar ahora es crear
    hasta 23 filas destinadas a cambiar de nombre, y deshacerlo es a mano.
    **Quién lo destraba:** el `P1` de la caja `{{m2_salud_camp}}` huérfana, que es **decisión
    del usuario y no criterio técnico** (`C-01`: la plantilla es del equipo) — o la caja es
    un sobrante y se borra, o el renombre `m2_camp4`→`m2_salud_camp` sale del diccionario.
    Aplicarlo con la caja ahí deja **dos cajas con el mismo token**, que es la regresión de
    `enc_audiencia` otra vez.
  - **0.2 · `INFORMES.plantilla_id` — ✅ resuelto hoy**, en la entrada de más arriba. Era el
    bloqueo que la auditoría del 03/08 había marcado como vencido y bloqueante.
  - **0.3 · El choque con el `Paso-2.13` — ✅ resuelto** por `D-17` el 02/08. Sin cambios.
  - **`D-20` no afecta a este paso, contra lo que suponía la auditoría.** El `Paso-2.5`
    escribe `periodo_ref` **vacío** y deja la cadena para el Paso 3. Con la cadena de cinco
    eslabones, `MARCADORES.periodo_ref` es el segundo y vacío significa "pasá al siguiente":
    exactamente lo que el prompt ya hace. **No necesita addendum por `D-20`.**
- **Prueba:** ninguna, es sólo lectura. **No se tocó una línea de código ni de `MARCADORES`**,
  que sigue con sus 3 filas de ejemplo.
- **Pendientes/decisiones:** el `Paso-2.5` queda **trabado por una decisión del usuario** —
  la caja `{{m2_salud_camp}}`—, no por trabajo de Code. Es el mismo bloqueo que ya estaba
  escrito en `PENDIENTES` y en el encabezado de `TOKENS.md`; lo nuevo es que ahora está
  **medido contra la plantilla viva**, y que `SECCO` **sí** está armonizada (cero tokens
  viejos de la muestra), así que el bloqueo es de JM, que es justo el informe del Tramo 2.

## Doc — auditoría de premisas del `Paso-2.13`: sirve, con una premisa vencida (2026-08-03) — commit de esta entrada
- **Qué pedía:** auditar las premisas del `Paso-2.13` y dar veredicto, **sin ejecutarlo**.
- **Veredicto: sirve como está, con una premisa vencida en la Parte 4 y tres números
  corregidos.** Las correcciones van **en el lugar**, que es lo que su propio encabezado
  declara para este prompt (nunca ejecutado, no lleva addendum).
- **Qué se verificó, parte por parte:**
  - **Parte 1 — anulada** por `D-17` desde el 02/08, ya estaba dicho en el prompt. Sigue en
    pie su cola: `MARCADORES` tiene **3 filas** contra las trazas del CSV (`H-6`), y la
    exportación a `docs/_snapshots/` antes de que nada la escriba — hecha hoy como parte del
    snapshot previo a "Aplicar".
  - **Parte 2 — vive, con dos números mal.** `MAPEO` tiene **121** filas, no 113. Y el CSV:
    **las 48 filas tienen traza completa**, medido con un parser que respeta comillas. El
    **43 es correcto por otro motivo** — la columna `estado` da `exacto` 37, `deriva` 6,
    `sin_fuente` 5, y 48 − 5 = 43. El corte no es *"tiene traza"* sino **`estado !=
    sin_fuente`**, y como está escrito el criterio de aceptación pide declarar cinco casos
    que el propio CSV marca sin fuente. La premisa de `m2` **sigue viva**: de sus 19 filas,
    8 apuntan a `M2 periodo DIRECTA` y 6 a `M2 periodo DIGITAL` (las dos `referencia`) y 5 a
    `Cuentas` (`ignorar`, que es el `P1` abierto).
  - **Parte 3 — vive entera y es la más filosa.** El cruce de `enc_mails_enviados` sigue tal
    cual en `TOKENS.md`. Y `MARCADORES` **hoy tiene dos de sus tres filas con
    `informe_id = '*'`** (`ecv_inscriptos`, `camp_alcance`): el guardarraíl que esta parte
    pide no es hipotético.
  - **Parte 4 — ⚠ premisa vencida.** Manda agregar el cuadro de "una fuente por cosa" a
    `PROYECTO.md` §9, y **`PROYECTO.md` está congelado desde el 01/08** (`DOC-6` Parte E).
    Esa pregunta la heredó **`CLAUDE.md` §7**, que ya tiene el cuadro con más filas. **La
    tarea no hay que rehacerla: está hecha en otro lado.** Y el criterio *"`docs/` baja de 23
    a 22"* no se puede evaluar: hoy hay **27** `.md`. Lo que sí sigue en pie es archivar
    `docs/MAPEO_completo.md`. La otra mitad —una línea de "qué gobierna" en cada `.md`—
    **conviene decidirla antes de hacerla**: `DOC-6` decidió después de este prompt que **§7
    es el único índice**, y una línea por archivo sería la segunda lista, que es justo lo que
    esa regla vino a evitar.
- **Prueba:** ninguna, es documental. Verificado contra la hoja viva (snapshot del 03/08), el
  CSV, `Instalar.gs` y `CLAUDE.md` §7.
- **Pendientes/decisiones:** ninguna nueva. `MARCADORES` **ya está en `COLUMNAS_DELTA_`**, así
  que la columna `verificado_por` de la Parte 2 tiene el mecanismo correcto disponible — y va
  **al final del array**, por lo que midieron el `2.15` y el `2.16`.

## Relevamiento — la caja `{{m2_salud_camp}}`: qué es y qué la rodea (2026-08-03) — commit de esta entrada
- **Qué pedía:** antes de decidir sobre la caja huérfana, **buscar el grupo**. El usuario
  sospechaba que hubiera una caja por eje —salud, transporte y similares—, en cuyo caso sería
  un grupo y no una huérfana, y el diagnóstico cambiaba. Sólo lectura, sin aplicar el
  renombre.
- **Qué se hizo:** `mapaDeTokens_(plantillaId, patron)` en `Armonizar.gs`, **sólo lectura**:
  recorre `getPageElements()` y baja a **tablas** (celda por celda) y **grupos**
  (recursivo), y devuelve por cada caja con token su slide, geometría y texto. Corrido sobre
  la JM canónica y sobre la obsoleta. No se tocó ninguna plantilla.
- **Prueba / qué se encontró:**
  - **Sí hay un grupo de tokens nombrados por eje, y no es el que se buscaba: son seis** —
    la fila de Impresiones entera (`m2_subtes_imp`, `m2_desalojos_imp`, `m2_transito_imp`,
    `m2_salud_imp`, `m2_seguridad_imp`) más `m2_seguridad_aud`. **Ninguna tiene `m2_campN` de
    origen y ninguna colisiona:** son casillas que nunca tuvieron nombre viejo.
  - **`m2_salud_camp` no pertenece a ese grupo, y lo dice la geometría.** La grilla es 5
    columnas × 4 filas de métrica; las cinco cajas de campañas están en `y=318` con `w≈82`,
    una por eje. La caja en disputa está en **`y=356, x=100, w=513, h=30`**: fila propia,
    debajo de la grilla, cruzando a lo ancho las cinco columnas, sin etiqueta vecina. Dice
    "campañas" en plural; la de Salud de la grilla dice "campaña" en singular.
  - **La caja ancha es anterior a la armonización.** En la obsoleta (`1JrHvs_p…`) está en la
    **misma posición exacta y ya con el mismo nombre**. No la creó el renombre. Y ahí se ve
    el resultado de aplicarlo: `{{m2_salud_camp}}` aparece **dos veces**. La obsoleta es la
    **prueba empírica** de la colisión, no una predicción.
  - **El resto del diccionario queda confirmado columna por columna** contra la grilla
    armonizada de la obsoleta: `camp2`→subtes, `camp1`→desalojos, `camp3`→tránsito,
    `camp4`→salud, `camp5`→seguridad, e ídem `aud`/`clics`/`vis`. También el comentario del
    código sobre visualizaciones: sólo hay **dos** cajas.
  - **Aparece una tercera opción que no estaba planteada:** que la caja ancha sea **otro
    concepto —plausiblemente un total— con el nombre de un eje**. Si fuera eso, no se borra
    ni se saca el renombre: se la renombra a lo que mide y el diccionario entra entero. **Es
    inferencia, no hecho** — lo sostienen el ancho, la fila propia y el plural.
  - **Hallazgo lateral, `P1` nuevo:** ningún `.gs` recorre `getTables()` ni `getGroups()`.
    Sobre la JM canónica, el inventario reporta **158** tokens y el recorrido completo
    encuentra **191**: **faltan 33**. La armonización está a salvo —`replaceAllText` es de
    toda la presentación— pero los diagnósticos subcuentan y el `Paso-2.5` sembraría 33 filas
    de menos si copiara el recorrido viejo.
  - **Dato suelto:** la slide 10 tiene material **fuera del área visible** (`y` negativo) con
    datos reales del informe original — `Desalojo - 6 campañas`, `Avenidas porteñas - 1
    campañas`, `Puntos seguros - 1 campañas`, con sus métricas.
- **Pendientes/decisiones:** **no se aplicó el renombre y no se tocó ninguna plantilla.** La
  decisión sigue siendo del usuario, ahora con tres opciones en vez de dos. Lo que falta para
  cerrar la tercera es el informe original publicado, o preguntarle al equipo qué mostraba
  esa línea a lo ancho.

## Relevamiento — el material fuera de vista de la lámina M2, y los 81 tokens invisibles (2026-08-03) — commit de esta entrada
- **Qué pedía:** (1) reportar, **sin interpretarlo**, qué decía el material fuera del área
  visible de la slide 10, para saber si la caja ancha era un agregado; (2) si lo confirmaba,
  renombrarla y proponer nombres; si no, **parar** — es del equipo (`C-01`); (3) anotar en
  `PENDIENTES` que la colisión **no la crea el renombre, la revela**; (4) listar los 33
  tokens que el conteo viejo no ve.
- **Qué se hizo, y el punto 2 NO se ejecutó:**
  - **1 · El material fuera de vista, transcripto tal cual.** La slide 10 tiene 51 textos sin
    token; **18 están fuera de la lámina** (`y` negativo). Son **cuatro** bloques:
    `Desalojo - 6 campañas` (Aud 1.101.777 · Imp 15.793.427 · Clics 73.181 · Vis 1.782.747),
    `Avenidas porteñas - 1 campañas` (184.030 · 2.567.696 · 34.483 · 308.879),
    `Puntos seguros - 1 campañas` (978.523 · 7.387.326 · 46.021 · `-`) y
    `Estaciones de subtes - 3 campañas` (1.242.288 · 12.742.329 · 27.326 · `-`).
    **Salud no aparece.** Los conteos suman **11 campañas**.
  - **2 · NO alcanza para decidir, así que se paró y no se renombró nada.** Ese material
    **no es el contenido de la caja ancha**: es un layout distinto y anterior donde cada eje
    es un bloque vertical y **el conteo de campañas vive dentro del título**, no en una fila
    aparte. En ese diseño **no existe ninguna caja a lo ancho**. Ninguno de los 18 textos
    está a `y=356` ni tiene `w=513`, y **ninguno contiene un token**. La tercera opción sigue
    siendo la lectura más plausible y sigue **sin confirmar**. Va al equipo, con la pregunta
    concreta escrita en `PENDIENTES`.
  - **3 · Anotado en `PENDIENTES`, y corrige la premisa de la entrada.** El texto original
    dice que el renombre *crea* las dos cajas con el mismo token. **No las crea: las revela.**
    La caja ancha ya estaba con ese nombre y en esa posición en la plantilla obsoleta, que es
    anterior al diccionario. Por eso **ninguna de las dos opciones excluyentes es correcta**:
    borrar la caja toca la plantilla del equipo sin saber qué mide, y sacar el renombre deja
    a `m2_camp4` con nombre viejo para siempre por un choque que no es suyo.
  - **4 · Los invisibles, listados por slide.** **JM: 33 de 191 (17%)** —
    `ecv_barrio*` (slide 5), `camp1..camp4` (7), diez `camp_env*` (18), once `camp_resp*`
    (19), cuatro `rrss_c*_pct` (21). Y se midió también **SECCO: 48 de 167 (29%)** —
    `ecv_minutos` (5), seis `post_*` (10), los mismos `camp_env*` y `camp_resp*` (22 y 23),
    once `conv_*` (25), nueve `rrss_*` (28).
- **Prueba:** `tokens_en_forma_suelta` da **158** en JM, que es exactamente lo que reporta
  `inventariarPresentacion_`; 158 + 33 = 191. Los 6 controles de `Pruebas.gs` pasan.
- **Pendientes/decisiones — dos cosas nuevas que hay que resolver antes de que el `Paso-2.5`
  siembre:**
  - **`camp1`..`camp4` (JM slide 7) no tienen guión bajo.** La regla de familia del prompt
    —*prefijo hasta el primer `_`; sin `_`, familia = el token entero*— los manda a **cuatro
    familias de un miembro** en vez de a `camp`. Es la primera vez que la regla se topa con
    un token sin `_`.
  - **`post_*` (SECCO slide 10) es una familia que `INFORMES` no declara.** Las de `secco`
    son `ecv,et,emin,m2,camp,conv,rep,rrss`. O falta `post`, o los seis tokens están mal
    nombrados.

## Relevamiento — la caja en disputa está en otra lámina: la pregunta cambia (2026-08-03) — commit de esta entrada
- **Qué pedía:** con el informe original (24/07–31/07) aportado por el usuario, verificar
  contra la plantilla si `{{m2_campanias}}` y `{{m2_salud_camp}}` viven en la **misma lámina
  o en dos distintas**. Sin renombrar.
- **Respuesta: en dos distintas.** Y eso cambia la pregunta, como el usuario anticipó.

  | | lámina | token | `y` | `x` | `w` | `h` |
  |---|---|---|---|---|---|---|
  | conteo | **slide 9** · *Directa \| Status semanal de M2* | `{{m2_envios}}` (texto `{{m2_envios}}Campañas`) | 84 | 268 | 378 | 24 |
  | lista | **slide 9**, 23 pt debajo | `{{m2_campanias}}` | 107 | 268 | 378 | 24 |
  | caja en disputa | **slide 10** · *M2* | `{{m2_salud_camp}}` | 356 | 100 | 513 | 30 |

- **Qué se verificó:**
  - **La slide 9 es la lámina del informe real, y la correspondencia es de forma.** El
    original tiene Mail a la izquierda y a la derecha una caja de conteo (`12 Campañas`)
    sobre una caja ancha con la lista — conteo `x=308 y=120 w=343`, lista `x=308 y=142
    w=343`. La slide 9: **misma `x`, mismo `w`, lista inmediatamente debajo del conteo**
    (Δ`y` 23 contra 22), y a la izquierda `Mail`, `Mails entregados`, `Aperturas (OR)`,
    `Clics (CTOR)` más un `33 envíos` escrito a mano.
  - **La grilla de cinco ejes no existe en el informe.** La slide 10 no tiene contraparte en
    el deck publicado, y acumula **dos** formatos por eje que nadie usó: la grilla visible y
    los cuatro bloques verticales parkeados fuera del área. El informe resuelve M2 con **una
    lista plana de doce nombres que mezcla ejes**, sin agrupamiento.
  - **Verificado también en la obsoleta:** su slide 9 tiene las dos cajas en las mismas
    coordenadas (`x=268`, `y=84` y `y=107`, `w=378`). La estructura es anterior al
    diccionario.
- **Prueba:** `mapaDeTokens_` sobre la canónica, sólo lectura. Los 6 controles pasan.
- **Pendientes/decisiones:**
  - **No se renombró nada, y la tercera opción quedó sin objeto por ahora.** La pregunta ya
    no es cómo nombrar la caja: es **si la slide 10 sigue vigente**. Si se retira, el
    conflicto desaparece entero —se van `m2_salud_camp` y las veintitantas cajas de la
    grilla, y las veinte entradas `m2_*` del diccionario de renombres dejan de tener objeto—.
    Es del usuario con el equipo (`C-01`).
  - **Hallazgo que sobrevive a esa decisión, y es de `docs/TOKENS.md`:** en la slide 9, que
    **sí** se usa, los dos tokens dicen lo contrario de lo que llenan. `{{m2_envios}}` está
    en la caja del **conteo de campañas** (su texto es `{{m2_envios}}Campañas`, y el conteo
    de envíos está al lado, a mano, como `33 envíos`), y `{{m2_campanias}}` está en la caja
    de la **lista de nombres**. Misma clase de cruce que `enc_mails_enviados` (`Paso-2.13`
    Parte 3).

## Doc — la operación de lista, el segundo cruce de M2, y la slide 10 congelada (2026-08-03) — commit de esta entrada
- **Qué pedía:** anotar como `P1` la operación que falta —una que devuelva una lista de
  valores concatenados—; reportar si hay otros tokens con esa forma; anotar el cruce de
  `m2_envios`/`m2_campanias` **junto al de `enc_mails_enviados`** del `Paso-2.13` Parte 3 y no
  como entrada suelta; registrar la decisión del usuario sobre la slide 10; y dejar en
  `PLAN.md` §2 el criterio de que las solapas y el mapeo se ajustan **después** del corte
  vertical.
- **Qué se hizo:**
  - **`P1` nuevo — falta la operación de lista.** Las seis del `Paso-3-v3` devuelven un
    escalar. `TEXTO` no cubre el caso: lee un literal de `valor_fijo`, no construye desde
    datos, y una lista que cambia cada semana en `valor_fijo` sería curaduría a mano
    disfrazada de configuración. Apunta al **Paso 3**, que es quien implementa las
    operaciones.
  - **Los candidatos, buscados en las dos plantillas** (tokens de nombre plural, con su
    geometría): **dos confirmados** —`m2_implementaciones` (SECCO slide 14) y `m2_campanias`
    (JM slide 9), que son la misma caja de lista— y **dos plausibles sin confirmar**:
    `ecv_barrios` (JM slide 5, convive con `ecv_barrio1/2/3`, así que puede ser el conteo) y
    `rep_p2_temas`/`rep_p3_temas` (SECCO slide 27). Además queda anotado el **patrón
    alternativo** que convive: `ecv_barrio1-3`, `conv_tema1-3`, `post_camp1-3`,
    `camp_env1-5`, `rrss_area1-10`, `m2_camp1-5` resuelven lo mismo con **una caja por
    ítem** y no necesitan la operación.
  - **El segundo cruce, en el `Paso-2.13` Parte 3, junto al primero.** SECCO nombra bien esa
    lámina y **JM la nombra corrida un lugar**: en SECCO `m2_envios`=envíos,
    `m2_campanias`=conteo de campañas, `m2_implementaciones`=lista de nombres; en JM
    `m2_envios`=conteo de campañas, `m2_campanias`=lista de nombres, y **para envíos no hay
    token** —dice `33 envíos` escrito a mano—. Dos nombres, cuatro significados. Refuerza las
    tres tareas de esa parte: clave `['marcador','informe_id']`, nunca `'*'` para un token
    cruzado, y el guardarraíl. **No se renombró nada** (`C-01`).
  - **La slide 10 queda congelada**, decisión del usuario: no se retira, no se corrige, no se
    borra la caja, no se saca el renombre y **no se aplica el diccionario sobre esa lámina**.
    Si vuelve a aparecer en un informe, ahí se decide.
  - **`PLAN.md` §2** — criterio del Tramo 2: solapas y mapeo se ajustan **después** del corte
    vertical. Un token sin cablear sale como `«FALTA:token»` y queda listado; mapear por
    adelantado es trabajar sobre sospechas, que es lo que midió el `Paso-2.16`.
- **Prueba:** ninguna, es documental. El relevamiento de tokens fue sólo lectura.
- **Pendientes/decisiones:**
  - **La decisión sobre la slide 10 cambia el bloqueo del `Paso-2.5`, y hay que verlo antes
    de armonizar.** `armonizarPresentacion_` aplica la lista entera de `jm` con
    `replaceAllText`, que es de **toda la presentación**: correrlo como está **sí toca la
    slide 10** —veinte de las veinticinco entradas de `jm` son suyas— y produce justamente la
    colisión que la decisión quiere evitar. Las otras **cinco** no la tocan. Armonizar
    respetando la decisión exige correr sólo esas cinco, y eso hoy no se puede sin partir la
    lista en el `.gs`. **No se hizo:** es una decisión sobre cómo armonizar.
  - **Verificar de cuál informe salió el deck original.** Las coordenadas que aportó el
    usuario coinciden **exactamente en `x` y `w` con SECCO** (`x=308 w=343`, Δ`y` 22) y sólo
    se aproximan a JM (`x=268 w=378`, Δ`y` 23); el texto también —SECCO renderiza
    `12 Campañas` con espacio, JM `12Campañas` sin espacio—. Define cuál plantilla es la
    referencia de esa lámina.

## Paso 3 (v3) — Parte 0 corrida: las siete premisas, y **para** (2026-08-03) — commit de esta entrada
- **Qué pedía:** verificar las siete premisas del `Paso-3-v3`, sólo lectura, reportar y
  **PARAR**. Se hizo porque no depende de nada de lo que quedó abierto en M2.
- **Veredicto: el prompt se sostiene. Ninguna premisa vencida, y el agujero que se temía no
  existe.** Hay tres cosas para tener a la vista al ejecutarlo, ninguna bloqueante.
- **0.1 · `MARCADORES`.** El esquema vivo es **exactamente** el que el prompt esperaba, once
  columnas: `marcador · familia · informe_id · base_id · solapa · campo_logico · periodo_ref ·
  operacion · valor_fijo · formato · notas`. **Tres filas**, y las tres **están cableadas**
  (`base_id` + `campo_logico` + `operacion`). **La clave del upsert no se puede confirmar
  porque no hay upsert:** `MARCADORES` no tiene sembrador —su único escritor censado es la
  migración `migrarCalculoAOperacion_`—, así que lo que `DOC-2` iba a pasar a
  `['marcador','informe_id']` **no existe todavía**. Lo crea el `Paso-2.5`.
  **⚠ A la vista:** las `operacion` de las tres filas son `calcInscriptos`, `calcAlcance` y
  `calcEnvios` — el estilo **una función por marcador**, que es justo lo que la Parte A del
  `v3` reemplaza por seis operaciones genéricas. Bajo el `v3` las tres quedan inválidas: o se
  reescriben a `SUMA`/`ULTIMO`/… o pasan a `FN:`. Son filas de ejemplo, así que el costo es
  nulo, pero conviene no descubrirlo corriendo.
- **0.2 · `SECCIONES`.** Catorce columnas: `seccion_id · padre · orden · nombre · informes ·
  modo · itera_sobre · filtro · opcional · condicion · familia_tokens · estado · falta ·
  notas`. **No ganó columna de período.** **Confirmado que sigue FUERA de `COLUMNAS_DELTA_`**
  —el mapa tiene `MARCADORES`, `CAMPANAS`, `REUNIONES`, `BASES`, `MAPEO` y `SOLAPAS`, no
  `SECCIONES`—. **En riesgo: 34 filas curadas** (el handoff venía diciendo 35; son 35 líneas
  de TSV, 34 de datos). El modo de falla del `2.15` `0.2` está intacto y la precaución del
  prompt es correcta.
- **0.3 · `resolverVentana()`** (`Fuentes.gs`), leído del código y no del comentario: resuelve
  en **tres** capas, en este orden — `opciones.campana` (busca en `CAMPANAS`, usa
  `desde`/`hasta`) → `opciones.periodo_ref` (busca en `PERIODOS`) → `CONFIG.periodo_desde/
  periodo_hasta`. **Cuando no encuentra nada devuelve `{ok:false, motivo:…}`, no una semana.**
  Confirma las dos premisas de `D-20`: falta el eslabón de sección **y** falta el default de
  `R-11`.
- **0.4 · Lo que dejó el `2.16`.** Confirmado en `leerFuente`: la lista blanca se calcula
  **antes** de bifurcar por modo y produce un vector `incluida[]`; la rama `filtrar` saltea
  las excluidas (`if (!incluida[j]) return;`) y la rama `snapshot` filtra por el mismo vector.
  **`resultado.filas` sale ya filtrado**, así que `ctx.filas` le llega filtrado a la
  operación. El despachador no tiene que volver a filtrar.
- **0.5 · El proveedor de `digital` — EXISTE. El agujero más probable no está.**
  `filasDigitalDeEncuentro(idCuentaOEncuentro, ventana)` vive en `Union.gs:576` y está
  declarada en el encabezado del módulo. El `v2` la daba por hecho y acertaba.
- **0.6 · `TOKENS.md` §5.** La tabla sigue describiendo **tres capas** —campaña, marcador con
  `periodo_ref`, `CONFIG`—, y ya tiene la nota del 03/08 que la declara superada por `D-20`.
  La Parte C del prompt es la que la reescribe. **Se corrigió un error de esa nota:** decía
  `SECCIONES.periodo_id` y es `periodo_ref`; `periodo_id` es la columna de
  `CAMPANAS`/`REUNIONES` y significa lo contrario.
- **0.7 · Normalizadores — hay cuatro y ninguno se agrega.** `normalizar_` (`Parseo.gs`,
  pliega case y acentos, para texto libre), `normalizarParaComparar_` (`Instalar.gs`,
  canonicaliza fechas para el diff), `normalizarIdCuenta_` (`Union.gs`, `String().trim()`
  para claves de join) y `normalizarValorDeclarado_` (`Fuentes.gs`, la forma de `R-10`:
  colapsa espacios y recorta, **sin plegar mayúsculas ni acentos**). **El canónico para
  comparar valores de una columna es `normalizarValorDeclarado_`.** La regla y los cuatro
  están escritos en `CLAUDE.md` §2.
- **Prueba:** sólo lectura. No se tocó código.
- **Pendientes/decisiones:** ninguna nueva. **El paso está listo para ejecutarse** cuando se
  decida arrancarlo.

## Armonización — filtro de láminas congeladas derivado del inventario (2026-08-03) — commit de esta entrada
- **Qué pedía:** registrar que el deck 24–31/07 es de **JM** y tiene la estructura de **tres
  cajas de SECCO**; resolver cómo armonizar sin tocar la lámina congelada **sin partir la
  lista a mano**, derivando el filtro del inventario, y reportar cuántas entradas quedan
  dentro y fuera **antes de correr**; anotar como `P2` que `replaceAllText` es global por
  diseño.
- **Qué se hizo:**
  - **1 · La plantilla de JM está atrasada respecto del informe que JM publica.** Anotado en
    el `Paso-2.13` Parte 3, junto al cruce. El deck es de JM y su lámina M2 tiene las **tres**
    cajas —envíos, conteo de campañas, lista de nombres— que hoy sólo existen en la plantilla
    de **SECCO**; la de JM tiene dos y le falta el token de envíos. Eso hace de **SECCO la
    referencia de esa lámina** y confirma que el cruce de nombres de JM es un **defecto**, no
    una convención por informe.
  - **2 · El filtro, derivado.** `filtrarRenombresPorLaminasCongeladas_` mira, para cada
    entrada del diccionario, en qué slides vive su token de origen, y la excluye **sólo si
    vive únicamente en una lámina congelada**. `LAMINAS_CONGELADAS_` declara la lámina con un
    **testigo** (`m2_salud_camp`) que tiene que estar en esa slide: si el equipo reordena,
    **para y no armoniza** en vez de excluir la equivocada — el número de slide solo no
    alcanza, la misma lámina es la 10 en la canónica y la 11 en la obsoleta. Si una entrada
    tuviera su token **dentro y fuera**, también para y la reporta.
  - Para poder derivarlo se **extrajo el recorrido a scope de módulo**
    (`piezasDeTextoDeSlide_`, `tokensPorSlide_`, `recorteTexto_`, `geometriaElemento_`), que
    antes vivía adentro de `mapaDeTokens_`. Dos recorridos distintos sobre la misma plantilla
    era la duplicación que este repo ya pagó cara. Los cuatro nombres se greppearon antes.
  - **3 · `P2` anotado, sin hacerlo:** `replaceAllText` es de toda la presentación, así que el
    filtro acota **por token**, que es una aproximación a acotar **por lámina**. La solución
    de fondo es escribir por `objectId` — y **no es trabajo perdido**: `D-06` etapa 2 ya
    exige el mapa `token → objectId` y el `Paso-4` lo registra. Conviene hacerlo **después**
    del Paso 4, cuando el costo ya esté pago.
- **Prueba — `previsualizarArmonizacion('jm')`, sólo lectura, sin armonizar:**
  **21 declaradas · 5 DENTRO · 16 FUERA · 0 conflictos · 0 sin ocurrencias.** Las 5 de adentro
  son `enc_audiencia`, `enc_audiencia_pct`, `enc_clics`, `enc_audiencia_ivr` y `rrss_prom`;
  las 16 de afuera son todas `m2_*` y todas de la slide 10. El testigo verificó. Los 6
  controles de `Pruebas.gs` pasan.
- **Pendientes/decisiones:**
  - **No se armonizó.** Correrla escribe sobre la plantilla del equipo. Es acción del usuario
    o autorización explícita.
  - **Corrección de una cifra propia, y es la nota de método 1 de `PLAN.md`.** Durante el día
    dije que la lista de `jm` tenía **23** entradas y después **25**. Tiene **21** — 5 no-`m2`
    y 16 `m2`. Las dos cifras salieron de contar a ojo una lista con comentarios en el medio;
    la de ahora la contó el código. Corregido en `Paso-2.5` `0.1`, en `PENDIENTES` y en el
    handoff; las entradas anteriores de esta bitácora quedan como están —es append-only— y
    esta línea es su corrección.

## Paso 3 (v3) Parte A — despacho de operaciones, y cinco sextos ya estaban (2026-08-03) — commit de esta entrada
- **Qué pedía:** una función **por operación** en `Marcadores.gs`, firma uniforme
  `op<NOMBRE>(ctx) -> { valor, traza }`, la traza diciendo operación, campo, columna, solapa,
  cantidad de filas y ventana, y el escape hatch `operacion = FN:nombre`.
- **Lo primero que apareció, y la Parte 0 no lo había mirado: las seis operaciones ya
  existían.** `opSUMA`, `opCONTEO`, `opULTIMO`, `opRATIO`, `opPCT` y `opTEXTO` están en
  `Marcadores.gs` desde el corte vertical del `Paso-2.9E`. **La Parte A no era escribirlas: era
  alinearlas al contrato del `v3` y agregar el despacho, que no existía.**
- **Qué se hizo:**
  - **El contrato de `ctx`, aceptando las dos formas a propósito.** El prompt declara
    `ctx.filas` —los objetos que devuelve `leerFuente()`, ya leídos y ya filtrados por
    ventana y por `valores_incluidos`— y las seis esperaban `ctx.valores`, el arreglo de la
    columna ya extraído. `valoresDeCtx_(ctx)` acepta las dos: usa `valores` si viene, si no
    extrae de `filas` con `ctx.encabezado`. **Se extrae por nombre de columna y no por letra
    a propósito:** resolver letra → encabezado es leer `MAPEO`, y estas funciones no
    resuelven `MAPEO` ni abren bases. `ctx.columna` va igual, pero **sólo para la traza**.
  - **La ventana entra en la traza** (`trazaDeVentana_`), que era lo que faltaba para que el
    equipo pueda auditar un número sin abrir la base.
  - **`despacharOperacion_(nombre, ctx)` con mapa explícito `OPERACIONES_`.** **Nunca `eval`
    ni `this[nombre]`:** en Apps Script todos los `.gs` comparten un único scope global, así
    que resolver contra el global convierte una celda de `MARCADORES` —que edita una
    persona— en la capacidad de invocar cualquier función del proyecto, incluidas las que
    escriben hojas. El mapa **es** la lista blanca. El escape hatch `FN:` resuelve contra
    `FUNCIONES_PROPIAS_`, **vacío a propósito**: cada entrada ahí es una operación que no se
    pudo expresar con las seis, y esa lista es la medición de `D-01` del despachador.
  - **Una excepción adentro de una operación se convierte en `{ ok: false, motivo }`**, no
    corta la corrida — es la resiliencia que pide la Parte C. `opRATIO` además dice **cuál**
    de sus dos arreglos falta, en vez de tirar un `TypeError` que en la traza se lee
    "Cannot read properties of undefined".
  - **`opTEXTO` documenta lo que NO hace:** lee un literal de `valor_fijo` y no arma listas.
    Apunta al `P1` de la operación de lista.
- **Prueba — control positivo nuevo, `probarDespachoOperaciones_` (`Pruebas.gs`), y son 7:**
  `SUMA` sobre `filas` da 15 y **coincide con pasar `valores` ya extraído**; `CONTEO` cuenta
  la fila vacía; `ULTIMO` la saltea; la traza dice la ventana; una `operacion` desconocida
  falla con su nombre en el motivo; **`despacharOperacion_('instalar', …)` y
  `FN:instalar` fallan los dos** —que es el caso que justifica el mapa—; y `RATIO` sin sus
  arreglos dice cuál falta. **Las 7 pruebas pasan.**
  **Regresión del llamador que ya existía:** `corteVerticalRetiro2407_()` corrido por API —
  10 filas de token, 3 controles, **`cierraSuma: true`**. El cambio de contrato no lo tocó.
- **Medición de `D-01`: +242 / −23 líneas** en dos archivos (`Marcadores.gs` +194,
  `Pruebas.gs` +71). El renglón de "por qué hubo que tocar código" es **el despacho**: el
  motor no tenía forma de ejecutar una operación nombrada desde configuración sin abrir la
  puerta al scope global.
- **Pendientes/decisiones:**
  - **`FUNCIONES_PROPIAS_` queda vacío.** Si al terminar JM tiene más de un puñado de
    entradas, falta una operación genérica — la regla es del prompt y quedó escrita en el
    código, que es donde se va a leer.
  - **Sigue faltando la operación de lista** (`P1`): ninguna de las seis devuelve un arreglo
    concatenado, y `m2_campanias` la necesita.
  - **Paro acá**, como pide el prompt: un commit por parte, se avisa al final de cada una.

## Paso 3 (v3) Parte B — la cadena de período completa, cinco eslabones (2026-08-03) — commit de esta entrada
- **Qué pedía:** la columna de período en `SECCIONES` (con `COLUMNAS_DELTA_` **primero**), el
  eslabón nuevo en la cadena, el cálculo del default de `R-11`, los tres vacíos que no se
  unifican, y reescribir `TOKENS.md` §5. Con diff de configuración antes y después, y
  `protegidas (con diferencia): 0` como referencia.
- **B.1 · La columna, en dos corridas aplicadas y en ese orden.**
  - **Corrida 1 — sólo `COLUMNAS_DELTA_.SECCIONES`**, sin tocar `HOJAS_CONFIG_`. La hoja
    salió de la rama que reescribe la fila 1 y entró a la que inserta columnas.
    `periodo_ref` quedó en la **posición 14, antes de `notas`** — la convención que ya usan
    `MAPEO.valores_incluidos` y `SOLAPAS.filas_crudas`.
  - **Corrida 2 — recién ahí `HOJAS_CONFIG_.SECCIONES.headers`.** Con el delta puesto, la
    hoja ya no pasa por la reescritura de encabezados, así que agregar la columna a esa lista
    no puede correr los headers sobre los datos.
  - **Verificación fila por fila contra el snapshot previo: 35 filas de datos antes y 35
    después, y CERO diferencias fuera de la columna nueva.** Las 35 con `periodo_ref` vacío,
    que es lo que corresponde: vacío = usa el eslabón siguiente.
  - **`sembrarSecciones_` es inmune**: lee los headers **de la hoja**, no de `HOJAS_CONFIG_`,
    y mapea por nombre.
- **B.2 y B.3 · `resolverVentana()` pasa de tres capas a cinco.** Antes:
  `campaña > marcador > CONFIG > error`. Ahora: `campaña > marcador > SECCIONES.periodo_ref >
  CONFIG > semana de R-11`. **El último eslabón ya no falla: responde.** `semanaR11_(fecha)`
  calcula siete días viernes a jueves, los dos extremos inclusive, y marca el resultado con
  `origen: 'R-11 (calculado)'` y `calculado: true` — un número calculado y uno cargado a mano
  se leen igual en el deck y no deberían auditarse igual. Lo cargado en `CONFIG` sigue
  mandando siempre (`R-11` Addendum 1 punto 2).
  - `leerSeccionesPlano_()` (`Config.gs`), nuevo: `SECCIONES` indexado por `seccion_id`.
    Distinto de `leerSecciones_(informeId)` (`Secciones.gs`), que arma el **árbol** de un
    informe — acá hace falta mirar una sección por id, sin recorrer padres.
- **B.4 · Los tres vacíos** quedaron escritos juntos en el código (comentario de
  `COLUMNAS_DELTA_.SECCIONES` y de la rama del eslabón 3) y en `TOKENS.md` §5, con el aviso
  de que `periodo_ref` y `periodo_id` **parecen lo mismo y significan lo contrario**.
- **B.5 · `TOKENS.md` §5 reescrita.** Dejó de ser "las tres capas" con una nota que avisaba
  que estaban superadas: ahora son los cinco eslabones, con la tabla de los tres vacíos y la
  aclaración de que el eslabón 5 responde en vez de fallar.
- **Prueba:**
  - **Diff de configuración, antes y después: idénticos.**
    `cambiadas 0 · agregadas 0 · migraciones 0 · solo_en_hoja 7 · protegidas (con diferencia)
    0 · protegidas (sin diferencia) 8 · sin cambios: sí`. **La referencia se sostiene.**
  - **Control positivo nuevo, `probarSemanaR11_`, y son 8.** Cubre el caso de referencia del
    Addendum 1 (vie 24/07 → jue 30/07), que son **siete** días y no ocho, que cualquier día de
    esa semana devuelve la misma ventana, que el viernes siguiente abre una ventana nueva, el
    cruce de año, y que la hora de la corrida no mueve nada. Es puro: no toca la planilla —
    probar el eslabón 5 contra `CONFIG` exigiría vaciarlo, y el `P1` del diff ciego a los
    valores de `CONFIG` dice que ese cambio no lo ve ninguna verificación.
  - **La cadena, corrida por API:** `{}` → `config`; `{seccion_id:'portada'}` → la sección
    existe con `periodo_ref` vacío y **cae al eslabón siguiente**, `config`;
    `{seccion_id:'resumen_ejecutivo', periodo_ref:'m2_mensual'}` → **gana el marcador**,
    `periodo_ref:m2_mensual`; `{campana:'x', seccion_id:'portada'}` → **la campaña se evalúa
    primero**. Las tres precedencias que fija `D-20` Addendum 1, verificadas.
- **Medición de `D-01`: +235 / −31 líneas**, de las cuales `.gs` son `Fuentes.gs` +83,
  `Pruebas.gs` +54, `Instalar.gs` +30 y `Config.gs` +10. El renglón de "por qué hubo que
  tocar código": **la cadena de período es lógica de resolución, no configuración** — el
  eslabón nuevo y el default calculado no se pueden declarar en una hoja.
- **Pendientes/decisiones:**
  - **Corrección de una cifra propia, la segunda del día.** La entrada del `Paso-3-v3`
    Parte 0 dice *"En riesgo: 34 filas curadas (el handoff venía diciendo 35)"*. **Son 35**:
    el archivo termina sin salto de línea final y `wc -l` cuenta uno de menos. El handoff
    original tenía razón y la "corrección" estaba mal. Contado ahora por script sobre las
    líneas no vacías.
  - **`SECCIONES.periodo_ref` queda vacío en las 35 filas.** Cargar alguna es curaduría del
    usuario, y hasta que pase, el eslabón 3 no cambia ningún número — que es exactamente lo
    que se quiere de un cambio estructural.
  - **Paro acá**, como pide el prompt. Sigue la Parte C, el despachador en `Generador.gs`.

## Paso 3 (v3) Parte C — el despachador de marcadores (2026-08-03) — commit de esta entrada
- **Qué pedía:** `resolverMarcadores(informe_id, …)` en `Generador.gs`: leer las filas de
  `MARCADORES` del informe, resolver la ventana con la cadena de la Parte B, resolver
  `solapa` (`TOKENS.md` §4), pedir los datos a `Fuentes.gs` respetando `modo_periodo` —con la
  excepción de `digital`—, despachar la operación, aplicar `formato`, y devolver
  `{ marcador, valor, valor_formateado, estado, traza }` con `estado ∈ {ok, sin_datos,
  error}`. Con resiliencia y caché por `(base_id, solapa, desde, hasta)`.
- **Qué se hizo.** `Generador.gs` pasó de 9 líneas de encabezado a un despachador completo.
  Seis piezas, y ninguna hace aritmética —la regla de oro se respeta: acá se despacha, la
  cuenta vive en `Marcadores.gs`—:
  - `leerMarcadores_()` y `solapasFuenteDeBase_()`. La segunda **filtra por `uso = fuente`**,
    y no es cosmético: `m2/Cuentas` es hoy una solapa `ignorar` que sin embargo está mapeada
    (`P1` abierto), y contarla haría que una base de una sola solapa útil pareciera de dos.
  - `resolverSolapaDeMarcador_()` implementa `TOKENS.md` §4: declarada se usa, una sola
    fuente se infiere **y la traza lo dice**, varias fallan con `«FALTA:token@sin_solapa»`.
  - `formatearValorMarcador_()` — `numero`/`miles`/`porcentaje`/`fecha`/`texto`. **No cambia
    el valor:** el crudo viaja igual en el resultado, porque es lo que se audita.
  - `datosDeMarcador_()` con el **caché por corrida**. No es de módulo a propósito: uno de
    módulo sobreviviría entre corridas y devolvería datos de una ventana vieja sin decirlo.
  - La **excepción `digital`**: se pide a `filasDigitalDeEncuentro` (`Union.gs`) y no a
    `leerFuente`. Necesita el `id_cuenta` del ítem que se emite, que el despachador todavía
    no recibe —eso es del Paso 5—, así que hoy sale `error` **diciendo exactamente eso**, en
    vez de leer la solapa equivocada.
- **Prueba — corrido sobre `jm`, y los tres marcadores dan `error` con tres motivos
  distintos, cada uno correcto:**
  - `ecv_inscriptos` → `«FALTA:ecv_inscriptos@sin_solapa»`, porque **`rdv` tiene dos solapas
    fuente** (`RVD JM-CM - ES`, `RDV_otros_ministros`). Es exactamente el caso que
    `TOKENS.md` §4 marca con ⚠ y pide verificar antes de asumir base de solapa única. La
    regla dispara bien.
  - `camp_alcance` → la solapa **se infirió** (`resumen_metricas_dinamico`, única fuente de
    `looker`), la ventana resolvió, y falló en la operación: `calcAlcance` **no existe**. Es
    la medición del pendiente que dejó la Parte A — las tres filas de ejemplo de
    `MARCADORES` usan el estilo una-función-por-marcador y son inválidas bajo el `v3`.
  - `m2_envios` → `m2` tiene **cero** solapas fuente en `MAPEO`, consistente con lo que midió
    el `Paso-2.16` Parte A. Y su ventana salió por `periodo_ref:m2_mensual` →
    **2026-06-01–2026-06-30**: el segundo eslabón funcionando, que es el caso M2-mensual-
    dentro-de-informe-semanal que justifica toda la cadena.
  - `lecturas_cacheadas: 1`. **Los 9 controles pasan** (nuevo: `probarFormatoMarcador_`) y el
    diff de configuración sigue en `protegidas (con diferencia): 0`.
- **Medición de `D-01`: +332 / −7 líneas** (`Generador.gs` +297, `Pruebas.gs` +42). El
  renglón: **el despachador es código por definición** — es la pieza que traduce
  configuración en llamadas, y no hay forma declarativa de escribirla.
- **Pendientes/decisiones:**
  - **El despachador está bien y la configuración no alcanza.** Ningún marcador produce un
    número hoy, y eso es el resultado correcto: el motor no inventa. Lo que falta es
    `MARCADORES` cableado, que lo siembra el `Paso-2.5` (en pausa) y lo cablea a mano el
    corte vertical de la **Parte D**.
  - **Las tres filas de ejemplo de `MARCADORES` hay que reescribirlas o borrarlas**: sus
    `operacion` son del estilo viejo. Es trabajo de la Parte D, que las reemplaza por los 5-10
    tokens del corte vertical.
  - **`generarInforme(informeId, periodoId)`** queda declarada con `periodoId` **opcional**,
    como fija el Addendum 1 del `Paso-4`, y devolviendo "todavía no". La implementa el Paso 4.
  - **Paro acá.** Sigue la Parte D, el corte vertical, que es la prueba real de la Parte C.

## Paso 3 (v3) Parte D — `D.0` corrido, y **para** (2026-08-03) — commit de esta entrada
- **Qué pedía:** con la Parte D ya ampliada en el lugar, correr sólo `D.0.1`–`D.0.5`. Sólo
  lectura: no escribir hojas, no tocar `.gs`, no cargar filas de `MARCADORES`.
- **D.0.1 · Las tres filas de ejemplo, tal cual están. No se tocaron.**

  | marcador | familia | informe_id | base_id | solapa | campo_logico | periodo_ref | operacion | formato |
  |---|---|---|---|---|---|---|---|---|
  | `ecv_inscriptos` | ecv | `*` | rdv | *(vacía)* | inscriptos | | `calcInscriptos` | numero |
  | `camp_alcance` | camp | `*` | looker | *(vacía)* | alcance | | `calcAlcance` | miles |
  | `m2_envios` | m2 | jm | m2 | *(vacía)* | envios | `m2_mensual` | `calcEnvios` | numero |

  **Qué le falta a cada una:**
  - **Las tres:** su `operacion` no existe. `calcInscriptos`/`calcAlcance`/`calcEnvios` son
    del estilo una-función-por-marcador que la Parte A reemplazó. Para ser válidas necesitan
    una de las seis (`SUMA`, `CONTEO`, `ULTIMO`, `RATIO`, `PCT`, `TEXTO`) o el prefijo `FN:`
    con la función declarada en `FUNCIONES_PROPIAS_`, hoy vacío.
  - **`ecv_inscriptos`:** además le falta `solapa`. `rdv` tiene **dos** solapas fuente
    mapeadas, así que no hay inferencia posible.
  - **`camp_alcance`:** la solapa **sí** se infiere (`looker` tiene una sola mapeada). Sólo
    le falta la operación.
  - **`m2_envios`:** además le falta una solapa **que exista**. `m2` tiene una sola solapa
    fuente (`Cuentas M2`) y **no está en `MAPEO`**, así que hoy no hay ninguna a la que
    apuntar. Su `periodo_ref = m2_mensual` sí resuelve.
  - **Y las dos primeras usan `informe_id = '*'`**, que es la firma del cruce a medio
    resolver del `Paso-2.13` Parte 3. **Curarlas o retirarlas es decisión del usuario:**
    `MARCADORES` no tiene sembrador y esas filas las cargó una persona.
- **D.0.2 · Qué se puede cablear hoy.** Solapas `uso = fuente` **y** presentes en `MAPEO`:
  `rdv` **2** (`RVD JM-CM - ES` 15 campos, `RDV_otros_ministros` 1), `looker` **1**
  (`resumen_metricas_dinamico`, 27 campos), `digital` **6**, `m2` **0**.
  Confirmado que quedan fuera del corte: `digital` (necesita `id_cuenta`), `m2` (cero solapas
  mapeadas) y todo token por encuentro o por campaña.
  **Candidatos, con solapa explícita para `rdv`:**

  | token sugerido | base / solapa | campo_logico | operacion |
  |---|---|---|---|
  | inscriptos del período | `rdv` / `RVD JM-CM - ES` | `inscriptos` (K) | `SUMA` |
  | asistentes del período | `rdv` / `RVD JM-CM - ES` | `asistentes` (Q) | `SUMA` |
  | encuentros del período | `rdv` / `RVD JM-CM - ES` | `inscriptos` (K) | `CONTEO` |
  | % de asistencia | `rdv` / `RVD JM-CM - ES` | `asistentes/inscriptos` | `PCT` |
  | alcance | `looker` / *(inferida)* | `alcance` (K) | `SUMA` |

  Las dos últimas son las que más rinden: el `PCT` ejercita el `RATIO`, y dejar la solapa
  **vacía** en el de `looker` ejercita la inferencia, que ningún caso exitoso probó todavía.
- **⚠ Hallazgo que `D.0.2` anticipaba y quedó confirmado: el despachador NO soporta
  `RATIO`/`PCT`.** `resolverMarcadores` hace **un solo** `buscarMapeo` con el `campo_logico`
  entero, así que un `numerador/denominador` no resuelve. Verificado por API:
  `buscarMapeo('rdv','RVD JM-CM - ES','asistentes/inscriptos')` → *"falta MAPEO:
  rdv/RVD JM-CM - ES/asistentes/inscriptos"*. **Partir por `/` y hacer dos `buscarMapeo` es
  trabajo de `D.1`/`D.2`**, no un defecto de premisa — la Parte C nunca lo ejercitó porque
  ninguna fila de `MARCADORES` usa `RATIO`.
- **D.0.3 · Encabezados de las columnas candidatas: los ocho limpios.** Sin espacios dobles,
  sin saltos de línea, sin bordes con espacio. `rdv`: `Inscriptos` (K), `Asistentes` (Q),
  `FECHA` (E), `STATUS REUNIÓN` (I). `looker`: `mails_enviados` (N), `mails_aperturas` (P),
  `meta_alcance` (K), `nombre_campaña` (B). **`R-10` sigue sin implementar y hoy no muerde
  en estas ocho** — vale para estas columnas, no para siempre.
  *(Ojo al leer: los encabezados de `looker` no coinciden con el `campo_logico` que los
  mapea —`mails_enviados` vs `mail_enviados`, `meta_alcance` vs `alcance`—. Es correcto: son
  dos espacios de nombres distintos, y para eso existe `MAPEO`.)*
- **D.0.4 · La ventana del corte.** `resolverVentana({})` → **2026-06-26 → 2026-07-03**,
  `origen: 'config'`. **No es `R-11 (calculado)`**: `CONFIG` está cargado, así que el número
  del corte **no se va a mover solo con la fecha de corrida**. De `rdv/RVD JM-CM - ES`:
  1362 filas totales, **13 en ventana**, 709 excluidas por la lista blanca de `D-21`.
- **D.0.5 · El ítem de menú.** El que ya existe se llama **"Calcular corte vertical"**
  (`Codigo.gs:67`, submenú *Diagnóstico*, junto a las otras tres pruebas de uso diario) y
  apunta a `menuCorteVerticalRetiro2407_`, que lee **una fila de `rdv` cableada a mano**. El
  nuevo recorre `MARCADORES`, que es otra cosa. **No colisiona por nombre de función**, pero
  sí por nombre visible. Propuesta: el nuevo entra como **"Calcular marcadores de prueba"**
  justo debajo, y **el viejo pasa a "Calcular corte vertical (Paso 2.9E)"** para que se
  distingan — es un renombre de etiqueta en la tabla `MENU_`, no de función.
- **Prueba:** sólo lectura. No se escribió ninguna hoja, no se tocó ningún `.gs`, no se cargó
  ninguna fila de `MARCADORES`.
- **Pendientes/decisiones — `D.0.1` y `D.0.2` terminan en decisión del usuario:** qué se hace
  con las tres filas de ejemplo, y qué tokens se cablean. **Paro acá.**

## Paso 3 (v3) `D.1` — Parte 0 corrida, y **para** (2026-08-03) — commit de esta entrada
- **Qué pedía:** verificar las cinco premisas de `docs/Prompts/Paso-3-v3_D1.md` antes de
  ejecutar nada. Sólo lectura.
- **Veredicto: las cinco se sostienen. Ninguna vencida, y el control de `D.4` quedó anclado
  contra la base viva, no contra el documento.**
- **0.1 · La ventana cambió y el número viejo no servía.** `resolverVentana({})` →
  **2026-07-24 → 2026-07-30**, `origen: config`. Es la semana de `R-11`: viernes a jueves,
  siete días. De `rdv/RVD JM-CM - ES`: 1362 filas totales, **12 en ventana**, 709 excluidas
  por `D-21`. **Las 13 que reportó `D.0` eran de la ventana anterior** (26/06–03/07) y no
  sirven de referencia, como advertía el prompt.
- **0.2 · El ancla del control, verificada en vivo.** `encontrarFilaRdvDeReunion_` encuentra
  el encuentro en `rdv/RVD JM-CM - ES`:
  - `Figura` **Jorge Macri** · `EVENTO` **Encuentro Temático "Orden Público" – Eje Norte** ·
    `Barrio` **Belgrano** · `FECHA` **2026-07-28** · `STATUS REUNIÓN` **Realizada** ·
    **`Inscriptos` = 753**, que coincide dígito a dígito con el caso `V-05` de
    `docs/casos_validacion_2026-07-31.csv` (estado `exacto`).
  - **28/07 cae dentro de la ventana** (24/07 ≤ 28/07 ≤ 30/07). ✅
  - **Hay más de un encuentro en la ventana: 12.** (Sólo el 28/07 ya hay **3**.) Entonces el
    criterio de `D.4` queda fijado en la segunda rama que plantea el prompt: **la `SUMA` de
    `prueba_inscriptos` tiene que dar 753 o más**, no 753 exacto. Un 753 pelado sería
    sospechoso, no un acierto.
  - **Regalo del mismo renglón, y sirve de segundo control:** los cinco canales de esa fila
    son `Mail` 361 · `Call Center` 169 · `IVR` 43 · `RRSS` 180 · `Difusión` vacío, que
    **suman exactamente 753 = `Inscriptos`**. Es la misma identidad que verifica
    `cierraSuma` en el corte del `2.9E`, y da un control interno con número conocido para
    los cinco `prueba_insc_*`.
- **0.3 · Las tres filas de ejemplo, reportadas por última vez antes de retirarlas** (van al
  cuerpo del commit de la Parte B):

  | marcador | familia | informe_id | base_id | solapa | campo_logico | periodo_ref | operacion | formato | notas |
  |---|---|---|---|---|---|---|---|---|---|
  | `ecv_inscriptos` | ecv | `*` | rdv | | inscriptos | | `calcInscriptos` | numero | `* = compartido` |
  | `camp_alcance` | camp | `*` | looker | | alcance | | `calcAlcance` | miles | |
  | `m2_envios` | m2 | jm | m2 | | envios | `m2_mensual` | `calcEnvios` | numero | |

- **0.4 · Los siete campos de `rdv`, contra la hoja viva y no contra el seed: los siete
  están.** `inscriptos` K · `asistentes` Q · `insc_mail` L · `insc_cc` M · `insc_ivr` N ·
  `insc_digital` O · `insc_dif` P. **Ninguno falta.**
- **0.5 · `looker` sigue habilitando la inferencia.** Tiene **7** solapas `uso = fuente` en
  `SOLAPAS` pero **una sola mapeada** en `MAPEO`: `resumen_metricas_dinamico`. Es lo que
  hace posible dejar la solapa vacía en `prueba_alcance` y que se infiera. `alcance` está
  mapeado ahí, columna **K**.
- **Prueba:** sólo lectura. No se escribió ninguna hoja, no se tocó ningún `.gs`, no se
  retiró ni cargó ninguna fila de `MARCADORES`.
- **Pendientes/decisiones:** ninguna. **Paro acá.** Siguen los cuatro commits: addendum a la
  Parte C, retiro de las tres filas, `RATIO`/`PCT` en el despachador, y el cableado + menú.

## Paso 3 (v3) `D.1` — el corte vertical corrido: **11 de 11 en `ok`, y el control agregado NO cierra** (2026-08-03) — commit de esta entrada
- **Qué pedía:** los cuatro commits de `docs/Prompts/Paso-3-v3_D1.md`. Éste es el cuarto: el
  cableado de los once `prueba_*`, el ítem de menú, y `D.4` con sus controles.
- **Qué se hizo:** `MARCADORES_PRUEBA_` (`Pruebas.gs`) con los once, cargados por
  `cablearMarcadoresDePrueba_` → `curarMarcadores_`. Ítem **"Calcular marcadores de prueba"**,
  y el existente renombrado a **"Calcular corte vertical (Paso 2.9E)"**, que hace otra cosa.
- **El corte: `total 11 · ok 11 · sin_datos 0 · error 0 · lecturas_cacheadas 2`.** La cadena
  entera funciona de punta a punta por primera vez:

  | marcador | valor | qué ejercita |
  |---|---|---|
  | `prueba_inscriptos` | **2919** | `SUMA`, 12 filas, 12 con valor numérico |
  | `prueba_asistentes` | 686 | `SUMA` |
  | `prueba_insc_mail` | 1654 | `SUMA` — 9 de 12 con valor numérico |
  | `prueba_insc_cc` | 272 | `SUMA` — **2 de 12** |
  | `prueba_insc_ivr` | 43 | `SUMA` — **1 de 12** |
  | `prueba_insc_digital` | 874 | `SUMA` — 9 de 12 |
  | `prueba_insc_dif` | 22 | `SUMA` — **2 de 12** |
  | `prueba_encuentros` | 12 | `CONTEO` |
  | `prueba_asistencia_pct` | **23.5%** | `PCT` — traza: `RATIO asistentes (col Q)/inscriptos (col K) = 686/2919` |
  | `prueba_alcance` | 1.255.486 | `SUMA` sobre `looker` con **solapa inferida**, y la traza lo dice |
  | `prueba_fecha` | 24/07 al 30/07 | `TEXTO` |

  La traza dice de qué solapa salió cada número —y que la de `looker` fue **inferida**— y de
  qué eslabón salió la ventana (`config`, 24/07–30/07). El caché se usó **2** veces: `rdv` y
  `looker`, una lectura por base pese a los diez marcadores.
- **`D.4` · Control externo: CIERRA.** `prueba_inscriptos` = **2919 ≥ 753**
  (`Orden Público 28/07`, caso `V-05`, verificado dígito a dígito). Con 12 encuentros en la
  ventana el criterio fijado en `0.2` era "753 o más", y **no dio 753 exacto**, que se habría
  reportado como sospechoso.
- **`D.4` · Los dos controles internos, y hay que leerlos juntos:**
  - **Por fila — CIERRA.** La fila de Orden Público: `361 + 169 + 43 + 180 + vacío = 753`,
    exactamente sus `Inscriptos`. Verificado en la Parte 0 contra la base viva.
  - **Agregado — NO CIERRA.** Suma de los cinco `prueba_insc_*` = **2865** contra
    `prueba_inscriptos` = **2919**. **Diferencia: −54.** *(No se ajustó nada.)*
- **⚠ Y la regla "si cierra por fila y no en el agregado, el problema es del despachador" no
  aplica acá — el propio resultado la descarta.** Sumar columna por columna y después sumar
  las columnas es **idénticamente igual** a sumar fila por fila: la suma es conmutativa y
  asociativa. **No hay forma de que el despachador produzca un −54 acertando cada columna
  por separado.** Si el agregado no cierra, la identidad **no se cumple en todas las filas**,
  aunque se cumpla en la de Orden Público.
  **Y la traza dice dónde mirar:** `inscriptos` tiene **12 de 12** filas con valor numérico,
  pero `insc_cc` tiene **2**, `insc_ivr` **1**, `insc_dif` **2** y `insc_mail`/`insc_digital`
  **9**. O sea que en varias filas los canales están vacíos mientras `inscriptos` tiene
  número. **Las dos lecturas posibles, y no se decide acá:** o hay inscriptos que no vienen
  de esos cinco canales, o las celdas de canal están sin cargar. Es una pregunta sobre los
  datos, no sobre el motor.
  **Lo que falta para localizarlo** es ver las 12 filas y su identidad una por una; hoy
  ninguna función devuelve eso y **no se agregó una para tapar el hueco**.
- **`D.3` · La cadena de período, qué quedó ejercitado y qué no:**
  - **`CONFIG` — ejercitado.** Los once salieron con `origen: config`, 24/07–30/07.
  - **`SECCIONES.periodo_ref` (eslabón 3) — NO ejercitado**, como anticipaba el prompt: las
    35 filas lo tienen vacío y el vínculo marcador↔sección sigue sin resolver. **No se
    inventó una sección para la prueba.**
  - **La semana de `R-11` (eslabón 5) — ejercitada por control unitario, no vaciando
    `CONFIG`.** `probarSemanaR11_` cubre el caso de referencia (vie 24/07 → jue 30/07, siete
    días) y los bordes. Vaciar `CONFIG` en la planilla viva para probar habría entrado
    justo en el `P1` del diff ciego a los valores de `CONFIG`: nadie habría visto el cambio.
  - **`campaña` (eslabón 1) — no ejercitado**: ningún `prueba_*` pertenece a una campaña.
- **`prueba_asistencia_pct` = 23,5 %** es el número que faltaba: cierra el hueco de `RATIO`
  que encontró `D.0` y que la Parte C de este prompt implementó.
- **Prueba:** **las 10 pruebas de `Pruebas.gs` pasan** y el diff de configuración sigue en
  `cambiadas 0 · protegidas (con diferencia) 0 · sin cambios: sí`.
- **Pendientes/decisiones:**
  - **El −54 queda abierto y sin tocar**, como pide el prompt: *"si no cierra, no ajustar
    nada"*.
  - **`P2` nuevo en `PENDIENTES`: la inferencia de solapa de `looker` es frágil.**
    `solapasFuenteDeBase_` cruza `fuente` ∩ *mapeada*, y `looker` tiene 7 solapas `fuente`
    pero **una sola mapeada**. La inferencia funciona **porque `MAPEO` está incompleto**, no
    porque la base tenga una solapa: el día que alguien mapee una segunda, `prueba_alcance`
    pasa a fallar sin que nadie lo haya tocado.
  - **Los once `prueba_*` siguen cargados**, porque son el insumo de la prueba del usuario.
    Se retiran con `retirarMarcadoresDePrueba_()` al cerrar la Parte D.

## Doc — el −54 del corte: lo que se pudo medir, y el censo que no se pudo (2026-08-03) — commit de esta entrada
- **Qué pedía `docs/Prompts/Pedido_diferencia_54_canales_rdv.md`:** censar las 12 filas de
  `rdv/RVD JM-CM - ES` de la ventana una por una, distinguiendo **celda vacía**, **cero
  explícito** y **texto no numérico** —que `SUMA` saltea igual pero significan cosas
  distintas—, anotar la pregunta al equipo, y documentar tres cosas en la bitácora. Sólo
  lectura: *"No toca `.gs` ni escribe hojas"*.
- **⚠ El censo de la Parte 0 NO se pudo producir, y el motivo es de instrumentos.** Leer las
  filas de una base exige una de dos cosas, y el prompt cierra las dos puertas a propósito:
  agregar una función al motor (prohibido: *"el censo se reporta, no se instala"*) o leer la
  base por afuera. **Se intentaron las tres rutas independientes y las tres fallan:**
  `htmlview` **404**, `gviz/tq?out:csv` **404**, Drive API `files/export` **403 — "the user
  has not granted the app read access to the file"**. La causa es el **alcance del token**:
  `drive.file` + `drive.metadata.readonly`, sin `drive.readonly`. Por eso `files.get`
  responde y `files.export` no. **No se agregó ninguna función y no se tocó ningún `.gs`.**
  Queda como `P1` nuevo en `PENDIENTES`, porque es más grande que este censo: **sobre las
  cuatro bases hay un solo camino de lectura, el motor**, y una verificación que use ese
  camino confirma el motor consigo mismo.
- **Parte A · La pregunta al equipo, anotada** en `PENDIENTES` → "Preguntas al equipo", **sin
  marcarla como bloqueo**: ¿`inscriptos` es siempre la suma de los cinco canales, o hay
  inscriptos que no vienen de ninguno? Con las dos lecturas escritas —faltan datos, o la
  identidad no vale siempre y `cierraSuma` del `2.9E` es válido por fila pero no como regla
  general—. Queda dicho que **le falta su respaldo**: el censo fila por fila.
- **Parte B · Lo que sí queda documentado:**
  - **El control agregado no cerró: −54 sobre 2919, un 1,8 %.** Descartado el motor: sumar
    cada columna y después sumar las columnas es idéntico a sumar fila por fila. Hallazgo
    abierto sobre los datos de `rdv`.
  - **Cobertura por canal en la ventana** — el dato más útil que dejó el corte, y **la
    primera medición de cuán completa está esa base**: `insc_mail` **9** de 12 filas con
    valor numérico, `insc_digital` **9**, `insc_cc` **2**, `insc_ivr` **1**, `insc_dif`
    **2**, contra `inscriptos` **12 de 12**. *(Lo que este conteo **no** distingue es
    justamente lo que pedía el censo: vacía, cero explícito y texto se cuentan igual.)*
  - **`prueba_alcance = 1.255.486` es una lectura correcta de la pregunta equivocada, y esto
    no estaba escrito en ningún lado.** `looker.fecha_periodo` es la fecha de **inicio de
    campaña**, y las campañas arrancan días antes del encuentro: la ventana devuelve las
    campañas que **empezaron** entre el 24 y el 30, no el alcance de los encuentros de esos
    días. **Es la razón concreta de dos decisiones que hasta hoy se sostenían por otros
    argumentos:** por qué los `camp_*` se cablean contra `digital` y no contra `looker`, y
    por qué `digital` quedó en **`snapshot`** en el `Paso-2.3` —el recorte por período lo
    hace el agregador vía el link campaña↔encuentro, no una ventana de fecha cruda—.
- **Prueba:** ninguna, es sólo lectura. No se corrigió ninguna celda de `rdv`, no se retiró
  ningún `prueba_*`, no se tocó ningún `.gs`.
- **Pendientes/decisiones:** el censo queda pendiente de una de dos decisiones del usuario —
  ampliar el alcance del token con `drive.readonly`, o autorizar una función de diagnóstico
  en el motor—. **Ninguna de las dos la toma Code.**

## Pedido ventana m2 (v2) — Parte 0 corrida, y **para**: una premisa vencida (2026-08-03) — commit de esta entrada
- **Qué pedía:** verificar las seis premisas de `docs/Prompts/Pedido_ventana_m2_y_cableado_mail.md`
  (v2) antes de escribir la `R-NN`, la fila de `MAPEO` y el cableado de `digital`. Sólo
  lectura.
- **Veredicto: cinco se sostienen y una está VENCIDA — la `0.2`, que es la que justifica toda
  la Parte B.**
- **0.1 · La original y su espejo, sin tocar. ✅** `digital/Directa Mail` sigue
  **`uso = fuente`** (notas: *"canales de directa"*) y `m2/Directa mail` sigue
  **`uso = derivada`** (notas: *"espejo de digital/Directa Mail — ver Paso 2.10 Parte C"*).
  **No se reclasificó ninguna.**
- **⚠ 0.2 · VENCIDA. La fila que la Parte B quiere agregar YA EXISTE.** En la hoja viva,
  `digital/Directa Mail` tiene **las dos**: `mail_fecha → F` (sin notas) y
  **`fecha_periodo → F`**, con la nota *"fecha_periodo elegida en DIAG_FECHAS (Paso
  2.3.1/2.3.2)"*. O sea que la promoción ya se hizo en el `Paso-2.3.x` y **la Parte B se
  queda sin objeto**. Lo confirma además la bitácora del `Paso-2.16`, que ya lo había dicho:
  *"(b) `fecha_periodo` — ya existía, en la solapa correcta: `digital/Directa Mail` columna
  F, promovida en el Paso 2.3.x"*.
  **Se para acá y no se edita nada** (`CLAUDE.md` §4: una premisa vencida se reporta antes de
  la primera edición). Lo que sí queda por decidir es si `mail_fecha` —la fila vieja, misma
  columna, sin consumidor— se deroga o se deja; eso el pedido no lo contempla.
- **⚠ 0.3 · No se puede medir con los instrumentos de hoy, y es el mismo bloqueo del censo
  de `rdv`.** Contar filas con fecha fuera de rango plausible en `digital/Directa Mail` col F
  exige leer las filas de la base, y **las tres rutas independientes fallan por alcance del
  token** (`P1` anotado hoy). El instrumento del motor tampoco sirve acá: `digital` es
  `snapshot`, así que `leerFuente` **devuelve antes del bucle de fechas** y
  `filas_sin_fecha`/`filas_fecha_invalida` dan 0 sin haber mirado nada — medido:
  `columna_fecha: null`. **El último dato conocido es del 02/08** y está en `PENDIENTES`:
  *2079 filas con fecha, todas de 2026, y 35 sin fecha; ninguna anómala*. No se pudo
  confirmar contra hoy.
- **0.4 · El filtro de estado, confirmado y medido hoy. ✅** `digital/Directa Mail/mail_estado`
  → columna **D**, `valores_incluidos = "Implementado, En curso"`. Sobre **2137** filas:
  **excluye 49** —`Proyectado` **38**, vacío **11**— y **entran 2088**.
  `valores_declarados_sin_filas` vacío: ningún tipeo.
  *(Los números del `Paso-2.16` eran 2114 / 41 excluidas —30 `Proyectado`, 11 vacío—. La base
  creció 23 filas y `Proyectado` subió de 30 a 38 en un día: la base es viva, como se
  esperaba.)*
- **0.5 · `digital` sigue `snapshot`. ✅ No se cambió.** `BASES.digital.modo_periodo =
  snapshot`, `hoja_default = Digital`.
- **0.6 · Inventario de `MAPEO` para `digital`, desde la hoja viva.** **8** solapas
  `uso = fuente`, de las cuales **6 están mapeadas**, con **59 campos** en total:
  `Digital` 15 · `Directa IVR` 13 · `Directa Mail` 12 · `Directa SMS` 8 ·
  `Seguimiento digital` 8 · `Alcance` 3. **`Cuentas` y `CAMPAÑAS_DESGLOCE_DIGITAL` son
  `fuente` y no tienen ni un campo mapeado.** Las seis mapeadas ya tienen su `fecha_periodo`
  declarado (`Digital` E, `Directa IVR` D, `Directa Mail` F, `Directa SMS` D,
  `Seguimiento digital` L; `Alcance` no).
- **Prueba:** sólo lectura. No se tocó `.gs`, no se escribió ninguna hoja, no se reclasificó
  ninguna solapa, no se cambió `modo_periodo`.
- **Pendientes/decisiones:** **la Parte B no tiene objeto** y hay que decidir qué hacer con
  `mail_fecha`. La `0.3` queda sin confirmar hasta que se resuelva el `P1` del alcance del
  token. Las Partes A, D y E no se tocaron: **paro acá**.

## Censo del −54 — **cerrado: son dos filas sin canales cargados** (2026-08-04) — commit de esta entrada
- **Qué pedía** la Parte D del `Addendum_2026-08-03_deroga_mail_fecha.md`: censar las 12
  filas con una función **temporal** que lea `getValues()` crudo, distinguiendo los tres
  casos que `leerFuente` colapsa.
- **Por qué crudo, y era el punto:** `leerFuente` normaliza, y al normalizar **borra la
  diferencia** entre celda vacía, cero explícito y texto no numérico — `opSUMA` saltea las
  tres igual y en la traza salen idénticas. Leer crudo además no pasa por `modo_periodo` ni
  por la lista blanca de `D-21`: el censo filtra por fecha y por `status` a la vista.
- **El resultado, y no deja lugar a dudas:**

  | | |
  |---|---|
  | filas en la ventana | **12** |
  | **cierran exacto** | **10** |
  | quedan cortas | **2** |
  | **quedan largas** | **0** |
  | total `inscriptos` | 2919 |
  | total canales | 2865 |
  | diferencia | **−54** |

  **Las dos que no cierran son las dos que tienen los cinco canales vacíos**, y su faltante
  es exactamente el total: `Mataderos 29/07` **34** con canales en 0 (−34) y `Palermo 29/07`
  **20** con canales en 0 (−20). **34 + 20 = 54.** No hay ninguna otra fuente de diferencia
  en la ventana.
- **Y el dato que el censo venía a buscar: no existe en estos datos.** De las 36 celdas de
  canal que no aportan, **las 36 son vacías**. **Cero ceros explícitos, cero textos no
  numéricos.** La distinción está implementada y acá no discrimina nada — lo cual, para
  este caso, es la mejor respuesta posible: no hay ambigüedad de tipo, hay ausencia.
- **Cobertura por canal, ahora con los tres casos separados:** `mail` 9 número / 3 vacías ·
  `digital` 9 / 3 · `cc` 2 / 10 · `ivr` 1 / 11 · `dif` 2 / 10. Ninguno con cero explícito ni
  con texto.
- **Consecuencia sobre una regla, y es la parte que más rinde:** la identidad
  `inscriptos = mail + cc + ivr + digital + difusión` **se sostiene en las 10 filas que
  tienen algo cargado**. Entonces `cierraSuma` del `Paso-2.9E` **sí es una regla general**,
  no sólo una verificación válida por fila — que era la lectura (2) que el pedido planteaba
  como alternativa. **Queda descartada.**
- **La pregunta al equipo, anotada en `PENDIENTES` y achicada** por el censo: no es "¿vale la
  identidad?" sino "**esas dos filas tienen inscriptos y ningún canal cargado: ¿falta
  cargarlos, o entraron por una vía que no es ninguno de los cinco?**". **Sin marcarla como
  bloqueo.**
- **Prueba:** sólo lectura. **No se corrigió ninguna celda de `rdv`.** `censoCanalesRdv_`
  está marcada ⏳ **TEMPORAL** y se retira junto con los `prueba_*`.
- **Pendientes/decisiones:** ninguna nueva.

## Pedido ventana m2 (v2) — Partes A, D y E (2026-08-04) — commit de esta entrada
- **Parte A · `R-13` escrita** en `docs/REGLAS_NEGOCIO.md`. Número greppeado en todo el repo
  antes de asignarlo (`R-01`…`R-12` ocupados). Fija que **los `m2_*` no llevan `periodo_ref`
  propio**: caen al eslabón 4 o al 5 de la cadena, con la ventana de `R-11` —siete días,
  viernes a jueves, inclusive—. Y deja escrito **antes de que pase** que el equipo trabaja de
  viernes a viernes, ocho días, así que **los números del motor van a diferir de los
  publicados** por las filas del viernes de cierre: es conocido y deliberado, no un bug. Con
  el corolario de qué NO hacer con esa diferencia — no ajustar la ventana para que cierre, no
  hacer un caso especial para `m2_*`, no validar `CONFIG` contra los siete días.
- **Parte D · Cableado de `MARCADORES` contra `digital`: 9 filas, y las 9 fallan a
  propósito.** Verificado: las nueve salen `«FALTA:<token>@digital_sin_cuenta»`.
  `resolverMarcadores('jm')` da ahora `total 20 · ok 11 · error 9` — los 11 `ok` son los
  `prueba_*`, que siguen andando.

  | marcador | solapa | campo_logico | operacion |
  |---|---|---|---|
  | `enc_mails_entregados` | Directa Mail | `mail_entregados` | `ULTIMO` |
  | `enc_aperturas` | Directa Mail | `mail_aperturas` | `ULTIMO` |
  | `enc_or` | Directa Mail | `mail_or` | `ULTIMO` |
  | `enc_ctor` | Directa Mail | `mail_ctor` | `ULTIMO` |
  | `enc_impresiones` | Digital | `dig_impresiones` | `ULTIMO` |
  | `enc_atendidos` | Directa IVR | `ivr_atendidos` | `ULTIMO` |
  | `enc_e75` | Directa IVR | `ivr_e75` | `ULTIMO` |
  | `enc_e75_pct` | Directa IVR | `ivr_e75_pct` | `ULTIMO` |
  | `enc_marque1` | Directa IVR | `ivr_marque1` | `ULTIMO` |

  **Solapa siempre explícita** —`digital` tiene 6 mapeadas, no hay inferencia—, `informe_id`
  `jm`, y **`ULTIMO` en todas**: los `*_pct`/`*_or`/`*_ctor` **ya vienen calculados en la
  base** y no se recalculan con `PCT`, y para el resto la operación correcta es **la fila
  única, no `SUMA`** (`VALIDACION` §3.3, el caso `enc_mails_enviados` con factor 6,17 entre
  el envío y la suma de la cuenta).
- **⚠ Lo que NO se cableó, y el motivo de fondo apareció al verificar contra la plantilla.**
  Se midió con `mapaDeTokens_` qué `enc_*` existen hoy en la canónica de JM: **21**. Tres
  grupos quedaron afuera:
  1. **No existen en la lámina** — `enc_llamados`, `enc_atendidos_pct`, `enc_marque1_pct`.
     Cablearlos crearía filas huérfanas.
  2. **El nombre va a cambiar al armonizar, y acá está el cruce del `Paso-2.13` Parte 3 visto
     desde el cableado.** La plantilla **no está armonizada**, así que hoy dice `enc_clics`
     donde el canon dice `enc_clics_ctor`; `enc_mails_enviados` está hoy en la caja de
     **Audiencia de IVR** y no en la de mails enviados; y `enc_audiencia` es hoy **alcance de
     pauta**, que se renombra a `enc_alcance`. **Cablear con el nombre canónico deja las filas
     rotas hasta que se armonice; cablear con el de hoy las rompe después. No hay opción
     correcta mientras la plantilla esté a medio camino**, así que se dejaron sin cablear.
  3. **Ambigüedad de origen** — `enc_alcance` tiene dos candidatos en `digital`
     (`Digital/dig_alcance` y `Alcance/alc_alcance`) y `TOKENS.md` no dice cuál. **No se
     decidió solo**, como pide el pedido.
- **Parte E · Los pendientes, anotados en `PENDIENTES`:** el `P1` de los `enc_*` de `digital`
  sin número hasta el Paso 5 —con los tres grupos de arriba— y el `P2` de
  `digital/Cuentas` y `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, que son `fuente` y **no tienen ni
  un campo mapeado**. **No se abrió ese mapeo**: `PLAN.md` §2 fija que las solapas que falten
  se ajustan **después** de la primera prueba de punta a punta. *(Los otros dos pendientes que
  el pedido pide —la fecha de generación sin operación que la produzca, y `m2/Directa mail`
  sin usarse— ya estaban anotados el 03/08 y no se duplicaron.)*
- **Prueba:** **las 10 pruebas pasan** y el diff sigue en `cambiadas 0 · protegidas (con
  diferencia) 0 · sin cambios: sí`. `MARCADORES` queda en **20 filas**: 11 `prueba_*` + 9
  `enc_*`. No se cambió `modo_periodo` de `digital`, no se reclasificó `m2/Directa mail`, no
  se retiró ningún `prueba_*`.
- **Pendientes/decisiones:** ninguna nueva más allá de las anotadas.

## Corrida nocturna — punto 1: destrabar el anclaje (2026-08-04) — commit de esta entrada
- **Qué pedía:** que `verificarPrecondicionAnclaje_` cuente duplicados de `R-01` sólo sobre
  las filas que el emparejador mira, leyendo la lista blanca de `MAPEO.valores_incluidos` y
  no un literal. Y si la precondición pasa, correr `anclarEncuentros()`.
- **Qué se hizo:** la verificación filtra ahora con `filtrosValoresIncluidos_` /
  `filaPasaListaBlanca_` (`Fuentes.gs`), **el mismo par que usa `leerFuente`** — no un
  normalizador nuevo, no un valor cableado. Devuelve además `filas_consideradas`,
  `filas_excluidas_por_valor` y, si algún grupo queda duplicado, **el grupo entero**
  (figura, fecha, evento, barrio, status y número de fila de la planilla).
- **El número:** **653 filas consideradas · 709 excluidas · 0 grupos duplicados.** 653 + 709
  = 1362, idéntico al reparto que había medido `D-21` el 03/08. **La precondición pasa.**
- **`anclarEncuentros()` corrió por primera vez:** ventana `2026-07-24 → 2026-07-30`
  (origen `config`, siete días, viernes a jueves), umbral `0,6`, **5 encuentros anclados, 0
  sin link, 0 en baja confianza**. Las cuentas: San Cristóbal → `3354-JULJDGAG` (0,82),
  Retiro → `3346-JULJDGAG` (0,77), Orden Público → `3347-JULJDGAG` (0,77), y otra vez San
  Cristóbal y Retiro por la segunda etapa de cada uno.
- **⚠ Dos cosas que sólo aparecen cuando la función corre de verdad**, y las dos estaban
  tapadas por la precondición que fallaba antes:
  1. **`unirDigitalPorCuenta` no volvía nunca.** Resolvía **cinco `buscarMapeo` por fila**
     sobre ~1300 cuentas, y `buscarMapeo` **no cachea**: cada llamada relee `SOLAPAS` y
     `MAPEO` enteras con `getDataRange()`. Son ~13.000 lecturas de la planilla de control y
     se comen los 6 minutos de Apps Script. Las columnas de dimensión se resuelven ahora
     **una vez, fuera del bucle**: de `>5,5 min` (timeout) a **27,5 s**, 740 cuentas.
     *No se tocó `buscarMapeo`*: cachear `leerMapeo`/`leerSolapas` a nivel módulo es la
     solución de fondo, pero `Instalar.gs` escribe esas hojas y las relee en la misma
     corrida, así que un caché sin invalidación rompería el sembrador. Queda anotado.
  2. **`catalogoBarriosDesdeBase_` (`Parseo.gs`) estaba roto desde siempre.** Llamaba
     `getDataRange()` sobre el **sobre** que devuelve `abrirHoja` (`{ ok, base, libro, hoja }`)
     en vez de sobre `.hoja`. Nunca se había visto porque `anclarEncuentros()` moría antes.
     Corregido, y el fallo se devuelve ahora como catálogo vacío **con motivo** en vez de
     apagar el score de barrio en silencio.
- **`tools/api.js` pasa de `fetch()` a `node:https`.** undici corta a los **300 s**
  esperando headers y devuelve un `fetch failed` pelado, sin status, indistinguible de una
  caída de red — que es exactamente cómo se leyó el primer timeout. El tope quedó en 9 min,
  arriba del límite de ejecución de Apps Script, y los redirects se siguen a mano.
- **Prueba:** **las 10 pruebas de `Pruebas.gs` pasan.** Se retiró el cronómetro temporal que
  se usó para bisecar; queda `resumenAnclaje_`, que devuelve el diagnóstico chico (el ítem
  de menú arma el suyo con los encuentros enteros adentro y no vuelve por `/dev`).
- **Pendientes/decisiones:** el caché de `buscarMapeo` queda sin hacer, con el motivo
  escrito arriba.

## Corrida nocturna — punto 2: armonización de JM (2026-08-04) — commit de esta entrada
- **Autorización:** explícita del usuario, 04/08/2026, puntual y fechada. **`C-01` no se
  tocó**: la regla sigue diciendo lo que dice.
- **Sólo `jm`.** No se corrió `armonizarPlantillas()`, que itera todos los informes, sino
  `armonizarPresentacion_('jm', …)` directo. **SECCO no se tocó.**
- **1 · El reporte del filtro, antes de escribir nada** (`previsualizarArmonizacion('jm')`):
  **21 renombres declarados · 5 dentro · 16 fuera**, los 16 de la slide 10, la lámina
  congelada, con testigo `m2_salud_camp` verificado en esa slide. **0 conflictos, 0 sin
  ocurrencias.**
- **2 · Backup:** `JM_marcada — backup 2026-08-04 13:49`, id
  `1VWs5KzvLIStIao5Hx8PQypGQJv6Der0gSjO1QrRwAUU`, en `_backups`. No abortó.
- **3 · Armonización.** Los 5 renombres de la Parte A, **una ocurrencia cada uno**:
  `enc_audiencia`→`enc_alcance`, `enc_audiencia_pct`→`enc_alcance_pct`,
  `enc_clics`→`enc_clics_ctor`, `enc_audiencia_ivr`→`enc_base_total`,
  `rrss_prom`→`rrss_prom_general`. La Parte B: **10 cajas corregidas en la slide 5** —
  estaban rotadas una posición, y "Marque 1" tenía el literal `135`—, **2 en la slide 6**
  ("Mails Enviados" traía `{{enc_audiencia_pauta}}` y "Audiencia" traía
  `{{enc_mails_enviados}}`: cruzadas), y **las dos líneas de IVR agregadas**, una en cada
  slide. En la slide 10, **32 elementos fuera del canvas eliminados**; la caja huérfana de
  M2 dio **0 candidatas** — `eliminarCajaHuerfanaM2Salud_` mira `getShapes()`, que no ve
  dentro de tablas ni grupos, y los tokens de esa slide son justamente invisibles a ese
  recorrido. No se forzó nada.
- **4 · El antes y el después, medido con `mapaDeTokens_` sobre la plantilla viva:**

  | | antes | después |
  |---|---|---|
  | tokens distintos | 191 | **195** |
  | en forma suelta (lo que ve el conteo viejo) | 158 | 162 |
  | invisibles al conteo viejo | 33 | 33 |
  | slides | 22 | 22 |

  **Desaparecen 5** (`enc_audiencia_ivr`, `enc_audiencia_pauta`, `enc_audiencia_pct`,
  `enc_clics`, `rrss_prom`) y **aparecen 9** (`alcance`, `ecv_insc_ivr`,
  `ecv_insc_ivr_pct`, `enc_alcance`, `enc_alcance_pct`, `enc_base_total`,
  `enc_clics_ctor`, `ivr_marque1`, `rrss_prom_general`). `enc_audiencia` **sigue estando**,
  y es lo correcto: la Parte A lo renombró a `enc_alcance` y la Parte B lo volvió a
  escribir en la caja de Audiencia de IVR — el orden que `TOKENS.md` §1 marca como
  obligatorio.
- **✅ La slide 10 no perdió tokens.** Los 32 elementos borrados no tenían ninguno: no hay
  un solo `m2_*` en la lista de desaparecidos. Era la verificación que más importaba,
  porque la limpieza borra por posición (`top < 0`) sin mirar contenido.
- **Lo que quedó afuera por el filtro:** los **16 renombres `m2_*` de la slide 10**, íntegros
  y por diseño. La lámina sigue congelada.
- **5 · Cableado de lo que se destrabó — 4 filas nuevas en `MARCADORES`** (20 → **24**),
  vía `curarMarcadores_`, las cuatro `informe_id = jm`, `base_id = digital`, `ULTIMO`:

  | marcador | solapa | campo_logico | formato |
  |---|---|---|---|
  | `enc_clics_ctor` | Directa Mail | `mail_clics` | numero |
  | `enc_mails_enviados` | Directa Mail | `mail_enviados` | numero |
  | `enc_audiencia` | Directa IVR | `ivr_audiencia` | numero |
  | `enc_alcance` | Digital | `dig_alcance` | miles |

  `ULTIMO` en las cuatro, por el mismo motivo del 03/08: la fila es única y `SUMA` sobre la
  cuenta da el factor 6,17 que documenta `VALIDACION` §3.3.
- **La decisión que se tomó sola:** `enc_alcance` tenía dos candidatos en `digital`
  —`Digital/dig_alcance` y `Alcance/alc_alcance`— y `TOKENS.md` no dice cuál. Se eligió
  **`Digital/dig_alcance`**, por coherencia con `enc_impresiones`, que ya sale de esa misma
  solapa y de la misma fila. Es la opción reversible: cambiarla es **una celda**. Queda
  anotada para revisar con el informe en la mano.
- **Lo que sigue sin cablear, y por qué:** `enc_alcance_pct` es alcance sobre población, y
  población está en `rdv` — `PCT` opera dentro de una sola base y solapa, así que hoy no
  hay operación que lo produzca. `enc_base_total`, `enc_base_llamada`, `enc_ll_efectivos`
  (+`_pct`), `enc_ll_contactados` (+`_pct`) son de **call center**, que no tiene solapa en
  `digital`. `enc_alcance_potencial` no tiene origen identificado.
- **Prueba:** `resolverMarcadores('jm')` da **total 24 · ok 11 · error 13**. Los 11 `ok` son
  los `prueba_*`; los 13 `enc_*` fallan **todos** con `«FALTA:…@digital_sin_cuenta»`, que es
  el error esperado hasta que el Paso 5 pase el `id_cuenta`. **Las 10 pruebas pasan.**
- **Pendientes/decisiones:** la elección de solapa de `enc_alcance` (arriba).

## Paso 4 ✅ — motor de reemplazo (tokens fijos) + registro de corrida (2026-08-04) — commit de esta entrada
- **Parte A · las premisas, verificadas y anotadas** (sin parar, como fija la corrida
  nocturna): `A.1` los dos `plantilla_id` siguen cargados; `A.2` `CONFIG.carpeta_salida` =
  `1LAEVlWZ…`; `A.3` la firma real de `resolverMarcadores` leída antes de escribir `B.2`;
  `A.4` todo corre por API. **Y una premisa que mejoró sola:** `CONFIG.periodo_hasta` ya no
  es `03/07` — hoy la ventana es `24/07 → 30/07`, siete días viernes a jueves, la de `R-11`.
- **`A.5` · Hojas nuevas `CORRIDAS` y `FALTANTES`**, declaradas en `HOJAS_CONFIG_` como
  cualquier otra. `CORRIDAS` es append (`D-07`, es un insumo y no un log); `FALTANTES` **se
  pisa** en cada corrida (`D-12`): es la lista de trabajo de lo que falta cablear.
- **`A.6` · `retirarMarcadoresDePrueba_()` corrido antes de la primera generación:** 11
  filas retiradas, `MARCADORES` queda en **13**, los 13 `enc_*`.
- **`B.3` · El mapa `token → objectId` se toma ANTES de reemplazar**, que es lo único
  irreversible del paso: cuando `{{ecv_total}}` pasa a ser "1.234" el token deja de existir.
  Reusa `piezasDeTextoDeSlide_` (`Armonizar.gs`), que baja a **tablas y grupos** —
  `getShapes()` no ve 33 tokens de JM—, y a esa función se le agregó `objectId`. Para una
  celda de tabla el id es el de la **tabla**, porque una celda no tiene id propio; por eso
  el `contenedor` guarda fila y columna.
- **`B.5` · El período se imprime inclusive en los dos extremos:** `vie 24/07 — jue 30/07`.
  Y sale del período que **efectivamente se usó**, con `calculado` marcado en el reporte —
  no en la lámina— según lo ponga el eslabón 5 de `resolverVentana`, no comparando strings.
- **`periodo_id` sólo pisa la cadena de `D-20` si viene.** Sin él, **no** se le fija la
  ventana al despachador, para que un marcador con `periodo_ref` propio siga usándolo. Con
  él, se le fija: eso es lo que significa un override explícito.
- **✅ El archivo salió.** `1ptnV_7ifxwq7KOopuYtMVD29k0SfGsoIoA522itZ-Q0` —
  *Informe semanal JM — vie 24/07 — jue 30/07*, en la carpeta de salidas. **195 tokens en la
  plantilla · 1 reemplazado (`periodo`) · 194 en `«FALTA»`.** Feo y real, que es lo que
  pedía la noche.
- **⚠ El dueño del deck es `jpcofanogcba1@gmail.com`**, la cuenta que ejecuta — **no**
  `reporteseinformesgcba`, aunque el archivo esté dentro de la carpeta de reportes. Drive no
  transfiere propiedad por ubicación; es la pieza abierta de `D-03` que este paso no
  resuelve y que había que medir.
- **El mapa entra en la celda:** 16.288 caracteres contra un tope de 45.000. **No hizo falta
  partirlo a una hoja aparte**, que era la alternativa que `A.5` dejaba prevista.
- **Control de la etapa 2 — corrido y pasa.** `verificarObjectIdDeCorrida_` toma un token
  del mapa, abre el deck y devuelve el texto que hay hoy en ese `objectId`. `periodo`
  resuelve en sus dos ubicaciones (slide 1: `vie 24/07 — jue 30/07`; slide 5, dentro de un
  título más largo) y `enc_alcance` en la slide 6 con su `«FALTA:enc_alcance»`. **`D-06`
  etapa 2 tiene insumo utilizable**, y eso se sabe hoy y no en tres meses.
- **Prueba:** las 10 pruebas pasan.
- **Pendientes/decisiones:** el dueño del deck (arriba).

## Paso 5 ✅ — secciones repetibles, y `digital` deja de estar mudo (2026-08-04) — commit de esta entrada
- **Parte 0, verificada y anotada:**
  - **`0.1` · `CAMPANAS` vivo: 3 filas, las tres de `secco`.** Los `tipo` reales son
    `destacada`, `encuentro_ministros`, `proveedor` — la lista del prompt **original** del
    Paso 5, no la de `Instalar.gs` (`campana`, `ministros`, `proveedor`). **`tipo` sigue sin
    ningún lector en el repo**, greppeado hoy: no ganó consumidor.
  - **`0.2` · `periodo_id`: las tres siguen vacías**, así que con `D-19` ninguna campaña se
    emitiría. **Y hay algo más fuerte que eso:** las tres son de `secco`, **ninguna de
    `jm`**, así que para el informe de esta noche la expansión por campaña **no tiene
    objeto** con `periodo_id` o sin él. La `0.2` decía "parar"; la corrida nocturna manda
    anotarlo y seguir. Anotado.
  - **`0.4` · No hizo falta inventar la convención: ya estaba declarada.** `SECCIONES` tiene
    `modo = repetible`, `itera_sobre` y `familia_tokens`, y para `jm` hay tres secciones
    activas: `encuentro` (itera `REUNIONES`, familias `ecv_,enc_`), `comunicaciones_post`
    (`REUNIONES`, `post_`) y `campana` (`CAMPANAS`, `camp_`). Es **exactamente** lo que la
    Parte A pedía preferir: un rango declarado en una hoja de registro, no una marca en el
    deck. **El bloque modelo se deriva** de en qué slides viven los tokens de la familia —
    misma idea que el filtro de láminas congeladas de `Armonizar.gs`, que también deriva su
    corte del inventario en vez de una lista a mano.
- **Qué se construyó:** `duplicarBloquesRepetibles_` duplica el bloque modelo una vez por
  ítem **sin reemplazar nada** —la separación es a propósito: `B.3` exige tomar el mapa antes
  del primer reemplazo, y las copias tienen `objectId` nuevos—, y después se pinta cada
  slide con **el contexto de su ítem**. Los ítems traen ya armado lo que espera el
  despachador: `id_cuenta` para un encuentro, `campana` para una campaña (**sin** ventana,
  para que use la suya, que es el primer eslabón de `D-20`).
- **⚠ Dos cosas que sólo aparecieron al correrlo, y la segunda es la que valía la noche:**
  1. **`anclarEncuentros` y `unirDigitalPorCuenta` se rehacían por completo en cada
     llamada.** El Paso 5 las pide una vez por sección y una vez por marcador y por ítem:
     13 × 5 × 27 s no entra en los 6 minutos. Las dos cachean ahora por ventana, a nivel
     módulo — o sea **por ejecución**, mismo criterio que `cacheBases_`; las cuatro bases son
     de sólo lectura para el motor, así que no hay escritura propia que las deje viejas.
  2. **El registro unido de `digital` no es una fila plana.** Los `sd_*` cuelgan de él, pero
     los hechos de cada canal viven en un arreglo `<prefijo>_filas` (`Union.gs` Parte A punto
     3). `datosDeMarcador_` devolvía `[registro]` con **`encabezado: null`**, así que toda
     operación leía un campo inexistente: con el `id_cuenta` ya resuelto, los 13 `enc_*`
     pasaban de `error` a **`sin_datos`** y seguían sin número. Ahora elige el arreglo del
     canal que declara la solapa del marcador y traduce la letra de columna a su encabezado,
     igual que la rama de `leerFuente`.
- **✅ El número de la noche.** Sobre `jm`, ventana `24/07 → 30/07`:

  | | primera generación | última |
  |---|---|---|
  | tokens con valor | **1** | **17** |
  | tokens distintos con valor real (no `periodo`) | 0 | **11** |

  `encuentro` expande las slides **5 y 6** a cinco encuentros cada una. **Orden Público
  (`3347-JULJDGAG`) resuelve 11 de 13 `enc_*` con número real**: `enc_mails_enviados`,
  `enc_mails_entregados`, `enc_aperturas`, `enc_or`, `enc_ctor`, `enc_clics_ctor`,
  `enc_audiencia`, `enc_atendidos`, `enc_e75`, `enc_e75_pct`, `enc_marque1`. Los otros dos
  —`enc_impresiones` y `enc_alcance`, los dos de la solapa `Digital`— salen `sin_datos`: esa
  cuenta no tiene filas en ese canal.
- **Los otros cuatro encuentros** (San Cristóbal pre/post, Retiro pre/post) dan `sin_datos`
  en los 13. Tienen cuenta anclada con score alto (0,82 y 0,77) pero **ninguna fila en los
  canales de `digital`**. Es un dato para mirar con el informe en la mano, no un bug del
  motor: el número que falta es de la base, no del cálculo.
- **Lo que el reporte dice y no se calla:** `comunicaciones_post` sale **⚠ con 5 ítems y
  ninguna slide con tokens `post_`** en JM — es la firma de una sección curada contra una
  plantilla que no la contempla. `campana` queda **sin ítems**, con sus 8 slides modelo
  (20–27) intactas y sus tokens cayendo a la pasada de tokens fijos.
- **El deck final:** `1dQv1xhzfleQAlWzCK5MQ6G4B0dIQpLMNDceZjGEVvX8`. **Quedaron tres decks
  en la carpeta de salidas** —uno por generación— y los tres se pueden borrar salvo el
  último.
- **El ítem de menú "Generar informe" dejó de ser un "próximamente"**: apunta a la
  generación completa sobre `CONFIG.informe_activo`.
- **Prueba:** las 10 pruebas pasan. `FALTANTES` queda con **438** filas, que **es** el
  reporte de qué tokens del inventario siguen sin marcador cableado (el punto 6 de la
  corrida nocturna, hecho por esta vía y no por una función aparte).
- **Pendientes/decisiones:** las cuatro cuentas ancladas sin filas en `digital` (arriba).

### Sobre `tools/api.js`, que se tocó dos veces esta noche
De `fetch()` a `node:https` con tope de 9 min (undici corta a los 300 s y devuelve un
`fetch failed` pelado, indistinguible de una caída de red), y **reintento del transporte**:
el frontend de Google devuelve de a ratos un 404 en HTML o un pedido con el body perdido
—el script corre con `accion: (vacía)` y rechaza por token—, sin patrón. Se reintenta hasta
dos veces. **La limitación está escrita en el código:** el caso HTML no se puede distinguir
de una corrida que sí ejecutó y cuya respuesta se perdió, así que una llamada que escribe
puede escribir dos veces. Hoy eso es un deck de más, que se borra; antes de usar el cliente
para algo irreversible hay que mirar esa línea.

## Corrida nocturna — punto 6: lo que sobró tiempo para hacer (2026-08-04) — commit de esta entrada
- **Las Partes A, D y E del pedido de `m2` ya estaban corridas** (commit `72ab438`, esta
  misma fecha). No quedaba nada por correr ahí: el punto 6 arranca directo en el reporte.
- **`tokensSinCablear_(informe_id)` — el reporte de qué falta.** `FALTANTES` responde la
  misma pregunta pero **por instancia emitida**, con el sufijo `@ítem`: 438 filas para 181
  tokens distintos. Sirve para atacar una corrida, no para ver el trabajo que queda. Esto
  agrupa por token distinto y sale así para `jm`:

  **195 en la plantilla · 13 cableados y presentes · 0 cableados sin caja · 181 sin cablear**

  | familia | sin cablear | | familia | sin cablear |
  |---|---|---|---|---|
  | `camp_` | 53 | | `enc_` | 8 |
  | `m2_` | 31 | | (sin prefijo) | 7 |
  | `rrss_` | 21 | | `ivr_` | 7 |
  | `ecv_` | 19 | | `cc_` · `imp_` · `mail_` | 4 c/u |
  | `gcba_` | 19 | | `pauta_` · `contenidos_` | 3 y 1 |

  **`cableados_sin_caja = 0`** es la mitad que importa del control: no hay ninguna fila de
  `MARCADORES` apuntando a un token que la plantilla no tenga.

### ⚠ El número plausible y equivocado — encontrado mirando el informe, no antes
- **`enc_or` salía `0.3%` donde el valor real es `28,2%`.** El crudo es `0.2818…`: las
  columnas `*_or`, `*_ctor` y `*_e75_pct` de `digital` vienen **como fracción**, y el formato
  `porcentaje` asume el valor **ya en unidades de porcentaje** — que es lo correcto para lo
  que devuelve la operación `PCT`, y por eso no se lo tocó. Los tres afectados:
  `enc_or` (0,3 → **28,2**), `enc_ctor` (0 → **3,2**), `enc_e75_pct` (0,4 → **36,2**).
- **Entra el formato `fraccion`** y las tres filas de `MARCADORES` pasan a usarlo. **Dos
  formatos y no una heurística sobre el valor, a propósito:** "0,5" es un 50% en una columna
  y medio punto en otra, y eso lo sabe la fila de `MARCADORES`, no el formateador.
- **La segunda mitad del hallazgo la mostró el deck, no el código.** Las cajas de JM traen
  **su propio `%`** —`{{enc_aperturas}} ({{enc_or}}%)`—, así que agregar el signo daba
  `28.2%%`. `fraccion` convierte la unidad y **no** pone el signo: la plantilla es del equipo
  y el motor se adapta (`C-01`). Verificado en el deck generado, por `objectId`:
  `31 (28.2%)`, `2229 (36.2%)`, `1(3.2%)`.
- **Prueba:** las 10 pruebas pasan, con **tres afirmaciones nuevas** que fijan el contrato de
  los dos formatos y una que falla si el `%` vuelve a duplicarse.
- **Deck vigente:** `1AU0tkyRQo0kGccnUGJqz0MoEqtiDpy5awYGy8VjTtH8`, corrida
  `jm-20260804-180308`. **Quedaron cinco decks en la carpeta de salidas**, uno por
  generación de la noche; sirve el último y los otros cuatro se borran.
- **Pendientes/decisiones:** el formato `fraccion` se decidió solo, con el deck a la vista.
  Si algún `*_pct` de otra base viniera ya en unidades de porcentaje, va con `porcentaje` y
  no con éste — la distinción vive en la fila, que es donde se puede cambiar sin `clasp push`.

## `Pedido-1` — Partes 0 y D corridas, y **para** (2026-08-04) — commit de esta entrada
- **Qué pedía** `docs/Prompts/2026-08-04_Pedido-1_corte_jm_gcba.md`: ubicar y medir la señal
  que separa JM de GCBA por canal (Parte 0) y verificar el fundamento numérico de `R-10`
  (Parte D). Las dos son sólo lectura y terminan en parada. **No se tocó `MAPEO`,
  `REGLAS_NEGOCIO.md`, ningún `.gs` ni ninguna celda de las bases.**
- **Cómo se midió, que importa para repetirlo:** la cuenta que corre `tools/token.js` sólo
  tiene scope `drive.file`, así que **las bases no se pueden bajar desde node** — el
  `htmlview` que usa `tools/snapshot.js` devuelve 404 contra libros ajenos. Las mediciones
  salieron del propio motor, por `tools/api.js llamar fn=eval` con snippets de sólo lectura:
  cero líneas nuevas en el repo y cero `clasp push`. **Nota de seguridad: `eval` es invocable
  por la API** (no está en `API_PROHIBIDAS_`); es cómodo para medir y es superficie de ataque
  si el token se filtra.
- **⚠ Tres premisas del prompt estaban vencidas: `SOLAPAS` se movió 15 filas desde el
  snapshot del 01/08.** Alguien curó los `revisar` en el medio.
  `m2/Cuentas` pasó de `revisar` a **`ignorar`** (el prompt la declara `uso = fuente`);
  `digital/CAMPAÑAS_DESGLOCE_DIGITAL` pasó a **`fuente`** (recién ahora es "solapa fuente
  activa", como dice `R-10`); `m2/CAMPAÑAS_DESGLOCE_DIGITAL` pasó a **`ignorar`**, con lo
  cual **la ⚠ de la Parte D ya está resuelta: manda la de `digital`**.
  **`m2/Cuentas` se leyó antes de saberlo**, siguiendo la instrucción `0.1 bis`. Queda
  anotado como lo que es: una solapa `ignorar` no se lee ni se mapea (`CLAUDE.md` §2), y la
  tercera viñeta de la Parte A queda cancelada por regla.
- **0.1 · `Vocero`, medida.** `digital/Directa IVR` columna **G**, encabezado exacto
  `"Vocero"`. **57 filas de 57 con dato**, ninguna vacía. Valores: **`JM` 53 · `GCBA` 4**,
  escritos así, en mayúsculas. 47 cuentas distintas.
- **0.3 · Dato sano: 0 cuentas con dos voceros distintos.**
- **0.1 bis · El remitente.** `digital/Directa Mail` columna **G**, encabezado exacto
  `"Mail remitente"` — **no "MAIL"**. 2149 filas, ninguna vacía.
  **⚠ El hallazgo que corrige el diseño: de las 880 cuentas con filas de mail, 136 mandan
  desde dos remitentes distintos**, y el par más común es `infovecinos` + `jorge.macri`
  sobre la misma cuenta. **El remitente es una señal por envío, no por cuenta**, así que la
  propagación por `id_cuenta` que declara la Parte B **no puede aplicarse a mail**.
- **0.4 · Son 21 remitentes, no 2.** `jorge.macri@buenosaires.gob.ar` = **294 filas
  (13,7%)**; los otros veinte suman 1855, encabezados por `infovecinos` (936) y
  `baparticipacionciudadana` (626), y la cola son ministros y áreas nominales. La regla
  "JM = jorge.macri, el resto GCBA" funciona igual.
  `SECCIONES.campana_desag_respuestas` existe, con `itera_sobre = remitente (JM / GCBA)` y
  estado `revisar`.
- **⚠ 0.2 · La propagación por cuenta cubre el 1,3%.** Universo de `id_cuenta` sobre las 8
  solapas `fuente` de `digital`: **3491**. Con fila en `Directa IVR`: **47**. O sea
  **98,7% sin vocero**. De las que faltan: 3436 en `Cuentas`, 875 en `Digital`, 833 en
  `Directa Mail`, 695 en `Seguimiento digital`, 648 en `CAMPAÑAS_DESGLOCE_DIGITAL`, 638 en
  `Alcance`, 31 en `Directa SMS`.
  **Pero la propagación casi no hace falta:** los tres canales tienen señal propia — IVR su
  columna, mail su remitente por fila, SMS es GCBA por decisión. Lo que queda sin ninguna
  señal es **CC y la pauta digital**.
- **`m2/Cuentas`, ya que se leyó:** columna **U**, encabezado `"Remitente"`, 3436 filas con
  dato, vocabulario **`GCBA` 3052 · `JM` 286 · `ANUNCIO` 82 · `PDLC` 16**. No es la misma
  variable que la columna G de `Directa Mail` (ahí hay direcciones de correo). No se mapea.
- **D.1 · `R-10` tenía razón, y ahora está demostrado.** La solapa tiene **4840 filas** hoy,
  no las 4591 que cita el prompt. Por pareja (exacto / sólo plegando case y acentos /
  difieren de verdad): `Nombre Campaña`(E) vs `nombre_campaña`(V) → **1551 / 170 / 3119**
  (V trae la nomenclatura completa: `"CAMPAÑA GCBA | INFRAESTRUCTURA | Campaña 360°
  Movilidad 2025"` contra `"Campaña 360° Movilidad 2025"`); `Eje`(H) vs `eje`(W) →
  **107 / 0 / 4733** (`"Infraestructura"` vs `"Movilidad"`: son taxonomías distintas);
  `Estado`(K) vs `estado`(Y) → **0 / 3756 / 1082** (`"ACTIVA"` vs `"Finalizada"`).
  **La pareja que más parece la misma se contradice en 1082 filas.** La hipótesis del
  "bloque agregado aparte con el mismo contenido" queda descartada.
- **⚠ D.2 · El "quince pares" de `R-10` no se reproduce: hoy son dos.** Censo sobre las
  **46** solapas registradas que no son `ignorar` (38 salteadas por regla, sin nombrarlas).
  **Plegando sólo mayúsculas y acentos —que es lo que `R-10` discute— hay 2 colisiones**,
  las dos en `digital/CAMPAÑAS_DESGLOCE_DIGITAL` [`fuente`]: `Eje`/`eje` y `Estado`/`estado`.
  **`Nombre Campaña` vs `nombre_campaña` no colisiona** bajo ese plegado — espacio contra
  guion bajo, y `R-10` preserva los dos. Colisiona sólo si además se pliega `_`, y ahí
  aparece una cuarta: `rdv/Visualiz_mail` [`derivada`] `Mail_remitente`(D) vs
  `Mail remitente`(E). Duplicados exactos: **3**, todos en solapas `referencia`
  (`rdv/Comunas` `"Agronomía"` T y V; `digital/RDV JM 2 VECES` y `digital/INFORME` con
  `Clics` dos veces). **Los de `looker/URLs` ya no cuentan: esa solapa hoy es `ignorar`.**
  **El enunciado de `R-10` sigue en pie y D.1 lo refuerza; lo que está mal citado es su
  fundamento numérico**, y uno de sus tres ejemplos no es un caso de case-folding.
- **D.3 · La columna `JM | GCBA | POLICIA` clasifica 15 veces más, y se contradice.** Está
  en **tres** solapas `fuente`, no en una: `digital/CAMPAÑAS_DESGLOCE_DIGITAL` col T
  (GCBA 4705 · JM 107 · Sin Tipo 22 · LINDA 6 · 693 cuentas · 1 ambigua);
  `digital/Digital` col B (GCBA 739 · JM 205 · POLICIA 16 · 334 filas sin valor · 877
  cuentas · 29 ambiguas); `digital/Seguimiento digital` col E (GCBA 787 · JM 27 · LINDA 2 ·
  163 sin valor · 742 cuentas · 9 ambiguas).
  Contra el vocero, cuenta por cuenta: `CAMPAÑAS_DESGLOCE` coincide en **12 de 45**;
  `Seguimiento digital` en **9 de 47**. Los choques son casi todos cuentas `…JDGAG` con
  `vocero = JM` y columna `GCBA`.
  **La condición que puso el prompt —"si clasifica más y no se contradice"— no se cumple:
  el corte por vocero y remitente se mantiene.** Lectura de por qué chocan: la columna dice
  de quién es la campaña, el vocero dice quién habla en el audio. No son la misma pregunta.
- **Prueba:** sólo lectura. Ni `.gs`, ni hojas, ni bases, ni plantillas.
- **Pendientes/decisiones:** la Parte B necesita corrección antes de escribirse (mail es por
  fila, no por cuenta). La Parte A pierde su tercera viñeta. **La Parte C se choca con el
  límite que el propio prompt anticipó**: `valores_incluidos` filtra dentro de `leerFuente`,
  por `(base, solapa)` y **para toda la corrida**, así que no puede darle JM a una sección y
  GCBA a la de al lado — que es lo que pide `campana_desag_respuestas`. Eso es mecanismo
  nuevo y lo decide el usuario. La Parte E no se abrió.

## `Pedido-2` — el deck validado: **los once números salen de la cuenta equivocada** (2026-08-04) — commit de esta entrada
- **Qué pedía** `docs/Prompts/2026-08-04_Pedido-2_validar_deck.md`: abrir el deck generado y
  leer qué quedó escrito, caja por caja, contra el mapa `token → objectId` de `CORRIDAS`.
  Casi todo sólo lectura. **No se corrigió ningún número, no se cambió `ULTIMO` por `SUMA`,
  no se regeneró el informe, no se tocó la plantilla ni ninguna base.**
- **⚠ EL HALLAZGO · el encuentro es `3387-JULJDGGC` y el motor leyó `3347-JULJDGAG`.** Las
  dos cuentas comparten el nombre de campaña `TE CUENTO BS AS JM | 21/7 ORDEN PÚBLICO`, la
  `Segmentacion` y hasta la columna `Audiencia` (40874 / 37763 en las dos) — **por eso
  `enc_audiencia = 37763` parecía correcto: coincide por casualidad**. `3347` es del 16–17/07
  con entregas chicas; `3387` es del 22–26/07 y es la que usó el informe publicado.
  Deck contra `docs/VALIDACION_2026-07-31.md` §3.2: `enc_mails_enviados` **110** vs
  **44.043**; `enc_mails_entregados` 110 vs 43.439; `enc_aperturas`/`enc_or` 31 (28,2%) vs
  4.652 (10,7%); `enc_clics_ctor`/`enc_ctor` 1 (3,2%) vs 145 (3,1%); `enc_atendidos`
  **6.161** vs **71.234**; `enc_e75`/`enc_e75_pct` 2.229 (36,2%) vs 27.599 (39%);
  `enc_marque1` 67 vs 256; `enc_audiencia` 37.763 vs 78.637.
  **Con la cuenta correcta y `SUMA`, los cuatro de IVR cierran dígito a dígito con el informe
  publicado** (78.637 · 71.234 · 27.599 · 256).
- **Por qué pasó:** `digital` es `modo_periodo = snapshot`, así que **nada filtra por fecha**;
  el join es puro `id_cuenta` y el matcher eligió entre dos cuentas homónimas **sin desempate
  temporal**. Es el "empate técnico del match" que ya figuraba como pendiente de `Union.gs`;
  ahora tiene una víctima concreta.
- **Segundo golpe, para cuando se arregle la cuenta:** `3387` tiene **5 filas de mail**
  (22/07 ×2, 25/07, 27/07 y **03/08**). Con `ULTIMO` y sin filtro de fecha tomaría la del
  **03/08, fuera de la ventana**; el informe publicado usa la del 25/07.
- **0.1 / 0.2 · Los siete decks están todos vivos**, ninguno en la papelera. El vigente
  `1AU0tkyRQo0kGccnUGJqz0MoEqtiDpy5awYGy8VjTtH8` existe y tiene **30 slides** (la plantilla
  tiene 22; las 8 de más son la expansión).
  **Confirmado lo que anticipaba el prompt:** siete `corrida_id`, siete `deck_id` y conteos
  crecientes 1→6→17 **es desarrollo, no doble escritura por el reintento de `tools/api.js`**.
  El `P1` del reintento **baja a observación y no se saca**: el riesgo sobre una llamada que
  escribe sigue existiendo, sólo que no se manifestó acá.
- **Parte A · el motor no falló al escribir.** 195 tokens, **464 instancias: 17 con valor,
  447 con `«FALTA»`, 0 tokens crudos `{{...}}`, 0 referencias del mapa que no existan en el
  deck.** El mapa `token → objectId` es fiel.
- **La discrepancia contra `CORRIDAS` está explicada:** el deck tiene 447 cajas en `«FALTA»`
  y `FALTANTES` registra 438. Los 9 son tres tokens que aparecen en más cajas que filas
  registradas — `camp_titulo` (8 cajas, 1 fila), `camp_remitente` (2/1), `rrss_area1` (2/1).
  **`FALTANTES` cuenta por (token, ítem), no por caja:** responde *qué* falta, no *cuántas
  cajas* quedaron marcadas.
- **Parte B · ningún valor está en la caja equivocada.** Los diez rótulos vecinos
  corresponden uno a uno (`enc_mails_enviados`→"Mails Enviados", `enc_atendidos`→"Atendidos",
  `enc_marque1`→"Marcaron 1", `enc_e75`→"Escucharon +75%", `enc_audiencia`→"Audiencia").
  **La rotación de la slide 5 y el cruce de la 6 no se reprodujeron.**
- **Parte D · 384 de 438 faltantes se destraban con una sola cosa:** el motivo
  *"sin fila en `MARCADORES`"*, **88% del total**. Los otros 54 son `sin_datos` sobre 0
  filas, repartidos en 13 motivos casi idénticos (`ivr_*`, `mail_*`, `dig_*`, 4-5 ítems cada
  uno): son los cuatro encuentros cuyas cuentas no aportan filas. Por familia: `ecv_*` 130,
  `enc_*` 94, `camp_*` 53, `m2_*` 31, `ivr_*` 24, `rrss_*` 21, `cc_*` 19, `mail_*` 19,
  `gcba_*` 19.
- **Parte E · medido, sin decidir.** `enc_mails_enviados` y `enc_mails_entregados` dan los
  dos 110 porque **en la base son 110 y 110** para esa fila: es un dato, no una columna leída
  dos veces. `enc_atendidos` (6161), `enc_marque1` (67) y `enc_e75` (2229) salen **los tres
  de la misma fila** — la segunda de `3347` — con `ULTIMO`.
  **`ULTIMO` vs `SUMA` deja de ser una pregunta abierta** (`VALIDACION` §3.2: *"IVR cierra
  por SUMA sobre `id_cuenta`"*), **pero no se cambió**: va junto con el arreglo de la cuenta,
  para poder medir los dos cambios por separado.
- **Tres observaciones que el prompt no pedía:**
  1. **Las cinco slides de encuentro son indistinguibles entre sí.** `ecv_barrio` sale
     `«FALTA»` en las cinco, así que **el deck no dice qué encuentro es cada lámina**. Y hay
     un desajuste sin resolver: los valores cayeron en la **slide 11**, que por orden de
     `REUNIONES` sería *Retiro (pre)*, mientras el handoff dice que el encuentro con datos es
     *Orden Público*. Una de las dos cosas está mal y **no se puede saber cuál desde el
     deck**.
  2. **El anclaje no queda registrado en ningún lado.** `ANCLAJE_PENDIENTE` está vacía (sólo
     encabezado) y **`VALORES` no tiene ni una fila**, aunque `Valores.gs` y
     `registrarValorCalculado_` existen. Sin eso, "qué cuenta usó cada ítem" no es auditable
     — que es exactamente lo que hizo falta hoy.
  3. **Los números van sin separador de miles**: el deck dice `6161`, `2229`, `37763`; el
     informe publicado usa `6.161`.
- **Prueba:** sólo lectura, por `eval` sobre la API. No se tocó `.gs` ni ninguna hoja.
- **Pendientes/decisiones:** el arreglo del desempate del matcher es de `Union.gs` y no se
  hizo acá. Queda pendiente decidir si el orden de expansión de las cinco slides es el de
  `REUNIONES` o no.

## `Pedido-4` — Parte 0 corrida, y **para**: los números de referencia no reproducen (2026-08-04) — commit de esta entrada
- **Qué pedía** `docs/Prompts/2026-08-04_Pedido-4_cerrar_ecv.md`: inventariar los `ecv_*`,
  clasificarlos entre agregado semanal y por encuentro, y confirmar la ventana antes de
  cablear nada. Sólo lectura, con parada propia. **No se tocó `SECCIONES`, ni `MARCADORES`,
  ni el formateador.**
- **0.1 · 19 tokens `ecv_*` en la plantilla de JM, y ninguno cableado.** `MARCADORES` no
  tiene **ni una** fila de la familia. Viven en dos láminas: la **5** (*"Encuentros con
  vecinos: alcance semanal por herramienta"*) y la **6** (*Iceberg*).
- **⚠ 0.2 · La repetición es peor de lo que decía el prompt: no alcanza con mover tokens.**
  De los 19, **9 son agregado semanal puro** (`ecv_encuentros`, `ecv_barrios`,
  `ecv_barrio1/2/3` y los cinco `ecv_insc_*_pct`, todos sólo en la lámina 5) y **2 son de un
  encuentro** (`ecv_barrio`, `ecv_poblacion`, sólo en la 6). **Los 8 restantes están en las
  dos láminas con el mismo nombre y dos significados distintos**: `ecv_inscriptos`,
  `ecv_asistentes` y los cinco `ecv_insc_*` valen *el total de la semana* en la lámina 5 y
  *el de ese encuentro* en la 6.
  Por la regla del propio prompt —*"si algún token queda ambiguo, no lo asignes"*— esos ocho
  **no se mueven**: quedan listados y la decisión es del usuario. Partir la sección sin
  resolverlos rompería la lámina 6.
  Confirmado además el diagnóstico de origen: en el deck, **las slides 5 a 9 son cinco
  copias de la lámina 5** —el agregado semanal— y las 10 a 14 son las cinco del iceberg.
- **⚠ 0.3 · La ventana está bien y el conteo no.** `resolverVentana({})` da
  **24/07 → 30/07, origen `config`** ✅. Pero `rdv/RVD JM-CM - ES` deja **16 filas en
  ventana, no 12** (1362 totales; 703 excluidas por lista blanca: 642 vacío, 58
  `Suspendida`, 2 `Reprogramada`, 1 `Se modificó el barrio`).
- **Las cuatro filas de más están identificadas, y explican la diferencia exacta.** Son las
  **cuatro del jueves 30/07** (Villa Urquiza, Chacarita, Palermo, La Paternal): suman
  **445 inscriptos y 125 asistentes**, que es **exactamente** la diferencia contra los
  números de referencia. Hoy: **3364 inscriptos · 811 asistentes · 16 encuentros**;
  referencia del 03/08: 2919 · 686 · 12. `3364 − 445 = 2919` y `811 − 125 = 686`.
  Las tres cuentas cierran a la vez, así que la hipótesis es sólida; **lo que no se puede
  distinguir con los datos de hoy es por qué**: o el corte del 03/08 midió hasta el 29/07,
  o las cuatro filas del 30/07 todavía no estaban cargadas. El usuario lo encuadró el
  04/08: *el informe se arma por temario y esa presentación se armó con los números del
  día*.
- **Y la diferencia de 54 ya no es 54: es 20.** La suma de los cinco canales da **3344**,
  contra 3364 inscriptos. **`Mataderos` del 29 ya tiene sus canales cargados** (4 mail + 3
  RRSS + 27 difusión = 34), así que de los dos casos que explicaban el −54 queda **sólo
  `Palermo` del 29, con 20 inscriptos y ningún canal**. `54 − 34 = 20`. La base es viva:
  cambió entre el 03/08 y hoy.
- **Prueba:** sólo lectura, por `eval` sobre la API.
- **Pendientes/decisiones:** **se para antes de la Parte A**, como pide el prompt: los
  números contra los que había que cerrar no aplican a la ventana de hoy. Hay que decidir
  si la referencia pasa a ser `3364 / 811 / 16 / 3344 / −20` o si la ventana correcta
  termina el 29/07. Y hay que resolver los ocho tokens ambiguos antes de partir la sección.

## Doc — el temario del 24–30/07, documentado, y `REUNIONES` no es el temario (2026-08-04) — commit de esta entrada
- **Qué pedía el usuario:** revisar la configuración —*el informe se arma por temario, y
  esa presentación se armó con los números del día*— y dejar el temario documentado para
  poder comparar contra el informe *Seguimiento JS 31/07*.
- **Dónde quedó:** `docs/CONFIG_INFORMES.md` §1.7, que es el dueño de la pregunta *"¿qué
  decisión editorial lleva cada informe?"* (`CLAUDE.md` §7). **No se creó ningún `.md`
  nuevo.** El temario ya estaba transcripto **parcialmente** en
  `docs/TEMARIO_Y_PLANTILLA_2026-07-31.md` §1 —siete filas, sacadas de los *comentarios
  del deck viejo*, no del temario— y ese documento es evidencia congelada: no se editó.
- **⚠ `REUNIONES` no es el temario.** Tiene **7 filas** y le faltan **dos ítems del bloque
  Cercanía y M2**: **`Primera Persona con Pareto 27/07`** —que en `rdv` existe y es el
  encuentro más grande de la semana: **1344 inscriptos · 267 asistentes**— y **`M2 |
  Registro Civil`**. Además `Orden Público` está con `orden = 3` y en el temario es el 4.
  Los otros tres bloques del temario (Campañas destacadas, DGAYD, Otros) no están en
  `REUNIONES`: las destacadas van por `CAMPANAS`, que **no tiene ninguna fila de `jm`**.
- **⚠ El temario no respeta la ventana de `CONFIG`.** El ítem 1 es del **23/07** y la
  ventana activa es **24–30/07**. Eso explica lo que estaba anotado como misterio: San
  Cristóbal ancla con score alto **y no aporta ninguna fila porque su fila de `rdv` está
  fuera de ventana**. La ventana sirve para los agregados; **no** para seleccionar los
  encuentros del temario, que es una decisión humana con su propio calendario.
- **⚠ "San Cristóbal" es homónimo dentro de `rdv`.** En ventana hay **Gabriel Mraida,
  24/07, `Encuentro con Vecinos`, 50 · 24**, contra el **`"1 a 1"` de Jorge Macri del
  23/07, 138 · 9** que pide el temario: otro funcionario, otro tipo, otra fecha. **Es el
  mismo modo de falla que las dos cuentas homónimas de `digital`** — el nombre no alcanza
  para identificar un encuentro; hacen falta figura, tipo y fecha.
- **Los cuatro números del temario quedaron tabulados** en `CONFIG_INFORMES.md` §1.7 para
  comparar contra el deck: San Cristóbal 138/9, Retiro 98/10, Primera Persona 1344/267,
  Orden Público 753/199, con sus cinco canales.
- **Prueba:** sólo lectura sobre `rdv` (26 filas entre el 20/07 y el 01/08) y sobre las
  hojas de registro. No se tocó ninguna configuración.
- **Pendientes/decisiones:** falta decidir si `REUNIONES` se completa con los dos ítems que
  faltan, y cómo se identifica un encuentro sin depender del nombre.

## `Pedido-4` Addendum — Parte 0 bis corrida, y **para**: nada se movió, salvo un conteo mío (2026-08-05) — commit de esta entrada
- **Qué pedía** `docs/Prompts/Addendum_2026-08-05_Pedido-4_referencia_viva_y_opcion_C.md`:
  confirmar, antes de tocar nada, que los hallazgos de la Parte 0 del 04/08 siguen en pie.
  Sólo lectura, con parada propia.
- **⚠ CORRECCIÓN a la entrada del 04/08 · la partición de los `ecv_` es 10 / 2 / 7, no
  9 / 2 / 8.** Las **listas** que dejó esa entrada eran correctas; el **número** que las
  encabezaba, no. Son **10** de agregado semanal puro (`ecv_encuentros`, `ecv_barrios`,
  `ecv_barrio1`, `ecv_barrio2`, `ecv_barrio3` **más los cinco** `ecv_insc_*_pct` = 5 + 5),
  **2** de encuentro (`ecv_barrio`, `ecv_poblacion`) y **7** en las dos láminas
  (`ecv_inscriptos`, `ecv_asistentes` **más los cinco** `ecv_insc_*` = 2 + 5). 10 + 2 + 7 =
  19. **La plantilla no cambió**: 19 tokens, mismas listas, `JM_marcada`, 22 slides, 195
  tokens distintos. El error fue aritmético al redactar, y se propagó al handoff y al
  addendum, que pide cablear "los 9" y **lista 10**. Manda la lista, no el número — como
  el propio addendum previó.
- **0bis.2 · `MARCADORES` sigue sin ninguna fila de familia `ecv`. ✅** Y su cabecera
  confirma la premisa del addendum: **once columnas, sin `seccion_id`** — `marcador`,
  `familia`, `informe_id`, `base_id`, `solapa`, `campo_logico`, `periodo_ref`, `operacion`,
  `valor_fijo`, `formato`, `notas`.
- **0bis.3 · El árbol de `SECCIONES` no se movió. ✅** `encuentro` sigue `repetible` sobre
  `REUNIONES` con `familia_tokens = ecv_,enc_` y estado `activa`, con sus cuatro
  subsecciones `portada` (activa) / `estrategia` / `iceberg` (`familia = enc_`) /
  `resultados`, las tres últimas en `revisar`.
- **0bis.4 · La base NO se movió en un día.** Ventana **24–30/07, origen `config`**, y los
  tres agregados dan **idéntico** al 04/08: **3364 inscriptos · 811 asistentes · 16
  encuentros**. Canales: mail 2003 · CC 272 · IVR 43 · digital 955 · difusión 71 =
  **3344**, diferencia **−20**.
  | medición | inscriptos | asistentes | encuentros |
  |---|---|---|---|
  | 03/08 (referencia derogada) | 2919 | 686 | 12 |
  | 04/08 | 3364 | 811 | 16 |
  | **05/08** | **3364** | **811** | **16** |
- **La diferencia sigue teniendo una sola fila con nombre:** `Clara Muzzio · Palermo ·
  29/07 → 20`. Es el control que la Parte D del addendum pide como `D.2`, y hoy pasa.
- **Prueba:** sólo lectura, por `eval` sobre la API. No se tocó `SECCIONES`, ni
  `MARCADORES`, ni la plantilla, ni ninguna base.
- **Pendientes/decisiones:** **se para acá y se espera luz verde**, como pide el addendum.
  Los 10 tokens de la Parte A quedan identificados por lista; los 7 ambiguos, diferidos.

## Corrida nocturna 05/08 — punto 1: la sección 1 cerrada, el agregado semanal `ecv_` (2026-08-05) — commit de esta entrada
- **Qué pedía:** `2026-08-04_Pedido-4_cerrar_ecv.md` con su addendum del 05/08 (que
  sustituye las Partes A y D). Luz verde del usuario, partición **10 / 2 / 7**.
- **⚠ El diagnóstico real era otro, y sin arreglarlo la Parte A no servía.** El addendum
  pedía declarar una sección hermana en modo `agregado`; eso solo **no** habría sacado la
  lámina de la repetición. La causa es `encuentro.familia_tokens = 'ecv_,enc_'`:
  `familia_tokens` es **con qué se reconoce el bloque modelo en la plantilla**, y con `ecv_`
  adentro `slidesModeloDe_` reclamaba **también** la lámina del alcance semanal —que lleva
  `ecv_*` y ningún `enc_*`— y la duplicaba una vez por encuentro. **Ése era el bug**, no la
  falta de una sección.
- **Lo que se hizo:** entra `ecv_alcance_semanal` (`modo = agregado`, `orden = 7.5` para no
  renumerar ninguna fila curada) con los **10 tokens exactos** en `familia_tokens` en vez
  del prefijo `ecv_` —el prefijo se llevaría los 7 ambiguos y los 2 de encuentro—, y
  `encuentro` pasa a `familia = enc_`.
  **Los `ecv_` del iceberg no se rompen:** la pasada por ítem del Paso 5 recorre
  `tokensDeSlide_`, o sea **todos** los tokens de la slide emitida, no sólo los de la
  familia. Verificado en el deck.
- **Se agregó `curarSecciones_`**, la puerta angosta para corregir un campo de una sección
  que ya existe. Hacía falta: `sembrarSecciones_` **sólo agrega y nunca pisa**, así que
  cambiar `encuentro.familia_tokens` no tenía ningún camino en el código — sólo la mano de
  una persona sobre la celda. Misma forma y mismo motivo que `curarMarcadores_`: no crea
  filas, no borra filas, no toca `seccion_id`, y devuelve el antes y el después de cada
  celda. **`docs/ESCRITORES.md` queda desactualizado** hasta que se re-corra
  `tools/escritores.js`.
- **Diff antes y después: `protegidas (con diferencia): 0`** las dos veces, con
  `agregadas: 1` en el medio. **Las 10 pruebas pasan.**
- **Parte B · 6 de los 10 cableados**, contra `rdv/RVD JM-CM - ES`, solapa explícita:
  `ecv_encuentros` (CONTEO — cuenta filas, no valores) y los cinco `ecv_insc_*_pct` (PCT,
  `campo/inscriptos`). Los seis resuelven `ok`.
- **Los 4 que NO se cablearon, con el motivo:** `ecv_barrios`, `ecv_barrio1`, `ecv_barrio2`
  y `ecv_barrio3`. **La columna existe** (`barrio` → B en `MAPEO`); **lo que no existe es la
  operación**. Las seis del motor son `SUMA · CONTEO · ULTIMO · RATIO · PCT · TEXTO`, y
  estos cuatro piden "cantidad de barrios distintos" y "el N-ésimo barrio del ranking". No
  se inventó ninguna: agregar una operación es mecanismo nuevo y toca a todos los
  marcadores. **Además `CONFIG_INFORMES.md` §1.4 los declara `[MANUAL]` con una `[?]` de si
  salen por ranking automático** — o sea que ni siquiera está decidido que deban calcularse.
- **⚠ Decisión propia · los cinco `_pct` van con formato `numero`, no `porcentaje`.** La
  caja de la lámina **ya trae su propio `%`** —`{{ecv_insc_mail}}({{ecv_insc_mail_pct}}%)`—
  así que `porcentaje` habría impreso `59.5%%`: el mismo bug que el formato `fraccion`
  arregló el 04/08. Lo que falta es un formato **"unidades de porcentaje sin signo"**, que
  no existe: la matriz tiene `porcentaje` (unidades pct **con** signo) y `fraccion` (0–1 →
  pct, **sin** signo), y falta la cuarta celda. **No se agregó** porque el prompt dice
  explícitamente *"los porcentajes y las fechas no se tocan"*. Verificado en el deck:
  `(59.54%)`, bien. **Reversible: una celda por fila.**
- **Parte C · el formateador no necesitaba ningún cambio, y se verificó en vez de
  suponerlo.** Su control positivo pasa tal como está: `0` con `miles` → `"0"` (no vacío) y
  `"abc"` → `"abc"` (no `NaN`). `miles` ya da `3.364` · `37.763` · `6.161`. **Ninguno de los
  6 tokens cableados es un número de miles** (`ecv_encuentros` = 16, y los cinco `_pct`), y
  los que sí lo serían —`ecv_inscriptos` 3364 y `ecv_asistentes` 811— son de los 7 ambiguos
  y no se tocan. Los `6161`/`2229`/`37763` sin separador del deck son `enc_*`, o sea
  **sección 3, prohibida esta noche**.
- **Parte D · la corrida.** `jm-20260805-005053`, deck
  `1cXrAhX3-GXs0dYeqwLxYqD1Nrr3ZJ2s1NJYRwz-llWo`, 05/08 00:54. **Medición, no referencia.**
  - **`D.3` ✅ — el control que dice si la Parte A funcionó: los agregados salen UNA vez.**
    `slides_modelo` de `encuentro` pasó de `[5, 6]` a **`[6]`**; el deck pasó de **30 a 26
    slides**; `ecv_encuentros` aparece **x1**, en la slide 5, con el valor **`16`**.
  - **`D.1` sólo se puede verificar para `ecv_encuentros`: 16 en el deck y 16 en la lectura
    cruda de `rdv`.** Los otros dos agregados —`ecv_inscriptos` y `ecv_asistentes`— **no
    están cableados y no pueden estarlo**: son de los 7 ambiguos que la opción C difiere. Es
    consecuencia directa de la decisión, no una falla del control.
  - **`D.2` · la diferencia sigue teniendo una sola fila con nombre.** Sobre `rdv`: 3364
    inscriptos contra **3344** de los cinco canales, **−20**, y la fila es
    `Clara Muzzio · Palermo · 29/07`, sin ningún canal cargado. Los porcentajes del deck lo
    confirman por otro camino: 59,54 + 28,39 + 8,09 + 2,11 + 1,28 = **99,41%**, y el 0,59%
    que falta es exactamente 20/3364.
  - **Tokens: 18 reemplazados y 304 faltantes**, contra 17/438 del 04/08. Los 134 que se
    fueron son sobre todo las cuatro copias de más de la lámina agregada.
- **⚠ Saltó el reintento del transporte** (*"la respuesta vino en HTML"*), que es el `P1`
  que no se puede distinguir de una corrida que sí ejecutó. **Se verificó: `CORRIDAS` tiene
  una sola fila de hoy.** No hubo doble escritura.
- **Prueba:** las 10 pruebas pasan. Diff antes y después con `protegidas (con diferencia):
  0`. El deck leído caja por caja por `objectId`.
- **Pendientes/decisiones:** los 4 `ecv_barrio*` esperan una decisión (¿manual, como dice
  §1.4, o una operación nueva?). Falta el formato "pct sin signo". `ESCRITORES.md` hay que
  regenerarlo.

## Corrida 06/08 — punto 1: los tres huecos, anotados donde se leen (2026-08-06) — commit de esta entrada
- **Qué pedía** `docs/Prompts/Corrida_2026-08-06.md` punto 1: sacar de un reporte y meter en
  los documentos los tres huecos que la corrida del 05/08 nombró y dejó sueltos.
  Documentación pura, sin código.
- **Tres entradas nuevas en `docs/PENDIENTES_consistencia.md`, separadas a propósito:**
  `P2 · DISTINCT no existe como operación`, `P2 · falta un formato "pct sin signo"` y
  `P2 · ecv_barrio no puede usarse como prefijo de familia`.
- **La separación que importa, y por qué:** `ecv_barrios` **no** quedó archivado junto a los
  tres `[MANUAL]` de `CONFIG_INFORMES.md` §1.4. §1.4 declara manuales a **`ecv_barrio1-3`** y
  **no menciona `ecv_barrios`**. Los tres primeros son una **decisión editorial**; el cuarto
  es un **hueco técnico**. Meterlos en la misma bolsa lo habría hecho desaparecer: quedaría
  "resuelto" por una decisión que nunca lo abarcó.
- **En `CONFIG_INFORMES.md` §1.4** quedó marcado que la `[?]` abierta —*"¿o salen por ranking
  automático de asistentes?"*— **resuelve dos huecos a la vez**: si el equipo dice que sí,
  `ecv_barrio1-3` deja de ser manual y la operación que hace falta es de la misma familia que
  la de `ecv_barrios`; si dice que no, los tres quedan manuales y sobrevive sólo
  `ecv_barrios`. **Es pregunta para el equipo y no se inventa la respuesta.**

### ⚠ Corrección a un prompt, no un hallazgo del motor
- **La Parte A del addendum del `Pedido-4` pidió cablear los 10 sin cruzarlos contra
  `CONFIG_INFORMES.md` §1.4**, que ya declaraba tres de ellos `[MANUAL]`. La clasificación de
  `0bis.1` era **correcta** —los 10 son agregado semanal puro— pero **clasificar y poder
  cablear no son lo mismo**, y ese cruce faltaba en el prompt. En la práctica no costó nada
  —los tres no se cablearon igual, porque tampoco había operación— pero podría haber costado:
  el camino natural era inventar una operación para cablear algo que ya estaba decidido como
  manual.
- **Queda escrito como convención para el próximo prompt de cableado: antes de cablear una
  lista de tokens, cruzarla contra los `[MANUAL]` de `CONFIG_INFORMES.md`.**
- **Prueba:** documentación pura. Ni `.gs`, ni hojas, ni bases.

## Corrida 06/08 — punto 2: `Pedido-3` Parte 0, y las Partes A–G **sin ejecutar** (2026-08-06) — commit de esta entrada
- **Qué pedía:** correr `docs/Prompts/2026-08-04_Pedido-3_filtro_declarativo.md` de la Parte
  0 a la G, con la Parte 0 terminando en bitácora y no en parada. **Corrió la Parte 0
  entera; las Partes A a G no se ejecutaron** (ver el cierre).
- **0.1 · `SECCIONES.filtro` está declarada y MUERTA.** La columna existe y **una sola fila
  la usa**: `comunicaciones_post` con `filtro = "etapa=post"` (repetible, activa).
  **Ningún código la lee.** El único lugar del repo que la menciona es `filaSeccion_`
  (`Instalar.gs:1936`), que la **escribe** a la hoja. O sea que `etapa=post` nunca filtró
  nada. **La Parte D del pedido es implementarla, no extenderla**, tal como el prompt
  anticipaba como hipótesis.
- **0.2 · `MARCADORES` no tiene columna `filtro`. ✅** Confirmado sobre la hoja viva: once
  columnas, `marcador · familia · informe_id · base_id · solapa · campo_logico ·
  periodo_ref · operacion · valor_fijo · formato · notas`.
- **0.3 · `dig_jm_gcba` existe y clasifica bien.** `digital/Digital` columna **B**,
  encabezado `JM | GCBA | POLICIA`, mapeada como `dig_jm_gcba` (una de los 15 campos de esa
  solapa). Valores: **`GCBA` 739 · `JM` 205 · `POLICIA` 16**, con **334 filas sin valor**.
  Cubre **877 cuentas**, de las cuales **29 tienen dos valores distintos**.
- **0.4 · La tabla de envíos está en la lámina 18, no en la 22** que dice `TOKENS.md`. Su
  inventario celda por celda, y **faltan cinco tokens, no cuatro**:
  | fila | col 1 · remitente | col 2 · fecha | col 3 · audiencia |
  |---|---|---|---|
  | envío 1 | `camp_env1_rem` ✅ | `camp_env1_fecha` | `camp_env1_aud` |
  | envío 2 | **falta** | `camp_env2_fecha` | `camp_env2_aud` |
  | envío 3 | **falta** | `camp_env3_fecha` | `camp_env3_aud` |
  | envío 4 | **falta** | **falta `camp_env4_fecha`** | `camp_env4_aud` |
  | envío 5 | **falta** | `camp_env5_fecha` | `camp_env5_aud` |
  **El quinto hueco es nuevo:** el prompt dice *"los envíos 2 a 5 tienen fecha y audiencia y
  no remitente"*, y el envío 4 **tampoco tiene fecha**. No es una caja vacía: **no hay
  token** en esa celda.
- **0.5 · Los remitentes sueltos son dos, no uno.** `camp_remitente` aparece suelta en la
  lámina **18** y otra vez en la **19**, y en la 18 está además `camp_bench_remitente`. La
  pregunta del prompt —*qué debería mostrar si cada fila ya dice quién envió*— **se duplica**.
  **No se cablearon**, como pide el prompt.
- **⚠ 0.6 · La medición contradice el supuesto, y por eso la Parte G NO se construyó.** El
  usuario había respondido el 05/08 que *cinco envíos alcanzan*. Sobre
  `digital/Directa Mail`, agrupando por `id_cuenta`:
  - **Dentro de la ventana 24–30/07:** 52 cuentas con envíos · **máximo 6**
    (`3245-JUNFESGC`) · distribución 1:29 · 2:16 · 3:5 · 5:1 · **más de 5: 1**.
  - **Sin ventana, sobre toda la base:** 880 cuentas · **máximo 52** (`1942-SEPEPHGC`) ·
    **36 cuentas con más de 5 envíos**.
  **Hay una cuenta que supera cinco en la ventana del informe**, así que hoy **un envío se
  perdería en silencio** en esa lámina. El prompt de la corrida es explícito para este caso:
  *"si `0.6` mide algo distinto de lo esperado, reportarlo, no construir la lámina, y
  seguir"*. **No se construyó.** Queda para decisión del usuario, con el número medido.
- **Prueba:** sólo lectura, por `eval` sobre la API. No se tocó `SECCIONES`, `MARCADORES`,
  ninguna plantilla ni ninguna base.
- **Pendientes/decisiones:** las Partes **A a G no corrieron** — la Parte 0 consumió la
  corrida. Ninguna se trabó: quedan listas y con su medición hecha. La Parte E además
  choca con el límite 2 de esta corrida (no se editan plantillas), así que cuando se
  ejecute hay que reportar qué haría falta en vez de tocarla.

## Corrida 06/08 — cierre: qué NO se hizo (2026-08-06) — commit de esta entrada
- **El punto 3 —la familia `m2_`— no se empezó.** Era "si sobra tiempo" y no sobró: la
  Parte 0 del `Pedido-3` son seis mediciones sobre tres bases y consumió la corrida. **No se
  trabó: no se llegó.** Sus 31 tokens siguen sin cablear, la sección `m2` sigue en modo
  `agregado` sin iterar, y la entrada `P1` de la caja `{{m2_salud_camp}}` huérfana sigue
  abierta y sin cruzar contra esto.
- **No se cableó ningún token nuevo en esta corrida.** La base de medición sigue siendo la
  de la corrida del 05/08: **18 con valor / 304 faltantes**, `jm-20260805-005053`. **No se
  generó informe** porque no hubo cableado que verificar — generar por generar habría dejado
  un deck más en la carpeta de salidas sin responder ninguna pregunta.
- **Una cosa que quedó afirmada y no verificada**, y conviene decirlo antes de que se lea
  como hallazgo: la entrada del punto 2 dice que la tabla de envíos *"está en la lámina 18,
  no en la 22 que dice `TOKENS.md`"*. **La lámina 18 está medida sobre la plantilla viva de
  JM** (`mapaDeTokens_`); **el 22 de `TOKENS.md` no se verificó contra qué está numerando**
  —puede ser el informe publicado, o SECCO, y entonces no habría contradicción—. **No se
  tocó `TOKENS.md` ni se anotó como inconsistencia**: primero hay que mirar qué numera esa
  tabla.
- **Prueba:** documentación pura.

## Corrida 07/08 — puntos 1 y 2, y el punto 3 **parado antes de tocar la plantilla** (2026-08-07) — commit de esta entrada
- **Punto 1 · `CONFIG_INFORMES.md` §1.1 reescrito.** Las dos decisiones del 05/08 que estaban
  ahí **se reemplazan, no se matizan**: el período **no** es el criterio de selección —lo es
  el temario, y las campañas destacadas **se buscan en toda la base, sin filtro de
  ventana**—, y el *"máximo cinco envíos"* pasa a **desborde**: la lámina se repite, cinco
  por lámina, y ningún envío se pierde. La regla quedó escrita en una línea: **la ventana
  agrega, el temario selecciona.**
- **Queda anotada la limitación de la medición que lo motivó**, porque importa: `0.6` agrupó
  por **`id_cuenta`, no por campaña**, ya que `CAMPANAS` no tiene ninguna fila de `jm` y no
  existe la campaña contra la cual agrupar. **El proxy fue forzado por falta de datos, no
  elegido**: los 6 envíos en ventana dicen que **una cuenta** los recibió, **no** que una
  campaña los haya mandado. La decisión se toma igual porque el modo de falla que evita
  —perder un envío en silencio— no depende del número exacto.
- **`D-19` sigue en pie, y ahora por un motivo más simple:** `periodo_id` es **el informe
  donde la campaña aparece**, no el período de sus fechas. No hay nada que deducir: es una
  decisión editorial y la escribe una persona.
- **Punto 2 · los tres remitentes sueltos, diferidos y silenciados.** Entrada `P2` en
  `PENDIENTES` con las tres ubicaciones y la pregunta textual, más la marca en §2.5.
  **`camp_bench_` (sin `_remitente`) queda explícitamente afuera del cajón**: su pregunta es
  otra y meterlo lo habría dado por cerrado.

### ⚠ Punto 3 · PARADO. La lámina 18 no coincide con lo que midió `0.4`, y la plantilla NO se tocó
- **No hubo backup porque no hubo escritura.** El prompt lo previó: *"si al abrir la
  plantilla la lámina 18 no coincide con lo que midió `0.4`, reportar el diff y parar este
  punto"*. Es exactamente el caso.
- **Las cinco celdas donde había que agregar los tokens NO están vacías: no existen como
  celdas.** La tabla de la lámina 18 (`objectId p18_i1084`, 7 filas × 9 columnas) tiene
  **celdas combinadas**:
  | fila | col 1 · Envío | col 2 · Fecha |
  |---|---|---|
  | 2 · envío 1 | `{{camp_env1_rem}}` | `{{camp_env1_fecha}}` |
  | 3 · envío 2 | **(combinada)** | `{{camp_env2_fecha}}` |
  | 4 · envío 3 | **(combinada)** | `{{camp_env3_fecha}}` |
  | 5 · envío 4 | **(combinada)** | **(combinada)** |
  | 6 · envío 5 | **(combinada)** | `{{camp_env5_fecha}}` |
  **La columna "Envío" está fusionada verticalmente desde la fila 2**, y la celda de fecha
  del envío 4 está fusionada con la del envío 3.
- **Lo que `0.4` midió no era "faltan cinco tokens".** `piezasDeTextoDeSlide_` **saltea las
  celdas combinadas que no son la principal** —está escrito en su propio código— así que
  midió *"cinco posiciones sin token propio"*, y la causa es la combinación, no un olvido.
  **El prompt de hoy heredó esa lectura y pidió escribir en celdas que no existen.**
- **Agregarlos exigiría descombinar celdas**, que es un cambio **estructural** de la tabla,
  muy por encima de *"agregar cinco tokens en esas celdas"*. La autorización del 07/08 es
  puntual y acotada a esos cinco tokens: **descombinar no está adentro**, y se para.
- **Lectura, no hecho:** una columna "Envío" fusionada para las cinco filas sugiere que el
  equipo diseñó la lámina con **un remitente para toda la tabla**, no uno por envío — que es
  justamente la pregunta diferida del punto 2. Si eso fuera así, los cuatro `camp_envN_rem`
  **no harían falta**. No se verificó con el equipo y no se decide acá.
- **`C-01` sigue vigente y no se aflojó.** La autorización quedó registrada, sin usar.

### `TOKENS.md` no estaba mal, y corregirlo habría introducido un error
- El punto 3 pedía *"corregir `TOKENS.md`, que ubica esta tabla en la lámina 22"*.
  **Verificado antes de tocarlo, como quedó anotado el 06/08:** esa tabla numera
  **`Plantilla_SECCO.pptx`** —lo dice su propio encabezado— y en SECCO la 22 **es** el
  desagregado de directa mail. La 18 que medí es de **`JM_marcada`**, otro archivo. **Son
  dos numeraciones distintas, no una contradicción.** No se editó ni una línea.
- Esto cierra el pendiente que la corrida del 06/08 dejó abierto sobre qué numeraba esa
  tabla. **La cautela de no anotarlo como inconsistencia estaba bien puesta.**
- **Prueba:** sólo lectura sobre la plantilla. **La plantilla no se abrió para escritura, no
  se copió y no se modificó.**

## Filtro declarativo — Partes A, B y D (2026-08-08) — commit de esta entrada
- **Parte A ✅** `MARCADORES.filtro` existe. Entró por `COLUMNAS_DELTA_` antes que por
  `headers`: `protegidas (con diferencia): 0` y las **19 filas curadas intactas**. ⚠ La
  columna quedó en el índice **9** (entre `valor_fijo` y `formato`), no en el 10: el índice
  se cuenta sobre el esquema del momento. **Se deja como quedó** — todo se lee por nombre.
- **Parte B ✅** El filtro se aplica **después de leer, sobre las filas del `ctx`**, nunca
  dentro de `leerFuente`. Sintaxis `campo=valor` / `campo!=valor` (**`!=`, no `≠`**).
  **Control positivo:** sin filtro **3364** sobre 16 filas · `figura=Jorge Macri` **2307**
  sobre 4 · `figura!=Jorge Macri` **1057** sobre 12 · **2307 + 1057 = 3364** y 4 + 12 = 16.
  Filtro mal escrito → `@filtro_mal_escrito`; campo no mapeado → `@filtro_campo_no_mapeado`.
  Cero filas sale `sin_datos` con el motivo, no `0`. Los cinco marcadores `prueba_*` se
  retiraron en la misma corrida: `MARCADORES` volvió a 19 filas.
- **Parte D ✅** `SECCIONES.filtro` **implementada desde cero** — estaba declarada y muerta.
  Filtra **los ítems de la iteración**, que es lo que su único caso real necesita:
  `comunicaciones_post` con `etapa=post` pasó de emitir **5 ítems a emitir 2** —San
  Cristóbal (post) y Retiro (post)— y **reporta los 3 excluidos con su motivo**
  (`etapa = "pre"` ×2 y `etapa = ""` en Orden Público). El filtro de sección se hereda a los
  marcadores por `opciones.filtro_seccion`, y **el del marcador gana** si declara el suyo.
- **⚠ Parte C ✗ NO se ejecutó.** Ver el reporte: el corte de `dig_jm_gcba` vive en
  `digital`, cuya rama del despachador exige el `id_cuenta` del ítem, y los tokens de pauta
  no están cableados. No se cableó ningún token nuevo.
- **No se generó informe.** El intento se cortó por red (`ECONNRESET`) y **se verificó que
  no escribió**: `CORRIDAS` no tiene ninguna fila del 08/08. No hubo doble escritura.
- **Prueba:** las 10 pruebas pasan. Diff antes y después con `protegidas (con diferencia): 0`.

### Aclaración y arreglo del 09/08 — deuda del prompt anterior
- **La Parte D entró en el commit `073f210`**, cuyo título dice sólo "Partes A y B". No se
  reescribe historia: queda dicho acá para que se pueda encontrar.
- **`SECCIONES.filtro` y `MARCADORES.filtro` tienen sintaxis idéntica y dominios distintos**,
  y el reporte del 08/08 nombró sólo uno de los dos usos. Ahora está escrito en el código,
  arriba de `parsearFiltro_`: **`MARCADORES.filtro` filtra filas de la base** (vocabulario:
  `MAPEO`) y **`SECCIONES.filtro` filtra ítems de la iteración** (vocabulario: la fuente —
  `etapa`, `tipo`, `eje`). Las dos cosas estaban implementadas; sólo una estaba dicha.
- **⚠ Y esa ambigüedad escondía un bug latente, arreglado hoy.** `SECCIONES.filtro` también
  se hereda al marcador que no declara el suyo, y ahí filtra filas de la base. Con
  `etapa=post`, `buscarMapeo` no encuentra `etapa` en ninguna solapa de ninguna base: **los
  marcadores de `comunicaciones_post` habrían fallado todos** con
  `@filtro_campo_no_mapeado`. No se manifestó porque esa sección no tiene marcadores
  todavía. **Ahora un filtro heredado cuyo campo no está mapeado se ignora y se dice en la
  traza**; uno propio sigue fallando, porque ahí alguien lo declaró contra esa solapa.

## Cuenta homónima — desempate implementado, y la hipótesis del empate resultó FALSA (2026-08-09) — commit de esta entrada
- **0.1 · Dónde se elige la cuenta:** `anclar_()` (`Union.gs`), con `scoreMatchDigitalRdv_`
  como score y `candidatosCercanosPorFecha_` como prefiltro (±14 días, valor hardcodeado).
  Los candidatos salen de `digitalUnido.porCuenta`, y su `nombreCampana` de
  **`sd_campana_digital` / `sd_campana_cuentas`** — o sea de *Seguimiento digital*, **no**
  de `Directa IVR`, que es donde se vio el nombre repetido.
- **0.2 · Por qué campo desempata hoy: por ninguno.** `scoreMatchDigitalRdv_` puntúa
  barrio/comuna/eje (0,5/0,4), tipo (0,2) y solapamiento de tokens (0,3). **La fecha no
  suma nada.**
- **0.3 · Señal de fecha disponible:** `candidato.parseado.fecha` (parseada del nombre de
  campaña, ya calculada para el prefiltro) y la fecha del encuentro en `REUNIONES`.
- **Parte A · desempate implementado y verificado que NO rompe.** `anclar_` desempata por
  proximidad temporal **sólo cuando varios comparten el score máximo**, y devuelve
  `ambiguo` —sin elegir ninguna— cuando no puede: sin fecha objetivo, con algún candidato
  sin fecha parseada, o con dos a la misma distancia. La traza dice qué eligió y por qué.
  Siguen **5 anclados, 0 sin link, 0 en baja confianza**, con los mismos scores.
- **⚠ Y no arregló el caso: Orden Público sigue resolviendo a `3347-JULJDGAG`.** Sin traza
  de desempate, o sea **no hubo empate**. **La hipótesis del prompt —y la mía— era falsa:**
  las dos homónimas no sacan el mismo score. La causa real no se midió: la medición que la
  respondería (`unirDigitalPorCuenta` + scores de las dos) **no vuelve por `/dev`**, y ahí
  se cortó la corrida.
- **0.4 · sin medir**, por lo mismo.
- **Prueba:** las 10 pruebas pasan. Anclaje corrido y comparado contra el estado anterior.

## Clave de match — la fecha entra al score y Orden Público ancla a `3387` (2026-08-10) — commit de esta entrada
- **Por qué ganaba `3347`, medido:** los nombres **no eran idénticos**. El matcher compara
  `sd_campana_digital`, donde `3387` es *"Agenda RDV Con 1 - Orden Público Eje Norte **28/7**"*
  y `3347` *"…Orden Publico Eje Norte **21/7**"*. Comparten eje, tipo y casi todos los tokens,
  así que sacaban casi el mismo score — **y la única señal que las separa, la fecha, no
  entraba al score**: se usaba sólo como prefiltro de ±14 días, que las dejaba pasar a las dos.
- **Arreglo:** la fecha pesa **0,5**, igual que el barrio. <1 día suma 0,5; ≤2 días 0,25; más
  lejos no suma **y no resta** —el nombre puede traer la fecha de la convocatoria y restar
  convertiría un match flojo en `sinLink`—.
- **Anclaje antes → después:** los 5 siguen anclados, 0 sin link, 0 en baja confianza.
  **Orden Público pasa de `3347-JULJDGAG` a `3387-JULJDGGC`**; los otros cuatro se quedan en
  las mismas cuentas (`3354`, `3346`). Los scores suben de 0,82/0,77 a **1,00** en los cinco.
- **⚠ `0.2` desmintió parte del plan.** Los formatos de nombre **difieren por canal**:
  `Directa IVR` trae *"Reunión de vecinos JM Boedo 9/1"* —figura, barrio y fecha— y
  `Directa Mail` trae *"Obras Trambus"*, sin ninguna de las tres. **Poner mail primero, como
  pedía la Parte A, habría mejorado la cobertura y roto el parseo.** La Parte A no se hizo:
  el arreglo salió del score, sin tocar de dónde sale el nombre.
- **Parte C · los once, con la cuenta correcta y `ULTIMO`:** ninguno cierra, **y ninguno falla
  ya por la cuenta**. `enc_atendidos` 34.179 · `enc_e75` 13.833 · `enc_marque1` 174 ·
  `enc_audiencia` 37.763 son exactamente **la última fila IVR de `3387`**; los esperados
  (71.234 · 27.599 · 256 · 78.637) son la **suma de sus dos filas**. `enc_mails_enviados` da
  **582**, el envío del **03/08 — fuera de la ventana**. **Todos fallan por `ULTIMO`**, que no
  se toca en este prompt por decisión del 04/08.
- **Prueba:** las 10 pruebas pasan. Deck `1uFUCQ0maspF9ZODpF2gAKxscwV7hoyeiiMcur1gNkKo`,
  corrida `jm-20260805-121426`, 18 con valor / 304 faltantes.

## Los once números — diez de once cierran dígito a dígito (2026-08-11) — commit de esta entrada
- **0.1 ✅ la premisa se sostiene.** Las cinco filas de mail de `3387`, y la del **25/07** da
  **44.043 / 43.439 / 4.652 / 145**, exactamente lo publicado.
- **⚠ 0.2 · el campo que distinguía existía y no estaba mapeado: `Tipo de mail`** (columna I
  de `digital/Directa Mail`). Las cinco filas: **`Convocatoria` ×3** (22/07 ×2 y 25/07),
  **`Confirmación`** (27/07) y **`Agradecimiento`** (03/08). No hubo que inventar ninguna
  regla: había que **registrar una columna**.
- **0.3 · la ventana NO alcanzaba.** De las cinco filas, **2 caen en la ventana** 24–30/07
  (25/07 y 27/07), y con `ULTIMO` la última es la de **confirmación** (583). Filtrar por
  ventana habría cambiado 582 por 583 y seguía mal.
- **La solución, que es la más simple que funciona:** filtro `mail_tipo=Convocatoria` y
  `ULTIMO` **sin tocar**. Quedan tres convocatorias y la última es la del 25/07 — la
  publicada. ⚠ **Depende del orden de filas de la hoja**, que es frágil; queda dicho.
- **⚠ 0.4 · no se pudo generalizar: `3354` (San Cristóbal) y `3346` (Retiro) tienen CERO
  filas de mail.** La regla no se puede validar contra ellos porque no hay contra qué. Sirve
  para `3387` y **no se sabe** si sirve para el resto.
- **Parte A · IVR a `SUMA`** en los cuatro contadores (`VALIDACION` §3.2).
- **`enc_e75_pct` NO pasó a `SUMA`, pasó a `PCT`** `ivr_e75/ivr_atendidos`. Sumar dos
  porcentajes daba **77,6%** donde el valor es 38,7%. El prompt lo metía en el mismo saco que
  los cuatro contadores; **un porcentaje no se suma**.
- **`mail_tipo` entra a `MAPEO` sin `valores_incluidos`**, a propósito: filtrar ahí sacaría
  las filas de confirmación y agradecimiento **para toda la corrida**, y las láminas de post
  las van a necesitar. El corte va por `MARCADORES.filtro`, que es por marcador.
- **Parte C · diez de once cierran dígito a dígito.** IVR: **78.637 · 71.234 · 27.599 · 256**.
  Mail: **44.043 / 43.439 / 4.652 / 145**, con **10,7%** y **3,1%**. El once,
  `enc_e75_pct`, da **38,74** contra **39** publicado: es el mismo número, el informe lo
  redondea a entero. **No se ajustó nada.**
- **Prueba:** las 10 pruebas pasan. Diff con `protegidas (con diferencia): 0` y `agregadas: 1`.

### ⚠ Regresión introducida hoy por `SUMA`, medida en el deck
- **En la slide de Orden Público los once cierran** (deck `14_QBHSTHu9lxinvemh7CMVwCct51ItzpmzzY3Wmr0Oo`,
  corrida `jm-20260805-125133`): 71.234 · 78.637 · 256 · 27.599 (38,74%) · 44.043.
- **Pero `SUMA` sobre cero filas devuelve `0`, no `sin_datos`.** Las otras cuatro slides de
  encuentro —San Cristóbal y Retiro, que no tienen filas de IVR— muestran **`0`** en
  `enc_atendidos`, `enc_audiencia`, `enc_marque1` y `enc_e75`, donde con `ULTIMO` salía
  `«FALTA»`. **Son 16 ceros falsos**, y son los que hicieron subir "tokens con valor" de 18 a
  **34**: el conteo mejoró por un artefacto, no por datos.
- **Es exactamente el modo de falla que el proyecto combate:** un número plausible y
  equivocado es peor que un hueco. Un cero de audiencia se lee como "no llamamos a nadie",
  no como "no hay dato".
- **Los de mail NO tienen el problema:** `ULTIMO` sobre cero filas sigue dando `sin_datos` y
  esas cuatro slides muestran `«FALTA:enc_mails_enviados»`, que es lo correcto.
- **No se arregló acá, a propósito.** Tocar `opSUMA` cambia el comportamiento de **todos** los
  marcadores que suman, y merece su propia medición — no una corrección apurada al final de
  una corrida cuyo objetivo era otro. **Queda como lo primero del próximo prompt.**

## `ULTIMO` por fecha — el orden de la hoja deja de decidir (2026-08-12) — commit de esta entrada
- **0.1 · Cómo elegía:** `opULTIMO` recorría `valoresDeCtx_` **desde el final del array** —
  o sea **la última posición de la hoja**. La línea era el `for (var i = valores.length - 1; ...)`.
- **0.2 · Ocho marcadores usan `ULTIMO`**, y el cambio los toca a todos: los seis de
  `digital/Directa Mail` (`enc_mails_enviados`, `_entregados`, `enc_aperturas`,
  `enc_clics_ctor`, `enc_or`, `enc_ctor`) más **`enc_impresiones` y `enc_alcance`**, de
  `digital/Digital`.
- **0.3 · Las dos solapas afectadas SÍ tienen fecha mapeada:** `digital/Digital` →
  `fecha_periodo` col **E**, `digital/Directa Mail` → col **F**. No hizo falta el camino de
  respaldo para estos, pero se implementó igual.
- **0.4 · `enc_alcance` y `enc_impresiones` están entre los afectados.**
  `CONFIG_INFORMES.md` §4.1 dice que alcance y frecuencia **no son sumables** y van por
  `ULTIMO`/lookup: **siguen en `ULTIMO`**, sólo cambia *cuál* fila elige. No se los pasó a
  `SUMA` ni se los tocó.
- **0.5 · Foto previa:** los once en `ok`, con los valores del 11/08.
- **Parte A · el cambio.** `opULTIMO` elige **la fila con la fecha más alta**. El despachador
  arma `ctx.fechas` —resolver qué columna es la fecha es **estructura** y por eso vive en
  `Generador.gs`; `opULTIMO` sólo elige, que es lo que sí es de `Marcadores.gs`—.
  Sin fecha mapeada **cae al comportamiento viejo y lo dice en la traza**
  (`ÚLTIMO por POSICIÓN (sin fecha utilizable)`).
- **Empate en la fecha más alta con valores distintos: no elige.** Sale
  `«FALTA:@ultimo_ambiguo»` con los valores empatados en la traza. **Si los valores
  empatados son idénticos sí elige** — no hay nada que decidir, y fallar ahí sería un hueco
  gratis. Es una decisión propia, anotada.
- **Control positivo, sin tocar la base:** `opULTIMO` con las tres convocatorias reales en
  orden de hoja da **44.043**; **con las filas invertidas da 44.043 igual**. Más: sin fechas
  cae a posición, empate distinto sale ambiguo, empate igual elige.
- **Los once siguen cerrando**, con los mismos valores que la foto de `0.5`.
- **Prueba:** las 10 pruebas pasan.
- **Deck regenerado:** `1vEdfOnXV3o3SmJKuzCG_WcWoqn_9_9_cpiAt4DV8Paw`, corrida
  `jm-20260805-133836`, **34 con valor / 288 faltantes** — **idéntico al del 11/08**. Es lo
  esperado: en este caso la fecha más alta y la última posición eran la misma fila, así que
  el cambio **no movió ningún número**. Lo que cambió es que ahora **no depende del orden**.
  `enc_mails_enviados` sigue en **44.043** en la slide de Orden Público.
- **⚠ Los 16 ceros falsos de la regresión de `SUMA` siguen ahí** —`enc_atendidos`,
  `enc_audiencia` y `enc_marque1` en las cuatro slides sin filas de IVR—. No se tocaron: es
  otro objetivo, y está anotado.

## `SUMA` sobre cero filas devuelve `sin_datos` (2026-08-13) — commit de esta entrada
- **0.1 · Qué devuelve cada operación sobre cero filas, medido:** `SUMA` **0** ⚠ ·
  `CONTEO` **0** (correcto) · `ULTIMO` `sin_datos` ✅ · `RATIO` `sin_datos` ✅ ·
  `PCT` `sin_datos` ✅ · `TEXTO` **`undefined`** (no usa filas: sale de `valor_fijo`, y hoy
  ningún marcador la usa). **El problema era sólo de `SUMA`.**
- **0.2 · La distinción se respetó: `CONTEO` no se tocó.** "Cuántos encuentros hubo" con cero
  filas **es** cero y es un dato; "cuánta audiencia" con cero filas es *no sé*. Tratar a las
  seis igual habría roto `ecv_encuentros`, que hoy da **16** y es el único `CONTEO`.
- **⚠ 0.2 bis · `SUMA` tampoco distinguía cero filas de filas vacías:** daba `0` en los dos
  casos. El corte quedó en **`conValor`, no en `valores.length`**, que separa tres cosas que
  antes se veían iguales: cero filas → sin dato · celdas vacías → sin dato · **un `0`
  escrito → cero, que sí es un dato**.
- **0.3 · Marcadores por operación:** `ULTIMO` 8 · `PCT` 6 · `SUMA` 4 (los de IVR) ·
  `CONTEO` 1 (`ecv_encuentros`). El cambio toca a los 4 de `SUMA`.
- **0.5 · Nada depende de que `SUMA` devuelva cero.** Los `PCT` que dividen por un campo de
  IVR ya estaban protegidos: `opRATIO` devuelve `sin_datos` con denominador vacío o cero, así
  que el cambio **no se propaga** a un `NaN` ni a un `Infinity`.
- **Control positivo, siete casos:** cero filas · celdas vacías · no numéricas → `sin_datos`;
  un `0` escrito · ceros con vacías · `5 + (−5)` → **`0`**; suma normal → **60**.
- **El criterio quedó escrito arriba de `opSUMA`**, no sólo acá: es la clase de decisión que
  alguien va a querer revertir en tres meses sin saber por qué se tomó.
- **Prueba:** las 10 pruebas pasan.

## Retiro de la lámina M2 — y la cadena que estaba rota en el primer eslabón (2026-08-14) — commit de esta entrada
- **⚠ La premisa central del prompt era falsa: la plantilla canónica YA ESTABA ARMONIZADA.**
  El prompt dice que *"sigue sin armonizar — la corrida del 29/07 se aplicó por error sobre
  `1JrHvs_p…`"*. Cierto lo del 29/07, **pero el 04/08 se corrió sobre la canónica correcta**
  (`117I0qn1…`), con backup `1VWs5Kzv…` y los 5 renombres aplicados. Está en la bitácora de
  esa fecha. **La Parte B no tenía nada que hacer.**
- **⚠ Y la cadena del prompt estaba rota en el primer eslabón.** *"El `P1` bloquea la
  armonización → la armonización bloquea el sembrado"*: **`LAMINAS_CONGELADAS_` ya excluía la
  slide 10 desde el 03/08**, con testigo `m2_salud_camp`. Los 16 renombres de M2 **nunca
  entraban** a la armonización, y por eso la del 04/08 pudo correr con la lámina intacta.
  **El `P1` no bloqueaba nada desde hacía once días.**
- **0.1 · La lámina es la 10, confirmado por tres vías**: sus 23 tokens son la grilla de
  cinco ejes (`m2_subtes_imp`, `m2_transito_imp`, `m2_desalojos_imp`, `m2_salud_imp`,
  `m2_seguridad_imp`, los `m2_camp1-5`, `m2_aud_*`, `m2_clics_*`, `m2_vis_*`); lleva
  `m2_salud_camp`; y `LAMINAS_CONGELADAS_` la declara con ese mismo testigo.
  **⚠ El nombre que usa el prompt —"Status semanal de M2"— es el de la slide 9**, que es otra
  cosa (métricas de mail de M2). Se identificó por contenido, no por título.
- **0.2 · Se van 23 tokens con la lámina.** La plantilla tiene **195** y quedaría en **172**.
- **0.3 · 8 tokens `m2_*` quedan fuera de la 10**, todos en la slide 9 (`m2_mails_enviados`,
  `m2_aperturas`, `m2_or`, `m2_mails_entregados`, `m2_clics`, `m2_ctor`, `m2_campanias`,
  `m2_envios`). **No se van con ella y no quedan huérfanos**: su lámina sigue viva.
- **0.4 · Renombres: 5 dentro y 16 fuera.** De los 5, **cuatro ya no tienen ocurrencias**
  —ya se aplicaron el 04/08— y **el quinto no se debe aplicar**:
  `{{enc_audiencia}} → {{enc_alcance}}` tiene el **destino ya presente en la misma slide 6**,
  así que aplicarlo crearía dos cajas con `enc_alcance`. Es la regresión de `enc_audiencia`.
  Y `enc_audiencia` está cableado a `ivr_audiencia`: **la ocurrencia que queda es legítima**.
- **0.5 · Queda una colisión, y no es de M2:** `rrss_area1` aparece en **dos cajas de la
  slide 21**. Ningún renombre la toca, así que no bloquea; queda reportada.
- **Parte A · lámina retirada.** Backup `JM_marcada — backup 2026-08-05 16:23`
  (`1N5Hhp3eXK-Otdb3knEaXHfS0qdGo0diWyinwg_n1n9Q`), testigo verificado **antes** de escribir,
  y **escondida (`skipped`), no borrada** — reversible en un clic.
  **Se prefirió esconder también por una razón técnica:** borrar la haría desaparecer el
  testigo `m2_salud_camp`, y entonces `filtrarRenombresPorLaminasCongeladas_` devolvería
  `ok:false` y **rompería toda armonización futura**.
- **Parte B · no se corrió**, porque el único renombre aplicable produce una colisión.
- **Parte C · `P1` cerrado**, tachado y con la explicación: la caja era un **total** con
  nombre de eje, confirmado por las líneas que van de las cinco cajas de campañas a la ancha.
- **`C-01` no se derogó:** se anotó una **suspensión acotada y fechada** en
  `REGLAS_NEGOCIO.md`, que vuelve a regir en producción.

## Piloto del Resumen Ejecutivo — el mecanismo, sin el sembrado (2026-08-15) — commit de esta entrada
- **0.1 · El inventario, medido sobre la plantilla.** Slide **2 (JM): 21 tokens** en 18 cajas
  (`mail_*`, `ivr_*`, `cc_*`, `imp_*`, `pauta_*`, `contenidos_total`, `frecuencia`).
  Slide **3 (GCBA): los mismos con prefijo `gcba_`**, en 17 cajas. **No son 19**: el conteo
  que circulaba era del 04/08.
- **⚠ 0.2 · NO puede ser una sección repetible, y `SECCIONES` la declara así.** Los tokens de
  GCBA llevan **prefijo propio** (`gcba_mail_envios` contra `mail_envios`), y una sección
  repetible emite **el mismo bloque de tokens** por cada ítem. **Son dos láminas con tokens
  propios** y hay que declararlas así. La fila `resumen_ejecutivo` (`repetible` sobre
  `entidad (JM / GCBA)`, `estado = manual`) **quedó sin corregir**: no llegué.
- **⚠ 0.3 · El punto duro tenía DOS huecos, no uno.**
  1. **Un marcador de `digital` sin `id_cuenta` ni siquiera llegaba a leer**: fallaba con
     `@digital_sin_cuenta`. La única vía a esa base era el proveedor por cuenta del Paso 2.4.
     **Eso bloqueaba de raíz cualquier agregado del período** — y es lo que el prompt buscaba
     como "recorte por ventana", pero el problema estaba un paso antes.
  2. **Y `leerFuente` sobre `digital` no recorta**: devuelve **2108 filas de 2164** con
     `columna_fecha: null` y `ventana_aplicada: null`. Las 56 que faltan son la lista blanca
     de `mail_estado`, no la ventana.
- **La variante, implementada:** sin `id_cuenta` se cae a `leerFuente` y **se recorta por la
  `fecha_periodo` de cada solapa** — mail por fecha de envío (col F), IVR por fecha de inicio
  (col D), que es exactamente el criterio del usuario del 15/08 **sin cambiar nada de `MAPEO`**.
  Sin `fecha_periodo` mapeada **falla con `@sin_fecha_para_recortar`** en vez de devolver el
  total de todos los períodos. **`BASES.modo_periodo` de `digital` no se tocó** y la rama por
  cuenta de los `enc_*` tampoco.
- **⚠ 0.6 · El tiempo NO escala con la cantidad de marcadores, y ése es el dato del piloto.**
  Doce corridas medidas desde `CORRIDAS` (inicio en el `corrida_id`, fin en
  `fecha_generacion` — se puede medir **aunque la respuesta no vuelva**):
  | marcadores | corridas | tiempo |
  |---|---|---|
  | 13 (04/08) | 6 | **186–286 s** |
  | 19 (05/08) | 5 | **226–346 s** |
  **La dispersión dentro de un mismo número de marcadores (±60 s y hasta 120 s) es mayor que
  la diferencia entre 13 y 19.** El costo está dominado por otra cosa — consistente con el
  `P1` del timeout, que ya anota que el anclaje solo tarda 93 s.
- **Parte A · NO se sembró ninguna fila.** El mecanismo está, el sembrado no. Con eso, **el
  piloto no midió lo que venía a medir**: falta el "después".
- **Prueba:** las 10 pruebas pasan.

## Sembrado del Resumen Ejecutivo — 24 marcadores, y el deck que no se pudo regenerar (2026-08-16) — commit de esta entrada
- **0.1 · `isSkipped()` existe en `SlidesApp`** y devuelve `[10]`. La Parte A salió directa.
- **0.2 · Ningún `[MANUAL]` cae en las slides 2 y 3.** Nada quedó bloqueado por eso.
- **⚠ 0.4 · Las dos láminas NO son la misma métrica sobre dos recortes.** Slide 2 (JM): 18
  cajas, **21 tokens** —tres cajas llevan dos—. Slide 3 (GCBA): 17 cajas, **19 tokens**, no
  21. **JM lleva IVR (4 tokens) y GCBA no; GCBA lleva SMS (2) y JM no.** Es coherente con la
  regla del `Pedido-1`: SMS es todo GCBA. **La premisa de "los mismos con prefijo `gcba_`"
  era falsa.**
- **Parte A · el denominador pasa de 195 a 172**, con los 23 de la lámina escondida
  reportados aparte en `tokens_en_laminas_escondidas`, no borrados.
- **Parte B · 24 marcadores sembrados de 40.** `MARCADORES` pasa de 19 a **43 filas**. Se
  mapeó `mail_remitente` (col G): **sin esa fila las dos láminas darían idéntico.**
- **Los 16 que quedaron afuera, todos por falta de fuente y ninguno por decisión:** los ocho
  de **Call Center** (`cc_base`, `cc_campanias`, `cc_contactados`, `cc_contact_pct` y sus
  `gcba_`) — CC no está en `digital`, está en `looker`, y **`cc_base` no existe en ninguna**;
  los seis de **impresiones por plataforma** (`imp_google/meta/prog` y sus `gcba_`) — sólo hay
  `dig_impresiones`, que es el total; y `contenidos_total` × 2, sin campo.
- **⚠ Y un bug propio, introducido el 15/08 y arreglado hoy: `RATIO`/`PCT` partían ANTES del
  recorte por ventana.** `mail_or` dividía **4.859.412 / 21.268.081** —todas las filas de
  todos los períodos— mientras su `SUMA` hermana sumaba **211.357** sobre las 7 filas
  recortadas: **dos números del mismo marcador salidos de universos distintos.** Ahora parten
  después: `mail_or` = **25,42%** sobre 211.357/831.577.
- **JM y GCBA dan distinto donde deben:** mail **838.571** contra **3.839.688** (7 filas
  contra 80), y OR **25,42%** contra **28,57%**. El corte funciona.
- **⚠ Tres grupos quedaron en `sin_datos`, y el patrón es el mismo:** el recorte por ventana
  deja **cero filas** en `Directa IVR` (0 de 57, sobre `Inicio`), en `Seguimiento digital`
  (`sd_pauta_*`) y en `Digital` (`imp_total`, `frecuencia`). Puede ser correcto —esas
  campañas no empezaron esa semana— o puede ser que el criterio *"las que empezaron esos
  días"* no aplique a pauta ni a digital. **No se ajustó nada.**
- **⚠ Parte C · el deck NO se pudo regenerar.** La corrida **no dejó fila en `CORRIDAS`**:
  van **tres de cuatro**. Sin eso **no hay "tokens con valor / faltantes" después, ni medición
  de tiempo con 43 marcadores** — que era el cuarto criterio. Es el `P1` de `generarInforme`,
  ya anotado, y hoy es el bloqueante de cualquier verificación end-to-end.
- **Prueba:** las 10 pruebas pasan. Diff con `protegidas (con diferencia): 0` y `agregadas: 1`.

## `generarInforme` — el deck se crea siempre, y la corrida muere en el medio (2026-08-17) — commit de esta entrada
- **⚠ `0.1` · La evidencia que faltaba estaba en Drive, y nadie la había mirado: **22 decks
  en la carpeta de salida contra 12 filas en `CORRIDAS`**. Los diez huérfanos tienen las horas
  exactas de las corridas que "no volvieron".
- **`0.4` · La causa, en el código:** `escribirCorrida_` estaba **al final de todo**, después
  de `escribirFaltantes_`. Una corrida que moría después de crear el deck **no dejaba ningún
  rastro, por diseño** — y sin rastro no se puede diagnosticar. Es lo que dejó los últimos
  cuatro objetivos sin verificar.
- **`0.5` · El mapa de tokens pesa 25.463 caracteres.** No son megabytes, pero es la parte
  gorda de la respuesta.
- **`0.2` y `0.3` no se corrieron.** `0.1` los volvió innecesarios para decidir: con el deck
  creado y la fila faltante, el diagnóstico ya estaba. Gastar la corrida en cronometrar
  etapas habría dejado el arreglo sin hacer.
- **Parte A · `CORRIDAS` se abre al empezar.** `abrirCorrida_` escribe la fila apenas existe
  el deck, con el marcador *"(corrida en curso — si esto queda así, murió antes de
  terminar)"*; `escribirCorrida_` la completa **en su lugar** en vez de agregar otra. Sigue
  aceptando llamadas sin número de fila, así que ningún otro llamador se rompe.
- **⚠ Y el arreglo corrigió el diagnóstico en la misma corrida.** `CORRIDAS` pasó de 12 a
  **15 filas**, y la última quedó así:
  `jm-20260805-222543 · deck 1MNwfxbDymWSdbjbroN4YqV26f3DxcRTH5mj7_79if_A · (corrida en curso)`.
  **El motor NO completa.** Crea el deck y muere entre eso y el final. Lo que reporté hace
  una hora —"el motor completa, es transporte"— **era falso en su segunda mitad**: el deck sí
  se crea siempre, pero la corrida no termina.
- **Parte B · no se pudo hacer.** Sin corrida completa no hay mapa de tokens ni deck escrito,
  así que los cuatro objetivos pendientes **siguen sin confirmar**. Lo que sí quedó es que
  ahora **cada intento deja fila**, que era el criterio que el prompt marcó como el que no se
  puede saltear.
- **Prueba:** las 10 pruebas pasan.

## Dónde muere la generación — etapa 4, a los 324 s, y el cliente la relanza (2026-08-18) — commit de esta entrada
- **0.1 · Las cinco etapas**, leídas del código entre `abrirCorrida_` y `escribirCorrida_`:
  expandir secciones repetibles · mapa `token → objectId` · pasada por ítem · tokens fijos ·
  escribir faltantes.
- **0.2 · Instrumentadas las cinco.** `marcarEtapa_` escribe **en el momento y hace `flush()`**,
  no acumula: acumular y volcar al final habría reproducido el problema que `abrirCorrida_`
  acababa de resolver. Va en la columna `faltantes`, libre hasta el final — **sin columna
  nueva, sin `COLUMNAS_DELTA_`**. Y traga sus excepciones: instrumentar no puede voltear la
  corrida que mide.
- **⚠ 0.3 · MUERE EN LA ETAPA 4 (tokens fijos), A LOS 324 s.** La fila lo dice sola:
  `jm-20260805-231421 | (en curso) 4 · tokens fijos · +324 s`. El desglose que se puede
  reconstruir: **etapas 1+2 ≤ 125 s**, **etapa 3 (pasada por ítem) ~200 s** (de 125 a 324),
  y muere en la 4.
- **La causa es el límite de ejecución de Apps Script, no el transporte.** 324 s más lo que
  dure la etapa 4 pasa los **360 s (6 minutos)** que Apps Script permite. **Los ~150 s "sin
  atribuir" eran la pasada por ítem**, que nadie había cronometrado.
- **⚠ 0.4 · SÍ se duplica, y ahora se ve.** Una sola invocación de `generarInforme` dejó
  **dos filas**: `jm-20260805-231421` y `jm-20260805-232018`, con seis minutos de diferencia.
  **El reintento de `tools/api.js` relanza la generación entera.** Explica los cinco decks de
  una sola corrida del 04/08, y los de 20:08 / 20:14 / 20:20 que "nadie lanzó".
- **Y explica los 22 decks contra 12 filas** sin necesidad de ninguna otra hipótesis: cada
  reintento copia la plantilla —lo primero que hace— y después muere en la etapa 4.
- **Prueba:** las 10 pruebas pasan.

## Inventario de decks de salida contra `CORRIDAS` (2026-08-18, `C.1`) — commit de esta entrada
- **29 decks en la carpeta, 17 filas en `CORRIDAS`, **18 huérfanos**.
- **No se borró ninguno.** El addendum posterga la Parte C mientras la contradicción esté abierta: hoy los decks son la única evidencia física de cuántas corridas se lanzaron.
- **`C.1.b` · se leyó `CORRIDAS` por `eval`**, que es un tercer camino que el addendum no contemplaba: no hizo falta agregar la entrada a `API_LECTORES_` ni tocar código. La entrada sigue haciendo falta para la salida "por testigo" de la Parte A, pero no para esto.

| creado | deck_id | corrida |
|---|---|---|
| 04/08 18:03 | `1AU0tkyRQo0kGccnUGJqz0MoEqtiDpy5awYGy8VjTtH8` | jm-20260804-180308 |
| 04/08 18:42 | `10BuvocJrk48SiUIA7eM4i1-0xyprwhqx` | **(sin fila)** |
| 04/08 18:42 | `12aREdG64A5Zo6c3W8HRd4aT6SzAi-s4_` | **(sin fila)** |
| 04/08 18:42 | `1GMk95dogz_nYoN0MTOX4FOGXvzJyDjra` | **(sin fila)** |
| 04/08 18:42 | `16oHHMgk8iFL2yzTZ6I2BVgsVmZs6nFGW` | **(sin fila)** |
| 04/08 18:42 | `1_SIaantWFLlms0dgNFK8Tit35basI4u5` | **(sin fila)** |
| 04/08 18:42 | `1oPdgJOE1m14FiGmcAGXsaQPEzEA5O_7q` | **(sin fila)** |
| 04/08 18:42 | `1fhPXuys3kOYwYpNTsgpQ2M5Rb4pfPU7Y` | **(sin fila)** |
| 05/08 00:44 | `1gU96TN0c_ODWQM56xxVrYFjGdTw7c_1FqECfbZoZwNY` | **(sin fila)** |
| 05/08 00:50 | `1cXrAhX3-GXs0dYeqwLxYqD1Nrr3ZJ2s1NJYRwz-llWo` | jm-20260805-005053 |
| 05/08 10:42 | `1FgODR5xlcsqstmMmEpauAlBisi52_BdakblrwLrE6eY` | jm-20260805-104211 |
| 05/08 12:14 | `1uFUCQ0maspF9ZODpF2gAKxscwV7hoyeiiMcur1gNkKo` | jm-20260805-121426 |
| 05/08 12:51 | `14_QBHSTHu9lxinvemh7CMVwCct51ItzpmzzY3Wmr0Oo` | jm-20260805-125133 |
| 05/08 12:57 | `1YTYMlx6mWf38geDG6UDx0VbWT9aAnnWDrWnYRj2eGLE` | **(sin fila)** |
| 05/08 13:38 | `1vEdfOnXV3o3SmJKuzCG_WcWoqn_9_9_cpiAt4DV8Paw` | jm-20260805-133836 |
| 05/08 14:30 | `1xCqO9oixYHgEdh7ol2NOk181vBAvg-HVXwb5t2_vveQ` | **(sin fila)** |
| 05/08 14:47 | `1sE9iKwZiisHMvB3VE4XBp8wEEDx9kNar7WIT25I92XM` | **(sin fila)** |
| 05/08 16:54 | `1xxrqdmwYlzXr0pzjN4C2KM5GmIsEdNEAZd43COcC9Tw` | **(sin fila)** |
| 05/08 20:08 | `1kkjNdC6_-si_6WkJjOM7pJ9AEDbbgUrTqNA1qRR60GU` | **(sin fila)** |
| 05/08 20:14 | `1mIpdwc81nmqG707J10gROWE1IQ43us5VSka4RGjKIrA` | **(sin fila)** |
| 05/08 20:20 | `1QCwqVDKpNrIwix9BUM3BxsCxwk8a2i69ft0G4AUWs5w` | **(sin fila)** |
| 05/08 21:44 | `1drsIo_5K8xmNL1YRkhbVBSP9xK-8B9Vpp580YSpKj9E` | **(sin fila)** |
| 05/08 21:50 | `10TD3goIyUh863p0GLwstgA_Yw8lcGyHgj78OYIoMRQY` | **(sin fila)** |
| 05/08 21:56 | `1qhgwOvAgM0JgW_tssRr5XHhv6MG0MuCmtqGM3SQNpK0` | **(sin fila)** |
| 05/08 22:13 | `1cpIDxRmyi2UCqS89bHFL2me_vn7ntbBLVhlY_qmrHaI` | jm-20260805-221341 |
| 05/08 22:19 | `1JwF01d0AHKdZSYq1nqDhPnfXZWYddJIJOCFN57ULnms` | jm-20260805-221941 |
| 05/08 22:25 | `1MNwfxbDymWSdbjbroN4YqV26f3DxcRTH5mj7_79if_A` | jm-20260805-222543 |
| 05/08 23:14 | `1emP39NH51I0dquRqZtHihqMKNlTHMlOTBqABMZvTp3E` | jm-20260805-231421 |
| 05/08 23:20 | `1itPMWTzBRjYyQIbfYO8MinJNqUXnACy0Il2Gv7KEPGM` | jm-20260805-232018 |

### `C.1.d` · Los agrupamientos, sin interpretarlos

- 1 deck(s): 18:03
- 7 deck(s): 18:42 18:42 18:42 18:42 18:42 18:42 18:42
- 2 deck(s): 00:44 00:50
- 1 deck(s): 10:42
- 1 deck(s): 12:14
- 2 deck(s): 12:51 12:57
- 1 deck(s): 13:38
- 1 deck(s): 14:30
- 1 deck(s): 14:47
- 1 deck(s): 16:54
- 3 deck(s): 20:08 20:14 20:20
- 3 deck(s): 21:44 21:50 21:56
- 3 deck(s): 22:13 22:19 22:25
- 2 deck(s): 23:14 23:20

---

## Dos reglas nuevas en la §4 de `CLAUDE.md`: revisar el prompt, y el conocimiento de plataforma (2026-08-18) — commit de esta entrada

**Origen — las dos corridas del 18/08.** La primera atribuyó la muerte de `generarInforme`
al límite de 6 minutos de Apps Script **sin evidencia que descartara la contención de
Sheets**; la segunda corrigió la causa. Y en ninguna de las dos se estaba aplicando
conocimiento de Apps Script como plataforma, que es donde estaba la respuesta. Una causa mal
atribuida sobrevivió a una corrida entera de diagnóstico.

**Qué se escribió, y dónde.** Sólo documentación; ningún `.gs` tocado.

- **`CLAUDE.md` §4, después del párrafo de apertura y antes del punto 1** — *"El prompt se
  revisa antes de ejecutarlo, y lo que habría que cambiarle se reporta"*: las cuatro cosas a
  mirar (premisa desmentida, paso ya hecho o innecesario, método peor que uno disponible,
  `D-NN`/`R-NN`/`S-NN` derogada sin decirlo), *"mejorar no es ampliar"* y *"no inventar el
  faltante"*.
- **`CLAUDE.md` §4, al final** — *"Apps Script es una plataforma con límites conocidos, y ese
  conocimiento se usa"*: candidatos vs. causas, causa vs. observación, la medición con dos
  cosas corriendo, y el instrumento como parte del sistema.

**Los tres roces, resueltos dentro del texto y no sólo en el reporte.**

1. **`SUPUESTOS.md`.** Su encabezado manda asumir lo más probable y seguir, lo que leído
   rápido parece lo contrario de "no inventar el faltante". No lo es: `SUPUESTOS` cubre
   huecos **del dominio** y exige el registro **con ID**, que es lo que deja el supuesto a la
   vista y reversible. Lo prohibido es el supuesto **silencioso sobre qué hay que hacer**.
   Registrar un `S-NN` es la forma de cumplir la regla, no su excepción.
2. **`D-10` y `D-19`/`D-21` como antecedentes**, citados en el texto: no fabricar lo que
   falta, no entrar ni excluir en silencio — el mismo principio aplicado a quien ejecuta el
   prompt en vez de al motor. Refuerzo, no conflicto.
3. **"Mejorar no es ampliar" apoyado en "un prompt, un objetivo"**, que está unos párrafos
   más abajo en la misma sección: revisar el prompt no es licencia para ampliar el alcance.

**Sin duplicar la §3.** El párrafo del grep previo —pedir que se corrija algo que no está en
el archivo— **se referencia, no se repite**: es el caso puntual del que la regla nueva es el
movimiento completo.

**Sin `D-NN` en `PLAN.md`.** Son convención de proceso, y la §7 rutea esa pregunta a
`CLAUDE.md`, no al plan.

**Prompts guardados** en `docs/Prompts/`: `2026-08-06_3_claudemd_revisar_prompt_y_plataforma.md`
(original) y `..._4_..._ParteA.md` (la continuación que aprobó las ubicaciones).

---

## Renombre de cinco prompts: la serie decía 18/08 y se escribieron el 05 y el 06 (2026-08-06) — commit de esta entrada

**Origen.** Los prompts de `docs/Prompts/` llevan fecha en el nombre, y la serie se había
corrido: había cinco archivos llamados `2026-08-18_…` commiteados el **05** y el **06**.
Con un prompt por día el corrimiento no molestaba; con cinco en un día el nombre dejó de
ordenar, y dos prompts distintos —`reintento_relanza_corrida` y
`claudemd_revisar_prompt_y_plataforma`— se leían como del mismo día.

**La fecha real es la del commit que agregó el archivo**, medida con
`git log --diff-filter=A`.

| nombre viejo | commit | fecha real | nombre nuevo |
|---|---|---|---|
| `2026-08-18_donde_muere.md` | `5361f78` | 2026-08-05 22:44 | `2026-08-05_1_donde_muere.md` |
| `2026-08-18_reintento_relanza_corrida.md` | `2b56581` | 2026-08-06 12:07 | `2026-08-06_1_reintento_relanza_corrida.md` |
| `2026-08-18_reintento_relanza_corrida_ADDENDUM.md` | `bfb216d` | 2026-08-06 12:20 | `2026-08-06_2_reintento_relanza_corrida_ADDENDUM.md` |
| `2026-08-18_claudemd_revisar_prompt_y_plataforma.md` | `f934c8c` | 2026-08-06 12:54 | `2026-08-06_3_claudemd_revisar_prompt_y_plataforma.md` |
| `2026-08-18_claudemd_revisar_prompt_y_plataforma_ParteA.md` | `f934c8c` | 2026-08-06 12:54 | `2026-08-06_4_claudemd_revisar_prompt_y_plataforma_ParteA.md` |

Los dos últimos entraron en el mismo commit; el desempate es original primero, continuación
después. Se renombró con `git mv` para que el historial siga al archivo. **Ningún cuerpo se
tocó.**

**El `N` cuenta sólo los archivos que siguen la convención**, no todos los prompts del día
—decisión del usuario—: un número que cuenta archivos que no lo llevan no se puede verificar
mirando la carpeta. Por eso `donde_muere` es `_1` del 05/08 aunque ese día entraran catorce
archivos a la carpeta.

**Referencias actualizadas — cuatro, ninguna fuera de `docs/`:** el título y el campo
`reemplaza:` del `ParteA`, el título del `ADDENDUM`, el campo `Ubicación:` de `donde_muere`,
y la línea de la entrada anterior de esta bitácora que nombraba los dos prompts guardados.
Cero referencias en `CLAUDE.md`, en `tools/` y en los `.gs`.

**El campo `Fecha:` de `donde_muere` se corrigió y quedó anotado** —
`2026-08-05 (el archivo decía 2026-08-18; ver el renombre del 06/08)`. Es metadato del
archivo, de la misma clase que el nombre: corregir uno y dejar el otro mintiendo deja el
archivo contradiciéndose a sí mismo. La anotación es lo que permite reconstruir el renombre
dentro de un mes.

**Lo que se dejó a propósito, y hay que saberlo al leer lo viejo.**

- **Los encabezados de esta bitácora siguen con la fecha corrida.** Las entradas de
  *"`generarInforme` — el deck se crea siempre"*, *"Dónde muere la generación"* e
  *"Inventario de decks de salida contra `CORRIDAS`"* dicen `(2026-08-17)` y `(2026-08-18)`;
  las reales son **05/08 y 06/08**. No se editan: la bitácora es append-only y esta entrada
  es la corrección.
- **El corrimiento es más viejo que el alcance.** Los diez archivos de la serie
  `2026-08-08_…` a `2026-08-17_…` se agregaron **todos el 05/08**, entre las 10:33 y las
  21:43. Quedan con el nombre que tienen: son de otra época y renombrarlos rompe más de lo
  que aclara.

**La convención quedó escrita** en la §3 de `CLAUDE.md`, donde se rutean los prompts nuevos.

---

## Una invocación, una corrida — Partes A y B, y el inventario corregido antes de borrar (2026-08-06) — commit de esta entrada

### ⚠ `C.0` · Siete de los 29 archivos nunca fueron decks

El inventario de `2bcdb4a` contó **29 decks**. Son **22 decks y 7 shortcuts de Drive**
(`application/vnd.google-apps.shortcut`) — se los ve en el ID, 33 caracteres contra los 44 de
un archivo nativo. Los siete se crearon **en el mismo segundo**, 04/08 18:42:23, con el mismo
nombre que el deck de las 18:03, y son el rastro de la limpieza de esa tarde: la entrada
*"Corrida nocturna — punto 6"* cierra a las 18:16 diciendo *"quedaron cinco decks […] sirve el
último y los otros cuatro se borran"*. **No son corridas y no hay nada que explicar en ellos.**

Esta entrada **no edita** la tabla de `2bcdb4a` —la bitácora es append-only—: la reemplaza.
El recuento correcto, antes de borrar nada:

**22 decks · 7 shortcuts · 17 filas en `CORRIDAS` · 11 huérfanos.**

Y cae con ellos la mitad de un hallazgo anterior: *"explica los cinco decks de una sola
corrida del 04/08"* se apoyaba en estos siete. **El patrón de seis minutos se sostiene igual**,
pero sobre los grupos del 05/08, que son medición directa.

| creado | tipo | id | corrida |
|---|---|---|---|
| 08-04 18:03 | deck | `1AU0tkyRQo0kGccnUGJqz0MoEqtiDpy5awYGy8VjTtH8` | jm-20260804-180308 |
| 08-04 18:42 | **shortcut** | `10BuvocJrk48SiUIA7eM4i1-0xyprwhqx` | (no es una corrida) |
| 08-04 18:42 | **shortcut** | `12aREdG64A5Zo6c3W8HRd4aT6SzAi-s4_` | (no es una corrida) |
| 08-04 18:42 | **shortcut** | `16oHHMgk8iFL2yzTZ6I2BVgsVmZs6nFGW` | (no es una corrida) |
| 08-04 18:42 | **shortcut** | `1GMk95dogz_nYoN0MTOX4FOGXvzJyDjra` | (no es una corrida) |
| 08-04 18:42 | **shortcut** | `1_SIaantWFLlms0dgNFK8Tit35basI4u5` | (no es una corrida) |
| 08-04 18:42 | **shortcut** | `1fhPXuys3kOYwYpNTsgpQ2M5Rb4pfPU7Y` | (no es una corrida) |
| 08-04 18:42 | **shortcut** | `1oPdgJOE1m14FiGmcAGXsaQPEzEA5O_7q` | (no es una corrida) |
| 08-05 00:44 | deck | `1gU96TN0c_ODWQM56xxVrYFjGdTw7c_1FqECfbZoZwNY` | **(sin fila)** |
| 08-05 00:50 | deck | `1cXrAhX3-GXs0dYeqwLxYqD1Nrr3ZJ2s1NJYRwz-llWo` | jm-20260805-005053 |
| 08-05 10:42 | deck | `1FgODR5xlcsqstmMmEpauAlBisi52_BdakblrwLrE6eY` | jm-20260805-104211 |
| 08-05 12:14 | deck | `1uFUCQ0maspF9ZODpF2gAKxscwV7hoyeiiMcur1gNkKo` | jm-20260805-121426 |
| 08-05 12:51 | deck | `14_QBHSTHu9lxinvemh7CMVwCct51ItzpmzzY3Wmr0Oo` | jm-20260805-125133 |
| 08-05 12:57 | deck | `1YTYMlx6mWf38geDG6UDx0VbWT9aAnnWDrWnYRj2eGLE` | **(sin fila)** |
| 08-05 13:38 | deck | `1vEdfOnXV3o3SmJKuzCG_WcWoqn_9_9_cpiAt4DV8Paw` | jm-20260805-133836 |
| 08-05 14:30 | deck | `1xCqO9oixYHgEdh7ol2NOk181vBAvg-HVXwb5t2_vveQ` | **(sin fila)** |
| 08-05 14:47 | deck | `1sE9iKwZiisHMvB3VE4XBp8wEEDx9kNar7WIT25I92XM` | **(sin fila)** |
| 08-05 16:54 | deck | `1xxrqdmwYlzXr0pzjN4C2KM5GmIsEdNEAZd43COcC9Tw` | **(sin fila)** |
| 08-05 20:08 | deck | `1kkjNdC6_-si_6WkJjOM7pJ9AEDbbgUrTqNA1qRR60GU` | **(sin fila)** |
| 08-05 20:14 | deck | `1mIpdwc81nmqG707J10gROWE1IQ43us5VSka4RGjKIrA` | **(sin fila)** |
| 08-05 20:20 | deck | `1QCwqVDKpNrIwix9BUM3BxsCxwk8a2i69ft0G4AUWs5w` | **(sin fila)** |
| 08-05 21:44 | deck | `1drsIo_5K8xmNL1YRkhbVBSP9xK-8B9Vpp580YSpKj9E` | **(sin fila)** |
| 08-05 21:50 | deck | `10TD3goIyUh863p0GLwstgA_Yw8lcGyHgj78OYIoMRQY` | **(sin fila)** |
| 08-05 21:56 | deck | `1qhgwOvAgM0JgW_tssRr5XHhv6MG0MuCmtqGM3SQNpK0` | **(sin fila)** |
| 08-05 22:13 | deck | `1cpIDxRmyi2UCqS89bHFL2me_vn7ntbBLVhlY_qmrHaI` | jm-20260805-221341 |
| 08-05 22:19 | deck | `1JwF01d0AHKdZSYq1nqDhPnfXZWYddJIJOCFN57ULnms` | jm-20260805-221941 |
| 08-05 22:25 | deck | `1MNwfxbDymWSdbjbroN4YqV26f3DxcRTH5mj7_79if_A` | jm-20260805-222543 |
| 08-05 23:14 | deck | `1emP39NH51I0dquRqZtHihqMKNlTHMlOTBqABMZvTp3E` | jm-20260805-231421 |
| 08-05 23:20 | deck | `1itPMWTzBRjYyQIbfYO8MinJNqUXnACy0Il2Gv7KEPGM` | jm-20260805-232018 |
| 08-06 13:51 | deck | `1G1VAo1Kvv7ZggV0x_fKQ1y-iUvsu5OPm22EfzUCQLWI` | jm-20260806-135202 (Parte B) |

**`C.3` · Seis filas de `CORRIDAS` apuntan a decks que ya no están en la carpeta.** Se anotan
acá y **no se tocan**: `CORRIDAS` es registro. Son las seis del 04/08 anteriores a las 18:03 —
los decks que la limpieza de las 18:42 se llevó.

| corrida | deck_id (ya no existe) |
|---|---|
| jm-20260804-144641 | `1ptnV_7ifxwq7KOopuYtMVD29k0SfGsoIoA522itZ-Q0` |
| jm-20260804-151254 | `1NAmkeRMNP1aE92cH8Kgv3IJ9TBbIr6At-ug4-orE5Nk` |
| jm-20260804-151618 | `1O8S1J5q2ee6Di37kA9oyPwPA8BHaDfemqjfkKczDDxQ` |
| jm-20260804-153355 | `19855tqeF2s1CpHHFOwnc0tJgyUcOnnzGjWI85BV9YYc` |
| jm-20260804-155102 | `1dQv1xhzfleQAlWzCK5MQ6G4B0dIQpLMNDceZjGEVvX8` |
| jm-20260804-175409 | `1NEkGLjCWJwzf82tHOT8HlpwavIPi5iBuqO2rJYZRIdE` |

### `0.1` · La lista blanca no podía ser por acción

`Api.gs` expone **cinco** acciones: `ping`, `version`, `registros`, `bases`, `llamar`. Las
cuatro primeras son lectura pura —verificados los nueve lectores de `API_LECTORES_` y
`diagnosticoBases_`, ninguno escribe—. **`llamar` es la única que llega al motor, y adentro
conviven `fn=leerMapeo` y `fn=generarInforme`.** Con `llamar` adentro de la lista blanca el
reintento sobre `generarInforme` sigue vivo; con `llamar` afuera se pierde el reintento en el
100% del uso real del cliente. **A nivel de acción no había corte posible.**

### `0.2` · Lo que dice la fila de `232018`, y lo que no

`(corrida en curso — si esto queda así, murió antes de terminar)` — el marcador que escribe
`abrirCorrida_`, **nunca pisado por `1 · expandir secciones repetibles`**, que es la línea
siguiente en el código. Dos lecturas que la fila no separa: murió en esa rendija, **o**
`marcarEtapa_` falló las cinco veces sin que nadie se enterara — traga sus excepciones a
propósito. **"Murió en `abrirCorrida_` por timeout de Sheets" no está escrito en ningún lado
del repo** y no se repite como causa. Queda anotado que el instrumento tiene un punto ciego
justo donde estamos mirando.

### Parte A · El reintento deja de ser el default — `--reintentar`

Commit `4934f9c`. El corte va **por llamada**, no por lista blanca de nombres de `fn`: el
cliente no conoce el motor —`llamar fn=` acepta cualquier global y `eval` trae cualquier cosa
adentro del snippet— y una lista en el cliente **envejece**, porque cada lector nuevo nace sin
reintento hasta que alguien se acuerde de agregarlo. Quien escribe el comando sí sabe si lo
que pide escribe. Sin `--reintentar` el cliente nombra la falla de transporte, dice que no
reintentó a propósito y manda a mirar si la llamada llegó a correr. Corregido el comentario
del 04/08: **no aparece "sin patrón"** — los grupos del 05/08 están separados por seis minutos
exactos.

**Costo, nombrado antes de descubrirlo:** las mediciones por `llamar fn=eval` pierden el
reintento salvo que se pida a mano. Es el caso más frecuente de este proyecto y el más
sensible a una falla de transporte; a cambio, `eval` no queda en ninguna lista que lo declare
seguro sin mirar el snippet.

### Parte B · ✅ Una invocación, una fila, un deck

Una sola invocación de `generarInforme` sobre `jm`. **22 → 23 decks y 17 → 18 filas.** Una y
una. El cliente perdió la conexión a los ~302 s con `ECONNRESET`, que entra por el `on('error')`
y nunca llegó al bucle de reintento — con el código viejo tampoco habría entrado. **No se pudo
provocar una falla de transporte de las que sí lo disparan** (HTML o body perdido), así que la
rama nueva no quedó ejercitada en su camino de reintento: lo que se verificó es que la
invocación deja un solo par.

**La corrida no completó.** `jm-20260806-135202` quedó en `(en curso) 3 · pasada por ítem ·
+159 s`, y seguía ahí a los 304 s. Esta vez las etapas 1+2 tardaron **159 s** contra los ≤125 s
del 05/08, y no llegó a la etapa 4 — la corrida anterior sí, a los +324 s. **Se registra como
observación; no se le atribuye causa acá.**

### `C.4` · Superado el *34 con valor / 288 faltantes*

Se midió sobre el denominador viejo de **195** tokens de plantilla; hoy son **172** (195 menos
los 23 de la lámina escondida). El par no se vuelve a citar como número de referencia hasta
que haya una corrida completa que lo mida sobre 172.

---

## Una invocación, una corrida — `C.1`/`C.2`/`C.5`: la carpeta cierra, y los siete shortcuts no se pueden borrar (2026-08-06) — commit de esta entrada

### ✅ `C.5` · El conteo cierra

**12 decks · 12 filas con deck · 0 huérfanos.** `CORRIDAS` tiene 18 filas; las 6 que no
tienen deck son las del 04/08 anteriores a las 18:03, ya anotadas en la entrada de `C.0` y que
**no se tocan** — `CORRIDAS` es registro.

Era la primera vez desde que se mira la carpeta que los dos lados dan lo mismo.

### `C.2` · Los once huérfanos, a la papelera

Los once decks del 05/08 sin fila (00:44 · 12:57 · 14:30 · 14:47 · 16:54 · 20:08 · 20:14 ·
20:20 · 21:44 · 21:50 · 21:56). **`setTrashed(true)`, no borrado permanente**: es lo
reversible, y el inventario de `C.0` ya los preserva como dato.

### ⚠ `C.1` · Los siete shortcuts NO se pudieron borrar — y el motivo es de plataforma

`setTrashed` sobre ellos devuelve **`Acceso denegado: DriveApp`**. Los once decks del mismo
lote se borraron sin problema en la misma llamada, así que no es la carpeta ni la cuenta.

Los scopes del token (`tools/token.js --info`) son **`drive.file`** y
**`drive.metadata.readonly`**. `drive.file` da acceso de escritura **sólo a los archivos que la
propia app creó**: los once decks salieron de un `makeCopy` del script y entran; **los siete
shortcuts los creó una persona en la UI de Drive** el 04/08 a las 18:42 y quedan afuera.
`drive.metadata.readonly` explica por qué sí se los puede listar, nombrar y clasificar.

**No es una hipótesis suelta:** en la misma llamada, 11 de 11 archivos creados por el script
se borraron y 1 de 1 archivo ajeno fue rechazado.

**Dos salidas, y ninguna se toma por cuenta propia:**

- **Borrarlos a mano en Drive.** Son siete, están juntos en la carpeta, y ya se sabe qué son.
- **Reautorizar el token con scope `drive` completo.** Es interactivo, y **agranda el permiso
  de un cliente de pruebas de "lo que yo creé" a "todo el Drive de la cuenta"**. No parece un
  precio razonable por siete accesos directos.

Mientras tanto **la carpeta cierra igual**: los shortcuts no son decks y no entran en el
conteo. Quedan siete accesos directos apuntando a decks que ya no existen.

### Lo que sí quedó ejercitado del corte de la Parte A

Una medición por `llamar fn=eval` recibió un **404 en HTML** —el modo de falla de transporte
que el reintento viejo sí disparaba— y el cliente respondió: *"NO se reintentó, a propósito […]
mirá si la llamada llegó a correr antes de repetirla"*. **La rama nueva está probada contra
una falla real**, no simulada. La medición se repitió a mano y salió bien.

---

## El presupuesto de una corrida, desglosado — y no entra ni con la etapa 3 en cero (2026-08-06) — commit de esta entrada

**El prompt cierra en su propia condición de cierre.** *"Si la medición muestra que ni con la
etapa 3 en cero entra, el trabajo es reanudación y este prompt cierra ahí, con ese dato."*
**No entra: las etapas 1+2+4 solas suman ~396 s contra un presupuesto de 360.** Las Partes A y
B no se ejecutaron.

### De dónde salen estos números

**De un banco de medición, no de una corrida.** Copia descartable de la plantilla
(`BANCO_MEDICION_060826_borrar`, deck `1Q-UZloxz6HKsmqbaEaBWQOw0C8ddoZNhIq6_MGnHcp0`), creada
**fuera de la carpeta de salidas** y mandada a la papelera al terminar. La carpeta quedó en 12
decks y `CORRIDAS` en 18 filas, igual que antes. Cuatro pasadas entre las 16:20 y las 16:45 del
06/08.

**Ninguno de estos números tiene `corrida_id`, y eso es a propósito.** Los únicos dos números
que salen de corridas reales son `1+2+3 = 324 s` (`jm-20260805-231421`) y `1+2 = 159 s`
(`jm-20260806-135202`), y ninguno de los dos se desglosa — `marcarEtapa_` pisa sus marcas en la
misma celda. El banco es lo que permite abrir el desglose; el precio es que no es una corrida.

### El presupuesto, pedazo por pedazo

| pedazo | medido | qué es |
|---|---|---|
| config + ventana | **1,9 s** | `leerInformes` + `resolverVentana` |
| copiar plantilla + abrir | **6,4 s** | `makeCopy` + `SlidesApp.openById` |
| **etapa 1** | **119,8 s** | expandir secciones repetibles |
| ↳ `itemsDeSeccion_('encuentro')` | **62,8 s** *(y 69,7 s en otra pasada)* | **el anclaje** |
| ↳ `itemsDeSeccion_('comunicaciones_post')` | 3 ms | reusa lo que cacheó la anterior |
| ↳ `itemsDeSeccion_('campana')` | 1,2 s | 0 ítems |
| ↳ el resto, por diferencia | **~55 s** | `duplicate()` + `move()` + `remove()` en Slides |
| **etapa 2** | **9,6 s** | `mapaTokenObjectId_` — 195 tokens distintos, 26 slides |
| **etapa 3** | **~256 s estimados** | la pasada por ítem |
| ↳ `resolverMarcadores` por ítem | **54,3 · 48,7 · 51,1 · 48,2 s** | 4 de los 5 ítems; el 5º no entró en el presupuesto de la pasada |
| ↳ de eso, `leerMarcadores_()` | **0,37 s** | **el 0,7%** |
| ↳ `tokensDeSlide_` | 18,7 s las 26 slides → **0,72 s/slide** | |
| ↳ `replaceAllText` | **5–13 ms por token**, mediana 7 | |
| ↳ `getSlides()` | **11–13 ms** | |
| **etapa 4** | **~267 s** | tokens fijos |
| ↳ `tokensPorSlide_` | **26,9 s** | 193 tokens fijos distintos |
| ↳ `resolverMarcadores('jm', {})` | **238,9 s** | |
| ↳ 193 × `replaceAllText` | ~1,5 s | |
| **etapa 5** | **no medida** | `escribirFaltantes_` |

**Total sin la etapa 5: ~661 s.** El presupuesto es 360.

### `0.6` · La respuesta que cierra el prompt

**1+2+4 = 119,8 + 9,6 + 267 ≈ 396 s.** Ya se pasa de 360 **con la etapa 3 valiendo cero**.

Y la conclusión aguanta aunque el número más raro de la tabla esté mal: si
`resolverMarcadores({})` de la etapa 4 costara lo mismo que una llamada por ítem (~50 s) en vez
de 239 s, 1+2+4 daría ~207 s y quedarían 153 s para una etapa 3 que cuesta ~256 s. **No entra
por ninguno de los dos caminos.**

### `0.3`–`0.5` · Las tres optimizaciones de la Parte A no sirven, y por eso no se hicieron

El prompt las condicionaba a que `0.3`–`0.5` las mostraran caras. **Las tres son baratas:**

1. **`leerMarcadores_()` una sola vez** — pesa **0,37 s de los ~50 s** de cada
   `resolverMarcadores`. Es cierto que no cachea entre llamadas (379 ms la primera, 370 ms la
   segunda), pero sacarlo del loop ahorra **~1,5 s de 661**.
2. **El cache compartido entre ítems** — el costo no está en releer la hoja.
3. **El mapa `objectId → slide`** — `getSlides()` cuesta **13 ms**. No es un costo.

Las tres juntas ahorran menos de 2 s. **"Nada por prolijidad": no se tocó nada.**

**El costo está adentro de `resolverMarcadores`**, que se llama **seis veces** por corrida —una
por cada uno de los 5 ítems más una para la etapa 4— y cuesta ~50 s cada una. Ahí es donde hay
que mirar, y no es lo que este prompt proponía.

### `0.1` · La varianza sigue siendo un candidato sin nombre

**No se puede decir de dónde sale la diferencia entre los dos días**, porque del 05/08 nunca se
midió 1+2 por separado: su única marca sobreviviente fue `4 · tokens fijos · +324 s`. Lo que sí
se ve, dentro de un mismo día y sobre el mismo trabajo:

- `itemsDeSeccion_('encuentro')`: **62,8 s** en una pasada y **69,7 s** en otra — **11%**.
- 1+2 del banco: **129,4 s**; 1+2 de la corrida real de las 13:52: **159 s** — **30 s** de
  diferencia, con la salvedad de que el banco no escribe `CORRIDAS` ni marca etapas.

**Se cuenta como riesgo, según lo que pedía `0.1`.**

### `0.2` · N = 5

`duplicarBloquesRepetibles_` devolvió **5 asignaciones**.

### Los números raros, sin analizarlos

- **`resolverMarcadores('jm', {})` costó 238,9 s** contra ~50 s de una llamada por ítem. Casi
  5×.
- **`itemsDeSeccion_` devolvió 7 ítems** (5 de `encuentro`, 2 de `comunicaciones_post`, 0 de
  `campana`) y `duplicarBloquesRepetibles_` produjo **5 asignaciones**.
- **`mapaTokenObjectId_` cuenta 195 tokens distintos y `tokensPorSlide_` 193**, contra el
  denominador de **172** que usa el handoff.
- **`leerMarcadores_()` no cachea entre llamadas** (379 / 370 ms).
- **Una pasada de medición murió sin respuesta**: el cliente esperó **540 s** y no volvió nada.
- **Los 7 shortcuts ya no están en la carpeta de salidas** — entre las 16:04 y las 16:45 alguien
  los borró. La carpeta quedó en **12 decks y 0 shortcuts**.

### Nota de método

El cliente del repo no pudo transportar los snippets de medición: el shell se come el cierre
del array de `args` y `tools/api.js` los toma por `argv`. Se usó un cliente mínimo en el
scratchpad que lee el snippet **de un archivo** y arma el body JSON en el proceso. **No se
agregó nada al repo**, y hereda el default nuevo: no reintenta.

---

## `PLAN.md §2` reescrita como escalera `T<tramo>.<n>`, y `PENDIENTES` reordenado (2026-08-06) — commit de esta entrada

**Origen.** `PLAN.md` abre con su propia regla: *"una entrada es una línea o un párrafo corto;
si necesita más, el detalle va a `BITACORA.md` y acá queda el puntero. Un plan que hay que leer
entero para saber qué sigue deja de usarse."* La §2 tenía **145 líneas**, de las cuales **~71
(49%) eran historia tachada**, y el trabajo de los últimos dos días no había entrado en ella.

### Lo que la §2 decía antes, para que el resumen sea reversible

El texto íntegro está en `f7e9ea4:docs/PLAN.md`, líneas 441–585. Lo que se sacó, y a dónde fue:

| lo que estaba | dónde quedó |
|---|---|
| **Tramo 1 completo** — 7 ítems tachados, 53 líneas (acceso a las bases, tercer escritor de `MAPEO`, disposición de `SOLAPAS`, `hayUi_()`, `periodo_id`, `carpeta_salida`, activar `m2`) | **una línea** en la §2 con puntero a `BITACORA.md`. Los nueve hechos se verificaron uno por uno contra su marca en la bitácora antes de resumirlos |
| `~~El Paso 3 tiene que resolver D-20~~`, 10 líneas | resumido; el detalle ya estaba en la entrada del `Paso-3-v3` Parte B |
| `~~Migrar el filtro status = Realizada~~` (`D-21`), 8 líneas | resumido; lo que quedaba vivo de ese ítem —retirar `VALOR_STATUS_REALIZADA_`— es hoy `T2.9.4` |
| El párrafo de "los cuatro ítems que el `Paso-3-v3` no cubre", 9 líneas de historia de una corrección | los cuatro ítems son hoy `T2.9.1`–`T2.9.4`, con ID propio |
| El bloqueo *"`INFORMES.plantilla_id` está vacío en `jm` y en `secco`"* | **borrado: era falso.** Ver abajo |
| `camp_` sin filas `jm`, los 16 tokens sin fuente, `resumen_ejecutivo` declarada repetible | **§3**, que es su lugar: cada uno con qué lo destraba y de quién depende |

**Los dos punteros finos**, anotados en la §2 porque al resumir se pierden: `carpeta_motor`
aparece **una sola vez** en la bitácora (entrada del `Paso 2.15` Parte A) y el rol `reader` de
las cuatro bases **una sola vez** (entrada del 03/08 sobre permisos de Drive).

### ⚠ Tres premisas de la §2 estaban vencidas

1. **`INFORMES.plantilla_id` no está vacío en ninguno de los dos.** Leído en vivo:
   `jm` → `117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI`, `secco` →
   `1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8`. La §2 lo daba como *"un bloqueo que tapa a
   los tres"*.
2. **`Paso-4.md` decía "nunca se ejecutó"** y corrió el 04/08. Corregido el encabezado; el
   cuerpo no se toca. **El barrido encontró dos más:** `Paso-2.12_Parte2` decía *"vivo, sin
   ejecutar"* y corrió el 02/08; `Paso-2.5` decía *"nunca ejecutado"* sin distinguir que **su
   Parte 0 sí corrió** el 03/08. `Paso-2.13` dice lo mismo y **es cierto** — sólo tuvo una
   auditoría de premisas, no una ejecución: no se tocó.
3. **El `P1` de la lista blanca de `llamar` no lo cierra `4934f9c`.** Son dos riesgos distintos:
   el pendiente es de `Api.gs` —`llamar` puede invocar cualquier global que escriba— y su
   mitigación está diferida al Paso 6; `4934f9c` es de `tools/api.js` —que el cliente no
   *repita* una llamada que escribe—. Uno protege de ejecutar algo que no debía; el otro de
   ejecutarlo dos veces. **No se tocó el pendiente.**

### ⚠ La dependencia del anclaje está vencida — medido, no deducido

`PENDIENTES` decía las dos cosas a la vez: que `anclarEncuentros()` **no corre** mientras la
precondición de `R-01` falle *"y con él está bloqueada la parte del Tramo 2 que depende de
encuentros anclados"*, y que **hay cinco anclajes con score 1,00**.

Medido hoy: **`verificarPrecondicionAnclaje_()` devuelve `ok: true`** — 660 filas consideradas,
702 excluidas por lista blanca, **cero grupos en violación** — y
`itemsDeSeccion_('encuentro')` devuelve los cinco encuentros con su `id_cuenta`
(`3354-JULJDGAG`, `3346-JULJDGAG`, `3387-JULJDGGC`).

**Lo que lo destrabó ya estaba hecho y nadie lo había anotado:** desde la corrida nocturna del
04/08, `verificarPrecondicionAnclaje_` **pasa por la lista blanca de `D-21`**, reusando
`filtrosValoresIncluidos_`/`filaPasaListaBlanca_` en vez de leer con `getDataRange()` directo.
Eso es exactamente la mitad de `T2.9.4` que el plan seguía reclamando, y la razón por la que los
cinco grupos duplicados desaparecieron: eran filas que el matcher nunca iba a mirar.

**El pendiente no se cierra acá** —no es lo que este trabajo hace—: se registra que su
consecuencia dura no aplica, y la escalera **no lleva esa dependencia**. `T2.1`, el MVP, no
dependía de esto en ningún caso.

### Los IDs: `T<tramo>.<n>`

`Paso 6` está ocupado en tres documentos vivos —`PENDIENTES`, `BITACORA` y `RUNBOOK`, cinco
referencias— con el significado *"cuando se publique `/exec`"*, y una de ellas es la condición
de reactivación de un `P0`. `Paso 7` está ocupado en el plan original archivado. Y `Paso 5` ya
se ejecutó, así que `5.1` se habría leído como sub-paso de las secciones repetibles.
`T<tramo>.<n>` no colisiona con nada y **no obligó a tocar ninguna referencia viva**.

### `PENDIENTES_consistencia.md`: diez `###` mal archivados

Colgaban de `## Preguntas al equipo`, que es una sección de **viñetas** para preguntas de
dominio que esperan respuesta humana: se habían ido agregando debajo de su última viñeta.
**El archivo dio diez** — la Parte 0 había contado siete y se equivocó.

- **Ocho pasaron a `## Sigue abierto`**, con la prioridad intacta: `DISTINCT`, el formato de
  porcentaje sin signo, `generarInforme` no vuelve, `enc_audiencia → enc_alcance`, `rrss_area1`
  en dos cajas, `enc_e75_pct`, el score de anclaje y `ecv_barrio` como prefijo.
- **Dos se convirtieron en viñeta**, que es la forma de esa sección: `3354`/`3346` con cero
  filas de mail —su propio texto dice *"pregunta para el equipo, no trabajo de motor"*— y los
  tres remitentes sueltos, diferidos por decisión del usuario el 07/08.

**Ninguno se cerró ni se reabrió. Ninguna prioridad cambió.**

**Dos no encajaban en ninguna de las dos categorías y se decidieron solos:** `enc_e75_pct`
(*"no es un error, no se ajusta"*) y `ecv_barrio` como prefijo son **notas de guardia** —están
para que nadie los "arregle" más adelante—, no trabajo pendiente ni preguntas. Fueron a
`Sigue abierto` porque es lo conservador: mantiene la prioridad y no cierra nada. Sus títulos ya
dicen lo que son.

---

## `T2.1.1` ✅ — el motor mira el reloj y corta antes del límite (2026-08-06) — commit `da10f18`

**El MVP de `T2.1` empieza a existir:** una corrida que se queda sin tiempo ya no la mata la
plataforma. Corta sola, cierra, y deja dicho hasta dónde llegó.

### Los checkpoints — dos, no tres

- **Antes de cada ítem de la etapa 3.** El loop pasó de `forEach` a `for` para poder salir sin
  excepción; los dos `return` del cuerpo son `continue`. La estimación del próximo ítem es
  **lo que costó el anterior en esta misma corrida** — el primero arranca en 0 y entra si
  queda algo sobre la reserva. **Ninguna constante de segundos en el código.**
- **Antes de la resolución de la etapa 4**, que es atómica. El loop de pintado que sigue no
  lleva checkpoint: cuesta ~6 s, menos que la reserva.
- **El tercero no existe a propósito:** la barrida y el cierre corren siempre. Para eso está
  la reserva.

### Las tres claves de `CONFIG`

Patrón de `umbralAnclajeReunion_()` (`Paso 2.9F`): valor en la hoja, constante de módulo sólo
como default y nunca leída directo, helper como único lector.

| clave | valor | qué clase de número es |
|---|---|---|
| `presupuesto_corrida_seg` | 350 | **no medido**: 360 duro − ~2 s del llamador de menú − colchón |
| `reserva_cierre_seg` | 30 | cierre **medido** 0,8 s + barrida ~6 s + margen por varianza |
| `costo_resolucion_etapa4_seg` | 240 | **banco del 06/08, no una corrida**: 238,9 s |

`Cargar config inicial` devolvió `CONFIG — nuevas: 3, completadas: 0` y `0 actualizadas` en
todas las demás hojas: **no pisó nada**. Entre el `clasp push` y el sembrado, el estado de
configuración muestra las tres como *"falta en la planilla"* — **es ruido esperado, no un
hallazgo**.

### La decisión de `A.5` — usuario, 06/08

**Los tokens no alcanzados quedan `«FALTA:token»`**, igual que cualquier otro faltante; la
distinción vive en el motivo de `FALTANTES`. **El motivo: el `{{token}}` crudo queda reservado
para señalar un bug.** Si algún día aparece un `{{token}}` en un deck, eso significa que algo
falló y no que la corrida se quedó sin tiempo — y por eso la barrida no puede dejar ninguno.

El código respeta esa frontera en los dos sentidos: si la barrida encuentra un token crudo **y
no hubo corte**, el motivo que escribe es `⚠ quedó crudo en el deck sin que hubiera corte por
tiempo — revisar`, en vez de disfrazarlo de corte.

### La prueba, con `presupuesto_corrida_seg` en 60 desde la hoja y sin `clasp push`

Corrida `jm-20260806-210540`, deck `1JtrEjzCruD7OBexqiTMeDKU5a6U9YQqsLJ9HT95YVzU`:

| criterio | resultado |
|---|---|
| vuelve sola, sin que la mate la plataforma | ✅ **147 s** |
| fila cerrada con fecha y conteos | ✅ sin `(corrida en curso …)` |
| `FALTANTES` con el motivo del corte | ✅ **195 de 195** |
| deck sin `{{token}}` crudos | ✅ **0**, con 221 cajas en `«FALTA:…»` |

La barrida reusó **el mapa de la etapa 2**, no re-escaneó el deck. **Las 10 pruebas pasan.**

### ⚠ El checkpoint de la etapa 4 no llega a ejecutarse con los números de hoy

En la prueba, el corte cayó en la etapa 3 y la etapa 4 **nunca vio su checkpoint** — un corte
es un corte, no se abre una etapa nueva. Y con el default de 350 va a pasar lo mismo, por
aritmética sobre lo medido: etapas 1+2 ≈ 130–160 s, cada ítem ≈ 50 s, entran tres ítems
(≈ 290 s) y el cuarto no. Para que la etapa 4 decida haría falta llegar con ≤ 80 s gastados, y
sólo la etapa 1 cuesta más que eso.

**No se sacó** —deja de ser cierto en cuanto `T2.2` baje el costo— pero queda dicho.

La otra cara del mismo número, que es la ganancia real: **hoy la corrida muere a los 324 s sin
dejar nada; con esto vuelve a ~300 s con 3 de 5 ítems pintados, la fila cerrada y la lista
completa.**

### ⚠ Un presupuesto por debajo de ~160 s no se puede honrar

Las etapas 1 y 2 **no tienen checkpoint y no pueden tenerlo con este diseño**:
`duplicarBloquesRepetibles_` es un bloque. En la prueba se ve solo — se pidieron 60 s y la
corrida gastó 147 antes de poder mirar el reloj por primera vez.

### Pendiente antes de cerrar el paso

**Verificación humana desde la planilla**, que es lo que el prompt marca como condición de
cierre y todavía no ocurrió.

---

## Higiene — las láminas escondidas no entran a la corrida: 195 pasa a 172 (2026-08-06) — commit `9607a3b`

**No lleva ID `T<tramo>.<n>`: es higiene, no un escalón de la escalera.**

### `0.1`–`0.4`, lo medido

- **Ninguno de los tres recorridos de la corrida miraba `isSkipped()`.** `grep` sobre todos los
  `.gs` devolvía **una sola** llamada en el repo, adentro de `mapaDeTokens_`
  (`Armonizar.gs:925`). `mapaTokenObjectId_`, `tokensPorSlide_` y `tokensDeSlide_`, ninguna.
- **La diferencia son 23 tokens `m2_*` de la lámina 10**, medidos con `mapaDeTokens_` y no a
  mano: `195 − 23 = 172`, la cuenta cierra exacta.
- **⚠ Y ya estaba pasando:** la corrida de prueba de `T2.1.1` (`jm-20260806-210540`) dejó 195
  filas en `FALTANTES`, **31 de ellas `m2_*`** — las 23 de la lámina escondida entre ellas.
- **Ninguna slide modelo está escondida** (`encuentro` → 6; `campana` → 12–19;
  `comunicaciones_post` → ninguna), así que el filtro mantuvo la forma prevista.

### Dónde quedó el filtro, y por qué en cada lado

| función | qué se hizo | por qué |
|---|---|---|
| `esLaminaEscondida_` (nueva, `Armonizar.gs`) | **la única llamada a `isSkipped()` del repo** | dos criterios es exactamente lo que produjo la divergencia |
| `laminasEscondidas_` (nueva) | extraída de `mapaDeTokens_` | el mapa y la corrida usan **el mismo** recorrido |
| `mapaTokenObjectId_` | filtra **adentro** | su único llamador es la etapa 2, y desde ahí se corrigen de un saque el denominador, `cableados_sin_caja_en_plantilla`, el `mapa_tokens` de `CORRIDAS` **y la barrida de `T2.1.1` sin editarla** |
| `tokensPorSlide_` | **no se tocó** | `filtrarRenombresPorLaminasCongeladas_` y `tokensSinCablear_` inventarían y necesitan ver todo |
| `tokensVisiblesDe_` (nueva, `Generador.gs`) | el filtro en el punto de llamada | etapa 4 y el *fallback* de la barrida |
| `tokensDeSlide_` | guarda, aunque hoy no la necesite | `duplicate()` copia el estado de la modelo, y `0.3` sólo mide hoy |

### `A.3` · Nada se excluye en silencio (`D-21`)

El resultado de la corrida trae `tokens.excluidos_por_lamina_escondida` con **láminas, cuántos
y la lista de tokens**, y el ítem de menú lo dice en su propia línea. Una exclusión que no se
reporta es indistinguible de un token que se perdió.

### Los dos efectos esperados — no son regresiones

1. **Un marcador cuya única caja vive en la lámina escondida va a empezar a aparecer en
   `cableados_sin_caja_en_plantilla`.** Es correcto y es información.
2. **El `mapa_tokens` de `CORRIDAS` deja de traer los `objectId` de la lámina escondida.** Para
   la **etapa 2 de `D-06`**, un deck viejo no va a poder actualizar esa lámina si algún día se
   muestra. **Anotado, no resuelto** — va con `D-06`, que ya está en `PLAN.md` §3.

### La verificación, barata y sin corrida completa

| | antes | después |
|---|---|---|
| `mapaTokenObjectId_` sobre la plantilla JM | 195 | **172** |
| `tokensVisiblesDe_` | — | **172 visibles, 23 descartados** (misma lista que `0.2`) |
| `tokensPorSlide_` | 195 | **195** (no se tocó, a propósito) |
| `tokensDeSlide_` sobre la lámina 10 | 23 | **0** |
| `tokensDeSlide_` sobre la lámina 6 (modelo de `encuentro`) | 30 | **30** |

**Las 10 pruebas pasan.**

### Lo que se anotó en `PENDIENTES_consistencia.md`

- **El `P1` de los 195 contra 172, cerrado** con la explicación y los dos efectos.
- **Un `P2` nuevo:** `comunicaciones_post` tiene 2 ítems y **cero slides modelo**, y por eso
  `duplicarBloquesRepetibles_` devuelve 5 asignaciones y no 7. El motor ya lo reportaba
  —*"hay N ítem(s) pero ninguna slide lleva tokens de `post_`"*— y nadie lo leía; era el origen
  del "5 y no 7" que apareció como número raro en tres mediciones seguidas. **No se arregla
  acá:** decidir si sobra la sección o falta la lámina es editorial.

### Premisa del prompt que resultó falsa

**"Va antes de `T2.1.1`".** `T2.1.1` ya estaba implementado y commiteado, y su barrida final ya
estaba pintando las 23 láminas escondidas. Eso hizo más fuerte el argumento de filtrar adentro
del mapa: la barrida se corrigió sola, sin editar una línea de `T2.1.1`, que es el sentido en
que *"no se toca `T2.1.1`"* sí se cumplió.

---

## `T2.1.1` cerrado por verificación humana — y la corrida corrigió dos cosas de mi reporte (2026-08-06) — commit de esta entrada

**Verificado desde la planilla por el usuario, corrida `jm-20260806-214253`.** Los cuatro
criterios se cumplen: volvió sola, avisó el corte **antes** de los conteos, cero tokens crudos
en el deck y la lista completa en `FALTANTES`. **`T2.1.1` queda cerrado.**

**Dos correcciones a lo que reporté al implementarlo, y las dos son mías:**

1. **El checkpoint de la etapa 4 no era código inalcanzable: se ejecutó y decidió bien.** Cortó
   ahí a los **309 s**, con **11 s por encima de la reserva** contra 240 estimados. Lo que
   escribí —*"no llega a evaluarse"*— salió de una prueba con `presupuesto_corrida_seg` en 60,
   que **corta antes por construcción**. Extrapolé de un caso que no podía mostrar lo contrario.
2. **Entraron los 5 ítems, no 3.** Mi aritmética usaba ~50 s por ítem, que era el número **con
   la instrumentación encima**; sin ella son 37–39 s. Un instrumento que se cuela en la
   predicción, otra vez.

---

## `T2.2.2` ✅ — el caché de hojas de registro: 31 s pasan a 4,7 s por ítem (2026-08-06) — commit `658b6d7`

### `0.1`–`0.4` · Dónde estaba el gasto

Instrumentado por envoltorio sobre los globales; la reasignación **sí** alcanza a los call
sites internos, verificado con un contador que habría dado cero si no.

```
Una llamada POR ÍTEM — 47,3 s con instrumentación (31–39 s sin ella)
  buscarMapeo      103 invocaciones   42,7 s   ← 90 % de la llamada
    ├─ leerMapeo   104 invocaciones   21,9 s
    └─ usoSolapa_  104 invocaciones   21,1 s   (leerSolapas 105 ×)
  leerFuente         1 invocación      5,1 s
  resolverVentana    0 invocaciones    0,0 s
```

**El gasto principal: `buscarMapeo`, 90 %.** 103 invocaciones para 43 marcadores, y cada una
relee `MAPEO` (346 ms) y `SOLAPAS` (337 ms) **enteras**. Ningún lector de registro cacheaba;
el único caché de módulo del repo era `cacheBases_`.

**`0.4` resultó falsa: `resolverVentana` se llama cero veces** en la pasada por ítem. El ítem
trae `opciones.ventana` ya resuelta y el `||` la cortocircuita. Se midió igual —287 ms vacía,
619 ms con `seccion_id`, y sí relee `CONFIG` y `SECCIONES` cada vez— pero memoizarla no
ahorraba nada.

**`0.1` era correcta para un lado y falsa para el otro.** Por ítem, el caché local funciona y
releer la hoja no es el costo (1 lectura). En la global, **38 lecturas de fuente con
`lecturas_cacheadas: 1`** — la contradicción delató el bug: la rama del agregado global de
`digital` llamaba a `leerFuente` **directo, salteándose el caché** que está dos ramas más
abajo. 37 de los 43 marcadores caían ahí.

**`0.3`:** las dos llamadas resuelven **los mismos 43 marcadores**. La diferencia era entera de
esas lecturas sin caché más el doble de `buscarMapeo` (193 contra 103).

### Qué se cambió, y qué no

- **`memoRegistro_`** envuelve los siete lectores (`leerRegistro_` cubre `BASES`, `INFORMES`,
  `PERIODOS`, `CAMPANAS` y `SECCIONES` de un saque; más `leerMapeo`, `leerSolapas`,
  `leerConfig` y `leerMarcadores_`).
- **El caché está apagado por defecto y sólo lo enciende `generarInforme`**, con `try/finally`
  porque tiene seis `return` tempranos y puede lanzar.
- **La rama del agregado global pasa por el caché de lectura**, como la rama general.
- **`costo_resolucion_etapa4_seg`: 240 → 60**, re-medido.

**Lo que NO se tocó, con el motivo:** `resolverVentana` (0 invocaciones), `leerMarcadores_`
como candidato propio (367 ms, ya lo cubre el caché), y **ningún escritor**: no hizo falta
invalidación (ver abajo).

### La decisión que hace esto seguro: alcance explícito, no invalidación

`ESCRITORES.md` censa **~15 escritores de hojas de registro** repartidos en cinco archivos.
Cachear siempre e invalidar en cada uno significa que **olvidar uno sirve config vieja en
silencio** — el modo de falla que este repo caza.

Con el caché **apagado por defecto** no hay ningún escritor que invalidar: **ninguno corre
adentro de `generarInforme`**, que sólo escribe `CORRIDAS` y `FALTANTES`, y ésas no se leen por
`memoRegistro_`. Los sembradores, las migraciones, el diff y los ítems de menú siguen leyendo
la hoja viva en cada llamada, exactamente como antes.

`invalidarCacheRegistros_()` queda exportada por si algún día un escritor entra al alcance.
**Hoy no la llama nadie, y eso es correcto.**

**El alcance es la invocación, no el script:** `cacheRegistros_` es una variable de módulo, así
que muere con la ejecución de Apps Script. **No es `CacheService`**, no sobrevive al pedido, no
se comparte entre corridas ni entre usuarios. Está escrito en el comentario para que nadie los
confunda.

### El antes y el después

| | antes | después |
|---|---|---|
| `resolverMarcadores` por ítem | **31,4 s** | **4,7 s** (−85 %) |
| segundo ítem de la misma corrida | ~37 s | **4,6 s** |
| `resolverMarcadores` global (etapa 4) | **118,8 s** | **50,1 s** (−58 %) |
| `lecturas_cacheadas` en la global | 1 | **6** |

Re-medida la etapa 4 con tres muestras: **40,6 / 30,7 / 36,3 s**. De ahí sale el 60 de
`CONFIG`, con ~48 % de margen sobre el máximo observado.

**Presupuesto proyectado de una corrida completa:** etapa 1 ~120 s + etapa 2 ~10 + etapa 3
5×4,7 ≈ 24 + etapa 4 ~36 + cierre ~1 = **~190 s contra los 360 disponibles**. Sin verificar
contra una corrida real, que la corre el usuario.

### El control de valores idénticos

`resolverMarcadores` antes y después, **marcador por marcador**, comparando
`estado|valor|valor_formateado` sobre el mismo período y el mismo ítem:

| | marcadores | diferencias |
|---|---|---|
| por ítem (`San Cristóbal (pre)`) | 43 | **0** |
| global (etapa 4) | 43 | **0** |

Los resúmenes también coinciden: `13 ok / 30 sin_datos` por ítem y `17 ok / 26 sin_datos` la
global, antes y después. **Las 10 pruebas pasan.** Esto **no reemplaza a `T2.2.3`**, que
compara un deck entero.

**Y se verificó que el caché no queda encendido:** `cacheRegistrosAbierto_()` devuelve `false`
al salir del alcance.

---

## `N1` / `T2.2.3` — el deck entero: cero diferencias, y la corrida completó en 120 s (2026-08-07) — commit de esta entrada

Control que faltaba de `T2.2.2`. `T2.2.2` había comparado marcador por marcador; esto compara
**el deck**: `jm-20260806-222554` (referencia, ya corrida con el caché puesto) contra una
corrida de control nueva, `jm-20260807-004300`.

**26 láminas, 1389 piezas de texto, cero diferencias.** Ninguna pieza sólo en un deck, ninguna
con texto distinto. La evidencia completa, con el método y cómo se reproduce, en
`docs/PROTOCOLO_T2.2.3_corrida_2026-08-07.md`.

**Y la corrida completó.** `corte: null`, **120 s** gastados contra 350 de techo, barrida final
en **0 tokens crudos**. La proyección de `T2.2.2` decía ~190 s: era pesimista. De paso corrige
una lectura del handoff — `jm-20260806-222554` **tampoco estaba cortada**; sus 270 faltantes
son tokens sin cablear, no corte por tiempo.

El deck de control quedó en la papelera. `FALTANTES` se pisó, que es lo que hace siempre
(`escribirFaltantes_` limpia la hoja: es la foto de la última corrida, no un histórico).

---

## `N2` / `T2.1.2` — el cierre se escribe siempre, también cuando algo explota (2026-08-07) — commit de esta entrada

`T2.1.1` puso el corte por tiempo y el cierre corre bien por esa vía. Faltaba la otra: una
excepción inesperada adentro de las etapas se llevaba puesta la función entera y la fila de
`CORRIDAS` quedaba diciendo *"corrida en curso"* para siempre — el mismo problema, entrando
por otra puerta.

**Qué cambió en `Generador.gs`:**

- Las etapas 1 a 4 van adentro de un `try`. El `catch` **no relanza**: guarda `fallo` con la
  etapa, el mensaje, el stack y los segundos, y deja que el cierre corra.
- El estado que el cierre necesita —`mapa`, `expansion`, `porItem`, `resolucion`,
  `porMarcador`, `sinCajaEnPlantilla`— se declara **afuera del `try`**, con un valor vacío
  usable. No alcanzaba el hoisting de `var`: un `undefined` vuelve a tirar en el cierre, que
  es el único lugar que no se puede permitir tirar.
- `marcarEtapa_` **devuelve la etapa**, así la corrida sabe en cuál está sin una variable
  paralela que se desincronice.
- `MOTIVO_EXCEPCION_`, tercer motivo de `FALTANTES` al lado de `MOTIVO_CORTE_TIEMPO_`. Un
  token crudo tiene ahora tres causas distinguibles: nadie lo cableó, se acabó el tiempo, o
  algo explotó. Antes la tercera se disfrazaba de la segunda y el diagnóstico apuntaba al
  presupuesto, que no tenía nada que ver.
- La columna `faltantes` de `CORRIDAS` cierra con `<n> · ⚠ excepción en la etapa "…": <mensaje>`.
  Es la misma columna que ya usa `marcarEtapa_` como campo de estado.
- El resultado trae `fallo`, y `reporteGeneracion_` lo canta **antes** que el corte.
- Sigue siendo `ok: true`, por el mismo motivo que el corte: hubo deck, hubo fila cerrada y
  hubo lista de faltantes. `ok: false` queda para las precondiciones que ni copian la
  plantilla.

**Un bug que se cazó en el camino.** El default `mapa = { tokens: {} }` es **vacío pero
truthy**, y `barrerTokensNoAlcanzados_` decide re-escanear por `tokensDelMapa ? … : null`. Con
el default puesto, una muerte antes de la etapa 2 habría barrido **cero** tokens y el deck
salía con `{{token}}` crudos — exactamente lo contrario de lo que esa barrida garantiza. La
llamada pasa ahora `mapa.lista.length ? mapa.tokens : null`.

**Control positivo, por API:** se le inyectó una excepción a `mapaTokenObjectId_` (etapa 2) y
se corrió `generarInforme('jm')`.

| | resultado |
|---|---|
| la excepción escapó | **no** |
| `fallo.etapa` | `2 · mapa token→objectId`, a los 57 s |
| fila de `CORRIDAS` | cerrada, con `172 · ⚠ excepción en la etapa "2 · mapa token→objectId": …` |
| `FALTANTES` | 172 filas, todas con `MOTIVO_EXCEPCION_` |
| barrida | 172 tokens, por `tokensVisiblesDe_` (no había mapa) |
| tokens crudos en el deck | 23, **todos en la lámina escondida** — no se emite, nunca se pinta |
| función restaurada | sí |

**Las 10 pruebas pasan.** `FALTANTES` se restauró byte a byte a lo que tenía antes del control
(271 filas, comparación exacta). El deck de prueba, a la papelera. **Pendiente de verificación
humana.**

---

## `N3` — `R-14`: una campaña entra si su rango **se solapa** con la ventana (2026-08-07) — commit de esta entrada

Escrita en `docs/REGLAS_NEGOCIO.md`. Origen: decisión del usuario del 06/08/2026. El criterio
no estaba en ningún lado —se midió el 06/08 y no existía ni en `REGLAS_NEGOCIO.md` ni en
`SUPUESTOS.md`—, y las tres lecturas razonables (empieza / termina / se solapa) dan conjuntos
distintos sobre los mismos datos.

**Queda escrita y marcada como no aplicable hoy:** `MAPEO` tiene `sd_fecha_inicio` (columna
`L`) y **no tiene fecha de fin**. Sin el extremo derecho no hay rango, y lo único computable
es "empieza en la ventana" — justo lo que la regla dice que no es. Verificado contra el
snapshot de `MAPEO` del 07/08.

La regla dice además qué caso sirve de control —una campaña que empieza antes del viernes de
inicio y termina después del jueves de cierre— porque los casos que tocan un extremo no
discriminan entre las tres lecturas.

---

## `N4` — `MAPEO`: `sd_fecha_fin` y `sd_estado`, por el camino del seed (2026-08-07) — commit de esta entrada

`R-14` no se puede aplicar sin el extremo derecho del rango. Las columnas estaban en la base y
no en `MAPEO`.

**Medido primero, contra la base viva** (980 filas en `Seguimiento digital`):

| columna | encabezado real | tipo | nombre lógico |
|---|---|---|---|
| `L` | `Fecha de inicio` | fecha | `sd_fecha_inicio` *(ya estaba)* |
| `M` | `Fecha de fin` | fecha | **`sd_fecha_fin`** |
| `N` | `Estado` | texto | **`sd_estado`** |

Los nombres siguen el del vecino que ya estaba, que es lo que el prompt pedía.

**Por el camino del seed, no a mano.** Dos filas nuevas en `SEED_MAPEO_` (`Instalar.gs`) más
sus entradas en `TIPO_ESPERADO_POR_CAMPO_`. El diff en sólo lectura, antes de escribir, dio
**exactamente dos filas nuevas y cero discrepancias** en las cuatro hojas sembradas; la
aplicación reportó lo mismo: `MAPEO — escritas: 2, actualizadas: 0`, y `BASES`, `CONFIG`,
`INFORMES` y `PERIODOS` en cero. `MAPEO` pasa de 122 a **124** filas.

`buscarMapeo('digital','Seguimiento digital','sd_fecha_fin')` devuelve `M`, y `sd_estado`
devuelve `N`.

**Mapear no es cablear: ningún marcador nuevo.** Las dos filas quedan disponibles y nadie las
consume todavía.

Las siete filas `solo_en_hoja` que reporta el diff son las `fecha_periodo` que escribe
`DIAG_FECHAS`: no están en el seed y el upsert **no las toca**. Es el hueco conocido, sin
cambios.

Backup previo: snapshot de las diez hojas de registro con `tools/snapshot.js`.

---

## `N5` / `D-22` — el motor lee tablas y no sabe agregarles filas (2026-08-07) — commit de esta entrada

Hallazgo propio, escrito en `docs/PLAN.md` §1 como decisión de arquitectura `D-22` — es
estructural, y `CLAUDE.md` §3 manda ahí lo estructural en vez de a un hallazgo fechado nuevo.

**Lo medido, sobre las dos plantillas vivas:**

| plantilla | láminas con tabla | tablas | la más grande |
|---|---|---|---|
| `jm` | 6 de 22 (5, 7, 17, 18, 19, 21) | 7 | 7×9 en la 18 |
| `secco` | 5 de 29 (5, 10, 21, 22, 23) | 5 | 7×9 en la 22 |

`piezasDeTextoDeSlide_` baja a `TABLE` celda por celda y por eso los tokens de adentro se
pintan igual que los sueltos. Escribir estructura es otra cosa: **no hay una sola llamada de
inserción de filas de Slides en el repo** — `appendRow` e `insertColumnBefore` aparecen cuatro
veces y las cuatro son de Sheets.

Y las ranuras están cableadas **por índice en el nombre del token**: `camp1`…`camp4` en la
lámina 7 de `jm`, `camp_env1_*`…`camp_env5_*` en la 18, `post_camp1`…`post_camp3` en la 10 de
`secco`. El índice **es** la fila.

**La consecuencia, de los dos lados:** una fila de más no entra y desaparece en silencio; una
de menos queda como `«FALTA:token»` con su fila en `FALTANTES`. El segundo caso se ve; **el
primero es el caro**, porque un deck con cuatro campañas de cinco se lee como un deck correcto.

---

## `N6` — el `P2` de `comunicaciones_post`, con la causa precisa (2026-08-07) — commit de esta entrada

El `P2` de `docs/PENDIENTES_consistencia.md` decía que faltaba decidir *"si la sección sobra o
si a la plantilla le falta la lámina"*. **Las dos mitades de esa pregunta son falsas**, medido
el 07/08:

1. **La lámina existe: es la 7 de `jm`.** Se titula "Campañas" y su pie dice
   *"Digital | ECVs: post reuniones"*. Tabla de 7×8 con `{{camp1}}`…`{{camp4}}` en la columna
   1, filas 4 a 7. Ninguno empieza con `post_`, y por eso `slidesModeloDe_(['post_'])` no la ve.
2. **La familia `post_` existe, del lado de `secco`**: lámina 10, tabla 4×7, con `post_camp1-3`
   y `post_estado1-3`. Y la fila de `SECCIONES` declara `informes = JM,SECCO`. O sea: la
   sección **está bien para `secco`** y desalineada para `jm`.

**El obstáculo que ninguna de las tres salidas podía ver antes:** `tokenEsDeFamilia_` matchea
por **prefijo**. `campana` declara `camp_`, que no matchea `camp1`; pero una familia `camp` sin
guion bajo se llevaría también `camp_titulo`, `camp_env*` y `camp_resp*`, o sea las láminas 12
a 19. **La salida C —que la reclame otra sección— no es expresable hoy** sin renombrar o sin
cambiar el matcheo de familias, que es motor y no configuración.

Las tres salidas quedan escritas en el `P2`, con su costo, **sin elegir ninguna**. Esperando
decisión del usuario.

---

## `N7` — `TOKENS.md` §2.0: el inventario por lámina, medido contra la plantilla viva (2026-08-07) — commit de esta entrada

**La premisa del prompt era falsa, y en las dos mitades.** Decía que `TOKENS.md` numera
"Comunicaciones post" como la 10 y que *"la 10 viva es Clics, escondida"*. Medido:

- `TOKENS.md` numera "Comunicaciones post" como la **10 de `secco`**, y ahí está, con
  `post_camp1-3` y `post_estado1-3` exactos. La numeración **está bien**.
- La lámina 10 viva de `jm` es **"M2 — status digital por categoría"**, escondida. No hay
  ninguna lámina "Clics" en ninguna de las dos plantillas.

La confusión venía de mezclar las dos plantillas. La tarea se hizo igual, porque lo que pedía
—regenerar el inventario desde la plantilla viva— sí hacía falta.

**`TOKENS.md` §2.0, nuevo y fechado**, con las 22 láminas de `jm` y las 29 de `secco` medidas
con `piezasDeTextoDeSlide_`. Dice contra qué se numera, que era el punto: las **tres**
numeraciones que conviven —el `.pptx` archivado, la presentación viva de Slides, y el deck
expandido de una corrida— son distintas, y confundirlas ya costó tiempo (el aviso de láminas
escondidas numera contra el deck expandido: la 10 de la plantilla sale como 14 ahí).

Las dos tablas anteriores **no se borraron**: pasan a ser §2.1 y §2.2, marcadas como la
marcación original sobre el `.pptx`.

**Seis discrepancias que no se pudieron reconciliar**, escritas y no borradas:

1. **Ninguna de las dos tablas viejas dice qué láminas están escondidas, y hay seis** — la 10
   de `jm`; la 23, 25, 26, 27 y 28 de `secco`. Es el dato que más cambia lo que el motor hace.
2. Los `m2_*` de la lámina 10 de `jm` **siguen con sufijos secuenciales** (`_a`…`_e`), y §1
   declara que no los tienen.
3. `camp_eje` no figura en ninguna tabla vieja.
4. `periodo` en la lámina 5 de `jm` tampoco.
5. `ecv_minutos` en la 5 de `secco` tampoco.
6. `m2_implementaciones` existe en `secco` y no en `jm`: las dos láminas se titulan igual y no
   son la misma.

---

## `N8` — los dos `P2` chicos de la corrida, arreglados (2026-08-07) — commit de esta entrada

**1 · `excluida undefined`.** El diagnóstico que estaba escrito era casi correcto y le faltaba
una mitad: los excluidos vienen de **dos** lados con forma distinta. Los de `CAMPANAS` traen
`campana`; los que filtra `filtrarItemsPorSeccion_` sobre los crudos de `REUNIONES` traen
**`item`**, resuelto por `__clave__`. El texto usa ahora
`e.campana || e.item || '(el ítem no trae nombre)'`. Arreglo chico y local, como pedía el
prompt.

Medido con `itemsDeSeccion_('comunicaciones_post')` sobre la ventana vigente, las tres líneas
que decían `undefined` ahora dicen `excluida San Cristóbal (pre) — etapa = "pre"`,
`excluida Retiro (pre) — etapa = "pre"` y `excluida Orden Público — etapa = ""`.

**2 · El aviso de láminas escondidas.** Se eligió **que lo diga**, no renumerar: el aviso
termina ahora en *"Numeradas sobre el DECK EXPANDIDO, no sobre la plantilla"*. El número del
deck expandido es el que tiene el archivo que la persona va a abrir, así que es el útil para ir
a mirar; traducirlo a la numeración de la plantilla exigiría invertir la expansión, y el mapa
de la corrida no la guarda.

Los dos `P2` quedan anotados como arreglados en `docs/PENDIENTES_consistencia.md`, **pendientes
de verificación humana**. Las 10 pruebas pasan.

---

## `N9` — las siete decisiones sobre la lámina 7, escritas · `CONFIG_INFORMES.md` §1.8 (2026-08-07) — commit de esta entrada

**Dos premisas del prompt no se sostienen, y la segunda cambia la lectura de las siete
decisiones.**

1. **§2.3 no es de `jm`.** Está bajo *"2. Informe mensual SECCO-SSCDI"* y describe la lámina 10
   de `secco`. Las siete decisiones hablan de la lámina 7 de `jm`, que es de §1. Van a **§1.8**
   nueva; §2.3 se reescribió apuntando ahí y con lo propio de `secco`.
2. **⚠ El destino de la decisión 1 ya existe.** Las siete columnas que el usuario pidió
   —Campaña · Estado · Período · Alcance · Impresiones · Vistas · VTR— **son textualmente las
   de `secco` lámina 10**, medidas el 07/08. La decisión no diseña una tabla nueva: **alinea
   `jm` con lo que `secco` ya tiene**.

**La convención de nombres, elegida con el motivo escrito: `familia` + `atributo` + `índice`.**
Por forma pura correspondía la otra —el repo usa índice + atributo cuando una ranura tiene
varios atributos (`camp_env1_*`, `rep_p1_*`, `rrss_c1_*`) y acá son siete—. Gana igual la
primera **por la decisión 4 del propio usuario, "los que ya existan se reusan"**: con atributo
+ índice **6 de los 28 ya existen y se reusan tal cual** (`post_camp1-3`, `post_estado1-3`) y
**cero** tokens vivos se renombran; con índice + atributo los 28 son nuevos **y encima hay que
renombrar esos 6**. Costo asimétrico, y la regla de reuso ya estaba escrita.

Las 28 quedan listadas listas para copiar. **Adoptarlas en `jm` es elegir la salida A del `P2`
de `comunicaciones_post`** —`camp1`…`camp4` pasan a `post_camp1`…`post_camp4`— y eso queda
dicho, no dado por tomado.

**Dos decisiones tienen menos efecto del que parecen:**

- La **6** (el benchmark, *"sale o queda fijo, sin token"*): hoy **ya está sin token** en las
  dos plantillas. Lo único con efecto es *"sale"*.
- La **7** (`Estado` = columna `N`): **ya está mapeada** por `N4` como `sd_estado`, y responde
  la vieja `[?]` de §2.3 — es **valor libre**, no lista cerrada.

**Lo que falta para que esto sea ejecutable**, escrito en §1.8: `T2.10` (repetir la lámina cada
cuatro ítems), un consumidor para `R-14`, y **la fuente de 20 de los 22 tokens nuevos**
—`Período`, `Alcance`, `Impresiones`, `Vistas`, `VTR` por campaña—, que **nadie declaró**.

**Nada se ejecutó:** la plantilla no se tocó, ningún token se renombró, ningún marcador se
cableó.

---

## `N10` — `T2.10`: paginar de a cuatro es una capacidad que el motor no tiene (2026-08-07) — commit de esta entrada

Escrito en `docs/PLAN.md` §2, Tramo 2, con el ID **greppeado**: `T2.1` a `T2.9` estaban
tomados, `T2.10` estaba libre. **No implementado y no aprobado.**

**La premisa se verificó.** `duplicarBloquesRepetibles_` hace `resultado.items.forEach` con un
`modelo.duplicate()` por vuelta: **una lámina por ítem**. Lo que la lámina 7 necesita es **una
lámina cada cuatro ítems**, con las ranuras sobrantes de la última en blanco. No es un caso
raro del mismo mecanismo: es otro modo — hoy la lámina modelo tiene los tokens de **un** ítem,
ahí tiene **N ranuras** y hay que repartir y vaciar.

**De qué depende:** de nada del motor. De una **decisión de esquema**: qué declara el tamaño de
página — lo natural es una columna `items_por_lamina` en `SECCIONES`, vacío = el
comportamiento de hoy.

**Y queda dicho que la lámina 7 no puede funcionar sin esto:** con cinco campañas, la quinta no
entra, y no entra **en silencio** — que es la mitad cara de `D-22`.

`T2.10` **no** levanta `D-22`: reparte ítems entre ranuras fijas. Agregar filas a una tabla de
Slides es otro trabajo y no está pedido.

---

## `T2.4` — los cuatro objetivos contra un deck real (2026-08-07) — commit de esta entrada

Corrido **antes** de la cola nocturna del 07/08, que lo manda primero si no había corrido. No
había corrido. Evidencia completa en `docs/PROTOCOLO_T2.4_corrida_2026-08-07.md`.

`resolverMarcadores('jm')` sobre los 43 marcadores: **17 `ok` · 26 `sin_datos` · 0 `error`**.
Deck: `jm-20260806-222554`, la corrida completa.

| objetivo | veredicto |
|---|---|
| `SUMA` sobre cero filas → `sin_datos`, no `0` | ✅ **verificado**, con control negativo |
| `ULTIMO` por fecha | ✅ el mecanismo · ❌ el número esperado |
| agregado global de `digital` | ✅ donde hay filas |
| sembrado del Resumen Ejecutivo | ✅ 11 de 24, pintados en el deck |

**1 · `SUMA`.** Todas devuelven `sin_datos` con *"sin dato, no cero"* en la traza. **El control
negativo salió en la misma corrida**: `ivr_campanias` es un `CONTEO` sobre **las mismas cero
filas** y devuelve **`0`**. La asimetría está viva.

**2 · `ULTIMO` — el objetivo decía `enc_mails_enviados = 44.043` y hoy no sale.** No es
regresión: las tres piezas del cableado funcionan —filtro `mail_tipo=Convocatoria` (346 de
2138), recorte por ventana (11 de 346), comparación por fecha— y **dentro de la ventana hay un
empate real al 28/07 con dos valores distintos (85935 / 104362)**. El motor devuelve
`«FALTA:@ultimo_ambiguo»` porque está construido para no elegir. Los seis `enc_*` de
`Directa Mail` caen igual. **No se tocó la regla de desempate**: cuál de las dos filas publica
la lámina es decisión de dominio.

**3 · El agregado global.** Anda sin `id_cuenta`: `Directa Mail` (7 filas JM, 80 GCBA) y
`Directa SMS` (1 fila) dan número. `Directa IVR`, `Seguimiento digital` y `Digital` dan cero
filas — los tres grupos de `T2.6`. **Y la corrida deja a la vista que no tienen la misma
causa:** `Seguimiento digital` recorta a cero porque **las 979 filas no tienen fecha** en la
columna que gobierna; `Digital` (0 de 1297) e IVR (0 de 58) recortan a cero **teniendo fecha**.

**4 · El Resumen Ejecutivo, leído del archivo y no del valor de retorno:** `838.571 envíos de
Mail` y `Aperturas: 211.357 (25.42%)` en la lámina 2; `3.839.688`, `54.552 envíos de SMS`,
`SMS entregados: 51.706` y `Aperturas: 1.084.516 (28.57%)` en la 3; `15` encuentros en la 5. El
formato `numero` de los `_or`/`_pct` es el correcto: la caja ya trae su `%` y en el deck se lee
un solo signo.

**Un hallazgo no pedido, y es el más visible:** la lámina 5 publica
`Mail: «FALTA:ecv_insc_mail»(59.9%)`. El `_pct` resuelve y **el numerador no tiene fila en
`MARCADORES`**. Los cinco pares `ecv_insc_*` están igual. **No se cableó nada** — el prompt lo
prohíbe.

---

## `N1` — Addendum al `N9` de anoche: la premisa de las fuentes era falsa (2026-08-07) — commit de esta entrada

> **Addendum fechado a la entrada `N9` de este mismo archivo.** La entrada de anoche **no se
> edita** (`CLAUDE.md` §7: los addenda fechados sí valen, alterar el texto original no).

**Lo que anoche quedó escrito y es falso:** *"la fuente de 20 de los 22 tokens nuevos —`Período`,
`Alcance`, `Impresiones`, `Vistas`, `VTR` por campaña—, que **nadie declaró**"*.

**Estaban declarados, y desde antes del 01/08.** Verificado contra `MAPEO` **vivo** (124 filas)
el 07/08: la solapa `digital/Digital` tiene 15 filas mapeadas, entre ellas `dig_campana` (A),
`dig_fecha_inicio` (E), `dig_fecha_fin` (F), `dig_impresiones` (H), `dig_alcance` (I),
`dig_views` (K), `dig_vtr` (L).

**La causa del error es una trampa de nombres**, y se anotó en `CLAUDE.md` §4 porque el patrón
se va a repetir:

| lo que se llama así | qué es |
|---|---|
| `"Seguimiento Digital"` | el **nombre de la base** `digital` (y el archivo real tiene un espacio al final) |
| `Seguimiento digital` | una **solapa** de esa misma base — la maestra de la unión |
| `Digital` | **otra solapa**, y además `BASES.digital.hoja_default` |

La búsqueda de anoche se hizo sobre la solapa `Seguimiento digital`. La respuesta estaba en la
solapa `Digital`.

**Corregido en tres lugares** (`CONFIG_INFORMES.md` §1.8 y §1.8.1 nueva, `HANDOFF_CODE.md`
punto 7 de Trabado, y este addendum). **En `PENDIENTES_consistencia.md` no estaba** — el grep
previo dio **cero** y por lo tanto **cero ediciones**, que es el resultado correcto
(`CLAUDE.md` §3).

**Cobertura real: 6 de las 7 columnas de la lámina 7 están mapeadas. Falta una, `Estado`,
columna `G` de `Digital`.** Se reporta y no se mapea: el prompt del 07/08 pide reportar lo que
falte.

### `N1.b` — la fuente de la lámina 7, decidida y verificada

Decisión del usuario del 07/08: sale de `digital/Digital`. Escrita en `CONFIG_INFORMES.md`
§1.8.1, con las otras dos descartadas y el motivo:

- `Digital 2026 acumulado` — `uso = derivada`, 683 filas, y su firma **no tiene VTR**.
- `CAMPAÑAS_DESGLOCE_DIGITAL` — 4.868 filas, **no tiene Alcance ni VTR** (sus métricas son
  Impresiones · Visualizaciones · Clics) y trae **una fila por campaña y plataforma**.

**Una premisa del prompt no se sostiene:** daba `CAMPAÑAS_DESGLOCE_DIGITAL` por declarada
`revisar`; `SOLAPAS` vivo dice **`fuente`**. Lo sustantivo sí se confirma, así que **el
descarte se sostiene por las columnas, no por el `uso`**.

### La medición que el prompt pedía para el reporte

Sobre la ventana del informe (24–30/07/2026), la solapa `Digital`:

| criterio | filas |
|---|---|
| "empieza en la ventana" | **0** |
| solape de `R-14` | **0** |

**Y no es culpa del criterio.** Las 897 fechas reales de la solapa van de **2024-08-29 a
2026-01-02**; 386 filas están vacías y 14 traen texto en vez de fecha. **No hay ninguna campaña
que llegue a julio de 2026.** No hay nada que deduplicar porque no hay nada: la pregunta por
campañas repetidas queda sin responder hasta que la solapa tenga datos de la ventana.

### `R-14` pasa a ser aplicable — Addendum 1 en `REGLAS_NEGOCIO.md`

`dig_fecha_fin` (columna `F`) existe: **hay extremo derecho, hay rango, `R-14` se puede
evaluar.** El "no es aplicable" de anoche queda superado. Lo que falta ahora no es el mapeo:
es **una semana con datos**.

### `sd_fecha_fin` y `sd_estado` — qué son hoy

Las dos filas que `N4` agregó anoche a `MAPEO` **quedan sin consumidor**: se mapearon cuando la
fuente que `R-14` nombraba era `Seguimiento digital`. **No se borran** — son filas válidas que
hoy nadie lee. `MAPEO` sigue en 124.

---

## `N2` — los tokens sin valor, contados por causa (2026-08-07) — commit de esta entrada

Medición, no vista: no se construyó ninguna hoja ni ningún panel. Denominador: los **172
tokens distintos** que la corrida ve en la plantilla de `jm` (los 195 menos los 23 de la lámina
escondida). Contra el deck de `jm-20260806-222554`, la corrida completa — **no** contra el valor
de retorno de las funciones.

**Las tres poblaciones, y suman:**

| | tokens |
|---|---|
| con valor en **todas** sus cajas | **18** |
| con valor en **una** caja y `«FALTA»` en otras | **11** |
| sin valor en **ninguna** caja | **143** |
| **total visible** | **172** |

**El 143 del prompt es correcto.** Los 154 que uno cuenta si busca `«FALTA:` en el deck
incluyen los 11 parciales, que sí tienen valor en alguna lámina.

### Los 143, por causa

| causa | tokens |
|---|---|
| sin fila en `MARCADORES` | **72** |
| sección sin ítems | **53** |
| fuente con cero filas tras el filtro | **15** |
| declarado `[MANUAL]` | **3** |
| fila incompleta | 0 |
| campo sin mapear | 0 |
| operación inexistente | 0 |
| **sin clasificar** | **0** |
| **total** | **143** |

**Que "sin clasificar" dé cero no es que la tabla haya cerrado sola.** En la pasada global daban
6 sin clasificar —los `enc_*` de `Directa Mail` con el empate de `ÚLTIMO` del 28/07—, y salieron
de la tabla porque **la pasada por ítem los resuelve**: son parte de los 11 parciales. La causa
"empate de `ÚLTIMO`" existe, está medida y tiene nombre; lo que no tiene es tokens sin valor.

**Dónde está el trabajo, leído de la tabla:**

- **53 de 143 son `camp_*`** y no dependen del motor: la sección `campana` itera sobre
  `CAMPANAS`, que tiene **3 filas y las tres son de `secco`**. Cero ítems de `jm` → las ocho
  láminas del bloque de campaña destacada quedan con sus tokens crudos. **Es una carga de
  datos, no código.**
- **72 no tienen fila en `MARCADORES`.** Adentro hay tres grupos distintos: los `rrss_*` (21,
  sin fuente identificada), los `m2_*` de la lámina 9 (8), los `cc_*`/`imp_*`/`contenidos_total`
  (16, el bloque sin fuente ya conocido), los `ecv_*` de las láminas 5 y 6 (12) y los cuatro
  `camp1`–`camp4` de la lámina 7.
- **15 tienen todo cableado y la fuente da cero filas** — los tres grupos de `T2.6` (`N3`).
- **3 son `[MANUAL]`** (`ecv_barrio1-3`), y no son trabajo pendiente del motor.

### El hallazgo grande: cuatro de los cinco encuentros pintaron cero

`repetibles.items` de la corrida completa:

| ítem | `id_cuenta` | resolvió | pintó |
|---|---|---|---|
| San Cristóbal (pre) | `3354-JULJDGAG` | 13 ok / 30 sin_datos | **0** |
| Retiro (pre) | `3346-JULJDGAG` | 13 ok / 30 sin_datos | **0** |
| **Orden Público** | `3387-JULJDGGC` | **31 ok** / 12 sin_datos | **11** |
| San Cristóbal (post) | `3354-JULJDGAG` | 13 ok / 30 sin_datos | **0** |
| Retiro (post) | `3346-JULJDGAG` | 13 ok / 30 sin_datos | **0** |

Los cinco están **anclados con cuenta**. Los `13 ok` de los cuatro que pintaron cero son
marcadores de otras láminas —`ecv_insc_*_pct`, `mail_*`, `gcba_*`—: de los 30 tokens de la
lámina 6 no resolvió ninguno. **La diferencia no es el anclaje: es que las cuentas
`3354-JULJDGAG` y `3346-JULJDGAG` no tienen filas en las solapas de canal para esta ventana, y
`3387-JULJDGGC` sí.**

**No se cableó ni se tocó nada.** Es medición.

---

## `N3` / `T2.6` — los tres grupos que recortan a cero: tres causas distintas, y una era un bug (2026-08-07) — commit de esta entrada

Lo que había que medir era **por qué la ventana da cero**. Da cero por tres motivos que no
tienen nada que ver entre sí.

### 1 · `sd_pauta_*` — **bug del motor. Arreglado.**

El recorte por ventana elegía la clave con la que lee la fecha de cada fila **por el nombre de
la solapa**:

```js
var claveFecha = (base === 'digital' && solapa === SOLAPA_MAESTRA_DIGITAL_)
  ? 'fecha_periodo'
  : encabezadoEnColumna_(...);
```

La maestra de `digital` llega por **dos caminos con filas de forma distinta**: por la unión
(`Union.gs`) el registro es plano y sus claves son los `campo_logico`; por `leerFuente` —el
agregado global, sin `id_cuenta`— las filas vienen indexadas por **el encabezado real de la
planilla**. El caso especial es correcto por el primer camino y **falso por el segundo**.

Consecuencia medida: `o['fecha_periodo']` era `undefined` en las **979** filas, y las seis
`pauta_*` recortaban `0 de 979 · 979 sin fecha`. Por el encabezado real —`"Fecha de inicio"`,
columna `L`— **751 de 979 tienen fecha y 16 caen en la ventana**.

**El arreglo elige por lo que la fila tiene**, que es lo único que no puede mentir:
`claveDeFila_(filas, claveLogica, encabezadoReal)`. Se aplicó en los **dos** lugares que
tenían el mismo caso especial por nombre — el recorte por ventana y `aplicarFiltro_`. En el
segundo el error era **latente**: ningún marcador filtra hoy sobre `Seguimiento digital`, pero
el primero que lo hiciera —`sd_estado`, por ejemplo— habría filtrado sobre `undefined`.

**Control, los 43 marcadores antes y después:**

| | antes | después |
|---|---|---|
| `ok` | 17 | **23** |
| `sin_datos` | 26 | **20** |
| `error` | 0 | 0 |

**Cambiaron exactamente seis, y son los seis esperados:** `pauta_google/meta/prog` y
`gcba_pauta_google/meta/prog`, de `sin_datos` a `ok` sobre **16 filas**. Ningún otro marcador
cambió de estado ni de valor. **Las 10 pruebas pasan.**

**El valor de los seis es `0`, y eso es un dato, no un hueco:** son 16 filas con valor numérico
que suman cero. Es exactamente la distinción que el motor tiene que sostener — `SUMA` sobre
cero filas da `sin_datos`, `SUMA` sobre 16 ceros da `0`.

### 2 · `Directa IVR` — **no es un bug: es el criterio de ventana, y `R-14` lo resolvería**

58 filas, las 58 con fecha, y **cero en la ventana**. Las de la semana del informe están
**a un día**:

| `Inicio` | cuenta | campaña |
|---|---|---|
| **22/07/2026** | `3387-JULJDGGC` | TE CUENTO BS AS JM \| 21/7 ORDEN PÚBLICO EJE NORTE |
| **23/07/2026** | `3387-JULJDGGC` | TE CUENTO BS AS JM \| 21/7 ORDEN PÚBLICO EJE NORTE |
| 31/07/2026 | `3449-JULEMEGC` | IVR \| Alerta Naranja 30/7 |

La ventana es **24–30/07**. Las dos campañas del encuentro de Orden Público **arrancaron el 22
y el 23**, un día y dos antes del viernes de inicio; la siguiente arranca el 31, un día después
del jueves de cierre. El agregado global las excluye porque filtra por *"empieza en la
ventana"*; **la pasada por cuenta las ve** —no recorta por ventana— y por eso `Orden Público`
es el único ítem que pintó números.

**Es literalmente el caso que `R-14` describe** — *"no es 'empieza en la ventana'"* — y
`Directa IVR` **tiene `ivr_fin` mapeado (columna `E`)**, así que el solape es computable ahí.
**No se implementó:** cambiar qué fecha gobierna el recorte del agregado global es una decisión,
no un arreglo, y el prompt manda anotarla y seguir.

### 3 · `Digital` — **ni bug ni criterio: la solapa no tiene datos de la ventana**

1297 filas · 897 con fecha real · 386 vacías · 14 con texto en vez de fecha.
**Rango de las 897: 2024-08-29 → 2026-01-02.** La ventana es julio de 2026.

Medido con los dos criterios: *"empieza en la ventana"* da **0** y el **solape de `R-14`
también da 0**. No hay ninguna campaña que llegue a julio de 2026. **Un cero acá no dice nada
sobre el criterio ni sobre el motor**, y es la misma solapa que `N1.b` acaba de declarar fuente
de la lámina 7.

---

## `N4` / `T2.7` — el instrumento deja de mentir (2026-08-07) — commit de esta entrada

`marcarEtapa_` tenía dos defectos y los dos producían **conclusiones falsas**, no sólo falta de
información.

**1 · Las cinco marcas se pisaban en la misma celda.** La fila sólo decía la última que llegó a
escribirse, así que una corrida que murió en la etapa 4 podía dejar escrita la 1 y eso se lee
como *"no arrancó"*. Ahora **cada marca sobrevive a la siguiente**: la celda acumula el
recorrido con `›`. Cuesta un `getValue` por etapa —cinco en total— y a cambio la fila dice el
camino, no un punto.

**2 · El `catch` era vacío.** Si el instrumento fallaba, la fila quedaba con una etapa vieja y
**eso se leía como diagnóstico**. Sigue sin poder voltear la corrida —eso está bien y no
cambia— pero ahora el fallo se guarda en `fallosInstrumento_`, la corrida lo publica en
`instrumento.fallos`, la celda de `CORRIDAS` lo dice, y el reporte del menú lo canta **arriba
de todo**, porque cambia cómo se lee el resto.

### Controles

**Acumulación**, sobre una fila de scratch que se creó y se borró en el mismo control:

```
(en curso) 1 · expandir secciones repetibles +0s › 2 · mapa token→objectId +1s
           › 3 · pasada por ítem +2s › 4 · tokens fijos +3s › 5 · escribir faltantes +3s
```

**Las cinco sobreviven.** La fila de scratch se borró (`CORRIDAS` vuelve a su largo anterior).

**Instrumento sano vs. roto**, dos corridas cortas con una excepción inyectada en la etapa 2
para no gastar 120 s cada una:

| | `instrumento.fallos` |
|---|---|
| A · normal | `[]` |
| B · con `SpreadsheetApp.flush` tirando | **3** — etapas 1, 2 y 5, las tres que se llamaron |

En las dos la excepción **no escapó** y la fila cerró. `flush` y `mapaTokenObjectId_`
restaurados.

### Un error propio que cazó el control, y por eso el control valía

El primer intento puso los dos avisos —excepción y instrumento— en un **ternario**, así que
competían: con las dos cosas a la vez, la celda contaba **sólo la excepción**. Justo el caso
en que más importa saber que el rastro de etapas no es confiable. Lo cazó el control B, que
mostró `instrumento.fallos` con 3 entradas y una celda que no las mencionaba.

`avisosDeLaFila_(n, fallo, fallosInstrumento)` los **acumula**. Verificado en los cuatro
casos: sin avisos devuelve el número pelado (`270`), y con las dos devuelve
`172 · ⚠ excepción … · ⚠ el instrumento falló 2 vez/veces …`.

**Las 10 pruebas pasan.** Los dos decks de control, a la papelera; `FALTANTES` restaurado a sus
270 filas. **Pendiente de verificación humana.**

---

## `N5` / `T2.9.4` — retirado `VALOR_STATUS_REALIZADA_` (2026-08-07) — commit de esta entrada

**Premisa verificada primero, contra `MAPEO` vivo:**
`rdv | RVD JM-CM - ES | status | I | valores_incluidos = Realizada`, con la nota que ya
anticipaba esta tarea — *"lista blanca — ver `D-21`. El consumidor duplicado de `Union.gs` se
retira en el paso del matcher"*.

`encontrarFilaRdvDeReunion_` (`Union.gs`) filtraba **una segunda vez** por
`status === 'Realizada'` sobre filas que `leerFuente` ya había filtrado por la lista blanca. No
cambiaba ningún resultado, pero sostenía **una constante de módulo con un valor de negocio
adentro** — deuda desde la línea uno (`CLAUDE.md` §2): cambiar qué status entra exigía
`clasp push` en vez de editar una celda. **Ahora la celda de `MAPEO` es el único lugar donde se
decide.**

**Lo que NO se retiró, a propósito:** la precondición que exige `campoStatus.ok`. Si el mapeo de
`status` desapareciera, la lista blanca dejaría de filtrar y el matcher empezaría a encontrar
encuentros suspendidos **sin decirlo**. La guarda se queda; el filtro se va.

El mensaje de "no se encontró" también cambió: ya no nombra el valor `"Realizada"` —que era
parte de la constante— y dice de dónde viene el filtro.

### Control obligatorio: los cinco anclajes, antes y después

```
Orden Público      |      | 3387-JULJDGGC | 1
Retiro             | post | 3346-JULJDGAG | 1
Retiro             | pre  | 3346-JULJDGAG | 1
San Cristóbal      | post | 3354-JULJDGAG | 1
San Cristóbal      | pre  | 3354-JULJDGAG | 1
```

**Idénticos**, comparación exacta del objeto entero. `sinLink` 0 → 0, `bajaConfianza` 0 → 0.
**Las 10 pruebas pasan.**

El comentario del seed en `Instalar.gs` se actualizó: decía *"pasa a filtrar dos veces por lo
mismo"* y ahora dice que el matcher ya no filtra por su cuenta. **Pendiente de verificación
humana.**

---

## `N6` / `T2.9.2` — las dos ventanas del anclaje a `CONFIG` (2026-08-07) — commit de esta entrada

Mismo argumento que el Paso 2.9F con `umbral_anclaje_reunion`, y el que `R-12` ya dejó escrito:
cambiar un parámetro de negocio no puede exigir `clasp push`.

| clave de `CONFIG` | valor | helper | qué hace hoy |
|---|---|---|---|
| `ventana_candidatos_anclaje_dias` | **`14`** | `ventanaCandidatosAnclajeDias_()` | lo que hacía la constante de módulo |
| `ventana_candidatos_anclaje_ampliada_dias` | **vacía** | `ventanaCandidatosAnclajeAmpliadaDias_()` → `null` | **nada: `null` significa "no ampliar"** |

**La corta replica exactamente el valor de hoy.** `VENTANA_DIAS_CANDIDATOS_ANCLAJE_` pasó a
llamarse `..._DEFECTO_` y **ya no se usa directo**: sólo entra si `CONFIG` no tiene la clave,
igual que `UMBRAL_CONFIANZA_ANCLAJE_DEFECTO_`.

**La ampliada nace vacía a propósito, y ésa es la decisión del paso.** `R-12` manda ampliar
antes de declarar `sin_link`, pero **cuántos días** es una decisión de negocio que nadie tomó.
Poner un número para que la clave "quede completa" sería inventar el faltante (`CLAUDE.md` §4).
Vacía significa "no ampliar", que es literalmente lo que el motor hace hoy — por eso este paso
**no cambia ningún comportamiento**. Y **nadie la consume todavía**: el reintento con la ventana
ampliada es de otro paso, como `R-12` dice.

**Controles:**

- `aplicarSeedConfiguracion_` escribió **exactamente 2 claves nuevas** en `CONFIG` y **cero**
  cambios en `BASES`, `MAPEO`, `INFORMES` y `PERIODOS`. Backup con `tools/snapshot.js` antes.
- Los helpers leen bien: corta `14`, ampliada `null`.
- **El anclaje da idéntico** al control de `N5` — los cinco encuentros, mismo `id_cuenta`,
  mismo score, comparación exacta del objeto entero.
- **Las 10 pruebas pasan.**

**Pendiente de verificación humana.**

---

## `N7` / `T2.5` — el formato `porcentaje_sin_signo`, y las decisiones que faltan para la lista (2026-08-07) — commit de esta entrada

El prompt mandaba **empezar por el formato de porcentaje**, que era el más chico y el único
medido, y **anotar y seguir** lo que necesitara una decisión.

### Hecho: `porcentaje_sin_signo`

Cierra el 2×2 que los formatos venían dibujando a medias — **unidad de entrada × lleva el
signo** — y la fila de `MARCADORES` es la que sabe las dos cosas:

| formato | entrada | sale |
|---|---|---|
| `porcentaje` | unidades de pct | `26.4%` |
| **`porcentaje_sin_signo`** | unidades de pct | **`26.4`** |
| `fraccion` | 0–1 | `28.2` |
| *(entrada 0–1 con signo)* | — | no existe, nadie lo pidió |

**`numero` no era equivalente**, y ése es el motivo de existir del formato: redondea a **dos**
decimales (`25.42`) donde el resto del deck muestra **uno** (`25.4`), así que la misma lámina
mezclaba dos precisiones. Las notas de los cinco `ecv_insc_*_pct` ya lo decían desde el 05/08.

**Cinco afirmaciones nuevas** en `probarFormatoMarcador_`, incluida la que fija el motivo —
`numero` da dos decimales— y la que ata los dos formatos: `porcentaje_sin_signo` + `'%'` tiene
que dar exactamente `porcentaje`. **Las 10 pruebas pasan.**

**El cableado no se tocó**, y es deliberado: cambiar `formato` en esas filas **cambia números
publicados** (`mail_or` pasaría de `25.42` a `25.4`) y la corrida tenía prohibido cablear.

**Son nueve celdas, y las nueve están verificadas caja por caja contra el deck**:
`ecv_insc_mail_pct`, `ecv_insc_cc_pct`, `ecv_insc_ivr_pct`, `ecv_insc_digital_pct`,
`ecv_insc_dif_pct`, `enc_e75_pct`, `mail_or`, `gcba_mail_or`, `ivr_at_pct`.

> **Un error propio que cazó la verificación.** El primer borrador dejaba `ivr_at_pct` afuera
> *"porque su caja no trae `%` propio"* — supuesto, no medido. La caja dice
> `Atendidos: «FALTA:ivr_atendidos» («FALTA:ivr_at_pct»%)`. Las nueve traen su signo.

### Anotado y no implementado: la operación que devuelve lista

`DISTINCT` necesita **cinco decisiones**, y ninguna es del motor. Están escritas en el `P2` de
`docs/PENDIENTES_consistencia.md`: qué devuelve con cero filas —el precedente del proyecto está
partido a propósito, `SUMA` da `sin_datos` y `CONTEO` da `0`—, con qué separa, en qué orden,
cómo deduplica —`R-10` preserva mayúsculas, así que `Palermo` y `palermo` serían dos barrios— y
qué pasa si no entra en la caja.

**Y una que precede a las otras cuatro:** sigue sin confirmarse si `ecv_barrios` es **el
conteo** de barrios distintos o **la lista de nombres**. Si es el conteo, `DISTINCT` no
necesita devolver lista y las otras cuatro desaparecen. **Ésa es la que hay que responder
primero.**

---

## Corrida de cierre de la noche del 07/08 — los cinco cambios juntos, de punta a punta (2026-08-07) — commit de esta entrada

`jm-20260807-023839`, con `T2.1.2`, `T2.6`, `T2.7`, `T2.9.4`, `T2.9.2` y el formato nuevo
adentro:

| | 06/08 (`jm-20260807-004300`) | 07/08 (`jm-20260807-023839`) |
|---|---|---|
| corte | `null` | `null` |
| fallo | — | `null` |
| `instrumento.fallos` | — | `[]` |
| barrida (tokens crudos) | 0 | **0** |
| tokens reemplazados | 29 | **35** |
| faltantes | 270 | **264** |
| marcadores | 17 ok / 26 sin_datos | **23 ok / 20 sin_datos** |
| gastado | 120 s | **231 s** |

**Los +6 / −6 son exactamente los seis `pauta_*`** que `N3` destrabó: `pauta_google/meta/prog` y
`gcba_pauta_google/meta/prog`, ahora con valor en el deck. Ningún otro token cambió.

**⚠ El presupuesto se apretó y no está explicado.** 231 s contra 120 la noche anterior, sobre un
techo de 350. Los seis `pauta_*` ahora recorren 979 filas donde antes cortaban en cero, así que
hay una **causa candidata** — pero **no está medida, y una corrida no es una serie**
(`CLAUDE.md` §4: causa y observación no son lo mismo). Se nombra como candidato. Medirlo es lo
primero de la próxima sesión.

Los cinco ítems siguen igual: sólo `Orden Público` pinta (11), los otros cuatro pintan cero.

---

## Parte A de las once respuestas del 07/08 — escritas en su dueño (2026-08-07) — commit de esta entrada

### ⚠ Lo primero: una de las once **contradice** lo que ya estaba escrito, del mismo día

`A.1` dice *"selección de campaña destacada: **por defecto la semana**; si no, por temario"*.
`docs/CONFIG_INFORMES.md` §1.1 dice, **con la misma fecha (07/08/2026) y el mismo origen
(decisión del usuario)**, exactamente lo contrario:

> *"El temario elige qué campañas destacadas van, y se buscan en toda la base. El período **no**
> es el criterio de selección… **La ventana agrega, el temario selecciona**."*

Y esa versión trae **un caso testigo medido** —San Cristóbal 23/07 entrando con ventana
24–30/07 (§1.7)— y una consecuencia escrita en `D-19`.

**No se eligió ninguna.** Las dos quedan marcadas, cada una apuntando a la otra: en §1.1 y en
`R-16`. **La sección `campana` no se tocó**, y lo único que se ejecutó es el solape sobre los
**agregados**, que es el terreno donde las dos versiones coinciden.

### Qué de las once ya estaba, y qué no

| | ya estaba | qué se hizo |
|---|---|---|
| `A.1` semana/temario | **sí, y al revés** — §1.1 | contradicción marcada en los dos lados |
| `A.1` los tres cortes (remitente · resto · vocero) | **medidos** en `BITACORA` del 04/08, **nunca como regla** | **`R-15` nueva** |
| `A.2` fuente de la lámina 7 | §1.8.1, del mismo día, decía `Digital` | **superada por §1.8.2** |
| `A.3` cableado lámina por lámina | no | **`T2.11`** en `PLAN.md` §2 — ID greppeado, `T2.11` estaba libre |
| `A.4` inscriptos/asistentes de `rdv` | **a medias**: los cinco `_pct` cableados a `rdv`, los numeradores sin fila | **§1.4 bis** nueva |
| `A.5` el solape | `R-14` (06/08) | **`R-16`** nueva, con el motivo de dominio |
| `A.6` `ecv_barrios` es lista | la pregunta estaba en §1.4 y en el `P2` | respondida en los dos |
| `A.7` nueve porcentajes | las nueve celdas ya identificadas | ejecutado en `B.1` |
| `A.8` salida A | las tres salidas escritas sin elegir | **elegida A**, §1.8.0 |
| `A.9` `secco` a 4 ranuras | `[?]` abierta en §2.3 | **resuelta**, y **no ejecutable**: `D-22` |
| `A.10` tamaño de página en `SECCIONES` | `T2.10` lo proponía | **decidido**, ejecutado en `B.2` |
| `A.11` `m2_*` con sufijos | §2.0 lo tenía como discrepancia | **derogada** la tabla de §1 |

### `R-15` — el corte JM/GCBA es una señal por canal

**Es la regla que más tiempo llevaba sin escribirse**: las decisiones son del **04/08** y
vivían sólo en la memoria de sesión, no en el repo. Cuatro canales, cuatro respuestas: `Vocero`
para IVR, `Mail remitente` para mail, **todo GCBA** para SMS, y `JM | GCBA | POLICIA` para
pauta digital.

Tres cosas que no se derivan solas y por eso van escritas: **GCBA se define por resta, no por
lista** —por eso el cableado usa `!=jorge.macri@…`—; **si el mail sale de JM, la campaña
directa es de JM**; y **el vocero y la pauta son preguntas distintas**. Más la asimetría
medida: **136 de 880 cuentas mandan desde dos remitentes**, así que el remitente **no se puede
propagar por `id_cuenta`**.

Re-verificado el 07/08: `Vocero` 58/58 con dato (`JM` 53 · `GCBA` 5);
`JM | GCBA | POLICIA` sobre 1297 filas — `GCBA` 739 · `JM` 205 · **`POLICIA` 16** · 337 vacías.

### `R-16` — la selección por período entra por solape

`R-14` aplicada, con **el motivo de dominio que no estaba en ninguna parte: las campañas suelen
empezar unos tres días antes.** Y la contracara escrita: **los tres días NO son un parámetro** —
el solape ya los cubre, y agregar una clave de "días antes" sería inventar una decisión que
nadie tomó.

### `A.11` — la tabla de `m2_*` por categoría queda derogada

`TOKENS.md` §1 decía *"se eliminan los sufijos `_a`…`_e`"* y lo daba por **confirmado**; la
plantilla viva los tiene desde entonces. **Manda la plantilla.** Y hay un motivo de fondo, no
sólo de sincronización: la lámina 10 **está escondida y no se emite** — renombrar 23 tokens que
nadie ve, contra `C-01`, para que coincidan con un documento, es al revés de cómo trabaja este
proyecto.

---

## `B.1` — los nueve porcentajes pasan a `porcentaje_sin_signo` (2026-08-07) — commit de esta entrada

`A.7`: **sí, aunque cambie el número publicado.** Ejecutado.

**Un escritor nuevo y declarado, en vez de tocar celdas a mano.** `curarCamposMarcadores_` es a
`MARCADORES` lo que `curarSecciones_` es a `SECCIONES`: corrige **un campo** de una fila que ya
existe, no crea ni borra, y devuelve el antes y el después de cada celda. Nace porque
`curarMarcadores_` sólo sabe filas enteras — cambiar nueve `formato` con esa herramienta las
borra y las reescribe al final de la hoja. Anotado en `docs/ESCRITORES.md` como el **tercer
escritor**.

`migrarFormatoPorcentajeSinSigno_` lleva la lista de las nueve y es idempotente.

**Resultado: 9 celdas escritas, 0 sin fila.** Las nueve pasaron de `numero` a
`porcentaje_sin_signo`.

### El control: que cambien las nueve y ninguna otra

| | antes | después |
|---|---|---|
| resumen | 23 ok / 20 sin_datos / 0 error | **idéntico** |
| marcadores con valor formateado distinto | — | **6** |

Los **seis** que se ven:

| marcador | antes | después |
|---|---|---|
| `ecv_insc_cc_pct` | `8.13` | **`8.1`** |
| `ecv_insc_ivr_pct` | `1.29` | **`1.3`** |
| `ecv_insc_digital_pct` | `29.28` | **`29.3`** |
| `ecv_insc_dif_pct` | `2.12` | **`2.1`** |
| `mail_or` | `25.42` | **`25.4`** |
| `gcba_mail_or` | `28.57` | **`28.6`** |

**Nueve celdas y seis valores no es una inconsistencia**, y conviene decir por qué: de las tres
que no se movieron, `ecv_insc_mail_pct` ya daba `59.9` con dos decimales —el redondeo coincide—
y `enc_e75_pct` e `ivr_at_pct` están `sin_datos` en la pasada global, así que **no tienen valor
que cambiar todavía**. Los dos van a moverse en cuanto tengan datos: `enc_e75_pct` ya resuelve
por ítem para Orden Público.

**Ninguna otra se movió.** Las 10 pruebas pasan. Backup previo con `tools/snapshot.js`.

---

## `B.2` — `items_por_lamina` en `SECCIONES`, y `secco` a cuatro ranuras (2026-08-07) — commit de esta entrada

`A.10`: el tamaño de página se declara en `SECCIONES`, una columna por sección.

**Entró por `COLUMNAS_DELTA_`, no por la rama que reescribe la fila 1**, y ése es todo el
cuidado del paso: `SECCIONES` tiene **36 filas curadas a mano** y la rama `else` de
`aplicarInstalacion_` reescribe los encabezados **sin mover los datos** — con una columna nueva
eso corre todo una posición, en silencio y sin fallar. `indice: 15` = antes de `notas`, que
sigue siendo siempre la última. Mismo mecanismo y mismo motivo que `periodo_ref` en su día.

**Verificado que nada se corrió:** los 16 encabezados en orden, y la fila de `encuentro` con su
`notas` larga todavía en `notas`. Las 36 filas siguen.

**Valores cargados por `curarSecciones_`** —el camino declarado, porque `sembrarSecciones_`
sólo agrega y nunca pisa—:

| sección | `items_por_lamina` |
|---|---|
| `comunicaciones_post` | **4** |
| `encuentro` | 1 |
| `campana` | 1 |

Y en `SEED_SECCIONES_`, para que una instalación nueva nazca igual. **Vacío es un valor válido
y significa el comportamiento de hoy**: una lámina por ítem.

**Nadie la consume todavía.** Es la entrada de `T2.10`, que no está implementado ni aprobado.

### `A.9` · `secco` a cuatro ranuras — decidido y **no ejecutado**, con motivo

La decisión quedó escrita en `CONFIG_INFORMES.md` §2.3 y en la columna. **La ejecución no se
puede hacer:** pasar de 3 a 4 ranuras exige **agregarle una fila a la tabla** de la lámina 10 de
`secco`, y eso es exactamente lo que `D-22` mide que el motor no sabe hacer — no hay una sola
llamada de inserción de filas de Slides en el repo. La cuarta la agrega una persona, o espera a
que exista el mecanismo.

**Las 10 pruebas pasan** y el anclaje sigue dando los cinco encuentros idénticos.

---

## `B.3` — `resumen_ejecutivo` deja de ser repetible, y `camp_bench_*` sigue abierta (2026-08-07) — commit de esta entrada

**`resumen_ejecutivo`: `repetible` → `unica`**, y `itera_sobre` de `entidad (JM / GCBA)` a
vacío. Aplicado con `curarSecciones_` y en `SEED_SECCIONES_`.

**Está medido que no puede ser repetible:** los tokens de GCBA llevan **prefijo propio**
(`gcba_mail_envios`, `gcba_imp_total`…), así que las láminas 2 y 3 no son una lámina modelo
iterada sobre dos entidades — son **dos láminas con tokens distintos**.

**No cambia ningún comportamiento, y eso también se verificó:** `seccionesRepetiblesDe_('jm')`
devolvía y sigue devolviendo `encuentro`, `comunicaciones_post`, `campana`. La fila nunca
entraba, porque no declara `familia_tokens`. `repetible` era **una etiqueta que no hacía nada y
contradecía lo medido**; se corrige la etiqueta.

### `camp_bench_*` — se buscó, no alcanzó, queda anotada

`B.3` mandaba resolverla *"según lo que diga `A.1`/`A.5`"*. **Ninguna de las dos la toca**, y el
motivo es de forma, no de detalle: `A.1` decide **qué campañas entran**, `A.5` decide **con qué
criterio de fecha**, y `camp_bench_*` pregunta **de dónde sale un número de referencia** — que
no es una fila que entre o salga de una ventana.

Sigue siendo una pregunta de una línea: ¿los seis `camp_bench_{google,meta,prog}_{ctr,vtr}` son
constantes del año o se recalculan contra el período anterior? **Si son constantes,
`MARCADORES.valor_fijo` los resuelve sin código.**

Las 10 pruebas pasan.

---

## `B.4` — la fuente de la lámina 7 pasa a `Digital 2026 acumulado` (2026-08-07) — commit de esta entrada

`A.2`: la fuente deja de ser `Digital`. El usuario autorizó cambiar el seed y usar la que sirva.

**El motivo es medido, no de preferencia.** `Digital` —la candidata de ayer— **no tiene ninguna
fila en la ventana del informe**: sus 897 fechas reales van de 2024-08-29 a 2026-01-02 y la
ventana es julio de 2026. Declararla fuente dejaba la lámina vacía por construcción.

**Dos cambios de seed, los dos por su camino:**

| | qué | resultado |
|---|---|---|
| `SOLAPAS` | `Digital 2026 acumulado`: `derivada` → **`fuente`** | 1 solapa actualizada, ninguna otra |
| `MAPEO` | **12 filas nuevas** con prefijo `acum_` | 122 → **136** filas *(124 + 12)* |

**Prefijo `acum_` y no `dig_`**, aunque la clave de `MAPEO` incluya la solapa y no hubiera
colisión: `dig_impresiones` sobre `Digital` son las impresiones **de un período** y sobre esta
solapa son **el acumulado de la campaña entera**. Dos cosas distintas con el mismo nombre es
exactamente la trampa que costó una noche el 07/08. Es además la convención que ya usan `alc_`,
`sd_`, `mail_`, `ivr_` y `sms_`: **un prefijo por solapa**.

### La medición que cierra la pregunta de anoche

Sobre la ventana 24–30/07/2026, leyendo la solapa nueva:

| | |
|---|---|
| filas con "empieza en la ventana" | 14 |
| **filas por solape de `R-14`** | **66** |
| campañas distintas | **66** |
| **repetidas** | **ninguna** |
| filas sin fecha de fin | **0** |

**No hay nada que deduplicar.** La pregunta quedó abierta anoche porque `Digital` devolvía cero
y no había sobre qué medir.

**Y las campañas son las correctas**, lo que es el mejor control que hay de que la fuente es la
que va: *"Agenda RDV Con 1 - Orden Público Eje Norte 28/7"*, *"Agenda Post con 1 - 1 A 1 -
Retiro - 24/7"*, *"Agenda con 1 - 1 A 1 - San Cristobal - 24/7"* — son los encuentros de este
informe.

### VTR: propuesto, **no cableado**

`Digital 2026 acumulado` no tiene columna de VTR y **es derivable**: `acum_views /
acum_impresiones`, que es la definición estándar. El motor ya tiene con qué —`PCT` sobre
`acum_views/acum_impresiones` con formato `porcentaje_sin_signo`—. **No se cableó**: el prompt
pide proponerlo y decirlo en el reporte. Escrito en `CONFIG_INFORMES.md` §1.8.2.

### `Digital` no se borró, y nada se rompió

Sigue `uso = fuente`. La siguen leyendo **seis marcadores**: `enc_impresiones`, `enc_alcance`,
`imp_total`, `frecuencia`, `gcba_imp_total`, `gcba_frecuencia`.

**Control: 23 ok / 20 sin_datos / 0 error antes y después, y cero marcadores con estado o valor
distinto.** Las 10 pruebas pasan.

**Tres advertencias sobre la solapa nueva**, escritas en `CONFIG_INFORMES.md` §1.8.2 porque van
a morder a quien la use para otra cosa: **no tiene columna `JM | GCBA | POLICIA`** —el corte de
`R-15` para pauta digital no es computable ahí—, su **`Estado` viene en MAYÚSCULAS** y `R-10` no
pliega el case, y es **un acumulado**: sus números son de la campaña entera, no del período.

---

## `B.5` — la lámina 7 de `jm` pasa a la familia `post_` (2026-08-07) — commit de esta entrada

`A.8`: **salida A** del `P2` de `comunicaciones_post`. Ejecutada.

`migrarTokensComunicacionesPost_` (`Armonizar.gs`), migración de una sola vez con **backup
como precondición dura**: si el backup falla, no se escribe. Backup hecho —
`JM_marcada — backup 2026-08-07 08:25`, en la subcarpeta `_backups` de la carpeta de
plantillas.

**Cuatro reemplazos, una ocurrencia cada uno**, contados **antes** de tocar nada (después del
reemplazo el token viejo ya no existe y no se puede contar):
`{{camp1}}`…`{{camp4}}` → `{{post_camp1}}`…`{{post_camp4}}`.

### El control es el que dice si la salida A servía

| | antes | después |
|---|---|---|
| `slidesModeloDe_(pres, ['post_'])` para `jm` | **`[]`** | **`[7]`** |
| tokens de la lámina 7 | `camp1..camp4` | `post_camp1..post_camp4` |
| `camp1`…`camp4` sueltos en la plantilla | 4 | **0** |
| tokens visibles de la plantilla | 172 | **172** |

**La sección `comunicaciones_post` encuentra su bloque modelo**, y sus dos ítems dejan de
perderse. Era el "5 y no 7" que aparecía como número raro en tres mediciones seguidas.

**Lo que la salida A NO resuelve:** la lámina tiene cuatro ranuras y **una sola columna con
token**. Las otras seis —Estado, Período, Alcance, Impresiones, Vistas, VTR— siguen sin token,
y son **24 de los 28** de la lista de `CONFIG_INFORMES.md` §1.8. Renombrar cuatro tokens no
llena una tabla.

### Un hallazgo que salió al tocar el archivo, y hay que decirlo

**`RENOMBRES_ARMONIZACION_POR_INFORME_.jm` todavía tenía los dieciséis renombres de `m2_*`** que
`A.11` acababa de derogar. **Se retiraron.** Dejarlos habría hecho que la próxima armonización
deshiciera la decisión **en silencio**: una lista de renombres viva es una intención pendiente,
no un registro histórico. La lista original queda en el historial de git y en `TOKENS.md` §1.

**Los cuatro `post_camp*` NO se agregaron a esa lista**, a propósito: la aplica la armonización
entera, que además corrige contenido de caja y filtra láminas congeladas. Acá hacía falta sólo
el renombre, con su propio backup y su propio reporte.

**⚠ Esto cambia el deck** y todavía no se midió: `comunicaciones_post` tiene 2 ítems y ahora
una lámina modelo, así que la corrida va a **duplicar la lámina 7 en dos**. La corrida de
cierre lo mide. Las 10 pruebas pasan.

---

## `R-16` aplicada — la ventana de selección entra por solape (2026-08-07) — commit de esta entrada

Prompt propio (`2026-08-07_5`), separado de las once respuestas porque **cambia números en
todos lados**.

### Parte 0 — lo que había que saber antes de escribir

**`0.1` · El recorte por período se decide en DOS lugares, no en uno**, y por eso el cambio
entró en los dos:

| dónde | para qué bases |
|---|---|
| `leerFuente`, rama `modo === 'filtrar'` (`Fuentes.gs`) | `rdv`, `looker` |
| el recorte del agregado global (`Generador.gs`) | `digital`, que es `snapshot` |

**El criterio vive ahora en una sola función**, `entraPorSolape_` (`Fuentes.gs`), que llaman
las dos. Dos criterios distintos sobre la misma pregunta es la divergencia que este repo ya
pagó con los 195 contra 172.

**`0.2` · Cuatro solapas tienen las dos fechas, y son las cuatro de campaña.** `Digital`
(`E`/`F`), `Directa IVR` (`D`/`E`), `Seguimiento digital` (`L`/`M`) y `Digital 2026 acumulado`
(`C`/`D`). **No es "la mayoría no tiene fin"**, así que no se paró.

**Las que no la tienen no la tienen por naturaleza:** una fila de `Directa Mail` es **un
envío** y una de `rdv` es **un encuentro** — una sola fecha, y forzarles un fin sería inventar
un dato. `A.2` del prompt lo pide explícitamente: siguen como están **y el motor lo dice**.

### Cómo se declara

`MAPEO.fecha_fin_periodo`, contraparte declarativa de `fecha_periodo`. Donde está, el recorte
entra por solape; donde no, por punto. **Nada hardcodeado y nada implícito**, y la traza dice
cuál de los dos criterios usó:

```
recorte por ventana sobre "Inicio" · SOLAPE contra "Fin" (R-16): 2 de 58 fila(s)
recorte por ventana sobre "Fecha de inicio" · punto — la solapa no declara fecha_fin_periodo
```

### Qué valores cambiaron — quince marcadores

**IVR dejó de dar cero, que era la prueba.** `Directa IVR` pasó de **0 a 2 filas** en la
ventana: las dos campañas de Orden Público que arrancan el **22 y el 23/07** con la ventana
empezando el **24**.

| marcador | antes | después |
|---|---|---|
| `enc_audiencia` | `sin_datos` | **78.637** |
| `enc_atendidos` | `sin_datos` | **71.234** |
| `enc_e75` | `sin_datos` | **27.599** |
| `enc_marque1` | `sin_datos` | **256** |
| `enc_e75_pct` | `sin_datos` | **38.7** |
| `ivr_campanias` | `0` | **2** |
| `ivr_llamados` | `sin_datos` | **78.637** |
| `ivr_atendidos` | `sin_datos` | **71.234** |
| `ivr_at_pct` | `sin_datos` | **90.6** |
| `pauta_google/meta/prog` | `0` | **1** |
| `gcba_pauta_google/meta/prog` | `0` | **1** |

`Seguimiento digital` pasó de 16 a **72 filas** en la ventana.

**Resumen: 23 `ok` / 20 `sin_datos` → 31 `ok` / 12 `sin_datos`.** Cero errores.

> **Una confirmación independiente que vale anotar:** `enc_e75_pct` da **38.7**, y el handoff
> venía diciendo desde hace días —por otra vía— que *"`enc_e75_pct` da 38,74 contra 39 %
> publicado: es el mismo número redondeado"*. El solape lo hace salir por el camino normal del
> motor y da lo mismo.

### Y nada se movió en las fuentes que ya daban bien

`Directa Mail` (`mail_*`, `gcba_mail_*`), `Directa SMS` (`gcba_sms_*`) y `rdv` (`ecv_*`)
**no aparecen en la lista de cambios**: no declaran `fecha_fin_periodo` y siguen entrando por
punto. `Digital` tampoco se movió, y es correcto — **por solape también da cero**, porque sus
fechas llegan hasta 2026-01-02.

**El anclaje sigue idéntico**: los cinco encuentros, mismo `id_cuenta`, mismo score. **Las 10
pruebas pasan.**

### Los tres días de anticipación NO son un parámetro

`A.4` del prompt, y está escrito en `R-16`: el solape ya los cubre —una campaña que arranca
tres días antes y sigue activa, entra— y **agregar una clave de "días antes" sería inventar
una decisión que nadie tomó**. No existe ni va a existir.

**Pendiente de verificación humana.**

---

## Corrida de cierre del 07/08 — las once respuestas y `R-16`, de punta a punta (2026-08-07) — commit de esta entrada

`jm-20260807-083557`, con todo adentro: los nueve formatos, `items_por_lamina`,
`resumen_ejecutivo` a `unica`, la fuente nueva de la lámina 7, el renombre a `post_*` y el
solape.

| | 06/08 | 07/08 madrugada | **07/08 cierre** |
|---|---|---|---|
| `corte` / `fallo` / `instrumento.fallos` | `null` / — / — | `null` / `null` / `[]` | **`null` / `null` / `[]`** |
| barrida (tokens crudos) | 0 | 0 | **0** |
| marcadores `ok` | 17 | 23 | **31** de 43 |
| tokens reemplazados | 29 | 35 | **38** |
| faltantes | 270 | 264 | **265** |
| ítems emitidos | 5 | 5 | **7** |
| gastado | 120 s | 231 s | **298 s** |

**`comunicaciones_post` emite.** Es la confirmación de punta a punta de la salida A: la sección
pasó de no encontrar lámina modelo a emitir **2 ítems** —San Cristóbal (post) y Retiro (post)—
sobre la lámina 11 del deck expandido. **Pintan cero tokens**, y es esperado: los cuatro
`post_camp1..4` no tienen fila en `MARCADORES`.

**⚠ El presupuesto: 298 s contra 350. El margen bajó a 15 %.** Es la contracara del solape:
`Directa IVR` pasó de 0 a 2 filas y `Seguimiento digital` de 16 a 72, así que las lecturas
devuelven mucho más. **Hay causa candidata, no medida** —una corrida no es una serie
(`CLAUDE.md` §4)— y con este margen **`T2.3` (reanudar) vuelve al camino crítico**.

Los cinco ítems de `encuentro` siguen igual: sólo Orden Público pinta (11).

---

## `MAPEO` por letra: el pendiente anotado, no implementado (2026-08-07) — commit de esta entrada

`docs/PENDIENTES_consistencia.md` gana un `P0`: la columna se resuelve por **posición** y una
columna insertada en una base ajena corre el mapeo sin síntoma. La Parte 0 midió lo que hacía
falta para escribirlo: **dos caminos**, no uno —índice directo sobre la fila cruda
(`leerFuente`, `filtrosValoresIncluidos_`, `verificarPrecondicionAnclaje_`, …) y letra →
encabezado → objeto fila (`encabezadoEnColumna_`/`valorPorColumna_`, que **parece** ir por
nombre y no va)—; **cero** decisiones que deroguen (`grep "letra"` sobre `PLAN.md` y
`REGLAS_NEGOCIO.md`); `D-21` como respaldo de que el fallback no puede ser silencioso; y la
superficie contra la planilla viva: **140 entradas, las 140 con `columna` cargada**.

No es el `P1 · Firma de encabezados`: aquél detecta el cambio, éste lo sobrevive. Van los dos.
De dónde sale el nombre —columna nueva en `MAPEO` o derivarlo de `SOLAPAS.fila_encabezado`—
queda planteado sin elegir: es el prompt siguiente. **Sin código.**

---

## `D-23` — la identidad de una lámina se declara en el deck (2026-08-07) — commit de esta entrada

Parte A del prompt del flujo de lámina nueva, con los once ajustes del `7.1`. La identidad va
a **las notas del orador**, en dos campos anexados por el motor: `#seccion:` y un
`#lamina: L-NNN` **global y opaco**, para que reclasificar una lámina no obligue a editar su
id.

**Lo medido el 07/08 sobre las dos plantillas vivas**, que es lo que fundamenta la decisión:
**51 láminas**, de las cuales **20 (39 %) se clasifican bien hoy** por `familia_tokens`, **5**
son ambiguas y **26 son huérfanas** (13 sin ningún token, 13 con tokens). Las dos plantillas
dan `EDIT` a la cuenta del script, así que no hay bloqueo en Drive.

**Tres descartes con razón medida, no con preferencia.** La sintaxis `{{…}}` queda descartada
porque `presentacion.replaceAllText` **sí alcanza las notas** (2 ocurrencias contra 1 de
`slide.replaceAllText`): la barrida de faltantes convertiría un `{{lamina}}` en `«FALTA:lamina»`
en el deck publicado. El alt text queda descartado porque **`TableCell` no expone
`setDescription` ni `setTitle`**. Y anexar en vez de reemplazar no es cortesía: `secco` ya
tiene dos láminas con notas escritas por el equipo, una de ellas ambigua.

**La Fase 2 se parte en 2a/2b** —sellar el id no requiere clasificar— y con eso se rompe la
circularidad con la hoja `LAMINAS`. **La clasificación no pasa por `familia_tokens`**: llenar
los 17 prefijos que hoy no declara nadie sería invertir en el mecanismo que la Fase 4 retira, y
`rrss_` ya demuestra que sale mal —vive en dos secciones distintas de dos informes—.

`familia_tokens` queda congelado. **Sin código.**

---

## Parte B — la autorización de `C-01` para escribir las notas (2026-08-07) — commit de esta entrada

`REGLAS_NEGOCIO.md` gana un **Addendum 1 a la suspensión acotada de `C-01`**, fechado
07/08/2026: el motor queda autorizado a **escribir las notas del orador** de la plantilla para
sellar el ancla de `D-23`. La `0.2` del prompt verificó contra el archivo que la suspensión
vigente autoriza **retirar una lámina y nada más**, así que el addendum hacía falta y no es
redundante.

**Anexa, nunca `setText`** — y la razón está medida: `SECCO_marcada` ya tiene dos láminas con
notas escritas por el equipo, una de ellas ambigua.

**Lo que el addendum NO autoriza, dicho con todas las letras:** `setSkipped`, insertar o
borrar láminas, y mover o reescribir cajas. La dirección general vive en `D-23`; acá la
autorización **crece por operación**, que es lo que la hace verificable. Alcance ejercido:
**ninguno** — el sellador no existe todavía.

`PENDIENTES_consistencia.md` gana dos `P2`: la suspensión de `C-01` lleva fecha 14/08/2026 y
el addendum se escribió el 07/08 —**no se corrige a ciegas**, no sabemos cuál de las dos está
mal—, y las dos láminas de `secco` (15 y 26) que no tienen tokens pero probablemente **no**
son estáticas. **Sin código.**

---

## Parte C — el flujo de marcar y clasificar una lámina, en el RUNBOOK (2026-08-07) — commit de esta entrada

`RUNBOOK.md` gana la sección *"Marcar y clasificar una lámina"*, con los seis pasos del flujo
decidido el 07/08. **Arranca con una advertencia**: *Sellar plantilla* **no está en el menú** y
no se va a encontrar ahí — es la Fase 2a de `D-23` y está sin implementar. Decirlo evita que
alguien la busque antes de que exista.

Queda escrito qué escribe el motor y dónde —dos campos en las notas del orador, **anexando**—,
qué autorización lo permite y qué **no** cubre esa autorización.

**La copia generada conserva el ancla** (decisión del usuario, 07/08): con tres numeraciones
conviviendo, es la única forma estable de decir de qué modelo salió una lámina del deck
publicado. **La consecuencia queda dicha**: las notas del deck publicado van a llevar texto de
máquina, visible en modo presentador y al imprimir.

**La hoja `LAMINAS` no se documenta todavía** — es Fase 3 y no existe. **Sin código.**

---

## Corrección a la Parte C: los pasos 2 a 4 quedaban del flujo previo a `AJ-10` (2026-08-07) — commit de esta entrada

El paso 4 decía *"declarás la sección —o la creás— y volvés a sellar"*, que es declarar en
`SECCIONES` — justo lo que `D-23` sacó de ahí. Y el paso 3 decía que el sellado **para** ante
una lámina sin sección deducible, cuando en la partición 2a/2b el primer sellado **no se
traba**: escribe el id en todas.

Reescritos 2, 3 y 4 según la partición que `D-23` ya tenía escrita: **2a** anexa
`#lamina: L-NNN` a todas y no necesita que ninguna esté clasificada; las no deducibles se
reportan **por lote**; la sección se declara en la hoja **`LAMINAS`** (Fase 3); **2b** escribe
`#seccion:` leyendo esa hoja. Sin agregar nada que `D-23` no diga.

El aviso de cabecera ahora cubre **las dos** cosas que no existen: la función *Sellar
plantilla* y la hoja `LAMINAS`. **La estructura de columnas de `LAMINAS` sigue sin
documentarse** — es `C.4`.

**Verificado:** ninguna otra parte del `RUNBOOK` manda a declarar en `SECCIONES` la pertenencia
de una lámina. La única otra mención es la lista de hojas que snapshotea `tools/snapshot.js`.
**Sin código.**

---

## Addendum 1 a `D-23` — el ancla se reduce a un campo (2026-08-07) — commit de esta entrada

Parte A del prompt `_9`. **El texto de `D-23` no se altera**: el addendum lo corrige, con la
forma que ya usan los de `D-20` y `D-21`.

**El ancla queda en `#lamina: L-NNN` y nada más.** El `#seccion:` se diseñó cuando el sellador
deducía la sección y la escribía en el deck; **la decisión que lo dejó sin función está en el
propio `D-23`** —la clasificación se declara en `LAMINAS`—, así que el `seccion_id` viviría en
dos lados a la vez contra `D-01`. Y lo que ese campo justificaba sigue resuelto: la necesidad
era identidad **por lámina**, que es justo lo que hace el id que queda.

**Consecuencia grande: la Fase 2 deja de estar partida.** Sin segundo campo no hay segundo
sellado — un solo sellado escribe ids en las 51 láminas, **no deduce nada y no se traba
nunca**. El default-deny se muda del sellador a la hoja.

**Y el ancla de la copia se limpia a demanda**, no se conserva siempre: una función que corre
el usuario cuando quiere, **sólo sobre el informe generado**, que **se niega** si el archivo es
una plantilla. La plantilla **no se limpia nunca** — el ancla es su historia y los ids no se
reasignan.

**Dos premisas medidas antes de escribirlo:** la copia **hereda las notas del equipo** (las dos
de `SECCO_marcada` llegan íntegras), y `duplicate()` **arrastra las notas**, así que N copias
de una lámina modelo comparten el id. Las dos van al addendum.

**Y seis puntos más, del `9.2`, en el mismo addendum y en una sola pasada.** El contador de
`L-NNN` **vive en la hoja `LAMINAS`** y no se deriva de las notas: derivarlo haría retroceder
el contador al retirar una lámina, y un id se reasignaría. La consecuencia **funde las fases 2
y 3** — con el contador en la hoja, sellar y sembrar son una sola operación, y es la tercera
vez que esta decisión resuelve una circularidad de la misma forma.

**Una lámina no se borra: se esconde**, y su ancla queda como histórico. El contraste con
`SOLAPAS` —que sí tiene `NO ENCONTRADA <fecha>`— es deliberado: las pestañas de bases de
terceros desaparecen, las láminas son nuestras.

**El contador es uno solo para las dos plantillas**, pero la frontera queda escrita:
**numeración común hoy, identidad compartida después.** Que la misma lámina lleve el mismo id
en `jm` y `secco` es implementación futura y necesita reconocimiento humano — aunque el
transporte sale gratis: **copiar una lámina entre presentaciones arrastra las notas**, medido.
Mientras tanto la regla es de trabajo, con lista medida: **nueve pares con el primer texto
idéntico, seis con el conjunto de tokens idéntico**, todos del bloque `camp_*`.

`PENDIENTES_consistencia.md` gana un `P2` con la pregunta abierta —una fila con `informes`
plural contra una fila por (`lamina_id`, `informe_id`)— y el precedente de
`comunicaciones_post` citado. **Sin código.**

---

## Parte B — la autorización de `C-01` se acota a un solo campo (2026-08-07) — commit de esta entrada

`Addendum 2` a la suspensión acotada de `C-01`. **Es un recorte, no una ampliación**, y así
está escrito: el `Addendum 1` de esta mañana autorizaba sellar dos campos, y el `Addendum 1 a
D-23` dejó sin función al segundo, así que escribir `#seccion:` en una plantilla **ya no está
autorizado** — no porque se haya prohibido, sino porque el campo dejó de existir.

**El texto del `Addendum 1` no se toca**: siguen igual su "qué NO autoriza", su "anexa, nunca
`setText`" y su alcance ejercido, que **sigue siendo ninguno**.

Y queda escrita la frontera con la limpieza del ancla: **no entra acá y no necesita
autorización de `C-01`**, porque actúa sobre la copia, que es salida del motor. `C-01` protege
la plantilla, y la plantilla no se limpia nunca. **Sin código.**

---

## Parte C — el RUNBOOK pasa a un solo sellado y un solo campo (2026-08-07) — commit de esta entrada

La sección *"Marcar y clasificar una lámina"* queda en **cinco pasos**: el sellado es uno solo
y hace las tres cosas juntas —tomar el siguiente id, escribir la fila, anexar el ancla—, y la
sección se declara en `LAMINAS`. El ancla tiene **un campo**, con el contador dicho: vive en la
hoja y es **uno solo para las dos plantillas**.

**El aviso de cabecera ahora cubre las tres cosas que no existen:** la función *Sellar
plantilla*, la hoja `LAMINAS` y la **función que limpia el ancla**. Esta última se nombra sin
nombre de menú definitivo: se decide al implementarla.

El bloque del deck generado pasa a describir el ciclo completo — conserva el ancla, el texto de
máquina **se ve mientras esté**, y una función a demanda lo limpia. **La consecuencia no
desaparece: queda en manos del usuario cuándo termina.** Y se agrega que retirar una lámina es
esconderla, no borrarla.

El `P3` sobre cuál `estado` se marca **se corrigió en el mismo commit**: apuntaba al "paso 6" y
la sección ahora tiene cinco. **Sin código.**

---

## Parte D — la tabla de fases queda con dos fases y un ítem nuevo (2026-08-07) — commit de esta entrada

`PLAN.md` §2 se tocó **una sola vez, con las dos fusiones juntas**: `2a` y `2b` se funden
porque el ancla tiene un campo, y las fases 2 y 3 se funden porque **el contador vive en la
hoja**. Quedan **Fase 2, las 26 celdas humanas, Fase 4 y Fase 5**. El número 3 no se reutiliza:
la numeración es histórica, como los `D-NN`.

**La Fase 2 ahora crea la hoja y sella en una operación:** por cada lámina sin ancla, toma el
siguiente id, escribe la fila y anexa el ancla. **No hay segundo sellado y el sellador no se
traba nunca** — el default-deny se mudó del sellador a la hoja.

**Entra `T-limpieza`**, escrito concreto porque `0.2` lo midió: la función **recibe una
corrida, no un archivo señalado a mano** —`CORRIDAS` tiene `deck_id` en sus 27 filas y
`verificarObjectIdDeCorrida_` ya hace el patrón entero—. **Lo que sigue sin definirse y se
dice:** cómo se elige cuál corrida cuando hay varias.

La tabla que quedó dentro del texto de `D-23` **no se tocó**: un addendum corrige, no reescribe.
**Sin código.**

---

## `R-17` — el temario selecciona, y la contradicción se cierra (2026-08-07) — commit de esta entrada

Parte A del `_10` con los seis ajustes del `10.1`. **Tres niveles, en orden:** el temario
selecciona con `mostrar` + `orden` y **busca en toda la base, sin filtro de ventana**; los
filtros de `R-15` **acotan lo que el temario ya eligió**; y **la semana es el fallback**, que
decide sólo cuando no hay temario. Esa última frase es la que faltaba y la que generó la
contradicción.

**`R-16` no se corrigió al pie: recibió un addendum fechado**, porque la Parte 0 encontró la
versión perdedora **en el título** y una `R-NN` no se edita. La división quedó escrita en las
dos puntas: **queda vivo el criterio de solape** —está medido, IVR dejó de dar cero— y caen *"el
default es la semana"* y la cláusula de filtros *"sobre los días activos dentro de la semana"*.

**Esa cláusula es el hallazgo que más cambió el prompt**: acotaba los filtros del nivel 2 a la
ventana, que es la versión perdedora entrando por la puerta de atrás. El prompt original no la
anticipaba.

**Y un ajuste al revés:** el prompt pedía escribir los tres filtros con su valor exacto porque
`0.4` los daba por probablemente no escritos. **Están desde el 04/08 en `R-15`**, medidos y
re-verificados, así que `R-17` **apunta y no copia** — un valor duplicado es un valor que se
desincroniza.

**Ningún número se movió, y está verificado por qué:** el motor **ya hacía** lo que `R-17`
fija. `itemsDeSeccion_` filtra `CAMPANAS` por `informe_id`, `mostrar` y `periodo_id`, sin
consultar la ventana, y las dos llamadas a `entraPorSolape_` están las dos del lado de los
agregados. `CAMPANAS` además tiene tres filas, todas de `secco` y con `periodo_id` vacío.

`CONFIG_INFORMES.md` §1.1 pasa a apuntar y conserva su decisión editorial y el caso testigo;
`PLAN.md` deja de pedir *"las campañas del período"* y pide el temario. **Sin código.**

---

## El universo de la lámina 5: `rdv` contaba doce figuras (2026-08-07) — commit de esta entrada

Partes A a D del `_13` con los siete ajustes del `13.1`. **La lámina 5 del informe `jm` estaba
publicando los encuentros del gabinete entero.** En la ventana 24–30/07 `rdv/RVD JM-CM - ES`
tiene **15 filas de 12 figuras distintas** y sólo **4 son de Jorge Macri**.

**`R-15` gana su `Addendum 1`**: `rdv` es el quinto canal y su señal es la columna `A`,
`Figura` — `JM` es `Jorge Macri` literal, `GCBA` por resta. **Es lo que la propia `R-15` ya
mandaba hacer** —*"si aparece un canal nuevo, no se le hereda el criterio de otro: se pregunta
cuál es su señal"*—; `rdv` no era un canal nuevo, era uno cuya señal **nunca se preguntó**.

**El mecanismo es `MARCADORES.filtro`**, seis celdas con `figura=Jorge Macri`. **`SECCIONES.filtro`
se descartó por lo que haría mañana, no por lo que hace hoy**: `ecv_alcance_semanal` declara
`informes = JM,SECCO` y hoy `SECCO` no tiene ningún marcador sobre `rdv`, así que el filtro le
caería sin efecto visible. Un filtro que no molesta hoy y rompe callado en tres meses es peor
que uno que falla ahora.

**Verificado por el camino del motor** (`resolverMarcadores('jm')`, no recalculando a mano), y
los seis dan la columna correcta, todos `estado: ok`:

| marcador | antes | ahora |
|---|---|---|
| `ecv_encuentros` | 15 | **4** |
| `ecv_insc_mail_pct` | 59.9 | **50.7** |
| `ecv_insc_cc_pct` | 8.1 | **11.8** |
| `ecv_insc_ivr_pct` | 1.3 | **1.9** |
| `ecv_insc_digital_pct` | 29.3 | **35.7** |
| `ecv_insc_dif_pct` | 2.1 | **0** |

La traza lo dice: *"filtro `figura=Jorge Macri` sobre "Figura" (col A) → 4 de 15 fila(s)"*.
**`SECCO` no se movió** y no podía moverse: el filtro vive por fila de `MARCADORES` y las seis
son `informe_id = jm`.

**Tres porcentajes suben, y está escrito por qué**: `insc_cc` e `insc_ivr` tienen el mismo
numerador en las dos columnas —ese canal es 100 % de JM— y el denominador cae de 3344 a 2307.
**Filtrar no baja todo: redistribuye.** Y el `0` de `ecv_insc_dif_pct` volvió con `estado: ok`,
no `sin_datos`: **es un dato**, las 71 inscripciones diferidas son de otros ministros.

**Son seis marcadores, no ocho.** Los otros siete que la lámina necesita —`ecv_inscriptos`,
`ecv_asistentes` y los cinco numeradores— **no tienen fila en `MARCADORES`**. El deck publicaba
**seis números mal y siete huecos**, y queda escrito que **se cablean después del filtro, nunca
antes**: cableados antes nacen con el universo de doce figuras.

`CLAUDE.md` §4 gana la convención que faltaba: **un número correcto puede salir de las filas
equivocadas.** Los seis marcadores pasaron las cuatro verificaciones del proyecto —fila en
`MARCADORES`, `MAPEO` que resuelve, fuente con filas, formato correcto— y contaban doce figuras.
Ninguna verificación miraba el universo.

Y a `Preguntas al equipo`: **las 7 filas de `REUNIONES`, ¿son todas de JM o incluyen
ministros?** Sin columna `figura` no se puede saber desde la hoja, y la sección `encuentro` se
repite por esas filas.

---

## `R-18` — una lista `DISTINCT` publica el canon del catálogo (2026-08-07) — commit de esta entrada

El `_15`, que **supersede al `_12` y absorbe al `12.1`**. Los dos quedan en la carpeta sin
editar: el reporte de la Parte 0 del `_12` sigue valiendo. El `12.1` addendaba una reescritura
del `_12` que nunca llegó al repo — se detectó antes de la primera edición y se resolvió con un
prompt propio en vez de con otro addendum.

**El hallazgo que le dio forma a todo: el catálogo canónico ya existe.**
`catalogoBarriosDesdeBase_` lee la solapa `Comunas` de `rdv` —48 filas— y `parsearBarrio_` mapea
variantes al canon. **No había que construir la lista: había que apuntarle.**

`R-18` fija seis cosas para cualquier lista `DISTINCT`, no sólo barrios: clave normalizada **con
el límite escrito** —`normalizar_` no colapsa espacios internos, y no se crea un quinto
normalizador por un caso que hoy no existe—, **la forma publicada sale del catálogo y nunca de
la celda**, lo que no matchea va a **`REVISAR` y a faltantes** —nunca crudo, nunca en silencio—,
**la lista hereda el universo de su sección**, orden alfabético por reproducibilidad, y cero
filas a `sin_datos`.

**El punto 2 supersede a una decisión del mismo día** —*"se publica el valor tal como está en la
celda"*—, tomada sin saber que el catálogo existía. Queda escrita esa relación: **una decisión
que se movió porque apareció un dato no es una que estaba mal.**

**El cuarto punto es el que más importa y por qué:** una lista larga se lee como riqueza de
datos, no como un universo mal recortado. Medido: **sin filtro 11 barrios, con filtro 4**. Es el
error de la lámina 5 y ésta es la operación con más chances de repetirlo.

`S-04` registra lo que autoriza que las 11 variantes vivan en `Parseo.gs`: **el catálogo y sus
variantes son estables**. Su síntoma es visible por diseño — un barrio que desaparece de la
lista porque `parsearBarrio_` no lo matchea.

**La corrección que más vale del `P2` cerrado:** la frase que decía que `R-10` empujaba en
contra era **falsa**, y queda escrito **por qué se creyó que había conflicto** — se leyó
*"preservando mayúsculas y acentos"* como una doctrina general cuando es la política de un
problema puntual. **Una regla que resuelve un problema no declara una doctrina.**

**Dos hallazgos anotados y no arreglados.** El camino al catálogo está hardcodeado en el
llamador: `catalogoBarriosDesdeBase_` es agnóstica pero `Union.gs` le pasa `'rdv'` literal y la
constante `HOJA_COMUNAS_RDV_`. **Y uno duro para quien implemente:** un marcador **no alcanza
`Comunas`** por el camino normal — está en `SOLAPAS` como `referencia` y `buscarMapeo` devuelve
`«FALTA:barrio@solapa_no_fuente»`. La operación tendrá que llamar a la función, no declarar el
catálogo en `MAPEO`.

**La implementación no es cableado: es lámina nueva.** Los cuatro tokens son celdas de una misma
tabla, `D-22` aplica y no hay desborde. **La plantilla no se tocó. Sin código.**

---

## Cinco respuestas del usuario, a sus dueños (2026-08-07) — commit de esta entrada

El `_18`, primera corrida de la noche. **Cinco decisiones que ya estaban tomadas y no estaban en
ningún documento.** Ninguna abre trabajo: las cinco cierran algo declarado abierto.

**`R-18` gana su `Addendum 1`: los estados son cuatro, no dos.** Faltaban **la celda vacía**
—que **no es un no-match**: no dispara `REVISAR` y se cuenta en la traza— y **todas las filas
rechazadas**, que es `REVISAR` y **nunca `sin_datos``**. El motivo queda escrito: `sin_datos`
**afirma que no había nada**, y si había y se descartó es una afirmación que el motor no midió.

**`ecv_barrio1-3` dejan de ser `[MANUAL]`.** Salen de la misma lista que `ecv_barrios`. La `[?]`
del 05/08 ofrecía dos opciones —ranking automático o carga manual— y **la respuesta era una
tercera: el filtro**. Queda anotado que son **tres ranuras para cuatro barrios medidos**, que es
plantilla y no motor.

**`REUNIONES` es JM**, y la pregunta al equipo que abrió el `_13` se cierra el mismo día. **Pero
se sostiene por curaduría, no por control:** la hoja no tiene columna `figura`, así que el motor
no puede verificarlo ni notar si deja de ser cierto. **Es la diferencia entre un supuesto
sostenido y uno verificado**, y por eso va escrita al lado de la respuesta.

**`camp_bench_*` pasa a fuera de alcance con fecha** — que no es resuelta ni abierta. Una
pregunta abierta vuelve a levantarse en cada revisión; ésta **no se vuelve a levantar**.

**Una campaña que cruza dos semanas se muestra acumulada**, porque así está la base. **Cambia el
número, no la presentación**, y queda dicho: el valor publicado es el acumulado de la campaña,
no lo que pasó dentro de la ventana.

**Sin código.**

---

## La operación `LISTA` y `ecv_barrios` cableado (2026-08-08) — commit de esta entrada

El `_16`, segunda corrida de la noche. **La lámina 5 publica los barrios:**
`Barrios impactados: Belgrano, Caballito, Retiro, Villa Urquiza`, verificado en el deck de la
corrida `jm-20260808-012643`.

**`LISTA` es la séptima operación y es genérica.** El catálogo y el separador **no viven adentro
de la función**: llegan por `ctx`, y el despachador los arma leyendo dos columnas nuevas de
`MARCADORES` —`catalogo` (forma `base/solapa`) y `separador` (vacío = `", "`)—, que entraron por
`COLUMNAS_DELTA_`. Una operación con `rdv/Comunas` adentro sirve para un token y para ninguno
más, y `R-18` vale para cualquier categoría.

**El catálogo lo resuelve `Generador.gs`, no `Marcadores.gs`:** leer una hoja es acceso a datos,
no aritmética. Y **catálogo vacío es `error`, no rechazo masivo** — `catalogoBarriosDesdeBase_`
devuelve lista vacía con motivo cuando la hoja no abre, y sin esa guarda un fallo de acceso se
leería como *"todos los barrios están mal escritos"*.

**Los rechazados viajan fuera de la traza, a propósito.** El despachador necesita **la lista**,
no el texto: con ella emite una fila de `FALTANTES` **aunque el token haya publicado bien el
resto**. Sin eso, una lista que publica cuatro de cinco se ve idéntica a una que publica los
cinco, y el barrio que falta no lo reclama nadie.

**La prueba negativa pasó en siete casos**, que es lo que hace que la operación esté probada y
no sólo corrida: un valor fuera del catálogo queda afuera y en `rechazados`; **las celdas vacías
no son rechazo** y se cuentan aparte; tres grafías de `Palermo` colapsan a una; las variantes
ortográficas que `normalizar_` no colapsa —`Villa Gral. Mitre`, `Nuñez`— **las matchea el
`resolver` y se publican con el canon** (`Núñez` con acento); todas rechazadas da vacío con los
dos valores listados; cero filas da vacío; y catálogo vacío tira.

**`C.3` pasó:** los seis marcadores del `_13` siguen dando lo mismo.

**Dos cosas quedaron anotadas en `PENDIENTES` y no se resolvieron acá.** `REVISAR` **no existe
como estado del motor** —`ok`, `sin_datos` y `error` son los tres que hay— así que si **todas**
las filas se rechazan el estado dice `sin_datos`, que es lo que el addendum de `R-18` prohíbe;
la traza y `FALTANTES` lo desmienten, pero el estado miente. Y **`CLAUDE.md` §7 no tiene fila
para "¿qué operaciones tiene el motor?"**: se anotó el candidato sin tocar el ruteo.

**El presupuesto de la corrida:** 39 tokens reemplazados contra 38 de la corrida anterior — el
que entró es `ecv_barrios`. `FALTANTES` bajó de 265 a **264**.

---

## Cómo se llena `CAMPANAS`, y por qué la Parte A no se ejecutó (2026-08-08) — commit de esta entrada

El `_17`, tercera corrida de la noche. **El instructivo está en `RUNBOOK.md`**, con las diez
columnas, un ejemplo real y los tres errores que dejan la fila muda. **`SOLAPAS` no se tocó** y
**ninguna solapa amaneció marcada `fuente` sin serlo.**

**La Parte A no se ejecutó, y el motivo es `R-02`.** Pedía pasar a `fuente` las dos solapas
`Buscador por periodo` para probarlas. La medición mostró que **son paneles, no tablas**: fila 1
rótulos, **fila 2 el período tipeado a mano**, fila 3 encabezados que son fórmulas de array, y
los datos generados por un `FILTER` contra esas celdas. Es literalmente el caso que `R-02`
excluye — *"lo que devuelva depende de lo último que tipeó una persona"*.

**Y no es hipotético: los dos paneles están hoy en `31/07 → 07/08` y el informe corre sobre
`24–30/07`.** Leerlos habría traído las campañas de otra semana **sin que ningún token
fallara**. Marcarlas `fuente` para probar no habría medido si sirven: habría medido si el motor
sabe leer un panel. **Se reportó en vez de ejecutarse**, que es lo que `CLAUDE.md` §4 pide
cuando un prompt derogaría una regla sin decirlo.

**Lo que sí sirve ya está a la vista:** las fórmulas de los paneles nombran sus fuentes reales
—`Seguimiento digital`, `Mail per`, `Alcance`, `CAMPAÑAS_DESGLOCE_DIGITAL`—. **El camino no es
leer el panel: es leer lo que el panel lee.**

**Tres hallazgos más, anotados y no arreglados.** `digital/Alcance` **es fuente, tiene 768 filas
y su `nombre_campaña` no está en `MAPEO`** — es la que engancha el nombre del temario con el id
de cuenta, y la columna trae **ñ**. `CAMPANAS.tipo` **diverge entre el seed y la hoja viva**
(`campana` contra `destacada`) y **nadie lo notó porque ningún consumidor lee esa columna**: el
día que alguien escriba `SECCIONES.filtro = tipo=…`, el que mire el seed va a poner el valor que
no entra. Y `PERIODOS` no cubre la semana del informe, lo cual **no molesta**: la ventana sale de
`CONFIG` y `periodo_id` sólo tiene que no estar vacío.

**Medido para el ejemplo del instructivo: 67 campañas** estuvieron activas en la ventana
24–30/07. **Sin código.**

---

## `_14` Parte 0 — los subagentes, medidos antes de escribirlos (2026-08-08) — commit de esta entrada

Cuarta y última corrida de la noche. **Sólo la Parte 0, como pidió el usuario. No se creó
ningún archivo de subagente.**

**El hallazgo que decide el diseño: un subagente NO ve el `CLAUDE.md` del proyecto.** Medido, no
supuesto: se lanzó uno con la instrucción de no usar herramientas y responder sólo con lo que
tuviera en contexto, y devolvió *"NO TENGO INSTRUCCIONES DE PROYECTO EN CONTEXTO"*. **Confirma
`AJ-2` en el sentido malo:** "incorporar las convenciones por referencia" **no funciona**, y el
archivo de cada subagente va a tener que decirle explícitamente qué abrir, con la ruta. Una
convención citada que el subagente no puede leer es una convención que no existe.

**`.claude/` tiene `settings.json` y `settings.local.json`, y no hay `agents/`** — nada que
pisar. **La versión instalada es `2.1.220`**, posterior a la `2.1.198`, así que **`/agents` ya
no crea nada**: los archivos se editan a mano y el runbook tiene que decirlo así.

**El camino de escritura de `MARCADORES` existe y está declarado** (`ESCRITORES.md`): son tres
—la plantilla vía el `Paso-2.5` que aún no corrió, `curarMarcadores_` para filas enteras y
`curarCamposMarcadores_` para un campo—. **El `cableador` tendría por dónde escribir sin
inventar un cuarto**, que era la condición de `B.3`.

**El tamaño de `T2.11`, medido sobre `FALTANTES` de la corrida de esta noche:** **264 filas**,
de las cuales **206 son "sin fila en `MARCADORES`"** —cableado puro— y **58 tienen fila y
fallan por datos**. Los diez primeros son nueve `ecv_*` del encuentro de San Cristóbal sin
cablear más un `enc_alcance` con la fuente en cero.

**Y esos nueve son justo los que el `_13` dejó bloqueados hasta que existiera el filtro por
figura.** El filtro existe desde hoy, así que **el bloqueo se levantó**.

**`CLAUDE.md` §7 no tiene fila para la configuración de herramientas** —ni para `.claude/`, ni
para los subagentes, ni para las operaciones del motor—. Es la misma pregunta sin dueño que ya
se anotó al agregar `LISTA`. **No se tocó §7:** cambiar el ruteo es decisión del usuario.

---

## `REVISAR` y los dos dueños de `§7` (2026-08-08) — commit de esta entrada

El `_2` del 08. **Cierra una regla escrita que el código no cumplía**, que es distinto de una
mejora pendiente: `R-18` addendum 1 dice que si todas las filas de una lista se rechazan el
estado es `REVISAR` y **nunca `sin_datos`**, y el motor decía `sin_datos`. No se disparaba
porque los cuatro barrios matchean — **se arregló antes de que un dato lo despertara**.

**`0.3` era la única parada y no se disparó.** Los dos puntos que pintan preguntan
`estado === 'ok'` y **todo lo demás cae al mismo camino**: publica `«FALTA:token»` y deja su
fila en `FALTANTES` con el estado en el motivo. Así que un estado nuevo **no rompe el pintado**
y `REVISAR` hereda el precedente en vez de inventar una forma. **Se verificó antes de escribir
código**, que es lo que la pregunta buscaba.

**El corte es "vacío Y hubo rechazos", no "hubo rechazos".** Una lista que publica tres de cinco
**sí resolvió** y sigue `ok`; sus dos rechazados ya viajaban a `FALTANTES` desde ayer. Lo que
`REVISAR` marca es el caso en que el token **no pudo decir nada teniendo datos que decir**.

**Entra al resumen de la corrida** (`revisar`), no sólo a la traza: un estado que no se cuenta
es un estado que nadie mira.

**Las dos pruebas de `A.3` pasaron en la misma corrida**, con filas temporales borradas al
terminar: todas rechazadas → `REVISAR` con 4 rechazados; cero filas → `sin_datos`. **Y las siete
positivas de ayer siguen dando lo mismo** (`A.4`), que es justo cuando se rompen sin que nadie
mire.

> **Un desvío que vale anotar:** el primer intento de `A.3` dio `error` en vez de `REVISAR`, y
> **no era del código**: la prueba apuntaba a `nombre`, que no está en `MAPEO` para esa solapa.
> El instrumento falló, no lo medido. Se corrigió a `figura` —mapeado, y sus valores nunca
> matchean el catálogo de barrios— y pasó.

**`CLAUDE.md` §7 ganó dos filas** y con eso se cierran los dos pendientes que la corrida
nocturna abrió: *"¿Qué operaciones tiene el motor?"* → **`OPERACIONES_`**, y *"¿Cómo está
configurada la herramienta?"* → **`.claude/`**. Las dos siguen el criterio que ya usaba la fila
del inventario: **el código es la fuente, no un `.md` que se desincroniza.**

---

## Los dos subagentes: `verificador` y `cableador` (2026-08-08) — commit de esta entrada

El `_14` con los cuatro ajustes del `14.1`. **Los dos archivos existen en `.claude/agents/`.
Ninguno corrió todavía** — hacen falta reiniciar la sesión para que se carguen.

**`0.3` reescribió el diseño, y para peor.** Un subagente **no ve el `CLAUDE.md` del proyecto**,
así que *"citar las convenciones por referencia"* **no existía como opción**. Los dos archivos
arrancan con la lista de qué abrir **con la ruta**, y esa lectura es su primer paso.

**Y los dos nombran el modo de falla propio de la herramienta**, que es lo que pidió el
addendum: un subagente que se saltea esa lectura **no está operando con las reglas del proyecto
aunque lo parezca** — produce trabajo con forma correcta y fundamento inventado, y el formato
engaña.

**El `verificador` es sólo lectura, y la garantía es el frontmatter**, no el texto: su lista de
`tools` no incluye `Write` ni `Edit`. Lleva adentro la pregunta que costó un día —*¿de qué filas
sale este número?*— con el caso de la lámina 5 al lado: pasó las cuatro verificaciones que
existían y contaba doce figuras. Y dice, adentro, que **su reporte no es luz verde**.

**El `cableador` nació sin el bloqueo**: el universo de figura cerró anoche. En su lugar lleva
la regla que lo reemplaza y que es permanente — **todo token que lea `rdv` nace con su filtro
declarado**—, más el chequeo previo de que el campo del filtro esté en `MAPEO`, que es lo que
evita escribir varias filas rotas de una pasada.

**Su primer lote son los nueve `ecv_*` de la lámina 5, y no por orden de lista:** completan una
lámina entera —hoy publica porcentajes sin sus numeradores— y **comparten universo**, así que un
error de criterio se ve en los nueve juntos.

`CLAUDE.md` §4 gana la convención: **todo prompt declara qué subagente usa o dice que ninguno**,
y sin esa línea no se invoca ninguno. El `RUNBOOK` gana la sección con los tres hechos operativos
—se cargan al arranque, `/agents` ya no crea nada en la `2.1.220`, y no ven el `CLAUDE.md`— y el
aviso de costo: **no reparten consumo entre cuentas**.

`C.1` no hizo falta: la fila de §7 para la configuración de la herramienta **ya había entrado**
con el `_2` de hoy, y cubre `.claude/` entero. **Sin código del motor.**

---

## Los siete `ecv_*` de la lámina 5, cableados (2026-08-08) — commit de esta entrada

El `_3` con los ajustes del `3.1`. **La lámina 5 dejó de publicar porcentajes sin sus
numeradores.** Corrida `jm-20260808-151951`: **75 tokens reemplazados** (eran 39) y `FALTANTES`
**228** (eran 264).

```
Mail: 1169(50.7%)  Digital: 823(35.7%)  Call Center: 272(11.8%)  IVR: 43(1.9%)
INSCRIPTOS: 2307   ASISTENTES: 488   ENCUENTROS: 4
Barrios impactados: Belgrano, Caballito, Retiro, Villa Urquiza
```

**Los siete valores coinciden con los medidos ANTES de cablear**, que era el punto de `0.5`: un
valor calculado después de cablear no verifica nada. **Los cinco `_pct` no se movieron** y
`ecv_encuentros` y `ecv_barrios` tampoco.

**✅ `C.2` cierra exacto: `1169 + 272 + 43 + 823 + 0 = 2307`, contra `ecv_inscriptos = 2307`.
Diferencia cero.** Es la prueba que ningún token pasa solo, y `ecv_insc_dif` se trató como cero
**diciéndolo**, no escondiéndolo.

**Las siete filas nacieron con `filtro = figura=Jorge Macri`**, que es la regla permanente que
reemplazó al bloqueo del `cableador`. Y **el campo del filtro se verificó en `MAPEO` antes de
escribir la primera celda** — sin eso, siete filas rotas de una pasada.

**Dos cosas quedaron afuera del lote y anotadas:**

**`ecv_barrio1-3` no se cablearon**, por dos razones independientes y medidas: `opLISTA` **no
tiene parámetro de índice**, y **no puede haber `MAPEO` para ellos** porque no son columnas sino
**posiciones dentro de un resultado**. La decisión del `_18` de que salen de la misma lista **es
correcta y hoy no es ejecutable** — son dos cosas distintas. **No se inventó una operación para
llegar a diez.**

**`ecv_insc_dif` publica `«FALTA»` donde el `13.1` decidió que debe publicar cero.** Las cuatro
celdas están **vacías**, no en cero, así que `SUMA` hace lo que está escrito que haga. **Se
cableó igual y la contradicción quedó escrita con las dos puntas**, más el criterio candidato que
la resolvería. No se tocó `SUMA`: eso mueve marcadores en todo el deck.

> **Y una corrección de conteo, con su causa, porque la causa vuelve:** el lote no era de nueve
> sino de **diez** —siete cableables más los tres barrios—. El nueve salió de contar tokens en
> `FALTANTES`, que **lista por ítem y no por token**: los `@San Cristóbal (pre)` son de la lámina
> 6. **Trampa de lectura del instrumento, no error de suma**, y ya está en `CLAUDE.md` §4.

**El `verificador` no corrió**: los archivos están escritos y commiteados, pero los agentes se
cargan al arranque y la sesión no se reinició. **No bloqueó nada** — su reporte no habilita la
ejecución.

---

## `R-19` y las fuentes reales de una campaña (2026-08-08) — commit de esta entrada

Dos cosas en la misma corrida: la guarda del espejo y la Parte A del `_4`.

**`R-19` — una fuente que dejó de traer no es un dato, es una falla.** Es el mismo principio que
`«FALTA»` antes que un número plausible, **aplicado a la lectura en vez de a la publicación**.

**Lo medido, que es lo que la hace necesaria:** un `IMPORTRANGE` roto **no tira, no vacía la
hoja y no devuelve un error** — deja **una fila** con el **string** `"#REF!"`. Sin guarda:
encabezado `#REF!` → cero filas → `sin_datos` → `«FALTA»` → **nada falla**. Un permiso revocado
del otro lado se veía igual que una semana sin campañas.

**Tres capas.** Centinelas **en `CONFIG`**, no en el código, porque son valores que cambian sin
que cambie la lógica; **el motivo nombra la solapa y el centinela**, no dice "error de lectura".
Cero filas en una solapa `fuente` — **verificado antes de activarla: las 19 traen datos hoy**,
así que ninguna se vuelve falla. Y `SOLAPAS.filas_minimas` **creada vacía en las 84 filas**:
vacío es **sin chequeo**, y el piso lo fija una persona editando la celda, **sin tocar código**.
Esa es la diferencia entre implementarla ahora y dejarla para después.

**La Parte A del `_4`: la cadena de una campaña queda escrita.** El identificador es
`ID Cuentas` y **cruza** —91 % con `Alcance`, 99,7 % con el desglose—, así que no hay nada que
elegir. Y **el criterio del equipo coincide con las reglas del proyecto**: los paneles
seleccionan por **solape** del lado digital y **por punto** del lado directa, que es exactamente
`R-16`/`R-17` escritas por separado.

**El veto de los tres paneles quedó contado con su motivo**, incluido el que apareció ayer:
**`Mail per` es un tercer panel**, un nivel más abajo — el de directa **lee de otro panel**.

**Catorce `camp_*` sin fuente, y son tres preguntas distintas**, no una lista: once
`camp_resp_*` **sin dato en ninguna base** (pregunta al equipo), seis de granularidad —y acá se
midió la hipótesis: **la plataforma NO es la posición**, el 85 % de las campañas tiene una sola
y el vocabulario son siete canales— y trece del lado mail, que **tienen fuente pero es un
panel**. Distinguirlas cambia quién las resuelve.

**Cuatro respuestas del usuario, aplicadas:** `ecv_barrio1-3` pasa a **postergado por decisión,
no bloqueado**; los seis de granularidad quedan marcados sin insistir; los tres
`camp_*_insight` se declaran **`[MANUAL]`** y salen del cableado pendiente; y queda escrito que
**ninguna campaña de `jm` se solapa con la semana** —lo cual **no impide que entren**, es lo que
dice `R-17`— con la causa a mirar primero si una fila no emite: `periodo_id` o `mostrar`.

---

## El cargador de temario de campañas (2026-08-08) — commit de esta entrada

El `_5` con los cinco ajustes del `5.1`. **Cargar el temario de campañas deja de ser trabajo
manual**, y lo que no se puede resolver **queda marcado en vez de adivinado**.

**Dos apartamientos del patrón de reuniones, los dos conscientes y escritos.** El parser es
propio porque el de reuniones **exige `|`** y ninguna línea de campañas lo tiene — compartirlo
habría dejado el 100 % del bloque sin parsear. Y **no hace `append` ciego**: el de reuniones
duplica todo al recargar; éste saltea lo que ya existe.

**Lo que sí se heredó:** el paréntesis final va a `notas`. Ya estaba resuelto y es justo el
mecanismo que las condicionales necesitaban.

**Ante la duda la campaña entra** (`AJ-1`, que supersede al `A.2` del prompt): `mostrar = sí` y
el paréntesis a `notas`, **sin interpretarlo**. Los dos errores no cuestan lo mismo — una campaña
que no salió no tiene filas en la base y sus tokens son **huecos visibles**; una excluida de más
es **una lámina que nadie sabe que falta**.

**El umbral se midió contra el temario real, y el resultado justifica el diseño:**

| temario | mejor candidato | margen | decisión |
|---|---|---|---|
| Egreso de cadetes | **100 %** `3305` "Egreso más de 1000 Cadetes" | 50 % | **resuelve** |
| Desalojo 900 | **100 %** `3441` "Desalojo N° 900" | 50 % | **resuelve** |
| Operativo de saturación en 1-11-14 | **tres al 100 %** | **0 %** | **pregunta** |
| Video de obras de salud | dos al 67 % | 0 % | **pregunta** |

**El margen evitó un error concreto, no hipotético:** sin él, *"Operativo de saturación"* habría
resuelto a `2979-MAYSEGCG` —*"ALTA INTERNA CONTENIDO ADICIONAL"*—, que es **otra campaña**, sólo
por estar primera. Dos de cuatro resueltos y dos preguntando es **el resultado correcto**.

**La solapa `CAMPANAS_equivalencias` es la primera de la planilla**, y sigue la forma del
precedente `PERSONAS_equivalencias.csv`. **La escribe una persona; el cargador la lee y nunca la
inventa** — una resolución por similitud **jamás entra sola ahí**: es una hipótesis buena, y una
fila de equivalencias es una afirmación que se repite cada semana sin que nadie la revise.

**Y quedó anotado el segundo enganche, que no es éste:** *reunión → sus campañas, pre y post*.
Son dos problemas que comparten la palabra "campaña" — uno busca **una campaña que el temario
nombra**, el otro **las campañas que pertenecen a un encuentro**. `REUNIONES` ya tiene `etapa`;
lo que falta es con qué se engancha. **No se diseñó nada para él ni se adaptó la solapa.**

---

## La Parte 0 del `_6` — la etapa de una campaña, medida (2026-08-09)

Corrida del prompt `docs/Prompts/2026-08-08_6_etapa_de_campana.md`, **sólo Parte 0**. Ningún `.gs`
tocado. **Lectura de las hojas vivas el 09/08/2026 entre las 01:29 y las 01:30**, re-corrida sobre
la medición original del 09/08 a las 02:20 — los números dieron idénticos en las dos pasadas.

**Cómo se midió, porque importa para volver a citarlo.** `tools/api.js` contra la API del motor
(`registros`, `llamar fn=leerFuente / resolverVentana / resumenAnclaje_ / buscarMapeo /
parsearFiltro_ / contarLecturaBase_`) y `tools/snapshot.js` volcado al scratchpad. Las claves de
join salen del **`MAPEO` vivo**, no de la primera columna ni del seed. Las solapas con
`uso = 'ignorar'` no se leyeron (`CLAUDE.md` §2), `digital/RDV` incluida.

### El caso real: `2033-SEPEPHGC`

No son dos filas: **son 35**. Las dos que vio el usuario —`ID MailUp` 26770 y 26771, del 05/08—
son las dos últimas; las otras 33 son la misma campaña de poda a lo largo de 2026, con cadencia
pre/post semanal. Suman **99.218 enviados** y **ninguno llega al motor**.

**Está en** `digital/Cuentas` (1 fila), `digital/Directa Mail` (35), `m2/Directa mail` (35,
espejo), `m2/M2 periodo DIRECTA` (1, vista), `digital/Buscador por periodo directa` (1, vista).
**No está en `Seguimiento digital`**, medido sobre las 979 filas de la maestra con la clave
`sd_id_cuenta` → columna `A`. Las 35 filas caen enteras en `huerfanasEnCanal` (`Union.gs:176-178`)
y se descartan. **Modo de falla A confirmado, no supuesto.**

### Tabla 1 — huérfanas por canal (modo A)

| solapa | filas | ids huérfanos | filas descartadas | % del canal |
|---|---|---|---|---|
| Digital | 1297 | 842 | **922** | **71,1 %** |
| Directa Mail | 2162 | 292 | **631** | **29,2 %** |
| Directa SMS | 48 | 8 | 9 | 18,8 % |
| Directa IVR | 58 | 0 | 0 | 0 % |
| Alcance | 768 | 1 | 5 | 0,7 % |

Los mayores de mail: `1942-SEPEPHGC`×54, `1946-SEPEPHGC`×43, `2033-SEPEPHGC`×35,
`1943-SEPEPHGC`×32, `1921-SEPAMBGC`×30.

### Tabla 2 — cruce `Eje` × huérfana, sobre `digital/Directa Mail`

| eje | huérfanas: filas / ids / enviados | con maestra: filas / ids / enviados |
|---|---|---|
| **M2** | **429 / 137 / 5.111.516** | 170 / 50 / 19.265.429 |
| Cercanía | 102 / 81 / 5.431.618 | 914 / 303 / 19.317.516 |
| Cuidado | 37 / 31 / 927.443 | 141 / 69 / 13.213.352 |
| Movilidad | 24 / 15 / 1.415.136 | 119 / 90 / 11.831.875 |
| Ciudad Atractiva | 21 / 18 / 315.993 | 163 / 66 / 16.214.203 |
| Reforma del Estado | 9 / 3 / 983.183 | 24 / 6 / 3.853.508 |
| Otros | 6 / 5 / 3.378 | — |
| Cuidado y Bien Público | 2 / 1 / 348 | — |
| Revisar | 1 / 1 / 96.692 | — |

**El 71,6 % de las filas M2 de mail son huérfanas.** El enganche que falta no es un caso raro: es
el modo normal de M2.

### Tabla 3 — dónde vive la marca de etapa, y con qué vocabulario

| solapa | col | mapeada | celdas con marca | vocabulario exacto |
|---|---|---|---|---|
| `Directa Mail` | **`I` Tipo de mail** | **sí, `mail_tipo`** | 265 / 1652 | `M2 \| Pre`, `M2 \| Post`, `M2 \| Durante` — **cerrado, 3 valores** |
| `Directa Mail` | `H` Nombre campaña \| Directa | sí, `mail_campana` | **24 / 2162 (1,1 %)** | `Pre`×4 `PRE`×1 `pre`×3 `Post`×4 `POST`×3 `post`×4 `Durante`×5 |
| `Directa Mail` | `K` Nomenclatura | **no** | 415 / 2151 | `PRE`×42 `Pre`×10 `POST`×120 `Post`×215 `post`×22 `Durante`×5 `durante`×1 |
| `Seguimiento digital` | `B` / `C` | sí | 18 / 835 y 91 / 840 | `Post`×79, `Durante`+`durante`×12, `POST`×2 |
| `Digital` | `A` | sí, `dig_campana` | 41 / 960 | `Post`×38, `Durante`+`durante`×2 |
| `Directa SMS` | — | — | **0** | ninguna columna trae marca |
| `Directa IVR` | — | — | **0** | ninguna columna trae marca |

**`durante` existe en los datos**, escrito, con vocabulario propio: **`M2 | Durante`, 22 filas**.
No hay que inventarla.

**`I` mezcla dos vocabularios en un solo campo lógico** — nueve valores: `M2` 453,
`Convocatoria` 349, `Agradecimiento` 301, `Confirmación` 260, `M2 | Post` 162, `M2 | Pre` 70,
`M2 | Durante` 33, `Cancelación` 15, `Reprogramación` 9. **La nota del `MAPEO` vivo está vencida**:
dice *"Convocatoria / Confirmación / Agradecimiento"* y la columna tiene nueve valores, cuatro de
ellos M2.

**Y el agujero que importa:** sobre las 599 filas con `Eje = M2`, **349 (58,3 %) no declaran
etapa** — 203 dicen `M2` pelado y 138 tienen `I` vacía. Las dos filas del caso del usuario
(26770/26771) **tienen `Tipo de mail` vacío**: la columna que resuelve el problema está en blanco
justo en las filas nuevas.

### Tabla 4 — las columnas de `Directa Mail` sin mapear

| col | nombre real | llenas | distintos | qué es |
|---|---|---|---|---|
| `B` | `ID MailUp` | 2150/2162 | 2136 | id del envío. **No es clave única**: 12 vacías, ~14 repetidos |
| `K` | `Nomenclatura` | 2151 | 2140 | nombre de pieza; mayor cobertura de etapa, vocabulario abierto |
| `U` | `Nombre campaña \| Cuentas` | 2162 | 874 | nombre, no clasificación |
| `V` | `Tag Orion Mail` | 787 | 110 | etiqueta, cobertura parcial |
| `W` | `Proyecto` | 1867 | 87 | `ECVs Jorge Macri`, `Más servicios en tu barrio`… |
| **`X`** | **`Eje`** | **2162/2162** | **9** | `Cercanía` 1016, `M2` 599, `Ciudad Atractiva` 184, `Cuidado` 178, `Movilidad` 143, `Reforma del Estado` 33, `Otros` 6, `Cuidado y Bien Público` 2, `Revisar` 1 |
| `Y` | `ERROR` | 20 | 3 | `ERROR ID`×18, `ERROR FECHA`×1, `ERROR API`×1 |

**`X` `Eje` es la vía para decir a qué sección pertenece una fila de mail**: cobertura 100 %,
cardinalidad 9. No es `U`–`X` como conjunto — es `X` sola. Dos advertencias: tiene un valor
`Revisar` (1 fila), así que el vocabulario no está del todo cerrado; y **`Eje = M2` (599) no
coincide con las filas cuyo `Tipo de mail` empieza con `M2` (718)**. Dos señales de M2 que no
empatan; hay que elegir cuál manda.

### Tabla 5 — ids con más de una fila (modo B)

**Maestra `Seguimiento digital`:** 979 filas leídas, 840 con clave, **763 ids distintos**.
**76 ids con más de una fila → 77 filas de maestra desaparecen** por la asignación de
`Union.gs:143`, sin quedar en ningún diagnóstico.

| solapa | ids con >1 fila | filas amontonadas sin marca de etapa |
|---|---|---|
| **Directa Mail** | **421** | **1368** |
| Alcance | 66 | 133 |
| Directa IVR | 10 | 20 |
| Directa SMS | 4 | 15 |
| Digital | 2 | 5 |

### El anclaje, re-medido

`resumenAnclaje_`, ventana `2026-07-24 → 2026-07-30` (origen `config`), umbral 0.6, 67,8 s:
**anclados 5 · sin_link 0 · baja_confianza 0**. San Cristóbal → `3354-JULJDGAG` (1.00), Retiro →
`3346-JULJDGAG` (1.00), Orden Público → `3387-JULJDGGC` (1.00), y las dos repeticiones post.

**Cero por `ambiguo` — y `ambiguo` no existe como bucket**: los homónimos sin desempate van a
`sinLink` con el campo `motivoAmbiguo` (`Union.gs:773-778`). El `_6` pedía contar un bucket que no
está.

### De cuánto es el error

**Para la poda, el error es total, no parcial.** `2033-SEPEPHGC` es huérfano ⇒
`filasDigitalDeEncuentro` devuelve `null` ⇒ no publica nada. Los 6.041 de la pre y los 4.008 de la
post **no se mezclan: no llegan**, y con ellos los otros 89.169 enviados.

**El caso que sí publica** — `3387-JULJDGGC` (Orden Público), 5 filas de mail: `Convocatoria`
201.515 (22/07) + 25.560 (22/07) + 44.043 (25/07), `Confirmación` 583 (27/07), `Agradecimiento`
582 (**03/08**). Suma cruda **272.283**; hoy publica **44.043**, porque `MARCADORES` ya lleva
`filtro = mail_tipo=Convocatoria` con `operacion = ULTIMO`. **El corte por `mail_tipo` ya existe y
funciona** — para el vocabulario de encuentro.

**El caso M2 con maestra** — `2145-OCTVINGC` en `digital/Directa Mail`: 24 filas, suma 528.825,
desglose `M2` 159.127 + `M2 | Post` 369.698, ninguna `M2 | Pre`. **Hoy no publica nada tampoco**:
no hay un solo marcador de familia `m2_` en `MARCADORES`.

### Un hecho que habilita la Parte A sin tocar código

`parsearFiltro_("mail_tipo=M2 | Post")` devuelve `{campo:"mail_tipo", valor:"M2 | Post"}` — **el
`|` no rompe el parser**, que parte por `=` (`Generador.gs:357-372`). Y
`buscarMapeo("digital","Directa Mail","mail_tipo")` → columna `I`. **Filtrar por etapa se puede
escribir hoy en `MARCADORES`, sin tocar `.gs`**, para el 42 % de filas M2 que la declaran. El
límite real es que `parsearFiltro_` acepta un solo `campo=valor`, sin OR.

### Addendum fechado (09/08/2026) — una premisa de esta bitácora es falsa

La entrada del 07/08 dice, sobre la lámina 6: *"las cuentas `3354-JULJDGAG` y `3346-JULJDGAG` no
tienen filas en las solapas de canal **para esta ventana**, y `3387-JULJDGGC` sí"*. **La ventana no
interviene.** `BASES.digital.modo_periodo = 'snapshot'` (`Instalar.gs:842`) y `leerFuente` ignora
la ventana para `digital` (`Union.gs:61-67`): el recorte lo hace el anclaje vía el link
campaña↔encuentro, no una ventana de fecha.

**El número era correcto y el porqué no.** Medido hoy, por canal:

| cuenta | maestra | Digital | Mail | SMS | IVR | Alcance |
|---|---|---|---|---|---|---|
| `3354-JULJDGAG` San Cristóbal | 2 filas | 0 | **0** | 0 | 0 | 1 |
| `3346-JULJDGAG` Retiro | 2 filas | 0 | **0** | 0 | 0 | 1 |
| `3387-JULJDGGC` Orden Público | 2 filas | 0 | 5 | 0 | 2 | 2 |

No tienen filas, sin más — en ninguna ventana. Y las tres tienen **2 filas en la maestra**, así que
a las tres las alcanza la pisada del modo B.

**El texto original no se edita** (append-only). La misma frase quedó copiada en
`docs/Prompts/2026-08-08_8_cerrar_laminas_1_a_6_jm.md` §"El alcance, medido" punto 3, que **está
sin ejecutar**: quien lo corra tiene que leer este addendum primero.

---

## `N2` — de qué base leen las láminas 2 y 3 de `JM` (2026-08-09)

Tarea `N2` de la corrida nocturna del `_9`. **Medición, sin cablear nada.** Lectura de
`MARCADORES` vivo el 09/08/2026 a las 01:47 vía `tools/snapshot.js` —que no pasa por ningún
`.gs`— y del `MAPEO` vivo vía la API.

### La respuesta corta: **ninguno lee de `looker`. `MARCADORES` no tiene una sola fila de `looker`.**

`MARCADORES` vivo: **51 filas de datos**, 14 columnas. (El `HANDOFF_CODE.md` decía 44 y el `_9`
decía 52 contando el encabezado — las dos citas estaban corridas.) Su reparto por base y solapa:

| filas | base / solapa |
|---|---|
| 14 | `digital / Directa Mail` |
| 14 | `rdv / RVD JM-CM - ES` |
| 9 | `digital / Directa IVR` |
| 6 | `digital / Digital` |
| 6 | `digital / Seguimiento digital` |
| 2 | `digital / Directa SMS` |
| **0** | **`looker` / cualquier solapa** |

Cero filas con `base_id` vacío.

### Los 40 tokens, uno por uno

**Lámina 2 (`JM`) — 13 de 21 tienen fila.** Las trece leen de `digital`: `frecuencia` e
`imp_total` de `Digital` (filtro `dig_jm_gcba=JM`); `ivr_at_pct`, `ivr_atendidos`,
`ivr_campanias`, `ivr_llamados` de `Directa IVR`; `mail_aperturas`, `mail_entregados`,
`mail_envios`, `mail_or` de `Directa Mail` (filtro `mail_remitente=jorge.macri@buenosaires.gob.ar`);
`pauta_google`, `pauta_meta`, `pauta_prog` de `Seguimiento digital`.

**Lámina 3 (`GCBA`) — 11 de 19 tienen fila**, todas de `digital`, con el mismo campo lógico y el
filtro negado (`dig_jm_gcba!=JM`, `mail_remitente!=jorge.macri@…`), más `gcba_sms_envios` y
`gcba_sms_entregados` de `Directa SMS`.

**Los 16 sin fila son los mismos ocho de cada lado:** `cc_base`, `cc_campanias`,
`cc_contact_pct`, `cc_contactados`, `contenidos_total`, `imp_google`, `imp_meta`, `imp_prog` — y
sus ocho gemelos `gcba_`.

### Qué significa para el `_8`

**La suposición del `_8` se sostiene: el trabajo es cablear, no destrabar `looker`.** El
razonamiento de `N2` («si leen de `looker`, el `_8` no sirve») partía de dos premisas y las dos
resultaron falsas: ninguno lee de `looker`, y `looker/resumen_metricas_dinamico` **es legible**
(ver el pendiente `P1` sobre `looker`).

⚠ **Pero una premisa del `_8` sí se cae, y hay que leerla antes de correrlo.** El `_8` afirma:
*"Ocho tokens de la lámina 2 ya los usa la 5, que publica bien: `mail_aperturas`, `mail_or`,
`mail_entregados`, `cc_base`, `cc_contactados`, `cc_contact_pct`, `ivr_atendidos`, `imp_total`."*

**Tres de esos ocho no tienen fila en `MARCADORES`**: `cc_base`, `cc_contactados` y
`cc_contact_pct`. No pueden estar publicando en ninguna lámina. Los otros cinco sí están.

Así que la cuenta del `_8` —*"trece tokens nuevos, no veintiuno"*— **da mal**: los que faltan en
la lámina 2 son **ocho**, y tres de ellos son justamente los `cc_*` que el `_8` daba por resueltos.

### De dónde saldrían los 16 — medido, no propuesto

**Los `imp_*` y `contenidos_total`: `digital/CAMPAÑAS_DESGLOCE_DIGITAL`.** Es `uso = fuente`,
4889 filas, legible hoy, y **no tiene una sola fila en `MAPEO`**. Tiene exactamente las dos
columnas que hacen falta — `F Plataforma` y `O Impresiones` — más el corte JM/GCBA en `T`:

| `Plataforma` (col `F`) | filas | impresiones |
|---|---|---|
| Meta | 1781 | 837.194.550 |
| DV360 | 1626 | 2.161.052.366 |
| Google ads | 1384 | 592.790.427 |
| TikTok | 55 | 24.571.433 |
| Mercado Libre | 21 | 11.775.499 |
| Twitter | 12 | 10.613.986 |
| Twitch | 5 | 1.605.948 |
| Uber | 5 | **0,58** ⚠ |

`JM | GCBA | POLICIA` (col `T`): `GCBA` 4759, `JM` 107, `Sin Tipo` 17, `LINDA` 6.

Mapeo evidente: `imp_meta` → `Plataforma=Meta`, `imp_google` → `Plataforma=Google ads`,
`imp_prog` → `Plataforma=DV360`. **Pero son tres decisiones del usuario, no de Code**: que
"programmatic" sea `DV360` es una lectura, no un hecho; y las otras cinco plataformas
(TikTok, Mercado Libre, Twitter, Twitch, Uber) **no tienen token** — hay que decir si van a
`imp_total` o quedan afuera. ⚠ Y `Uber` con **0,58 impresiones en 5 filas** es un dato sucio que
conviene mirar antes de sumarlo a nada.

**Los `cc_*`: `looker/resumen_metricas_dinamico`.** Tiene `cc_contactados` en la columna `T` y
`cc_efectivos` en la `U`, las dos mapeadas, y la solapa **es legible** (949 filas, 26 en la
ventana del informe). Es la **única** fuente de call center en las cuatro bases: ninguna solapa de
`digital` tiene datos de CC.

Pero **no alcanza para los cuatro tokens**: hay `cc_contactados` y `cc_efectivos`, y los tokens
piden `cc_base`, `cc_contactados`, `cc_contact_pct` y `cc_campanias`. **`cc_base` no existe en
ningún `MAPEO` de ninguna base.** Sin `cc_base` no sale `cc_contact_pct`, que es un cociente.

### Las preguntas que quedan para el usuario

1. **¿`cc_base` de dónde sale?** No está mapeada en ninguna base. ¿Es `cc_efectivos`? ¿Es una
   columna de `looker/CC` (1309 filas, `uso = fuente`, sin `MAPEO`)? ¿O no existe?
2. **¿`imp_prog` es `DV360`?** Y qué pasa con TikTok, Mercado Libre, Twitter, Twitch y Uber.
3. **¿`contenidos_total` es un `CONTEO` de `CAMPAÑAS_DESGLOCE_DIGITAL`** o la suma de los tres
   `pauta_*`, que ya están cableados sobre `Seguimiento digital`?
4. **Cablear los `cc_*` sobre `looker` sería la primera fila de `looker` en `MARCADORES`.** Hoy
   son 51 filas y ninguna. No es un impedimento, pero conviene saberlo antes.

---

## `N3` — `looker`: por qué es ilegible y qué le falta exactamente (2026-08-09)

Tarea `N3` de la nocturna del `_9`. **Resultado: cero filas de `MAPEO` escritas**, y la guarda del
propio prompt es la que lo decide — *"sólo se escribe cuando hay una única candidata inequívoca"*.
**No hay ninguna candidata en ninguna de las seis solapas.**

### La premisa del `_9` era falsa y ya está corregida

El `_9` dice *"es `modo_periodo = filtrar` y sus solapas no tienen `fecha_periodo` en `MAPEO`"*.
**`resumen_metricas_dinamico` sí la tiene** (columna `C`) y se lee perfecto: `contarLecturaBase_`
devuelve 949 filas totales, 26 en la ventana `2026-07-24 → 2026-07-30`, columna de fecha
`fecha_inicio`, **cero filas sin fecha y cero con fecha inválida**. El detalle de por qué circuló
lo falso está en el pendiente `P1 · Seis solapas de looker…`.

### Las seis solapas `fuente` restantes, medidas contra `SOLAPAS.firma_encabezado`

| solapa | filas | columnas | candidatas a `fecha_periodo` |
|---|---|---|---|
| `MAIL` | 5760 | `ID cuentas · Enviados · Entregados · Aperturas · Clics` | **ninguna** |
| `IVR` | 192 | `ID cuentas · Audiencia · Llamados Realizados · Llamados Atendidos · Escucharon +75% · Marque 1` | **ninguna** |
| `SMS` | 92 | `ID cuentas · Enviados · Entregados · Clics` | **ninguna** |
| `CC` | 1309 | `ID Cuentas · Base enviada · Base barrida · Contactados · Efectivos` | **ninguna** |
| `DIGITAL` | 4591 | `Id cuentas · Plataforma · Impresiones · Visualizaciones · Clics · nombre_campaña · eje · area · estado` | **ninguna** |
| `ALCANCE` | 740 | `ID Cuentas · Alcance · Frecuencia · eje · area · nombre_campaña` | **ninguna** |

**12.684 filas de detalle por canal, declaradas `fuente`, sin una sola columna de fecha.** No es
que la candidata sea ambigua: **no existe.** Son tablas de hechos por `ID cuentas`, sin dimensión
temporal propia — el período tendría que venir del join contra la maestra, no de una columna suya.

### La alternativa, reportada y no aplicada

**Si `looker` fuera `snapshot` en vez de `filtrar`, las seis pasarían a legibles sin tocar
`MAPEO`.** El argumento a favor es de simetría y está medido: estas seis solapas tienen **la misma
forma** que las cinco solapas de canal de `digital` —hechos por `ID cuentas`, sin fecha— y
`digital` es `snapshot` justamente por eso (`Instalar.gs:842`, y el motivo escrito en
`Union.gs:61-67`: el recorte lo hace el link campaña↔encuentro, no una ventana de fecha).

**El argumento en contra, y por eso no se aplica de noche:** `looker/resumen_metricas_dinamico`
—la fuente que declara `S-01`, la que hoy funciona— **sí tiene fecha y sí se filtra bien**.
Pasar la base entera a `snapshot` le sacaría el recorte por ventana a la única solapa que lo usa
correctamente, y ese recorte hoy deja 26 filas de 949. **Es una decisión del usuario**, y las dos
salidas posibles son distintas:

1. `looker` a `snapshot` → las seis se vuelven legibles, y `resumen_metricas_dinamico` pierde su
   filtro por ventana.
2. Las seis bajan a `uso = revisar` o `ignorar` → si el detalle por canal ya lo cubre `digital`,
   que es lo que hoy usa la unión, entonces están declaradas `fuente` de más.

### Por qué no se escribió ninguna fila, más allá de que no haya candidata

Aunque hubiera una, **el camino declarado para poblar `fecha_periodo` es otro**: `DIAG_FECHAS` →
elección humana → `promoverFechasElegidas()` (`Fechas.gs`), con el criterio escrito en
`Fuentes.gs:21-30` — *"detección automática, elección humana"* — y respaldado por `S-02` y por la
selección congelada de `docs/FECHAS_seleccion.md`, que es de donde salió la fila de
`looker/fecha_periodo` que hoy funciona. Escribir la celda a mano saltearía ese mecanismo.

### Un hallazgo lateral que le sirve a `N2`

**`looker/CC` tiene `Base enviada` y `Base barrida`** — ahí está el `cc_base` que `N2` no
encontraba en ningún `MAPEO`. Y **`looker/DIGITAL` tiene `Plataforma` e `Impresiones`**, o sea una
segunda fuente posible para `imp_google/meta/prog`, además de
`digital/CAMPAÑAS_DESGLOCE_DIGITAL`.

**Las dos siguen siendo preguntas del usuario, y ahora están acotadas:**

- `cc_base` → ¿`Base enviada` o `Base barrida`? **Son dos candidatas, así que no se elige sola.**
- `imp_*` → ¿`digital/CAMPAÑAS_DESGLOCE_DIGITAL` (4889 filas, legible hoy) o `looker/DIGITAL`
  (4591 filas, hoy ilegible)? **Dos fuentes para el mismo número es exactamente lo que hay que
  decidir antes de cablear**, no después.

---

## `N4` + `N5` — el diagnóstico de la unión deja de esconder lo que descarta (2026-08-09)

Tareas `N4` y `N5` de la nocturna del `_9`. **Van en un solo commit y conviene decir por qué:
son el mismo bug de conteo en dos campos del mismo bloque** (`unirDigitalPorCuentaSinCache_`),
y separarlos habría partido un hunk contiguo. El `_9` pide un commit por tarea; ésta es la
excepción y queda anotada.

**Ninguna de las dos cambia el comportamiento de la unión.** Sigue pisando y sigue descartando
exactamente igual. Lo único que cambia es que ahora se ve.

### `N4` — la pisada

`cuentasMaestra` contaba **filas con id**, no ids distintos, y se publicaba como `cuentas`.
Comparar `filas_leidas` contra `cuentas` no detectaba nada. El diagnóstico ahora publica cuatro
campos y la diferencia como uno propio:

```
Seguimiento digital: leidas=979  con_id=840  cuentas=763  PISADAS=77
```

Verificado contra el motor después del `clasp push`, y coincide con la medición independiente de
la Parte 0 del `_6`.

### `N5` — las huérfanas, con su peso

`huerfanas_en_canal` es una lista de ids **con repetidos** —se pushea una vez por fila
descartada—, así que su `.length` eran filas y el rótulo decía "huérfanas" a secas. Se agregan
`huerfanas_filas`, `huerfanas_ids` y `huerfanas_mayores` (top 5 por cantidad de filas), y el
alert muestra el porcentaje del canal. El campo original **se conserva con su forma**, así que
ningún consumidor se rompe.

Medido contra el motor, después del push:

| solapa | leídas | matcheadas | filas descartadas | ids | mayores |
|---|---|---|---|---|---|
| Digital | 1297 | **38** | **922 (71,1 %)** | 842 | `0824-DICNEWAN`×2, `0872-ENENEWAN`×2… |
| Directa Mail | 2162 | 1531 | **631 (29,2 %)** | 292 | `1942-SEPEPHGC`×54, `1946-SEPEPHGC`×43, `2033-SEPEPHGC`×35 |
| Directa SMS | 48 | 39 | 9 (18,8 %) | 8 | `3278-JUNVINGC`×2 |
| Directa IVR | 58 | 58 | 0 | 0 | — |
| Alcance | 768 | 763 | 5 (0,7 %) | 1 | **`#N/A`×5** |

### El instrumento encontró algo en la primera corrida

**Las 5 filas huérfanas de `digital/Alcance` tienen `id_cuenta = "#N/A"`.** No es un id que falte
en la maestra: es **una fórmula rota que llega como texto**, que es exactamente el caso que `R-19`
describe (*"un `IMPORTRANGE` roto no tira excepción: devuelve `#REF!` como texto"*, con `#N/A` en
la misma familia).

Antes esto se leía como *"1 huérfana en canal"* y no significaba nada. Ahora el valor está a la
vista. **No se tocó**: `Alcance` es de un dueño externo y arreglar la fórmula no es del motor.
Queda como dato para quien mire la base.

### Lo que `N5` pedía y no se hizo, con el motivo

El `_9` pide que las huérfanas salgan **al informe de corrida**. **No se hizo, y no por falta de
tiempo:** no existe un "informe de corrida" al que agregarlas, y los tres candidatos tienen costos
muy distintos —`FALTANTES` es por token y responde otra pregunta; `CORRIDAS` tiene esquema fijo de
8 columnas y meter una más es tocar `HOJAS_CONFIG_`, o sea el esquema de una hoja de registro de
noche y sin usuario; el valor de retorno de `generarInforme` es el candidato barato—.

Y hay un obstáculo estructural que el prompt no ve: **la corrida nunca tiene el `diagnostico` en
la mano.** `filasDigitalDeEncuentro` (`Union.gs:821-824`) devuelve `union.porCuenta[...]` y tira
el resto. Llevar las huérfanas al Generador exige **abrir un camino nuevo** desde
`unirDigitalPorCuenta`, y eso es más que *"un arreglo de reporte"*.

**Queda para el usuario:** por dónde sale, y si el destino es el retorno de `generarInforme` o una
columna nueva en `CORRIDAS`.

---

## El `10.1` — los seis puntos del verificador, resueltos (2026-08-09)

Corrida del addendum `docs/Prompts/2026-08-08_10.1_addendum_verificador.md`, **puntos 1 a 5**.
**Ningún `.gs` tocado, ningún marcador cableado.** El punto 6 —la Parte B del `_10`— **no se
corrió**; el motivo está abajo.

Antes corrió la **Parte 0 del `_10`** (reportada, sin persistir en su momento). Lo que midió:

- **`0.1`** — `mail_remitente` → `G`, `mail_tipo` → `I`, `figura` → `A`, los tres en el `MAPEO`
  **vivo**. La premisa del `_10` (*"no aparece en el snapshot del 01/08"*) era un snapshot vencido.
- **`0.2`** — vocabulario de `STATUS REUNIÓN` sobre las 1362 filas: `Realizada` 662, `Suspendida`
  58, **`en agenda` 7**, `Reprogramada` 2, `Se modifico el barrio` 1, vacío 632. **Catálogo
  cerrado**, el mismo de `R-09` a nueve días. `en agenda` va en minúscula.
- **`0.3`** — el borrado de las notas del orador de `SECCO` **no está registrado en el repo**;
  `C-01` addendum 1 y el `_11` las dan por presentes. No verificable desde acá.
- **`0.4`** — **7 textos de filtro distintos** en 33 filas de `MARCADORES` + 1 en `SECCIONES`.
  Ninguno contiene `~`, `CONTIENE`, `~=`, `%`, `*=` ni `::`. **Cero colisiones.**

### Lo que se escribió

| punto | qué |
|---|---|
| 1 + 2 | **`R-20`** en `REGLAS_NEGOCIO.md`, acotando `R-09` sin derogarla, con encabezado `⚠ SIN MECANISMO` y su pendiente nombrando lo que falta |
| 3 | **`C.4` retirado**, con su línea en `PENDIENTES` |
| 4 | **`docs/VALIDACION_2026-08-09.md`**, el par que le faltaba al CSV |
| 5 | **`R-21`** (prioridad de selección de encuentros) y el **`Addendum 1` de `R-17`** |

**El argumento falso no se escribió.** El `_10` justificaba `R-20` diciendo que las filas
no-realizadas vienen vacías; `R-09:334` midió lo contrario (34 de 61 traen números). El `10.1` §1
lo retiró y en la regla quedó **por qué ese hecho la funda en vez de debilitarla**: una fila
`en agenda` con número no es confiable, es peligrosa — suma en silencio.

**Y una corrección de dato al propio `10.1`:** manda verificar `R-20` *"contra las 6 filas
`en agenda` de `R-09:331`"*. **Hoy son 7.** `R-09` es del 31/07. Queda escrito en la regla para
que nadie verifique contra un número vencido.

### Tres hallazgos de la Parte 0 que no estaban en ningún prompt

**1 · Los `imp_*` no se reproducen desde `CAMPAÑAS_DESGLOCE_DIGITAL`.** De las **436 filas que
solapan 24–31/07**, `JM | GCBA | POLICIA` da **GCBA 431, `Sin Tipo` 5, JM cero**. Las filas `JM`
de esa solapa existen —107— pero **se cortan en abril de 2026**. Por cruce con las 166 cuentas JM
de `digital/Digital`: 34 filas históricas, **0 en la ventana**. Meta 716.650 · Google 531.403 ·
Programmatic 5.194.898 **no salen de ahí con ningún corte JM**.

**2 · Los seis `pauta_*` están cableados sobre columnas booleanas.** `Google`, `Programmatic` y
`Meta` de `digital/Seguimiento digital` son **`"true"` / `"false"` como texto**, cero valores
numéricos en 950+ filas — y los marcadores usan `operacion = SUMA` con `tipo_esperado: numero`.
`SUMA` sobre texto no puede dar los 9/7/14 que pide `X-11`. Contar `true` en la ventana tampoco
(da 1/1/1).

**3 · `rdv/RDV_otros_ministros` resuelve su `fecha_periodo` a `hora_cita_evento`** — la columna de
la *hora*. Funciona (514 filas, 10 en ventana, 0 sin fecha) **porque los encabezados están
corridos una columna**, que es lo que denuncia `C-09`. El mapeo apunta al dato correcto con el
nombre equivocado. Y esa solapa tiene **un solo campo en `MAPEO`**: ni `figura`, ni `inscriptos`,
ni `asistentes`. **La cascada que `R-20` necesita no es ejecutable hoy.**

### Por qué el punto 6 no se corrió

**El propio `10.1` se contradice ahí:** el punto 6 manda correr la Parte B —que incluye el
operador `CONTIENE`— y el párrafo siguiente dice *"reportar y parar antes de tocar nada de
`Generador.gs`"*. El operador vive en `Generador.gs` (`parsearFiltro_:357`,
`aplicarFiltroDeMarcador_:385`).

**Y el orden lo fijó el usuario el 09/08:** `_11` primero, después `_10`, y recién ahí `_8`. El
`_11` **no corrió**.

**Además, `R-15 Addendum 2` está bloqueado**, y no por tiempo: `looker/Cuentas` tiene
`uso = ignorar` (`CLAUDE.md` §2 prohíbe leerla, y es doble conteo por `S-01`), `nombre_campaña` no
existe como campo lógico en ninguna base, **`looker/CC` no tiene esa columna**, y `looker/CC` no
tiene `fecha_periodo`. Escribirlo como regla vigente sería asentar algo inaplicable; si se
escribe, va marcado `SIN MECANISMO` como `R-20`.

---

## El `_12` — contención de `pauta_*`: la premisa se cayó al medirla (2026-08-09)

Corrida del `docs/Prompts/2026-08-09_12_contencion_pauta_y_secuencia.md`, **paso 2**. El **paso 1
no se hizo** y el motivo es el que sigue. Ningún `.gs` tocado, ninguna fila de `MARCADORES`
escrita.

### `§2` — los seis `pauta_*` NO publican un cero. Publican `1`, con estado `ok`

**Y el hallazgo que lo motivaba lo generé yo el 09/08, y era falso.** Queda retractado acá con la
medición que lo desmiente, igual que se hizo con *"looker es ilegible"*.

`resolverMarcadores('jm')` contra el motor, ventana `2026-07-24 → 2026-07-30`:

```
pauta_google / pauta_meta / pauta_prog          estado=ok  valor=1
gcba_pauta_google / gcba_pauta_meta / gcba_prog estado=ok  valor=1
traza: SUMA sobre 72 fila(s) de digital/Seguimiento digital (71 con valor numérico)
```

**Por qué mi medición anterior dijo "cero valores numéricos".** Las celdas de `Google`,
`Programmatic` y `Meta` son **booleanos reales** de Sheets —`typeof` da `boolean` en **950 de las
979 filas**—, no el texto `"true"`/`"false"`. Mi script hizo `String(celda)` antes de mirar el
tipo, y eso **convierte `true` en `"true"` y disfraza un booleano de texto**. El motor no hace
eso: `Number(true) === 1`.

**Consecuencia, y da vuelta el diagnóstico entero: `SUMA` sobre una columna booleana ES el conteo
de `true`.** La operación no está mal. `opSUMA` (`Marcadores.gs:86`) suma `1` por cada `true` y
`0` por cada `false`, y su guarda de `conValor === 0` —*"sin dato, no cero"*— **ni siquiera se
dispara**, porque hay 71 valores numéricos.

**Entonces no hay ningún cero falso impreso, y la contención del paso 1 no tiene objeto.**

### El problema real, que es otro y sí queda abierto

`pauta_google` publica **1** y `X-11` pide **7**. La brecha no es de operación: **es de
universo**, que es exactamente la hipótesis que el `_12` §2 marcaba como no verificada. Dos
señales, las dos en la traza del propio motor:

1. **`72 de 979 filas · 220 sin fecha, excluidas.`** El recorte por ventana sobre `Fecha de
   inicio` con solape contra `Fecha de fin` deja afuera 907 filas, 220 de ellas **por no tener
   fecha**. Si `Seguimiento digital` se comportara como `snapshot` —igual que el resto de
   `digital`, que es `modo_periodo = snapshot`— la ventana no intervendría.
2. **`pauta_*` y `gcba_pauta_*` publican el mismo número**, porque **ninguno de los seis tiene
   filtro**. No hay corte JM/GCBA en la familia entera. El token de GCBA publica el de JM.

**Nada de esto se tocó**: son dos decisiones de universo y el `_12` §5 prohíbe cambiar operación
o fuente. Van a `PENDIENTES`.

### Y por qué el paso 1 tampoco era ejecutable como estaba escrito

Aparte de la premisa, hay un impedimento estructural: **`MARCADORES` no tiene columna `estado`.**
Sus 14 columnas son `marcador · familia · informe_id · base_id · solapa · campo_logico ·
periodo_ref · operacion · valor_fijo · filtro · formato · catalogo · separador · notas`.

`REVISAR` **no es un valor que se escriba en la hoja**: es un estado que el motor calcula en
runtime (`Generador.gs:752`, `vacio ? (huboRechazos ? 'REVISAR' : 'sin_datos') : 'ok'`) y cuyo
disparador es `salida.rechazados`, que hoy sólo puebla la operación `LISTA`. Poner los seis en
`REVISAR` habría exigido cambiar `operacion` o la fuente — **las dos cosas prohibidas por el
`§5`** — o agregar una columna a una hoja de registro, que tampoco estaba autorizado.

### `§1` — los `imp_*`: la medición cierra la puerta

Ya asentada en la entrada anterior y en `VALIDACION_2026-08-09.md` §4.1. Los tres cortes:

- **436 filas** de `digital/CAMPAÑAS_DESGLOCE_DIGITAL` solapan 24–31/07 → `JM | GCBA | POLICIA`
  da **GCBA 431, `Sin Tipo` 5, JM cero**.
- Las filas `JM` de esa solapa son **107 en total** y **se cortan en abril de 2026**.
- Cruce por `Id cuentas` contra las **166** cuentas JM de `digital/Digital`: **34 filas
  históricas, 0 en la ventana**.

**Meta 716.650 / Google 531.403 / Programmatic 5.194.898 no salen de ese cruce con ningún corte
JM.** No falta afinar el join: no hay filas.

**El `_13` anunciado se cancela** — el cruce `Digital × CAMPAÑAS_DESGLOCE_DIGITAL` era su motivo
y está medido que no destraba. Y confirma que **retirar `C.4` fue correcto**: la poda habría
borrado `imp_total`, la única fila que produce un número, para reemplazarla por tres imposibles.

### `§3` — `RDV_otros_ministros`, y un cero que se registra

La solapa tiene **un solo campo en `MAPEO`** (`fecha_periodo`), y su `fecha_periodo` resuelve a
**`hora_cita_evento`** — la columna de la *hora*. Funciona porque los encabezados están corridos
una columna (`C-09`). **Es un acierto por compensación de dos errores:** el día que `C-09` se
arregle, esta lectura no va a fallar, va a **leer otra columna**. Va a `PENDIENTES` atado a
`C-09`. **El `MAPEO` no se tocó** — el mapeo corrido es correcto *mientras* la solapa esté
corrida.

**Y una corrección al `_12` §3, con el cero registrado.** El prompt manda corregir el handoff,
que supuestamente lista los encuentros de ministros entre lo *"cableable hoy sin preguntarle nada
a nadie"*. **Esa línea no existe.** `grep -rn "8 de 8|sin preguntarle nada|cableable hoy"` sobre
todo el repo devuelve **dos coincidencias, las dos dentro del propio `_12`**. `HANDOFF_CODE.md`
se reescribió entero el 09/08 y no la tiene. **Cero ediciones, y el cero queda registrado**
(`CLAUDE.md` §3).

El hecho de fondo sí es correcto y ya está anotado: con `figura` fuera del `MAPEO` de esa solapa,
el filtro `figura!=Jorge Macri` **no es ejecutable por el motor**, y los 8 de 8 de `V-49` se
validaron a mano contra las bases. Cierto como número, falso como cableado.

---

## El `_11` — Fase 2 de `D-23`: las 51 láminas selladas (2026-08-09)

Corrida del `docs/Prompts/2026-08-07_11_fase2_sellador.md` con sus dos addenda, `11.1` y `11.2`.
**Es la primera corrida del proyecto que escribe sobre las plantillas vivas.**

```
SECCO_marcada   29 láminas · L-001 … L-029
JM_marcada      22 láminas · L-030 … L-051
LAMINAS         51 filas · 7 escondidas marcadas
```

**El módulo es `Sellador.gs`, propio y no parte de `Armonizar.gs`:** aquél migra **tokens** del
cuerpo de las láminas, éste escribe **identidad** en las notas del orador, y son **dos
autorizaciones distintas de `C-01`** —la armonización ya estaba cubierta por la excepción de
migración explícita; el sellado necesitó el `Addendum 1` del 07/08—. Mezclarlas haría parecer que
una cubre a la otra.

### La numeración, y el motivo del orden

**`lamina_id` es global y corrido, `secco` primero.** El contador es `max(lamina_id) + 1` sobre la
hoja entera, **no** una celda ni las notas de las plantillas (`D-23` punto 9): derivarlo de las
notas haría que retirar una lámina **hiciera retroceder el contador** y un id se reasignara. Desde
la hoja no puede pasar, porque una lámina no se borra, se esconde, y su fila queda (punto 11).

**El motivo del orden es de legibilidad y pesa más que el orden:** la documentación del proyecto
dice *"lámina 2"*, *"lámina 6"*, *"la 10 escondida"* refiriéndose a la **posición en `jm`**. Con
`jm` arrancando en `L-030`, ningún `lamina_id` se parece a una de esas posiciones. Con `jm` desde
`L-001` coincidían por casualidad — la peor forma de no colisionar. Queda en `CLAUDE.md` §2.

### El caso de prueba se reemplazó, y el reemplazo es mejor control

El `0.5` designaba las notas del equipo de `SECCO` 8 y 25. **Ya no existen**: la 8 se borró el
08/08 fuera del motor y la 25 el 09/08 con autorización expresa (`C-01` addenda 3 y 4). El
reemplazo: **una nota testigo puesta a mano en una copia desechable**, con el control *"mi texto
sigue entero **Y** el ancla aparece como línea nueva"*.

**Es mejor control que el original.** El de las notas del equipo sólo verificaba que el texto
sobreviviera, y eso **pasa con y sin la lógica de sellado**. El del testigo da rojo si el ancla no
aparece.

### Los tres controles de la Parte C

| | resultado |
|---|---|
| `C.1` anexar no pisa, sobre copias | **VERDE** — 3/3 controles en las dos plantillas |
| `C.3` correr dos veces | **VERDE** — `a_sellar=0`, `filas_a_reparar=0`, **y ni siquiera hace backup**: sale antes de tocar nada |
| `C.4` 51 y 51 | **VERDE** — 51 ids distintos, cero repetidos, cero huecos |

### Dos bugs que encontró la verificación, y cómo

**1 · Correr `C.1` sobre copias destapó que el sellado de una copia escribía en `LAMINAS`.** La
primera pasada escribió 22 filas para láminas de un archivo desechable. El daño no era la basura:
**habría movido el contador**, y la plantilla viva habría empezado en `L-023`. Corregido: con
`plantillaId` override el sellado escribe el ancla y **no toca la hoja**. Es exactamente para esto
que el prompt exige correr sobre copias primero.

**2 · El diálogo del menú listaba `jm` primero, y ese orden era el de ejecución.**
`menuSellarPlantillas_` armaba el preview con `Object.keys(leerInformes())` —que devuelve `jm`
primero, el orden de las filas de la hoja— **y recorría ese mismo arreglo para sellar**. Habría
asignado `L-001`–`L-022` a `jm`, al revés del `11.2`.

**Lo cazó el usuario leyendo el diálogo antes de aceptar, y canceló.** La verificación de `C.1` no
lo había atrapado porque probó llamando desde el CLI **en orden explícito**: se verificó el camino
de la API y **el menú es otro camino**.

Corregido con `ORDEN_SELLADO_ = ['secco','jm']`, **fijado y no derivado** — no puede salir de
`leerInformes()` porque ese orden es el de una hoja que se edita a mano, y un `lamina_id` asignado
no se reusa nunca. Y el diálogo pasó a mostrar **el rango de ids por plantilla, acumulando**: es
el único dato irreversible de la operación y no aparecía.

### `C.5` — el control de cierre, y por qué es lo que faltaba

`verificarLaminas()` compara **plantilla contra hoja** y es corrible desde el menú. Busca cinco
desajustes distintos: ancla sin fila, **fila sin ancla** (el peor: el id está quemado y no señala
nada), lámina sin sellar, ids repetidos, y huecos más desajustes de `informe_id`/`orden_plantilla`.

**Por qué hacía falta:** el `11.1` §4 fija que la plantilla es autoritativa y la hoja reparable,
pero **no había forma de verificar que coincidieran desde el motor**. La primera vez que hizo falta
—un estado intermedio durante la corrida viva— se leyó a mano cruzando dos llamadas y comparando a
ojo. **Un invariante que sólo se puede chequear a mano no es un invariante: es una intención.**

Corrida de cierre: **VERDE**, 51 láminas, 51 anclas, 51 filas, los seis desajustes en cero.

### Lo que este paso NO hizo, y está decidido

`seccion_id` **queda vacío en las 51 filas**: el sellador no deduce nada (`B.4`). Son 26 de 51
celdas de trabajo humano posterior, medido. Tampoco se escribió `#seccion:` en ninguna nota —
**no existe como campo del ancla** desde el `Addendum 2` de `C-01`.

---

## El `_19` — `escribirColumnaLaminas_`, y una cita mía que era falsa (2026-08-10)

Corrida del `docs/Prompts/2026-08-10_19_escritor_de_columnas_de_laminas.md` con su addendum
`19.1`, que la acotó al **camino 1: sólo la Parte B —el escritor— más la Parte D**. La Parte C
salió del alcance. **Ninguna celda de `L-031` ni `L-032` se escribió.**

### Parte A — las cuatro premisas, predicción contra medición

Lectura de la hoja viva el **10/08/2026**. El reporte del turno anterior entró como **predicción**,
no como medición, y las cuatro dieron igual:

| | predicción | medido |
|---|---|---|
| `A.1` | 13 columnas, sin `titulo` | **13**, sin `titulo`, y **cero encabezados con espacios al borde** |
| `A.2` | mapea por encabezado, devuelve `_fila` | `_fila` presente — `L-001 → _fila 2` |
| `A.3` | `L-031`/`L-032` = láminas 2 y 3 de `jm` | `L-031 → orden_plantilla 2`, `L-032 → 3`, las dos `jm` |
| `A.4` | `cobertura`, `falta`, `notas` vacías | las tres `""` en las dos filas |

Controles: **51 filas, 7 escondidas**. Y `A.1` confirma algo que no estaba en la predicción:
**seed y hoja viva coinciden** — la distinción que `CLAUDE.md` §7 obliga a no dar por hecha.

### ⚠ La cita de `A.3` era falsa, y el error es de esta sesión

En el turno anterior escribí que `L-031`/`L-032` *"fueron verificadas por lectura en la nocturna
del 09/08"*. **La medición existió** —se corrió `leerLaminas_` y dio ese resultado— **pero vivió
sólo en la conversación**: cero rastro en bitácora, handoff o reporte. El `verificador` la buscó
en todo el repo y no la encontró, y tenía razón.

Y la fuente que yo citaba decía lo contrario. `1.4` §3, textual: *"Son `L-031` y `L-032` **si** la
numeración corrida se sostiene, **pero eso se verifica leyendo, no se asume**"*. **Convertí una
condicional en un hecho medido.** Es el patrón *"la cita no es la fuente"* de `CLAUDE.md` §4,
cometido sobre una medición propia.

**Ahora está medida y el número está escrito acá**, que es lo único que evita que vuelva a pasar.

### Parte B — el escritor

`escribirColumnaLaminas_(mapa, columna, opciones)` en `Sellador.gs`. **Es el único camino para
escribir celdas de `LAMINAS` que no sean filas nuevas**: `sellarPlantilla` agrega filas enteras por
posición y `borrarFilasDeLaminas` borra; entre esos dos extremos no había nada, y ésa es la razón
por la que la Parte D del `2026-08-09_1` quedó frenada.

Cada cláusula del contrato está por un modo de falla conocido: **una columna por llamada**
—escribir varias es lo que hace que un error de alineación pase inadvertido—, **resuelta por
nombre de encabezado y nunca por índice** —la hoja va a ganar `titulo` con el `_16` y esta función
no puede enterarse—, **no crea ni borra filas**, y **si el valor es el que ya está, no escribe**,
que es lo que permite correr dos veces y ver cero la segunda.

**Los seis criterios, verificados contra el motor:**

| control | resultado |
|---|---|
| `dryRun` no escribe | ✅ reporta 1, la celda sigue vacía |
| mapa vacío | ✅ cero, sin fallar |
| `lamina_id` inexistente | ✅ reportado en `no_encontradas`, **no crea fila** |
| columna inexistente | ✅ falla con motivo y lista las 13 |
| valor igual al que ya está | ✅ `sin_cambio=2`, **cero escrituras** |
| 51 filas / 7 escondidas | ✅ intactas |

### El respaldo, y por qué el prompt pedía algo que no existe

El `_19` `B` pedía *"backup de la planilla antes de escribir"*. **No existe ninguna función que
copie el spreadsheet de control** — `backupPlantilla_` copia Slides y su carpeta cuelga de
`carpeta_plantillas`. Ningún escritor de hoja de registro respalda nada hoy.

El `19.1` §3.1 lo resolvió con el precedente que sí existe: **el TSV de `docs/_snapshots/`**.
Corrido antes de la primera escritura → `LAMINAS_2026-08-10.tsv`, 52 líneas. Y el respaldo fino va
adentro de la función: **devuelve `anterior` y `nuevo` por celda**, con lo cual deshacer tres
celdas a mano es trivial. Un backup del spreadsheet entero queda como capacidad propia en
`PENDIENTES`.

### El hallazgo: tres listas que deben coincidir y no coinciden solas

`LAMINAS` no aparecía en el censo de escritores, y el motivo es estructural: **hay tres listas de
hojas de registro, duplicadas a propósito** —`HOJAS_REGISTRO` en `tools/escritores.js`, `HOJAS` en
`tools/snapshot.js`, y `ALCANCE_REGISTROS_` en `Instalar.gs`—. La duplicación **es correcta**: leer
la lista del código bajo prueba anularía la independencia de las dos herramientas.

**Pero cuando la hoja nació con el `_11` (09/08), sólo `ALCANCE_REGISTROS_` la incluyó**, y la
divergencia **no falló sola**: el censo mandó `LAMINAS` al anexo de *"no es de registro"* sin
avisar, y `docs/_snapshots/` nunca tuvo su TSV. Las tres quedaron en **once** el 10/08.

**Lo que sigue abierto:** tres listas que deben coincidir **por convención y no por mecanismo** van
a volver a divergir. Anotado en `PENDIENTES`; no se implementó ninguna guarda acá.

### Parte D

`ESCRITORES.md` gana la fila de `LAMINAS` con sus tres escritores, y el censo re-corrido **no
levantó ningún cuarto que nadie soplara** — el `19.1` §4 pedía reportarlo si aparecía. Se anota
igual el **cuarto escritor estructural**: `aplicarInstalacion_` reescribe la fila 1 de encabezados
porque `LAMINAS` no está en `COLUMNAS_DELTA_`. No es de contenido, y §1 ya lo declara para todas.

**`PLAN.md` no se tocó**, como fija el `19.1` §4: la regla del `1.4` §2 —quién escribe `cobertura`
y `falta`— entra cuando se ejerza. Escribirla ahora sería documentar una excepción que nunca se
usó.

### Y por qué la Parte C no corrió

El `_19` `C` mandaba escribir en `notas` *"la aproximación declarada de la Parte B"*, y **la Parte
B del `2026-08-09_1` nunca corrió** — sigue bloqueada sin `MAPEO`, sin `fecha_periodo` y sin
capacidad de join. Escribir esa nota **afirmaría en una celda de registro un hecho que no
ocurrió**.

Y hay un segundo motivo, más de fondo: la excepción del `1.4` §2 dice *"las escribe quien acaba de
cambiar la cobertura de esa lámina, **en la misma corrida**"*. El `_19` no cambia ninguna
cobertura. Sin esa condición, escribir `parcial` sería **copiar a la hoja un valor decidido en un
documento**, que es exactamente lo que el `15.1` prohíbe.

El `1.4` §3 quedó corregido en el lugar, y el requisito para el prompt que corra la Parte C está
escrito: **trae las tres celdas literales entre comillas, no en prosa.**

---

## El `_18` — los encabezados de `looker`, y el corte JM medido (2026-08-10)

Corrida del `docs/Prompts/2026-08-10_18_encabezados_de_looker.md`, puntos `0.0` y `0.2`.
**Sólo lectura de punta a punta.** Ningún marcador cableado, ninguna hoja escrita salvo la regla.

**Lectura de las hojas vivas el 10/08/2026.**

### `0.0` — la salida es la **0** de las cuatro: parte de la Parte B ya es alcanzable

`looker/resumen_metricas_dinamico` está **mapeada, es legible y tiene período**:

```
contarLecturaBase_('looker')
  hoja: resumen_metricas_dinamico   modo: filtrar   columna_fecha: fecha_inicio
  filas_totales: 951   filas_en_ventana: 26   filas_sin_fecha: 0
```

27 campos mapeados, entre ellos `campana`, `eje`, `area`, `id_cuenta`, `fecha_periodo` y
**`dig_impresiones`**.

**Token por token de la Parte B:**

| token | veredicto |
|---|---|
| `imp_total` · `gcba_imp_total` | **(a) alcanzable hoy** — `dig_impresiones` + `campana~=JM` / `!~=` |
| `imp_meta` · `imp_google` · `imp_prog` | **(b)** necesitan `Plataforma`, que la dinámica **no tiene** |
| `pauta_*` | **(b)** — ídem, es conteo por plataforma |

**Los tres bloqueos que reporté el 09/08 eran ciertos pero sobredimensionados.** Valen para el
**desglose por plataforma**, no para la Parte B entera: `imp_total` y `gcba_imp_total` se destraban
con dos filas de `MARCADORES` y el operador que ya existe — **sin join, sin `MAPEO` nuevo y sin
tocar `fecha_periodo`**. Lo que yo no medí fue si la Parte B necesitaba `looker/DIGITAL`, y en
parte no lo necesita.

### `0.2` — los bordes del corte JM, y salieron limpios

`medirBordesDeCorteJM` sobre `nombre_campaña`, 951 filas:

| | |
|---|---|
| con `JM` (`~=`) | **74** |
| sin `JM` | **877** |
| sin nombre | **0** |
| **suma cierra** | ✅ |
| falsos positivos (`JM` dentro de otra palabra) | **0** |
| variantes de case que `~=` no matchearía | **0** |

**Los dos ceros son lo que deja usar `~=` sin culpa.** Escrito como **`R-23`**, con la acotación
de que vale para `looker` y nada más — el corte en Mail, SMS y CC lo declara `R-15` por otros
campos.

**Y un dato que el ejemplo del usuario inducía a leer mal:** el nombre viene en segmentos
separados por ` | `, pero **`JM` casi nunca es un segmento propio** — sólo en **3 de las 74**. Un
filtro que buscara `JM` como segmento capturaría **3 filas en vez de 74**.

### ⚠ Una corrección de instrumento, declarada

El primer criterio de "falso positivo" marcó **71**, porque preguntaba si `JM` era **segmento
propio entre pipes**. Pero `RDV JM | Villa Devoto` **sí es una campaña de JM**: el nombre
simplemente no usa ese separador.

**El instrumento medía la forma del nombre, no la pertenencia.** Es *acertar el hecho y errar la
inferencia* (`CLAUDE.md` §4), y es la segunda vez en esta sesión. Corregido a *`JM` como palabra*
—con bordes que no sean letra, acentos incluidos— y ahí da **cero**.

### La decisión sobre las mixtas — usuario, 10/08

**Cinco campañas nombran a JM y a GCBA a la vez** (`CAMPAÑA JM + GCBA`, `GCBA/AGENDA JM`,
`GCBA + JM`). **Van enteras a JM**, con la nota escrita en `R-23`.

**El comportamiento no cambia** —la regla de negación ya las mandaba ahí— pero ahora está
**decidido en vez de ser un efecto colateral**. Y queda a la vista lo que cuesta: **no aportan
nada a GCBA**. Si algún día un informe de GCBA parece que le falta una campaña de seguridad,
empezar por ahí.

---

## `imp_total` y `gcba_imp_total` pasan a `looker`, con el corte de `R-23` (2026-08-10)

**Primer cableado que usa el operador `~=`**, y el primero que apunta a `looker`: hasta hoy
`MARCADORES` tenía 51 filas y **ninguna** de esa base.

### Qué se cambió, y no fueron filas nuevas

Los dos tokens **ya existían**, apuntando a `digital/Digital` — que quedó `uso = ignorar` por
`R-22` porque sus filas `JM` llegan a diciembre de 2025. Así que esto **no es cablear: es mover la
fuente de dos filas existentes**, por el camino declarado en `ESCRITORES.md`:
`curarCamposMarcadores_`, que cura campos de filas que ya están, no pisa si el valor coincide, y
devuelve `anterior`/`nuevo` por campo. **Ocho campos escritos, cero filas creadas.**

| | antes | ahora |
|---|---|---|
| `base_id` | `digital` | **`looker`** |
| `solapa` | `Digital` | **`resumen_metricas_dinamico`** |
| `campo_logico` | `dig_impresiones` | *(sin cambio)* |
| `filtro` de `imp_total` | `dig_jm_gcba=JM` | **`campana~=JM`** |
| `filtro` de `gcba_imp_total` | `dig_jm_gcba!=JM` | **`campana!~=JM`** |

Respaldo previo: `docs/_snapshots/MARCADORES_2026-08-10.tsv`.

### El resultado, medido

```
imp_total        ok   6.084.893   SUMA sobre 4 filas   filtro campana~=JM
gcba_imp_total   ok   2.027.888   SUMA sobre 22 filas  filtro campana!~=JM
```

**El complemento cierra: 4 + 22 = 26**, que son exactamente las filas de la ventana
`2026-07-24 → 2026-07-30` que `contarLecturaBase_('looker')` había medido. Es el mismo control que
`R-23` declara —`JM + GCBA = total, sin solapamiento y sin resto`— aplicado a la ventana en vez de
al universo.

**Resumen de `jm`:** de `51 / ok 38 / sin_datos 7 / error 6` a **`51 / ok 40 / sin_datos 7 /
error 4`**. Los dos que salieron de `error` son éstos; los cuatro que quedan son
`enc_impresiones`, `enc_alcance`, `frecuencia` y `gcba_frecuencia`, que siguen apuntando a
`digital/Digital`.

### Dónde quedó documentado el cableado, y por qué ahí

**En la celda `notas` de cada una de las dos filas de `MARCADORES`** — que es el dueño de la
pregunta *"¿qué va a hacer el motor si corro ahora?"* (`CLAUDE.md` §7). La nota dice tres cosas
que no se deducen de las otras columnas:

1. **de dónde vino y por qué se movió** — `digital/Digital` quedó `ignorar` por `R-22`;
2. **la medición que respalda el corte** — 74 de 951, cero falsos positivos, cero variantes;
3. **en `gcba_imp_total`, la trampa**: las cinco campañas que nombran a JM y GCBA a la vez **caen
   enteras en JM y no aportan acá**. Quien mire ese número dentro de tres meses y lo vea corto,
   empieza por ahí.

**No se tocó `docs/TOKENS.md`**: responde *"cómo se llama este token"*, no de qué fuente sale. Y no
se creó ningún documento nuevo — la fuente de un marcador vive en su fila, y duplicarla en un
`.md` es exactamente lo que se desincroniza.

### Lo que sigue sin cablear, y no es olvido

`imp_meta`, `imp_google`, `imp_prog` y los seis `pauta_*` **necesitan el desglose por plataforma**,
y `resumen_metricas_dinamico` no tiene columna `Plataforma`. Siguen en `(b)` del `0.0` del `_18`.

---

## El `_22` — las cinco respuestas de validación, `R-24`, y el `_18` cancelado (2026-08-10)

Corrida del `docs/Prompts/2026-08-10_22_respuestas_validacion_y_plataformas.md`, **partes A a E**.
**Ningún marcador cableado, ninguna plantilla tocada.** Lectura de las hojas vivas el 10/08.

**Modelo por parte**, primera vez que se aplica: `A`, `B`, `D` y `E` Sonnet; `C` Opus, porque
define de qué universo sale un número que va a un deck.

### Parte A — las cuatro confirman

- **`A.2` es la que podía parar todo, y no paró.** Los nueve encabezados de `looker/DIGITAL`
  coinciden **exactamente** con `V-67`: `nombre_campaña` en `F`, `estado` en `I`. **El fixture del
  31/07 y la solapa viva no divergieron en forma** — sí en volumen, que es otra cosa: `V-67` midió
  4.569 filas y hoy son 4.895.
- **`A.3`: `A-04` no era urgente.** Los seis `imp_*` por plataforma **no existen en `MARCADORES`**
  y **cero filas dicen `DV360`**. No había nada que corregir antes de que se ejecutara.
- **`A.4`**: `imp_total` y `gcba_imp_total` siguen sobre `resumen_metricas_dinamico`, como los dejó
  el `P0`. Nadie los tocó.
- **`A.1` se disparó igual que en el `_20` y por lo mismo:** el CSV ya traía los cinco casos porque
  lo copié verificando superset exacto —cero filas previas alteradas, cinco nuevas—. **No es
  hallazgo.**

### Parte C — `R-24`, y se validó el mismo día que se escribió

**`imp_prog` es todo lo que no es Meta ni Google ads. Por resta, no por lista.**

El `_22` §C argumentaba la resta con un caso hipotético: *"la decisión del usuario del 09/08
nombraba también Twitch y Uber. **No están en `looker/DIGITAL`** … La regla por resta las cubre
igual **si algún día aparecen**"*.

**Aparecieron.** Medido sobre la solapa viva —no sobre el fixture— `Plataforma` tiene **ocho**
valores, no seis:

| | filas | |
|---|---|---|
| `Meta` | 1783 | `imp_meta` |
| `Google ads` | 1385 | `imp_google` |
| `DV360` · `TikTok` · `Mercado Libre` · `Twitter` | 1629 · 55 · 21 · 12 | `imp_prog` |
| **`Twitch `** · **`Uber`** | 5 · 5 | `imp_prog` — **no estaban en `A-04`** |

**Una lista explícita escrita el 10/08 ya habría estado incompleta el 10/08.**

⚠ **Y `Twitch ` viene con un espacio al final** — el contrapunto exacto de la regla: **por resta un
valor mal escrito cae del lado correcto; por lista, un `Twitch` enumerado sin espacio no matchea y
la fila desaparece sin fallar.**

**El riesgo simétrico también se midió**, porque una regla por resta lo tiene: un `Meta ` con
espacio caería en `imp_prog` en vez de fallar. **Cero colisiones** — ninguno de los ocho valores
difiere de otro sólo en espacios o mayúsculas. `R-23` había medido lo mismo para `nombre_campaña`,
pero eso fue la columna `F` y esto la `B`: **cada columna se mide sola**.

### Parte D — las filas sin `estado`

**Quedan afuera** —`estado = Activa` es inclusión positiva y un vacío no la cumple— **pero dejan de
caer por omisión: la traza las cuenta**. Es `R-20` aplicado: *un vacío no es un valor*.

**36 en la solapa viva** (22 en el fixture), y **ninguna es JM**. La decisión **no cuesta nada
hoy**, y el cero es de hoy, no una propiedad — mismo criterio que el desvío de las campañas mixtas.

Contexto: aplicar `Activa` deja afuera **4.168 de 4.895 filas (85 %)**. Las 36 son ruido al lado de
eso, pero son **las únicas que quedan afuera sin decir por qué**.

### Parte E — el `_18` cancelado, no borrado

`V-67`, `C-19` y `C-20` contestaron su `0.0`, `0.1`, `0.2` y `0.4` **con más precisión de la que
una lectura desde Apps Script iba a dar**. Queda marcado en su propio archivo con la tabla de qué
caso contestó cada punto. **Lo único que sobrevive es la disyuntiva de período de `0.3`**, que pasó
a `PENDIENTES`.

**Y una corrección que el `_18` traía al revés:** su premisa era que el corte JM podía necesitar el
join. **`C-19` mostró que el corte y el filtro de estado se resuelven dentro de `DIGITAL`** —`F` e
`I`— y que **lo único que exige cruzar es la ventana**, porque la solapa no tiene ninguna columna
temporal. El join hace falta, pero **es otro join**: no para saber de quién es la campaña, sino
para saber cuándo corrió.

### Los cuatro criterios de aceptación

| | |
|---|---|
| 1 · CSV con cinco filas más, ninguna previa cambiada | ✅ verificado con diff **antes** de pisar |
| 2 · ninguna fila de `MARCADORES` dice `Plataforma = DV360` | ✅ cero |
| 3 · la regla por resta, con la fecha de la medición | ✅ `R-24` |
| 4 · nada cableado, ninguna plantilla, `LAMINAS` intacta | ✅ `verificarLaminas()` **VERDE**, 51/51 |

---

## El `_23` — la ventana por referencia: `looker/DIGITAL` deja de ser ilegible (2026-08-10)

Corrida del `docs/Prompts/2026-08-10_23_ventana_por_referencia.md`, partes A a D. **Ningún
marcador cableado, ninguna plantilla tocada, `LAMINAS` intacta** (`verificarLaminas()` VERDE,
51/51/51). Lecturas de las hojas y las bases vivas el 10/08 entre las 18:34 y las 21:10 UTC.

**Modelo por parte:** `A` y `D` Sonnet; `B` y `C` Opus, porque `B` es diseño y `C` decide qué
filas entran en la ventana de un número que va a un deck.

### Parte A — tres confirman y una no

**`A.1` y `A.2` confirman.** La ventana se decide en `leerFuente` (`Fuentes.gs`), rama `filtrar`,
con `entraPorSolape_`, y quién tiene fin lo declara `MAPEO.fecha_fin_periodo`. `looker/DIGITAL`
fallaba con `«FALTA:fecha_periodo@looker/DIGITAL»` — sin excepción y sin recorte que no recorta.

**`A.3` NO confirma, y era la premisa que podía cambiar el trabajo.** El prompt pedía verificar
*"que `fecha_inicio` y `fecha_fin` estén mapeados o sean mapeables"*. **No estaban mapeados: las
27 filas de `MAPEO` de `looker` eran todas de `resumen_metricas_dinamico`, y `Cuentas` no tenía
ni una.** Fallaba igual que `DIGITAL`, con `«FALTA:fecha_periodo@looker/Cuentas»`, teniendo las
dos fechas a la vista. Son mapeables (`C` y `D`), así que el diseño no cambió — lo que cambió es
que el criterio de aceptación 1 no se podía correr sin escribir esas filas primero.

**Y lo que sí decía `A.3`, medido:** `Cuentas` tiene **1011 filas y 1011 ids distintos, cero
repetidos**. El diseño por pertenencia era inmune al doble conteo igual; el número queda escrito
porque es la evidencia de por qué se eligió, no una consecuencia de haber acertado.

**`A.4` — el cruce.** `DIGITAL` 4896 filas: 4878 con id, **18 sin id**, 4731 matchean en
`Cuentas`, **147 huérfanas** en 31 ids distintos, uno de ellos el literal `Falta ID`.

> **Un error del instrumento, del catálogo exacto de `CLAUDE.md` §4.** La primera corrida dio
> *"0 ids, 1011 vacíos, 4878 huérfanas"*. No era el dato: **los encabezados de las dos solapas no
> coinciden** —`Cuentas` titula `id_cuentas` y `DIGITAL` titula `Id cuentas`— y el instrumento
> buscaba una sola forma. `datos[f][-1]` es `undefined` y `undefined` se lee como celda vacía.
> **La medición estaba mal, no la base**, y el desajuste que la causó terminó siendo el argumento
> de diseño más fuerte de la Parte B.

### Parte B — dónde se declara, con lo descartado

`D-24`. **Dos hojas, porque son dos preguntas de grano distinto:** *¿de qué solapa saca la fecha
ésta?* es una propiedad **de la solapa** y va en `SOLAPAS.ventana_ref`; *¿cuál es la columna de la
clave?* es literalmente una columna y va en `MAPEO`, campo lógico `clave_ventana`, una fila de
cada lado. Lo descartado —las dos cosas en `MAPEO`, las dos en `SOLAPAS`— está en `D-24` con el
motivo, que es lo que hay que conservar.

**El campo se llama `clave_ventana` y no `id_cuenta` a propósito** (`D-01`): el mecanismo no sabe
de cuentas.

### Parte C — predicción y medición, pegadas

Escrita antes de medir, sobre la ventana `2026-07-24 → 2026-07-30` (origen `config`):

| campo | predicho | medido |
|---|---|---|
| `filas_totales` | 4896 | **4896** |
| `filas_en_ventana` | 966 | **966** |
| `filas_fuera_de_ventana` | 3765 | **3765** |
| `filas_sin_clave_ventana` | 18 | **18** |
| `filas_clave_huerfana` | 147 | **147** |
| `claves_de_referencia` | 1011 | **1011** |
| `claves_en_ventana` | 92 | **92** |
| `claves_huerfanas` | 31 | **31** |

**Las ocho.** Y suman: `966 + 3765 + 18 + 147 + 0 = 4896`.

**Control 1 — `Cuentas` contra sí misma: idéntico.** 92 filas y 92 claves por los dos caminos,
cero de un lado solo, cero filas en ventana sin clave, universo 1011. El control **no escribe la
autorreferencia en `SOLAPAS`** —`validarReferenciaVentana_` rechaza el ciclo de largo uno, y con
razón—: llama a la maquinaria por abajo, que es exactamente lo que corre del lado de `DIGITAL`.

**Control 2 — la regla de un nivel**, en `Pruebas.gs`, sintético y sin tocar la planilla: dos
niveles, ciclo de largo uno, referencia a una solapa `ignorar` y referencia a una no registrada
**fallan con motivo propio**; un nivel resuelve. Las **11** pruebas del diff en verde.

**Conteo de filas para la otra ventana — no es un número publicado.** Con la ventana resuelta y
midiendo con `parsearFiltro_`/`valorPasaFiltro_`, que son la semántica del motor y no un
`indexOf` propio: de las 966 en ventana, **63 son JM**, 382 tienen `estado = Activa`, y **51
cumplen las dos**. Repartidas en `Meta` 16, `Google ads` 14, `DV360` 21 — o sea que esta semana
`imp_prog` por resta (`R-24`) sale todo de `DV360`.

### Lo que apareció al escribir, y no estaba en el prompt

**`upsertPorClave_` blanquea toda columna que el objeto no traiga**, y el comentario de
`aplicarClasificacionSolapas_` decía lo contrario desde el 2.11 Parte C. Tocarle `notas` y
`ventana_ref` a `looker/DIGITAL` le habría borrado `firma_encabezado`, `filas_datos`,
`filas_crudas` y `filas_minimas`. **La evidencia estaba a la vista hace un día y nadie la había
leído así:** `looker/Cuentas` tiene esas columnas vacías —se le editó `notas` el 09/08— y
`DIGITAL` las tenía cargadas. Se arregló **sólo en el sembrador de `SOLAPAS`**, que ahora devuelve
las cuatro columnas ajenas tal cual; `upsertPorClave_` quedó igual y el caso general es un
pendiente con prompt propio. Verificado después de sembrar: `DIGITAL` conserva `filas_datos 4591`
y su `firma_encabezado`.

**Y una predicción vieja que se cumplió sin romper nada.** El pendiente *"la inferencia de solapa
de `looker` funciona porque `MAPEO` está incompleto"* (03/08) decía que mapear una segunda solapa
haría fallar a `prueba_alcance`. Se mapearon **dos**. `prueba_alcance` ya se había retirado, y en
`MARCADORES` **ninguna** fila tiene `solapa` vacía: las dos de `looker` la declaran explícita. El
acoplamiento sigue abierto; caducó el ejemplo.

### Las 40 huérfanas JM — el número que corrigió el borrador

El primer borrador de este cierre decía *"ninguna de las 147 huérfanas es JM"*. **Es falso**, y lo
dijo la medición hecha para no afirmarlo sin dato: **40 de las 147 son JM** —el ejemplo se lee
solo, `2411-DICJDGAG · RDV JM | Caballito 17/12`—. Lo que sí es cierto, y es más delgado de lo que
parecía: **de esas 40, ninguna tiene `estado = Activa`**, así que con el filtro del cableado caen
por el estado y no por ser huérfanas. Las 18 sin id, ninguna es JM. Va a `PENDIENTES` con el
conteo y con la advertencia de que el cero es de hoy.

### Documentación

`R-25` (la regla, hermana de `R-16`), `D-24` (dónde se declara, con lo descartado), y en
`PENDIENTES`: las huérfanas, el agujero de `upsertPorClave_`, la **disyuntiva de período de
`looker` cerrada** —no había que elegir entre `filtrar` y `snapshot`: la pregunta era por solapa y
no por base— y la actualización de las dos entradas que este cambio tocó.

### Los cinco criterios de aceptación

| | |
|---|---|
| 1 · `Cuentas` por referencia contra sí misma = recorte directo | ✅ 92 y 92, cero de un lado solo |
| 2 · `DIGITAL` deja de fallar y devuelve la forma de siempre | ✅ 966 filas, `ok: true`, todos los campos del contrato |
| 3 · los tres conteos en la traza y suman | ✅ `966+3765+18+147+0 = 4896` |
| 4 · referencia de dos niveles falla con motivo propio | ✅ control positivo, 4 casos negativos |
| 5 · nada cableado, ninguna plantilla, `LAMINAS` intacta | ✅ `verificarLaminas()` VERDE 51/51 |

---

## Post-`_23` — el hueco de `SOLAPAS` era de 30 filas, y la medición de separadores (2026-08-10)

Tres pedidos del usuario después de confirmar el `_23`. **Ningún marcador cableado.**

### El agujero de `upsertPorClave_` había vaciado 30 de las 84 filas de `SOLAPAS`

Se fue a reparar `looker/Cuentas` —la fila que el `_23` había encontrado con
`firma_encabezado` y `filas_datos` vacíos— y **al medir la hoja entera aparecieron 30**, cuatro
de ellas `uso = fuente`: `looker/resumen_metricas_dinamico` (el `hoja_default` de la base y la
fuente de `imp_total`), `looker/Cuentas`, `digital/Cuentas` y `digital/Digital 2026 acumulado`.

**Y no era sólo el dato: apagaba un guardarraíl sin avisar.** `evaluarCoberturaLectura_` devuelve
`{ ok: false }` cuando `SOLAPAS.filas_datos` está vacío, así que en esas 30 solapas el aviso de
"este lector devolvió una fracción de lo registrado" —el que se agregó por el caso `m2`, 18 filas
de 29.533 con ✅— estaba desactivado.

**Restaurado con `inventariarSolapas()`**, el escritor dueño de esas tres columnas: 84
actualizadas, 0 nuevas, **29 de 30 recuperadas**. La restante es
`rdv/Cantidad de reuniones por franja horaria` sin `firma_encabezado`, y no es pérdida: esa
solapa no tiene fila de títulos.

**Verificado que la restauración no pisó lo del `_23`:** `looker/DIGITAL` conserva
`ventana_ref = Cuentas` y su nota. `inventariarSolapas()` escribe **celda por celda**, que es
precisamente lo que `upsertPorClave_` no hace — el contraste entre los dos escritores de la misma
hoja es el diagnóstico entero.

**`filas_minimas` está vacía en las 84 y eso es correcto** (`R-19` capa 3: vacío = sin chequeo, el
piso lo fija una persona). No había nada que restaurar ahí.

**De paso, 20 conteos viejos se refrescaron.** `looker/DIGITAL` 4591 → 4904; `rdv/RDV_otros_ministros`
**bajó** de 749 a 515. Los números de `SOLAPAS` son una foto con hora.

### El filtro es de una sola condición, y el separador se eligió midiendo los datos, no los textos

**Las dos premisas confirmadas contra el código:** `parsearFiltro_` (`Generador.gs`) corta en el
primer operador y devuelve un `{campo, op, valor}` — no hay forma de expresar dos condiciones. Y
`Generador.gs:626` es `filtroPropio || filtro_seccion`: el filtro del marcador **reemplaza** al de
la sección, no se suma. El comentario de `:354` ya lo decía con todas las letras.

**Cuántos de los 33 textos vivos usarían más de una condición: ninguno tiene evidencia de
necesitarla hoy.** Los 33 (32 en `MARCADORES` + 1 en `SECCIONES`) son 9 textos distintos y todos
de una condición. **La demanda no viene de los que existen: viene de los que faltan** — los tres
`imp_*` necesitan tres condiciones simultáneas, y los seis `pauta_*` no tienen filtro y necesitan
al menos la señal de figura.

**Y el candidato con evidencia estructural, que no se decide acá:** los seis `enc_*` sobre
`digital/Directa Mail` filtran `mail_tipo=Convocatoria` y **no cortan por remitente**, mientras
sus hermanos `mail_*` y `gcba_mail_*` de la misma solapa sí lo hacen
(`mail_remitente=jorge.macri@…`). Puede ser correcto —la iteración por encuentro quizá ya acota el
universo— o puede faltarles el corte de figura. Es pregunta de dominio.

### El separador: 12 libres contra los textos, **7 contra los datos**

El precedente de `~=` midió los 7 textos de filtro y alcanzó. Acá no alcanzaba, y el barrido lo
mostró: se barrieron **28 columnas** —toda fila de `MAPEO` con `tipo_esperado = texto` cuya solapa
está `uso = fuente`— más las tres de `looker/DIGITAL` que todavía no están mapeadas y son
justamente las que los `imp_*` van a filtrar.

| candidato | contra los 33 textos | contra los valores reales |
|---|---|---|
| `&&` `;` `::` `^` ` AND ` ` & ` | libre | **libre** |
| `~` | ocupado (2, es el operador) | libre, **pero colisiona con `~=`** |
| **`\|`** | **libre** | ⚠ **447 de 709 valores de `looker/DIGITAL.nombre_campaña`** |
| `,` | libre | 6 valores, y ya es el separador de `valores_incluidos` |
| `+` / ` + ` | libre | 7–9 valores en cuatro columnas |
| `/` | libre | 358 valores en `nombre_campaña`, 461 en `campana` |
| ` Y ` | libre | 16–18 valores |
| `&` | libre | 2 URLs de Facebook en `post_meta` |
| `#` `?` | libre | `#N/A` y URLs en `post_meta` |

**`|` es el caso que justifica haber medido los datos y no los textos.** Contra los 33 textos sale
limpio; en la columna exacta que los `imp_*` van a filtrar aparece en **447 de 709 valores** —
`RDV JM | Villa Devoto 15/12`, `CAMPAÑA GCBA | INFRAESTRUCTURA | …`—. Adoptarlo habría partido más
de la mitad de los nombres de campaña por el medio. Es el mismo modo de falla que
`comaDentroDeUnValor_` (`D-21`) ya cubre para `valores_incluidos`.

**No se diseñó nada:** el pedido era medir, reportar y parar.

### La ventana de validación tiene que rehacer `C-12`

`X-16` descartó cuatro unidades para `pauta_*` con el conteo `6/5/10` de filas JM + ventana +
`Activa`. **Esa ventana era la vieja.** Con la ventana por referencia el mismo corte da
**16 / 14 / 21** (`Meta` / `Google ads` / `DV360`), 51 filas en total sobre las 966 de la ventana.
Medido con `parsearFiltro_`/`valorPasaFiltro_`, que es la semántica del motor. **No se comparó
contra ningún deck** — eso es de la otra rama.

---

## El `_24` — el filtro de más de una condición (2026-08-10)

Corrida del `docs/Prompts/2026-08-10_24_filtro_multicondicion.md`, partes A a D. **Ningún
marcador cableado, ninguna plantilla tocada, `LAMINAS` intacta.**

### Parte A — las tres confirman, y la cuarta reporta

**`A.1`** · 33 textos de filtro vivos (32 en `MARCADORES`, 1 en `SECCIONES`), **9 distintos**, y
**ninguno contiene `&&` ni siquiera `&`**. Es la premisa que hace seguro el cambio.

| | |
|---|---|
| `figura=Jorge Macri` | 14 usos |
| `mail_tipo=Convocatoria` | 6 |
| `mail_remitente=jorge.macri@buenosaires.gob.ar` | 4 |
| `mail_remitente!=jorge.macri@buenosaires.gob.ar` | 4 |
| `campana~=JM` · `campana!~=JM` | 1 y 1 |
| `dig_jm_gcba=JM` · `dig_jm_gcba!=JM` | 1 y 1 |
| `etapa=post` | 1 (`SECCIONES`) |

**`A.2` y `A.3`** · `parsearFiltro_` es el único parser y `valorPasaFiltro_` la única
comparación, las dos en `Generador.gs`, con **tres consumidores cada una**:
`aplicarFiltroDeMarcador_`, `filtrarItemsPorSeccion_` y la rama `CAMPANAS` de `itemsDeSeccion_`
(inline). Los tres leían `f.campo` y los tres se actualizaron.

**Y el riesgo que `A.3` nombraba se cerró con una guarda, no con cuidado:** un llamador que
siguiera pasando el resultado entero a `valorPasaFiltro_` **no habría fallado** —`undefined ===
undefined` es `true` y todas las filas pasarían—. Ahora `valorPasaFiltro_` exige una condición
con `op` y **rompe diciendo qué recibió**. Tiene su propio caso de prueba.

**`A.4`, reportado y sin tocar:** los seis `enc_*` sobre `digital/Directa Mail` filtran
`mail_tipo=Convocatoria` y **no cortan por remitente**, mientras `mail_*` y `gcba_mail_*` de la
misma solapa sí (`mail_remitente=jorge.macri@…`). Puede que la iteración por encuentro ya acote
el universo, o puede faltarles la figura. **Es de la rama de validación.**

### Parte B — una lista de condiciones, no dos caminos

`parsearFiltro_` devuelve `{ok, vacio, condiciones:[…]}`. **Una condición sola es una lista de
uno**: no hay caso viejo y caso nuevo que puedan divergir — el mismo criterio que
`entraPorSolape_`, que tiene un solo camino con y sin fecha de fin.

**Se corta primero por `&&` y después por operadores**, en ese orden: al revés, un valor con
`&&` rompería el corte. Dentro de cada condición el orden de `OPERADORES_FILTRO_` no cambió.

**La decisión que con una sola condición no existía: qué pasa si UNA de las heredadas no mapea.**
Se ignora el filtro heredado **entero**. Con `n = 1` las dos opciones coinciden, así que es la
generalización estricta de lo de hoy; y aplicar el subconjunto haría que el mismo texto de
`SECCIONES.filtro` **signifique cosas distintas en cada solapa, en silencio**. Descartado:
aplicar las que mapean y anotar el resto — suena más útil y es exactamente el subconjunto que la
regla del filtro propio prohíbe dos párrafos antes.

### Parte C — el control de no-regresión, predicho y medido

**Predicción escrita antes de tocar el parser: los nueve dan idéntico.**

| filtro | leídas | antes | después |
|---|---|---|---|
| `figura=Jorge Macri` | 15 | 4 | **4** |
| `mail_tipo=Convocatoria` | 2174 | 353 | **353** |
| `mail_remitente=jorge.macri@…` | 2174 | 301 | **301** |
| `mail_remitente!=jorge.macri@…` | 2174 | 1873 | **1873** |
| `campana~=JM` | 26 | 4 | **4** |
| `campana!~=JM` | 26 | 22 | **22** |
| `dig_jm_gcba=JM` | 1297 | falla | **falla** |
| `dig_jm_gcba!=JM` | 1297 | falla | **falla** |
| `etapa=post` | 7 ítems | 2 | **2** |

**Cero diferencias**, y las trazas de `n = 1` salieron **byte a byte idénticas** — se comparó el
texto, no sólo el número, porque la traza es lo que va al reporte de corrida. Las dos que fallan
lo hacen por lo mismo que antes: `digital/Digital` está `uso = ignorar` por `R-22`, así que
`buscarMapeo` la rechaza. **Que sigan fallando igual es parte del control.**

**Los cinco casos de `Pruebas.gs` pasan, y el tercero es el que sostiene la elección de
separador:** la URL medida en los datos —`…photo?fbid=1447021517457493&set=p.1447021517457493`—
**no se parte**. Sin ese control, «`&&` y nunca `&`» sería una afirmación. Total: **12 pruebas**.

**Y el caso real, verificado sobre la solapa viva:** `nombre_campaña~=JM && estado=Activa &&
Plataforma=Meta` sobre `looker/DIGITAL` (966 filas en ventana) devuelve
`«FALTA:…@filtro_campo_no_mapeado» — el filtro declara `nombre_campaña` (**condición 1 de 3**) y
MAPEO no lo tiene`. **Es el fallo correcto**, dice cuál condición y es exactamente lo que el
prompt anticipaba en «Lo que sigue»: faltan las cuatro filas de `MAPEO` de `DIGITAL`.

### Parte D

`D-25` con las dos decisiones y los cinco descartados; `docs/TOKENS.md` §6 con la sintaxis y los
ejemplos reales; el comentario de `OPERADORES_FILTRO_` con la medición de los dos universos.

**Y una nota que este cambio dejó vencida y se corrigió en el momento:** `TOKENS.md` §4 decía
que la inferencia de solapa aplica «a menos bases de las que parece». Medido el 10/08 con
`solapasFuenteDeBase_`: `rdv` 2, `digital` 6, `looker` 3, `m2` 0. **Ninguna base tiene
exactamente una**, así que esa fila de la tabla no tiene un solo caso vivo.

### El hallazgo que quedó anotado y no se tocó

La rama `CAMPANAS` de `itemsDeSeccion_` **saltea en silencio un `SECCIONES.filtro` mal escrito**
(`if (fc.ok && !fc.vacio)`), mientras que `filtrarItemsPorSeccion_` —la rama `REUNIONES`— falla
con motivo. Dos comportamientos para el mismo error, y es de antes del `_24`. Se conservó tal
cual para no mover números; queda escrito en el código, arriba de la línea.

### Los cinco criterios de aceptación

| | |
|---|---|
| 1 · los 9 filtros vivos dan el mismo conteo | ✅ cero diferencias, y las trazas idénticas |
| 2 · los cinco casos en `Pruebas.gs` pasan | ✅ 12/12 |
| 3 · un valor con `&` simple no se parte | ✅ con la URL real medida en los datos |
| 4 · la herencia sigue siendo reemplazo | ✅ `filtroPropio \|\| filtro_seccion`, sin tocar |
| 5 · nada cableado, ninguna plantilla, `LAMINAS` intacta | ✅ |

---

## `N1` — el `_25`: las seis impresiones cableadas y el `P0` cerrado (2026-08-10)

Primera tarea de la corrida nocturna del `_26`. Corrida del
`docs/Prompts/2026-08-10_25_cablear_impresiones.md`, partes A a E. **Ninguna plantilla tocada,
`LAMINAS` intacta** (`verificarLaminas()` VERDE 51/51/51). Lecturas de las hojas y las bases vivas
el 10/08 entre las 22:10 y las 23:50 UTC.

### Parte A — las cuatro confirman

- **`A.1`** · `looker/DIGITAL` tenía **sólo** `clave_ventana` en `MAPEO`. Las cuatro que hacían
  falta no estaban.
- **`A.2`** · Sobre la solapa viva (4903 filas): `A Id cuentas · B Plataforma · C Impresiones ·
  D Visualizaciones · E Clics · F nombre_campaña · G eje · H area · I estado`. Las cuatro columnas
  son las que el prompt decía. **Y el tipo, medido sobre el valor crudo**: `Impresiones` es
  `number` en **4888** celdas, 15 vacías, **cero `string`** — que es lo que la Parte B pedía
  reportar antes de declarar `tipo_esperado`.
- **`A.3` / `A.4`** · De los ocho tokens, sólo existían `imp_total` y `gcba_imp_total`, los dos
  sobre `looker/resumen_metricas_dinamico`. **Nadie los tocó** desde que se anotó el `P0`.

**Y una alarma mía que la medición desarmó, que vale más que las cuatro confirmaciones.** Grepeé
`gcba_imp_meta`/`google`/`prog` en `docs/` y no aparecían: iba a frenar por cablear tokens que
ninguna plantilla usa (`D-17`). **Los tres existen** — están en la **lámina 3 de `jm`**, medidos
abriendo la plantilla. Lo que está incompleto es el inventario de `TOKENS.md` §2.0, que es una
foto del 07/08. **El instrumento equivocado era el grep sobre un `.md`; la plantilla es la
autoridad.**

### Parte C — las ocho predicciones aciertan y los tres controles cierran

Predicción escrita **antes** de cablear, sobre la ventana `2026-07-24 → 2026-07-30` (966 filas):

| token | filas predichas | medidas | importe |
|---|---|---|---|
| `imp_meta` | 16 | **16** | 2.091.730 |
| `imp_google` | 14 | **14** | 1.672.839 |
| `imp_prog` | 21 | **21** | 25.429.523 |
| `gcba_imp_meta` | 91 | **91** | 32.515.196 |
| `gcba_imp_google` | 94 | **94** | 50.773.340 |
| `gcba_imp_prog` | 146 | **146** | 165.787.851 |
| `imp_total` | 51 | **51** | 29.194.092 |
| `gcba_imp_total` | 331 | **331** | 249.076.387 |

| control | resultado |
|---|---|
| 1 · partición por plataforma | **delta 0** en importes y en filas, de los dos lados |
| 2 · JM + GCBA = total | `51 + 331 = 382` = las filas `Activa` · delta 0 en filas **y en importes** |
| 3 · ninguna fila en dos tokens | 0 en `Meta` y `Google ads` a la vez · 0 en JM y GCBA a la vez |

**Una premisa de `A.5` que la medición corrigió.** El prompt decía *"faltan las tres chicas y las
de plataforma vacía, que son las que `imp_prog` absorbe por resta"*. Medido: **del lado JM no hay
ninguna plataforma chica** —las 21 de `imp_prog` son todas `DV360`— y las chicas (`TikTok` 4,
`Twitch ` 3, `Mercado Libre` 2) están **todas del lado GCBA**. Y **no hay una sola celda de
`Plataforma` vacía** en la ventana. La regla por resta sigue siendo la correcta; lo que no existe
hoy es el caso que se usaba para ilustrarla.

### Parte D — el `P0`, y un número que se movió solo

`imp_total` y `gcba_imp_total` re-apuntados a `looker/DIGITAL` por `curarCamposMarcadores_`:
cuatro campos cada uno, **cero filas creadas**.

**El valor viejo se midió antes de pisarlo, y ahí apareció el dato del día:**

| | el `_22`, mañana del 10/08 | medido esa misma noche |
|---|---|---|
| `imp_total` | 6.084.893 (4 filas) | **3.958.570** (4 filas) |
| `gcba_imp_total` | 2.027.888 (22 filas) | **2.029.539** (22 filas) |

**Mismo marcador, misma fuente, mismo filtro, misma ventana, y `imp_total` bajó un 35 % en
horas.** No es un bug: es la base moviéndose, que es exactamente lo que la instrucción 1 del `_26`
advertía. **Queda en la nota de la fila**, junto con la fuente vieja, el recorte viejo y el
motivo del movimiento.

### El control de partición, en dos mitades y a propósito

- **Sintética, adentro de la suite** (`probarParticionImpresiones_`, 13/13 verde): diez filas que
  cubren los ocho valores de `Plataforma` medidos —`Twitch ` con el espacio incluido— más una
  plataforma que no existe, y cada una tiene que caer en **exactamente uno** de los tres. Prueba
  el **mecanismo** y no toca la planilla, que es el contrato de `Pruebas.gs`.
- **Viva, fuera de la suite** (`controlParticionImpresiones_`): lee los filtros **tal como están
  cableados en `MARCADORES`** y afirma la igualdad sobre las filas de la ventana. **La sintética
  sola no serviría** para lo que el prompt pide —*"el día que alguien convierta `imp_prog` en una
  lista, tiene que fallar acá y no en un deck"*—, porque no lee lo que está cableado. Corrida:
  `ok: true`, delta 0 en los dos grupos, y los ocho tokens sobre **una sola** fuente.

### Los cinco criterios de aceptación

| | |
|---|---|
| 1 · los tres controles de `C` cierran | ✅ delta 0 en los tres |
| 2 · ningún token de impresiones apunta a la dinámica | ✅ los ocho en `looker/DIGITAL/Impresiones` |
| 3 · el control de partición está en `Pruebas.gs` y pasa | ✅ 13/13, más el control vivo |
| 4 · las notas dicen qué valor tenían y desde cuándo | ✅ con los dos valores y el desvío del día |
| 5 · ninguna plantilla tocada, `LAMINAS` intacta | ✅ VERDE 51/51/51 |

---

## `N2` a `N4` de la corrida nocturna del `_26` — tres premisas caídas y una medición (2026-08-10)

### `N2` — no se cableó nada, y las dos premisas que lo frenan son de mecánica, no de datos

El `N2` corregido pedía re-apuntar `enc_impresiones`, `enc_alcance`, `frecuencia` y
`gcba_frecuencia` de `digital/Digital` a `looker/resumen_metricas_dinamico`, cableando
`enc_impresiones` y reportando la operación de los otros tres. **Se cableó cero, y está bien.**

**Premisa caída 1 — la dinámica NO se recorta por solape.** El `N2` decía que tiene
*"`fecha_periodo` + `fecha_fin_periodo` (solape)"*. Medido: tiene `fecha_periodo` (C) y
`fecha_fin` (D), pero **`fecha_fin_periodo` no está mapeado**, así que `leerFuente` informa
`criterio_ventana: "punto — la solapa no declara fecha_fin_periodo"`. Mapearlo movería el
universo de **todo** marcador de esa solapa, y eso es alcance de siembra: se reporta, no se
decide de noche.

**Premisa caída 2, y es la que mata el cableado — `enc_impresiones` y `enc_alcance` no son
re-apuntables sin tocar código.** `datosDeMarcador_` (`Generador.gs`) tiene la rama por cuenta
**adentro del `if` que pregunta si la base es `digital`**. Para cualquier otra base cae a la rama
general, que llama a `leerFuente` y **ignora `opciones.id_cuenta`**.

Los dos son tokens de la sección repetible `encuentro` —lámina 6 de `jm`, 8 de `secco`—, o sea
que se emiten **una vez por encuentro**. Re-apuntarlos a `looker` haría que **los seis encuentros
publiquen el mismo agregado de la ventana**. Es el número plausible en su forma más pura: seis
láminas con el mismo número grande y ningún error.

**`frecuencia` y `gcba_frecuencia` sí son agregados** —láminas 2 y 3, Resumen Ejecutivo— así que
no tienen ese problema. Los frena la otra pregunta, la que el usuario puso primero.

### La operación de `alcance` y `frecuencia`, medida — y la hipótesis se confirma

**`frecuencia` ES impresiones sobre alcance, fila por fila:** de las 3 filas JM comparables de la
ventana, **3 coinciden y 0 difieren**. La columna trae el valor **ya calculado por campaña**, que
es exactamente el caso que el usuario anticipó.

Y ahí está el problema, medido sobre las 4 filas JM del `2026-07-24 → 2026-07-30`:

| forma de agregar `frecuencia` | valor |
|---|---|
| `SUMA` | **30,878** — no significa nada |
| promedio simple | **7,72** |
| `RATIO` sobre los agregados (suma de impresiones sobre suma de alcance) | **20,56** |

**Tres formas, tres números, y entre el promedio simple y el ponderado hay 2,7×.** No hay forma de
elegir sin decidirlo.

⚠ **Y el `RATIO` agregado, tal como saldría hoy, está mal formado.** `alcance` viene **vacío en 1
de las 4 filas JM**, así que el cociente mete en el numerador una campaña que el denominador no
tiene: 3.958.570 sobre 192.538. El ponderado correcto se calcula sobre las 3 filas que tienen las
dos columnas. **Ese detalle no se ve en el número: 20,56 se lee perfectamente plausible.**

**`alcance`:** `SUMA` da 192.538 sobre 3 filas, y sumar gente única cuenta a la misma persona una
vez por campaña que la alcanzó. Confirmado además que **1 de 4 viene vacía**, así que la suma
tampoco está completa. **No se cableó.**

### `N3` — ya estaba hecho

`escribirColumnaLaminas_` **existe** (`Sellador.gs`) y su Parte B corrió el 10/08 con los seis
controles verificados, que están en la entrada del `_19` de esta misma bitácora. `N3` era la
verificación de cinco minutos que el propio `_26` anticipaba. **Cero cambios.**

### `N4.3` — premisa vencida, nada que hacer

El `_26` decía *"`ESCRITORES.md` sin fila `LAMINAS`, `tools/escritores.js` con diez hojas contra
las once de `ALCANCE_REGISTROS_`, **las tres listas divergen**"*. **Ya no.** `tools/listas.js`
devuelve *"OK — las tres listas coinciden en 11 hoja(s)"*, `HOJAS_REGISTRO` tiene las once
incluida `LAMINAS`, y `ESCRITORES.md` tiene su fila con los tres escritores declarados. Se cerró
el 10/08 con el `_19`. **Cero cambios.**

### `N4.1` — las 48 solapas en `ignorar`, medidas · **ninguna reclasificada**

Rango de fechas de cada una, con el detector que el motor ya tiene
(`detectarColumnasFechaEnSolapa_`, `Fechas.gs`), eligiendo la columna de mayor `pct_fecha` **con
rango plausible** — una columna `HORA` se guarda como 1899-12-30 y ganaría por porcentaje sin
decir nada del período.

**Las dos que el `_26` señalaba:**

| solapa | filas | columna | rango |
|---|---|---|---|
| `digital/Digital` | 1295 | `F · Fecha de fin` | **2024-12-23 → 2026-03-08** |
| `digital/CAMPAÑAS_DESGLOCE_DIGITAL` | 4904 | `I · Fecha inicio` | **2025-10-06 → 2026-08-10** (máx. de la solapa: 2026-08-31) |

- **`digital/Digital` sigue congelada respecto del período** —su dato más nuevo es de hace cinco
  meses, con la ventana en julio de 2026— así que **no vuelve a `fuente`**. ⚠ **Pero el número de
  `R-22` estaba viejo:** la regla dice *"sus filas JM llegan a dic 2025"* y hoy la solapa llega a
  **marzo de 2026**. Sigue congelada, con otra fecha.
- **`digital/CAMPAÑAS_DESGLOCE_DIGITAL` está viva** — tiene datos del período en curso. Cumple el
  criterio de `_26` §2 para volver a `fuente`. **No se tocó**, porque la corrección del `N2` bajó
  esto a medición y sacó la reclasificación de la cola.

**Y un hallazgo que no estaba buscado:** las cuatro solapas de `looker` en `ignorar` —`MAIL`
(5864 filas), `IVR` (195), `SMS` (97), `ALCANCE` (776)— **no tienen ninguna columna de fecha
detectable**, que es literalmente el motivo por el que `R-22` las apagó. **Hoy eso tiene solución
y no la tenía cuando se escribió la regla:** es el mismo caso de `looker/DIGITAL`, y `R-25`
—`ventana_ref` a `Cuentas`— existe desde hoy. Si tienen `Id cuentas`, son legibles. **Se anota; no
se hace acá.**

### `N4.2` — el `_21` no se ejecutó, y lo frena su propia regla de parada

Su §1 (las cuatro reglas de proceso) y §3 (qué decide Code solo) siguen siendo válidas — **de
hecho esta corrida entera se manejó con ellas**. Pero su §4 manda escribir la cola de §2 en
`PLAN.md` **como orden vigente**, y esa cola venció entera:

| el `_21` dice | hoy |
|---|---|
| 1 · el `_18` es el camino crítico | **cancelado** por la Parte E del `_22` |
| 2 · `_19` Parte B | **corrió** el 10/08 |
| 3 · `_20` | **corrió** el 10/08 |
| — · «las tres listas» congeladas | **ya coinciden** |

Escribirla sería *"escribir un dato que no ocurrió"*, que es **uno de los tres motivos de parada
que el propio `_21` §3 enumera**. Y el `_26` §N4 manda no empezar lo que no entra entero. **Se
reporta y no se toca.** Lo que sí conviene: reescribir §2 contra la cola de hoy, en su propio
prompt.

### Lo que agregó el `verificador`, y una regla que pisé sin citarla

El `_26` lo pedía antes de arrancar. **Lo lancé en paralelo a la ejecución en vez de antes**, así
que su propio reporte abre diciendo que las hojas se movieron mientras medía — y tiene razón: para
cuando terminó, el `_25` ya estaba cerrado y `A.1`, `A.3` y `A.4` habían dejado de sostenerse
**porque las volteó mi propia corrida**. Es exactamente *"una medición con dos cosas corriendo no
es una medición"*, cometido por mí sobre mi propia herramienta. Aun así trajo cuatro cosas.

**1 · ⚠ Auditar una solapa `ignorar` está prohibido por `CLAUDE.md` §2, y el `N4.1` lo hizo.** La
regla dice *"no se toca nunca. Ni se lee, ni se audita, ni se mapea, **ni se diagnostica**, ni se
la menciona en un reporte de hallazgos"*. El `_26` §2 abre la puerta —*"`uso = ignorar` deja de
ser intocable"*, decisión del usuario del 10/08— y mi corrección del `N2` retiró la
**reclasificación** pero dejó la **medición**. O sea: la medición estaba autorizada por el
usuario, **y la derogación de §2 no está escrita en ningún lado**. Eso es lo que hay que arreglar
— no la medición, que se pidió, sino que la regla siga diciendo lo contrario sin citar quién la
levantó. **Queda anotado acá y no se toca `CLAUDE.md` de noche.**

**2 · Antes de decidir CÓMO agregar `frecuencia` hay una duda previa sin resolver: cuál columna
es.** La nota de su propia fila de `MAPEO` dice *"M=frecuencia_total; existe también
`meta_frecuencia` en L — **elección sin confirmar con el equipo** (`DOC-3` Parte C)"*. La medición
de `N2` corrió sobre `M`. Si la buena fuera `L`, los tres números —30,878 / 7,72 / 20,56— cambian
todos. **Son dos preguntas apiladas, y la de abajo es del equipo.**

**3 · El movimiento del `N2` no sólo perdía el solape: lo perdía yendo de una solapa que sí lo
tiene a una que no.** `digital/Digital` —el origen— **tiene el par completo**: `fecha_periodo` en
`E` y `fecha_fin_periodo` en `F`, esta última con la nota *"`R-16` — extremo derecho del solape"*.
El destino no tiene el segundo. Dicho así es más fuerte que como lo escribí arriba: **el
re-apunte es una regresión de criterio de selección**, de solape a punto de inicio, y el `N2` lo
afirmaba al revés.

**4 · Si se escribe el resultado de la medición en `R-22`, va como addendum fechado.**
`REGLAS_NEGOCIO.md` es append-only con derogación fechada (`CLAUDE.md` §7): editar el texto de
`R-22` para corregir «dic 2025» → «mar 2026» sería editar una regla en su lugar. **No se hizo.**

**Y el dato que se confirma solo, por segunda vez en la misma noche:** el verificador leyó
`imp_total = 29.657.033` unas horas después de que yo midiera **29.194.092**, mismo marcador,
misma fuente, mismo filtro, misma ventana. **Van tres lecturas distintas del mismo número en un
día** (6.084.893 → 3.958.570 con la fuente vieja; 29.194.092 → 29.657.033 con la nueva). La
instrucción 1 del `_26` no era una precaución: era una descripción.

---

## `_27` bloques 1 a 4 — el panel, el selector de secciones y nueve marcadores (2026-08-11)

Prompt: `docs/Prompts/2026-08-11_27_plan_de_demo.md`, con el replanteo del usuario de los
bloques 2 y 3 hecho a mitad de corrida. **Ningún subagente**: el prompt no declara uno.

### Bloque 1 — el camino del usuario

**Premisa caída, y era la central: el Panel no existía.** `abrirPanel()` era un `// TODO (Paso 6)`
con cuerpo vacío, `Panel.html` tenía 10 líneas y `<body>` vacío, y `menuAbrirPanel_` —**el primer
ítem del menú**— devolvía un toast `'próximamente'`. Las cinco `panel_*` del encabezado de
`PanelBackend.gs` no existían. Con eso caían las otras dos premisas de 1.1: no había selector de
período (la ventana salía de `CONFIG` por la cadena de `D-20`) ni de informe
(`CONFIG.informe_activo`, o sea **editar una celda** para pasar de `jm` a `secco`).

Se reportó y se paró antes de la primera edición. **Decisión del usuario: construir el panel
mínimo.**

- **`panel_getEstado()`** — informes, períodos, secciones repetibles y la ventana que saldría hoy,
  en **una** llamada. La ventana se resuelve con `resolverVentana({})`, **la misma cadena que va a
  usar la corrida**, y no leyendo `CONFIG.periodo_desde` a mano: mostrar la celda sería
  reimplementar el motor peor, que es el borde de `CLAUDE.md` §4.
- **`panel_generar()`** — genera y devuelve el reporte ya presentable.
- **`fechaLegible_`** envuelve a `formatearFecha_`, que llama a `Utilities.formatDate` y **tira con
  `null`**: sin eso, una fila de `PERIODOS` con la fecha mal tipeada volteaba `panel_getEstado()`
  entero y el panel no se pintaba.
- **El selector de período no se arma sólo con `PERIODOS`.** Sus dos filas son de junio y **ninguna
  es la ventana en uso**: la opción por defecto va primera, con las fechas puestas.

**1.2 · los faltantes como raya.** `textoFaltante_(token, comoRaya)` — opción de corrida
(`opciones.faltantes_como_raya`), nunca default. `=== true` y no truthy: la opción entra desde un
checkbox, desde un JSON y desde un query string, y `"false"` es truthy.

**La contraparte es estructural y no una promesa:** la función sólo decide el texto de la caja; los
tres puntos que la llaman empujan su fila a `faltantes` en la línea de al lado. **Verificado, no
razonado:** la corrida de `secco` en modo raya escribió las **289 filas** de `FALTANTES` igual. El
reporte devuelve `presentacion_faltantes` para que dentro de una semana una raya no se lea como un
dato.

**1.3 · el reporte.** El renglón del menú decía `83 con valor de 159 · 207 en FALTA`, y **`207 >
159` se lee como un bug que no existe**: `159` son tokens distintos del deck expandido y `207` son
filas de `FALTANTES`, que se escriben una por token **y por ítem** (`CLAUDE.md` §4). Dos unidades
en la misma frase. Ahora cada número dice de qué es, el link va **arriba de todo** y el desglose
`46 resueltos / 7 sin dato / 4 en error` —que sólo estaba en el JSON— se ve. **No se suma nada:**
`reemplazados + faltantes` parece el total de impresiones y no lo es, porque `R-18` punto 3 escribe
una fila para un token que **sí publicó**.

### Bloque 3 — el selector de secciones, y la premisa que la medición volteó

`D-27`. Cuatro corridas del mismo trabajo dieron **316 / 204 / 220 s**, y la de **menos** secciones
tardó **más** que una de tres. `campana` cuesta **0 s**: no tiene ítems. **El riesgo de timeout es
real y la causa no es `campana` — es varianza de latencia.** `D-28`, con las tres mediciones,
porque ése es el dato que hace falta el día que alguien quiera subir el techo, y el techo casi no
se puede subir (Apps Script corta a los 6 min; `presupuesto_corrida_seg` ya está en 350).

Costo medido por sección: `encuentro` 72-114 s (5 ítems), `comunicaciones_post` 33-45 s (2),
`campana` 0. La suma es **menor** que el total de la corrida y tiene que serlo: copiar la
plantilla, el mapa, la etapa 4 y el cierre no son de ninguna sección, y repartirlos inventaría un
número.

### Bloque 2.1 — los 4 errores son 2

`frecuencia` y `gcba_frecuencia` re-apuntados por **`curarCamposMarcadores_`** (12 celdas, **cero
filas creadas**) de `digital/Digital` —que es `ignorar` por `R-22`, así que publicaban
`solapa_no_fuente`— a `looker/resumen_metricas_dinamico`, `RATIO dig_impresiones/alcance`
(`V-68`/`V-69`).

| | valor | filas |
|---|---|---|
| `frecuencia` | 21,46 | 4 de 26 |
| `gcba_frecuencia` | 1,63 | 22 de 26 |

**Se sacó `estado=Activa`** aunque `imp_*` lo usa: con ese filtro las únicas 2 filas `Activa` de la
ventana son las dos JM y `gcba_frecuencia` daba **0 de 26**. Un par complementario con una mitad
vacía no es un universo. Sin él la partición cierra: 4 + 22 = 26.

⚠ **El número tiene un defecto conocido y no se arregló:** `alcance` viene vacío en 1 de las 4
filas JM, así que el numerador incluye una campaña que el denominador no tiene — el hallazgo que ya
había dejado el `N2`. **21,46 se lee perfectamente plausible.** Marcado `SIN VALIDAR — demo 12/08`.

### Bloque 2.2 — M2, y las láminas escondidas eran otras

**El reporte de corrida numera sobre el DECK EXPANDIDO.** Las «15 y 24» son, en la plantilla, la
**10 y la 19** (+5 por la expansión). Verificado contra `LAMINAS`, que marca `escondida = sí`
exactamente en `orden_plantilla` 10 y 19.

- **Lámina 9 — visible, 8 tokens `m2_*`.**
- **Lámina 10 — escondida, 23 tokens `m2_*` distintos.**
- **Ningún token está en las dos.** No es un bloque viejo duplicado: es un detalle más granular,
  apagado. **Ninguna plantilla tocada.**

Siete marcadores nuevos por **`curarMarcadores_`** (57 → 64 filas, cero quitadas) sobre
`digital/Directa Mail`, filtro `mail_tipo~=M2`. **Eso destrabó una premisa vencida:** `X-12` decía
que el clasificador *"NO es expresable en `MARCADORES.filtro`: soporta `=` y `!=`, no CONTIENE"* —
**el `_24` trajo `~=`**. Fue decisivo, porque `m2/M2 periodo DIRECTA` está como `referencia` y
`buscarMapeo` exige `fuente`: cablear ahí habría reproducido el error del 2.1.

`m2_mails_enviados` 1.442.363 · `m2_mails_entregados` 1.424.241 · `m2_aperturas` 407.862 ·
`m2_clics` 12.663 · `m2_or` 28,6 % · `m2_ctor` 3,1 % · `m2_envios` CONTEO. Todos `SIN VALIDAR`.

**`m2_campanias` quedó sin cablear a propósito:** es cantidad de campañas distintas y
`OPERACIONES_` no tiene DISTINCT. Un `CONTEO` de filas habría dado un número plausible y
equivocado.

### Bloque 4 — por qué las láminas de encuentro difieren: es el dato

Los 6 tokens que tienen las cinco son `ecv_*`, de `rdv`. Los 11 extra de Orden Público son `enc_*`,
de `digital/Directa IVR` y `Directa Mail`. Medido con el contexto de ítem de cada cuenta:

- **3387-JULJDGGC** (Orden Público) → `enc_audiencia` = 78.637 sobre **2 filas** de `Directa IVR`
- **3354-JULJDGAG** (San Cristóbal) → **0 filas**; el motor dice *"sin dato, no cero"*

Correlaciona con `REUNIONES`: **Orden Público es `tipo = Encuentro Temático`** y los otros cuatro
son `Uno a uno`. El temático tiene campaña de IVR/mail en la ventana; los barriales no.
`enc_impresiones` y `enc_alcance` fallan en **los cinco** —apuntan a `digital/Digital`— y son los 2
errores que quedan. **No se cableó nada para emparejarlas.**

### `campana` queda como está, y el motivo va escrito

`CAMPANAS` tiene **3 filas, las tres del seed y las tres `informe_id = secco`**: dos con
`periodo_id` vacío (excluidas por `D-19`) y `prov_uber` con `mostrar = no`. **No hay ni una campaña
de `jm` cargada.** No es un bug del motor y no se siembra hoy: cargar `CAMPANAS` es **decidir
contenido**, y sus nueve sub-secciones opcionales están en estado `revisar`.

### `secco` fuera de alcance, medido y no opinado

`MARCADORES` tenía 57 filas y **las 57 eran de `jm`**; `secco` tiene cero. Su deck sale con 289
huecos y un valor (`{{periodo}}`). El panel lo dice solo: `panel_getEstado` cuenta marcadores por
informe y el selector muestra **"· a desarrollar"** cuando son cero.

### `panel_ultimasCorridas()` — el lector que faltaba

Nace de un problema real: una llamada de generación volvió en HTML y **no había forma de saber si
había llegado a correr**, porque `CORRIDAS` era la única hoja de registro sin ningún lector
(`verificarObjectIdDeCorrida_` exige el `corrida_id` que justamente falta cuando la llamada se
cae). Sólo lectura.

**El deck huérfano quedó identificado: `jm-20260811-132254`, deck
`166MdMSmtkFJT18OOc_wqIWsycgOWG31LU5BQ4xJf1A8`** — la única fila **sin cerrar**, sin
`fecha_generacion` y sin conteo. **No es el de la demo**, y los dos ids empiezan parecido.

### Verificación

Pruebas del diff **13/13**. `verificarLaminas()` **VERDE 51/51/51**. `controlParticionImpresiones_`
delta **0** en importes y filas de los dos grupos. Deck de la demo: **`jm-20260811-135342`**, 226 s,
sin corte, sin fallo, instrumento limpio, **92 impresiones con valor** (eran 83) y **55 ok / 7 sin
dato / 2 error** (eran 46/7/4).

---

## Tres semanas de junio en `PERIODOS`, y una sonda que midió el mes equivocado (2026-08-11)

Pedido: un segundo deck de `jm` sobre una semana vieja, para mostrar que el motor corre
cualquier período y no sólo el de la ventana activa.

**`junio_sem1/2/3` entran por `SEED_PERIODOS_`** —viernes-jueves, 05-11, 12-18 y 19-25/06—
porque **el seed es el único escritor declarado de `PERIODOS`** (`ESCRITORES.md`). El seed
declara las cuatro columnas de la hoja, así que `upsertPorClave_` no blanquea nada: la
advertencia del handoff sobre tocar el seed de `PERIODOS` se verificó antes de escribir.
`aplicarSeedConfiguracion_` escribió **3 filas nuevas y cero cambios** en `BASES`, `MAPEO`,
`CONFIG` e `INFORMES`.

### ⚠ La sonda barata no servía, y el error es el de siempre

Para no gastar una corrida de 4 minutos por semana se sondeó con
`resolverMarcadores('jm', {periodo_ref: 'junio_semN'})`. Las cuatro sondas —el mes entero y las
tres semanas— dieron **exactamente `55 ok / 7 sin dato / 2 error`**, y los valores salieron
**idénticos entre sí**.

**No era un hallazgo: era el instrumento.** La traza lo decía con todas las letras —
`2026-07-24–2026-07-30 (config)`. **`resolverMarcadores` no honra `periodo_ref` en sus
opciones**: cada marcador resuelve su propia cadena de `D-20` con el `periodo_ref` de **su fila
de `MARCADORES`**, y con todas vacías cae a `CONFIG`. Las cuatro sondas midieron **julio**.

El único instrumento válido es **`generarInforme(informeId, periodoId)`**, que resuelve el
`periodoId` contra `PERIODOS` y baja `{ventana}` a la etapa 4. Es otra vuelta del patrón de
`CLAUDE.md` §4: el instrumento propio reprodujo la cadena de ventana que el motor ya tiene, y la
reprodujo mal. **Lo delató que tres semanas distintas dieran el mismo número** — no que fallara.

### El deck de junio, verificado contra el deck y no contra el reporte

`jm-20260811-173139` · `vie 12/06 — jue 18/06` · `origen periodo_ref:junio_sem2` · 178 s, sin
corte. **96 impresiones con valor y 194 filas de `FALTANTES`, contra 92 y 198 del deck de julio:
junio tiene MENOS huecos, no más.** Ninguna solapa snapshot le comió la base.

Los números se leyeron **del deck** con `verificarObjectIdDeCorrida_`, porque el reporte ya había
mentido una vez esa tarde:

| token | julio 24-30/07 | junio 12-18/06 |
|---|---|---|
| `ecv_inscriptos` | 2307 | 1152 |
| `imp_meta` | 2.215.327 | 314.241 |
| `mail_envios` | 838.571 | 247.759 |

**Las otras dos semanas de junio no se generaron:** la segunda alcanzó y sobró, y el criterio de
descarte —"si sale con muchas más rayas, no se recomienda"— no se activó.

---

## `_31` / `_31.1` / `_31.3` / `_31.4` — corrida nocturna: el período elige los encuentros (2026-08-11/12)

**Parte A (censo).** `rdv` entre 01/06 y 11/08, `Figura = Jorge Macri`: 99 filas, 77 descartadas.
Diez semanas con encuentros; la de **12–18/06 tiene 4 y barrios disjuntos de julio**, y por eso es el
segundo período. Lámina 5: 31 tokens, 19 con fila. Escondidas de `jm`: 5 (`L-034`), 10 (`L-039`),
19 (`L-048`) — `contarAnclasDeLaminas()` las contaba y no las listaba.

**Parte B.** Alta de `julio_24_30` por `SEED_PERIODOS_`. Backfill de `periodo_id` en las 7 filas de
`REUNIONES` y alta de Villa Urquiza (julio) y los 4 de `junio_sem2`. **`leerReuniones_` filtra por
`periodo_id`**, y el período **sale del `origen` de la ventana** (`periodo_ref:<id>`) en vez de
sumar un parámetro a cuatro firmas: ese dato ya viajaba. **Sin override no se filtra y el retorno lo
dice** — deducirlo del rango sería la *"semana adivinada"* que `R-21` prohíbe. El `origen` entra en
la clave del caché de anclaje: dos períodos con el mismo rango seleccionan temarios distintos.

**`curarCamposReuniones_`** es nueva y necesaria: el único escritor declarado de `REUNIONES` sólo
agrega filas, así que el backfill no tenía camino. Clave por `texto_original` porque `orden` queda
vacío sin prefijo `N)`.

**Parte G — `bajaConfianza` era una exclusión silenciosa.** `anclarEncuentros` devuelve tres listas
y `itemsDeSeccion_` concatenaba dos. Ahora se lista con puntaje, umbral y puntero a
`ANCLAJE_PENDIENTE`. **Sigue sin emitirse y eso es correcto:** el ancla decide qué fila de `rdv` se
lee, así que emitirlo publicaría barrio, inscriptos y población de una fila que el motor no está
seguro de haber acertado.

**Parte H — Almagro no entró, y se ve por qué.** Recargado como `Encuentro Temático Educación 16/06`
para anclar por `evento`, como Orden Público→Belgrano. Volvió a caer: **puntaje 0,54 < 0,6**. Por el
`_31.4` no se insiste y **no se toca el umbral**: bajarlo para que entre es fabricar el resultado.

**Parte C — tres de seis.** `ivr_75`, `ivr_75_pct` e `ivr_marque1` cableados sobre `digital/Directa
IVR`, calcando la forma de `ivr_at_pct` (cada porcentaje del embudo es la etapa sobre la anterior).
⚠ **Los tres `cc_*` NO se cablearon: `looker/CC` no tiene ni una fila en `MAPEO`.** El `_31.1` los
daba por *"fuente que ya existe"* y no la hay — `V-64`/`V-65`/`V-66` midieron a mano, fuera del
motor. Cablearlos habría publicado un error, no un valor.

**Partes E/F — la lámina 7 no se cableó.** 32 tokens `post_*` con sufijo 1-4, **cero con fila**.
Llenar slots posicionales pide una operación que el motor no tiene, igual que `ecv_barrio1/2/3` y
`m2_campanias`. Sería 100 % en `—`, muy por encima del tercio: se reporta y no se toca.

**Parte D — dos decks.** Julio `jm-20260811-234158` (246 s, 6 encuentros, 110 impresiones con
valor); junio `jm-20260811-234622` (120 s, 3 encuentros, 97). **Barrios disjuntos** y **lámina 5
presente en los dos** — el usuario la desmarcó durante la noche y las corridas lo confirman
(`escondidas [16,25]` y `[12,21]`).

---

## `resumen_metricas_dinamico` se recorta **por punto, no por solape** — 12/08/2026

**Leído sobre la solapa viva el 12/08/2026.** No es un problema de Call Center: **es de la solapa**,
y alcanza a **todo marcador que la lea**, incluidos los que hoy publican bien.

`MAPEO` tiene `fecha_periodo` apuntando a `fecha_inicio` (col C) y **no tiene
`fecha_fin_periodo`**. `leerFuente` lo informa con todas las letras —`criterio_ventana: "punto — la
solapa no declara fecha_fin_periodo"`—: entra la fila cuyo **inicio** cae dentro de la ventana.
**Una campaña que arrancó antes y siguió corriendo los siete días no entra.**

**El caso testigo, con los números medidos:**

| | |
|---|---|
| cuenta | `3289-JUNJDGAG` — *PRIMERA PERSONA \| JM \| PAULA PARETTO 27/7* |
| `fecha_inicio` / `fecha_fin` | **17/07** → **20/08** |
| `call_discado` / `call_contactados` | **6011** / **1878** |

Es **la única cuenta de Call Center con datos de esa semana**, y la ventana `24–30/07` **la deja
afuera**. Las cuatro cuentas JM que sí entran tienen `call_enviado`, `call_discado`,
`call_contactados` y `call_efectivos` **en cero**.

**Consecuencia inmediata, ya decidida (`_32.2`):** `cc_base`, `cc_contactados` y `cc_contact_pct`
publican `—` y no se cablean. Un cero ahí se leería como *"hubo cero llamados"*, que es una
afirmación falsa sobre el mundo; una raya dice *"no tengo el dato"*, que es verdad. **Deja de ser un
pendiente de cableado y pasa a ser un pendiente de semántica de ventana**, que tiene otro dueño.

**Las dos salidas, las dos descartadas para hoy y ninguna descartada para siempre:**

1. **Mapear `fecha_fin_periodo` → `fecha_fin` (col D).** Es una fila de `MAPEO` y arregla el
   criterio de raíz — es lo que `R-16` ya fija para las solapas que sí lo declaran. ⚠ **Mueve el
   universo de TODOS los marcadores de esta solapa**, incluidos `frecuencia` y `gcba_frecuencia`,
   que hoy publican 21,46 y 1,63. No se hace a tres horas de una demo.
2. **Un `periodo_ref` propio para los tres `cc_*`.** Es inventarles un recorte, que es justo lo que
   el `_31.4` prohíbe.

⚠ **Y una hipótesis, anotada como hipótesis y no como conclusión.** `C-22` está abierto porque *el
universo del total JM de `frecuencia` no cierra* —ninguna forma de agregar reproduce el 11,9
publicado—, y `frecuencia` **lee esta misma solapa**. **El recorte por punto es candidato a
explicarlo:** si campañas que corrieron toda la semana quedan afuera por haber arrancado antes, el
denominador y el numerador salen de menos filas de las que el deck contempló. **No se verificó**, y
la prueba vive en la ventana de validación, no en el motor.

### Addendum — 12/08/2026: el solape se midió, y la puerta no abre

**El `_33` Parte A midió lo que a este hallazgo le faltaba, y el resultado invierte la conclusión
tentativa de arriba.** Simulado en memoria, **sin tocar `MAPEO`**: `punto` = `fecha_inicio` dentro de
la ventana; `solape` = `fecha_inicio ≤ hasta` **y** `fecha_fin ≥ desde` (`R-16`).

**Primero, el alcance real: son DOS marcadores, no todos.** Sólo `frecuencia` y `gcba_frecuencia`
leen `resumen_metricas_dinamico`. El `_32.2` supuso un radio mayor; medido, es exactamente el par
que ya publicaba.

| ventana · corte | criterio | cuentas | impresiones | alcance | frecuencia |
|---|---|---|---|---|---|
| 24–30/07 · JM | punto | 4 | 4.528.060 | 192.538 | 23,52 |
| 24–30/07 · JM | **solape** | **11** | **39.209.552** | 548.507 | **71,48** |
| 24–30/07 · GCBA | punto | 22 | 2.034.955 | 1.246.075 | 1,63 |
| 24–30/07 · GCBA | **solape** | **81** | **728.872.658** | 43.141.903 | **16,89** |
| 12–18/06 · JM | punto | 2 | 3.653.312 | 36.610 | 99,79 |
| 12–18/06 · JM | **solape** | **14** | 54.342.788 | 810.539 | 67,05 |

**Por qué no abre, y el criterio es el que el `_33` fijó — explicable, no sólo chico.** Lo que entra
por solape **no son las campañas de la semana**: son campañas de larga duración que llevaban meses
corriendo. Entre las que aparecen sólo por solape hay ids `SEPEPHGC` —de septiembre— y `MAYJDGAG`
—de mayo—. En GCBA las impresiones se multiplican por **358**. Eso no es *"entran las que estuvieron
activas toda la semana"*: es *"entra el año entero"*.

**Y la hipótesis sobre `C-22` queda refutada, que era el punto de haberla anotado como hipótesis.**
`C-22` está abierto porque `frecuencia` no reproduce el **11,9** publicado. Con punto da 23,52; con
solape, **71,48**. **El solape aleja, no acerca.** El recorte por punto **no explica `C-22`**.

**Consecuencia:** los `cc_*` siguen en `—` y el `_32.2` sigue siendo la última palabra. `call_discado`
y `call_contactados` sólo aparecen con solape —0 en los dos cortes bajo punto—, así que cablearlos
exigiría exactamente el cambio que esta medición desaconseja.

**Lo que sí queda cerrado:** mapear `fecha_fin_periodo` en esta solapa **no es la solución**, y ahora
hay un número para decirlo en vez de una precaución. Si algún día se necesita el solape, hará falta
además acotar por duración de campaña o por estado, que es una decisión de negocio y no de mapeo.

---

## `seg_expansion` — dos mediciones, y una proyección que no tenía respaldo (2026-08-12)

**Esto es una medición, no una conclusión, y por eso queda escrito con los dos números y no con lo
que parecen decir.**

| corrida | leída | sección | ítems | `seg_expansion` |
|---|---|---|---|---|
| `jm-20260811-234158` | 11/08 ~23:45 | `encuentro` | 6 | **72 s** |
| `jm-20260812-104104` | 12/08 ~10:44 | `encuentro` | 3 | **36 s** |
| `jm-20260812-110746` | 12/08 ~11:10 | `encuentro` | 6 | **36 s** |

**Lo que queda asentado, y es lo único que estos números sostienen:**

1. **La proyección de ~144 s no tenía respaldo.** Se construyó el 12/08 duplicando los 72 s del
   11/08, sobre el supuesto —**deducido, no medido**— de que expandir escala lineal con la cantidad
   de láminas duplicadas. La medición siguiente dio **36 s con los mismos 6 ítems**, o sea la mitad
   del número que se tomó como base.
2. **Dos puntos no alcanzan para afirmar que expandir es barato.** Que 3 ítems y 6 ítems den los dos
   36 s **sugiere** que `seg_expansion` depende menos de la cantidad de láminas de lo que se supuso,
   y no lo demuestra: son dos lecturas, del mismo día, sobre la misma plantilla.
3. ⚠ **El 72 s del 11/08 era el extremo alto de un rango y se usó como si fuera el valor.** Es el
   mismo error que `D-28` describe para el total de la corrida —316 / 204 / 220 s para el mismo
   output— aplicado a una sección.

**La próxima decisión sobre `CONFIG.presupuesto_corrida_seg` se toma con estos números y con los que
se agreguen, no con una deducción sobre cómo debería escalar.** Cada corrida los publica en
`tiempos_por_seccion`; sumarlos a esta tabla cuesta nada.

---

## `enc_evento` y `ecv_barrio` comparten caja de texto — 12/08/2026

En la lámina de detalle de `encuentro` (orden 6 de la plantilla de `jm`) los dos tokens viven en
**la misma caja**: `Estrategia de comunicación:{{ecv_barrio}} / {{enc_evento}}`. Por eso
`verificarObjectIdDeCorrida_` devuelve el mismo string para los dos — lee el elemento, no el token.

**Hoy no es un error y no se toca.** Pero **la carátula por ítem los necesita separados**:
`ecv_barrio` se queda en el detalle y `enc_evento` va a la carátula. Separarlos es parte de armar la
lámina nueva, no un arreglo aparte.

---

## `_37` Parte A — el token pide dos cosas distintas, y mi A.3 midió mal (2026-08-12)

**A.1 · La premisa del `Paso-2.13` se sostiene, y la caja lo dice sola.**

| informe | lámina | caja, literal |
|---|---|---|
| `secco` | `L-014` (orden 14) | `"{{m2_campanias}} Campañas"` |
| `jm` | `L-038` (orden 10) | `"{{m2_campanias}}"` — **el token solo** |

En `secco` es inequívocamente un **conteo**. En `jm` la caja no lleva palabra, así que **por sí sola
no dice** si es lista o conteo.

**Lo que sí lo dice es la caja de al lado, y es el hallazgo del día:** en `jm`, `m2_envios` vive en
`"{{m2_envios}}Campañas"` y el deck `jm-20260812-110746` publica ahí **`25Campañas`**. O sea que en
`jm` **el conteo de campañas ya lo publica `m2_envios`**, y `m2_campanias` —solo en su caja— queda
como el que pide la **lista**. Los dos tokens tienen los roles cruzados respecto de sus nombres.

**A.2 · `m2_campanias` no tiene fila en `MARCADORES`** para ningún `informe_id`. `secco` no tiene
ninguna fila cableada.

**A.3 · ⚠ MI MEDICIÓN ESTÁ MAL Y LA DETECTÓ EL MOTOR.** Reporté 2187 filas en ventana, 722 pasando
`mail_tipo~=M2`, 641 distintos crudos y 636 plegados. **El motor publica `25`.**

**El instrumento reprodujo lógica del motor y la reprodujo peor**, que es el patrón de `CLAUDE.md`
§4 por sexta vez. `BASES.digital.modo_periodo = snapshot` **a propósito** —sus solapas usan fecha de
inicio con lead de 3 a 7 días—, así que `leerFuente` **devuelve todas las filas de todos los
períodos** y el recorte por ventana lo hace `datosDeMarcador_` después, sobre `datos.filas`, con
`recortar_por_ventana: true`. `diagDistintos_` llamó a `leerFuente` y contó sobre el universo entero.

**Los tres números de A.3 no sirven y no se usan.** La diferencia crudos/plegados (641 vs 636, cinco
pares) tampoco vale: está medida sobre el universo equivocado.

**Consecuencia: la Parte B no puede decidir con lo que hay.** Le falta el único dato que su decisión
necesita —cuántas campañas distintas hay en la ventana **recortada como la recorta el motor**— y
obtenerlo con un diagnóstico propio es repetir el error. La vía correcta es al revés: la operación
nueva la calcula, y el número se lee del deck.

## `_38` Parte A — el censo del enlace: la ventana no recorta nada, y faltan filas (2026-08-12)

**Instrumento nuevo, sólo lectura:** `diagEnlaceDigitalDeEncuentros_(periodoRef)` en `Auditoria.gs`.
Ancla los ítems del período y, para cada cuenta anclada, cuenta las filas de las cinco solapas de
canal **dos veces** —con la ventana de la corrida y con una ventana 2020–2030—.

**Las tres causas del prompt, medidas sobre los seis ítems de `julio_24_30`:**

- **Sin cuenta enlazada: cero casos.** Los seis anclaron, ninguno cayó en `sinLink` ni en
  `bajaConfianza`. Cinco con puntaje `1.00`, Villa Urquiza con `0.81`.
- **La ventana deja filas afuera: cero casos.** `con_ventana` y `sin_ventana` dieron **idénticos en
  las 30 celdas**. Era lo esperable —`digital` es `snapshot` y la rama por cuenta de
  `datosDeMarcador_` no lleva `recortar_por_ventana`— pero se midió en vez de deducirse.
- **Cuenta enlazada sin filas: la causa real**, y es por solapa, no por ítem. San Cristóbal
  (`3354-JULJDGAG`) y Retiro (`3346-JULJDGAG`) traen **cero filas en Mail, SMS e IVR**. Villa
  Urquiza trae 3 de Mail; Orden Público, 5 de Mail y 2 de IVR.

**Y una cuarta causa que el prompt no tenía: el token.** De los 30 tokens de la lámina modelo
(`L-035`, orden 7), **8 no tienen fila en `MARCADORES`** —los cuatro `enc_ll_*`, `enc_base_llamada`,
`enc_base_total`, `enc_alcance_pct`, `enc_alcance_potencial`—. Salen `—` sin que el enlace digital
participe.

**⚠ Un cero de la unión no es un cero de la cuenta.** La primera versión del instrumento publicó
`Digital: 0` para las seis cuentas. No era el dato: `digital/Digital` es `uso = ignorar` (`R-22`) y
`buscarMapeo` devuelve `«FALTA:dig_id_cuenta@solapa_no_fuente»`, así que **la unión no adjunta esa
solapa a ninguna cuenta**. El instrumento se corrigió para decirlo antes de contar. Es el mismo
patrón de §4 —verificar el crudo del que salió la etiqueta— cazado esta vez antes del reporte.

**Hallazgo al costado, medido:** `digital/Alcance` **sí tiene** la fila de San Cristóbal —`Alcance
1412`, `Frecuencia 17,78`, campaña `1 A 1 JM | 23/7 SAN CRISTÓBAL`— y ningún marcador de la lámina
la lee. `enc_alcance` apunta a `Digital/dig_alcance`, que es la solapa congelada en 2025. No se
tocó: el prompt prohíbe cablear.

---

## La carátula por ítem funciona — `jm-20260812-164443` (2026-08-12)

**El control de la Parte B pasó leyendo el deck: seis pares carátula+detalle, no seis y seis.**

```
sl 6  carátula  Villa Urquiza    Encuentro "Primera Persona" con Paula Pareto
sl 7  detalle   Villa Urquiza
sl 8  carátula  San Cristóbal    "1 a 1"
sl 9  detalle   San Cristóbal
sl10  carátula  Retiro           "1 a 1"
sl11  detalle   Retiro
sl12  carátula  Belgrano         Encuentro Temático "Orden Público" – Eje Norte
sl13  detalle   Belgrano
sl14  carátula  San Cristóbal    "1 a 1"
sl15  detalle   San Cristóbal
sl16  carátula  Retiro           "1 a 1"
sl17  detalle   Retiro
```

**Cada carátula trae el `enc_evento` y el `ecv_barrio` de la lámina que le sigue**, y los seis
`enc_evento` dan **tres valores distintos**, con los pares pre/post repitiendo por compartir fila de
`rdv`. Es exactamente lo esperado.

### `seg_expansion` — cuarta lectura, y la primera con dos láminas modelo

| corrida | leída | ítems | asignaciones | `seg_expansion` | `seg_items` |
|---|---|---|---|---|---|
| `jm-20260811-234158` | 11/08 ~23:45 | 6 | 6 | 72 s | 32 s |
| `jm-20260812-104104` | 12/08 ~10:44 | 3 | 3 | 36 s | 59 s |
| `jm-20260812-110746` | 12/08 ~11:10 | 6 | 6 | 36 s | 34 s |
| **`jm-20260812-164443`** | **12/08 ~16:48** | **6** | **12** | **38 s** | **76 s** |

**Lo que agrega esta lectura, y sigue sin ser una conclusión:** con **el doble de láminas
duplicadas** —12 asignaciones contra 6— `seg_expansion` pasó de 36 a **38 s**. `seg_items`, en
cambio, **sí escaló**: de 34 a 76 s, que es lo esperable porque son 12 slides a pintar en vez de 6.

**La proyección de ~144 s que el `_35` descartó habría errado por un factor de cuatro.** Cuatro
lecturas sostienen que **expandir depende mucho menos de la cantidad de láminas que pintar**, y que
el costo real de duplicar un bloque está en `seg_items`. Sigue siendo un patrón observado sobre una
sola plantilla y cuatro corridas del mismo día.

Total de la corrida: **227 s** de un techo de 350, sin corte. Contra los 146 s de
`jm-20260812-110746`, los 81 s de diferencia son casi exactamente el salto de `seg_items` (+42) más
el resto de la corrida.

---

## `_39` — `enc_alcance` cambia de solapa, y `ULTIMO` deja de elegir por posición (2026-08-12)

**Parte A · la premisa vencida, citada.** La fila de `enc_alcance` decía, textual: *"cableado 04/08 —
ambiguedad Digital/dig_alcance vs Alcance/alc_alcance resuelta por coherencia con enc_impresiones
(misma solapa y misma fila)"*. Esa coherencia **ya no sostiene nada**: `digital/Digital` es
`uso = ignorar` (`R-22`, congelada en diciembre de 2025) y `enc_impresiones` tampoco publica. Se
alineaba con un marcador que no funciona.

`digital/Alcance` en vivo: `usoSolapa_` devuelve `fuente`, `buscarMapeo(alc_alcance)` devuelve la
columna `B`. La puerta abre.

**A.3 — el alcance de los seis ítems, leído por la rama por cuenta de verdad.** El instrumento llama
a `datosDeMarcador_` con una fila de marcador simulada, no saca el valor de `alc_filas` a mano: la
pregunta es qué le llegaría a un marcador re-apuntado, y contestarla salteando el despachador sería
medir otra cosa.

| ítem | `id_cuenta` | filas | valores |
|---|---|---|---|
| Villa Urquiza | `3289-JUNJDGAG` | 2 | 157.580 · 145.669 |
| San Cristóbal (pre y post) | `3354-JULJDGAG` | 1 | **1.412** |
| Retiro (pre y post) | `3346-JULJDGAG` | 1 | **47.753** |
| Orden Público | `3387-JULJDGGC` | 2 | 66.345 · 457.883 |

**A.4 — no hay rama `looker` en `datosDeMarcador_`.** Las dos ramas por ítem son `rdv` (línea 241) y
`digital` (251); lo demás cae al fallback general. Un marcador de `looker` dentro de una lámina de
encuentro publicaría el agregado de la ventana en las seis, que es el bug que `_28` arregló para
`rdv`. Queda nombrado, sin implementar.

### El bloqueo que el prompt no anticipaba, y la guarda

**`digital/Alcance` no tiene columna de fecha** —ni mapeada ni en la hoja: sus seis columnas son
`ID Cuentas`, `Alcance`, `Frecuencia`, `eje`, `area`, `nombre_campaña`—. Así que el `ULTIMO por
fecha` del 12/08 no aplica y `opULTIMO` caía a *"por POSICIÓN"*.

**Y `3387` y `3289` traen dos filas idénticas en las seis columnas salvo el número.** No hay
columna que las discrimine: ningún filtro puede separarlas.

| `id_cuenta` | Alcance | Frecuencia | impresiones implícitas |
|---|---|---|---|
| `3387-JULJDGGC` | **66.345** | 14,18 | ≈ 940,7 k |
| `3387-JULJDGGC` | 457.883 | 2,05 | ≈ 941,0 k |

Las impresiones implícitas coinciden en los dos casos: son **dos definiciones del mismo hecho**, no
dos campañas. Y `D-06` (`casos_validacion_2026-07-31`) valida la primera — *"enc_alcance 65576, base
31/07 = 66345"*. **Por posición se habría publicado 457.883**: 7× más grande, plausible, con el
rótulo correcto al lado.

**La guarda cierra la mitad que le faltaba al arreglo del 12/08.** Mismo criterio y mismo umbral que
el empate por fecha: **sin fecha utilizable y con valores distintos, no se elige** —
`«FALTA:@ultimo_sin_fecha_ambiguo»`. Radio de acción medido antes de escribirla: `rdv/RVD JM-CM - ES`
(col E) y `digital/Directa Mail` (col F) sí tienen `fecha_periodo` y van por la rama de arriba;
`digital/Alcance` es la única solapa sin fecha con un `ULTIMO` encima.

**⚠ Y el control positivo decía una cosa y probaba otra.** `Pruebas.gs:456` afirmaba *"ULTIMO saltea
la celda vacía del final"* corriendo sobre `[10, 5, '']` — pasaba porque `5` es el último con valor,
o sea que probaba **elegir por posición**. Son dos afirmaciones distintas; ahora van separadas, con
un fixture cada una, más la guarda y su contraste. **Las 13 pruebas pasan.**

Se afirma sobre `valor` y la traza, **no sobre el flag `ambiguo`**: `despacharOperacion_` rearma el
sobre y no lo propaga — tampoco el de la rama por fecha, que ya existía.

### Parte C — dos corridas, una por deck

| | julio | junio_sem2 |
|---|---|---|
| corrida | `jm-20260812-172902` | `jm-20260812-174147` |
| deck | `1K7z5uNT0E_54z22zNUt7fTDL52scCRGlSQtrkruIp2U` | `1estvqWRoOwTrBoNP9r4yEjodY2eqE5SMiW49PkujUgY` |
| reemplazados | **126** (122 en `164443`, 116 en `110746`) | **104** |
| gastado | 148 s de 350 | 203 s de 350 |
| pares | **6** | **3** |

**Control de julio, leído del deck:** seis pares carátula+detalle; `enc_alcance` publica **1.412** en
San Cristóbal (sl9 y sl15) y **47.753** en Retiro (sl11 y sl17), distintos entre sí; Villa Urquiza y
Belgrano salen `—` **por la guarda**, que es el comportamiento diseñado y no una falta.

**Control de junio:** tres pares —Boedo, Mataderos, Boedo "1 a 1"—, barrios disjuntos de los de
julio. `Educación 16/06` sigue sin anclar por `D-29`.

Los +4 de julio (122 → 126) son exactamente los cuatro `enc_alcance` que la guarda deja pasar.

### Lo que queda nombrado y no se hizo

**La rama por cuenta para `looker`**, contraparte de las de `rdv` y `digital`. Destraba los 8 tokens
sin fila del `_38` más `enc_impresiones`. **No se cablea ninguno hasta que exista**: sin la rama
publicarían el agregado de la semana en las seis láminas.

**Cuál de las dos filas de `Alcance` es la buena** para `3387` y `3289`. Hasta que se decida, las dos
láminas publican `—` con motivo en la traza.

---

## El patrón: una prueba verde que prueba lo contrario de lo que dice (2026-08-12)

**Vale más que el arreglo que lo destapó, así que se anota como patrón y no como un fixture
corregido.**

`Pruebas.gs:456` decía:

```js
afirmar_(despacharOperacion_('ULTIMO', ctx).valor === 5,
  'despacho: ULTIMO saltea la celda vacía del final');
```

`ctx` traía `[10, 5, '']`. La prueba **pasaba**, y había pasado en todas las corridas desde que se
escribió. Pero `5` es *el último valor no vacío*, así que lo que la afirmación verificaba era
**"ULTIMO elige por posición"** — el rótulo decía una cosa y el fixture probaba otra. Las dos
afirmaciones son compatibles con ese dato y por eso nadie las vio separarse.

**Lo grave no es que estuviera mal: es que estaba verde.** Cuando el `_39` fue a arreglar
`opULTIMO` —para que sin fecha utilizable y con valores distintos **no elija**—, la prueba se puso
roja. Leída al pie de la letra, decía *"rompiste el salteo de la celda vacía"*, que era falso: el
salteo seguía intacto. Lo que se había roto era la afirmación no escrita, la que la prueba
verificaba de verdad.

**Por eso una prueba así es peor que no tenerla: bloquea el cambio correcto y lo hace con la
autoridad de un control que venía pasando.** Una prueba ausente deja el terreno libre; una prueba
que miente cobra un peaje justo cuando alguien va a mejorar la cosa que ella dice cuidar. El costo
no se paga cuando se escribe, se paga meses después y lo paga otro.

**Cómo se detecta**, que es lo único accionable: **un fixture cuyo dato satisface más de una
afirmación no distingue entre ellas.** `[10, 5, '']` no separa "saltea el vacío" de "elige el
último". `[5, 5, '']` sí: pasa con el salteo y es indiferente a la posición. La pregunta que hay
que hacerle a un control verde no es *"¿pasa?"* sino **"¿con qué otro dato seguiría pasando, y
qué afirmación distinta estaría probando ahí?"**

Quedó partido en dos fixtures —uno por afirmación— más la guarda nueva y su contraste. Las 13
pruebas pasan. **Es el primer caso registrado de un control positivo del repo que era falso, y lo
destapó un cambio de comportamiento, no una lectura.** Ninguna de las verificaciones del proyecto
lo miraba, igual que pasó con "de qué filas sale el número" el 07/08.

---

## `_40` — censo de la base nueva: coincide en IVR y Mail, difiere en Call Center e impresiones (2026-08-12)

Censo de sólo lectura de `Base reuniones - Digital - Call Center`
(`12b0v67FbxjuIndK7DgVU3MYxx-k0yBIS9gtyV45rFaY`, dueño `jpcofano2@gmail.com`). **No se dio de alta
la base**: no se tocó `BASES`, `SOLAPAS`, `MAPEO` ni un marcador, y los dos decks vigentes quedaron
intactos. Termina en reportar, que es lo que el prompt pedía.

**Las seis mediciones "desde afuera" del prompt reproducen exactas sobre la copia viva**: 152 filas
de datos, encabezado en la fila 2, `ID` único, cuatro solapas, 44 columnas, fechas 05/07/2025 →
14/08/2026, **una** con fecha futura. El `.xlsx` que circuló nunca llegó a esta sesión, así que la
comparación contra el export **no se hizo y no se reporta como hecha**.

### Cuatro premisas del prompt que el repo desmiente

- *"los 6 ítems de julio"* son 6 ítems pero **4 cuentas**: San Cristóbal y Retiro entran dos veces,
  `pre` y `post`, con el mismo `id_cuenta`.
- *"los 4 ítems de `junio_sem2`"*: **3 tienen `id_cuenta`**. `Boedo 17/06` sale `sinLink`
  (`@homonimo_sin_desempate`) y `Educación` ancla en `bajaConfianza` con 0,54.
- El token se llama **`enc_e75`**, no `enc_75`.
- ⚠ *"4726 contra 6011 son dos definiciones distintas del mismo hecho"* — la diferencia es real
  pero **no es un caso: son 28 de 49 celdas**. Y la cita venció: `V-64` explicaba el 6011 como
  `4726 + 1285` sobre `looker/CC x Cuentas`, **solapa que hoy no existe**; medido en vivo sobre
  `resumen_metricas_dinamico` hay **una sola fila** para `3289`, con `call_discado = 6011` de una
  pieza. Es el patrón del 07–08/08 otra vez: un dato medido una vez, citado tres, ya falso.

### Lo que coincide y lo que no

Las **7 cuentas ancladas tienen fila** en `Agenda JM`; ninguna falta. Sobre 70 celdas —7 cuentas ×
10 tokens— **15 coinciden, 1 difiere, 53 las tiene sólo la base nueva y 1 sólo el motor**. Las 42
de Call Center caen del lado "sólo la base" porque **el motor no tiene fila en `MARCADORES`** para
ninguno de los seis: es el hueco de 8 tokens que ya traía el `_38`.

**IVR coincide en las 7 cuentas, celda por celda.** **Mail coincide exacto** con
`digital/Directa Mail` en las tres donde el motor publica. **Impresiones coincide en 1 de 7** y
**Call Center en 3 de 7, y los tres son ceros**.

### La ambigüedad de `digital/Alcance` tiene respuesta, y son dos fuentes independientes

`looker/resumen_metricas_dinamico.meta_alcance` y `Alcance manual` de la base nueva **coinciden en
6 de 7 cuentas**, y en los cuatro casos ambiguos **las dos eligen la primera** de las dos filas de
`digital/Alcance`: `3289` 157.580, `3387` **66.345** —el valor que el caso `D-06` anota como base
del 31/07—, `3201` 20.876, `3178` 104.438. La excepción es Retiro (`3346`): la base dice `0` y las
otras dos `47.753`, y esa fila trae **todo el bloque digital en cero**.

### Tres cosas que aparecieron midiendo y no estaban en el prompt

1. **Boedo publica un número que ninguna otra fuente tiene.** El motor imprime `258.684` para
   `3156`; la base nueva y looker traen la celda **vacía**. La guarda del `_39` no lo tapa porque
   una de las dos filas está vacía y `ULTIMO` se queda con la otra.
2. **Orden Público publica ~1/6 de sus mails.** El deck dice `44.043` enviados; la base nueva
   `271.118` y looker `272.283`. Es `ULTIMO` eligiendo una de tres filas `Convocatoria` en vez del
   envío del encuentro. **No depende de dar de alta ninguna base**: es un defecto vivo en
   `enc_mails_*`, con el deck de la demo publicado.
3. **`Habitantes` es el string `"Revisar"` en 14 de 152 filas** —las 13 de eje más `Pendiente`— y
   ahí `% Cobertura` sale `0`. Es el corolario numérico de que `Barrio / Comuna` trae el eje: **29
   filas no son un barrio** (13 de eje, 15 de comuna, 1 `Pendiente`).

### Los tres reemplazos, medidos

- **`Alcance manual`**: sí resuelve la ambigüedad, en 6 de 7. En Retiro la empeora.
- **`Impresiones Meta / Google / Programm`**: parten `Impresiones totales` **exacto en las 7**, pero
  **no derogan `R-24`** —y no se derogó nada acá—. Parten un total que difiere del de looker en 6
  de 7, y tres columnas fijas **no absorben una plataforma nueva ni un `Twitch ` con espacio**, que
  es el motivo escrito de la regla.
- **¿Alcanza un filtro por `ID`?** **No, y esto contradice al prompt.** `datosDeMarcador_` cablea la
  rama por cuenta a `fila.base_id === 'digital'`; una base nueva cae a `leerFuente`, que lee la
  solapa entera **sin el contexto del ítem**. Y `parsearCondicionFiltro_` toma el valor **literal**:
  no hay marcador de posición para el `id_cuenta` del encuentro que se emite, así que un `ID=…` en
  `MARCADORES.filtro` sería el mismo texto en las seis láminas. Hace falta una tercera rama, o que
  el ruteo por cuenta pase a ser declarativo — la dirección de `D-01`.

### El instrumento

Cinco funciones nuevas en `Auditoria.gs`, todas de sólo lectura: `diagPlanillaExterna_`,
`diagFormaDeSolapaExterna_`, `diagFilasDeSolapaExterna_`, `celdaDeCenso_` y
`diagMarcadoresDeCuenta_`.

**Por qué un lector propio y por qué no es reimplementar el motor:** los lectores del motor
resuelven la planilla por `base_id` contra `BASES`/`SOLAPAS`/`MAPEO`, y esta planilla **no está
registrada** — darla de alta para poder mirarla es la decisión que el censo tenía que informar, no
anticipar. Cae del lado bueno del borde de §4: se compara la salida del motor contra un hecho
externo que el motor todavía no puede ver.

**Y `diagMarcadoresDeCuenta_` existe por un error que casi entra al reporte.** La primera pasada de
A.3 leyó el deck con `diagTextoDeDeck_` y apareó etiqueta con número a ojo. El texto de una lámina
llega **aplanado por recorrido de formas**, y etiqueta y valor viven en cajas distintas: en
`sl7` la lectura ingenua daba *"Alcance Potencial 91.563"* cuando el `91.563` es de
`Habitantes del Barrio`. Aparearlos es adivinar. El instrumento le pregunta a `resolverMarcadores`
—que **es** el motor, no una copia— y por eso la respuesta no depende de cómo estén acomodadas las
cajas. Contraste: los valores que devuelve para `3387` (`44.043`, `43.439`, `4.652`, `145`)
coinciden con los que sí se leen sin ambigüedad en `sl13` del deck.

---

## `_42` — los hallazgos del censo a `PENDIENTES`, y uno de ellos era falso (2026-08-12)

La entrada de arriba dejó los cuatro hallazgos del `_40` **sólo en la bitácora**, que es el dueño de
*qué se hizo y cuándo* y no de *qué sigue abierto* (`CLAUDE.md` §7). Un hueco anotado sólo acá se
pierde. Van a `docs/PENDIENTES_consistencia.md`: un addendum fechado a la sección de
`digital/Alcance` y tres secciones nuevas. **No se creó ningún archivo, no se tocó `R-24`, no se
decidió ninguna regla de `Alcance`.**

### El hallazgo que era falso, y es mío

**"Orden Público publica ~1/6 de sus mails" no es un defecto, y el repo tenía la respuesta antes de
que yo lo escribiera.** `MARCADORES.enc_mails_enviados` lleva `filtro = mail_tipo=Convocatoria` con
`ULTIMO`, y **la nota de esa misma fila** —fechada 11/08, confirmada hoy contra la hoja viva— dice
el número y el motivo con todas las letras: *"la lámina toma el envío de convocatoria, no el total
de la cuenta (271.701 en 5 envíos contra los 44.043 publicados) … con el filtro quedan 3
convocatorias y `ULTIMO` toma la del 25/07, que es la publicada"*. **`44.043` es el valor
validado.**

**Lo que falló no fue la medición: fue no cruzarla contra el registro que ya la explicaba.** El
`_40` midió bien —`Agenda JM` dice 271.118 y `looker` 272.283— y de ahí saltó a *"el deck publica
1/6"* sin preguntar **de qué filas sale** el 44.043. Es exactamente la convención de §4 que este
proyecto ya tiene escrita, aplicada al revés: se verificó que el número de la base existiera y no
que el número del motor estuviera mal.

**Y la señal estaba a un grep de distancia**, en la columna `notas` de la fila del marcador. El
snapshot `docs/_snapshots/MARCADORES_2026-08-11.tsv` la trae entera. Detalle que vale por sí solo:
**ese mismo snapshot ya está viejo para `enc_alcance`** —lo muestra apuntando a `Digital/dig_alcance`,
que el `_39` cambió el 12/08—, así que sirvió para confirmar el filtro de mail y **no** habría
servido para nada que tocara alcance. Un volcado envejece por columna, no de golpe.

**El hallazgo sigue siendo útil, dado vuelta:** las cuatro fuentes miden cuatro cosas distintas
—44.043 el envío de convocatoria; 271.701 el total de la cuenta en `digital/Directa Mail`; 271.118
en `Agenda JM`; 272.283 en `looker`— y **los tres agregados difieren entre sí**, así que ni siquiera
hay un "total de campaña" único. Consecuencia para la decisión de alta: **una columna de mail de la
base nueva que contradiga al motor no es evidencia de defecto, mide otra cosa.**

⚠ **La entrada del `_40` no se edita** — la bitácora es append-only y ésa es la regla. La corrección
vive acá, en `PENDIENTES_consistencia.md` y en `HANDOFF_CODE.md`.

### Dos correcciones más, chicas y con consecuencia

**`meta_alcance` coincide en 6 de 7, no en 7 de 7.** El 28/49 siempre estuvo bien y así quedó en la
bitácora; el desglose de esa línea se dijo mal en el reporte de chat y **se arrastró al prompt del
`_42`**, que lo repetía como premisa. Falla `3346` (Retiro): la base dice `0` y `looker` `47.753`.

**Y `3346` degrada a la base nueva como testigo.** Esa fila trae **todo el bloque digital en cero**
—impresiones, alcance potencial, las tres plataformas—, así que su `0` parece falta de carga y no
una medición. No se puede leer una celda suya como dato sin mirar si el bloque está cargado.

### Lo que el addendum de `digital/Alcance` agrega, y por qué no cierra nada

Las cuentas con dos filas **son cuatro, no dos**: se suman `3201` (20876 / 47999) y `3178`
(104438 / 452030) a las dos que la sección ya listaba. Los dos testigos coinciden entre sí en 6 de 7
y **en los cuatro casos ambiguos eligen la primera fila**.

**Y aun así no alcanza para escribir la regla**, por un motivo que conviene dejar dicho: **"la
primera" es orden de lectura de la solapa, no una propiedad del dato.** Alguien reordena las filas y
la regla cambia de respuesta **sin que nada falle** — sería peor que la candidata que la sección ya
rechaza. De paso, esa candidata también cae: *"siempre la menor"* vale para `3387`, `3201` y `3178`,
pero en `3289` los dos testigos eligen **la mayor**. Lo que falta sigue siendo la columna que
discrimina, y no la tiene el motor.

### Boedo, el único defecto vivo que quedó en pie

`3156` publica `enc_alcance = 258.684` en `jm-20260812-174147`. Grepeado `258684` y `258.684` sobre
`docs/` entero, **incluidos los tres CSV de casos**: cero apariciones fuera de la salida del propio
motor. **Tiene origen —la segunda fila de `digital/Alcance`— pero ningún testigo**, y los dos que
aparecieron dicen que la celda está vacía. Se escribió así y no como *"un número que no tiene de
dónde salir"*, que es como lo pedía el prompt: sí tiene de dónde salir, y confundir las dos cosas
mandaría a buscar el bug en el lugar equivocado.

**La guarda del `_39` no lo tapa, y ésa es la parte accionable:** `opULTIMO` exige **dos valores
distintos** para devolver `«FALTA:@ultimo_sin_fecha_ambiguo»`. Con una fila vacía y una con valor
hay **uno solo**, y lo toma sin dudar. **La guarda cubre el empate y no cubre el hueco.**

---

## `_46` — la lista de mails sale del código, y el panel queda en `/exec` (2026-08-13)

**Partes B y C.** La Parte A fue sólo lectura y disolvió dos de sus cinco preguntas.

`API_AUTORIZADOS_` —un array con un solo mail cableado en `Api.gs`— pasa a
`CONFIG.mails_autorizados`. Mismo argumento que `umbral_anclaje_reunion` en el Paso 2.9F: sumar a
alguien es operación, no lógica, y no puede exigir `clasp push`. Es la **pieza 1 de `D-16`**; las
piezas 2 y 3 siguen abiertas.

**Falla cerrada con motivos distinguibles**, que es la mitad del trabajo: `config ilegible`,
`clave ausente` y `lista vacía` rechazan las tres y dejan traza propia. Sin default de código, a
diferencia de `umbralAnclajeReunion_` — sobre la puerta de entrada, un default convierte un error
de lectura en un acceso concedido.

### Dos premisas del prompt que el repo desmintió

**A.3 pedía confirmar que `tools/api.js` postea sin sesión de Google, y postea con.** Manda
`Authorization: Bearer` derivado por `tools/token.js` del refresh token de clasp
(`jpcofanogcba1@gmail.com`, verificado con `--info`). Y pega a `/dev`, que no es un despliegue: es
HEAD, restringido a cuentas con permiso de edición sobre el script. Por las dos vías, cambiar
`access` no podía romperlo — **el intercambio que el prompt mandaba a decidir no existía**.

**A.5 preguntaba si un proyecto admite dos despliegues con `access` distinto, y la pregunta era la
equivocada.** `clasp list-deployments` devolvió **uno solo**, el `@HEAD` implícito que sirve `/dev`.
La API no usa un despliegue. Sólo había un `access` que configurar, el del panel.

Medido después del push, que era el único residuo abierto: con `access: ANYONE`, `/dev` sigue
devolviendo JSON de nuestro propio código. Si Google lo hubiera cortado, la respuesta habría sido
HTML antes de correr una línea.

### El error de orden, que es lo que hay que recordar

**El sembrador de `CONFIG` se alcanza sólo pasando la barrera, y la barrera exige la clave que el
sembrador escribe.** Se pusheó la barrera antes de sembrar y la API quedó cerrada para todos,
incluido el dueño. La traza lo dijo con todas las letras —`barrera 1: CONFIG no tiene la clave
mails_autorizados`—, o sea que el diseño funcionó exactamente como se pidió; lo que falló fue la
secuencia.

**La salida correcta era en dos fases:** pushear `Instalar.gs` solo, sembrar por la API, y recién
después pushear la barrera de `Api.gs`. Los dos caminos alternativos se probaron y ninguno sirve:
`clasp run` pide que el proyecto esté desplegado como API executable, y no lo está; el token de
`tools/token.js` no tiene scope de Sheets. Lo destrabó el usuario desde el menú.

**La regla general, que aplica a cualquier barrera futura:** una guarda que lee configuración se
despliega **después** de que esa configuración exista, y hay que preguntarse antes si el camino que
la sembraría pasa por la guarda.

### Lo desplegado

`appsscript.json`: `ANYONE_ANONYMOUS` → `ANYONE`. Despliegue nuevo `@1` sobre `/exec`, con
`executeAs: USER_DEPLOYING` sin tocar. Probado con Bearer de la cuenta dueña: HTTP 200 sirviendo
nuestro `doGet`, no un error de Google ni un login.

---

## `_48` — el deck corresponde al período, y la interfaz deja de hablar en interno (2026-08-13)

### Parte A — la barrera nunca ve el mail

Medido: con la segunda cuenta, el panel devuelve `sin identidad`. O sea que
`Session.getActiveUser().getEmail()` vuelve **vacío** con `executeAs: USER_DEPLOYING` sobre
cuentas de consumidor, y la lista de `CONFIG` **está bien cargada y bien leída** — se verificó
aparte que `apiListaAutorizados_` parsea los cuatro mails íntegros desde la celda real, así que
la hipótesis del separador raro queda descartada.

**`D-15` ya había decidido esto, y por este motivo exacto**: *"con ejecutar como: yo sobre
cuentas Gmail personales, `getActiveUser()` suele volver vacío y el filtro deja de servir"*. El
`_46` Parte C desplegó con `USER_DEPLOYING` sin marcar que contradecía a `D-15`.

**Decisión del usuario: el acceso queda como está** —`USER_DEPLOYING`, `access: ANYONE`, la
lista en `CONFIG`—. Hoy entra el dueño y con eso alcanza para mostrar. La identidad de las otras
cuentas se decide más adelante, con `D-15` y su precondición `T4.1` sobre la mesa. **No es un
bug abierto: es una decisión postergada a propósito.**

⚠ **`T4.1` sigue sin medirse.** Pedía medir `getActiveUser()` con *"ejecuta el usuario que
accede"*; lo del 13/08 se midió con *"ejecuta yo"*. Confirma **por qué** `D-15` eligió como
eligió, no que la otra opción funcione.

De paso, la instrumentación que lo destapó: el rechazo del panel ahora muestra un **código de
motivo** en pantalla —sin ningún mail, ni el de quien entra ni los de la lista— y manda el mail
al log. Sirve porque `clasp logs` no anda: el proyecto no tiene un GCP propio configurado.

### Parte B — la causa era una columna que el backend no devolvía

`CORRIDAS` guarda `periodo_id` desde siempre y `panel_ultimasCorridas` no lo devolvía, así que
`corridaPrevia()` cruzaba **sólo por informe** y tomaba la más nueva. Cambiar el período no
cambiaba el deck ofrecido. El comentario del código lo decía con todas las letras —*"sin
`panel_getPeriodos` no hay forma de cruzar por período"*— y era falso: la columna estaba ahí.

**Una premisa propia que se cayó al medir, y conviene dejarla escrita.** `abrirCorrida_` escribe
`periodoId || ventana.origen`, así que la columna tiene **dos vocabularios**: un id de `PERIODOS`
o la etiqueta de origen de la cadena que resolvió el período. Se dio por hecho que las corridas
sin período explícito traerían `config`, y se escribió el emparejamiento contra eso. **Medidas,
las cuatro corridas reales traen ids** (`julio_24_30`, `junio_sem2`): con el selector en "por
defecto" ese emparejamiento no habría encontrado nada. La forma correcta es buscar el período
registrado **cuya ventana coincide** con la que el motor resolvería hoy, y caer a la etiqueta
sólo si ninguno coincide.

Es el patrón de siempre: la corrección no salió de releer el código, salió de mirar los datos.

### Parte D — la premisa no se reproduce

`panel_getEstado()` devuelve **las mismas tres secciones repetibles** para los dos informes:
`encuentro`, `comunicaciones_post` y `campana`. **`jm` no trae menos que `secco`.** Así que la
pregunta que el prompt planteaba —¿es `SECCIONES` (dato) o `seccionesRepetiblesDe_` (código)?—
no tiene caso: no hay diferencia que explicar. Si el selector aparece en uno y no en el otro, la
causa está en otro lado. **No se tocó nada**, como pedía el prompt.

Dato al pasar: `jm` tiene **78** marcadores cableados (eran 57 el 11/08) y `secco` sigue en cero.

### El conteo que llegó al final y cambió el arreglo

Medidas **las 51 filas** de `CORRIDAS`, no las cuatro del muestreo:

| `periodo_id` | filas |
|---|---|
| `config` (etiqueta de origen) | **37** |
| `julio_24_30` | 7 |
| `junio_sem2` | 7 |
| vacío | **0** |

Ocho corridas sin cerrar. **Ninguna fila vacía**, así que la regla *"una corrida con `periodo_id`
vacío no empareja con nada"* es defensiva y hoy no aplica a ningún dato — se implementó igual.

**Lo que sí cambió el arreglo: el caso raro es el dominante.** El emparejamiento tenía un fallback
a la etiqueta de origen para cuando ningún período registrado coincidiera con la ventana por
defecto. Con 37 filas en `config` —y el período real de cada una indeterminable, porque depende de
qué decía `CONFIG` ese día— ese fallback ofrecería la más nueva de las 37 como si fuera del período
elegido. **Es abrir el deck equivocado**, que es literalmente lo que la vía rápida existe para
evitar. Se sacó: sin coincidencia no se ofrece deck y se muestra el formulario. Cuesta una
generación de más en vez de una reunión.

El muestreo de cuatro filas decía lo contrario del universo de 51, y las cuatro eran las más
nuevas —las únicas generadas con período explícito—. **Un muestreo por recencia no es un muestreo.**

---

## `_4` — las cuatro decisiones sueltas escritas, y el alta de solapas frenada por falta de censo (2026-08-14)

### Parte A — los destinos, medidos contra el archivo

- **Último `R-NN` = `R-25`.** `R-26` **está reservado y libre**: lo pide
  `docs/Prompts/2026-08-13_1_R-26_uno_a_uno_solo_digital.md`, que **no se ejecutó** — no aparece
  ni una vez en `REGLAS_NEGOCIO.md`. El alcance de Meta toma **`R-27`**, y la regla lo dice en su
  encabezado para que el hueco no se lea como error.
- **Último `S-NN` = `S-04`.** Libre: **`S-05`**.
- **Ninguna de las cinco estaba escrita.** Grepeadas una por una en su destino antes de agregar:
  `sólo lo lee quien lo desarrolla` y `lector externo` → cero en `docs/*.md`; `Alcance Meta` →
  sólo en `PENDIENTES` como medición y en el prompt; `u1_bench` → una sola línea en
  `CONFIG_INFORMES.md:631`, y es una `[?]` abierta, no la decisión; `desfasaje` / `día después` →
  cero en `CONFIG_INFORMES.md` y en `PLAN.md`.
- **La forma de `SUPUESTOS.md`** es la tabla de cinco columnas —ID, supuesto, evidencia, síntoma
  que lo desmiente, cómo se revierte—. Respetada.

### Parte B — las cuatro que tenían todo el material

1. **`S-05`** — el deck sólo lo lee quien lo desarrolla. Supuesto **de etapa**. La columna de
   reversión lista las tres decisiones que hoy se toman a su amparo (lámina sin cablear, sin
   compatibilidad hacia atrás, `«FALTA:»` crudo en vez de `---`) y **ninguna se toca**: quedan
   escritas para que el día que el supuesto caiga se encuentren.
2. **`R-27`** — el alcance lo aporta sólo Meta. Es regla y no preferencia porque lo dice la
   estructura de `reuniones/Base_Digital`: bandas `Alcance Meta Convocatoria` y `Alcance Meta
   Post`, **y ninguna banda de Google ni de Programmatic**. Con su consecuencia: la banda
   `Acumulado` de la POST **está mal rotulada** (Retiro `47.753` sale de `Base_Digital!Z`,
   verificado celda a celda). Y con qué la desmiente, que es lo que la vuelve falsable.
3. **`CONFIG_INFORMES.md §1.9`** — el desglose por herramienta es sólo de `jm`, con el pendiente
   de la lámina de `secco` al lado y sus **tres salidas posibles, ninguna elegida**.
4. **`CONFIG_INFORMES.md §2.0`** — SECCO repite casi todo JM, a veces con un día de desfasaje.
   Con las dos consecuencias: **no genera tokens nuevos** (misma medida, otra ventana, y la
   ventana ya se resuelve por informe) y es el argumento a favor del vocabulario global, **que el
   `_2` va a medir en vez de darlo por cierto**.

### ⚠ El punto 5 no se ejecutó — el alta de las 20 solapas de `reuniones`

**No es una decisión de alcance mía: falta el dato.** El prompt dice *"Ya está todo medido"* y
pide una nota por fila con *"la medición y su fecha, no el veredicto"*. **Esa medición no está en
el repo.** El censo lo produjo la Parte A2 del `_1` (`d8925be`, `1b622ef`) y su reporte quedó en
la conversación: de las 20 solapas, el repo nombra **tres** —`Desglose impresiones`, `Métricas
digital`, `Digital | Base Post`, las excepciones del Addendum 2— y **ninguna de las otras 17**.
Grepeado en `docs/`, `*.gs` y `tools/`.

Sin la lista no hay forma de escribir 19 filas `ignorar` con el motivo concreto de cada una, y
**inventar el motivo es exactamente el modo de falla que el prompt viene a evitar**: una nota que
no se puede verificar en noviembre es indistinguible de una regla, que es lo que revirtió
`CAMPAÑAS_DESGLOCE_DIGITAL` esta semana.

**Dos cosas más que hay que resolver antes de escribir, y que no dependen de mí:**

- **El Addendum 2 del `_1` pide medir las tres excepciones *antes* de clasificarlas**, y esa
  medición tampoco está registrada. El `_4` da por hecho que dieron *"0 de 25 Uno a uno"*.
- **El Addendum 2 dice con todas las letras: *"El alta de `SOLAPAS` es una decisión del usuario y
  se confirma antes de escribir."*** Así que aunque apareciera la lista, la confirmación es un
  gate del usuario, no un trámite.

**Discrepancia de conteo, anotada porque el número entra en la escritura.** El Addendum 2 del
`_1` dice *"las otras 17 van a `ignorar`"*; el `_4` dice **19**. Con 24 solapas totales —el
número que el propio Addendum 2 usa— y 4 ya registradas, las nuevas son **20**: `Base_Digital` en
`referencia` + 3 excepciones + **16** = 20. **El `_4` es el que cierra** (3 + 16 = 19 en
`ignorar`); el "17" del Addendum 2 está corrido en uno.

### Cierre

- `tools/listas.js` — **OK, las tres listas coinciden en 11 hojas.** Esperado: no se agregó
  ninguna hoja de registro. Se corre igual porque el prompt lo pide como cierre.
- **Un solo commit, de documentación.** El de configuración —`SEED_SOLAPAS_` en `Instalar.gs`—
  no existe porque su punto quedó frenado.

---

## `_5` — el orden de los frentes a `PLAN.md`, y cuatro ítems que ya estaban hechos (2026-08-14)

### Parte A — lo que la lectura encontró antes de escribir

**§2 no era una lista plana**, y eso cambió cómo se escribió la Parte B: está organizada en
**tramos** (`T2.x`…`T5.x`) más el bloque de sellado de `D-23`, Higiene y dos notas de terreno.
La lista de 13 frentes **no reemplaza los tramos**: entra al frente de §2 como el orden, y los
tramos quedan abajo como la especificación de cada pieza. Retirarlos habría tirado el texto que
dice **qué** es cada cosa para conservar sólo **cuándo**.

**Cuatro ítems cumplidos que el plan no marcaba** — un plan con ítems hechos adentro deja de
leerse:

| ítem | cuándo | evidencia |
|---|---|---|
| `T2.1.1` — el reloj y el corte | 06/08 | cerrado por verificación humana |
| `T2.1.2` — el cierre se escribe siempre | 07/08 | `N2`, también cuando algo explota |
| `T2.4` — los cuatro objetivos contra un deck real | 07/08 | `docs/PROTOCOLO_T2.4_corrida_2026-08-07.md` |
| **Fase 2 de `D-23`** — las 51 láminas selladas | 09/08 | el `_11` |

**Y el plan se contradecía a sí mismo sobre `T2.4`:** su propio texto decía *"sale apenas exista
`T2.1`"* mientras `T2.11`, doce líneas más abajo, lo daba por corrido. Resuelto a favor de la
bitácora (`CLAUDE.md` §7). La Fase 2 queda marcada con la salvedad de que `seccion_id` quedó
**vacío en las 51 filas por diseño** — el sellador no deduce; las 26 celdas humanas siguen siendo
su propia fila.

**Ningún frente nuevo estaba ya listado**, así que no hubo nada que actualizar en su lugar. El
único cruce real se anotó en el texto: los frentes 6 y 10 tocan Call Center y §3 tiene una fila
de *"16 tokens del Resumen Ejecutivo sin fuente"* con ocho de CC. **No son lo mismo** — aquélla
dice que el dato no está en ninguna de las cuatro bases; `C-61` es sobre `looker/CC`, que sí lo
tiene.

### Un ítem estaba en la sección equivocada, por la prueba de §9

**El tercer informe** vivía en *Planificado y bloqueado* con esta columna de destrabe: *"no es
prioritario: el objetivo es la capacidad de incorporar informes, no un informe puntual"*. **Eso
es una razón para no hacerlo, no algo que lo destrabe.** *Si no podés decir qué lo desbloquea, es
backlog* — bajó a §4 con el motivo escrito. **La decisión no cambia:** sigue sin ser prioritario,
y por el mismo motivo. Los otros nueve ítems de §3 sí nombran su destrabe.

### Parte B — lo que se escribió

- **§2, al frente: los 13 frentes ordenados**, cada uno con **por qué va ahí** y no sólo qué es.
  Con el criterio arriba, que es la mitad de la decisión: **la definición del vocabulario va
  antes que todo cableado nuevo**, porque cada marcador creado con la estructura vieja es deuda
  contraída a sabiendas.
- **§3: siete bloqueados nuevos**, cada uno con su destrabe. Incluye la salvaguarda de los
  estados `-`/`---` —que el reporte de corrida **siga distinguiendo *"no calculable"* de *"falló
  el cableado"*** aunque el deck deje de hacerlo— y la lámina del "1 a 1", que **se queda visible
  y sin sellar**: sus `«FALTA:token»` son la lista de lo que falta.
- **§4: cinco de backlog**, apuntando a su dueño en vez de repetir el contenido — mismo criterio
  que la sección Higiene ya usaba con `PENDIENTES`.

**`C-64` entró con su estado real, que no es el que el prompt sugería.** El caso está **cerrado**
como explicación —las dos capas, resuelto en call center (`C-62`), IVR (`V-98`) y mail
(`V-99`)—; lo que queda es **aplicar el mismo criterio a `pauta_*` y Alerta Naranja**. El frente
existe, con menos alcance del que su enunciado daba a entender.

**`C-61` sumó una segunda medición previa** que el prompt no traía y el caso sí: además de si el
motor lee CC **por encabezado o por posición**, hay que medir **cuántos tokens ya validados
cambian de valor**, porque ninguno de los exactos vigentes puede moverse.

### Lo que no entró, a propósito

**El alcance de Meta no se vuelve a medir** (usuario, 14/08). Quedó **una línea** en *Dato del
terreno, no problema*, que es la sección que existe justamente para eso: no entra al plan, y está
escrito para que no vuelva a proponerse. **No se creó ningún documento nuevo de plan** — `PLAN.md`
es dueño único de la pregunta (`CLAUDE.md` §7 y §9).

---

## `_5` revisado — entra el `_6` como sexto, y el Próximo pasa a catorce (2026-08-14)

El usuario reemplazó el prompt `_5` después de ejecutado. **La lista de frentes pasa de 13 a
14**: entra *"la letra manda, el título valida"* (`_6`) en el **puesto 6**, y los de abajo se
corren uno. `C-61` queda séptimo.

**El motivo del lugar es una dependencia real, no una preferencia de orden:** el `_6` va antes
de `C-61` porque **le saca el filo**. Hoy insertar una columna corre todas las letras a su
derecha y el mapeo apunta una más allá **sin fallar** — un `SUMA` sobre la columna de al lado
devuelve un número, no un error. Con el título como testigo, esa misma inserción pasa a ser una
falla ruidosa. `C-61` es exactamente un alta de columna.

Aprovecho la reescritura para dejar en el frente 10 la advertencia que salió del censo de
anoche: **`enc_impresiones` no se cablea sin resolver antes si `digital/Digital` sigue apagada**.
Es la precedencia que el usuario marcó al revisar `A-14`/`A-15`, y el plan es donde se va a leer
cuando le toque.

Los dos prompts quedan en la carpeta. El `_5` viejo no se archiva: **se pisa**, por pedido
explícito del usuario — no es una cadena de reemplazo, es la misma pieza corregida el mismo día.

---

## `_6` — la letra manda, el título queda documentado: `D-31` (2026-08-14)

### Parte A — el censo de las 161 filas

`censarEncabezadosDeMapeo()`, 00:07. **`MAPEO` vivo tiene 161 filas**, no las 72 del snapshot del
11/08 que se venían citando — el prompt ya pedía no asumirlo.

| lista | resultado |
|---|---|
| `SIN ENCABEZADO` | **0** — ninguna letra apunta a una columna sin título |
| `TITULO REPETIDO` en su solapa | **0** |
| `REVISAR` (el título no figura en las notas) | 43, informativos |

**Los 43 `REVISAR` son ruido del filtro, como estaba previsto**, salvo uno. Casi todos son filas
cuya nota simplemente no cita el encabezado —`inscriptos → "Inscriptos"`, `figura → "Figura"`— y
no prueban nada.

### El que no era ruido

**`rdv/RDV_otros_ministros/fecha_periodo` apunta a `E`, donde hay `hora_cita_evento`.** La fecha
de esa solapa está en `D` (`fecha_inicio_evento`).

**Y no lo causó una columna insertada**, que era el modo de falla que el prompt venía a cubrir:
la fila **no está en `SEED_MAPEO_`**, la escribe `promoverFechasElegidas()`. En la solapa hermana
—`rdv/RVD JM-CM - ES`— la fecha **sí** está en `E`. La letra es correcta para una solapa y se
aplicó a otra.

**Vale como corrección de la premisa del prompt, no como refutación:** *"nadie insertó columnas"*
sigue siendo cierto, y el efecto que la inserción produciría **ya existe por otra vía**. Esa fila
quedó **sin testigo a propósito** — poblarla con `hora_cita_evento` habría convertido el error en
un error certificado por su propio testigo, que es exactamente lo que el gate del prompt anterior
protegía.

### Parte B — lo escrito

1. **La columna `encabezado`**, inmediatamente después de `columna`, por `COLUMNAS_DELTA_.MAPEO`.
   Al **final** del array, como su propio comentario exige: las entradas se evalúan en orden y una
   nueva adelante correría los índices de las que ya están.
2. **`ENCABEZADO_POR_MAPEO_` en el seed**, 160 entradas. **Verificado fuera de Apps Script**: las
   154 filas de `SEED_MAPEO_` reciben encabezado, cero quedan vacías.
3. **La convención en `CLAUDE.md` §2** — toda fila nueva lleva letra y encabezado, con el *nunca
   fallback* y su motivo medido: los títulos repetidos harían que el fallback acierte a veces y
   erre en silencio otras.
4. **`D-31` en `PLAN.md`**, con la política de qué hacer cuando no coinciden **definida aunque
   nada la ejecute todavía**, para que la función posterior no la invente.
5. **Tres entradas en `PENDIENTES`**: el mapeo corrido, la función diferida con su supuesto, y
   `C-61`.

### Por qué el testigo vive en el seed y no sólo en la hoja

**Es un modo de falla medido, no una preferencia.** `upsertPorClave_` reescribe la fila entera con
`(h in obj) ? obj[h] : ''` cuando cambia **cualquier otra** columna, así que una columna que el
seed no conoce **se borra sola** al primer cambio de una nota. `calcularDiffUpsert_` no la marca
—recorre `Object.keys(obj)`— pero el `setValues` posterior la pisa igual.

Y hay un segundo motivo, que resultó mejor que el primero: **con el testigo en el seed, el diff de
`instalar()` muestra el desalineamiento sin que exista todavía la función que compara.** El
testigo empieza a servir antes de que se escriba quien lo lea.

### Siete filas quedan sin testigo, y son exactamente las que `ESCRITORES.md` ya contaba

El test dejó **6 claves del mapa sin uso en el seed**; con la excluida son **7**. Son las que
`promoverFechasElegidas()` escribe y ningún `SEED_MAPEO_` conoce — el `P1` de `C.2-7`, que
§2.1 mencionaba **sin nombrarlas**. Ahora están nombradas una por una en `PENDIENTES`.

**`tools/listas.js`:** OK, 11 hojas.

---

## `_6` addendum — el hallazgo del mapeo corrido era `C-09`, y el error fundó el límite de `D-31` (2026-08-14)

**Corrección del usuario, verificada contra la bitácora del 09/08.** Lo que reporté como *"un
mapeo apuntando a la columna equivocada"* ya tenía número: **`C-09`**, y mi corrección propuesta
—mover la letra a `D`— **habría roto una lectura que funciona**.

**Lo que la bitácora ya decía, textual:** `rdv/RDV_otros_ministros` *"resuelve su `fecha_periodo`
a `hora_cita_evento` … funciona (514 filas, 10 en ventana, 0 sin fecha) porque los encabezados
están corridos una columna. El mapeo apunta al dato correcto con el nombre equivocado."* Y ya
anticipaba la trampa: *"es un acierto por compensación de dos errores — el día que `C-09` se
arregle, esta lectura no va a fallar, va a leer otra columna"*.

**La letra no se toca.** El testigo se pobló con `hora_cita_evento`, que es el rótulo real.

### El caso vale más que el error: fundó el límite de `D-31`

**El testigo documenta el rótulo, no el contenido.** En una solapa con los encabezados corridos,
el testigo **coincide siempre y no delata nada** — va a decir *"esperaba `hora_cita_evento`,
encontré `hora_cita_evento`"* mientras el corrimiento siga ahí. Sin eso escrito, alguien iba a
leer *"coincide"* como *"está bien"*.

Con su lectura invertida, que es la que sorprende: **el día que ese testigo deje de coincidir
será porque alguien arregló los rótulos**, no porque algo se rompió — y ahí hay que revisar la
letra, no restaurar el testigo.

`D-31` ahora enumera qué **no** cubre: una columna cuyo rótulo miente, una renombrada sin mover
el dato, y dos intercambiadas con sus rótulos. Cubre una sola cosa —que la letra siga apuntando
donde el rótulo dice— y ésa es su utilidad entera.

### La advertencia donde va a hacer falta

`docs/DISENO_match_temario.md` propone esa solapa **dos veces** —§5 como fuente de caída del
anclaje, §7.1 como ancla de *"Ministros | Reuniones de la semana"*—, así que se va a mapear más
de ella, y hoy tiene **un solo campo** en `MAPEO`. Addendum fechado al pie: **elegir la letra
mirando el encabezado apunta una columna al lado**, y el testigo de `D-31` no protege contra
esto. No se resuelve ahí; el arreglo de fondo es `C-09`.

### Por qué se redescubrió, que es lo aprovechable

El instrumento midió `MAPEO` contra la planilla **sin cruzar contra los casos de validación ni
contra la bitácora**. Un hallazgo que sale de una medición nueva se lee como nuevo aunque tenga
número desde hace una semana. La regla operativa quedó en `PENDIENTES`: **antes de abrir un
hallazgo sobre una solapa, grepear su nombre en la bitácora y en el consolidado de casos.**

### Y un conteo que no baja de 7 a 6

La entrada quedó declarada en `ENCABEZADO_POR_MAPEO_`, pero **el mapa se aplica recorriendo
`SEED_MAPEO_`** y esa fila no está en el seed. Así que hay dos números y no uno: **161 con
testigo declarado**, **154 con testigo en la celda**, **7 con la celda vacía** — las mismas 7 de
`promoverFechasElegidas()`. La de `RDV_otros_ministros` está en las dos listas a la vez:
declarada y sin llegar a la hoja. Meterla en el seed le daría un segundo escritor a una fila que
ya tiene uno, así que no se hizo.

---

## `_7` Bloque 2 — el censo estático del `_2`: tres puntos sin insumo y uno que salió (2026-08-14)

### ⚠ Los puntos 1, 2 y 3 no son ejecutables: `SEED_MARCADORES_` no existe

**Y no es una omisión, es una decisión de arquitectura escrita en el propio código.**
`Instalar.gs:2715`: *"**`MARCADORES` no tiene sembrador y no lo va a tener** (`D-17`): su dueño es
la plantilla"*. `HOJAS_CONFIG_.MARCADORES` declara sólo `headers`, y `ALCANCE_REGISTROS_` la lista
como `{ auditada: false, motivo: 'sin sembrador — hallazgo abierto, Paso 2.13' }`.

Los tres puntos piden medir **sobre el seed**: duplicados por definición, inventario de `filtro`,
y agrupación por dimensión lógica. **No hay seed sobre el cual medirlos.** `MARCADORES` vive sólo
en la hoja, así que los tres necesitan planilla — que es exactamente lo que esta corrida no tiene.

**El "snapshot del 11/08" que los prompts citan tampoco está en el repo.** Lo produce
`tools/snapshot.js` —que sí incluye `MARCADORES` en su lista de hojas— pero su salida no está
versionada. Es el mismo patrón que el censo de la Parte A2 del `_1`: la medición existió y quedó
fuera del repo.

**Los tres van a la lista de la mañana** (bloque 4), con el instrumento que los destraba. No se
improvisó una vía alternativa, como pide la regla 5.

### El punto 4 sí salió: las colisiones `jm` ↔ `secco`

Medido sobre `docs/TOKENS.md` §2.0 —el inventario del 07/08 contra las **plantillas vivas**, que
es la numeración correcta— y no contra §2.1/§2.2, que son los `.pptx` archivados.

**Montón 1 — mismo hecho, mismo nombre.** Se globalizan sin discusión:

| tokens | dónde |
|---|---|
| `periodo` | `jm` 1 y 5 · `secco` 12 |
| el bloque `camp_*` entero | `jm` 12–19 · `secco` 16–22, que §2.0 declara **idénticos** |
| los once `camp_resp_*` | `jm` 19 · `secco` 23 (escondida) |
| los ocho `m2_*` de status semanal | `jm` 9 · `secco` 14 — `secco` agrega `m2_implementaciones` |
| `rrss_c1-4_pct` · `rrss_prom_general` | `jm` 21 · `secco` 28 (escondida) |

**Montón 2 — hecho distinto con el mismo nombre.** Es el montón caro:

- **Los `enc_*` del iceberg.** `jm` 6 y `secco` 8 llevan la misma familia sobre **encuentros
  distintos**: en `jm` el encuentro de la semana, en `secco` el **temático** — la lámina de
  `secco` trae además `et_fecha` y `et_nombre`, que es la marca de cuál es su universo.
- **`ecv_asistentes` dentro de `secco`**, entre la lámina 5 (*Uno a uno en comunas*) y la 8 (el
  iceberg del temático). Mismo nombre, dos encuentros distintos, **en la misma plantilla**.

**Montón 3 — nombre distinto para el mismo hecho.** Uno claro y medido:

- **`camp1-4` (`jm` 7) y `post_camp1-3` + `post_estado1-3` (`secco` 10)** son la **misma tabla de
  comunicaciones post**. §2.0 lo dice al reconciliar: *"la lámina equivalente de `jm` es la 7"*.
  `jm` tiene 4 ranuras y una sola columna marcada; `secco` tiene 3 y dos columnas. Es el caso
  que mejor justifica el vocabulario global: **dos nombres para el mismo hecho, y encima con
  distinta cantidad de ranuras**.
- Candidato menor: `fecha_dia` / `fecha_mes` (`secco` 1 y 24) contra `periodo` (`jm` 1). Son la
  misma pregunta —cuándo— resuelta con dos vocabularios. **No se decide acá.**

### ⚠ Y una premisa del `_2` que hay que corregir antes de que se ejecute

El `_2` dice que *"los siete `ecv_*` ambiguos deberían caer en el segundo montón"* — o sea, hecho
distinto con el mismo nombre **entre `jm` y `secco`**. **Los siete no son eso.**

Son los siete que el `Pedido-4` del 04/08 dejó en la partición **10 / 2 / 7**, y su ambigüedad es
**dentro de `jm`**: los mismos nombres sirven a la lámina **5** (agregado semanal de la semana) y
a la **6** (iceberg, por encuentro). Están cableados desde el 08/08 con `filtro = figura=Jorge
Macri` y son `ecv_insc_{mail,cc,ivr,digital,dif}`, `ecv_inscriptos` y `ecv_asistentes`.

**Que la ambigüedad sea intra-plantilla y no entre informes cambia el diseño**, no sólo la
etiqueta: un vocabulario global que resuelva `jm` contra `secco` **no los desambigua**, porque el
corte que los separa es *agregado del período* contra *un encuentro*. Eso es una **dimensión**, y
es justamente lo que el `_2` viene a definir — pero hay que saber que el caso testigo es otro.

**Lo que no se hizo, por instrucción:** ninguna `D-NN`, ninguna propuesta de vocabulario escrita
en un documento. La agrupación de arriba es censo, no decisión — el gate del `_2` sigue siendo
del usuario.

---

## `_7` Bloque 3 — el mapa de escritores, el gate de `D-32` y el diff sin aplicar (2026-08-14)

### Punto 1 · todos los caminos por los que una fila de configuración cambia de valor

Mapeado sobre el código, no sobre `ESCRITORES.md` — el documento es el contrato, esto es lo que
hay.

| camino | hoja | ¿respeta `origen=manual`? | ¿podía degradar un `uso`? |
|---|---|---|---|
| `aplicarClasificacionSolapas_()` (`Instalar.gs`) | `SOLAPAS` | **sí**, saltea la fila entera | **sí, y lo hizo** — es el caso del 14/08. **Ya no**: `D-32` |
| `inventariarSolapas()` (`Solapas.gs`) | `SOLAPAS` | no le aplica | **no.** Sólo toca `filas_datos` y `filas_crudas`; una solapa nueva nace `uso=revisar`, `origen=auto` |
| `upsertPorClave_` con `SEED_BASES_` | `BASES` | **no** — `BASES` no tiene columna `origen` | no le aplica (`BASES` no tiene `uso`) |
| `upsertPorClave_` con `SEED_MAPEO_` | `MAPEO` | **no** — `MAPEO` tampoco tiene `origen` | no le aplica |
| `promoverFechasElegidas()` (`Fechas.gs`) | `MAPEO` | **no** | no le aplica |
| `migrarPrefijosFechaPeriodo_` (`Fechas.gs`) | `MAPEO` | **no** | no le aplica |
| migraciones de `Instalar.gs` — `eliminarMapeoAlcanceDigitalObsoleto_`, `alinearMapeoLookerADinamico_`, `backfillSolapaMapeo_` | `MAPEO` | **no** | no le aplica |

**Dos cosas que el mapa deja a la vista y no estaban dichas juntas:**

1. **`origen` sólo existe en `SOLAPAS`.** `BASES` y `MAPEO` **no tienen forma de blindar una fila
   editada a mano**: cualquier escritor las pisa. `SOLAPAS` era la única con escape, y era la
   única que además podía degradar un `uso` — o sea que el problema estaba donde estaba la
   protección, y no donde no la hay.
2. **`upsertPorClave_` blanquea toda columna que el objeto del seed no traiga**, por
   `headers.map(h => (h in obj) ? obj[h] : '')`, y sólo en las filas que cambian por otro motivo.
   Está documentado desde el `_23` como *"un hallazgo con prompt propio, no un arreglo de paso"*,
   y sigue abierto. Es el mismo mecanismo que obligó a poner el testigo de `D-31` en el seed.

### Puntos 2, 3 y 5 · lo escrito

- **`diffSolapasSinAplicar_()`** (`Auditoria.gs`), sólo lectura. Responde *"¿qué me va a pisar?"*
  **antes** de sembrar, con las degradaciones marcadas aparte. **Pusheado y sin correr**, como
  pedía el bloque.
- **El gate en `aplicarClasificacionSolapas_`**, con el **por qué** escrito arriba y la fecha del
  caso — que es justo lo que le faltaba a la línea del seed que causó esto: decía *"congelada,
  sus filas JM llegan al 17/04"* sin decir **cuándo se midió**, y por eso nadie notó que había
  vencido.
- **`esDegradacionDeUso_`**, pura y separada, para que se pueda probar sin planilla.
- **`probarGateDeUsoDeSolapas_`**, escrita y **no corrida**. Su fixture clave es
  `revisar → ignorar` esperando **`false`**: sin él, una implementación que marcara **todo**
  cambio de `uso` pasaría igual y el aviso terminaría ignorado por ruidoso. Es la lección del
  control verde que probaba lo contrario, aplicada al escribirlo y no al descubrirlo.
- **`probarGateDeUsoContraLaHoja_`**, de punta a punta, **preparada para la mañana**. Si no
  encuentra ningún caso de degradación **se abstiene y lo dice**, en vez de dar verde sobre cero
  casos.

### Punto 4 · `D-32`, y lo que deja abierto a propósito

La decisión está en `PLAN.md`. Lo que **no** resuelve, dicho ahí: **`origen` sigue sin distinguir
*"lo decidió el seed"* de *"lo decidió una persona y el seed no se enteró"***. `D-32` cubre `uso`
en `SOLAPAS`; la ambigüedad sigue igual para las demás columnas y para `BASES` y `MAPEO`, que ni
siquiera tienen la columna. Decidirlo es del usuario.

**Nada de esto se corrió.** El gate cambia el comportamiento de un escritor de hojas de registro
y esta corrida no escribe en la planilla.

---

## `_7` Bloques 4 y 5 — la lista de la mañana, y el cierre de la corrida nocturna (2026-08-14)

**`docs/CORRIDAS_pendientes_2026-08-15.md`** — cinco corridas en un solo lugar, **ordenadas por
lo que destraban** y no por cómo aparecieron. Cada una con la función exacta, qué queda escrito
después, y si termina en decisión del usuario o si Code sigue solo. Con su fila en `CLAUDE.md`
§7, en el mismo commit.

El orden quedó: **1)** el alta de las 20 solapas, que cierra dos prompts; **2)** verificar `D-32`,
implementado anoche y sin probar; **3)** `instalar()`, que materializa `D-31`; **4)** el diff
como diagnóstico; **5)** el censo de `MARCADORES`, que destraba el `_2` entero.

**Y una función nueva, porque la lista no podía pedir correr algo que no existía.**
`censarCoberturaDeUniversos()` es la envoltura que le faltaba al alta del `_4`: mide cuántas
filas de cada solapa sin registrar caen en el universo de los 25 `Uno a uno`. **Mide columna por
columna sin asumir cuál es la clave** — `Desglose impresiones` tiene **tres**, y una función que
buscara "la" columna de id habría medido un tercio y devuelto un número plausible.

**Un bug propio, cazado antes de pushear y del linaje exacto que la función viene a medir:** la
guarda preguntaba por `hoja.getDisplayValues`, que es método de **`Range`, no de `Sheet`**. Daba
`false` siempre, así que la función habría devuelto **cero coincidencias sin fallar** — y un cero
es una respuesta perfectamente creíble para *"¿esta solapa cubre los 25?"*.

### Cierre

- `tools/listas.js` — **OK, las tres listas coinciden en 11 hojas.**
- `HANDOFF_CODE.md` reescrito, **arrancando con la lista de corridas**. De paso se sacó una fila
  duplicada del `_3` que había quedado al actualizarlo.
- **Cinco commits, uno por bloque**, más el del prompt. Cada uno revertible solo.

---

## El alta de las 20 solapas de `reuniones` — cierra el `_1` y el punto 5 del `_4` (2026-08-15)

### El hallazgo que cambió el encuadre: **las 20 son espejos**

Cada una es un `IMPORTRANGE` en `A1` de `1siyVJPVuObp1UEeQTS4IncXpsbev_Iqs-b27hZfLhds`,
importando el rango entero. **Las cuatro registradas tienen cero fórmulas.**

**Con eso, la pregunta del alta dejó de ser "¿cuál sirve?" y pasó a ser "¿alguna puede ser
fuente?" — y la respuesta es no, para las veinte.** Leer un espejo es tener dos respuestas para
la misma pregunta, y la segunda envejece sin avisar. Si alguna hiciera falta, se registra **esa
planilla** como base. **Hoy no está en `BASES` y nadie sabía que existía**: va a `PENDIENTES`.

### Cómo quedaron

| `uso` | nuevas | cuáles |
|---|---|---|
| `referencia` | **4** | `Base_Digital`, `Total`, `EDVs \| Estados`, `Métricas EDVs` |
| `ignorar` | **16** | las tres excepciones + las 13 restantes |

**Las tres de cobertura perfecta fueron a `referencia` y no a `ignorar`**, y el motivo lo dio la
lectura profunda: `Total` y `EDVs | Estados` **no tienen ninguna métrica** —son índices de
estados— y **`Métricas EDVs` es el superconjunto de `Agenda JM`**. Verificado sobre `1493`: sus
`S/T/U/V` reproducen **exacto** `AA/AJ/AM`. Es de donde viene el dato que el motor publica hoy, y
lo único que la mantiene fuera de `fuente` es que su dueño es otra planilla.

**Cobertura alta decía que estaban los mismos encuentros; la lectura profunda dijo qué traen.**
Sin el segundo paso, las tres se iban a `ignorar` y `Métricas EDVs` —la más informativa de las
veinte— se perdía.

### Los dos huecos, cerrados como "no existe"

- **`Visualizaciones` para el PRE no está en ninguna de las 24.** En `Base_Digital` aparece sólo
  en los bloques Post (`P`, `T`, `X`). `V-26` sigue dependiendo de `digital`.
- **Alcance por plataforma tampoco.** Sólo `Alcance Meta Convocatoria` (`J–L`) y `Alcance Meta
  Post` (`Y–AA`). **Es confirmación estructural de `R-27` por un camino distinto del que la
  fundó:** no hay banda de Google ni de Programmatic **porque el dato no existe**.

Los dos quedan cerrados con las columnas revisadas, para que nadie los vuelva a buscar.

### Una hipótesis mía, medida y falsa

El 14/08 anoté que `Métricas digital` y `Digital` eran *"probable duplicado de la misma solapa"*
por tener las dos 961 filas y cobertura idéntica. **No lo son:** comparten la lista de campañas
porque es la misma, pero una trae **metadatos** y la otra **métricas**. Corregido en el censo y
en las notas de las dos. Es el mismo error de siempre —dos cosas que se parecen en un número no
son la misma cosa— y esta vez lo escribí yo.

### Cuatro cosas que salieron de acá y son de otros frentes

1. **`Base_Digital` desalineada, ahora con evidencia:** fila 3, col `A` = `1493-JUNJDGAG`, `G` =
   `1688-JULJDGAG`, `M` = `2411-DICJDGAG`, `Q` = `2723-MARJDGAG`. Leerla por fila mezcla cuatro
   encuentros. La nota de `SOLAPAS` la cita.
2. **`Call` tiene `Tipo de llamado`** y **`Métricas EDVs` separa CC JM de CC Funcionarios**:
   insumo directo de la `R-NN` de los dos universos, frente 8.
3. **`Métricas digital` tiene una columna `Post`; `Digital` tiene `JM | GCBA | POLICIA`** — la
   dimensión ámbito del `_2` **escrita como columna** en vez de inferida del nombre de campaña.
   Anotadas, sin usar.
4. **`Agenda JM | Post` ya usa `-` como dato.** El `-` que se iba a definir como estado
   publicable ya existe en la base: dos cosas distintas con el mismo símbolo. A `PENDIENTES`.

### Y lo demás de la tanda

- **`D-32`, parte pura: verificada.** `probarGateDeUsoDeSolapas_` da **7 afirmaciones OK**,
  corrida fuera de Apps Script con el código real extraído de `Fuentes.gs`, `Instalar.gs` y
  `Pruebas.gs` — no una copia. Incluye el caso que fallaba, `'  fuente '` con espacios. **Falta
  la de punta a punta**, que necesita la planilla.
- **`buscarMapeo` sube en `PENDIENTES` con destrabe**: los seis comparadores de `uso` del camino
  de lectura convergen en `leerSolapasSinCache_`, así que el arreglo es de una línea y en un solo
  lugar — con las tres verificaciones que lo sacan de "una línea", y la prueba que **falla antes
  y pasa después**, que es lo único que probaría que sirve.
- **El patrón de las columnas nuevas, a `CLAUDE.md` §2.** Van tres en una semana con el mismo
  modo de falla: la columna entra al `SEED_*` y a un consumidor, y los demás lectores quedan
  atrás **sin fallar**. Queda como checklist de cuatro puntos, donde se lee antes de tocar un
  `.gs`.

---

## Wrappers públicos, el orden de `instalar()` y la convención de snapshots (2026-08-15)

**1 · Lo que corre una persona no puede terminar en `_`.** `probarGateDeUsoContraLaHoja_` y
`diffSolapasSinAplicar_` estaban pusheadas **sin forma de invocarlas**: Apps Script no lista las
privadas en el desplegable. Es el tercer caso de lo mismo —el primero fue `diagPlanillaExterna_`,
que se midió y su resultado no quedó en ningún lado— así que la convención va a `CLAUDE.md` §2 y
no a un comentario.

- **`verificarGateDeUso()`** corre las dos **en orden**, y si la pura falla **no corre la de
  punta a punta**: sobre un cálculo roto el resultado de la otra no significa nada. Esa es la
  mitad del valor del wrapper, no un detalle.
- **`verDiffDeSolapas()`**, ídem para el diff.
- **`probarGateDeUsoDeSolapas_` entra al runner `correrPruebasDiff_`** porque es pura y cumple su
  contrato de no tocar la hoja. La de punta a punta **no** va ahí, y eso también está dicho.
- La convención agrega dos cosas que no son obvias: el interior **sigue** con `_` y el wrapper lo
  llama —el motor conserva su namespace—, y el wrapper **devuelve por `Logger.log`**, porque el
  editor no muestra el valor de retorno. Una función que sólo retorna, desde ahí, no dice nada.

**2 · `instalar()` pasa a ser la corrida 0, y puede frenar todo lo demás.** Aplica **dos cosas en
la misma pasada**: el alta de las 20 solapas y la columna `encabezado` de `MAPEO`. Es **la
primera vez que un `COLUMNAS_DELTA_` toca `MAPEO`**, y aunque por diseño no reescribe la fila 1
ni corre los datos, eso es lo que dice el mecanismo y no lo que está medido sobre esta hoja. **Si
el diff sorprende, se para**: las otras cuatro corridas leen `SOLAPAS` o `MAPEO`, y sobre una
hoja en estado dudoso no significan nada.

**3 · Los snapshots se versionan en `docs/_snapshots/`.** Con su fila en `CLAUDE.md` §7 y en el
mapa del repo. El motivo está escrito ahí y es el que importa: el "snapshot del 11/08" **nunca
estuvo en el repo**, y por eso se lo citó cuatro veces **como si fuera de hoy** — nadie podía
mirarle la fecha.

**Y la revisión de citas, hecha antes de que exista el snapshot nuevo: cero ediciones.** Los
candidatos señalados —el `_2` y `PENDIENTES`— **ya declaran la fecha en las tres citas** (`_2`
líneas 21 y 31, `PENDIENTES` 3820). El cero queda registrado, como pide `CLAUDE.md` §3. La
revisión que importa es la de después, cuando haya dos snapshots y las cifras dejen de coincidir.

---

## El alta no llegó a la planilla, y no era `D-32`: era la función equivocada (2026-08-15)

### La hipótesis a falsar, falsada

Se propuso que `D-32` bloqueaba altas —que el gate corría sobre el conjunto a escribir en vez de
sobre las filas existentes, y una fila nueva entraba por la rama de degradación—. **No es eso**, y
se midió antes de tocar:

**`instalar()` no siembra `SOLAPAS`.** Llama a `aplicarInstalacion_()`, que **crea y repara hojas
y aplica los `COLUMNAS_DELTA_`**, nada más. El sembrador de `SOLAPAS` es
`aplicarClasificacionSolapas_`, y lo invocan **`sembrarClasificacionSolapas()`** y
**`menuAplicarConfiguracion_()`** — el ítem de menú *Aplicar configuración*, que corre los cuatro
sembradores en orden. **Ninguna de las dos es `instalar()`.**

**Es un error mío del documento de corridas**, no un bug del gate: la corrida 0 decía `instalar()`
y tenía que decir *Aplicar configuración*.

**Todo lo observado encaja sin bug:** `SOLAPAS` no recibió filas nuevas porque su sembrador no
corrió; las notas de las cuatro existentes son del **14/08** —cuando sí se corrió el sembrador, y
de ahí salió el incidente de `CAMPAÑAS_DESGLOCE_DIGITAL`—; y la columna `encabezado` de `MAPEO`
apareció porque el **delta** sí es de `aplicarInstalacion_`.

⚠ **Y por lo mismo, `D-31` está a medias y no se veía:** la columna existe, **los testigos están
vacíos**. Los valores vienen de `SEED_MAPEO_`, que siembra `aplicarSeedConfiguracion_` — el
segundo de los cuatro.

### El gate se extrajo a una función pura, y ahí está la lección

`usoAEscribir_(existente, usoDelSeed)`. **Vivía inline dentro de `aplicarClasificacionSolapas_`,
que toca la planilla**, así que lo único verificable sin la hoja era `esDegradacionDeUso_` — y por
eso `probarGateDeUsoDeSolapas_` pasó con siete afirmaciones **sin cubrir el alta**.

Con la frase que faltaba escrita en el código: **insertar nunca es degradar; una fila que no
existe no tiene `uso` que proteger.**

**La prueba se escribió antes de tocar el gate, esperando que fallara. Pasó — 12 afirmaciones**,
corrida fuera de Apps Script con el código real. **Eso es el resultado, no un trámite**: prueba
que el gate nunca bloqueó altas y que la causa estaba en otro lado.

### El patrón, que es la lección cara del día

**El gate se probó contra el caso que lo motivó y no contra el caso que lo podía romper.** Los
siete fixtures cubrían degradaciones —`fuente → ignorar`, `revisar → ignorar`, la mugre de una
carga a mano— porque el caso que originó `D-32` era una degradación. **Ninguno preguntaba qué pasa
cuando la fila no existe**, que es el otro camino que atraviesa la misma función.

**Y el síntoma en producción fue el peor posible: no falló nada.** La corrida terminó bien, el
reporte no marcó ningún error, y la hoja no cambió. **Sin abrir la planilla no había forma de
saberlo** — el mismo modo de falla que el proyecto persigue desde el principio, esta vez del lado
de la escritura y no de la lectura.

**Lo accionable, que ya es regla en `CLAUDE.md` §4 y acá gana su tercer caso:** a un control
verde se le pregunta **con qué otro dato seguiría pasando**. Estos siete seguían pasando con un
gate que descartaba toda fila nueva. La pregunta que faltaba no era *"¿pasa?"* sino **"¿qué otros
caminos atraviesan esta función, y cuál de ellos no estoy tocando?"**.

**Y la abstención de `probarGateDeUsoContraLaHoja_` queda explicada por lo mismo**: sin las 20
filas insertadas no hay ninguna donde la hoja diga `fuente` y el seed otra cosa, o sea ningún caso
que verificar. La abstención fue correcta y no era un verde — funcionó como se escribió.

---

## Tres frentes cerrados: el alta de las 20 solapas, `D-31` y `D-32` (2026-08-15)

### 1 · El alta de las 20 solapas de `reuniones` — cierra el `_1` y el punto 5 del `_4`

`reuniones` queda en **24 filas: 2 `fuente`, 5 `referencia`, 17 `ignorar`.**

| `uso` | cuántas | cuáles |
|---|---|---|
| `fuente` | 2 | `Agenda JM`, `Agenda JM \| Post` |
| `referencia` | 5 | `Barrios` + `Base_Digital`, `Total`, `EDVs \| Estados`, `Métricas EDVs` |
| `ignorar` | 17 | `Agenda funcionarios` + las 16 nuevas |

**Ninguna de las 20 puede ser `fuente`, y el motivo es estructural: son espejos.** Cada una es un
`IMPORTRANGE` de `1siyVJPVuObp1UEeQTS4IncXpsbev_Iqs-b27hZfLhds`; las cuatro registradas tienen
cero fórmulas. Esa planilla **no está en `BASES`** y quedó como pendiente propio.

**Las tres de cobertura perfecta fueron a `referencia` y no a `ignorar`.** `Total` y `EDVs |
Estados` no traen **ninguna métrica** —son índices de estados— y **`Métricas EDVs` es el
superconjunto de `Agenda JM`**, verificado sobre `1493`: sus `S/T/U/V` reproducen exacto
`AA/AJ/AM`. Cobertura alta decía que estaban los mismos encuentros; la lectura profunda dijo qué
traen. Sin ese segundo paso, la más informativa de las veinte se descartaba.

**Y dos huecos quedaron cerrados como "no existe", con las columnas revisadas:** `Visualizaciones`
para el PRE no está en ninguna de las 24 —sólo en los bloques Post de `Base_Digital` (`P`, `T`,
`X`)—, y alcance por plataforma tampoco: las únicas bandas son `Alcance Meta Convocatoria` (`J–L`)
y `Alcance Meta Post` (`Y–AA`). **Es confirmación estructural de `R-27` por un camino distinto del
que la fundó.**

### 2 · `D-31` — la letra manda, el título es testigo

**154 filas de `MAPEO` con su `encabezado`.** Medido sobre las 161 vivas: cero letras sin
encabezado, cero títulos repetidos dentro de una misma solapa. Las 7 que quedan sin testigo en la
celda son las de `promoverFechasElegidas()`, que el seed no conoce.

**El testigo es testigo, nunca fallback**, y el motivo es medido: los títulos se repiten —`Agenda
JM | Post` tiene cuatro `% CTR`, `Base_Digital` ocho `ID Cuentas`, `Desglose impresiones` tres
claves—, así que un fallback por título **acertaría a veces y erraría en silencio otras**.

**Con su límite escrito, que es lo que más vale del caso `C-09`: el testigo documenta el rótulo,
no el contenido.** En una solapa con encabezados corridos coincide siempre y no delata nada — y
el día que deje de coincidir será porque alguien **arregló** los rótulos, no porque algo se rompió.

### 3 · `D-32` — el sembrador no degrada en silencio

**Verificado de las dos mitades.** La pura, **12 afirmaciones**, corrida con el código real fuera
de Apps Script. La de punta a punta, **a mano y contra el sembrador**: con
`reuniones/Agenda funcionarios` puesta a `fuente` contra un seed que decía `ignorar`, el sembrador
**no la revirtió** — la celda quedó en `fuente` y se devolvió a `ignorar` después.

---

## Las dos cosas de hoy que se pierden si no quedan escritas

### El gate se probó contra el caso que lo motivó y no contra el que lo rompía

Las **7 afirmaciones originales daban verde mientras el alta no entraba en la hoja.** Cubrían
degradaciones —`fuente → ignorar`, `revisar → ignorar`, la mugre de una carga a mano— porque el
incidente que originó `D-32` era una degradación. **Ninguna preguntaba qué pasa cuando la fila no
existe**, que es el otro camino que atraviesa la misma función.

**Insertar no es degradar: una fila que no existe no tiene `uso` que proteger.** La frase está
ahora en `usoAEscribir_`, que se extrajo a función pura justamente para poder probar ese camino —
vivía inline en una función que toca la planilla, y por eso lo único verificable era
`esDegradacionDeUso_`.

**El síntoma fue el peor posible: no falló nada.** La corrida terminó bien, el reporte no marcó
ningún error, y la hoja no cambió. **Sin abrir la planilla no había forma de saberlo.** Es el modo
de falla que el proyecto persigue desde el principio, esta vez del lado de la escritura.

La pregunta que faltaba no era *"¿pasa?"* sino **"¿qué otros caminos atraviesan esta función, y
cuál de ellos no estoy tocando?"**.

### Sobre una configuración consistente, `D-32` no se puede verificar sin romperla a propósito

`probarGateDeUsoContraLaHoja_` **se abstiene** cuando no encuentra ninguna fila donde la hoja diga
`fuente` y el seed otra cosa. **Eso no es un verde, y no es un defecto de la prueba: es la
consecuencia de que el gate proteja contra algo que hoy no está pasando.**

**Para verificarlo hay que fabricar el conflicto** —poner una solapa en `fuente` contra un seed
que diga `ignorar`, correr el sembrador, confirmar que no la revirtió, y devolverla— que es
exactamente cómo se cerró hoy.

**Quien vuelva a tocar `D-32` va a encontrarse con la abstención y va a tener que hacer lo mismo.**
Queda escrito acá y en el documento de corridas para que no se lea como *"pasó"*.

### La verificación que cierra: contra la hoja, no contra el reporte del sembrador

Los snapshots del 15/08 se regeneraron **después** del alta y se versionaron en
`docs/_snapshots/`. Medido sobre el `.tsv`, que es la hoja y no lo que la corrida dijo de sí
misma:

```
SOLAPAS · reuniones → 24 filas: 2 fuente · 5 referencia · 17 ignorar
MAPEO   · encabezado en la columna 6, después de `columna`
        → 154 con testigo · 7 vacías
```

**Las 7 vacías son exactamente las predichas**, una por una: `rdv/RVD JM-CM - ES/fecha`,
`rdv/RDV_otros_ministros/fecha_periodo` y los cinco `fecha_periodo` de `digital`. Son las que
escribe `promoverFechasElegidas()` y `SEED_MAPEO_` no conoce — el `P1` de `C.2-7`.

**Que la predicción se cumpla celda por celda es la verificación, y es distinta de que la corrida
haya terminado bien.** Justamente hoy una corrida terminó bien sin escribir nada.

### Y el snapshot del 11/08 dejó de ser una cita sin edad

Con `tools/snapshot.js` versionando la salida, el repo tiene ahora las hojas al **01, 10, 11 y
15/08**. **El "snapshot del 11/08" que cuatro documentos venían citando ya se puede abrir** — hasta
hoy era una cifra que viajaba de prompt en prompt sin que nadie pudiera mirarle la fecha.

Con `MARCADORES_2026-08-15.tsv` en el repo, **el `_2` queda listo para su Parte A completa**: los
duplicados por definición, el inventario de `filtro` y la agrupación por dimensión lógica. Eso
abre el **frente 4** del plan — la migración al vocabulario de métricas y dimensiones, que es el
objetivo de todo esto.

---

## `_2` — `D-33`: el vocabulario pasa a medida + dimensiones (2026-08-15)

### Parte A — el censo, sobre las 78 filas vivas

Medido sobre `docs/_snapshots/MARCADORES_2026-08-15.tsv`. **78 marcadores, todos
`informe_id = jm`** — el punto 4 del prompt confirmado: **`gcba` no es el informe**, las 12
`gcba_*` viven con `informe_id = jm`. El prefijo es el ámbito de la campaña.

**Tres correcciones al cuerpo del prompt, y las tres salieron de medir en vez de citar:**

1. **`dig_jm_gcba` no aparece en ningún filtro.** El cuerpo lo daba como una de las cuatro formas
   del ámbito; existe como **columna** en `digital/Digital` y sin usarse. La cuarta forma real es
   **`nombre_campaña~=JM`** en `looker/DIGITAL`. Siguen siendo cuatro campos, pero uno es otro.
2. **Los duplicados son siete, no nueve** — y de **dos clases distintas**, que es lo que importa:
   tres pares `pauta_*`/`gcba_pauta_*` y cuatro pares `enc_*`/`ivr_*`.
3. **`periodo_ref` está vacío en las 78.** La ventana se resuelve entera por la cadena de `D-20`,
   así que **el desfasaje de un día de SECCO no toca el vocabulario**. El punto 5 queda cerrado
   con esa respuesta, que es mejor que la que el prompt esperaba.

### `D-33`, escrita

Tres dimensiones —`ambito`, `plataforma`, `tipo_envio`— con la expresión física medida base por
base. **El argumento es una simetría:** el motor ya sabe que una medida se llama distinto en cada
base, para eso está `MAPEO`; del lado de los cortes no había nada equivalente. `D-33` le da a las
dimensiones lo que `MAPEO` ya le daba a las medidas.

**Dos cosas quedaron declaradas en voz alta porque se pierden:**

- **`gcba` es *todo lo que no es `jm`*, con su límite escrito:** una fila **sin** `figura`, sin
  remitente o sin nombre de campaña **cae en `gcba`**, no queda afuera de las dos. Hoy ya funciona
  así; lo que cambia es que deja de ser un accidente heredado. El síntoma a buscar el día que se
  rompa: **un `gcba_*` que crece sin que nadie haya cargado campañas nuevas.**
- **La frontera dimensión / restricción técnica.** Las nueve guardas `!=0` y `estado=Activa`
  **no migran**: una dimensión es un corte que alguien del equipo pediría, una restricción es una
  regla de validez de la fila. Las `!=0` son la contracara de `R-18` —descartan filas donde el
  cero es un *"Revisar"* disfrazado— y `estado=Activa` nunca aparece sola.

**La línea base es `MARCADORES_2026-08-15.tsv`, citada por nombre**, y **cada tanda se compara
contra ese archivo y no contra la corrida anterior** — así los errores no se acumulan de tanda en
tanda. **No se creó ningún mecanismo de backup aparte**: sería una segunda copia de lo mismo, y la
gracia del snapshot es que no sale del código que se está migrando.

### Los siete duplicados, a tres destinos distintos

**No son el mismo problema y no van al mismo lado** — meterlos en la misma tanda habría sido el
error caro:

| qué | dónde va | por qué |
|---|---|---|
| **`imp_total` y sus siete hermanos** (`looker/DIGITAL/Impresiones/SUMA`) | **el piloto**, frente 5 | ocho marcadores que sólo difieren en el `filtro`: una medida × ámbito × plataforma. Es el caso que justifica el frente entero |
| **los tres pares `pauta_*` / `gcba_pauta_*`** | **`PENDIENTES`, validación** | definición idéntica y **filtro vacío en los dos**. No es migración: es **un número publicado dos veces**. Migrarlos sería convertir un error en un error estructurado, y con el nombre nuevo dejaría de verse |
| **los cuatro pares `enc_*` / `ivr_*`** | **`PLAN.md`, bloqueado** | dos familias sobre el mismo hecho — **una migración a medio hacer**: `TOKENS.md` ya declara `enc_*` canónico y los `ivr_*` siguen cableados porque las láminas 2 y 5 los usan. Sobrevive `enc_*` (usuario, 15/08), pero unificar es renombrar en la plantilla, que es `C-01` |

### Dos cifras del plan que la medición corrigió

- **Son 78 marcadores, no 51.** La cifra vieja venía del snapshot del 11/08.
- **La tanda inicial no son "los nueve pares `gcba_*`".** Los que ya tienen la dimensión escrita
  en el `filtro` son los `mail_*`/`gcba_mail_*` y `frecuencia`/`gcba_frecuencia`; **los `pauta_*`
  no entran** porque su filtro está vacío.

**Ni una fila de `MARCADORES` cambió en este prompt.** La regla de `CLAUDE.md` sobre renombres por
`informe_id` quedó **reemplazada** —sin régimen de transición, porque `S-05` está vivo y hay un
solo lector— dejando dicho que su premisa **se invierte** cuando el corte deja de estar en el
nombre: lo que hacía a un token específico de un informe era justamente el prefijo.

---

## El piloto de `D-33` — migrado y **sin verificar**, con `looker` en tránsito (2026-08-15)

> Entrada de cierre del 15/08, escrita el 16/08 en el bloque 1 de la corrida nocturna
> `2026-08-16_1`. Cubre el `2026-08-15_1` completo, que quedó sin bitácora: la del `_2` cerró en
> `D-33` escrita y el piloto arrancó después.

### El estado, primero, porque es lo que hay que saber mañana

**Los ocho marcadores de `looker/DIGITAL/Impresiones` están migrados y su resultado no está
confirmado.** No es "en curso": la escritura terminó, los ocho tienen `dimensiones` poblada y su
`filtro` reducido a `estado=Activa`. Lo que falta es la Parte C, y **no falta por tiempo: falta
porque `looker` estaba recalculando y una comparación contra una base en tránsito no significa
nada**, ni a favor ni en contra.

**La precondición para leerla es el canario `gcba_frecuencia`.** Mientras dé `0`, la base no está
estable. Está en el log de cada corrida de `testigoDeImpresiones()`.

### Parte A — el testigo, y el descubrimiento de que el testigo se mueve

`testigoDeImpresiones()` (`Auditoria.gs`), sólo lectura, con la ventana nombrada. Dos corridas de
la **misma ventana** separadas 1h45 dieron números distintos:

| marcador | 19:41 | 21:26 | drift |
|---|---|---|---|
| `imp_total` | 33.374.988 | 33.409.815 | **+34.827** |
| `gcba_imp_total` | 248.741.712 | 248.880.139 | **+138.427** |
| `imp_meta` | 3.200.046 | 3.229.815 | +29.769 |
| `imp_google` | 2.198.152 | 2.203.210 | +5.058 |
| `imp_prog` | 27.976.790 | 27.976.790 | 0 |

**Eso derogó el criterio de la Parte C tal como estaba escrito** —*"los ocho números tienen que
dar exactamente igual"*—: el valor absoluto no es un testigo estable cuando la fuente sigue
recibiendo datos de una ventana ya cerrada. El Addendum 1 lo reemplazó por un orden de lectura
—**traza de filas primero, después valores, después descuadre**— y por versionar el testigo con
**hora**, no sólo con fecha (`docs/_snapshots/TESTIGO_impresiones_2026-08-15_2126.md`).

**Lo que sí sobrevivió al drift es el descuadre**, y no por suerte: el movimiento del total es
**exactamente** el de las partes en los dos ámbitos —`29.769 + 5.058 + 0 = 34.827` y
`63.537 + 74.890 + 0 = 138.427`—. `total = suma de partes` es estructural, así que sirve de
control aunque los absolutos se muevan.

### Parte B — la columna `dimensiones`, y la migración que corrió sin ella

Se agregó `dimensiones` a `MARCADORES` por `COLUMNAS_DELTA_` (`Instalar.gs`), su traducción a
condición física en `Fuentes.gs` —donde corresponde: datos, no aritmética ni despacho— y
`migrarPilotoDeImpresiones()`. `estado=Activa` **se quedó en `filtro`**: es restricción técnica,
no dimensión, y `R-24` no se derogó — `programmatic` se sigue calculando por resta.

**Pero la migración corrió a las 22:40 antes de que `instalar()` creara la columna.**
`curarCamposMarcadores_` escribía campo por campo, así que **escribió los ocho `filtro` y falló en
`dimensiones`**:

```
imp_total · filtro: "nombre_campaña~=JM && estado=Activa" → "estado=Activa"   ×8
⚠ SIN FILA EN LA HOJA (8): imp_total||jm.dimensiones (columna inexistente)
```

Los ocho quedaron **sin ámbito y sin plataforma** —publicando todos el mismo número, todas las
impresiones activas— **y ninguno fallando**. El modo de falla de siempre: no rompe, publica mal.

**La reparación fue al escritor, no a la migración.** `curarCamposMarcadores_` pasó a ser **todo o
nada**: si alguna columna de algún cambio no existe, no escribe ninguna celda y devuelve el motivo
con el puntero a `instalar()`. Puesta ahí protege a todo llamador y no sólo al que se acordó de
correr las cosas en orden — media operación de dos pasos deja el sistema en un estado que ninguno
de los dos lados contempla, y eso no lo arregla el orden. Se valida la **columna**, que es el
error estructural; una clave que no existe se sigue reportando por `sin_fila` sin frenar el lote.

`revertirPilotoDeImpresiones()` existe, está probada, y **sus ocho filtros se generaron leyendo el
TSV, no transcribiéndolos**: `nombre_campaña` lleva `ñ`, y una transcripción que la rompa produce
un filtro que no matchea ninguna fila y devuelve cero sin fallar — el mismo modo de falla, dentro
del reparador.

### Parte C — abierta, y **no** por la migración

`imp_meta` sumó `0` en vez de 3.249.453; `gcba_imp_meta` dio 2.424.456 en vez de 31.252.043.
Parece una migración rota y no lo es, con dos pruebas independientes:

1. **Las ocho cuentas de filas son idénticas al testigo** —46, 313, 14, 12, 20, 82, 84, 147—. Si
   la dimensión tradujera mal la condición, cambiaría la **cuenta**, no sólo la suma.
2. **Dos marcadores sin migrar se movieron igual o más.** `frecuencia` y `gcba_frecuencia` tienen
   `dimensiones` vacío, salen de `resumen_metricas_dinamico`, y su numerador pasó de 6.010.469 a
   4.663.092 y de 2.048.748 a **0**. La migración no los tocó.

**Los ocho quedan migrados.** Revertir por un síntoma ya explicado por otra causa sería tirar
trabajo bueno.

### Las tres reglas que dejó, y son el saldo real del día

- **Un instrumento que mide un cambio no puede depender de lo que el cambio modifica.** El testigo
  agrupaba exigiendo que los marcadores **difirieran en el `filtro`**; migrados, el corte pasó a
  `dimensiones` y los ocho comparten `filtro` — **dejó de verlos justo después de migrarlos**,
  devolvió 14 de 22 y nada falló. Se corrigió a agrupar **por la medida** y leer el corte de los
  dos lados.
- **Y su contracara: la comparación no puede depender de lo que se mueve solo.** De ahí el canario,
  y de ahí que el canario tenga que ser un marcador que la migración **no toca**.
- **Lo que distingue "se rompió" de "la base se movió" es la cuenta de filas, no el valor.**

Las tres están escritas en `CLAUDE.md` §4.

### Y un detalle de emisión que se arregló de paso

El separador de `dimensiones` se emite **con espacios**, como el resto del motor (`Fuentes.gs`).

### Lo que cerró el 15/08, en una línea cada uno

| qué | estado |
|---|---|
| **`D-31`** — la letra manda, el título es testigo | **cerrado.** 154 filas de `MAPEO` con `encabezado`. Con el límite que expuso `C-09`: el testigo documenta **el rótulo, no el contenido**, y **nunca es fallback** |
| **`D-32`** — el sembrador no degrada en silencio | **cerrado, verificado punta a punta.** Con `reuniones/Agenda funcionarios` puesta a mano en `fuente` contra un seed que decía `ignorar`, el sembrador **no la revirtió** |
| **El alta de las 24 solapas de `reuniones`** | **cerrada.** 2 `fuente` · 5 `referencia` · 17 `ignorar` |
| **`D-33`** — medida + dimensiones | **escrita.** 78 marcadores medidos, tres dimensiones (`ambito`, `plataforma`, `tipo_envio`), la frontera dimensión / restricción técnica trazada |
| **El piloto (frente 5)** | **migrado, sin verificar.** Ocho marcadores esperando que `looker` se estabilice |

---

## Bloque 2 — `C-61`: el motor lee por **posición**, y `looker/CC` no tiene ni una fila de `MAPEO` (2026-08-16)

> Reporte previo del frente 7, la mitad que no necesita planilla. **No se tocó `C-61` ni se
> agregó ninguna columna.**

### 1 · El camino de lectura, paso por paso, y con qué se identifica la columna en cada uno

Recorrido sobre el código vivo. **La premisa del prompt —*"un marcador de `looker/CC`"*— es
falsa** (punto 2), así que el recorrido se hace sobre `looker/DIGITAL`, que **es el mismo código
sin una sola bifurcación por base ni por solapa**: `resolverDatosDeMarcador_` no ramifica por
`base_id`. Eso se dice acá y no se da por obvio.

| # | dónde | qué identifica la columna |
|---|---|---|
| 1 | `MARCADORES.campo_logico` | **nombre lógico** (`Impresiones`) — no toca la planilla fuente |
| 2 | `buscarMapeo(base, solapa, campo_logico)` · `Config.gs:245` | devuelve **`{ ok, hoja, columna }`** y `columna` es **la letra**. Antes valida `usoSolapa_ === 'fuente'` |
| 3 | `encabezadoEnColumna_(base, solapa, letra)` · `Union.gs:29` | abre la solapa, lee la fila de encabezado que resuelve `resolverFilaEncabezado_`, y hace `headers[columnaLetraAIndice_(letra)]` — **la letra se convierte en índice: `A`→0, `B`→1** (`Fuentes.gs:508`) |
| 4 | `leerFuente` · `Fuentes.gs:915` | arma cada fila como objeto **indexado por el texto del encabezado**: `obj[h] = fila[i]` |
| 5 | `valoresDeCtx_` · `Marcadores.gs:66` | extrae con `ctx.encabezado`, **el nombre**, nunca la letra. `ctx.columna` va sólo para la traza |

**La respuesta a la pregunta del frente 7, en una línea: el motor lee por POSICIÓN.** El
encabezado aparece en el camino, pero **es derivado de la posición**, no un criterio
independiente: el paso 3 usa la letra para *averiguar* el título, y el paso 5 usa ese título para
extraer. **Nunca se busca una columna por su nombre.**

### 2 · Contra el snapshot — y acá se rompe la premisa

**Snapshot usado: `docs/_snapshots/MAPEO_2026-08-15.tsv`, del 15/08/2026**, el más reciente.

**`looker/CC` tiene CERO filas en `MAPEO` y CERO marcadores en `MARCADORES_2026-08-15.tsv`.**

`looker` tiene 35 filas de `MAPEO`, repartidas en tres solapas y ninguna es `CC`:

| solapa | filas de `MAPEO` | `SOLAPAS.uso` |
|---|---|---|
| `resumen_metricas_dinamico` | 27 | `fuente` |
| `DIGITAL` | 5 | `fuente` |
| `Cuentas` | 3 | `fuente` |
| **`CC`** | **0** | **`fuente`** |

Las 35 referencian **por letra** —`columna` cargada, `A`/`B`/`C`/`D`/`F`/`I`— y **ninguna por
título**: `encabezado` viaja al lado como testigo de `D-31`, no como criterio.

**Esto confirma la nota del handoff** —*"`looker/CC` está `uso = fuente` y no es legible"*— y la
precisa: no es que le falte `fecha_periodo`, es que **no tiene ni una sola fila**. Los 10
marcadores de `looker` apuntan 8 a `DIGITAL` y 2 a `resumen_metricas_dinamico`.

**Y cambia el signo de `C-61`.** El riesgo que el frente 7 declaraba —*"insertar una columna corre
las letras y rompe lo ya mapeado"*— **no tiene hoy ningún mapeo de `CC` que romper.** Lo que
queda del riesgo es otro y hay que decirlo entero, abajo.

### 3 · La consecuencia, escrita — y lo que el testigo de `D-31` NO detecta

**Insertar una columna a la izquierda de una mapeada corre las letras y el motor apunta una más
allá sin fallar.** Con el paso 3 recién trazado se ve por qué **no** hay error posible: la letra
corrida da un índice válido, `headers[idx]` devuelve el título del **vecino**, y `obj[titulo]`
devuelve el valor del vecino. Un `SUMA` sobre la columna de al lado es un número, no una
excepción.

**Y hay un agravante que el frente no tenía escrito.** El paso 4 arma el objeto con
`if (h) obj[h] = fila[i]`, así que **con títulos repetidos gana el último**. En estas bases los
títulos repetidos son la norma —`Base_Digital` tiene ocho `ID Cuentas`, `Agenda JM | Post` cuatro
`% CTR`—. O sea: después de un corrimiento, el motor puede devolver **ni siquiera el vecino**,
sino el valor de la última columna que comparta ese título.

**Qué detectaría hoy el testigo de `D-31`: nada, automáticamente.** Está poblado —154 filas— y
**`leerMapeoSinCache_` (`Config.gs:139`) ni siquiera indexa la columna `encabezado`**: lee
`base_id`, `solapa`, `campo_logico`, `hoja`, `columna`, `tipo_esperado`, `valores_incluidos` y
`notas`. `buscarMapeo` devuelve `{ hoja, columna }`. **No hay un solo punto del camino de lectura
que compare el título esperado contra el encontrado.** Es coherente con lo decidido —*"la función
que valida se difiere"* (usuario, 14/08)— y hay que tenerlo presente: **el frente 6 dejó el dato,
no la alarma.**

Lo que el testigo **sí** habilita, y es lo que lo hace valioso: **un corrimiento pasa a ser
detectable por comparación**, en cuanto exista quien compare. Sin él ni eso.

Y lo que **no** habilitaría ni con la función escrita, porque es el límite de `C-09`: **el testigo
documenta el rótulo, no el contenido.** Una columna insertada cuyo título coincida con el
esperado —o dos columnas homónimas intercambiadas— pasan el chequeo. **Nunca es fallback**, y el
motivo es que los títulos se repiten.

### 4 · Lo que falta medir con la planilla — va al bloque 5

1. **¿La solapa `CC` de `looker` tiene hoy columnas que valga la pena mapear, y con qué títulos y
   en qué letras?** Sin eso no se puede escribir una sola fila de `MAPEO`, y es la medición que
   destraba el frente 7 entero. Instrumento: `censarSolapasParaAlta()` / `diagFormaDeSolapaExterna_`.
2. **¿Cuál es la fila de encabezado real de `looker/CC`?** `SOLAPAS` la declara; hay que
   verificarla contra la hoja, porque el desalineamiento entre lo declarado y lo real ya produjo
   `sin_datos` sin síntoma parecido a la causa (`_44`).
3. **La segunda medición que el frente 7 pide y que no se puede hacer sin la hoja: cuántos tokens
   ya validados cambian de valor.** Con cero mapeos de `CC`, hoy la respuesta esperada es
   **ninguno** — pero eso hay que confirmarlo contra la planilla viva y no contra el snapshot,
   porque el snapshot es del 15/08 y `MAPEO` se escribe desde dos herramientas.
4. **¿El alta de columna de `C-61` es a la izquierda o a la derecha de las columnas existentes?**
   Si va **a la derecha del todo**, ninguna letra se corre y el riesgo es cero. **Eso no lo
   decide esta corrida** — es del usuario, y está anotado abajo.

### Lo que quedó anotado como decisión del usuario, no resuelta acá

- **Dónde se inserta la columna de `C-61`.** A la derecha del todo el riesgo de corrimiento
  desaparece; en el medio, no. Es la diferencia entre un alta trivial y una que obliga a
  reescribir letras.
- **Si se escribe ya la función que valida el testigo de `D-31`.** Está diferida por decisión
  del 14/08 y esta medición muestra exactamente qué se gana escribiéndola — pero la decisión
  sigue siendo del usuario.

---

## Bloque 3 — PARADO: no hay dos universos de Call Center, hay uno cableado y uno que publica `—` (2026-08-16)

> **El bloque no produjo el prompt del frente 8, y es a propósito.** Regla 5 de la corrida: si
> una premisa falla, el bloque para ahí. Falló la central, medida contra
> `docs/_snapshots/MARCADORES_2026-08-15.tsv` y `MAPEO_2026-08-15.tsv`.

### La premisa, y qué dice la medición

El prompt la enunciaba así: *"`enc_*` filtra `Tipo de llamado IN (Convocatoria, IVR convocatoria)`
y `cc_*` no filtra"*. **Las dos mitades son falsas, cada una por su lado.**

**1 · No existe ningún marcador `cc_*`.** Cero filas en `MARCADORES`. `cc_base`, `cc_campanias`,
`cc_contactados` y `cc_contact_pct` son **tokens de las láminas 2 y 5** (`TOKENS.md`) **sin fila**,
y eso **no es un olvido: está decidido.** `_32.2`, recogido en `PENDIENTES`: publican `—` y no se
cablean, porque *"un cero ahí se leería como 'hubo cero llamados', que es una afirmación falsa
sobre el mundo; una raya dice 'no tengo el dato', que es verdad"*.

Lo que sí existe con ese nombre son **campos lógicos** —`cc_base_total`, `cc_base_discada`,
`cc_contactados`, `cc_contactados_pct`, `cc_efectivos`, `cc_efectivos_pct`— **de
`reuniones/Agenda JM`**, y los leen marcadores que se llaman `enc_*`. **`cc_` como prefijo de
token y `cc_` como prefijo de campo lógico son dos cosas distintas que se llaman igual**, que es
el modo de confusión que `CLAUDE.md` §4 ya tiene documentado.

**2 · Ningún `enc_*` filtra por `Tipo de llamado`.** La cadena entera —`MARCADORES` y `MAPEO` del
15/08, y los `.gs`— **no tiene una sola aparición de `Tipo de llamado` fuera de una nota del seed.**
Los nueve `enc_*` de Call Center leen `reuniones/Agenda JM` con **guardas `!=0` y nada más**, que
`D-33` ya clasificó como **restricción técnica, no dimensión**.

El único filtro `Convocatoria` que existe es **`mail_tipo=Convocatoria`**, en los seis `enc_*` de
**`digital/Directa Mail`**. Es **mail, no Call Center** — el prompt cruzó dos familias.

**3 · Y `looker/CC` no puede filtrar por tipo de llamado aunque se quisiera.** `X-21` lo midió en
vivo el 12/08: la solapa tiene **cinco columnas y ninguna más** —`ID Cuentas`, `Base enviada`,
`Base barrida`, `Contactados`, `Efectivos`—. Sin fecha, sin campaña, sin estado, **y sin tipo de
llamado.**

### El obstáculo que el prompt no podía saber: la fuente del corte está en `ignorar`

La columna `Tipo de llamado` con `Convocatoria` / `Reconfirmación` / `IVR convocatoria` /
`Informativo` está en **`reuniones/Call`** — y **`reuniones/Call` está `uso = ignorar`** desde el
alta del 15/08. Ídem sus dos recortes `Call (JM)` y `Call (Funcionarios)`.

**Por eso la Parte A que el prompt pedía no se puede escribir tal como está.** `CLAUDE.md` §2 es
explícita: una solapa `ignorar` no se lee, no se audita, no se mapea y no se diagnostica. Y el
motor la rechaza solo: `buscarMapeo` exige `uso === 'fuente'` **antes** de tocar `MAPEO`.

**El seed lo dejó anotado y es la punta del hilo, no una contradicción:** la nota de `Call` dice
*"insumo directo de la `R-NN` de los dos universos de Call Center"*, y la de **`Métricas EDVs`**
—`referencia`, 45 columnas— dice que es **el superconjunto de `Agenda JM`, con Call Center JM
separado de Call Center Funcionarios**, verificado para `1493`. O sea: **quien decidió el alta ya
sabía que ahí estaba el dato y lo dejó fuera del alcance de lectura a propósito.**

### La pregunta real, que sí existe y hay que escribir bien antes de prompearla

**No es "dos universos conviviendo".** Es esto, y es más chico y más nítido:

> **Los nueve `enc_*` de Call Center leen `reuniones/Agenda JM`, que es un agregado por encuentro
> ya calculado río arriba. Nadie declaró qué tipos de llamado entran en ese agregado.** El corte
> por `Tipo de llamado` existe una capa más abajo —en `reuniones/Call`, hoy `ignorar`— y el motor
> no lo ve. Así que hoy el motor **hereda un recorte que no eligió y que no está escrito en
> ninguna parte.**

Es el modo de falla del **número plausible**, sí — pero por herencia silenciosa, no por dos
familias compitiendo. Y es un caso más de `C-64`, las dos capas de la base: filas contra agregado.

### Lo que este bloque NO hizo, y por qué

- **No escribió el prompt del frente 8.** Redactar un `R-NN` sobre "dos universos" cuando el
  segundo no tiene marcadores sería documentar una ficción y darle la autoridad de una regla.
- **No escribió el instrumento de medición.** Su mitad `reuniones/Call` leería una solapa
  `ignorar`, y su mitad `looker/CC` ya está en la lista de corridas por el bloque 2. Un
  instrumento que reproduce el `uso` peor que el motor es exactamente el error que `CLAUDE.md` §4
  documenta.

### Las dos decisiones del usuario que destraban el frente 8

1. **¿`reuniones/Call` (o `Métricas EDVs`) pasa a `fuente`, o el corte se declara sin leerlas?**
   Es una escritura en `SOLAPAS` y una reversión de una decisión de hace un día — **no se toma a
   la madrugada y no se toma sin el usuario.** `Métricas EDVs` tiene el agravante de que su dueño
   es otra planilla y su clave es `ID Reunión`, no `ID Cuentas`.
2. **¿Los `cc_*` de las láminas 2 y 5 siguen publicando `—`?** Si la respuesta es sí, el frente 8
   no es sobre ellos y su alcance se achica al párrafo de la pregunta real. Si es no, `_32.2` se
   está derogando y eso necesita decirse.

---

## Bloque 5 — la lista de la mañana, y el cierre de la corrida nocturna (2026-08-16)

`docs/CORRIDAS_pendientes_2026-08-16.md`, que **reemplaza** al del 15/08 —queda como evidencia
congelada— y `HANDOFF_CODE.md` reescrito arrancando con esa lista.

**Cinco entradas, ordenadas por lo que destraban:**

| # | qué | qué destraba | ¿decide el usuario? |
|---|---|---|---|
| 1 | **`testigoDeImpresiones()`**, con el canario `gcba_frecuencia` como precondición | el frente 13 | sí, si no reproduce |
| 2 | **`censarSolapasParaAlta()`** sobre `looker/CC` | el frente 7, y con él el 11 | sí, y es previa: dónde se inserta la columna |
| 3 | **La Parte A de `R-26`** — no es un botón, es el prompt del 13/08 y nunca corrió | el frente 9, independiente | sí, gate explícito |
| 4 | **nada que correr** — el frente 8 está bloqueado por una decisión | — | sí, las dos escritas en el bloque 3 |
| 5 | una corrida del motor para completar el catálogo | mejora el frente 14 | sí, pero de **formato** |

**Dos entradas son negativas y eso es a propósito.** La 4 dice *"no hay instrumento que correr"* y
la lista tiene además un **«lo que NO hay que correr»** con `migrarPilotoDeImpresiones()`,
`revertirPilotoDeImpresiones()` e `instalar()` esperando que siembre. Una lista de botones que
sólo dice cuáles apretar deja al que la lee sin saber cuáles **no**, y las tres tienen precedente
de haberse apretado de más.

### El saldo de la corrida

**Cinco bloques, cinco commits, y dos de los cinco pararon o cambiaron de forma por una medición.**

- **El bloque 3 paró entero**, con la premisa falsa documentada y sin escribir el prompt ni el
  instrumento que pedía. Escribir un `R-NN` sobre *"dos universos"* cuando el segundo no tiene
  marcadores habría sido documentar una ficción **y darle la autoridad de una regla**.
- **El bloque 2 encontró que el riesgo de `C-61` cambió de signo** y que **el testigo de `D-31` no
  detecta nada todavía** — el frente 6 dejó el dato, no la alarma.
- **El bloque 4 casi publica una etiqueta verde que significaba menos de lo que parecía.** El
  cruce estático da **78 de 78 resuelven** contra los **diez en error** que el motor publica; la
  columna se llama `config` y no `estado` por eso, y el límite quedó escrito dentro del propio
  catálogo. **Sus dos controles positivos aíslan un chequeo cada uno** — el segundo marca 1 de 78,
  el correcto, con la causa correcta.

**Ninguna hoja de registro se tocó, ninguna plantilla, y los ocho del piloto quedaron como
estaban.**

---

## La decisión del orden: primero se cierra la migración, después se cablea (2026-08-16)

> Decisión del usuario, 16/08, aplicada al plan y a los prompts. **Ninguna hoja de registro se
> tocó.**

**Lo decidido, en una línea:** la secuencia viva es **Parte C del piloto → 12 bis → tanda 1**, y
todo lo que sea cableado espera. Los `cc_*` **siguen publicando `—` por `_32.2`** y eso no se
reabre.

### 1 · El frente 8 se corrigió y bajó a bloqueado — no se borró

Bajó del *Próximo* a *Planificado y bloqueado* con **el enunciado real** —*los nueve `enc_*` leen
un agregado por encuentro calculado río arriba y nadie declaró qué tipos de llamado entran en
él*— y con **la premisa falsa escrita adentro**, para que no vuelva por la misma puerta: decía
*"`enc_*` filtra por tipo de llamado, `cc_*` no filtra"* y las dos mitades son falsas.

**Queda dicho de dónde salió, porque es el aprendizaje reusable:** el frente venía de un reporte
de validación que **se pasó al plan sin cruzarlo contra `MARCADORES`**. Una cita no es la fuente.

**De sus dos decisiones, una está tomada** (los `cc_*` siguen en `—`) y la otra —si
`reuniones/Call` o `Métricas EDVs` pasan a `fuente`— queda **diferida detrás de la migración**,
igual que la de `C-61`. **Las dos son filas de §3 con su destrabe nombrado, no pendientes
sueltas.**

### 2 · Frente nuevo, `12 bis` — conectar el testigo de `D-31`, antes de la tanda 1

Prompt escrito: `docs/Prompts/2026-08-16_2_testigo_encabezado_conectado.md`. Lleva las tres
condiciones que puso el usuario, y una medición propia que las respalda:

- **La política ya está en `D-31` y la función la aplica, no la reinventa**: no corregir la letra
  sola nunca, reportar los dos valores, no bloquear la corrida.
- **El testigo compara rótulos, no contenido, y eso va en el código.** `C-09` es la prueba: en
  `RDV_otros_ministros` los encabezados están corridos **en origen**, así que el testigo va a
  coincidir siempre. Una guarda cuyo límite vive en otro documento se lee como si no lo tuviera.
- **La prueba se escribe antes y tiene que fallar.** Con el control positivo mínimo en **dos**
  casos, porque el segundo es el que suele faltar: *esperado ≠ real* reporta, y *esperado = real*
  **no reporta nada** — sin ése, una función que reporta siempre pasa el primero. Más un tercero
  que es el estado real de 7 filas: `encabezado` **vacío** no es desalineamiento.

**Se numeró `12 bis` y no se renumeró la tabla a propósito:** la bitácora es append-only y ya cita
"frente 7", "frente 13", "frente 14". Renumerar rompería citas que no se pueden editar.

### 3 · El canario sucesor no existe, y por eso `frecuencia`/`gcba_frecuencia` salen de la tanda 1

**El pedido era elegir un canario sucesor** —*sin migrar, de otra solapa, y que ya salga en el
log*—. **La medición dice que no existe:**

**`looker` tiene exactamente diez marcadores** — los ocho del piloto (`DIGITAL/Impresiones`, ya
migrados) y `frecuencia`/`gcba_frecuencia` (`resumen_metricas_dinamico`). **No hay un tercer
grupo.** Si la tanda 1 se lleva el par, quedan **cero** marcadores de `looker` sin migrar, y se
pierde el canario de la base que **demostró moverse**.

**Así que el par sale de la tanda 1**, que queda en `mail_*`/`gcba_mail_*` y nada más.

**Y hay un segundo camino que llegó a lo mismo, que además explica de dónde venía la confusión:**
los `mail_*` viven en **`digital/Directa Mail`**, no en `looker`. **La tanda 1 nunca necesitó un
canario de `looker`: necesita uno de `digital`** — y ahí sí hay, los cuatro grupos de
`digital/Directa IVR`, con **`filtro` vacío**, que **no se migran en ninguna tanda** y ya salen en
el log. Eran dos preguntas leídas como una.

**Lo que generaliza, y es lo que sobrevive:** **la propiedad de un canario no es *"nunca
migrado"*, es *"no lo toca el cambio que estoy midiendo"*.** Escrita así, el canario de cada tanda
se elige solo y deja de hacer falta que exista un marcador virgen para siempre — que es justo lo
que esta medición mostró que no se puede garantizar.

Todo esto quedó en el **Addendum 4** del prompt del piloto, con la advertencia para el día que el
par migre: **su propia verificación no va a tener un marcador sin migrar de esa base en el que
apoyarse.**

### 4 · El catálogo se regenera después de cada tanda

Anotado en `PLAN.md` (frente 14) y en el encabezado de `tools/catalogo.js`: **es parte de cerrar
la tanda, no una tarea aparte.** Un catálogo que se regenera cuando alguien se acuerda es el `.md`
a mano que esto vino a reemplazar.

**Y anotado para el rediseño: la columna `config` se conserva como distinción.** Dice *"la fila
está bien armada"*, no *"el token anda"* — el cruce estático da **78 de 78** mientras el motor
publica **diez en error**.

---

## `2026-08-16_3` — el testigo de `D-31` conectado, y dos prompts preparados (2026-08-16)

> Segunda corrida nocturna del día. Tres bloques, cuatro commits, **código y documentación
> separados** — la desviación de la corrida anterior no se repitió. **Ninguna hoja de registro se
> tocó.**

### Bloque 1 — `D-31` conectado: el testigo deja de ser un dato y pasa a ser una alarma

**La causa raíz era una línea que no estaba.** `leerMapeoSinCache_` indexaba `base_id`, `solapa`,
`campo_logico`, `hoja`, `columna`, `tipo_esperado`, `valores_incluidos` y `notas` — **y no
`encabezado`**. La columna existía desde el 14/08 y **no la leía nadie**, así que `buscarMapeo` no
podía devolverla y no había con qué comparar. El frente 6 dejó el dato y no la alarma porque le
faltaba eso.

**Lo que se escribió, en orden de importancia:**

| pieza | dónde | qué hace |
|---|---|---|
| `desalineamientoDeEncabezado_` | `Union.gs` | **pura**: esperados × real → `null` o `{esperados, real}` |
| el enganche | `encabezadoEnColumna_` | compara y avisa. **El valor devuelto NO cambia nunca** |
| `encabezadosEsperadosEnColumna_` | `Union.gs` | resuelve los esperados **por letra**, no por `campo_logico` |
| el aviso | cierre de corrida (`Generador.gs`) | porque **un reporte que no se lee es una función que no existe** |
| `verificarEncabezadosDeMapeo()` | `Auditoria.gs` | wrapper público que barre **todo** `MAPEO` sin generar informe |

**Se resolvió por letra y no por `campo_logico`, y eso tuvo una consecuencia de diseño que salió
de medir.** Entrar por la letra permite que la comparación viva en el **único** punto donde la
letra se vuelve columna, sin tocar sus **once** llamadores. Pero por letra la relación es de
varios a uno: **`MAPEO_2026-08-15.tsv` tiene 12 grupos (base, solapa, letra) con más de una
fila** —`looker/resumen_metricas_dinamico/C` tiene tres, y `rdv/RVD JM-CM - ES/E` tiene dos con
testigos **distintos** (`''` y `'FECHA'`)—, porque dos `campo_logico` pueden apuntar a la misma
columna física.

**Por eso el comparador recibe una LISTA.** Si el real coincide con **alguno** de los declarados,
no hay desalineamiento. Tratarlo como valor único habría producido avisos falsos sobre doce grupos
el primer día, y **una alarma que grita de entrada es una alarma apagada**.

**La política de `D-31` se aplica, no se reinventa**, y las tres reglas quedaron en el código:
no corregir la letra sola nunca —el testigo **no es fallback jamás**, porque los títulos se
repiten y un fallback acertaría a veces y erraría **en silencio** otras—, reportar los dos
valores, y no bloquear la corrida (de ahí el `try` alrededor del aviso: un instrumento que rompe
lo que mide es peor que no tenerlo).

**Y el límite quedó escrito en el código, no sólo en `D-31`:** el testigo compara **rótulos, no
contenido**. `C-09` es la prueba —en `RDV_otros_ministros` los encabezados están corridos **en
origen**— así que ahí va a coincidir siempre. Una guarda cuyo límite vive en otro documento se lee
como si no lo tuviera.

#### La prueba se escribió antes, falló, y después se interrogó

`tools/probar-encabezado.js`, **fuera de Apps Script y extrayendo el código real del repo** —lee
`Union.gs` y `Fuentes.gs` por texto y saca las funciones por nombre—. Una copia pegada probaría la
copia, y el día que alguien tocara el `.gs` seguiría en verde sobre código que ya no existe.

**Corrió primero y falló**, con el error correcto: *"No encontré `function
desalineamientoDeEncabezado_(` en Union.gs"*.

**Un detalle del arnés que valió la pena arreglar bien:** la primera versión evaluaba cada función
en su propio scope y `desalineamientoDeEncabezado_` no veía a `normalizarValorDeclarado_`. **Apps
Script concatena todos los `.gs` en un scope global único** —la premisa de la §1— así que
evaluarlas por separado probaba un entorno que no existe. Se corrigió a un solo scope.

**Los tres casos obligatorios están, y dos más que hicieron falta:** *esperado ≠ real* reporta ·
*esperado = real* no reporta —sin éste, una función que avisa **siempre** pasaría el primero— ·
`encabezado` vacío no es desalineamiento (las 7 filas de `promoverFechasElegidas()`) · la aliasing
de los 12 grupos · y el límite `C-09` afirmado **como comportamiento declarado**, para que no sea
una sorpresa. **13 afirmaciones.**

**Y después la pregunta que este repo ya pagó no hacer** —*"¿con qué otro dato seguiría
pasando?"*—, respondida con cinco mutantes: *siempre null* · *siempre avisa* · *pliega el case* ·
*sólo mira el primer esperado* · *no normaliza*. **Los cinco mueren.** La prueba distingue las
cinco implementaciones rotas, y eso es lo que la separa de un control que pasa por casualidad.

### Bloque 2 — dos prompts, y un instrumento que ya existía

`2026-08-16_4` (tanda 1) y `2026-08-16_5` (los `pauta_*`), **escritos y sin ejecutar**.

**El canario de la tanda 1 es `enc_atendidos`/`ivr_atendidos`** —`digital/Directa IVR`,
`ivr_atendidos`, `SUMA`—. Cumple lo pedido —`filtro` vacío, otra solapa, ya sale en el log— y se
eligió sobre los otros tres grupos por una razón fina: **es `SUMA` y no `PCT`**. Un ratio puede
quedarse quieto mientras numerador y denominador se mueven en proporción, así que **un `PCT`
estable no prueba que la base esté quieta**. Y de regalo, el par son **dos lecturas independientes
de la misma medida**: si divergen entre sí, el problema es del instrumento.

⚠ **Y el instrumento de la tanda 1 ya existía: `testigoDeImpresiones()` no es de impresiones.**
Agrupa **todos** los marcadores por medida y emite **todo grupo de dos o más**, así que los cuatro
grupos de mail, los tres de `pauta_*` y los cuatro de `Directa IVR` **ya salen en su log hoy**. Es
la misma propiedad que lo hace indiferente a dónde vive el corte. **No se escribió un testigo
nuevo**, que habría sido un duplicado. **Su nombre es deuda**, y **no se renombra mientras la
Parte C esté abierta**: la lista de corridas y el prompt del piloto lo nombran así.

**Lo único que faltaba es la mitad de láminas**, y para eso se escribió `censarTokensEnPlantilla()`
—wrapper público, sólo lectura, sin correr—: `diagTokensDeLamina_` contesta *"qué tokens tiene
esta lámina"* y la pregunta inversa no la contestaba nadie. **Un número publicado dos veces no se
entiende sin saber en qué lámina se publica cada copia**: mismas láminas y distintas láminas son
dos problemas distintos.

**Los `pauta_*` no entran a ninguna tanda, y el prompt dice por qué con todas las letras:**
migrados, el `gcba_` pasaría del nombre a `dimensiones` y **el error se volvería invisible** — se
leería como una medida bien cortada por ámbito que casualmente da lo mismo en las dos ramas.
**Migrarlos convertiría un error en un error estructurado.**

### Bloque 3 — la lista de la mañana

`CORRIDAS_pendientes_2026-08-16.md` y `HANDOFF_CODE.md` actualizados. Entraron **1 bis**
(`verificarEncabezadosDeMapeo()`), **1 ter** (la tanda 1, que es prompt y no corrida) y **3 bis**
(los `pauta_*`), los dos últimos marcados **"el usuario lo revisa antes"**. Se mantuvo *lo que NO
hay que correr*, con `revertirPilotoDeImpresiones()` adentro.

---

## SECCO es semanal, y la ventana no se resuelve por informe (2026-08-16)

> Medición pedida por el usuario, con la corrección documental que le siguió. **La celda de la
> hoja no se tocó** — se corrigió el seed; la hoja la actualiza *Aplicar configuración*.

### `periodicidad` no tiene un solo lector

Aparece en tres lugares —el comentario de contrato de `leerInformes()`, la lista de headers de
`SEED_INFORMES_` y los dos valores del seed— y **nadie la consulta**. Cero `.periodicidad` en el
código.

**Así que corregirla no arregla nada y no rompe nada.** Se corrigió igual, a `semanal`, y el
motivo va escrito al lado del valor: **una celda que dice lo contrario de la realidad es peor que
una vacía**, porque el día que alguien conecte `periodicidad` a la cadena va a heredar el valor
viejo **creyendo que estaba verificado**. Un dato declarado y nunca leído no acumula evidencia de
estar bien, sólo apariencia de.

### El hallazgo real: la cadena de `D-20` no tiene eslabón de informe

Los cinco eslabones son **campaña → `periodo_ref` del marcador → sección → `CONFIG` → `R-11`
calculado**, y **`resolverVentana` ni siquiera recibe `informe_id`**.

**Entonces `jm` y `secco` resuelven hoy exactamente la misma ventana** —`CONFIG.periodo_desde/
hasta` = 24–30/07, origen `config`—, y no por casualidad: `CONFIG` es **un único par de celdas
global**. Los eslabones 2 y 3 **no se disparan nunca**: `periodo_ref` está vacío en los **78
marcadores** y en las **36 secciones**.

**Se puede forzar a mano** —`generarInforme(informeId, periodoId)` pisa la cadena entera, y el
panel ya lo expone por `panel_generar`— **pero no se resuelve solo.**

**Qué más asumía "mensual": sólo prosa.** El título de `CONFIG_INFORMES.md` §2 y un ejemplo de
`Paso-0-v2.md`. Ninguna hoja: `PERIODOS` sólo tiene `m2_mensual`, que es de M2. **`secco` no tiene
marcadores todavía, así que el daño era potencial y no actual** — eso bajó la urgencia.

### Una afirmación vencida encontrada de paso

`CONFIG_INFORMES.md` §2.0 decía *"y la ventana ya se resuelve por informe"*. **Es falsa**, y
estaba justo al lado de lo que había que agregar. Se corrigió con la medición al lado: **el
razonamiento del punto sigue en pie; lo que no existía era el mecanismo.**

### Los dos apuntes, a destinos distintos porque no son la misma clase de cosa

- **`PLAN.md`, `D-33` Addendum 1** — *un token compartido da números distintos en `jm` y `secco`,
  y los dos están bien*, porque **la ventana pertenece al informe, no al token**. Va ahí porque es
  una propiedad del vocabulario global y es donde va a buscar el que dude: **compartir el token es
  lo que hace los números comparables a simple vista, y por eso mismo invita a compararlos.** Con
  su contracara dicha junto, o la propiedad se lee como permiso: **la ventana se descarta primero,
  no siempre**.
- **`CONFIG_INFORMES.md` §2.0 bis** — *la copia sin recalcular deja de ser posible, no deja de
  estar permitida*, cuando cada informe se genere con su ventana. Es consecuencia editorial y
  operativa, no regla del motor.

**El desfasaje en juego son ~15 horas** —SECCO el jueves a la noche, JM el viernes al mediodía— y
el 15/08 se midió que `looker` movió **138.427 impresiones en 1h45**: la ventana es **ocho veces**
ésa.

### Y una precisión sobre `R-11`, porque acá 15 horas importan

Se citó como *"de viernes a viernes"*. `semanaR11_` computa **viernes + 6 días = viernes a
jueves**, siete días, que es lo que `PLAN.md` ya decía. **La regla ya es viernes-a-jueves; lo que
cambia con SECCO no es el largo sino dónde cae el corte.**

### Estado del `2026-08-13_48`, revisado

**El mecanismo de elegir período al generar está implementado y andando**: panel, override por
`periodoId`, y `CORRIDAS.periodo_id`. **Lo que nunca se usó es la declaración** — `periodo_ref`
vacío en los 78 marcadores y en las 36 secciones. El período se elige **por corrida y a mano**; no
está declarado en ningún lado.

**El eslabón de informe es prompt propio, y lo escribe el usuario.**

---

## Por qué el sembrador no aplicó `periodicidad`: código sin pushear (2026-08-16)

> Medición pedida por el usuario tras correr *Aplicar configuración* y ver que la celda no
> cambiaba. **No se tocó el sembrador.**

### La causa, y el error es de esta sesión

**`clasp push` corrió ANTES de que yo editara el seed**, y después de corregirlo commiteé a git y
**no volví a pushear**. Le dije al usuario *"el camino es el sembrador"* sobre un cambio que sólo
existía en el repo.

**Verificado, no deducido:** se bajó el proyecto a un temporal con `clasp pull` —sin pisar nada
del repo— y `Instalar.js` del proyecto **seguía diciendo `periodicidad: 'mensual'`**.

**El sembrador hizo exactamente lo correcto.** Corrió con un seed que decía `mensual`, la hoja
decía `mensual`, no había diferencia, no escribió, e informó *"sin cambios"* — que era verdad
sobre el código que tenía delante.

**No es el mismo caso del 15/08**, aunque el síntoma sea idéntico: aquél era **la corrida
equivocada** (`instalar()` no siembra), éste es **código sin pushear**. **En los dos la conclusión
rápida habría sido "el sembrador está roto"**, y en los dos habría sido falsa. La regla quedó en
`CLAUDE.md` §4, con el chequeo barato: `clasp pull` a un temporal responde qué versión corrió, en
dos comandos y sin efectos.

### Las tres candidatas del usuario, descartadas con evidencia

`D-32` vive **sólo** dentro de `aplicarClasificacionSolapas_` y **sólo** sobre `SOLAPAS.uso`. No
hay protección por `origen`. Y `calcularDiffUpsert_` recorre `Object.keys(obj)`, así que **compara
todas** las columnas del seed, `periodicidad` incluida. `INFORMES` **sí** se siembra, por
`upsertPorClave_`.

### Pero la pregunta encontró otra cosa, y es lo que queda

**La preocupación de fondo —*"si corregir un valor existente en el seed no llega nunca a la hoja,
toda corrección de esta migración va a necesitar edición manual"*— era correcta, y hay dos hojas
donde pasa:**

- **`CONFIG`** — `seedConfigConfig_` escribe **sólo si la celda está vacía**. **Es deliberado y
  está explicado**: el default es piso, no autoridad.
- **`SECCIONES`** — `sembrarSecciones_` **sólo inserta filas nuevas y nunca actualiza**, y **no
  hay nota que lo justifique**. → `PENDIENTES`, con la distinción y su destrabe: hace falta saber
  si debe comportarse como `CONFIG` o como `BASES`. **No se decidió.**

**Y para la tanda 1 la respuesta tranquiliza por un motivo distinto del esperado:** `MARCADORES`
**no tiene sembrador en absoluto**, así que la migración escribe por `curarCamposMarcadores_` y
**no compite con ningún seed**. No va a necesitar edición manual.

**La tabla de las once hojas —mecanismo y si una corrección llega— quedó en `docs/ESCRITORES.md`
§1 bis**, que es donde se busca. Es la respuesta a una pregunta que se hizo dos veces esta semana
y que se va a volver a hacer en cada tanda.

### El estado, al cierre

`clasp push` corrido y **verificado contra el remoto**: el proyecto dice `semanal` y tiene las
tres funciones nuevas. **La hoja ya la había corregido el usuario a mano**, así que hoja, seed y
proyecto coinciden y no queda divergencia.

---

## ✅ El piloto de `D-33` pasó — y qué lo decidió, que no fue la igualdad de valores (2026-08-16)

**Los ocho marcadores de `looker/DIGITAL/Impresiones` quedan migrados y verificados. Autoriza el
frente 13, la migración por tandas.**

**Ventana:** 24–30/07/2026, la que el motor resuelve por defecto (`CONFIG`), la misma en las dos
tomas. **Testigo: 15/08 21:26** (`docs/_snapshots/TESTIGO_impresiones_2026-08-15_2126.md`).
**Migración: 15/08 22:40. Parte C: 16/08 11:58.**

### El criterio, en el orden del Addendum 1 — y el paso 0 es el que hizo falta dos veces

| # | qué | resultado |
|---|---|---|
| 0 | **canario `gcba_frecuencia`** | de `0` a **1,6409** → `looker` estable, el log se puede leer |
| 1 | **cuentas de filas** | **idénticas**: 46, 313, 14, 12, 20, 82, 84, 147 |
| 2 | valores | subieron **0,3%–2,1%**, todos en la misma dirección |
| 3 | **descuadre** | **cero exacto** en los dos ámbitos |
| 4 | `frecuencia`, **sin migrar** | 12,63 → **13,20** |

**La regla que decidió: mismas filas y otro número es la fuente; otras filas sería la migración.**
Si la dimensión tradujera mal la condición **cambiaría la cuenta de filas**, no sólo la suma. No
cambió. Y el paso 4 lo confirma **desde afuera**: un marcador que la migración no tocó se movió en
la misma dirección.

**El canario se ganó su lugar dos veces.** Los dos intentos de Parte C del 15/08 dieron "no
concluyente" **y no era la migración** — era `looker` recalculando. Sin el canario, esos dos
habrían leído como piloto roto y se habría revertido un cambio que estaba bien.

### ⚠ El límite honesto, escrito para que no se lea de más

**La migración NO se verificó por igualdad de valores, y no se podía.** Con `looker` recibiendo
datos de una ventana ya cerrada —el 15/08 movió **138.427 impresiones en 1h45**— **el valor
absoluto no es un testigo estable**, y exigir igualdad habría dado un rojo falso.

**Se verificó por identidad de filas + descuadre en cero + canario.** Los ocho números de hoy
**son distintos** a los del testigo, y eso está bien. **No es una comparación exacta y nunca lo
fue.**

### Dos reservas del cierre, que no cambian el veredicto y sí cambian la próxima tanda

- **El testigo no guardó las cuentas de filas, que son el criterio principal.** Tiene los ocho
  valores y el descuadre, y nada más. **El artefacto diseñado para comparar omitió justo el número
  contra el que se compara**, y las ocho cuentas sobrevivieron **de casualidad**: quedaron citadas
  en esta bitácora y en el Addendum 3 del prompt. → Ahora es requisito explícito en el prompt de
  la tanda 1.
- **Tres de los ocho valores base están inferidos**, no confirmados: los
  `gcba_imp_{meta,google,prog}` traen el valor pero **su asignación a cada token se dedujo del
  orden de la suma** — el propio testigo lo advirtió. **No afecta al cierre**, porque el descuadre
  usa la suma (igual en cualquier orden) y el criterio es la cuenta de filas. **Pero la
  comparación uno a uno de esos tres no es firme** y no debe citarse como si lo fuera. → También
  es requisito en la tanda 1: cada valor atribuido a **su** token, nominalmente.

**Verificado de mi lado antes de coincidir:** el descuadre del testigo da cero exacto en los dos
ámbitos —`3.229.815 + 2.203.210 + 27.976.790 = 33.409.815` y
`31.204.680 + 53.969.375 + 163.706.084 = 248.880.139`—. **El log del 11:58 no lo tengo**: sus
números entran como reportados, y lo que verifiqué es el criterio y la línea base.

---

## Corrección — `digital` no está quieta: lo estable es la ventana cerrada (2026-08-17)

**Se venía afirmando que `digital` está quieta y es falso.** Entre el testigo de la tanda 1
(16/08 23:31) y una corrida del 17/08 12:54, `digital/Directa Mail` creció:

| | 16/08 23:31 | 17/08 12:54 | |
|---|---|---|---|
| universo | 2.239 | **2.241** | +2 |
| `convocatoria` | 359 | **361** | +2 |
| `m2` | 745 | 745 | = |

**Las dos filas nuevas caen FUERA de la ventana.** En ventana sigue dando 11 de 361 y 25 de 745, y
**los siete valores de `m2_*` son idénticos**.

**La afirmación correcta es más chica y más verdadera: la ventana cerrada de julio no se mueve.**
Eso es lo que sostuvo la verificación por igualdad exacta de la tanda 1 — no la quietud de la base.

**Y la distinción ya estaba escrita, para otra base.** El prompt de `rdv` decía *"un «no se movió»
en una ventana cerrada no prueba que nunca se mueva… es la diferencia entre «está quieta» y «esta
semana no la tocaron»"*. **Se escribió para `rdv` y no se aplicó a `digital`** — una regla puesta
en el lugar donde se descubrió y no en el lugar donde se usa.

**Corregido en:** `PLAN.md` (tres lugares), el prompt de la tanda 1, el de la tanda 2 y el testigo
del 16/08 23:31, que lleva addendum en vez de edición.

### La consecuencia práctica, que vale para todas las tandas que vienen

⚠ **El control de cobertura de la tanda 2 usa el UNIVERSO COMPLETO, así que SÍ se mueve entre
tomas.** El de la tanda 1 usaba **sólo cuentas en ventana** —311 y 1.928— y por eso era estable.

**Un `RESTO` distinto entre la Parte A y la Parte C es lo esperable, no una anomalía**, y hay que
leerlo en orden: ¿creció el universo? → ¿se movió `m2`, que es lo que se migra? → **sólo si el
universo NO cambió y el `RESTO` sí**, la dimensión traduce distinto. Sin ese orden, el crecimiento
normal de la base se lee como una migración rota.

---

## La segunda toma de `rdv` no responde la pregunta, y se registra así (2026-08-17)

Dio **idéntica** a la primera —4 de 15, identidad de canales en 2.307, los 17 valores iguales—
**pero fue 12 horas después, no dos o tres días.**

**Con una cadencia de carga de dos o tres días, 12 horas no distinguen *"quieta"* de *"todavía no
la tocaron"*.** Es exactamente lo que la advertencia del prompt anticipaba cuando se escribió.

**Queda registrada como una tercera lectura consistente** —tres corridas, mismos números, sirve
para confirmar que el instrumento es estable— **y nada más.**

**Contarla como respuesta habría sido el error que ese prompt existe para evitar:** tomar una
identidad producida por la **cadencia** y leerla como **estabilidad**. Un verde que no prueba lo
que dice, del mismo tipo que la prueba de `ULTIMO` que pasó meses afirmando algo que no verificaba.

**La toma que decide va el miércoles 19 o jueves 20.**

---

## `rdv` destrabada: la pregunta estaba mal planteada (2026-08-17)

**Cambio de criterio del usuario, y con él se destraba la tanda más grande.**

La pregunta 1 del `2026-08-17_2` era *"¿está quieta `rdv`?"*, y se hacía para saber **si se puede
comparar entre tomas separadas por días**. **No hace falta comparar así.** La verificación corre
**testigo → migración → testigo en la misma sesión**, con **minutos** entre tomas.

**La evidencia que lo sostiene:** dos lecturas separadas **12 horas** dieron idénticas — 4 de 15
en los diecisiete, identidad de canales en 2.307, los 17 valores iguales. **Si en 12 horas no
cambió, en cinco minutos no cambia**; y si cambiara, **las 17 cuentas de filas lo delatarían**,
que es el primer control que se mira.

**Más las dos invariantes que no dependen del drift:** las 17 cuentas iguales entre sí, y la
identidad de canales cerrando exacto. **Con eso alcanza; el canario sobra.**

### El criterio corregido, que es lo reutilizable — `CLAUDE.md` §4

**La pregunta no es *"¿está quieta la base?"* sino *"¿se mueve DENTRO del intervalo de la
verificación?"***. Las dos se confunden fácil y llevan a conclusiones opuestas:

- **`digital` parecía quieta y no lo está** — creció de 2.239 a 2.241 en 13 horas. Lo estable era
  **la ventana cerrada**.
- **`rdv` no necesita canario aunque no tenga ninguno posible**, porque el intervalo es de minutos.
- **Una base que se mueve NO bloquea la verificación si el intervalo es corto.** Lo que bloquea es
  comparar contra un testigo **de otro día** — que es lo que pasó en el piloto, y por eso allá el
  canario sí hizo falta.
- **Y para elegir controles:** los que dependen del **universo completo** se mueven entre tomas;
  los que viven **dentro de la ventana** no.

**Es la tercera vez que una regla de este proyecto se corrige por alcance y no por contenido** —
`D-31` (el testigo compara rótulos, no contenido), *"`digital` está quieta"* → *"la ventana está
quieta"*, y ahora *"¿está quieta?"* → *"¿se mueve en el intervalo?"*. **Las tres veces la versión
corregida era más chica y más verdadera.**

### Lo que quedó escrito en código

`migrarTanda2DeM2()` / `revertirTanda2DeM2()` — los siete `m2_*` a `tipo_envio=m2`.
`migrarTanda3DeRdv()` / `revertirTanda3DeRdv()` — los 17 de `rdv` a `ambito=jm`.

**Las 24 reversiones se generaron leyendo `MARCADORES_2026-08-17.tsv` y se verificaron carácter a
carácter contra él.** `figura=Jorge Macri` lleva un espacio interno y `mail_tipo~=M2` un `~=`:
transcribirlos a mano produce filtros que **no matchean ninguna fila y devuelven cero sin fallar**.

---

## Tandas 2 y 3 cerradas — 40 de 48, y el método quedó probado (2026-08-17)

**Las dos por igualdad exacta, las dos con verificación en la misma sesión.**

| tanda | qué | testigo | migración | verificación | intervalo |
|---|---|---|---|---|---|
| **2** | siete `m2_*` → `tipo_envio=m2` | 13:59 | 14:04 | 14:10 | 11 min |
| **3** | 17 de `rdv` → `ambito=jm` | 14:19:06 | 14:19:39 | 14:24:58 | 5 min 52 s |

**Tanda 2:** canario 71.234 · los siete idénticos · cobertura `361 + 745 + 1.136 = 2.242` ·
universo sin moverse entre tomas.

**Tanda 3:** los 17 idénticos · **las 17 cuentas iguales entre sí, 4 de 15** · **identidad de
canales exacta en 2.307**. Sin canario y sin necesitarlo.

**Verificado contra la hoja, por fuera del motor:** `MARCADORES_2026-08-17.tsv` muestra **40 de 78
con `dimensiones` poblada**. Catálogo regenerado contra ese snapshot.

### Lo que probaron sobre el método, que es lo reutilizable

**La verificación en la misma sesión funciona.** Con minutos entre tomas el drift no alcanza a
intervenir, y si interviniera **las cuentas de filas lo delatarían antes que los valores**.

**Y vale aunque la base se mueva:** `digital` crece de a una o dos filas por hora —2.239 → 2.241 →
2.242 en un día— y los siete `m2_*` dieron idénticos igual, **porque en once minutos no se movió**.

⚠ **El universo estable entre tomas es lo que hizo legible la cobertura, y no estaba garantizado.**
Si hubiera crecido, el `RESTO` habría cambiado sin que la migración tuviera nada que ver — por eso
el orden de lectura empieza por *"¿creció el universo?"*.

### El estado: los ocho que quedan están bloqueados por causas distintas

**No son "lo que falta de la cola": son dos problemas separados y sólo uno es una tanda.**

- **`frecuencia`/`gcba_frecuencia`** — la tanda 4, **destrabada**, prompt escrito. Era el canario
  de `looker` y por eso iba última.
- **Los seis `enc_mails_*`** — ⚠ **no es un problema de migración.** No publican por
  `«FALTA:@ultimo_ambiguo»`, así que **no hay contra qué verificar**. Su destrabe es **una decisión
  del usuario sobre el dato**: cuál de las dos filas del 28/07 vale.

**Cuando la tanda 4 cierre, la migración estará completa sobre todo lo que se puede migrar: 42 de
48.** Los seis no son deuda de vocabulario, son un hueco de dato.

### Y por qué la tanda 4 invierte el orden de sus controles

**`looker` se mueve DENTRO de ventanas cerradas** —+138.427 impresiones en 1h45 el 15/08, y un
numerador en cero durante un recálculo—, mientras `digital` crecía **fuera**. Así que **la
igualdad exacta puede no darse aunque la migración esté bien**.

**El control principal pasa a ser la partición:** `frecuencia` lee 4 de 26 y `gcba_frecuencia` 22
de 26, y **4 + 22 = 26** es exhaustiva por construcción. **La cuenta de filas no depende del drift
de los números** — `looker` puede recalcular impresiones sin que cambie cuántas campañas hay.

---

## 2026-08-17 — Tanda 4: el código, y el testigo que esta vez nace completo

**Escritas las cuatro funciones** que el `2026-08-17_4` nombraba y todavía no existían:
`testigoDeFrecuencia()` y `operandosDeRatio_()` en `Auditoria.gs`, `migrarTanda4DeFrecuencia()` y
`revertirTanda4DeFrecuencia()` en `Instalar.gs`. **Pusheadas y verificadas con `clasp pull` a un
temporal** — las cuatro están en el proyecto de Apps Script, no sólo en el repo.

### El testigo emite valores nominales desde el principio, y es una corrección de método

**Es la tercera vez que un testigo se queda corto y se arregla después de haberlo usado:** el de
impresiones nació sin cuentas de filas, el de mail dejó tres valores inferidos del orden, y el de
las tandas 2 y 3 cerró sobre *"los siete idénticos"* y *"los 17 idénticos"* **sin un solo valor
marcador por marcador** — así que hoy 20 de esos 24 no tienen valor de referencia registrado.

**Acá son dos marcadores: no hay excusa de volumen.** `testigoDeFrecuencia()` emite valor, cuenta
de filas con las dos etapas rotuladas, y **los dos operandos del `RATIO`** —`dig_impresiones` y
`alcance`— **antes de cualquier veredicto**, aun si después un control falla.

**Por qué los operandos, y por qué acá más que en las otras tandas:** son lo único que distingue
tres cosas que se ven igual cuando el ratio cambia. Mismos operandos y otro ratio es imposible —
sería un bug de `opRATIO`—; operandos distintos con la partición cerrando es `looker` recalculando;
operandos distintos con la partición rota es la migración. **Se leen de la traza que el motor ya
emite**, no se recalculan por fuera.

### La partición está cerrada por CÓDIGO, y ahora está ejecutada

`valorPasaFiltro_` calcula `coincide` **una sola vez** y devuelve `coincide` o `!coincide` según
`negado`; `~=` y `!~=` comparten `op` y difieren **sólo** en ese booleano. **Sobre la misma celda
devuelven exactamente lo contrario, cualquiera sea el dato.** Mismo tipo de cierre que resolvió la
disjunción de la tanda 2 leyendo `cumpleCondicion_`.

**El caso de borde que faltaba confirmar —la celda vacía— no rompe nada:**
`normalizarValorDeclarado_('')` da `''`, `''.indexOf('JM')` da `-1`, así que `~=` es falso y `!~=`
verdadero. **Una fila sin campaña cargada cae en `gcba` y no se pierde**, que es lo que `D-33` ya
declaraba: `gcba` es *todo lo que no es `jm`*.

**`tools/probar-tanda4.js`** lo prueba con **22 afirmaciones en verde**, sobre código **extraído
del repo por texto** y evaluado en un solo scope. Cubre siete valores de celda incluidos el vacío
y el de sólo espacios, **y lleva un control negativo** —`~=JM` contra `~=GCBA`, que **no**
particionan— sin el cual la prueba pasaría con un comparador que devolviera cualquier cosa.

### Dos cosas que el testigo mide y el control positivo no puede

- **Que los dos lean el MISMO universo.** La complementariedad es sobre **una fila**; la partición
  exige además que ambos partan del mismo conjunto. `4 de 26` y `22 de 30` suman 26 igual y no
  querrían decir nada. Si los universos difieren, el testigo **para y lo dice** en vez de sumar.
- **Que la cuenta de filas siga siendo legible después de migrar.** Es lo que `CLAUDE.md` §4 pide
  explícitamente: el instrumento no puede depender de lo que el cambio modifica. Verificado en el
  código —las dimensiones se traducen a condiciones y pasan por el **mismo**
  `aplicarFiltroDeMarcador_`, así que la traza conserva el rótulo `filtro`— y afirmado en la
  prueba: lo que cambia es el texto **dentro** de las comillas, y `filasDeTraza_` no lo usa como
  ancla.

### El `filtro` queda vacío, y acá está escrito por qué no se pierde nada

Las notas de las dos filas declaran que **no llevan `estado=Activa` a propósito**: con ese filtro
las únicas dos filas `Activa` de la ventana eran las dos de `JM` y `gcba_frecuencia` quedaba en
**0 de 26** — *"un par complementario con una mitad vacía no es un universo"*. **No hay guarda que
derogar.** Es el único caso de las cuatro tandas donde la ausencia de restricción técnica es una
decisión documentada, así que se cita en vez de asumirse.

---

## 2026-08-17 — La tanda 4 NO se ejecutó, y los dos bugs que lo dejaron pasar

`migrarTanda4DeFrecuencia()` reportó **0 celdas** a las 19:10 y los testigos de las **19:08** y
las **19:15** dieron idénticos **porque en el medio no hubo migración**: el `filtro` seguía en
`campana~=JM` y `campana!~=JM`. **No reprodujo: no pasó nada.**

### Bug 1 · un lote vacío informaba cero y seguía con el paso siguiente

**Es el mismo modo de falla del 15/08 con el alta de las 20 solapas** —corrida que termina bien,
hoja que no se mueve— y esta vez el escritor tenía todo para avisar: sabía que no había escrito
nada y sabía por qué.

⚠ **Lo que lo hace caro es que el cero se disfraza de éxito justo donde el criterio es la
igualdad.** *"Los dos testigos coinciden"* es la definición de tanda cerrada, y una migración que
no ocurrió **la satisface perfecto**. El log de las 19:10 explicaba cómo leer una Parte C que
nunca iba a existir.

**`curarCamposMarcadores_` ahora devuelve `ok:false` cuando el lote no escribe ninguna celda**,
con el diagnóstico por marcador: si existe la fila, qué dice la hoja y qué se pedía, campo por
campo. Distingue las tres causas que había que separar —clave inexistente, valor ya aplicado,
campo que difiere y no se escribió—.

**Va en el escritor y no en cada wrapper**, por el mismo motivo que la guarda de todo-o-nada de
arriba: protege a **todos** los llamadores, no al que se acordó. Los **once** wrappers ya hacían
`if (!r.ok) { Logger.log('FALLÓ: ' + r.motivo); return r; }`, así que heredaron el diagnóstico sin
tocarlos — y, sobre todo, **dejaron de imprimir el paso siguiente**.

⚠ **«Ya estaba aplicado» también falla, y es deliberado**: es idempotencia y no rotura, el motivo
lo dice con todas las letras, pero presentarla como éxito es exactamente lo que hizo que esta
tanda se leyera como ejecutada.

### Bug 2 · el extractor de operandos no matcheaba, y la prueba lo tapaba

El testigo informó *"cambió el formato de la traza de `opRATIO`"* **con el texto correcto tres
líneas más arriba en el mismo log**: `RATIO dig_impresiones (col H)/alcance (col K) =
6729844/475723`. **No cambió el formato — el extractor nunca lo había matcheado.**

**La causa es un fixture inventado en vez de copiado.** La prueba usaba
`RATIO dig_impresiones/alcance = …`, deducido del *template* de `opRATIO`
(`nombreNum + '/' + nombreDen`), sin mirar **qué le pasa el despachador**: `Generador.gs` arma los
nombres como `nombre + ' (col ' + columna + ')'`. **El fixture y el código compartían el mismo
supuesto falso**, así que no había dato que los distinguiera y las seis afirmaciones daban verde
sobre un extractor que no matcheaba nada en producción. Es el caso de `ULTIMO` otra vez.

**Verificado como control de mutación:** el extractor viejo devuelve `null` sobre la traza real y
matchea el fixture inventado. Ahora se ancla en lo estable —el rótulo `RATIO`, el ` = ` y el par
`N/D`— y el fixture es **la traza real copiada del log de las 19:08**. `tools/probar-tanda4.js`
pasó de 22 a **26 afirmaciones**, con la forma sin `(col X)`, el `PCT` que envuelve al `RATIO` y
el denominador cero.

### El patrón que hay que registrar: un `⚠` arriba de un `✅` se lee como verde

**El instrumento avisó, con la palabra correcta, y el aviso pasó inadvertido dos corridas
seguidas.** Salía en el medio del reporte; abajo, el bloque de la partición cerraba con
`✅ CIERRA`.

⚠ **La combinación exacta a evitar tiene nombre: control principal en verde sobre instrumento
incompleto.** El que estaba roto era justo el que distingue *se movió el numerador* de *se movió
el denominador* — en la tanda donde los valores son el dato débil.

**Ahora los avisos se acumulan y se imprimen ÚLTIMOS**, después del veredicto, en un bloque que
dice **qué NO cubre** el verde de arriba. No alcanza con emitir el aviso: hay que ponerlo donde
termina la lectura.

### Y una corrección de premisa

**La migración tiene que reportar 4 celdas, no 14**: son 2 marcadores × 2 columnas, y
`cambios_escritos` cuenta celdas efectivamente cambiadas. **Un 14 sería un bug.** Las tandas
grandes daban más porque tenían más filas — la 3 escribió 34 sobre 17 marcadores.
