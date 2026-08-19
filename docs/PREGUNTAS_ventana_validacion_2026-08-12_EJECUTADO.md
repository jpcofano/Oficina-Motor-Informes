# Preguntas para la ventana de validación — 12/08 · EJECUTADO

Estado: **ejecutado el 12/08/2026**. Las cinco preguntas están contestadas. Este archivo queda
append-only: correcciones por addendum, no por edición.

Material usado: `Informe_2026-07-31.zip`, `Seguimiento_Digital2026-08-06.zip`, deck JM 19/06–26/06
y deck JM 31/07–07/08 (Drive). Casos emitidos: `V-80`–`V-85`, `C-39`–`C-49`, `A-09`–`A-11`,
`X-18`, `X-19`. Próximos libres: **`V-86`, `C-50`, `A-12`, `X-20`**.

---

## P-1 · `enc_alcance` — CERRADA. No se re-apunta.

**La dicotomía de la pregunta era falsa.** No es "período vs acumulado": es que la solapa no
tiene la métrica que el deck publica.

| encuentro | publicado | `digital/Alcance` 31/07 | `digital/Alcance` 06/08 |
|---|---|---|---|
| San Cristóbal 23/07 (`3354`) | 47.232 | 1.412 | 1.412 |
| Retiro 24/07 (`3346`) | 36.694 | vacío | 47.753 |
| Caballito 29/07 (`3420`) | 59.677 | vacío | 49.541 |
| N. Pompeya 31/07 (`3389`) | 79.461 | 52.012 (1 fila) | 52.012 + 22.362 (2 filas) |

Tres hallazgos, en orden de peso:

1. **`A-09`** — el alcance publicado nunca es la suma de los dos `ALCANCE` que la propia lámina
   imprime. **4 de 4, siempre menor.** Es alcance deduplicado entre las campañas PRE y POST.
   En las mismas láminas las impresiones **sí** suman exacto: la diferencia no es de foto.
2. **`C-39`** — la solapa no está clavada por `ID Cuentas`: 62 de 666 ids repiten fila (hasta 5).
   Un re-apuntado tendría que elegir cuál, y no hay columna que lo diga.
3. **`A-10`** — la única columna del ecosistema que expresa alcance deduplicado es
   `looker/Desglose Alcance.Alcance unificado`, y esa solapa está congelada: 269 de 270 filas son
   `2025 | Agosto`, sólo facebook e instagram.

**Decisión que habilita:** `enc_alcance` no se cierra con configuración. Requiere código **y antes**
una fuente que hoy no existe. Va a `PENDIENTES_consistencia.md` como hueco de fuente, no de cableado.

---

## P-2 · `enc_impresiones` — CERRADA. Las dos candidatas son la misma.

**`C-42`** — `digital/Digital 2026 acumulado` y `looker/DIGITAL` devuelven el mismo número en las
cuatro cuentas medidas (42.500 / 19.523 / 35.965 / 238.881). Los dos caminos de código llegan al
mismo dato. Elegir entre ellos no era una pregunta de datos.

**La respuesta real es otra — `C-41`:** la base tiene **una sola cuenta por encuentro** y el deck
publica **dos campañas**. Todo valor de base reproduce exacto *un bloque*, nunca el total:

- `3354` = PRE de San Cristóbal — imp 42.500 = 25.099+17.401, clics 1.274 = 778+496. Exacto.
- `3389` = PRE de N. Pompeya — imp 238.881 = 120.679+118.202, clics 1.072 = 820+252. Exacto.
- `3346` se llama *"Agenda Post"* y reproduce el bloque POST de Retiro.

**`C-43`** — el bloque PRE de Retiro sí está en la base, en **filas de `looker/DIGITAL` con
`Id cuentas` vacío**: Meta imp 75.021 / 965 clics y DV360 imp 284.353 / 430 clics, exactos. Hay 14
filas huérfanas así. El join por cuenta las tira en silencio — mismo modo de falla que `C-20`.

**Operación confirmada — `V-80`, `V-81`, `V-82`, `V-83`:** con las dos campañas presentes,
`enc_impresiones` = SUMA(PRE+POST × plataformas), exacta en Caballito (363.386) y N. Pompeya
(274.302). Ídem visualizaciones (sólo POST) y clics (PRE, más el POST que tenga).

**Decisión que habilita:** el token es re-apuntable, pero la clave no es la cuenta: es el par de
campañas del encuentro. Antes de escribir código hay que resolver cómo se nombra la segunda.

