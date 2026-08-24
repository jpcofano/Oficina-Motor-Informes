# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

⛔⛔ **LO PRIMERO: la etapa 4 cuesta 158 s y se estimó en 60.** Medido en `jm-20260824-151555`.
No usa `solo_marcadores` —la 3 sí, de ahí los 192 s del testigo—, es **atómica** y **adentro no hay
punto de control**. Su estimación se calibró con **~87 marcadores** y hoy son **~172**.
⏸ **Partirla por LÁMINAS es el próximo paso**, y la constante honesta tiene que viajar con el
particionado: sola, la etapa 4 **no entra nunca** (290 útiles − 137 gastados = 153 < 158) y el
desatendido informaría *«no avanza»* cuando la verdad es *«la unidad es demasiado grande»*.
⚠ **Y `reserva_cierre_seg` hay que cambiarla A MANO a 60** — `CONFIG` sólo siembra lo ausente.

**Última actualización:** 2026-08-24, noche — la pieza de `L-036`, la colisión de secciones y
`L-043` decidido. Antes ese mismo día: `L-047` GLOBAL, el `MAPEO` de la POST y el cruce de
fixtures. Lo de más abajo **sigue vigente**: no se reescribió lo que no cambió.

---

## ⏱ Dónde estamos ahora mismo

### ⛔⛔ LO PRIMERO: `clasp push`, y después dos botones

**Nada de las cinco commits de hoy está en Apps Script.** Y el push solo no alcanza:

| # | qué correr | por qué |
|---|---|---|
| 1 | **`clasp push`** | `Generador.gs` e `Instalar.gs` cambiaron |
| 2 | **«Aplicar configuración»** | ⚠ **`CONFIG` sólo siembra lo AUSENTE** y hay **4 claves nuevas**; el `MAPEO` de la POST también entra acá. `instalar()` no siembra |
| 3 | **`cablearAgregadosDelGlobal()`** | ⚠ **escribe en `MARCADORES`** — los 3 del GLOBAL de `L-047` |
| 4 | **una corrida de `jm`** | ⛔ **ningún token de `L-047` se vio publicar todavía**: los 40 de envío tienen fila desde el 23/08 y los 3 del GLOBAL desde hoy |

### ✅ Lo de hoy, en una línea cada uno

- **`L-047` GLOBAL completo** — `camp_enviados`, `camp_or`, `camp_mail_clics`. El denominador de
  `% OR` se **midió** contra el deck (una sola fila discrimina: 62 vs 61). Controles primarios que
  no dependen del deck: `% OR = aperturas/entregados`, `% CTOR = clics/aperturas`, y el GLOBAL =
  suma de los envíos (ése **cruza fuentes**).
- **`L-036`**: `MAPEO` de `reuniones/Agenda JM | Post` de 2 campos a 7, con tipos medidos y tres
  identidades internas exactas. **Y la pieza** — abajo.
- **`L-043` decidido**: los seis van como **texto del equipo**, reversible y fechado.
- **Cruce de fixtures**: 19 archivos, **un solo** desalineado. Y `.xlsx` **no trae `sheet_id`**.

### ⭐⭐ La pieza de `L-036`, y la colisión que arrastraba

**Dos cosas juntas, porque una sin la otra no sirve.**

**1 · La colisión.** `filasRdvDelTemario_` tomaba **la primera** sección `agregado` + `REUNIONES` +
`activa`; su comentario afirmaba que soportaba una segunda y **no la soportaba**. Nunca fue un
contrato: era la coincidencia de que hubiera una sola. Ahora
`seccionAgregadaDeReuniones_(secciones, informeId, seccionId)` exige el id, verifica que exista y
que califique, y **sin id no elige una: falla diciendo que no hay default**. Los ids viven en
`CONFIG` (4 claves nuevas), no en el código.

**2 · La pieza.** `filasDeSolapaDelTemario_` trae las filas del temario de **cualquier** solapa,
resolviendo por **`id_cuenta` del anclaje** contra `campo_id_cuenta` (`D-30`) — no por
`(nombre, fecha)` como la de `rdv`. Deduplica por cuenta y **separa `sin_cuenta` de `sin_fila` de
`con_varias`**, que mandan a trabajos distintos. Más una rama en `datosDeMarcador_` con su guarda
de solapa, **antes** de la declarativa: sin eso un `post_*` sin ítem publicaría el agregado de las
102 filas.

