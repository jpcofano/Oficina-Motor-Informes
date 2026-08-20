# 2026-08-20_10 — La corrida se reanuda sola: plan por secciones, deck como checkpoint, estado caro en hoja

> **Estado:** no ejecutado · **subagente:** ninguno
> **Precondición:** la Parte 0 del `2026-08-20_9` ya dio el desglose de gasto por etapa. **Sin ese
> número no se elige el tamaño del chunk** y este prompt se queda en la Parte 0.
>
> **Objetivo único:** que una corrida que no entra en seis minutos **termine sola**, en varias
> ejecuciones, sin que nadie apriete nada.

---

## La decisión del usuario, 20/08/2026

**Corrida desatendida, con tres piezas que se sostienen entre sí:**

1. ⭐ **La unidad de trabajo es la sección.** El estado es *qué secciones faltan*, una lista corta —
   entra de sobra en los 9 KB por propiedad y, sobre todo, **es legible**.
2. ⭐ **El deck es el checkpoint.** La ejecución siguiente escribe en el mismo deck: los tokens ya
   reemplazados no están más, y los que quedan crudos **son exactamente lo que falta**.
3. ⭐ **Lo caro se persiste y se reusa dentro de la misma corrida.** El anclaje y la unión digital no
   se recalculan en cada ejecución.

**Y la condición que hace segura la tercera:** el estado caro **se ata al `corrida_id` y nunca se
reusa entre corridas**. Dentro de una corrida partida en cuatro ejecuciones, reusarlo es lo
correcto —las cuatro tienen que ser coherentes entre sí—; entre corridas distintas sería publicar
un anclaje viejo con cara de nuevo.

**Los límites que acotan el diseño**, verificados el 20/08: seis minutos por ejecución para toda
cuenta —el viejo tope de 30 minutos de Workspace ya no existe—; `PropertiesService` guarda 500 KB
por script y 9 KB por propiedad; 20 slots de trigger por script; y en cuenta consumer, **90 minutos
diarios de runtime de triggers**, de los que las corridas manuales no descuentan.

---

## Parte 0 — medir. Sólo lectura. **Reportar y seguir.**

> **Modelo: Sonnet · effort alto.**

1. ⭐ **El costo fijo de arranque**, aislado del costo por sección: cuánto tarda una ejecución
   **antes** de resolver el primer ítem — `anclarEncuentros`, `unirDigitalPorCuenta`, la lectura de
   `SOLAPAS`/`MAPEO`/`MARCADORES`. **Este número decide si el chunk es una sección o cinco:** si el
   arranque cuesta 200 s, un chunk de una sección no converge nunca.
2. **El costo por sección**, con las repetibles desagregadas por ítem. La `campana` con dos ítems y
   la `encuentro` con dos no cuestan lo mismo.
3. **`CORRIDAS` hoy**: qué columnas tiene, **si guarda el `deck_id`**, y si guarda el estado de la
   corrida. Si guarda el id, el panel puede ofrecer *continuar la última* sin copiar nada a mano.
4. **`generarInforme`**: confirmar que hace `makeCopy` de la plantilla en cada corrida y **que no
   hay hoy ningún camino para escribir sobre un deck existente**.
5. **La barrida**: dónde se la llama y **si distingue una corrida terminada de una cortada**. Al
   20/08 existen `MOTIVO_CORTE_TIEMPO_` y `MOTIVO_EXCEPCION_` en `FALTANTES`, así que el motor **ya
   sabe** cuál es cuál; medir si esa señal llega al punto donde se decide barrer.
6. **Cuenta y cuota**: si el proyecto corre bajo cuenta consumer o Workspace, y **cuántos triggers
   tiene hoy instalados**. Con 20 slots compartidos, un trigger huérfano por corrida agota el cupo
   en dos semanas.
7. **`ESCRITORES.md`**: qué hojas de registro existen y cuáles son de escritura del motor. El plan
   de corrida y el estado caro van a ser hojas nuevas y necesitan su fila.

---

## Parte A — el deck deja de copiarse cuando se continúa

> **Modelo: Opus · effort alto.** Habilita escribir sobre un deck ya publicado.

1. **`generarInforme` acepta un deck existente.** Ausente → copia la plantilla, como hoy. Presente →
   escribe sobre ése. **Un llamador que no conoce la opción no cambia de comportamiento.**
2. ⭐ **La barrida NO corre si la corrida se cortó.** Es la condición sin la cual todo lo demás no
   sirve: la barrida convierte los crudos en `/////` y **ahí se pierde la única información de qué
   faltaba**. Barrer es un gesto de cierre; una corrida cortada no cerró.
3. **La escritura tiene que ser idempotente y hay que demostrarlo, no suponerlo:** `replaceAllText`
   sobre un token ya reemplazado no encuentra nada. ⚠ **Lo que sí puede duplicar es la expansión de
   secciones repetibles** — si la ejecución 2 vuelve a expandir la lámina modelo de una sección que
   la 1 ya expandió, el deck sale con las láminas dos veces. **Medirlo y resolverlo acá, o el
   mecanismo publica un deck peor que el cortado.**

---

## Parte B — el plan de corrida, y la reanudación

> **Modelo: Opus · effort alto.**

**Una hoja de plan por corrida**, con una fila por sección: `corrida_id · seccion_id · estado ·
ejecucion · segundos`. Estados: pendiente · hecha · omitida · falló.

