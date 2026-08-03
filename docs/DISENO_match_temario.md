# DISEÑO — Match por confianza entre el temario y las bases

> Repo: `docs/DISENO_match_temario.md` · 29/07/2026
> Surge de los comentarios cargados en `SECCO_marcada_info_informe.pptx`.
> Probado contra la semana real **24/07 → 30/07**.

---

## 1. Qué cambia

Los comentarios aportan la pieza que faltaba: **el temario de WhatsApp es la selección
humana**. Hasta ahora `CAMPANAS` iba a ser una checklist manual; con esto el insumo pasa
a ser el mensaje que ya se manda todas las semanas, y el motor propone el match.

La regla de oro del proyecto se extiende bien: *el sistema arma el informe, el equipo
escribe las conclusiones* → **el sistema propone el match, el equipo lo confirma.**

Lo probé sobre la semana real y **funciona, pero no por fecha**. Ver §4.

---

## 2. Lo que los comentarios resuelven de una

| Dato | Fuente | Impacto |
|---|---|---|
| **El período es de viernes a jueves** | comentario slide 1 | va a `CONFIG`. Semana de ejemplo: vie 24/07 → jue 30/07 |
| **La clave de join es `Id cuentas`** | comentario slide 12 | se obtiene en `CAMPAÑAS_DESGLOCE_DIGITAL` y filtra `Directa Mail`, IVR y Call Center |
| **Pre y post se distinguen por el nombre** | comentarios slides 5 y 6 | la que no dice nada es la PRE; la POST dice "Post" |
| **El tipo de mail de convocatoria** | comentario slide 12 | `tipo = convocatoria` |
| **Ministros es acumulado de la semana** | comentario slide 16 | 24/07 al 30/07 inclusive |
| **M2 tiene casos de borde en los días de corte** | comentario slide 18 | campañas que entran y salen el 23/07 y el 30/07 |
| **La slide 14 sobra** | comentario slide 14 | solo hay 2 post, la plantilla tiene 3 |

Ocho comentarios más dicen "a definir": slides 8, 19, 21, 22, 23, 27, 29, 30, 31, 32.
Esos siguen siendo `«FALTA:token»` y está bien que así sea.

---

## 3. Verificación del match sobre la semana 24–30/07

Universo de candidatos: `CAMPAÑAS_DESGLOCE_DIGITAL`, filtrado a julio.

| # | Ítem del temario | Fila en la base | Id cuentas | ¿match? |
|---|---|---|---|---|
| 1 | JM \| Uno a uno en **San Cristóbal 23/07** (pre) | `Agenda con 1 - 1 A 1 - San Cristobal - 24/7` | 3354-JULJDGAG | ✅ por nombre |
| 1b | ídem (post) | `Agenda Post con 1 - 1 A 1 - San Cristobal - 24/7` | **3354-JULJDGAG** | ✅ mismo id |
| 2 | JM \| Uno a uno en **Retiro 24/07** (pre) | `Agenda con 1 - 1 A 1 - Retiro - 23/7` | 3346-JULJDGAG | ✅ por nombre |
| 2b | ídem (post) | **no existe** | — | ❌ |
| 3 | JM \| Primera Persona **con Pareto** 27/07 | `RDV Agenda  con 1 - Primera Persona 27/7` | 3289-JUNJDGAG | ⚠ nombre parcial |
| 4 | JM \| Encuentro Temático **Orden Público 28/07** | `Agenda RDV Con 1 - Orden Público Eje Norte 28/7` | 3387-JULJDGGC | ⚠ hay distractor |
| 5 | Ministros \| Reuniones de la semana | 10 filas `RDV Ministros con N - Comuna X - DD/M` | varios | ⚠ es una clase, no un ítem |

---

## 4. Las dos trampas (esto define el diseño)

### 4.1 La fecha engaña en unos casos

San Cristóbal y Retiro **tienen las fechas cruzadas** entre el temario y la base:

| | temario | nombre en la base |
|---|---|---|
| San Cristóbal | 23/07 | …San Cristobal - **24/7** |
| Retiro | 24/07 | …Retiro - **23/7** |

Los comentarios lo explican: las dos reuniones se movieron y **el nombre de la campaña
quedó con la fecha vieja**. Si el match usara la fecha como criterio fuerte, asignaría
cada encuentro al otro. El nombre del barrio es lo que salva el match.

