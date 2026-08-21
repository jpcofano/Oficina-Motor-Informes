# 2026-08-21_5 — El modo de faltantes se decide en un solo lugar

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Objetivo único:** que el modo de presentación de los huecos —símbolos o `«FALTA:token»`— tenga
> **un default y un solo lector**, en vez de depender de si cada llamador se acordó de pasarlo.
>
> Sale de la inconsistencia **5** del 21/08 en `docs/PENDIENTES_consistencia.md`.

---

## Lo medido

`conSimbolos = opciones.faltantes_como_raya === true`, y `undefined === true` es `false`. Así que
**el default real es el crudo**, y sólo lo evitan los llamadores que se acuerdan de pasar la opción:

| llamador | pasa la opción | modo |
|---|---|---|
| `panel_generar` | sí | símbolos |
| `menuGenerarInformeCompleto_` | **no** | **crudo** |
| `iniciarCorridaDesatendida_` (ejec. 1) | **no** | **crudo** |
| `correrUnaEjecucion_` (ejec. ≥2) | sí | símbolos |

⚠ **El caso peor es la desatendida: la ejecución 1 escribe en crudo y las continuaciones en
símbolos, sobre el mismo deck.** El deck sale con dos vocabularios distintos y nada lo avisa.

⚠ **Y el `=== true` no es un descuido: es una guarda deliberada.** El comentario que lo acompaña lo
dice — la opción entra desde un `<select>`, desde un JSON de la API y desde una llamada a mano, y
un `"false"` de un query string **es truthy**. Lo que falta no es aflojar la guarda: es **distinguir
«no vino» de «vino en false»**, que hoy se ven igual.

---

## Parte 0 — medir. Sólo lectura. **Reportar y seguir.**

1. **Todos los llamadores de `generarInforme`**, y cuál pasa la opción. La tabla de arriba se
   verifica, no se copia.
2. **Si `faltantes_como_raya` entra por la API** (`fn=generarInforme`) y con qué forma. **Es formato
   de cable**: la clave no se renombra.
3. **Qué otros lectores tiene `conSimbolos`** dentro de la corrida — `textoFaltante_`, la barrida —
   y si alguno decide distinto.

---

## Parte A — un default, un lector

1. ⭐ **El default vive en `CONFIG`**, no en el código ni en cada llamador (`CLAUDE.md` §2). Clave
   nueva, sembrada, con `simbolos` como valor.
2. ⭐ **Un solo lector** que resuelve el modo: si la opción **no vino**, el default; si vino, se
   interpreta **estrictamente**, con la guarda del query string intacta.
3. **`«no vino»` y `«vino en false»` dejan de ser lo mismo.** Es la distinción que falta hoy.
4. **La clave `faltantes_como_raya` NO se renombra** — es formato de cable hacia la API.
5. ⚠ **El resultado dice de dónde salió el modo**, no sólo cuál fue: `default de CONFIG` contra
   `lo pidió el llamador` son dos cosas distintas y el reporte las separa.

⛔ **No se toca el juego de símbolos ni `textoFaltante_`.** Sólo quién decide el modo.

---

## Parte B — el control

1. **Un llamador que no pasa la opción recibe el default de `CONFIG`.** Es el caso que hoy falla.
2. **Un llamador que la pasa gana sobre el default**, en los dos sentidos.
3. ⚠ **La guarda del query string sigue viva:** `"false"` como **string** no enciende el modo. Si
   este control no está, el arreglo reintroduce el bug que el `=== true` venía a evitar.
4. ⚠ **Romper a propósito:** volver el lector a `=== true` y verificar que caiga la afirmación 1.

---

## Parte C — la documentación

1. `docs/PENDIENTES_consistencia.md` — cerrar la inconsistencia 5.
2. `docs/BITACORA.md` · `docs/HANDOFF_CODE.md`.

## Lo que este prompt **no** hace

- ⛔ No toca `REUNIONES`, ni `LAMINAS`, ni las plantillas.
- ⛔ No cablea ningún token.
- ⛔ No cambia qué símbolo se usa para qué estado.
