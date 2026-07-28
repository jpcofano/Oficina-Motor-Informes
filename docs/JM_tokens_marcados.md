# JM semanal — Plantilla marcada (primera pasada)

Marcado sobre `Plantilla__Informe_semanal_JM.pptx` (22 slides, en blanco con `xx`).
Reemplazo posicional y determinístico. Valida OK contra el original.

Archivo: **`JM_marcada.pptx`**

> **Reuso alto:** esta plantilla comparte tokens con las otras dos.
> - Resumen Ejecutivo (slides 2–3) → mismos nombres que la plantilla marcada vieja
>   (`contenidos_total`, `imp_*`, `pauta_*`, `mail_*`, `cc_*`, `ivr_*`, y sus `gcba_*`).
> - Iceberg ECV (slide 6) → familia `enc_*` + `ecv_*`, igual que el encuentro temático de SECCO.
> - Bloque de campaña destacada (slides 12–19) → **idéntico a SECCO**, mismos `camp_*`.
> - M2 directa (slide 9) → mismos `m2_*` que SECCO.

---

## Tokens por slide

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
| 10 | M2 — status digital por categoría | `m2_*` por categoría (subtes/transito/desalojos/salud/seguridad_imp, camp1-5) + aud/clics/vis — **⚠ REVISAR: matriz desordenada, confirmar categoría de cada valor** |
| 11 | Campañas destacadas GCBA (separador) | estático |
| 12–19 | **Bloque campaña destacada** | `camp_titulo`, `camp_desde/hasta`, `camp_formato1-3`, `camp_audiencia1-3`, `camp_entregados/alcance/impresiones/frecuencia/aperturas/clics/ctor/visualizaciones`, `camp_dir_impl/dig_impl`, `camp_dig_insight`, `camp_bench_*`, `camp_env1-5_*`, `camp_remitente`, `camp_resp_*`, `camp_tasa_resp` *(idénticos a SECCO)* |
| 20 | Separador análisis | estático |
| 21 | Resumen Ejecutivo — RRSS/áreas | `rrss_c1-4_pct`, `rrss_prom`, `rrss_area1-10`, `rrss_menciones/_escala`, `rrss_visualizaciones/vis_escala`, `rrss_insight_texto`, `rrss_tema2` — **⚠ ver nota** |
| 22 | Gracias | estático |

---

## Revisar en el QA visual

1. **Slide 5 y 6 (ECV):** cajas del XML entremezcladas; cada `xx` fue mapeado por
   su etiqueta más cercana. Confirmar posiciones, sobre todo en la 6 (iceberg) —
   "Audiencia Alcanzada", "Escucharon +75%" y "Marque 1" son las más dudosas.
2. **Slide 10 (M2 digital):** es una matriz de 5 categorías × métricas donde el
   orden de cajas está muy mezclado. Las **Impresiones** y las **campañas** quedaron
   atadas a su categoría; los valores de **Audiencia/Clics/Visualizaciones** quedaron
   secuenciales (`_a` … `_e`) y hay que confirmar a qué categoría va cada uno.
   Es la slide que más necesita tu ojo.
3. **Slide 21 (RRSS):** tiene dos columnas — una de **ejemplo** (izquierda, con el
   caso Palermo real) y la **plantilla** (derecha). Marqué la derecha. La izquierda
   conserva unos `XX` sueltos del ejemplo; decidir si esa columna se borra o se deja
   como referencia.

---

## Definiciones pendientes (comunes con SECCO)

- Confirmar nombres de `camp_*` (se usan en ambas plantillas — cualquier cambio
  se propaga a las dos).
- `enc_*` vs `et_*`: en SECCO el encuentro temático quedó como `et_*`; acá el
  iceberg ECV usa `enc_*`. Definir si son la misma familia o se mantienen separadas.
