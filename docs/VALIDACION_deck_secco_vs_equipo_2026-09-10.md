# VALIDACIÓN — el deck SECCO del motor contra el que publicó el equipo, misma semana

> **Congelado.** Nadie lo edita: si hay una corrida nueva, se crea otro (`CLAUDE.md` §7).
>
> Sesión del 10/09/2026. **Es el cuarto de la serie de deck-contra-deck** —los anteriores son
> `docs/VALIDACION_2026-07-31.md` (SECCO), `docs/VALIDACION_2026-08-09.md` (JM) y
> `docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md` (JM)— y **el primero que compara la
> plantilla `secco` contra el deck del equipo de la misma semana**.
>
> **Reemplaza a nada.** Sus casos viven en `docs/casos_validacion_2026-09-10.csv`.

---

## ⛔⛔ ADDENDUM 1 — 10/09/2026, tarde. Dos conclusiones de este documento eran FALSAS

> Se agrega el mismo día, después de correr la Parte 0 del `2026-09-10_1`. **El texto original no
> se borra**: se tacha donde corresponde y se apunta acá. Lo que cae es **mío**, no del motor.

**1 · El deck CERRÓ. `C-127` está retractado.**

El deck del fixture es la corrida **`secco-20260910-121156`** y en Drive se llama
*«Seguimiento SECCO-SSCDI — vie 04/09 — jue 10/09 **Motor 12:03***» — **sin el sello
`[en proceso]`**, que sólo quita el cierre. Su fila de `CORRIDAS` lista las **cinco** etapas, la
última a **+82 s** sobre un techo de 360. No hubo corte ni muerte en el muro.

**2 · ⛔ El error de medición que lo causó, porque la lección vale más que el caso.** Verifiqué
*«ninguna lámina escondida»* mirando **los primeros 400 bytes** del XML de cada slide, y el
atributo `show="0"` del tag `<p:sld>` cae más adelante. Leído bien, **el deck tiene DIEZ láminas
escondidas** — slides 4, 5, 6, 7, 24, 32, 34, 35, 36 y 37. **Un lector que mira una ventana fija
del archivo no falla: devuelve el resultado que uno esperaba.**

**3 · Los 76 crudos no son un defecto: viven TODOS en láminas escondidas.** Las nueve láminas con
crudos son exactamente esas diez menos la 35, que es la única escondida sin tokens. Y la prueba
final sale del `mapa_tokens` que `CORRIDAS` guarda: **de los 60 tokens crudos únicos, CERO están en
el mapa.** `tokensVisiblesDe_` descarta lo que sólo vive en escondidas y la barrida itera el mapa.
⭐ **La afirmación correcta es que ningún crudo sobrevive en lo que se EMITE — y en este deck hay
cero crudos en láminas visibles.** → `C-130`.

**4 · `C-128` también está retractado: no es el ítem 41 ni tiene que ver con `D-47`.** `camp_titulo`
figura en el mapa para los slides 17-23 y 25-31 y **no** para 24 ni 32, que son `L-023` escondida:
la resolución nunca pasó por ahí. El `/////` se lo escribió **la barrida, de rebote**, porque
`replaceAllText` es de deck entero. El ítem 41 de `L-034` en `jm` **queda como estaba**.

**5 · `C-126` está CERRADO.** El usuario corrigió la **plantilla viva** el 10/09 a las **15:55**
—`modifiedTime` de `SECCO_marcada`, posterior a las tres corridas del día—. ⚠ Queda sin verificar
el par (3) de `L-018` —sus seis cajas salen `/////`, así que ningún deck puede confirmarlo— y si el
cruce sigue en `jm`.

**6 · `CORRIDAS` no tiene columnas `corte` ni `pendientes`** → `C-131`.

**7 · Y una corrección del usuario, del mismo día:** `L-008` es la lámina de los **encuentros que
no son «1 a 1»**. Que no aparezca en este deck es lo esperado —esta semana hubo un 1 a 1 y nada
más—, no una anomalía.

