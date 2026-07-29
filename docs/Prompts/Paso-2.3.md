# Paso 2.3 — sembrar `digital` (snapshot + join id_cuenta), diagnóstico honesto, filas vacías fuera del conteo

> Prompt autocontenido para Claude Code. No asume contexto de chat. Todo lo
> necesario para ejecutar y verificar está acá. Los archivos viven en la raíz del
> repo (`Fuentes.gs`, `Config.gs`, `Instalar.gs`) y los `.xlsx` de referencia en
> `Plan Inicial/_archivo/samples/Datos/`.

## Contexto

Paso 2.1 dejó la convención "una columna `fecha` por base" en `MAPEO` y el
diagnóstico `menuProbarLectura_` (en `Fuentes.gs`). Al correrlo, el estado fue:

- `rdv` ✅ — sano (col E `FECHA`, 16 en ventana).
- `digital` ⚠️ `falta MAPEO: digital/fecha` — **está activo pero sin sembrar a
  propósito** (ver comentario en `SEED_MAPEO_`, `Instalar.gs`).
- `looker` ✅ pero 0 en ventana, 899/902 sin fecha — sale verde igual (el ✅ solo
  significa "pude leer + resolver la columna", no "la data sirve").
- `m2` ✅ pero con header leído como fecha (`"Fri Jul 10 2026…"`) porque la fila
  viva de `BASES` quedó desincronizada del código: el `SEED_BASES_` ya tiene m2
  correcto (`fila_encabezado: 3, modo_periodo: 'snapshot'`), la Sheet viva no.

## Decisiones ya tomadas (no re-litigar)

1. **Las cuatro bases se usan**, cada una dueña de sus campos. Precedencia de
   *merge* cuando se pisan: **RDV → Seguimiento Digital → Looker**. m2 va aparte
   (familia `m2_*`). Esta precedencia es lógica del agregador (Paso 3), NO se
   codea acá; dejala documentada.
2. **`digital` pasa a `modo_periodo = 'snapshot'`** (igual que m2). Motivo: sus
   solapas tienen fechas heterogéneas y la solapa `Digital` usa *fecha de inicio*
   de campaña (arranque con lead de 3-7 días antes del encuentro), que ventaneada
   contra la semana del encuentro tira casi todo — mismo problema que Looker. El
   recorte por período lo hará el agregador (Paso 3) vía el link campaña↔encuentro,
   no por ventana de fecha cruda. Efecto colateral buscado: desaparece el
   `⚠️ falta MAPEO: digital/fecha` de forma honesta (snapshot no resuelve `fecha`).
3. El **join entre solapas de `digital` es por `ID Cuentas`** y lo hace el
   agregador (Paso 3). `leerFuente` lee UNA solapa por llamada; acá solo se
   **mapea** `id_cuenta` en cada solapa para que la clave del join sea resoluble.

---

## Tarea 1 — sembrar `digital` en `Instalar.gs`

### 1a. `SEED_BASES_`
Cambiar la fila de `digital`: `modo_periodo: 'filtrar'` → `'snapshot'`. Dejar
`hoja_default: 'Digital'`, `fila_encabezado: 1`, `activo: 'sí'`. No tocar las
demás filas (rdv, looker ya están; m2 ya está correcto en snapshot/3).

### 1b. `SEED_MAPEO_` — agregar las filas de `digital`
Encabezado en fila 1 en TODAS las solapas. `campo_logico` **debe ser único por
`base_id`**, así que prefijá por solapa. Columnas relevadas del `.xlsx`
`Seguimiento Digital (2).xlsx` (verificar contra Sheet viva; ver Tarea 5):

**Solapa `Digital`** (campaña digital):
| campo_logico | columna | header real |
|---|---|---|
| dig_campana | A | Nombre campaña \| Digital |
| dig_jm_gcba | B | JM \| GCBA \| POLICIA |
| dig_id_cuenta | T | **ID Cuentas** (join) |
| dig_fecha_inicio | E | Fecha de inicio |
| dig_fecha_fin | F | Fecha de fin |
| dig_impresiones | H | Impresiones |
| dig_alcance | I | Alcance |
| dig_frecuencia | J | Frecuencia |
| dig_views | K | Views |
| dig_vtr | L | VTR |
| dig_clics | M | Clics en el enlace totales |
| dig_ctr | O | CTR |
| dig_impresiones_social | U | Impresiones Social |

