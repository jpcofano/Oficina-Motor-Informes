# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
>
> ⚠ **Y es evidencia de lo que era cierto cuando se escribió, no de lo que es cierto ahora**
> (`CLAUDE.md` §4). Antes de usar una afirmación de acá **para decidir**, buscá el dato en la fuente
> que lo produce.

**Última actualización:** 2026-09-08 (noche), tras el `2026-09-08_7`.

⭐⭐ **Call Center PUBLICA.** El deck de `julio_24_30` del 08/09 21:23 trae
**`6.011 · 1.878 · 31,2 %`** en `L-031`. ⛔ **Y midiendo eso apareció un P0 nuevo: `L-034` publica
`/////` sobre tokens que tienen fila y resuelven en `L-031`.**

---

## ⛔⛔ LO DE HOY, Y ES EL HALLAZGO: `L-034` no se pintó, y no por falta de filas

**La lámina 5 usa LOS MISMOS NOMBRES que la 2** —el censo del 22/08 lo dice: `cc_base`,
`cc_contact_pct`, `cc_contactados`—. Las tres se cablearon, `L-031` las publica, y `L-034` sale
`/////`.

⭐ **Y no son sólo esas tres.** Cruzado contra el deck testigo del 22/08 (`sha256` `cd6f0050…`):

| casillero de `L-034` | 22/08 (`agosto_14_20`) | 08/09 (`julio_24_30`) |
|---|---|---|
| Impresiones | **28.988.260** | ⛔ `/////` |
| Mails entregados | **538.276** | ⛔ `/////` |
| Aperturas (OR) | **210.707 (39,1 %)** | ⛔ `///// (/////%)` |
| Atendidos | **`-`** | ⛔ `/////` |

⭐⭐ **`-` → `/////` es la prueba limpia.** `textoFaltante_`: `-` es *«se preguntó bien y no había
dato»*, `/////` es *«no hay fila, o no se resolvió»*. **El dato no puede mover un token de un
símbolo al otro.**

⛔ **Y no fue una corrida cortada.** Un tramo no alcanzado deja el token **crudo**, y el mismo deck
lo muestra: láminas 21, 22 y 24 con `{{camp_resp_insight}}`, `{{m2_clics_a}}`, `{{rrss_*}}`.

⇒ **Candidata: la resolución por lámina de `D-47`** (27/08), que `CIERRE_POR_LAMINA` dejó *«sin
verificar contra un deck»* **declarando qué esperaba** — *«lo esperable en `L-034` no es otro
número: es SIN DATO»*. **Salió `/////`.**

⛔ **No se le escribió ninguna fila, y eso es el resultado, no una omisión:** un token que existe y
no resuelve no se arregla con una fila nueva — se tapa el síntoma. **Ítem 41**, P0.

---

## Lo que el `2026-09-08_7` dejó escrito y pusheado

`aplicarTanda20260908()`, con `diagAplicarTanda20260908()` en **modo seco**. Un solo botón, tres
gates **antes** de la primera escritura, backup, y **relectura desde la hoja**.

| bloque | qué | estado |
|---|---|---|
| **A** | las tres `gcba_cc_*` | ✅ en el plan. Copia de las de JM cambiando **sólo** `dimensiones`; `DIMENSIONES_.ambito.gcba` ya declaraba `acc_remitente=GCBA` ⇒ **cero código nuevo**. Las tres con `_revisar` |
| **B** | `camp_env4_fecha` | ✅ en el plan, `G2` pasa |
| **B** | las cinco `camp_envN_rem` | ⛔ **`G1` NO PASA** — ver abajo |
| **C** | `L-034` | ⛔ **nada**, y ése es el resultado |
| — | `cc_campanias` · `gcba_cc_campanias` | ⛔ hueco **deliberado**, `C-112` |

### ⛔ `G1` — la columna «Envío» no tiene camino declarativo, y el hueco es del DATO

