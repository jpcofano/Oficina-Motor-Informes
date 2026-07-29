# PLANTILLAS — QA posicional y armonización de tokens · 29/07/2026

> Reemplaza al anexo anterior. Fuentes:
> - SECCO marcada → `1_ZKjWhL…` · JM marcada → `1JrHvs_p…` · **comentada → `1yIlCIBG…`**
> - QA posicional hecho sobre los `.pptx` del repo (verificados espejo de las Slides),
>   leyendo coordenadas `x,y` de cada caja para emparejar **etiqueta ↔ valor**.

---

## 1. Corrección: los comentarios de hoy NO dicen "a definir"

`DISENO_match_temario.md §2` y la decisión abierta #8 del HANDOFF dicen que hay ocho (o
diez) comentarios "a definir" en las slides 8, 19, 21, 22, 23, 27, 29, 30, 31 y 32.
**En el archivo de hoy no hay ninguno.** Hay **8 hilos, todos sustantivos**, y uno ya
está resuelto:

| # | comentario | dónde está anclado | estado |
|---|---|---|---|
| 1 | JM \| Uno a uno en **San Cristóbal 23/07 (pre)** | tabla de plataformas del 1er uno a uno | abierto |
| 2 | JM \| Uno a uno en **Retiro 24/07 (pre)** | tabla de plataformas del 2do uno a uno | abierto |
| 3 | JM \| Uno a uno en **San Cristóbal 23/07 (POST)** | **huérfano** — el objeto ya no está | abierto |
| 4 | JM \| Uno a uno en **Retiro 24/07 (post)** | **huérfano** | abierto |
| 5 | **"ESTE ESTÁ DE MÁS, SOLO TENEMOS 2 POST"** | bloque de Comunicaciones post | abierto |
| 6 | JM \| Encuentro Temático **Orden Público 28/07** | iceberg del encuentro temático | ✅ **resuelto** |
| 7 | Ministros \| Reuniones de la semana (24/07 al 30/07 **inclusive – acumulado**) | slide de ministros | abierto |
| 8 | M2 \| Campañas y enviados de la semana; bordes del **23/07 y 30/07** | slide de M2 directa | abierto |

Los dos huérfanos (3 y 4) son la evidencia de la hoja borrada: quedaron apuntando a
objetos que ya no existen.

**Acción:** sacar el punto #8 de "Decisiones abiertas" del HANDOFF y corregir `DISENO §2`
(que además dice "ocho" y lista diez). Lo que sí sigue abierto de esa lista es otra cosa:
los `conv_*`, `rep_*` y `rrss_*` no tienen fuente — pero eso ya está en la decisión #2, no
hace falta duplicarlo.

---

## 2. Equivalencia entre el deck comentado y `SECCO_marcada`

**Recomendación de fondo: dejar de anclar en números de slide.** Ya se movieron una vez
en un día. El ancla estable es la **sección + el token**, que es justamente lo que el
motor usa.

| sección | en `SECCO_marcada` | en el comentado |
|---|---|---|
| Portada · Índice · separadores | 1–4 | 1–4 |
| Uno a uno — resultados por plataforma | 5 | **5 y 6** (uno por encuentro) |
| Encuentro temático (sep · estrategia · iceberg) | 6–8 | 7–9 |
| **Primera persona** (sep · estrategia · iceberg · antecedente) | **no existe** | **10–12** |
| Comunicaciones post | 9–10 | 13–14 |
| Ministros | 11–12 | 15–16 |
| M2 | 13–15 | 17–19 |
| Campaña destacada | 16–23 | 20–27 |
| Análisis (conv/rep/rrss) | 24–28 | 28–32 |
| Gracias | 29 | 33 |

Con eso cierra el misterio de las slides "29 a 32": son las de Análisis del comentado,
que en la plantilla marcada son 25 a 28.

---

## 3. Tres hallazgos de diseño que salen del comentado

**a) El uno a uno es un bloque repetible, no una sección fija.** El comentado tiene
**dos** slides de plataformas, una por encuentro de la semana (San Cristóbal y Retiro), y
tenía dos más para los POST antes de que se borrara la hoja. La plantilla marcada tiene
una sola. Es el mismo patrón que `camp_*`: se emite una por cada encuentro seleccionado,
con su propia ventana. Los `ecv_comuna`, `ecv_fecha`, `ecv_asistentes`, `ecv_minutos` son
**por encuentro**, no globales del período.

