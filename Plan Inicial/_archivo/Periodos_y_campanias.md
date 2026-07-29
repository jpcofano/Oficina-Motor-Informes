# Períodos múltiples y selección de campañas

> Rompe el supuesto de "un período por informe". Hay **tres capas de período** que
> conviven, y la selección de campañas varía en cada edición.
> Todo se resuelve por filas — cero código nuevo salvo la lógica de resolución
> (que va en el motor, no en `Marcadores.gs`).

---

## Las tres capas de período

1. **Período principal del informe** — semanal (JM) o mensual (SECCO). Es la ventana
   de la edición actual. Vive en `CONFIG` (`periodo_desde` / `periodo_hasta`), la
   setea el selector de período del panel en cada corrida.
2. **Secciones con otro corte** — ej. M2 mensual dentro de un JM semanal. Se resuelve
   con una ventana con nombre en la hoja `PERIODOS`, referenciada desde el marcador.
3. **Período por campaña** — cada campaña seleccionada tiene **su propia ventana**
   (las fechas en que corrió), independiente del informe. Vive en `CAMPANAS`.

---

## Cambios de esquema

### Nueva hoja: `PERIODOS` (ventanas con nombre)
Solo hace falta para las secciones que NO siguen el período principal.

| periodo_id | desde | hasta | notas |
|---|---|---|---|
| m2_mensual | 2026-06-01 | 2026-06-30 | M2 dentro del JM |
| quincena_rrss | 2026-06-16 | 2026-06-30 | Análisis RRSS |

### `MARCADORES` — nueva columna `periodo_ref`
| marcador | familia | base_id | **periodo_ref** | calculo |
|---|---|---|---|---|
| `ecv_inscriptos` | ecv | rdv | *(vacío → principal)* | calcInscriptos |
| `m2_envios` | m2 | m2 | `m2_mensual` | calcEnvios |
| `rrss_menciones` | rrss | digital | `quincena_rrss` | calcMenciones |

`periodo_ref` vacío = usa el período principal de `CONFIG`.

### `CAMPANAS` — fechas propias + selección
| campana_id | nombre | informe_id | base_id | tipo | **desde** | **hasta** | mostrar | orden |
|---|---|---|---|---|---|---|---|---|
| serv_esenciales | Servicios esenciales | secco | looker | destacada | 2026-06-02 | 2026-06-15 | sí | 1 |
| bax | BAX | secco | looker | destacada | 2026-06-10 | 2026-06-20 | no | 2 |
| encuentros_min | Encuentros de ministros | secco | rdv | encuentro_ministros | 2026-06-01 | 2026-06-30 | sí | 3 |

---

## Cómo el motor resuelve el período de cada valor

Al calcular un token, el motor decide la ventana en este orden:

1. **¿El token pertenece a una campaña seleccionada?** → usa `desde`/`hasta` de esa
   fila de `CAMPANAS`.
2. **¿El marcador tiene `periodo_ref`?** → usa esa ventana de `PERIODOS`.
3. **Si no** → usa el período principal de `CONFIG`.

Así, en un mismo informe, `ecv_inscriptos` puede calcularse sobre la semana,
`m2_envios` sobre el mes, y la campaña "Servicios esenciales" sobre sus propias
fechas — todo en la misma corrida.

---

## Selección de campañas (varía cada edición)

- El motor arma las slides de campaña filtrando `CAMPANAS` por `informe_id` +
  `mostrar=sí`, y emite **un bloque por campaña**, ordenado por `orden`.
- Como "no siempre entran las mismas": cada edición se tildan las que van
  (`mostrar`), y las nuevas se agregan como filas nuevas. Las que no van quedan en
  `no` (no se borran: sirven de historial y para reusar el mes siguiente).
- Cada `tipo` (destacada / encuentro_ministros / proveedor) consume su propia
  plantilla de slide repetible.

---

## En el panel (amigabilidad)

- **Período principal:** un date-picker que escribe `periodo_desde`/`hasta` en `CONFIG`.
- **Períodos alternos:** una mini-tabla editable de `PERIODOS` (solo si el informe
  usa secciones con otro corte).
- **Campañas:** checklist con las campañas del informe; cada fila con sus fechas
  editables y el toggle mostrar/ocultar. Botón "agregar campaña" = fila nueva.
- **Vista previa ✅/⚠️:** al previsualizar, cada token muestra con qué ventana se
  calculó → refuerza la trazabilidad ("este número es del 02 al 15/06, campaña X").

---

## Impacto en los pasos

- **Paso 0:** sumar la hoja `PERIODOS` y las columnas `periodo_ref` (MARCADORES) y
  `desde`/`hasta` (CAMPANAS). *(delta sobre lo ya creado)*
- **Paso 2:** el lector de datos recibe una **ventana** (desde/hasta) como parámetro,
  no un período global — así sirve para las tres capas.
- **Paso 4/5:** al renderizar campañas, iterar `CAMPANAS` con `mostrar=sí` y pasar
  las fechas de cada una.
