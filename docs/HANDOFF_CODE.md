# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-09-06, tras la **corrida nocturna** (`2026-09-06_1`, cuatro partes).
⭐⭐ **`R-20` implementado: el desplazamiento de ventana por solapa**, con las celdas **vacías** hasta
que el usuario cargue el valor. **Suites: 97 bancos, exit 0.** **Cola: 36 ítems, 12 cerrados.**

> ⛔⛔ **Lo que hay que saber antes de mirar el deck de hoy:** `emin_lista` **publica** los siete
> renglones —el arreglo del 05/09 funciona (`C-100`)— **y son OTRAS siete** (`C-101`). Sobra Quirós,
> falta Sabor, y **`emin_encuentros = 7` da verde igual** porque las dos diferencias se cancelan en
> el total. **El cableado está bien; el universo no.**

> ⛔ **Este documento estuvo 62 commits atrasado** (del 02/09 al 05/09), y **lo encontró el usuario
> preguntando, no un control.** Registrado en `PENDIENTES_consistencia.md` con la condición
> vigilable que faltaba.

---

## ⛔ Lo que hay que correr, y es tuyo

> ⚠ **Nada se corrió contra la planilla viva y NO hubo `clasp push`** — las dos primeras reglas de
> la noche.

0. ⭐⭐ **`clasp push` PRIMERO.** Dos noches tocaron `Generador.gs`, `Instalar.gs`, `Auditoria.gs` y
   `Fuentes.gs`, y **nada de eso existe todavía para el motor**. Sin esto, todo lo de abajo corre
   código viejo.
1. ⭐⭐ **Aplicar configuración** — para que aparezcan `ventana_desde_dias` y `ventana_hasta_dias` en
   `SOLAPAS`. **Control:** las dos columnas existen, **antes de `notas`**, y **vacías en todas las
   filas**. ⚠ Si no aparecen con eso, hace falta `instalar()`; el reporte de la noche lo dice.
2. ⭐ **Cargar el desplazamiento de la Agenda** —`reuniones / Agenda funcionarios`—, **y es tuyo
   porque cambia qué filas publica el deck**. La medición dice que **`-3` y `-2`** reproducen las
   siete correctas. **Control:** con eso, `emin_lista` deja de traer `04/09` y `08/09`, **entra
   Sabor y sale Quirós**, y `emin_encuentros` **sigue en 7** — el conteo no distingue, la lista sí.
3. ⭐ **`verGlobalL047()`** — qué `formato` tienen hoy los seis del bloque global de
   `L-047`. ⚠ **Dirime dos afirmaciones incompatibles del repo:** el alta del 24/08 dice *«ninguno
   lleva `_revisar`»* y `C-99` supone que hay marca. **Si da 0, `C-99` no tiene nada que levantar.**
4. ⭐ **Confirmar qué dice la columna `meta_frecuencia`** para la campaña del deck. **Es lo único que
   queda del `_9`.** ⚠ No es un desempate —la aritmética cierra, `2.080.014 / 872.827 = 2,38`— sino
   una **confirmación de lectura**.
5. **`diagLimpiarGrupoB()` y, si está bien, `limpiarGrupoB()`** — los cuatro del grupo B del `_7`.
6. **`censarTokensSinLlaves()`** — escrito el 03/09 y **nunca corrido**; es el único que puede ver
   `camp_env4_fecha}}`.

⛔ **Antes de levantar cualquier `_revisar`:** `revisarASinValidar_` **lo repone** si `notas` sigue
diciendo `SIN VALIDAR`. Es el caso del 26/08→01/09, que costó **ocho días en el deck**.

---

## ⭐ Lo último, en seis líneas

- ⭐⭐ **`emin_lista` deja de publicar `-`** (ítem 34): `ctx.plantilla` salió del `if` de la familia
  `FILA`. ⛔ **No por el camino que el ítem daba por bueno** —agregar el nombre a la lista—: medido,
  eso manda el `separador` a `buscarMapeo` **como nombre de campo**.
- ⭐⭐ **`R-34` + `C-94`…`C-96`: no hay tres discrepancias, hay una sola fuente distinta.** El motor
  lee la base, el equipo lee la plataforma.
- ⭐ **`C-99` supersede a `C-97`** — los nombres del global de `L-047` **sí estaban en el repo**, y
  `V-113` es un caso `exacto` sobre ese bloque desde el 23/08.
- ⭐ **Ítem 29** (`probar-caso-id.js`) y **ítem 36** (`medir-casos-exactos-con-revisar.js`) con
  instrumento. El segundo **corrió**: 3 con `exacto` y marca, **7 con `contradice` y sin marca**.
