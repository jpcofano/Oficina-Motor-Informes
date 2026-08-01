# INVENTARIO DEL CÓDIGO — foto del 01/08/2026

> **Documento congelado.** Es una foto del código al 01/08/2026 (árbol de `fd58902` más
> los dos scripts de `tools/` que este mismo paso agrega — cero cambios en `.gs`). No se
> edita: si dentro de un mes hace falta saber si sigue siendo cierto, se re-corren
> `node tools/inventario.js` y `node tools/escritores.js` y se escribe un inventario
> nuevo. `reemplaza:` nada.
>
> Prompt: `docs/Prompts/AUD-3_inventario_codigo.md`. Partes A a D acá; la Parte E vive en
> `docs/ESCRITORES.md`, que es contrato vivo y tiene otro ciclo de vida.
> **Trabajamos en español.**

---

## 0 · Discrepancias con el punto de partida — lo primero, porque el prompt lo exige

El bloque "Punto de partida" del AUD-3 pedía verificar, no asumir, y parar a reportar si
algo no daba. Esto es lo que no dio:

### 0.1 · No son 18 huérfanas: son 20, y la lista de 18 tenía 2 falsas y 4 omitidas

**Las 2 falsas — `filasSolapa_` y `filaSeccion_` corren en cada ejecución.**
`filasSolapa_` (`Instalar.gs:981`) se llama 18 veces en el inicializador de
`SEED_SOLAPAS_` (`Instalar.gs:988-1096`) y `filaSeccion_` (`Instalar.gs:1694`) 35 veces
en el de `SEED_SECCIONES_` (`Instalar.gs:1713+`). Eso es **código de nivel de módulo**:
Apps Script lo ejecuta al cargar el scope global, o sea en **cada** invocación del
proyecto. La medición externa definía "alcanzable" solo desde `onOpen`/`MENU_`,
`doGet`/`doPost` y `API_LECTORES_` — la carga de módulo no figuraba como entrada, y por
esa rendija dos funciones que corren siempre quedaron declaradas huérfanas. El propio
prompt olió el caso ("chequear si son la mitad de un par donde la otra mitad sí se usa"):
son eso exactamente, junto con `filaSolapa_` (`Instalar.gs:968`), que la lista externa —
con su propio criterio — también debería haber incluido y no incluyó.

**Las 4 omitidas**, todas verificadas sin llamadores desde ninguna entrada:

| función | dónde | por qué se le escapó a la medición |
|---|---|---|
| `diagnosticoColumnaFecha_` | `Fuentes.gs:458` | huérfana *transitiva*: su único llamador (`diagnosticoLooker_`) es huérfano. La lista externa mezclaba criterios — para `Valores.gs` y `opRATIO` sí contó transitivas |
| `diagnosticoElementosSlide_` | `Armonizar.gs:343` | sin llamadores; su comentario lo declara "diagnóstico manual (no lo llama el menú)" |
| `logElementosSlide_` | `Armonizar.gs:353` | transitiva de la anterior |
| `filasDigitalDeEncuentro` | `Union.gs:576` | sin llamadores; es la interfaz que `Paso-2.4.md` construyó para el Paso 3 |

**Y una trampa tercera, cazada en el propio script de este paso:** las 8 funciones de
`Pruebas.gs` (`probar*_` ×5, `hojaFalsa_`, `hojaFalsaConEscrituras_`, `afirmar_`)
parecen huérfanas si solo se cuentan invocaciones `nombre(...)` — `correrPruebasDiff_`
las arma en un array **por referencia, sin paréntesis** (`Pruebas.gs:339-344`). La
primera corrida del script de este inventario cayó en esa trampa; se corrigió para
contar referencias, y por eso las 8 no están entre las 20. Queda anotado porque
cualquier re-medición futura con grep de `nombre(` va a volver a caer.

### 0.2 · Los números que dieron exactos y los que no

| medición externa | verificado | resultado |
|---|---|---|
| 235 funciones | 235 de primer nivel (245 con las 10 anidadas) | ✅ exacto |
| 21 archivos `.gs` | 21 | ✅ exacto |
| cero nombres duplicados | 0 en el scope global | ✅ — con un matiz: `celdaVacia_` existe dos veces (`Fuentes.gs:320`, `Auditoria.gs:461`) pero **anidada** en funciones distintas: scopes separados, sin colisión. Un grep plano de `function celdaVacia_` la reporta duplicada y no lo está |
| `Instalar.gs`: 2.204 líneas, 44 funciones | 2.204 y 44 | ✅ exacto |
| ~8.100 líneas | **no coincide con ninguna revisión del 01/08.** Por commit: `2979f03` = 7.304 (19 archivos) · `45fe14e` = 7.986 (20) · `4fa54f5`..HEAD = 8.410 (21). Otras convenciones sobre HEAD: 8.431 (contando última línea sin salto), 7.449 (sin vacías), 5.571 (sin comentarios) | ⚠ cifra aproximada de origen desconocido; los demás números de esa medición corresponden a `4fa54f5`..HEAD, cuyas líneas son **8.410** |
| ~34 ítems de menú | **36**, los 36 con función existente | ⚠ |
| 37 llamadas a `getUi()`, `hayUi_` protege una | **40** sitios; `hayUi_` protege un solo camino de menú (`probarConexionBases`) | ⚠ en el conteo, ✅ en lo que importa |

Ninguna discrepancia invalida el trabajo de fondo: cambia el censo de huérfanas (Parte B
clasifica 20, no 18) y deja tres advertencias metodológicas para la próxima medición —
la carga de módulo es una entrada, las referencias sin paréntesis son uso, y una función
anidada no colisiona.

---

## A · Grafo de llamadas

La salida completa del script está embebida al final de este documento (resumen, las 20
no alcanzables, tabla de menú y las 245 funciones con quién las llama y desde qué ítem se
alcanzan). Dos advertencias para leerla:

- **Nada es inalcanzable en sentido absoluto:** la acción `llamar` de la API (`Api.gs`)
  invoca cualquier global por nombre, y el botón ▶ del editor de Apps Script corre
  cualquier función sin argumentos. "No alcanzable" significa *por los caminos
  declarados* (menú, plataforma, lectores de API, carga de módulo).
- **El grafo es conservador a propósito:** una referencia sin invocación cuenta como
  uso. Prefiere un falso vivo a una falsa huérfana — el error barato de los dos.

Las funciones alcanzadas desde **más de un ítem de menú** están marcadas en la tabla
(`[N ítems]`): son las que un refactor puede romper por un lado sin que se note por el
otro. Las más compartidas: `leerBases`/`abrirHoja` y todo `Fuentes.gs` (lectura), y el
par `calcularDiffUpsert_`/`upsertPorClave_` (ver Parte C).

## B · Las huérfanas, clasificadas — 20, no 18

Regla del prompt: exactamente una categoría por función, con evidencia; **ninguna se
borra en este paso.** Suma: 8 adelantadas + 6 colgadas + 6 muertas = 20, ninguna en dos.

### Adelantadas (8) — construidas para un paso que no llegó; se conservan

| función | evidencia |
|---|---|
| `opSUMA`, `opCONTEO`, `opRATIO`, `opPCT`, `opTEXTO` (`Marcadores.gs`) | hipótesis del prompt **confirmada**: son los operadores del despachador genérico de `Paso-3-v2` Parte A. El encabezado de `Marcadores.gs:15-23` los declara y `Marcadores.gs:98-101` cita el prompt por nombre. `opULTIMO` es el sexto y ya está vivo (lo usa el corte vertical) |
| `abrirPanel` (`PanelBackend.gs:13`) | el prompt la tenía como candidata **muerta** — corregido: su cuerpo es un TODO que cita el Paso 6 (`PanelBackend.gs:14`) y el encabezado del archivo dice "Se completa en: Pasos 6-8". `Panel.html` existe y todavía no tiene ningún `google.script.run` |
| `filasDigitalDeEncuentro` (`Union.gs:576`) | interfaz que el Paso 2.4 construyó para el Paso 3: `Paso-2.4.md:142` la define y `:183` ordena "el Paso 3 debe pedir lo digital al proveedor de 2.4" |
| `parsearPersonas_` (`Parseo.gs:165`) | candidata **muerta** en el prompt — corregido: su encabezado (`Parseo.gs:151-163`) la ata a la solapa de equivalencias (`docs/PERSONAS_equivalencias.csv`, 17 personas / 34 variantes) como reemplazo diseñado de `detectPersona_`, con la medición que justificó el reemplazo (16/19 y 0/18). Tiene destino escrito; le falta el consumidor |

