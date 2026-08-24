# CIERRE POR LÁMINA — `jm`

> **Estado: vivo.** Se edita. Nace el 22/08/2026 con la Parte A del
> `docs/Prompts/2026-08-22_27_cierre_por_lamina_y_call_center.md`.
>
> **Qué pregunta contesta, y es una que no tenía dueño:** *¿qué láminas ya están cerradas, y qué
> le falta a cada una de las que no?* `D-38` dice que la fase `informe semanal` cierra cuando el
> usuario, **mirando un deck completo**, declara que los faltantes que quedan no son relevantes —
> y eso pide poder decir *"esta lámina ya está, aunque le falten cosas"*. Hasta hoy no había dónde.
>
> **Distinto de los dos que ya existen, y por eso no los reemplaza:**
> `VALIDACION_deck_generado_vs_equipo_2026-08-22.md` es **una foto fechada** que no se actualiza y
> está organizada **por bloque**; `PENDIENTES_consistencia.md` está organizado **por hueco**.
> Ninguno de los dos se toca.

---

## Los cinco estados

| | |
|---|---|
| ✅ | **cerrada** — el usuario la miró y declaró que lo que falta no es relevante |
| 🟡 | **medida y entendida**, falta un paso mecánico ya definido |
| ⛔ | **abierta** — falta cablear, decidir o medir |
| ⏳ | hay un paso corriendo sobre ella |
| 🚫 | **fuera de alcance** — el usuario decidió que no se cablea. **No cuenta como faltante** |

🌐 **no es un estado, es una marca**: la lámina publica **el universo de la ventana** y no las cuentas del temario (`X-41`). Va **al lado** del estado porque no lo reemplaza — una lámina puede estar ⛔ y además 🌐, y son dos trabajos distintos. Ver la sección propia, más abajo.

⭐⭐ **El 🚫 nace el 22/08/2026 y no es un ⛔ postergado ni un ✅ anticipado.** Un ⛔ dice *«falta
trabajo»* y vuelve a levantarse en cada revisión; un ✅ dice *«lo miré y lo que falta no importa»*.
🚫 dice **«esto no entra en la fase»**, que es una tercera cosa y la única que **saca la lámina del
conteo**. Es la misma figura que `docs/CONFIG_INFORMES.md` §2.5 ya usaba para `camp_bench_*` —
*fuera de alcance con fecha*—, ahora aplicada a una lámina entera.

⚠ **Y lo que un 🚫 NO es: un cierre.** Nadie verificó esas láminas. Si alguna vuelve al alcance,
vuelve como ⛔ y con todo su trabajo por delante — ver la sección de abajo, que dice cuánto es.

⛔ **El ✅ lo pone el usuario, nunca Code.** Code puede mover una fila a 🟡 **con evidencia**, y ahí
para. Es la marca de verificación humana de `CLAUDE.md` aplicada acá.

⭐ **Y una lámina puede cerrarse con faltantes.** `D-38` no pide completitud: pide que el usuario
declare que lo que falta no es relevante. **Una fila ✅ con texto en «qué falta» es el caso normal,
no una contradicción.**

⚠ **Lo que no está medido va ⛔ con *«sin medir»*, nunca con una estimación.** Un ⛔ que dice *"sin
medir"* y uno que dice *"falta cablear"* mandan a trabajos distintos, y ésa es la mitad del valor
de esta tabla.

### ⭐⭐ Y la marca de estabilidad, que manda a DOS trabajos distintos (`R-31`, 22/08)

Va **al lado del estado**, no sólo en la regla, porque cambia **qué control es posible** en esa
lámina:

| marca | qué pasa | qué control admite |
|---|---|---|
| **inestable por ALTA** | la celda estaba **vacía** y se llenó después — carga manual literal | ⭐ **De DIRECCIÓN: el valor sube o queda, NUNCA baja.** Si baja, **es bug**. Y **sirve esperar**: la ventana del viernes después de las 12 |
| **inestable por CAMBIO** | **recálculo**, cero altas — el dato ya estaba y la fuente lo reescribió | ⛔ **Esperar NO sirve**: puede volver a moverse. Va `_revisar` |

⚠ **Y en las láminas 2 y 3 el `_revisar` ya estaba puesto por el universo ancho — ahora tiene un
SEGUNDO motivo, y son independientes.** Si mañana se arregla el universo, **el campo sigue siendo
inestable** y la marca se queda. Sacarla junto con el arreglo del universo sería el error.

---

### ⭐⭐ Y la columna que decide CÓMO entra: ¿llena un hueco o mueve un número? (22/08)

**Es la distinción de `CLAUDE.md` §4 convertida en criterio de tanda.** La regla de *«un cambio por
deck»* existe para que una diferencia se pueda **atribuir** — y **una celda que estaba en `/////` y
ahora tiene valor no produce ninguna diferencia que atribuir**.

| marca | qué significa | cómo entra |
|---|---|---|
| **🕳 hueco** | hoy sale `/////` o vacío. **No hay número que mover** | ⭐ **En tanda, todos juntos en la misma corrida** |
| **↕ mueve** | hay un número publicado y el cambio lo reescribe | ⛔ **Va SOLO**, en su propio deck |

⭐ **La pregunta que las separa, y se hace antes de agrupar: *¿había un número ahí ayer?*** Si no
había, no hay nada que atribuir.

**Hoy la tanda de huecos es todo el grueso de lo que falta:** los `camp1-4` de la lámina 7, los 32
`post_` de `L-036`, y las cuatro láminas de campaña (13 a 16) más las dos de desagregados. **Entran
juntos.**

**Y lo que va solo es corto:** **cualquier cambio en la frecuencia** (`X-32`), que reescribe un
valor que ya sale. ⭐ **RRSS (`L-050`) salió de esta lista el 22/08**: era el caso de *«hay un número
y está mal»*, y **esconder la lámina lo resolvió de raíz** — no queda número que mover porque no se
publica nada. Ver 🚫, abajo.

⚠ **El borde, que hay que mirar igual:** un token nuevo **dentro de una operación compartida** puede
mover a sus hermanos. `ELEMENTO` memoiza el conjunto, así que agregar un consumidor cambia **cuándo**
se calcula, no **qué** — mientras el cálculo sea el mismo, sigue siendo llenar huecos.

---

## Cómo leer la columna «lámina»

El número es **`LAMINAS.orden_plantilla`**, que es como habla la documentación del proyecto
—*"lámina 2"*, *"la lámina 10 escondida"*—. ⚠ **No es autoritativo** (`CLAUDE.md` §2): la posición
vive en la plantilla y el id en el registro. Y **no coincide con la numeración del deck expandido**,
porque las secciones repetibles duplican sus copias antes de que el deck se numere — por eso el
iceberg es la **6** acá y la **7** en el deck del equipo.

---

## El tablero

