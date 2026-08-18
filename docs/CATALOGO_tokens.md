# Catálogo de tokens — generado desde `MARCADORES_2026-08-18.tsv`

> **Generado por `tools/catalogo.js` desde `docs/_snapshots/MARCADORES_2026-08-18.tsv`, `SOLAPAS_2026-08-18.tsv` y `MAPEO_2026-08-18.tsv` — los tres del 18/08/2026.** Es **evidencia fechada, no el estado de hoy**: para saber qué hay ahora se re-corre el script contra un snapshot nuevo. El dueño de la pregunta es el script, nunca este archivo.

**Primera versión (frente 14).** Emite lo que `MARCADORES` ya tiene, sin columnas ni categorías inventadas: **el formato definitivo del catálogo es una decisión del usuario y no está tomada.**

## ⚠ Qué mide la columna `config`, y qué NO — leer esto antes de usarla

**`config` dice si la configuración resuelve, y nada más.** Sale de cruzar los tres registros de esta misma fecha: la solapa tiene que estar `uso = fuente` en `SOLAPAS`, y cada campo lógico —el del marcador y los que menciona el filtro— tiene que tener fila en `MAPEO`.

**Contra el juego del 2026-08-18 da 78 de 78 que resuelven, y el motor publica DIEZ marcadores en error en una corrida real.** No es una contradicción: son dos preguntas distintas, y confundirlas es el modo de falla que este proyecto ya pagó.

| | |
|---|---|
| **lo que esto ve** | estático, sobre tres TSV: la solapa es `fuente`, el campo está en `MAPEO`, el filtro cita campos mapeados |
| **lo que NO ve** | los errores de **ejecución** — `D-30` sin `id_cuenta` para el encuentro, `«FALTA:@ultimo_sin_fecha_ambiguo»`, cero filas después del recorte por ventana. Necesitan una corrida contra la planilla viva |
| **lo que no ve nadie acá** | **de qué filas sale el número.** Un número correcto puede salir del universo equivocado, y eso no se ve ni estático ni en una corrida |

Por eso la columna se llama `config` y **no** `estado`: una etiqueta verde que significa algo más chico de lo que parece se lee como si significara todo.

**78 marcadores** · **78 con la configuración resuelta** · **0 sin resolver**.

## Familia `ecv` — 16 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`ecv_encuentros`** | `jm` | `inscriptos` | `rdv/RVD JM-CM - ES` | `CONTEO` | — | `ambito=jm` | `numero` | resuelve |
| **`ecv_insc_mail_pct`** | `jm` | `insc_mail/inscriptos` | `rdv/RVD JM-CM - ES` | `PCT` | — | `ambito=jm` | `porcentaje_sin_signo` | resuelve |
| **`ecv_insc_cc_pct`** | `jm` | `insc_cc/inscriptos` | `rdv/RVD JM-CM - ES` | `PCT` | — | `ambito=jm` | `porcentaje_sin_signo` | resuelve |
| **`ecv_insc_ivr_pct`** | `jm` | `insc_ivr/inscriptos` | `rdv/RVD JM-CM - ES` | `PCT` | — | `ambito=jm` | `porcentaje_sin_signo` | resuelve |
| **`ecv_insc_digital_pct`** | `jm` | `insc_digital/inscriptos` | `rdv/RVD JM-CM - ES` | `PCT` | — | `ambito=jm` | `porcentaje_sin_signo` | resuelve |
| **`ecv_insc_dif_pct`** | `jm` | `insc_dif/inscriptos` | `rdv/RVD JM-CM - ES` | `PCT` | — | `ambito=jm` | `porcentaje_sin_signo` | resuelve |
| **`ecv_barrios`** | `jm` | `barrio` | `rdv/RVD JM-CM - ES` | `LISTA` | — | `ambito=jm` | — | resuelve |
| **`ecv_inscriptos`** | `jm` | `inscriptos` | `rdv/RVD JM-CM - ES` | `SUMA` | — | `ambito=jm` | `numero` | resuelve |
| **`ecv_asistentes`** | `jm` | `asistentes` | `rdv/RVD JM-CM - ES` | `SUMA` | — | `ambito=jm` | `numero` | resuelve |
| **`ecv_insc_mail`** | `jm` | `insc_mail` | `rdv/RVD JM-CM - ES` | `SUMA` | — | `ambito=jm` | `numero` | resuelve |
| **`ecv_insc_cc`** | `jm` | `insc_cc` | `rdv/RVD JM-CM - ES` | `SUMA` | — | `ambito=jm` | `numero` | resuelve |
| **`ecv_insc_ivr`** | `jm` | `insc_ivr` | `rdv/RVD JM-CM - ES` | `SUMA` | — | `ambito=jm` | `numero` | resuelve |
| **`ecv_insc_digital`** | `jm` | `insc_digital` | `rdv/RVD JM-CM - ES` | `SUMA` | — | `ambito=jm` | `numero` | resuelve |
| **`ecv_insc_dif`** | `jm` | `insc_dif` | `rdv/RVD JM-CM - ES` | `SUMA` | — | `ambito=jm` | `numero` | resuelve |
| **`ecv_barrio`** | `jm` | `barrio` | `rdv/RVD JM-CM - ES` | `ULTIMO` | — | `ambito=jm` | — | resuelve |
| **`ecv_poblacion`** | `jm` | `poblacion` | `rdv/RVD JM-CM - ES` | `ULTIMO` | — | `ambito=jm` | `miles` | resuelve |

