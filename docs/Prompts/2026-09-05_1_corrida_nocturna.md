# 2026-09-05_1 — Corrida nocturna del 05/09

**El usuario duerme. No hay nadie a quien preguntar.** El objetivo de la noche es que a la mañana
haya **resultados y un reporte**, no preguntas.

**Ocho partes independientes.** Ninguna necesita una decisión nueva del usuario: todas están
decididas y escritas en el repo, o son de sólo lectura. Las que sí necesitan una decisión **no
están acá** — están listadas al final, en «Lo que la noche NO puede cerrar», para que no se intente.

---

## Las reglas de la noche

1. ⛔ **No corras nada contra la planilla viva.** Ninguna función de Apps Script se ejecuta esta
   noche: no tenés la hoja. Lo que escribas para que se corra, **queda escrito y sin correr**, y se
   anota en el reporte bajo «para correr a la mañana».
2. ⛔ **No hagas `clasp push`.** El estado del proyecto de Apps Script ya es una incógnita declarada
   en `HANDOFF_CODE.md`; un push a ciegas de noche la empeora.
3. ⛔ **No toques ninguna plantilla ni ningún `.pptx`.** No están en el repo y no hacen falta.
4. ⭐ **Las partes son independientes a propósito. Si una se bloquea, anotá por qué y SEGUÍ con la
   siguiente.** Un bloqueo no cancela la noche. La única que ordena es la Parte 0.
5. ⛔ **Si una parte necesita una decisión que no está escrita, PARÁ ESA PARTE** y anotala en el
   reporte como *«bloqueada, decide el usuario»* con **la pregunta exacta**, en una línea. No la
   resuelvas por plausibilidad. **No inventes el faltante** (`CLAUDE.md` §4).
6. **Un commit por parte**, para poder bisecar. Documentación separada de código.
7. ⭐ **Cada parte que mida lleva control positivo, y frena si el control no aparece.** Un
   instrumento que no ve lo conocido no vio nada.
8. ⛔ **Ningún número entra al reporte sin el comando que lo produjo.** Ni los míos: los de este
   prompt son estimaciones hasta que un comando los reproduzca. Si un número mío no se reproduce,
   **gana el tuyo** y se dice en el reporte.
9. ⛔ **No reconstruyas de memoria ningún prompt faltante.** La deuda documental de los prompts del
   04/09 se registra y se cuenta, **no se rellena**.
10. ⭐ **Antes de pedir que algo se registre, grepealo.** Si ya está, el resultado correcto es cero
    ediciones y **se registra el cero** (`CLAUDE.md` §3).

### Subagentes

- ⭐ **`verificador`: se invoca explícitamente al cerrar las Partes A, C, E y G** — las que tocan
  código o instrumentos. Se le pasa qué cambió y contra qué invariante.
- ⛔ **`cableador`: NO se usa esta noche.** Escribe en hojas de registro y esta noche no se escribe
  en ninguna hoja. Queda dicho para que no se invoque por criterio propio (`CLAUDE.md` §4).
- ⚠ **El reporte del `verificador` no es luz verde**: corre dentro de la sesión que implementa y
  hereda sus premisas. No reemplaza la verificación contra los archivos.

---

## Parte 0 — Premisas · **Sonnet** · effort normal · SÓLO LECTURA

**Cada premisa que no se confirme bloquea SU parte, no la noche.** Salvo `0.1`: si el repo no está
donde digo, **parás todo y reportás**.

Reportá las siete en una tabla `premisa · esperado · medido · veredicto` **antes de la primera
edición**.

