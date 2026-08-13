# `_49` · El panel para mostrar: los decks que ya existen, el temario, la vista previa

> **Reemplaza al `_49` entregado antes, que no se ejecutó.** El temario deja de ser un cuadro sin
> salida y la vista previa deja de ser condicional.
>
> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Antes de tocar nada: commitear lo que esté pusheado a Apps Script y no al repo.** Commit de
> código y commit de documentación, separados.
>
> **Este prompt tiene una ventana de tiempo y las partes están ordenadas por sacrificio.** Si el
> reloj aprieta se cae **desde el final**: primero la `H`, después la `F`. **La `I` no se
> sacrifica** — un cambio sin documentar no está hecho.

---

## De qué se trata

Dos cosas distintas, y conviene no mezclarlas.

**La primera es una función que falta.** `D-28` ya lo dejó escrito: *para una presentación, el deck
se genera antes y se muestra generado.* El panel no tiene esa pantalla. La solapa **Corridas** es
donde debería estar: `panel_ultimasCorridas` **ya devuelve `deck_id` y `periodo_id`**, y
`vistaCorridas` **no usa ninguno de los dos**. El dato ya viaja al navegador y se descarta al
pintar.

**La segunda es de qué habla el panel.** Hoy, apenas se abre, la pantalla dice que un informe no
tiene datos configurados, que un deck va a salir con huecos, que una función no tiene backend y que
otra necesita un camino declarado en un archivo del repo. Todo eso es cierto y **nada de eso es
para la persona que va a usar el panel**: es estado interno del proyecto puesto en la interfaz. El
`_48` Parte C ya había empezado a sacarlo; quedó a mitad de camino.

**Una restricción que vale para todo el prompt, y no se negocia por tiempo:** ninguna pantalla nueva
muestra **una cifra que el motor no haya calculado**. Un valor de muestra en una tabla de marcadores
es indistinguible de un dato para quien mira, y este proyecto entero está construido alrededor de
que un número plausible y mal es peor que un hueco visible. Estructura real y valores vacíos, sí;
cifras inventadas, no.

---

## Parte A · Sólo lectura

**Modelo: Sonnet. Effort: alto.** No decide nada; lee y mide con cuidado.

Las premisas de abajo salieron de leer el repo desde afuera. Son de filas, de tiempos y de render, y
ninguna de las tres cosas se verifica leyendo código.

1. **`CORRIDAS`, el universo entero, no las últimas.** Total de filas, cuántas cerradas, y el conteo
   por `periodo_id` y por `informe_id`. El `_48` midió 51 filas — 37 `config`, 7 `julio_24_30`,
   7 `junio_sem2`, 8 sin cerrar. **Decir si sigue siendo cierto, con los números de hoy.**
2. **Los dos decks que `HANDOFF_CODE.md` declara vigentes** —`jm-20260813-070639` (`julio_24_30`) y
   `jm-20260813-072331` (`junio_sem2`)—: ¿siguen en `CORRIDAS`, cerradas, con `deck_id`? ¿Los dos
   archivos de Slides se siguen abriendo?
3. **La pregunta que decide la Parte H:** ¿entran esos dos en las **diez** últimas filas de
   `CORRIDAS`? `Panel.html` pide `panel_ultimasCorridas(10)` con el número escrito en el cliente. Si
   ya quedaron afuera, la vía rápida dejó de ofrecerlos **en silencio**.
4. **`PERIODOS`, las filas de hoy.** `SEED_PERIODOS_` declara seis; el snapshot más reciente de
   `docs/_snapshots/` tiene **dos**. Cuál de las dos cosas es cierta hoy.
5. **El selector de secciones, que es la premisa de la Parte F.** El `_48` Parte D midió que
   `panel_getEstado()` devuelve **las mismas tres** secciones repetibles para `jm` y para `secco`, y
   dejó anotado que si la diferencia sigue apareciendo *"la causa está en otro lado"*. Buscarla en el
   render: seguir `resetSecciones` y el bloque que pinta las casillas, y **decir con qué condición
   concreta el bloque no se dibuja**. Si el estado devuelve tres para los dos, hay una rama del
   cliente que las está comiendo.
6. **La medición que elige el escalón de la Parte G: cuánto tarda
   `resolverMarcadores(informeId, {ventana})` sola**, sin copiar plantilla, sin expandir secciones y
   sin escribir nada. Para `jm` sobre `julio_24_30`. El comentario de `diagMarcadoresDeCuenta_` deja
   anotado **170 s la primera cuenta** por el caché de módulo de `Fuentes.gs`: **el riesgo es de
   tiempo, no de diseño**. Reportar el número y cuántas filas devuelve.