**8 · ⭐ La salvedad de nombres de §8 queda levantada.** Se corrió `tools/snapshot.js`, así que ya
hay padrón del **10/09** y los nombres se verificaron contra él en vez de contra la plantilla
espejo: **los diez `emin_*` existen** —`lista`, `encuentros`, `alcance`, `alcance_semanal`,
`aperturas`, `clics_ctor`, `clics_ctr`, `or`, `ctor`, `ctr`— y también **los 16 `camp_envN_*` de
`V-135`**. ⭐ **Y el cero también se midió:** `camp_formato1`, `camp_audiencia1` y `camp_remitente`
dan **0 filas**, que es exactamente lo que explica su `/////`.

⚠ **Lo que ese snapshot desmiente de paso:** el del 31/08 daba *220 `jm` · 0 `secco` · 0 `*`* y el
vivo da **169 `*` · 58 `jm` · 10 `secco`**; y `LAMINAS` para `secco` pasó de **29 · 5 · 21** a
**27 · 5 · 19**.

---

## 0 · El resumen, porque cambia dónde hay que mirar

⭐⭐ **Lo que el motor calcula reproduce al equipo mejor de lo que ningún cruce anterior había
mostrado**: 16 celdas de la tabla de mail de una campaña **dígito a dígito**, los 11 encuentros de
ministros **en el mismo orden**, el bloque PRE del uno a uno entero, los dos absolutos de M2 y las
**nueve identidades internas** del deck cerrando exactas.

⛔⛔ **Y el hallazgo del día no es un número: es que la PLANTILLA tiene tres pares de tokens
cruzados**, así que hay números correctos publicándose en el casillero equivocado —en las **dos**
plantillas—. `C-126`.

~~⛔ **Y el deck no está terminado**: 76 tokens quedaron crudos y la barrida final no corrió.
`C-127`.~~ ⛔ **FALSO — ver ADDENDUM 1.** El deck cerró; los 76 crudos viven todos en láminas
escondidas (`C-130`).

---

## 1 · Qué se comparó, y con qué huella

**El fixture entró hoy y se le verificó la huella antes de citar un número**
(`docs/_fixtures/README.md`, regla de método de `CLAUDE.md` §4):

| | |
|---|---|
| archivo | `docs/_fixtures/Fixture  (10-09) .zip` |
| bytes | 56.894.628 |
| `sha256` | `6afa745fbc41055214f79fd3333179bf48921daf2f887de19277ddb8c95e7620` |

Adentro hay **dos** `.pptx` y ninguna base:

| rol | archivo | bytes | `sha256` | láminas |
|---|---|---|---|---|
| **motor** | `Seguimiento SECCO-SSCDI – vie 04_09 – jue 10_09 Motor 12_03.pptx` | 16.422.806 | `1d6f5015a61e3cd8db68ed84fc2176f6159601e4f10727ba697100af80cd750f` | **38** |
| **equipo** | `Equipo 2026-09-10 12.08 – Seguimiento SECCO - SSCDI (10-09) .pptx` | 40.615.675 | `4faf90902d623b7a6ffe8ff0a6150816838d5db4fc01928ec1c3061ec09af17e` | **66** |

**Cinco minutos separan las dos capturas** —motor 12:03, equipo 12:08—, y eso es parte del
resultado: es el intervalo dentro del cual la fuente puede moverse (`R-31`), y es la explicación
de `C-122`.

⚠ **Los nombres están puestos a mano al armar el zip.** El del motor dice `Motor 12_03` y no
conserva el sello `[en proceso]` que el motor pone o saca; un `.pptx` exportado de Google Slides
**no trae `docProps`** —verificado sobre este archivo: no existen `core.xml`, `app.xml` ni
`custom.xml`—, así que **desde el fixture no se puede saber si la corrida cerró**. Lo contesta el
nombre real en Drive y la fila de `CORRIDAS`. ⭐ **Y así se contestó** (ADDENDUM 1): el título en
Drive es `… Motor 12:03`, **sin sello** ⇒ cerró.

