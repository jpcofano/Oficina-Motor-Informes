# Paso 2026-08-22_22 — El agregado del temario, el encabezado del IVR, y la ventana de ocho días

**Estado:** no ejecutado.
**Reemplaza:** nada.
**Toca:** las hojas `SOLAPAS`, `PERIODOS`, `MARCADORES`; `docs/PENDIENTES_consistencia.md`.
**Un `.gs` sólo si la Parte 0 muestra que la Parte A no tiene forma declarativa.**

---

## Contexto — dos números que salen mal en silencio, y una ventana

**1 · `L-034` cuenta el universo equivocado.** Es la lámina de orden 5 de `jm`, el agregado
semanal. Sus seis marcadores —`ecv_encuentros`, `ecv_inscriptos`, `ecv_asistentes`, `ecv_barrios`,
`ecv_insc_*`— leen **toda la base `rdv`** con `dimensiones = ambito=jm`, que `DIMENSIONES_` traduce
a **`figura=Jorge Macri`**.

**Eso es un proxy del temario, no el temario.** Decisión del usuario, 22/08: *"el agregado tiene
que ser el del temario de reuniones"*. Cualquier reunión cuya fila de `rdv` no diga exactamente esa
figura **desaparece del total y el deck publica un número más chico que se ve bien**.

⭐ **Y el motor ya tiene el vínculo.** Cada ítem del temario viaja con su `fila_rdv` —está en
`itemsDeSeccion_`, con el comentario de que `ecv_*` y `enc_*` son independientes—. No falta un dato:
falta que el agregado se apoye en los ítems en vez de en un filtro sobre la base.

⚠ **Y `ecv_encuentros` está mal aparte:** su operación es **`CONTEO` sobre `inscriptos`**, así que
cuenta filas con inscriptos cargado, no reuniones. Con el universo corregido sigue estando mal.

**2 · `digital/Directa IVR` pierde una cuenta.** Medido en vivo el 22/08: `SOLAPAS.fila_encabezado
= 1` y **la fila 1 viva es una fila de datos coherente** —cuenta `2450-ENEJDGAG`, audiencia 12.049,
atendidos 11.592, escucha 4.731, marque1 49—. El `MAPEO` coincide exacto con la `firma_encabezado`
registrada, así que **lo que se movió es la hoja después del censo**. El motor pierde esa fila.

**3 · La ventana del equipo.** Decisión del usuario, 22/08: **`agosto_14_21` se da de alta y
conviven las dos opciones.**

---

## Parte 0 — verificación de premisas · **Sonnet** · sólo lectura · reportar y parar

**0.1 · ⭐ ¿Existe hoy agregar sobre los ítems de una sección?** Es lo que decide el tamaño de la
Parte A. El motor sabe **agregar sobre una base entera** y **resolver por ítem**; *sumar los ítems*
es una tercera cosa. Recorrer el resolvedor y reportar si hay algún mecanismo —una operación, un
`ambito` de sección, un `filtro` que reciba el conjunto de ítems— que ya lo haga.

- **Si existe** → la Parte A son celdas de `MARCADORES`.
- **Si no existe** → es mecanismo nuevo, y **la Parte A pasa a ser diseño**. Reportarlo y **parar
  ahí**: no empezar a construirlo dentro de este paso.

**0.2 · El radio de `ambito=jm`.** Está declarado para cuatro pares `base|solapa`, y **`gcba` se
define negándolo** (`D-33`). Reportar **todos** los marcadores que hoy usan `ambito=jm` o
`ambito=gcba`, agrupados por par. ⛔ Si el universo de `jm` cambia de definición, **la resta de
`gcba` deja de tener sentido** — reportar cuántos marcadores quedarían colgando de esa resta.

**0.3 · Cuánto se está perdiendo.** Sobre `agosto_14_20`: cuántos ítems tiene el temario, y cuántas
filas de `rdv` trae `figura=Jorge Macri` en esa ventana. **La diferencia es el tamaño del bug.** Si
es cero, el bug es latente y no urgente; si no, está publicando de menos hoy.

**0.4 · El IVR, la fila 1 y la 2.** Leer las dos filas vivas de `digital/Directa IVR` y reportar
cuál tiene los rótulos. Y **si el arreglo es `fila_encabezado = 2` o si la hoja crece por arriba
cada semana** — son dos cosas distintas: la primera es una celda, la segunda es que un valor
estático no sirve para esa solapa y hace falta otra cosa. **No decidir: reportar.**
Reportar además **todos** los marcadores que leen esa solapa: cambiar la fila los mueve a todos.