| # | premisa | reproductor | esperado |
|---|---|---|---|
| **0.1** | El repo está en el commit del handoff reescrito | `git log -1 --format='%h %s'` | `644c8cc` · *«Doc - handoff reescrito…»*. ⚠ Si hay commits posteriores, **releé `HANDOFF_CODE.md` y `PLAN.md` §2 antes de seguir** |
| **0.2** | La lista que deja afuera a `LISTA_TEXTO` sigue ahí | `grep -n "'FILA', 'FILA_TEXTO', 'GRUPO_TEXTO'" Generador.gs` | una coincidencia. ⛔ **Resolvé por nombre, no por número de línea** |
| **0.3** | `esPlantilla` **sí** incluye `LISTA_TEXTO` | `grep -n "esPlantilla" Generador.gs` | la asignación nombra las tres operaciones, `LISTA_TEXTO` entre ellas |
| **0.4** | El máximo global de `caso_id` es `C-96` | `cut -d, -f1 docs/casos_validacion_*.csv \| grep -oE '^C-[0-9]+' \| sort -t- -k2 -n \| tail -1` | `C-96` |
| **0.5** | Los dos `caso_id` repetidos entre archivos siguen siendo dos | `cut -d, -f1 docs/casos_validacion_*.csv \| grep -E '^[A-Z]-[0-9]+$' \| sort \| uniq -d` | `C-84` y `C-85`, nada más |
| **0.6** | **No existe caso para el global de `L-047`** ni para el bloque digital del Resumen Ejecutivo | `grep -rn '367.638\|16.342.168' docs/` | ambos aparecen **sólo** en `docs/Prompts/2026-09-04_6_…md`, en ningún CSV |
| **0.7** | El censo de formatos usa un control positivo que hoy está apagado | `grep -n 'entero_revisar' Auditoria.gs` | aparece como control dentro de `censarFormatosDesconocidos()` |

⚠ **Y una que no tiene reproductor y por eso va declarada, no medida:** los **nombres exactos** de
los cuatro marcadores del bloque global de `L-047` **no están en el repo**. La Parte C está escrita
sabiendo eso.

---

## Parte A — `emin_lista`: `ctx.plantilla` nunca llega · **Opus** · effort alto

**Ítem 34 de la cola.** La causa está medida desde el 04/09 y el arreglo está localizado: la
asignación de `ctx.plantilla` vive dentro de un `if` que lista tres operaciones y **`LISTA_TEXTO` no
es una de ellas**, aunque la guarda interna `esPlantilla` sí la incluya. ⇒ `opLISTA_TEXTO` devuelve
`'' + «FALTA:@plantilla_sin_resolver»` → `sin_datos` → el deck publica `-`.

### ⛔ Hay dos caminos y NO son equivalentes. Elegí y escribí por qué

Ese mismo `if` hace **dos cosas**: setea `ctx.plantilla` (que `LISTA_TEXTO` necesita) y arma
`ctx.ordenPor` **leyendo `fila.separador` como nombre de campo**.

⚠ **Y `LISTA_TEXTO` usa `separador` con el otro sentido**: es la cadena que une las filas —el
default es un salto de línea—, no un campo por el que ordenar.

| camino | qué cuesta |
|---|---|
| **(1)** agregar `'LISTA_TEXTO'` a la lista del `if` | mínimo diff, pero `campoOrden` pasa a ser el separador de unión y se va a `buscarMapeo` a buscar un campo que no existe |
| **(2)** sacar la asignación de `ctx.plantilla` del `if` y guardarla por `esPlantilla` | toca dos líneas más, y deja cada guarda diciendo una sola cosa |

**Medí antes de elegir**, y esto es lo que decide:

- ¿`buscarMapeo` con un salto de línea como nombre de campo **devuelve `ok:false` o rompe**? Si
  rompe, (1) queda descartado y no hay que discutirlo.
- ¿Alguna fila de `MARCADORES` con `operacion = LISTA_TEXTO` declara `separador`? ⚠ **No podés
  medirlo contra la hoja viva**; medilo contra `docs/_snapshots/MARCADORES_2026-08-31.tsv` y
  **declará el límite en el reporte**: ese snapshot tiene 220 filas, todas `jm`, y es **anterior**
  a los `emin_*`. ⇒ **Puede quedarse corto y nunca largo.**

⛔ **Si la medición no alcanza para elegir, tomá (2) y decí por qué**: es la que no depende de que
un efecto colateral sea inofensivo.

