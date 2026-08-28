# 2026-08-28_2 — Que el autorizado abra lo que generó, y que no haya dos corridas encimadas

**Dato del usuario, 28/08:** entre **5 y 10 personas**, todas con cuenta de Gmail personal,
**todas autorizadas a generar**. No hace falta que puedan hacerlo simultáneamente; lo que hace
falta es **bloquear a quien no está autorizado**.

Este prompt hace **las dos piezas que no dependen del experimento de identidad** (`RUNBOOK.md`
Parte I). La identidad —portero o nada— se decide cuando ese experimento corra, y no está acá.

⭐ **Lo que sí está acá es lo que hoy no funciona aunque la identidad funcionara:** medido en la
nocturna del 28/08, **nadie comparte una salida** —cero `addViewer`, `addEditor`, `setSharing` en
todo el repo—. Una persona autorizada que pasa la barrera, genera el deck y **no lo puede abrir**.

**Modelo por parte.** A: Sonnet, sin effort alto. **B y C: Opus, effort alto** — la primera decide
quién ve un archivo con datos de gobierno, la segunda toca el camino de generación. D: Sonnet.
Ordenadas por sacrificabilidad: **B y C no se caen**; D cae primera.

---

## Parte A — verificar las premisas (Sonnet · SÓLO LECTURA · reportar y parar)

**A.1 — El cerrojo existe y está en un solo camino.** Medido desde afuera el 28/08, **a
verificar**: `LockService` aparece en `Desatendida.gs` —la corrida desatendida lo toma y **si no lo
consigue sale sin hacer nada**— y **en ningún otro lado**. Reportar todos los caminos que llegan a
generar un deck y cuáles toman lock. ⛔ Si el camino del panel ya lo toma, **parar**: la Parte C no
tiene objeto.

**A.2 — Dónde nace el deck y quién queda de dueño.** El `makeCopy` de `Generador.gs`: en qué
carpeta cae, con qué nombre, y **con qué identidad se ejecuta** cuando el disparo viene del panel.
⚠ Con `executeAs: USER_DEPLOYING` el dueño es siempre la cuenta que desplegó, **no** quien apretó
el botón — confirmarlo, porque es toda la razón de ser de la Parte B.

**A.3 — La lista.** `mails_autorizados` en `CONFIG`. ⛔ **De la hoja viva, no del snapshot ni del
seed.** La nocturna sólo pudo leer el snapshot del 26/08 y dejó dicho que eso no prueba qué dice
hoy. Si no hay forma de leer la hoja viva desde acá, **decirlo y dejarlo como medición del
usuario** — no reportar el snapshot como si fuera el estado.

**A.4 — Qué escribe una corrida, para saber qué protege el cerrojo.** Listar las hojas que
`generar` pisa o reescribe entera. Medido desde afuera: `FALTANTES` se borra de la fila 2 al final
y se reescribe, y `ANCLAJE_PENDIENTE` se escribe durante el anclaje. Verificar y **completar la
lista**: es la que justifica el alcance del lock.

**A.5 — ⛔ El censo que la nocturna dejó abierto.** El motor sólo hace `replaceAllText` —25
apariciones, cero de `insertSheetsChart`, `setLinkUrl`, `insertImage`—, pero **lo que la plantilla
del equipo trae de fábrica no se puede medir con grep**. Escribir un instrumento de **una función,
sólo lectura**, que recorra la plantilla viva y reporte: gráficos vinculados a planillas, tablas
vinculadas, links en formas y elementos con fuente externa.

⭐ **Es el gate de la Parte B, y por eso va acá y no después:** si una lámina trae un gráfico
vinculado a una base, **compartir el deck es compartir la base**, y todo el diseño cambia. Si el
deck es texto sellado, no filtra nada — y ésa es la propiedad que hace que esto funcione, así que
tiene que quedar afirmada **con su comando**, no supuesta.

⚠ Si Code no puede correrlo contra la planilla viva, **deja el instrumento listo y lo corre el
usuario**. No estimar el resultado.

**Reportar y parar.**

---

## Parte B — el deck se comparte con la lista (Opus · effort alto)

⛔ **Sólo se ejecuta si A.5 dio cero elementos vinculados.** Si dio alguno, **parar y reportar
cuál**: es una decisión del usuario, no un caso a resolver por plausibilidad.

**B.1 — Sin hoja `ACCESOS`, y es una decisión, no una omisión.** `D-16` pieza 1 pide una hoja
`mail × informe_id × rol`. **Hoy no hace falta:** el usuario declaró el 28/08 que **todos los
autorizados pueden todo**, así que la hoja tendría una sola columna con valor constante y
`mails_autorizados` **ya es esa lista**. Una segunda lista con el mismo contenido es la figura que
este proyecto conoce: dos fuentes que no fallan cuando difieren, **publican distinto**.

⚠ **Y la fecha de vencimiento va escrita junto con la decisión**, porque un atajo justificado por
*«esto todavía no existe»* la tiene: **la hoja hace falta el día que haya dos informes con públicos
distintos** —`secco` es el candidato— **o el primer autorizado que pueda leer pero no generar**.
Ese día `mails_autorizados` deja de alcanzar y `D-16` pieza 1 se ejecuta como está escrita.

