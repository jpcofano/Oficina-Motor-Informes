# `_29` · Después de la demo — la retracción y las dos cascadas

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Este archivo reemplaza al `_29` anterior, que nunca se pasó.** Aquél proponía re-apuntar el
> agregado semanal al universo del temario, apoyado en `V-38` = 2445 marcado *exacto*. **`C-28`
> retracta `V-38` a `V-45`:** 2445 no salió de ningún deck, lo midió la rama de validación con un
> rango 23/07–31/07 elegido a mano, y es la **unión** de dos universos, no uno de ellos.
>
> **Nada de esto corre antes de la demo.** El commit del arreglo va en la Parte 0 del `_30`.

---

## Parte A · Premisas — sólo lectura, termina en reportar y parar

**Modelo: Sonnet, effort alto.**

**A.1** — `docs/casos_validacion_2026-08-09_addendum.csv` **en el repo** está desactualizado. La
versión viva tiene 95 casos e incluye `V-71` y `C-28` a `C-37`. Reportar cuántos casos tiene la
copia del repo y cuál es el último `caso_id` de cada serie que figura ahí.

**A.2** — Citar el texto del `Addendum 1` de `R-17` tal como está hoy en `docs/REGLAS_NEGOCIO.md`,
y decir en una línea qué afirma sobre el universo del agregado `ecv_*`.

**A.3** — Citar la cascada de tres niveles de `R-21` tal como está escrita hoy, y su bloque
*"Estado de implementación"*. Textual, no parafraseado.

**A.4** — Buscar en `CLAUDE.md` si la cascada de selección de encuentros está repetida ahí, entera
o en parte. Reportar sí o no, con la cita si la hay. **No editar `CLAUDE.md` en esta parte.**

**Reportar y parar.**

---

## Parte B · Incorporar el CSV vivo

**Modelo: Sonnet.**

Reemplazar `docs/casos_validacion_2026-08-09_addendum.csv` por la versión que entrega el usuario.
Es un reemplazo de archivo, no una fusión. Reportar el delta de casos, sin interpretarlo.

---

## Parte C · `Addendum 2` a `R-17` — el universo del agregado queda en revisión

**Modelo: Opus, effort alto.** Resuelve una contradicción documental.

El `Addendum 1` de `R-17` dice que para `ecv_*` el agregado suma los encuentros que `R-21`
seleccionó — una decisión fija, igual para todos los informes. Lo medido lo contradice:

| caso | qué mide |
|---|---|
| `C-29`, `C-33`, `C-37` | **tres decks `jm` publicados, ninguno tiene lámina agregada.** Ninguno trae inscriptos, encuentros ni barrios impactados: sólo los individuales por encuentro. Los 28 tokens `ecv_*` de la lámina 5 de `JM_marcada` no reproducen nada que el equipo publique en `jm` |
| `C-30` | **`secco` sí tiene agregado, y usa un tercer universo**, declarado por escrito en su propia lámina 5: último trimestre, período de reuniones más reciente de JM, con exclusión de encuentros uno a uno. Y además **segmenta por tipo**: una lámina agrega RdV + Encuentro Temático, otra sólo Primera Persona |
| `C-28` | `V-38`…`V-45` retractados |
| `V-71` | 2333 es la suma de los cuatro encuentros que el deck publica **individualmente** — no es un agregado publicado |

Escribir el `Addendum 2` con esto, **sin decidir el diseño**. Lo que tiene que dejar asentado:

1. El `Addendum 1` **no se deroga y no se aplica**: queda **en revisión**, con los casos citados
   por `caso_id`.
2. **El universo del agregado no es una constante del motor: es una propiedad del informe.**
3. **El eje no es ventana-contra-temario.** `C-30` muestra tres dimensiones: ventana, exclusión
   por tipo de encuentro, y segmentación por tipo en láminas distintas. Un booleano no alcanza, y
   escribirlo como booleano sería enumerar en vez de derivar — el error de `§5.1`.

**No implementar nada.** Ni columna en `INFORMES`, ni `D-NN`, ni un marcador.

---

## Parte D · La cascada de `R-21` — corregir el nivel 2 y fechar el 3

**Modelo: Opus, effort alto.** Resuelve una divergencia entre la regla escrita y lo que el usuario
declara como su flujo.

El usuario enunció la cascada así, 11/08: **si hay temario manda el temario; si hay período
personalizado manda el período personalizado; si no, la semana en curso.**

`R-21` ya tiene esa cascada y **los niveles 1 y 3 coinciden**. **El 2 no.** `R-21` escribe el nivel
2 como *"filtro explícito del usuario, vía `SECCIONES.filtro`"*, y lo que el usuario describe es un
**período personalizado** — el override que viaja por la cadena de `D-20` y que el Panel expone
como selector de período. **Son dos mecanismos distintos**, y hoy la regla nombra el que no es.

Escribir un `Addendum` a `R-21` que:

1. **Corrija el nivel 2** a *período personalizado explícito*, citando el origen —enunciado del
   usuario, 11/08/2026— y diciendo por qué el texto anterior era otra cosa. `SECCIONES.filtro`
   **no desaparece**: acota lo que el nivel ya eligió, que es lo que `R-17` nivel 2 dice para
   campañas. Dejar esa relación escrita, en una línea.
2. **Deje fechado el estado del nivel 3.** `R-21` ya mide que no existe: `resolverVentana` termina
   en `CONFIG`, no en `hoy()`, y el corte viernes–jueves vive en un solo lugar,
   `docs/DISENO_match_temario.md §2`, sin promoverse a `CONFIG`. Repetir el estado con fecha, no
   arreglarlo.
3. **Anote el nivel 1 a medias**, que es lo que muerde en la práctica: `leerReuniones_` filtra por
   `eje` y `mostrar` y **no** por `periodo_id`, así que hoy toda fila con `mostrar = sí` entra a
   todo informe. Si el `_30` Parte B ya lo cerró, decirlo y apuntar al commit; si no, queda
   anotado como pendiente con esa fecha.

**Sobre `CLAUDE.md`:** la cascada **no se copia ahí**. `CLAUDE.md` es convenciones y ruteo; la
cascada vive en `R-21` y duplicarla es garantizar que las dos versiones se separen — es lo que ya
pasó entre `R-16` y `R-17`. Si A.4 encontró la cascada repetida en `CLAUDE.md`, **reemplazar esa
copia por un puntero a `R-21`**. Si no la encontró, agregar el puntero, una línea, en la sección de
ruteo. Nada más.
