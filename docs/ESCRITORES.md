# ESCRITORES — quién escribe cada hoja de registro

> **Documento vivo.** Es contrato, no foto: responde "¿quién escribe esta hoja, por qué
> camino, y quién es su dueño declarado?". Junto con los `SEED_*` de `Instalar.gs` es el
> dueño de la fila "¿qué *debería* decir esa configuración?" de `CLAUDE.md` §7 — la fila
> que hasta hoy "no tenía a quién señalar" cuando una celda tiene más de un sembrador.
>
> **La matriz de abajo se regenera con `node tools/escritores.js`** (censo mecánico:
> toda mutación de valor o estructura — `setValue(s)`, `setFormula(s)`, `appendRow`,
> `insertRow*`, `deleteRow*`, `clearContent(s)`, `clear` — con atribución de hoja por
> resolución de receptor, incluida la propagación por parámetros con cadena `vía`).
> Al editar código que escribe hojas de registro: re-correr el censo, actualizar la
> matriz, y si aparece un escritor nuevo, decidir acá si es legítimo.
>
> Último censo: **10/08/2026**, re-corrido al agregar `escribirColumnaLaminas_` y `LAMINAS`.
> El de **03/08/2026** se había corrido al retirar `repuntarPlantillaCanonicaJM_`.
>
> ⚠ **`LAMINAS` no aparecía porque `tools/escritores.js` tenía diez hojas hardcodeadas y ella no estaba.**
> Son **tres listas que deben coincidir por convención y no por mecanismo** —`HOJAS_REGISTRO` acá,
> `HOJAS` en `tools/snapshot.js`, y `ALCANCE_REGISTROS_` en `Instalar.gs`—, y cuando la hoja nació con el
> `_11` sólo la tercera la incluyó. **La divergencia no falló sola**: el censo mandaba `LAMINAS` al anexo
> de «no es de registro» sin avisar. Las tres quedaron en once el 10/08.
> El censo anterior era del **01/08/2026** (AUD-3 Parte E) y su control positivo sigue
> valiendo: debía encontrar solo los dos escritores conocidos de `MAPEO` y encontró esos
> dos **y un tercero que nadie le sopló**, `consolidarMapeoLooker_`. Ese tercero se
> **retiró del menú** el 01/08 (Paso 2.11 Parte E): hoy `MAPEO` vuelve a tener dos
> escritores de contenido vivos. Ver §2.1.
>
> **Dos movimientos en el censo del 03/08**, ninguno de ellos un escritor nuevo:
> `repuntarPlantillaCanonicaJM_` **desaparece de `INFORMES`** (se retiró del código —
> ver la fila de esa hoja), y `reclasificarSolapasM2Invertidas_` **sale de `SOLAPAS` y
> cae en "Sin resolver"**, con el motivo *"parámetro hoja sin llamadores"*: es la migración
> que el `Paso-2.12` Parte 3 sacó de `aplicarInstalacion_`, así que el censo ya no puede
> atribuirle una hoja porque nadie la llama. **No escribe nada hoy**; figura en la lista
> de no atribuidos, no en la matriz. Eso ya era cierto antes del 03/08 — se ve recién
> ahora porque el censo se re-corrió.

---

## 1 · Lectura de contrato, hoja por hoja

**El principio (Paso 2.11):** cada hoja tiene un dueño declarado de su contenido. Todo
escritor que no sea el dueño tiene que estar acá, con su porqué — un escritor no
declarado es exactamente cómo "una parte borra a la otra".

Además de lo listado, **`aplicarInstalacion_` escribe los encabezados de todas las
hojas de `HOJAS_CONFIG_`** (`Instalar.gs:214/232`, más `asegurarColumna_:620`): es el
escritor *estructural* universal — crea hojas y repone columnas, nunca filas de datos
(Paso 2.11 Parte A). El censo lo reporta "sin resolver" porque itera
`getSheetByName(nombre)` sobre las claves de `HOJAS_CONFIG_` — dinámico legítimo, no un
agujero del patrón.

