# `2026-09-04_5` · ADDENDUM 1 — El censo está corto, y `L-038` queda cerrada

**Fecha:** 04/09/2026. **Se agrega a** `docs/Prompts/2026-09-04_5_...md`.
⛔ **El cuerpo de aquél no se edita.** Esto **reemplaza P3 y la Parte B.3** y **corrige el §1**.
P1, P2 y P5 quedan como Code los midió y **no se re-miden**.

**Entra al repo con este addendum:** `docs/casos_validacion_2026-09-04.csv` — `V-125` y `C-87`.
⚠ **Es acumulativo, no reemplaza** a los tres CSV que ya están.

---

## 0 · ⛔⛔ El censo de P3 está corto, y está probado

Code lo declaró como límite —*«fuente: snapshot del 31/08 … puede quedarse corto»*—. **Se quedó
corto**, y se confirma con dos lecturas que no dependen de la planilla:

| | |
|---|---|
| `MARCADORES_2026-08-31.tsv` | **32 filas con `_revisar`**, que son exactamente las 3 + 2 + 27 de P3. ⛔ **Ninguna es `m2_*`**: los siete tienen `miles` y `porcentaje_sin_signo`, **limpios** |
| deck del motor del 04/09, `L-038` | publica `-23-` · `-1.348.720-` · `-1.337.392-` · `-433.403-` · `-32.4-` · `-12.316-` · `-2.8-` |

⇒ ⭐⭐ **A los `m2_*` se les puso `_revisar` entre el 31/08 y el 04/09**, y **`V-124` los había
validado el 02/09**. La marca de «no validado» se agregó **después** de la validación.

⚠ Y no son los únicos: el deck trae guiones en `L-034`, `L-052` (`-"1 a 1"-`, un texto), `L-053`
(los `u1_*`), `L-036` y `L-045` (`-2.986.029-`, que no es ninguno de los 16 `camp_*` del snapshot).
**Nada de eso está en las tres listas.**

⇒ **P3 se rehace contra la HOJA VIVA**, con el mismo cruce contra los CSV y **el mismo control
positivo** —el que cazó `token` contra `token_propuesto`—. Reportar el conteo nuevo y cuántos
aparecieron que el snapshot no tenía.

---

## 1 · Lo que se levanta y lo que no

⭐ **`L-038` está CERRADA por decisión del usuario del 04/09.** Sus **siete** marcadores salen de
`_revisar` y vuelven a su formato base —`miles` para los absolutos, `porcentaje_sin_signo` para
`m2_or` y `m2_ctor`—, que es el que tenían el 31/08. **No hay que elegir formato: hay que volver al
que estaba.**

- **Los seis de `V-125`**, por caso reproducible: contra el deck del equipo del 04/09 los cuatro
  absolutos coinciden **dígito a dígito** y los dos porcentajes coinciden con su redondeo a entero.
  ⭐ Es la **segunda** confirmación de `V-124` y **sobre otra ventana**, con bases que se movieron
  en el medio (`R-31`).
- **`m2_envios`, por `C-87`** —y esto es lo que cambia respecto de cómo veníamos tratándolo—:
  ⛔ **la diferencia de conteo NO es un defecto y no se vuelve sobre ella.** El equipo **adapta** las
  campañas al armar la lámina, así que su conteo y el del motor cuentan cosas distintas **por
  construcción**: 23 contra 22 en envíos, 21 contra 15 «Proyectos» en campañas. **No hay número
  final automático.** Se publica el conteo del motor, que es el de su fuente, sin `_revisar`.
  ⭐ `C-87` **cierra además** la pregunta que `V-124` había dejado abierta sobre qué marcador mide
  «proyectos»: ya no hay que elegir entre `m2_campanias` y la columna literal `Proyecto`, porque
  ninguna puede reproducir un número que se arma a mano.

