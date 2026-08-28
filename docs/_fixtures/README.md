# `docs/_fixtures/` — dónde están los exports y cómo se reconocen

**Estado: vivo.** Creado el 19/08/2026 (`2026-08-19_3_ordenar_rama_validacion.md`). Reescrito el
20/08/2026 con la decisión del usuario sobre `C-21`.

---

## La decisión, primero, porque cambia qué es esta carpeta

**Los fixtures NO van al repo, y eso es deliberado.** `.gitignore` excluye `*.xlsx` y `*.zip` con
el motivo escrito desde el 31/07 (`DOC-5` Parte 2) —*el repo es público y las bases traen nombres de
funcionarios, barrios, volúmenes de envío y respuestas de vecinos*— y **ese motivo sigue valiendo**.
No se pidió excepción.

Los archivos viven en esta carpeta, **en disco y fuera de git**. Cuando una validación necesita uno,
**el usuario lo adjunta al chat**. El repo no guarda los fixtures: guarda **dónde están y cómo se
reconocen**.

**Esta carpeta no es un inventario de lo que falta. Es un índice de lo que hay.**

## Ruta local

```
C:\Users\20243359679\OneDrive\Documentos\AppsScript\Oficina\Motor Informes\docs\_fixtures\
```

Sólo este `README.md` está versionado. Todo lo demás que aparezca acá es local por diseño.

## Convención de nombre

```
AAAA-MM-DD_<base>.<ext>
```

La fecha es la del **export**, no la del día en que se copió. Los archivos que ya están conservan
por ahora el nombre con que los nombra el handoff; el que manda para identificarlos es el **sha**,
no el nombre.

---

## Cómo se usa — la línea que hace que esto sirva

**El usuario adjunta el fixture al chat; quien lo recibe verifica el `sha256` contra la tabla de
huellas ANTES de citar un número.**

⚠ **El sha no es prolijidad.** Un archivo pegado en un chat, sin huella, es **anónimo**: no hay nada
que distinga el export del 12/08 del que le siguió dos días después, y los dos se llaman casi igual.
Un caso `exacto` medido contra un archivo anónimo **no es reproducible**, que es exactamente lo que
`C-21` venía a arreglar. Con el sha en el repo, quien recibe el archivo puede afirmar **contra cuál
midió**, y quien lea el caso seis semanas después puede comprobarlo.

Verificarlo, del lado de quien recibe:

```
sha256sum "<archivo adjunto>"
```

---

## Los ocho fixtures de la rama

Tabla copiada textual de la §8 de `docs/Sesiones/HANDOFF_validacion_2026-08-19.md`. El estado dice
qué hay **en esta carpeta**, hoy.

| fixture | contiene | estado |
|---|---|---|
| `Informe_2026-07-31.zip` | `Base Looker`, `Seguimiento Digital`, `RDV`, `M2` + deck **JM 24-31/07** + deck SECCO 31/07 | `[local]` |
| `Seguimiento_Digital2026-08-06.zip` | `Seguimiento Digital`, `RDV`, `M2` — **sin `Base Looker`** + deck SECCO 07/08 | `[local]` |
| `Base_reuniones_-_Digital_-_Call_Center.xlsx` (12/08) | primera versión de la base de reuniones | `[no está]` |
| `2026-08-14_Base_Looker.xlsx` | primer export con la columna `Tipo de llamado` en `CC` | `[no está]` |
| sueltos del 14/08 | `Base_reuniones` (v2), `M2 Reporte para Fede`, `Seguimiento Digital`, `Base Looker`, `RDV` + deck **JM 08-14/08** | `[no está]` |

`[local]` = está en la carpeta, fuera de git · `[no está]` = todavía no se copió acá.

**`[no está]` no significa perdido.** Los del 12/08 y el 14/08 son exports que el usuario descargó y
que pueden seguir en su carpeta de descargas; copiarlos acá y anotarles el sha es lo que los vuelve
citables.

## Tabla de huellas

Una fila **por archivo realmente presente**. Es la que se consulta al recibir un adjunto. Crece
cuando entra un archivo nuevo; **una fila nunca se edita** — si un export cambia, es otro archivo y
otra fila.

