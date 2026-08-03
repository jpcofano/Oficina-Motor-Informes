# PENDIENTES de consistencia — `docs/*.md`

> Lista de trabajo, no material de referencia. Se recorta a medida que se cierra cada
> punto — el objetivo es que este archivo achique hasta desaparecer, no que crezca.
> Origen: revisión de consistencia del 29/07/2026 (`docs/REVISION_docs_2026-07-29.md`,
> archivada). Prioridad: **P0** = puede meter un número mal o hacer trabajo al pedo ·
> **P1** = confunde la próxima sesión · **P2** = higiene.

## Cerrado en esta pasada (DOC-1, 29/07/2026) — una línea cada uno

- **Looker vs. Seguimiento Digital, cuatro documentos con tres respuestas distintas** →
  decisión escrita una sola vez en `CONFIG_INFORMES.md` §4.1; los demás apuntan ahí.
- **`Paso-2.md` describía una función (`leerColumna()`) que nunca existió** → archivado.
- **Números de slide sin decir de qué archivo** → equivalencia completa en
  `PLANTILLAS_QA_y_armonizacion.md` §2; se ancla en sección + token, no en número.
- **`Paso-3-v2.md` decía "una sola base" para el corte vertical de la slide 5** →
  verificado que son dos (`ecv_*` + `mail_*`/`cc_*`/`ivr_*`); la corrección del archivo
  en sí queda para `Paso-2.4.md` (no tocarlo desde acá, ver nota abajo).
- **`VERIFICACION_Paso-2.md` §4 duplicaba la tabla V1–V6 de `HALLAZGOS_validacion_decks.md`
  §6** → vaciada, con puntero.
- **`enc_*` vs `et_*`, `camp_*` sin confirmar, QA de posiciones** → resueltos, ver
  `docs/TOKENS.md` y `docs/PLANTILLAS_QA_y_armonizacion.md`.
- **Paso 2: los ⚠ de la primera corrida parecían bugs del lector** → causas raíz
  resueltas (Paso 2.1: filas vacías fuera del diagnóstico; Paso 2.3: `digital` sembrado
  + diagnóstico honesto). Sigue abierto solo el punto 3 de abajo (verificación real).
- **`MAPEO_completo.md` divergía de lo que se fue descubriendo** → pasa a **congelado**
  (relevamiento original, fechado). La fuente de verdad es la hoja `MAPEO` viva; no se
  persigue más la sincronización a mano. Ver taxonomía en `PROYECTO.md` §9.
- **La convención de HANDOFF se rompía en el archivo que la seguía** (nombre `DDMMAAAA`
  sin sufijo `-N`) → renombrado a `HANDOFF 2026-07-29-2.md`; los handoffs anteriores al
  29/07 están en `docs/Sesiones/_archivo/`.

---

## Sigue abierto

### P0 · Datos personales reales en el historial público del repo

Desde el 27/07 (`75f510d`): muestras de las cuatro bases y informes publicados, en tres
rutas sucesivas del historial. `.gitignore` (31/07) frena lo nuevo pero no lo existente.
Borrado diferido: decidido por el equipo, fuera del alcance de Code — Code no toca
historial ni archivos de datos.

### P0 · Direccionabilidad: 14 IDs de recursos internos en un repo público

Censado el 02/08/2026 al revisar el `DOC-8`. **Es distinto del `P0` de arriba**: ése es
sobre **contenido** —datos personales que quedaron publicados—, éste es sobre
**direccionabilidad** —qué recursos internos quedan localizables—. Un ID de Drive no da
acceso, los permisos siguen mandando; sí confirma que el recurso existe, permite pedir
acceso dirigido y liga por nombre este repo con documentos de conducción de un organismo
público.

| ID | qué es | dónde nace |
|---|---|---|
| `1ZpHO6Ru…vLAo` | base **rdv** | `SEED_BASES_` (`Instalar.gs`) |
| `1LadILzF…ilhPY` | base **digital** | `SEED_BASES_` |
| `1t6Ji4Cd…rHKaQ` | base **looker** | `SEED_BASES_` |
| `1_GS01-TX…hZNvY` | base **m2** | `SEED_BASES_` |
| `1aPWibSbng…BZbIY` | planilla de control | `docs/_snapshots/*.tsv` |
| `1Q5At-CO…xgYpi` | carpeta plantillas | `SEED_CONFIG_DEFAULTS_` |
| `1EyTlfg1…SbX_fJ` | carpeta motor | `SEED_CONFIG_DEFAULTS_` |
| `1LAEVlWZ…3Ejlz` | carpeta salidas | `SEED_CONFIG_DEFAULTS_` |
| `1JrHvs_p…JAzbE` | plantilla JM **obsoleta** | docs (al 03/08 ya no está en `INFORMES` ni en ningún `.gs`) |
| `1_ZKjWhL…B4-n8` | plantilla SECCO | `SEED_INFORMES_` (`Instalar.gs`) → `INFORMES`, y docs |
| `1yIlCIBG…rNZv0` | deck comentado | docs |
| `117I0qn1…7u6jI` | plantilla JM canónica | ~~hardcodeada en `Armonizar.gs`~~ → `SEED_INFORMES_` (03/08/2026) |
| `1wrSsWNU…` | script id del proyecto | `.clasp.json`, trackeado |
| `1MBNAzxe…5HbAw` | Google Doc de conducción | `docs/Prompts/DOC-8_punteo_de_avance.md` |

Aparecen en **33 archivos trackeados**: los `.gs`, el RUNBOOK, `PROYECTO.md`, doce prompts,
siete handoffs, los snapshots `.tsv` y `.clasp.json`. Trece de los catorce ya estaban antes
del `DOC-8`, varios desde el primer commit: **el `DOC-8` es el caso 14, no la causa.**
Sacarlo no cambiaría nada mientras las cuatro bases y las tres carpetas sigan publicadas.

**Reescribir el historial no alcanzaría.** El repo es público desde el 27/07/2026
(verificado contra la API de GitHub el 02/08: `visibility: public`), así que hay que asumir
que lo publicado ya pudo copiarse o indexarse. Un borrado retroactivo limpia el repo, no el
mundo.

**Decisión del usuario, 02/08/2026: el repo sigue público por ahora**, y esto **se revisa
al llegar a producción o a una versión de prueba** — lo que ocurra primero. No es una
pregunta abierta sin dueño: es una decisión tomada con revisión programada, anotada también
en `docs/PLAN.md` §2 para que la encuentre quien llegue a ese hito.

**Dos sub-ítems que no se arreglan ahora y que conviene resolver antes de esa revisión:**

- **`.clasp.json` está trackeado.** Es el más incómodo de la lista porque no es un ID de
  dato: es el **proyecto de Apps Script**. `.claspignore` no lo cubre — ese archivo filtra
  lo que sube *a* Apps Script, no lo que entra a git.
- ~~**`117I0qn1…` está hardcodeado en `Armonizar.gs`** (`PLANTILLA_JM_CANONICA_`) cuando
  debería salir de configuración. Es la misma clase de duplicación que se cerró el 02/08 en
  `diagnosticoDrive()` (`Paso-2.15` Parte A): mientras viva en código, el ID no se puede
  cambiar sin `clasp push` y queda publicado aunque la config apunte a otro lado.~~ —
  **CERRADO el 03/08/2026.** Se retiraron de `Armonizar.gs` las dos constantes
  (`PLANTILLA_JM_CANONICA_`, `PLANTILLA_JM_OBSOLETA_`), la migración de un solo uso
  `repuntarPlantillaCanonicaJM_()` que las consumía y su ítem de menú. El ID canónico vive
  ahora en `INFORMES.plantilla_id`, declarado por `SEED_INFORMES_` como los `sheet_id` de
  `SEED_BASES_`. **Lo que cierra es la duplicación, no la exposición:** el ID sigue en el
  repo, ahora en `Instalar.gs`, y sigue contando como uno de los catorce de la tabla de
  arriba. Lo que se gana es que se puede cambiar sin `clasp push` —el valor vive en la
  hoja— y que hay un solo lugar que dice cuál es la plantilla de cada informe.

### ~~P0 · Paso 2.11 Parte C: el protocolo falla en los pasos 4 y 5~~ — CERRADO (01/08/2026)

Los dos bloqueantes se resolvieron y el protocolo pasó completo en su segunda corrida
(commit `2979f03`; evidencia y delta entre corridas en
`docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md`). El bloqueante 2 **no tuvo arreglo propio**:
se cayó al resolver el 1. Se deja la entrada tachada, con el detalle original abajo, porque
el diagnóstico —y sobre todo el error de la hipótesis inicial— explica por qué el arreglo
fue retirar una migración y no reordenar los sembradores.

**Confirmado en una tercera corrida** (`docs/PROTOCOLO_2.11-C_corrida_2026-08-01.md`), esta
vez con `C.2-2` a `C.2-6` puestas: dos "Aplicar configuración" seguidos, idénticos y con
`cambiadas: 0 · agregadas: 0 · migraciones: 0`, y "Estado de configuración" consistente con
los dos. Los dos P0 —idempotencia y "Estado no coincide con Aplicar"— quedan cerrados con
evidencia repetida, no con una sola medición.

### ~~P0 · El diff funciona pero no es auditable (`C.2-2` a `C.2-7`)~~ — CERRADO (01/08/2026)

Era el resto abierto de la entrada de arriba: sin marca de corrida (había que vaciar
`DIFF_CONFIGURACION` y `ESTADO_CONFIGURACION` a mano), las migraciones escribían por fuera
del diff, las 10 protegidas no decían qué se habrían perdido, y no había línea
`solo_en_hoja`. Las cinco partes están implementadas y verificadas en vivo;
`C.2-7` (documentación + `docs/_snapshots/`) cerró el 01/08. Evidencia:
`docs/PROTOCOLO_2.11-C_corrida_2026-08-01.md`; qué hace cada parte, en el addendum 1 de
`docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`.

**Lo que esa corrida no probó, y no se puede leer del cero:** `C.2-3` está probado sólo
sintéticamente (`probarMigracionesEnDiff_`) — `migraciones: 0` no distingue *no hay
migraciones pendientes* de *ese camino no se ejecuta*; y `cambiadas`/`agregadas` en cero
significan que el camino central del upsert no se ejecutó, porque el control positivo de
cinco ediciones no se repuso. No reabre el P0: lo sostienen la corrida del 31/07 y los
controles positivos. Queda dicho para que nadie lea el cero como cobertura.

<details>
<summary>Detalle original del P0 (cerrado)</summary>

Corrida completa y evidencia: `docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md`. Cinco de
siete pasos pasaron; los dos que fallan son el núcleo del criterio.

