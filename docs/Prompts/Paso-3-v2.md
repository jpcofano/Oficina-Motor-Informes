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

## Parte A — Columna `operacion` en `MARCADORES`

El esquema actual tiene `calculo` (nombre de función). Renombrala a **`operacion`** e
insertala idempotentemente (mismo mecanismo que `asegurarColumna_`). Valores:

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

**`TEXTO`** toma el valor de la columna `notas`… **no**: agregá una columna
**`valor_fijo`** al final de `MARCADORES`. Mezclar contenido con notas se vuelve
ilegible enseguida.

→ **Commit A:** `Paso 3 ✅ — MARCADORES: columna operacion + valor_fijo`

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
3. Pide los datos a `Fuentes.gs` respetando `modo_periodo` de la base
   (`snapshot` = se lee entera, sin filtrar).
4. Despacha a la operación por nombre (mapa explícito, no `eval`).
5. Aplica `formato` (numero / miles / porcentaje / fecha / texto).
6. Devuelve `{ marcador, valor, valor_formateado, estado, traza }` con
   `estado ∈ {ok, sin_datos, error}`.

**Resiliencia:** un token que falla no corta la corrida. Se marca `error` con motivo y
en el deck sale `«FALTA:token»` (Paso 4). Un informe con tres huecos visibles es útil;
una corrida que aborta, no.

**Caché:** dos marcadores de la misma base y la misma ventana no deben releer la hoja.
Cacheá por `(base_id, hoja, desde, hasta)` dentro de la corrida.

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

## Antes de empezar — decisión del usuario

**Looker vs. Seguimiento Digital como fuente digital/directa.** Acá es donde se define:
es la columna `base_id` de los marcadores `camp_*`, `mail_*`, `ivr_*`, `cc_*`.
**Preguntale al usuario y no decidas vos.** Es reversible (cambiar filas, no código).

Argumento a favor de Looker: viene consolidado por campaña en una sola hoja, que calza
con "una fila por campaña → `camp_*`". Seguimiento Digital da más detalle por canal,
pero son 5 hojas y más joins. Las columnas de ambas están en `docs/MAPEO_completo.md`.
