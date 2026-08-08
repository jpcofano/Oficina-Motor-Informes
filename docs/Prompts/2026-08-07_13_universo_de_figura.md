# El universo de la lámina 5 — la señal de `rdv` y el filtro que falta

**Un objetivo.** Que la lámina 5 cuente los encuentros del informe y no los de doce figuras.
**Documentación + una celda de configuración.** Ningún `.gs`.

**De dónde sale.** La Parte 0 del `_12` midió que en la ventana 24–30/07, `rdv/RVD JM-CM - ES`
tiene 15 filas de **12 figuras distintas**, y sólo 4 son de Jorge Macri. Los 11 barrios de
`ecv_barrios` son once barrios de once ministros. **El `DISTINCT` no lo arregla**, y el
problema no son los barrios: es toda la familia `ecv_*` de la lámina 5, que hoy publica
`ecv_encuentros`, `ecv_inscriptos`, `ecv_asistentes` y los cinco `ecv_insc_*` **contando de
más**.

**La decisión del usuario, 07/08/2026:**

1. **`rdv` tiene su propia señal de corte JM / GCBA, y es la columna `A`, `Figura`.** `JM` es
   *Jorge Macri*; **`GCBA` es todo el resto**, por resta, igual que el remitente de mail.
2. **La lámina 5 del informe `jm` cuenta sólo JM.** ⬅ **Si esto es falso, parar toda la
   corrida**: es la premisa de la que cuelga todo lo demás, y la única que el repo no puede
   confirmar solo.

**Por qué esto es una fila más de `R-15` y no una regla nueva.** `R-15` declara cuatro señales,
las cuatro de `digital`, y **cierra diciendo que a un canal nuevo no se le hereda el criterio
de otro: se pregunta cuál es su señal.** Es exactamente lo que pasó. `rdv` es la quinta fila.

---

## Parte 0 — medir antes de escribir (sólo lectura, reportar y parar)

`0.1` · **Cuánto cambian los números publicados.** Para los ocho marcadores de la lámina 5 que
hoy tienen valor —`ecv_encuentros`, `ecv_inscriptos`, `ecv_asistentes` y los cinco
`ecv_insc_*`— reportar el valor **con las 15 filas** y el valor **con las 4 de Jorge Macri**,
en una tabla de dos columnas. Y lo mismo para los cinco `ecv_insc_*_pct`, que pueden moverse
menos que sus numeradores porque el denominador también cae. **Es el número que le dice al
usuario qué tan mal está el deck publicado**, y es lo primero que va a querer ver.

`0.2` · **Dónde puede vivir el filtro, medido y no supuesto.** Tres cosas:

- las celdas de `filtro` de las secciones de encuentro en la hoja `SECCIONES` viva —qué tienen
  hoy, no qué tenía el snapshot del 01/08—;
- si la hoja `MARCADORES` viva **tiene la columna `filtro`**, y qué `informe_id` traen las filas
  de la familia `ecv_`: `*` (compartido) o `jm`;
- **cuántos informes usan cada sección de encuentro.** `SECCIONES.informes` dice `JM,SECCO`
  para `encuentro`. Si el filtro se declara ahí, **también le cae a `SECCO`**, y eso es un
  efecto que nadie pidió.

`0.3` · **Qué le pasaría a `SECCO`** si el filtro entra por sección. Reportar qué secciones y
qué marcadores de `SECCO` leen `rdv/RVD JM-CM - ES` y qué figuras esperan. `SECCO` tiene una
sección `ministros` propia, así que puede ser que no le afecte — **medirlo, no deducirlo**.

`0.4` · **Si el valor a filtrar es texto literal o pasa por equivalencias.** Existe
`docs/PERSONAS_equivalencias.csv` y una solapa de equivalencias que reemplazó a
`detectPersona_`. Reportar cómo aparece escrito *Jorge Macri* en la columna `A` de las 15 filas
—exacto, con variantes, con espacios— y si `figura=Jorge Macri` como filtro literal alcanza o
si necesita pasar por la equivalencia. **Un filtro que no matchea devuelve cero y se lee igual
que un dato faltante.**

