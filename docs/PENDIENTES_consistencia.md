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

> **El día llegó, y no rompió nada — 10/08/2026.** Este pendiente predecía que *"el día que
> alguien mapee una segunda solapa de `looker` … `prueba_alcance` pasa a fallar con
> `«FALTA:@sin_solapa»` sin que nadie haya tocado ese marcador"*. El `_23` mapeó **dos**
> (`Cuentas` y `DIGITAL`), así que `solapasFuenteDeBase_('looker')` ya no devuelve una sola.
>
> **Se midió antes de escribir las filas y después:** en `MARCADORES` **ninguna** fila tiene
> `solapa` vacía, y las dos de `looker` —`imp_total` y `gcba_imp_total`— declaran
> `resumen_metricas_dinamico` explícita. `prueba_alcance`, el único marcador que dependía de la
> inferencia, **ya se había retirado**. `verificarLaminas()` VERDE 51/51 y las 11 pruebas del
> diff en verde después del cambio.
>
> **El acoplamiento sigue siendo real; lo que caducó es el ejemplo.** La entrada queda abierta
> porque la decisión que pide —o solapa explícita en todo marcador, o `MAPEO` declarando la
> solapa por defecto de cada base— sigue sin tomarse. Lo que cambió es que ahora **`looker` es
> una base con tres solapas mapeadas**, así que un marcador nuevo de `looker` sin `solapa` ya no
> "anda por casualidad": falla de entrada, que es el comportamiento correcto y llegó solo.

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

⭐ **Y desde el 22/08 sigue abierto pero ya no molesta a nadie: la slide 21 de `jm` —`L-050`, RRSS—
quedó FUERA DE ALCANCE por decisión del usuario y el usuario la escondió** (`D-39`;
`CONFIG_INFORMES.md` §1.11). **No se cierra por eso** —la colisión sigue en la plantilla— y por eso
queda acá: **es una de las cosas que hay que mirar el día que alguien vuelva a mostrar esa lámina**,
junto con los **21 tokens dormidos** que `CIERRE_POR_LAMINA.md` cuenta.


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

**Addendum · 21/08/2026 — dos afirmaciones de arriba están vencidas, y el pendiente NO se cierra.**
(`2026-08-21_16` Parte E. El texto anterior no se edita — `CLAUDE.md` §7.)

Medido sobre la hoja viva el 21/08/2026, leyendo `ANCLAJE_PENDIENTE` por API:

| lo que dice arriba | lo medido |
|---|---|
| *"la hoja está vacía —sólo el encabezado— desde que existe"* | **tiene dos filas de datos**, las dos sin `elegido` |
| *"nunca se ejecutó porque ningún caso cayó bajo umbral"* | **cayeron dos**, con su mejor candidato en **0,54** |

Las dos claves son `almagro|2026-06-16|` y `educacion|2026-06-16|`, las dos `tipo = reunion`, con
puntajes **0,54 / 0,50 / 0,50** cada una. ⭐ **Y no son un encuentro duplicado**, que era la
sospecha: `REUNIONES` tiene **dos filas distintas** para el 16/06, `Encuentro Temático` las dos,
con `nombre` `Almagro` y `Educación` — y **`mostrar` distinto**: `no` y `sí`. `D-29` documenta
sólo la segunda porque es la que se muestra.

⚠ **De ahí salió un hallazgo aparte que vale por sí solo:** `leerReuniones_` **filtra por
`mostrar`**, así que la fila `almagro` **hoy no podría escribirse** — quedó de una corrida
anterior. `registrarAnclajePendiente_` **nunca borra** y la hoja **acumula**. Eso es el límite 2
del addendum a `D-29`, y la pantalla del `2026-08-21_16` lo contiene marcando esas filas sin
borrarlas.

⭐ **Lo que sí cambia para este pendiente: el circuito ya no está entero sin usar — le falta la
última mitad.** El motor **escribió**, que es lo que nunca se había visto. Lo que sigue sin
probarse de punta a punta es que un `elegido` cargado **haga anclar** — eso es
`anclajeYaConfirmado_` y necesita una corrida.

⛔ **Y lo que NO cambia, que es la mitad que este pendiente reclama:** el score sigue saturando
en `1,00` y **el `2026-08-21_16` no lo toca**. Son **dos huecos distintos** y conviene no
confundirlos:

| caso | ¿pasa por `ANCLAJE_PENDIENTE`? | ¿lo cubre la pantalla nueva? |
|---|---|---|
| **cae bajo el umbral** | sí | **sí** — es lo que se construyó el 21/08 |
| **empata arriba del umbral** | **no** | **no** |

Los que empatan en el techo **no llegan a la hoja**: ahí actúa el desempate temporal y el motor
elige solo, que es el modo de falla del `3347`. Eso es de `scoreMatchDigitalRdv_`, sigue remitido
a `D-29` —*"no se toca por un caso"*— y **este pendiente sigue abierto por eso**. Que exista una
pantalla nueva **no debe leerse como que el circuito quedó cerrado.**


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


## Corrida nocturna del 26/08 (`2026-08-26_2`) — cinco cosas que quedan anotadas

### ⛔⛔ P0 · `tools/escritores.js` e `inventario.js` están en ROJO, y §7 los declara fuente de verdad

`node tools/escritores.js` muere con *«Llaves desbalanceadas tras limpiar `Generador.gs` (-2)»*, en
su dependencia `tools/inventario.js`. **Medido: da `exit=1` en los últimos 20 commits que tocaron
`Generador.gs`**, así que es viejo y no de esta corrida.

⭐ **Por qué es P0 y no higiene:** `CLAUDE.md` §7 declara, para *«¿cómo está construido el código y
qué alcanza a qué?»*, que la fuente son **«los scripts de `tools/`, re-corridos (`inventario.js`,
`escritores.js`) — nunca el `.md`»**. O sea: **el índice del repo señala como autoridad a un script
que no corre**, y el `.md` que sí se puede leer es una foto del 10/08 que el propio encabezado
declara envejecida. La pregunta se quedó sin dueño vivo y nadie se enteró.

⚠ **Es la misma familia que los autotests de la Parte G:** `tools/suites.js` corre `probar-*.js`, así
que ninguno de estos dos entra — **un instrumento que el runner no ejecuta es un instrumento que no
existe**. La diferencia es que éste **ya está roto**, no en riesgo de romperse.

**Consecuencia inmediata, y por eso se anota acá:** la ficha del escritor nuevo de `PERIODOS` en
`docs/ESCRITORES.md` §PERIODOS **se escribió a mano**, porque la matriz no se puede regenerar. Está
declarado dentro de la propia ficha.

**No se arregló en esta corrida**: es otro objetivo y `CLAUDE.md` §4 dice que mejorar no es ampliar.

---

### ⛔ P0 · `continuacion.laminas_etapa4_hechas` se emite y NADIE lo lee

`grep -rn "laminas_etapa4_hechas" *.gs` devuelve **una sola línea: donde se escribe.** El comentario
que la acompaña dice que existe *«para que la reanudación no repinte»*, y eso **no ocurre**: medido
en `tools/probar-reanudacion-identica.js` §4, **la tanda 2 re-resuelve todas las láminas**, incluidas
las que la tanda 1 ya pintó.

⚠ **El deck no se corrompe** —`replaceAllText` no encuentra `{{token}}` donde ya hay valor—, así que
**funciona por accidente y se paga dos veces**. El banco **fija el comportamiento de hoy** con una
afirmación explícita: el día que se implemente el salteo, se pone rojo, y eso es lo que tiene que
pasar.

**La decisión es del usuario:** implementarlo (la reanudación salta las láminas hechas) o retirar el
campo y el comentario que promete algo que no hace. Las dos son legítimas; lo que no puede quedar es
un campo que declara un contrato que no existe.

---

### ⚠ P1 · Las dos filas rotas de `PERIODOS` — no se tocan, por decisión del usuario

1. **`julio_24_30` está DUPLICADA.** La clave está referenciada en **119 líneas** del repo.
   ⛔ Y tiene una consecuencia que conviene tener escrita: **`leerPeriodos()` las colapsa** —es
   `leerRegistro_`, que hace `registro[clave] = obj` recorriendo—, así que **el motor ve 8 períodos
   donde la hoja tiene 9 filas**. Ninguna verificación lo señala.
2. **`'vie 14/08 -- jue 20/08 (por defecto)'`** es una **etiqueta de origen usada como clave
   primaria**. Tiene la misma ventana que `agosto_14_20`.

⭐ **El generador nuevo (`D-43`) las reporta en `claves_repetidas` en cada corrida y no las toca.**
Eso las vuelve visibles sin decidir por nadie.

---

### ⚠ P1 · ¿`tools/suites.js` tiene que correr los `--autoprueba`? — decisión del usuario, con el costo medido

De los **5** bancos con `--autoprueba`, **2 estuvieron rojos sin que nadie se enterara**, porque
`suites.js` los corre **sin** esa bandera. El segundo (`probar-tabla-post.js`) se arregló el 26/08 y
los cinco están en verde hoy.

El flag **agrega** un bloque, no reemplaza nada, y los bancos que no lo miran lo ignoran — así que
alcanzaría con pasárselo a todos.

| opción | costo medido |
|---|---|
| **correrlos** | **+475 ms sobre 8.957 ms de suite = +5,3 %**. Los cinco sin flag suman 1.327 ms; con flag, 1.802 ms |
| **no correrlos** | 0 ms, y el costo ya conocido: dos de cinco en rojo sin que nadie lo viera, y el segundo llevaba así desde una fecha que no se puede determinar |

**No se eligió**: es del usuario.

---

### ⭐ P1 · El aviso de ventana se corrigió por TERCERA vez — y el hallazgo es que no tenía un bug

`avisosDeVentanaPropuesta_` publicó algo falso en sus tres generaciones:

| # | fecha | decía | por qué era falso |
|---|---|---|---|
| 1 | `2026-08-20_2` | *«no se puede correr»* | la corrida es válida |
| 2 | `2026-08-22_22` §5 | *«no tiene fila en PERIODOS»* | `agosto_14_20` **era** esa fila |
| 3 | ⭐ **26/08** | *«las secciones repetibles NO se recortan por período»* | **falso desde el `_25`** (`fd226d1`, 22/08 13:21), cuando el motor pasó a recortar sobre ventana calculada |

⭐⭐ **Un aviso que se corrige tres veces no tiene un bug, tiene la fuente equivocada.** Las tres veces
decidía con **su propio criterio** —el prefijo del `origen`— mientras el motor decidía con otro. Y el
dato correcto **ya estaba calculado treinta líneas más abajo**, sólo que se usaba para redactar el
consejo y no para decidir si el aviso corresponde.

**Cerrado el 26/08:** el aviso llama a `periodosQueDescribenLaVentana_`, que es con la que el motor
decide, y `tools/probar-aviso-ventana.js` afirma que el panel **no tiene un cálculo propio** sobre
`leerPeriodos()`. Eso es lo que impide la cuarta generación. Se anota igual porque **la figura vale
más que el caso**: cada vez que un aviso y el motor tienen dos cálculos, el próximo arreglo ya está
escrito.

---

## Preguntas al equipo — abiertas, esperando respuesta humana

> Dueña de la pregunta "¿qué se le preguntó al equipo y sigue sin respuesta?"
> (`CLAUDE.md` §7). No son inconsistencias documentales: son preguntas de dominio que
> nacieron en documentos hoy congelados y necesitan un lugar vivo. Al responderse, la
> respuesta va al documento dueño del hecho y la pregunta se tacha acá.

### 2026-08-24 · `camp_audiencia1-3` y `camp_formato1-3` (`L-043`): ¿son texto del equipo?

> ⭐ **DECIDIDO el 24/08 con la evidencia de abajo: van como TEXTO DEL EQUIPO** — decisión del
> usuario. **Y es REVERSIBLE a propósito: si el equipo contesta que hay fuente, se cablean.** La
> decisión vive en `docs/CONFIG_INFORMES.md` §2.5 (`[MANUAL]`, la fila dueña de *qué va a mano*);
> **la pregunta sigue abierta acá**, que es lo que la hace reversible en vez de un cierre.
>
> ⚠ **Lo que hay que entender antes de revertirla:** hacen falta **(a)** una columna de formato que
> hoy no existe, **(b)** la audiencia digital fuera de una solapa `ignorar` y **(c)** una decisión
> editorial sobre el desborde. Con (a) y (b) sin resolver, (c) no se llega a preguntar.

> ⚠ **La pregunta correcta no es «con qué operación se cablean».** El censo del 22/08 ya había
> decidido eso —*«son indexados de UNA columna: caen en `ELEMENTO`, no en la décima»*— y **da
> igual**: lo que falta es la **fuente**, y ninguna primitiva la fabrica.

**Medido el 24/08 sobre los decks de las dos semanas que hay en disco y sobre las 13 solapas
`fuente` de las tres bases.**

#### `camp_formato1-3` — no hay columna, y la que se le parece no sirve

- **Cero columnas «Formato»** en las solapas `fuente`. Los 16 aciertos de un barrido por contenido
  —`placa · bumper · demand gen · banner · carrusel · reel · story`— son todos **nombres de
  campaña** que casualmente traen la palabra (`Carrusel Refugios climáticos`, `Reels Experiencias
  BA`).
- **La única candidata real es `CAMPAÑAS_DESGLOCE_DIGITAL.Nomenclatura` (col L)**, un string con
  pipes que **a veces** trae el formato al final: `… | Geo CABA | Geo Story`, `… | Carrusel |
  Demand Gen`. ⛔ **Pero su cantidad de campos y su orden varían** —9, 7, 6— y, sobre todo,
  **para la campaña destacada del 14-21/08 sus dos filas NO traen formato**: la de Meta termina en
  el nombre de la campaña y la de Google en `YouTube |`. Parsear esa columna sería inventar un
  campo que en el caso que hay que reproducir **no está**.
- Lo que el equipo publicó: **3 ítems** el 31/07 —`Meta: Placa y video`, `Google: Placas Demand
  Gen, Bumpers y Videos de YouTube`, `Programmatic: Banners y Videos`— y **1** el 20/08 —`Video
  Meta, YouTube y Programmatic`—. Son **frases compuestas a mano**, una por plataforma cuando
  difieren y una sola cuando coinciden.

#### `camp_audiencia1-3` — hay fuente para la mitad, y el equipo la reescribe

- La fuente del lado mail existe y está mapeada: `digital/Directa Mail.mail_segmentacion` (col J).
- ⛔ **Pero de los 5 ítems que el equipo publicó el 20/08, CERO están literales en ella.** El
  equipo **acorta y reescribe**: `Barrios cercanos interesados en seguridad ( Flores, Parque
  Avellaneda, …)` sale publicado como `Interesados en seguridad de barrios cercanos`, y
  `Apertores de los envios Operativo Saturacion en el barrio 1.11.4 y Orden en la villa 31.` como
  `Apertores de envíos similares`.
- ⛔ **Y uno de los cinco no es de mail:** `Vecinos de la Ciudad Autónoma de Buenos Aires` es la
  audiencia **digital** —el bloque se rotula *«Digital y Directa»*—, y vive en `digital/Digital`,
  que es `uso = ignorar`.
- ⛔ **Además desborda las cajas:** la campaña tiene **4** segmentaciones distintas y la plantilla
  **3** ranuras; el equipo publicó **5** el 20/08 y **4** el 31/07. `opELEMENTO` con
  `separador = 3` **falla a propósito** en ese caso —*«qué hacer con el resto es decisión
  editorial y el motor no la toma»*— y sin `separador` publicaría las 3 primeras **en silencio**,
  que es tomar esa decisión sin decirlo.

#### La pregunta, en una frase

**¿Estos seis los escribe una persona, como los `camp_bench_*` y los `camp_*_insight`?** Todo lo
medido apunta a que sí. Si la respuesta fuera que no, hace falta **(a)** una columna de formato que
hoy no existe, **(b)** la audiencia digital fuera de una solapa `ignorar`, y **(c)** una decisión
editorial sobre el desborde de 4-5 audiencias en 3 cajas.

⚠ **No se cablearon, y cablearlos con lo que hay publicaría texto distinto del que el equipo
publica** — el modo de falla de esta lámina no es un número raro, es una celda que se lee bien y
dice otra cosa.

---

### 2026-08-24 · ¿De dónde salen `Campañas`, `Período` y `Formato` de `L-036`? — **sin prioridad**

> ⚠ **No bloquea nada y así lo decidió el usuario (24/08): se anota y se sigue.** Las otras cinco
> columnas de la lámina ya tienen fuente, `MAPEO` escrito y control (`tools/probar-mapeo-post.js`).

`L-036` —*"Digital | ECVs: post reuniones"*— es una tabla de **8 columnas × 4 filas**, y la fila es
**una reunión del temario que tuvo comunicación post** (usuario, 24/08). La fuente es
`reuniones/Agenda JM | Post`, la que `C-50` empareja con la PRE por `ID`.

**Cinco de las ocho columnas están en esa solapa y quedaron mapeadas el 24/08.** Las otras tres
**no existen en ninguna solapa `fuente`** — ni de `reuniones` ni de `digital`:

| casillero | encabezado en la plantilla | qué se buscó |
|---|---|---|
| `post_camp1-4` | **Campañas** | ninguna columna de `Agenda JM \| Post`. Los `Nombre campaña` que hay son de `digital` y nombran **campañas digitales**, no la comunicación post de un encuentro |
| `post_periodo1-4` | **Período** | sólo hay `E Fecha`, **una** fecha; «período» sugiere un rango como el *"del 10/08 al 24/08"* que el equipo publica en otras láminas |
| `post_formato1-4` | **Formato** | **cero columnas «Formato»** en las diez solapas `fuente` de las dos bases |

**Cómo se midió, para que se pueda repetir:** barrido de los encabezados (filas 1 y 2) de las diez
solapas `fuente` por `formato|campa|período|pieza`, sobre el fixture del 20/08
(`DGPLES _ Seguimiento ECVs` y `Seguimiento Digital`, sha `f8ef3227…`).

⭐ **Lo que hace falta del equipo es una frase, no un archivo:** ¿de dónde sacan esas tres celdas
cuando arman la lámina a mano? Puede ser una columna que nadie mapeó, otra solapa, o carga manual —
y en el tercer caso la respuesta correcta es que **no se cablean**, como los `camp_*_insight`.

⛔ **Lo que NO se va a hacer mientras tanto, y está guardado por control:** elegir una columna que
«parezca». `tools/probar-mapeo-post.js` afirma en negativo que los tres **no** tienen fila en ningún
seed, y se pone rojo si aparece una. Una columna elegida a ojo para llenar un casillero **no falla:
publica**, que es como nace un número plausible.

---

### 2026-08-22 (tarde) · La tercera: ¿qué cuentas entran en el bloque Call Center? — `X-28`

> ⛔ **Bloquea el cableado de los cuatro `cc_*`.** El `MAPEO` de `looker/CC` ya está escrito y la
> definición de la columna está validada `exacto` (`V-105`); **lo único que falta es esto**.

**3 · El bloque Call Center del Resumen publica UNA SOLA CUENTA. ¿Cuál, y por qué ésa?**

**Todo lo medible está medido**, y ninguna regla escrita reproduce la selección:

| candidato | da, para 24–31/07 | el deck publica |
|---|---|---|
| pertenencia sola (`ventana_ref` → `Cuentas`, `R-16`) | **18 cuentas · 22 filas · 100.197** | 2 · 6.011 |
| `nombre_campaña CONTIENE JM` — la clave de `V-64` | **2 cuentas · 5 filas · 13.965** | 2 · 6.011 |
| «las cuentas que el temario nombra» | ídem — julio nombra `3289` **y** `3387` | 2 · 6.011 |

⭐ **El primero es el gabinete entero** —`RDV Ministros | <cada ministro>`—, misma familia que
`R-15` addendum 1. Factor **16,7**.

⛔ **Y el filtro por nombre falla por los dos lados a la vez**, que es lo que lo descarta del todo:
deja entrar `3387-JULJDGGC`, que también dice «JM» y también es del temario, **y deja afuera la
cuenta correcta de agosto** — `3488-AGOJDGAG` se llama *"TE CUENTO | SALUD Eje Sur Viernes 14/8"* y
**no dice «JM» en ninguna parte**.

**Lo único consistente en los dos decks: una sola cuenta.** Julio `3289` (2 filas), agosto `3488`
(3 filas). **En julio el temario tenía dos cuentas con filas en `CC` y el deck usó una**, y no hay
columna, fecha ni nombre que diga cuál.

**Las tres formas que podría tener la respuesta**, para que se pueda contestar corto:
**(a)** *"es el encuentro destacado de la semana, lo elige una persona"* → hace falta una columna
que lo declare; **(b)** *"es el último / el primero del temario"* → es una regla y se cablea;
**(c)** *"debería ser la suma de todos y el deck de julio está mal"* → entonces el número esperado
es 5 filas / 13.965 y `V-64` hay que revisarlo.

⚠ **No se elige por descarte.** `CLAUDE.md` §4: *no inventar el faltante* — un supuesto razonable
metido en silencio es indistinguible de una instrucción y sobrevive a la corrida.

⚠⚠ **Y un dato que hay que pasarle a quien conteste, porque cambia lo que puede afirmar:** la
ventana de una cuenta **se extiende sola**. `3289-JUNJDGAG` tiene `fecha_fin` = **30/07** en el
export del 31/07 y **20/08** en el del 20/08. Así que **una cuenta de junio cae dentro de la ventana
de agosto por pertenencia**, y cualquier regla que dependa sólo de fechas la va a tomar.

---

### 2026-08-22 · Las dos preguntas del Resumen Ejecutivo, con todo lo medible ya medido

> **Las dos salen del camino del fixture**, contra `Seguimiento Digital  2026-08-20.zip`
> (`sha256 f8ef3227…`, verificado). Se preguntan porque **el fixture no las puede contestar**: no
> es que falte medir, es que hace falta saber qué decidió una persona.

---

**1 · ¿De dónde salen los «Total de contenidos implementados» — 28 en JM y 270 en GCBA?**

> ## ⭐⭐ CONTESTADA el 26/08/2026 — el HECHO está definido; el CABLEADO no.
>
> **Medición del usuario sobre el panel de Looker, ventana 14–20/08.** El hecho es
> **«contenidos implementados»**:
>
> | | total | Meta | Google | DV360 |
> |---|---|---|---|---|
> | **JM** | **28** | 10 | 8 | 10 |
> | **GCBA** | **269** | 95 | 63 | 111 |
>
> ⚠ **Corrección al enunciado de abajo, que NO se edita: son 269 en GCBA, no 270.**
> La línea vieja queda como estaba —es lo que se preguntó— y la cifra buena es ésta, del
> 26/08. El desglose por plataforma cierra contra los dos totales: 10+8+10 = 28 y
> 95+63+111 = 269.
>
> ⛔⛔ **Y lo que se midió el mismo día CIERRA UNA PUERTA: el desglose NO es la fuente.**
> Sobre `digital/CAMPAÑAS_DESGLOCE_DIGITAL` con el criterio de solape de `R-16`
> (`Fecha inicio ≤ 20/08 && Fecha fin ≥ 14/08`) la ventana trae **327 filas y 291.799.818**
> impresiones, contra las **297 filas y 98.979.778** del panel: **2,95× las impresiones sobre
> 1,10× las filas.** Así que el dato semanal viene de una fuente que el motor no lee.
>
> ⭐ **Eso convierte «pendiente de cableado» en una LIMITACIÓN MEDIDA en vez de un pendiente
> sin causa**, que son dos estados distintos: uno espera trabajo, el otro espera una fuente.
> El número es **citable**; el marcador **no es cableable** desde ahí. La definición vive en
> `docs/CONFIG_INFORMES.md` §1.14.
>
> ⚠ **Lo que sigue abierto, y es sólo eso:** por qué fecha recorta el panel. La pista de más
> abajo —*«filas de `looker/DIGITAL` con un recorte que no es la ventana»*— **no la tocó esta
> medición**, que fue sobre el desglose. Sigue siendo el camino a probar.

**No es `digital/Seguimiento digital`, y está medido.** Las tres columnas que `MAPEO` declara como
`sd_pauta_google` (T), `sd_pauta_prog` (U) y `sd_pauta_meta` (V) **son flags 0/1**, no cantidades:

```
Google        927 ceros · 22 unos · 29 vacías
Programmatic  918 ceros · 36 unos · 24 vacías
Meta          912 ceros · 43 unos · 23 vacías
```

En la ventana 14–20/08 entran **75 filas por solape** y **una sola** tiene el flag prendido en cada
plataforma. **El fixture reproduce EXACTO el `1 · 1 · 1` que publica el motor**, así que el motor
lee bien: lo que está mal es la fuente.

**Las dos alternativas que se probaron y tampoco dan:**

| dónde se contó | Meta | Google | Programmatic | total |
|---|---|---|---|---|
| filas de `looker/DIGITAL` con `nombre_campaña~=JM` en la ventana | 16 | 10 | 15 | **41** |
| filas de las 2 campañas del temario | 2 | 2 | 3 | **7** |
| **el equipo publica** | **10** | **8** | **10** | **28** |

⚠ **41 y 28 están en el mismo orden**, así que la respuesta probablemente sea *"filas de `DIGITAL`,
pero con un recorte que no es la ventana"*. **Cuál es ese recorte es la pregunta.**

---

**2 · ¿Qué recorta el Resumen Ejecutivo, si a nivel campaña la definición ya coincide?**

⭐ **El dato que hace precisa la pregunta:** la lámina de campaña del propio deck del equipo **sí
reproduce** contra el fixture. Para la campaña `3509-AGOSEGGJ` (*Desarticulación de banda narco*),
el equipo publica `TOTAL 4.509.115` y el fixture da **4.721.383** — **+4,7 %, dentro del ±10 %**.

**Pero el agregado semanal no.** Recortando `looker/DIGITAL` por las **dos campañas del temario**:

| | Meta | Google | Programmatic | total |
|---|---|---|---|---|
| fixture, recorte por temario | 2.562.104 | **894.337** | 6.964.100 | 10.420.541 |
| **el equipo** | 2.167.036 | **905.782** | **3.415.037** | 6.487.855 |
| | +18 % | **−1,3 %** ✅ | **+104 %** ⛔ | +61 % |

**Google cierra. Programmatic queda al doble.** Y la desproporción dice que no es un problema de
filas: el equipo publica **10 filas** de Programmatic contra 15 (1,5×) pero **3,4 M contra 25,6 M**
de impresiones cuando se mira la ventana entera (7,5×). **Sobran filas de mucho volumen, no faltan
filas.**

**La pregunta, entonces, es una sola y concreta:** ¿el Resumen Ejecutivo suma **todas** las
impresiones de las campañas de la semana, o sólo **la parte de la semana** de campañas que
arrancaron antes? Las dos del temario corren 6/08–3/09 y 10/08–24/08, o sea que **las dos empezaron
antes de la ventana**, y prorratear explicaría que Programmatic —la de más volumen acumulado— sea
la que más se pasa.

⛔ **Lo que NO se hizo, a propósito:** seguir probando definiciones hasta que un número diera.
Adivinar hasta acertar es cómo se llega a un número correcto por el camino equivocado.

### 2026-08-21 · Las cinco decisiones que traba el `2026-08-21_4` (Parte A sin ejecutar)

**Todo lo medible ya está medido** — la propuesta de `seccion_id` para las 53 láminas, agrupada en
cinco casos, está en `docs/BITACORA.md`, entrada del 21/08. **Lo que queda es decidir.** Ninguna de
las cinco la puede contestar una medición.

**D1 · ~~¿Qué significa `LAMINAS.seccion_id` vacío?~~ — ✅ RESPONDIDA (usuario, 21/08): vacío pasa a significar «nadie la clasificó» y la lámina no entra a ningún bloque. Escrita como `D-37` en `PLAN.md`, que **supersede el comentario del seed** — y sólo para `seccion_id`: `modo`, `itera_sobre` y `filtro` siguen heredando.**

**La pregunta original:** El seed dice **hereda de `SECCIONES`**; la
Parte A.1 del `_4` dice **no se expande ni se resuelve**. ⚠ **Medido: la A.1 dejaría sin publicar 29
de las 53 láminas** — las 13 sin tokens, las 2 de modo `agregado` y las 14 de contenido fijo, entre
ellas **las portadas de las dos plantillas**. La medición le da la razón al seed: `seccion_id` sólo
tiene sentido para las repetibles. **Confirmar o corregir.**

**D2 · ~~Padre o hijo, para las 6 láminas con varias candidatas.~~ — ✅ CERRADA POR MEDICIÓN (21/08): ⭐ **nunca hubo ambigüedad.** `seccionesRepetiblesDe_` exige `modo = repetible` **y** `estado = activa` **y** `familia_tokens` no vacía, así que de cada grupo hay **una sola sección elegible**. `encuentro_iceberg` es `unica` + `revisar`: falla dos de las tres. La agrupación que reportaba «varias candidatas» cruzaba familias contra **todas** las secciones, que no es lo que hace el motor. ⚠ **El error era del instrumento, no del repo.**

**La pregunta original:** Las tres ambigüedades son de
jerarquía y se resuelven con **una** regla, no con seis decisiones:
`encuentro` vs `encuentro_iceberg` · `m2` vs `m2_status` · `m2` vs `m2_caudal`.
⭐ **Sólo el padre es `repetible`; los hijos son `unica`.** Si la regla es *"gana el padre
repetible"*, las seis se resuelven solas y no hace falta elegir de a una.

**D3 · ~~¿`ecv_*` es genérico?~~ — ✅ RESPONDIDA (usuario, 21/08): **sí, entre tipos de encuentro.**
Consecuencia directa: **el 1 a 1 NO necesita marcadores propios equivalentes — reusa los `ecv_*`.**
Es la misma conclusión que `docs/SECCIONES.md` Corrección 5 ya había sacado para `enc_`, y ya
estaba documentado en `TOKENS.md`, que lista la lámina 4 de `secco` reusando `ecv_comuna` y
`ecv_fecha` de `jm`. **No hay que renombrar nada.**

⚠ **El límite, que el "sí" NO cubre y hay que escribir para que no se lo lleve puesto:**
*genérico entre **tipos de encuentro*** no es *genérico entre **informes***. `TOKENS.md` deja un
contraejemplo vivo: **`ecv_poblacion` es *"Habitantes del Barrio"* en `jm` y *"Habitantes del eje"*
en `secco`**, y un eje agrupa varios barrios — **no puede ser el mismo cálculo**. Esa pregunta
sigue **sin cerrar** y `D3` no la contesta. Vive en `TOKENS.md` con su puntero.

⛔ **Y una cosa que hay que hacer a mano, porque el seed no llega:** el motivo se vació en
`SEED_SECCIONES_` (`Instalar.gs`), pero **`sembrarSecciones_` sólo inserta filas nuevas y nunca
actualiza** — decisión del usuario del 16/08, igual que `CONFIG`: la hoja manda
(`docs/ESCRITORES.md` §1 bis). Así que **la hoja viva sigue diciendo *"definir si es
genérico"*** hasta que alguien borre esa celda a mano. Sin esta línea, el cambio del seed se
leería como aplicado.

**La pregunta original:** Ya estaba escrito en `SECCIONES.encuentro_iceberg.falta`: *"ecv_* se
usa para ECV y para Uno a uno — definir si es genérico"*. **Medido:** `ecv_` aparece en **cinco**
láminas de tres contextos distintos — `jm` L-034 (con `ecv_alcance_semanal`), `jm` L-035 y L-052
(con `enc_`), `jm` pos 8 y `secco` L-005 (con `u1_`), y `secco` L-004 (solo, 2 tokens).

**D4 · ~~¿El 1 a 1 es una sección propia o una variante de `encuentro`?~~ — ✅ RESPONDIDA (usuario, 21/08): **variante de `encuentro`.** La lámina del 1 a 1 va **en vez del iceberg**, no además; el resto de los encuentros lleva iceberg, y la portada va en los dos casos. La condición está en `CONFIG_INFORMES.md` §1.10 y se implementa con `LAMINAS.filtro` (`D-37` punto 4).

**La pregunta original:** ⭐ **Existe en las dos
plantillas** —`jm` posición 8 y `secco` `L-005`— y **ninguna sección declara `u1_`**. Si es propia,
hay que crear la fila en `SECCIONES` con `familia_tokens = u1_` y decidir `itera_sobre`. Si es una
variante, hay que resolver antes cómo un marcador lee **otra solapa según el tipo de ítem** —
mecanismo que **hoy no existe** (medido en el `_3`: la solapa está clavada en la fila de
`MARCADORES` y `opciones.hoja_rdv` es una guarda, no un selector).

**D5 · ~~¿De qué solapa salen los 32 `u1_`?~~ — ⚠ ESTE BLOQUE ESTÁ MAL. Ver la auditoría del
21/08 al final de este documento: la solapa **ya estaba decidida desde el 14/08**
(`digital/CAMPAÑAS_DESGLOCE_DIGITAL`, `D-32`) y hay seis valores validados como `exacto`
(`V-21`…`V-26`). Lo que falta es el `MAPEO` de esa solapa. Se deja el texto original porque el
error de método —afirmar una ausencia sin greppear los documentos— es lo que vale.**

~~D5 · ¿De qué solapa salen los 32 `u1_`?** No tienen **ninguna** fila en `MARCADORES`, y ninguna
solapa de `rdv` se llama algo parecido a *uno a uno* — las dos con `uso=fuente` son
`RVD JM-CM - ES` y `RDV_otros_ministros`. ⚠ **Sin esto la lámina sigue en blanco aunque se selle y
se le declare sección.**

⛔ **Y una acción que no es una decisión pero bloquea igual: sellar la lámina 8 de `jm`.** No se le
puede escribir `seccion_id` a una fila que no existe. `probarSelladoSobreCopia('jm')` lo ensaya sin
tocar la plantilla; `sellarPlantilla('jm')` lo aplica.

---

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

> **Actualizado el 10/08/2026 por el `_23` — quedan cuatro, y las dos que salieron muestran cuál
> era la salida.** `DIGITAL` y `Cuentas` ya tienen filas en `MAPEO`.
>
> ⚠ **Y hay una premisa de este pendiente que era falsa: `Cuentas` también estaba `fuente` y sin
> mapear.** No eran seis solapas mapeables más una legible: eran **siete sin mapear**, y `Cuentas`
> no aparecía en la lista de arriba porque el conteo se hizo sobre las que no tienen columna de
> fecha. `Cuentas` sí tiene el par `fecha_inicio`/`fecha_fin` y **fallaba igual**, con
> `«FALTA:fecha_periodo@looker/Cuentas»`, por no tener la fila. Medido el 10/08.
>
> **La salida no fue ninguna de las dos que este pendiente ofrecía.** El punto 1 decía que
> mapearlas *"exige antes decidir de dónde sale su período"* — correcto, y la decisión resultó ser
> que el período **no sale de la solapa**: sale de otra, por referencia (`R-25` / `D-24`).
>
> **Lo que sigue abierto son cuatro:** `MAIL` (5760), `IVR` (192), `SMS` (92) y `ALCANCE` (740) —
> pero tres de ellas ya no están `fuente`: `SEED_SOLAPAS_` las bajó a `ignorar` por `R-22`. **La
> única que queda `fuente` y sin mapear es `CC` (1309 filas)**, y ahora tiene un camino: si su
> período tampoco está en la solapa, es el mismo `ventana_ref` a `Cuentas` que usó `DIGITAL`. No
> se hizo acá porque el `_23` construye la capacidad y no cablea (`CC` no tiene marcadores).
>
> **La objeción del último párrafo sigue en pie y por eso se respetó:** `promoverFechasElegidas()`
> es el camino de `S-02` para **elegir una columna de fecha** entre candidatas de una solapa.
> `Cuentas` no tenía candidatas que elegir —tiene el par explícito, `C` y `D`— y `DIGITAL` no
> tiene ninguna, así que no había elección humana que saltear: las cuatro filas nuevas se
> escribieron por `SEED_MAPEO_` + upsert, que es el otro escritor declarado en `ESCRITORES.md`.

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
  fecha—. Si el motor la lee como fecha, falla. ~~`cc_base` es **`Base barrida`**, no `Base
  enviada`~~ — **CERRADO (10/08/2026) por `C-17`**, con dos evidencias independientes del mismo
  deck (`V-64` y `V-66`) y su límite escrito al lado (`C-18`: un deck, no dos). Detalle en
  `docs/VALIDACION_2026-08-09.md` §4.3.

### ~~P1 · Tres listas de hojas de registro que deben coincidir por convención, no por mecanismo~~ — CERRADO (10/08/2026)

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

**CERRADO el 10/08 con `tools/listas.js`.** Lee las tres **por texto** —sin `require`, sin
ejecutar nada, sin que ninguna lea a la otra— y **falla con exit 1 si difieren**. La duplicación
queda intacta, que es lo correcto: cada archivo sigue siendo dueño de su copia y las dos
herramientas de `tools/` siguen siendo independientes del motor.

**Control positivo corrido:** sacando `LAMINAS` de `tools/snapshot.js` el script devuelve **exit
1** y nombra la hoja que falta; con las tres alineadas, **exit 0**. Un control que no falla cuando
debe no es un control.

**La lección, que es la que vale más allá de este caso:** un valor hardcodeado no es deuda por
estar escrito a mano — a veces la copia manual es el diseño, como acá. **Es deuda cuando nadie se
entera de que quedó viejo.** La salida no siempre es borrar la duplicación; a veces es hacer que
el desajuste falle.

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

### P1 · `gcba_imp_total` está subestimado por las campañas mixtas — hoy en cero, pero el orden es de millones

**`R-23` cierra formalmente y no semánticamente.** El corte `campana~=JM` / `campana!~=JM` es
complementario por construcción —`JM + GCBA = total`, sin solapamiento y sin resto— **pero las
campañas que nombran a JM y a GCBA a la vez caen enteras en JM y no aportan nada a GCBA**. La
decisión es del usuario (10/08) y está escrita en `R-23`; esto le pone el número al lado, porque
**una decisión editorial documentada en prosa no alcanza cuando el efecto es un número**.

**Medido el 10/08 sobre `looker/resumen_metricas_dinamico`, columna `digital_impresiones`:**

| campaña | fecha | impresiones |
|---|---|---|
| `CAMPAÑA JM + GCBA \| SEGURIDAD \| 600 desalojos en la Ciudad` | 13/03 | 12.263.676 |
| `CAMPAÑA JM + GCBA \| SEGURIDAD \| Operativo de Seguridad en Subte` | 18/03 | 9.045.006 |
| `GCBA + JM \| SEGURIDAD \| Desalojo de propiedad Anchoris 183` | 07/04 | 5.850.055 |
| `CAMPAÑA GCBA/AGENDA JM \| SALUD \| HTAL. ZUBIZARRETA` | 27/03 | 5.272.689 |
| `CAMPAÑA JM + GCBA \| SEGURIDAD \| Desalojo cuatro propiedades en Constitución` | 15/04 | 4.255.739 |
| **total del universo** | | **36.687.165** |

**En la ventana del informe (24–30/07): cero.** Las cinco son de marzo y abril, así que
**`gcba_imp_total = 2.027.888` de esta semana no está subestimado en nada.**

**Por qué queda abierto igual, y es lo que importa:** el desvío es **cero hoy y de orden
millonario cuando alguna caiga en ventana**. Las cinco son campañas de seguridad y salud de
Jefatura + GCBA, o sea el tipo de campaña que se repite. La primera semana que una entre,
`gcba_imp_total` va a estar corto **por millones y sin que nada falle** — el número va a verse
plausible, que es el modo de falla que este proyecto tiene nombrado.

**Qué lo destrabaría, y es decisión del usuario, no de implementación:**

- **Dejarlo como está** — una campaña mixta es de JM y punto. Entonces esto se cierra y basta con
  que la nota de `gcba_imp_total` lo diga, que ya lo dice.
- **Contarla en los dos lados** — y eso **no se arregla con el filtro**: `~=` y `!~=` son
  complementarios por construcción. Contar una fila dos veces exige otro mecanismo, y sería otra
  regla.
- **Un tercer valor** —`mixta`— con su propio token. Es lo único que no distorsiona ninguno de los
  dos, y es el más caro.

**Se mide con `medirDesvioCampanasMixtas('looker','resumen_metricas_dinamico','nombre_campaña','digital_impresiones')`.**
Vuelve a correrse por ventana: **el cero de hoy es de esta semana, no una propiedad.**

### P2 · ¿La etapa de barrido de CC sale de la dinámica de `looker`, sin join?

**Pregunta para la rama de validación. Code no la mide** — cerrarla exige comparar contra un deck
publicado, y eso corre en otra ventana.

**De dónde sale.** `looker/resumen_metricas_dinamico` tiene **`call_enviado`, `call_discado`,
`call_contactados`, `call_efectivos`**. `R-15 Addendum 2` quedó pendiente porque el barrido y
contacto de CC parecía necesitar `looker/CC × looker/Cuentas`, y **ese join no existe como
capacidad del motor**. Si esos campos son los mismos datos, la etapa sale de una solapa que ya
está mapeada, es legible, tiene `fecha_periodo` y ya tiene el corte de `R-23`.

**El caso tiene que cerrar los dos ejes. Con uno solo no alcanza.**

| eje | la pregunta | lo que ya está cerrado |
|---|---|---|
| **QUÉ columna** | ¿`call_discado` es `Base barrida`? | `C-17` cerró la semántica **discada = barrida** para `cc_base` — es lo efectivamente marcado, no la base cargada |
| **QUÉ universo** | ¿el de la dinámica filtrada por `campana~=JM` + ventana, o el del temario? | `C-15`: `cc_*` usa **el del temario** (`R-17`/`R-21`). Una cuenta con datos y fecha en ventana **queda afuera si el temario no la nombra** |

**Por qué los dos:** si sólo cierra la columna, **dos números pueden coincidir una semana por
casualidad** y el universo equivocado aparece la semana siguiente. Es el modo de falla de la
lámina 5 —número correcto, filas equivocadas— aplicado a un cierre.

**La consecuencia, que es lo que hace útil este pendiente.** Hoy el prompt de join tiene **dos**
motivos. Si esto se confirma, sobrevive **uno**:

- ~~la etapa de barrido de CC~~ → saldría de la dinámica, sin join;
- **el desglose por plataforma** (`A-01` a `A-03`) → **sigue en pie**: necesita `Plataforma` e
  `Impresiones` **juntas**, y eso sólo está en `looker/DIGITAL`.

**Uno en vez de dos cambia si el join se construye o se evita**, y ésa es la decisión que este
caso destraba.

### ~~P0 · `imp_total` y `gcba_imp_total` están cableados sobre una fuente que los casos no declaran — y además son derivados~~ — CERRADO (10/08/2026, `_25`)

**Los dos errores se cerraron, y el segundo no como estaba planteado.**

**El primero, la fuente:** los ocho tokens de impresiones salen ahora de **`looker/DIGITAL`,
columna `Impresiones`**, con la ventana por referencia a `Cuentas` (`R-25`, solape) — que es
exactamente lo que declaran `A-01` a `A-03`. Verificado por el control vivo: los ocho comparten
una sola fuente, `looker/DIGITAL/Impresiones`.

**El segundo, «no deberían tener fuente propia», se resolvió sin construir la derivación** y la
decisión está en `PLAN.md` `D-26`. El motor no tiene operación que sume otros tokens, y retirarle
la fuente a `imp_total` lo dejaba en `«FALTA»` para siempre. Lo que el pendiente objetaba no era
que tuviera fuente: era que tuviera **otra** fuente que la de sus sumandos. Hoy es la misma solapa
y el mismo corte, **sin la condición de plataforma**, así que:

```
imp_total  ==  imp_meta + imp_google + imp_prog
```

**es un control corrible y no una esperanza** — `controlParticionImpresiones_`, que lee los
filtros **tal como están cableados** y falla si dejan de particionar.

**Medido el 10/08, ventana `2026-07-24 → 2026-07-30`, 966 filas:**

| | filas | importe |
|---|---|---|
| `imp_meta` · `imp_google` · `imp_prog` | 16 · 14 · 21 | 2.091.730 · 1.672.839 · 25.429.523 |
| **`imp_total`** | **51** | **29.194.092** · delta contra la suma: **0** |
| `gcba_imp_meta` · `gcba_imp_google` · `gcba_imp_prog` | 91 · 94 · 146 | 32.515.196 · 50.773.340 · 165.787.851 |
| **`gcba_imp_total`** | **331** | **249.076.387** · delta: **0** |

⚠ **Lo que NO cierra este pendiente, y pasa a la ventana de validación:** los valores **no se
compararon con ningún deck**, a propósito. Y hay un dato que hace falta llevar allá: el valor
viejo de `imp_total` **se movió solo**. El `_22` lo midió en `6.084.893` el 10/08 por la mañana;
el mismo marcador, misma fuente, mismo filtro y misma ventana dio **`3.958.570`** esa misma noche.
`gcba_imp_total` pasó de `2.027.888` a `2.029.539`. **La base se mueve dentro del día**, así que
comparar cualquiera de estos números contra un deck armado antes es comparar dos fotos distintas.

> **El texto original del pendiente queda abajo, sin editar** — su tabla de casos es la que
> ordenó el trabajo.

**En revisión desde el 10/08. No revertido todavía**, a propósito: revertir sin decidir la fuente
correcta deja los dos tokens en `«FALTA»` y pierde la traza de lo que se probó.

**Qué se cableó el 10/08:** los dos pasaron de `digital/Digital` —congelada por `R-22`— a
`looker/resumen_metricas_dinamico`, con el corte de `R-23`. Publicaron `imp_total = 6.084.893` y
`gcba_imp_total = 2.027.888`, los dos con `estado = ok`.

**Qué declaran los casos del repo**, y son dos cosas distintas:

| caso | declara |
|---|---|
| `X-10` | `imp_total` = **6.442.951**, y es **DERIVADO**: `imp_meta + imp_google + imp_prog`. Textual: *"es derivado, **no necesita fuente propia**"* |
| `V-59` | `gcba_imp_total` = **116.016.433**, también derivado de sus tres `gcba_imp_*` |
| `A-01` | `imp_meta` → **`looker/DIGITAL × Cuentas`**, `nombre_campaña CONTIENE JM`, `estado=Activa`, **ventana solape** |
| `A-02` | `imp_google` → ídem, `Plataforma = Google ads` |
| `A-03` | `imp_prog` → ídem, `Plataforma = DV360` |

**Los dos errores, y el segundo es el de fondo:**

1. **La fuente no es la que los casos declaran.** `A-01`…`A-03` miden sobre **`looker/DIGITAL ×
   Cuentas`**, no sobre la dinámica. Y ya lo midieron **con solape**, dando 679.647 + 614.140 +
   5.992.841 = **7.286.628** — del orden de los 6.442.951 publicados.
2. **`imp_total` y `gcba_imp_total` no deberían tener fuente propia.** `X-10` y `V-59` los declaran
   **derivados**. Un derivado con `SUMA` sobre una solapa es un segundo camino al mismo número, y
   los dos caminos van a divergir.

**Por qué el parecido de `imp_total` engaña.** Con recorte por punto la dinámica da **6.084.893**
contra los **6.442.951** publicados: se parece **por casualidad de orden**, no porque mida lo
mismo. Con solape se va a **54.870.421** — nueve veces.

**Y `gcba_imp_total` lo confirma sin lugar a dudas: ningún criterio de recorte lo acerca.**

| | valor | contra `V-59` = 116.016.433 |
|---|---|---|
| punto | 2.027.888 | **57 veces corto** |
| solape | 1.145.126.874 | **10 veces largo** |

**El problema no es el recorte: es la fuente.** Ésa es la razón por la que la **Parte D del `_20`
no corre sobre `looker`** — cambiar el criterio de ventana de una fuente equivocada no arregla
nada y mueve un número publicable.

**Qué lo destraba, en orden:**

1. **El `0.0` del `_18`** — qué sale de la dinámica y qué necesita `looker/DIGITAL`. Ahora tiene
   un caso concreto en vez de una pregunta abstracta.
2. **Cablear `imp_meta`, `imp_google` e `imp_prog`** sobre la fuente que `A-01`…`A-03` declaran,
   que necesita `Plataforma` e `Impresiones` juntas — y eso **sólo está en `looker/DIGITAL`**.
3. **Recién entonces, retirar la fuente propia de los dos derivados.** Es lo que `C.4` del
   `2026-08-09_1` pedía y el `10.1` §3 retiró **con razón**: sin los tres sumandos, la poda dejaba
   `imp_total` sin nada. El orden importa y sigue siendo el mismo.

⚠ **Mientras tanto los dos publican un número que no es el correcto, con `estado = ok`.** Es el
modo de falla que este proyecto tiene nombrado: **el número plausible**. Si hay que generar un deck
antes de resolverlo, retirarles la fuente y que salgan `«FALTA»` es preferible.

### P2 · Las filas sin `estado` de `looker/DIGITAL` quedan afuera — decisión tomada, reversible

**Decisión del coordinador, 10/08, y sigue el precedente en vez de inventar uno:** `estado =
Activa` es una **inclusión positiva**, y una fila sin estado **no cumple la condición**. Quedan
afuera.

**Lo que cambia es que dejan de caer afuera por omisión: la traza las cuenta y las nombra.** Es
`R-20` aplicado — **un vacío no es un valor**. La diferencia entre *"no entró porque no es
`Activa`"* y *"no entró porque no dice nada"* tiene que estar escrita, o dentro de tres meses
alguien mira un número corto y no tiene por dónde empezar.

**Medido el 10/08 sobre la solapa viva** —no sobre el fixture del 31/07, que decía 22:

| | |
|---|---|
| filas con `estado` vacío | **36** |
| **de ésas, con `JM` en el nombre** | **0** |

**Cero.** Ninguna campaña de JM se pierde hoy por esta decisión, así que **no cuesta nada en el
informe actual**.

⚠ **Y el cero es de hoy, no una propiedad.** Mismo criterio que el desvío de las campañas mixtas:
se vuelve a medir, no se cita. Si alguna vez una campaña JM grande aparece sin estado, **se
revisa** — y no se revisa sola: hay que mirarlo.

**Se mide con `cruzarVacioContra('looker','DIGITAL','estado','nombre_campaña','JM')`.**

**Dato de contexto que conviene tener al lado:** aplicar `estado = Activa` deja afuera **4.168 de
4.895 filas (85 %)**. Es un filtro fuerte, y las 36 sin estado son ruido al lado de eso — pero son
las únicas que quedan afuera **sin decir por qué**.

### P1 · `X-16` · El conteo de `pauta_*` no sale de `looker/DIGITAL` — cuatro unidades descartadas

Objetivo publicado: **9 / 7 / 14** (Meta / Google ads / DV360). La rama de validación probó cuatro
unidades de conteo sobre `looker/DIGITAL × Cuentas` y **ninguna reproduce**:

| unidad | resultado |
|---|---|
| filas · JM + ventana + `Activa` | 6 / 5 / 10 |
| filas · JM + ventana, todos los estados | 12 / 12 / 18 |
| cuentas distintas · `Activa` | 6 / 5 / 6 |
| cuentas distintas · todos los estados | **9** / 8 / 9 |

**Lo que el resultado negativo dice, y es más útil que la lista:** Meta acierta en la última fila y
las otras dos no. **Que una plataforma dé exacto y las otras dos fallen dentro de la misma unidad
no es un error de unidad: es evidencia de que el conteo no sale de esta solapa.** Y los 14 de DV360
caen **entre** las 9 cuentas distintas y las 18 filas, así que **no hay agregación de este conjunto
que los produzca**.

Contar nombres de campaña distintos da lo mismo que contar cuentas, así que esa vía tampoco agrega.

**Queda abierto.** La hipótesis viva es que el deck cuente **piezas o líneas de pauta desde otra
tabla**, o que se cuente a mano — compatible con los dos errores de tipeo ya encontrados en estos
decks (`C-07`, y el `41-350` con guión de la lámina 53).

**Consecuencia para el cableado:** los seis `pauta_*` siguen **sin fuente válida**. Hoy están sobre
las columnas booleanas de `digital/Seguimiento digital` publicando `1`, que tampoco es el número.
**No cablearlos sobre `looker/DIGITAL` para "acercarse"**: sería cambiar un número mal por otro.

### ~~P2 · La disyuntiva de período de `looker` — lo único que sobrevive del `_18`~~ — CERRADA (10/08/2026)

**No hacía falta elegir: `looker` sigue `filtrar` y `DIGITAL` toma la ventana de `Cuentas`.** La
disyuntiva estaba mal planteada —*"¿`looker` pasa a `snapshot`?"*— porque suponía que la decisión
era **por base**, y el problema era **por solapa**: `resumen_metricas_dinamico` filtra bien y
`DIGITAL` no tenía con qué. `snapshot` habría arreglado una rompiendo la otra.

Lo resolvió `R-25` / `D-24` (el `_23`): `SOLAPAS.ventana_ref = Cuentas` sobre `looker/DIGITAL`,
cruzada por `MAPEO.clave_ventana`. Medido el 10/08 sobre la ventana `2026-07-24 → 2026-07-30`:
**966 de 4896 filas en ventana**, con los cuatro conteos separados y sumando. El control de la
capacidad —`Cuentas` recortada por referencia contra sí misma contra el recorte directo— dio
**92 y 92, idéntico**.

**Y el `_18` tenía la premisa al revés**, como ya había anotado la Parte E del `_22`: el join no
era para saber de quién es la campaña —eso sale de `F` dentro de `DIGITAL`— sino **para saber
cuándo corrió**. Y ni siquiera terminó siendo un join: es un conjunto de pertenencia (`R-25`).

> **El texto original queda abajo, sin editar**, porque su tabla es la evidencia de por qué se
> planteó así.

El `_18` quedó **cancelado** (ver su archivo), pero su `0.3` seguía abierto y no lo contesta
ninguno de los casos nuevos. Con lo que ya se sabe:

| solapa | período |
|---|---|
| `resumen_metricas_dinamico` | **tiene `fecha_periodo`** (col C, `fecha_inicio`), y `fecha_fin` mapeado en D. 951 filas, **cero sin inicio, cero sin fin** |
| `DIGITAL` | **ninguna columna temporal** — `C-19` |
| `Cuentas` | tiene el par `fecha_inicio` / `fecha_fin` |

**La decisión pendiente no es "elegir la columna": es si `looker` pasa a `snapshot`.** Hoy es
`filtrar`, y eso es correcto para la dinámica —que sí filtra bien, 26 de 951 en la ventana— pero
`DIGITAL` no tiene con qué filtrar y por eso necesita el cruce con `Cuentas`.

**Qué lo destraba:** el prompt de diseño del join, que `C-19` ya acotó — no es un join para saber
de quién es la campaña (eso sale de `F`), es **un join para saber cuándo corrió**.

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

### P1 · 147 filas de `looker/DIGITAL` tienen un `Id cuentas` que no existe en `Cuentas` — y 18 no tienen ninguno

Medido el 10/08/2026 por el `_23`, Parte A, sobre las solapas vivas.

| | filas | ids distintos |
|---|---|---|
| `DIGITAL`, total | **4896** | — |
| con `Id cuentas` no vacío | 4878 | 740 |
| **sin `Id cuentas`** | **18** | — |
| matchean en `Cuentas` | 4731 | 709 |
| **huérfanas** | **147** | **31** |

**Por qué importa ahora y no antes:** hasta el 10/08 `DIGITAL` era ilegible entera, así que las
huérfanas no salían de ningún lado. Con `R-25`, la solapa se lee y **estas 165 filas (147 + 18)
quedan afuera de toda ventana, para siempre y por construcción**: no tienen con qué entrar. La
traza las cuenta —`filas_clave_huerfana` y `filas_sin_clave_ventana`— así que dejaron de caer en
silencio, que es lo que `R-20` pide. Pero **contarlas no es resolverlas**.

**Uno de los 31 ids huérfanos es el literal `Falta ID`.** No es un id: es un texto de relleno de
la base. Los otros 30 tienen forma de id (`2039-SEPDHHGC`, `2415-DICINFGC`, `2671-FEBJDGVC`…), o
sea que son cuentas reales que `Cuentas` no lista.

**Qué hay que decidir, y es del equipo dueño de la base, no del motor:** si son cuentas dadas de
baja de `Cuentas` pero con actividad histórica en `DIGITAL`, o si `Cuentas` está incompleta. Las
dos tienen consecuencias distintas y ninguna se puede adivinar desde acá — `D-10`: al motor le
falta una definición, pregunta y no la fabrica.

**⚠ Y no son todas ajenas al informe: 40 de las 147 huérfanas son JM.** El ejemplo se lee solo —
`2411-DICJDGAG · RDV JM | Caballito 17/12`— y es una cuenta de un encuentro real que `Cuentas` no
lista. Las 18 sin id, en cambio, **ninguna es JM**.

**Hoy no bloquea el cableado de los `imp_*`, y el motivo es delgado: de esas 40, ninguna tiene
`estado = Activa`.** Con el filtro del cableado —`nombre_campaña~=JM` **y** `estado=Activa`— las
40 caen igual por el `estado`, no por ser huérfanas. **Ese cero es de hoy y no es una propiedad**:
la primera cuenta JM huérfana que aparezca `Activa` va a restar impresiones sin que nada falle.
Mismo criterio que el desvío de las campañas mixtas de `R-23` y que las 36 filas sin `estado` del
`_22` — se vuelve a medir al cablear, y el conteo ya está en la traza para que se vea.

### P2 · `upsertPorClave_` blanquea toda columna que el objeto no traiga, y hay un comentario que dice lo contrario

Medido el 10/08/2026 por el `_23`, al ir a escribir `ventana_ref` en `looker/DIGITAL`.

`upsertPorClave_` reescribe la **fila entera** con `headers.map(h => (h in obj) ? obj[h] : '')`.
Así que **omitir una columna no la conserva: la borra** — y sólo en las filas que el seed cambia
por otro motivo, que es lo que lo hace difícil de ver.

**El comentario de `aplicarClasificacionSolapas_` afirmaba lo contrario desde el 2.11 Parte C:**
que `filas_datos` y `firma_encabezado` se dejan afuera del objeto *para no pisarlas*. La
intención era correcta; el mecanismo no la cumplía.

**La evidencia estaba a la vista y nadie la había leído así:** `looker/Cuentas` tenía
`firma_encabezado` y `filas_datos` **vacíos** —se le editó `notas` el 09/08— y `looker/DIGITAL`
los tenía cargados, porque nadie la había tocado desde el último inventario. Dos filas de la
misma hoja, una con datos y otra sin ellos, y la diferencia es cuál pasó por el sembrador.

### ⚠ No era una fila: eran **30 de 84**, y cuatro `uso = fuente` (medido 10/08, ya restauradas)

Al ir a reparar `looker/Cuentas` se midió la hoja entera y el agujero era mucho más grande de lo
que sugería el caso que lo destapó:

| | |
|---|---|
| filas de `SOLAPAS` | 84 |
| **con hueco en `firma_encabezado` / `filas_datos` / `filas_crudas`** | **30** |
| de ésas, `uso = fuente` | **4** — `looker/resumen_metricas_dinamico`, `looker/Cuentas`, `digital/Cuentas`, `digital/Digital 2026 acumulado` |
| con `filas_minimas` cargada | **0 de 84** |

**`looker/resumen_metricas_dinamico` es el `hoja_default` de `looker` y la fuente de `imp_total`.**
No es una fila cualquiera.

**Y el daño no era sólo el dato: apagaba un guardarraíl en silencio.**
`evaluarCoberturaLectura_` (Paso 2.8 Parte D) existe para avisar cuando un lector devuelve una
fracción chica de lo que `SOLAPAS.filas_datos` registra —el caso `m2`, 18 filas de 29.533 con ✅—
y **devuelve `{ ok: false }` cuando `filas_datos` está vacío**. O sea que en esas 30 solapas, las
cuatro `fuente` incluidas, el aviso estaba desactivado y nada lo decía.

**`filas_minimas` no se perdió**: está vacía en las 84 y **vacío es su estado de nacimiento**
—`R-19` capa 3, el piso lo fija una persona—. No hay nada que restaurar ahí.

**Restauradas el 10/08 con `inventariarSolapas()`**, que es el escritor dueño de esas tres
columnas según `ESCRITORES.md`: 84 filas actualizadas, 0 nuevas, 0 no encontradas,
**29 de 30 recuperadas**. La que queda es `rdv/Cantidad de reuniones por franja horaria`
(`derivada`) sin `firma_encabezado`, y **no es pérdida**: la solapa no tiene fila de títulos que
leer. Verificado además que la restauración **no pisó** lo que el `_23` había escrito —
`looker/DIGITAL` conserva su `ventana_ref = Cuentas` y su nota—, porque `inventariarSolapas()`
escribe celda por celda y no la fila entera. Que es, exactamente, lo que `upsertPorClave_` no hace.

**De paso: 20 filas tenían el conteo viejo y se refrescó.** Las bases crecen —`looker/DIGITAL`
pasó de 4591 a 4904, `rdv/RDV_otros_ministros` **bajó** de 749 a 515— así que estos números son
una foto con hora, no una propiedad.

**Se arregló sólo en `aplicarClasificacionSolapas_`**, que ahora devuelve las cuatro columnas
ajenas tal cual las encontró. **`upsertPorClave_` quedó igual a propósito:** lo usan `BASES`,
`MAPEO`, `INFORMES` y `PERIODOS`, y cambiar el genérico es una decisión con radio propio. Lo que
no se hizo fue dejar que el `_23` destruyera datos de costado.

**Qué hay que decidir:** si el genérico pasa a preservar por defecto —que es lo que todos los
llamadores parecen esperar— o si cada sembrador se hace cargo como el de `SOLAPAS`. Lo primero es
un cambio de una línea con radio de cuatro hojas; lo segundo son cuatro cambios que se olvidan de
a uno.

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

---

## `resumen_metricas_dinamico` se recorta **por punto, no por solape** — 12/08/2026

**Leído sobre la solapa viva el 12/08/2026.** No es un problema de Call Center: **es de la solapa**,
y alcanza a **todo marcador que la lea**, incluidos los que hoy publican bien.

`MAPEO` tiene `fecha_periodo` apuntando a `fecha_inicio` (col C) y **no tiene
`fecha_fin_periodo`**. `leerFuente` lo informa con todas las letras —`criterio_ventana: "punto — la
solapa no declara fecha_fin_periodo"`—: entra la fila cuyo **inicio** cae dentro de la ventana.
**Una campaña que arrancó antes y siguió corriendo los siete días no entra.**

**El caso testigo, con los números medidos:**

| | |
|---|---|
| cuenta | `3289-JUNJDGAG` — *PRIMERA PERSONA \| JM \| PAULA PARETTO 27/7* |
| `fecha_inicio` / `fecha_fin` | **17/07** → **20/08** |
| `call_discado` / `call_contactados` | **6011** / **1878** |

Es **la única cuenta de Call Center con datos de esa semana**, y la ventana `24–30/07` **la deja
afuera**. Las cuatro cuentas JM que sí entran tienen `call_enviado`, `call_discado`,
`call_contactados` y `call_efectivos` **en cero**.

**Consecuencia inmediata, ya decidida (`_32.2`):** `cc_base`, `cc_contactados` y `cc_contact_pct`
publican `—` y no se cablean. Un cero ahí se leería como *"hubo cero llamados"*, que es una
afirmación falsa sobre el mundo; una raya dice *"no tengo el dato"*, que es verdad. **Deja de ser un
pendiente de cableado y pasa a ser un pendiente de semántica de ventana**, que tiene otro dueño.

**Las dos salidas, las dos descartadas para hoy y ninguna descartada para siempre:**

1. **Mapear `fecha_fin_periodo` → `fecha_fin` (col D).** Es una fila de `MAPEO` y arregla el
   criterio de raíz — es lo que `R-16` ya fija para las solapas que sí lo declaran. ⚠ **Mueve el
   universo de TODOS los marcadores de esta solapa**, incluidos `frecuencia` y `gcba_frecuencia`,
   que hoy publican 21,46 y 1,63. No se hace a tres horas de una demo.
2. **Un `periodo_ref` propio para los tres `cc_*`.** Es inventarles un recorte, que es justo lo que
   el `_31.4` prohíbe.

⚠ **Y una hipótesis, anotada como hipótesis y no como conclusión.** `C-22` está abierto porque *el
universo del total JM de `frecuencia` no cierra* —ninguna forma de agregar reproduce el 11,9
publicado—, y `frecuencia` **lee esta misma solapa**. **El recorte por punto es candidato a
explicarlo:** si campañas que corrieron toda la semana quedan afuera por haber arrancado antes, el
denominador y el numerador salen de menos filas de las que el deck contempló. **No se verificó**, y
la prueba vive en la ventana de validación, no en el motor.

### Addendum — 12/08/2026: el solape se midió, y la puerta no abre

**El `_33` Parte A midió lo que a este hallazgo le faltaba, y el resultado invierte la conclusión
tentativa de arriba.** Simulado en memoria, **sin tocar `MAPEO`**: `punto` = `fecha_inicio` dentro de
la ventana; `solape` = `fecha_inicio ≤ hasta` **y** `fecha_fin ≥ desde` (`R-16`).

**Primero, el alcance real: son DOS marcadores, no todos.** Sólo `frecuencia` y `gcba_frecuencia`
leen `resumen_metricas_dinamico`. El `_32.2` supuso un radio mayor; medido, es exactamente el par
que ya publicaba.

| ventana · corte | criterio | cuentas | impresiones | alcance | frecuencia |
|---|---|---|---|---|---|
| 24–30/07 · JM | punto | 4 | 4.528.060 | 192.538 | 23,52 |
| 24–30/07 · JM | **solape** | **11** | **39.209.552** | 548.507 | **71,48** |
| 24–30/07 · GCBA | punto | 22 | 2.034.955 | 1.246.075 | 1,63 |
| 24–30/07 · GCBA | **solape** | **81** | **728.872.658** | 43.141.903 | **16,89** |
| 12–18/06 · JM | punto | 2 | 3.653.312 | 36.610 | 99,79 |
| 12–18/06 · JM | **solape** | **14** | 54.342.788 | 810.539 | 67,05 |

**Por qué no abre, y el criterio es el que el `_33` fijó — explicable, no sólo chico.** Lo que entra
por solape **no son las campañas de la semana**: son campañas de larga duración que llevaban meses
corriendo. Entre las que aparecen sólo por solape hay ids `SEPEPHGC` —de septiembre— y `MAYJDGAG`
—de mayo—. En GCBA las impresiones se multiplican por **358**. Eso no es *"entran las que estuvieron
activas toda la semana"*: es *"entra el año entero"*.

**Y la hipótesis sobre `C-22` queda refutada, que era el punto de haberla anotado como hipótesis.**
`C-22` está abierto porque `frecuencia` no reproduce el **11,9** publicado. Con punto da 23,52; con
solape, **71,48**. **El solape aleja, no acerca.** El recorte por punto **no explica `C-22`**.

**Consecuencia:** los `cc_*` siguen en `—` y el `_32.2` sigue siendo la última palabra. `call_discado`
y `call_contactados` sólo aparecen con solape —0 en los dos cortes bajo punto—, así que cablearlos
exigiría exactamente el cambio que esta medición desaconseja.

**Lo que sí queda cerrado:** mapear `fecha_fin_periodo` en esta solapa **no es la solución**, y ahora
hay un número para decirlo en vez de una precaución. Si algún día se necesita el solape, hará falta
además acotar por duración de campaña o por estado, que es una decisión de negocio y no de mapeo.

---

## Cuatro hallazgos de la plantilla de `jm` — 12/08/2026, se anotan y no se tocan

Salen de la Parte A del `_35`. Ninguno se arregla; los cuatro quedan con fecha.

**1 · ⚠ La lámina modelo de una sección se infiere de los tokens, así que editar la plantilla la
mueve en silencio.** `comunicaciones_post` (familia `post_`) **cambió de la lámina 11 a la 7** sin
que nadie lo declarara ni lo notara: `slidesModeloDe_` reclama toda lámina que tenga un token de la
familia, y alcanzó con cargar 32 tokens `post_*` en la 7. Es un hallazgo de **diseño**, no un bug de
una corrida: no hay ningún registro que diga cuál es la lámina modelo de una sección, y por lo tanto
tampoco hay nada que pueda contradecirse cuando cambia.

**2 · La lámina 11 quedó con cero tokens.** Consecuencia de lo anterior; no se toca.

**3 · La plantilla pasó de 195 a 223 tokens** entre el 11/08 y el 12/08.

**4 · `enc_alcance` es prefijo de `enc_alcance_pct` y de `enc_alcance_potencial`.** Es la misma
forma que dejó a `ecv_barrio` sin dueño. **Hoy no rompe**, porque `tokenEsDeFamilia_` compara contra
la familia `enc_` y los tres matchean igual. Queda escrito porque **el día que alguien arme una
familia más fina, muerde** — y para entonces el precedente de `ecv_barrio` va a estar lejos.

---

## `LAMINAS_CONGELADAS_` quedó desanclada por la carátula — 12/08/2026

**El testigo hizo exactamente su trabajo, así que esto no es una falla: es la detección.**

`Armonizar.gs` declara para `jm` una lámina congelada **por número de slide**:
`{ slide: 10, testigo: 'm2_salud_camp' }`. Insertar la carátula `L-052` en el orden 6 corrió todo lo
que venía después, y `m2_salud_camp` pasó a la **11**.

```
filtrarRenombresPorLaminasCongeladas_('jm') -> ok: false
  El testigo "m2_salud_camp" de la lámina congelada 10 no está en esa slide (está en la 11).
  La plantilla se reordenó o es otra: no se filtra nada y no se armoniza.
```

**Consecuencia hoy: la armonización de `jm` está frenada.** No es urgente —no corre en una
generación— pero cualquier intento de armonizar tokens de `jm` se detiene ahí.

⚠ **La corrección NO es cambiar el 10 por un 11.** Eso deja la misma bomba armada para la próxima
inserción. `LAMINAS_CONGELADAS_` identifica una lámina **por posición**, que es justo lo que `D-23`
resolvió para `LAMINAS` cuando estableció que la identidad es `#lamina: L-NNN` y que
`orden_plantilla` es **reportado y nunca autoritativo**. La lámina congelada de `jm` tiene ancla
propia y estable: **`L-039`**. Migrar la declaración de `slide` a `lamina_id` es la misma decisión
de fondo, aplicada al segundo lugar donde quedó sin aplicar.

**Se decide aparte y no se toca hoy.**

---

## `m2_campanias` — tres cosas que quedan escritas, 12/08/2026

**1 · Los dos tokens tienen los roles cruzados respecto de sus nombres, y el mismo token significa
cosas distintas en los dos informes.**

| informe | lámina | caja, literal | qué publica |
|---|---|---|---|
| `jm` | `L-038` (orden 10) | `"{{m2_envios}}Campañas"` | **25 Campañas** — el conteo |
| `jm` | `L-038` (orden 10) | `"{{m2_campanias}}"` | `—`, y **sin palabra al lado no dice qué pide** |
| `secco` | `L-014` (orden 14) | `"{{m2_campanias}} Campañas"` | el conteo |

O sea: en `jm` el conteo de campañas **ya lo publica `m2_envios`**, y en `secco` lo publica
`m2_campanias`. **`MARCADORES` es por `informe_id`**, así que se puede resolver distinto en cada uno
—el mecanismo existe y no hace falta inventarlo—, **pero cuál es cuál es una decisión del usuario
con el deck publicado delante, no una inferencia del motor.**

**`m2_campanias` se queda en `—`, y es el séptimo motivo de la tabla del handoff, distinto de los
otros seis: no es que falte la operación, es que no está definido qué tiene que publicar.**

**2 · `LISTA` exige catálogo y tira sin él.** Queda escrito para que nadie la proponga para campañas
sin ver primero que hay que **curar un catálogo de campañas**, que no existe y es trabajo del
usuario. La hipótesis *"`m2_campanias` pide la lista"* no se puede cablear hoy ni aunque se confirme.

**3 · `diagDistintos_` se equivocó y lo detectó el motor** — ver la entrada del `_37` Parte A en la
bitácora. Reportó 722 filas y 641 campañas distintas donde el motor publica **25**: llamó a
`leerFuente` sobre `digital`, que es `modo_periodo = snapshot` **a propósito**, y ahí el recorte por
ventana no lo hace el lector sino `datosDeMarcador_` después.

**El valor está en cómo se detectó:** la medición propia contradijo al motor y **el equivocado fue
el instrumento**. Es el sexto caso del patrón de `CLAUDE.md` §4, y el primero que se cazó **en la
misma corrida** en vez de sobrevivir a tres citas.

---

## `digital/Alcance` — dos filas por cuenta, y esperan una **regla**, no una elección — 12/08/2026

**P1.** `3387-JULJDGGC` (Orden Público) y `3289-JUNJDGAG` (Villa Urquiza) traen **dos filas cada
una en `digital/Alcance`, idénticas en las seis columnas salvo el número**:

| `id_cuenta` | Alcance | Frecuencia | impresiones implícitas |
|---|---|---|---|
| `3387-JULJDGGC` | **66.345** | 14,18 | ≈ 940,7 k |
| `3387-JULJDGGC` | 457.883 | 2,05 | ≈ 941,0 k |
| `3289-JUNJDGAG` | 157.580 | 3,46 | ≈ 545,3 k |
| `3289-JUNJDGAG` | 145.669 | 3,74 | ≈ 545,3 k |

**Las impresiones implícitas coinciden en los dos casos.** No son dos campañas: son **dos
definiciones del mismo hecho**. Y no hay columna que las discrimine —`ID Cuentas`, `eje`, `area` y
`nombre_campaña` son iguales—, así que **ningún filtro puede separarlas** y la solapa no tiene
columna de fecha para ordenarlas.

**Lo que falta es una regla, no una elección.** `D-06` (`casos_validacion_2026-07-31`) valida la más
chica **en un caso** — `enc_alcance` de Orden Público `65576`, nota *"base 31/07 = 66345"*—, y **un
caso no alcanza para escribir una regla**. Elegir "siempre la menor" a partir de un solo punto
validado es exactamente el supuesto silencioso que `CLAUDE.md` §4 prohíbe: sobreviviría a la corrida
y nadie volvería a mirarlo.

**Hasta entonces las dos láminas publican `—` con motivo, y eso es lo correcto.** La guarda del
`_39` en `opULTIMO` devuelve `«FALTA:@ultimo_sin_fecha_ambiguo»` nombrando los dos valores. Sin ella
se publicaba `457.883` donde el caso validado dice `66.345`: 7× más grande, plausible, con el rótulo
correcto al lado.

**Qué lo destraba:** que el dueño de `digital/Alcance` diga qué distingue las dos filas — o que
aparezcan más casos validados que permitan inducir la regla. Ninguna de las dos cosas es del motor.

### Addendum 12/08/2026 — aparecieron dos testigos, y son cuatro casos ambiguos, no dos

**No cierra esta sección. La amplía, y la corrobora sólo en parte.** El censo del `_40` midió la
misma pregunta contra dos fuentes que no existían cuando se escribió lo de arriba:
`looker/resumen_metricas_dinamico.meta_alcance` y `Agenda JM.Alcance manual` de la base
`Base reuniones - Digital - Call Center` (**que no está dada de alta**).

**Primero, el problema es más grande que el que declara la tabla de arriba:** las cuentas con dos
filas en `digital/Alcance` **no son dos, son cuatro** — se suman `3201-JUNJDGAG` (Mataderos,
`20876` y `47999`) y `3178-JUNJDGAG` (Educación, `104438` y `452030`). Y hay **una quinta de forma
distinta**, `3156-JUNJDGAG` (Boedo), con **una fila vacía y una con `258684`**, que tiene sección
propia más abajo.

**Los dos testigos coinciden entre sí en 6 de las 7 cuentas medidas, y en los cuatro casos
ambiguos las dos eligen la primera fila:**

| cuenta | `Alcance manual` | `meta_alcance` | las dos filas de `digital/Alcance` |
|---|---|---|---|
| `3387-JULJDGGC` | **66.345** | **66.345** | 66345, 457883 |
| `3289-JUNJDGAG` | **157.580** | **157.580** | 157580, 145669 |
| `3201-JUNJDGAG` | **20.876** | **20.876** | 20876, 47999 |
| `3178-JUNJDGAG` | **104.438** | **104.438** | 104438, 452030 |
| `3354-JULJDGAG` | 1.412 | 1.412 | 1412 (una sola) |
| `3156-JUNJDGAG` | (vacío) | (vacío) | (vacío), 258684 |
| `3346-JULJDGAG` | **0** ⚠ | **47.753** | 47753 (una sola) |

**La excepción importa tanto como la coincidencia.** En `3346` (Retiro) los dos testigos **no**
coinciden: `Alcance manual` dice `0` y `meta_alcance` `47.753`. Esa fila de `Agenda JM` trae **todo
el bloque digital en cero** —impresiones, alcance potencial, las tres plataformas—, así que su `0`
parece falta de carga y no una medición. Eso **degrada a la base nueva como testigo**: no se puede
leer su celda como un dato cuando en otra fila el mismo bloque está sin cargar.

**Por qué esto no cierra la sección, dicho con todas las letras.** Dos fuentes que eligen la misma
fila son **evidencia convergente, no la columna que discrimina**. Lo que falta sigue siendo lo
mismo: **qué distingue las dos filas.** Saber cuál se elige en cuatro casos no dice por qué, y una
regla inducida de *"siempre la primera"* sería **peor** que la de *"siempre la menor"* que el cuerpo
de arriba ya rechaza — porque **"la primera" es orden de lectura de la solapa, no una propiedad del
dato**: alguien reordena las filas y la regla cambia de respuesta sin que nada falle.

⚠ **Y una corrección al cuerpo de arriba, que quedó incompleto: *"siempre la menor"* ya no describe
lo que eligen los testigos.** Vale para `3387`, `3201` y `3178`, pero en `3289` los dos eligen
`157.580`, que es **la mayor** de las dos. Un caso más y la regla candidata se cae.

**Qué lo destraba — sin cambios:** que el dueño de `digital/Alcance` diga qué distingue las dos
filas. Las láminas siguen publicando `—` con motivo, y eso sigue siendo lo correcto.

### Addendum 2 · 12/08/2026 — las dos filas **sí** tienen qué las distingue, y mi testigo no servía

**El addendum de arriba se equivocó en las dos mitades, y las dos las corrige el CSV consolidado.**
No se edita: queda como estaba y esto lo corrige.

**Uno — no son "dos definiciones del mismo hecho": son PRE y POST.** `C-51`: *"Las filas duplicadas
de `digital/Alcance` son pares PRE/POST del mismo id, no ambigüedad. Nueva Pompeya tenía
`[52.012, 22.362]` en el export del 06/08; la base de reuniones trae `Alcance manual` (PRE) =
`52.012` EXACTO y `Alcance` (POST) = `45.211` al 12/08. El primer valor es PRE y el segundo POST, y
el segundo crece."* Lo respalda `C-50`, que midió la estructura: el mismo `ID` vive en `Agenda JM`
(PRE) y en `Agenda JM | Post` (POST), 98 ids compartidos.

**Eso explica de golpe lo que el addendum de arriba llamó "las dos eligen la primera fila".** No
elegían: **estaban leyendo la fase PRE**, que es la primera. La regularidad era real y la
interpretación estaba dada vuelta.

**Dos — `Alcance manual` no es un testigo utilizable.** `C-53`: *"NO ES ACUMULATIVA … La lámina 9
publicó `219.139` el 31/07 y la base del 12/08 trae `157.580` para la misma fila: menor doce días
después. El nombre de la columna lo dice: es un valor tipeado. Cualquier verificación de alcance
contra esta columna **se valida por regla, no por número**, y no puede usar la dirección temporal
como criterio."*

**Así que el `157.580` que el addendum de arriba presenta como coincidencia de dos testigos es un
número tipeado a mano que doce días antes decía otra cosa.** La coincidencia con `meta_alcance` es
un hecho medido y sigue en pie; lo que se cae es tratarla como corroboración independiente.

**Lo que reemplaza a todo esto es `A-12`, y está abierto:** *"`A-10` TIENE FUENTE. Hay dos columnas
de alcance, una por fase: `Agenda JM.Alcance manual` y `Agenda JM | Post.Alcance` … Queda abierto si
el total publicado es la suma de las dos o un deduplicado: al 12/08 N. Pompeya da
`52.012 + 45.211 = 97.223` contra `79.461` publicado el 07/08."* Y `A-09` ya había medido que el
publicado **nunca** es la suma, 4 de 4, siempre menor: sigue apuntando a deduplicado.

**Qué lo destraba, actualizado:** ya no es *"qué distingue las dos filas"* —eso está contestado, es
la fase— sino **cómo se combinan**. Es `A-12`, y no se decide acá. Las láminas siguen publicando
`—`.

---

## `3156` Boedo publica un `enc_alcance` que ninguna otra fuente sostiene — 12/08/2026

**P1.** El motor imprime **`258.684`** para `3156-JUNJDGAG` (Boedo 12/06) en el deck
`jm-20260812-174147`, que es uno de los dos vigentes.

**De dónde sale, con precisión:** `digital/Alcance` tiene **dos filas** para esa cuenta, la primera
**vacía** y la segunda con `258684`. `ULTIMO` se queda con la segunda. **No es un número sin origen
—tiene uno—: es un número sin corroboración**, que no es lo mismo y conviene no confundirlo.

**Los dos testigos dicen que la celda está vacía.** `Agenda JM.Alcance manual` de `3156`: vacío,
tipo `string`. `looker/resumen_metricas_dinamico.meta_alcance` de `3156`: vacío. Son las mismas dos
fuentes que en las otras seis cuentas coinciden con lo que el motor publica, o con la fila que el
motor no logra elegir.

**Y no hay testigo en el repo.** Grepeado `258684` y `258.684` sobre `docs/` entero, **incluidos los
tres CSV de casos** (`casos_validacion_2026-07-31.csv`, `_2026-08-09_addendum.csv` y
`_2026-08-12_addendum.csv`): **cero apariciones fuera de la bitácora y el handoff del `_40`** — o
sea, fuera de la salida del propio motor. Ningún caso `V-`, `C-`, `A-` ni `X-` lo menciona.

**Por qué la guarda del `_39` no lo tapa, y es el punto.** `opULTIMO` devuelve
`«FALTA:@ultimo_sin_fecha_ambiguo»` cuando hay **dos valores distintos** sin fecha que los ordene.
Con una fila vacía y una con valor **no hay dos valores distintos**: hay uno, y `ULTIMO` lo toma sin
dudar. **La guarda cubre el empate y no cubre el hueco.** Es la misma fila doble que la sección de
arriba —la misma solapa, la misma ausencia de columna discriminante— y sale por un camino distinto
**sin decir nada**.

**Qué lo destraba:** lo mismo que la sección de arriba —el dueño de `digital/Alcance` diciendo qué
distingue las dos filas—, **más** una decisión sobre qué debe hacer `ULTIMO` cuando una de las dos
filas de una cuenta está vacía: tomar la que tiene valor (lo de hoy), o tratarlo como el mismo caso
ambiguo. **No se decide acá.**

---

## La base nueva **no arbitra** sobre los `enc_mails_*` — 12/08/2026

**P2. Esto corrige un hallazgo del `_40` que quedó escrito al revés en `docs/BITACORA.md`.**

El `_40` reportó que *"Orden Público publica ~1/6 de sus mails"* —`44.043` publicados contra
`271.118` de la base nueva— y lo llamó **defecto vivo**. **No lo es, y el repo ya tenía la respuesta
antes de que se escribiera.**

`MARCADORES.enc_mails_enviados` lleva `operacion = ULTIMO` **con `filtro = mail_tipo=Convocatoria`**,
y su propia nota —fechada 11/08, verificada hoy contra la hoja viva— dice el número y el motivo:

> *"la lámina toma el envío de convocatoria, no el total de la cuenta (271.701 en 5 envíos contra
> los 44.043 publicados). Ni `SUMA` ni `ULTIMO` a secas: con el filtro quedan 3 convocatorias y
> `ULTIMO` toma la del 25/07, que es la publicada."*

**`44.043` es el valor validado y el corte por `mail_tipo` funciona.** Las cinco filas de mail de
`3387` son `Convocatoria` ×3 (22/07 ×2 y 25/07), `Confirmación` (27/07) y `Agradecimiento` (03/08).

**Lo que sí queda como dato, y es lo útil del hallazgo:** las cuatro fuentes miden **cuatro cosas
distintas, y ninguna es la otra**.

| fuente | enviados de `3387` | qué mide |
|---|---|---|
| el motor / el deck | **44.043** | el envío de convocatoria del encuentro — **validado** |
| `digital/Directa Mail`, las 5 filas | 271.701 | el total de la cuenta |
| `Agenda JM.Enviados` | 271.118 | el envío de la campaña, a su manera |
| `looker.mails_enviados` | 272.283 | el envío de la campaña, a la suya |

**Los tres agregados difieren entre sí** —271.701, 271.118 y 272.283—, así que ni siquiera existe un
"total de campaña" único contra el cual contrastar.

**Consecuencia para la decisión de alta, que es para lo que sirve esta entrada:** una columna de
mail de `Agenda JM` que contradiga al motor **no es evidencia de defecto — mide otra cosa**. Si la
base se da de alta, sus columnas de mail **no reemplazan** a `digital/Directa Mail` para los
`enc_mails_*`: usarlas ahí publicaría el agregado de campaña en la lámina del encuentro.

### Addendum 12/08/2026 — `X-20`: está abierto, no cerrado

**Esta sección lo dio por explicado y no lo está.** El CSV consolidado trae `X-20`, que numera
exactamente este hecho y lo deja **`abierto`**:

> *"EL BLOQUE DE MAIL DEL ICEBERG NO REPRODUCE, EN LA MISMA FILA DONDE EL IVR DA EXACTO. Deck
> `44.043 / 43.439 / 4.652 / 145` contra base `271.118 / 268.146 / 55.118 / 876`. Factor cercano a 6
> en los cuatro campos. **No es desfasaje: el iceberg publica un subconjunto de los envíos que la
> fila agrega.** Sexto caso del patrón `X-16`/`X-17`, ahora dentro de una sola fila."*

**Qué sigue en pie de lo de arriba y qué no.** Sigue en pie que `44.043` es el valor validado
(`V-12`, y la nota de `MARCADORES` del 11/08), que el corte por `mail_tipo=Convocatoria` funciona, y
que las columnas de mail de `Agenda JM` **no se cablean** contra los `enc_mails_*`. **No sigue en
pie el tono de cierre:** *"mide otra cosa"* nombra el hecho pero no la regla, y `X-20` dice que la
regla —qué subconjunto de envíos publica el iceberg— **todavía no está**.

**Y el contraste que lo hace interesante está en la misma fila:** `V-87` mide el bloque IVR de
`3387` contra `Agenda JM` y da **cinco de cinco exacto**. La misma fila, la misma cuenta: IVR
reproduce y Mail no.

---

## Base nueva contra `looker`: **28 de 49 celdas difieren** — 12/08/2026

**P2.** Medido en el censo del `_40`: 7 cuentas × 7 campos comparables, `Agenda JM` contra
`looker/resumen_metricas_dinamico`. **21 coinciden, 28 no.**

| campo | cuentas que coinciden |
|---|---|
| `meta_alcance` / `Alcance manual` | **6 de 7** — falla `3346`; ver el addendum de `digital/Alcance` |
| Call Center (4 columnas) | **3 de 7** — `3354`, `3346` y `3201`, **y los tres son ceros de los dos lados** |
| `digital_impresiones` / `Impresiones totales` | **1 de 7** |
| `mails_enviados` / `Enviados` | **2 de 7** — y las dos son ceros |

⚠ **Corrección al reporte del `_40`: `meta_alcance` coincide en 6 de 7, no en 7 de 7.** El conteo de
28/49 siempre fue correcto —y así quedó en la bitácora—; el que estaba mal era el desglose de esa
línea, que se dijo en el reporte y se arrastró al prompt del `_42`.

**El caso más grande:** para `3387` la base dice **0 discados** y `looker` **7.954**. Esa misma fila
de la base **sí trae el bloque de IVR completo**, así que no es una fila vacía: es un cero declarado
donde otra fuente tiene datos.

**Dos candidatos de explicación, y ninguno está medido:**

1. **Ventana.** La base es **una fila por encuentro** con su fecha de envío; `looker` trae un tramo
   de campaña — para `3289`, `fecha_inicio 17/07` → `fecha_fin 20/08`: un mes contra un encuentro
   del 27/07. Que la base sea sistemáticamente menor es **compatible**, y compatible no es medido.
2. **`C-41`**, de `docs/casos_validacion_2026-08-12_addendum.csv`: *"la base tiene una sola cuenta
   por encuentro y el deck publica dos campañas"*. Si `Agenda JM` hereda esa forma, sus columnas
   reproducen **un bloque** y nunca el total. **Este candidato estaba sólo en el cuerpo de un
   commit, que no es un lugar donde nadie lo lea** — por eso queda escrito acá.

**Qué lo destraba:** medir la ventana de una de las dos fuentes contra la otra sobre una cuenta con
diferencia grande, o que el dueño de `Agenda JM` diga qué recorte declara cada columna. **Hasta
entonces, ninguna columna de la base nueva se cablea contra un token que hoy lee `looker`**: se
estaría cambiando el universo sin decirlo, que es el modo de falla del 07/08 (`R-15` addendum 1).

### Addendum 12/08/2026 — el candidato 1 se cae y el 2 tiene nombre: `C-50`

**El CSV consolidado repuso 22 casos que el addendum del repo no tenía**, y dos contestan lo que
esta sección dejaba como candidatos sin medir.

**El candidato de la ventana no explica nada, y el que sí explica es otro.** `C-50` cierra `C-41`:
*"PRE y POST comparten el mismo ID de cuenta y viven en dos solapas distintas. 152 ids en PRE, 102
en POST, 98 compartidos, 4 sólo POST. La clave del par es `(ID, solapa)`, no dos cuentas."* Y `V-88`
lo confirma por el otro lado: el bloque PRE del deck **está entero en una sola fila de `Agenda JM`**
—San Cristóbal `42.500` impresiones, `1.274` clics, Meta `25.099/778`, Google `17.401/496`—
idénticos al deck.

**O sea que `Agenda JM` no trae "menos por la ventana": trae la fase PRE, y la POST vive en
`Agenda JM | Post`.** La comparación de esta sección puso **una fase de la base contra la campaña
entera de `looker`**, y por eso 6 de 7 dieron distinto. **El 28/49 sigue siendo el número medido,
pero ya no significa "dos fuentes que discrepan": significa que se compararon universos distintos.**

**Y hace falta una segunda clave, que ninguna de las dos secciones anteriores tenía en cuenta.**
Si la clave del par es `(ID, solapa)`, entonces un ruteo por cuenta que sólo mire el `id_cuenta` **no
alcanza para elegir la fila**: el mismo id existe en las dos solapas con números distintos. Eso es
un requisito para el mecanismo de `SOLAPAS.campo_id_cuenta`, no un detalle.

⚠ **Y hay una corrección que sí importa a la sección de arriba: `Alcance manual` no sirve como
testigo.** `C-53` la mide y la contradice: *"NO ES ACUMULATIVA … la lámina 9 publicó 219.139 el
31/07 y la base del 12/08 trae 157.580 para la misma fila: menor doce días después. El nombre de la
columna lo dice: es un valor tipeado."* Ver el addendum propio en la sección de `digital/Alcance`.

---

## `X-21` — la lámina publica **dos de las tres** filas de Call Center, y nada dice cuál queda afuera — 12/08/2026

**P1. Los `enc_*` de Call Center no se cablean.** No es que falte el ruteo por cuenta: es que **con
el ruteo puesto tampoco habría con qué reproducir el número.**

`3387-JULJDGGC` tiene **tres filas** en `looker/CC`, medidas en vivo el 12/08 a las 22:15:

| fila de la solapa | `Base enviada` | `Base barrida` | `Contactados` | `Efectivos` |
|---|---|---|---|---|
| 1289 | 8.000 | **6.977** | **1.785** | **1.414** |
| 1299 | 255 | **255** | **116** | **100** |
| 1300 | 722 | 722 | 268 | 252 |
| **suma de las tres** | 8.977 | **7.954** | **2.169** | **1.766** |
| **lo publicado (lámina 11)** | 8.255 | **7.232** | **1.901** | **1.514** |

**Lo publicado es la suma de la 1 y la 2. La 1300 queda afuera, en las cuatro columnas.** Es `X-21`,
séptimo caso del patrón `X-16`/`X-17` — y el primero **dentro de una sola cuenta**, no entre cuentas.

**La medición del motor que se agrega hoy, y lo que descarta.** La suma de las tres filas da `7.954`
y **cierra exacta** contra `call_discado` de `looker/resumen_metricas_dinamico`; ídem `2.169` contra
`call_contactados`. Verificado en las 7 cuentas ancladas: `resumen_metricas_dinamico` **es** la suma
por cuenta de `looker/CC`.

**Las dos solapas de `looker` concuerdan entre sí y las dos discrepan de lo publicado.** Por lo
tanto:

- **`SUMA` sobre `looker/CC` da 7.954, no 7.232.** Descartada.
- **Leer `resumen_metricas_dinamico` da lo mismo**, porque es esa suma. Descartada.
- **Elegir una fila no llega**: ninguna de las tres es `7.232`; hace falta sumar exactamente dos.
- **`Agenda JM` tampoco arbitra**: trae el bloque CC de `3387` **en cero en los cuatro campos**
  mientras el IVR de esa misma fila está completo y exacto (`V-87`). Es `C-58`.

**Y no hay columna con qué decidir.** `looker/CC` tiene **cinco columnas y ninguna más**:
`ID Cuentas`, `Base enviada`, `Base barrida`, `Contactados`, `Efectivos`. Sin fecha, sin nombre de
campaña, sin estado. **No hay nada que distinga la fila 1300 de las otras dos.**

⚠ **Y la única columna que parecía una fecha no lo es.** `Base enviada` llega tipada `Date` con
valores de 1899 a 1921 porque la planilla la tiene formateada como fecha: son **seriales**. Lo mide
`C-54` y se reprodujo en vivo — `30/12/1899` = `0` en la fila cuya barrida es `0`; `25/02/1900` =
`57`, igual que su `Base barrida`; y `1914-09-30 = 5.387` más `1903-07-09 = 1.286` dan los `6.673`
de `call_enviado`. **Un lector que no convierta el serial va a tratar la columna como fecha basura o
como vacía**, y un `fecha_periodo` mapeado ahí sería una fecha inventada.

**Qué lo destraba:** que el dueño de `looker/CC` diga qué separa la tercera fila — o una columna que
lo exprese. Es el mismo modo de falla que `C-15` resolvió **por temario a nivel cuenta**; acá hay
que resolverlo **a nivel fila dentro de una cuenta**, y el temario no llega hasta ahí.

**Lo que sí queda decidido, por `C-58`:** el **embudo del iceberg** se cablea contra `Agenda JM`,
con `REVISAR` cuando el bloque venga en cero — que es exactamente el caso de `3387`. Los `cc_*` del
Resumen Ejecutivo **siguen leyendo `looker`**, donde `V-64`/`V-65`/`V-66` los validan.

**Nota sobre el nombre `CC x Cuentas`, porque aparece en cinco casos y confunde.** No existe como
solapa: en `SOLAPAS` vivo, las únicas solapas con "cuenta" en el nombre son `digital/Cuentas`,
`looker/Cuentas`, `m2/Cuentas` y `m2/Cuentas M2`. Ya lo había establecido el
`docs/Prompts/2026-08-12_32.1_addendum_fuente_cc.md` — *"ese nombre no existe en ningún lado"*. Es
la etiqueta de un export viejo; **la solapa viva es `looker/CC`**, y es la que tiene los números que
los casos citan. Las dos cosas del `_43.2` A.3 son ciertas a la vez: la solapa no existe con ese
nombre, y el dato que `C-58` manda a buscar ahí sí existe, en `looker/CC`.

⚠ **Y `looker/CC` hoy no se puede leer por `leerFuente`.** `looker` es `modo_periodo = filtrar`, así
que exige `fecha_periodo`; medido en vivo devuelve `«FALTA:fecha_periodo@looker/CC»`. **No tiene
ninguna fila en `MAPEO`** —ni `id_cuenta` ni `fecha_periodo`— y **no tiene columna de fecha que
mapear**. Lo mismo vale para `looker/DIGITAL`. Las dos están declaradas `uso = fuente` en `SOLAPAS`
y ninguna de las dos es legible por el motor.

---

## El sembrador revirtió una decisión viva: `CAMPAÑAS_DESGLOCE_DIGITAL` volvió a `ignorar` — 14/08/2026

**Pasó de verdad, hoy, y lo causó la Parte B del `2026-08-14_1`.** Correr
`aplicarClasificacionSolapas_()` cambió `digital/CAMPAÑAS_DESGLOCE_DIGITAL` de `uso = fuente`
—como la había dejado el usuario el 14/08— a `uso = ignorar`. No lo pidió nadie: el seed de
`Instalar.gs` seguía declarando `ignorar` y el sembrador pisa toda fila cuyo `origen` no sea
`manual`. Quedó restituida a `fuente` en la misma corrida, y el seed corregido para que no
vuelva a pasar.

**El daño potencial era silencioso y grande.** Esa solapa es la fuente de los `u1_*` del "1 a
1" (`V-21` a `V-26`). Con `uso = ignorar` el motor deja de leerla, y los seis tokens habrían
salido `«FALTA:»` o vacíos **sin que ninguna verificación del proyecto lo señalara** — la
corrida no falla, sólo publica menos.

**La premisa que venció no es la regla, es la medición.** `R-22` sigue siendo correcta. Lo que
caducó es el diagnóstico del 09/08 que la aplicaba acá —*"congelada, sus filas JM llegan al
17/04/2026"*—: la solapa se actualizó y hoy tiene julio, con San Cristóbal 23/07 y Retiro
24/07 validados. Es otra vez el patrón de *un dato medido una vez y citado tres veces*, con el
agravante de que esta cita vivía **dentro del código**, donde nadie la releía.

**Lo que queda abierto, y es lo que importa:** `origen = 'seed'` no distingue *"esto lo decidió
el seed"* de *"esto lo decidió una persona y el seed todavía no se enteró"*. La única marca que
protege una decisión humana es `origen = 'manual'`, y **una decisión tomada editando la hoja a
mano no la pone**. Mientras eso siga así, toda corrida del sembrador puede revertir en silencio
una decisión viva, y el único aviso es el diff — que hay que leer.

**Qué lo destraba:** decidir si una edición manual sobre `SOLAPAS` debe marcar `origen=manual`
sola, o si el seed tiene que fallar ruidoso cuando su valor difiere del vivo en vez de pisarlo.
Es una decisión de arquitectura y no se toma acá.

---

## `reuniones/Agenda JM` y `reuniones/Base_Digital`: dos cargas manuales del mismo hecho — 14/08/2026

Medido en la Parte A2 del `2026-08-14_1`: **cero fórmulas** en `Agenda JM` (44 columnas × 154
filas) y **cero** en `Base_Digital` (27 × 1.893). Las dos solapas están escritas a mano.

Hoy **coinciden exacto** donde las dos tienen dato: el `Alcance manual` (AF) de la PRE es el
`Alcance real` (K) del bloque `Alcance Meta Convocatoria`, 1.412 para San Cristóbal; y el
`Alcance` (G) de la POST es el `Alcance real` (Z) de `Alcance Meta Post`, 47.753 para Retiro.

**Coinciden porque alguien las copió, no porque algo las mantenga sincronizadas.** No hay
control de divergencia y el modo de falla es mudo: el día que difieran, el motor publica la de
`Agenda JM` y nada lo señala. La fila de `MAPEO` de `alc_real` nombra la columna de origen
justamente para que se sepa dónde mirar.

**Qué lo destraba:** un control que compare las dos columnas sobre los encuentros del período,
o que el equipo derive una de la otra por fórmula en vez de copiarla.

---

## El bloque digital en cero es por par `(encuentro, solapa)`, y se invierte — 14/08/2026

**Corrige una conclusión del `_40`**, que no se edita por ser prompt ejecutado y bitácora
append-only. El `_40` anotó *"`3346` degrada a la base nueva como testigo"* midiendo **sólo la
PRE**. Medido ahora en las dos solapas:

| encuentro | `Agenda JM` (PRE) | `Agenda JM \| Post` |
|---|---|---|
| `3354` San Cristóbal | cargado (42.500 impresiones) | **todo en cero** |
| `3346` Retiro | **todo en cero** | cargado (136.971 impresiones) |

No es una propiedad del encuentro sino del par. Y **no es carga descuidada**: `Base_Digital` no
tiene fila para `3354` en el bloque Post ni para `3346` en el Convocatoria, así que la Agenda
refleja fielmente lo que hay.

**Con eso se cierra el caso de Retiro que el `_40` dejó abierto.** El `47.753` que `looker`
daba y la base parecía contradecir con un `0` **está en la POST**, exacto. La base coincidía;
se estaba mirando la solapa equivocada.

---

## Dos huecos chicos de `reuniones/Agenda JM | Post` — 14/08/2026

- **`Tipo = Recap` en 3 filas.** Es un valor que la PRE no tiene (sus cuatro son `Encuentro con
  vecinos`, `Primera persona`, `Reunión temática`, `Uno a uno`). Nadie declaró qué es un
  `Recap` ni si entra en algún universo.
- **Tres filas con `Fecha` ilegible**, literalmente `-`: `1976-SEPJDGAG`, `2063-OCTJDGAG`,
  `2170-OCTJDGAG`. Hoy no molesta porque la solapa se recorta por `campo_id_cuenta` y no por
  fecha (`D-30`), pero cualquier lectura por ventana las perdería sin avisar.

No se resuelven acá.

---

## `CONFIG_INFORMES.md` dice que `digital/Digital` es `fuente`; el registro vivo dice `ignorar` — 14/08/2026

**Medido**, no razonado: `censarSolapasParaAlta()` corrida el 14/08 a las 21:33 devuelve
`[digital] REGISTRADA uso=ignorar · Digital: 1298 fila(s) × 21 columna(s)`, leyendo `SOLAPAS`
**vivo** con `leerSolapas()` —el lector del motor, no una reimplementación—. El seed coincide:
`Instalar.gs` la declara `ignorar` con motivo `R-22` del 09/08, *"CONGELADA — sus 205 filas JM
llegan a diciembre de 2025, cero datos de 2026"*.

**Lo que dice el documento vivo.** `docs/CONFIG_INFORMES.md` §1.8.2 cierra con: *"`Digital` no se
borra de `SOLAPAS`. Deja de ser la fuente de esta lámina, nada más: **sigue siendo `uso = fuente`**
y la siguen leyendo `enc_impresiones`, `enc_alcance`, `imp_total`, `gcba_imp_total`, `frecuencia`
y `gcba_frecuencia`."*

**Es una cita vencida, y se puede fechar el vencimiento.** El párrafo se escribió el 07/08; el
09/08 `R-22` mandó la solapa a `ignorar`, y el 10/08 `imp_total` y `gcba_imp_total` se mudaron a
`looker` con el corte de `R-23` (bitácora). O sea que **al menos dos de los seis marcadores que el
párrafo lista ya no la leen**, y la afirmación de `uso` es directamente falsa desde el 09/08.

**Son CUATRO los marcadores que la apuntan, no tres** — contra el snapshot del 11/08:
`enc_impresiones`, `frecuencia`, `gcba_frecuencia` y **`enc_alcance`**. El snapshot es evidencia
fechada y no el estado de hoy, así que **se confirma contra `MARCADORES` vivo antes de actuar**;
pero la lista de cuatro es la que hay que ir a verificar.

Si alguno sigue apuntando ahí, falla con `«FALTA:…@solapa_no_fuente(digital/Digital)»` — el mismo
modo de falla que `CAMPAÑAS_DESGLOCE_DIGITAL` tuvo esta semana, y que **no rompe la corrida:
publica menos**.

### La consecuencia sobre `A-14` y `A-15`, que es la parte cara

Los dos casos concluyen que **`enc_alcance` no tiene fuente medible porque la base está
incompleta**: `A-14` mide PRE+POST de `reuniones` contra lo publicado y cierra uno de seis, con
San Cristóbal sin POST, Retiro sin PRE y Caballito con PRE vacío; `A-15` confirma que
`Base_Digital` no agrega información —`Alcance Meta Post` tiene 75 ids contra 797 del
Convocatoria—. Los dos quedan *"sin medir"*, no refutados.

**Eso sigue siendo cierto como evaluación de la fuente candidata, y no se toca.** Lo que hay que
revisar es otra cosa: **por qué `enc_alcance` publica `—` hoy.** Veníamos leyendo ese síntoma
como consecuencia de que no hay fuente. Si su marcador apunta a `digital/Digital`, la causa es
**una solapa apagada**, que es un problema distinto, con otro arreglo y otro costo.

**Son dos preguntas separadas y se estaban respondiendo con una sola:**

| pregunta | qué la responde | estado |
|---|---|---|
| ¿`reuniones` puede ser la fuente de `enc_alcance`? | `A-14` / `A-15` | sin medir — la base está incompleta |
| ¿por qué `enc_alcance` no publica **hoy**? | `MARCADORES` vivo: a qué solapa apunta | **abierto — se creía respondido por la fila de arriba** |

**Qué lo destraba:** una lectura de `MARCADORES` vivo filtrando por `solapa = Digital` sobre la
base `digital`. Con eso se sabe si hay marcadores que corregir o sólo un párrafo.

**Y tiene una precedencia que ya está en el plan.** `enc_impresiones` es el frente 9 de
`PLAN.md` §2 —*"operación confirmada 4 de 4"*—: **si su solapa sigue apagada, eso se resuelve
antes de cablearlo, no durante.** Cablear sobre una solapa `ignorar` produce un `«FALTA:»` que
parece un error de cableado y no lo es.

**No se corrige acá**, y el párrafo de `CONFIG_INFORMES.md` no se edita a ciegas: si los
marcadores están bien, lo que cambia es una frase; si no, es un cableado roto y necesita su
propio prompt.

---

## ~~`rdv/RDV_otros_ministros/fecha_periodo` apunta a `hora_cita_evento`~~ — redescubierto y cerrado contra `C-09`, 14/08/2026

> **La entrada queda con el error adentro, no se borra.** Lo que vale de este caso es que se
> redescubrió como hallazgo nuevo cuando ya tenía número, y que la corrección propuesta era
> equivocada.

**Lo que se afirmó al medirlo con `censarEncabezadosDeMapeo()`:** que `fecha_periodo` apunta a
`E`, donde hay `hora_cita_evento`, que la fecha está en `D` (`fecha_inicio_evento`), y que había
que **corregir la letra a `D`**.

**Lo que es cierto: la letra está bien y no se toca.** Los encabezados de esa solapa están
**corridos una columna en origen** — eso es `C-09`, y la bitácora lo dice textual: *"resuelve su
`fecha_periodo` a `hora_cita_evento` … funciona (514 filas, 10 en ventana, 0 sin fecha) **porque
los encabezados están corridos una columna**. El mapeo apunta al dato correcto con el nombre
equivocado."* La `E` **contiene la fecha**; lo que miente es el rótulo, no la letra.

**Corregir a `D` habría roto una lectura que funciona.** Es la trampa exacta que la bitácora ya
había nombrado: *"es un acierto por compensación de dos errores — el día que `C-09` se arregle,
esta lectura no va a fallar, va a leer otra columna"*.

**Qué queda en pie, y sigue siendo de `C-09`:** el día que alguien arregle los rótulos de esa
solapa, la letra **sí** hay que revisarla. No es un pendiente nuevo; está atado a `C-09` desde el
09/08.

**Su testigo se pobló con `hora_cita_evento`**, el rótulo real. Es el caso que fundó el límite
escrito en `D-31`: **el testigo documenta el rótulo, no el contenido** — acá coincide siempre y
no delata nada.

**Por qué se redescubrió**, que es lo aprovechable: el instrumento midió `MAPEO` contra la
planilla **sin cruzar contra los casos de validación**. Un hallazgo que sale de una medición
nueva se lee como nuevo aunque tenga número desde hace una semana. **Antes de abrir un hallazgo
sobre una solapa, grepear su nombre en la bitácora y en el consolidado de casos.**

---

## La función que compara letra contra encabezado — diferida, y el supuesto que la sostiene

**Qué falta.** Una función que, para cada fila de `MAPEO`, compare el `encabezado` declarado
(`D-31`) contra el que hay hoy en esa letra, y reporte las diferencias con los dos valores. La
política ya está definida en `D-31` —no corregir nunca la letra sola, reportar los dos valores, no
bloquear la corrida— justamente para que quien la escriba no la invente.

**Por qué se difirió** (decisión del usuario, 14/08/2026): **nadie insertó columnas todavía**, así
que no hay corrimiento que buscar. El testigo se siembra ahora y la comparación viene después.

⚠ **Y eso es un supuesto sobre bases de terceros, no sobre las nuestras.** `looker` es de
`dgples`, `m2` de `tarnowski`; `rdv` y `digital` las edita el equipo. **Ninguna de las cuatro nos
avisa cuando alguien agrega una columna**, así que el supuesto *"nadie insertó columnas"* **puede
vencer sin aviso y sin síntoma** — el síntoma sería un número plausible, que es el peor de este
proyecto. No tiene fecha de revisión: la tiene el día que alguien mire.

**Mientras tanto hay media red, y conviene saber que existe:** con el testigo en el seed, **el
diff de `instalar()` muestra la diferencia** entre lo declarado y lo que la hoja tiene. No detecta
que la *planilla* cambió —para eso hace falta la función— pero sí que alguien tocó `MAPEO`.

**Siete filas quedan fuera de esa media red, y conviene separar dos cosas que no son lo mismo.**

`ENCABEZADO_POR_MAPEO_` declara testigo para **las 161** filas vivas. Pero se aplica con
`SEED_MAPEO_.forEach(...)`, así que **sólo llega a la hoja para las 154 que están en el seed**.
Las otras **7** están en `MAPEO` y no en `SEED_MAPEO_` — las escribe `promoverFechasElegidas()`,
y son exactamente las que `ESCRITORES.md` §2.1 contaba sin nombrarlas. Medidas ahora, una por una:

```
rdv|RVD JM-CM - ES|fecha                 digital|Directa SMS|fecha_periodo
rdv|RDV_otros_ministros|fecha_periodo    digital|Directa IVR|fecha_periodo
digital|Digital|fecha_periodo            digital|Seguimiento digital|fecha_periodo
digital|Directa Mail|fecha_periodo
```

| | cuántas |
|---|---|
| con testigo **declarado** en `ENCABEZADO_POR_MAPEO_` | **161 de 161** |
| con testigo que **llega a la celda** de `MAPEO` | **154** |
| con la celda `encabezado` **vacía en la hoja** | **7**, las de arriba |

**`rdv|RDV_otros_ministros|fecha_periodo` está en las dos listas a la vez**, y no es
contradicción: su testigo **está declarado** —`hora_cita_evento`, con el motivo de `C-09` en el
código— y **no llega a la celda**, porque la fila no está en el seed. Declararla en el seed sería
darle un segundo escritor a una fila que ya tiene uno, así que no se hace acá.

Vacío en la celda significa *"sin testigo declarado en la hoja"*, no *"la columna no tiene
título"* — las siete tienen título y está medido. Se llenarían el día que ese escritor se
declare, o si `promoverFechasElegidas()` pasara a escribir también el encabezado. Es el `P1`
abierto de `C.2-7`, no de este paso.

> ## ⭐⭐ CERRADO en su parte accionable el 26/08/2026 — **se tomó la segunda salida, la que este
> párrafo ya nombraba.** `promoverFechasElegidas()` escribe ahora también el `encabezado`, medido
> por `DIAG_FECHAS` y normalizado con `R-10`. **El `P1` sigue abierto** —el seed sigue sin conocer
> esas filas— pero deja de tener consecuencia visible.
>
> ⛔ **Y el conteo de arriba envejeció mal en las dos direcciones, así que conviene decirlo con
> todas las letras.** Ese día `MAPEO` tenía **197 filas y 30 celdas vacías**, no 161 y 7:
> **23 más**, y la causa era otra —el `forEach` de `ENCABEZADO_POR_MAPEO_` terminaba en `|| ''` y
> **borraba** el testigo de toda fila que lo declarara inline—. La fila *«con testigo declarado:
> 161 de 161»* era cierta **sobre el mapa** y falsa **sobre lo que se sembraba**: es la figura del
> artefacto equivocado, ahora en `CLAUDE.md` §4.
>
> **Los dos números, releídos de la hoja viva antes y después de «Aplicar configuración»:**
> 30 → **7** celdas vacías sobre 197; `verificarEncabezadosDeMapeo()` pasó de
> `filas_sin_testigo: 25` a **2**, con `filas_comparadas` de 137 a **160** y
> `desalineadas: []` en las dos.
>
> ⚠ **Las 7 que quedan son exactamente estas siete filas**, y **no** se llenan con «Aplicar
> configuración»: se llenan la próxima vez que corra `promoverFechasElegidas()`. La séptima,
> `rdv|RVD JM-CM - ES|fecha`, **no tiene escritor de ninguna clase** y queda sin testigo — está
> anotada en `docs/ESCRITORES.md` §2.1, que es donde vive la pregunta de escritores.

---

## `C-61` cambia de riesgo con el testigo puesto — 14/08/2026

`C-61` es un **alta de columna** sobre `looker/CC` que mueve 229 cuentas, y su riesgo escrito es
que *"si el motor lee por posición, una columna nueva corre todo lo demás sin que nada falle"*.

**Con `D-31` puesto, la parte silenciosa se achica.** `looker/CC` tiene hoy tres filas de `MAPEO`
con testigo declarado, así que una columna insertada a su izquierda deja de ser invisible: el
encabezado esperado y el real dejan de coincidir. **No se detecta solo todavía** —la función que
compara está diferida— pero el dato para detectarlo ya está escrito, y el diff de `instalar()`
alcanza para verlo a mano.

**Lo que no cambia:** la segunda medición que `C-61` pide sigue haciendo falta —cuántos tokens ya
validados cambian de valor, y ninguno de los exactos vigentes puede moverse—. El testigo cubre el
corrimiento estructural, no el efecto sobre los números.

**Hay que revisar el caso a la luz de esto** antes de ejecutarlo, que es el frente 7 del plan.

---

## Un `uso` con espacios apaga la solapa y nada lo dice — 15/08/2026

**Destapado al arreglar `D-32`**, no buscado. `buscarMapeo` compara `uso !== 'fuente'` **crudo**,
sin normalizar ningún lado. Una celda tipeada como `" fuente "` —con un espacio de más, que es
lo que produce una carga a mano— **no matchea**, y la solapa queda apagada: el marcador falla con
`«FALTA:…@solapa_no_fuente»` sobre una fila que a la vista dice `fuente`.

**Es el modo de falla más caro del proyecto invertido:** no publica un número plausible, publica
un `«FALTA:»` cuya causa es invisible en la hoja. Quien mire la celda va a leer `fuente` y buscar
el problema en otro lado.

**Contradice `R-10`**, que manda normalizar los dos lados de toda comparación contra una
planilla. `SOLAPAS` es hoja de registro, no base, pero se carga igual a mano.

**Qué lo destraba:** pasar `usoSolapa_` o `buscarMapeo` por `normalizarValorDeclarado_`. Es una
línea, pero toca el camino de lectura de **todas** las fuentes, así que necesita su propia
corrida de verificación y no entra de paso.

**Mientras tanto hay media red, y llegó por casualidad:** `D-32` ahora normaliza para comparar,
así que el sembrador **reescribe la celda limpia** cuando el valor normalizado coincide con el
del seed. O sea que una siembra arregla el espacio en las filas que el seed conoce. **No cubre
las que el seed no tiene**, ni las `origen=manual`.

**No está medido si hay alguna celda así hoy.** `diffSolapasSinAplicar_` no lo mostraría: compara
seed contra hoja, y si las dos dicen `fuente` con distinto espaciado, ahora normaliza y no las
reporta. Para saberlo hay que mirar las 84 celdas de `uso` crudas.

### El destrabe — qué habría que tocar, medido el 15/08/2026

**Los comparadores de `uso` en el camino de lectura son seis, y todos comparan crudo:**

| dónde | qué compara | de dónde saca el `uso` |
|---|---|---|
| `Config.gs:251` — **`buscarMapeo`** | `uso !== 'fuente'` | `usoSolapa_` |
| `Fuentes.gs:399` | `usoSolapa_(...) !== 'fuente'` | `usoSolapa_` |
| `Generador.gs:54` | `usoSolapa_(...) === 'fuente'` | `usoSolapa_` |
| `Fuentes.gs:197` | `uso !== 'fuente'` | `leerSolapas()` directo |
| `Fuentes.gs:719` | `destino.uso !== 'fuente'` | `leerSolapas()` directo |
| `Auditoria.gs:638` | `fila.uso !== 'fuente'` | `leerSolapas()` directo — instrumento |

**Los seis convergen en un solo constructor: `leerSolapasSinCache_` (`Config.gs:184`)**, que arma
`registro[baseId][solapa] = { uso: fila[idx.uso], … }` con el valor crudo de la celda. `usoSolapa_`
sólo lo devuelve.

**Por eso el arreglo es de una línea y en un solo lugar:** normalizar `uso` **al construir el
registro**, con `normalizarValorDeclarado_`. Los seis consumidores reciben el valor limpio sin
tocarlos, y no hace falta acordarse de normalizar en el séptimo que se escriba — que es
exactamente el modo de falla que este repo ya tuvo tres veces con las columnas nuevas.

**Lo que hay que verificar antes de darlo por bueno, y es lo que lo saca de "una línea":**

1. **Que el sembrador no cambie de comportamiento.** `aplicarClasificacionSolapas_` **no** usa
   `leerSolapas()` sino `leerFilasSolapas_` (`Solapas.gs`), así que en principio no lo toca. Hay
   que confirmarlo, no suponerlo.
2. **Que ningún consumidor dependa del valor crudo** para escribirlo de vuelta. Un `uso` leído
   normalizado y reescrito limpiaría la celda de costado, que es un efecto y no un arreglo.
3. **Que `DIAG_BASES` y los reportes sigan mostrando lo que la celda tiene**, no lo normalizado:
   si el instrumento normaliza, el síntoma vuelve a ser invisible y el pendiente se cierra sin
   estar resuelto.

**La prueba que lo verificaría**, y tiene que ser de las dos mitades:

- **La pura:** `usoSolapa_` sobre un registro fabricado con `' fuente '`, `'fuente\n'` y
  `'Fuente'` — las dos primeras tienen que resolver `fuente`; **la tercera no**, porque `R-10`
  preserva mayúsculas y plegar el case acá sería otra decisión, no ésta.
- **La de punta a punta, que es la que cierra:** poner una celda de `SOLAPAS` con un espacio de
  más, correr `buscarMapeo` sobre esa solapa y verificar que **resuelve**. Hoy devuelve
  `«FALTA:…@solapa_no_fuente»`, así que el control positivo existe y es visible: **la prueba
  falla antes del arreglo y pasa después**, que es lo único que prueba que el arreglo sirve.

**Por qué no se hace de paso:** toca el camino de lectura de **todas** las fuentes, y una
regresión ahí no rompe la corrida — la deja publicando menos. Necesita su propia corrida.

---

## Una planilla que veinte solapas espejan y `BASES` no conoce — 15/08/2026

`1siyVJPVuObp1UEeQTS4IncXpsbev_Iqs-b27hZfLhds`. **Las 20 solapas nuevas de `reuniones` son
`IMPORTRANGE` suyos** —una fórmula en `A1` por solapa, rango entero, medido el 15/08— y las
cuatro registradas tienen cero fórmulas.

**Por qué es un pendiente y no un dato de color:** `Métricas EDVs` es **el superconjunto de
`Agenda JM`**, verificado sobre `1493` (sus `S/T/U/V` reproducen exacto `AA/AJ/AM`). O sea que
**el dato que el motor publica hoy nace en esa planilla**, viaja por un espejo, y el motor lee la
copia de la copia sin saber que existe el original.

**Qué lo destraba:** decidir si esa planilla se registra en `BASES`. **No es automático** — su
dueño es ajeno, y `R-02` y el caso `digital/RDV` ya enseñaron que sumar una fuente que duplica
otra produce doble conteo. La pregunta concreta es si algún token necesita algo que **sólo** esté
ahí: hoy el candidato es la columna `Validación` de `Métricas EDVs`, que no existe en ninguna
solapa registrada.

**Mientras tanto, las 20 quedan fuera de `fuente` por regla y no por caso**: leer un espejo es
tener dos respuestas para la misma pregunta, y la segunda envejece sin avisar.

---

## `Agenda JM | Post` ya usa `-` como dato, y `-` iba a ser un estado publicable — 15/08/2026

Medido el 15/08: la solapa **trae `-` como valor** en varias columnas. El frente de los estados
`-` / `---` —bloqueado en `PLAN.md` §3, esperando decisión del usuario— iba a definir `-` como
**estado publicable** del motor.

**Son dos cosas distintas con el mismo símbolo**, y hoy no hay forma de distinguirlas: un `-` que
viene de la base y un `-` que el motor escribe porque algo no es calculable se ven igual en el
deck y en `FALTANTES`.

**Qué lo destraba:** la misma decisión del usuario que ya está esperando, **con esta pregunta
agregada**: si el estado publicable se distingue del dato, o si se elige otro símbolo. **No se
resuelve acá**; se anota para que la decisión se tome sabiendo esto.

---

## Los tres pares `pauta_*` / `gcba_pauta_*` publican el mismo número dos veces — 15/08/2026

**Medido** sobre `docs/_snapshots/MARCADORES_2026-08-15.tsv`:

| par | base / solapa | `campo_logico` | `operacion` | `filtro` |
|---|---|---|---|---|
| `pauta_google` · `gcba_pauta_google` | `digital/Seguimiento digital` | `sd_pauta_google` | `SUMA` | **vacío en los dos** |
| `pauta_meta` · `gcba_pauta_meta` | ídem | `sd_pauta_meta` | `SUMA` | **vacío en los dos** |
| `pauta_prog` · `gcba_pauta_prog` | ídem | `sd_pauta_prog` | `SUMA` | **vacío en los dos** |

**La definición es idéntica en todo.** Lo único que los distingue es la columna `familia`
—`pauta` contra `gcba`—, **y `familia` no filtra nada**: se usa para reconocer el bloque modelo
en la plantilla, no para acotar filas. Los seis marcadores leen las mismas filas y devuelven el
mismo número.

**Por qué esto NO es migración al vocabulario de `D-33`, aunque lo parezca.** El prefijo `gcba_`
sugiere que son la misma medida con distinto `ambito` — y si lo fueran, colapsarían en una sola
con su dimensión. **Pero no lo son: no hay ningún corte de ámbito escrito.** O uno de los dos está
mal, o los dos lo están y **falta el filtro en ambos**. Migrarlos sería **convertir un error en un
error estructurado**, y con el nombre nuevo dejaría de verse.

**Qué lo destraba:** decidir si el desglose de pauta tiene corte JM/GCBA. Si lo tiene, los seis
necesitan filtro y hoy ninguno lo tiene; si no lo tiene, sobran tres marcadores. **Es un caso de
validación con su propio prompt**, no un paso de la migración.

⚠ **No entra a la migración del frente 4**, y queda dicho acá para que nadie lo levante como
"tanda fácil": los tres pares son el caso que **más** se parece a una migración y el que menos lo
es.

---

## Diez marcadores en `error` sobre 78 — y nueve son `D-30` funcionando, no un bug — 15/08/2026

`resolverMarcadores('jm')` reporta `ok=61 · sin_datos=7 · revisar=0 · error=10`. **El número
estaba a la vista desde hace tiempo y nadie lo había abierto.** Ninguno de los ocho del piloto
está entre ellos —los ocho dan `ok`—, así que esto no lo afecta.

### Los nueve de `reuniones/Agenda JM`: no están rotos

Son marcadores cuyo **grano es la cuenta** —`cc_base_total`, `cc_base_discada`, `cc_contactados`,
`cc_contactados_pct`, `cc_efectivos`, `cc_efectivos_pct`, `imp_totales`, `alc_potencial`,
`alc_cobertura_pct`— emitidos **sin `id_cuenta` en el contexto**.

**Es `D-30` funcionando exactamente como se diseñó.** `SOLAPAS.campo_id_cuenta` hace que un
marcador lea la fila de **su** encuentro; sin `id_cuenta`, la rama **falla con motivo** en vez de
caer a leer la solapa entera. Caer sería publicar el agregado de 154 encuentros creyendo que
publicó uno — el número plausible.

⚠ **Sólo resuelven dentro de una sección que itere encuentros.** Corridos sueltos, como los corre
`resolverMarcadores('jm')` sin contexto de ítem, **tienen que fallar**.

**Queda escrito así porque leído de otra manera parece que nueve marcadores están rotos**, y el
próximo que mire el `error=10` va a salir a arreglarlos. **No hay nada que arreglar acá.**

### El décimo sí es un hallazgo: `enc_alcance`

**Falla porque `digital/Alcance` no declara `fecha_periodo` en `MAPEO`.**

**Y eso obliga a revisar la conclusión de `A-14` y `A-15`.** Los dos casos concluyen que
`enc_alcance` *"no tiene fuente medible **porque la base está incompleta**"* — `A-14` mide
PRE+POST de `reuniones` y cierra uno de seis; `A-15` confirma que `Base_Digital` no agrega
información. Esa evaluación **de la fuente candidata sigue en pie**.

**Lo que cambia es la causa del síntoma de hoy.** Si `enc_alcance` falla por **una fila de
`MAPEO` que falta**, entonces:

| pregunta | qué la responde | estado |
|---|---|---|
| ¿`reuniones` puede ser la fuente de `enc_alcance`? | `A-14` / `A-15` | sin medir — la base está incompleta |
| ¿por qué `enc_alcance` no publica **hoy**? | **una `fecha_periodo` que falta en `digital/Alcance`** | **abierto, y es más chico de lo que parecía** |

**Es la tercera vez que estas dos preguntas se responden con una sola.** La anterior fue el
14/08, con `digital/Digital` en `ignorar`. Cada vez que aparece una causa nueva del `—` de
`enc_alcance`, la conclusión de `A-14`/`A-15` se lee como si ya lo explicara.

**Qué lo destraba:** medir si `digital/Alcance` tiene alguna columna temporal que mapear. Si no
la tiene, es el caso de `R-25` —una solapa sin fecha propia toma la ventana de otra por
`ventana_ref`— y no una fila de `MAPEO` que alguien olvidó.

**No se arregla acá.** `digital/Alcance` es `uso = fuente` y tocarla afecta a `alc_alcance` y
`alc_frecuencia`, que hoy publican bien.

---

## ~~`sembrarSecciones_` nunca actualiza, y no se sabe si es decisión o descuido~~ — **RESUELTO 16/08/2026**

> **Decisión del usuario, 16/08: `SECCIONES` se comporta como `CONFIG` — la hoja manda, el seed
> sólo siembra lo ausente.** No hubo código que tocar: `sembrarSecciones_` **ya se comportaba
> así**. Lo que faltaba era que fuera **decisión** y no *"la regla simple y segura"*, que es como
> estaba escrito — un default prudente se revisa cuando molesta; una decisión hay que superseder.
> El motivo quedó al lado de la función, en `Instalar.gs`.
>
> **La entrada no se borra**, y el diagnóstico de abajo sigue siendo el correcto: lo único que
> cambia es que la pregunta abierta ahora tiene respuesta. **El síntoma sigue vigente y hay que
> conocerlo** — un valor corregido en `SEED_SECCIONES_` no llega a la hoja, en silencio.
>
> ⚠ **Una corrección a lo que decía esta entrada:** *"no hay nota que lo justifique"* era
> **demasiado fuerte**. La nota existía y explicaba el mecanismo —no hay columna `origen` en
> `SECCIONES` para distinguir lo sembrado de lo editado a mano—; lo que no había era una decisión
> declarada.

### El diagnóstico original, que sigue valiendo

**El hecho, medido:** `sembrarSecciones_` (`Instalar.gs`) **sólo inserta filas nuevas**. Filtra
`SEED_SECCIONES_` por las `seccion_id` que no están en la hoja y agrega esas; **para una fila que
ya existe no compara ni escribe nada.**

**Por qué es un pendiente y no un bug:** **la misma conducta en `CONFIG` es deliberada y está
explicada** — `seedConfigConfig_` escribe sólo si la celda está vacía porque **el default es piso,
no autoridad**, y el humano edita valores que el seed no debe pisar. En `SECCIONES` **no hay
ninguna nota que diga lo mismo ni lo contrario.** Puede ser la misma decisión sin escribir, o
puede ser que nadie lo pensó.

**El síntoma, escrito porque no se parece a un error:** un valor corregido en `SEED_SECCIONES_`
produce **una corrida que dice "sin cambios" y una hoja que no se mueve**, y **las dos cosas son
ciertas por separado**. Es una operación que **no falla y no hace** — lo mismo que `D-32` vino a
evitar del otro lado. Nada avisa, y parece verde.

**Qué lo destraba, y es una sola pregunta:** ¿`SECCIONES` debe comportarse como **`CONFIG`** —la
hoja manda, el seed sólo siembra lo ausente— o como **`BASES`/`MAPEO`/`INFORMES`/`PERIODOS`** —el
seed corrige lo que difiere—? **Es del usuario y no se decide acá.**

- **Si la respuesta es "como `CONFIG`"**, no hay que tocar código: hay que **escribir la nota**,
  que es lo único que falta.
- **Si es "como `BASES`"**, `sembrarSecciones_` pasa a `upsertPorClave_` con clave `seccion_id`,
  y eso **hay que medirlo antes**: `SECCIONES` tiene columnas que el seed podría no declarar, y
  `upsertPorClave_` **reescribe la fila entera** poniendo `''` en lo que el objeto no traiga.

⚠ **Y lo que hay que mirar antes de concluir que una corrección de seed no llegó**, porque ya
costó dos veces esta semana: **un cambio de seed no existe hasta que se empuja**, y *"la hoja no
cambió"* tiene **dos** causas más frecuentes que ésta — la corrida equivocada (`instalar()` no
siembra; 15/08) y el código sin pushear (16/08). Las tres se ven igual. `CLAUDE.md` §4.

**La tabla completa de qué hoja propaga una corrección y cuál no está en `docs/ESCRITORES.md`
§1 bis.**

---

## Seis marcadores de convocatoria no publican: `«FALTA:@ultimo_ambiguo»` en `Directa Mail` — 17/08/2026

**El hecho, medido:** los seis `enc_mails_*` —`enc_mails_enviados`, `enc_mails_entregados`,
`enc_aperturas`, `enc_clics_ctor`, `enc_or`, `enc_ctor`— dan **`sin_datos`** con
`«FALTA:@ultimo_ambiguo»`.

**La causa, y el motor hace lo correcto:** dos filas de `digital/Directa Mail` **comparten la
fecha más alta con valores distintos**, y `opULTIMO` **se niega a elegir**. Es la guarda que
introdujo el `_39` el 12/08 — antes elegía por posición y publicaba un número que parecía bueno.
**Preferir el hueco al número arbitrario es la decisión correcta y no se revierte.**

**Qué significa hoy, dicho para que nadie lo descubra mirando el deck:** **la lámina de
convocatoria tiene seis huecos.** No es un token sin cablear ni una migración a medias: están
cableados, la fuente resuelve, el filtro corre — **y la operación no puede decidir**.

⚠ **Es una pregunta del DOMINIO, no del vocabulario, y NO bloquea la migración.** Lo que falta es
que alguien diga **cuál de las dos filas vale** cuando dos envíos comparten la fecha más alta —o
si hay que desempatar por otra columna—. Eso lo decide quien conoce el dato, no el motor.

**Consecuencia inmediata, ya aplicada (17/08):** los seis **salieron de la tanda 2**, que queda en
los siete `m2_*`. Un marcador que no produce valor **no se puede migrar y verificar**: la Parte C
compararía `sin_datos` contra `sin_datos`, que **reproduce trivialmente y no prueba nada**.

⚠ **Y deja `tipo_envio` migrada a medias**, con `m2` en `dimensiones` y `convocatoria` todavía en
`filtro`. **Las dos formas conviven** —que el piloto ya estableció como aceptable— pero un censo
de dimensiones que no lo espere lo va a leer como inconsistencia.

**Qué lo destraba:** una decisión del usuario sobre el desempate. Mientras tanto los seis siguen
publicando el hueco, que es la conducta correcta.

---

## Sin recorte por ventana, los canales de `rdv` suman 1 más que `inscriptos` — 17/08/2026

**El hecho, medido** con `medirUnoAUnoDeRdv()` sobre los 23 encuentros `"1 a 1"`, **sin ventana**:

```
insc_mail + insc_digital = 18 + 4.313 = 4.331
inscriptos                              = 4.330
                                  sobra   1
```

**Y en la ventana semanal la identidad cierra exacta**: `testigoDeRdv()` la midió el mismo día en
**2.307** contra 2.307, con los cinco canales. **El descuadre aparece sólo sin recorte temporal.**

**Por qué es un hallazgo y no un error a corregir:** una diferencia de **1 en 4.330** no mueve
ninguna conclusión —`R-26` se apoya en un 99,61% contra un 0,42%— pero **significa que sobre el
histórico completo los cinco canales no son una partición exacta de `inscriptos`**, y eso vale
saberlo antes de usar esa identidad como control en otra medición.

**Las explicaciones posibles son distintas entre sí y ninguna está medida:** una fila con doble
conteo, un inscripto que entró por una vía no listada, o un valor tipeado a mano. **No se elige la
más probable** — medir cuál es, es lo que destraba esto.

⚠ **No confundir con la identidad en ventana, que sí cierra y sí sirve como control.** Son dos
mediciones distintas del mismo campo y **la que vale como invariante estructural es la de
ventana**, que es la que una migración va a tener que reproducir.

---

## Ninguna hoja de registro fecha una escritura sobre `MARCADORES` — 17/08/2026

**El caso que lo destapó:** la tanda 4 de `D-33` **estaba aplicada y nadie sabe en qué corrida**.
A las 11:58 del 17/08 los dos marcadores tenían `dimensiones` vacío; a las 19:10
`curarCamposMarcadores_` los reportó como `YA ESTABA` en los cuatro campos. **La escritura ocurrió
en esa ventana de siete horas y ninguna corrida la reclama.**

**`CORRIDAS` no lo puede responder, y no es una falla suya.** Registra **generaciones de informe**
—`corrida_id`, `informe_id`, `periodo_id`, `deck_id`, `fecha_generacion`, `tokens_reemplazados`,
`faltantes`, `mapa_tokens`— y es un **insumo, no un log** (`D-07`). Las escrituras de
configuración van por otro camino —el menú, los wrappers de migración, `upsertPorClave_`— y
**ninguno deja rastro fechado**.

**Lo único que acota la ventana son los snapshots**, y dan el día pero no la hora:
`MARCADORES_2026-08-17.tsv` tiene **40** marcadores con `dimensiones`,
`MARCADORES_2026-08-18.tsv` tiene **42**.

⚠ **Es menor mientras los controles cierren, y por eso no bloqueó la tanda.** Se anota porque
**un cambio en una hoja de registro sin corrida que lo reclame es exactamente el caso donde hace
falta poder decir cuándo pasó** — y porque el repo tiene el precedente inverso: `abrirCorrida_`
existe para que una generación que muere deje su fila igual. Las escrituras de configuración no
tienen ese equivalente.

**No se propone solución acá.** Un log de escrituras es una hoja nueva y una decisión de esquema;
lo que corresponde es dejar dicho que hoy la pregunta *"¿cuándo se escribió esto?"* **no tiene
dueño**.

## ~~`tools/snapshot.js` fecha en UTC y adelanta un día después de las 21:00~~ — ✅ **CERRADO 17/08/2026**

> **Arreglado el mismo día, y no fue a la cola.** Decisión del usuario: *"es el mecanismo que
> sostiene todas las verificaciones que vienen"*. Las dos cosas quedaron hechas —**fecha local** y
> **no pisar nunca**— con control positivo en `tools/probar-snapshot.js`, **16 afirmaciones**, sobre
> un sistema de archivos inyectado: una prueba de *"no pises archivos"* que necesitara archivos de
> verdad sería la primera candidata a hacer justamente eso.
>
> **La garantía nueva, dicha como propiedad:** un archivo de snapshot **nunca cambia de contenido
> una vez escrito**. Si la hoja cambió, la toma nueva va a `<HOJA>_<fecha>_<HHMM>.tsv` y la primera
> del día conserva el nombre pelado — que es al que apuntan las citas ya escritas. Si no cambió, no
> se escribe nada.
>
> Se deja el diagnóstico abajo porque explica **por qué** el archivo es como es.

`const fecha = opcion(argv, 'fecha', new Date().toISOString().slice(0, 10));` — **`toISOString()`
es UTC**, y la máquina corre en ART (UTC−3). **Todo snapshot tomado después de las 21:00 locales
se archiva con la fecha del día siguiente.**

**Medido:** a las 22:31 del 17/08 la corrida escribió once archivos `*_2026-08-18.tsv`.

⚠ **Importa más de lo que parece porque estos archivos son evidencia fechada** (§7): son la
respuesta a *"¿qué decía una hoja de registro en una fecha dada?"*, y **la fecha del nombre es lo
único que los ordena**. Un snapshot adelantado un día hace que una cita al *"snapshot del 18"*
describa el estado del 17 — que es la clase de error que el versionado de snapshots vino a evitar.

**El taller ya tiene la salida:** el script acepta `--fecha=AAAA-MM-DD`, y se usó para corregir la
tanda de las 22:31. **Pero un default que hay que acordarse de corregir a mano es deuda**, y de la
clase que no falla: el archivo se escribe igual, con el nombre equivocado, sin que nada avise.

⚠ **Y un segundo efecto, que se pagó el mismo día: re-correr el snapshot el mismo día PISA la
evidencia anterior.** El `MARCADORES_2026-08-17.tsv` pre-migración se sobrescribió con el estado
post-migración, y **la única copia del estado previo quedó en git**. Se recuperó con
`git checkout`, pero **nada en el script advierte que está por pisar un archivo ya versionado**.
Los dos problemas son de la misma familia: **el nombre del archivo es la única identidad del
snapshot, y nada protege esa identidad.**

⚠ **Y el modo de falla no es sólo de `snapshot.js`: alcanza a toda la evidencia fechada, y volvió a
aparecer el 19/08 en `docs/` — dos veces.** `f19f637` dejó **dos** archivos llamados
`casos_validacion_CONSOLIDADO_2026-08-14.csv` con contenidos distintos, y el congelado quedó cinco
días atrasado respecto de la corrida que decía congelar; `ee1d9d5` **renombró** ese CSV a
`casos_validacion 2026-08-19.csv` —con espacio en vez de guion bajo— dentro de un commit que habla
de testigos y **no lo menciona en ninguna línea**. Los dos casos ya están reparados
(`2026-08-19_3`); lo que sigue sin protección es lo mismo de arriba, un escalón más arriba: **un
archivo de evidencia fechada renombrado o duplicado por un commit que habla de otra cosa no falla,
y el nombre es toda su identidad.** Anotado, sin frente abierto.

---

## El alcance de `looker` se recalcula **hacia arriba** sobre ventanas cerradas — 19/08/2026

**Dos tomas del mismo período, `2026-07-24–2026-07-30`, cerrado hace tres semanas:**

| | 17/08 | 19/08 18:38 |
|---|---|---|
| alcance `jm` (denominador de `frecuencia`) | **475.723** | **745.632** · **+56,7 %** |
| alcance `gcba` | 1.249.387 | 1.253.901 · +0,36 % |
| impresiones `jm` (numerador) | 6.763.034 | 7.671.871 · +13,4 % |
| **cuentas de filas** | 4/26 · 22/26 | **idénticas** |

**Mismas filas, otros números.** Por la regla de `CLAUDE.md` §4 eso descarta que la causa sea un
recorte distinto: **la fuente reescribió los valores en su lugar.**

⚠ **Un acumulado no baja, y tampoco salta 56,7 % tres semanas después.** Las explicaciones posibles
son **distintas entre sí y ninguna está medida**:

1. **recálculo de la deduplicación** — el alcance es deduplicado, así que puede recalcularse en
   cualquier dirección;
2. **cambio de universo** — filas que entraron o salieron de la campaña sin cambiar el conteo de
   filas de la solapa;
3. **carga tardía** — datos de julio que llegaron en agosto.

**No se elige la más probable.** Medir cuál es, es lo que destraba esto.

⚠ **Y el asimétrico que hay que explicar igual:** `jm` se movió **+56,7 %** y `gcba` **+0,36 %**,
en la misma solapa y la misma toma. **Cualquier explicación tiene que dar cuenta de esa
diferencia** — un recálculo global no la produce.

### Lo que ya cambió por esto, y no espera a resolverse

- **Los gates de verificación no pueden usar «el valor se movió» entre corridas de días
  distintos.** El criterio pasa a ser **partición + cuentas de filas**, y la comparación de valores
  **sólo dentro de la misma sesión**.
- **Toda cifra de `looker` citada en un caso lleva hora.**

## `SOLAPAS.filas_datos` envejece sin avisar — 19/08/2026

`digital/CAMPAÑAS_DESGLOCE_DIGITAL` declara **4.904 filas** en `SOLAPAS` y la solapa tiene
**5.037** (medido el 19/08 leyéndola directo). **133 filas de diferencia, y nada lo señaló.**

**No es un bug: es una medición de `inventariarSolapas` que no se re-corrió.** Pero es del mismo
tipo que las otras columnas de medición del repo —`filas_crudas`, `firma_encabezado`— y **el
problema es que se leen como si fueran el estado de hoy**.

⚠ **Es la regla de la evidencia fechada aplicada a una columna:** un número medido una vez, guardado
en una hoja, **no declara cuándo se midió**. A diferencia de un snapshot —que lleva la fecha en el
nombre— acá no hay forma de saber si está vieja **sin volver a medir**.

**Lo accionable:** re-correr `inventariarSolapas` y, antes de citar `filas_datos` para decidir algo,
**mirar si la cifra la produjo esta semana o hace un mes**.


---

## El `alcance` de `looker` — **tres observaciones del mismo campo, en una sola entrada** — 19/08/2026

> Van juntas a propósito: son **el mismo campo** —`alcance`, `looker/resumen_metricas_dinamico`
> col K, encabezado `meta_alcance`— visto desde tres lados. En tres entradas separadas se leerían
> como tres problemas, y **cualquier explicación tiene que dar cuenta de las tres a la vez**.

### 1 · Se recalcula **hacia arriba** sobre ventanas cerradas

Ventana `2026-07-24–2026-07-30`, cerrada hace tres semanas:

| | 17/08 22:21 | 19/08 22:59 |
|---|---|---|
| alcance `jm` | **475.723** | **745.632** · **+56,7 %** |
| alcance `gcba` | 1.249.387 | 1.253.901 · +0,36 % |
| impresiones `jm` | 6.763.034 | 7.791.187 · +15,2 % |
| **cuentas de filas** | 4/26 · 22/26 | **idénticas** |

**Mismas filas, otros números**: la fuente reescribió los valores en su lugar.

### 2 · Y en otra medición **bajó** — la caída de `3305`

El addendum a `X-19` midió el 19/08 el alcance de la campaña `3305-JULSEGGJ`: el deck de julio
publica **3.178.282** y la base daba **3.042.983**, **−4,3 %**.

⚠ **Sube en un corte y baja en otro, el mismo día y sobre el mismo campo.** Cualquier explicación
tiene que producir **las dos direcciones**.

### 3 · `A-12` — la columna dice **Meta** y el deck dice *"Usuarios alcanzados"*

> ⭐ **VERIFICADO el 26/08/2026, y era lo único de `A-12` que no estaba medido:** el encabezado físico de la col K de `looker/resumen_metricas_dinamico` dice, literal, **`meta_alcance`**. La premisa de este caso **se sostiene**. ⚠ Lo que se agrega es la distinción de capas que faltaba: el **campo lógico** es `alcance` y `meta_alcance` **no existe como campo lógico** de esa solapa, así que buscarlo como tal da cero — y eso hizo creer un rato que la nota de `camp_alcance` estaba mal. Las dos cosas son ciertas.
>
> ⚠ **Y la causa de la ambigüedad, que es barata de cerrar y NO se cerró acá:** la fila de `MAPEO` tiene la columna testigo `encabezado` **vacía** (`D-31`). Con el testigo cargado, las dos capas se leen de la fila sin tener que medir nada. Tocar `MAPEO` estaba fuera del alcance de esta vuelta.

`alcance` mapea a la columna cuyo encabezado es **`meta_alcance`**, y el deck lo publica **sin
plataforma**. Si la columna es sólo de Meta, **el alcance publicado no es el total** — y eso
explicaría un desvío estable, aunque no el movimiento.

### Lo que NO se elige

**Las explicaciones posibles son distintas entre sí y ninguna está medida:** recálculo de la
deduplicación · cambio de universo · carga tardía · o que la columna no sea lo que el token cree.
**No se elige la más probable.**

⚠ **Y el asimétrico que cualquier explicación tiene que cubrir:** `jm` **+56,7 %** contra `gcba`
**+0,36 %**, misma solapa, misma toma. **Un recálculo global no produce eso.**

### Lo que ya cambió por esto, sin esperar a resolverse

- **`frecuencia` y `gcba_frecuencia` publican con `numero_revisar`** (19/08) — entre guiones, con
  el motivo en sus `notas`. **Publican igual**: el número se calcula bien, lo que no está cerrado
  es de qué universo sale.
- **Los gates de verificación no pueden usar «el valor se movió» entre corridas de días
  distintos.** El criterio es **partición + cuentas de filas**; los valores, sólo en la misma
  sesión.
- **Toda cifra de `looker` citada en un caso lleva la hora de la corrida.**

## Dos convenciones decimales conviven en la misma lámina — 19/08/2026

**Preexistente. Se anota y NO se arregla acá.**

| formato | implementación | salida |
|---|---|---|
| `miles` | `toLocaleString('es-AR')` | `3.042.983` |
| `numero` | `String(Math.round(n*100)/100)` | `8.89` — **punto**, no coma |

**En la lámina de campaña destacada van a convivir las dos**, y el deck publica **`8,4` con coma**.

⚠ **Ya está anotado en las notas de los cinco `ecv_insc_*_pct`** desde el 05/08 —*"falta el formato
«unidades de pct sin signo»"*— así que **no es un hallazgo nuevo: es el mismo, llegando a una
lámina más**. Se registra acá porque ahora afecta a un token que se está dando de alta
(`camp_frecuencia`, con `numero_revisar`, que hereda el punto).

---

## ~~Los fixtures de validación no están en el repo: los 104 casos `exacto` sólo los puede reproducir el usuario~~ — ✅ **CERRADO 20/08/2026, por decisión de privacidad**

> **Resuelto sin subir nada, y el motivo importa: no se hizo la tarea, se decidió que no se hace.**
> Decisión del usuario, 19/08 — **salida 3**, con la vuelta que la hace suficiente. `.gitignore`
> **se queda como está** y su motivo sigue valiendo. Los fixtures viven en la carpeta local
> `docs/_fixtures/`, fuera de git, y **se pasan a demanda por el chat**.
>
> **Lo que el repo guarda ahora no son los archivos: es dónde están y cómo se reconocen.**
> `docs/_fixtures/README.md` lleva la ruta local absoluta, el estado real de cada uno
> —`[local]` / `[no está]`, nunca `[falta]` sobre algo que existe— y, por cada archivo presente,
> **tamaño en bytes y `sha256`**.
>
> ⚠ **El sha es la mitad que hace que la decisión funcione.** Un archivo pegado en un chat, sin
> huella, es **anónimo**: nada distingue el export del 12/08 del que le siguió dos días después, y
> los dos se llaman casi igual. Un caso `exacto` medido contra un archivo anónimo **no es
> reproducible**, que es justo lo que este pendiente quería arreglar. Con el sha en el repo, quien
> recibe el adjunto puede afirmar **contra cuál midió**. El protocolo: **verificar el sha contra la
> tabla ANTES de citar un número.**
>
> **Y sirvió en su primer uso:** los dos `.zip` que el usuario copió a `docs/_fixtures/` resultaron
> **idénticos byte a byte** a los que ya estaban en `Plan Inicial/_archivo/samples/Informes
> ejemplo/` desde el 03/08 y el 06/08. **Dos de los ocho fixtures ya estaban en el disco del repo
> hacía dos semanas y nadie lo sabía**, porque sin huella nada relacionaba una copia con la otra.
>
> ⚠ **El riesgo que se acepta, escrito antes de que pase.** La salida elegida deja los fixtures
> **fuera de todo respaldo versionado**: si la carpeta local se pierde —disco, sincronización de
> OneDrive, borrado a mano—, **los 104 casos `exacto` dejan de ser reproducibles** y el índice sólo
> sirve para saber **exactamente qué se perdió**. Eso no es un efecto colateral: **es la mitad de
> lo que se eligió.** La contrapartida es que ningún dato personal de un vecino entra a un repo
> público.
>
> **Las tres salidas de abajo NO se borran.** Se eligió la 3; las otras dos quedan escritas por si
> el riesgo cambia de tamaño. Registrado también en la nota de `C-21` del CSV de casos.
>
> Se deja el diagnóstico abajo porque explica **por qué** la decisión es la que es.

**Qué pasa.** La rama de validación produjo **218 casos**, de los cuales **104 están en estado
`exacto`**. Cada uno afirma que un número publicado en un deck coincide con lo que dice una base, y
la prueba de esa afirmación son **ocho exports** que viven **sólo en la máquina del usuario**. Si
se pierden, los 104 casos no dejan de ser ciertos: dejan de ser **verificables**, que a los efectos
del repo es lo mismo. Nadie más puede repetir una medición ni auditar una que salió mal.

El inventario de los ocho está en `docs/_fixtures/README.md`, con la tabla copiada de la §8 de
`docs/Sesiones/HANDOFF_validacion_2026-08-19.md`. Hoy: **ocho de ocho `[falta]`**.

**Por qué sobrevivió sin que nadie lo mirara.** El CSV registra esto como `C-21` **en estado
`cerrado`** —y la nota del propio caso dice *"ninguno archivado en el repo"*—. Un caso cerrado que
describe una tarea sin hacer no aparece en ninguna revisión de pendientes. El CSV es congelado y no
se edita, así que la única salida era declararlo en un documento vivo. Ésta es esa declaración.

⚠ **Lo que lo destraba NO es tocar `.gitignore`, y ahí está lo que hay que decidir.** `.gitignore`
excluye `*.xlsx` y `*.zip` —que es **todo** lo de la tabla— y lo hace con el motivo escrito al lado
desde el 31/07 (`DOC-5` Parte 2):

> *el repo es público y las bases tienen datos reales de GCBA (nombres de funcionarios, barrios,
> volúmenes de envío, respuestas de vecinos)*

O sea que las dos mitades de este pendiente **se contradicen**: archivar los fixtures hace
reproducible la validación **y** publica datos personales de vecinos en un repo público. No es un
descuido de configuración que se arregla con una excepción; es una decisión de privacidad que hay
que volver a tomar.

**Las tres salidas, para que quien decida las tenga a la vista** (están también en el README):

1. **Repo privado aparte** para los fixtures, referenciado desde `docs/_fixtures/README.md`.
2. **Anonimizar antes de subir** — barato en volúmenes, caro en nombres, y rompe la reproducción
   exacta de cualquier caso que dependa de un nombre.
3. **Dejarlos fuera y aceptar el riesgo**, con el inventario como única red: si se pierden, al menos
   se sabe exactamente qué se perdió.

**Quién lo destraba:** el usuario, eligiendo una de las tres. **Ninguna es gratis**, y por eso esto
es un pendiente y no una tarea.

---

## 23 de 33 casos frenados dejan de esperar una corrida: los contesta un fixture — 20/08/2026

**Es la mitad accionable del `2026-08-20_3`.** Sin esto la regla de los tres caminos existe y nadie
la usa: alguien tiene que decir **cuál caso se contesta con cuál archivo**.

Frenados = `abierto` (13) + `contradice` (20) = **33**, sobre los 218 de
`docs/casos_validacion_2026-08-19.csv`. Cruzados contra las bases que **hoy** están en disco en
`docs/_fixtures/` — medido el 20/08, no citado.

### ✅ Contestables con lo que ya está en disco — **23**

| base | casos |
|---|---|
| `looker` (sólo export 31/07) | `C-12` `C-22` `C-24` `C-61` `A-06` `A-07` `A-11` `X-16` `X-22` `X-26` |
| `rdv` (31/07 y 06/08) | `C-01` `C-02` `C-03` `C-04` `C-07` `C-08` `C-09` |
| `digital` (31/07 y 06/08) | `C-13` `C-14` `C-67` `X-18` `X-27` |
| `m2` (31/07 y 06/08) | `C-06` |

⭐ **`A-11` es el caso limpio por donde conviene empezar** — el alcance con −4,3 %: necesita
`looker/ALCANCE` y `looker/DIGITAL` contra el deck **JM 24-31/07**, y **las dos mitades están
dentro del mismo zip, del mismo día**. Es literalmente *¿la definición produce el número
publicado?*, que es lo que el camino del fixture contesta.

**Más `X-19`**, que en el CSV figura sin base (`-`) pero **también es contestable hoy**: lo que
necesita es la **lámina 17 del deck JM 24-31/07** —que está dentro del fixture— más
`looker/ALCANCE` para el `2,27`.

### ❌ Su base NO está en disco — **6**, y los destraba un solo archivo

`C-53` `C-63` `A-12` `A-14` `A-15` `X-23` — todos de `reuniones`, cuyo export es uno de los
`[no está]` del README.

⭐ **Copiar `Base_reuniones` a `docs/_fixtures/` cierra los seis de una vez**, entre ellos los tres
de `enc_alcance` (`A-12`/`A-14`/`A-15`). **Es el ítem de mayor rendimiento de toda esta lista**, y
no depende de ninguna decisión: es copiar un archivo y anotarle el sha.

### ⚠ Sin base declarada — **4**, hay que mirarlos uno por uno

`C-05` y `C-32` apuntan al resumen ejecutivo y a `looker`; hay que abrirlos para decidir.

⚠ **`X-17` NO se puede cerrar con lo que hay, y su propia nota dice por qué:** *"el conteo nuevo
16/14/21 salió de una base de 4.904 filas y el fixture del 31/07 tiene 4.569"*. **Es el caso
testigo de la regla 3** de los tres caminos —*un fixture es una foto fechada*— y por eso queda
citado ahí: intentar cerrarlo con el export equivocado daría un número plausible y falso, que es
el modo de falla que este proyecto persigue.

### Lo que esto NO afirma

**Que un caso sea contestable no lo cierra.** Dice que **existe el archivo con qué contestarlo** y
que no hace falta esperar una corrida. Y lo que se contestaría es *la definición es correcta*, que
**no** es *el motor lo lee así* — regla 4 de los tres caminos. Si las dos difieren, eso es el
hallazgo.

**Quién lo destraba:** nadie. Ya está destrabado — se mide cuando se quiera. Lo único que espera a
alguien son los seis de `reuniones`, y espera un `copiar y pegar`.

---

## `m2_campanias` PERDIÓ su columna: el grano de `Nombre campaña | Cuentas` cambió entre dos exports — 20/08/2026

> ⚠ **Esta entrada se reescribió el mismo día, y el motivo importa más que el contenido.** La
> primera versión afirmaba que *«`m2_envios` publica 25 donde el deck dice 18»*. **El deck no dice
> 18.** El `18` salía de `PLAN.md` §3, citado por el prompt `2026-08-20_5` como *«lo que la lámina
> declara»*, y se tomó por bueno sin abrir el deck. **Al abrirlo —está adentro del fixture del
> 31/07— dice `12 Campañas · 26 envíos`.** Es `CLAUDE.md` §4 al pie de la letra: *la cita no es la
> fuente*, y un dato citado tres veces envejece igual que cualquier otro.

## `m2_campanias` no tiene columna, y `m2_envios` publica 25 donde el deck dice 18 — 20/08/2026

**Medido contra `docs/_fixtures/Seguimiento Digital2026-08-06.zip`** (sha `9a1ee89d…76b2e9`), solapa
`digital/Directa Mail`, con el corte `tipo_envio=m2` traducido como lo traduce el motor
(`mail_tipo~=M2`, `Fuentes.gs`) y la ventana `julio_24_30`. **Evidencia fechada del export del
06/08**: responde por ese día y por ninguno otro.

**El deck de esa semana dice: 18 envíos · 11 campañas.**

| candidato | distintos | ¿es 18? | ¿es 11? |
|---|---|---|---|
| filas (lo que hoy devuelve `CONTEO`) | **25** | no | no |
| col A `ID Cuentas` (`mail_id_cuenta`) | **18** | ⭐ **sí** | no |
| col U `Nombre campaña \| Cuentas` | **18** | ⭐ **sí** | no |
| col H `Nombre campaña \| Directa` (`mail_campana`) | 24 | no | no |
| col K `Nomenclatura` | 25 | no | no |
| col T `Área` | 6 | no | no |

### ⭐ Hallazgo 1 — `m2_envios` está mal, y `CUENTA_DISTINTOS` lo arregla

`m2_envios` es hoy `CONTEO` sobre `mail_id_cuenta`, o sea **cuenta filas: 25**. El deck dice **18**,
y **`CUENTA_DISTINTOS` sobre el mismo campo da exactamente 18**.

**No es un empate casual**: las 25 filas traen 18 `ID Cuentas` distintos, y col U —otra columna,
otro origen— da **también 18**. Dos caminos independientes al mismo número, y ese número es el
publicado.

⚠ **La nota de la fila de `m2_envios` ya venía avisando y nadie lo leyó como esto:** dice
*"SIN VALIDAR - demo 12/08"* y menciona que el universo no está acotado. El problema no era el
universo: es que **una fila no es un envío**.

⚠ **Y hay que decir qué NO prueba esto:** que el fixture del 06/08 reproduzca el 18 de un deck de
julio dice que **la definición es correcta**; **no** dice que el motor lo lea así hoy. Son las dos
afirmaciones que `CLAUDE.md` §4 manda separar. Confirmarlo es una corrida.

### ⭐ Hallazgo 2 — `m2_campanias` no tiene columna, y por eso NO se cablea

**Ninguna de las cinco columnas da 11.** Y mirando los valores se ve por qué: el `11` es una
**agrupación humana a nivel proyecto** que ninguna columna carga.

Sobre los 18 distintos de col U, agrupando a ojo por proyecto:
`Vacaciones de Invierno` aparece como **tres** valores —*Invierno en las plazas*, *Parque de
invierno*, *Estación invierno*— y `Más servicios en tu barrio` como **cinco**, uno por barrio y
fecha. Colapsados a proyecto dan **12**, contra los 11 del deck.

**Por eso este token se detiene y no se publica el normalizado.** La decisión del usuario del
20/08 —*un error de una base ajena no frena el cableado; se anota y se sigue*— **no aplica acá**:
esto no es ruido de grafía, es que **la medida que el token dice hacer no está en la base**. Y la
misma decisión pone el límite: *"lo que sí se detiene es cualquier cosa que publicaría un número
que no es el que el token dice medir"*. Publicar 18 o 24 bajo el nombre `m2_campanias` sería
exactamente eso — **un número plausible**, del tamaño correcto, y de otra cosa.

**Quién lo destraba:** el equipo, diciendo qué es una «campaña» a ese grano. Hay dos salidas y las
dos son suyas: **(a)** una columna nueva en la base que declare el proyecto, o **(b)** aceptar que
`m2_campanias` se carga a mano, como el resto de la capa editorial.

⛔ **Lo que NO hay que hacer, escrito porque es la salida tentadora:** derivar el proyecto
partiendo el nombre por `|` o por `-`. Acertaría en `Vacaciones de Invierno | …` y erraría en
`DGPLES | MEPHU | REPARACIÓN DE VEREDAS`, que tiene dos barras y es **un** proyecto. Sería lógica
de negocio inventada adentro del motor, y del peor tipo: la que funciona en la muestra que se miró.


### ⭐ El hallazgo real: la columna cambió de grano entre el 31/07 y el 06/08

**Mismas 25 filas, misma ventana cerrada (24–30/07), misma columna `U` — y el contenido es otro.**
Medido sobre los dos fixtures, con sus `sha256` verificados contra la tabla de huellas:

| export | col U, valores distintos | qué son |
|---|---|---|
| **`Informe 2026-07-31.zip`** | **11** — `Vacaciones de invierno 2026` ×8 · `M2` ×6 · `Poda` ×2 · `Reparación de veredas` ×2 · +7 sueltos | **proyectos** |
| **`Seguimiento Digital2026-08-06.zip`** | **18** — `Vacaciones de Invierno \| Invierno en las plazas` · `Más servicios en tu barrio - 27/7 - San Telmo` · … | **envíos** |

**No es drift de la base ni filas nuevas:** las filas son 25 en los dos, `col A` da 18 en los dos y
`col H` da 24 en los dos. **Lo único que se movió es el contenido de `col U`**, que alguien
reescribió pasándolo de nombre de proyecto a nombre de envío.

⚠ **Entonces `m2_campanias` no es un token sin fuente: es un token que TENÍA fuente y la perdió.**
El `11 campañas` de `PLAN.md` §3 no era una invención — es exactamente `col U` distinta en el
export del 31/07. Se puede reproducir hoy, y por eso se sabe qué pasó.

### Por qué esto es peor que un campo que falta

**Nada en el motor puede notarlo.** La columna conserva el nombre —`Nombre campaña | Cuentas`—, la
letra, el encabezado y el tipo. Un `CUENTA_DISTINTOS` cableado contra ella el 31/07 habría
publicado `11` y hoy publicaría `18`, **sin fallar, sin `REVISAR`, sin una línea en `FALTANTES`**.
El número cambia de significado y el token sigue diciendo lo mismo.

Es la familia del *número plausible* que este proyecto persigue, con un agravante: los controles
que existen —`filas_datos`, `firma_encabezado`— **miran la forma, no el grano**. Las tres cuentas
que un cambio de grano deja intactas son justo las que se auditan.

### Qué NO se puede afirmar, y qué queda decidido

- **El deck dice `12 Campañas · 26 envíos`** para la semana 24–31/07, leído del `.pptx` que viene
  adentro del fixture del 31/07 — no de una cita.
- **Ninguna columna, en ninguna de las dos fechas de export, en ninguna de las dos ventanas
  probadas, reproduce el `12` ni el `26`.** Lo más cerca: `col U` del 31/07 da 11 sobre 24–30/07.
- ⚠ **Por eso el `18` tampoco es «los envíos del deck».** `col A` distinta da 18 en los dos exports
  —es una cantidad estable— pero el deck dice 26. **Que dos números tengan el tamaño correcto no
  los hace el mismo número**, y eso fue exactamente el error de la primera versión de esta entrada.

⛔ **`m2_campanias` no se cablea, y ahora por un motivo más fuerte que «falta la columna»:** la
columna candidata **cambia de significado entre exports**, así que cablearla ataría el token a una
convención que la base no garantiza. Publicaría un número correcto el día que se mida y falso el
mes siguiente, sin avisar.

⛔ **`m2_envios` tampoco se toca todavía.** La idea de pasarlo de `CONTEO` a `CUENTA_DISTINTOS`
salió de creer que el deck decía 18; el deck dice 26. **La operación nueva existe y es correcta; lo
que no hay es evidencia de que `m2_envios` esté mal.** Sin el número real del deck reproducido,
cambiar la operación sería mover un número hacia otro que tampoco es el publicado.

**Quién lo destraba:** el equipo. Dos preguntas concretas, y la segunda es la que importa:

1. ¿Qué es una «campaña» de M2 a nivel de la lámina — el proyecto, como estaba `col U` el 31/07?
2. ⭐ **¿`Nombre campaña | Cuentas` va a volver al grano de proyecto, o el cambio del 06/08 es la
   convención nueva?** Sin esa respuesta, cualquier cableado sobre esa columna es provisorio, y
   conviene saberlo antes y no cuando el número cambie solo.

---

## La expansión de secciones repetibles no es idempotente, y sobre un deck reusado **duplica al cuadrado** — 20/08/2026

**Medido leyendo el código, no corriendo nada** (`2026-08-20_10` Parte 0). ⚠ **No es un bug de hoy:
es la precondición que bloquea la corrida desatendida.** Hoy toda corrida hace `makeCopy` de la
plantilla, así que siempre arranca con las láminas modelo intactas y esto no se puede disparar.

### El mecanismo, en tres líneas de `Generador.gs`

`slidesModeloDe_` decide qué es una «lámina modelo» con un solo criterio: **que lleve algún token
crudo de la familia** (`RE_TOKEN_` sobre `{{…}}`). Después, `duplicarBloquesRepetibles_`:

```
1. por cada ítem, duplica cada modelo          -> copias
2. modelosSlides.forEach(m => m.remove())      -> los modelos DESAPARECEN
3. mueve las copias a su lugar
```

**El paso 2 es el que rompe la reanudación.** En la ejecución siguiente ya no hay láminas modelo —
se borraron— y **las copias que quedaron sin pintar todavía tienen sus tokens crudos**. Para
`slidesModeloDe_` son indistinguibles de un modelo.

### Por qué es cuadrático y no «el doble»

Una sección con **N ítems**, cortada después de expandir y antes de pintar:

| ejecución | láminas con crudos al empezar | qué hace | resultado |
|---|---|---|---|
| 1 | 1 modelo | 1 × N ítems | **N** copias, el modelo borrado |
| 2 | **N** (las copias sin pintar) | **N × N ítems** | **N²** láminas |

Con 2 encuentros: 2 → 4. Con 4: 4 → **16**. Y cada ronda vuelve a multiplicar.

⚠ **El caso mixto es peor de leer, no mejor:** si la ejecución 1 alcanzó a pintar algunas copias,
ésas pierden sus crudos y **dejan de ser detectadas**. La ejecución 2 expande sólo las que quedaron
crudas, así que el deck termina con **unas láminas correctas y otras multiplicadas**, sin ningún
patrón que lo delate a simple vista.

### Qué NO alcanza para arreglarlo

⛔ **La idempotencia de `replaceAllText` no ayuda acá**, y conviene decirlo porque es la respuesta
intuitiva: es cierta —un token ya reemplazado no se encuentra— y **cubre el pintado, no la
expansión**. Son dos operaciones distintas sobre el mismo deck y sólo una es segura de repetir.

⛔ **Tampoco alcanza con marcar la sección como `hecha` en el plan.** Una ejecución puede morir
**entre** el `duplicate()` y el `remove()`, o entre el `remove()` y el marcado. El plan diría
`pendiente` sobre un deck ya expandido.

### Las tres salidas, para que quien decida las tenga a la vista

1. ⭐ **Separar expansión de pintado en el plan**, con dos estados por sección —`expandida` y
   `pintada`— y **marcar `expandida` inmediatamente después del `remove()`**. La ventana de riesgo
   se reduce a una escritura de celda. Es la más barata y la que menos toca el motor.
2. **Que la reanudación no vuelva a expandir nunca**: leer las asignaciones de la ejecución 1
   —`objectIdSlide` por ítem, que ya se calculan y hoy mueren con la ejecución— desde el estado
   caro de la Parte C. Es lo más correcto y **depende de que la Parte C exista primero**.
3. **Que `slidesModeloDe_` distinga un modelo de una copia.** Hoy no puede: el criterio es el token
   crudo y nada más. Habría que marcar las copias —`speakerNotes`, un token testigo— y eso **toca
   el área que el sellado del `_11` usa**, así que arrastra otra decisión.

**Quién lo destraba:** el usuario, eligiendo una. **La 1 y la 2 no compiten** — la 1 acota el daño
y la 2 lo elimina; hacer las dos es coherente.

⚠ **Y la razón por la que esto va acá y no en un prompt:** el `2026-08-20_10` lo pide resolver en su
Parte A —*«medirlo y resolverlo acá, o el mecanismo publica un deck peor que el cortado»*— pero ese
prompt **está bloqueado por otra cosa** (el costo de arranque del `_9`, que no existe). El hallazgo
no depende de ese bloqueo y no tiene por qué esperarlo.

---

## La corrida del 20/08 15:45: línea de base del corte, y por qué no hay desglose que leer — 20/08/2026

**Evidencia fechada.** Es contra estos seis números que se compara la próxima corrida.

```
corte        el próximo ítem se estimó en 27 s y quedaban 7 s sobre la reserva
presupuesto  techo 350 s · reserva 30 s · gastado 321 s
barrida      264 tokens · origen: mapa de la etapa 2
```

| en el deck | cuántos |
|---|---|
| `/////` | **269** — y **264 son del corte**, no de falta de cableado |
| `---` | 0 |
| `-` | 12 |
| entre guiones | 3 |
| números limpios | **9** |
| `{{token}}` crudos | **49** — láminas 12, 21 y 29 |

**321 s para 22 valores impresos son ~15 s por valor**, y eso no es un problema de cableado.

### ⛔ Por qué la Parte B no se pudo hacer: cada corrida borra su propio desglose

`marcarEtapa_` escribe las cinco marcas en la columna **`faltantes`** de `CORRIDAS` —que hace de
campo de estado (`T2.1.2`)— acumulándolas, para que la fila diga *el recorrido y no un punto*
(`T2.7`). **Pero el cierre la pisa:** `escribirCorrida_` reescribe la fila entera y esa celda pasa
a valer `avisosDeLaFila_(...)`, que devuelve el conteo y las advertencias **y no conserva nada del
rastro**.

⚠ **Consecuencia: mientras la corrida vive, la celda tiene el desglose; en cuanto cierra, un
número.** La corrida de las 15:45 cerró —hizo la barrida y escribió el reporte—, así que **su
desglose ya no existe.**

Es la familia que `CLAUDE.md` §4 persigue —*un instrumento que mide un cambio no puede depender de
lo que el cambio modifica*— en su versión más literal: el instrumento depende de una celda que el
cierre reescribe.

**Arreglado el 20/08** (`2026-08-20_9`): `RASTRO_ETAPAS_` acumula en memoria y el cierre lo
antepone. **La próxima corrida deja el desglose escrito, termine o no.**

### Cómo se lee el desglose, cuando esté

⚠ **Las marcas son tiempos de ARRANQUE, no duraciones.** `marcarEtapa_` se llama **antes** de cada
etapa, así que `2 · mapa +Bs` significa *"la etapa 2 empezó a los B segundos"*. La duración de una
etapa es la resta con la siguiente:

```
1 · expandir secciones repetibles  +As     <- arranque; A es casi 0
2 · mapa token→objectId           +Bs     <- B − A  = LA EXPANSIÓN ENTERA
3 · pasada por ítem               +Cs     <- C − B  = el mapa
...
```

⭐ **`B` es el costo fijo de arranque**, y es el número que el `2026-08-20_10` necesita para elegir
el tamaño del chunk. La etapa 1 contiene **todo lo caro**: `duplicarBloquesRepetibles_` llama a
`itemsDeSeccion_`, que llama a `anclarEncuentros` y a `unirDigitalPorCuenta`.

### Los tres candidatos de la Parte B, medidos contra el código

| candidato | veredicto |
|---|---|
| **Lecturas repetidas de la planilla de control** | ⛔ **Descartado, ya está resuelto.** `leerMapeo()` y `leerSolapas()` pasan por `memoRegistro_`, y `generarInforme` enciende el caché con `abrirCacheRegistros_()` en un `try/finally`. El patrón de las ~13.000 lecturas del 04/08 no reapareció |
| **Anclaje recalculado** | ⛔ **Descartado.** `anclarEncuentros` cachea por `desde‖hasta‖origen`, y las dos secciones sobre `REUNIONES` —`encuentro` y `comunicaciones_post`— entran con **la misma `ventanaInforme`**, así que la segunda pega en el caché |
| ⭐ **Escrituras a Slides de a una** | ✅ **CONFIRMADO y es el candidato vivo.** Ocho sitios de `replaceAllText`, **todos individuales**. `appsscript.json` tiene `dependencies` **vacío**: no está declarado el servicio avanzado de Slides, así que **no hay `batchUpdate` posible hoy**. Cada token es un round trip |

⭐ **Y un cuarto que el prompt no listaba, encontrado midiendo:** `Union.gs` hace
**`SpreadsheetApp.flush()` una vez por reunión** dentro del bucle de anclaje, más la escritura de
`ANCLAJE_PENDIENTE`. Cada `flush()` fuerza el volcado de todo lo pendiente. Con 12 reuniones son 12
volcados forzados **dentro de la etapa que concentra el costo fijo**.

⛔ **No se aplicó ninguna optimización, y es deliberado.** El prompt dice *«se ataca lo que la Parte
0 midió, en orden de gasto, y nada más»* — y **sin el desglose no hay orden de gasto**. Optimizar
las escrituras a Slides exige declarar el servicio avanzado, lo que cambia `appsscript.json` y
obliga a re-autorizar; hacerlo a ciegas, antes de saber si el gasto está ahí o en el `flush()` del
anclaje, es exactamente lo que el punto 4 de la Parte C prohíbe.

**Quién lo destraba:** una corrida más. Con el rastro arreglado, deja el desglose escrito y ahí se
elige qué atacar.

### ⚠ Los 49 crudos no son un bug, y tienen consecuencia para la corrida desatendida

`mapaTokenObjectId_` **excluye a propósito los tokens de láminas escondidas** — van a
`tokensEscondidos` y nunca entran a `tokens`. La barrida recorre `mapa.tokens`, así que **nunca los
ve**. Las láminas 12, 21 y 29 están escondidas: sus 49 tokens quedan crudos **en toda corrida, corte
o no**.

Es correcto por diseño —una lámina que no se emite no vale el gasto de pintarla— pero **el
invariante que el motor declara está enunciado de más**: *«ningún `{{token}}` crudo sobrevive a una
corrida»* vale para las láminas **visibles**, no para el deck.

⭐ **Y es una precondición del `2026-08-20_10` que su Parte A no contempla:** ese prompt propone usar
los tokens crudos como checkpoint —*«los que quedan crudos son exactamente lo que falta»*—, y **49
de ellos son crudos permanentes**. Una reanudación que se guíe por los crudos no terminaría nunca.

---

## ⏸ El invariante «ningún `{{token}}` crudo sobrevive a una corrida» es falso hoy — 20/08/2026

**Anotado sin arreglar, por pedido del usuario.** La decisión —barrer las escondidas o reescribir
el invariante— es suya.

> **⏸ SIN NINGUNA PRIORIDAD — decisión del usuario, 21/08/2026.** *Cuando se activen, se ve.* Las
> láminas 12, 21 y 29 están escondidas y sus 49 crudos **no molestan a nadie mientras lo estén**:
> no se emiten, no se publican y no confunden a ningún lector del deck.
>
> **Las dos opciones de abajo quedan escritas y sin elegir**, a propósito — son el trabajo que
> habría que hacer el día que una de esas láminas se active, y borrarlas obligaría a
> redescubrirlas.
>
> ⛔ **Es un diferimiento, no un cierre**: el pendiente **no se tacha ni se archiva**, cambia de
> estado con su fecha y su dueño. **Y no se vuelve sobre esto** — está decidido.
>
> ⚠ **Lo único que SÍ sigue vivo de este bloque, y no es la decisión diferida:** el invariante
> **está enunciado de más** en el comentario del motor, y eso ya se llevó puesta una premisa del
> `2026-08-20_10` —que proponía usar los crudos como checkpoint de reanudación—. **49 crudos
> permanentes hacen que una reanudación guiada por crudos no termine nunca.** Eso es una trampa
> para el próximo que lea el comentario, y no depende de que las láminas se activen.

### Qué dice el motor y qué hace

El comentario de la barrida lo declara sin condiciones:

> *«la barrida final. **Corre siempre, haya habido corte o no**: es lo único que garantiza que el
> deck no salga con `{{token}}` crudos»*

**Y el deck sale con crudos igual, en toda corrida.** Medido sobre la del 20/08 a las 15:45:
**49 `{{token}}` crudos en las láminas 12, 21 y 29** — las tres escondidas.

### Por qué, y no es un bug

`mapaTokenObjectId_` **excluye a propósito** los tokens de láminas escondidas: los junta aparte en
`tokensEscondidos` y **nunca los mete en `tokens`**. La barrida recorre `mapa.tokens`, así que no
los ve. Y está bien que sea así: una lámina que no se emite no vale el gasto de pintarla — es la
misma decisión que `tokensVisiblesDe_` toma para la pasada de tokens fijos.

⚠ **Lo que está mal es el enunciado, no el comportamiento.** El invariante vale para las láminas
**visibles**; el comentario lo declara para el deck.

### Por qué importa, más allá de la prolijidad

⭐ **Una regla que dice una cosa y un motor que hace otra es exactamente el material del que salen
los diagnósticos falsos**, y este caso ya tuvo su primera víctima: el `2026-08-20_10` `v1` proponía
usar los tokens crudos como checkpoint de la reanudación —*«los que quedan crudos son exactamente lo
que falta»*— **y 49 son crudos permanentes**. Una reanudación guiada por los crudos no habría
terminado nunca.

**El `v2` ya lo corrige**: el checkpoint es el plan por secciones, y los crudos sólo garantizan que
repintar es inocuo. Pero la corrección vive en un prompt, no en el motor: **el comentario de la
barrida sigue afirmando lo que no es.**

### Las dos salidas, y ninguna es gratis

1. **Barrer también las escondidas.** El invariante pasa a ser cierto y el deck deja de tener
   crudos. ⚠ Cuesta: son 49 `replaceAllText` más por corrida **sobre láminas que nadie mira**, y
   hoy el gasto es justamente el problema (`D-35`). Y las escondidas dejarían de distinguirse de
   las emitidas al abrir el deck.
2. **Reescribir el invariante** para que diga lo que el motor hace: *ningún `{{token}}` crudo
   sobrevive a una corrida **en las láminas visibles***. Cuesta cero y es lo que ya pasa. ⚠ Pero
   deja el deck con crudos, y quien lo abra sin saber esto va a leerlos como un motor roto — el
   mismo problema que el sello de en-proceso resuelve para el deck cortado.

**Quién lo destraba:** el usuario. ⛔ **Lo que no puede quedar es el estado actual**, donde la regla
promete una cosa y el motor hace otra sin que nada lo diga.

---

## `leerFuente` no cacheaba nada: 304 lecturas completas por corrida — 20/08/2026

**El hallazgo, medido leyendo el código.** `cacheBases_` guarda el **archivo abierto**, pero cada
llamada a `leerFuente` hacía su propio `getDataRange().getValues()` — **una lectura completa de la
solapa**. Y `leerFuente` se llama **una vez por marcador**, no una vez por solapa.

Contado sobre `MARCADORES` al 20/08, para **un** ítem de encuentro:

| base / solapa | marcadores | lecturas completas antes | con caché |
|---|---|---|---|
| `rdv/RVD JM-CM - ES` | 17 | 17 | 1 |
| `reuniones/Agenda JM` | 9 | 9 | 1 |
| `digital/Directa Mail` | 6 | 6 | 1 |
| `digital/Directa IVR` | 5 | 5 | 1 |
| `digital/Alcance` | 1 | 1 | 1 |
| **total por ítem** | **38** | **38** | **5** |

**× 8 encuentros: 304 lecturas completas → 40.** A ~0,65 s cada una, eso explica los 200 s.

### La corrección, y por qué da exactamente las mismas filas

Se cachean **los datos crudos de la hoja**, con clave `base‖hoja`. Todo lo que viene después —fila
de encabezado, las tres guardas de `R-19`, el recorte por ventana— sigue corriendo igual sobre ese
array. **Lo único que se evita es volver a pedirle a Sheets algo que ya está en memoria.**

⚠ **La clave NO lleva la ventana, y eso es correcto y no un atajo:** los datos crudos de una hoja
no dependen de ninguna ventana. `encontrarFilaRdvDeReunion_` **sigue armando su ventana de un día
por reunión** y sigue devolviendo ocho conjuntos distintos de filas — lo que deja de hacer es
releer `rdv` ocho veces. **Usar una ventana común habría cambiado qué filas ve el matcher, y por
eso quedó afuera.**

Apagado por defecto, igual que `cacheRegistros_`. Sólo `generarInforme` lo enciende, con
`try/finally`.

### ⚠ El testigo NO es concluyente sobre el tiempo, y decirlo es parte del resultado

| etapa | `171421` (antes) | `175132` (después) |
|---|---|---|
| expansión | 80 s | 70 s |
| mapa | 16 s | 21 s |
| **pasada por ítem** | **200 s** | **204 s** |
| tokens fijos | 11 s | 7 s |

**Las dos corridas no son comparables ítem a ítem, y el motivo es mío:** el "≈25 s por ítem" que
fundó este prompt salió de dividir 200 s por **8 encuentros**, y ese 8 lo **inferí de la lista
`con_valor`** — no de una medición. La corrida `171421` **no reportó cuántos ítems emitió**, porque
`items_emitidos` sólo aparece cuando hay corte, y ésa no cortó.

La de después sí cortó y sí lo dice: **26 emitidos y 10 sin emitir**. O sea que la pasada por ítem
hizo **el mismo tiempo de pared procesando más ítems** — pero **no se sabe cuántos hacía antes**, así
que el cociente no se puede comparar.

⭐ **Lo único medido igual de los dos lados es el costo del último ítem**, que el corte reporta como
*"lo que costó el anterior"*: **27 s el 20/08 a las 15:45 · 20 s a las 17:51.** Mismo instrumento,
misma definición, dos momentos. Es una señal, no una prueba: entre las dos corridas también cambió
el temario.

**Por eso la evidencia que sostiene el cambio es estructural y no cronométrica:** las 304 lecturas
se cuentan sobre `MARCADORES`, no se estiman. **Que 304 lecturas completas de solapa pasen a 40 no
depende de ninguna corrida.**

### Lo que queda sin medir, y cómo se mediría bien

⛔ **No hay un A/B limpio del caché**, porque no se puede apagar sin editar código y las dos corridas
disponibles tienen composición de ítems distinta. El testigo correcto sería **dos corridas seguidas
sobre el mismo temario, una con el caché apagado**, y eso hoy exige un `clasp push` en el medio —
que es exactamente lo que el proyecto no acepta como testigo.

**Lo accionable si alguna vez importa:** que el caché se pueda apagar desde `CONFIG`, como el
presupuesto. Entonces el A/B es dos corridas y ninguna edición.

### El `flush()` del anclaje: medido y NO tocado

Está en `Union.gs`, una vez por reunión, **justo después del `Logger.log`** — y su docstring lo
declara: *«Deja rastro mientras corre (Logger + `SpreadsheetApp.flush()` por reunión)»*. **Es un
diagnóstico deliberado, no un descuido**, y vive en la fase de expansión (70–80 s), no en los 200 s
de la pasada por ítem. Sacarlo sería perder el rastro en vivo de la etapa más larga, que es
justamente donde hace falta.

### `batchUpdate`: reportado con el número al lado, y afuera

Las 8 escrituras a Slides son individuales y `appsscript.json` tiene `dependencies` **vacío**:
juntarlas exige **declarar el servicio avanzado de Slides y re-autorizar**. Eso es un costo
operativo del usuario y **queda fuera de este prompt por decisión escrita**. El número para
decidir: la etapa de **tokens fijos cuesta 7–11 s** sobre ~270 tokens, así que el pintado **no es
el gasto principal** — el gasto está en leer, y eso ya se atacó.

---

## El verificador del alcance no verificó ni una base y dio veredicto igual — 20/08/2026

**Encontrado por el usuario** leyendo la corrida de las 18:50: el bloque de bases de
`verificarAlcanceDesatendido()` **no imprimió ni una línea** —ni `ok` ni `FALLA`— y la función
reportó como único problema el de triggers, o sea que **emitió un diagnóstico sin haber medido lo
más importante que dice medir**.

### La causa, medida — y es literal la que `CLAUDE.md` §4 documenta

`leerRegistro_` (`Config.gs:402`) hace `obj.activo = esVerdadero_(obj.activo)`: **`activo` es un
booleano real**, no el texto de la celda. El filtro escrito en el verificador era

```js
if (String(b.activo || '').trim().toLowerCase() !== 'sí') return;
```

y `String(true)` es `'true'`, que **nunca** es `'sí'`. **Descartaba las cinco bases, en silencio.**

⚠ **Los otros seis lectores del repo usan el idioma correcto** —`if (!base.activo || !base.sheet_id)
return;`, en `Auditoria.gs` ×3, `Fechas.gs` ×2 y `Armonizar.gs`—. **El verificador fue el único que
convirtió antes de mirar**, que es exactamente lo que la regla prohíbe: *convertir antes de mirar el
tipo destruye el tipo; un `String(celda)` puesto para «normalizar» disfraza un booleano de texto*.

**El denominador que se perdía:** `BASES` tiene 6 filas, **5 activas con `sheet_id`** —`rdv`,
`digital`, `looker`, `m2`, `reuniones`— y `miba` parqueada. **Se verificaron 0 de 5.**

### Por qué esto es peor que un bug común

⭐ **Un control que no mide lo que dice medir es peor que no tenerlo, porque su verde se cita.** La
función existe para contestar *«¿un trigger llega a las bases?»* antes de confiar en un mecanismo
desatendido. Un `ok` suyo habría autorizado a soltar el mecanismo **sin haber probado nunca lo
único que no se puede probar de otra forma**.

Es la familia que este repo ya persigue —el instrumento que se lee como evidencia— y esta vez
apareció **dentro de un verificador**, que es donde más caro sale.

### La corrección, y la guarda que la sostiene

1. **El filtro usa el idioma del repo**, sin conversión propia.
2. ⭐ **Cero bases verificadas es un PROBLEMA, no un silencio.** El veredicto entra a `problemas` y
   el log nombra **las tres causas posibles** —`BASES` vacía · ninguna con `activo` verdadero ·
   ninguna activa con `sheet_id`—, porque cada una manda a mirar otro lado.
3. **El log dice `n de m`.** Un conteo es lo único que distingue *«todas pasaron»* de *«no se probó
   ninguna»*, y su ausencia es lo que dejó pasar esto.

⚠ **Y el aviso que el verde no cubre, que se conserva:** la función corre **como quien la aprieta**,
y el trigger corre **como el dueño del script**. Si no son la misma cuenta, este verde no dice nada
sobre el alcance real.

---

## `batchUpdate` de Slides: **NO se agrega**, y el número está al lado — 20/08/2026

**El viaje de re-autorización se aprovechó para el scope `script.scriptapp`, que sí hacía falta.**
La pregunta era si convenía meter en el mismo viaje el servicio avanzado de Slides.

**Recomendación: no, y el número la sostiene.**

| etapa de la corrida | costo medido |
|---|---|
| expansión (anclaje + unión digital) | 70–80 s |
| mapa token→objectId | 16–21 s |
| **pasada por ítem** | **200–204 s** |
| ⭐ **tokens fijos — todo el pintado** | **7–11 s** |
| cierre | 3 s |

⭐ **El pintado de ~270 tokens cuesta 7–11 s sobre una corrida de 311.** Aun suponiendo que
`batchUpdate` lo lleve a cero —que no lo hace—, **el techo de la ganancia es el 3 % de la corrida**.
El gasto estaba en **leer**, y eso ya se atacó (`2026-08-20_11`: 304 lecturas completas → 40).

**Lo que costaría:** declarar el servicio avanzado en `appsscript.json`, re-autorizar **otra vez**,
y reescribir los ocho sitios de `replaceAllText` a una API distinta con su propio manejo de errores.

**Si alguna vez cambia:** el número a mirar es el de la etapa `4 · tokens fijos` del rastro de
`CORRIDAS`. **Mientras esté en un dígito de segundos, esto no se toca.** `dependencies` queda vacío.

---

## `jm-20260820-190943` — el estado se marcaba al EXPANDIR, no al resolver — 20/08/2026

**Deck:** `jm-20260820-190943`. **Encontrado por el usuario** mirando el deck y el plan.

**El síntoma:** el deck sigue con `[en proceso]` en el nombre y con **todos** los tokens crudos,
**incluidos los fijos del Resumen Ejecutivo, que no pertenecen a ninguna sección repetible**. La
ejecución 2 no barrió nada.

⭐ **El diagnóstico correcto: no se resolvió NADA.** Se copió la plantilla, se expandió, y se
marcaron las tres secciones `hecha`. **El anclaje sí corrió** —el log ancló las 10 reuniones— y ahí
se fueron los 70–80 s.

### La causa, confirmada contra el código

`generarInforme` devuelve `repetibles: { secciones: expansion.reporte, items: porItem }`
(`Generador.gs`). **Son dos cosas distintas:**

- `expansion.reporte` — el reporte de la **EXPANSIÓN**. Su `ok` significa *«se expandió bien»*.
- `porItem` — la **RESOLUCIÓN**, una entrada por asignación efectivamente pintada.

El marcado leía **el primero**. Y como la Parte A del `_10` separó expandir de resolver
—`solo_secciones` recorta **después** de expandir— **la ejecución 1 expandía las tres secciones,
resolvía cero, y marcaba las tres `hecha`.**

**La huella que lo confirma en la hoja:** tres filas `hecha` en la ejecución 1 **con `segundos`
vacío**, porque el resolver nunca las tocó.

**Y la cascada completa:** con cero pendientes, la ejecución 2 entró por el camino *«no quedan
secciones pendientes»*, declaró la corrida completa, **borró el estado y no tocó el deck** — sin
barrer y sin quitar el sello. Después `cancelarCorridaDesatendida()` a las 19:22 dijo *«no había
ninguna corrida en curso · triggers borrados: 0»*, que era **cierto y ya inútil**.

### ⭐ El requisito nuevo: no hay tiempo humano

**Entre el corte y la continuación pasa un minuto.** Cualquier guarda que dependa de que alguien
mire el plan y cancele **no llega a tiempo**. Eso descarta *«revisar antes de la próxima
ejecución»* como defensa y obliga a que las defensas sean automáticas. Por eso van **las dos**:

1. ⭐ **El invariante `corte ⇒ pendientes ≥ 1`.** Corte significa *«no terminé»* y cero pendientes
   significa *«terminé»*: **las dos a la vez son imposibles**, y esa contradicción es el síntoma de
   que el marcado está mal. Se chequea **en la ejecución 1** (antes de crear el trigger) y **en cada
   continuación**. Roto: no se crea trigger, no se cierra el deck, se reporta.
2. ⭐ **La verificación del cierre.** Quitar el sello no se supone: `cerrarDeckDesatendido_`
   devuelve `sello_quitado`, y si es `false` el log lo dice con todas las letras. **Un sello que se
   pone en un camino y se quita en otro deja decks marcados para siempre**, y entonces el sello deja
   de significar nada.

### Lo corregido

| qué | cómo |
|---|---|
| el marcado | `seccionesResueltas_` cuenta **asignaciones pintadas** (`porItem`), no secciones expandidas. Y **sólo marca las COMPLETAS**: una sección a medio resolver marcada `hecha` deja crudos que nadie va a volver a mirar |
| el cierre | `cerrarDeckDesatendido_`, **único y usado por los tres caminos** — cierre normal, cancelación y fallo |
| la cancelación | quita el sello y **NO barre**: el deck queda a medio hacer a propósito, y `/////` afirmaría *«nadie lo cableó»* sobre tokens que nadie llegó a mirar |
| el invariante | chequeado en los dos puntos, con el mensaje que nombra la causa |
| el huérfano | `cancelarCorridaDesatendida()` sin corrida en curso **avisa** que si hay un deck con sello, quedó huérfano y hay que quitarlo a mano |

**Control nuevo: `tools/probar-resueltas.js`**, 14 afirmaciones. Su primer bloque **es este caso**:
reporte de expansión con las tres `ok` y cero ítems pintados → ninguna se marca. El control negativo
reintroduce el bug exacto y devuelve *«vinieron 3»*.

⚠ **Y la razón de fondo por la que esto se publicó: no había control que lo atrapara.** El
planificador tenía el suyo; el marcado, ninguno. **La pieza que decide si una unidad de trabajo
está terminada es tan crítica como la que decide cuál tomar**, y sólo una tenía prueba.

### ⛔ Lo que hay que hacer a mano

El deck **`jm-20260820-190943` sigue con el sello puesto** y su corrida ya no existe. **Quitarle
`[en proceso] ` del nombre a mano**, o borrarlo: no publicó nada.

---

## 2026-08-21 · El techo declaraba 150 y la corrida llegó al muro de 360

**Estado:** el mecanismo de corte, corregido y con control (`2026-08-21_1`). **La limpieza a mano
sigue abierta** — ver la lista del final.

### Lo observado

**"Se ha superado el tiempo máximo de ejecución", dos veces**, generando `jm` desde el panel con el
temario del 21/08 cargado. Corrida `jm-20260821-094731`.

⭐ **Y el dato que cambia el diagnóstico entero: `CONFIG.presupuesto_corrida_seg` estaba en 150, no
en 350.** Quedó bajo de la prueba del mecanismo desatendido de la noche anterior. O sea que el motor
tenía que cortar a los 150 s y llegó al muro duro de Apps Script, **360** — **más del doble del
techo declarado**.

**Eso descarta la explicación fácil.** No es *"hay más trabajo del que entra en seis minutos"* —el
temario del 21/08 trae dos campañas nuevas, y ésa era la hipótesis—: es que **el presupuesto no se
respetaba**. Con 210 s de sobregiro sobre el techo, el trabajo extra no explica nada.

### La causa, medida sobre el código

**El reloj se consultaba en exactamente dos sitios**, los dos adentro del bucle de asignaciones:

| etapa | ¿consultaba el reloj? |
|---|---|
| precondiciones + copia de la plantilla | **no** |
| 1 · expandir secciones repetibles (anclaje, unión digital, duplicación) | **no** |
| 2 · mapa token→objectId | **no** |
| 3 · pasada por ítem | sí, antes de cada ítem |
| 4 · tokens fijos | sí, una vez |
| 5 · cierre (barrida, `FALTANTES`, `CORRIDAS`, sello) | **no** |

⭐ **La etapa 1 es la que se pasó, y es la que no podía cortar.** Se lleva el arranque entero
—anclaje ~50 s + unión digital ~27 s, medidos en 70-80 s juntos el 20/08— más una llamada a la API
de Slides por cada duplicación. Con dos campañas nuevas, la sección `campana` tiene **ocho láminas
modelo**, así que cada campaña agrega ocho asignaciones y sus `duplicate()` + `move()`.

⚠ **Y había un segundo agujero, más chico y del mismo tipo: el primer ítem entraba siempre.**
`costoUltimoItemSeg` arrancaba en `0`, así que el control preguntaba *"¿queda algo por encima de la
reserva?"* en vez de *"¿entra un ítem?"*. Con 2 s disponibles el ítem arrancaba igual y costaba ~6.

### Lo que NO era la causa

- **El cronómetro no arrancaba tarde.** `relojDeCorrida_()` se llamaba después de abrir dos cachés
  que sólo asignan `{}`. Se movió igual a la primera línea de `generarInforme` —porque un reloj que
  arranca después del gasto real es una premisa que hay que volver a verificar cada vez— pero **la
  diferencia es de milésimas y no explica nada**.
- **El caché de arranque pega.** `anclarEncuentros` y `unirDigitalPorCuenta` se cachean por ventana
  (`cacheAnclaje_`, `cacheUnionDigital_`), `itemsDeSeccion_` recibe **el mismo objeto `ventana`**
  para las tres secciones y los marcadores por ítem viajan con `opciones.ventana = ventanaInforme`.
  El arranque se paga **una vez por ejecución**. ⚠ El borde que queda: un marcador con `periodo_ref`
  propio genera otra clave de caché y **paga la unión de nuevo, adentro del bucle** — no se midió si
  hay alguno así hoy.
- **El panel no reintenta.** `generar()` en `Panel.html` no tiene reintento: el `withFailureHandler`
  sólo pinta el error. **Las dos ejecuciones fueron dos cosas distintas** — la del panel, y la
  continuación desatendida que arrancó por trigger. Cada una vuelve a pagar el arranque entero y
  **el caché muere con la ejecución**, así que la segunda no heredó nada de la primera.

### ⭐ El techo estaba declarado en dos lugares, y el panel mostraba el equivocado

`Panel.html` tenía `var TECHO_S = 350; // límite duro de una corrida`, **y las dos mitades estaban
mal**: el techo real es `CONFIG.presupuesto_corrida_seg` —que esa mañana valía **150**— y el límite
duro es **360**, de Apps Script, no 350.

**La regla del cronómetro dibujó una escala hasta 350 mientras el motor tenía 150**, así que el
contador pasó el techo real sin ponerse en rojo y siguió hasta el muro pareciendo normal. Es
`CLAUDE.md` §2 en su forma más literal —un valor de negocio escrito en el código— con el agravante
de que **el lugar equivocado era justo el que la persona mira**.

### Lo corregido

| qué | cómo |
|---|---|
| el control por etapa | `controlDeEtapa_(reloj, etapa, estimado, clase)` — un punto de control antes de cada etapa declarada en `ETAPAS_CON_CONTROL_`, no sólo entre asignaciones |
| dentro del arranque | dos controles en `duplicarBloquesRepetibles_`: uno **después de la primera lectura** (el arranque ya se pagó; la única decisión posible es no seguir) y uno **antes de cada sección siguiente**, contra lo que costó la anterior |
| la clase del corte | `arranque_no_entra` vs `presupuesto`. *"El arranque no entra en el techo"* manda a subir el techo o partirlo; *"me quedé sin presupuesto"* manda a correr de nuevo. **Son dos arreglos distintos** y el reporte los nombra distinto |
| el primer ítem gratis | la semilla sale de `CONFIG.costo_item_seg` (6 s medidos). La observación de la corrida la sigue pisando |
| el cierre | **se mide** (`presupuesto.cierre_seg`) y `avisoDeReserva_` avisa si no entra en `reserva_cierre_seg`, con el valor que habría que poner |
| el techo del panel | sale de `panel_getEstado().reloj`, de `CONFIG`. `MURO_S = 360` es lo único que queda como constante, porque no lo elige nadie de este proyecto |
| el cronómetro | arranca en la primera línea de `generarInforme` y baja por parámetro |

**El cierre no lleva punto de control, y es deliberado:** barrida, `FALTANTES`, `CORRIDAS` y sello
**tienen que correr siempre**, cortada la corrida o no. Lo que lo protege no es un control sino la
reserva — por eso se mide en vez de controlarse.

**Controles nuevos:** `verificarRelojDeEtapas()` en `Pruebas.gs` (4 pruebas) y
`tools/probar-reloj-etapas.js` (17 afirmaciones, corre la etapa 1 de verdad con `Date` reemplazado).
**La rotura a propósito está automatizada**: el banco saca del fuente la llamada de control de la
etapa 2 y verifica que la afirmación caiga **nombrando esa etapa**.

### ⛔ Lo que hay que limpiar a mano, y qué hay que mirar antes

**Tres decks para borrar. Ninguno publicó nada:**

- `jm-20260820-190943` — el del sello permanente, ya anotado arriba.
- Los **dos de la mañana del 21/08**, los dos con `[en proceso] ` en el nombre.

**Y cuatro cosas que hay que mirar en la planilla, porque una corrida que muere en el muro no
escribe nada** —ni cierra su fila, ni barre, ni quita el sello—:

1. ⭐ **`CONFIG.presupuesto_corrida_seg`.** Si sigue en `150`, subirlo. **Es el primer paso y sin él
   todo lo demás sobra**: con el techo en 150 el motor ahora **corta bien**, y va a cortar siempre.
2. **`CORRIDAS`** — la fila de `jm-20260821-094731` quedó abierta, con `deck_id` y sin
   `fecha_generacion`. ⭐ **Su columna `faltantes` tiene el rastro de etapas con los segundos de cada
   una** (`marcarEtapa_` escribe con `flush()` por etapa, así que **sobrevive al muro**). Es la única
   medición directa de dónde se fue el tiempo del 21/08 y conviene copiarla antes de tocar la fila.
3. **`PLAN_CORRIDA`** — filas de `jm-20260821-094731` sin cerrar.
4. **Triggers huérfanos** — `correrUnaEjecucion_` borra el trigger que la disparó **antes** de
   generar, así que la ejecución que murió en el muro no debería haber dejado ninguno. Verificar
   igual con `cancelarCorridaDesatendida()`, que además borra el estado en `PropertiesService`.

⚠ **Y hay un estado en `PropertiesService` que probablemente quedó vivo:** la ejecución desatendida
murió **antes** de `guardarEstadoCorrida_`, así que `corrida_desatendida` conserva lo de la corrida
muerta. Mientras esté, `iniciarCorridaDesatendida_` **se niega a arrancar otra**.
`cancelarCorridaDesatendida()` lo limpia.

---

## 2026-08-21 · ~~⛔ `generarInforme` tira una excepción al continuar un deck~~ — CERRADO

**Estado:** ✅ **CERRADO el 21/08/2026** por el `2026-08-21_2`. Se deja la descripción entera porque
el modo de falla es lo que vale, no el arreglo — que es de una línea.

**El arreglo:** `nombre`, `url` y `dueno` salen de **un solo `DriveApp.getFileById(deckId)`**, y
`deckId` existe en los dos caminos. ⭐ **Y corrige de paso un error silencioso del camino que SÍ
andába:** el cierre le quita el sello de en-proceso **antes** del retorno, así que `copia.getName()`
devolvía el nombre **con** sello. Nadie lo había notado porque el nombre del retorno sólo se mira en
el reporte.

**El barrido de la misma clase de bug** —toda variable asignada en una sola rama y leída después—
dio **una sola**: `copia`. Las otras dos `var` sin inicializar de la función (`carpeta`, `deckId`) no
se desreferencian, y la única desreferencia que le queda a `copia` —`deckId = copia.getId()`— está
adentro de la rama que la asigna. **El cero se escribe igual**: un cero que nadie buscó no se
distingue de «no miré».

**El control:** `tools/probar-continuacion-deck.js`, 22 afirmaciones, con la rotura a propósito
adentro. ⚠ **Y una lección del propio control, que vale más que el arreglo:** su primer intento
pasó **seis afirmaciones sobre un recorrido que murió en la etapa 2** por un stub de menos —
`generarInforme` atrapa las excepciones a propósito y devuelve `ok: true` con el `fallo` adentro.
Afirmar `fallo === null` además de `ok === true` es lo que hace que las otras signifiquen algo. La
regla quedó en `CLAUDE.md` §4.

---

### La descripción original, del 21/08 a la mañana

`generarInformeConCache_` arma su valor de retorno con:

```js
deck: { id: deckId, nombre: copia.getName(), url: copia.getUrl(), dueno: dueno },
```

**`copia` sólo se asigna en la rama que copia la plantilla.** Cuando se continúa un deck
(`opciones.deck_id`), la rama `else` no corre y `copia` queda `undefined` — `copia.getName()` tira
`TypeError`, **fuera del `try/catch`** que protege las etapas.

**Por qué no se vio hasta hoy:** la única corrida desatendida real —`jm-20260820-190943`— nunca
entró a ese camino. Su ejecución 2 salió por *«no quedan secciones pendientes»*, que **devuelve
antes de llamar a `generarInforme`**. La rama que continúa de verdad no se ejecutó nunca.

**Qué pasa si se ejecuta:** el cierre ya corrió —`CORRIDAS` cerrada, sello quitado— y **después**
tira. `correrUnaEjecucion_` no lo atrapa: no marca secciones `hecha`, no guarda el estado, no crea
el trigger siguiente. **La corrida se detiene con el plan a medias y el estado viejo en
`PropertiesService`.**

**El arreglo es de una línea** —resolver el archivo por `deckId` en vez de por `copia`— pero
necesita su propio prompt: toca el camino de reanudación y hay que verificar qué más asume `copia`.
*(Ese prompt fue el `2026-08-21_2`, corrido el mismo día. Ver arriba.)*

⚠ **Y es la familia del comentario que afirma un contrato** (`CLAUDE.md` §4): nada compara una rama
contra la otra, y las dos compilan.

---

## 2026-08-21 · Seis inconsistencias abiertas, medidas por el `_3` y el `_4` Parte 0

**Estado:** las seis ABIERTAS. Ninguna se tocó — los dos prompts son diagnóstico y declaran parar.
La medición completa está en `docs/BITACORA.md`, entradas del 21/08.

### 1 · ~~⛔ Una lámina de la plantilla de `jm` no está en el registro~~ — ✅ CERRADA (21/08)

> **El usuario selló la plantilla el 21/08 y la lámina tomó `L-053`.** `verificarLaminas()` cierra:
> **53 láminas, 53 filas, 53 anclas, ninguna sin ancla.** Y desde el `2026-08-21_11` la lámina
> **pertenece**: `seccion_id = encuentro`, `filtro = tipo=Uno a uno`, `rol = motor`.
>
> ⚠ **Pertenecer no es publicar** — ver la inconsistencia 2, que sigue abierta.

**La descripción original:**

`verificarLaminas()`: **53 láminas en las plantillas contra 52 filas en `LAMINAS` y 52 anclas.** La
lámina de **`jm` posición 8 no tiene ancla ni fila** — el sellado no la alcanzó. Es **la del 1 a 1**:
36 tokens, 32 `u1_` y 4 `ecv_`.

**Qué la destraba:** volver a correr el sellador para que tome `L-053`. ⚠ **Y hay que hacerlo antes
que cualquier trabajo sobre `LAMINAS.seccion_id`**: no se le puede llenar una columna a una fila que
no existe.

⚠ **El instrumento ya lo decía y nadie lo había corrido.** `verificarLaminas()` existe, es sólo
lectura, y reporta esto en su primera pantalla. **Un control que nadie corre no protege nada.**

### 2 · ⛔ Los 32 tokens `u1_` no tienen fila en `MARCADORES` — SIGUE ABIERTA, y ahora es lo único que falta

> **Revisada contra el `2026-08-21_11` (21/08).** Las otras dos causas se cerraron: la lámina está
> sellada (inconsistencia 1) y **pertenece** a `encuentro` con su condición. **Ésta es la tercera y
> no la tocó nadie.**
>
> ⭐ **Y lo que cambió a favor: el trabajo ya no está bloqueado.** El `2026-08-21_7` mapeó
> `digital/CAMPAÑAS_DESGLOCE_DIGITAL` —18 filas, con las claves `Id cuentas` y `Plataforma`— y
> `R-28` fijó qué suma cada `u1_total_*`. **Falta escribir las filas de `MARCADORES`**, con dos
> huecos declarados: de dónde sale el alcance, y los seis `u1_bench_*` (sin prioridad).
>
> ⚠ **El síntoma visible cambia con este paso**: hasta ayer la lámina no salía; ahora **sale una vez
> por cada encuentro de tipo `Uno a uno`, con sus 32 tokens en hueco.** Es correcto y es más
> ruidoso — conviene saberlo antes de leerlo como una regresión.

**La descripción original:**

Los prefijos cableados son `enc_ ecv_ gcba_ camp_ m2_ ivr_ mail_ imp_ pauta_ frecuencia`. **`u1_` no
existe.** `diagTokensDeLamina_("jm", 8)` da `con_fila 2 · sin_fila 34`.

⚠ **Es una causa independiente de la 1 y de la 3**, y por eso van juntas acá: sellar la lámina y
declararle sección **no la hace publicar nada**. Son tres trabajos en fila — sellar, declarar,
cablear— y hacer uno solo mueve el síntoma sin resolverlo.

### 3 · ~~⚠ `orden_plantilla` usado como clave de mapa~~ — ✅ CERRADA por el `2026-08-21_6`

> **Cerrada el 21/08.** El mapa se indexa por `lamina_id` y la identidad de la lámina del deck sale
> de su ancla. Una lámina **sin** ancla ya no se resuelve por posición — antes se le asignaba el
> `itera_sobre` de otra —: se cuenta aparte y el resumen la nombra. Control:
> `tools/probar-lamina-por-id.js`, que reproduce la colisión **sobre el snapshot vivo**: indexar por
> orden deja 22 claves para 23 láminas de `jm`, por id quedan las 23.
>
> ⚠ **Lo que NO se tocó, a propósito:** el `orden_plantilla` de las 17 filas viejas. Es reportado, y
> estar viejo es inofensivo justamente porque ya nadie decide por él.

**La descripción original:**

`Auditoria.gs:3296` — `iteran[String(l.orden_plantilla)] = l.itera_sobre`. **Con dos láminas del
mismo `orden_plantilla`, una pisa a la otra en silencio.**

**Hoy no se dispara** sólo porque `itera_sobre` está vacío en las 52 filas, así que el `if` nunca
entra. **Es un bug latente que se activa con la primera fila que declare `itera_sobre`.**

⚠ Y contradice al seed, que lo dice con todas las letras: *"`orden_plantilla` es reportado, NUNCA
autoritativo. **Nada del motor puede decidir en base a ese número**"*. **El generador cumple; la
auditoría no.**

**Lo que NO es un problema:** `L-052` con `orden_plantilla = 6` conviviendo con `L-035`. Es el caso
de uso para el que el `lamina_id` existe (decisión del usuario, 21/08) y la medición lo confirma:
`L-052` **está** en la posición 6 y `L-035` corrió a la 7.

### 4 · ⚠ `REUNIONES.mostrar` vacío deja el período sin encuentros, y nada lo avisa al generar

`leerReuniones_` filtra `esVerdadero_(mostrar)`. Con las dos filas de `agosto_14_20` en blanco,
devuelve **12 filas y ninguna del período vigente**, así que `encuentro` y `comunicaciones_post`
emiten **0 ítems** y sus bloques modelo salen crudos.

**No es un bug del cargador:** `cargarTemarioReuniones_` deja `mostrar=''` a propósito —"la persona
confirma"— y lo avisa **al cargar**. ⚠ **Lo que falta es el aviso del otro lado**: al generar, una
sección repetible con cero ítems se reporta como *"sin ítems — el bloque modelo queda como está"*,
que se lee como *"no había nada"* y no como *"faltó tildar `mostrar`"*. **Son dos causas con el mismo
texto.**

### 5 · ~~⚠ Dos de los cuatro llamadores no pasan el modo de símbolos~~ — ✅ CERRADA por el `2026-08-21_5`

> **Cerrada el 21/08.** El default vive en `CONFIG.presentacion_faltantes_defecto` y lo resuelve un
> solo lector, `modoFaltantesDe_`. Un llamador que no pasa la opción recibe el default; uno que la
> pasa gana igual, en los dos sentidos.
>
> ⚠ **La guarda del `=== true` se conservó y se amplió:** `"false"` de query string sigue dando
> crudo, y `"true"` ahora da símbolos — antes daba lo contrario de lo pedido. Lo que faltaba no era
> aflojar la guarda sino **distinguir «no vino» de «vino en false»**, y eso es el tercer estado
> (`null`) de `normalizarModoFaltantes_`.
>
> Y el resultado dice **de dónde salió** el modo, no sólo cuál fue. Control:
> `tools/probar-modo-faltantes.js`, 24 afirmaciones.

**La descripción original:**

`conSimbolos = opciones.faltantes_como_raya === true`, y `undefined === true` es `false`.

| llamador | pasa la opción | modo |
|---|---|---|
| `panel_generar` | sí | símbolos |
| `menuGenerarInformeCompleto_` | **no** | **crudo** |
| `iniciarCorridaDesatendida_` (ejec. 1) | **no** | **crudo** |
| `correrUnaEjecucion_` (ejec. ≥2) | sí | símbolos |

⚠ **El caso peor es la desatendida: ejecución 1 en crudo y las continuaciones en símbolos, sobre el
mismo deck.** El default no se invirtió y el panel está bien; lo que falta es que el default viva en
un solo lugar en vez de en cada llamador.

### 6 · ~~⚠ El seed de `LAMINAS` y la Parte A del `2026-08-21_4` dicen lo contrario~~ — ✅ CERRADA (21/08)

> **La resolvió `D-37`, y no por decreto sino con el número que faltaba.** La Parte A.1 decía que
> `seccion_id` vacío significa *no se expande ni se resuelve*; medido, **eso dejaba sin publicar 29
> de las 53 láminas**, portadas incluidas. La salida no fue elegir uno de los dos textos: fue
> **declarar las 53** y recién entonces darle a la celda vacía el significado de la A.1.
>
> ⚠ **La corrección es sólo sobre `seccion_id`.** `modo`, `itera_sobre` y `filtro` **siguen
> heredando**, y el comentario del seed quedó reescrito para decir exactamente eso.

**La descripción original:**

El seed: *"`seccion_id`, `modo`, `itera_sobre` y `filtro` vacíos significan **hereda de
`SECCIONES`**, no «sin declarar»"* (`PLAN.md` §2).

La Parte A.1 del `_4`: *"una lámina sin fila o sin `seccion_id` **no se expande ni se resuelve**"*.
Con las 52 filas vacías eso deja **el deck entero en blanco**. La A.3 del mismo prompt dice lo
contrario —avisa y usa la inferencia de hoy— y **el seed le da la razón a la A.3**.

**Hay que decidir qué significa la celda vacía antes de escribir código**, y la decisión es del
usuario: hoy está declarada como *hereda*.

---

### ✅ Lo que quedó descartado, y conviene que quede escrito

- **No hubo regresión de código entre el 20 y el 21/08.** `MARCADORES` es **idéntica celda por
  celda** (87 filas, 0 cambios en las 11 columnas comparadas), y `SECCIONES`, `SOLAPAS`, `MAPEO`,
  `BASES`, `INFORMES` y `LAMINAS` también. Lo que cambió es dato: `REUNIONES`, `CAMPANAS`,
  `PERIODOS` y `CONFIG`.
- **El `_7` no está aplicado.** Las 87 filas tienen `informe_id = jm`, **ninguna pasó a `*`**, y hay
  **3** filas `_revisar`, no 32. **No hay testigo que citar porque no hay migración que testificar.**
- **Los 49 `{{token}}` crudos no son nuevos:** son los *49 crudos permanentes* de las láminas
  escondidas 12, 21 y 29.
- **Ninguna corrida reciente pintó los tokens fijos**, ni siquiera la que se recuerda como buena:
  `171421`, `172003`, `175132` y `114540` **cortaron las cuatro en la etapa 4**.

### ⛔ Evidencia que no se puede perder

- **El deck de `171421`** (`1iPQcoQY11lVhxM-P16R-8iVp5xS1D6YrfDELuU3XRDw`) es **el único testigo que
  queda** de qué publicaba el motor el 20/08: `FALTANTES` se pisa en cada corrida (`D-12`) y
  `con_valor` muere con la ejecución. **No borrarlo.**
- **`jm-20260821-100211` nunca cerró** (la que quedó abierta; `094731` sí cerró, contra lo que se
  documentó a la mañana). Hubo **cuatro** corridas el 21/08, no dos.

---

## 2026-08-21 · ⚠ Auditoría de la memoria: tres afirmaciones mías sobre los `u1_` estaban mal

**Pedido del usuario, 21/08: *"audita la memoria, mucho de esto ya estaba"*. Tenía razón.** Lo que
sigue corrige lo que este mismo documento afirmó horas antes en el bloque `D5`.

### Lo que ya estaba escrito, y yo no busqué antes de afirmar

| ya estaba | dónde | desde |
|---|---|---|
| ⭐ **La solapa fuente de los `u1_*` es `digital/CAMPAÑAS_DESGLOCE_DIGITAL`** | `PLAN.md` `D-32` y este documento, entrada del 14/08 | **14/08/2026** |
| Que esa decisión es **del usuario** y que el sembrador la revirtió una vez | ídem — `D-32` existe **por** ese incidente | 14/08 |
| **Seis valores ya validados como `exacto`** contra esa solapa | `docs/casos_validacion_2026-08-19.csv`, `V-21` a `V-26` | 19/08 |
| Que `u1_bench_*` **no se sabe de dónde sale** | `CONFIG_INFORMES.md` §2.1, marcado `[?]` | — |
| Que la lámina de `secco` con `u1_bench_*` tiene **tres salidas y ninguna elegida** | `CONFIG_INFORMES.md` §1.9 y `PLAN.md` | — |
| Que el enganche **reunión → sus campañas, pre y post**, *"no se diseñó"* | `BITACORA.md`, 09/08 | 09/08 |
| ⭐ Decisión del usuario: **el temario emite DOS líneas cuando el encuentro tiene pre y post**, no una con `"(pre + post)"` | `BITACORA.md` | — |

### Las tres afirmaciones mías que caen

**1 · ❌ *"`looker/DIGITAL` sólo tiene mapeada `Impresiones`; hay que mapear clics, vistas, ctr,
vtr, alcance y frecuencia."*** — **Base equivocada.** La fuente de los `u1_` no es `looker/DIGITAL`:
es **`digital/CAMPAÑAS_DESGLOCE_DIGITAL`**. Llegué a `looker/DIGITAL` por parecido con `imp_meta` y
`gcba_imp_*` en vez de buscar en los documentos, que es exactamente el error que `CLAUDE.md` §4
describe: *dos cosas que se llaman igual no son la misma cosa*, y un "no está" **sin nombrar el
ámbito en el que se buscó** no lo puede verificar nadie.

**Lo que sí es cierto, y es el hallazgo que queda:** `digital/CAMPAÑAS_DESGLOCE_DIGITAL` está en
`SOLAPAS` con `uso = fuente`, y **no tiene NI UNA fila en `MAPEO`**. Las columnas que los casos de
validación nombran —`Impresiones`, `Clics`, `Visualizaciones`— y las claves `Id cuentas` y
`Plataforma` **no están mapeadas**. Ése es el trabajo real.

**2 · ❌ *"Falta el corte `pre`/`post`, que hoy no es una dimensión declarada en ningún lado."***
— **No es una dimensión y no falta: es `REUNIONES.etapa`, que existe desde siempre.** `pre` y `post`
son **dos filas de temario** con **dos `Id cuentas` distintos**, no un corte sobre una fila.

⚠ **Y la fila cargada hoy contradice una decisión ya tomada.** El temario de `agosto_14_20` tiene
**una** fila con `etapa` **vacía** y el texto `"(pre + post)"`, cuando la decisión del usuario dice
que **el proponedor emite DOS líneas**. Consecuencia medible: `comunicaciones_post` filtra
`etapa=post`, así que **emite cero ítems aunque `mostrar` esté tildado**.

**3 · ❌ *"Falta cómo se restringe al encuentro: `imp_*` corta por ámbito, no por campaña ni por
reunión."*** — **El mecanismo existe y es el que `digital` ya usa.** La clave de los casos
validados es `Id cuentas=3354-JULJDGAG`, y ése es exactamente el `opciones.id_cuenta` que
`itemsDeSeccion_` ya pasa por ítem (`if (e.idCuenta) opciones.id_cuenta = e.idCuenta`). No hay nada
que inventar.

### Lo que de verdad falta para los 32 `u1_`

| grupo | n | estado real |
|---|---|---|
| `u1_pre_*` / `u1_post_*` | 20 | fuente y claves **decididas y validadas**; falta el `MAPEO` de esa solapa y las filas de `MARCADORES` |
| `u1_bench_*` | 6 | ⛔ **pregunta abierta desde antes** (`CONFIG_INFORMES` §2.1): ¿fijos del año o recalculados? |
| `u1_total_*` | 5 | sin declarar: presumiblemente suma de las tres plataformas — **no se asume** |
| `u1_fecha_fin` | 1 | sin declarar |

⚠ **Y una divergencia de nombres que hay que mirar antes de cablear:** los casos validados proponen
`u1_google_impresiones` / `u1_meta_clics`; **la plantilla de hoy tiene `u1_pre_meta_impresiones` y
`u1_post_meta_impresiones`**. La columna del CSV se llama `token_propuesto` — eran propuestas, no
tokens existentes. **Los nombres de la plantilla mandan** (`C-01`), pero la diferencia no es
cosmética: los de la plantilla meten `pre`/`post` **adentro del nombre**, que es el estilo anterior
a `D-33`.

### La lección, que es de método y no de este caso

⭐ **Antes de declarar que algo "falta", greppear los documentos.** `CLAUDE.md` §3 ya lo pide para
las correcciones —*"antes de pedir que se corrija algo en un archivo existente, grepearlo primero"*—
y acá se ve que vale igual para **afirmar una ausencia**. Las tres afirmaciones se escribieron
mirando sólo `MAPEO` y `MARCADORES`, que son el estado, sin mirar `PLAN.md`, `CONFIG_INFORMES.md`
ni los casos de validación, que son la **decisión**. **El estado dice qué hay; los documentos dicen
qué se decidió, y una decisión sin implementar se ve exactamente igual que una decisión que nadie
tomó.**

---

## 2026-08-21 · `u1_total_*` validado contra el deck nuevo — y NO son "la suma de las tres plataformas"

**Pedido del usuario: *"validá el `u1_total` contra el informe nuevo"*.** Hecho enteramente sobre el
fixture `Seguimiento Digital  2026-08-20.zip`, que trae **la base y el deck del mismo día** — el
cruce *definición → número publicado* sin conectarse a nada (`CLAUDE.md` §4). Huella verificada.

⚠ **Esto verifica la DEFINICIÓN DEL NEGOCIO, no el motor.** Ningún `u1_*` está cableado, así que no
hay nada del motor que medir todavía.

### La lámina y la cuenta

**Lámina 5 del deck `Informe semanal JM - (14_08 al 21_08)`**, titulada `Uno a uno en Parque
Avellaneda (12/08)`, con `PRE + POST`, `Resultados parciales` y `Fecha de fin: 24/08`.

**La cuenta es `3487-AGOJDGAG`** y tiene **exactamente cinco filas** en
`CAMPAÑAS_DESGLOCE_DIGITAL`, que son el producto etapa × plataforma:

| etapa | plataforma | campaña | impresiones | visualizaciones | clics |
|---|---|---|---|---|---|
| PRE | DV360 | `Agenda con 1 A 1 - Parque Avellaneda - 12/08` | 86.572 | 0 | 148 |
| PRE | Meta | `Agenda con 1 A 1 - Parque Avellaneda - 12/08` | 65.554 | 0 | 1.324 |
| POST | DV360 | `Agenda Post con 1 A 1 - Parque Avellaneda - 12` | 35.605 | 21.425 | 81 |
| POST | Google ads | `Agenda Post con 1 A 1 - Parque Avellaneda - 12` | 132.310 | 115.968 | 118 |
| POST | Meta | `Agenda Post con 1 A 1 - Parque Avellaneda - 12` | 74.639 | 11.121 | 208 |

⭐ **Confirma lo medido el 21/08: el pre y el post comparten cuenta y plataforma y se separan por el
NOMBRE de la campaña** (`Agenda` contra `Agenda Post`). Y confirma que **`Programmatic` = `DV360`**
en esta solapa.

### El PRE cierra exacto; el POST no, y eso NO es un error

| celda | deck | base (20/08) | |
|---|---|---|---|
| PRE · Meta · impresiones | 65.554 | 65.554 | **=** |
| PRE · Meta · clics | 1.324 | 1.324 | **=** |
| PRE · Programmatic · impresiones | 86.572 | 86.572 | **=** |
| PRE · Programmatic · clics | 148 | 148 | **=** |
| POST · Meta · impresiones | 71.565 | 74.639 | difiere |
| POST · Meta · visualizaciones | 10.609 | 11.121 | difiere |
| POST · Google · impresiones | 126.047 | 132.310 | difiere |
| POST · Google · visualizaciones | 110.364 | 115.968 | difiere |
| POST · Programmatic · impresiones | 28.529 | 35.605 | difiere |
| POST · Programmatic · visualizaciones | 17.170 | 21.425 | difiere |

⭐ **Las diez diferencias caen del mismo lado y por el mismo motivo: el PRE terminó y el POST sigue
corriendo.** El encuentro fue el 12/08 y el propio deck dice `Fecha de fin: 24/08`; el deck se armó
antes del 20/08 y el fixture es del 20/08. **Mismas cinco filas, valores distintos sólo en la etapa
viva** — que es exactamente el criterio de `CLAUDE.md` §4 para distinguir *"se rompió"* de *"la base
se movió"*: **la cuenta de filas, no el valor.**

### ⭐ Y el hallazgo que cambia el cableado: los totales suman UNA etapa, no las dos

| token | publicado | ¿suma de las 5 filas? | qué es en realidad |
|---|---|---|---|
| `u1_total_clics` | **1.472** | ❌ 1.879 (dif 407) | ⭐ **sólo el PRE** — 1.324 + 148. Los 407 clics del POST **no se suman** |
| `u1_total_vistas` | **138.143** | ❌ 148.514 | ⭐ **sólo el POST** — el PRE tiene 0 visualizaciones en la base |
| `u1_total_impresiones` | **377.997** | ❌ 394.680 | PRE + POST — ver la nota de abajo |
| `u1_total_frecuencia` | **6,8** | — | ✅ `impresiones / alcance` = 377.997 / 55.255 = **6,84** |
| `u1_total_alcance` | **55.255** | ⛔ | **no hay columna de alcance en esta solapa** |

**Y es editorialmente coherente, no un capricho:** la lámina rotula el PRE como `CLICS (CTR)` y el
POST como `VISUALIZACIONES (VTR)`. **El PRE se mide por clics —convocatoria— y el POST por vistas
—difusión—.** Sumar las dos etapas en el mismo total sería mezclar dos preguntas.

⚠ **Si se hubiera cableado `u1_total_clics` como "SUMA sobre las tres plataformas" —que es lo que
parecía obvio— habría publicado 1.879 contra 1.472.** Un 28 % de más, plausible y equivocado.

**Dos cabos sueltos, dichos y no resueltos:**

1. **`u1_total_impresiones` difiere en 270 de la suma de las propias celdas del deck** (378.267
   contra 377.997). No es la base moviéndose —esto es el deck contra sí mismo—: el total y el
   desagregado parecen tomados en momentos distintos. **Es del deck de origen, no del motor.**
2. **`u1_total_alcance` necesita otra fuente.** No es la suma de los `ALCANCE` del deck
   (21.401 + 44.296 = 65.697 ≠ 55.255), y tiene sentido: **el alcance son usuarios únicos y no se
   suma.** La solapa `digital/Alcance` ya está mapeada (`alc_alcance`, `alc_frecuencia`) y es el
   candidato — **no se asume**.

### Lo que esto deja listo y lo que no

**Listo para cablear**, con definición medida: `u1_total_clics` (SUMA de clics, etapa PRE),
`u1_total_vistas` (SUMA de visualizaciones, etapa POST), `u1_total_impresiones` (SUMA de las dos
etapas), `u1_fecha_fin` (columna `J`, y el deck publica `24/08`, que coincide).

⛔ **No listo:** `u1_total_alcance` y `u1_total_frecuencia` —dependen de la fuente de alcance— y los
seis `u1_bench_*`.

---

## 2026-08-21 · ⏸ SIN PRIORIDAD — de dónde salen los seis `u1_bench_*`

**Decisión del usuario, 21/08: queda como pendiente sin prioridad.** No bloquea el cableado del
resto de los `u1_*`.

`u1_bench_google_ctr` · `u1_bench_google_vtr` · `u1_bench_meta_ctr` · `u1_bench_meta_vtr` ·
`u1_bench_prog_ctr` · `u1_bench_prog_vtr`.

**La pregunta no es nueva:** está en `docs/CONFIG_INFORMES.md` §2.1 desde antes, marcada `[?]` —
*"`u1_bench_*` (benchmarks de plataforma): ¿de dónde salen? ¿Son fijos del año o se recalculan?"*.

**Lo que se sabe hoy, medido sobre el deck del 20/08 (lámina 5):** los valores publicados son
`Meta CTR 2,1 %` · `Programmatic CTR 1,34 %` para el PRE, y `Meta VTR 6,6 %` · `Google VTR 81,8 %` ·
`Programmatic VTR 70,15 %` para el POST. ⚠ **Ninguno sale de la cuenta del encuentro** — el CTR real
de Meta en el PRE es 2,02 % contra un benchmark de 2,1 %, así que son **números de referencia
externos**, no calculados sobre estas cinco filas.

**Qué lo destraba:** que alguien diga si son fijos del año o se recalculan, y contra qué universo.
Mientras tanto, esos seis tokens publican su hueco y **eso es correcto**.

---

## 2026-08-21 · ⏸ RIESGO ASUMIDO — dos `.pptx` de decks reales quedaron en el historial de git

**Decisión del usuario, 21/08/2026: queda anotado y NO se reescribe historia.** Se escribe acá para
que el día que alguien decida sacarlos no tenga que investigar de nuevo qué son ni qué haría falta.

### Qué son y dónde están

| | |
|---|---|
| **archivos** | `docs/_fixtures/Seguimiento Digital  2026-08-20/Informe semanal JM - (14_08 al 21_08).pptx` y `…/Seguimiento SECCO - SSCDI (21-08) .pptx` |
| **commit** | `7e48725` — *"docs — _4 Parte 0 punto 5: la propuesta de seccion_id…"* |
| **quitados en** | `0338c87` — dejaron de estar rastreados el mismo día |
| **qué son** | los **decks reales publicados** de la semana 14-21/08, los dos informes |

### Cómo pasó, que es lo que hay que no repetir

Un **`git add -A docs/`** los arrastró. El `.gitignore` tenía `*.xlsx` y `*.zip`, que cubre los
exports comprimidos, **pero no un `.zip` ya descomprimido**: el usuario había abierto
`Seguimiento Digital  2026-08-20.zip` minutos antes y la carpeta extraída estaba en disco durante
esa ventana. ⚠ **La regla de `C-21` no falló: falló el patrón que la implementaba.**

**Ya corregido**, en el mismo commit que los quitó: `docs/_fixtures/*` bloqueado entero, con
`!docs/_fixtures/README.md` exceptuado — el README es la tabla de huellas `sha256` y **sí** tiene
que estar versionado.

### ⚠ Lo que sobrevive es el historial, no el árbol

**Hoy `git ls-files docs/_fixtures/` devuelve sólo el `README.md`.** Nadie que clone el repo y mire
el árbol de trabajo los ve. Lo que queda es que **`git show 7e48725` los recupera**, y un
`git clone` se los trae dentro del `.git`.

### Qué haría falta para sacarlos de verdad

1. **Reescribir la historia** — `git filter-repo --path <archivo> --invert-paths` sobre los dos, o
   `git filter-branch` si no está disponible.
2. **`git push --force`** al remoto. ⚠ `CLAUDE.md` §4: el force-push **requiere confirmación
   explícita del usuario pedida en el momento**, y hay que mirar antes qué commits se estarían
   tirando. Este repo se edita desde dos herramientas que no se ven entre sí, así que un
   force-push pisa trabajo que puede no estar a la vista.
3. **Avisar a cualquier clon existente**, que tendría que re-clonar o rebasar.

⭐ **Y el motivo por el que hoy no se hace, dicho para que se pueda revisar la decisión con el mismo
dato:** el costo de reescribir la historia de un repo que es **backup y canal de contexto con la
sesión de claude.ai** es mayor que el riesgo de que dos decks de una semana estén en un repo
privado. **Si el repo dejara de ser privado, la decisión cambia.**

---

## 2026-08-21 · Tres consecuencias de declarar `LAMINAS.seccion_id` — ninguna se arregla acá

**Salen del `2026-08-21_11.2` §6.** Las tres son **dato medido**, no propuestas: se anotan para que
el día que muerdan no haya que descubrirlas.

### 1 · ⏸ `jm` `m2` quedó **no contiguo**, y hoy no importa

Medido por el ancla sobre las plantillas vivas:

```
L-037  pos 10   m2          "Comunicaciones M2 · Alcance semanal"
L-038  pos 11   m2_status   "Directa | Status semanal de M2"
L-039  pos 12   m2          "M2 · Clics · Audiencia"
```

**`m2` reclama la 10 y la 12, con `m2_status` en el medio.**

⭐ **Hoy no rompe nada porque `m2` es `modo = agregado` y no expande** — la guarda de contigüidad
sólo corre para las repetibles. ⚠ **El día que alguien la haga `repetible`, la guarda la frena** con
*"las láminas modelo no son consecutivas"* y la sección **no se expande**, que es el comportamiento
correcto y va a parecer un bug.

**Las dos salidas, para que no haya que pensarlas ahí:** mover `L-039` al lado de `L-037` en la
plantilla —es del equipo—, o declarar las tres en la misma sección. **No se elige acá.**

### 2 · ⏸ `campana` en `secco` emitiría **cero ítems**, y sus ocho láminas saldrían crudas

> ⛔ **Corrección fechada — 29/08/2026 (`2026-08-28_5` B2). La primera oración de abajo está
> vencida, y sólo a medias.** ✅ `CAMPANAS` **sí** tiene la columna `informe_id`, eso sigue siendo
> cierto. ⛔ **Lo que ya no es cierto es que se filtre por ella:** ese filtro **se sacó el
> 18/08/2026** por decisión del usuario —*«la campaña no pertenece a un informe»*—, y `D-19` nunca
> fue el que filtraba por `informe_id`: `D-19` es la regla de **`periodo_id` no vacío**. Los filtros
> vivos de la rama son **`mostrar = sí`**, **`periodo_id` no vacío** y **`SECCIONES.filtro`**.
>
> ⚠ **Y el pendiente NO se cierra con esto: cambia de motivo.** Las ocho láminas de `campana` en
> `secco` seguirían saliendo crudas, pero por **`periodo_id` vacío** y **`mostrar = no`** —las dos
> condiciones que la tabla de acá abajo mide—, no por el ámbito. **El texto original no se edita**;
> ver `R-17` Addendum 2.


`CAMPANAS` **sí** tiene `informe_id` y `D-19` filtra por él. Las tres filas de `secco`, medidas el
21/08:

| `periodo_id` | `campana_id` | `mostrar` |
|---|---|---|
| *(vacío)* | `serv_esenciales` | `no` |
| *(vacío)* | `encuentros_min` | `no` |
| *(vacío)* | `prov_uber` | `no` |

**Fallan las dos condiciones a la vez**: `mostrar ≠ sí` y `periodo_id` vacío, que `D-19` excluye por
separado.

⭐ **Es el mismo síntoma que tenía `encuentro` antes de tildar `mostrar`, por la misma causa y en
otra hoja** — una sección repetible que emite cero ítems y cuyas láminas modelo salen con los tokens
crudos. Se reporta como *"sin ítems — el bloque modelo queda como está"*, que **se lee como «no
había nada» y no como «faltó cargar el dato»**.

⚠ **Es dato del usuario, no del motor.** Se anota para que cuando `secco` se genere no se lea como
una regresión de este cambio.

### 3 · ⏸ `secco` `L-008` lleva `enc_`, `ecv_` **y dos `et_` juntos**

Con `filtro = tipo!=Uno a uno`, esa lámina emite **para todos los encuentros que no sean 1 a 1** —
incluidos los que no son temáticos. **Ahí sus dos `et_` no tienen valor** y salen en hueco.

**No es un error de la condición**: la condición es correcta, porque el iceberg **es genérico**
(`docs/SECCIONES.md` Corrección 5 lo midió sobre informes publicados — aparece con un ECV, no sólo
con el temático). **Lo que está mezclado es la lámina**, que junta el iceberg genérico con dos
tokens específicos del temático.

⛔ **Corregirlo es tocar la plantilla, y la plantilla es del equipo** (`C-01`). Lo que corresponde
acá es **reportar el conteo**: cuántos ítems emiten `L-008` con sus `et_` en hueco.

---

## 2026-08-21 · ⏸ Treinta y tres secciones quedaron sin ninguna lámina declarada

**Sale de la Parte 0 punto 5 del `2026-08-21_11`, medido sobre las 53 láminas de las dos
plantillas.** ⛔ **Ninguna fila se borró** (`D-23` punto 11) y ninguna se arregla acá: *"una sección
sin láminas o sobra o le falta algo"*, y cuál de las dos es se decide por sección.

**De las 36 secciones de la hoja, 21 no reciben ninguna lámina** —más `uno_a_uno_comunas`, que
quedó vacía al mover `L-004` y `L-005`—. Los tres grupos, que se atacan distinto:

### ✅ Las que no son un problema: las ocho hijas de `campana` y las de `encuentro`

`campana_portada`, `campana_objetivo`, `campana_herramientas`, `campana_formatos`,
`campana_agregados`, `campana_desag_digital`, `campana_desag_mail`, `campana_desag_respuestas`,
`campana_audiencia` · `encuentro_portada`, `encuentro_estrategia`, `encuentro_iceberg`,
`encuentro_resultados`.

⭐ **Describen por nombre exactamente las láminas que su padre reclama**, y quedaron vacías **a
propósito**: son `modo = unica`, y asignarles las láminas **las sacaría del bloque repetible y el
padre dejaría de expandirse**. Es el mismo motivo por el que `L-035` va a `encuentro` y no a
`encuentro_iceberg`.

⚠ **Quedan como documentación de la estructura del bloque**, que es un uso legítimo — pero hay que
saber que **no gobiernan nada**, o el día que alguien las edite esperando un efecto no va a pasar
nada.

### ⏸ Las cinco `repetible` que no despiertan, y por qué

`analisis_comparativo` · `analisis_tematico` · `nuevos_proveedores` (las tres `estado = manual`) ·
`campana_audiencia` · `campana_desag_respuestas` (`revisar`).

**La Parte C quitó la exigencia de `familia_tokens` y la reemplazó por «al menos una lámina
declarada».** ⚠ **El filtro de `estado = activa` se conserva**, así que **ninguna de las cinco
despierta** — ni siquiera si alguien les declarara láminas. **Verificado por afirmación** en
`tools/probar-laminas-declaradas.js` bloque 7, no por este párrafo.

**Lo que sí hay que saber:** el día que una pase a `activa` **y** tenga láminas declaradas,
**expande**. Antes hacía falta además `familia_tokens`; ahora no.

### ⛔ Las que sobran o les falta algo, y son las que hay que mirar

`miba` · `impacto_comunicacional` *(tiene dos láminas: `L-027` y `L-028`)* · `otros_temas`
*(tiene `L-026`)* · `aud_formatos` · `aud_directa` · `aud_contacto_ciudadano` ·
`uno_a_uno_comunas` · `analisis_datos` *(tiene dos)*.

⚠ **Las tres `aud_*` son las que más llaman la atención:** describen una audiencia de campaña y
**ninguna lámina de ninguna de las dos plantillas las reclama**. O la plantilla no las contempla —y
entonces son secciones curadas contra un deck que no existe— o hay láminas que nadie clasificó bien.
**No se decide acá.**

⭐ **Y el motivo por el que esto se anota en vez de limpiarse:** una sección sin láminas **ya no
hace nada** desde la Parte C —antes tampoco, pero por otra razón—, así que **no molesta**. Lo que
molesta es no saber cuáles sobran: borrar una que hacía falta cuesta mucho más que dejar diez que no.

---

### P1 · Un `u1_` fuera de una lámina de encuentro publicaría la suma de todas las cuentas, y para `digital` el aviso que lo delataría NO se emite (21/08/2026)

**Abierto.** Nace del `2026-08-21_15` Parte C, y está en `docs/PLAN.md` como addendum al `D-30`.

**El riesgo.** Después de la Parte B, `digital/CAMPAÑAS_DESGLOCE_DIGITAL` es **la primera solapa que
llega a la rama por cuenta declarativa y que además puede emitirse sin ítem**. Un `u1_` colocado
fuera de una lámina de encuentro no falla: cae al agregado y publica **la suma de todas las cuentas
de la solapa**. Es exactamente el modo de falla de siempre — **grande, plausible y equivocada** —, y
es el mismo que produjo los doce encuentros de la lámina 5 (`R-15` addendum 1).

**La contención que se declaró el 19/08 y por qué acá no llega.** Cuando `campo_id_cuenta` dejó de
ser todo-o-nada, se aceptó que el caso sin ítem publicara el agregado **a cambio de un aviso en
`origen`**: *"la solapa declara `campo_id_cuenta = …` y este marcador se emite SIN ítem: se lee como
AGREGADO GLOBAL de todas las cuentas"*. Eso hacía el caso **legible**, que era el trato.

⛔ **Para las solapas de `digital` el aviso no se emite**, y esto salió de un rojo del control de la
Parte B — no se ajustó el fixture. `avisoAgregadoDeclarado` vive en la rama declarativa, y la rama de
`digital` atrapa el caso sin `id_cuenta` **antes**, con su propio `if (!idCuenta)`, devolviendo un
`origen` que dice `agregado global de digital/…` **sin ninguna advertencia**. Así que el número sale
igual de plausible, y **sin nada que lo señale**.

**Por qué no se arregló en el mismo paso.** La regla 3 del prompt decía explícitamente que el
agregado global de `digital` sin `id_cuenta` **no se toca**. Y no es sólo obediencia: hacer ceder
también ese caso cambiaría `recortar_por_ventana`, que decide **qué filas ve el consumidor** — un
valor movido disfrazado de arreglo.

**Qué lo destraba.** Un paso propio que decida una de dos: mover el aviso a un lugar que las dos
ramas atraviesen, o hacer que la rama de `digital` sin `id_cuenta` también ceda, midiendo primero
qué le pasa al recorte por ventana de las cinco solapas de canal.

⚠ **Hoy no está disparado**, y eso es lo que lo mantiene en P1 y no en P0: los 24 `u1_` viven todos
en láminas de la sección `uno_a_uno_comunas`, que itera por encuentro y les da `id_cuenta`. El
riesgo se activa el día que alguien ponga un `u1_` en una lámina fija.

---

### ✅ ~~P3 · Los dos alcances del 1 a 1 (PRE y POST) están cableados a la misma fila y publicarían el mismo número~~ — **RESUELTO 21/08/2026**

**Abierto y sin prioridad, por decisión del usuario (21/08/2026).** Queda escrito para no volver
a preguntarlo.

⚠ **Procedencia, corregida:** nació de un `C.3` que se le agregó al `2026-08-21_15` **después**
de que el prompt corriera. Eso no corresponde —un prompt ejecutado sólo lleva addendum
(`CLAUDE.md` §7)—, así que el `_15` volvió a la versión que corrió y **el prompt de esta entrada
es `docs/Prompts/Addendum_2026-08-21_Paso-15_hueco_alcance.md`**. El contenido no cambia: lo que
sigue es lo que ese addendum pide, **más** la corrección medida de su último bloque.

**El hueco.** El deck publica **dos** alcances distintos para el 1 a 1 —uno PRE y uno POST— y
salen de **filas distintas** (dicho por el usuario, 21/08). Pero `MARCADORES` tiene las dos filas
cableadas idénticas:

| marcador | base/solapa | campo | operación | dimensiones | filtro | formato |
|---|---|---|---|---|---|---|
| `u1_pre_meta_alcance` | `digital/Alcance` | `alc_alcance` | `ULTIMO` | *(vacío)* | *(vacío)* | `miles_revisar` |
| `u1_post_meta_alcance` | `digital/Alcance` | `alc_alcance` | `ULTIMO` | *(vacío)* | *(vacío)* | `miles_revisar` |

**No difieren en nada.** Si resolvieran, publicarían **el mismo número en los dos casilleros**.

**Y no hay con qué separarlas hoy.** `MAPEO` mapea tres columnas de `digital/Alcance` —`A`
`alc_id_cuenta`, `B` `alc_alcance`, `C` `alc_frecuencia`— y **ninguna nombra la campaña ni la
etapa**; `DIMENSIONES_.etapa` sabe expresarse **sólo** sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL`.
Así que el corte no se puede declarar ni por `dimensiones` ni por `filtro` con lo que existe.

**La pista del usuario (21/08), y al verificarla resultó más fuerte de lo que decía.** El alcance
por etapa probablemente **no salga de `digital/Alcance`**: en la base `reuniones` el par pre/post
está separado **por solapa** —`Agenda JM` y `Agenda JM | Post`, las dos `uso = fuente`, medido—.
Es la misma forma que `D-30` punto 1 cita de `C-50`: el par comparte `ID` en dos solapas
distintas, así que la clave es `(ID, solapa)` y **no hace falta ninguna dimensión nueva** — son
dos filas de `MARCADORES` apuntando a dos solapas.

⭐ **Y lo que corrige la pista, medido y no supuesto: el mapeo del par YA EXISTE.** El prompt decía
que ahí *"ya lee `enc_alcance_potencial`"*; eso es el nombre del **token**, no del campo lógico, y
el campo que usa —`alc_potencial`— está mapeado en **una sola** solapa. El que está mapeado en
**las dos** es otro:

| campo lógico | `reuniones/Agenda JM` | `reuniones/Agenda JM \| Post` |
|---|---|---|
| `alc_real` | col `AF` | col `G` ← **el par, ya mapeado** |
| `alc_potencial` | col `AG` | — |
| `alc_cobertura_pct` | col `AH` | — |

`alc_real` está mapeado en las dos solapas y **ningún marcador lo usa todavía** (grepeado sobre
`MARCADORES` viva: el único que toca esa familia es `enc_alcance_potencial`, sobre `alc_potencial`
de `Agenda JM`). O sea que el cableado que cerraría este hueco tendría la infraestructura hecha:
dos filas, misma medida, dos solapas.

**Lo que faltaría si algún día sube de prioridad:** confirmar cuál de los dos campos es el alcance
del 1 a 1 —`alc_real` es el candidato por estar en las dos— y si `Call Center` entra en la cuenta.
⛔ **Code no lo puede medir**: no tiene acceso a las bases. Es una pregunta al equipo o una corrida
del usuario.

⚠ **Hoy los dos tokens salen `-`, y eso es benigno pero no cubre esto.** Las dos filas llevan
`formato = miles_revisar`, así que el día que resuelvan publican `-val-` (`CONFIG_INFORMES.md`
§4.5 bis). Pero **el `-val-` avisa que el número no está validado, no que los dos casilleros
muestren el mismo**. Son dos cosas distintas, y ésta no está cubierta por ningún símbolo: dos
casilleros con el mismo `-val-` se leen como dos mediciones que coincidieron.

---

**Addendum · 21/08/2026 — RESUELTO por el `2026-08-21_18`.** (El texto de arriba no se edita —
`CLAUDE.md` §7. Se deja entero: describe el estado del que se salió y por qué era peligroso.)

**Qué se hizo:** dos celdas de `MARCADORES`, ningún `.gs`, ninguna dimensión y ninguna columna
nueva.

| marcador | antes | ahora |
|---|---|---|
| `u1_pre_meta_alcance` | `digital/Alcance` · `alc_alcance` | **`reuniones/Agenda JM`** · `alc_real` (col `AF`) |
| `u1_post_meta_alcance` | `digital/Alcance` · `alc_alcance` | **`reuniones/Agenda JM \| Post`** · `alc_real` (col `G`) |

**La etapa la separa la solapa**, que es la forma `(ID, solapa)` que `D-30` punto 1 cita de `C-50`.
`dimensiones` sigue vacío **y ahora significa otra cosa**: antes era *"no hay nada que separe"*,
ahora es *"no hace falta"*. `formato = miles_revisar` se conservó — el número sigue sin validar.

⭐ **La pista del usuario era correcta y salió más barata de lo que este pendiente anotaba.** Acá
arriba decía que *"faltaría confirmar qué campo de esas dos solapas es el alcance"*. **El par ya
estaba mapeado**: `alc_real` en las dos, `AF` y `G`, y **ningún marcador lo usaba** — así que el
trabajo no era mapear nada, era **repuntar dos filas**.

⭐ **Y lo que este pendiente no sabía: `R-27` ya lo había verificado celda a celda, desde el
14/08.** `Agenda JM!AF` es `Base_Digital!K`, banda `Alcance Meta Convocatoria`, **San Cristóbal
1.412**; y del lado POST, **Retiro 47.753**. Es evidencia independiente de que `alc_real` es el
campo correcto, y estuvo escrita todo el tiempo en el documento dueño de la pregunta.

**Evidencia:** `MARCADORES_2026-08-21_2225.tsv` (post-escritura), casos `V-103` y `V-104` en
`docs/casos_validacion_2026-08-19.csv`, y el addendum del 21/08 a `R-27`.

⚠ **Lo que NO cierra este addendum, y son tres cosas:**

1. **Que los números sean correctos.** Los casos quedaron en estado **`pendiente`**, no `exacto`:
   un caso `exacto` cita la lámina del deck y **todavía no hubo corrida**. El control es que PRE y
   POST publiquen números **distintos**; si salen iguales, el corte por solapa no funcionó.
2. ⛔ **La tasa de carga de `alc_real`.** La solapa entera es carga a mano —*"0 fórmulas en 44
   columnas × 154 filas"*— y **cuántas filas la traen cargada no está medido**: requiere ver la
   base. Si está mayormente vacía, los tokens publican `-` igual que antes, **pero por el motivo
   correcto**, que es la diferencia entre un cableado que falta y uno que espera dato.
3. **`u1_total_alcance` y `u1_total_frecuencia` siguen entre los ocho `/////`.** Que exista
   `alc_real` **no los resuelve**: da el alcance **por etapa**, no un total sumable — el alcance
   son usuarios únicos y no se suma (`21.401 + 44.296 = 65.697 ≠ 55.255`).

---

### P2 · El cruce que dice si un paso corrió está perdiendo cobertura: 12 pasos con commit y sin bitácora (21/08/2026)

**Anotado, no arreglado.** Sale de la Parte 0 del `2026-08-21_17`, que lo midió sin que se lo
pidieran. Son **dos problemas de distinto tamaño y distinta urgencia**, y por eso van con las
cifras separadas.

**El único cruce válido, y por qué importa que funcione.** Para saber si un prompt se ejecutó, lo
que vale es **el designador de paso contra los encabezados de `docs/BITACORA.md`** — está en
`CLAUDE.md` §3, y la Parte 0 lo **confirmó cobrando el precio**: intentarlo por nombre de archivo
devolvió **113 falsos positivos**, porque los commits nombran el designador (`Paso 2026-08-12_39`)
y no el archivo (`2026-08-12_39_enc_alcance_y_la_rama_que_falta.md`). **No hay otro cruce.**

**Las dos cifras, medidas el 21/08/2026 sobre los 242 archivos de `docs/Prompts/`:**

| cuántos | qué les pasa | tamaño |
|---|---|---|
| **12** | tienen **commit** y **ninguna entrada de `BITACORA.md`** | ⚠ **el problema real** — cinco son de los últimos tres días |
| **89** | no tienen designador que ubique **ni bitácora ni commit** | histórico, casi todo de agosto temprano |

⭐ **El de 12 es el que importa, y no por ser más chico.** Son pasos que **sí corrieron** —hay
commit— y que el cruce **no puede ver**. Cada uno es un agujero en el único instrumento que
responde *"¿esto ya se hizo?"*. Los cinco recientes son `2026-08-20_5`, `2026-08-20_11`,
`2026-08-21_11.1`, `2026-08-21_11.2` y los huecos de `_13`/`_14`.

**El de 89 es otra cosa** y conviene no mezclarlos: son mayormente archivos cuyo nombre **no sigue
la convención `AAAA-MM-DD_N_descripcion`** —los cuatro `Pedido-N`, los `ADDENDUM` en mayúsculas,
los sin número— así que el designador ni siquiera se puede extraer. `CLAUDE.md` §3 ya prevé este
caso: *"ojo con los pasos sin número: se escapan de ese cruce"*, y dice que por eso uno quedó sin
entrada hasta que lo encontró el censo del `DOC-7`. **Ahora hay número.**

⛔ **Lo que este hallazgo NO hace, y es deliberado: no escribe las 12 entradas faltantes ni censa
las 89.** `BITACORA.md` es **append-only y es del usuario**, y **rellenar retroactivamente
entradas que nadie escribió en su momento es inventar historia** — quedarían indistinguibles de
las escritas el día que pasaron, que es justo lo que la bitácora existe para evitar. Lo que hace
falta primero es **decidir qué se hace**, y esa decisión es del usuario.

**Tres salidas posibles, sin elegir:** (a) escribir las 12 entradas faltantes **marcadas como
reconstruidas a posteriori**, con su fecha real de escritura; (b) dejar las 12 y **agregar un
control** que avise cuando un commit de paso no tiene entrada, para que no crezca; (c) aceptar que
el cruce tiene esta cobertura y **decirlo en `CLAUDE.md` §3**, que hoy lo presenta como si fuera
completo.

⚠ **Y el dato que hace urgente decidir algo: la brecha se está abriendo, no cerrando.** Cinco de
los doce son de los últimos **tres días** — el 42 % del problema entero se produjo en el 2 % del
tiempo del proyecto.

### P1 · Elegir el período o dejarlo calcular da la misma ventana y **distinto temario**: seis veces más encuentros, sin que nada falle (21/08/2026)

**Anotado, no arreglado.** Sale de la Parte 0 del `2026-08-21_19` (punto 0.4), que lo midió
buscando otra cosa: verificar que `R-11 (calculado)` y `agosto_14_20` fueran la misma semana. **Lo
son.** Lo que no es lo mismo es qué encuentros entran al deck.

**El mecanismo, en una línea de código.** `anclarEncuentros` recorta `REUNIONES` por `periodo_id`
**sólo si el `origen` de la ventana empieza con `periodo_ref:`** (`Union.gs`, el bloque
`PREFIJO_PERIODO_REF_`). Y el `origen` lo fija qué eslabón de `D-20` resolvió la ventana:

| lo que se manda | `origen` que devuelve `resolverVentana` | ¿filtra `D-19`? |
|---|---|---|
| `agosto_14_20` desde el panel | `periodo_ref:agosto_14_20` (eslabón 1) | **sí** |
| nada, con `CONFIG` vacío | `R-11 (calculado)` (eslabón 5) | **no** |

**Las dos ventanas son idénticas** — medido: `PERIODOS_2026-08-21.tsv` da `agosto_14_20` =
`2026-08-14 → 2026-08-20`, y `ultimaSemanaCerradaR11_` corriendo el viernes 21/08 retrocede al
jueves 20/08 y devuelve **vie 14/08 → jue 20/08**. La misma semana, al día.

**Los universos no.** Medido sobre `REUNIONES_2026-08-21_2225.tsv`: 15 filas, 14 con
`mostrar = sí`, 2 de `tipo = Agregado` que el anclaje excluye siempre.

| origen de la ventana | encuentros que entran | cuáles |
|---|---|---|
| `periodo_ref:agosto_14_20` | **2** | Parque Avellaneda 12/08 · Encuentro Temático Salud 14/08 |
| `R-11 (calculado)` | **12** | los 2 de agosto **más** los 6 de `julio_24_30` y los 4 de `junio_sem2` |

**Las tres corridas del 21/08 lo muestran sin ambigüedad**, y por eso conviene tenerlas al lado:

| corrida | período | impresos | universo de tokens |
|---|---|---|---|
| `jm-20260821-194602` | `agosto_14_20` | 92 | 404 |
| `jm-20260821-224727` | `agosto_14_20` | 65 | 404 |
| `jm-20260821-230048` | `R-11 (calculado)` | **228** | — |

⚠ **Los 228 de la tercera no son una corrida mejor: son otro deck.** Se leyeron como cobertura
—*"la desatendida pinta más"*— y lo que pintó de más son encuentros de junio y de julio. Es la
familia del **número plausible** que `CLAUDE.md` §4 persigue: cada número está bien calculado y
sale de las filas equivocadas.

### ⛔ Corrección del 22/08/2026, escrita el mismo día y antes de que nadie la citara

**La primera versión de esta entrada decía que el aviso «existe, está escrito y no lo lee nadie».
Eso es FALSO y hay que dejarlo dicho, porque cambia qué trabajo manda a hacer.**

`PanelBackend.gs` tiene `avisosDeVentanaPropuesta_` **desde el 20/08** (`2026-08-20_2` Parte B),
que dice exactamente esto —*"las secciones repetibles NO se recortan por período: entran las N
reunión(es) con `mostrar=sí`"*— con el conteo adelante, viaja en `panel_getEstado().por_defecto.avisos`
y **`Panel.html:616` lo pinta** cuando el selector queda en «por defecto». Su comentario ya medía
las 12 filas de dos períodos. **Estaba todo hecho, y esta entrada lo desconoció por no haberlo
grepeado.** Es, literalmente, la regla de `CLAUDE.md` §3 —*grepear antes de pedir que se corrija
algo*— incumplida por quien la escribió.

**Lo que SÍ sigue en pie, y es más chico y más preciso:**

1. ⚠ **El aviso es preventivo, no forense.** Avisa **antes** de generar y sólo en el panel. Una vez
   que el deck existe, **nada en él ni en el reporte de la corrida dice que el temario no se
   recortó**: `itemsDeSeccion_` pone `periodo_id: ''` con el comentario *"el reporte lo dice en vez
   de dejarlo suponer"*, y ahí **muere** — los cuatro `reporte.push` de la expansión llevan
   `excluidos` y **ninguno lleva `periodo_id`**. Un deck de la semana pasada no se puede auditar.
2. ⚠ **Y `excluidos` no lo delata**: el filtro no corrió, así que no excluyó a nadie y la lista sale
   **vacía** — que es exactamente lo que sale cuando todo está bien.
3. ⛔ **El camino desatendido no pasa por el panel y por lo tanto no tiene aviso ninguno.**
   `jm-20260821-230048` se arrancó con `iniciarCorridaDesatendidaJM()` desde el editor: nadie vio
   `avisosDeVentanaPropuesta_` porque esa función vive en `panel_getEstado`. **El aviso protege el
   camino que ya era el menos expuesto** —el panel manda `periodo_ref` casi siempre— y no protege
   el que sí lo estaba.

**Baja de prioridad, entonces:** de lo que parecía un agujero sin ninguna contención a **un aviso
que existe y no cubre dos casos** — el forense y el desatendido.

⚠ **El comportamiento es deliberado y su motivo sigue siendo bueno.** El código lo dice: la cadena
de `D-20` puede terminar en `CONFIG`, que no tiene `periodo_id`, y *"filtrar por un período
adivinado a partir del rango sería exactamente la «semana adivinada» que `R-21` prohíbe. Emitir de
más y avisar es recuperable; emitir cero en silencio, no"*. **Lo que falló no es la decisión: es la
mitad del «y avisar».**

**Por qué P1 y no P0:** hoy el camino del panel manda `periodo_ref` siempre, así que la corrida que
una persona dispara **sí** filtra. El expuesto es el camino que no elige período —el desatendido
del editor, y cualquier corrida con `CONFIG` vacío—, que es justo el que el `2026-08-21_19` viene a
cablear al panel.

⛔ **Lo que este hallazgo NO hace, y es deliberado: no lo arregla.** Cómo se arregla es una
decisión, y son tres cosas distintas:

- **(a) Que el aviso sea también forense.** `periodo_id` viaja al reporte de expansión y de ahí al
  reporte de corrida, así que un deck ya generado se puede auditar. No cambia ningún número;
  cambia que se pueda saber después. (El aviso **previo** ya existe — ver la corrección de arriba.)
- **(b) Que el desatendido mande el período.** Es la regla 1 de la Parte A del `2026-08-21_19` y
  tapa el caso concreto, no el mecanismo.
- **(c) Que el eslabón 5 declare un `periodo_id`.** Que `R-11 (calculado)` resuelva contra la fila
  de `PERIODOS` cuyas fechas coinciden —hoy existiría: `agosto_14_20` es exactamente esa ventana—.
  Es lo que cierra el agujero de verdad y **es el que más hay que pensar**: si no hay fila que
  coincida, ¿emite de más, o no emite nada? La respuesta la fija `R-21`, no este pendiente.

ⓘ **Al margen, medido de paso y sin abrir pendiente propio:** `PERIODOS` tiene hoy `julio_24_30`
**dos veces** (filas idénticas) y una fila cuyo `periodo_id` es `vie 14/08 -- jue 20/08 (por
defecto)`, con la nota *"Puesto a mano"* — un id que parece una etiqueta de lámina. `leerPeriodos()`
devuelve un mapa, así que el duplicado colapsa sin fallar.

### P1 · El aviso «quedó crudo sin corte» no distingue «nadie lo cableó» de «se cableó y no se pisó» (22/08/2026)

**Anotado, no arreglado.** Sale de la Parte C del `2026-08-22_20`. Es la familia del `/////` que no
separaba causas, en la capa del reporte: **el glifo no miente sobre un valor, miente sobre por qué
no hay valor**, y las dos causas mandan a trabajos opuestos.

**Medido sobre `MARCADORES` viva el 22/08, los dos tokens que la corrida `jm-20260821-234927` dejó
crudos:**

| token | ¿tiene fila en `MARCADORES`? | qué es de verdad |
|---|---|---|
| `camp_remitente` | ⛔ **no** | **nadie lo cableó** — trabajo de cableado |
| `camp_titulo` | ✅ sí — `digital / Seguimiento digital · sd_campana_cuentas · ULTIMO` | se cableó, resuelve en otras láminas de la misma corrida (con `@ultimo_ambiguo`), y **acá no se pintó** |

**Los dos salen con el mismo texto:** *"quedó crudo en el deck sin que hubiera corte por tiempo —
revisar"*. Ese mensaje es correcto para el segundo y **engañoso para el primero**: manda a
investigar al escritor cuando lo que falta es una fila.

⭐ **La pregunta que lo cierra es la de `CLAUDE.md` §4, aplicada al reporte y no al glifo:** *¿qué
trabajo manda a hacer este aviso, y hay más de una causa que lleve a él?* Hay dos, piden cosas
distintas, y **falta un aviso** — no una nota al pie. El motor ya tiene el dato para separarlas: si
el token tiene fila en `MARCADORES` o no es una consulta que ya hace.

#### ⚠ Vuelto a medir el 23/08, y la tabla de arriba YA NO DESCRIBE EL ESTADO — se anota sin editarla

**En `jm-20260823-113545` los dos salen con el mismo aviso, y `camp_remitente` AHORA TIENE FILA.**
La tabla de arriba es del 22/08 y decía que no la tenía. **No se edita: es una medición fechada y
sigue siendo cierta para su fecha.**

⛔⛔ **Y eso deja una pregunta abierta que hay que hacer antes de seguir: nadie sabe quién escribió
esa fila.** `MARCADORES` tiene **tres** escritores —`curarMarcadores_`, `curarCamposMarcadores_`
(que corrige campos, no crea) y `migrarCalculoAOperacion_`—, y **ninguno de los tres wrappers
corridos el 23/08 incluye `camp_remitente`**: ni `cablearDesglosePorPlataforma()`, ni
`cablearMetaFrecuencia()`, ni `cablearLosChicos()` del 22. Así que **o se cargó a mano en la hoja,
o hay un camino que no está en el inventario de escritores.**

⛔⛔ **Y el 23/08 el usuario confirmó que NO la cargó a mano.** Entonces quedan dos posibilidades
y ninguna es cómoda: **o hay un cuarto escritor que `ESCRITORES.md` no declara**, o alguno de los
tres declarados escribe más de lo que dice. **Anotado y no perseguido** —decisión del usuario, el
mismo día—; se retoma cuando alguien tenga motivo para mirar `MARCADORES` de nuevo.

⭐ **Lo barato, para cuando toque:** `camp_remitente` está en el censo del 22/08 como **sin fila**,
así que la fila nació entre el 22 y el 23. Es una ventana de un día con muy pocas corridas: el
historial de versiones de la planilla lo puede decir sin adivinar.

⭐ **La diferencia importa para esta entrada, y en la dirección que la mejora:** con las dos filas
existiendo, el aviso *"quedó crudo… revisar"* **ya no es engañoso para uno y correcto para el
otro — es correcto para los dos y sigue sin decir por qué**. El pedido no cambia (falta un aviso
que separe causas); lo que cambia es que el ejemplo ya no ilustra *"manda a investigar al escritor
cuando lo que falta es una fila"*. **Hace falta un caso nuevo para esa mitad, o el pedido se
sostiene solo sobre la otra.**

⚠ **`camp_remitente` está DIFERIDO desde el 07/08** (`CONFIG_INFORMES.md` §2.5: *"los tres
remitentes sueltos quedan diferidos… no se cablean, no se borran, no se tocan"*). **Una fila nueva
para un token diferido es, en sí, algo que hay que explicar** — no un avance.

⛔ **Y un hueco que apareció al querer medir esto, y que lo vuelve caro:** `FALTANTES` **no tiene
lector**. Ni por la API del motor —*"hoja sin lector: FALTANTES — válidas: CONFIG, BASES, INFORMES,
PERIODOS, CAMPANAS, MAPEO, SOLAPAS, REUNIONES, SECCIONES"*— ni por `tools/snapshot.js`, que sólo
vuelca las once de registro. **La lista de trabajo de lo que falta cablear no se puede consultar
desde afuera del editor**, así que la mitad de esta entrada —cuál de las dos causas le tocó a
`camp_titulo` en la lámina puntual— **quedó sin medir**. Es lo que hay que destrabar primero.

⭐ **Y desde el 22/08 esto deja de ser un pendiente más: es el instrumento del cierre de la fase
`informe semanal`** (`D-38`, aprobada ese día). La fase **cierra cuando el usuario, mirando un deck
completo, declara que los faltantes que quedan no son relevantes** — no hay umbral ni conteo, es
revisión humana. **El criterio no es que no haya faltantes: es que estén a la vista para poder
juzgarlos**, y una declaración sobre faltantes que no se pueden leer **se hace a ciegas**. Con
`FALTANTES` pisándose en cada corrida y sin lector fuera del editor, **hoy esa declaración no se
puede hacer**. Lo mismo vale para la otra mitad del criterio: la declaración va pegada a un
`corrida_id`, así que una hoja que se pisa tampoco puede sostenerla después.

---

### ⛔ P1 · La fila 9 de `PERIODOS` se lee «por defecto», no lo es, y produce un deck con cero encuentros (22/08/2026)

**Anotado, no arreglado. ⛔ No se borra ni se renombra: es configuración y la decide el usuario.**

Medido sobre `PERIODOS` viva el 22/08 — **10 filas, 9 de datos, 8 ids distintos**:

```
fila 9   periodo_id = 'vie 14/08 -- jue 20/08 (por defecto)'   2026-08-14 → 2026-08-20   'Puesto a mano'
fila 10  periodo_id = 'agosto_14_20'                            2026-08-14 → 2026-08-20
```

**La fila 9 no es una rareza inerte: es una trampa viva**, y el mecanismo es exacto.

1. `panel_getEstado` lista `PERIODOS` en el selector, así que **la fila 9 aparece en el
   desplegable** con un rótulo que se lee *«vie 14/08 — jue 20/08 (por defecto)»*.
2. **No es «por defecto».** Elegirla es un override explícito: `resolverVentana` devuelve
   `origen = 'periodo_ref:vie 14/08 -- jue 20/08 (por defecto)'`.
3. Ese prefijo **activa el recorte de `D-19`** en `anclarEncuentros`, que filtra `REUNIONES` por
   `periodo_id` **igual a esa cadena**.
4. **Ninguna fila de `REUNIONES` tiene ese `periodo_id`** — las de agosto tienen `agosto_14_20`.

⭐ **Resultado: un deck con cero encuentros, y nada falla.** La ventana de fechas es la correcta, el
motor hace exactamente lo que se le pidió, y el reporte de la corrida dice *"excluidas por
período"* con todas adentro. Es el modo de falla de este proyecto en su forma más limpia: **la
opción que el usuario elegiría por parecer la segura es la que vacía el informe.**

⚠ **Y la opción de al lado —`agosto_14_20`— tiene exactamente la misma ventana de fechas**, así que
las dos se ven idénticas en el selector y una funciona y la otra no.

**Tres salidas, sin elegir** (es configuración): **(a)** borrar la fila 9 —el usuario decide, y hay
que mirar antes si algo la cita—; **(b)** renombrarla a un id que no se confunda con «por defecto»;
**(c)** que el panel **no ofrezca** períodos sin ninguna fila de `REUNIONES` que los reclame, o los
ofrezca diciendo *«0 encuentros»* al lado. La (c) es la única que además protege del próximo
período que se cargue mal.

ⓘ **El otro hallazgo de la misma lectura sí es inerte y sólo se anota:** `julio_24_30` está
**duplicado** (filas 7 y 8, idénticas byte a byte). `leerPeriodos()` devuelve un mapa por
`periodo_id`, así que el duplicado colapsa sin fallar y sin cambiar ningún número.

---

### ⏸ El alta de `agosto_14_21` queda BLOQUEADA por la Parte 0.2 del `2026-08-22_21` (22/08/2026)

La Parte D del `2026-08-22_20` pide dar de alta `agosto_14_21` —`2026-08-14` → `2026-08-21`, ocho
días— como la ventana que publica el equipo. **No se dio de alta, y el motivo es de orden, no de
desacuerdo.**

⚠ **El `2026-08-22_21` tiene una Parte 0.2 diseñada exactamente para decidir esto**, con el dato
del usuario del 22/08: **las bases de ese zip se bajaron el jueves**, así que una base que corta el
jueves **no puede** haber producido un número de ocho días. Sus dos desenlaces:

- **si los siete días reproducen** → el título del equipo es decorativo, `R-11` estaba bien, y
  **`agosto_14_21` no hace falta**: darlo de alta ahora sería agregar al selector una opción que la
  medición está por declarar innecesaria — y el selector ya tiene el problema de arriba;
- **si no reproducen** → el fixture es más viejo que el deck del equipo, y **tampoco** se cierra
  nada dando de alta la fila.

⛔ **Y la condición que el addendum del `_20` deja escrita vale igual el día que se dé de alta:**
son **ocho días** y el Addendum 1 de `R-11` fija **siete, inclusive**. La nota de la fila tiene que
decir con todas las letras que contradice el Addendum 1, y por qué —el equipo actualiza el archivo
el viernes al mediodía, así que su corte incluye el viernes de cierre—. **Sin esa frase no se da de
alta: una fila que contradice una regla en silencio es peor que no tenerla.**

⚠ **Y la consecuencia que no es obvia, que va escrita ahora aunque el alta no ocurra:** una ventana
viernes→viernes de ocho días hace que **el viernes se cuente en dos informes seguidos**. `R-11` son
siete días justamente para que no se solape. Con `agosto_14_21` disponible como opción, dos
corridas de semanas consecutivas pueden sumar el mismo día dos veces **sin que nada falle**.

### P1 · Un encuentro que NO ancla a ninguna cuenta no queda anotado en ningún lado (22/08/2026)

**Anotado, no arreglado.** Sale de la Parte B del `2026-08-22_20` (addendum), donde bloqueó la
medición.

`anclarEncuentros` reparte cada encuentro en tres montones: `encuentros` (ancló), `bajaConfianza`
(ancló por debajo del umbral) y `sinLink` (**no encontró ninguna cuenta**). Sólo el segundo escribe
en `ANCLAJE_PENDIENTE`, vía `registrarAnclajePendiente_`. **`sinLink` no deja rastro en ninguna
hoja.**

⛔ **La consecuencia, y es la que lo vuelve caro:** un encuentro sin cuenta y un encuentro que ancló
perfecto **se ven exactamente igual desde afuera** — los dos están ausentes de
`ANCLAJE_PENDIENTE`. Para distinguirlos hay que correr el anclaje otra vez y mirar el retorno, que
cuesta ~50 s y **escribe**.

**El caso que lo destapó, medido el 22/08:** el Encuentro Temático de Salud publica sus cuatro
números de IVR en `-`, y `ANCLAJE_PENDIENTE` **no tiene fila para `salud`**. Eso admite dos
lecturas opuestas —*ancló por encima del umbral* o *quedó `sinLink`*— y **la hoja no puede
separarlas**. Es la familia de *«un control tiene que declarar CUÁNTO midió»* (`CLAUDE.md` §4):
«ningún problema» y «no se probó nada» se ven idénticos en un registro sin conteo.

⚠ **Y el ítem sí trae el dato, sólo que muere en el reporte de la corrida.** `itemsDeSeccion_` pone
`motivo: 'sin cuenta digital anclada'` en cada ítem sin cuenta, y `porItem` lo publica — pero eso
vive en el retorno de `generarInforme` y **no se persiste**: la corrida siguiente lo reemplaza y no
queda con qué auditar un deck viejo. Es el mismo modo que el `periodo_id` que muere entre
`itemsDeSeccion_` y los `reporte.push`.

**Dos salidas, sin elegir:** **(a)** que `sinLink` también escriba su fila en `ANCLAJE_PENDIENTE`
—sin candidatos, que es justamente lo que hay que decir—; **(b)** que el reporte de corrida
persista los `motivo` por ítem. La (a) hace que la pantalla de anclajes muestre el caso; la (b)
hace auditable un deck ya generado. **No son la misma cosa y probablemente hagan falta las dos.**

### ✅ ~~P0 · `REUNIONES.nombre` del Encuentro Temático de Salud es `': Salud'`, y eso bloquea el nivel 1 de `R-21`~~ — **CERRADO 22/08/2026**

> **Cerrado por el matcher, no por el dato.** Decisión del usuario, 22/08: **el nombre queda como
> está y el arreglo va en `encontrarFilaRdvDeReunion_`**, que ahora le recorta los separadores de
> los **bordes** al término de búsqueda. Local a esa función, sin tocar `normalizar_` —que lo usa
> todo el proyecto, incluido el scoring del anclaje digital— y sin obligar a nadie a editar la
> base. `": Salud"` encuentra su fila; un separador **del medio** se sigue comparando tal cual; y
> un nombre que sea sólo puntuación **falla con motivo** en vez de matchear la primera fila de la
> fecha. Control: `tools/probar-matcher-rdv.js`, 14 afirmaciones.

> ⚠ **Lo que el cierre NO cubre queda abierto abajo, en dos entradas propias:** el parseo sigue
> produciendo el fragmento, y el match sigue siendo en una sola dirección.

**El texto original, que es lo que se midió:**

**Anotado, no arreglado. Frenó la Parte A del `2026-08-22_22`** antes de la primera línea de código.

**Lo medido, en vivo, con `encontrarFilaRdvDeReunion_` sobre los dos ítems del temario de
`agosto_14_20`:**

| ítem del temario | fecha | ¿encuentra su fila en `rdv`? |
|---|---|---|
| `Parque Avellaneda` | 12/08 | ✅ **sí** — `Figura: Jorge Macri`, `Barrio: Parque Avellaneda` |
| `: Salud` | 14/08 | ⛔ **no** — *"No se encontró un encuentro para «: Salud» (14/08/2026)"* |

⭐ **El nombre está corrupto y es un artefacto de parseo.** La línea del temario es *"2) JM |
Encuentro Temático: Salud 14/08"* y `parsearLineaReunion_` cortó por el `|` y dejó **`': Salud'`**
—con los dos puntos adelante— como `nombre`. `encontrarFilaRdvDeReunion_` busca por nombre y fecha,
y con ese nombre no matchea nada.

⛔ **Por qué esto frena el paso y no es un detalle:** el `2026-08-22_22` y su addendum piden anclar
el agregado `ecv_*` al temario (nivel 1 de `R-21`), con el control *"`ecv_encuentros` tiene que dar
**2** — hoy da 1"*. **Con el dato de hoy seguiría dando 1**, y no por el mecanismo: porque de los
dos ítems, uno no puede alcanzar su fila. **El control del paso no se puede cumplir hasta que el
nombre esté bien.**

⚠ **Y da 1 distinto, que es peor que dar 1.** Hoy el agregado publica la fila de **Parque
Patricios** (Salud) porque es la única con `figura=Jorge Macri` dentro de la ventana 14–20/08.
Anclado al temario publicaría la de **Parque Avellaneda**, porque es la única alcanzable por
nombre. **Mismo número, otro encuentro, y el cambio se vería como si no hubiera pasado nada.**

⭐⭐ **El corolario, que es el hallazgo grande y confirma la decisión del usuario:** los `855`
inscriptos y `186` asistentes que **coinciden exacto con el deck del equipo** salen hoy de
**ventana + figura**, no del temario. Coinciden **por casualidad** — la fila de Salud es la única de
Jorge Macri en esa ventana. Es el *número plausible* en su forma más pura: **el número correcto
saliendo del camino equivocado**, y por eso el universo hay que arreglarlo aunque el número de hoy
cierre.

**Tres salidas, sin elegir** (el temario lo carga una persona): **(a)** corregir el `nombre` en
`REUNIONES` a mano —es una celda, y destraba el paso—; **(b)** arreglar `parsearLineaReunion_` para
que no deje el separador en el nombre, que evita el próximo; **(c)** que
`encontrarFilaRdvDeReunion_` normalice los bordes de puntuación antes de comparar. **(a) y (b) no
compiten**: la primera destraba hoy, la segunda evita mañana.

⚠ **Y lo que hay que mirar al corregir el nombre:** `ANCLAJE_PENDIENTE` indexa por
`normalizar_(nombre)|fecha|etapa`, así que cambiar el nombre **cambia la clave** y cualquier
decisión de anclaje ya tomada para esa reunión queda huérfana. Hoy no hay ninguna para Salud
—verificado—, pero la próxima vez sí puede haberla.

---

### ✅ ~~El encabezado de `digital/Directa IVR`: la hoja perdió su fila de títulos~~ — **CERRADO 22/08/2026**

> **Lo resolvió el usuario del lado del dato: repuso la fila de títulos en la planilla.** Es la
> salida (a) de las dos que estaban escritas, la que no cuesta código y deja a `D-31` con testigo.
> **`fila_encabezado = 0` no hizo falta.**

> ⭐ **Verificado antes de darlo por hecho, con `verificarEncabezadosDeMapeo()` sobre la hoja
> viva:** **124 filas comparadas, 114 columnas, `desalineadas: 0`, `ilegibles: 0`**. Las doce de
> esa solapa desaparecieron **y no apareció ninguna nueva**, que era la otra mitad del control.

**El texto original, que es lo que se midió:**

Sale de la Parte 0.4 del `2026-08-22_22`. **Las dos hipótesis del prompt quedaron descartadas por
medición**, no por opinión.

**Lo leído en vivo con `diagFormaDeSolapaExterna_`, las dos primeras filas de la solapa:**

| fila | col A | col I | col J | col L |
|---|---|---|---|---|
| **1** | `2450-ENEJDGAG` | `Reunión de vecinos JM Boedo 9/1` | 12.049 | 11.592 |
| **2** | `2239-NOVSALGC` | `PM \| Cuidados del Calor - Prevención` | 60.114 | 50.294 |

**Las dos son datos, y las dos son de enero.**

- ⛔ **No es `fila_encabezado = 2`**: la fila 2 tampoco tiene rótulos.
- ⛔ **No «crece por arriba»**: si creciera, la fila 1 sería la más nueva y es de enero. **Crece por
  abajo.**
- ✅ **Las columnas siguen bien**: col J = Audiencia y col L = Atendidos en las dos filas, coherente
  con el `MAPEO` y con la `firma_encabezado` registrada.

**Entonces lo que pasó es que la fila de títulos se borró**, y `SOLAPAS.fila_encabezado = 1` hace
que el motor tome la primera fila de datos como encabezado: **pierde esa fila entera**, la de la
cuenta `2450-ENEJDGAG`.

**Las dos salidas, con su costo:**

| | qué | qué cuesta |
|---|---|---|
| **(a)** | que el equipo reponga la fila de títulos | ⭐ **cero código**, y deja a `D-31` con testigo. Es su planilla (`C-01`: la plantilla y las bases son del equipo) |
| **(b)** | `fila_encabezado = 0` — `SOLAPAS` ya lo contempla (*"sin fila de títulos"*, `Fuentes.gs`) | recupera la fila perdida, pero **deja a `D-31` sin testigo en esa solapa**: el motor leería por letra sin nada que lo contradiga, que es exactamente lo que `D-31` existe para evitar |

⛔ **Ninguna se ejecuta sin decisión del usuario**, y por eso este paso no la tomó.

**Los doce marcadores que se mueven en cualquiera de los dos casos:** `enc_audiencia`,
`enc_atendidos`, `enc_e75`, `enc_marque1`, `enc_e75_pct` (bloque de encuentro) y `ivr_campanias`,
`ivr_llamados`, `ivr_atendidos`, `ivr_at_pct`, `ivr_75`, `ivr_75_pct`, `ivr_marque1` (resumen
ejecutivo).

ⓘ **Y una premisa del `2026-08-21_19` que queda corregida acá:** decía que `ivr_audiencia` e
`ivr_llamados` *"podrían estar leyendo la misma columna"* por compartir el rótulo falso `12049`.
**Es falso.** Son dos columnas distintas de la misma fila, donde audiencia y llamados realizados
coinciden porque se llama a toda la audiencia — en la fila 2 dan `60.114` y `60.114` por lo mismo.
**Ese riesgo no existe.**

---

### ⏸ `DIMENSIONES_.ambito.gcba` sobre `rdv` niega una definición que va a dejar de existir (22/08/2026)

**Anotado, no arreglado.** Sale de la Parte 0.2 del `2026-08-22_22`, y **hoy no cuesta nada** — se
escribe para que el día que cueste, cueste una lectura y no un número.

Medido sobre `MARCADORES` viva: **26** marcadores usan `ambito=jm` y **9** usan `ambito=gcba`.

| par `base\|solapa` | `jm` | `gcba` |
|---|---|---|
| `rdv\|RVD JM-CM - ES` | **17** | **0** |
| `digital\|Directa Mail` | 4 | 4 |
| `looker\|DIGITAL` | 4 | 4 |
| `looker\|resumen_metricas_dinamico` | 1 | 1 |

⭐ **Sobre `rdv` no hay ni un `gcba_*`**, así que cuando el universo de `jm` en esa base pase a ser
el temario (`R-21` nivel 1), **cero marcadores quedan colgando** de la resta de `D-33`.

⚠ **Pero la declaración sigue armada.** `DIMENSIONES_.ambito.gcba` mantiene
`'rdv|RVD JM-CM - ES': 'figura!=Jorge Macri'`, y `D-33` define `gcba` **negando** a `jm`. El día que
alguien cablee un `gcba_*` sobre esa solapa, la resta va a negar *"no es Jorge Macri"* cuando `jm`
ya no signifique eso — **y va a publicar un número plausible**, porque la condición sigue siendo
válida como filtro aunque haya dejado de ser el complemento.

**Y hay un segundo dato de la misma medición que conviene tener escrito:** tres de los 17
—`ecv_barrio`, `ecv_poblacion` y `enc_evento`— **se emiten también dentro del bloque de
encuentro**, donde entran por `opciones.fila_rdv` y `dimensiones` **no se aplica**. O sea que **el
mismo marcador se comporta distinto según dónde salga**, y cualquier cambio al universo del
agregado tiene que dejar intacto el camino por ítem.

### ⛔ P1 · Tres conclusiones sobre el producto salieron de `230048`, que no es el testigo (22/08/2026)

**Anotado con su regla, no arreglado.** Sale del addendum del `2026-08-22_23`, que frenó la tercera
antes de que se publicara como criterio.

⭐ **La regla, en una línea: el testigo de la fase `informe semanal` (`D-38`) es
`jm-20260821-234927`** —período elegido, temario correcto, sin corte— **y ninguna conclusión sobre
el producto sale de otra corrida sin decir por qué.** Que un deck exista no lo hace comparable.

**Las tres, con lo que cada una concluyó:**

| # | dónde | qué se concluyó de `230048` |
|---|---|---|
| 1 | esta lista, 21/08 (*"elegir el período o dejarlo calcular…"*) | los **228 impresos** se leyeron como cobertura — *"la desatendida pinta más"*—, y lo que pintó de más son encuentros de junio y julio |
| 2 | `VALIDACION_deck_generado_vs_equipo_2026-08-22.md` §4.1 | *"las portadas no corresponden a su contenido"*, medido **sobre `230048`** y presentado como **el hallazgo más grave del documento** |
| 3 | la propuesta de cierre de `D-38`, condición 3 | *"cada número en su lámina"* en ⛔, citando las tres copias de §4.1 — **corregida el mismo día**: sobre el testigo nadie la midió |

⚠ **Por qué `230048` engaña y no se nota:** corrió con `R-11 (calculado)`, así que trajo **doce
encuentros** de junio y julio en vez de dos. Sus números **están bien calculados** y salen de las
filas equivocadas — la familia del número plausible de `CLAUDE.md` §4. Un deck más grande se lee
como un deck más completo.

⚠ **Y el caso 3 tiene una segunda mitad que conviene tener escrita, porque es lo contrario del
defecto:** el usuario revisó la lámina del testigo a mano y **da bien**. La portada dice *Encuentro
Temático Salud - Eje Sur* y el iceberg dice *Parque Patricios* **porque uno es el nombre y el otro
el barrio** — no es una portada cruzada. Un cruce aparente que no lo es cuesta igual que uno real
si nadie lo mira.

**Lo que falta, y no se hace acá:** medir la condición 3 recorriendo el deck de `234927` entero.
Hoy sólo la condición 1 de `D-38` está medida sobre el testigo.

### P2 · Tres designadores de prompt colisionaron en dos días — la regla ya está en `CLAUDE.md` §3 (22/08/2026)

**Registrado para convivir con ellas, no para arreglarlas.** ⛔ **Nada ejecutado se renumera:** los
commits nombran el designador, y ése es el único cruce que existe entre un prompt y el commit que
lo ejecutó. Renumerar rompería justo eso.

| designador | los dos archivos | estado |
|---|---|---|
| `_20` | `2026-08-21_20_estados_del_csv` · `2026-08-22_20_camp_por_cuenta_y_ventana` | **conviven**; el `_20` del 22 está ejecutado |
| `_15` | `2026-08-21_15_digital_cede_a_D-30` (ejecutado) · el prompt del refresco | **resuelto renumerando el que no había corrido** → `2026-08-22_24` |
| `_16` | `2026-08-21_16_anclajes_en_el_panel` (ejecutado) · referencias internas del anterior | **resuelto**: las referencias se reescribieron sin número |

**La causa, medida y dicha por el usuario:** la numeración **reinicia con la fecha**, y en la sesión
del 21 al 22 se la siguió a través del cambio de día.

⭐ **La regla vive en `CLAUDE.md` §3, no acá** —es donde §7 la pone y donde alguien la va a leer
justo antes de repetir el error—. Lo que se precisó el 22/08 es que *"un número de orden dentro del
día"* **no decía** *"reinicia con la fecha"*: el hallazgo no fue que la convención faltara, sino que
**se podía incumplir leyéndola bien**. Esta entrada registra sólo las colisiones.

### P2 · `parsearLineaReunion_` deja el separador del título pegado al nombre — el matcher lo tolera, no lo arregla (22/08/2026)

**Anotado, no arreglado.** Es la deuda que queda del cierre del P0 de `': Salud'`, y se escribe
aparte a propósito: **el motor tolerando un dato mal parseado es una deuda, no una solución.**

**El caso, medido.** La línea del temario es *"2) JM | Encuentro Temático: Salud 14/08"* y
`parsearLineaReunion_` corta por el `|`, dejando `nombre = ': Salud'` — con los dos puntos del
título adelante. La celda de `REUNIONES` **quedó así en la hoja** y va a seguir así.

⚠ **Va a volver a pasar con cualquier reunión que use esa forma.** El patrón *"Tipo: Nombre"* es
como el equipo escribe los encuentros temáticos, así que no es un caso raro: es la forma normal
del temario para esa familia. Cada uno va a entrar con el separador pegado.

⭐ **Y lo que hace que esto siga importando aunque el matcher lo tolere:** el nombre mal parseado
**no vive sólo en el matcher**. Es la clave de `ANCLAJE_PENDIENTE`
—`normalizar_(nombre)|fecha|etapa`—, es lo que se muestra en la pantalla de anclajes, y es lo que
va a la etiqueta del ítem. **El recorte del matcher arregla un consumidor de los cuatro.**

#### ⭐ Confirmado en corrida el 23/08, y en el consumidor que esta entrada nombraba como cuarto

**`jm-20260823-113545`: `enc_alcance_pct` aparece en `FALTANTES` con el sufijo `@: Salud`.** El
nombre del ítem viaja con el separador pegado, literal, hasta la etiqueta del reporte.

⭐ **Esto cierra el pronóstico de arriba sin agregar nada nuevo:** la entrada decía que *"el
recorte del matcher arregla un consumidor de los cuatro"*, y acá se ve otro — **la etiqueta del
ítem** — fallando con el dato crudo. Ya no es un riesgo declarado: es un caso con `corrida_id`.

#### ⭐⭐ Y el argumento que sube este `P2` de prioridad: el nombre del ítem NO es una etiqueta, es el instrumento

**Esto dejó de ser *"una etiqueta fea"* el 23/08, cuando `X-40` se resolvió leyéndola.**

**Cómo se resolvió `X-40`, y es literal:** en `FALTANTES` de `jm-20260823-113545`, los seis `ivr_*`
aparecen **sin sufijo `@ítem`** mientras **todo lo demás que itera sí lo tiene** — `u1_bench_*` dice
`@Parque Avellaneda`, los `camp_*` dicen `@3481-AGOINFAN` y `@3509-AGOSEGGJ`, y
`enc_alcance_pct` dice… `@: Salud`. **De esa ausencia salió el diagnóstico**: los seis se
resolvieron en la etapa de tokens fijos, con la ventana del informe, y por lo tanto **no los pinta
ninguna lámina que itere**. Sin ese contraste, `X-40` seguiría abierto.

⛔⛔ **Y ahí está el problema, porque la lectura que lo resolvió es BINARIA: hay sufijo o no hay.**
Eso vale mientras el nombre del ítem sea un nombre. **Un nombre que empieza con el separador ya
hace dudar de qué es nombre y qué es basura de parseo** — `@: Salud` se lee tres veces antes de
entender que el ítem se llama así. El caso límite es peor y es de la misma raíz: **si un parseo
devolviera un nombre vacío, el sufijo se renderiza como `token @` — y «sin sufijo» es exactamente
la señal que significa «se resolvió sin ítem».** Una resolución por ítem se leería como una de
token fijo.

⚠ **Los dos no están al mismo nivel de evidencia y conviene decirlo:** el nombre sucio está
**medido** (`@: Salud`, esta corrida); el nombre vacío **no se observó** — `parsearLineaReunion_`
devolvió `': Salud'`, que es feo pero no vacío. Se escribe igual porque **la causa es la misma** y
porque el costo de confundir esas dos lecturas ya está demostrado.

⭐ **Lo accionable, en una línea: el nombre del ítem es la clave de `ANCLAJE_PENDIENTE`, la etiqueta
de la pantalla, la etiqueta del deck — y ahora también el testigo con el que se diagnostica el
motor.** Son cuatro consumidores, no tres, y el cuarto es el único que se usa **para decidir si
otra cosa está rota**. Un instrumento que se degrada con el dato que mide es el peor de los
cuatro.

**Dos salidas, sin elegir:** **(a)** que `parsearLineaReunion_` no deje el separador —arregla el
origen y todos los consumidores de una—; **(b)** dejarlo y que cada consumidor recorte, que es lo
que hay hoy y multiplica el recorte por consumidor. ⚠ **La (a) tiene un costo que hay que mirar
antes:** cambiar cómo se parsea **cambia el `nombre` de las filas nuevas**, y con él la clave de
`ANCLAJE_PENDIENTE` — las decisiones de anclaje ya tomadas para un encuentro con esa forma
quedarían huérfanas. Hoy no hay ninguna (verificado el 22/08: sólo `almagro` y `educacion`), así
que **es barato ahora y caro después**.

---

### P1 · El matcher de `rdv` compara en una sola dirección, y ésa es la fragilidad de fondo (22/08/2026)

**Anotado, no arreglado.** Sale del mismo trabajo que el anterior, y es **la próxima vez que esto
va a doler**.

`encontrarFilaRdvDeReunion_` pregunta si el texto de `rdv` **contiene** al nombre del temario:

```js
if (normalizar_(barrio).indexOf(nombreBuscado) !== -1 ||
    normalizar_(evento).indexOf(nombreBuscado) !== -1) { … }
```

⛔ **Entonces el match funciona sólo cuando el nombre del temario es igual o más corto que el de
`rdv`.** Falla, **sin ningún separador de por medio**, en los tres casos que el temario produce
naturalmente:

| lo que el temario dice | lo que `rdv` dice | ¿matchea? |
|---|---|---|
| `Salud` | `Encuentro Temático Salud Eje Sur` | ✅ sí — el temario es más corto |
| `Encuentro Temático Salud Eje Sur` | `Salud` | ⛔ **no** — el temario es más largo |
| `Salud Eje Sur` | `Eje Sur Salud` | ⛔ **no** — otro orden |

⚠ **Y el modo de falla es el de siempre: no falla ruidoso.** El encuentro queda `sinLink`, que
—como ya está anotado más arriba— **no deja rastro en ninguna hoja**. Un encuentro que no matchea
por longitud es indistinguible de uno que ancló bien.

⭐ **Lo que lo vuelve una fragilidad y no un bug puntual:** el nombre del temario lo escribe una
persona, semana a semana, en texto libre, y `rdv` lo escribe **otra persona en otra planilla**. Que
uno sea prefijo del otro es una coincidencia que se sostuvo hasta hoy, no una propiedad.

**Tres salidas, sin elegir:** **(a)** comparar en las dos direcciones —`a.indexOf(b) || b.indexOf(a)`—,
que es una línea y tapa el caso 2 pero no el 3 y **afloja el match**: un nombre corto como `Sur`
empezaría a matchear de más; **(b)** comparar por **palabras en común** con un umbral, que tapa los
tres y es el mismo tipo de scoring que el anclaje digital ya tiene; **(c)** dejarlo y que el
`sinLink` sea visible —lo que destraba el P1 de arriba— para que al menos **se vea cuando falla**.

⚠ **La (c) no compite con las otras dos: es la que hay que hacer igual.** Cualquier match por texto
va a errar alguna vez; lo que no puede pasar es que erre **en silencio**.

### ⏸ `SECCIONES.itera_sobre` pasa a significar dos cosas, y el día que se separen la columna no alcanza (22/08/2026)

**Anotado, no arreglado.** Decisión del usuario del 22/08: **reutilizar la columna en vez de abrir
una nueva**, y esto escribe el costo para que el día que aparezca no se descubra.

Desde el `2026-08-22_25`, `itera_sobre` responde **dos preguntas distintas**:

| | qué dice | quién la lee |
|---|---|---|
| **universo** | de dónde salen las filas del cálculo | `filasRdvDelTemario_`, y sólo cuando `modo = 'agregado'` |
| **expansión** | sobre qué se duplican las láminas | `itemsDeSeccion_`, y sólo cuando `modo = 'repetible'` |

**Hoy no chocan porque `modo` las separa**, y eso está verificado: ningún lector de `itera_sobre` lo
lee sin chequear `modo` antes (`0.5` del `_25`).

⚠ **El día que la columna no alcance, y son dos casos concretos:**

1. **Una sección `agregado` que necesite iterar de verdad** — emitir una lámina por ítem *y* un
   total. Hoy `modo` sólo admite uno de los dos.
2. **Una `repetible` cuyo universo sea distinto del que expande** — por ejemplo expandir por
   campaña y agregar por temario. La columna diría una sola cosa y la otra no tendría dónde vivir.

**La salida, el día que pase, es una columna propia** —`universo_sobre`, o el nombre que
corresponda—, no un valor compuesto en ésta. **Lo que no hay que hacer es inferir cuál de los dos
significados vale mirando otra columna**, que es como se llega a que un cambio de `modo` mueva
números sin que nadie lo pida.

---

### ⏸ Ocho de los 17 marcadores de `rdv|RVD JM-CM - ES` no tienen caso de validación (22/08/2026)

**Anotado, no arreglado.** Medido en el `0.3` del `2026-08-22_25`, cruzando `MARCADORES` viva
contra `docs/casos_validacion_2026-08-19.csv` **entero**.

| marcador | qué le pasa |
|---|---|
| `ecv_insc_mail_pct` · `ecv_insc_cc_pct` · `ecv_insc_ivr_pct` · `ecv_insc_digital_pct` · `ecv_insc_dif_pct` | ⏸ **derivables, no validados**. Sus numeradores y su denominador sí tienen caso (`V-39`…`V-42`, `V-38`/`V-71`), pero **el cociente no**. Decisión del usuario, 22/08: **se calculan, se publican con su cuenta a la vista —`1170/2445`— y nacen SIN VALIDAR.** No se marcan dudosos: nadie declaró desconfianza sobre ellos |
| `ecv_barrio` · `ecv_poblacion` · `enc_evento` | ⏸ sin caso propio. Son los tres que se emiten **también** dentro del bloque de encuentro, y su control es el **positivo por los dos caminos** que el banco del `_25` ya fija: el camino por ítem no se mueve |

⭐ **Y una corrección al prompt que conviene no perder:** `ecv_barrios` **sí** tiene caso, pero es
`C-03` y es `contradice` —`"Belgrano, Caballito, Retiro, Villa Urquiza"`, los cuatro de la
ventana—. O sea que hay **un número que el motor publica mal y ninguno esperado**: su control es
contra `REUNIONES`, no contra un caso.

⛔ **Y `ecv_barrio1`, `ecv_barrio2`, `ecv_barrio3` no están diferidos: NO EXISTEN en `MARCADORES`.**
El seed de `ecv_alcance_semanal` los nombra en `familia_tokens` y **no hay fila para ninguno**.
Cablearlos no entró en el `_25`; sacarlos de la familia declarada tampoco. **Quedan las dos cosas
por hacer y son una sola decisión**: o se cablean, o se sacan de la familia — dejarlos nombrados
sin fila es lo que hace que una lista de familia no signifique nada.

---

### ⚠ Se editó por primera vez un CSV de casos que `CLAUDE.md` §7 declara congelado (22/08/2026)

**Hecho, y se escribe porque abre un precedente.** El addendum del `2026-08-22_25` pidió agregar
**una nota** a `V-38` y `V-44` de `docs/casos_validacion_2026-08-19.csv` diciendo que ese bloque
**no mide el universo del temario** — para que el próximo que lo lea no repita el cruce que hizo
caer al prompt.

`CLAUDE.md` §7 dice de esos archivos: *"nadie edita; se crea uno nuevo"*.

**Lo que se hizo y lo que no:**

- ✅ **Se agregó texto al campo `nota`**, precedido de `· ATENCION (22/08/2026):`, en dos filas.
- ⛔ **No se tocó `valor_esperado` ni `estado`**: los dos siguen `exacto`, con 2445 y 5. **Los casos
  no se retractan** — miden bien lo que su clave declara.
- ⛔ **No se renumeró ni se reusó ningún caso.**

⚠ **La tensión con §7 es real y queda dicha en vez de resuelta.** El criterio que la sostiene es
que **la nota no cambia la medición**: no altera qué se midió ni con qué resultado, sólo advierte
contra una lectura que el propio archivo inducía. Si el criterio se quiere otro —una fila de
addendum, un archivo nuevo, o §7 modificada—, **esta entrada es dónde empezar**, porque el
precedente ya está sentado.

### ✅ La ventana de ocho días queda DESCARTADA como causa (22/08/2026)

**Medido, no razonado**, sobre `docs/_fixtures/Seguimiento Digital  2026-08-20.zip`
(`sha256 f8ef3227…`, verificado antes de citar):

| ventana | filas JM | enviados | entregados | aperturas |
|---|---|---|---|---|
| **7 días** 14→20 | 6 | 541.002 | 538.291 | 200.767 |
| **8 días** 14→21 | **6** | **541.002** | **538.291** | **200.767** |

**Idénticos: la base no tiene una sola fila del viernes 21.** Es el dato del usuario del 22/08 —las
bases se bajaron el jueves— confirmado sobre el archivo: **una base que corta el jueves no puede
haber producido un número de ocho días**. El título *"(14_08 al 21_08)"* del deck del equipo es
decorativo y **`R-11` estaba bien**.

⛔ **Consecuencia, y es la que importa:** la recomendación de
`docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md` —*"antes de perseguir Programmatic, medir
la ventana"*— **queda vencida**. Las diferencias de volumen **vuelven a estar sin explicar** y hay
que buscarlas en otro lado. Está escrito como addendum en ese documento.

⚠ **Y esto NO decide sobre el alta de `agosto_14_21`**, que sigue siendo una decisión abierta del
usuario: lo que se descarta es la ventana **como causa de las diferencias**, no la utilidad de
tener la fila.

---

### ✅ Corrección: la `Frecuencia` de JM en `-` NO es un defecto — no hay dato (22/08/2026)

`docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md` §3.3 dice *"`Frecuencia` no sale en ninguno
de los dos ámbitos: JM `-` contra `6`"* y lo cuenta entre los defectos. **Para JM está mal contado.**

Medido sobre el fixture, `looker/resumen_metricas_dinamico`, `ambito=jm` (`campana~=JM`), ventana
14–20/08 con `fecha_periodo` = `fecha_inicio`:

```
jm    →  0 filas.  impresiones 0 · alcance 0 · RATIO = división por cero
gcba  → 25 filas.  impresiones 5.985.524 · alcance 1.779.147 · RATIO 3,36
```

⭐ **Ninguna campaña JM EMPIEZA entre el 14 y el 20/08**, así que el `-` es la respuesta correcta:
el marcador está cableado, resolvió, y no hay filas. **El motor no está fallando.** Sacar esa fila
de la lista de defectos de JM.

⚠ **GCBA sigue abierto y con tres números distintos:** fixture 3,36 · motor `-5.94-` · equipo 18,5.
Los tres difieren y ninguno explica a los otros; no se persigue acá.

---

### ⏸ El Resumen Ejecutivo: tres definiciones probadas y ninguna reproduce (22/08/2026)

**Anotado, no arreglado.** El fixture **no** reproduce las impresiones que publica el equipo, y se
escribe **qué se descartó** para que el próximo no vuelva a probar lo mismo.

**JM, `looker/DIGITAL`, `nombre_campaña~=JM`:**

| definición probada | Meta | Google | Programmatic | total |
|---|---|---|---|---|
| **solape con la ventana** *(lo que hace el motor)* | 4.310.676 | 1.698.445 | 25.596.519 | 31.605.640 |
| punto — la campaña **empieza** en la ventana | 0 | 0 | 0 | 0 |
| punto + `estado = implementado` | 0 | 0 | 0 | 0 |
| **recorte por las 2 campañas del temario** | 2.562.104 | **894.337** | 6.964.100 | 10.420.541 |
| **el equipo publica** | 2.167.036 | **905.782** | 3.415.037 | 6.487.855 |

⭐ **Y hay dos señales fuertes que conviene no perder:**

1. **El recorte por temario acerca muchísimo a Google —894.337 contra 905.782, −1,3 %—** y a Meta a
   +18 %. **Programmatic queda al doble.** O sea que el temario **es** la dirección correcta y algo
   más recorta a Programmatic.
2. ⭐⭐ **La lámina de campaña del equipo SÍ reproduce.** Su deck publica, para la campaña del narco,
   `Meta 1.026.469 · Google 447.121 · Programmatic 3.035.525 · TOTAL 4.509.115`; el fixture da
   **4.721.383** para esa cuenta — **+4,7 %, dentro del ±10 %**. **A nivel campaña la definición del
   motor y la del equipo coinciden.** Lo que no coincide es el **agregado semanal**.

⚠ **La desproporción dice dónde mirar:** el equipo publica **10 filas** de Programmatic contra 15
del fixture (1,5×) pero **3,4 M de impresiones contra 25,6 M (7,5×)**. Si sólo faltaran filas, los
dos ratios se parecerían. **No faltan filas: sobran filas de mucho volumen.**

⛔ **No se siguió probando definiciones**, y es deliberado: adivinar hasta que un número dé es cómo
se llega a un número correcto por el camino equivocado. Va como pregunta al equipo, abajo.

ⓘ **Predicción verificable, del punto 2:** cuando los ocho `camp_*` publiquen por cuenta —el
arreglo de `c50984b`, ya pusheado— **la lámina de campaña destacada del motor debería dar los
números del equipo**. Si no los da, el problema no es el recorte sino la lectura, y eso es otro
trabajo.

### ⛔ P0 · `looker/DIGITAL` guarda el ACUMULADO de la campaña, no lo de la semana — y el rótulo dice «de la semana» (22/08/2026)

**Anotado, no arreglado.** Es el diagnóstico completo de Programmatic, y **no se arregla con una
operación ni con un filtro**: el dato semanal **no existe en la base**.

**El hecho, dicho por el usuario el 22/08 y verificado sobre el fixture:** en `looker/DIGITAL` **la
fila se actualiza; no se agregan filas**. Para las dos campañas del temario de `agosto_14_20` hay
**una sola fila por (cuenta, plataforma)** —7 filas para las dos campañas— y su columna
`Impresiones` es el **acumulado desde que la campaña arrancó**.

⭐⭐ **El número que lo prueba, y es una resta.** El Resumen Ejecutivo del equipo publica
`Programmatic 3.415.037` para JM, y su propia lámina de la campaña del narco publica `3.035.525`.
**Lo que aporta Autódromo es 3.415.037 − 3.035.525 = 379.512.** Y la fila de `DIGITAL` de Autódromo
en DV360 dice **3.756.321**.

| campaña · plataforma | arrancó | fila de `DIGITAL` (acumulado) | lo que el equipo le atribuye | factor |
|---|---|---|---|---|
| Autódromo · **DV360** | **6/08** | 3.756.321 | **379.512** | ⛔ **9,9×** |
| Autódromo · Google ads | 6/08 | 436.601 | 458.661 | ✅ **1,05×** |
| Autódromo · Meta | 6/08 | 1.506.236 | 1.140.567 | 0,76× |

⭐ **Y encaja exactamente con «la fila se actualiza»:** Autódromo arrancó **ocho días antes** de la
ventana, así que su fila de DV360 trae ocho días de acumulado que **no son de esta semana**.
Google, que casi no acumuló antes, **cierra al 5 %**. La plataforma que más se pasa es la que más
volumen acumula, no la que está peor leída.

⭐ **Y la contraprueba, que es la que cierra el caso:** la campaña del narco arrancó el **10/08**,
sólo cuatro días antes, y **su lámina reproduce plataforma por plataforma**:

| plataforma | equipo | fixture | |
|---|---|---|---|
| Meta | 1.026.469 | 1.055.868 | ✅ +2,9 % |
| Google/YouTube | 447.121 | 457.736 | ✅ +2,4 % |
| Programmatic (DV360) | 3.035.525 | 3.207.779 | ✅ +5,7 % |
| **TOTAL** | **4.509.115** | **4.721.383** | ✅ **+4,7 %** |

**A menos acumulado previo, mejor cierra.** Es la misma variable explicando los dos casos.

---

⛔ **Y lo que hace que esto sea P0 y no un cableado más: el dato semanal no está en ninguna solapa
del fixture.**

- `looker/DIGITAL` — una fila por campaña × plataforma, **sin ninguna columna temporal propia**
  (`SOLAPAS.ventana_ref = 'Cuentas'` justamente porque no la tiene).
- `digital/CAMPAÑAS_DESGLOCE_DIGITAL` — grano campaña × plataforma × **MES** (`Año`, `Mes`), **7
  filas** para las dos campañas. Es más fino que `DIGITAL`, y **sigue sin ser semanal**.

**Entonces ninguna operación arregla esto.** `SUMA`, `ULTIMO`, un filtro nuevo, otra dimensión: todo
devuelve el mismo acumulado. **No es que el motor lea mal: es que la pregunta que el rótulo hace no
tiene respuesta en el dato.**

⭐ **La regla que esto merece, y que hoy no está escrita en ningún lado:**

> **Una `SUMA` sobre una base cuyas filas se ACTUALIZAN en el lugar devuelve el acumulado, no el
> período — y ningún recorte por ventana lo arregla.** El recorte elige **qué filas** entran; no
> puede recortar **lo que hay adentro de una fila**. Cuando el rótulo dice *"de la semana"* y la
> fila dice *"desde que arrancó"*, el número es grande, plausible y de otra pregunta.
>
> **Cómo se reconoce, antes de cablear:** ¿la base agrega una fila por evento, o actualiza una fila
> por entidad? `digital/Directa Mail` es lo primero —una fila por envío, con su fecha— y por eso
> **reproduce exacto**. `looker/DIGITAL` es lo segundo, y por eso no.

**Va a `docs/REGLAS_NEGOCIO.md` como `R-NN` si el usuario lo decide** — acá queda el hallazgo con
la medición, no la regla.

**Tres salidas, sin elegir:**

- **(a) Pedirle al equipo el dato semanal.** Es la única que hace el número correcto. Va con la
  pregunta 2 de *"Preguntas al equipo"*.
- **(b) Cambiar el rótulo**, y que el Resumen diga *"acumulado de las campañas de la semana"*. El
  número que el motor publica **ya es correcto para esa pregunta** — 28.988.260 es de verdad el
  acumulado. Es la salida barata y **es una decisión editorial del usuario**.
- **(c) Publicar `/////`** hasta que exista el dato. Honesto y cuesta una celda, pero pierde
  información que hoy sí sirve para otra cosa.

⚠ **Lo que NO es salida: seguir buscando la operación correcta.** No la hay.

### ⭐ El Call Center del Resumen sale de `looker/CC`, que ya es `fuente` y **no la lee nadie** (22/08/2026)

**Anotado, no cableado.** Sale de buscar de dónde salen los tres `/////` del Resumen Ejecutivo, por
la corazonada del usuario del 22/08 —*"de algún lado sale y creo que ya lo habíamos calculado"*—.

**La solapa existe, está registrada y tiene los datos:**

```
SOLAPAS · looker/CC · uso = fuente · 1.317 filas · origen = seed
firma: ID Cuentas · Base enviada · Base barrida · Contactados · Efectivos · Tipo de llamado
notas: "detalle por canal, con ID cuentas"
```

⛔ **Y ningún marcador la lee.** Los tres casilleros del Resumen —«N campañas de Call Center», «Base
discada», «Contactados»— salen `/////`, que significa exactamente eso: **nadie lo cableó**.

> # ⛔⛔ CORREGIDO EL 22/08/2026, MISMO DÍA — LA MEDICIÓN DE ABAJO SALIÓ DE UNA CUENTA DE JUNIO
>
> **La tabla tachada midió `3289-JUNJDGAG`** —`JUN`, la cuenta de *Primera Persona* del 27/07—
> **contra un deck publicado de agosto**. Sus cuatro números son, textualmente, los que `V-92` ya
> tenía medidos sobre el export del 31/07: `6.673 / 6.011 / 1.878 / 1.661`.
>
> **La cuenta que corresponde a la ventana 14–20/08 es `3488-AGOJDGAG`**, y tiene **tres** filas
> —que son las «3 campañas de Call Center» del equipo, contadas exacto:
>
> | `3488-AGOJDGAG` | `Base enviada` | `Base barrida` | `Contactados` | `Efectivos` |
> |---|---|---|---|---|
> | Convocatoria | 6.000 | 6.000 | 1.249 | 1.043 |
> | Reconfirmación | 802 | 802 | 348 | 338 |
> | IVR convocatoria | 294 | 294 | 113 | 103 |
> | **suma de las tres** | **7.096** | **7.096** | **1.710** | **1.484** |
>
> | casillero | esperado | el equipo | |
> |---|---|---|---|
> | «N campañas» | **3** | 3 | ✅ **exacto** |
> | «Base discada» | 7.096 | 6.851 | **+3,6 %** |
> | «Contactados» | 1.710 | 1.616 (24 %) | **+5,8 %** |
>
> ⭐ **Y el hallazgo de definición queda AL REVÉS de como estaba escrito: «Base discada» es
> `Base barrida`, no `Base enviada`.** No lo decide agosto —en `3488` **las dos columnas son
> idénticas**, así que esa cuenta no puede distinguirlas—: lo deciden los tres casos que el repo
> ya tenía, medidos sobre la única cuenta donde difieren.
>
> | | dice |
> |---|---|
> | `V-64` | `cc_base` = **6.011** = `Base barrida` sobre `3289`. Con `Base enviada` daría 6.673 |
> | `V-66` | `cc_contact_pct` publicado **31 %** = `1878/6011`. Con `Base enviada`: `1878/6673` = **28 %** |
> | `V-92` | el Resumen **no filtra por tipo**; las dos filas de `3289` publican `6.011` y `1.878` |
>
> ⛔ **`V-66` es un discriminador limpio y estaba escrito para esto** —*"el porcentaje no se deriva
> del otro número publicado"*—. **Existía desde el 19/08 y no lo miré.** `CLAUDE.md` §1 manda leer
> los casos validados antes de medir; ésta es la regla que yo mismo escribí hoy, incumplida el
> mismo día.
>
> ⭐⭐ **Y lo que tendría que haber frenado esto sin necesidad de `V-66`, porque estaba en la tabla
> misma: las dos columnas se movían en direcciones OPUESTAS.** `Base enviada` −2,6 % y
> `Contactados` +16 % entre las mismas dos fechas, sobre la misma solapa. **Dos columnas del mismo
> hecho que divergen de signo no son «la base se movió»: son las filas equivocadas.** La nota de
> abajo lo vio y lo explicó con `R-29` en vez de tratarlo como la señal que era — **una explicación
> plausible tapó una contradicción**. Con la cuenta correcta los dos van **+3,6 % y +5,8 %**: mismo
> signo, misma magnitud, una solapa de estado que acumula. Eso sí es la base moviéndose.
>
> ⚠ **El control de cableado NO es ninguno de estos números**, y es el corolario práctico: 7.096 y
> 1.710 son contra una base que sigue creciendo. **El control es el deck del 31/07**, donde `V-64`
> y `V-92` dan `6.011` y `1.878` **exacto** contra lo publicado.
>
> **Lo que sí queda en pie de la nota de abajo:** que `looker/CC` es `fuente`, que **ningún**
> marcador la lee, que `MAPEO` no tiene ni una fila suya, y que los casilleros salen `/////`.

~~**Lo medido contra el fixture, ventana 14–20/08, ámbito JM:**~~

| | ~~fixture `looker/CC`~~ | ~~el equipo~~ | |
|---|---|---|---|
| ~~filas~~ | ~~2~~ | ~~«**3** campañas de Call Center»~~ | |
| ~~**`Base enviada`**~~ | ~~**6.673**~~ | ~~**«Base discada» 6.851**~~ | ~~−2,6 %~~ |
| ~~`Base barrida`~~ | ~~6.011~~ | ~~—~~ | ~~−12 % contra el mismo casillero~~ |
| ~~`Contactados`~~ | ~~1.878~~ | ~~1.616 (24 %)~~ | ~~+16 %~~ |
| ~~`Efectivos`~~ | ~~1.661~~ | ~~—~~ | |

~~⭐⭐ **Y el hallazgo de definición, que es lo accionable: «Base discada» del equipo es
`Base enviada`, NO `Base barrida`.** Los nombres invitan a lo contrario —*discada* suena a
*barrida*— y elegir mal da un número **12 % abajo, plausible y sin nada que lo delate**. Con
`Base enviada` cierra a −2,6 %.~~

~~⚠ **`Contactados` queda +16 % y no se fuerza.** Cae bajo `R-29`: `looker/CC` **no tiene fecha
propia** —toma la ventana de `Cuentas` por pertenencia— así que es una solapa **de estado**, y sus
dos filas JM traen el acumulado de campañas que arrancaron antes. Que `Base enviada` cierre y
`Contactados` no es coherente con eso: la base se envía una vez al arrancar y los contactos siguen
sumando.~~

~~**Lo que hace falta para cablearlo, y no entra acá:** las tres filas de `MARCADORES`
—`CONTEO` de filas para las campañas, `SUMA` de `Base enviada`, `SUMA` de `Contactados`— más las
filas de `MAPEO` de esa solapa, que **hoy no tiene ninguna**.~~ **Son cuatro, no tres — medido en
la Parte 0 del `_27`, abajo.**

### ⛔ Parte 0 del `_27` — el Call Center son CUATRO celdas, y el token que el prompt pone como control no existe (22/08/2026)

**Sólo lectura. La Parte B del `_27` no se ejecutó**: su control nombra un token que no es lo que
el prompt cree, y su número esperado es el de la cuenta de junio que se corrige arriba.

**1 · Son cuatro casilleros, no tres.** Medido sobre el testigo `2026-08-22 1402`:

| token | en el deck | el equipo publica |
|---|---|---|
| `cc_campanias` | `///// campañas de Call Center` | **3** |
| `cc_base` | `Base discada: /////` | **6.851** |
| `cc_contactados` | `Contactados: /////` | **1.616** |
| `cc_contact_pct` | `(/////%)` | **24 %** |

⚠ **Y el cuarto no es decorativo: es el que decide la definición.** `V-66` usa exactamente ese
porcentaje para separar `Base barrida` de `Base enviada`. Dejarlo sin cablear saca del deck el
único control que se verifica solo.

**2 · ⛔ `cc_base_total` no es un token del Resumen — es un `campo_logico` de `reuniones/Agenda
JM`.** El prompt lo pone como control (*"`cc_base_total` da 6.673"*) y en `MARCADORES` es la
columna que lee **`enc_base_total`**, de la lámina del iceberg, cableada desde el `_44` (12/08).
**Son dos láminas distintas y dos fuentes distintas** — `looker/CC` contra `reuniones/Agenda JM`.
Un control escrito contra el token equivocado habría dado verde sobre trabajo ya hecho.

**3 · `cc_base`, `cc_contactados` y `cc_contact_pct` viven en DOS láminas**, no en una:
`TOKENS.md` los lista en la 2 (Resumen Ejecutivo JM) **y en la 5** (ECV alcance semanal). Cablear
uno pinta las dos. ⚠ **Antes de escribir la fila hay que decidir si son el mismo universo**: los
casos `V-64`/`V-66`/`V-92` están etiquetados `resumen_ejecutivo_jm` y **ninguno mide la lámina 5**.
Es la pregunta de *"¿de qué filas sale?"* de `CLAUDE.md` §4, en el momento en que se hace barata.

**4 · `MAPEO` para `looker/CC`: cero filas, confirmado.** `looker` sólo tiene
`resumen_metricas_dinamico` (27), `DIGITAL` (5) y `Cuentas` (3).

**5 · La forma se copia de `looker/DIGITAL`, que anda, y el mecanismo es el `_23`:** la solapa
**no tiene fecha propia** y toma la ventana por **pertenencia**, declarando `clave_ventana` sobre
su columna de cuenta. `DIGITAL` lo hace con `Id cuentas` (col. A) contra `Cuentas.fecha_inicio` /
`fecha_fin`. `CC` necesita lo mismo sobre `ID Cuentas` (col. A), más las cuatro columnas de
medida. **Firma verificada en el fixture del 20/08**, 1.338 filas de datos:

```
ID Cuentas · Base enviada · Base barrida · Contactados · Efectivos · Tipo de llamado
```

**6 · ✅ El freno del `0.4` NO se dispara: la columna `Tipo de llamado` existe.** Con los valores
que `S-01` y `V-91` nombran —`Convocatoria`, `IVR convocatoria`, `Reconfirmación`, `Informativo`,
`Cancelación`—. ⚠ **Verificado sobre el fixture, no sobre la planilla viva**: el fixture se bajó
el 20/08 de esa misma base, así que la columna existía ese día; que siga existiendo hoy no lo
prueba nadie desde acá.

⭐ **Y el recorte por tipo es al revés de lo que el prompt supone: el Resumen NO filtra.** `V-92`
lo dice y `3488` lo confirma —las «3 campañas» son las **tres** filas, `Reconfirmación` incluida—.
El filtro `Convocatoria + IVR convocatoria` de `V-91`/`S-01` es de la **lámina del iceberg**, que
es otra. **Aplicarlo al Resumen daría 6.294 en vez de 7.096**: plausible, y mal.

---

### ⚠ Y una distinción que hay que escribir: hay dos clases de `uso = ignorar` y `CLAUDE.md` §2 sólo describe una

**Anotado, no arreglado.** Apareció al buscar lo de arriba, con el usuario pidiendo expresamente
mirar las solapas en `ignorar`.

`CLAUDE.md` §2 dice: *"Una solapa con `uso = 'ignorar'` no se toca nunca… **ya se decidieron**. Son
pivots, backups, copias de trabajo y duplicados — el caso `digital/RDV` duplica la base `rdv` y
leerla produce doble conteo. **Auditarlas es tiempo perdido y, peor, reabre discusiones
cerradas**"*.

⛔ **Eso describe una clase. Hay otra, y su nota lo dice con todas las letras:**

| solapa | filas | nota registrada |
|---|---|---|
| `looker/MAIL` | 5.864 | *"R-22 (09/08): **sin columna de fecha y sin fila en MAPEO** → ilegible para el motor"* |
| `looker/IVR` | 195 | ídem |
| `looker/SMS` | 97 | ídem |
| `looker/ALCANCE` | 776 | ídem |

**Ésas no son duplicados ni copias de trabajo: son solapas con datos reales que el motor no puede
leer todavía.** `ignorar` ahí no significa *"ya se decidió que no va"*, significa *"no se puede
leer con lo que hay hoy"* — y **son dos estados distintos que comparten valor**.

⚠ **El costo de que compartan valor es el que se pagó hoy:** buscar de dónde sale un número obliga a
saltear la regla, y saltearla es exactamente lo que la regla existe para evitar. **La regla es
buena; el vocabulario es el que no alcanza.**

**Dos salidas, sin elegir:** **(a)** un valor nuevo —`ilegible`, `sin_mapeo`— que separe *"decidido
que no"* de *"no se puede todavía"*; **(b)** dejar `ignorar` y que la regla de `CLAUDE.md` §2 diga
que **la nota manda** sobre por qué está ignorada. La (b) no toca ninguna hoja y ya es medio cierta
—las notas ya lo dicen—; la (a) lo hace verificable.

ⓘ **Y el resultado de haber mirado, para que no se pierda:** de las cuatro, ninguna resuelve el
Resumen. `looker/SMS` e `IVR` **no tienen una sola fila JM** en la ventana —o sea que el `0 campañas
de IVR` y los `-` que publica el motor para JM **son correctos**— y del lado GCBA dan acumulados que
no reproducen. **La que tenía la respuesta era `looker/CC`, que no está en `ignorar`: está en
`fuente` y sin leer.**

### ⛔ Corrección del 22/08: el fixture NO está desactualizado para GCBA

**Dicho el mismo día y antes de que nadie lo citara.** Este documento y el addendum del reporte de
validación afirmaron que *"para GCBA el fixture está desactualizado"*, porque da **61 envíos** de
mail contra los **73** que publica el equipo, y **−12,8 %** en entregados.

⛔ **Es falso. Dato del usuario, 22/08: GCBA se hace el jueves**, así que el export del 20/08 tiene
la semana completa. **El fixture está bien y la diferencia es real.**

⭐ **Y la conclusión correcta es más útil que la equivocada:** si el fixture está bien, la
diferencia de 61 contra 73 **no se resuelve esperando un export más fresco** — hay que buscarla en
el dato. Queda abierta, y `R-29` da la primera pista: puede que el equipo cuente envíos de una
solapa distinta de `digital/Directa Mail`.

⚠ **El error de método fue el de siempre:** *
tomé la explicación cómoda —la fecha del export— sin verificarla contra cómo trabaja el equipo. Es
la misma forma que `CLAUDE.md` §4 nombra para el número plausible, en la capa del diagnóstico.

### ⭐ Las 41 filas listadas: una campaña genérica de siete meses aporta 15,4 M de los 25,6 M (22/08/2026)

**Anotado, y es lo que hizo ampliar la marca de `_revisar` de dos marcadores a ocho.** Sale de
listar —en vez de sumar— las filas que el motor agrega para `imp_*` de JM sobre el fixture.

| cuenta | campaña | ventana de `Cuentas` | aporta |
|---|---|---|---|
| **`2976-MAYPCCVC`** | *Campañas genéricas RDV JM* | **`04/06 → 31/12`** | **15,4 M** en 4 filas de DV360 |
| `3289-JUNJDGAG` | *Primera Persona · Paula Pareto 27/7* | `17/07 → 20/08` | 5,8 M |
| las otras 5 | 1 a 1 de agosto, Mail Infraestructura | dentro o cerca | el resto |

⭐ **Una campaña genérica de siete meses solapa CUALQUIER semana del año.** Entra por `R-29` —la
fila trae el acumulado y el solape la deja pasar— y **entra en las tres plataformas por el mismo
camino**. De los 25,6 M de Programmatic, sólo **~3,5 M** salen de campañas que arrancaron cerca de
la ventana; el equipo publica **3.415.037**.

⛔ **Por eso marcar sólo Programmatic era peor que no marcar nada:** habría dicho que Meta y Google
están bien, y es el mismo acumulado repartido en tres columnas. **Un marcado parcial sobre una causa
común declara confianza donde no la hay.** Los ocho `imp_*` quedan en `_revisar`.

⚠ **Y una corrección de método que sale de acá y ya está aplicada en `R-29`:** el chequeo *"¿se
repite la clave?"* que la regla proponía **no sirve**. Lo medí sobre las dos campañas del temario
—una fila por `(cuenta, plataforma)`— y lo generalicé; al listar el conjunto hay **845 pares
repetidos de 1.451**, y `2976-MAYPCCVC` tiene cuatro filas de DV360. **Generalizar desde el
subconjunto que uno está mirando era el error, no el criterio.**

ⓘ **Y un aviso sobre mi propia reproducción, que hay que tener presente al comparar:** mi filtro de
`ambito=jm` es `nombre_campaña` **contiene** `"jm"` en minúsculas, y da **4.310.676** de Meta contra
los **2.772.141** que publica el motor —1,55×—. Programmatic coincide al 3 %. **Ahí gana el motor**
(`CLAUDE.md` §4: cuando la medición propia reimplementa lógica del motor y lo contradice, la primera
hipótesis es que la medición está mal). El `~=` del motor puede comparar distinto; **no está medido
y no se afirma**.

### ⛔⛔ `X-28` NO cierra, y el motivo de fondo es que **el tercer fixture no existe** (22/08/2026)

**Se pidió cerrarlo contra tres períodos. Hay dos.** `Seguimiento Digital2026-08-06.zip` **no trae
`Base Looker.xlsx` ni deck de JM** —sólo `Seguimiento SECCO - SSCDI (07-08).pptx`—, y `CC` no está
en ninguno de sus tres libros (verificado hoja por hoja). `looker/CC` vive **sólo** en los dos
`Base Looker`, y decks del equipo de `jm` hay **dos**.

⚠ **Y el límite es de decks, no de bases.** Del export del 20/08 se puede leer cualquier ventana,
pero eso no da un tercer **valor publicado** contra el cual comparar — que es la mitad que falta.

**Las dos parejas (ventana → publicado) que sí existen:**

| | ventana | candidatas con filas en `CC` | publicó |
|---|---|---|---|
| deck 31/07 | 24–31/07 | **18** | `3289-JUNJDGAG` · 2 filas · 6.011 |
| deck 20/08 | 14–20/08 | **21** | `3488-AGOJDGAG` · 3 filas · 6.851 |

#### El barrido, corrido a ciegas: **0 de 13 propiedades simples aciertan en los dos**

Las trece se declararon **antes** de mirar el resultado, y ninguna sola alcanza:

| falla | por qué |
|---|---|
| más filas en `CC` | julio elige `3387-JULJDGGC` (3 filas) |
| mayor `Base barrida` | los dos períodos eligen `3144-JUNSALGC` (41.620 / 52.240) |
| `fecha_fin` más reciente | los dos eligen `2322-NOVEDUGC` |
| `nombre_campaña` contiene «JM» | agosto elige `3289`, la cuenta de junio |
| ⭐ **`*JDGAG`** | julio ✅ acierta solo · **agosto da DOS**: `3289` **y** `3488` |

⭐⭐ **`JDGAG` es el candidato fuerte, y hay un dato que lo dice sin ambigüedad: aparece en las 21
reglas que sobreviven** —3 de 78 pares y 18 de 286 ternas—. **Ninguna regla sobreviviente prescinde
de él.**

⛔ **Pero lo único que le falta a `JDGAG` para cerrar solo es excluir a `3289` en agosto — y `3289`
está ahí por la deriva de `fecha_fin`** (entrada de abajo). O sea: **el desempate lo fuerza un
artefacto del dato, no el negocio.**

⛔⛔ **Y por eso no se escribe ninguna regla: los tres desempates empatan.** `Finalizada`,
`duración ≤ 30 d` y `duración ≤ 14 d` aciertan **los dos períodos por igual**, y **dos períodos no
los pueden separar**. Elegir uno sería exactamente lo que el prompt prohíbe — *la regla tiene que
decir qué cuenta se toma antes de mirar el resultado*.

⚠ **Un aviso más sobre `JDGAG`, para que no se lea más fuerte de lo que es:** hay **124 cuentas
`JDGAG` con filas en `CC`** en la solapa. No es una etiqueta rara que señale al encuentro de la
semana: es la familia de Jefatura de Gabinete, y **lo que la recorta a una es la ventana**. Además
`3354-JULJDGAG` y `3346-JULJDGAG` —los «1 a 1» de San Cristóbal y Retiro— **también son `JDGAG`**, y
sólo no compiten porque no tienen filas en `CC`. **Una semana en que un «1 a 1» tenga filas rompe la
regla**, y eso no está descartado por nada.

**Qué haría falta para cerrarlo, en orden de costo:**

1. ⭐ **Un tercer deck de `jm` del equipo con su `Base Looker` del mismo día.** Es lo único que
   separa los tres desempates. **Un `.zip` más y esto se cierra o se cae.**
2. Que el equipo conteste `X-28` directamente — sigue en *"Preguntas al equipo"*.

---

### ⛔⛔ La `fecha_fin` de una cuenta SE EXTIENDE SOLA, y eso afecta a TODO lo que use `ventana_ref: 'Cuentas'` (22/08/2026)

**Medido comparando `looker/Cuentas` entre los dos fixtures**, 959 cuentas comunes:

| | |
|---|---|
| `fecha_fin` cambiada | **28 de 959** (2,9 %) — **27 se extendieron**, 1 se acortó |
| días extendidos | mín **1** · mediana **21** · máx **157** |
| `fecha_inicio` cambiada | 1 |

⭐ **El 2,9 % engaña: lo que importa no es cuántas cambian, sino a cuántas ventanas las meten.**

| ventana | con las fechas **viejas** | con las **nuevas** | entran **sólo por la deriva** |
|---|---|---|---|
| **14–20/08** | 14 cuentas | **32** | ⛔ **18** — **+129 %** |
| 24–31/07 | 90 | 98 | 8 |

⛔⛔ **Y la que más se extendió es exactamente la que ya teníamos identificada como culpable del
sobreconteo de `imp_*`:**

```
2976-MAYPCCVC · «Campañas genéricias RDV JM» · 27/07 → 31/12  (+157 días)
```

⭐⭐ **Eso conecta dos hallazgos que veníamos tratando como separados.** La entrada de más arriba
dice que `2976-MAYPCCVC` aporta **15,4 M de los 25,6 M** de Programmatic y **entra por las tres
plataformas**; lo que faltaba era **cómo entra**, y es esto: **su ventana se estiró hasta fin de
año, así que solapa cualquier semana**. `A-06` y `A-07` —los `+15,6 %` y `+15,4 %` **por encima**
sobre una foto **anterior**, que por `C-25` no se explican por el desfasaje— **tienen acá su
mecanismo**.

**Por qué es más grande que el Call Center:** hoy `ventana_ref: 'Cuentas'` lo usan **`looker/DIGITAL`
y `looker/CC`**, y son las fuentes de **los ocho `imp_*`, los cuatro `cc_*` y los `gcba_*`
equivalentes**. **Todos comparten el mismo mecanismo de recorte, y todos heredan la deriva.**

⚠ **Lo que hace caro este modo de falla es que no rompe nada: agranda.** Una cuenta que no debería
estar suma sus filas y el total sube; el número sigue siendo un número, con su formato y su celda.
**Es el número plausible de `CLAUDE.md` §4, producido por el dato en vez de por el código** — y por
eso ninguna verificación del motor lo puede ver: el motor está haciendo exactamente lo que se le
pidió.

⚠⚠ **Y la trampa de método, que ya cobró una vez hoy:** una medición de pertenencia **no es
reproducible sin decir de qué export salieron las fechas**. La misma ventana sobre el mismo `CC`
da **14 o 32 cuentas** según qué `Cuentas` se use. Es `CLAUDE.md` §4 —*un fixture es una foto
fechada y su fecha es parte del resultado*— con un agravante: acá **la foto que cambia no es la de
los datos, es la del recorte**.

**Anotado, no arreglado.** Tres salidas, ninguna elegida y todas del usuario:
**(a)** congelar la ventana de una cuenta la primera vez que se la ve —haría falta dónde guardarlo—;
**(b)** acotar la duración máxima de una cuenta para que entre a una ventana semanal;
**(c)** declararlo aceptado y marcar `_revisar` todo lo que dependa de `ventana_ref`.

#### ⭐ La medición que pedía la decisión (22/08, tarde): **de las 27, 17 MOVIERON y 10 quedaron quietas**

**El criterio, declarado antes de medir:** si la cuenta tiene **filas nuevas o valores que
crecieron** entre los dos exports, la campaña siguió de verdad y **congelarla la cortaría mal**. Si
los datos están quietos y sólo se movió la fecha, es **deriva pura**.

| | |
|---|---|
| **movieron** — extensión real | **17** |
| **quietas** — deriva pura | **10** |

⚠ **Pero las 10 quietas no son diez: son dos.** **Ocho de ellas tienen CERO filas en las dos fotos**
—`2482`, `1942`, `1943`, `1946`, `1964`, `2033`, `2994`, `3369`—, así que **congelarlas no cambia
ningún número**: no aportan nada por ninguno de los dos caminos. **Las únicas dos deriva-pura con
datos** son `2145-OCTVINGC` (15 filas / 2.352.745, idénticas) y `3418-JULDECVC` (1 fila / 330.012).

⛔⛔ **Y el resultado que decide, porque tumba a (a) por su propio caso: `2976-MAYPCCVC` MOVIÓ.**

```
2976-MAYPCCVC · «Campañas genéricias RDV JM» · 27/07 → 31/12 (+157 d)
DIGITAL: 10 filas / 30.714.053  →  10 filas / 15.724.289     ⇒ MOVIÓ
```

**La cuenta que motivó todo `X-29` no es deriva: es una campaña genérica que corre de verdad hasta
fin de año** —210 días de duración declarada—. **Congelarla al primer avistaje daría el número
correcto por casualidad**, y el resultado pasaría a depender de **cuándo se vio la cuenta por
primera vez**, que no es una propiedad del negocio.

⭐ **El balance de (a), en una línea: beneficia a 2, perjudica a 17, y no arregla el caso que la
motivó.**

#### Lo que hace (b), medido sobre la misma ventana

Ventana **14–20/08**, 73 cuentas con filas en `DIGITAL`:

| tope | quedan | deja afuera (top por impresiones) |
|---|---|---|
| ≤ 14 d | 37 | `2961` (332,6 M) · `3197` (49,9 M) · `3305` (44,5 M) |
| ⭐ **≤ 30 d** | **51** | ídem, **y `2976`** |
| ≤ 90 d | 61 | `2961` · `2322` (38,4 M) |
| sin tope | 73 | — |

**Las duraciones que importan:**

| cuenta | duración | |
|---|---|---|
| `2976-MAYPCCVC` | **210 d** | la del sobreconteo — cae con cualquier tope ≤ 180 d |
| `3289-JUNJDGAG` | **34 d** | cae con ≤ 30 d |
| ⭐ **`3488-AGOJDGAG`** | **7 d** | **el encuentro real: sobrevive a cualquier tope** |

⭐⭐ **Y una convergencia que hay que anotar sin sobrevenderla:** un tope de **30 días** deja afuera
a `2976` **y** a `3289` en agosto, y conserva a `3488`. **`3289` en agosto es exactamente lo que le
faltaba a `JDGAG` para cerrar `X-28`** — o sea que **una sola decisión destrabaría los dos**.
⚠ **Pero `duración ≤ 30 d` era uno de los tres desempates que `X-28` no pudo separar**, así que
esto **no es evidencia de que 30 sea el número**: es una razón más para conseguir el tercer `.zip`.

⚠ **Lo que (b) rompe, y hay que decirlo:** una campaña larga **legítima** deja de contar. Con ≤ 30 d
son **22 de 73 cuentas** las que salen. Si el negocio dice *"la semana muestra lo que corrió esa
semana"*, eso es correcto; si dice *"muestra todo lo vigente"*, es un recorte que falta información.

**⛔ Nada implementado** (instrucción del usuario): esto mide, y la elección entre (a), (b) y (c) es
suya.

---

### ⛔ CORRECCIÓN (22/08/2026, del usuario) — son DOS problemas distintos con el mismo síntoma, y arriba estaban mezclados

**Lo de arriba habla del Resumen y arrastraba el «1 a 1» con la misma frase.** No es lo mismo, y
mezclarlos manda a buscar una causa común que no existe.

| | qué le pasa | evidencia |
|---|---|---|
| **el «1 a 1»** (`u1_*`) | ⛔ **un agujero de FUENTE, y sólo en Programmatic** | `X-05` · `C-57` |
| **el Resumen** (`imp_*`) | ⛔ **un universo DEMASIADO ANCHO, en los tres** | `A-06` · `A-07` · `C-25` |

**1 · En el «1 a 1» los otros dos están EXACTOS, y eso hay que decirlo.**

| caso | token | valor | |
|---|---|---|---|
| `V-21` | `u1_google_impresiones` | **17.401** | ✅ `exacto` |
| `V-23` | `u1_meta_impresiones` (San Cristóbal pre) | **25.099** | ✅ `exacto` |
| `V-25` | `u1_meta_impresiones` (Retiro pre) | **18.015** | ✅ `exacto` |

⛔ **El único sin fuente es `u1_prog_impresiones`:** los **94.955** del **POST de San Cristóbal**.
`C-57` lo cerró con búsqueda exhaustiva — **no aparecen en ninguna celda numérica de los siete
libros de los dos fixtures**, ni en la base de reuniones nueva. **No es un universo mal recortado:
el número no está en ningún lado.** Es `X-05`, `sin_fuente`.

**2 · En el Resumen fallan los tres, y la evidencia es de otra clase.**

`A-06` da **614.140** de Google contra los 531.403 publicados —**+15,6 %**— y `A-07` **5.992.841**
contra 5.194.898 —**+15,4 %**—, los dos **sobre un fixture ANTERIOR al deck**.

⭐ **Y eso es lo que lo convierte en diagnóstico y no en observación**, vía `C-25`: el fixture es
anterior, así que toda métrica **acumulativa** medida sobre él tiene que dar **menor o igual** que
lo publicado. **Un valor MAYOR no se explica por el desfasaje.** Es universo, no tiempo.

**3 · Por qué los ocho siguen marcados igual, que es la parte que NO cambia.**

La causa del Resumen es **común a las tres columnas**: `2976-MAYPCCVC` —*Campañas genéricas RDV JM*,
`04/06 → 31/12`— **entra por las tres**, y una campaña genérica de siete meses solapa cualquier
semana del año.

⛔ **Desmarcar Meta y Google diría que el Resumen está bien, y no lo está.** El marcado no es por
plataforma: es por **el universo del que salen las tres**. Los ocho `imp_*` quedan en
`_revisar`.

⚠ **Lo accionable, y son dos trabajos que no se tocan:** el «1 a 1» necesita que **aparezca una
fuente** para el POST de Programmatic —o que se acepte que no la hay—; el Resumen necesita que **se
recorte el universo**. Ninguno de los dos arregla al otro, y **el mismo `/////` o el mismo `_revisar`
en los dos esconde esa diferencia** — es la familia del símbolo que no distingue *«no se cableó»* de
*«no se llegó»* (`CLAUDE.md` §4).

### ✅ ~~P0 · `unirDigitalPorCuenta` cuesta ≥325 s con la ventana de julio~~ — **FALSO POSITIVO, cerrado el 22/08/2026**

> ⛔ **Cerrado el mismo día, y el motivo es de método: el instrumento corría sin las cachés que
> `generarInforme` enciende.** No había ningún problema de escala.
>
> | qué corrió | etapa 3 | `unirDigitalPorCuenta` | total |
> |---|---|---|---|
> | sin ninguna caché | 49 s | ⛔ ≥325 s, muere | ⛔ ≥375 s |
> | con `cacheDatosHoja_` sola | 58 s | ⛔ 316 s, muere | ⛔ ≥375 s |
> | ⭐ **con las dos, como `generarInforme`** | **12 s** | **6 s** | ✅ **35 s** |
>
> **`unirDigitalPorCuenta` de 325 s a 6: un factor 54.** Y la etapa 3 de 49 a 12, con las llamadas
> 2 a 6 en **1-2 s** cada una — la primera paga 5 s y el resto son aciertos de caché.
>
> ⭐ **La que faltaba era `cacheRegistros_`, no la de datos**, porque `buscarMapeo` relee `SOLAPAS`
> y `MAPEO` enteras en cada llamada. Con `cacheDatosHoja_` sola **no cambió nada** (58 s contra 49).
>
> **La lección quedó en `CLAUDE.md` §4** y el `2026-08-22_28` —escrito para arreglar el problema
> inexistente— quedó **anulado antes de ejecutarse**.
>
> ⚠ **Lo que NO se cierra con esto:** que una corrida real con seis encuentros entre en el techo
> **sigue sin medirse**. Lo medido es que **el agregado por temario cuesta 35 s**, no que el deck
> completo salga. El testigo con dos encuentros tardó 192 s; con seis, nadie corrió todavía.

**El texto original, que es lo que se midió:**

### ⛔ ~~P0 · `unirDigitalPorCuenta` cuesta ≥325 s con la ventana de julio y 33 s con la de agosto — cualquier corrida de un temario grande muere~~ (22/08/2026)

**Medido, no estimado.** Sale de instrumentar `verificarAgregadoDeJulio()` después de que la
primera versión muriera en el muro sin dejar nada.

**El reparto del tiempo, corrida del 22/08 a las 16:07 sobre `julio_24_30`:**

| etapa | duró | |
|---|---|---|
| 1 · `resolverVentana` + 2 · `leerReuniones_` | **1 s** | 14 con `mostrar=sí`, **6** de julio sin `Agregado` |
| 3 · `encontrarFilaRdvDeReunion_` × 6 | **49 s** | 10 · 7 · 7 · 10 · 8 · 7 — **las 6 encontraron fila** |
| **4 · `unirDigitalPorCuenta`** | ⛔ **≥325 s** | **murió sin devolver**, a los 375 s del arranque |

⭐ **Y el contraste que lo vuelve P0, contra el testigo `jm-20260821-234927`:** ese deck se generó
**entero en 192 s** sobre `agosto_14_20`, y su rastro dice que **la etapa 1 —que incluye anclaje,
unión digital Y duplicación— duró 33 s**. **La misma unión cuesta 33 s con agosto y más de 325 con
julio: diez veces.**

⛔ **Entonces esto no es un problema del botón: es que una corrida de un período con temario grande
no entra en los seis minutos de Apps Script.** El desatendido tampoco lo salva — la unión es
**indivisible** y no se puede partir entre ejecuciones.

**Lo que la medición descartó, y hay que decirlo porque era la sospecha escrita:** que el costo
estuviera en `encontrarFilaRdvDeReunion_`. **El mecanismo sospechado es real** —cada reunión arma
una ventana de un día, `claveCacheLectura_` incluye las dos fechas, y por eso cada una paga una
lectura completa de `rdv`: se ve en los 7-10 s por reunión, uniformes—. **Pero 49 s de 270 no matan
nada.** La sospecha estaba escrita antes de medir justamente para que la medición pudiera
desmentirla, y la desmintió como causa.

⚠ **Y una limitación del instrumento, que es la lección del `2026-08-21_1` repitiéndose:** el freno
chequea el presupuesto **antes de cada etapa** y la etapa 4 **entró con 49 s de 270**, o sea con
toda la razón. *"No alcanza con un control «antes de entrar» a la etapa cara: si la etapa es
indivisible y se pasa sola, el control de la entrada la dejó pasar."* **El botón cortó bien y murió
igual** — y por eso el reporte de etapas no llegó a imprimirse.

**Lo que falta medir, y es el paso siguiente:** `unirDigitalPorCuenta` une **seis solapas de
`digital`** por cuenta. Hay que cronometrar **cada `leerFuente` por separado** con la ventana de
julio y con la de agosto, que es divisible y entra en el techo. Recién con eso se sabe si el costo
está en una solapa, en el recorte, o en el cruce.

⛔ **No se optimizó nada** (instrucción del usuario, 22/08): este paso mide y para.

⚠ **Y la consecuencia inmediata, que conviene tener a la vista antes de la próxima corrida:** el
temario de `agosto_14_20` tiene **2** encuentros y el de `julio_24_30` **6**. Si la semana que viene
entra un temario de cinco o seis, **el deck no va a salir** — y el síntoma va a ser el muro, que no
deja rastro.

### ⏸ `ecv_asistentes` sobre el temario da 485 y NO tiene caso: nace sin validar (22/08/2026)

**Anotado, no resuelto.** Sale de la Parte C.1 del `2026-08-22_25`, que sí reprodujo los dos
números que tenían caso.

| marcador | dio | esperado | |
|---|---|---|---|
| `ecv_inscriptos` | **2333** | 2333 (`V-71`) | ✅ reproduce |
| `ecv_encuentros` | **4** | 4 | ✅ reproduce |
| `ecv_barrios` | Belgrano · Retiro · San Cristóbal · Villa Urquiza | — | ⭐ **son los cuatro sumandos de `V-71`** |
| **`ecv_asistentes`** | **485** | ⛔ **ninguno** | ⏸ **sin validar** |

⚠ **`V-43` dice 497 y NO sirve como esperado**: mide la ventana de nueve días sobre `rdv`, no el
universo del temario — la misma trampa que anuló el cruce de `V-38`…`V-44` y que ya tiene su
advertencia en el CSV. **Compararlos sería restar dos universos distintos.**

⭐ **Y `ecv_barrios` es el control de identidad que faltaba**, por otra vía: lista exactamente los
cuatro encuentros que `V-71` declara —Belgrano es el barrio de *Orden Público*—, así que **el 2333
sale de las filas correctas** y no de un total que coincide por casualidad.

**Qué haría falta:** un caso propio para `ecv_asistentes` sobre el universo del temario. Hasta
entonces se publica —nadie declaró desconfianza— pero **nace sin validar, no validado**
(`CLAUDE.md` §1).

ⓘ **Y de paso, la corrida contestó la ambigüedad que el P1 de `sinLink` dejaba abierta para
julio:** el log dice **6 anclados · 0 baja confianza · 0 `sinLink`**, con scores de 0,81 y cinco
de 1,00. **Todos anclaron por encima del umbral.** La hoja `ANCLAJE_PENDIENTE` no podía decirlo
—por eso el P1 sigue abierto— pero **para este período ya está contestado**.

---

### P1 · `D-17` nombra dos funciones que no existen en ningún `.gs` (23/08/2026)

**La decisión sigue siendo correcta; lo que no está escrito es el mecanismo que describe.**

`D-17` (`docs/PLAN.md` §1) dice que las filas de `MARCADORES` *"se siembran leyendo los `{{token}}`
de las plantillas de Slides (**`sembrarMarcadoresDesdePlantillas`** + **`upsertSoloVacias_`**,
`Paso-2.5`)"*. **Ninguna de las dos existe.** Medido el 23/08 con
`grep -rniE "vacias|desdeplantilla" *.gs`: los únicos aciertos son `filas_vacias`, que es un
conteo informativo de `Fuentes.gs` y no tiene nada que ver.

⭐ **Lo que sí es cierto, y por eso la decisión no se toca:** la plantilla **es** la dueña en el
sentido que importa — decide **qué filas deberían existir**. Y `docs/ESCRITORES.md` lo dice bien:
*"sigue sin sembrador, y es a propósito"*, con el sembrador real *"en el `Paso-2.5`, **que todavía
no corrió**"*. Los escritores vivos son **tres**: `curarMarcadores_`, `curarCamposMarcadores_` y
`migrarCalculoAOperacion_`.

⚠ **El daño concreto, y es el que hay que anticipar:** alguien que lea `D-17` antes de dar un alta
va a suponer que **hay dos caminos escribiendo la misma fila** y va a frenar, o peor, va a esperar
a que el sembrador la escriba. **Pasó el 23/08**, con el alta de `camp_meta_frecuencia`: la
pregunta *"¿entra por el sembrador o hace falta alta a mano?"* costó una verificación entera, y la
respuesta es que **el alta a mano es el único camino y no se puede duplicar**.

⛔ **Es la tercera vez esta semana que un contrato afirmado sin testigo cuesta tiempo**, y las
otras dos ya están escritas:

| | dónde | qué afirmaba |
|---|---|---|
| 1 | `Reuniones.gs` (`CLAUDE.md` §4) | *"`leerReuniones_()` … mismo contrato que `leerCampanas()`"* — era falso: una devolvía lista y la otra un mapa que **perdía filas repetidas en silencio** |
| 2 | la rama de reanudación (`P0` del 21/08, arriba) | anotado ahí mismo como *"la familia del comentario que afirma un contrato"* |
| 3 | **`D-17`** | nombra dos funciones que no existen |

⭐ **Y el patrón que comparten los tres, que es lo accionable: los tres describen algo que
*debería* pasar y nadie compara la descripción contra el código.** Un comentario no falla nunca.

**Las dos salidas, y ninguna es editar `D-17`** —una decisión no se edita, se supersede—:

- **(a)** un addendum fechado en `PLAN.md` bajo `D-17` que diga *"al 23/08 estas dos funciones no
  existen; el mecanismo es el `Paso-2.5`, sin correr"*. Barato y suficiente.
- **(b)** que el `Paso-2.5` se escriba, y ahí `D-17` pasa a describir algo real.

⚠ **Mientras tanto, lo que hay que saber antes de cualquier alta: no hay dos caminos.** Si el
`Paso-2.5` alguna vez corre, `ESCRITORES.md` declara que *"completa vacías"* y por lo tanto no
pisaría una fila ya cableada — **declarado, no verificable**, porque la función no existe para
mirarla.

---

### P0 · `X-40` — la ventana del informe puede no estar recortando en las secciones que iteran (23/08/2026)

**Puntero, no copia: la medición entera vive en `X-40`** (`docs/casos_validacion_2026-08-19.csv`),
con el `sha256` del fixture y los dos casos que lo discriminan. Acá va sólo por qué es `P0`.

**El hecho, en una línea:** el deck `jm-20260821-234927`, corrido sobre `agosto_14_20`, publicó un
número que **sale de filas fechadas 08/08–13/08** — fuera de esa ventana. La solapa entera termina
el 13/08 y **cero de sus 60 filas** solapan 14–20/08.

⛔⛔ **Es `P0` por el alcance, no por el tamaño del número: si un ítem se selecciona con la ventana
del informe en vez de la suya, afecta a TODO marcador que itere**, no sólo al iceberg. Y la rama
peor —que no se aplique ninguna ventana— **acierta mientras cada cuenta tenga una sola campaña**, y
empieza a mentir cuando tenga dos.

⭐ **Lo que lo vuelve accionable y barato: el número no discrimina, pero hay dos cuentas que sí.**
`2961-ABRSEGGJ` y `3110-MAYJDGAG` tienen filas en **ventanas disjuntas** dentro del mismo fixture.
Resolver un `enc_*` para una de ellas con una ventana que cubra **sólo una** de las dos contesta la
pregunta de un saque.

⚠ **No confundir con `X-29`** —la `fecha_fin` que se extiende sola en `looker/Cuentas`—: aquello es
la fuente moviendo el recorte, esto es el motor pareciendo no recortar.

---

### ✅ ~~P2 · `LAMINAS` no tiene columna de alcance, y por eso el conteo de faltantes suma cuatro cosas distintas~~ — **CERRADO el 25/08/2026** (`2026-08-24_2` Parte B)

> **Cómo cerró:** `LAMINAS` gana **dos** columnas por `COLUMNAS_DELTA_`, no una — `alcance` es de la
> lámina y `tokens_equipo` del token, porque `L-046` está **en** alcance y sus siete `camp_bench_*`
> no se cablean. El conteo del panel pasa a decir **tres números** y el que decide el cierre de fase
> es `faltantes reales`. Se pueblan con `declararAlcanceDeLaminas()`, cruzado contra el censo del
> 22/08. ⚠ `secco` queda **sin declarar** a propósito, y ése es su propio número.

<!-- texto original, conservado: -->

**No es un hallazgo nuevo: `docs/CIERRE_POR_LAMINA.md` ya lo dice con todas las letras** —*"la
causa 4 no está en ninguna hoja de registro, `LAMINAS` no tiene columna de alcance, así que el
único lugar donde vive es este documento"*—. Entra a `PENDIENTES` porque el `2026-08-23_1` lo
convirtió en un límite **del panel**, que es donde alguien lo va a leer sin saber que existe.

**Lo concreto:** la pestaña *Faltantes* agrupa por las causas que el motor **puede probar** —sin
fila, falló, sin datos, el escritor no lo pisó, no se llegó—. Las dos que el prompt también pedía,
**fuera de alcance** y **texto del equipo**, son decisiones del usuario que no viven en ninguna hoja.

⭐ **No se las inventó, y ésa es la decisión que hay que conocer:** la vista declara al pie que el
conteo **no las descuenta** y remite a `CIERRE_POR_LAMINA.md`. Clasificar por una lista escrita a
mano en el `.gs` habría violado *nada de valores hardcodeados* (`CLAUDE.md` §2) y, peor, habría
producido un conteo **que parece medido y no lo es**.

**Qué lo destraba:** una columna `alcance` en `LAMINAS` —o su equivalente por token— que alguien
llene. Es alta de columna en hoja de registro: `COLUMNAS_DELTA_`, el seed, y los `N` lectores que
`CLAUDE.md` §2 obliga a greppear. **No se hizo de noche a propósito**: toca una hoja de registro y
no había nadie para verificarlo.

⚠ **Y mientras tanto el número del panel es más grande que el trabajo real que queda**, en la
misma proporción que el censo: 192 tokens sin fila de los cuales 57 salieron del alcance el 22/08.

---

### ✅ ~~P2 · `FALTANTES` no guarda la lámina, y no es derivable con confianza~~ — **CERRADO el 25/08/2026** (`2026-08-24_2` Parte C)

> **Cómo cerró, y la premisa de abajo era correcta:** *no era derivable*, así que el motor lo
> **declara**. En una sección repetible el `lamina_id` del **modelo** viaja por la asignación, sin
> costar una llamada a la API; en los tokens fijos lo resuelve el ancla, **perezoso y memoizado**.
> ⚠ La celda puede traer **varias** separadas por ` · ` — un token fijo se pinta con
> `replaceAllText` y falta en todas sus láminas. ⛔ Sigue **sin** derivarse del `mapa_tokens`.

<!-- texto original, conservado: -->

El primer pedido de la Parte B del `2026-08-23_1` era una vista *"agrupada por lámina y por causa"*.
**La causa sí; la lámina no se pudo, y conviene que quede escrito por qué** para que el próximo no
lo vuelva a intentar creyendo que es un olvido.

- `FALTANTES` tiene `token`, `base_id`, `solapa` y ahora `causa`. **Lámina, no.**
- El `mapa_tokens` de `CORRIDAS` sí guarda una ubicación, pero es el **índice de slide del deck ya
  expandido** — y las secciones repetibles duplican láminas, así que ese índice **no es un
  `lamina_id`**. `LAMINAS.orden_plantilla` tampoco sirve de puente: es reportado y nunca
  autoritativo (`D-37`).
- Lo que sí hay y se usa es el sufijo `@ítem`, que agrupa por **instancia emitida**. Es otra
  pregunta y contesta bastante: dice si un token falta en todas las láminas o en una.

**Qué lo destrabaría:** que la fila de `FALTANTES` la escriba quien conoce la lámina. En la pasada
por ítem eso es la asignación, que ya lleva `objectIdSlide`; en la pasada de tokens fijos habría que
resolver la lámina desde el ancla. **No es caro, y es un cambio en el camino de escritura de una
corrida** — o sea que necesita una corrida real para verificarse.

---

## 2026-08-24 · `filasRdvDelTemario_` elige **la primera** sección agregada, y su comentario dice que no

**Encontrado al preparar `L-036`, no medido en una corrida — se anota y no se toca.**

`filasRdvDelTemario_` (`Generador.gs`) busca la sección con `modo = agregado` +
`itera_sobre = REUNIONES` + `estado = activa`, y su comentario dice:

> *"Hoy es una sola —`ecv_alcance_semanal`— y **el bucle está para que una segunda no exija tocar
> esto**."*

⛔ **El bucle no hace eso.** Asigna `elegida` en el primer match y las siguientes salen por
`if (elegida) return;`. Con dos secciones que califiquen, **toma una según el orden de
`Object.keys` y la otra desaparece en silencio** — y las filas del temario que devuelve serían las
de la sección equivocada.

⚠ **Por qué importa ahora y no antes:** el candidato natural a ser la segunda es
**`comunicaciones_post`**, que hoy es `repetible` y que —si `L-036` se resuelve por `FILA` sobre una
lámina única— tendría que pasar a `agregado` sobre `REUNIONES`. **La segunda sección llegaría por la
puerta del trabajo que la necesita**, que es cuando menos se la mira.

⭐ **Es la familia de *un comentario que afirma un contrato es una premisa sin testigo*** (`CLAUDE.md`
§4): la línea describe el diseño que se quería, no el que hay, y **nada la contradice** porque hoy
hay una sola sección que califica. Se vuelve falsa el día que deja de haberla.

**Qué lo destrabaría:** decidir qué significa que haya dos —¿cada una trae sus propias filas?, ¿la
función pasa a tomar el `seccion_id`?— y que **el caso de dos falle ruidoso** mientras no esté
decidido. No se arregla acá porque el arreglo depende de esa decisión, y la decisión llega con el
prompt de `L-036`.

---

## 2026-08-25 · ⛔ EVALUADO Y DESCARTADO — derivar `REUNIONES.etapa` en vez de cargarla

**La columna `etapa` se queda.** Decisión del usuario, 25/08/2026, **después de medir**. Se anota
acá **cerrado, no como pregunta abierta**: si alguien lo vuelve a proponer, que encuentre por qué
no.

**Qué se proponía:** `pre` y `post` no son dos reuniones sino dos etapas de la misma, así que el
motor debería **derivar** si un encuentro tiene POST —mirando si su cuenta anclada tiene filas en
`reuniones/Agenda JM | Post`— en vez de pedir que alguien lo declare fila por fila. `C-50` lo
apoyaba: PRE y POST comparten `ID Cuentas` y viven en dos solapas.

### Las tres razones que lo tumbaron, todas medidas

**1 · La duplicación está en lo que se pega, no en el motor.** El `texto_original` de
`julio_24_30` lo dice literal: el temario trae **dos líneas** por encuentro —
`JM | Uno a uno en San Cristóbal 23/07 (pre)` y `… (POST)`— y `cargarTemarioReuniones_` sólo lee el
paréntesis final. **Cambiar esto es cambiar un formato que no controlamos.**

**2 · «Tiene fila» NO es «tuvo comunicación post».** Medido sobre el fixture del 20/08
(`DGPLES _ Seguimiento ECVs`, sha `f8ef3227…`):

| | |
|---|---|
| ids en `Agenda JM` (PRE) | **153** |
| ids en `Agenda JM \| Post` | **102** |
| PRE **con** fila POST | **98 — 64 %** |
| ⛔ de esos 98, **todo en ceros** | **4**, San Cristóbal incluido |
| ⚠ ids en POST que **no** están en PRE | **4** |

⭐ **La señal discrimina** —64/36, no la tienen todos— **y aun así no alcanza**: el derivado puro
metería a San Cristóbal en `L-036` publicando una fila de ceros.

**3 · Se perdería el override de `mostrar`.** Con dos filas, una persona pone `mostrar` distinto de
`sí` **en la fila `post`** y saca ese encuentro sin tocar el `pre`. Con una fila por encuentro ese
control desaparece salvo que se agregue otro campo.

### ⭐ Y lo que cierra el argumento: el motor YA hace la distinción correcta

`filasRdvDelTemario_` **excluye `etapa` de su clave de dedup a propósito** — *«`pre` y `post` son el
mismo encuentro y comparten fila de `rdv`»*. **El motor ya los trata como un solo encuentro cuando
agrega**; la columna sólo los parte **donde la lámina necesita partirlos**, que es
`comunicaciones_post`. **No es una inconsistencia: es la distinción correcta, y ya está en el
código.**

### ⚠ El eslabón que NO se verificó, y es el que reabriría esto

**Que el `id_cuenta` que el anclaje asigna al ítem sea el mismo que figura en
`Agenda JM | Post`.** `C-50` lo afirma y el formato coincide (`3346-JULJDGAG`), pero **el cruce que
se hizo fue por `Barrio / Comuna`, no por el id**. ⛔ **Lo cierra una corrida o la hoja `ANCLAJE`,
no el fixture.** Si algún día se mide y **no** coincide, lo que se cae no es esta decisión sino algo
más grande: la rama por cuenta de `L-036` entera.

**Los lectores de `REUNIONES.etapa`, para que se sepa qué se tocaría:** el `filtro` de
`comunicaciones_post` (el único que decide algo), la clave/etiqueta del ítem, la clave de carga del
temario, y `filasRdvDelTemario_` que la **excluye**. ⚠ **Los 24 `u1_*` NO son lectores** — ver la
advertencia de `CLAUDE.md` §4 sobre `reuniones` contra `REUNIONES`.

---

## 2026-08-25 · ⏸ La etapa 2 se desvió ×1,4 — anotado, no perseguido

**`costo_mapa_seg = 25` y la corrida de `julio_24_30` midió 35 s.** El aviso de desvío lo dijo solo,
que es para lo que se escribió.

⭐ **Es la que estaba anunciada.** El 24/08 quedó escrito que la etapa 2 —el mapa
`token→objectId`— era *«la próxima en crecer»* y que se mediría **por token** justamente porque el
total solo no distingue un deck más grande de una etapa más lenta. **Ahora hay dos puntos**: 61 s
el 24/08 y 35 s el 25/08, con decks de tamaño distinto.

⚠ **No se toca todavía, y el motivo es de método:** con dos mediciones sobre dos decks distintos
**no se puede separar «creció el deck» de «se puso más lenta»**. El `costo_del_mapa` que el reporte
ya publica —ms por token— es lo que las separa, y hace falta la próxima corrida para tener el par
comparable.

⛔ **Y `25` NO se recalibra a ojo mientras tanto.** Subirlo a 40 para que deje de avisar sería
apagar el único instrumento que va a decir cuándo esto importa de verdad — el error simétrico de
las tres constantes que fallaron el 24/08. **Un aviso que molesta y es cierto no se silencia: se
mide.**

---

## 2026-08-25 · Lo que abrió la corrida nocturna del `2026-08-24_2`

### ⏸ `camp_bench_remitente` (`L-047`): falta la decisión, no el prefijo

`TOKENS_EQUIPO_JM_` declara **21** tokens de texto del equipo, cruzados uno por uno contra el censo
del 22/08. **`camp_bench_remitente` NO está declarado, y es a propósito.**

El nombre grita *benchmark* y sería cómodo meterlo con los otros seis `camp_bench_*`. ⛔ **Pero
ningún documento lo dice texto del equipo**: el censo lo cuenta dentro de un *«~15»* aproximado y
`CIERRE_POR_LAMINA.md` no lo nombra. **Declararlo por su prefijo es exactamente el error que
`CLAUDE.md` §4 describe** — filtrar por prefijo *se siente* como leer el censo y **genera** en vez
de **cruzar**, que es como `camp_env` se lleva puesto a `camp_enviados`.

**Qué lo destraba:** una línea del usuario. Mientras tanto cuenta como **faltante real**, que es la
dirección segura: un token de más en el número del cierre se ve; uno de menos, no.

⭐ **Hay una afirmación negativa que lo fija** en `tools/probar-alcance-de-laminas.js`: si alguien lo
agrega sin una decisión escrita, el banco se pone rojo.

### ⏸ El array de `sellarPlantilla` es POSICIONAL, y `LAMINAS` ya tiene 15 columnas

`Sellador.gs` escribe las filas nuevas con un array literal de **13 posiciones**, contra un esquema
que ahora tiene **15**. **Hoy es seguro y medido**: el array **no llega** a `alcance` (14) ni a
`tokens_equipo` (15), así que las dos nacen vacías — *«sin declarar»*, que es lo correcto.

⚠ **Lo que lo vuelve deuda es la próxima columna.** Una que entre en el medio correría todo lo de la
derecha una posición **en silencio** — el modo de falla que `CLAUDE.md` §2 describe para
`ANCLAJE_MEDICION` (`appendRow` de 12 contra 11).

**Qué lo destraba:** construir la fila contra `reg.headers` en vez de por posición. Son pocas líneas.
⛔ **No se hizo en la corrida nocturna a propósito:** toca el escritor de una hoja de registro y no
había nadie para verificar el sellado. Va con el usuario.

⭐ **Hay una afirmación que lo fija** en `tools/probar-alcance-de-laminas.js`: si alguien alarga el
array hasta las columnas nuevas, el banco se pone rojo **antes** de que el sellador escriba una
clasificación que nadie decidió.

### ⚠ El prompt de esta corrida es `2026-08-24_2` y no existe ningún `_1` de ese día

`docs/Prompts/` no tiene ningún archivo con fecha `2026-08-24`. El nombre lo fijó el usuario y **se
respetó tal cual**: renumerarlo a `_1` habría hecho que el nombre del archivo dejara de coincidir
con el que nombran los commits, que es el único cruce que existe entre prompt y commit.

**No se corrige.** Queda anotado junto a las tres colisiones de numeración del 21-22/08, por el mismo
motivo que aquéllas: **se convive con ellas**.

---

## 2026-08-25 (tarde) · ✅ ~~P0 — Hay decks publicados con el POST INCOMPLETO~~ — **DESESTIMADO**

> ⭐ **Decisión del usuario, 25/08: los decks publicados con el POST incompleto se desestiman. No
> hay que rehacer nada.** Queda como **decidido**, no como pendiente.
>
> **La medición se conserva entera abajo** —no se borra— porque es la evidencia de qué estuvo
> incompleto y hasta cuándo: si mañana alguien compara un deck viejo contra uno nuevo y ve los
> `u1_post_*` más altos, **acá está la explicación** en vez de un hallazgo falso.
>
> ⚠ **Lo corregido es para adelante** (`5a1513e`). Un deck emitido no se re-emite solo, y ahora eso
> es una decisión tomada y no un cabo suelto.

### La medición, conservada

**`DIMENSIONES_.etapa.post` filtraba `des_campana~=Agenda Post` y el equipo escribe «Post» en
cualquier posición.** Las dos formas son **disjuntas** —166 filas contra 137, intersección cero—,
así que **todo lo que no llevara la secuencia exacta `Agenda Post` era invisible para el motor**.

**El alcance, medido sobre el fixture del 20/08 (sha `f8ef3227…`): 22 cuentas del «1 a 1» y 71
filas**, repartidas:

| mes de la fila | filas |
|---|---:|
| marzo | 1 |
| abril | 11 |
| mayo | 16 |
| **junio** | **32** |
| julio | 8 |
| agosto | 3 |

⇒ **Seis meses, no una semana.** Cualquier deck que haya publicado una lámina del «1 a 1» de un
encuentro de esas cuentas **mostró el POST incompleto**: los nueve `u1_post_*` sumaban menos filas
de las que correspondía, y los nueve `u1_pre_*` **de más**.

⚠ **El síntoma nunca fue un error.** Los `u1_post_*` publicaban un número plausible —a veces
`sin_datos` cuando *todas* las filas POST del encuentro usaban la otra convención— y nada lo
contradecía. Es el número plausible sin testigo, otra vez.

⭐ **Corregido el 25/08** (`5a1513e`): el criterio pasa a `~=Post`. **Lo que NO se corrige es lo ya
publicado** — un deck emitido no se re-emite solo.

**Qué lo cierra:** decidir si algún deck publicado hay que rehacer. Es del usuario. La lista de las
22 cuentas afectadas sale de `python tools/medir-impacto-etapa-post.py`, sección 4.

---

### ✅ ~~`S-06` — el orden de las cuatro ranuras de `L-036`~~ — **CERRADO el 25/08**

> ⭐ **Se cerró dando vuelta el grano, no midiendo el orden.** Decisión del usuario: **el desglose
> por plataforma es del «1 a 1» (`L-053`), no de esta lámina.** `L-036` es **por REUNIÓN, una fila
> con el TOTAL de esa reunión**.
>
> ⭐⭐ **Y los tres faltantes encadenados se disuelven juntos:** el riesgo era *«un número correcto
> en la fila equivocada»*, y con la fila = el encuentro **deja de existir** — `Habitantes` y
> `Alcance` son del encuentro y la fila también. No hay dos granos que confundir.
>
> ⚠ **Lo que SOBREVIVE del rodeo, y sigue abierto:** el `Formato` desde `Nomenclatura`, que era un
> bloqueo independiente del grano. Ver abajo.

---

### ⏸ El `Formato` de `L-036` sale de `Nomenclatura`, y no hay extractor

`des_nomenclatura` (col. L) ya está en `MAPEO`. ⚠ **Sus campos son variables y la posición cambia
por plataforma:**

```
Meta:       2026 | Julio | Meta | 15 | Alcance | Vinculo Ciudadano | … | Geo CABA | Geo Retiro
Google ads: 2026 | Vinculo Ciudadano | … | Geo Retiro | YouTube | Video | Vistas
DV360:      2026 | Julio | iProspect | DV360 | GCBA | … | Video | Open | … | Alcance
```

**Es el mismo bloqueo que `CIERRE_POR_LAMINA.md` ya declaró para `camp_formato1-3` de `L-043`**, y
conviene resolverlos juntos o declarar los dos como texto del equipo.

---

### ⚠ El límite de cruzar dos fuentes en una lámina — declarado, no resuelto

`L-036` va a leer **`digital/CAMPAÑAS_DESGLOCE_DIGITAL`** para cinco columnas y
**`reuniones/Agenda JM | Post`** para `Habitantes` y `Alcance`. **Dos fuentes en una lámina pueden
publicar filas de dos momentos distintos.**

Es la misma familia que el deck en tandas (`D-41`) y que `C-80`: cajas una al lado de la otra, con
el mismo formato, que se leen como si respondieran la misma pregunta. **Decisión del usuario
(25/08): se anota, no se resuelve.**

---

### ⚠ `~=` es sensible al case, y hoy eso alcanza — pero no está garantizado

`des_campana~=Post` matchea `Post` y **no** `post` ni `POST`. Medido: de las **318** apariciones,
**todas** son `Post`. El día que alguien escriba otra grafía, **no se ve y no falla**.

⛔ **No se plegó el case** porque `valorPasaFiltro_` es el comparador de **todos** los filtros del
motor y cambiarlo movería mucho más que esto. El límite queda fijado por una afirmación de
`tools/probar-etapa-post.js`: si algún día se vuelve insensible, se pone roja y hay que venir a leer
por qué estaba así.

---

## 2026-08-25 · ✅ ~~El cableado de `L-036` contra el desglose está BLOQUEADO por DOS piezas del motor~~ — **SE CAE**

> ⛔⛔ **Los dos bloqueos eran del DESGLOSE, y el desglose no es la fuente.** El `ADDENDUM 2` de
> `docs/FUENTE_post_reuniones_2026-08-25.md` retracta al `ADDENDUM 1`: `reuniones/Agenda JM | Post`
> **es** la fuente de `L-036`, con las cinco columnas y **una fila por reunión**.
>
> - **A · `suyas[0]`** rompía con **cinco filas por encuentro**, que es el desglose.
>   `Agenda JM | Post` tiene **una** — medido —, y ahí `con_varias > 0` sigue siendo el aviso
>   correcto.
> - **B · la solapa única de temario** sólo hacía falta con **dos** fuentes. Con las cinco columnas
>   en una sola solapa, **es una**.
> - ⛔ **`X-41` NO aplica:** la solapa declara `campo_id_cuenta`, así que el recorte por cuenta del
>   temario funciona y no hay riesgo de caer al universo ancho.
>
> ⭐ **Lo que SÍ queda vivo es `D-31`** — `Visualizaciones` y `% VTR` son títulos repetidos y hay
> que leerlos **por posición** (col 12 y col 13). **Es la decisión que espera al usuario**, y
> `SOLAPAS` lo advierte desde el 14/08: *«los títulos de la fila 2 se repiten y NO alcanzan para
> nombrar una columna»*. Las otras tres columnas tienen título único y no dependen de eso.
>
> **El análisis se conserva abajo**: si algún día `L-053` u otra lámina lee el desglose por
> encuentro, los dos bloqueos vuelven **tal cual**.

> ## ⭐⭐ REABIERTO Y RESUELTO — 25/08/2026 (tarde), `2026-08-25_3`
>
> ⛔ **«Algún día» fue el mismo día.** El texto de arriba cerró esto diciendo *«si algún día una
> lámina lee el desglose por encuentro, los dos bloqueos vuelven tal cual»*. **Volvieron ese mismo
> día**: el `ADDENDUM 3` midió que **ninguna de las 29 columnas de `Agenda JM | Post` trae fecha de
> inicio ni de fin**, así que la columna `Período` **tiene** que salir del desglose. `L-036` cruza
> dos fuentes.
>
> ⭐ **Es el caso literal de `CLAUDE.md` §4:** *un fallback justificado por el estado actual del
> cableado tiene fecha de vencimiento, y el trabajo previsto es la fecha*. Acá la premisa no era
> sobre el mundo sino sobre el propio repo —*«hoy ninguna lámina lee el desglose por encuentro»*— y
> **el trabajo del día siguiente la invalidó**. No hizo falta que cambiara nada afuera.
>
> **Los dos bloqueos están resueltos, y el análisis de abajo describe cómo:**
>
> - **A · `suyas[0]`** — resuelto **sin tocar `filasDeSolapaDelTemario_`**. La agregación no se metió
>   ahí: vive en `opGRUPO_TEXTO` (`Marcadores.gs`), la operación duodécima, que agrupa por
>   `id_cuenta` y compone `min`/`max`. `FILA`, `opFILA` y `FILA_TEXTO` quedan **intactos** — los usan
>   41 marcadores.
> - **B · la solapa única de temario** — resuelto. `CONFIG.solapas_agregado_post` admite **una lista**
>   de pares `base|solapa`, `opciones.filas_temario` es un **mapa** por esa clave, y **la guarda
>   dispara sobre lo DECLARADO, no sobre lo que la corrida logró leer**: declarada y sin filas falla
>   con `«FALTA:…@post_sin_temario»`, nunca cae a la cadena general.
> - ⭐⭐ **Y apareció un tercer bloqueo que el análisis de abajo NO tenía**, que es el que valía más:
>   **las dos listas se indexan con el mismo `n`**. Un encuentro presente en una y ausente en la otra
>   correría las ranuras y publicaría el período de un encuentro al lado de los números de otro,
>   **sin fallar**. Lo cierra `D-42`: la lista es una, y **la ranura se sella en la fila**.
>
> ⚠ **El análisis conservado sigue siendo cierto y no se edita** — describe lo que pasaría **sin**
> estas piezas, que es exactamente lo que hay que saber si alguien las toca.

### El análisis, conservado — vale para cualquier lámina que lea el DESGLOSE por encuentro


**Se fue a cablear y aparecieron dos bloqueos estructurales.** Ninguno es de configuración: los dos
piden cambiar el motor, y **el segundo es del modo de falla más caro del repo**.

### A · `filasDeSolapaDelTemario_` elige UNA fila, y el desglose tiene varias por encuentro

```js
if (suyas.length > 1) conVarias++;   // ⚠ sólo lo REPORTA
…
filas.push(suyas[0]);                // ⛔ y se queda con la primera
```

**Sobre `Agenda JM | Post` está bien** —una fila por encuentro, medido y declarado en `SOLAPAS`— y
su propio comentario dice que `con_varias > 0` *«es un cambio de forma de la fuente, no un caso
normal»*.

⛔ **Sobre `CAMPAÑAS_DESGLOCE_DIGITAL` es al revés: varias filas por encuentro es LO NORMAL.**
Medido sobre el fixture del 20/08: **Retiro 5 filas** (Meta ×2, Google ×2, DV360), **Orden Público
3**. Con `suyas[0]`, `post_impresiones1` publicaría **la fila de Meta como si fuera el total** —
`38.310` en vez de `136.971`.

⚠ **Es el modo de falla más caro y el único que no avisa:** un número correcto en el lugar
equivocado, plausible, sin fallar.

**Qué lo destraba:** que la función pueda **agregar** las filas de la cuenta en vez de elegir una.
El dato ya lo tiene (`suyas`); falta sumar los campos que correspondan. ⭐ **Y va por `CONFIG`, no
hardcodeado** —`campos_agregar_post`, al lado de `campos_metrica_post`— porque cuáles se suman es un
parámetro de negocio.

⚠ **La tensión con la regla de oro hay que declararla:** sumar filas es aritmética, y *toda la
aritmética vive en `Marcadores.gs`*. El argumento para que viva acá es que **no es el cálculo del
marcador sino la preparación de su fila** —el mismo rol que `unirDigitalPorCuenta`—, y el marcador
sigue haciendo su `FILA`/`ULTIMO` sobre el resultado. **Es una decisión de arquitectura y la toma el
usuario.**

### B · ⛔⛔ La config del temario declara UNA sola solapa, y `L-036` necesita DOS

`CONFIG` tiene `base_agregado_post` y `solapa_agregado_post` — **en singular**. Y la rama que aplica
el recorte del temario es **por marcador**:

```js
if (opciones.base_temario === fila.base_id && opciones.hoja_temario === solapa) { … }
```

⇒ **Si la config apunta al desglose, los marcadores que leen `Agenda JM | Post` —`post_alcance` y
`post_habitantes`— dejan de entrar a esa rama** y caen a la cadena general: `leerFuente` sobre **la
solapa entera**.

⛔⛔ **Eso es exactamente lo que se cerró el 25/08 a la mañana**, y publicó el **Recap de CABA con
2.463.980 habitantes** como si fuera un encuentro. **Es `X-41` y la familia de los `cc_*`: una
sección que debería recortar por las cuentas del temario y termina publicando el universo ancho.**

**Qué lo destraba:** que el temario pueda declarar **más de una solapa** —una lista, no un par— y que
`opciones.filas_temario` sea un mapa por `base|solapa`.

### ⇒ Lo que esto significa para el orden de trabajo

**No es «cablear»: son dos cambios de motor con su banco cada uno**, y el B mueve el riesgo de
publicar un universo ancho. **Se reporta y no se toca** — el cableado queda escrito como pendiente y
el usuario decide si van, en qué orden y en qué deck.

⚠ **Y una corrida de `jm` sobre `julio_24_30` HOY no puede mostrar lo esperado:** las tres métricas
del desglose no tienen cómo llegar agregadas, y `Alcance`/`Habitantes` no tienen cómo conservar el
recorte si se cambia la solapa. **Los 41.204 de Retiro no van a salir de esta corrida.**

---

## 2026-08-25 · ⭐ `unirDigitalPorCuenta` PISA — medido, sin arreglar

**Pedido del usuario: medir y parar.** ⭐ **No es un hallazgo nuevo:** está instrumentado desde el
09/08 (`N4`), que publica `filas_pisadas` y dice *«sigue pisando exactamente igual, y con qué
reemplazarla es una decisión de diseño que espera al usuario»*.

### ⭐⭐ Lo primero, porque acota el problema a una décima parte: sólo pisa las DIMENSIONES

| qué | cómo se guarda | |
|---|---|---|
| los 5 campos de `CAMPOS_DIMENSION_MAESTRA_` | `porCuenta[id] = registro` | ⛔ **PISA** |
| los hechos de cada canal (`mail_filas`, `ivr_filas`, `sms_filas`, `alc_filas`, `dig_filas`) | `…[claveFilas].push(fila)` | ✅ **ACUMULAN** |

⇒ **Las métricas de mail, IVR, SMS, alcance y digital NO están afectadas.** El propio `Union.gs` lo
dice: *«si una solapa trae varias filas por cuenta, NO se suma — se guarda el arreglo crudo»*.

### 1 · Quiénes consumen, y cuáles están expuestos

| consumidor | campo | ¿distingue etapa? | expuesto |
|---|---|---|---|
| **el anclaje** (`Union.gs`, `candidatosTodos`) | `sd_campana_digital` | ⛔ **no** | ⛔ **SÍ** |
| **`camp_titulo`** | `sd_campana_cuentas` | ⛔ no | ✅ **no** — ver abajo |
| `sd_pauta_google` · `sd_pauta_prog` · `sd_pauta_meta` | — | — | ✅ **ningún marcador los lee** (medido: 0) |

### 2 · Cuántos ids tienen más de una fila — ⚠ el 10 % global esconde el dato que importa

Sobre el fixture del 20/08, solapa `Seguimiento digital`: **978 filas · 802 ids · 176 filas pisadas**.
**81 de 802 ids (10,1 %)** tienen más de una fila.

⇒ **Globalmente NO es la mayoría.** ⛔ **Pero los CINCO encuentros del temario de julio pisan, los
cinco** — `3346`, `3354`, `3387`, `3389`, `3420`, todos con su par pre/post.

⭐⭐ **Ése es el matiz que cambia la lectura: el 10 % es sobre *todas* las cuentas de digital, y la
población que importa es *las cuentas de encuentro*, donde pre+post es el caso NORMAL.** Un
porcentaje sobre el universo equivocado hace pasar por borde lo que es la regla.

⚠ Y hay un outlier: **un id con 96 filas**. No se persiguió.

### 3 · ⭐⭐ Qué publican hoy — el anclaje ACIERTA con la última fila, y ahora se sabe por qué

**`sd_campana_cuentas` NO difiere nunca** — **0 de 81**. Por eso **`camp_titulo` está a salvo**, y su
propia nota ya decía el motivo: *«es la MISMA columna contra la que `catalogoDeCampanas_` resuelve el
id, así que lo publicado y lo matcheado son el mismo texto»*.

⛔ **`sd_campana_digital` difiere en 80 de 81**, y ahí **gana el POST**. Es el campo que usa el
anclaje para parsear barrio, fecha y tipo.

⭐ **¿Rompe el anclaje? No — y medido, lo MEJORA.** Se corrió `parsearNombreCampana_` real sobre los
cinco pares pre/post de julio:

| encuentro | fecha del PRE | fecha del POST | temario |
|---|---|---|---|
| Retiro | 24/07 | 24/07 | 24/07 |
| ⛔ **San Cristóbal** | **24/07** | **23/07** | ⭐ **23/07** |
| Orden Público | 28/07 | 28/07 | 28/07 |
| Nueva Pompeya | 29/07 | 29/07 | — |
| Caballito | 29/07 | 29/07 | — |

⇒ **1 de 5 difiere, y el POST es el que tiene la fecha correcta.** El PRE se nombra con la fecha de
la campaña de convocatoria; **el POST con la del encuentro**.

⛔⛔ **La consecuencia, y es lo que había que entender antes de tocar: «arreglar» la pisada
quedándose con la PRIMERA fila ROMPERÍA el anclaje de San Cristóbal**, que pasaría a buscar un
encuentro del 24/07 cuando el temario dice 23/07.

⭐ **No es que la pisada esté bien: es que el orden de la hoja está acertando.** Depender de eso es
frágil —basta que alguien reordene la solapa— pero **cambiarlo por «la primera» es peor**, y por «la
que tenga el nombre más parecido» es otra decisión.

### ⇒ Lo que queda para el usuario

**No se tocó nada.** Las tres salidas posibles, sin recomendar ninguna:

1. **Dejarlo como está** y documentar que el anclaje depende del orden de la hoja.
2. **Preferir explícitamente la fila POST** para `sd_campana_digital` — hace explícito lo que hoy
   pasa por casualidad. ⚠ Necesita que la unión sepa de `etapa`, que hoy no sabe.
3. **Guardar las N filas** como hacen los canales, y que cada consumidor elija. Es lo más limpio y
   lo que más mueve.

⚠ **Y lo que NO se midió, dicho para que no se lea como que no hay nada:** los tres `sd_pauta_*`
salen del `MAPEO` y no de un título fijo, así que el instrumento **no los comparó**. **Ese cero es
«no medí», no «no difieren»** — y son conteos de contenidos pauteados, así que si difieren, importan.

---

### ⏸ Un `/* */` en cierta zona de `Instalar.gs` rompe el parseo — **anotado, sin perseguir**

**Decisión del usuario, 25/08: reproducido en aislamiento y resuelto es suficiente.**

**El hecho:** insertar un comentario de bloque `/* … */` inmediatamente antes de `headers:` dentro de
`HOJAS_CONFIG_.MAPEO` deja el archivo **sintácticamente inválido** — `Unexpected token ':'` señalando
a `SOLAPAS: {`, unas líneas más abajo.

⭐ **Reproducido en aislamiento sobre HEAD**, que es lo que lo vuelve un hecho y no una sospecha: se
tomó el archivo limpio, se insertó el comentario y falló. ⚠ **Y un `/* prueba */` también lo rompe**,
así que **no es el contenido: es la posición**.

**Cómo se resolvió:** el comentario se escribió con `//`. Cuesta nada y no arrastra el problema.

⛔ **La causa NO está entendida.** Lo más probable es que haya un `/*` o un `*/` dentro de un string
o de un `//` más arriba que desbalancea al parser en esa zona; una búsqueda lineal de aperturas y
cierres se desalineó justo ahí. **No se persiguió** — el archivo tiene más de 7.000 líneas y el costo
de encontrarlo no se justifica contra el de escribir `//`.

⚠ **Lo accionable, si vuelve a aparecer:** en `Instalar.gs`, **usar `//` para comentarios nuevos
dentro de `HOJAS_CONFIG_`**. Y si algún día alguien lo persigue, el reproductor es: tomar HEAD,
insertar `/* x */` antes de `headers:` en el bloque `MAPEO`, y parsear con `node -e "new
(require('vm').Script)(require('fs').readFileSync('Instalar.gs','utf8'))"`.

⭐ **Y lo que sí está cubierto:** los `.gs` se parsean en cada verificación desde el 25/08, así que
un archivo roto **no llega a un commit en silencio** — que es lo único que este pendiente necesitaba
garantizar.

---

## 2026-08-25 · ⭐⭐ Un cableado PARCIAL sin un lugar donde conste que es parcial se lee como completo

**Es el hueco de método que dejó `L-036`, y vale más que la lámina.**

`COLUMNAS_POST_L036_` declaraba **cinco columnas de una tabla de OCHO**, y **nada en el repo decía
que las otras tres no estaban**. La constante se llama «las columnas de `L-036`»; no dice «las que
se pudieron leer». El comentario de arriba explicaba por qué esas cinco sí — y **el silencio sobre
las otras tres se lee como que no existen**.

⛔ **Lo que costó:** el `/////` de `post_camp*` pareció **un bug del motor** durante media vuelta de
diagnóstico —se revisó el símbolo, `FALTANTES`, el mapa de la corrida, el modo de la sección—
cuando era **trabajo que nunca se había hecho**.

⚠ **Y el síntoma no se parece a la causa:** un token sin fila y un token mal cableado **salen igual
en el deck**. La columna `causa` de `FALTANTES` los separa (`sin_fila`), pero **sólo si uno sabe que
la lista es parcial**; si no, `sin_fila` se lee como *«el cableado se rompió»*.

⭐ **Lo accionable, y es la pregunta que se hace al cablear una tabla:** *¿cuántas columnas tiene la
tabla, y cuántas estoy cableando?* Si los dos números difieren, **el que falta va escrito en algún
lado con su motivo** — no en el commit, que nadie relee, sino donde alguien lo va a buscar:
`CIERRE_POR_LAMINA.md` para el estado y `CONFIG_INFORMES.md` para la decisión.

**Cerrado para `L-036`:** el tablero dice **24 de 32** con los dos motivos separados, y
`CONFIG_INFORMES` §2.3 bis declara `post_formato*` fuera de alcance y `post_periodo*` pendiente.

⏸ **Abierto para el resto:** ninguna otra tabla del repo declara *cuántas de cuántas*. Las
candidatas son `L-047` (5 envíos × 9 columnas) y `L-046` (17 tokens de 31). **No se revisaron.**

---

### ⛔ El paso que faltaba en la lista de arranque — `cablearTablaPostReuniones()`

**`cablearTablaPostReuniones_()` no lo llama ningún sembrador.** Ni `instalar()`, ni *Aplicar
configuración*: sólo su wrapper público y `repararTablaPostReuniones()`.

⚠ **No es un bug** —el alta de marcadores es una decisión y por eso tiene botón propio— **pero sí
es una trampa para quien sigue una lista de pasos**: sembrar `MAPEO` y `SECCIONES` deja la lámina
lista *salvo* los marcadores, y el deck sale en `/////` sin que nada avise.

**Lo accionable:** toda lista de pasos que termine en *«correr `jm`»* tiene que incluir el wrapper
de cableado de las láminas que se hayan tocado. Está en `HANDOFF_CODE.md`, en la tabla de arranque.

---

## 2026-08-25 · **P1 · 21 de 51 bancos aportan CERO al conteo de afirmaciones del runner**

`tools/suites.js` suma leyendo el texto *«Las N afirmaciones pasaron»* de cada banco. **21 imprimen
`«Todas las afirmaciones pasaron»`, sin número**, así que su aporte es **cero** — y nadie se
enteraba, porque el veredicto sale del **exit code** y ése sí es correcto.

**El tamaño del hueco, medido:** al ponerle el conteo a **un solo** banco
—`probar-agregado-por-temario.js`, 87 afirmaciones— el total del runner pasó de **~527 a ~614**.
Con los 21 arreglados el número real es bastante mayor que el que se venía citando.

⚠ **No es un problema de veredicto: es de CUÁNTO midió.** `CLAUDE.md` §4 lo pide con todas las
letras — *«un control tiene que declarar CUÁNTO midió; “ningún problema” y “no se probó nada” se ven
idénticos en un log sin conteo»*—. Un banco que se rompiera y dejara de correr afirmaciones seguiría
imprimiendo su banner sin número y **el total no se movería**.

⭐ **El arreglo es mecánico y de una línea por archivo:** contar en `afirmar()` y cambiar el banner
final a `'✅ Las ' + corridas + ' afirmaciones pasaron.'`. **No se hizo en la vuelta del
`2026-08-25_3` a propósito** — *mejorar no es ampliar*, y son 21 archivos fuera del objetivo del
prompt.

**Los 21:** `alcance-de-laminas`, `aviso-ventana`, `confirmar-anclaje`, `continuacion-deck`,
`cuenta-de-campana`, `etapa-post`, `faltantes-causas`, `faltantes-por-lamina`, `lamina-por-id`,
`laminas-declaradas`, `lectura-por-posicion`, `matcher-rdv`, `medicion-anclaje-en-el-panel`,
`modo-faltantes`, `particion-etapa`, `rediseno-l036`, `reloj-etapas`, `ruteo-solapa-digital`,
`solo-marcadores`, `tipo-en-item`, `vista-faltantes`.

---

## 2026-08-25 · **P0 · Dos premisas vencidas sobre el recorte por período, y las dos siguen escritas**

Salen del relevamiento de la cascada de universo (25/08). ⚠ **Las dos describen el estado anterior
al `2026-08-22_25` Parte B** —commit `fd226d1`, 22/08 13:21— que extendió el recorte del temario a
la ventana calculada.

### 1 · «`anclarEncuentros` recorta sólo si la ventana vino por `periodo_ref`»

**Era cierta hasta el 22/08 13:21.** Desde el `_25` Parte B, `anclarEncuentrosSinCache_` usa
`periodosQueDescribenLaVentana_(ventana)` cuando el origen **no** empieza con `periodo_ref:`: le
pregunta a `PERIODOS` qué filas tienen exactamente esas dos fechas y recorta con el **conjunto**.

⚠ **La frase sigue viva en al menos un comentario del front** (`Panel.html`, arriba de
`panel_generar`) y se venía citando como premisa. **El deck `jm-20260821-230048` con 12 encuentros
en vez de 2 es del 21/08 — anterior al arreglo**, así que no es evidencia del estado de hoy.

⭐ **Lo que sí sigue siendo cierto, y es lo que hay que citar en su lugar:** si **ninguna** fila de
`PERIODOS` describe la ventana, no se filtra y entran todas las reuniones con `mostrar = sí`. O sea
que ese camino tiene **dos comportamientos** según un dato de `PERIODOS`, y **ninguno de los dos se
anuncia**.

### 2 · El aviso de `avisosDeVentanaPropuesta_` — tercera generación diciendo algo que no es

`PanelBackend.gs` decide por `origen.indexOf('periodo_ref:') === 0` y publica *«las secciones
repetibles NO se recortan por período: entran las N reunión(es) con mostrar=sí»*. Desde el `_25` eso
es **falso cuando alguna fila de `PERIODOS` coincide con la ventana**.

⛔ **Y el dato correcto ya está calculado treinta líneas más abajo, en la misma función:** el bloque
`coincidentes` recorre `PERIODOS` y empareja por `desde`/`hasta` —**el mismo cálculo** que hace
`periodosQueDescribenLaVentana_`— pero sólo lo usa para redactar el consejo (*«elegí
`agosto_14_20`»*), **nunca para decidir si el aviso corresponde**.

⚠ **Es la tercera vez que este mismo aviso afirma algo que no se cumple.** El propio comentario de
la función registra la segunda (`2026-08-22_22` §5) y cita a `CLAUDE.md` §4 sobre por qué duele:
*«mostrar una advertencia equivocada es tan caro como no mostrar ninguna, porque la próxima se lee
con la misma desconfianza»*. Ésta se leyó con desconfianza dos días después de escribirla, y ahora
vuelve a estar mal por otro motivo.

**Lo accionable:** el aviso tiene que decidirse por `coincidentes.length`, no por el prefijo del
origen — y cuando hay coincidencia, el texto correcto es otro: *el recorte SÍ se aplica, con estas
filas*.

---

## 2026-08-25 · **P0 · Misma condición, dos comportamientos: la rama 2 se cae en silencio y la rama 3 falla**

**Pregunta abierta, sin resolver.** No la decide Code.

Las dos ramas de `datosDeMarcador_` que leen «las filas del TEMARIO» se comportan **al revés** ante
el mismo hecho —*el temario no trajo ni una fila*—:

| rama | qué hace con temario vacío | desde |
|---|---|---|
| **3** · `filas_temario` (`post_*`, `D-42`) | ⛔ **falla** con `«FALTA:…@post_sin_temario»` y su diagnóstico | `2026-08-25_3` Parte 1 |
| **2** · `filas_rdv` (`ecv_*`, agregado semanal) | ⚠ **se cae a la cadena general** — `rdv` entera recortada por `figura=Jorge Macri` y la ventana | siempre |

El mecanismo de la rama 2 es literal (`Generador.gs`, etapa 4):

```
var temario = filasRdvDelTemario_(informeId, ventana);
if (temario.filas.length) {          // ← si da cero, `filas_rdv` no se setea
  opcionesEtapa4.filas_rdv = temario.filas;
```

Sin `filas_rdv`, la rama 2 no dispara; y como `rdv/RVD JM-CM - ES` **no declara `campo_id_cuenta`**
—medido en `SOLAPAS`—, tampoco la atrapa la rama por cuenta declarativa: cae a `leerFuente`.

⛔ **`filasRdvDelTemario_` devuelve vacío por cinco causas distintas y ninguna se distingue de
«esta semana no hay encuentros»:** `SECCIONES` ilegible, la sección no resuelta, `itera_sobre` que no
apunta a `REUNIONES`, `itemsDeSeccion_` que tira excepción, o `!ok`.

⭐ **Por qué va como pregunta y no como bug:** cuál de los dos comportamientos es el correcto depende
de la cascada de universo que el usuario definió el 25/08 (`temario → período configurado → semana`),
y eso todavía no está decidido. **Lo que no puede seguir es que dos ramas hermanas resuelvan la misma
condición al revés**, sea cual sea la regla que gane.

---

## 2026-08-25 · **P1 · `ecv_alcance_semanal.itera_sobre` es un interruptor sin alarma**

El agregado por temario de `L-034` (`_25` Parte A) depende de que `SECCIONES.ecv_alcance_semanal`
tenga **`itera_sobre = REUNIONES`**. Sin eso, `seccionAgregadaDeReuniones_` no resuelve,
`filasRdvDelTemario_` devuelve vacío, y **los 16 marcadores `ecv_*` se van al universo ancho por el
camino de la rama 2 de arriba — en silencio**.

⚠ **En el snapshot `docs/_snapshots/SECCIONES_2026-08-21_2225.tsv` esa celda está VACÍA.** El
snapshot es **anterior** al `_25` (22/08) y la corrida de ese día registra que el agregado
reprodujo —`ecv_inscriptos` 2.333 y `ecv_encuentros` 4 contra `V-71`—, así que se aplicó. **Pero no
hay ningún snapshot posterior que lo confirme**, y ésa es toda la evidencia que existe.

⭐ **El botón que la escribe** es `declararIteraDelAgregado()` (`Instalar.gs`, wrapper público sin
argumentos), que por dentro llama a
`curarSecciones_([{ seccion_id: 'ecv_alcance_semanal', itera_sobre: 'REUNIONES' }])`.

⛔⛔ **Y ese botón existe por el motivo que hace grave a este punto: `SEED_SECCIONES_` SÍ declara
`itera: 'REUNIONES'` —desde el commit `01e4060`, 22/08 13:43— pero el seed de `SECCIONES` NO
ACTUALIZA FILAS EXISTENTES.** Es una de las dos hojas que **sólo siembran lo ausente**
(`CLAUDE.md` §4, junto con `CONFIG`; la tabla de qué se propaga vive en `docs/ESCRITORES.md`).

⚠ **La consecuencia, que es lo accionable:** si esa celda queda vacía, **ni `instalar()` ni
*Aplicar configuración* la arreglan**. El seed dice lo correcto, el diff no acusa nada, y la única
forma de repararla es apretar el botón — que nadie va a apretar, porque nada avisa. **El valor
correcto está escrito en el repo y no llega a la hoja**, que es exactamente el caso del 16/08
(`CLAUDE.md` §4, *«un cambio de seed no existe hasta que se empuja»*) con la variante más cara: acá
el push corrió y **igual no llega**.

**Lo accionable, en orden:** (a) tomar un snapshot de `SECCIONES` y verificar el valor de hoy — es
la única evidencia que falta; (b) que la rama 2 falle en vez de caerse, que es la pregunta abierta
de arriba, porque es lo único que convierte esta celda en un error visible en vez de un número
plausible.

---

## Corrida nocturna del 25/08/2026 (`2026-08-25_7`) — cinco puntos nuevos y uno cerrado

Todo lo de abajo está **medido contra la hoja viva o contra un fixture con `sha256` verificado**, no
citado. Cada punto dice con qué se midió.

### ✅ CERRADO · `ecv_alcance_semanal.itera_sobre` **ya dice `REUNIONES`**

Era la mitad **(a)** del punto anterior de este documento —*«tomar un snapshot de `SECCIONES` y
verificar el valor de hoy, es la única evidencia que falta»*—. Medido el 25/08 leyendo `SECCIONES`
por `leerSecciones_` contra la hoja viva: la celda está poblada, y `comunicaciones_post` además está
en `modo = agregado` con `filtro` vacío.

⛔ **No se apretó ningún botón: no hacía falta.** `declararIteraDelAgregado()` habría informado
*«ya estaba»*. **La mitad (b) sigue abierta** — que la rama 2 falle en vez de caerse, que es lo
único que convierte esa celda en un error visible en vez de un número plausible.

⚠ **Y el control positivo del instrumento avisó primero, que es por lo que se puede citar el
resultado:** la primera lectura pidió `informe_id = jm` y devolvió **cero nodos**.
`SECCIONES.informes` dice `JM,SECCO` en mayúsculas y `leerSecciones_` compara **sin plegar case**.
Un cero que se habría leído como *«la hoja está vacía»*.

### ⛔ P0 · `CONFIG` **no tiene** `solapas_agregado_post` ni `campos_metrica_post`

Medido el 25/08: la hoja viva tiene **27 claves** y **ninguna de las dos está**. Lo que sí está es el
par **singular** de siempre — `base_agregado_post = reuniones` y
`solapa_agregado_post = Agenda JM | Post` —. El seed las declara
(`Instalar.gs`, `SEED_CONFIG_DEFAULTS_`).

⚠ **No es que el motor falle: es que cae al par singular**, que es el fallback que
`solapasDelTemario_` documenta. La consecuencia concreta es que la lista de solapas del temario
queda con **una** —la del temario— y **sin `digital|CAMPAÑAS_DESGLOCE_DIGITAL`**, así que los cuatro
`post_periodo*` de `L-036` **no tienen de dónde salir**. Y `campos_metrica_post` vacío deja
`camposMetrica = []`, que **cambia qué encuentros califican**.

⭐ **Lo accionable, y es el «paso 9 bis» de la corrida de mañana:** correr el ítem de menú
**«Aplicar configuración»** —no `instalar()`—, que es el único que siembra las claves ausentes de
`CONFIG`, y **verificar las dos leyendo la hoja después**. Es la misma familia que el punto de
`SECCIONES` de arriba con el signo cambiado: allá el seed no repara lo existente, acá **sí** agrega
lo ausente y nadie lo corrió todavía.

### ⛔ P0 · `m2_camp_lista` **no es cableable hoy**: `opLISTA` exige catálogo y la decisión es publicar crudo

La decisión del usuario para `L-038` es *«los nombres distintos de la semana, **crudos**, sin agrupar
ni normalizar»*. `opLISTA` hace lo contrario **por diseño** (`R-18` punto 2): resuelve cada valor
contra un catálogo y **lo que no matchea no se publica** — va a `rechazados` y de ahí a `FALTANTES`.
Sin `catalogo` declarado, `calcularConjuntoDeLista_` **tira una excepción**.

**Y no hay catálogo posible**, medido: el catálogo se lee de la **columna A** de una `base/solapa`
(`catalogoBarriosDesdeBase_`), y la columna A de `digital/Directa Mail` es **`ID Cuentas`**. El
propio repo ya lo decía desde el 20/08, en el comentario de `opCUENTA_DISTINTOS`: *«el caso que
motiva esta operación —`m2_campanias`— no tiene ninguno»*.

⭐ **Lo que sí está medido y sirve:** el token **`{{m2_camp_lista}}` existe en la plantilla**, en
`L-038`, y es **el único de esa lámina sin fila** (9 tokens, 8 con fila). O sea que lo que falta es
la operación, no el token.

⛔ **Pregunta al usuario, y la parte se frenó ahí:** ¿`m2_camp_lista` sale con una **operación
nueva** —una `LISTA_CRUDA`, la decimotercera, sin catálogo— o con un **catálogo declarado**, y en ese
caso de qué solapa y qué columna? **No se resolvió por plausibilidad.**

### ⛔ P0 · `X-28`: la regla decidida **no es expresable** en `MARCADORES`

La regla del usuario es **`JDGAG` + pertenencia + `duración ≤ 30 d`**. Las dos primeras se escriben
—`~=JDGAG` sobre `lcc_id_cuenta`, y la pertenencia ya la da `SOLAPAS.ventana_ref: 'Cuentas'`—. **La
tercera no.** `parsearCondicionFiltro_` entiende `=`, `!=`, `~=` y `!~=` sobre **el valor de una
celda**, unidos por `&&`: no hay comparación numérica, y `duración` es una **resta entre
`fecha_inicio` y `fecha_fin`** de la hoja `Cuentas`.

⚠ **El único tope por duración que existe es `CONFIG.tope_dias_ventana_cuenta` (`R-30`), y es
global**: está en `90`, y bajarlo a `30` movería **los ocho `imp_*`** y todo lo que lee por cuenta.
El comentario de `R-30` en `Fuentes.gs` ya lo dice con todas las letras: *«⛔ **Y esto NO resuelve
`X-28`**»*.

⭐ **Lo medido, que queda como insumo** (`tools/medir-desempates-cc.py`, sobre los fixtures del 31/07
y del 20/08, **con sus dos controles positivos reproduciendo**):

| período | regla | cuenta que elige | publica | deck del equipo |
|---|---|---|---|---|
| `julio_24_30` | `JDGAG` solo | `3289-JUNJDGAG` | **2 · 6.011 · 1.878 · 31** | 2 · 6.011 · 1.878 · 31 ✅ |
| `agosto_14_20` | `JDGAG` solo | `3289` **y** `3488` | 5 · 13.107 · 3.588 · 27 | 3 · 6.851 · 1.616 · 24 ❌ |
| `agosto_14_20` | los **tres** desempates | `3488-AGOJDGAG` | 3 · 7.096 · 1.710 · 24 | 3 · 6.851 · 1.616 · 24 ⚠ |

⚠ **En agosto la cuenta es la correcta y los valores no**, con los tres desempates por igual. El
barrido exhaustivo del instrumento dice que **ninguna terna de filas que sume `6.851 / 1.616`
incluye una fila de `3488`**, así que el deck de agosto no sale de esa cuenta tal como está en el
export del 20/08. **`X-28` sigue abierto y esto no lo cierra.**

⛔ **Pregunta al usuario, y la parte se frenó ahí:** ¿cómo se declara el `≤ 30 d`? Un tope **por
solapa** (`SOLAPAS.tope_dias`, que hoy no existe), una **dimensión `cc`** en `DIMENSIONES_` cuya
condición física se calcule, o `CONFIG.tope_dias_ventana_cuenta = 30` **asumiendo el movimiento de
todo lo demás**. Las tres son decisiones y ninguna está escrita.

### ⭐ `X-18` — reformulado y **podado**: el deck no sólo agrupa, **saca**

Medido sobre el fixture del 31/07 (`sha256` verificado) con `tools/medir-asunto-directa-mail.py`.
Ventana 24–31/07, `Tipo de mail ~ M2`: **32 filas · 30 nombres distintos · 27 asuntos distintos**.

**El `30 → 12` del deck NO se explica por colapso.** El equipo **poda** y **reescribe a mano**:

- **Ausentes del deck**: `Vacunación antirrábica (semana del 31/7 al 3/8)` y
  `Repavimentación (semana del 3 al 16/08)`.
- **De las ocho de `Vacaciones de Invierno 2026`** el deck publica *«en plazas (Comuna 5 y 7)»* y
  pierde `Plaza Comuna 11`, `Parque de Invierno`, `Estación de vacaciones` y `Parque de la Ciudad`.
- **Reescritas**: `Luminarias peatonales` → `Luminarias`; `Poda pre` + `Poda post` →
  `Poda (pre y post)`.

⛔ **Ninguna transformación automática produce esa lista, y una que se acercara INVENTARÍA las
campañas que el equipo decidió no publicar.** Por eso la decisión es publicar crudo.

### ⛔ El `Asunto` **descartado** como fuente del conteo de envíos, con las dos razones medidas

1. **Son 27, no 26.** El `26` sale de excluir `TEST Festival para toda la familia`.
2. **El asunto fusiona campañas**: *«Espacio Público e Higiene Urbana»* cubre **6 filas y 5 nombres
   distintos**. Un conteo por asunto no cuenta envíos ni campañas: cuenta plantillas de asunto.

⭐ **Y la observación de método, que es lo que hay que llevarse:** **el `26` satisfacía dos reglas a
la vez** —`27 − TEST` y `32 − 6`— así que **nunca podría haber elegido entre ellas**. Es
`Pruebas.gs:456` otra vez —*un dato que satisface más de una afirmación no distingue entre ellas*—,
esta vez sobre un número del dominio y no sobre un fixture.

⚠ Tres asuntos traen **tokens sin resolver** —`[barriolum]`, `[barriopluviales]`,
`[barrioantirrab]`— y cortan en dirección contraria: un asunto plantilla puede cubrir varios envíos.

### ⛔ `SOLAPAS.modo_periodo` — **evaluada y descartada**

La Parte 1 del `2026-08-25_6` proponía que **la solapa declarara su propio `modo_periodo`**. Se
descarta: **el recorte no es propiedad de la solapa sino de cómo se la lee.** `Directa Mail` se lee
**de las dos formas** —16 marcadores como agregado, 47 por cuenta—, que es exactamente el caso de
`looker/resumen_metricas_dinamico` que `D-30` ya resolvió. Una propiedad de la solapa no puede
decidir algo que depende del llamador.

### ⚠ La Parte E del `2026-08-25_7` no pudo correr como está escrita

Dos premisas medidas contra el repo, las dos falsas:

1. **La regla que cita —*«un deck del equipo no es una foto»*, `CLAUDE.md` §4— no existe.** `grep`
   sobre `CLAUDE.md` y sobre `docs/*.md`: **cero**.
2. **No hay 32 casos `exacto`: hay 112**, en `docs/casos_validacion_2026-08-19.csv`, que es el único
   CSV de casos vivo (260 filas).

⛔⛔ **Y el problema estructural, que es lo que hay que decidir antes de re-correrla: el grupo (c)
—*«se midió, NO reprodujo»*— no puede existir entre los `exacto`.** `exacto` significa, por
definición del documento dueño, *«el valor que publica el deck se reprodujo al dígito desde la
base»*. Un caso que no reprodujo es `contradice` (21), `abierto` (22), `aproximado` (5) o
`sin_fuente` (5). **El barrido corrido tal cual devolvería (c) = 0 por construcción**, y ese cero se
leería como *«no hay candidatos»* cuando lo que pasa es que se está mirando el cajón equivocado.

**Lo que sí se contó, con el criterio declarado** —`base ∈ {deriva, -}` significa que el valor
esperado es una **identidad interna** del propio deck y no se contrastó contra una fuente externa—:

| grupo | cuántos |
|---|---|
| **(a)** identidad interna / sin fuente externa | **10** |
| **(b)** se midió contra el deck y **reprodujo** desde la base | **102** |
| **(c)** | **0**, por construcción — ver arriba |
| **(d)** no clasificable | **0** — el criterio parte los 112 sin residuo |

⭐ **Y la firma que el prompt pide, aplicada donde los candidatos sí viven:** de los **21
`contradice`**, **13 tienen al menos un caso `exacto` en el mismo bloque** —`agregado_semana_jm`
(9 exactos), `resumen_ejecutivo_jm` (16), `ministros_semana_0608` (4), `campania_destacada` (2),
`m2_semana_0608` (1), `enc_almagro_0608` (1)— y **8 no**: `C-04`, `C-13`, `C-14`, `C-24`, `C-53`,
`C-63`, `X-18`, `X-27`.

### ⭐ `camp_titulo` vive en **ocho** láminas, no en una

Medido con `diagCajaDeToken_` contra la plantilla viva: **`L-041` a `L-048`**, todas visibles menos
`L-048`. El usuario lo ubicaba en `L-044` y el repo en `L-048`: **las dos son ciertas y las dos son
incompletas.** Es el bloque entero de campaña destacada.

⚠ **Y contesta la pregunta de por qué `L-044` no figura en el censo del 22/08:** **sí tiene tokens**
—uno, `camp_titulo`— y **ese token tiene fila**. El censo lista sólo los **sin fila**, así que
leerlo como *«la lámina no tiene tokens»* es confundir *«no está en la lista»* con *«no existe»*.

---

## `2026-08-26` — la solapa POST pasa a `IMPORTRANGE`, y lo que quedó abierto

### ⛔ P0 · `MAPEO.por_posicion` está ESCRITO ENTERO y **no corre**, por dos roturas independientes

El mecanismo del `ADDENDUM 2` de `D-31` existe completo —`COLUMNAS_DELTA_`, `leePorPosicion_`,
`claveDeLecturaEnColumna_`, las claves `__pos__N` que `filaAObjeto` agrega a cada fila— y **nunca se
ejecutó una sola vez**. Cada una de estas dos alcanza sola:

1. **`leerMapeoSinCache_` (`Config.gs`) no indexa la columna.** Arma el objeto de `MAPEO` con seis
   campos —`hoja`, `columna`, `encabezado`, `tipo_esperado`, `valores_incluidos`, `notas`— y
   `por_posicion` no está. `leePorPosicion_` evalúa `esVerdadero_(undefined)` → **`false` siempre,
   para toda columna de toda solapa**.
2. **La hoja `MAPEO` no tiene la columna.** Medido el 26/08: **nueve** columnas, y sigue en nueve
   después de correr *Aplicar configuración*.

⛔⛔ **Y por eso arreglar sólo la 2 no arregla nada — y el diff de `instalar()` diría que la columna
se creó.** Se leería como éxito. Es `CLAUDE.md` §2 al pie: *agregar una columna a una hoja de
registro es tocar N lectores, no uno*.

⭐ **El precedente es la MISMA función y la columna de al lado.** `encabezado` (`D-31`) tuvo
exactamente este bug el 16/08, y el comentario que lo arregló —*«la columna existía desde el 14/08 y
esta función no la indexaba»*— **está tres líneas arriba de donde falta `por_posicion`**.

⚠ **Qué costó, medido:** del 25 al 26/08 `vis_totales` y `vis_vtr_pct` de `L-036` leyeron
**Programmatic** —`55.902` donde el acumulado era `282.480`, y `63,5 %` donde era `62,7 %`— con
tres bancos en verde afirmando que `por_posicion` estaba declarado. **Lo declarado era cierto; lo
que no corría era el mecanismo.**

⭐ **Hoy no urge y por eso queda acá y no en `Próximo`:** la solapa que lo necesitaba pasó a títulos
únicos, así que **no hay ningún consumidor vivo**. `por_posicion` se **retiró** de las dos filas del
seed —una declaración sin efecto es indistinguible de una que funciona— y el mecanismo espera.
⛔ **La próxima solapa con títulos repetidos vuelve a caer al último bloque**, en silencio.

**El control ya está escrito y es lo que hay que dar vuelta al arreglarlo:**
`probar-lectura-por-posicion.js` afirma hoy *«HUECO CONOCIDO: `leerMapeoSinCache_` NO indexa
`por_posicion` → mecanismo INERTE»*. **Cuando alguien lo arregle esa afirmación se pone roja: hay
que darla vuelta, no borrarla.**

### ⚠ La fila 2 de `Agenda JM | Post` es el encabezado VIEJO y entra como DATO

Medido el 26/08: con `fila_encabezado = 1`, la primera fila que devuelve `leerFuente` trae
`ID = "ID"`, `Fecha = "Fecha"`, `Visualizaciones totales = "Visualizaciones"`… — es el **encabezado
anterior**, el de los títulos repetidos, que quedó como segunda fila de la copia.

**Hoy es inofensiva y conviene decir por qué**: su `ID` no matchea ningún `id_cuenta`, así que el
anclaje la ignora, y sus celdas numéricas son **texto**, así que una `SUMA` no la ve.

⛔ **Pero un `CONTEO` cuenta FILAS**, y ésa es la operación cuyo universo son las filas: cualquier
`CONTEO` sobre esta solapa da **uno de más**. Y `SOLAPAS.filas_datos` quedó en **105** contra 104
reales.

⭐ **Lo accionable es del usuario, porque es la planilla:** borrar la fila 2 de la copia, o que el
`IMPORTRANGE` arranque una fila más abajo. **No lo toca Code.**

### ⚠ `K` y `L` cambiaron de título y **no están mapeadas**

`Clics` → `Clics totales` y `% CTR` → `% CTR total`. Hoy no arrastra nada —ninguna fila de `MAPEO`
apunta a esas letras; se cruzaron **las diez** filas de la solapa contra el encabezado vivo y sólo
dos estaban desalineadas—. **Se anota porque el día que alguien mapee `Clics` va a buscar un título
que ya no existe**, y el síntoma va a ser un `«FALTA:»` que apunta al lugar equivocado.

### ✅ CERRADO en el momento · `SEED_SOLAPAS_` declaraba `fila_encabezado: 2`

Y `aplicarClasificacionSolapas_` **escribe esa columna** (es una de las cinco que siembra). O sea
que correr *Aplicar configuración* **habría pisado el `1` que puso el usuario** y devuelto la
lectura al encabezado viejo — con el agravante de que la corrida habría terminado bien.

Se corrigió a `1` **antes** de sembrar, y se verificó releyendo la hoja después (`C-83`).
⭐ **Lo que lo encontró no fue un control: fue leer qué columnas escribe el sembrador antes de
correrlo.** No había nada que lo hubiera avisado.

### Y `IMPORTRANGE` como forma de traer el dato

Las tres consecuencias —origen caído = solapa vacía indistinguible de «no hubo POST», `R-31`
agravado con refresco a mitad de corrida, y el `sha256` que deja de anclar el fixture— van a
**`docs/GRANO_TEMPORAL.md` §4**, que es el dueño de por qué y cómo se recorta cada fuente. Acá sólo
el puntero.

---

## `2026-08-26` — el MECANISMO de impresiones está bien; lo que no da es PROGRAMMATIC

**Decisión del usuario, 26/08:** *«el mecanismo está bien, Programmatic sigue acumulando, ya no
da»*. Queda asentado con lo que lo respalda, medido sobre los dos fixtures con `sha256` verificado
y contra los decks del equipo que viajan en los mismos `.zip`.

### ✅ El mecanismo está bien, y esto es lo que lo prueba

Hasta hoy *«los `imp_*` no reproducen»* era un hallazgo sin localizar: podía ser la ventana, la
pertenencia, el corte por ámbito, la partición por plataforma o el dato. **Ahora está acotado.**

- ⭐ **Por EVENTO cierra al dígito donde la campaña terminó.** Parque Avellaneda (`3487`), PRE Meta:
  el fixture del 20/08 dice **65.554** y el deck del equipo dice **65.554**. El encuentro fue el
  12/08, así que la campaña PRE ya estaba cerrada y no acumulaba más.
- ⭐⭐ **Y donde la campaña sigue viva, la diferencia es el TIEMPO, medido en tres momentos:** POST
  Meta de `3487` va **74.639** (fixture 20/08) → **86.572** (deck ~21/08) → **126.323** (hoja viva
  26/08). Monotónica. **Eso descarta un error de columna y deja sólo el desfasaje.**
- ⭐ **Las identidades internas cierran en las dos etapas:** Meta + Google + Programmatic = total,
  exacto — PRE `65.554 + 0 + 86.572 = 152.126`, POST `74.639 + 132.310 + 35.605 = 242.554`.
- ⭐ **Y el agregado reproduce los casos validados AL DÍGITO** una vez aplicado
  `MARCADORES.filtro = estado=Activa`: `679.647 · 614.140 · 5.992.841`, que son `A-01`, `A-06` y
  `A-07`. La pertenencia, el tope de `R-30`, el corte `ambito=jm` y la partición por plataforma
  **hacen lo que dicen**.

⚠ **Una trampa que hubo que descartar y conviene que quede escrita:** `86.572` es **también**
exactamente `Impresiones Programmatic` de la fila PRE en el fixture. Dos números de cinco dígitos
iguales invitaban a concluir *«el deck tomó la columna equivocada»*. **Lo descarta la progresión de
tres puntos**, que sólo funciona si `86.572` es POST Meta en un momento intermedio. Con dos
mediciones las dos explicaciones eran indistinguibles; hizo falta la tercera.

### ⛔⛔ Lo que no da: PROGRAMMATIC, y es UN problema, no dos

**Programmatic sigue trayendo el ACUMULADO de campaña en vez de la semana**, y ahora está medido en
**los dos granos**, que es lo que lo vuelve accionable:

- **Por evento:** el deck publica `377.997` impresiones Programmatic PRE+POST para `3487`; el
  fixture da `86.572 + 35.605 = 122.177`. **Factor 3.**
- **En el agregado:** `imp_prog` se va **+15,4 %** en julio y **+178,9 %** en agosto.

⭐ **Que falle igual en un solo encuentro que en el agregado de 70 cuentas es el dato bueno:** el
problema **no es del agregado ni de la ventana** —los dos están validados arriba—, es de **la
columna de Programmatic**. Un encuentro, dos números, una diferencia: es el caso más chico posible
para diagnosticarlo.

### Los ocho `imp_*` contra el deck, medidos en las dos semanas

| marcador | julio_24_30 | agosto_14_20 | peor |
|---|---|---|---|
| `imp_meta` | −5,2 % | +8,7 % | **8,7 %** |
| `imp_google` | +15,6 % | +7,3 % | 15,6 % |
| `gcba_imp_meta` | +58,5 % | +2,3 % | 58,5 % |
| `gcba_imp_prog` | +92,4 % | +84,9 % | 92,4 % |
| `gcba_imp_total` | +95,0 % | +59,2 % | 95,0 % |
| `imp_total` | +13,1 % | +98,1 % | 98,1 % |
| `imp_prog` | +15,4 % | +178,9 % | 178,9 % |
| `gcba_imp_google` | +208,5 % | +81,6 % | 208,5 % |

⭐⭐ **DECISIÓN DEL USUARIO, 26/08, con esta tabla delante: sale el `_revisar` de `imp_meta` y
`imp_google`; los otros seis se quedan.** Aplicado por `quitarRevisarDeMetaYGoogle()` y
verificado releyendo la hoja: los dos en `miles`, los seis restantes en `miles_revisar`.

⚠ **Lo que esa decisión NO afirma, y hay que dejarlo escrito porque el sufijo se lee como un
veredicto: que los dos sean exactos.** `imp_meta` está **+8,7 % POR ENCIMA** del deck de agosto,
y el deck es **posterior** al fixture, así que el desfasaje de acumulación sólo podría hacerlo
**mayor**, nunca menor. **Ese residuo sigue sin explicación** — es el mismo razonamiento con el
que `A-06` mandó `imp_google` a `contradice`. Lo que se decidió es que **no amerita publicar
entre guiones**, no que no exista. ⛔ **Queda abierto acá.**

⭐ **Y esto SUPERSEDE el argumento del 22/08** que está escrito arriba de
`marcarProgrammaticARevisar()` —*«un marcado parcial sobre una causa común es peor que
ninguno»*—. Ese argumento era correcto **con lo que se sabía entonces: que la causa era UNA**.
La medición del 26/08 muestra que **no lo es**: Meta y Google se mueven en el orden del
desfasaje y Programmatic se va por factor 3 en un solo encuentro y +179 % en el agregado.

⚠ **Los cuatro `gcba_imp_*` además no tienen caso validado por plataforma**: sus números de acá son
**nuevos y sin validar**, no *validados*. Son dos estados distintos y sólo uno se puede citar.

**Queda como decisión abierta del usuario:** con qué tolerancia un `imp_*` deja de estar en
`_revisar`. Es una celda de `MARCADORES.formato` por marcador y **ningún `clasp push`** (`D-01`).

**El instrumento que reproduce todo esto es `tools/medir-impresiones-resumen.py`**, y su control
positivo es reproducir `A-01`/`A-06`/`A-07`: si algún día deja de hacerlo, el instrumento está mal
y no el motor.

### ⛔ `26/08` (cierre) — la marca NO se repuso, y queda dicho por qué

`docs/VALIDACION_impresiones_2026-08-26.md` mostró que `imp_meta` e `imp_google` **dan por
casualidad**: su universo es el mismo que el de `imp_prog` —dos campañas viejas que aportan el
98–100 %— y los dos encuentros de la semana **no entran**. Con eso, el criterio *«son los que dan»*
con el que se les sacó el `_revisar` esa mañana **quedó sin base**.

**Se recomendó reponer los ocho. El usuario decidió que no** (26/08): el frente que estaba cerrando
es el de **por evento**, que sí cierra, y **los resúmenes se miran aparte y después**.

⚠ **Lo accionable el día que se miren, en una línea:** el estado de esos dos marcadores es
**revisión diferida**, no *validado*. Se reponen con `marcarProgrammaticARevisar()`.

⚠ **Y el dato que hay que tener a mano para no confundir los frentes:** `imp_meta` e `imp_google`
son del **Resumen Ejecutivo** (`L-031`). Los marcadores por evento —`enc_impresiones`,
`post_impresiones1-4`— **nunca estuvieron en `_revisar`**, así que el cierre por evento no dice nada
sobre estos dos.

---

## `2026-08-26` — ⭐⭐ `C-84` · Tres totales de la misma fila, tres universos distintos: uno bien, uno mal y uno que acertaba por accidente

**Estado: cerrado el mismo día que se encontró** (`R-33` deroga `R-28`). Se escribe igual, y no
como historia: **es una forma de falla, no un incidente**, y la parte cara no es la que se veía.

### Lo que había

Los tres totales de la fila de arriba de `L-053` —la que la lámina rotula **`PRE + POST`**— tenían
**tres cortes distintos** en `dimensiones`, puestos por `R-28` el 21/08:

| token | corte | qué era | ¿se veía? |
|---|---|---|---|
| `u1_total_impresiones` | *(vacío)* | ✅ correcto | — |
| `u1_total_clics` | `etapa=pre` | ⛔ **mal**: publicaba **1.472** cuando PRE+POST son **2.464** | **sí**, mirando el rótulo |
| `u1_total_vistas` | `etapa=post` | ⚠ **acertaba por accidente** | ⛔ **no, por ningún lado** |

### ⭐⭐ El del medio es el hallazgo; el de la derecha es el que hay que saber buscar

`u1_total_vistas` con `etapa=post` da **exactamente el mismo número** que con el corte vacío
—148.514 sobre el fixture del 20/08, 282.497 sobre la base viva— porque **las dos filas PRE de esa
cuenta traen `0` visualizaciones**. O sea: **el corte equivocado no produce ningún síntoma.** No
hay número raro, no hay `FALTA`, no hay traza distinta. El día que una campaña PRE lleve video,
empieza a publicar de menos **sin fallar**.

⭐ **Es *un número correcto salido de las filas equivocadas* (`CLAUDE.md` §4) en su forma más
barata de cometer y más cara de encontrar:** el universo equivocado y el correcto **coinciden hoy**,
y sólo divergen cuando los datos cambian de forma.

### ⛔ Y lo que NADA detectaba: que los tres cortes fueran distintos

Las tres filas viven en la misma tabla, se pintan en la misma fila de la misma lámina y contestan
la misma pregunta con tres universos. **Ningún control del repo miraba eso**, porque todos los
controles de `MARCADORES` son **por fila**: cada una de las tres estaba internamente bien formada.

⭐ **La afirmación que faltaba no es «cada uno lleva el corte X»: es «los tres llevan EL MISMO».**
Está en `tools/probar-totales-u1.js`, y el wrapper `alinearTotalesDeUnoAUno()` la hace estructural
—declara el corte **una sola vez** y lo aplica recorriendo `TOTALES_UNO_A_UNO_`—, así que separar
uno de los tres exige editar la línea que los une en vez de una celda suelta.

### ⚠ La pregunta que queda abierta, y es la que generaliza

**¿Cuántas otras filas del deck tienen varios marcadores que contestan la misma pregunta con
cortes distintos?** Nadie lo midió. Los candidatos naturales son las filas de totales de las otras
láminas con desglose por plataforma —`L-046` la primera—, pero **eso es una sospecha, no una
medición**, y va escrita como tal.

⛔ **No se convierte en trabajo acá**: `L-046` tiene su propio prompt en la cola.

### ⚠ Lo que este cierre deja divergiendo a propósito

El motor publica **2.464** donde el deck del equipo del 21/08 publicó **1.472**. Está en `R-33` y
en `docs/CONFIG_INFORMES.md` §1.13. **Es una decisión, no un pendiente** — no se abre como caso.

### ⚠ Y dos ⛔ de `L-053` que quedaron sin explicar, a propósito

`ecv_barrio` y `ecv_fecha` **resuelven `ok`** contra la base viva y el deck del 22/08 los publicó
`/////`. La validación del 26/08 los anotó y **no investigó la causa** —la consigna era completar
la tabla, no resolver el primero que fallara— y el cierre de hoy **no los tocó**. Siguen abiertos.

---

## `2026-08-26` — `C-85` · `ecv_barrio` y `ecv_fecha` resuelven bien y el deck los publicó `/////` · **hipótesis nueva, sin confirmar**

**Estado: abierto. Anotado, NO investigado** — decisión explícita, las dos veces que apareció.

**El hecho, medido:** los dos marcadores resuelven `estado = ok` contra la base viva —`ecv_barrio`
devuelve `Parque Avellaneda`, `ecv_fecha` devuelve `12/08`— y el deck del **22/08 14:02** publicó
**`/////`** en las dos cajas. `/////` significa que `resolverMarcadores` **no devolvió resultado**
para ese token, que es justo lo contrario de lo que se mide hoy.

### ⚠ La hipótesis nueva, y va marcada como hipótesis

En el `.pptx` exportado, el título de la lámina está **partido en tres runs de texto**:

```
'Uno a uno en {{ecv'   ·   '_barrio}} ({{ec'   ·   'v_fecha}})'
```

`replaceAllText` busca **una cadena continua**, y ahí no existe: ningún run contiene
`{{ecv_barrio}}` entero. Si la plantilla viva estuviera igual, los dos tokens no se podrían
reemplazar nunca — y el síntoma sería exactamente `/////`.

⛔ **Puede ser un artefacto de la exportación a `.pptx` y no el estado de la plantilla.** Google
Slides parte runs por razones de formato al exportar, así que **lo que se ve en el `.zip` no prueba
lo que hay en Drive**. Es la familia de *¿estoy mirando lo que creo que estoy mirando?*
(`CLAUDE.md` §4).

### ⭐ Cómo se verifica, en una línea, el día que se decida hacerlo

Mirar si el título de `L-053` **en la plantilla viva** está en un solo run —`piezasDeTextoDeSlide_`
ya recorre eso— y comparar contra los tres runs del export. **Si en la viva está entero, la
hipótesis se cae y el hallazgo es otro.**

⚠ **No se hizo hoy**, y no por falta de tiempo: la consigna de las dos corridas fue completar la
tabla y cablear, no diagnosticar. Se anota para que la próxima vez que aparezca el `/////` no se
vuelva a descubrir desde cero.

---

## `2026-08-26` — ⚠ `--reintentar` de `tools/api.js` sobre una llamada que ESCRIBE

**Estado: sin consecuencia esta vez. Anotado porque la próxima puede tenerla.**

`cablearClicsDePostDeUnoAUno()` se invocó con `--reintentar`. La primera respuesta volvió como
**HTML 404** —la ejecución del lado de Apps Script **sí había corrido**— y el cliente reintentó,
así que **el alta se ejecutó dos veces**.

⭐ **No pasó nada, y el motivo es del escritor, no de quien lo llamó:** `curarMarcadores_` **borra
por clave antes de agregar**, así que la segunda corrida reemplazó las seis filas en vez de
duplicarlas. Verificado: `MARCADORES` quedó en **216 filas** (210 + 6) y el conteo de duplicados por
`marcador||informe_id` dio **0**.

⛔ **Y el propio `tools/api.js` lo dice en su encabezado:** *«`--reintentar` … **No es el default.**
Sólo lo pide quien sabe que la llamada NO escribe»*. La bandera se usó por costumbre, contra una
advertencia escrita. **Un escritor idempotente por clave lo absorbe; uno que hiciera `append` no.**

⚠ **La regla operativa, para que no dependa de acordarse:** en una llamada que escribe, **no** se
pasa `--reintentar`; si la respuesta se pierde en el transporte, se **relee la hoja** para saber si
la escritura ocurrió, en vez de repetirla a ciegas.

---

## `2026-08-26` (cierre) — `L-046`: `X-19` cerrada, y dos formas de error que costaron cuatro premisas

### ⭐⭐ `C-86` · Un registro que declara PUBLICACIONES es una lista, no un catálogo de entidades

**Estado: cerrado como forma. La confusión concreta, corregida.**

`CAMPANAS` declara `3481-AGOINFAN` (Autódromo) y `3509-AGOSEGGJ` (Mugica) con **`informe_id: jm`**,
y de ahí se las tomó como campañas **de ámbito JM**. **No lo son:** medido el 26/08 sobre la base
viva, las dos son **`GCBA`** en las **nueve** columnas candidatas del desglose —`JM | GCBA |
POLICIA`, `Eje`, `eje`, `Cuenta`, `area`, `proyecto`, `Objetivo`, `Tipo Campaña`, `Prioridad`—.
**No hay corte bajo el cual sean JM.**

⭐ **El error no fue leer mal una columna: fue leer un registro como si fuera un catálogo.**
`CAMPANAS.informe_id` contesta *«¿en qué informe se publica esto?»* y se lo leyó como *«¿de qué
ámbito es este dato?»*. **Son dos preguntas distintas y la respuesta coincide casi siempre**, que es
lo que la vuelve difícil de ver: un informe de JM publica sobre todo campañas de JM.

⚠ **Es la familia de *dos cosas que se llaman igual no son la misma cosa*** (`CLAUDE.md` §4), un
escalón más arriba: acá no se confunden dos referentes homónimos, se confunde **la pregunta que un
registro contesta** con otra que nadie le hizo.

⭐ **Lo accionable, y se hace antes de usar una columna de un registro como corte:** *¿esta columna
describe la ENTIDAD, o describe qué hacemos con ella?* `informe_id`, `mostrar`, `orden`, `activo`,
`tipo` describen lo segundo. Un corte de universo se toma de lo primero.

⛔ **Y el síntoma fue un control positivo que falló bien:** el filtro de fecha leía perfecto —las
dos cuentas aparecían, con sus fechas— y lo que falló fue la premisa de a qué ámbito pertenecían.
**Sin ese control, la tabla JM/GCBA se habría publicado con 4 filas en JM como si fuera un
resultado.**

---

### `C-87` · `X-19` — **CERRADA por reproducción, con una campaña, y la otra nombrada**

**Estado: cerrada el 26/08/2026.** Decisión del usuario.

`X-19` (`casos_validacion_2026-08-19.csv`, `contradice`) decía que la frecuencia del deck **no
reproduce ni por ratio ni por `looker/ALCANCE`**, y su nota cerraba con *«NO hay que reproducirlo»*.

⭐ **La definición del motor era CORRECTA todo el tiempo.** `camp_frecuencia` es `RATIO` de
`dig_impresiones / alcance`, y eso reproduce:

| | motor, 26/08 | referencia del usuario | |
|---|---|---|---|
| Autódromo `camp_meta_frecuencia` | **1,87** | 1,87 | ✅ |
| Autódromo `camp_frecuencia` | **7,19** | 7,17 | ✅ (la base respiró) |

**Lo que fallaba era el caso contra el que se la probó**, no la fórmula.

⛔ **Y Mugica NO reproduce — va escrito, no omitido.** `camp_meta_frecuencia` da **2,84** contra
1,64, y `camp_frecuencia` **12,16** contra 7,20. **No falla por la fórmula:** el motor lee 1.805.573
impresiones Meta donde la referencia trae 1.026.469, y 7.734.064 totales contra 4.509.115. **Los
operandos son de otra foto de la base.**

⭐⭐ **Cerrar por reproducción real de UNA y nombrar la que no dio es más fuerte que cerrar con dos
donde una no se sostiene** (decisión del usuario). Una tabla con dos ✅ de los cuales uno es falso
no se distingue de una con dos ✅ verdaderos — y el que se cae después se lleva puesta la
conclusión entera.

⚠ **Queda un cabo, y es de higiene:** la `notas` de `camp_frecuencia` —en `Instalar.gs` **y en la
hoja**— sigue diciendo *«X-19 ABIERTA … NO hay que reproducirlo»*. **No se tocó en esta vuelta**
(no estaba en el alcance) y hay que actualizarla, en los dos lados a la vez: cambiarla sólo en el
seed deja el código diciendo una cosa y `MARCADORES` otra.

---

### ⛔ `C-88` · Dos premisas falsas, y el trabajo igual parecía posible

**Estado: anotado como forma.** No es la corrección lo que hay que registrar —eso ya está hecho—:
es que **las dos afirmaciones eran falsas y ninguna de las dos hacía que el paso se viera
imposible.**

| premisa del prompt | qué hay |
|---|---|
| *«el `%VTR` pasa a CALCULADO»* | **ya lo era**: los cuatro son `PCT` sobre `Visualizaciones/Impresiones` desde que se cablearon |
| *«`camp_alcance` ya mapea a `meta_alcance`»* | mapea al **`campo_logico` `alcance` → col K**; `meta_alcance` **no existe como `campo_logico`** de esa solapa |

⭐ **La segunda es la interesante, porque es medio cierta y ahí está la trampa.** La `notas` de
`camp_alcance` en `Instalar.gs` dice, textual: *«Mapea a la columna `meta_alcance` — ver A-12»*.
**Puede ser cierto del ENCABEZADO FÍSICO de la col K y falso del `campo_logico`**, que son dos capas
distintas. ⛔ **No se midió el encabezado**, así que acá no se afirma que la nota esté mal: se
afirma que **`meta_alcance` no resuelve como campo lógico** y que la nota, tal como está escrita,
**no permite distinguir las dos cosas**. Es *un comentario que afirma un contrato es una premisa sin
testigo* (`CLAUDE.md` §4), y el testigo que falta es de una línea: mirar el encabezado de la col K.

⚠ **Por qué esto importa más que las dos correcciones:** un prompt cuyas premisas son falsas pero
cuyo trabajo *parece* ejecutable es el que se ejecuta. La primera habría producido un `cablear*` que
reescribe cuatro filas con exactamente lo que ya tenían —cero celdas escritas, «idempotente», verde—
y la segunda habría documentado como decisión un mapeo que nadie verificó. **Ninguna de las dos
falla; las dos publican.**

---

## `2026-08-26` (cierre de cabos) — los tres que quedaron abiertos al cerrar `L-046`

**Dos eran de etiqueta y cerraron. El tercero midió y NO cerró, que era un resultado previsto.**

### 1 · Las `notas` de `camp_frecuencia` — corregidas **en los dos lados**

Decían *«X-19 ABIERTA … NO hay que reproducirlo»*. `X-19` cerró el 26/08 por reproducción
(`C-87`). Ahora dicen qué reproduce —Autódromo, 1,87 = 1,87 y 7,19 ≈ 7,17—, qué no —Mugica, 2,84
contra 1,64— y **por qué**: los operandos son de otra foto de la base, no falla la fórmula.

⭐⭐ **Y el arreglo no fue editar dos textos: fue dejar UNO.** Las dos notas viven ahora en
`NOTA_CAMP_FRECUENCIA_` y `NOTA_CAMP_ALCANCE_`, constantes de módulo que usan **el seed y el
botón**. *«Los dos lados a la vez»* deja de ser disciplina de quien edita y pasa a ser estructura:
**no hay dos cadenas que puedan divergir.** El botón es `actualizarNotasDeCampana()`, y hace falta
porque `MARCADORES` **no tiene sembrador** — corregir el `.gs` no mueve una celda, y `CLAUDE.md`
§7 dice que **gana la hoja**.

**Escritas y releídas: 2 celdas**, idénticas al código, y el propio botón afirma que ya no dicen
«X-19 ABIERTA» en vez de conformarse con «la celda cambió».

#### ⚠ El barrido de otras menciones, con su cero declarado

| dónde | cuántas | veredicto |
|---|---|---|
| `MARCADORES` (la hoja) | **1** | era `camp_frecuencia`. Corregida |
| `Instalar.gs` | 8 | todas son el texto nuevo o lo citan **dentro de la corrección**. Ninguna vencida |
| ⭐ `Auditoria.gs` | **3** | **NO se tocan, y el motivo importa** |

⭐ **Las tres de `Auditoria.gs` afirman que EL DECK publica 8,4 donde la cuenta da 8,89** —*«el
equipo también se equivoca»*, *«truncar para parecerse hereda el error del equipo»*— y **eso sigue
siendo cierto después del cierre.** `X-19` siempre dijo *«ERROR EN EL DECK, NO EN EL MOTOR»*; lo
que cerró es que **la definición del motor reproduce**, no que el deck haya dejado de estar mal.
**Corregirlas habría borrado una afirmación verdadera** por parecerse a la que había que cambiar.

---

### 2 · El encabezado de la col K — **las dos afirmaciones eran ciertas**

Medido: **`meta_alcance`**. La confirmación quedó dentro de `A-12`, arriba, junto con la causa de
la ambigüedad —el testigo `encabezado` de `MAPEO` vacío— y por qué no se cerró acá. **El mapeo no
se tocó**: `camp_alcance` reproduce (919.500 en Autódromo); esto era la etiqueta, no el dato.

> ## ⛔ CORREGIDO el 26/08/2026 (más tarde el mismo día). **La causa que este párrafo declara es
> FALSA: el testigo de esa fila NO estaba vacío.**
>
> `MAPEO` declara `looker | resumen_metricas_dinamico | alcance | col K | meta_alcance`, y lo
> declara **desde el 15/08**: se rastreó en los 17 snapshots de `MAPEO` y aparece en la primera
> foto posterior a `D-31`. En el código está en `Instalar.gs`,
> `'looker|resumen_metricas_dinamico|alcance': 'meta_alcance'`.
>
> ⭐ **Lo que sí estaba vacío eran otras 30 celdas de `MAPEO`** —19 de
> `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, 4 de `looker/CC` y 7 de `fecha_periodo`—, ninguna de ellas
> ésta. La frase *«el testigo `encabezado` de `MAPEO` está vacío»* era cierta **de la hoja en
> general** y se aplicó **a esta fila en particular**, que es la única de la que hablaba el caso.
>
> ⚠ **Y de ahí salió un pedido de escribir un testigo que ya estaba escrito.** El costo real fue
> bajo porque la medición previa a escribir lo detectó; lo que hay que retener es la forma: **una
> causa plausible, verdadera en otro ámbito, citada sin verificar en éste.** Es la familia de *un
> «no está» sin ámbito* (`CLAUDE.md` §4) y de *un dato medido una vez y citado tres veces*.
>
> **Lo que sigue en pie:** el encabezado físico de la col K dice `meta_alcance`, `alcance` es el
> campo lógico, y `camp_alcance` reproduce. Nada de eso cambia.

---

### ⛔ 3 · `C-89` · Por qué fecha recorta el panel — **NO cierra, y no por poco: `looker/DIGITAL` no tiene columna de fecha**

> ## ⛔⛔ CORREGIDO el 26/08/2026 por `C-90`. **La conclusión de abajo está MAL.**
>
> **Lo que sigue siendo cierto:** `looker/DIGITAL` no tiene columna de fecha **propia**. Las
> nueve columnas y las tres vías de confirmación están bien medidas.
>
> ⛔ **Lo que está mal es lo que se concluyó de eso:** *«los recortes no son aplicables»* y
> *«no hay por dónde»*. **Sí hay por dónde** — la fecha vive en `looker/Cuentas` y llega por
> el `id_cuenta`. **El motor ya lo hace**: `SOLAPAS.ventana_ref = "Cuentas"` y `Fuentes.gs`
> tiene el mecanismo entero. Con la ventana real, `leerFuente` devuelve **377 filas**.
>
> ⭐⭐ **Y el dato que desmentía la conclusión estaba en la salida del propio instrumento:** el
> volcado de `SOLAPAS` que esa medición imprimió **dice `ventana_ref: "Cuentas"`**. Se leyó la
> firma de encabezados de esa misma línea y no el campo de al lado.
>
> **El veredicto final no cambia —ninguno de los tres recortes reproduce— pero el motivo sí,
> y mandaba a lugares opuestos:** *«no se puede recortar»* cierra la puerta; *«se recorta y no
> da»* la deja abierta con un número al lado. Ver `C-90`.

**Los tres recortes dieron CERO. Los tres.**

| recorte | JM | GCBA |
|---|---|---|
| (a) solape `inicio ≤ 20/08 && fin ≥ 14/08` | 0 filas | 0 filas |
| (b) inicio dentro de la ventana | 0 filas | 0 filas |
| (c) fin dentro de la ventana | 0 filas | 0 filas |

⭐ **No es que no reproduzcan: no son aplicables.** `looker/DIGITAL` tiene **nueve** columnas y
**ninguna es de fecha** — `Id cuentas · Plataforma · Impresiones · Visualizaciones · Clics ·
nombre_campaña · eje · area · estado`. Confirmado por tres vías independientes: los encabezados que
devuelve `leerFuente`, `SOLAPAS.firma_encabezado`, y `MAPEO`, que **no resuelve** `fecha_inicio`,
`fecha_fin` ni `fecha_periodo` para esa solapa.

⭐ **Control positivo, y era necesario:** sin filtro de fecha el mismo corte por ámbito ve **545
filas JM (203.188.381)** y **3.302 GCBA (2.225.854.078)**. O sea que **el instrumento lee bien** y
los ceros son del dato, no del código. Sin esta medición, «no hay» y «no miré» se veían igual.

⛔⛔ **Y esto ya estaba escrito: es `R-29`.** *«`looker/DIGITAL` — una fila por campaña × plataforma,
**sin columna de fecha propia**»* = **fila de ESTADO**, y sobre una fila de estado **ningún recorte
por ventana arregla el número**. La pista de `PENDIENTES` —*«filas de `looker/DIGITAL` con un
recorte que no es la ventana»*— **no puede ser un recorte por fecha sobre esta solapa**, porque no
hay por dónde.

⭐ **Se para acá, como estaba previsto.** `contenidos_total` sigue **declarado no cableable**
(`CONFIG_INFORMES` §1.14) y **no se inventó un cuarto criterio para que cerrara** — eso es
exactamente el número plausible que este repo persigue.

#### ⚠ La pista que queda, dicha por el usuario y NO investigada

> *«Si necesitás cuentas en `digital` las traés de `Cuentas`; el join es con el ID.»*

Queda anotada como **lo próximo a probar** si alguien retoma de dónde sale el recorte del panel: la
fecha podría vivir en `Cuentas` y llegar a `DIGITAL` por el `id_cuenta`, que es justamente la clave
que `SOLAPAS.campo_id_cuenta` ya declara para esa solapa (`ldig_id_cuenta`). **No se midió en esta
vuelta** — la consigna era cerrar tres cabos, no abrir el cuarto.

---

## `2026-08-26` — ⛔⛔ `C-90` · El recorte del panel, **bien medido**: los tres criterios se aplican y ninguno reproduce

> ## ⚠ ADDENDUM del 26/08/2026 — el reparto por ÁMBITO de la tabla de abajo era **por resta**
>
> ⭐ **Lo que NO se movió, y va primero para no obligar a remedir todo:** el control positivo
> cubría el **recorte por FECHA** —las **377 filas**, reproducidas exacto contra `leerFuente`—
> y **eso sigue firme**. También siguen firmes las 1.027 cuentas con fecha y las cero
> huérfanas. **Lo que se cae es sólo el reparto JM/GCBA.**
>
> La tabla de abajo repartió con `nombre_campaña~=JM` y **GCBA por resta** —todo lo que no
> dice JM—, que es como lo define `DIMENSIONES_` (`D-33`). Con el corte **positivo** de la
> columna `JM | GCBA | POLICIA`, traído por id desde el desglose, sobre las mismas 377 filas:
>
> | corte de ámbito | JM | GCBA |
> |---|---|---|
> | por resta (`nombre_campaña~=JM`) — *la tabla de abajo* | 31 · 16.426.952 | 346 · 296.551.180 |
> | ⭐ **positivo (columna `JM \| GCBA \| POLICIA`)** | **4 · 2.808.426** | **373 · 310.169.706** |
> | el panel | 28 · 6.493.272 | 269 · 92.486.506 |
>
> **El veredicto no cambia: ninguno reproduce.** Lo que cambia es que ahora hay *dos* cortes
> y **se contradicen** — ver `C-91`, que es el hallazgo de verdad.
>
> ⚠ **La tabla de abajo no se edita**: es lo que se midió, con el criterio que se usó.

**Corrige a `C-89`, escrito horas antes y equivocado en su conclusión.** La pista la dio el usuario:
*«looker digital hace join con cuentas, que tiene fecha inicio y fin»*.

### Cómo se midió mal la primera vez, que es la parte que hay que no repetir

⛔ **Se leyó `looker/DIGITAL` con una ventana 2020–2030 y después se aplicó un filtro propio sobre
`fecha_inicio`/`fecha_fin`.** Esas columnas no existen en esa solapa, así que el filtro descartó
todo y devolvió cero — **y el cero se leyó como «no se puede recortar»**.

⭐ **Los dos errores son uno solo:** la ventana ancha **desactivó el recorte del motor**, y el
filtro propio **reimplementó ese recorte y lo reimplementó peor**. Es exactamente lo que
`CLAUDE.md` §4 nombra: *un instrumento que reproduce lógica del motor y la reproduce peor*, con el
agravante de que acá el motor ya tenía el mecanismo escrito y probado.

⭐⭐ **Y el corolario más caro: el dato que desmentía la conclusión estaba impreso en la salida de
la propia medición.** El volcado de `SOLAPAS` de `C-89` incluye, textual,
`"ventana_ref":"Cuentas"`. Se leyó `firma_encabezado` —el campo de al lado— para confirmar la
hipótesis, y no el campo que la refutaba. **Un instrumento que imprime la respuesta no sirve de
nada si quien lo lee ya sabe qué va a encontrar.**

### La medición buena

El motor recorta solo: `leerFuente("looker", ventana real, "DIGITAL")` devuelve **377 filas** y
declara el criterio en su propia traza:

> *«referencia — la ventana sale de `looker/Cuentas`, cruzada por `clave_ventana` (`Id cuentas` acá,
> `id_cuentas` allá); esa solapa se recortó con criterio: **solape (R-16)**»*

⭐ **Control positivo de la reimplementación**, sin el cual (b) y (c) no valdrían nada: el criterio
(a) rehecho a mano **reproduce exactamente** lo del motor —31 JM y 346 GCBA— sobre **1.027 cuentas,
todas con fecha legible, y CERO filas huérfanas**.

| criterio | JM filas | JM impresiones | GCBA filas | GCBA impresiones |
|---|---|---|---|---|
| **el panel** | **28** | **6.493.272** | **269** | **92.486.506** |
| (a) solape — *el que usa el motor* | 31 | 16.426.952 · **×2,53** | 346 | 296.551.180 · **×3,21** |
| (b) inicio en la ventana | **0** | 0 | 59 | 20.850.483 · ×0,23 |
| (c) fin en la ventana | 22 | 9.671.770 · ×1,49 | 91 | 122.710.385 · ×1,33 |

### ⛔ Veredicto: ninguno reproduce, y se para acá

**Ninguno da 28 y 269.** El más cercano en filas para JM es (a) —31 contra 28—; el más cercano en
impresiones es (c) —×1,49 y ×1,33—, y sus filas no dan. **No hay un criterio que acierte las dos
cosas**, y **no se inventa un cuarto para que cierre**: eso es el número plausible que este repo
persigue.

⭐ **Lo que sí se puede decir, y es una lectura de una regla que ya existe, no un hallazgo nuevo:**
el patrón —**filas del orden correcto, impresiones ~3×**— es el que `R-29` predice para una **fila
de estado**. `looker/DIGITAL` es una fila por campaña × plataforma con el **acumulado desde que
arrancó**, y *«sobre una fila de estado ningún recorte por ventana arregla el número: el recorte
elige qué filas entran, no puede recortar lo que hay adentro de una fila»*. **Es consistente, no
está probado**, y probarlo es otro trabajo.

⚠ **`contenidos_total` sigue declarado no cableable** (`CONFIG_INFORMES` §1.14) — pero ahora por un
motivo mejor medido: **no es que no se pueda recortar; es que ningún recorte reproduce.**

---

## `2026-08-26` — ⛔⛔ `C-91` · `looker/DIGITAL` tiene **dos** candidatos a corte de ámbito y son **DISJUNTOS**

**Estado: abierto. Es un hecho sobre la base, no una medición fallida.**

Los dos candidatos **no se solapan en una sola fila** de las 377 de la ventana 14–20/08:

| | filas | de ésas, con «JM» en `nombre_campaña` |
|---|---|---|
| marcadas **`GCBA`** en la columna `JM \| GCBA \| POLICIA` | 373 | ⛔ **31** |
| marcadas **`JM`** en esa columna | 4 | ⛔ **0** |

⭐ **Las 31 filas que dicen «JM» en el nombre están marcadas `GCBA` en la columna, y las 4 marcadas
`JM` no dicen JM en el nombre.** Intersección: **cero**.

⛔ **Y ninguno de los dos reproduce el JM del panel** —28 filas / 6.493.272—: por resta da 31, por
la columna da 4.

**No hay una tercera columna que mirar.** En la ventana, `looker/DIGITAL` ofrece `eje` (7 valores:
M2, Cuidado, Reforma del Estado, Cercanía, Ciudad Atractiva, Movilidad, Otros), `area` (17) y
`estado` (4: Activa 216 · Finalizada 144 · Pendiente 16 · Pausada 1). **Ninguna es ámbito.**

⚠ **Y un dato chico que es la forma de un problema, no un suelto:** de los 769 ids con ámbito en el
desglose, **1 está en conflicto** — el mismo `id_cuenta` aparece con dos ámbitos distintos. Hoy es
uno; la clave que lo permite es la misma que permitiría veinte.

### ⭐⭐ Es la otra cara de `C-86`, y por eso van juntos

En `C-86` un registro —`CAMPANAS.informe_id`— **no contestaba** «¿de qué ámbito es este dato?»,
aunque lo pareciera. Acá hay **dos columnas del dato** que sí parecen contestarlo **y se
contradicen entre sí**.

⇒ **La base no tiene el corte de ámbito que el Resumen Ejecutivo necesita.** Eso deja de ser una
medición que falló y pasa a ser **una propiedad de la fuente** — que es otra clase de hecho, y
manda a otro trabajo: no a medir mejor, sino a preguntar cuál es el criterio.

### ⛔ Lo que NO se hace acá

**No se elige cuál de los dos es el bueno, ni se propone un tercero.** Cuál usa el panel —o si usa
otro— es la pregunta, y va **sin candidatas**: inventar un criterio para que 28 y 269 cierren es
exactamente el número plausible que este repo persigue.


---

## ⛔⛔ 27/08/2026 · Un filtro que descartaba sin contar — **la tercera vez en dos semanas**

**Abierto → CERRADO el mismo día** (`D-46`). Se anota igual porque **la figura ya va por la
tercera vuelta** y eso es lo que vale, no el arreglo.

`leerReuniones_` filtraba `fila[eje] && esVerdadero_(mostrar)`. Una línea de temario que el parser
no interpretaba quedaba con `eje` vacío, **se podía tildar**, y **nunca llegaba al anclaje**. El
mensaje de fallo culpaba al **período**, que era inocente.

⛔ Y el único diagnóstico que existía para explicarlo —`reunionesOcultasPorMostrar_`— abría con
`if (!fila[idx.eje]) return;`: **descartaba sin contar exactamente la fila que causó el fallo.**

**Las tres vueltas, y las tres son la misma forma:**

| fecha | el conteo decía | lo que había pasado |
|---|---|---|
| 25/08 | *«descartadas por período: 6»* | las 4 de julio se fueron antes, por `mostrar` |
| 25/08 | *«`leerFuente` trae 672 campañas»* | el recorte vive en el **llamador**; el camino real da 19 |
| ⭐ **27/08** | *«no hay filas para anclar»* | la fila se fue antes, por **`eje`**, y ese filtro **no contaba** |

⭐ **Lo accionable, que ya está escrito en `CLAUDE.md` §4 y hay que seguir aplicando: un filtro
nuevo NACE CONTÁNDOSE**, y **habla también cuando no encuentra nada** —sin esa segunda mitad,
*«no hay»* y *«no miré»* se ven igual—. `reunionesSinTextoOriginal_` lo hace desde el día uno.

---

## ⚠ 27/08/2026 · `R-02` está citado con dos sentidos distintos, y uno es el equivocado

**Abierto.** Medido, **no corregido** — no era el objetivo del `2026-08-27_2`.

La regla *«el temario define el universo, no la fecha»* es **`R-04`**. `R-02` es *«criterio de
fuente cruda (exclusión de solapas)»*. La colisión **ya está explicada** en la nota de numeración
del propio `R-04`: se documentó primero como `R-02` en su prompt de origen y el ID ya estaba tomado.

**Censo del 27/08 sobre `.gs` y `.html`:**

| sentido | citas |
|---|---|
| ⛔ temario, citado como `R-02` — **equivocado** | **17** — `Generador.gs` 1 · `Instalar.gs` 4 · `Panel.html` 3 · `PanelBackend.gs` 2 · `Reuniones.gs` 1 · `Union.gs` 4 · (2 más) |
| ✅ fuente cruda, citado como `R-02` — **correcto** | **7** — `Auditoria.gs` 1 · `Fechas.gs` 1 · `Instalar.gs` 5 |

⚠ **Por qué no es cosmético:** las dos reglas existen y **dicen cosas distintas**. Alguien que siga
la cita desde `Union.gs` llega a un criterio sobre solapas con banner de período y **no encuentra
nada sobre el temario** — y la conclusión razonable es que la regla no existe.

⭐ **Las citas nuevas dicen `R-04`.** Las 17 viejas se corrigen cuando alguien toque esos archivos
por otro motivo: una pasada de mantenimiento sobre 6 archivos para cambiar un número es trabajo que
no rinde, y el `DOC-7` ya fijó ese criterio para los prompts.

---

## 2026-08-27 (3) — dos cerrados, y tres nuevos que salieron de cerrarlos

### ✅ CERRADO · **P0 · «Misma condición, dos comportamientos»** (abierto el 25/08)

Era la pregunta que este documento declaraba explícitamente *«no la decide Code»*. **La decidió el
usuario el 27/08: gana la que falla** — y quedó como `D-48`.

⭐ **Pero no quedó en dos salidas sino en TRES, y eso no salió de un razonamiento: lo impuso un dato
del dominio.** El usuario avisó que el encuentro del temario del 27/08 **no tuvo mail**. Con la
regla de la rama de `post_*` aplicada al pie —*declarada y sin filas → `FALTA`*— una caja sin mail
publicaría `«FALTA»` sobre un hecho perfectamente normal. **El discriminador ya existía y ya
viajaba: `items`.**

⛔ **Y la misma falla estaba en la rama de `post_*`**, que fallaba con `filas.length === 0` **sin
mirar `items`** — o sea que confundía *«el temario no trajo nada»* con *«ningún encuentro tuvo
comunicación post»*, **que su propio comentario ya llamaba caso normal con todas las letras**.
Arreglada también; es un cambio de comportamiento sobre `L-036`.

### ✅ CERRADO · la mitad **(b)** de `ecv_alcance_semanal.itera_sobre` (abierto el 25/08)

Decía: *«que la rama 2 falle en vez de caerse, que es lo único que convierte esa celda en un error
visible en vez de un número plausible»*. Hecho: si la sección no califica, los 21 marcadores de
`rdv` fallan con `«FALTA:…@sin_temario»` **y el motivo literal de `seccionAgregadaDeReuniones_`
viaja adentro** —*«itera_sobre = "" y tiene que ser `REUNIONES`»*—, no a un log que se pierde.

### ⛔ NUEVO · una solapa sin `campo_id_cuenta` en una lámina gobernada publica el universo ancho

`D-47` hace que una lámina gobernada por el temario arme sus `claves_temario` desde las solapas de
sus marcadores **que declaran `SOLAPAS.campo_id_cuenta`**. Las que **no** lo declaran no se recortan
y **siguen publicando el universo de la ventana**.

**No frena la corrida a propósito:** en una lámina gobernada conviven marcadores que sí se recortan
y otros que legítimamente no —un `periodo`, un título—, y hacerlos fallar a todos cambiaría un
problema por otro. **Pero va al log con nombre**, porque callarlo es `X-41`.

⚠ **Lo que falta y es del usuario:** mirar esa línea después de la primera corrida y decidir, por
solapa, si se declara la celda o se acepta el universo ancho. **Hoy no se sabe cuántas son** — se
sabrá cuando la corrida lo imprima.

### ⛔ NUEVO · `CLAVES_DEL_TEMARIO_` es una lista a mano que sólo se puede verificar en una dirección

Los siete nombres que `D-47` recorta por lámina se asignan **en otro lado**
(`opcionesEtapa4.X = …`). `probar-universo-por-lamina.js` verifica que **los siete se asignen de
verdad**, así que un renombre allá se caza. ⚠ **La dirección inversa no se puede decidir sola:** si
alguien agrega una clave del temario y no la pone en la lista, **ningún patrón sabe que era “del
temario”** y esa clave se filtra a todas las láminas **sin fallar**. Queda declarada, no cubierta.

### ⚠ NUEVO · dos colisiones de nombre en un día, las dos por no grepear antes de escribir

Las dos son `CLAUDE.md` §1 al pie de la letra y las dos las cometí yo:

1. **`COLUMNAS_DELTA_.REUNIONES` ya existía** con `periodo_id`, y agregué una segunda clave con el
   mismo nombre. En un objeto literal **la segunda pisa a la primera en silencio**. Fusionadas, y
   `probar-hojas-config.js` gana el control — que **cuenta sobre el TEXTO**, porque evaluar el
   objeto mide el resultado del pisado.
2. **`tools/probar-id-cuenta-declarada.js` ya existía** —el control de `X-39`— y lo pisé escribiendo
   uno nuevo con ese nombre. Restaurado; el mío es `probar-reunion-id-cuenta.js`.
   ⭐ **La señal estaba y no la leí: el runner siguió diciendo 65 bancos.** *Un banco nuevo que no
   mueve el conteo es un banco que reemplazó a otro* — vale como chequeo barato.

---

## `2026-08-28` — ⛔⛔ `C-92` · La capa de acceso: tres testigos que no coinciden y un mecanismo que no existe

Salen de la Parte A del `2026-08-28_1`. El diseño completo, con las opciones y las preguntas, vive
en **`docs/SEGURIDAD.md`** — que desde hoy es el dueño de la pregunta en `CLAUDE.md` §7. Acá van
sólo las dos inconsistencias, **abiertas y sin resolver**: derogar una decisión es del usuario.

### `C-92` · **P0** · `D-15` ↔ el manifiesto ↔ la fila del 23/08 — tres testigos de lo mismo

| testigo | qué dice | dónde |
|---|---|---|
| `D-15` | *«El panel se despliega como **ejecuta el usuario que accede**»* | `docs/PLAN.md:181-194` |
| el manifiesto | `executeAs: "USER_DEPLOYING"` — **lo contrario** | `appsscript.json` |
| la decisión del 23/08 | *«El motor ejecuta con SU identidad … ⛔ **Deroga `D-15`** … ⚠ El `D-NN` que las supersede **NO se escribe hoy**»* | `docs/PLAN.md:3326` |

```
sed -n '181,195p' docs/PLAN.md ; sed -n '3326p' docs/PLAN.md ; cat appsscript.json
```

⛔ **No se resuelve acá**, y no es prudencia de más: `D-15` declara en su propio texto que está
**acoplada a `D-02`** —*«no son decisiones independientes»*—, así que el `D-NN` que la supersede
arrastra a la otra. **Eso es del usuario.**

⚠ **Y una corrección de referencia:** el prompt pedía la tercera cita en *«`PLAN.md` §3015»*. **Esa
sección no existe con ese contenido**; las líneas reales son **3321** (fila de `D-16`) y **3326**
(la que deroga). Es la razón por la que `CLAUDE.md` §4 manda resolver las citas por nombre y no por
número.

⭐ **Lo que sí está claro y conviene dejar escrito:** `executeAs: USER_DEPLOYING` **es forzoso**
mientras el script esté *bound* a la planilla de control, porque con la otra opción toda escritura
de `CORRIDAS` y toda lectura de `CONFIG` irían con la identidad del visitante — y compartirle la
planilla es exactamente lo que `D-18` prohíbe. **El código llegó primero a la conclusión correcta;
lo que falta es que la decisión escrita lo alcance.**

### `C-93` · **P0** · `D-16` pieza 3 y `D-18` afirman un compartido de salidas que no existe

```
grep -rn "addViewer\|addEditor\|setSharing\|addViewers\|Drive.Permissions" --include=*.gs --include=*.html --include=*.js .   # cero
grep -rn "ACCESOS" --include=*.gs --include=*.html --include=*.js .                                                          # cero
```

`D-18` dice *«el motor crea el deck en la carpeta de reportes y **lo comparte con quien
corresponda según la hoja de accesos** (`D-16`)»*, y `D-16` pieza 1 dice que la lista *«va a una
hoja (mail × `informe_id` × rol)»*. **Ninguna de las dos cosas ocurrió:** la lista fue a **una
celda de `CONFIG`** —`mails_autorizados`, un solo eje, sin `informe_id` ni rol— y el compartido
**no se escribió nunca**.

⛔ **La consecuencia medible, y es la pregunta que hizo el usuario:** un tercero que esté en la
lista **entra al panel, dispara la corrida, la ve terminar bien — y no puede abrir el deck**. Nadie
le dio permiso sobre el archivo.

⚠ Es una **afirmación de doc sin testigo**, la familia que este proyecto ya conoce: nada la
contradecía porque **nada compara un `D-NN` contra el código que debería implementarlo**. Sobrevivió
un mes en dos decisiones distintas, y las dos se citaban entre sí.

### Y el hueco que queda del lado del control (no es inconsistencia, es cobertura)

`probarBarreraDeMails_` (`Pruebas.gs:1281`) cubre **cuatro de los cinco motivos** de rechazo de la
Barrera 1. Falta **`sin identidad`**, que es justo el que se predice para **todos** los visitantes
bajo `USER_DEPLOYING` sin dominio. La causa: `apiBarrera1_` lee `Session.getActiveUser()` directo,
sin la inyección que `apiListaAutorizados_` sí tiene. Darle banco exige cambiarle la firma a la
función que decide el acceso — **pregunta 5 de `docs/SEGURIDAD.md` §7**, no se hace sin que se pida.

---

## 2026-08-28 (2) — ⛔⛔ `looker/DIGITAL` y el desglose NO cuentan Meta igual: 11×

**Medido**, no supuesto: `tools/medir-looker-vs-desglose.py` cruzó las dos solapas **fila por fila**
sobre el fixture del 28/08 (`sha` verificado), agrupando por `(cuenta, plataforma)`.

| plataforma | grupos | difieren | looker | desglose |
|---|---|---|---|---|
| **Meta** | 766 | **759** | 80.373.882 | **913.951.689** |
| Google ads | 335 | 40 | 645.151.957 | 646.279.305 |
| DV360 | 337 | **1** | 1.792.609.654 | 1.802.861.006 |
| TikTok · Mercado Libre · Twitch · Uber · Twitter | 60 | 7 | ≈ igual | ≈ igual |

⭐⭐ **El desglose tiene ONCE VECES las impresiones de Meta, y DV360 difiere en 1 de 337.** Un
desfase temporal movería todas las plataformas por igual. Que una esté 11× arriba y las otras
clavadas dice que **las dos solapas cuentan Meta de forma distinta** — probablemente una desagrega
por adset o anuncio y la otra no. Es el discriminador de *dos que comparten camino y difieren sólo
en un corte*, usado al revés: **comparten todo salvo Meta**.

**Qué se hizo con eso.** Se revirtió la mudanza de los ocho `imp_*` al desglose (`f334217`): vuelven
a `looker/DIGITAL`, que es la fuente **validada** por `V-73`, `V-59`, `V-74` y `A-01`…`A-03`. El
botón es `volverImpresionesALooker()`.

⚠ **Y se revirtió también `ventana_ref = Cuentas` + `clave_ventana` en el desglose**, que era la
parte que hacía falta para la mudanza. **No es prolijidad: los `u1_*` leen esa solapa POR CUENTA y
publicaron exacto** en la corrida del 28/08 (`V-114`…`V-119`). Meterle un recorte por pertenencia
habría cambiado lo que ellos leen sin que nadie lo pidiera.

### ⛔ La pregunta que queda, y es para el equipo

**¿Por qué Meta tiene 11× más impresiones en `CAMPAÑAS_DESGLOCE_DIGITAL` que en `Base Looker`?**
Una de las dos está contando de más, y hasta saber cuál **no se puede elegir fuente para las
impresiones de Meta**. Mientras tanto manda `looker/DIGITAL`, que tiene los casos validados.

### ⚠ Y un síntoma que quedó SIN diagnosticar, dicho para que no se lea como cerrado

Con la mudanza aplicada, los ocho `imp_*` salieron **`---` (sin dato)** en el Resumen Ejecutivo de
la corrida del 28/08 — no un número inflado, que es lo que el 11× haría esperar. **La causa exacta
de ese `---` no se investigó**: revertir no la necesita, porque la mudanza estaba mal en el fondo.
⛔ **Si después de revertir los ocho siguen en `---`, entonces la causa no era la mudanza** y hay
que mirar la traza — quedaría un segundo problema, tapado por el primero.

⭐ **Lo que NO se rompió, y acota el problema:** en esa misma corrida `L-053` publicó los diez
valores del 1 a 1 **exactos** y `L-034` publicó `-78.962-`, verificado contra el fixture. Los dos
leen el desglose **por cuenta**. El problema es de la **lámina FIJA**, que lo lee por ventana.

### ⚠ Un bug del instrumento, anotado porque casi cuesta el diagnóstico

La primera corrida de `medir-looker-vs-desglose.py` dio totales de **537 mil millones** de
impresiones. No era el dato: era `num()` haciendo `str(v).replace('.', '')` **siempre**, lo que
convierte `55898176.0` —un float que llega como texto— en `558981760`. Es `CLAUDE.md` §4 literal:
*convertir antes de mirar el tipo destruye el tipo*. Arreglado en los dos medidores, y **verificado
que los seis casos validados no cambiaron** —esos venían como número, no como texto—.

---

## 2026-08-28 (3) — ⛔⛔ `C-78` afirma que `Directa Mail` recorta por FECHA PROPIA, y el `snapshot` de `digital` dice que nunca llega ahí

**Estado: abierto.** Lo destapó `D-52`, y no se resolvió porque **resolverlo mueve un número
validado**.

### La contradicción, con las dos mitades al lado

`C-78` (22/08) midió cómo recorta cada marcador del Resumen Ejecutivo y concluyó, sobre
`mail_entregados`:

> *«`digital/Directa Mail` tiene `ventana_ref` VACÍO, o sea FECHA PROPIA, y recorta por ventana
> temporal directa más dimensiones `ambito=jm`. Recorte sólido, sin pertenencia y sin temario.»*

**Y `BASES.digital.modo_periodo` es `snapshot`.** Ese valor **corta en `leerFuente` antes de toda
la lógica de fechas** —es exactamente lo que `D-52` tuvo que sortear para el desglose—, así que
`ventana_ref` vacío **no significa «fecha propia»**: significa que la solapa devuelve **todas** sus
filas y el único recorte que queda es `ambito=jm`.

⚠ **Las dos afirmaciones no pueden ser ciertas a la vez, y una está en un caso `cerrado`.**

### Por qué NO se tocó, que es la parte que importa

`mail_entregados` tiene caso validado: `X-31`, **538.291** sobre seis filas, `sha256` verificado
contra el fixture. **Si hoy publica sin recorte temporal, ese número salió de un universo que no es
el que el caso declara** — o el caso mide otra cosa que lo que su nota dice, que es la familia de
`V-38` (`CLAUDE.md` §1: *la clave manda sobre la nota*).

⛔ **Aplicarle `ventana_ref = 'propia'` a `Directa Mail` es de una celda y es tentador. No se hizo:**
movería `mail_entregados` y `mail_aperturas` **en el mismo deck** donde `D-51` y `D-52` ya mueven el
desglose, y ahí ninguna diferencia sería atribuible (`CLAUDE.md` §4, *un cambio por deck*).

### Lo que hace falta para cerrarlo, en orden

1. **Una corrida** que muestre qué universo trae hoy `Directa Mail` — la traza dice cuántas filas
   entraron y con qué modo.
2. **Cruzar contra `X-31`**: si el número publicado es el del caso, `C-78` describía el efecto y no
   el mecanismo; si difiere, el caso está midiendo un universo que el motor no usa.
3. **Recién ahí**, y en un deck propio, decidir si `Directa Mail` toma `propia`.

⭐ **Lo que ya está medido y no hace falta volver a medir:** el mecanismo de `D-52` funciona y es de
una celda. **Lo que falta es saber cuál es el universo correcto para el mail**, y eso no lo contesta
ningún fixture — el más nuevo de `digital` es del 20/08 y la ventana arranca el 21.

---

## ⛔ P0 · El lector de `.xlsx` de `tools/` corre los valores una columna — 13 herramientas contaminadas, 3 migradas (30/08/2026)

**El defecto.** Google Sheets exporta las celdas vacías **autocerradas** —`<c r="S2" s="2"/>`— y el
patrón `<c\b([^>]*)>(.*?)</c>` de `tools/medir-post-en-desglose.py` **no las reconoce**: arranca en
la autocerrada, consume la celda siguiente entera buscando el primer `</c>`, y le adjudica a la
primera el valor de la segunda. **Los valores sangran una columna hacia atrás, sin fallar.** La
lección de método está en `CLAUDE.md` §4; acá va **quién está contaminado y en qué orden se revisa**.

⭐⭐ **El criterio de exposición, que es lo reutilizable — y que INVIERTE la prioridad intuitiva.**
Contar celdas autocerradas **no mide el daño**: lo que sangra es una autocerrada seguida, **en la
misma fila**, por una celda con valor. Si están al final de la fila —relleno del rango declarado— no
rompen nada. La exposición de una solapa es:

```
la proporción de filas donde una celda autocerrada PRECEDE a una celda con valor
```

**Medido el 30/08 sobre los artefactos de `docs/_fixtures/`** (`Motor_de_Informes_2026-08-30.xlsx`,
`Seguimiento_Digital_2026-08-30.xlsx`, `Base_Looker_2026-08-30.xlsx`):

| solapa | filas | expuestas | **%** | autocerradas |
|---|---|---|---|---|
| ⛔ `motor/CORRIDAS` | 113 | 112 | **99,1 %** | 112 |
| ⛔ `digital/Cuentas` | 4.399 | 4.398 | **100 %** | 58.139 |
| ⛔ `motor/SOLAPAS` | 109 | 84 | **77,1 %** | 244 |
| `digital/Digital` | 1.711 | 1.079 | 63,1 % | 13.612 |
| `digital/Directa Mail` | 2.875 | 1.712 | 59,5 % | 16.729 |
| `digital/CAMPAÑAS_DESGLOCE_DIGITAL` | 5.162 | 2.030 | 39,3 % | 4.645 |
| ⛔ `motor/MARCADORES` | 221 | 74 | **33,5 %** | 157 |
| `looker/resumen_metricas_dinamico` | 1.503 | 333 | 22,2 % | 14.574 |
| `motor/MAPEO` | 202 | 29 | 14,4 % | 43 |
| `motor/BASES` | 7 | 1 | 14,3 % | 1 |
| `looker/Cuentas` | 2.595 | 52 | 2,0 % | 25.046 |
| `digital/Directa IVR` | 161 | 2 | 1,2 % | 2.146 |
| ✅ `looker/DIGITAL` | 5.150 | **27** | **0,5 %** | **33.531** |
| ✅ `looker/CC` · `MAIL` · `IVR` · `motor/CONFIG` · `INFORMES` · `CAMPANAS` · `PERIODOS` | — | 0–1 | **≈0 %** | hasta 72.856 |

⭐ **`looker/DIGITAL` es el ejemplo que prueba por qué no se cuenta el total:** tiene **33.531**
celdas autocerradas —de las más altas de la tabla— y **0,5 %** de exposición, porque son las
columnas J–S del rango declarado, **todas posteriores a `estado`**.

⚠ **Las críticas son las que leen CONFIGURACIÓN, no datos.** `CORRIDAS`, `SOLAPAS` y `MARCADORES`
están arriba de la tabla, y un valor corrido ahí no produce un número raro: produce **una premisa
falsa sobre qué va a hacer el motor**.

**Estado de las 13 herramientas** que comparten la clase `Libro`:

| herramienta | estado |
|---|---|
| `medir-corte-id-cuentas.py` · `medir-corte-parte-b.py` · `medir-looker-atraso-y-config.py` | ✅ **migradas** a `tools/leer_xlsx_por_referencia.py` (30/08) |
| `medir-post-en-desglose.py` (la clase `Libro` misma) | ⛔ **abierta** — es la raíz |
| `medir-desglose-por-cuenta` · `medir-post-en-desglose` · `volcar-nombres-desglose` | ⛔ leen el desglose (39 %) |
| `medir-asunto-directa-mail` · `medir-mail-entregados-jm` · `medir-pisada-union-digital` | ⛔ leen `digital` (59-63 %) |
| `medir-fila-de-cuenta` · `medir-impacto-etapa-post` · `medir-resumen-ejecutivo` · `medir-looker-vs-desglose` | ⚠ mixtas |
| `medir-ambito-looker` | ✅ **verificada intacta**, ver abajo |

✅ **`medir-ambito-looker.py` NO era la primera a revisar, y se confirmó corriéndola con los dos
lectores** sobre el fixture del 28/08 (misma densidad que el 30/08: 27 filas expuestas, 0,5 %):

| | lector roto | lector corregido |
|---|---|---|
| filas `estado=Activa` | 713 | **713** |
| `jm` — filas · meta · google · prog | 17 · 0 · 426.360 · 14.989.761 | **idénticos** |
| `gcba` — meta · google | 8.562.079 · 191.639.326 | **idénticos** |
| `gcba` — programmatic | 276.926.639 | 276.922.898 — **Δ 3.741 · 0,0014 %** |

⭐ **Lo estructural —qué nombres caen de cada lado— está intacto, que es exactamente lo que el
commit `782bf3e` declaraba citable de esa corrida** (*«es citable lo ESTRUCTURAL … y no los
valores»*). El diagnóstico de `L-031`/`L-032` del 28/08 **se sostiene**.

**Cómo se cierra:** migrar `Libro` en `medir-post-en-desglose.py` al patrón
`<c\b([^>]*?)(?:/>|>(.*?)</c>)` y **re-correr en el orden de la tabla de exposición**, no en el
orden del listado. ⚠ **Cada re-corrida puede mover un número ya documentado**, así que va de a una y
con el diff declarado — por eso no se hizo en el mismo prompt que lo encontró.
