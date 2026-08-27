# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-27 (2) — **`2026-08-27_2`: el temario se parte en un corte
posicional (`D-45`) y `eje` deja de decidir qué entra (`D-46`).** Es el arreglo del fallo de la
primera corrida real del asistente. **Ninguna hoja viva cambió** salvo lo que leyeron los dos gates,
que son sólo lectura. **Suites: 63 bancos, ~985 afirmaciones.**

### ⭐ Lo último, en cinco líneas

- ⛔⛔ **La causa del fallo no estaba en el anclaje.** `leerReuniones_` filtraba
  `fila[eje] && esVerdadero_(mostrar)` — **las dos condiciones**. Una línea que el parser no
  interpretaba quedaba con `eje` vacío, **se podía tildar**, y **nunca llegaba al anclaje**: el
  mensaje culpaba al **período**, que era inocente. Y el único diagnóstico que existía para
  explicarlo abría con `if (!fila[idx.eje]) return;` — **descartaba sin contar justo esa fila**.
- ⭐⭐ **Llegó el tercer temario real y no se parece a ninguno de los dos anteriores.** Ni `>`, ni
  `N)`, ni `|`, ni el plural son obligatorios: `Uno a uno en Coghlan (21/08)` · `Campaña Destacada`
  · `Operativo Movilidad Más Segura`. Congelado en `docs/TEMARIOS_reales_2026-08-27.md`.
- ⛔ **Había DOS formas de decidir cuál es el bloque de campañas, y la vieja ya fallaba** con el
  singular. Hoy hay **una** —`partirTemario_`, posicional— y la usan los tres llamadores.
- ⛔⛔ **Un control negativo se escribió al revés y el rojo lo corrigió:** sacar la guarda del `|`
  **no cambia nada**. Hay **dos cerrojos** y el que aguanta hoy es otro —`cuerpoDeLineaDeTemario_`
  no saca el `eje |`—. El control quedó dado vuelta, aislando la guarda con su propio fixture.
- ⚠ **Y un hallazgo que el prompt no tenía:** las tres líneas del temario real daban **la misma
  `claveReunion_`**, así que el dedupe colapsaba **tres líneas en una fila**. Ya pasaba con `eje`
  adentro de la clave — **no lo causa este cambio**.

### ⛔ Lo que hay que correr, y es del usuario

1. **`clasp push`** — se tocaron `Campanas.gs`, `Reuniones.gs`, `Union.gs`, `PanelBackend.gs`,
   `Panel.html` y `Auditoria.gs`. **Nada de esto está en el proyecto de Apps Script todavía.**
2. ⭐⭐ **Pegar el temario REAL del 27/08 en el asistente, de punta a punta.** Es el caso que falló,
   y es lo único que contesta si el arreglo sirve. **Lo que tiene que verse:**
   - **1 reunión** (Coghlan, `21/08`, `eje` vacío, `nombre = "Coghlan"`), **1 campaña**
     (`Operativo Movilidad Más Segura`), y **cero** líneas «sin parsear»;
   - la línea `Campaña Destacada` **listada arriba del paso 3** como *«no fue a ninguna hoja»*;
   - y el anclaje corriendo sobre la reunión de Coghlan.
3. ⚠ **Si el anclaje falla, mirar el mensaje nuevo**: ahora dice por separado cuántas quedaron
   afuera por `mostrar` y cuántas por `texto_original`, **y también cuando no quedó ninguna**.

### ⚠ Tres cosas declaradas, no resueltas — y son tuyas

- ⚠ **Si un día llega `Campañas y enviados de la semana` SIN el `|`, el temario corta ahí.** Se
  acepta y **se ve**: la línea queda en `ignoradas` y el paso 3 la muestra. No se inventó una
  heurística de contenido.
- ⚠ **Sin la línea «Otros temas», las de abajo caen en campañas** — y `AJ-1` las escribe con
  `mostrar = 'sí'`, o sea que **nacen confirmadas**. El banco lo documenta con el mismo texto sin
  esa línea, **sin fingir que da lo mismo**.
- ⚠ **Una fila con `eje` vacío que alguien haya tildado pasa de inerte a poder ENTRAR** al informe.
  Al 27/08 la hoja viva tiene **0 filas así**, así que hoy no hay nada que borrar — pero conviene
  saberlo antes de la próxima corrida.

### ⚠ Y un pendiente medido que NO se corrigió, a propósito

**`R-02` está citado con dos sentidos distintos y uno es el equivocado.** La regla del temario es
**`R-04`**; `R-02` es *«criterio de fuente cruda»*. **Censo: 17 citas equivocadas en `.gs`/`.html`
contra 7 correctas.** Se corrigieron **sólo las escritas hoy**; el resto está en
`docs/PENDIENTES_consistencia.md`. Una pasada sobre 6 archivos para cambiar un número no era el
objetivo de este prompt.

⚠ **Lo que esta corrida NO tocó:** ningún número publicado, ninguna fila de `MARCADORES`, ninguna
plantilla, ninguna hoja viva. **La cola de abajo sigue exactamente donde estaba.**

---

**Última actualización:** 2026-08-27 — **`2026-08-27_1`: el asistente lineal de cuatro pasos
(`D-44`), en cuatro commits.** Todo el trabajo es del **front y el proceso**; **no se generó ningún
deck**, **no se tocó ninguna plantilla** y **ninguna hoja viva cambió**. **Suites: 59 → 63 bancos,
~795 → ~961 afirmaciones**, veredicto por exit code.

### ⭐ Lo último, en cinco líneas

- ⭐⭐ **Los cuatro pasos ya estaban construidos; lo que faltaba era la máquina de estados.** Ahora
  existe, y **la guarda es de HECHOS leídos de las hojas vivas, en cascada** —existe la fila de
  `PERIODOS`, hay filas de temario, ninguna reunión con `mostrar` vacío—. **Sin cascada, saltear
  DOS pasos pasaría:** sobre un temario vacío *«nadie sin confirmar»* es cierto **por vacuidad**.
- ⛔⛔ **Premisa del prompt CORREGIDA con medición: el anclaje no puede correr al ENTRAR al paso 3.**
  `leerReuniones_` filtra por `mostrar` **antes** de que el anclaje vea nada, y el temario recién
  cargado tiene `mostrar` vacío en todo. Anclar al entrar devuelve tres listas vacías, **que se
  leen como «ningún encuentro tiene problema»**. ⇒ El paso 3 es **una pantalla con dos momentos**.
