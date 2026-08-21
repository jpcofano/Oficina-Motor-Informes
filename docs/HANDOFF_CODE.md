# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-21, al cerrar el `2026-08-21_1` (el reloj en todas las etapas)

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

## ⛔ Lo que sigue roto y no se tocó

**`generarInforme` tira `TypeError` al continuar un deck.** El retorno arma
`deck: { nombre: copia.getName(), … }` y **`copia` sólo se asigna en la rama que copia la
plantilla**: al continuar queda `undefined`, y tira **fuera del `try/catch`**, después de que el
cierre ya corrió. **La reanudación real nunca puede terminar.**

Nunca se vio porque la única corrida desatendida real salió por *«no quedan secciones pendientes»*,
que devuelve **antes** de llamar a `generarInforme`. **El arreglo es de una línea** —resolver el
archivo por `deckId`— **y necesita su propio prompt**: toca el camino de reanudación, que el
`2026-08-21_1` declara fuera de alcance. Detalle en `docs/PENDIENTES_consistencia.md`.

⚠ **Consecuencia práctica: el mecanismo desatendido no sirve todavía.** Hasta que eso se arregle, una
corrida que corta hay que continuarla a mano.

---

## Lo verificado desde acá, y lo que eso no alcanza a decir

`node tools/probar-reloj-etapas.js` — **17 afirmaciones en verde**, incluida la etapa 1 corriendo de
verdad con `Date` reemplazado, y **la rotura a propósito automatizada**: el banco saca del fuente la
llamada de control de la etapa 2 y verifica que la afirmación caiga nombrando esa etapa.

⚠ **Ninguna corrida real.** Lo verificado es la decisión, el cableado de los controles y el recorrido
de la etapa 1 sobre un reloj simulado. **Que el corte ordenado alcance a escribir todo lo que tiene
que escribir —barrida, `FALTANTES`, `CORRIDAS`, sello— necesita una corrida**, y `cierre_seg` de esa
corrida es lo que dice si la reserva de 30 s alcanza. Si no alcanza, **el corte ordenado igual muere
en el muro** y el reporte lo va a decir con el número.