---

## P-3 · `m2_campanias` — CERRADA. La premisa del 03/08 es falsa.

**`C-44`** — los cuatro decks publican **lista y conteo**, y el conteo iguala siempre las líneas de
la lista: JM 19/06 "13 Proyectos"/13 · JM 31/07 "12 Campañas"/12 · SECCO 31/07 "11 Campañas"/11 ·
SECCO 07/08 "13 Proyectos"/13. No es conteo en `secco` y lista en `jm`. La palabra
(*Campañas* / *Proyectos*) es texto tipeado, no token.

Operación: **`LISTA` + `CUENTA(LISTA)`**, una sola, igual para los dos informes.

**`C-45`** — falsador de normalización cumplido: **30 distintos crudos == 30 normalizados**
(plegando espacios, case y acentos). La pregunta no tiene consecuencia hoy y no debe generar código.

**`X-18`** — quinto caso del patrón `X-16`/`X-17`: el deck publica 12 campañas y 26 envíos; la
ventana 24-31/07 trae 30 distintos y 32 filas (1.323.298 enviados vs 1.380.172 publicados); la
ventana viernes-jueves, 25 filas / 1.260.274. Ninguna reproduce ni el conteo ni la suma. La lista
publicada está agrupada a mano.

**Decisión que habilita:** el prompt `_37` sale con la premisa corregida. La operación es una sola;
lo que falta no es normalizar sino decidir quién produce la agrupación editorial.

---

## P-4 · alcance y clics — CERRADA por estructura, no por número.

**`C-46`** — `looker/ALCANCE` tiene `Alcance` y `Frecuencia` y **no tiene clics**;
`looker/DIGITAL` tiene `Impresiones`, `Visualizaciones` y `Clics` y **no tiene columna de alcance**.
No son dos candidatas para lo mismo: cada una tiene exactamente una de las dos métricas. No había
decisión de fuente que tomar.

**`A-11`** (queda abierto, es `C-26`) — desvíos medidos sobre el deck JM 24-31/07:

| campaña | alcance pub. | `ALCANCE` | clics pub. | `DIGITAL` |
|---|---|---|---|---|
| Egreso de mil cadetes (`3305`) | 3.178.282 | 3.042.983 (−4,3%) | 25.594 | 25.985 (+1,5%) |
| Operativo 1-11-14 (`3410`) | 806.121 | 1.016.280 (+26,1%) | 18.043 | 22.539 (+24,9%) |

`3410` corre 23/07–06/08 y mide por encima en las tres métricas: fuente acumulativa, se valida la
regla y no el número.

**Decisión que habilita:** los dos tokens se cablean, cada uno a su única solapa posible. Dejan de
publicar `—`.

---

## P-5 · `ecv_insc_dif` — CERRADA. El token está vivo, no se deroga.

**`V-84`** — deck JM 19/06–26/06, iceberg *Ciudad Atractiva Eje Sur (25/06)*, publica literal
**`Difusión: 12 (1%)`**. La fila `rdv` (Jorge Macri, Monserrat, 25/06) trae `Difusión = 12`.
Exacto. Valor directo, sin derivación.

**`V-85`** — misma lámina, identidad completa: `399 mail + 136 cc + 47 ivr + 250 rrss + 12 dif = 844`.
`Mail 399` exacto y `Digital 250` = columna `RRSS` — tercera confirmación de `V-09`/`V-40`.

**`C-49`** — por qué hoy resuelve `sin_datos`: de 75 filas JM de 2026, 29 tienen `Difusión ≠ 0` y
**la última es del 25/06/2026**. Después la columna deja de cargarse. Es un bloque condicional
como IVR (`C-31`, `C-38`), no un token faltante.

**`C-47`** — hallazgo lateral: ese iceberg **colapsa Call Center + IVR en una línea**
(`Call Center: 183` = 136 + 47), mientras el del 28/07 las publica separadas. El desglose de
canales del iceberg no tiene un mapeo fijo columna→línea.

**`C-48`** — los porcentajes del iceberg **redondean** (29,6→30 · 21,7→22), contra `frecuencia`
que trunca. Dos operaciones de redondeo distintas en el mismo informe.

**Decisión que habilita:** el token se conserva en la plantilla y el motor lo omite cuando el valor
es vacío. No hay código nuevo, hay un estado condicional.

---

## Lo que no se pudo verificar

