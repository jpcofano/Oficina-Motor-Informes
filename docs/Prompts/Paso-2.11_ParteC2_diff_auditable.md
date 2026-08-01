# Paso 2.11 — Parte C.2: que el diff sea auditable

> **No commitear la Parte C todavía.** Esta parte la cierra.
> Continúa `docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md` (Partes A y B hechas, C sin commitear).
> Verificado contra la planilla viva del motor el 31/07/2026, después de la primera corrida de
> "Aplicar configuración".
> **Trabajamos en español.**

---

## Por qué existe esta parte

La Parte C introdujo `calcularDiffUpsert_()`, `menuAplicarConfiguracion_()` y
`menuEstadoConfiguracion_()`. El diff **funciona** —la línea de `notas` de
`digital||RDV JM 2 VECES` salió con clave, columna, anterior y nuevo—, pero la primera corrida
dejó cuatro cosas que hacen que su resultado no sea interpretable, y una regresión de tipo de
dato que rompe el filtro de período en silencio.

El principio de siempre: **el modo de falla caro no es el que rompe, es el que devuelve un
número plausible.** Un diff que no dice qué auditó es exactamente eso.

---

## C.2-1 — El seed degradó `PERIODOS` de fecha a texto (regresión, prioridad máxima)

**Evidencia.** El diff reportó:

```
PERIODOS  cambio  m2_mensual     desde  1/06/2026   → 2026-06-01
PERIODOS  cambio  m2_mensual     hasta  30/06/2026  → 2026-06-30
PERIODOS  cambio  quincena_rrss  desde  16/06/2026  → 2026-06-16
PERIODOS  cambio  quincena_rrss  hasta  30/06/2026  → 2026-06-30
```

El `anterior` está en formato local (`1/06/2026`) = era un objeto `Date`. El `nuevo` es ISO
plano. Después de aplicar, la hoja `PERIODOS` muestra `2026-06-01`, mientras que las celdas
que sí son `Date` en esta misma planilla se leen como
`Sat Jul 05 2025 12:00:00 GMT-0300`. Conclusión: **`SEED_PERIODOS_` escribe strings y
`PERIODOS.desde` / `PERIODOS.hasta` dejaron de ser fechas.**

**Por qué importa más que el diff.** En Apps Script:

```js
fechaFila >= "2026-06-01"   // Number("2026-06-01") === NaN  →  false, siempre
```

Cualquier filtro por ventana que resuelva contra `PERIODOS` devuelve **cero filas sin
fallar**. Hoy `MARCADORES.m2_envios` ya usa `periodo_ref = m2_mensual`.

> ⚠ **Addendum (31/07/2026, C.2-1 diagnóstico previo — el párrafo de arriba queda, corregido
> acá).** La afirmación del cero-filas era una deducción de la semántica de `>=` en
> JavaScript, sin leer el camino de lectura. Leído el camino: **no hay hoy ningún consumidor
> de estos seis campos que compare el valor crudo.** El único punto de consumo es
> `resolverVentana()` (`Fuentes.gs:145-183`), que pasa los seis por `parsearFechaCelda_()`
> (`Fuentes.gs:222`), y esa función acepta `Date` **y** texto ISO/dd-mm — un string
> `'2026-06-01'` resuelve la ventana igual de bien. Río abajo (`leerFuente`, `Union.gs`) solo
> circula `ventana.desde/hasta`, que ya es `Date` por construcción. Verificado por grep:
> `leerPeriodos()`/`leerCampanas()` no tienen otro caller, y los demás usos de `leerConfig()`
> son `carpeta_plantillas`/`umbral_anclaje_reunion`, no fechas.
>
> **C.2-1 sigue en pie, con severidad menor y otro síntoma:** mientras `SEED_PERIODOS_`
> escriba texto y la celda quede/vuelva a `Date`, las cuatro líneas de `PERIODOS` reaparecen
> en cada corrida del diff — y el paso 4 del protocolo (segunda corrida, cero cambios) **no
> puede pasar nunca**. No rompe el motor: rompe el criterio que dice si el diff sirve. Las
> tareas 2–4 quedan como están; la 1 (diagnóstico de tipos, ya desplegado como ítem de menú
> "Tipos de fechas de ventana") sigue siendo el paso previo obligatorio.
>
> **Hallazgos re-verificados contra el repo hoy (los de planilla no se pueden chequear desde
> Code):** H-2 sigue vigente (`Union.gs:36` y `:261` leen `base.fila_encabezado` directo,
> confirmado por grep) y H-6 sigue vigente (ningún `SEED_MARCADORES_` en `Instalar.gs`,
> nueve `SEED_*` y ninguno es de `MARCADORES`). Ninguno de los ocho resultó inválido desde
> el lado del código.

