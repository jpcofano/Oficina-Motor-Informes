# 2026-08-22_24 — ¿puede un deck ya publicado refrescar sus números?

> **Estado:** no ejecutado. ⏸ **Diferido por decisión del usuario, 22/08** — pertenece a la
> **fase 2** del proyecto y no se corre hasta que la fase 1 cierre. Es una hipótesis hasta que
> la Parte A reporte.
>
> ⚠ **Renumerado el 22/08.** Nació como `2026-08-21_15`, designador que ya estaba tomado por
> `2026-08-21_15_digital_cede_a_D-30`, ejecutado. Sus referencias internas a un `_16` también
> colisionaban y se reescribieron sin número.
>
> **Alcance de este prompt:** SÓLO Parte A. No hay Parte B escrita a propósito: el diseño
> depende de lo que A mida. Si A cierra, se escribe su continuación con el diseño.

---

## Contexto

El motor genera el deck y ahí termina su relación con él. El equipo trabaja sobre el deck
generado —edita textos, agrega láminas, reordena— y a partir de ese momento los números
quedan congelados en la fecha de corrida. Volver a generar produce un deck nuevo y tira
el trabajo del equipo.

La pregunta es si se puede **refrescar en el lugar**: releer las fuentes y reescribir
sólo los números del motor, sin tocar lo que puso una persona.

**Lo que ya está a favor** (no hay que volver a medirlo, está medido y documentado):

- el deck de salida es una copia de la plantilla;
- `slide.duplicate()` copia las notas del orador, así que **cada lámina del deck generado
  conserva su ancla `lamina_id`**;
- borrarle el ancla a la copia se evaluó y **se descartó**.

**Lo que está en contra:** el valor se escribe con `replaceAllText('{{token}}', valor)`.
El token es texto visible y **desaparece al llenarse**. Un deck publicado no tiene forma
de decir qué hueco era cuál.

**El patrón de la industria** —Rollstack y equivalentes— es no dejar nunca la identidad
del hueco en el texto visible: se rastrea por ID de lámina y por ID de elemento, del lado
del motor, y el refresh es selectivo. Acá el ID de lámina ya existe. Falta el de elemento.

**El candidato:** el alt-text del shape (`PageElement.setDescription` /
`getDescription`). No es un run de texto, así que `replaceAllText` no lo alcanza, y
sobrevive a que el equipo edite el texto visible. **Es un candidato, no una decisión.**
La Parte A existe para saber si aguanta.

---

## Parte A — censo de viabilidad · SÓLO LECTURA

**Modelo: Sonnet. Effort: alto** — es lectura cuidadosa de código y de un deck real, no
hay nada que decidir acá.

⛔ **No escribas una línea de código de producción en esta parte.** No toques plantillas,
no toques el deck testigo, no agregues columnas a ninguna hoja. Si algo hay que crear,
que sea un script de medición desechable y que lo digas.

⛔ **No propongas el diseño.** Si mientras medís se te ocurre cómo resolverlo, anotalo
como hallazgo lateral al final y seguí. El diseño es el paso siguiente, todavía sin escribir.

### A.1 — Qué sobrevive hoy en un deck publicado

Sobre el **deck testigo de `171421`** (`1iPQcoQY11lVhxM-P16R-8iVp5xS1D6YrfDELuU3XRDw`),
en modo lectura:

1. ¿Cuántas láminas tiene y cuántas conservan ancla `lamina_id` legible?
2. De las que conservan ancla, ¿cuántas comparten el mismo `lamina_id` con otra?
   (las repetibles se duplican: se espera que sí).
3. Para las láminas con `lamina_id` repetido: **¿hay algo en la lámina que diga de qué
   ítem es?** Buscá en las notas, en el alt-text de cualquier elemento, y en el texto
   visible. Reportá qué encontraste, aunque sea sólo el nombre del ítem impreso en un
   título — y en ese caso decí si es reconstruible sin ambigüedad o no.

⚠ **Este punto 3 es el que decide si el refresh es posible.** Sin identidad de ítem, una
lámina repetida no sabe qué fila releer. No lo redondees: si no hay nada, decilo.

### A.2 — ¿El alt-text aguanta?

Medición sobre una **copia descartable** de una plantilla (no la plantilla), que borrás
al terminar:

1. ¿`setDescription` / `getDescription` funcionan sobre los shapes que hoy llevan tokens?
   Usá el mismo recorrido que usa el motor para encontrar tokens, no `getShapes()`.
2. **¿Sobrevive a `slide.duplicate()`?** — o sea, ¿la copia hereda el alt-text como
   hereda las notas? Medilo, no lo supongas.
3. **¿Sobrevive a `replaceAllText`?** Escribí un alt-text, corré un `replaceAllText`
   sobre esa lámina, volvé a leerlo.
4. ¿Llega a shapes **dentro de tablas y dentro de grupos**? Éste es el punto donde
   `getShapes()` miente históricamente. Si un token vive en una celda de tabla, ¿tiene
   la celda un `PageElement` propio con alt-text, o el alt-text es de la tabla entera?
5. **Costo:** segundos por lámina de leer y de escribir alt-text en todos sus elementos.
   Con el techo de tiempo que ya conocemos, un número por lámina alcanza para saber si
   entra en el presupuesto.

### A.3 — La frontera de propiedad

Sin escribir la regla todavía, **enumerá contra el código** qué escribe hoy el motor en
el deck y qué no. Concretamente:

1. ¿El motor escribe alguna vez texto fuera de un `{{token}}`?
2. ¿Duplica, borra o reordena láminas después de la expansión inicial?
3. ¿Hay algún lugar donde el motor pise una lámina entera en vez de un token?

Esto es para saber **cuánta superficie del deck reclama el motor**. Si la respuesta es
"sólo el interior de los tokens", la frontera es limpia y el paso de diseño es corto. Si el motor
reordena o pisa láminas, el refresh es un problema más grande y hay que decirlo ahora.

### A.4 — Lo que ya existe y no hay que reinventar

1. `Snapshot.gs` declara en su cabecera que guarda config + datos para regenerar un
   informe viejo idéntico, y está sin implementar. **¿Es esto lo mismo que el refresh o
   es otra cosa?** Reportá la diferencia en dos líneas: regenerar idéntico y refrescar
   contra datos nuevos no son el mismo problema, y si el Paso 9 ya se diseñó para uno de
   los dos hay que saberlo antes de escribir el paso de diseño.
2. `FALTANTES` se pisa en cada corrida y lista por ítem. **¿Tiene hoy la columna que
   identifica la lámina emitida?** Si la tiene, media pieza del registro ya existe.

### A.5 — Reportar y parar

Un informe en `docs/` con:

- las respuestas de A.1 a A.4, cada número con su fecha de medición;
- **el veredicto en una línea**: el refresh en el lugar es viable / es viable con esta
  condición / no es viable por esto;
- los hallazgos laterales, sin arreglar ninguno.

⛔ **Parar acá.** No sigas al diseño aunque el veredicto sea verde.

---

## Fuera de alcance

- El diseño del refresh — es el paso siguiente.
- Tocar `Snapshot.gs`.
- Cualquier cambio en plantillas o en el deck testigo.
- Los `u1_` sin cablear y las 8 filas `REVISAR` del `MAPEO`: son otro frente.
