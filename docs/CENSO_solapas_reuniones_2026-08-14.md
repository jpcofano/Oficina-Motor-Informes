# CENSO — las 24 solapas de `reuniones` (14/08/2026)

> **Estado: evidencia congelada.** No se edita. Es la medición que habilita el alta de
> `SOLAPAS` para la base `reuniones`; el alta se escribe **citando este documento**, y cada
> nota de `ignorar` sale de una fila de acá y no de una frase.
>
> **reemplaza:** nada.

## Por qué existe

La Parte A2 del `docs/Prompts/2026-08-14_1_mapeo_metricas_plataforma_reuniones.md` censó estas
solapas el 14/08 y **el resultado sólo existió en un reporte de conversación**. Cuando el punto 5
del `_4` fue a escribir el alta, el repo nombraba **tres** de las veinte solapas nuevas y ninguna
de las otras diecisiete: no había con qué escribir un motivo verificable. Un motivo que nadie
puede verificar en noviembre es indistinguible de una regla — es el modo de falla que revirtió
`CAMPAÑAS_DESGLOCE_DIGITAL` esta misma semana.

**Este documento es la medición, no la decisión.** No clasifica nada: dice qué hay.

## Cómo se midió

`censarSolapasParaAlta()` (`Auditoria.gs`), corrida el 14/08/2026 a las 21:33–21:34. Recorre las
bases de `BASES`, censa cada solapa con `diagPlanillaExterna_` y **cruza contra `SOLAPAS` vivo**
—no contra el seed—. Por solapa: nombre exacto, `getLastRow()` × `getLastColumn()`, si la
registra `SOLAPAS` hoy y con qué `uso`, y las filas 1 y 2.

**Las filas incluyen el encabezado**, porque son `getLastRow()` crudo. `Agenda JM` figura con 156
y `SOLAPAS` le registra `filas_datos: 154`: la diferencia son las dos filas de encabezado
(`fila_encabezado: 2`). No es una discrepancia.

**Total medido: 24 solapas. Registradas hoy: 4. Sin registrar: 20.** El conteo confirma el del
`_4` —20 nuevas— y **corrige el "otras 17" del Addendum 2 del `_1`**, que está corrido en uno. El
addendum no se edita; queda corregido acá.

---

## Las 4 registradas hoy

| solapa | filas × cols | `uso` | qué es |
|---|---|---|---|
| `Agenda JM` | 156 × 44 | **`fuente`** | PRE, una fila por encuentro. Encabezado en fila 2: `ID · Funcionario · Barrio / Comuna · Tipo · Fecha · Fecha de envío · Enviados · Entregados · Aperturas · % OR · Clics · % CTOR`. Banda fila 1: `Comunicación Directa | Mailing` |
| `Agenda JM \| Post` | 106 × 29 | **`fuente`** | POST, mismo `ID` que la PRE (`C-50`). Banda fila 1 `Información del encuentro` … `Comunicación Digital | Acumulado`; fila 2 `ID · Funcionario · Barrio / Comuna · Tipo · Fecha · Habitantes · Alcance · Alcance potencial · % Cobertura · Impresiones totales · Clics · % CTR` |
| `Agenda funcionarios` | 555 × 25 | `ignorar` | encuentros de otros funcionarios |
| `Barrios` | 71 × 2 | `referencia` | `Barrio | Comuna | Zona` → `Habitantes` |

---

## Las 20 sin registrar

Ordenadas como salieron del censo. **La columna «motivo medido» es lo que la medición muestra,
no un veredicto** — la clasificación es del alta, no de este documento.

