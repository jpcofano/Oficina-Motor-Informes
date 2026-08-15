# Corridas de Apps Script pendientes — mañana del 15/08/2026

> **Lo dejó la corrida nocturna del `2026-08-14_7`, bloque 4.** Es la lista única: todo lo que
> necesita la planilla y quedó esperando, en un solo lugar.
>
> **Ordenada por lo que destraba**, no por cómo aparecieron. Se corren desde el editor de Apps
> Script: elegir la función en el desplegable de arriba y **Ejecutar**; el resultado sale en
> **Registro de ejecución**. `clasp logs` no anda — el proyecto no tiene GCP propio.
>
> **Todo lo de acá está pusheado.** Nada quedó sin subir.

---

## 1 · `censarCoberturaDeUniversos()` — cierra el alta de las 20 solapas

**Qué destraba.** El **punto 5 del `_4`**, que es lo último que le falta al alta de `SOLAPAS` de
`reuniones` y con eso al cierre del `_1`. El Addendum 2 del `2026-08-14_1` pide medir
`Desglose impresiones`, `Métricas digital` y `Digital | Base Post` **contra los 25 `Uno a uno`
antes** de clasificarlas; hasta que eso se mida, **las tres no se clasifican y el alta no se
escribe entera**.

**Qué queda escrito después.** La cobertura de cada solapa sin registrar contra cada universo, y
con eso las 19 filas `ignorar` + 1 `referencia` pueden escribirse **citando
`docs/CENSO_solapas_reuniones_2026-08-14.md`**, con el motivo medido de cada una.

**¿Decide el usuario?** **Sí, y dos veces.** El Addendum 2 dice con todas las letras: *"El alta
de `SOLAPAS` es una decisión del usuario y se confirma antes de escribir."* Y si alguna de las
tres excepciones resulta tener cobertura alta, **qué se hace con ella** también es del usuario.
Code mide y reporta; no clasifica solo.

> Mide columna por columna y no asume cuál es la clave: **`Desglose impresiones` tiene tres**
> —`Social`, `Google`, `Programmatic`—. Una función que buscara "la" columna de id mediría un
> tercio.

---

## 2 · `probarGateDeUsoDeSolapas_()` y después `probarGateDeUsoContraLaHoja_()` — verifican `D-32`

**Qué destraba.** El `_3` quedó implementado anoche (`D-32`: el sembrador **nunca pisa un `uso`
existente**) **y sin probar**. Es un cambio en un escritor de hojas de registro: hasta que se
verifique, no se puede confiar en él ni construir encima.

**En ese orden, y el orden importa.** La primera es pura y no toca la planilla — si falla, el
cálculo está mal y la segunda no significa nada. La segunda es de punta a punta y **sólo lectura**.

**Qué queda escrito después.** La entrada de bitácora que cierra el `_3`. Si pasan, el frente 2
del plan queda hecho.

**¿Decide el usuario?** No para correrlas. **Sí** si `probarGateDeUsoContraLaHoja_` se **abstiene**
—lo hace cuando no encuentra ninguna fila con `fuente` en la hoja y otra cosa en el seed—: ahí
hay que decidir si se fuerza el caso poniendo una solapa en `fuente` contra un seed que diga
`ignorar`. **Una abstención no es un verde**, y está escrito así a propósito.

---

## 3 · `instalar()` — crea la columna `encabezado` de `MAPEO`

**Qué destraba.** `D-31` quedó escrito y sembrado anoche, pero **la columna todavía no existe en
la hoja**. Hasta que corra, el testigo vive sólo en el código.

⚠ **Mirar el diff la primera vez.** La columna entra por `COLUMNAS_DELTA_`, así que **no**
reescribe la fila 1 ni corre los datos — pero empuja `tipo_esperado`, `valores_incluidos` y
`notas` una a la derecha, y conviene verlo.

**Qué queda escrito después.** Las 154 filas del seed con su encabezado. Las otras 7 quedan
vacías: son las de `promoverFechasElegidas()`, y está anotado por qué.

**¿Decide el usuario?** No, salvo que el diff muestre algo inesperado.

---

## 4 · `diffSolapasSinAplicar_()` — la foto de qué desacuerda hoy

**Qué destraba.** Nada por sí sola, y por eso va acá abajo: es **diagnóstico**. Muestra toda fila
donde el seed y la hoja difieren, con las degradaciones de `uso` marcadas aparte.

**Para qué sirve igual.** Es la línea de base de `D-32`: dice **cuántos desacuerdos hay hoy** —y
por lo tanto cuántos venían pisándose en silencio en cada siembra. Y `probarGateDeUsoContraLaHoja_`
la usa por dentro, así que correrla antes explica lo que la prueba va a decir.

**¿Decide el usuario?** Sí, pero sin apuro: cada desacuerdo es un lado que hay que corregir —el
seed o la hoja— y ésa es una decisión por fila.

---

## 5 · El censo de `MARCADORES` — desbloquea el `_2`, que es el frente 4 del plan

**Qué destraba.** Los **puntos 1, 2 y 3 de la Parte A del `_2`**: los duplicados por definición,
el inventario de `filtro` y la agrupación por dimensión lógica. El bloque 2 de la corrida
nocturna **no pudo hacerlos**, y no por falta de tiempo: **`SEED_MARCADORES_` no existe y no va a
existir** — `Instalar.gs:2715` dice *"`MARCADORES` no tiene sembrador y no lo va a tener
(`D-17`): su dueño es la plantilla"*. `MARCADORES` vive **sólo en la hoja**.

⚠ **No hay función escrita para esto todavía**, y es la única de la lista que no la tiene.
`tools/snapshot.js` incluye `MARCADORES` en su lista de hojas, así que **el camino más corto es
correr el snapshot y versionar su salida** — el "snapshot del 11/08" que los prompts vienen
citando **no está en el repo**, que es cómo se llegó a citar cifras viejas cuatro veces.

**Qué queda escrito después.** El censo del `_2` completo, y con eso su gate queda listo para el
usuario.

**¿Decide el usuario?** **Sí, y es el gate más grande de la cola.** El `_2` define el vocabulario
de dimensiones, y su Parte B no arranca sin esa decisión.

---

## Lo que NO está en esta lista, y por qué

- **`R-26` / el "1 a 1"** — su Parte A mide contra `rdv`. Se puede correr cuando el usuario
  quiera, pero **no destraba nada de lo de arriba**: es el frente 9 y es independiente.
- **El alta de `SOLAPAS` en sí** — no es una corrida, es una escritura, y va **después** de la 1.
- **Correr `aplicarClasificacionSolapas_()`** — no hace falta para verificar `D-32`: la prueba de
  punta a punta es de sólo lectura. Correrlo escribe.