### 4.2 La fecha es imprescindible en otros

Hay **dos** campañas de Orden Público con el mismo nombre:

- `Agenda RDV Con 1 - Orden Publico Eje Norte 21/7` (3347) — la reunión del 21/07 figura
  **Suspendida** en RDV
- `Agenda RDV Con 1 - Orden Público Eje Norte 28/7` (3387) — la que va al informe

Acá el nombre no alcanza y la fecha es lo único que desempata. Y de paso: una escribe
"Publico" y la otra "Público".

**Conclusión:** ni el nombre ni la fecha funcionan solos, y cuál manda cambia según el
caso. Por eso el score con confirmación humana es el diseño correcto, no un atajo.

---

## 5. Hallazgo estructural: `Fecha inicio` no es la fecha del encuentro

`Fecha inicio` de la campaña digital es el arranque de la **pauta de convocatoria**, que
va varios días antes del encuentro:

| campaña | fecha en el nombre | `Fecha inicio` | diferencia |
|---|---|---|---|
| Orden Público Eje Norte 28/7 | 28/07 | 21–22/07 | −6 días |
| RDV Ministros con 17 - Comuna 14 - 30/7 | 30/07 | 27/07 | −3 días |
| San Cristobal - 24/7 | 24/07 | 16–17/07 | −7 días |

**Filtrar la ventana del período por `Fecha inicio` devuelve la semana equivocada.** La
fecha del encuentro está adentro del string del nombre, no en una columna.

Hay dos salidas y conviene la segunda:

1. Parsear la fecha del nombre — frágil (formatos `28/7`, `20/7 ` con espacio, tildes).
2. **Anclar en RDV**, que sí tiene columna `FECHA` real y confiable, y usar el digital
   solo para las métricas una vez resuelto el `Id cuentas`.

Verificado en RDV: `23/07 · Jorge Macri · San Cristóbal · 1 a 1 · Realizada · insc 138 ·
asist 9` y `24/07 · Jorge Macri · Retiro · 1 a 1 · Realizada · insc 98 · asist 10`. Las
fechas de RDV coinciden con el temario, no con los nombres de las campañas.

⚠ Ojo: RDV no tiene cargadas filas posteriores al 25/07 al momento de esta revisión.
El Orden Público del 28/07 no aparece. Si el motor ancla en RDV, depende de que esté
cargada a tiempo.

---

## 5 bis. Regla de anclaje en RDV

**Regla fijada:**

1. La hoja ancla es **`RVD JM-CM - ES`**.
2. Se filtra siempre por **`STATUS REUNIÓN = Realizada`**.
3. La columna **`FECHA`** de esa hoja es la fecha definitiva y **le gana** a la fecha que
   figura en el nombre de la campaña digital.

El motivo es el modelo de carga: la campaña digital se crea con un **nombre genérico**
antes de que se sepan los detalles (`RDV Ministros con 17 - Comuna 14 - 30/7`), y recién
después se vuelca la información real en RDV — la comuna pasa a barrio y "ministros"
pasa a una persona concreta. El nombre de la campaña es el borrador; RDV es el dato.

### Verificado con la base actualizada

Con RDV al día, los cuatro ítems JM del temario aparecen y el anclaje funciona:

| fecha | figura | barrio | evento | estado | insc | asist |
|---|---|---|---|---|---|---|
| 23/07 | Jorge Macri | San Cristóbal | 1 a 1 | Realizada | 138 | 9 |
| 24/07 | Jorge Macri | Retiro | 1 a 1 | Realizada | 98 | 10 |
| 27/07 | Jorge Macri | Villa Urquiza | Encuentro "Primera Persona" con Paula Pareto | Realizada | 1.344 | 267 |
| 28/07 | Jorge Macri | Belgrano | Encuentro Temático "Orden Público" – Eje Norte | Realizada | 753 | **vacío** |

Además el `EVENTO` de RDV se parece **más** al temario que el nombre de la campaña
digital: "Encuentro Temático Orden Público" contra `Agenda RDV Con 1 - Orden Público Eje
Norte 28/7`. Conviene puntuar la similitud contra `EVENTO` + `Barrio` de RDV, y usar el
nombre digital solo para llegar al `Id cuentas`.

### Dos límites de la regla