> ⚠ **Addendum 2 (31/07/2026, diagnóstico corrido — la hipótesis de degradación queda
> tumbada).** El diagnóstico de tipos dio: **las doce celdas son `Date`** — `PERIODOS`,
> `CAMPANAS` y `CONFIG`, todas. Ninguna se degradó. Lo que cambió fue el **formato de
> visualización** (antes `1/06/2026`, ahora `2026-06-01`): la escritura del seed pisó el
> número de formato de la celda, y Sheets reparseó el string a `Date` igual. El ciclo real:
> la hoja tiene `Date` → el seed escribe string → Sheets lo convierte de nuevo a `Date` →
> la próxima corrida compara `Date` contra string, no coinciden, reescribe. Para siempre.
> El paso 4 del protocolo no puede pasar, y no hay ningún bug de datos detrás.
>
> **Qué queda de C.2-1 y qué se cae:**
> - **Queda solo la tarea 3** — `normalizarParaComparar_(valor, tipoColumna)` en
>   `calcularDiffUpsert_()`. Es el arreglo entero.
> - La tarea 2 (`SEED_PERIODOS_` escribe `Date` reales) pasa a **opcional, no correctiva**:
>   Sheets ya convierte. Solo si sale gratis.
> - La tarea 4 (`tipo_degradado`) **no va**: se diseñó para un problema que no existe, y un
>   guardarraíl que nunca puede dispararse es peso muerto.
> - El criterio de aceptación `PERIODOS.desde instanceof Date === true` **ya se cumple hoy**
>   y no discrimina nada. Criterio nuevo: correr "Aplicar configuración" dos veces y que la
>   segunda **no reporte ninguna línea de `PERIODOS` ni de `CAMPANAS`**.
> - Detalle menor que sí conviene: que el seed no pise el número de formato de la celda (o
>   escriba `Date` y el formato quede estable) — hoy la hoja se ve distinta después de cada
>   instalación aunque el valor sea el mismo.

1. **Verificar antes de tocar.** Correr un diagnóstico de sólo lectura que imprima
   `typeof` y `instanceof Date` de `PERIODOS.desde` / `PERIODOS.hasta` y de
   `CONFIG.periodo_desde` / `CONFIG.periodo_hasta`. Dejar el resultado en la bitácora.
   No decidir a ojo: la celda se ve igual.
2. **`SEED_PERIODOS_` escribe `Date` reales**, no strings. Mismo criterio para
   `CONFIG.periodo_desde` / `periodo_hasta` y para `CAMPANAS.desde` / `hasta` si están en el
   mismo estado (verificar: hoy se leen `2026-06-02`, sospechosas).
3. **`calcularDiffUpsert_()` normaliza antes de comparar.** Una función
   `normalizarParaComparar_(valor, tipoColumna)` que lleve `Date` y string-fecha a una misma
   representación canónica (ISO `yyyy-mm-dd`, sin hora, sin zona). Sin esto, el paso 2 del
   protocolo falla para siempre aunque el valor sea el mismo.
4. **Un guardarraíl explícito**: si una columna declarada `fecha` en cualquier hoja de
   registro contiene un valor que no es `Date`, el diff lo reporta como línea
   `tipo = tipo_degradado`, no como cambio de valor. Es un error distinto y merece nombre
   distinto.

**Criterio de aceptación (invariante, no comparación contra archivo):**
después de aplicar, `PERIODOS.desde instanceof Date === true` para todas las filas, y una
segunda corrida no reporta ninguna línea de `PERIODOS`.