| archivo | bytes | sha256 |
|---|---|---|
| `Informe 2026-07-31.zip` | 56.434.396 | `97310e16f49d2726e0b46d515f13d68d84f5ba13791c7bc57b05c8495e9a0ecb` |
| `Seguimiento Digital2026-08-06.zip` | 98.332.566 | `9a1ee89d0e0b0aa6619c5efa3cd9ee9409269ce44ff856523b9ed4bcbf76b2e9` |
| `Seguimiento Digital  2026-08-20.zip` | 78.942.640 | `f8ef3227fc6cc73ef5879948451093f8e7a278c0baf1f4341d187958f0f8cc87` |
| `Testigo 2026-08-22 1402 Informe semanal JM — vie 14_08 — jue 20_08.zip` | 11.935.542 | `cd6f0050f3f0cf5effdf54204c10f91f6fdb773a6e0c8a239d8d969efcd353b3` |
| ⭐ `Seguimiento Digital  2026-08-20.zip` **(editado a mano, 26/08)** | 91.643.439 | `15b564919ae4fa97dc7b17f6d6962749359ddbeef99d786d40457a090cc5650e` |
| ⭐⭐ `Seguimiento Digital 2026-08-28.zip` | 33.015.823 | `0ce0086d192bbb121c86dfe72434c40254c95c5153e8c43af9a39badfa81ac79` |

### ⭐⭐ Sexta fila — el primer fixture con las CINCO bases y el deck de la MISMA ventana (28/08/2026)

**Qué trae adentro**, seis archivos:

| archivo | qué es |
|---|---|
| `Base Looker (4).xlsx` | base `looker` |
| `Seguimiento Digital  (5).xlsx` | base `digital` |
| `M2 Reporte para Fede 2026 (5).xlsx` | base `m2` |
| `RDV JM CM ES + funcionarios (6).xlsx` | base `rdv` |
| `Base reuniones - Digital - Call Center (2).xlsx` | base `reuniones` |
| ⭐⭐ `Informe semanal JM - (21_08 al 28_08) Equipo parcial.pptx` | **el deck del EQUIPO de la ventana `21/08–28/08`** |

⭐⭐ **Por qué éste vale más que los anteriores: es la ventana que el motor acaba de generar.** Hasta
hoy el cruce *«definición → número publicado»* se hacía contra decks de julio o del 20/08, o sea
contra semanas que ya no son las que se está tocando. Acá **las cinco bases y el deck del equipo son
del mismo día y de la misma ventana que la corrida del 27/08**, así que los números de `L-034` —los
`ecv_*`, los `imp_*` mudados al desglose, el mail que salió `sin dato`— se pueden cruzar contra lo
que el equipo publica **sin conectarse a nada**.

⭐ **Y trae `reuniones` con su nombre reconocible**, que es la base que estuvo tres días en disco
tratada como inexistente por buscarla por nombre. La regla no cambia —**la firma de un fixture es su
lista de solapas, nunca el nombre del archivo**— pero acá los dos coinciden.

⚠ **`Equipo parcial` está en el nombre y hay que leerlo:** el deck **no está terminado**. Una caja
vacía ahí es *«el equipo todavía no la llenó»* y **no** *«el equipo publica vacío»* — son dos cosas
distintas y sólo una sirve como testigo. Antes de citar una celda de este `.pptx` hay que mirar si
está poblada, no deducirlo de que exista la caja.

⚠ **Y es una foto del 28/08**, con todo lo que eso implica: `looker/DIGITAL` y el desglose son
**inestables por CAMBIO** (`R-31`), así que un número medido acá responde por el 28/08 y por ningún
otro día.

### ⭐⭐ Quinta fila — el `.zip` del 20/08 EDITADO A MANO, 26/08/2026

⚠ **Es la primera fila de esta tabla que NO es una foto de Drive**, y por eso lleva la marca en el
nombre. La fila vieja **no se editó** —un export que cambia es otro archivo y otra fila, como dice el
encabezado de la tabla—, así que las dos conviven y el `sha` dice cuál es cuál.

| | antes | después |
|---|---|---|
| bytes | 78.942.640 | **91.643.439** |
| `sha256` | `f8ef3227…f0f8cc87` | **`15b56491…0cc5650e`** |
| archivos adentro | 7 | **8** |