`D1` decidió que publique el **ámbito** (`JM`/`GCBA`), no el mail. Medido con **dos lectores que
fallan distinto** —`leer_xlsx_por_referencia.py` y `openpyxl`, coinciden en 2.413 filas y 25
encabezados— sobre `Seguimiento_Digital_2026-08-30.xlsx`, `sha256` verificado:

- **0 de 25** columnas traen literalmente `JM` o `GCBA`.
- La única que **particiona** por ámbito es `G`, *Mail remitente* — **el mail crudo**.
- ⛔ **`mail_area` NO discrimina**: 24 áreas, JM en **tres** (Jefatura de Gobierno 191, Seguridad
  94, Salud 15), y *Jefatura de Gobierno* **no es exclusiva suya** (12 filas de otro remitente).

⇒ **Lo destraba `C-01`** —una columna de ámbito en la base, que es del equipo—, **no** un alta de
`MAPEO`. ⛔ **No se cableó el mail crudo**: llenaría el hueco con algo que el equipo no publica.

⭐ **Las cinco filas están listas con `campo_logico` VACÍO a propósito**: lo llena el gate con la
columna que encuentre. El día que exista, es apretar un botón.

**Estado hoy en el deck:** fila 1 publica `jorge.macri@buenosaires.gob.ar`, filas 2–5 `/////`.

### ⚠ Una premisa del prompt que el repo desmiente, reportada y no aplicada

`G2` pedía el token *«en las **dos** plantillas»*. Los **220** marcadores son `informe_id = jm`
—`camp_env1..5_fecha` incluidos—, así que exigir `secco` sería **un gate que sólo puede fallar**.
Quedó como **exige `jm`, reporta `secco`**. Está en `PENDIENTES` como P2.

---

## ⛔ LO QUE HAY QUE CORRER, Y ES TUYO

0. ⭐ **`clasp push` está al día** — corrido el 08/09 a las 10:21, en su propio comando, después de
   leer el verde de las suites.

En este orden, **leyendo cada resultado antes del siguiente**:

1. **`diagAplicarTanda20260908()`** — modo seco. Reporta y no escribe. ⭐ **Mirá primero qué dice
   `G1`**: la predicción de disco es que **no pasa**. Si pasara, la columna de ámbito apareció y
   eso es una novedad que cambia el ítem 42.
2. **`aplicarTanda20260908()`** — escribe. Backup primero, relectura desde la hoja al final.
3. **Corrida de `jm` con `periodo_id = julio_24_30`** — ⛔ **no el default de `R-11`**: es el único
   período con testigo de Call Center.
4. **`censarTokensSinLlaves()`** — escrito el 03/09, **nunca corrido**. Independiente de esta tanda.
5. **`diagGuionesPorLamina()`** — sólo para tener la lista fechada. ⛔ **No corras
   `aplicarGuionesValidados()`**: es el prompt siguiente.

### ⭐⭐ Lo que la corrida tiene que contestar

- ⛔⛔ **¿Cambió algún valor que ya se publicaba?** **No debería cambiar ninguno** — los cuatro
  bloques llenan `/////`. **Si se movió uno, parar.**
- `L-031` tiene que seguir en **6.011 / 1.878 / 31,2 %**.
- `L-032` — ¿`gcba_cc_base` y `gcba_cc_contactados` publican **entre guiones**, y son **distintos**
  de los de JM? Si dan lo mismo, el ámbito no discriminó.
- `L-047` fila 4 — ¿la Fecha publica, o sigue `/////`?
- `L-047` columna Envío — **esperado: sigue igual** (mail crudo en la fila 1, `/////` en las otras
  cuatro). `G1` no pasó.
- `L-034` — ⛔ **no cambia nada acá**, y su `/////` es el hallazgo, no el hueco.

⛔ **Antes de levantar cualquier `_revisar`:** `revisarASinValidar_` **lo repone** si `notas` sigue
diciendo `SIN VALIDAR`.

---

## ⭐ Lo que ya está decidido para el prompt SIGUIENTE (los guiones), y no se re-litiga

