# El flujo de una lámina nueva: la plantilla se administra por el motor

**Un objetivo.** Documentación. **No se toca ningún `.gs` en esta corrida** — ni el sellador,
ni el menú, ni la hoja `LAMINAS`, ni el cableado. Se deja escrito qué se decidió y en qué
orden se implementa, para que los prompts siguientes se escriban contra algo firme.

**Reemplaza** al prompt homónimo sin ejecutar del 07/08/2026 (Partes 0/A/B/C), que tenía dos
premisas falsas: `0.3` medía sólo secciones repetibles, y `A.1` prometía retirar
`LAMINAS_CONGELADAS_` con un ancla que no alcanza para eso.

**Lo decidido por el usuario (07/08/2026).** Durante el desarrollo, **la plantilla es artefacto
del motor**: el usuario toca configuración y mira la salida; lo estructural sobre la plantilla
—clasificar, marcar, esconder— pasa por el motor. **Agregar una lámina no entra todavía**: es
la capa de panel de `docs/OBJETIVO_lamina_nueva.md` y espera su turno. Mientras tanto el
usuario diseña la lámina en Slides, que es diseñar, no administrar.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **¿El motor puede escribir la plantilla, hoy?** Para cada `informe_id` con
`INFORMES.plantilla_id` cargado: qué cuenta es dueña del archivo y si la cuenta que corre el
script tiene permiso de escritura. **Si no lo tiene, el flujo es inejecutable hasta resolverlo
en Drive** — es tarea del usuario, no del motor: reportarlo como lo primero a resolver y
seguir con el resto de la Parte 0 igual.

`0.2` · **Qué suspende hoy `C-01`.** Leer la sección *"Suspensión acotada — 14/08/2026"* de
`docs/REGLAS_NEGOCIO.md` y decir, textual, qué autoriza y cuál es el alcance ejercido. La
lectura de afuera es que autoriza **retirar una lámina** y nada más, y que **escribir las
notas del orador no está cubierto**. Que lo diga el archivo.

`0.3` · **¿Cuánta ambigüedad hay hoy, y de qué tipo?** Sobre las plantillas vivas de `jm` y
`secco`, derivar la pertenencia lámina→sección con `familia_tokens` **para todas las secciones
de `SECCIONES`, no sólo las repetibles**. `seccionesRepetiblesDe_` filtra por
`modo = repetible` y por eso deja afuera `m2` (`modo = agregado`), que es justamente donde
está la lámina congelada: usar la derivación de familias directamente, no esa función.

Tres números por plantilla, y los tres importan:

| | qué cuenta | qué decide |
|---|---|---|
| **a** | láminas que caen en **más de una** sección | si la derivación por prefijo es ambigua entre secciones |
| **b** | láminas que caen en **ninguna** | si hay láminas sin identidad posible |
| **c** | **secciones con más de una lámina**, con el detalle de cuáles | si el ancla necesita un segundo campo por lámina |

**Regla de parada:** si **a**, **b** y **c** dan cero en las dos plantillas, reportar y parar
— el ancla resolvería un problema que no existe. La lectura de afuera dice que `c` **no** es
cero (`m2` = láminas 9 y 10 de `jm`), pero eso es lectura de `docs/TOKENS.md` §2.0, que es un
`.md` fechado: **medirlo contra la plantilla viva**.

`0.4` · **`familia_tokens` como mecanismo de pertenencia, medido.** Cuántas filas de
`SECCIONES` declaran en `familia_tokens` una **lista de tokens** en vez de un prefijo, y
cuáles. Es el síntoma de que el modelo no alcanza: `ecv_alcance_semanal` existe con **los 10
tokens exactos** porque el prefijo `ecv_` se llevaba láminas que no eran suyas (bitácora,
corrida nocturna 05/08). Este número es la línea de base contra la que se va a medir el pago
de la Fase 4.