**B.2 — El compartido.** Al cerrar la corrida —después del sellado, junto con la fila de
`CORRIDAS`— el motor comparte el deck **en lectura** con cada mail de `mails_autorizados`.

- ⛔ **`addViewer`, nunca `addEditor`.** Un deck editable por diez personas deja de reproducir.
- ⛔ **Nunca `setSharing(ANYONE)`**: un link público de un deck de gobierno es un incidente, no un
  atajo. Que quede escrito en el comentario, porque es la línea que alguien va a querer usar el día
  que un mail falle.
- ⚠ **Un mail que falla no cancela la corrida.** Se anota y se sigue: el deck ya está generado y
  perderlo por un permiso sería el peor desenlace. Los fallos van al reporte **con el mail**, y el
  conteo dice **cuántos se compartieron sobre cuántos** — ⛔ un compartido que no reporta *«cero
  fallos»* no distingue *«anduvo todo»* de *«no se intentó»*. Es la regla de `CLAUDE.md` §4.
- ⚠ **Idempotente:** re-compartir con alguien que ya lo tiene no puede romper. Y **el propio dueño
  está en la lista**: compartirse un archivo con uno mismo también.

**B.3 — Y una consecuencia que se dice, no se descubre.** A partir de esto, **agregar un mail a
`mails_autorizados` es dar acceso a todos los decks que se generen desde ahí**. La celda deja de
ser sólo la puerta del panel. ⚠ El comentario de `API_CLAVE_AUTORIZADOS_` ya declara el riesgo de
que *quien edita la planilla puede agregarse a la lista*; ese riesgo **crece** con este cambio y el
comentario tiene que decirlo, no quedar como estaba.

⛔ **Los decks ya generados no se tocan.** Nada de barrer la carpeta compartiendo hacia atrás: eso
es una operación masiva sobre archivos que nadie midió.

---

## Parte C — una corrida por vez (Opus · effort alto)

El usuario declaró que no hace falta simultaneidad. **Eso es un requisito, y hoy no hay nada que lo
garantice:** con diez personas habilitadas, dos corridas encimadas dejan de ser hipotéticas.

**C.1 — El mismo mecanismo que ya existe.** El camino del panel toma `LockService.getScriptLock()`
antes de empezar, con la misma forma que `Desatendida.gs`: **si no lo consigue, no hace nada**.
⛔ No inventar un lock por hoja ni una bandera en `CONFIG`: una bandera en una celda **no es un
lock** —se puede leer entre el chequeo y la escritura— y además queda encendida para siempre si la
corrida muere.

**C.2 — Lo que ve quien queda afuera.** No un error: una pantalla que dice que hay una corrida en
curso y que pruebe en unos minutos. ⚠ **Sin nombres ni mails de quien la está corriendo** — mismo
criterio que la pantalla de rechazo, que muestra el motivo y nunca la identidad.

**C.3 — El alcance, y sale de A.4.** El lock cubre desde el primer write hasta el último, no sólo
el `makeCopy`. ⛔ Un lock que suelta antes de que `FALTANTES` se reescriba **no protege lo que este
requisito existe para proteger**.

**C.4 — El timeout se elige y se justifica.** `tryLock` con un número, y el comentario dice por
qué ése: cuánto tarda una corrida completa es un dato medido —está en `CORRIDAS`— y el timeout se
apoya en él. ⚠ Si no hay medición disponible, **decirlo y elegir conservador**, no fingir que el
número salió de algún lado.

---

## Parte D — documentación (Sonnet)

- `docs/SEGURIDAD.md`: la sección de acceso al dato pasa de *propuesta* a *implementada*, con B.1 y
  su fecha de vencimiento, y B.3. La parte de **identidad sigue abierta**: este prompt no la toca.
- `docs/PLAN.md`: **`D-47`** — *el acceso a las salidas se controla con la misma lista que el
  acceso al panel; una corrida por vez*. ⛔ **No editar `D-15`, `D-16` ni `D-18`**: derogar es del
  usuario. `D-47` **anota** que cubre la pieza 3 de `D-16` para el caso de un solo público, y que
  la pieza 1 sigue pendiente para el día de B.1.
- `docs/PENDIENTES_consistencia.md`: cerrar la entrada de la nocturna sobre el compartido
  inexistente (A.5 de aquel prompt), citando el commit. ⚠ Y **dejar abierta** la fila de
  concurrencia que menciona `PLAN.md`: el lock **impide** el encimado, no lo resuelve — dos
  personas que quieren correr a la vez siguen sin poder.
- `docs/RUNBOOK.md`: qué hacer cuando alguien ve la pantalla de corrida en curso, y cómo se agrega
  a alguien a la lista **ahora que eso también da acceso a los decks**.
- `docs/BITACORA.md` y `docs/HANDOFF_CODE.md`: la cola.

---

## Lo que este prompt NO hace

- **No toca `appsscript.json`** ni la identidad: eso espera al experimento.
- **No crea la hoja `ACCESOS`** (B.1, con su condición de vencimiento escrita).
- **No comparte decks viejos.**
- **No resuelve la concurrencia**: la impide.
- ⛔ **`--reintentar` no se usa en ninguna parte que escriba.**
