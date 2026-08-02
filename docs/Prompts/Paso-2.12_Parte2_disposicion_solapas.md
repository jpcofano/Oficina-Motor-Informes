# Paso 2.12 Parte 2 — Disposición de las solapas: cerrar `SOLAPAS.uso`

**Estado:** vivo, **sin ejecutar** · **Fecha:** 2026-08-02 · **Ubicación:** `docs/Prompts/Paso-2.12_Parte2_disposicion_solapas.md`

> **`reemplaza:` la Parte 2 de `docs/Prompts/Paso-2.12_conteos_y_clasificacion.md`.**
> Ese texto no se toca. Se reemplaza porque su alcance —"las 17 filas en `revisar`"— está
> vencido en dos direcciones, verificado contra `docs/_snapshots/SOLAPAS_2026-08-01.tsv`
> el 02/08/2026. Las decisiones de contenido que tomó **siguen todas en pie** y se
> transcriben acá; lo que cambia es cuántas filas son, cuáles, y qué hay que hacer con
> cada grupo.
>
> Las Partes 1 y 3 de aquel documento **siguen vigentes y no las toca este prompt.**

---

## Precondición dura — no arrancar sin esto

**Este paso arranca después de confirmar que `protegidas (con diferencia)` bajó de 10 a 8**
en una corrida de "Aplicar configuración" (Paso 2.11 Parte E, pendiente de verificación al
escribir esto).

Por qué es dura y no una cortesía: las **ocho** son la lista de trabajo del Grupo B de
abajo. Si el número no bajó a 8, o bajó a otro número, entonces las dos filas de `looker`
siguen mezcladas con las de `rdv` y la lista está mal armada — se estaría trabajando sobre
un conjunto que no es el que se cree. **Si no da 8, parar y reportar antes de tocar nada.**

---

## Por qué el alcance cambió

El texto original decía **17 filas en `revisar`** y marcaba dos de ellas
(`rdv/RDV CONJUNTO`, `rdv/Comunas`) como un sub-problema difícil, porque tenían
`origen=manual` y el sembrador no las iba a tocar.

Contra el snapshot del 01/08:

- **Quedan 15 filas con `uso=revisar`**, no 17, y **las 15 tienen `origen=seed`**.
- Las dos difíciles **ya están resueltas en la planilla**, a mano, y con el valor que este
  mismo prompt había decidido: `RDV CONJUNTO` = `ignorar`, `Comunas` = `referencia`. El
  sub-problema del `origen=manual` **se disolvió**; no hace falta ni migración puntual ni
  edición a mano.
- Pero apareció un grupo que el texto original **no enumeraba**: hay **ocho filas de `rdv`**
  donde el `SEED_SOLAPAS_` sigue diciendo `revisar` y la planilla ya tiene una decisión
  humana. Dos de esas ocho son justamente `RDV CONJUNTO` y `Comunas`.

> ⚠ **Una advertencia de procedencia sobre `rdv/RDV CONJUNTO`.** Su `uso=ignorar` actual
> entró como **edición de control positivo** del protocolo del 31/07
> (`docs/PROTOCOLO_2.11-C_corrida_2026-07-31.md`, edición nº 3), no como aplicación
> deliberada de esta decisión. Que coincida con el valor decidido es afortunado, no
> intencional. **Confirmarlo con el usuario antes de sembrarlo** — es la única de las ocho
> cuyo valor en la planilla no tiene una decisión humana explícita detrás.

---

## Los dos grupos

### Grupo A — las 15 filas todavía en `uso=revisar` (`origen=seed`)

Trabajo: **editar `SEED_SOLAPAS_`**. Nada más. Son `origen=seed`, así que el sembrador las
pisa sin resistencia y no hace falta migración.

Las decisiones son las del texto original, transcriptas sin cambio. Los conteos de filas
son los de aquel relevamiento y **no son criterio de aceptación** — las bases se mueven.

**A `fuente` (2)**

| solapa | por qué |
|---|---|
| `digital/CAMPAÑAS_DESGLOCE_DIGITAL` | tabla original con encabezados en fila 1, sin recorte por período. Los casos V-21 a V-26 de `VALIDACION` la usan y resuelven |
| `digital/Cuentas` | catálogo maestro. `ID Cuentas` es clave única real: 3.453 filas, 3.453 valores distintos, cero vacíos — la única columna así en las cuatro bases |

**A `referencia` (2)**

| solapa | por qué |
|---|---|
| `digital/EDV` | funcionarios/figuras por fecha (confirmado por el usuario) |
| `looker/Audiencias` | catálogo de segmentaciones |

> La tercera fila `referencia` del texto original era `rdv/Comunas`, que ya no está en
> `revisar`: pasó al Grupo B.

**A `ignorar` (11)**

| solapa | por qué |
|---|---|
| `m2/CAMPAÑAS_DESGLOCE_DIGITAL` | copia exacta de la de `digital` |
| `m2/Alcance` | copia exacta de `digital/Alcance` y `looker/ALCANCE` |
| `m2/Seguimiento digital` | copia exacta de `digital/Seguimiento digital` |
| `m2/Cuentas` | mismo universo que `digital/Cuentas`, que queda como fuente |
| `looker/Cuentas` | es el origen de `resumen_metricas_dinamico`, que ya es fuente |
| `looker/URLs` | links a piezas creativas; además tiene `id_cuentas` y `nombre_campaña` duplicados en el encabezado |
| `looker/Desglose Alcance` | `looker/ALCANCE` ya da el alcance por cuenta |
| `looker/Audiencias Conectadas` | 1 fila de datos |
| `digital/Filter unificado` | la fila 1 son dos fechas — no tiene encabezados |
| `m2/M2 Directa` | `m2` quedó `sin_fuente` en `Paso-2.10` Parte C |
| `m2/M2 digital` | ídem |