~~⭐ **Ninguna lámina está escondida en ninguno de los dos decks** —medido sobre `show="0"`—, así
que todo lo que sigue es sobre láminas visibles.~~

⛔ **FALSO, y es el error del que cuelgan `C-127` y `C-128` — ver ADDENDUM 1.** El deck del motor
tiene **diez** láminas escondidas (4, 5, 6, 7, 24, 32, 34, 35, 36, 37) y el del equipo **cuatro**
(10, 36, 37, 38). La medición vieja miraba los primeros 400 bytes del XML; `show="0"` cae más
adelante.

**Cómo se leyó, y por qué importa:** el texto aplanado de un `.pptx` **no dice en qué casillero
está cada valor**, y esta validación depende justamente de eso. Se leyeron las **coordenadas** de
cada caja (`a:off`, EMU → cm) y se aparearon valor y etiqueta por posición. Sin eso, `C-126` no se
puede ver: los números están todos bien.

---

## 2 · Qué generó el motor

**38 láminas**, plantilla `secco`, período **vie 04/09 – jue 10/09**. Las anclas de las notas del
orador dan el mapa:

| láminas | qué son | estado |
|---|---|---|
| `L-001` … `L-003` | portada, índice, portada de campañas | ⚠ la portada publica `///// de /////` (`fecha_dia`, `fecha_mes` sin fila) |
| `L-004`, `L-005` | «Uno a uno en comunas» | ⛔ **escondidas, y sin fila en `LAMINAS`** desde el `2026-08-31_5` — ver ADDENDUM 1 |
| `L-006`, `L-007` | «Encuentro temático» — ídem | ⛔ 11 tokens crudos, en láminas escondidas |
| ⭐ `L-054`, `L-055` | **el uno a uno nuevo** — Palermo (04/09) | ✅ publica, y sus tres identidades cierran |
| `L-009`, `L-010` | comunicaciones post | ⚠ una fila publicada; la columna Período sale `/////` en las cuatro |
| `L-011`, `L-012` | encuentros de ministros | ✅ el bloque de mail exacto · ⛔ el digital no (`C-123`) |
| `L-013` … `L-015` | M2 | ✅ dos exactos, dos por drift (`V-139`, `C-122`) |
| `L-016` … `L-023` **×2** | las dos campañas destacadas | el grueso del cruce |
| `L-024` … `L-029` | Análisis y Datos (conversación, repercusiones, RRSS) | ⛔ crudos: nada cableado |

**Censo de símbolos del deck del motor**, medido sobre las 38 láminas:

| símbolo | qué significa | cuántos |
|---|---|---|
| `-1.234-` | publicado con `_revisar` | **70** |
| `/////` | sin fila en `MARCADORES`, o no resolvió | **52** |
| `{{token}}` **crudo** | ⛔ **nadie lo miró** | **76** |
| `»»»` | la corrida cortó y este token tiene fila | **0** |

**Los 52 `/////`, repartidos y nombrados** (suman exacto):

| lámina | cuántos | qué son |
|---|---|---|
| `L-001` | 2 | `fecha_dia`, `fecha_mes` |
| `L-004`, `L-005` | 3 | `ecv_fecha` (en las dos) y `ecv_asistentes` |
| `L-055` | 8 | los 6 benchmarks CTR/VTR + «Usuarios alcanzados» + «Frecuencia estimada» |
| `L-010` | 4 | la columna **Período**, las cuatro filas |
| `L-018` ×2 | 12 | las 6 cajas de Audiencias y Formatos, en las dos campañas |
| `L-021` ×2 | 2 | `camp_dig_insight` |
| `L-022` ×2 | 16 | 4 `camp_envN_rem` + `camp_env4_fecha` + insight + `camp_remitente` + su benchmark |
| `L-023` ×2 | 4 | `camp_titulo` y `camp_remitente` |
| `L-024` | 1 | el mes de la portada de Análisis y Datos |

