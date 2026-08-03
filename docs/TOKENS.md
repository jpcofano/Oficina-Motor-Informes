# TOKENS — diccionario canónico, inventario por slide y bloque de encuentro

> ⚠️ **Los renombres de este documento describen el estado OBJETIVO, todavía no
> aplicado sobre la plantilla canónica.** JM canónica (Paso 2.2.2):
> `117I0qn1XP1JCiz2mU32hUY1iiMUmrAAvHOsczd7u6jI` — sin armonizar. La corrida del
> 29/07 se aplicó por error sobre `1JrHvs_p…`, una plantilla JM distinta y ya
> obsoleta (marcada `[OBSOLETA — no usar]` en Drive). La
> armonización la aplica `armonizarPlantillas()` (`Armonizar.gs`, Paso 2.2 +
> 2.2.1 + 2.2.2), que sigue sin correr sobre la canónica — hay un bloqueante sin
> resolver (caja `{{m2_salud_camp}}` huérfana, detalle y decisión pendiente en
> `docs/PENDIENTES_consistencia.md`). **No sembrar `MARCADORES` asumiendo que las
> plantillas ya están armonizadas.**
>
> Fusiona (y reemplaza) `TOKENS_diccionario_canonico.md`, `JM_tokens_marcados.md`
> y `SECCO_tokens_marcados.md` — archivados en `Plan Inicial/_archivo/`. Derivado
> de las coordenadas reales de JM slide 6 y SECCO slide 8: los icebergs están
> organizados en **cuatro columnas** (digital · mail · IVR · call center) y **dos
> bandas** (arriba "impacto", abajo "alcance objetivo"). El token correcto es el
> de la **intersección columna × banda**, no el de la banda sola.

---

## 1. Diccionario canónico

Vocabulario único, nombrado por **columna + concepto**. En negrita lo que cambia.

### Digital
| etiqueta | JM hoy | SECCO hoy | canónico |
|---|---|---|---|
| Impresiones | `enc_impresiones` | `enc_impresiones` | `enc_impresiones` |
| Clics / CTR | — | `enc_clics_ctr` + `enc_ctr` | `enc_clics_ctr` + `enc_ctr` · **falta en JM** |
| Alcance efectivo ("Audiencia Alcanzada" / "Alcance") | `enc_audiencia` + `_pct` | `enc_alcance` + `_pct` | **`enc_alcance` + `enc_alcance_pct`** |
| Alcance potencial | `enc_alcance_potencial` | — | `enc_alcance_potencial` · no existe en SECCO |
| Habitantes | `ecv_poblacion` | `ecv_poblacion` | `ecv_poblacion` — "Habitantes del Barrio" en JM vs "Habitantes del eje" en SECCO; un eje agrupa varios barrios, no puede ser el mismo cálculo. Pregunta sin cerrar, ver `docs/Prompts/Paso-2.2.md` |

### Mail
| etiqueta | JM hoy | SECCO hoy | canónico |
|---|---|---|---|
| Clics / CTOR | `enc_clics` + `enc_ctor` | `enc_clics_ctor` + `enc_ctor` | **`enc_clics_ctor` + `enc_ctor`** |
| Aperturas / OR | `enc_aperturas` + `enc_or` | ídem | sin cambio |
| Mails entregados | `enc_mails_entregados` | ídem | sin cambio |
| Mails enviados | **`enc_audiencia_pauta`** ⚠ | `enc_mails_enviados` | **`enc_mails_enviados`** |

### IVR
| etiqueta | JM hoy | SECCO hoy | canónico |
|---|---|---|---|
| Marque 1 | `enc_marque1` | ídem | sin cambio |
| Escucharon +75% | `enc_e75` + `_pct` | ídem | sin cambio |
| Atendidos | `enc_atendidos` | `enc_atendidos` + `_pct` | `enc_atendidos` + `enc_atendidos_pct` |
| Llamados | — | `enc_llamados` | `enc_llamados` · **falta en JM** |
| Audiencia | **`enc_mails_enviados`** ⚠ | `enc_audiencia` | **`enc_audiencia`** |

