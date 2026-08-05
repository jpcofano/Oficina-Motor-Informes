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
> Último censo: **03/08/2026**, re-corrido al retirar `repuntarPlantillaCanonicaJM_`.
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
| `PERIODOS` | `SEED_PERIODOS_` vía upsert | upsert únicamente | ✅ |
| `SOLAPAS` | `SEED_SOLAPAS_` vía `aplicarClasificacionSolapas_` (clasificación) + `inventariarSolapas` (medición) | upsert de clasificación · `inventariarSolapas` (`Solapas.gs:119-147`: `filas_datos`, `filas_crudas`, `firma_encabezado`) · migraciones `alinearSolapasLookerADinamico_`, `reclasificarSolapasM2Invertidas_` · ~~`consolidarMapeoLooker_`~~ (retirada) | ✅ tres caminos, los tres declarados. El reparto seed/inventario viene de C.2-7; la migración de looker dejó de escribir `notas` en la Parte E |
| `SECCIONES` | `SEED_SECCIONES_` vía `sembrarSecciones_` | `sembrarSecciones_` únicamente | ✅ |
| `CAMPANAS` | curada a mano (sin sembrador, a propósito) | **cero escritores en el código** | ✅ consistente con `ALCANCE_REGISTROS_` |
| `REUNIONES` | curada a mano + `cargarTemarioReuniones_`, por **dos entradas**: el ítem de menú "Cargar temario" y, desde el Paso 2.14, la llamada por API `cargarTemario(texto, periodoId)` | `cargarTemarioReuniones_` únicamente (las dos entradas pasan por ahí) | ✅ un solo escritor, dos puertas. Desde el Paso 2.15 Parte B **el período es obligatorio en las dos**: `cargarTemario` valida contra `PERIODOS` y falla explícito antes de escribir (`D-19`) |
| `MARCADORES` | **la plantilla** (`D-17`), vía el `Paso-2.5`, que todavía no corrió | migración `migrarCalculoAOperacion_` · **`curarMarcadores_`** (`Instalar.gs`, 03/08/2026) | ⚠ **sigue sin sembrador, y es a propósito.** `curarMarcadores_` **no lo es**: es la puerta para curar filas puntuales —retirar las tres de ejemplo, cargar y retirar las `prueba_*` del corte vertical—, que hasta hoy se hacían a mano en la planilla. El sembrador real lo trae el `Paso-2.5` (`sembrarMarcadoresDesdePlantillas` + `upsertSoloVacias_`) y **no compite con éste**: aquél completa vacías desde los `{{token}}` de los Slides, éste agrega y quita filas enteras por decisión de una persona. H-6 sigue confirmado |

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

## Anexo — hojas que no son de registro (reportes, diagnósticos, trabajo)

### ANCLAJE_PENDIENTE

| función | método | sitio | camino |
|---|---|---|---|
| `obtenerHojaAnclajePendiente_` | `setValues` | Union.gs:405 | directo |
| `registrarAnclajePendiente_` | `setValues` | Union.gs:451 | vía anclarEncuentros (Union.gs:548) |
| `registrarAnclajePendiente_` | `appendRow` | Union.gs:453 | vía anclarEncuentros (Union.gs:548) |

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
