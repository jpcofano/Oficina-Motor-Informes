# PROYECTO — Motor de Informes

> # ⚠ DOCUMENTO CONGELADO — 01/08/2026 (`DOC-6` Parte E)
>
> **Esto es historia, no el estado del proyecto.** Fue el documento maestro vivo entre el
> 26/07 y el 01/08/2026: ahí se decidió la arquitectura por registros, se resolvió cuál de
> las dos hojas de `looker` era la fuente, y se fijó que la plantilla es del equipo. Sirve
> para entender **cómo se llegó**; no para saber qué es cierto hoy.
>
> Se congeló porque el estado tenía dos casas y perdía sincronía: §7 llegó a describir el
> Paso 2.4 como el más reciente cuando el proyecto iba por el 2.11, y §9 duplicaba trece
> reglas de `CLAUDE.md`. Un archivo que hay que mantener alineado con otro se desalinea.
>
> **Adónde fue cada cosa:**
>
> | sección | qué contenía | dónde vive hoy |
> |---|---|---|
> | §1 | tesis del motor, regla de oro | `CLAUDE.md` (encabezado y §2) |
> | **§2** | **roles de las dos cuentas, permisos, sidebar vs web app** | **`docs/PLAN.md` `D-02`/`D-03`/`D-04` — ⚠ y lo contradicen, ver abajo** |
> | §3 | esquema de las hojas de registro · recetas · reparto por módulo | esquema → `Instalar.gs` (`HOJAS_CONFIG_`) y las hojas vivas · recetas → `PLAN.md` `D-01` · reparto por módulo → `CLAUDE.md` §2 |
> | §4 | tres capas de resolución de período · bloques repetibles · periodicidad | **capas → `docs/TOKENS.md` §5** · bloques → `TOKENS.md` §3 · periodicidad → `docs/CONFIG_INFORMES.md` |
> | §5 | tabla de bases · quirk de M2 · precedencia de merge · resolución S-01 · lección del `getFormulas()` | bases → `docs/_snapshots/` y la hoja `BASES` · precedencia → `CONFIG_INFORMES.md` §4 · S-01 → `docs/SUPUESTOS.md` · **lección → `CLAUDE.md` §4** · pregunta abierta del timeout → `docs/PENDIENTES_consistencia.md` |
> | §6 | regla "la plantilla es del equipo" · plantillas canónicas · familias · bloqueante `m2_salud_camp` | regla → **`docs/REGLAS_NEGOCIO.md` `C-01`** · IDs y familias → `docs/TOKENS.md` · **bloqueante → `docs/PENDIENTES_consistencia.md`** |
> | §7 | roadmap por bloques | `docs/PLAN.md` §2 (tramos) |
> | §8 | setup de clasp y git | `docs/RUNBOOK.md` y `CLAUDE.md` §4 |
> | §9 | taxonomía de documentos y convenciones | `CLAUDE.md` §7 (índice único, `DOC-6` D.4) y §1/§3/§4/§5 |
>
> **⚠ §2 quedó superado y dice lo contrario que el plan vigente.** No leerlo como
> instrucción: al 30/07 decía que `jpcofanogcba1` es la "cuenta robot que ejecuta" y que
> `reporteseinformesgcba` es dueña de las bases. `docs/PLAN.md` `D-02` (01/08) lo invierte —
> **ejecuta `reporteseinformesgcba`**, y todavía **necesita** que le den lectura sobre las
> cuatro bases. `D-04` además descarta la barra lateral que §2 proponía para admin: el panel
> es web app. Lo único de §2 que sigue en pie es que el script y la planilla de control son
> de `jpcofanogcba1`.
>
> **Si algo de acá tiene que cambiar**, no se edita este archivo: el cambio va al documento
> que `CLAUDE.md` §7 declara dueño de esa pregunta. Una decisión estructural nueva nace como
> `D-NN` en `docs/PLAN.md`.
>
> Última actualización como documento vivo: 30/07/2026.

---

## 1. Qué es

