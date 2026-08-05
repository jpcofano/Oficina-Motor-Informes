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
