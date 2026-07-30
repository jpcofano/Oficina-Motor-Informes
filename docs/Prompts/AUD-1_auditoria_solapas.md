# AUD-1 — Auditoría de solapas, `sheet_id` y origen de los nombres

> **Qué es:** una auditoría **de solo lectura**. No corrige nada, no toca `MAPEO`, no
> toca `BASES`, no modifica `Union.gs`. Produce un reporte.
>
> **Motivo:** `DIAG_BASES` del 30/07 devolvió, para las cuatro bases, listas de solapas
> que **no contienen** varios de los nombres que el motor tiene cableados y que
> `docs/FECHAS_seleccion.md` congeló. Antes de corregir hay que saber **de qué archivo
> salió cada nombre**.
>
> **Prohibido en este prompt:** escribir en la planilla de control, renombrar solapas,
> "arreglar" un nombre que parezca obvio, o correr `promoverFechasElegidas()`.
> **Trabajamos en español.**

---

## La contradicción a explicar

`DIAG_BASES` listó las solapas reales de cada base. Contra eso:

| nombre usado por el motor | dónde está cableado | ¿aparece en `DIAG_BASES`? |
|---|---|---|
| `Seguimiento digital` (base `digital`) | `Union.gs`, `FECHAS_seleccion.md` | **no** en `digital` — **sí** en `m2` |
| `Directa Mail` / `Directa IVR` / `Directa SMS` (base `digital`) | `Union.gs`, `FECHAS_seleccion.md` | **no** — `m2` tiene `Directa mail` (minúscula) |
| `Alcance` (base `digital`) | `Union.gs` | **no** en `digital` — **sí** en `m2` |
| `resumen_metricas_dinamico` (base `looker`) | `DIAG_FECHAS`, metadata de Drive | **no** — `DIAG_BASES` vio `resumen_metricas` |
| `RDV_otros_ministros` (base `rdv`) | `FECHAS_seleccion.md`, doc de riesgo | **no** — hay `Funcionarios / Ministros` |
| `M2 periodo DIGITAL` (base `m2`) | `FECHAS_seleccion.md` | **no** — hay `M2 digital` |

Tres bases, seis nombres que no existen donde el motor los busca. **Eso ya no es un typo
suelto.** Las hipótesis a discriminar son:

- **H1 — archivos cruzados.** El `sheet_id` de `digital` y el de `m2` están
  intercambiados en `BASES`, o apuntan a archivos distintos de los que se inspeccionaron.
- **H2 — `.xlsx` vs. nativo.** Los nombres se tomaron de exportaciones `.xlsx` y las
  planillas nativas tienen otros nombres de solapa.
- **H3 — el archivo cambió.** Los nombres eran correctos y alguien renombró o
  reorganizó solapas después.
- **H4 — `BASES` vivo ≠ `SEED_BASES_`.** La hoja `BASES` de la planilla de control tiene
  `sheet_id` distintos de los del seed en `Instalar.gs`.

**No asumas ninguna. El reporte tiene que dejar una en pie con evidencia.**

---

## Tarea 1 — De qué archivo salió cada lista

`DIAG_BASES` reporta nombres de solapa **sin decir de qué archivo**. Ese es el dato que
falta y sin él no se puede cerrar nada.

Extendé el diagnóstico (o hacé una variante `auditarBases()`) para que cada fila incluya:

- `base_id`
- **`sheet_id` efectivamente usado** (el que leyó de `BASES`, no el del seed)
- **`getName()` del archivo abierto** — el título en Drive
- `solapa`
- `hoja_default` de esa base y si existe entre las solapas

Correlo y pegá la salida completa.

## Tarea 2 — `BASES` vivo contra `SEED_BASES_`

Comparar, base por base, el `sheet_id` que tiene la hoja `BASES` de la planilla de
control contra el que declara `SEED_BASES_` en `Instalar.gs`. Reportar toda diferencia.

Referencia de dos IDs verificados el 30/07 contra Drive, con su título real:

| `sheet_id` | título en Drive | dueño |
|---|---|---|
| `1t6Ji4Cd5lTeBEBBVIoIJUOWjvsOzWBDZmKN163rHKaQ` | **Base Looker** | `dgples.comunicacion@gmail.com` |
| `1_GS01-TXrhez0GlpFf4bUjWLNQPfaW9BOFFXz0hZNvY` | **M2 Reporte para Fede 2026** | `tarnowski.jp@gmail.com` |