- **No idempotente (paso 4).** Cada corrida de "Aplicar configuración" reporta la misma
  celda: `SOLAPAS.digital||RDV JM 2 VECES`, columna `notas`. **Causa verificada contra el
  código el 01/08** — y con los roles al revés de la hipótesis inicial: `SEED_SOLAPAS_` ya
  traía la nota larga y correcta; la migración `corregirNotaControlAnclaje_` comparaba
  contra su propia constante vieja (corta) y la revertía en cada corrida, dentro de la
  misma corrida, antes de que el sembrador la volviera a escribir larga.
  **Arreglo aplicado en el working tree, sin commitear:** migración retirada entera (el
  seed ya es dueño del valor). **Falta re-correr los pasos 3, 4 y 5.**
- **"Estado de configuración" no coincide con "Aplicar" (paso 5).** Estado decía
  `✅ Sin discrepancias` y un "Aplicar" inmediatamente después cambiaba una celda. No era
  una mentira sobre el presente: la discrepancia la **fabricaba** el propio apply, vía la
  migración de arriba. Debería caerse solo con el arreglo — **se verifica en la próxima
  corrida, no se asume.**

</details>

### P2 · `BASES.fila_encabezado` tiene formato de fecha aplicado encima (cosmético)

El diff reportó `BASES m2 fila_encabezado: 31/12/1899 → 1900-01-02`. Son los enteros **1 y
3** renderizados como seriales de Sheets. **Diagnóstico corrido el 01/08: la columna es
`number` en las cinco filas, con `m2 = 3`** — el tipo está bien, `Union.gs` recibe un número
y `Number()` funciona. Queda solo lo cosmético: sacarle el formato de fecha a la columna
cuando se toque `BASES` por otra razón. Baja de P1 a P2.

### P1 · H-2 · `BASES.fila_encabezado` es vestigial y `Union.gs` la lee directo

**No es lo mismo que el punto anterior y no se resolvió con él.** El Paso 2.11 Parte B movió
`fila_encabezado` a `SOLAPAS`, por solapa, pero la columna sigue en `BASES` con valores que
**se contradicen**: `BASES.m2 = 3` mientras `SOLAPAS.m2/Cuentas M2 = 1` y
`SOLAPAS.m2/M2 periodo DIRECTA = 3`. Y `Union.gs:36` y `:261` leen `base.fila_encabezado`
directo, sin pasar por `resolverFilaEncabezado_()` — para `m2/Cuentas M2` leerían la fila 3
como encabezado, que ahí es una fila de datos. El tipo es correcto; el problema es que la
columna sigue existiendo y siendo leída. Junto con los nombres de solapa hardcodeados de
`Fechas.gs:66` y `Auditoria.gs:348`.

**Sin paso asignado desde el 02/08/2026, y es a propósito.** Venía apuntando a la Parte D de
`docs/Prompts/Paso-2.11_una_sola_fuente_de_verdad.md`, que se **archivó** ese día (`DOC-7`):
sus tareas de menú ya las había hecho `MENU_declarado_por_tabla.md` y sus migraciones con
vencimiento se retiraron de a una. **`H-2` era lo único vivo que le quedaba a esa parte**, y
por eso se desprende acá antes de archivarla en vez de irse con ella. Necesita paso propio.

### P0 · Tres reglas de negocio nuevas (R-06, R-09, R-10) sin implementar en código

Escritas en `docs/REGLAS_NEGOCIO.md` (31/07/2026, `docs/Prompts/REGLAS_R09_R10.md` +
`docs/Prompts/Paso-2.10_anclar_a_numeros_verificados.md`/`Paso-2.10_PartesBC_verificado.md`),
verificadas contra las cuatro bases del 31/07, pero la mitigación de cada una **todavía no
está en el código**:

- **R-06** (`id_cuenta` manda): falta el control de "filas con métricas y sin `id_cuenta`
  válido" en el diagnóstico, por base y por solapa.
- **R-09** (lo cancelado no entra): falta que el match por confianza (Paso 2.9 Parte F,
  `anclar_()`/`ANCLAJE_PENDIENTE` en `Union.gs`) nunca auto-seleccione un candidato cuyo
  último envío sea `Cancelación`/`Reprogramación`, lo marque visible en la lista, y registre
  el motivo en `REUNIONES.notas` si la persona lo elige igual.
- **R-10** (encabezados por espacios, no por mayúsculas): falta aplicar `normalizar()`
  (colapsar espacios/saltos de línea, preservar mayúsculas y acentos) en `Fuentes.gs` donde
  hoy se hace `trim()` sobre encabezados y en `buscarMapeo()`; guardar
  `SOLAPAS.firma_encabezado` con el encabezado crudo, no normalizado; y agregar al
  diagnóstico un control de encabezados duplicados tras normalizar, por solapa.

R-05, R-07 y R-08 son constataciones/decisiones de diseño (no piden código nuevo por sí
mismas, aunque R-07 hace que `Snapshot.gs` deje de ser opcional).

### P1 · `auditarFormulasResumenesLooker_` clasifica por "tiene fórmula" sin mirar qué consulta

Abierto el 01/08/2026 (Paso 2.11 Parte E). El diagnóstico decide cuál de las dos hojas de
`looker` es la fuente con la regla *"la que tiene fórmulas es la derivada; la que tiene
valores planos es la fuente"* (`Solapas.gs`). **Para este caso la regla es falsa**, y el
resultado sale invertido.

**Verificado corriéndolo** el 01/08 (sólo lectura, por la API):

```
estado:   "una_es_derivada"
derivada: "resumen_metricas_dinamico"   ← al revés de S-01
fuente:   "resumen_metricas"            ← al revés de S-01
formula:  =QUERY(Cuentas!A2:G;"SELECT * WHERE Col1 is not null AND Col7 <> 'Pendiente'";0)
```

La fórmula que encuentra consulta una **tercera** hoja (`Cuentas`), no la otra del par:
es la prueba de que `_dinamico` es la consulta **viva**, o sea la fuente — y el
diagnóstico la lee como prueba de lo contrario. `resumen_metricas` es el pegado congelado
que ya devolvió 899 de 903 filas sin fecha (`docs/SUPUESTOS.md` S-01).

**Es la lección de `CLAUDE.md` §4 en vivo:** acertó el hecho ("hay una fórmula") y erró la
inferencia ("por lo tanto deriva de la otra hoja del par"). El literal de la fórmula ya
estaba en `celdasConFormula` desde el Paso 2.8 — faltaba mirarlo antes de aceptar la
etiqueta.

**Mitigación aplicada, no arreglo:** los dos ítems de menú se retiraron (Paso 2.11 Parte E)
— el propio diagnóstico y `menuConsolidarMapeoLooker_`, que tomaba de él la dirección y con
ella habría revertido S-01 sobre `MAPEO`, `SOLAPAS` y `BASES` de un click. Las funciones
**no se borraron**.

**Qué falta:** que la clasificación mire el argumento de la fórmula — si la `QUERY`/
referencia apunta a una hoja que **no es la otra del par**, no hay relación fuente/derivada
entre ellas y el caso es `ambas_independientes`, que hoy no existe como estado. Hasta
entonces, ninguna de las dos funciones vuelve al menú.

### ~~P1 · `probarMigracionesEnDiff_` quedó vencido~~ — CERRADO (02/08/2026)

Abierto el 02/08/2026 (Paso 2.14). El control positivo de `C.2-3` **falla**:
`C.2-3: se esperaban 3 celdas (uso, origen, notas), vinieron 1`.

**Es una prueba vencida, no un bug.** Su caso 1 arma una fila sintética con `origen='seed'`
y afirma que `alinearSolapasLookerADinamico_` toca tres columnas. El Paso 2.11 Parte E hizo
que esa migración **deje de escribir `notas`** y quiera **`origen='seed'`** en vez de
`'manual'`, así que hoy toca una sola. El comportamiento nuevo es el correcto y está
verificado contra la planilla: es lo que bajó el piso de protegidas de 10 a 8, con dos
corridas idénticas. Los casos 2 y 4 de la misma prueba tienen el mismo problema (sus fixtures
usan `origen='manual'` y esperan 3 cambios).

**Saldado el 02/08/2026**, antes de entrar al Tramo 1 porque ese tramo toca `Instalar.gs` y
hasta ahora el control de `C.2-3` no protegía nada. Los casos 1 y 4 pasaron a esperar **2
celdas** (`uso`, `origen`) en vez de 3, el 2 dejó de exigir una `notas` concreta, y el 3
suma una afirmación nueva: sobre una fila `manual` la migración ahora la **devuelve al
sembrador** (`origen: manual → seed`), que es un cambio de comportamiento y no un detalle —
le saca el blindaje a una fila que alguien pudo haber blindado a propósito, y por eso tiene
que salir con `pisaManual` a la vista. **El encabezado de la prueba declara qué cambió, con
fecha y paso**: una prueba que se ajusta al código sin decir por qué deja de ser control.
Al cerrar se corrieron los cinco: **5 de 5**.

**Lo que destapó vale más que la prueba, y ya es regla.** Cambié una función **que tenía
control positivo** y no volví a correr los controles: verifiqué contra la planilla, el número
dio bien, y di el paso por cerrado. El protocolo desde el menú **pasa igual aunque los cinco
controles estén mal** —el addendum 3 del `Paso-2.11_ParteC2` lo dice con todas las letras— así
que nada avisó durante un día entero. Quedó escrito en `CLAUDE.md` §4: *quien toca una función
con control positivo corre los controles antes de cerrar*.

### P2 · El designador de paso no es único: ningún cruce automático puede usarlo como clave

Abierto el 02/08/2026 por el censo del `DOC-7`. Los números de paso **colisionan**, y no
sólo entre partes del mismo paso:

| designador | archivos | ¿son el mismo paso? |
|---|---|---|
| `Paso-2.9` | 9 (`A`…`H` + `_v2`) | sí — un lote, corrió junto |
| `Paso-2.10` | 3 | sí — partes distintas del mismo |
| `Paso-2.11` | 2 | sí — el prompt y su Parte C.2 |
| `Paso-2.12` | 2 | sí — el original y el reemplazo de su Parte 2 |
| **`Paso-1.8`** | **2** | **NO** — `Paso-1.8.md` es *"higiene de proyecto: commit por paso + zona horaria + scopes"* y `Paso-1.8-API-de-pruebas-v3.md` es la API sobre `/dev`. **Dos pasos distintos con el mismo número** |

**No se renumera nada:** los designadores ya están citados en la bitácora, en `PENDIENTES`,
en encabezados de función y en commits. Renumerar rompería más de lo que arregla.

**La consecuencia práctica** es la tensión que dejó el censo: para saber si un prompt corrió
hay que cruzar **por designador** contra `docs/BITACORA.md` (que es lo único que la bitácora
registra), pero el designador **no identifica unívocamente el archivo**. O sea que el cruce
sirve para una persona y **no es automatizable con los datos que hay hoy**. Si alguna vez
hace falta automatizarlo, la bitácora tiene que empezar a registrar el **nombre de archivo
completo** del prompt en cada entrada — eso es un cambio de formato y no se decide al pasar.