| lámina | `lamina_id` | estado | qué falta para el check | último cambio |
|---|---|---|---|---|
| **1** · Portada | `L-030` | ⛔ 🕳 | **sin medir** — un solo token, `periodo`, y ninguna verificación lo mira | — |
| **2** · Resumen Ejecutivo JM | `L-031` | ⛔ **inestable por CAMBIO** 🕳 🌐 | 21 tokens. **Los cuatro `cc_*`: `MAPEO` escrito, cableado FRENADO por `X-28`** — la columna y la operación están validadas, **qué cuentas entran no** · `contenidos_total` publica `1` → **pregunta al equipo** · `frecuencia` no publica → sin medir · los 8 `imp_*` y los 3 «N envíos» están 🟡, abajo | 22/08 |
| **3** · Resumen Ejecutivo GCBA | `L-032` | ⛔ **inestable por CAMBIO** 🕳 🌐 | 19 tokens, los mismos de la 2 con prefijo `gcba_` **sin medir uno por uno** · `gcba_cc_*` sin cablear (equipo: 8 campañas · 19.788 · 7.308) · `gcba_sms_*` 🟡 | 22/08 |
| **4** · «Encuentros con vecinos» | `L-033` | 🟡 | **Cero tokens y `rol = equipo`: no hay nada que cablear.** Es un separador. Falta sólo que el usuario lo mire | — |
| **5** · ECV: alcance semanal | `L-034` | ⛔ **inestable por ALTA** 🕳 🌐 | ⭐ **`ecv_inscriptos` = 2.333 y `ecv_encuentros` = 4 REPRODUJERON** contra `V-71`. ⚠ **Pero `rdv` es inestable por ALTA (`R-31`), así que eso no se puede EXIGIR en cada corrida** — el control posible es **de dirección: sube o queda, nunca baja; si baja es bug**. Falta: `ecv_asistentes` = 485 sin validar · los 3 `cc_*` **pintados sin control** · `ecv_fecha` y `ecv_barrio1-3` **sin fila en `MARCADORES`** | 22/08 |
| **6** · Benchmarks / Iceberg | `L-035` `L-052` | ✅ | ⭐⭐⭐ **CERRADA — el usuario la declaró el 22/08.** Publicó los cuatro de IVR exactos: Audiencia **107.194** · Atendidos **96.549** · Escucharon +75 % **33.139** · Marque 1 **304**, más las seis cifras del alcance al dígito. **`X-30` se cerró solo: el ítem llegó con `3488-AGOJDGAG`.** ⭐ **Y es la única lámina con control por igualdad exacta garantizado**: sus cinco campos de `digital/Directa IVR` son **estables** (`R-31`) | 22/08 |
| **7** · Digital \| ECVs: post reuniones | `L-036` | ⛔ 🕳 | **32 de 32 tokens sin fila** — **ocho columnas × 4 filas**, cruzados uno por uno contra el censo (22/08) y contra la tabla del deck testigo: sin celdas combinadas y **sin fila de totales**. ⚠ **Esta fila cambió dos veces en un día y la tercera es la buena**: `Auditoria.gs` tenía razón; `TOKENS.md` §2.1, el `P2` del 06/08 y el espejo están **los tres viejos** (`C-77`, retractado). ⭐ **24/08: la fila es una REUNIÓN del temario con comunicación post** (usuario), fuente `reuniones/Agenda JM \| Post` (`C-50`). **Cinco de las ocho columnas ya tienen `MAPEO`**; las otras tres son pregunta al equipo, sin prioridad. ⛔ **Lo que falta no es cableado: es de dónde salen las 4 filas** — ver abajo | 24/08 |
| **8** · «Comunicaciones M2» | `L-037` | 🟡 | Separador, `rol = equipo`, cero tokens. **Nada que cablear** | — |
| **9** · Directa · Status M2 | `L-038` | ⛔ ↕ | 8 tokens. ⭐ **El numerador coincide y el denominador no** (−9,6 % en enviados/entregados, con el numerador quieto) → falta **decidir** de qué universo sale el denominador | 22/08 |
| **10** · M2 *(escondida)* | `L-039` | 🚫 **fuera de alcance** | **No se cablea** — decisión del usuario, 22/08. **23 tokens dormidos** (los 23 de la lámina). Nunca se midió y **no se va a medir**: sale del conteo de faltantes | 22/08 |
| **11** · «Campañas destacadas GCBA» | `L-040` | ⛔ | Separador `rol = equipo`, pero ⛔ **se duplica por ítem de campaña** junto con la lámina de M2 digital | 22/08 |
| **12** · Campaña destacada | `L-041` | ⛔ ↕ | ⛔ **La campaña destacada no coincide con la del equipo y en la última corrida sale vacía** | 22/08 |
| **13** · Objetivo y período | `L-042` | ⛔ 🕳 | Sin cablear — sale prácticamente entera en `/////` | 22/08 |
| **14** · Herramientas y audiencias | `L-043` | ⛔ 🕳 | 6 de 7 sin fila: `camp_audiencia1-3` y `camp_formato1-3`. ⛔ **24/08: NO se cablean, y el bloqueo es de FUENTE, no de operación** — el censo ya decía `ELEMENTO` y da igual. **`formato` no existe como columna** en ninguna solapa `fuente`; lo más parecido es `DESGLOCE.Nomenclatura`, de campos variables, y **para la campaña destacada del 14-21/08 sus dos filas no traen formato**. **`audiencia` existe para el lado mail** (`mail_segmentacion`) pero **0 de los 5 ítems publicados están literales**: el equipo acorta y reescribe, uno de los cinco es la audiencia **digital** (solapa `ignorar`), y **4-5 audiencias no entran en 3 cajas**. Candidatos a **texto del equipo** → pregunta en `PENDIENTES` | 24/08 |
| **15** · Formatos digitales | `L-044` | ⛔ 🕳 | Sin cablear — ídem | 22/08 |
| **16** · Resultados agregados | `L-045` | ⛔ 🕳 | 11 tokens. Sin cablear | 22/08 |
| **17** · Desagregados · Digital | `L-046` | 🟡 🌐 | ⭐⭐ **Los 17 publican y la identidad interna CIERRA** (`V-111`, 23/08): Meta + Google + Programmatic = TOTALES **exacto en impresiones (6.055.442), vistas (3.003.515) y clics (4.513)**. Y `camp_meta_frecuencia` quedó **separada** de la total —`-1.85-` contra `-6.98-`—, que era el bug que esta fila reportaba. ⭐ **Es el primer control de esta lámina que no depende del deck del equipo ni de una foto de la base**, así que se puede exigir en cada corrida. ⛔ **Falta para el ✅, y es del usuario:** que los valores absolutos sean los de la semana — Programmatic sigue trayendo el acumulado (65 % del total) y esa decisión está abierta. Los 7 `camp_bench_*`/`_insight` son texto del equipo y no se cablean | 23/08 |
| **18** · Desagregados · Mail | `L-047` | ⛔ 🕳 | 5 envíos + GLOBAL, 9 columnas. ⭐ **24/08: la fila GLOBAL quedó COMPLETA** — se cablearon los tres que faltaban (`camp_enviados`, `camp_or`, `camp_mail_clics`) junto a los seis del `_19_1`. **Los 40 de envío ya tienen fila** desde el 23/08 (`FILA`, `X-35` cerrado). ⚠ Las celdas están **combinadas**, no vacías, y por eso son 40 y no 45. ⛔ **Falta una corrida**: ningún token de esta lámina se vio publicar. ⭐ **El control primario no depende del deck del equipo**: `% OR = aperturas/entregados` y `% CTOR = clics/aperturas` son derivables de las otras celdas de la fila, y el GLOBAL tiene que ser la **suma** de los cinco envíos —ese cruza fuentes (`looker` contra `digital`) y por eso puede fallar legítimamente | 24/08 |
| **19** · Desagregados · Respuestas | `L-048` | 🚫 **fuera de alcance** | **No se cablea** — decisión del usuario, 22/08. 15 tokens, **14 dormidos**: el único con fila es `camp_titulo`. Ya estaba diferida desde el 05/08 (`CONFIG_INFORMES.md` §2.5, los once `camp_resp_*`); ahora es la lámina entera y sale del conteo | 22/08 |
| **20** · «Análisis y datos» | `L-049` | 🟡 | Separador, `rol = equipo`, cero tokens. **Nada que cablear** | — |
| **21** · Resumen Ejecutivo RRSS | `L-050` | 🚫 **fuera de alcance** | ⭐⭐ **No se cablea, y el usuario la escondió** — 22/08. **21 tokens dormidos** (los 21 de la lámina). ⛔⛔ **Esconderla cierra el peor abierto que tenía el proyecto**: su primer bloque publicaba los datos de la semana pasada **sin ninguna marca**. Ver la sección 🚫, abajo — **el motivo hay que leerlo antes de volver a mostrarla** | 22/08 |
| **22** · MUCHAS GRACIAS | `L-051` | 🟡 | Cierre, `rol = equipo`, cero tokens. **Nada que cablear** | — |
| *(orden 8)* · «1 a 1» | `L-053` | ⛔ 🕳 | `filtro = tipo=Uno a uno`, 32 tokens `u1_`. Nace con `D-37`. ⭐ **Las impresiones del PRE reproducen exacto** — `V-21` Google **17.401**, `V-23` Meta **25.099**, `V-25` Meta Retiro **18.015**. ⛔ **El único roto es `u1_prog_impresiones`, y es un agujero de FUENTE**: los 94.955 del **POST de San Cristóbal** no están en ninguna celda de los siete libros de los dos fixtures (`X-05`, `C-57`). **Distinto del problema del Resumen** — acá falta el dato, allá sobra universo. ⚠ **Y 4 de sus 36 tokens son `ecv_`** —`ecv_asistentes`, `ecv_comuna`, `ecv_fecha`, `ecv_inscriptos`—: **`ecv_fecha` es la fecha de la reunión** (`rdv` · `fecha_periodo` · col. E de `RVD JM-CM - ES`, que `MAPEO` describe como *"filtro de período"*) y **NO tiene fila en `MARCADORES`**. Sólo vive en `TOKENS_CORTE_VERTICAL_` (`Marcadores.gs`), una lista del diagnóstico `corteVerticalRetiro2407_()`. **Mismo hueco que `ecv_barrio1-3`** | 22/08 |

