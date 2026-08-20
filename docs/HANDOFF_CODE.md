# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-20, al cerrar el `2026-08-20_8` (anclaje en dos pasos)

## ⏸ Los cuatro botones que esperan, en orden

Todo lo demás está hecho y pusheado. **Estos escriben en hojas de registro o generan, así que los
corre el usuario.**

| # | qué correr | qué destraba |
|---|---|---|
| 1 | **Aplicar configuración** | siembra `agosto_14_20` en `PERIODOS` — sin esa fila **no se puede cargar el temario** de la semana que el motor propone (`D-19`) |
| 2 | ⭐ **`verificarCierreParaGenerar()`** | las dos migraciones del `_7`, **en el orden correcto y frenando si la primera falla** |
| 3 | **`preverSimbolosJM()`** y **`preverSimbolosSecco()`** | el conteo por símbolo esperado, **antes** de generar |
| 4 | **Generar** los dos decks | con los números del punto 3 a la vista |

⚠ **El punto 2 antes del 3**, y el 3 antes del 4. `preverSimbolos*` leído después de generar ya no
es un control: es una explicación.

## ⭐ `D-34` — lo que gobierna todo el cableado que falta

**Un número que existe y no está validado se publica ENTRE GUIONES. No se retiene.**

| en el deck | qué significa |
|---|---|
| `1.234` | hay número y está validado |
| **`-1.234-`** | hay número y **no** está validado |
| `/////` | falta el token: nadie lo cableó |
| `---` | hay fila y falló |
| `-` | se preguntó y no había dato |

⭐ **La frontera: desconfiar de un número no es lo mismo que inventar uno.** Se publica entre
guiones lo que el motor calculó y nadie validó; **no** se publica lo que no tiene fuente.

**Al 20/08 había 32 filas con `SIN VALIDAR` y sólo 3 con el sufijo** — 29 números salían con la
misma cara que los validados. Eso lo cierra el botón 2.

## Lo que las dos migraciones van a hacer, con el número escrito antes

| migración | filas | detalle |
|---|---|---|
| **Parte B** · `_revisar` | **29** | de las 32 con `SIN VALIDAR`; 3 ya lo llevaban (`frecuencia`, `gcba_frecuencia`, `camp_frecuencia`) |
| **Parte A** · las `*` | **49** | `enc_` 20 · `ecv_` 13 · `camp_` 9 · `m2_` 7 |

⚠ **`secco` tiene que pasar de 0 marcadores resueltos a 49.** Ése es el control que distingue *se
aplicó* de *no se aplicó*; el de `jm` idéntico daría verde en los dos casos.

⚠ **`enc_evento` es el único con `formato` vacío en el lote**, y ahí `_revisar` pelado **no
envuelve** (guarda `f.length > 8`, verificado corriendo el formateador). Lleva `texto_revisar`.

## El cruce `jm` / `secco`, medido y calibrado

Censos autoritativos del 20/08 a las 13:02 y 13:11. El instrumento **calibró**: la lectura
independiente por el conector coincidió 19 de 19 láminas.

| cruce | tokens |
|---|---|
| secco con fila `jm` → **las `*`** | **49** |
| ⭐ **sin fila en las DOS plantillas** | **56** — 44 son `camp_` |
| sólo secco | 62 — `emin_` 10 entre ellos |
| sólo jm | 203 — `gcba_` 19 entre ellos |

⭐ **Los 56 compartidos son el lote más rentable que queda:** cablear uno sirve para los dos
informes, y 44 son de una sola familia.

⚠ **`jm` y `secco` NO son «casi iguales» token por token**: 203 contra 62. La diferencia es de
**granularidad**, no de láminas — comunicaciones post es 4×8 en `jm` y 3×2 en `secco`. **Armonizar
es decidir si `secco` sube al detalle de `jm`**, y eso es `C-01`, del equipo.

## Lo que sigue abierto y no se toca

0. ⭐ **Los 10 días de la campaña de una reunión: decidido por el usuario, NO aplicado, y el motivo
   importa.** El `2026-08-20_8` implementó el anclaje en dos pasos —`R-12`/`T2.9.2` cerrados— pero
   la medición mostró que **ninguno de los dos recortes pierde el candidato**: `digital` es
   `snapshot` (universo sin recortar) y la cercanía es **±14 simétrica**, así que los 10 días ya
   entran. **El que lo pierde es el score**, que da `+0` más allá de 2 días con el umbral en 0,6.
   **Lo que falta decidir es el reparto de puntaje por fecha** — mueve qué cuenta se ancla a qué
   encuentro, así que es tuyo. Ver `R-12` Addendum 1 bis.

1. ⛔ **`m2_campanias` no se cablea.** Ninguna columna reproduce el `12` del deck, y la candidata
   **cambió de grano entre exports**: 11 valores de proyecto el 31/07, 18 de envío el 06/08, sobre
   las **mismas 25 filas** de una ventana cerrada. **Nada en el motor puede notarlo** — mismo
   nombre, misma letra, mismo encabezado. Lo destraba el equipo (`PENDIENTES`, 20/08).
2. ⛔ **`m2_envios` no cambia de operación.** Publica 25 donde el deck dice 26; entra al lote de
   `_revisar` y sigue. Moverlo hoy sería llevarlo a otro número que tampoco es el publicado.
3. ⚠ **El separador decimal de `numero` es el punto de JS**, no la coma de es-AR. Preexistente
   desde el 05/08; cambiarlo mueve el formato de todo lo publicado.
4. ⚠ **Los dos cargadores difieren en `mostrar`** — `REUNIONES` deja vacío, `CAMPANAS` pone `sí`.
   Reportado y sin unificar, por decisión.
5. ⚠ **Ninguna hoja de registro fecha una escritura sobre `MARCADORES`.** `CORRIDAS` es un insumo,
   no un log (`D-07`).

## Lo demás que está escrito y sin correr

| qué | estado |
|---|---|
| `2026-08-20_5` Parte C | `CUENTA_DISTINTOS` existe y anda; **la fila de `m2_campanias` no se escribe** por el punto 1 |
| `2026-08-20_4` | ⛔ **reemplazado por el `_7`** — no ejecutar |
| frente 13 bis — `DIMENSIONES_` a hoja | `2026-08-16_6`, ⚠ se revisa antes de correr: es del 16/08 |
| `2026-08-16_5` — los `pauta_*` duplicados | escrito, sin ejecutar |

## Controles vivos — los seis en verde

`probar-simbolos-faltante` (25) · `probar-semana-cerrada` (24) · `probar-cuenta-distintos` (22) ·
`probar-temario-reuniones` (14) · `probar-anclaje-dos-pasos` (21) · `probar-formato-revisar` · `listas`.
**Los cinco nuevos se corrieron también en rojo a propósito**, no sólo en verde.