### Call center
| etiqueta | JM hoy | SECCO hoy | canónico |
|---|---|---|---|
| Efectivos | `enc_ll_efectivos` + `_pct` | ídem | sin cambio |
| Contactados | `enc_ll_contactados` + `_pct` | ídem | sin cambio |
| Base llamada | `enc_base_llamada` | ídem | sin cambio |
| Base total ("BBDD Teléfonos") | **`enc_audiencia_ivr`** ⚠ | `enc_base_total` | **`enc_base_total`** |

### Fuera del iceberg
| concepto | JM | SECCO | canónico |
|---|---|---|---|
| Promedio general RRSS | `rrss_prom` | `rrss_prom_general` | `rrss_prom_general` |

**Renombres a aplicar en JM:** `enc_audiencia`→`enc_alcance`, `enc_audiencia_pct`→
`enc_alcance_pct`, `enc_clics`→`enc_clics_ctor`, `enc_audiencia_ivr`→`enc_base_total`,
`rrss_prom`→`rrss_prom_general`. Más dos cajas que hay que **corregir de contenido**, no
renombrar: "Mails Enviados" pasa a `enc_mails_enviados` y "Audiencia" (IVR) a
`enc_audiencia`.

⚠ **El orden importa:** si se corre primero el renombre `enc_audiencia`→`enc_alcance` y
después se pone `enc_audiencia` en la caja de IVR, sale bien. Al revés, el segundo
renombre se lleva puesto al primero.

**`enc_*` vs `et_*` — resuelto:** no son familias separadas que haya que decidir si
fusionar. `et_*` (SECCO, encuentro temático) pasa a ser una instancia del bloque de
encuentro repetible (§3), con nombres `enc_*` — ver la tabla de esa sección.

### M2 slide 10 — nombres por categoría (confirmado)

Se eliminan los sufijos `_a`…`_e`. Quedan 5 categorías × 4 métricas + campañas:

| categoría | impresiones | audiencia | clics | visualizaciones | campañas |
|---|---|---|---|---|---|
| Subtes | `m2_subtes_imp` | `m2_subtes_aud` | `m2_subtes_clics` | `m2_subtes_vis` | `m2_subtes_camp` |
| Tránsito | `m2_transito_imp` | `m2_transito_aud` | `m2_transito_clics` | `m2_transito_vis` | `m2_transito_camp` |
| Desalojos | `m2_desalojos_imp` | `m2_desalojos_aud` | `m2_desalojos_clics` | `m2_desalojos_vis` | `m2_desalojos_camp` |
| Salud | `m2_salud_imp` | `m2_salud_aud` | `m2_salud_clics` | `m2_salud_vis` | `m2_salud_camp` |
| Seguridad | `m2_seguridad_imp` | `m2_seguridad_aud` | `m2_seguridad_clics` | `m2_seguridad_vis` | `m2_seguridad_camp` |

Esto corrige de paso los dos cruces: `m2_vis_e` estaba en la columna de Desalojos y
`m2_camp1`/`m2_camp2` estaban invertidos respecto del orden de columnas.

**Nota:** hoy solo Subtes y Desalojos tienen caja de Visualizaciones. Las otras tres
columnas no tienen dónde ponerlas — o se agregan las cajas, o esos cuatro tokens no se
crean. Pregunta abierta para el equipo (ver `docs/PLANTILLAS_QA_y_armonizacion.md`).

---

## 2. Inventario por slide

`camp_*` está **verificado**: 53 tokens idénticos entre JM y SECCO, cero diferencias —
ya no es un pendiente. `enc_*` está resuelto por el diccionario canónico (§1). Las tablas
de abajo ya no repiten esos dos puntos como pendientes.

### JM — 22 slides

Marcado sobre `Plantilla__Informe_semanal_JM.pptx` (reemplazo posicional y
determinístico, valida OK contra el original). Archivo de referencia:
`Plan Inicial/_archivo/Plantillas/JM_marcada.pptx`.

**Reuso alto:** esta plantilla comparte tokens con SECCO — Resumen Ejecutivo (slides
2–3, familias `imp_* pauta_* mail_* cc_* ivr_*` + sus `gcba_*`), Iceberg ECV (slide 6,
familia `enc_*`/`ecv_*`, igual que el encuentro temático de SECCO), bloque de campaña
destacada (slides 12–19, `camp_*` idéntico a SECCO), M2 directa (slide 9, `m2_*` igual
que SECCO).

