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

> **✅ CONTRADICCIÓN RESUELTA — 07/08/2026, y ganó lo de arriba.**
>
> Estuvo abierta unas horas contra `A.1` del prompt `2026-08-07_4_once_respuestas.md`, que
> decía lo opuesto —*"por defecto la semana… si no, por temario"*—, siendo las dos "decisión
> del usuario, 07/08/2026". **El usuario resolvió a favor del temario**, y esa versión quedó
> derogada.
>
> **La regla general vive en `R-17`** (`docs/REGLAS_NEGOCIO.md`), con los tres niveles en
> orden: el temario selecciona, los filtros de `R-15` acotan lo que eligió, y **la semana es el
> fallback, no un filtro previo**. `R-16` recibió un addendum que declara qué parte suya quedó
> superseded.
>
> **Esta sección conserva la decisión editorial de `jm` y el caso testigo, y deja de ser donde
> se lee la regla general.** Para la prioridad entre regímenes: `R-17`.
>
> **Nada se movió**: `R-16` nunca se cableó sobre la sección `campana`, y el código ya hacía lo
> que `R-17` fija.

Preguntas que siguen abiertas:
- **[OK] Si una campaña cruza dos semanas, se muestra ACUMULADA** — decisión del usuario,
  07/08/2026. El motivo es la base: **así están cargados los datos**, y recortar el tramo de la
  semana obligaría a un cálculo que la fuente no soporta. **Cambia el número, no sólo la
  presentación**, y por eso queda dicho: el valor publicado es el acumulado de toda la campaña,
  no lo que ocurrió dentro de la ventana del informe.

### 1.2 Período

**[OK]** Semana cerrada, de `CONFIG.periodo_desde` a `periodo_hasta` **cuando están cargados** —
lo que decidió una persona no se recalcula solo (`R-11` Addendum 1 punto 2).
**[OK]** *¿El motor propone la última semana cerrada por defecto, o siempre se carga a mano?* →
**propone** (decisión del usuario, 20/08/2026). Con `CONFIG` vacío, el eslabón 5 de `D-20` calcula
**la última semana cerrada**, viernes a jueves: corriendo el viernes 21/08 propone 14/08–20/08 y no
21–27, porque la semana que arranca ese viernes todavía no cerró. El detalle y el porqué viven en
`docs/REGLAS_NEGOCIO.md`, `R-11` **Addendum 2** — acá no se copia, para que no se separen.

⚠ **Y lo que la propuesta NO trae**, porque se confunde fácil: una ventana calculada **no tiene**
período con nombre, así que las secciones repetibles **no se recortan por período** (`D-19`). El deck
se genera igual y sobre las fechas correctas — el panel avisa, no bloquea. Ver
`docs/PROCESO_SEMANAL.md`, «El selector de período».

### 1.3 Bloques con período propio

**[OK]** M2 reporta **mensual** dentro del informe semanal → `periodo_ref = m2_mensual`
(hoja `PERIODOS`). Es el caso que justifica las tres capas de resolución de período.
**[?]** ¿Hay otros bloques con período propio? (RRSS quincenal aparece en `PERIODOS`
como ejemplo — confirmar si es real.)

### 1.4 Carga manual

- ~~**[MANUAL]** Los tres barrios destacados (`ecv_barrio1-3`)~~ — **[OK] Ya no son manuales
  (decisión del usuario, 07/08/2026).** Salen de **la misma lista** que `ecv_barrios`, con la
  cadena de prioridad de `R-17`. **La respuesta a la `[?]` no era el ranking: era el filtro.**
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
> **✅ RESPONDIDA — 07/08/2026, y por un camino que la pregunta no contemplaba.** No es el
> ranking automático de asistentes **ni** carga manual: `ecv_barrio1-3` **salen de la misma
> lista que `ecv_barrios`**, con la cadena de prioridad de `R-17`. La pregunta ofrecía dos
> opciones y la respuesta era una tercera.
>
> **Consecuencia anotada y no resuelta: son tres ranuras para cuatro barrios medidos** —la
> ventana 24–30/07 con el filtro de figura puesto da Belgrano, Caballito, Retiro y Villa
> Urquiza—. **Es plantilla, no motor**, y no se toca acá.

> **Media respuesta, 07/08/2026 — decisión del usuario: `ecv_barrios` es una LISTA de los
> barrios alcanzados en la semana (`DISTINCT`), no un conteo.** Eso resuelve el hueco técnico
> de la segunda viñeta —ya se sabe qué tiene que devolver— y **deja la `[?]` de los tres
> barrios destacados intacta**: sigue sin saberse si `ecv_barrio1-3` salen por ranking o a
> mano. Las cuatro decisiones que le quedan a `DISTINCT` están en el `P2` de
> `PENDIENTES_consistencia.md`, y **las cuatro son editoriales**.

> **Cerrado el 07/08/2026 — decisión del usuario.** Las decisiones que le faltaban a
> `ecv_barrios` están todas tomadas. **Lo técnico vive en `R-18`** (`REGLAS_NEGOCIO.md`): de
> dónde sale la forma publicada, cómo se deduplica, qué pasa con lo que no matchea, en qué
> orden y qué devuelve con cero filas. **Acá quedan sólo las dos editoriales**, abajo.
>
> **⚠ Corregido el 08/08/2026 — la forma vigente es UNA CAJA con la lista separada por coma.**
> Lo de abajo se escribió el 07/08 y quedó al revés: **"una caja por barrio" se pospuso**, no
> se cayó.
>
> **Por qué se pospuso, que es distinto de descartarse:** la caja actual es una **celda de
> tabla**, `D-22` mide que el motor no sabe agregarle filas, y no hay mecanismo de desborde.
> Construir la lámina nueva para publicar cuatro nombres **no se paga**. La decisión sigue en
> pie y **se corrige después, con su propio prompt**.
>
> **Y eso reactiva el separador**, que había quedado escrito y sin uso: hoy **sí se usa**, es
> la coma, y vive en `MARCADORES.separador` — vacío significa `", "`. **Implementado y
> verificado el 08/08:** la lámina 5 del deck publica
> `Barrios impactados: Belgrano, Caballito, Retiro, Villa Urquiza`.

> **Una caja por barrio.** Cada barrio va en su propia caja, no en una lista dentro de una.
>
> - **El separador queda escrito y hoy no se usa.** Es la coma (`", "`), y rige **sólo si
>   alguna vez se vuelve a la lista en una sola caja**. Las dos formas no conviven. Se deja
>   escrito en vez de borrarlo: una decisión tomada no se descarta porque el diseño la esquive.
> - **⚠ Choca con `ecv_barrio1-3`.** Esta misma sección los declara `[MANUAL]`, y son **tres
>   ranuras para cuatro barrios** —medido el 07/08 sobre la ventana 24–30/07 con el filtro de
>   figura puesto—. Si las cajas de barrio pasan a salir del `DISTINCT`, esos tres **dejan de
>   ser carga manual**, y eso responde la `[?]` de arriba **por un camino distinto del que esa
>   pregunta planteaba**. **No se da por respondida sin el usuario.**
>
> **⚠ Y la implementación no es cableado: es lámina nueva.** Medido: los cuatro tokens son
> **celdas de una misma tabla** —un solo `objectId`, filas 1 a 4 de la primera columna—, y
> `D-22` está medido: **el motor lee tablas y no sabe agregarles filas**. Tampoco hay mecanismo
> de desborde: `items_por_lamina` existe como columna de `SECCIONES` y en el seed, y **ningún
> consumidor la lee**. **La decisión se escribe igual; construirla es otro prompt, y la
> plantilla no se tocó.**
>
> **No se trunca, y el número del equipo cierra con el motor.** Salen todos los barrios que
> sobrevivan al filtro. El equipo dijo **entre 3 y 6, promedio 4**; el motor midió **4** con el
> filtro `figura=Jorge Macri` puesto — Belgrano, Caballito, Retiro, Villa Urquiza. **La
> discrepancia anterior de once tenía causa, era el universo, y quedó corregida el 07/08**
> (`R-15` addendum 1, §1.4 ter). **Un número del equipo que cierra con el motor vale como
> control, no como anécdota.**

