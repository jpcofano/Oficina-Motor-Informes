# Dos cosas a `CLAUDE.md`: revisar el prompt antes de ejecutarlo, y el conocimiento de plataforma

**Un objetivo.** Documentación. No se toca código, no se corre nada.

**Origen.** Las últimas dos corridas. La primera atribuyó la muerte al límite de
6 minutos sin evidencia que descartara la contención de Sheets; la segunda la
corrigió. Y en ninguna se estaba aplicando conocimiento de Apps Script como
plataforma, que es donde estaba la respuesta.

---

## Parte 0 — dónde va cada una (sólo lectura, reportar y parar)

`0.1` · **Lo que ya existe.** La §4 ya dice que un prompt no ejecutado es una
hipótesis y que las premisas se verifican antes de la primera edición. Leerla
entera. **Lo que sigue extiende esa sección, no abre una paralela** — salvo que
`0.2` diga otra cosa.

`0.2` · **El ruteo.** Según la §3 y la §7, ¿dónde vive una regla sobre el
comportamiento de Code al recibir un prompt, y dónde una sobre conocimiento de
plataforma? Puede que no sea el mismo lugar. Reportar la ubicación propuesta para
cada una antes de escribir.

`0.3` · **Duplicados.** Greppear `CLAUDE.md`, `PLAN.md` y `HANDOFF_CODE.md` por si
algo de esto ya está escrito en otro lado. Si está, **no se duplica**: se
referencia o se amplía donde ya vive.

`0.4` · **Contradicciones.** ¿Alguna de las dos choca con una D-NN, R-NN o S-NN?

**Reportar `0.1`–`0.4` y parar.**

---

## Parte A — el texto

Redactar en el estilo del documento, no pegar esto tal cual. El contenido es este:

### Revisar el prompt antes de ejecutarlo

Un prompt es una hipótesis escrita por alguien que no midió. Antes de ejecutarlo,
revisarlo contra el repo y reportar lo que habría que cambiar:

- Una premisa que el repo desmiente. Ya está cubierto por la Parte 0.
- Un paso que pide hacer algo que ya está hecho, o que el repo muestra innecesario.
- Un método peor que uno disponible. Proponerlo; no cambiarlo en silencio.
- Una decisión D-NN / R-NN / S-NN que el prompt derogaría sin decirlo.

**Mejorar no es ampliar.** No agregar objetivos, no arreglar de paso lo que se ve
roto al lado, no refactorizar lo que se toca. Si aparece algo que merece prompt
propio, se anota en el reporte y sigue.

**Y no inventar el faltante.** Si el prompt no alcanza para saber qué hacer, eso
se reporta como falta. No se completa con un supuesto razonable: un supuesto
razonable metido en silencio es indistinguible de una instrucción, y sobrevive a
la corrida.

### Conocimiento de plataforma

En lo que toca ejecución —límites de tiempo, cuotas, bloqueos, timeouts propios de
cada servicio, concurrencia sobre la misma planilla, costo de `flush()`,
`LockService`— aplicar el conocimiento de Apps Script como plataforma. Es un
cuerpo de conocimiento que este proyecto no venía usando.

**Sirve para generar candidatos, no para cerrar causas.** Distinguir siempre el
hecho de plataforma —citable— de la afirmación sobre esta corrida, que necesita
evidencia de esta corrida.

**Causa y observación no son lo mismo.** "Murió a los 324 s" es una observación.
"Murió por el límite de 6 minutos" es una causa, y necesita evidencia que descarte
las otras. Sin eso va como candidato, nombrado como candidato.

**Una medición con dos cosas corriendo no es una medición.** Antes de tomar un
número como dato, verificar que hubo una sola corrida.

**El instrumento es parte del sistema.** La instrumentación escribe en la misma
planilla que se está diagnosticando. Cuando el síntoma es contención o tiempo,
preguntarse si el instrumento participa del problema antes de leer lo que informa.

---

## Parte B — el registro

Entrada en `docs/BITACORA.md` con el origen: las dos corridas y la causa mal
atribuida. Commit de documentación, separado.

Si algo de esto amerita una D-NN en `PLAN.md`, proponerla; **no crearla sin
decirlo**.

---

## Cuándo está hecho

- Las dos reglas están en `CLAUDE.md`, cada una en el lugar que `0.2` señaló, sin
  duplicar lo que la §4 ya dice.
- `BITACORA.md` tiene el origen.

## El reporte

1. Las mediciones `0.1`–`0.4`.
2. Dónde puso cada una y por qué.
3. Qué encontraste ya escrito, si algo.
4. Qué decisiones tomaste solo.
5. Qué premisa de este prompt resultó falsa, si alguna.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