⛔ **Y lo que NO hace, a propósito: no publica nada.** `comunicaciones_post` sigue `repetible`, así
que **no califica** y la pieza no aporta filas (el motivo sale en el log). `L-036` sigue con sus 32
`/////`, **y eso es lo esperado**.

**Control:** `probar-agregado-por-temario.js` de 26 a **41 afirmaciones**. Las nuevas existen porque
**ninguna de las viejas falla si la rama nueva no funciona**. Incluye romper el resolver a propósito
y verificar que la afirmación de la colisión **cae**. Las 39 de `tools/` en verde.

---

### ⏸ La única decisión abierta de la etapa A

⭐ **Que `comunicaciones_post` pase de `repetible` a `agregado`.** Es una decisión de registro y la
toma el usuario; el camino es `curarSecciones_` (precedente: `ponerIteraSobreEnEcvAlcance()`, que
existe justo para esto). Con eso hecho, la pieza empieza a traer filas y los `post_*` se pueden
cablear con `FILA 1..4` ordenado por `fecha_periodo` — molde `cablearTablaDeEnvios()`.

⚠ **Dos cosas que van a seguir faltando aunque el flip se haga:**

1. **Tres de las ocho columnas no tienen fuente** —`post_camp`, `post_periodo`, `post_formato`—.
   Pregunta al equipo, **sin prioridad**.
2. **`etapa` está poblada en 4 de 15 filas de `REUNIONES`**, todas de `julio_24_30`. Una semana sin
   `etapa` cargada da **cero ítems**, así que `agosto_14_20` no puede verificar esta lámina.

---

### Antes, el mismo 23/08: `X-39` cerrado — `L-046` ya no tiene nada que lo bloquee

**`SOLAPAS.campo_id_cuenta` declarado** en `looker/DIGITAL` (`ldig_id_cuenta`) y `digital/Directa
Mail` (`mail_id_cuenta`), más tres filas de `MAPEO`. **Los quince `camp_{meta,google,prog}_*` de
`L-046` quedan destrabados**, y con `camp_ctr`/`camp_vtr` son **17 tokens** listos para cablear.

⛔⛔ **Se declaró, se revirtió y se repuso el mismo día, y eso hay que saberlo antes de leer
cualquier número de esta solapa.** Con la declaración puesta los `imp_*` de JM salieron
**idénticos** al testigo `V-110` y los `gcba_imp_*` **+0,37 %**. **No fue el cambio:**
`campo_id_cuenta` es **por solapa**, los ocho `imp_*` la leen igual y sólo difieren en
`dimensiones` — un cambio de esquema **no puede** mover un ámbito y dejar el otro idéntico al
dígito. El canario `gcba_frecuencia`, que lee **otra solapa**, se movió igual.

⚠ **La causa es `R-31`: `looker/DIGITAL` es inestable por CAMBIO** (`19/503`, cero altas). **El
testigo `V-110` no se puede volver a usar con criterio de igualdad sobre los `imp_*`** — su
criterio corregido, por marcador, está en el addendum del 23/08 del testigo.

⭐ **Y `CLAUDE.md` §4 se corrigió:** *"la cuenta de filas distingue se rompió de la base se movió"*
**sólo vale cuando la base se mueve por ALTA**. Con inestabilidad por CAMBIO la regla acusa al
código que no tocó nada.

---

### Lo anterior del 23/08: tres láminas salen del alcance — `D-39`, cero código

`L-039` (M2), `L-048` (Desagregados · Respuestas) y `L-050` (RRSS) **no se cablean**. El tablero
pasa de **17 ⛔** a **14 ⛔ · 3 🚫**, y del censo **57 de 192** tokens dejan de ser faltantes:
quedan **135**. ⚠ El pedido decía 58 — son **58 apariciones y 57 distintos**, porque
`camp_remitente` vive también en `L-047`, que sigue en el alcance.

