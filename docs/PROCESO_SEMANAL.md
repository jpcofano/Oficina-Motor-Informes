# El proceso semanal — de la lista de WhatsApp al deck

> Repo: `docs/PROCESO_SEMANAL.md` · 08/08/2026
> **Qué es.** La secuencia que hace una persona para sacar el informe de la semana. El `RUNBOOK`
> cubre el setup y el ciclo de desarrollo; esto cubre el uso.
> **Estado.** Los pasos marcados **[hoy]** funcionan. Los marcados **[falta]** todavía se hacen a
> mano o no existen. Se escribe entero igual, porque **el panel es la interfaz de esta secuencia**
> y sin la secuencia escrita el panel se diseña a ciegas.

---

## El ciclo, en una línea

**Llega el temario → se cargan reuniones y campañas → se confirma lo que el motor no puede decidir
solo → se genera → se revisa lo que faltó → se publica.**

El período es de **viernes a jueves**. La ventana no elige qué entra al informe: **eso lo elige el
temario.** La ventana sirve para calcular los números.

---

## Paso 1 · Llega el temario **[hoy]**

Un mensaje de WhatsApp, escrito por una persona apurada, con bloques marcados con `>`. Trae dos
cosas distintas que van a dos lugares distintos:

- **Reuniones** — `JM | Uno a uno en San Cristóbal 23/07 (pre)`. Van a `REUNIONES`.
- **Campañas destacadas** — campañas largas, que no nacen de una reunión. Van a `CAMPANAS`.

**No se le pide al temario que cambie.** El formato es sucio y va a seguir siéndolo: `1)Semana JM`
sin espacio, errores de tipeo, espacios de más. Los parsers toleran eso. Lo único que se acordó
pedir son dos comodidades —el `>` en todos los bloques y `[?]` para lo condicional— y **el
cargador funciona igual sin ellas**.

## Paso 2 · Se pega el temario **[hoy]**

Menú → *Cargar temario de reuniones* y *Cargar temario de campañas*. Se pega el texto, se elige el
período, y el cargador escribe las filas.

**Qué hace cada uno con lo que no puede resolver:**

- **Reuniones**: parsea eje, tipo, barrio, fecha y etapa. Lo que va entre paréntesis y no es
  `pre`/`post` queda en `notas`.
- **Campañas**: busca el nombre del temario contra la base y **cuando resuelve, deja el id marcado
  `SIN CONFIRMAR`** con el porcentaje y el nombre de la base al lado. Cuando dos candidatos
  empatan, **no elige: pregunta.** Los dos valores que gobiernan eso —umbral y margen— viven en
  `CONFIG` y se ajustan sin tocar código.

## Paso 3 · Se confirma lo que el motor no decide **[hoy, y es el paso que no se saltea]**

Tres cosas quedan esperando a una persona:

1. **Los ids `SIN CONFIRMAR`.** Se miran y se confirman. Recién ahí entran a
   `CAMPANAS_equivalencias`, que es la solapa que hace que la semana que viene el mismo nombre
   resuelva solo. **Una fila ahí se repite todas las semanas sin que nadie la vuelva a mirar**, y
   por eso sólo entra lo confirmado a mano.
2. **Los empates**, que el cargador dejó como pregunta.
3. **Las campañas condicionales** — *"en caso de que llegue el material"*. Se decide si van o no.

**Por qué este paso existe:** el costo de un match errado no es un número mal, es **un encuentro
entero atribuido a otro barrio**.

## Paso 4 · Se genera **[hoy]**

Menú → generar. El motor lee las fuentes, resuelve los marcadores y escribe el deck sobre la
plantilla.

**Lo que conviene saber antes de que sorprenda:**

- **El informe se fija en un momento; las bases siguen avanzando.** Dos corridas de la misma
  semana pueden dar números distintos sin que nada falle. **[falta]** — el mecanismo que congela
  los datos de un deck es `Snapshot.gs` y está sin implementar.
- **Un `IMPORTRANGE` roto no tira excepción**: devuelve `#REF!` como texto. `R-19` es la guarda
  que lo ataja.

