# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-20, al cerrar el `2026-08-19_2` (panel por secciones)

## ⏸ Lo que espera al usuario — dos botones, y bloquean cosas distintas

1. ⭐ **Correr `censarTokensSinMarcador()`** (público, sin argumentos) **más una generación de
   `jm`**. Destraba dos cosas: el censo por símbolo del `2026-08-20_1` —saber si el deck se ve o si
   es casi todo `/////`— y la línea base del cableado.
   ⚠ **Y decidir cómo censar `secco`, porque la función está clavada en `'jm'`**
   (`Auditoria.gs:3275`, `leerInformes()['jm']` — es la única de seis que hardcodea el informe).
   **Sin censo de `secco` el `2026-08-20_4` no puede escribir una sola `*`.**
2. **Correr `secco` una vez** después de que el `_4` entre, para contrastar contra el `N` declarado.

## ✅ Lo que cerró el 20/08, en orden

| paso | qué quedó |
|---|---|
| `2026-08-20_1` | **cuatro símbolos en el deck**: `/////` falta cablear · `---` falló · `-` sin dato · `-1.234-` dudoso. `presentacion_faltantes` vale `'simbolos'` |
| `2026-08-20_3` | **los tres caminos de verificación**, escritos por primera vez en `CLAUDE.md` §4 |
| `2026-08-20_2` | **el default es la última semana cerrada**, viernes a jueves (`R-11` Addendum 2) |
| `2026-08-19_2` | **el panel por secciones**: un cuadrado por fuente de temario, con Proponer y Cargar |

Los cuatro con `clasp push` **verificado con `clasp pull`**: el proyecto vivo tiene el código.

**Controles vivos, los cuatro en verde:** `probar-simbolos-faltante` (25) ·
`probar-semana-cerrada` (24) · `probar-temario-reuniones` (14) · `probar-formato-revisar`.
**Los tres nuevos se corrieron con su control negativo**, no sólo en verde.

## ▶ Lo próximo, en orden

| qué | estado | qué lo destraba |
|---|---|---|
| **`2026-08-20_4` — SECCO deja de estar vacío** | **Parte 0 corrida y reportada; Partes A–D sin ejecutar** | el censo de `secco` del punto 1 de arriba |
| **`2026-08-20_5` — `m2_campanias`** | **Parte 0 corrida en parte; Partes A–D sin ejecutar** | nada bloqueante: `CUENTA_DISTINTOS` es genérica y se puede escribir ya |
| **la fila de `PERIODOS` para la semana** | sin prompt | es **escribir una fila en la hoja**, no un `clasp push` — ver `ESCRITORES.md` |
| **frente 13 bis — `DIMENSIONES_` a hoja** | `2026-08-16_6`, sin ejecutar | ⚠ **se revisa antes de correr**: es del 16/08 |
| `2026-08-16_5` — los `pauta_*` duplicados | escrito, sin ejecutar | van a validación, no a migración |

## Lo que el `2026-08-20_2` dejó medido, y corrige una creencia previa

⚠ **«Una ventana sin fila en `PERIODOS` no se puede correr» es FALSO** por el camino por defecto.
`generarInforme` exige el `periodo_id` **sólo cuando se le pasa uno**; el panel manda `''` y la
cadena de `D-20` resuelve sola hasta el eslabón 5. **El deck se genera, sobre las fechas
correctas.**

**Lo que sí pasa sin período con nombre:** `anclarEncuentrosSinCache_` saca el período del `origen`
de la ventana, y una calculada trae `'R-11 (calculado)'` → **el recorte de `D-19` no se aplica** y
entran las **12 reuniones con `mostrar=sí`, de dos períodos distintos** (8 de `julio_24_30`, 4 de
`junio_sem2`). **El panel avisa y no bloquea**: una advertencia equivocada cuesta lo mismo que
ninguna.

⚠ **`CONFIG.periodo_desde`/`periodo_hasta` están VACÍOS** (verificado contra la planilla viva), así
que el eslabón 5 corre en cada corrida sin `periodo_id`. El camino B **es observable desde hoy**.

## Lo que la Parte 0 del `_4` midió, y dónde se traba

- **`MARCADORES`: 87 filas, las 87 `jm`.** `secco` sale entero en hueco. La `*` sigue sin un solo uso.
- **`SECCIONES.ministros`**: `SECCO` · `agregado` · `familia_tokens = emin_` · `itera_sobre` vacío ·
  `estado = activa`. Confirmado contra la hoja.
- **`rdv` está listo para `ministros`**: `figura` (col A) y `status` (col I) mapeados, y la lista
  blanca de `D-21` **está declarada** — `valores_incluidos = 'Realizada'`. Así que la Parte B tiene
  razón: `STATUS = Realizada` **no se escribe** en el filtro, ya lo aplica `leerFuente`.
- **`SECCIONES.periodo_ref` sigue vacía en las 36.** El eslabón 3 de `D-20` nunca se disparó.
- ⚠ **El censo de `secco` está bloqueado por el instrumento**, no por el dato — ver el punto 1 de
  arriba.

## Lo que sigue abierto en `PENDIENTES` y no se tocó

1. ⚠ **Ninguna hoja de registro fecha una escritura sobre `MARCADORES`.** `CORRIDAS` no lo puede
   responder: es un **insumo, no un log** (`D-07`).
2. ⚠ **Re-correr el snapshot el mismo día pisa la evidencia anterior.** Se recuperó de git una vez;
   nada en el script advierte.
3. ⚠ **El separador decimal de `numero` es el punto de JS, no la coma de es-AR.** Preexistente desde
   el 05/08 — `numero_revisar` da `-8.89-`. La ilustración con coma **ya entró dos veces** en un
   prompt por el mismo camino. **No se arregla sin decisión del usuario**: cambia el formato de todo
   lo publicado.
4. ⚠ **Los dos cargadores difieren en `mostrar`** — `REUNIONES` deja vacío (la persona confirma),
   `CAMPANAS` pone `sí` (`AJ-1`, *ante la duda entra*). **Reportado y sin unificar, por decisión.**

## Lo que NO se tocó y sigue como estaba

- **`semanaR11_` y `diagEncuentrosPorSemana_`** — el `_2` se apoya en la primera y no cambia
  ninguna. Las nueve afirmaciones del control viejo siguen pasando, y el control nuevo las repite
  para poder demostrarlo sin abrir Apps Script.
- **`parsearLineaReunion_`** — el proponedor se adapta al parser, no al revés. Reconoce `(pre)` y
  `(post)` **exactos**, y eso está bien.
- **La clave de cable `opciones.faltantes_como_raya`** conserva el nombre aunque ya no elija una
  raya: `generarInforme` es invocable por la API **por nombre**, así que es formato de cable.
- **`SECCIONES` se siembra como `CONFIG`** (sólo lo ausente) — decidido, en `PENDIENTES`.