⭐ **Dos de esos reproducen el estado que el handoff ya declaraba**, y eso es lo que se esperaba
ver: la fila 1 de la columna Envío publica `jorge.macri@buenosaires.gob.ar` y las otras cuatro
salen `/////` —el alta de `acumulado | Mail` sigue pendiente, ítem 42—, y `camp_env4_fecha` sale
`/////` porque su fila todavía no está escrita (`aplicarTanda20260908()` sin correr).

---

## 3 · ~~⛔ El deck NO está cerrado~~ — ⛔ **SECCIÓN RETRACTADA, ver ADDENDUM 1**

> **Todo lo que sigue en esta sección es falso**, salvo los cuatro contadores y las familias de los
> crudos, que se mudan a `C-130`. El deck **cerró**; los 76 crudos viven todos en láminas
> **escondidas**, y de los 60 únicos **ninguno** está en el mapa de la etapa 2. Se conserva sin
> editar porque el razonamiento —correcto sobre una premisa falsa— es la parte que enseña.

### ~~El deck NO está cerrado — `C-127`~~

**76 tokens crudos y CERO símbolos de corte.** Eso no es una lectura: es una implicación del
código. `barrerTokensNoAlcanzados_` convierte **todo** crudo en `/////` o en `»»»`, corre **siempre**
—«haya habido corte o no», dice el comentario— y tiene **una sola** excepción escrita:

```js
var continuable = !!(corte && opciones.continuable === true);
```

⇒ **la barrida no corrió.** Las dos causas posibles y las dos significan lo mismo para quien mira
el deck —**no está terminado**—:

- **(a)** la corrida se cortó por presupuesto **y dejó plan de continuación** ⇒ el deck es un
  *checkpoint* y hay que continuarla;
- **(b)** murió en el muro de los 360 s, que no ejecuta **nada** del cierre.

⚠ **El discriminador no está en el fixture** —ver §1—: es el sello del nombre en Drive y la fila de
`CORRIDAS`.

⛔ **Lo que NO se puede concluir de un crudo: que el token no esté cableado.** Para eso está el
`/////`, y confundirlos es exactamente el error que el símbolo del corte vino a cerrar
(`CLAUDE.md` §4, el deck de las 15:45 con 269 `/////` de los cuales 264 eran del corte).

**Las familias de los 76:** 26 `camp_resp_*` + `camp_tasa_resp` · 13 `conv_*` · 11 `rep_*` ·
9 `rrss_*` · 9 `et_*` · 3 `ecv_*` · 3 `u1_bench_*`.

---

## 4 · Lo que el deck REPRODUCE — casos vigentes, no mediciones nuevas

`CLAUDE.md` §1: un caso `exacto` es un **número esperado** y el control es **reproducirlo**.

| caso vigente | qué esperaba | el deck del 10/09 | |
|---|---|---|---|
| **`C-99`** (exacto, 04/09) | `camp_enviados` 367.638 · OR 41,9 · clics 2.457 · CTOR 1,6 | los cuatro, idénticos, **en la otra plantilla** | ✅ |
| **`V-111`** (identidad en el producto) | partes = TOTALES en digital | **6 de 6** exactas | ✅ |
| **`V-113`** (identidad de envíos) | envíos = GLOBAL | **6 de 6** exactas, con 3 y con 4 envíos | ✅ |
| **`C-94`** (cerrado, decisión 05/09) | `camp_alcance` = 872.827 | **872.827**, seis días después | ✅ |
| **`C-100`/`C-106`** (exacto, 06–07/09) | `emin_lista` publica texto, corte por columna `D` | 11 renglones, y **coinciden con el equipo** | ✅ |
| **`C-102`** (exacto, 06/09) | un solo signo de `%` en `emin_or`/`ctor`/`ctr` | `-17.4-%`, `-1.9-%`, `-0.3-%` | ✅ |
| **`V-124`/`V-125`** (exacto) | los dos absolutos de M2 coinciden con el equipo | 248.313 / 245.804 | ✅ |
| handoff 09/09 | fila 1 de Envío con el mail, 2–5 `/////` | idéntico, también en `secco` | ✅ |