**Reportar y parar.**

---

## Parte B · La solapa Corridas deja de tirar los dos campos que recibe

**Modelo: Sonnet. Effort: alto.** Cliente puro: `Panel.html`, `vistaCorridas`.

Cada corrida **cerrada y con `deck_id`** se pinta como el deck que es, con `deckCard` —la función ya
está en el archivo, no armar la URL de Slides en otro lado—:

- el **nombre del informe** (ya lo resuelve contra `S.informes`),
- el **`periodo_id` tal como está en la fila**, sin traducirlo. Vale la advertencia que el `_48` dejó
  escrita en `panel_ultimasCorridas`: esa columna tiene **dos vocabularios**, un id de `PERIODOS` o
  la etiqueta de origen de la cadena de `D-20`. Se muestra lo que dice. **No se deriva el período de
  la fecha de generación ni de nada más** — eso es inventar a qué período pertenece una corrida
  vieja, y es el error que la Parte B del `_48` sacó del código.
- la **fecha y hora**, que es lo único que distingue dos decks del mismo informe y período.

**Un filtro por informe arriba de la lista**, con `Todos` por defecto, armado desde `S.informes` —no
desde los `informe_id` que aparezcan en las corridas—: un informe sin ninguna corrida tiene que poder
elegirse y mostrar la lista vacía. Vive en `S` como el resto del estado; **sin `localStorage` ni
`sessionStorage`**, igual que todo el archivo.

**El total.** `panel_ultimasCorridas` devuelve `total` y el cliente lo ignora. Que la solapa diga
cuántas está mostrando de cuántas hay.

Las corridas **sin cerrar** y el conteo de faltantes: ver la Parte C.

---

## Parte C · El panel deja de hablar de lo que le falta al proyecto

**Modelo: Opus. Effort: alto.** Decide una frontera —qué información se saca de la pantalla— y una
frontera mal puesta le esconde a una persona algo que necesitaba.

**La frontera, y es lo primero que hay que fijar:** se saca lo que se ve **sin haber generado nada**,
o sea lo que aparece con sólo abrir el panel. **No se toca nada del resultado de una corrida**
(`vistaListo`) ni del fallo (`vistaFallo`): ahí los conteos y los avisos son el Paso 5 del proceso
semanal, son para el operador, y sacarlos sería esconderle a quien trabaja lo que necesita ver.
Además, según `D-28`, esa pantalla no aparece en una presentación.

Concretamente, lo que sale de la pantalla:

- El aviso de que un informe **no tiene datos configurados y el deck va a salir con huecos**. Lo
  reemplaza la Parte E.
- El **`N sin dato`** de cada fila de la solapa Corridas.
- La solapa **Próximo**, que hoy dice *"Diseñado, sin backend"* y *"Necesita su propio camino
  declarado en ESCRITORES.md"*. Los ítems se quedan; **los descriptores internos se van**. Un ítem de
  una lista de próximos ya dice, por estar en esa lista, que todavía no está. Los que este prompt
  construye —temario y vista previa— salen de esa lista.
- La solapa **Anclajes**, que hoy dice *"todavía no funciona desde acá"*. Se resuelve como la Parte E
  resuelve `secco`.
- La corrida **sin cerrar** de la solapa Corridas, que hoy dice *"no cerró — sin fecha de
  generación"*. Una corrida sin deck no se muestra en la lista.

Lo que **se queda**, y es deliberado: los errores reales de operación. La alerta de que no se pudo
leer el estado, la de que no se resolvió el período por defecto, la fila de `PERIODOS` con la fecha
ilegible. **No son huecos del proyecto: son cosas que están pasando ahora y que alguien tiene que
arreglar.** Taparlas es distinto de no hablar en interno.

**Ninguna de estas ediciones toca el motor.** El deck sigue imprimiendo lo que imprime, y la casilla
*"los huecos se ven como «—»"* sigue donde está y con el valor por defecto que tiene.

---

## Parte D · Pegar el temario, y ver qué se entendió

**Modelo: Sonnet. Effort: alto.** Función nueva de backend, **de sólo lectura**.

Una solapa **Temario**: cuadro de texto grande, selector de período, selector de informe, botón. Al
apretarlo, la pantalla muestra **una fila por línea con lo que el parser entendió** — eje, tipo,
nombre, fecha, etapa, notas — y las que no se pudieron interpretar, marcadas.