| Slide | Sección | Tokens / familia |
|---|---|---|
| 1 | Portada | `periodo` |
| 2 | Resumen Ejecutivo **JM** | `mail_envios`, `imp_google/prog/total/meta`, `contenidos_total`, `pauta_meta/google/prog`, `frecuencia`, `mail_entregados`, `mail_aperturas/or`, `cc_campanias/base/contactados/contact_pct`, `ivr_campanias/llamados/atendidos/at_pct` |
| 3 | Resumen Ejecutivo **GCBA** | mismos con prefijo `gcba_*` + `gcba_sms_envios/entregados` |
| 4 | ECV (separador) | estático |
| 5 | ECV — alcance por herramienta | `ecv_insc_*` (+pct), `ecv_inscriptos/asistentes/encuentros`, `ecv_barrios/barrio1-3`, `mail_aperturas/or`, `cc_contactados/base`, `ivr_atendidos/75`, `mail_entregados`, `clics`, `imp_total` — **⚠ revisar posiciones** |
| 6 | ECV — Iceberg | `enc_*` (clics/ctor, aperturas/or, ll_efectivos, ll_contactados, mails_entregados/enviados, audiencia, impresiones, audiencia_ivr, base_llamada, alcance_potencial, atendidos, marque1, e75), `ecv_*` (insc, inscriptos, asistentes, poblacion, barrio) — **⚠ revisar posiciones** |
| 7 | Digital ECVs post reuniones | `camp1-4` (tabla dinámica) |
| 8 | M2 (separador) | estático |
| 9 | M2 — status directa | `m2_*` (mails_enviados/entregados, aperturas/or, clics/ctor, campanias, envios) |
| 10 | M2 — status digital por categoría | `m2_*` por categoría, ver §1 (nombres por categoría, sin sufijos `_a`…`_e`) — **⚠ REVISAR: matriz desordenada en la plantilla viva hasta que corra el Paso 2.2** |
| 11 | Campañas destacadas GCBA (separador) | estático |
| 12–19 | **Bloque campaña destacada** | `camp_titulo`, `camp_desde/hasta`, `camp_formato1-3`, `camp_audiencia1-3`, `camp_entregados/alcance/impresiones/frecuencia/aperturas/clics/ctor/visualizaciones`, `camp_dir_impl/dig_impl`, `camp_dig_insight`, `camp_bench_*`, `camp_env1-5_*`, `camp_remitente`, `camp_resp_*`, `camp_tasa_resp` *(idénticos a SECCO, verificado)* |
| 20 | Separador análisis | estático |
| 21 | Resumen Ejecutivo — RRSS/áreas | `rrss_c1-4_pct`, `rrss_prom_general`, `rrss_area1-10`, `rrss_menciones/_escala`, `rrss_visualizaciones/vis_escala`, `rrss_insight_texto`, `rrss_tema2` — **⚠ ver nota QA** |
| 22 | Gracias | estático |

**Revisar en el QA visual:**
1. Slides 5 y 6 (ECV): cajas del XML entremezcladas, cada `xx` mapeado por la etiqueta
   más cercana. Confirmar posiciones, sobre todo "Audiencia Alcanzada", "Escucharon
   +75%" y "Marque 1" en la 6 — ver el detalle exacto en
   `docs/PLANTILLAS_QA_y_armonizacion.md`.
2. Slide 10 (M2 digital): matriz de 5 categorías × métricas con el orden de cajas muy
   mezclado. Impresiones y campañas quedaron atadas a su categoría; Audiencia/Clics/
   Visualizaciones quedaron secuenciales (`_a`…`_e`) — corrige el Paso 2.2.
3. Slide 21 (RRSS): dos columnas — una de ejemplo (izquierda, caso Palermo real) y la
   plantilla (derecha, marcada). Decidir si la columna de ejemplo se borra o se deja
   como referencia.

### SECCO — 29 slides

