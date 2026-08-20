# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-20, al cerrar el `2026-08-20_1` (cuatro símbolos en el deck)

## ⭐ Dónde estamos: **el deck ya distingue quién arregla qué**

`2026-08-20_1` cerrado, Partes A + B + C + D. `clasp push` corrido **y verificado con `clasp pull`
a un temporal**: el proyecto vivo tiene el cambio.

| en el deck | qué significa | quién lo arregla |
|---|---|---|
| `/////` | falta el token — sin fila en `MARCADORES`, o la barrida no lo alcanzó | **cableado** |
| `---` | falló — hay fila, se intentó leer y no salió (`error` · `REVISAR`) | **fuente o filtro** |
| `-` | no hay dato — se preguntó bien y la respuesta fue vacía (`sin_datos`) | nadie: es el dato |
| `-1.234-` | dudoso — sufijo `_revisar`, ya existía y no se tocó | quien lo declaró |

`textoFaltante_(token, resultado, conSimbolos)` decide con **el estado y la existencia de la
fila**. El modo crudo `«FALTA:token»` **no se retiró**: quedó detrás del checkbox, y por eso `S-05`
sigue vivo. `presentacion_faltantes` vale ahora `'simbolos'`.

## ⏸ Lo que espera al usuario, y bloquea cosas distintas

1. ⭐ **El censo por símbolo de la última corrida de `jm`** — punto 4 de la Parte 0 del
   `2026-08-20_1`, **abierto a propósito**: la Parte A no lo esperó por decisión del usuario. Se
   corre `censarTokensSinMarcador()` (pública, sin argumentos) **más una generación**, porque el
   censo mide *"sin fila en `MARCADORES`"* y eso **no** es *"publica `«FALTA:»`"* — hay tokens con
   fila que fallan en ejecución y el censo no los ve. Sin esto no se sabe si el cambio se ve o si
   el deck es casi todo `/////`.
2. ⭐ **Vaciar `CONFIG.periodo_desde` y `CONFIG.periodo_hasta`** — decisión del usuario del 20/08,
   y **es la precondición del `2026-08-20_2`**. Hoy valen `2026-07-24` / `2026-07-30`, así que el
   eslabón 4 corta antes del 5 y el camino B **se implementaría sin poder observarse**.

## ▶ Lo próximo, en orden

| qué | estado | qué lo destraba |
|---|---|---|
| **`2026-08-20_2` — la última semana cerrada por defecto** | escrito, **NO ejecutar todavía** | el punto 2 de arriba: que el usuario vacíe `CONFIG` |
| **`2026-08-20_3` — el fixture como tercer camino de verificación** | Parte 0 corrida y reportada; Partes A y B sin ejecutar | nada — decide el usuario cuándo |
| **frente 13 bis — `DIMENSIONES_` pasa a hoja de registro** | `docs/Prompts/2026-08-16_6_dimensiones_a_hoja.md`, sin ejecutar | ⚠ **se revisa antes de correr**: es del 16/08 y sus premisas ya envejecieron |

## Lo que el `2026-08-20_2` deja medido y NO resuelto

- **Una ventana propuesta sin fila en `PERIODOS` no se puede correr.** `generarInforme` sólo acepta
  un `periodo_id` que exista en `PERIODOS`; **no hay camino para un par de fechas sueltas**. Al
  20/08 no existe fila para `14/08–20/08` (la más nueva es `julio_24_30`).
- **`ESCRITORES.md` dice que el seed es el único escritor de `PERIODOS`**, y es cierto **como
  declaración y falso como restricción**: `upsertPorClave_` reporta `soloEnHoja` y **nunca borra**,
  así que una fila escrita a mano sobrevive a *Aplicar configuración*. Eso es lo que evita el
  `clasp push` para dar de alta una semana — **lo corrige la Parte B del `_2`**, sin ejecutar.

## Lo demás que está escrito y sin correr

| qué | estado |
|---|---|
| `2026-08-16_5` — los `pauta_*` duplicados | escrito, sin ejecutar. Van a validación, no a migración: filtro vacío en los dos lados |
| `verificarEncabezadosDeMapeo()` | corrió **una vez** (dio el hallazgo 151/161) y **no se re-corrió después de arreglar el cuadre** |
| `R-26` Parte B | la Parte A cerró: la premisa se sostiene **como régimen**, no como invariante |

## Lo que sigue abierto en `PENDIENTES` y no se tocó

1. ⚠ **Ninguna hoja de registro fecha una escritura sobre `MARCADORES`.** La tanda 4 **estaba
   aplicada y no se sabe en qué corrida**. `CORRIDAS` no lo puede responder: registra generaciones
   de informe y es un **insumo, no un log** (`D-07`).
2. ⚠ **`tools/snapshot.js` fecha en UTC** y adelanta un día después de las 21:00 locales. Se
   corrige con `--fecha=AAAA-MM-DD`, pero **el default no avisa**.
3. ⚠ **Re-correr el snapshot el mismo día pisa la evidencia anterior.** Pasó con
   `MARCADORES_2026-08-17.tsv`: se recuperó de git, pero nada en el script advierte.
4. ⚠ **El separador decimal de `numero` es el punto de JS, no la coma de es-AR.** Preexistente
   desde el 05/08. `numero_revisar` da `-8.89-` y no `-8,89-`; la ilustración con coma ya entró
   **dos veces** en un prompt por el mismo camino. **No se arregla sin decisión del usuario** — es
   un cambio de formato en todo lo publicado.

## Lo que NO se tocó y sigue como estaba

- **Los `cc_*` publican su hueco por `_32.2`** — decidido, no se reabre. ⚠ Desde el 20/08 ese hueco
  ya no es `—`: es el símbolo que le corresponda a su estado.
- **`SECCIONES` se siembra como `CONFIG`** (sólo lo ausente) — decidido, en `PENDIENTES` sin
  arreglar.
- **`semanaR11_` y `diagEncuentrosPorSemana_`** — el `_2` no los cambia, y su control positivo de
  nueve afirmaciones tiene que seguir pasando tal cual.
- **La clave de cable `opciones.faltantes_como_raya`** conserva el nombre aunque ya no elija una
  raya: `generarInforme` es invocable por la API **por nombre**, así que es formato de cable.
