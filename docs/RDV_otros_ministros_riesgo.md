# RDV_otros_ministros — encabezados no confiables (+ riesgo generalizado, DOC-3)

> Hallazgo original: 30/07/2026 (recuperado — se había redactado esta sesión pero no
> se había copiado al repo). Generalizado a las cuatro bases en DOC-3, misma fecha.
> Referenciado desde `docs/FECHAS_seleccion.md`, `docs/REGLAS_NEGOCIO.md` (R-02, R-04)
> y `docs/Prompts/DOC-3_verificacion_bases_vivas.md` Parte G.
>
> **Estado:** el riesgo está documentado y el mecanismo de firma **todavía no está
> implementado** — es su propio paso, con su propio test (ver "Qué falta" al final).

---

## Qué pasa

La fila de encabezados de la solapa `RDV_otros_ministros` (base `rdv`, encuentros de
ministros, usada como respaldo de la ancla `RVD JM-CM - ES`) **no corresponde a los
datos**. Detectado a partir de `DIAG_FECHAS`: la columna E, etiquetada
`hora_cita_evento`, contiene fechas; la F, etiquetada `direccion_evento`, contiene
horas.

Confirmado contra la disposición real de la solapa:

| col | encabezado escrito | dato real |
|---|---|---|
| A | `funcionario_principal_evento` | `funcionario_principal_evento` ✓ |
| B | `barrio_evento` | `barrio_evento` ✓ |
| C | `dia_evento` | `Tipo` |
| D | `fecha_inicio_evento` | `dia_evento` |
| E | `hora_cita_evento` | **`fecha_inicio_evento`** — la fecha del evento |
| F | `direccion_evento` | `hora_cita_evento` |
| G | `Inscriptos` | `direccion_evento` |
| H | `Asistentes` | `estado_evento` |
| I | *(vacío)* | `Inscriptos` |
| J | `estado_evento` | `Asistentes` |

**No es un corrimiento uniforme.** De C a F hay desplazamiento de una posición; de G a J
hay reordenamiento. No se puede compensar con una regla del tipo "correr todo una
columna": hay que mapear posición por posición.

**El riesgo mayor está en G–J.** `Inscriptos` y `Asistentes` son los dos números que van
al informe, y el dato real de cada uno está **dos posiciones a la derecha** de su
etiqueta (`Inscriptos` real en **I**, no en **G**; `Asistentes` real en **J**, no en
**H**) — el tipo de corrimiento que un vistazo rápido a la hoja no detecta, y que un
mapeo por nombre de encabezado lee de la columna equivocada sin fallar.

**También usa otro vocabulario de estado** que la hoja ancla: `Realizada`/`Programado`,
no `en agenda`/`Suspendida` (`RVD JM-CM - ES`) — a tener en cuenta si algún cálculo
filtra por texto de estado en vez de por columna.

## Decisión

**La base no es nuestra y no se puede corregir en origen.** Se mapea **por letra de
columna**, no por nombre.

`fecha_periodo` de esta solapa = **columna E**, que es `fecha_inicio_evento` pese a lo
que dice el encabezado (ver también `docs/FECHAS_seleccion.md`, "⚠ encabezados
corridos").

## Guardarraíl obligatorio: firma de encabezados

Mapear por letra sobre una base ajena es seguro hasta que el dueño inserte una columna.
Ese día el mapeo **sigue funcionando** y devuelve la columna de al lado, en silencio.

Por eso:

- Registrar la fila de encabezados tal como está hoy, para esta solapa.
- Al leer, comparar con la fila actual. **Si cambió, fallar y frenar.** No re-mapear, no
  adivinar, no intentar recuperar el orden: avisar y que alguien mire.
- Es la única defensa disponible sobre datos que no controlamos.

Además, en `MAPEO` la resolución por letra tiene que estar **explícita**, con el motivo
anotado (`encabezados corridos, base de terceros, no editable`). Si no, el próximo que
lea `MAPEO` va a pensar que es un error de tipeo y lo va a "arreglar".

## Riesgo asumido

Una columna insertada por el dueño invalida el mapeo. **La firma lo detecta; no lo
previene.**

## Pendiente

Averiguar quién es el dueño de la base y avisarle que hay un proceso leyendo esta
solapa. No para que la corrija, sino para que si un día cambia la estructura, lo
comunique. Es la diferencia entre enterarse por un informe raro y enterarse por un
mensaje.

---

## Generalización (DOC-3, 30/07/2026): no es un caso especial

`MAPEO` referencia cada columna **por letra**, no por nombre de encabezado, en las
cuatro bases — no solo en esta solapa. La verificación de bases vivas del 30/07 mostró
que **ninguna base es propia**:

| base | dueño (metadata de Drive, 30/07) | ¿mapeada por letra? |
|---|---|---|
| `rdv` | ajeno — sin confirmar cuál exactamente | sí |
| `digital` (Seguimiento Digital) | ajeno — sin confirmar cuál exactamente | sí |
| `looker` | `dgples.comunicacion@gmail.com` | sí |
| `m2` | `tarnowski.jp@gmail.com` | sí |

El mismo riesgo — el dueño inserta o borra una columna, el mapeo sigue leyendo sin
fallar, devuelve la de al lado — **aplica a todo el motor**. `RDV_otros_ministros`
queda como el **caso peor documentado** (dos columnas numéricas a dos posiciones de su
etiqueta, con reordenamiento y no solo corrimiento), no como el único caso.

## Qué falta (fuera de alcance de este documento)

**La firma de encabezados** — registrar la fila de encabezado de cada solapa mapeada, y
fallar ruidosamente si cambió — es la mitigación general, pero **no se implementa acá**.
Es su propio paso, con su propio test, antes del `Paso-3-v2` (ver `PROYECTO.md` §7).

`diagnosticarBases()` (`Fechas.gs`, DOC-3 Parte B) ya lee la fila de encabezado de cada
solapa mapeada para tipar columnas — la mitad del trabajo de la firma (leer esa fila)
queda hecha ahí; falta la otra mitad: guardar la firma y comparar contra la corrida
anterior.