- Los dos decks de Drive se leyeron con el conector de Drive, no con `web_fetch`. El texto no trae
  coordenadas: el pareo plataforma↔valor en esas dos láminas se hizo por orden de lectura, no por
  posición. Los tres decks locales sí se midieron por coordenadas.
- **`X-19`** — desvío suelto que parece error del deck: lámina 17 del JM 24-31/07 publica
  `Frecuencia 8,4` en TOTALES, pero `28.253.288 / 3.178.282 = 8,89`. Las otras tres campañas
  destacadas truncan bien a un decimal. Va a la sección de errores publicados, no a las abiertas.

## Lo que sigue sin resolverse y ahora tiene nombre

1. **Cómo se identifica la segunda campaña de un encuentro** (`C-41`). Bloquea `enc_impresiones`,
   `enc_visualizaciones` y `enc_clics`, que ya tienen operación confirmada.
2. **Qué fuente da alcance deduplicado en 2026** (`A-10`). Bloquea `enc_alcance`.
3. **Las 14 filas de `looker/DIGITAL` sin `Id cuentas`** (`C-43`) — dos de ellas son dato publicado.
4. **Quién produce la agrupación editorial de M2** (`X-18`).
5. **`C-21` sigue sin hacerse**: los fixtures viven sólo en la máquina del usuario.

---

# Addendum — 19/08/2026 · los cuatro números de «Egreso de mil cadetes», medidos contra la base

> **Addendum fechado, no edición.** El archivo es append-only y el cuerpo de arriba no se toca.
> Medido por el validador el 19/08/2026 contra `looker`, cuenta **`3305-JULSEGGJ`**, sobre la
> lámina 17 del deck **JM 24–31/07**.

## Tres reproducen con diferencia, uno no reproduce

| medida | deck | base (19/08) | diferencia |
|---|---|---|---|
| Entregados | 348.035 | 348.010 | **−25** |
| Usuarios alcanzados | 3.178.282 | 3.042.983 | **−4,3 %** |
| Impresiones | 28.253.288 | 28.584.788 | **+1,2 %** |
| Frecuencia | **8,4** | **no reproduce** | — |

## `X-19` confirmado, y con una vía más descartada

**La frecuencia publicada no es el cociente de los otros dos números publicados en la misma
lámina:** `28.253.288 / 3.178.282 = 8,89`.

**Y lo nuevo de esta medición: `looker/ALCANCE` da 2,27 para esa cuenta, que tampoco es 8,4.** Así
que no es *"salió de otra solapa"* — al menos no de ésa.

⚠ **El dato que descarta el formato y lo deja como problema de cálculo:** **las otras tres campañas
destacadas de esa lámina truncan bien a un decimal.** Si fuera redondeo o formato, fallarían las
cuatro. **Falla una sola, y es la que no cierra contra sus propios operandos.**

**Sigue siendo un error publicado, no una pregunta abierta del motor:** el motor todavía no publica
`camp_frecuencia`. Lo que esto agrega es que **cuando se cablee, no hay que reproducir el 8,4**.

## Pregunta abierta: el alcance cayó 4,3 %

**Los otros tres desvíos son drift esperable** —el deck es de julio y la base sigue acumulando—,
y el signo lo confirma: impresiones **+1,2 %**, entregados **−25 sobre 348.035** (0,007 %).

⚠ **Pero el alcance bajó 4,3 % en tres semanas, sobre una campaña TERMINADA.** Un acumulado no
baja; y si el alcance es deduplicado, puede recalcularse hacia abajo, pero **4,3 % es mucho**.

**Se anota como pregunta abierta, no como hallazgo cerrado.** Las explicaciones posibles son
distintas entre sí y **ninguna está medida**: recálculo de la deduplicación, cambio en la ventana
que la fila declara, o filas que salieron del universo. **No se elige la más probable.**

**Y hay un precedente que la hace verosímil sin resolverla:** el 15/08 `looker` movió **138.427
impresiones en 1h45** y dejó un numerador en **cero** durante un recálculo. Que esta base se mueva
dentro de ventanas cerradas está medido; **cuánto y por qué, no**.

⚠ **Lo que esto NO autoriza:** dar por buena la diferencia porque *"`looker` se mueve"*. Es
exactamente la lectura que `CLAUDE.md` §4 previene — *"un `RESTO` que cambia no acusa a la
migración hasta haber mirado si creció el universo"*, y acá el universo no se miró.
