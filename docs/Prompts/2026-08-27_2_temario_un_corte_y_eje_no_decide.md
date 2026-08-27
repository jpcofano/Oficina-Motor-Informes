# 2026-08-27_2 — El temario se parte en UN CORTE, y `eje` deja de decidir nada

**Estado:** ejecutado el 27/08/2026.

**Contexto.** El asistente falló en su primera corrida real y la causa medida no está en el
anclaje: **líneas que no son encuentros terminan como filas de `REUNIONES` con `eje` vacío**, y
`leerReuniones_` filtra `fila[eje] && esVerdadero_(mostrar)` — las dos condiciones. Una fila así se
tilda, se le escribe `mostrar='sí'` y **nunca llega al anclaje**. El mensaje de fallo culpa al
período, que es inocente. ⛔ Y el diagnóstico que existe para eso —`reunionesOcultasPorMostrar_`—
abre con `if (!fila[idx.eje]) return;`: **descarta sin contar exactamente la fila que causó el
fallo.**

⭐⭐ **El hecho de método.** Llegó el tercer temario real y no se parece a ninguno de los dos
anteriores:

```
25/08 · dos semanas    1) JM | Uno a uno en Parque Avellaneda 12/08 (pre + post)
27/08 · ejemplo        > Status Cercanía y M2 · 1) JM | … · > Campañas destacadas · > Otros temas
27/08 · REAL           Uno a uno en Coghlan (21/08)
                       Campaña Destacada
                       Operativo Movilidad Más Segura
```

⇒ **Ni `>`, ni `N)`, ni `|`, ni el plural son obligatorios.** Cualquier regla que exija uno de los
cuatro falla el lunes siguiente, y falla **escribiendo filas**, que es el modo caro.

**Las dos decisiones del usuario del 27/08:**

> **1 · El temario se parte en un corte posicional. Una línea, un ítem. Las de arriba son
> reuniones; la línea que anuncia las campañas corta; las de abajo son campañas.**
>
> **2 · `eje` deja de ser obligatorio y sale de la clave. El universo lo declara el TEMARIO, no el
> eje: ahí puede ir cualquier reunión.**

**Modelo por parte.** A: Sonnet, sin effort alto. **B, C y D: Opus, effort alto** — deciden qué
filas entran al informe. E, F, G, H: Sonnet. Ordenadas por sacrificabilidad: **B, C y D no se caen
nunca**; H y G caen primero.

---

## Parte A — verificar las premisas (Sonnet · SÓLO LECTURA · reportar y parar)

Ocho afirmaciones, cada una con el comando al lado. **A.7 y A.8 son gates: si alguna falla, parar.**

**A.1 — El partidor de hoy come el contenido cuando no hay marcas.** Correr
`partirTemarioEnBloques_` (`Campanas.gs`, es pura) contra el temario real del 27/08, textual:

```
Uno a uno en Coghlan (21/08)
Campaña Destacada 
Operativo Movilidad Más Segura
```

Medido fuera del repo el 27/08, **a verificar**: **3 bloques**, los tres `con_marca: false` y los
tres con `lineas: []`. Las tres líneas son títulos y **ninguna es contenido**.

**A.2 — Y el bloque de campañas no se reconoce en singular.** `normalizar_('Campaña Destacada')` da
`campana destacada`, `normalizar_(BLOQUE_CAMPANAS_)` da `campanas destacadas`, y
`esBloqueDeCampanas_` compara **por igualdad** → `false`. Reportar los dos valores.

**A.3 — ⭐ El separador ingenuo se dispara sobre una reunión.** En el ejemplo del 27/08 la línea
`4) M2 | Campañas y enviados de la semana` **contiene** «campañas» y es una reunión. Confirmarlo:
es lo que funda que en B **una línea con `|` nunca sea separador**.

**A.4 — La fecha entre paréntesis se pierde.** Correr `parsearLineaReunion_`:

| línea | medido el 27/08, a verificar |
|---|---|
| `JM \| Uno a uno en Coghlan (21/08)` | `fecha` **vacía** · `notas = "21/08 \| no se encontró fecha"` · `nombre = "en Coghlan"` |
| `JM \| Uno a uno en Coghlan 21/08` | `fecha = 2026-08-21` · `notas` vacía · `nombre = "Coghlan"` |
| `JM \| Uno a uno en Coghlan (21/08) (pre + post)` | `fecha = 2026-08-21` · `nombre = "Coghlan ("` |

⇒ el paréntesis final se extrae **antes** de buscar la fecha, y el recorte de la preposición vive
**dentro** de la rama `if (fecha)`, así que sin fecha tampoco hay limpieza de nombre.