### 1.4 quater · La cadena de una campaña destacada — **medido el 08/08/2026**

**De una fila de `CAMPANAS` a los números de la lámina, en una página.**

**Qué la identifica: `ID Cuentas`**, con la forma `NNNN-XXXYYYZZ`. Es el mismo identificador en
las cuatro solapas que participan, y **los valores cruzan**: `Seguimiento digital` ∩ `Alcance` =
**696 de 763 (91 %)**, ∩ `CAMPAÑAS_DESGLOCE_DIGITAL` = **388 de 389 (99,7 %)**. **No hay nada
que elegir.**

**De dónde sale cada grupo de tokens:**

| tokens | solapa | cómo |
|---|---|---|
| `camp_desde`, `camp_hasta` | `Seguimiento digital` col 12 / 13 | directo |
| `camp_titulo` | `Alcance` col 6 (`nombre_campaña`) | directo |
| `camp_eje` | `Seguimiento digital` col 10 | directo |
| `camp_alcance`, `camp_frecuencia` | `Alcance` col 2 / 3 | directo |
| `camp_impresiones`, `camp_visualizaciones`, `camp_clics` | `CAMPAÑAS_DESGLOCE_DIGITAL` col 15 / 16 / 17 | **agrupando por campaña** |
| `camp_aperturas`, `camp_entregados`, `camp_ctor`, `camp_env1..5_*` | lado mail — **sin camino hoy**, ver abajo |

**⚠ El desglose trae una fila por campaña Y plataforma**, así que sumar sin agrupar cuenta la
misma campaña varias veces. **Medido: 702 campañas en 2500 filas**, y una llega a tener **cinco
plataformas**. No es un obstáculo — es el paso que falta.

**El criterio de selección que el equipo usa hace meses coincide con `R-17` y `R-16`.** Las
fórmulas del panel digital seleccionan con `inicio ≤ hasta` **y** `fin ≥ desde`, que es
**solape exacto**; las del panel directa, **por punto**. Las dos reglas se escribieron por
separado y **dieron lo mismo**.

> **⚠ Y el veto de los paneles, para que nadie los vuelva a proponer.** `Buscador por periodo
> digital`, `Buscador por periodo directa` y **`Mail per`** son **paneles**, no fuentes: tienen
> el período **tipeado a mano** en la fila 1 o 2 y los datos generados por un `FILTER` contra
> esas celdas. **`R-02` los excluye.**
>
> **El modo de falla es silencioso, y por eso merece quedar contado:** el 07/08 los tres tenían
> **`31/07 → 07/08`** mientras el informe corría sobre **`24–30/07`**. Leerlos habría traído las
> campañas de **otra semana** — **sin que ningún token fallara**. Es el caso más limpio de
> número plausible y mal que tiene el proyecto.
>
> **Y `Mail per` está un nivel más abajo:** el panel de directa **lee de otro panel**. Todo el
> lado mail cuelga de eso, y por eso sus tokens figuran arriba como *sin camino hoy*.

**Los tres `camp_*_insight` son `[MANUAL]`** — decisión del usuario, 08/08/2026:
`camp_dig_insight`, `camp_mail_insight` y `camp_resp_insight` son **texto editorial**, no salen
de ninguna base. **Salen del cableado pendiente** y no vuelven a contarse como huecos técnicos.

#### **[MANUAL]** `camp_audiencia1-3` y `camp_formato1-3` (`L-043`) — decisión del usuario, 24/08/2026

⭐ **REVERSIBLE, y por eso lleva fecha: si el equipo contesta que hay fuente, se cablean.** No es
un cierre definitivo — es la decisión correcta **con lo que hay medido hoy**, y la pregunta sigue
abierta en `docs/PENDIENTES_consistencia.md` (*Preguntas al equipo*, 24/08).

**La evidencia que la sostiene, medida el 24/08 sobre los dos decks en disco y las 13 solapas
`fuente` de las tres bases:**

| | |
|---|---|
| columnas «Formato» en solapas `fuente` | **cero**. Un barrido **por contenido** —`placa · bumper · demand gen · banner · carrusel · reel · story`— dio 16 aciertos y **los 16 son nombres de campaña** |
| la única candidata real | `CAMPAÑAS_DESGLOCE_DIGITAL.Nomenclatura`: campos variables (9, 7, 6) y ⛔ **para la campaña destacada del 14-21/08 sus dos filas no traen formato** |
| ítems del deck que están **literales** en `mail_segmentacion` | ⛔ **0 de 5.** El equipo acorta y reescribe: `Barrios cercanos interesados en seguridad ( Flores, …)` sale como `Interesados en seguridad de barrios cercanos` |
| audiencias contra ranuras | **4-5 contra 3.** Y uno de los cinco es la audiencia **digital**, que vive en `digital/Digital` — solapa `uso = ignorar` |

⚠ **Por qué cablearlos sería peor que dejarlos vacíos:** el modo de falla de esta lámina **no es un
número raro**. Publicaría las tres primeras segmentaciones crudas, con su texto largo y sus
paréntesis, **y se leería perfectamente bien diciendo otra cosa que la que el equipo publica**. Es
la familia del número plausible movida al texto — y sin `separador` el desborde de la cuarta
audiencia se resolvería **en silencio**, que es tomar la decisión editorial sin decirlo.

⭐ **Qué haría falta para revertirla, en orden de dificultad:** **(a)** una columna de formato que
hoy no existe en ninguna parte; **(b)** la audiencia digital fuera de una solapa `ignorar`; **(c)**
una decisión editorial sobre qué pasa cuando hay más audiencias que cajas. **Con (a) y (b) sin
resolver, (c) no se llega a preguntar.**

> **⚠ Un dato para cuando se carguen las primeras filas de `jm`** (usuario, 08/08/2026):
> **ninguna campaña de `jm` se solapa con la semana del informe.** **Eso NO impide que entren** —
> es exactamente lo que dice `R-17`: **el temario selecciona y la ventana no filtra campañas.**
> Si al probar aparece una fila cargada que no emite, **la causa a mirar primero es `periodo_id`
> vacío o `mostrar` distinto de `sí`**, nunca la fecha.

### 1.4 bis · De dónde salen inscriptos y asistentes — **decisión del usuario, 07/08/2026**

**Los inscriptos y los asistentes de las reuniones salen de `rdv`.** Es la fuente de los cinco
`ecv_insc_*` —mail, call center, IVR, digital y difusión— y de `ecv_asistentes`.

**Ya estaba a medias en el cableado, y por eso se escribe:** los cinco `ecv_insc_*_pct` están
cableados a `rdv/RVD JM-CM - ES` desde el 05/08 —`insc_mail/inscriptos`, etc.— y **los cinco
numeradores no tienen fila en `MARCADORES`**. La consecuencia se ve en el deck: la lámina 5
publica `Mail: «FALTA:ecv_insc_mail»(59.9%)` — el porcentaje resuelto al lado de un hueco.

**Esta decisión cierra la pregunta de la fuente y no cablea nada.** Los cinco numeradores más
`ecv_asistentes` y `ecv_inscriptos` son seis filas de `MARCADORES` que hoy no existen; entran
por `T2.11`, que recorre el cableado lámina por lámina.