`0.5` · **Las notas del orador, medidas.** Cuántas láminas de cada plantilla ya tienen texto en
las notas, y una muestra de qué dice. Si el equipo las usa para su trabajo, el ancla convive
con ese texto y eso cambia la forma de la marca: **no se pisa lo que haya**.

`0.6` · **¿La armonización alcanza las notas?** Que `replaceAllText` es global sobre la
presentación ya está anotado (`docs/PENDIENTES_consistencia.md`, P2 sobre
`armonizarPresentacion_`) — **eso no hay que volver a medirlo**. Lo que falta es si ese
recorrido **alcanza el texto de las notas del orador**. De ahí sale si el ancla puede usar la
sintaxis `{{…}}` o necesita otra. **No asumir la respuesta: medirla.**

`0.7` · **¿Una celda de tabla admite alt text?** Verificar en la plantilla viva si un
`TableCell` expone `setDescription`/`setTitle` o si esa propiedad existe sólo en el
`PageElement` tabla completa. Es lo que decide si el alt text podría llegar a servir como
identidad de **elemento**: la lámina 7 de `jm` tiene sus cuatro tokens dentro de una tabla
7×8, y `piezasDeTextoDeSlide_` baja a las tablas celda por celda justamente porque ahí viven.
Reportar el hecho medido, no la conclusión.

`0.8` · **Los IDs libres.** Cuál es el próximo `D-NN` sin usar en `docs/PLAN.md`. La lectura
de afuera dice `D-23`; confirmarlo contra el archivo antes de escribirlo.

**Reportar `0.1`–`0.8` y parar.**

---

## Parte A — la decisión, en `docs/PLAN.md`

`A.1` · Un `D-NN` nuevo (el que confirme `0.8`), con este contenido:

**Enunciado.** La identidad de una lámina se declara en el deck, en las notas del orador, y la
escribe el motor. Dos campos:

- `#seccion: <seccion_id>` — a qué sección pertenece.
- `#lamina: L-NNN` — **id global, opaco, asignado una vez y nunca reasignado**. Global y no
  derivado de la sección a propósito: el sistema existe para poder **reclasificar** una
  lámina, y un id que contiene el `seccion_id` queda mintiendo el día que la lámina cambia de
  sección — y entonces alguien lo edita, y un id que se edita deja de ser un id. Misma regla
  que los `D-NN` y `R-NN` de este repo.

Si `0.3.c` dio cero, el segundo campo no se escribe y el `D-NN` lo dice.

**La unidad de emisión pasa a ser la lámina; la sección queda como agrupación conceptual.**
Es la decisión del usuario y tiene evidencia en el repo: hoy una sección conceptual puede
tener **una lámina agregada y otras que repiten**, y expresarlo obligó a partir `encuentro` en
dos filas, enumerar diez tokens exactos en `familia_tokens` y agregar `curarSecciones_` para
poder corregir un campo (bitácora, corrida nocturna 05/08). Entonces:

- La lámina puede declarar `modo`, `itera_sobre` y `filtro` propios.
- **Precedencia, y es una regla de herencia, no un conflicto**: celda vacía en la lámina =
  hereda de su sección; celda con valor = manda la lámina. Vale la misma convención que ya usa
  `MARCADORES.solapa`, donde vacío significa inferir. No es el caso de *"hojas de registro:
  estado, no verdad"*: ahí dos fuentes describen lo mismo y discrepar es un hallazgo; acá la
  sección declara el default y la lámina la excepción, y sólo una de las dos habla por celda.
- **Identidad y estado propio no se heredan nunca**: `seccion_id`, `escondida`, `origen` son
  de la lámina y de nadie más.

**Por qué no contradice `D-01`.** Lo que va al deck es identidad, no un valor de negocio.
`modo`, `itera_sobre` y `filtro` siguen viviendo en hojas de registro — cambian de fila, no de
lugar. Cambiar qué muestra una lámina sigue sin exigir tocar el Slides.