---

## C.2-2 — El diff no dice qué auditó

**Evidencia.** `BASES` y `MAPEO` no aparecen con ninguna línea, y `BASES` tampoco figura en
"Hojas actualizadas". `SOLAPAS` sí tuvo cambios y **no** figura en esa lista. Además ni
`DIFF_CONFIGURACION` ni `ESTADO_CONFIGURACION` tienen fecha de corrida, así que no se puede
saber si lo que se está mirando es de esta corrida o de la anterior.

Hoy "BASES: cero líneas" y "BASES: no se audita" producen exactamente el mismo output.

**Tareas.**

1. **Cabecera de corrida** en las dos hojas, arriba de los encabezados de tabla:
   `ejecutado_por` (nombre de la función), `fecha_hora`, `version_codigo` si existe.
   Ambas hojas se limpian por completo antes de escribir, para que no queden filas de una
   corrida vieja mezcladas con la nueva.
2. **Bloque de alcance** al inicio de la tabla: una fila por cada hoja de registro
   (`CONFIG`, `BASES`, `INFORMES`, `MAPEO`, `PERIODOS`, `SOLAPAS`, `SECCIONES`, `CAMPANAS`,
   `REUNIONES`) con `auditada = sí/no`, `filas_en_hoja`, `filas_en_seed`, y — si `no` — el
   motivo (`sin sembrador`, `excluida a propósito`, `sembrador por otro camino`).
   `MARCADORES` va en esa lista con `auditada = no · sin sembrador`, que es un hallazgo abierto
   (Paso 2.13) y tiene que estar a la vista, no implícito.
3. **Separar los dos sentidos de "actualizada".** Hoy `REUNIONES`, `VALORES` y
   `VALORES_DIVERGENTES` figuran en la misma lista que hojas con cambios de contenido, cuando
   lo único que pasó es que `instalar()` las verificó estructuralmente. Dos rubros:
   `verificadas/reparadas por instalar()` y `con cambios de contenido`.
4. **Lista explícita de columnas excluidas del diff**, si existe alguna (timestamps,
   contadores, `filas_datos` / `firma_encabezado`). Va escrita en el prompt y reportada en la
   cabecera de la hoja. Una exclusión no documentada es una excepción oculta.

**Criterio de aceptación:** el bloque de alcance nombra las nueve hojas, y ninguna queda sin
`auditada` resuelto.

---

## C.2-3 — Las migraciones escriben por fuera del diff (S-01)

**Evidencia.** El resumen dijo:

```
SOLAPAS: looker resumen_metricas_dinamico=fuente / resumen_metricas=derivada (S-01)
```

y las mismas dos filas aparecen abajo como `protegida (origen=manual)`, sin columna ni
valores. En la planilla viva las dos están efectivamente en `fuente` / `derivada`.

Las dos cosas son ciertas a la vez porque **la migración puntual escribe por un camino que el
diff no audita**. Es el problema que el Paso 2.11 existe para eliminar, reaparecido dentro del
instrumento de medición.

**Tareas.**

1. Toda migración puntual que corra dentro de `menuAplicarConfiguracion_()` **pasa por
   `calcularDiffUpsert_()`** y emite líneas con `tipo = migracion`, con clave, columna,
   anterior y nuevo, igual que un cambio normal.
2. Una migración puede escribir sobre una fila `origen=manual` —para eso existe—, pero
   entonces la línea dice `tipo = migracion (pisa manual)`. Lo que no puede pasar es que la
   misma fila salga reportada como `protegida` y quede modificada.
3. `menuEstadoConfiguracion_()` incluye las migraciones pendientes en su cálculo, sin
   aplicarlas. Si no, "cero discrepancias" en sólo lectura no cubre lo que el apply sí va a
   escribir.

**Criterio de aceptación:** correr "Aplicar configuración" dos veces seguidas; la primera
reporta las líneas `migracion` que correspondan, la segunda no reporta ninguna, y ninguna fila
aparece simultáneamente como `protegida` y modificada.

---

