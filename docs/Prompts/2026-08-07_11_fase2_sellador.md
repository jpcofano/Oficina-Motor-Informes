# Fase 2 — `sellarPlantilla`: la hoja `LAMINAS` y el ancla, en una sola operación

**Un objetivo.** Implementar la Fase 2 de `D-23`. **Es la primera corrida que escribe sobre
una plantilla.** Va con backup y con Parte 0 completa.

**Lo que hace, en una línea.** Por cada lámina sin ancla: toma el siguiente id de `LAMINAS`,
escribe la fila, y **anexa** `#lamina: L-NNN` a las notas del orador.

**Lo que NO hace, y está decidido, no pendiente:** no deduce secciones, no escribe
`#seccion:`, no toca `familia_tokens`, no esconde ni muestra láminas, no mueve ni reescribe
cajas, no inserta ni borra láminas, y **nunca hace `setText` sobre las notas**.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **La autorización, releída antes de escribir.** `docs/REGLAS_NEGOCIO.md`, suspensión
acotada de `C-01` y sus dos addenda: transcribir qué autoriza hoy y qué exige (backup previo
obligatorio, aborto si el backup falla). **Si algo de lo que este prompt hace no está
autorizado, parar y reportarlo** — la autorización manda sobre el prompt.

`0.2` · **Cómo se crea una hoja de registro en este repo.** `ALCANCE_REGISTROS_`,
`Instalar.gs`: cómo se declara una hoja nueva, cómo se siembra, cómo se protege, y si hay
validaciones o formatos que las diez hojas actuales comparten. **`LAMINAS` tiene que nacer
igual que sus hermanas, no como un caso especial.**

`0.3` · **Cómo se hace un backup de una plantilla hoy.** La suspensión de `C-01` ya se ejerció
una vez —la lámina 10 escondida, con backup previo—. Buscar cómo se hizo: si hay función, se
reusa; si fue a mano, decirlo, porque entonces este prompt tiene que construirla.

`0.4` · **El menú.** Dónde se registran las entradas, qué submenú corresponde, y si hay un
patrón de confirmación para operaciones que escriben (la lectura de afuera es que el
diagnóstico tiene su propio submenú).

`0.5` · **Anexar sin pisar, medido.** Cómo se lee y se escribe el texto de las notas del
orador en Apps Script, y cuál es la forma de **agregar una línea conservando lo que haya**.
Las dos láminas de `SECCO_marcada` con notas del equipo (8 y 25) son el caso de prueba
obligatorio. **Probar sobre una copia desechable, jamás sobre la plantilla.**

`0.6` · **Idempotencia.** Confirmar cómo se detecta que una lámina ya tiene ancla, y qué pasa
si el sellado se corre dos veces seguidas. **Correrlo dos veces tiene que dar el mismo
resultado y cero escrituras la segunda vez.**

`0.7` · **El estado de partida.** Cuántas láminas tiene cada plantilla hoy y cuántas tienen
ancla (deberían ser cero). Es el número contra el que se verifica el resultado.

**Reportar `0.1`–`0.7` y parar.**

---

## Parte A — la hoja `LAMINAS`

`A.1` · Crearla como las otras diez, con las columnas que fija `PLAN.md` §2: `lamina_id`,
`informe_id`, `seccion_id`, `orden_plantilla`, `escondida`, `origen`, `modo`, `itera_sobre`,
`filtro`, `rol`, `estado`, `falta`, `notas`.

`A.2` · **`orden_plantilla` es reportado, no autoritativo.** Se escribe para que un humano
ubique la lámina; **nada del motor puede decidir en base a ese número.** Dejarlo dicho donde
`CLAUDE.md` §7 mande.

`A.3` · **El contador.** Vive en la hoja (`D-23` addendum 1, punto 9). **No se deriva de las
notas de las plantillas.** Definir dónde exactamente —celda, o máximo de `lamina_id`— y
escribir por qué esa forma no puede retroceder cuando una lámina se esconde.

`A.4` · **Un solo contador para las dos plantillas** (punto 12). `L-NNN` es global.

---

## Parte B — `sellarPlantilla(informe_id)`

`B.1` · **Backup primero, siempre.** Si el backup falla, **aborta y no escribe nada**. Es
condición de la suspensión de `C-01`, no una precaución de este prompt.

`B.2` · Por cada lámina **sin ancla**: siguiente id, fila en `LAMINAS`, **anexar** la línea a
las notas. Las que ya tienen ancla **no se tocan**. **No se traba nunca**: asignar un id no
requiere saber la sección.

`B.3` · **`escondida` se lee de la plantilla** (`isSkipped()`) y se escribe en la fila. Se
refleja, no se decide: esconder desde el motor **no está autorizado**.

`B.4` · **`seccion_id` queda vacío.** Este prompt **no deduce nada**. Las 26 celdas son
trabajo humano posterior — y son 26 de 51, medido.

`B.5` · **Reporte de la corrida**: cuántas láminas se sellaron, cuántas ya tenían ancla,
cuántas filas se escribieron, y el rango de ids asignados. Por lote, en una sola salida.

`B.6` · **Entrada de menú**, con el patrón que confirme `0.4`. Nombre a criterio de Code
siempre que diga que escribe la plantilla.

---

## Parte C — verificación, y es la parte que no se saltea

`C.1` · **Correr sobre una copia de cada plantilla, no sobre la plantilla**, y reportar. Recién
con eso aprobado se corre sobre las plantillas vivas.

`C.2` · **Las dos láminas con notas del equipo (`secco` 8 y 25) se revisan una por una**: el
texto original tiene que estar entero y el ancla agregada aparte.

`C.3` · **Correr dos veces**: la segunda no escribe nada.

`C.4` · **`51` láminas, `51` filas**, ids sin huecos ni repetidos, contador coherente.

`C.5` · Documentar al final, no durante: bitácora con lo que pasó, y `HANDOFF_CODE.md`.

## Commits

Por parte, y **el commit que corre sobre las plantillas vivas va separado y último**.

## Verificación

Se cierra cuando el usuario ve el reporte de `C.1` sobre copias y autoriza la corrida viva.
**No seguir a la Fase 4.**