**No hay mock y no hace falta ninguno.** `parsearLineaReunion_` en `Reuniones.gs` es una función
**pura**: recibe una línea y devuelve la propuesta, sin tocar la hoja. La escritura vive aparte, en
`cargarTemarioReuniones_`. O sea que el parseo real ya es invocable sin escribir nada.

**`panel_previsualizarTemario(texto)`** — parte el texto en líneas no vacías igual que
`cargarTemarioReuniones_` y llama a `parsearLineaReunion_` por línea. Devuelve las propuestas planas
y cuántas quedaron sin parsear. Nada más: `PanelBackend.gs` orquesta y no reimplementa.

- **No se parsea en JavaScript del lado del cliente.** El parser vive en `Reuniones.gs` y tiene que
  seguir viviendo en un solo lugar; una segunda copia en el cliente se separa de la primera y las
  dos empiezan a dar cosas distintas.
- **No escribe.** `REUNIONES` es hoja de registro y hoy tiene **dos puertas declaradas en
  `ESCRITORES.md`** —el ítem de menú y la llamada por API—. Una tercera se declara ahí antes de
  existir, no después: este prompt no la abre. El botón previsualiza; **cargar de verdad sigue
  siendo el ítem del menú.**
- El período elegido **no se valida** acá: la validación contra `PERIODOS` la hace `cargarTemario`
  antes de escribir (`D-19`), y previsualizar no escribe. Se muestra el período elegido y ya.
- Que la pantalla **diga que previsualiza**, en una línea corta y sin hablar en interno. Alguien que
  pegue el temario, vea las filas y se vaya creyendo que quedaron cargadas es el peor resultado
  posible de esta pantalla.

---

## Parte E · `secco` se queda, y las pantallas sin backend dicen lo mismo que él

**Modelo: Sonnet. Effort: alto.** Cliente puro.

`secco` **sigue en el selector de informes** —está activo en `INFORMES` y es real—, y en lugar del
aviso de huecos lleva la marca **`en desarrollo`**: el `chip` que el encabezado del panel ya usa,
mismo estilo, sin texto explicativo al lado.

La condición para pintarlo **no se cablea a `secco`**: se pinta según lo que el estado ya devuelve
para cada informe. Un `informe_id` escrito a mano en el cliente es exactamente lo que `D-01` mide y
lo que este proyecto viene sacando del código.

La misma marca la lleva la solapa **Anclajes**: una sola forma de decir *esto está por venir*, en vez
de frases distintas explicando qué le falta a cada una.

---

## Parte F · El selector de secciones aparece en los dos informes

**Modelo: Sonnet. Effort: alto.** **Sólo si la Parte A.5 encontró la rama.**

El backend devuelve las mismas tres secciones repetibles para `jm` y para `secco` — eso ya está
medido y no se vuelve a medir. Lo que falta es que el cliente las pinte para los dos.

Arreglar la rama que A.5 haya encontrado. **Si A.5 no encontró ninguna diferencia en el render**,
esta parte no se hace: significa que el selector ya aparece en los dos y el reporte del usuario tenía
otra causa. **Decirlo así y no tocar nada** — es el mismo cierre que la Parte D del `_48`, y un *"no
se reproduce"* cierra una pregunta igual de bien que un arreglo.

---

## Parte G · Vista previa

**Modelo: Opus. Effort: alto.** Define un contrato de backend y elige entre dos escalones.

`docs/PROCESO_SEMANAL.md` la pone **primera de las cuatro pantallas** y da el motivo: es la única que
**no escribe nada y ya tiene de dónde leer**. **La pantalla se construye igual**; lo que la Parte A.6
decide es con qué se llena.

**`panel_getPreview(informeId, periodoId)`** — el nombre ya está declarado en `PROCESO_SEMANAL.md` y
en el encabezado de `PanelBackend.gs`; **se usa ése y no se inventa uno nuevo.**

**Escalón 1 — con valores, si A.6 dio un tiempo que entra en una pantalla.**
Envuelve `resolverMarcadores(informeId, { ventana })`, con la ventana resuelta igual que en
`panel_generar`: `periodoId` vacío = sin override, la cadena de `D-20` resuelve sola. Devuelve por
marcador **nombre, valor formateado, estado y de qué base salió**. **Sólo los marcadores fijos** — no
expande secciones repetibles, que es la parte cara de la corrida. **No abre plantilla, no copia, no
escribe ninguna hoja, no registra corrida**; si algo de eso resulta inevitable, **parar y reportar**:
significaría que `resolverMarcadores` no es tan de sólo lectura como parece, y eso es un hallazgo.