Sistema **Google Sheets → Apps Script → Google Slides** que genera presentaciones
automatizadas y configurables (período, fuentes, y qué calcula cada valor) sin tocar
código. Contexto: comunicación GCBA.

**Tesis:** no es un informe, es un *motor*. Informe nuevo = plantilla nueva + filas de
config. **Regla de oro:** toda la aritmética vive solo en `Marcadores.gs`.

---

## 2. Arquitectura de ejecución (dos cuentas)

- `jpcofanogcba1` = **cuenta robot** (ejecuta; dueña del script y de la planilla de control).
- `reporteseinformesgcba` = cuenta del **usuario** (dueña de bases y salidas).

**Arq. 1 (elegida):** script **bound** a la planilla de control, ambos propiedad del
robot. `onOpen` (sidebar) para admin; **web app (`doGet`, ejecuta como robot)** para el
usuario final. La planilla se comparte con el usuario (editor). No requiere refactor
(`getActive()` sigue válido).

> Alternativa Arq. 2 (standalone, control propiedad del usuario): pierde el sidebar y
> exige `getActive()`→`openById(CONTROL_ID)`. No elegida.

**Permisos — todo compartido con `jpcofanogcba1`:** bases → lector; plantillas
(Slides) → editor (el motor las copia); carpeta de salida → editor; planilla de control
→ del robot, compartida con el usuario (editor).

**Dos frentes, un motor:** sidebar y web app llaman a las mismas funciones; solo cambia
el disparador y bajo qué cuenta corre.

---

## 3. Diseño por registros (extensibilidad)

**Principio:** agregar una base o plantilla = agregar una **fila**, no tocar código. El
motor nunca nombra una base/plantilla en el código: las descubre leyendo hojas-registro
y las referencia por ID lógico (`base_id`, `informe_id`).

Las **6 hojas de config** (+ `PERIODOS`):

- **CONFIG** (clave/valor global): `periodo_desde`, `periodo_hasta`, `informe_activo`,
  `carpeta_plantillas`, `carpeta_salida`.
- **BASES** (una fila por fuente viva): `base_id | nombre | sheet_id | hoja_default |
  tipo | activo | notas` (+ `fila_encabezado`, `modo_periodo` — ver §5).
- **INFORMES** (una fila por plantilla/informe): `informe_id | nombre | plantilla_id |
  periodicidad | familias | activo | notas`.
- **MARCADORES** (un token por fila): `marcador | familia | informe_id | base_id |
  solapa | campo_logico | periodo_ref | operacion | valor_fijo | formato | notas`
  (DOC-2: `calculo`→`operacion`, se suman `solapa` y `valor_fijo` — `operacion=TEXTO`
  usa `valor_fijo` en vez de calcular).
- **MAPEO** (campo lógico → columna, por base y solapa): `base_id | solapa | campo_logico |
  hoja | columna | notas` (Paso 2.3.2: `solapa` entra en la clave junto a `base_id` +
  `campo_logico` — una base con varias solapas, como `digital`, necesita las tres para no
  pisarse en silencio).

**Resolución de `solapa` en `MARCADORES` (DOC-2, detalle en `docs/TOKENS.md` §4):** si
`solapa` viene vacía y la base tiene una sola solapa en `MAPEO`, se infiere (y la traza lo
dice); si tiene más de una, error `«FALTA:token@sin_solapa»` en vez de adivinar. `rdv` ya
tiene dos solapas mapeadas (`RVD JM-CM - ES` y `RDV_otros_ministros`), así que el caso de
inferencia aplica a menos bases de las que parece.
- **CAMPANAS** (campañas seleccionables): `campana_id | nombre | informe_id | base_id |
  tipo | desde | hasta | mostrar | orden`. `tipo` acepta (Paso 2.2): `campana`,
  `uno_a_uno`, `tematico`, `primera_persona`, `ministros`, `proveedor`.
- **PERIODOS** (ventanas con nombre): `periodo_id | desde | hasta | notas`.