**Conteo: 1 ✅ · 6 🟡 · 13 ⛔ · 0 ⏳ · 3 🚫**, sobre 23 filas de `LAMINAS` para `jm`.

⭐ **`L-046` pasó de ⛔ a 🟡 el 23/08 con evidencia** (`V-111`): los 17 publican y las tres identidades cierran. **Code la mueve a 🟡 y ahí para** — el ✅ lo pone el usuario, y lo que falta para eso es una decisión suya, no una medición: si el acumulado de Programmatic es el número de la semana.

⭐ **Las tres 🚫 salieron del conteo de ⛔ el 22/08** —eran 17— **y no se cerraron: se sacaron del
alcance.** El total de filas no cambia, y ése es el punto: una lámina fuera de alcance **sigue
existiendo en la plantilla**, con sus tokens adentro.

---

## 🌐 Universo ancho, mecanismo pendiente — `L-031`, `L-032` y `L-034` (`X-41`, 23/08/2026)

**Se marca y no se toca. Decisión del usuario.** Las tres publican **el universo de la ventana**,
no las cuentas del temario, y eso ya está escrito — no es un hallazgo nuevo cada vez que alguien
mire un número.

**El hueco es uno solo y está en tres lugares:** los `cc_*` de Call Center (`L-031`/`L-032`), los
cuatro `ivr_*` del Resumen (`L-031`) y los cuatro del agregado semanal (`L-034`). **Las tres son
láminas FIJAS**, así que no tienen ítem del que sacar una cuenta, y **el motor no tiene forma de
decir «sumá sólo las cuentas del temario»**. Hasta que ese mecanismo exista, cablear cualquiera de
los tres publica de más.

⚠ **Y lo que hay que saber para no confundirlos: los dos se ven distinto.** El de Call Center da
**el gabinete entero** —factor 14 contra lo esperado, `X-37`—, así que grita. El de IVR recorta por
la fecha propia de la solapa y da **sólo las campañas de esa ventana**: un número **plausible**.
Medido sobre el fixture del 20/08, **45 de 53 ventanas contienen más de una cuenta**, pero mezclan
poco. **Mismo hueco, distinta visibilidad** — y por eso el de IVR sobrevivió mientras el de CC se
frenó.

⛔ **No es candidato a cerrarse con un cableado.** Lo que falta es el mecanismo, y es previo a los
tres.

---

## 🚫 Las tres láminas fuera de alcance — decisión del usuario, 22/08/2026

**No se cablean, no se miden y no cuentan como faltantes.** Las tres siguen en la plantilla y las
tres siguen teniendo tokens adentro: lo que cambió es que **el motor ya no tiene trabajo pendiente
ahí**, y por lo tanto el tablero no puede seguir contándolas como si lo tuviera.

### ⛔ Cuántos tokens quedan dormidos en cada una — la condición del usuario

| lámina | `lamina_id` | tokens en la lámina | **dormidos** | escondida |
|---|---|---|---|---|
| **10** · M2 | `L-039` | 23 | **23** — la lámina **entera** | **sí**, y ya lo estaba: `LAMINAS` del 21/08 la trae `escondida = sí` |
| **19** · Desagregados · Respuestas | `L-048` | 15 | **14** | **sí**, ídem |
| **21** · Resumen Ejecutivo RRSS | `L-050` | 21 | **21** — la lámina **entera** | ⭐ **sí, la escondió el usuario el 22/08.** Antes estaba visible |
| | | **59** | **58** | |

⭐⭐ **«Dormido» significa una cosa y hay que leerla literal: el día que alguien muestre la lámina,
esos tokens salen `/////` en la corrida siguiente.** No hay paso intermedio ni degradación suave —
una lámina que vuelve a mostrarse **sale entera en símbolos de sin cablear**, porque ninguno de sus
tokens tiene fila en `MARCADORES`.

