# Pedido — Parte D del `Paso-3-v3`: ampliarla en el lugar y correr su `D.0`

**Estado:** vivo · **Fecha:** 2026-08-03 · **Ubicación:** `docs/Prompts/Pedido_Paso-3-v3_ParteD.md`

> **La fuente de verdad de la Parte D sigue siendo `docs/Prompts/Paso-3-v3.md`.** El Paso 1
> de este pedido **reemplaza** ese texto en el lugar; después se ejecuta desde ahí. Al
> terminar, este archivo va a `docs/Prompts/_archivo/`.
>
> **Por qué se amplía antes de ejecutar.** La Parte D sugiere la slide 5 (`ECV — alcance por
> herramienta`) con el argumento de que "usa una sola base". La corrida de la Parte C mostró
> dos cosas que la contradicen: `rdv` tiene **dos** solapas `uso = fuente`, así que ahí no
> hay inferencia de solapa; y los `ecv_*` son tokens **por encuentro**, mientras que el
> despachador agrega sobre la ventana entera. Elegir esa slide sin corregir el criterio da un
> número plausible y equivocado, que es justo lo que un corte vertical existe para evitar.
>
> **Dos commits, y se para entre ellos.** Uno de documentación (Paso 1), uno de reporte
> (`D.0`). Nada de código en este pedido.

---

## Paso 1 — Reemplazar la Parte D de `Paso-3-v3.md`

En `docs/Prompts/Paso-3-v3.md`, reemplazar **todo** el bloque que va desde el encabezado
`## Parte D — Corte vertical (la prueba)` hasta la línea anterior a
`## Decisiones ya tomadas — no reabrir` por el texto que sigue, entre las marcas.

No tocar ninguna otra parte del archivo. Commit de documentación solo.

<!-- ═══════════ INICIO DEL TEXTO DE REEMPLAZO ═══════════ -->

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

<!-- ═══════════ FIN DEL TEXTO DE REEMPLAZO ═══════════ -->

---

## Paso 2 — Correr `D.0` y parar

Con el archivo ya actualizado, ejecutar **sólo** `D.0.1`–`D.0.5`. Sólo lectura: no escribir
hojas, no tocar `.gs`, no cargar filas de `MARCADORES`.

Reportar los cinco puntos con números contados por código, y **PARAR**.

---

## Qué NO hacer

- No cablear marcadores en este pedido.
- No borrar ni reescribir las tres filas de ejemplo de `MARCADORES`.
- No elegir la slide del corte por su nombre: elegirla por qué tokens se pueden calcular hoy.
- No crear un archivo aparte con la Parte D: se edita dentro de `Paso-3-v3.md`.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