## C.2-4 — Las protegidas no dicen qué se perdieron

Diez filas salieron `protegida (origen=manual)` con las columnas `anterior` y `nuevo` vacías.
Sabemos que se saltearon; no sabemos si estaban por cambiar.

Eso importa concreto: la Parte 2 del Paso 2.12 tiene que reclasificar `rdv/RDV CONJUNTO` y
`rdv/Comunas`, que son `origen=manual` y el sembrador no las toca. Sin saber qué les falta, esa
parte se hace a ciegas.

**Tarea.** La línea pasa a decir qué habría cambiado:

```
SOLAPAS  protegida  rdv||RDV CONJUNTO  uso  revisar  ignorar  (no aplicado: origen=manual)
```

Si la fila protegida no tenía nada por cambiar, la línea lo dice explícitamente
(`sin diferencias`) en vez de dejar las celdas vacías, que es ambiguo.

---

## C.2-5 — Huérfanos: lo que está en la hoja y no en el seed

Un diff de upsert por clave reporta cambiadas y agregadas, y **omite en silencio lo que existe
en la hoja y no en el seed** — que es justo donde viven las ediciones a mano.

**Tarea.** Tercer tipo de línea: `tipo = solo_en_hoja`, con clave y hoja. No se borra nada:
sólo se reporta. El resumen las cuenta aparte.

**Criterio de aceptación:** agregar a mano una fila con una clave inventada en `MAPEO` y otra
en `SOLAPAS`; las dos tienen que salir como `solo_en_hoja`, y **seguir estando en la hoja**
después de la corrida.

---

## C.2-6 — El resumen del `alert()`

Un solo total es lo que trajo el problema hasta acá. Desagregar:

```
cambiadas · agregadas · migraciones · solo_en_hoja · protegidas (con diferencia)
· protegidas (sin diferencia) · tipo_degradado · sin cambios
```

Sigue siendo un resumen corto: el detalle va a la hoja. No listar claves en el `alert()`
—eso ya rompió `diagnosticarColapso_()` por timeout.

---

## C.2-7 — Documentación (esto no es opcional)

**El prompt es la fuente de verdad del código.** Antes del commit:

1. Bajar a `docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`:
   - todo lo de esta Parte C.2;
   - **el fix de `sembrarClasificacionSolapas()`** que se hizo en la Parte C y nunca se
     documentó: dejó de pisar `filas_datos` / `firma_encabezado` con el valor vacío de
     `SEED_SOLAPAS_`, porque esas dos columnas son de `inventariarSolapas()`.
2. **Exportar `docs/_snapshots/` antes de la próxima corrida**: las nueve hojas de registro,
   con fecha en el nombre. "Aplicar configuración" reescribe todo de una vez; si el diff está
   mal, tiene que haber contra qué comparar, y ese contra-qué no puede salir del mismo código
   que se está probando.
3. Una línea en `BITACORA.md` por cada punto cerrado.

---

## Protocolo de prueba

Este orden, sin saltear:

**Paso 0 — volcado previo.** Snapshot de las nueve hojas a `docs/_snapshots/`.

**Paso 1 — tipo de dato.** Correr el diagnóstico de `typeof` sobre `PERIODOS` y `CONFIG`.
Anotar el resultado.

**Paso 2 — control positivo (esto es lo que le da sentido al resto).** Editar a mano, antes de
correr nada:

- `BASES.m2.hoja_default` → `Cuentas M2`
- una fila cualquiera de `MAPEO`
- una fila `origen=manual` de `SOLAPAS`
- agregar una fila con clave inventada en `MAPEO` y otra en `SOLAPAS`

Correr **"Estado de configuración"** (sólo lectura, no toca nada). Tiene que nombrar las tres
ediciones con clave, columna y de-qué-a-qué, y las dos filas inventadas como `solo_en_hoja`.
Recién ahí "cero discrepancias" significa algo.

> El caso de `BASES.m2.hoja_default` es la reversión silenciosa que ya conocemos —`BASES` no
> tiene columna `origen`, así que la edición a mano la revierte el próximo
> `seedConfiguracion()`—. Con el diff andando tiene que aparecer reportada como
> `m2.hoja_default: Cuentas M2 → (vacío)`. El problema no se resuelve acá, pero deja de ser
> invisible.

