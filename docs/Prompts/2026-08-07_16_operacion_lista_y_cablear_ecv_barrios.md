# La operación `LISTA` y el cableado de `ecv_barrios`

**Un objetivo.** Que la lámina 5 publique los barrios. **Esto sí toca `.gs`**, una fila de
`MARCADORES` y una corrida de verificación. Es el primer prompt de esta cadena que cambia el
deck en vez de escribir sobre él.

**La decisión del usuario que lo destraba, 07/08/2026:** **los cuatro barrios van en una sola
caja, separados por coma.** *"Una caja por barrio"* deja de ser la forma vigente y pasa a
deseable: la caja actual es una celda de tabla, `D-22` dice que el motor no agrega filas, y
esperar a la lámina nueva para publicar cuatro nombres no se paga. **Se corrige después, con su
propio prompt.**

Esto **reactiva el separador** que `C.1` del `_15` había dejado escrito y sin uso.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **Que `R-18` esté escrita y diga lo que este prompt va a implementar**: clave
normalizada, forma publicada desde el catálogo, lo que no matchea a `REVISAR`, orden alfabético,
sin truncar, cero filas a `sin_datos`, y la herencia del universo de la sección. **Si algún punto
no está, parar**: se implementa contra la regla, no contra este prompt.

`0.2` · **Cómo llega la operación al catálogo.** Ya está medido que `Comunas` está registrada
como `referencia` y que `buscarMapeo` exige `uso = 'fuente'`, así que **el camino es llamar a
`catalogoBarriosDesdeBase_`, no declararlo en `MAPEO`**. Reportar qué firma tiene hoy, qué
devuelve cuando la hoja no abre, y **con qué valores habría que llamarla desde una operación
genérica**: hoy su único llamador le pasa `'rdv'` literal y una constante de módulo. **Una
operación genérica no puede llevar `'rdv'` adentro** — reportar de dónde saldrían la base y la
solapa sin hardcodearlas.

`0.3` · **El contrato de una operación.** Firma de las seis de `OPERACIONES_`, qué recibe el
`ctx`, y qué forma tiene lo que devuelven (`{ ok, valor, traza, filas }`). **La nueva entra por
el mapa explícito, nunca por `FN:`** — es genérica, no un caso puntual.

`0.4` · **Qué hace el motor hoy con un valor `REVISAR`.** Si el estado existe, cómo se publica y
dónde aparece en el listado de faltantes. **Si no existe como estado, decirlo**: `R-18` lo pide y
habría que crearlo, y eso cambia el alcance.

`0.5` · **La fila que hay que escribir.** Qué columnas tiene `MARCADORES` hoy y con qué valores
quedaría la de `ecv_barrios`: `informe_id`, `base_id`, `solapa`, `campo_logico`, `operacion`,
`filtro`, `formato`. **Proponerla, no escribirla todavía.**

`0.6` · **Qué caja recibe el valor.** La celda de la tabla que hoy dice
`Barrios impactados: {{ecv_barrios}}`. Reportar si hay algo en esa celda que se rompa con cuatro
nombres separados por coma — largo, salto de línea, formato.

**Reportar `0.1`–`0.6` y parar.**

---

## Parte A — la operación

`A.1` · **Una operación genérica nueva en `OPERACIONES_`.** Hace lo que `R-18` fija y nada más:
deduplica por clave normalizada, resuelve la forma publicada contra el catálogo declarado, deja
afuera lo que no matchea, ordena alfabético y une con el separador.

`A.2` · **Ni la base ni la solapa del catálogo van adentro de la función.** Salen de la
configuración, por donde `0.2` haya reportado que corresponde. Una operación con `'rdv'` adentro
es una operación que sirve para un token y para ninguno más, y este proyecto mide eso.

`A.3` · **El separador y el catálogo son parámetros, no constantes.** La coma es el valor de hoy,
no una propiedad de la operación.

`A.4` · **Lo que no matchea el catálogo sale por la traza, no por el valor.** El token va a
`REVISAR` y los valores rechazados aparecen con su fila. **Cero filas da `sin_datos`.** Los dos
son estados distintos de "no hay nada que mostrar" y el motor los distingue a propósito.

`A.5` · **La traza dice qué pasó, no que salió bien:** cuántos valores entraron, cuántos
colapsaron por deduplicación, cuántos quedaron afuera por no matchear, y cuántos se publicaron.

## Parte B — la fila

`B.1` · Escribir la fila de `ecv_barrios` en `MARCADORES` con lo que propuso `0.5`, **con
`filtro = figura=Jorge Macri`**. `R-18` lo pide como parte del contrato: sin eso, la lista cuenta
los barrios de doce figuras, que es el error que se corrigió el 07/08.

`B.2` · **No pisar una celda que ya trae valor.** Si la fila existe o alguna celda tiene algo, se
reporta y se para.

## Parte C — verificar

`C.1` · **Por el camino del motor, no recalculando a mano.** `ecv_barrios` tiene que dar
**exactamente**: `Belgrano, Caballito, Retiro, Villa Urquiza`. Cuatro, en ese orden, con esa
grafía. **Si da otra cosa, parar y reportar** — cinco barrios significa que el filtro no llegó,
y un nombre distinto significa que el catálogo no está mapeando.

`C.2` · **Una prueba negativa, que es la que vale.** Correr la operación sobre un valor que **no**
esté en el catálogo y confirmar que **no se publica** y que aparece en el listado. Una operación
que sólo se probó con datos limpios no está probada.

`C.3` · **Que no se movió nada más.** Los seis marcadores del `_13` tienen que seguir dando lo
mismo.

## Parte D — dejarlo escrito

`D.1` · La operación nueva en el inventario que `CLAUDE.md` §7 señale como dueño de *"qué
operaciones tiene el motor"*. **Si no hay dueño declarado, decirlo**: es una pregunta que va a
volver con cada operación nueva.

`D.2` · En `CONFIG_INFORMES.md` §1.4: **la forma vigente es una caja con la lista separada por
coma**, y *"una caja por barrio"* queda como deseable con su bloqueo (`D-22`, celdas de tabla,
sin desborde). **Escribir que la decisión no se cayó: se pospuso, y por qué.**

`D.3` · La colisión que reportó Code: **tres ranuras `[MANUAL]` para cuatro barrios medidos**. Va
donde esté hoy la `[?]` de `ecv_barrio1-3`, **como dato nuevo, sin responderla**.

## Commits

Código y documentación en commits separados. `git push` después de cada uno. La fila de `B.1` no
es un commit: se anota en la bitácora con lo que midió `C.1`.

## Verificación

Se cierra cuando la lámina 5 publica los cuatro barrios, la prueba negativa de `C.2` pasa, y los
seis marcadores del `_13` no se movieron.