### P2 · Las `notas` de las ocho solapas protegidas de `rdv` dicen "sin decidir" sobre filas decididas

Abierto el 02/08/2026 (Paso 2.12 Parte 2). Las ocho filas `origen=manual` de `rdv` ya
tienen su `uso` decidido (`ignorar`/`referencia`) y el seed quedó alineado, así que el diff
no las reporta más. Pero su columna `notas` sigue diciendo `sin decidir` —o la duda vieja,
en `RDV_JM_CM_ES` y `Funcionarios / Ministros`— tanto en la planilla como en
`SEED_SOLAPAS_`.

**Por qué quedó así y no es un descuido:** el diff compara `['uso', 'fila_encabezado',
'notas']`. Escribir notas mejores en el seed no las aplicaría —son `origen=manual`, el
sembrador no las pisa— y dejaría **ocho líneas `protegida (habría cambiado)` sobre `notas`
en cada corrida**: exactamente el piso permanente que el Paso 2.11 Parte E acababa de sacar
del lado de `looker`. Entre una nota desactualizada y ocho líneas de ruido para siempre, se
eligió la nota desactualizada, y se deja anotado.

**Cómo se arregla,** cuando toque: o se editan las ocho notas en la planilla a mano (son
filas de dueño humano) y en el mismo commit el seed, o se decide que el `origen=manual` de
esas ocho ya no protege nada —el seed dice lo mismo que la planilla— y se devuelven al
sembrador, como se hizo con las dos de `looker`. **La segunda opción es la que cierra el
caso de verdad**, pero es una decisión sobre ocho filas curadas a mano y no era de este
paso.

**La corrida del 02/08 dejó la causa a la vista, y es más de fondo que las notas.** En las
15 filas del Grupo A el seed pisó las notas viejas sin ninguna resistencia —
`digital||Cuentas` pasó de `sin decidir` a la nota del seed— porque son `origen=seed`. Las
ocho que quedan con notas malas son **sólo** las de `rdv`, y **sólo** por ser
`origen=manual`.

O sea que **`origen` está haciendo dos trabajos a la vez**:

1. *"esto lo decidió una persona"* — procedencia, que es información;
2. *"el sembrador no lo toca"* — protección, que es comportamiento.

Mientras sean la misma columna, marcar la procedencia obliga a congelar **toda** la fila, y
hay que elegir entre **nota correcta** y **protección** — no se pueden tener las dos. Es la
raíz común de este P2 y del piso de `looker` que cerró el 2.11 Parte E: allá el `manual` era
vestigial y alcanzó con sacarlo; acá es genuino y no se puede. La salida de fondo es separar
los dos trabajos (una columna que diga quién decidió, otra que diga qué columnas se
protegen), y eso es un paso propio, no un arreglo al pasar.

### P1 · Bloqueante de la armonización: la caja `{{m2_salud_camp}}` huérfana

**Movido acá el 01/08/2026 (`DOC-6` Parte E), desde `Plan Inicial/PROYECTO.md` §6, que se
congeló.** Un pendiente vivo no puede vivir dentro de un documento congelado — es la misma
razón por la que se movió el "Qué falta" de `RDV_otros_ministros_riesgo.md`.
`docs/TOKENS.md` lo nombraba y mandaba a `PROYECTO.md` §6 por el detalle; ahora apunta acá.

En la matriz digital de M2 hay una caja `{{m2_salud_camp}}` **huérfana y visible**, que no
está en la columna de Salud. Si además se aplica el renombre `m2_camp4` → `m2_salud_camp`
que pide el diccionario (`docs/TOKENS.md` §1), quedan **dos cajas con el mismo token** — el
mismo problema que causó la regresión de `enc_audiencia`.

**Qué bloquea:** correr "Armonizar tokens de plantillas" sobre la plantilla canónica de JM
(`117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI`), que sigue **sin armonizar**. La corrida
del 29/07 se aplicó por error sobre `1JrHvs_p…`, hoy marcada `[OBSOLETA — no usar]`.

**Quién decide:** el usuario, y son dos opciones excluyentes — o la caja es un sobrante y se
borra de la plantilla, o el renombre sale de la lista del diccionario. No se elige por
criterio técnico (`C-01`: la plantilla es del equipo).

> **Relevamiento del 03/08/2026 — sólo lectura, no se aplicó ningún renombre.** Hecho con
> `mapaDeTokens_` (`Armonizar.gs`, nuevo), que recorre `getPageElements()` y baja a tablas y
> grupos.
>
> **⚠ Antes que nada: las dos opciones excluyentes del párrafo de arriba están mal
> planteadas, y la premisa que las sostenía es falsa.** El texto original dice *"si además se
> aplica el renombre… quedan dos cajas con el mismo token"*, o sea que el renombre **crea**
> el problema. **No lo crea: lo revela.** La caja ancha ya existía **con el nombre
> `m2_salud_camp` y en la misma posición exacta** en la plantilla obsoleta (`1JrHvs_p…`),
> que es anterior. El conflicto de nombres está en la plantilla desde antes de que el
> diccionario existiera; el renombre sólo lo pone a la vista al ocupar el mismo nombre desde
> el otro lado.
>
> **Consecuencia:** ninguna de las dos opciones es correcta. *"Borrar la caja"* borra
> contenido de la plantilla del equipo sin saber qué mide (contra `C-01`), y *"sacar el
> renombre de la lista"* deja `m2_camp4` con nombre viejo para siempre por un choque que no
> es suyo — y deja igual dos cosas distintas peleando por un nombre. La tercera opción está
> abajo, en el punto 5.
>
> **1 · Sí hay un grupo de tokens nombrados por eje, y no es el que se buscaba.** En la
> lámina M2 de la JM canónica (slide 10) conviven dos generaciones de nombres. La nueva son
> **seis cajas**: `m2_subtes_imp`, `m2_desalojos_imp`, `m2_transito_imp`, `m2_salud_imp`,
> `m2_seguridad_imp` (la fila de Impresiones **entera**) y `m2_seguridad_aud`. **Ninguna de
> las seis tiene un `m2_campN` de origen en el diccionario, y ninguna colisiona con nada**:
> son casillas que nunca tuvieron nombre viejo — la fila de Impresiones no existe en la serie
> de letras, y la audiencia de Seguridad quedó fuera porque esa serie se corta en `d`.
> Eso explica por qué la plantilla parece a medio migrar y por qué `m2_salud_camp` no
> desentona leyendo la lista de tokens.
>
> **2 · `m2_salud_camp` no pertenece a ese grupo, y lo dice la geometría.** La grilla es de
> cinco columnas —`x` 20 Subtes, 162 Desalojos, 302 Tránsito, 443 Salud, 571 Seguridad,
> leído de la fila de encabezados— por cuatro filas de métrica (`y` 88 Impresiones, 175
> Audiencia, 224 Clics, 273 Visualizaciones, 318 campañas). Las cinco cajas de campañas están
> en `y=318` con `w≈82`, una debajo de cada eje. **La caja en disputa está en `y=356`,
> `x=100`, `w=513`, `h=30`: fila propia, debajo de la grilla, y cruza a lo ancho por debajo
> de las cinco columnas.** No hay ninguna etiqueta vecina a esa altura. Su texto es
> `{{m2_salud_camp}} campañas`, en **plural**, mientras la caja de Salud de la grilla dice
> `{{m2_camp4}} campaña`, en **singular**.
>
> **3 · La caja ancha es anterior a la armonización.** En la plantilla obsoleta
> (`1JrHvs_p…`), que es la que tiene el renombre del `2.2.1` aplicado y es lo más cercano al
> original que queda, esa caja está **en la misma posición exacta y ya con el mismo nombre**.
> No la creó el renombre. Y ahí se ve el resultado de aplicarlo: `{{m2_salud_camp}}` aparece
> **dos veces**, en `y=318 x=464` (grilla, Salud) y en `y=356 x=100`. **La obsoleta es la
> prueba empírica de la colisión**, no una predicción.
>
> **4 · El resto del diccionario queda confirmado, columna por columna.** El mapeo
> letra→eje de `RENOMBRES_ARMONIZACION_POR_INFORME_` coincide con la grilla de la obsoleta
> coordenada por coordenada: `m2_camp2`→subtes (`x48`), `m2_camp1`→desalojos (`x188`),
> `m2_camp3`→tránsito (`x329`), `m2_camp4`→salud (`x464`), `m2_camp5`→seguridad (`x592`), y
> lo mismo para `aud`, `clics` y `vis`. También se confirma el comentario del código sobre
> las visualizaciones: sólo hay **dos** cajas, subtes y desalojos.
>
> **5 · La tercera opción, que no estaba planteada.** Las dos opciones escritas arriba
> asumen que la caja ancha es *o* un sobrante *o* la buena. La geometría sugiere una
> lectura distinta: **es una caja de otro concepto —una línea a lo ancho, plausiblemente un
> total— que quedó con el nombre de un eje**. Si fuera eso, la salida no es borrarla ni sacar
> el renombre, sino **renombrarla a lo que mide** (`m2_camp_total` o similar), y entonces
> `m2_camp4`→`m2_salud_camp` deja de chocar y el diccionario se aplica entero.
> **Es una inferencia, no un hecho**: nada en la lámina dice "total". Lo que la sostiene es
> el ancho, la fila propia y el plural; lo que falta para confirmarla es el informe original
> publicado, o preguntarle al equipo qué mostraba esa línea.
>
> **6 · El material fuera del área visible, mirado a fondo — y NO alcanza para decidir.**
> La slide 10 tiene 51 textos sin token; **18 de ellos están fuera de la lámina** (`y`
> negativo) y son datos reales de un informe publicado. Transcriptos tal cual, en orden:
>
> | bloque | Audiencia | Impresiones | Clics | Visualizaciones |
> |---|---|---|---|---|
> | `Desalojo - 6 campañas` | 1.101.777 | 15.793.427 | 73.181 | 1.782.747 |
> | `Avenidas porteñas - 1 campañas` | 184.030 | 2.567.696 | 34.483 | 308.879 |
> | `Puntos seguros - 1 campañas` | 978.523 | 7.387.326 | 46.021 | `-` |
> | `Estaciones de subtes - 3 campañas` | 1.242.288 | 12.742.329 | 27.326 | `-` |
>
> **Por qué no alcanza, y es la razón por la que esto se detiene acá:** ese material **no es
> el contenido de la caja ancha**. Es un **layout distinto y anterior**, en el que cada eje
> es un bloque vertical con su título y sus cuatro métricas, y **el conteo de campañas vive
> dentro del título** (`Desalojo - 6 campañas`), no en una fila aparte. En ese diseño **no
> existe ninguna caja a lo ancho**, así que no hay nada que diga qué se escribía en la de
> `y=356`. Ninguno de los 18 textos está a esa altura ni tiene ese ancho, y **ninguno de los
> elementos fuera de vista contiene un solo token**: son texto plano con valores pegados.
>
> **Lo único que el material sí establece, sin interpretarlo:** son **cuatro** bloques, no
> cinco. Los nombres son `Desalojo`, `Avenidas porteñas`, `Puntos seguros` y
> `Estaciones de subtes`. **Salud no aparece** — y Salud es justamente el eje del token en
> disputa. Los conteos suman **6 + 1 + 1 + 3 = 11 campañas**.
>
> **Veredicto: no se renombra nada.** La tercera opción del punto 5 sigue siendo la lectura
> más plausible y **sigue sin confirmarse**. Elegir un nombre para la caja exige saber qué
> mide, y eso hoy sólo lo sabe el equipo, que es el dueño de la plantilla (`C-01`).
> **Qué preguntarle al equipo, concreto:** en la lámina M2 del informe, la línea ancha
> debajo del cuadro de cinco columnas, ¿qué decía — el total de campañas de M2, las campañas
> de Salud, u otra cosa?