## Paso 5 · Se revisa lo que faltó **[hoy]**

Dos listas, y son distintas:

- **`FALTANTES`** — lo que no se pudo resolver. **Lista por ítem, no por token**: contar tokens ahí
  mezcla láminas.
- **`REVISAR`** — lo que se resolvió pero no matcheó contra el catálogo. Existe como estado desde
  el 08/08.

**Lo que ninguna de las dos mira: el universo.** Un número correcto puede salir de las filas
equivocadas — la lámina 5 publicó los encuentros de doce figuras durante quince días pasando todas
las verificaciones. Ésa es la pregunta que el subagente `verificador` incorporó.

## Paso 6 · Se publica **[falta]**

Hoy termina en el deck generado. El sellado sobre plantilla es la Fase 2 y está esperando.


---

## El selector de período — tres modos, uno construido **[hoy]** y dos **[falta]**

Decisión del usuario, 20/08/2026 (`2026-08-20_2` Parte B bis). Está acá y no en un documento nuevo
porque este archivo es **la especificación del panel** (`CLAUDE.md` §7).

| modo | qué elige la persona | estado |
|---|---|---|
| **semana** | una semana viernes–jueves, con la última **cerrada** propuesta | **[hoy]** |
| **mes** | un mes calendario | **[falta]** |
| **libre** | dos fechas, las que quiera | **[falta]** |

**Lo que entró el 20/08:** el motor propone **la última semana cerrada**, no la que contiene a la
fecha de corrida. Corriendo el jueves 20/08 propone 14/08–20/08; corriendo el **viernes 21/08 sigue
proponiendo 14/08–20/08**, porque la semana que arranca ese viernes todavía no cerró. **El viernes
es el único día donde las dos lecturas difieren**, y es justo el día en que se genera `jm`.

### ⭐ Lo que bloquea a los tres modos es **una sola pieza**, y por eso no son tres frentes

Los tres modos son **tres formas de proponer un par de fechas**, y las tres chocan contra lo mismo:
**una ventana sin período con nombre no recorta las secciones repetibles.**

⚠ **Y no es lo que parece a primera vista.** Lo intuitivo —*"sin fila en `PERIODOS` no se puede
correr"*— **es falso**, medido el 20/08: `generarInforme` sólo exige que el `periodo_id` exista
**cuando se le pasa uno**, y el camino "por defecto" no le pasa ninguno. **El deck se genera, sobre
las fechas correctas.**

Lo que sí pasa es más silencioso: `anclarEncuentrosSinCache_` saca el período **del `origen` de la
ventana**, y una ventana calculada trae `origen = 'R-11 (calculado)'`. Sin `periodo_ref:` adelante,
**el recorte de `D-19` no se aplica** y entran todas las reuniones con `mostrar=sí` — al 20/08 son
**12, de dos períodos distintos** (8 de `julio_24_30`, 4 de `junio_sem2`). Las que no anclen contra
`rdv` caen solas, **pero por el motivo equivocado**.

**Por eso el panel avisa en vez de bloquear**, y el aviso dice eso y no *"no se puede correr"*:
una advertencia equivocada cuesta lo mismo que ninguna, porque la próxima se lee con la misma
desconfianza.

**El trabajo que destraba los tres modos es uno solo:** que una ventana elegida pueda tener fila en
`PERIODOS`. Eso es un **escritor nuevo de hoja de registro**, con su fila en `ESCRITORES.md` y su
decisión sobre el formato del `periodo_id`. Va en un prompt propio. **Escribirlo así evita que "el
selector mensual" se planifique como un frente separado cuando es la misma pieza.**

### El modo "mes" no inventa un grano nuevo — pero el que hay no tiene usuarios

⚠ **Confirmado contra la hoja viva el 20/08, y sale a medias:**

- `PERIODOS` **sí** tiene `m2_mensual` (01/06–30/06). ✓
- `MARCADORES.periodo_ref` es el **eslabón 2** de la cadena de `D-20` y funciona… pero **está
  vacío en las 87 filas**. `SECCIONES.periodo_ref` —el eslabón 3— **también está vacío en todas**.