**b) "Primera persona" es un tipo de encuentro más, y está sin marcar.** Tres slides
enteras en `xx` (estrategia + iceberg + un antecedente hardcodeado: *"Mismo dispositivo:
27/04 (Pauls) | 727 inscriptos y 128 asistentes (18%)"*). Su estructura es idéntica a la
del encuentro temático.

Esto refuerza no cablear familias por sección (`u1_*`, `et_*`, `pp_*`) sino **una familia
de encuentro con un tipo**: la slide es la misma, cambia qué encuentro la alimenta. Es
exactamente lo que ya se decidió para `emin_*` y los proveedores.

**c) El bloque de post tiene que ser dinámico.** El comentario 5 lo dice sin vueltas: la
plantilla trae 3 filas y esa semana había 2. `post_camp1-3` / `post_estado1-3` fijos van a
dejar una fila con `«FALTA:token»` cada vez que haya menos de tres.

---

## 4. QA posicional — JM slide 5: los tokens están corridos un grupo

Emparejando por coordenadas (etiqueta y valor comparten `x` e `y`), **ninguna de las 9
cajas de métricas tiene el token que le corresponde**. Están rotadas: los valores de mail
cayeron en el grupo de call center, los de call center en el de IVR, y los de IVR en el de
mail.

| x | etiqueta en la slide | token que tiene hoy | token que debería tener |
|---|---|---|---|
| 0.25 | Impresiones | `{{clics}}` | `{{imp_total}}` |
| 0.25 | Clics | `{{ivr_atendidos}}` | `{{clics}}` |
| 0.25 | *Audiencia Alcanzada | `{{imp_total}}` | **falta token** (ver abajo) |
| 2.07 | Mails entregados | `{{ivr_atendidos}}` | `{{mail_entregados}}` |
| 2.07 | Aperturas (OR) | `{{ivr_75}} ({{ivr_75_pct}}%)` | `{{mail_aperturas}} ({{mail_or}}%)` |
| 3.75 | Base llamada | `{{mail_entregados}}` | `{{cc_base}}` |
| 3.75 | Llamados Contactados | `{{mail_aperturas}} ({{mail_or}}%)` | `{{cc_contactados}} ({{cc_contact_pct}}%)` |
| 5.48 | Atendidos | `{{cc_base}}` | `{{ivr_atendidos}}` |
| 5.48 | Escucharon +75% | `{{cc_contactados}} ({{cc_contact_pct}}%)` | `{{ivr_75}} ({{ivr_75_pct}}%)` |
| 5.48 | Marque 1 | **`135`** (literal) | `{{ivr_marque1}}` **(token nuevo)** |

**"*Audiencia Alcanzada" se quedó sin token.** La nota al pie de la propia slide la define
como personas únicas que vieron el anuncio al menos una vez, unificadas de todas las EDVs
de la semana. Es un `alcance`, y no es sumable (mismo caso que `camp_alcance` en
`HALLAZGOS §4.2`). Propongo `{{alcance}}`, con operación `ULTIMO` contra la hoja de
alcance, no `SUMA`.

---

## 5. QA posicional — JM slide 6: dos tokens dados vuelta

El resto de la slide empareja bien. Solo estos dos:

| etiqueta | token que tiene hoy | debería tener |
|---|---|---|
| Mails Enviados | `{{enc_audiencia_pauta}}` | `{{enc_mails_enviados}}` |
| Audiencia | `{{enc_mails_enviados}}` | `{{enc_audiencia_pauta}}` |

---

## 6. QA posicional — JM slide 10: la matriz de M2

Buena noticia: **los 14 números hardcodeados están fuera del área visible** (coordenadas
`y` negativas, parkeados arriba del canvas). No se imprimen. Son restos del ejemplo y se
pueden borrar sin riesgo.

Mala: los sufijos `_a` … `_e` no siguen el orden de las columnas, y hay dos cruces reales.

| columna | Impresiones | Audiencia | Clics | Visualizaciones | Campañas |
|---|---|---|---|---|---|
| Subtes | `m2_subtes_imp` | `m2_aud_a` | `m2_clics_a` | `m2_vis_a` | `m2_camp2` |
| Desalojos | `m2_desalojos_imp` | `m2_aud_c` | `m2_clics_c` | **`m2_vis_e`** ⚠ | `m2_camp1` |
| Tránsito | `m2_transito_imp` | `m2_aud_b` | `m2_clics_b` | — | `m2_camp3` |
| Salud | `m2_salud_imp` | `m2_aud_d` | `m2_clics_d` | — | `m2_camp4` |
| Seguridad | `m2_seguridad_imp` | `m2_seguridad_aud` | `m2_clics_e` | — | `m2_camp5` |

