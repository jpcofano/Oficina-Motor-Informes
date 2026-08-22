# Addendum · 2026-08-21 · Paso `2026-08-21_16` — después de la Parte 0

**Fecha del addendum:** 2026-08-21, con la Parte 0 ya corrida.
**Addendum a:** `docs/Prompts/2026-08-21_16_anclajes_en_el_panel.md` — **que no se edita.**

La Parte 0 pasó sus cinco verificaciones y nada hizo parar. Las Partes A, B, C y D siguen
como están, **con estos cuatro ajustes**.

---

## 1 · La Parte C se prueba contra datos reales · **afecta la Parte C**

El prompt asume que `ANCLAJE_PENDIENTE` puede estar vacía y pide un cartel para ese caso. **Ya
no es el camino principal:** la Parte 0 midió **dos filas reales, las dos sin `elegido`**, con
sus tres candidatos y puntajes 0,54 / 0,50 / 0,50.

- **El cartel de vacío se construye igual** — la hoja puede vaciarse y el estado tiene que ser
  legible. Deja de ser el caso de prueba y pasa a ser el borde.
- **La pantalla se prueba contra esas dos filas**, sin forzar nada ni correr el motor. Eso
  también prueba lo que el prompt no podía prometer: que los puntajes **ordenan** —el primero le
  saca 0,04 al segundo— y que la pantalla los muestra de forma que la diferencia se vea.

⭐ **Y hay algo que conviene mirar antes de pintar nada.** Las dos claves son
`almagro|2026-06-16|` y `educacion|2026-06-16|`, las dos `tipo = reunion`. `D-29` documenta **un**
caso vivo con esa fecha y ese puntaje: *"`Encuentro Temático Educación 16/06` (Almagro), puntaje
0,54 contra umbral 0,6"*. **Dos filas para lo que el plan registra como un caso.** Reportar si
son dos encuentros distintos o el mismo entrando por dos `nombre_buscado` — **no lo resuelvas
acá**, pero si es lo segundo, la pantalla mostraría el mismo encuentro dos veces y eso hay que
saberlo antes de construirla.

---

## 2 · La fila de `ESCRITORES.md` · **afecta la Parte B** · corrección

**La conclusión de la Parte 0 es correcta: la fila no se redacta, se regenera** con
`node tools/escritores.js`. El archivo lo declara en su encabezado y así entró
`escribirColumnaLaminas_` el 10/08. La Parte B del `_16` dice *"y la fila en `ESCRITORES.md`, en
el mismo commit"* — **léase «y el censo re-corrido en el mismo commit»**.

⛔ **Pero el chequeo previo que propone la Parte 0 no es el que hace falta, y conviene no
gastarlo.** `HOJAS_REGISTRO` en `tools/escritores.js` es la lista de las **hojas de registro**, y
`ANCLAJE_PENDIENTE` no es una: el Anexo se arma **por resta** —todo lo que el censo encontró y no
está en esa lista—, así que una hoja que no figure ahí **es exactamente la que va al Anexo**. Por
eso `ANCLAJE_PENDIENTE` ya está en el Anexo hoy. El caso de `LAMINAS` era **el inverso**: una
hoja que sí era de registro y faltaba en la lista, y por eso cayó al Anexo sin avisar.

**El chequeo que sí importa es que el censo resuelva la hoja de la función nueva.** El resolvedor
sigue la llamada a una función que devuelve una hoja y le busca un `getSheetByName('literal')` en
sus `return` — lo que no puede resolver cae a `(sin resolver)`, listado y no silenciado. En la
práctica: **si la función del panel obtiene la hoja llamando a `obtenerHojaAnclajePendiente_`,
resuelve.** Si la obtiene por otro camino, hay que verificar dónde cayó en el censo antes de dar
la Parte B por cerrada.

---

## 3 · El pendiente del score saturado tiene dos afirmaciones vencidas · **parte nueva**

**Parte E · Sonnet.** La Parte 0 midió que el pendiente de `PENDIENTES_consistencia.md` sobre el
score que satura en 1,00 dice dos cosas que hoy son falsas:

- *"La hoja está vacía —sólo el encabezado— desde que existe"* — **tiene dos filas.**
- *"Ningún caso cayó bajo umbral"* — **cayeron dos**, con su mejor candidato en 0,54.

Actualizar ese pendiente con addendum fechado —no editando el texto original— diciendo qué se
midió y cuándo. **El pendiente no se cierra**: lo que pide sigue abierto.

⚠ **Y escribir la distinción, que es lo que la Parte 0 hizo bien en ver:** son **dos huecos, no
uno**. El `_16` construye la mitad humana para los casos que **caen bajo el umbral**. Los que
**empatan arriba** —el modo de falla del `3347`— no pasan por `ANCLAJE_PENDIENTE` y por lo tanto
**no aparecen en esta pantalla**. Eso es del motor (`scoreMatchDigitalRdv_`, remitido a `D-29`) y
sigue fuera de alcance. Dicho así, para que nadie lea la pantalla nueva como que el circuito
quedó cerrado.

Parte E corre **después** de la Parte D. Commit propio.

---

## 4 · El matiz del caché, para cuando el botón exista · **no cambia nada ahora**

La Parte 0 midió que `cacheAnclaje_` **sí ahorra dentro de la misma ejecución**. La Parte A del
`_16` nombra un botón *"recalcular"* como salida si la pantalla no alcanzara, y lo deja fuera de
alcance — **sigue fuera**. Sólo queda anotado que ese botón, si además pinta la pantalla, paga
los ~50 s **una vez y no dos**. Va en el texto de la Parte A cuando se escriba la decisión, no
como trabajo.