**Dos excepciones decididas el 08/09.** El levantamiento de `D-60` las hereda; **este prompt no las
ejecutó**.

- ⛔ **`post_habitantes1` y `post_alcance1` NO se levantan.** El deck del 24–30/07 publica
  **15.567** y **63.898** → **cobertura 410 %**, y la identidad `% Cobertura = Alcance /
  Habitantes` cerraba en **89 de 89** filas de la fuente. **Un caso `exacto` sobre una foto no
  habilita a publicar sin marca lo que una identidad viva desmiente hoy.**
  ⚠ **Es independiente de la ventana**: *«es de otra semana»* no es hallazgo; el alcance mayor que
  los habitantes **sí**.
- ⛔ **Los ocho `imp_*` quedan marcados por `D-58`, no por falta de caso.** `imp_total` y
  `gcba_imp_total` tienen caso `exacto` vigente y `D-60` los habilitaría; su `_revisar` es por
  **universo y grano temporal** —`Impresiones` es el total de vida de la campaña y la fuente no
  tiene semana—. ⭐ **Condición de salida escrita:** se levantan el día que exista una fuente con
  grano semanal, **o** el día que la lámina los rotule «acumulado» (eso es del equipo, `C-01`).

### La lista del grupo (a), fechada — ⚠ cruce de DISCO, no la corrida

Cruzando `CASOS_POR_MARCADOR_` (generada 08/09, 142 casos) contra el snapshot de `MARCADORES` del
**31/08** (220 filas, 32 con `_revisar`): **(a) 8 · (b) 1 · (c) 7 · cerrado/abierto 16**.

```
(a) imp_total · gcba_imp_total · imp_prog · camp_meta_impresiones
    camp_meta_vistas · camp_meta_clics · camp_google_clics · camp_prog_vistas
```

⛔⛔ **Este cruce está VIEJO y se sabe por qué:** el snapshot es del 31/08 y ahí
`post_habitantes1`/`post_alcance1` tienen formato `miles` **sin marca**, mientras el deck del 08/09
los publica **entre guiones**. ⇒ la hoja se movió y **el grupo (a) real puede ser más grande**.
**La lista que vale sale del botón 5.**

---

## ⛔ Lo congelado por el usuario — no se toca

| qué | hasta cuándo |
|---|---|
| **Los Resúmenes Ejecutivos** | hasta **validar con los equipos de dónde sale la información** |
| **Todos los `*_bench_*`** | sin fecha — decisión del 04/09 |
| **Todo lo que vive SÓLO en láminas escondidas** | ⚠ **en las dos plantillas**; los **mixtos** NO se congelan |
| **`L-039`, `L-048`, `L-050`** | fuera de alcance desde el **22/08** |

---

## ⚠ Lo que sigue frenado, con el estado exacto

- **Ítem 9 — `camp_titulo`.** Parado antes del arreglo **por instrucción**. ⭐ Cuál campaña sale
  depende de a qué hora se corra ⇒ toda comparación tiene que declarar la hora.
- **`cc_campanias` (`C-112`)** — 9 candidatas, **4 aciertan las dos ventanas**, agosto no
  discrimina. **Bloquea sólo este token.**
- **`C-117`** — `Remitente` es **suficiente**, no probado **necesario**: `ID cuentas ~= JDGAG` solo
  también reproduce los dos números.
- **`C-116`** — el `%` de agosto (24) **nace sin validar**, no validado.
- **El sexto envío que se pierde en silencio.** `opFILA` llega a 5. Medido sobre el fixture del
  30/08: **38 de 984 cuentas** superan los 5 envíos, y **368 filas** no tienen casillero. ⭐ Para la
  corrida del 08/09 **no muerde**: su campaña trae 3 envíos, y los tres publican.
- ⛔⛔ **Ministros: los 10 cableados, y publican sobre el universo equivocado** (`C-101`).
- **`confirmarGlobalL047()` no existe a propósito** — no se sabe si hay algo que levantar.

---

## ⛔ La deuda documental abierta, y es mía