### El control positivo, que acá es obligatorio

⭐ **Un banco que FALLE con el código de antes y PASE con el de después.** Sin eso no hay forma de
distinguir el arreglo de un banco que no mira nada.

- El banco arma un `ctx` de `LISTA_TEXTO` por el **mismo camino** que la corrida —no llamando a
  `opLISTA_TEXTO` con un `ctx` armado a mano: **medir la función no es medir el camino**, y esta
  semana esa figura ya costó dos vueltas.
- Verificá que `emin_encuentros` y los demás `emin_*` **no cambien de valor** con el cambio.

⚠ **Esto mueve un número publicable**: `emin_lista` pasa de `-` a texto. Por eso es Opus, por eso
lleva banco propio, y por eso **no se pushea**. A la mañana lo corre el usuario.

`verificador` al cerrar. Un commit de código + su banco.

---

## Parte B — Los dos casos que faltan en el CSV del 04/09 · **Opus** · effort alto

Del `2026-09-04_6` Parte B quedaron **dos comparaciones sin caso escrito**. Están medidas y fechadas
en ese prompt (deck del motor 11:42 contra el del equipo 11:25, 04/09), así que esto es
**registrar**, no medir.

⛔ **No edites ningún CSV anterior ni ninguna fila existente.** Un caso es una comparación fechada
(`D-56`). Se **agregan filas** al final de `docs/casos_validacion_2026-09-04.csv`, con su encabezado
actual.

⭐ **La numeración sale del máximo GLOBAL de los tres archivos** (`0.4`), no del máximo de este
archivo — que es exactamente el defecto que el ítem 29 registra. ⇒ `C-97` y `C-98` si `0.4` dio
`C-96`.

### `C-97` · el global de `L-047` — estado `exacto`

| | motor | equipo |
|---|---|---|
| enviados global | 367.638 | 367.638 |
| `% OR` global | 41,9 | 42 % |
| clics global | 2.457 | 2.457 |
| `% CTOR` global | 1,6 | 2 % |

Los dos absolutos coinciden dígito a dígito; los dos porcentajes coinciden **con el redondeo a
entero del equipo**, que es el mismo criterio con el que `V-125` cerró los de M2. **Citá `V-125`**,
porque es el precedente de forma.

⛔ **Y escribí el límite en la nota, porque es el que va a decidir si este caso sirve:** los
**nombres exactos de los cuatro marcadores no están en el repo**. En `token_propuesto` va la
descripción del bloque —*los cuatro del global de envío de mail de campaña de `L-047`*— y la nota
dice que **el caso registra la comparación, no habilita todavía a levantar la marca**: para eso hace
falta la lista de nombres que produce `diagGlobalL047()` (Parte C). ⚠ **Un caso que no puede nombrar
su marcador no puede levantarle el `_revisar`**, y decirlo acá es lo que evita que alguien lo use de
más dentro de un mes.

### `C-98` · el bloque digital del Resumen Ejecutivo — estado `abierto`

Motor 16.342.168 impresiones `jm` contra 10.166.581 del equipo · Meta 2.560.372 vs 1.548.095 ·
Google 1.648.150 vs 1.114.536 · Programmatic 12.133.646 vs 7.503.950. Contadores de
implementaciones: motor `1/1/1`, equipo `7/8/8`. Mismo cuadro en `L-032` (GCBA), motor ~2,4× arriba.

⭐ **Lo que hace que esto no sea drift y por eso va como caso:** los **dos decks son internamente
consistentes** —las tres plataformas suman su total en ambos—, así que no es un error de suma: **el
motor toma más filas.** Es una hipótesis de universo, y va escrita como hipótesis.

⛔ **`abierto`, no `contradice`**, y el motivo va en la nota: el Resumen Ejecutivo está **congelado
por decisión del usuario** hasta validar con los equipos de dónde sale la información. **Registrar
no es tocar** — pero declarar un defecto sobre un frente congelado es afirmar más de lo que se
midió.