⛔ **Por eso el número va en el tablero y no en una nota al pie: hay que saberlo ANTES de mostrarla,
no después de ver el deck.** Es la misma familia que el glifo que miente sobre la causa
(`CLAUDE.md` §4): quien muestre una de éstas y vea 21 `/////` va a leerlo como *«se rompió algo»*
cuando la verdad es *«esto nunca se cableó, y está escrito desde el 22/08»*.

**Las dos que salvan un token, y de dónde sale el dato:**

- **`L-048` tiene 14 dormidos y no 15**: su único token con fila es **`camp_titulo`**. ⚠ **Es una
  deducción, no una medición** — sale de cruzar el censo del 22/08 (*"14 de 15 sin fila"*) con el
  snapshot `MARCADORES_2026-08-21_2225.tsv`, y **cierra en las cinco láminas de campaña**: `L-042`
  1 de 3, `L-043` 1 de 7, `L-045` 9 de 11, `L-046` 6 de 31, `L-047` 4 de 50 — en todas, la
  diferencia son exactamente los `camp_*` cableados, y `camp_titulo` aparece en todas.
- **`L-039` y `L-050` no salvan ninguno**: el censo las mide **23 de 23** y **21 de 21**.

### ⭐⭐ RRSS es la que hay que leer con cuidado, porque esconderla CIERRA un abierto

**El primer bloque de `L-050` no tiene tokens: es texto fijo de la plantilla, y el motor no lo
toca.** Lo medido el 22/08 (`VALIDACION_deck_generado_vs_equipo_2026-08-22.md` §3.6): el deck del
motor publicaba `85 % · 99 % · 98 % · 98 %`, promedio `95 %`, *"8.813 menciones… 4.7M
visualizaciones"* y el tema *"video de un hombre agrediendo a una niña en Palermo"* — **los datos de
la semana pasada, intactos y sin una sola marca que lo dijera**. El segundo bloque, que sí tiene
tokens, salía entero `/////`.

⚠ **La misma lámina mentía de dos formas opuestas a la vez**, y ésa era la parte cara: el bloque que
el motor **no toca** publicaba datos viejos **sin marca**, y el que sí toca declaraba correctamente
que nadie lo cableó. **Un número obsoleto sin marca es peor que un `/////`**: el `/////` manda a
cablear, el número viejo **no manda a nada, porque nadie sabe que está viejo**.

⭐ **Esconderla lo resuelve de raíz, y por eso se anota como cierre y no como postergación.** No
quedó un número viejo tapado ni marcado: **no se publica**. La lámina no sale en el deck, así que no
hay texto que alguien pueda leer como si fuera de esta semana.

⛔⛔ **Y la advertencia, que es el motivo entero de escribir esto acá: el día que alguien vuelva a
mostrar `L-050` sin cablear los 21 tokens, el problema vuelve ENTERO.** No vuelve a medias y no
vuelve degradado — vuelve exactamente igual, porque **la causa nunca se arregló**: el primer bloque
sigue sin tokens y el motor sigue sin poder tocarlo. Esconderla es lo que lo tapa, no un arreglo.

**Lo que haría falta para mostrarla de nuevo sin reabrirlo, y son dos cosas, no una:**

1. **Cablear los 21 tokens** del segundo bloque — hoy no hay ninguno con fila.
2. ⭐ **Resolver el primer bloque, que es el problema de verdad y NO se arregla cableando.** Un
   bloque sin tokens es invisible para el motor: o se le ponen tokens en la plantilla —y eso es del
   equipo, `C-01`—, o se lo borra, o se acepta explícitamente que ahí va texto que escribe una
   persona. **Las tres son decisiones del equipo o del usuario; ninguna es código.**

⚠ **Y esto tampoco cierra la condición 5 de `D-38` en general** —*«nada que el motor no escribió se
lee como de esta semana»*—: cierra **el caso RRSS**, que era el único medido. La condición pide
**listar las láminas sin tokens y declarar una por una si es intencional**, y ese censo sigue sin
hacerse.

### Cómo se ejecuta el «escondida», y por qué el registro va a decir otra cosa un rato

⭐ **`LAMINAS.escondida` se refleja, no se decide** (`Instalar.gs`, `B.3`): sale de `isSkipped()` y
lo escribe el sellador. **Esconder o mostrar desde el motor no está autorizado** — `C-01`
addendum 1: la plantilla es del equipo. O sea que **la única forma correcta de sacar `L-050` es
justo la que se usó: que una persona la esconda a mano en la plantilla.**

**Las dos consecuencias, y conviene tenerlas separadas:**

- ✅ **La corrida ya la saltea**, desde el momento en que se escondió. `laminasEscondidas_`
  (`Armonizar.gs:180`) lee `isSkipped()` **de la plantilla viva**, no del registro — no hace falta
  correr nada para que tome efecto.
- ⚠ **`LAMINAS` va a seguir diciendo `escondida` vacío para `L-050` hasta el próximo sellado.** No
  es una inconsistencia a arreglar a mano: es un espejo que todavía no se refrescó, y **ningún
  código lo lee para decidir** (los dos únicos lectores, en `Auditoria.gs`, lo imprimen en un
  reporte). Se corrige solo la próxima vez que corra el sellador.

⚠ **Y un número que queda desactualizado y hay que RE-MEDIR, no calcular:** los **«49 crudos
permanentes»** que `Desatendida.gs` declara en su encabezado. Ese 49 se midió **sobre el deck
expandido** —donde las secciones repetibles duplican sus láminas— y con `L-050` visible. Con RRSS
escondida el número sube; **cuánto exactamente lo dice una corrida, no una suma.** Lo que no cambia
es lo que ese comentario protege: **una reanudación guiada por los crudos no terminaría nunca**, y
ahora menos.

### Lo que esto le hace al censo — la cuarta causa de «sin fila»

**El censo del 22/08 los sigue listando, y está bien: mide la plantilla, no el alcance.** Un token
sin fila en `MARCADORES` es un hecho sobre el registro, y sacar una lámina del alcance no le cambia
el hecho. **El que tiene que distinguirlos es este tablero.**

| | |
|---|---|
| tokens distintos sin fila (censo 22/08) | **192** |
| **dejan de ser faltantes** | **57** |
| **quedan como faltantes** | **135** |

⚠ **Y son 57, no 58 — la diferencia es real y conviene saber de dónde sale.** Las tres láminas
suman **58 apariciones**, pero **`camp_remitente` vive también en `L-047`** (Desagregados · Mail),
que **sigue en el alcance**. El censo cuenta **192 distintos sobre 197 apariciones** justamente
porque cinco tokens aparecen en dos láminas; éste es uno de los cinco. **Un token no sale del
conteo mientras le quede una lámina viva.**

⭐ **Y con esto, «sin fila» pasa a tener CUATRO causas, y sólo una es un faltante.** Las tres
primeras son de `C-82` (22/08):

