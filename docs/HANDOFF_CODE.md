# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-05, corrida nocturna (punto 1 cerrado: la sección `ecv_`;
puntos 2 y 3 escritos) · último commit al escribirlo: el de esta entrada

## Dónde estamos

**La sección 1 está cerrada: el agregado semanal de encuentros sale una sola vez y con
número.** Era la primera sección del método nuevo —una por vez, empezando por las que no
iteran— y cerró.

**El deck de la noche:** `1cXrAhX3-GXs0dYeqwLxYqD1Nrr3ZJ2s1NJYRwz-llWo`, corrida
`jm-20260805-005053`. **26 slides** (eran 30), **18 tokens con valor y 304 faltantes**
(eran 17 y 438).

**El bug que se arregló no era el que decía el prompt.** El addendum pedía declarar una
sección hermana en modo `agregado`; eso solo no alcanzaba. La causa era
`encuentro.familia_tokens = 'ecv_,enc_'`: la familia es **con qué se reconoce el bloque
modelo en la plantilla**, y con `ecv_` adentro el motor reclamaba **también** la lámina del
alcance semanal y la duplicaba una vez por encuentro. Ahora `encuentro` es `enc_`, y
`slides_modelo` pasó de `[5, 6]` a **`[6]`**.

**Y el informe sigue estando mal en la sección 3.** No por el motor: por la cuenta que
eligió el anclaje.

**El hallazgo que manda sobre todo lo demás:** los **once** números con valor real del deck
vigente salen de la cuenta **`3347-JULJDGAG`**, y el encuentro es **`3387-JULJDGGC`**. Las
dos se llaman igual en la base (`TE CUENTO BS AS JM | 21/7 ORDEN PÚBLICO`) y comparten
hasta la columna `Audiencia` — por eso `enc_audiencia = 37.763` parecía correcto: **coincide
por casualidad**. `3347` es del 16–17/07 con entregas chicas; `3387` es del 22–26/07 y es la
que usó el informe publicado. `enc_mails_enviados` dice **110** donde el número es
**44.043**; `enc_atendidos` dice **6.161** donde es **71.234**.

**Nada más falló.** El motor escribió bien: 0 tokens crudos sin reemplazar, 0 referencias
del mapa que no existan en el deck, y los diez rótulos vecinos corresponden uno a uno
—la rotación de la slide 5 y el cruce de la 6 no se reprodujeron—. **La caja, el rótulo y
el formato están bien; está mal la cuenta.**

**El deck vigente:** `1AU0tkyRQo0kGccnUGJqz0MoEqtiDpy5awYGy8VjTtH8`, corrida
`jm-20260804-180308`, 30 slides (la plantilla tiene 22; las 8 de más son la expansión).
Los siete decks de la noche están **todos vivos**, ninguno en la papelera.

## Trabado

1. **El desempate del matcher.** `digital` es `modo_periodo = snapshot`, así que **nada
   filtra por fecha**: el join es puro `id_cuenta` y el matcher eligió entre dos cuentas
   homónimas sin desempate temporal. Es el "empate técnico del match" que ya estaba anotado
   como pendiente de `Union.gs`; ahora tiene una víctima concreta. **Arreglarlo es de
   `Union.gs`, no del cableado.**
2. **Cuando se arregle la cuenta, mail sigue mal.** `3387` tiene **5 filas de mail** (22/07
   ×2, 25/07, 27/07 y **03/08**). Con `ULTIMO` y sin filtro de fecha tomaría la del **03/08,
   fuera de la ventana**; el informe publicado usa la del 25/07.
3. **El anclaje no deja rastro.** `ANCLAJE_PENDIENTE` está vacía (sólo encabezado) y
   **`VALORES` no tiene ni una fila**, aunque `Valores.gs` y `registrarValorCalculado_`
   existen. Sin eso, "qué cuenta usó cada ítem" **no es auditable**, y el próximo error de
   cuenta se descubre como éste: a mano, contra un informe publicado.
4. **Las cinco slides de encuentro son indistinguibles.** `ecv_barrio` sale `«FALTA»` en las
   cinco, así que el deck no dice qué encuentro es cada lámina. Y los valores cayeron en la
   **slide 11**, que por orden de `REUNIONES` sería *Retiro (pre)*, mientras el handoff
   anterior decía *Orden Público*. **No se puede saber cuál desde el deck.**
