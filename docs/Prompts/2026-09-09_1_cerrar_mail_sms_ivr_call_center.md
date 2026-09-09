# `2026-09-09_1` · Cerrar Mail, SMS, IVR y Call Center — alta, medición y las cinco filas

**Destino:** `docs/Prompts/`. **Estado:** no ejecutado.
**Continúa** `2026-09-08_7`, ejecutado el 08/09 23:13, y los tres censos del 09/09.

⛔⛔ **La Parte B mueve la columna Envío de `L-047`.** Partes B y C en **Opus, effort alto**.

⭐ **La pata digital del grano temporal queda EN ESPERA por decisión del usuario (09/09).** Este
prompt cierra los cuatro canales de Directa y **declara** lo digital como abierto — no lo silencia,
no lo mide y no lo trata como resuelto.

---

## 0 · Lo que los censos del 09/09 dejaron medido

**Cinco hallazgos, y los cinco cambian algo:**

1. ⭐⭐ **`acumulado | Remitentes` es el catálogo, ya hecho:** 30 filas × 2, `Mail` → `Remitente`.
   Misma forma que `rdv | Comunas`, que ya está registrada `uso = referencia`.
2. ⭐ **Los cuatro canales tienen el ámbito resuelto en columna**, sin literales:
   `Mail` col **AI `Remitente`** · `IVR` col **G `Vocero`** · `SMS` col **U `Remitente`** ·
   `Call Center - Campañas` col **E `Remitente`**.
3. ⛔ **El gate de `R-02` del borrador anterior era incorrecto y se retira.** Las 38 solapas de
   `acumulado` son `IMPORTRANGE` de un mismo libro externo; con la regla como estaba, **la base
   entera quedaba fuera, incluida `Call Center - Métricas`, que ya está `uso = fuente`.**
   ⭐ **La distinción que sí importa:** `IMPORTRANGE` desde **otro libro** es un **espejo** —dato
   nuevo para este libro, puede ser fuente—; una fórmula que referencia **otra solapa del mismo
   libro** es **derivada**. El caso genuino acá es `M2 - Gráficos2`, que hace `LET`/`FILTER` sobre
   `M2 - Gráficos`.
4. ⛔⛔ **`looker` espeja las mismas tres solapas, fila por fila:** `looker | MAIL` **6.170**,
   `looker | IVR` **197**, `looker | SMS` **103** — **los mismos conteos exactos** que
   `acumulado | Mail`, `| IVR` y `| SMS`. Las tres de `looker` están en `uso = ignorar`, así que
   hoy no hacen daño. **Pero `looker | CC` sí está `uso = fuente`, midiendo lo mismo que
   `acumulado | Call Center - Métricas`.** Dos fuentes para un mismo número.
5. ⭐⭐ **Hay grano semanal en `acumulado`, y con ámbito.** Ver §4. **No resuelve el bloqueante**,
   pero desmiente su formulación general.

---

## 1 · La regla del mail, y lo que disuelve

⭐⭐ **Decisión del usuario, 09/09 — vale para los cuatro canales:**

| | de dónde sale el ámbito |
|---|---|
| **lo agregado** (totales por ámbito) | la columna de remitente/vocero, que ya dice `JM` o `GCBA` |
| **lo no agregado** (el detalle de una campaña) | **no se filtra por ámbito**: entra todo lo que tenga el `Id cuentas` de lo que se está midiendo |

⛔⛔ **Y eso disuelve un defecto que iba a quedar abierto.** Hay **dos** direcciones de Jorge Macri
en circulación —`DIMENSIONES_` compara contra `jorge.macri@buenosaires.gob.ar`, y
`acumulado | Barrios Priorizados` y `BP 2` traen `jmacri@buenosaires.gob.ar`—. Mientras el ámbito
sea **un literal de mail en el código**, una dirección no contemplada manda envíos de JM a GCBA sin
fallar y sin avisar. **Con la columna `Remitente` no hay literal que mantener.**

⚠ **Medirlo igual** (§2.2 punto 5), porque dice cuánto se corrige. ⛔ **No arreglarlo acá:** cambiar
`DIMENSIONES_` mueve números publicados de `L-031` y `L-032` y va en su propio deck.

