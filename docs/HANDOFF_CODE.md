# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.
>
> ⚠ **Y es evidencia de lo que era cierto cuando se escribió, no de lo que es cierto ahora**
> (`CLAUDE.md` §4). Antes de usar una afirmación de acá **para decidir**, buscá el dato en la fuente
> que lo produce.

**Última actualización:** 2026-09-08 (tarde), tras los seis prompts de la base nueva de Call
Center (`2026-09-07_1`, `_2`, `2026-09-08_1`…`_4`).

⭐⭐ **El alta está APLICADA y el cableado está ESCRITO Y PUSHEADO. Falta apretar dos botones y
correr.** Ver *«Lo que hay que correr»*, abajo.

---

## ⭐⭐ Lo de hoy — Call Center pasó de cero a tres tokens validados

Una planilla que el usuario trajo el 07/09 —**`DGPLES - Directa acumulado`**, 38 solapas— tiene lo
que a `looker/CC` le faltaba: **columna de fecha propia (`Fecha`, K) y columna de ámbito
(`Remitente`, Q)**.

| token | 24–31/07 | 14–20/08 | caso |
|---|---|---|---|
| `cc_base` | **6.011** | **6.851** | `V-126` · `V-127` |
| `cc_contactados` | **1.878** | **1.616** | `V-128` · `V-130` |
| `cc_contact_pct` | **31** | 24 — ⛔ sin testigo | `V-129` · `C-116` |
| `cc_campanias` | ⛔ **4 candidatas, sin criterio elegido** | | `C-112` · `C-121` |

⭐ **Los tres están CABLEADOS** (`cablearCallCenterAcumulado()`, escrito y pusheado, **sin correr
todavía**), sobre la base **`acumulado`** dada de alta con prefijo `acc_` y **una sola** de sus 38
solapas. `cc_campanias` **no se cableó**.

**El recorte es `Fecha` en ventana + `Remitente = JM`** — la misma forma que `mail_entregados`, que
`C-78` ya había medido como el mecanismo existente. Lo que faltaba era la columna, y esta solapa la
trae.

⚠ **Julio y agosto no pesan igual:** julio se contrasta contra casos `exacto`; agosto contra `C-80`,
que está **abierto**.

### Lo que se cerró

| | |
|---|---|
| `C-107` | **`7.096` vs `6.851` no era una contradicción** — `C-69` midió por cuenta, el deck publica por fecha. `looker/CC` no podía distinguirlas |
| `C-110` | **`C-80` se cierra** — los «dos universos» eran artefacto de la falta de columna de fecha |
| `C-111` | **`X-28` se cierra** — su pregunta pierde el referente. ⚠ No porque se haya discriminado |
| `C-108` | El ámbito va **positivo por los dos lados** (`= JM` / `= GCBA`), y **diverge a propósito** de `ivr_vocero != JM` |
| `C-109` | El control positivo inerte, como caso de método |
| `C-113` | **`C-62` no se traslada** a la base nueva — sus **dos** lecturas fallan julio |
| `C-114` | Las 4 candidatas son **dos familias que etiquetan la misma fila con palabras distintas** |
| `C-115` | El cruce caso→marcador **no scopea por base** — ⛔ **ya NO es inerte: el alta lo despertó**, y por eso existe el gate |
| `C-118`…`C-121` | ⭐⭐ **El corrector.** `token_propuesto` **no es descriptivo, es una CLAVE**: `C-115` y `C-117` son casos de método y **reclamaron** los tokens que mencionaban, dejándolos en `abierto`. Medido en seco antes de escribir |

⛔ **Declarado y NO ejecutado:** `CONFIG_INFORMES.md` §4.7 y las decisiones `D-NN` **no se tocaron**.
Un caso se escribe en el CSV; una decisión editorial es del prompt del alta.

### ⛔ Lo que queda abierto, y es acotado

- **`cc_campanias` (`C-112`)** — 9 candidatas medidas, **4 aciertan las dos ventanas**. ⚠ **Agosto no
  discrimina: las nueve dan 3.** Todo el peso está en julio. **Bloquea sólo este token.**
- **`C-117`** — el criterio **no es único**: `ID cuentas ~= JDGAG` **solo** también reproduce los dos
  números. `Remitente` es **suficiente**, no probado **necesario**.
- **`C-116`** — el `%` de agosto **nace sin validar**, no validado. No hay valor publicado.

---

## ⛔ Lo que hay que correr, y es tuyo

> Los tres instrumentos de Call Center **ya corrieron** y sus logs están volcados. Lo de abajo es lo
> que sigue pendiente **de antes**.

0. ⭐ **`clasp push` está al día** — última corrida 08/09. Los tres instrumentos, el alta y el
   wrapper de cableado ya viven en el proyecto de Apps Script.

⭐⭐ **LO PRIMERO, y es lo único que separa a Call Center de estar publicando:**