**Qué cierra de `Paso-5-v2`, sin superseder nada.** Ese prompt dejó una condicional:
*"preferir la hoja de registro sobre la marca en la plantilla, **salvo que `0.4` muestre que
ya hay marcas puestas**"*. Esta decisión **cierra esa condicional** con los números de `0.3`
como fundamento. Un prompt ejecutado no se edita y no es dueño de una decisión de
arquitectura (`CLAUDE.md` §7): se lo cita, no se lo supersede.

**Qué se descarta, con la razón en una línea:**

| descartado | por qué |
|---|---|
| alt text para identidad de **elemento** | los tokens viven dentro de celdas de tabla, y `D-17` siembra `MARCADORES` leyendo los `{{token}}` de la plantilla: mover la identidad al alt text corta esa cadena. Ajustar según lo que mida `0.7` |
| caja de texto invisible en la lámina | el equipo la arrastra o la borra y el síntoma aparece lejos |
| un ID único **global por elemento** replicado en copias | `duplicate()` lo replica en cada copia de una sección repetible. El `#lamina:` no cae en esto: las copias **son** la misma lámina modelo instanciada por ítem, y heredarlo es correcto |
| `objectId` como ancla persistente | **no hay garantía documentada**: Google documenta la preservación de `objectId` al copiar el archivo entero con la Drive API, no como propiedad general de una presentación editada. La razón **no** es que el equipo edite la plantilla — bajo esta decisión ya no la edita |
| guardar el **número** de lámina | es lo que hoy hace `LAMINAS_CONGELADAS_` y lo que se rompe al insertar una lámina antes. El número se **reporta** en cada corrida; no se guarda |

**Qué se destraba, y cuándo — todo en la Fase 4, no con esta decisión:**

- `LAMINAS_CONGELADAS_` sale del `.gs` y agregar una lámina deja de frenar la armonización.
- **`familia_tokens` deja de ser el mecanismo de pertenencia.** Es el pago grande: hoy es
  simultáneamente "con qué se reconoce el bloque modelo" y "qué tokens son de esta sección", y
  esa doble carga es la que produjo la enumeración de diez tokens y el bug de la lámina del
  alcance semanal duplicada por encuentro.
- `ecv_alcance_semanal` queda como **candidata** a volver a `encuentro` con `modo` propio.
  Candidata, no tarea: se decide con los números de `0.4` a la vista.

`A.2` · **Dirección de `C-01`, dicha en el `D-NN`.** Durante el desarrollo la relación se
invierte: la plantilla es del motor y el equipo no la edita. `C-01` **no se deroga ni se
suspende en bloque**; la dirección queda escrita acá y las autorizaciones concretas siguen
creciendo de a una operación en `REGLAS_NEGOCIO.md`, que es lo que las hace verificables.

`A.3` · **No editar decisiones viejas.** Si alguna `D-NN` existente queda superseded, se la
cita desde la nueva; no se toca su texto.

`A.4` · **Las fases 2 a 5 van a `docs/PLAN.md` §2 (Próximo), cada una con su precondición
dicha**, en este orden:

| fase | qué | precondición |
|---|---|---|
| 2 | `sellarPlantilla(informe_id)`: recorre láminas, no toca las que ya tienen ancla, y **para y reporta** ante una lámina cuya sección no se deduce. Default-deny, como `buscarMapeo` ante una solapa no declarada | Parte B de este prompt: escribe la plantilla |
| 3 | Hoja `LAMINAS`: `lamina_id`, `informe_id`, `seccion_id`, `orden_plantilla` (reportado, no autoritativo), `escondida`, `origen`, `modo`, `itera_sobre`, `filtro` (los tres vacíos = heredan), `estado`, `falta`, `notas`. Es `SOLAPAS` del lado del deck, y es `D-17` aplicado a láminas | Fase 2: sin ancla la fila no tiene con qué juntarse a la lámina |
| 4 | Los consumidores migran al ancla: `LAMINAS_CONGELADAS_` sale del `.gs`, la emisión deja de derivar la pertenencia por prefijo, esconder/mostrar desde el menú | Fase 3, **y una autorización nueva de `C-01`** para `setSkipped` |
| 5 | El cableado de la lámina nueva, y después la capa de panel de `OBJETIVO_lamina_nueva.md` | Fase 4. **Sin definir: no inventarlo** |