---

## Parte 0 — El alta y la medición · **Sonnet** · effort **alto**

### 0.1 · El alta, acotada a una base

⛔ **`inventariarSolapas()` recorre las 7 bases y se pasó de los 6 minutos** —murió por timeout el
09/09—. **Escribir la variante acotada** `inventariarSolapasDeBase_(baseId)` y un botón
`inventariarSolapasDeAcumulado()`.
⭐ **No es un parche: cada alta futura la va a necesitar.**

**Se registran siete solapas de `acumulado`:**

| solapa | `uso` | qué trae |
|---|---|---|
| `Remitentes` | **referencia** | el catálogo `Mail → Remitente`, 30 filas |
| `Mail` | **fuente** | 6.170 filas · `ID cuentas` A · `Fecha envio` F · `Mail remitente` G · métricas M–R · **`Remitente` AI** · `semana` X |
| `IVR` | **fuente** | 197 filas · `ID cuentas` A · **`Vocero` G** · métricas J–Q · `semana` W |
| `SMS` | **fuente** | 103 filas · `ID cuentas` A · métricas F–J · **`Remitente` U** · `semana` M |
| `Call Center - Campañas` | **fuente** | 2.975 filas · `ID cuentas` C · `Nombre de la campaña` D · **`Remitente` E** · `Herramienta` G |
| `Mail x Sem x Rem` | **referencia** | ⚠ bandas: bloque `JM` en A–D y `GCBA` en F–I |
| `Herramientas x Semana` | **referencia** | ⚠ bandas y encabezado en **dos filas** |

⛔⛔ **Las dos últimas tienen banda en la fila 1 y títulos en la fila 2.** **Declarar
`fila_encabezado` explícito, nunca asumir 1** — es cómo se rompen las solapas río abajo, y
`SOLAPAS.firma_encabezado` existe para que se vea a simple vista.

⚠ **Las de `uso = fuente` se registran «por si llegan a necesitarse» (usuario, 09/09): quedan
disponibles y NO se cablea ningún marcador sobre ellas acá.** Dejarlo escrito, para que una solapa
`fuente` sin marcadores no se lea después como un cableado que falta.

⭐ **`MAPEO` sólo para lo que la Parte B necesite.** No mapear columnas por las dudas.

### 0.2 · La medición — cinco preguntas

Sobre la ventana **`julio_24_30`** y el `Id cuentas` de la campaña destacada:

1. ⭐⭐ **Cuántas filas de envío trae `digital | Directa Mail` y cuántas `acumulado | Mail`**, para
   ese mismo `Id cuentas`. **Declarar los dos números aunque coincidan.**
2. ⭐⭐ **¿Coinciden fila por fila?** Comparadas por `Fecha envio` + `Enviados`, **nunca por
   posición**. **Es el gate que elige el camino de la Parte B.**
3. **Qué remitentes distintos** trae cada una, y si **los 30 mapeos del catálogo los cubren a
   todos**. ⛔ Un remitente sin mapear publica vacío o el mail crudo; las dos son peores que
   `/////`.
4. **Los valores de la columna `Remitente` de `acumulado | Mail`**: ¿son `JM` y `GCBA` y nada más?
   ⚠ **Ojo con el espacio final** — `'JM '` ya cayó en el ámbito contrario en `Directa IVR`, y con
   `=JM` eso es un número mal, no un caso borde. **Reportar si el comparador recorta espacios.**
5. **Las dos direcciones de Jorge Macri:** cuántos envíos de la ventana trae cada una, y **cuántos
   cambiarían de ámbito** si el criterio pasara de literal a columna.

⛔ **Terminar acá: reportar y parar** si algo de esto cae. Si los cinco salen, seguir a la Parte A
en la misma sesión.

---

## Parte A — Testigo ANTES · **Sonnet** · effort normal

**Con la ventana impresa en el encabezado.** El testigo toma el default de `R-11` y eso ya produjo
una contradicción aparente entre dos números correctos.

