# `2026-09-01_4` — Ministros: nueva fuente y nueva ventana · y el caso de M2

**Subagente:** ninguno.
**Destino:** `docs/Prompts/`.
**Estado:** no ejecutado.
**Deroga** el cableado de `emin_encuentros` del `2026-09-01_1`.

---

# Bloque 1 · Ministros

## Lo que cambió

⛔ **Ministros cambia de fuente.** Ayer se cableó `emin_encuentros` contra `rdv / RVD JM-CM - ES`
con `ambito=ministros`, reproduciendo `V-49`. **En la corrida del 28/08–03/09 dio `1` y el equipo
lista `7`.**

**Definición del usuario, 01/09/2026:**

> Ministros sale **todo** de la solapa **`Agenda funcionarios`** de
> **`Base reuniones - Digital - Call Center`** (base `reuniones`).
> **La ventana se desplaza `−3` días en las dos puntas** —inicio de la semana `−3` y fin de la
> semana `−3`— **y se filtra por `Fecha de envío`.**

⚠ **Eso deroga dos cosas escritas, y las dos quedan en el registro:**

1. El cableado de ayer contra `rdv`. ⛔ **No se edita el `_1`: se le pone un addendum** diciendo que
   la fuente cambió y por qué —`1` contra `7`—.
2. Lo que el propio usuario dijo el **31/08**: *«en `Agenda funcionarios` cargan mal la figura y no
   se puede hacer match»*. **La definición nueva manda.** ⭐ Y explica por qué: el match por figura
   no hace falta si **todo** sale de esa solapa. Lo que no se podía era **anclar** contra digital;
   leer la solapa directamente es otra cosa.

⚠ **Y arrastra a `V-49`**, que valida `emin_encuentros = 8` sobre la unión de dos solapas de `rdv`.
Con la fuente nueva, **ese caso deja de describir lo que el motor hace**. ⛔ No se borra ni se
edita: el CSV es **append-only**. Se reporta la situación y el usuario decide si va un caso nuevo
que lo supersede.

---

## Parte 0 — sólo lectura

**Modelo: Sonnet. Effort: alto.** ⛔ **No editar. Reportar y parar.**

### 0.1 · ⭐⭐ La ventana, y el control son los siete

**Regla a implementar:** `[inicio_semana − 3 días, fin_semana − 3 días]`, filtrando por
**`Fecha de envío`**.

**El control, dado por el usuario.** Con la semana **28/08–03/09**, los siete encuentros que tienen
que entrar son:

| | fecha del encuentro |
|---|---|
| Sabor | 31/08 |
| Sánchez Zinny | 31/08 |
| Tapia | 03/09 |
| Seguridad en tu barrio · Comuna 1, 2 y 3 | 03/09 |
| **Mraida** | **04/09** |

⭐ **Y la relación entre los dos campos es definición del usuario, no algo a verificar:**

> **`Fecha de envío` está en la base y es tres días antes que la reunión.**

⇒ Por eso la ventana se desplaza `−3`: **filtra por el envío y trae los encuentros de la semana**.
`25/08–31/08` en envíos son los encuentros del `28/08` al `03/09`, y el envío de Mraida —encuentro
del **04/09**— cae el **01/09**, dentro de la ventana. **La regla y el ejemplo cierran.**

⭐ **Y la fecha que se MUESTRA también está en la base, dicho por el usuario:** la solapa trae la
fecha del encuentro como columna propia, y **se llama `Fecha`**. ⛔ **No se deriva sumando 3 al
envío** — derivar un dato que está en la base es la clase de atajo que se descubre roto seis meses
después, el día que un encuentro se mueva y el envío no.

⇒ **Las dos columnas hay que declararlas donde corresponde**, y eso es trabajo de este prompt, no
una observación: `MAPEO` para las dos —`Fecha` y `Fecha de envío`, **por letra y con su encabezado
real**— y `SOLAPAS` si le falta algo. ⚠ Al 26/08 esa solapa tenía `uso = fuente` y **cero campos en
`MAPEO`**, así que probablemente haya que declarar también todo lo que usen los otros nueve tokens.
⛔ **Verificá los nombres reales de las dos columnas contra la solapa viva antes de escribirlas:**
el usuario dice `Fecha` y `Fecha de envío`, y si el encabezado difiere en un espacio o un acento, lo
que se declare queda apuntando a la columna equivocada **sin fallar**.

⇒ **El control sigue siendo el mismo:** con la semana `28/08–03/09` tienen que entrar **esos siete
y no otros**. Si dan otro número, reportá cuántos y cuáles, y **no ajustes el desplazamiento para
que cuadre** — la regla ya está definida y un número distinto es un hallazgo, no un parámetro a
calibrar.

### 0.2 · La solapa, medida

