# Handoff — rama de validación de números · 19/08/2026

Reemplaza `HANDOFF_validacion_2026-08-12.md`. Para la conversación nueva que opera como
**verificador de números del informe**. No escribe prompts, no toca el motor, no diseña.
**Mide contra los fixtures y produce filas de CSV.**

---

## 1 · Qué es esta rama y qué no

**Hace:** abrir los exports, medir un número publicado contra la base, y escribir el caso en
`docs/casos_validacion.csv`. Un número sin caso numerado **no está validado**.

**No hace:** escribir prompts para Code, decidir cableados, tocar nada fuera de `docs/`. La rama de
código construye el sistema; ésta sólo verifica.

**Herramienta:** `openpyxl` con `read_only=True, data_only=True` para xlsx, `python-pptx` para los
decks locales. Los decks que están en Drive se leen con el conector de Google Drive
(`read_file_content`), **no** con `web_fetch` — éste rechaza URLs que no vinieron de una búsqueda
previa. El texto de Drive no trae coordenadas: el pareo plataforma↔valor sale por orden de lectura,
que es más frágil que el de los `.pptx` locales. Decirlo cuando se usa.

**Repo:** `https://github.com/jpcofano/Oficina-Motor-Informes` — público, clonable.

**CSV vivo:** `casos_validacion.csv`, **sin fecha en el nombre**. Es el archivo que se pisa a sí
mismo. Los tres anteriores (`_2026-07-31`, `_2026-08-09_addendum`, `_2026-08-12_addendum`) quedaron
**derogados y hay que borrarlos del repo**: contienen versiones viejas de casos que después se
corrigieron.

**218 casos. Próximos libres: `V-103`, `C-69`, `A-16`, `S-02`, `X-28`.**
Series: `V` verificado · `C` cerrado/estructural · `A` abierto arquitectónico · `S` supuesto
confirmado · `D` derivado · `X` contradicción o anomalía.
Estados en uso: `exacto`, `aproximado`, `deriva`, `abierto`, `cerrado`, `contradice`, `corrige`,
`retractado`, `sin_datos`, `sin_fuente`.

**Dos anomalías del CSV que hay que conocer antes de tocarlo:** `X-06` a `X-09` son filas vacías en
`retractado` reconstruidas para que el hueco sea visible (las retiró `V-53` borrándolas; el
contenido no se conservó). `C-10` nunca existió y nadie lo cita — el hueco no se llena.

---

## 2 · Las dos reglas de la propia rama

**`C-55` · Un caso `exacto` cita la lámina.** `V-64`/`V-65`/`V-66` y `V-86` miden la misma cuenta
con valores distintos —6.011 contra 4.726— y los cuatro son correctos: uno es el resumen ejecutivo
(lámina 2, suma de dos filas) y el otro el iceberg (lámina 9, una fila). Sin la referencia de
lámina se leen como contradicción, y ya pasó una vez.

**`C-56` · Retirar un caso deja la fila, con estado `retractado` y la nota diciendo quién lo
retira.** El número no se reusa nunca.

Y una que salió de un error de esta ventana:

**`C-68` · Cuando una fila parece de otra campaña, leer la fila entera antes de concluir.** Esta
rama afirmó que `ID Cuentas` no aislaba la campaña porque `3305` tenía una fila llamada *Vacunación
Antirrábica*. Era falso, y la advertencia habría hecho filtrar por el campo equivocado. Lo corrigió
pedir las 25 columnas en vez de las cuatro que se estaban mirando. **Identificar por `ID Cuentas`,
desambiguar por `Nomenclatura` o `Mail remitente`, nunca por nombre libre.**

---

## 3 · El criterio temporal, y sus dos excepciones

**`C-25`** — si el fixture es anterior al deck, toda métrica acumulativa medida sobre el fixture
tiene que dar **menor o igual** que la publicada. Un valor mayor no se explica por el tiempo: es
error de universo.

**`C-26`** — hay dos tipos de fuente. **Inmutables** (un mail enviado tiene sus entregados fijos;
`rdv` es tipeado a mano): ahí *exacto* significa algo. **Acumulativas** (`looker` suma impresiones
todos los días): *exacto* es imposible por construcción, **se valida la regla, no el número**.

