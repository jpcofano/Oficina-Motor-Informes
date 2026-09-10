# 2026-09-10_4 — Destrabar el `clasp push` y dejar las tres escrituras listas

> **Objetivo único:** que lo que está **medido y frenado** quede **ejecutable**. Todo lo de abajo
> cuelga del mismo bloqueo —dos bancos en rojo— y por eso va en un prompt y no en tres.
>
> **Subagente: ninguno.**
>
> ⭐ **Regla de esta corrida, del usuario (10/09):** *una cosa medida no se queda en una nota.* Si
> el diagnóstico es *«no tiene fila»*, el entregable es **la fila**, no el párrafo que dice que
> falta.

| parte | modelo | effort | qué |
|---|---|---|---|
| **0** | Sonnet | medio | gates — reportar y parar |
| **A** | **Opus** | **alto** | el censo posicional (`_1` Parte A + su ADDENDUM 1) |
| **B** | Sonnet | medio | regenerar la constante · suites en verde |
| **C** | **Opus** | **alto** | las tres funciones de escritura, en seco y en firme |
| **D** | Sonnet | medio | `clasp push` **en su propio comando** · docs |

⛔ **Nada de esto escribe en la planilla desde Code.** Code escribe **funciones**; las corre el
usuario desde el editor. Ese fue el hallazgo del `_3`: el Bearer de `clasp` no tiene `spreadsheets`.

---

## Parte 0 — gates

1. Remoto en sincronía con local.
2. Los **dos** bancos rojos, con su motivo exacto: `probar-guiones-grupos.js` y
   `probar-laminas-declaradas.js`. ⛔ Si hay un tercero, **parar**.
3. ⭐ **El censo de tokens SIN FILA de `secco`, uno por uno y contra la plantilla viva** — es el
   insumo de la Parte C.1 y **no se genera por prefijo**: un prefijo es una convención de nombre,
   no una clave, y filtrar por él **genera** en vez de **cruzar**.

---

## Parte A — el censo posicional · `_1` Parte A + ADDENDUM 1

Vale tal cual está escrito allá: `censarCajasDeInforme_` con `censarCajasSecco()` y
`censarCajasJm()`, las dos listas —cajas **con** token y cajas **sin** token, que son los rótulos—,
los tres controles, el `modifiedTime` de cada plantilla en la primera línea, y el inventario de
láminas escondidas (A.4).

⭐ **Y es lo que destraba `probar-laminas-declaradas.js`:** ese banco está rojo porque su índice
`POS.secco` no conoce `L-054`/`L-055` y sus posiciones **no están medidas**. ⛔ **No se arregla
copiando `orden_plantilla`** —es reportado y nunca autoritativo—; se arregla **midiendo**, que es
lo que hace este censo.

**Tres preguntas que contesta y que ninguna corrida puede contestar:**

1. la caja **Alcance** del bloque digital de `L-012`: ¿token sin fila, o caja que la plantilla no
   declara? Hoy no publica **ni un símbolo**;
2. el par (3) de `C-126` en `L-018` — sus cajas salen `/////` en todo deck, antes y después;
3. si el cruce de `C-126` está también en `jm`, que **no se hereda**.

---

## Parte B — la constante, y el verde

Regenerar con `tools/generar-casos-por-marcador.js` — ⛔ **no editar el mapa a mano**. El CSV del
10/09 creció con `C-132` y `C-133`, así que la foto anterior venció.

⚠ **Y decir en el reporte si esto se va a repetir cada vez que entre un caso.** Una constante que
hay que regenerar a mano en cada corrida **es una marca que nadie saca**; si es así, va como
pendiente propio, no se resuelve acá.

**Las 99+ suites en verde, con `exit 0` sin tubería.**

---

## Parte C — Opus, effort alto · las tres escrituras

**Cada una:** wrapper público **sin argumentos**, un `diag*()` **en modo seco** que imprime lo que
haría, **backup antes**, **relectura desde la hoja** después, y ⛔ **gates antes de la primera
escritura**.

### C.1 ⭐ Los tokens que ESCRIBE UNA PERSONA dejan de publicar `/////`

**Decisión del usuario, 10/09/2026:** esas cajas publican **el nombre del token, sin llaves**.

⛔ **El motivo, y ya está escrito en `CLAUDE.md` §4:** *«¿qué trabajo manda a hacer este glifo, y
hay más de una causa que lleve a él? Si dos causas distintas comparten símbolo y piden acciones
distintas, falta un símbolo.»* Hoy `/////` significa **«nadie lo cableó»** y manda a cablear
**28 cajas que nadie va a cablear nunca**, porque ya se decidió que las escribe una persona.

⭐ **El mecanismo ya existe y NO es código:** `CONFIG_INFORMES` §4.3 — `operacion = TEXTO` +
`valor_fijo`. Una fila por token.

**Las cuatro familias, y las cuatro tienen decisión previa con fecha:**

| familia | decisión |
|---|---|
| `camp_audiencia1-3` · `camp_formato1-3` | fuera de alcance (24/08, `jm`) — ⭐ **la decisión se replica a `secco` en este mismo acto** |
| `u1_bench_*` · `camp_bench_remitente` | `*_bench_*` congelados (04/09) · diferido (07/08) |
| `camp_dig_insight` · `camp_mail_insight` · `camp_resp_insight` | `[MANUAL]` (08/08) |
| `u1_total_alcance` · `u1_total_frecuencia` | ⛔ **NO entran** — ver abajo |

