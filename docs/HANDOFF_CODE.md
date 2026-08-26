# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

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