| # | solapa | filas × cols | motivo medido |
|---|---|---|---|
| 1 | `EDVs \| Estados` | 695 × 17 | Bandas fila 1: `INFORMACIÓN DEL ENCUENTRO` … `DIGITAL`. Fila 2: `Estado · ID Cuentas · Tipo · Nombre · Funcionario · Barrio · Fecha · Fecha de inicio · Fecha de fin · Estado · Fecha de inicio · Fecha de fin`. **Estados por equipo, no métricas** |
| 2 | `EDVs \| Activos` | 3 × 3 | `EDVs activas por equipo` → `DIGITAL: 1 | MAIL: 1 | CALL CENTER: 0`. **Tres celdas de tablero**, sin clave ni filas |
| 3 | `Base_mail` | 360 × 8 | `ID Cuentas · Fecha de envío · Enviados · Entregados · Aperturas · % OR · Clics · % CTOR`. **Capa de filas del canal mail** (`C-64`): una fila por envío. El agregado por cuenta ya está en `Agenda JM` |
| 4 | `Base_IVR` | 61 × 9 | `ID Cuentas · Audiencia · Llamados realizados · Llamados atendidos · % Atendidos · Escucharon +75% · % Escucha +75% · Marque 1 · % Marque 1`. **Capa de filas del canal IVR** (`C-64`) |
| 5 | `Base_Call` | 227 × 5 | `ID Cuentas · Base enviada · Base discada · Contactados · Efectivos`. **Capa de filas de call center** (`C-64`) |
| 6 | `Base_Digital` | 1910 × 27 | **Ocho bloques lado a lado**, cada uno con su propia lista de ids. Bandas fila 1: `Meta Convocatoria · Google Convocatoria · Programmatic Convocatoria · Alcance Meta Convocatoria` …; fila 2 repite `ID Cuentas · Impresiones · Clics` por bloque, y `ID Cuentas · Alcance real · Alcance pot.` en el de alcance. **Es la fuente de la que `Agenda JM!AF` y `Agenda JM \| Post!G` están copiados a mano** (`R-27`), y **la evidencia de que no existe banda de alcance de Google ni de Programmatic** |
| 7 | `EDVs \| Seguimiento Funcionarios` | 291 × 27 | Fila 2: `Funcionario · Barrio / Comuna · Fecha · Estado · Enviados · … · Habitantes · Alcance manual`. **Misma forma que `digital/EDV` (291 × 27, `referencia`)** — mismo alto y ancho: duplicado de otra base |
| 8 | `Digital \| Base Post` | 38 × 8 | `ID Cuentas · Nombre campaña | Digital · Impresiones · Alcance · Frecuencia · Views · Clics en el enlace · Alcance potencial`. **Excepción del Addendum 2: es POST y por eso era candidata.** Sin medir contra el universo `Uno a uno` |
| 9 | `Métricas EDVs` | 760 × 45 | Bandas `INFORMACIÓN DEL ENCUENTRO` … `MAIL`; fila 2 arranca `ID Reunión · Tipo · Evento · Funcionario · Barrio · Fecha · Estado · Enviados …`. **Su clave se llama `ID Reunión`, no `ID Cuentas`** |
| 10 | `Total` | 2633 × 14 | Bandas `INFO CAMPAÑA · DIGITAL · DIRECTA`; fila 2 `Estado · ID Cuentas · Tipo · Nombre · Fecha de inicio · Fecha de fin · …`. **Consolidado de estados de campaña**, no de métricas de encuentro |
| 11 | `IVR` | 104 × 21 | ⚠ **La fila 1 son datos, no encabezados** (`0781-NOVINFGC | Implementado | Yamila Abayay | Mon Jan 13 2025 …`). Solapa sin fila de títulos |
| 12 | `Call` | 1330 × 28 | `Nombre de la campaña en CC · N° Campaña · ID Call · ID plataforma (CCI) · ID plataforma (CCE) · ID Cuentas · Campaña · …`. **Mismo alto que `looker/CC` (1330)** |
| 13 | `Call (JM)` | 227 × 28 | Misma forma que `Call`, recortada a JM. **Mismo alto que `Base_Call` (227)** |
| 14 | `Call (Funcionarios)` | 977 × 28 | Misma forma que `Call`, recortada a funcionarios. 227 + 977 = 1204, contra 1330 de `Call` |
| 15 | `Métricas digital` | 961 × 9 | `ID Cuentas · Nombre campaña | Digital · Impresiones · Alcance · Frecuencia · Views · Clics en el enlace totales · Alcance potencial · Post`. **Excepción del Addendum 2: es la única con `Views`**, y `Visualizaciones` para el PRE es hueco abierto. Sin medir contra el universo `Uno a uno` |
| 16 | `Desglose impresiones` | 2747 × 6 | `Social · Impresiones · Google · Impresiones2 · Programmatic · Impresiones3`. **Excepción del Addendum 2**, por llamarse igual que la decisión editorial del 13/08. **Medido: son tres pares (id, impresiones) lado a lado, con listas de ids independientes** — no una tabla por encuentro. Y **no tiene columna de alcance**, consistente con `R-27` |
| 17 | `Digital` | 961 × 19 | `ID Cuentas · Nombre campaña | Cuentas · Nombre campaña | Digital · Mes · JM | GCBA | POLICIA · Encargado PM · …`. **Mismo alto que `Métricas digital` (961)** |
| 18 | `Mail` | 383 × 14 | ⚠ **La fila 1 son datos, no encabezados** (`0869-ENESALGC | Implementado | 03/01/2025 …`). Solapa sin fila de títulos |
| 19 | `Estados` | 14 × 3 | `Equipo · Estado · Recategorización`. **Tabla de desplegables**, 14 filas |
| 20 | `EDVs \| Resumen` | 174 × 16 | `EDVs realizadas (a hoy)` = 682; fila 2 `Fecha · JM · Ministros · Total` ×2. **Tablero de conteos**, no fuente por encuentro |

