# 2026-09-10_1 — En qué CAJA cae cada token de `secco`, y el tablero por lámina

> **Objetivo único:** ubicar cada token de la plantilla viva en **su caja, con coordenadas y con
> el rótulo que tiene al lado**, y levantar de ahí el tablero por lámina de `secco`.
>
> **Subagente: ninguno.**
>
> **Estado: no ejecutado.** Es una hipótesis hasta que la Parte 0 la mida.
>
> ⛔ **Esto NO cablea, NO levanta ningún `_revisar`, NO toca la plantilla y NO escribe una sola
> celda de `MARCADORES` ni de `MAPEO`.** Si en algún punto parece que hace falta, se reporta y se
> para.

| parte | modelo | effort | escribe |
|---|---|---|---|
| **0** | Sonnet | medio | nada — **reportar y parar** |
| **A** | **Opus** | **alto** | un `.gs` de sólo lectura + su banco |
| **B** | Sonnet | medio | tres documentos, ninguno nuevo |

---

## Por qué este prompt y no uno de cableado

`C-126` dice que hay **tres pares de tokens cruzados en la plantilla**: el número es correcto y el
casillero no. La afirmación es fuerte y **tiene dos causas posibles que mandan a trabajos
opuestos**:

| causa | quién lo arregla |
|---|---|
| la **plantilla** tiene `{{a}}` en la caja de `b` | ⛔ el equipo — `C-01` |
| el **motor** pinta el valor de `a` en la caja de `b` | el motor, y es un bug |

**Ninguna se distingue mirando el deck**, porque el texto aplanado no dice en qué casillero cae
cada valor. Lo que las separa es leer la **plantilla viva** conservando la posición — y eso hoy no
existe: `diagTokensDeLamina_` recorre las piezas con `piezasDeTextoDeSlide_`, que **sí devuelve
`geo`**, y **descarta la geo** al quedarse sólo con el nombre del token.

⭐ **No hay que escribir un lector nuevo: hay que dejar de tirar lo que el lector ya trae.**

---

## Parte 0 — Sonnet, effort medio · SÓLO LECTURA · reportar y parar

⛔ **No editar un archivo antes de terminar esta parte.** Si alguna premisa cayó, **parar y
reportar** sin pasar a la A.

### 0.1 — El snapshot de `MARCADORES` está vencido para `secco`, y hay que probar cuánto

```
awk -F'\t' 'NR>1{print $3}' docs/_snapshots/MARCADORES_2026-08-31.tsv | sort | uniq -c
```

Da **220 `jm`, cero `secco`, cero `*`**. `PENDIENTES` (05/09) ya declara que ese snapshot es
**anterior a la migración a `*`**, así que **cualquier conteo de `secco` contra él da cero por
construcción** — y un cero por construcción se lee igual que un cero medido.

⭐ **Correr `tools/snapshot.js` ANTES de contar nada** y reportar, con el comando al lado:

- filas de `MARCADORES` por `informe_id`: `jm` · `secco` · `*`
- filas de `LAMINAS` para `secco`, cuántas `escondida` y cuántas `rol = motor`
  *(el snapshot del 31/08 da **29 · 5 · 21** —
  `awk -F'\t' 'NR>1 && $2=="secco"' docs/_snapshots/LAMINAS_2026-08-31.tsv | wc -l` — y esos tres
  números **son la premisa a desmentir**, no el dato)*

### 0.2 ⛔⛔ ¿El deck del 10/09 12:03 está CERRADO o CORTADO?

`C-127` dice **76 tokens crudos y cero símbolos de corte**. Los cuatro contadores reproducen desde
el `.pptx`:

```
apariciones {{token}}: 76 | únicos: 60 | ///// : 52 | entre guiones -N- : 70
```

