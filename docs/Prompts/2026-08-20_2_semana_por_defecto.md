# 2026-08-20_2 — El default es la última semana cerrada, viernes a jueves

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que el panel proponga **la semana cerrada más reciente** en vez de lo que
> haya en `CONFIG`.
>
> ⛔ **No toca la pieza faltante de `PLAN.md` §3** —`informe_id` en la cadena de `D-20`, el
> `periodo_id` de la corrida en `itemsDeSeccion_`—. Esa se resuelve entera o no se toca.

---

## La decisión del usuario, 20/08/2026

**El motor propone la semana por defecto: viernes a jueves, la última cerrada.** Corriendo el
jueves 20/08 la propuesta es **14/08 → 20/08**; corriendo el viernes 21/08 **sigue siendo
14/08 → 20/08**, porque la semana que arranca ese viernes todavía no cerró.

Cierra la `[?]` de `docs/CONFIG_INFORMES.md` §1.2 — *¿el motor propone la última semana cerrada
por defecto, o siempre se carga a mano?* — **a favor de proponer**.

### ⚠ La premisa que esto contradice, y por qué no es una derogación

`semanaR11_` devuelve **la semana que contiene a la fecha**, y su control positivo lo fija con
todas las letras: *"corriendo un viernes, la semana arranca ESE viernes, no el anterior"*. Con el
criterio de arriba, **el viernes es el único día donde las dos respuestas difieren** — y el
viernes al mediodía es cuando se genera `jm`.

**`R-11` no dice nada sobre esto.** Define la semana —siete días, viernes a jueves, extremos
inclusive— y no **cuál** semana se elige respecto de la fecha de corrida. Eso lo eligió el código
sin regla detrás. Entra como **Addendum a `R-11`**, no como derogación, y el enunciado de la regla
no se altera.

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort alto.**

1. **Los llamadores de `semanaR11_`.** Al 20/08 son tres: el eslabón 5 de `resolverVentana`
   (`Fuentes.gs`), `diagEncuentrosPorSemana_` (`Auditoria.gs`) y su control positivo
   (`Pruebas.gs`). **Confirmar, y decir qué pregunta le hace cada uno** — no es la misma:
   agrupar un encuentro por su semana **necesita** "la que contiene la fecha", y cambiarla ahí
   sería romper el instrumento.
2. **`CONFIG.periodo_desde` / `periodo_hasta` hoy**, en la planilla viva. Si están cargados, el
   eslabón 5 **no se dispara nunca** y la propuesta del panel sale de `CONFIG`, no del cálculo.
   Reportar los dos valores y el `origen` que devuelve `resolverVentana({})`.
3. **`PERIODOS` hoy**: qué filas hay, y **si existe una para la semana cerrada más reciente**.
   Reportar los `periodo_id` tal como están escritos — el formato de los existentes es la
   convención de nombre que cualquier fila nueva tiene que respetar.
4. ⭐ **Cómo llega una ventana a una corrida.** Confirmar que `generarInforme(informeId,
   periodoId, opciones)` sólo acepta un **`periodo_id` que exista en `PERIODOS`**, y que **no hay
   camino para correr sobre un par de fechas sueltas**. **Esta medición decide si la propuesta del
   panel es utilizable o es sólo un cartel.**
5. **Quién escribe `PERIODOS`.** Contra `docs/ESCRITORES.md` y contra el código. Si no hay ningún
   escritor, decirlo — significa que crear el período de la semana es hoy trabajo a mano.
6. **El control positivo de `semanaR11_`**: qué afirma exactamente, cuáles de sus afirmaciones
   sobrevivirían a agregar una función nueva y cuáles se caerían si se cambiara la existente.

**Reportar todo junto y parar.** ⛔ No escribir código en esta corrida.

---

## Parte A — la función, y dónde entra

> **Modelo: Opus · effort alto.** Elige entre dos caminos con costos distintos y toca la cadena
> de `D-20`.

**La función nueva reusa `semanaR11_` y no reimplementa el corte viernes–jueves.** La forma que ya
funciona: **el jueves anterior o igual a la fecha de corrida es el último día de su propia
semana**, así que la última semana cerrada es la que `semanaR11_` devuelve para ese jueves. Un
segundo cálculo del corte es el error que este repo ya cometió cuatro veces (`CLAUDE.md` §4).

**La decisión de esta parte, y hay que tomarla con la medición de la Parte 0 a la vista:**

