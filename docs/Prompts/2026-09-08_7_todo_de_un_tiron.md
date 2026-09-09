# `2026-09-08_7` · Los tokens nuevos, de un tirón — un solo botón

**Destino:** `docs/Prompts/`. **Estado:** no ejecutado.
**Reemplaza** a los borradores `2026-09-08_5` y `2026-09-08_6`, que no se entregaron.
**Modelo: Opus, effort alto, todo el prompt.** Escribe filas que van a publicar.

⛔ **Los guiones NO entran acá.** Levantar el `_revisar` de lo validado (`D-60`) va **después**, en
su propio prompt y su propio deck: este llena `/////` y aquél reescribe rótulos de números que ya se
publican. **Primero los huecos, y con la corrida de éste como línea de base.**

⛔⛔ **Code llega hasta `clasp push`. Los botones los aprieta el usuario** — `CLAUDE.md` §4, *quien
implementa no se autoverifica*, y las corridas de Apps Script no son un camino de Code. Por eso
este prompt **no tiene Partes 0/A/B/C que esperen turnos**: Code hace todo lo que puede hacer solo
—medir sobre `docs/_fixtures/`, escribir el wrapper, commitear, pushear, documentar— y deja **un
botón**.

---

## 0 · Las decisiones ya están tomadas. Esto no es un censo

**Tomadas por el usuario el 08/09 y por esta conversación. No se re-litigan, no se amplían.**

| # | decisión | consecuencia |
|---|---|---|
| **D1** | La columna **Envío** de `L-047` publica el **ámbito**, no el mail: el mail de Jorge Macri es `JM`, cualquier otro es `GCBA` | ver el gate `G1` — hoy **no hay camino declarativo** y por eso el gate puede dejarla sin escribir |
| **D2** | `camp_env4_fecha` **ya tiene sus llaves** en la plantilla (usuario) | entra como una fila más, con gate `G2` |
| **D3** | Los tres `gcba_cc_*` son **copia exacta de los de JM con `ambito=gcba`** | `DIMENSIONES_` ya declara `acc_remitente=GCBA` — **cero código nuevo** |
| **D4** | Los tres `gcba_cc_*` nacen **con `_revisar`** | no tienen testigo publicado. Es la misma figura que `C-116` |
| **D5** | `cc_campanias` y `gcba_cc_campanias` **NO entran** | `C-112` abierto: 4 candidatas y nada que las separe. El hueco es **deliberado** y se declara |
| **D6** | Los cuatro bloques van **en el mismo botón y en el mismo deck** | ver §2 — los cuatro llenan `/////` |
| **D7** | ⛔ **Los guiones quedan para el prompt siguiente**, con dos excepciones ya decididas | ver §1, que se escribe acá para no perderla |

---

## 1 · Las dos excepciones del prompt de guiones — decididas hoy, se aplican después

⚠ **Van escritas acá porque se decidieron acá y no tienen otro lugar todavía.** El prompt de
levantamiento las hereda; **este prompt no las ejecuta.**

⛔ **`post_habitantes1` y `post_alcance1` — una identidad viva que no cierra.**
En el deck del 24–30/07 publican **15.567** y **63.898** ⇒ **cobertura 410 %**. La identidad
`% Cobertura = Alcance / Habitantes` cerraba en **89 de 89** filas de la fuente. **Un caso `exacto`
sobre una foto no habilita a publicar sin marca lo que una identidad viva desmiente hoy** — es la
lección del 26/08: *un control contra constantes caduca cada vez que la fuente respira; uno contra
identidades internas no caduca nunca.*

⚠ **Esto es independiente de la ventana.** El usuario declaró que la campaña y la reunión de ese
deck son de prueba y que el universo sale del temario. *«Es de otra semana»* **no es un hallazgo y
no se reporta.** El alcance mayor que los habitantes **sí**.

⛔ **Los ocho `imp_*` — marcados por `D-58`, no por falta de caso.**
`imp_total` y `gcba_imp_total` tienen caso `exacto` vigente, así que `D-60` **los habilitaría**.
Quedan marcados igual porque su `_revisar` está por **universo y grano temporal**: `Impresiones` es
el total de vida de la campaña y la fuente no tiene semana. **Sin guiones publicarían un acumulado
con cara de cifra semanal, en un Resumen Ejecutivo, sin nada que lo diga** — es la figura de RRSS.

⭐ **Va escrito como decisión con su condición de salida, no como un pendiente:** *se levantan el día
que exista una fuente con grano semanal, o el día que la lámina los rotule «acumulado».* La segunda
es del equipo (`C-01`), no del motor.

---

## 2 · Por qué los cuatro bloques entran en el mismo deck, y cuál es el control