O sea: **el grano mensual existe como mecanismo y tiene cero usuarios.** El modo "mes" del selector
no inventaría un grano nuevo, pero tampoco se apoyaría en algo probado en producción. **La primera
vez que alguien use `periodo_ref` va a ser también la primera vez que ese eslabón corra de verdad**,
y eso conviene saberlo antes y no durante.

### ⚠ Qué NO alcanza con un selector, y es el límite honesto

Elegir la ventana **no arregla** que `resolverVentana` no reciba `informe_id`, ni que
`itemsDeSeccion_` no reciba el `periodo_id` de la corrida — la pieza faltante que `PLAN.md` §3
tiene anotada como `D-NN`, *"el motor no sabe PARA QUÉ CORRIDA está resolviendo"*.

**Un selector más rico sobre esa pieza faltante ofrece precisión que el motor no tiene.** Es la
razón por la que los dos modos futuros están escritos y no construidos.


---

## Cuando una corrida se reanuda sola — qué ves y cómo la frenás **[hoy, parcial]**

Decisión del usuario, 20/08/2026 (`2026-08-20_10`). El mecanismo está construido; **la Parte C —
persistir el anclaje— no**, así que hoy cada ejecución vuelve a pagar los 70–80 s de arranque.

### Qué ves mientras corre

| dónde | qué dice |
|---|---|
| **el nombre del deck en Drive** | ⭐ arranca con **`[en proceso] `** adelante y **lo pierde al terminar**. Con sello es un checkpoint; **sin sello y con `{{token}}` crudos es un motor roto** |
| la hoja **`PLAN_CORRIDA`** | una fila por sección: `pendiente` · `hecha` · `omitida` · `falló`, con en qué ejecución se hizo |
| `CORRIDAS` | la fila de la corrida, con el rastro de etapas y el gasto |

⭐ **El sello es lo primero que se ve y por eso está en el nombre**: contesta *«¿este deck está
listo?»* sin abrirlo, desde la lista de Drive.

⚠ **Los tokens crudos NO dicen qué falta** — lo dice el plan. Las láminas escondidas dejan **49
crudos permanentes** en toda corrida, así que leerlos como *"lo que queda"* lleva a una reanudación
que no termina nunca.

### Cómo la frenás

**`cancelarCorridaDesatendida()`**, sin argumentos, desde el editor.

Borra los triggers y el estado. **No toca el deck ni el plan**: quedan para ver dónde se paró, y el
deck conserva su sello, que es exactamente lo que declara. ⭐ **Un mecanismo desatendido sin botón
de freno es peor que ninguno**, y por eso esto se construyó junto con el arranque y no después.

### Cuándo para sola, y qué significa cada caso

| para porque… | qué hacer |
|---|---|
| **terminó** | nada. El deck perdió el sello |
| **tope de continuaciones** (`CONFIG.tope_continuaciones`, hoy 6) | la corrida es más grande de lo previsto. Mirá el plan: qué secciones quedaron |
| ⚠ **sin progreso** | una ejecución no marcó ni una sección. **Algo falla**, no es que tarde |
| ⭐ **una sección no entra sola** | **es otro problema**: la unidad de trabajo es más grande que una ejecución. Lo destraba partirla por asignación, no reintentar |

⚠ **Los dos últimos se ven parecidos y son arreglos distintos**, y por eso el mecanismo los nombra
distinto. Al 20/08 ninguna sección de `jm` lo necesita —`encuentro` tiene 27 asignaciones y entran
~47— pero **el umbral está en ~22 encuentros**, que es una semana cargada.

### Antes de confiar en el mecanismo, una vez

**`verificarAlcanceDesatendido()`.** Un trigger corre **sin usuario delante**, con los permisos del
**dueño del script** — y las bases son planillas de otras cuentas compartidas con él. Si ese alcance
no llega, la primera continuación falla leyendo una base y el plan se queda pendiente sin que se
entienda por qué. La función lo prueba **sin generar nada**.

### **[falta]** — lo que este mecanismo todavía no hace