Registrar, con su valor y **el conteo de filas que lo produce**: los cinco `camp_envN_rem`,
`camp_env4_fecha`, los 40 tokens de envío de `L-047` con su GLOBAL, los cuatro `cc_*`, los cuatro
`gcba_cc_*`, los siete `ivr_*` y sus gemelos GCBA.

⭐ **El control positivo:** hoy `camp_env1_rem` publica `jorge.macri@buenosaires.gob.ar` y las otras
cuatro salen `/////`. Si después del cambio la primera **no** dice `JM`, el mapeo no se aplicó.

Guardarlo en un archivo del repo.

---

## Parte B — Las cinco filas · **Opus** · effort **alto**

⭐⭐ **El camino lo decide el punto 2 de la Parte 0, y está pre-decidido — Code no elige:**

| si las dos solapas… | camino | qué se hace |
|---|---|---|
| **alinean** fila por fila | **B · mudanza** | las cinco pasan a `acumulado \| Mail`, `campo_logico` = la col **AI**. **Cero código**, y una sola fuente de mail |
| **no alinean** | **A · catálogo** | las cinco se quedan en `digital \| Directa Mail` con `catalogo = acumulado/Remitentes`. ⛔ Pide que **`opFILA` honre `catalogo`** — hoy sólo lo leen `opLISTA` y `opELEMENTO` |

⛔ **Y si el camino es `A`, reusar el mecanismo que ya existe**: mismo formato `base/solapa`, misma
resolución. **Reportar explícitamente qué hace ante un valor que el catálogo no cubre** — publica
vacío, el crudo, o falla. Las tres se ven distinto en el deck.

⚠ **En el camino `B`, los otros 40 tokens de envío NO se mudan en este prompt.** Quedan dos solapas
alimentando la misma tabla, y **eso hay que declararlo como deuda**, no absorberlo: es la figura de
la mudanza a medias de los `imp_*`.

Con `backupMarcadores_()` primero:

- **`camp_env1_rem`** se **reescribe** —hoy fila 149.
- **`camp_env2_rem`** … **`camp_env5_rem`**, alta, iguales, cambiando sólo `valor_fijo`.
- `operacion = FILA`, `separador = fecha_periodo`, `formato = texto`.

⛔ **Las cinco nacen con `_revisar`.** Ningún caso las validó. Es la regla del diagnóstico del
08/09: **sin caso, el guión está bien.**

⭐ **Relectura desde la hoja, marcador por marcador.**

⛔ **Nada más.** No se toca `DIMENSIONES_` —ni para el §1—, ni ninguna plantilla, ni ninguna
planilla de terceros, ni un `formato` fuera de estas cinco filas.

---

## Parte C — Testigo DESPUÉS y corrida · **Opus** · effort **alto**

1. Testigo DESPUÉS, **misma sesión**, con la ventana en el encabezado. Diff token por token.
2. **Corrida de `jm` con `periodo_id = julio_24_30`.** ⛔ **No el default de `R-11`.**

**Responder, explícito:**

- ⭐⭐ **¿La fila 1 de la columna Envío dice `JM`?** Si dice `GCBA`, el mapeo no cubre esa
  dirección — y eso confirma el §1.
- ⛔ **¿Cada Envío se corresponde con su fila?** Cruzar contra `camp_envN_enviados`, que ya publica.
  **Es la única forma de ver una desalineación**, y en el camino `B` es obligatorio.
- ¿Las cinco publican, **entre guiones**?
- ¿`camp_env4_fecha` publica? Se escribió el 08/09 y su corrida quedó pendiente.
- ¿`gcba_cc_base` y `gcba_cc_contactados` publican, entre guiones, y **distintos** de los de JM?
  Se escribieron el 08/09 y **nunca se corrieron**. Si dan lo mismo que JM, el ámbito no discriminó.
- ¿`cc_base` / `cc_contactados` / `cc_contact_pct` de `L-031` **siguen en 6.011 / 1.878 / 31,2 %**?
- ⛔⛔ **¿Cambió algún otro valor?** **No debería.** Si se movió uno, **parar**.

---

## Parte D — Documentación · **Sonnet** · effort normal

`docs/` con el resultado, y las entradas en `PLAN.md`, `BITACORA.md` y `CIERRE_POR_LAMINA.md`.