⛔ **Mientras esto no se conteste, ningún hallazgo del deck se puede atribuir a cableado.** Es el
caso del 20/08 con todas las letras: **269 `/////` de los cuales 264 eran del corte**, y el deck
mandaba a cablear 264 tokens que ya estaban cableados.

**Se contesta por dos caminos y hay que correr los dos**, porque el primero puede faltar:

1. la fila de `CORRIDAS` de esa ejecución — `ejecucion`, `corte`, `pendientes`, `deck_id`;
2. el nombre del archivo en Drive, que el `.zip` trae renombrado a mano y por eso **no sirve solo**.

⭐ Y el invariante que ya está escrito: **`corte ⇒ pendientes ≥ 1`**. Si la fila dice corte y
`pendientes = 0`, el hallazgo es la fila.

### 0.3 Las cuatro láminas del bloque `encuentro` que salieron crudas

El deck trae, en la zona del bloque `encuentro`, **cuatro láminas con tokens crudos**
(`{{ecv_comuna}}`, `{{et_nombre}}`, `{{et_fecha}}`, los `{{et_*}}`, los `{{u1_bench_*}}`) **y dos
pintadas del mismo bloque** (`Uno a uno en Palermo (04/09)`).

⛔ **Eso contradice al código:** `duplicarBloquesRepetibles_` hace
`modelosSlides.forEach(function (modelo) { modelo.remove(); })` **después** de duplicar. Un modelo
sin pintar en el deck significa una de tres, y **son tres trabajos distintos**:

| qué pasó | cómo se distingue |
|---|---|
| la sección **no expandió** (contigüidad, lámina perdida, cero ítems) | el reporte de la corrida lo dice **con motivo** |
| expandió y **no borró** | hay copias pintadas Y modelos — es un bug |
| la corrida **se cortó antes** de esa etapa | 0.2 |

⭐ **Se lee del reporte de la corrida, no del deck.** Reportar cuál de las tres, o que no se puede
saber con lo que hay.

### 0.4 Las dos funciones, leídas y no recordadas

- `piezasDeTextoDeSlide_` — confirmar que devuelve `{ texto, contenedor, geo{x,y,w,h}, objectId }`
  y que baja a **tablas y grupos**. Confirmar también qué devuelve `geo` **para una celda de
  tabla**, que es donde viven las cajas de `L-020`.
- `diagTokensDeLamina_` — confirmar que **no** usa la guarda de lámina escondida (importa: cinco
  láminas de `secco` lo están) y que descarta la geo.

⛔ **Si `geo` viene `null` para las celdas de tabla, la Parte A cambia de diseño** y hay que
reportarlo antes de escribir una línea: el censo tendría que ubicar por `contenedor`
(`tabla fila F col C`) y no por coordenadas, y eso **no es lo mismo** — una tabla puede tener sus
columnas en otro orden que el visual.

### 0.5 Lo que este prompt da por cierto y **no** midió — desmentir si corresponde

- ⭐ **Verificado desde el `.pptx` y con coordenadas, así que esto SÍ es dato:** en la lámina de
  *Resultados agregados* del primer bloque de campaña, el rótulo **Aperturas** (`x≈7,1`) tiene
  encima **`40.648 (-0.9-%)`** (`x≈6,9`), que es el **TOTALES de clics** de la tabla digital de la
  lámina siguiente; y el rótulo **Clics** (`x≈15,4`) tiene encima **`150.506`** (`x≈15,4`), que es
  el **GLOBAL de aperturas de mail**. Ídem `26 implementaciones` del lado Directa y
  `3 implementaciones` del lado Digital, invertidos respecto del deck del equipo.
- ⛔ **NO verificado:** que el cruce esté **en la plantilla**. Eso es justamente lo que mide este
  prompt.
- ⛔ **NO verificado:** el par de audiencias/formatos de `L-018`. Las dos cajas salen `/////`, así
  que **el deck no puede decir nada** — se decide en la plantilla o no se decide.
