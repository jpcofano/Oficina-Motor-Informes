# CENSO DE SOLAPAS — `DGPLES - Directa acumulado` · 2026-09-07

> **CONGELADO.** Evidencia fechada, uno nuevo por corrida de censo (`CLAUDE.md` §7). Nadie lo
> edita. Para saber qué hay hoy, se re-corre el instrumento.
>
> **Qué pregunta contesta:** qué solapas tiene la planilla nueva y qué forma tiene cada una. **No
> clasifica** —eso es del alta— y envejece como cualquier medición.

| | |
|---|---|
| **instrumento** | `censarBaseNuevaCallCenterIVR()` (`Auditoria.gs`), escrito por el `2026-09-07_1` |
| **fecha de la corrida** | **2026-09-07** |
| **`sheet_id`** | `1f8Jy9S09EjWhXo-RF6llXnk8alQCJxWSZAdnfp3WR60` |
| **nombre del archivo** | **`DGPLES - Directa acumulado`** |
| **solapas** | **38** |

---

## ⛔⛔ ESTE CENSO ESTÁ INCOMPLETO, Y ES SU DATO MÁS IMPORTANTE

**La corrida se hizo el 07/09 y su log quedó en la conversación de claude.ai. Al repo llegaron
sólo las cuatro líneas de la tabla de arriba.** Lo que falta se nombra acá y **no se completó de
memoria ni se copió del prompt que encargó la corrida**.

| lo que el censo produjo | acá |
|---|---|
| nombre del archivo | ✅ |
| cantidad de solapas (38) | ✅ |
| que las tres de interés existen | ✅ |
| **los 38 nombres de solapa, con `N filas × M columnas` cada una** | ⛔ **NO ESTÁN** |
| **encabezados celda por celda de `Call Center - Métricas`** | ⛔ **NO ESTÁN** |
| **encabezados celda por celda de `IVR`** — incluidos los seis con `\n` | ⛔ **NO ESTÁN** |
| **encabezados celda por celda de `M2 - Gráficos2`** | ⛔ **NO ESTÁN** |
| **conteos de filas con dato por columna** | ⛔ **NO ESTÁN** |

⛔ **Consecuencia operativa, y hay que decirla con todas las letras: un alta de `SOLAPAS` o de
`MAPEO` NO puede citar este documento todavía.** §7 dice que un censo existe *«porque un censo que
sólo vive en un reporte no se puede citar ni verificar»* — y hoy éste está en ese estado a medias.

⭐ **Lo que hay que hacer antes del alta, y es barato:** re-correr `censarBaseNuevaCallCenterIVR()`
y volcar el log entero acá. El instrumento ya está pusheado y no hay que escribir nada.

---

## Lo que sí quedó medido

### Las tres solapas de interés existen

`Call Center - Métricas` · `IVR` · `M2 - Gráficos2` — las tres presentes en la planilla.

⚠ La planilla trae además **`Mail`** y **`SMS`**, que **no** se dan de alta ahora (decisión del
usuario, 07/09/2026).

### ⭐ El nombre del archivo no se parece al contenido, y eso ya tiene precedente

El archivo se llama **`DGPLES - Directa acumulado`** y contiene las solapas de Call Center, IVR y
M2. ⚠ **Buscar esta base por su nombre no la encuentra**, que es exactamente el modo de falla que
`CLAUDE.md` §4 registra para `reuniones`: *`BASES.reuniones.nombre` es `Base reuniones - Digital -
Call Center` y el archivo se llama `DGPLES _ Seguimiento ECVs`*; esa base **estuvo tres días en
disco tratada como inexistente**.

⇒ **La firma de una base es su lista de solapas, nunca el nombre del archivo** — y esa lista es
justamente lo que a este censo le falta.

### Lo que este censo NO contesta

- ⛔ **Si `IVR` es la misma tabla que `digital/Directa IVR`.** El usuario declaró que ésta es
  **acumulado**, lo cual las separaría — pero eso es una declaración, no una medición.
- ⛔ **Si `Fecha` de `Call Center - Métricas` destraba `X-28`.** Que exista columna temporal propia
  es condición necesaria y no suficiente. *(Medido después: ver
  `docs/MEDICION_universo_call_center_2026-09-08.md`.)*
- ⛔ **Si `Remitente` reproduce el corte JM/GCBA.** Estaba declarado y sin medir al 07/09.
  *(Medido el 08/09: ver el `MEDICION_*` de arriba.)*