| hoja | dueño declarado del contenido | escritores censados | veredicto |
|---|---|---|---|
| `BASES` | `SEED_BASES_` vía upsert | upsert (`aplicarSeedConfiguracion_`) · migración `alinearBasesHojaDefaultLooker_` · ~~`consolidarMapeoLooker_`~~ (retirada) | ✅ dos caminos, los dos declarados |
| `MAPEO` | `SEED_MAPEO_` vía upsert | upsert · `promoverFechasElegidas` + `migrarPrefijosFechaPeriodo_` (`Fechas.gs`) · migraciones `eliminarMapeoAlcanceDigitalObsoleto_`, `alinearMapeoLookerADinamico_`, `backfillSolapaMapeo_` · ~~`consolidarMapeoLooker_`~~ (retirada) | ⚠ **dos escritores de contenido vivos**: el upsert y `promoverFechasElegidas`. El segundo sigue sin declarar — ver §2.1 |
| `CONFIG` | `SEED_CONFIG_DEFAULTS_` vía `seedConfigConfig_` (solo completa vacíos) | `seedConfigConfig_` únicamente | ✅ un camino; el humano edita valores y el seed no los pisa |
| `INFORMES` | `SEED_INFORMES_` vía upsert, **`plantilla_id` incluido** (cambió el 03/08/2026 — ver abajo) | upsert · `clasificarArchivoPlantilla_` (registro de plantillas, escribe `plantilla_id`) · ~~`repuntarPlantillaCanonicaJM_`~~ (retirada del código el 03/08/2026) | ✅ dos caminos, los dos declarados, con el seed como dueño de la columna |
| `PERIODOS` | `SEED_PERIODOS_` vía upsert **+ `crearPeriodos_` (26/08/2026)** | upsert **e insert-only**, por dos caminos declarados | ⚠ **dos escritores, y es deliberado.** El seed **actualiza**; `crearPeriodos_` **sólo inserta y nunca pisa**. Ver §PERIODOS abajo — un `periodo_id` es una clave referenciada en 119 líneas y moverle las fechas cambia el universo de todo lo que lo cita |
| `SOLAPAS` | `SEED_SOLAPAS_` vía `aplicarClasificacionSolapas_` (clasificación) + `inventariarSolapas` (medición) | upsert de clasificación · `inventariarSolapas` (`Solapas.gs:119-147`: `filas_datos`, `filas_crudas`, `firma_encabezado`) · migraciones `alinearSolapasLookerADinamico_`, `reclasificarSolapasM2Invertidas_` · ~~`consolidarMapeoLooker_`~~ (retirada) | ✅ tres caminos, los tres declarados. El reparto seed/inventario viene de C.2-7; la migración de looker dejó de escribir `notas` en la Parte E |
| `SECCIONES` | `SEED_SECCIONES_` vía `sembrarSecciones_` | `sembrarSecciones_` únicamente | ✅ |
| `CAMPANAS` | curada a mano (sin sembrador, a propósito) | **cero escritores en el código** | ✅ consistente con `ALCANCE_REGISTROS_` |
| `REUNIONES` | curada a mano + `cargarTemarioReuniones_`, por **tres entradas** desde el 20/08: el ítem de menú "Cargar temario", la llamada por API `cargarTemario(texto, periodoId)` (Paso 2.14) y **el botón del panel** (`panel_cargarTemario`, `2026-08-19_2`) — las tres pasan por el mismo cargador, que **desde el 20/08 saltea lo que ya existe** en vez de hacer append ciego | `cargarTemarioReuniones_` únicamente (las dos entradas pasan por ahí) | ✅ un solo escritor, dos puertas. Desde el Paso 2.15 Parte B **el período es obligatorio en las dos**: `cargarTemario` valida contra `PERIODOS` y falla explícito antes de escribir (`D-19`) |
| `MARCADORES` | **la plantilla** (`D-17`), vía el `Paso-2.5`, que todavía no corrió | migración `migrarCalculoAOperacion_` · **`curarMarcadores_`** (`Instalar.gs`, 03/08/2026) · **`curarCamposMarcadores_`** (`Instalar.gs`, 07/08/2026) | ⚠ **sigue sin sembrador, y es a propósito.** **`curarCamposMarcadores_` es el tercer escritor y entró el 07/08**: es a `MARCADORES` lo que `curarSecciones_` es a `SECCIONES` — corrige **un campo** de una fila que ya existe, no crea ni borra. Nace porque `curarMarcadores_` sólo sabe filas enteras, y cambiar el `formato` de nueve filas con esa herramienta las borra y las reescribe al final de la hoja. Su primer uso: `migrarFormatoPorcentajeSinSigno_` (`A.7`/`B.1`). `curarMarcadores_` **no lo es**: es la puerta para curar filas puntuales —retirar las tres de ejemplo, cargar y retirar las `prueba_*` del corte vertical—, que hasta hoy se hacían a mano en la planilla. El sembrador real lo trae el `Paso-2.5` (`sembrarMarcadoresDesdePlantillas` + `upsertSoloVacias_`) y **no compite con éste**: aquél completa vacías desde los `{{token}}` de los Slides, éste agrega y quita filas enteras por decisión de una persona. H-6 sigue confirmado |
| `LAMINAS` | **la plantilla** — el ancla `#lamina: L-NNN` de las notas del orador es el hecho; la hoja es registro reparable (`11.1` §4). Nació con el `_11` el 09/08 | `sellarPlantilla` (agrega filas enteras, por posición) · `borrarFilasDeLaminas` (excepción de un error, no un mecanismo) · **`escribirColumnaLaminas_`** (10/08, celdas puntuales por nombre de columna) | ✅ tres caminos, los tres declarados. **`escribirColumnaLaminas_` es el único que escribe celdas que no son filas nuevas** — un segundo sería bug de arquitectura aunque escribiera bien. ⚠ Hay un cuarto escritor **estructural**: `aplicarInstalacion_` reescribe la fila 1 de encabezados, porque `LAMINAS` no está en `COLUMNAS_DELTA_`. No es de contenido y §1 ya lo declara para todas |

## 1 bis · Si corrijo un valor en el `SEED_*`, ¿llega a la hoja? — medido el 16/08/2026

**Es otra pregunta que la tabla de arriba, y por eso está aparte.** Aquélla dice **quién** puede
escribir; ésta dice **qué pasa cuando el valor ya existe en la hoja y el seed cambia de opinión**.
Se preguntó **dos veces en una semana** y se va a volver a preguntar en cada tanda de la
migración.

**La respuesta no es la misma para todas las hojas, y esa es toda la razón por la que esta tabla
existe.**

| hoja | mecanismo | ¿una corrección del seed llega? |
|---|---|---|
| `BASES` | `upsertPorClave_` | ✅ **sí** |
| `MAPEO` | `upsertPorClave_` | ✅ **sí** |
| `INFORMES` | `upsertPorClave_` | ✅ **sí** |
| `PERIODOS` | `upsertPorClave_` | ✅ **sí** |
| `SOLAPAS` | `aplicarClasificacionSolapas_` | ⚠ **parcial.** Siembra cinco columnas —`uso`, `fila_encabezado`, `ventana_ref`, `campo_id_cuenta`, `notas`— y de ésas **`uso` está protegido por `D-32`**: el sembrador nunca degrada un `uso` que la hoja ya tiene. Las otras cuatro llegan. Las columnas de medición (`filas_datos`, `filas_crudas`, `firma_encabezado`) son de `inventariarSolapas` y el seed no las toca |
| **`CONFIG`** | `seedConfigConfig_` | ❌ **NO — sólo escribe si la celda está vacía.** **Es deliberado y está explicado**: el default es **piso, no autoridad**, y el humano edita valores que el seed no debe pisar |
| **`SECCIONES`** | `sembrarSecciones_` | ❌ **NO — sólo inserta filas nuevas, nunca actualiza. Por decisión** (usuario, 16/08/2026): **igual que `CONFIG`, la hoja manda y el seed sólo siembra lo ausente.** No hubo código que tocar — ya se comportaba así; lo que faltaba era la decisión declarada, que está al lado de la función en `Instalar.gs` |
| **`MARCADORES`** | **sin sembrador** | — **No compite con ningún seed.** La migración escribe por `curarCamposMarcadores_`, que desde el 15/08 es **todo o nada**. Es la línea que más tranquiliza antes de la tanda 1 |
| `CAMPANAS` | sin sembrador, a propósito | — curada a mano, cambia cada semana |
| `REUNIONES` | sin sembrador, a propósito | — ídem, más `cargarTemarioReuniones_` |
| `LAMINAS` | sin seed posible | — su contenido se **deriva de las plantillas**: no hay valor declarado contra el cual diffear |