5. **`REUNIONES` no es el temario.** Tiene 7 filas y le faltan **dos ítems del bloque
   Cercanía y M2**: `Primera Persona con Pareto 27/07` —que en `rdv` existe y es **el
   encuentro más grande de la semana: 1344 inscriptos · 267 asistentes**— y
   `M2 | Registro Civil`. Se sembró desde los comentarios del deck viejo, no desde el
   temario. El temario completo está en `docs/CONFIG_INFORMES.md` §1.7.
6. **El temario no respeta la ventana, y eso es correcto.** El ítem 1 es del **23/07** y la
   ventana es 24–30/07: por eso San Cristóbal ancla y no aporta filas. La ventana sirve
   para los agregados, **no** para seleccionar los encuentros del temario.
7. **`CAMPANAS` sigue sin ninguna fila de `jm`.** La sección `campana` queda sin ítems y sus
   8 slides modelo (20–27) sin número. Curar esas filas es tarea tuya.
8. **`comunicaciones_post` es una sección activa con 5 ítems y ninguna slide con tokens
   `post_`** en la plantilla de JM.

## Esperando decisión tuya

- **Los cuatro `ecv_barrio*` no se cablearon, y no es por falta de dato.** `ecv_barrios`,
  `ecv_barrio1`, `ecv_barrio2` y `ecv_barrio3`: **la columna existe** (`barrio` → B en
  `MAPEO`), **la operación no**. Las seis del motor son `SUMA · CONTEO · ULTIMO · RATIO ·
  PCT · TEXTO`, y esto pide "cantidad de barrios distintos" y "el N-ésimo del ranking".
  **`CONFIG_INFORMES.md` §1.4 ya los declara `[MANUAL]`**, con una `[?]` de si salen por
  ranking automático. O se confirman manuales, o hace falta una operación nueva.
- **Falta el formato "unidades de porcentaje sin signo".** La matriz tiene `porcentaje`
  (unidades pct **con** signo) y `fraccion` (0–1 → pct, **sin** signo); falta la cuarta
  celda. Los cinco `ecv_insc_*_pct` salieron con **`numero`** —decisión propia— porque la
  caja de la lámina ya trae su `%` y `porcentaje` habría impreso `59.5%%`. Sale `(59.54%)`,
  verificado. **Reversible: una celda por fila.**
- **`ULTIMO` → `SUMA` en IVR: decidido que sí, pero todavía no.** `VALIDACION` §3.2 lo
  respalda (*"IVR cierra por SUMA sobre `id_cuenta`"*) y con la cuenta correcta los cuatro
  números cierran dígito a dígito (78.637 · 71.234 · 27.599 · 256). **Va junto con el
  arreglo de la cuenta**, para medir el antes y el después de los dos cambios por separado.
- **El orden de expansión de las cinco slides de encuentro**: si es el de `REUNIONES` o no.
- **Los números van sin separador de miles** — el deck dice `6161`, el informe publicado
  `6.161`.
- **El dueño del deck generado es `jpcofanogcba1@gmail.com`**, no `reporteseinformesgcba`.
  Pieza abierta de `D-03`.
- **`enc_alcance` se cableó a `digital/Digital/dig_alcance`** y no a `Alcance/alc_alcance`.
  Reversible: una celda.
- **`rdv` compartida como `anyoneWithLink = writer`** (abierto del 03/08).
- **`CAMPANAS.tipo` no tiene ningún lector en el repo.**

## En pausa, y no se vuelve sobre esto

> Siguen en `docs/PENDIENTES_consistencia.md` → "Preguntas al equipo", del 03/08: las **tres
> preguntas sobre la lámina M2**. **No se re-preguntan y no cuentan como bloqueo.**

El **`P1` del reintento de `tools/api.js` baja a observación y no se saca.** Los siete
`corrida_id`, siete `deck_id` y conteos crecientes 1→6→17 son desarrollo, no doble
escritura. El riesgo sobre una llamada que escribe sigue existiendo; acá no se manifestó.

## Esperando permiso

**Ninguno.**

## Qué sigue

**Cambió el método, por decisión tuya del 04/08: desde acá se cierra una sección por vez,
con sus números verificados, empezando por las que no iteran.** Lo justifica el dato del
`Pedido-2`: **384 de 438 faltantes son "sin fila en `MARCADORES`" — 88%.** No es motor, es
cableado sin escribir.

