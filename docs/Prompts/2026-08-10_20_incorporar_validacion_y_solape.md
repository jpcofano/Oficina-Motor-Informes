# `_20` · Los tres casos que cierran `cc_base`, y el período de campaña por solape

> **Modelo por parte, no por prompt** (`_21` §1.1, 10/08) — **Opus se pide, no se hereda**:
>
> | parte | modelo | por qué |
> |---|---|---|
> | **A** | Sonnet | contar filas y verificar forma |
> | **B** | Sonnet | incorporar tres filas y actualizar el `.md` par |
> | **C** | Sonnet | escribir una decisión ya tomada |
> | **D** | **OPUS** | **cambia el recorte de `looker` y mueve números ya publicados** |
> | **E** | Sonnet | documentación |
>
> **El criterio, en una línea: si equivocarse cuesta una re-corrida, Sonnet; si cuesta un número
> mal en un deck, Opus.**
>
> Subagente `verificador` antes de arrancar.
>
> Entra por el repo, no por conversación: **filas en `docs/casos_validacion_*.csv` con su `.md`
> par.** Un número sin caso numerado no está validado.
>
> **Code no re-mide estos valores, ni en la Parte A.** Salieron de la rama de validación contra el
> fixture. Acá se cablea la conclusión y se audita **forma**: que la solapa exista, que el campo
> esté en `MAPEO`, que la función filtre por donde dice. **Si una medición compara un total con un
> número publicado, esa medición no es de este prompt: se reporta como pregunta y se para.**

---

## 0 · Qué trae este prompt

**Dos cosas, y la segunda cambia números.**

**1 · Tres casos nuevos**, superset exacto del CSV que ya está en el repo — no modifican ninguna
fila previa:

| caso | qué cierra |
|---|---|
| `V-66` | `cc_contact_pct` = 31 %. **Segunda confirmación independiente** de que `cc_base` es `Base barrida`: `1878/6011` redondea a 31 % (publicado); con `Base enviada` daría 28 %. **El porcentaje no se deriva del otro número publicado** — por eso confirma y no repite |
| `C-17` | **`cc_base` es `Base barrida`, cerrado.** Dos números publicados del mismo deck, y la semántica coincide: discada = barrida es lo efectivamente marcado; enviada es la base cargada |
| `C-18` | **El límite del cierre anterior**: el deck del 07/08 no publica ningún bloque de Call Center. Confirmado por **dos números de un deck, no por dos decks** |

`C-18` es la parte que no se puede omitir al citar `C-17`. Un cierre con su límite escrito al lado
es un cierre; sin él es una afirmación que alguien va a citar más fuerte de lo que se midió.

**2 · Una decisión del usuario del 10/08 sobre el período de campañas:**

> **Para las campañas, las fechas del período son las que están entre `fecha_inicio` y `fecha_fin`,
> inclusive.**

Eso no es una regla nueva: **es `R-16`**, el recorte por solape, que el motor ya tiene. La
contraparte declarativa de `fecha_periodo` es `MAPEO.fecha_fin_periodo` — donde está, el recorte
entra por solape; donde no, entra por punto y la traza lo dice. **Lo que falta no es capacidad:
son filas de `MAPEO`.**

---

## A · Verificación de premisas — sólo lectura, **reportar y parar**

**A.1 · El CSV.** Confirmar que `docs/casos_validacion_2026-08-09_addendum.csv` tiene hoy 53
filas de datos y que `V-66`, `C-17` y `C-18` **no están**. Si alguna está, o si alguna fila previa
difiere, **parar**: el archivo se tocó por otro camino y eso es hallazgo antes que conflicto.

**A.2 · `R-16`, cómo se declara hoy.** Reportar el mecanismo tal como está en el código: qué campo
lógico habilita el solape, dónde se decide punto contra solape, y **qué dice la traza en cada
caso**. Listar las solapas que hoy tienen `fecha_fin_periodo` mapeado y las que no.

**A.3 · Qué solapas de `looker` pueden declararlo.** Para `resumen_metricas_dinamico` y para
cualquier otra solapa de `looker` en uso: si tiene una columna de fin de período mapeable, cuál
es, y **si el par inicio/fin está completo o hay filas con uno solo**. Una campaña sin fin no es un
error —hay campañas abiertas—, pero cuántas hay cambia el efecto del cambio.

**A.4 · La predicción, escrita antes de tocar nada.** Pasar `looker` de punto a solape **cambia
qué filas entran en la ventana**. Antes de aplicar: cuántas filas entran hoy por punto, cuántas
entrarían por solape, y **el resumen de `jm` actual** (total / ok / sin_datos / error). Escribir
qué se espera que valga después. **Predecir en celdas o decir «N filas × M columnas»** — el diff
de configuración cuenta celdas, no filas, y una predicción y una medición en unidades distintas no
se pueden comparar.

**⚠ Y lo que este prompt no sabía cuando se escribió: la Parte D mueve `imp_total` y
`gcba_imp_total`, que se cablearon el 10/08.** Los dos leen de `looker/resumen_metricas_dinamico`
con el corte de `R-23`, y **las 26 filas sobre las que se calcularon `6.084.893` y `2.027.888` son
exactamente las que el recorte por punto deja entrar**. Cambiar a solape cambia ese universo.

**Tres cosas más en la predicción, y las tres se miden después:**

1. **cuántas filas de `looker` entran hoy por punto, y cuántas por solape** — los dos números,
   no la diferencia;
2. **el desglose JM / GCBA de cada una**, con el control `4 + 22 = 26` **recalculado** — si el
   total cambia, el control se rehace, no se cita;
3. **los valores actuales de `imp_total` y `gcba_imp_total`**, para tenerlos antes de moverlos.