### Colgadas (6) — construidas y nunca cableadas; cablear o retirar es decisión de otro paso

Las seis de `Valores.gs`: `registrarValorCalculado_`, `escribirFilaValores_`,
`buscarUltimoValor_`, `buscarDivergencia_`, `registrarOActualizarDivergencia_`,
`hojaValores_`.

Hipótesis del prompt **confirmada, con precisión que la mejora**: no es "el módulo
entero" — `Valores.gs` tiene 9 funciones y **la mitad de lectura sí está cableada**
(`menuRevisarDivergenciasValores_` → `leerDivergenciasPendientes_` →
`hojaValoresDivergentes_`, menú "Revisar divergencias de valores"). Lo colgado es **el
camino de escritura completo**. Y es un bug de cableado, no código de más:
`Plan Inicial/PROYECTO.md` §4 (línea 126) declara `VALORES`/`VALORES_DIVERGENTES` parte
de la decisión de periodicidad (Paso 2.9H), y **el punto de cableado ya existe y no
llama**: `corteVerticalRetiro2407_` (`Marcadores.gs:183`) calcula diez tokens reales y
escribe `VISTA_PREVIA` sin registrar ni uno en `VALORES`. El día que dos informes
compartan un bloque, la divergencia que 2.9H existe para cazar pasa sin registrarse.

### Muertas (6) — resto de casos cerrados; la recomendación es del paso siguiente, no de éste

| función | evidencia del caso cerrado |
|---|---|
| `diagnosticoDrive` (`Instalar.gs:32`) | su propio comentario: "Temporal: cuando el registro de plantillas funcione de punta a punta, se puede borrar" (`Instalar.gs:27-31`, Paso 1.8-B). El registro de plantillas funciona desde el Paso 1.6-v2 |
| `diagnosticoLooker_` (`Fuentes.gs:483`) | instrumento del caso looker (columna de fecha con `QUERY()`), cerrado en S-01 / DOC-3 Parte A. Su comentario declara la vía de invocación real: "sin argumentos para poder correrla con el botón ▶ del editor" |
| `diagnosticoColumnaFecha_` (`Fuentes.gs:458`) | transitiva de la anterior — mismo caso |
| `diagnosticoElementosSlide_` (`Armonizar.gs:343`) | "Diagnóstico manual (no lo llama el menú ni `armonizarPlantillas`)" — instrumento del caso cajas-fuera-de-canvas (armonización, Paso 2.2.x) |
| `logElementosSlide_` (`Armonizar.gs:353`) | transitiva de la anterior |
| `probarParseo_` (`Parseo.gs:229`) | QA del armado original del parseo; su sujeto (`parsearNombreCampana_`) está vivo por otro camino (`Union.gs:493`) |

**Matiz que la categoría no captura y conviene decir:** cuatro de las seis
(`diagnostico*`, `logElementosSlide_`) son instrumentos de consola *deliberados* — sus
comentarios documentan cómo correrlos desde el editor. Esa es una **cuarta vía de
invocación que ningún grafo estático ve**, igual que el submenú "Archivo (casos
cerrados)" pero sin menú. Si el paso siguiente decide retirar, que decida sabiendo eso.

## C · Los trabajos de `Instalar.gs` — dónde están las costuras

2.204 líneas: 1.195 en 44 funciones y **~1.000 de datos** (los `SEED_*` y
`HOJAS_CONFIG_` son casi la mitad del archivo). La hipótesis de cuatro trabajos era
corta: son **seis**.

| trabajo | funciones (líneas) |
|---|---|
| 1 · Estructura de hojas | `HOJAS_CONFIG_` (datos), `aplicarInstalacion_` (94), `instalar` (4), `asegurarColumna_` (9), `limpiarHojaPorDefecto_` (8), `formatearResumenInstalacion_` (20) |
| 2 · Migraciones | `eliminarMapeoAlcanceDigitalObsoleto_` (26), `alinearMapeoLookerADinamico_` (24), `alinearSolapasLookerADinamico_` (35), `alinearBasesHojaDefaultLooker_` (22), `reclasificarSolapasM2Invertidas_` (26), `migrarCalculoAOperacion_` (13), `backfillSolapaMapeo_` (32) — ~178 |
| 3 · Sembrado | los `SEED_*` (datos) + constructoras (`filaSolapa_`, `filasSolapa_`, `filaSeccion_`), `aplicarSeedConfiguracion_` (35), `seedConfiguracion` (4), `seedConfigConfig_` (38), `aplicarClasificacionSolapas_` (54), `sembrarClasificacionSolapas` (9), `sembrarSecciones_` (18), `menuSembrarSecciones_` (10), formateadores |
| 4 · Motor de diff/upsert | `normalizarParaComparar_` (18), `calcularDiffUpsert_` (66), `upsertPorClave_` (29) — 113 líneas que usan todos los demás |
| 5 · Plantillas | `matchearInformeId_` (8), `registrarPlantillasDesdeCarpeta` (40), `recorrerCarpetaPlantillas_` (15), `clasificarArchivoPlantilla_` (37), `diagnosticarCarpetaPlantillas_` (24), y sus dos menús — ~190 |
| 6 · Reporte (las dos vistas) | `menuAplicarConfiguracion_` (43), `menuEstadoConfiguracion_` (**155, la más grande del archivo**), `resumenDesagregado_` (23), `filasDiffParaHoja_` (42), `filasDiffMigraciones_` (16), `clavesTocadasPorMigracion_` (8), `ALCANCE_REGISTROS_` (datos), `construirBloqueAlcance_` (13), `cabeceraDeCorrida_` (8), `escribirDiffConfiguracion_` (27) — ~340 |

(`diagnosticoDrive` no pertenece a ninguno — está suelto, Parte B lo clasifica.)

**Las costuras, con nombres:**

- **El trabajo 4 es de todos.** `upsertPorClave_`/`calcularDiffUpsert_` los llaman: el
  sembrado (`aplicarSeedConfiguracion_` para 4 hojas, `aplicarClasificacionSolapas_`
  para `SOLAPAS`), el reporte (`menuEstadoConfiguracion_`, solo cálculo) y —**fuera del
  archivo**— `promoverFechasElegidas` (`Fechas.gs:385`). Partir el diff de los
  sembradores no es barato: es el corazón compartido, y además lo comparte otro archivo.
- **El reporte depende del sembrado por datos, no solo por llamadas:**
  `ALCANCE_REGISTROS_` referencia los `SEED_*` vía thunks, con el comentario de
  `Instalar.gs:1953-1956` explicando el riesgo de orden de evaluación del scope global.
  Mover los `SEED_*` a otro archivo obliga a revisar esa mecánica.
- **Estado y Aplicar comparten las migraciones** (C.2-3: `aplicarInstalacion_(false)`
  calcula sin escribir): el trabajo 6 llama al 1, que llama al 2.
- **El sembrado de `SOLAPAS` tiene contrato con `Solapas.gs`:** `leerFilasSolapas_`
  (`Solapas.gs:167`) la usan `aplicarClasificacionSolapas_` **y**
  `menuEstadoConfiguracion_`, y la exclusión de `filas_datos`/`firma_encabezado` es un
  acuerdo con `inventariarSolapas()` documentado sobre `aplicarClasificacionSolapas_`.
- **La costura fallada** (ya abierta como P1 en `PENDIENTES_consistencia.md`):
  `menuEstadoConfiguracion_` **reimplementa** la comparación de `SOLAPAS`
  (`Instalar.gs:2136-2153`) en vez de reusar `aplicarClasificacionSolapas_`, compara con
  `String()` en vez de `normalizarParaComparar_()` y saltea las `origen=manual` sin
  emitir línea. Es el costo de la costura hecha a mano dos veces.
- **Los cortes baratos existen:** el trabajo 5 (plantillas) solo toca `INFORMES` y no
  comparte nada con el diff; `diagnosticoDrive` está suelto. Todo lo demás está cosido
  al trabajo 4.

**No se propone partición acá** — el prompt lo prohíbe. Este es el mapa de qué cuesta
cada corte.

## D · Menú

