# CONFIG_INFORMES — Qué hay que definir en cada informe

> **Documento vivo.** Registra las decisiones de configuración **por informe y por
> sección**: qué se elige en cada corrida, qué se carga a mano, y qué todavía no está
> definido.
>
> **Se completa al final**, cuando el motor ya genere decks y se pueda ajustar contra
> resultados reales. Por ahora sirve para no perder las preguntas y para que el Paso 3
> no invente respuestas.
>
> Estado: **borrador** · última actualización: 29/07/2026.
>
> Convención: **[OK]** definido · **[?]** pendiente de definir · **[MANUAL]** se carga
> a mano en cada corrida, no sale de ninguna base.

---

## 0. Por qué existe este documento

El motor resuelve *de dónde sale cada número*. Pero hay una capa arriba que es
**editorial**: qué campañas entran esta semana, qué encuentro temático se destaca, qué
insight se escribe. Esa capa no se automatiza — y no debería.

> *El sistema arma el informe. Las conclusiones las sigue escribiendo el equipo.*

Este archivo es el inventario de esas decisiones, para que estén **explícitas** en vez
de vivir en la cabeza de quien arma el informe.

---

## 1. Informe semanal JM

### 1.1 Campañas de la semana

**Lo estándar:** van las campañas activas de la semana. **Pero no siempre van todas** —
la selección es curada. [OK como principio, [?] el criterio]

Mecánica: filas en `CAMPANAS` con `mostrar=sí`, ordenadas por `orden`. El motor emite
un bloque de slides por campaña seleccionada (slides 12–19 en JM), usando la ventana de
fechas propia de cada campaña.

#### Decisiones del usuario, 07/08/2026

> **Estas dos decisiones reemplazan a las del 05/08 que estaban acá.** No son un matiz de
> aquéllas: la primera cambia **cuál es el criterio de selección** y la segunda **da vuelta
> una afirmación** que la medición desmintió. Lo que decía antes —*"el default editorial son
> las campañas del período"* y *"máximo cinco envíos, la medición deja de ser necesaria"*—
> **está mal y por eso no se conserva**.

**[OK] El temario elige qué campañas destacadas van, y se buscan en toda la base.** El
período **no** es el criterio de selección. Una campaña destacada **puede ser anterior a la
ventana del informe** y entrar igual: se busca en toda la base, **sin filtro de ventana**.

> **La regla, en una línea: la ventana agrega, el temario selecciona.**
>
> La ventana de `CONFIG` rige para los **agregados** —`ecv_*`, ministros, `m2`—, que son
> sumas de un período. El **temario** rige para lo que se **elige mostrar**: campañas
> destacadas y encuentros. Es el mismo régimen que §1.7 ya documentó para los encuentros, y
> tiene ahí su caso testigo: **San Cristóbal 23/07 con ventana 24–30/07**.

**[OK] El mecanismo sigue siendo `mostrar` + `orden`** en `CAMPANAS`, y ahora se entiende
mejor: **`orden` es el orden del temario**. Eso responde las tres preguntas que estaban
abiertas acá —criterio, máximo y quién decide—: es **curaduría humana sobre dos columnas**.

**[OK] Si una campaña supera cinco envíos, la lámina se repite.** Cinco por lámina, tantas
láminas como hagan falta: **ningún envío se pierde**. `campana_desag_mail` deja de tener un
tope y pasa a desbordar.

> **⚠ La medición que lo motivó tiene una limitación que hay que leer con ella.** `0.6` del
> `Pedido-3` (06/08) agrupó por **`id_cuenta`, no por campaña**, porque `CAMPANAS` **no
> tiene ninguna fila de `jm`** y no existe la campaña contra la cual agrupar. **El proxy fue
> forzado por falta de datos, no elegido.** Lo medido —**6 envíos en ventana**, 52 sin
> ventana, 36 cuentas por encima de cinco— dice que **una cuenta** recibió seis envíos;
> **no** prueba que una campaña los haya mandado. La medición correcta no se puede hacer
> hasta que haya filas de `jm` en `CAMPANAS`.
>
> **La decisión de desbordar se toma igual**, porque el modo de falla que evita —**perder un
> envío en silencio**— no depende de cuál sea el número exacto.