**Paso 3 — aplicar.** Correr "Aplicar configuración". Revisar la cabecera de corrida, el bloque
de alcance y el detalle.

**Paso 4 — idempotencia.** Correr "Aplicar configuración" una segunda vez: cero líneas de
cambio, cero migraciones. Las `solo_en_hoja` que se agregaron a mano **siguen apareciendo y
siguen en la hoja**.

**Paso 5 — sólo lectura.** "Estado de configuración": cero discrepancias.

**Paso 6 — no rompimos el inventario.** Correr "Inventariar solapas" y confirmar que
`filas_datos` / `firma_encabezado` siguen con números reales.

**Paso 7 — invariante de conteo.** `filas_datos ≤ filas_crudas` en las 84 filas de `SOLAPAS`.

---

## Hallazgos verificados en la planilla — para archivar, NO para ejecutar acá

Estos salieron de mirar la planilla viva del 31/07. Van a `PENDIENTES_consistencia.md` con su
paso asignado. **No se tocan en esta parte** — se anotan para que no se pierdan.

**H-1 · Hay dos tablas `SOLAPAS` en la misma planilla.** Una viva y otra con los conteos
anteriores al Paso 2.10 Parte B (`rdv/RVD JM-CM - ES` en 1362 en vez de 721, `filas_crudas` y
`firma_encabezado` vacías). Peor: en esa segunda tabla el `origen` de `rdv/PPTS`,
`rdv/RDV CONJUNTO`, `rdv/Agenda`, `rdv/Comunas`, `rdv/Seguimiento`, `rdv/Respuestas JM 📩`,
`looker/resumen_metricas_dinamico` y `looker/resumen_metricas` dice `seed`, mientras que en la
viva dice `manual`. **Son justo las filas que el diff protegió.** Hay que identificar de qué
hoja se trata, de dónde salió el `manual`, y eliminarla. Es la misma configuración en dos
lugares, de nuevo. → **prioridad alta, antes del Paso 2.12 Parte 2.**

**H-2 · `BASES.fila_encabezado` quedó vestigial.** La Parte B movió `fila_encabezado` a
`SOLAPAS` por solapa, pero la columna sigue en `BASES` con valores que ya contradicen:
`BASES.m2 = 3`, mientras `SOLAPAS.m2/Cuentas M2 = 1` y `SOLAPAS.m2/M2 periodo DIRECTA = 3`.
`Union.gs:36` y `:261` leen `base.fila_encabezado` directo sin pasar por
`resolverFilaEncabezado_()` → para `m2/Cuentas M2` leerían la fila 3 como encabezado.
→ **Paso 2.11 Parte D**, junto con los nombres de solapa hardcodeados de `Fechas.gs:66` y
`Auditoria.gs:348`.

**H-3 · `rango_plausible` no detecta un año 20206.** En el diagnóstico de fechas,
`digital/Directa Mail` columna F tiene `fecha_max = 20206-06-25` y aun así
`rango_plausible = sí`. El guardarraíl está devolviendo un valor plausible sobre un dato
imposible. → **Paso 2.10 Parte D**, junto con R-10.

**H-4 · `MAPEO` mapea una solapa que va a quedar en `ignorar`.** Hay cinco filas de `MAPEO`
sobre `m2/Cuentas` (`id_cuenta`, `campana`, `estado`, `eje`, `area`), y la clasificación
decidida manda `m2/Cuentas` a `ignorar` por ser copia de `digital/Cuentas`. La Parte 2 del
2.12 las deja huérfanas. Decidir si se repuntan a `digital/Cuentas` o se retiran.
→ **Paso 2.12 Parte 2.**

**H-5 · `tipo_esperado` no llega a la tabla de prueba de lectura.** La columna existe en
`MAPEO` y está poblada, pero sale vacía en todas las filas del volcado de "Probar lectura", así
que la comparación tipo esperado / tipo real no se está haciendo. → **Paso 2.10 Parte D.**