### 1.4 ter · El universo de la lámina 5 — **decisión del usuario, 07/08/2026**

**El informe `jm` cuenta sólo los encuentros de Jorge Macri.** `rdv/RVD JM-CM - ES` trae las
figuras de todo el gabinete; la lámina 5 es de JM y sólo de JM.

**Lo que estaba publicando, medido sobre la ventana 24–30/07** (15 filas, 12 figuras distintas,
4 de Jorge Macri):

| marcador | publicaba | tiene que dar |
|---|---|---|
| `ecv_encuentros` | **15** | **4** |
| `ecv_insc_mail_pct` | 59.9 | **50.7** |
| `ecv_insc_cc_pct` | 8.1 | **11.8** |
| `ecv_insc_ivr_pct` | 1.3 | **1.9** |
| `ecv_insc_digital_pct` | 29.3 | **35.7** |
| `ecv_insc_dif_pct` | 2.1 | **0** |

**El mecanismo es `MARCADORES.filtro`**, con `figura=Jorge Macri` en las seis filas. La señal la
declara `R-15` addendum 1.

**Y el descarte importa más que la elección.** `SECCIONES.filtro` sobre `ecv_alcance_semanal`
sería más barato —una celda en vez de seis— y **hoy no rompería nada**: la sección declara
`informes = JM,SECCO`, pero `SECCO` **no tiene ningún marcador que lea `rdv`**, así que el
filtro le caería encima sin efecto visible. **Se descarta por lo que haría el día que `SECCO`
sí tenga marcadores sobre `rdv`**, no por lo que hace hoy: heredaría un recorte por figura que
nadie pidió, sobre un informe que es justamente el de los ministros. **Un filtro que no molesta
hoy y rompe callado en tres meses es peor que uno que falla ahora.**

**Sólo se filtra `ecv_alcance_semanal`.** La sección `encuentro` **no lleva este filtro y no
puede llevarlo**: itera sobre `REUNIONES`, que es una hoja curada y **no tiene columna
`figura`**. Un filtro por figura no se declara sobre una fuente que no tiene la columna.

**El universo `GCBA` de `rdv` existe y no tiene consumidor.** La señal habilita el complemento
—los encuentros de las otras once figuras— pero **nadie pidió esa lámina para `jm`**. Se anota
para que se sepa antes de que alguien lo descubra como hallazgo: `SECCO` tiene su propia sección
`ministros`, con familia `emin_`, que hoy no lee `rdv`.

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

**7 · `Estado`** lleva el valor que la campaña tenga en ese momento. Es texto libre cargado a
mano, no una lista cerrada — eso **responde la vieja `[?]`** de §2.3.