**Escalón 2 — sólo estructura, si el tiempo no entra.**
La misma tabla, llenada leyendo `MARCADORES` —que es una hoja de registro y se lee en un segundo—:
marcador, base, operación, lámina. **La columna de valor va vacía**, con un rótulo que diga que se
calcula al generar.

**Lo que no se hace en ninguno de los dos escalones: poner cifras de muestra.** Una tabla de
marcadores con números verosímiles al lado es indistinguible de una corrida real para cualquiera que
la mire, incluido quien la muestra. Estructura real con valores vacíos es un mock honesto; estructura
real con valores inventados es una medición falsa con formato de producto.

En el cliente, una solapa **Vista previa** con los dos selectores y la tabla. Si sale por el escalón
1, **reusar el temporizador que ya existe**: `google.script.run` no reporta avance.

⚠ **El escalón 1 muestra `sin_datos` y `REVISAR` por marcador, o sea que muestra en detalle lo que la
Parte C saca de la pantalla.** Las dos cosas pueden convivir —una es la herramienta del operador, la
otra es lo que se ve sin generar— pero **no se resuelve solo**: si al llegar acá la contradicción
molesta, parar y preguntar.

Al agregarla, corregir el encabezado de `PanelBackend.gs`, que declara que `panel_getPreview` **no
existe**, y la `FLAGS` que corresponda.

---

## Parte H · Sólo si la Parte A.3 dio que los dos decks quedaron afuera de las diez

**Modelo: Sonnet. Effort: alto.**

Subir el número que `Panel.html` le pasa a `panel_ultimasCorridas`, y **decir en el reporte de qué a
qué**. Es cliente: el backend ya acepta el parámetro. Con el universo de A.1 sobre la mesa, subirlo
sin criterio traería filas viejas de las que ni el período es determinable.

---

## Parte I · Documentación

**Modelo: Sonnet. Effort: normal.** No se sacrifica.

1. **`docs/BITACORA.md`** — append. Los seis puntos de la Parte A, qué partes se hicieron, por qué
   escalón salió la Parte G, y qué se cayó por tiempo o por medición.
2. **`docs/HANDOFF_CODE.md`** — reescribir la parte que toque. Si la Parte A encontró que los dos
   decks vigentes ya no son los que la tabla declara, **la tabla se corrige**. El pendiente del
   selector de secciones se cierra con lo que haya dado A.5.
3. **`docs/ESCRITORES.md`** — **no cambia la matriz**, porque no hay escritor nuevo. Pero las dos
   funciones nuevas son lectores del panel y conviene que quede dicho, donde el archivo ya distingue
   puertas: `panel_previsualizarTemario` **parsea y no escribe**, y por eso no es una tercera puerta
   de `REUNIONES`.
4. **`docs/PROCESO_SEMANAL.md`** — es el **dueño de la especificación del panel** por `CLAUDE.md §7`,
   y su estado está vencido: dice que las cinco `panel_*` están *"todas vacías"* y que `Panel.html`
   es *"un stub con tres TODOs"*. Dejó de ser cierto con el `_27`. Corregir **el estado**, con la
   fecha puesta: qué funciones existen y cuáles no, cuáles de las cuatro pantallas de la tabla *"Lo
   que el panel tiene que ser"* existen y en qué grado —**Pegar temario previsualiza pero no
   carga**—, y que hay una que la tabla no declaraba, **Corridas**, que sale de `D-28` y no de un paso
   de la secuencia. **No se rediseña la secuencia.**
5. **La decisión de la Parte C va escrita como decisión**, no como un cambio de textos: *el panel no
   habla del estado interno del proyecto; los errores de operación sí se muestran.* Va a
   `docs/PLAN.md` como `D-NN` nueva, con el número que siga.

---

## Lo que este prompt no hace, y es a propósito

- No compara períodos ni decks entre sí.
- No muestra el estado de cableado por informe en ninguna pantalla nueva.
- No pone `FALTANTES` ni `REVISAR` en pantalla como solapa propia.
- **No escribe en `REUNIONES` ni en `CAMPANAS`**, ni abre una puerta nueva en `ESCRITORES.md`.
- No toca `cargarTemarioCampanas_`: `ESCRITORES.md` dice que `CAMPANAS` tiene *"cero escritores en el
  código"* mientras esa función existe, y esa inconsistencia se resuelve en su propio prompt.
- No saca `secco` de `INFORMES` ni toca su columna `activo`.
- No toca la vía rápida de la solapa **Generar** ni el motor.
- No genera ningún deck.

---

## Commits

Uno por parte. La documentación va en su propio commit, separada del código.