⚠ **`campo_id_cuenta` NO tiene la protección de `D-32`, aunque comparta fila con `uso`.** La
protección de `D-32` es específica de esa columna —`usoAEscribir_` conserva el `uso` de la hoja
incluso con `origen = 'seed'`—; `campo_id_cuenta` no tiene ese mecanismo: `aplicarClasificacionSolapas_`
la siembra siempre con `obj.campo_id_cuenta || ''`, y `upsertPorClave_` reescribe la fila entera
con `(h in obj) ? obj[h] : ''`. Sólo se salva con `origen = 'manual'` en la fila entera —protección
de fila, no de columna—; en cualquier fila `origen = 'seed'` (como `looker/resumen_metricas_dinamico`,
`_44`/`D-30`, 19/08), una edición a mano de `campo_id_cuenta` no sobrevive al próximo "Aplicar
configuración". **Es `D-31` con `encabezado`, textual**: una columna que el seed conoce y no
declara se blanquea sola.

**Las dos hojas que no propagan lo hacen POR DECISIÓN, y las dos dicen lo mismo:** el valor del
seed es **piso, no autoridad**. Lo que una persona editó en la hoja gana, porque ahí vive una
decisión que el código no conoce. Es la misma idea que `D-32` para `SOLAPAS.uso`.

**El síntoma, escrito porque no se parece a un error:** un valor corregido en el seed produce
**una corrida que dice "sin cambios" y una hoja que no se mueve**, y **las dos cosas son ciertas
por separado**. Es una operación que **no falla y no hace** — lo mismo que `D-32` vino a evitar
del otro lado. **La salida es editar la celda a mano, sabiendo que se está haciendo eso.**

⚠ **Y antes de mirar esta tabla, mirar la de más atrás: un cambio de seed no existe hasta que se
empuja.** `CLAUDE.md` §4. Que la hoja no cambie tiene **dos** causas posibles antes que ésta —la
corrida equivocada (`instalar()` no siembra) y el código sin pushear—, y las dos se ven igual.

## 2 · Los conflictos que la matriz deja a la vista

### 2.1 · `MAPEO`: el tercer escritor se retiró; quedan dos, y uno sigue sin declarar

**El censo encontró un tercer escritor que nadie le sopló** — `consolidarMapeoLooker_`
(`Solapas.gs`), que repuntaba filas de `MAPEO` entre `resumen_metricas` y
`resumen_metricas_dinamico` y de paso escribía `BASES.hoja_default` y seis celdas de
`SOLAPAS`, todo desde un ítem de menú de "Datos y decisiones". El P1 de `C.2-7`
contaba dos y eran tres.

**Resuelto el 01/08/2026 (Paso 2.11 Parte E).** La consolidación ya estaba aplicada —
27/27 filas de `MAPEO` en `_dinamico`, `SOLAPAS` y `BASES` alineadas— y la sostienen en
cada corrida tres migraciones idempotentes de `Instalar.gs`. La función quedaba como
duplicado, y su único camino de invocación **producía la dirección invertida**: el
diagnóstico que la alimentaba devuelve `fuente: resumen_metricas`, al revés de S-01. Se
retiró del menú junto con ese diagnóstico. **Ninguna de las dos se borró** — ver sus
encabezados y el P1 en `docs/PENDIENTES_consistencia.md`.

**Contrato vigente de `MAPEO`:** *el upsert de los `SEED_*` siembra, y
`promoverFechasElegidas()` (`Fechas.gs`) escribe las filas `fecha_periodo` elegidas en
`DIAG_FECHAS`. Nadie más.* Las migraciones de `Instalar.gs` corrigen estado viejo y
tienen vencimiento; no son escritores de contenido.

⚠ **El segundo sigue sin declarar formalmente.** Que `promoverFechasElegidas()` escriba
`MAPEO` es correcto, pero ningún `SEED_MAPEO_` conoce las siete filas que escribe — es
el P1 abierto de `C.2-7`, y **no es de este paso**.

#### Addendum 26/08/2026 — esas siete filas ya no salen con el testigo vacío, y una sigue sin dueño

El `P1` de arriba **sigue abierto** —el seed sigue sin conocerlas— pero su consecuencia visible se
cerró. Medido ese día: `MAPEO` tenía **30 de 197 celdas `encabezado` vacías**, y **7 eran
exactamente estas filas**. La causa no era el `P1`: **el objeto que `promoverFechasElegidas()`
upsertea no llevaba `encabezado`**, y `upsertPorClave_` reescribe la fila entera con
`(h in obj) ? obj[h] : ''`, así que la celda salía vacía **en cada corrida**.

⭐ **El dato estaba en la mano y se tiraba:** `DIAG_FECHAS` ya mide el rótulo de la columna elegida
—`f.encabezado`, que ese mismo cuerpo usa dos veces para redactar sus errores—. Desde el 26/08 la
fila lo lleva, normalizado con `normalizarValorDeclarado_` (`R-10`). **No hubo nada que medir ni
que inventar.**

⛔ **Y las siete claves que `ENCABEZADO_POR_MAPEO_` tenía para estas filas se BORRARON.** Ese mapa
se aplica **sólo** en el `forEach` sobre `SEED_MAPEO_`, así que una clave cuya fila no está en el
seed **no se aplica nunca**: hacía que el mapa pareciera completo *(«testigo para las 161»)*
mientras las celdas estaban vacías. Dejarlas con el escritor ya arreglado habría creado **dos
fuentes para el mismo testigo**, que es lo que había borrado las otras 23 el mismo día. Lo controla
`tools/probar-testigos-mapeo.js`, que se pone rojo ante una clave huérfana.

⚠ **La séptima no tiene escritor de ninguna clase, y queda sin testigo a propósito:**
`rdv|RVD JM-CM - ES|fecha` es la fila que `DOC-2` Parte C derogó — salió del `SEED_MAPEO_` y
**sigue en la hoja** —, y `Auditoria.gs` todavía la lee por `buscarMapeo('rdv', hoja, 'fecha')`.
**Su celda vacía ahora dice la verdad** —nadie declara su testigo— en vez de esconderse detrás de un
literal que no se aplicaba. Es el único caso conocido de una fila de `MAPEO` **con lector y sin
escritor**, y por eso se anota acá y no en `PENDIENTES`: es una pregunta de escritores.

⚠ **Y el corolario operativo, que es lo que hay que saber antes de esperar el cambio:** las seis
celdas **NO se llenan con «Aplicar configuración»** —ese camino siembra los `SEED_*` y estas filas
no están en ninguno—. Se llenan la próxima vez que corra `promoverFechasElegidas()`. Es el mismo
error que costó el 15/08: *era la corrida equivocada*.

### 2.2 · Las diez protegidas de `SOLAPAS` — el conflicto seed ↔ manual, medido