> **Corregido el 07/08, misma noche.** Este punto decía *"la columna `N` de `Seguimiento
> digital`"*, mapeada como `sd_estado`. **La fuente de la tabla es otra**: por §1.8.1, sale de
> la solapa `Digital`, y ahí `Estado` es la columna **`G`**, que **no está mapeada**.
> `sd_estado` sigue existiendo y no se borra, pero **no es el `Estado` de esta tabla**.

---

#### 1.8.0 · Las cuatro decisiones del 07/08 que cierran esta lámina

> Tomadas el 07/08/2026, después de medir. **Reemplazan** lo que §1.8.1 decía sobre la fuente y
> cierran las tres `[?]` que §1.8 dejaba abiertas.

**1 · La fuente deja de ser `Digital` y pasa a `Digital 2026 acumulado`.** Ver §1.8.2. El
motivo es el que §1.8.1 midió y no pudo resolver: `Digital` **no tiene filas en la ventana del
informe** —sus fechas llegan hasta 2026-01-02— así que declararla fuente dejaba la lámina
vacía por construcción.

**2 · Salida A del `P2` de `comunicaciones_post`: los tokens de la plantilla se renombran a la
familia `post_`.** `camp1`…`camp4` pasan a `post_camp1`…`post_camp4`. Con eso la sección
`comunicaciones_post` —que declara `familia_tokens = post_` para `JM,SECCO`— **encuentra la
lámina de `jm`**, que hoy no encuentra. Los nombres son los de §1.8 punto 5, con la convención
**atributo + índice** ya elegida.

**3 · `secco` pasa a 4 ranuras**, igual que `jm`. Hoy tiene 3 (`post_camp1-3`,
`post_estado1-3`). **⚠ Esto exige agregarle una fila a la tabla de la lámina 10 de `secco`, y
eso es exactamente lo que `D-22` dice que el motor no sabe hacer.** La decisión queda tomada;
la ejecución espera a `T2.10` o a que una persona edite la plantilla.

**4 · El tamaño de página se declara en `SECCIONES`**, una columna por sección
(`items_por_lamina`). Es la entrada de `T2.10`; **`T2.10` no se implementa con esto** y **nada
consume la columna todavía**.

#### 1.8.1 · ~~La fuente de la tabla es la solapa `Digital`~~ — **superada el 07/08 por §1.8.2**

> **La decisión de abajo se tomó y se revirtió el mismo día**, y las dos mitades quedan porque
> la medición que la revirtió es la parte que sirve. Lo que sigue vigente de esta sección: el
> descarte de `CAMPAÑAS_DESGLOCE_DIGITAL`, la cobertura de `MAPEO`, y **la medición de que
> `Digital` no tiene filas en la ventana** — que es justamente lo que la superó.
>
> **La fuente vigente es `Digital 2026 acumulado` (§1.8.2).**

#### 1.8.1 bis · Lo que se midió sobre `Digital`, y sigue siendo cierto

La tabla de la lámina 7 sale de **`digital` / `Digital`**. Verificado contra `SOLAPAS` y
`MAPEO` **vivos** el 07/08, no contra el snapshot:

- es la única de las tres candidatas declarada **`uso = fuente`** con la firma de encabezados
  completa (1295 filas de datos);
- es la única con **las siete columnas** que la tabla necesita — inicio, fin, estado, alcance,
  impresiones, views, VTR;
- **ya está mapeada** en `MAPEO` como `dig_*`, y estaba desde antes del 01/08.

**Las otras dos, descartadas con el motivo escrito, para que nadie las vuelva a proponer:**

| candidata | `uso` | por qué no |
|---|---|---|
| `Digital 2026 acumulado` | **`derivada`** | 683 filas, acumulado. Su firma es `Id · Nombre · Fecha de inicio · Fecha de fin · Estado · Impresiones · Views · Clics · % CTR · Frecuencia · Alcance` — **no tiene VTR** |
| `CAMPAÑAS_DESGLOCE_DIGITAL` | `fuente` *(ver nota)* | 4.868 filas. **No tiene Alcance ni VTR** —sus métricas son `Impresiones · Visualizaciones · Clics`— y trae **una fila por campaña Y plataforma** (columna `Plataforma`: Meta, Google, …), así que una campaña aparece varias veces |

> **Nota de premisa.** El prompt del 07/08 la daba por declarada **`revisar`**. `SOLAPAS` vivo
> dice **`fuente`**. Lo que sí se confirma es lo sustantivo: no tiene alcance ni VTR y
> desglosa por plataforma. **El descarte se sostiene por las columnas, no por el `uso`.**

**Cobertura de `MAPEO` hoy — 6 de las 7 columnas están mapeadas:**

| columna de la tabla | campo lógico | columna de la solapa |
|---|---|---|
| Campaña | `dig_campana` | `A` |
| **Estado** | **— sin mapear —** | **`G`** ⚠ |
| Período | `dig_fecha_inicio` + `dig_fecha_fin` | `E` + `F` |
| Alcance | `dig_alcance` | `I` |
| Impresiones | `dig_impresiones` | `H` |
| Vistas | `dig_views` | `K` |
| VTR | `dig_vtr` | `L` |

**Falta una sola: `Estado`, columna `G`.** Se reporta y **no se mapea acá** — el prompt del
07/08 pide reportar lo que falte, no cablearlo.

**⚠ La medición que hay que ver antes de construir nada:** sobre la ventana del informe
(24–30/07/2026), la solapa `Digital` devuelve **cero campañas**, con el criterio de inicio
**y con el de solape de `R-14`**. No es un problema del criterio: **las 897 fechas reales de la
solapa van de 2024-08-29 a 2026-01-02** — la solapa está desactualizada respecto de la ventana.
Sin filas no hay tabla que llenar. Detalle en la entrada de `N3` de `BITACORA.md`.

**Lo que falta para que esto sea ejecutable, y no depende de escribir tokens:**

1. La lámina 7 no puede funcionar con más de 4 campañas hasta que exista `T2.10` (`D-22`).
2. **`Estado` (columna `G` de `Digital`) no está en `MAPEO`.** Es la única de las siete que
   falta.
3. **La solapa `Digital` no tiene filas en la ventana del informe** — ver arriba. Es lo que
   bloquea de verdad, y no se arregla con tokens. **Y es lo que hizo cambiar la fuente el mismo
   día: ver §1.8.2.**

#### 1.8.2 · La fuente es `Digital 2026 acumulado` — **decisión del usuario, 07/08/2026**

El usuario autorizó cambiar el seed y usar la solapa que sirva. **Es
`digital / Digital 2026 acumulado`.**

**Sus once columnas, medidas contra la base viva el 07/08:**

`Id` · `Nombre de la campaña` · `Fecha de inicio` · `Fecha de fin` · `Estado` · `Impresiones` ·
`Views` · `Clics` · `% CTR` · `Frecuencia` · `Alcance`

| columna de la lámina 7 | de dónde sale |
|---|---|
| Campaña | `Nombre de la campaña` |
| Estado | `Estado` — valores medidos: `FINALIZADA` 683 · `ACTIVA` 16 · `PAUSADA` 2 · `PENDIENTE` 1 |
| Período | `Fecha de inicio` + `Fecha de fin` |
| Alcance | `Alcance` |
| Impresiones | `Impresiones` |
| Vistas | `Views` |
| **VTR** | **no existe — es derivable**, `Views / Impresiones` |

**El VTR es la única que falta, y la propuesta es derivarlo.** `Views / Impresiones` es la
definición estándar de view-through rate y las dos columnas están. El motor ya tiene con qué:
`RATIO`/`PCT` sobre `dig2_views/dig2_impresiones`, con formato `porcentaje_sin_signo`.
**No se cableó** — el prompt del 07/08 pide proponerlo y decirlo en el reporte, no hacerlo.

**Tres cosas que hay que saber antes de construir sobre esta solapa:**

1. **Estaba declarada `uso = derivada` en `SOLAPAS`**, no `fuente`. Es un acumulado. Usarla
   como fuente **cambia su clasificación**, y eso se hizo por el seed, no a mano.
2. **No tiene columna `JM | GCBA | POLICIA`.** El corte de `R-15` para pauta digital **no es
   computable acá**. Para esta lámina no hace falta —es la tabla de comunicaciones post de los
   ECV, sin corte JM/GCBA— pero cualquier otro consumidor que la use sí lo va a extrañar.
3. **`Estado` viene en MAYÚSCULAS** (`FINALIZADA`, no `Finalizada`), y `R-10` compara **sin
   plegar mayúsculas**. Cualquier filtro por estado sobre esta solapa tiene que declararlas así.

**`CAMPAÑAS_DESGLOCE_DIGITAL` queda descartada por columnas**, no por su `uso`: **no tiene
Alcance** —sus métricas son `Impresiones · Visualizaciones · Clics`— y trae **una fila por
campaña Y plataforma** (columna `Plataforma`), así que una campaña aparece varias veces.

**`Digital` no se borra de `SOLAPAS`.** Deja de ser la fuente de esta lámina, nada más: sigue
siendo `uso = fuente` y la siguen leyendo `enc_impresiones`, `enc_alcance`, `imp_total`,
`gcba_imp_total`, `frecuencia` y `gcba_frecuencia`.

### 1.9 El desglose por herramienta es **sólo de `jm`** — decisión del usuario, 13/08/2026

**Enunciado.** El desglose de impresiones por herramienta —abrir el número en Meta, Google y
Programmatic en vez de publicar el total— es una decisión editorial **del informe `jm`**. No es
una propiedad del motor ni de la fuente: `digital` puede desglosar para cualquier informe que lo
pida, y `jm` es hoy el único que lo pide.

> **⚠ Pendiente al lado, y hay que decidirlo antes de tocar la plantilla de `secco`.** `secco`
> tiene **su propia lámina** de *"Uno a uno — resultados plataforma"*, con los `u1_bench_*`
> marcados (§2.1). Hay tres salidas posibles y **ninguna está elegida**:
>
> 1. se **retira** la lámina de `secco`, y el desglose queda efectivamente sólo en `jm`;
> 2. se **cablea con los mismos tokens** que `jm`, y entonces esta decisión editorial deja de
>    ser de un informe solo;
> 3. **queda como está** — marcada y sin cablear, publicando sus `«FALTA:token»`.
>
> Mientras `S-05` esté vivo, la opción 3 no cuesta nada; el día que caiga, hay que elegir. **No
> se decide acá.**

**✅ Decidido el 21/08/2026 (usuario): la salida 2 — se cablea con los mismos tokens que `jm`.**
El motivo, con sus palabras: **`secco` es prácticamente el mismo informe.** Con eso, la decisión
editorial del enunciado de arriba **deja de ser de un informe solo**, que es exactamente lo que la
salida 2 anticipaba.

⏸ **Y está DIFERIDA: se hace más adelante, no ahora.** No hay fecha ni destrabe — es una decisión
tomada esperando su turno, no un pendiente esperando un dato.

⚠ **Las salidas 1 y 3 quedan escritas arriba a propósito, y no se borran:** sirven para entender
**por qué** se eligió ésta. Un menú del que se borran las opciones no elegidas deja una decisión
que parece que nunca tuvo alternativas.

⛔ **Esto es un diferimiento, no un cierre.** El pendiente no se tacha ni se archiva: cambia de
estado a ⏸ con su fecha y su dueño. Un pendiente borrado **vuelve a descubrirse dentro de dos
meses**, y entonces se rediscute desde cero.

### 1.10 La condición del "1 a 1" — decisión del usuario, 21/08/2026

**El bloque de un encuentro no es siempre el mismo, y depende del `tipo` de la reunión.** En `jm`
son **dos** láminas: la portada, que va **siempre**, y una segunda que cambia.

| `REUNIONES.tipo` | segunda lámina | qué muestra |
|---|---|---|
| `Uno a uno` | `L-053` | resultados de plataforma del 1 a 1 |
| **todo el resto** | `L-035` | el iceberg |

⚠ **Los de `tipo` vacío llevan iceberg, y está dicho a propósito.** La condición se escribe
`tipo!=Uno a uno`, no enumerando tipos, **porque `REUNIONES` tiene filas sin `tipo`** y porque el
iceberg **es genérico** — `docs/SECCIONES.md` Corrección 5 lo mide sobre informes publicados:
aparece con un ECV, no sólo con el temático.

**La portada va en los dos casos.**

⭐ **Y el bloque variable por ítem no es una idea nueva de este cambio: está medido.**
`docs/SECCIONES.md` Corrección 6, sobre **tres informes publicados**, encontró bloques de **2 o 3
láminas** según el caso — y **ni siquiera dos "Uno a uno" tienen la misma cantidad**. Es lo que una
sola familia de tokens no puede expresar y lo que `LAMINAS.filtro` por ítem vuelve decible (`D-37`).

**En `secco` el bloque es de cuatro láminas** (posiciones 5 a 8) y la condición se expresa igual;
la tabla completa está en `docs/Prompts/2026-08-21_11.1_addendum_secco_y_rol.md` §1.

### 1.11 Tres láminas FUERA DE ALCANCE — decisión del usuario, 22/08/2026

**No se cablean.** Es la misma figura que §2.5 ya usa para `camp_bench_*` —*fuera de alcance con
fecha*— aplicada por primera vez a láminas enteras: **no es "resuelta" y no es "abierta"**. Una
pregunta abierta vuelve a levantarse en cada revisión; ésta **no se vuelve a levantar en ningún
prompt**. Si algún día se decide cablearlas, se reabre explícitamente.

| lámina | `lamina_id` | tokens que quedan dormidos |
|---|---|---|
| **10** · M2 *(escondida)* | `L-039` | **23** — la lámina entera |
| **19** · Desagregados · Respuestas *(escondida)* | `L-048` | **14** de 15 |
| **21** · Resumen Ejecutivo RRSS | `L-050` | **21** — la lámina entera, ⭐ **y el usuario la escondió** |

⛔ **El conteo de dormidos vive en `docs/CIERRE_POR_LAMINA.md`, no acá**, y ahí está el detalle de
cómo se midió. Esta ficha es la **decisión**; ése es el **tablero**.

**Las dos primeras ya estaban escondidas** y su contenido ya venía diferido en parte —los once
`camp_resp_*` de `L-048` están diferidos desde el 05/08, §2.5—. Lo que cambia es que ahora la
decisión es **de la lámina completa** y sale del conteo de faltantes.

#### ⭐⭐ RRSS es distinta: esconderla CIERRA un problema, no lo posterga

**El primer bloque de `L-050` no tiene tokens** — es texto fijo de la plantilla, así que el motor no
lo toca y **salía intacto con los datos de la semana pasada, sin ninguna marca**. Medido el 22/08
(`docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md` §3.6): `85 % · 99 % · 98 % · 98 %`,
promedio `95 %`, *"8.813 menciones… 4.7M visualizaciones"*, el tema del video de Palermo. El segundo
bloque, que sí tiene tokens, salía entero `/////`.