| # | causa | ejemplo | ¿es faltante? |
|---|---|---|---|
| 1 | **nadie lo cableó** | los 32 `post_` de `L-036` | ✅ **sí** |
| 2 | **otro mecanismo lo produce** | `periodo` — el **único** token que `Generador.gs` produce fuera de `MARCADORES`, medido greppeando | ❌ no |
| 3 | **es texto que escribe una persona** | los `*_bench_*`, los `*_insight` | ❌ no |
| 4 | ⭐ **fuera de alcance por decisión** — nace hoy | los 57 de estas tres láminas | ❌ no |

⚠ **El censo las lista juntas y no las distingue, y eso no es un defecto suyo: no tiene con qué.**
La causa 4 no está en ninguna hoja de registro —`LAMINAS` no tiene columna de alcance— así que **el
único lugar donde vive es este documento**. Quien cite el 192 como *"lo que falta cablear"* está
sumando cuatro cosas distintas.

---

## 🟡 En curso — lo que confirma la **próxima corrida**, no el log

⚠ **Esto no es ✅ y la distinción es el punto.** Los dos botones corrieron hoy y escribieron en
`MARCADORES`; **lo que ninguna escritura prueba es que el deck salga con el número esperado**. Eso
lo dice una corrida de `agosto_14_20` y nada más. Un valor que *debería* salir es una predicción,
no una medición.

### Los tres «N envíos» — `cablearEnviosComoConteo()`, 22/08 15:33

Seis celdas, tres marcadores × dos campos. **`CONTEO`, no `SUMA`**: publicaban **piezas**, no
envíos. Los entregados no se tocaron.

| | esperado | |
|---|---|---|
| Mail JM | **6** | el fixture del 20/08 da 6 · ✅ exacto |
| Mail GCBA | **73** | ⚠ el fixture da **61** — es la base sin terminar de cargar, no un desajuste de definición |
| SMS GCBA | **3** | el fixture da 3 · ✅ exacto |

### Los ocho `imp_*` — `marcarProgrammaticARevisar()`, 22/08 15:41

Las ocho filas ya tenían `formato = miles_revisar`; el lote **no escribió ninguna celda y eso es
correcto** (ver la corrección del veredicto, abajo).

**Esperado: los ocho publican su valor envuelto en guiones**, que es lo que `_revisar` declara —
*"este número no es de confiar"*—. ⛔ **No es un arreglo del número.**

⚠ **Y el marcado es por UNIVERSO, no por plataforma** — por eso son ocho y no dos. `A-06` da
**+15,6 %** en Google y `A-07` **+15,4 %** en Programmatic **sobre un fixture anterior al deck**, y
por `C-25` una métrica acumulativa medida sobre una foto anterior **no puede dar más** que lo
publicado: es universo, no desfasaje. La causa es común a las tres columnas —`2976-MAYPCCVC`,
*Campañas genéricas RDV JM*, `04/06 → 31/12`, **entra por las tres**—. ⛔ **Desmarcar Meta y Google
diría que el Resumen está bien, y no lo está.**

⭐ **Y la decisión que sigue abierta es del usuario, no de Code** — tres salidas, ninguna elegida:
**(a)** cambiar el rótulo a *"acumulado de las campañas de la semana"*, que hace correcto el número
que ya sale, cuesta cero código y no depende de nadie; **(b)** pedirle el dato semanal al equipo;
**(c)** publicar `/////`.

---

## La corrida de `agosto_14_20` del 22/08 — qué contestó y qué abrió

**Corrió con el `_25`, `R-30` pusheado y los tres botones aplicados.**

### ✅ Lo que cerró

- ⭐⭐⭐ **El iceberg (`L-035`), completo.** Los cuatro de IVR exactos, y **`X-30` se cerró solo**:
  el ítem llegó con `3488-AGOJDGAG` sin tocar una línea. **El diagnóstico de la lámina 6 era
  correcto y el problema no existía en esta corrida.**
- **`L-034`**: `ecv_encuentros` = **2**, barrios **Parque Avellaneda** y **Parque Patricios**.
  ⭐ Coherente con el iceberg: `3488-AGOJDGAG` es *"TE CUENTO | SALUD **Eje Sur**"*, y Parque
  Patricios es del sur. **El `_25` cierra.**
- **`L-036`**: 4 filas × 8 columnas = **32 casilleros**. La contradicción se resolvió **sin medir**:
  `Auditoria.gs` tenía razón con sus 32 `post_`.

  > **Addendum 24/08/2026 — lo que se midió después, y cambia qué falta.** La estructura salió de la
  > tabla del deck **testigo del motor** (22/08 14:02, sha `cd6f0050…`): banner `Campañas` +
  > `DIGITAL`, encabezado en la tercera fila del bloque —`Período · Formato · Habitantes · Alcance ·
  > Impresiones · Visualizaciones · VTR%`— y **cuatro filas de datos**. El `8 × 4` **da bien acá**,
  > pero se verificó contra el censo casillero por casillero, no se supuso: 32 de 32, sin huérfanos
  > en ninguna dirección y sin trampa de prefijo (cero tokens `post*` en las otras 14 láminas).
  >
  > ⭐⭐ **La identidad interna existe y es el control primario:** `VTR% = Visualizaciones /
  > Impresiones`, exacta en **98 de 98** filas de la fuente, más `% Cobertura = Alcance / Habitantes`
  > en **89 de 89**. Como en `V-111`, **si la fuente se mueve se mueven los dos lados**, así que se
  > puede exigir en cada corrida y no envejece.
  >
  > ⛔ **Y lo que bloquea no es el cableado: es de dónde salen las cuatro filas.** La sección
  > `comunicaciones_post` es `repetible` sobre `REUNIONES` con `items_por_lamina = 4`, y esa columna
  > **no tiene ningún consumidor** —greppeada: sólo `Instalar.gs`, headers y seed—, así que hoy el
  > motor emitiría **una lámina por reunión POST**, no cuatro filas en una. La pieza que resuelve
  > esto **ya existe para `rdv`**: `filasRdvDelTemario_`, que trae las filas del temario **sin ítem**
  > (`R-21` nivel 1, `_25`). Falta la análoga para `reuniones/Agenda JM | Post`, que se resolvería
  > por `id_cuenta` del anclaje — y con eso `FILA 1..4` ordenado por `fecha_periodo` da los cuatro
  > casilleros, que es el molde de `L-047`.
  >
  > ⚠ **`etapa` está poblada en 4 de 15 filas de `REUNIONES`, todas de `julio_24_30`.** Para
  > `agosto_14_20` el filtro `etapa=post` da **cero ítems**, y por eso el testigo tiene una sola
  > lámina con los 32 `/////`. **Una corrida de una semana sin `etapa` cargada no puede verificar
  > esta lámina aunque estuviera cableada.**

### ⛔ Lo que abrió, medido contra el fixture del 20/08

| | el deck | el fixture | veredicto |
|---|---|---|---|
| `imp_prog` JM | **24.783.992** | — | ⛔ **el tope NO actuó** — es el total con `2976` adentro |
| `mail_entregados` JM | **538.276** | **538.291** | ✅ **CERRADO — campo inestable** (`R-31`), no bug |
| «N envíos» Mail GCBA | **63** | **63** | ✅ **EXACTO** — el 73 era una expectativa, no una medición |
| «N envíos» SMS GCBA | **4** | **3** | ✅ **campo estable, fila nueva** — `Directa SMS` es de evento |
| Call Center, láminas 2 y 5 | `/////` | — | ✅ **esperado** — no se cableó ningún `cc_*`, frenado por `X-28` |

