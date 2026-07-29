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

Preguntas abiertas:
- **[?]** ¿Cuál es el criterio para dejar una campaña afuera? (¿volumen mínimo?
  ¿relevancia política? ¿campaña que arrancó y todavía no tiene datos?)
- **[?]** ¿Hay un máximo de campañas por informe? El deck crece 8 slides por campaña.
- **[?]** ¿Quién decide y cuándo? (¿antes de correr el motor, o se corre y se poda?)
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
lecturas, las escribe el equipo.
**[?]** `camp_bench_*` (benchmarks): ¿fijos, o del período anterior?
**[?]** `camp_resp_*` (respuestas: positivas/neutras/negativas…) — ¿qué base las tiene?
No aparece en `MAPEO_completo.md`. **Fuente sin identificar.**

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

**[?] DECISIÓN PENDIENTE.** Looker y Seguimiento Digital cubren lo mismo. Se define en
el **Paso 3**, como columna `base_id` de los marcadores `camp_*`/`mail_*`/`ivr_*`/`cc_*`.
Reversible (filas, no código). Recomendación: Looker, por venir consolidado por campaña.

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