`0.5` · **El próximo `R-NN` libre** y si `R-15` ya tiene addenda, para que éste sea el que
corresponde por número.

`0.6` · **Si `ecv_alcance_semanal` y `encuentro` necesitan el mismo filtro.** La lámina 5 es el
agregado y la 6 se repite por encuentro. Reportar qué secciones tocan `rdv` y cuáles de ellas
cambiarían de número al filtrar por figura.

**Reportar `0.1`–`0.6` y parar.**

---

## Parte A — la señal, en `REGLAS_NEGOCIO.md`

`A.1` · **Addendum fechado a `R-15`** con la quinta fila: `rdv/RVD JM-CM - ES`, columna `A`
(`Figura`), `JM` = *Jorge Macri*, `GCBA` = todo el resto. `R-15` es append-only y su tabla no
se edita: el addendum la extiende y lo dice.

`A.2` · **Con la consecuencia que la vuelve útil, y que no se deriva sola:** hasta hoy, no
declarar la señal de `rdv` no se leía como un hueco sino como que no hacía falta. **El efecto
medido va escrito**: la lámina 5 contaba doce figuras. Una regla con el error que evitó al lado
envejece mejor que una regla sola.

`A.3` · **Y la simetría con mail, dicha explícitamente:** `GCBA` se define **por resta**, no por
lista. No hay ni va a haber una lista declarada de las otras once figuras — mañana hay doce.

## Parte B — el universo, en `CONFIG_INFORMES.md`

`B.1` · **El informe `jm` cuenta sólo encuentros de Jorge Macri en la lámina 5.** Decisión del
usuario, 07/08/2026, con la medición de `0.1` al lado.

`B.2` · **El mecanismo lo elige `0.2`, y las tres opciones se escriben con su costo:** la celda
de `SECCIONES.filtro` —barata, pero le cae a `SECCO` si la sección es compartida—; el
`MARCADORES.filtro` por fila con `informe_id = jm` —más filas, pero por informe—; o partir la
sección. **Si `0.3` muestra que `SECCO` se ve afectado, la celda de sección queda descartada y
se dice por qué.**

`B.3` · **Escribir el universo `GCBA` de `rdv` como existente pero sin consumidor.** Nadie pidió
la lámina de encuentros de ministros para `jm`, pero la señal lo habilita y conviene que se
sepa antes de que alguien lo descubra como un hallazgo.

## Parte C — el hallazgo, en `PENDIENTES_consistencia.md`

`C.1` · **Los números de la lámina 5 publicados hasta hoy están inflados**, con la tabla de
`0.1`. Es exactamente el modo de falla que este proyecto persigue —el número plausible y
malo— y **el registro vale más que la corrección**: quedó publicado y alguien lo leyó.

`C.2` · **Cómo se escapó.** El token tenía fila en `MARCADORES`, el `MAPEO` estaba bien, la
fuente tenía filas y el valor salía con formato correcto. **Ninguna de las verificaciones del
proyecto mira el universo**: todas preguntan si el número salió, ninguna si salió de las filas
que corresponden. Eso es una convención de método, no un pendiente, y **va donde `CLAUDE.md`
§7 mande** — reportarlo si no hay fila para esto.

## Parte D — la celda

`D.1` · **Sólo si `0.2` y `0.3` dejaron un mecanismo sin ambigüedad.** Escribir el filtro por el
camino elegido en `B.2`.

`D.2` · **Verificar con una medición dirigida, no con una corrida entera.** Los ocho marcadores
de `0.1` tienen que dar la columna derecha de la tabla. Si alguno no da, **parar**: el filtro
no está haciendo lo que se cree.

`D.3` · **Si el mecanismo quedó ambiguo, no escribir la celda.** Reportar las opciones con lo
medido y parar. Una celda mal puesta en una sección compartida rompe `SECCO` en silencio.

## Commits

Uno por parte. `git push` después de cada uno. La celda de `D.1` no es un commit: se anota en
la bitácora con lo que midió `D.2`.

## Verificación

Se cierra cuando los ocho marcadores de la lámina 5 dan el valor de la columna *sólo JM* y
`SECCO` no se movió.
