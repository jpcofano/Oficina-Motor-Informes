# Medición 3 — El corte por `Id cuentas` contra el criterio vivo del motor

⛔⛔ **Primera línea, porque cambia cómo se lee todo lo demás: esto resuelve el CORTE y no resuelve
el GRANO TEMPORAL.** Ninguna de las dos solapas guarda impresiones por semana. **Mientras eso no se
resuelva, el Resumen Ejecutivo no puede validarse con ningún corte.** «Corte resuelto» no es
«láminas validadas»: los conteos cierran y las sumas dan entre 134 % y 251 %.

**Estado:** congelado. **Fecha de lectura:** 2026-08-30. **Revisión 2** — rehecha entera tras
corregir un defecto de parser (§6).
**Es la Parte C del** `docs/Prompts/2026-08-30_1_censo_corte_id_cuentas.md`, con la Parte B en la
forma de su `ADDENDUM 1` §7 — dos criterios, no tres.
**Continúa** `MEDICION_corte_JM_2026-08-30.md` y **coincide con él en todo** tras la corrección.

⚠ **Nombre distinto del que pedía la Parte C** (`CENSO_corte_id_cuentas_*`): la pregunta *«qué
universo produce un criterio de corte»* ya tiene dueño en `CLAUDE.md` §7, y es la familia
`MEDICION_*`. Dos documentos con la misma pregunta es lo que esa tabla existe para impedir.

---

## 0 · Procedencia

| qué | artefacto | sha256 | verificado |
|---|---|---|---|
| desglose, 30/08 | `docs/_fixtures/Seguimiento_Digital_2026-08-30.xlsx` | `d7b917f5…3edf70d6a` | ✅ |
| `looker/DIGITAL`, 30/08 | `docs/_fixtures/Base_Looker_2026-08-30.xlsx` | `7272b383…40ae5b2` | ✅ |
| configuración viva, 30/08 | `docs/_fixtures/Motor_de_Informes_2026-08-30.xlsx` | `404cb943…2bdaddbc4` | ✅ |
| desglose + looker, 28/08 | `docs/_fixtures/Seguimiento Digital 2026-08-28.zip` | `0ce0086d…adfa81ac79` | ✅ |
| referencia externa | tablero, ventana 21–28 ago 2026, lectura **30/08 15:47** | `d01da806…93baf54e6` | ✅ |
| ⭐ referencia **consolidada** | tablero, misma ventana, lectura **30/08 18:00** | `f022d115…5a79611b4` | ⚠ sin huella declarada |

⭐ **El desglose llegó con otro nombre** —`Seguimiento Digital  (6).xlsx`— y **la huella fue lo único
que lo identificó**: había un `(5)` y un `(6)` a un carácter de distancia.

⛔ **Instrumento:** `tools/leer_xlsx_por_referencia.py`, **verificado contra `openpyxl`
(`data_only=True`) columna por columna en las 5.149 filas × 26 columnas — cero diferencias.** Es
condición de este documento y no un detalle: la revisión 1 midió con un lector roto y publicó cinco
números falsos (§6).

**Solapa medida:** `digital` · `CAMPAÑAS_DESGLOCE_DIGITAL` · **5.149 filas** el 30/08, **5.124** el
28/08 (encabezado en la fila 1, 26 columnas).
**Ventana:** `I Fecha inicio` ≤ 2026-08-28 **y** `J Fecha fin` ≥ 2026-08-21 → **343 filas** el
30/08, **318** el 28/08.

---

## 1 · Los dos criterios, y de dónde sale cada uno

| | JM es | columnas | origen |
|---|---|---|---|
| **BASE** | el nombre de campaña contiene «JM» | **V** (`des_campana_2`) **o U** (`des_campana_3`) | **leído de `DIMENSIONES_.ambito`, `Fuentes.gs:1769`** — lo que el motor aplica hoy |
| **C1** | el sufijo de cinco letras del `Id cuentas` termina en `AG` | **B** | la propuesta |

En los dos, **GCBA es la negación** (`D-33`), no un valor propio.

⚠ **BASE no mira `E Nombre Campaña`.** Hay **tres** columnas de nombre y el criterio vivo usa dos:
la V y la U — esta última **rotulada «Prioridad»**, con el encabezado mintiendo, según deja escrito
su propia alta en `Instalar.gs:1797`. El criterio se **leyó**, no se reescribió.

