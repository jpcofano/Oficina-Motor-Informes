# `R-16 Addendum 1` — Cuando una campaña tiene varias implementaciones, la ventana elige una

**Va a `docs/REGLAS_NEGOCIO.md`, a continuación de `R-16`. El texto de `R-16` no se altera.**

---

**Enunciado.** Una misma campaña puede tener **varias filas** en una solapa de canal —varias
implementaciones del mismo envío, discado o llamada—. La lámina publica **una**, y la elige la
ventana del informe: **entra la fila cuya ejecución solapa con los días de la semana**. Las de
otras semanas no entran, ni siquiera cuando son las únicas con datos completos.

**Es `R-16` aplicada a la fila, no a la campaña.** La regla madre ya dice que la selección por
período entra **por solape** y no por fecha de inicio; esto sólo declara que el mismo criterio
baja un nivel, del conjunto a la fila. **No es una regla nueva y no se le inventa un criterio
propio a cada canal.**

**Y la segunda mitad, que es lo que evita publicar en blanco:** si dentro de la ventana hay más de
una fila y **alguna no tiene datos**, publica la que los tiene y **la vacía va a `REVISAR`**. Una
implementación sin números no es una implementación con cero: es una que todavía no cerró. Es
`R-20` con otro sujeto, y `R-19` un paso antes — **antes de calcular mal, no leer**.

Si **ninguna** de las filas de la ventana tiene datos, el token publica `«FALTA»` con motivo. **No
se cae hacia atrás a una fila de otra semana**, por más completa que esté.

---

**Origen:** decisión del usuario, 09/08/2026, sobre el caso `Alerta Naranja`.

**Lo medido, 09/08.** `digital/Directa IVR`, tres filas bajo el mismo nombre de campaña:

| `ID cuentas` | fecha | `Estado` | nombre | atendidos | escucharon +75 % |
|---|---|---|---|---|---|
| `2996-MAYEMEGC` | 06/05 | Implementado | `Alerta Naranja` | 41.350 | 16.496 |
| `3449-JULEMEGC` | 31/07 | Implementado | `IVR \| Alerta Naranja 30/7` | 43.679 | 15.553 |
| `3489-AGOEMEGC` | 06/08 | **En curso** | `IVR \| Alerta Naranja 30/7` | — | — |

**La lámina 53 del deck del 07/08 publicó 41.350 y 16.496 — la fila de mayo**, en un informe cuya
ventana es 31/07 → 06/08. Con esta regla el motor publica **43.679**, la del 31/07, y manda la del
06/08 a `REVISAR`.

**El deck estaba desactualizado, y eso es el resultado esperado, no un problema.** Cuando se armó
esa lámina la implementación de julio podía no estar cerrada, y alguien tomó la última fila con
datos completos. **La regla existe para que esa decisión deje de tomarse a mano cada semana.**

**Un indicio de que se tomó a mano:** en esa lámina el número está escrito `41-350`, con guión,
único entre los seis de la lámina que usan punto de miles. La fuente trae `41350` numérico. **Un
token no produce un guión.**

---

**Las tres formas de elegir que quedan descartadas, y por qué se escriben:**

1. **La última fila con datos**, ignorando la ventana. Reproduce lo que hizo la persona esta vez y
   **habría publicado mayo en agosto**. Es el caso medido.
2. **La más reciente**, sin mirar si tiene datos. Habría publicado la del 06/08: **una lámina en
   blanco**.
3. **La suma de todas** — 85.029 atendidos. Trata implementaciones separadas como una sola y
   **contradice que la lámina diga "7 implementaciones"** como dato aparte del total.

---

**Cómo se verifica.** Para cada token que lea una solapa con varias filas por campaña: la fila
elegida tiene que solapar la ventana, y **la cantidad de filas descartadas por no solapar tiene
que aparecer en la traza**. Si un token publica sin decir cuántas filas descartó, no se puede
distinguir "había una" de "había tres y elegí bien".

**Si falla.** Si aparece un canal donde el solape no se puede calcular —sin fecha, o con una sola
fecha ambigua— **no se le hereda el criterio de otro**: se pregunta. Es lo mismo que manda `R-15`
para las señales de figura, y por la misma razón.

⚠ **Dos advertencias medidas sobre estas filas**, que no son de esta regla pero muerden acá:

- **`Vocero` viene con espacio al final** en dos de las tres filas —`GCBA ` contra `GCBA`—. Toda
  comparación pasa por `normalizarValorDeclarado_`.
- **El nombre de campaña cambió de forma entre implementaciones**: `Alerta Naranja` en mayo,
  `IVR | Alerta Naranja 30/7` en julio y agosto. **Cualquier match por nombre las separa**, así
  que el agrupamiento no puede depender del nombre.
