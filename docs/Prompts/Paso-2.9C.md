# Paso 2.9C — Higiene de registros

> Correcciones acumuladas en `SOLAPAS`, `MAPEO`, `BASES` y docs. Ninguna cambia lógica
> del motor: todas corrigen **qué se lee** y **qué está documentado**.
> Trabajamos en español.

## C.1 — Revertir `looker` a `resumen_metricas_dinamico`

El commit `eac337f` dejó `looker` apuntando a `resumen_metricas`, con el criterio
"fórmulas = derivada, valores = fuente". Ese criterio vale cuando una hoja sale de la
otra. **Acá no.** La fórmula real es:

```
=QUERY(Cuentas!A2:G; "SELECT * WHERE Col1 is not null AND Col7 <> 'Pendiente'"; 0)
```

`_dinamico` **deriva de `Cuentas`, no de `resumen_metricas`**. Es una consulta viva que
crece. `resumen_metricas` son valores pegados a mano: una foto.

Evidencia: `resumen_metricas` devolvió **899 de 903 filas sin fecha**, y por eso `looker`
dio 0 filas en ventana.

**Antes de revertir, chequeo de 30 segundos:** fecha máxima de la columna C en cada
solapa. Si `_dinamico` llega a julio 2026 y `resumen_metricas` se corta antes, confirmado.
Reportá las dos fechas.

Luego:
- `looker/resumen_metricas_dinamico` → `uso = fuente`
- `looker/resumen_metricas` → `uso = derivada`
- Mover los mapeos de `MAPEO` de vuelta a `_dinamico`
- Corregir `SEED_BASES_`, `SEED_MAPEO_` y `SEED_SOLAPAS_` — hoy un `instalar()` limpio
  **reproduce el error**

## C.2 — Verificar la grafía `RVD` vs `RDV`

`SOLAPAS` registra la solapa default de `rdv` como **`RVD JM-CM - ES`** (con RVD).
La misma planilla tiene `RDV CONJUNTO`, `RDV_otros_ministros`, `RDV_JM_CM_ES` con RDV.

Todas las filas de `SOLAPAS` tienen `origen=manual`, o sea que los nombres se tipearon.
**Verificá contra el nombre real del tab** y corregí `SOLAPAS` si no coincide. Si no
coincide, `openBase` falla.

Hacé lo mismo para todas las solapas con `uso=fuente`: que el nombre registrado exista.
Reportá las que no.

## C.3 — Borrar la fila `digital/Digital/alcance` de `MAPEO`

Apuntaba a la columna E, que es `Fecha de inicio`, no alcance. `digital/Alcance/alc_alcance`
ya cubre alcance. La migración borró el valor pero **dejó la fila**. Terminar de borrarla.

## C.4 — Corregir el registro del conjunto de control

`digital/RDV JM 2 VECES` **es texto pegado, no sirve como conjunto de control.**

- En `SOLAPAS`, reemplazar la nota actual (que dice "usar para validar el scoring/umbral
  0.6") por: `texto pegado — no es fuente ni control. No usar.`
- **`docs/DISENO_match_temario.md` §9** se apoya en esa solapa. Leé esa sección y
  marcala como inválida, explicando por qué. No la borres: dejá el registro de que se
  descartó y el motivo.

## C.5 — Reclasificar las solapas de `m2`

`SOLAPAS` hoy tiene una contradicción:

| solapa | uso | filas |
|---|---|---|
| `M2 Directa` | fuente | **26** |
| `M2 digital` | fuente | **67** |
| `M2 periodo DIRECTA` | derivada | **29.533** |
| `M2 periodo DIGITAL` | derivada | **2.413** |

**Una vista filtrada no puede tener mil veces más filas que su origen.** Y las notas de
`M2 Directa` / `M2 digital` dicen "acumulados", que es un agregado, no un detalle.

La clasificación parece estar invertida: las `periodo` serían el detalle y las otras el
resumen. Es la misma inversión que tuvo `looker`.

**No decidas solo.** Verificá: ¿`M2 periodo DIRECTA` tiene fórmula? ¿de dónde lee?
Reportá qué encontraste y dejá las cuatro filas en `uso=revisar` con la nota
`clasificación invertida, pendiente de confirmar`.

## Restricciones

- Toda la aritmética vive sólo en `Marcadores.gs`.
- Nada hardcodeado.
- Las migraciones dentro de `instalar()` se están acumulando. Si agregás una acá,
  **numerala y dejá registro de que corrió** — `instalar()` tiene que seguir siendo
  "crear y reparar hojas".

## Test de aceptación

- Correr `instalar()` **dos veces**. `looker` queda en `_dinamico` las dos veces.
- Ninguna solapa con `uso=fuente` tiene un nombre que no exista en su planilla.
- La fila `digital/Digital/alcance` ya no está en `MAPEO`.
- Pendiente de DOC-2, aprovechando la doble corrida: confirmar que `MARCADORES` ya no
  tiene la columna `calculo`.

## Commit

Uno por sub-paso, no todo junto:
- `fix: revert de looker a resumen_metricas_dinamico (eac337f)`
- `fix: verificación de nombres de solapa contra tabs reales`
- `chore: borrar fila digital/Digital/alcance de MAPEO`
- `docs: descartar RDV JM 2 VECES como conjunto de control`
- `chore: marcar solapas m2 como revisar por clasificación invertida`