**A.5 — Dónde se usa `REUNIONES.eje`.** Grepear todos los usos y clasificarlos. Medido fuera del
repo, **a verificar**: sólo el filtro de no-vacío (`leerReuniones_`, `reunionesOcultasPorMostrar_`),
`TIPO_AGREGADO_POR_EJE_`, `claveReunion_` y el `detalle` que pinta el panel. ⚠ **`parseado.eje` de
`Union.gs` NO cuenta**: ése es el eje geográfico del nombre de campaña, otra cosa. ⛔ Si aparece
cualquier otro consumidor, **parar y reportar**.

**A.6 — Los tres llamadores del partidor.** Reportar quién llama a `partirTemarioEnBloques_`, a
`cargarTemarioReuniones_` y a `cargarTemarioCampanas_` — incluidas la pantalla vieja de dos cajas y
el menú.

**A.7 — ⛔ GATE · la clave sin `eje` no puede colisionar.** Sobre **todas** las filas vivas de
`REUNIONES`, calcular `claveReunion_` **sin** el campo `eje` —`periodo_id + nombre + fecha +
etapa`— y reportar **cuántas claves distintas sobre cuántas filas**. Si hay colisión, **parar y
reportar cuáles**: sacar `eje` de la clave declararía duplicado un encuentro que no lo es, y el
dedupe lo saltearía en silencio. ⚠ Es el mismo gate que se corrió el 20/08 cuando se **agregó**
`etapa` a la clave, y ahí dio 13 sobre 13.

**A.8 — ⛔ GATE · `texto_original` sirve como reemplazo del filtro.** Sobre todas las filas vivas:
cuántas tienen `texto_original` vacío, y de ésas cuántas tienen `mostrar='sí'`. Reportar la lista.
⚠ El seed lo trae en las siete filas, así que se espera cero — **pero es la hoja viva la que
decide, no el seed.** Si hay filas con `mostrar='sí'` y `texto_original` vacío, el cambio de D las
haría entrar al informe y **parar** es lo correcto.

**A.9 — Estado de la hoja hoy.** Para `2026_agosto_21_27`: filas en `REUNIONES`, cuántas con `eje`
vacío, cuántas con `mostrar='sí'`, y el `texto_original` de las de `eje` vacío. Es lo que el usuario
borra a mano; sale en el reporte, no en un `cablear*`.

**Reportar y parar.**

---

## Parte B — un partidor ÚNICO, posicional (Opus · effort alto)

Una función **pura**, que recibe el pegado y devuelve:

```
{ reuniones: [linea], campanas: [linea], ignoradas: [ { texto, motivo } ] }
```

**El algoritmo, entero:** se recorren las líneas no vacías en orden, con un estado que arranca en
`reuniones`. Cada línea es **separador** o **ítem**; el ítem va al balde del estado actual.

| separador | condición | efecto |
|---|---|---|
| campañas | **no tiene `\|`** y su normalizado —sin `>` y sin `N)`— **empieza con `campan`** | el estado pasa a `campanas` |
| otros temas | **no tiene `\|`** y su normalizado empieza con `otros tema` | el estado pasa a `descartar` |

Un separador **no es un ítem**: va a `ignoradas` con motivo `separador`. Las líneas en estado
`descartar` van a `ignoradas` con motivo `bloque descartado`.

⭐ **La condición «no tiene `|`» no es un detalle de forma: es lo único que separa el separador de
una reunión.** Medido en A.3: `4) M2 | Campañas y enviados de la semana` es una reunión y empieza
con «Campañas» apenas se le saca el `N) M2 |`. ⚠ Declararlo en el comentario: **si un día llega esa
reunión sin `|`, corta.** Se acepta y se ve — la Parte F la muestra.

⚠ **`Otros temas` se agrega aunque el usuario no lo pidió**, y por qué: sin el corte, esas líneas
caen en el balde de campañas, y `cargarTemarioCampanas_` las escribe con `mostrar='sí'` (`AJ-1`) —
o sea que **nacen confirmadas y entran al deck si nadie las destilda**. Es el mismo mecanismo, dos
líneas de código. ⇒ Y cuando el encabezado **no viene** —el usuario declaró el 27/08 que no
siempre viene— eso pasa igual: se acepta, se dice, y **no se inventa una heurística de contenido
para adivinar dónde termina el bloque**.

### B.1 — Y lo usan los tres llamadores, no sólo el asistente

⛔⛔ **Hoy hay dos formas de decidir cuál es el bloque de campañas** —la del asistente y la de
`cargarTemarioCampanas_`, que parte por su cuenta— y **la segunda ya falla**: no reconoce el
singular (A.2). Dos formas de decidir lo mismo no fallan el día que difieren: **cargan otra cosa.**

