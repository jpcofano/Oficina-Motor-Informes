# Paso 2.11 — Una sola fuente de verdad para la configuración

> Destino: `docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`
> **Paso de consolidación. No agrega funcionalidad.** Las Partes D, E y G del `Paso-2.10`
> quedan en espera hasta que este cierre.
> Un commit por parte, con verificación en la planilla viva entre una y otra.
> **Trabajamos en español.**

---

## Por qué este paso

El proyecto no está en producción, así que se puede reordenar. Conviene hacerlo ahora,
porque el problema ya se manifestó: la Parte C se commiteó, se pusheó, y `m2` siguió
leyendo `M2 periodo DIRECTA` igual. No fue un error de Code — fue que **el mismo hecho está
escrito en tres lugares distintos del repo y en la planilla**, y cuál gana depende de qué
ítem de menú se corrió último.

### La evidencia

`BASES.m2.hoja_default` está definido dos veces, con valores contradictorios:

```
Instalar.gs:69    HOJAS_CONFIG_.BASES.ejemplos
                  ['m2', 'M2 Reporte 2026', '', 'M2 periodo DIRECTA', 3, 'snapshot', …]

Instalar.gs:566   SEED_BASES_
                  // Paso 2.10 Parte C: hoja_default vacío a propósito
```

Lo mismo con `MARCADORES`:

```
Instalar.gs:90    ['m2_envios', 'm2', 'jm', 'm2', 'M2 periodo DIRECTA', 'envios', …]
```

Y las dos se escriben por caminos distintos: `instalar()` siembra desde
`HOJAS_CONFIG_.ejemplos`, `seedConfiguracion()` desde `SEED_BASES_`. **Correr
"Instalar / reparar hojas" después de "Cargar config inicial" revierte la Parte C sin
avisar.**

Ese es el modo de falla caro otra vez, en la configuración en vez de en los números.

### Lo que este paso NO cuestiona

`reclasificarSolapasM2Invertidas_` está bien resuelto: `SOLAPAS_M2_INVERTIDAS_` quedó en
`['M2 Directa', 'M2 digital']` y las dos `periodo` salieron de la lista con el comentario
que explica por qué. Es el ejemplo de cómo debería quedar todo lo demás.

---

## Parte A — `HOJAS_CONFIG_.ejemplos` deja de ser configuración

`HOJAS_CONFIG_` define el **esquema** (los `headers`). Los `ejemplos` empezaron como
documentación de formato y terminaron sembrando datos reales.

### Tareas

1. Para cada hoja de `HOJAS_CONFIG_` que tenga un `SEED_*` correspondiente
   (`BASES`, `MAPEO`, `MARCADORES`, `CONFIG`, `SOLAPAS`, `SECCIONES`): **borrar `ejemplos`**.
   El esquema queda con `headers` solamente.
2. Para las hojas que **no** tienen `SEED_*` (si quedan), mover los `ejemplos` a un
   `SEED_*` nuevo, no dejarlos donde están.
3. `instalar()` crea hojas y encabezados. **No escribe filas de datos.** Si una hoja queda
   vacía después de instalar, es correcto: la llena el sembrador.
4. Grep de control: después del cambio, `'M2 periodo DIRECTA'` sólo puede aparecer en
   `SEED_SOLAPAS_` (como `referencia`) y en comentarios. En ningún `ejemplos`, ningún
   `hoja_default`, ninguna fila de `MARCADORES`.

### Criterio de aceptación

Correr "Instalar / reparar hojas" sobre la planilla actual **no cambia ni una celda de
`BASES`, `MAPEO` ni `MARCADORES`**. Hoy las revierte.

---

## Parte B — `fila_encabezado` es por solapa, no por base

`BASES.m2.fila_encabezado = 3` se aplica a toda la base. Medido contra el archivo del
31/07, es correcto sólo para las dos vistas que la Parte C acaba de sacar de circulación:

| solapa de `m2` | `SOLAPAS` dice | es | primeras celdas reales |
|---|---|---|---|
| `Directa mail` | 3 | **1** | `ID Cuentas · ID MailUp · Listado de Mail` |
| `M2 Directa` | 3 | **1** | `ID cuentas · ID MailUp · Listado de Mail` |
| `M2 digital` | 3 | **1** | `ID Cuentas · Nombre campaña…` |
| `Seguimiento digital` | 3 | **1** | `ID Cuentas · Nombre campaña…` |
| `CAMPAÑAS_DESGLOCE_DIGITAL` | 3 | **1** | `Id accion · Id cuentas · Año` |
| `Alcance` | 3 | **1** | `ID Cuentas · Alcance · Frecuencia` |
| `Digital acumulado` | 3 | **1** | `Id · Nombre de la campaña…` |
| `Mail per` | 3 | **sin encabezado** | la fila 2 ya es dato |
| `M2 periodo DIGITAL` | 3 | 3 ✓ | |
| `M2 periodo DIRECTA` | 3 | 3 ✓ | |

Leer `m2/Directa mail` con encabezado en la fila 3 toma como títulos los valores de la
segunda fila de datos. No falla: devuelve columnas con nombres raros y números plausibles.

### Tareas

1. `SOLAPAS.fila_encabezado` es la fuente. `BASES.fila_encabezado` pasa a ser sólo el
   **default** para solapas no declaradas en `SOLAPAS`.
2. Corregir `SEED_SOLAPAS_` con la tabla de arriba.
3. `Mail per` (las dos, `m2` y `digital`) lleva `fila_encabezado = 0` con el significado
   **"sin fila de títulos"**. Documentarlo en el comentario del seed. Ninguna solapa `fuente`
   puede tener `0`; es un valor válido sólo para `referencia`.
4. `leerFuente` usa `SOLAPAS.fila_encabezado` y cae al de `BASES` sólo si no encuentra fila.

### Criterio de aceptación

`menuInventariarSolapas_` sobre `m2` reporta encabezados legibles en las siete solapas
corregidas: `ID Cuentas`, `Id accion`, etc. Hoy devuelve valores de datos como títulos.

---

## Parte C — Un solo "Aplicar configuración", con diff

Hoy la configuración se aplica desde cuatro ítems de menú distintos, en un orden que no
está escrito en ningún lado:

```
instalar()                      → crea hojas + corre 8 migraciones
seedConfiguracion()             → BASES, MAPEO, CONFIG
sembrarClasificacionSolapas()   → SOLAPAS
menuSembrarSecciones_()         → SECCIONES
```

Preguntar "¿el cambio ya está aplicado?" tiene cuatro respuestas posibles y ninguna forma
de verificarlo. Eso fue exactamente lo que pasó con la Parte C.

### Tareas

1. **`menuAplicarConfiguracion_()`** — un ítem que corre los cuatro en orden fijo y
   documentado. Los cuatro individuales quedan (sirven para depurar) pero bajan a un
   submenú `Avanzado`.
2. El resultado es un **diff, no un conteo**: por hoja, qué filas se crearon, cuáles
   cambiaron y **de qué valor a qué valor**, y cuáles se respetaron por ser `origen=manual`.
   Un "BASES — actualizadas: 1" no dice si se aplicó lo que se quería.
3. **`menuEstadoConfiguracion_()`** — sólo lectura, no escribe nada. Por cada hoja de
   registro: filas, distribución de `origen` (`seed` / `manual` / `auto`), y **discrepancias
   entre el `SEED_*` del código y lo que hay en la planilla**. Es la respuesta a "¿en qué
   estado está esto?" sin tener que correr nada que modifique.

### Criterio de aceptación

Correr "Aplicar configuración" dos veces seguidas: la segunda no reporta ningún cambio.
`menuEstadoConfiguracion_()` reporta cero discrepancias entre código y planilla.

---

## Parte D — Menú por función, migraciones con vencimiento

32 ítems de menú, la mayoría nombrados por el prompt que los creó
(`Diagnosticar colapso del lector (Paso 2.9A)`, `Auditar digital/Digital/alcance (Parte B)`,
`Comparar resúmenes de looker (Parte G)`). Dentro de seis semanas nadie va a saber cuáles
siguen sirviendo.

