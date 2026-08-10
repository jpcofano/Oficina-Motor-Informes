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

### ~~P1 · Bloqueante de la armonización: la caja `{{m2_salud_camp}}` huérfana~~ — **CERRADO 14/08/2026**

> **Cerrado porque la lámina se retiró**, no porque se resolviera la duda del nombre.
> Decisión del usuario del 14/08: la lámina de la grilla de cinco ejes de M2 **no se usa
> más**. Está **escondida** (`skipped`) en la plantilla canónica, con backup
> `JM_marcada — backup 2026-08-05 16:23` (`1N5Hhp3eXK-Otdb3knEaXHfS0qdGo0diWyinwg_n1n9Q`).
>
> **La lectura correcta era la tercera opción: una caja de TOTAL con nombre de eje.** Lo
> confirman las líneas que van de las cinco cajas de campañas a la caja ancha — es la suma de
> las cinco, no la de Salud. **Eso explica el nombre equivocado**: `m2_camp4` → `m2_salud_camp`
> le puso el nombre del cuarto eje a una caja que los totaliza.
>
> **⚠ Y no era el bloqueante de la armonización que se creía.** `LAMINAS_CONGELADAS_` ya
> excluía la slide 10 desde el 03/08, así que los 16 renombres de M2 **nunca entraban** a la
> armonización — y la canónica **se armonizó igual el 04/08**, con sus 5 renombres aplicados.
> La cadena *"el `P1` bloquea la armonización → la armonización bloquea el sembrado"*
> **estaba rota en el primer eslabón.**
>
> **No se borra la entrada:** el razonamiento de cómo se llegó vale para el próximo caso
> parecido. El texto original queda abajo, sin tocar.

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
>
> ---
>
> **Addendum del 03/08/2026 — con el informe original (24/07–31/07) a la vista, la pregunta
> cambia y esta entrada deja de ser sobre una caja.** El usuario aportó el deck publicado. La
> verificación contra la plantilla es concluyente y **no requiere preguntarle nada al equipo
> sobre el nombre de la caja**: la pregunta ya no es cómo renombrarla.
>
> **A · Están en dos láminas distintas. Ese era el dato que faltaba.**
>
> | | lámina | token | `y` | `x` | `w` | `h` |
> |---|---|---|---|---|---|---|
> | conteo | **slide 9** · *Directa \| Status semanal de M2* | `{{m2_envios}}` (texto `{{m2_envios}}Campañas`) | 84 | 268 | 378 | 24 |
> | lista | **slide 9**, 23 pt debajo | `{{m2_campanias}}` | 107 | 268 | 378 | 24 |
> | caja en disputa | **slide 10** · *M2* | `{{m2_salud_camp}}` | 356 | 100 | 513 | 30 |
>
> **B · La slide 9 ES la lámina del informe real, caja por caja.** El original tiene Mail a
> la izquierda y, a la derecha, una caja de conteo (`12 Campañas`) sobre una caja ancha con
> la lista de nombres — conteo en `x=308 y=120 w=343`, lista en `x=308 y=142 w=343`. La
> slide 9 tiene exactamente esa estructura: **misma `x`, mismo `w`, lista inmediatamente
> debajo del conteo** (Δ`y` 23 en la plantilla contra 22 en el original), y a la izquierda la
> columna de Mail — `Mail`, `Mails entregados`, `Aperturas (OR)`, `Clics (CTOR)`, más un
> `33 envíos` escrito a mano. La correspondencia es de forma, no sólo de contenido.
>
> **C · La grilla de cinco ejes no existe en el informe.** La slide 10 no tiene contraparte en
> el deck publicado. Y acumula **dos** formatos por eje que nadie usó: la grilla visible, y
> los cuatro bloques verticales parkeados fuera del área (punto 6). El informe real resuelve
> M2 con **una lista plana de doce nombres que mezcla ejes** —transporte, salud, espacio
> público, servicios—, sin ningún agrupamiento. La slide 10 agrupa por eje algo que el
> informe no agrupa.
>
> **D · La pregunta ya no es la caja: es la lámina.** `{{m2_salud_camp}}` es una caja de un
> formato que no se usa. Renombrarla —o borrarla, o sacar el renombre— es decidir sobre el
> interior de una lámina cuya vigencia es la pregunta de arriba. **Si la slide 10 se retira,
> el conflicto desaparece entero**: se van con ella `m2_salud_camp` y las veintitantas cajas
> de la grilla, y las dieciséis entradas `m2_*` del diccionario de renombres dejan de tener
> objeto. Si se conserva, recién ahí tiene sentido preguntar qué mide la caja ancha.
>
> **E · Un hallazgo que sobrevive a esa decisión, y es de `docs/TOKENS.md`: los dos tokens de
> la slide 9 dicen lo contrario de lo que llenan.** `{{m2_envios}}` está en la caja del
> **conteo de campañas** (su texto es literalmente `{{m2_envios}}Campañas`, y el conteo de
> envíos está al lado escrito a mano como `33 envíos`), y `{{m2_campanias}}` está en la caja
> de la **lista de nombres**. Es la misma clase de cruce que el `Paso-2.13` Parte 3 documenta
> para `enc_mails_enviados`, y hay que resolverlo aunque la slide 10 se retire: es la lámina
> que sí se usa.
>
> **F · Decidido por el usuario el 03/08/2026: la slide 10 no se toca, y la entrada queda
> abierta a propósito.** La lámina **no se retira y no se corrige ahora**. Si vuelve a
> aparecer en un informe, ahí se decide. Hasta entonces:
>
> - **No se borra la caja** `{{m2_salud_camp}}`.
> - **No se saca el renombre** `m2_camp4`→`m2_salud_camp` del diccionario.
> - **No se aplica el diccionario sobre esa lámina.** `{{m2_salud_camp}}` y la grilla de
>   cinco ejes quedan como están, **con la colisión anotada y sin resolver**.
>
> **Consecuencia operativa — resuelta el 03/08/2026, con un filtro derivado.**
> `armonizarPresentacion_` aplicaba la lista entera de `jm` con
> `presentacion.replaceAllText()`, que es de **toda la presentación**, así que correr
> "Armonizar tokens de plantillas" **tocaba la slide 10** y producía la colisión que esta
> decisión quiere evitar.
>
> **No se resolvió partiendo la lista a mano** —eso deja una segunda lista que nadie
> actualiza—: `filtrarRenombresPorLaminasCongeladas_` **deriva el corte del inventario de la
> plantilla**. Para cada entrada mira en qué slides vive su token de origen y la excluye
> sólo si vive **únicamente** en una lámina congelada. Se recalcula solo cuando la plantilla
> cambia, y el día que la lámina se descongele no hay nada que acordarse de tocar.
>
> **Medido sobre la JM canónica, sin armonizar:** de **21** entradas declaradas, **5
> adentro** (`enc_audiencia`, `enc_audiencia_pct`, `enc_clics`, `enc_audiencia_ivr`,
> `rrss_prom`) y **16 afuera**, todas `m2_*` y todas en la slide 10. **Cero conflictos** —
> ninguna entrada tiene su token de origen dentro y fuera— y **cero sin ocurrencias**: los 21
> tokens de origen existen en la plantilla.
>
> **Dos frenos, los dos a propósito.** `LAMINAS_CONGELADAS_` declara un **testigo**
> (`m2_salud_camp`) que tiene que estar en la slide declarada: si el equipo reordena las
> láminas, el filtro **para y no armoniza** en vez de excluir la equivocada — el número de
> slide solo no alcanza, la misma lámina es la 10 en la canónica y la 11 en la obsoleta. Y si
> una entrada tuviera su token dentro **y** fuera, también para: no se puede excluir sin
> perder el renombre bueno, y no hay opción correcta que el código pueda elegir solo.
>
> *(Corrección de una cifra propia: durante el día esta entrada dijo "veinte de las
> veinticinco" y el `Paso-2.5` dijo "23". La lista tiene **21**. Contadas a ojo, no por el
> código — la nota de método 1 de `docs/PLAN.md`.)*

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

### P1 · Los `enc_*` de `digital` no dan número hasta el Paso 5, y falta media docena por cablear

Anotado el 04/08/2026 al cablear `MARCADORES` contra `digital` (pedido de `m2` v2, Parte D).

**Lo cableado — 9 filas, y las 9 fallan a propósito.** `digital` se lee por
`filasDigitalDeEncuentro()` (`Union.gs`), que necesita el `id_cuenta` **del ítem que se está
emitiendo**, y el despachador todavía no lo recibe: eso es del **Paso 5**, que itera los
ítems. Verificado: las 9 salen `«FALTA:<token>@digital_sin_cuenta»`. **El cableado está
correcto y listo; lo que falta es el iterador.**

**Lo NO cableado, y los tres motivos son distintos:**

1. **El token no existe en la plantilla de JM** — `enc_llamados` (`ivr_llamados`),
   `enc_atendidos_pct` (`ivr_at_pct`), `enc_marque1_pct` (`ivr_marque1_pct`). Medido con
   `mapaDeTokens_` sobre la canónica: la plantilla tiene 21 `enc_*` y ninguno de esos tres.
   `TOKENS.md` §1 ya marcaba *"falta en JM"* para `enc_llamados`. **Cablear un token que no
   está en la lámina crea una fila huérfana**, que es lo que `D-17` evita sembrando desde la
   plantilla.
2. **⚠ El nombre va a cambiar cuando se armonice, y ése es el motivo más importante.** La
   plantilla canónica de JM **no está armonizada** (`⏸ esperando autorización`), así que hoy
   tiene los nombres viejos. Tres casos quedaron afuera por eso:
   - `mail_clics` → hoy la lámina dice `enc_clics`, el canon dice `enc_clics_ctor`;
   - `mail_enviados` → el canon dice `enc_mails_enviados`, pero **hoy esa caja tiene
     `enc_audiencia_pauta`** y `enc_mails_enviados` está en la caja de **Audiencia de IVR**;
   - `ivr_audiencia` → el canon dice `enc_audiencia`, y hoy `enc_audiencia` es la caja de
     **alcance de pauta**, que se renombra a `enc_alcance`.

   Los dos últimos **son el cruce del `Paso-2.13` Parte 3**, visto desde el cableado. Cablear
   con el nombre canónico deja las filas rotas hasta que se armonice; cablear con el nombre
   de hoy las rompe después. **No hay opción correcta mientras la plantilla esté a medio
   camino**, así que se dejaron sin cablear y se anotan acá.
3. **Ambigüedad de origen** — `enc_alcance` tiene **dos** candidatos en `digital`:
   `Digital/dig_alcance` y `Alcance/alc_alcance`. `TOKENS.md` no dice cuál. No se decidió
   solo, como pide el pedido.

**Qué lo destraba:** el punto 2 se resuelve solo cuando corra la armonización de JM; el 1 y
el 3 necesitan al equipo (agregar las cajas, o decidir el origen).

### P2 · `digital/Cuentas` y `digital/CAMPAÑAS_DESGLOCE_DIGITAL` son `fuente` y no tienen ni un campo mapeado

Medido el 03/08/2026 en el `0.6` del pedido de `m2` v2. `digital` tiene **8** solapas
`uso = fuente` y sólo **6** aparecen en `MAPEO`, con 59 campos entre todas. Esas dos no
tienen ninguno.

**No se abrió el mapeo, y es por criterio explícito:** `PLAN.md` §2 fija que **las solapas y
el mapeo que falten se ajustan DESPUÉS de la primera prueba de punta a punta**, no antes. Un
token sin cablear sale como `«FALTA:token»` y queda listado; mapear por adelantado es
trabajar sobre una lista de sospechas — que es lo que midió el `Paso-2.16` cuando fue a
activar `m2` y encontró que no había nada que activar.

**Se anota para que el corte vertical decida si hacen falta de verdad**, no como pendiente a
resolver ya.

### P2 · Desde fuera del motor no se pueden leer las bases: es el token de `clasp`

> **⚠ Corregido el 04/08/2026, el mismo día que se escribió. El título original decía
> "Ninguna verificación independiente puede leer las cuatro bases" y era `P1`. Estaba mal
> atribuido: el hecho medido es correcto, la causa no.** `appsscript.json` del proyecto
> declara **`https://www.googleapis.com/auth/drive`** y
> **`https://www.googleapis.com/auth/spreadsheets`**, los dos completos — **el motor tiene
> permiso de sobra sobre las cuatro bases**. Lo recortado es el token de `clasp`, o sea **la
> vía externa desde el sandbox**, no el acceso del motor. Baja a `P2` porque no limita lo
> que el motor puede hacer: limita desde dónde se lo puede contrastar.

Medido el 03/08/2026 al intentar censar las 12 filas de `rdv` de la ventana. **Es una
limitación de instrumentos, no un bug**, y conviene tenerla escrita porque contradice un
supuesto que el repo venía usando.

`tools/snapshot.js` existe justamente para que el "contra qué comparar" no salga del código
bajo prueba, y funciona — **sobre la planilla de control, que es del robot**. Sobre las
**bases**, que son de terceros y donde `jpcofanogcba1` es sólo **lector**, las tres rutas
independientes fallan:

| ruta | resultado |
|---|---|
| `docs.google.com/.../htmlview` (descubrir `gid`) | **HTTP 404** |
| `docs.google.com/.../gviz/tq?tqx=out:csv&sheet=…` | **HTTP 404** |
| Drive API `files/{id}/export?mimeType=text/csv` | **HTTP 403** — *"the user has not granted the app read access to the file"* |

**La causa es el alcance del token, no el permiso de la cuenta.** Los scopes de
`~/.clasprc.json` son `drive.file` + `drive.metadata.readonly`: el primero sólo cubre
archivos que la app creó o abrió, y el segundo sólo metadatos. Falta `drive.readonly` o
`spreadsheets.readonly`. Por eso `files.get` responde y `files.export` no.

**Consecuencia práctica, ya con la causa bien puesta:** todo lo que se sepa de las cuatro
bases sale hoy **del motor**, por `/dev`. Para las hojas de registro hay dos caminos —el
motor y `tools/snapshot.js`—; para las bases, **uno solo**.

**Y la objeción de "el motor confirmándose a sí mismo" es más chica de lo que parecía.**
Apunta a **`leerFuente`**, no a Apps Script: un `getValues()` directo sobre la solapa no pasa
por `leerFuente`, ni por su normalización, ni por `modo_periodo`, ni por la lista blanca de
`D-21`. Para un censo crudo eso es **más** independiente que un export, porque
`leerFuente` justamente **colapsa** vacía, cero explícito y texto no numérico en un solo
caso. Es lo que hizo el censo del `−54` (Parte D del addendum del 03/08).

