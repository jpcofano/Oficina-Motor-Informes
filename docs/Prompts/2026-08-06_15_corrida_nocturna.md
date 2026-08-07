# Corrida nocturna — avanzar sin pedir permiso

**Cómo se lee este prompt.** No es un paso: es una **cola de tareas independientes**. Se hacen
en orden. **Ninguna espera una respuesta del usuario.** Si una se traba, se anota y se pasa a
la siguiente — no se pide permiso, no se para la corrida entera.

**Un commit por tarea**, con su ID adelante. Si una tarea no se pudo hacer, no hay commit y
hay una línea en el reporte.

---

## Lo que NO se hace esta noche, pase lo que pase

Cada una de éstas espera una decisión del usuario. Si una tarea parece necesitarlas, **la
tarea se saltea**:

- **No se toca la plantilla** de JM ni de ningún informe, ni sus tokens, ni sus tablas
  (`C-01`: la plantilla es del equipo). El usuario decidió **qué** hay que cambiar en la
  lámina 7 (`N9`), pero el repo **no tiene una sola llamada de escritura de tablas de
  Slides**: la primera no se estrena de noche y sin nadie mirando. Esta noche se escribe la
  especificación; el archivo lo toca una persona.
- **No se renombra ningún token** en ningún lado. Los nombres nuevos se **proponen** en `N9`.
- **No se cambia `familia_tokens`** de ninguna sección, ni se activa o desactiva ninguna.
- **No se cablea ningún marcador nuevo** en `MARCADORES`.
- **No se cierra ningún paso como verificado**: la verificación humana no se puede
  autoejecutar. Todo lo de código queda *pendiente de verificación*.
- **No se corre armonización** ni ninguna migración de plantilla.
- **No se borra nada** de Drive ni ninguna fila de ninguna hoja.

**Regla de dos intentos:** si una tarea falla dos veces, se anota qué falló y se sigue con la
próxima. No se improvisa un rodeo.

**Antes de cualquier escritura en la planilla, backup.** Si el backup no se puede hacer, la
tarea no se hace.

---

## La cola

### `N1` · `T2.2.3` — el deck entero, antes y después del caché

Es el control que falta del cambio de `T2.2.2`: un caché que sirve una lectura vieja devuelve
un **número plausible y distinto**, que es el modo de falla caro del proyecto. `T2.2.2`
comparó marcador por marcador; esto compara **el deck**.

Generar un deck **fuera de la carpeta de salidas** y comparar sus valores contra los de la
corrida `jm-20260806-222554`, que ya corrió con el caché puesto y está verificada a mano. Si
no hay forma de leer los valores de aquella, decirlo y comparar contra dos corridas nuevas
consecutivas — dos corridas iguales tienen que dar lo mismo.

Diferencia esperada: **cero**. Si aparece alguna, **ésa es la noticia** y se reporta arriba de
todo. El deck de prueba a la papelera al terminar. **Que no toque `FALTANTES`** si se puede
evitar; si no se puede, dejar dicho que lo pisó.

### `N2` · `T2.1.2` — el cierre se escribe siempre

Hoy el cierre corre cuando la corrida **se corta sola**. Si adentro salta una excepción
inesperada, la fila queda abierta otra vez y volvemos al problema que `T2.1.1` vino a
resolver. Que el cierre corra también por esa vía, con lo que haya alcanzado a hacer y el
motivo real anotado — **distinguible del corte por tiempo**, como ya se distingue el token
crudo.

Queda pendiente de verificación humana. Escribir en el reporte **cómo se prueba**, para que el
usuario lo corra.

### `N3` · `R-14` — la regla de solape

La midió la Parte 0 de hoy: **no existe**, y `R-14` es el próximo libre. Escribirla en
`REGLAS_NEGOCIO.md`, fechada, con *decisión del usuario, 06/08/2026* como origen:

> Entra toda campaña cuyo rango de fechas se solape con la ventana del informe — alguno de sus
> días entre inicio y fin cae dentro de la semana. No es "empieza en la ventana" ni "termina
> en la ventana". Fuente: la solapa `Seguimiento digital` de la base `digital`.

**No depende de cómo se llamen los tokens**, por eso entra esta noche. Anotar al lado que hoy
**no es aplicable**: falta mapear `Fecha de fin`.

### `N4` · `MAPEO` — `Fecha de fin` y `Estado`

Las columnas M y N de `Seguimiento digital` existen y no están en `MAPEO`. Sin `Fecha de fin`
no hay rango y `R-14` no se puede aplicar.

Agregarlas **por el camino del seed**, no a mano en la hoja, siguiendo el nombre lógico de la
que ya está (`sd_fecha_inicio`). Si el camino del seed no cubre este caso, **la tarea se
saltea y se anota** — una fila de `MAPEO` sin cobertura de seed es un hueco conocido del
proyecto y no se agregan más.