## Familia `enc` — 22 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`enc_alcance`** | `jm` | `alc_alcance` | `digital/Alcance` | `ULTIMO` | — | — | `miles` | resuelve |
| **`enc_audiencia`** | `jm` | `ivr_audiencia` | `digital/Directa IVR` | `SUMA` | — | — | `numero` | resuelve |
| **`enc_atendidos`** | `jm` | `ivr_atendidos` | `digital/Directa IVR` | `SUMA` | — | — | `numero` | resuelve |
| **`enc_e75`** | `jm` | `ivr_e75` | `digital/Directa IVR` | `SUMA` | — | — | `numero` | resuelve |
| **`enc_marque1`** | `jm` | `ivr_marque1` | `digital/Directa IVR` | `SUMA` | — | — | `numero` | resuelve |
| **`enc_e75_pct`** | `jm` | `ivr_e75/ivr_atendidos` | `digital/Directa IVR` | `PCT` | — | — | `porcentaje_sin_signo` | resuelve |
| **`enc_mails_enviados`** | `jm` | `mail_enviados` | `digital/Directa Mail` | `ULTIMO` | `mail_tipo=Convocatoria` | — | `numero` | resuelve |
| **`enc_mails_entregados`** | `jm` | `mail_entregados` | `digital/Directa Mail` | `ULTIMO` | `mail_tipo=Convocatoria` | — | `numero` | resuelve |
| **`enc_aperturas`** | `jm` | `mail_aperturas` | `digital/Directa Mail` | `ULTIMO` | `mail_tipo=Convocatoria` | — | `numero` | resuelve |
| **`enc_clics_ctor`** | `jm` | `mail_clics` | `digital/Directa Mail` | `ULTIMO` | `mail_tipo=Convocatoria` | — | `numero` | resuelve |
| **`enc_or`** | `jm` | `mail_or` | `digital/Directa Mail` | `ULTIMO` | `mail_tipo=Convocatoria` | — | `fraccion` | resuelve |
| **`enc_ctor`** | `jm` | `mail_ctor` | `digital/Directa Mail` | `ULTIMO` | `mail_tipo=Convocatoria` | — | `fraccion` | resuelve |
| **`enc_evento`** | `jm` | `evento` | `rdv/RVD JM-CM - ES` | `ULTIMO` | — | `ambito=jm` | — | resuelve |
| **`enc_base_total`** | `jm` | `cc_base_total` | `reuniones/Agenda JM` | `ULTIMO` | `cc_base_total!=0` | — | `numero` | resuelve |
| **`enc_base_llamada`** | `jm` | `cc_base_discada` | `reuniones/Agenda JM` | `ULTIMO` | `cc_base_discada!=0` | — | `numero` | resuelve |
| **`enc_ll_contactados`** | `jm` | `cc_contactados` | `reuniones/Agenda JM` | `ULTIMO` | `cc_contactados!=0` | — | `numero` | resuelve |
| **`enc_ll_contactados_pct`** | `jm` | `cc_contactados_pct` | `reuniones/Agenda JM` | `ULTIMO` | `cc_contactados_pct!=0` | — | `fraccion` | resuelve |
| **`enc_ll_efectivos`** | `jm` | `cc_efectivos` | `reuniones/Agenda JM` | `ULTIMO` | `cc_efectivos!=0` | — | `numero` | resuelve |
| **`enc_ll_efectivos_pct`** | `jm` | `cc_efectivos_pct` | `reuniones/Agenda JM` | `ULTIMO` | `cc_efectivos_pct!=0` | — | `fraccion` | resuelve |
| **`enc_alcance_potencial`** | `jm` | `alc_potencial` | `reuniones/Agenda JM` | `ULTIMO` | `alc_potencial!=0` | — | `miles` | resuelve |
| **`enc_alcance_pct`** | `jm` | `alc_cobertura_pct` | `reuniones/Agenda JM` | `ULTIMO` | `alc_cobertura_pct!=0` | — | `fraccion` | resuelve |
| **`enc_impresiones`** | `jm` | `imp_totales` | `reuniones/Agenda JM` | `ULTIMO` | `imp_totales!=0` | — | `miles` | resuelve |