⭐⭐ **RRSS cierra el peor abierto que teníamos.** Su primer bloque **no tiene tokens** y publicaba
los datos de la semana pasada **sin ninguna marca**; el usuario la escondió y eso lo resuelve de
raíz — no se publica. ⛔⛔ **Pero la causa no se arregló: si alguien la vuelve a mostrar sin cablear
los 21 tokens, el problema vuelve entero.** El motivo está escrito en `CIERRE_POR_LAMINA.md` y en
`CONFIG_INFORMES.md` §1.11, y el tablero dice **cuántos tokens quedan dormidos en cada lámina**
—23 · 14 · 21— para saberlo **antes** de mostrarla.

⚠ **Y un número que quedó viejo:** los **«49 crudos permanentes»** de `Desatendida.gs` se midieron
con `L-050` visible. Suben; **cuánto lo dice una corrida, no una suma.**

---

**El `_27` cerró con sus tres partes hechas y una frenada a propósito.**

- ✅ **Nace `docs/CIERRE_POR_LAMINA.md`** — el tablero por lámina que `D-38` pedía y no tenía dónde
  vivir. Estado inicial medido: **0 ✅ · 5 🟡 · 18 ⛔** sobre 23 filas de `LAMINAS`. **El ✅ lo pone
  el usuario, nunca Code.**
- ✅ **`MAPEO` de `looker/CC`** — cuatro filas + `ventana_ref: 'Cuentas'`. `Base enviada` **no se
  mapea, a propósito**. Control: `tools/probar-mapeo-cc.js`, 24 afirmaciones.
- ⛔ **El cableado de los cuatro `cc_*` está FRENADO por `X-28`** — ver abajo.
- ✅ **El veredicto de `curarCamposMarcadores_`** — cero escrituras con **todas** las filas en el
  estado pedido es **éxito idempotente**. Control: `tools/probar-veredicto-idempotente.js`, 22
  afirmaciones.

**28 suites, 0 en rojo. `clasp push` hecho. Todo pusheado.**

### ⛔ Lo único que bloquea el Call Center: `X-28`

La **definición** está cerrada `exacto` (`V-105`, cuatro de cuatro contra el deck del 31/07):
«Base discada» = **`Base barrida`**, y el Resumen **no filtra** por `Tipo de llamado`. Lo que falta
es **qué cuentas entran**, y **ninguna regla escrita lo reproduce**: la pertenencia sola da el
gabinete entero (22 filas / 100.197 contra 2 / 6.011) y el filtro por nombre falla por los dos lados
—deja entrar `3387`, y deja afuera `3488-AGOJDGAG`, que **no dice «JM»**—.

⭐ **Los dos decks publican UNA SOLA CUENTA.** No hay regla que diga cuál. **Es pregunta al equipo**,
escrita en `PENDIENTES` con las tres formas que podría tener la respuesta.

### Lo que espera al usuario

1. **Correr `jm` sobre `agosto_14_20`** — confirma los 🟡: los tres «N envíos» (6 · 73 · 3) y los
   ocho `imp_*` en `_revisar`. **Ninguna escritura en `MARCADORES` prueba que el deck salga bien.**
2. **Decidir el rótulo de Programmatic** — (a) cambiarlo a *"acumulado de las campañas de la
   semana"*, cero código y no depende de nadie · (b) pedir el dato semanal · (c) `/////`.
3. **Contestar `X-28`**, o pasársela al equipo.

⚠ **Y lo que sigue sin medirse:** que una corrida real con **seis** encuentros entre en el techo. Lo
medido es que el agregado por temario cuesta **35 s**; el testigo con **dos** tardó 192 s.

---

## ⭐ Lo primero, porque cambia cómo se lee todo lo demás: el proyecto tiene dos fases

**`D-38`, aprobada por el usuario el 22/08.** **`informe semanal`** —el motor genera el deck y cada
número publicado está verificado— **y después `informe actualizable`** —un deck ya publicado
refresca sus números en el lugar sin tirar el trabajo del equipo—. La segunda **no empieza hasta que
cierre la primera**, y el motivo va escrito con la decisión: refrescar un número que todavía no está
validado es **automatizar la publicación de un número mal**.

**Todo lo que está en `PLAN.md` §2 es fase `informe semanal`.** El prompt de la otra está escrito,
sin correr y en el Backlog.

### Cómo cierra, y qué destraba eso

**Cierra cuando vos, mirando un deck completo, declarás que los faltantes que quedan no son
relevantes.** No hay umbral ni conteo: **es revisión humana**. Con dos consecuencias que van con el
criterio:

1. ⭐ **No es que no haya faltantes: es que estén a la vista para poder juzgarlos.** Por eso el P1 de
   `FALTANTES` —**se pisa en cada corrida y no tiene lector fuera del editor**— dejó de ser un
   pendiente más: **es el instrumento del cierre de la fase**. Hoy esa declaración **no se puede
   hacer**, y esto es lo que la destraba.
2. **La declaración va pegada a un `corrida_id`.** Sin corrida es una frase, no un cierre.

### ⛔ Y una regla que salió de equivocarme: el testigo es `jm-20260821-234927`

Puse una condición del criterio en ⛔ citando *"la misma lámina tres veces con tres juegos de
cifras"*. **Esa evidencia es de `230048`** —la del temario de 12 encuentros—, y §4.3/§4.4 son de
`194602`. **Sobre el testigo nadie la midió**, y lo que vos revisaste a mano **da bien**: *Eje Sur*
es el nombre y *Parque Patricios* el barrio.

**Es la tercera conclusión sobre el producto sacada de `230048`.** La regla quedó registrada con las
tres: ninguna conclusión sale de otra corrida sin decir por qué. **`230048` engaña porque es más
grande, y más grande se lee como más completo.**

⚠ **Lo único medido sobre el testigo es la condición 1.** Las demás salen de otras corridas, y el
criterio pide que se cumplan **todas sobre la misma**.

---

## ⛔ Lo primero, y es lo más valioso de la noche: hay un mapa de qué publica bien el motor

`docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md` compara **lámina por lámina** el deck que
generó el motor contra el que publicó el equipo, **la misma semana**. Es el primero de la serie que
mide producto terminado contra producto terminado, y cambia qué conviene hacer primero.

**Lo que reproduce exacto, y no se toca:**

| bloque | |
|---|---|
| Alcance del encuentro | **las seis cifras** — 619 · 96 · 10 · 855 · 186, y el equipo publica `Call + IVR: 130` donde el motor publica **101 + 29** |
| Mails entregados JM | 538.290 contra 538.291 — **difiere en uno** |
| Aperturas M2 | **0,16 %** |
| Aritmética de los resúmenes | **cierra en los dos decks**: el motor no se equivoca sumando |

**Lo que no cierra, y qué trabajo manda cada uno:**

| qué | tamaño | qué es |
|---|---|---|
| ⭐⭐ **IVR y Call Center del iceberg** | **chico y de alto rendimiento** | los cuatro números del equipo —96.549 · 304 · 33.139 · 107.194— **el motor los publica EXACTOS**, en la copia equivocada de la lámina. **El cableado existe: lo que falla es qué ítem le llega** |
| ⛔ `N envíos de Mail` / `de SMS` | chico | mide **piezas**, no envíos: 541.002 contra **6**. El número es correcto para otra pregunta |
| ⛔ los seis `pauta_*` | chico | publican **`1`** contra 28 y 270 |
| ⛔ Programmatic 3,6–7,2× | mediano | Meta y Google están en 1,3–3×. **Los ratios difieren por plataforma**, así que no es la ventana |
| ⛔ M2 −9,6 % | mediano | **numerador quieto, denominador corrido** — no salen del mismo conjunto de filas |
| ~~⛔ RRSS~~ | ✅ **cerrado el 22/08** | publicaba **la semana pasada sin marcarlo**: su primer bloque no tiene tokens, el motor no lo toca, y salía intacto. **El usuario escondió la lámina** (`D-39`) — ya no se publica. ⛔ **La causa sigue ahí**: mostrarla de nuevo lo reabre entero |
| ⛔⛔ el reparto de ítems entre copias | grande | la misma lámina sale **tres veces con tres juegos de cifras** |

⚠ **Antes de perseguir Programmatic, medir una cosa barata:** el equipo titula *"14_08 al 21_08"* —
**ocho días** — y `R-11` son siete. No se descartó como causa de las diferencias de volumen.

---

## ⏸ Lo que espera de tu lado, en orden

