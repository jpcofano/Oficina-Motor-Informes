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

## ~~0 · Menú → Aplicar configuración~~ — **corrida el 15/08**

**Hecha.** El alta llegó: `reuniones` quedó en **2 `fuente`, 5 `referencia`, 17 `ignorar`**, y las
154 filas de `MAPEO` con su `encabezado`.

⚠ **NO era `instalar()`**, y por eso el primer intento no escribió nada: `instalar()` →
`aplicarInstalacion_()`, que crea/repara hojas y aplica los `COLUMNAS_DELTA_` **y nada más**. El
ítem de menú *Aplicar configuración* corre los cuatro sembradores en orden. **Queda escrito porque
el síntoma de equivocarse es una corrida que termina bien y una hoja que no cambia.**

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

## ~~2 · `verificarGateDeUso()`~~ — **verificado el 15/08, y no alcanzó con correrlo**

**`D-32` cerrado**, de las dos mitades: **12 afirmaciones** puras, más la verificación a mano
contra el sembrador.

⚠ **La parte de punta a punta se abstuvo, y hubo que fabricar el caso.** Sobre una configuración
consistente **no hay ninguna fila donde la hoja diga `fuente` y el seed otra cosa**, así que no
hay nada que verificar — y **la abstención no es un verde**.

**Cómo se cerró, que es lo que hay que repetir la próxima vez:** se puso
`reuniones/Agenda funcionarios` en `fuente` a mano contra un seed que decía `ignorar`, se corrió
el sembrador, se confirmó que **no la revirtió**, y se la devolvió a `ignorar`.

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

## ~~4 · El censo de `MARCADORES`~~ — **hecho el 15/08**

`tools/snapshot.js` corrido y **la salida versionada en `docs/_snapshots/`**. El repo tiene ahora
las hojas al **01, 10, 11 y 15/08**, así que el "snapshot del 11/08" que cuatro documentos venían
citando **ya se puede abrir**.

**Con `MARCADORES_2026-08-15.tsv` en el repo, el `_2` queda listo para su Parte A completa** — los
duplicados por definición, el inventario de `filtro` y la agrupación por dimensión lógica —, que
es el frente 4 del plan.

⚠ Los del 15/08 se regeneraron **después** del alta. Los de `SOLAPAS` y `MAPEO` de la primera
tanda eran **pre-alta** y quedaron reemplazados.

---

## Lo que NO está en esta lista, y por qué

- **`R-26` / el "1 a 1"** — su Parte A mide contra `rdv`. Se puede correr cuando el usuario
  quiera, pero **no destraba nada de lo de arriba**: es el frente 9 y es independiente.
- **El alta de `SOLAPAS` en sí** — no es una corrida: ya está escrita en el seed, y la aplica
  `instalar()` (corrida 0).
- **Correr `aplicarClasificacionSolapas_()`** — no hace falta para verificar `D-32`: la prueba de
  punta a punta es de sólo lectura. Correrlo escribe.