**Solapa `Directa Mail`:**
| mail_id_cuenta | A | **ID Cuentas** (join) |
| mail_campana | H | Nombre campaña \| Directa |
| mail_fecha | F | Fecha envio |
| mail_enviados | M | Enviados |
| mail_entregados | N | Entregados |
| mail_aperturas | O | Aperturas |
| mail_or | P | % OR |
| mail_clics | Q | Clics |
| mail_ctor | R | % CTOR |
| mail_area | T | Área |

**Solapa `Directa SMS`:**
| sms_id_cuenta | A | **ID cuentas** (join) |
| sms_campana | E | Nombre campaña \| Directa |
| sms_fecha | D | Fecha de envio |
| sms_enviados | F | Enviados |
| sms_entregados | G | Entregados |
| sms_ent_pct | H | % Entregados |
| sms_clics | I | Clics |

**Solapa `Directa IVR`** (ojo: no hay fecha única; tiene Inicio D y Fin E):
| ivr_id_cuenta | A | **ID cuentas** (join) |
| ivr_campana | I | Nombre campaña \| Directa |
| ivr_inicio | D | Inicio |
| ivr_fin | E | Fin |
| ivr_audiencia | J | Audiencia |
| ivr_llamados | K | Llamados Realizados |
| ivr_atendidos | L | Llamados Atendidos |
| ivr_at_pct | M | % Atendidos |
| ivr_e75 | N | Escucharon +75% |
| ivr_e75_pct | O | % +75% |
| ivr_marque1 | P | Marque 1 |
| ivr_marque1_pct | Q | % Marque 1 |

**Solapa `Alcance`** (alcance/frecuencia por cuenta):
| alc_id_cuenta | A | **ID Cuentas** (join) |
| alc_alcance | B | Alcance |
| alc_frecuencia | C | Frecuencia |

**Solapa maestra `Seguimiento digital`** (dimensión + pauta por plataforma):
| sd_id_cuenta | A | **ID Cuentas** (join) |
| sd_campana_cuentas | B | Nombre campaña \| Cuentas |
| sd_campana_digital | C | Nombre campaña \| Digital |
| sd_fecha_inicio | L | Fecha de inicio |
| sd_pauta_google | T | Google (conteo contenidos) |
| sd_pauta_prog | U | Programmatic (conteo) |
| sd_pauta_meta | V | Meta (conteo) |

> Nota: `sd_pauta_*` son los que alimentan los marcadores `pauta_google/prog/meta`
> — conteo de contenidos por plataforma, no montos. Dejar esa aclaración en `notas`.

Todas estas filas llevan `hoja` = el nombre exacto de su solapa, para que el
agregador pueda pasar `nombreHojaOverride` a `leerFuente`.

---

## Tarea 2 — diagnóstico honesto (el ✅ que miente)

En `Fuentes.gs`, función `menuProbarLectura_`, en el bloque que arma la línea de
una base en modo `filtrar` (el `lineas.push('✅ ' + r.base_id + …)`), degradar el
ícono cuando la data no sirve, sin cambiar el texto ni el formato de los números:

- usar `⚠️` en vez de `✅` si `r.filas_en_ventana === 0`, **o** si
  `r.filas_totales > 0 && (r.filas_sin_fecha / r.filas_totales) > 0.5`.
- el caso `snapshot` y el caso `!r.ok` quedan igual.

El objetivo: que `looker` (0 en ventana) y un `m2` mal configurado dejen de salir
en verde. No inventar un tercer estado; ⚠️ alcanza.

---

## Tarea 3 — que el conteo no incluya filas vacías