- ⛔ **NO verificado:** que pase *«en las DOS plantillas»*. Hay que medir `jm` también, no
  heredarlo.

**⛔ Reportar y parar.**

---

## Parte A — Opus, effort alto · el censo posicional

⛔ **SÓLO LECTURA sobre datos.** Escribe código, no celdas.

### A.1 `censarCajasDeInforme_(informeId)` + dos wrappers públicos

**Wrappers sin `_` y SIN PARÁMETROS** — `censarCajasSecco()` y `censarCajasJm()` —, porque Apps
Script no lista en el desplegable ni las privadas ni las que reciben argumentos, y **devuelven por
`Logger.log`**, no sólo por `return`.

**Reusa `piezasDeTextoDeSlide_` y `RE_TOKEN_` verbatim.** ⛔ No reimplementar el recorrido: es el
mismo camino que usa la corrida, y un segundo recorrido escrito a mano sería el instrumento que
reproduce la lógica del motor y la reproduce peor.

**Por cada lámina de la plantilla viva, dos listas y no una:**

| lista | qué trae |
|---|---|
| **cajas con token** | `token[]` · `texto_literal` · `geo` · `contenedor` · `objectId` · `escondida` |
| **cajas sin token** | ⭐ el mismo registro. **Son los rótulos**, y sin ellos el censo no puede decir en qué casillero cae nada |

**La salida se ordena por `(y, x)`**, que es como se lee una lámina, y se imprime con las dos
listas **entrelazadas**. ⛔ No inventar un algoritmo de «rótulo más cercano»: imprimir la tabla
ordenada y que la lea una persona. Un emparejamiento automático sería una inferencia más, y la
inferencia es justo lo que hay que evitar acá.

### A.2 Los controles — y ninguno puede depender de que el cruce exista

⛔⛔ **El control positivo de un detector no puede ser el defecto que el detector busca**: se apaga
el día que el sistema se arregla. Los tres son **sintéticos o estructurales**:

1. ⭐ **El censo ve la posición.** En cualquier lámina con más de una pieza, tienen que existir
   **al menos dos piezas con `y` distinto**. Si todas dan el mismo `y`, o todas `null`, ⛔ **aborta
   y no informa cero**: un censo ciego y un censo sin hallazgos se ven idénticos.
2. ⭐ **Segundo lector.** Para cada lámina, la lista de tokens tiene que coincidir con la que
   devuelve `diagTokensDeLamina_(informeId, orden)`. Si difieren, ⛔ **el hallazgo es el lector** y
   no se cita ninguno de los dos hasta resolverlo.
   ⚠ **Y su límite, declarado:** los dos comparten `piezasDeTextoDeSlide_`, así que **no fallan
   distinto en el recorrido** — sólo en el filtrado. Cubre que el filtro esté bien, no que el
   recorrido lo esté.
3. ⭐ **Negativo.** Una lámina `rol = equipo` tiene que dar **cero tokens y más de cero piezas**.
   Cero piezas es *no estoy mirando*, no *no hay tokens*.

**Y el log declara `n de m` láminas censadas.** Cero unidades verificadas es un problema, no un
silencio.

### A.3 Banco

`tools/probar-censo-cajas.js`, con su caso negativo: si se rompe a propósito el control 1 —geo
forzada a `null`— el censo **tiene que abortar**. ⛔ Y la guarda de mutación: si el texto parcheado
es idéntico al original, el caso **falla**, no se saltea.

⛔ **`clasp push` va en su propio comando, después de leer el verde de las suites.** Nunca
`node tools/suites.js | grep … && clasp push`: el `exit` es del filtro, no del runner.

---

## Parte B — Sonnet, effort medio · correr y dejarlo escrito

### B.1 Correr los dos wrappers y contestar tres preguntas

1. **¿El cruce está en la plantilla?** Para cada uno de los tres pares —`camp_dig_impl` /
   `camp_dir_impl`, la caja de *Aperturas* y la de *Clics*, y las de audiencias/formatos de
   `L-018`—: qué token declara cada caja y qué rótulo tiene al lado.