- ⛔⛔ **Y el hueco del paso 2 estaba en el PARTIDOR, no en el cargador.**
  `partirTemarioEnBloques_` **se come** la línea que no parsea —la toma como título de bloque— así
  que nunca llegaba a recibir su `notas = 'no se pudo parsear'`. **Un temario que carga 4 de 5 y no
  lo dice publica un informe al que le falta un encuentro.**
- ⚠ **`D-43` se supersedió PARCIALMENTE, no entera.** El prompt pedía marcarla derogada; con el
  código delante, **su escritor `crearPeriodos_` y la opción «semana en curso» son lo que el paso 1
  usa**. Sólo cae generar N semanas por adelantado — `generarProximasSemanas()` y
  `generarPeriodosSemanales_` se retiraron.
- ⭐ **Un control negativo se escribió al revés y el rojo lo corrigió:** anular la guarda del
  **panel** no duplica la fila de `PERIODOS`, porque la protección vive en `crearPeriodos_`, que es
  el **escritor**. Lo que la guarda del panel compra es el **reporte**.

### ⛔ Lo que hay que correr, y es del usuario

1. **`clasp push`** — se tocaron `PanelBackend.gs`, `Instalar.gs`, `Panel.html`, `Reuniones.gs`,
   `Campanas.gs` y `Union.gs`. **Nada de esto está en el proyecto de Apps Script todavía.**
2. **Abrir el panel y hacer una semana entera por la pestaña «Asistente»**, de punta a punta. Es lo
   único que contesta las tres preguntas que ningún banco puede: que la celda quede escrita, que el
   anclaje entre en la espera de una pantalla, y que el deck salga.
3. ⚠ **Cronometrar el paso 3.** El anclaje corre con las dos cachés abiertas —copiadas del
   preámbulo de `generarInforme`, no armadas de nuevo— y **se asume que no tarda**. Los ~500 s que
   circularon eran el costo **sin caché**; con el preámbulo la misma resolución dio **11,3 s**.
   **Si resulta que sí tarda, el número es el hallazgo:** la espera es un problema de UI y la
   decisión es tuya.

### ⚠ Tres cosas que quedaron declaradas, no resueltas — y son tuyas

- ⛔ **Elegir la cuenta de un `sin link` no se puede desde el panel.** El motor sólo deja fila en
  `ANCLAJE_PENDIENTE` cuando el score queda **bajo el umbral**, así que `panel_confirmarAnclaje` no
  tiene dónde escribir — y no inventa filas. **La pantalla lo dice en vez de ofrecer un botón que
  falla.** Habilitarlo pide que el motor registre fila también para los `sin link`, y eso **cambia
  qué significa esa hoja** — el prompt pedía explícitamente que no cambie.
- ⚠ **Un temario de SÓLO campañas abre el paso 4 sin pasar por el 3.** `AJ-1` las escribe con
  `mostrar = 'sí'` de entrada, así que **nacen confirmadas** y no hay hecho que pruebe que alguien
  las miró. No se inventó una columna para taparlo: está **afirmado en el banco**.
- ⚠ **Un encabezado legítimo sin `>`** —`DGAYD`— vuelve a la lista de reuniones y produce una fila
  `no se pudo parsear`. **Elegido a sabiendas:** una fila de más se ve en el paso 3 y se destilda;
  una línea perdida en silencio no se ve nunca.

### ⭐ Lo que cambió de escritores, y está declarado

| hoja | qué se agregó |
|---|---|
| `CAMPANAS` | **`curarCamposCampanas_`** — nuevo. Misma forma que el de `REUNIONES`: angosto, no crea ni borra filas, devuelve el antes y el después, reporta la clave que no matchea |
| `REUNIONES` | `curarCamposReuniones_` **ya existía**; el paso 3 lo usa. No es un camino nuevo |
| `PERIODOS` | `crearPeriodos_` sin cambios, ahora con **tres** llamadores |

⛔ **Las tres fichas se escribieron A MANO**, porque `tools/escritores.js` sigue en **rojo** (`P0`
preexistente, `docs/PENDIENTES_consistencia.md`).

⚠ **Lo que esta corrida NO tocó:** ningún número publicado, ninguna fila de `MARCADORES`, ninguna
plantilla, ninguna hoja viva. **Toda la cola de abajo sigue exactamente donde estaba** — incluido
`D-33` a medias, los cinco tokens que publican el universo de la otra lámina, y `X-28`.

---

**Última actualización:** 2026-08-27 — **corrida nocturna `2026-08-26_2`: siete de ocho partes, y dos bugs que ninguna suite podía ver.** Todo el trabajo es del **front y el proceso**; **no se generó ningún deck** y **no se tocó ninguna plantilla**. **Suites: 55 → 59 bancos, ~666 → ~795 afirmaciones**, veredicto por exit code.

### ⭐ Lo último, en cinco líneas

- ⛔⛔ **P0 arreglado, y lo encontró la Parte D al probar la reanudación en frío: una corrida que corta ANTES de la etapa 4 no podía terminar.** Las cuatro variables de `D-41` vivían dentro de `if (!corte)` y el retorno hace `laminasDeEtapa4.length` **fuera del `try/catch`** → `TypeError`, fila de `CORRIDAS` sin cerrar, sin plan para continuar. **Es el caso normal del desatendido**, que corta en la etapa 3. Mismo error que `copia.getName()` del 21/08, en la misma función: aquel barrido dijo *«dio una sola»* **con razón**, porque estas cuatro nacieron tres días después. **Un cero medido vale para su fecha.**
- ⛔⛔ **P0 anotado y NO arreglado: `tools/escritores.js` e `inventario.js` están en ROJO** —*«Llaves desbalanceadas tras limpiar `Generador.gs`»*— y medido que es **preexistente** (`exit=1` en los últimos 20 commits que tocaron ese archivo). **`CLAUDE.md` §7 los declara fuente de verdad** para *«cómo está construido el código»*, así que esa pregunta se quedó sin dueño vivo y nadie se enteró: `suites.js` corre `probar-*.js` y no los ve. Por eso la ficha nueva de `ESCRITORES.md` se escribió **a mano**, declarándolo.
- ⭐⭐ **El universo del marcador ahora viaja pegado al número** (Parte A). Las ocho ramas de `datosDeMarcador_` construían un `origen` preciso **y nadie lo leía**. Cuando `L-036` publicó el Recap de CABA con 2.463.980 habitantes, la traza decía `leerFuente(digital/…)` — correcto, disponible — **y el número salió igual**.
- ⛔ **El aviso de ventana iba por su TERCERA generación diciendo algo falso** (Parte C). *«Las secciones repetibles NO se recortan por período»* es **falso desde el `_25`** (22/08 13:21). **Un aviso que se corrige tres veces no tiene un bug, tiene la fuente equivocada**: decidía con su propio criterio mientras el motor decidía con otro. Ahora llama a la misma función, y el banco afirma que el panel **no tiene cálculo propio**.
- ⭐ **`D-43`: el panel crea períodos** (Parte F), insert-only, con «semana en curso» derogando parcialmente `R-11` Addendum 2 y el aviso de datos parciales **al elegirla, no al terminar**.