**a) `Realizada` no garantiza que el dato esté completo.** Orden Público 28/07 está
Realizada con 753 inscriptos y **`Asistentes` vacío**. El motor tiene que emitir
`«FALTA:ecv_asistentes»` sin abortar la slide.

**b) Los encuentros de ministros no están en la hoja ancla.** En la ventana 24–30/07,
`RVD JM-CM - ES` tiene 3 filas que no son de JM (Mraida y Sánchez Zinny "en agenda",
Muzzio del 24/07), mientras que el digital tiene ~10 campañas `RDV Ministros con …` para
esa semana. Con la regla tal cual, el bloque de Ministros queda casi vacío.

Están en **`RDV_otros_ministros`**, que sí está viva (fechas hasta 01/08/2026) y trae la
comuna en el formato que usa el digital:

| fecha | funcionario | comuna | estado | insc | asist |
|---|---|---|---|---|---|
| 28/07 | Ricardes Gabriela Barbara | C8 | Realizada | 38 | 5 |
| 28/07 | Gonzalez Bernaldo De Quiros Fernan | C1 | Realizada | 153 | 49 |
| 30/07 | Gimenez Horacio Alberto | C12 | Programado | — | — |
| 30/07 | Piñeiro Maximiliano Hernan | C14 | Programado | — | — |

El join con el digital es **comuna + fecha**, y cierra: `Comuna 8 - 28/7` → C8 28/07,
`Comuna 1 - 28/7` → C1 28/07, `Comuna 12/14/15 - 30/7` → C12/C14/C15 30/07.

⚠ Tres diferencias de esa hoja respecto de la ancla:

- El vocabulario de estado es **`Realizada` / `Programado`**, no "en agenda" / "Suspendida".
- Los **encabezados están corridos una columna** respecto de los datos: el header dice
  `Inscriptos` en la posición donde el dato trae el estado. Leer por nombre de columna
  devuelve todo mal.
- Los nombres van como "Apellido Nombre" y sin tildes (`Gimenez Horacio Alberto`), contra
  "Horacio Giménez" en la hoja ancla.

**c) Donde las dos hojas se pisan, gana la ancla.** Primera Persona del 27/07 figura con
267 asistentes en `RVD JM-CM - ES` y 269 en `RDV_otros_ministros`. Y el 1 a 1 de Retiro
tiene inscriptos y asistentes en la ancla y vacíos en la otra. La regla de usar la ancla
para JM queda confirmada por los datos.

---

### Regla de cascada (definitiva)

1. Se filtra por **`STATUS REUNIÓN = Realizada` primero**; recién después se elige la solapa.
2. Si en `RVD JM-CM - ES` no hay fila Realizada para ese encuentro, se cae a
   **`RDV_otros_ministros`**.
3. El resto de las solapas del archivo se ignoran, incluida `Funcionarios  Ministros`
   (última fecha: agosto 2025).
4. Clave de deduplicación entre solapas: **fecha + persona canónica**.
5. Cuando la ancla diga `en agenda` y la otra solapa diga `Realizada` con datos, el
   motor **lo reporta en el diagnóstico**. Es falta de actualización de RDV, y si se
   resuelve en silencio el problema deja de verse y la base no se corrige nunca.

### Equivalencias de personas

Los nombres se escriben distinto en cada solapa. Normalizando acentos y mayúsculas, y
comparando el nombre como **conjunto de palabras** (así `JORGE MACRI` = `MACRI JORGE`),
quedan **17 personas a partir de 34 escrituras**.

Semilla generada en **`docs/PERSONAS_equivalencias.csv`**, con columnas
`nombre_canonico · variante · solapas_donde_aparece`. Va a una solapa nueva de la
planilla de control.

Reglas de agrupación:

- Dos palabras en común, o que un nombre esté contenido en el otro → misma persona.
- **Una sola palabra en común → nunca se une solo.** Hay pares que la comparten y son
  personas distintas: `GABRIEL MRAIDA` / `GABRIEL SANCHEZ ZINNY`, `HERNAN LOMBARDI` /
  `PINEIRO MAXIMILIANO HERNAN`, `BAISTROCCHI IGNACIO MIGUEL` / `MERCEDES MIGUEL`.
- Las celdas con varios funcionarios separados por coma se parten antes de comparar
  (el encuentro de Eje Sur del 29/07 trae tres).

Dos casos se resolvieron a mano porque son errores de tipeo, no de acentuación:

| variante mal escrita | canónico |
|---|---|
| `FERMIN QUIROS` | `FERNAN QUIROS` |
| `RUTH LANDRECHE` | `RUTH LANDERRECHE` |

---

## 6. Diseño propuesto

### 6.1 Entrada

El texto del temario, pegado tal cual en una celda o en un cuadro del panel. No hace
falta formato: los ítems vienen numerados y con `|` como separador de familia.

### 6.2 Parseo del ítem

De `JM | Uno a uno en San Cristóbal 23/07 (pre + post)` se extrae:

- `familia` = JM · `tipo` = uno a uno · `entidad` = San Cristóbal
- `fecha_declarada` = 23/07 · `variantes` = [pre, post]

### 6.3 Señales de score

| señal | peso | nota |
|---|---|---|
| entidad (barrio / comuna / tema) presente en el nombre de la campaña | **alto** | es lo que salvó San Cristóbal y Retiro |
| similitud del nombre normalizado | alto | sin tildes, sin dobles espacios, tokens ordenados |
| tipo de evento compatible | filtro | 1 a 1 / Ministros / Temático / Primera Persona |
| proximidad de fecha (±7 días) | **medio, nunca excluyente** | desempata Orden Público 21/7 vs 28/7 |
| marca `Post` en el nombre | desempate | dentro del mismo `Id cuentas` |

### 6.4 Bandas

- **≥ 0,85** → se propone marcado como alto, igual se confirma
- **0,60 – 0,85** → se propone con los candidatos alternativos al lado
- **< 0,60** → no se propone; buscador manual
- **empate técnico** (dos candidatos a menos de 0,05) → nunca se elige solo

**Ningún match se aplica sin confirmación humana.** El costo de un match errado no es un
número mal: es un encuentro entero atribuido a otro barrio.

### 6.5 Salida

El match confirmado se persiste en `CAMPANAS` con el **`Id cuentas` como clave
durable**. A partir de ahí todo lo demás (digital, mail, IVR, call center) joinea por
ese id, tal como dice el comentario de la slide 12. Si la semana siguiente vuelve el
mismo encuentro, el match ya está resuelto.

---

## 7. Lo que este enfoque no resuelve

1. **"Ministros | Reuniones de la semana" no es un ítem, es una clase.** Necesita una
   regla aparte: anclar en `RDV_otros_ministros` y joinear por **comuna + fecha** contra
   las campañas `RDV Ministros con …` (§5 bis b). No pasa por el match de nombre.
2. **La post de Retiro no existe** en la base al momento de la revisión. El motor tiene
   que poder emitir la pre sin la post.
3. **San Cristóbal 23/07 cae fuera de la ventana** vie 24 → jue 30, y sin embargo está
   en el temario. Confirma que **la selección la hace el temario, no la fecha**: la
   ventana sirve para calcular métricas, no para elegir qué entra al informe.
4. Los 10 comentarios "a definir" siguen sin fuente.

---

## 8. Dónde entra en la secuencia de pasos

Esto **no** reemplaza los pasos 1.9 → 3. El motor primero tiene que leer, calcular y
pintar con un `Id cuentas` puesto a mano. El match por confianza es la capa que
**automatiza el llenado de `CAMPANAS`**, y encaja naturalmente en la etapa de panel
(pasos 6–9).

Recomendación: seguir con 1.9 y el corte vertical, y dejar esto documentado. Si se
adelanta el match antes de tener el corte de punta a punta, se corre el riesgo de tener
un matcher fino alimentando un motor que todavía no pinta una slide.

---

## 9. Addendum (Paso 2.6, 30/07/2026) — `digital / RDV JM 2 VECES` es el conjunto de control

> Este doc quedó "congelado" tras la verificación de la semana 24–30/07 (§9 de
> `PROYECTO.md`). Esta sección se agrega al final, sin tocar lo de arriba, porque el
> relevamiento de solapas del Paso 2.6 (`docs/Prompts/Paso-2.6_registro_solapas.md`
> Parte F) encontró una pieza que corresponde directamente a este diseño.

La solapa `RDV JM 2 VECES` de la base `digital` (37 filas) tiene este encabezado:

`Funcionario | Barrio | Fecha | Estado | Enviados | Entregados | Aperturas | % OR |
Clics | % CTOR | Habitantes | Alcance manual | Alcance potencial | % Cobertura |
Frecuencia Meta | Impresiones Totales | Impresiones Social | Impresiones Google |
Impresiones Programm | Clics | % CTR | Base total | Base discada | Contactados |
% Cont. | Efectivos | % Efect. | Audiencia | Llamados realizados | Llamados atendidos |
% Atendidos | Escucharon +75% | % Escucha +75% | Marque 1`

Eso es **exactamente la salida que el Paso 2.4 intenta construir**: un encuentro con
todos sus canales al lado (RDV + digital + mail + IVR + call center). Alguien del equipo
ya lo armó a mano, probablemente como el mismo tipo de verificación manual que dio
origen a este documento (§0).

**No se mapea** — registrada en `SOLAPAS` con `uso=referencia`, no `fuente`. Sirve para
dos cosas, ninguna de las cuales pasa por leerla en una corrida normal:

1. **Es el test del anclaje.** Correr `anclarEncuentros()` (`Union.gs`, Paso 2.4) sobre
   esos 37 encuentros y comparar el resultado contra el link que ya hizo una persona acá.
   Es la única validación real que existe hoy del scoring y del umbral 0,6 de §6.4 —
   mucho mejor que mirar cuántos casos caen en `bajaConfianza` sin saber si el resto está
   bien.
2. **La clave del match humano es `(Funcionario, Barrio, Fecha)`, no `Id Cuentas`**: la
   tabla no tiene columna de cuenta. El scoring de `Union.gs`/`anclarEncuentros()` (§5
   bis, §6.3 de este doc) usa señales de entidad/similitud/fecha — vale contrastar esas
   señales contra esta clave de tres campos antes de asumir que el diseño actual las
   captura todas.

> ⚠ **INVÁLIDA como conjunto de control (Paso 2.9 Parte C.4, 31/07/2026).** El punto 1
> de arriba está descartado: `RDV JM 2 VECES` es **texto pegado a mano**, una foto del
> link `(Funcionario, Barrio, Fecha)` tomada en un momento dado — no datos vivos, no una
> fórmula que se pueda re-derivar. No sirve para "correr `anclarEncuentros()` y comparar"
> porque no hay forma de saber contra qué corrida de las bases se armó esa foto, ni de
> reproducirla. `SOLAPAS` corrigió la nota de esta solapa en consecuencia
> (`corregirNotaControlAnclaje_()`, Instalar.gs): sigue en `uso=referencia`, ya no dice
> "usar para validar el scoring/umbral 0.6". El punto 2 (la clave de tres campos) sigue
> siendo información válida — no depende de que la tabla esté viva, solo de qué columnas
> tiene.

---

## 10. Addendum (Paso 2.16, 02/08/2026) — las tres bandas de §6.4 contra el código: gana el código

> Segundo addendum, mismo criterio que el §9: no se toca nada de lo de arriba. Se agrega
> porque al revisar el match para `R-12` apareció una **discrepancia entre este diseño y
> el código vivo**, y la decisión que la cierra es del usuario (02/08/2026).

**La discrepancia.** §6.4 declara **tres** bandas; `Union.gs` implementa **dos**, con un
solo umbral (`CONFIG.umbral_anclaje_reunion`, hoy `0.6`):

| §6.4 dice | el código hace |
|---|---|
| `≥ 0,85` → se propone como alto, **igual se confirma** | no existe esa banda: todo lo que pasa el umbral entra directo |
| `0,60 – 0,85` → se propone con los alternativos al lado | `!pasaUmbral` → `pendiente`, va a `bajaConfianza` y registra los `top3` |
| `< 0,60` → no se propone, buscador manual | ídem anterior (una sola rama por debajo del umbral) |

**Decisión: gana el código.** Por encima del umbral **se acepta solo**, sin confirmación.
La frase de §6.4 *"ningún match se aplica sin confirmación humana"* queda acotada a lo que
el código sostiene hoy: **por debajo del umbral no se elige nunca en silencio** —se le
presentan los candidatos a la persona, que es lo que importaba—, pero por encima no se
pide confirmación.

**Lo que sigue sin implementar, y queda como pendiente, no como resuelto:** el **empate
técnico** de §6.4 —dos candidatos a menos de 0,05 no se eligen solos— **no está en ninguna
parte del código**. Con el diseño de dos bandas, dos candidatos empatados apenas por
encima del umbral se resuelven eligiendo el primero. Anotado en
`docs/PENDIENTES_consistencia.md`.
