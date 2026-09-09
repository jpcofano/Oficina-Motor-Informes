# Medición — La columna «Envío» de `L-047` no tiene camino declarativo, y `L-034` publica `/////` sobre tokens que sí resuelven

**Fecha de lectura:** 2026-09-08. **Congelado** — evidencia fechada, no se edita.
**Origen:** `docs/Prompts/2026-09-08_7_todo_de_un_tiron.md` §3.1, Parte de medición sobre disco.
**Contesta** los gates `G1` y `G2` de ese prompt, y su punto 1 —*«el desenlace que MANDA PARAR»*—.

⚠ **Esto mide sobre `docs/_fixtures/` y sobre un deck del motor. NO reemplaza a una corrida:**
el fixture dice qué decía el dato el día que se exportó, y el deck dice qué publicó **esa** corrida.

---

## 0 · Procedencia — las huellas, verificadas ANTES de citar ningún número

| qué | dónde | `sha256` | verificado |
|---|---|---|---|
| `digital` = *Seguimiento Digital* | `docs/_fixtures/Seguimiento_Digital_2026-08-30.xlsx` | `d7b917f5711dcdd7…3edf70d6a` | ✅ contra la tabla de huellas |
| deck testigo del **22/08** (`agosto_14_20`) | `docs/_fixtures/Testigo 2026-08-22 1402 …zip` | `cd6f0050f3f0cf5e…9efcd353b3` | ✅ contra la tabla de huellas |
| ⭐ deck del motor del **08/09 21:23** (`julio_24_30`) | `Downloads/Informe semanal JM — vie 24_07 — jue 30_07 (9).pptx` | `dfdaf6c13622dbc9…52f9fc27bb` | ⛔ **sin fila en la tabla** — es de hoy y llegó sin huella declarada; el `sha` es el calculado al recibirlo |
| configuración | `docs/_snapshots/*_2026-08-31.tsv` | — | ⚠ del **31/08**: la hoja se movió después (las tres `cc_*` entraron el 08/09) |

⚠ **Los dos lectores.** El `.xlsx` se leyó con `tools/leer_xlsx_por_referencia.py` **y** con
`openpyxl`, y los dos coinciden: **2.413 filas de dato, 25 encabezados**, y las distribuciones de
`G` y `T` idénticas. Es la condición del `README.md` de `_fixtures/`, y los dos **fallan distinto**
—uno resuelve la referencia de celda, el otro la posición—.

---

## 1 · ⛔⛔ `G1` NO PASA — ninguna de las 25 columnas trae el ámbito

`D1` decidió que la columna **Envío** publique `JM` para el mail de Jorge Macri y `GCBA` para
cualquier otro. `MARCADORES` no traduce un valor a otro: una fila `FILA` publica **lo que la celda
dice**, así que el camino existe sólo si alguna columna trae literalmente ese valor.

### 1.1 · El barrido, con el cero declarado

| | |
|---|---|
| columnas barridas | **25** (`A`…`Y`) |
| filas de dato | **2.413** |
| ⛔ columnas con `JM` / `GCBA` **literal** | **0** |
| columnas que **particionan** por remitente JM | **1** — `G`, `Mail remitente`, o sea **el mail crudo** |

⭐ **El cero va con su denominador al lado a propósito:** *«no hay»* y *«no miré»* se ven idénticos
en un log sin conteo (`CLAUDE.md` §4).

### 1.2 · `mail_area` (col `T`) era la candidata, y NO discrimina

`MAPEO` declara `digital|Directa Mail|mail_area → T (Área)`. Medido, trae **24 áreas de gobierno**,
no ámbitos — y Jorge Macri aparece en **tres de ellas**:

| `Mail remitente` | `Área` | filas |
|---|---|---|
| ⭐ `jorge.macri@buenosaires.gob.ar` | Jefatura de Gobierno | 191 |
| ⭐ `jorge.macri@buenosaires.gob.ar` | Seguridad | 94 |
| ⭐ `jorge.macri@buenosaires.gob.ar` | Salud | 15 |
| `baparticipacionciudadana@…` | **Jefatura de Gobierno** | 12 |

