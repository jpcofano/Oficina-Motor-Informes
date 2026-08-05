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

#### Decisiones del usuario, 05/08/2026

**[OK] El default editorial son las campañas del período.** Sobre ese default el equipo
**agrega o saca, dentro del último mes**. La selección la cura el equipo; el motor no
propone ni poda.

**[OK] El mecanismo ya existe y no hay que construir nada:** `mostrar = sí/no` más
`orden`, en `CAMPANAS`. Eso responde las tres primeras preguntas que estaban abiertas acá
—criterio, máximo y quién decide—: **es curaduría humana sobre dos columnas**, y por eso
no hay un criterio mecánico que escribir.

**[OK] Máximo cinco envíos por campaña.** Con ese tope, `campana_desag_mail` —cuya tabla
tiene cinco filas fijas— **queda acotada y no hace falta construir ninguna lámina extra de
desagregados**. La medición que iba a decidirlo (`0.6` del `Pedido-3`) deja de ser
necesaria.

> **⚠ Esto no deroga `D-19`, y el motivo importa.** Son dos reglas de **distinto nivel** y
> se leen juntas sin conflicto: *"las campañas del período"* dice **qué campañas van** —es
> una regla **editorial**—; `D-19` dice **quién escribe la celda `periodo_id`** —es una
> regla **mecánica**— y la respuesta sigue siendo **una persona**. El motor **no deduce el
> período de las fechas de la campaña**, porque con `R-11` Addendum 1 las ventanas pueden
> solaparse o dejar hueco, y una campaña a caballo de dos semanas no tiene un `periodo_id`
> derivable. El default editorial **no es permiso para que el motor complete la celda.**

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

**[MANUAL]** `post_camp1-3` y `post_estado1-3` — hasta 3 campañas con su estado.
**[?]** ¿"Estado" es un valor libre o una lista cerrada?
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

**[?] `camp_bench_*` y `camp_bench_remitente` siguen abiertos.** ¿Fijos, o del período
anterior? El usuario no los resolvió el 05/08. **No se cablean** hasta que se decida.

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