2. **¿Pasa en las dos plantillas?** Medirlo en `jm`, no heredarlo de `secco`.
3. **¿Cuántas láminas de `secco` tienen `rol = motor`, cuántos tokens y cuántos con fila hoy?**

### B.2 Tres documentos, y **ninguno nuevo**

⛔ **No crear archivos `.md`.** Los tres destinos ya tienen dueño:

| qué | dónde | por qué ahí |
|---|---|---|
| el tablero de `secco`, fila por lámina | `docs/CIERRE_POR_LAMINA.md`, **sección nueva** | §7 lo declara dueño de *«¿qué láminas están cerradas y qué le falta a cada una?»* |
| el veredicto de `C-126` — plantilla o motor | `docs/PENDIENTES_consistencia.md` | inconsistencia abierta |
| la corrección de los dos testigos vencidos | ver B.3 | |

**El tablero usa los estados que el documento ya define** —✅ 🟡 ⛔ ⏳ 🚫— y las marcas 🕳 / 🌐 / ⚠.
⛔ **Code no pone ningún ✅**: mueve a 🟡 **con evidencia** y ahí para.
⚠ **Lo que no está medido va ⛔ con *«sin medir»*, nunca con una estimación.**

### B.3 ⛔ Dos testigos vencen con este prompt, y hay que moverlos en el mismo commit

| lugar | qué dice hoy | clase |
|---|---|---|
| `docs/CIERRE_POR_LAMINA.md`, título y *«Lo que este tablero NO contesta»* | `# CIERRE POR LÁMINA — jm` y *«Nada sobre `secco`. Este tablero es de `jm`. `secco` tiene 29 láminas y ninguna fila acá»* | **se mueve** — la segunda **no se borra**: se tacha con fecha, porque era cierta |
| `CLAUDE.md` §7, fila del tablero | *«**vivo, se edita**, una fila por lámina de `jm`»* | **se mueve** |
| `CLAUDE.md` §6, mapa del repo | *«qué lámina está cerrada y qué le falta (vivo)»* | **cita** — ya es genérica, no se toca |
| `Instalar.gs`, *«El alcance de las 23 láminas de `jm`, copiado de `CIERRE_POR_LAMINA.md`»* | sigue hablando de `jm` | **cita** — sigue siendo cierta |

⚠ **Lo que este barrido NO pudo ver, declarado y no omitido:** la planilla viva, la plantilla de
Slides, y cualquier comentario que describa el tablero sin nombrarlo.

### B.4 Commits

Uno de **código** (Parte A) y uno de **documentación** (Parte B), separados. `git push` después de
cada uno.

---

## ⛔ Los hard stops

1. ⛔ **Si la Parte 0 no puede decir si el deck está cerrado o cortado, la Parte B no clasifica
   ningún hallazgo del deck como cableado.** Se escribe *«sin medir»*.
2. ⛔ **Si `geo` viene `null` en celdas de tabla, parar y reportar** antes de escribir la Parte A.
3. ⛔ **Si el control 1 o el 3 abortan, el censo no publica ningún número.** Un cero de un detector
   ciego es el resultado más peligroso que hay.
4. ⛔ **Si el segundo lector discrepa, el hallazgo es el lector** y las tres preguntas de B.1
   quedan sin contestar.
5. ⛔ **No se compensa `C-126` desde el cableado.** Dar vuelta dos filas de `MARCADORES` para que
   el número caiga en el casillero correcto es un **rodeo**: calibra la salida de un mecanismo para
   tapar que el otro está mal, y desaparece entero en cuanto se arregle la causa. Si el cruce está
   en la plantilla, **la plantilla es del equipo** y la decisión es del usuario.
6. ⛔ **Ningún ✅ en el tablero.**
