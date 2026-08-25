# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-25 (cierre 2) — **`D-31` resuelto: lectura por posición**, `L-036` cableada con sus **20** marcadores y su identidad interna de vuelta. `etapa.post` se amplió a `~=Post` —**hay que correr
su testigo**— y `L-036` vuelve a donde estaba: **una sola candidata viva, el `id_cuenta` del
anclaje**. Antes: la corrida nocturna `2026-08-24_2`, las cinco partes hechas.

⚠ **Este archivo tuvo tres versiones el 25/08** y las secciones tachadas de abajo son las anteriores,
conservadas a propósito — **cómo se llegó a una conclusión equivocada es la mitad de su valor**. Lo
vigente es lo de arriba.

⛔ **Nada de esto está en Apps Script todavía.** Ver *«Lo que te espera»*, abajo.

---

## ⛔ Lo que te espera, en orden

| # | qué | por qué |
|---|---|---|
| 1 | **`clasp push`** | **nada** de lo del 25/08 está en el proyecto. Un push que corrió antes del cambio es indistinguible de uno que no corrió |
| 2 | ⭐ **`testigoDeEtapaPost()`, ANTES de nada más** | ampliar `etapa.post` **mueve números publicados**. Se corre antes y después, **en la misma sesión** — y su canario es lo único que separa *«lo movió el cambio»* de *«se movió la fuente»* |
| 3 | **Generar `jm`** — ⛔ **sólo con el cambio de `etapa`**, nada más al lado | *«un cambio por deck»* aplica: esto mueve valores existentes, no llena huecos |
| 4 | **`testigoDeEtapaPost()` otra vez**, y leer el canario primero | el criterio de aceptación es tuyo (`V-110`): si un `u1_pre_*` **subió**, se revierte |
| 5 | **`instalar()`** | crea `LAMINAS.alcance` y `LAMINAS.tokens_equipo` por `COLUMNAS_DELTA_` |
| 6 | **`declararAlcanceDeLaminas()`** | puebla las dos columnas. **Después de 5**, o falla nombrando la que falta |
| 7 | ⭐ **`declararModoDelAgregadoPost()`** | pone `comunicaciones_post` en `agregado`. **Desfrenado el 25/08** — su premisa nunca estuvo vencida. ⚠ `sembrarSecciones_` sólo agrega filas ausentes, así que el botón es el único camino |
| 8 | ⭐⭐ **`verificarBloquesPostReuniones()`** | el testigo NUEVO de `D-31`, contra la planilla viva. **Antes de la corrida**: si no cierra, los bloques no están en M/R/W/AB y `L-036` publicaría la columna equivocada |
| 9 | **Correr `jm` sobre `julio_24_30`** | esperado: **tres reuniones con datos**, la cuarta en `sin_datos`, y **Retiro con 41.204** de visualizaciones |
| 10 | ⚠ **`reserva_cierre_seg` a 60, A MANO** | `CONFIG` **sólo siembra lo ausente**. Pendiente de antes |

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

## ⏸ `L-036` — **una sola candidata viva: el `id_cuenta` del anclaje**

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

### `X-28` — lo único que bloquea el Call Center

La **definición** está cerrada `exacto` (`V-105`). Lo que falta es **qué cuentas entran**, y ninguna
regla escrita lo reproduce: la pertenencia da el gabinete entero (22 filas / 100.197 contra 2 /
6.011) y el filtro por nombre falla por los dos lados. ⭐ **Los dos decks publican UNA SOLA CUENTA** y
no hay regla que diga cuál. **Es pregunta al equipo.**

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
