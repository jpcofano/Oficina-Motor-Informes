# `2026-08-30_2` · Cablear el corte de ámbito por `Id cuentas`

**Destino:** `docs/Prompts/`. **Estado:** no ejecutado.
**Depende de** `docs/MEDICION_corte_id_cuentas_2026-08-30.md` y de
`docs/MEDICION_corte_JM_2026-08-30.md` rev. 3.

⛔⛔ **Este prompt SÍ mueve números publicados.** Cambia el ámbito de `L-031` y `L-032`. Las
partes que tocan `DIMENSIONES_` o corren el informe van en **Opus, effort alto**.

---

## 0 · Lo que hay que entender antes de leer el resultado

⭐⭐ **Después de este cambio las sumas van a seguir sin cerrar contra el tablero, y eso NO es
un fracaso del corte.** Está medido y tiene causa conocida: `Impresiones` es el total de vida de
la campaña y la solapa no tiene grano diario. Hoy da 134 % (JM) y 251 % (GCBA), y el prorrateo por
días —probado— lo lleva a 66 % y 84 % empeorando la dispersión por celda. **La entrega no es
uniforme; no hay aritmética que recupere la semana.**

⛔ **El criterio de éxito de este prompt son los CONTEOS, no las sumas:**

| referencia · tablero, lectura 30/08 | Meta | Google | DV360 |
|---|---|---|---|
| JM — implementaciones | 10 | 10 | 9 |
| GCBA — implementaciones | 100 | 60 | 120 |

Y el conteo se hace **por filas**, no por `Id cuentas` distintos.

⭐⭐ **La referencia se usa CONSOLIDADA, no fechada al día del cierre.** Tres lecturas de la misma
ventana cerrada muestran que el movimiento del tablero **no era deriva permanente sino un
asentamiento de DV360, y terminó**: 29/08 → 30/08 15:47 se movió **−1,01 %** con DV360 explicando el
99,9 %, y 30/08 15:47 → 18:00 se movió **+0,00001 %**. ⛔ **Esto deroga el «±2 %» del `ADDENDUM 1`
§0 bis**, que se había deducido de dos lecturas suponiendo deriva. **La regla es: dos lecturas
separadas, y se usa la referencia sólo cuando el delta entre ellas es despreciable.** Comparar
contra `Tablero_carga_21-28ago_lectura_2026-08-30_1800.png`.

---

## 0 bis · ⭐⭐ Decisión del usuario posterior al prompt (30/08/2026) — `L-031` y `L-032` publican ACUMULADO

**Sin fuente con grano semanal, la lámina publica lo que la fuente tiene** —el total de vida de las
campañas activas en la ventana— **y lo dice en el rótulo**: «impresiones acumuladas de las campañas
del período», o la redacción que el usuario apruebe.

⛔ **Esto REEMPLAZA el criterio de éxito del §0 en lo que se refiere a las sumas.** Los conteos
siguen igual. **El tablero deja de ser el criterio de las SUMAS y pasa a ser el control del CORTE:**

| | qué mide | cómo se lee |
|---|---|---|
| **CONTEOS** | si el corte agarra las campañas correctas | ⛔ **tienen que cerrar** — JM 10/10/9, GCBA 100/60/120, **por filas** |
| **SUMAS** | acumulado de campaña contra entrega del período | ✅ **no tienen que cerrar y no son un error** — 134 % y 251 % es la diferencia esperada entre **dos magnitudes distintas**. Se reportan, no se persiguen |

⭐⭐ **Y se invierte el signo del hallazgo, que es lo que hay que tener presente al escribir la Parte
C: una suma que no cierra ya NO es un hallazgo, y una que cerrara SÍ lo sería** — significaría que
la solapa tiene un grano que la medición no encontró.

⚠ **Lo que la decisión arrastra va en un prompt aparte, DESPUÉS de B y C**, para redactar el rótulo
sabiendo qué publica realmente la lámina con el corte nuevo. Queda escrito acá para que no se
pierda:

1. **Un `D-NN` en `PLAN.md`** con la decisión y su motivo, para que nadie «arregle» la lámina más
   adelante sumando mal.
2. **El rótulo en la lámina**, con una pregunta de propiedad abierta: la plantilla es del equipo
   (`C-01`), así que **o el rótulo viaja en un token que el motor completa, o lo edita el equipo**.
   ⭐ Preferible lo primero — así no se pierde con una plantilla nueva.
3. **Un aviso en el reporte de corrida cuando la ventana cerró hace menos de dos días**, por el
   asentamiento de DV360.

---

## 1 · La decisión que se aplica

**Tres solapas cambian**, las tres que hoy infieren el ámbito del texto del nombre:

| solapa | campo lógico | `ambito.jm` nuevo | `ambito.gcba` nuevo |
|---|---|---|---|
| `looker\|DIGITAL` | `ldig_id_cuenta` | `ldig_id_cuenta~=JDGAG` | `ldig_id_cuenta!~=JDGAG` |
| `digital\|CAMPAÑAS_DESGLOCE_DIGITAL` | `des_id_cuenta` | `des_id_cuenta~=JDGAG` | `des_id_cuenta!~=JDGAG` |
| `looker\|resumen_metricas_dinamico` | `id_cuenta` | `id_cuenta~=JDGAG` | `id_cuenta!~=JDGAG` |

⛔ **Tres solapas NO se tocan** — ya tienen columna de ámbito propia y funcionan:
`digital|Directa IVR` (`ivr_vocero`), `digital|Directa Mail` (`mail_remitente`),
`rdv|RVD JM-CM - ES` (`figura`). **Una variable por vez.**

⭐ **`~=` alcanza y no hace falta un operador nuevo.** Medido sobre los artefactos del 30/08:
`JDGAG` aparece **531 veces en cada solapa y siempre como sufijo** —cero casos en otra posición— y
**en ninguna otra columna**. Un operador «termina en» no existe en el vocabulario
(`~=`, `!~=`, `=`, `!=`) y este caso no lo pide.

⚠ `gcba` sigue siendo **la negación**, no un valor propio (`D-33` intacto).

---

## Parte 0 — Verificación de premisas · **sólo lectura** · Sonnet · effort normal

Todo contra las **hojas vivas**, con el lector arreglado, y **verificado con los dos lectores**
(`tools/leer_xlsx_por_referencia.py` y openpyxl) como manda `CLAUDE.md` §4.

**P1 · `JDGAG` es sufijo y es exclusivo.** En las tres solapas: cuántos `Id cuentas` lo contienen,
cuántos terminan con él, y **si aparece en alguna otra columna** que un filtro pueda direccionar.
⛔ Si «contiene» ≠ «termina en» aunque sea en una fila, **parar**: `~=` deja de ser seguro y la
decisión del §1 se reabre.

**P2 · Los campos lógicos existen en `MAPEO`** para las tres solapas, apuntando a la columna del
`Id cuentas`. ⚠ `looker|DIGITAL` tiene **dos** filas sobre la columna A —`clave_ventana` y
`ldig_id_cuenta`—. **Confirmar cuál resuelve `leerFuente` para un filtro de dimensión**, y
reportarlo. Si es `clave_ventana`, la tabla del §1 cambia.

**P3 · `DIMENSIONES_.ambito` hoy.** Reportar las **seis** entradas enteras —las tres que cambian y
las tres que no— tal como están, para que el diff quede fechado.

**P4 · Los ocho `imp_*` en `MARCADORES`.** Confirmar que siguen sobre `looker|DIGITAL`, con
`filtro = estado=Activa` y `periodo_ref` vacío. ⚠ **La mudanza a medias sigue abierta**: si alguien
la aplicó desde la última medición, este prompt cambia de objeto — parar y reportar.

**P5 · El período.** `PERIODOS.2026_agosto_21_28` = 21–28/08, que es la ventana del tablero.

⛔ **Terminar acá: reportar y parar.** Si alguna premisa cae, decir cuál y qué arrastra.

---

## Parte A — Testigo ANTES · **sólo lectura** · Sonnet · effort normal

Sigue el patrón del testigo de `DIMENSIONES_.etapa` que ya existe en `Auditoria.gs`: **se corre dos
veces, antes y después del cambio, en la misma sesión.**

Registrar, con el criterio **actual** (por nombre):

1. Las seis entradas de `DIMENSIONES_.ambito` serializadas.
2. Los **ocho `imp_*`** con su valor, y para cada uno **el conteo de filas** que lo produce.
3. Lo mismo para `frecuencia` y `gcba_frecuencia`, que también usan `ambito` sobre
   `resumen_metricas_dinamico`.

⚠ Guardarlo en un archivo del repo, no sólo en el log. Si el cambio hay que revertirlo, esto es lo
único que dice a qué se vuelve.

---

## Parte B — El cambio · **Opus** · effort alto

Aplicar la tabla del §1 sobre `DIMENSIONES_.ambito` en `Fuentes.gs`, y `clasp push`.

⚠ **`DIMENSIONES_` es una `var` en código, no una hoja de registro** — el frente `13 bis` sigue
abierto. Así que esto **no** es un cambio de configuración: es un cambio de código que pide push, y
revertirlo pide otro. Dejarlo dicho en el commit.

**Comentario obligatorio en el código**, con el mismo peso que el del 28/08 que está al lado:

- qué reemplaza y por qué — el corte por nombre pierde 5 de las 29 implementaciones JM de la
  ventana medida, el corte por `Id cuentas` pierde 1;
- la evidencia que decidió, que es el **diferencial** y no los totales: de 343 filas de la ventana,
  6 discrepan, las seis `AGOJDGAG`, las seis POST del «1 a 1» y de RDV, y `C1` acierta las seis;
- **por qué `JDGAG` y no la terminación `AG`**: `SEGAG` son 9 filas de `2475-ENESEGAG`
  —«Recorrida por Servicio Penitenciario de Marcos Paz»— donde el prefijo de área es `SEG`, ninguna
  dice «JM» en el nombre, y la columna `JM | GCBA | POLICIA` dice `GCBA`. Tres criterios en contra;
- ⛔ **por qué NO se usó la columna T** aunque se llame literalmente `JM | GCBA | POLICIA`:
  contradice al nombre en 530 de 620 filas, y sus marcas `JM` se cortan en abril de 2026.
  Decidido el 27/08 y confirmado con esta medición.

---

## Parte C — Testigo DESPUÉS y corrida · **Opus** · effort alto

1. **Repetir la Parte A** con el criterio nuevo, **en la misma sesión**, y reportar el diff token
   por token.
2. **Correr el informe `jm`** con `periodo_id = 2026_agosto_21_28`.
3. **Comparar contra el tablero** (§0), reportando por celda: conteo de filas del motor contra
   implementaciones del tablero, y la suma con su porcentaje.

**Lo que hay que responder, explícito:**

- ¿Los conteos dan 10/10/9 y 100/60/120, o cuánto se apartan?
- ¿Las sumas siguen en el orden de 134 % y 251 %? ⭐ **Si cerraran, eso sería una sorpresa y hay que
  investigarla, no celebrarla**: significaría que la solapa tiene un grano que la medición no
  encontró.
- ¿Algún token que no sea `imp_*` cambió de valor? No debería: sólo cambian los que usan `ambito`
  sobre esas tres solapas. Si cambió otro, es un efecto no previsto y **hay que parar**.

---

## Parte D — El testigo de las filas sin marca · Sonnet · effort normal

Decisión del usuario: **caen en GCBA como manda `D-33`, pero dejan constancia.**

Agregar al reporte de corrida —no al deck— la lista de filas que **ningún criterio ubica**: sin
`Id cuentas` válido, sin «JM» en el nombre y con la columna de ámbito vacía o `Sin Tipo`. Por cada
una: solapa, `Id accion`, nombre, plataforma e impresiones, más el **total y su porcentaje sobre el
GCBA publicado**.

⚠ Sobre el artefacto del 30/08, en la ventana 21–28/08 son **2 filas y 4.793.072 impresiones —
4,5 % del GCBA del tablero**, más del doble del ruido de la referencia. No es un caso borde.

---

## Parte E — Documentación · Sonnet · effort normal

`docs/` con el resultado, y las entradas que correspondan en `PLAN.md` y `BITACORA.md`.

⛔ **La conclusión que no puede faltar, y va primero:** el corte quedó resuelto y **eso no habilita
a publicar `L-031` ni `L-032` como cifras de la semana**. La fuente no tiene grano diario. Quien
lea «corte cableado» tiene que encontrar en la misma pantalla que las láminas siguen sin poder
validarse.

**Y lo que queda abierto**, con dueño:

- ⛔ **El grano temporal.** Único bloqueante. El tablero lo tiene y las planillas no.
- ⛔ **El atraso de `looker/DIGITAL`** como causa propia de discrepancia en decks ya publicados.
- ⛔ **La mudanza a medias de los ocho `imp_*`**: `DIMENSIONES_` declara el desglose, `MARCADORES`
  apunta a `looker|DIGITAL`.
- ⛔ **El pendiente `P0` del `Libro` compartido**, en el orden de la tabla de exposición.
- ⚠ **`13 bis`**: mientras `DIMENSIONES_` siga siendo una `var`, cada cambio de corte es un push.

---

## Agregado a la Parte C (30/08/2026) — cómo leer la brecha de GCBA

Medido sobre el artefacto del 30/08, ventana 21–28/08, corte `JDGAG`:

| | Meta | Google | DV360 | total | tablero | |
|---|---|---|---|---|---|---|
| **JM** | 10 | 9 | 9 | **28** | **29** | falta **1** |
| **GCBA** | 102 | 69 | 128 | **299** | **280** | sobran **19** |

⭐ **El reparto del error descarta al corte como causa.** Si el corte clasificara mal, los errores
serían **complementarios**: cada fila mal puesta en GCBA sería una fila faltante en JM. Falta 1 y
sobran 19. ⇒ **hay ~18 filas que la ventana de solape selecciona y que el tablero no cuenta en
absoluto.**