**Si los dos números se movieron, la celda `notas` de esas dos filas de `MARCADORES` lo dice: qué
valor tenían, con qué recorte, y desde cuándo.** Un número que cambió sin que la nota lo registre
es peor que uno que nunca se cableó — el primero parece verificado.

**A.5 · Qué queda esperando el join, y no se toca acá.** Los casos `A-01`, `A-02`, `A-03`, `V-64`,
`V-65` y `V-66` declaran su fuente como `DIGITAL x Cuentas` y `CC x Cuentas`. **Seis casos
validados esperan una capacidad que el motor no tiene.** Listarlos con su estado. No cablear
ninguno. **Ese inventario es el fundamento del prompt de join** — y si el `_18` §0.0 muestra que
el corte JM sale de una columna propia, puede que la capacidad no haga falta y que estos seis se
resuelvan con `filtro`.

**A.6 · Las cinco campañas mixtas necesitan número propio, no sólo una celda.**

`R-23` cierra **formalmente** —`JM + GCBA = total`, sin solapamiento y sin resto— **pero no
cierra semánticamente**: las cinco campañas que nombran a JM y a GCBA a la vez **caen enteras en
JM y no aportan nada a `gcba_imp_total`**, así que ese número está **subestimado por una cantidad
conocida**. Una decisión editorial documentada en prosa no alcanza cuando el efecto es un número.

Medir y anotar: **las cinco campañas nombradas**, y **cuánto suman de `dig_impresiones` en la
ventana del informe** — que es el desvío de `gcba_imp_total`, acotado. Si alguna cae fuera de la
ventana, decirlo: el desvío es de la ventana, no del universo.

Va **como caso en el CSV de validación o como fila en `PENDIENTES_consistencia.md`**. Con las
cinco nombradas y el desvío medido si se puede acotar.

**Fin de la Parte A: reportar y parar.**

---

## B · Los tres casos, incorporados

- **`docs/casos_validacion_2026-08-09_addendum.csv`** — agregar `V-66`, `C-17` y `C-18` al final.
  **Ninguna fila previa se edita.**
- **`docs/VALIDACION_2026-08-09.md`**, que es su `.md` par — el cierre de `cc_base` con las dos
  evidencias y **con `C-18` al lado**. Donde el documento haya dejado la pregunta «¿`Base enviada`
  o `Base barrida`?» como abierta, **tacharla, no borrarla**: el progreso se marca con
  strikethrough para que se vea qué se resolvió y cuándo.
- **`PENDIENTES_consistencia.md`** — si `cc_base` figura como pendiente, cerrarlo citando `C-17`.

---

## C · La sexta fila de la Parte C del `2026-08-09_1`

**`C-17` la desbloquea a medias, y hay que decir cuál mitad.**

- **La pregunta de qué columna es está cerrada:** `Base barrida`, no `Base enviada`.
- **El cableado sigue esperando**, porque `V-64` toma el número de `looker/CC × Cuentas` y el
  corte por temario que `C-15` describe. Eso es el mismo bloqueo del `A.5`.

Entonces acá se hace **una sola cosa**: dejar la decisión escrita donde se va a buscar —`MAPEO` si
la fila puede existir sin el join, `PENDIENTES` si no— **con el caso citado**. No inventar un
cableado parcial que publique un número desde `CC` sin el corte: sería el número plausible sacado
del universo equivocado, que es exactamente lo que se frenó en la Parte B.

**Y una acotación de `C-15` que viaja con el dato:** el universo de `cc_*` **no es todas las
cuentas JM de la ventana** — el temario selecciona y los filtros acotan (`R-17`). Una cuenta con
datos y fecha en ventana queda afuera si el temario no la nombra. Eso va en `notas`, no en la
cabeza de nadie.

---

## D · El solape en `looker`

Sólo si `A.3` mostró que la columna existe y `A.4` dejó la predicción escrita.

- Agregar la fila de `fecha_fin_periodo` para la solapa de `looker` que corresponda, **por el
  camino del seed y no escribiendo la celda a mano** — el precedente es de anteayer: las filas con
  `origen = seed` las pisa el sembrador en cada corrida, y editarlas a mano produce ping-pong
  permanente. Es lo que retiró `reclasificarSolapasM2Invertidas_`.
- **Medir después y pegar las dos columnas al lado de la predicción.** Si el resumen de `jm` se
  movió, decir en qué dirección y por qué.
- **`notas` de esa fila dice `R-16` y la decisión del usuario del 10/08**, con la fecha. Dentro de
  tres meses, «por qué esta solapa recorta por solape y aquélla por punto» va a ser una pregunta
  real.

---

## E · Documentación

- **`BITACORA.md`** — entrada fechada con los conteos de `A.4` y el antes/después, **con fecha y
  hora de lectura**.
- **`REGLAS_NEGOCIO.md`** — `R-16` no se reescribe; se le agrega la confirmación del usuario del
  10/08 como addendum fechado, con la frase textual: *las fechas del período de una campaña son
  las que están entre `fecha_inicio` y `fecha_fin`, inclusive*. **Inclusive** es la palabra que
  importa y es la que se pierde al parafrasear.
- **`PLAN.md`** — sólo si la Parte D cambió comportamiento, y con el número que esté libre al
  escribirla. No anunciarlo antes.

### Criterios de aceptación — estructurales

1. El CSV tiene tres filas más y **ninguna previa cambió**. Diff limpio.
2. `cc_base` no figura como pregunta abierta en ningún documento del repo.
3. Los seis casos que esperan el join están listados en un solo lugar, con su estado.
4. Si la Parte D corrió: la traza de un token de `looker` **dice «solape»** donde antes decía
   «punto», y el cambio de conteo está medido y explicado.
5. Ningún marcador nuevo cableado. Ninguna plantilla tocada.