---

## ⛔⛔ `C-80` — el Resumen Ejecutivo tiene DOS universos, y nada en el deck lo dice

**Medido el 22/08, y es más grande que los `cc_*` que lo destaparon.**

| bloque | qué universo publica |
|---|---|
| **mail** e **impresiones** (`mail_*`, los ocho `imp_*`) | ⭐ **TODO JM de la semana** — `mail_entregados` por **fecha propia** + `mail_remitente`; los `imp_*` por **pertenencia** + `nombre_campaña ~= JM`. Incluye campañas destacadas y mail masivo |
| **Call Center** (`cc_*`) | ⛔ **UNA cuenta.** El equipo publica 3 / 6.851 / 1.616 en agosto y 2 / 6.011 / 1.878 en julio — **y en los dos casos eso es una sola cuenta** |

⚠ **Las cajas están una al lado de la otra, con el mismo formato, y se leen como si respondieran la
misma pregunta.** No la responden.

⭐⭐⭐ **Y esto explica por qué `X-28` no cerraba: se buscaba una regla de VENTANA para algo que no
es de ventana.** El barrido a ciegas dio **0 de 13 propiedades** porque **ninguna propiedad de la
ventana puede explicar un recorte que no sale de la ventana.**

**`X-28` queda reformulado.** La pregunta deja de ser *"¿cuál de las cuentas que entran?"* y pasa a
ser ***"¿por qué el bloque Call Center mira otro universo?"***. ⭐ **Y eso cambia qué hace falta para
cerrarlo: la contesta el equipo en una frase, no un tercer `.zip`** — ¿es el del encuentro de la
semana, el de la campaña destacada, o un acumulado?

⚠ **Y la pregunta que no se deriva sola, anotada sin medir (`X-38`): si una lámina puede tener dos
universos, hay que mirar si pasa en otras.** Candidatas: los `u1_*` conviviendo con cuatro `ecv_*`
en la lámina del «1 a 1»; el iceberg mezclando `enc_*` de `Directa IVR` con `ecv_*` de `rdv`; el
agregado semanal de `L-034`. **Cuesta nada anticiparla y cuesta un número cuando aparece.**

---

## ⭐⭐ `R-31` — qué se puede controlar por igualdad exacta y qué no

**Premisa corregida por el usuario, 22/08: las bases son de carga MANUAL y no se completan de una
vez.** Una fila puede estar incompleta cuando el motor la lee y completarse después.

**Medido entre los dos exports, comparando la misma fila y separando las tres clases de
movimiento** —`ALTA` (`'' → valor`), `CAMBIO` (`v → v'`), `BORRADO`—:

### ✅ Los ESTABLES — cero movimientos, y son los únicos que admiten control exacto

| base · solapa | campos | filas |
|---|---|---|
| **`digital/Directa IVR`** | los **cinco** del iceberg | **44** |
| `digital/Directa SMS` | los tres | 28 |
| `rdv` | `poblacion` | **713** |

### ⛔ Qué láminas quedan **sin control por igualdad exacta**

| lámina | por qué |
|---|---|
| **5** · ECV alcance · y todo lo que salga de `rdv` | `inscriptos`, `asistentes` y los cinco `insc_*` se mueven **3–4,5 %, casi todo por ALTA**. `asistentes` es **100 % alta**: 32 de 32 son celdas vacías que se llenaron |
| **2 y 3** · los ocho `imp_*` y sus `gcba_*` | `looker/DIGITAL` se mueve **2,8–3,8 %, TODO por CAMBIO** — cero altas. Se suma a que ya están en `_revisar` por universo |
| **7** · los 32 `post_` | `CAMPAÑAS_DESGLOCE_DIGITAL` se mueve **3,3–3,6 %, todo cambio** |

⭐⭐ **Y la distinción que la medición destapó, porque manda a curas distintas: `rdv` se mueve por
ALTA y `looker` por CAMBIO.** Contra una **alta** sirve esperar a que terminen de cargar; contra un
**cambio** esperar no sirve — el valor puede volver a moverse, y ahí lo que corresponde es
`_revisar` o un rango declarado.

⛔ **`R-31` NO explica cualquier diferencia**, y ésa es la mitad importante: **un caso se cierra así
sólo si el campo está en la lista de los que se movieron.** Si el campo es estable y el número no
reproduce, **es un bug**. `V-71` (2.333) sigue valiendo como evidencia **de su foto**; lo que no se
puede es exigirlo en cada corrida.

⚠ **Y las bases no se pueden congelar en copias fijas** (`C-73`): `Base_Digital`,
`Desglose impresiones` y `ALCANCE` viven de `IMPORTRANGE`, el `.xlsx` no materializa sus valores y
al convertir a Sheets dan **`#REF!`**. **Aplanar congelaría el error como si fuera dato. No se
reintenta.**

---

## 🟡 Los cuatro tokens nuevos — el control es DEL CONJUNTO, no de cuatro corridas

**Corridos los dos botones el 22/08:** `cablearEcvFecha()` y `cablearEcvBarrios123()`. **115 filas
en `MARCADORES`.** Son los primeros consumidores de `ELEMENTO`, la novena operación.

⚠ **Los dos cableados llegaron al MISMO deck, contra el aviso que el wrapper imprimía — y está
bien.** Los cuatro tokens salían `/////`, así que **no mueven ningún número existente: llenan
celdas vacías.** La regla de *«un cambio por deck»* es para lo que **mueve** un número ya publicado
(`CLAUDE.md` §4, ampliada el 22/08 con este caso).

⭐ **Entonces el control es de los cuatro juntos**, y no hacen falta cuatro corridas limpias:

| token | esperado |
|---|---|
| `ecv_fecha` | la fecha del encuentro, `dd/MM/yyyy` |
| `ecv_barrio1` · `ecv_barrio2` | los dos barrios que ya publica `ecv_barrios` — esta semana **Parque Avellaneda** y **Parque Patricios** |
| **`ecv_barrio3`** | ⭐ **símbolo de SIN DATO.** Dos barrios, tres cajas: **es el caso normal** de `R-32`, **no un faltante** |

⛔ **Y lo que NO se puede exigir** (`R-32`): que `ecv_barrio1` valga lo mismo la semana que viene.
El orden sale del orden de las filas de `rdv`, que es **carga manual**. **Lo exigible es el
conjunto**, y eso ya lo mide `ecv_barrios`.

⚠ **Lo que sí sigue sin poder compartir deck con nada:** el tope de `R-30`, que **mueve los ocho
`imp_*`**.

---

## ⏸ En espera — no se cablea nada antes de la corrida con el tope activo

**Decisión del usuario, 22/08.** `ecv_fecha` y `ecv_barrio1-3` **no se cablean todavía**, y el
motivo no es de prioridad:

⛔ **`R-30` entra con `tope_dias_ventana_cuenta = 90` y saca 12 de 73 cuentas de la ventana — una
con 332 M de impresiones—, así que mueve los ocho `imp_*` sin verificar.** Meter un cableado nuevo
en el mismo deck haría **dos cambios a la vez**.

⭐ **Y dos cambios en el mismo deck no se pueden separar.** Si un número se mueve, no hay forma de
saber cuál de los dos lo movió — y las dos causas mandan a trabajos opuestos: revisar el tope, o
revisar el cableado. Es la misma disciplina del canario y del testigo: **una comparación sólo
significa algo si la única diferencia entre las dos tomas es el cambio que se está midiendo**.

**El orden, entonces:** corrida con el tope → verificar `imp_*` contra el deck del equipo → recién
ahí el cableado nuevo.

---

## Números que nacen sin validar

⚠ **Un número publicado sin caso no es un número verificado, y conviene que tenga su renglón** —
si no, el ✅ de al lado lo arrastra.

| | | |
|---|---|---|
| `ecv_asistentes` | **485** | **No tiene caso.** `V-43` dice 497, pero mide la **ventana de nueve días** y no el temario: son **dos universos distintos**, y restarlos es la trampa que ya anuló el cruce de `V-38`…`V-44`. Nace sin validar, en una lámina cuyos otros dos números **sí** reproducen |

---

## ⭐ El Call Center: la definición ya está medida, el cableado no

**Medido en la Parte 0 del `_27` (22/08).** Alcanza para escribir las filas; **no se escribieron**,
porque la corrección de premisa de abajo cambió el número esperado y eso lo mira el usuario primero.

**Son cuatro casilleros, no tres**, y el cuarto es el que decide la definición:

| token | en el deck | equipo JM | equipo GCBA |
|---|---|---|---|
| `cc_campanias` | `///// campañas de Call Center` | 3 | 8 |
| `cc_base` | `Base discada: /////` | 6.851 | 19.788 |
| `cc_contactados` | `Contactados: /////` | 1.616 | 7.308 |
| `cc_contact_pct` | `(/////%)` | 24 % | 37 % |

**Lo que la Parte 0 dejó resuelto:**

- ✅ **`looker/CC` tiene `Tipo de llamado`** — el freno del `0.4` no se dispara. Firma verificada:
  `ID Cuentas · Base enviada · Base barrida · Contactados · Efectivos · Tipo de llamado`.
- ✅ **`MAPEO` tiene cero filas para `looker/CC`** — `looker` sólo registra
  `resumen_metricas_dinamico` (27), `DIGITAL` (5) y `Cuentas` (3).
- ✅ **La forma se copia de `looker/DIGITAL`, y el mecanismo es el `_23`:** la solapa **no tiene
  fecha propia** y toma la ventana por **pertenencia**, declarando `clave_ventana` sobre su columna
  de cuenta.
- ⭐ **«Base discada» es `Base barrida`, no `Base enviada`** — `V-64`, `V-66` y `V-92`, sobre la
  única cuenta donde las dos columnas difieren. `V-66` lo decide por el **porcentaje**, que no se
  deriva del otro número publicado.
- ⭐ **El Resumen NO filtra por `Tipo de llamado`** (`V-92`): las «3 campañas» son las **tres**
  filas, `Reconfirmación` incluida. El filtro `Convocatoria + IVR convocatoria` de `V-91`/`S-01` es
  de la **lámina del iceberg**, que es otra.
- ⛔ **`cc_base_total` NO es un token del Resumen**: es un `campo_logico` de `reuniones/Agenda JM`
  que **`enc_base_total` ya lee** desde el `_44`. El control del `_27` lo nombraba por error.
- ⚠ **`cc_base`, `cc_contactados` y `cc_contact_pct` viven en DOS láminas** —la 2 y la 5—, así que
  cablear uno pinta las dos. **Los tres casos validados están etiquetados `resumen_ejecutivo_jm` y
  ninguno mide la lámina 5.** Hay que decidir si son el mismo universo **antes** de escribir la fila.

**Lo que la Parte B escribió, y es la mitad de abajo:** `MAPEO` para `looker/CC` —cuatro filas,
`clave_ventana` y `lcc_id_cuenta` en la col. A, `lcc_base_barrida` en la C, `lcc_contactados` en la
D— más `ventana_ref: 'Cuentas'` en `SOLAPAS`. **`Base enviada` no se mapea, a propósito.** Control:
`tools/probar-mapeo-cc.js`, 24 afirmaciones.

⭐ **Y el control de la definición cerró exacto**, contra el deck del equipo del 31/07 y la
`Base Looker` **del mismo archivo** (`V-105`): «2 campañas · Base discada 6.011 · Contactados 1.878
(31 %)», y `3289-JUNJDGAG` da 2 filas, 6.011, 1.878, 31,2 % → 31. **Cuatro de cuatro.**

### ⛔ Pero el cableado está FRENADO, y el motivo es `X-28`

**Ninguna regla escrita reproduce QUÉ CUENTAS entran.** Medido el 22/08:

| candidato | da | publicado |
|---|---|---|
| pertenencia sola (`ventana_ref` → `Cuentas`) | **18 cuentas · 22 filas · 100.197** | 2 · 6.011 |
| `nombre_campaña CONTIENE JM` — la clave de `V-64` | **2 cuentas · 5 filas · 13.965** | 2 · 6.011 |
| «las cuentas que el temario nombra» | ídem: julio nombra `3289` **y** `3387` | 2 · 6.011 |

⛔ **Y el filtro por nombre está mal por los dos lados a la vez:** deja entrar `3387-JULJDGGC`, que
también dice «JM», **y deja afuera la cuenta correcta de agosto** — `3488-AGOJDGAG` se llama
*"TE CUENTO | SALUD Eje Sur Viernes 14/8"* y **no dice «JM» en ninguna parte**.

⭐ **Lo que sí se observa en los dos decks: el bloque publica UNA SOLA CUENTA**, no un agregado de
la semana — julio `3289` (2 filas), agosto `3488` (3 filas). **En julio el temario tenía dos cuentas
con filas en `CC` y el deck usó una.** No hay regla que diga cuál, y **eso no se inventa**
(`CLAUDE.md` §4). Es pregunta al equipo.

⛔⛔ **Barrido a ciegas contra los dos períodos (22/08, tarde): 0 de 13 propiedades simples aciertan
en los dos.** Sobreviven 3 de 78 pares y 18 de 286 ternas, y **`JDGAG` está en las 21** — es el
candidato fuerte. Le falta sólo excluir a `3289` en agosto, **y `3289` está ahí por la deriva de
`fecha_fin`**. Los tres desempates que cierran —`Finalizada`, `duración ≤ 30 d`, `≤ 14 d`— aciertan
**por igual**, y dos períodos no los separan: **por eso no se escribió ninguna regla.**

⛔ **El tercer fixture no existe.** `Seguimiento Digital2026-08-06.zip` no trae `Base Looker` ni deck
de `jm`. **Lo que destraba `X-28` es un tercer `.zip` del equipo**, deck + `Base Looker` del mismo
día.