### ⛔ Lo que hay que correr, y es del usuario

1. **`clasp push`** — se tocaron `Generador.gs`, `PanelBackend.gs`, `Instalar.gs` y `Panel.html`. **Nada de esto está en el proyecto de Apps Script todavía.**
2. **`generarProximasSemanas()`** desde el editor, o el botón nuevo del panel: **las cuatro semanas que faltan NO están cargadas**. El generador está probado con 46 afirmaciones sobre una hoja falseada; que la celda quede escrita en la hoja viva **sólo se ve corriendo**.
3. **Abrir el panel** y mirar las cuatro cosas nuevas: el nivel de ventana en «listo», la ventana en el cuadro de temario, el aviso de ventana en su forma nueva (`info` en gris cuando el recorte sí se aplica) y los dos botones de período.

### ⚠ Tres decisiones que quedaron esperando, y son tuyas

- **`continuacion.laminas_etapa4_hechas` se emite y nadie lo lee.** La tanda 2 re-resuelve todas las láminas. **No corrompe el deck** —`replaceAllText` no encuentra `{{token}}` donde ya hay valor— así que funciona por accidente y se paga dos veces. O se implementa el salteo, o se retira el campo y el comentario que promete lo que no hace.
- **¿`suites.js` corre los `--autoprueba`?** Costo medido: **+475 ms sobre 8.957 (+5,3 %)** contra el costo conocido de no correrlos — **dos de cinco estuvieron en rojo sin que nadie se enterara**.
- **Las dos filas rotas de `PERIODOS`** (`julio_24_30` duplicada, `'vie 14/08 -- jue 20/08 (por defecto)'` como clave) siguen **sin tocarse por decisión tuya**. El generador nuevo las **reporta** en cada corrida.

⚠ **Lo que esta noche NO tocó:** ningún número publicado, ninguna fila de `MARCADORES`, ninguna plantilla, ninguna hoja viva. Los tres frentes de la cola de abajo siguen exactamente donde estaban — incluido **`D-33` a medias** y los cinco tokens que publican el universo de la otra lámina.

---

**Última actualización:** 2026-08-26 (addendum 4) — **`D-33` quedó a medias, y ahora está medido y escrito.** Sólo documentación: no se tocó `MARCADORES`, ni `LAMINAS`, ni ningún `.gs`. El diagnóstico entero vive en `docs/PLAN.md`, al lado de `D-33` y **como su estado, no como una `D-NN` nueva** — no hay decisión todavía. **La decisión es del usuario y está pendiente.**

### ⭐ Lo último, en cinco líneas

- ⛔⛔ **El problema no es prospectivo: cinco tokens YA publican el universo equivocado.** `imp_total` (**28.988.260**), `mail_entregados` (**538.276**), `mail_aperturas` (**210.707 · 39.1 %**), `mail_or` e `ivr_atendidos` salen **idénticos** en `L-031` —semana entera de JM— y en `L-034`, cuyo universo declarado es el **agregado del temario** (`ENCUENTROS: 2`). Medido en el deck del 22/08, sha verificado. Los tres `cc_*` siguen **sin fila**, así que ésos todavía no publican nada.
- ⭐⭐ **El eje por lámina YA EXISTE y es correcto — no alcanza a estas láminas.** La etapa 3 resuelve con `solo_marcadores` y pinta con `slide.replaceAllText`; la etapa 4 resuelve por informe y pinta con `presentacion.replaceAllText`, **el deck entero**. Verificado con identidad interna: `ecv_inscriptos` **855 + 128 = 983**, `ecv_asistentes` **186 + 10 = 196**.
- ⚠ **Dos premisas del prompt frenaron y se reportaron:** el «censo del 26/08 con 27 tokens» **no existe en el repo**, y la única plantilla en disco (`JM_marcada.pptx`, 22 láminas / 191 tokens contra 24 / 343) **está declarada vieja por el propio repo**. Se rehizo la medición contra fuentes vivas.
- ⚠ **Tres correcciones al camino que parecía obvio:** el punto de inyección es `resolverMarcadores:1223-1250`, **no** `datosDeMarcador_`; `LAMINAS.filtro` se evalúa **por ítem** y `resumen_ejecutivo` es `modo = unica`, así que ahí nunca corre; y **el pintado es el trabajo real** — `agruparTokensPorLamina_` (`D-41`) hoy *evita* el problema, y esa guarda es la que habría que dar vuelta.
- ⛔ **`L-034` no se puede cerrar sin resolver esto**, aunque los resúmenes queden para después: comparte **ocho** tokens con `L-031`. Las dos alternativas están medidas y **sin recomendación**: renombrar los 8 en la plantilla (barato, cuarta vez que se aplica el mismo parche) o que `LAMINAS` declare dimensiones (motor).

---

**Última actualización:** 2026-08-26 (cierre) — **`L-038` cierra contra sí misma: 19 = 19.** `m2_camp_lista` era el único de sus 9 tokens sin fila y quedó cableado con una operación nueva, `LISTA_CRUDA`. Antes, esa misma noche, se cerró el testigo de `D-31` en `MAPEO`. **Nada de esto pide una corrida de `jm`; la cola de abajo sigue siendo la cola.**

### ⭐ Lo último, en cinco líneas

- **`LISTA_CRUDA`, la decimotercera operación**: los valores distintos **sin catálogo**. No es `LISTA` con la guarda floja — `LISTA` descarta lo que no matchea y acá cualquier nombre de campaña nuevo es legítimo. **Comparte núcleo con `CUENTA_DISTINTOS`, no con `LISTA`**: los normalizadores difieren y el banner y la lista habrían discrepado sin fallar.
- ⭐⭐ **La identidad, medida de punta a punta sobre la base viva** (ventana 14–20/08): 21 filas → **19 distintas → 19 líneas**. Interna, se exige en cada corrida y no caduca.
- ⛔ **`ctx.separador` salió de la rama del catálogo**: vivía adentro, así que una operación sin catálogo no lo recibía y habría publicado en **una sola línea sin bullets**, sin fallar. Es la grieta que el comentario de al lado ya avisaba para `ELEMENTO`, más ancha.
- ⚠ **La caja del bullet SÍ crece** (`p9_i767`, `SHAPE_AUTOFIT`, 8 pt, `h 24`) — la que el repo venía citando como `autofit: NONE` era **la del banner** (`p9_i768`). Con 19 nombres se estira ~8×. **Contra qué choca no se midió**: hace falta la corrida. **No hay tope, por decisión del usuario.**
- ⛔ **Un instrumento dio 675 donde el camino real da 19** — `medirCampaniasM2PorVentana()` mide `leerFuente` en aislamiento y el recorte de esta base vive en el llamador. La regla de `CLAUDE.md` §4 ya lo tenía escrito y predijo el número.

