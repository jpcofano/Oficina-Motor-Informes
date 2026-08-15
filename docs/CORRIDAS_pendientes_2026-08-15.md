# Corridas de Apps Script pendientes — mañana del 15/08/2026

> **Lo dejó la corrida nocturna del `2026-08-14_7`, bloque 4.** Es la lista única: todo lo que
> necesita la planilla y quedó esperando, en un solo lugar.
>
> **Ordenada por lo que destraba**, no por cómo aparecieron. Se corren desde el editor de Apps
> Script: elegir la función en el desplegable de arriba y **Ejecutar**; el resultado sale en
> **Registro de ejecución**. `clasp logs` no anda — el proyecto no tiene GCP propio.
>
> **Los nombres de acá son los que aparecen en el desplegable.** Ninguno termina en `_`: Apps
> Script no lista las privadas, así que lo que hay que elegir es el **wrapper público**
> (`CLAUDE.md` §2).
>
> **Todo lo de acá está pusheado.** Nada quedó sin subir.

---

## 0 · Menú → **Aplicar configuración** — va primero, y puede frenar todo lo demás

⚠ **NO es `instalar()`.** Corregido el 15/08 después de que `instalar()` corriera y **el alta de
las 20 solapas no llegara a la planilla**. `instalar()` → `aplicarInstalacion_()`, que **crea y
repara hojas y aplica los `COLUMNAS_DELTA_`** — y nada más. **No siembra contenido.**

**Lo que hay que correr es el ítem de menú `Aplicar configuración`** (`menuAplicarConfiguracion_`),
que corre los cuatro sembradores **en el único orden en que tiene sentido correrlos**:

```
aplicarInstalacion_()          ← esto es lo que hace instalar() por su cuenta
aplicarSeedConfiguracion_()    ← BASES, MAPEO, INFORMES, PERIODOS  → los testigos de D-31
aplicarClasificacionSolapas_() ← SOLAPAS                          → el alta de las 20
sembrarSecciones_()
```

**Correr sólo `instalar()` deja las dos cosas a medias**, y de un modo que no se nota: la columna
`encabezado` de `MAPEO` **existe pero está vacía** —los valores vienen de `SEED_MAPEO_`, que
siembra el segundo— y `SOLAPAS` no recibe ninguna fila nueva.

⚠ **Es la primera vez que un `COLUMNAS_DELTA_` toca `MAPEO`.** La columna entra después de
`columna` y empuja `tipo_esperado`, `valores_incluidos` y `notas` una a la derecha. Por diseño
**no** reescribe la fila 1 ni corre los datos — pero eso es lo que dice el mecanismo, no lo que
está medido sobre esta hoja.

**⛔ Si el diff muestra algo inesperado, parar y reportar antes de correr nada más.** No seguir
con las otras: todas leen `SOLAPAS` o `MAPEO`, y sobre una hoja en estado dudoso sus resultados
no significan nada.

**Qué queda escrito después.** Las **24** filas de `reuniones` con su `uso` y su nota, y las 154
filas de `MAPEO` con su testigo.

**Cómo se verifica que funcionó**, en vez de confiar en que la corrida terminó bien:
`verDiffDeSolapas()` tiene que pasar de **`20 en el seed y no en la hoja`** a **cero**.

**¿Decide el usuario?** No, salvo que el diff sorprenda — y ahí decide todo.

---

## ~~1 · `censarCoberturaDeUniversos()` y `censarSolapasSinRegistrarEnProfundidad()`~~ — **corridas el 15/08**

**Ya no hay que correrlas.** Sus resultados están en
`docs/CENSO_solapas_reuniones_2026-08-14.md`, addenda 1 y 2, y **el alta ya está escrita en
`SEED_SOLAPAS_`**: 4 `referencia` + 16 `ignorar`.

Queda acá porque la lista se lee de arriba abajo y conviene saber que este paso pasó — y
porque lo que encontró cambia el resto: **las 20 solapas son espejos `IMPORTRANGE`** de una
planilla que **no está en `BASES`**. Eso es un pendiente propio, no una corrida.

**Lo único que falta de este frente es aplicarlo, y eso lo hace la corrida 0.**

---

## 2 · `verificarGateDeUso()` — verifica `D-32`

**Qué destraba.** El `_3` quedó implementado anoche (`D-32`: el sembrador **nunca pisa un `uso`
existente**) **y sin probar**. Es un cambio en un escritor de hojas de registro: hasta que se
verifique, no se puede confiar en él ni construir encima.

