# El ancla se reduce a un campo, y la copia se limpia a demanda

**Un objetivo.** Documentación. **Cero `.gs`.** Corrige dos puntos de lo escrito hoy en
`D-23`, en el addendum de `C-01` y en el RUNBOOK, antes de que se implemente nada.

**Qué cambia, y por qué.**

1. **El ancla tiene un solo campo: `#lamina: L-NNN`.** El segundo campo, `#seccion:`, se
   diseñó cuando el sellador deducía la sección y la escribía en el deck. **`AJ-10` movió la
   clasificación a la hoja `LAMINAS` y dejó ese campo sin función**: el `seccion_id` pasaría a
   estar en dos lados a la vez, y el registro es dueño de la configuración (`D-01`). La copia
   en el deck no aporta nada y sí puede quedar vieja.
2. **El ancla de la copia generada se borra con una función que el usuario corre cuando
   quiere.** No hay borrado automático y **no hay concepto de "informe cerrado"**: es una
   acción a demanda, y actúa **sólo sobre el informe generado, nunca sobre la plantilla**.
   Mientras se trabaja el deck, el id está y sirve; cuando el usuario decide, lo limpia.
   Decisión del usuario, 07/08/2026 — reemplaza a `C.2` del prompt `_7`, que decidía
   conservarla siempre.

3. **La plantilla conserva el ancla para siempre.** Es su historia: las láminas que ya no se
   usan quedan marcadas ahí, con su id. Los ids no se reasignan, así que esa historia no se
   pisa. La función de limpieza **no toca la plantilla en ningún caso**.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **Dónde quedó nombrado el segundo campo.** Listar todas las apariciones de
`#seccion:` —o de "dos campos" referido al ancla— en `docs/PLAN.md`, `docs/REGLAS_NEGOCIO.md`,
`docs/RUNBOOK.md`, `docs/HANDOFF_CODE.md` y `docs/PENDIENTES_consistencia.md`. Es para no
dejar ninguna suelta: una referencia a un campo que ya no existe es peor que no tenerla.

`0.2` · **¿Cómo llegaría la función al deck generado?** Hoy `generarInforme` copia la
plantilla y guarda en `CONFIG.carpeta_salida`. Medir si el id del archivo generado **queda en
algún lado reusable** —el reporte de corrida, una celda, una hoja— o si el único rastro es el
archivo en Drive. Es lo que decide si la función puede ofrecer "el último generado" o si el
usuario tiene que señalar el archivo. **Reportar el hecho, no elegir el diseño.**

`0.3` · **Las notas del equipo viajan a la copia.** Confirmar que la copia hereda las notas
del orador de la plantilla — las dos de `SECCO_marcada` (láminas 8 y 25). Es lo que obliga a
que el borrado del cierre **saque sólo la línea del ancla y nunca haga `setText`**.

`0.4` · **Las copias de una sección repetible comparten id.** Confirmar que `duplicate()`
arrastra las notas, y por lo tanto que N copias de una lámina modelo salen todas con el mismo
`#lamina: L-NNN`. Es correcto por diseño —son la misma lámina instanciada por ítem— pero
tiene que estar escrito, o alguien lo va a leer como bug.

**Reportar `0.1`–`0.4` y parar.**

---

## Parte A — `Addendum 1 a D-23`, en `docs/PLAN.md`

Con la forma que ya usan los addenda de `D-20` y `D-21`: **el texto de arriba no se altera**;
el addendum lo corrige y lo completa, fechado 07/08/2026, decisión del usuario. Contenido:

`A.1` · **El ancla tiene un campo, no dos.** `#lamina: L-NNN` y nada más. Razón: `AJ-10`
—escrito en el mismo `D-23`— puso la clasificación en la hoja `LAMINAS`, y el `#seccion:`
duplicaba en el deck un dato del que el registro ya es dueño. Decirlo así: **el segundo campo
no se descarta por malo, queda sin función por una decisión posterior del mismo día.**

`A.2` · **Lo que el `#seccion:` justificaba sigue resuelto.** El argumento original era que
`m2` reclama las láminas 9 y 10 de `jm` y `campana` reclama ocho. Un id único por lámina las
distingue mejor que un `seccion_id` compartido: la necesidad era **identidad por lámina**, y
eso es exactamente lo que hace el campo que queda.

`A.3` · **La Fase 2 deja de estar partida.** Sin `#seccion:` no hay segundo sellado: un solo
sellado escribe ids en las 51 láminas, **no deduce nada y no se traba nunca**. El default-deny
sale del sellador y pasa a la hoja: una lámina sin fila en `LAMINAS` se reporta, no se adivina
—igual que `SOLAPAS`—. Las 26 huérfanas dejan de ser un problema de sellado y son 26 celdas
vacías de `seccion_id`. **Actualizar la tabla de fases de `PLAN.md` §2 en consecuencia**: `2a`
y `2b` se funden en una sola Fase 2, y la Fase 3 sigue dependiendo de ella por la clave.

