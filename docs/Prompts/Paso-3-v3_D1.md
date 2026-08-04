# `Paso-3-v3` — `D.1` a `D.4`: el corte vertical

**Estado:** vivo · **Fecha:** 2026-08-03 · **Ubicación:** `docs/Prompts/Paso-3-v3_D1.md`

> `D.0` corrió y reportó. Este prompt ejecuta el resto de la Parte D, más el hueco que `D.0`
> encontró en la Parte C, que ya está ejecutada y por eso lleva **addendum, no edición**.
>
> **Cuatro commits, en este orden.** Se para y se avisa al final de cada uno.

---

## Parte 0 — Verificación de premisas. Sólo lectura. Reportar y **PARAR**.

**0.1 · La ventana.** `CONFIG` quedó en `periodo_desde = 2026-07-24`,
`periodo_hasta = 2026-07-30`. Confirmar que `resolverVentana({})` devuelve esas dos fechas
con `origen: config`, y reportar cuántas filas de `rdv/RVD JM-CM - ES` caen dentro tras
`D-21`. El número anterior (13) era de la ventana vieja y no sirve de referencia.

**0.2 · El ancla del control.** `docs/VALIDACION_2026-07-31.md` tiene
`Orden Público 28/07` verificado dígito a dígito, con **inscriptos = 753**. Confirmar que
esa fecha cae dentro de la ventana y que el encuentro está en `rdv` con `status = Realizada`.
Reportar cuántos encuentros más hay en la ventana: si hay uno solo, la `SUMA` tiene que dar
753 exacto; si hay varios, tiene que dar 753 **o más**, y ese es el control.

**0.3 · Las tres filas de ejemplo.** Reportarlas una última vez, tal cual, antes de
retirarlas. Van al cuerpo del commit.

**0.4 · Los campos de `rdv` en `MAPEO`.** Confirmar contra la hoja viva —no contra el seed—
que están mapeados en `RVD JM-CM - ES`: `inscriptos`, `asistentes`, `insc_mail`, `insc_cc`,
`insc_ivr`, `insc_digital`, `insc_dif`. Reportar cualquiera que falte.

**0.5 · `looker/alcance`.** Confirmar que `looker` sigue con **una sola** solapa `fuente` en
`MAPEO`, que es lo que hace posible la inferencia, y que `alcance` está mapeado ahí.

**Reportar 0.1–0.5 y PARAR.**

---

## Parte A — Addendum 1 a la Parte C. Documentación.

La Parte C está ejecutada, así que **no se edita su texto**. Se le anexa un addendum fechado
`03/08/2026` al final de la sección, con este contenido:

> **`RATIO` y `PCT` no quedaron soportados.** `resolverMarcadores` hace **un solo**
> `buscarMapeo` con el `campo_logico` entero, así que un marcador declarado
> `asistentes/inscriptos` falla con "falta MAPEO". Verificado por API en `D.0.2`.
>
> El contrato de `ctx` de la Parte A exige `valoresNumerador` y `valoresDenominador` **ya
> resueltos**, y `opRATIO` lanza con un mensaje explícito si falta alguno — o sea que el
> hueco estaba señalizado en el módulo correcto, pero el despachador nunca lo llenó. El
> punto `C.0.5` de la verificación **pidió confirmar exactamente esto** y la confirmación no
> se tradujo en código.
>
> **Lo cierra `D.1`**, que es donde el corte vertical necesita un `PCT` para ejercitarlo.

Commit de documentación solo.

---

## Parte B — Retirar las tres filas de ejemplo de `MARCADORES`

Las tres usan el estilo una-función-por-marcador (`calcInscriptos`, `calcAlcance`,
`calcEnvios`), que el `v3` no soporta. Se retiran.

**Antes de borrarlas, dejar anotado en `docs/PENDIENTES_consistencia.md`** lo único que se
pierde con ellas: `informe_id = '*'` significa "vale para todos los informes" y
`resolverMarcadores` ya lo soporta. Dos de las tres lo usaban, y es la firma del cruce a
medio resolver del `Paso-2.13` Parte 3.

`MARCADORES` no tiene sembrador: se retiran de la hoja, no del seed. Decisión del usuario,
03/08/2026.

---

## Parte C — `RATIO` y `PCT` en el despachador

En `Generador.gs`: cuando la operación sea `RATIO` o `PCT`, partir `campo_logico` por `/`,
hacer **dos** `buscarMapeo` sobre la misma base y solapa, y armar `ctx.valoresNumerador` y
`ctx.valoresDenominador` desde las filas ya leídas — la misma lectura cacheada, no dos.

Lo que tiene que fallar con motivo propio, no con excepción:

- `campo_logico` sin `/`, o con más de uno;
- cualquiera de los dos lados sin mapeo;
- denominador cero → `opRATIO` ya devuelve `''` y lo dice en la traza; el despachador lo
  traduce a `sin_datos`, no a `error`.

La traza tiene que mostrar los dos campos y los dos totales. La aritmética no se toca:
sigue entera en `Marcadores.gs`.

Control positivo: un `PCT` cuyo denominador sea cero **no** puede salir `NaN` ni `0` en la
lámina.

---

## Parte D — El cableado del corte

Once tokens, todos con prefijo **`prueba_`**. El prefijo no es cosmético: `ecv_inscriptos`,
`ecv_asistentes` y `enc_alcance` son tokens **por encuentro** del diccionario de
`docs/TOKENS.md`, y acá se calculan **agregados sobre la ventana**. Cablearlos con el nombre
canónico plantaría un número plausible y equivocado bajo un nombre que después se usa en el
deck. Se retiran al cerrar la Parte D.

| marcador | base / solapa | campo_logico | operacion |
|---|---|---|---|
| `prueba_inscriptos` | `rdv` / `RVD JM-CM - ES` | `inscriptos` | `SUMA` |
| `prueba_asistentes` | `rdv` / `RVD JM-CM - ES` | `asistentes` | `SUMA` |
| `prueba_insc_mail` | `rdv` / `RVD JM-CM - ES` | `insc_mail` | `SUMA` |
| `prueba_insc_cc` | `rdv` / `RVD JM-CM - ES` | `insc_cc` | `SUMA` |
| `prueba_insc_ivr` | `rdv` / `RVD JM-CM - ES` | `insc_ivr` | `SUMA` |
| `prueba_insc_digital` | `rdv` / `RVD JM-CM - ES` | `insc_digital` | `SUMA` |
| `prueba_insc_dif` | `rdv` / `RVD JM-CM - ES` | `insc_dif` | `SUMA` |
| `prueba_encuentros` | `rdv` / `RVD JM-CM - ES` | `inscriptos` | `CONTEO` |
| `prueba_asistencia_pct` | `rdv` / `RVD JM-CM - ES` | `asistentes/inscriptos` | `PCT` |
| `prueba_alcance` | `looker` / **vacía** | `alcance` | `SUMA` |
| `prueba_fecha` | — | — | `TEXTO` |

`informe_id = jm` en las once. La solapa de `looker` va **vacía a propósito**: es el único
caso que ejercita la inferencia, que ninguna corrida exitosa probó todavía. `prueba_fecha`
lleva un literal en `valor_fijo` y existe sólo para que `TEXTO` quede ejercitado.

`poblacion` queda afuera: sumarla cuenta dos veces el mismo barrio si hay dos encuentros ahí.

---

## Parte E — El menú y la prueba

**Ítem nuevo:** "Calcular marcadores de prueba" → tabla con `marcador · valor ·
valor_formateado · estado · traza`. La traza dice de qué solapa salió el número —y si fue
inferida— y de qué eslabón salió la ventana.

**Renombrar el ítem existente** a "Calcular corte vertical (Paso 2.9E)", que lee una fila de
`rdv` cableada a mano y hace otra cosa.

**El control (`D.4`):** `prueba_inscriptos` contra los **753** de `Orden Público 28/07`
verificados en `docs/VALIDACION_2026-07-31.md`, con el criterio que haya fijado `0.2`.
Reportar el número que sale y si cierra. **Si no cierra, no ajustar nada**: reportar la
diferencia y parar. Un corte vertical que no cierra es información, no un error a tapar.

**Controles internos**, como en el `2.9E`: la suma de los cinco `insc_*` contra
`prueba_inscriptos`, y `prueba_asistentes < prueba_inscriptos`.

**La cadena de período (`D.3`):** las 35 filas de `SECCIONES` tienen `periodo_ref` vacío y
el vínculo marcador↔sección sigue sin resolver, así que el eslabón 3 **no se puede
ejercitar**. Reportarlo como no ejercitado. Sí ejercitar los otros: `CONFIG` cargado (es el
caso de esta corrida) y, con `CONFIG` vaciado en una prueba aislada, la semana de `R-11`
—reportar las dos fechas que devuelve.

---

## Qué NO hacer

- No editar el texto de la Parte C: lleva addendum.
- No usar nombres canónicos de `TOKENS.md` para los tokens de prueba.
- No cablear `digital` acá: va en `Pedido_ventana_m2_y_cableado_mail.md`.
- No ajustar ningún número para que el control cierre.
- No poner aritmética fuera de `Marcadores.gs`.
- Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