---

## Lo que este censo **no** midió, y hace falta antes de clasificar las tres excepciones

El Addendum 2 del `_1` pide medir `Desglose impresiones`, `Métricas digital` y
`Digital | Base Post` **contra el universo `Uno a uno` antes** de mandarlas a `ignorar`. Esa
medición **sigue sin estar hecha**, y el `_4` la da por hecha con un *"0 de 25 Uno a uno"* cuyo
origen no se pudo reconstruir.

⚠ **Y el número 25 no sale del temario.** `REUNIONES` tiene **5** filas con `tipo = "Uno a uno"`
—San Cristóbal ×2, Retiro ×2, Boedo—, medido el 14/08 con `censarTemarioPorTipo()`. El temario
tiene una fila por línea publicada, **no una por encuentro de la base**: el universo de los 25
tiene que salir de la columna `Tipo` de `Agenda JM` (156 filas), no de acá. Lo mide
`censarUniversosDeSolapasDeEncuentro()`, que todavía no se corrió.

**Hasta que eso se mida, las tres excepciones no se clasifican.**

---

## Dos cosas más que el censo dejó a la vista

**`miba` está en `BASES` sin `sheet_id`.** El censo la saltea con
`[miba] sin sheet_id en BASES — no se censa`. Es consistente con `PLAN.md` §3, que tiene *"Fuente
de MiBA — definir de dónde salen los datos"* como bloqueado y dependiente de un tercero. Queda
anotado porque **el motor la tiene registrada y vacía**, no ausente.

**El censo cubrió 108 solapas en 6 bases**, no sólo las 24 de `reuniones`. Lo de las otras cinco
bases no entra a este documento —su alcance son las 24— pero **una de esas lecturas contradice a
un documento vivo** y va como hallazgo a `docs/PENDIENTES_consistencia.md`, que es su dueño.

---

## Addendum — el universo `Uno a uno`, medido la misma noche (14/08/2026, 22:40)

> **No altera ninguna línea de arriba.** Cierra la sección *"Lo que este censo no midió"*, que
> quedó escrita a las 21:34 cuando el dato todavía no existía. Se agrega como addendum y no
> editando aquel párrafo, por la regla de los documentos congelados.

Medido con `censarUniversosDeSolapasDeEncuentro()` sobre las dos solapas `fuente` de `reuniones`,
resolviendo la clave por `MAPEO` (columna `A` en las dos) y no por texto.

**Los 25 `Uno a uno` existen, y el número del `_4` era correcto.** Salen de la columna `Tipo`, y
son **exactamente los mismos 25 ids en la PRE y en la POST**:

```
2790-MARJDGAG  2816-ABRJDGAG  2843-ABRJDGAG  2887-ABRJDGGC  2929-ABRJDGAG
2960-ABRJDGAG  2988-MAYJDGAG  3035-MAYJDGAG  3087-MAYJDGAG  3111-MAYJDGAG
3154-JUNJDGAG  3202-JUNJDGAG  3231-JUNJDGAG  3260-JUNJDGAG  3308-JULJDGAG
3309-JULJDGAG  3354-JULJDGAG  3346-JULJDGAG  3389-JULJDGAG  3420-JULJDGGC
3439-JULJDGAG  3440-JULJDGAG  3487-AGOJDGAG  3522-AGOJDGAG  3527-AGOJDGAG
```

**El reparto completo de `Tipo`**, que sirve para leer los 25 en contexto:

| `Tipo` | `Agenda JM` (154) | `Agenda JM \| Post` (104) |
|---|---|---|
| `Encuentro con vecinos` | 113 | 60 |
| **`Uno a uno`** | **25** | **25** |
| `Reunión temática` | 12 | 12 |
| `Primera persona` | 4 | 4 |
| `Recap` | — | 3 |