> **⚠ Esto sigue sin derogar `D-19`, y ahora el motivo es más simple.** `periodo_id` es **el
> informe en el que la campaña aparece**, no el período de sus fechas. Las fechas de la
> campaña son propias y **pueden caer fuera** de la ventana de ese informe — es justamente
> lo que habilita la decisión de arriba. Por eso el motor **no puede deducir la celda**: no
> hay nada que deducir, es una decisión editorial. La escribe **una persona**.

**La fuente ya estaba resuelta:** la fila de la que salen los `camp_*` es **Seguimiento
Digital**, fijada en **§4.1** de este mismo documento. No se repite acá — se apunta.

Preguntas que siguen abiertas:
- **[?]** Si una campaña cruza dos semanas, ¿se muestra acumulada o solo el tramo de
  la semana? Esto **cambia el número**, no solo la presentación.

### 1.2 Período

**[OK]** Semana cerrada, de `CONFIG.periodo_desde` a `periodo_hasta`.
**[?]** ¿El motor propone la última semana cerrada por defecto, o siempre se carga a mano?

### 1.3 Bloques con período propio

**[OK]** M2 reporta **mensual** dentro del informe semanal → `periodo_ref = m2_mensual`
(hoja `PERIODOS`). Es el caso que justifica las tres capas de resolución de período.
**[?]** ¿Hay otros bloques con período propio? (RRSS quincenal aparece en `PERIODOS`
como ejemplo — confirmar si es real.)

### 1.4 Carga manual

- **[MANUAL]** Los tres barrios destacados (`ecv_barrio1-3`) — ¿o salen por ranking
  automático de asistentes? **[?]**
- **[MANUAL]** Conclusiones y lecturas del período.

> **⚠ Esa `[?]` resuelve dos huecos a la vez, y por eso conviene preguntarla.** (05–06/08)
>
> - **Si el equipo contesta que sí** —los tres salen por ranking automático de asistentes—
>   entonces `ecv_barrio1-3` **deja de ser manual**, y la operación que hace falta para
>   calcularlos es **la misma familia** que la que falta para `ecv_barrios` (la cantidad de
>   barrios distintos): las dos recorren la columna `barrio` y agrupan. Se resuelven juntas.
> - **Si contesta que no**, los tres quedan manuales para siempre y el único hueco técnico
>   que sobrevive es **`ecv_barrios`**, que **no está en esta lista** y no es una decisión
>   editorial. Está anotado aparte, en `PENDIENTES_consistencia.md`, como `P2`.
>
> **No inventar la respuesta: es pregunta para el equipo.**

### 1.5 Token huérfano resuelto — "Marque 1" (JM slide 6)

**[DOC-3, 30/07]** El `135` literal de la caja "Marque 1" (`docs/PLANTILLAS_QA_y_armonizacion.md`,
reemplazado por el token nuevo `{{ivr_marque1}}`) ya tenía fuente: `looker` la trae
como `ivr_marque1` (columna Z, `MAPEO`, ya sembrado desde antes de esta sesión). No
requiere cablear nada nuevo — solo confirma que el token no queda huérfano una vez que
la armonización de plantillas lo cree.

### 1.6 "Audiencia Alcanzada" (JM 5) — dos candidatas, sin elegir

**[?]** El token sigue sin fuente (`docs/PLANTILLAS_QA_y_armonizacion.md` §4). La
auditoría de la Parte B del Paso 2.7 (columna E de `digital/Digital`) dejó dos
candidatas a mano, ninguna confirmada:

- `digital/Digital` columna **D** ("Audiencia") — vecina de la columna E que motivó
  la auditoría; sin mapear todavía.
- `looker/Audiencias` (303 filas: `Segmentacion | Tipo | Audiencias Potenciales | Área`)
  — solapa entera sin registrar en `SOLAPAS` más allá de `uso=revisar`.

Ninguna de las dos está confirmada como la fuente real de "Audiencia Alcanzada" de
JM 5 — la pregunta 4 de `PLANTILLAS_QA_y_armonizacion.md` §7 sigue abierta
("¿es el mismo número que el `alcance` de Looker, o se calcula aparte?").