---

## 2 · ⭐⭐ B.1 · El presupuesto de las filas sin marca — va arriba, no en una nota al pie

Filas sin marca **por ningún camino**: sin sufijo válido, sin «JM» en ninguna de las tres columnas
de nombre, y con `T` vacía o `Sin Tipo`.

| | 28/08 | 30/08 |
|---|---|---|
| en la solapa entera | **19 filas** | **19 filas** |
| **dentro de la ventana 21–28/08** | **2 filas · 4.793.076 imp.** | **2 filas · 4.793.072 imp.** |
| contra el total GCBA del tablero (105.404.251) | **4,5 %** | **4,5 %** |

Las dos filas son `Agenda Entrega de Espadines a Comisarios Grales` (Google ads y DV360), con
**`Id cuentas` vacío** y `T = Sin Tipo`.

⛔ **Ese 4,5 % es el error irreducible de cualquier corte automático**, y es **más del doble del
ruido de la referencia** —y ese ruido resultó ser un **asentamiento de DV360 que ya terminó**, no
una deriva permanente (corrección fechada al `ADDENDUM` §0 bis)—: **no se puede absorber**. No lo introduce el
sufijo — **el criterio vivo del motor las pierde exactamente igual**.

---

## 3 · ⭐⭐ B.2 · BASE contra C1 — el resultado que decide

Ventana 21–28/08 sobre el artefacto del **30/08**. Referencia: tablero, **lectura del 30/08**.

**Lámina JM — implementaciones**

| criterio | Meta | Google | DV360 | celdas erradas |
|---|---|---|---|---|
| **tablero (referencia)** | **10** | **10** | **9** | — |
| ⭐ **C1** — sufijo `AG` | **10** | 9 | **9** | **1 de 3** |
| **BASE** — el motor hoy | 8 | 7 | 7 | **3 de 3** |

**Lámina GCBA — implementaciones**

| criterio | Meta | Google | DV360 | celdas erradas |
|---|---|---|---|---|
| **tablero (referencia)** | **100** | **60** | **120** | — |
| ⭐ **C1** | 102 | 69 | 128 | 3 de 3, por **+2 · +9 · +8** |
| **BASE** | 104 | 71 | 130 | 3 de 3, por **+4 · +11 · +10** |

⭐ **C1 gana las seis celdas.** Pero **el titular honesto no es «C1 reproduce el tablero»**: lo
reproduce del lado JM salvo una celda, y **del lado GCBA no lo reproduce ninguno de los dos**. C1 se
acerca más en las seis; eso es todo lo que la medición sostiene.

⭐⭐ **Hallazgo de método: «implementaciones» del tablero se corresponde con FILAS, no con
`Id cuentas` distintos.** Contando cuentas distintas, C1 da **10 · 7 · 8** y no pega ninguna
columna. Sin declararlo, el número no se puede volver a reproducir.

---

## 4 · ⭐⭐ B.3 · El diferencial fila por fila — el sufijo MEJORA, no mueve el error

**Sólo 6 filas de las 343 en ventana discrepan entre BASE y C1**, y las seis en la misma dirección:
BASE las manda a GCBA, C1 las trae a JM.

| `Id cuentas` (col B) | plataforma | BASE | C1 | impresiones (col O) | nombre (col E) |
|---|---|---|---|---|---|
| `3488-AGOJDGAG` | DV360 | gcba | **JM** | 2.055.342 | Agenda Post RDV Con 1 - Salud Eje Sur 14/8 |
| `3488-AGOJDGAG` | Meta | gcba | **JM** | 412.592 | Agenda Post RDV Con 1 - Salud Eje Sur 14/8 |
| `3487-AGOJDGAG` | Google ads | gcba | **JM** | 235.851 | Agenda Post con 1 A 1 - Parque Avellaneda |
| `3487-AGOJDGAG` | Meta | gcba | **JM** | 126.324 | Agenda Post con 1 A 1 - Parque Avellaneda |
| `3487-AGOJDGAG` | DV360 | gcba | **JM** | 88.089 | Agenda Post con 1 A 1 - Parque Avellaneda |
| `3488-AGOJDGAG` | Google ads | gcba | **JM** | 0 | Agenda Post RDV Con 1 - Salud Eje Sur 14/8 |