**Qué lo destraba, si alguna vez hace falta la vía externa:** agregar `drive.readonly` a la
autorización de `clasp` —re-autorizar una vez—. **No se hizo:** ampliar el alcance de un
token es una decisión sobre credenciales, y hoy no bloquea nada.

### P2 · La inferencia de solapa de `looker` funciona porque `MAPEO` está incompleto

Anotado el 03/08/2026 en el mismo commit que crea la fila que depende de esto
(`prueba_alcance`, cableado del corte vertical).

`solapasFuenteDeBase_` (`Generador.gs`) cruza **`uso = fuente` ∩ presente en `MAPEO`**, no
`fuente` sola. Medido: `looker` tiene **7** solapas `fuente` en `SOLAPAS`
(`resumen_metricas_dinamico`, `MAIL`, `IVR`, `SMS`, `CC`, `DIGITAL`, `ALCANCE`) y **una
sola** en `MAPEO`. Por eso `prueba_alcance` puede llevar la solapa vacía y resolverse.

**La inferencia funciona hoy porque el mapeo está incompleto, no porque la base tenga una
sola solapa.** El día que alguien mapee una segunda solapa de `looker` —algo perfectamente
razonable y que nadie pensaría como un cambio riesgoso—, `prueba_alcance` **pasa a fallar
con `«FALTA:@sin_solapa»` sin que nadie haya tocado ese marcador**. El acoplamiento es real
y va en la dirección incómoda: completar configuración rompe un marcador que andaba.

**Qué NO es:** un bug de `solapasFuenteDeBase_`. El cruce con `MAPEO` es correcto y
necesario —`m2/Cuentas` es una solapa `ignorar` que sin embargo está mapeada, y contarla
rompería otra cosa—. Lo frágil es **apoyar un marcador en una inferencia**, no el criterio
con que se infiere.