**Recetas:**
- *Base nueva* → fila en BASES + filas en MAPEO. Cero código.
- *Plantilla/informe nuevo* → marcar el Slides + fila en INFORMES + filas en MARCADORES.
  Si los cálculos ya existen, cero código; si trae métrica nueva, una función en
  `Marcadores.gs` (única excepción de la regla de oro).
- *Campaña* → fila en CAMPANAS.

**Reparto de responsabilidad por módulo:** estructura → `Instalar.gs`; acceso a datos y
caché → `Fuentes.gs`; aritmética → `Marcadores.gs`; despacho/reemplazo → `Generador.gs`.

---

## 4. Períodos (3 capas)

El período no es global; se resuelve **por token** en este orden de prioridad:
1. ¿el token es de una campaña seleccionada? → fechas propias de esa fila de `CAMPANAS`;
2. ¿el marcador tiene `periodo_ref`? → esa ventana de `PERIODOS`;
3. si no → período principal de `CONFIG`.

**Dos clases de bloque repetible, misma mecánica (Paso 2.2):** el motor itera `CAMPANAS`
filtrando `mostrar=sí`, ordenado por `orden`, y emite el bloque de slides del `tipo`
correspondiente usando la ventana propia de cada fila. Varía por edición (no siempre
entran las mismas filas). Las dos clases:
- **Campaña** (`tipo=campana`) — bloque único `camp_*`, idéntico JM/SECCO.
- **Encuentro** (`tipo` = `uno_a_uno` / `tematico` / `primera_persona` / `proveedor`) —
  separador + estrategia + iceberg, familia `enc_*` (ver `docs/TOKENS.md` §3: unifica lo
  que antes eran `u1_*`/`et_*`/`pp_*` sueltos). `ministros` (`emin_*`) **no** entra en este
  mecanismo: su slide es un agregado semanal de varios encuentros, no un bloque por
  encuentro — no se toca.

**No implementado todavía — es el Paso 5.** El Paso 2.2 solo deja el registro (`tipo`
ampliado) y esta documentación; la emisión de los bloques sigue sin cablear.

**✅ Periodicidad y corte de datos — confirmado (DOC-4, 31/07/2026), archivaba en
`docs/DECISION-periodicidad-y-periodos.md`.** Los dos informes son semanales **por
defecto**, pero todo tiene que ser configurable — nunca hardcodeado en código ni
plantilla. Reglas confirmadas:
- **La reunión define el corte por defecto del informe**, y las reuniones son
  **entidades específicas**, no una columna genérica dentro de `PERIODOS` — es
  exactamente lo que ya construyó la hoja `REUNIONES` (Paso 2.9D): una fila curada por
  encuentro (`orden`, `eje`, `tipo`, `nombre`, `fecha`, `etapa`, `mostrar`,
  `texto_original`, `notas`), no el campo `reunion` que proponía el documento original.
  Esa parte de la propuesta queda superada por lo implementado, no por descarte.
- **Cualquier bloque puede pedir un período distinto** al del informe vía `periodo_ref`
  (`PERIODOS`) — ya implementado, es la capa 2 de arriba.
- **No hay corte diario de datos**: el motor lee en vivo al momento de la corrida: dos
  corridas del mismo período pueden dar números distintos si hubo carga posterior, y eso
  es esperable, no un bug. Es la razón de ser de `docs/Prompts/Paso-2.9H.md`
  (`VALORES`/`VALORES_DIVERGENTES`): la foto de cada cálculo y la decisión explícita de
  reusar o actualizar cuando dos informes comparten un bloque y el valor cambió entre
  medio.

El documento archivado también proponía un esquema propio para `PERIODOS` (`id_periodo`,
`tipo`, `fecha_desde`, `fecha_hasta`, `etiqueta`, `reunion`) — **no coincide con el
esquema ya implementado** (`periodo_id`, `desde`, `hasta`, `notas`, Paso 0.5). Queda
anotado acá como lo que se propuso, sin migrar nada: la hoja viva manda.

Los pendientes que quedaban sin confirmar en el documento (salvo el de "reunión", ya
cerrado por la existencia de `REUNIONES`) están en `docs/PENDIENTES_consistencia.md`.