**Probados y descartados:** siete variantes de filtro por estado (col K). Ninguna cierra. Sacar
`PAUSADA` lleva GCBA a 281 pero **rompe JM a 24**.

**En la Parte C, además del diff, medir:**

1. **Las ~18 filas de exceso, listadas**: `Id accion`, `Id cuentas`, nombre, plataforma, fechas,
   estado. **¿Comparten algo?**
2. **La fila de JM que falta.** ¿Qué campaña es y por qué no entra?
3. **¿La ventana de solape es la del tablero?** Probar también «`Fecha inicio` dentro» y
   «`Fecha fin` dentro» **contra los conteos, no contra las sumas**.

⛔ **NO tratar la brecha de GCBA como un fallo del cableado.** El cableado se juzga por el
diferencial de la Parte B —6 filas, las seis bien resueltas— y por JM. **La brecha de GCBA es una
pregunta abierta sobre el universo**, y entra al documento como tal.

---

## Agregado a la Parte C (30/08/2026, 18:00) — la distancia al cierre es un dato de la corrida

⭐⭐ **Registrar, con la corrida, la distancia entre el cierre de la ventana y el momento de
generarla.** No es metadato: es **una causa de discrepancia por derecho propio**, y la única barata
de eliminar.

**El caso que la funda:** `jm-20260828-193948` se generó el **28/08 a las 19:41**, el mismo día en
que cerró su ventana — y el tablero siguió moviendo **más de un millón de impresiones de DV360**
durante los dos días siguientes, hasta consolidar el 30/08 entre las 15:47 y las 18:00. **Esa
corrida leyó DV360 lejos de su valor final.**

⛔ **Y correr contra la lectura CONSOLIDADA del tablero, no contra la del día del cierre** —
`Tablero_carga_21-28ago_lectura_2026-08-30_1800.png`. Comparar contra una referencia que todavía se
está asentando mide el asentamiento, no el cableado.

---

## Agregado a la Parte C (30/08/2026, tras la toma ANTES) — la ventana, y dos criterios de aceptación

### ⭐⭐ La Parte C corre con `2026_agosto_21_27`, no con `21_28`

**Verificado por calendario:** `2026-08-21` es **viernes** y `2026-08-27` es **jueves** — 7 días,
la semana vie-jue que `PERIODOS` describe y que **`R-11` ya calcula solo**. `2026_agosto_21_28` son
**8 días y contiene dos viernes**: no es una semana.

⭐ **Y el testigo no necesita ningún cambio:** `R-11` resuelve a 21–27 en las dos tomas, así que
testigo, corrida y tablero quedan sobre la **misma ventana** sin tocar nada.

### ⚠ Hipótesis a CONFIRMAR, no a asumir: el límite superior del tablero es exclusivo

El tablero rotula «21 ago 2026 - 28 ago 2026». Con una semana vie-jue de 7 días, lo más probable es
que **el límite superior sea exclusivo** — la convención de un selector de rango. Si lo es, tablero
y motor miran los mismos 7 días.

**La prueba:** los conteos con 21–27 tienen que acercarse a `10/10/9` y `100/60/120` **más** que con
21–28. Sobre el fixture daban **JM 10/9/9** y **GCBA 92/62/119** — mejor que 21–28, sin cerrar.

⛔ **Reportar el resultado vivo y NO declarar confirmada la hipótesis si no cierra.** Quedaría como
pregunta para el equipo.

### ⭐ Dos criterios de aceptación que salen de la toma ANTES

1. ⭐⭐ **`gcba_frecuencia` tiene que SEPARARSE de `camp_frecuencia`.** En la toma ANTES valen
   **exactamente lo mismo** —`6,265164242375123`— porque `gcba` se lleva **26 de 26** filas.
   `camp_frecuencia` no lleva `ambito` y **no se puede mover**. Así que **si el criterio nuevo mueve
   una sola fila a JM, los dos tienen que separarse.** Si siguen idénticos al dígito, el cambio **no
   tocó `resumen_metricas_dinamico`** — y eso es un resultado, no un detalle.
2. **`frecuencia` sale de `sin_datos`, o se explica por qué no.** Hoy publica `sin_datos` con
   `0 de 26` filas. La lectura es que **el cero es de la ventana y no del criterio** —sobre el
   fixture los dos criterios se solapan casi enteros: 75 con «JM» en el nombre, 67 con `JDGAG`,
   **65 en ambos**—. ⚠ **Verificarlo en la segunda toma antes de darlo por independiente**: con
   21–27 puede cambiar.