**Y confirma el número del temario, que es otro.** `REUNIONES` tiene 5 filas `Uno a uno`; la base
tiene 25 encuentros. **No es una discrepancia:** el temario lista lo que se publica en un
informe, la base lista lo que ocurrió. Quien cruce los dos números sin esto los va a leer como un
error.

**`Recap` sólo existe en la POST**, con 3 ids —`1976-SEPJDGAG`, `2063-OCTJDGAG`,
`2170-OCTJDGAG`—, que son **los mismos tres** que ya estaban anotados en
`PENDIENTES_consistencia.md` por tener la `Fecha` ilegible. Los dos huecos son de las mismas
filas.

### Un hallazgo del instrumento: `Agenda JM | Post` tiene CUATRO columnas `% CTR`

El censo las emitió cuatro veces, con repartos distintos cada una. **Es la confirmación medida de
lo que el `_1` había anotado** —*"los títulos de la fila 2 se repiten y NO alcanzan para nombrar
una columna"*—: la banda de la fila 1 es la que distingue Meta de Google, de Programmatic y del
acumulado, y sin ella el título es ambiguo.

⚠ **Y por eso el objeto que devuelve `censarUniversosDeSolapasDeEncuentro()` no sirve para esta
solapa**: indexa por `base/solapa/título`, así que las cuatro `% CTR` se pisan y sobrevive la
última. **El log las muestra todas**; el valor de retorno, no. Se deja escrito para que nadie
construya sobre el retorno sin saberlo.

### Lo que sigue faltando

Con los 25 ids en la mano, todavía **no está medida** la cobertura de las tres excepciones
—`Desglose impresiones`, `Métricas digital`, `Digital | Base Post`— contra ese universo. Hasta
que eso se corra, **las tres no se clasifican**, y el alta de `SOLAPAS` no se escribe entera.

---

## Addendum 2 — las 20 son espejos, y con eso se cierra el alta (15/08/2026)

> **No altera ninguna línea de arriba.** Cierra la sección *"Lo que sigue faltando"*.

### ⚠ El hallazgo que cambia el encuadre: las 20 sin registrar son espejos `IMPORTRANGE`

**Ninguna es dato propio de esta base.** Cada una tiene **una fórmula en `A1`** que importa el
rango entero de la planilla:

```
1siyVJPVuObp1UEeQTS4IncXpsbev_Iqs-b27hZfLhds
```

Las **cuatro registradas** —`Agenda JM`, `Agenda JM | Post`, `Agenda funcionarios`, `Barrios`—
tienen **cero fórmulas**: son carga a mano y son de esta base.

⚠ **Esa planilla no está en `BASES`, y nadie sabía que existía.** Queda anotada acá porque es el
dueño real de veinte solapas que el motor tiene a la vista.

**Consecuencia directa sobre el alta: ninguna de las 20 puede ir a `fuente`.** Leer el espejo en
vez del original es tener **dos respuestas para la misma pregunta**, y la segunda envejece sin
avisar. Si alguna hace falta como fuente, **se registra esa planilla como base y se lee de ahí**
— no se promueve el espejo.

### Las tres de cobertura perfecta, resueltas: las tres a `referencia`

**Cobertura alta decía que estaban los mismos encuentros. La lectura profunda dice qué traen.**

| solapa | qué trae | por qué `referencia` y no `ignorar` |
|---|---|---|
| `Total` (14 cols) | `Estado`, `ID Cuentas`, `Tipo`, `Nombre`, y fechas de inicio y fin **por canal**. **Ninguna métrica** | es un **índice de estados** que cubre los cuatro universos al 100%. No se lee, pero no se descarta |
| `EDVs \| Estados` (17 cols) | lo mismo, más `Funcionario` y `Barrio`. **Ninguna métrica** | ídem |
| `Métricas EDVs` (45 cols) | **el agregado completo**: `Impr. Social / Google / Programm`, `Alcance manual`, `Frecuencia Meta`, `Cobertura`, el embudo de IVR, y **`CALL CENTER JM` separado de `CALL CENTER FUNCIONARIOS`**. Más una columna **`Validación`** que no existe en ninguna registrada | **es el superconjunto de `Agenda JM`, y de dónde viene su dato.** Verificado sobre `1493`: sus `S/T/U/V` reproducen **exacto** `AA/AJ/AM` de `Agenda JM` |

