# TOKENS — diccionario canónico y bloque de encuentro · 29/07/2026

> Reemplaza a los §6 y §7 de `PLANTILLAS_QA_y_armonizacion.md`.
> Derivado de las coordenadas reales de JM slide 6 y SECCO slide 8: los icebergs están
> organizados en **cuatro columnas** (digital · mail · IVR · call center) y **dos bandas**
> (arriba "impacto", abajo "alcance objetivo"). El token correcto es el de la
> **intersección columna × banda**, no el de la banda sola.

---

## 1. Corrección: los dos pares que propuse unificar no son lo mismo

Los había emparejado por altura. Mirando la columna, se cae:

| token | plantilla | columna | banda | qué es |
|---|---|---|---|---|
| `enc_alcance_potencial` | JM | **digital** | objetivo | techo de la pauta digital |
| `enc_base_total` | SECCO | **call center** | objetivo | base completa de teléfonos |
| `enc_audiencia_ivr` | JM | **call center** | objetivo | etiqueta "BBDD Teléfonos" |
| `enc_llamados` | SECCO | **IVR** | objetivo | llamados de la campaña de IVR |

Son cuatro datos distintos. Pero al mirarlo bien apareció otra cosa, peor y más útil.

---

## 2. Lo que sí está mal: `enc_audiencia` significa dos números distintos

| plantilla | columna | etiqueta | token |
|---|---|---|---|
| JM slide 6 | digital, banda impacto | "Audiencia Alcanzada" | `enc_audiencia` + `enc_audiencia_pct` |
| SECCO slide 8 | **IVR**, banda objetivo | "Audiencia" | `enc_audiencia` |

**El mismo token alimenta el alcance digital en una plantilla y la audiencia de IVR en la
otra.** Es el peor caso posible: una fila en `MARCADORES`, dos slides, un número correcto
y otro plausible pero falso.

Y `enc_audiencia_ivr` de JM **no es de IVR**: está en la columna de call center, con la
etiqueta "BBDD Teléfonos". El nombre miente sobre el canal.

---

## 3. Diccionario canónico

Vocabulario único, nombrado por **columna + concepto**. En negrita lo que cambia.

### Digital
| etiqueta | JM hoy | SECCO hoy | canónico |
|---|---|---|---|
| Impresiones | `enc_impresiones` | `enc_impresiones` | `enc_impresiones` |
| Clics / CTR | — | `enc_clics_ctr` + `enc_ctr` | `enc_clics_ctr` + `enc_ctr` · **falta en JM** |
| Alcance efectivo ("Audiencia Alcanzada" / "Alcance") | `enc_audiencia` + `_pct` | `enc_alcance` + `_pct` | **`enc_alcance` + `enc_alcance_pct`** |
| Alcance potencial | `enc_alcance_potencial` | — | `enc_alcance_potencial` · no existe en SECCO |
| Habitantes | `ecv_poblacion` | `ecv_poblacion` | `ecv_poblacion` ⚠ ver §6 |

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

---

## 4. M2 slide 10 — nombres por categoría (confirmado)

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
crean. Lo dejo como pregunta.

---

## 5. El bloque de encuentro pasa a ser repetible (confirmado)

Hoy hay una familia por sección: `u1_*` (uno a uno), `et_*` (temático), `emin_*`
(ministros), y Primera persona sin marcar. Pero las slides son **la misma estructura** con
distinto encuentro adentro: separador + estrategia + iceberg.

**Propuesta:** una sola familia de encuentro, y el tipo lo define la fila de `CAMPANAS`.

| hoy | pasa a ser |
|---|---|
| `et_nombre` / `ecv_comuna` (identidad) | `enc_nombre` |
| `et_fecha` / `ecv_fecha` | `enc_fecha` |
| `ecv_comuna` / "eje" / "barrio" (lugar) | `enc_lugar` |
| `et_mail`, `et_ivr`, `et_cc`, `et_directa`, `et_convocatoria`, `et_digital`, `et_post_periodo` | `enc_estr_mail`, `enc_estr_ivr`, `enc_estr_cc`, `enc_estr_directa`, `enc_estr_convocatoria`, `enc_estr_digital`, `enc_estr_post_periodo` |
| métricas del iceberg | `enc_*` del §3, sin cambio |
| inscriptos / asistentes | `ecv_*`, sin cambio |

`CAMPANAS` ya tiene columna `tipo`: se le agregan los valores `uno_a_uno`, `tematico`,
`primera_persona`, `ministros`. El motor itera las filas con `mostrar=sí`, ordenadas por
`orden`, y emite el bloque de slides que corresponda a cada tipo — exactamente el mismo
mecanismo que ya está diseñado para `camp_*`.

**Qué cambia en los pasos pendientes:**

- **Paso 2.5** — al sembrar `MARCADORES` desde los tokens, los `enc_*` de un bloque
  repetible **no** son una fila por slide: son una fila por token, y el bloque se instancia
  N veces en el Paso 5. Hay que decirlo en el prompt o se siembran duplicados.
- **Paso 5** — deja de ser "bloques repetibles de campaña" y pasa a ser "bloques
  repetibles", con dos tipos de bloque: encuentro y campaña. La mecánica es la misma.
- **`emin_*`** queda como está: aunque es un encuentro, su slide es un agregado semanal de
  varios encuentros, no un bloque por encuentro. No se toca.

Primera persona, además, hay que marcarla: hoy son tres slides enteras en `xx`.

---

## 6. Pendiente que sigue abierto

`ecv_poblacion` aparece con dos etiquetas: **"Habitantes del Barrio"** en JM y
**"Habitantes del eje"** en SECCO. Un eje agrupa varios barrios (Orden Público Eje Norte),
así que no puede ser el mismo cálculo con la misma fuente. O son dos tokens, o el token es
uno y el motor resuelve la suma según el `enc_lugar` del encuentro. Va como pregunta al
equipo.

---

## 7. Preguntas

**Para vos:**

1. Visualizaciones de M2: ¿agrego las cajas faltantes en Tránsito, Salud y Seguridad, o
   dejo esas tres categorías sin ese token?
2. Los renombres del §3 y §4 son ~30 reemplazos de texto en las dos plantillas. ¿Te paso
   la lista para hacerlo a mano, o te armo la función de Apps Script que los aplica con
   `replaceAllText` en el orden correcto?

**Para el equipo:**

3. "Habitantes del eje" vs "Habitantes del barrio" (§6).
4. JM no muestra Clics/CTR digital ni Llamados de IVR, y SECCO no muestra Alcance
   potencial. ¿Es intencional (cada informe muestra lo suyo) o son cajas que faltan?