⚠ **Dos que se movieron, y ninguno es un fallo:** `C-95` esperaba `camp_frecuencia` 32,7 y el deck
publica **33,41**; `C-96` esperaba `camp_meta_frecuencia` 2,38 y publica **2,56**. Los dos son
`RATIO`/`ULTIMO` con el **mismo denominador de siempre** —872.827— y numeradores que crecieron:
29.164.330/872.827 = 33,41 y 2.234.228/872.827 = 2,56. **La aritmética de los dos casos sigue
cerrando; lo que se movió es la campaña, que sigue viva.**

---

## 5 · Lo que valida NUEVO — `V-131` … `V-139`

### 5.1 · Las tres identidades internas — `V-131`, `V-132`, `V-133`

**Nueve de nueve cierran al dígito** en el deck del motor.

| lámina | identidad | resultado |
|---|---|---|
| `L-021` ×2 | Meta + Google + Programmatic = TOTALES, en impresiones, vistas y clics | **6/6** |
| `L-022` ×2 | los envíos suman el GLOBAL, en enviados, entregados y aperturas | **6/6** |
| ⭐ `L-055` | las **seis** cajas PRE+POST suman el agregado | **3/3** |

⭐⭐ **La de `L-055` es nueva y es la única que se podía hacer ahí:** el equipo dejó ese bloque
entero en `xx`, así que **no hay contra qué cruzarlo**. `26.669+211+690.258+62.416+0+84.750 =
864.304`, `3.368+0+65.372 = 68.740`, `845+8+902+56+0+68 = 1.879` — las tres exactas contra lo que
la lámina publica abajo.

⚠ **Y las tres declaran lo que no prueban:** consistente no es correcto. Por eso su
`token_propuesto` **no nombra marcadores** —§8.

### 5.2 · Los cruces contra el deck del equipo

| caso | qué | resultado |
|---|---|---|
| **`V-134`** | el GLOBAL de mail de «Fin de la mafia» | 4 de 4 |
| ⭐⭐ **`V-135`** | **la tabla de envíos entera, celda por celda** | **16 absolutos al dígito, mismo orden de filas**; los 8 porcentajes coinciden con el redondeo del equipo |
| **`V-136`** | el bloque **PRE** del uno a uno | 5 de 5 |
| ⭐⭐ **`V-137`** | `emin_lista` / `emin_encuentros` | **11 de 11**, mismo conjunto, mismo orden, mismas fechas |
| **`V-138`** | el bloque de **mail** de ministros | 3 absolutos al dígito |
| **`V-139`** | M2 enviados y entregados | 2 al dígito, **tercera ventana** |

⭐ **`V-135` es el cruce más fuerte que este proyecto tuvo hasta hoy sobre `L-022`**, porque no
compara un agregado: compara **cuatro filas en su orden**. Es la mitad que `opFILA` podía romper y
que ningún caso anterior había mirado en una campaña de cuatro envíos.

⭐ **`V-137` cierra la pregunta del universo de ministros para esta ventana.** `C-101` (contradice,
06/09) decía que los ministros publicaban sobre el universo equivocado; ese caso midió la ventana
**28/08–03/09**. Éste mide **04/09–10/09** con el corte por columna `D` que `C-106` confirmó con
corrida. ⚠ **No lo retracta:** son dos ventanas y dos criterios, y lo que este caso prueba es que
el criterio **nuevo** reproduce.

---

## 6 · ⛔⛔ EL HALLAZGO — tres pares de tokens cruzados en la plantilla (`C-126`)

**El número es correcto y el casillero no.** Se ve por geometría y lo confirma el deck.

### (1) `L-020` — las implementaciones, cruzadas

```
[11.4, 2.2]  bajo «Directa» → {{camp_dig_impl}}     ⛔
[11.4,14.2]  bajo «Digital» → {{camp_dir_impl}}     ⛔
```

**El deck lo prueba sin abrir la plantilla:** «Operativo Muro» publica **26 implementaciones** del
lado Directa y **3** del lado Digital — y su propia tabla de mail, dos láminas antes, tiene
**tres** envíos. El equipo publica 2 y 14.