**Un solo botón, y adentro corre las dos en orden.** La pura primero — si falla, **no corre la de punta a punta**, porque sobre un cálculo roto su resultado no significa nada. La segunda es de punta a punta y **sólo lectura**.

> La pura también entró al runner `correrPruebasDiff_` (menú *Diagnóstico → Correr pruebas del diff*), porque cumple su contrato de no tocar la hoja. La de punta a punta **no** va ahí.

**Qué queda escrito después.** La entrada de bitácora que cierra el `_3`. Si pasan, el frente 2
del plan queda hecho.

**¿Decide el usuario?** No para correrla. **Sí** si la parte de punta a punta se **abstiene**
—lo hace cuando no encuentra ninguna fila con `fuente` en la hoja y otra cosa en el seed—: ahí
hay que decidir si se fuerza el caso poniendo una solapa en `fuente` contra un seed que diga
`ignorar`. **Una abstención no es un verde**, y está escrito así a propósito.

---

## 3 · `verDiffDeSolapas()` — la foto de qué desacuerda hoy

**Qué destraba.** Nada por sí sola, y por eso va acá abajo: es **diagnóstico**. Muestra toda fila
donde el seed y la hoja difieren, con las degradaciones de `uso` marcadas aparte.

**Para qué sirve igual.** Es la línea de base de `D-32`: dice **cuántos desacuerdos hay hoy** —y
por lo tanto cuántos venían pisándose en silencio en cada siembra. Y `verificarGateDeUso()`
la usa por dentro, así que correrla antes explica lo que la prueba va a decir.

**¿Decide el usuario?** Sí, pero sin apuro: cada desacuerdo es un lado que hay que corregir —el
seed o la hoja— y ésa es una decisión por fila.

---

## 4 · El censo de `MARCADORES` — desbloquea el `_2`, que es el frente 4 del plan

**Qué destraba.** Los **puntos 1, 2 y 3 de la Parte A del `_2`**: los duplicados por definición,
el inventario de `filtro` y la agrupación por dimensión lógica. El bloque 2 de la corrida
nocturna **no pudo hacerlos**, y no por falta de tiempo: **`SEED_MARCADORES_` no existe y no va a
existir** — `Instalar.gs:2715` dice *"`MARCADORES` no tiene sembrador y no lo va a tener
(`D-17`): su dueño es la plantilla"*. `MARCADORES` vive **sólo en la hoja**.

⚠ **No hay función escrita para esto todavía**, y es la única de la lista que no la tiene.
`tools/snapshot.js` incluye `MARCADORES` en su lista de hojas, así que el camino más corto es
correrlo.

**Versionar la salida en `docs/_snapshots/AAAA-MM-DD_MARCADORES.*`.** Es la mitad que faltaba: el
"snapshot del 11/08" que los prompts vienen citando **nunca estuvo en el repo**, y por eso se lo
citó cuatro veces **como si fuera de hoy** — nadie podía mirarle la fecha. Un snapshot versionado
es evidencia fechada; uno que vive en la memoria de una conversación es una cifra sin edad.

**Al versionar el nuevo, revisar que ningún documento vivo cite cifras del viejo sin decir de
cuándo son.** Medido el 15/08 **antes** de que el nuevo exista: los candidatos que se habían
señalado —el `_2` y `PENDIENTES`— **ya declaran la fecha en las tres citas** (`_2` líneas 21 y
31, `PENDIENTES` línea 3820). **Cero ediciones hoy**, y el cero queda registrado; la revisión que
importa es la de después, cuando haya dos snapshots y las cifras dejen de coincidir.

**Qué queda escrito después.** El censo del `_2` completo, y con eso su gate queda listo para el
usuario.

**¿Decide el usuario?** **Sí, y es el gate más grande de la cola.** El `_2` define el vocabulario
de dimensiones, y su Parte B no arranca sin esa decisión.

---

## Lo que NO está en esta lista, y por qué

- **`R-26` / el "1 a 1"** — su Parte A mide contra `rdv`. Se puede correr cuando el usuario
  quiera, pero **no destraba nada de lo de arriba**: es el frente 9 y es independiente.
- **El alta de `SOLAPAS` en sí** — no es una corrida: ya está escrita en el seed, y la aplica
  `instalar()` (corrida 0).
- **Correr `aplicarClasificacionSolapas_()`** — no hace falta para verificar `D-32`: la prueba de
  punta a punta es de sólo lectura. Correrlo escribe.