---

## Parte B — la autorización, en `docs/REGLAS_NEGOCIO.md`

`B.1` · Extender la **suspensión acotada de `C-01`** con un addendum fechado 07/08/2026, en la
forma que ya usa esa sección. Lo que agrega, **y sólo eso**: además de retirar una lámina, el
motor queda autorizado a **escribir las notas del orador de la plantilla** para sellar el
ancla.

`B.2` · **Decir explícitamente qué NO autoriza este addendum**: esconder o mostrar láminas
desde el motor, insertar o borrar láminas, y mover o reescribir cajas. La dirección —que la
plantilla se administre por el motor— queda en el `D-NN`; **la autorización crece por
operación**, con su alcance ejercido anotado, que es como está escrita la suspensión vigente y
lo que la hace verificable.

`B.3` · Lo que **no** cambia, con todas las letras: backup previo obligatorio, aborto si el
backup falla, ninguna caja se mueve ni se reescribe, y `C-01` vuelve a regir en producción.

`B.4` · Si `0.2` muestra que la suspensión ya cubre escribir las notas, **no se escribe un
addendum redundante**: se reporta y se sigue.

---

## Parte C — el flujo, en `docs/RUNBOOK.md`

`C.1` · Una sección nueva, *"Marcar y clasificar una lámina"*, con estos pasos y sin adornos:

1. El usuario agrega la lámina a la plantilla en Slides, con números de ejemplo o vacía.
   **Es el único paso que no pasa por el motor**, y es provisorio: pedirla en lenguaje natural
   es la capa de panel de `docs/OBJETIVO_lamina_nueva.md`.
2. El usuario corre **Sellar plantilla** desde el menú.
3. El motor recorre las láminas: a las que ya tienen ancla **no las toca**; las que no la
   tienen y **no se puede deducir su sección** se **reportan** y el sellado **para**. No se
   adivina la sección de una lámina nueva.
4. El usuario declara la sección en `SECCIONES` —o la crea— y vuelve a sellar. Ahí se escribe
   el ancla.
5. Se cablea: cada número de ejemplo pasa a `{{token}}` y cada token nuevo lleva su fila en
   `MARCADORES`. **El detalle de este paso queda pendiente** — no inventarlo acá.
6. La sección entra en `estado = revisar` hasta que alguien la vio llena en una corrida.

`C.2` · **La copia generada conserva el ancla** (decisión del usuario, 07/08/2026). El motor no
la retira al generar. Motivo: con tres numeraciones conviviendo, el ancla es la única forma
estable de decir de qué modelo salió una lámina del deck publicado, y eso sirve justo cuando
un número sale mal. **Consecuencia a decir en el RUNBOOK**: las notas del orador del deck
publicado van a llevar texto de máquina, visible en modo presentador y al imprimir.

`C.3` · **Los pasos 2 y 3 nombran una función que todavía no existe.** Decirlo en el RUNBOOK
con esas palabras, para que nadie la busque en el menú antes de que se implemente.

`C.4` · **No documentar la hoja `LAMINAS` en el RUNBOOK todavía.** Es Fase 3 y no existe;
describir cómo se opera algo inexistente es la clase de documentación que envejece antes de
nacer.

---

## Commits

Uno por parte (A, B, C), todos de documentación, sin `✅`. `git push` después de cada uno.

## Verificación

Se cierra cuando el usuario lee el `D-NN`, el addendum y la sección del RUNBOOK y confirma que
describen lo que decidió. **No seguir con la implementación del sellador.**
