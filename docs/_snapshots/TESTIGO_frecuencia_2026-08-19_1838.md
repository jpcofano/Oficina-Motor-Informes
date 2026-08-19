# TESTIGO — `frecuencia` / `gcba_frecuencia` · 19/08/2026 18:38

> **Evidencia congelada.** Testigo **pre** de la Parte B del `2026-08-19_1`, que va a declarar
> `campo_id_cuenta` en la solapa donde viven estos dos. Ventana `2026-07-24–2026-07-30`, origen
> `config`.
>
> **La partición cierra y las cuentas de filas no se movieron. Los valores sí, y mucho.**

## Los dos, nominales

| marcador | valor | filtro | numerador | denominador |
|---|---|---|---|---|
| `frecuencia` | 10,289084964164628 | **4 / 26** | 7.671.871 | **745.632** |
| `gcba_frecuencia` | 1,6457327970868514 | **22 / 26** | 2.063.586 | **1.253.901** |

**Partición: `4 + 22 = 26` ✅** · estado del instrumento: **sin avisos**, los dos publican y los
operandos se leen.

`resolverMarcadores(jm)` → **78 · ok=61 · sin_datos=16 · error=1**.

## ⚠ El hallazgo: el denominador de `frecuencia` creció **+56,7 % en dos días**, en ventana cerrada

| | 17/08 (tanda 4) | 19/08 18:38 | |
|---|---|---|---|
| `frecuencia` · numerador | 6.763.034 | 7.671.871 | **+13,4 %** |
| `frecuencia` · **denominador** | **475.723** | **745.632** | **+56,7 %** |
| `frecuencia` · valor | ~14,22 | **10,29** | **−27,6 %** |
| `gcba_frecuencia` · denominador | 1.249.387 | 1.253.901 | +0,36 % |
| cuentas de filas | 4/26 · 22/26 | **idénticas** | — |

**Y la ventana es la misma: 24–30/07, cerrada desde hace tres semanas.**

⚠ **Los tres denominadores del 17/08 eran idénticos entre sí** —ésa fue la mitad del argumento que
cerró la tanda 4: *"denominador quieto y numerador moviéndose es `looker` acumulando"*. **Dos días
después el denominador se movió más que el numerador.**

**Esto NO invalida la tanda 4**, y conviene decir por qué para que nadie la reabra:

- **las cuentas de filas son idénticas** — 4 y 22 sobre 26, mismas filas;
- **la partición cierra**;
- y el criterio de cierre de la tanda 4 **fue la partición, no los valores**, justamente porque
  `looker` se mueve dentro de ventanas cerradas. **Era la tanda donde la igualdad de valores no
  podía ser el criterio, y sigue sin poder serlo.**

**Lo que sí hace es poner un número a ese movimiento**, que hasta hoy sólo estaba medido en
impresiones: **el `alcance` de la ventana de julio creció 56,7 % en 48 horas.**

⚠ **Y toca una pregunta abierta.** El addendum a `X-19` registró que el alcance del deck de julio
para `3305` era **4,3 % MÁS ALTO** que la base (3.178.282 contra 3.042.983). Con el alcance
moviéndose así, **esa diferencia de 4,3 % no se puede leer como un desvío estable**: la base a la
que se comparó era una foto de un valor que se mueve. **No se resuelve acá; se anota que la
medición de aquel día vale para aquel día.**

## Qué mide este testigo y qué no

**Es el pre de la Parte B.** El criterio de la Parte B es: *si la partición o los denominadores se
movieron después de declarar `campo_id_cuenta`, parar antes de la Parte D*.

⚠ **Con el denominador moviéndose solo 56,7 % en dos días, "los denominadores no se movieron"
deja de ser un criterio utilizable entre corridas separadas por días.** La comparación tiene que
ser **en la misma sesión** —testigo → declarar → testigo, con minutos en el medio—, que es el
criterio corregido de `CLAUDE.md` §4: *la pregunta no es si la base está quieta, sino si se mueve
dentro del intervalo de la verificación*.

**El control que sí sobrevive al drift es la partición y las cuentas de filas.**