**`Métricas EDVs` es la más importante de las veinte** y por eso conviene decir qué es: no es una
solapa más que se descarta, es **el origen del que `Agenda JM` es un recorte**. Que su dueño sea
otra planilla es lo único que la mantiene fuera de `fuente`.

### Las tres excepciones: confirmadas, a `ignorar`

| solapa | columnas clave | `Uno a uno` | qué cubre |
|---|---|---|---|
| `Desglose impresiones` | **A, C y E** — tres | **0 de 25** | sólo `Encuentro con vecinos` |
| `Métricas digital` | A | **0 de 25** | sólo `Encuentro con vecinos` |
| `Digital \| Base Post` | A | **0 de 25** | sólo `Encuentro con vecinos` |

Las tres se abrieron por un motivo y **ninguno se sostuvo**. Que `Desglose impresiones` tenga
**tres** columnas clave no es un detalle: una medición que hubiera buscado *"la"* columna de id
habría medido un tercio y devuelto un número creíble.

### Los dos huecos abiertos: **cerrados como "no existe"**, con las columnas revisadas

**1 · `Visualizaciones` para el PRE no existe en ninguna de las 24.** En `Base_Digital` aparece
**sólo en los bloques Post** — columnas `P`, `T`, `X`. **`V-26` sigue dependiendo de `digital`**,
y no hay nada que reconsiderar.

**2 · Alcance por plataforma tampoco existe.** Las únicas bandas de alcance de toda la base son
`Alcance Meta Convocatoria` (`J–L`) y `Alcance Meta Post` (`Y–AA`). **Es confirmación estructural
de `R-27`**, por un camino distinto del que la fundó: no hay banda de Google ni de Programmatic
porque **el dato no existe**, no porque no se haya mapeado.

**Los dos quedan cerrados. Que nadie los vuelva a buscar.**

### Una hipótesis mía que se midió y era falsa

El Addendum 1 anotó que `Métricas digital` y `Digital` eran *"probable duplicado de la misma
solapa"* porque las dos tienen 961 filas y cobertura idéntica columna por columna. **No lo son.**
Comparten las 961 filas porque son **la misma lista de campañas**: `Digital` son los
**metadatos**, `Métricas digital` son las **métricas**. Corregido acá y en las notas de las dos.

### Cómo quedaron las 24

| `uso` | cuántas | cuáles |
|---|---|---|
| `fuente` | 2 | `Agenda JM`, `Agenda JM \| Post` — sin cambios, y son las únicas sin fórmulas que el motor lee |
| `referencia` | 5 | `Barrios` (ya estaba) + **`Base_Digital`, `Total`, `EDVs \| Estados`, `Métricas EDVs`** |
| `ignorar` | 17 | `Agenda funcionarios` (ya estaba) + **16 nuevas** |

**Cada fila lleva en `notas` la medición y su fecha, no el veredicto.** Con esto el `_1` y el
punto 5 del `_4` quedan cerrados.

### Cuatro cosas que salieron de acá y son de otros frentes

1. **`Base_Digital` está probada como desalineada.** En su fila 3: col `A` = `1493-JUNJDGAG`,
   col `G` = `1688-JULJDGAG`, col `M` = `2411-DICJDGAG`, col `Q` = `2723-MARJDGAG`. **Cada bloque
   tiene su propia lista y leerla por fila mezcla cuatro encuentros distintos.** Ya estaba
   anotado como forma; ahora hay evidencia y la nota de `SOLAPAS` la cita.
2. **`Call` tiene `Tipo de llamado`** con `Convocatoria`, `Reconfirmación`, `IVR convocatoria` e
   `Informativo`, y **`Métricas EDVs` separa CC JM de CC Funcionarios**. Es el **insumo directo**
   de la `R-NN` de los dos universos de Call Center — frente 8 del plan.
3. **Dos columnas que otros frentes están buscando, anotadas y sin usar:** `Métricas digital`
   tiene una columna **`Post`**, y `Digital` tiene **`JM | GCBA | POLICIA`** — o sea **la
   dimensión ámbito del `_2` escrita como columna**, en vez de inferida del nombre de campaña.
4. **`Agenda JM | Post` ya usa `-` como valor** en varias columnas. El `-` que se iba a definir
   como estado publicable **existe en la base como dato**: son dos cosas distintas con el mismo
   símbolo, y hay que decidir si se distinguen. Es del frente de los estados `-` / `---`.
