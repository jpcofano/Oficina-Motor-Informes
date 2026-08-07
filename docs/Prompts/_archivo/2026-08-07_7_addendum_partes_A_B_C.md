# Addendum al prompt `2026-08-07_7_flujo_lamina_nueva_y_ancla.md` — luz verde a las Partes A/B/C

**Un objetivo.** Escribir `D-23`, el addendum de `C-01` y la sección del RUNBOOK, con los
ajustes que salieron de la Parte 0. **Cero `.gs`.** El prompt original queda como está: la
Parte 0 ya corrió, así que se le agrega este addendum en vez de editarlo.

**Luz verde.** Los tres números de `0.3` son distintos de cero, `0.3.c` confirma que el
segundo campo del ancla hace falta, y `0.1` no encontró bloqueo. Se sigue con A, B y C.

---

## Los seis ajustes

`AJ-1` · **Una fila más en la tabla de descartes de `A.1`: la sintaxis `{{…}}` para el ancla.**
Razón medida en `0.6`: `presentacion.replaceAllText` alcanza las notas del orador, y la
barrida de faltantes (`Generador.gs`) convertiría un `{{lamina}}` de las notas en
«FALTA:lamina» **en el deck publicado**. Es evidencia, no preferencia.

Y el complemento, verificado aparte: **los tres llamadores de `replaceAllText` envuelven en
llaves** — `RENOMBRES_ARMONIZACION_`, `RENOMBRES_COMUNICACIONES_POST_` y la barrida. Por eso
la sintaxis `#seccion:` / `#lamina:` sobrevive. Escribirlo en `D-23` **como regla, no como
hecho**: cualquier renombre futuro que pase texto pelado en vez de `{{token}}` puede corromper
el ancla, y por eso las entradas de renombre van siempre con llaves.

`AJ-2` · **El alt text se descarta por un hecho, no por un "ajustar según".** `0.7` midió que
`TableCell` no expone `setDescription` ni `setTitle`: la propiedad existe sólo en el
`PageElement` tabla completa. Escribir esa razón en la tabla de descartes y sacar la
condicional.

`AJ-3` · **"Anexar, nunca reemplazar" baja a `A.1` y a `B.1`.** `0.5` encontró dos láminas de
`secco` con notas del orador escritas por el equipo (láminas 8 y 25), y la 8 es además la que
sale triple-ambigua en `0.3.a`. El prompt original decía "no se pisa lo que haya" sólo en la
Parte 0. En `D-23` va como propiedad del ancla; en el addendum de `C-01`, como límite de lo
autorizado: **el motor anexa una línea, nunca `setText` sobre las notas.**

`AJ-4` · **El sellador separa identidad de clasificación, y esto corrige el diseño.**
`0.3.b` dio 26 láminas sin sección deducible entre las dos plantillas. Tal como estaba escrito
—default-deny sobre todo el sellado— la Fase 2 no puede avanzar sin la hoja `LAMINAS`, y la
Fase 3 no puede existir sin la clave que escribe la Fase 2. Se rompe así:

- **`#lamina: L-NNN` se escribe siempre**, en todas las láminas. Asignar un id no requiere
  saber a qué sección pertenece: es el siguiente libre. La identidad no depende de la
  clasificación.
- **`#seccion:` se escribe sólo donde se deduce.** Ahí sigue rigiendo default-deny: no se
  adivina.
- **El reporte es por lote.** El sellador recorre todo, informa **las 26 juntas** y para. No
  para en la primera: eso serían 26 rondas.
- Las que quedan sin `#seccion:` esperan a la Fase 3, donde la hoja `LAMINAS` —ya con clave,
  porque el id se escribió— le da al usuario dónde declararlo.

`D-23` tiene que decir el número: **el primer sellado deja ~26 láminas sin clasificar, y eso
es una campaña de clasificación con participación humana, no una operación automática.** Es el
tamaño real de la Fase 2 y conviene que esté escrito antes de empezarla.

`AJ-5` · **La línea de base de `0.4` se amplía antes de escribirla en `D-23`.** `0.4` contó 1
fila que enumera tokens exactos (`ecv_alcance_semanal`). Pero el mismo fenómeno tiene otra
forma: secciones que existen para **nombrar una lámina**, no para modelar un concepto —
`encuentro_iceberg`, `m2_status`, `m2_caudal`, las tres `modo = unica`. **Contarlas y listarlas**
(criterio: `modo = unica` cuyo `familia_tokens` comparte prefijo con otra sección). Van a
`D-23` como **candidatas** a colapsar en la Fase 4, no como tarea: alguna puede ser un
concepto legítimo. Ése es el pago de la Fase 4 medido, en vez de "1".