**H-6 · `MARCADORES` tiene tres filas** (`ecv_inscriptos`, `camp_alcance`, `m2_envios`) contra
las 43 trazas del CSV, y no tiene sembrador. Confirmado en vivo. → **Paso 2.13 Parte 1**, cuya
primera tarea sigue siendo exportar la hoja a `docs/_snapshots/` antes de tocarla.

**H-7 · `REUNIONES` no tiene columna `id_cuenta`.** La decisión de anclaje se tiene que
persistir ahí o la próxima corrida vuelve a preguntar y puede contestar distinto.
→ **Paso 2.10 Parte G.**

**H-8 · El período global de `CONFIG` (26/06–03/07) no cubre las reuniones cargadas**
(23–28/07). Para el corte vertical a Orden Público 28/07 hay que resolver si manda el período
global o la fecha de la reunión. Ya está decidido en criterio —el ancla es la fecha de la
reunión— pero la config todavía no lo refleja. → **Paso 2.10 Parte E.**

---

---

> ⚠ **Addendum 3 (01/08/2026) — C.2-2 a C.2-6 implementadas, sin probar en planilla.**
> Lote nocturno encadenado, un commit por parte: `63095d9` (C.2-2), `3401861` (C.2-3),
> `f0d12ea` (C.2-5), `d561b6d` (C.2-4), `45fe14e` (C.2-6). Orden de ejecución 2-3-5-4-6,
> no el del documento: `solo_en_hoja` antes que las protegidas, porque las protegidas se
> apoyan en la misma estructura. **Ninguna corrió contra la planilla** — eso es de mañana.
>
> **Lo que cambió respecto de lo escrito arriba:**
> - **C.2-2** — el bloque de alcance nombra **diez** hojas, no nueve: las nueve del
>   documento más `MARCADORES`, que el propio punto 2 pide incluir. El criterio de
>   aceptación decía "nueve"; son diez.
> - **C.2-3** — cada migración acepta `aplicar = false` y calcula sin escribir. Fue la
>   única forma de que `menuEstadoConfiguracion_()` incluyera las migraciones pendientes
>   sin aplicarlas, que es lo que el punto 3 pide.
> - **C.2-4** — la protegida sin diferencias **también** emite línea, diciéndolo
>   explícito. Dejarla afuera habría reproducido la ambigüedad original al revés
>   (ausencia = "no tenía nada" o "no se calculó").
> - **C.2-6** — se agregó una categoría que el documento no pedía: `otras líneas (sin
>   categoría)`, para que un tipo que no entre en la lista no desaparezca del total.
>
> **Cada parte tiene un control positivo en `Pruebas.gs` (archivo nuevo)**, porque el
> protocolo de siete pasos **pasa igual aunque estas cinco estén mal**: cero cambios sigue
> siendo cero cambios. Los controles alimentan las funciones con hojas sintéticas
> (`hojaFalsa_`) y afirman que la discrepancia conocida se detecta; no tocan la planilla,
> así que no hay nada que revertir. Además se verificó por **mutación** que discriminan:
> se rompió cada función a propósito (incluido reintroducir el bug original de cada parte)
> y los controles cazaron **18 de 18** roturas. Menú: Diagnóstico → "Correr pruebas del
> diff".
>
> **Lo que este addendum NO cubre:** C.2-7 (documentación + `docs/_snapshots/`) sigue sin
> hacer — los snapshots nunca se versionaron, ver `docs/HANDOFF_CODE.md`.

## Qué NO hacer en esta parte

- No tocar la clasificación de las 17 filas en `revisar` de `SOLAPAS` — eso es Paso 2.12 Parte 2.
- No tocar `SEED_MARCADORES_` — eso es Paso 2.13.
- No apuntar `BASES.m2.hoja_default` a `Cuentas M2`. Hoy devolvería 890.431 contra los 995.194
  de la lámina, sin fallar. `m2` sigue `sin_fuente` y el ⚠ se deja hasta que se resuelvan las
  6 cuentas que están en `M2 Directa` y no en `Cuentas M2`.
- No commitear hasta que los siete pasos del protocolo pasen.