Problema: `leerFuente` hoy descarta solo filas **completamente** vacías
(`filaVacia_`). Filas basura (fórmulas que devuelven '', filas de relleno con una
sola celda, colas de la hoja que `getDataRange()` arrastra) sobreviven e inflan
`filas_totales` y `filas_sin_fecha`. En el Looker vivo esto se ve como 899 filas
"sin fecha" que en el `.xlsx` archivado no existen (ahí son 900 reales todas con
fecha + 99 100%-vacías).

Fix (en `Fuentes.gs`, `leerFuente`), **preservando** el comportamiento actual para
bases que no definan clave:

1. Resolver una **columna clave** por base: si `MAPEO` tiene, para ese `base_id`,
   una fila `campo_logico = 'clave'`, usar esa columna; si no, si existe `campana`,
   usar esa; si no hay ninguna, caer al `filaVacia_` de siempre.
2. Cuando hay columna clave: una fila cuenta como dato **solo si su celda clave no
   está vacía** (trim). Las que no, no entran en NINGÚN conteo (`filas_totales`,
   `filas_sin_fecha`, `filas_en_ventana`) ni en `filas`.
3. Agregar al resultado `filas_descartadas_sin_clave` (número) para trazabilidad,
   y mostrarlo en la línea del diagnóstico entre paréntesis si es > 0.
4. Para `looker`, sembrar en `MAPEO` `looker/clave = B` (nombre_campaña) — o
   reutilizar el `campana` existente (B) sin fila nueva, lo que sea menos invasivo.
   Para `digital` (snapshot), la clave por solapa la resuelve el agregador; el
   diagnóstico de digital corre sobre `hoja_default` (`Digital`), clave `dig_campana`
   (A) → si preferís, sembrá `digital/clave = A`.

No cambiar la firma pública de `leerFuente`. No romper `rdv` (que hoy anda: si no
le definís clave, sigue con `filaVacia_`).

---

## Tarea 4 — resembrar y verificar

1. `clasp push`.
2. Correr `seedConfiguracion()` desde el editor. Debe reportar `digital` con filas
   nuevas en MAPEO y `m2` actualizado en BASES (upsert, no pisa filas del usuario
   fuera del SEED). **`m2` se arregla solo con esto** (vuelve a snapshot/fila 3).
3. Correr el ítem de menú de "Probar lectura" (`menuProbarLectura_`). Esperado:
   - `rdv` ✅ como antes.
   - `digital` ✅ snapshot — "N filas (todas, sin ventana)"; sin warning de fecha.
   - `m2` ✅ snapshot — "N filas (todas, sin ventana)"; header ya no es una fecha.
   - `looker` ⚠️ (si sigue 0 en ventana o mayoría sin fecha) — ahora honesto.

## Tarea 5 — verificación aparte (NO bloquea, documentar hallazgo)

El Looker vivo no coincide con el `.xlsx` archivado (archivo: 900 filas todas con
`fecha_inicio`; vivo: 899 sin fecha). Antes de dar por buena la data de looker,
verificar en la Sheet viva qué son esas filas: ¿la solapa `resumen_metricas` quedó
apuntando a una versión dinámica/con fórmulas? ¿arrastra filas fórmula que devuelven
vacío? Dejar el hallazgo en `docs/HALLAZGOS_validacion_decks.md`. El fix de Tarea 3
hace el conteo robusto igual, pero la discrepancia de fondo es un tema de la base.

## Criterios de aceptación

- [ ] `digital` en snapshot, activo, con todas las solapas mapeadas (incl. `id_cuenta`
      por solapa); `campo_logico` único por base.
- [ ] `menuProbarLectura_` muestra ⚠️ para bases con 0 en ventana o mayoría sin fecha.
- [ ] `leerFuente` descarta filas sin clave del conteo; `rdv` sigue igual que antes.
- [ ] Tras `seedConfiguracion()`, `m2` lee en snapshot con header correcto.
- [ ] Sin cambios de firma en `leerFuente`; sin tocar `Config.gs` salvo que haga
      falta para la columna clave.
- [ ] Un renglón en `PROYECTO.md` cerrando Paso 2.3 y la precedencia de merge
      documentada para el Paso 3.
