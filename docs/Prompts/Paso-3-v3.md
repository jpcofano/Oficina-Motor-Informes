# Paso 3 (v3) — `Marcadores.gs` con operaciones genéricas + la cadena de período completa

**Estado:** vivo · **Fecha:** 2026-08-03 · **Ubicación:** `docs/Prompts/Paso-3-v3.md`

> **Reemplaza a `Paso-3-v2.md`**, que a su vez reemplazó a `Paso-3.md`. Al implementar
> esto, archivá **los dos** en `docs/Prompts/_archivo/` para que no queden tres versiones.
>
> **Por qué se reescribió:** el `v2` resolvía la ventana **"en tres capas"**. `D-20` y su
> Addendum 1 la dejaron en **cinco eslabones**, y agregaron dos piezas que no existían
> cuando se escribió: la columna de período en `SECCIONES` y el cálculo del default de
> `R-11`. Además `D-19` fijó qué significa una fila sin `periodo_id`, y el `Paso-2.16`
> dejó el filtrado por valor resuelto en el lector — el despachador ya no tiene que
> pensarlo.
>
> **Regla de oro:** toda la aritmética vive en `Marcadores.gs` y en ningún otro lado.
>
> **Un commit por parte. Se para y se avisa al final de cada una.**

---

## Parte 0 — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

Este prompt se escribió desde afuera de la planilla. Todo lo que sigue es hipótesis.

**0.1 · El esquema vivo de `MARCADORES`.** El `v2` esperaba
`marcador · familia · informe_id · base_id · solapa · campo_logico · periodo_ref ·
operacion · valor_fijo · formato · notas`. Reportar el esquema real y la clave del upsert
— `DOC-2` la iba a pasar a `['marcador','informe_id']` y hay que confirmar que lo hizo.
Reportar también cuántas filas tiene hoy y si alguna está cableada.

**0.2 · `SECCIONES`.** Sus catorce columnas, y si ya ganó una de período. Confirmar que
sigue **fuera** de `COLUMNAS_DELTA_` y cuántas filas curadas hay en riesgo. Es el mismo
modo de falla que midió el `Paso-2.15` `0.2`: agregarle una columna sin meterla al delta
antes reescribe la fila 1 sobre los datos.

**0.3 · `resolverVentana()`.** Qué resuelve hoy, en qué orden, y qué hace cuando no
encuentra nada. Reportar el código, no el comentario.

**0.4 · Lo que el `2.16` dejó hecho.** El lector ya aplica `MAPEO.valores_incluidos`. El
despachador **no** vuelve a filtrar por valor: pide los datos y confía. Confirmar que es
así y que el filtro se aplica antes de que `ctx.filas` llegue a una operación.

**0.5 · El proveedor de `digital`.** ¿Existe `filasDigitalDeEncuentro` o como se llame
hoy? El `v2` lo daba por hecho como salida del Paso 2.4. Si no existe, **este prompt
tiene un agujero** y hay que decirlo antes de empezar.

**0.6 · `TOKENS.md` §5** tiene una nota que dice que sus tres capas quedaron viejas.
Reportar qué dice la tabla hoy: la reescribe la Parte C.

**0.7 · Normalizadores.** Cuál es el canónico para comparar valores, según lo que se
escribió en la cola de documentación del 02/08. No agregar uno nuevo.

**Reportar 0.1–0.7 y PARAR.**

---

## Parte A — Las operaciones en `Marcadores.gs`

> **Ejecutada el 03/08/2026, y no hizo lo que este texto supone. Corregido en el lugar para
> que el prompt no mienta sobre lo que pasó.**
>
> **Las seis operaciones ya existían.** `opSUMA`, `opCONTEO`, `opULTIMO`, `opRATIO`, `opPCT`
> y `opTEXTO` estaban en `Marcadores.gs` desde el corte vertical del `Paso-2.9E`. La Parte 0
> no lo detectó porque **no preguntó por ellas**: sus siete puntos miran `MARCADORES`,
> `SECCIONES`, `resolverVentana()`, el filtro del `2.16`, el proveedor de `digital`,
> `TOKENS.md` §5 y los normalizadores — ninguno mira si las operaciones existen. Es un hueco
> del prompt, no un descuido de la ejecución.
>
> **Lo que la Parte A sí fue: alineación y despacho.** (1) Alinear las seis al contrato de
> `ctx` de más abajo, aceptando `ctx.filas` + `ctx.encabezado` además del `ctx.valores` que
> ya usaba el corte vertical; (2) meter la ventana en la traza; (3) escribir
> `despacharOperacion_` con **mapa explícito**, que es lo único que no existía. **Medición de
> `D-01`: +242 / −23 líneas**, y el renglón de "por qué hubo que tocar código" es el
> despacho.
>
> **Lo que sigue valiendo de este texto:** la tabla de operaciones, la firma uniforme, el
> contrato de `ctx`, la exigencia sobre la traza y el escape hatch. Nada de eso cambió — lo
> único que cambió es de dónde se partía.

