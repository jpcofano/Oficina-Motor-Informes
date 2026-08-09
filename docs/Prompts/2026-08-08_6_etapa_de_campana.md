# La etapa de una campaña: pre, durante y post

**Modelo:** Opus, effort alto. **No bajar a Sonnet para este prompt.** La Parte 0 no es conteo:
cruza cuatro solapas con vocabularios distintos y tiene que distinguir *«no hay fila»* de *«hay
fila y se descarta»*, que es la diferencia entre los dos modos de falla. Confundirlas invalida la
medición entera.

**Subagentes:** `verificador` antes de la Parte 0, sobre este archivo. La sesión se reinició, así
que está cargado. **Verificar que corrió**: lleva seis prompts sin ejecutarse ni una vez.

**Un objetivo.** Que dos filas de campaña que comparten `Id Cuentas` dejen de ser la misma cosa
para el motor. **Toca `.gs`.**

> **Reemplaza al borrador titulado "El segundo enganche: una reunión y sus campañas".** El
> alcance cambió al aparecer el caso real: **no es una propiedad de las reuniones, es una
> propiedad de las campañas**, y toca también `m2`.

---

## De dónde sale

El usuario decidió (08/08) que las dos relaciones existen y **se definen por secciones**:

| sección | orden | `itera_sobre` | `filtro` | enganche |
|---|---|---|---|---|
| `encuentro` | 8 | `REUNIONES` | — | **el 2 · este prompt** |
| `comunicaciones_post` | 9 | `REUNIONES` | `etapa=post` | **el 2 · este prompt** |
| `m2` | 12 | — (`agregado`) | — | **entró con el caso real** |
| `campana` | 13 | `CAMPANAS` | — | el 1 · **lo cierra el `_5`, no se toca** |

Y dio la regla del nombre —*«comparten el id; ponen `post` pero no `pre`, y el otro es
`durante`»*— **más un caso real que la contradice en parte.** Las dos cosas van juntas al diseño.

---

## El caso real, y lo que se lee en él

Dos filas de `digital / Directa Mail`, mismo `Id Cuentas`, **sin contraparte en IVR ni en
digital**:

| col | pre | post |
|---|---|---|
| `A` `mail_id_cuenta` | `2033-SEPEPHGC` | `2033-SEPEPHGC` |
| `B` **sin mapear** | `26770` | `26771` |
| `F` `mail_fecha` | 05/08/2026 | 05/08/2026 |
| `H` `mail_campana` | `Poda pre (semana del 23/7 al 31/7)` | `Poda post (semana del 13/7 al 23/7)` |
| `K` **sin mapear** | `VC PODA PRE 20260804` | `VC PODA POST 20260804` |
| `M` `mail_enviados` | 6.041 | 4.008 |
| `T` `mail_area` | Espacio Público e Higiene Urbana | ídem |
| `U`–`X` **sin mapear** | `M2 PODA · M2 Poda · Poda · M2` | ídem |

**Cinco cosas que salen de acá, y ninguna es una suposición:**

1. **La etapa ya viaja en una columna mapeada.** `mail_campana` es la `H` y trae `pre` / `post`
   escritos. Para mail **no hay que parsear el nombre de la maestra**.
2. **`pre` está escrito.** La regla *«ponen post pero no pre»* vale en la maestra digital, no acá.
   **Son dos vocabularios en dos solapas**, y una sola función que deduzca la etapa del texto va a
   acertar en una y fallar en la otra.
3. **`B` es un id por fila** —`26770` / `26771`— y es la clave durable que separa las dos filas
   bajo el mismo `Id Cuentas`. **No está mapeada.**
4. **Es M2, no un encuentro.** `U`–`X` clasifican la fila como `M2 / Poda`. Ninguna de esas cuatro
   columnas está mapeada, y son las que dirían a qué sección pertenece una fila de mail.
5. **Las fechas del nombre son la semana de la poda, no de la campaña.** El post cubre 13–23/7 y
   la pre 23–31/7 —**el post apunta a la semana anterior**— y las dos se enviaron el 05/08.
   Filtrar la ventana del informe por esas fechas devuelve la semana equivocada. Es el mismo
   hallazgo de `DISENO_match_temario.md` §5 con otra base.

---

## Los dos modos de falla, que son distintos