⭐⭐ **Las seis son campañas POST del «1 a 1» y de RDV — son JM, y C1 acierta las seis.** Es la
respuesta a B.3 y la evidencia más fuerte a favor del sufijo: el diferencial **no reparte errores
nuevos, corrige seis**. `3487-AGOJDGAG` es la cuenta de Coghlan, con seis casos `exacto` validados
el 28/08 (`V-114`…`V-121`).

---

## 5 · B.4 · El control de la columna T — se reporta, no se compara

Sobre las **5.149 filas** del 30/08:

| ref | encabezado | reparto |
|---|---|---|
| **S** | `Tipo Campaña` | `D` 1.393 · `C` 1.033 · (vacío) 829 · `RDV` 820 · `A` 486 · `B` 434 · `Adicional` 121 · `Revisar` 18 · `Mailing` 14 · `PC` 1 |
| **T** | `JM \| GCBA \| POLICIA` | **`GCBA` 5.013 · `JM` 111 · `Sin Tipo` 19 · `LINDA` 6** |

**Tabla cruzada `T = JM` × «JM» en el nombre (criterio BASE):**

| | nombre: JM | nombre: no |
|---|---|---|
| **T = JM** | 90 | 21 |
| **T ≠ JM** | **530** | 4.508 |

⛔ **De las 620 filas cuyo nombre dice JM, T dice otra cosa en 530 — el 85 %.** No es un caso borde:
**la columna contradice al nombre en la gran mayoría.** Confirma por segunda vez y por otro camino
la decisión del 27/08 de descartarla, y **C3 queda fuera con el motivo medido**.

---

## 6 · ⛔⛔ El defecto de parser que invalidó la revisión 1 de este documento

**La revisión 1 publicó cinco números falsos y una refutación entera equivocada.** La causa es una
sola y está en el instrumento, no en el dato.

Google Sheets exporta las celdas **vacías autocerradas** y las de fórmula con su valor cacheado:

```
<c r="S2" s="2"/>                                          ← vacía, autocerrada
<c r="T2" s="2" t="str"><f>…</f><v>GCBA</v></c>            ← la siguiente
```

El patrón `<c\b([^>]*)>(.*?)</c>` **no reconoce el autocierre**: arranca en `S2`, consume `T2`
entera buscando el primer `</c>`, y **le adjudica a `S` el valor de `T`**. Los valores **sangran una
columna hacia atrás, en silencio**. En esta solapa hay **4.645** celdas autocerradas.

**Lo que eso produjo, y lo que era en realidad:**

| revisión 1 decía | medido bien |
|---|---|
| `S` traía `GCBA` 249 · `Sin Tipo` 19 · `JM` 4 | `S` **no contiene** ninguno de los tres — era `T` sangrada |
| `T` = `GCBA` 4.219 · vacío 829 · `JM` 95 · `LINDA` 6 | **`GCBA` 5.013 · `JM` 111 · `Sin Tipo` 19 · `LINDA` 6** |
| en `2475-ENESEGAG`, `T` ausente y `S` = `GCBA` | **`T` = `GCBA` en las nueve**, `S` vacía |
| Δ looker − desglose al 30/08 = 778.272 | **768.128 (0,0223 %)**, looker por encima |
| `looker/DIGITAL` con 19 filas sin `Plataforma` | **0 filas**, en las dos fechas |
| las 19 sin marca traían `Id cuentas` = `2026` | **`Id cuentas` vacío** |

⛔ **La refutación de `MEDICION_corte_JM_2026-08-30.md` §3 bis se retira entera.** Aquel documento
decía *«T = GCBA en las nueve»* y **tenía razón**; lo que estaba roto era el lector de acá.

⚠ **Y es exactamente el mismo modo de falla que la truncación del export markdown del conector que
el `ADDENDUM` §5 midió: ninguno de los dos FALLA — los dos devuelven datos plausibles.** Un valor
correcto en la columna equivocada no se distingue de uno correcto mirando el resultado. Por eso la
verificación cruzada contra `openpyxl` es condición y no prolijidad.

