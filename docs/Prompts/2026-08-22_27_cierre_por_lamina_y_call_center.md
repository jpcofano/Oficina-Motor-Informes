# 2026-08-22_27 — El tablero de cierre por lámina, y el Call Center

> **Estado:** no ejecutado · **subagente:** ninguno
>
> **Dos objetivos, en este orden:** que exista un lugar donde una lámina quede **cerrada con
> check**, y cerrar la primera que tiene el número esperado ya escrito.
>
> ⛔ **No entra ninguna otra lámina en este paso.** El Call Center es la única cuyo control está
> escrito antes de empezar.

---

## Por qué el tablero primero

`D-38` dice que la fase cierra cuando el usuario, **mirando un deck completo**, declara que los
faltantes que quedan no son relevantes. Eso pide poder decir *"esta lámina ya está, aunque le
falten cosas"* — y hoy no hay dónde decirlo.

Lo que existe no sirve para esto: el tablero del `VALIDACION_deck_generado_vs_equipo_2026-08-22.md`
es **una foto fechada** que no se actualiza, y `PENDIENTES_consistencia.md` está organizado **por
hueco, no por lámina**. Ninguno de los dos se toca.

---

## Parte 0 — medir. Sólo lectura. **Reportar y parar.**

> **Modelo: Sonnet · effort alto.**

1. **Las láminas reales**: qué filas tiene `LAMINAS` para `jm`, con su `seccion_id` y su `rol`. **El
   tablero se puebla con éstas, no con una lista escrita a mano.**
2. **`MAPEO` para `looker/CC`**: confirmar que hoy no tiene ninguna fila, y con qué forma están
   escritas las filas de `MAPEO` de otra solapa de `looker` que sí funcione. **La forma se copia de
   una que anda, no se inventa.**
3. **Los marcadores `cc_*` que hoy existen** en `MARCADORES`, y cuáles de los que la lámina necesita
   faltan.
4. **La clave de `V-91`** —`ID Cuentas` + `Tipo de llamado IN (Convocatoria; IVR convocatoria)`— y
   si `looker/CC` en la planilla viva tiene esas dos columnas con esos valores.

⛔ **Si `looker/CC` no tiene la columna `Tipo de llamado`, reportar y parar.** Sin ella no hay forma
de separar los dos universos, y `S-01` dice que las filas con `IVR convocatoria` **alimentan Call
Center, no el bloque IVR**.

---

## Parte A — `docs/CIERRE_POR_LAMINA.md` · **Sonnet**

Una fila por lámina de `jm`, con estas columnas: **lámina · estado · qué falta para el check ·
fecha del último cambio**.

**Cuatro estados y nada más:**

| | |
|---|---|
| ✅ | cerrada — el usuario la miró y declaró que lo que falta no es relevante |
| 🟡 | medida y entendida, falta un paso mecánico ya definido |
| ⛔ | abierta — falta cablear, decidir o medir |
| ⏳ | hay un paso corriendo sobre ella |

⛔ **El ✅ lo pone el usuario, nunca Code.** Es la regla de la marca de verificación humana de
`CLAUDE.md`, aplicada acá: Code puede mover una fila a 🟡 con evidencia, y ahí para.

**Y una lámina puede cerrarse con faltantes.** `D-38` no pide completitud, pide que el usuario
declare que lo que falta no es relevante. Una fila ✅ con texto en *"qué falta"* **no es una
contradicción**: es el caso normal.

**El estado inicial sale de la Parte 0 y de lo ya documentado**, no de una lectura nueva del deck.
Lo que no esté medido va ⛔ con *"sin medir"*, no con una estimación.

---

## Parte B — el Call Center · **Opus** · effort alto

**El control ya está escrito:** `V-91` fija la clave y `Base discada` = `Base enviada`, con el
número esperado medido —6.673 contra 6.851 publicado— y la definición cerrada.

1. Las filas de `MAPEO` para `looker/CC`, con la forma que salga del `0.2`.
2. Los marcadores que falten en `MARCADORES`, y **la aritmética sólo en `Marcadores.gs`**.
3. El recorte por `Tipo de llamado` según `V-91` y `S-01`.

⛔ **Ningún nombre de solapa, ID ni valor hardcodeado en `.gs`.** Todo a las hojas de control.

**Control:** las tres celdas del Resumen dejan de salir `/////` y `cc_base_total` da **6.673**. Si
da otra cosa, **reportar el número y el camino, y parar** — no ajustar hasta que dé.

---

## Parte C — mover las filas · **Sonnet**

Las láminas que este paso tocó pasan a 🟡 en el tablero, con la evidencia. **Ninguna a ✅.**

---

## Orden de sacrificabilidad

`0` → `A` es lo mínimo: sin tablero, el próximo paso vuelve a empezar por reconstruir el estado.
`B` cae entera si el `0.4` frena. `C` es la única que puede quedar para después.

## Commits

Uno por parte. El tablero es documentación y va separado del cableado. Sin `Co-Authored-By`.