**Dos columnas donde `C-25` NO aplica, y hay que saberlo antes de leer un desvío:**

- **`C-53` / `C-63` · `Alcance manual`** no es acumulativa. Publicado 31/07: 219.139. Base 12/08 y
  14/08: 157.580. Bajó respecto de lo publicado y después se quedó quieta. El nombre lo dice: es un
  valor tipeado.
- **Impresiones de Meta en convocatoria** — quedó como sospecha diferida, no confirmada. Ver `C-66`
  y `V-101` en la sección 7.

---

## 4 · El hallazgo que cambia cómo se leen todas las fuentes

### `C-64` · La base de reuniones tiene dos capas, y el patrón `X-16`/`X-17` era eso

- **Capa de filas:** `Base_mail`, `Base_IVR`, `Base_Call`, `Base_Digital` — una fila por envío, por
  llamado, por pauta.
- **Capa agregada:** `Agenda JM`, `Agenda JM | Post` — suma esas filas por cuenta.

**El deck a veces publica el agregado y a veces UNA fila de la capa de abajo.** Las solapas de
`looker` sólo conservan el agregado, así que el desajuste histórico entre "el conteo y la suma no
salen del mismo universo" era **información perdida, no un criterio raro**. Cerrado en tres canales:

| canal | caso | qué publica el deck |
|---|---|---|
| Call Center | `C-62` | *"2 campañas"* = las filas no vacías de `Tipo de llamado` |
| IVR | `V-98` | 107.194 y 96.549 = dos filas de `Base_IVR` de `3488-AGOJDGAG` |
| Mail | `V-99` | el iceberg publica **una** fila de `Base_mail` elegida por fecha de envío |

**Quedan por revisar con este mismo criterio: `pauta_*` y Alerta Naranja.** Son los dos ítems del
patrón que no se cerraron.

### Trampas de lectura ya medidas

- **`C-65` · `Base_Digital` no se lee por fila.** Son ocho listas pegadas lado a lado —Meta / Google
  / Programmatic Convocatoria, Alcance Meta Convocatoria, y los mismos cuatro para Post— cada una
  con su propia columna `ID Cuentas`. Los ids repiten dentro de una lista (351 de 920 en Meta
  Convocatoria). **Leer bloque por bloque y agregar por id, nunca por índice de fila.**
- **`C-54` / `C-60` · `looker/CC.Base enviada` llegó formateada como fecha** en el export del 31/07:
  `1914-09-30` es el serial 5.387. En el del 14/08 llega numérica. Es característica del export, no
  de la fuente — conservar la conversión como defensa de lectura.
- **`C-39` / `C-51` · `digital/Alcance` no está clavada por `ID Cuentas`**: 62 de 666 ids repiten.
  Son pares PRE/POST del mismo id, no ambigüedad, pero un join por cuenta tiene que saberlo.
- **`C-43` · 14 filas de `looker/DIGITAL` no tienen `Id cuentas`, y dos son dato publicado.** El
  bloque PRE de Retiro 24/07 está ahí (Meta 75.021/965 y DV360 284.353/430, exactos). El join por
  cuenta las tira en silencio.
- **`X-26` · `estado` se contradice entre solapas.** `looker/DIGITAL` da las campañas de Chacabuco
  y Almagro como `Activa`; `digital/Digital 2026 acumulado` las da como `FINALIZADA`. Los encuentros
  ya ocurrieron y los bloques PRE están congelados, o sea el dato se comporta como finalizada.

---

## 5 · Lo cerrado — no se vuelve a medir

### Reglas de selección

- **`R-15` · JM se identifica, GCBA sale por resta.** La columna cambia según la base: `Figura` en
  `rdv / RVD JM-CM - ES`; **`Mail remitente = jorge.macri@buenosaires.gob.ar`** en
  `digital / Directa Mail`; `Vocero` en `Directa IVR`; **`nombre_campaña` CONTIENE `JM`** en
  `looker / Cuentas` y `looker / DIGITAL`. `Directa SMS` no tiene columna: va entero a GCBA.
  **Verificado también fuera del resumen ejecutivo** (`V-102`, campaña destacada).
