# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-21, al cerrar el `2026-08-21_2` (la rama de continuación)

---

## ⛔ Lo primero, y sin esto nada de lo demás sirve

⭐ **Mirar `CONFIG.presupuesto_corrida_seg`.** La mañana del 21/08 estaba en **150** —quedó bajo de
la prueba del mecanismo desatendido de la noche anterior— y la corrida de `jm` llegó igual al muro
duro de Apps Script, **360 s**. Ése fue el diagnóstico entero: el presupuesto no se respetaba porque
el reloj sólo se consultaba dentro del bucle de asignaciones.

**Eso está arreglado. Y por eso el techo importa ahora más que antes:** con 150 el motor **corta
bien**, y va a cortar siempre. Subirlo es el primer paso.

⚠ **La corrida del 21/08 murió en el muro y una corrida que muere en el muro no escribe nada** — ni
cierra su fila, ni barre, ni quita el sello. Lo que hay que limpiar y qué mirar antes está en
`docs/PENDIENTES_consistencia.md`, entrada del 2026-08-21. En resumen:

| # | qué | por qué antes que lo demás |
|---|---|---|
| 1 | ⭐ **Copiar la columna `faltantes` de la fila `jm-20260821-094731` de `CORRIDAS`** | tiene el **rastro de etapas con los segundos de cada una** — `marcarEtapa_` escribe con `flush()`, así que **sobrevive al muro**. Es la única medición directa de dónde se fue el tiempo, y se pierde al tocar la fila |
| 2 | **`cancelarCorridaDesatendida()`** | limpia el estado `corrida_desatendida` de `PropertiesService`, que quedó vivo. Mientras esté, **no se puede arrancar otra corrida desatendida** |
| 3 | **Borrar tres decks** | `jm-20260820-190943` y los **dos del 21/08 con `[en proceso]`**. Ninguno publicó nada |
| 4 | **Cerrar a mano** la fila de `CORRIDAS` y las de `PLAN_CORRIDA` de `jm-20260821-094731` | |

---

## Lo que cambió en el motor

**El reloj se consulta ahora en todas las etapas declaradas**, no sólo entre asignaciones.

- `controlDeEtapa_` es el único punto de decisión y `ETAPAS_CON_CONTROL_` declara qué etapas lo
  llevan. **Un corte trae su clase**: `arranque_no_entra` manda a subir el techo o partir el
  arranque; `presupuesto` manda a correr de nuevo. **Son dos arreglos distintos** y el reporte los
  nombra distinto.
- **Dentro de la etapa 1 hay dos controles**: uno después de la primera lectura (el arranque ya se
  pagó) y uno antes de cada sección siguiente. Se corta **entre secciones, nunca adentro de una**.
- **El cierre no lleva punto de control, y es deliberado**: tiene que correr siempre. Lo que lo
  protege es la reserva — así que **se mide** (`presupuesto.cierre_seg`) y el reporte avisa si no
  entra, con el valor que habría que poner.
- **El techo del panel sale de `CONFIG`**, no de una constante del HTML. Antes decía 350 mientras el
  motor tenía 150, y la regla del cronómetro pasó el techo real sin ponerse en rojo.

**Tres claves nuevas de `CONFIG`**, sembradas: `costo_arranque_seg` (80), `costo_mapa_seg` (25),
`costo_item_seg` (6). Son **semillas**, no criterios: la observación de la corrida las pisa.

---

## ⏸ Los botones que esperan, en orden

**Todo está pusheado** (`clasp push`, 21/08). Estos escriben en hojas de registro o generan, así que
los corre el usuario.