**Catorce prompts del 04/09 se ejecutaron sin copiarse a `docs/Prompts/`** — violación de `§3`.

| prompt | falta |
|---|---|
| `_1` · `_2` | los dos |
| `_4` | el principal **y** su addendum 1 |
| `_5` | el principal (su addendum 1 **sí** está) |
| `_6` | su addendum 1 |
| `_7` | el principal (v2) **y** su addendum 1 |
| `_8` | el principal **y** los addenda 1, 2 y 3 |
| `_9` | el principal **y** su addendum 1 |

⛔ **No se reconstruyen de memoria.** ⚠ El `_9 Addendum 1` **nunca llegó**. ⛔ **Y NO existe ningún
`_8 Addendum 5`.**

⚠ **Y una anomalía de numeración de hoy, declarada:** el `2026-09-08_7` **salta el 5 y el 6** —eran
borradores que no se entregaron y a los que él mismo dice reemplazar—. La carpeta tiene `_1`…`_4`
y `_7`. **Lo ejecutado no se renumera.**

---

## La cola — **42 ítems, 14 cerrados**

Vive en **`docs/PLAN.md` §2**, no acá. `[x]` 14 · `[~]` 3 · `[ ]` 25.

```
grep -o '^| `\[.\]` \*\*[0-9]*\*\*' docs/PLAN.md | grep -o '\[.\]' | sort | uniq -c
```

- ✅ **El 37 se cerró**: la corrida lo publicó.
- 🟡 **El 15 pasó a `[~]`**: la decisión existe (`D1`, `CONFIG_INFORMES` §4.9); lo que falta ya no
  es decidir sino **poder escribirlo**. Se convirtió en el **42**.
- ⛔ **41 nuevo, P0** — `L-034` publica `/////` sobre tokens que resuelven.
- ⛔ **42 nuevo** — la columna «Envío» sin camino declarativo.

---

## Lo que sé del estado del motor, y lo que no

| afirmación | cómo lo sé |
|---|---|
| ✅ Suites: **98 bancos, exit 0** · `tools/listas.js` exit 0 | **exit code sin tubería**, corrido hoy |
| ✅ el proyecto de Apps Script **está al día** | `clasp push` 08/09 10:21, en su **propio comando** |
| ✅ las tres `cc_*` **están escritas y publican** | el deck del 08/09 21:23 — **6.011 · 1.878 · 31,2 %** en `L-031`. ⛔ Esto **deroga** lo que decía el handoff anterior |
| ✅ `camp_env4_fecha` **está en la plantilla viva** | la fila 4 de `L-047` trae `/////` en Fecha y la 5 trae `-`: sólo un token presente y sin fila emite `/////` |
| ✅ `L-047` **cierra su identidad interna** | 121.789 + 145.744 + 176.870 = **444.403**, el GLOBAL |
| ⛔ `L-034` publica `/////` sobre tokens que resuelven | dos decks, con las dos huellas verificadas. **Ítem 41** |
| ⛔ ninguna columna de `digital/Directa Mail` trae el ámbito | fixture del 30/08, `sha256` verificado, **dos lectores independientes** |
| ⛔ las **nueve** filas de la tanda **NO están escritas** | el modo seco no escribe, y el wrapper todavía no corrió |
| ⚠ si `G1` pasa sobre la hoja viva | **no lo sé con certeza**: la predicción es de un fixture del **30/08**. Lo contesta el botón 1 |
| ⚠ qué le pasa a `L-034` exactamente | **no lo sé** — `D-47` es **candidata**, no causa demostrada |
| ⚠ si `Remitente` es el criterio correcto | **no lo sé**: suficiente, no probado necesario (`C-117`) |
| ⚠ qué cuenta `cc_campanias` | **no lo sé** — 4 candidatas indistinguibles (`C-112`) |
| ⚠ el grupo (a) de guiones **hoy** | **no lo sé**: mi cruce es del snapshot del **31/08** y se sabe viejo. Lo contesta el botón 5 |