⛔ **Falla en las dos direcciones**: JM se reparte en tres áreas, y *Jefatura de Gobierno* **no es
exclusiva de JM**. No es una columna de ámbito con otro nombre — es otra cosa.

### 1.3 · Qué trabajo manda a hacer, y es la mitad que importa

⭐ **El hueco NO es de configuración.** Si hubiera una columna con `JM`/`GCBA` sin declarar, lo
destrabaría un alta de `MAPEO` y sería trabajo de una tarde. **No la hay** ⇒ lo destraba el equipo
(`C-01`, la plantilla y la base son de ellos), agregando la columna o aceptando otra salida.

⛔ **Y por eso NO se cablea el mail crudo como salida de compromiso.** Llenaría el hueco publicando
algo que el equipo no publica, y **un hueco que parece cerrado es peor que un hueco**: el `/////`
de hoy manda a trabajar, un mail publicado no manda a nada.

⚠ **Consecuencia declarada:** `camp_env1_rem` **ya existe y no se toca**, así que la fila 1 de la
tabla **sigue publicando `jorge.macri@buenosaires.gob.ar`** y las otras cuatro siguen en `/////`.

---

## 2 · ✅ `G2` — `camp_env4_fecha` está en la plantilla, y se midió desde el deck

La tabla de `L-047` en el deck del 08/09, leída **como tabla** y no como texto plano:

| fila | Envío | Fecha | Audiencia | Enviados |
|---|---|---|---|---|
| 1 | `jorge.macri@buenosaires.gob.ar` | 28/08 | Geo 1800 mts… | 122.473 |
| 2 | `/////` | 29/08 | Barrios Priorizados… | 146.451 |
| 3 | `/////` | 02/09 | No apertores… | 178.221 |
| ⭐ **4** | `/////` | ⭐ **`/////`** | `-` | `-` |
| 5 | `/////` | `-` | `-` | `-` |
| GLOBAL | | | | 444.403 entregados |

⭐ **La fila 4 trae `/////` en Fecha y la 5 trae `-`.** Un `/////` sólo lo emite un token
**presente y sin fila**; si las llaves no estuvieran, la celda saldría vacía. ⇒ el token existe en
la plantilla viva, que es exactamente lo que `D2` declaraba. Y coincide con el snapshot:
`camp_env1/2/3/5_fecha` tienen fila, `camp_env4_fecha` no.

✅ **Identidad interna que cierra**: 121.789 + 145.744 + 176.870 = **444.403**, el GLOBAL. Los tres
envíos poblados son todos los que hay.

⚠ **Sobre *«las dos plantillas»*, que el prompt exigía:** el repo lo desmiente. Los **220**
marcadores de `MARCADORES` son `informe_id = jm`, `camp_env1..5_fecha` incluidos. Un gate que
exigiera `secco` sólo podría fallar. El gate **exige `jm` y reporta `secco`**.

---

## 3 · ⛔⛔ `L-034` — el desenlace que MANDA PARAR

El prompt lo anticipaba y se confirmó: **la lámina 5 usa los MISMOS nombres que la 2** —el censo
del 22/08 lo dice: *«lámina 5 · L-034 — 6 de 31 sin fila: alcance, `cc_base`, `cc_contact_pct`,
`cc_contactados`, clics, periodo»*—. Esas tres **ya tienen fila** y **publican en `L-031`**.

### 3.1 · La misma lámina, dos corridas

| casillero de `L-034` | deck **22/08** (`agosto_14_20`) | deck **08/09** (`julio_24_30`) |
|---|---|---|
| Impresiones | **28.988.260** | ⛔ `/////` |
| Mails entregados | **538.276** | ⛔ `/////` |
| Aperturas (OR) | **210.707 (39.1%)** | ⛔ `///// (/////%)` |
| Atendidos | **`-`** | ⛔ `/////` |
| Base llamada · Llamados Contactados | `/////` | `/////` |
| Clics · *Audiencia Alcanzada | `/////` | `/////` |
| Escucharon +75% · Marque 1 | `- (-%)` · `-` | `- (-%)` · `-` |
| Barrios impactados | `/////` ×3 | ✅ San Cristóbal · Villa Riachuelo · `-` |