---

**Última actualización:** 2026-08-26 (noche) — **el testigo de `D-31` estaba declarado y no ejercido en el 15 % de `MAPEO`.** Dos causas medidas y cerradas, `clasp push` y *Aplicar configuración* corridos, y los dos números releídos de la hoja viva. **Nada de esto pide una corrida de `jm`**: la cola de abajo sigue siendo la cola.

⭐⭐ **Las tres frases que hay que llevarse de este día:**

1. **El arreglo que el repo creía tener nunca corrió.** `MAPEO.por_posicion` está escrito entero y está **inerte**: `leerMapeoSinCache_` no indexa la columna **y** la hoja no la tiene. Tres bancos daban verde afirmando que estaba declarada — y lo estaba. Lo que no corría era el mecanismo.
2. **Un control contra constantes caduca cada vez que la fuente respira; uno contra identidades internas no caduca nunca.** Es la regla nueva de `CLAUDE.md` §4, y la tercera vez en tres días que un control mide algo distinto de lo que dice medir.
3. ⛔⛔ **Y la cuarta, esa misma noche: lo que un archivo DECLARA no es lo que ese archivo TERMINA teniendo.** `probar-mapeo-cc.js` afirmaba en verde que `looker/CC` traía sus cuatro encabezados — cierto sobre la lista cruda, **falso sobre la hoja**, porque `Instalar.gs` los pisaba 300 líneas más abajo. **El banco podía fallar y estaba mirando otro momento del mismo objeto.**

---

## ⭐ Lo de esta noche, en cuatro líneas

| | antes | después |
|---|---|---|
| celdas `encabezado` vacías en `MAPEO` (releídas de la hoja) | **30 de 197** | **7** |
| `verificarEncabezadosDeMapeo()` · `filas_sin_testigo` | **25** | **2** |
| `verificarEncabezadosDeMapeo()` · `filas_comparadas` | 137 | **160** |
| `verificarEncabezadosDeMapeo()` · `desalineadas` | `[]` | `[]` |

⭐ **`desalineadas: []` en las dos** es el resultado que importa: los 22 testigos nuevos **coinciden con lo que las bases tienen hoy en esas letras**. No es sólo que las celdas se llenaron.

- **Causa A** — `ENCABEZADO_POR_MAPEO_` se aplicaba con `|| ''` y **borraba** el testigo de las 23 filas que lo declaran inline (`des_*`, `lcc_*`). Ahora **decora**: si la fila lo trae, gana el suyo. Y las 5 claves que estaban en los dos lados salieron del mapa — *un testigo, una fuente*.
- **Causa B** — `promoverFechasElegidas()` **tiraba** el `encabezado` que `DIAG_FECHAS` ya medía. Ahora lo escribe, normalizado con `R-10`. Las 7 claves huérfanas del mapa se borraron: no se aplicaban nunca.
- ⚠ **Las 7 celdas que siguen vacías NO se llenan con «Aplicar configuración»** — esas filas no están en ningún `SEED_MAPEO_`. Se llenan con **`promoverFechasElegidas()`**, y conviene mirar `DIAG_FECHAS` antes: escribe también `columna`, así que con un `DIAG_FECHAS` viejo movería una letra.
- ⛔ **`rdv|RVD JM-CM - ES|fecha` queda sin testigo a propósito**: no tiene escritor de ninguna clase. Ver `ESCRITORES.md` §2.1.
- ⛔ **Anotado y NO arreglado:** `probar-tabla-post.js --autoprueba` está **en rojo** —sus dos mutaciones no matchean nada— y `tools/suites.js` **no corre `--autoprueba`**, así que no lo ve. Cinco bancos tienen ese modo.

⚠ **Este archivo tuvo cuatro versiones el 25/08** y las secciones tachadas de abajo son las anteriores, conservadas a propósito — **cómo se llegó a una conclusión equivocada es la mitad de su valor**. Lo vigente es lo de arriba.

✅ **`clasp push` corrió y está verificado** (`clasp pull` a un temporal, los 24 `.gs` idénticos), y *Aplicar configuración* también: `MAPEO` y `SOLAPAS` quedaron con los testigos nuevos, **releídos de la hoja viva** (`C-83`).

---

## ⛔ Lo que te espera, en orden

⭐⭐ **Cada fila dice si ya corrió, MEDIDO contra la hoja viva.** Una lista que no dice el estado de cada paso hace repetir lo hecho y saltear lo que falta.