- ⛔ **No persiste el anclaje entre ejecuciones** (Parte C del `_10`). Cada ejecución vuelve a pagar
  **70–80 s** de arranque; con tres son 210 s, casi una corrida entera. **Es lo que haría que el
  mecanismo rinda**, y hoy no está.
- ⛔ **No corre sola los viernes.** Esto lo habilita; **agendarla es otra decisión.**

---

## Lo que el panel tiene que ser

Escrito así, el panel no es una decisión de diseño: **es esta secuencia con botones.** Cuatro
pantallas, en este orden:

| pantalla | qué hace | de qué paso sale |
|---|---|---|
| **Pegar temario** | un cuadro de texto, selector de período, botón cargar | 2 |
| **Confirmar** | la lista de `SIN CONFIRMAR` y de empates, con el nombre de la base al lado y un botón por fila | 3 |
| **Vista previa** | tabla marcador / valor / estado / traza, antes de escribir nada | 4 |
| **Estado** | `FALTANTES` y `REVISAR` en pantalla, no en una hoja | 5 |

`PanelBackend.gs` ya tiene declaradas las cinco funciones que esto necesita —`panel_getPeriodos`,
`panel_getCamposFuente`, `panel_getPreview`, `panel_addMarcador`, `panel_generar`— **todas
vacías**, con el comentario *"se completa en Pasos 6-8"*. `Panel.html` es un stub con tres TODOs.

**El orden de construcción sale solo:** *Vista previa* primero, porque es la única que no escribe
nada y ya tiene de dónde leer.

---

## Addendum · 2026-08-21 · La confirmación de anclajes pasa a **[hoy]**, y la sección de arriba está vencida

**Addendum fechado** (`CLAUDE.md` §7): el texto anterior no se edita. `2026-08-21_16` Partes A y D.

### D.1 · Confirmar el anclaje de un encuentro — **[hoy]**

**Dónde entra en el camino:** entre el Paso 2 (se pega el temario) y el Paso 4 (se genera). Si el
motor no puede asociar un encuentro con su campaña **con suficiente confianza**, lo registra y no
adivina (`D-29`). Antes eso quedaba sólo en `excluidos` y en la hoja `ANCLAJE_PENDIENTE`; **ahora
se resuelve desde el panel**, pestaña `Anclajes`: cada encuentro con sus tres candidatos, el
puntaje de cada uno **contra el umbral**, y un botón por candidato. Desconfirmar también.

**Los tres límites, que son parte del paso y no una nota al pie** (addendum a `D-29`, mismo día):

1. **Muestra lo pendiente de confirmar, no todo lo anclable.** Un encuentro que todavía no pasó
   por ninguna corrida **no está en la hoja** y no aparece. Si hace falta verlo antes de correr,
   la salida es un botón *"recalcular"* que pague los ~50 s — **no existe**.
2. ⚠ **Puede mostrar filas de más.** La hoja **acumula** y nada la limpia, así que puede haber
   anclajes de encuentros que ya no van al deck. La pantalla **los marca** como *"ninguna reunión
   vigente la reclama"* y **no los borra**: borrar una decisión que alguien tomó es peor que
   dejarla a la vista.
3. ⛔ **No cubre los empates arriba del umbral.** Un encuentro cuyo mejor candidato **pasa** el
   umbral no entra en esta pantalla — el motor ancla solo. Si dos candidatos empatan arriba,
   decide un desempate temporal y **nadie pregunta**. Ése es el modo de falla del `3347` y
   **sigue abierto**: es del motor, no del panel.

⚠ **Y lo que este paso NO prueba:** que el motor **respete** el `elegido` escrito. Lo hace
`anclajeYaConfirmado_`, que existe desde el Paso 2.9F, pero **el circuito completo nunca corrió de
punta a punta** — está anotado como pendiente y sigue abierto.

### D.2 · «Lo que el panel tiene que ser» describe un panel que ya no existe

La sección de arriba fue escrita cuando el panel no estaba construido, y **hoy es falsa en sus
tres afirmaciones**. Medido contra los archivos el 21/08/2026:

| lo que dice | lo que hay |
|---|---|
| *"las cinco funciones… **todas vacías**"* | **cuatro de las cinco ni siquiera existen** — `panel_getPeriodos`, `panel_getCamposFuente`, `panel_getPreview` y `panel_addMarcador` no están escritas. La quinta, `panel_generar`, **funciona**. Y hay **siete** funciones `panel_*` que la lista no nombra |
| *"`Panel.html` es un stub con tres TODOs"* | **1013 líneas y cero TODOs** |
| la tabla de cuatro pantallas | las pestañas de hoy son **`Generar`, `Anclajes`, `Corridas`, `Próximo`** — ninguna se llama como las cuatro de la tabla |

⭐ **Pero la tabla no está equivocada como diseño, y por eso no se borra:** describe las pantallas
que la **secuencia** pide, y tres de las cuatro siguen faltando. Lo que venció es la parte que
afirma el **estado del código**, no la que dice qué haría falta.

**La correspondencia, para que las dos tablas se puedan leer juntas:**

| pantalla de la tabla | estado |
|---|---|
| **Pegar temario** | parcial — `panel_cargarTemario` y `panel_proponerTemario` existen; la pantalla propia no |
| **Confirmar** | **la mitad construida**: `Anclajes` resuelve los encuentros; la lista de `SIN CONFIRMAR` de campañas es **otro circuito** y sigue faltando |
| **Vista previa** | **falta** — `panel_getPreview` no existe |
| **Estado** | parcial — la pestaña `Corridas` muestra las últimas corridas y sus faltantes; `FALTANTES` y `REVISAR` en pantalla, no |

⚠ **Y la frase final —*"el orden de construcción sale solo: Vista previa primero"*— tampoco se
cumplió**, y conviene decirlo en vez de dejarla en pie: se construyó `Generar` primero. No es un
error a corregir; es que el orden lo decidió otra cosa. Pero leerla hoy como si fuera el plan
vigente manda a construir lo que no toca.

---

## Addendum · 2026-08-22 · El desatendido entra al camino del usuario

`2026-08-21_19`, Partes A, B, C y E. **No se edita ninguna línea de arriba**: se declara qué venció
y con qué se reemplaza, que es la convención de este archivo desde el addendum del 21/08.

### E.1 · ⛔ El hallazgo, que es de proceso y no de código

**Hasta hoy el botón del camino del usuario podía cortar y dejar un deck incompleto sin forma de
continuarlo.** `panel_generar` llamaba a `generarInforme` **sin `continuable`**, así que no escribía
`PLAN_CORRIDA` ni creaba trigger: si la corrida no entraba en el techo, el deck quedaba a medias,
sellado, y la única salida era generar de nuevo desde cero.

⚠ **Y no se había notado porque ninguna corrida había cortado.** El mecanismo desatendido existía
desde el 20/08 y se probaba desde el editor; el camino que la persona usa todas las semanas nunca
se había topado con el límite. **Una capacidad que sólo falta cuando algo sale mal es indistinguible
de una que no falta** — hasta el día que algo sale mal.

**Las dos corridas que lo mostraron, medidas sobre `CORRIDAS` la noche del 21/08. Misma semana
(`agosto_14_20`), mismo universo de 404 datos:**

| corrida | impresos | faltaron | llega a la etapa 4 | **dura** la etapa 4 | deck |
|---|---|---|---|---|---|
| `jm-20260821-194602` | 92 | 312 | +191 s | **49 s** | sin sello — cerró |
| `jm-20260821-224727` | 65 | 339 | +257 s | **10 s** | ⛔ **`[en proceso]`** — cortó |

⭐ **La segunda pintó 27 valores menos habiendo corrido una quinta parte del tiempo en la etapa que
pinta.** No es un problema de cableado —en el medio se habían agregado tokens resueltos, no
quitado—: es que cortó. **Y el nombre del archivo en Drive lo sigue diciendo hoy**, porque el sello
sólo se quita cuando la corrida termina.

### E.2 · Los dos botones — cuál conviene

La sección *«Cuando una corrida se reanuda sola»* de arriba pasa de **[hoy, parcial]** a **[hoy]**,
y su frase *«`cancelarCorridaDesatendida()`, sin argumentos, desde el editor»* queda **vencida**:
ahora hay botón.