| # | qué correr | qué destraba |
|---|---|---|
| 0 | ⭐ **Subir `CONFIG.presupuesto_corrida_seg`** y limpiar lo del 21/08 (arriba) | con 150 el motor corta siempre |
| 1 | **`verificarRelojDeEtapas()`** | las cuatro pruebas del reloj **adentro de Apps Script**. Barato, y dice el techo vigente en su reporte |
| 2 | **Aplicar configuración** | siembra las tres claves nuevas de `CONFIG` y `agosto_14_20` en `PERIODOS` |
| 3 | ⭐ **`verificarCierreParaGenerar()`** | las dos migraciones del `_7`, en orden y frenando si la primera falla |
| 4 | **`preverSimbolosJM()`** y **`preverSimbolosSecco()`** | el conteo por símbolo esperado, **antes** de generar |
| 5 | **Generar** los dos decks | con los números del punto 4 a la vista |

⚠ **El 3 antes del 4, y el 4 antes del 5.** `preverSimbolos*` leído después de generar ya no es un
control: es una explicación.

⚠ **`verificarAlcanceDesatendido()` antes de confiar en el mecanismo desatendido.** Un trigger corre
**sin usuario delante**, con los permisos del **dueño del script**, y las bases son planillas de
otras cuentas compartidas con él.

⚠ **La próxima ejecución puede pedir re-autorizar.** `appsscript.json` sumó el scope
`script.scriptapp` el 20/08. Es un diálogo de permisos, no un error.

---

## ✅ El `TypeError` de la reanudación: cerrado

`generarInforme` tiraba al continuar un deck — `copia.getName()` sobre una variable que sólo se
asigna en la rama que copia la plantilla, y **fuera del `try/catch`**, o sea después de que el cierre
ya escribió `CORRIDAS` y quitó el sello. **La reanudación real no podía terminar nunca.**

Arreglado en el `2026-08-21_2`: `nombre`, `url` y `dueno` salen de **un solo
`DriveApp.getFileById(deckId)`**, que existe en los dos caminos. **El barrido de la misma clase de
bug dio una sola variable** —`copia`— y no hay más.

⭐ **Y el control que no existía ya existe:** `tools/probar-continuacion-deck.js`, 22 afirmaciones,
con la rotura a propósito adentro. Hasta el 21/08 las tres suites del repo estaban **todas en
verde** y **ninguna tocaba esa rama**.

---

## ⏸ Lo que sigue: probar el ciclo desatendido

**Es lo próximo y ya no está bloqueado.** Lo que falta medir necesita trigger, lock y una corrida
real, y por eso es del usuario:

- que la ejecución 1 corte y deje plan,
- que el trigger dispare y la continuación **entre a `generarInforme` y vuelva** — el camino que
  hasta hoy tiraba,
- que las secciones se marquen `hecha` por resolución,
- que el cierre quite el sello.

⚠ **Antes de eso, `verificarAlcanceDesatendido()`**: un trigger corre **sin usuario delante**, con
los permisos del **dueño del script**, y las bases son planillas de otras cuentas.

---

## Lo verificado desde acá, y lo que eso no alcanza a decir

Las cuatro suites, en verde: `probar-reloj-etapas` (**17**), `probar-continuacion-deck` (**22**),
`probar-planificador` (**18**) y `probar-resueltas` (**14**). Las dos primeras tienen **la rotura a
propósito automatizada**: sacan del fuente la línea que protegen y verifican que la afirmación caiga.

⚠ **Y una lección del banco nuevo que conviene tener a mano antes de escribir el próximo:**
`generarInforme` **atrapa las excepciones a propósito** y devuelve `ok: true` con el `fallo` adentro.
Un control que sólo mire `ok` pasa sobre corridas que murieron en el medio — pasó, con seis
afirmaciones en verde. **Afirmar `fallo === null` es lo que hace que las otras signifiquen algo.**

⚠ **Ninguna corrida real.** Lo verificado es la decisión, el cableado de los controles y el recorrido
de la etapa 1 sobre un reloj simulado. **Que el corte ordenado alcance a escribir todo lo que tiene
que escribir —barrida, `FALTANTES`, `CORRIDAS`, sello— necesita una corrida**, y `cierre_seg` de esa
corrida es lo que dice si la reserva de 30 s alcanza. Si no alcanza, **el corte ordenado igual muere
en el muro** y el reporte lo va a decir con el número.
