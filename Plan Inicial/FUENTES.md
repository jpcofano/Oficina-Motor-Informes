# FUENTES — mapeo de bases, hojas y marcadores

Documento vivo. Lo llenamos de a poco, familia de marcadores por familia.
Convención de estado: **[OK]** confirmado · **[PROP]** propuesto por Claude, falta
confirmar · **[?]** decisión pendiente tuya.

---

## 1. Los informes y sus plantillas

| Informe | Deck de ejemplo | Plantilla marcada | Slides |
|---|---|---|---|
| **Semanal JM** | `Copia_de_Informe_semanal_JM_26_06_AL_03_07.pptx` (29) | `PLANTILLA_marcada.pptx` (9, 110 marcadores) [OK] | ✅ tenemos plantilla |
| **Seguimiento SECCO-SSCDI** | `Copia_de_Seguimiento_SECCO_-_SSCDI_03-07.pptx` (66) | — [?] falta plantilla marcada | pendiente |
| **3er informe** | [?] ¿cuál es? | — | pendiente |

---

## 2. Las bases (solo las hojas que importan)

Las tres tienen muchísimas hojas de backup, dinámicas y auxiliares. Estas son las
candidatas a fuente:

### RDV — `RDV_JM_CM_ES___funcionarios.xlsx`  (Encuentros)
- Hoja **`RVD JM-CM - ES`** (1.363 filas): la maestra de encuentros.
  Columnas clave: `Figura, Barrio, EVENTO, FECHA, STATUS REUNIÓN, Inscriptos,
  Mail, Call Center, IVR, RRSS, Difusión, Asistentes, % de Asistencia`,
  + demografía por comuna (`Comuna, Poblacion, 18-24…66+`).
- Filtro de "realizadas": `STATUS REUNIÓN`.

### Seguimiento Digital — `Seguimiento_Digital___1_.xlsx`  (Directa + Digital)
- **`Digital`**: campaña de pauta. Campaña = `Nombre campaña | Digital`.
  Métricas: `Impresiones, Alcance, Frecuencia, Views, VTR, Clics, CTR, Costo…`
- **`Directa Mail`**: Campaña = `Nombre campaña | Directa`.
  `Enviados, Entregados, Aperturas, % OR, Clics, % CTOR`.
- **`Directa IVR`**: Campaña = `Nombre campaña | Directa`.
  `Audiencia, Llamados Realizados/Atendidos, %+75%, Marque 1`.
- **`Directa SMS`**: Campaña = `Nombre campaña | Directa`.
  `Enviados, Entregados, % Entregados, Clics`.
- **`CAMPAÑAS_DESGLOCE_DIGITAL`**: por plataforma (`Nombre Campaña`, `Plataforma`,
  `Impresiones, Visualizaciones, Clics`). Candidata para `enc_post_google/meta/prog_*`.
- Ojo: hay hojas `INFORME`, `Metricas informe`, `Nomalización de barrios` que ya
  traen cálculos por barrio; hay que decidir si el motor calcula o las reusa.

### Looker — `Base_Looker.xlsx`  (consolidado por campaña)
- **`resumen_metricas`** (~1.000 filas): una fila por campaña, TODO consolidado.
  Campaña = `nombre_campaña`. Fechas `fecha_inicio / fecha_fin`.
  Trae `digital_*`, `mails_*`, `call_*`, `ivr_*`, `sms_*`, `meta_alcance, frecuencia_total`.

**Solapamiento:** la métrica digital/directa está en Seguimiento_Digital **y** en
Looker. Hay que elegir una como fuente de verdad (ver §4).

---

## 3. La columna de campaña cambia según la hoja

| Hoja | Columna de nombre de campaña |
|---|---|
| `Digital` | `Nombre campaña \| Digital` |
| `Directa Mail/IVR/SMS` | `Nombre campaña \| Directa` |
| `CAMPAÑAS_DESGLOCE_DIGITAL` | `Nombre Campaña` (+ `nombre_campaña`) |
| Looker `resumen_metricas` | `nombre_campaña` |

Esto es clave para "campañas destacadas": el checklist del panel (Paso 7) tiene que
saber **de qué columna** sacar la lista única. Ver §4.

---

## 4. Decisiones abiertas [?]

1. **Fuente de verdad digital/directa:** ¿Seguimiento_Digital (con el split Directa)
   o Looker (consolidado)? Afecta a las familias `mail_/ivr_/cc_/imp_/pauta_` y `gcba_`.
2. **Columna de campaña canónica** para el selector de campañas destacadas.
3. **Cálculo vs. reuso:** ¿el motor recalcula desde las hojas crudas, o lee las hojas
   ya calculadas (`INFORME`, `Nomalización de barrios`)?
4. **Columna de fecha** para filtrar por período en cada base.
5. **3er informe** y si SECCO-SSCDI tendrá su propia plantilla marcada.

---

## 5. Mapeo de marcadores — familia por familia

### 5.1 ECV (base RDV, hoja `RVD JM-CM - ES`) — [PROP] confirmá

| marcador | operación | campo fuente |
|---|---|---|
| `{{periodo}}` | TEXTO | etiqueta del período |
| `{{ecv_inscriptos}}` | SUMA | `Inscriptos` |
| `{{ecv_asistentes}}` | SUMA | `Asistentes` |
| `{{ecv_insc_mail}}` | SUMA | `Mail` |
| `{{ecv_insc_digital}}` | SUMA | `RRSS` |
| `{{ecv_insc_dif}}` | SUMA | `Difusión` |
| `{{ecv_insc_cc}}` | SUMA | `Call Center` |

Filtro base: `STATUS REUNIÓN` = realizada, dentro del período por `FECHA`.

### 5.2 Resumen digital JM — [?] pendiente §4.1
`mail_envios/entregados/aperturas/or, ivr_llamados/atendidos/at_pct/75/75_pct/campanias,
cc_base/contactados/contact_pct, imp_total/google/meta/prog, pauta_google/meta/prog,
frecuencia`

### 5.3 Resumen GCBA (`gcba_*`) — [?] espeja 5.2 con filtro GCBA

### 5.4 Campaña destacada (`enc_*`) — [?] pendiente §4.2
Detalle por campaña elegida: `enc_pre_*` (pre-pauta), `enc_post_google/meta/prog_*`
(por plataforma), `enc_mails_*`, `enc_ll_*`, `enc_e75_*`, `enc_marque1`, `enc_tot_*`.
Es la sección "campañas destacadas": una slide por campaña seleccionada.
