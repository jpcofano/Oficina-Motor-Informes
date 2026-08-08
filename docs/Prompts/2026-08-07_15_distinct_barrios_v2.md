# `DISTINCT` de barrios, versión 2 — con el catálogo que ya existe

> **Supersede a `2026-08-07_12_distinct_barrios.md` y absorbe a
> `2026-08-07_12.1_addendum_partes_A_E.md`.** Los dos quedan en la carpeta **sin editar**: el
> `_12` corrió su Parte 0 y ese reporte sigue valiendo; el `12.1` **no se ejecuta por su cuenta**
> — sus siete ajustes están adentro de este archivo.
>
> **Por qué existe este archivo.** El `_12` se escribió antes de encontrar que el catálogo
> canónico de barrios **ya existe y está en una planilla**. La reescritura se hizo pero no llegó
> al repo, así que el `12.1` addendaba un documento que nadie tenía. Este archivo es esa
> reescritura, con los ajustes ya incorporados y sin nada que empalmar.

**Un objetivo.** Documentación. **Cero `.gs`, cero hojas, cero corridas.** Deja escrito qué
tiene que devolver una lista `DISTINCT`, para que la implementación —que es **otro prompt**— no
adivine.

**El hallazgo que le da forma a todo.** `catalogoBarriosDesdeBase_` lee la solapa `Comunas` de
`rdv` —48 filas, barrio→comuna, registrada en `SOLAPAS` como `referencia`— y `parsearBarrio_`
mapea variantes al canon, con una tabla de 11 variantes ortográficas en `Parseo.gs` que cubre
`Núñez`/`nunez`, `Villa Gral. Mitre`/`Villa General Mitre` y `Monserrat`/`Montserrat`. **La lista
canónica no hay que construirla: hay que apuntarle.**

**Las decisiones del usuario, 07/08/2026:**

1. **Salen todos los barrios que sobrevivan al filtro de la sección, sin repetir.** No es un
   top-N y no se trunca.
2. **Deduplicar plegando mayúsculas y acentos.**
3. **La forma publicada es el canon del catálogo `Comunas`**, no el texto de la celda.
   **Supersede a la decisión anterior del mismo día** —*"va como está escrito en la celda"*—, que
   se tomó sin saber que el catálogo existía. **Escribir las dos con esa relación**: una decisión
   que se movió porque apareció un dato es distinta de una que estaba mal.
4. **Orden alfabético.**
5. **Un valor que no matchea el catálogo no se publica crudo.** Queda fuera de la lista, el token
   va a `REVISAR` y el valor entra al listado de faltantes con su fila.
6. **Cada barrio va en su propia caja.**
7. **El separador es la coma** (`", "`), y con el punto 6 **hoy no se usa**.
8. **Las 11 variantes ortográficas se quedan en `Parseo.gs`.** El motivo es un supuesto —*los
   barrios de la Ciudad no cambian*— y por eso va como `S-NN`, no como excepción suelta a la
   regla de que la configuración vive en planillas.

---

## Lo ya medido — no se vuelve a medir

De la Parte 0 del `_12` y de la re-medición del `12.1`, todo verificado contra las hojas vivas:

| | resultado |
|---|---|
| `R-10` | habla de **encabezados de columna**, no de valores de celda. **No hay derogación ni excepción**, y el `P2` está mal enmarcado |
| `normalizar_` | pliega acentos y case y hace `trim()`; **no colapsa espacios internos**, no toca puntuación ni guiones |
| pares que colapsan hoy | **cero**. Los valores están escritos limpios y con acento correcto |
| barrios de la ventana | **4** con el filtro `figura=Jorge Macri` puesto: Belgrano, Caballito, Retiro, Villa Urquiza. Los 11 anteriores eran de doce figuras |
| el dato del equipo | *"entre 3 y 6, promedio 4"* **cierra con el motor** |
| las cuatro cajas | son **celdas de una misma tabla**, no cajas separadas. **`D-22` aplica** |
| desborde | no existe: `items_por_lamina` está en `SECCIONES` y en el seed, y **ningún consumidor la lee** |
| IDs | `R-18` libre; máximo de `SUPUESTOS.md` es `S-03`, así que `S-04` |

## Parte 0 — lo único sin medir (dos chequeos, sin ida y vuelta)

`0.1` · **Por qué camino llegaría un marcador al catálogo.** El comentario de
`catalogoBarriosDesdeBase_` dice que el nombre de la solapa sale de la fila de `BASES`, y
`Union.gs` lo tiene en una constante. **Reportar cuál de las dos es cierta** y si `Comunas` está
registrada de forma que un marcador la alcance. **Reportar, no arreglar** — el resultado va a
`D.3`.

`0.2` · **Confirmar que `R-18` y `S-04` siguen libres** al momento de escribir.

**Si los dos dan lo esperado, seguís a la Parte A sin parar. Si `R-18` o `S-04` están tomados,
parás y reportás.**

---

## Parte A — la regla, en `REGLAS_NEGOCIO.md`

`A.1` · Escribir `R-18`. **General para cualquier lista `DISTINCT`, no sólo barrios.** Lo que
fija, y nada más:

- **La clave de comparación es el valor normalizado** (`normalizar_`), **con su límite escrito**:
  no colapsa espacios internos, así que *Villa Gral Mitre* con doble espacio **no** colapsaría.
  Hoy el caso no existe —cero pares colapsan—, y **no se crea un normalizador nuevo por un caso
  que nadie tiene**. La salida queda declarada: si aparece, se compone con el colapso de espacios
  y el motivo se escribe arriba de la función, como pide `CLAUDE.md` §2.