| camino | qué cambia | qué cuesta |
|---|---|---|
| **A** — sólo el panel propone la cerrada; el eslabón 5 sigue con la que contiene | nada del motor | **dos definiciones de "la semana por defecto"**, y divergen justo el viernes |
| **B** — el eslabón 5 también pasa a la cerrada | el motor, cuando `CONFIG` está vacío | una sola definición |

⭐ **Se elige B.** "El motor propone la semana por defecto" es **una** afirmación: si el panel dice
una semana y el motor resuelve otra, el deck sale sobre una ventana que nadie eligió.

### ⚠ La precondición que la Parte 0 encontró, y sin la cual B no se observa

**`CONFIG.periodo_desde/periodo_hasta` están cargados (24/07–30/07), así que el eslabón 4 corta
antes del 5 y B no cambia nada de lo que pasa hoy.** Peor: la propuesta del panel también sale de
`CONFIG` (`panel_getEstado` llama a `resolverVentana({})`), así que hacer que el panel proponga la
semana cerrada **sin tocar `CONFIG`** produce una divergencia de casi un mes entre lo que se lee
en pantalla y lo que genera el botón — el "número plausible y equivocado por la puerta del front"
que la Parte B nombra, materializado el primer día.

**Decisión del usuario, 20/08/2026: `CONFIG.periodo_desde` y `periodo_hasta` se vacían.** Es una
acción en la hoja, no de este prompt.

⚠ **Esto NO deroga `R-11` Addendum 1 punto 2** —*configurar es el caso normal, el cálculo es el
piso*—. Configurar sigue disponible y sigue ganando: lo que cambia es que **hoy no hay nada
configurado**, que es el caso que el punto 2 describe como aquel en que entra el cálculo.

⛔ **Este prompt no escribe `CONFIG`.** La Parte A **verifica el estado de esas dos celdas y lo
reporta**; si siguen cargadas, dice con todas las letras que B quedó implementado y **no
observable**, en vez de dar por hecho un efecto que no ocurre.

⛔ **`diagEncuentrosPorSemana_` no se toca en ninguno de los dos caminos.** Su pregunta es otra.
**Y `semanaR11_` tampoco cambia de comportamiento**: sigue devolviendo la semana que contiene la
fecha, con su control positivo intacto. Lo nuevo se apoya en ella.

---

## Parte B — el panel muestra la propuesta y dice qué falta para usarla

> **Modelo: Opus · effort alto.**

`panel_getEstado` devuelve la ventana propuesta **y si es corrible**.

⭐ **La medición del punto 4 de la Parte 0 es lo que hace útil esta parte.** Si `generarInforme`
sólo acepta un `periodo_id` de `PERIODOS`, entonces **una ventana propuesta sin fila en `PERIODOS`
no se puede correr**, y el panel tiene que decirlo con esas palabras: *"la semana propuesta no
tiene fila en `PERIODOS`; creala o elegí un período de la lista"*.

**Y el emparejamiento con corridas viejas se rompe callado, medido en la Parte 0:** el panel busca
en `PERIODOS` una fila que coincida con las fechas propuestas, para ofrecer el deck ya generado.
Con 14/08–20/08 no coincide ninguna. **El comportamiento es correcto —no ofrece nada— pero la vía
queda muerta hasta que exista la fila**, y eso se dice en el reporte en vez de descubrirse.

⚠ **Mostrar una propuesta que el botón no puede ejecutar es peor que no proponerla**: la persona
aprieta generar, sale el período viejo, y el deck es correcto para una semana que no es la que
leyó en pantalla. **Número plausible y equivocado, por la puerta del front.**

⛔ **Este prompt NO crea la fila de `PERIODOS`.** Sería un escritor nuevo de hoja de registro, con
su fila en `ESCRITORES.md` y su decisión sobre el formato del `periodo_id`. **Va en un prompt
propio**; acá queda medido y dicho.

**Lo que sí se corrige acá, porque la Parte 0 lo dejó a la vista:** `SEED_PERIODOS_` afirma en su
comentario que *el seed es el único escritor declarado de `PERIODOS`*, y `ESCRITORES.md` lo repite.
**Es cierto como declaración y falso como restricción:** `upsertPorClave_` reporta `soloEnHoja` y
**nunca borra**, así que una fila escrita a mano en la hoja sobrevive a *Aplicar configuración*.
Anotarlo en `ESCRITORES.md` —con el `soloEnHoja` citado como el mecanismo que lo garantiza— es lo
que convierte "editar `Instalar.gs` y pushear" en "escribir una fila". ⚠ **No se retira la
declaración del seed**: sigue siendo el escritor *declarado*. Lo que se agrega es qué pasa con lo
que él no declara.

---

---