- **`R-17` · el temario selecciona, la ventana acota.** El encuentro se informa con un informe de
  retraso.
- **`R-20` · para fechas pasadas, `Realizada` y `en agenda` cuentan igual.**
- **`R-16 Addendum 1` · varias implementaciones, gana la que solapa la ventana.**

### La lámina de encuentro — operación confirmada, 4 de 4

**`C-50`** — la lámina es la unión de **dos campañas**, PRE (convocatoria) y POST (difusión), que
**comparten el mismo `ID` en dos solapas**. No hay una segunda cuenta que buscar. 152 ids en
`Agenda JM`, 102 en `Agenda JM | Post`, 98 compartidos.

| token | operación | casos |
|---|---|---|
| `enc_impresiones` | SUMA de las dos fases × plataformas | `V-80`, `V-81`, `V-93` |
| `enc_visualizaciones` | SUMA, **sólo POST** | `V-83`, `V-94` |
| `enc_clics` | **sólo PRE**, más el POST que tenga; valor directo en `Agenda JM.Clics totales` | `V-82`, `V-95` |
| `enc_alcance` | **NO es suma** — ver sección 6 | `A-09`, `A-13` |

Exactos en Caballito 29/07, N. Pompeya 31/07, P. Chacabuco 04/08 y Almagro 06/08.

### Embudo de Call Center — cerrado

**`V-90`** · `Base total` = `Base enviada` · `Base discada` = `Base barrida` · `Contactados` ·
`Efectivos`. Cierra `C-17` por el otro extremo.

**`V-91` / `C-59` / `S-01` · el corte de filas es por `Tipo de llamado`, con dos universos:**

```
enc_*  (iceberg)            → Tipo de llamado IN (Convocatoria, IVR convocatoria)
cc_*   (resumen ejecutivo)  → sin filtro de tipo
```

`S-01`: el Call Center hace la convocatoria del IVR, por eso esa fila alimenta la caja de Call
Center y no el bloque IVR. **Confirmado por el usuario**, no es tipeo de carga.
`C-62`: `cc_campanias` = CUENTA de filas con valores distintos de cero.

**`C-58` · los `cc_*` NO se cablean contra `Agenda JM`**: le falta la segunda fila de `3289` y trae
el bloque de Call Center de `3387` en cero mientras el deck lo publica. Siguen en
`looker/CC × Cuentas`. El embudo del iceberg sí va contra `Agenda JM`, con `REVISAR` cuando el
bloque venga en cero.

### Otras fuentes y operaciones validadas

| bloque | fuente | regla | casos |
|---|---|---|---|
| encuentros individuales | `rdv · RVD JM-CM - ES` | por `(Figura, Barrio, Fecha)` | `V-01`–`V-09`, `V-46`–`V-48`, `V-71`, `V-77`, `V-78` |
| `ecv_insc_digital` | ídem | **columna `RRSS`**, no la fuente digital | `V-09`, `V-40`, `V-85` |
| `ecv_insc_dif` | ídem, columna `Difusión` | **valor directo, NO se deroga** | `V-84` |
| ministros | unión de las dos solapas de `rdv`, `Figura != Jorge Macri` | 8 de 8 | `V-49`–`V-52` |
| mail JM / GCBA | `digital · Directa Mail` | `R-15` y su complemento | `V-53`–`V-58`, `V-75`, `V-102` |
| SMS | `digital · Directa SMS` | sin filtro de figura | `V-61`–`V-63` |
| iceberg completo | `reuniones · Agenda JM` | por `ID Cuentas` | `V-86`, `V-87` |
| M2 | `digital · Directa Mail` | `Tipo de mail` CONTIENE `M2` | `X-12` |
| alcance de campaña destacada | — | **NO se suma: se toma el de Meta** | `A-08` |
| frecuencia | — | **RATIO TRUNCADO** | `V-72`, `V-76`, `C-52` |

**`C-46` · alcance y clics no eran dos candidatas para lo mismo.** `looker/ALCANCE` tiene `Alcance`
y `Frecuencia` y **no tiene clics**; `looker/DIGITAL` tiene `Impresiones`, `Visualizaciones` y
`Clics` y **no tiene columna de alcance**. No había decisión de fuente que tomar.