Una función **por operación**, no por marcador. Con ~200 tokens, una función por marcador
son ~200 funciones y cada informe nuevo volvería a pedir código.

| operacion | qué hace |
|---|---|
| `SUMA` | suma la columna en la ventana |
| `CONTEO` | cuenta filas |
| `ULTIMO` | último valor no vacío — para stocks y bases `snapshot` |
| `RATIO` | división entre dos campos, declarados en `campo_logico` como `numerador/denominador` |
| `PCT` | `RATIO` ×100, formateado como porcentaje |
| `TEXTO` | valor literal, leído de la columna `valor_fijo` — no de `notas` |

```js
// Firma uniforme. `ctx` trae los datos YA leídos y YA filtrados.
// Estas funciones no abren bases, no resuelven MAPEO, no filtran por valor.
function opSUMA(ctx) { ... }
```

`ctx = { marcador, base_id, solapa, campo_logico, ventana, filas, valor_fijo }`.

Cada una devuelve `{ valor, traza }`. **La traza no es un extra:** es lo que permite que
el equipo confíe en el número sin abrir la base. Tiene que decir operación, campo,
columna, solapa, cantidad de filas y ventana:

```
SUMA de 'inscriptos' (col K) en solapa 'RVD JM-CM - ES', 13 filas, 26/06–02/07
```

**Escape hatch:** `operacion = FN:nombreDeLaFuncion`, viviendo también en `Marcadores.gs`
con la misma firma. Es la excepción. Si al terminar JM hay más de un puñado de `FN:`,
falta una operación genérica y conviene agregarla en vez de multiplicar funciones.

---

## Parte B — La cadena de período. **Es la parte que cambió.**

`D-20` Addendum 1 fija cinco eslabones, de más específico a más general:

```
campaña > marcador (periodo_ref) > SECCIONES.periodo_ref > CONFIG > semana R-11
   ya      ya                       falta la columna       ya      falta el cálculo
```

Las tres piezas van juntas porque las tres tocan `resolverVentana()`.

**B.1 · La columna en `SECCIONES`.** Primero `SECCIONES` entra a `COLUMNAS_DELTA_`,
**después** se agrega `periodo_ref`. En ese orden: al revés, la corrida intermedia cae en
la rama sin delta y reescribe la fila 1 sobre datos que no se movieron. Es exactamente lo
que midió el `Paso-2.15`.

**B.2 · El eslabón nuevo.** La sección se consulta entre el `periodo_ref` del marcador y
`CONFIG`. Un marcador con `periodo_ref` propio **le gana** a su sección: el criterio es de
más específico a más general y eso ya está cerrado en el addendum — no se decide acá.

**B.3 · El cálculo del default de `R-11`.** Último eslabón: lo que responde
`resolverVentana()` cuando no encontró nada cargado. **Siete días, viernes a jueves,
extremo inclusivo** (`vie 24/07 – jue 30/07`). Se calcula respecto de la fecha de corrida.

**B.4 · Los tres vacíos, que significan cosas distintas.** No unificarlos:

- `SECCIONES.periodo_ref` vacío → **usa el eslabón siguiente** (`D-20`).
- `CAMPANAS.periodo_id` / `REUNIONES.periodo_id` vacío → **la fila no entra a ningún
  informe** (`D-19`). No se asume el período vigente.
- `MAPEO.valores_incluidos` vacío → **sin filtro** (`Paso-2.16`).

**B.5 · Actualizar `TOKENS.md` §5.** Su tabla declara las tres capas viejas y hoy sólo
tiene una nota que avisa. Reescribirla con los cinco eslabones.

---

## Parte C — Despachador, en `Generador.gs`

`resolverMarcadores(informe_id, periodoGlobal)`:

1. Lee las filas de `MARCADORES` del informe.
2. **Resuelve la ventana** con la cadena de la Parte B.
3. **Resuelve `solapa`** (`TOKENS.md` §4): si el marcador la trae, se usa; si viene vacía
   y la base tiene una sola solapa en `MAPEO`, se infiere; si tiene varias, error
   `«FALTA:token@sin_solapa»`. La traza tiene que decir de qué solapa salió el número.