### 1.7 El temario del 24–30/07 — *Seguimiento JS 31/07* [OK]

**El informe se arma por temario.** Ésta es la decisión editorial de la semana, dictada
por el usuario el **04/08/2026**, transcripta completa. Es contra esto que se compara el
deck generado — no contra "todas las filas de `rdv` en la ventana".

> **Status Cercanía y M2**
> 1. JM | Uno a uno en San Cristóbal 23/07 (pre + post)
> 2. JM | Uno a uno en Retiro 24/07 (pre + post)
> 3. JM | Primera Persona con Pareto 27/07
> 4. JM | Encuentro Temático Orden Público 28/07
> 5. Ministros | Reuniones de la semana
> 6. M2 | Campañas y enviados de la semana
> 7. M2 | Registro Civil: nuevas piezas + métricas
>
> **Campañas destacadas**
> 1. Egreso de cadetes (actualización: nuevo mail + video "tolerancia cero")
> 2. Operativo de saturación en 1-11-14
> 3. Desalojo 900 (estrategia; métricas en caso de que llegue el material)
> 4. Video de obras de salud (en caso de que llegue el material)
>
> **DGAYD**
> 1. Semana JM
> 2. Análisis conversación digital Operativo 900
> 3. Comparativo de Recuperación de Propiedades
>
> **Otros temas**
> Status reunión con PC. *Las reuniones son siempre realizadas; hay números que siguen
> creciendo en directa y mail.*

#### Lo que el cruce contra la configuración viva muestra (04/08/2026)

**`REUNIONES` no es el temario: es el subconjunto que quedó en los comentarios del deck
viejo.** Tiene **7 filas** y le faltan **dos ítems del bloque Cercanía y M2**:

| ítem del temario | ¿está en `REUNIONES`? | ¿está en `rdv`? |
|---|---|---|
| 1 · San Cristóbal 23/07 (pre + post) | sí, dos filas | sí — `"1 a 1"`, Jorge Macri, **23/07**, 138 insc · 9 asis |
| 2 · Retiro 24/07 (pre + post) | sí, dos filas | sí — `"1 a 1"`, Jorge Macri, 24/07, 98 · 10 |
| 3 · **Primera Persona con Pareto 27/07** | **NO** | sí — `Encuentro "Primera Persona"`, Villa Urquiza, 1344 · 267 |
| 4 · Orden Público 28/07 | sí (con `orden = 3`) | sí — Belgrano, 753 · 199 |
| 5 · Ministros, reuniones de la semana | sí, `tipo = Agregado` | no aplica |
| 6 · M2, campañas y enviados | sí, `tipo = Agregado` | no aplica |
| 7 · **M2, Registro Civil** | **NO** | fuera de las cuatro bases |

Los otros tres bloques —Campañas destacadas, DGAYD, Otros— **no están en `REUNIONES`**:
las destacadas van por `CAMPANAS` (hoy **sin ninguna fila de `jm`**) y DGAYD quedó
declarado fuera de las cuatro bases en `docs/VALIDACION_2026-07-31.md`.

**⚠ El temario no respeta la ventana de `CONFIG`.** El ítem 1 es del **23/07** y la
ventana activa es **24–30/07**. La consecuencia está medida: San Cristóbal ancla con
score alto y no aporta ninguna fila, porque **su fila de `rdv` está fuera de ventana**.
La ventana sirve para los agregados (`ecv_*`, ministros, M2); **no** para seleccionar los
encuentros del temario, que es una decisión humana con su propio calendario.

**⚠ Y "San Cristóbal" es homónimo dentro de `rdv`.** En la ventana hay una fila de
**Gabriel Mraida, 24/07, `Encuentro con Vecinos`, 50 insc · 24 asis** — otro funcionario,
otro tipo y otra fecha que el `"1 a 1"` de Jorge Macri del 23/07 que pide el temario.
Es el mismo modo de falla que las dos cuentas homónimas de `digital`: **el nombre no
alcanza para identificar un encuentro; hacen falta figura, tipo y fecha.**

**Los números del temario, para comparar contra el deck** (`rdv`, medidos el 04/08):