La corrida del 01/08 emitió diez líneas `protegida (habría cambiado)` y `SOLAPAS` tiene
exactamente diez filas `origen = manual`: **el seed propone pisar las diez decisiones
manuales, todas, en cada corrida.** Desglose (evidencia:
`docs/_snapshots/SOLAPAS_2026-08-01.tsv` + `DIFF_CONFIGURACION`):

- **Ocho son `uso`** — el seed quiere `revisar` sobre solapas que un humano ya cerró
  (`PPTS`, `RDV CONJUNTO`, `Agenda`, `Comunas`, `Seguimiento`, `RDV_JM_CM_ES`,
  `Funcionarios / Ministros`, `Respuestas JM 📩`). Acá el humano tiene razón y el
  `SEED_SOLAPAS_` está desactualizado: sigue diciendo `revisar` sobre decisiones
  tomadas.
- **Dos eran `notas` de looker** — la "manual" decía `ver docs/SUPUESTOS.md S-01` (un
  puntero) y la del seed trae el dato concreto (QUERY() viva sobre Cuentas; 899 de 903
  sin fecha). Ahí la protección conservaba la versión **peor**.

**Las dos de looker se cerraron el 01/08 (Paso 2.11 Parte E), y no eran decisiones
humanas.** Su `origen=manual` lo escribía `alinearSolapasLookerADinamico_`, de cuando el
seed todavía mandaba esas filas a `revisar`. Hoy el seed ya dice `fuente`/`derivada`, o
sea lo mismo que la migración: la protección no protegía nada y su único efecto vivo era
congelar la nota corta, porque `aplicarClasificacionSolapas_` saltea toda fila
`origen=manual` sin escribirla. La migración pasó a escribir `origen: 'seed'` y dejó de
escribir `notas`; con eso el seed adopta las dos filas y el piso baja de **10 a 8**.

Un piso que aparece siempre convierte la alarma en ruido: la línea de más, la que
importe, entra en una lista que todos aprendieron a saltear. **Las ocho que quedan sí son
decisiones humanas** —el seed dice `revisar` y la planilla dice `ignorar`/`referencia`,
así que ahí la protección hace trabajo real— y se resuelven en el **Paso 2.12 Parte 2**.

### 2.3 · Sitios que el censo no atribuye, y por qué está bien

Siete, todos explicados: los tres de `aplicarInstalacion_`/`asegurarColumna_` son el
escritor estructural (§1, dinámico sobre `HOJAS_CONFIG_`), y los cuatro de
`alinearSolapasLookerADinamico_` vía `probarMigracionesEnDiff_` escriben sobre la hoja
**sintética** de `Pruebas.gs` (`hojaFalsa_`), que no es una hoja real. Un censo futuro
con otros números acá es señal de patrón roto, no de ruido.