⚠ **Un número obsoleto sin marca es peor que un `/////`:** el `/////` manda a cablear, el número
viejo **no manda a nada porque nadie sabe que está viejo**. Esconder la lámina lo resuelve **de
raíz**: no se publica, así que no hay nada que alguien pueda leer como de esta semana.

⛔⛔ **Y por eso queda escrito con el motivo: si alguien vuelve a mostrar `L-050` sin cablear los 21
tokens, el problema vuelve ENTERO.** La causa nunca se arregló —el primer bloque sigue sin tokens y
el motor sigue sin poder tocarlo—; esconderla es lo que lo tapa. **Mostrarla de nuevo pide dos
cosas, no una:** cablear los 21, **y** decidir qué se hace con el bloque sin tokens (ponerle tokens
en la plantilla es del equipo, `C-01`; las otras salidas son borrarlo o declarar explícitamente que
ahí escribe una persona).

---

### 1.12 La fecha se publica SIN el año — decisión del usuario, 26/08/2026

**Toda fecha que el motor pinta en una lámina sale como `dd/MM`.** El deck publicaba
`Parque Avellaneda (12/08/2026)` y tiene que decir `(12/08)`.

⭐ **Es una regla DEL INFORME, no de una lámina, y de ahí sale la forma de implementarla.** Se
cambió el formato compartido `fecha` en `formatearValorMarcador_` (`Generador.gs`) en vez de
crearle uno propio a `L-053`. **El cambio viaja, y está bien que viaje** — un `fecha_corta`
paralelo dejaría dos formatos de fecha conviviendo y la próxima lámina elegiría mal.

**Los ocho marcadores afectados, medidos el 26/08 sobre `MARCADORES` vivo** — se listan porque el
cambio los toca a todos, no para decidir nada:

| formato | marcadores |
|---|---|
| `fecha` (7) | `ecv_fecha` · `camp_desde` · `camp_hasta` · `camp_env1_fecha` · `camp_env2_fecha` · `camp_env3_fecha` · `camp_env5_fecha` |
| `fecha_revisar` (1) | `u1_fecha_fin` — ⚠ **desde el 26/08 es `fecha` a secas**: perdió el `_revisar` con las otras 23 de `L-053` |

⚠ **Verificado en vivo el mismo día:** `ecv_fecha` publica `12/08` y `u1_fecha_fin` publica
`24/08`. Los seis `camp_*` **no se re-corrieron** — el cambio es del formateador y los alcanza
igual, pero eso es una deducción, no una medición.

⚠ **Lo que esta decisión pierde, declarado en vez de descubierto:** un informe que cruce dos años
se queda sin desempate visual entre un `31/12` y otro. **Hoy ninguno lo hace** —las ventanas son
semanales— y el año sigue viajando en el **valor crudo**, que es lo que se audita.

---

### 1.13 Los totales del "1 a 1" suman las dos etapas — decisión del usuario, 26/08/2026

**`PRE + POST` significa la suma de lo que muestra la lámina.** Los tres totales de `L-053`
—impresiones, clics y visualizaciones— llevan `dimensiones` **vacío**.

La regla vive en `R-33` (`docs/REGLAS_NEGOCIO.md`), que **deroga `R-28`**. Acá va sólo la parte
editorial, que es la que cambia lo que el equipo ve:

⛔ **El motor publica `2.464` donde el deck del equipo del 21/08 publicó `1.472`.** Es una
divergencia **elegida**, no un hallazgo abierto. El motivo es que la caja rotula `PRE + POST` y el
número que había adentro era sólo del PRE.

---

## 2. Informe semanal SECCO-SSCDI

Cada sección tiene su propia configuración. Es el informe más configurable.

> **El título decía "mensual" hasta el 16/08/2026, y era prosa vencida.** El usuario declaró ese
> día que **SECCO también es semanal**. La corrección es **documental y no cambia comportamiento**:
> medido el 16/08, la columna `INFORMES.periodicidad` **no tiene un solo lector en el código** —
> aparece en un comentario de contrato, en la lista de headers y en el seed, y nadie la consulta—.
> **La ventana real la resuelve `CONFIG`**, por el eslabón 4 de la cadena de `D-20`.
>
> El valor del seed se corrigió a `semanal` igual, y el motivo es preventivo: **una celda que dice
> lo contrario de la realidad es peor que una vacía**, porque el día que alguien conecte
> `periodicidad` a la cadena va a heredar el valor viejo creyendo que estaba verificado.

### 2.0 SECCO repite casi todo JM, a veces con un día de desfasaje — declarado por el usuario, 14/08/2026

El informe SECCO incluye **casi todo lo de JM**, y a veces **actualizado un día después**. Dos
consecuencias que hay que dejar escritas porque no son obvias:

- **El desfasaje no genera tokens nuevos.** Es la **misma medida con otra ventana**. Quien vea un
  número distinto entre los dos informes y piense que hace falta un token propio de `secco`, que
  empiece por mirar la ventana.
  - ⚠ **Corrección del 16/08: este punto decía *"y la ventana ya se resuelve por informe"*, y eso
    es falso.** Medido: la cadena de `D-20` **no tiene eslabón de informe** —`resolverVentana` ni
    siquiera recibe `informe_id`— así que hoy `jm` y `secco` caen los dos en `CONFIG` y resuelven
    **la misma ventana**. Se puede forzar a mano pasando `periodoId` a `generarInforme`, pero no
    se resuelve solo. **El razonamiento del punto sigue en pie; lo que no estaba era el
    mecanismo.** La propiedad general está en `PLAN.md`, `D-33` Addendum 1.
