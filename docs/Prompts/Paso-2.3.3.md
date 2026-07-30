# Paso 2.3.3 — Preselección de `DIAG_FECHAS` y guardarraíles del detector

> Va después del Paso 2.3.2. **Correr recién después de haber promovido las ocho
> elecciones de `docs/FECHAS_seleccion.md`**: la preselección se alimenta de `MAPEO`, así
> que con `MAPEO` vacío no tiene de dónde leer.
> **Trabajamos en español.** Un paso = un test verificado = un commit.

---

## Problema

`DIAG_FECHAS` se borra y reescribe en cada corrida, así que la columna `elegida` **no
guarda conocimiento**. Volver a correr la detección obliga a re-marcar a mano las ocho
filas, sobre un listado de ~70 que incluye copias de trabajo (`Copia de Para Revisar`,
`RVD JM-CM - ES Back Up`) y vistas con banner de período. En seis meses alguien apurado
marca una copia y el informe sale con datos viejos **sin fallar**.

**No se resuelve eligiendo por heurística.** Una columna elegida por regla no falla:
filtra otro conjunto de filas y salen números plausibles. La elección sigue siendo
humana; lo que hay que evitar es tener que repetirla.

La fuente de verdad de lo ya decidido es `MAPEO`. El detector tiene que releerla.

---

## A) Preselección desde `MAPEO`

Al escribir `DIAG_FECHAS`, marcar las filas que ya están decididas.

- Leer `MAPEO` **una vez** antes del loop e indexar por `(base_id, solapa)` las filas con
  `campo_logico = 'fecha_periodo'`.
- Columna nueva **`origen`** en `DIAG_FECHAS`, con tres estados:

| `elegida` | `origen` | significado |
|---|---|---|
| `sí` | `MAPEO` | ya decidido antes, se remarca solo |
| *(vacío)* | `REVISAR` | hay decisión para esa solapa, pero apunta a **otra columna** |
| *(vacío)* | *(vacío)* | sin decisión previa — elección humana |

- **`REVISAR` nunca se marca solo.** Es el caso que justifica todo esto: si `MAPEO` dice
  que la fecha de `Seguimiento digital` es la L y ahora la candidata es la M, alguien
  insertó una columna en la base. Hoy eso no lo detecta nadie.
- Si la columna decidida sigue en su letra pero **dejó de clasificar como `FECHA`**,
  también va a `REVISAR`. No re-marcar: eso es justamente lo que hay que mirar.
- Al terminar, reportar cuántas filas quedaron en cada estado.

Los dos helpers ya están escritos y son puros (no leen hojas, reciben los datos):
`decisionesFechaPrevias_()` y `preseleccionFilaDiag_()`. **Adaptar un punto:**
`preseleccionFilaDiag_` compara contra la **letra** de columna guardada en `MAPEO`. Si
`MAPEO` guarda el encabezado en vez de la letra, ajustar esa comparación y nada más.

## B) Lista de exclusión por (base, solapa)

Saltear solapas antes de escanearlas, y reportar cuántas se saltearon.

La bandera **no puede ir por fila en `DIAG_FECHAS`** — se borra igual. Y el motivo de
exclusión es de la **solapa**, no de la columna: es una copia de trabajo, o es una vista
con período escrito a mano.

Excluir (motivos en `docs/FECHAS_seleccion.md`):

- `rdv`: `Para Revisar`, `Copia de Para Revisar`, `Copia de Para Revisar 1`,
  `RVD JM-CM - ES Back Up`
- `digital`: `Buscador por periodo digital`, `Buscador por periodo directa`
- `m2`: las solapas con encabezado en fila 3 (banner de período)

**Criterio, para documentar:** *una solapa es fuente cruda si el encabezado está en la
fila 1 y no hay ningún período escrito a mano arriba de los datos.* Si el período vive en
la hoja, lo que devuelva depende de lo último que tipeó una persona — es el resultado del
proceso manual que el motor viene a reemplazar, no una fuente.

## C) Marcar fechas fuera de rango plausible

Señalar en `DIAG_FECHAS` las columnas con fechas anteriores a **2015** o posteriores al
**año actual + 2**. No excluirlas: marcarlas.

Agarra dos cosas reales con una sola regla: las columnas `HORA`, que Sheets guarda como
`1899-12-30` y hoy aparecen como candidatas `FECHA`; y el valor con año **`20206`** en
`digital/Directa Mail` col F, un tipeo en la base que invalida cualquier cálculo de rango.

## D) Documentación (a cargo de Code)

Actualizar `docs/` con lo que introduce este paso:

- La columna `origen` de `DIAG_FECHAS` y sus tres estados.
- La lista de exclusión: dónde vive y cómo se agrega una solapa.
- El criterio de fuente cruda del punto B, como regla del proyecto.
- El rango plausible del punto C y por qué está en 2015 / año+2.
- Referencia cruzada a `docs/FECHAS_seleccion.md` (selección congelada del 30/07/2026) y
  a `docs/RDV_otros_ministros_riesgo.md`.

---

## Fuera de alcance

**Firma de encabezados** para bases ajenas (registrar la fila de encabezados y fallar si
cambió). Es necesaria para `RDV_otros_ministros`, que se mapea por letra de columna sobre
una base de terceros, pero es un mecanismo aparte con su propio test. Ver
`docs/RDV_otros_ministros_riesgo.md`.

---

## Test de verificación

1. Correr la detección. Las ocho filas de `docs/FECHAS_seleccion.md` salen con
   `elegida=sí` / `origen=MAPEO`. **No hay que marcar nada a mano.**
2. `DIAG_FECHAS` ya no lista las solapas excluidas, y el reporte dice cuántas salteó.
3. Las columnas `HORA` aparecen marcadas por rango implausible.
4. `digital/Directa Mail` col F: si el `20206` todavía no se corrigió en la base, tiene
   que salir marcada. Si ya se corrigió, no.
5. **Simular un cambio de estructura:** insertar una columna antes de la fecha en una
   solapa de prueba, correr la detección → esa fila sale `origen=REVISAR` y **sin**
   `elegida`. Deshacer.
6. `promoverFechasElegidas()` sobre el resultado del paso 1 no cambia nada en `MAPEO`
   (idempotente).
