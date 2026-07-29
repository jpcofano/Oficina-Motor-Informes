# MAPEO completo — las 4 bases

> Columnas exactas relevadas de los `.xlsx` vivos (28/07/2026). Las letras son las de
> la hoja inspeccionada; verificá con "Probar lectura" por si la Sheet viva difiere.
> El campo `campo_logico` debe ser único por `base_id`.

---

## RDV — hoja `RVD JM-CM - ES` (encuentros; familias `ecv_*` / `enc_*`)

| campo_logico | columna | header real | alimenta |
|---|---|---|---|
| figura | A | Figura | filtro por figura |
| barrio | B | Barrio | `ecv_barrio` |
| evento | C | EVENTO | |
| fecha | E | FECHA | **filtro de período** |
| status | I | STATUS REUNIÓN | filtro (Realizada) |
| ecv_inscriptos | K | Inscriptos | `ecv_inscriptos` |
| ecv_insc_mail | L | Mail | `ecv_insc_mail` |
| ecv_insc_cc | M | Call Center | `ecv_insc_cc` |
| ecv_insc_ivr | N | IVR | canal IVR |
| ecv_insc_digital | O | **RRSS** | `ecv_insc_digital` ✅ (duda resuelta) |
| ecv_insc_dif | P | Difusión | `ecv_insc_dif` |
| ecv_asistentes | Q | Asistentes | `ecv_asistentes` |
| comuna | AA | Comuna | |
| ecv_poblacion | AB | Poblacion | `ecv_poblacion` / habitantes |

> Hay más columnas demográficas (AC–AO: género, franjas etarias) por si algún informe
> las pide. La hoja `Comunas` (mismo archivo) cruza barrio→población.

---

## LOOKER — hoja `resumen_metricas` (consolidado por campaña; **candidata a fuente de verdad digital/directa**)

Una fila por campaña, todos los canales ya agregados (31 columnas).

| campo_logico | columna | header real | alimenta |
|---|---|---|---|
| campana | B | nombre_campaña | selector `CAMPANAS` / `camp_*` |
| fecha_inicio | C | fecha_inicio | ventana de campaña |
| fecha_fin | D | fecha_fin | ventana de campaña |
| fecha | C | fecha_inicio | **Paso 2.1** — columna que usa el lector para filtrar la ventana (convención: `campo_logico='fecha'`). Apunta a `fecha_inicio`: el arranque de la pauta de convocatoria, entre 3 y 7 días antes del encuentro (`DISENO_match_temario.md` §5). Sirve para acotar la lectura, **no** para elegir qué campaña entra al informe. |
| eje | E | eje | `camp_eje` |
| area | F | area | |
| estado | G | estado | |
| dig_impresiones | H | digital_impresiones | `camp_impresiones` |
| dig_visualizaciones | I | digital_visualizaciones | `camp_visualizaciones` |
| dig_clics | J | digital_clics | `camp_clics` |
| alcance | K | meta_alcance | `camp_alcance` |
| frecuencia | M | frecuencia_total | `camp_frecuencia` |
| mails_enviados | N | mails_enviados | |
| mails_entregados | O | mails_entregados | `camp_entregados` / `mail_entregados` |
| mails_aperturas | P | mails_aperturas | `camp_aperturas` / `mail_aperturas` |
| mails_clics | Q | mails_clics | |
| call_contactados | T | call_contactados | `cc_contactados` |
| call_efectivos | U | call_efectivos | |
| ivr_audiencia | V | ivr_audiencia | |
| ivr_atendidos | X | ivr_atendidos | `ivr_atendidos` |
| ivr_escucha75 | Y | ivr_escucha75 | `ivr_75` |
| ivr_marque1 | Z | ivr_marque1 | `enc_marque1` |
| sms_enviados | AA | sms_enviados | `gcba_sms_envios` |
| sms_entregados | AB | sms_entregados | `gcba_sms_entregados` |

---

## SEGUIMIENTO DIGITAL — varias hojas (**fuente de fila para digital/directa**)

> Decisión de fuente resuelta — ver `docs/CONFIG_INFORMES.md` §4.1. No repetido acá.

**Hoja `Digital`** (campaña digital):
| campo_logico | col | header |
|---|---|---|
| dig_campana | A | Nombre campaña |
| dig_jm_gcba | B | JM/GCBA/POLICIA |
| dig_eje | C | Eje |
| dig_fecha_inicio | E | Fecha de inicio |
| dig_fecha_fin | F | Fecha de fin |
| dig_impresiones | H | Impresiones |
| dig_alcance | I | Alcance |
| dig_frecuencia | J | Frecuencia |
| dig_views | K | Views |
| dig_vtr | L | VTR |
| dig_clics | M | Clics totales |
| dig_ctr | O | CTR |

**Hoja `Directa Mail`:**
| dm_campana | H | Nombre campaña · | dm_fecha | F | Fecha envio |
| dm_enviados | M · dm_entregados | N · dm_aperturas | O · dm_or | P · dm_clics | Q · dm_ctor | R · dm_area | T |

**Hoja `Directa IVR`:**
| di_campana | I · di_audiencia | J · di_llamados | K · di_atendidos | L · di_at_pct | M · di_e75 | N · di_e75_pct | O · di_marque1 | P · di_marque1_pct | Q |

**Hoja `Directa SMS`:**
| ds_campana | E · ds_enviados | F · ds_entregados | G · ds_ent_pct | H · ds_clics | I |

**Hoja `CAMPAÑAS_DESGLOCE_DIGITAL`** (desglose por plataforma):
| cd_campana | E · cd_plataforma | F · cd_impresiones | O · cd_visualizaciones | P · cd_clics | Q |

---

## M2 — `M2 Reporte para Fede 2026` (ya mapeada; `snapshot`, encabezado fila 3)

Directa `M2 periodo DIRECTA`: campana B, fecha C, envios D, entregados E, aperturas F,
or G, clics H, ctor I. Digital `M2 periodo DIGITAL`: campana_dig B, estado E,
impresiones F, alcance_dig G, views I, clics_dig K.

---

## Resumen para el motor

- **RDV** → familias `ecv_*` (y demográficos). Sin ambigüedad. **Duda RRSS resuelta:
  `ecv_insc_digital` = columna O (RRSS).**
- **M2** → familia `m2_*`. Sin ambigüedad (snapshot).
- **Digital/directa** (`camp_*`, `mail_*`, `ivr_*`, `cc_*`) → fuente resuelta, ver
  `docs/CONFIG_INFORMES.md` §4.1.