- **Es el argumento más fuerte a favor del vocabulario global.** Si los dos informes publican en
  su mayoría el mismo hecho, mantener dos juegos de tokens es duplicación pura. **Por eso el
  `2026-08-14_2` lo va a medir en vez de darlo por cierto**: el argumento es fuerte, pero sigue
  siendo un enunciado hasta que el censo diga cuántos tokens se superponen de verdad.

### 2.0 bis · La copia sin recalcular, y por qué el motor la resuelve solo — 16/08/2026

**Hoy `secco` se genera el jueves a la noche y `jm` el viernes al mediodía. SECCO va primero.** Y
cuando el contenido de SECCO se lleva a JM, **se copia sin recalcular**: llega al informe del
viernes con el corte del jueves, unas **15 horas** viejo.

**Eso no es un problema de disciplina, y por eso no se arregla con una instrucción de trabajo.**
Es lo que pasa cuando un informe se arma copiando de otro en vez de generarse.

**Lo que hay que dejar escrito es que el motor lo elimina sin que nadie tenga que acordarse:** en
cuanto **cada informe se genere con su propia ventana**, no hay nada que copiar — SECCO resuelve
la suya y JM la suya, y las dos salen del dato de su momento. **La copia sin recalcular deja de
ser posible, no deja de estar permitida.**

⚠ **Cuánto está en juego, para dimensionarlo:** el 15/08 se midió que `looker` movió **138.427
impresiones en 1h45**. La ventana de desfasaje entre los dos informes es **ocho veces** ésa.

⚠ **Y hoy el mecanismo no está**: la cadena de `D-20` no tiene eslabón de informe (ver la
corrección de §2.0). Mientras tanto, la ventana por informe se fuerza a mano con el `periodoId`
del panel. **Esto describe adónde va, no lo que ya pasa.**

**La propiedad del vocabulario que lo acompaña vive en `PLAN.md`, `D-33` Addendum 1**, y no se
copia acá: un token compartido va a dar números distintos en los dos informes **y los dos van a
estar bien**.

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

#### ⭐ 2.3 bis · `L-036` de `jm` — qué columnas se cablean y cuál NO (25/08/2026)

**La tabla tiene OCHO columnas y se cablean SEIS.** Decisión del usuario, y las tres partes tienen
motivos distintos:

| columna | estado | de dónde |
|---|---|---|
| **Campañas** | ✅ cableada | **se COMPONE** de `Funcionario` + `Tipo` + `Barrio` + `Fecha` (B/C/D/E) con `FILA_TEXTO` |
| Habitantes · Alcance · Impresiones · Visualizaciones · VTR% | ✅ cableadas | `reuniones/Agenda JM \| Post`, una fila por reunión |
| ⛔ **Formato** | **FUERA DE ALCANCE** | ver abajo |
| ⏸ **Período** | pendiente, no bloqueado por dato | `digital/CAMPAÑAS_DESGLOCE_DIGITAL` (`des_fecha_inicio`/`des_fecha_fin`) |

##### ⛔ `post_formato1..4` — FUERA DE ALCANCE para `jm`

**Decisión del usuario, 25/08/2026.** No se cablea, y **no vuelve a contarse como hueco**.

**El motivo está medido, y es de fuente, no de operación:**

1. **No existe columna de `Formato` en `reuniones/Agenda JM | Post`** — se barrieron sus **29**
   columnas el 25/08 contra el fixture del 20/08 (sha `f8ef3227…`): ninguna la trae.
2. Lo más parecido es **`Nomenclatura`, en otra base** (`digital/CAMPAÑAS_DESGLOCE_DIGITAL`,
   col. L), que ya está mapeada como `des_nomenclatura`.
3. ⛔⛔ **Y ahí el formato CAMBIA POR PLATAFORMA para la misma campaña** — `Video` en Google,
   `Banners` en DV360—, así que **una fila por encuentro no puede tener un solo formato**. No es que
   falte un extractor: es que la pregunta no tiene una respuesta única en ese grano.

⚠ **Es el mismo bloqueo que `camp_formato1-3` de `L-043`**, que ya está declarado fuera de alcance
en §2.5. **Conviene resolverlos juntos el día que se resuelvan**, o dejar los dos declarados.

⭐ **Es una decisión reversible y fechada**, como la de `L-043`: si el equipo empezara a cargar un
formato por encuentro, se cablea y listo.

##### ⏸ `post_periodo1..4` — pendiente, y NO por falta de dato

El dato existe y está mapeado. ⛔ **Lo que lo frena es que sale de OTRA base**, y eso reabre el
bloqueo B de `PENDIENTES_consistencia.md`: la config del temario declara **una sola** solapa, y con
dos fuentes las columnas de la segunda **pierden el recorte por cuenta** y caen a leer la solapa
entera. **Es el modo de falla que publicó el Recap de CABA con 2.463.980 habitantes.**

**No entra hasta decidirlo**, y la decisión es del usuario.

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

**[?] resuelta el 07/08 — `secco` pasa a CUATRO ranuras**, igual que `jm`. Decisión del
usuario.

> **⚠ Decidido y NO ejecutado, con motivo.** Pasar de 3 a 4 ranuras exige **agregarle una fila
> a la tabla** de la lámina 10, y eso es exactamente lo que `D-22` mide que el motor **no sabe
> hacer**: no hay una sola llamada de inserción de filas de Slides en el repo. La cuarta ranura
> la agrega una persona en la plantilla, o espera a que exista el mecanismo.
>
> Los nombres de la cuarta, cuando se agregue: `post_camp4` y `post_estado4`, más las cinco
> columnas que hoy están vacías en las tres existentes (§1.8, la lista de 28).

**[?] resuelta el 07/08 — el tamaño de página se declara en `SECCIONES`.** La columna
`items_por_lamina`; para `comunicaciones_post` vale **4**. **Nada la consume todavía**: es la
entrada de `T2.10`.

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

**⛔ `camp_bench_*` (sin `_remitente`) queda FUERA DE ALCANCE — 07/08/2026, decisión del
usuario.** La pregunta que tenía —*¿fijos, o del período anterior?*— **no se responde, y no
porque falte información: se decidió no resolverla ahora**, y puede que esos tokens se borren.

**No es "resuelta" y no es "abierta": es fuera de alcance con fecha.** La diferencia importa —
una pregunta abierta vuelve a levantarse en cada revisión, y ésta **no se vuelve a levantar en
ningún prompt**. Si algún día se decide cablearlos, se reabre explícitamente.

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

### 4.4 Cómo se escribe un hueco en el deck — los cuatro símbolos

**Decisión editorial del usuario, 20/08/2026.** Implementada el mismo día
(`docs/Prompts/2026-08-20_1_cuatro_simbolos.md`). Hasta ese día los tres primeros casos salían
todos como `—` y el deck no distinguía entre ellos. **[OK]**

| en el deck | qué significa | de dónde sale |
|---|---|---|
| `/////` | **falta el token**: nadie lo cableó, o el motor no llegó a resolverlo | sin fila en `MARCADORES`, y los tokens que la barrida final no alcanzó |
| `---` | **falló**: hay fila, se intentó leer y no salió | `estado = error` · `estado = REVISAR` |
| `-` | **no hay dato**: se preguntó bien y la respuesta fue vacía | `estado = sin_datos` |
| `-1.234-` | **dudoso**: publicado, con desconfianza declarada por una persona | sufijo `_revisar` en `MARCADORES.formato` (`2026-08-19_1` Parte C) — no es de este cambio |