### (2) `L-020` — aperturas contra clics, cruzadas

```
[6.7, 6.9]  caja rotulada «Aperturas» (Directa) → {{camp_clics}} ({{camp_ctor}}%)   ⛔ son los clics DIGITALES
[8.7,15.4]  caja rotulada «Clics» (Digital)     → {{camp_aperturas}}                ⛔ son las aperturas de MAIL
```

**El deck lo prueba:** bajo «Aperturas» publica **40.648**, que es el TOTALES de clics de su propia
tabla digital; bajo «Clics» publica **150.506**, que es el GLOBAL de aperturas de su propia tabla
de mail. **El equipo publica 86.464 (32 %) y 19.872 en esas mismas dos cajas** — o sea, al revés.

### (3) `L-018` — audiencias contra formatos, cruzadas

```
[9.1, 1.7]  bajo «Audiencias» → {{camp_formato1..3}}     ⛔
[9.1,13.6]  bajo «Formatos»   → {{camp_audiencia1..3}}   ⛔
```

⚠ **Hoy no publica nada mal porque los seis salen `/////`.** Es el mismo defecto **esperando a que
alguien los cablee** — la forma exacta del *fallback con fecha de vencimiento* de `CLAUDE.md` §4: el
trabajo previsto es lo que lo activa. El deck del equipo confirma la orientación correcta: bajo
Audiencias escribe *«Geo a los puntos de acceso, Riachuelo y General Paz»* y bajo Formatos *«Video
YouTube, Meta y Programmatic»*.

### Y está en las DOS plantillas

La geometría de `JM_marcada.pptx` **`L-016`** es **idéntica**, token por token, a la de
`SECCO_marcada.pptx` `L-020`. No es un descuido de una plantilla.

⚠ **Las dos que se midieron son las ESPEJO de `Plan Inicial/_archivo/Plantillas/`, o sea evidencia
fechada, no la plantilla viva.** Para (1) y (2) el deck del 10/09 las confirma —los valores
publicados sólo se explican con el cruce—; para (3) la confirmación es **sólo geométrica**.

⛔ **Y la espejo está vieja en otras láminas**, así que no sirve como censo: su `L-010` tiene 3
filas y 2 columnas con token, y la viva publica **4 filas y 7 columnas**.

⛔ **No se tocó ninguna plantilla.** Quien lo arregle escribe sobre la **viva** y hace backup antes
(`C-01`).

### El primo hermano: `L-012` no tiene token de Alcance

```
[7.2, 8.2]  caja rotulada «Impresiones» → {{emin_alcance}}
[8.9, 8.2]  caja rotulada «Alcance»     → (ningún token)     ⛔
```

El equipo publica **1.037.621** ahí. El motor publica **nada** — ni valor, ni `/////`, ni guión.
⛔ **Un casillero vacío no es un hueco declarado:** no entra a `FALTANTES`, no cuenta como token sin
fila, y **nadie se entera**. Es el modo de falla más barato de tener y el más difícil de ver.

---

## 7 · Lo que no cierra

| caso | qué | estado |
|---|---|---|
| **`C-122`** | `m2_aperturas` +173 (+0,19 %) y `m2_clics` +16 (+0,42 %) | `aproximado` — **enviados y entregados coinciden al dígito**, así que el universo es el mismo y sólo pudo moverse lo que acumula |
| **`C-123`** | el bloque **digital** de ministros: impresiones +1,8 %, clics **−11 %** | `abierto` — **las dos diferencias van en direcciones opuestas**, así que no es drift |
| ⛔ **`C-124`** | **el TOTALES del deck del EQUIPO no suma sus propias filas** | `contradice` |
| **`C-125`** | «Operativo Muro»: el motor cuenta **3 envíos** y el equipo **2** | `contradice` |
| **`C-126`** | los tres pares cruzados | ⭐ **`cerrado`** — el usuario corrigió la plantilla viva el 10/09 15:55 |
| ~~**`C-127`**~~ | ~~los 76 crudos~~ | ⛔ **`retractado`** — ver ADDENDUM 1 |
| ~~**`C-128`**~~ | ~~`camp_titulo` sale `/////` en `L-023`~~ | ⛔ **`retractado`** — ver ADDENDUM 1 |
| **`C-129`** | `camp_alcance` coincide al dígito en una campaña y no en la otra | `abierto` |
| ⭐ **`C-130`** | **los 76 crudos viven todos en láminas escondidas** | `cerrado` — no es defecto, es el diseño |
| ⛔ **`C-131`** | **`CORRIDAS` no tiene columnas `corte` ni `pendientes`** | `contradice` |
| **`X-44`** | el motor expandió **2** campañas y el equipo publica **3** | `abierto` |