| # | qué | estado medido | por qué |
|---|---|---|---|
| 1 | **`clasp push`** | ✅ **hecho y verificado** | los 24 `.gs` idénticos al repo |
| 2 | **`instalar()`** | ✅ **hecho** — `LAMINAS` ya tiene `alcance` y `tokens_equipo` | ⚠ pero **NO creó `MAPEO.por_posicion`**: la hoja sigue en nueve columnas. Da igual hoy — el mecanismo está inerte de todos modos (ver `PENDIENTES`) |
| 3 | **«Aplicar configuración»** | ✅ **corrido DOS veces el 26/08** — 5 celdas a la tarde, **23 a la noche** | la tarde propagó los encabezados nuevos a `MAPEO` y las notas a `SOLAPAS`; la noche, los 23 testigos que el `forEach` venía borrando. ⛔ **Antes de la primera hubo que corregir `SEED_SOLAPAS_`, que declaraba `fila_encabezado: 2` y habría pisado el `1` del usuario** |
| 4 | ⛔ **Verificar `CONFIG.solapas_agregado_post` y `campos_metrica_post`** | ⏸ **volver a medir** | faltaban el 25/08 (27 claves). *Aplicar configuración* corrió después, así que **es probable que ya estén** — pero eso se lee de la hoja, no se supone |
| 5 | **`declararAlcanceDeLaminas()`** | ⛔ **FALTA** — 0 de 53 filas con `alcance` | puebla `LAMINAS.alcance` y `LAMINAS.tokens_equipo` |
| 6 | ⭐ **`declararModoDelAgregadoPost()`** y **`declararIteraDelAgregado()`** | ✅ **hechos** | las dos celdas ya dicen lo que tienen que decir. Si se corren, informan «ya estaba» |
| 7 | ⭐⭐ **`verificarBloquesPostReuniones()`** | ⏸ sin correr | ⚠ **revisarlo antes**: su sentido cambió. Con títulos únicos el **encabezado** volvió a ser el testigo de `D-31`; la identidad de bloques **no se retira** —prueba que el acumulado es el acumulado, que es otra afirmación— pero ya no es el único testigo |
| 8 | ⛔⛔ **`cablearTablaPostReuniones()`** | ⛔ **FALTA** — hay **20** filas `post_*` y el wrapper declara **28** | faltan `post_camp*` y `post_periodo*`. ⚠ **Y ahora además reescribe las notas** de `post_vistas*` y `post_vtr*`, que decían «TÍTULO REPETIDO / POR POSICIÓN» y era falso |
| 9 | ⭐ **`testigoDeEtapaPost()`, ANTES de generar** | ⏸ sin correr | ampliar `etapa.post` mueve números publicados; su canario separa *«lo movió el cambio»* de *«se movió la fuente»* |
| 10 | **Generar `jm`** | — | ⚠ **este deck mueve `Visualizaciones` y `% VTR` de `L-036`**: no es llenar un hueco, es mover dos números publicados. *Un cambio por deck* aplica |
| 11 | ⭐⭐ **`verificarIdentidadPublicadaL036()`** — **el paso nuevo, y el que cierra el día** | ⏸ **escrito, control positivo verde, sin poder correr** | exige `%VTR = Vis / Imp` **sobre lo publicado**. No pudo correr porque **no hay ningún deck de `jm` en la carpeta de salida**. Es lo primero después de la corrida |
| 12 | **`testigoDeEtapaPost()` otra vez**, canario primero | — | criterio de aceptación tuyo (`V-110`) |

### ⭐ Qué tiene que verse en `L-036`, y es lo que prueba el arreglo

**Parque Avellaneda (`3487-AGOJDGAG`) pasa de `55.902 · 63,5` a `282.524 · 62,7`.**

⚠ **Los dos pares son correctos en su momento y confundirlos es lo que `R-31` mide:** `282.480` fue la lectura de la madrugada del 26/08 y `282.524` la de la mañana — la fuente se movió sola (`IMPORTRANGE` refrescó) **+52 impresiones, +2 clics, +44 visualizaciones, todo dentro de Programmatic**, con Meta y Google idénticos al dígito.

⛔ **Y Parque Avellaneda es de `agosto_14_20`, que tiene DOS encuentros — las cuatro ranuras son de `julio_24_30`.** Las 8 celdas de la tabla sólo se pueden llenar con la corrida: qué filas entran lo decide el anclaje, no la ventana (`reuniones` es `snapshot`).

### ⭐⭐ Qué mirar en el deck de `L-036`, y en qué orden

1. **La identidad interna de cada fila:** `%VTR = Visualizaciones / Impresiones`. **No depende del
   deck del equipo ni de una foto de la base**, así que se exige en cada corrida.
2. ⭐ **Que el `Período` y los números de la MISMA fila sean del mismo encuentro.** Es lo que `D-42`
   garantiza y lo que hay que confirmar con los ojos: la fila de Retiro tiene que decir
   `30/07 — 09/08`, y la de Orden Público `03/08 — 13/08`.
3. ⚠ **Los cuatro períodos caen en AGOSTO**, no en julio: la pauta POST corre **después** del
   encuentro. **Es correcto y se ve raro** — no es un error de ventana.
4. ⚠ **Si alguna fila publica un `Período` y números en blanco (o al revés), eso es el hallazgo.**
   Significa que un encuentro está en una fuente y no en la otra — la ranura lo deja **en su lugar**
   y el hueco se ve, que es exactamente para lo que se hizo.

⛔⛔ **La lección del paso 9, y va acá porque es de método:** una lista que termina en *«correr `jm`»*
**tiene que incluir el wrapper de cableado de cada lámina que se haya tocado**. Sembrar `MAPEO` y
`SECCIONES` deja la lámina lista **salvo los marcadores**, y el deck sale en `/////` sin que nada
avise. **No es un bug** —el alta de marcadores es una decisión y por eso tiene botón propio— **pero
sí una trampa para quien sigue la lista.**

---

## ✅ Los decks publicados con el POST incompleto: DESESTIMADOS

`etapa.post` filtraba `~=Agenda Post` y el equipo escribe «Post» **en cualquier posición** — dos
formas **disjuntas**, 166 filas contra 137, **intersección cero**. El alcance eran **seis meses**:
22 cuentas del «1 a 1» y 71 filas.

⭐ **Decisión tuya (25/08): no hay que rehacer nada.** Corregido para adelante; la medición queda en
`PENDIENTES` **como evidencia, no como pendiente** — si alguien compara un deck viejo contra uno
nuevo y ve los `u1_post_*` más altos, ahí está la explicación.

⭐⭐ **Y ése fue el hallazgo grande del día, que no era de `L-036`:** los **24 `u1_*` estaban ciegos
a 71 filas en seis meses**.

---

## ⭐ `L-036` — **28 de 32 cableados**, y los 4 que faltan son una decisión

La tabla es de **ocho columnas × 4 filas** y se cablean **siete**: `Campañas`, `Período`,
`Habitantes`, `Alcance`, `Impresiones`, `Visualizaciones` y `VTR%`.

⭐⭐ **`Campañas` se COMPONE**, porque **ninguna de las 29 columnas de la solapa trae un nombre** —
barrido completo contra el fixture del 20/08. Sale de `Funcionario` + `Tipo` + `Barrio` + `Fecha`
(B/C/D/E) con la operación **`FILA_TEXTO`**, y su forma la elegiste contra el deck del equipo:

```
Jorge Macri — Uno a uno en Retiro (24/07)
```

⚠ **`figura` entra por decisión, no porque aporte:** vale «Jorge Macri» en **todas** las filas de
`jm`, así que no distingue una de otra.

### ⭐⭐ `Período` sale de OTRA base, y por eso la lámina cruza dos fuentes (`D-42`)

**Esas mismas 29 columnas tampoco traen fecha de inicio ni de fin** — sólo `Fecha` (E), que es la
**del encuentro**. El rango sale de `digital/CAMPAÑAS_DESGLOCE_DIGITAL` con la operación nueva
**`GRUPO_TEXTO`**, que agrupa por `id_cuenta` y compone `min(Fecha inicio)` — `max(Fecha fin)`.

