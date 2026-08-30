# `2026-08-30_1` · Medir el corte JM/GCBA por `Id cuentas` sobre las dos solapas vivas

**Destino:** `docs/Prompts/`. **Estado:** no ejecutado — es una hipótesis hasta que la Parte 0 la
confirme.

**Qué motiva esto.** Dos mediciones del 30/08 (`docs/MEDICION_looker_DIGITAL_2026-08-30.md` y
`docs/MEDICION_corte_JM_2026-08-30.md`) encontraron, sobre **fixtures**, que el ámbito JM se
identifica por el **sufijo del `Id cuentas`** y no por el nombre de la campaña ni por la columna
de ámbito del desglose. Hay que reproducirlo **contra las hojas vivas** antes de cablear nada.

⛔ **Este prompt no cablea.** No toca `DIMENSIONES_`, no toca `MARCADORES`, no escribe en ninguna
planilla de terceros. Sólo mide y reporta.

---

## Referencia externa — la única fuente con grano semanal

Tablero de carga del equipo, ventana **21 ago 2026 → 28 ago 2026**, capturado el 30/08. **Es la
referencia contra la que se contrasta todo lo que sigue.** No está en ninguna planilla; entra acá
como constante.

| ámbito | | Meta | Google | DV360 | Total |
|---|---|---|---|---|---|
| **JM** | implementaciones | 10 | 10 | 9 | **29** |
| **JM** | impresiones | 2.254.296 | 1.219.456 | 6.996.560 | **10.470.312** |
| **GCBA** | implementaciones | 100 | 60 | 121 | **281** |
| **GCBA** | impresiones | 24.163.932 | 19.843.859 | 62.490.631 | **106.498.422** |

⚠ **Los conteos son el control fuerte, no las sumas.** Sobre fixture, los conteos cierran y las
sumas dan 133 % (JM) y 248 % (GCBA), porque `Impresiones` es el total de vida de la campaña y las
campañas de la ventana siguen corriendo después del 28/08. **Una medición que sólo compare sumas
no puede distinguir un corte bueno de uno malo.**

---

## Parte 0 — Verificación de premisas · **sólo lectura** · Sonnet · effort normal

Seis premisas. Todas salen de fixtures del 30/08 y **ninguna es citable hasta que se confirme
contra la hoja viva**.

**P1 · Encabezados.** `looker/DIGITAL` tiene 9 columnas
`Id cuentas · Plataforma · Impresiones · Visualizaciones · Clics · nombre_campaña · eje · area · estado`.
`digital/CAMPAÑAS_DESGLOCE_DIGITAL` tiene 26, entre ellas `B Id cuentas · E Nombre Campaña ·
F Plataforma · I Fecha inicio · J Fecha fin · O Impresiones · T «JM | GCBA | POLICIA» ·
V nombre_campaña`. **Leer el encabezado real y reportarlo entero.** Si una columna se movió, todo
lo que siga sale corrido y nada falla.

**P2 · Las dos solapas son la misma tabla.** En el fixture las dos tienen **5.149** filas de datos
y la misma distribución de `Plataforma` (Meta 1.886 · DV360 1.715 · Google ads 1.442 · TikTok 56 ·
Mercado Libre 27 · Twitter 12 · Twitch 6 · Uber 5). ⚠ Pero sus totales de `Impresiones` difieren
en **768.128** sobre 3.447 M (0,02 %). **Confirmar el conteo y localizar de qué filas sale esa
diferencia.**

**P3 · Forma del `Id cuentas`.** `NNNN-MMMSSSSS` — número, tres letras de mes, cinco de sufijo.
**Reportar cuántas filas NO respetan esa forma**, en cada solapa. Ese resto es el que puede
romper cualquier corte por sufijo, y hay que verlo antes de proponerlo.

**P4 · `looker/DIGITAL` no tiene columna temporal.** En el fixture, las columnas J–S del rango
usado están vacías en las 5.149 filas. `SOLAPAS` lo declara con `ventana_ref = Cuentas` y la nota
«no tiene columna temporal propia». **Confirmar que sigue sin columna de fecha.**

**P5 · Cableado vivo de los ocho `imp_*`.** En `MARCADORES` leen `looker|DIGITAL`, campo
`Impresiones`, `SUMA`, `filtro = estado=Activa`, `periodo_ref` **vacío**. **Confirmar y reportar
las ocho filas enteras.** ⚠ Un comentario fechado 28/08 en `Fuentes.gs` dice que estos ocho tokens
mudan de fuente al desglose, y `DIMENSIONES_.ambito` ya tiene la entrada
`digital|CAMPAÑAS_DESGLOCE_DIGITAL`. **La mudanza no está aplicada en la hoja.** Reportar el
estado de las dos puntas; no resolverlo acá.

**P6 · Período de referencia.** `PERIODOS.2026_agosto_21_28` = 2026-08-21 → 2026-08-28, que es el
que usó la corrida `jm-20260828-193948`. **Confirmarlo en la hoja.**

