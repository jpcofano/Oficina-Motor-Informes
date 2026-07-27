# Selección de campañas

## Qué resuelve

Un informe agrega métricas digitales **solo de las campañas que le corresponden**.
Los valores de la columna **"Nombre de campaña"** son inconsistentes, así que el
cruce automático no alcanza: hay un paso curado donde una persona elige qué campañas
entran. Esa selección se guarda en Sheets y el motor la respeta al calcular.

Esto es el mismo problema del cruce RDV ↔ métricas: por eso la selección es humana,
pero **asistida** (el sistema propone; la persona confirma).

---

## Grano de la selección — CONFIRMÁ

¿A qué se ata la selección de campañas? (marcá el que corresponde)

- [ ] Por **informe + período** (ej: las campañas de este informe semanal)
- [ ] Por **barrio / encuentro** (cada encuentro tiene sus campañas)
- [ ] Por **figura / ministerio**
- [ ] Otro: __________

De esto depende la estructura de la hoja. Abajo asumo **informe + período**;
si es otro, se ajusta.

---

## Hoja `CAMPANAS`

Una fila por campaña seleccionada. La crea `instalar()` (Paso 0).

| informe | periodo | nombre_campana | incluir | notas |
|---|---|---|---|---|
| `SEMANAL_JM` | `2026-W23` | RDV Palermo 2026-06 | SI | |
| `SEMANAL_JM` | `2026-W23` | 1 A 1 Palermo | SI | |
| `SEMANAL_JM` | `2026-W23` | CAFE Belgrano | NO | fuera de período |

- `nombre_campana` debe coincidir **exacto** con el valor de "Nombre de campaña"
  en la fuente. Por eso no se tipea a mano: se elige de una lista (Paso 7).
- `incluir` = SI/NO permite dejar registro de lo descartado, no solo lo elegido.

---

## Cómo lo elige el usuario (panel — Paso 7)

Checklist en el panel lateral:

1. El panel lee la fuente y arma la lista **única** de nombres de campaña del período.
2. Los muestra como checkboxes, con un buscador de texto arriba.
3. La persona tilda las que entran y guarda.
4. Se escriben las filas en `CAMPANAS` para ese `informe + periodo`.

Asistencia (opcional, mejora futura): pre-tildar las que matchean por barrio/fecha,
para que la persona solo confirme en vez de buscar de cero.

---

## Cómo lo aplica el motor (Pasos 2–3)

- `Fuentes.gs` acepta un filtro opcional `campanas: [nombres...]`.
- Al calcular marcadores digitales, `Marcadores.gs` lee de `CAMPANAS` las campañas
  con `incluir = SI` para ese informe+período y filtra la fuente por
  `nombre_campana ∈ seleccionadas` **antes** de sumar.
- Si no hay selección cargada para el período → el marcador digital sale con
  estado `sin_datos` (amarillo), **no** suma todo por defecto. Así nadie reporta
  métricas de campañas que no eligió.

---

## Preguntas abiertas — CONFIRMÁ

1. Nombre y ubicación exactos de la columna "Nombre de campaña" (¿qué hoja / base?).
2. ¿La selección se reusa entre períodos o se rehace cada vez?
3. ¿Puede una campaña pertenecer a más de un informe a la vez?