`A.4` · **La herencia no es sincronización, y conviene decirlo porque se prestó a confusión.**
`SECCIONES` y `LAMINAS` son **las dos configuración**: celda vacía = hereda, celda con valor =
manda la lámina. Es un solo valor resuelto al leer, nunca dos copias del mismo dato. Lo que sí
habría sido sincronización —y por eso se quita— era el `seccion_id` viviendo a la vez en la
hoja y en el deck.

`A.5` · **El deck deja de ser autodescriptivo, y cuál es la defensa.** Con sólo un id, si
alguien borra la fila de `LAMINAS` el id queda huérfano y no significa nada. La defensa es que
la hoja **se siembra leyendo el deck**: una lámina sin fila se reporta. Escribirlo como riesgo
asumido con mitigación, no como si no existiera.

`A.6` · **N copias, un id.** Las copias de una lámina modelo repetible salen todas con el
mismo `#lamina:`, porque `duplicate()` arrastra las notas y porque **son** la misma lámina
instanciada por ítem. No es un bug.

`A.7` · **El ancla en la copia**, que reemplaza a `C.2` del `_7`:

- El deck generado **conserva el ancla**. Es lo que permite decir de qué modelo salió cada
  lámina justo cuando un número sale mal.
- **Una función lo limpia, y la corre el usuario cuando quiere.** Sin automatismo y sin
  concepto de "informe cerrado": el motor no decide cuándo un deck dejó de trabajarse.
- **Actúa sólo sobre el informe generado.** Correrla contra una plantilla es un error, y la
  función tiene que negarse, no confiar en que nadie lo intente.
- **Limpiar es borrar la línea del ancla, nunca `setText` sobre las notas.** La copia hereda
  las notas del equipo; limpiarlas de un saque destruiría trabajo humano que nadie tiene
  copiado.
- **No necesita autorización de `C-01`.** `C-01` protege la **plantilla**; la copia es salida
  del motor y el motor ya la escribe entera. Decirlo, para que nadie lo lea como una
  ampliación de la suspensión.

`A.8` · **La plantilla no se limpia nunca, y eso es una decisión, no un olvido.** El ancla es
su historia: una lámina retirada del uso queda marcada ahí con su id, y como los ids no se
reasignan, esa historia no se pisa. Escribirlo en el addendum para que ninguna implementación
futura la incluya "por simetría" con la copia.

---

## Parte B — `Addendum 2` al addendum de `C-01`, en `docs/REGLAS_NEGOCIO.md`

`B.1` · El `Addendum 1` de hoy autoriza escribir las notas del orador para sellar **los campos
`#lamina: L-NNN` y `#seccion: <seccion_id>`**. Con `Addendum 1 a D-23`, el segundo campo no
existe. Un `Addendum 2` fechado 07/08/2026 **acota** la autorización a un solo campo. Es un
recorte, no una ampliación, y así hay que escribirlo.

`B.2` · **No se toca el texto del `Addendum 1`**, ni el "qué NO autoriza", ni el "anexa, nunca
reemplaza", ni el alcance ejercido —que sigue siendo **ninguno**: el sellador no existe.

`B.3` · **La limpieza del ancla de la copia no entra acá.** Actúa sobre el informe generado,
no sobre la plantilla. Decirlo en una línea para que quede la frontera escrita.

---

## Parte C — `docs/RUNBOOK.md`, editado en el lugar

`C.1` · La sección *"Marcar y clasificar una lámina"* se corrige donde nombre dos campos o dos
sellados. Un solo sellado; la sección se declara en `LAMINAS`; el ancla es `#lamina: L-NNN`.

`C.2` · El bloque *"El deck generado conserva el ancla"* pasa a describirlo completo: el deck
conserva el ancla, **el texto de máquina se ve en modo presentador mientras esté**, y una
función a demanda lo limpia cuando el usuario quiere. La consecuencia no desaparece: queda en
manos del usuario cuándo termina.

`C.3` · **La función de limpieza tampoco existe todavía.** Nombrarla con las mismas palabras
que ya usa el aviso de cabecera para *Sellar plantilla* y la hoja `LAMINAS`, y que el aviso la
cubra. **No inventarle nombre de menú definitivo**: se decide al implementarla.

---

## Parte D — `docs/PLAN.md` §2, editado en el lugar

`D.1` · Fundir `2a` y `2b` en una sola Fase 2, con su precondición intacta (la autorización de
`C-01`) y sin el default-deny del sellador.

`D.2` · **Entra un ítem nuevo: limpiar el ancla de un informe generado.** Función a demanda,
sólo sobre la copia, con negativa explícita si el archivo es una plantilla. Precondición: la
Fase 2 —sin ancla no hay nada que limpiar—. **Cómo recibe el deck depende de `0.2`**: si no
hay rastro reusable del archivo generado, decirlo ahí sin elegir el diseño.

---

## Commits

Uno por parte (A, B, C, D), documentación, sin `—`. `git push` después de cada uno.

## Verificación

Se cierra cuando el usuario lee los dos addenda y confirma. **No se implementa nada.**
