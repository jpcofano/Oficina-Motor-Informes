# `2026-09-01_3` — El panel: dos niveles, el informe primero, y el período sin trámite

**Subagente:** ninguno.
**Destino:** `docs/Prompts/`.
**Estado:** no ejecutado.

⛔ **Este prompt NO toca los cortes de período.** Eso deroga una decisión escrita y va en el `_4`.

---

## Las decisiones del usuario, 01/09/2026

1. **Dos niveles de navegación.** Arriba quedan **`Asistente`**, **`Corrida`** y **`Corridas`** —la
   última porque es por donde se llega a los decks ya generados—. El resto va agrupado en
   **`Detalles`**: `Anclajes`, `Faltantes`, `Próximo`, y `Generar` si sobrevive a la Parte 0.
2. **El selector de informe pasa a ser lo primero del asistente**, antes del período.
3. **La creación del período es invisible.** Un botón por opción: se aprieta, y si el período
   existe se usa y si no se crea. Sin *«Crear y usar»* contra *«Usar»*, sin el cartel de *«ya
   existe en PERIODOS»*.

⭐ **Y el criterio de fondo, con las palabras del usuario:** *poder generar los cortes que uno
quiera y configurar el informe con las secciones que uno quiera, así no es todo tan rígido.* Eso
manda sobre las tres de arriba cuando alguna las contradiga.

---

## Parte 0 — sólo lectura

**Modelo: Sonnet. Effort: alto.** ⛔ **No editar. Reportar y parar.**

### 0.1 · Qué hace hoy cada pestaña, y cuál no está cubierta por el asistente

Las siete de `pintarTabs()`. Para cada una: **qué permite hacer que el asistente no permita**.

⭐ **La que decide el diseño es `Generar`**, y su comentario en el código ya declara por qué existe:
*«es el camino libre, y sigue haciendo falta para regenerar un deck de un período ya armado sin
volver a pasar por los cuatro pasos»*.

⛔ Verificar si eso **sigue siendo cierto**: ¿el asistente puede hoy regenerar sobre un período ya
armado sin recargar el temario? Si puede, `Generar` se retira; si no, va en `Detalles` **y la razón
queda escrita**. ⚠ **No retirar una pestaña porque «parece redundante»**: el comentario es una
decisión y se deroga con medición, no con impresión.

### 0.2 · Qué de los pasos 1 a 3 depende del informe

El selector vive hoy en el **paso 4**, así que los tres primeros corren **sin saber para qué
informe**. Medir, uno por uno:

- **El período** — ¿`PERIODOS` es por informe o compartido?
- **El temario** — ¿`REUNIONES` y `CAMPANAS` se cargan por informe, o una sola vez para los dos?
  ⚠ El filtro por `informe_id` de `CAMPANAS` **se sacó el 18/08**, así que la respuesta de hoy
  puede no ser la del código que se lee.
- **El anclaje** — ¿depende del informe o de la ventana?
- **Las secciones** — `resetSecciones()` corre en `arrancar()` y tilda todas las de `inf.secciones`.
  ⭐ **¿Qué pasa hoy si se cambia el informe en el paso 4 después de haber tildado secciones en un
  informe distinto?** Si `S.secciones` conserva las del anterior, mover el selector al paso 1 no es
  sólo cosmético: **arregla un bug**. Y si no lo arregla, hay que decir por qué no.

### 0.3 · El aviso que no se puede perder

`AVISO_SEMANA_SIN_CERRAR_` se pinta **antes** del botón, y eso es deliberado: se dispara sólo los
viernes, **que es justo el día en que se genera `jm`**.

⛔ Con la simplificación del punto 3, **verificar que sigue apareciendo y en el mismo lugar**. ⚠ Un
botón más limpio que se come ese aviso es peor que el botón de hoy.

⚠ Y medir qué **otros** avisos o estados viven en esa pantalla —`ya_existe`, `sin_cerrar`, los de
`avisosDeVentanaPropuesta_`— para no retirar uno creyendo que es decoración.

### 0.4 · Dónde queda la corrida en marcha

Si el asistente lanza una desatendida, **¿el usuario llega solo a ver el progreso?** Medir qué hace
hoy el panel al generar, y si `Corrida` se muestra sola o hay que buscarla.

**Reportar y parar.**

---

## Parte A — el diseño

**Modelo: Opus. Effort: alto.** Cambia el camino por el que se genera todo.

La navegación de dos niveles, con **qué pestaña queda dónde y por qué**, y el estado que hay que
conservar al cambiar de nivel — hoy `S.tab` es plano y va a dejar de serlo.

El reordenamiento del asistente con el informe primero, **diciendo qué se invalida al cambiarlo a
mitad de camino**: si el temario ya está cargado y el informe cambia, ¿se reinicia, se conserva, se
avisa? ⚠ El paso de período ya tiene esa regla escrita —*«es lo primero y no se cambia después:
cambiarlo es empezar de nuevo»*— y ahora hay **dos** cosas que la merecen. **Decir si son la misma
regla o dos distintas.**

⛔ **No implementar.** El usuario aprueba el diseño antes.

---

## Parte B — implementar

**Modelo: Sonnet.**

`Panel.html`, y el backend sólo si la Parte A lo pide. Commit propio, `docs/BITACORA.md` en una
línea.

⚠ **Y una decisión del usuario que llega hasta acá:** *la app se usa en computadora.* No hay que
sostener el ancho de un sidebar angosto en este cambio. ⛔ **Pero eso no habilita rediseñar el
aspecto** — el diseño visual es un paso aparte y el usuario lo dijo así.

---

## Lo que este prompt NO hace

- **No toca los cortes de período.** Los cuatro botones y el corte `vie→vie` van en el `_4`, porque
  el backend declara que los modos *«son tres a propósito, no una lista que crece»* y eso hay que
  derogarlo o reexpresarlo, no saltearlo.
- **No toca la elección de secciones** más allá de medir el bug del 0.2. Que el informe se pueda
  configurar con las secciones que uno quiera es parte del mismo criterio del usuario, pero es su
  propio objetivo.
- **No cambia el aspecto.**