| ítem | inscriptos | asistentes | mail | CC | IVR | RRSS | difusión |
|---|---|---|---|---|---|---|---|
| San Cristóbal 23/07 | 138 | 9 | 1 | — | — | 137 | — |
| Retiro 24/07 | 98 | 10 | 1 | — | — | 97 | — |
| Primera Persona 27/07 | 1344 | 267 | 807 | 103 | — | 434 | — |
| Orden Público 28/07 | 753 | 199 | 361 | 169 | 43 | 180 | — |

---

### 1.8 Comunicaciones post — lámina 7 · **decisiones del usuario del 06/08/2026**

> Siete decisiones tomadas el 06/08. **Nada de esto está ejecutado**: la plantilla no se tocó,
> ningún token se renombró, ningún marcador se cableó. Es la especificación; el archivo lo
> toca una persona (`C-01`: la plantilla es del equipo).
>
> **Dónde vive esto y por qué acá y no en §2.3.** El prompt las mandaba a §2.3, pero §2.3 está
> bajo *"2. Informe mensual SECCO-SSCDI"* y describe la **lámina 10 de `secco`**. Las siete
> decisiones hablan de **la lámina 7 de `jm`**, que es de §1. Van acá; §2.3 quedó apuntando a
> esta sección.

**Lo medido primero (07/08), porque cambia la lectura de las siete decisiones:**

| | `jm` lámina 7 | `secco` lámina 10 |
|---|---|---|
| título / pie | "Campañas" · *Digital \| ECVs: post reuniones* | *Digital \| Comunicaciones post* |
| tabla | 7×8 | 4×7 |
| columnas | *(sin encabezado)* · Período · **Formato** · **Habitantes** · Alcance · Impresiones · Visualizaciones · VTR% | **Campaña · Estado · Período · Alcance · Impresiones · Vistas · VTR** |
| ranuras | 4 (`camp1`…`camp4`) | 3 (`post_camp1-3`, `post_estado1-3`) |
| tokens | 4, sólo la columna de nombre | 6, nombre + estado |
| benchmark abajo | *"Benchmark VTR Post RDV: 44%"*, literal | cuatro líneas, literales |

**⚠ El destino de la decisión 1 ya existe.** Las siete columnas que el usuario pidió —Campaña ·
Estado · Período · Alcance · Impresiones · Vistas · VTR— **son textualmente las de `secco`
lámina 10**. La decisión no diseña una tabla nueva: alinea `jm` con lo que `secco` ya tiene.

---

**1 · Las columnas.** Pasan a ser **Campaña · Estado · Período · Alcance · Impresiones ·
Vistas · VTR**. Se van `Formato` y `Habitantes`; entra `Estado`; `Visualizaciones` pasa a
llamarse `Vistas` y `VTR%` a `VTR`. De 8 columnas a 7.

**2 · Cuatro filas por lámina**, y si hay más campañas **se repite la lámina**. Eso último es
una capacidad que el motor **no tiene** — ver `T2.10` en `PLAN.md` §2 y `D-22`.

**3 · Cuatro ranuras.** `jm` ya tiene 4; `secco` tiene **3** y quedaría corta. **No está
decidido** si `secco` pasa también a 4: las siete decisiones son sobre la lámina 7 de `jm`.

**4 · Un token por celda:** 7 columnas × 4 filas = **28 tokens** en la tabla.

**5 · La convención de nombres — elegida: `familia` + `atributo` + `índice`.**

Conviven dos formas en el repo:

| forma | ejemplos | cuándo se usa hoy |
|---|---|---|
| **atributo + índice** | `post_camp1`, `post_estado1`, `ecv_barrio1-3`, `camp_formato1-3`, `camp_audiencia1-3`, `rrss_area1-10`, `conv_tema1-4`, `m2_camp1-5` | listas de **un** atributo |
| **índice + atributo** | `camp_env1_{aud,fecha,rem}`, `rep_p1_{periodo,sent,tema1-3}`, `rrss_c1_{pct,txt}` | ranuras con **varios** atributos |

Por forma pura, esta tabla es del segundo caso: **siete** atributos por ranura, y el índice
adelante los mantiene juntos al leer `MARCADORES` y `FALTANTES`.

