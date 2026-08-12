# `_31` · Dos períodos, la lámina 5 de vuelta, y los dos agregados

> **Modelo por parte, declarado en cada una.** Sin declaración, Sonnet.
>
> **Qué cambió:** la demo es mañana a las 18, no a la mañana. Con el día entero por delante se
> reabre lo que el `_30.1` cerró por falta de tiempo. **El `_30` y su addendum no se editan**: esto
> los supersede donde se contradicen y lo dice en cada parte.
>
> **Qué se quiere ver, en una línea:** el selector de período **cambia los encuentros**, y hay dos
> láminas de agregado con números. Leo *"los dos agregados"* como **la lámina 5
> (`ecv_alcance_semanal`) y la lámina 9 (`m2`)** — son las dos secciones `modo = agregado` que
> declaran a `jm`; `ministros` es sólo `SECCO`. Si la lectura es otra, se corrige antes de la
> Parte B y el resto no se mueve.
>
> **Y una advertencia que va dicha una vez, no dos:** `C-29`, `C-33` y `C-37` midieron que **ningún
> deck `jm` publicado tiene lámina agregada**. Mostrarla es una decisión del usuario sobre qué
> demostrar, no un intento de reproducir un deck. Los marcadores que se cableen van marcados
> `SIN VALIDAR — demo 12/08` y nada se compara contra un deck.

---

## Parte A · El censo que decide todo — sólo lectura, reportar y parar

**Modelo: Sonnet, effort alto.**

**A.1 · Qué semanas tienen encuentros de verdad.** Sobre `rdv/RVD JM-CM - ES`, filas con
`Figura = Jorge Macri` y `STATUS = Realizada`, **desde el 01/06 hasta hoy**. Agrupar por semana
viernes–jueves y reportar, por semana: rango de fechas, cuántos encuentros, y para cada uno barrio,
fecha, tipo e inscriptos.

**Esto elige el segundo período.** El primero es la semana 24–30/07, que es la que ya funciona. El
segundo tiene que ser una semana con encuentros reales y distintos — si ninguna otra los tiene, se
reporta y la demo va con un período solo. **No se inventa una semana con datos prestados.**

**A.2 · La lámina 5.** Sus tokens `ecv_*`, uno por uno: cuáles tienen fila en `MARCADORES` hoy (son
66 filas) y cuáles no. Para los que la tienen: `base_id · solapa · campo_logico · operacion ·
filtro · periodo_ref`. **Reportar el conteo: cuántos publicarían valor y cuántos `—`.**

**A.3 · Las tres escondidas.** `contarAnclasDeLaminas()` cuenta pero no lista. Listar cuáles son las
tres láminas escondidas de la plantilla `jm`, por número y por ancla.

**A.4 · `PERIODOS` y `REUNIONES`, el estado exacto** para saber qué hay que dar de alta: los
`periodo_id` que existen hoy con su rango, y las 7 filas de `REUNIONES` con su `eje`, `tipo`,
`nombre`, `fecha`, `etapa` y `periodo_id`.

**Reportar y parar.** La Parte B no arranca sin el reporte de A.1 a la vista.

---

## Parte B · Que el período elija los encuentros

**Modelo: Opus, effort alto.** Cambia qué se publica.

**Supersede a B.2 del `_30`, que quedó bloqueada porque `PERIODOS` no cubría julio y las 7 filas de
`REUNIONES` tenían `periodo_id` vacío. Se destraban las dos cosas acá.**

**B.1 — alta de los dos períodos** en `PERIODOS`, con corte viernes–jueves (`R-11`): la semana
24–30/07 y la que A.1 haya elegido. Nombres explícitos, `notas` diciendo que son de la demo.

**B.2 — `periodo_id` en las filas de `REUNIONES` que ya existen.** Las 5 filas `JM` de julio y las 2
de tipo `Agregado` van al período de julio. Es un backfill de una columna que ya existe, no una
fila nueva.

**B.3 — el temario del segundo período.** Cargar las filas del segundo período con
`cargarTemario(texto, periodoId)`, que es el cargador que ya existe y **exige** `periodo_id`. El
texto sale de los encuentros que A.1 midió, una línea por encuentro, con el formato que
`parsearLineaReunion_` ya parsea — mirarlo antes de escribir el texto, no después. **Las filas
nacen con `mostrar` vacío**: el cargador lo dice y es correcto; ponerlas en `sí` es el paso
siguiente y va explícito en el reporte.

**B.4 — el filtro.** `leerReuniones_` filtra además por `periodo_id`. **Las excluidas se reportan
con motivo**, como ya hace la rama `CAMPANAS` citando `D-19`. Una fila sin `periodo_id` no entra a
ningún informe y se lista — no se la asigna a la semana vigente.

**Control de la parte:** con el período de julio elegido tienen que salir los mismos 5 ítems de
siempre. Si sale otro número, algo del backfill quedó mal y se para.

---

## Parte C · La lámina 5, con el universo del período

**Modelo: Opus, effort alto.** Publica números.

**Supersede la decisión del `_30.1` de dejarla escondida.** El usuario la desmarca en la plantilla
—*Omitir diapositiva*, un clic— y acá se cablea lo que A.2 encontró sin fila.

**El universo es el mismo del que salen las individuales:** los encuentros que el temario
seleccionó para ese `periodo_id`, que después de la Parte B es un conjunto bien definido. **No es
un recorte por fecha sobre `rdv`.** Ésa es la propiedad que hace que el control cierre solo: si el
agregado y las individuales derivan de la misma selección, coinciden por construcción y no por
haber empatado un número.

Cada fila nueva lleva en `notas` **`SIN VALIDAR — demo 12/08`**.

**La puerta, y es de forma, no de tiempo:** si al terminar quedan **más de un tercio** de los
tokens de la lámina 5 en `—`, **reportarlo antes de la Parte D** y no seguir. Una lámina con dos
guiones se defiende; una con doce, no, y en ese caso la decisión es volver a esconderla — que es
un clic y ya está probado.

---

## Parte D · Dos corridas, dos decks

**Modelo: Sonnet.**

Generar `jm` **dos veces desde el Panel**, una por período, con la casilla de `—` tildada. De cada
deck, leído del deck y no del reporte:

- las láminas de encuentro emitidas, con barrio, inscriptos y población;
- la lámina 5, token por token, distinguiendo valor de `—`;
- la lámina 9 de `m2`, ídem — se esperan siete valores y `m2_campanias` en `—`;
- las láminas escondidas que reporta la corrida.

**El control que cierra el día:** los encuentros del deck de julio y los del segundo período **son
conjuntos distintos**, y en cada deck la lámina 5 habla de los encuentros que ese mismo deck
publica individualmente. Reportar las dos listas de cada deck una al lado de la otra, aunque
coincidan.

Reportar `corrida_id` y `deck_id` de las dos corridas. `jm-20260811-182706` sigue siendo la red: si
las dos corridas salen peor, se vuelve a ese deck y se dice.