`AJ-6` · **La observación de fecha de `0.2` no se pierde.** La sección de `REGLAS_NEGOCIO.md`
lleva fecha 14/08/2026 y hoy es 07/08. Una línea en `docs/PENDIENTES_consistencia.md`, en el
commit de la Parte B, diciendo el hecho y nada más. **No se corrige la fecha en esta corrida**:
no sabemos cuál de las dos está mal.

`AJ-7` · **La taxonomía de secciones, con vocabulario probado.** Entra en `D-23` como
decisión, con esta forma y no otra:

- **`modo` sigue siendo comportamiento de máquina**, y se le agrega el valor que falta:
  `estatica` — la lámina no lleva datos nunca. Es lo que explica una parte grande de las 26
  huérfanas de `0.3.b`: no están sin clasificar, no tienen tokens. El modelo de bandas de la
  industria (JasperReports, BIRT, Crystal) tiene el mismo concepto separado del resto.
- **`rol` entra como columna editorial, explícitamente sin comportamiento**, con el
  vocabulario de bandas: `caratula`, `indice`, `resumen`, `detalle`, `agregado`, `cierre`.
  En el modelo de bandas la banda **es** el comportamiento —`detail` se imprime por cada
  registro, `summary` una vez al final—; acá no, porque las láminas ya existen maquetadas y
  el comportamiento lo decide `modo`. **Escribir esa diferencia en `D-23`**: si `rol` empieza
  a decidir algo, hay dos columnas mandando sobre lo mismo.
- **`getLayout()` de Slides es pista, no clasificación.** El `PredefinedLayout` (`TITLE`,
  `SECTION_HEADER`, `BLANK`, `BIG_NUMBER`…) es estructura visual y ayuda a separar carátulas
  de láminas de datos, pero no dice cuándo se emite una lámina. Se usa para proponer, nunca
  para decidir solo.
- **Condición para escribir esto**: `0.4` del prompt `_8` confirma qué valores de `modo`
  consulta el motor. Si resulta que `agregado` y `unica` no tienen código detrás, `D-23` lo
  dice — una taxonomía que describe comportamiento inexistente envejece mal.

`AJ-8` · **El régimen de selección no es una columna nueva: es `D-09`.** El usuario planteó
que la sección tiene un filtro por defecto —la ventana del informe— o un temario, y que eso
define qué se repite. Eso ya está decidido: `D-09` declara los dos regímenes, **por período**
(la fila entra si su fecha cae en la ventana) y **por temario** (el universo lo define una
lista curada y la fecha no decide, `R-04`), derivados de `SECCIONES.itera`, con el caso mixto
nombrado. `D-23` **cita `D-09`, no lo reescribe**, y deja escrita la separación de tres:

| columna | qué decide |
|---|---|
| `itera_sobre` | **qué universo** se recorre — es donde vive el régimen de `D-09` |
| `filtro` | **qué se acota adentro** de ese universo (hoy el único caso es `etapa=post`) |
| `modo` | **cuántas veces** se emite la lámina |

Ninguna de las tres pisa a las otras, y la herencia lámina→sección por celda vacía vale para
las tres igual.

`AJ-9` · **Orden de ejecución.** Este addendum corre **después** del prompt
`2026-08-07_8_inventario_clasificable_laminas.md`. `D-23` sale una sola vez, ya con la
taxonomía adentro y con el tamaño real de los dos bloques de láminas huérfanas medido — no se
escribe dos veces.

---

## Lo que no cambia del prompt original

Partes A, B y C tal como están escritas, con estos seis ajustes incorporados. En particular
siguen valiendo: el ancla de dos campos con `#lamina:` global y opaco; la herencia por celda
vacía entre lámina y sección; que `A.2` escriba la dirección de `C-01` sin derogarla; que `B.2`
diga qué **no** autoriza; que `C.2` conserve el ancla en la copia generada con su consecuencia
dicha; y que `C.4` no documente la hoja `LAMINAS` todavía.

## Commits

Uno por parte (A, B, C), documentación, sin `—`. La línea de `AJ-6` entra en el commit de B.
`git push` después de cada uno.

## Verificación

Se cierra cuando el usuario lee `D-23`, el addendum de `C-01` y la sección del RUNBOOK y
confirma que describen lo que decidió. **No seguir con la implementación del sellador.**
