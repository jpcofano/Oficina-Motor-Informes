# Corrida nocturna — 07/08

**Cómo se lee.** Cola de tareas independientes, en orden. **Ninguna espera una respuesta del
usuario.** Si una se traba, se anota y se pasa a la siguiente. Un commit por tarea con su ID
adelante. **Regla de dos intentos**: si algo falla dos veces, se anota y se sigue.

**Si `T2.4` o el prompt de `C-01` quedaron sin correr, van primero**, y esta cola arranca
después.

## Lo que NO se hace, pase lo que pase

- **No se toca ninguna plantilla.** La suspensión de `C-01` habilita, no ordena: escribir en la
  lámina 7 necesita antes el mecanismo de `D-22`, que no existe.
- **No se cablea ningún marcador nuevo** ni se renombra ningún token.
- **No se cierra ningún paso como verificado**: la verificación humana no se autoejecuta.
- **No se borra nada** de Drive ni ninguna fila de ninguna hoja. **Backup antes de escribir en
  la planilla**; si el backup falla, la tarea no se hace.
- **No se corre armonización** ni ninguna migración.

---

## `N1` · La premisa falsa que hay que retirar de todos lados

**Anoche quedó escrito que 20 de los 28 tokens de la lámina 7 no tienen fuente. Es falso, y el
dato estaba mapeado desde antes del 01/08.**

La confusión fue de nombre: *"Seguimiento Digital"* es el **nombre de la base `digital`**, y
además hay una **solapa** que se llama igual. La búsqueda se hizo sobre la solapa. **La solapa
`Digital` de esa misma base ya tiene mapeado** `dig_campana`, `dig_fecha_inicio`,
`dig_fecha_fin`, `dig_alcance`, `dig_impresiones`, `dig_views`, `dig_vtr`, `dig_clics`,
`dig_ctr`, `dig_frecuencia`.

Qué hacer:

  1. **Verificar** contra `MAPEO` vivo, no contra el snapshot, qué campos existen hoy y en qué
     solapa. El snapshot es del 01/08.
  2. **Corregir la afirmación donde haya quedado escrita** — `CONFIG_INFORMES.md` §1.8,
     `PENDIENTES_consistencia.md`, `HANDOFF_CODE.md`, y la entrada de anoche en `BITACORA.md`
     como **addendum fechado**, no editando lo ya escrito.
  3. **Reevaluar `R-14` con este dato.** Se escribió diciendo que no era aplicable por falta de
     fecha de fin. Si `dig_fecha_fin` sirve, **`R-14` es aplicable hoy** y hay que decirlo.
  4. **Reevaluar `N4` de anoche**: se mapearon `sd_fecha_fin` y `sd_estado`. Reportar si hacían
     falta o si quedaron como filas sin uso. **No borrarlas** — sólo decir qué son.

Y una línea, porque es el patrón que produjo el error: **una base y una solapa que se llaman
igual son una trampa de nombres**, y ya hizo perder una noche. Anotarlo donde el ruteo mande.

### `N1.b` · La fuente de la lámina 7 es la solapa `Digital` — decidido

**Decisión del usuario, 07/08/2026:** la tabla de la lámina 7 sale de `digital/Digital`. Es la
única de las tres candidatas declarada `fuente`, la única con las siete columnas —inicio, fin,
estado, alcance, impresiones, views, VTR— y ya está mapeada en `MAPEO` como `dig_*`.

Las otras dos quedan descartadas **con el motivo escrito**, para que nadie las vuelva a
proponer: `Digital 2026 acumulado` es `derivada` y no tiene VTR;
`CAMPAÑAS_DESGLOCE_DIGITAL` es `revisar`, no tiene alcance ni VTR y trae una fila por campaña
**y plataforma**.

Escribirlo donde el ruteo mande —la decisión editorial por informe tiene dueño— y verificar
contra `SOLAPAS` y `MAPEO` **vivos**, no contra el snapshot del 01/08, que los `dig_*` que la
tabla necesita están mapeados hoy. Los que falten se reportan; **no se cablea ninguno**.