## Familia `frecuencia` — 1 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`frecuencia`** | `jm` | `dig_impresiones/alcance` | `looker/resumen_metricas_dinamico` | `RATIO` | — | `ambito=jm` | `numero` | resuelve |

## Familia `gcba` — 11 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`gcba_mail_envios`** | `jm` | `mail_enviados` | `digital/Directa Mail` | `SUMA` | — | `ambito=gcba` | `miles` | resuelve |
| **`gcba_mail_entregados`** | `jm` | `mail_entregados` | `digital/Directa Mail` | `SUMA` | — | `ambito=gcba` | `miles` | resuelve |
| **`gcba_mail_aperturas`** | `jm` | `mail_aperturas` | `digital/Directa Mail` | `SUMA` | — | `ambito=gcba` | `miles` | resuelve |
| **`gcba_mail_or`** | `jm` | `mail_aperturas/mail_entregados` | `digital/Directa Mail` | `PCT` | — | `ambito=gcba` | `porcentaje_sin_signo` | resuelve |
| **`gcba_sms_envios`** | `jm` | `sms_enviados` | `digital/Directa SMS` | `SUMA` | — | — | `miles` | resuelve |
| **`gcba_sms_entregados`** | `jm` | `sms_entregados` | `digital/Directa SMS` | `SUMA` | — | — | `miles` | resuelve |
| **`gcba_pauta_google`** | `jm` | `sd_pauta_google` | `digital/Seguimiento digital` | `SUMA` | — | — | `miles` | resuelve |
| **`gcba_pauta_meta`** | `jm` | `sd_pauta_meta` | `digital/Seguimiento digital` | `SUMA` | — | — | `miles` | resuelve |
| **`gcba_pauta_prog`** | `jm` | `sd_pauta_prog` | `digital/Seguimiento digital` | `SUMA` | — | — | `miles` | resuelve |
| **`gcba_imp_total`** | `jm` | `Impresiones` | `looker/DIGITAL` | `SUMA` | `estado=Activa` | `ambito=gcba` | `miles` | resuelve |
| **`gcba_frecuencia`** | `jm` | `dig_impresiones/alcance` | `looker/resumen_metricas_dinamico` | `RATIO` | — | `ambito=gcba` | `numero` | resuelve |

## Familia `imp` — 7 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`imp_total`** | `jm` | `Impresiones` | `looker/DIGITAL` | `SUMA` | `estado=Activa` | `ambito=jm` | `miles` | resuelve |
| **`imp_meta`** | `jm` | `Impresiones` | `looker/DIGITAL` | `SUMA` | `estado=Activa` | `ambito=jm && plataforma=meta` | `miles` | resuelve |
| **`imp_google`** | `jm` | `Impresiones` | `looker/DIGITAL` | `SUMA` | `estado=Activa` | `ambito=jm && plataforma=google` | `miles` | resuelve |
| **`imp_prog`** | `jm` | `Impresiones` | `looker/DIGITAL` | `SUMA` | `estado=Activa` | `ambito=jm && plataforma=programmatic` | `miles` | resuelve |
| **`gcba_imp_meta`** | `jm` | `Impresiones` | `looker/DIGITAL` | `SUMA` | `estado=Activa` | `ambito=gcba && plataforma=meta` | `miles` | resuelve |
| **`gcba_imp_google`** | `jm` | `Impresiones` | `looker/DIGITAL` | `SUMA` | `estado=Activa` | `ambito=gcba && plataforma=google` | `miles` | resuelve |
| **`gcba_imp_prog`** | `jm` | `Impresiones` | `looker/DIGITAL` | `SUMA` | `estado=Activa` | `ambito=gcba && plataforma=programmatic` | `miles` | resuelve |