**`C-44` · `m2_campanias` es una sola operación para los dos informes: `LISTA` + `CUENTA(LISTA)`.**
Los cuatro decks medidos publican lista y conteo, y el conteo siempre iguala las líneas. La premisa
del 03/08 —"conteo en `secco`, lista en `jm`"— es falsa. La palabra *Campañas*/*Proyectos* es texto
tipeado, no token. `C-45`: 30 distintos crudos == 30 normalizados, la normalización no tiene
consecuencia hoy.

### Aritmética confirmada, para no re-derivarla

| qué | operación |
|---|---|
| frecuencia de lámina de encuentro | RATIO **truncado** a un decimal (11,7 · 10,1 · 3,4). La celda de la base **no** trunca: trunca la plantilla (`C-52`) |
| porcentajes del iceberg | **redondeo**, no truncado (29,6→30 · 21,7→22) — `C-48` |
| `imp_total` / `contenidos_total` | SUMA de las tres plataformas |

**`C-47`** · el iceberg colapsa `Call Center` + `IVR` en una línea en el deck del 19/06
(183 = 136+47) y las publica separadas en el del 28/07. El desglose de canales no tiene mapeo fijo
columna→línea.

### Solapas que no sirven — `uso = ignorar`

`digital/Digital` (congelada, JM hasta diciembre 2025) · `CAMPAÑAS_DESGLOCE_DIGITAL` (JM hasta
17/04/2026) · `Mail per`, `Buscador por periodo directa`, `Buscador por periodo digital` (período
tipeado a mano) · `M2 periodo DIRECTA` (período tipeado, apuntaba a 03/07–10/07 en el export del
31/07) · `Metricas informe` e `INFORME` (`#REF!`) · `looker/Desglose Alcance` (**269 de 270 filas
son `2025 | Agosto`**, sólo facebook e instagram) · las seis solapas de `looker` sin fecha ni fila
en `MAPEO`.

**`looker/DIGITAL` es la excepción y no se ignora** (`C-19`).

---

## 6 · Lo abierto, en orden de valor

**a) `A-14` / `A-15` · `enc_alcance` sigue sin fuente medible, y no porque la hipótesis falle.**

`A-09`, confirmado **6 de 6**: el alcance publicado **nunca** es la suma de los dos `ALCANCE` que la
propia lámina imprime, y siempre es menor. Es reach deduplicado entre fases.

La base nueva tiene las dos columnas —`Agenda JM.Alcance manual` y `Agenda JM | Post.Alcance`—
pero **está incompleta**: `Alcance Meta Convocatoria` tiene 797 ids y `Alcance Meta Post` sólo **75**.
San Cristóbal sin POST, Retiro sin PRE, Caballito sin PRE. Suma PRE+POST contra publicado: **1 cierra
de 6** (Chacabuco, +0,4%). **No está refutado, está sin medir.** Se remide cuando la base esté
completa. El hueco lo llena quien carga.

**b) `C-61` · radio de impacto del alta de `Tipo de llamado`.** 244 de 940 cuentas tienen más de una
fila en `CC` y **229 mezclan tipos**. El cableado cambia el resultado en casi todas, no sólo en las
dos medidas. Ningún caso `exacto` vigente puede moverse.

**c) `C-22` sigue abierto, y `X-22` explica por qué.** La medición del recorte por punto quedó
numerada y **no se reprodujo**: dieciséis variantes de criterio sobre el export del 31/07 dan entre
2 y 10 cuentas en JM y entre 21 y 80 en GCBA, ninguna con los conteos ni las impresiones reportadas.
Puede ser otro export o otro corte JM. **El motor no se toca.** La conclusión de `C-22` igual
sobrevive: ninguna variante se acerca al 11,9 publicado.

**d) `X-18` · quién produce la agrupación editorial de M2.** 12 campañas publicadas contra 30
distintos crudos en la misma ventana; ninguna ventana reproduce los 26 envíos ni los 1.380.172
enviados. La lista publicada está agrupada a mano.

**e) `C-67` · los 25 entregados de `V-102`.** Descartadas las tres explicaciones baratas: no es
desfasaje (valores idénticos en los dos exports, y los entregados son inmutables por `C-26`), no es
fila faltante (no hay ninguna de 25 en la cuenta), no es el remitente (las cuatro filas dan
442.611). Residuo sin fuente.

**f) `C-20` · 22 filas de `looker/DIGITAL` con `estado` vacío.** Un vacío no es un valor — mismo modo
de falla que `R-20` resolvió. Ahora se junta con `X-26`.

**g) `A-06` / `A-07` · `imp_google` e `imp_prog` tienen el universo mal**, y `A-04` corrige a `A-03`:
`imp_prog` **no** es `Plataforma = DV360`, la regla es `!= Meta` y `!= Google ads`. Cablearlo como
`= DV360` pierde 82 filas en silencio.

---

## 7 · Errores en los decks publicados — no son del motor

- **`C-66` · Almagro 06/08, lámina 7.** El deck publica Meta convocatoria **150.180** impresiones y
  4.113 clics. Tres fuentes independientes del 14/08 —`Base_Digital`, `looker/DIGITAL` y
  `Agenda JM`, más una relectura de Code a las 22:50 UTC— dan **137.633** y 3.973. No existe ninguna
  fila de 12.547 impresiones que complete la diferencia.
  **Cerrado por el criterio del gemelo:** Parque Chacabuco 04/08, misma semana, misma lámina, misma
  estructura, mismas fuentes, reproduce exacto en los tres bloques. Si el método o la fuente
  estuvieran mal, el gemelo fallaría igual. No falla.
  La lámina es internamente consistente con 150.180 —las cinco cajas suman los 2.920.913
  publicados—, así que no se tipeó suelto: salió de una pasada donde ése era el valor.
  **`V-101` retiró la hipótesis de descuento retroactivo de Meta**: en una relectura sobre un libro
  refrescado catorce minutos antes, los cuatro bloques PRE dieron delta cero mientras los POST
  crecieron. La ventana fue de horas, no de días. **El usuario difirió la remedición** — `V-101`
  deja el valor de referencia con sello horario, así que se puede retomar cualquier día.
- **`X-27` · una fila cargada con el nombre de otra campaña.** `3305-JULSEGGJ`, `ID MailUp 26610`,
  envío del 20/07: `Nombre campaña | Directa` dice *Vacunación Antirrábica* mientras `Nomenclatura`,
  `Asunto`, `Tag Orion Mail` y `Nombre campaña | Cuentas` dicen Egreso de Cadetes. Un filtro por esa
  columna pierde 94.601 entregados en silencio.
- **`X-19` · lámina 17 del JM 24-31/07** publica `Frecuencia 8,4` pero `28.253.288/3.178.282 = 8,89`.
  Las otras tres campañas destacadas truncan bien a un decimal.
- **`X-25`** · cerrado, apunta a `C-66`.
- Ya estaban: **Quirós por Francisco Quintana** (SECCO 07/08, lámina 17) · **`41-350` con guión**
  donde la fuente trae `41350` · **la Alerta Naranja publicada era la de mayo** en un informe de
  agosto · **4 de 8 encuentros de ministros** publicados con estado `en agenda` o `Programado`.

---

## 8 · El material — y `C-21`, que sigue sin hacerse

**Los fixtures viven sólo en la máquina del usuario.** Ya son ocho archivos. Si se pierden, **los
104 casos `exacto` dejan de ser reproducibles.** Archivarlos en el repo con la fecha en el nombre,
aunque sea en `docs/_fixtures/`. Es la única tarea de esta rama que no se resuelve midiendo.

| fixture | contiene |
|---|---|
| `Informe_2026-07-31.zip` | `Base Looker`, `Seguimiento Digital`, `RDV`, `M2` + deck **JM 24-31/07** + deck SECCO 31/07 |
| `Seguimiento_Digital2026-08-06.zip` | `Seguimiento Digital`, `RDV`, `M2` — **sin `Base Looker`** + deck SECCO 07/08 |
| `Base_reuniones_-_Digital_-_Call_Center.xlsx` (12/08) | primera versión de la base de reuniones |
| `2026-08-14_Base_Looker.xlsx` | primer export con la columna `Tipo de llamado` en `CC` |
| sueltos del 14/08 | `Base_reuniones` (v2), `M2 Reporte para Fede`, `Seguimiento Digital`, `Base Looker`, `RDV` + deck **JM 08-14/08** |

**Decks en Drive, sin bases propias:**
- **JM 19/06–26/06** — `1Y_2TWYmkxOdUZQZMVVU-DW3roShbbXf7DUq6k-yMcXI`
- **JM 31/07–07/08** — `10hoJur_ACZW2eqyJE6WGskIRiQrCFGbChR_PBYohHJU`

**Nota que corrige el handoff anterior:** ya **no** hace falta el export de la semana 19–26/06 para
cerrar los `ivr_*`. El bloque IVR volvió a publicarse en el deck del 08-14/08 y se midió contra
`Base_IVR` (`V-98`, exacto). Los bloques del resumen ejecutivo son condicionales: aparecen si hay
datos (`C-31`, `C-38`).

---

## 9 · Lo retractado — no citarlo

- **`V-38` a `V-45`** — el 2445 no salió de ningún deck; lo midió esta rama con un rango elegido a
  mano y resultó ser la unión de dos universos. Deck = 2333, motor = 2307. `C-28`; `V-71` tiene el
  número correcto.
- **`A-02` y `A-03`**, reemplazados por `A-06` y `A-07`.
- **`X-06` a `X-09`**, retirados por `V-53`.
- **«`looker` es ilegible»** — falso. El fallo era una llamada con la ventana en texto donde
  `formatearFecha_` exige `Date`.
- **«la lámina 6 falla por la ventana»** — falso. `digital` es `snapshot` y la ventana no interviene.
- **«`ID Cuentas` no aísla la campaña»** — falso, dicho por esta rama el 19/08 y corregido en
  `C-68` el mismo día.

---

## 10 · Por dónde seguir

1. **`pauta_*` y Alerta Naranja** contra la capa de filas de la base de reuniones (`C-64`). Son los
   dos ítems del patrón `X-16`/`X-17` que quedaron sin cerrar, y ahora hay un método que funcionó
   en tres canales.
2. **`A-14`** cuando la base de reuniones tenga la fase POST cargada en más de 75 cuentas.
3. **El deck de la semana siguiente** contra las cinco bases, como se hizo con el 08-14/08.
4. **`C-21`**, que no depende de medir.

Diferido por decisión del usuario: la remedición de los bloques PRE de Meta (`V-101`).

---

## Addendum 1 — 19/08/2026 · el CSV lleva fecha

**Deroga la regla de nombre de la §1.** Ahí dice que el CSV vivo se llama
`casos_validacion.csv`, sin fecha, y que se pisa a sí mismo. Queda sin efecto: **cada corrida
de validación produce su propio CSV fechado**, `docs/casos_validacion_AAAA-MM-DD.csv`, congelado
al entrar. El de esta ventana es `docs/casos_validacion_2026-08-19.csv`, 218 casos.

Motivo: `CLAUDE.md` §7 ya declaraba dueño de la pregunta *"¿qué número dio una medición y contra
qué se verificó?"* a `docs/VALIDACION_*.md` **+ su CSV de casos — congelados, uno nuevo por
corrida de validación, nadie edita**. La §1 decía lo contrario. Un archivo que se pisa a sí mismo
no deja rastro de cuándo se midió cada caso, que es justo lo que la serie necesita para que un
`exacto` siga significando algo dentro de seis semanas.

**Lo que sigue valiendo de la §1:** las series, los estados, los próximos IDs libres, las dos
anomalías (`X-06`–`X-09` vacíos en `retractado`; `C-10` nunca existió). **El próximo `D` libre es
`D-07`** — la §1 lo omite.

**Los tres CSV anteriores no se borran.** Ya están en `Plan Inicial/_archivo/docs/` desde el
commit `f19f637` del 14/08, que es donde corresponde: son evidencia congelada, no versiones a
eliminar. La §1 pedía borrarlos; queda sin efecto por el mismo motivo.

**Cadena:** este handoff sigue siendo el vigente de la rama. El addendum corrige una premisa
propia, no lo reemplaza.