⛔ **No toques nada del Resumen Ejecutivo.** Ni código, ni configuración, ni una nota de diseño.

Un commit.

---

## Parte C — `diagGlobalL047()`, y la escritura que NO se escribe · **Opus** · effort alto

La Parte C del `_6` pedía una función que le sacara el `_revisar` a los confirmados. **Su alcance
quedó reducido a cuatro** —el global de `L-047`, porque los seis de M2 ya se corrigieron el 04/09—
y **no se puede escribir esta noche**: la lista de nombres no está en el repo (`0.7` bis) y **una
función de escritura con una lista inventada es exactamente el fracaso caro**.

⛔ **Escribí sólo la mitad que sí se puede, y declará la otra como bloqueada por dato.**

### Lo que sí va: `diagGlobalL047()`, sólo lectura

Lista los marcadores del bloque global de `L-047` con `marcador`, `formato`, `operacion`,
`campo_logico` y `informe_id`, para que **una corrida de la mañana produzca la lista de nombres**
que hoy falta.

- ⭐ **Que declare su universo en el log**: cuántas filas miró, con qué criterio eligió las del
  bloque global, y **cuántas descartó y por qué**. Un diagnóstico que devuelve cuatro nombres sin
  decir de cuántos salieron no se puede auditar.
- ⛔ **No escribe nada.** Ni `_revisar`, ni `formato`, ni una nota.

### Lo que NO va, y queda dicho en el reporte

`confirmarGlobalL047()` **no se escribe esta noche**. Cuando se escriba, va con el precedente de
forma de `confirmarNumerosDeUnoAUno()` —bloque de documentación con el motivo, constante con la
lista agrupada por formato destino, escritura sólo de la columna `formato` y sólo de esas filas,
relectura de la hoja para verificar, backup antes— **más el gate de `D-58`**: cruzar su lista contra
los CSV **posteriores a su fecha** antes de escribir. ⚠ Sin ese gate repite exactamente lo que le
pasó a `confirmarNumerosDeUnoAUno()`, cuya lista congelada del 26/08 no pudo enterarse de `X-42` y
`X-43` del 28/08.

`verificador` al cerrar. Un commit.

---

## Parte D — Lo que no son números · **Sonnet** · effort normal

Cuatro registros del `_6` Parte D. ⛔ **Grepeá cada uno primero** y **registrá el cero** donde ya
esté: hay al menos dos que ya tienen entrada.

1. `camp_env4_fecha}}` publicado crudo en `L-047` — **sin llaves de apertura**, en las **dos**
   corridas del día — es de la plantilla. El detector de crudos busca `{{` y **no puede verlo**.
2. `L-039`, `L-048` y `L-050` publican tokens crudos —del orden de 25, 13 y 15—. En `L-048` el
   equipo **sí tiene los datos** (396 respuestas moderadas, tasa 0,26 %): no es que falte la fuente.
3. El remitente sigue sin normalizar, y **se vio de nuevo el 04/09**: motor
   `jorge.macri@buenosaires.gob.ar` en la primera fila y `/////` en las otras tres; equipo `JM` en
   la primera y vacías las demás. **Sólo apuntar que sigue abierto** — la decisión es del usuario.
4. ⭐ **La campaña destacada cambió entre las 10:45 y las 11:42** —`Operativo Muro | 25/8` primero,
   `Fin de las mafias de los celulares robados` después—. Va **a la nota del ítem 9** en `PLAN.md`
   §2, porque agrega algo que esa nota no tiene: **cuál campaña sale depende de a qué hora se
   corra.**

⚠ **Y la buena noticia, que también se registra:** el encabezado publicó `vie 28/08 – vie 04/09`.
**La ventana viernes a viernes está aplicada.**

El ruteo lo decide `CLAUDE.md` §7, no este prompt. Un commit.

---

## Parte E — El control positivo del censo de formatos, sintético · **Sonnet** · effort normal

`censarFormatosDesconocidos()` usa `entero_revisar` como control positivo. ⛔ **Ese formato ya no
existe**: `formatoEmin()` lo corrigió, el censo da cero y **el control aborta** — o sea que el
instrumento se apagó exactamente cuando empezó a hacer falta.

