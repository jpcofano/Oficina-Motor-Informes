# 2026-08-14_3 — El sembrador no puede degradar un `uso` en silencio

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que una decisión viva tomada sobre una hoja de registro no pueda ser
> revertida por una corrida del sembrador sin que alguien lo apruebe.
>
> **No toca `MAPEO`, no cablea nada, no reclasifica ninguna solapa.**

---

## Lo que pasó, que es la razón del prompt

El 14/08, correr el sembrador cambió `digital/CAMPAÑAS_DESGLOCE_DIGITAL` de `uso = fuente` —
como la había dejado el usuario ese mismo día — a `ignorar`. Quedó restituida en la misma
corrida y el seed corregido, así que el caso concreto está cerrado.

Lo que no está cerrado es el mecanismo. Si no se hubiera advertido, los seis `u1_*` que salen
de esa solapa habrían devuelto vacío **sin que nada fallara**: el motor no lee lo que está en
`ignorar`, y una solapa apagada no produce error, produce silencio.

La protección existe: `aplicarClasificacionSolapas_` saltea toda fila con `origen = 'manual'`.
El problema es que **editar la hoja a mano no pone `origen = 'manual'`**. La fila editada sigue
diciendo `seed`, así que la protección sólo cubre a quien ya sabía que debía protegerse — que
es justamente quien no la necesita.

---

## La asimetría que propongo, y por qué

No todo cambio de `uso` es igual de peligroso:

- **Ascender** —`ignorar` → `fuente`— hace que el motor lea algo que antes no leía. Si está
  mal, el número aparece raro y alguien lo ve.
- **Degradar** —`fuente` → `ignorar`— hace que el motor deje de leer algo. Si está mal, **no
  aparece nada**, y un token vacío se parece bastante a un token que todavía no se cableó.

Por eso la regla no tiene que ser simétrica: **una degradación de `uso` nunca es automática.**
Es la aplicación directa del principio del proyecto — el resultado plausible y silencioso es
peor que el error ruidoso.

---

## Parte A — medición, **sólo lectura** · modelo: **Sonnet** · effort: alto

**No editar nada. Termina en reportar y parar.**

1. **Quién puede pisar qué.** Recorrer los caminos por los que una fila de `SOLAPAS`,
   `BASES` o `MAPEO` puede cambiar de valor en una corrida: el sembrador, las migraciones, y
   cualquier otro. Para cada uno: qué respeta `origen = 'manual'` y qué no.

2. **Cuántas filas están hoy sin protección.** De las filas vivas de las tres hojas, cuántas
   tienen `origen = 'manual'` y cuántas `seed` o `auto`. **El número importa**: dice si la
   protección es la excepción o la regla.

3. **Cuántas diferencias hay ahora mismo.** Correr el diff del sembrador **sin aplicar** y
   reportar toda fila donde el seed diga algo distinto de la hoja, marcando cuáles serían
   degradaciones de `uso`. Si hay más de una, la de ayer no fue un caso aislado.

4. **Si el diff se ve.** Dónde queda escrito el resultado de una corrida, y si una degradación
   silenciosa deja rastro en algún lado que alguien mire, o sólo en la hoja de diff que hay que
   ir a buscar.

**Reportar y parar.**

---

## Gate — resuelto por defecto, revisable

**La hoja manda.** El sembrador siembra lo que falta y **nunca pisa** un `uso` existente; las
diferencias van al diff para revisión. El fundamento es `S-05`: hay un solo editor y estamos
en desarrollo, así que tener el valor en el seed **y** en la hoja ya es mantener dos sistemas
con una sola persona para conciliarlos.

La alternativa queda registrada por si el usuario la prefiere antes de la Parte B: **la
asimetría** — el sembrador sigue pisando, pero una degradación de `uso` frena la corrida y pide
confirmación. Conserva la capacidad del seed de corregir y sólo frena donde el error es
invisible. Es la opción que corresponde el día que `S-05` caiga y haya más de una mano sobre
la configuración.

**Si el usuario no dice lo contrario, la Parte B implementa la primera.**

---

## Parte B — implementar · modelo: **Opus** · effort: alto

1. Lo que decida el gate, en `Instalar.gs`, **con la razón escrita en el código**: no un
   comentario que diga qué hace, sino uno que diga **por qué**, con la fecha del caso que lo
   originó. Es lo que le faltó a la línea del seed que causó esto.

2. **La `D-NN` en `docs/PLAN.md`**, número verificado contra el destino. Tiene que dejar dicho
   **qué significa `origen`**: hoy no distingue "lo decidió el seed" de "lo decidió una persona
   y el seed no se enteró", y esa ambigüedad es la causa, no el síntoma.

3. **Cerrar la entrada de `PENDIENTES_consistencia.md`** que quedó abierta el 14/08, citando la
   decisión. No borrarla.

4. **La prueba es la reversión.** Reproducir el caso: dejar una solapa en `fuente` contra un
   seed que diga `ignorar`, correr, y verificar que **no** la pisa —o que frena, según el
   gate—. Un cambio de este tipo que no se prueba contra el caso que lo originó no está
   verificado.

5. **`R-22` no se toca.** La regla está bien; lo que caducó fue una medición que la aplicaba a
   una solapa concreta. Si el prompt termina rozando la regla, se reporta y no se edita.

6. Commits separados —código y documentación—, y `git push`.

---

## Lo que este prompt **no** hace

- **No reclasifica ninguna solapa.** El alta de las 20 va por su camino.
- **No cambia el mecanismo de `origen`** más allá de lo que el gate decida. Si aparece que
  `origen` debería tener un valor nuevo, **se propone en el reporte**, no se implementa.
