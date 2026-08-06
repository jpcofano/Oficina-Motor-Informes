# Una invocación, una corrida — cortar el reintento y cerrar el conteo

**Un objetivo.** Que una invocación de `generarInforme` produzca una fila y un
deck. Con eso se cierra la limpieza de los huérfanos, que ya tienen su inventario
en `BITACORA.md` (`2bcdb4a`).

**Lo medido.** Escenario A confirmado por el reloj de Drive: grupos de hasta tres
decks separados por exactamente seis minutos, que es la invocación original más
los dos reintentos del loop. 29 decks, 17 filas, 18 huérfanos.

**El conteo envejece.** Eran 22 ayer y son 29 hoy. Cualquier número de decks que
este prompt mencione es de ayer; el bueno lo mide la Parte 0.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **Qué acciones escriben.** El cliente recibe la acción como primer
argumento posicional. Listar las acciones que expone `Api.gs` y cuáles tienen
efecto de escritura. **La lista, no una muestra**: si queda una escritora afuera,
el reintento sigue vivo justo donde importa.

`0.2` · **La contradicción que dejó el inventario.** Los grupos están separados
por seis minutos exactos, o sea que el reintento arranca **después** de que la
primera corrida terminó: son secuenciales. Pero `232018` se reportó muerta en
`abrirCorrida_` por timeout del servicio de Sheets *mientras la primera seguía
viva*. Las dos cosas no pueden ser ciertas tal cual están escritas. Reportar qué
dice la traza de `232018` sobre eso — **sin resolverlo**, es dato para después.

`0.3` · **El conteo de hoy.** Decks en la carpeta y filas en `CORRIDAS`, ahora. Y
si el inventario de `2bcdb4a` sigue completo o le faltan los de hoy.

`0.4` · **Los siete simultáneos del 04/08.** Están en el inventario. ¿Quedó
registrado en `BITACORA.md` qué se estaba corriendo esa tarde? Si no, decirlo: se
borran igual —el inventario los preserva como dato— pero no se explican.

**Reportar `0.1`–`0.4` y parar.**

---

## Parte A — el corte

**Lista blanca, no lista negra.** Reintentar sólo las acciones que `0.1` marcó
como lectura pura; todo lo demás, incluida cualquier acción nueva que aparezca
mañana, **no se reintenta por defecto**. Una lista negra deja pasar lo que nadie
se acordó de agregar, y ese es exactamente el modo de falla que estamos cerrando.

Cuando una acción no reintentable falla por transporte, el cliente **lo dice
claro**: qué pasó, y que no se reintentó a propósito porque la llamada escribe.
Que el usuario sepa que tiene que mirar si la corrida arrancó, en vez de suponer
que no pasó nada.

**Actualizar el comentario del 04/08 en `tools/api.js`.** Hoy afirma que el HTML
es transporte y que aparece sin patrón. El patrón es de seis minutos y es el
límite de ejecución. Dejarlo como está es dejar la premisa vencida para el
próximo que lo lea.

---

## Parte B — comprobar

Una invocación de `generarInforme`. **Una fila, un deck.**

El reintento tiene que seguir funcionando para una acción de lectura. Si no se
puede provocar una falla de transporte, decirlo — no inventar la prueba.

---

## Parte C — borrar los huérfanos

Sólo si la Parte B dio una fila y un deck.

`C.1` · Confirmar que el inventario de `2bcdb4a` cubre todo lo que se va a borrar,
con lo que midió `0.3`. Si aparecieron decks nuevos, sumarlos a la tabla y
commitear **antes** de borrar.

`C.2` · Borrar los huérfanos. Ninguno se reserva: en todos los tokens ya fueron
reemplazados y el mapa no se puede reconstruir desde el deck.

`C.3` · Marcar como superado el **34 con valor / 288 faltantes** donde se cita
—`HANDOFF_CODE.md` y `BITACORA.md`—: se midió sobre el denominador viejo de 195 y
hoy son 172.

`C.4` · Cerrar el conteo: decks contra filas. Si no cierra, reportarlo y parar.

---

## Cuándo está hecho

- Una invocación deja una fila y un deck.
- El comentario de `tools/api.js` dice lo que se midió.
- La carpeta cierra contra `CORRIDAS`, y el inventario de lo borrado quedó en el
  repo.

## El reporte

1. Las mediciones `0.1`–`0.4`.
2. La lista blanca: qué acciones quedaron adentro.
3. Cuántos decks borraste y si el conteo cerró.
4. Qué decisiones tomaste solo.
5. Qué premisa de este prompt resultó falsa, si alguna.
6. Los números raros, sin analizarlos.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