⛔ **El control tiene que ser sintético.** Una fila armada en memoria con un formato inexistente
—algo como `__control_sintetico__`, que no puede aparecer en la hoja por accidente— que el censo
tiene que detectar antes de mirar los datos reales.

- ⛔ **No escribe en `MARCADORES`.** La fila de control **no toca la hoja**: se inyecta en la lista
  que el censo recorre.
- ⭐ **Si el control no aparece en el resultado, el censo aborta** con un mensaje que diga que el
  instrumento está ciego, no que no hay hallazgos. **Un cero sin control positivo es
  indistinguible de un detector que no mira nada.**
- Banco propio: el censo **encuentra** el control, y **sigue dando cero** de desconocidos reales
  sobre el snapshot.

`verificador` al cerrar. Un commit.

---

## Parte F — Los dos conteos que hoy están mal · **Sonnet** · effort normal

⚠ **Los dos están en documentos vivos y los dos son citables.** Ninguno cambia una decisión; los dos
mandan a leer mal.

1. **`HANDOFF_CODE.md` dice «Cola: 12 de 37 cerrados» y «37 ítems, 12 cerrados».** ⇒ **Medilo vos
   sobre `PLAN.md` §2 con un comando y corregí con lo medido, no con lo que dice este prompt** —
   contá `[x]`, `[~]` y `[ ]` por separado y dejá el comando en el reporte. Mi medición dio **36
   ítems · 11 `[x]` · 2 `[~]` · 23 `[ ]`**, y es una estimación hasta que la reproduzcas.
2. **La deuda documental dice «trece prompts».** ⇒ Su propia enumeración lista **catorce**, y
   **no incluye el `_8` Addendum 5**, que se ejecutó —cerró `u1_post_meta_alcance`— y **tampoco
   está en la carpeta**. Contá los presentes con `ls docs/Prompts/2026-09-0*.md`, contá los
   enumerados, y **corregí el número y la lista**.

⭐ **Y esto no es cosmética:** el handoff acaba de registrar que estuvo 62 commits atrasado y que
**lo encontró el usuario preguntando, no un control**. Un conteo mal en el documento que se acaba de
reescribir para arreglar eso es la misma figura otra vez.

Un commit de documentación.

---

## Parte G — El validador de `caso_id` · **Sonnet** · effort normal

**Ítem 29.** La clave del cruce de `D-56` **no es única**: `C-84` y `C-85` están repetidos entre
archivos porque el CSV del 28/08 reinició la serie. ⚠ **Ya costó una lectura equivocada, y el
instrumento le dio verde igual.**

Un validador en `tools/` que, sobre **todos** los `docs/casos_validacion_*.csv`:

- reporte **duplicados de `caso_id` entre archivos** —control positivo: tiene que encontrar `C-84` y
  `C-85`, y **si no los encuentra, aborta**—;
- reporte el **máximo global por prefijo**, que es el número del que sale el próximo id;
- salga con **exit code ≠ 0** si hay duplicados, para que sirva en una suite y no sólo a ojo.

⛔ **NO renumeres nada.** Los casos ya ejecutados no se renumeran —mismo criterio que los prompts
(`CLAUDE.md` §3)— y elegir cuál de los dos `C-84` se queda con el número **es una decisión del
usuario**. El validador **muestra** el problema; no lo resuelve.

`verificador` al cerrar. Un commit.

---

## Parte H — El cruce inverso del ítem 36 · **Opus** · effort alto · ⚠ SACRIFICABLE

**Es la última y es la primera que se cae si la noche se acorta.**

El cruce marcador → caso corre **en una sola dirección**: se detecta el marcador con `_revisar` que
ya tiene caso, pero **no** el caso `exacto` cuyo marcador **sigue** marcado. Eso es lo que dejó
pasar la aplicación masiva del 01/09.

Escribí `diagCasosExactosConRevisar()`, **sólo lectura**, que:

