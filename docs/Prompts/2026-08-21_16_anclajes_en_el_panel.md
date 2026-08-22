# Paso 2026-08-21_16 — Revisar y confirmar anclajes desde el panel

**Estado:** no ejecutado.
**Reemplaza:** nada.
**Toca:** `PanelBackend.gs`, `Panel.html`, `docs/ESCRITORES.md`, `docs/PROCESO_SEMANAL.md`.

---

## Contexto — por qué esto es lo que falta, y no es una pantalla más

`D-29` (`PLAN.md`) dice, con el usuario como dueño: *"Un encuentro que no alcanza el umbral de
anclaje lo resuelve el usuario, no el motor"*, y sigue: *"**La salida es que el usuario confirme
o corrija el anclaje, y eso es una capacidad del front**, no del motor. El motor ya hace su
parte"*. Cierra con *"**hasta que el front exista**, el encuentro se lista en `excluidos`"*.

Este paso es ese front. **No hay nada que diseñar en el motor**: `anclarEncuentros` ya devuelve
las tres listas (`encuentros`, `bajaConfianza`, `sinLink`) con puntaje y umbral;
`ANCLAJE_PENDIENTE` ya guarda el top-3 con sus puntajes y la columna `elegido`; y
`anclajeYaConfirmado_` ya la lee y **no vuelve a preguntar** una vez completada.

Lo que hay hoy en el panel: `FLAGS.anclajes = false` y un cartel que dice que está diseñado y no
funciona desde ahí.

⚠ **La decisión que este paso tiene que tomar bien es de dónde salen los datos de la pantalla**,
y está en la Parte B. Elegir mal cuesta 50 s por apertura de pestaña.

---

## Parte 0 — verificación de premisas · **Sonnet** · sólo lectura · reportar y parar

**0.1 · El backend que ya existe.** Confirmar contra el código: que `anclarEncuentros` devuelve
las tres listas con `score` y `umbral`; que `ANCLAJE_PENDIENTE` se crea con los nueve
encabezados; que `registrarAnclajePendiente_` **no pisa** una fila con `elegido` cargado; y que
`anclajeYaConfirmado_` es lo que hace que no se repregunte. Reportar cualquier diferencia con
esta descripción — está escrita de memoria de lectura, no medida.

**0.2 · El costo, que es la premisa dura.** Reportar cuánto tarda `anclarEncuentros` según lo
medido (`AUDITORIA_tiempos_2026-08-21.md` y los comentarios de `Generador.gs`) y confirmar que
`cacheAnclaje_` es **por ejecución**, no entre ejecuciones — o sea que una llamada desde el panel
lo paga entero cada vez.

**0.3 · Qué hay hoy en la hoja.** Contar las filas de `ANCLAJE_PENDIENTE` en la planilla viva:
cuántas con `elegido` cargado y cuántas sin. Si está vacía, decirlo — cambia qué se puede probar
sin correr nada.

**0.4 · El camino de escritura.** `ANCLAJE_PENDIENTE` está en el **Anexo** de `ESCRITORES.md`
(hojas que no son de registro), con tres escritores, todos de `Union.gs`. Confirmarlo. Un
escritor nuevo desde el panel necesita su fila ahí (`CLAUDE.md` §7) — reportar si el Anexo tiene
la misma exigencia que el cuerpo o no.

**0.5 · Los pendientes que ya tocan esto.** Grepear `PENDIENTES_consistencia.md` por
`ANCLAJE_PENDIENTE` y reportar qué dice cada acierto. Hay al menos uno sobre que el circuito
completo nunca se probó y otro sobre que el score saturó en 1,00. **Si alguno contradice este
paso, parar.**

**Reportar y parar.**

---

## Parte A — de dónde salen los datos de la pantalla · **Opus** · effort alto

**La decisión.** La pestaña puede armarse de dos formas y **no son equivalentes**:

- **Correr `anclarEncuentros` al abrir.** Da el estado de hoy, y cuesta ~50 s por apertura,
  cada vez, porque el caché es por ejecución. Una pestaña que tarda 50 s en pintar no se usa.
- **Leer `ANCLAJE_PENDIENTE`, que ya está escrita.** Instantánea. Lo que muestra es lo que dejó
  **la última corrida**, no lo de ahora.

**Ir por la segunda, y decir en pantalla de cuándo es lo que se está mirando.** El motivo es que
la hoja no es un caché: es el registro que el propio motor consulta con `anclajeYaConfirmado_`
antes de anclar. Confirmar ahí es confirmar **exactamente lo que la próxima corrida va a leer** —
no una foto de algo que después se recalcula.