### P2 · El diagnóstico no distingue config vieja de config mal armada

**Movido acá el 01/08/2026 (`DOC-6` Parte E), desde `PROYECTO.md` §9.** El aprendizaje
quedó en `CLAUDE.md` §4; acá queda sólo la mejora concreta, que es lo que sigue pendiente.

En el Paso 2.1, tres ⚠ y un ✅ engañoso de "Probar lectura por ventana" llevaron a
diagnosticar un bug de seed inexistente: el código estaba bien y lo viejo era **la
planilla**, porque nadie había corrido "Cargar config inicial" después del `clasp push`.

**Mejora, tres líneas:** que `seedConfiguracion()` guarde un `ultima_carga` en `CONFIG` y
que "Probar lectura por ventana" lo muestre. Evita repetir el diagnóstico equivocado cada
vez que cambie un seed. Queda para el próximo paso que toque `Instalar.gs`/`Fuentes.gs`.

### P2 · Pregunta abierta: ¿`looker` ya trae hecho el join que arma `unirDigitalPorCuenta()`?

**Movida acá el 01/08/2026 (`DOC-6` Parte E), desde `PROYECTO.md` §5.** `looker` tiene el
desglose por canal (`MAIL`/`IVR`/`SMS`/`CC`/`DIGITAL`/`ALCANCE`, cada una con su
`ID cuentas`) como solapas propias. Si el join ya viene hecho río arriba,
`unirDigitalPorCuenta()` (Paso 2.4) lo está reconstruyendo al pedo, y puede explicar el
timeout de ~6 minutos de `menuProbarUnionYAnclaje_` (Tarea 7 de AUD-1, sin diagnosticar).

**Una hipótesis alternativa ya quedó descartada** (`docs/AUD-2_union_digital_clave.md`,
Paso 2.7 Parte C): la unión ya va por `*_id_cuenta` en las seis solapas (`Union.gs:81-93`),
nunca por `clave`. El candidato que queda en pie para el timeout es el scoring
`O(realizadas × candidatos)` de `anclarEncuentros()`/`scoreMatchDigitalRdv_()`.

### P1 · Firma de encabezados (de `docs/RDV_otros_ministros_riesgo.md`, congelado)

**La firma de encabezados** — registrar la fila de encabezado de cada solapa mapeada, y
fallar ruidosamente si cambió — es la mitigación general al riesgo de encabezados no
confiables, pero **no está implementada**. Es su propio paso, con su propio test, antes
del `Paso-3-v2` (ver `PROYECTO.md` §7). `diagnosticarBases()` (`Fechas.gs`, DOC-3 Parte B)
ya lee la fila de encabezado de cada solapa mapeada para tipar columnas — la mitad del
trabajo (leer esa fila) queda hecha ahí; falta la otra mitad: guardar la firma y comparar
contra la corrida anterior. `firma_encabezado` ya existe como columna reservada en
`SOLAPAS` (Paso 2.6 Parte E), sin implementar.

### P1 · Pendientes de `DECISION-periodicidad-y-periodos.md` (archivado, DOC-4 31/07/2026)

La decisión de fondo quedó confirmada (`PROYECTO.md` §4: informes semanales por defecto,
ventana definida por la reunión, sin corte diario de datos — ver `VALORES`/
`VALORES_DIVERGENTES`, Paso 2.9H). Quedan sin resolver los detalles finos:

- Si la ventana semanal se deriva automáticamente de la fecha de la reunión (ej. los 7
  días previos) o se carga a mano en la hoja `REUNIONES`.
- Qué columna de fecha usa cada base para filtrar — cruzar con `docs/GRANO_TEMPORAL.md`,
  que ya sostiene que la fecha de la reunión no filtra las filas de canal. **Parcialmente
  contestada** (01/08/2026): las siete filas `fecha_periodo` de `MAPEO` la contestan, pero
  viven sólo en la planilla — ver el P1 de las filas huérfanas de `MAPEO`, arriba.
- Si la ventana cierra el día anterior a la reunión o incluye el día parcial de la
  reunión misma.
- Nombre definitivo del token de estampa de actualización (tipo `{{fecha_actualizacion}}`)
  — pasa a `docs/TOKENS.md` cuando se decida.

### P0 · Verificación real del Paso 2

Los criterios **A1–A10** de `docs/Prompts/VERIFICACION_Paso-2.md` (sobre todo A3–A5:
que `filas_en_ventana` coincida con un filtro manual) no se probaron todavía contra la
planilla viva. Hasta que pasen, el Paso 2 (+2.1, +2.3) no está cerrado del todo.

### P1 · `RUNBOOK.md` describe un proyecto que ya no es este

- Parte A pide `clasp create` para crear el proyecto de cero — ya existe.
- Dice "las 6 hojas + PERIODOS"; `HOJAS_CONFIG_` define 7.
- La tabla de `BASES` no tiene `fila_encabezado` ni `modo_periodo`.
- Parte D manda a correr `Paso-1.6.md` (superado, archivado — ver `Paso-1.6-v2.md`).
- El mapa de archivos omite los prompts 1.6-v2, 1.7, 1.8, 1.8-B, 1.9, 2.1, 2.3 y no
  menciona el episodio de spam de Drive.

Es el único doc con instrucciones ejecutables paso a paso — si algo tiene que estar al
día, es este. No se tocó en `DOC-1` (fuera de alcance: ese prompt no toca código ni
`RUNBOOK.md`).

### P1 · Una instrucción emitida fuera del alcance de un paso desaparece sin dejar rastro

Descubierto en `DOC-5` Parte 2 (31/07/2026): en el mismo mensaje en que se pidió corregir
una línea de `docs/Prompts/DOC-5_orden_documental.md`, se acotó la tarea siguiente a
"D-1, y sólo D-1". La corrección, al quedar fuera del alcance declarado del paso, no se
aplicó — no por descuido de quien ejecutó (hizo lo correcto al no tocar nada fuera de
alcance), sino porque **no existe ningún lugar donde una instrucción así sobreviva entre
pasos.** No hay lista de pendientes-entre-turnos: lo único que persiste es lo que alguien
recuerda y repite en el mensaje siguiente. Sin decidir todavía cómo mitigarlo (¿toda
instrucción que quede fuera de alcance se anota acá mismo, como fila nueva, en vez de
perderse?) — queda registrado como el hallazgo, no la solución.

### P1 · API de pruebas: `llamar` no tiene lista blanca de sólo lectura

**Reescrito el 01/08/2026, con la API ya en uso.** La forma original de este pendiente
—"se sirve la versión desplegada, no `HEAD`"— **no aplica sobre `/dev`**, que sirve el
último `clasp push` por definición. El desfasaje de versión revive el día que el **Paso 6**
publique `/exec`, y ahí vuelve a ser P0; hasta entonces no hay nada que mitigar.

Queda el punto 2, que sí está vivo: **`llamar` puede invocar cualquier función global por
nombre, incluidas las que escriben.** Nada en el código lo impide — sólo la convención.
`API_PROHIBIDAS_` (`Api.gs`) cubre únicamente la recursión (`doGet`, `doPost`,
`manejarPedido_`), no la escritura.

La mitigación —una lista blanca `EJECUTABLES_REMOTOS_`— **se difiere al Paso 6, decisión
del usuario del 01/08/2026**: sobre `/dev` las dos barreras ya exigen una cuenta con
permiso de edición sobre el script, o sea alguien que puede escribir en la planilla de
todos modos, y el riesgo real aparece cuando la URL deje de ser `/dev`.

Consecuencia menor que sigue: no hay marca de versión en el código, así que la cabecera de
corrida de `DIFF_CONFIGURACION` escribe `version_codigo` con un literal que remite a esta
nota, porque no hay qué poner ahí.

### P1 · Las siete filas huérfanas de `MAPEO` son columnas de fecha que ningún `SEED_*` conoce

Abierto el 01/08/2026 desde `docs/PROTOCOLO_2.11-C_corrida_2026-08-01.md`: las siete
`solo_en_hoja` que reportó el diff no son basura de pruebas, son las columnas con las que se
filtra la ventana temporal. Están en `docs/_snapshots/MAPEO_2026-08-01.tsv`, en la fila que
se indica:

```
rdv||RVD JM-CM - ES||fecha                    fila 3     ← caso aparte, ver abajo
rdv||RDV_otros_ministros||fecha_periodo       fila 108
digital||Digital||fecha_periodo               fila 109
digital||Directa Mail||fecha_periodo          fila 110
digital||Directa IVR||fecha_periodo           fila 111
digital||Directa SMS||fecha_periodo           fila 112
digital||Seguimiento digital||fecha_periodo   fila 113
```

Seis consecutivas, cargadas de una vez. **Las escribe `promoverFechasElegidas()`
(`Fechas.gs:378`), no un sembrador** — o sea que la misma hoja tiene dos escritores y sólo
uno declara lo que pone. Es la fila "¿qué *debería* decir esa configuración?" de
`CLAUDE.md` §7 sin dueño, y lo que `docs/ESCRITORES.md` va a tener que resolver.