**A · Sin fila en la maestra, la campaña no llega.** `unirDigitalPorCuenta` arma `porCuenta`
**desde la maestra** (`Union.gs:135-143`) y después cuelga los canales. `Union.gs:176`: si el id
del canal no está en la maestra, va a `huerfanasEnCanal` y **la fila se descarta**. El usuario dice
que este caso **no tiene contraparte en digital**. Si eso significa que no tiene fila en
`Seguimiento digital`, **las dos filas de poda no se pierden a medias: no llegan nunca**.

**B · Con fila en la maestra, las etapas se mezclan.** Los canales acumulan en un solo arreglo por
cuenta —`porCuenta[id][prefijo + '_filas'].push(fila)`, `Union.gs:184`— **sin marca que separe
pre de post**. Y la maestra directamente **pisa**: `porCuenta[idCuenta] = registro` es asignación,
no acumulación, así que con varias filas de maestra bajo un id **sobrevive la última leída** y las
demás desaparecen sin quedar en el diagnóstico.

**Los dos modos publican un número que se ve bien.** Es el hallazgo de la lámina 5 otra vez: el
token tiene fila en `MARCADORES`, el `MAPEO` está bien, la fuente trae filas — **y el universo es
el equivocado**.

---

## Lo que ya está medido — no se vuelve a preguntar

- **`anclarEncuentros()`** (`Union.gs:685`) ancla reunión → cuenta y devuelve **una** cuenta. Con
  id compartido **eso está bien**: el discriminador no va a nivel de cuenta y el anclaje no se
  toca.
- **`esPost_()` está definida y no la consume nadie.** `Parseo.gs:145` la define, la 194 la expone
  como `parseado.es_post`, ningún otro archivo la usa. Además es binaria y ahora hay tres valores.
- **`durante` no existe en el parser del temario.** `Reuniones.gs:93-96` sólo reconoce `(pre)` y
  `(post)`; cualquier otro paréntesis cae a `notas`.
- **La etapa está definida en tres lugares que no coinciden:** `Reuniones.gs` la parsea del
  temario, `SECCIONES.filtro` la usa como `etapa=post` sobre la reunión, `esPost_` la deduce del
  nombre de campaña. **Y ahora aparece una cuarta, la buena: la columna de la fuente.**
- **⚠ La lámina 6 no está trabada por el anclaje.** En la corrida de la `BITACORA` los cinco ítems
  anclaron —San Cristóbal pre y post comparten `3354-JULJDGAG`— y los treinta tokens no
  resolvieron **porque esas cuentas no tienen filas en las solapas de canal para esa ventana**.
  Orden Público, con `3387-JULJDGGC`, resolvió 31 y pintó 11. Esa medición tiene fecha y `0.4` la
  re-mide, pero se arranca desde ella.

---

## Parte 0 — premisas (sólo lectura, reportar y parar)

`0.1` · **El caso real, primero.** Buscar `2033-SEPEPHGC` en **todas** las solapas y reportar en
cuáles aparece. La pregunta concreta: **¿tiene fila en `Seguimiento digital`?** Si no la tiene,
correr la unión y confirmar que las dos filas caen en `huerfanas_en_canal`. Ese es el modo de
falla A, medido y no supuesto. Y decir **cuántos ids más de mail están en la misma situación**.

`0.2` · **Dónde vive la etapa en cada solapa.** Para cada solapa de canal y para la maestra:
**qué columna trae la marca de etapa, si está mapeada, y con qué vocabulario**. La `H` de mail ya
está mapeada como `mail_campana` y escribe `pre` y `post`; la maestra —según el usuario— omite la
pre. Reportar la tabla completa con el texto exacto: mayúsculas, tildes, `Post` contra `POST`.

Y decir si aparece **`durante`** en alguna, con qué palabra. **No inventarla si no está.**

`0.3` · **Las cuatro columnas sin mapear del caso real.** `B` (id por fila), `K` (nombre de
pieza), `U`–`X` (`M2 PODA · M2 Poda · Poda · M2`). Reportar qué contienen a lo largo de la solapa
—cardinalidad, valores distintos— y **cuál de ellas serviría para decir a qué sección pertenece
una fila de mail**. Si `U`–`X` son una clasificación estable, es la vía para enganchar M2 sin
depender de la maestra, y eso es más importante que la etapa.