**La regla del repo es que un cambio que MUEVE un número va solo.** Los cuatro bloques de acá
—`gcba_cc_*`, la columna Envío, `camp_env4_fecha` y los de `L-034`— **llenan `/////`: no hay número
que mover**, y por eso entran juntos (`CIERRE_POR_LAMINA.md`, la columna 🕳).

⇒ ⭐⭐ **El control de esta corrida es exactamente ése: NINGÚN valor que ya se publicaba puede
cambiar.** Si un número se movió, no fue ninguno de estos cuatro bloques y **hay que parar**.

⭐ **Y por eso los guiones van después y no antes:** esta corrida es la línea de base contra la que
se va a medir aquélla.

---

## 3 · Lo que Code hace, de un tirón

### 3.1 · Medir sobre disco, antes de escribir una línea

Sobre `docs/_fixtures/` —**verificando el `sha256` contra la tabla de huellas antes de citar
cualquier número**— y sobre el snapshot vivo de `MARCADORES`:

1. **`L-034` — qué token llena cada casillero.** Listar sus tokens contra la plantilla y decir cuál
   tiene fila y cuál no.
   ⛔⛔ **El desenlace que MANDA PARAR:** el deck del 24–30/07 es **posterior** al cableado de
   `cc_base`/`cc_contactados`/`cc_contact_pct`; `L-031` publica sus valores y **`L-034` los publica
   `/////`**. Si la lámina usa **esos mismos nombres**, no es un hueco de fila: **es un token que
   existe y no resuelve.** Reportar y **no escribir nada de `L-034`**.
   ⚠ El censo de tokens sin fila del 22/08 queda **vencido para esta lámina**, lo diga lo que diga.
2. **`digital/Directa Mail`, columna T (`mail_area`)** — qué valores trae en la ventana, y si
   discrimina JM de GCBA fila por fila. **Es el gate `G1`.**
3. **Cuántas filas de envío** trae la ventana del informe. Está medido que una cuenta supera los
   cinco envíos y hoy **el sexto se pierde en silencio**. Declarar el número.
4. **`censarTokensSinLlaves()` está escrito y nunca corrió** — no lo puede correr Code. **Dejarlo
   nombrado en la lista de botones del §5**, no simularlo.

### 3.2 · Escribir UN wrapper, con sus gates adentro

Una sola función nueva —`aplicarTanda20260908()`, con su `diagAplicarTanda20260908()` en **modo
seco**— que hace, **en este orden y abortando entero si un gate falla**:

**Los gates, todos ANTES de la primera escritura:**

| gate | qué exige | si falla |
|---|---|---|
| **G0** | `SOLAPAS` declara `acumulado/Call Center - Métricas` con `uso = fuente` y `ventana_ref = propia` | ⛔ aborta todo — es el gate de `C-115`, que ya existe y se reusa |
| **G1** | ⭐ existe un **camino declarativo** para que la celda diga `JM`/`GCBA`: `mail_area` discrimina, o `MAPEO` tiene otra columna que lo haga | ⛔ **las cinco `camp_envN_rem` NO se escriben.** Se deja el `/////` y se reporta. ⛔⛔ **NO se cablea el mail crudo**: llena el hueco publicando algo que el equipo no publica, y un hueco que parece cerrado es peor que un hueco |
| **G2** | `camp_env4_fecha` tiene `{{` en las **dos** plantillas | esa fila sola no se escribe; el resto sigue |

**Después de los gates, y con `backupMarcadores_()` primero:**

- **A ·** las **tres** filas `gcba_cc_*`: `informe_id = jm`, `base_id = acumulado`,
  `solapa = Call Center - Métricas`, `campo_logico` `acc_base_barrida` / `acc_contactados` /
  `acc_contactados/acc_base_barrida`, `operacion` `SUMA` / `SUMA` / `PCT`,
  **`dimensiones = ambito=gcba`**, `formato` `miles` / `miles` / `porcentaje_sin_signo`, **los tres
  con `_revisar`** (`D4`). ⚠ El cociente va en `campo_logico` con `/`: **la aritmética la hace
  `opPCT` y ningún otro lado.**
- **B ·** las **cinco** `camp_envN_rem` (1 a 5) y **`camp_env4_fecha`**, copia de sus hermanos de
  envío 1 cambiando sólo `valor_fijo`. `operacion = FILA`, `separador = fecha_periodo`.
  ⚠ `camp_env1_rem` **ya existe**: se **reescribe** para que las cinco digan lo mismo. Declararlo
  como reemplazo, no como alta.
- **C ·** los de `L-034` que 3.1 haya identificado **con su fuente**. Cualquiera sin fuente
  identificada **no se escribe**: se lista.
⛔ **Ninguna de las cuatro toca el `formato` de un marcador que ya existe fuera de estas listas.**
El levantamiento de guiones es el prompt siguiente.