Marcado sobre `Plantilla_SECCO.pptx` (cada `xx` reemplazado por su `{{token}}` según la
etiqueta contigua, reusando familias de JM donde la slide es la misma). Archivo de
referencia: `Plan Inicial/_archivo/Plantillas/SECCO_marcada.pptx`. Valida OK contra el
original.

| Slide | Sección | Tokens |
|---|---|---|
| 1 | Portada | `fecha_dia`, `fecha_mes` |
| 2 | Índice | ⏭ sin marcar (cajas desordenadas, títulos casi fijos) |
| 4 | Uno a uno (separador) | `ecv_comuna`, `ecv_fecha` *(reusa JM)* |
| 5 | Uno a uno — resultados plataforma | `ecv_comuna`, `ecv_fecha`, `ecv_asistentes`, `ecv_minutos`, `u1_bench_prog/meta/google` (+ tabla dinámica) |
| 6 | Encuentro temático (separador) | `et_nombre`, `et_fecha` → pasan a `enc_nombre`/`enc_fecha` (§3) |
| 7 | Encuentro temático — estrategia | `et_nombre`, `et_fecha`, `et_mail`, `et_ivr`, `et_cc`, `et_directa`, `et_convocatoria`, `et_post_periodo`, `et_digital` → familia `enc_estr_*` (§3) |
| 8 | Encuentro temático — Iceberg | `ecv_insc_*` (mail/digital/cc/dif + pct), `ecv_inscriptos`, `ecv_asistentes`, `enc_*` (audiencia, mails_enviados, llamados, mails_entregados, e75, aperturas/or, marque1, clics_ctor/ctor, atendidos, impresiones, clics_ctr/ctr, alcance, base_total, base_llamada, ll_contactados, ll_efectivos), `ecv_poblacion` — **⚠ revisar posiciones** |
| 10 | Comunicaciones post | `post_camp1-3`, `post_estado1-3` (+ tabla dinámica) |
| 12 | Encuentros de ministros | `periodo`, `emin_*` (alcance_semanal, encuentros, alcance, aperturas/or, clics_ctor/ctor, clics_ctr/ctr, lista) — **⚠ revisar posiciones; faltan mails_entregados/impresiones** |
| 14 | M2 — status | `m2_*` (mails_enviados, mails_entregados, aperturas/or, clics/ctor, implementaciones, campanias, envios) |
| 16 | Campaña destacada (separador) | `camp_titulo` |
| 17 | Campaña — objetivo/período | `camp_titulo`, `camp_desde`, `camp_hasta` |
| 18 | Campaña — herramientas | `camp_titulo`, `camp_formato1-3`, `camp_audiencia1-3` |
| 19 | Campaña — formatos | `camp_titulo` |
| 20 | Campaña — resultados agregados | `camp_titulo`, `camp_entregados/alcance/impresiones/frecuencia/aperturas/clics/ctor/visualizaciones`, `camp_dir_impl`, `camp_dig_impl` |
| 21 | Campaña — desagregado digital | `camp_titulo`, `camp_dig_insight`, `camp_bench_*` (+ tabla dinámica) |
| 22 | Campaña — desagregado directa mail | `camp_titulo`, `camp_mail_insight`, `camp_remitente`, `camp_bench_remitente`, `camp_env1-5_*` |
| 23 | Campaña — respuestas | `camp_titulo`, `camp_resp_*` (total, pos/neu/neg/info/sol + pct), `camp_tasa_resp`, `camp_resp_insight` |
| 24 | Análisis (separador) | `fecha_mes` |
| 25 | Semana JM — conversación X | `conv_*` (menciones, vistas, usuarios, sm_pos + var de cada uno), `conv_dia_activo`, `conv_tema1-4` |
| 26 | Temas positividad/negatividad | ⏭ **GAP** — recuadros son imágenes, no texto |
| 27 | Repercusiones X — JM+GCBA | `rep_p1-3_periodo`, `rep_p1-3_sent`, `rep_p1_tema1-3`, `rep_p2/p3_temas` — **⚠ revisar posiciones** |
| 28 | Interacción positiva RRSS | `rrss_prom_general`, `rrss_c1-4_pct`, `rrss_c1-4_txt` |