## Familia `ivr` — 7 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`ivr_campanias`** | `jm` | `ivr_id_cuenta` | `digital/Directa IVR` | `CONTEO` | — | — | `numero` | resuelve |
| **`ivr_llamados`** | `jm` | `ivr_llamados` | `digital/Directa IVR` | `SUMA` | — | — | `miles` | resuelve |
| **`ivr_atendidos`** | `jm` | `ivr_atendidos` | `digital/Directa IVR` | `SUMA` | — | — | `miles` | resuelve |
| **`ivr_at_pct`** | `jm` | `ivr_atendidos/ivr_llamados` | `digital/Directa IVR` | `PCT` | — | — | `porcentaje_sin_signo` | resuelve |
| **`ivr_75`** | `jm` | `ivr_e75` | `digital/Directa IVR` | `SUMA` | — | — | `miles` | resuelve |
| **`ivr_75_pct`** | `jm` | `ivr_e75/ivr_atendidos` | `digital/Directa IVR` | `PCT` | — | — | `porcentaje_sin_signo` | resuelve |
| **`ivr_marque1`** | `jm` | `ivr_marque1` | `digital/Directa IVR` | `SUMA` | — | — | `miles` | resuelve |

## Familia `m2` — 7 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`m2_envios`** | `jm` | `mail_id_cuenta` | `digital/Directa Mail` | `CONTEO` | — | `tipo_envio=m2` | `miles` | resuelve |
| **`m2_mails_enviados`** | `jm` | `mail_enviados` | `digital/Directa Mail` | `SUMA` | — | `tipo_envio=m2` | `miles` | resuelve |
| **`m2_mails_entregados`** | `jm` | `mail_entregados` | `digital/Directa Mail` | `SUMA` | — | `tipo_envio=m2` | `miles` | resuelve |
| **`m2_aperturas`** | `jm` | `mail_aperturas` | `digital/Directa Mail` | `SUMA` | — | `tipo_envio=m2` | `miles` | resuelve |
| **`m2_clics`** | `jm` | `mail_clics` | `digital/Directa Mail` | `SUMA` | — | `tipo_envio=m2` | `miles` | resuelve |
| **`m2_or`** | `jm` | `mail_aperturas/mail_entregados` | `digital/Directa Mail` | `PCT` | — | `tipo_envio=m2` | `porcentaje_sin_signo` | resuelve |
| **`m2_ctor`** | `jm` | `mail_clics/mail_aperturas` | `digital/Directa Mail` | `PCT` | — | `tipo_envio=m2` | `porcentaje_sin_signo` | resuelve |

## Familia `mail` — 4 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`mail_envios`** | `jm` | `mail_enviados` | `digital/Directa Mail` | `SUMA` | — | `ambito=jm` | `miles` | resuelve |
| **`mail_entregados`** | `jm` | `mail_entregados` | `digital/Directa Mail` | `SUMA` | — | `ambito=jm` | `miles` | resuelve |
| **`mail_aperturas`** | `jm` | `mail_aperturas` | `digital/Directa Mail` | `SUMA` | — | `ambito=jm` | `miles` | resuelve |
| **`mail_or`** | `jm` | `mail_aperturas/mail_entregados` | `digital/Directa Mail` | `PCT` | — | `ambito=jm` | `porcentaje_sin_signo` | resuelve |

## Familia `pauta` — 3 token(s)

| token | informe | medida (`campo_logico`) | base / solapa | operación | filtro | dimensiones | formato | config |
|---|---|---|---|---|---|---|---|---|
| **`pauta_google`** | `jm` | `sd_pauta_google` | `digital/Seguimiento digital` | `SUMA` | — | — | `miles` | resuelve |
| **`pauta_meta`** | `jm` | `sd_pauta_meta` | `digital/Seguimiento digital` | `SUMA` | — | — | `miles` | resuelve |
| **`pauta_prog`** | `jm` | `sd_pauta_prog` | `digital/Seguimiento digital` | `SUMA` | — | — | `miles` | resuelve |

## Los 0 que no resuelven la configuración, con la causa derivada

**Ninguno.** Los 78 marcadores de este snapshot resuelven su solapa y sus campos.

⚠ **Y eso NO quiere decir que los 78 publiquen bien.** Los diez que el motor reporta en error fallan **en ejecución**, y esta tabla es estática: ninguna de sus causas —`D-30` sin `id_cuenta`, `ULTIMO` sin fecha utilizable, cero filas tras el recorte— deja rastro en `MARCADORES`, `SOLAPAS` ni `MAPEO`. **Para que entren al catálogo hace falta una corrida contra la planilla viva**, y esa corrida está en la lista de pendientes. Es la limitación principal de esta primera versión.

