# `_30` · La demo — lámina 5 afuera, las reuniones del período, y `m2`

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> Última tanda de código antes de la demo. `_29` queda como está: su Parte 0 se ejecuta acá abajo
> y sus Partes A–C son para después.
>
> **Los huecos como `—` ya están hechos y no necesitan código.** `opciones.faltantes_como_raya`
> existe, el Panel lo expone como *"Los huecos se ven como «—»"* y `panel_generar` lo pasa. **Es
> tildar la casilla al generar.** El reporte y la hoja `FALTANTES` siguen listando todo igual.

---

## Parte 0 · Commitear lo que ya funciona

**Modelo: Haiku.**

Commitear el arreglo desplegado y verificado —la fila de `rdv` viajando con el ítem (`Union.gs`,
`Generador.gs`) más las dos filas de `MARCADORES`— con mensaje propio, solo. Es el punto de retorno.

---

## Parte A · Premisas — sólo lectura, termina en reportar y parar

**Modelo: Sonnet, effort alto.**

**A.1 · La lámina 5 se esconde desde la plantilla, y hay que confirmar que se hereda.**
El usuario marca la lámina 5 de la plantilla de `jm` con *Omitir diapositiva*. `esLaminaEscondida_`
es la única lectura de `isSkipped()` del repo y ya la respetan `tokensDeSlide_` y
`mapaTokenObjectId_`. **Lo que falta saber es si la copia hereda el estado.** Verificarlo sobre una
copia real —`DriveApp` / `makeCopy`, o el deck que ya existe— y reportar sí o no. **Si no se
hereda, no improvisar el arreglo: reportarlo y parar**, que la salida es una línea en la
generación y se decide con el dato a la vista.

**A.2 · `REUNIONES` y el período.** `R-21` deja escrito que `leerReuniones_` filtra por `eje` y
`mostrar` y **no por `periodo_id`** — *"es una omisión, no un diseño"*. Medir sobre la hoja:

- cuántas filas tiene `REUNIONES`, cuántas con `mostrar = sí`;
- **cuántas de ésas tienen `periodo_id` cargado y cuántas vacío**, y qué valores distintos aparecen;
- qué `periodo_id` corresponde a la ventana 24/07–30/07 según `PERIODOS`;
- cuáles serían los ítems si se filtrara por ese `periodo_id`, con su barrio y su fecha.

**A.3 · `m2`.** La lámina de `m2` en la plantilla de `jm`: qué tokens `m2_*` lleva, cuáles tienen
fila en `MARCADORES` y cuáles no. Para los que la tienen: `base_id · solapa · campo_logico ·
operacion · filtro · periodo_ref`. Recordar que `BASES.m2` tiene `hoja_default` vacío a propósito
—`m2` no tiene fuente activa para `m2_*`— así que cada marcador depende de su override de solapa:
reportar si los que existen lo traen.

**Reportar y parar.**

---

## Parte B · La lámina 5 y las reuniones del período

**Modelo: Opus, effort alto.** Cambia qué se publica.

**B.1 — la lámina 5.** Si A.1 dice que la copia hereda el estado, **no hay nada que hacer**:
confirmarlo en el reporte y seguir. Si dice que no se hereda, implementar el salteo **sobre la
copia, nunca sobre la plantilla** —la copia es salida del motor y `C-01` no la alcanza— y dejar
dicho en el reporte qué lámina se salteó y por qué.

**B.2 — el filtro de `REUNIONES`.** Lo que se pide es *"las reuniones que entran en la semana"*, y
**la forma correcta de eso es `periodo_id`, no un rango de fechas.** Un filtro por fecha dejaría a
San Cristóbal 23/07 afuera, y San Cristóbal es el caso testigo de `R-21` y **está en el deck que el
equipo publica** (`V-71`: 138 inscriptos, uno de los cuatro encuentros individuales). Filtrar por
fecha haría la demo *menos* parecida al deck real, no más.

**La puerta, y es dura:** esto se aplica **sólo si A.2 mostró que `periodo_id` está cargado en las
filas que tienen que emitir.** Si hay filas con `periodo_id` vacío, `R-21` ya dijo qué pasa —
*"caer sin período es `REVISAR`, no una semana adivinada"*—: **no se filtra, se reporta y se deja
como está.** Emitir cero encuentros la noche previa es peor que emitir cinco.

Si la puerta abre: `leerReuniones_` filtra además por `periodo_id`, y **las excluidas se reportan
con motivo**, como ya hace la rama `CAMPANAS` citando `D-19`.

---

## Parte C · `m2`

**Modelo: Opus, effort alto.** Publica números.

Cablear los `m2_*` que A.3 encontró sin fila, con la mejor fuente disponible y su override de
solapa explícito. Cada fila nueva lleva en `notas` **`SIN VALIDAR — demo 12/08`**.

**No se compara ningún número contra un deck.** `C-36` ya midió que los dos decks de la misma
semana publican `m2` distinto y que el orden es monótono creciente: son tres fotos, no tres
universos. No hay nada que empatar.

**Nada a medias:** si el bloque no entra entero, no se empieza, y lo que quede sin cablear publica
`—` y se lista en `FALTANTES`. Es la salida prevista, no un fracaso.

---

## Parte D · Correr y leer el deck

**Modelo: Sonnet.**

Generar `jm` 24/07–30/07 desde el Panel, **con la casilla de `—` tildada**. Leer del deck, no del
reporte:

- que la lámina 5 no esté;
- las láminas de encuentro emitidas, con su barrio, sus inscriptos y su población;
- la lámina de `m2`, token por token, distinguiendo valor de `—`.

Reportar las tres cosas y **el `corrida_id` y el `deck_id`**. Si algo sale peor que
`jm-20260811-182706`, volver al commit de la Parte 0 y decirlo. Ese deck es la red.