- **A · `cablearCallCenterAcumulado()`** — escribe las tres filas de `MARCADORES`. Backup primero
  y **relectura desde la hoja** al final. ✅ El **modo seco ya corrió el 08/09 17:26 y el gate de
  `C-115` PASA**: `uso = fuente`, `ventana_ref = propia`, los cuatro `acc_*` resuelven contra
  `acumulado` y no contra `looker/CC`; las tres son **alta**, ninguna existía.
- **B · una corrida de `jm`**, y ⛔ **con `julio_24_30` o `agosto_14_20`, NO con la semana en
  curso** — sin deck publicado no hay contra qué comparar (`D-59` deja la ventana a tu elección).

  | período | esperado |
  |---|---|
  | `julio_24_30` | **6.011 / 1.878 / 31** |
  | `agosto_14_20` | **6.851 / 1.616 / (24, sin testigo — `C-116`)** |

  ⚠ **`julio_24_30` es de SIETE días y la medición usó `24–31/07`, de ocho. Los tres números no
  cambian**: las 3 filas JM son del `24/07` y del `27/07`, ninguna del 31 — verificado fila por
  fila en la sonda.

- ⛔⛔ **Y NO vale *«si da otra cosa es el cableado»*.** Eso era cierto el 08/09 —dos lecturas con
  cinco horas de diferencia— y **no lo es semanas después**: `R-31` vuelve a aplicar y **esta base
  se mueve** (la cuarta fila de `3488`, del 13/08, no estaba en la lectura del 22/08).
  ⭐ **Lo que sí separa las dos causas: correr `medirCampaniasCallCenterBaseNueva()` EL MISMO DÍA.**
  Instrumento y deck coinciden y difieren del testigo → **se movió la base**; el instrumento da el
  testigo y el deck no → **es el cableado**. ⚠ El instrumento avisa solo si el recorte deja de dar
  3 filas —la mitad **ALTA** de `R-31`—; la mitad **CAMBIO** no mueve filas y sólo la ve esta
  comparación.
1. ⭐⭐ **Aplicar configuración**, y el control es **el corte por columna `D`**: verificar que `MAPEO`
   diga `fecha_periodo → D (Fecha)` para `reuniones / Agenda funcionarios`. **El seed ya la tiene**;
   la hipótesis medida es que **la hoja viva todavía corta por `E`**, porque el seed no repara lo ya
   creado. **Control por identidad:** con `D`, **entra Sabor y sale Quirós** — ⛔ y `emin_encuentros`
   **sigue en 7 en los dos casos**, así que **un control que cuente no sirve**.
2. ⭐⭐ **`diagCorteAgenda()`** — por qué columna corta hoy la Agenda. Si `MAPEO` dice **`E`** y el
   seed dice **`D`**, el arreglo es **una celda** y **lo decidís vos**.
3. ⭐⭐ **`diagGuionesPorLamina()`** — los guiones en tres grupos. ⛔ **`camp_titulo` NO está en (a)**
   —no tiene caso— y levantarlo declararía validado lo que está en investigación.
4. ⭐⭐ **`confirmarGuionesValidados()`** — **modo seco**; escribir es otro botón
   (`aplicarGuionesValidados()`). **Los tres gates** tienen que pasar. ⛔ Si el gate 3 falla —Sabor no
   entra o Quirós sí—, **no escribe nada**. La lista son **ocho**.
5. ⭐ **`verGlobalL047()`** — qué `formato` tienen hoy los seis del bloque global de `L-047`.
   ⚠ **Dirime dos afirmaciones incompatibles del repo.** Si da 0, `C-99` no tiene nada que levantar.
6. ⭐ **Confirmar qué dice `meta_frecuencia`** para la campaña del deck. Es lo único que queda del
   `_9`, y es confirmación de lectura, no desempate.
7. **`diagLimpiarGrupoB()`** y, si está bien, `limpiarGrupoB()`.
8. **`censarTokensSinLlaves()`** — escrito el 03/09 y **nunca corrido**.

⛔ **Antes de levantar cualquier `_revisar`:** `revisarASinValidar_` **lo repone** si `notas` sigue
diciendo `SIN VALIDAR`. Es el caso del 26/08→01/09, que costó **ocho días en el deck**.

---

## ✅ La suite roja se cerró — y el arreglo trajo el hallazgo del día

**`probar-guiones-grupos.js` está en VERDE** (exit 0, verificado **sin tubería**).
`CASOS_POR_MARCADOR_` regenerada desde los **7** CSV.

⛔⛔ **Pero regenerar no era el trámite que parecía.** Medido **en seco antes de escribir**: dejaba
`cc_base`, `cc_contactados` y `cc_contact_pct` en **`abierto`**, no en `exacto` — o sea que los tres
se habrían cableado y **publicado entre guiones estando validados**. La causa es propia y del mismo
día: `C-115` y `C-117`, **casos de método**, nombraron los tokens en `token_propuesto`, y el
generador lee ese campo como *«qué marcador afirma este caso»*. Lo cerró el corrector
`C-118`…`C-121` (CSV `2026-09-08b`, que gana el `.sort()` por nombre de archivo).

