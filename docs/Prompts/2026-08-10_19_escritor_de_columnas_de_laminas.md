# `_19` · `escribirColumnaLaminas_` y el cierre de la Parte D del `2026-08-09_1`

> **Modelo: Opus, effort alto.** Subagente `verificador` antes de arrancar.
>
> **Sale del `_16`, que se queda sin esa pieza.** El `_16` la había traído de arrastre porque su
> poblador de `titulo` la necesita; pero la Parte D de `N1` la necesita **antes**, y `titulo` no
> acerca la demo. Se parte: el escritor entra ahora, `titulo` espera.

---

## 0 · Por qué este prompt existe y por qué es chico

La Parte D del `2026-08-09_1` quedó frenada por una sola cosa: **no hay con qué escribir columnas
puntuales de `LAMINAS`.** El sellador sólo agrega filas, y las agrega por posición.

Este prompt escribe esa pieza y cierra la Parte D. **Nada más.** No agrega ninguna columna al
esquema, no siembra `seccion_id`, no toca `titulo`, no toca ninguna plantilla.

**Y se escribe genérico a propósito**, que es lo único que justifica sacarlo del `_16` en vez de
esperar: el `_14` va a necesitar exactamente esto para las 51 filas, y el poblador de `titulo`
también. **Escribirlo tres veces son tres oportunidades de que una escriba por posición** — es el
mismo razonamiento que unificó `valorPasaFiltro_`, donde había tres copias y parchear una habría
dejado las otras dos cayendo a igualdad exacta **sin fallar**.

---

## A · Verificación de premisas — sólo lectura, **reportar y parar**

**A.1 · El esquema.** Los encabezados reales de `LAMINAS`, en orden y con su índice. **Deberían
ser trece y no incluir `titulo`**: el `_16` no corrió. Si `titulo` está, este prompt salió de
orden y hay que decirlo antes de escribir nada.

**A.2 · El lector.** Confirmar que `leerLaminas_` mapea por encabezado y no por índice, y que
devuelve el número de fila real de cada registro — sin eso, escribir una celda puntual exige
recontar y ahí es donde entra el error de posición.

**A.3 · Las dos filas.** `L-031` y `L-032` fueron verificadas por lectura en la nocturna del
09/08 como las láminas 2 y 3 de `jm`. **Re-verificarlo acá y no darlo por hecho**: la doc habla de
«lámina 2» y «lámina 3» por posición en la plantilla, y los ids se eligieron a propósito para que
no se parezcan a una posición. Reportar `lamina_id`, `informe_id`, `orden_plantilla` y el estado
actual de `cobertura`, `falta` y `notas` de las dos.

**A.4 · Que estén vacías.** Si `cobertura` o `falta` ya tienen algo escrito en esas dos filas,
**parar**: alguien escribió ahí y no fue este flujo, y eso es un hallazgo antes que un conflicto.

**Fin de la Parte A: reportar y parar.**

---

## B · El escritor

En `Sellador.gs`. **Greppear el nombre antes de escribirlo** (`CLAUDE.md` §1).

```
escribirColumnaLaminas_(mapa, columna, opciones)   // { lamina_id: valor } → una sola columna
```

**Contrato, y cada cláusula está por un modo de falla conocido:**

- **Resuelve la columna por nombre de encabezado.** Nunca por índice. La hoja va a ganar una
  columna con el `_16` y esta función no puede enterarse.
- **Escribe una sola columna por llamada.** Escribir varias de una es lo que hace que un error de
  alineación pase inadvertido.
- **No crea filas, no borra filas, no toca ninguna otra columna.**
- **Un `lamina_id` que no está en la hoja se reporta y se saltea.** Es el caso «fila sin ancla»
  que `verificarLaminas()` ya sabe nombrar; este prompt no lo repara.
- **Si el valor a escribir es igual al que ya está, no escribe.** El conteo de «sin cambio» es lo
  que permite correr dos veces y ver cero la segunda.
- **Respeta `dryRun`**, con la misma convención que `sellarPlantilla`: `opciones.dryRun === true`.
- **Backup de la planilla antes de escribir.** Si el backup falla, no escribe.

Devuelve conteos: escritas, sin cambio, no encontradas — más la lista de las no encontradas, que
es la única que hay que mirar fila por fila.

**Y una decisión que va escrita en el encabezado de la función, no en un doc aparte:** esta
función es **el único camino** para escribir celdas de `LAMINAS` que no sean filas nuevas. Si
aparece un segundo, es un bug de arquitectura aunque escriba bien.

---

## C · La Parte D, cerrada

Se ejecuta lo que dice **`docs/Prompts/2026-08-09_1.4_addendum_parte_D.md`**, que reemplaza la
Parte D del prompt original. Tres llamadas, una por columna:

- **`cobertura`** — `L-031` y `L-032` a `parcial`.
- **`falta`** — `frecuencia, ivr_*` en las dos.
- **`notas`** — la aproximación declarada de la Parte B, **y el límite de la validación**: las
  láminas 2 y 3 existen en **un solo deck**; la aproximación de impresiones no se distingue de una
  regla equivocada hasta que aparezca un segundo deck `JM`. Esa frase va en la celda, no en un
  documento aparte — es lo único que va a estar delante de los ojos de quien mire la fila dentro
  de tres meses.

**El vencimiento se escribe junto con el dato**, como fija el `1.4` §2: la nota dice de qué prompt
salió el valor y en qué fecha, y **cuando el `_14` exista él pasa a ser el dueño de `cobertura` y
`falta`** y las recalcula. Lo que escribe este prompt es provisorio por construcción.

---

## D · Documentación

- **`ESCRITORES.md`**: la hoja `LAMINAS` no tiene fila, y el censo es del 03/08 — anterior al
  `_11`, que es cuando la hoja nació. Agregar la hoja con su dueño y **los tres escritores:
  `sellarPlantilla`, `borrarFilasDeLaminas` y el nuevo**. Re-correr `node tools/escritores.js`.
  **Si el censo levanta un cuarto que nadie sopló, eso es hallazgo y va al reporte** — ya pasó
  una vez, con `consolidarMapeoLooker_` en `MAPEO`.
- **`PLAN.md`**: la regla del `1.4` §2 —quién escribe `cobertura` y `falta`, y hasta cuándo—
  entra como decisión, **con el número que esté libre al escribirla**. No anunciarlo antes:
  `PLAN.md` §1 nota 4, y el precedente es `D-15`, prometido y asignado a otra cosa esa misma
  tarde.
- **`BITACORA.md`**: los conteos, con fecha y hora de lectura.
- **El `_16` pierde `escribirColumnaLaminas_` de su Parte C** y pasa a citarlo como pieza
  existente. **Editarlo en el lugar** — sigue sin ejecutarse.

### Criterios de aceptación — estructurales

1. Las 51 filas siguen siendo 51. **Control positivo: los 7 `escondida` marcados siguen siendo 7.**
2. Sólo `L-031` y `L-032` cambiaron, y sólo en las tres columnas nombradas.
3. Correr la Parte C dos veces: la segunda escribe cero.
4. `verificarLaminas()` sigue dando **cero desajustes** y sigue detectando sus cinco clases.
5. Un `dryRun` no escribe.
