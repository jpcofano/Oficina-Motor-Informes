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