Y ocho migraciones one-off corren en cada `instalar()` para siempre:
`backfillSolapaMapeo_`, `eliminarMapeoAlcanceDigitalObsoleto_`, `alinearMapeoLookerADinamico_`,
`alinearSolapasLookerADinamico_`, `corregirNotaControlAnclaje_`, `reclasificarSolapasM2Invertidas_`,
`alinearBasesHojaDefaultLooker_`, `migrarCalculoAOperacion_`.

### Tareas

1. Renombrar los ítems de menú por **lo que hacen**, no por el paso que los pidió. La
   referencia al paso va en el comentario de la función, no en la etiqueta.
2. Agrupar en submenús: `Configuración`, `Correr`, `Verificar`, `Diagnósticos`, `Avanzado`.
3. **Retirar los diagnósticos de hipótesis ya cerradas.** `menuDiagnosticarColapsoLector_`
   (Paso 2.9A) investigaba un colapso que `VALIDACION §1.1` descartó: `m2` devuelve 18
   porque hay 18 filas reales. Dejarlo en el menú invita a re-abrir algo resuelto.
4. Cada migración `alinear*_` / `corregir*_` / `migrar*_` lleva en su comentario **en qué
   commit se introdujo y qué condición la vuelve innecesaria**. Las que ya no pueden
   dispararse —porque `SEED_*` produce el estado correcto de entrada— se borran, no se
   dejan "por las dudas".
5. `docs/RUNBOOK.md`: una tabla de ítem de menú → qué hace → cuándo se usa.

### Criterio de aceptación

Ningún ítem de menú menciona un número de paso. `instalar()` corre las migraciones que
quedan y reporta cero cambios sobre una planilla ya aplicada.

---

## Lo que sigue después, y en qué orden

Con esto cerrado, el orden vuelve a ser lineal y cada paso tiene una sola forma de
aplicarse:

1. **`Paso-2.10` Parte B** — `filas_datos` / `filas_crudas`. Quedó a medias: la columna
   existe pero ningún sembrador la llena, así que el criterio de aceptación no se puede
   chequear. Verificar contra la tabla de doce valores medidos de
   `Paso-2.10_PartesBC_verificado.md`.
2. **`Paso-2.10_ParteD_con_R10`** — R-10 en código, después la hoja `VALIDACION`.
3. **`Paso-2.10` Parte E** — corte vertical a Orden Público 28/07.
4. **`Paso-2.10` Partes G y A** — `REUNIONES` y el handoff.

R-06 y R-09 siguen sin implementar y están anotadas en `PENDIENTES_consistencia.md`. No
entran acá: tocan el anclaje, que es Paso 3.

---

