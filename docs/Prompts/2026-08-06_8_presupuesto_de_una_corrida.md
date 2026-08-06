# De qué está hecho el presupuesto de una corrida

**Un objetivo.** Que una corrida entera entre en los 360 s.

**Lo que cambió y hace posible medir.** Con `4934f9c` una invocación produce una
corrida. Hasta ahora cualquier tiempo podía estar midiendo dos.

**Las dos corridas que hay, y lo que muestran juntas:**

| | etapas 1+2 | etapa 3 | murió en |
|---|---|---|---|
| `05/08 231421` | ~~≤125 s~~ **no medido** | ~~~200 s (125→324)~~ **no medido** | etapa 4 |
| `06/08 135202` | 159 s | no la terminó | etapa 3 |

> **Corregido el 06/08, después de `0.0` — ver la nota al pie.** Las dos celdas
> tachadas **no son mediciones**: las cinco marcas de `marcarEtapa_` se pisan en la
> misma celda, así que de `231421` sólo sobrevivió la última, `4 · tokens fijos ·
> +324 s`. El `≤125 s` es una reconstrucción —así la anota `BITACORA.md`— y el
> `~200 s` es una resta sobre ella. **Lo medido es `1+2+3 = 324 s` el 05/08 y
> `1+2 = 159 s` el 06/08: dos tramos distintos, no dos observaciones del mismo.**

Mismo trabajo, y la muerte se corre de una etapa a otra. **La lectura es que el
presupuesto no da y la varianza decide dónde cae** — pero es lectura, no medición:
dos corridas no son una distribución, y **los "34 s de diferencia en 1+2" que decía
esta línea salían de restarle a 159 un número que nunca se midió.**

**Lo que sigue siendo candidato.** Que las mate el límite de 6 minutos. Ninguna
dejó registro de su propia muerte. El `ECONNRESET` del cliente a los ~302 s cortó
la conexión, no la ejecución.

**Lo que este prompt NO es.** No es reanudación por etapas. Si la medición muestra
que ni con la etapa 3 en cero entra, el trabajo es reanudación y este prompt
cierra ahí, con ese dato.

---

## Parte 0 — el presupuesto entero (sólo lectura, reportar y parar)

`0.0` · **El instrumento primero.** `marcarEtapa_` traga sus excepciones. Los
tiempos por etapa salen de restar dos marcas, y una marca ausente puede ser una
etapa que no llegó o una escritura que falló callada. **¿Hay forma de saber si una
marca se escribió?** Si no la hay, todo número de este prompt es candidato.

`0.1` · **Las etapas 1 y 2, y su varianza.** Son 125–159 s de un presupuesto de
360: más de un tercio, y es donde está el anclaje con sus 93 s. Cronometrarlas por
separado, y **decir de dónde sale la diferencia entre los dos días** si se puede.
Si no se puede, decirlo: entonces la varianza es un candidato sin nombre y hay que
contarla como riesgo.

`0.2` · **N.** Cuántas asignaciones devuelve `duplicarBloquesRepetibles_`. Sin N no
se multiplica nada.

`0.3` · **`resolverMarcadores` por ítem.** Arranca con `leerMarcadores_()` y
declara su `cache` local, así que cada llamada relee la hoja y tira lo que cacheó
la anterior. Medir la llamada entera, y aparte cuánto es `leerMarcadores_()`.

`0.4` · **`presentacion.getSlides()` por ítem.** El loop lo llama entero y lo
recorre linealmente por `objectId`. Medir un `getSlides()` sobre el deck expandido.

`0.5` · **`replaceAllText` por token.** Cuántos tokens toca una slide emitida y
cuánto cuesta cada reemplazo. Es el piso irreducible.

`0.6` · **Las etapas 4 y 5.** Estimarlas: cuántos tokens fijos quedan y cuántos
faltantes se escriben. **Si 1+2+4+5 ya se comen los 360 s, optimizar la 3 no
alcanza.**

**Reportar `0.0`–`0.6` y parar.** El reporte tiene que decir, con números, cuánto
cuesta cada pedazo del presupuesto y cuánto quedaría sacando lo repetido.

---

## Parte A — sacar lo repetido

Sólo lo que `0.3`–`0.5` hayan mostrado caro. **Nada por prolijidad.**

1. **Los marcadores, una vez.** Si `leerMarcadores_()` por ítem pesa, leerlo fuera
   del loop y pasarlo. La resolución sigue siendo por ítem —cada uno tiene su
   ventana y su `id_cuenta`—; lo que se deja de repetir es la lectura de la hoja.

2. **El cache, compartido entre ítems.** Hoy `var cache = {}` vive adentro de
   `resolverMarcadores` y muere con cada llamada. **Cuidado:** tiene que estar
   tipado por ventana y por `id_cuenta`, o dos ítems se comen el valor del otro. Si
   no se puede garantizar, **no tocarlo** y decirlo.

3. **Las slides, un mapa.** Si `getSlides()` por ítem pesa, armar
   `objectId → slide` una vez —la etapa 2 ya recorre el deck— y buscar ahí.

**Ninguna puede cambiar un valor.** Si un reemplazo sale distinto, la optimización
está mal y se revierte.

---

## Parte B — dos corridas, no una

Correr **dos veces**, una después de la otra, y reportar las dos filas. Con una
sola no se sabe si entró o si tuvo suerte: los 34 s de varianza ya movieron una
muerte de etapa.

Si las dos llegaron a la etapa 5: los cuatro objetivos que nunca se vieron contra
un deck —`SUMA` sobre cero filas, `ULTIMO` por fecha, el agregado global de
digital, el sembrado del Resumen Ejecutivo— por fin se pueden mirar. Reportarlos.

Si no llegaron: las filas dicen dónde, y el próximo prompt es reanudación.

---

## Cuándo está hecho

- El presupuesto está desglosado en números, y se sabe cuáles son medición y
  cuáles candidato.
- Dos corridas seguidas, o las filas dicen dónde se quedaron.

## El reporte

1. Las mediciones `0.0`–`0.6`.
2. Qué sacaste y qué dejaste, y por qué.
3. Que los valores no cambiaron.
4. Las dos filas de la Parte B.
5. Los cuatro objetivos, si hubo corrida completa.
6. Qué premisa de este prompt resultó falsa, si alguna.
7. Los números raros, sin analizarlos.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.

---

> **Nota de Code (06/08).** Este archivo se guardó primero con el prompt cortado
> en `0.0`; ésta es la versión completa. **`0.0` ya se ejecutó y se reportó**: las
> cinco marcas de `marcarEtapa_` escriben en la misma celda y se pisan entre sí,
> así que la fila sólo conserva la última que logró escribirse — no hay forma, desde
> `CORRIDAS`, de distinguir una etapa que no llegó de una escritura que falló
> callada. **Consecuencia sobre el propio prompt: el `≤125 s` de la tabla de arriba
> y el `~200 s` derivado de él no son mediciones**, y por lo tanto tampoco lo son
> los "34 s de diferencia" ni el rango "125–159 s" que cita `0.1`. Lo medido es
> `1+2+3 = 324 s` el 05/08 y `1+2 = 159 s` el 06/08.