**Quién y qué:** lo reemplazó **el usuario** el 26/08/2026. Declaró haber cambiado **únicamente los
encabezados de `Agenda JM | Post`** (base `reuniones`), para que cada bloque tenga títulos únicos
—`Impresiones Meta`, `Impresiones Google`, `Impresiones Programmatic`… en vez de tres `Impresiones`
repetidas—. **Los datos no se tocaron.**

⭐ **Verificado el 26/08:** los **29** encabezados de `Agenda JM | Post` en el fixture coinciden
**uno a uno** con los que devuelve `leerFuente` sobre la base viva. La edición está completa de los
dos lados.

⚠ **Y una diferencia que el usuario no declaró y hay que anotar igual: el `.zip` se REPAQUETÓ.**
Ahora trae **8** archivos en vez de 7 — absorbió el `Testigo 2026-08-22 1402 Informe semanal JM — vie
14_08 — jue 20_08.pptx`, que hasta hoy vivía como `.zip` suelto (la cuarta fila de la tabla, que
sigue existiendo). Eso explica los **+12,7 MB**, no la edición de encabezados. **No es sólo una
edición de encabezados: es un repaquetado con una edición adentro**, y las dos cosas cambian el
`sha` por motivos distintos.

⭐ **Lo que esto le hace a la lectura de un resultado, y es el motivo de escribirlo:** *«el fixture
no reproduce»* dejaba de significar una sola cosa. Contra una foto de Drive apunta a la fuente o al
motor; contra un archivo editado a mano, **la edición es una tercera causa candidata**, y el reporte
que lo cite tiene que poder distinguirlas. Por eso la fila lleva la marca y no sólo el `sha` nuevo.

✅ **Lo que NO cambia:** como sólo se tocaron encabezados, **la comparación fixture-contra-viva
sigue valiendo para los valores**. Es lo que habilitó la validación 1 a 1 de `L-053` del 26/08.

⚠ **La identificación por SOLAPAS se rehizo sobre el archivo nuevo** y sigue dando 100 %, con
margen: `DGPLES _ Seguimiento ECVs (1)` → `reuniones` **24 de 24** (segundo candidato: 1),
`Seguimiento Digital  (4)` → `digital` **22 de 22** (segundo: 5), `Base Looker (3)` → `looker`
**14 de 14** (segundo: 1), `M2 Reporte para Fede 2026 (4)` → `m2` **12 de 12** (segundo: 5),
`RDV JM CM ES + funcionarios (5)` → `rdv` **34 de 36** (segundo: 1).

⭐ **La cuarta es de otra clase y conviene decirlo: NO es un export de una base, es un DECK DEL MOTOR.**
Es la salida de la corrida de `jm` de las 14:02 del 22/08 sobre `agosto_14_20`, con `R-21` nivel 1 ya
implementado. Entra a esta carpeta por el mismo motivo que los otros —**para poder citar contra qué se
midió**— y se registra igual: sin huella, un deck del motor es indistinguible del de la corrida anterior,
y esta semana hubo **siete**. Su par de comparación es el deck del equipo que viaja adentro del zip del
20/08.

⚠ **Y por eso su nombre lleva la hora**, no sólo la fecha: dos corridas del mismo día son dos archivos
distintos y el nombre tiene que poder separarlos.

⚠ **La tercera se registró el 21/08, después de usarla y antes de citar un solo número.**
Llegó sin huella, y un archivo sin huella es **anónimo**: nada lo distingue del export que le
sigue dos días después, y los dos se llaman casi igual. De ella salen las letras de columna de
`SEED_MAPEO_DESGLOCE_` y la reproducción de `V-21`…`V-26`. **Trae los siete archivos del día,
incluidos los dos decks** — `Informe semanal JM - (14_08 al 21_08).pptx` y
`Seguimiento SECCO - SSCDI (21-08) .pptx`.