> ⚠ **Addendum 1 (01/08/2026) — la Parte C.2 entera, bajada acá. Punto 1 de `C.2-7`.**
> Este documento estaba ejecutado cuando la Parte C.2 se escribió, así que la C.2 nació en
> un prompt aparte (`docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`, con sus propios
> tres addenda) y este texto quedó describiendo un diff que ya no es el que hay. Se baja
> acá lo que cambió, sin tocar una línea de arriba.
>
> **Qué agregó la Parte C.2 sobre la Parte C** (código en `Instalar.gs`, salvo donde se
> indica; controles positivos en `Pruebas.gs`, archivo nuevo):
>
> | punto | qué cambió | dónde |
> |---|---|---|
> | **C.2-1** | `normalizarParaComparar_(valor, tipoColumna)` — lleva `Date` y string-fecha a ISO `yyyy-mm-dd` antes de comparar. Sin esto el paso 4 del protocolo (segunda corrida, cero cambios) **no podía pasar nunca**: la hoja tiene `Date`, el seed escribe string, Sheets lo reparsea a `Date`, y la corrida siguiente vuelve a ver una diferencia. La hipótesis original —que el seed había degradado `PERIODOS` de fecha a texto— quedó **tumbada** por el diagnóstico: las doce celdas eran `Date`; lo que había cambiado era el número de formato de la celda | `calcularDiffUpsert_()` |
> | **C.2-2** | Cabecera de corrida (`ejecutado_por`, `fecha_hora`, `version_codigo`) y bloque de alcance en las dos hojas de reporte, que se limpian enteras antes de escribir. Hasta acá "`BASES`: cero líneas" y "`BASES`: no se audita" producían el mismo output, y había que vaciar `DIFF_CONFIGURACION` a mano antes de cada corrida | `cabeceraDeCorrida_()`, `ALCANCE_REGISTROS_`, `construirBloqueAlcance_()`, `escribirDiffConfiguracion_()` |
> | **C.2-3** | Cada migración acepta `aplicar = false` y calcula sin escribir; las que escriben emiten líneas `migracion`. Fue la única forma de que "Estado" incluyera las migraciones pendientes sin aplicarlas | `aplicarInstalacion_(false)`, `filasDiffMigraciones_()` |
> | **C.2-4** | La protegida dice **qué** se habría perdido (`protegida (habría cambiado)`, con columna, anterior y nuevo), y la que no tenía nada por cambiar lo dice explícito (`protegida (sin diferencias)`). Celdas vacías eran ambiguas en las dos direcciones | `aplicarClasificacionSolapas_()`, `filasDiffParaHoja_()` |
> | **C.2-5** | Tercer tipo de línea, `solo_en_hoja`: lo que está en la hoja y no en el seed. **No se borra nada**, sólo se reporta — ahí es donde viven las ediciones a mano | `calcularDiffUpsert_()`, `menuEstadoConfiguracion_()` |
> | **C.2-6** | Resumen desagregado en el `alert()`: `cambiadas · agregadas · migraciones · solo_en_hoja · protegidas (con diferencia) · protegidas (sin diferencia) · sin cambios`, más `otras líneas (sin categoría)` para que un tipo nuevo no desaparezca del total. Sin `tipo_degradado`, que no se implementó (ver abajo). Sin claves en el `alert()` — eso ya rompió `diagnosticarColapso_()` por timeout | `resumenDesagregado_()` |
> | **C.2-7** | Esta documentación y `docs/_snapshots/` (`tools/snapshot.js`, RUNBOOK Parte H) | — |
>
> **Dos cosas se diseñaron y no van, y conviene que quede escrito por qué:** la tarea 4 de
> C.2-1 (`tipo = tipo_degradado`) resolvía un problema que el diagnóstico demostró
> inexistente, y un guardarraíl que nunca puede dispararse es peso muerto; y la migración
> `corregirNotaControlAnclaje_` se **retiró entera** —constante, función, llamada y línea de
> resumen— porque `SEED_SOLAPAS_` ya era dueño del valor correcto. Una migración que
> corrige un valor que el seed vuelve a escribir bien no es una migración, es un parche
> permanente. Esa retirada es lo que cerró el paso 4 del protocolo (idempotencia) y, de
> arrastre, el paso 5.
>
> **El fix de `sembrarClasificacionSolapas()` que la Parte C hizo y nunca se documentó.**
> El objeto que la clasificación manda al upsert dejó de incluir `filas_datos` y
> `firma_encabezado`. Esas dos columnas son de `inventariarSolapas()` (`Solapas.gs`), que
> las mide contra el archivo vivo; el objeto de `SEED_SOLAPAS_` casi siempre las trae en
> `''` (sólo algunas filas de `looker`/`m2` tienen una estimación manual vieja), así que
> escribirlas en cada siembra devolvía a blanco —o a un número de relevamiento
> desactualizado— lo que el inventario ya había medido. Con la clasificación corriendo
> ahora **dentro** de "Aplicar configuración", pensada para correrse seguido y no una sola
> vez, ese pisado dejó de ser tolerable. Es el mismo hallazgo que C.2-2 punto 4 pedía
> declarar: una exclusión no documentada es una excepción oculta. Comentario en
> `Instalar.gs`, arriba de `aplicarClasificacionSolapas_()`.
>
> **Controles positivos, y por qué hacían falta.** El protocolo de siete pasos **pasa igual
> aunque las cinco partes estén mal**: cero cambios sigue siendo cero cambios. Cada parte
> tiene su `probar*_()` en `Pruebas.gs`, que le mete una discrepancia conocida por una hoja
> sintética (`hojaFalsa_`) y afirma que se detecta, sin tocar la planilla. Se verificó por
> **mutación** que discriminan: se rompió cada función a propósito, incluido reintroducir el
> bug original de cada parte, y cazaron 18 de 18. Menú: Diagnóstico → "Correr pruebas del
> diff" (`correrPruebasDiff_`).
>
> **Estado al 01/08/2026.** Partes A, B y C cerradas; C.2 completa y verificada en vivo
> (evidencia: `docs/PROTOCOLO_2.11-C_corrida_2026-08-01.md`). La **Parte D sigue abierta**
> — es lo único de este documento que falta, y arrastra `BASES.fila_encabezado` vestigial
> (H-2), los dos accesos directos de `Union.gs` y el retiro de
> `reclasificarSolapasM2Invertidas_`.