> La docena original incluía `rdv/RDV CONJUNTO`, que pasó al Grupo B. Quedan 11.
>
> `m2/M2 Directa` y `M2 digital` se ignoran **porque hoy no hay a qué engancharlas**, no
> porque no sirvan. Si la lista curada de campañas M2 termina viviendo en `CAMPANAS`,
> `M2 Directa` es el detalle que corresponde. **Dejarlo escrito en `notas`.**

### Grupo B — las 8 protegidas de `rdv`: alinear el seed con lo ya decidido

Estas **no están en `revisar` en la planilla**: ya tienen su decisión. El problema es que
`SEED_SOLAPAS_` sigue diciendo `revisar`, y como son `origen=manual`,
`aplicarClasificacionSolapas_` no las pisa — reporta la diferencia y sigue. Resultado: ocho
líneas `protegida (habría cambiado)` sobre la columna `uso` **en cada corrida, para
siempre**.

| solapa | planilla (decidido) | `SEED_SOLAPAS_` hoy |
|---|---|---|
| `rdv/PPTS` | `ignorar` | `revisar` (`Instalar.gs:1020`) |
| `rdv/RDV CONJUNTO` | `ignorar` ⚠ ver advertencia de procedencia | `revisar` (`:1020`) |
| `rdv/Agenda` | `ignorar` | `revisar` (`:1020`) |
| `rdv/Comunas` | `referencia` | `revisar` (`:1020`) |
| `rdv/Seguimiento` | `ignorar` | `revisar` (`:1020`) |
| `rdv/Respuestas JM 📩` | `ignorar` | `revisar` (`:1020`) |
| `rdv/RDV_JM_CM_ES` | `ignorar` | `revisar` (`:1009`) |
| `rdv/Funcionarios / Ministros` | `referencia` | `revisar` (`:1019`) |

Trabajo: **poner en `SEED_SOLAPAS_` el valor que ya está decidido en la planilla**, para
que el seed y la decisión humana digan lo mismo y la línea deje de emitirse. Ojo con
`Instalar.gs:1020`, que hoy agrupa seis solapas bajo un solo `revisar`: hay que abrirlo
porque las seis no van al mismo lado (`Comunas` va a `referencia`, las otras cinco a
`ignorar`).

**No se toca `origen`.** Que sigan en `manual` es correcto: son decisiones humanas y la
protección tiene que seguir existiendo. Lo que se corrige es que el seed proponga otra
cosa.

> Esto es lo contrario del caso de `looker` que cerró la Parte E del 2.11. Allá el
> `origen=manual` era vestigial —lo había escrito una migración, y el seed ya coincidía—,
> así que se devolvió la fila al sembrador. Acá el `origen=manual` es genuino y se
> conserva; lo que se alinea es el seed. **Mismo síntoma, causa opuesta, arreglo opuesto.**

---

## Tarea

1. **Grupo A** — las 15 filas a su `uso` decidido en `SEED_SOLAPAS_`.
2. **Grupo B** — las 8 filas de `rdv` al valor que ya tiene la planilla, abriendo la
   agrupación de `Instalar.gs:1020`. Confirmar `RDV CONJUNTO` con el usuario antes.
3. Las notas de las filas que cambian de `uso` dicen **por qué**, no sólo qué. Las de
   `m2/M2 Directa` y `M2 digital` llevan la condición de reversión escrita.
4. Nada más. **No se toca `origen`, no se toca `MAPEO`, no se toca la planilla a mano.**

## Criterio de aceptación

1. **Cero filas con `uso=revisar`** en `SOLAPAS` después de aplicar.
2. **`protegidas (con diferencia)` baja de 8 a 0.** Las ocho siguen apareciendo como
   `protegida (sin diferencias)` —siguen siendo `origen=manual`, y eso está bien—, pero
   ninguna tiene ya nada que el seed quiera cambiarle.
3. **Segunda corrida idéntica a la primera**: cero cambios, cero migraciones. La
   idempotencia no se rompe.
4. El reporte dice cuántas filas cambió por grupo, **por separado**. Lo que no puede pasar
   es que diga "23 actualizadas" y en la hoja hayan cambiado otras tantas — es el modo de
   falla que el proyecto viene persiguiendo desde el Paso 2.11.
5. `git status` limpio salvo lo que agrega el paso.

## Qué NO hacer

- **No arrancar sin la confirmación de que `protegidas` bajó a 8.** Ver la precondición.
- No tocar la columna `origen` de ninguna fila.
- No editar la planilla a mano: todo por `SEED_SOLAPAS_`.
- No tocar `MAPEO`, aunque `H-4` (`docs/Prompts/Paso-2.11_ParteC2_diff_auditable.md`) diga
  que las cinco filas de `m2/Cuentas` quedan huérfanas cuando esa solapa pase a `ignorar`.
  **Eso es real y hay que anotarlo**, pero se resuelve aparte: mapear una solapa que se
  ignora es una inconsistencia distinta de clasificarla.
- No retirar `reclasificarSolapasM2Invertidas_` — es la Parte 3, y tiene su propio texto.
- Sin trailer `Co-Authored-By`.

## Modelo

Opus. Es edición de un seed contra una lista ya decidida; lo único con juicio es la
confirmación de `RDV CONJUNTO` y la apertura de la agrupación de `Instalar.gs:1020`.
