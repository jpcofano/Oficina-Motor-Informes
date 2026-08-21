# 2026-08-21_12 — Exploración: un banco de láminas compartidas, y en cada plantilla sólo lo propio

> **Estado:** no ejecutado · **subagente:** ninguno
>
> ⛔ **Este prompt NO construye nada. Es Parte 0 y termina en reportar y parar.** No hay Parte A, y
> escribirla antes de leer el reporte sería exactamente el error que este prompt viene a evitar.
>
> **La pregunta del usuario, 21/08:** *"hay que explorar cómo usar directamente secciones en
> informes y dejar en la plantilla del informe sólo lo propio."*

---

## Qué se está preguntando, dicho con precisión

Hoy **un deck es la copia de una plantilla**: el motor abre `INFORMES.plantilla_id`, la copia entera
y trabaja sobre esa copia. Todo lo que sale en el deck estaba en ese archivo.

La idea es otra: **un deck se ensambla**. Las láminas de las secciones compartidas viven en un solo
lugar, y la plantilla de cada informe conserva **sólo lo exclusivo**.

⚠ **Y hay que decirlo de entrada, porque cambia cómo se evalúa: esto no es una optimización, es un
cambio de arquitectura.** `C-01` dice que la plantilla es del equipo y el motor se adapta; acá el
deck deja de ser una copia de algo que el equipo mantiene y pasa a ser un ensamblado que el motor
decide. No lo descalifica — pero se decide sabiendo eso, no descubriéndolo después.

**Lo que lo justifica, medido:** 93 tokens compartidos por las dos plantillas, y el bloque de
campaña es **literalmente el mismo** — `camp_`, 53 de 53 tokens, ocho láminas sin diferencias
(`docs/INFORMES_relacion.md`). Ocho láminas mantenidas dos veces es el caso que paga esto solo.

---

## Parte 0 — cinco mediciones. Sólo lectura. **Reportar y parar.**

> **Modelo: Opus · effort alto.** No es mecánico: lo que se reporta decide si hay diseño o no.

### 1 · ⭐ La premisa dura: ¿se puede insertar una slide de OTRA presentación?

**Si no se puede, no hay diseño y el resto del reporte es curiosidad.** Medir contra la API de
Slides, sobre una copia desechable que se mande a la papelera al terminar —mismo procedimiento que
`probarSelladoSobreCopia`— y decir:

- si existe una operación que inserte en una presentación una slide **que pertenece a otra**;
- **qué viaja con ella**: texto, tablas, imágenes, notas del orador, y —crítico— el **layout y el
  master**;
- si queda **vinculada al original** o es una copia independiente, y si eso se puede elegir.

⚠ **Que las notas viajen ya está medido y muerde acá:** el ancla `#lamina: L-NNN` viaja con la
copia. Un banco compartido lo tiene que resolver, no descubrir.

### 2 · El formato: dos masters en un mismo deck

Si la slide importada trae su propio layout, un deck ensamblado desde dos archivos **tiene dos
estilos**. Medirlo sobre la copia desechable: importar una lámina de `jm` a una copia de `secco` y
reportar **qué se ve distinto** — fuentes, colores, posición de los placeholders, tamaño de página.

**Es el criterio de aceptación real de esta idea**, y no es técnico: un deck que se nota ensamblado
no lo firma nadie.

### 3 · ⭐ El orden del deck, que hoy no es una pregunta y pasa a serlo

**Medido y ya escrito:** el orden de salida es **la posición en la plantilla y sólo eso**; las
copias se ubican en `inicio + k`, y `SECCIONES.orden` ordena **secciones, no láminas dentro de una
sección**.

Con las láminas viniendo de dos archivos, **la plantilla deja de poder ordenar**. Reportar:

- qué tendría que decidir el orden — `SECCIONES.orden` para las secciones y **qué** para las láminas
  adentro de cada una;
- si hace falta una columna nueva en `LAMINAS`, y por qué no puede ser `orden_plantilla` (es
  reportada, nunca autoritativa, y hoy tiene 17 filas viejas en `jm` que no rompieron nada
  justamente porque nadie decide por ese número).

⚠ **Ésta es la pregunta que quedó abierta desde el `2026-08-21_4` y que hoy no muerde porque hay
una plantilla por informe.** Este diseño la vuelve obligatoria.

### 4 · Qué le pasa a `LAMINAS` y a `D-23`

Hoy la identidad de una lámina incluye su `informe_id`: 53 filas, 24 de `jm` y 29 de `secco`, y una
lámina compartida está **dos veces** con dos ids distintos.

Reportar qué cambiaría: si una lámina del banco tiene **una** fila y `informe_id` deja de ser parte
de su identidad, qué se rompe —el sellado, `verificarLaminas()`, el cruce ancla → fila— y **qué
parte de `D-23` habría que superseder**. No proponer el cambio: decir qué toca.

### 5 · El costo, en segundos

El presupuesto es de 350 s, el arranque son 80 y la duplicación es **una llamada a la API de Slides
por asignación**. Importar láminas de otro archivo son llamadas **adicionales**. Medir sobre la copia
desechable **cuánto tarda una importación**, y estimar con ese número el peor caso realista.

⚠ **Y decir explícitamente si el ensamblado se paga una vez por corrida o una vez por ítem**, porque
son dos órdenes de magnitud distintos.

---

## Lo que el reporte tiene que contestar, en una línea cada una

1. ¿Se puede? (punto 1)
2. ¿Se nota? (punto 2)
3. ¿Quién ordena? (punto 3)
4. ¿Qué decisión hay que superseder? (punto 4)
5. ¿Entra en el techo? (punto 5)

**Con cuatro sí y una respuesta al punto 3, hay diseño y se escribe otro prompt. Con un no en el 1 o
en el 2, esto se cierra y queda escrito por qué** — una idea descartada con motivo medido vale
tanto como una implementada, y evita que vuelva en dos semanas.

## Lo que este prompt **no** hace

- ⛔ No toca ninguna plantilla viva. Todo sobre una copia desechable que se manda a la papelera.
- ⛔ No escribe una sola fila de `LAMINAS`, `SECCIONES` ni `MARCADORES`.
- ⛔ No propone la arquitectura. Mide las cinco cosas que hay que saber antes de proponerla.
- ⛔ No se ejecuta antes que la Parte C del `2026-08-21_11`.
