# Addendum — `2026-08-06_6_una_invocacion_una_corrida.md`

La Parte 0 tumbó tres premisas del prompt. Este addendum las corrige y rehace la
Parte A, que tal como está escrita no cierra el reintento sobre `generarInforme`.

---

## Lo que queda corregido

**Son 22 decks y 11 huérfanos, no 29 y 18.** Los siete del 04/08 18:42 son
shortcuts de Drive. El prompt avisaba que el conteo envejece; no fue eso — siete
archivos nunca fueron decks.

**"Escenario A confirmado por el reloj de Drive" estaba mal fundado.** El patrón
de seis minutos se sostiene sobre los grupos del 05/08, que son medición directa.
Lo que no se sostiene es haberlo apoyado en los siete simultáneos.

**"`232018` murió en `abrirCorrida_` por timeout del servicio de Sheets" no tiene
respaldo escrito y no se vuelve a repetir.** Lo durable es la observación: la fila
se abrió y nunca marcó la etapa 1. Las dos lecturas que nombraste —muerte en la
rendija, o `marcarEtapa_` fallando en silencio las cinco veces— siguen abiertas y
la fila no las separa.

**Queda anotado, para prompt propio:** si `marcarEtapa_` traga sus excepciones,
una corrida puede llegar a la etapa 4 y dejar la fila diciendo que no arrancó. El
instrumento tiene un punto ciego justo donde estamos mirando. **No se toca acá.**

---

## Parte A — el corte, por `fn` y no por acción

Tenés razón: `llamar` es la única acción que llega al motor, y adentro conviven
`fn=leerMapeo` y `fn=generarInforme`. A nivel de acción no hay corte posible.

El criterio se mueve al nombre de función, y la propiedad que se conserva es la
misma: **el cliente no puede saber si `fn` escribe, así que por defecto no
reintenta.** Dos formas de escribirlo, y **elegís vos** con lo que ya medisteis:

- **Lista blanca de `fn` de lectura.** Automática, sin que nadie se acuerde de
  nada. Envejece: cada función nueva de lectura nace sin reintento hasta que
  alguien la agregue. Falla del lado seguro.
- **Reintento explícito por parámetro.** El que llama declara que la llamada es
  segura; por defecto no se reintenta. No envejece y no necesita mantenimiento,
  pero pone el criterio en quien escribe el comando.

**`eval` no entra en ninguna lista blanca**, corra lo que corra: el cliente no
puede saber qué hay adentro del snippet.

Elegí una, decí por qué descartaste la otra, y dejá dicho qué pasa con las
mediciones que venís haciendo por `llamar fn=eval` — si pierden el reintento, es
un costo que hay que nombrar, no descubrir después.

**Actualizar el comentario del 04/08 en `tools/api.js`.** Hoy dice que el HTML es
transporte y que aparece sin patrón. Los grupos del 05/08 muestran un patrón de
seis minutos.

---

## Parte B — comprobar

Una invocación de `generarInforme`. **Una fila, un deck.**

Que el reintento siga vivo para lo que quedó adentro del criterio elegido. Si no
se puede provocar una falla de transporte, decirlo.

---

## Parte C — corregir el inventario y borrar

`C.0` · **Corregir la tabla de `2bcdb4a` antes de borrar nada.** Trata como decks
a los siete shortcuts. Que la tabla diga el tipo de cada archivo, y que el
recuento quede en 22 decks, 17 filas, 11 huérfanos. Commit.

`C.1` · **Los siete shortcuts se borran, y se dice qué eran.** Tu `0.4` los
explica: son el rastro de la limpieza de las 18:42 del 04/08, no corridas. Eso va
en la tabla.

`C.2` · **Los once huérfanos, todos del 05/08.** Borrar. Ninguno se reserva.

`C.3` · **Las seis filas de `CORRIDAS` que apuntan a decks que ya no están.**
Anotarlas en la tabla como tales. **No se tocan las filas** — `CORRIDAS` es
registro.

`C.4` · **Marcar como superado el 34 con valor / 288 faltantes** donde se cita:
se midió sobre el denominador viejo de 195 y hoy son 172.

`C.5` · **Cerrar el conteo.** Decks contra filas. Si no cierra, reportar y parar.

---

## Cuándo está hecho

- Una invocación deja una fila y un deck.
- La tabla del inventario distingue decks de shortcuts antes de que se borre nada.
- La carpeta cierra contra `CORRIDAS`.

## El reporte

1. Qué criterio elegiste para el reintento y por qué descartaste el otro.
2. Qué pasa con las mediciones por `eval`.
3. Cuántos archivos borraste, por tipo, y si el conteo cerró.
4. Qué decisiones tomaste solo.
5. Qué premisa de este addendum resultó falsa, si alguna.
6. Los números raros, sin analizarlos.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
