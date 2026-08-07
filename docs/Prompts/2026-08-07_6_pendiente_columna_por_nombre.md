# Anotar el pendiente: `MAPEO` resuelve la columna por letra, sin nombre

**Un objetivo.** Documentación, no código. **No se implementa nada en esta corrida.**
Se agrega un ítem a `docs/PENDIENTES_consistencia.md`, que es el dueño de la pregunta
"¿qué inconsistencia sigue abierta?" (`CLAUDE.md` §7).

**Qué se quiere anotar.** `MAPEO.columna` guarda una **letra** (`K`, `E`, …) y se resuelve
posicionalmente. Si alguien inserta o mueve una columna en una solapa `fuente`, el mapeo
sigue apuntando a la misma posición y devuelve **otro dato** — un número plausible y
equivocado, que es el modo de falla caro del proyecto. La forma propuesta:
**buscar por nombre de encabezado, con fallback a la letra**, y que el fallback quede
dicho en la traza.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **Que la resolución es posicional y por dónde pasa.** Greppear
`columnaLetraAIndice_` y cualquier otra vía que convierta `MAPEO.columna` en índice.
Reportar la lista de llamadores con nombre de función — **no `archivo:línea`**. Si hay más
de un camino, decirlo: el pendiente tiene que nombrar todos.

`0.2` · **Que no está ya anotado.** Greppear `docs/PENDIENTES_consistencia.md` por
`por nombre`, `letra`, `posicional`, `corrimiento`, `columnaLetraAIndice_`.
**Si ya existe un ítem que cubre esto, no se agrega otro: se reporta cuál es y se para.**

`0.3` · **Contra qué NO es lo mismo.** El ítem `P1 · Firma de encabezados` propone guardar
la firma y comparar contra la corrida anterior. Decir en una línea qué cubre cada uno y si
uno hace innecesario al otro. Si la conclusión es que sí, **se reporta y se para** — el
resultado correcto sería ampliar el ítem existente, no crear uno nuevo.

`0.4` · **Que no deroga nada.** Greppear `docs/PLAN.md` y `docs/REGLAS_NEGOCIO.md` por una
`D-NN` o `R-NN` que fije la columna por letra como decisión tomada. Si la hay, citarla por
ID; el ítem nuevo tiene que decir que la superseder es un paso aparte, no darla por
superseded.

`0.5` · **Cuál es el principio que lo respalda, verificado.** El ítem va a decir que el
fallback no puede ser silencioso. Buscar el `D-NN` que ya declara que nada entra ni se
excluye en silencio y **citarlo por su ID real**. Si no existe tal decisión, decirlo: el
ítem se escribe sin cita.

`0.6` · **Superficie, medida.** Cuántas filas tiene hoy `MAPEO` en la planilla viva y
cuántas de ellas tienen `columna` cargada. Es el tamaño del trabajo que el pendiente
describe. Si no se puede medir en esta corrida, decir eso — **no estimar**.

**Reportar `0.1`–`0.6` y parar.**

---

## Parte A — el ítem

`A.1` · **Dónde va.** `docs/PENDIENTES_consistencia.md`, sección **"Sigue abierto"**, con
la forma `### <prioridad> · <título>` que usa el resto del archivo. La prioridad la fija el
encabezado del propio archivo: `P0` = puede meter un número mal. Usar `P0` salvo que
`0.1`–`0.6` muestren que el riesgo no es alcanzable hoy; si es así, `P1` y decir por qué.

`A.2` · **Qué dice.** Cuatro cosas, sin relleno:

- **Qué pasa hoy**, con los llamadores que devolvió `0.1` nombrados por función.
- **Por qué importa**: una columna insertada corre el mapeo y el motor devuelve un número
  de otra columna sin fallar. No hay síntoma.
- **La forma propuesta**: resolver por **nombre de encabezado**, normalizado con la forma
  que ya fija `R-10` (colapsar espacios y `trim()`, preservando mayúsculas y acentos), y
  **caer a la letra** sólo si ese nombre no aparece en la fila de encabezado. **El fallback
  se reporta en la traza del marcador** — con la cita de `0.5` si existe.
- **Qué lo destraba**: de dónde sale el nombre. Nombrar las opciones que el repo ya
  permite —columna nueva en `MAPEO`, o derivarlo de `SOLAPAS.fila_encabezado` en el
  momento de resolver— **sin elegir una**: elegir es el prompt que viene después, no éste.

`A.3` · **Lo que NO hace este prompt.** No toca `.gs`. No agrega columnas a ninguna hoja.
No escribe en `PLAN.md`. Si al redactarlo aparece algo que merece prompt propio, se anota
en el reporte y se sigue.

`A.4` · **Commit.** Uno solo, de documentación. Mensaje sin `✅` (no hay verificación
humana de un paso acá). `git push` después del commit.

---

## Verificación

Se cierra cuando el usuario lee el ítem en `docs/PENDIENTES_consistencia.md` y confirma
que dice lo que tiene que decir. Reportar y parar; no seguir con la implementación.
