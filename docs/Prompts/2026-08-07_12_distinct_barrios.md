# `DISTINCT` de barrios — las cinco decisiones, cerradas

**Un objetivo.** Documentación. **Cero `.gs`, cero hojas, cero corridas.** Deja escrito qué
tiene que devolver una lista `DISTINCT`, para que la implementación —que es **otro prompt**—
no tenga que adivinar. Hoy `ecv_barrios` no se puede implementar porque falta esto, no porque
falte código.

**Las decisiones del usuario, 07/08/2026, textuales y en orden:**

1. **Salen todos los barrios que sobrevivan al filtro de la sección, sin repetir.** No es un
   top-N y no se trunca.
2. **Deduplicar plegando mayúsculas y acentos.** *Palermo* y *palermo* son **el mismo barrio**.
3. **Mientras no exista lista canónica, se publica el valor tal como está escrito en la
   celda.** No se transforma: nada de title case, que rompería *Villa Gral. Mitre*.
4. **Orden alfabético.**
5. **Listas canónicas por categoría**, para que la forma publicada tenga una fuente y no
   dependa de qué fila se leyó primero. **Deseable a futuro, sin fecha.**
6. **Cada barrio va en su propia caja.** El separador —la coma— queda escrito pero sin uso
   mientras rija esta forma. Colisiona con `ecv_barrio1-3`, que son tres ranuras `[MANUAL]`.
7. **Cuántos son, dato del equipo:** entre **3 y 6** barrios por semana, promedio **4**. Por eso
   el desborde de la caja deja de ser el caso a resolver. **Es dato del usuario, no una
   medición del motor** — se escribe así.

---

## Parte 0 — medir antes de escribir (sólo lectura, reportar y parar)

`0.1` · **Cuál es el próximo `R-NN` libre.** El prompt `2026-08-07_10.1` escribe `R-17`; si ya
corrió, éste es `R-18`. **Medirlo, no asumirlo.**

`0.2` · **El alcance exacto de `R-10`, citando su enunciado.** La lectura de afuera dice que
`R-10` habla de **encabezados de columna**, no de valores de celda. Si es así, esta regla nueva
**no deroga ni excepciona nada** y el `P2` está mal enmarcado (ver `0.5`). Si `R-10` alcanza
también a los valores, **parar**: entonces sí hace falta una derogación fechada y esta corrida
cambia de forma.

`0.3` · **Qué hace exactamente `normalizar_` (`Parseo.gs`).** No alcanza con "pliega case y
acentos": decir si además colapsa espacios, si toca puntuación y si toca guiones. Importa para
*Villa Gral. Mitre* y *Villa Gral Mitre*, que son el caso real de esta lista.

`0.4` · **Cuántos barrios distintos hay y cuántos colapsan.** Sobre `rdv/RVD JM-CM - ES`,
columna `barrio`, en la ventana del informe: cantidad de valores distintos **tal cual**, y
cantidad de valores distintos **después de `normalizar_`**. La diferencia dice si el caso
*Palermo* / *palermo* existe hoy en la base o es hipotético. Y contrastar el total con el
"entre 3 y 6, promedio 4" del usuario: **si no coinciden, reportarlo y parar** — significa que
el filtro que el motor aplica no es el que el equipo tiene en la cabeza.

`0.5` · **Dónde está escrito hoy el estado de las cinco decisiones**, y transcribir la frase
del `P2` que dice que `R-10` empuja en contra. Es la que hay que corregir en la Parte C.

`0.6` · **Qué cajas existen hoy en la lámina 5 para barrios.** Sobre `JM_marcada`: cuántas
cajas llevan `{{ecv_barrio1}}`, `{{ecv_barrio2}}`, `{{ecv_barrio3}}` y `{{ecv_barrios}}`, si son
cajas separadas o texto dentro de una, y con qué rótulo. Y del lado del motor: **si existe hoy
un mecanismo de desborde** —repetir la lámina o la caja cuando los ítems superan las ranuras—,
dónde vive y qué familias lo usan. `campana_desag_mail` desborda por decisión del 07/08; decir
si eso ya está implementado o es sólo una decisión escrita. **Es lo que decide si `B.4` es un
cableado o una lámina nueva.**

**Reportar `0.1`–`0.6` y parar.**

---

## Parte A — la regla, en `REGLAS_NEGOCIO.md`

`A.1` · Escribir la `R-NN` que confirme `0.1`. **General para cualquier lista `DISTINCT`, no
sólo barrios** — el usuario pidió explícitamente que valga para todas las categorías.

Lo que tiene que fijar, y nada más:

- **La clave de comparación es el valor normalizado** (`normalizar_`), con lo que `0.3` haya
  medido que eso incluye.
- **La forma publicada es el valor de la celda, sin transformar.** Cuando dos variantes colapsan
  a la misma clave, gana **la primera en el orden de lectura de la fuente** — no la más
  frecuente, no una forma inventada. Es un desempate determinista: sin él, dos corridas sobre
  la misma base podrían publicar distinto. **Marcarlo como desempate, para que la lista canónica
  del backlog lo reemplace cuando exista.**