Mapear no es cablear: **ningún marcador nuevo**.

### `N5` · El hallazgo de las tablas

*El motor lee tablas pero no sabe agregarles filas.* `piezasDeTextoDeSlide_` baja a tablas;
no hay una sola llamada de inserción de filas de Slides en el repo, y la plantilla tiene
tablas en seis láminas. Toda tabla es hoy de **filas fijas**.

Es un hallazgo propio, no una nota adentro del `P2`. Va donde `CLAUDE.md` §7 mande, con lo
medido y con la consecuencia: una fila de más no entra, y una de menos queda como
`«FALTA:token»`.

### `N6` · El `P2` de `comunicaciones_post`, con la causa precisa

Ya no pregunta si la sección sobra. La causa medida es otra: **la lámina 7 usa `camp1`–`camp4`
y la sección declara familia `post_`; en las 22 láminas no hay un solo token `post_`.**

Dejar las tres salidas escritas **sin elegir ninguna** —renombrar en la plantilla, cambiar la
familia de la sección, o que la reclame otra sección— y marcar que **está esperando decisión
del usuario**.

### `N7` · `TOKENS.md` contra la plantilla viva

`TOKENS.md` numera "Comunicaciones post" como la 10, y la 10 viva es "Clics", escondida.
Regenerar el inventario **desde la plantilla viva**, con la fecha de la medición arriba, y
dejar dicho contra qué se numera. Lo que no se pueda reconciliar se marca como discrepancia,
**no se borra**.

### `N8` · Los dos `P2` chicos de la corrida

- `excluida undefined — etapa = "pre"`: el mensaje no resuelve el nombre del ítem. Arreglarlo
  si es un arreglo chico y local; si abre algo más grande, anotarlo y seguir.
- El aviso de láminas escondidas dice "lámina 14" y en la plantilla es la 10: **numera contra
  el deck expandido y no lo dice**. Que lo diga.

### `N9` · Las siete decisiones del usuario sobre la lámina 7

Tomadas el 06/08. Van a `CONFIG_INFORMES.md` §2.3, que es el dueño de las decisiones
editoriales por informe, y **reemplazan** lo que hoy dice ahí (`post_camp1-3` y
`post_estado1-3` como `[MANUAL]`, más dos `[?]`).

1. **La plantilla se actualiza a lo que se publica.** Las columnas pasan a ser
   **Campaña · Estado · Período · Alcance · Impresiones · Vistas · VTR**. Se van `Formato` y
   `Habitantes`.
2. **Cuatro filas por lámina**, y si hay más campañas **se repite la lámina** — ver `N10`.
3. **Cuatro ranuras.**
4. **Un token por celda**: 7 columnas × 4 filas = **28 tokens** en la tabla. Los que ya
   existan se reusan; los que no, se crean.
5. **Los nombres los pone la convención del repo.** Y ahí hay un problema que este punto tiene
   que resolver antes de proponer nada: conviven **dos** formas —`post_estado1`
   (atributo + índice) y `camp_env1_*` (índice + atributo)— y 28 tokens nuevos con la forma
   equivocada son 28 renombres después. **Elegir una, con el motivo escrito**, y proponer las
   28 en una lista lista para copiar.
6. **El benchmark de abajo de la tabla** sale, o queda con `xx` fijo. **Sin token.**
7. **`Estado`** lleva el valor que la campaña tenga en ese momento: la columna `N` de
   `Seguimiento digital`, la que `N4` manda mapear.

**No se cablea ninguno en `MARCADORES` esta noche.** La lista de 28 y el mapeo de sus
columnas son la entrada del paso que venga después.

### `N10` · Paginar de a cuatro es una capacidad que el motor no tiene

*"Si hay más, repite la lámina"* no es lo que hace hoy `duplicarBloquesRepetibles_`: duplica
**una lámina por ítem**. Lo que hace falta es **una lámina cada cuatro ítems**, con las
ranuras sobrantes de la última en blanco.

Es un sub-paso propio del Tramo 2. **Escribirlo en `PLAN.md` §2 con el próximo ID libre**
—greppeado, no inventado— y dejar dicho de qué depende. **No implementarlo.** Anotar también
que la lámina 7 no puede funcionar sin esto: con cinco campañas, la quinta no entra.

---

## El reporte, a la mañana

Una tabla primero: **tarea · hecha / salteada / falló · commit**. Después, y sólo para las que
lo necesiten:

1. **Si `N1` encontró alguna diferencia de valores** — va arriba de todo, antes que nada.
2. Qué quedó pendiente de verificación humana y cómo se prueba cada cosa.
3. Qué se salteó y por qué.
4. Qué decisiones tomaste solo.
5. Qué premisa de este prompt resultó falsa.
6. **La cola de lo que necesita al usuario**, junta en un solo lugar.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