⚠⚠ **La trampa material, medida al paso, y explica el error del 22/08 mejor que el descuido:**
`3289-JUNJDGAG` tiene `fecha_fin` = **30/07** en el export del 31/07 y **20/08** en el del 20/08.
**La ventana de una cuenta se extiende**, así que en agosto una cuenta de **junio** cae dentro de la
ventana por pertenencia — y un filtro por nombre la elige antes que a la de agosto.

### ⚠ Y la lámina 5 queda pintada sin control

`cc_base`, `cc_contactados` y `cc_contact_pct` **viven también en la lámina 5**, así que el día que
se cableen **la 5 se pinta con ellos**. ⛔ **Los tres casos —`V-64`, `V-66`, `V-92`, y el `V-105` que
sale de ellos— están etiquetados `resumen_ejecutivo_jm` y NINGUNO mide la lámina 5.**

**Eso no la cierra de arrastre.** Un token verificado en una lámina no está verificado en la otra:
puede ser el mismo número por diseño o puede ser que la 5 quiera otro universo, y **hoy nadie lo
midió**. Cuando se cablee, la 5 sigue ⛔ con *"pintada sin control"* hasta que exista un caso que la
mida — es la forma de `CLAUDE.md` §4 —*un número correcto puede salir de las filas equivocadas*—
aplicada antes de que el número salga.

---

## ⭐ La lámina 6 pasa a 🟡 — el iceberg de IVR no era lo que el documento suponía

**Medido el 22/08 sobre el fixture del 20/08.** El `VALIDACION_*` dejaba **dos candidatos y ninguno
medido** para los cuatro casilleros de IVR que salen `-`. **Los dos caen.**

**1 · Los cuatro son idénticos en configuración**, y difieren **sólo en la columna**:

```
enc_audiencia · enc_atendidos · enc_e75 · enc_marque1
base digital · solapa Directa IVR · SUMA · filtro VACÍO · dimensiones VACÍO
```

⭐ Por eso **se mueven juntos**, y por eso un `-` en los cuatro es **del recorte de filas**, no de la
definición de ninguno.

**2 · ⛔ El candidato «la ventana sin filtro de `R-11`» queda excluido por lógica.** Una ventana
demasiado ancha trae **más** filas, nunca cero. **Un `-` es ausencia de filas, y ensanchar no
produce ausencia.**

**3 · ⭐ El candidato «el anclaje le asigna al ítem la cuenta de otro» queda confirmado por el
dato.** `V-106`: con `ID cuentas = 3488-AGOJDGAG` la solapa **sí** tiene filas y `enc_audiencia` da
**107.194**, que es **exactamente** lo que publica el equipo. **Si el ítem hubiera llegado con esa
cuenta, `enc_audiencia` habría tenido valor. Como salió `-`, el ítem no llegó con esa cuenta.**

⭐⭐ **Eso convierte la lámina 6 en la más cerca de ✅ de todo el deck: no le falta cablear ni
decidir — le falta UNA traza.** Qué `id_cuenta` recibe el ítem de Salud en una corrida con el
temario correcto. **Es una corrida del usuario**, no se lee del fixture.

### ⚠ Y una trampa que hay que conocer antes de intentar validar los otros tres

**Las filas de IVR de Salud están A MEDIO DISCAR en el export del 20/08.** Las dos de
`3488-AGOJDGAG` traen `llamados = 11.000` y `11.000` —**números redondos**— contra audiencias de
54.107 y 53.087: **18,7 % y 19,2 % de atendidos**.

⛔ **Todas las demás filas de encuentros JM del mismo export tienen `llamados == audiencia` y entre
83 % y 93 %** — `2763`, `2798`, `2997`, `3110`, `3143`, `3216`, `3387`. Y lo publicado por el equipo,
**96.549 (90 %)**, es el 90 % de 107.194: **tiene la forma de la fila completa**.

⭐ **Coherente con `C-25`**: el fixture es anterior y da **menos** (20.322 < 96.549).

⚠ **Consecuencia de método:** de los cuatro casilleros, **contra este fixture sólo `enc_audiencia`
es verificable**. Los otros tres necesitan un export **posterior al cierre del discado**, y un caso
que los midiera contra éste **nacería `contradice` por una razón que no es del motor** (`C-71`).

⚠⚠ **Y el aviso para cuando se resuelva `X-30`:** el par `3347-JULJDGAG` / `3387-JULJDGGC` de julio
tiene **la misma audiencia** —40.874— y **distinto discado**: 17,3 % contra 90,7 %. **Elegir mal la
cuenta ahí no da `-`: da un número plausible cinco veces más chico.**

---

## Lo que este tablero NO contesta

- **Si el deck completo sale.** Lo medido es que el agregado por temario cuesta **35 s**; que una
  corrida real con seis encuentros entre en el techo de Apps Script **sigue sin medirse**. El
  testigo con dos encuentros tardó 192 s.
- **Si una lámina 🟡 se ve bien.** 🟡 dice que el número está entendido, no que la caja lo muestre
  como corresponde.
- **Nada sobre `secco`.** Este tablero es de `jm`. `secco` tiene 29 láminas y ninguna fila acá.
- ⛔⛔ **Y una advertencia que cruza el tablero entero, `X-29`: la `fecha_fin` de una cuenta se
  extiende sola.** Medido entre los dos fixtures: **27 de 959 cuentas se extendieron**, mediana 21
  días, máximo **157**. La ventana **14–20/08** pasa de **14 a 32 cuentas**, y **18 entran sólo por
  la deriva**. Afecta a **todo lo que use `ventana_ref: 'Cuentas'`** — hoy `looker/DIGITAL` y
  `looker/CC`, o sea los ocho `imp_*`, los cuatro `cc_*` y sus `gcba_*`. **No rompe: agranda**, y
  ninguna verificación del motor lo puede ver porque el motor hace lo que se le pidió.

---

## Historial de cambios

| fecha | qué |
|---|---|
| 22/08/2026 | Nace con la Parte A del `_27`. Estado inicial: 0 ✅ · 5 🟡 · 18 ⛔ |
| 22/08/2026 | Parte C del `_27`. **Ninguna fila se movió de estado, y eso es el resultado**: la 2 y la 5 siguen ⛔. Lo que cambió es el *«qué falta»* — el Call Center pasó de *"sin cablear"* a **`MAPEO` escrito y cableado frenado por `X-28`**, que es un bloqueo con nombre en vez de un hueco. Y la 5 queda anotada como **pintada sin control**, para que no se cierre de arrastre el día que se cablee la 2 |
| 22/08/2026 | ⭐ **Tres láminas salen del alcance por decisión del usuario** — `L-039`, `L-048` y `L-050`. Nace el estado **🚫** y el conteo pasa de **17 ⛔** a **14 ⛔ · 3 🚫**. Del censo, **57 de 192** tokens dejan de ser faltantes y quedan **135**. **RRSS es la que cierra un abierto**: escondida, ya no publica los datos de la semana pasada sin marca |