La tabla completa (36 ítems, función, `getUi()` en el camino, última mención en
`BITACORA.md`) está en la salida embebida. Lo que la tabla dice:

- **36 ítems, los 36 con función existente.** Ninguno roto.
- **33 de 36 tocan `getUi()`; el único camino protegido es `probarConexionBases`** (vía
  `hayUi_`). Esos 33 son **no invocables por la API** tal cual están — el insumo directo
  del paso que quiera exponer diagnósticos por `/dev`. Los 3 sin `getUi()` son los dos
  stubs (`menuAbrirPanel_`, `menuGenerarInforme_`) y `menuCargarEjemplo_` — los tres
  `toast('próximamente')`, tampoco hacen nada todavía.
- La columna de bitácora quedó rala a propósito: es la última sección de `BITACORA.md`
  que nombra la **función** (mecánico, reproducible). Que la mayoría dé `—` dice algo
  real: la bitácora narra por paso y casi nunca por ítem de menú.
- El submenú "Archivo (casos cerrados)" declara su intención en el propio menú
  (`Codigo.gs:82-88`) — se registra, no se toca, como pide el prompt.

## Verificación (criterios del AUD-3 editado)

1. ✅/⚠ El script reproduce los números del punto de partida **o la diferencia está
   explicada**: 235 ✓ · 21 ✓ · 0 duplicados ✓ · `Instalar.gs` 2.204/44 ✓ · líneas y
   menú, explicados en §0.2.
2. ✅ con corrección: las huérfanas reales son 20 y suman 20 entre las tres categorías
   (8+6+6), ninguna en dos. La conciliación con la lista de 18 está en §0.1.
3. ✅ El censo de la Parte E levantó solo los dos escritores de `MAPEO` — ver
   `docs/ESCRITORES.md`, sección "Control positivo" (y encontró un tercero).
4. ✅ Toda clasificación cita paso, prompt o línea.
5. ✅ Las diez hojas aparecen en la matriz de `ESCRITORES.md`, incluida `CAMPANAS` con
   cero escritores.
6. ✅ `git status`: sin cambios en `.gs` (los dos archivos nuevos son de `tools/`).
7. ✅ Fila de ambos entregables en `CLAUDE.md` §7 y `PROYECTO.md` §9, este mismo commit.

---

# Salida del script — `node tools/inventario.js` (01/08/2026)

## Resumen

| medida | valor |
|---|---|
| archivos `.gs` | 21 |
| líneas | 8431 |
| funciones con nombre | 245 (nivel 1: 235 · anidadas: 10) |
| nombres duplicados | 0 |
| ítems de menú (hoja en `MENU_`) | 36 |
| lectores de API (`API_LECTORES_`) | 9 |
| llamadas en carga de módulo | filaSeccion_, filaSolapa_, filasSolapa_ |
| no alcanzables desde las entradas | 20 |

## No alcanzables (desde onOpen/MENU_, doGet/doPost, API_LECTORES_ y carga de módulo)

- `abrirPanel` — PanelBackend.gs:13 · sin llamadores
- `buscarDivergencia_` — Valores.gs:65 · la llaman (también inalcanzables): registrarOActualizarDivergencia_, registrarValorCalculado_
- `buscarUltimoValor_` — Valores.gs:40 · la llaman (también inalcanzables): registrarValorCalculado_
- `diagnosticoColumnaFecha_` — Fuentes.gs:458 · la llaman (también inalcanzables): diagnosticoLooker_
- `diagnosticoDrive` — Instalar.gs:32 · sin llamadores
- `diagnosticoElementosSlide_` — Armonizar.gs:343 · sin llamadores
- `diagnosticoLooker_` — Fuentes.gs:483 · sin llamadores
- `escribirFilaValores_` — Valores.gs:56 · la llaman (también inalcanzables): registrarValorCalculado_
- `filasDigitalDeEncuentro` — Union.gs:576 · sin llamadores
- `hojaValores_` — Valores.gs:28 · la llaman (también inalcanzables): registrarValorCalculado_
- `logElementosSlide_` — Armonizar.gs:353 · la llaman (también inalcanzables): diagnosticoElementosSlide_
- `opCONTEO` — Marcadores.gs:64 · sin llamadores
- `opPCT` — Marcadores.gs:114 · sin llamadores
- `opRATIO` — Marcadores.gs:102 · la llaman (también inalcanzables): opPCT
- `opSUMA` — Marcadores.gs:46 · sin llamadores
- `opTEXTO` — Marcadores.gs:124 · sin llamadores
- `parsearPersonas_` — Parseo.gs:165 · sin llamadores
- `probarParseo_` — Parseo.gs:229 · sin llamadores
- `registrarOActualizarDivergencia_` — Valores.gs:79 · la llaman (también inalcanzables): registrarValorCalculado_
- `registrarValorCalculado_` — Valores.gs:121 · sin llamadores

## Ítems de menú

| ítem | función | existe | `getUi()` en el camino | última mención en BITACORA |
|---|---|---|---|---|
| Abrir panel | `menuAbrirPanel_` | Codigo.gs:151 | no | — |
| Generar informe | `menuGenerarInforme_` | Codigo.gs:155 | no | — |
| Aplicar configuración | `menuAplicarConfiguracion_` | Instalar.gs:1818 | sí — menuAplicarConfiguracion_ | Paso 2.11 C.2-7 |
| Estado de configuración | `menuEstadoConfiguracion_` | Instalar.gs:2050 | sí — menuEstadoConfiguracion_ | Paso 2.11 C.2-7 |
| Registrar plantillas | `menuRegistrarPlantillas_` | Instalar.gs:1596 | sí — menuRegistrarPlantillas_ | — |
| Promover fechas elegidas | `menuPromoverFechasElegidas_` | Fechas.gs:471 | sí — menuPromoverFechasElegidas_ | — |
| Cargar temario de reuniones | `menuCargarTemarioReuniones_` | Reuniones.gs:159 | sí — menuCargarTemarioReuniones_ | — |
| Cargar ejemplo | `menuCargarEjemplo_` | Codigo.gs:159 | no | Paso 2.11 Parte A |
| Instalar / reparar hojas | `instalar` | Instalar.gs:348 | sí — instalar | Paso 2.11 C.2-2 a C.2-6 |
| Cargar config inicial | `seedConfiguracion` | Instalar.gs:1251 | sí — seedConfiguracion | Paso 2.11 Parte C |
| Sembrar clasificación de solapas | `sembrarClasificacionSolapas` | Instalar.gs:1178 | sí — sembrarClasificacionSolapas | Paso 2.11 C.2-7 |
| Sembrar árbol de secciones | `menuSembrarSecciones_` | Instalar.gs:1791 | sí — menuSembrarSecciones_ | Paso 2.11 Parte C |
| Revisar divergencias de valores | `menuRevisarDivergenciasValores_` | Valores.gs:194 | sí — menuRevisarDivergenciasValores_ | — |
| Consolidar mapeos de looker | `menuConsolidarMapeoLooker_` | Solapas.gs:493 | sí — menuConsolidarMapeoLooker_ | — |
| Probar conexión a bases | `probarConexionBases` | Fuentes.gs:127 | sí — hayUi_, probarConexionBases (con `hayUi_` en el camino) | Paso 2.11 C.2-7 |
| Probar lectura por ventana | `menuProbarLectura_` | Fuentes.gs:524 | sí — menuProbarLectura_ | Paso 2.3 |
| Probar unión y anclaje | `menuProbarUnionYAnclaje_` | Union.gs:596 | sí — menuProbarUnionYAnclaje_ | Paso 2.4 |
| Calcular corte vertical | `menuCorteVerticalRetiro2407_` | Marcadores.gs:229 | sí — menuCorteVerticalRetiro2407_ | — |
| Listar solapas y tipos | `menuDiagnosticarBases_` | Fechas.gs:721 | sí — menuDiagnosticarBases_ | — |
| Inventariar solapas | `menuInventariarSolapas_` | Solapas.gs:192 | sí — menuInventariarSolapas_ | — |
| Auditoría de solapas | `menuAuditarSolapas_` | Auditoria.gs:212 | sí — menuAuditarSolapas_ | — |
| Verificar nombres de solapa fuente | `menuVerificarNombresSolapasFuente_` | Auditoria.gs:662 | sí — menuVerificarNombresSolapasFuente_ | — |
| Detectar columnas de fecha | `menuDetectarColumnasFecha_` | Fechas.gs:443 | sí — menuDetectarColumnasFecha_ | — |
| Validar MAPEO (duplicados) | `menuValidarMapeo_` | Config.gs:220 | sí — menuValidarMapeo_ | — |
| Tipos de fechas de ventana (solo lectura) | `menuDiagnosticoTiposFechasConfig_` | Fechas.gs:840 | sí — menuDiagnosticoTiposFechasConfig_ | — |
| Correr pruebas del diff | `menuCorrerPruebasDiff_` | Pruebas.gs:362 | sí — menuCorrerPruebasDiff_ | — |
| Comparar resúmenes de looker | `menuCompararResumenesLooker_` | Solapas.gs:268 | sí — menuCompararResumenesLooker_ | — |
| Auditar fórmulas de resúmenes | `menuAuditarFormulasResumenesLooker_` | Solapas.gs:410 | sí — menuAuditarFormulasResumenesLooker_ | — |
| Auditar digital / alcance | `menuAuditarAlcanceDigital_` | Auditoria.gs:312 | sí — menuAuditarAlcanceDigital_ | — |
| Corte de filas en m2 (2.8 D) | `menuDiagnosticarCorteFilasM2_` | Auditoria.gs:409 | sí — menuDiagnosticarCorteFilasM2_ | — |
| Filas sin clave en digital (2.8 E) | `menuDiagnosticarFilasSinClaveDigital_` | Auditoria.gs:504 | sí — menuDiagnosticarFilasSinClaveDigital_ | — |
| Colapso del lector (2.9 A) | `menuDiagnosticarColapso_` | Auditoria.gs:677 | sí — menuDiagnosticarColapso_ | — |
| Inventario de plantillas | `menuInventarioPlantillas_` | Armonizar.gs:590 | sí — menuInventarioPlantillas_ | Paso 2.2 + 2.2.1 + 2.2.2 |
| Diagnosticar carpeta de plantillas | `menuDiagnosticarCarpetaPlantillas_` | Instalar.gs:1571 | sí — menuDiagnosticarCarpetaPlantillas_ | — |
| Armonizar tokens de plantillas | `menuArmonizarPlantillas_` | Armonizar.gs:447 | sí — menuArmonizarPlantillas_ | — |
| Fijar plantilla canónica de JM | `menuRepuntarPlantillaCanonicaJM_` | Armonizar.gs:680 | sí — menuRepuntarPlantillaCanonicaJM_ | Paso 2.2 + 2.2.1 + 2.2.2 |