| botón | qué hace | cuándo conviene |
|---|---|---|
| **Generar informe** | corre de una vez y devuelve el deck en la pantalla | **es lo más rápido cuando entra en el techo.** Sigue siendo el caso normal |
| **Generar y que siga sola** | arranca la corrida desatendida: si corta, se reanuda sola hasta terminar | cuando la semana trae muchos encuentros y la corrida de una sola vez viene cortando |

⚠ **El botón viejo NO se retiró, y el motivo es de costo medido:** el arranque —anclaje más unión
digital— cuesta **70–80 s por ejecución**, así que una corrida partida en tres paga ese arranque
tres veces. Mientras el desatendido no esté probado punta a punta, la corrida de una sola ejecución
sigue siendo la barata.

⭐ **Y el período viaja por los dos botones**, que no es un detalle: una corrida arrancada sin el
período elegido da **la misma ventana de fechas y otro temario**, porque el recorte por período
(`D-19`) sólo se aplica cuando la ventana vino por `periodo_ref`. El 21/08 eso puso **seis
encuentros de junio y julio** en un deck, sin que nada fallara.

### E.3 · Ver la corrida mientras corre — pestaña **Corrida** **[hoy]**

| qué muestra | de dónde sale |
|---|---|
| `corrida_id`, informe, período, **ejecución N de 6** | el estado guardado entre ejecuciones |
| el plan por sección, con `pendiente` / `hecha`, en qué ejecución y cuántos segundos | la hoja `PLAN_CORRIDA` |
| ⭐ **si el deck está listo** | el **sello** del nombre del archivo, no los tokens |
| el botón de **frenar**, con confirmación | `cancelarCorridaDesatendida()` |

⚠ **No se refresca sola, a propósito, y dice a qué hora leyó.** Una pantalla que se actualiza sola
parece siempre actual aunque el backend haya dejado de responder; una con la hora de lectura a la
vista, no.

⚠ **Sigue valiendo lo de arriba: los tokens crudos NO dicen qué falta.** Las láminas escondidas
dejan **49 crudos permanentes** en toda corrida, incluso en una que terminó perfecta. Por eso la
pantalla contesta *«¿está listo?»* con el sello.

**Y cuando la corrida termina, la pantalla no se apaga:** el estado se borra —es lo que declara que
no hay nada corriendo— pero `PLAN_CORRIDA` no se borra nunca, así que se sigue viendo en qué terminó
la última.

### E.4 · Archivar una ancla huérfana — pestaña **Anclajes** **[hoy]**

Las filas marcadas *«ninguna reunión vigente la reclama»* ahora tienen botón **Archivar**.

- **Archivar no borra.** La fila se queda: es el registro que el motor consulta antes de anclar, y
  borrarla haría que la próxima corrida vuelva a preguntar lo mismo.
- ⭐ **Vuelve sola.** Si la reunión pasa otra vez a `mostrar = sí`, la fila reaparece **sin que
  nadie tenga que desarchivarla**: archivar significa *«no me muestres esta huérfana»*, no *«no me
  muestres nunca esta clave»*.
- ⛔ **Una vigente no se puede archivar** — se rechaza con el motivo dicho. Esconder algo que la
  próxima corrida sí va a mirar es lo contrario de lo que este botón hace.
- ⚠ **El contador de huérfanas no baja al archivar.** Sigue diciendo cuántas hay y cuántas están
  escondidas. Si bajara, el problema **parecería resolverse solo**.

### **[falta]** — lo que sigue sin estar

- ⛔ **Persistir el anclaje entre ejecuciones** (Parte C del `_10`). Es lo que haría que el
  desatendido **rinda**, y sigue sin construirse. Sin eso, partir una corrida en tres cuesta 210 s
  de arranque.
- ⛔ **Correr sola los viernes.** Esto lo habilita; agendarla es otra decisión.
- ⚠ **El desatendido nunca corrió de punta a punta con más de una continuación.** Los controles
  fijan las decisiones —qué opciones viajan, qué se muestra— y **eso no es lo mismo que haberlo
  visto terminar**.