**Lo que va como decisión, no como nota:**

1. ⭐⭐ **La regla del mail** (§1) — agregado por columna de remitente, desagregado por `Id cuentas`
   sin filtro de ámbito. **Es vocabulario:** va a `PLAN.md` como `D-NN` y a `CONFIG_INFORMES.md`, y
   **cierra el ítem 15**.
2. ⭐ **Espejo vs derivada** (§0.3), con su instancia: la regla vieja habría rechazado una base
   entera que ya tiene una solapa `fuente` adentro.
3. ⛔ **Las dos direcciones de Jorge Macri**, con el número medido, y qué las deja de importar.

**Correcciones documentales que este prompt obliga:**

- `HANDOFF_CODE.md` — *«las tres filas de `MARCADORES` NO están escritas»* está **vencido**: el deck
  del 24–30/07 publica **6.011 · 1.878 · 31,2 %**, sus testigos `V-126`/`V-128`/`V-129`.
  ⇒ **el ítem 37 se tacha.**
- `CIERRE_POR_LAMINA.md` — *«cablear uno pinta las dos láminas»* está **desmentido**: `L-031`
  publica y `L-034` sale `/////`.
- ⛔ **El grano temporal.** *«Ninguna solapa guarda impresiones por semana»* se escribió el 30/08
  midiendo `looker` y `digital`, y **para Directa es falso** (§4). **Reformularlo: lo que falta es
  el grano semanal de impresiones DIGITALES.** Es una afirmación más chica y más cierta.

---

## 4 · El grano semanal de Directa — se declara, no se cablea

**Medido en los censos del 09/09, y nadie lo había levantado:**

| solapa | qué trae |
|---|---|
| `Mail x Sem x Rem` | enviados **por semana y por ámbito**, bloques `JM` y `GCBA` separados |
| `Herramientas x Semana` | Call Center llamados · Mail entregados · SMS · IVR audiencia, por año/semana, **más `JM ENVIADOS` y `GCBA ENVIADOS`** |
| `Implementaciones` | implementados por semana, con bloques `JM` y `GCBA` |
| `Mail` · `Barrios Priorizados` | `semana`, `semana_año`, `semana_lunes` **fila por fila** |

⛔ **Esto NO cierra el bloqueante.** Los tres primeros son **agregados por semana, no por campaña**,
y traen bandas. **Y son Directa, no impresiones digitales.**

⭐ **Pero desmiente la formulación general**, y esa corrección va en el §D.

⛔⛔ **La pata digital queda EN ESPERA por decisión del usuario (09/09).** Se declara abierta con
dueño; **no se mide en este prompt y no se da por resuelta.**

---

## 5 · Lo que este prompt deja abierto, con dueño

- ⛔ **El grano semanal de impresiones digitales** — en espera, decisión del usuario.
- ⛔ **El ámbito agregado por columna en vez de literal** (§1). Mueve `L-031` y `L-032`: **su propio
  deck.**
- ⛔ **`looker | CC` está `uso = fuente` midiendo lo mismo que `acumulado | Call Center - Métricas`**
  (§0.4). **Dos fuentes para un número.** Decidir cuál queda.
- ⚠ **`cc_campanias` (`C-112`)** — `acumulado | Call Center - Campañas` trae un universo contable
  con `Id cuentas`, nombre y `Remitente`. **Es un candidato nuevo que la medición del 04/09 no
  tenía.** Medirlo aparte antes de cablear.
- ⚠ **En el camino `B`: los 40 tokens de envío quedan en otra solapa que los cinco.**
- ⚠ **El barrido del `_7` leyó 2.482 de 2.524 filas** y sostuvo un negativo sobre el 98 %. Un
  barrido que sostiene un negativo va entero o declara el recorte.
- ⚠ **`gcba_cc_base` quedó con caso `C-108 (cerrado)` y sus dos hermanas sin caso**, habiendo nacido
  en la misma escritura.
- ⚠ **El sexto envío de `L-047` se pierde en silencio** cuando una cuenta supera los cinco.
- ⚠ **Los guiones** — el grupo (a) son **15**, medidos el 08/09. Prompt aparte.