Y en el **mismo deck del 08/09**, `L-031` publica **6.011 · 1.878 · 31.2 %**.

### 3.2 · Por qué esto NO se explica por el dato ni por una corrida cortada

⭐⭐ **`-` → `/////` es la prueba limpia.** `textoFaltante_` (`Generador.gs`) es explícita: `-` es
*«se preguntó bien y la respuesta fue vacía»* (`sin_datos`) y `/////` es *«no hay fila, o no se
resolvió»*. **Un cambio en el dato no puede mover un token de un símbolo al otro.**

⛔ **Y no fue un corte por presupuesto.** Desde el 20/08 un tramo no alcanzado deja el token
**crudo** —`Desatendida.gs`: *«tapar sus crudos con `/////` diría "nadie lo cableó"»*—, y el mismo
deck lo muestra: las láminas 21, 22 y 24 traen `{{camp_resp_insight}}`, `{{m2_clics_a}}`,
`{{rrss_*}}`. **`L-034` no está cruda: está resuelta a `/////`.**

### 3.3 · La causa candidata, nombrada como candidata

`D-47` (27/08) hace que el universo del temario sea **de la lámina**, y que un token compartido
entre láminas de universos distintos **se resuelva una vez por lámina**. `CIERRE_POR_LAMINA.md` lo
dejó escrito como *«sin verificar contra un deck»* **y declaró qué esperaba**:

> ⚠ *«Y lo esperable en `L-034` no es otro número: es SIN DATO.»*

⭐ **Salió `/////`, no `-`.** La resolución por lámina ocurre y **devuelve nada**, así que
`textoFaltante_(!resultado)` cae al símbolo más ruidoso — que es la regla correcta ante ausencia de
información, y acá **miente sobre la causa**: manda a cablear tokens que ya están cableados.

⛔ **Es exactamente la familia del `/////` que no distinguía sus causas** (`CLAUDE.md` §4), un
escalón más adentro: no es *«no se llegó»* contra *«nadie lo cableó»*, es **«se resolvió por lámina
y no devolvió nada»** contra *«nadie lo cableó»*.

### 3.4 · Lo que esto NO dice

⚠ **No mide si `D-47` es correcto**, sólo que su salida en esta lámina no es la declarada.
⚠ **Las dos corridas son de períodos distintos** (`agosto_14_20` y `julio_24_30`) y de dos
temarios distintos. Eso explica que los **números** cambien; **no** explica un cambio de símbolo.
⚠ **No se escribió ninguna fila de `L-034`**, y ése es el punto: un token que existe y no resuelve
no se arregla con una fila nueva — se taparía el síntoma.

---

## 4 · El sexto envío que se pierde, con su número

`opFILA` con `valor_fijo` 1..5 alcanza **cinco** envíos. Medido sobre la solapa entera del fixture:

| envíos por `ID Cuentas` | cuentas |
|---|---|
| 1 a 5 | 946 |
| ⛔ **6 o más** | **38** |
| | **filas que hoy no tienen casillero: 368** |

Las mayores: `1942-SEPEPHGC` con **60**, `1946-SEPEPHGC` con **48**, `2033-SEPEPHGC` con **41**.

⚠ **Es la SOLAPA ENTERA, no la ventana de un informe.** El recorte real depende de `CAMPANAS`
viva, que no se puede leer desde disco. ⭐ **Para la corrida del 08/09 el problema no muerde:** su
campaña trae **3** envíos, y los tres publican.

---

## 5 · Lo que queda abierto y esta medición no toca

`cc_campanias` y `gcba_cc_campanias` (`C-112`, cuatro candidatas) · el `%` de agosto sin testigo
(`C-116`) · si `Remitente` es **necesario** o sólo suficiente (`C-117`) · el **grano temporal** ·
el sexto envío · la cobertura de `L-036` que no cierra.