⛔⛔ **El riesgo que eso trae, y cómo se cerró:** dos listas construidas por separado se indexan con
el mismo `n`. Si descartan encuentros distintos, **la ranura 2 muestra el período de un encuentro y
los números de otro, sin fallar**. Y ya se sabe que pueden diferir: San Cristóbal tiene **0 filas
POST** en el desglose y cae por métrica del otro lado — **coincidían por dos caminos que nadie
coordinó**.

⭐ **La solución es `D-42`: la lista de encuentros es UNA, y la RANURA viaja sellada en cada fila**,
calculada antes de que ninguna solapa se recorte y **con el mismo comparador** que usan las seis
columnas numéricas. Un encuentro ausente en una fuente deja **un hueco en su ranura** y no mueve
ninguna otra.

⛔ **Los 4 que faltan NO son un hueco, son una decisión** (`CONFIG_INFORMES.md` §2.3 bis):
`post_formato*` **fuera de alcance** — el formato cambia por plataforma y una fila por encuentro no
puede tener uno solo.

### ⏸ Lo único vivo: el `id_cuenta` del anclaje

⭐ **La fuente es `reuniones/Agenda JM | Post`, y siempre lo fue.** Las cinco columnas, con datos,
**una fila por reunión**, y `campo_id_cuenta` declarado:

| columna | dónde | Retiro (fila 95) |
|---|---|---:|
| Habitantes | col 5 | **41.475** |
| Alcance | col 6 | **47.753** |
| Impresiones totales | col 9 | **136.971** |
| Visualizaciones | ⚠ **col 12** — el TOTAL | **41.204** |
| % VTR | ⚠ **col 13** — el TOTAL | **0,30082** |

⛔⛔ **Hubo un rodeo de un día que terminó donde empezó**, y está entero en
`docs/FUENTE_post_reuniones_2026-08-25.md`: el `ADDENDUM 1` mandó la fuente al desglose y el
`ADDENDUM 2` lo retracta. **No salió de una medición nueva sino de una conclusión equivocada sobre
una medición correcta** — confundí *de dónde SALEN* los números con *dónde están CARGADOS*.

⇒ **Los dos bloqueos que reporté se caen: los dos eran del desglose.** `X-41` no aplica.

**Lo que quedó hecho y sirve:** `itemsPorLamina` en **4**, `declararModoDelAgregadoPost()`
**desfrenado**, y `des_nomenclatura` en `MAPEO` (útil para `L-053`, que sí lee el desglose).

### ✅ `D-31` — resuelto: se leen POR POSICIÓN, y la tabla pasa de 12 a 20

**Decisión tuya (25/08), y quedó como `ADDENDUM 2` de `D-31` en `PLAN.md`**, con la regla escrita en
vez de una excepción suelta:

> **Cuando el título de una columna se repite en la solapa, la letra manda y el encabezado deja de
> ser testigo.** La lectura por posición **se declara en el `MAPEO`**, no en el código.

**Tres piezas:** `MAPEO.por_posicion` (configuración), `leerFuente` **agrega** una clave por índice
sin tocar las de título, y `claveDeLecturaEnColumna_` como único punto de decisión — los 16 puntos
de `Generador.gs` lo heredan.

⭐⭐ **El testigo de integridad cambió, porque el encabezado ya no puede serlo:** ahora es
`M = R + W + AB`, que verifica **posición y semántica a la vez** y **confirma el orden de los
bloques**. Lo corre **`verificarBloquesPostReuniones()`**. Medido: **66 de 66** evaluables cierran.

⭐ **Y `L-036` recupera su identidad interna:** `%VTR = Visualizaciones / Impresiones`, **exacta en
98 de 98** — al nivel de `V-111` y `V-113`.

### ⭐ El sufijo `GC` del anclaje: medido, y NO es el `X-28`

`3387-JULJDGGC` (Orden Público) **se resuelve igual**, por tres mediciones que se suman:
`normalizarIdCuenta_` es **sólo `trim()`**; los candidatos son **todos** los ids de la solapa maestra
(sin `filter`); y el **parser real** lo reconoce —`tipo = Temático`, `eje = Eje Norte`,
`fecha = 28/07`—.

⭐⭐ **Lo reconoce SIN barrio**, y ésa es la parte que valía medir: su nombre no trae ninguno —es un
Temático— pero `reconocido` acepta barrio **o comuna o EJE**. **La rama del eje es la que lo salva**,
y nadie la había ejercitado.

⚠ **No es el `X-28`:** allá el problema no era el anclaje sino un filtro **por nombre** (`~=JM`) para
decidir qué cuentas entran al Call Center. **Dos mecanismos que se parecen.**

⛔ **Lo que no cierra:** que el **score** supere el umbral. Eso lo dice la corrida.

### ⭐ Dos hallazgos laterales

- **San Cristóbal SÍ tiene campaña POST** (fila 778 de `Seguimiento digital`); lo que no tiene son
  **filas en el desglose**. ⚠ Corrige lo que decía este handoff a la tarde: no es *«sin fila POST»*.
  La cuarta ranura sale `sin_datos` por eso, y **es correcto**.
- ⚠ **`unirDigitalPorCuenta` PISA**: un id con dos filas —pre y post, el caso normal— conserva **la
  última**. Para `L-036` da el post, que es lo que se quiere; para otros consumidores puede no serlo.

---

## ✅ Lo que se hizo anoche

### El conteo de faltantes dice TRES números, y el que decide el cierre es el primero

**`D-38` cierra cuando vos, mirando un deck completo, declarás que lo que falta no es relevante.**
Hasta anoche ese número sumaba tres cosas distintas: los **57 tokens** de `L-039`, `L-048` y `L-050`
que salieron del alcance por `D-39`, el **texto que escribe una persona**, y el trabajo real.

Ahora la lámina **declara** su alcance:

- **`LAMINAS.alcance`** — `en_alcance` / `fuera_de_alcance`. ⛔ **No es `escondida`**: `escondida` se
  refleja de `isSkipped()` y una lámina puede volver; `alcance` dice *«esto no se cablea»* y
  sobrevive a que alguien la muestre. Son el hecho y la intención.
- **`LAMINAS.tokens_equipo`** — por **token**, porque `L-046` está **en** alcance y sus siete
  `camp_bench_*`/insight no. Vive en `LAMINAS` y no en `MARCADORES` porque **estos tokens no tienen
  fila**.

⭐ **El criterio es TODAS sus láminas, nunca alguna.** `camp_titulo` vive en 14: si **una** está en
alcance, hay que cablearlo. Lo contrario haría desaparecer un token vivo del número del cierre.