| # | qué | por qué |
|---|---|---|
| 1 | ⭐ **`cablearEnviosComoConteo()`** | tres marcadores pasan a `CONTEO`. El fixture ya dijo el número: **6** envíos de Mail JM y **3** de SMS, exactos contra el equipo |
| 2 | ⭐ **`marcarProgrammaticARevisar()`** | `imp_prog` y `gcba_imp_prog` pasan a publicar entre guiones. Se saca con `revertirMarcaDeProgrammatic()` |
| 3 | ⛔ **Decidir el rótulo de Programmatic** — ver abajo | es lo único que lo destraba, y **no depende del equipo** |
| 4 | **Generar `jm`** con `agosto_14_20` | para ver 1 y 2 en el deck, y para verificar la predicción de la lámina de campaña |
| 5 | **Aplicar configuración** | siguen faltando las **8 filas `REVISAR`** del `MAPEO` |

⚠ **Las dos preguntas al equipo NO bloquean nada** (decisión tuya, 22/08). Están en
`PENDIENTES_consistencia.md` con todo lo medible ya medido, esperando sin frenar.

---

## ⛔ Lo que necesitás decidir sobre Programmatic, y es una sola cosa

**El diagnóstico está cerrado y el número no está roto: es el ACUMULADO.** `looker/DIGITAL`
actualiza la fila y no agrega filas, así que `Impresiones` trae todo desde que la campaña arrancó.
Autódromo empezó ocho días antes de la ventana y el equipo le atribuye **379.512** donde su fila
dice **3.756.321** — factor 9,9. Google, que casi no acumuló antes, cierra a **1,05×**.

⛔ **El dato semanal no existe en ninguna solapa**: `DIGITAL` no tiene columna temporal y
`CAMPAÑAS_DESGLOCE_DIGITAL` tiene grano **mes**. **Ninguna operación arregla esto.**

**Las tres salidas, y son excluyentes:**

| | qué | qué cuesta |
|---|---|---|
| **(a)** | **Cambiar el rótulo** a *"acumulado de las campañas de la semana"* | ⭐ **cero código.** El número que el motor publica **ya es correcto para esa pregunta**. Es la barata y no depende de nadie |
| **(b)** | Pedirle al equipo el dato semanal | es la única que hace el número de la semana. Depende de ellos |
| **(c)** | Publicar `/////` hasta que exista el dato | honesto, cuesta una celda, y **pierde** un número que hoy sirve para otra cosa |

**Mientras no decidas, queda `_revisar`** — que dice *"hay un número y no confíes"*, que es la
verdad, y **no es una de las tres salidas: es el estado de espera.**

⚠ **Y lo que va con la decisión:** `imp_total`, `imp_meta` e `imp_google` **tienen la misma causa**,
y `imp_total` además **incluye** a Programmatic —28.988.260 contra 6.487.855—. Hoy **no están
marcados**, por pedido tuyo. Si la salida es (a), el rótulo los cubre a los cuatro; si es (c),
habría que decidir de nuevo por cada uno.

---

## Qué cambió en el panel

**Dos botones donde había uno**, y la pantalla dice cuál conviene:

- **Generar informe** — corre de una vez y devuelve el deck. **Sigue siendo el caso normal**: el
  arranque cuesta 70–80 s **por ejecución**, así que partir una corrida en tres lo paga tres veces.
- **Generar y que siga sola** — arranca la corrida desatendida. Si corta, se reanuda sola.

⚠ **El botón viejo NO se retiró a propósito.** Hasta que el desatendido esté probado punta a punta,
sacarte la única forma que funciona hoy va para el lado equivocado.

**Pestaña «Corrida»** — sólo lectura: `corrida_id`, ejecución N de 6, el plan por sección, y el
**freno** con confirmación. ⭐ Contesta *«¿está listo?»* con el **sello del nombre del deck**, no con
los tokens: las láminas escondidas dejan **49 crudos permanentes** en toda corrida — ⚠ **medidos
antes de que RRSS se escondiera; hoy son más y hay que re-medirlos**. **No se refresca
sola y dice a qué hora leyó** — una pantalla que se actualiza sola parece siempre actual aunque el
backend haya dejado de responder.

**Pestaña «Anclajes»** — las filas *«ninguna reunión vigente la reclama»* ahora se pueden
**archivar**. No se borran: vuelven solas si la reunión vuelve a `mostrar = sí`, y el contador de
huérfanas **no baja** al archivar.

**Y el enlace al deck ya no dice `[object Object]`.** Estaba en `Panel.html`, no en el adaptador —
el comentario que decía lo contrario era falso y mandaba al archivo equivocado.

---