Dos cosas mal: `m2_vis_e` está en la columna de **Desalojos** (debería ser `_c`), y
`m2_camp1`/`m2_camp2` están cruzados respecto del orden de columnas.

**Propuesta:** eliminar los sufijos `_a`…`_e` y nombrar por categoría, como ya está hecho
para las impresiones: `m2_subtes_aud`, `m2_subtes_clics`, `m2_subtes_vis`,
`m2_subtes_camp`, y así con `transito`, `desalojos`, `salud`, `seguridad`. Cinco categorías
× cuatro métricas = 20 tokens legibles, y el error de cruce se vuelve imposible de cometer.

---

## 7. Armonización de `enc_*` — vocabulario único

Los 23 que ya coinciden quedan como están (`aperturas/or`, `e75/e75_pct`, `marque1`,
`mails_entregados`, `ll_contactados/_pct`, `ll_efectivos/_pct`, `base_llamada`,
`impresiones`, `atendidos`, `audiencia`, `mails_enviados`).

| concepto (etiqueta en la slide) | JM hoy | SECCO hoy | **canónico propuesto** |
|---|---|---|---|
| Clics de mail / CTOR | `enc_clics` + `enc_ctor` | `enc_clics_ctor` + `enc_ctor` | `enc_clics_ctor` + `enc_ctor` |
| Clics digital / CTR | — | `enc_clics_ctr` + `enc_ctr` | `enc_clics_ctr` + `enc_ctr` *(agregar a JM)* |
| Alcance digital efectivo ("Audiencia Alcanzada" / "Alcance") | `enc_audiencia` + `enc_audiencia_pct` | `enc_alcance` + `enc_alcance_pct` | `enc_alcance` + `enc_alcance_pct` |
| Audiencia de pauta ("Audiencia") | `enc_audiencia_pauta` | `enc_audiencia` | `enc_audiencia` |
| % de atendidos | *(no lo muestra)* | `enc_atendidos_pct` | `enc_atendidos_pct` |
| Promedio general RRSS | `rrss_prom` | `rrss_prom_general` | `rrss_prom_general` |

Dos pares que **no me animo a unificar sin que lo confirmes** (pregunta 1 abajo):

| JM | SECCO | ¿es lo mismo? |
|---|---|---|
| `enc_alcance_potencial` ("Alcance Potencial") | `enc_base_total` ("Base total") | suenan al mismo techo, pero uno es digital y el otro parece de directa |
| `enc_audiencia_ivr` ("BBDD Teléfonos") | `enc_llamados` ("Llamados") | uno es la base disponible, el otro los llamados hechos: distinto número |

---

## 8. Inscriptos por IVR — cajas nuevas

Confirmado con vos: se agrega la caja. Las cuatro líneas de canal viven en **una sola caja
de texto** por slide, así que es agregar una línea:

| slide | caja actual | línea a agregar |
|---|---|---|
| JM 5 | `Mail: … / Digital: … / Call Center: … / Difusión: …` | `IVR: {{ecv_insc_ivr}}({{ecv_insc_ivr_pct}}%)` |
| JM 6 | `Mail: … / Call Center: … / Difusión: … / Digital: …` | `IVR: {{ecv_insc_ivr}}` |
| SECCO 8 | ídem con `_pct` | `IVR: {{ecv_insc_ivr}} ({{ecv_insc_ivr_pct}}%)` |

`MAPEO` ya tiene `insc_ivr` → columna N, así que no hay trabajo del lado de datos.

---

## 9. Preguntas

**Para vos:**

1. `enc_alcance_potencial` vs `enc_base_total`, y `enc_audiencia_ivr` vs `enc_llamados`:
   ¿son el mismo dato con dos nombres, o cuatro datos distintos?
2. La matriz de M2 (punto 6): ¿paso a nombres por categoría (`m2_subtes_aud`…) o preferís
   mantener `_a`…`_e` y solo corregir los dos cruces?
3. Uno a uno y Primera persona como **bloques repetibles por encuentro** (punto 3a/3b):
   ¿lo incorporo al diseño ahora, o lo dejo anotado para la etapa de panel?

**Para el equipo:**

4. "Audiencia Alcanzada" de JM 5: ¿es el mismo número que el `alcance` de Looker, o se
   calcula aparte?
5. Inscriptos por IVR: ¿hoy se los suma dentro de Call Center en el informe manual, o
   simplemente no se reportaban?
6. El antecedente hardcodeado de Primera persona ("Mismo dispositivo: 27/04 (Pauls)…"):
   ¿es un dato que se actualiza cada vez, o una nota fija?
