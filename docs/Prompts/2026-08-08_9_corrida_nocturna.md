# Corrida nocturna — 08/08

**Cómo se lee.** Cola de tareas independientes, en orden. **Ninguna espera una respuesta del
usuario.** Si una se traba, se anota y se pasa a la siguiente. Un commit por tarea con su ID
adelante. **Regla de dos intentos**: si algo falla dos veces, se anota y se sigue.

**Modelo:** Opus, effort alto. **Subagentes:** `verificador` antes de arrancar, sobre este archivo.

## Lo que NO se hace, pase lo que pase

- **No se toca ninguna plantilla.**
- **No se cablea ningún marcador nuevo** ni se renombra ningún token. `N3` es la única excepción
  acotada y está escrita como tal.
- **No se arranca el `_11`.** Las notas del orador ya se borraron, pero el sellado se corre
  despierto.
- **No se decide nada de diseño del `_6`**: ni la forma del registro, ni la política de huérfanas,
  ni el vocabulario de etapa. Eso lo decide el usuario con el reporte en la mano.
- **No se borra nada.** **Backup antes de escribir en la planilla**; si el backup falla, la tarea
  no se hace.
- **No se cierra ningún paso como verificado.**

---

## `N1` · Persistir el reporte de la Parte 0 del `_6`, antes que nada

**Es la tarea más importante de la noche.** El reporte vive hoy en una conversación y **nada de
eso está en el repo**. Si se pierde, se vuelve a medir desde cero.

Va a tres lugares distintos, y no es lo mismo:

1. **`BITACORA.md`** — entrada fechada con la medición completa: las cinco tablas (huérfanas por
   canal, cruce Eje × huérfana, vocabulario de etapa por solapa, columnas sin mapear, ids con más
   de una fila por canal), los conteos y cómo se midieron. **Con la fecha y hora de lectura**, que
   es lo que permite volver a citarlos sin que envejezcan en silencio.
2. **`docs/Prompts/2026-08-08_6.1_addendum_parte_0.md`** — el `_6` corrió su Parte 0, así que
   lleva addendum, no edición. Adentro, las siete correcciones que el propio reporte pide:
   - la etapa está en **`I` / `mail_tipo`**, ya mapeada, **no en `H` / `mail_campana`** —
     parsear `H` acertaría en el 1,1 % de las filas;
   - **`B` / `ID MailUp` no es clave durable**: 12 vacías y ~14 repetidos;
   - la clasificación de sección es **`X` / `Eje` sola** —100 % de cobertura, 9 valores—, no
     `U`–`X` como conjunto;
   - **no son dos filas, son 35**, y el caso es el 71,6 % de las filas M2 de mail;
   - **`pre` por ausencia se descarta también en mail**: el 58,3 % de las filas M2 no declara
     etapa y ese hueco **no significa pre, significa no cargado**;
   - **no existe un bucket `ambiguo`**: es un campo `motivoAmbiguo` dentro de `sinLink`;
   - **el orden de las partes se invierte** — hoy el problema no es que las etapas se mezclen,
     es que las filas no llegan, así que **B antes que A**.
3. **`PENDIENTES_consistencia.md`** — los dos hallazgos fuera de alcance, que son más grandes que
   el `_6` y no tienen dueño: **`Digital` con 71,1 % de huérfanas** (de 1297 filas matchean 38) y
   **`looker` ilegible entero**.

**Y hay una premisa falsa que hay que retirar de donde haya quedado escrita.** La `BITACORA` dice
que las cuentas de la lámina 6 *«no tienen filas para esa ventana»*. **La ventana no interviene**:
`digital` es `modo_periodo = snapshot` y `leerFuente` la ignora (`Union.gs:61-67`). No tienen
filas, sin más. Corregir como **addendum fechado**, sin editar lo ya escrito. El número era
correcto y el porqué no — que es exactamente el modo de falla que `CLAUDE.md` §4 describe.

---

## `N2` · ¿Qué base leen las láminas 2 y 3? **Es el bloqueo de la demo**

Los 40 tokens de las láminas 2 y 3 de `JM` —`mail_envios`, `imp_total`, `imp_google`, `imp_meta`,
`imp_prog`, `pauta_*`, `cc_*`, `ivr_*`, `contenidos_total`, `frecuencia`, y los mismos 19 con
prefijo `gcba_`— **¿de qué `base_id` salen?**