1. **`Pedido-3` — el filtro declarativo JM/GCBA. Parte 0 corrida el 06/08; Partes A a G sin
   ejecutar.** Ninguna se trabó: quedan listas y con su medición hecha. Tres cosas medidas
   que cambian cómo se ejecutan:
   - **`SECCIONES.filtro` está declarada y MUERTA** — la usa sólo `comunicaciones_post`
     (`etapa=post`) y **ningún código la lee**. La Parte D es **implementarla**.
   - **La tabla de envíos está en la lámina 18, no en la 22**, y le faltan **cinco** tokens,
     no cuatro: los cuatro remitentes de los envíos 2–5 **y `camp_env4_fecha`**.
   - **`0.6` contradice el supuesto: el máximo en ventana es 6 envíos** sobre cinco filas
     fijas, así que hoy **un envío se pierde en silencio**. La Parte G **no se construyó**,
     como manda el prompt.
2. **La familia `m2_`** — 31 tokens, sección `agregado`, no itera, fuente sin ambigüedad.
   Era el punto 5 ("si sobra tiempo") y **no se llegó**.
3. **Los cuatro `ecv_barrio*`**, que quedaron sin cablear: necesitan una decisión, no
   trabajo (ver abajo).
4. **`Pedido-1` Partes A, C y E** — el corte JM/GCBA. La Parte B necesita reescritura y la
   tercera viñeta de A está cancelada: ver el **addendum al pie del propio prompt**,
   escrito el 05/08.
5. **Arreglo del desempate del matcher** (`Union.gs`), junto con `ULTIMO` → `SUMA`.
6. **Tramo 3 — `secco`**, la medición de `D-01`.

## Lo que midieron los Pedidos 1, 2 y 4, y hay que tener a mano

- **`ecv_`: 19 tokens en la plantilla y ninguno cableado.** `MARCADORES` no tiene ni una
  fila de la familia. La partición es **10 / 2 / 7** (verificada el 05/08; la entrada del
  04/08 dijo 9 / 2 / 8 por un error aritmético al redactar — **las listas eran correctas**):
  **10** de agregado semanal puro (`ecv_encuentros`, `ecv_barrios`, `ecv_barrio1/2/3` y los
  **cinco** `ecv_insc_*_pct`), **2** de encuentro (`ecv_barrio`, `ecv_poblacion`) y
  **7 ambiguos** (`ecv_inscriptos`, `ecv_asistentes` y los **cinco** `ecv_insc_*`), que
  valen *el total de la semana* en la lámina 5 y *el de ese encuentro* en la 6.
  **Los 7 quedan diferidos por decisión del 05/08 (opción C): no se mueven, no se cablean,
  no se renombran.**
- **La referencia dejó de ser un número escrito** (addendum del 05/08): el criterio de
  cierre pasa a ser **interno a la corrida**. Los del 03/08 —2919 / 686 / 12— quedan
  **derogados**: no estaban mal, están vencidos.
- **Los agregados, medidos:** **3364 inscriptos · 811 asistentes · 16 encuentros**, ventana
  24–30/07 `config`. **Idénticos el 04/08 y el 05/08 — la base no se movió en un día.**
  Canales: mail 2003 · CC 272 · IVR 43 · digital 955 · difusión 71 = **3344**, diferencia
  **−20**, con **una sola fila que la explica**: `Clara Muzzio · Palermo · 29/07`.
  (La de 54 del 03/08 bajó a 20 porque `Mataderos` del 29 ya tiene sus canales cargados.)

- **El corte JM/GCBA es una señal por canal.** IVR: `digital/Directa IVR` col **G**,
  encabezado exacto `"Vocero"`, 57/57 filas con dato, **`JM` 53 · `GCBA` 4**, y **0 cuentas
  con dos voceros**. Mail: `digital/Directa Mail` col **G**, encabezado exacto
  `"Mail remitente"` —**no "MAIL"**—, 2149 filas, **21 remitentes distintos**,
  `jorge.macri@buenosaires.gob.ar` 294 (13,7%). Pauta: `digital/Digital` col **B**,
  mapeada como `dig_jm_gcba`.
- **⚠ El remitente es por envío, no por cuenta.** De las 880 cuentas con mail, **136 mandan
  desde dos remitentes distintos**. La propagación por `id_cuenta` **no aplica a mail**.
- **⚠ La propagación por cuenta cubre el 1,3%**: 47 de 3491 `id_cuenta` tienen fila en
  `Directa IVR`. Pero casi no hace falta — los tres canales tienen señal propia; lo que
  queda sin señal es **CC y la pauta digital**.
- **`valores_incluidos` no alcanza para el corte por sección.** Filtra dentro de
  `leerFuente`, por `(base, solapa)` y **para toda la corrida**: no puede darle JM a una
  sección y GCBA a la de al lado. Eso es lo que resuelve el `Pedido-3`.
