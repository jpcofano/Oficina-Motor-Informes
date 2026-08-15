# 2026-08-14_6 — La letra manda, el título queda documentado

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que cada fila de `MAPEO` documente **el encabezado que hay en esa letra**,
> y que toda fila nueva lo lleve de acá en adelante.
>
> **No valida nada, no corrige ningún mapeo, no cablea, no toca plantillas.**

---

## Por qué, y por qué sin validación

Las filas de `MAPEO` referencian **por letra de columna** — así es en las cuatro bases y así se
conserva. Los títulos se repiten (`Agenda JM | Post` tiene cuatro `% CTR`, `Base_Digital` ocho
`ID Cuentas`, `Desglose impresiones` tres claves, todo medido en el censo del 14/08), de modo
que buscar por título elegiría siempre el primero.

Lo que falta es que quede escrito **qué hay** en cada letra. Documentarlo ahora sirve para dos
cosas: se lee el mapeo sin abrir la planilla, y el día que alguien inserte una columna, la
comparación es posible.

**La validación se difiere por decisión del usuario del 14/08**, y el motivo es que nadie
insertó columnas todavía: no hay corrimiento que buscar. Este prompt sienta el testigo; la
función que lo compara viene después.

**La forma de la regla, que hay que dejar escrita:** el encabezado documentado **no** es una
segunda manera de encontrar la columna. Es un testigo sobre la primera. El día que alguien lo
use como fallback —*"si la letra falla, buscá por título"*— vuelve el problema completo,
porque los títulos repetidos harían que el fallback acierte a veces y erre en silencio otras.

---

## Parte A — censo, **sólo lectura** · modelo: **Sonnet** · effort: normal

**No editar nada. Termina en reportar y parar.**

1. **Cuántas filas hay.** El número vivo de `MAPEO`, leído de la hoja. *(El prompt no lo
   asume: las cifras que se venían citando eran del snapshot del 11/08.)*

2. **El encabezado real de cada fila.** Para cada una, el encabezado que hay hoy en esa solapa
   y esa letra, resolviendo la fila de encabezado con la función del motor y no con una
   reimplementación. Tabla completa: `base_id`, `solapa`, `campo_logico`, `columna`,
   encabezado leído.

3. **Las tres listas del final**, informativas, **ninguna frena la Parte B**:
   - `SIN ENCABEZADO` — letras que apuntan a una columna sin título;
   - `TITULO REPETIDO` — encabezados que aparecen más de una vez en su solapa. No son un
     problema para este diseño; se listan para que la función futura no los lea como error;
   - `REVISAR` — filas cuyo encabezado leído no aparece textualmente en sus `notas`. **Es un
     filtro, no un veredicto:** muchas notas lo traen entrecomillado porque se venía pidiendo
     así, y las que no, no prueban nada.

4. **Las solapas sin fila de títulos.** El censo del 14/08 registró que `IVR` y `Mail` tienen
   datos en la fila 1. Para ésas el testigo no puede ser un encabezado: reportarlas aparte.

**Reportar y parar.** Sin gate: la Parte B avanza salvo que el reporte muestre algo que el
usuario quiera mirar.

---

## Parte B — escribir · modelo: **Sonnet** · effort: alto

1. **La columna nueva en `MAPEO`, inmediatamente después de `columna`** — atestigua sobre ella,
   y junto a `notas` queda lejos de su referente. En la hoja y en el seed **por el mismo
   camino**: escribir en los dos lados por separado es lo que produjo las reversiones
   silenciosas de `instalar()` sobre `seedConfiguracion()`.

2. **Poblarla con el encabezado leído.** Las filas de `IVR` y `Mail` quedan vacías, con el
   motivo en `notas`.

3. **La convención en `CLAUDE.md`** — es la mitad que se pierde si no se escribe: **toda fila
   nueva de `MAPEO` lleva letra y encabezado.** Un mapeo agregado con apuro y sin testigo deja
   el hueco abierto justo donde la documentación decía que estaba cerrado.

4. **La `D-NN` en `docs/PLAN.md`**, número verificado contra el destino: la letra es la
   referencia operativa y la única forma de encontrar la columna; el encabezado es testigo,
   **nunca fallback**; y **qué se hace cuando no coinciden**, definido acá aunque todavía no
   haya nada que lo ejecute, para que la función posterior no invente la política.

5. **Anotar en `PENDIENTES_consistencia.md` la función que compara**, con lo que necesita y por
   qué se difirió — *nadie insertó columnas*, que es un supuesto sobre las bases de terceros
   (`looker` es de `dgples`, `m2` de `tarnowski`) y por lo tanto puede vencer sin aviso. Anotar
   también que **`C-61` cambia de riesgo** con el testigo puesto, y hay que revisar ese caso a
   la luz de esto.

6. **`tools/listas.js`** antes de cerrar. Commits separados entre configuración y
   documentación, y `git push`.

---

## Lo que este prompt **no** hace

- **No compara ni valida.** Diferido por decisión del usuario del 14/08.
- **No corrige ningún mapeo.** Si el `REVISAR` muestra algo, se reporta.
- **No cambia ninguna letra.**
- **No resuelve `C-61`.** Le saca el filo y lo deja anotado.
