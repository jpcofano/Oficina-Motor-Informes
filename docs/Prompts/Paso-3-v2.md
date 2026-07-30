# Paso 3 (v2) — `Marcadores.gs` con operaciones genéricas

> **Reemplaza a `docs/Prompts/Paso-3.md`.** Ese prompt pedía una función nombrada por
> marcador (`calcInscriptos`, `calcAlcance`, …). Con ~200 tokens eso son ~200 funciones,
> y cada informe nuevo volvería a requerir código — justo lo que el motor viene a evitar.
> El contrato del stub de `Marcadores.gs` ya decía otra cosa: **operaciones genéricas**
> (`SUMA, CONTEO, RATIO, ULTIMO, TEXTO`). Manda el contrato.
>
> Al implementar esto, **archivá `Paso-3.md`** en `Plan Inicial/_archivo/` para que no
> queden dos versiones vigentes.
>
> **Regla de oro:** toda la aritmética vive acá y en ningún otro lado.
>
> **Un commit por parte.**

---

## Parte A — Esquema de `MARCADORES` (ya hecho en DOC-2)

**Obsoleta.** El rename `calculo`→`operacion`, la columna `valor_fijo` y la columna
`solapa` ya los hizo `DOC-2_alineacion_prompts.md` Parte A, directamente en
`Instalar.gs` (migración idempotente `migrarCalculoAOperacion_`). Verificá que el
esquema vivo tenga `['marcador','familia','informe_id','base_id','solapa',
'campo_logico','periodo_ref','operacion','valor_fijo','formato','notas']` y seguí a la
Parte B — no hay commit propio para esta parte.

La tabla de operaciones sigue siendo el contrato:

| operacion | qué hace |
|---|---|
| `SUMA` | suma la columna en la ventana |
| `CONTEO` | cuenta filas (opcionalmente con filtro) |
| `ULTIMO` | último valor no vacío — para stocks y para bases `snapshot` como M2 |
| `RATIO` | división entre dos campos → ver `campo_logico` con `/` |
| `TEXTO` | valor literal cargado a mano (no sale de ninguna base) |
| `PCT` | `RATIO` × 100, formateado como porcentaje |

**`RATIO` y `PCT`** leen dos campos de la misma base, declarados en `campo_logico` como
`numerador/denominador` — p. ej. `aperturas/entregados` para un OR. Sin sintaxis nueva
ni columna extra.

**`TEXTO`** lee la columna **`valor_fijo`** (no `notas`: mezclar contenido con notas se
vuelve ilegible enseguida).

---

## Parte B — Las operaciones en `Marcadores.gs`

Implementá **una función por operación**, no por marcador:

```js
// Firma uniforme. `ctx` trae los datos ya leídos; estas funciones NO abren
// bases ni resuelven MAPEO — solo hacen la cuenta.
function opSUMA(ctx)   { ... }
function opCONTEO(ctx) { ... }
function opULTIMO(ctx) { ... }
function opRATIO(ctx)  { ... }
function opPCT(ctx)    { ... }
function opTEXTO(ctx)  { ... }
```

`ctx` = `{ marcador, base_id, campo_logico, ventana, filas, valor_fijo }`, donde `filas`
son los datos ya filtrados por `Fuentes.gs` (Paso 2).

Cada una devuelve `{ valor, traza }`, donde `traza` es texto legible:
`"SUMA de 'inscriptos' (col K) sobre 13 filas de RDV, 26/06–03/07"`. La trazabilidad no
es un extra: es lo que permite que el equipo confíe en el número sin abrir la base.

**Escape hatch.** Si un marcador necesita algo que ninguna operación cubre, se admite
una función propia: `operacion=FN:nombreDeLaFuncion`, y esa función vive también en
`Marcadores.gs` con la misma firma. **Es la excepción, no la regla** — si al terminar
JM hay más de un puñado de `FN:`, es señal de que falta una operación genérica y
conviene agregarla en vez de multiplicar funciones.

→ **Commit B:** `Paso 3 ✅ — operaciones genéricas en Marcadores.gs`

---

## Parte C — Despachador (fuera de `Marcadores.gs`)

En `Generador.gs`:

`resolverMarcadores(informe_id, periodoGlobal)`:

1. Lee las filas de `MARCADORES` del informe.
2. **Resuelve la ventana por token, en tres capas** (prioridad de mayor a menor):
   campaña (`CAMPANAS.desde/hasta`) → `periodo_ref` (`PERIODOS`) → período global (`CONFIG`).