- ⛔⛔ **Ministros: los 10 cableados, y publican sobre el universo equivocado.** ⚠ **La ventana la
  elige el usuario** —el asistente ofrece `vie–jue` y `vie–vie` más personalizados— así que **el
  encabezado de un deck NO prueba que un cambio de código se aplicó**: prueba qué período se eligió.
  Lo que sí está medido es que **las siete filas que salen no son las siete que corresponden**.
- ⭐ **`D-57`**: un solo botón, siempre desatendida, con progreso en la misma pantalla.

---

## ⛔ Lo congelado por el usuario — no se toca

| qué | hasta cuándo |
|---|---|
| **Los Resúmenes Ejecutivos** | hasta **validar con los equipos de dónde sale la información** |
| **Todos los `*_bench_*`** | sin fecha — decisión del 04/09 |
| **Todo lo que vive SÓLO en láminas escondidas** | ⚠ **en las dos plantillas**. Los **mixtos** —escondido en una, visible en la otra— **NO se congelan** |
| **`L-039`, `L-048`, `L-050`** | fuera de alcance desde el **22/08**. ⛔ `L-050` no se puede mostrar sin cablear sus 21 tokens: *«el problema vuelve ENTERO»* |

---

## ⚠ Lo que sigue frenado, con el estado exacto

- **Ítem 9 — `camp_titulo` en `L-016`/`L-023`.** Parado antes del arreglo **por instrucción**.
  ⭐ **Dato nuevo del 05/09:** **cuál campaña sale depende de a qué hora se corra** (10:45 →
  *Operativo Muro*, 11:42 → *Fin de las mafias…*). ⇒ Toda comparación tiene que declarar la hora.
- **El remitente sin normalizar.** ⚠ Son **dos** cosas: el **formato** (dirección entera contra `JM`)
  y la **ausencia** en las otras tres filas. **La segunda no es de formato.** Decide el usuario.
- **`confirmarGlobalL047()` no existe a propósito** — no se sabe si hay algo que levantar, y aunque
  lo haya, `revisarASinValidar_` lo repondría.

---

## ⛔ La deuda documental abierta, y es mía

**Catorce prompts del 04/09 se ejecutaron sin copiarse a `docs/Prompts/`** — violación de `§3`.
⚠ **Eran «trece» y el número estaba mal**: la propia enumeración listaba catorce.

| prompt | falta |
|---|---|
| `_1` · `_2` | los dos |
| `_4` | el principal **y** su addendum 1 |
| `_5` | el principal (su addendum 1 **sí** está) |
| `_6` | su addendum 1 (el principal y el addendum 3 **sí** están) |
| `_7` | el principal (v2) **y** su addendum 1 |
| `_8` | el principal **y** los addenda 1, 2 y 3 (el 4 **sí** está) |
| `_9` | el principal **y** su addendum 1 |

⛔ **No se reconstruyen de memoria.** ⚠ **El `_9` Addendum 1 nunca lo recibí**: sobre su veredicto de
las 1031 filas **no afirmo nada**.

⛔ **Y NO existe ningún `_8 Addendum 5`**, aunque el `2026-09-05_1` lo dé por ejecutado: el git log
tiene addenda del `_8` **1 a 4**, y lo que cerró `u1_post_meta_alcance` fue el **`_7` Addendum 1**
(`eee5edc`).

---

## La cola — **36 ítems, 12 cerrados**

Vive en **`docs/PLAN.md` §2**, no acá. `[x]` 12 · `[~]` 2 (ítems **7** y **33**) · `[ ]` 22.

```
grep -o '^| `\[.\]` \*\*[0-9]*\*\*' docs/PLAN.md | grep -o '\[.\]' | sort | uniq -c
```

⭐ **Lo último que cerró: el 34**, y antes el **10** — que cerró **sin defecto que medir**.

---

## Lo que sé del estado del motor, y lo que no

| afirmación | cómo lo sé |
|---|---|
| Suites en verde, **97** bancos | **exit code 0**, corrido hoy — no por leer el log |
| `git` == disco local | `git status` vacío, `HEAD == origin/main`, medido |
| `emin_encuentros = 7` | **corrida real** del usuario, no fixture |
| el cruce inverso del ítem 36 funciona | ⭐ reencuentra `u1_post_meta_alcance`/`X-43`, que **`CLAUDE.md` §4 nombraba antes** de que existiera |
| ⛔ el proyecto de Apps Script **NO** está al día | **la noche tocó tres `.gs` y no hubo push** — es certeza, no duda |
| ⛔ `emin_lista` publica **las filas equivocadas** | `C-101` — la lista trae `04/09` y `08/09`, fuera del encabezado. **Y `emin_encuentros` da 7 igual** |
| ⚠ si el desplazamiento arregla el universo | **no lo sé** — el banco prueba el mecanismo; el valor lo carga el usuario y hace falta una corrida |
| ⚠ `L-023` publica bien | **no lo sé** — el ítem 9 está frenado |