- **La forma publicada sale del catálogo canónico declarado para esa categoría, nunca de la
  celda.** Para barrios, el catálogo es la solapa `Comunas` de `rdv` y el mapeo lo hace
  `parsearBarrio_`. **Nombrar las funciones, no citar líneas.**
- **Lo que no matchea el catálogo no se publica:** queda fuera de la lista, el token va a
  `REVISAR` y el valor entra al listado de faltantes con su fila. **Nunca crudo y nunca en
  silencio** — son las dos formas de fallar acá y la regla le cierra la puerta a las dos.
- **La lista hereda el universo de su sección, y eso es parte del contrato de la operación, no
  una nota al pie.** Cuando se cablee `ecv_barrios`, su fila de `MARCADORES` lleva
  `filtro = figura=Jorge Macri`, igual que las seis del `_13`. Sin eso, el `DISTINCT` cuenta de
  más — **es el error que se acaba de corregir en la lámina 5 y ésta es la operación con más
  chances de repetirlo**.
- **El orden de salida es alfabético sobre la forma publicada**, con comparación de castellano.
  Alfabético hace la lista reproducible entre corridas; el orden de aparición no.
- **No se trunca.** Si no entra en la caja, el motor **no recorta**: es problema de plantilla.
- **Cero filas da `sin_datos`**, no `""` ni `0`, por el precedente de `SUMA` — **con esa
  referencia**, para que la regla se lea entera en un solo lugar.

`A.2` · **Qué NO dice esta regla:** no toca `R-10`, que rige la lectura de **encabezados**. Son
dos normalizaciones con dos propósitos y conviven. **Explícito**: es el malentendido que el `P2`
ya tuvo una vez.

## Parte B — el supuesto, en `SUPUESTOS.md`

`B.1` · Escribir `S-04`: **el catálogo de 48 barrios y sus variantes ortográficas son estables.**
Es lo que autoriza que las 11 variantes vivan en `Parseo.gs` en vez de en una solapa, y por eso
va como supuesto y no como excepción suelta: si aparece un barrio nuevo o una variante que la
tabla no cubre, **el supuesto cae y la decisión se revisa**, en vez de descubrirse como un barrio
que desapareció del informe.

## Parte C — las editoriales, en `CONFIG_INFORMES.md` §1.4

`C.1` · **Una caja por barrio.** Con las dos consecuencias: el separador queda escrito y **sin
uso** mientras rija esta forma; y **choca con `ecv_barrio1-3`**, que §1.4 declara `[MANUAL]` y son
tres ranuras para cuatro barrios. **Escribir la colisión, no resolverla**: si las cajas pasan a
salir del `DISTINCT`, esos tres dejan de ser carga manual, y eso responde la `[?]` de `C.3` por
un camino distinto del que preguntaba. **No darla por respondida sin el usuario.**

**Y la parada, que ya está disparada:** son celdas de tabla y `D-22` aplica —el motor lee tablas
y no sabe agregarles filas— y no hay mecanismo de desborde. **La decisión se escribe igual; su
implementación es lámina nueva y otro prompt. No tocar la plantilla en esta corrida.**

`C.2` · **Que no se trunca**, con el motivo y con el control: el dato del equipo —3 a 6, promedio
4— **cierra con el motor**, que midió 4 con el filtro puesto. **La discrepancia de once tenía
causa, era el universo, y quedó corregida el 07/08.** Un número del equipo que cierra con el
motor vale como control, no como anécdota.

`C.3` · La `[?]` de los tres barrios destacados —ranking automático o manual— **no se toca**.

## Parte D — cerrar el `P2` en `PENDIENTES_consistencia.md`

`D.1` · Las cinco decisiones pasan a resueltas, **apuntando a su dueño y sin repetir el texto**:
la forma publicada, la deduplicación, el orden y el cero-filas a `R-18`; el separador, la caja y
el no-truncado a `CONFIG_INFORMES.md` §1.4.

`D.2` · **Corregir la frase sobre `R-10`.** El `P2` dice que ésta es *la única de las cuatro donde
una regla escrita empuja en contra del comportamiento deseable*, y es falso. **La corrección va
fechada y explica el error**, no lo borra: entender por qué se creyó que había conflicto vale más
que la frase limpia.

`D.3` · **Anotar lo que reporte `0.1`** si el camino al catálogo está hardcodeado. Y en la misma
entrada, el `{{ecv_barrio}}` singular de la lámina 6, que es un token distinto de los cuatro.
**Hallazgos de consistencia: se anotan, no se arreglan.**

`D.4` · El `P2 · ecv_barrio no puede usarse como prefijo de familia` **es otro pendiente y no se
toca**.

## Parte E — el backlog, en `PLAN.md` §4

`E.1` · **Catálogos canónicos para las categorías que todavía no lo tienen.** Barrios ya lo tiene
y sale del backlog; lo que queda es qué otras categorías publican texto libre sin catálogo
detrás. Una línea, sin orden y sin fecha. **No es una `D-NN`**: es un deseo, no una decisión de
arquitectura tomada.

## Commits

Uno por archivo tocado. Documentación. Sin `—`. `git push` después de cada uno.

## Verificación

Se cierra cuando `ecv_barrios` tiene, en un solo lugar por pregunta, la respuesta a: qué filas
entran, cómo se deduplica, de dónde sale la forma publicada, qué pasa con lo que no matchea, en
qué orden, en cuántas cajas y qué pasa con cero filas. **Si alguna sigue sin dueño, la
implementación de `DISTINCT` no puede empezar.**
