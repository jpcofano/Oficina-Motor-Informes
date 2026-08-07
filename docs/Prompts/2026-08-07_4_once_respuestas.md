# Las once respuestas del 07/08 — documentar y aplicar

**Sin Parte 0 de medición.** Las decisiones están tomadas; lo que hace falta es escribirlas y
ejecutar lo que ya no depende de nadie. Sólo se verifica lo que la escritura necesita para no
romper algo, y cuando una verificación falle, se anota y se sigue con las otras.

**Varias de estas respuestas el usuario dice que ya estaban documentadas.** Antes de escribir
cada una: **buscar si ya existe**. Si existe, **se cita y no se duplica** — un segundo lugar
que dice lo mismo es el problema que este proyecto ya tuvo. Si existe y **contradice** lo que
el usuario acaba de decir, eso va al reporte antes que nada.

**Un commit por parte.** La Parte A es un commit de documentación; cada punto de la Parte B es
el suyo.

---

## Parte A — las once respuestas, en su dueño

Fechadas 07/08/2026, origen *decisión del usuario*.

`A.1` · **Selección de campaña destacada.** Por defecto **la semana**: entra la campaña cuyos
días activos —entre fecha de inicio y fecha de fin— toquen la semana del informe. Si no, **por
temario**. Además se filtra por **`Mail remitente = jorge.macri@buenosaires.gob.ar` y
`GCBA Resto`**, y en **IVR por `Vocero`**, los días activos dentro de la semana.

**Esto es `R-14` y `D-09` juntos**, y el usuario dice que ya estaba escrito: *"todas las
secciones tienen la semana por defecto y si no, por temario"*. Buscarlo. Lo que falte, se
agrega; lo que esté, se cita. **Los tres filtros —remitente, `GCBA Resto`, `Vocero`— son lo
más probable que no esté escrito en ningún lado.**

`A.2` · **La fuente de la lámina 7 deja de ser `Digital`.** Ver `B.4`: la decisión va escrita
acá y se ejecuta allá.

`A.3` · **El cableado se recorre lámina por lámina.** Va a `PLAN.md` §2 como el paso que sigue
al Tramo 2: 125 de los 143 tokens sin valor son cableado o datos, no motor. **El ID lo da el
grep, no yo.**

`A.4` · **Inscriptos y asistentes de reuniones salen de `rdv`.** Es la fuente de los cinco
`ecv_insc_*` y de los asistentes.

`A.5` · **La ventana de los agregados pasa a solape.** Ver el prompt aparte: cambia números en
todos lados y no entra acá. Acá va escrito **el motivo que dio el usuario**, que es un dato de
dominio que no estaba en ninguna parte: **las campañas suelen empezar unos tres días antes**.

`A.6` · **`ecv_barrios` es una lista**: los barrios alcanzados en la semana, `DISTINCT`. No es
un conteo. **Destraba las otras cuatro decisiones de `DISTINCT`** — resolverlas con esto y
anotar cuáles quedan.

`A.7` · **Los nueve porcentajes van sin signo.** Sí, aunque cambie el número publicado.

`A.8` · **Lámina 7, salida A**: los tokens de la plantilla se renombran a la familia `post_`.

`A.9` · **`secco` pasa a 4 ranuras**, igual que `jm`.

`A.10` · **El tamaño de página se declara en `SECCIONES`**, una columna por sección. Es la
entrada de `T2.10`; **`T2.10` no se implementa acá**.

`A.11` · **Los `m2_*` con sufijos `_a`…`_e`**: manda la plantilla, se corrige el documento.
**`camp_bench_*`** y **`resumen_ejecutivo` repetible**: ver `B.3`.

---

## Parte B — lo que ya es ejecución

`B.1` · **Los nueve porcentajes sin signo.** Las nueve celdas ya están verificadas una por una
—incluida `ivr_at_pct`, que estuvo a punto de quedar afuera—. Cablear el formato. **Control:
que las nueve cambien y ninguna otra.**

`B.2` · **`secco` a 4 ranuras** y **el tamaño de página como columna de `SECCIONES`**, con el
valor de cada sección cargado por el camino del seed. La columna nace; **nada la consume
todavía**.

`B.3` · **`resumen_ejecutivo` deja de ser repetible** — ya está medido que no puede serlo — y
**`camp_bench_*`** queda resuelto según lo que diga `A.1`/`A.5`; si sigue sin resolverse con
eso, se anota y se sigue.

`B.4` · **La fuente de la lámina 7.** El usuario autorizó cambiar el seed y usar la que sirva.
**Usar `Digital 2026 acumulado`**: tiene inicio, fin, estado, alcance, impresiones, views,
frecuencia y CTR. El que falta es **VTR, y es derivable** — views sobre impresiones. Proponer
esa derivación; **no cablearla sin decirlo en el reporte**.

`CAMPAÑAS_DESGLOCE_DIGITAL` queda descartada por columnas: **no tiene alcance**, y trae una
fila por campaña **y plataforma**.

Cambiar las funciones del seed para que la solapa fuente sea esa. **`Digital` no se borra de
`SOLAPAS`**: pasa a no ser la fuente de esta lámina, nada más. Reportar qué otros marcadores
la usaban y si alguno se rompe.

`B.5` · **Renombrar los tokens de la lámina 7 a `post_*`.** Ya está habilitado: `C-01` está
suspendido en desarrollo y el motor puede escribir la plantilla. **Backup antes; si el backup
falla, no se hace.** Son textos dentro de celdas, así que no hace falta el mecanismo de tablas
de `D-22` — **las columnas de la tabla no se tocan**, eso sí lo necesita y no está.

Los nombres son los de `CONFIG_INFORMES.md`, con la convención **atributo + índice** que ya
quedó elegida.

---

## El reporte

1. **Qué de las once ya estaba documentado**, y si algo contradice lo que el usuario dijo.
2. Qué se ejecutó de la Parte B y qué se salteó.
3. Qué números del deck cambiaron, y cuáles.
4. Qué decisiones tomaste solo.
5. Qué premisa de este prompt resultó falsa.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