## ⛔ Dos cosas que hay que saber antes de leer un número

**1 · El período elegido y el calculado dan la misma ventana y distinto temario.** `agosto_14_20` y
`R-11 (calculado)` resuelven **los dos** vie 14/08 → jue 20/08. Pero `anclarEncuentros` recorta
`REUNIONES` por período **sólo si la ventana vino por `periodo_ref`**, así que sin período entran
**12 encuentros en vez de 2**, con junio y julio adentro. El deck `jm-20260821-230048` es eso, y
salió **sin que nada fallara**.

⚠ Hay aviso en el panel desde el 20/08 (`avisosDeVentanaPropuesta_`), pero es **preventivo y no
forense**: un deck ya generado **no se puede auditar**, porque ningún reporte lleva el `periodo_id`.
Y el camino desatendido del editor **no pasa por el panel**, así que no ve el aviso. Está como
**P1** en `PENDIENTES_consistencia.md`, con su corrección del 22/08 al lado.

**2 · `corte` no se persiste en ninguna hoja.** El único rastro forense de que una corrida cortó es
**el sello en el nombre del deck** — `FALTANTES` se pisa en cada corrida y `CORRIDAS` no tiene
columna de corte. La celda `faltantes` sí conserva el `· gasto:` con el rastro de etapas, que es de
donde salió el cierre de la Parte 0.

---

## Las suites, todas en verde

**23 bancos**, corridos enteros al cerrar. Dos nuevos o ampliados hoy:

- `probar-desatendida-en-el-panel.js` — **33 afirmaciones**. Carga `Desatendida.gs` y
  `PanelBackend.gs` **en el mismo contexto**, que es como corren de verdad. Fija que `continuable`
  de afuera se ignora, que el período y las secciones viajan, y que **los dos botones mandan lo
  mismo**.
- `probar-confirmar-anclaje.js` — cinco secciones nuevas que **ejecutan** el lector en vez de
  mirarle el fuente. Una regex habría pasado igual con la condición al revés.

⚠ **Y la lección de la noche, que vale para el próximo banco:** el primer «romper a propósito» falló
porque el parche era una cadena con `\n` y **los `.gs` están en CRLF**. Falló **ruidosamente**
gracias a la guarda que exige que el parche matchee. **Sin esa guarda, la sección habría quedado en
verde sin haber roto nada.**

---

## ⛔ Evidencia que no se puede perder

- **Los tres decks del 21/08**, con lo que cada uno prueba:
  `1_krz_dTgwVqFm8BbAIhxKl6VAvD3zMy1MYx9BUGlMnI` (194602, temario correcto, cerró) ·
  `10omnlzVY6nrwg6CX-EqyBIypTgQ6sY7XRB15JNkugC4` (224727, **sigue sellado** — es la prueba del corte) ·
  `1lg-FcqM5VlDAo4HaFI_0AuKEQ6H1hx4s_nmVWdqhPO0` (230048, el del temario de 12 encuentros).
- **Los tres fixtures**, con su huella en `docs/_fixtures/README.md`. El del 20/08 trae la base
  **y los dos decks del mismo día**, y de ahí salió la validación.
- ⚠ **Dos `.pptx` de decks reales quedaron en el historial de git** (commit `7e48725`). Riesgo
  asumido por decisión tuya.

---

## Cómo leer esto desde afuera

- **Qué se hizo y qué se midió** → `docs/BITACORA.md`, entradas del 2026-08-22.
- **Qué publica bien el motor y qué no** → `docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md`.
- **Qué sigue abierto** → `docs/PENDIENTES_consistencia.md`.
- **Qué hace una persona para sacar el informe** → `docs/PROCESO_SEMANAL.md`, addendum del 22/08.
- **Lo que quedó fuera de alcance y va antes que cualquier frente del plan** → el encabezado de
  `digital/Directa IVR`: las 12 desalineadas que encontró `verificarEncabezadosDeMapeo()` **no son
  columnas corridas** — los rótulos son datos (`2450-ENEJDGAG`, `12049`, fechas), o sea que está
  leyendo la fila equivocada como encabezado. Y **las columnas J y K devuelven el mismo rótulo
  falso**, así que `ivr_audiencia` e `ivr_llamados` podrían estar leyendo la misma columna con
  números plausibles. Va en el `_20`.