4. Pide los datos a `Fuentes.gs` respetando `modo_periodo` de la base (`snapshot` = se lee
   entera). **Excepción `base_id = digital`:** no se pide a `leerFuente` directo sino al
   proveedor del Paso 2.4 — el `ctx.filas` plano no alcanza para las seis solapas ya
   unidas por cuenta. Si `0.5` mostró que ese proveedor no existe, **parar**.
5. Despacha a la operación por nombre. **Mapa explícito, nunca `eval`.**
6. Aplica `formato` (numero / miles / porcentaje / fecha / texto).
7. Devuelve `{ marcador, valor, valor_formateado, estado, traza }` con
   `estado ∈ {ok, sin_datos, error}`.

**Resiliencia:** un token que falla no corta la corrida. Se marca `error` con motivo y en
el deck sale `«FALTA:token»`. Un informe con tres huecos visibles es útil; una corrida que
aborta, no.

**Caché:** dos marcadores de la misma base, solapa y ventana no releen la hoja. Cachear
por `(base_id, solapa, desde, hasta)`.

**Precedencia RDV → SD → Looker** (`PROYECTO.md` §5) es **criterio de cableado** — qué
`base_id` se escribe en cada fila de `MARCADORES` —, **no** un motor de merge. El
despachador no compara ni mergea: lee la fila tal cual está cableada.

---

## Parte D — Corte vertical (la prueba)

> **Ampliada el 03/08/2026, antes de ejecutarse**, con lo que midió la corrida de la Parte C.
> La sugerencia de slide cambió; el objetivo del paso no.

**No cablear los 200 marcadores.** Cablear **5 a 10 tokens** y ver si sale un número
correcto. Si el diseño tiene un problema, aparece con 5 tokens igual que con 200 y sale
mucho más barato.

### `D.0` — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**D.0.1 · Las tres filas de ejemplo de `MARCADORES`.** La corrida de la Parte C las midió
inválidas bajo el `v3`: usan el estilo una-función-por-marcador (`camp_alcance` →
`calcAlcance`, que no existe). Reportar las tres, tal cual están, y qué le falta a cada una
para ser válida. **No borrarlas ni reescribirlas:** `MARCADORES` no tiene sembrador, esas
filas las cargó una persona, y decidir si se corrigen o se van es curaduría del usuario.

**D.0.2 · Qué tokens se pueden cablear hoy, de verdad.** El despachador agrega **sobre la
ventana**, y todavía no recibe el contexto del ítem que se emite — eso es del Paso 5. Quedan
fuera del corte, por razones distintas y verificadas en la Parte C:

- `digital` — necesita `id_cuenta`; sale `«FALTA:@digital_sin_cuenta»`;
- `m2` — cero solapas `uso = fuente`;
- cualquier token **por encuentro** o **por campaña** (`ecv_*`, `camp_*` por ítem) — la
  ventana los sumaría todos juntos, y el número saldría plausible y mal.

Reportar los candidatos que sí quedan, con `base_id`, solapa, `campo_logico` y operación:
`rdv` con solapa **explícita** (tiene dos fuente, no hay inferencia) y
`looker/resumen_metricas_dinamico` (única fuente de su base — sirve para **ejercitar la
inferencia de solapa**, que hoy no la probó ningún caso exitoso). Buscar al menos un `SUMA`,
un `CONTEO` y un `RATIO`/`PCT`: el `RATIO` es el único que obliga al despachador a partir
`campo_logico` por `/` y hacer dos `buscarMapeo`, y eso no se ejercitó todavía.

**D.0.3 · `encabezadoEnColumna_` sobre las solapas candidatas.** Traduce letra de `MAPEO` a
nombre de columna, y de ese nombre depende que `valoresDeCtx_` encuentre el dato.
`R-10` —colapsar espacios en encabezados— sigue **sin implementar**. Reportar si alguno de
los encabezados candidatos tiene espacios dobles, saltos de línea o bordes con espacio.

**D.0.4 · La ventana con la que va a correr el corte.** Reportar qué devuelve
`resolverVentana({})` hoy, con su `origen`, y cuántas filas de `rdv/RVD JM-CM - ES` caen
dentro. Si el origen sale `R-11 (calculado)`, decirlo: significa que `CONFIG` está vacío o
ilegible, y el número del corte va a moverse solo con la fecha de corrida.