- **`R-10`: el enunciado está bien, el fundamento numérico está mal citado.** Dice quince
  pares; hoy son **dos** (`Eje`/`eje` y `Estado`/`estado`, las dos en
  `digital/CAMPAÑAS_DESGLOCE_DIGITAL`). `Nombre Campaña` vs `nombre_campaña` **no** colisiona
  plegando case: es espacio contra guion bajo. Y D.1 lo refuerza igual: las tres parejas son
  **columnas distintas con contenido distinto** — `Estado`/`estado` se contradice en **1082
  de 4840 filas**.
- **`SOLAPAS` se movió 15 filas desde el snapshot del 01/08.** `m2/Cuentas` → **`ignorar`**
  (no se lee ni se mapea); `digital/CAMPAÑAS_DESGLOCE_DIGITAL` → **`fuente`**;
  `m2/CAMPAÑAS_DESGLOCE_DIGITAL` → **`ignorar`**, con lo cual **manda la de `digital`**.
  **Antes de citar un `uso`, mirarlo vivo: el snapshot envejeció en tres días.**

## Qué mirar antes de tocar algo

- **Las bases no se pueden leer desde node.** La cuenta de `tools/token.js` sólo tiene scope
  `drive.file`, así que el `htmlview` de `tools/snapshot.js` da **404** contra libros ajenos.
  Para medir sobre las bases, el camino es el motor: `tools/api.js llamar fn=eval` con
  snippets de sólo lectura — cero líneas en el repo y cero `clasp push`.
  **⚠ `eval` es invocable por la API** (no está en `API_PROHIBIDAS_`): cómodo para medir, y
  superficie de ataque si el token se filtra.
- **Una solapa con `uso = 'ignorar'` no se lee, no se audita y no se menciona.** El
  `Pedido-1` leyó `m2/Cuentas` antes de saber que había pasado a `ignorar`: la premisa del
  prompt decía `fuente`. **El `uso` se verifica vivo antes de leer, no después.**
- **`FALTANTES` cuenta por (token, ítem), no por caja.** El deck tiene 447 cajas en `«FALTA»`
  y la hoja registra 438: los 9 son `camp_titulo` (8 cajas, 1 fila), `camp_remitente` y
  `rrss_area1`. Responde *qué* falta, no *cuántas cajas* quedaron marcadas.
- **`buscarMapeo` no cachea, y cuesta caro.** Si escribís un bucle que la llama, resolvé la
  columna afuera.
- **`abrirHoja` devuelve un sobre `{ ok, base, libro, hoja }`, no la hoja.**
- **Nada que recorra una presentación puede usar `slide.getShapes()`.** El recorrido correcto
  es `piezasDeTextoDeSlide_` (`Armonizar.gs`), que devuelve `objectId` — es lo que hizo
  posible leer el deck caja por caja.
- **`upsertPorClave_` reescribe la fila entera** (`P0` en `PENDIENTES`). Una columna nueva se
  agrega al `SEED_*` con su valor real, nunca con `''`, y **primero a `COLUMNAS_DELTA_` y
  recién después a los `headers`**.
- **Una respuesta grande no vuelve por `/dev`**, y el tope de Apps Script son **6 minutos**.
- **Tres significados distintos de una celda vacía**: `D-19`, `D-20`, `D-21`.

## Números de referencia, verificados hoy

`MAPEO` en **120** filas — ninguna de `vocero` ni de remitente. `MARCADORES` en 13.
Deck vigente: **195 tokens · 464 instancias · 17 con valor · 447 en `«FALTA»` · 0 crudos**.
`FALTANTES` en 438 filas, **384 de ellas por "sin fila en `MARCADORES`" (88%)**.
`digital` tiene **8** solapas `uso = fuente`; universo de `id_cuenta` del libro: **3491**.

## Estado de los prompts sin ejecutar

| prompt | estado al 04/08 (tarde) |
|---|---|
| `2026-08-04_Pedido-1_corte_jm_gcba` | **Partes 0 y D corridas**, con tres premisas vencidas reportadas. A, B, C y E **sin ejecutar** — B necesita corrección (mail es por fila) |
| `2026-08-04_Pedido-2_validar_deck` | **ejecutado entero.** Hallazgo: la cuenta equivocada |
| `2026-08-04_Pedido-3_filtro_declarativo` | **sin ejecutar.** Va después del `Pedido-4` |
| `Paso-2.5` | destrabado; al ejecutarlo, usar `mapaDeTokens_`, no `getShapes()` |
| `Paso-2.13` | sirve como está, auditado el 03/08 |
| `Paso-3-v3` | ejecutado hasta `D.1` Parte D |
| `DOC-8` | sirve como está |