Contesta además una de las preguntas abiertas de este archivo ("qué columna de fecha usa
cada base para filtrar", en los pendientes de periodicidad): **alguien ya la contestó y la
respuesta vive sólo en la planilla.** Hasta el 01/08 no había ni copia.

**Se abrió como P0 y baja a P1. Verificado contra el código, no se pierde un número en
silencio:**

- `leerFuente()` resuelve la columna con `buscarMapeo(baseId, hoja, 'fecha_periodo')` y, si
  no está, **corta con `«FALTA:fecha_periodo@base/solapa»`** (`Fuentes.gs:367-370`). Falla
  ruidosa, que es el contrato del proyecto.
- Las cinco de `digital` **hoy no se consumen**: `BASES.digital.modo_periodo = 'snapshot'`,
  y en ese modo `leerFuente()` retorna **antes** de buscar `fecha_periodo`
  (`Fuentes.gs:361-365`).
- La fila 3 (`rdv||…||fecha`) es el **contrato viejo derogado**, no una pérdida: el seed
  tiene la misma columna E como `rdv||RVD JM-CM - ES||fecha_periodo` (`Instalar.gs:673`,
  con el comentario de DOC-2 Parte C) y ningún `buscarMapeo(..., 'fecha')` existe en el
  código. Es hermana de las dos filas que sí están marcadas `DEROGADA — ver S-02`, sin la
  marca.
- **La única que un re-sembrado desde cero rompería de verdad es la fila 108**
  (`rdv||RDV_otros_ministros`), porque `rdv` es `modo_periodo = 'filtrar'`. Y rompe fuerte,
  no callado.

Qué falta, entonces: que `SEED_MAPEO_` sea dueño de las filas `fecha_periodo` que hoy
escribe `promoverFechasElegidas()`, o que se declare explícitamente que ese es el otro
escritor legítimo de `MAPEO` y por qué. Hoy no está escrito en ningún lado.

### P1 · Asimetría Estado / Aplicar en las filas protegidas de `SOLAPAS`

Abierto el 01/08/2026, misma corrida. "Aplicar configuración" emite **diez** líneas
`protegida (habría cambiado)`; "Estado de configuración", sobre la misma planilla y en la
misma sesión, **ninguna**.

La causa es de dónde vive cada cálculo: C.2-4 se implementó en
`aplicarClasificacionSolapas_()` (`Instalar.gs:1127-1141`), que sólo corre desde el apply
(`Instalar.gs:1823`). `menuEstadoConfiguracion_()` **reimplementa** la comparación de
`SOLAPAS` por su cuenta (`Instalar.gs:2136-2153`) y ahí una fila `origen = 'manual'` se
saltea con un `return` seco, sin emitir línea. De paso, esa reimplementación compara con
`String()` en vez de `normalizarParaComparar_()`, así que las dos vistas no sólo reportan
distinto: calculan distinto.

**El criterio contrario ya está escrito**, en el comentario de `Instalar.gs:2064` para
`solo_en_hoja`: *"si Aplicar lo va a reportar, Estado tiene que verlo, o las dos vistas
vuelven a no coincidir"*. Es el P0 recién cerrado en versión chica — no fabrica una
discrepancia, pero esconde una que el apply sí muestra.

### P2 · `diagnosticoBases_()` lista solapas `uso = 'ignorar'`

Abierto el 01/08/2026. **Preexistente, no de este paso:** `diagnosticoBases_()` se extrajo
tal cual de `probarConexionBases()` en el Paso 1.8, y se veía poco porque el resultado vivía
dentro de un `alert()`. Con la API devolviéndolo como JSON quedó a la vista.

Enumera `resultado.libro.getSheets()` crudo (`Fuentes.gs:117`) y **nunca consulta
`usoSolapa_()`** (`Config.gs:146`). Salida real del 01/08 (`node tools/api.js bases`): 36
solapas de `rdv`, entre ellas `RVD JM-CM - ES Back Up`, `Copia de Para Revisar`, `Copia de
Para Revisar 1` y siete `Tabla dinámica *`; y en `digital`, `RDV` — el duplicado de la base
`rdv` que `CLAUDE.md` §2 nombra como causa de doble conteo, con `notas` que dicen
literalmente *"⚠ duplica la base rdv — si se lee, hay doble conteo"*.

Son 27 filas marcadas `ignorar` en `SOLAPAS` que el diagnóstico vuelve a poner sobre la
mesa. `CLAUDE.md` §2 es explícito: una solapa `ignorar` no se toca, ni se menciona en un
reporte de hallazgos — la regla existe para no reabrir discusiones ya cerradas. Arreglo:
saltear las `ignorar` de entrada, o marcarlas como tales en la salida en vez de listarlas
como si fueran candidatas.

(Nota al pasar, para que no se busque donde no está: `digital||RDV JM 2 VECES` también
aparece en esa salida, pero su `uso` es `referencia`, no `ignorar`. El duplicado que causa
doble conteo es `digital||RDV`.)

### P2 · La convención `probar_<nombre>()` no está declarada en ningún lado

El lote del 01/08 la cita como "`CLAUDE.md` §5", pero §5 es **Handoffs — dos archivos, dos
dueños**: la convención no aparece ahí ni en ninguna otra sección. Existía sólo como
patrón de nombres suelto (`probarConexionBases`, `probarLecturaPeriodo`), y esos son
smoke tests manuales de menú, no controles positivos con afirmaciones.

Lo implementado en `Pruebas.gs` (una `probar_*()` por parte, que introduce una discrepancia
conocida, afirma que se detecta y no toca la planilla) **funciona y vale como convención**,
pero hay que escribirla donde corresponde: `Plan Inicial/PROYECTO.md` §9 es el dueño de
"convención de proceso o aprendizaje" (`CLAUDE.md` §7). Falta decidir además si se exige
para todo código nuevo o sólo para lo que un protocolo no puede distinguir.

### P2 · Acoplamiento no declarado: formato de escritura del seed ↔ `parsearFechaCelda_`

El sistema hoy funciona porque `parsearFechaCelda_` (`Fuentes.gs:222`) acepta justo los
formatos que los `SEED_*` escriben (ISO `'2026-06-01'`) y los que Sheets devuelve tras
reparsear (`Date`). Nadie declaró ese contrato: si un seed cambia de formato o el parser
se ajusta, la ventana deja de resolver sin que ningún test lo ate. Detectado en C.2-1
(31/07/2026, la hipótesis de degradación de tipo resultó falsa, pero el acoplamiento
quedó a la vista). Dónde declararlo: comentario cruzado en ambos lados o regla propia.

### P2 · El patrón `commit <pendiente>` en `BITACORA.md`

La bitácora se escribe antes del commit del paso, así que el hash queda `<pendiente>` y
depende de que alguien vuelva a completarlo (ya pasó dos veces: `5b72cf4`, `5c2be2e`).
Un `<pendiente>` olvidado deja una entrada sin ancla verificable. Mitigación barata a
decidir: chequeo al cerrar sesión (grep de `<pendiente>`), o completar el hash en el
mismo commit del paso siguiente.

### P2 · Code escribió un handoff en `docs/Sesiones/`, que la regla le prohíbe

`CLAUDE.md` §5 y §7 y `PROYECTO.md` §9 dicen que `docs/Sesiones/` es **solo de claude.ai**
y que "Code no escribe ahí nunca, ni crea archivos nuevos en ese directorio". El
01/08/2026, por pedido explícito del usuario al cerrar sesión, Code escribió
`docs/Sesiones/HANDOFF 2026-08-01.md` (autoría marcada dentro del propio archivo).

La regla existe porque un handoff con **dos autores** fue lo que generó el conflicto de
sincronización que partió el `HANDOFF.md` original — el problema no era el archivo único,
era el doble dueño. Con Code escribiendo ahí, esa propiedad se pierde. A decidir: o la
regla cambia y se escribe (por ejemplo, `docs/Sesiones/` pasa a ser "handoffs de sesión,
de cualquiera de las dos, con autoría declarada en el encabezado"), o los handoffs de Code
van a otro lado. Lo que no puede quedar es la regla diciendo una cosa y la práctica otra.

### P1 · Chequeo periódico: archivos en disco que no están en git

Tiene **dos motivos opuestos**, y el mismo chequeo cubre ambos:

1. **Visibilidad**: claude.ai solo ve lo pusheado. Un archivo sin trackear (o un commit
   sin pushear) es invisible para la otra herramienta — se razona sin tenerlo (caso
   `HANDOFF 2026-07-31-3.md`, que quedó en disco sin commitear).
2. **Fuga**: el repo es público. Un archivo con datos reales que entra al repo sin que
   nadie lo decida es el riesgo inverso y más caro (caso `samples/` — ver `.gitignore` y
   la auditoría G-1c).

Chequeo: `git status --porcelain --untracked-files=all` limpio al cerrar cada paso, y
todo lo commiteado, pusheado.

### P2 · Referencias rotas a `Plan Inicial/*.md` (movidos a `_archivo/` sin actualizar el prompt que los cita)

| doc que referencia | archivo | ubicación real |
|---|---|---|
| `Paso-0-v2`, `Paso-1`, `Paso-3` | `ARQUITECTURA_registros.md` | `Plan Inicial/_archivo/` |
| `Paso-0.5`, `Paso-2`, `Paso-5` | `Periodos_y_campanias.md` | `Plan Inicial/_archivo/` |
| `Paso-1.7` | `M2_mapeo_y_config.md` | `Plan Inicial/_archivo/` |
| `Paso-5` | `docs/CAMPANAS.md` | `Plan Inicial/_archivo/CAMPANAS.md` |
| `Paso-0` | `FUENTES.md`, `PLAN.md` | `_archivo/FUENTES.md` · `_archivo/PLAN .md` (con espacio) |

Plantillas y deck comentado: alcanza con poner los IDs de Drive al lado del nombre
(`1JrHvs_p…` JM · `1_ZKjWhL…` SECCO · `1yIlCIBG…` comentado) — no es un error, solo falta
la referencia.

### ~~P1 · `Paso-2.5` y `Paso-2.13` proponen dos dueños para `MARCADORES`~~ — CERRADO (02/08/2026)

**Reemplaza al P2 "`Paso-2.5.md` se pisa con `Paso-3-v2.md`" (02/08/2026).** Los dos puntos
que tenía —que la tabla de columnas usaba `calculo` en vez de `operacion` y no sembraba
`valor_fijo`, y que no contemplaba que un token de bloque repetible es **una** fila y no una
por instancia— **ya están corregidos** en el reemplazo de `docs/Prompts/Paso-2.5.md`
(commit `1f4a9b5`), verificado contra el archivo. Se cierran acá y no al ejecutar el 2.5:
una corrección delegada a un paso futuro ya se evaporó una vez —la Reconciliación 1 del
`Paso-2.4`— y es lo que dice la regla de `CLAUDE.md` §3.

**Lo que sigue vivo cambió de contraparte y subió de prioridad.** El choque ya no es con
`Paso-3-v2` sino con **`Paso-2.13`**, y es de fondo:

- **`Paso-2.13`** propone `SEED_MARCADORES_`: un arreglo en código como fuente de las filas
  de `MARCADORES`.
- **`Paso-2.5`** propone sembrarlas **desde las plantillas**, leyendo los `{{token}}`.

Son **dos dueños para la misma hoja** — exactamente lo que `docs/ESCRITORES.md` existe para
evitar, y esta vez se ve **antes** de que ocurra, no después. Hoy `MARCADORES` no tiene
ningún escritor de contenido (confirmado por el censo del `AUD-3`), así que el que corra
primero define el contrato.

**Resuelto: gana la plantilla** (`docs/PLAN.md` `D-17`, 02/08/2026). Las filas se siembran
leyendo los `{{token}}` de los Slides (`Paso-2.5`); **`SEED_MARCADORES_` no se hace** y la
Parte 1 del `Paso-2.13` queda sin efecto, anotada en ese mismo archivo. Con el seed en
código, agregar un informe exigía editar un `.gs` — el número que `D-01` mide. La
idempotencia, que era el argumento a favor del seed, la da `upsertSoloVacias_`.

Los dos prompts quedan **desbloqueados**. El argumento completo se conserva en el §0.3 del
`Paso-2.5`, no se borró: es lo que va a hacer falta si alguien reabre la discusión.

### P2 · Contadores que no cierran

- `DISENO_match_temario.md` §2 dice "ocho comentarios más dicen *a definir*" y lista
  diez; §7.4 dice "los 10 comentarios". Ninguna cifra coincide con el archivo real (8
  hilos, ninguno dice eso). **Asignado a `Paso-2.2.md` Parte D.4** — no se corrige acá.
- `MAPEO_completo.md` (ahora congelado) describe Looker como "31 columnas" y detalla 23.
  Queda como imprecisión del relevamiento original; no se corrige en un doc congelado.

### P2 · `SEED_CAMPANAS_EJEMPLO_` ya no describe lo que hay, y `tipo` no lo lee nadie

Detectado en la Parte 0 del `Paso-2.15` (02/08/2026), leyendo `CAMPANAS` viva por API.
Tres cosas, una sola causa — la hoja está fuera de la auditoría de contenido
(`ALCANCE_REGISTROS_`, `auditada: false`) y nada compara sus valores contra el seed:

1. **El nombre del seed miente.** Dos de las tres filas vivas tienen `tipo` editado a
   mano (`destacada` y `encuentro_ministros` donde el seed dice `campana` y `ministros`),
   así que no son "de ejemplo" y no se las puede tratar como descartables. El seed **no se
   renombra** todavía: se anota acá para que nadie lo lea como si describiera la hoja.
2. **Los valores vivos están fuera de la lista declarada.** El comentario de
   `Instalar.gs` sobre `HOJAS_CONFIG_.CAMPANAS` enumera `campana, uno_a_uno, tematico,
   primera_persona, ministros, proveedor`; ni `destacada` ni `encuentro_ministros` están
   ahí. Una de las dos cosas está desactualizada y no sabemos cuál.
3. **`tipo` no tiene ningún lector en el repo.** El único consumidor de `CAMPANAS` es
   `resolverVentana()` (`Fuentes.gs`) y sólo mira `desde`/`hasta`. Mientras siga así, la
   discrepancia es inofensiva; deja de serlo el día que alguien ramifique por `tipo`.

### P1 · El diff no ve los **valores** de `CONFIG`: seis claves pueden divergir del seed en silencio

Demostrado sobre una divergencia real el 02/08/2026 (`Paso-2.15` Parte A), no es una
hipótesis: con `SEED_CONFIG_DEFAULTS_.carpeta_salida` ya en `1LAEVlWZ…` y desplegado, y la
hoja todavía en `1EyTlfg…`, `Estado de configuración` reportó `CONFIG — 6 fila(s), 1 sin
completar` — y ese 1 era la **clave nueva** que faltaba, no la divergencia. La divergencia
no apareció por ningún lado.

Dos mecanismos que apuntan en la misma dirección, los dos en `Instalar.gs`:

1. `seedConfigConfig_()` sólo escribe cuando la celda viva está **vacía**
   (`if ((valorActual === '' || valorActual === null) && valorDefault !== '')`); nunca pisa
   un valor cargado. La auditoría de `menuEstadoConfiguracion_()` usa **el mismo criterio**,
   así que un valor cargado y distinto del seed no es "discrepancia" para nadie.
2. En `ALCANCE_REGISTROS_`, el seed de `CONFIG` son **las claves**:
   `seed: function () { return Object.keys(SEED_CONFIG_DEFAULTS_); }`. Compara presencia,
   no contenido.

**Por qué importa más que un detalle de reporte:** las seis claves son parámetros de
negocio y direcciones de Drive (`carpeta_plantillas`, `carpeta_salida`, `carpeta_motor`,
`informe_activo`, el período, `umbral_anclaje_reunion`). Cualquiera puede quedar apuntando
a otro lado que el código, y el motor va a usar el de la hoja sin que ninguna verificación
lo note. Es una excepción a la premisa con la que se lee el diff —"si da cero, hoja y
código dicen lo mismo"— y no está declarada en ninguna parte fuera de esto.

Convivencia mientras siga abierto: `docs/RUNBOOK.md`, sección "Las carpetas de Drive",
explica cómo cambiar un valor (vaciar la celda y sembrar, o editar a mano y actualizar el
seed en el mismo commit). Eso es la mitigación operativa; **la falta de detección sigue
abierta**. Arreglarlo es decidir qué gana cuando difieren, que es justo la pregunta que
`CLAUDE.md` §7 responde con "es un hallazgo, no gana ninguno" — o sea que lo correcto
probablemente sea **reportar la diferencia sin aplicarla**, como se hace con las filas
protegidas de `SOLAPAS`.

### P2 · `CONFIG.periodo_hasta` cae un viernes; con `R-11` la semana termina el jueves

`CONFIG` vivo tiene `periodo_desde 2026-06-26` (viernes) y `periodo_hasta 2026-07-03`
(viernes): leído inclusive son **ocho días**. `R-11` + su Addendum 1 fijan la semana en
**siete**, viernes a jueves, así que la semana que arranca el vie 26/06 termina el
**jue 02/07**.

**La celda no se toca, y eso no es una omisión: es la regla.** El Addendum 1 dice que
configurar es el caso normal y que lo cargado por una persona manda sobre el default —el
motor no valida lo que un humano escribió—, así que un valor de ocho días es legítimo.
Queda anotado para que nadie lo lea como confirmación de `R-11`: el párrafo "Cómo se
verifica" de la regla lo daba por consistente, y el Addendum 1 lo corrige.

**Respondido el 02/08/2026 (usuario): el `03/07` es arrastre** de cuando el extremo no
estaba definido, no una decisión. Aun así **la celda no se toca**: la corrige una persona,
no el motor — es exactamente lo que dice el Addendum 1 sobre lo cargado a mano. **No
bloquea nada hasta el Paso 3**, que es cuando el cálculo de ventana empieza a usarse.

**Nota sobre el día de corte, para que no se lea como contradicción.** Al escribir `R-11`
se relevaron tres días declarados; con el Addendum 1 quedan reconciliados y **no hay
contradicción abierta**:

| dónde | qué dice | estado |
|---|---|---|
| `R-11` + Addendum 1 | la semana son 7 días, **vie → jue** | vigente |
| `docs/DISENO_match_temario.md` §26 y el temario real | **vie → jue** (vie 24/07 → jue 30/07) | coincide — es la evidencia primaria de la regla |
| `Automatizacion.gs`, encabezado | *"Cada **lunes** genera el informe de la semana cerrada"* | **coherente**: es el día del disparo, no un extremo de la ventana. Con la semana cerrando el jueves, el lunes el período ya cerró |

No hay aritmética de día de la semana en ningún `.gs`: `Fechas.gs` y
`preseleccion_fechas.gs` detectan *columnas* de fecha, no calculan ventanas, y
`resolverVentana()` (`Fuentes.gs`) lee `CAMPANAS`/`PERIODOS`/`CONFIG` sin default propio.
Quien implemente el Paso 10 tiene los tres alineados.

### P1 · `upsertPorClave_` reescribe la fila entera: una columna que el seed no conozca se vacía

Detectado el 02/08/2026 verificando el upsert para la Parte B del `Paso-2.15`. Cuando una
fila **ya existe y tiene algún cambio**, no se actualiza celda por celda: se arma la fila
completa desde el objeto del seed y se pisa entera
(`headers.map(function (h) { return (h in obj) ? obj[h] : ''; })` y después `setValues` sobre
todo el rango, `Instalar.gs`). Una columna que exista en la hoja y **no** esté en el objeto
del seed cae en la rama `: ''` y **se borra**.

**Hoy no puede dispararse**, y por eso es un pendiente y no un bug abierto: las cuatro hojas
que pasan por el upsert (`BASES`, `MAPEO`, `INFORMES`, `PERIODOS`) tienen todas sus columnas
representadas en sus `SEED_*`, y `CAMPANAS`/`REUNIONES` no tienen sembrador automático.

**El disparador concreto, que es lo que hay que evitar:** el día que alguien le ponga
sembrador a `CAMPANAS` —por ejemplo para que `menuCargarEjemplo_()` deje de ser un stub, que
es justo lo que anticipa la nota de `SEED_CAMPANAS_EJEMPLO_`— y ese seed no incluya
`periodo_id`, **la curaduría de período se borra sola en la primera corrida que toque
cualquier otra columna**, sin error y sin aparecer en el diff. Lo mismo vale para cualquier
columna futura de las cuatro hojas ya sembradas: agregar la columna a la hoja sin agregarla
al seed es suficiente.

**Misma clase que el `P1` del diff ciego a los valores de `CONFIG`:** una pérdida silenciosa
esperando un cambio razonable. Ninguno de los dos falla; los dos borran o divergen sin que
ninguna verificación lo note.

Arreglo posible, a decidir: escribir sólo las columnas presentes en el objeto del seed en vez
de la fila completa, o declarar en `ALCANCE_REGISTROS_` qué columnas gobierna cada seed y
fallar si la hoja tiene una que el seed no declara.

> **Addendum 03/08/2026 — "hoy no puede dispararse" es falso, y ya se disparó una vez.**
> El texto de arriba no se altera; lo que sigue lo corrige. Sube a **`P0`**: dejó de ser una
> pérdida hipotética.
>
> **1 · Se disparó, y se puede fechar.** `INFORMES.plantilla_id` llegó al 03/08 vacío en las
> dos filas **aunque `repuntarPlantillaCanonicaJM_` había corrido el 30/07** — la otra mitad
> de esa migración, el renombre de la plantilla obsoleta en Drive, sigue hecha. La celda no
> quedó sin cargar: **se cargó y después se borró**, porque `SEED_INFORMES_` declaraba
> `plantilla_id: ''` y cualquier "Aplicar configuración" reescribe la fila desde el seed. Es
> una variante del mecanismo de arriba, no la rama `: ''`: acá la columna **sí** estaba en el
> objeto, con el valor vacío. **Un seed que declara `''` borra igual que uno que no declara.**
> El bloqueo que tapó a los Pasos 3, 4 y 5 durante cuatro días salió de acá.
>
> **2 · `SOLAPAS` está expuesta hoy, por la rama original.** `aplicarClasificacionSolapas_`
> arma sus objetos con seis claves (`base_id`, `solapa`, `uso`, `origen`, `fila_encabezado`,
> `notas`) y **omite a propósito** `filas_datos` y `firma_encabezado`, que las mide
> `inventariarSolapas()`. El comentario del `Paso-2.11` Parte C dice que omitirlas evita
> pisarlas; **el código dice lo contrario**: la fila se reescribe entera y las omitidas caen
> en `: ''`. La hoja tiene además `filas_crudas`, también omitida. Verificado el 03/08 contra
> el snapshot: las tres columnas están pobladas en las 84 filas. **La próxima corrida de
> "Aplicar configuración" que cambie algo de una fila de `SOLAPAS` borra esas tres celdas de
> esa fila**, sin error y sin diff — el diff sólo compara las columnas que el seed declara.
> No pasó todavía porque hace varias corridas que `SOLAPAS` da *cambiadas: 0*. Medido sobre
> el snapshot del 03/08: de **84** filas de datos, **65** tienen las tres columnas pobladas y
> **66** tienen al menos una — o sea que el daño posible alcanza a casi cuatro quintos de la
> hoja, y son justamente las mediciones contra las bases vivas, que no se recuperan sin
> volver a correr `inventariarSolapas()`.
>
> **Es un test que acierta el hecho y erra la inferencia** (`CLAUDE.md` §4): la omisión de las
> dos claves es real y deliberada, la conclusión de que protege es falsa. Nadie lo verificó
> contra el escritor.
>
> **3 · Qué se hizo el 03/08 y qué no.** Se resolvió **el caso de `INFORMES`**, declarando el
> ID real en `SEED_INFORMES_` — el seed pasa a ser el dueño de la columna
> (`docs/ESCRITORES.md` §2.4). **No se tocó `upsertPorClave_`**: es maquinaria compartida por
> cinco hojas y el arreglo cambia la semántica de todas. Queda para un paso propio, con los
> controles de `Pruebas.gs` corridos. **Mientras tanto, la regla operativa es:** antes de
> agregar una columna a una hoja sembrada, agregarla al `SEED_*` con su valor real — nunca
> con `''`.

### P1 · `m2/Cuentas` tiene `uso = 'ignorar'` y sin embargo está mapeada y auditada

Relevado el 02/08/2026 en la Parte A del `Paso-2.16`. `CLAUDE.md` §2 es explícito: una
solapa `ignorar` **"no se toca nunca. Ni se lee, ni se audita, ni se mapea, ni se
diagnostica"**. `m2/Cuentas` está en `ignorar` desde el `Paso-2.12` Parte 2, con el motivo
escrito en su propia nota —*"mismo universo que digital/Cuentas (3453 filas), que queda como
fuente"*—, que es justo el caso de doble conteo que el invariante viene a evitar. Y sin
embargo:

- **`MAPEO` la mapea, con cinco filas vivas** (`id_cuenta`, `campana`, `estado`, `eje`,
  `area`), presentes tanto en la hoja como en `SEED_MAPEO_`.
- **`Auditoria.gs` la audita**: figura en `SOLAPAS_A_DESCRIBIR_AUD1_`.

**El contraste que lo vuelve difícil de defender:** de las tres solapas que `MAPEO` usa para
`m2`, dos son `referencia` (`M2 periodo DIRECTA` y `M2 periodo DIGITAL`, vistas con período
tipeado a mano) y una es `ignorar` (`Cuentas`). **Ninguna fila de `MAPEO` apunta a una solapa
`fuente` de `m2`** — y la única que `m2` tiene declarada como fuente, `Cuentas M2`
(354 filas, "dimensión de campañas M2"), **no tiene ni una fila de `MAPEO`**.

No se arregla acá: borrar cinco filas de `MAPEO` cambia qué puede leer el motor y hay que
decidir antes si `Cuentas M2` ocupa ese lugar o si `m2` no aporta nada que `digital` no
tenga.

### P2 · La columna U de `Directa Mail` tiene `#REF!` como encabezado

En las dos solapas —`digital/Directa Mail` y su espejo `m2/Directa mail`—, la columna **U**
tiene literalmente `#REF!` en la fila de títulos: una fórmula rota en el encabezado, no en
los datos. Queda registrada en `SOLAPAS.firma_encabezado` de las dos. Hoy es inofensiva
—ningún `MAPEO` apunta a la U de esa solapa— pero cualquier lectura que recorra encabezados
la va a ver como nombre de columna, y `R-10` (normalización de encabezados) no la contempla.
Se corrige en origen, en la base, no en el motor.

### P2 · El empate técnico del match no está implementado en ningún lado

`docs/DISENO_match_temario.md` §6.4 declara que **dos candidatos a menos de 0,05 nunca se
eligen solos**. El código no lo contempla: `Union.gs` tiene un solo umbral y dos ramas, así
que dos candidatos empatados **apenas por encima** del umbral se resuelven eligiendo el
primero que quedó arriba al ordenar — sin marca, sin `pendiente`, sin avisar.

La diferencia con las bandas es que aquélla se cerró y ésta no: el `Addendum 10` de ese
mismo documento (02/08/2026) decidió que **por encima del umbral se acepta solo** —gana el
código—, pero eso no resuelve el empate: justamente convierte el empate arriba del umbral
en una elección automática entre dos candidatos indistinguibles. El costo es el que ya está
escrito en §6.4: *"no es un número mal, es un encuentro entero atribuido a otro barrio"*.

Se decide junto con la implementación de `R-12`, en el **paso del matcher** (`Union.gs`),
que ya va a tocar esa función. *(Corregido el 03/08/2026: hasta hoy esta línea decía "en el
Paso 3". Decisión del usuario — `R-12`, los dos valores de ventana a `CONFIG` y este empate
son del matcher, que no comparte código con el despachador de marcadores, y van en un paso
propio todavía sin escribir. Anotado en `docs/PLAN.md` §2.)*

### P0 · La base `rdv` está compartida como `anyoneWithLink = writer`

Verificado contra la Drive API el 03/08/2026, al confirmar que el acceso de
`reporteseinformesgcba` a las cuatro bases había bajado a Lector. Bajó: **en las cuatro el
permiso explícito de esa cuenta es `reader`**, y en `digital`, `looker` y `m2` la capacidad
efectiva medida (`capabilities.canEdit`) es **`false`**. En `rdv`, **`canEdit` es `true`**.

**El permiso nominal no es el que manda.** `rdv` tiene, además de sus quince permisos
nominales, uno de tipo `anyone`: `{"id":"anyoneWithLink","type":"anyone","role":"writer"}`.
Cualquiera con el link **edita la base**, y eso pisa el `reader` explícito de las cuentas del
motor. La bajada a Lector se hizo y está bien hecha; sobre `rdv` **no cambia nada en la
práctica** mientras exista ese permiso.

**Por qué es `P0` y no una molestia:** el `P0` de direccionabilidad de más arriba se apoya en
la frase *"un ID de Drive no da acceso, los permisos siguen mandando"*. **Para `rdv` esa
premisa es falsa**, y su ID `1ZpHO6Ru…` está en `SEED_BASES_`, en el `RUNBOOK` y en los
snapshots, en un repo público desde el 27/07/2026. No es exposición de lectura: es de
**escritura** sobre la base de encuentros, que es de un tercero (`brianbanderbek`) y la
fuente de todo lo que el motor cuenta de reuniones.

**No se tocó, y no lo puede tocar Code.** `jpcofanogcba1` tiene `canShare: true` sobre `rdv`,
así que técnicamente podría quitar el permiso — pero es un archivo de otra persona, con
catorce colaboradores que pueden estar usando ese link, y sacarlo puede romperle el trabajo a
alguien. **Es una decisión y una acción del usuario, hablada con el dueño de la base.**

Lo mínimo, si el link tiene que seguir existiendo: bajarlo de `writer` a `reader`.

### P0 · El registro automático de plantillas no ve la de JM, y sí ve los backups

Medido el 03/08/2026 al cargar `INFORMES.plantilla_id`. Son **dos fallas independientes que
se suman**, y la combinación de las dos apunta el motor a la plantilla equivocada sin decir
nada. La ruta afectada es la que el `RUNBOOK` Parte D recomienda:
`registrarPlantillasDesdeCarpeta()`, *"Automático (recomendado)"*.

**1 · `JM_marcada` (`117I0qn1…`) es invisible al listado de la carpeta.** No aparece en
`carpeta.getFiles()` desde Apps Script —`diagnosticarCarpetaPlantillas_()` sobre la carpeta
de plantillas devuelve **una sola** presentación, `SECCO_marcada`— ni en `files.list` de la
Drive API, ni filtrando por padre ni buscando por nombre, con la cuenta `jpcofanogcba1`. Y
sin embargo **se abre perfecto por ID**: `files.get`, `DriveApp.getFileById()` y
`SlidesApp.openById()` la devuelven completa (22 slides, 158 tokens distintos), su
`parents` es la carpeta de plantillas y no está en la papelera. Los permisos de las dos
plantillas son equivalentes —`reporteseinformesgcba` dueño, `jpcofano` y `jpcofanogcba1`
como `writer`; JM tiene además a `brianbanderbek`—, así que **no está explicado**. Es del
lado de Google, no del código: se comprobó por dos caminos que no comparten nada más que la
cuenta.

**2 · El recorrido baja a `_backups`, donde vive la plantilla obsoleta.**
`PROFUNDIDAD_MAX_PLANTILLAS_ = 2`, así que `recorrerCarpetaPlantillas_()` entra en las
subcarpetas. La carpeta de plantillas tiene dos: `_backups` —siete presentaciones, entre
ellas `[OBSOLETA — no usar] JM_marcada` y tres backups fechados de cada informe— y
**`Salidas Reportes`**, que es la carpeta de salidas del Paso 4, anidada adentro de la de
plantillas. `matchearInformeId_` matchea por `/JM/i` y `/SECCO/i` sobre el nombre, así que
**todos los backups son candidatos** y el `[OBSOLETA — no usar]` también: el prefijo no lo
excluye de nada.

**La consecuencia, y es la que importa:** hasta hoy `INFORMES.plantilla_id` estaba vacío en
las dos filas. En ese estado, `clasificarArchivoPlantilla_` no encuentra conflicto —el
conflicto lo detecta comparando contra un `idActual` **no vacío**— y **escribe el primero que
matchea**. Como la canónica de JM no se lista y los backups sí, el registro automático
habría cargado `1JrHvs_p…`, la obsoleta, como plantilla de `jm`. Sin error, sin aviso, y el
Tramo 2 entero corriendo contra el deck equivocado.

**Medición del 03/08, ya con las celdas cargadas:** `totalArchivosVistos: 8` (una en la raíz
+ siete en `_backups`; `Salidas Reportes` está vacía todavía), `asignados: 1` (secco, con su
propio ID — reescritura del mismo valor), **`conflictos: 7`**, todos contra backups, cuatro
de ellos de JM. La celda cargada es lo único que hoy separa al motor del error.

**Por qué queda abierto siendo que ya no puede pasar:** la protección es un valor en una
celda, no una regla. Vuelve a estar expuesto en cuanto una celda quede vacía —y el `P1` de
`upsertPorClave_` de más arriba **es exactamente el mecanismo que las vacía**. Los dos
pendientes son el mismo accidente visto desde dos lados.

**Arreglos posibles, a decidir:** que el recorrido **no baje a subcarpetas cuyo nombre
empiece con `_`** o que se limite a profundidad 0; que `clasificarArchivoPlantilla_`
**descarte** los nombres que empiezan con `[OBSOLETA` o que contienen `backup`; que la
carpeta de salidas **deje de ser hija** de la de plantillas; o —lo más barato y lo que ya
está hecho de hecho— que el ID venga del seed y el registro automático quede como
diagnóstico, no como escritor. Ninguno se aplicó: hoy el registro sigue pudiendo escribir.

### P1 · Ningún `.gs` recorre `getTables()` ni `getGroups()`: 33 tokens de JM no se ven

Greppeado y medido el 03/08/2026. `contarTokensDistintos_` (`Armonizar.gs`) —el que alimenta
el `tokensDistintosCount` de `inventarioPlantillas()`— recorre **sólo `slide.getShapes()`**.
Lo mismo el resto del repo: **ninguna función llama a `getTables()` ni a `getGroups()`**.

**El número:** sobre la JM canónica, `inventariarPresentacion_` reporta **158** tokens
distintos y `mapaDeTokens_` —que sí baja a tablas y grupos— encuentra **191**. **Faltan 33**,
y no son marginales: la lámina de M2 es una tabla, y con celdas combinadas (`getCell` tira
excepción sobre una celda combinada que no es la principal, que fue el primer error al
relevarla).

**Qué NO rompe, y conviene decirlo para no sobrerreaccionar:** la armonización está a salvo.
`armonizarPresentacion_` usa `presentacion.replaceAllText()`, que es de toda la presentación
y sí alcanza tablas y grupos. El renombre nunca dependió de este recorrido.

**Qué sí rompe:** **(1)** todo diagnóstico que cuente tokens subcuenta, y el conteo se usa
para decidir si una plantilla está completa; **(2)** el `Paso-2.5`, que va a sembrar
`MARCADORES` desde los tokens de las plantillas — su Parte A **ya pide** recorrer
`getShapes()`, `getTables()` celda por celda y `getGroups()` recursivamente, así que el
prompt está bien y lo que falta es que el helper nuevo lo implemente. Si se implementara
copiando `contarTokensDistintos_`, faltarían 33 filas de `MARCADORES` en JM sin que nada
fallara. **`mapaDeTokens_` ya tiene el recorrido correcto y sirve de base.**

**Los invisibles, uno por uno (03/08/2026), para saber si hay familias nuevas.**

**JM — 33 de 191 (17%):**

| slide | qué es la lámina | tokens |
|---|---|---|
| 5 | Encuentros: alcance semanal | `ecv_barrio1` `ecv_barrio2` `ecv_barrio3` `ecv_barrios` |
| 7 | Benchmark VTR Post RDV | **`camp1` `camp2` `camp3` `camp4`** |
| 18 | Directa: envío de mail | `camp_env1_aud` `camp_env1_fecha` `camp_env1_rem` `camp_env2_aud` `camp_env2_fecha` `camp_env3_aud` `camp_env3_fecha` `camp_env4_aud` `camp_env5_aud` `camp_env5_fecha` |
| 19 | Directa: respuestas | `camp_resp_info` `camp_resp_info_pct` `camp_resp_neg` `camp_resp_neg_pct` `camp_resp_neu` `camp_resp_neu_pct` `camp_resp_pos` `camp_resp_pos_pct` `camp_resp_sol` `camp_resp_sol_pct` `camp_resp_total` |
| 21 | Resumen Ejecutivo | `rrss_c1_pct` `rrss_c2_pct` `rrss_c3_pct` `rrss_c4_pct` |

**SECCO — 48 de 167 (29%), todavía peor:**

| slide | qué es la lámina | tokens |
|---|---|---|
| 5 | Uno a uno en comunas | `ecv_minutos` |
| 10 | Digital: comunicaciones post | **`post_camp1` `post_camp2` `post_camp3` `post_estado1` `post_estado2` `post_estado3`** |
| 22 | Directa: envío de mail | los mismos diez `camp_env*` de JM slide 18 |
| 23 | Directa: respuestas | los mismos once `camp_resp*` de JM slide 19 |
| 25 | Conversación | `conv_menciones` `conv_menciones_var` `conv_sm_pos` `conv_sm_pos_var` `conv_tema1` `conv_tema2` `conv_tema3` `conv_usuarios` `conv_usuarios_var` `conv_vistas` `conv_vistas_var` |
| 28 | Interacción positiva RRSS | `rrss_c1_pct` `rrss_c1_txt` `rrss_c2_pct` `rrss_c2_txt` `rrss_c3_pct` `rrss_c3_txt` `rrss_c4_pct` `rrss_c4_txt` `rrss_prom_general` |

**Dos cosas que aparecen y hay que resolver antes de sembrar:**

- **`camp1`..`camp4` de JM slide 7 no tienen guión bajo.** La regla de familia del `Paso-2.5`
  es *"prefijo hasta el primer `_`; sin `_`, familia = el token entero"*, así que estos
  cuatro caerían en **cuatro familias de un miembro** (`camp1`, `camp2`, `camp3`, `camp4`)
  en vez de en `camp`, que es la familia declarada en `INFORMES.familias` de `jm`. Es la
  primera vez que la regla se topa con un token sin `_`.
- **`post_*` de SECCO slide 10 es una familia que `INFORMES` no declara.** Las familias de
  `secco` son `ecv,et,emin,m2,camp,conv,rep,rrss`: **`post` no está**. O falta en `INFORMES`,
  o los seis tokens deberían llamarse de otra manera.

El resto son familias ya conocidas (`ecv`, `camp`, `rrss`, `conv`). **Ninguno de los 81
tokens invisibles está en `MARCADORES` hoy** — esa hoja tiene tres filas de ejemplo.

### P2 · Dos carpetas de Drive distintas se llaman "Sistema Informes en Slides"

Verificado contra Drive el 02/08/2026 (`Paso-2.15` Parte A). La carpeta de **plantillas**
(`1Q5At-…`, de `reporteseinformesgcba`) y la carpeta donde vive **el motor** (`1EyTlfg…`,
de `jpcofanogcba1`) tienen exactamente el mismo nombre, en Drives distintos, creadas con
menos de dos horas de diferencia el 28/07/2026. **Cualquier documento o instrucción que
las nombre por nombre es ambiguo**: hay que ir por rol o por ID (tabla "Las carpetas de
Drive" en `docs/RUNBOOK.md`). Renombrar una es una acción sobre Drive, del usuario, y
todavía no está decidida.

---

## Preguntas al equipo — abiertas, esperando respuesta humana

> Dueña de la pregunta "¿qué se le preguntó al equipo y sigue sin respuesta?"
> (`CLAUDE.md` §7). No son inconsistencias documentales: son preguntas de dominio que
> nacieron en documentos hoy congelados y necesitan un lugar vivo. Al responderse, la
> respuesta va al documento dueño del hecho y la pregunta se tacha acá.

- Las siete preguntas de `docs/VALIDACION_2026-07-31.md` §7 ("Preguntas para el equipo")
  — siguen abiertas; el detalle está allá, esta línea existe para que no queden
  enterradas en un doc congelado.
- **`digital/Directa Mail`, columna F (`Fecha envio`): ¿se corrigió el año `20206`?**
  `docs/FECHAS_seleccion.md` la marca con ⚠ *"dato erróneo… corregir en origen antes de
  promover"*, y es la columna que el `Paso-2.16` quiere usar para filtrar por período.
  **Medido el 02/08/2026 sobre las 2114 filas vivas: no queda ninguna fecha anómala** —
  2079 filas con fecha, **todas del año 2026**, y 35 sin fecha. Lo que no se puede saber
  desde acá es **si la corrigieron, si borraron la fila o si el envío se recargó**. La
  pregunta es esa, y hasta que se responda la advertencia de `FECHAS_seleccion.md` se
  mantiene escrita aunque hoy no se reproduzca.
- **`R-01` no se cumple hoy: hay 5 grupos con más de un encuentro por (Figura, fecha) en
  `rdv/RVD JM-CM - ES`.** Medido el 03/08/2026 con `verificarPrecondicionAnclaje_()`.
  `R-01` es explícito sobre qué hacer: *"el exceso son duplicados de carga o la regla
  cambió. No se ajusta el cálculo en silencio: se reporta el conteo de violaciones y se
  decide con el equipo"*. Esta línea es ese reporte. **Consecuencia dura:**
  `anclarEncuentros()` **no corre** mientras la precondición falle, así que el matcher está
  bloqueado y con él la parte del Tramo 2 que depende de encuentros anclados.
  **No lo causó la declaración de `D-21` de ese mismo día:** `verificarPrecondicionAnclaje_`
  lee la solapa con `getDataRange()` directo, sin pasar por `leerFuente`, así que ninguna
  lista blanca puede haberlo movido. **Y ahí está la pregunta útil:** cuenta duplicados
  sobre **todas** las filas, incluidas las 709 que `D-21` ahora excluye —642 vacías, 58
  `Suspendida`, 6 `en agenda`, 2 `Reprogramada`, 1 `Se modifico el barrio`—. Si los 5 grupos
  son duplicados entre filas que el matcher nunca va a ver, la precondición está bloqueando
  de más. **Qué falta para responderla:** que la función devuelva **cuáles** son los 5
  grupos, no sólo cuántos. Va con el paso del matcher.

## ~~Nota sobre `Paso-3-v2.md`~~ — CERRADA (03/08/2026)

Su bloque "Antes de empezar" todavía reabre la decisión Looker-vs-SD y el alcance del
corte vertical. **No se toca desde `DOC-1` ni desde este archivo** — está asignado como
Reconciliación 1 de `docs/Prompts/Paso-2.4.md`. Corregirlo acá duplicaría el trabajo y
dejaría a `Paso-2.4.md` describiendo un pendiente que ya no existe.

**Cerrada por reemplazo, no por corrección:** el `Paso-3-v2.md` se archivó en
`docs/Prompts/_archivo/` y lo reemplaza `docs/Prompts/Paso-3-v3.md`, que ya no tiene
bloque "Antes de empezar" — la decisión Looker-vs-SD está en su sección **"Decisiones ya
tomadas — no reabrir"**, con `PROYECTO.md` §5 y `HALLAZGOS_validacion_decks.md` §4 como
respaldo, y el alcance del corte vertical es su Parte D. La Reconciliación 1 del
`Paso-2.4` se queda sin objeto.
