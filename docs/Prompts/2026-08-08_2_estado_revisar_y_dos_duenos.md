# El estado `REVISAR` y los dos dueños que faltan

**Un objetivo.** Cerrar las dos cosas que la corrida nocturna dejó pedidas. **Toca `.gs`** para
lo primero; lo segundo es una tabla.

**Por qué ahora y no en la lista de pendientes:** hoy, si **todas** las filas de una lista se
rechazan, el motor dice `sin_datos`, y **el addendum de `R-18` lo prohíbe explícitamente**. No
es una mejora pendiente: es una regla escrita que el código no cumple. Hoy no se dispara porque
los cuatro barrios matchean, así que **se arregla antes de que un dato lo despierte**, no
después.

---

## Parte 0 — premisas (sólo lectura)

`0.1` · **Qué estados tiene hoy un marcador resuelto** —`ok`, `sin_datos`, `FALTA`, los que
haya—, dónde están declarados, y **quién los consume**: la barrida de faltantes, el listado, el
pintado. `REVISAR` tiene que entrar por donde entran los otros, no por un camino nuevo.

`0.2` · **Todos los lugares que hoy podrían devolver `REVISAR`** según `R-18`, no sólo la
operación de lista. Si la regla es general, el estado es general.

`0.3` · **Qué pasa hoy con un `REVISAR` en el deck.** Si un estado desconocido llega al pintado,
¿se publica el literal, se cae, queda `{{token}}`? **Es lo que decide si esto se puede soltar sin
mirar.**

`0.4` · **La tabla de `CLAUDE.md` §7**, entera, y **dónde caerían dos filas nuevas** sin pisar
una existente: *"¿qué operaciones tiene el motor?"* y *"¿cómo está configurada la herramienta?"*
—subagentes, `settings.json`, hooks—.

**Si `0.3` muestra que un estado desconocido rompe el pintado, parar y reportar antes de tocar
nada.** En cualquier otro caso, seguir.

## Parte A — el estado

`A.1` · **`REVISAR` entra como estado de primera clase**, por el mismo camino que los otros, con
su motivo en la traza. **No es un `sin_datos` con etiqueta**: afirma algo distinto —había datos y
ninguno se pudo publicar— y esa diferencia es todo el valor del estado.

`A.2` · **Qué se publica en la caja.** Lo que el proyecto ya hace con lo que no puede resolver:
algo visible que no se confunde con un dato. **No una cadena vacía y no un cero.** Seguir el
precedente de `«FALTA:token»` en vez de inventar una forma nueva.

`A.3` · **El caso que lo motiva, como prueba:** una lista donde **todas** las filas se rechazan
por no matchear el catálogo tiene que dar `REVISAR`, no `sin_datos`. Y **cero filas tras el
filtro sigue dando `sin_datos`.** Los dos casos en la misma prueba, o no está probado.

`A.4` · **Las pruebas positivas de la operación de lista se vuelven a correr enteras.** Modificar
la función que las pasó ayer es exactamente cuando se rompen sin que nadie mire.

## Parte B — los dos dueños

`B.1` · Las dos filas en `CLAUDE.md` §7, donde `0.4` diga que caen sin pisar nada.

`B.2` · **La de las operaciones apunta al documento que ya las lista**, si existe. Si no existe
ninguno, **la fila se escribe igual y dice cuál va a ser el dueño** — una pregunta sin dueño
declarado vuelve con cada operación nueva, y ésta ya volvió: la de lista es la séptima.

`B.3` · **Cerrar los dos pendientes** que la corrida nocturna abrió por esto en
`PENDIENTES_consistencia.md`, apuntando a las filas nuevas.

## Commits

Código y documentación separados. `git push` después de cada uno.

## Verificación

Se cierra cuando las dos pruebas de `A.3` pasan en la misma corrida y las de ayer siguen
pasando.