**Se elige igual la primera — atributo + índice — y el motivo es la decisión 4 del propio
usuario: *"los que ya existan se reusan"*.** Con atributo + índice, **6 de los 28 ya existen y
se reusan tal cual** (`post_camp1-3` y `post_estado1-3`, en `secco`), y **cero** tokens vivos se
renombran. Con índice + atributo, los 28 son nuevos **y además hay que renombrar los 6 de
`secco`** — 6 renombres a cambio de una prolijidad de orden alfabético. El costo es asimétrico
y la regla de reuso ya la escribió el usuario.

**Las 28, listas para copiar** *(los 6 en **negrita** ya existen en `secco` y se reusan)*:

```
post_camp1        post_estado1        post_periodo1   post_alcance1   post_impresiones1   post_vistas1   post_vtr1
post_camp2        post_estado2        post_periodo2   post_alcance2   post_impresiones2   post_vistas2   post_vtr2
post_camp3        post_estado3        post_periodo3   post_alcance3   post_impresiones3   post_vistas3   post_vtr3
post_camp4        post_estado4        post_periodo4   post_alcance4   post_impresiones4   post_vistas4   post_vtr4
```

Ya existen: **`post_camp1`, `post_camp2`, `post_camp3`, `post_estado1`, `post_estado2`,
`post_estado3`**. Nuevos: los otros 22.

> **⚠ Adoptar esta lista en `jm` es elegir la salida A del `P2` de `comunicaciones_post`**
> (`PENDIENTES_consistencia.md`): significa que `camp1`…`camp4` de la lámina 7 se renombran a
> `post_camp1`…`post_camp4`, y con eso la sección `comunicaciones_post` —que declara
> `familia_tokens = post_` para `JM,SECCO`— **pasa a encontrar la lámina de `jm`**, que hoy no
> encuentra. Esa elección **sigue siendo del usuario** y acá no se da por tomada.

**6 · El benchmark de abajo de la tabla** sale, o queda con `xx` fijo. **Sin token.** *Nota:
hoy ya está sin token* — en `jm` es el literal *"Benchmark VTR Post RDV: 44%"* y en `secco` un
bloque literal de cuatro líneas. O sea que la única parte con efecto de esta decisión es
**"sale"**; "queda fijo" es el estado actual.

**7 · `Estado`** lleva el valor que la campaña tenga en ese momento: la columna `N` de
`Seguimiento digital`. **Ya está mapeada** (`N4`, 07/08): `sd_estado` → `digital` /
`Seguimiento digital` / `N`. Valores observados en la base: `Finalizada`, entre otros — es
texto libre cargado a mano, no una lista cerrada. Eso **responde la vieja `[?]`** de §2.3.

**Lo que falta para que esto sea ejecutable, y no depende de escribir tokens:**

1. La lámina 7 no puede funcionar con más de 4 campañas hasta que exista `T2.10` (`D-22`).
2. `sd_fecha_fin` está mapeado pero `R-14` —qué campañas entran— sigue **sin consumidor**.
3. Nadie decidió de dónde salen `Período`, `Alcance`, `Impresiones`, `Vistas` y `VTR` por
   campaña. Son 20 de los 22 tokens nuevos y **ninguno tiene fuente declarada**.

---

## 2. Informe mensual SECCO-SSCDI

Cada sección tiene su propia configuración. Es el informe más configurable.

### 2.1 Uno a uno (slides 4–5)

**[?]** ¿Qué encuentro se muestra? ¿El último del mes, o uno elegido?
**[?]** `u1_bench_*` (benchmarks de plataforma): ¿de dónde salen? ¿Son fijos del año o
se recalculan?

### 2.2 Encuentro temático (slides 6–8)

**[?]** Se destaca **uno** por informe → ¿quién lo elige y con qué criterio?
**[?]** `et_nombre` / `et_fecha` son de carga manual, pero los datos del Iceberg
(slide 8) tienen que salir **de ese encuentro específico** — hace falta una forma de
decirle al motor *cuál* es. Probablemente una fila en `CAMPANAS` con
`tipo=encuentro_tematico`. **Confirmar en el Paso 3.**

### 2.3 Comunicaciones post (slide 10)