⭐ **Relectura desde la hoja al final, marcador por marcador.** Un escritor que informa lo que
escribió no verifica nada.

⛔ **Nada más.** No se toca `Fuentes.gs`, ni `DIMENSIONES_`, ni ninguna plantilla, ni ninguna
planilla de terceros, ni una fila que no esté en las cuatro listas.

### 3.3 · Testigo, commit, push, docs

- **El testigo va DENTRO del wrapper**, no como paso aparte: imprime el estado ANTES y, tras la
  relectura, el DESPUÉS, con **la ventana en el encabezado** —el testigo toma el default de `R-11` y
  eso ya produjo una contradicción aparente entre dos números correctos.
- `clasp push` **en su propio comando, después de leer el resultado de las suites**. Un
  `&& clasp push` despliega precisamente cuando hay rojos.
- `docs/` con el resultado, y las entradas en `PLAN.md`, `BITACORA.md` y `CIERRE_POR_LAMINA.md`.

**Y tres correcciones documentales que este prompt obliga:**

1. `HANDOFF_CODE.md` — *«las tres filas de `MARCADORES` NO están escritas»* está **vencido**: el
   deck del 24–30/07 publica **6.011 · 1.878 · 31,2 %**, que son sus testigos (`V-126`, `V-128`,
   `V-129`). ⇒ **el ítem 37 de la cola se tacha.**
2. `CIERRE_POR_LAMINA.md` — *«cablear uno pinta las dos láminas»* está **desmentido**: `L-031`
   publica y `L-034` sale `/////`.
3. `CONFIG_INFORMES.md` — **`D1` no vive en ningún lado y tiene que vivir en uno.** Escribir que la
   columna Envío publica el ámbito, **y que es la misma condición que `DIMENSIONES_` aplica sobre
   `digital|Directa Mail`**: si mañana cambia el mail de JM, **cambian las dos cosas o se
   desincronizan en silencio.** Con eso **el ítem 15 se cierra**.

---

## 4 · El reporte final, en este orden

1. ⭐ **Qué gate falló, si falló alguno**, y qué bloque se cayó con él.
2. Las filas escritas, con su relectura al lado.
3. Lo que **no** se escribió y por qué.
4. ⭐ **La lista del grupo (a) de `diagGuionesPorLamina()` tal como esté hoy**, sólo para dejarla
   fechada — **sin levantar ninguna**. Es el insumo del prompt siguiente.

---

## 5 · Los botones, que son del usuario

En este orden, leyendo cada resultado antes del siguiente:

1. **`diagAplicarTanda20260908()`** — modo seco. Reporta y no escribe.
2. **`aplicarTanda20260908()`** — escribe.
3. **Corrida del informe `jm` con `periodo_id = julio_24_30`** — el único período con testigo de
   Call Center. ⛔ **No el default de `R-11`.**
4. **`censarTokensSinLlaves()`** — escrito el 03/09, nunca corrido. Independiente de esta tanda.
5. **`diagGuionesPorLamina()`** — sólo para tener la lista fechada. ⛔ **No correr
   `aplicarGuionesValidados()`**: es el prompt siguiente.

**Lo que la corrida tiene que contestar:**

- ⛔⛔ **¿Cambió algún valor que ya se publicaba?** **No debería cambiar ninguno** (§2). Si se movió
  uno, **parar**.
- ¿`gcba_cc_base` y `gcba_cc_contactados` publican, y son **distintos** de los de JM? Si dan lo
  mismo, el ámbito no discriminó.
- ¿`cc_base` / `cc_contactados` / `cc_contact_pct` de `L-031` **siguen en 6.011 / 1.878 / 31**?
- ¿La columna Envío dice **`JM` en la primera fila**? Es el control positivo: su remitente es el
  mail de Jorge Macri. **Si dice el mail, el mapeo no se aplicó.**
- ¿`camp_env4_fecha` publica, o sigue crudo?
- ¿`L-034` llenó, y con qué universo? ⚠ Los `cc_*` están validados **para `L-031` y para ninguna
  otra lámina**: si pintan la 5, **la 5 queda «pintada sin control»** hasta que exista un caso que
  la mida. **No se cierra de arrastre.**

---

## 6 · Lo que sigue abierto y este prompt no toca

⭐ **el levantamiento de guiones, que es el prompt siguiente y ya tiene sus dos excepciones
decididas (§1)** · `cc_campanias` (`C-112`) · el `%` de agosto sin testigo (`C-116`) · si `Remitente` es **necesario** o
sólo suficiente (`C-117`) · **el grano temporal**, que es el bloqueante de fondo · la cobertura de
`L-036` que no cierra · el sexto envío que se pierde en silencio · el ítem 36 · el ítem 9
(`camp_titulo`) · la deuda documental de los catorce prompts del 04/09.