**La línea que separa `/////` de `---` es *¿existe la fila de `MARCADORES`?*, y lo que decide es
quién arregla qué.** `/////` es trabajo de **cableado**; `---` es trabajo de **fuente o de
filtro**. Con un solo símbolo para los dos había que abrir `FALTANTES` para saber cuál de los dos
oficios hacía falta, y eso es justamente lo que el deck ahora contesta solo.

**Por qué `REVISAR` va a `---` y no a `-`:** `R-18` addendum 1 dice que `sin_datos` **afirma que
no había nada**. `REVISAR` es lo contrario — había filas y ninguna se pudo publicar. Escribirlo
como `-` publicaría esa afirmación falsa.

⚠ **Ante ausencia de información el símbolo es el más ruidoso, y es regla y no default.** Un punto
de escritura que no tiene a mano el resultado del marcador escribe `/////`, **nunca `-`**: `-` es
una afirmación *sobre el dato*, y quien no tiene el resultado no está en condiciones de hacerla.
El caso real es la barrida final, que por diseño sólo conoce el nombre del token — medido el
20/08: no recibe resultados de marcador y no puede recibirlos, porque un token que barre es uno
que la corrida **no llegó a resolver**.

**El modo crudo no se retira, y por eso esto es un modo y no un reemplazo.** El checkbox del panel
—*"Los huecos se ven como símbolos"*, tildado por defecto— elige entre los cuatro símbolos y
`«FALTA:token»`, que sigue diciendo **cuál** token es y sigue siendo el modo de trabajo. Es lo que
mantiene vivo `S-05` punto 3 (ver `docs/SUPUESTOS.md`).

### 4.4 bis · El anclaje de reuniones busca en dos pasos

**Decisión del usuario, 20/08/2026**, implementada el mismo día. **[OK]** el mecanismo · **[?]** el número.

| clave de `CONFIG` | hoy | qué significa |
|---|---|---|
| `ventana_candidatos_anclaje_dias` | `14` | el recorte acotado, **±14 días simétricos** alrededor del encuentro |
| `ventana_candidatos_anclaje_ampliada_dias` | **vacía** | **vacía = no ampliar**, que es el comportamiento de siempre. Con un número, dispara el segundo paso |

**El recorte es performance, no criterio**, y la regla de corte —*lo que el paso 1 resuelve queda
resuelto*— es lo que hace que el resultado no dependa de estos números. El detalle vive en
`docs/REGLAS_NEGOCIO.md`, `R-12` Addendum 1; acá va sólo el valor.

⚠ **La ampliada queda vacía a propósito, y no es que falte decidir el número:** la medición del
20/08 mostró que **los 10 días del negocio ya entran en el acotado de 14**, y que el candidato a
esa distancia se pierde **por el score**, no por el recorte. Cargar un número acá no arreglaría el
caso y traería más empates. **Lo que falta decidir es el reparto de puntaje por fecha**, y eso está
en el addendum.

### 4.5 El quinto estado: la desconfianza declarada — `D-34`

**Decisión editorial del usuario, 20/08/2026.** Los cuatro símbolos de §4.4 dicen **por qué no hay
número**. Éste dice algo distinto: **hay número, y no está validado.** **[OK]**

| en el deck | qué significa |
|---|---|
| `1.234` | hay número y está validado |
| **`-1.234-`** | **hay número y NO está validado** — se publica igual, con la desconfianza a la vista |
| `/////` · `---` · `-` | no hay número, por los tres motivos de §4.4 |

**Un número que existe y no está validado se publica ENTRE GUIONES. No se retiene.** Retenerlo no
lo vuelve más verdadero: lo vuelve invisible, y un hueco donde había un dato es **otra** afirmación
falsa. Un número entre guiones **ya no es plausible** — se declara sospechoso delante de quien lo lee.

⭐ **La frontera, con las dos palabras que la separan: desconfiar de un número no es lo mismo que
inventar uno.** Se publica entre guiones lo que el motor calculó y nadie validó; **no** se publica
lo que no tiene fuente. `m2_campanias` es el caso del segundo tipo y sale `/////`.

**Cómo se pone y cómo se saca:** el sufijo `_revisar` sobre el formato de `MARCADORES` —
`miles` → `miles_revisar`—. **Se retira cuando un caso `V-` valide la fila, y no antes**; sacarlo es
editar una celda, sin `clasp push`. Al 20/08 había **32 filas con `SIN VALIDAR` y sólo 3 con el
sufijo**: 29 números se publicaban con la misma cara que los validados.

⚠ **`enc_evento` es el único caso donde el sufijo solo no alcanza:** tiene el `formato` vacío, y la
guarda del formateador (`f.length > 8`) hace que `_revisar` pelado no envuelva nada. Lleva
`texto_revisar`, que preserva exactamente lo que hacía y además declara la desconfianza.

⚠ **El símbolo es del deck; el motivo es de la hoja.** `FALTANTES` sigue recibiendo su fila con el
motivo completo en los cuatro casos, y el reporte de corrida sigue contando los cuatro estados por
separado. Un deck más callado con una hoja igual de habladora es exactamente el intercambio que
esta decisión hace — no se pierde registro en ningún lado.

#### 4.5 bis · El puente entre `MAPEO.notas` y el deck — 21/08/2026

**El caso concreto.** Las ocho columnas dudosas de `digital/CAMPAÑAS_DESGLOCE_DIGITAL` quedaron
marcadas **`REVISAR`** en `MAPEO.notas` el 21/08 — entre ellas las dos que `D-31` describe: la
solapa tiene **dos** encabezados `Estado` (col K mayúscula, col Y minúscula) y **dos** de nombre de
campaña (col E y col V), y nadie confirmó cuál manda. La marca fue al campo `notas` **porque
`MAPEO` no tiene columna de estado**.

⭐ **Esa marca no llega sola al deck, y ahí está el puente.** `MAPEO` declara **dónde está una
columna**; no llega a la lámina. Cuando se cablee un token sobre una de esas columnas, **el
marcador lleva el sufijo `_revisar` en `MARCADORES.formato`** y entonces publica `-1.234-` en vez de
un número liso — que es exactamente lo que dice §4.5: **hay número y no está validado.**

⚠ **Sin ese puente, una columna que nadie confirmó publica con la misma cara que una verificada.**
Es el mismo hueco que §4.5 vino a cerrar del lado de `V-`, visto desde el otro extremo de la
cadena: allá el número no tenía caso de validación, acá la **columna de la que sale** no tiene
confirmación. **Los dos publican igual de seguros si nadie los marca.**

**Y se retira igual que el otro:** cuando alguien confirme qué significa la columna, se saca el
`REVISAR` de `MAPEO.notas` **y** el sufijo del formato. Son dos celdas y ningún `clasp push`.

---

### 4.6 `L-038` — los nombres de campaña de M2 se publican **CRUDOS**, y la edición es del equipo

**Decisión editorial del usuario, 25/08/2026.** **[OK]**

La lista de campañas de M2 de `L-038` publica **los nombres distintos de la semana, tal como están
en la base**, sin agrupar, sin normalizar y sin reescribir. **El equipo edita en su deck.**

⛔ **Por qué, y es lo que hace que esto sea una decisión y no una limitación:** medido sobre el
fixture del 31/07, el deck del equipo no sólo **agrupa** los 30 nombres en 12 — **poda** y
**reescribe a mano**. `Vacunación antirrábica` y `Repavimentación` no están en el deck; de las ocho
de `Vacaciones de Invierno 2026` publica una línea y pierde cuatro; `Luminarias peatonales` sale
como `Luminarias`, y `Poda pre` + `Poda post` como `Poda (pre y post)`.