### ⛔ `C-124` cambia cómo se lee todo cruce contra el equipo

**Ninguna de las seis identidades cierra en el deck del equipo.** Operativo Muro: sus tres
plataformas suman **37.081.184** impresiones y su TOTALES dice **23.426.534**; su TOTALES de
alcance (2.773.666) es **menor** que el alcance de su propia fila Meta (3.989.984).

⭐ **Y cada fila suya es internamente consistente por separado** —su frecuencia TOTALES 8,4 es
23.426.534/2.773.666 y su frecuencia Meta 2,14 es 8.527.687/3.989.984—, así que no es un error de
tipeo: **la fila TOTALES sale de otro universo que las filas de arriba.**

⇒ **Comparar el TOTALES del motor contra el TOTALES del equipo no es comparar la misma pregunta.**
Las comparaciones válidas de esa lámina son **fila por plataforma**. No es un defecto del motor: es
una propiedad del deck del equipo que hay que conocer **antes** de citarlo como testigo.

### ⭐ `C-129` — el mismo token, exacto en una campaña y no en la otra

`C-94` cerró el 05/09 la diferencia de «Fin de la mafia» con una decisión del usuario: *el equipo
no actualiza la base y su alcance sale de la plataforma; el motor lee bien*. **Este caso no lo
reabre** —el 872.827 se reproduce idéntico seis días después—. Lo que agrega es que en «Operativo
Muro», una campaña que `C-94` no miraba, **el motor y el equipo publican el mismo número:
3.989.984**.

⚠ **Y un dato que `C-93` no podía tener:** en este deck el equipo publica **dos** alcances distintos
para «Fin de la mafia» —1.320.482 en su fila Meta y 1.271.754 en su TOTALES—. El 1.271.754 con el
que se comparó el 04/09 es el del **TOTALES**, y por `C-124` esa fila sale de otro universo. La
comparación válida es **872.827 contra 1.320.482**.

### ~~`C-128` — el ítem 41, otra vez y en la otra plantilla~~ ⛔ RETRACTADO

> **No era el ítem 41.** `L-023` está **escondida** —slides 24 y 32— y `camp_titulo` **no está en el
> mapa de la etapa 2 para esos dos slides**: la resolución nunca pasó por ahí. El `/////` se lo
> escribió **la barrida, de rebote**, porque `replaceAllText` es de deck entero y el token sí está
> mapeado por sus láminas visibles. **El ítem 41 de `L-034` en `jm` queda exactamente como estaba.**
> Ver ADDENDUM 1 y `C-130`.

~~`camp_titulo` publica `-Operativo Muro | 25/8-` en `L-021` y en `L-022`, y sale `/////` en `L-023`
**del mismo ítem**. Igual en la segunda campaña.~~

~~⭐ **Lo que esta segunda aparición agrega:** `L-034` está en `jm` y `L-023` en `secco`, así que **la
causa no es de una plantilla**. Y el `/////` convive en la misma lámina con 13 tokens crudos, lo que
dice que la resolución **sí pasó por ahí** —escribió dos símbolos— y no encontró resultado.~~

⛔ **Lo único que sobrevive:** no se escribió ninguna fila, y sigue estando bien no haberla escrito.

---

## 8 · Una decisión de método que este documento toma, y por qué