**0.5 · `PERIODOS`.** Confirmar que `agosto_14_21` no existe ya, y reportar **el texto exacto que
el selector del panel muestra hoy**, fila por fila. Con el alta van a ser tres opciones para dos
semanas, y una de ellas —la fila 9, `'vie 14/08 -- jue 20/08 (por defecto)'`— **produce un deck con
cero encuentros sin que nada falle**. Está anotada como P1 y **no se toca acá**: se reporta cómo
queda el selector para que el usuario decida.

**Reportar y parar.**

---

## Parte A — el agregado se ancla al temario · **Opus** · effort alto

Sólo si 0.1 encontró un mecanismo. **Si no lo encontró, esta parte no corre** y el paso entrega
0.1 como su resultado.

Los seis marcadores de `L-034` pasan a agregar **sobre los ítems del temario**, no sobre la base
filtrada por figura.

1. **La fuente de los números no cambia:** siguen siendo las filas de `rdv`. Lo que cambia es
   **cuáles** — las de los ítems del temario, que el motor ya conoce por `fila_rdv`.
2. ⚠ **`ecv_encuentros` deja de contar sobre `inscriptos`.** Cuenta reuniones. Si el mecanismo de
   0.1 no permite contar ítems, **reportarlo** en vez de dejarlo contando un campo.
3. ⛔ **`gcba` no se toca en este paso.** Si `jm` se ancla al temario, la resta de `D-33` queda con
   una definición distinta de la que negaba. **Anotarlo como pendiente abierto** con lo que midió
   0.2 — derogar o rehacer `D-33` es otra decisión.
4. **El control es contra el deck del equipo**, que ya está verificado por `sha256` en
   `docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md`: los inscriptos, asistentes y encuentros
   del agregado semanal. **No se corre para verificar: se reporta y el usuario corre.**

---

## Parte B — el encabezado del IVR · **Opus** · effort alto

Mueve números publicables: hoy se pierde una cuenta entera.

Con lo que 0.4 haya medido:

- **Si es `fila_encabezado = 2`**, es una celda de `SOLAPAS` — y **la `firma_encabezado` hay que
  re-registrarla en el mismo commit**, porque si no el testigo de `D-31` va a seguir marcando lo
  mismo o va a dejar de marcar lo que sí importa.
- ⛔ **Si la hoja crece por arriba cada semana**, un valor estático no sirve y **este paso no lo
  arregla**: se reporta y se decide aparte. Poner `2` hoy para que la semana que viene sea `3` es
  peor que dejarlo, porque parece resuelto.

**El control:** `verificarEncabezadosDeMapeo()` deja de reportar las 12 desalineadas de esa solapa
y **no aparece ninguna nueva**. Reportar el antes y el después.

⚠ **Y corregir la premisa del `_19` en el mismo commit:** decía que `ivr_audiencia` e
`ivr_llamados` podían estar leyendo la misma columna por compartir el rótulo falso `12049`. Es
falso —son dos columnas de la misma fila donde audiencia y llamados coinciden— y ya está medido.

---

## Parte C — `agosto_14_21` · **Sonnet**

Alta en `PERIODOS`: `agosto_14_21`, `2026-08-14` → `2026-08-21`.

⚠ **La nota tiene que decir tres cosas, con estas palabras:** que son **ocho días**; que
**contradice el Addendum 1 de `R-11`**, que fija siete inclusive; y **por qué existe igual** — el
equipo actualiza el archivo el viernes al mediodía y publica esa ventana.

**Decisión del usuario, 22/08: conviven las dos opciones.** `agosto_14_20` no se retira y `R-11`
no se deroga: el default sigue siendo viernes–jueves.

**Y en `PENDIENTES`**, la consecuencia: dos corridas de semanas consecutivas con la ventana de ocho
días **suman el mismo viernes dos veces**, sin que nada falle. Con lo que 0.5 reporte del selector
al lado.

---

## Fuera de alcance

- **Borrar o renombrar la fila 9 de `PERIODOS`.** Es config y la decide el usuario. 0.5 la reporta.
- **`gcba` y `D-33`.** La Parte A lo anota; rehacerlo es otro paso.
- **`sinLink` sin rastro, `FALTANTES` sin lector, el aviso de crudos que no distingue causas.** Los
  tres P1 siguen abiertos con sus salidas escritas.
- **El diagnóstico de anclaje.** Bajó de prioridad: el `-` del IVR que iba a explicar era de la
  corrida con el temario equivocado. En el testigo `jm-20260821-234927` los cuatro números están.