**Una medición que sí queda, y va al reporte, no a la cola:** `Digital` tiene ~1295 filas y
`Digital 2026 acumulado` ~683. Sobre la ventana del informe, **cuántas campañas devuelve
`Digital`** y si alguna aparece repetida. Si repite, la tabla necesita deduplicar y eso es
trabajo; si no, no hay nada que hacer y queda dicho.

## `N2` · Por qué no tiene valor cada token, contado

Los 143 sin valor de la última corrida, clasificados **por causa**, con el conteo de cada una:
sin fila en `MARCADORES` · fila incompleta · campo sin mapear · fuente con cero filas tras el
filtro · declarado `[MANUAL]` · operación inexistente · sección sin ítems · **sin clasificar**.

**Es medición, no vista.** No construir ninguna hoja ni panel: el número por sí solo dice dónde
está el trabajo que queda, y hoy nadie lo tiene.

Lo que no encaje va como *sin clasificar* con su nombre. **No inventar una causa para que la
tabla cierre.**

## `N3` · `T2.6` — por qué tres grupos recortan a cero filas

IVR (0 de 57 sobre `Inicio`), `sd_pauta_*` y `Digital`. Ya está decidido que los agregados van
por la ventana del informe, viernes a jueves; lo que falta es **medir por qué esa ventana da
cero**: si las fechas de la fuente caen fuera, si el campo de fecha que filtra no es el que
manda, o si el filtro compara texto contra fecha.

**Medir y reportar.** Si el arreglo es evidente y local, hacerlo; si toca la semántica de qué
fecha gobierna, **anotarlo y seguir** — eso es decisión.

## `N4` · `T2.7` — el instrumento

`marcarEtapa_` se traga sus excepciones **y las cinco marcas se pisan en la misma celda**, así
que una fila puede decir que la corrida no arrancó cuando llegó a la etapa 4. Es lo único que
nos dice qué pasó cuando algo sale mal, y hoy puede mentir.

Que cada marca sobreviva a la siguiente y que una excepción del instrumento **no se coma en
silencio**.

## `N5` · `T2.9.4` — retirar `VALOR_STATUS_REALIZADA_`

Filtra dos veces por lo mismo desde que la precondición pasa por la lista blanca de `D-21`. La
otra mitad de `T2.9.4` ya se cerró el 04/08. **Control obligatorio: los cinco anclajes siguen
dando lo mismo antes y después.**

## `N6` · `T2.9.2` — las dos ventanas a `CONFIG`

La corta es hoy una constante de módulo; la ampliada no existe. Las dos a `CONFIG` con su
helper, siguiendo la forma de `umbral_anclaje_reunion`. **El default replica el valor de hoy**:
este paso no cambia ningún comportamiento, sólo saca el número del código.

## `N7` · `T2.5` — las operaciones que faltan

Una que devuelva **lista** y no número, `DISTINCT` para `ecv_barrios`, y el formato de
porcentaje sin signo. Cada token sin operación es un `«FALTA:»` garantizado.

**Empezar por el formato de porcentaje**, que es el más chico y está medido. Lo que necesite
decidir qué devuelve una lista cuando hay cero filas, **anotarlo y seguir**.

---

## El reporte

Una tabla primero: **tarea · hecha / salteada / falló · commit**. Después:

1. **`N2`, el conteo por causa.** Va arriba de todo: es el número que dice cuánto falta.
2. Qué encontró `N1`, y si `R-14` pasó a ser aplicable.
3. Qué quedó pendiente de verificación humana y cómo se prueba cada cosa.
4. Qué se salteó y por qué.
5. Qué decisiones tomaste solo.
6. Qué premisa de este prompt resultó falsa.
7. La cola de lo que necesita al usuario, junta en un solo lugar.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