⛔⛔ **Los tres casos de identidad interna (`V-131`…`V-133`) y los dos cuyos marcadores no están en
el padrón (`V-136`) llevan `token_propuesto` SIN nombres de marcador, a propósito.**

`tools/generar-casos-por-marcador.js` lee esa celda como **clave**, no como descripción, y `D-60`
levanta el `_revisar` de todo marcador con caso `exacto` vigente. ⇒ **nombrar marcadores en un caso
de identidad interna les levantaría la marca sobre una prueba que no mira el valor** — y
*consistente no es correcto* está escrito en `CLAUDE.md` con todas las letras. Es la lección de
`C-115`/`C-117`, que costó el corrector `C-118`…`C-121`.

⚠ **Y en `V-136` hay un segundo motivo:** los nombres de las cajas de `L-055` **no están en el
snapshot de `MARCADORES` del 31/08** —la lámina es posterior— y **no se inventan**. Nombrarlos por
analogía con `u1_pre_meta_*` sería fabricar un nombre, que es peor que subcontar.

⭐ **Los que SÍ nombran marcadores se verificaron contra el padrón:** los 16 de `V-135` existen en
el snapshot del 31/08. ⚠ **Los `emin_*` de `V-137`/`V-138`/`C-123` NO están en ese snapshot** —son
posteriores, los cablearon `C-100` y `C-102` a principios de septiembre— y sus nombres salen de la
**plantilla espejo**. La plantilla viva es la autoridad y no se abrió desde acá.

---

## 9 · El efecto colateral, declarado

⛔ **Agregar este CSV pone `tools/probar-guiones-grupos.js` en rojo**, y eso es el banco haciendo su
trabajo: `CASOS_POR_MARCADOR_` es una constante **congelada** en `Auditoria.gs` que declara conocer
**7** CSV y en disco ahora hay **8**.

| | |
|---|---|
| suites **antes** de este CSV | ✅ 99 bancos, **exit 0** |
| suites **con** este CSV | ⛔ **1 en rojo**: `probar-guiones-grupos.js`, bloque B, 2 afirmaciones |
| qué pide | `node tools/generar-casos-por-marcador.js` |

⛔ **No se regeneró, y es deliberado.** Regenerar alimenta a `D-60`, que levantaría el `_revisar`
de los marcadores con caso `exacto` nuevo —los 16 de `V-135`, los `emin_*` de `V-137`/`V-138`, los
dos de `V-139` y los cuatro de `V-134`—. **Eso es una escritura sobre `MARCADORES` y una decisión
del usuario**, no un trámite de esta corrida. Es exactamente la forma del ítem 39.

⭐ **La `contradice` → `exacto` de `emin_lista` y `emin_encuentros` ya existía antes de este CSV**
—verificado corriendo el banco con el CSV afuera: el bloque G ya listaba esos dos más `imp_prog`—,
así que este documento no la crea.

---

## 10 · Lo que este documento NO contesta

- ~~⛔ **Si la corrida cerró.**~~ ⭐ **Contestado el mismo día** (ADDENDUM 1): cerró. El fixture solo
  no alcanzaba; lo dijeron el título en Drive y la fila de `CORRIDAS`.
- ⛔ **De qué filas sale cada número.** Todo lo de acá es **producto contra producto**: dos decks.
  Ninguna base entró en el fixture, así que **ningún caso de acá mide contra la fuente**.
- ⛔ **Si la plantilla VIVA tiene los tokens cruzados.** Lo que se midió es la espejo, confirmada
  por los valores del deck en dos de los tres pares.
- ⛔ **Nada del deck `jm`.** Este fixture es sólo `secco`.
- ⚠ **Los porcentajes.** El motor publica un decimal y el equipo redondea a entero: `C-92` ya dejó
  escrito que con eso no se puede afirmar coincidencia ni diferencia, y acá vale igual —los ocho
  porcentajes de `V-135` se declaran *consistentes con el redondeo*, no *exactos*.
- ⚠ **Las láminas de Análisis y Datos.** El equipo también las dejó en `xx` esta semana, así que no
  hay testigo ni siquiera para los tokens que sí estuvieran cableados.