**Se levantan también los tres de la lista 1** —`imp_total`, `frecuencia`, `gcba_imp_total`—, que ya
tenían caso `V-` exacto.

⛔ **Se quedan:** los 27 de la lista 3 y los 2 de la lista 2. Los dos decks del 04/09 no coinciden
en ninguna de las tres familias de la 3 —los 16 `camp_meta/google/prog_*` van entre **1,6×** y
**2,4×** del deck del equipo, y los `ivr_*` / `gcba_*` tampoco—. La 2 sigue con `C-32` abierto y con
`A-03`/`A-04`/`A-07` en conflicto.

⇒ **Y cualquier `_revisar` que el censo rehecho encuentre y que estas líneas no nombren: se reporta
y se queda como está.** Un `_revisar` que aparece sin que nadie lo pidiera es un dato, no una tarea.

⚠ **`imp_total` y `gcba_imp_total` se levantan por caso exacto y al mismo tiempo son dos de los
números que el deck del equipo desmiente.** ⭐ No es contradicción: el caso `V-` certifica que **el
motor lee bien su fuente**; que la fuente no tenga el grano semanal es otra cosa y sigue abierta.
**Escribirlo en esas dos líneas de la Parte D**, o el levantamiento se va a leer como un error.

---

## Parte B.3 — Diez filas de `MARCADORES` · **Opus** · effort alto

**Formato solamente. No es código y no lleva `clasp push`.**

| se levanta | por qué |
|---|---|
| `imp_total` · `frecuencia` · `gcba_imp_total` | caso `V-` exacto ya existente |
| `m2_mails_enviados` · `m2_mails_entregados` · `m2_aperturas` · `m2_clics` | `V-125` — exacto en dos ventanas |
| `m2_or` · `m2_ctor` | `V-125` — exacto con el redondeo del equipo |
| `m2_envios` | `C-87` — lámina cerrada; la diferencia de conteo no es un defecto |

⭐ **Con relectura de la hoja.**

---

## Parte D — Agregados al registro · Sonnet · effort normal

- ⛔⛔ **El hallazgo de proceso, que es el más importante de este addendum:** a seis marcadores se
  les puso `_revisar` **después** de que un caso del CSV los validara. ⇒ **El cruce marcador ↔ caso
  es manual y va en una sola dirección**: se revisa al levantar, no al poner. Un marcador validado
  puede volver a marcarse como dudoso sin que nada avise, y el usuario lo detecta leyendo el deck.
  ⭐ Lo accionable: **el cruce tiene que correr también al revés** —caso sin marcador levantado— y va
  como ítem propio en `PLAN.md`.
- **`docs/casos_validacion_2026-09-04.csv`** incorporado, con `V-125` y `C-87`. ⚠ Acumulativo.
- **`L-038` cerrada**, con la fecha y con `C-87` como motivo. ⭐ Y su condición de invalidación
  escrita: **que el equipo deje de adaptar las campañas.** No una fecha, un evento.
- **El censo rehecho sobre la hoja viva**, con su conteo y con cuántos apareció de más. ⭐ La
  lección, que ya tiene dos instancias: **un censo sobre un snapshot mide el snapshot** — el límite
  estaba declarado y aun así el resultado se iba a usar como si fuera la hoja.
- ⛔ **Y dos cosas que la comparación de decks destapa y que este prompt no toca:**
  - **`pauta_*` publica `1` en Meta, Google y Programmatic, en las DOS láminas**, contra 7/8/8 y
    95/73/125 del equipo — defecto de magnitud ya diagnosticado, **y sigue sin ámbito**: el prompt
    `2026-08-31_2` nunca se ejecutó.
  - ⭐ **`ivr_llamados` y `gcba_ivr_llamados` ya publican distinto** (JM `-`, GCBA 170.473): el
    cableado del 03/09 llegó. Control positivo del ítem 11, cumplido.

⛔ `BITACORA.md` es append-only: entrada nueva, no edición.
