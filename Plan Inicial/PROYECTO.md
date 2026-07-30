# PROYECTO — Motor de Informes

> **Documento maestro vivo.** Único lugar de verdad: se actualiza cada vez que
> cambia algo. Ubicación: `Plan Inicial/PROYECTO.md`.
> Para *ejecutar* (comandos, permisos, orden de corrida) → `docs/RUNBOOK.md`.
> Para los prompts de Code → `docs/Prompts/Paso-*.md`.
>
> Última actualización: 30/07/2026.

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
`RVD JM-CM - ES`), **looker** (hoja `resumen_metricas_dinamico` — confirmado contra la
base viva el 30/07, DOC-3 Parte A; incluye `fecha` → `fecha_inicio` e `id_cuenta` para
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

**⚠ Paso 2.6 Parte G — abierto, bloquea DOC-3 Parte A:** `resumen_metricas_dinamico` y
`resumen_metricas` existen **las dos** en el archivo `looker`. `hoja_default` (tabla de
arriba) apunta a `resumen_metricas`, pero `DIAG_FECHAS` del 30/07 y la metadata de Drive
vieron `_dinamico` como primera solapa, y las letras de columna que carga `MAPEO`
corresponden a `_dinamico`. Si las dos hojas no tienen el mismo orden de columnas, todo
lo leído de `looker` hasta hoy salió de la columna de al lado, sin fallar. Antes de tocar
nada: correr "Comparar resúmenes de looker (Parte G)" (`compararResumenesLooker_`,
Solapas.gs) — vuelca fila 1 + conteo de filas de las dos — y que el usuario decida cuál
queda `uso=fuente` y cuál `derivada` en `SOLAPAS`. Las dos quedaron sembradas en
`revisar` (Paso 2.6 Parte D), así que `buscarMapeo()` no lee ninguna hasta que se decida.
**Pregunta abierta, sin resolver (no cambia la precedencia de arriba):** `looker` tiene
el desglose por canal (`MAIL`/`IVR`/`SMS`/`CC`/`DIGITAL`/`ALCANCE`, cada una con su
`ID cuentas`) como solapas propias — ¿`unirDigitalPorCuenta()` (Paso 2.4) está
reconstruyendo un join que Looker ya trae hecho río arriba? Puede explicar el timeout de
~6 minutos de `menuProbarUnionYAnclaje_` (Tarea 7 de AUD-1, todavía sin diagnosticar).

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

## 7. Plan por pasos y estado

**Bloque 1 — Fundación y config — ✅ completo**
Paso 0 (hojas registro + menú) · Paso 1 (lector + `abrirBase` con caché) · Paso 1.5
(re-anclado a `jpcofanogcba1`) · Paso 0.5 (esquema de períodos) · Paso 1.7 (seed
BASES/MAPEO/CONFIG) · Paso 1.6 + 1.6 v2 (registrar plantillas, robusto) · Paso 1.8 + 1.8-B
(convención de commits, timeZone/scopes, diagnóstico Drive) · Paso 1.9 (MAPEO completo +
`fila_encabezado`/`modo_periodo`).

**Bloque 2 — Motor headless**
- Paso 2 + 2.1 + 2.3 ✅ — lectura por ventana: `resolverCampo`/`resolverVentana`/
  `leerFuente` en `Fuentes.gs` (maneja `modo_periodo`/`fila_encabezado`, parseo de fecha
  sin ambigüedad mm/dd, ventana con bordes inclusivos, columna de fecha y columna clave
  por convención de MAPEO, filas basura fuera del conteo, diagnóstico honesto que
  degrada a ⚠️ si no hay filas en ventana o >50% sin fecha). `digital` sembrado completo
  (Paso 2.3). Menú "Probar lectura por ventana". Falta que el usuario corra la prueba
  real y cierre P1–P5/A1–A10 de `VERIFICACION_Paso-2.md`.
- Paso 2.2 + 2.2.1 — primera corrida ya confirmada por el usuario (JM slide 5 y slide 6
  correctas). El parche 2.2.1 corrigió dos problemas que aparecieron en esa corrida: los
  renombres de texto pasaron a ser **por `informe_id`** (`RENOMBRES_ARMONIZACION_POR_INFORME_`
  en `Armonizar.gs`) porque un renombre global rompió `enc_audiencia` en SECCO; y se
  agregaron los 16 renombres de M2 slide 10 (nunca se habían codeado) + una limpieza de
  caja fuera de canvas más robusta (recorre `Group`, la versión anterior solo miraba
  elementos de primer nivel — por eso los 14 números viejos seguían apareciendo). **El
  parche todavía no se corrió contra la plantilla real.** Sigue pendiente sacar la
  advertencia de `docs/TOKENS.md` (Parte D del 2.2). `enc_audiencia_ivr`→`enc_base_total`
  sigue siendo pregunta abierta en `PLANTILLAS_QA_y_armonizacion.md` §9, no confirmada.
- Paso 2.4 ✅ — capa de ensamblado (`Union.gs`), en paralelo a la vía de plantillas
  (2.2 → 2.5): `unirDigitalPorCuenta()` (join de las 6 solapas de `digital` por
  `id_cuenta`, snapshot) + `anclarEncuentros()` (anclaje RDV → cuenta digital,
  `docs/DISENO_match_temario.md` §5 bis, con precondición R-01 y umbral de
  confianza) + `filasDigitalDeEncuentro()` como proveedor estable que el Paso 3
  usa en vez de `leerFuente` directo para digital. El join por `id_cuenta` y el
  anclaje RDV **no son aritmética** y por eso viven acá, no en `Marcadores.gs`.
  Menú: "Probar unión y anclaje".
- **Firma de encabezados** (paso propio, antes del `Paso-3-v2`) — DOC-3 generalizó el
  riesgo que estaba anotado como específico de `RDV_otros_ministros` (dueño ajeno inserta
  una columna, el mapeo por letra sigue leyendo sin fallar, devuelve la de al lado): **las
  cuatro bases están mapeadas por letra de columna y ninguna es propia** (`rdv` y `digital`
  del equipo, `Base Looker` de `dgples.comunicacion@gmail.com`, `M2` de
  `tarnowski.jp@gmail.com`) — así que aplica a todo el motor. Guardar la fila de
  encabezado de cada solapa mapeada y fallar ruidosamente si cambió. **Decisión del Paso
  2.6:** la columna vive en `SOLAPAS.firma_encabezado` (creada, reservada y vacía —
  no en `MAPEO` ni en una hoja `FIRMAS` aparte, esa alternativa queda descartada), porque
  la firma es un atributo de la solapa, mismo criterio que `SOLAPAS.fila_encabezado`.
  `inventariarSolapas()` (`Solapas.gs`) ya abre cada solapa `fuente` en cada corrida, así
  que la mitad del trabajo de este paso va a estar hecho. `diagnosticarBases()`
  (`Fechas.gs`, DOC-3 Parte B) ya lee la fila de encabezado para tipar columnas — otra
  mitad ya resuelta. Detalle: `docs/RDV_otros_ministros_riesgo.md`. **Sin implementar.**
- Paso 3 — primer cálculo en `Marcadores.gs` + trazabilidad.
- Paso 4 — motor de reemplazo (tokens fijos).
- Paso 5 — campañas repetibles + end-to-end.

**Bloque 3 — Panel** · Paso 6 web app (`doGet`) · 7 período · 8 campañas · 9 preview+trazabilidad.
**Bloque 4 — Automatización** · 10 auto-convertir plantillas · 11 triggers · 12 entrega por mail.

**Orden de corrida detallado → `docs/RUNBOOK.md`.**

---

## 8. Setup técnico

- clasp: cuenta `jpcofanogcba1`. `.clasp.json` con el `scriptId` (commiteado).
  `.claspignore` deja subir solo `appsscript.json`, `.gs`, `.html`.
- git: repo con remoto `origin`. Convención de commit: `Paso N ✅ — <resumen>`.
- Nativos obligatorios: bases = Google Sheets, plantillas = Google Slides.

---

## 9. Convenciones de mantenimiento

- **Este `PROYECTO.md` es el único doc "vivo" sin restricción.** Al cerrar cada bloque,
  se refresca (estado, decisiones resueltas, deltas de esquema). Ver la taxonomía de
  abajo: no todos los docs de `docs/` se actualizan a mano de la misma forma.
- Prompts `Paso-*.md` en `docs/Prompts/` — no van acá.
- Docs viejos consolidados acá quedan archivados en `Plan Inicial/_archivo/`.

### Taxonomía de documentos (DOC-1, 29/07/2026)

La regla "`PROYECTO.md` es el único doc que se actualiza" es buena pero hasta el 29/07
no se cumplía: había al menos seis docs que se seguían editando a mano y divergían entre
sí (ver `docs/PENDIENTES_consistencia.md`). Tres estados, explícitos:

- **Vivos** — se editan cuando cambia algo: `PROYECTO.md`, `docs/RUNBOOK.md`,
  `docs/TOKENS.md`, `docs/PENDIENTES_consistencia.md`.
- **Congelados** — se leen, no se editan; son relevamientos o hallazgos fechados que
  describen un momento, no el estado actual: `docs/MAPEO_completo.md`,
  `docs/HALLAZGOS_validacion_decks.md`, `docs/DISENO_match_temario.md`,
  `docs/CONFIG_INFORMES.md`, `docs/PLANTILLAS_QA_y_armonizacion.md`.
- **Archivados** — `Plan Inicial/_archivo/`: superados, ya no se leen para trabajar,
  solo como historial.

Si un documento **congelado** necesita cambiar: o el cambio va a `PROYECTO.md` (que sí
es vivo), o el doc pasa a vivo explícitamente (se anota acá). Lo que no puede pasar es
que se edite en silencio y quede contradiciendo a otro — eso es exactamente lo que costó
la mitad del trabajo de `DOC-1`.

### Convención de trabajo: un commit por paso

Instaurada en el Paso 1.8, porque el commit `8f76cc5` bundleó cuatro pasos (0.5, 1,
1.6, 1.7) al encimarse en los mismos archivos sin commit intermedio. No se rehace esa
historia, pero de acá en adelante:

1. Se termina un paso → se avisa y se espera que el usuario lo pruebe. No se sigue al
   siguiente paso por cuenta propia.
2. El usuario confirma que pasó la prueba.
3. Recién ahí se actualiza la doc (`docs/Sesiones/HANDOFF AAAA-MM-DD.md` de la sesión —
   ver convención abajo —, y `PROYECTO.md` si el paso cambió algo estructural) y se
   commitea.
4. Mensaje de commit: `Paso N ✅ — <resumen corto>`. Un paso por commit, sin bundles.
5. Si un paso toca los mismos archivos que el anterior, igual va en su propio commit:
   alcanza el orden temporal, no hace falta separar por archivo.
6. Si al momento de commitear el working tree tiene cambios de más de un paso, se para
   y se pregunta en vez de bundlear.

Excepción explícita: un mismo prompt puede pedir varios commits internos (p. ej. este
mismo Paso 1.8, con Partes A/B/C) cuando el propio prompt lo indica.

### Convención de HANDOFF: un archivo nuevo por sesión, fechado

Instaurada el 2026-07-29, tras un conflicto de sincronización de OneDrive: el usuario
edita este repo desde dos herramientas (esta sesión de Code, con git, y claude.ai, que
sube/edita archivos directo en la carpeta sin git), y un `HANDOFF.md` único editado desde
las dos a la vez generó dos versiones simultáneas.

- Cada sesión que necesite dejar un handoff escribe un archivo **nuevo**:
  `docs/Sesiones/HANDOFF AAAA-MM-DD.md`. Si ya hay uno de ese día, sumar `-N`
  (`HANDOFF AAAA-MM-DD-2.md`).
- **Nunca se edita un HANDOFF de una sesión anterior.** Son snapshots, no un doc vivo.
- El HANDOFF más reciente por fecha es el punto de partida para la próxima conversación;
  los anteriores quedan como historial.

### Riesgo real: los `.gs` comparten un único namespace global

Las dos herramientas (esta sesión y claude.ai) escriben archivos `.gs` en la misma
carpeta sin verse entre sí. Apps Script concatena **todos** los `.gs` en un solo scope
global: dos funciones o `var` con el mismo nombre en archivos distintos no dan error de
sintaxis, pero una pisa a la otra en silencio (gana la que carga después, típicamente por
orden alfabético de archivo). Pasó en el Paso 2: `Fuentes.gs` y el nuevo `Parseo.gs`
(de claude.ai) definieron cada uno su propio `parsearFecha_` con firmas incompatibles —
se detectó a tiempo y se renombró el de `Fuentes.gs` a `parsearFechaCelda_`.
**Antes de nombrar una función o `var` global nueva, greppear el nombre en todo el
repo** (`grep -rn "function nombre_" *.gs`), sobre todo si el otro archivo pudo haber
sido escrito por la otra herramienta sin avisar.

### Aprendizaje: el diagnóstico no distingue config vieja de config mal armada

En el Paso 2.1, tres ⚠ y un ✅ engañoso de "Probar lectura por ventana" llevaron a
diagnosticar un bug de seed que no existía: el código estaba bien (`SEED_MAPEO_` ya
tenía `rdv/fecha` y `looker` sembrado, `SEED_BASES_` ya tenía `m2` en snapshot/fila 3) y
lo que estaba viejo era **la planilla**, porque nadie había corrido "Cargar config
inicial" después del `clasp push`. Se leyó el código buscando un problema que estaba en
la hoja.

**Mejora concreta pendiente (no implementada en `DOC-1` — ese prompt no toca código):**
que "Probar lectura por ventana" muestre cuándo fue la última carga de config, guardando
un `ultima_carga` en `CONFIG` al correr `seedConfiguracion()`. Tres líneas, evita repetir
este diagnóstico equivocado cada vez que cambie un seed. Queda anotado para el próximo
paso que toque `Instalar.gs`/`Fuentes.gs`.