⭐ **La lección, que es lo que sobrevive: `token_propuesto` no es descriptivo, es una CLAVE.** Un
caso de método que **menciona** tokens **los reclama**. En `C-109` se hizo bien —dice `(caso de
metodo - ningun token)`— y en `C-115`/`C-117` mal, el mismo día.

---

## ⛔ Lo congelado por el usuario — no se toca

| qué | hasta cuándo |
|---|---|
| **Los Resúmenes Ejecutivos** | hasta **validar con los equipos de dónde sale la información**. ⚠ El bloque de Call Center avanzó igual porque lo que se midió es **de qué filas sale**, no si la lámina se publica |
| **Todos los `*_bench_*`** | sin fecha — decisión del 04/09 |
| **Todo lo que vive SÓLO en láminas escondidas** | ⚠ **en las dos plantillas**. Los **mixtos** —escondido en una, visible en la otra— **NO se congelan** |
| **`L-039`, `L-048`, `L-050`** | fuera de alcance desde el **22/08**. ⛔ `L-050` no se puede mostrar sin cablear sus 21 tokens |

---

## ⚠ Lo que sigue frenado, con el estado exacto

- **Ítem 9 — `camp_titulo` en `L-016`/`L-023`.** Parado antes del arreglo **por instrucción**.
  ⭐ **Cuál campaña sale depende de a qué hora se corra** (10:45 → *Operativo Muro*, 11:42 → *Fin de
  las mafias…*). ⇒ Toda comparación tiene que declarar la hora.
- **El remitente sin normalizar** (esto es de **`digital/Directa Mail`**, no de la base nueva).
  ⚠ Son **dos** cosas: el **formato** y la **ausencia** en las otras tres filas. Decide el usuario.
- **`confirmarGlobalL047()` no existe a propósito** — no se sabe si hay algo que levantar.
- ⛔⛔ **Ministros: los 10 cableados, y publican sobre el universo equivocado.** `emin_lista` trae
  `04/09` y `08/09`, fuera del encabezado — **y `emin_encuentros` da 7 igual** porque las dos
  diferencias se cancelan (`C-101`). **El cableado está bien; el universo no.**

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

⛔ **No se reconstruyen de memoria.** ⚠ El `_9 Addendum 1` **nunca llegó**: sobre su veredicto de las
1031 filas **no afirmo nada**. ⛔ **Y NO existe ningún `_8 Addendum 5`.**

---

## La cola — **40 ítems, 12 cerrados**

Vive en **`docs/PLAN.md` §2**, no acá. `[x]` 12 · `[~]` 2 (ítems **7** y **33**) · `[ ]` 26.

```
grep -o '^| `\[.\]` \*\*[0-9]*\*\*' docs/PLAN.md | grep -o '\[.\]' | sort | uniq -c
```

⭐ **Los cuatro nuevos son de Call Center: 37** (el alta + el cableado de los tres validados),
**38** (`cc_campanias` sin criterio), **39** (regenerar `CASOS_POR_MARCADOR_`) y **40** (el `%` de
agosto sin testigo).

✅ **El 39 se cerró el 08/09** con el corrector. ⭐ **El 37 está escrito y pusheado, y le falta la
corrida** — no se tacha hasta que los tres números salgan en un deck.

---

## Lo que sé del estado del motor, y lo que no

| afirmación | cómo lo sé |
|---|---|
| ✅ Suites: **97 bancos, exit 0** · `tools/listas.js` exit 0 | **exit code sin tubería**, corrido hoy |
| ✅ el gate de `C-115` **pasa sobre la hoja viva** | corrida del usuario del 08/09 17:26, modo seco |
| ⛔ las tres filas de `MARCADORES` **NO están escritas** | el modo seco no escribe. Falta `cablearCallCenterAcumulado()` |
| ✅ el proyecto de Apps Script **está al día** | `clasp push` corrido el 08/09 06:16, en su **propio comando** después de leer el resultado |
| ✅ los tres instrumentos de Call Center **corrieron** | logs del usuario del 08/09 (05:55, 05:57 y 07:05), volcados en los `MEDICION_*` y el `CENSO_*` |
| ✅ **cero marcadores `cc_*` vivos** | `MARCADORES_2026-08-31.tsv`, medido — no supuesto |
| ✅ el control sintético del tercer instrumento **mide lo que dice** | corrido **extrayendo las funciones reales de los `.gs`**, más su control **negativo**: con el contador roto a propósito, cae |
| ⛔ `emin_lista` publica **las filas equivocadas** | `C-101` — y `emin_encuentros` da 7 igual |
| ⚠ si `Remitente` es el criterio correcto | **no lo sé**: es **suficiente** y no probado **necesario** (`C-117`). Dos ventanas no lo separan de `JDGAG` |
| ⚠ qué cuenta `cc_campanias` | **no lo sé** — 4 candidatas indistinguibles (`C-112`) |
| ⚠ si `IVR` de la base nueva es la misma tabla que `digital/Directa IVR` | **no lo sé** — el usuario declaró que es **acumulado**, y eso **no está medido** |
| ⚠ `L-023` publica bien | **no lo sé** — el ítem 9 está frenado |