⚠ **`sin_declarar` es su propio número.** Todo `secco` queda así — nadie escribió su alcance — y
sumarlo metería en el número del cierre láminas que nadie miró.

### `FALTANTES` guarda de qué lámina viene cada token

Es como mirás un deck, y es como está organizado `CIERRE_POR_LAMINA.md`: cruzarlos era a mano. El
panel tiene ahora **dos cortes** —por causa y por lámina— y conviven a propósito: por causa se
contesta *«qué oficio cierra esto»*, por lámina *«puedo publicar ésta»*.

⚠ **La celda puede traer varias láminas.** Un token fijo se pinta con `replaceAllText` en todas sus
cajas, así que falta en todas. Por eso el conteo por lámina puede sumar **más** que el total, y va
nombrado en vez de corregido.

### La medición del anclaje deja de mentir sobre los fallos

⛔ El lector hacía `Number(x) || 0` y **convertía el vacío en cero**, justo lo que
`registrarFalloAnclaje_` guardaba con cuidado anoche: *«un 0 se lee como "se intentó anclar cero y
salió bien", que es una afirmación y es falsa»*. **Una fila de FALLO se veía como una corrida
perfecta de cero encuentros.** ⭐ Y `num()` en el panel **ya sabía pintar el `—`** — el front leía el
vacío y el backend nunca se lo dejaba llegar.

**Y la vista muestra ahora la hora de la última corrida** al lado de la de la fila, con los minutos
de desfase. Reporta, no interpreta.

---

## ~~⏸ `L-036` — la fuente NO está mal elegida~~ — ⛔ **FALSO, corregido el 25/08**

> **Lo de abajo quedó como estaba a propósito**, con el mismo criterio que el documento congelado:
> **cómo se llegó a la conclusión equivocada es la mitad de su valor.** La conclusión correcta está
> arriba. ⭐ Y el error de método vale más que el hallazgo: **la fuente se eligió por el NOMBRE de la
> solapa y nunca se verificó contra el dato** — la solapa correcta no tiene «post» en el título, lo
> tiene en una **columna**, así que buscar por nombre **no dio un falso positivo: dio un cero**.

**Tu pregunta previa se contestó, y no cambió el rumbo** — que es un resultado, no un trámite: la
alternativa era gastar el prompt siguiente en el eslabón equivocado. Informe congelado en
`docs/FUENTE_post_reuniones_2026-08-25.md`; instrumento re-corrible en `tools/medir-solapas-post.py`.

**Se barrieron las 24 solapas, no las tres**, y los dos ids de `julio_24_30` aparecen en **seis**.

| solapa | veredicto |
|---|---|
| ⭐ **`Agenda JM \| Post`** | **la única con las cinco columnas y con datos** — Retiro: Habitantes **41.475**, Alcance **47.753**, Impresiones totales **136.971** |
| ⛔ `Métricas EDVs` | superconjunto por **esquema**, no por **dato**: `Alcance manual`, `Impr. totales` y `Cobertura` **en cero**, y **`Visualizaciones` no existe en ningún nombre** |
| ⛔ `Digital \| Base Post` | **no contiene ninguno de los dos ids** |
| `Agenda JM` · `Base_Digital` · `EDVs \| Estados` · `Total` | otra etapa u otro grano |

⛔⛔ **Lo que NO se pudo cerrar: el cruce contra el deck del equipo.** Por dos motivos que se suman —
**(1)** el deck del 24-31/07 **no tiene la lámina** que `L-036` reproduce; **(2)** los cuatro libros
del fixture del 31/07 son `looker`, `m2`, `rdv` y `digital`: **`reuniones` no está**. Base del 20/08
contra deck del 31/07, veinte días sobre una métrica que acumula. **Es `X-17` otra vez.**

### ⭐⭐ El hallazgo lateral, y merece tu decisión: los cuatro bloques son las PLATAFORMAS

`Agenda JM | Post` repite `Visualizaciones` y `% VTR` cuatro veces, y **el deck del equipo dice qué
son**: publica el POST desglosado Meta/Google/Programmatic con la misma forma. La identidad interna
lo confirma al dígito, **sin depender del deck ni de una foto**:

```
col12 / col9  =  41.204 / 136.971  =  0,300822801906973  =  col13 exacto
```

⇒ **`col12`/`col13` es el TOTAL.** Eso respalda `ae06a3b` con números —el motor habría publicado
`21.229` y `69,0 %` donde el total es `41.204` y `30,1 %`— y agrega algo: **el dato SÍ existe**. Lo
que falta no es la fuente, es **una forma de llegar a una columna cuyo título se repite**.

⛔ **No se propuso ninguna**, a propósito: `D-31` ya midió que de 12 solapas fuente **una sola** tiene
títulos repetidos, y decidió no hacer una excepción de lectura por letra para un caso —*«una regla
que vale en un solo lugar es una trampa con fecha»*—. **Reabrirlo es tuyo.**

⚠ **Y siguen faltando tres de las ocho columnas** —`post_camp`, `post_periodo`, `post_formato`—, sin
fuente en ninguna solapa. Pregunta al equipo, **sin prioridad**.

> ⛔ **VENCIDO el 25/08 (tarde), y se conserva porque el error es instructivo.** Dos de las tres se
> cablearon el mismo día: `post_camp` **componiendo** cuatro columnas (`FILA_TEXTO`) y `post_periodo`
> **agregando filas de otra base** (`GRUPO_TEXTO`). ⭐ **El párrafo decía *«sin fuente en ninguna
> solapa»* y era cierto leído literalmente — no hay UNA columna que traiga el dato.** Lo que estaba
> mal era la conclusión: *«no hay columna»* no implica *«no hay fuente»*. Sólo `post_formato` sigue
> abierta, y **por otro motivo**: es fuera de alcance, no falta de dato.

---

## ⛔ Lo que sigue esperando tu decisión, de antes

### Programmatic — el número no está roto: es el ACUMULADO

`looker/DIGITAL` actualiza la fila y no agrega filas, así que `Impresiones` trae todo desde que la
campaña arrancó. Autódromo empezó ocho días antes de la ventana y el equipo le atribuye **379.512**
donde su fila dice **3.756.321** — factor 9,9. Google cierra a **1,05×**.

⛔ **El dato semanal no existe en ninguna solapa.** Ninguna operación arregla esto.

| | qué | qué cuesta |
|---|---|---|
| **(a)** | **Cambiar el rótulo** a *"acumulado de las campañas de la semana"* | ⭐ **cero código**, y no depende de nadie |
| **(b)** | Pedirle al equipo el dato semanal | la única que hace el número de la semana |
| **(c)** | Publicar `/////` | honesto, y **pierde** un número que hoy sirve para otra cosa |