⚠ **Y el sha ya sirvió para algo en su primer uso:** los dos archivos de arriba son **idénticos byte
a byte** a `Plan Inicial/_archivo/samples/Informes ejemplo/Informe 2026-07-31.zip` y
`…/Seguimiento Digital2026-08-06.zip`, que están en el repo local —ignorados por git— desde el
03/08 y el 06/08. **Los dos primeros fixtures ya estaban archivados hacía dos semanas y nadie lo
sabía**, porque sin huella nada relacionaba una copia con la otra. Es el argumento de esta tabla,
hecho con la tabla misma.


### Verificación del 20/08/2026 — la tabla está exacta, y no hizo falta agregarle una fila

Medido por `2026-08-20_3` Parte 0, con `sha256sum` sobre los dos archivos:

| categoría | cuántos |
|---|---|
| **coincide** — en disco, con fila, sha idéntico | **2** |
| **está en disco sin fila** | **0** |
| **tiene fila y no está** | **0** |

**La afirmación de identidad de la sección de arriba también se verificó**, y es cierta: los dos
archivos de esta carpeta y sus copias en `Plan Inicial/_archivo/samples/Informes ejemplo/` dan los
mismos dos shas. Cuatro archivos, dos huellas.

---

## Qué trae cada fixture por dentro — medido, no citado

Sale de leer `xl/workbook.xml` de cada `.xlsx` con la biblioteca estándar. **Sólo nombres de
solapa**: ningún dato de ninguna celda se copió acá, ni hace falta.

**`Informe 2026-07-31.zip`** — 8 archivos: las **cuatro** bases y **dos decks**.

| archivo | solapas |
|---|---|
| `Base Looker.xlsx` | **14** · `resumen_metricas_dinamico` `resumen_metricas` `Cuentas` `MAIL` `IVR` `SMS` `CC` `DIGITAL` `ALCANCE` `URLs` `Desglose Alcance` `Audiencias` `Audiencias Conectadas` `Desplegables` |
| `Seguimiento Digital.xlsx` | **22** · `Digital` `Filter unificado` `EDV` `Cuentas` `Directa Mail` `Directa IVR` `Directa SMS` `CAMPAÑAS_DESGLOCE_DIGITAL` `Seguimiento digital` `m2 digital` `Digital 2026 acumulado` `Buscador por periodo digital` `Buscador por periodo directa` `Mail per` `Alcance` `RDV` `Nomalización de barrios` `RDV JM 2 VECES` `Metricas informe` `INFORME` `Limpia Fun` `Barrio Hab` |
| `M2 Reporte para Fede 2026.xlsx` | **12** · `Cuentas` `Cuentas M2` `Directa mail` `Digital acumulado` `Seguimiento digital` `CAMPAÑAS_DESGLOCE_DIGITAL` `Alcance` `M2 Directa` `M2 digital` `M2 periodo DIGITAL` `M2 periodo DIRECTA` `Mail per` |
| `RDV JM CM ES + funcionarios.xlsx` | **36** · incluye `RVD JM-CM - ES`, `RDV CONJUNTO`, `Agenda`, `RDV_otros_ministros`, `Comunas`, más 14 pivots y copias de trabajo |
| `Informe semanal JM (24-07 al 31-07) .pptx` | **30 láminas** |
| `Seguimiento SECCO - SSCDI (31-07).pptx` | deck SECCO |

**`Seguimiento Digital2026-08-06.zip`** — 4 archivos, **sin `Base Looker`**: `Seguimiento
Digital.xlsx`, `M2 Reporte para Fede 2026.xlsx` y `RDV JM CM ES + funcionarios.xlsx` con **las
mismas solapas** que en el otro zip, más el deck SECCO 07/08.

⭐ **El deck se abre igual que las bases, y eso es lo que hace útil a esta carpeta.** Un `.pptx` es
un `.zip`: el texto de cada lámina sale de `ppt/slides/slideN.xml` con la biblioteca estándar.
Verificado sobre el JM 24-31/07 — **30 láminas, 12.600 caracteres**, y la lámina 17 (la de `X-19`)
trae 88 runs de texto, **40 con dígitos**. **La base y el número publicado que salió de ella están
en el mismo archivo, del mismo día**: ése es el cruce que el camino del fixture hace y ningún otro
puede.

### ⚠ La cobertura tiene fecha, y no es la misma para todas las bases

