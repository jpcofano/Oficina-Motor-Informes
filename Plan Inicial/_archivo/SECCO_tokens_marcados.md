# SECCO — Plantilla marcada (primera pasada)

Marcado sobre `Plantilla_SECCO.pptx` (29 slides, en blanco con `xx`). Cada `xx` se
reemplazó por su `{{token}}` según la etiqueta contigua. Convención `{{doble_llave}}`,
reusando nombres de familias de JM (`ecv_*`, `enc_*`) donde la slide es la misma.

Archivo generado: **`SECCO_marcada.pptx`** · valida OK contra el original.

---

## Tokens por slide

| Slide | Sección | Tokens |
|---|---|---|
| 1 | Portada | `fecha_dia`, `fecha_mes` |
| 2 | Índice | ⏭ sin marcar (cajas desordenadas, títulos casi fijos — ver nota) |
| 4 | Uno a uno (separador) | `ecv_comuna`, `ecv_fecha` *(reusa JM)* |
| 5 | Uno a uno — resultados plataforma | `ecv_comuna`, `ecv_fecha`, `ecv_asistentes`, `ecv_minutos`, `u1_bench_prog/meta/google` (+ tabla dinámica) |
| 6 | Encuentro temático (separador) | `et_nombre`, `et_fecha` |
| 7 | Encuentro temático — estrategia | `et_nombre`, `et_fecha`, `et_mail`, `et_ivr`, `et_cc`, `et_directa`, `et_convocatoria`, `et_post_periodo`, `et_digital` |
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

Slides sin marcadores (estáticas): 3, 9, 11, 13 (separadores de título fijo), 15
(M2 caudal — gráficos), 29 (gracias).

---

## Revisar en el QA visual

1. **Slide 8 (Iceberg)** y **Slide 12 (Ministros)**: el orden de las cajas en el
   XML está entremezclado. Mapeé cada `xx` por su etiqueta más cercana, pero
   conviene abrir el pptx y confirmar que cada token cayó en el recuadro correcto.
   En la 12, además, no encontré cajas `xx` separadas para **Mails entregados** e
   **Impresiones** — verificar si existen o están combinadas.
2. **Slide 27 (Repercusiones)**: son 3 columnas de período/temas/sentiment con
   cajas duplicadas; los `rep_*` están puestos pero hay que confirmar a qué
   columna corresponde cada uno.
3. **Slide 2 (Índice)**: no lo marqué. Las cajas de la numeración están
   desordenadas y los nombres de sección son casi fijos. Si querés que el índice
   sea dinámico, lo vemos aparte.
4. **Slide 26**: los temas positividad/negatividad son imágenes → no tokenizable
   (mismo GAP que ya habíamos identificado).

---

## Familias nuevas que introdujo esta plantilla

- `et_*` — **Encuentro temático** (tipo de campaña, análogo a `enc_*` pero
  distinto). Decidir si se fusiona con `enc_*` o queda separado.
- `emin_*` — Encuentros de ministros (bloque seleccionable, ya acordado).
- `m2_*` — M2.
- `camp_*` — bloque único de campaña destacada (repetible por campaña seleccionada).
- `conv_*` / `rep_*` / `rrss_*` — sección de análisis (Semana JM en X + RRSS).
- `u1_*` / `post_*` — uno a uno y comunicaciones post.

> Nota: MiBA y Nuevos Proveedores **no están** en esta plantilla base (son
> secciones ocasionales / campañas que se agregan aparte). Los `miba_*` quedan
> marcados en el deck lleno anterior como referencia.
