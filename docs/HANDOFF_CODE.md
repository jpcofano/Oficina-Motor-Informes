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

> ⭐ **Actualizado tras la corrida nocturna del 05/09** (`2026-09-05_1`, ocho partes). Nada se corrió
> contra la planilla viva y **no hubo `clasp push`** — las dos primeras reglas de esa noche.

0. ⭐⭐ **`clasp push` PRIMERO.** La noche tocó `Generador.gs`, `Instalar.gs` y `Auditoria.gs`, y
   **nada de eso existe todavía para el motor**. Sin esto, los puntos de abajo corren código viejo.
1. ⭐ **`verGlobalL047()`** — dice qué `formato` tienen hoy los seis del bloque global de `L-047`.
   ⚠ **Dirime dos afirmaciones incompatibles del repo**: el alta del 24/08 dice *«ninguno lleva
   `_revisar`»* y `C-99` supone que hay marca. **Si da 0 con `_revisar`, `C-99` no tiene nada que
   levantar.** ⛔ Y antes de levantar ninguna: `revisarASinValidar_` la **repone** si `notas` sigue
   diciendo `SIN VALIDAR`.
2. ⭐ **Una corrida de `jm`** — para ver `emin_lista` publicando texto en vez de `-`. **Control:**
   siete renglones, uno por encuentro, y `emin_encuentros` **tiene que seguir dando 7**.
3. **`censarTokensSinLlaves()`** — escrito el 03/09 y **nunca corrido**; es el único que ve
   `camp_env4_fecha}}`.

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

**Catorce prompts del 04/09 se ejecutaron sin copiarse a `docs/Prompts/`** — violación de `§3`.
⚠ **Eran «trece» hasta el 05/09 y el número estaba mal**: la propia enumeración listaba catorce.

| prompt | falta |
|---|---|
| `_1` · `_2` | los dos |
| `_4` | el principal **y** su addendum 1 |
| `_5` | el principal (su addendum 1 **sí** está) |
| `_6` | su addendum 1 (el principal y el addendum 3 **sí** están) |
| `_7` | el principal (v2) **y** su addendum 1 |
| `_8` | el principal **y** los addenda 1, 2 y 3 (el 4 **sí** está) |
| `_9` | el principal **y** su addendum 1 |

⛔ **No se reconstruyen de memoria** —un prompt reconstruido es indistinguible de uno inventado— y
⚠ **el `_9` Addendum 1 nunca lo recibí**: sobre su veredicto de las 1031 filas **no afirmo nada**.

⛔ **Y NO existe ningún `_8 Addendum 5`**, aunque el `2026-09-05_1` lo dé por ejecutado: el git log
tiene addenda del `_8` **1 a 4**, y lo que cerró `u1_post_meta_alcance` fue el **`_7` Addendum 1**
(`eee5edc`). **Medido, no recordado.**

---

## La cola — **36 ítems, 12 cerrados**

Vive en **`docs/PLAN.md` §2**, no acá. `[x]` 12 · `[~]` 2 (los ítems **7** y **33**) · `[ ]` 22.
⚠ **Eran «37» y el total estaba mal**: los ids van del **1 al 36 sin huecos**, verificado.

```
grep -o '^| `\[.\]` \*\*[0-9]*\*\*' docs/PLAN.md | grep -o '\[.\]' | sort | uniq -c
```

⭐ **Lo último que cerró: el ítem 34** —`emin_lista`, en la corrida nocturna del 05/09— y antes el
**10**, que cerró **sin defecto que medir**.

---

## Lo que sé del estado del motor, y lo que no

| afirmación | cómo lo sé |
|---|---|
| Suites en verde, 94 bancos | **exit code 0**, corrido hoy — no por leer el log |
| `git` == disco local | `git status` vacío, `HEAD == origin/main`, medido |
| `emin_encuentros = 7` | **corrida real** del usuario, no fixture |
| ⚠ el proyecto de Apps Script está al día | **no lo sé** — ver el punto 3 de arriba |
| ⚠ `L-023` publica bien | **no lo sé** — el ítem 9 está frenado |