⇒ `cargarTemarioReuniones_` y `cargarTemarioCampanas_` **siguen recibiendo el texto entero**
—contrato intacto, sin recortes armados por el llamador— y **parten con esta función**, cada uno
tomando su balde. `partirTemarioEnBloques_` y `esBloqueDeCampanas_` quedan sin llamador: se retiran.

⭐ Esto arregla de paso la pantalla vieja de dos cajas y el menú, que hoy fallan con el mismo
singular.

### B.2 — Los ejes agregados

Decisión del usuario del 27/08: `Ministros | …` y `M2 | …` **no son reuniones y se descartan**.
Vienen con `|`, así que el partidor los deja en `reuniones` y los saca **el cargador**, a
`ignoradas` con motivo `eje agregado`. Se apoya en A.5 y en `R-21` (no iteran `REUNIONES`).

⚠ **Es el único uso de `eje` que sobrevive**, y es de descarte, no de selección: `eje` decide qué
**no** entra, nunca qué entra. Dejarlo dicho en el comentario de `TIPO_AGREGADO_POR_EJE_`.

⛔ **No tocar los `SEED_` de `Instalar.gs`**: el seed dice qué había, esto dice qué escribe el
asistente de acá en adelante.

### B.3 — La identidad que fija el banco

**`líneas no vacías del pegado = reuniones + campañas + ignoradas`.** Ninguna línea puede
desaparecer del retorno. ⭐ Es un control **por identidad y no por constante**: no caduca cuando
cambie el temario.

---

## Parte C — el parser tolera lo que el temario real trae (Opus · effort alto)

Tres cambios sobre `parsearLineaReunion_`. **Ninguno adivina**: los tres recuperan un dato que la
línea trae y el parser tira.

**C.1 — Un paréntesis final que contiene una fecha ES la fecha.** Hoy el paréntesis se extrae antes
de buscar fecha y todo lo que no sea `pre`/`post` cae a `notas`. Nuevo orden: si el contenido parsea
como fecha, se usa como fecha; si es anotación de etapa, se descarta como hoy; si no es ninguna, va
a `notas` como hoy. ⚠ **Con dos paréntesis hay que reconocer los dos**: hoy sólo se mira el último,
y eso produjo `nombre = "Coghlan ("` (A.4).

**C.2 — El recorte del nombre sale de la rama `if (fecha)`.** La preposición inicial y el separador
se recortan siempre, haya fecha o no. Hoy una línea sin fecha deja `nombre = "en Coghlan"`, y ese
nombre viaja a la clave de confirmación del anclaje, a la etiqueta y a `FALTANTES`.

**C.3 — Sin `|` la línea es un encuentro igual, y `eje` queda VACÍO.** Es el temario de hoy:
`Uno a uno en Coghlan (21/08)` tiene tipo conocido y fecha, y el eje simplemente no viene.

⛔⛔ **No se completa con un default, y ésa es la decisión del usuario:** el universo del informe lo
declara **el temario** (`R-02`), no el eje. Un default —`JM`, el `informe_id`, lo que sea— sería un
dato inventado que además **entra en la clave de dedupe** y hace que la misma reunión pegada con y
sin `|` cuente como dos.

⇒ **`notas = 'no se pudo parsear'` deja de dispararse por falta de eje.** Se dispara cuando no hay
**ni tipo conocido ni fecha**, que es la condición que ya existe unas líneas más abajo y que sigue
siendo la correcta: ahí sí no hay con qué proponer nada.

---

## Parte D — `eje` deja de decidir qué entra al informe (Opus · effort alto)

⛔⛔ **Es el cambio más caro del prompt: toca el filtro que decide qué encuentros van al deck.**
Sólo se ejecuta si **A.7 y A.8 pasaron**.

**D.1 — `leerReuniones_`.** El criterio pasa de `fila[eje] && esVerdadero_(mostrar)` a
`fila[texto_original] && esVerdadero_(mostrar)`.

⭐ **Por qué `texto_original` y no otra cosa:** es lo único que **toda** fila de temario tiene por
construcción —el parser lo conserva siempre, incluso cuando no interpreta nada— y es exactamente lo
que hace de clave de curación en el paso 3. No es un campo nuevo ni una columna inventada: es el
registro de la línea que originó la fila. A.8 lo verifica contra la hoja viva antes de tocar nada.

**D.2 — `reunionesOcultasPorMostrar_` cambia con él.** Su comentario ya declara que su criterio es
**el mismo** que el de `leerReuniones_` a propósito: *un diagnóstico que filtre distinto del filtro
que explica nombra filas que el otro sí dejó pasar*. Si allá cambia, acá también — y lo dice el
propio comentario.

