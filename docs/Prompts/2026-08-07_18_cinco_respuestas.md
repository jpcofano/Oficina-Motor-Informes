# Cinco respuestas del usuario, a sus dueños

**Un objetivo.** Documentación. **Cero `.gs`, cero hojas, cero corridas.** Cinco decisiones
tomadas el 07/08/2026 que todavía no están en ningún documento. Ninguna abre trabajo nuevo:
todas cierran algo que ya estaba escrito como abierto.

---

## Parte 0 — dónde vive hoy cada una (sólo lectura)

Para cada una de las cinco, ubicar el lugar exacto donde hoy está declarada como abierta —la
`[?]`, el bloque, la fila— y **reportarlo antes de escribir**. **Si alguna ya está cerrada por
otra corrida, no se vuelve a cerrar: se reporta y se saltea.**

**No para acá**: si las cinco aparecen donde se espera, seguís derecho a la Parte A.

## Parte A — las cinco

`A.1` · **Los tres estados de una lista `DISTINCT`.** Addendum a `R-18`. La regla escribió dos y
son tres:

| caso | estado |
|---|---|
| cero filas tras el filtro | `sin_datos` |
| fila con la celda vacía | **no es un no-match**: no entra a la lista, **no** dispara `REVISAR`, y **se cuenta en la traza** |
| valor que no matchea el catálogo | `REVISAR` |
| **todas** las filas rechazadas | **`REVISAR`, nunca `sin_datos`** |

**El motivo, que es lo que hay que dejar escrito:** `sin_datos` afirma que no había nada. Si
había y se descartó, decir `sin_datos` es publicar una afirmación que el motor no midió.

`A.2` · **`ecv_barrio1-3` dejan de ser `[MANUAL]`.** Salen de **la misma lista** que
`ecv_barrios`, con la cadena de prioridad de `R-17`. Va a `CONFIG_INFORMES.md` §1.4 y **cierra
la `[?]`** que estaba abierta desde el 05/08 —*"¿o salen por ranking automático de
asistentes?"*—: la respuesta no es el ranking, es el filtro.

**Y queda anotada la consecuencia, sin resolverla:** son **tres ranuras para cuatro barrios
medidos**. Es plantilla, no motor, y no se toca acá.

`A.3` · **`REUNIONES` es JM.** La lámina 6 es el desglose de la 5, así que mismo universo. Cierra
la pregunta al equipo que abrió el `_13`. **Pero se escribe con su límite:** la hoja **no tiene
columna de figura**, así que hoy es JM **por curaduría, no por control**. Si alguna vez lleva
filas de otras figuras, nadie se va a enterar por la hoja. **Eso va escrito**, porque es la
diferencia entre un supuesto sostenido y uno verificado.

`A.4` · **`camp_bench_*` sale de alcance.** Decisión del usuario: no se resuelve ahora y puede
que se borren. La `[?]` de `CONFIG_INFORMES.md` §4 se marca como **fuera de alcance con fecha**,
no como resuelta. **No se vuelve a levantar en ningún prompt.**

`A.5` · **Una campaña que cruza dos semanas se muestra acumulada**, porque así está la base.
Cierra la `[?]` de `CONFIG_INFORMES.md` §1.1 que decía *"¿acumulada o sólo el tramo de la
semana?"*. **Es una decisión que cambia el número, no la presentación** — dejarlo dicho.

## Commits

Uno por archivo tocado. Documentación. Sin `—`. `git push` después de cada uno.

## Verificación

Ninguna de las cinco queda declarada abierta en dos lugares a la vez.
