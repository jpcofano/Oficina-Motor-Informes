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