⛔⛔ **Radio de alcance, medido y NO corregido acá: `tools/medir-post-en-desglose.py` tiene el mismo
patrón, y otras 12 herramientas de `tools/` importan su clase `Libro`** — `medir-ambito-looker`,
`medir-asunto-directa-mail`, `medir-desglose-por-cuenta`, `medir-fila-de-cuenta`,
`medir-impacto-etapa-post`, `medir-looker-vs-desglose`, `medir-mail-entregados-jm`,
`medir-pisada-union-digital`, `medir-resumen-ejecutivo`, `volcar-nombres-desglose` y las dos de este
prompt, ya migradas. **Cualquier número publicado por ellas sobre una solapa con celdas
autocerradas puede estar corrido una columna.** No se tocan desde acá —cambiarlas movería números
ya documentados sin que nadie lo esté mirando—: va como pendiente propio.

---

## 7 · Lo que esta medición NO contesta

- ⛔⛔ **El grano temporal.** Ninguna solapa guarda impresiones por semana. Las sumas de C1 en
  ventana dan **JM 13.953.803 contra 10.381.289 (134 %)** y **GCBA 264.024.170 contra 105.404.251
  (251 %)**, porque `Impresiones` es el **total de vida de la campaña**. **Los conteos cierran y las
  sumas no, y eso aísla el defecto:** las filas correctas están seleccionadas; lo que se suma de
  cada una es de más. **Es lo único que bloquea la validación de las láminas.**
- **Las 19 filas sin marca** son un defecto de carga en una planilla de terceros. Ningún corte lo
  arregla.
- **El corte sobre la hoja VIVA.** Todo esto es una foto del 30/08.

---

## 7 bis · ⭐⭐ El atraso de `looker/DIGITAL`: confirmado, y con el discriminador que faltaba

| comparación | a favor de la segunda | a favor de la primera | iguales |
|---|---|---|---|
| looker 28/08 **contra** desglose 28/08 | **759** | 0 | 16 |
| looker 30/08 **contra** desglose 30/08 | 1 | 30 | **750** |
| looker 28/08 **contra** looker 30/08 | **767** | 0 | 14 |
| desglose 28/08 **contra** desglose 30/08 | 67 | 3 | **711** |

⭐⭐ **Las dos últimas filas son la prueba, y ninguno de los documentos anteriores las tenía: entre
el 28 y el 30, `looker` movió 767 cuentas y el desglose sólo 67.** Si las dos hubieran estado
creciendo por campañas en curso se habrían movido parecido. **Se movió una sola, y era la que
estaba atrás.** El 30/08 quedan 750 cuentas idénticas de 781, y la diferencia total cae a
**768.128 · 0,0223 %**.

✅ **Y lo que confirma, que es lo caro:** la corrida `jm-20260828-193948` leyó `looker/DIGITAL` el
28/08 con la solapa **24 % por debajo de su propia fuente**. Los ocho `imp_*` de `L-031` y `L-032`
salieron de ahí. **Es causa suficiente de discrepancia, aparte del corte y del grano.**

---

## 7 ter · P5 y P6 contra la configuración viva del 30/08

- ⛔ **P5 — la mudanza a medias queda VERIFICADA, no plausible.** Los ocho `imp_*` siguen sobre
  `looker|DIGITAL` · `Impresiones` · `SUMA` · `filtro = estado=Activa` · `periodo_ref` **vacío en
  los ocho**, con `dimensiones` cruzando `ambito` × `plataforma`. `DIMENSIONES_` declara el desglose
  desde el 28/08 y **la hoja nunca se movió**. `MARCADORES` tiene **220** filas de datos.
- ✅ **P6 — confirmada.** `PERIODOS.2026_agosto_21_28` = **2026-08-21 → 2026-08-28**, y la corrida
  `jm-20260828-193948` lo usa. **Referencia y corrida coinciden**: es exactamente la ventana de la
  captura del tablero.
- **Los dos períodos de la misma semana NO son un defecto** (decisión del usuario, 30/08): el motor
  está hecho para que el usuario **elija** la ventana, así que `2026_agosto_21_27` y
  `2026_agosto_21_28` conviven por diseño. Y no hay riesgo de trazabilidad: cada deck estampa el
  token `periodo` en dos lugares. Queda como **dato reproducible**, no como pendiente:

  | período | corridas del 28/08 |
  |---|---|
  | `2026_agosto_21_27` (6) | 111537 · 114923 · 120142 · 120832 · 125016 · 134933 |
  | `2026_agosto_21_28` (4) | 121721 · 144559 · 175414 · **193948** |