Reportar, token por token: si tiene fila en `MARCADORES`, con qué `base_id · solapa ·
campo_logico`, y si esa solapa es legible hoy.

**Por qué importa esta noche:** si leen de `looker`, el `_8` no puede cerrarse por cableado,
porque `looker` entero devuelve `«FALTA:fecha_periodo@looker/…»`. **El usuario tiene un prompt
listo para correr mañana que asume que ese trabajo es cablear tokens.** Si la respuesta es
`looker`, esa suposición es falsa y hay que decirlo antes de que arranque.

**Medir y reportar. No cablear nada.**

---

## `N3` · `looker`: por qué es ilegible, y qué le falta exactamente

Es `modo_periodo = filtrar` y sus solapas no tienen `fecha_periodo` en `MAPEO`. Para cada solapa
de `looker` registrada con `uso = fuente`: **qué columnas de fecha tiene, cuál sería la candidata
a `fecha_periodo`, y con qué evidencia** — nombre del encabezado, tipo de dato, cobertura, rango.

**Sólo se escribe la fila de `MAPEO` cuando hay una única candidata inequívoca**: una sola columna
de fecha, poblada, con el rango correcto. **Con backup previo y un commit propio por solapa.** Si
hay dos candidatas o la columna está a medio llenar, **se propone y no se escribe** — elegir mal
la columna de período devuelve la semana equivocada sin que ningún token falle, que es el error
del veto de los paneles.

Alternativa a evaluar y reportar, no a aplicar: si `looker` tuviera que ser `snapshot` en vez de
`filtrar`, decirlo con el motivo. Es una decisión del usuario.

---

## `N4` · El diagnóstico no puede ver la pisada. Arreglarlo

`cuentasMaestra` (`Union.gs:144`) **cuenta filas con id, no ids distintos**, y se publica como
`cuentas`. Hoy informa 840 donde los ids reales son 763: **comparar `filas_leidas` contra
`cuentas` no detecta que 77 filas de maestra desaparecen.**

Que el diagnóstico publique las dos cosas —filas con id **y** `Object.keys(porCuenta).length`— y
que **la diferencia entre ambas sea visible como tal**. Es un arreglo de reporte: **no cambia el
comportamiento de la unión**, que sigue pisando hasta que el usuario decida la forma.

Es seguro de noche justamente porque sólo hace ver un problema, no lo resuelve.

---

## `N5` · Las huérfanas salen del diagnóstico al informe de corrida

`huerfanas_en_canal` ya se calcula y hoy muere adentro del diagnóstico. Que la corrida las
reporte con nombre: **cuántas filas y cuántos ids se descartaron por canal, y los cinco mayores**.

Con los números medidos —`Directa Mail` 631 filas de 2162, `Digital` 922 de 1297— eso no es una
nota al pie: **es el 29 % y el 71 % de dos canales cayéndose sin que nadie se entere.** `R-19`
fijó el principio de que una fuente que dejó de traer es una falla; esto es hacerlo visible.

**Reportar, no descartar distinto.** Cambiar qué se descarta es diseño y espera al usuario.

---

## `N6` · La sección `m2` está vacía, y hay que dejarlo escrito

`SECCIONES` declara `m2` (orden 12, `agregado`, `familia_tokens = m2_`) y **`MARCADORES` no tiene
un solo marcador `m2_`** — 52 filas, cero. La sección existe y no publica nada.

**Anotarlo en `PENDIENTES` con los números al lado**, incluido el caso medido `2145-OCTVINGC` (24
filas, 528.825 enviados, desglose `M2` 159.127 + `M2 | Post` 369.698, ninguna `M2 | Pre`).

**No cablear ni un token `m2_`.** De qué fuente sale cada número es criterio del usuario, y
adivinarlo a las tres de la mañana es cómo se publica un número correcto sacado de las filas
equivocadas.

---

## Al final

Un resumen corto: qué tareas cerraron, cuáles se trabaron y con qué. **Y arriba de todo, la
respuesta de `N2`**, porque es lo primero que el usuario necesita leer para saber si el `_8` sirve
como está o hay que reescribirlo.