| base | qué fechas hay en disco |
|---|---|
| `looker` | 31/07 **y 20/08** |
| `digital` · `m2` · `rdv` | 31/07 · 06/08 **y 20/08** |
| ⭐ `reuniones` | **20/08** — ver la corrección de abajo |

### ⭐⭐ Corrección del 24/08/2026 — `reuniones` SÍ tiene fixture, y lo tenía hace tres días

**Esta tabla decía `reuniones` → «ninguna», y era falso.** El `.zip` del 20/08 trae **seis
archivos**, y uno es la base de reuniones con **otro nombre**:

| archivo dentro del `.zip` | qué base es |
|---|---|
| `Base Looker (3).xlsx` | `looker` — **14** solapas |
| ⭐ `DGPLES _ Seguimiento ECVs (1).xlsx` | **`reuniones`** — **24** solapas, entre ellas `Agenda JM`, `Agenda JM \| Post`, `Base_Digital`, `Total` |
| `Seguimiento Digital  (4).xlsx` | `digital` |
| `M2 Reporte para Fede 2026 (4).xlsx` | `m2` |
| `RDV JM CM ES + funcionarios (5).xlsx` | `rdv` — 36 solapas |
| `Informe semanal JM - (14_08 al 21_08).pptx` · `Seguimiento SECCO - SSCDI (21-08) .pptx` | los dos decks del equipo |

⚠ **Por qué nadie se enteró, y es la lección que sobrevive al caso:** `BASES.reuniones.nombre` dice
**`Base reuniones - Digital - Call Center`** y el archivo se llama **`DGPLES _ Seguimiento ECVs`**.
Son el mismo `sheet_id` y **ningún nombre se parece al otro**, así que buscar el fixture por el
nombre de la base da cero. Es la familia de *dos cosas que se llaman igual no son la misma cosa*
(`CLAUDE.md` §4), en su forma inversa: **la misma cosa con dos nombres distintos**.

⭐ **La forma barata de no repetirlo: mirar las SOLAPAS, no el nombre del archivo.** Un `.xlsx` es un
`.zip` y `xl/workbook.xml` lista los nombres de solapa con la biblioteca estándar; contra
`SEED_SOLAPAS_` la base se identifica sola. Costó tres días de creer que `reuniones` no era
verificable.

#### El cruce completo, 24/08 — 19 archivos, **un solo** desalineado

Pedido del usuario tras el hallazgo: cruzar los `.xlsx` de **todos** los `.zip` contra `BASES`.

| | |
|---|---|
| archivos `.xlsx` en los 6 `.zip` (incluidos los dos de `Plan Inicial/_archivo/`) | **19** |
| matchean por **nombre de archivo** contra `BASES.nombre` | **18** |
| ⚠ **no matchean por nombre** | **1** — `DGPLES _ Seguimiento ECVs (1).xlsx` |
| matchean por **lista de solapas** contra `SEED_SOLAPAS_` | **19 de 19, al 100 %** |

⭐ **El desalineado es uno solo y ya está identificado.** Los otros cinco libros —`Base Looker`,
`Seguimiento Digital`, `M2 Reporte para Fede 2026`, `RDV JM CM ES + funcionarios`— llevan el nombre
que `BASES` les da, con un `(n)` de descarga al final que se saca con una regex.

⛔ **Y una premisa que hay que corregir, porque cambia cómo se hace este cruce: el `.xlsx` NO trae
el `sheet_id` adentro.** Se midió: cero rastros en `docProps/app.xml`, `core.xml` y `custom.xml` de
los 19 libros. **Un export de Google Sheets pierde el id del documento**, así que *«matchear por
`sheet_id`»* no es una operación disponible sobre un fixture — la pregunta se contesta por otro
lado.

⭐⭐ **Lo que sí identifica una base es su lista de SOLAPAS**, y el margen es lo que lo hace
confiable: `DGPLES _ Seguimiento ECVs` da **24 de 24** contra `reuniones` y **1 de 9** contra el
segundo candidato. No es un empate que haya que desempatar — es una firma.