## Las 245 funciones

| función | archivo:línea | la llaman | ítems de menú que la alcanzan | API |
|---|---|---|---|---|
| `apiBarrera1_` | Api.gs:141 | manejarPedido_ | — | todas |
| `apiBarrera2_` | Api.gs:169 | manejarPedido_ | — | todas |
| `apiDespachar_` | Api.gs:211 | manejarPedido_ | — | no |
| `apiEnmascarar_` | Api.gs:200 | apiError_; manejarPedido_ | — | no |
| `apiError_` | Api.gs:341 | apiDespachar_; apiLlamar_; apiRegistros_; manejarPedido_ | — | no |
| `apiGlobal_` | Api.gs:298 | apiLlamar_; apiRegistros_ | — | no |
| `apiHojaControl_` | Api.gs:309 | apiDespachar_; apiLlamar_; apiRegistros_ | — | no |
| `apiIgualesEnTiempoFijo_` | Api.gs:189 | apiBarrera2_ | — | no |
| `apiLlamar_` | Api.gs:268 | apiDespachar_ | — | no |
| `apiOk_` | Api.gs:331 | apiDespachar_; apiLlamar_; apiRegistros_ | — | no |
| `apiPedido_` | Api.gs:110 | manejarPedido_ | — | todas |
| `apiRegistros_` | Api.gs:245 | apiDespachar_ | — | no |
| `apiSalida_` | Api.gs:352 | apiError_; apiOk_; manejarPedido_ | — | no |
| `doGet` | Api.gs:59 | — | — | no |
| `doPost` | Api.gs:63 | — | — | no |
| `manejarPedido_` | Api.gs:71 | doGet; doPost | — | todas |
| `serializar_` | Api.gs:365 | apiOk_ | — | no |
| `agregarLineaCaja_` | Armonizar.gs:237 | corregirCajasPresentacion_ | Armonizar tokens de plantillas | no |
| `armonizarPlantillas` | Armonizar.gs:71 | menuArmonizarPlantillas_ | Armonizar tokens de plantillas | no |
| `armonizarPresentacion_` | Armonizar.gs:122 | armonizarPlantillas | Armonizar tokens de plantillas | no |
| `asegurarCarpetaBackups_` | Armonizar.gs:94 | armonizarPresentacion_ | Armonizar tokens de plantillas | no |
| `backupPlantilla_` | Armonizar.gs:112 | armonizarPresentacion_ | Armonizar tokens de plantillas | no |
| `buscarShapePorTexto_` | Armonizar.gs:182 | corregirCajaPorEtiqueta_ | Armonizar tokens de plantillas | no |
| `contarTokensDistintos_` | Armonizar.gs:573 | inventariarPresentacion_ | Inventario de plantillas | no |
| `corregirCajaPorEtiqueta_` | Armonizar.gs:212 | corregirCajasPresentacion_ | Armonizar tokens de plantillas | no |
| `corregirCajasPresentacion_` | Armonizar.gs:391 | armonizarPresentacion_ | Armonizar tokens de plantillas | no |
| `diagnosticoElementosSlide_` | Armonizar.gs:343 | — | — | no |
| `eliminarCajaHuerfanaM2Salud_` | Armonizar.gs:310 | corregirCajasPresentacion_ | Armonizar tokens de plantillas | no |
| `eliminarElementosFueraDeCanvas_` | Armonizar.gs:273 | limpiarCajasFueraDeCanvas_ | Armonizar tokens de plantillas | no |
| `inventariarPresentacion_` | Armonizar.gs:518 | inventarioPlantillas | Inventario de plantillas | no |
| `inventarioPlantillas` | Armonizar.gs:502 | menuInventarioPlantillas_ | Inventario de plantillas | no |
| `limpiarCajasFueraDeCanvas_` | Armonizar.gs:291 | corregirCajasPresentacion_ | Armonizar tokens de plantillas | no |
| `logElementosSlide_` | Armonizar.gs:353 | diagnosticoElementosSlide_ | — | no |
| `menuArmonizarPlantillas_` | Armonizar.gs:447 | — | Armonizar tokens de plantillas | no |
| `menuInventarioPlantillas_` | Armonizar.gs:590 | — | Inventario de plantillas | no |
| `menuRepuntarPlantillaCanonicaJM_` | Armonizar.gs:680 | — | Fijar plantilla canónica de JM | no |
| `primerTextoDeSlide_` | Armonizar.gs:563 | inventariarPresentacion_ | Inventario de plantillas | no |
| `repuntarPlantillaCanonicaJM_` | Armonizar.gs:638 | menuRepuntarPlantillaCanonicaJM_ | Fijar plantilla canónica de JM | no |
| `shapeValorMasCercano_` | Armonizar.gs:192 | corregirCajaPorEtiqueta_ | Armonizar tokens de plantillas | no |
| `slideEn_` | Armonizar.gs:365 | corregirCajasPresentacion_; diagnosticoElementosSlide_ | Armonizar tokens de plantillas | no |
| `auditarAlcanceDigital_` | Auditoria.gs:264 | menuAuditarAlcanceDigital_ | Auditar digital / alcance | no |
| `auditarSolapas` | Auditoria.gs:54 | menuAuditarSolapas_ | Auditoría de solapas | no |
| `celdaVacia_` (anidada en `diagnosticoFilasSinClaveDigital_`) | Auditoria.gs:461 | diagnosticoFilasSinClaveDigital_; leerFuente | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[6 ítems]** | no |
| `diagnosticarColapso_` | Auditoria.gs:546 | menuDiagnosticarColapso_ | Colapso del lector (2.9 A) | no |
| `diagnosticoCorteFilasM2_` | Auditoria.gs:347 | menuDiagnosticarCorteFilasM2_ | Corte de filas en m2 (2.8 D) | no |
| `diagnosticoFilasSinClaveDigital_` | Auditoria.gs:446 | menuDiagnosticarFilasSinClaveDigital_ | Filas sin clave en digital (2.8 E) | no |
| `escribirAuditoriaSolapas_` | Auditoria.gs:186 | auditarSolapas | Auditoría de solapas | no |
| `escribirBloqueAud_` | Auditoria.gs:197 | escribirAuditoriaSolapas_ | Auditoría de solapas | no |
| `menuAuditarAlcanceDigital_` | Auditoria.gs:312 | — | Auditar digital / alcance | no |
| `menuAuditarSolapas_` | Auditoria.gs:212 | — | Auditoría de solapas | no |
| `menuDiagnosticarColapso_` | Auditoria.gs:677 | — | Colapso del lector (2.9 A) | no |
| `menuDiagnosticarCorteFilasM2_` | Auditoria.gs:409 | — | Corte de filas en m2 (2.8 D) | no |
| `menuDiagnosticarFilasSinClaveDigital_` | Auditoria.gs:504 | — | Filas sin clave en digital (2.8 E) | no |
| `menuVerificarNombresSolapasFuente_` | Auditoria.gs:662 | — | Verificar nombres de solapa fuente | no |
| `obtenerOCrearHojaAuditoriaSolapas_` | Auditoria.gs:176 | auditarSolapas | Auditoría de solapas | no |
| `verificarNombresSolapasFuente_` | Auditoria.gs:625 | menuVerificarNombresSolapasFuente_ | Verificar nombres de solapa fuente | no |
| `construirMenu_` | Codigo.gs:123 | onOpen | — | no |
| `hayUi_` | Codigo.gs:142 | probarConexionBases | Probar conexión a bases | no |
| `menuAbrirPanel_` | Codigo.gs:151 | — | Abrir panel | no |
| `menuCargarEjemplo_` | Codigo.gs:159 | — | Cargar ejemplo | no |
| `menuGenerarInforme_` | Codigo.gs:155 | — | Generar informe | no |
| `onOpen` | Codigo.gs:106 | — | — | no |
| `buscarMapeo` | Config.gs:163 | anclarEncuentros; calcularTokenDirectoRdv_; diagnosticoColumnaFecha_; diagnosticoFilasSinClaveDigital_; encontrarFilaRdvDeReunion_; leerFuente; resolverClave_; unirDigitalPorCuenta; verificarPrecondicionAnclaje_ | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[6 ítems]** | no |
| `esVerdadero_` | Config.gs:260 | leerRegistro_; leerReuniones_; promoverFechasElegidas | Promover fechas elegidas; Consolidar mapeos de looker; Probar conexión a bases; Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Listar solapas y tipos; Inventariar solapas; Auditoría de solapas; Verificar nombres de solapa fuente; Detectar columnas de fecha; Comparar resúmenes de looker; Auditar fórmulas de resúmenes; Auditar digital / alcance; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A); Inventario de plantillas; Armonizar tokens de plantillas **[19 ítems]** | sí |
| `leerBases` | Config.gs:30 | abrirBase; auditarAlcanceDigital_; auditarFormulasResumenesLooker_; auditarSolapas; compararResumenesLooker_; detectarColumnasFecha; diagnosticarBases; diagnosticarColapso_; diagnosticoBases_; inventariarSolapas; probarLecturaPeriodo; verificarNombresSolapasFuente_ | Consolidar mapeos de looker; Probar conexión a bases; Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Listar solapas y tipos; Inventariar solapas; Auditoría de solapas; Verificar nombres de solapa fuente; Detectar columnas de fecha; Comparar resúmenes de looker; Auditar fórmulas de resúmenes; Auditar digital / alcance; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[16 ítems]** | sí |
| `leerCampanas` | Config.gs:42 | resolverVentana | Probar lectura por ventana; Probar unión y anclaje; Colapso del lector (2.9 A) **[3 ítems]** | sí |
| `leerConfig` | Config.gs:46 | asegurarCarpetaBackups_; menuDiagnosticarCarpetaPlantillas_; menuRegistrarPlantillas_; resolverVentana; umbralAnclajeReunion_ | Registrar plantillas; Probar lectura por ventana; Probar unión y anclaje; Colapso del lector (2.9 A); Diagnosticar carpeta de plantillas; Armonizar tokens de plantillas **[6 ítems]** | sí |
| `leerInformes` | Config.gs:34 | armonizarPlantillas; inventarioPlantillas | Inventario de plantillas; Armonizar tokens de plantillas **[2 ítems]** | sí |
| `leerMapeo` | Config.gs:72 | auditarAlcanceDigital_; buscarMapeo; diagnosticarBases; filasMapeoPlano_ | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Listar solapas y tipos; Auditoría de solapas; Detectar columnas de fecha; Auditar digital / alcance; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[10 ítems]** | sí |
| `leerPeriodos` | Config.gs:38 | resolverVentana | Probar lectura por ventana; Probar unión y anclaje; Colapso del lector (2.9 A) **[3 ítems]** | sí |
| `leerRegistro_` | Config.gs:239 | leerBases; leerCampanas; leerInformes; leerPeriodos | Consolidar mapeos de looker; Probar conexión a bases; Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Listar solapas y tipos; Inventariar solapas; Auditoría de solapas; Verificar nombres de solapa fuente; Detectar columnas de fecha; Comparar resúmenes de looker; Auditar fórmulas de resúmenes; Auditar digital / alcance; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A); Inventario de plantillas; Armonizar tokens de plantillas **[18 ítems]** | sí |
| `leerSolapas` | Config.gs:111 | diagnosticarColapso_; diagnosticoCorteFilasM2_; evaluarCoberturaLectura_; resolverFilaEncabezado_; usoSolapa_; verificarNombresSolapasFuente_ | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Verificar nombres de solapa fuente; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[7 ítems]** | sí |
| `menuValidarMapeo_` | Config.gs:220 | — | Validar MAPEO (duplicados) | no |
| `usoSolapa_` | Config.gs:146 | buscarMapeo; diagnosticarColapso_ | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[6 ítems]** | no |
| `validarMapeo` | Config.gs:190 | menuValidarMapeo_ | Validar MAPEO (duplicados) | no |
| `describir_` (anidada en `diagnosticoTiposFechasConfig_`) | Fechas.gs:778 | diagnosticoTiposFechasConfig_; relevarHoja_ | Tipos de fechas de ventana (solo lectura) | no |
| `detectarColumnasFecha` | Fechas.gs:75 | menuDetectarColumnasFecha_ | Detectar columnas de fecha | no |
| `detectarColumnasFechaEnSolapa_` | Fechas.gs:168 | detectarColumnasFecha | Detectar columnas de fecha | no |
| `diagnosticarBases` | Fechas.gs:527 | auditarSolapas; menuDiagnosticarBases_ | Listar solapas y tipos; Auditoría de solapas **[2 ítems]** | no |
| `diagnosticoTiposFechasConfig_` | Fechas.gs:774 | menuDiagnosticoTiposFechasConfig_ | Tipos de fechas de ventana (solo lectura) | no |
| `escribirDiagBases_` | Fechas.gs:695 | diagnosticarBases | Listar solapas y tipos; Auditoría de solapas **[2 ítems]** | no |
| `escribirDiagFechas_` | Fechas.gs:289 | detectarColumnasFecha | Detectar columnas de fecha | no |
| `filasMapeoPlano_` | Fechas.gs:144 | detectarColumnasFecha | Detectar columnas de fecha | no |
| `indiceAColumnaLetra_` | Fechas.gs:305 | auditarFormulasResumenesLooker_; detectarColumnasFechaEnSolapa_ | Consolidar mapeos de looker; Detectar columnas de fecha; Auditar fórmulas de resúmenes **[3 ítems]** | no |
| `leerDiagFechas_` | Fechas.gs:420 | promoverFechasElegidas | Promover fechas elegidas | no |
| `menuDetectarColumnasFecha_` | Fechas.gs:443 | — | Detectar columnas de fecha | no |
| `menuDiagnosticarBases_` | Fechas.gs:721 | — | Listar solapas y tipos | no |
| `menuDiagnosticoTiposFechasConfig_` | Fechas.gs:840 | — | Tipos de fechas de ventana (solo lectura) | no |
| `menuPromoverFechasElegidas_` | Fechas.gs:471 | — | Promover fechas elegidas | no |
| `migrarPrefijosFechaPeriodo_` | Fechas.gs:402 | promoverFechasElegidas | Promover fechas elegidas | no |
| `obtenerOCrearHojaDiagBases_` | Fechas.gs:689 | diagnosticarBases | Listar solapas y tipos; Auditoría de solapas **[2 ítems]** | no |
| `obtenerOCrearHojaDiagFechas_` | Fechas.gs:283 | detectarColumnasFecha | Detectar columnas de fecha | no |
| `promoverFechasElegidas` | Fechas.gs:326 | menuPromoverFechasElegidas_ | Promover fechas elegidas | no |
| `rangoFechasColumna_` | Fechas.gs:250 | detectarColumnasFechaEnSolapa_ | Detectar columnas de fecha | no |
| `relevarHoja_` (anidada en `diagnosticoTiposFechasConfig_`) | Fechas.gs:784 | diagnosticoTiposFechasConfig_ | Tipos de fechas de ventana (solo lectura) | no |
| `tipificarColumna_` | Fechas.gs:655 | diagnosticarBases | Listar solapas y tipos; Auditoría de solapas **[2 ítems]** | no |
| `valorVacioFecha_` | Fechas.gs:301 | detectarColumnasFechaEnSolapa_ | Detectar columnas de fecha | no |
| `abrirBase` | Fuentes.gs:52 | abrirHoja | Probar conexión a bases; Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[7 ítems]** | no |
| `abrirHoja` | Fuentes.gs:78 | catalogoBarriosDesdeBase_; diagnosticarColapso_; diagnosticoBases_; diagnosticoColumnaFecha_; diagnosticoCorteFilasM2_; diagnosticoFilasSinClaveDigital_; encabezadoEnColumna_; leerFuente; verificarPrecondicionAnclaje_ | Probar conexión a bases; Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[7 ítems]** | no |
| `celdaVacia_` (anidada en `leerFuente`) | Fuentes.gs:320 | diagnosticoFilasSinClaveDigital_; leerFuente | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[6 ítems]** | no |
| `columnaLetraAIndice_` | Fuentes.gs:217 | auditarAlcanceDigital_; diagnosticarColapso_; diagnosticoColumnaFecha_; diagnosticoCorteFilasM2_; diagnosticoFilasSinClaveDigital_; encabezadoEnColumna_; leerFuente; tipificarColumna_; verificarPrecondicionAnclaje_ | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Listar solapas y tipos; Auditoría de solapas; Auditar digital / alcance; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[9 ítems]** | no |
| `diagnosticoBases_` | Fuentes.gs:103 | apiDespachar_; probarConexionBases | Probar conexión a bases | no |
| `diagnosticoColumnaFecha_` | Fuentes.gs:458 | diagnosticoLooker_ | — | no |
| `diagnosticoLooker_` | Fuentes.gs:483 | — | — | no |
| `evaluarCoberturaLectura_` | Fuentes.gs:506 | menuProbarLectura_ | Probar lectura por ventana | no |
| `filaAObjeto` (anidada en `leerFuente`) | Fuentes.gs:312 | leerFuente | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Colapso del lector (2.9 A) **[5 ítems]** | no |
| `filaVacia_` | Fuentes.gs:204 | inventariarSolapas; leerFuente | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Inventariar solapas; Corte de filas en m2 (2.8 D); Colapso del lector (2.9 A) **[6 ítems]** | no |
| `formatearFecha_` | Fuentes.gs:444 | menuInventarioPlantillas_; menuProbarLectura_; menuProbarUnionYAnclaje_ | Probar lectura por ventana; Probar unión y anclaje; Inventario de plantillas **[3 ítems]** | no |
| `leerFuente` | Fuentes.gs:287 | diagnosticarColapso_; diagnosticoCorteFilasM2_; encontrarFilaRdvDeReunion_; probarLecturaPeriodo; unirDigitalPorCuenta | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Colapso del lector (2.9 A) **[5 ítems]** | no |
| `menuProbarLectura_` | Fuentes.gs:524 | — | Probar lectura por ventana | no |
| `parsearFechaCelda_` | Fuentes.gs:235 | anclarEncuentros; encontrarFilaRdvDeReunion_; leerFuente; resolverVentana | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Colapso del lector (2.9 A) **[5 ítems]** | no |
| `probarConexionBases` | Fuentes.gs:127 | — | Probar conexión a bases | no |
| `probarLecturaPeriodo` | Fuentes.gs:424 | menuProbarLectura_ | Probar lectura por ventana | no |
| `resolverClave_` | Fuentes.gs:148 | diagnosticarColapso_; diagnosticoCorteFilasM2_; diagnosticoFilasSinClaveDigital_; leerFuente | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Filas sin clave en digital (2.8 E); Colapso del lector (2.9 A) **[6 ítems]** | no |
| `resolverFilaEncabezado_` | Fuentes.gs:270 | leerFuente | Probar lectura por ventana; Probar unión y anclaje; Calcular corte vertical; Corte de filas en m2 (2.8 D); Colapso del lector (2.9 A) **[5 ítems]** | no |
| `resolverVentana` | Fuentes.gs:158 | diagnosticarColapso_; filasDigitalDeEncuentro; menuProbarUnionYAnclaje_; probarLecturaPeriodo | Probar lectura por ventana; Probar unión y anclaje; Colapso del lector (2.9 A) **[3 ítems]** | no |
| `sufijoCobertura_` | Fuentes.gs:518 | menuProbarLectura_ | Probar lectura por ventana | no |
| `agregarDiscrepancias_` (anidada en `menuEstadoConfiguracion_`) | Instalar.gs:2057 | menuEstadoConfiguracion_ | Estado de configuración | no |
| `alinearBasesHojaDefaultLooker_` | Instalar.gs:483 | aplicarInstalacion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `alinearMapeoLookerADinamico_` | Instalar.gs:411 | aplicarInstalacion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `alinearSolapasLookerADinamico_` | Instalar.gs:443 | aplicarInstalacion_; probarMigracionesEnDiff_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas; Correr pruebas del diff **[4 ítems]** | no |
| `aplicarClasificacionSolapas_` | Instalar.gs:1112 | menuAplicarConfiguracion_; sembrarClasificacionSolapas | Aplicar configuración; Sembrar clasificación de solapas **[2 ítems]** | no |
| `aplicarInstalacion_` | Instalar.gs:194 | instalar; menuAplicarConfiguracion_; menuEstadoConfiguracion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `aplicarSeedConfiguracion_` | Instalar.gs:1204 | menuAplicarConfiguracion_; seedConfiguracion | Aplicar configuración; Cargar config inicial **[2 ítems]** | no |
| `asegurarColumna_` | Instalar.gs:614 | aplicarInstalacion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `backfillSolapaMapeo_` | Instalar.gs:581 | aplicarInstalacion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `cabeceraDeCorrida_` | Instalar.gs:1998 | escribirDiffConfiguracion_ | Aplicar configuración; Estado de configuración **[2 ítems]** | no |
| `calcularDiffUpsert_` | Instalar.gs:1309 | menuEstadoConfiguracion_; probarSoloEnHoja_; upsertPorClave_ | Aplicar configuración; Estado de configuración; Promover fechas elegidas; Cargar config inicial; Sembrar clasificación de solapas; Correr pruebas del diff **[6 ítems]** | no |
| `clasificarArchivoPlantilla_` | Instalar.gs:1501 | recorrerCarpetaPlantillas_ | Registrar plantillas | no |
| `claveDeFila` (anidada en `calcularDiffUpsert_`) | Instalar.gs:1316 | calcularDiffUpsert_ | Aplicar configuración; Estado de configuración; Promover fechas elegidas; Cargar config inicial; Sembrar clasificación de solapas; Correr pruebas del diff **[6 ítems]** | no |
| `claveDeObjeto` (anidada en `calcularDiffUpsert_`) | Instalar.gs:1319 | calcularDiffUpsert_ | Aplicar configuración; Estado de configuración; Promover fechas elegidas; Cargar config inicial; Sembrar clasificación de solapas; Correr pruebas del diff **[6 ítems]** | no |
| `clavesTocadasPorMigracion_` | Instalar.gs:313 | menuAplicarConfiguracion_; probarMigracionesEnDiff_ | Aplicar configuración; Correr pruebas del diff **[2 ítems]** | no |
| `construirBloqueAlcance_` | Instalar.gs:1979 | menuAplicarConfiguracion_; menuEstadoConfiguracion_; probarBloqueDeAlcance_ | Aplicar configuración; Estado de configuración; Correr pruebas del diff **[3 ítems]** | no |
| `diagnosticarCarpetaPlantillas_` | Instalar.gs:1546 | menuDiagnosticarCarpetaPlantillas_ | Diagnosticar carpeta de plantillas | no |
| `diagnosticoDrive` | Instalar.gs:32 | — | — | no |
| `eliminarMapeoAlcanceDigitalObsoleto_` | Instalar.gs:368 | aplicarInstalacion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `escribirDiffConfiguracion_` | Instalar.gs:2012 | menuAplicarConfiguracion_; menuEstadoConfiguracion_ | Aplicar configuración; Estado de configuración **[2 ítems]** | no |
| `filasDiffMigraciones_` | Instalar.gs:295 | menuAplicarConfiguracion_; menuEstadoConfiguracion_; probarMigracionesEnDiff_ | Aplicar configuración; Estado de configuración; Correr pruebas del diff **[3 ítems]** | no |
| `filasDiffParaHoja_` | Instalar.gs:1899 | menuAplicarConfiguracion_; probarMigracionesEnDiff_; probarProtegidasConDiferencia_; probarSoloEnHoja_ | Aplicar configuración; Correr pruebas del diff **[2 ítems]** | no |
| `filaSeccion_` | Instalar.gs:1694 | (carga de módulo) Instalar.gs | — | no |
| `filaSolapa_` | Instalar.gs:968 | (carga de módulo) Instalar.gs; filasSolapa_ | — | no |
| `filasSolapa_` | Instalar.gs:981 | (carga de módulo) Instalar.gs | — | no |
| `filasTotales_` (anidada en `menuEstadoConfiguracion_`) | Instalar.gs:2071 | menuEstadoConfiguracion_ | Estado de configuración | no |
| `formatearResumenClasificacionSolapas_` | Instalar.gs:1167 | sembrarClasificacionSolapas | Sembrar clasificación de solapas | no |
| `formatearResumenInstalacion_` | Instalar.gs:327 | instalar; menuAplicarConfiguracion_ | Aplicar configuración; Instalar / reparar hojas **[2 ítems]** | no |
| `formatearResumenSeedConfiguracion_` | Instalar.gs:1240 | seedConfiguracion | Cargar config inicial | no |
| `instalar` | Instalar.gs:348 | — | Instalar / reparar hojas | no |
| `limpiarHojaPorDefecto_` | Instalar.gs:624 | aplicarInstalacion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `matchearInformeId_` | Instalar.gs:1427 | clasificarArchivoPlantilla_ | Registrar plantillas | no |
| `menuAplicarConfiguracion_` | Instalar.gs:1818 | — | Aplicar configuración | no |
| `menuDiagnosticarCarpetaPlantillas_` | Instalar.gs:1571 | — | Diagnosticar carpeta de plantillas | no |
| `menuEstadoConfiguracion_` | Instalar.gs:2050 | — | Estado de configuración | no |
| `menuRegistrarPlantillas_` | Instalar.gs:1596 | — | Registrar plantillas | no |
| `menuSembrarSecciones_` | Instalar.gs:1791 | — | Sembrar árbol de secciones | no |
| `migrarCalculoAOperacion_` | Instalar.gs:558 | aplicarInstalacion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `normalizarParaComparar_` | Instalar.gs:1290 | aplicarClasificacionSolapas_; calcularDiffUpsert_; probarProtegidasConDiferencia_ | Aplicar configuración; Estado de configuración; Promover fechas elegidas; Cargar config inicial; Sembrar clasificación de solapas; Correr pruebas del diff **[6 ítems]** | no |
| `reclasificarSolapasM2Invertidas_` | Instalar.gs:524 | aplicarInstalacion_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas **[3 ítems]** | no |
| `recorrerCarpetaPlantillas_` | Instalar.gs:1485 | registrarPlantillasDesdeCarpeta | Registrar plantillas | no |
| `registrarPlantillasDesdeCarpeta` | Instalar.gs:1444 | menuRegistrarPlantillas_ | Registrar plantillas | no |
| `resumenDesagregado_` | Instalar.gs:1870 | menuAplicarConfiguracion_; probarResumenDesagregado_ | Aplicar configuración; Correr pruebas del diff **[2 ítems]** | no |
| `seedConfigConfig_` | Instalar.gs:1645 | aplicarSeedConfiguracion_ | Aplicar configuración; Cargar config inicial **[2 ítems]** | no |
| `seedConfiguracion` | Instalar.gs:1251 | — | Cargar config inicial | no |
| `sembrarClasificacionSolapas` | Instalar.gs:1178 | — | Sembrar clasificación de solapas | no |
| `sembrarSecciones_` | Instalar.gs:1772 | menuAplicarConfiguracion_; menuSembrarSecciones_ | Aplicar configuración; Sembrar árbol de secciones **[2 ítems]** | no |
| `upsertPorClave_` | Instalar.gs:1383 | aplicarClasificacionSolapas_; aplicarSeedConfiguracion_; promoverFechasElegidas | Aplicar configuración; Promover fechas elegidas; Cargar config inicial; Sembrar clasificación de solapas **[4 ítems]** | no |
| `calcularTokenDirectoRdv_` | Marcadores.gs:146 | corteVerticalRetiro2407_ | Calcular corte vertical | no |
| `corteVerticalRetiro2407_` | Marcadores.gs:183 | menuCorteVerticalRetiro2407_ | Calcular corte vertical | no |
| `encontrarEncuentroRetiro2407_` | Marcadores.gs:135 | corteVerticalRetiro2407_ | Calcular corte vertical | no |
| `menuCorteVerticalRetiro2407_` | Marcadores.gs:229 | — | Calcular corte vertical | no |
| `opCONTEO` | Marcadores.gs:64 | — | — | no |
| `opPCT` | Marcadores.gs:114 | — | — | no |
| `opRATIO` | Marcadores.gs:102 | opPCT | — | no |
| `opSUMA` | Marcadores.gs:46 | — | — | no |
| `opTEXTO` | Marcadores.gs:124 | — | — | no |
| `opULTIMO` | Marcadores.gs:78 | calcularTokenDirectoRdv_ | Calcular corte vertical | no |
| `abrirPanel` | PanelBackend.gs:13 | — | — | no |
| `catalogoBarriosDesdeBase_` | Parseo.gs:209 | anclarEncuentros | Probar unión y anclaje | no |
| `escaparRegex_` | Parseo.gs:26 | parsearBarrio_ | Probar unión y anclaje | no |
| `esPost_` | Parseo.gs:145 | parsearNombreCampana_ | Probar unión y anclaje | no |
| `normalizar_` | Parseo.gs:22 | anclarEncuentros; auditarSolapas; catalogoBarriosDesdeBase_; eliminarMapeoAlcanceDigitalObsoleto_; encontrarFilaRdvDeReunion_; esPost_; parsearBarrio_; parsearComuna_; parsearEje_; parsearPersonas_; parsearTipoEncuentro_; scoreMatchDigitalRdv_; tokenizarTexto_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas; Probar unión y anclaje; Calcular corte vertical; Auditoría de solapas **[6 ítems]** | no |
| `parsearBarrio_` | Parseo.gs:82 | parsearNombreCampana_ | Probar unión y anclaje | no |
| `parsearComuna_` | Parseo.gs:104 | parsearNombreCampana_; scoreMatchDigitalRdv_ | Probar unión y anclaje | no |
| `parsearEje_` | Parseo.gs:119 | parsearNombreCampana_; scoreMatchDigitalRdv_ | Probar unión y anclaje | no |
| `parsearFecha_` | Parseo.gs:43 | parsearLineaReunion_; parsearNombreCampana_ | Cargar temario de reuniones; Probar unión y anclaje **[2 ítems]** | no |
| `parsearNombreCampana_` | Parseo.gs:185 | anclarEncuentros; probarParseo_ | Probar unión y anclaje | no |
| `parsearPersonas_` | Parseo.gs:165 | — | — | no |
| `parsearTipoEncuentro_` | Parseo.gs:131 | parsearNombreCampana_; scoreMatchDigitalRdv_ | Probar unión y anclaje | no |
| `probarParseo_` | Parseo.gs:229 | — | — | no |
| `decisionesFechaPrevias_` | preseleccion_fechas.gs:27 | detectarColumnasFecha | Detectar columnas de fecha | no |
| `preseleccionFilaDiag_` | preseleccion_fechas.gs:55 | detectarColumnasFecha | Detectar columnas de fecha | no |
| `afirmar_` | Pruebas.gs:35 | probarBloqueDeAlcance_; probarMigracionesEnDiff_; probarProtegidasConDiferencia_; probarResumenDesagregado_; probarSoloEnHoja_ | Correr pruebas del diff | no |
| `correrPruebasDiff_` | Pruebas.gs:338 | menuCorrerPruebasDiff_ | Correr pruebas del diff | no |
| `hojaFalsa_` | Pruebas.gs:25 | hojaFalsaConEscrituras_; probarBloqueDeAlcance_; probarSoloEnHoja_ | Correr pruebas del diff | no |
| `hojaFalsaConEscrituras_` | Pruebas.gs:86 | probarMigracionesEnDiff_ | Correr pruebas del diff | no |
| `menuCorrerPruebasDiff_` | Pruebas.gs:362 | — | Correr pruebas del diff | no |
| `probarBloqueDeAlcance_` | Pruebas.gs:43 | correrPruebasDiff_ | Correr pruebas del diff | no |
| `probarMigracionesEnDiff_` | Pruebas.gs:104 | correrPruebasDiff_ | Correr pruebas del diff | no |
| `probarProtegidasConDiferencia_` | Pruebas.gs:232 | correrPruebasDiff_ | Correr pruebas del diff | no |
| `probarResumenDesagregado_` | Pruebas.gs:285 | correrPruebasDiff_ | Correr pruebas del diff | no |
| `probarSoloEnHoja_` | Pruebas.gs:173 | correrPruebasDiff_ | Correr pruebas del diff | no |
| `cargarTemarioReuniones_` | Reuniones.gs:140 | menuCargarTemarioReuniones_ | Cargar temario de reuniones | no |
| `leerReuniones_` | Reuniones.gs:37 | anclarEncuentros | Probar unión y anclaje | sí |
| `menuCargarTemarioReuniones_` | Reuniones.gs:159 | — | Cargar temario de reuniones | no |
| `parsearLineaReunion_` | Reuniones.gs:63 | cargarTemarioReuniones_ | Cargar temario de reuniones | no |
| `leerSecciones_` | Secciones.gs:20 | — | — | sí |
| `ordenarRecursivo` (anidada en `leerSecciones_`) | Secciones.gs:54 | leerSecciones_ | — | sí |
| `auditarFormulasResumenesLooker_` | Solapas.gs:321 | menuAuditarFormulasResumenesLooker_; menuConsolidarMapeoLooker_ | Consolidar mapeos de looker; Auditar fórmulas de resúmenes **[2 ítems]** | no |
| `compararResumenesLooker_` | Solapas.gs:232 | menuCompararResumenesLooker_ | Comparar resúmenes de looker | no |
| `consolidarMapeoLooker_` | Solapas.gs:442 | menuConsolidarMapeoLooker_ | Consolidar mapeos de looker | no |
| `inventariarSolapas` | Solapas.gs:46 | menuInventariarSolapas_ | Inventariar solapas | no |
| `leerFilasSolapas_` | Solapas.gs:167 | alinearSolapasLookerADinamico_; aplicarClasificacionSolapas_; consolidarMapeoLooker_; inventariarSolapas; menuEstadoConfiguracion_; reclasificarSolapasM2Invertidas_ | Aplicar configuración; Estado de configuración; Instalar / reparar hojas; Sembrar clasificación de solapas; Consolidar mapeos de looker; Inventariar solapas; Correr pruebas del diff **[7 ítems]** | no |
| `leerFirmaEncabezado_` | Solapas.gs:34 | inventariarSolapas | Inventariar solapas | no |
| `menuAuditarFormulasResumenesLooker_` | Solapas.gs:410 | — | Auditar fórmulas de resúmenes | no |
| `menuCompararResumenesLooker_` | Solapas.gs:268 | — | Comparar resúmenes de looker | no |
| `menuConsolidarMapeoLooker_` | Solapas.gs:493 | — | Consolidar mapeos de looker | no |
| `menuInventariarSolapas_` | Solapas.gs:192 | — | Inventariar solapas | no |
| `anclajeYaConfirmado_` | Union.gs:425 | anclarEncuentros | Probar unión y anclaje | no |
| `anclar_` | Union.gs:229 | anclarEncuentros | Probar unión y anclaje | no |
| `anclarEncuentros` | Union.gs:471 | menuProbarUnionYAnclaje_ | Probar unión y anclaje | no |
| `anioDefectoDesdeVentana_` | Union.gs:289 | anclarEncuentros | Probar unión y anclaje | no |
| `candidatosCercanosPorFecha_` | Union.gs:211 | anclarEncuentros | Probar unión y anclaje | no |
| `encabezadoEnColumna_` | Union.gs:29 | valorPorColumna_ | Probar unión y anclaje; Calcular corte vertical **[2 ítems]** | no |
| `encontrarFilaRdvDeReunion_` | Union.gs:353 | anclarEncuentros; encontrarEncuentroRetiro2407_ | Probar unión y anclaje; Calcular corte vertical **[2 ítems]** | no |
| `filasDigitalDeEncuentro` | Union.gs:576 | — | — | no |
| `indiceAnclajePendiente_` | Union.gs:411 | anclarEncuentros | Probar unión y anclaje | no |
| `menuProbarUnionYAnclaje_` | Union.gs:596 | — | Probar unión y anclaje | no |
| `normalizarIdCuenta_` | Union.gs:56 | filasDigitalDeEncuentro; unirDigitalPorCuenta | Probar unión y anclaje | no |
| `obtenerHojaAnclajePendiente_` | Union.gs:400 | anclarEncuentros | Probar unión y anclaje | no |
| `registrarAnclajePendiente_` | Union.gs:437 | anclarEncuentros | Probar unión y anclaje | no |
| `scoreMatchDigitalRdv_` | Union.gs:320 | anclarEncuentros | Probar unión y anclaje | no |
| `solapamientoTokens_` | Union.gs:297 | scoreMatchDigitalRdv_ | Probar unión y anclaje | no |
| `tokenizarTexto_` | Union.gs:293 | solapamientoTokens_ | Probar unión y anclaje | no |
| `umbralAnclajeReunion_` | Union.gs:198 | anclarEncuentros | Probar unión y anclaje | no |
| `unirDigitalPorCuenta` | Union.gs:89 | anclarEncuentros; filasDigitalDeEncuentro; menuProbarUnionYAnclaje_ | Probar unión y anclaje | no |
| `valorPorColumna_` | Union.gs:46 | anclarEncuentros; calcularTokenDirectoRdv_; encontrarFilaRdvDeReunion_; unirDigitalPorCuenta | Probar unión y anclaje; Calcular corte vertical **[2 ítems]** | no |
| `verificarPrecondicionAnclaje_` | Union.gs:243 | anclarEncuentros | Probar unión y anclaje | no |
| `buscarDivergencia_` | Valores.gs:65 | registrarOActualizarDivergencia_; registrarValorCalculado_ | — | no |
| `buscarUltimoValor_` | Valores.gs:40 | registrarValorCalculado_ | — | no |
| `escribirFilaValores_` | Valores.gs:56 | registrarValorCalculado_ | — | no |
| `hojaValores_` | Valores.gs:28 | registrarValorCalculado_ | — | no |
| `hojaValoresDivergentes_` | Valores.gs:32 | leerDivergenciasPendientes_; registrarValorCalculado_ | Revisar divergencias de valores | no |
| `leerDivergenciasPendientes_` | Valores.gs:171 | menuRevisarDivergenciasValores_ | Revisar divergencias de valores | no |
| `menuRevisarDivergenciasValores_` | Valores.gs:194 | — | Revisar divergencias de valores | no |
| `registrarOActualizarDivergencia_` | Valores.gs:79 | registrarValorCalculado_ | — | no |
| `registrarValorCalculado_` | Valores.gs:121 | — | — | no |

## Menciones por string que NO son despacho (posibles falsos vivos si se contaran)

- `doGet` citado en Api.gs:41
- `doPost` citado en Api.gs:41
- `manejarPedido_` citado en Api.gs:41