⚠ **Y el límite hay que escribirlo, no dejarlo implícito:** un encuentro que todavía no pasó por
ninguna corrida **no está en la hoja** y por lo tanto no aparece en la pantalla. La pestaña
muestra lo pendiente de confirmar, **no todo lo anclable**. Si eso no alcanza, la salida es un
botón explícito *"recalcular"* que sí paga los 50 s — **no** hacerlo en cada apertura.

Escribir la decisión y su límite. Es lo que gobierna las Partes B y C.

---

## Parte B — el backend · **Opus** · effort alto

Dos funciones en `PanelBackend.gs`.

**B.1 · Leer.** Una función que devuelva las filas de `ANCLAJE_PENDIENTE` con: `tipo`,
`nombre_buscado`, los tres candidatos con su puntaje, `elegido`, y el `umbral` vigente de
`CONFIG`. Separar **pendientes** (sin `elegido`) de **confirmadas**, porque son dos cosas
distintas en pantalla. Si la hoja no existe, devolver vacío **sin crearla** — leer no escribe.

**B.2 · Confirmar.** Una función que escriba `elegido` en la fila de un `(tipo, nombre_buscado)`.
Reglas:

1. **La clave es `(tipo, nombre_buscado)`**, la misma que usa `indiceAnclajePendiente_`. No la
   posición de fila: el panel puede tener una lista vieja y la fila puede haberse movido.
2. **El valor tiene que ser uno de los tres candidatos de esa fila, o vacío para desconfirmar.**
   Cualquier otra cosa se rechaza con motivo. Un `elegido` que no está entre los candidatos hace
   que el motor ancle contra algo que nadie puntuó — que es el modo de falla que `D-29` viene a
   cerrar, entrando por la puerta nueva.
3. **Desconfirmar tiene que ser posible.** Si `elegido` sólo se puede poner y no sacar, un error
   de tipeo obliga a ir a la planilla, y el panel deja de ser el camino.
4. **No inventa filas.** Si la clave no está en la hoja, falla con motivo.

**Control positivo, obligatorio.** Sobre las funciones puras del caso: un `elegido` que no está
entre los candidatos se rechaza; uno que sí está se acepta; vacío se acepta; una clave inexistente
falla. Los cuatro asertos.

**Y la fila en `docs/ESCRITORES.md`**, en el mismo commit — es un escritor nuevo de una hoja que
hasta hoy sólo escribía `Union.gs`.

---

## Parte C — la pantalla · **Sonnet**

En `Panel.html`, la pestaña `Anclajes`, con `FLAGS.anclajes = true`.

- **Una fila por anclaje pendiente**, con el nombre buscado, los tres candidatos y su puntaje, y
  el umbral al lado para que el puntaje signifique algo.
- **Un botón por candidato** para elegirlo, y una forma de desconfirmar.
- **Las confirmadas, listadas aparte** y visibles: son las decisiones que la próxima corrida va a
  respetar sin volver a preguntar, y esconderlas las vuelve invisibles.
- **Cuándo es lo que se está mirando**, dicho en pantalla — es lo que la Parte A decidió.
- **Si la hoja está vacía**, el cartel tiene que decir *por qué* puede estarlo (ninguna corrida
  todavía, o nada por debajo del umbral), no un "no hay datos" que se lee como error.

**No tocar la pestaña `Generar`.** El `[object Object]` es del `_15` Parte D.

---

## Parte D — la documentación · **Sonnet**

`docs/PROCESO_SEMANAL.md`, que es el dueño de "¿qué hace una persona para sacar el informe?":

**D.1** — la confirmación de anclajes pasa de **[falta]** a **[hoy]** en el camino del usuario, con
su límite escrito (lo de la Parte A).

**D.2 · Y la sección final está vencida.** *"Lo que el panel tiene que ser"* dice que las cinco
funciones de `PanelBackend.gs` están *"todas vacías"* y que `Panel.html` es *"un stub con tres
TODOs"*. **No es cierto desde hace varios pasos**, y su tabla de cuatro pantallas no es la del
panel que existe (hoy son `Generar`, `Anclajes`, `Corridas`, `Próximo`). Va **addendum fechado**,
no edición del texto original (`CLAUDE.md` §7). Medir contra el archivo antes de escribir: la
descripción de arriba es de una lectura, no de un censo.

**D.3** — sacar *"Confirmar el anclaje"* de la lista de `Próximo` en `Panel.html`.

Y anotar en `PLAN.md`, como addendum a `D-29`, que la cláusula *"hasta que el front exista"* dejó
de aplicar, con la fecha.

---

## Fuera de alcance

- **Recalcular el anclaje desde el panel.** La Parte A lo nombra como salida si hiciera falta; no
  se construye acá.
- **El umbral.** `D-29` es explícito: no se toca por un caso.
- **`scoreMatchDigitalRdv_`.** Mismo motivo, mismo `D-29`.
- **La pantalla de `SIN CONFIRMAR` de campañas**, que es el otro paso humano y es otro circuito.