- **El orden de salida es alfabético sobre la forma publicada**, con comparación de castellano
  —los acentos no mandan las eñes al final—. Alfabético es lo que hace la lista reproducible
  entre corridas; el orden de aparición no lo es.
- **No se trunca.** Salen todos los que sobrevivan al filtro. Si no entran en la caja, **el
  motor no recorta**: es un problema de plantilla y se resuelve ahí.
- **Cero filas da `sin_datos`**, no `""` ni `0`. Ya estaba resuelto por el precedente de `SUMA`
  en el `P2`: se escribe acá **con esa referencia**, para que la regla se lea entera en un solo
  lugar.

`A.2` · **Qué NO dice esta regla, y hay que decirlo:** no toca `R-10`, que rige la lectura de
**encabezados**. Son dos normalizaciones distintas con dos propósitos distintos y conviven.
Escribirlo explícitamente — es el malentendido que el `P2` ya tuvo una vez.

## Parte B — las dos editoriales, en `CONFIG_INFORMES.md` §1.4

`B.1` · **El separador es la coma** (`", "`). Decisión del usuario, 07/08/2026. **Hoy no se
usa**: `B.4` decidió una caja por barrio. Se escribe igual, marcado como la forma que rige si
se vuelve a la lista en una sola caja — una decisión tomada no se descarta porque el diseño la
esquive.

`B.2` · **Que no se trunca**, con su motivo medido por el equipo: 3 a 6 barrios, promedio 4.
**Escribirlo como dato del usuario y no como medición del motor** — `0.4` mide lo que ve el
motor, y si difiere queda anotado, no promediado.

`B.4` · **Cada barrio va en su propia caja.** Decisión del usuario, 07/08/2026. Se escribe en
§1.4 como decisión tomada, con dos consecuencias que hay que dejar dichas:

- **El separador de `B.1` queda sin uso mientras rija esta forma.** Las dos no conviven: o una
  caja con lista, o N cajas con un barrio cada una. La coma queda escrita como lo que rige si
  alguna vez se vuelve a la lista, y **se dice que hoy no se usa** en vez de borrarla.
- **Choca con `ecv_barrio1-3`**, que §1.4 declara `[MANUAL]` y son **tres ranuras para 3 a 6
  barrios**. Escribir la colisión, no resolverla acá: si las cajas de barrio pasan a salir del
  `DISTINCT`, esos tres dejan de ser carga manual, y eso es la `[?]` de `B.3` respondida por un
  camino distinto del que esa `[?]` preguntaba. **No darla por respondida sin el usuario.**

**Y una parada:** si `0.6` reporta que hoy hay **tres ranuras y ningún mecanismo de desborde**,
la decisión queda escrita igual pero **su implementación es otro prompt** —agregar cajas a la
plantilla y hacer desbordar una familia no es cableado—. Decirlo en §1.4 y en el `P2`, y **no
tocar la plantilla en esta corrida**.

`B.3` · La `[?]` de los tres barrios destacados (`ecv_barrio1-3`, ranking automático o manual)
**no se toca**. Sigue abierta y es de otra pregunta.

## Parte C — cerrar el `P2` en `PENDIENTES_consistencia.md`

`C.1` · Las cinco decisiones pasan a resueltas, **apuntando a su dueño y sin repetir el texto**:
la 1, 3 y 4 a la `R-NN` nueva; la 2 y la 5 a `CONFIG_INFORMES.md` §1.4.

`C.2` · **Corregir la frase sobre `R-10`**, con lo que midió `0.2`. El `P2` dice que ésta es *la
única de las cuatro donde una regla escrita empuja en contra del comportamiento deseable*, y
eso resultó falso: `R-10` no alcanza a los valores. **La corrección va fechada y explicando el
error**, no borrando la frase: entender por qué se creyó que había un conflicto vale más que la
frase limpia.

`C.3` · El `P2 · ecv_barrio no puede usarse como prefijo de familia` **es otro pendiente y no se
toca**.

## Parte D — el backlog, en `PLAN.md` §4

`D.1` · **Listas canónicas por categoría**, sin orden y sin fecha. Una línea que diga qué
resuelve —que la forma publicada tenga una fuente en vez de depender de qué fila se leyó
primero— y que apunte al desempate de `A.1` como lo que vendría a reemplazar. **No es una
`D-NN`**: es un deseo, no una decisión de arquitectura tomada.

## Commits

Uno por archivo tocado. Documentación. Sin `—`. `git push` después de cada uno.

## Verificación

Se cierra cuando `ecv_barrios` tiene, en un solo lugar por pregunta, la respuesta a: qué filas
entran, cómo se deduplica, qué forma se publica, en qué orden, con qué separa y qué pasa con
cero filas. **Si alguna sigue sin dueño, la implementación de `DISTINCT` no puede empezar.**
