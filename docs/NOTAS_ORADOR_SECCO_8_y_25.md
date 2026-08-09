# Notas del orador de `SECCO_marcada` — láminas 8 y 25

> Repo: `docs/NOTAS_ORADOR_SECCO_8_y_25.md` · 08/08/2026
> **Por qué existe este archivo.** Son las dos únicas láminas de las dos plantillas que tienen
> texto en las notas del orador. El usuario decidió que **son documentación, no configuración**:
> se copian acá y se borran de la plantilla **antes** de que el `_11` selle, porque el sellado
> escribe el ancla en esa misma área y borrar después se llevaría el ancla puesta.
>
> **No son comentarios.** Están en el área de notas del orador, debajo del slide — no en el panel
> lateral de comentarios, que en las dos plantillas está vacío. Verificado con `python-pptx`
> sobre `Plan Inicial/_archivo/Plantillas/SECCO_marcada.pptx`.
>
> `JM_marcada` (22 láminas) **no tiene ninguna nota del orador.** `SECCO_marcada` tiene 29.
> Total 51, que es el número contra el que verifica `C.4` del `_11`.

---

## Lámina 8 — antecedentes de encuentros temáticos

> ANTECEDENTES
>
> Temática sobre Seguridad en Eje Oeste el 14/03 (misma audiencia): 521 inscriptos y 144
> asistentes (28% de asistencia).
>
> Temática sobre Movilidad en Eje Sur el 26/03 (misma temática): 698 inscriptos y 200 asistentes
> (29%). Esta vez hubo más inscriptos pero menor asistencia.

**Qué es.** Comparación manual contra dos encuentros temáticos anteriores, escrita para dar
contexto a la lámina de resultados. Los porcentajes están calculados sobre inscriptos.

**Por qué no es configuración.** Son datos de marzo que no salen de ninguna fuente conectada al
motor: alguien los miró una vez y los escribió. Si el día de mañana se quiere publicar una
comparación interanual, sale de las bases, no de acá.

---

## Lámina 25 — temas posteriores

> ⚠️ **Transcripción verificada contra la plantilla el 09/08/2026**, con
> `notasDeLaminaPorOrden('secco', 25)`, **antes** de borrar el original. Idéntica salvo un punto
> final que la transcripción había agregado y el original no tenía: **se retiró para que la copia
> sea literal**. El original en la plantilla medía 269 caracteres (267 de texto más dos saltos de
> línea, uno al principio y otro al final).

> Los días posteriores hubo cuatro temas principales: coparticipación, htal clínicas, uber y
> operativos de vendedores ambulantes. Hubo uno que fue un reflote de algo que pasó a principios
> de abril con una discapacitada y otra (actual) que fue por la del hospital durand

**Qué es.** Registro a mano de la agenda mediática de los días siguientes al informe. Nota de
trabajo, no dato del deck.

**Por qué no es configuración.** No tiene token, no tiene fuente y no tiene período: es la
lectura de una persona sobre una semana concreta.

---

## El orden, que importa

1. **Este archivo entra al repo** — hecho al commitearlo.
2. **Backup de `SECCO_marcada`** antes de tocarla.
3. **Se borran las dos notas** de la plantilla viva.
4. **Recién ahí corre el `_11`.**

Si se invierten 3 y 4, el sellado escribe el ancla en el área de notas y borrarla después se
lleva el ancla con el texto. Es la razón por la que el `_11` está frenado y no al revés.
