# TESTIGO — los caminos que arrancan una corrida · **ANTES** de `D-57` · 04/09/2026

> **Estado: congelado.** Evidencia fechada, tomada **antes** de implementar `D-57`.
> ⭐ **Es un testigo de CAMINOS, no de valores**, y a propósito: este cambio **no mueve ningún
> número**, así que un testigo de valores lo daría por bueno mire lo que mire.

---

## ⛔ Son CUATRO, no tres

El prompt `2026-09-04_4` decía *«se conocen tres y puede haber más»*. **Medido en `Panel.html`: son
cuatro.** El que faltaba es el botón desatendido de «Detalles», que existe desde el `2026-08-21_19`.

| # | pestaña · botón | función del front | backend | ¿`desatendida`? | pestaña que queda a la vista | ¿se refresca sola? |
|---|---|---|---|---|---|---|
| 1 | **Detalles** · `b-generar` «Generar informe» | `generar()` | `panel_generar` | ⛔ **NO — síncrono** | `generar` → `vistaEsperando` → `vistaListo` | ✅ n/a: el resultado llega en el callback |
| 2 | **Detalles** · `b-generar-des` «Generar y que siga sola» | `generarDesatendida()` | `panel_generarDesatendida` | ✅ sí | ⛔ **salta a `desatendida`** | ⛔ **NO** |
| 3 | **Asistente** · `asis-generar` «Generar informe» | `generarDesdeAsistente(false)` | `panel_asistenteGenerar(…, false)` | ⛔ **NO — síncrono** | `generar` → `vistaEsperando` → `vistaListo` | ✅ n/a |
| 4 | **Asistente** · `asis-generar-des` «Generar y que siga sola» | `generarDesdeAsistente(true)` | `panel_asistenteGenerar(…, true)` | ✅ sí | ⛔ **salta a `desatendida`** | ⛔ **NO** |

⭐ **Dos síncronos y dos desatendidos.** ⛔ **El camino 1 es el que el usuario usó el 03/09 y el que
cortó** (`secco-20260903-225938`).

### ⚠ Dos que el nombre hace parecer caminos y NO lo son

`panel_generarSemanaEnCurso()` y `panel_generarPeriodoPersonalizado()` **crean períodos**, no
corridas. **Se declaran acá para que el próximo censo no los cuente ni tenga que volver a
verificarlo.**

---

## El estado después de apretar, por camino

- **Síncronos (1 y 3):** `S.estado = 'generando'`, `S.tab = 'generar'`, cronómetro de 1 s, y al
  volver `S.estado = 'listo'` con `S.resultado = r` — **el objeto completo de `generarInforme`**.
- **Desatendidos (2 y 4):** `S.estado = 'form'`, **`S.tab = 'desatendida'`**, `S.desArranque = r`
  —**sólo el arranque**— y el resto se mira a mano en esa pestaña.

⛔ **Y esa pestaña lo dice ella misma, dos veces:** *«Esta pantalla no se actualiza sola»* y *«Esta
pantalla no se refresca sola»*.

---

## El ritmo del mecanismo desatendido (P4)

| | |
|---|---|
| tope de continuaciones | **6** (`CONFIG.tope_continuaciones`, defecto `TOPE_CONTINUACIONES_DEFECTO_ = 6`) |
| cada cuánto arranca la siguiente | **60 s** — `crearTriggerDeContinuacion_(60)`, en los dos llamadores |

⭐ **Consultar el estado más seguido que cada ~15 s no aporta nada**: el plan cambia como mucho una
vez por minuto. ⚠ Una pantalla que pregunta cada segundo por algo que cambia cada minuto **sólo
agrega ruido y llamadas**.