**Lo que esto destraba, medido el 24/08:** el `MAPEO` de `reuniones/Agenda JM | Post` pasó de 2
campos a 7, con letras, encabezados y tipos **medidos** en vez de supuestos — y con tres identidades
internas exactas (`% VTR = M/J` en 98 de 98, `% Cobertura = G/F` en 89 de 89, `% CTR = K/J` en 98 de
98). **Los seis casos que la fila vieja decía que esperaban un archivo** —`C-53`, `C-63`, `A-12`,
`A-14`, `A-15`, `X-23`, entre ellos los tres de `enc_alcance`— **ya tienen contra qué medirse**; que
se cierren es otro trabajo, pero dejaron de estar bloqueados por falta de fixture.

### ⚠ El «ocho» del título de la sección de arriba no se puede verificar

Viene textual de la §8 del handoff del 19/08 —*"Ya son ocho archivos"*—, pero la tabla tiene
**cinco filas** que cubren **nueve archivos** si se desglosan los *"sueltos del 14/08"*. No cambia
nada operativo; **no citar el «ocho» como conteo**.

## Los decks que viven en Drive se listan por ID, no se bajan

No tienen bases propias asociadas, así que no son fixtures: son la contraparte publicada contra la
que se mide. Se citan por ID y se leen con el conector de Drive.

- **JM 19/06–26/06** — `1Y_2TWYmkxOdUZQZMVVU-DW3roShbbXf7DUq6k-yMcXI`
- **JM 31/07–07/08** — `10hoJur_ACZW2eqyJE6WGskIRiQrCFGbChR_PBYohHJU`

**Alcanzados los dos, verificado el 20/08/2026.** El conector devuelve el texto **por lámina, con
la numeración puesta** (`# 7 of 27`) y las tablas renderizadas, así que un número publicado se lee
y se cita sin bajar el archivo. El primero pesa 10,4 MB y es de `seguimientoydatos@gmail.com`; el
segundo 65,8 MB, de `sabai.deco.arg@gmail.com`, compartido el 14/08.

### ⚠ Una asimetría de credenciales que conviene tener escrita

Al verificar lo de arriba quedó claro que **no hay una credencial, hay dos**, y alcanzan cosas
distintas:

| camino | qué alcanza |
|---|---|
| `tools/token.js` (el Bearer de `clasp`) | scopes `drive.file` + `drive.metadata.readonly`, **sin `spreadsheets`** — de ahí que llegue a la planilla de control y no a una base ajena |
| **el conector de Drive** | los dos decks… **y también la planilla viva de una base** |

`BASES.looker.sheet_id` devolvió metadata de la planilla real —*Base Looker*, de
`dgples.comunicacion@gmail.com`, compartida el 28/07—, así que la frontera *"Code no llega a las
bases"* es **más movible de lo que se venía suponiendo**.

⚠ **Y acá está la parte deliberada: NO se probó si el conector lee el CONTENIDO de esa base, sólo
su metadata.** Son dos cosas distintas —*un test puede acertar el hecho y errar la inferencia*— y
la prueba **no se va a hacer**: leer el contenido volcaría nombres de vecinos, barrios y volúmenes
de envío a una conversación, que es exactamente lo que `C-21` decidió evitar cuando eligió dejar
los fixtures fuera de git.

**Esto queda anotado y NO es un pendiente** (decisión del usuario, 20/08/2026). Los caminos de
verificación son **tres** y el de la base viva no es uno de ellos. Si algún día cambia el criterio
de privacidad, esta nota dice qué habría que medir primero y por qué no se midió.

---

## El riesgo que se acepta, escrito antes de que pase

La salida elegida deja los fixtures **fuera de todo respaldo versionado**. Si esta carpeta se
pierde —disco, sincronización de OneDrive, borrado a mano—, **los 104 casos `exacto` dejan de ser
reproducibles** y este índice sólo sirve para saber **exactamente qué se perdió**.

Eso no es un efecto colateral: **es la mitad de lo que se eligió**, y está acá para que se lea antes
del accidente y no después. La contrapartida es que ningún dato personal de un vecino de GCBA entra
a un repo público, que fue el criterio que decidió.

Las otras dos salidas siguen escritas en `docs/PENDIENTES_consistencia.md` y **no se borraron**: si
el riesgo cambia de tamaño, se vuelven a mirar.