---

> ⚠ **Addendum 2 (02/08/2026) — Parte E: el escritor de looker. Primera vez que se escribe
> algo de una "Parte E" que este documento nunca tuvo.**
>
> **La Parte E no existía.** Este prompt tiene Partes A, B, C y D. Cuatro documentos la
> citaban como si existiera (`docs/BITACORA.md`, `docs/ESCRITORES.md` §2.1,
> `docs/Prompts/AUD-3_inventario_codigo.md`) y le asignaban el contrato de escritores. Este
> addendum es lo primero que se escribe bajo ese nombre; el resto de la Parte E —el
> contrato completo— vive en `docs/ESCRITORES.md`, que es documento vivo.
>
> **De dónde salió.** El censo mecánico de la Parte E del `AUD-3` encontró un tercer
> escritor de `MAPEO` que nadie le sopló: `consolidarMapeoLooker_` (`Solapas.gs`), que
> además escribía `BASES.hoja_default` y seis celdas de `SOLAPAS`, desde el ítem de menú
> "Consolidar mapeos de looker". El `P1` de `C.2-7` contaba dos escritores y eran tres.
>
> **Evidencia (sólo lectura, 01-02/08/2026).** Contra `docs/_snapshots/` y corriendo el
> diagnóstico por la API:
>
> - La consolidación **ya estaba aplicada**: 27/27 filas de `MAPEO` de looker en
>   `resumen_metricas_dinamico`, `SOLAPAS` con `fuente`/`derivada`, `BASES.hoja_default`
>   alineada. La sostienen en cada corrida tres migraciones idempotentes de `Instalar.gs`
>   (`alinearMapeoLookerADinamico_`, `alinearSolapasLookerADinamico_`,
>   `alinearBasesHojaDefaultLooker_`), o sea que la cuarta función no aportaba nada.
> - **Su único camino de invocación producía la dirección invertida.**
>   `auditarFormulasResumenesLooker_`, que le pasaba `hojaFuente`/`hojaDerivada`, devuelve
>   `fuente: 'resumen_metricas'` — al revés de `S-01`. Clasifica "tiene fórmula → derivada"
>   sin mirar que la fórmula es un `QUERY()` sobre una **tercera** hoja. Un click revertía
>   `S-01` sobre las tres hojas de registro, bajo un texto de confirmación que sonaba
>   autorizado.
> - **Dos de las diez `protegida (habría cambiado)` no eran decisiones humanas.** Las de
>   `looker` tenían `origen=manual` escrito por `alinearSolapasLookerADinamico_`, de cuando
>   el seed todavía mandaba esas filas a `revisar`. Con el seed ya diciendo
>   `fuente`/`derivada`, la protección no protegía nada: su único efecto vivo era congelar
>   la nota corta que escribía la migración, porque `aplicarClasificacionSolapas_` saltea
>   toda fila `origen=manual` sin escribirla.
>
> **Decisión (a) — migración ejecutada.** Lo aplicado:
>
> 1. **Dos bajas en la tabla `MENU_`**, no una: `menuConsolidarMapeoLooker_` y
>    `menuAuditarFormulasResumenesLooker_`. El segundo muestra la misma recomendación
>    invertida y remata mandando a correr el primero — retirar uno solo dejaba un consejo
>    equivocado sin salida. De 36 ítems a 34.
> 2. **Ninguna función se borró.** Encabezado en las cuatro. `consolidarMapeoLooker_` está
>    **parametrizada por dirección**: sigue siendo la única forma de mover la decisión sin
>    tocar código si el dueño externo cambia cuál hoja mantiene. Una migración ejecutada no
>    es código muerto.
> 3. **`alinearSolapasLookerADinamico_` dejó de escribir `notas` y pasó `origen` de
>    `'manual'` a `'seed'`.** Con eso la fila vuelve al sembrador y el piso de diez baja a
>    ocho. La instrucción original decía mantener `origen=manual`, pero eso no cerraba el
>    piso —el `manual` es justamente lo que bloquea al seed—, y se corrigió antes de
>    ejecutar.
>
> **Verificado en la planilla (02/08/2026), las tres corridas:**
>
> | corrida | resultado |
> |---|---|
> | Aplicar 1ª | `migraciones: 2` (los dos `origen: manual → seed`) · `cambiadas: 2` (las dos notas que el seed por fin escribe) · **`protegidas (con diferencia): 8`** |
> | Aplicar 2ª | todo en cero, `protegidas: 8`, `sin cambios: sí` — **la idempotencia no se rompió** |
> | Estado | `SOLAPAS 84 filas [manual: 8, seed: 76]`, 0 discrepancias, 0 migraciones pendientes |
>
> El `manual: 8` es el control positivo desde el otro lado: quedan **exactamente** las ocho
> decisiones humanas de `rdv`, que son el alcance del Grupo B de
> `docs/Prompts/Paso-2.12_Parte2_disposicion_solapas.md`.
>
> **Lo que este addendum NO cierra.** La inferencia invertida de
> `auditarFormulasResumenesLooker_` **no se arregló**: se anotó como `P1` en
> `docs/PENDIENTES_consistencia.md`, con qué falta (un estado `ambas_independientes` para
> cuando la fórmula apunta a una hoja que no es la otra del par). Hasta entonces ninguna de
> las dos funciones vuelve al menú. Y `promoverFechasElegidas()` sigue siendo un escritor
> de `MAPEO` sin declarar — es el `P1` original de `C.2-7` y no es de este paso.

