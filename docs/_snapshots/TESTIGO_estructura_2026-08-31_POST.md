# TESTIGO DE ESTRUCTURA — toma **DESPUÉS** · 31/08/2026, 11:41:21 (UTC 14:41)

> **Estado: congelado.** Evidencia fechada. Es la toma POST del `2026-08-31_3` (la sección de
> campaña destacada salía dos veces). Su par es `TESTIGO_estructura_2026-08-31_PRE.md`.
>
> **Mismo instrumento, misma sesión, mismas condiciones declaradas:** `testigoDeEstructura()`, con
> las dos cachés de `generarInforme` y las láminas contadas con `laminaEntraParaItem_`.

---

## El diff, sección por sección

| | | ANTES (11:14) | DESPUÉS (11:41) |
|---|---|---|---|
| `jm` | `campana` · ítems | ⛔ **2**, clave repetida | ✅ **1** |
| | `campana` · `periodo_id` | ⛔ *(no devuelve el campo)* | ✅ **`2026_agosto_21_28`** |
| | `campana` · láminas | 18 | ✅ **9** |
| | `encuentro` · ítems | 1 (`Coghlan`) | ✅ **1**, idéntico |
| | `encuentro` · excluidos | 11 | ✅ **11**, idénticos |
| | **TOTAL** | 20 | ✅ **11** |
| `secco` | `campana` · ítems | ⛔ **2** | ✅ **1** |
| | `encuentro` · ítems | 1 | ✅ **1**, idéntico |
| | **TOTAL** | 18 | ✅ **10** |

**La clave repetida desapareció de los dos informes.** Y la fila que sale, sale nombrada:

```
· excluido 3512-AGOSEGGJ — periodo_id "2026_agosto_21_27" no está en
  [2026_agosto_21_28] (D-53: es otra versión del informe)
```

⭐ **Nada desapareció en silencio** (`D-21`): la versión que no corresponde a esta corrida está en
`excluidos`, con su motivo y citando la decisión que la excluye.

---

## ⭐⭐ Lo que había que mirar PRIMERO, y salió bien

**El riesgo de este cambio no era `campana`: era `encuentro`.** La Parte B unificó el cálculo del
período en `periodosDeLaCorrida_` y **`leerReuniones_` pasó a usarlo**, o sea que se tocó código de
la rama que ya funcionaba.

✅ **Los 11 excluidos de `encuentro` son idénticos entre las dos tomas** —mismo orden, mismos
motivos, mismos `periodo_id`— en **los dos informes**. La rama `REUNIONES` no se movió.

⚠ **Un deck más corto no es un éxito mayor**, y por eso este control va antes que el conteo: si
`encuentro` hubiera perdido su ítem, el total también habría bajado y se habría leído como que el
arreglo funcionó de más.

---

## ⚠ Un hallazgo del diff, anotado y NO arreglado

**La misma situación se reporta citando dos decisiones distintas.** Coghlan bajo la versión `_27`
queda afuera en las dos secciones, pero:

| sección | mensaje |
|---|---|
| `campana` | `… (D-53: es otra versión del informe)` ✅ |
| `encuentro` | `… (D-19)` ⛔ |

**`D-19` cubre el `periodo_id` VACÍO**, y acá el `periodo_id` no está vacío: está cargado y es de
otra versión. `leerReuniones_` arma el mismo texto para los dos casos —`(suyo ? '"'+suyo+'"' :
'vacío')`— y cita `D-19` en los dos. **Es una cita incorrecta preexistente**, que hasta hoy no
tenía con qué contrastarse y ahora quedó al lado de la correcta.

⛔ **No se toca en este prompt, y el motivo es concreto y no de prolijidad:** cambiar ese texto
**mueve los 11 excluidos de `encuentro`**, que son justamente la evidencia de que la rama
`REUNIONES` no se movió. **Arreglarlo ahora destruiría el control que prueba que el cambio fue
seguro.** Va a `PENDIENTES`.

---

## Lo que esta toma NO contesta

- **El conteo real de láminas del deck.** El testigo predice la expansión; la corrida es otra cosa.
  Con `jm` en 11 láminas repetibles contra 20 antes, la predicción es **9 láminas menos**.
- Si los **valores** de las láminas que quedan son los mismos. **Deberían serlo** — esto no toca
  ningún marcador— y se verifica en la corrida.
- Si `secco` genera su deck completo.