- ⚠ **Corrección al `ADDENDUM` §5:** el snapshot `MARCADORES_2026-08-26.tsv` leído **desde disco**
  tiene **209 filas**, no 164. La truncación es del conector en modo markdown, **no del archivo del
  repo** — cosa que la revisión 3 de aquel documento ya incorporó.

---

## 7 quater · ⭐⭐ Tres causas independientes de discrepancia, y sólo una la arregla este trabajo

Una tercera lectura del tablero —**30/08 18:00**— cierra el movimiento que las dos anteriores
insinuaban, y al hacerlo **destapa una causa que estaba fuera del diagnóstico**:

| lectura | JM | GCBA | movimiento |
|---|---|---|---|
| 29/08 21:05 | 29 · 10.470.312 | 281 · 106.498.422 | — |
| 30/08 15:47 | 29 · 10.381.289 | 280 · 105.404.251 | **−1,01 %** · DV360 explica el **99,9 %** y pierde la implementación (121 → 120) |
| ⭐ 30/08 18:00 | 29 · 10.381.289 | 280 · **105.404.257** | **+0,00001 %** · DV360 **quieto** |

⭐⭐ **El movimiento no era ruido: era DV360 consolidando su atribución, y terminó.**

⛔ **Las tres causas son independientes y conviene no confundirlas, porque mandan a trabajos
distintos:**

| # | causa | cómo se arregla |
|---|---|---|
| 1 | **el corte por nombre** — pierde 5 de las 29 implementaciones JM | **el cableado del `2026-08-30_2`** |
| 2 | **el atraso de `looker/DIGITAL`** — 24 % por debajo de su fuente el 28/08 (§7 bis) | abierto |
| 3 | ⭐ **la corrida el mismo día del cierre** | **esperando** — es la única barata |

**La tercera, con el dato:** `jm-20260828-193948` se generó el **28/08 a las 19:41**, el mismo día
en que cerró su ventana. **Si DV360 seguía moviéndose más de un millón dos días después, esa corrida
leyó DV360 lejos de su valor final.**

⛔ **Y el grano temporal no es una cuarta causa: es un límite de la fuente.** No produce un error
que se pueda corregir — impide validar.

---

## 8 · Recomendación

⭐ **Cablear C1 — `ambito.jm` sobre `digital|CAMPAÑAS_DESGLOCE_DIGITAL` como condición sobre el
sufijo del `Id cuentas`, con `gcba` como su negación** — porque gana las seis celdas contra el
tablero y **acierta las seis filas del diferencial**, declarando arriba el 4,5 % de impresiones sin
marca que ningún criterio recupera.

⭐ **Con la condición `JDGAG`, no la terminación `AG`.** En la ventana 21–28/08 los dos son
indistinguibles —de los 31 sufijos presentes, el único que termina en `AG` es `JDGAG`, 28 filas—;
en la solapa entera se separan por **9 filas**, la cuenta `2475-ENESEGAG`
(*«Recorrida por Servicio Penitenciario de Marcos Paz»*, 3 Meta · 4 Google ads · 2 DV360,
4.108.318 impresiones). **`JDGAG` gana en tres patas medidas:**

- el prefijo de área es **`SEG`, no `JDG`**;
- **ninguna de las nueve dice «JM»** en sus tres columnas de nombre;
- **`T` dice `GCBA` en las nueve.**

⚠ **Y una inferencia que se retira, aunque la conclusión no cambie:** `MEDICION_corte_JM` §3 bis
deducía «agenda de otro funcionario» de que el nombre *«dice «de Marcos»»*. **Marcos Paz es el
lugar** —el complejo penitenciario—, no una persona. La recomendación se sostiene sin esa pata.

⛔ **Ninguna de las nueve cae en la ventana 21–28/08**, así que la elección **no mueve ningún número
publicado hoy**.

⛔ **Nada de esto se cablea desde acá.** El cableado va en un prompt aparte, y antes hay que repetir
la medición sobre la hoja viva.