⛔ **Terminar acá: reportar y parar.** Si alguna premisa cae, decir cuál y qué arrastra. No seguir
a la Parte A sin que el usuario lo habilite.

---

## Parte A — Censo del sufijo de `Id cuentas` · **sólo lectura** · Sonnet · effort normal

Sobre **las dos solapas vivas**, sin ventana y sin filtro de estado.

1. **Distribución del sufijo de cinco letras**, con conteo de filas y de `Id cuentas` distintos.
2. Para cada sufijo, **cuántas de sus filas tienen «JM» en el nombre de campaña** — en
   `nombre_campaña` para `looker/DIGITAL`, y en `Nombre Campaña` **o** `nombre_campaña` para el
   desglose, que trae las dos.
3. Lo mismo agrupado por las **dos últimas letras** del sufijo.
4. Sólo en el desglose: **tabla cruzada de la columna T contra «JM» en el nombre** — las cuatro
   celdas.

**Hipótesis a confirmar o desmentir, medida sobre fixture:** la terminación `AG` (sufijo `JDGAG`)
tiene 540 filas y 517 con «JM» en el nombre (96 %), contra `GJ` 693/68, `VC` 342/10 y `GC`
3.464/21. Y la columna T dice `GCBA` en **530** de las 620 filas cuyo nombre dice JM.

⚠ **Valores crudos, sin normalizar de más.** Si un sufijo aparece con espacios o en minúscula,
que se vea.

---

## Parte B — Los tres cortes contra la plataforma · **sólo lectura** · **Opus** · effort alto

Es la parte que decide qué se cablea después. Va en Opus por eso.

**Ventana:** filas cuyo `Fecha inicio` ≤ 2026-08-28 y `Fecha fin` ≥ 2026-08-21 (solape). Sobre el
desglose sale de las columnas propias. Sobre `looker/DIGITAL` **no hay fechas**: usar el mismo
conjunto de `Id cuentas` que el desglose selecciona, y **decirlo explícitamente en el reporte**
— es una asimetría entre las dos solapas, no un detalle de implementación.

**Tres criterios de ámbito, medidos por separado:**

| | JM es |
|---|---|
| **C1** | `Id cuentas` termina en `AG` |
| **C2** | el nombre de campaña contiene «JM» |
| **C3** | la columna T vale `JM` (sólo desglose) |

En los tres, **GCBA es la negación** — no un valor propio (`D-33`).

**Para cada combinación de (solapa × criterio × plataforma), reportar conteo de filas, conteo de
`Id cuentas` distintos y suma de `Impresiones`**, y al lado la celda correspondiente de la tabla
de referencia. Plataforma agrupada en `Meta` / `Google ads` / `DV360` / `otras` — ⚠ **`otras`
explícita y no escondida en `DV360`**, porque el motor define `programmatic` por resta y ahí caen
TikTok, Twitter, Twitch, Uber y Mercado Libre. Esa diferencia con el rótulo de la plataforma hay
que dejarla visible.

**Lo que la Parte B tiene que contestar, en una línea cada una:**

1. ¿Qué criterio reproduce los conteos de la plataforma? (Sobre fixture: C1 da 10/9/9 contra
   10/10/9; C2 da 8/7/7; C3 da 2/1/1.)
2. ¿La celda que falla en C1 —Google JM, 9 contra 10— es la misma sobre la hoja viva? ¿Qué fila
   falta y por qué?
3. ¿Las sumas siguen dando ~133 % y ~248 %? Si cambió, **decir qué cambió antes de explicarlo**.
4. ¿Hay `Id cuentas` que el corte deja **fuera de los dos ámbitos**? Con `D-33` no debería haber
   ninguno. Si aparece uno, es un defecto del criterio y no un caso borde.

---

## Parte C — El documento · Sonnet · effort normal

Escribir `docs/CENSO_corte_id_cuentas_2026-08-30.md` con lo medido. **Cada número con planilla,
solapa, columna, fecha de lectura y cantidad de filas.** Un número sin eso no entra al repo.

Cerrar con **una recomendación de una línea** sobre qué corte cablear, y **la lista de lo que
sigue sin resolver**. Al día de hoy eso incluye, y no se resuelve acá:

- ⛔ **El grano temporal.** Ninguna de las dos solapas guarda impresiones por semana. La
  plataforma sí las publica y no sabemos de dónde las saca. **Mientras eso no se resuelva, el
  Resumen Ejecutivo no puede validarse con ningún corte** — y conviene que el documento lo diga
  en su primera línea, para que nadie lea «corte resuelto» como «láminas validadas».
- La mudanza a medias de los ocho `imp_*` (P5).
- Los 768.128 de diferencia entre las dos copias de la misma tabla (P2).

⛔ No modificar `DIMENSIONES_`, `MARCADORES` ni ninguna planilla. El cableado va en un prompt
aparte, después de que el usuario elija el criterio.