⛔ **`u1_total_alcance` y `u1_total_frecuencia` quedan afuera y es deliberado:** su decisión es
*«el dato NO existe todavía»* (26/08), que es **otra causa** — no es que lo escriba una persona.
Darles una fila de texto diría que alguien lo va a escribir, y nadie lo va a escribir. **Quedan en
`/////` hasta que exista el dato.**

**Las cuatro guardas, y ninguna es opcional:**

1. ⛔ **La lista sale del CENSO, token por token — nunca generada por prefijo.** `camp_env` matchea
   `camp_enviados`; `post_` matchea `u1_post_`. Un marcador cuyo token no está en ninguna lámina
   **no falla**: resuelve, no encuentra dónde pintarse, y queda como una fila que nadie va a poder
   explicar.
2. ⚠ **Un token puede vivir en dos láminas.** Escribir la fila lo pinta en **las dos** — verificar
   antes de escribir que las dos lo quieren igual.
3. ⛔ **Sheets se come el `valor_fijo`.** El nombre del token es texto y no numérico, así que no
   hay coerción esperable — **pero se relee igual**: el escritor verifica **lo que quedó**, no lo
   que pidió escribir.
4. ⭐ **El `informe_id` correcto.** Las de `secco` no son las de `jm`, y una migración a `*` sin
   medirla convertiría una decisión de un informe en la de los dos.

**Y el número declarado:** cuántas cajas dejaron de decir `/////`, medido contra el censo, con la
lista de nombres. ⛔ **Nombres, no conteos.**

### C.2 `emin_lista` y `emin_encuentros` — **sí, se saca también el `SIN VALIDAR`**

**Decisión del usuario, 10/09/2026**, respondiendo al hard stop 4 del `_3`.

⭐ **Son DOS escrituras en la misma fila y el banco ya lo verifica:** el `_revisar` del `formato`
**y** el `SIN VALIDAR` de `notas`. Con una sola, `revisarASinValidar_` repone la marca en la
corrida siguiente y el levantamiento dura menos que un deck.

⚠ **`notas` no se vacía: se reescribe.** El texto que hay dice *«PROPUESTA, no verificada»*, y eso
**venció** — lo desmienten `C-106`, `V-137` y la corrida de hoy, con 11 de 11 y las mismas fechas
que el equipo. **La nota nueva dice qué lo validó y cuándo.** Borrarla entera perdería el rastro
de por qué estuvo marcado.

⛔ **`imp_prog` NO se toca**: su marca es por universo y grano temporal (`D-58`).

### C.3 `cc_campanias` — es un **ALTA**, no un cableado

La premisa del `_3` cayó: **no existe la fila**. Son cuatro celdas nuevas, no una edición.

**Candidata 2 — `Tipo de llamado` distintos**, elegida por **modo de falla** y no por acierto: es
columna **tipada**, sus cadenas ya las usa un filtro validado (`V-91`/`S-01`), y un valor nuevo
**sube el conteo de forma visible** en vez de romper en silencio. Las que cuentan por nombre de
campaña quedan descartadas por precedente medido — el nombre **no sirve como clave**.

**Nace con `_revisar`**, ⛔ no porque el número sea dudoso sino porque **la regla que elige es
provisoria**. ⭐ Condición de salida: una tercera ventana donde las cuatro candidatas **difieran**,
o que el equipo conteste.

⚠ **Gate que ya falló una vez:** que lea `acumulado`, **no `looker/CC`** — el cruce caso → marcador
no scopea por base.

⛔ **`gcba_cc_campanias` no entra.** El usuario nombró uno.

---

## Parte D — `clasp push` y documentación

⛔ **En su propio comando, después de LEER el verde.** Nunca `node tools/suites.js | grep … &&
clasp push`: el `exit` es del filtro y despliega **precisamente cuando hay rojo**.

**Documentación, y ningún `.md` nuevo:**

| qué | dónde |
|---|---|
| el quinto caso — *«lo escribe una persona»* | `CONFIG_INFORMES.md` §4.4, al lado de los cuatro símbolos |
| el veredicto del censo sobre `L-012`, `L-018` y `jm` | `PENDIENTES_consistencia.md` |
| el inventario de escondidas y la corrección del «2 copias muertas» | ítem **27** de la cola |

---

## ⛔ Hard stops

1. ⛔ **Si la Parte A no destraba `probar-laminas-declaradas.js`, no hay `clasp push`** — y las
   Partes C quedan escritas y sin correr. **Eso es un resultado, no un fracaso.**
2. ⛔ **Ninguna lista de tokens generada por prefijo.**
3. ⛔ **Ninguna escritura sobre `MARCADORES` fuera de las tres funciones de C**, y ninguna corre
   sola: el usuario aprieta el botón.
4. ⛔ **`u1_total_*` no reciben fila.**
5. ⛔ **Ningún ✅ en el tablero.**
6. **Commits separados:** instrumento (A, B), configuración (C), documentación (D).