## Parte B bis — el selector de tres modos: **documentar y preparar, no construir**

> **Modelo: Opus · effort alto.** Es diseño, y lo que se escribe acá condiciona lo que se
> construya después.

**Decisión del usuario, 20/08/2026 — hacia dónde va el selector de período:**

| modo | qué elige la persona | estado |
|---|---|---|
| **semana** | una semana viernes→jueves, con la última cerrada propuesta | **es lo de hoy**, y lo que construye este prompt |
| **mes** | un mes calendario | futuro |
| **libre** | dos fechas, las que quiera | futuro |

⛔ **Los dos futuros NO se implementan en este prompt.** Lo que se hace es escribirlos y **medir
qué los bloquea**, para que lo de hoy no los tape.

**Lo que hay que dejar escrito, con la medición al lado:**

1. ⭐ **La pieza común de los tres modos es que una ventana elegida necesita una fila en
   `PERIODOS`** —lo mide el punto 4 de la Parte 0—. Los tres modos son **tres formas de proponer
   un par de fechas**, y las tres chocan contra lo mismo. **Ése es el trabajo que los destraba, y
   es uno solo.** Escribirlo así evita que "el selector mensual" se planifique como un frente
   propio cuando es la misma pieza.
2. **El grano mensual ya existe en el motor y hay que decirlo:** `PERIODOS` tiene `m2_mensual` y
   `MARCADORES.periodo_ref` es el eslabón 2 de la cadena de `D-20`. **El modo "mes" del selector
   no inventa un grano nuevo** — le da entrada por el panel a algo que la cadena ya resuelve.
   Confirmarlo contra la hoja antes de escribirlo.
3. **Qué NO alcanza con un selector**, y es el límite honesto: elegir la ventana no arregla que
   `resolverVentana` no reciba `informe_id` ni que `itemsDeSeccion_` no reciba el `periodo_id` de
   la corrida (`PLAN.md` §3). **Un selector más rico sobre esa pieza faltante ofrece precisión que
   el motor no tiene.** Queda escrito ahí, no acá.

**Dónde va:** `docs/PROCESO_SEMANAL.md`, que es el dueño de *qué hace una persona para sacar el
informe* y **es la especificación del panel** (`CLAUDE.md` §7). Los dos modos futuros van con la
marca **[falta]**, que es la convención que ese documento ya usa. **No se crea un documento nuevo.**

---

## Parte C — el control positivo

> **Modelo: Sonnet · effort medio.**

Función pura, fecha por parámetro, **sin planilla y sin esperar a un viernes**.

1. ⭐ **Jueves 20/08/2026 → 14/08–20/08.** El jueves cierra su propia semana.
2. ⭐ **Viernes 21/08/2026 → 14/08–20/08**, no 21–27. **Es el caso que motiva el prompt entero** y
   el único día donde difiere de `semanaR11_`.
3. Sábado 22/08 y miércoles 26/08 → 14/08–20/08. La propuesta no se mueve hasta el jueves.
4. Jueves 27/08 → 21/08–27/08.
5. Siete días inclusive, y cruce de año sin romperse.
6. **`semanaR11_` sigue pasando su propio control tal como está.** Si alguna de sus afirmaciones
   hubo que tocarla, **parar y reportar**: significa que se cambió la función vieja en vez de
   apoyarse en ella.

---

## Parte D — la documentación

> **Modelo: Sonnet · effort medio.**

1. **`docs/REGLAS_NEGOCIO.md`, `R-11`** — Addendum nuevo, con fecha y con el dueño puesto
   (decisión del usuario, 20/08/2026): **cuál semana se elige es la última cerrada**. El enunciado
   de `R-11` no se altera. Escribir que el viernes es el único día donde difiere de la lectura
   anterior, **y que ese es el día de generación de `jm`**.
2. **`docs/CONFIG_INFORMES.md` §1.2** — la `[?]` pasa a `[OK]`.
3. **`docs/PLAN.md`** — si el camino elegido es B, la cadena de `D-20` cambia de contenido en su
   eslabón 5. **No se edita `D-20`**: se anota donde corresponda según `CLAUDE.md` §7.
4. `docs/BITACORA.md` y `docs/ESCRITORES.md` si algo lo amerita.

## Lo que este prompt **no** hace

- ⛔ No escribe en `PERIODOS` ni crea períodos.
- ⛔ No toca `CONFIG`.
- ⛔ No toca `SECCIONES.periodo_ref` ni la pieza faltante de `PLAN.md` §3.
- ⛔ No cambia el comportamiento de `semanaR11_` ni el de `diagEncuentrosPorSemana_`.
