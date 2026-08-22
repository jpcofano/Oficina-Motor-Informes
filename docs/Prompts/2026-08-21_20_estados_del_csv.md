# Paso 2026-08-21_20 — Los estados del CSV de casos, declarados

**Estado:** no ejecutado. ⛔ **DESTRABADO el 22/08/2026** — ver el addendum al pie.
~~⏸ Diferido por decisión del usuario, 21/08 — no bloquea nada; se corre cuando haya lugar.~~
**Esa nota está vencida:** `D-38` aprobó un criterio de cierre cuya condición 6 exige que cada
número publicado tenga un caso **en estado terminal**, y eso no se puede exigir con el vocabulario
de estados sin declarar. **Sí bloquea.**
**Reemplaza:** nada.
**Toca:** `casos_validacion_*.csv` (dos celdas, quizá), el documento que `CLAUDE.md` §7 declare
dueño, y §7 misma si hace falta una fila nueva.
**No toca ningún `.gs`.**

---

## Contexto

El CSV de casos usa un vocabulario de estados que **no está declarado en ningún lado**. Se
infiere del propio CSV y de menciones sueltas en `BITACORA.md`. El dueño natural de la pregunta
—`docs/VALIDACION_*.md`— está congelado, así que **ni siquiera hay dónde escribirlo sin decidir
el ruteo primero**.

Lo destapó el `_18`: sus casos `V-103` y `V-104` no eran ninguno de los estados existentes —la
definición está resuelta y medida, falta que una corrida la mida— y se les puso `pendiente`, un
valor nuevo. **Decisión del usuario, 21/08: se conserva `pendiente`, y en el mismo paso se
declaran todos.**

⚠ **Por qué no es cosmético.** Es el mismo modo de falla que este repo ya cobró dos veces en la
misma semana: `dimensiones` vacío significando *"no hay nada que separe"* y *"no hace falta"*, y
`campo_id_cuenta` leído desde la columna equivocada porque quien medía no tenía contra qué
chequear el nombre. **Un valor que existe y que nadie puede definir es donde entra el
plausible-pero-mal.** Hoy, con `contradice`, `deriva` y `corrige` conviviendo, nadie puede elegir
uno sin leer casos viejos y razonar por analogía.

---

## Parte 0 — el censo · **Sonnet** · sólo lectura · reportar y parar

**0.1 · La lista, contada y no escrita a mano.** Recorrer el CSV vigente y reportar **todos** los
valores distintos de `estado` con su cantidad de casos. ⚠ **No partir de ninguna lista previa:**
un reporte anterior enumeró nueve y el CSV tiene diez — se le escapó `corrige`, que tiene un solo
caso. Ése es justamente el error que este censo evita.

**0.2 · Los que se parecen.** Para cada grupo de estados que podrían confundirse —al menos
`contradice` / `corrige` / `retractado`, y `abierto` / `sin_fuente` / `sin_datos`— traer **dos o
tres casos reales de cada uno** con su `nota`, para que la diferencia se vea en el uso y no en una
definición inventada ahora.

**0.3 · Los de un solo caso.** Reportar cuáles tienen uno o dos casos. Un estado con un caso puede
ser una distinción legítima o un tipeo que nadie revisó, y son cosas distintas.

**0.4 · El ruteo.** Contra `CLAUDE.md` §7: reportar qué documento sería dueño de *"¿qué significa
cada estado de un caso de validación?"*. La hipótesis es que **ninguno lo es hoy** —el candidato
natural está congelado—. Si es así, decirlo; **no crear un archivo nuevo ni elegir dueño por tu
cuenta**: §7 dice que si no entra en ninguno, se pregunta antes.

**0.5 · Los `abierto`, separados.** De los casos en `abierto`, reportar cuántos son *"nadie
contestó esto"* y cuántos *"está definido y falta correrlo"*. Es lo que mide si la distinción que
`pendiente` introduce ya estaba latente o la inventamos nosotros.

**Reportar y parar.** El usuario define lo que el censo deje ambiguo.

---

## Parte A — escribirlo · **Opus** · effort alto

Sólo después de que el usuario haya definido lo que 0.2 y 0.3 dejaron abierto.

Una tabla corta: **estado · qué afirma · cuándo se usa · a qué otro estado se parece y en qué se
distingue**. La última columna es la que hace el trabajo — una definición sola no evita que dos
estados se pisen.

Reglas:

1. **`pendiente` entra como estado propio**, con su distinción contra `abierto` dicha: `abierto`
   es una pregunta esperando a una persona; `pendiente` es una medición esperando a una corrida.
2. **Las definiciones salen del uso medido en 0.2**, no de lo que las palabras sugieren. Si un
   estado se usó de dos formas distintas, **eso es un hallazgo** y va a
   `PENDIENTES_consistencia.md` — no se resuelve eligiendo una por decreto.
3. **Un estado de un solo caso no se elimina ni se fusiona en este paso.** Se reporta. Cambiar el
   estado de un caso publicado es tocar el registro de validación, y eso es otra decisión.
4. **Va al documento que 0.4 haya identificado.** Si ninguno es dueño, **se agrega la fila a
   `CLAUDE.md` §7 en el mismo commit** — es la regla que §7 se pone a sí misma.

---

## Fuera de alcance

- **Reclasificar casos existentes.** Ninguno cambia de estado acá. Si el censo encuentra alguno
  mal puesto, se anota.
- **Fusionar o retirar estados.** Mismo motivo.
- **Los casos `V-103` y `V-104`.** Quedan en `pendiente` y pasan a `exacto` cuando una corrida los
  cite con su lámina — ése es su ciclo normal, no trabajo de este paso.

---

## Addendum · 22/08/2026 — este prompt dejó de "no bloquear nada"

**Fechado y marcado; el cuerpo de arriba no se edita** (`CLAUDE.md` §7). Sale del addendum del
`2026-08-22_23`, punto 4.

**1 · Qué cambió.** `D-38` —las dos fases del proyecto, aprobada por el usuario el 22/08— fija cómo
cierra la fase `informe semanal`, y su **condición 6** pide que cada número publicado tenga su caso
en **estado terminal** (`exacto`, `cerrado`, o `aproximado` con la tolerancia escrita) y **cero
`contradice` sobre un número que el deck publica**. ⛔ **Eso no se puede evaluar mientras el
vocabulario de estados no esté declarado en ningún lado**, que es exactamente lo que mide este
paso. La nota *"no bloquea nada"* del 21/08 quedó vencida a las 24 horas.

**2 · Y una premisa de la Parte 0 que envejeció, anotada para que no se lea como contradicción.**
El `0.1` dice *"un reporte anterior enumeró nueve y el CSV tiene diez"*. **Hoy tiene once**: entró
`pendiente` con el `_18`, con dos casos —`V-103` y `V-104`—, y está contado sobre
`docs/casos_validacion_2026-08-19.csv` el 22/08 con un parser de CSV, no a ojo.

⚠ **Eso no invalida el `0.1`: lo confirma.** Su instrucción es *"no partir de ninguna lista
previa"*, y el número de este addendum es una lista previa más. **Quien lo corra vuelve a contar.**