**D.3 — Y el filtro que descarta, cuenta.** Las filas que el criterio nuevo descarta —sin
`texto_original`— **se juntan y el mensaje de `anclarEncuentros` las nombra**, con la misma forma
que ya usa para las de `mostrar`: conteo y nombres, hasta seis. ⇒ **Es la tercera vez en dos
semanas que la misma figura cuesta una vuelta**: un filtro que descarta antes y no cuenta es
invisible, y el que sí cuenta se lleva la culpa. Un filtro nuevo nace contándose.

**D.4 — `claveReunion_` pierde `eje`.** Queda `periodo_id + nombre + fecha + etapa`. Gate en A.7.
⚠ El comentario de la función explica por qué `etapa` está en la clave; agregar por qué `eje` ya
no, citando la decisión del usuario del 27/08.

⚠ **La columna `eje` NO se borra de la hoja ni de los `headers`.** Sigue existiendo, se escribe
cuando el temario la trae, la muestra el panel en `detalle` y la lee `TIPO_AGREGADO_POR_EJE_`. Lo
que cambia es que **no decide**.

⛔ Y una consecuencia que hay que decir, no descubrir: **las filas rotas que hoy están en la hoja
con `eje` vacío pasan a poder entrar** si alguien las tildó. Por eso A.9 las lista y el usuario las
borra **antes** de la próxima corrida. Repetirlo en el reporte final.

---

## Parte E — bancos (Sonnet)

Sobre las funciones puras, sin planilla. **Los tres temarios reales son el banco**, y ninguno tiene
la misma forma:

1. La identidad de B.3 sobre los tres.
2. **27/08 real** — 1 reunión (`Uno a uno` · Coghlan · **21/08** · `eje` vacío), 1 campaña
   (`Operativo Movilidad Más Segura`), 1 ignorada (`separador`). ⭐ Es el caso que hoy da **3 filas
   rotas**.
3. **27/08 ejemplo** — `4) M2 | Campañas y enviados de la semana` **no corta** (A.3), y las dos
   líneas de *Otros temas* quedan ignoradas. Y **el mismo texto sin la línea `> Otros temas`**
   documenta qué pasa, sin fingir que da lo mismo.
4. **25/08** — sigue dando lo que ya daba. Control de no-regresión.
5. Las tres líneas de A.4, con su fecha y su nombre limpio.
6. `claveReunion_` sobre dos filas que difieren **sólo** en `eje`: **misma clave**. Es lo que hace
   que la misma reunión pegada con y sin `|` no se duplique.

⭐ Ningún banco fija una constante leída de la hoja viva.

---

## Parte F — el paso 3 muestra lo que ignoró (Sonnet)

`panel_asistenteCargarTemario` devuelve `ignoradas` y el paso 3 las lista **arriba**, con el
criterio que ese bloque ya usa: lo que cambia cómo se lee la lista de abajo va arriba, no al pie.
Cada una con su texto y su motivo. **Sin checkbox** — no son filas, no hay nada que confirmar.

⚠ Si no quedó ninguna línea de reuniones y hay `ignoradas`, el aviso lo dice explícitamente. No
inventar un modo degradado que cargue igual.

---

## Parte G — documentación (Sonnet)

- `docs/TEMARIOS_reales_2026-08-27.md`, congelado, modelo del `_2026-08-25`. Van **los dos** textos
  del 27/08, marcados: uno es **el temario real recibido**, el otro **un ejemplo que pasó el
  usuario**. Adentro, lo medido en A.1–A.4.
- `docs/PLAN.md`: **`D-45`** — *el temario se parte en un corte posicional* y **`D-46`** — *`eje` no
  decide qué entra al informe; el universo lo declara el temario*. Con los costos declarados (el
  separador sin `|`, el bloque descartado sin encabezado, y las filas viejas de D) y los dos gates
  de A. `D-46` cita `R-02` y **no** supersede `D-44`.
- `docs/REGLAS_NEGOCIO.md`: revisar si `R-02` necesita addendum fechado por `D-46`. Si no, decir por
  qué no.
- `docs/PENDIENTES_consistencia.md`: el filtro que descartaba sin contar, como caso de la familia de
  `CLAUDE.md` §4 — con la observación de que es **la tercera vez en dos semanas**.
- `docs/ESCRITORES.md`: el criterio nuevo de `leerReuniones_`.
- `docs/BITACORA.md` y `docs/HANDOFF_CODE.md`: la cola.

---

## Lo que este prompt NO hace

- **No limpia `REUNIONES`.** Las filas con `eje` vacío salen listadas en A.9 y las borra el usuario
  — y con D eso pasa de prolijo a **necesario**.
- **No borra la columna `eje`** de la hoja, de los `headers` ni de los seeds.
- **No cambia el criterio de `mostrar`** de ninguno de los dos cargadores.
- **No adivina dónde termina un bloque sin encabezado.**
- ⛔ **`--reintentar` no se usa en ninguna parte que escriba.**