---

## 5. Fuente de verdad — DATOS

Bases vivas (Google Sheets nativas), cargadas en `BASES`:

| base_id | nombre | sheet_id | hoja_default | modo |
|---|---|---|---|---|
| rdv | RDV JM CM ES + funcionarios | `1ZpHO6Ru1uY2r9WfBF_yFtu5z7ip7F3Q6VOoRJN5vLAo` | RVD JM-CM - ES | filtrar |
| digital | Seguimiento Digital | `1LadILzFpyCrZRapxgDOFOldSoRawjKkWMaFci_ilhPY` | Digital | filtrar |
| looker | Base Looker | `1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ` | resumen_metricas_dinamico | filtrar |
| m2 | M2 Reporte para Fede 2026 | `1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY` | M2 periodo DIRECTA | **snapshot** |
| miba | Integración MiBA | *(vacío)* | | parqueada (activo=no) |

**Quirk de M2** (por eso las columnas `modo_periodo` / `fila_encabezado` en BASES):
las hojas `M2 periodo DIRECTA` / `M2 periodo DIGITAL` **ya vienen al corte del período**
(no se filtran por fecha) y tienen el **encabezado en la fila 3** (fila 1 = período,
fila 2 = vacía, datos desde fila 4). Config M2: `modo_periodo=snapshot`, `fila_encabezado=3`.

**MAPEO — completo en código** (`SEED_MAPEO_` en `Instalar.gs`): **rdv** (hoja
`RVD JM-CM - ES`), **looker** (hoja `resumen_metricas_dinamico` — S-01,
`docs/SUPUESTOS.md`, ver más abajo; incluye `fecha` → `fecha_inicio` e `id_cuenta` para
el join con Seguimiento Digital), **m2** (DIRECTA + DIGITAL + `Cuentas` como dimensión
de atributos, DOC-3 Parte D) y **digital** (Paso 2.3: `Digital` + `Directa Mail` +
`Directa SMS` + `Directa IVR` + `Alcance` + `Seguimiento digital` maestra, unidas por
`*_id_cuenta`). `digital` pasó a `modo_periodo=snapshot` (mismo motivo que looker: la
fecha de campaña tiene lead de 3–7 días respecto del encuentro, ventanearla contra la
semana del encuentro descarta casi todo). Detalle de columnas en
`docs/MAPEO_completo.md` y en el propio `SEED_MAPEO_`.

**R-04 (`docs/REGLAS_NEGOCIO.md`, DOC-3):** el temario define el universo de campañas
del informe (selección humana de encuentros), no una ventana de fecha — por eso
`digital`/`looker` se leen en `snapshot` y sus columnas de fecha son diagnóstico/acotado
de lectura, no filtro de contenido.

**Precedencia de merge digital/directa para el Paso 3** (decidida, documentada acá para
que el agregador la use — NO se codea en `Fuentes.gs`, es lógica de `Marcadores.gs`):
**RDV → Seguimiento Digital → Looker**. Las tres bases pueden traer el mismo campo lógico
para una campaña; si se pisan, gana la fuente más a la izquierda. `m2` va aparte, familia
`m2_*`, no entra en este merge. `HALLAZGOS_validacion_decks.md` §4 verificó que Looker es
el rollup exacto de Seguimiento Digital (no una fuente independiente) — por eso SD pesa
más: tiene el desagregado por envío que Looker no puede reconstruir.

**✅ RESUELTO (Paso 2.9 Parte C, 31/07/2026) — DOC-3 Parte A cerrada, S-01
(`docs/SUPUESTOS.md`).** `resumen_metricas_dinamico` y `resumen_metricas` existen
**las dos** en el archivo `looker`, con encabezados y conteos idénticos (903 filas,
mismo orden de columnas — `compararResumenesLooker_`, Solapas.gs). Eso solo decía que
no había riesgo de leer la columna equivocada; no decía **cuál es la fuente**.