Slides sin marcadores (estáticas): 3, 9, 11, 13 (separadores de título fijo), 15 (M2
caudal — gráficos), 29 (gracias).

**Familias de esta plantilla:**
- `et_*` — Encuentro temático. **Resuelto:** se fusiona en la familia `enc_*` del
  bloque de encuentro repetible (§3), no queda separada.
- `emin_*` — Encuentros de ministros (bloque seleccionable, ya acordado). No se toca:
  su slide es un agregado semanal de varios encuentros, no un bloque por encuentro.
- `m2_*` — M2. `camp_*` — bloque único de campaña destacada, verificado idéntico a JM.
- `conv_*` / `rep_*` / `rrss_*` — sección de análisis (Semana JM en X + RRSS). Fuente
  sin identificar — ver `docs/CONFIG_INFORMES.md`.
- `u1_*` / `post_*` — uno a uno y comunicaciones post.

> MiBA y Nuevos Proveedores **no están** en esta plantilla base (secciones ocasionales /
> campañas que se agregan aparte). Los `miba_*` quedan marcados en el deck lleno
> anterior, como referencia.

**Revisar en el QA visual:**
1. Slide 8 (Iceberg) y Slide 12 (Ministros): orden de cajas entremezclado en el XML.
   Confirmar que cada token cayó en el recuadro correcto. En la 12, verificar si
   existen cajas separadas para Mails entregados e Impresiones o están combinadas.
2. Slide 27 (Repercusiones): 3 columnas de período/temas/sentiment con cajas
   duplicadas — confirmar a qué columna corresponde cada `rep_*`.
3. Slide 2 (Índice): sin marcar. Si se quiere un índice dinámico, es trabajo aparte.
4. Slide 26: temas positividad/negatividad son imágenes → no tokenizable (mismo GAP
   ya identificado en otras slides de imagen).

---

## 3. Bloque de encuentro repetible

Hoy hay una familia por sección: `u1_*` (uno a uno), `et_*` (temático), `emin_*`
(ministros), y Primera persona sin marcar. Pero las slides son **la misma estructura**
con distinto encuentro adentro: separador + estrategia + iceberg.

**Propuesta (confirmada):** una sola familia de encuentro, y el tipo lo define la fila
de `CAMPANAS`.

| hoy | pasa a ser |
|---|---|
| `et_nombre` / `ecv_comuna` (identidad) | `enc_nombre` |
| `et_fecha` / `ecv_fecha` | `enc_fecha` |
| `ecv_comuna` / "eje" / "barrio" (lugar) | `enc_lugar` |
| `et_mail`, `et_ivr`, `et_cc`, `et_directa`, `et_convocatoria`, `et_digital`, `et_post_periodo` | `enc_estr_mail`, `enc_estr_ivr`, `enc_estr_cc`, `enc_estr_directa`, `enc_estr_convocatoria`, `enc_estr_digital`, `enc_estr_post_periodo` |
| métricas del iceberg | `enc_*` del §1, sin cambio |
| inscriptos / asistentes | `ecv_*`, sin cambio |

`CAMPANAS` ya tiene columna `tipo`: se le agregan los valores `uno_a_uno`, `tematico`,
`primera_persona`, `ministros`. El motor itera las filas con `mostrar=sí`, ordenadas por
`orden`, y emite el bloque de slides que corresponda a cada tipo — el mismo mecanismo ya
diseñado para `camp_*`.

**Qué cambia en los pasos pendientes:**
- **Paso 2.5** — al sembrar `MARCADORES` desde los tokens, los `enc_*` de un bloque
  repetible **no** son una fila por slide: son una fila por token, y el bloque se
  instancia N veces en el Paso 5. Hay que decirlo en el prompt o se siembran duplicados.
- **Paso 5** — deja de ser "bloques repetibles de campaña" y pasa a ser "bloques
  repetibles", con dos tipos de bloque: encuentro y campaña. La mecánica es la misma.
- **`emin_*`** queda como está (ver arriba). No se toca.

Primera persona, además, hay que marcarla: hoy son tres slides enteras en `xx` (deck
comentado, sin equivalente en la plantilla base — ver `PROYECTO.md` §6).

