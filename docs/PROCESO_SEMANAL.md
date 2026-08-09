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