**Segunda vuelta sobre el mismo test.** El Paso 2.8 Parte C había corrido
`getFormulas()` sobre las filas 2-4 y leído "tiene fórmulas = derivada, valores planos
= fuente" al pie de la letra, concluyendo `resumen_metricas` = fuente. Esa lectura
asume que la fórmula deriva de la OTRA hoja del par — pero la fórmula real de
`resumen_metricas_dinamico` es `=QUERY(Cuentas!A2:G; "SELECT * WHERE Col1 is not null
AND Col7 <> 'Pendiente'"; 0)`: consulta una **tercera** hoja (`Cuentas`), no
`resumen_metricas`. Son independientes, no fuente y copia — el criterio "fórmulas =
derivada" no aplica, y de hecho se invierte: `_dinamico` es una consulta viva que
crece con `Cuentas`; `resumen_metricas` es un pegado congelado que hoy coincide y la
semana que viene no (y ya devolvió 899 de 903 filas sin fecha, señal de que está
viejo). **Resultado final: `resumen_metricas_dinamico` es la fuente,
`resumen_metricas` es la derivada** (invierte el cierre del Paso 2.8 Parte C).

Aplicado en código con `alinearMapeoLookerADinamico_()` / `alinearSolapasLookerADinamico_()`
/ `alinearBasesHojaDefaultLooker_()` (Instalar.gs, corren dentro de `instalar()`, por
eso son idempotentes y se reafirman en cada instalación en vez de depender de una
migración manual una sola vez): `SOLAPAS` — `resumen_metricas_dinamico` = `fuente`,
`resumen_metricas` = `derivada` (las dos `origen=manual`); `BASES.hoja_default`
(looker) = `resumen_metricas_dinamico`; `MAPEO` — las 25 filas de vuelta a
`resumen_metricas_dinamico`. Reemplazan a `moverFechaPeriodoLookerAResumenMetricas_`
(Paso 2.8 Parte B), que movía en sentido contrario y se hubiera revertido solo en la
próxima instalación si seguía corriendo.