**Mientras no decidas queda `_revisar`**, que **no es una de las tres: es el estado de espera.**

### `X-28` — la regla YA está decidida, y el bloqueo cambió de motivo

La **definición** está cerrada `exacto` (`V-105`). Lo que faltaba era **qué cuentas entran**, y **el 25/08 el usuario lo decidió**: `JDGAG` + pertenencia + `duración ≤ 30 d`, publicado en `_revisar`. ⭐ **El desempate se eligió por MODO DE FALLA y no por acierto** —los tres aciertan igual—: `estado = Finalizada` **falla por un día**, y `duración` **se aleja del corte cuanto más deriva** la `fecha_fin`.

⛔⛔ **Y ahí apareció el bloqueo nuevo, que es de motor y no de negocio: `duración ≤ 30 d` NO ES EXPRESABLE en `MARCADORES`.** `parsearCondicionFiltro_` entiende `=`, `!=`, `~=` y `!~=` sobre **el valor de una celda**, unidos por `&&`. No hay comparación numérica, y `duración` es una **resta entre `fecha_inicio` y `fecha_fin`**. ⚠ El único tope por duración que existe —`CONFIG.tope_dias_ventana_cuenta`, `R-30`— **es global**: está en `90` y bajarlo a `30` movería **los ocho `imp_*`** y todo lo que lee por cuenta.

⭐ **Lo medido, con los dos controles positivos reproduciendo** (`tools/medir-desempates-cc.py`, fixtures del 31/07 y del 20/08):

| período | regla | cuenta | publica | deck |
|---|---|---|---|---|
| `julio_24_30` | `JDGAG` solo | `3289-JUNJDGAG` | **2 · 6.011 · 1.878 · 31** | igual ✅ |
| `agosto_14_20` | `JDGAG` solo | `3289` **y** `3488` | 5 · 13.107 · 3.588 · 27 | 3 · 6.851 · 1.616 · 24 ❌ |
| `agosto_14_20` | los **tres** desempates | `3488-AGOJDGAG` | 3 · 7.096 · 1.710 · 24 | 3 · 6.851 · 1.616 · 24 ⚠ |

⚠ **En agosto la cuenta es la correcta y los valores no.** El barrido exhaustivo dice que **ninguna terna de filas que sume `6.851 / 1.616` incluye una fila de `3488`**, así que el deck de agosto no sale de esa cuenta tal como está en el export del 20/08. **`X-28` sigue abierto: sigue haciendo falta un tercer deck publicado.**

⛔ **Tu decisión, en una línea:** ¿el `≤ 30 d` va como tope **por solapa** (`SOLAPAS.tope_dias`, que no existe), como **dimensión `cc`** con condición calculada, o bajando `CONFIG.tope_dias_ventana_cuenta` a 30 **y asumiendo que se mueve todo lo demás**?

---

## ⛔ Dos cosas que hay que saber antes de leer un número

**1 · `looker/DIGITAL` es inestable por CAMBIO** (`R-31`, `19/503`, **cero altas**). **`V-110` no se
puede volver a usar con criterio de igualdad sobre los `imp_*`.** ⭐ Y `CLAUDE.md` §4 se corrigió por
esto: *«la cuenta de filas distingue se rompió de la base se movió»* **sólo vale con altas**.

**2 · El período elegido y el calculado dan la misma ventana y distinto temario.**
`anclarEncuentros` recorta por período **sólo si la ventana vino por `periodo_ref`**: sin período
entran **12 encuentros en vez de 2**. El deck `jm-20260821-230048` es eso, y salió sin que nada
fallara. ⚠ **El camino desatendido del editor no pasa por el panel**, así que no ve el aviso.

---

## ⛔ Escrito y SIN CORRER

- **La reanudación del particionado** — `continuacion.laminas_etapa4_hechas` y `CORRIDAS.ejecucion`
  no se ejercitaron nunca: la corrida entró entera. ⚠ **El día que haga falta va a ser el de una
  corrida larga**, que es el peor momento para descubrir que no anda.
- **Todo lo de anoche.** Los bancos afirman qué **va** a escribir `declararAlcanceDeLaminas()` y qué
  hace la vista con un fixture; **que el conteo baje lo dice una corrida.**

---

## Las suites — se corren con `node tools/suites.js`

**49 bancos, 0 en rojo, ~489 afirmaciones.**

⛔⛔ **Y el runner es nuevo desde el 25/08, por un caso que hay que conocer:** el detector viejo era
un `for` que filtraba la salida por el glifo `❌`, y **hay bancos que reportan con `⛔`** — así que
**contaba uno donde había cuatro**. ⚠ Los cuatro estaban verdes en HEAD, así que los reportes
anteriores eran correctos *para su momento*; **pero eso es suerte, no método.**

⭐ **El exit code es un contrato; un glifo en un log es una convención.** La regla entera está en
`CLAUDE.md` §4, y el runner **decide por `status`** sin mirar la salida.

⭐ **Corrió su propio control negativo:** un banco temporal que falla **sin imprimir ningún glifo**,
y lo detectó. **Un runner que nunca vio un rojo no está probado.**

---

## ⛔ Evidencia que no se puede perder

- **Los tres decks del 21/08**: `1_krz_dTgwVqFm8BbAIhxKl6VAvD3zMy1MYx9BUGlMnI` (194602, cerró) ·
  `10omnlzVY6nrwg6CX-EqyBIypTgQ6sY7XRB15JNkugC4` (224727, **sigue sellado** — la prueba del corte) ·
  `1lg-FcqM5VlDAo4HaFI_0AuKEQ6H1hx4s_nmVWdqhPO0` (230048, el temario de 12 encuentros).
- **Los fixtures**, con su huella en `docs/_fixtures/README.md`. Los dos usados anoche verificados
  contra la tabla **antes** de citar un número.
- ⚠ **Dos `.pptx` de decks reales quedaron en el historial de git** (`7e48725`). Riesgo asumido.

---

## Cómo leer esto desde afuera

- **Qué se hizo y qué se midió** → `docs/BITACORA.md`.
- **De qué solapa sale el POST de `L-036`** → `docs/FUENTE_post_reuniones_2026-08-25.md`.
- **Qué lámina está cerrada y qué le falta** → `docs/CIERRE_POR_LAMINA.md`.
- **Qué sigue abierto** → `docs/PENDIENTES_consistencia.md`.
- **Qué publica bien el motor y qué no** → `docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md`.