`0.4` · **Cuántas filas se pierden o se mezclan hoy.** Contar los `Id Cuentas` con más de una fila
**en la maestra** (modo B, pisada) y con más de una fila **por canal** (modo B, mezcla). Correr
`anclarEncuentros()` y reportar el desglose: `encuentros`, `bajaConfianza`, `sinLink` y **cuántas
por `ambiguo`**, con la traza. Re-mide de paso el hallazgo de la lámina 6.

`0.5` · **Si los números están mal, y de cuánto.** Para un caso con dos o tres filas: qué publica
hoy la sección, y los valores de cada etapa al lado. Con la poda alcanza: 6.041 enviados la pre y
4.008 la post. **Si hoy publica uno de los dos como si fuera el total, eso es el tamaño del
error.**

`0.6` · **Lo que este prompt no toca.** Confirmar por lectura que nada modifica el cargador del
`_5`, `CAMPANAS_equivalencias` ni la sección `campana`. **Si algo se cruza, se reporta y se para.**

**Reportar `0.1`–`0.6` y parar.**

---

## Parte A — la etapa sale de la fuente, no del nombre *(sólo con luz verde)*

Con `0.2` en la mano: la etapa se **lee de la columna mapeada** donde exista, y sólo se deduce del
texto donde no haya columna. `esPost_` deja de ser booleana y devuelve la etapa.

**El vocabulario por solapa sale de `MARCADORES` o `CONFIG`, no de un `switch`.** `S-04` autorizó
que las once variantes de barrio vivan en `Parseo.gs` **porque el catálogo de 48 barrios es
estable**; éste ya tiene dos dialectos y una marca nueva desde la semana pasada.

**Y `pre` por ausencia lleva guarda.** Vale en la maestra, **no en mail**, donde la pre está
escrita. Una marca desconocida **no es `pre`**: va a `REVISAR` con el texto al lado. Asumir `pre`
es exactamente cómo un número correcto sale de la fila equivocada.

## Parte B — la fila deja de perderse

1. **Las huérfanas de canal dejan de descartarse en silencio** (`Union.gs:176`). Una fila de mail
   sin maestra es o un dato que falta o una campaña que sólo existe en mail — **hoy las dos se
   ven igual: nada**. Proponer la forma; `R-19` es el precedente de tratar la ausencia como falla.
2. **`unirDigitalPorCuenta` deja de pisar** (`Union.gs:143`) y el registro puede llevar sus filas
   por etapa. **Proponer la forma, no elegirla solo**, y listar los consumidores de
   `union.porCuenta[...]` que cambian —`Union.gs:824` y `869`, `Generador.gs:1195`, más lo que
   salga de `0.4`—. Si son muchos, la vía barata es un campo nuevo al lado.
3. **La lectura de canal se filtra por etapa.** Un ítem `etapa=post` lee las filas post. Una
   sección que no filtra **dice explícitamente si suma las tres o toma una**: quedarse con el
   default sin decirlo es lo que produjo el error.

## Parte C — `durante` entra al temario *(sólo si `0.2` la encontró)*

`Reuniones.gs` reconoce la tercera etapa, **del mismo catálogo de la Parte A** — tres definiciones
de etapa en tres archivos es de dónde salió este prompt.

Qué sección pinta un ítem `durante` **es una pregunta para el usuario, no una decisión de Code**:
`encuentro` no filtra y hoy se lo llevaría. Reportar y preguntar.

## Parte D — la traza

Cada número publicado dice **de qué filas salió y con qué etapa**. Si hay que reconstruir a mano
por qué la lámina 7 publicó un número, el enganche no sirve aunque acierte.

---

## Anexo — anotado, no resuelto

- **Los tres `ID Cuentas` sin confirmar** —`3305-JULSEGGJ`, `3410-JULSEGGJ`, `3441-JULSEGGJ`— los
  encontró Code por palabra clave y **nadie los verificó**. Son del `_5`, pero si aparecen en la
  medición hay que marcarlos como no confirmados.
- **Los números vienen con punto de miles** (`6.041`, `2.013`) y los porcentajes como texto con
  `%`. Verificar que el parseo numérico de mail no los lea como decimales: `6.041` leído como
  seis coma cero cuarenta y uno pasa desapercibido en un token y arruina un total.
- **`mail_campana` es la `H` y hoy se usa como nombre.** Si pasa a ser también la fuente de la
  etapa, queda haciendo dos trabajos. Decir si conviene un campo lógico nuevo sobre la misma
  columna.