> **Ninguna transformación automática produce esa lista, y una que se acercara INVENTARÍA las
> campañas que el equipo decidió no publicar.** Publicar crudo es la única salida que no miente.

⭐ **Y la lista sale del NOMBRE, no del asunto**, decidido por comparación contra el deck: donde las
dos columnas difieren, el deck sigue al nombre —*«Inauguración Centro de Diagnóstico Porteño en
Palermo»* y no *«Nuevo centro de diagnóstico en Palermo»*—.

⚠ **`m2_campanias` se conserva y su número NO se usa.** El banner de *Campañas* lo escribe el
equipo. La fila no se retira porque su definición está medida y sirve de control; **eso está escrito
en su `notas`, con fecha**, porque una fila que no se usa no entra a `FALTANTES` y no falla — es
invisible desde la hoja, y sin la nota no se distingue de un olvido.

⏸ **`m2_camp_lista` está FRENADO y no es un pendiente de cableado**, es una decisión abierta:
`opLISTA` publica **contra un catálogo** por diseño y no hay catálogo de nombres de campaña de M2.
La pregunta exacta está en `docs/PENDIENTES_consistencia.md`.

### 4.7 Call Center — la regla provisoria de `X-28`, con condición de salida

**Decisión editorial del usuario, 25/08/2026.** **[?]** — decidida, **no cableada**.

El Call Center deja de esperar la respuesta del equipo: se publica el número **de la regla más
plausible**, marcado con el sufijo `_revisar` de §4.5. **La regla es
`JDGAG` + pertenencia a la ventana + `duración ≤ 30 d`.**

⭐ **El desempate no se eligió por acierto —los tres aciertan igual— sino por MODO DE FALLA**, que
es el único argumento de negocio disponible:

- ⛔ `estado = Finalizada` **falla por un día**: `3289` quedó excluido en agosto porque su
  `fecha_fin` derivó a exactamente el día del export. Corrido un día después, entra y publica 5
  filas en vez de 3.
- ⭐ `duración` **se aleja del corte cuanto más deriva**: `3289` ya está en 34 d contra un tope de 30.

⚠ **La condición de salida, escrita para que el `_revisar` no sea un pendiente disfrazado de
estado:** el sufijo se quita **el día que el equipo conteste `X-28`**, editando el `formato` de las
cuatro filas de `MARCADORES` — cuatro celdas y **ningún `clasp push`** (`D-01`).

⚠ **Y lo que el `_revisar` declara acá NO es que el número sea dudoso: es que la REGLA que elige la
cuenta es provisoria.** Los tres desempates son **parches para deshacer un artefacto de la fuente**
—la `fecha_fin` que se extiende sola—, no criterios de negocio. Ninguno lo sería si la columna no
derivara.

⛔ **Está frenado, y el motivo es del motor, no de la decisión:** `duración ≤ 30 d` **no es
expresable** en `MARCADORES` —los filtros comparan el valor de una celda, no una resta entre dos
fechas— y el único tope por duración que existe (`R-30`) es **global**. La pregunta exacta y los
tres caminos posibles están en `docs/PENDIENTES_consistencia.md`.

⛔ **`X-28` sigue abierto.** Esto no lo cierra: sigue haciendo falta un tercer deck publicado.

---

### 4.8 Los `imp_*` — quién publica entre guiones y quién no, desde el 26/08/2026

**Decisión editorial del usuario, 26/08/2026.** **[OK]**

Los ocho `imp_*` estaban en `_revisar` desde el 22/08 por una causa que entonces se creía **una
sola**: `looker/DIGITAL` guarda el **acumulado de campaña**, no lo de la semana. El 26/08 se midió
contra los **dos** fixtures y los **dos** decks del equipo, y la causa **no es una**:

| marcador | julio_24_30 | agosto_14_20 | hoy |
|---|---|---|---|
| `imp_meta` | −5,2 % | +8,7 % | ✅ **sin sufijo** |
| `imp_google` | +15,6 % | +7,3 % | ✅ **sin sufijo** |
| `imp_prog` | +15,4 % | **+178,9 %** | ⛔ `_revisar` |
| `imp_total` | +13,1 % | **+98,1 %** | ⛔ `_revisar` — **incluye** a Programmatic |
| los cuatro `gcba_imp_*` | 58 % a 208 % | 2 % a 85 % | ⛔ `_revisar` |

⛔⛔ **CORRECCIÓN DEL MISMO DÍA — la decisión SE MANTIENE, su justificación NO.** Acá decía
que *«Meta y Google se mueven en el orden del desfasaje de acumulación»*, y **eso quedó
desmentido esa misma tarde** por `docs/VALIDACION_impresiones_2026-08-26.md`:

- El agregado de `agosto_14_20` entra con **tres** cuentas y **dos no son de esa semana**
  —Pareto (27/07) y Almagro (6/8)—, que aportan el **98,4 %** de Meta, el **99,5 %** de
  Google y el **100 %** de Programmatic.
- Y **los dos encuentros del temario quedan afuera**, porque `ambito=jm` se resuelve por
  `nombre_campaña ~= JM` y ninguno de los dos lo dice.

⇒ **`imp_meta` e `imp_google` no «dan»: dan un número parecido por casualidad**, calculado
sobre el mismo universo equivocado que `imp_prog`. Es *el número correcto que sale de las
filas equivocadas* (`CLAUDE.md` §4).

⭐ **Aun así los dos siguen SIN el sufijo, por decisión del usuario del 26/08 tomada con esta
corrección delante:** el frente que estaba cerrando es el de **por evento**, que sí cierra, y
**los resúmenes se revisan aparte y después**. ⚠ **No es que el número esté validado: es que
la revisión está diferida.** Se repone con `marcarProgrammaticARevisar()`, que vuelve a poner
los ocho.

⚠ **Y conviene tenerlo presente al mirarlos:** `imp_meta` e `imp_google` viven en el **Resumen
Ejecutivo** (`L-031`), no en el bloque por evento. Los de por evento son `enc_impresiones` y
`post_impresiones1-4`, que **nunca estuvieron marcados**.

⚠ **Y lo que esto NO dice: que `imp_meta` e `imp_google` sean exactos.** `imp_meta` está **+8,7 %
por encima** del deck de agosto, y el deck es **posterior** al fixture — el desfasaje sólo podría
hacerlo mayor. **Ese residuo sigue abierto** en `PENDIENTES`. Lo decidido es que no amerita
guiones, no que no exista.

⚠ **Los cuatro `gcba_imp_*` no tienen caso validado por plataforma.** Sus desvíos son números
**nuevos y sin validar**, que es otro estado que *validado*, y por eso ninguno sale del sufijo
aunque `gcba_imp_meta` dé +2,3 % en agosto.

**Condición de salida de los seis que quedan:** se saca el sufijo cuando **Programmatic deje de
traer el acumulado** —o cuando se decida el rótulo—, y para los `gcba_*` además cuando existan
casos validados por plataforma. Se revierte con `marcarProgrammaticARevisar()`, que vuelve a poner
los ocho; el parcial lo aplica `quitarRevisarDeMetaYGoogle()`.

---

## 5. Cómo se completa este documento

A medida que el motor genere decks reales, cada **[?]** se resuelve y pasa a **[OK]**
con la decisión escrita. Cuando queden pocos **[?]**, esto deja de ser un pendiente y
se convierte en el **manual de operación** del informe: lo que lee alguien que tiene que
armarlo por primera vez.