---

## 4. Esquema de `MARCADORES` — resolución de `solapa` (DOC-2)

`MARCADORES` (esquema en `Instalar.gs`, Parte A del DOC-2):

```
['marcador','familia','informe_id','base_id','solapa','campo_logico',
 'periodo_ref','operacion','valor_fijo','formato','notas']
```

**El problema que resuelve `solapa`:** un marcador declara `base_id=digital`,
`campo_logico=mail_enviados`. Con la clave de `MAPEO` `(base_id, solapa, campo_logico)`
(Paso 2.3.2) eso no alcanza para encontrar la fila: `digital` tiene seis solapas. Los
prefijos `dig_*`/`mail_*`/`sms_*` hoy tapan el agujero, pero **no son una convención**:
son la solapa metida adentro del nombre, y quedaron marcados para limpieza (Paso 2.3.2).
Si `MARCADORES` sigue dependiendo de ellos, esa limpieza rompe ~200 filas.

**Regla de resolución** (la implementa el resolvedor de `Paso-3-v2` Parte C; acá solo se
documenta el contrato):

| caso | qué hace |
|---|---|
| `solapa` cargada | se usa tal cual |
| `solapa` vacía y la base tiene **exactamente una** solapa en `MAPEO` | se usa esa, y **la traza dice que fue inferida** |
| `solapa` vacía y la base tiene **más de una** | error → `«FALTA:token@sin_solapa»` |

Es deliberadamente distinto de un default silencioso (rechazado en el Paso 2.3.2 para
`buscarMapeo`): acá la inferencia **queda escrita en la traza**, y el caso ambiguo falla
ruidosamente en vez de devolver la fila de al lado.

⚠ **`rdv` ya tiene dos solapas mapeadas** (`RVD JM-CM - ES` y `RDV_otros_ministros`), así
que la fila "solapa vacía + una sola solapa" de la tabla aplica a menos bases de las que
parece — verificar contra `MAPEO` antes de asumir que una base es de solapa única.

---

## 5. Resolución de período — las tres capas

> Migrado desde `Plan Inicial/PROYECTO.md` §4 al congelarlo (`DOC-6` Parte E, 01/08/2026).
> Vive acá porque **el período se resuelve por token**, y este documento ya es dueño del
> diccionario y de la columna `periodo_ref`. Es el contrato que el Paso 3 tiene que
> implementar.

> ⚠ **Superado por `D-20` y su Addendum 1 (`docs/PLAN.md`, 02/08/2026): la cadena tiene
> ahora cinco eslabones, no tres.** `campaña > marcador (periodo_ref) > SECCIONES.periodo_id
> > CONFIG > semana de `R-11``. Se agregó el período **por sección** en el medio y el
> **default calculado** al final. La tabla de abajo se conserva porque su caso testigo sigue
> explicando por qué el período no es global, pero **la decisión vigente es `D-20`** y es la
> que el Paso 3 implementa. Esta nota se agregó el 03/08/2026 en la auditoría de premisas;
> el resto de la sección no se tocó.

El período **no es global**. Para cada token se resuelve en este orden de prioridad, y se
usa el primero que aplique:

| # | condición | ventana que gana |
|---|---|---|
| 1 | el token pertenece a una **campaña seleccionada** | `desde`/`hasta` de esa fila de `CAMPANAS` |
| 2 | el marcador tiene **`periodo_ref`** cargado | esa ventana de `PERIODOS` |
| 3 | ninguna de las anteriores | período principal de `CONFIG` (`periodo_desde`/`periodo_hasta`) |

**El caso que justifica las tres capas** (`docs/CONFIG_INFORMES.md` §1.3): M2 reporta
**mensual** dentro de un informe semanal, vía `periodo_ref = m2_mensual`. Sin la capa 2,
ese bloque saldría con la ventana del informe y el número sería plausible y equivocado.

**No confundir con el régimen de selección** (`docs/PLAN.md`, `D-09`): esta tabla decide
**qué ventana de fechas** usa un token que ya entró al informe. Qué filas entran es otra
pregunta, y para las secciones por temario la fecha no la contesta (`R-04`).