**Qué hacer, cuando haya que decidirlo:** o la solapa se declara explícita en todo marcador
—y la inferencia queda como comodidad de diagnóstico, no como cableado—, o `MAPEO` declara
cuál es la solapa **por defecto** de cada base, que es un dato y no una deducción.
`docs/TOKENS.md` §4 ya avisa de esto para `rdv` (*"aplica a menos bases de las que
parece"*); acá queda medido para `looker`.

**Hoy no bloquea nada:** el único marcador que depende de la inferencia es `prueba_alcance`,
que es andamiaje del corte vertical y se retira al cerrar la Parte D.

### P2 · `informe_id = '*'` en `MARCADORES` está soportado y hoy no lo usa nadie

Anotado el 03/08/2026 **antes de retirar** las tres filas de ejemplo de `MARCADORES`, porque
es lo único que se pierde con ellas.

`resolverMarcadores` (`Generador.gs`) acepta `informe_id = '*'` con el significado **"vale
para todos los informes"**: filtra `suyo === informeId || suyo === '*'`. Dos de las tres
filas retiradas lo usaban —`ecv_inscriptos` y `camp_alcance`, esta última con la nota
literal *"* = compartido"*—, así que la capacidad **estaba en uso y ahora queda sin ningún
caso vivo**. El código no se toca: sacarlo sería resolver por borrado algo que todavía no se
decidió.

**Por qué importa y no es trivia:** `'*'` es exactamente la firma que el `Paso-2.13` Parte 3
manda vigilar. Su guardarraíl dice que si un `marcador` aparece con `informe_id = '*'` **y**
con un `informe_id` concreto, es un cruce a medio resolver. Y hay cruces reales conocidos
—`enc_mails_enviados`, y el par `m2_envios`/`m2_campanias` medido el 03/08—: para esos,
`'*'` **no se puede usar**, porque el mismo nombre significa cosas distintas en JM y en
SECCO.

**Lo que queda por decidir, cuando `MARCADORES` tenga filas reales:** si `'*'` se conserva
como forma de declarar un token compartido —cómodo, y ahorra duplicar filas— o si se retira
en favor de una fila por informe siempre, que es más verboso pero hace imposible el cruce
silencioso. Hoy no hay evidencia para elegir: no hay ni un token compartido cableado.

### P2 · `armonizarPresentacion_` reemplaza con `replaceAllText`, que es global por diseño

Anotado el 03/08/2026 al derivar el filtro de láminas congeladas. **No se hace ahora.**

`presentacion.replaceAllText(viejo, nuevo, true)` opera sobre **toda la presentación**: no
tiene forma de acotarse a una lámina. Es la razón por la que congelar una sola lámina obligó
a construir un filtro que decide **qué entradas se le pasan** en vez de **dónde escribe**.
El filtro funciona y se deriva del inventario, pero es un rodeo: acota por token, que es una
aproximación a acotar por lámina. Coinciden mientras cada token viva en una sola lámina — y
el propio filtro tiene que parar y avisar cuando no.

**La solución de fondo es escribir por `objectId`**, con `Slides API` o recorriendo los
`PageElement` y reemplazando en el `TextRange` de cada uno. Con eso el alcance es una
propiedad de la llamada y no una consecuencia de qué lista se armó: se puede decir
"renombrá esto en estas láminas" sin filtros derivados, sin testigos y sin el caso de parada.

**Y no es trabajo perdido:** `D-06` etapa 2 ya exige el mapa `token → objectId` para poder
actualizar un deck en sitio, y el `Paso-4` lo tiene que registrar al generar. El día que ese
mapa exista, la armonización puede usar el mismo mecanismo. **Conviene hacerlo después del
Paso 4, no antes** — ahí el costo ya está pago.

### P1 · Falta una operación que devuelva una **lista** de valores, no un número

Detectado el 03/08/2026 al verificar la lámina M2 contra el informe original. Las seis
operaciones que declara el `Paso-3-v3` —`SUMA`, `CONTEO`, `ULTIMO`, `RATIO`, `PCT`, `TEXTO`—
**devuelven todas un escalar**. Ninguna cubre el caso de una caja que **enumera**: toma las
filas de la ventana y concatena un campo de cada una.

**`TEXTO` no sirve para esto y conviene decirlo explícito**, porque el nombre invita a
confusión: lee un **literal** de la columna `valor_fijo`. No mira los datos. Una lista que
cambia todas las semanas no puede vivir en `valor_fijo` — sería curaduría manual disfrazada
de configuración, y volvería a poner un dato derivable en una celda que alguien tiene que
acordarse de actualizar.

**El caso que la obliga, confirmado contra el informe publicado:** la lámina *Status semanal
de M2* tiene una caja de conteo (`12 Campañas`) sobre una caja ancha con **los doce nombres
de campaña**. El conteo es `CONTEO`; la lista no tiene con qué resolverse.

**Los candidatos, para que se diseñe una sola vez.** Dos confirmados y dos plausibles:

| token | plantilla · lámina | caja | veredicto |
|---|---|---|---|
| `m2_implementaciones` | SECCO slide 14 | `x308 y129 w343`, debajo del conteo | **confirmado** — es la caja de la lista del informe |
| `m2_campanias` | JM slide 9 | `x268 y107 w378`, debajo del conteo | **confirmado** — misma caja, nombre cruzado (ver abajo) |
| `ecv_barrios` | JM slide 5 | `Barrios impactados: {{ecv_barrios}}` | **plausible, sin confirmar** — convive con `ecv_barrio1/2/3`, así que puede ser el **conteo** y los otros tres los nombres. `TOKENS.md` los lista juntos y ya los marca *"⚠ revisar posiciones"* |
| `rep_p2_temas`, `rep_p3_temas` | SECCO slide 27 | *Repercusiones en X* | **plausible, sin confirmar** — el nombre es plural |

**Y hay un patrón alternativo conviviendo, que es la razón por la que esto no es obvio:**
varias láminas resuelven lo mismo con **una caja por ítem** en vez de una que enumera —
`ecv_barrio1-3`, `conv_tema1-3`, `post_camp1-3`, `camp_env1-5`, `rrss_area1-10`,
`m2_camp1-5`—. Esos **no** necesitan la operación: cada caja es un valor. La operación nueva
sirve al otro patrón. Antes de diseñarla conviene mirar los dos, porque el mismo dato
aparece de las dos formas en plantillas distintas.

**Qué hay que decidir al implementarla** (no ahora): el separador, el orden de los ítems, y
qué pasa cuando son demasiados para la caja — truncar con "y N más", o dejar que la caja
crezca y desarme la lámina. Un `«FALTA»` no cubre este caso: la lista puede venir vacía
legítimamente.

**Dueño: el Paso 3**, que es quien implementa las operaciones (`Paso-3-v3` Parte A). Se anota
acá y no en el prompt porque el prompt no se edita una vez entregado; al ejecutarlo, sale
como operación nueva o como addendum.

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


> **Reubicados el 06/08/2026, sin cerrar ni reabrir ninguno.** Los ocho que siguen venían
> colgando de `## Preguntas al equipo` — se habían ido agregando debajo de su última viñeta y
> quedaron adentro de esa sección sin serlo. Ninguno espera respuesta humana: son trabajo con
> el dato ya medido. **Prioridades intactas.**

### P2 · `DISTINCT` no existe como operación, y `ecv_barrios` la necesita

Las seis operaciones del motor son `SUMA` · `CONTEO` · `ULTIMO` · `RATIO` · `PCT` ·
`TEXTO`. **`ecv_barrios` —la cantidad de barrios distintos de la semana— no se puede
expresar con ninguna**, y por eso quedó sin cablear en la corrida del 05/08 aunque su
columna sí existe (`rdv/RVD JM-CM - ES/barrio` → B en `MAPEO`). El dato está; falta la
operación.

**⚠ Esto NO es lo mismo que los tres `[MANUAL]` de `CONFIG_INFORMES.md` §1.4, y no se
archiva junto a ellos.** §1.4 declara manuales a **`ecv_barrio1-3`** y **no menciona
`ecv_barrios`**. Los tres primeros son una **decisión editorial** —alguien elige qué
barrios destacar—; éste es un **hueco técnico**. Confundirlos hace desaparecer el
pendiente: quedaría "resuelto" por una decisión que nunca lo abarcó.

`P2` y no `P1`: bloquea **un token**, no una sección. La sección 1 cerró igual.

> **Medido y no implementado — 07/08 (`N7` / `T2.5`).** El prompt de la corrida nocturna mandaba
> empezar por el formato de porcentaje —hecho— y **anotar y seguir** lo que necesitara una
> decisión. Esto la necesita, y no es una sola:
>
> 1. **Qué devuelve con cero filas.** El precedente del proyecto está partido a propósito:
>    `SUMA` sobre cero filas da `sin_datos`, `CONTEO` da `0`. Una lista se parece a las dos: es
>    un agregado (como `SUMA`) pero su "vacío" es representable (como el `0` de `CONTEO`).
>    **Nadie decidió cuál sigue.**
> 2. **Con qué separa.** `", "`, `" · "`, salto de línea. Lo ve el lector del deck, así que es
>    editorial.
> 3. **En qué orden.** Alfabético, o el de aparición en la base.
> 4. **Cómo deduplica.** `R-10` normaliza espacios **preservando mayúsculas y acentos**, así
>    que `Palermo` y `palermo` serían dos barrios distintos. Para un `DISTINCT` de barrios eso
>    es probablemente lo que **no** se quiere, y es la única de las cuatro donde una regla
>    escrita empuja en contra del comportamiento deseable.
> 5. **Qué pasa si no entra en la caja.** Quince barrios no entran en una línea de la lámina 5.
>
> **Y hay una quinta pregunta que precede a las otras:** `ecv_barrios` está descrito en el deck
> como *"Barrios impactados"*, y sigue sin confirmarse si es **el conteo** —que sería un
> `CONTEO` sobre valores distintos, no una lista— o **la lista de nombres**. Si es el conteo,
> `DISTINCT` no necesita devolver lista y las cuatro decisiones de arriba desaparecen.
> **Esa es la que hay que responder primero.**

> **Respondida — decisión del usuario, 07/08/2026: `ecv_barrios` es una LISTA.** Los barrios
> alcanzados en la semana, `DISTINCT`. No es un conteo. Con eso, las cuatro decisiones
> quedan así:
>
> | | estado |
> |---|---|
> | **1 · qué devuelve con cero filas** | **resuelta por precedente, no por decisión nueva.** Una lista es un agregado, como `SUMA`, y `SUMA` sobre cero filas da `sin_datos` — no `0` ni `""`. Un `""` en la lámina se lee como "ningún barrio", que es una afirmación que el motor no midió |
> | **2 · con qué separa** | **abierta.** `", "` es lo natural para una enumeración en castellano, pero lo ve el lector del deck y es editorial |
> | **3 · en qué orden** | **abierta.** Alfabético o el de aparición. Alfabético es reproducible entre corridas; el de aparición no |
> | **4 · cómo deduplica** | **abierta, y es la que tiene una regla en contra.** `R-10` normaliza espacios **preservando mayúsculas y acentos**, así que `Palermo` y `palermo` serían dos barrios. Para nombres de barrio eso es casi seguro lo que **no** se quiere, y `normalizar_` (`Parseo.gs`) —que sí pliega case y acentos— existe justo para matchear texto libre. **Elegirlo es apartarse de `R-10` para un caso, y eso se escribe con el motivo** |
> | **5 · qué pasa si no entra en la caja** | **abierta.** Quince barrios no entran en una línea de la lámina 5 |
>
> **Quedan cuatro decisiones editoriales y ninguna técnica.** `DISTINCT` no se implementó: sin
> la 2 y la 4 lo que devuelva es una apuesta.

> **✅ CERRADO — 07/08/2026. Las cinco decisiones tienen dueño y `DISTINCT` puede escribirse.**
> Acá sólo los punteros; el texto vive en su dueño y no se repite.
>
> | decisión | dónde se lee |
> |---|---|
> | 1 · qué devuelve con cero filas | **`R-18`** punto 6 |
> | 2 · con qué separa | **`CONFIG_INFORMES.md` §1.4** — y hoy **no se usa**: una caja por barrio |
> | 3 · en qué orden | **`R-18`** punto 5 — alfabético, por reproducibilidad |
> | 4 · cómo deduplica | **`R-18`** punto 1, con el límite de `normalizar_` escrito |
> | 5 · qué pasa si no entra en la caja | **`CONFIG_INFORMES.md` §1.4** — no se trunca; es problema de plantilla |
>
> **Y una sexta que no estaba en la lista:** de dónde sale **la forma publicada**. `R-18` punto
> 2 la fija en el **catálogo canónico** —la solapa `Comunas` de `rdv`, vía `parsearBarrio_`—,
> no en el texto de la celda. **Eso supersede a la decisión del mismo día** que decía *"se
> publica el valor tal como está escrito en la celda"*: se tomó sin saber que el catálogo
> existía. Y `R-18` punto 3 agrega qué pasa con lo que no matchea — **`REVISAR` y faltantes,
> nunca crudo y nunca en silencio**.
>
> **⚠ La corrección que más vale de este pendiente: la frase sobre `R-10` era falsa.** El
> punto 4 de arriba decía que era *"la única de las cuatro donde una regla escrita empuja en
> contra del comportamiento deseable"*, y que elegir `normalizar_` era **apartarse de `R-10`
> para un caso**. **No hay de qué apartarse.** Medido el 07/08 transcribiendo su enunciado:
> `R-10` rige **encabezados de columna**, y el segundo "valor" que menciona es el de `MAPEO`,
> que también es un nombre de columna. **No alcanza a los valores de celda.**
>
> **Por qué se creyó que había conflicto, que es lo que vale más que la frase limpia:** `R-10`
> dice *"preservando mayúsculas y acentos"* y eso se leyó como una política general de
> normalización del proyecto, cuando es la política **de un problema puntual** —quince pares de
> encabezados reales colisionan si se pliega el case—. **Una regla que resuelve un problema no
> declara una doctrina.** El error fue leerle un alcance que su enunciado nunca tuvo. `R-18`
> lo dice explícito para que no vuelva a pasar.
>
> **Hallazgo de consistencia, anotado y no arreglado (07/08/2026):** el camino al catálogo está
> hardcodeado en el llamador. `catalogoBarriosDesdeBase_(baseId, nombreHoja)` es agnóstica
> —recibe los dos por parámetro— pero su **único llamador**, `Union.gs`, le pasa `'rdv'`
> literal y la constante de módulo `HOJA_COMUNAS_RDV_ = 'Comunas'`. Ni el comentario de
> `Parseo.gs` —que sugiere que sale de la fila de `BASES`— ni la constante son toda la verdad:
> **la lista de barrios no está hardcodeada, pero sí dónde buscarla.**
>
> **Y una consecuencia dura para quien implemente `DISTINCT`: un marcador NO alcanza `Comunas`
> por el camino normal.** Está registrada en `SOLAPAS` como **`referencia`**, y `buscarMapeo`
> exige `uso = 'fuente'` — medido: devuelve `«FALTA:barrio@solapa_no_fuente(rdv/Comunas)»`. La
> implementación tendrá que llamar a `catalogoBarriosDesdeBase_` como hace `Union.gs`, **no
> declarar el catálogo en `MAPEO`**. Eso es correcto —`Comunas` es referencia, no fuente— pero
> hay que saberlo antes de escribir la operación.
>
> **Y el `{{ecv_barrio}}` singular de la lámina 6** (`Estrategia de comunicación:{{ecv_barrio}}`)
> es un **token distinto** de los cuatro de la lámina 5, y tiene su propio pendiente por el
> problema de prefijo. Se anota acá para que nadie lo confunda con `ecv_barrio1`.


### P2 · Falta un formato "unidades de porcentaje sin signo"

El formateador tiene `porcentaje` (asume unidades de porcentaje y **agrega** el `%`) y
`fraccion` (asume 0–1, lo lleva a unidades de porcentaje y **no** agrega el signo). Falta
la cuarta celda de la matriz: **unidades de porcentaje, sin signo**.

Se manifestó el 05/08 con los cinco `ecv_insc_*_pct`: la caja de la plantilla ya trae su
propio `%` —`{{ecv_insc_mail}}({{ecv_insc_mail_pct}}%)`— así que `porcentaje` habría
impreso `59.5%%`, el mismo bug que el formato `fraccion` arregló el 04/08. **Se cablearon
con `numero`, y funciona** —el deck dice `(59.54%)`— pero por elección de un formato que
**no describe el dato**: `numero` no dice que eso sea un porcentaje.

**No cambiar el cableado**: anotar el hueco. Cuando exista el formato, son cinco celdas.

> **El formato existe desde el 07/08 (`N7` / `T2.5`) — pendiente de verificación humana.**
> `porcentaje_sin_signo`: entrada ya en unidades de porcentaje, **un** decimal, sin el signo.
> Cierra el 2×2 de unidad de entrada × lleva el signo.
>
> **Y el cableado sigue sin cambiar, a propósito.** Cambiar `formato` en esas filas **cambia
> el deck**: `mail_or` pasaría de `25.42` a `25.4`. Es lo que corresponde —el resto de la
> lámina muestra un decimal, y `numero` estaba mezclando dos precisiones— pero es una
> **decisión sobre números publicados** y la corrida nocturna del 07/08 tenía prohibido
> cablear. Van a la cola del usuario.
>
> **Las nueve celdas** (`MARCADORES.formato`: `numero` → `porcentaje_sin_signo`):
> `ecv_insc_mail_pct`, `ecv_insc_cc_pct`, `ecv_insc_ivr_pct`, `ecv_insc_digital_pct`,
> `ecv_insc_dif_pct`, `enc_e75_pct`, `mail_or`, `gcba_mail_or`, **`ivr_at_pct`**. *(Nueve y no
> cinco: las notas del 05/08 contaban sólo los `ecv_insc_*`; el sembrado del Resumen Ejecutivo
> agregó `mail_or`, `gcba_mail_or` e `ivr_at_pct`, y `enc_e75_pct` ya estaba.)*
>
> **Las nueve verificadas caja por caja contra el deck**, no supuestas — el primer intento dejó
> `ivr_at_pct` afuera dando por sentado que su caja no traía signo, y la caja dice
> `Atendidos: «FALTA:ivr_atendidos» («FALTA:ivr_at_pct»%)`. Las nueve traen su propio `%`, así
> que las nueve deben ir sin signo. **Si aparece un `PCT` nuevo, se mira la caja antes de
> elegirle el formato.**


### P1 · `generarInforme` no vuelve, y hace tres corridas que no se verifica nada de punta a punta

**El síntoma:** el intento del 13/08 murió en el **timeout de 540 s** de `tools/api.js`, y el
reintento dio `ECONNRESET`. Antes hubo HTML 404 y otros `ECONNRESET`. **La respuesta vuelve
más o menos una de cada cuatro veces**, y a veces el motor **tampoco llega a registrar la
corrida** en `CORRIDAS` — o sea que no es sólo el transporte.

**La consecuencia concreta, que es lo que lo hace `P1`:** el arreglo de `SUMA` sobre cero
filas (13/08) está probado **contra la función** y **nunca contra un deck**. Los 16 ceros
falsos siguen sin confirmarse como corregidos.

**El candidato ya identificado:** el scoring del anclaje es `O(realizadas × candidatos)`.
Pero **el anclaje solo tarda 93 s medidos**, y la generación completa tardaba ~250 s cuando
volvía: **hay ~450 s en otro lado** que nadie midió. El próximo paso es cronometrar las
etapas por separado, no optimizar a ciegas.


### P1 · `{{enc_audiencia}} → {{enc_alcance}}` no se debe aplicar nunca

Es el único renombre de `RENOMBRES_ARMONIZACION_POR_INFORME_.jm` que todavía tiene origen en
la plantilla, y **aplicarlo sería un error**: el destino `enc_alcance` **ya existe en la misma
slide 6**, así que crearía **dos cajas con el mismo token** — la regresión de `enc_audiencia`,
ya conocida.

**Y la ocurrencia que queda es legítima, no un resto sin renombrar.** `enc_audiencia` está
cableado en `MARCADORES` a `ivr_audiencia`: es la audiencia de IVR, que es **otra cosa** que
el alcance de pauta.

`P1` y no `P2` porque **una armonización futura puede intentarlo de nuevo sin saberlo**: la
entrada sigue en la lista de renombres y nada en el código la marca como no aplicable.


### P2 · `rrss_area1` aparece en dos cajas de la slide 21

Colisión viva de tokens en la plantilla canónica de JM, medida el 14/08 con `mapaDeTokens_`.
**No bloquea nada**: ningún renombre del diccionario la toca, así que la armonización no la
puede empeorar.

Hoy figura sólo en una lista vieja de familias numeradas, que **no es lo mismo que estar
anotada**: ahí se lee como un token más y no como dos cajas que comparten nombre.


### P2 · `enc_e75_pct` da 38,74 contra el 39% publicado — **no es un error, no se ajusta**

27.599 / 71.234 = **38,74%**, y el informe publicado **redondea a entero**. Es el mismo
número con más precisión.

**Queda anotado para que nadie lo "arregle" más adelante:** cambiar el cálculo para que dé 39
sería ajustar un número para que cierre, que es justo lo que el proyecto no hace.


### P1 · El score de anclaje saturó, y el circuito de confianza nunca se probó

**Anotado el 11/08 por decisión del usuario, antes de arrancar el objetivo de los once
números: primero eso, después esto.** No se implementa nada acá; queda escrito para retomarlo.

**Los cinco anclajes dan `1,00` exacto** desde que la fecha entró al score (10/08). **Un
score saturado no ordena:** si dos candidatos tienen barrio y fecha correctos, empatan en el
techo, y el techo no distingue al bueno del casi-bueno.

**En ese empate actúa el desempate temporal del 09/08 y el motor elige solo.** Eso
**contradice la regla del usuario** —*cuando la confianza no alcanza se pregunta y el usuario
elige*— y es exactamente el modo de falla de `3347`, que sobrevivió tres semanas porque el
número parecía razonable.

**El circuito de pregunta está entero y nunca corrió de punta a punta:**

- `ANCLAJE_PENDIENTE` registra el top-3 (`registrarAnclajePendiente_`);
- el motor **lee** la columna `elegido` en la corrida siguiente y **no pisa la decisión
  humana** (`anclajeYaConfirmado_`);
- el umbral sale de `CONFIG.umbral_anclaje_reunion`, no del código (Paso 2.9F).

**Nunca se ejecutó porque ningún caso cayó bajo umbral.** La hoja está vacía —sólo el
encabezado— desde que existe.

**Qué haría falta:** que el score **ordene en vez de saturar**; que un empate real vaya a
`ANCLAJE_PENDIENTE` **en vez de resolverse por proximidad**; y **probar el circuito completo
con un caso forzado**, que es la única forma de saber que funciona.


### P2 · `ecv_barrio` no puede usarse como prefijo de familia

`ecv_barrio` es **prefijo literal** de `ecv_barrio1`, `ecv_barrio2` y `ecv_barrio3`, y
`tokenEsDeFamilia_` compara con `indexOf(f) === 0`. Cualquier `familia_tokens` que declare
`ecv_barrio` **se lleva los cuatro tokens**, no uno.

Ya está como comentario en `Instalar.gs`, arriba de `ecv_alcance_semanal`, pero queda
también acá **porque es una trampa que se va a repetir**: la misma forma tienen
`camp_bench_` vs `camp_bench_remitente`, y `m2_` contra cualquier `m2_algo`. El día que
alguien escriba una familia con un token completo adentro, va a capturar de más **en
silencio** — no rompe, arrastra.


### ~~P1 · El denominador de la plantilla JM: 195 en la corrida contra 172 en el mapa~~ — CERRADO (06/08/2026)

**La explicación, que faltaba.** `mapaDeTokens_` excluye las láminas escondidas desde el
16/08; las tres funciones que usaba `generarInforme` —`mapaTokenObjectId_`, `tokensPorSlide_`
y `tokensDeSlide_`— **no miraban `isSkipped()`**. `grep` sobre todos los `.gs` devolvía **una
sola** llamada a `isSkipped()` en el repo, adentro de `mapaDeTokens_`.

**La diferencia son exactamente los 23 tokens `m2_*` de la lámina 10**, escondida el 14/08 con
backup y a propósito: `195 − 23 = 172`. La lista está en el reporte de `mapaDeTokens_`
(`tokens_en_laminas_escondidas`).

**No era teórico.** La corrida `jm-20260806-210540` dejó 195 filas en `FALTANTES`, **31 de
ellas `m2_*`**, con los 23 de la lámina escondida entre ellas: la corrida los resolvía, los
pintaba sobre una lámina que no se emite y los listaba como deuda.

**Cerrado por el prompt `2026-08-06_12`** (`9607a3b`): `esLaminaEscondida_` queda como la
única llamada a `isSkipped()` del repo; el filtro va adentro de `mapaTokenObjectId_` —único
llamador, la etapa 2— y en los dos puntos de llamada de `tokensPorSlide_` en `Generador.gs`,
vía `tokensVisiblesDe_`. **`tokensPorSlide_` no se tocó**: sus otros dos consumidores
—`filtrarRenombresPorLaminasCongeladas_` y `tokensSinCablear_`— inventarían y necesitan ver
todo.

**Dos efectos esperados, para que nadie los lea como regresión:**

1. **Un marcador cuya única caja vive en la lámina escondida va a empezar a aparecer en
   `cableados_sin_caja_en_plantilla`.** Es correcto y es información: la fila de `MARCADORES`
   existe y no tiene dónde escribirse *mientras la lámina esté escondida*.
2. **El `mapa_tokens` que se guarda en `CORRIDAS` deja de traer los `objectId` de la lámina
   escondida.** Para la **etapa 2 de `D-06`** —actualizar el deck en sitio— un deck viejo no
   va a poder actualizar esa lámina si algún día se muestra: su mapa no la tiene.
   **Anotado, no resuelto.** Va con `D-06`, que ya está en `PLAN.md` §3 como planificado y
   bloqueado.

### P2 · `comunicaciones_post` tiene 2 ítems y cero slides modelo

Medido el 06/08 sobre la plantilla viva de `jm`: `itemsDeSeccion_` devuelve **7 ítems** en
total —5 de `encuentro`, 2 de `comunicaciones_post`, 0 de `campana`— y
`duplicarBloquesRepetibles_` produce **5 asignaciones**. Los dos que faltan son los de
`comunicaciones_post`: `slidesModeloDe_(presentacion, ['post_'])` devuelve **la lista vacía**,
o sea que **ninguna lámina de la plantilla lleva tokens de la familia `post_`**.

El motor ya lo dice sin romper — es el caso que `duplicarBloquesRepetibles_` reporta como
*"hay N ítem(s) pero ninguna slide de la plantilla lleva tokens de post_ — es una sección
curada contra una plantilla que no la contempla"*—, pero **nadie lo estaba leyendo**, y era el
origen del "5 y no 7" que aparecía como número raro en tres mediciones seguidas.

**Visto en una corrida real** (06/08): `jm-20260806-214253`, verificada a mano desde la
planilla, lo reportó igual que el banco. Deja de ser una medición de laboratorio.

#### La causa precisa, medida el 07/08 — y ya no es "falta la lámina"

**La lámina existe: es la 7 de `jm`.** Se titula *"Campañas"* y su pie dice
*"Digital | ECVs: post reuniones"* — es la lámina de comunicaciones post, sin ninguna duda.
Lleva una tabla de **7×8** cuya columna 1 tiene `{{camp1}}`, `{{camp2}}`, `{{camp3}}`,
`{{camp4}}` en las filas 4 a 7. **Ninguno empieza con `post_`**, y por eso
`slidesModeloDe_(presentacion, ['post_'])` no la ve.

**Y la familia `post_` no es un invento de `SECCIONES`: existe, del lado de `secco`.** La
lámina 10 de la plantilla de `secco` lleva una tabla de 4×7 con `post_camp1`, `post_camp2`,
`post_camp3`, `post_estado1`, `post_estado2`, `post_estado3`. La fila de `SECCIONES` declara
`informes = JM,SECCO`, así que **la sección está bien para `secco` y desalineada para `jm`**.
Eso es distinto de "una sección curada contra una plantilla que no la contempla".

**El obstáculo que hay que saber antes de elegir:** `tokenEsDeFamilia_` matchea **por
prefijo** (`token.indexOf(familia) === 0`). La sección `campana` ya declara `camp_`, que **no**
matchea `camp1` —`camp_` contra `camp1` falla en el quinto carácter—, y por eso hoy
`camp1`…`camp4` no pertenecen a ninguna sección. Pero una familia `camp` (sin guion bajo)
**sí** matchearía las dos cosas: `camp1` y `camp_titulo`, `camp_env1_aud`, `camp_resp_pos`…
es decir, se llevaría puestas las láminas 12 a 19, que son de la sección `campana`.

#### Las tres salidas — **ninguna elegida, esperando decisión del usuario**

| | qué se hace | qué cuesta |
|---|---|---|
| **A** | **Renombrar en la plantilla de `jm`**: `camp1`…`camp4` → `post_camp1`…`post_camp4`. | Toca la plantilla, que es del equipo (`C-01`), y el renombre va **por `informe_id`**, nunca global — lo demostró la regresión de `enc_audiencia`. A favor: deja `jm` y `secco` diciendo lo mismo, y `secco` ya usa esos nombres. |
| **B** | **Cambiar `familia_tokens` de la sección.** | La fila sirve a **los dos** informes y `post_` es correcto para `secco`: cambiarla rompe `secco` para arreglar `jm`. Sólo funciona partiendo la fila en dos, una por informe. |
| **C** | **Que la reclame otra sección**, con una familia que matchee `camp1`…`camp4`. | **No es expresable hoy.** Con matcheo por prefijo, la única familia que los toma es `camp`, y `camp` se lleva también las láminas 12–19 de la sección `campana`. Exigiría o un renombre (y entonces es **A**) o cambiar el matcheo de familias, que es motor y no configuración. |

**Dos de las tres salidas terminan en el mismo lugar**: renombrar los tokens de la lámina 7 de
`jm`. Eso no las convierte en una: **B** sigue siendo distinta y no toca la plantilla.

**Es decisión editorial, no de motor**, y sigue **abierta**. Nada de esto se ejecutó.

> **CERRADO el 07/08/2026 — salida A, decisión del usuario, y ejecutada.**
>
> `camp1`…`camp4` de la lámina 7 de `jm` pasaron a `post_camp1`…`post_camp4`, por
> `migrarTokensComunicacionesPost_` (`Armonizar.gs`), con backup previo de la plantilla.
>
> **El control es el que define si la salida A servía:** antes,
> `slidesModeloDe_(presentacion, ['post_'])` devolvía **la lista vacía** para `jm`; ahora
> devuelve **la lámina 7**. La sección `comunicaciones_post` encuentra su bloque modelo y sus
> dos ítems dejan de perderse. Los 172 tokens visibles siguen siendo 172 y no quedó ningún
> `camp1`…`camp4` suelto en la plantilla.
>
> **Lo que la salida A no resuelve, y hay que saberlo:** la lámina tiene **cuatro ranuras y
> una sola columna con token**. Las otras seis columnas —Estado, Período, Alcance,
> Impresiones, Vistas, VTR— siguen sin token, y son 24 de los 28 de la lista de
> `CONFIG_INFORMES.md` §1.8. Renombrar cuatro tokens no llena una tabla.


### P2 · El mensaje de exclusión no resuelve el nombre del ítem: `excluida undefined`

Visto **tres veces** en la corrida `jm-20260806-214253`, verificada a mano el 06/08:
`excluida undefined — etapa = "pre"`. El motivo del filtro sí sale; **el nombre del ítem
excluido, no**.

El texto lo arma `menuGenerarInformeCompleto_` con `e.campana`, y los ítems de la sección
`encuentro` no tienen esa propiedad — tienen `clave`. Es un `undefined` de campo, no un ítem
perdido: la exclusión ocurrió y el motivo es correcto.

**Por qué importa igual:** una exclusión que no dice *qué* excluyó es indistinguible de un ítem
que se perdió, y es exactamente lo que `D-21` pide evitar. Hoy hay que ir a `FALTANTES` o al
valor de retorno para saber cuál era.

> **Arreglado el 07/08 (`N8`) — pendiente de verificación humana.** El diagnóstico de arriba
> era casi correcto y le faltaba una mitad: los excluidos vienen de **dos** lados con forma
> distinta. Los de `CAMPANAS` traen `campana`; los que filtra `filtrarItemsPorSeccion_` sobre
> los crudos de `REUNIONES` traen **`item`**, resuelto por `__clave__`. El texto usa ahora
> `e.campana || e.item || '(el ítem no trae nombre)'`.
>
> Medido con `itemsDeSeccion_('comunicaciones_post')` sobre la ventana vigente, las tres
> líneas que antes decían `undefined` ahora dicen:
> `excluida San Cristóbal (pre) — etapa = "pre"`, `excluida Retiro (pre) — etapa = "pre"`,
> `excluida Orden Público — etapa = ""`.

### P2 · El aviso de lámina escondida numera contra el deck expandido y no lo dice

La corrida `jm-20260806-214253` avisó **"lámina 14 escondida"**; en la plantilla esa lámina es
la **10**. Las dos son ciertas: la expansión de bloques repetibles inserta copias antes, así
que el índice se corre. **El texto no dice contra qué deck numera.**

Quien lee el aviso y va a la plantilla a buscar la 14 encuentra otra cosa. El número de la
plantilla es el estable —es el que usan `mapaDeTokens_`, este archivo y los relevamientos— y el
del deck cambia con cada corrida según cuántos ítems se emitan.

**Qué falta:** que el aviso diga cuál de los dos es, o que numere contra la plantilla.

> **Arreglado el 07/08 (`N8`) — pendiente de verificación humana.** Se eligió **que lo diga**,
> no renumerar. El aviso termina ahora en *"Numeradas sobre el DECK EXPANDIDO, no sobre la
> plantilla"*.
>
> **Por qué decirlo y no renumerar:** el número del deck expandido es el que efectivamente
> tiene el archivo que la persona va a abrir —es el deck generado, no la plantilla—, así que
> es el número útil para ir a mirar. Traducirlo a la numeración de la plantilla exigiría
> invertir la expansión, y el mapa de la corrida no la guarda. Decir contra qué se numera
> cuesta una línea y no puede quedar desactualizado.
>
> Es la misma distinción que `TOKENS.md` §2.0 dejó escrita el mismo día: conviven **tres**
> numeraciones —el `.pptx` archivado, la presentación viva de Slides, y el deck expandido— y
> el problema nunca fue cuál usar sino no decir cuál.


## Preguntas al equipo — abiertas, esperando respuesta humana

> Dueña de la pregunta "¿qué se le preguntó al equipo y sigue sin respuesta?"
> (`CLAUDE.md` §7). No son inconsistencias documentales: son preguntas de dominio que
> nacieron en documentos hoy congelados y necesitan un lugar vivo. Al responderse, la
> respuesta va al documento dueño del hecho y la pregunta se tacha acá.

- ~~**Las 7 filas de `REUNIONES`: ¿son todas encuentros de Jorge Macri, o incluyen
  ministros?**~~ — **RESPONDIDA (usuario, 07/08/2026): `REUNIONES` es JM.** La lámina 6 es el
  desglose de la 5, así que **mismo universo**. Abierta y cerrada el mismo día.

  **⚠ Pero se sostiene por curaduría, no por control, y eso cambia qué tan firme es.** La hoja
  **no tiene columna `figura`** —sus columnas son `periodo_id`, `orden`, `eje`, `tipo`,
  `nombre`, `fecha`, `etapa`, `mostrar`, `texto_original`, `notas`—, así que **el motor no
  puede verificarlo ni notar si deja de ser cierto**. Si alguna vez entran filas de otras
  figuras, **nadie se va a enterar por la hoja**: la lámina 6 va a emitir láminas que no le
  corresponden y el síntoma va a aparecer lejos, igual que el de la lámina 5.

  **Queda escrito porque es la diferencia entre un supuesto sostenido y uno verificado.** El de
  la lámina 5 se verifica solo —`figura=Jorge Macri` está en la celda y la traza lo dice—; éste
  depende de que quien cargue `REUNIONES` mantenga el criterio. Si alguna vez hace falta
  control, la salida es una columna `figura` en la hoja, no una discusión.
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
> **Las cuatro entradas marcadas `⏸ esperando al usuario` (03/08/2026) no se vuelven a
> plantear.** No se re-preguntan, no se proponen como próximo paso y no se listan en
> `HANDOFF_CODE.md` como bloqueo. Vuelven a la conversación **sólo cuando el usuario las
> trae**. Se anotan acá para que existan, no para que empujen.

- **⏸ esperando al usuario · La lámina M2 con la grilla por ejes no salió en el informe del
  24 al 31/07. ¿Se dejó de usar, o esa semana no hubo material?** Es la pregunta que decide
  si la slide 10 sigue vigente. Hoy está **congelada** por decisión del usuario del
  03/08/2026: no se retira, no se corrige, y la armonización la excluye por filtro derivado.
- **⏸ esperando al usuario · `{{m2_salud_camp}}`: qué mide la línea ancha debajo del cuadro
  de cinco columnas.** Caja de `y=356 x=100 w=513`, fuera de la grilla, que cruza las cinco
  columnas. **Sólo aplica si la lámina sigue vigente** — si la respuesta de arriba es que se
  dejó de usar, esta pregunta se cae sola.
- **⏸ esperando al usuario · El cruce de nombres de JM: ¿se corrigen en la plantilla o se
  registran como están?** `{{m2_envios}}` está en la caja del **conteo de campañas** y
  `{{m2_campanias}}` en la de la **lista de nombres**; SECCO los nombra bien y además tiene
  la tercera caja (`m2_implementaciones`) que JM no tiene. La plantilla es del equipo
  (`C-01`), así que corregirla es decisión suya; registrarlos como están también es una
  opción válida y no bloquea nada — `MARCADORES` los distingue por `informe_id`.
- **⏸ esperando autorización del usuario · Correr la armonización de JM.** El filtro de
  láminas congeladas ya está y `previsualizarArmonizacion('jm')` da **5 dentro / 16 fuera,
  cero conflictos** sin tocar nada. Correrla **escribe sobre la plantilla del equipo** (con
  backup automático previo). Es lo único que separa a la canónica de estar armonizada, y con
  eso se destraba el `0.1` del `Paso-2.5`. **No se vuelve a ofrecer.**

- **¿`inscriptos` es siempre la suma de los cinco canales, o hay inscriptos que no vienen de
  ninguno de ellos?** El control agregado del corte vertical no cerró: sobre las 12 filas de
  `rdv/RVD JM-CM - ES` en la ventana 24–30/07, `inscriptos` suma **2919** y los cinco canales
  **2865** — **−54, un 1,8 %**. **No es el motor**: sumar cada columna y después sumar las
  columnas da idéntico a sumar fila por fila, así que el despachador no puede introducir esa
  diferencia acertando cada columna por separado. Y en la fila de `Orden Público 28/07` la
  identidad **sí** cierra: `361 + 169 + 43 + 180 + vacío = 753`.
  **Las dos lecturas posibles, y no las decide el motor:** *(1)* faltan datos —los canales
  están sin cargar en algunas filas y la identidad vale—, y entonces es curaduría de la base;
  *(2)* la identidad no vale siempre —hay inscripción espontánea, presencial, o un canal no
  mapeado—, y entonces el control `cierraSuma` del `Paso-2.9E` es válido **por fila** pero
  **no** es una regla general, y hay que escribirlo como tal.
  **✅ El censo se hizo el 04/08/2026 y la respuesta es la lectura (1): faltan datos, y la
  identidad vale.** Leído crudo con `getValues()` sobre las 12 filas:
  - **10 de 12 cierran exacto. Cero quedan largas.**
  - **Las 2 que quedan cortas son las que tienen los cinco canales vacíos**, y su faltante es
    el total exacto: `Mataderos 29/07` inscriptos **34**, canales 0 → −34; `Palermo 29/07`
    inscriptos **20**, canales 0 → −20. **34 + 20 = 54.** No hay otra fuente de diferencia.
  - **Cero celdas con cero explícito y cero con texto no numérico.** Las 36 celdas que no
    aportan son **todas vacías**. La distinción que el censo venía a buscar existe en el
    código pero **no en estos datos**.

  **Entonces la pregunta se afina y se achica:** `inscriptos = mail + cc + ivr + digital +
  difusión` **se sostiene en las 10 filas que tienen algo cargado**, así que `cierraSuma` del
  `Paso-2.9E` **sí es una regla general** y no sólo una verificación por fila. Lo que queda
  para el equipo es puntual: **esas dos filas tienen inscriptos pero ningún canal cargado —
  ¿falta cargarlos, o esos inscriptos entraron por una vía que no es ninguno de los cinco?**
  **No es bloqueo:** el corte vertical cerró y esto no traba ningún paso. **No se corrigió
  ninguna celda.**

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

- **`3354` y `3346` tienen cero filas de mail, y `rdv` dice que hubo mail** (`P2`, medido el
  11/08). Las cuentas de San Cristóbal y Retiro no tienen ninguna fila en
  `digital/Directa Mail`, pero `rdv` registra un inscripto por mail en cada uno. Es
  inconsistencia de datos y tiene consecuencia: **impidió validar la regla de convocatoria**
  fuera de `3387` — el filtro `mail_tipo=Convocatoria` funciona para Orden Público y no hay
  contra qué probarlo en los otros dos. *(Era un `###` con cuerpo largo; pasa a viñeta el
  06/08/2026 porque es la forma de esta sección. El texto no cambió de sentido.)*
- **Los tres remitentes sueltos de la lámina de campaña** (`P2`) — **DIFERIDO por decisión
  del usuario, 07/08.** La pregunta, textual: *si cada fila de la tabla de envíos ya dice
  quién envió, ¿qué debería mostrar un `camp_remitente` que está fuera de la tabla?* Tres
  ubicaciones en la plantilla viva de JM: `camp_remitente` (láminas 18 y 19) y
  `camp_bench_remitente` (18), las tres sueltas. **No se cablean, no se borran, no se tocan**,
  y dejan de reportarse en cada corrida. Marcado también en `CONFIG_INFORMES.md` §2.5, junto
  a los once `camp_resp_*` diferidos.
  **⚠ `camp_bench_` (sin `_remitente`) NO está diferido**: su pregunta es otra —¿son fijos, o
  del período anterior?— y nunca se respondió. Confundirlos lo daría por cerrado.
  *(Pasa a viñeta el 06/08/2026; el texto no cambió de sentido.)*

  > **Sigue abierta después del 07/08, y conviene decir por qué se buscó.** `B.3` de las once
  > respuestas mandaba resolverlo *"según lo que diga `A.1`/`A.5`"* — la selección de campaña
  > destacada y el paso a solape. **Ninguna de las dos lo toca:** `A.1` decide **qué campañas
  > entran**, `A.5` decide **con qué criterio de fecha**, y `camp_bench_*` pregunta **de dónde
  > sale un número de referencia** — que no es una fila que entre o salga. Se buscó, no
  > alcanzó, y queda anotado como el prompt indica.
  >
  > **Sigue siendo una pregunta de una sola línea:** ¿los seis `camp_bench_{google,meta,prog}_{ctr,vtr}`
  > son constantes del año o se recalculan contra el período anterior? Si son constantes,
  > `MARCADORES.valor_fijo` los resuelve sin código.

### P0 · `MAPEO` resuelve la columna por letra, sin nombre: una columna insertada corre el mapeo

**Qué pasa hoy.** `MAPEO.columna` guarda una **letra** (`K`, `E`, `AA`, …) y se resuelve
posicionalmente con `columnaLetraAIndice_` (`Fuentes.gs`). La conversora es una sola, pero
se consume **por dos caminos**, y los dos tienen el mismo problema:

- **Índice directo sobre la fila cruda.** La letra se vuelve índice y se lee `fila[idx]`.
  Lo hacen `leerFuente` (clave, `fecha_periodo` y `fecha_fin_periodo` — o sea **qué filas
  entran al período**), `filtrosValoresIncluidos_` (el índice de la lista blanca de `D-21`,
  que después consumen `filaPasaListaBlanca_`, `comaDentroDeUnValor_` y
  `valoresDeclaradosSinFilas_`), `verificarPrecondicionAnclaje_` (`Union.gs`),
  `tipificarColumna_` (`Fechas.gs`, vía `diagnosticarBases`) y `diagnosticoColumnaFecha_`.
  En diagnóstico y pruebas: `auditarAlcanceDigital_`, `diagnosticoCorteFilasM2_`,
  `diagnosticoFilasSinClaveDigital_`, `diagnosticarColapso_` y `censoCanalesRdv_`.
- **Letra → encabezado → objeto fila.** `encabezadoEnColumna_` (`Union.gs`) convierte la
  letra a índice **sólo para averiguar el nombre del encabezado**, y `valorPorColumna_`
  indexa la fila-objeto por ese nombre. Parece resolver por nombre, pero **el ancla sigue
  siendo la letra**: con una columna insertada devuelve el encabezado equivocado y por lo
  tanto el valor equivocado. Es el camino que pinta los marcadores del informe —
  `datosDeMarcador_`, `aplicarFiltroDeMarcador_`, `partirCampoRatio_` y `resolverMarcadores`
  (`Generador.gs`), `unirDigitalPorCuentaSinCache_`, `encontrarFilaRdvDeReunion_` y
  `anclarEncuentrosSinCache_` (`Union.gs`), `calcularTokenDirectoRdv_` (`Marcadores.gs`).

**Por qué importa.** Las cuatro bases tienen dueños ajenos: el motor sólo lee, y nadie le
avisa cuando alguien inserta o mueve una columna. Cuando eso pasa, el mapeo sigue apuntando
a la misma **posición** y el motor devuelve el dato de **otra columna** sin fallar. No hay
síntoma: no hay excepción, no hay `«FALTA:token»`, no hay fila de menos. Sale un número
plausible y equivocado, que es el modo de falla caro del proyecto. Y en `leerFuente` es
peor que un token mal: si lo que se corre es la columna de fecha o la clave, cambia **el
conjunto de filas** sobre el que se calcula todo lo demás.

**La forma propuesta.** Resolver por **nombre de encabezado**, normalizado con la forma que
fija `R-10` (colapsar `/\s+/` a un espacio y `trim()`, **preservando mayúsculas y
acentos**), y **caer a la letra** sólo si ese nombre no aparece en la fila de encabezado de
la solapa. El fallback **no puede ser silencioso**: se reporta en la traza del marcador,
por `D-21` — *"nada se excluye en silencio"*. Un fallback mudo reintroduce exactamente el
problema que el ítem viene a sacar, con la ventaja engañosa de que ahora parece resuelto.

El segundo camino (`encabezadoEnColumna_`) es el que sale casi solo: ya tiene el encabezado
real a mano y sólo hay que invertir la dirección de la resolución.

**Qué lo destraba: de dónde sale el nombre.** El repo permite al menos dos formas, y **este
ítem no elige** — elegir es el prompt que viene después:

- una **columna nueva en `MAPEO`** (`encabezado`, junto a `columna`), sembrada por
  `SEED_MAPEO_*`, que declara el nombre esperado;
- **derivarlo en el momento de resolver**, leyendo la fila que declara
  `SOLAPAS.fila_encabezado` y guardando el nombre que hoy tiene la letra — con lo cual la
  primera corrida fija la referencia y las siguientes la verifican.

**No supersede ninguna decisión.** `grep -n "letra" docs/PLAN.md docs/REGLAS_NEGOCIO.md`
da **cero**: ninguna `D-NN` ni `R-NN` fija la columna por letra. Es una implementación
heredada, no una decisión tomada. Si al implementarlo hace falta una `D-NN`, se escribe
ahí, no acá.

**No es el ítem `P1 · Firma de encabezados`, y no lo reemplaza.** Aquél **detecta** que la
fila de encabezado cambió y falla ruidosamente; éste hace que el mapeo **siga siendo
correcto** cuando cambió. La firma frena todo, incluso ante un cambio inocuo; el nombre
resuelve bien y sólo canta cuando no encuentra el encabezado. Van los dos.

**Superficie, medida** (`node tools/api.js registros hoja=MAPEO`, 07/08/2026): **140
entradas `(base, solapa, campo_logico)` en 13 solapas — `digital` 78, `looker` 27, `m2` 19,
`rdv` 16 — y las 140 tienen `columna` cargada. Ninguna sin columna.** El cambio cubre todo
`MAPEO`, no una parte. (El número sale de `leerMapeo`, que es lo que el motor resuelve; dos
filas con el mismo `campo_logico` en la misma solapa colapsarían a una. Las filas crudas de
la hoja no se midieron.)

### P2 · La suspensión acotada de `C-01` lleva fecha 14/08/2026 y se escribió antes de esa fecha

La sección *"Suspensión acotada — 14/08/2026"* de `docs/REGLAS_NEGOCIO.md` está fechada el
**14/08/2026**, y el addendum 1 que se le agregó abajo se escribió el **07/08/2026**. Una de
las dos fechas está mal y **no sabemos cuál**: puede ser un tipeo en el encabezado o una
sesión que fechó mal. Se anota el hecho y nada más — **no se corrige a ciegas**, porque la
fecha de una autorización es lo que la hace verificable, y elegir la equivocada la vuelve
menos verificable que dejarla dudosa a la vista.

Aparece también en el `P1` de más arriba sobre la caja `{{m2_salud_camp}}`, cerrado
"14/08/2026": las dos anotaciones vienen de la misma sesión y probablemente comparten la
causa. Mirarlas juntas.

### P2 · Dos láminas sin tokens que probablemente **no** son estáticas

`D-23` agrega el valor `modo = estatica` para las láminas que no llevan datos nunca, y el
inventario del 07/08/2026 encontró **13 láminas sin ningún token** entre las dos plantillas.
Dos de esas trece no parecen carátulas, y clasificarlas como `estatica` **congelaría deuda
donde hoy hay una lámina a cablear**:

- **`SECCO_marcada` lámina 15** — layout `CUSTOM_4`, con rótulos de datos en una tabla
  (*"Caudal semanal de M2 · Comunicación Directa | Envío de mails · Proyectos Entregados…"*) y
  **cero tokens**. Tiene toda la forma de una lámina de datos sin cablear, no de una portada.
- **`SECCO_marcada` lámina 26** — escondida, con `xx` de relleno donde irían los números
  (*"xx xx xx xx… Principales temas que aportaron positividad y negatividad"*).

**Se revisan antes de clasificarlas.** `estatica` significa *no lleva datos nunca*, **no**
*hoy no tiene tokens*, y la diferencia sólo se puede resolver mirando qué se espera de cada
lámina — no midiendo la plantilla. No se decidió cuál es cuál en la corrida que las encontró.

### P3 · El último paso de "Marcar y clasificar una lámina" no dice cuál `estado` se marca

El último paso de esa sección del `RUNBOOK` —el **5** desde que el addendum 1 a `D-23` fundió
las fases y la sección quedó en cinco pasos; era el 6— dice que **la sección** entra en
`estado = revisar` al agregar una lámina, y eso es `SECCIONES.estado`. La tabla de la **Fase 3** en `docs/PLAN.md`
§2 declara que la hoja `LAMINAS` va a llevar **su propio `estado` y su propio `falta`**.
Cuando esa hoja exista, el paso queda ambiguo: no dice cuál de los dos se marca.

**Se resuelve al implementar la Fase 3, no antes** — hoy `LAMINAS` no existe y el paso no es
ambiguo. **No se propone cuál gana:** con la hoja escrita se va a ver si el estado de la
lámina reemplaza al de la sección para este caso, si conviven, o si el paso pasa a nombrar los
dos. El `RUNBOOK` no se toca hasta entonces.

### P2 · Sin decidir: la forma de la fila de `LAMINAS` cuando un id viva en las dos plantillas

`D-23` addendum 1 punto 13 deja la identidad compartida entre plantillas como **implementación
futura**: el contador de `L-NNN` ya es común a `jm` y `secco`, pero que la misma lámina lleve
el mismo id en las dos requiere que alguien las reconozca como la misma. El día que se
implemente hay que elegir la forma de la fila, y **son dos, incompatibles**:

- **Una fila con `informes` plural**, como `SECCIONES` — un `L-014` con `informes = JM,SECCO`.
- **Una fila por (`lamina_id`, `informe_id`)** — identidad compartida, configuración propia de
  cada informe.

**No es cosmético, y el repo ya midió el modo de falla de la primera.**
`comunicaciones_post` declara `familia_tokens = post_` para `JM,SECCO`, y esa declaración
única **es correcta para un informe y equivocada para el otro** (`P2` de más arriba, sobre
`armonizarPresentacion_` y el alcance global). Una fila que habla por dos informes hereda ese
problema; una fila por par lo evita al precio de duplicar configuración.

**Insumo para cuando se decida** (medido el 07/08/2026, criterio grueso, sin decidir cuáles
son "la misma"): **nueve pares** de láminas con el primer texto idéntico entre `secco` y `jm`,
**seis de ellos** con además el conjunto de tokens idéntico —`secco` 17=`jm` 13, 18=14, 20=16,
21=17, 22=18, 23=19, todos del bloque `camp_*`—, más cinco pares con solape parcial, el más
fuerte `secco` 8 ~ `jm` 6 con **28 tokens en común**.

### P0 · Los números de la lámina 5 publicados hasta el 07/08 están inflados: contaban doce figuras

**Qué pasó.** `rdv/RVD JM-CM - ES` trae las figuras de todo el gabinete, y los seis marcadores
de `ecv_alcance_semanal` leían **todas**. En la ventana 24–30/07 hay **15 filas de 12 figuras
distintas** y sólo **4 son de Jorge Macri**. El informe `jm` publicó los encuentros del
gabinete entero como si fueran los suyos.

| marcador | publicado | correcto (sólo JM) |
|---|---|---|
| `ecv_encuentros` | **15** | **4** |
| `ecv_insc_mail_pct` | 59.9 (2003/3344) | **50.7** (1169/2307) |
| `ecv_insc_cc_pct` | 8.1 (272/3344) | **11.8** (272/2307) |
| `ecv_insc_ivr_pct` | 1.3 (43/3344) | **1.9** (43/2307) |
| `ecv_insc_digital_pct` | 29.3 (979/3344) | **35.7** (823/2307) |
| `ecv_insc_dif_pct` | 2.1 (71/3344) | **0** (0/2307) |

**Son seis marcadores, no ocho, y los siete que faltan son parte del hallazgo.**
`ecv_inscriptos`, `ecv_asistentes` y los cinco numeradores `ecv_insc_*` **no tienen fila en
`MARCADORES`** — son los huecos que producen el `Mail: «FALTA:ecv_insc_mail»(59.9%)` de la
lámina 5. Dicho con precisión: **el deck publica seis números mal y siete huecos.**

**⚠ Y por eso el orden no es una recomendación: los siete se cablean DESPUÉS del filtro, nunca
antes.** Cableados antes, nacen con el universo de doce figuras y el error se multiplica por
siete en vez de corregirse.

**Tres de los cinco porcentajes SUBEN al filtrar, y el motivo va escrito para que nadie lo
"arregle".** `insc_cc` (272) e `insc_ivr` (43) tienen **el mismo numerador en las dos
columnas** —ese canal es 100 % de JM— mientras el denominador cae de 3344 a 2307. **Filtrar no
baja todo: redistribuye.** Un porcentaje que sube al recortar el universo es correcto acá.

**Y `ecv_insc_dif_pct` pasa a 0, que es un dato y no un `sin_datos`.** Las 71 inscripciones
diferidas son **todas de otros ministros**. Cuando se cablee `ecv_insc_dif`, tiene que publicar
**cero**: son dos estados distintos y el motor los distingue a propósito (`SUMA` sobre cero
filas da `sin_datos`; sobre filas de ceros da `0`).

**El registro vale más que la corrección.** Quedó publicado y alguien lo leyó. La corrección
—`figura=Jorge Macri` en `MARCADORES.filtro`— está aplicada; esta entrada existe porque el
número salió a la calle.

**Corregido por:** `R-15` addendum 1 (la señal) + `CONFIG_INFORMES.md` §1.4 ter (el universo y
el mecanismo), los dos del 07/08/2026.

### P1 · El segundo enganche: de una reunión a **sus** campañas — sin prompt y sin medir

**⚠ Son dos problemas distintos y los dos usan la palabra "campaña".** Confundirlos es barato de
hacer y caro de descubrir, así que van escritos uno al lado del otro:

| | qué busca | estado |
|---|---|---|
| **1 · campaña destacada → su fila en la base** | una campaña **que el temario nombra**, por nombre | **resuelto** — es el cargador del `_5`, con su solapa de equivalencias |
| **2 · reunión → las campañas de esa reunión** | las campañas **que pertenecen a un encuentro** que el temario nombra, **pre y post** | **sin prompt, sin medir** |

El primer bloque del temario son **reuniones**, y **cada reunión tiene campañas propias** — las
suyas, en sus dos etapas. El bloque *"Campañas destacadas"* son campañas y nada más. **Uno busca
una campaña; el otro busca las campañas de un encuentro.**

**Lo que ya existe y conviene mirar cuando le toque el turno:** `REUNIONES` **ya tiene la columna
`etapa`, con `pre` y `post`** — la mitad de la estructura está. **Lo que falta es con qué se
engancha una reunión a sus campañas en `digital`**, y eso no está medido.

**No se diseñó nada para este caso.** La solapa `CAMPANAS_equivalencias` del `_5` **probablemente
sirva para los dos**, pero **no se dio por hecho ni se la adaptó**: primero que funcione para el
que está medido. Estirar una convención hacia un caso que nadie midió es cómo se fabrica una
tabla que no sirve para ninguno de los dos.

### P1 · Los `camp_*` sin fuente — catorce, y son tres preguntas distintas

**Un token sin fuente no es un token pendiente de cablear: es una pregunta.** De los **46**
`camp_*` de la plantilla `jm` (sin `camp_bench_*`, fuera de alcance), **catorce no salen de
ninguna de las cuatro fuentes**, y agrupados por lo que les falta son tres problemas que no se
resuelven juntos. Medido el 08/08/2026.

**a · Los once `camp_resp_*` (lámina 19) — falta la fuente entera.**
`camp_resp_pos`, `_neg`, `_neu`, `_info`, `_sol`, sus cinco `_pct`, `camp_resp_total` y
`camp_tasa_resp`. Son **respuestas de mail clasificadas por sentimiento**, y **ninguna de las
cuatro solapas tiene esa dimensión**. No es que falte mapear una columna: **el dato no está**.
Es pregunta para el equipo, no trabajo de cableado.

**b · Los seis `camp_audiencia1-3` y `camp_formato1-3` (lámina 14) — la granularidad no
coincide, y está medido.** La hipótesis razonable era que **la plataforma fuera la "posición"**
que esos tokens numeran, porque `CAMPAÑAS_DESGLOCE_DIGITAL` da una fila por campaña y
plataforma. **No lo es:**

| | medido sobre 2500 filas y 702 campañas |
|---|---|
| campañas con **una sola** plataforma | **599 — el 85 %** |
| con exactamente **tres** | **21** |
| con **cinco** | 4 |
| vocabulario | `Meta`, `Google ads`, `DV360`, `TikTok`, `Twitter`, `Twitch`, `Uber` — **siete**, no tres |

Con la plataforma como posición, **el 85 % de las campañas llenaría una ranura y dejaría dos
vacías**, y las de cinco no entrarían. Además *"formato"* no es *"plataforma"*: el vocabulario
son canales. **Quedan marcados y se levantan al final, sin insistir** (decisión del usuario,
08/08/2026).

**c · Lado mail: `camp_aperturas`, `camp_entregados`, `camp_ctor` y los diez `camp_env1..5_*`
— la fuente existe pero es un panel.** Todos saldrían de `Mail per`, que **tiene el período
tipeado a mano** y por lo tanto `R-02` la excluye. **No es una pregunta al equipo: es un camino
técnico a construir**, y es distinto de los dos anteriores.

### ~~P1 · Falta una operación que devuelva el elemento N de una lista~~ — POSTERGADO por decisión (08/08/2026)

**No está bloqueado por falta de camino: está postergado.** Decisión del usuario, 08/08/2026:
`ecv_barrio1-3` **quedan como pendiente y se levantan al final**. **No se borran de la
plantilla** y **no se construye ahora** la operación que devuelve el elemento N de una lista.

La diferencia importa para quien lea esto en un mes: el camino **se conoce** —está descrito
abajo— y lo que falta es **prioridad**, no diseño. El texto original queda tal cual.

### P1 · El detalle de por qué `ecv_barrio1-3` no se cablearon con el lote del 08/08

`ecv_barrio1`, `ecv_barrio2` y `ecv_barrio3` **no se pudieron cablear** con el lote del 08/08, y
por **dos razones independientes, las dos medidas**:

1. **`opLISTA` no tiene parámetro de índice.** Devuelve la lista entera unida por el separador;
   no sabe decir *"el elemento 1"*.
2. **No puede haber `MAPEO` para ellos** — medido: `falta MAPEO: rdv/RVD JM-CM - ES/barrio1` en
   los tres. Y no es que falte cargarlo: **no son columnas de la base**, son **posiciones dentro
   de un resultado**. Declararlos en `MAPEO` sería mentir sobre qué son.

**La decisión editorial del `_18` es correcta y hoy no es ejecutable, y son dos cosas
distintas.** Que `ecv_barrio1-3` salgan de la misma lista que `ecv_barrios` está bien decidido —
lo que falta es el mecanismo. **No se inventó una operación para completar el lote**: el lote
quedó en siete y estos tres esperan.

**Lo que haría falta**, dicho sin decidirlo: una operación que tome una lista y devuelva su
elemento N, o un parámetro de índice en la que ya existe. Quien lo tome tiene que resolver qué
pasa cuando la lista tiene **menos elementos que la posición pedida** — hoy son **tres ranuras
para cuatro barrios**, así que el caso contrario también existe.

### P1 · `ecv_insc_dif` publica `«FALTA»` donde una decisión escrita dice que debe publicar cero

**Las dos puntas, y las dos son del 07-08/08/2026:**

| | qué dice |
|---|---|
| **la decisión** (`13.1`, 07/08) | *"el `0` de `ecv_insc_dif_pct` es un dato, no un `sin_datos`… **cuando se cablee `ecv_insc_dif`, tiene que publicar cero, no un hueco**"* |
| **lo medido** (08/08, al cablearlo) | `SUMA` devuelve **`sin_datos`**, y la lámina publica `Difusión: «FALTA:ecv_insc_dif»(0%)` |

**No es un error del cableado.** `SUMA` distingue tres casos a propósito: cero filas → sin dato;
filas con la celda vacía → sin dato; **filas con un `0` escrito → cero, que sí es un dato**. Las
cuatro filas de JM tienen la celda **vacía**, no un cero, así que `SUMA` hace exactamente lo que
está escrito que haga. El `_pct` da `0` porque tiene denominador.

**No se arregló en la corrida que lo encontró, y el motivo importa:** tocar `SUMA` **mueve
marcadores en todo el deck**, no sólo acá.

**El criterio que lo resolvería, como candidato y no como decisión:** *cero filas tras el filtro*
**no es lo mismo que** *filas presentes con la celda vacía*. La primera no tiene nada que
agregar; la segunda tiene cuatro filas diciendo que ese canal no aportó. **Es exactamente la
distinción que `R-18` addendum 1 ya escribió para las listas**, sin llevar a `SUMA`. **Quien lo
implemente tiene que medir primero cuántos marcadores del deck cambiarían de estado** — si son
muchos, el arreglo es más caro que el síntoma.

### P1 · Las dos solapas `Buscador por periodo` son paneles, y `R-02` ya las veta

**Medido el 08/08/2026 sobre las hojas vivas.** `digital/Buscador por periodo digital` (1002
filas) y `digital/Buscador por periodo directa` (1000) **no son tablas de datos**:

| fila | qué tiene |
|---|---|
| 1 | los rótulos `Periodo · Desde · Hasta` |
| **2** | **los valores del período, tipeados a mano** |
| 3 | los encabezados reales (`ID`, `Nombre de la campaña`, …), **y son fórmulas de array** |
| 4+ | los datos, generados por `=UNIQUE(FILTER('Seguimiento digital'!A2:A; …<= C2 …))` |

**La tabla se recalcula según lo que alguien haya tipeado en `B2`/`C2`.** Es exactamente el
caso que `R-02` describe y excluye: *"si el período vive en la hoja… lo que devuelva depende de
lo último que tipeó una persona: un informe de julio puede salir con el recorte de mayo **sin
fallar**. Eso no es una fuente"*.

**Y no es hipotético: hoy mismo están desincronizadas.** Los dos paneles tienen
**`31/07/2026 → 07/08/2026`** en la fila 2, mientras el informe corre sobre **24–30/07**. Si el
motor las leyera, traería las campañas de otra semana **y ningún token fallaría**.

**Por eso NO se pasaron a `uso = fuente`** (la Parte A del prompt `_17` lo pedía para probar):
`R-02` es anterior y las veta, así que la prueba no habría medido si sirven — habría medido si
el motor sabe leer un panel. Y `A.2` del mismo prompt dice que **una solapa marcada `fuente`
que no es fuente es peor que una marcada `referencia`**. **Se dejaron como estaban, en
`referencia`, y no se tocó `SOLAPAS`.**

**Lo que sí sirve, y ya está a mano:** las dos fórmulas dicen de dónde sacan los datos —
`'Seguimiento digital'`, `'Mail per'`, `Alcance`, `CAMPAÑAS_DESGLOCE_DIGITAL`—, que son solapas
reales. **El camino no es leer el panel: es leer lo que el panel lee.**

### P2 · `digital/Alcance` es fuente y no tiene `nombre_campaña` en `MAPEO`

Está registrada como **`uso = fuente`**, trae **768 filas** y sus columnas son
`ID Cuentas · Alcance · Frecuencia · eje · area · nombre_campaña`. Es la que **engancha el
nombre del temario con el id de cuenta**, que es justo lo que necesita la selección de campaña
destacada.

**Pero `buscarMapeo('digital','Alcance','nombre_campana')` devuelve `falta MAPEO`** — medido el
08/08. La columna existe en la hoja y **no está declarada**. No se agregó la fila: `MAPEO` tiene
sus escritores declarados y esto es cableado, que es otro prompt.

**Dato para quien lo tome:** la hoja la llena un `IMPORTRANGE` desde la base `looker`, así que
el nombre de la columna trae **ñ** (`nombre_campaña`), y `R-10` **no pliega acentos**.

### P2 · `CAMPANAS.tipo`: el seed y la hoja viva usan vocabularios distintos, y nadie lo nota

La hoja viva trae `destacada`, `encuentro_ministros` y `proveedor`. `SEED_CAMPANAS_EJEMPLO_`
trae **`campana`, `ministros` y `proveedor`**. **Dos vocabularios para la misma columna.**

**Por qué nadie lo notó: ningún consumidor lee esa columna.** Verificado el 08/08 — `tipo` sólo
llegaría al motor por `SECCIONES.filtro` (`itemsDeSeccion_` evalúa el filtro contra los
atributos de la campaña), y **ninguna sección declara un filtro sobre `tipo`**: el único filtro
declarado hoy es `etapa=post` en `comunicaciones_post`, que es de `REUNIONES`.

**La consecuencia está latente, no activa:** el día que alguien escriba
`SECCIONES.filtro = tipo=destacada`, el vocabulario que vale es **el de la hoja**, y quien mire
el seed para saber qué escribir va a poner `campana` y no va a entrar ninguna fila.

### P0 · `digital/Digital`: el 71 % de sus filas se descarta en la unión y nadie se entera

Medido el 09/08/2026 a las 01:30, sobre las hojas vivas, con la clave que usa el motor
(`dig_id_cuenta` → columna `T`, del `MAPEO` vivo).

De las **1297 filas** de `digital/Digital`: **337 no tienen id de cuenta**, **922 tienen un id que
no está en la maestra `Seguimiento digital`** y se van a `huerfanasEnCanal` (`Union.gs:176-178`), y
**sólo 38 matchean**. Es el **71,1 %** del canal cayéndose en silencio, más un 26 % sin clave.

**Por qué es `P0` y no `P2`:** `huerfanas_en_canal` se calcula y **muere adentro del diagnóstico**
—su único lector es `Union.gs:892`, un `ui.alert` de menú—, así que una corrida normal no lo dice.
Un token que lea de `Digital` publica un número sacado de 38 filas de 1297 y **se ve bien**. Es
exactamente el modo de falla de la lámina 5 (`R-15` addendum 1): el número plausible.

**Lo que este hallazgo NO dice:** si las 922 son un error de datos, un `IMPORTRANGE` a medio traer,
o campañas que legítimamente sólo existen en esa solapa. **No se investigó** — la medición salió de
la Parte 0 del `_6`, que iba a otra cosa. Comparar con `Directa Mail`, que tiene 29,2 % de
huérfanas, sugiere que el de `Digital` es de otro orden y merece su propia pasada.

### P1 · Seis solapas de `looker` están registradas como `fuente` y no tienen ni una fila en `MAPEO`

⚠ **Este pendiente corrige una afirmación falsa que estuvo circulando el 08–09/08.** Se dijo, en un
reporte de medición y de ahí en el prompt `2026-08-08_9_corrida_nocturna.md`, que *"`looker` entero
devuelve `«FALTA:fecha_periodo@looker/…»`"* y que *"`looker` es ilegible entero"*. **Es falso, y el
error fue del instrumento, no del motor:** la medición llamó a `leerFuente` con una ventana armada
a mano con fechas en texto, y `formatearFecha_` exige `Date`. El fallo de
`resumen_metricas_dinamico` fue esa llamada mal construida, no un mapeo faltante.

**Lo verificado el 09/08 a las 01:26, con la ventana que resuelve el motor:**

- **`looker/resumen_metricas_dinamico` es perfectamente legible.** `contarLecturaBase_('looker')`
  → 949 filas totales, **26 en la ventana** `2026-07-24 → 2026-07-30`, columna de fecha
  `fecha_inicio`, **0 filas sin fecha, 0 con fecha inválida**. Su `fecha_periodo` está en `MAPEO`
  (columna `C`) desde la selección de `docs/FECHAS_seleccion.md`. Es la fuente que declara `S-01` y
  el `hoja_default` de la base.

**El hallazgo real, que sí queda abierto:** las **otras seis** solapas de `looker` registradas con
`uso = fuente` en `SOLAPAS` —`MAIL` (5760 filas), `IVR` (192), `SMS` (92), `CC` (1309), `DIGITAL`
(4591), `ALCANCE` (740)— **no tienen una sola fila en `MAPEO`**. Como `looker` es
`modo_periodo = filtrar`, cualquier lectura de ellas devuelve `«FALTA:fecha_periodo@looker/<solapa>»`.

Son **12.684 filas de detalle por canal, con `ID cuentas`**, declaradas fuente y no leíbles.

**Las dos salidas son distintas y la elección es del usuario:**

1. **Mapearlas** — pero su `firma_encabezado` en `SOLAPAS` **no trae ninguna columna de fecha**
   (son `Enviados/Entregados/Aperturas/Clics`, `Audiencia/Llamados/…`, `Alcance/Frecuencia/…`), así
   que no hay candidata a `fecha_periodo` que elegir. Mapearlas exige antes decidir de dónde sale
   su período.
2. **Bajarlas a `uso = revisar` o `ignorar`** si el detalle por canal ya lo cubre `digital`, que es
   lo que hoy usa la unión.

**No se escribió ninguna fila de `MAPEO`.** El camino declarado para poblar `fecha_periodo` es
`DIAG_FECHAS` → elección humana → `promoverFechasElegidas()` (`Fuentes.gs:21-30`, `S-02`):
*"detección automática, elección humana"*. Escribir la celda a mano saltearía ese mecanismo.

### P1 · La sección `m2` está declarada, tiene 31 tokens en la plantilla y no publica ninguno

Medido el 09/08/2026 a las 01:47 sobre `MARCADORES` vivo (`tools/snapshot.js`, sin pasar por
ningún `.gs`) y `SECCIONES` vivo.

**Los tres hechos:**

1. `SECCIONES` declara `m2` — orden 12, `modo = agregado`, `informes = JM,SECCO`,
   `familia_tokens = m2_`, `estado = activa`. Y cuelga dos sub-secciones, `m2_status` y
   `m2_caudal`.
2. `JM_marcada` tiene **31 tokens `m2_*`**: 8 en la lámina 9 (`m2_aperturas`, `m2_campanias`,
   `m2_clics`, `m2_ctor`, `m2_envios`, `m2_mails_entregados`, `m2_mails_enviados`, `m2_or`) y
   **23 en la lámina 10, que está *escondida***.
3. **`MARCADORES` no tiene un solo marcador de familia `m2_`.** 51 filas: 37 de `digital`, 14 de
   `rdv`, cero de `m2`, cero `m2_*`.

**Ojo con el "cero": no siempre fue cero.** El volcado `docs/_snapshots/MARCADORES_2026-08-01.tsv`
tiene una fila `m2_envios` (`base_id = m2`, campo `envios`, `periodo_ref = m2_mensual`,
`operacion = calcEnvios`). Hoy no está y **nadie registró su borrado**. Si desapareció por una
limpieza, conviene saber que existió.

**Por qué la sección está vacía — y no es "falta sembrar `MARCADORES`".** Eso ya está decidido:
**`D-17`** fija que el dueño de `MARCADORES` es **la plantilla**, no un `SEED_MARCADORES_`
(cerrado el 02/08). La causa es otra y está escrita en el seed desde el Paso 2.10 Parte C:
**`BASES.m2.hoja_default` está vacío a propósito** — *"m2 sin fuente activa para `m2_*`"*—, así
que los tokens `m2_*` emitirían `«FALTA:token»` aunque tuvieran fila.

**Y hay un segundo motivo, independiente:** 23 de los 31 tokens están en una lámina **escondida**,
que por `D-21` no entra al mapa de la corrida. Aunque se cableara `m2` entero, esos 23 no se
publicarían hasta que alguien decida mostrar la lámina 10.

**Lo que sí hay son datos, y están medidos.** Caso `2145-OCTVINGC` **en `digital/Directa Mail`**
—no en `m2`, el ámbito importa—: 24 filas, **528.825 enviados**, desglose por `Tipo de mail`:
`M2` 159.127 + `M2 | Post` 369.698, **ninguna `M2 | Pre`**. Y a escala de canal: de las 599 filas
de `digital/Directa Mail` con `Eje = M2`, **429 (71,6 %) son huérfanas** —137 ids, 5.111.516
enviados— y **349 (58,3 %) no declaran etapa**.

**Las tres preguntas que hay que responder antes de cablear un solo `m2_`:**

1. **¿De qué base sale M2?** `m2` no tiene fuente activa; los datos están en `digital/Directa
   Mail` con `Eje = M2`. Son dos respuestas distintas y sólo una es la del usuario.
2. **¿Qué señal define el universo M2?** `Eje = M2` da 599 filas; `Tipo de mail` que empieza con
   `M2` da 718. **No empatan**, y elegir mal es el error de la lámina 5 otra vez.
3. **¿La lámina 10 se muestra o no?** De eso depende si son 8 tokens o 31.

**No se cableó ningún `m2_`.** De qué fuente sale cada número es criterio del usuario, y el
riesgo de adivinarlo está medido: la lámina 5 publicó los encuentros de doce figuras durante
quince días pasando las cuatro verificaciones.

### P1 · `R-20` está escrita y no tiene mecanismo — falta una segunda ruta de lectura de `rdv`

`R-20` (09/08/2026) dice que para fechas pasadas `en agenda` cuenta como realizada **sólo para
contar**. Está escrita en `REGLAS_NEGOCIO.md` con el encabezado `⚠ SIN MECANISMO` y **no se puede
implementar con la configuración que hay**.

**Por qué no es expresable.** El corte por estado vive hoy en
`MAPEO.rdv/RVD JM-CM - ES/status.valores_incluidos = "Realizada"` (`D-21 Addendum 1`), y
`valores_incluidos` es una **lista estática**: no puede decir *"además `en agenda`, pero sólo si la
fecha ya pasó, y sólo para contar"*. `leerFuente` aplica toda lista blanca que encuentre, a todos
los consumidores de la solapa por igual.

**Lo que hace falta, nombrado:** una **segunda ruta de lectura** de `rdv/RVD JM-CM - ES` que no
pase por la lista blanca, usada **sólo** por el contador y el listador de encuentros.

**Lo que NO hay que hacer, y por eso queda escrito acá.** No agregar `en agenda` a
`valores_incluidos`. Eso la haría visible a **todos** los consumidores de la solapa —incluidos los
catorce marcadores `ecv_*`, que son sumas— y es exactamente lo que `R-09` impide. La regla acota;
tocar la lista blanca derogaría.

**Qué lo destraba:** un prompt propio con su Parte 0. No entra al `_10` ni a su addendum `10.1`,
que lo dejaron declarado a propósito.

**Dato para quien lo tome:** `en agenda` son **7 filas** en toda la historia de la solapa (1362
filas), medido el 09/08. `R-09` dice 6 — es del 31/07 y entró una más. El vocabulario de estado
está cerrado en cinco valores y no se movió en nueve días.

### P2 · `C.4` del `_10` retirado el 09/08 — la poda de derivados no puede correr todavía

`C.4` pedía retirar la fuente propia de `imp_total` y `contenidos_total` por ser derivados
(`X-10`, `X-11`). **Se retiró entero** por el `10.1` §3, y el motivo es concreto: aplicarlo
**borraría la única fila que hoy produce `imp_total`**, porque `imp_meta`, `imp_google` e
`imp_prog` **no existen en `MARCADORES`** — la familia `imp` tiene una sola fila. Y
`contenidos_total` no tiene fila propia, así que no había nada que podar.

**Qué lo destraba:** que existan `imp_meta`, `imp_google` e `imp_prog` como filas de
`MARCADORES`. Y eso, a su vez, depende de una medición que **todavía no cerró**: de dónde salen
esos tres números.

⚠ **Medido el 09/08 y en contra de la hipótesis que estaba en juego:** no se reproducen desde
`digital/CAMPAÑAS_DESGLOCE_DIGITAL`. De las **436 filas que solapan la ventana 24–31/07**, la
columna `JM | GCBA | POLICIA` da **GCBA 431, `Sin Tipo` 5 y JM cero**. Las filas `JM` de esa
solapa existen —107 en total— pero **se cortan en abril de 2026**. Cruzando por `Id cuentas`
contra las 166 cuentas JM de `digital/Digital`: 34 filas en toda la historia, **0 en la ventana**.
Los valores publicados (Meta 716.650 · Google 531.403 · Programmatic 5.194.898) **no salen de ahí
con ningún corte JM**.

### P0 · `X-16` — ¿de qué fuente salen los `imp_*` del resumen ejecutivo? `CAMPAÑAS_DESGLOCE_DIGITAL` está descartada por medición

**Pregunta dirigida a la rama de validación**, con caso numerado para que sea citable.

**`X-16`** — El deck publica `imp_meta` **716.650**, `imp_google` **531.403** e `imp_prog`
**5.194.898** (total 6.442.951, `X-10`). **De qué fuente salen no se sabe**, y la única candidata
registrada quedó descartada el 09/08:

- De las **436 filas** de `digital/CAMPAÑAS_DESGLOCE_DIGITAL` que solapan la ventana 24–31/07, la
  columna `JM | GCBA | POLICIA` da **GCBA 431, `Sin Tipo` 5 y JM cero**.
- Las filas `JM` de esa solapa **existen —107— pero se cortan en abril de 2026**. Ninguna en
  julio ni agosto.
- Cruzando por `Id cuentas` contra las **166 cuentas JM** de `digital/Digital`: **34 filas
  históricas, 0 en la ventana**.

**No falta afinar el join: no hay filas.** La otra solapa registrada con `Plataforma` e
`Impresiones` juntas es `looker/DIGITAL` (4591 filas), **hoy ilegible** — `looker` es
`modo_periodo = filtrar` y esa solapa no tiene `fecha_periodo`.

**No se propone ninguna fuente candidata**, a propósito. Cualquier hipótesis que aparezca va
marcada como hipótesis y sin código atrás.

**Consecuencias ya tomadas:** el `_13` anunciado **se cancela** (su motivo era este cruce), y
`C.4` queda retirado con razón — la poda habría borrado `imp_total`, la única fila que hoy
produce un número, para reemplazarla por tres que no pueden crearse.

### P1 · Los seis `pauta_*` publican `1` donde el deck dice 7/14/9 — es universo, no operación

⚠ **Este pendiente reemplaza a un hallazgo mío del 09/08 que era falso** y que llegó a un prompt
(`_12` §2). Queda la corrección, no el error.

**Lo que se creyó:** que las columnas `Google` / `Programmatic` / `Meta` de
`digital/Seguimiento digital` eran texto `"true"`/`"false"`, y que los seis marcadores con
`operacion = SUMA` publicaban **un cero falso**.

**Lo medido el 09/08 contra el motor:** los seis publican **`estado = ok`, `valor = 1`**. Las
celdas son **booleanos reales** —`typeof` da `boolean` en 950 de 979 filas— y `Number(true) === 1`,
así que **`SUMA` sobre una columna booleana es exactamente el conteo de `true`**. La operación
está bien. *(El error de medición: `String(celda)` antes de mirar el tipo convierte `true` en
`"true"` y disfraza un booleano de texto.)*

**El problema real, que sí queda abierto:** `pauta_google` publica **1** y `X-11` pide **7**. Dos
señales, las dos en la traza del propio motor:

1. **`72 de 979 fila(s) · 220 sin fecha, excluidas.`** El recorte por ventana deja afuera 907
   filas, 220 **por no tener fecha**. **Hipótesis, marcada como hipótesis y sin verificar:**
   `Seguimiento digital` podría comportarse como `snapshot` —el resto de `digital` lo es
   (`BASES.digital.modo_periodo = snapshot`)— en cuyo caso la ventana no debería intervenir.
   **No escribir código contra esto.**
2. **Los seis no tienen filtro.** `pauta_*` y `gcba_pauta_*` publican **el mismo número**: no hay
   corte JM/GCBA en la familia entera. El token de GCBA publica el de JM.

**Qué lo destraba:** decidir el universo de la familia `pauta` — si va por ventana o por snapshot,
y con qué corte JM/GCBA. **Prompt propio.** No cambiar la operación: está bien.

### P1 · `rdv/RDV_otros_ministros`: arreglar `C-09` rompe el `MAPEO` en silencio — van en el mismo commit

**Atado a `C-09`** (`docs/casos_validacion_2026-08-09_addendum.csv`: *"encabezados corridos una
columna respecto de los datos"*).

`MAPEO` declara `rdv/RDV_otros_ministros/fecha_periodo` y **resuelve a `hora_cita_evento`**, la
columna de la *hora*. Y **funciona**: `contarLecturaBase_` da 514 filas totales, 10 en la ventana,
**0 sin fecha y 0 con fecha inválida**.

**Funciona porque los encabezados están corridos una columna.** Es un **acierto por compensación
de dos errores**: el mapeo apunta al dato correcto con el nombre equivocado.

⚠ **El día que `C-09` se arregle, esta lectura no va a fallar: va a leer otra columna.** Sin
error, sin `«FALTA»`, sin señal. Ministros se rompe en silencio.

**La acción, cuando se tome `C-09`:** rehacer el `MAPEO` de esa solapa **en el mismo commit** que
el corrimiento. No antes —el mapeo corrido es correcto mientras la solapa esté corrida— y no
después.

**Y el segundo motivo por el que `R-20` nació `SIN MECANISMO`, que se anota en la misma marca y no
en una nueva:** esa solapa tiene **un solo campo en `MAPEO`**. No están `figura`, ni `inscriptos`,
ni `asistentes`, ni el estado. **La cascada que la segunda mitad de `R-20` necesita no es
ejecutable**, y el filtro `figura!=Jorge Macri` de la fila "ministros" de `C.2` tampoco. Los 8 de
8 de `V-49` se validaron **a mano contra las bases**: ciertos como número, falsos como cableado.

### P1 · Línea de base del `hoja_default` de `digital` — 1297 filas congeladas informadas como buenas

**Medido el 09/08/2026, antes de mover nada**, para que el control del movimiento tenga contra qué
compararse (`2026-08-09_1.3` §2).

`contarLecturaBase_('digital')` **hoy**, con `BASES.digital.hoja_default = "Digital"`:

```
hoja: "Digital"   modo: "snapshot"   columna_fecha: null
filas_totales: 1297   filas_en_ventana: 1297
filas_sin_clave: 337   filas_vacias: 3
```

**La ventana no interviene** —`digital` es `snapshot`, así que `leerFuente` la ignora— y por eso
`filas_en_ventana` es igual a `filas_totales`. El recorte a 72 que aparece en la traza de los
marcadores lo hace el Generador después, no `leerFuente`.

**Ésta es la magnitud del problema que el movimiento arregla:** el diagnóstico de la base
`digital` viene informando **1297 filas de una tabla cuyos datos JM terminan en diciembre de
2025**, y **337 de ellas no tienen clave**. Da verde sobre datos muertos.

**Predicción declarada antes de correr el movimiento**, para que el control sea una igualdad y no
un *"cambió"*: con `hoja_default = "Seguimiento digital"` se espera
**`filas_totales: 979` y `filas_en_ventana: 979`**, `modo: snapshot`, `ventana_aplicada: null`.
**Si da 72, la predicción está mal y hay que entender por qué antes de seguir** — significaría que
`leerFuente` recorta donde se creía que no.

### P1 · `ignorar` no cubre el camino directo — el hueco que `R-22` no puede cerrar

`uso = ignorar` corta en **un solo lugar**: `Config.gs:244-247`, dentro de `buscarMapeo`. Ni
`abrirHoja` (`Fuentes.gs:78`) ni `leerFuente` (`:613`) consultan `usoSolapa_`, y **está declarado
a propósito** (`Fuentes.gs:623-625`).

**Consecuencia:** `ignorar` **apaga los marcadores** que leen de esa solapa —pasan a
`«FALTA:…@solapa_no_fuente»`, visible y con motivo— pero **no apaga la solapa**. Diagnósticos,
auditorías y cualquier llamada directa la siguen leyendo.

**El hueco:** si aparece una solapa congelada que **además** se lee por camino directo, `ignorar`
no alcanza y **no hay mecanismo**. Hoy no pasa —por eso `digital.hoja_default` se mueve a
`Seguimiento digital`— pero la próxima vez puede no haber un `hoja_default` que mover.

**Qué lo destrabaría:** que `abrirHoja`/`leerFuente` consulten `uso`, o una guarda equivalente en
el camino directo. **No se hace acá**: cambiaría el comportamiento de todos los diagnósticos y es
decisión de diseño.

### P2 · `menuArmonizarPlantillas_` escribe sobre una plantilla viva y no pide confirmación

Detectado el 09/08 al buscar el patrón de confirmación para el sellador (`_11` `0.4`).

`menuArmonizarPlantillas_` (`Armonizar.gs`) **escribe sobre la plantilla** y su única interacción
es `ui.alert(..., ui.ButtonSet.OK)` en `:755` y `:789` — o sea **informa después**, no pregunta
antes.

**Hay dos precedentes opuestos en el repo y ninguno es "el patrón":**

| función | qué hace | confirmación |
|---|---|---|
| `menuArmonizarPlantillas_` | escribe la plantilla | **ninguna** — `ButtonSet.OK`, informa al final |
| `menuConsolidarMapeoLooker_` (`Solapas.gs:546`) | escribe hojas de registro | **previa**, con el detalle y un *"¿Confirmás?"* |

**El `11.1` §3 eligió el de `Solapas.gs` para el sellador**, con el motivo escrito: el backup
obligatorio de `C-01` protege contra el error, la confirmación protege contra el arrepentimiento,
y una plantilla no tiene `git`.

**Lo que queda abierto es la armonización, que ya existe y sigue sin confirmar.** No se tocó acá:
es otra función y otro prompt. **Qué lo destraba:** una pasada que le agregue el diálogo previo
con el detalle de qué plantillas y cuántos renombres va a aplicar.

⚠️ **No es urgente pero tampoco es cosmético:** `armonizarPresentacion_` sí hace backup y sí
aborta si el backup falla (`Armonizar.gs:424-431`), así que el dato está protegido. Lo que falta
es el paso donde una persona puede decir "no, hoy no".

### P2 · La asignación de láminas a informes: la sección declara, la lámina sólo se aparta

**Escrito ahora para que no nazca torcido, sin columna todavía** (`11.2` §3).

Hoy la asignación existe **sólo a nivel sección**: `SECCIONES.informes` con valores `JM`, `SECCO`
o `JM,SECCO`. La numeración corrida de `lamina_id` —global, no por plantilla— existe justamente
para que mañana se pueda asignar **una lámina sola o una sección entera** a un informe, y que el
id alcance para nombrarla sin arrastrar de qué plantilla salió.

**Cómo tiene que ser cuando se construya:**

> **La sección declara; la lámina sólo se aparta.** `SECCIONES.informes` es el valor por defecto
> de todas sus láminas. **`LAMINAS.informes` vacío significa "hereda"**, y sólo se completa cuando
> esa lámina difiere de su sección. **Dos lugares declarando lo mismo se desincronizan; uno
> declarando y otro apartándose, no.**

Es el mismo criterio que ya rige `LAMINAS.seccion_id`, `modo`, `itera_sobre` y `filtro`: celda
vacía = hereda, no "sin declarar" (`PLAN.md` §2).

**No se agregó la columna en la corrida del `_11`**, a propósito: `LAMINAS` nace con trece
columnas y la primera corrida viva no es el momento de sumar un campo **sin consumidor**. Un campo
que nadie lee se llena mal la primera vez y nadie se entera.

**Qué lo destraba:** que exista un caso real de una lámina que difiera de su sección. Hoy no hay
ninguno registrado.

### P1 · `R-15 Addendum 2` — CC e IVR son un canal con dos etapas: decidido, pendiente de mecanismo

**Decisión del usuario, 09/08.** **No se escribe como regla todavía**, y el motivo es la regla de
`CLAUDE.md` §4: lo que la destraba —`looker/Cuentas` a `fuente`— **está en la cola**, es la Parte A
del `2026-08-09_1`. Una regla marcada `SIN MECANISMO` cuyo destrabe está a un prompto de distancia
sería una marca que hay que sacar a mano.

**Lo decidido, para que no se pierda:** Call Center e IVR **no son dos canales y tampoco son lo
mismo**. Son **una sola operación telefónica** que dos tablas registran en momentos distintos. La
tabla de `R-15` declara la señal de IVR y **nunca declaró la de la otra etapa**.

| etapa | qué mide | dónde se lee | señal de JM |
|---|---|---|---|
| **barrido y contacto** | `Base barrida`, `Contactados`, `Efectivos` | `looker/CC` × `looker/Cuentas` | **`nombre_campaña` contiene `JM`** — nueva |
| **llamado y escucha** | `Llamados`, `Atendidos`, `Escucharon +75%` | `digital/Directa IVR` | `Vocero = JM` — ya estaba |

GCBA por resta en las dos, igual que el resto de la tabla de `R-15`.

**La consecuencia que hay que escribir cuando se escriba la regla: las dos etapas NO comparten
población.** Una cuenta puede estar en una y no en la otra, así que **ni la señal ni el universo
se propagan entre ellas**. Y **`cc_campanias` e `ivr_campanias` cuentan cosas distintas y no se
suman**: un total único de "campañas telefónicas" sacado de las dos tablas cuenta dos veces las
cuentas que están en ambas.

⚠ **La señal de CC NO se hereda de IVR, y está medido.** `digital/Directa IVR` tiene `Vocero` con
`JM`/`GCBA`, y `3387-JULJDGGC` figura ahí con `Vocero = JM`. Pero **`3289-JUNJDGAG` —la cuenta que
produce los 6.011 y los 1.878 publicados— no está en `Directa IVR` en absoluto.** Heredar la señal
de IVR deja la base discada de la lámina 2 en cero.

**Qué lo destraba, en este orden:**

1. **La Parte A del `2026-08-09_1`** pone `looker/Cuentas` en `fuente`, acotada a dimensión.
2. Con eso el join `looker/CC × looker/Cuentas` es expresable y **el mecanismo existe**.
3. **Recién ahí se escribe `R-15 Addendum 2`, sin marca**, con su alcance y su "cómo se verifica".

**Y dos cosas medidas el 09/08 que hay que tener a mano cuando se cablee:**

- **`looker/CC` no tiene la columna `nombre_campaña`.** Su firma es `ID Cuentas · Base enviada ·
  Base barrida · Contactados · Efectivos`. La señal sale del **join**, no de la solapa.
- **`Base enviada` llega corrupta en el export** —serial de Excel mal formateado, se lee como
  fecha—. Si el motor la lee como fecha, falla. `cc_base` es **`Base barrida`**, no `Base enviada`.

### P1 · Tres listas de hojas de registro que deben coincidir por convención, no por mecanismo

Detectado el 10/08 al re-correr el censo del `_19`: **`LAMINAS` no aparecía** aunque existía desde
el 09/08.

**Las tres listas, y la duplicación es correcta:**

| lista | dónde | por qué está duplicada |
|---|---|---|
| `ALCANCE_REGISTROS_` | `Instalar.gs` | la del motor |
| `HOJAS_REGISTRO` | `tools/escritores.js` | *"leerlo del código bajo prueba anularía la independencia"* |
| `HOJAS` | `tools/snapshot.js` | ídem — el snapshot es el contra-qué del diff |

**El problema no es la duplicación: es que el desajuste no falla.** Cuando `LAMINAS` nació con el
`_11`, sólo `ALCANCE_REGISTROS_` la incluyó. El censo la mandó al anexo de *"no es de registro"*
**sin avisar**, y `docs/_snapshots/` nunca tuvo su TSV — o sea que la hoja estuvo **un día sin
respaldo declarado y sin figurar en la matriz de escritores**, y nada lo señaló.

Las tres quedaron alineadas en **once** el 10/08.

**Qué haría falta:** que el desajuste falle en vez de pasar inadvertido — un control que compare
las tres y rompa, corrible desde `tools/`. **No se implementó acá a propósito**: las dos
herramientas son deliberadamente independientes del motor, así que el control tiene que leer las
tres sin volver dependiente a ninguna, y eso es diseño.

**Y va a volver a pasar** en cuanto nazca la hoja doce.

### P2 · No existe respaldo del spreadsheet de control

El `_19` `B` pedía *"backup de la planilla antes de escribir"* y **no hay con qué**:
`backupPlantilla_` (`Armonizar.gs:399`) copia **Slides**, y su carpeta cuelga de
`CONFIG.carpeta_plantillas`. Los tres `makeCopy` del repo son de plantillas.

**Ningún escritor de hoja de registro respalda nada** — ni `upsertPorClave_`, ni
`sembrarSecciones_`, ni `inventariarSolapas`, ni `sellarPlantilla` cuando escribió las 51 filas de
`LAMINAS`.

**Lo que se usó en su lugar**, por el `19.1` §3.1: el TSV de `docs/_snapshots/` vía
`tools/snapshot.js`, corrido antes de la primera escritura, **uno por corrida y no uno por
llamada**. Más el registro por celda que devuelve `escribirColumnaLaminas_` —`anterior` y
`nuevo`—, que para tres celdas es más útil que un archivo de 51 filas.

**Qué lo destrabaría:** decidir si hace falta una copia del spreadsheet entero, y con qué
criterio. Hoy no está especificado: qué se copia, a qué carpeta —`_backups` cuelga de
`carpeta_plantillas`, que es de Slides—, con qué nombre, y cada cuánto. **Este prompt es el caso
que la pidió**; no se implementó de contrabando.

### ~~P1 · `REVISAR` no existe como estado de marcador~~ — CERRADO (08/08/2026)

**Existe.** Es el cuarto estado, entró por el mismo camino que los otros y **cuenta en el
resumen de la corrida** (`revisar`). El corte es **valor vacío Y hubo rechazos**: una lista que
publica tres de cinco sigue siendo `ok`, con sus dos rechazados en `FALTANTES`.

**No hizo falta tocar el pintado**, y se verificó antes de escribirlo: los dos puntos que pintan
preguntan `estado === 'ok'` y **todo lo demás cae al mismo camino** — publica `«FALTA:token»` y
deja su fila con el estado en el motivo. `REVISAR` **hereda el precedente** en vez de inventar
una forma nueva.

**Verificado con las dos pruebas en la misma corrida** (filas temporales, borradas al terminar):
todas rechazadas → `REVISAR` con 4 rechazados; cero filas → `sin_datos`. Y los siete marcadores
del día anterior **no se movieron**.

> **El texto original del pendiente queda abajo, sin editar** — explica por qué se abrió.

**Los estados que el motor asigna son tres:** `ok`, `sin_datos` y `error`. **`REVISAR` no
existe** — medido el 08/08 grepeando `Generador.gs`. Los `REVISAR` que hay en el repo son de
`Fechas.gs` y `preseleccion_fechas.gs`, y son el **`origen` de una columna candidata a fecha**
en `DIAG_FECHAS`: otro dominio, mismo nombre.

**Qué queda cubierto igual, y qué no.** La operación `LISTA` ya cumple lo que importa de
`R-18` punto 3: **un valor rechazado nunca llega al deck**, viaja en `rechazados`, sale en la
traza y **el despachador le emite su fila en `FALTANTES`** aunque el token haya publicado bien
el resto. Lo que falta es sólo el **estado**.

**El caso concreto que hoy sale mal:** si **todas** las filas se rechazan, la lista queda
vacía, el valor es `''` y el despachador lo baja a **`sin_datos`** — que es exactamente lo que
el addendum 1 de `R-18` prohíbe, porque *`sin_datos` afirma que no había nada*. Hoy la traza y
la fila de `FALTANTES` lo desmienten, pero el estado miente.

**No se inventó el estado en la corrida que lo encontró** (decisión del usuario, 08/08): crear
un estado nuevo toca la publicación, el conteo de la corrida y el listado de faltantes, y eso
es un prompt propio.

### ~~P2 · Sin dueño declarado: "¿qué operaciones tiene el motor?"~~ — CERRADO (08/08/2026)

**`CLAUDE.md` §7 ganó dos filas**, no una: *"¿Qué operaciones tiene el motor?"* → **`OPERACIONES_`
en `Marcadores.gs`**, y *"¿Cómo está configurada la herramienta?"* → **`.claude/`**, que era la
otra pregunta sin dueño que la corrida nocturna había dejado abierta.

**Ganó el candidato que el propio pendiente proponía**, y por su motivo: el mapa explícito es
**exacto por construcción y no puede envejecer**, así que el dueño es el código y no un `.md` —
el mismo criterio que la fila del inventario. Lo que la fila agrega es dónde se documenta una
operación nueva: **en su propio comentario**, con el motivo.

> **El texto original del pendiente queda abajo, sin editar.**

`CLAUDE.md` §7 **no tiene fila para esa pregunta** — verificado el 08/08 grepeando el archivo.
La respuesta hoy se lee del código (`OPERACIONES_`, `Marcadores.gs`), que es el mapa explícito
y por lo tanto **la lista es exacta y no puede envejecer**; pero nadie lo declaró como dueño,
así que cada operación nueva vuelve a plantear la pregunta *"¿y esto dónde se documenta?"*.

Pasó al agregar **`LISTA`** (la séptima, 08/08). El candidato natural es la fila que ya existe
—*"¿Cómo está construido el código y qué alcanza a qué?"*, cuyo dueño son los scripts de
`tools/` re-corridos— porque es el mismo criterio: **el código es la fuente, no un `.md` que se
desincroniza**. **No se agregó la fila sin decidirlo**: tocar §7 es cambiar el ruteo del
proyecto.

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