---

> ⚠ **Addendum 3 (02/08/2026) — la Parte D queda ARCHIVADA. `DOC-7` Parte A.**
>
> **No se mueve el archivo:** las Partes A, B y C están ejecutadas y la C tiene su propia
> cadena de addenda. Se archiva **la parte**, declarándolo acá, que es el mecanismo del repo
> para un prompt ya corrido. El texto de la Parte D no se toca.
>
> **Por qué se archiva: sus cuatro tareas se cumplieron por otro camino.**
>
> | tarea de la Parte D | quién la hizo |
> |---|---|
> | 1 · renombrar los ítems de menú por lo que hacen, no por el paso | `MENU_declarado_por_tabla.md` — `Codigo.gs` declara hoy la convención en el propio archivo: *"la etiqueta dice QUÉ hace el ítem; el paso que lo creó vive en el encabezado de la función"* |
> | 2 · agrupar en submenús | ídem — seis submenús (`Configuración`, `Datos y decisiones`, `Diagnóstico`, `Plantillas`, `Avanzado`, `Archivo`) |
> | 3 · retirar los diagnósticos de hipótesis cerradas | parcial y por decisión distinta: el submenú **`Archivo (casos cerrados)`** los conserva declarando su intención, en vez de borrarlos. Se resolvió mejor que como lo pedía la tarea |
> | 4 · migraciones con vencimiento | de a una, y con evidencia cada vez: `corregirNotaControlAnclaje_` (2.11 C.2), `consolidarMapeoLooker_` + `auditarFormulasResumenesLooker_` (2.11 Parte E), `reclasificarSolapasM2Invertidas_` (2.12 Parte 3) |
>
> **Lo único vivo que tenía era `H-2`** (`BASES.fila_encabezado` vestigial, y `Union.gs:36`
> y `:261` leyéndola directo sin pasar por `resolverFilaEncabezado_()`). **Se desprendió
> antes de archivar**: `docs/PENDIENTES_consistencia.md` lo tiene como `P1` autosuficiente,
> sin paso asignado y esperando uno propio. Archivar una parte que todavía sostiene un
> pendiente sería perderlo, que es justo lo que este censo vino a evitar.