> **Reescrita el 07/08.** La especificación de esta sección vive ahora en **§1.8**, con las
> siete decisiones del usuario del 06/08. Acá queda sólo lo propio de `secco`.

**Lo medido (07/08), sobre la plantilla viva.** Tabla **4×7**, encabezado en la fila 1:
**Campaña · Estado · Período · Alcance · Impresiones · Vistas · VTR**. **Son exactamente las
siete columnas que el usuario decidió el 06/08** — o sea que `secco` ya está en el destino y
la que hay que mover es la lámina 7 de `jm`. Debajo, un bloque literal de benchmarks VTR
(ECVs 60 %, Uno a uno 55 %, Temáticas 44 %, Primera persona 27 %), **sin token**.

**Tres ranuras, no cuatro:** filas 2 a 4, con `post_camp1-3` en la columna `Campaña` y
`post_estado1-3` en `Estado`. Las otras cinco columnas están **vacías y sin token**.

**[?] resuelta:** *"¿'Estado' es un valor libre o una lista cerrada?"* → **valor libre**, la
columna `N` de `Seguimiento digital`, cargada a mano. Mapeada el 07/08 como `sd_estado`
(`N4`).

**[?] abierta:** las siete decisiones del 06/08 fijan **cuatro** ranuras y `secco` tiene tres.
**No está decidido si `secco` pasa a cuatro**: las decisiones se tomaron sobre la lámina 7 de
`jm`.

**[DOC-3, 30/07]** Fuente encontrada para el dinámico: `looker` tiene `pieza_meta`
(columna AD, `MAPEO`), la URL del posteo de Facebook de la campaña — candidato directo
para `post_camp1-3`. También existe `pieza_mail` (AE), sin cablear. No se cablea en
`MARCADORES` todavía (Paso 3).

### 2.4 Encuentros de ministros (slide 12)

**[OK]** Se trata como campaña seleccionable (`tipo=encuentro_ministros`), no como
familia fija.
**[?]** `emin_lista` es la lista de ministros del período — ¿sale de RDV filtrando por
`figura`, o se carga a mano?
**⚠** El marcado detectó que faltan cajas para `mails_entregados` e `impresiones` en
esa slide — revisar en el QA (ver `docs/SECCO_tokens_marcados.md`).

### 2.5 Campaña destacada (slides 16–23)

**[OK]** Bloque idéntico al de JM, mismos `camp_*`. Se emite por cada campaña con
`mostrar=sí`.
**[?]** ¿Cuántas campañas destacadas lleva el SECCO mensual? ¿Difiere de JM?
**[MANUAL]** `camp_dig_insight`, `camp_mail_insight`, `camp_resp_insight` — son
lecturas, las escribe el equipo. **Confirmado por el usuario el 05/08:** quedan manuales.

**[OK] Los once `camp_resp_*` quedan DIFERIDOS** — decisión del usuario del 05/08.
`camp_resp_pos` / `_neu` / `_neg` / `_info` / `_sol`, sus cinco `_pct`, y
`camp_resp_total`: **no van en esta etapa** y **no se cablean**. La `[?]` de *"fuente sin
identificar"* deja de ser una pregunta abierta y pasa a ser una **decisión tomada**: no se
busca la fuente porque el bloque no entra todavía.

**[OK] Los tres remitentes sueltos quedan DIFERIDOS** — decisión del usuario del 07/08.
Son `camp_remitente` suelta en la lámina **18**, `camp_remitente` suelta otra vez en la
**19**, y `camp_bench_remitente` en la **18**. La pregunta —*qué debería mostrar un
remitente suelto si cada fila de la tabla ya dice quién envió*— **sigue sin respuesta y no
se responde ahora**. **No se cablean, no se borran, no se tocan**, y **dejan de reportarse
en cada corrida**: una pregunta diferida que se repite es ruido. Está anotada en
`PENDIENTES_consistencia.md` con sus tres ubicaciones.

**[?] `camp_bench_*` (sin `_remitente`) sigue abierto**, y **no entra en ese cajón**: la
pregunta ahí es otra —¿fijos, o del período anterior?— y nunca se respondió. **No se
cablean** hasta que se decida.