Columnas **por letra**, `firma_encabezado`, cuántas filas, y qué campos están mapeados hoy — al
26/08, `reuniones | Agenda funcionarios` tenía `uso = fuente` y **ningún campo en `MAPEO`**.

Y contra eso, **los diez tokens uno por uno**: qué columna los daría, con qué operación, o ⛔ **no
hay columna que los dé**. ⚠ **Si un token no tiene fuente clara, se reporta como falta** — no se
resuelve con la columna que más se le parezca.

### 0.3 · `emin_lista` — plantilla, separador y una regla condicional

**Formato del usuario:** `figura (fecha)`, separadas por ` | `. Y **si el nombre es «seguridad en
tu barrio», se agrega el barrio.**

**El control es el ejemplo literal:**

```
Sabor (31/08) | Sánchez Zinny (31/08) | Tapia (03/09) | Seguridad en tu barrio en Comuna 1 (03/09) | Seguridad en tu barrio en Comuna 2 (03/09) | Seguridad en tu barrio en Comuna 3 (03/09) | Mraida (04/09)
```

⚠ **La fecha del ejemplo es la del ENCUENTRO, no la del envío** — es el mismo par de campos del
0.1. La lista muestra una y el filtro usa la otra.

⛔ **`LISTA_CRUDA` no alcanza, y ahora son tres motivos:** toma un solo campo, **deduplica**
—`Sánchez Zinny` saldría una vez donde hay dos— y no acepta plantilla. Acá además hay una **regla
condicional por nombre**.

⇒ Medir si alguna operación existente lo cubre. `FILA_TEXTO` y `GRUPO_TEXTO` aceptan plantilla pero
eligen **una** fila. Si hace falta algo nuevo, ⭐ **el precedente es el `2026-08-25_3`**, que agregó
`GRUPO_TEXTO` **compartiendo la rama entera** de `FILA_TEXTO` y declara que fue deliberado.

⚠ **La regla condicional es la parte cara:** decidir si vive en la operación —que la vuelve
específica de este caso— o si se resuelve en la fuente. **Reportá las dos con su costo, sin
elegir.** Si es código, es `R-20` y sale de este prompt.

**Reportar y parar.**

---

## Parte A — la propuesta

**Modelo: Opus. Effort: alto.** Diez números nuevos en un informe que ya se publica.

Las filas propuestas, **una por una y con su justificación medida**. Todas nacen con `_revisar`
(`D-56`) y con `informe_id = 'secco'`. Más el addendum al `_1` y la situación de `V-49`.

⛔ **No escribir.** El usuario aprueba antes.

## Parte B — aplicar

**Modelo: Sonnet.** Backup, **backup fallido aborta sin escribir**, relectura, banco con control
positivo y negativo con mutación. Commit propio.

⭐ **El control end-to-end son los siete y la lista literal de 0.3**, no una afirmación sobre la
forma.

---

# Bloque 2 · El caso de M2 en el CSV

**Modelo: Sonnet.** Commit propio, **separado del bloque 1**.

⭐⭐ **La ventana del caso es la semana del 21/08, NO la del 28/08.** El usuario verificó contra el
deck del equipo **en el momento en que se generó ese informe**, y el motor daba exactamente estos
valores. **Las bases se mueven**, así que hoy el motor publica otra cosa y **eso no invalida el
caso**: `D-56` dice que un caso es una comparación **fechada**.

⛔ **Esto ya se discutió y no vuelve a discutirse.** Una medición contra la corrida del 28/08 **no
es evidencia en contra** — es una comparación contra otra ventana.

**Los seis que se validan, estado `exacto`:**

| marcador | valor |
|---|---|
| `m2_mails_enviados` | 538.837 |
| `m2_mails_entregados` | 533.128 |
| `m2_aperturas` | 147.397 |
| `m2_or` | 28 % |
| `m2_clics` | 2.768 |
| `m2_ctor` | 2 % |

**Y dos que NO se validan y se quedan con su `_revisar`**, por decisión del usuario:

| marcador | valor de referencia |
|---|---|
| `m2_envios` | 16 |
| proyectos / campañas de M2 | 11 |

⚠ **Esos dos valores van en la nota del caso como referencia sin validar, no como caso aparte.**
Sirven para la próxima vez que alguien los mire; **no levantan ningún `_revisar`**.

Alta en `docs/casos_validacion_*.csv` con el próximo `V-` libre, lámina `L-038` / `L-014`, **ventana
declarada: semana del 21/08**, y la nota diciendo que sale del deck del equipo verificado por el
usuario en el momento de esa corrida.

**Y recién con el caso escrito**, los **seis** entran a `LEVANTAN_POR_CASO_` citándolo y se les
levanta el `_revisar`.

⚠ **Verificá cuál es el marcador de «proyectos»** antes de escribir la nota — `m2_campanias` cuenta
campañas distintas y su propia nota advierte que **no son envíos**. Si «proyectos» es otra cosa, **se
dice y no se asume**.
