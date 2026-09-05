# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-09-05 — **el `_9` cerró sin tocar el motor.** `R-34` registra que
`camp_alcance` publica el alcance de **Meta** porque es la única columna que hay, y la diferencia
con el equipo **está explicada**: el equipo no actualiza la base. **Suites: 94 bancos, exit 0.**
**Cola: 12 de 37 cerrados.**

> ⛔ **Este documento estuvo 62 commits atrasado** (del 02/09 al 05/09) y decía *«ministros 1 de
> 10»*, *«85 bancos»* y una lista de cosas a correr que ya habían corrido. **Lo encontró el usuario
> preguntando, no un control.** Registrado en `PENDIENTES_consistencia.md`.

---

## ⛔ Lo que hay que correr, y es tuyo

1. ⭐ **Confirmar qué dice la columna `meta_frecuencia`** para la campaña del deck. **Es lo único
   que queda de todo el `_9`.** ⚠ Ya **no es un desempate** —la aritmética cierra, `2.080.014 /
   872.827 = 2,38`— sino una **confirmación de lectura**: si dijera otra cosa, el `2,38` sería
   coincidencia y la pregunta volvería a abrirse.
2. **`diagLimpiarGrupoB()` y, si está bien, `limpiarGrupoB()`** — los cuatro del grupo B del `_7`.
3. ⚠ **Verificar que el proyecto de Apps Script tenga el código de hoy.** El último `clasp push` de
   esta sesión **no está registrado en ningún lado que yo pueda leer**, y un push que corrió antes
   del último cambio es indistinguible de uno que no corrió (`CLAUDE.md` §4). `clasp pull` a un
   temporal lo contesta sin pisar nada.

---

## ⭐ Lo último, en cinco líneas

- ⭐⭐ **`R-34` + `C-94`/`C-95`/`C-96`: no hay tres discrepancias, hay una sola fuente distinta.**
  El motor lee la base, el equipo lee la plataforma, y **todo lo derivado hereda el alcance que le
  tocó**. `C-93` quedó superseded (`D-58`) y **no se editó**.
- ⭐ **Ministros: los 10 cableados**, con `emin_encuentros = 7` reproducido en corrida real. El
  corte pasó a la columna `D` con ventana **viernes a viernes** y **el `−3` se cayó medido**.
- ⭐ **`D-57` implementado**: un solo botón, siempre desatendida, con el progreso en la misma
  pantalla. Con el ítem 31 cerrado en el mismo cambio.
- ⭐ **Ítem 33, causa raíz**: el bloque modelo se tomaba **por posición** sobre un deck ya movido.
  Ahora se resuelve por `objectId`, **calculado antes de la primera duplicación**.
- ⚠ **Parte E: un `formato` desconocido ahora FALLA visiblemente.** Es **inerte hoy** —el censo da
  0 después de `formatoEmin()`— y por eso tiene banco propio: un cambio inerte no tiene testigo.

---

## ⛔ Lo congelado por el usuario — no se toca

| qué | hasta cuándo |
|---|---|
| **Los Resúmenes Ejecutivos** | hasta **validar con los equipos de dónde sale la información** |
| **Todos los `*_bench_*`** | sin fecha — decisión del 04/09 |
| **Todo lo que vive SÓLO en láminas escondidas** | ⚠ **en las dos plantillas**. Los **mixtos** —escondido en una, visible en la otra— **NO se congelan**: el lado que lo pinta lo necesita |

---

## ⚠ Lo que quedó frenado a propósito, con el arreglo ya localizado

- **`emin_lista` publica `-`.** El arreglo es **un nombre** en la lista de
  [Generador.gs:1723](Generador.gs#L1723) — `['FILA', 'FILA_TEXTO', 'GRUPO_TEXTO']` no incluye
  `LISTA_TEXTO`. ⛔ **Reportado y no aplicado**: no había prompt que lo pidiera.
- **Ítem 9 — `camp_titulo` en `L-023`.** Localizado hasta *«si `L-023` entra o no en la lista de
  tokens a resolver»*, **parado antes del arreglo por instrucción**. ⚠ Las tres explicaciones
  anteriores —dos mías— **se cayeron con la medición del usuario**.

---

## ⛔ La deuda documental abierta, y es mía

**Trece prompts del 04/09 se ejecutaron sin copiarse a `docs/Prompts/`** — violación de `§3`. En la
carpeta hay **5**; faltan el `_1`, el `_2`, el `_4` y su addendum, el `_5` principal, el `_6`
addendum 1, el `_7` y su addendum 1, el `_8` y sus addenda 1–3, y el `_9` principal y su
addendum 1.

⛔ **No se reconstruyen de memoria** —un prompt reconstruido es indistinguible de uno inventado— y
⚠ **el `_9` Addendum 1 nunca lo recibí**: sobre su veredicto de las 1031 filas **no afirmo nada**.

---

## La cola — **37 ítems, 12 cerrados**

Vive en **`docs/PLAN.md` §2**, no acá. `[x]` 12 · `[~]` 2 (los ítems **7** y **33**) · `[ ]` 23.

⭐ **Lo último que cerró: el ítem 10**, y **no como se esperaba** — la pregunta *«¿32,7 es
correcto?»* no se contesta con un caso `V-` contra el deck, porque **no hay defecto que medir**.

---

## Lo que sé del estado del motor, y lo que no

| afirmación | cómo lo sé |
|---|---|
| Suites en verde, 94 bancos | **exit code 0**, corrido hoy — no por leer el log |
| `git` == disco local | `git status` vacío, `HEAD == origin/main`, medido |
| `emin_encuentros = 7` | **corrida real** del usuario, no fixture |
| ⚠ el proyecto de Apps Script está al día | **no lo sé** — ver el punto 3 de arriba |
| ⚠ `L-023` publica bien | **no lo sé** — el ítem 9 está frenado |