> **El saldo de la familia `camp_`**, sobre los ~53 tokens sin cablear: **14 resueltos por
> decisión** (11 diferidos + 3 manuales), **2 abiertos** (`camp_bench_*`), y **el resto con
> fuente conocida**, bloqueados sólo por la falta de filas de `jm` en `CAMPANAS`.

### 2.6 Análisis / conversación X (slides 25, 27, 28)

**[?]** `conv_*`, `rep_*`, `rrss_*` — **fuente sin identificar**. No están en ninguna de
las 4 bases mapeadas. ¿Hay una quinta base de escucha social, o es todo carga manual?
**Esta es la laguna más grande del SECCO.**
**⚠** Slide 26 (temas positividad/negatividad) son **imágenes**, no texto → no
tokenizable. Queda manual sí o sí.

### 2.7 Nuevos proveedores

**[OK]** Uber / Twitch / Mercado Libre se tratan como campañas seleccionables
(`tipo=proveedor`), no como sección fija.
**[?]** ¿Van siempre o solo cuando hay novedad?

---

## 3. Tercer informe

**[?]** Sin identificar. No bloquea nada: el motor lo absorbe con una plantilla nueva y
filas de config.

---

## 4. Transversal

### 4.1 Fuente de verdad digital/directa

**✅ RESUELTO (29/07/2026).** **Seguimiento Digital (SD) es la fuente de fila** para los
marcadores `camp_*`/`mail_*`/`ivr_*`/`cc_*`. Looker **no** es una fuente independiente:
es el rollup exacto de SD, verificado número por número en dos campañas reales
(`HALLAZGOS_validacion_decks.md` §4 — esenciales y personas mayores, cuatro métricas
cada una, coinciden al valor). La razón para elegir SD y no Looker: el desagregado por
envío que piden dos slides del deck (16 y 25) **solo existe en SD** — Looker no lo puede
reconstruir, solo trae el total por campaña.

Precedencia de merge cuando dos bases traen el mismo campo lógico para una campaña:
**RDV → Seguimiento Digital → Looker** (gana la fuente más a la izquierda). `m2` va
aparte, familia `m2_*`, no entra en este merge. Esta precedencia es lógica del agregador
(`Marcadores.gs`, Paso 3) — no se codea en `Fuentes.gs`. `digital` (SD) ya está sembrado
completo en `MAPEO` desde el Paso 2.3 (6 solapas, join por `*_id_cuenta`) y en modo
`snapshot`.

**Dos excepciones a tener en cuenta al cablear `MARCADORES` (Paso 3):**
- El digital total de Looker puede estar **inflado por doble conteo** (filas DV360
  mensuales acumuladas, no incrementales) — no lo resuelve el motor, es de quien carga
  la planilla (`HALLAZGOS` §4.1).
- `alcance`/`frecuencia` **no son sumables** — hay una hoja `ALCANCE` aparte con valor
  único por campaña; van como `ULTIMO`/lookup, nunca `SUMA` (`HALLAZGOS` §4.2).

Este es el **único lugar del repo** donde vive el detalle de esta decisión — los demás
docs que la mencionan apuntan acá en vez de repetir el argumento.

### 4.2 MiBA

**[?]** Base parqueada (`activo=no`). Los tokens `miba_*` están marcados en las
plantillas pero sin fuente. Van a salir `«FALTA:token»` hasta que se defina.

### 4.3 Tokens de carga manual

Varios tokens **nunca** van a tener `base_id`, y está bien: se resuelven con
`operacion=TEXTO` + `valor_fijo`. Que aparezcan como "pendientes" en el reporte de
cobertura del Paso 2.5 es un falso negativo — hay que distinguirlos.

**[?]** Definir cómo se cargan en la práctica: ¿editando `MARCADORES` a mano cada
semana, o con una pantalla del panel (Pasos 6–9) que pida solo los manuales? **La
segunda es mucho mejor** para el usuario final, y es una buena razón para no dejar el
panel para el final.

---

## 5. Cómo se completa este documento

A medida que el motor genere decks reales, cada **[?]** se resuelve y pasa a **[OK]**
con la decisión escrita. Cuando queden pocos **[?]**, esto deja de ser un pendiente y
se convierte en el **manual de operación** del informe: lo que lee alguien que tiene que
armarlo por primera vez.
