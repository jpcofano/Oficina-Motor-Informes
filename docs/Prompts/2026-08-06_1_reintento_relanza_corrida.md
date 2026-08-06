# Que el cliente no relance una corrida que agotó los 6 minutos

**Un objetivo.** Que una invocación de `generarInforme` produzca **una** corrida,
y que la carpeta de salidas cierre contra `CORRIDAS`. No se toca el motor, no se
optimiza nada.

**Lo medido.** Una sola invocación dejó dos filas en `CORRIDAS` —`231421` y
`232018`, seis minutos de diferencia— y el reintento de `tools/api.js` relanza la
generación entera. La corrida muere a los 324 s por el límite de Apps Script.

**La premisa que se venció.** El comentario del 04/08 en `tools/api.js` dice que
el 404 en HTML es transporte, que aparece "de a ratos y sin patrón", y que el
reintento lo resuelve. Para el caso del timeout eso no se sostiene: una corrida
que agota los 6 minutos devuelve HTML **siempre**, y el reintento arranca otros
seis minutos igual de condenados. El mismo comentario ya avisaba que el caso HTML
no se puede distinguir de una corrida que sí ejecutó — ahora se sabe que no es un
caso raro, es el caso normal.

**El costo real no es el tiempo.** Es que `CORRIDAS` miente: dos filas por
invocación hacen que cualquier conteo de corridas muertas esté inflado, y que los
decks de Drive no cierren contra nada.

---

## Parte 0 — cómo se distinguen los dos HTML (sólo lectura, reportar y parar)

`0.1` · **El HTML del timeout.** Con `TIMEOUT_MS` en 9 min y el límite de Apps
Script en 6, el cliente espera y recibe algo. Reportar **qué** recibe, textual:
status, `content-type`, y las primeras líneas. Y **a los cuántos segundos** llega.

`0.2` · **El HTML de transporte del 04/08.** Buscar en `BITACORA.md` o en el
handoff de esa corrida si quedó registrado **cuánto tardaba** en llegar. Si no
quedó registrado, decirlo: sin ese dato, cualquier corte por tiempo es una
suposición y hay que ir por otro lado.

`0.3` · **`abrirCorrida_` como testigo.** Desde `e2415cf` la fila se abre al
empezar. ¿Puede el cliente, antes de reintentar, preguntar si esta invocación ya
dejó fila? Reportar si hay una acción de la API que devuelva la última fila de
`CORRIDAS` sin correr nada, o si habría que agregarla.

`0.4` · **Cuántos reintentos hay realmente.** El loop va hasta 2. Reportar el peor
caso en corridas y en decks, y si lo observado —dos filas— es el peor caso o uno
intermedio.

`0.5` · **La segunda fila.** `232018` quedó sin llegar a la etapa 1. Reportar qué
dice esa fila, sin explicarla. Si un relanzamiento a los seis minutos ni siquiera
arranca, eso es un dato aparte.

**Reportar `0.1`–`0.5` y parar.**

---

## Parte A — el corte

Elegir **una** salida, con lo que `0.1`–`0.3` hayan mostrado:

- **Por tiempo**, si `0.1` y `0.2` se separan limpio: no reintentar un HTML que
  llegó después del umbral. Sólo si `0.2` dio un número; si no, esta salida es una
  suposición y se descarta.
- **Por testigo**, si `0.3` dice que se puede preguntar por la fila: si la
  invocación ya abrió corrida, no reintentar. Es la precisa, y es posible recién
  desde `e2415cf`.
- **Sin reintento para lo que escribe**, si las dos anteriores no cierran:
  reintentar sólo las acciones de lectura. El comentario del 04/08 ya lo pedía
  para efectos irreversibles.

**Actualizar el comentario del 04/08 en el lugar.** Hoy afirma algo que se midió
falso; dejarlo como está es dejar la premisa vencida para el próximo que lo lea.

---

## Parte B — comprobar

Una invocación que muera. **Una fila en `CORRIDAS`, un deck.**

Y una invocación que falle por transporte de verdad, si se puede provocar: que el
reintento siga funcionando para ese caso. Si no se puede provocar, decirlo — no
inventar la prueba.

---

## Parte C — limpiar los decks huérfanos

Ya sirvieron: probaron que el cliente relanza, y eso quedó documentado en
`BITACORA.md` con `47d3abb`. Se pueden borrar.

**Pero primero se anota el inventario, y recién después se borra.** El día que no
esté la carpeta, el conteo tiene que seguir existiendo en el repo. Borrar antes de
anotar destruye la única evidencia de un hallazgo que costó tres corridas.

`C.1` · **El inventario, al repo.** Una tabla en `BITACORA.md`: id del deck,
nombre, fecha de creación, y el `corrida_id` de `CORRIDAS` al que corresponde —o
`(huérfano)` si no hay fila. Commit antes de tocar nada.

`C.2` · **No se reserva ninguno.** Todos son de corridas que murieron, y en todos
los tokens ya fueron reemplazados: los que tenían valor dejaron de existir como
token y el mapa no se puede reconstruir desde el deck. Como referencia de tokens
no sirven.

El único que valía la pena mirar era el de la medición **34 con valor / 288
faltantes** (`jm-20260805-133836`). Ese número está vencido igual: se midió sobre
el denominador viejo de 195 y hoy son 172. Antes de borrar, **marcarlo como
superado donde se cita** —`HANDOFF_CODE.md` y `BITACORA.md`— para que nadie lo
vuelva a levantar como dato. La medición buena sale de la primera corrida que
termine, no de este deck.

`C.3` · **Borrar todos los huérfanos.**

`C.4` · **Cerrar el conteo.** Después de borrar, decks en la carpeta contra filas
en `CORRIDAS`. Si no cierra, reportarlo y parar — significa que hay decks que no
salieron de donde creemos.

---

## Cuándo está hecho

- Una invocación que agota los 6 minutos deja **una** fila y **un** deck.
- El comentario de `tools/api.js` dice lo que se midió.
- El inventario de los huérfanos está en `BITACORA.md` **antes** de que se borren,
  y la carpeta cierra contra `CORRIDAS`.
- El 34/288 quedó marcado como superado donde se cita.

## El reporte

1. Las mediciones `0.1`–`0.5`.
2. Qué salida elegiste y por qué descartaste las otras.
3. Cuántos decks borraste y si el conteo cerró.
4. Qué decisiones tomaste solo.
5. Qué premisa de este prompt resultó falsa, si alguna.
6. Los números raros, sin analizarlos.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