3. **Resuelve `solapa`** (regla de `docs/TOKENS.md` §4 / DOC-2 Parte B) como paso previo
   a pedir los datos: si el marcador la trae cargada, se usa tal cual; si viene vacía y
   la base tiene una sola solapa en `MAPEO`, se infiere; si tiene varias, error
   `«FALTA:token@sin_solapa»`. La traza tiene que decir de qué solapa salió el número —
   `"SUMA de 'inscriptos' (col K)"` no alcanza cuando la base tiene seis hojas, hace
   falta `"SUMA de 'inscriptos' (col K) en solapa 'RVD JM-CM - ES'"`.
4. Pide los datos a `Fuentes.gs` respetando `modo_periodo` de la base
   (`snapshot` = se lee entera, sin filtrar). **Excepción — `base_id=digital`:** los
   datos **no** se piden a `leerFuente` directo. Se piden al proveedor del Paso 2.4,
   `filasDigitalDeEncuentro(idCuenta | encuentro)` — el `ctx.filas` plano de
   `leerFuente` no alcanza para las seis solapas ya unidas por cuenta.
5. Despacha a la operación por nombre (mapa explícito, no `eval`).
6. Aplica `formato` (numero / miles / porcentaje / fecha / texto).
7. Devuelve `{ marcador, valor, valor_formateado, estado, traza }` con
   `estado ∈ {ok, sin_datos, error}`.

**Resiliencia:** un token que falla no corta la corrida. Se marca `error` con motivo y
en el deck sale `«FALTA:token»` (Paso 4). Un informe con tres huecos visibles es útil;
una corrida que aborta, no.

**Caché:** dos marcadores de la misma base, solapa y ventana no deben releer la hoja.
Cacheá por `(base_id, solapa, desde, hasta)` dentro de la corrida — no `hoja`: es el
mismo dato cuando `hoja` cumple ese rol, pero conviene que el nombre sea uno solo en
todo el repo (`Config.gs`/`Fuentes.gs` ya usan `solapa`).

**Precedencia RDV→SD→Looker (`PROYECTO.md` §5):** es **criterio de cableado** — qué
`base_id` se escribe en cada fila de `MARCADORES` para los marcadores compartidos
(`camp_*`, `mail_*`, `ivr_*`, `cc_*`) —, **no** un motor de merge automático. Este
despachador no compara ni mergea entre bases: lee la fila de `MARCADORES` tal cual está
cableada. Si dos bases traen el mismo campo lógico para una campaña, la decisión de
cuál gana ya quedó tomada al elegir el `base_id` de esa fila, no en tiempo de corrida.

→ **Commit C:** `Paso 3 ✅ — despachador con ventana por token`

---

## Parte D — Corte vertical (la prueba)

**No cablees los 200 marcadores.** Elegí **una slide de JM** y completá `base_id`,
`campo_logico` y `operacion` de **sus tokens solamente** (5–10). Sugerencia: la slide 5
(ECV — alcance por herramienta), que usa una sola base (RDV) y mezcla `SUMA` con `PCT`,
así ejercita dos operaciones.

Ítem de menú **"Calcular marcadores de prueba"** → alert/log con una tabla:
marcador · valor · valor_formateado · estado · traza.

**El objetivo del paso es validar la cadena completa, no la cobertura.** Si el diseño
tiene un problema, aparece con 5 tokens igual que con 200 — y sale mucho más barato.

→ **Commit D:** `Paso 3 ✅ — corte vertical validado (slide 5 JM)`

---

## Antes de empezar — decisión ya tomada (no reabrir)

**Seguimiento Digital (SD) es la fuente primaria; Looker es su rollup.** Cerrado, no es
una pregunta al usuario. Evidencia: `PROYECTO.md` §5 (precedencia
**RDV → Seguimiento Digital → Looker**) y `docs/HALLAZGOS_validacion_decks.md` §4, que
verificó que Looker es el rollup exacto de Seguimiento Digital (no una fuente
independiente) — por eso SD pesa más: tiene el desagregado por envío que Looker no
puede reconstruir. El Paso 2.3 ya sembró `digital` completo sobre esa base (53 filas de
`MAPEO`, 6 solapas). Es la columna `base_id` de los marcadores `camp_*`, `mail_*`,
`ivr_*`, `cc_*` — cableá contra `digital` (vía el proveedor del Paso 2.4, ver Parte C),
no contra `looker`. `looker` sigue disponible para lo que solo Looker tiene (o para
verificación cruzada), pero no es la fuente por defecto.