En esa inspección, la **primera solapa** de `Base Looker` era `resumen_metricas_dinamico`
y la de `M2 Reporte para Fede 2026` era `Cuentas`. `DIAG_BASES` no vio
`resumen_metricas_dinamico` en ningún lado. **Si el `sheet_id` de `looker` en `BASES`
coincide con el de arriba, entonces las dos lecturas se contradicen sobre el mismo
archivo y hay que explicarlo** — puede ser una solapa oculta, un renombre reciente, o que
el listado no recorra todas.

## Tarea 3 — De dónde saca `Union.gs` los nombres

```bash
grep -n "Seguimiento digital\|Directa\|Alcance\|getSheetByName" Union.gs
```

Contestar:

1. ¿Los seis nombres están **literales en el código**, o salen de `MAPEO`?
2. Cuando `getSheetByName(nombre)` devuelve `null`, ¿qué hace? **Buscar el camino
   exacto** — si sigue de largo con un `if (!hoja) return []` o equivalente, entonces la
   corrida del 2.4 unió **una sola** de las seis solapas y el resultado no significa nada.
3. ¿La comparación de nombres es sensible a mayúsculas y a espacios? `Directa Mail` vs.
   `Directa mail` es una diferencia real en la lista viva.

## Tarea 4 — Las ocho fechas congeladas contra la realidad

Por cada una de las 8 filas de `docs/FECHAS_seleccion.md`, decir si el par
`(base_id, solapa)` **existe** en la salida de la Tarea 1. Tabla de tres columnas:
fila congelada / ¿existe? / candidato de nombre parecido en la misma base, si lo hay.

**No promuevas ni corrijas nada.** Es un inventario.

## Tarea 5 — Las solapas que aparecieron y no estaban en el radar

Tres hallazgos del listado que pueden cambiar el diseño. Solo **describir el encabezado
(fila 1) y el conteo de filas** de cada una, sin mapear nada:

1. `digital` / **`RDV JM 2 VECES`** — posible respuesta a la pregunta abierta de si un
   encuentro con dos Figuras entra como dos filas (¿hace falta una R-03?).
2. `looker` / **`MAIL`, `IVR`, `SMS`, `CC`, `DIGITAL`, `ALCANCE`, `Desglose Alcance`,
   `Audiencias`** — si el desglose por canal ya vive dentro de Looker, parte de lo que
   `unirDigitalPorCuenta` arma uniendo seis hojas **puede venir ya unido**. Decir si
   tienen `id_cuentas` o equivalente en la fila 1.
3. `m2` / **`Cuentas M2`** vs. `Cuentas` — dos tablas de cuentas en el mismo archivo.

## Tarea 6 — Tipos

`DIAG_BASES` tenía una segunda salida (tipo de cada columna mapeada). Pegala. Interesan
especialmente las columnas de `looker` que un marcador va a sumar
(`digital_impresiones`, `mails_*`): si salen `texto`, `SUMA` devuelve `0` sin fallar.

---

## Formato del reporte

Un archivo `docs/AUD-1_solapas.md`, con:

1. **Veredicto sobre H1–H4**, con la evidencia que lo sostiene. Si ninguna alcanza, decir
   qué falta para decidir.
2. Salida completa de la Tarea 1.
3. Diferencias `BASES` vivo vs. seed.
4. Respuesta a las tres preguntas de la Tarea 3, **con la línea de código exacta** del
   comportamiento ante `null`.
5. Tabla de la Tarea 4.
6. Hallazgos de las Tareas 5 y 6.
7. **Lista de lo que quedó bloqueado hasta resolver esto** — como mínimo: DOC-3 Parte A,
   `promoverFechasElegidas()`, y la validez de la corrida del Paso 2.4.

→ **Commit único:** `AUD-1 ✅ — auditoría de solapas y sheet_id (sin correcciones)`

---

## Recordatorio

El motivo por el que esto se audita en vez de corregirse a ojo es el principio que viene
gobernando el proyecto: **el modo de falla caro no es el que rompe, es el que devuelve un
número plausible.** Una solapa que no existe leída con `getSheetByName` no lanza error:
devuelve `null`, y río abajo eso es un informe entero que parece bien. Un nombre
"corregido" por parecido es la misma clase de error, con más confianza encima.