- recorre **todos** los CSV, se queda con los `exacto`, y aplica `D-58` —**cuando dos casos hablan
  del mismo marcador, manda el más nuevo**— antes de decidir si ese marcador está validado hoy;
- ⛔ **desarma primero los `token_propuesto` con varios marcadores en una celda** —`V-125` tiene
  seis separados por ` / `—, porque contar celdas en vez de marcadores da un número que no
  corresponde a nada;
- cruza contra `MARCADORES` y lista los que tienen caso `exacto` vigente **y** siguen con
  `_revisar`;
- ⭐ **control positivo obligatorio**: si el cruce no reencuentra ninguno de los casos `exacto`
  conocidos, **aborta** — no reporta cero.

⚠ **Contra la hoja viva no podés correrlo.** Escribilo y dejalo para la mañana. Si querés una
verificación de forma esta noche, corrélo contra `docs/_snapshots/MARCADORES_2026-08-31.tsv`
**declarando que es una foto del 31/08, anterior a la migración a `'*'`** — sirve para probar que el
instrumento funciona, **no** para sacar un número.

`verificador` al cerrar. Un commit.

---

## El reporte de la mañana

Un solo bloque al final, en este orden y sin prosa alrededor:

1. **La tabla de la Parte 0** — premisa · esperado · medido · veredicto.
2. **Una fila por parte**: parte · estado (`hecha` / `parcial` / `bloqueada`) · commit · **una línea**
   de qué quedó.
3. ⭐ **«Para correr a la mañana»** — la lista exacta de funciones, en orden, con **qué tiene que dar
   cada una** para considerarse bien. Sin el valor de control, correrla no prueba nada.
4. ⛔ **«Bloqueado, decide el usuario»** — la pregunta exacta, una línea cada una. Si no hay
   ninguna, decir *ninguna*.
5. **«Lo que encontré y no estaba en el prompt»** — si aparece algo que merece prompt propio, se
   anota acá y **no se arregla de paso**. Mejorar no es ampliar.

⭐ **Y si algo de este prompt resultó mal —una premisa vencida, un número mío que no se reprodujo,
un paso innecesario— decilo en el reporte.** Un prompt no ejecutado es una hipótesis, y ésta se
escribió sin ver la hoja viva.

## Orden y sacrificabilidad

```
0 (Sonnet)
 ├─ A (Opus)      ← la que mueve un número publicable
 ├─ B (Opus)      ← vale sola
 ├─ C (Opus)      ← depende de nada; su mitad de escritura ya está declarada fuera
 ├─ D (Sonnet)
 ├─ E (Sonnet)
 ├─ F (Sonnet)    ← la más barata de todas
 ├─ G (Sonnet)
 └─ H (Opus)      ← ⚠ la primera que se cae
```

**Si la noche alcanza para poco:** `F`, `D` y `E` cuestan poco y cierran entero. `A` es la que más
cambia el deck de mañana. `H` se cae primero.

---

## Lo que la noche NO puede cerrar, y por qué

⛔ **Nada de esto se intenta.** Está acá para que no se descubra a las tres de la mañana.

| qué | por qué no |
|---|---|
| `meta_frecuencia` — lo último del `_9` | exige leer la base viva |
| El grupo B del `_7` (`limpiarGrupoB()`) | escribe en `MARCADORES` |
| Ítem 9 · `camp_titulo` en `L-023` | ⛔ falta un dato **del Drive**: qué token hay en la caja `x=0.83 y=0.58 w=2.16` de la plantilla `secco`. Lo mira el usuario |
| Verificar que Apps Script tenga el código de hoy | exige `clasp pull` |
| Ítems 12 · 15 · 16 · 28, y el decimal de los tres `*_ctr` | **decisión del usuario**, sin escribir |
| Ítem 7 · compartidos sin fila | exige correr `listarCompartidosSinFila()` contra las plantillas vivas |
| Los prompts del 04/09 que faltan | ⛔ **no se reconstruyen de memoria** |