**D.0.5 · El ítem de menú.** Dónde se agrega, y que no colisione con
"Calcular corte vertical (Paso 2.9E)", que sigue vivo y hace otra cosa: ese lee **una fila
de `rdv` cableada a mano**; este recorre `MARCADORES`. Los dos nombres tienen que dejar
claro cuál es cuál.

**Reportar `D.0.1`–`D.0.5` y PARAR.** `D.0.1` y `D.0.2` terminan en una decisión del
usuario: qué filas se curan y qué tokens se cablean.

### `D.1` — El cableado

Cargar `base_id`, `solapa`, `campo_logico`, `operacion` y `formato` de los tokens elegidos.
Nada más: el resto de `MARCADORES` no se toca.

### `D.2` — El ítem de menú

**"Calcular marcadores de prueba"** → tabla con `marcador · valor · valor_formateado ·
estado · traza`. La traza tiene que decir de qué solapa salió el número y de qué eslabón
salió la ventana, sin abrir la base.

### `D.3` — La prueba de la cadena de período

Es lo que este paso agrega y hay que ejercitar. Los cuatro casos:

- un marcador sin `periodo_ref` en una sección **con** período → toma el de la sección;
- el mismo marcador **con** `periodo_ref` propio → gana el suyo;
- ninguno de los dos, con `CONFIG` cargado → toma `CONFIG`;
- ninguno de los dos, `CONFIG` vacío → **calcula la semana de `R-11`**, siete días, viernes
  a jueves. Reportar las dos fechas.

El primer caso necesita que el vínculo marcador↔sección esté resuelto y que alguna sección
tenga `periodo_ref` cargado — hoy están las 35 vacías. Si sigue así al llegar acá, se
reporta como no ejercitado, no se inventa una sección para la prueba.

### `D.4` — El control

Un número que salga del despachador y se pueda contrastar contra algo ya conocido vale más
que cinco que no. Buscar al menos uno: un total que ya esté verificado en
`docs/VALIDACION_2026-07-31.md`, o dos tokens que tengan que cerrar entre sí. Si no hay
ninguno disponible, decirlo — un corte vertical sin control es una corrida, no una prueba.

**El objetivo del paso es validar la cadena completa, no la cobertura.**

---

## Decisiones ya tomadas — no reabrir

**Seguimiento Digital es la fuente primaria; Looker es su rollup.** `PROYECTO.md` §5 y
`HALLAZGOS_validacion_decks.md` §4 verificaron que Looker es el rollup exacto de SD, no
una fuente independiente. SD tiene el desagregado por envío que Looker no puede
reconstruir. Cablear `camp_*`, `mail_*`, `ivr_*`, `cc_*` contra `digital`, no contra
`looker`.

**Marcador le gana a sección, y campaña le gana a todo.** `D-20` Addendum 1. El Paso 3 lo
implementa, no lo decide.

**`D-01` es un deseable, no un requisito.** Si algo de este paso exige tocar `.gs`, se
anota la medición y se sigue. No bloquea ni obliga a rediseñar.

---

## Qué NO hacer

- No poner aritmética fuera de `Marcadores.gs`.
- No volver a filtrar por valor en el despachador: lo hace el lector desde el `2.16`.
- No agregar un normalizador nuevo.
- No tocar `SECCIONES` antes de meterla a `COLUMNAS_DELTA_`.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.

---

## Nota al pie — 03/08/2026, corrección de alcance

**No altera ninguna línea del texto de arriba.** Corrige una nota que Code escribió en
`docs/PLAN.md` §2 el mismo día, no este prompt.

Al reemplazar al `v2`, Code anotó en `PLAN.md` §2 que el `v3` **no cubre cuatro cosas** que
esa lista le asignaba al Paso 3: `R-12`, los dos valores de ventana de candidatos a
`CONFIG`, el empate técnico del match y la migración de `status = Realizada` a
`MAPEO.valores_incluidos`. **El hecho es cierto —el `v3` no las cubre— pero la inferencia
de que le faltan al Paso 3 es falsa.** Decisión del usuario, 03/08/2026:

- **`R-12`, los dos valores de ventana a `CONFIG` y el empate técnico del match son del
  matcher (`Union.gs`)**, que no comparte código con el despachador de marcadores. Van en
  un **paso propio, todavía sin escribir**. No son un hueco de este prompt.
- **`D-21` —migrar `status = Realizada` a `MAPEO.valores_incluidos`— es configuración y va
  suelto**, no dentro de un paso de código.

La línea de `PLAN.md` §2 **queda**, corregida con ese destino: sin ella los cuatro se
pierden de vista, que es por lo que se escribió. Lo que cambia es a quién se le reclaman.