⭐ **Va a una hoja y no a `PropertiesService` a propósito.** El estado de una corrida desatendida
tiene que poder mirarse mientras corre, y una propiedad serializada no se mira. Los 9 KB alcanzan;
**la legibilidad es la razón, no el tamaño.**

**El ciclo de cada ejecución:**

1. Toma el lock. ⚠ **`LockService`, y si no lo consigue, sale sin hacer nada** — dos ejecuciones
   escribiendo el mismo deck es el peor resultado posible de todo este mecanismo.
2. Lee el plan, toma las secciones pendientes que entren en el presupuesto **descontando el costo
   fijo medido en la Parte 0**.
3. Las resuelve, las marca `hecha` una por una **a medida que terminan**, no al final. Una ejecución
   que muere no puede dejar el plan mintiendo.
4. Si quedan pendientes: **borra su propio trigger**, crea el siguiente, sale limpio.
5. Si no quedan: **barre, cierra `CORRIDAS`, borra el trigger** y no crea otro.

**Cuatro guardas, y las cuatro son obligatorias:**

- ⭐ **Tope de continuaciones.** Un número en `CONFIG`. Al llegar, **para y reporta**, no sigue.
  Una corrida que se reanuda para siempre consume los 90 minutos diarios y deja al motor sin
  triggers para el resto del día.
- ⭐ **Sin progreso, no hay continuación.** Si una ejecución no marcó **ni una** sección como hecha,
  la siguiente no se crea. Es la diferencia entre *"tarda"* y *"no avanza"*, y sin esta guarda las
  dos se ven igual hasta que se agota la cuota.
- **Cada ejecución borra el trigger que la disparó**, antes de crear el próximo. Con 20 slots
  compartidos, los huérfanos son una bomba de tiempo.
- **El trigger corre sin el usuario**, con los permisos del dueño del script. Verificar que ese
  alcance llega a las bases y al deck; si no llega, decirlo y parar — el mecanismo entero depende
  de eso.

---

## Parte C — el estado caro, por corrida

> **Modelo: Opus · effort alto.** Toca de dónde salen los anclajes, o sea números publicados.

**El anclaje resuelto y la unión digital se escriben una vez y se releen** en las ejecuciones
siguientes de la **misma** corrida.

1. ⭐ **La clave incluye el `corrida_id`.** Sin eso, la corrida del viernes reusaría el anclaje del
   jueves y publicaría números de otra semana **sin fallar**.
2. **Se escribe lo que hace falta para reconstruir, no todo:** para cada encuentro, su `id_cuenta`
   anclado, el score y qué paso lo resolvió. **No los datos de las bases** — eso es volumen y
   envejece.
3. **Si la relectura falla o no está, se recalcula.** Un caché que rompe la corrida cuando falta es
   peor que no tenerlo.
4. ⚠ **Y queda escrito el efecto secundario bueno:** el anclaje deja de ser invisible. Hoy vive en
   memoria y muere con la ejecución; con esto queda una fila por encuentro que dice a qué cuenta se
   ancló y con cuánto puntaje. **Eso es evidencia que hoy no existe**, y varios casos abiertos la
   necesitan.

---

## Parte D — verificar

> **Modelo: Sonnet · effort alto.**

1. **Control positivo sobre las funciones puras**: el planificador elige secciones que entran en el
   presupuesto; con el tope alcanzado, para; sin progreso, no continúa.
2. ⭐ **El control que distingue el mecanismo de su ausencia**: una corrida con presupuesto
   artificialmente chico tiene que **terminar en varias ejecuciones con el mismo resultado** que
   una corrida holgada en una sola. **Valores idénticos, ejecuciones distintas.** Si sólo se compara
   el resultado final, no se distingue "se reanudó" de "entró de una".
3. **Idempotencia de la expansión**: correr dos veces la misma sección sobre el mismo deck **no
   duplica láminas**. Es el punto 3 de la Parte A y va verificado, no asumido.
4. **El lock**: dos ejecuciones simultáneas, una sale sin escribir.
5. ⚠ **No se declara éxito con una corrida que terminó sola pero dejó el plan a medias.** El plan
   completo y el deck completo son dos afirmaciones distintas y hay que mirar las dos.
6. `node tools/listas.js` · snapshots · sintaxis validada.

---

## Parte E — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/ESCRITORES.md`** — las hojas nuevas y quién las escribe, con la nota de que **el trigger
   escribe sin usuario delante**.
2. **`docs/PLAN.md`** — la decisión, con los tres pilares y la condición del `corrida_id`.
3. **`CLAUDE.md` §4** — la regla: *un mecanismo que se reanuda solo necesita una guarda de progreso;
   sin ella, "tarda" y "no avanza" se ven igual hasta que se agota la cuota*.
4. **`docs/PROCESO_SEMANAL.md`** — qué ve una persona cuando una corrida se reanuda sola, y **cómo
   se cancela una que quedó dando vueltas**. Un mecanismo desatendido sin botón de freno es peor que
   ninguno.
5. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No optimiza nada: eso es el `2026-08-20_9` Parte B y va antes o en paralelo.
- ⛔ No cablea ningún token.
- ⛔ No hace la corrida programada de los viernes. Esto la habilita; agendarla es otra decisión.
- ⛔ No reusa estado entre corridas distintas, por ningún motivo.