**Al 03/08/2026 son nueve, no siete**, y los dos que se sumaron no son escritores nuevos:
las **dos** apariciones de `reclasificarSolapasM2Invertidas_` (*"parámetro `hoja` sin
llamadores"*), que el `Paso-2.12` Parte 3 desconectó de `aplicarInstalacion_`. Un sitio que
el censo no atribuye **porque nadie lo llama** es distinto de uno que no atribuye porque el
receptor es dinámico: el primero no escribe nada. Vale la misma regla — un número distinto
acá es señal, no ruido — pero la señal de esta vez ya estaba explicada.

### 2.4 · `INFORMES.plantilla_id` cambió de dueño (03/08/2026)

Hasta el 03/08 este documento declaraba: *"el seed no siembra `plantilla_id` — esa columna
es del registro de plantillas"*. **Ese reparto se dio vuelta**, y no por preferencia: se
midió que no funcionaba. Las dos mitades:

1. **El seed la borraba.** `upsertPorClave_` reescribe la **fila entera** cuando alguna
   columna declarada cambia, y en las columnas que el objeto del seed no declara escribe
   `''` (`Instalar.gs`, `headers.map(... (h in obj) ? obj[h] : '')`). Con
   `SEED_INFORMES_.plantilla_id = ''`, cada "Aplicar configuración" borraba el ID que el
   registro de plantillas hubiera cargado. Es por eso que la hoja viva llegó al 03/08 con
   las dos celdas vacías **aunque `repuntarPlantillaCanonicaJM_` había corrido el 30/07** —
   su otra mitad, el renombre de la plantilla obsoleta en Drive, sigue ahí.
2. **El registro de plantillas no ve la plantilla de JM.** Verificado el 03/08 por los dos
   lados: `diagnosticarCarpetaPlantillas_()` sobre la carpeta devuelve **una** presentación
   (`SECCO_marcada`), y la Drive API `files.list` tampoco la lista, ni por padre ni por
   nombre — mientras que `files.get` y `SlidesApp.openById()` la abren sin problema y los
   permisos de las dos son equivalentes. Un registro que no puede ver la mitad de las
   plantillas no puede ser el dueño de la columna.

Hoy el ID vive en `SEED_INFORMES_`, como `SEED_BASES_.sheet_id` y `SEED_CONFIG_DEFAULTS_`.
`clasificarArchivoPlantilla_` sigue siendo un escritor legítimo de la columna: si el
registro encuentra una plantilla, la escribe, y el seed la va a confirmar o a corregir en
el siguiente "Aplicar".

**El punto 1 es un hallazgo abierto y más grande que esta columna** —toca a las cinco hojas
que pasan por `upsertPorClave_`— y está anotado en `docs/PENDIENTES_consistencia.md`. Acá
sólo se registra que fue el motivo del cambio de dueño.

---
# Matriz — `node tools/escritores.js` (03/08/2026)

## Matriz — hojas de registro (las diez, aunque tengan cero escritores)

### BASES

| función | método | sitio | camino |
|---|---|---|---|
| `alinearBasesHojaDefaultLooker_` | `setValue` | Instalar.gs:543 | vía aplicarInstalacion_ (Instalar.gs:292) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1563 | vía aplicarSeedConfiguracion_ (Instalar.gs:1378) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1572 | vía aplicarSeedConfiguracion_ (Instalar.gs:1378) |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:519 | directo |

### MAPEO

| función | método | sitio | camino |
|---|---|---|---|
| `migrarPrefijosFechaPeriodo_` | `setValue` | Fechas.gs:412 | vía promoverFechasElegidas (Fechas.gs:333) |
| `eliminarMapeoAlcanceDigitalObsoleto_` | `deleteRow` | Instalar.gs:424 | vía aplicarInstalacion_ (Instalar.gs:275) |
| `alinearMapeoLookerADinamico_` | `setValue` | Instalar.gs:463 | vía aplicarInstalacion_ (Instalar.gs:276) |
| `alinearMapeoLookerADinamico_` | `setValue` | Instalar.gs:464 | vía aplicarInstalacion_ (Instalar.gs:276) |
| `backfillSolapaMapeo_` | `setValue` | Instalar.gs:683 | vía aplicarInstalacion_ (Instalar.gs:274) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1563 | vía promoverFechasElegidas (Fechas.gs:385) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1563 | vía aplicarSeedConfiguracion_ (Instalar.gs:1381) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1572 | vía promoverFechasElegidas (Fechas.gs:385) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1572 | vía aplicarSeedConfiguracion_ (Instalar.gs:1381) |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:489 | directo |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:490 | directo |

### CONFIG

| función | método | sitio | camino |
|---|---|---|---|
| `seedConfigConfig_` | `appendRow` | Instalar.gs:1839 | vía aplicarSeedConfiguracion_ (Instalar.gs:1384) |
| `seedConfigConfig_` | `setValue` | Instalar.gs:1847 | vía aplicarSeedConfiguracion_ (Instalar.gs:1384) |

### INFORMES

| función | método | sitio | camino |
|---|---|---|---|
| `upsertPorClave_` | `setValues` | Instalar.gs:1563 | vía aplicarSeedConfiguracion_ (Instalar.gs:1390) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1572 | vía aplicarSeedConfiguracion_ (Instalar.gs:1390) |
| `clasificarArchivoPlantilla_` | `setValue` | Instalar.gs:1707 | vía recorrerCarpetaPlantillas_ (Instalar.gs:1662) → registrarPlantillasDesdeCarpeta (Instalar.gs:1652) |

### PERIODOS

| función | método | sitio | camino |
|---|---|---|---|
| `upsertPorClave_` | `setValues` | Instalar.gs:1563 | vía aplicarSeedConfiguracion_ (Instalar.gs:1393) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1572 | vía aplicarSeedConfiguracion_ (Instalar.gs:1393) |

**⚠ «Único escritor declarado» es cierto como declaración y falso como restricción** (20/08/2026,
`2026-08-20_2` Parte B). El comentario de `SEED_PERIODOS_` dice *"el seed es el único escritor
declarado de `PERIODOS`"*, y esta tabla lo repetía. Las dos cosas son ciertas **sobre el código** y
se leían como *"para dar de alta un período hay que editar `Instalar.gs` y pushear"*, **que no es
cierto**.

**El mecanismo que lo garantiza, verificado en el código:** `calcularDiffUpsert_` junta en
`soloEnHoja` las claves que están en la hoja y no en el seed, y `upsertPorClave_` las devuelve con
el comentario puesto — `soloEnHoja: diff.soloEnHoja // C.2-5: se reporta, nunca se borra`. El upsert
**agrega** las filas nuevas del seed y **actualiza** las que comparten clave; una fila escrita a mano
con una clave que el seed no conoce **no se toca**.

**Lo accionable:** dar de alta la semana en `PERIODOS` es **escribir una fila en la hoja**, no un
`clasp push`. Sobrevive a *Aplicar configuración*.

⚠ **Lo que sí hay que saber, y es la contracara:** una fila a mano **no vuelve** si alguien recrea la
hoja, porque no está en ningún seed. Y sigue sin haber un escritor **programático** declarado — el
día que el panel cree períodos, eso es un escritor nuevo y necesita su fila acá. **No se retira la
declaración del seed**: sigue siendo el escritor declarado; lo que se agrega es qué pasa con lo que
él no declara.

### ⭐ El escritor nuevo — `crearPeriodos_` (26/08/2026, `2026-08-26_2` Parte F)

**Esta ficha se escribió A MANO, y hay que decir por qué:** `tools/escritores.js` **está en rojo** —
muere con *«Llaves desbalanceadas tras limpiar `Generador.gs` (-2)»*, en su dependencia
`inventario.js`—. **Verificado que es preexistente y no de esta corrida**: da `exit=1` en los
últimos **20** commits que tocaron `Generador.gs`. Está anotado en `docs/PENDIENTES_consistencia.md`.

| función | método | camino | ¿pisa? |
|---|---|---|---|
| `crearPeriodos_` | `setValues` sobre `getLastRow() + 1` | `generarPeriodosSemanales_` → botón «semana en curso» y `generarProximasSemanas()` | ⛔ **no, insert-only** |
| `crearPeriodos_` | ídem | `crearPeriodoPersonalizado_` → botón «período personalizado» | ⛔ **no, insert-only** |

⭐⭐ **Es UNA sola escritura para los dos botones, y eso es la mitad del diseño.** Dos caminos de
escritura sobre la misma hoja es la figura que la Parte C de esta misma corrida vino a cerrar en el
aviso de ventana: mientras haya dos, el día que uno gane una guarda el otro se queda sin ella — y
**no falla, publica**. El banco lo fija: `tools/probar-generador-periodos.js` afirma que hay
**exactamente un** `setValues` en todo el bloque.

⛔⛔ **Por qué INSERT-ONLY y no `upsertPorClave_`, que era el camino obvio.** Está **medido** que
`upsertPorClave_` **pisa sin preguntar**: `agosto_14_20` con otras fechas devolvió
`{escritas: 0, actualizadas: 1}` — la fila reescrita en silencio. Y un `periodo_id` no es un valor
cualquiera: es una **clave referenciada**. `julio_24_30` aparece en **119 líneas** del repo, así que
moverle las fechas **cambia el universo de todo lo que lo cita sin que nada falle**. Una clave que ya
está se informa en `ya_estaban` y no se toca.

⚠ **Y la comprobación de existencia va contra las FILAS CRUDAS, nunca contra `leerPeriodos()`.**
`leerPeriodos` es `leerRegistro_('PERIODOS', 'periodo_id')`, que hace `registro[clave] = obj`
recorriendo: **colapsa las repetidas**. Hoy ve **8 donde la hoja tiene 9 filas**, porque
`julio_24_30` está duplicada. Preguntarle *«¿existe?»* a un mapa por clave es preguntarle a quien ya
perdió el dato que hace falta — es el mismo error que costó filas en `CAMPANAS` el 18/08.

⭐ **RELEE lo que quedó, no lo que pidió escribir** (`C-83`). El retorno trae `filas_antes`,
`filas_despues` y, por cada fila creada, **lo que la hoja tiene ahora** — comparado con
`parsearFechaCelda_`, o sea *como el motor la va a leer*, no como texto. Entre lo que se escribe y
lo que queda está la interpretación automática de tipos de Sheets, que es la que muerde: el alta de
`ecv_barrio1-3` informó «3 filas agregadas» diciendo la verdad sobre lo que **pidió** y mintiendo
sobre lo que **quedó**.

⛔ **«Ya estaban todas» se declara con `idempotente: true`, no se colapsa con el éxito.** Una corrida
que no hizo nada y una que hizo todo no pueden verse igual en el reporte.

**Lo que este escritor NO hace, dicho para que nadie lo espere:**

- **No deduplica** `julio_24_30`. Las dos filas rotas de `PERIODOS` —esa duplicada y
  `'vie 14/08 -- jue 20/08 (por defecto)'`, que es una **etiqueta de origen usada como clave
  primaria**— **no se tocan, por decisión del usuario**. Se **reportan** en `claves_repetidas` en
  cada corrida.
- **No renombra nada.** La convención `<AAAA>_<mes_del_INICIO>_<dd_inicio>_<dd_fin>` rige **sólo
  hacia adelante**: `julio_24_30`, `agosto_14_20` y las tres de junio son claves con 68 líneas en
  `.gs`/`.js`/`.html` y 43 en `docs/` apuntándoles.
- **No borra ni corrige una fila existente**, ni siquiera si sus fechas están mal. Eso es una
  decisión editorial y no la toma un generador.

### PLAN_CORRIDA — hoja nueva, 20/08/2026

**No es hoja de registro**: es operativa, como `CORRIDAS` y `FALTANTES`. No entra a
`ALCANCE_REGISTROS_` ni a las tres listas que `tools/listas.js` compara, y eso es a propósito.

| función | método | camino |
|---|---|---|
| `escribirPlan_` | `setValues` | vía `iniciarCorridaDesatendida_`, una vez por corrida |
| `marcarSeccionPlan_` | `setValue` | vía `correrUnaEjecucion_`, **una celda por sección a medida que termina** |
| `hojaPlan_` | `insertSheet` | la crea si no existe |

⭐ **Se marca de a una y a medida que terminan, no al final**, y es el motivo entero de que no sea
un `setValues` al cierre: **una ejecución que muere no puede dejar el plan mintiendo.**

⚠ **Y el escritor nuevo que este contrato no tenía: `continuarCorridaDesatendida` corre desde un
TRIGGER, sin usuario delante**, con los permisos del dueño del script. Es la primera vez que una
hoja de este libro se escribe sin que haya nadie mirando. Dos consecuencias:

- **el alcance no es el de quien aprieta el botón**, sino el del dueño del script — las bases son
  planillas de otras cuentas compartidas con él, y eso **hay que probarlo antes de confiar**:
  `verificarAlcanceDesatendido()`;
- **no hay a quién preguntarle nada**, así que todo lo que en una corrida manual sería un diálogo
  acá tiene que ser una guarda que para y reporta.

### ANCLAJE_MEDICION — hoja nueva, 23/08/2026

**No es hoja de registro**, igual que `ANCLAJE_PENDIENTE`, `CORRIDAS`, `FALTANTES` y
`PLAN_CORRIDA`: no entra a `ALCANCE_REGISTROS_` ni a las tres listas de `tools/listas.js`.
**Nadie la siembra y nadie la edita a mano.**

| función | método | camino |
|---|---|---|
| `registrarMedicionAnclaje_` | `appendRow` | vía `anclarEncuentrosSinCache_`, **una fila por anclaje real** |
| `registrarMedicionAnclaje_` | `deleteRows` | poda las viejas al pasar de `TOPE_MEDICIONES_ANCLAJE_` (200) |
| `obtenerHojaAnclajeMedicion_` | `insertSheet` | la crea la primera vez |

⛔ **Por qué existe:** hasta hoy, `ANCLAJE_PENDIENTE` vacío significaba **dos cosas opuestas** —*«no
corrió»* y *«corrió y nadie cayó bajo el umbral»*—, y las dos eran la misma pantalla en blanco. Y
los `sinLink` **no dejaban rastro en ninguna hoja**: vivían en el retorno de `anclarEncuentros` y
morían con la ejecución. Con una fila escrita, `intentados > 0` con `sin_link: 0` **afirma** que se
midió, que es lo que no se podía decir.

⭐ **Escribe `anclarEncuentrosSinCache_` y no `anclarEncuentros`**, y la diferencia es el conteo:
la de afuera cachea, y `itemsDeSeccion_` la llama **una vez por sección**. Desde allá habría una
fila por consumidor y el número diría cuántas veces se preguntó, no cuántos encuentros se
intentaron anclar.

⚠ **Acumula, a diferencia de `FALTANTES`**, y es a propósito: acá el valor está en la serie —*«esta
semana anclaron 4 de 6 y la anterior 6 de 6»*—, y una fila por corrida no crece como 190.

⚠ **Los nombres van sin normalizar.** Si un nombre de encuentro llega sucio, eso es un hallazgo
sobre el parseo y tiene que verse: el sufijo `@ítem` de `FALTANTES` fue la herramienta con la que
se diagnosticó `X-40`, y un instrumento que lava sus datos de entrada esconde el bug justo donde se
diagnostica.

⚠ **No puede voltear el anclaje, y tampoco se traga su propio fallo.** Devuelve `ok: false` con el
motivo, y el reporte de la unión lo publica — una hoja de mediciones incompleta que nadie sabe que
lo está es peor que ninguna hoja. Es el precedente de `marcarEtapa_`.

### FALTANTES_PREVIO — hoja nueva, 23/08/2026

**No es hoja de registro**, igual que `PLAN_CORRIDA`, `CORRIDAS` y `FALTANTES`: no entra a
`ALCANCE_REGISTROS_` ni a las tres listas que `tools/listas.js` compara.

| función | método | camino |
|---|---|---|
| `rotarFaltantes_` | `setValues` | vía `escribirFaltantes_`, en el cierre de cada corrida |
| `rotarFaltantes_` | `clearContent` | ídem — se pisa entera, guarda **una** corrida de profundidad |
| `hojaDeSalida_` | `insertSheet` | la crea la primera vez que hay algo que archivar |

⭐ **Guarda una sola corrida, y es una decisión medida.** Una corrida deja del orden de 190 filas;
acumular por `corrida_id` daría ~10.000 en cincuenta corridas y convertiría la lista de trabajo en
un log, que es justo lo que `D-12` no quiere. La pregunta que esto contesta —*«¿este faltante ya
estaba antes de mi cambio?»*— es la única que se hizo hasta hoy, y necesita una sola de profundidad.

⚠ **Copia lo que la hoja TIENE, no lo que la corrida anterior quiso escribir.** Si la anterior murió
en el muro y nunca llegó al cierre, no hay nada que copiar y el archivo queda como estaba. **No se
inventa una foto**, y el reporte de la corrida lo dice: `faltantes_previo` viaja con `ok` y `filas`
por separado, porque *«no había nada que archivar»* y *«el archivado falló»* mandan a cosas
distintas.

⚠ **Y `escribirFaltantes_` ahora reconcilia los headers de `FALTANTES` antes de escribir**
(`reconciliarHeadersDeSalida_`). Es lo que hace que una columna nueva del esquema llegue a una hoja
que ya existe: `hojaDeSalida_` sólo escribe headers cuando la hoja **no está**, así que sin esto la
columna entra a `HOJAS_CONFIG_` y **la celda nunca se escribe, sin error** — el modo de falla de
`CLAUDE.md` §2. Sólo **agrega al final**; nunca reordena ni renombra, y por eso no sirve para una
hoja de registro: ahí está `COLUMNAS_DELTA_`, que además siembra.

### SOLAPAS

| función | método | sitio | camino |
|---|---|---|---|
| `alinearSolapasLookerADinamico_` | `setValue` | Instalar.gs:522 | vía aplicarInstalacion_ (Instalar.gs:279) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1563 | vía aplicarClasificacionSolapas_ (Instalar.gs:1314) |
| `upsertPorClave_` | `setValues` | Instalar.gs:1572 | vía aplicarClasificacionSolapas_ (Instalar.gs:1314) |
| `inventariarSolapas` | `setValue` | Solapas.gs:119 | directo |
| `inventariarSolapas` | `setValue` | Solapas.gs:120 | directo |
| `inventariarSolapas` | `setValue` | Solapas.gs:121 | directo |
| `inventariarSolapas` | `setValues` | Solapas.gs:132 | directo |
| `inventariarSolapas` | `setValue` | Solapas.gs:147 | directo |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:501 | directo |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:502 | directo |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:503 | directo |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:507 | directo |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:508 | directo |
| `consolidarMapeoLooker_` | `setValue` | Solapas.gs:509 | directo |

### SECCIONES

| función | método | sitio | camino |
|---|---|---|---|
| `sembrarSecciones_` | `setValues` | Instalar.gs:1958 | vía menuSembrarSecciones_ (Instalar.gs:1970) |
| `sembrarSecciones_` | `setValues` | Instalar.gs:1958 | vía menuAplicarConfiguracion_ (Instalar.gs:1997) |
| `curarSecciones_` | `setValue` | Instalar.gs:2159 | directo |

> **`curarSecciones_` es el segundo escritor de `SECCIONES`, y entró el 05/08** (corrida
> nocturna, punto 1). `sembrarSecciones_` **sólo agrega** y nunca pisa una fila existente,
> así que corregir un campo de una sección ya sembrada —el caso concreto:
> `encuentro.familia_tokens`, de `ecv_,enc_` a `enc_`— no tenía ningún camino en el código.
> Es deliberadamente angosta: **no crea filas, no borra filas y no toca `seccion_id`**, sólo
> escribe campos declarados de una sección que ya existe, y devuelve el antes y el después
> de cada celda. Misma forma y mismo motivo que `curarMarcadores_` sobre `MARCADORES`.
> Las líneas de esta tabla se regeneran con `node tools/escritores.js`.

### CAMPANAS — sin escritores en el código


### REUNIONES

| función | método | sitio | camino |
|---|---|---|---|
| `cargarTemarioReuniones_` | `setValues` | Reuniones.gs:161 | directo |

### MARCADORES

| función | método | sitio | camino |
|---|---|---|---|
| `migrarCalculoAOperacion_` | `setValue` | Instalar.gs:640 | vía aplicarInstalacion_ (Instalar.gs:295) |

### LAMINAS

| función | método | sitio | camino |
|---|---|---|---|
| `escribirColumnaLaminas_` | `setValue` | Sellador.gs:470 | directo |
| `borrarFilasDeLaminas` | `deleteRow` | Sellador.gs:514 | directo |
| `sellarPlantilla` | `setValues` | Sellador.gs:761 | directo |

## Anexo — hojas que no son de registro (reportes, diagnósticos, trabajo)

### ANCLAJE_PENDIENTE

| función | método | sitio | camino |
|---|---|---|---|
| `panel_archivarAnclaje` | `setValue` | PanelBackend.gs:971 | directo |
| `columnaArchivadaDeAnclaje_` | `setValue` | PanelBackend.gs:1005 | vía panel_archivarAnclaje (PanelBackend.gs:939) |
| `panel_confirmarAnclaje` | `setValue` | PanelBackend.gs:1042 | directo |
| `obtenerHojaAnclajePendiente_` | `setValues` | Union.gs:896 | directo |
| `registrarAnclajePendiente_` | `setValues` | Union.gs:942 | vía anclarEncuentrosSinCache_ (Union.gs:1154) |
| `registrarAnclajePendiente_` | `appendRow` | Union.gs:944 | vía anclarEncuentrosSinCache_ (Union.gs:1154) |

### AUD_SOLAPAS

| función | método | sitio | camino |
|---|---|---|---|
| `escribirAuditoriaSolapas_` | `clear` | Auditoria.gs:187 | vía auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValue` | Auditoria.gs:198 | vía escribirAuditoriaSolapas_ (Auditoria.gs:190) → auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValue` | Auditoria.gs:198 | vía escribirAuditoriaSolapas_ (Auditoria.gs:191) → auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValue` | Auditoria.gs:198 | vía escribirAuditoriaSolapas_ (Auditoria.gs:192) → auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValues` | Auditoria.gs:200 | vía escribirAuditoriaSolapas_ (Auditoria.gs:190) → auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValues` | Auditoria.gs:200 | vía escribirAuditoriaSolapas_ (Auditoria.gs:191) → auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValues` | Auditoria.gs:200 | vía escribirAuditoriaSolapas_ (Auditoria.gs:192) → auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValues` | Auditoria.gs:206 | vía escribirAuditoriaSolapas_ (Auditoria.gs:190) → auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValues` | Auditoria.gs:206 | vía escribirAuditoriaSolapas_ (Auditoria.gs:191) → auditarSolapas (Auditoria.gs:161) |
| `escribirBloqueAud_` | `setValues` | Auditoria.gs:206 | vía escribirAuditoriaSolapas_ (Auditoria.gs:192) → auditarSolapas (Auditoria.gs:161) |

### DIAG_BASES

| función | método | sitio | camino |
|---|---|---|---|
| `escribirDiagBases_` | `clear` | Fechas.gs:696 | vía diagnosticarBases (Fechas.gs:635) |
| `escribirDiagBases_` | `setValues` | Fechas.gs:698 | vía diagnosticarBases (Fechas.gs:635) |
| `escribirDiagBases_` | `setValues` | Fechas.gs:704 | vía diagnosticarBases (Fechas.gs:635) |
| `escribirDiagBases_` | `setValues` | Fechas.gs:709 | vía diagnosticarBases (Fechas.gs:635) |
| `escribirDiagBases_` | `setValues` | Fechas.gs:715 | vía diagnosticarBases (Fechas.gs:635) |

### DIAG_COLAPSO

| función | método | sitio | camino |
|---|---|---|---|
| `diagnosticarColapso_` | `clear` | Auditoria.gs:550 | directo |
| `diagnosticarColapso_` | `setValues` | Auditoria.gs:553 | directo |
| `diagnosticarColapso_` | `setValues` | Auditoria.gs:566 | directo |
| `diagnosticarColapso_` | `setValues` | Auditoria.gs:574 | directo |
| `diagnosticarColapso_` | `setValues` | Auditoria.gs:607 | directo |

### DIAG_FECHAS

| función | método | sitio | camino |
|---|---|---|---|
| `escribirDiagFechas_` | `clear` | Fechas.gs:290 | vía detectarColumnasFecha (Fechas.gs:122) |
| `escribirDiagFechas_` | `setValues` | Fechas.gs:291 | vía detectarColumnasFecha (Fechas.gs:122) |
| `escribirDiagFechas_` | `setValues` | Fechas.gs:298 | vía detectarColumnasFecha (Fechas.gs:122) |

### DIFF_CONFIGURACION

| función | método | sitio | camino |
|---|---|---|---|
| `escribirDiffConfiguracion_` | `clear` | Instalar.gs:2190 | vía menuAplicarConfiguracion_ (Instalar.gs:2017) |
| `escribirDiffConfiguracion_` | `setValues` | Instalar.gs:2203 | vía menuAplicarConfiguracion_ (Instalar.gs:2017) |
| `escribirDiffConfiguracion_` | `setValues` | Instalar.gs:2206 | vía menuAplicarConfiguracion_ (Instalar.gs:2017) |
| `escribirDiffConfiguracion_` | `setValues` | Instalar.gs:2208 | vía menuAplicarConfiguracion_ (Instalar.gs:2017) |

### ESTADO_CONFIGURACION

| función | método | sitio | camino |
|---|---|---|---|
| `escribirDiffConfiguracion_` | `clear` | Instalar.gs:2190 | vía menuEstadoConfiguracion_ (Instalar.gs:2366) |
| `escribirDiffConfiguracion_` | `setValues` | Instalar.gs:2203 | vía menuEstadoConfiguracion_ (Instalar.gs:2366) |
| `escribirDiffConfiguracion_` | `setValues` | Instalar.gs:2206 | vía menuEstadoConfiguracion_ (Instalar.gs:2366) |
| `escribirDiffConfiguracion_` | `setValues` | Instalar.gs:2208 | vía menuEstadoConfiguracion_ (Instalar.gs:2366) |

### VALORES

| función | método | sitio | camino |
|---|---|---|---|
| `escribirFilaValores_` | `appendRow` | Valores.gs:57 | vía registrarValorCalculado_ (Valores.gs:140) |
| `escribirFilaValores_` | `appendRow` | Valores.gs:57 | vía registrarValorCalculado_ (Valores.gs:145) |
| `escribirFilaValores_` | `appendRow` | Valores.gs:57 | vía registrarValorCalculado_ (Valores.gs:154) |
| `escribirFilaValores_` | `appendRow` | Valores.gs:57 | vía registrarValorCalculado_ (Valores.gs:158) |

### VALORES_DIVERGENTES

| función | método | sitio | camino |
|---|---|---|---|
| `registrarOActualizarDivergencia_` | `setValues` | Valores.gs:101 | vía registrarValorCalculado_ (Valores.gs:162) |
| `registrarOActualizarDivergencia_` | `appendRow` | Valores.gs:105 | vía registrarValorCalculado_ (Valores.gs:162) |

### VISTA_PREVIA

| función | método | sitio | camino |
|---|---|---|---|
| `corteVerticalRetiro2407_` | `clear` | Marcadores.gs:187 | directo |
| `corteVerticalRetiro2407_` | `setValues` | Marcadores.gs:188 | directo |
| `corteVerticalRetiro2407_` | `setValues` | Marcadores.gs:196 | directo |
| `corteVerticalRetiro2407_` | `setValues` | Marcadores.gs:206 | directo |
| `corteVerticalRetiro2407_` | `setValues` | Marcadores.gs:224 | directo |

## Sin resolver — sitios cuya hoja el censo no pudo atribuir

- `aplicarInstalacion_` · `setValues` · Instalar.gs:244 — getSheetByName(nombre) sin literal a la vista
- `aplicarInstalacion_` · `setValues` · Instalar.gs:262 — getSheetByName(nombre) sin literal a la vista
- `alinearSolapasLookerADinamico_` · `setValue` · Instalar.gs:522 · vía probarMigracionesEnDiff_ (Pruebas.gs:132) — retorno de hojaFalsaConEscrituras_ sin literal
- `alinearSolapasLookerADinamico_` · `setValue` · Instalar.gs:522 · vía probarMigracionesEnDiff_ (Pruebas.gs:151) — retorno de hojaFalsaConEscrituras_ sin literal
- `alinearSolapasLookerADinamico_` · `setValue` · Instalar.gs:522 · vía probarMigracionesEnDiff_ (Pruebas.gs:160) — retorno de hojaFalsaConEscrituras_ sin literal
- `alinearSolapasLookerADinamico_` · `setValue` · Instalar.gs:522 · vía probarMigracionesEnDiff_ (Pruebas.gs:178) — retorno de hojaFalsaConEscrituras_ sin literal
- `reclasificarSolapasM2Invertidas_` · `setValue` · Instalar.gs:618 — parámetro hoja sin llamadores
- `reclasificarSolapasM2Invertidas_` · `setValue` · Instalar.gs:619 — parámetro hoja sin llamadores
- `asegurarColumna_` · `setValue` · Instalar.gs:695 · vía aplicarInstalacion_ (Instalar.gs:256) — getSheetByName(nombre) sin literal a la vista

## Control positivo del censo (criterio (b) de la Parte E)

- Escritor de MAPEO por el camino del upsert (`Instalar.gs`): **encontrado**
- Escritor de MAPEO por `promoverFechasElegidas()` (`Fechas.gs`): **encontrado**
