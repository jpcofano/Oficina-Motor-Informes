# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-21, al cerrar el `2026-08-21_11` (el generador lee `LAMINAS`)

---

## ⛔ Lo primero: generá y mirá el deck. El próximo sale distinto

**No es una advertencia formal: tres cosas cambian a la vista**, y las tres son consecuencias
declaradas, no regresiones.

| qué | antes | ahora |
|---|---|---|
| `jm` `campana` | 8 láminas modelo | **9** — entra `L-040`, la portada del bloque |
| `secco` `comunicaciones_post` | 1 | **2** — entra `L-009`, la portada |
| un encuentro `Uno a uno` | portada + iceberg | **portada + `L-053`** |

⭐ **Las dos primeras son una mejora:** son la portada de su bloque y llevan el nombre del ítem. Hoy
la portada de campaña sale **una vez para ocho campañas** — lo mismo que le pasaba al bloque de
encuentro antes del `_35`.

⚠ **Y la tercera trae ruido nuevo y correcto:** `L-053` tiene **32 tokens `u1_` sin cablear**, así
que **sale una vez por cada encuentro `Uno a uno`, con sus 32 huecos**. Hasta ayer esa lámina no
salía. **Es lo esperado**, no una regresión — es la inconsistencia 2, que sigue abierta.

---

## ⛔ Y desde ahora: una lámina sin `seccion_id` no se emite

La inferencia por familia de tokens **se retiró**. Una lámina nueva en una plantilla **no falla: se
reporta y sale en hueco**, que es peor de detectar.

**El ciclo está en `docs/RUNBOOK.md`** y son cinco pasos:

1. Se toca la plantilla — la toca el equipo o el usuario, **nunca el motor sin autorización**.
2. **`sellarPlantilla(informe_id)`** — la lámina toma su `L-NNN` y su fila.
3. **`verificarLaminas()`** — cierra el cruce ancla ↔ hoja. ⭐ **Cada vez que se toca una plantilla.**
4. **Declarar `seccion_id`** — y `rol`, y `filtro` si es condicional.
5. Recién ahí emite.

---

## Lo que hay en la hoja hoy

**`LAMINAS`: 53 filas, 53 anclas, ninguna sin ancla.** Las 53 con `seccion_id` y `rol`; **7 con
`filtro`**. `verificarLaminas()` cierra.

```
jm     encuentro   L-052 (portada, sin filtro) · L-035 (tipo!=Uno a uno) · L-053 (tipo=Uno a uno)
secco  encuentro   L-004 · L-005 (tipo=Uno a uno) · L-006 · L-007 (tipo=Encuentro Temático) · L-008 (tipo!=Uno a uno)
```

⚠ **`rol = motor` no significa «publica»:** **25 de las 40** `motor` tienen **cero** tokens
cableados. El rol dice quién **debe** llenarla.

**`MAPEO`:** `digital/CAMPAÑAS_DESGLOCE_DIGITAL` con **18 filas** — 10 con las claves y métricas
verificadas, 8 marcadas `REVISAR` en `notas`.

---

## ⏸ Lo único que falta para que el 1 a 1 publique

**Cablear los 32 `u1_`.** Las otras dos causas se cerraron: la lámina está sellada y **pertenece**.

**Lo que ya está resuelto y no hay que volver a preguntar:**

- **la fuente** — `digital/CAMPAÑAS_DESGLOCE_DIGITAL`, decidida desde el 14/08 (`D-32`) y **mapeada**;
- **las claves** — `Id cuentas` + `Plataforma`, con seis casos validados `exacto`;
- **qué suma cada total** — `R-28`. ⭐ **`u1_total_clics` es sólo el PRE y `u1_total_vistas` sólo el
  POST**: cablearlos como "SUMA sobre las tres plataformas" publicaría 1.879 contra 1.472.

**Los dos huecos declarados:** de dónde sale el alcance —son usuarios únicos y **no se suman**— y
los seis `u1_bench_*`, **sin prioridad** por decisión tuya.

---

## ⏸ Lo que espera de tu lado

| # | qué | por qué |
|---|---|---|
| 1 | ⭐ **Generar `jm`** | es lo único que verifica que el deck salga bien. El control dice **qué** láminas copia cada ítem; que se copien, se ordenen y se pinten necesita una corrida |
| 2 | **Aplicar configuración** | faltan entrar **8 filas `REVISAR`** del `MAPEO`. Las dos secciones nuevas ya entraron |
| 3 | **`verificarLaminas()`** | cada vez que toques una plantilla |

⚠ **`campana` de `secco` emitiría cero ítems** — sus tres filas de `CAMPANAS` fallan las dos
condiciones de `D-19` a la vez. Es dato, no motor, y está anotado.

---

## Las ocho suites, en verde

`laminas-declaradas` (24) · `tipo-en-item` (10) · `modo-faltantes` (24) · `lamina-por-id` (11) ·
`reloj-etapas` (17) · `continuacion-deck` (22) · `planificador` (18) · `resueltas` (14).

**Cinco traen la rotura a propósito automatizada**: sacan del fuente la línea que protegen y
verifican que la afirmación caiga.

⚠ **Y una lección del día que conviene tener a mano antes de escribir el próximo banco:**
`generarInforme` **atrapa las excepciones a propósito** y devuelve `ok: true` con el `fallo` adentro.
**El aserto de `fallo === null` cazó tres bancos incompletos en un solo día.** Un control que sólo
mire `ok` pasa sobre corridas que murieron en el medio.

---

## Lo que se decidió hoy y quedó escrito

- **`R-28`** (`REGLAS_NEGOCIO.md`) — los totales del 1 a 1 suman **una** etapa, con el contraejemplo
  adentro de la regla.
- **`D-37`** (`PLAN.md`) — la pertenencia se **declara**. ✅ Implementada. Con esto **`D-23` cierra
  su Fase 2 del lado del consumo**; la Fase 4 —retirar `familia_tokens`— sigue abierta.
- **`CONFIG_INFORMES.md` §1.10** (la condición del 1 a 1) y **§4.5 bis** (el puente
  `MAPEO.notas` → sufijo `_revisar`).
- **`CLAUDE.md` §4** — tres reglas nuevas hoy: el presupuesto fuera del bucle, la rama sin control,
  y **inferir la identidad por el contenido**.

---

## ⛔ Evidencia que no se puede perder

- **El deck de `171421`** (`1iPQcoQY11lVhxM-P16R-8iVp5xS1D6YrfDELuU3XRDw`) — el único testigo de qué
  publicaba el motor el 20/08. `FALTANTES` se pisa en cada corrida.
- **Los tres fixtures**, con su huella en `docs/_fixtures/README.md`. El del 20/08 trae **la base y
  el deck del mismo día**, que es lo que hizo verificable `R-28`.
- ⚠ **Dos `.pptx` de decks reales quedaron en el historial de git** (commit `7e48725`). Riesgo
  asumido por decisión tuya: no se reescribe historia. Ya no están rastreados.

---

## Cómo leer esto desde afuera

- **Qué se hizo y qué se midió** → `docs/BITACORA.md`, entradas del 2026-08-21.
- **Qué sigue abierto** → `docs/PENDIENTES_consistencia.md`, y las decisiones sin responder en
  «Preguntas al equipo».
- **Qué decía cada hoja** → `docs/_snapshots/*_2026-08-21*.tsv`, versionados por hora.
- **Qué se decidió y no se corrió** → `docs/Prompts/2026-08-21_12_banco_de_laminas.md`, anotado en
  el Backlog de `PLAN.md`.