**Lección para no repetir:** un test automático (`getFormulas()`) puede tener razón en
el hecho ("hay una fórmula") y equivocarse en la inferencia ("por lo tanto deriva de
la otra hoja del par") si nadie lee QUÉ consulta esa fórmula. `auditarFormulasResumenesLooker_()`
ya volcaba el texto literal de cada celda con fórmula (mejora del Paso 2.8 Parte C); el
error no fue de instrumentación, fue de lectura: la clasificación automática
(`estado='una_es_derivada'`) asume que toda fórmula deriva de la otra hoja del par, sin
distinguir una `QUERY()` sobre una tercera fuente. El texto de la fórmula estaba
disponible — hacía falta mirarlo antes de aceptar la etiqueta `derivada`/`fuente` tal cual.

**Pregunta abierta, sin resolver (no cambia la precedencia de arriba):** `looker` tiene
el desglose por canal (`MAIL`/`IVR`/`SMS`/`CC`/`DIGITAL`/`ALCANCE`, cada una con su
`ID cuentas`) como solapas propias — ¿`unirDigitalPorCuenta()` (Paso 2.4) está
reconstruyendo un join que Looker ya trae hecho río arriba? Puede explicar el timeout de
~6 minutos de `menuProbarUnionYAnclaje_` (Tarea 7 de AUD-1, todavía sin diagnosticar).
**Una hipótesis alternativa para el mismo timeout quedó descartada (AUD-2,
`docs/AUD-2_union_digital_clave.md`, Paso 2.7 Parte C):** `unirDigitalPorCuenta()` ya une
por `*_id_cuenta` en las seis solapas (`Union.gs:81-93`), nunca por `clave` — no está
comparando nombre de campaña contra código de cuenta. El candidato que queda en pie es el
scoring `O(realizadas × candidatos)` de `anclarEncuentros()`/`scoreMatchDigitalRdv_()`.

**Decisión resuelta (DOC-1, 29/07/2026):** escrita una sola vez en
`docs/CONFIG_INFORMES.md` §4.1; `MAPEO_completo.md` (congelado) apunta ahí en vez de
repetirla. Queda pendiente actualizar `docs/Prompts/Paso-3-v2.md` en el mismo sentido —
asignado a `docs/Prompts/Paso-2.4.md` (Reconciliación 1), no se toca desde otro lado para
no duplicar el trabajo. Otras pendientes: ECV block, columna de campaña canónica.

---

## 6. Fuente de verdad — PLANTILLAS

- Plantillas **marcadas** convertidas a **Google Slides nativas**, en la carpeta de Drive
  cargada en `CONFIG.carpeta_plantillas` (`Paso 1.6 v2`; antes hardcodeada en el código —
  `1Q5At-COhFbidKCfYrwXhN6kZAbuxgYpi`). Sus IDs se cargan en `INFORMES.plantilla_id` con
  `registrarPlantillasDesdeCarpeta()` (matchea por nombre: "JM"→jm, "SECCO"→secco;
  recorre hasta 2 niveles de subcarpetas y distingue Slides nativas de `.pptx` sin
  convertir y accesos directos). `diagnosticarCarpetaPlantillas_()` lista el contenido
  crudo de la carpeta para depurar cuando el registro no encuentra nada.
- Informes: `jm` (semanal, 22 slides) y `secco` (mensual, 29 slides).
- Convención de token: **`{{doble_llave}}`**, snake_case, por familia. El motor
  reemplaza solo **texto** (datos en imágenes no son tokenizables).
- Inventario de tokens y diccionario canónico: **`docs/TOKENS.md`** (fusiona los
  inventarios por slide de JM/SECCO + el diccionario de renombres — `enc_*` vs `et_*`
  resuelto, `camp_*` verificado idéntico entre plantillas). ⚠ los renombres son el
  estado objetivo: la primera corrida de `armonizarPlantillas()` (`Armonizar.gs`) ya
  confirmó JM slide 5/6 correctas, pero se aplicó sobre la plantilla equivocada (ver
  regla y tabla canónica abajo) — sigue sin correr sobre la canónica.
- `.pptx` marcados (referencia) en `Plan Inicial/_archivo/Plantillas/`.

### Regla: la plantilla es del equipo, el motor se adapta (Paso 2.2.2)

El equipo edita el diseño en Slides; el motor lee lo que el equipo tiene. Nunca al revés.
Se fijó tras encontrar dos presentaciones JM distintas en Drive (mismo nombre, distinto
orden de slides — venían divergiendo desde antes de la armonización) y que
`INFORMES.plantilla_id` apuntaba a la que no usa el equipo.

1. **`INFORMES.plantilla_id` es la única verdad** sobre qué archivo usa cada informe. Si
   hay dos candidatos, no se elige por criterio técnico: se pregunta.
2. **El motor solo escribe sobre la plantilla en una migración explícita** (una
   armonización de tokens), nunca en una corrida normal. La generación semanal **copia**
   la plantilla y escribe sobre la copia (Paso 4, `Generador.gs`, todavía stub).
3. **Toda migración que escribe sobre la plantilla hace backup antes** — es un archivo
   compartido y editado por otras personas. `armonizarPlantillas()` aborta esa
   presentación si el backup falla, en vez de armonizar sin red.

**Plantillas canónicas (única fuente de verdad, `INFORMES.plantilla_id`):**

| informe_id | ID canónico | estado |
|---|---|---|
| `jm` | `117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI` | sin armonizar todavía (Parte D del 2.2.2, bloqueada — ver abajo) |
| `secco` | `1_ZKjWhL-bhCP8yHQ8PJ33ymyjSXu3thh7MKMOxB4-n8` | parcialmente armonizada (Paso 2.2, antes de corregir el 2.2.1) |

Deck comentado (referencia, no se toca): `1yIlCIBGJHsJBNLaMDqBNf75b2gzyMVnlwB5JJArNZv0`.

**`1JrHvs_pdvdwWGZ1CQNmuJr9Bi3XvqyOMJhRweeJAzbE` queda marcada `[OBSOLETA — no usar]` en
Drive** (no se borra: tiene la armonización del 2.2/2.2.1 aplicada y sirve de referencia
de cómo tiene que quedar la canónica).

**Bloqueante para correr la armonización sobre la canónica (sin resolver):** en la matriz
digital de M2 hay una caja `{{m2_salud_camp}}` huérfana, visible, que no está en la
columna de Salud — si además se renombra `m2_camp4`→`m2_salud_camp` (como pide el
diccionario), quedan dos cajas con el mismo token, el mismo problema que `enc_audiencia`.
El usuario tiene que decidir si esa caja es un sobrante para borrar o si hay que sacar ese
renombre de la lista, antes de correr "Armonizar tokens de plantillas" sobre `117I0qn1…`.

**Familias:** `ecv_*`, `enc_*` (incluye lo que era `et_*`/`emin_*`/`u1_*` — ver "bloque
de encuentro repetible" abajo), `m2_*`, `camp_*` (bloque único de campaña, idéntico
JM/SECCO, verificado: 53 tokens, cero diferencias), `mail_/ivr_/cc_/imp_/pauta_*`,
`gcba_*`, `conv_/rep_/rrss_*`, `post_/u1_*`, `miba_*`.

**Anclaje: sección + token, no número de slide.** Los números se movieron una vez en un
solo día (se borró una hoja del deck comentado). Equivalencia de referencia entre el
deck comentado y `SECCO_marcada` (la plantilla real):

| sección | en `SECCO_marcada` | en el comentado |
|---|---|---|
| Portada · Índice · separadores | 1–4 | 1–4 |
| Uno a uno — resultados por plataforma | 5 | 5 y 6 (uno por encuentro) |
| Encuentro temático (sep · estrategia · iceberg) | 6–8 | 7–9 |
| Primera persona (sep · estrategia · iceberg · antecedente) | no existe | 10–12 |
| Comunicaciones post | 9–10 | 13–14 |
| Ministros | 11–12 | 15–16 |
| M2 | 13–15 | 17–19 |
| Campaña destacada | 16–23 | 20–27 |
| Análisis (conv/rep/rrss) | 24–28 | 28–32 |
| Gracias | 29 | 33 |

**Bloque de encuentro repetible (confirmado, detalle en `docs/TOKENS.md` §3):** el uno a
uno **no es una sección fija**, es un bloque repetible — el comentado tiene dos slides de
plataforma, una por encuentro de la semana; la plantilla marcada tiene una sola porque esa
semana hubo un solo encuentro. Mismo patrón que `camp_*`: se emite una instancia por cada
encuentro seleccionado, con su propia ventana (`ecv_comuna`/`ecv_fecha`/`ecv_asistentes`/
`ecv_minutos` son por encuentro, no globales del período). **"Primera persona" es un tipo
de encuentro más y está sin marcar** (tres slides en `xx` en el comentado, sin
equivalente en la plantilla base). Refuerza no cablear familias por sección (`u1_*`,
`et_*`, `pp_*`) sino una familia de encuentro con un `tipo` — ya decidido para `emin_*` y
para proveedores. **El bloque de post tiene que ser dinámico:** la plantilla trae 3 filas
fijas (`post_camp1-3`/`post_estado1-3`) y una semana real tuvo 2 — fijo deja
`«FALTA:token»` de más. Implementación de estos tres puntos: Paso 5.

---

## 7. Plan por pasos

> **Un documento de arquitectura no lleva estado (DOC-5 Parte 2, 31/07/2026).** Esta
> sección listaba "✅ completo" y "Sin implementar" por bloque; llegó a describir el Paso
> 2.4 como el más reciente y "firma de encabezados" como sin implementar cuando el
> proyecto ya iba por el Paso 2.11 Parte C con `firma_encabezado` hecha — diez sub-pasos
> de atraso sin que nadie lo notara, porque el estado tenía dos casas. Corrección: el
> estado tiene un solo dueño (ver pointer abajo) y no es esta sección; acá solo queda el
> roadmap. Hallazgo original: `docs/PROPUESTA_orden_documental.md`, Tarea 4.1.

Roadmap por bloques, sin marca de avance:

- **Bloque 1 — Fundación y config**: hojas de registro y menú, lector con `abrirBase`
  cacheado, esquema de períodos, seed inicial (`BASES`/`MAPEO`/`CONFIG`), registro de
  plantillas, convención de commits y diagnóstico de Drive, `MAPEO` completo.
- **Bloque 2 — Motor headless**: lectura por ventana (`Fuentes.gs`), armonización de
  tokens de plantillas, capa de ensamblado (`Union.gs`: join de `digital` + anclaje RDV),
  firma de encabezados (`SOLAPAS.firma_encabezado`), cálculo en `Marcadores.gs`, motor de
  reemplazo de tokens en Slides, campañas repetibles + corrida end-to-end.
- **Bloque 3 — Panel**: web app (`doGet`), selección de período, selección de campañas,
  preview + trazabilidad.
- **Bloque 4 — Automatización**: auto-convertir plantillas, triggers, entrega por mail.

**Dónde estamos ahora mismo → `docs/HANDOFF_CODE.md`.**
**Qué se hizo, paso por paso, desde el scaffold inicial → `docs/BITACORA.md`.**
**Orden de corrida detallado → `docs/RUNBOOK.md`.**

---

## 8. Setup técnico

- clasp: cuenta `jpcofanogcba1`. `.clasp.json` con el `scriptId` (commiteado).
  `.claspignore` deja subir solo `appsscript.json`, `.gs`, `.html`.
- git: repo con remoto `origin`. Convención de commit: `Paso N ✅ — <resumen>`.
- Nativos obligatorios: bases = Google Sheets, plantillas = Google Slides.

---

## 9. Convenciones de mantenimiento — MIGRADAS

> **Vaciada el 01/08/2026 (`DOC-6` Parte E).** Esta sección tenía la taxonomía de
> documentos, las convenciones de commit y de handoff, el riesgo del namespace global y un
> par de aprendizajes. **Trece de esas reglas estaban también en `CLAUDE.md`**, palabra por
> palabra o casi — el censo de la Parte A las contó una por una. Dos índices del mismo repo
> mantenidos a mano divergen: es lo que ya había pasado con `CONFIG_INFORMES.md`, que este
> índice declaraba congelado mientras su propio encabezado decía "vivo".
>
> Un duplicado se resuelve **borrando uno**, no sincronizando los dos. Queda el de
> `CLAUDE.md`, que es el archivo que alguien lee en cada corrida:
>
> | qué había acá | dónde está ahora |
> |---|---|
> | Taxonomía de documentos (tabla de 24 docs, tablas de datos, directorios) | `CLAUDE.md` §7 — **el único índice** desde `DOC-6` D.4 |
> | Convención de trabajo: un commit por paso (los 6 puntos) | `CLAUDE.md` §4 |
> | Convención de HANDOFF y bitácora: dos archivos, dos dueños | `CLAUDE.md` §5 |
> | Riesgo del namespace global de los `.gs` y el caso `parsearFecha_` | `CLAUDE.md` §1 |
> | Mensaje de commit `Paso N ✅`, `REGLAS_NEGOCIO`/`SUPUESTOS` append-only, estados de documento, campo `reemplaza:`, nomenclatura `Paso-N`/`DOC-N`/`AUD-N` | `CLAUDE.md` §3, §4 y §7 |
> | Aprendizaje: el diagnóstico no distingue config vieja de config mal armada | mejora pendiente (`ultima_carga` en `CONFIG`) → `docs/PENDIENTES_consistencia.md` |
>
> Lo único que **no** estaba duplicado y no se perdió: la nota sobre
> `RDV_otros_ministros_riesgo.md` (un pendiente vivo no puede vivir dentro de un documento
> congelado) — es el criterio que esta misma parte aplicó para sacar de acá el bloqueante
> de `{{m2_salud_camp}}` y mandarlo a `PENDIENTES_consistencia.md`.
