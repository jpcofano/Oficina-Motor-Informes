# `_18` · Los encabezados de `looker`, antes de decidir el join

> **Modelo: Opus, effort alto.** **Sólo lectura, de punta a punta. Termina en reportar y parar.**
> No escribe `MAPEO`, ni `SOLAPAS`, ni `BASES`, ni ninguna hoja. No cablea ningún marcador.

---

## Por qué existe este prompt

La Parte B del `2026-08-09_1` quedó bloqueada por tres cosas: `looker/DIGITAL` y `looker/Cuentas`
sin `MAPEO`, sin `fecha_periodo`, y sin capacidad de join. **Las tres son ciertas. Pero las tres
suponen que la Parte B necesita `looker/DIGITAL`, y eso no está verificado.**

`looker` **sí tiene `MAPEO`** —unas 28 filas—, y todas apuntan a **`resumen_metricas_dinamico`**,
que es la fuente declarada de la base por `S-01`. Esa solapa ya tiene `fecha_periodo` mapeada, ya
tiene `campana`, `eje` y `area`, y **ya tiene un campo de impresiones digitales**. `DIGITAL` y
`Cuentas` son otras dos solapas de la misma base, y nunca tuvieron `MAPEO` porque la decisión fue
que las métricas de `looker` salen de la dinámica y de ningún otro lado.

**Entonces la pregunta no es cómo destrabar `DIGITAL`. Es qué parte de la Parte B se resuelve sin
salir de la solapa que ya está mapeada, leíble y con período.** Lo que la dinámica no puede dar es
el **desglose por plataforma** —Meta, Google, Programmatic—, y eso es lo único para lo que
`DIGITAL` sería necesaria, porque tiene `Plataforma` e `Impresiones` juntas.

Y para el corte JM vale lo mismo: `DIGITAL` necesita `Cuentas` **para una sola cosa, saber qué
filas son JM**. Si la columna que distingue ya está en la propia solapa, el corte se expresa con
`filtro` y el operador `~=` que se construyó el 08/08, **y no hace falta ninguna capacidad
nueva**. El precedente existe en otra base: `digital/CAMPAÑAS_DESGLOCE_DIGITAL` tiene una columna
`JM | GCBA | POLICIA` que hace exactamente eso.

Diseñar un join es un prompt grande. La medición que dice si hace falta es de una pasada.
**Precedente: las tres veces que se mandó a medir en vez de decidir, el número cerró la pregunta
solo, y dos de las tres alarmas eran del coordinador y eran infundadas.**

**Lo que este prompt no hace, y hay que decirlo porque la tentación está:** no compara ningún
total con un número publicado. Ni con `716.650`, ni con `531.403`, ni con `5.194.898`. **Code
audita forma, no valores.** Si la medición sugiere una respuesta a `X-16`, se anota como
observación y se para; el número lo cierra la rama de validación con caso numerado.

---

## `0.0` · Primero: qué de la Parte B ya es alcanzable

Sobre **`looker/resumen_metricas_dinamico`**, que ya está mapeada y ya tiene `fecha_periodo`:

- Confirmar contra la hoja viva que las filas de `MAPEO` de `looker` apuntan ahí y que las
  columnas declaradas son las que dicen ser. **El `MAPEO` es una declaración; que la columna `H`
  siga siendo la que se mapeó es una medición.**
- **Token por token de la Parte B**, decir cuál de estas tres es: (a) alcanzable hoy con la
  dinámica sola; (b) necesita el desglose por plataforma, o sea `DIGITAL`; (c) necesita otra cosa,
  y cuál.
- Si la dinámica tiene una columna de **nombre de campaña o eje** que distinga JM: sus valores
  distintos con conteos, y cuántas filas contienen `JM` con la semántica de `~=`. **La comparación
  es sensible a mayúsculas** —medido el 09/08, 594 de 594—, así que si hay variantes de escritura,
  reportarlas: son la diferencia entre un filtro que anda y uno que devuelve un número plausible
  de menos.

**Si `0.0` alcanza para la mitad de la Parte B, esa mitad se destraba sin tocar nada más.** El
resto del prompt sigue valiendo para la otra mitad.

---

## `0.1` · Los encabezados, tal cual están

Para **`looker/resumen_metricas_dinamico`**, `looker/DIGITAL`, `looker/Cuentas` y `looker/CC`,
leyendo desde la `fila_encabezado` declarada en `SOLAPAS`:

- la lista completa de encabezados, **en orden y con su letra de columna**;
- cuántas filas de datos tiene cada una, y **cómo se contó** — el precedente de `M2 periodo
  DIRECTA` está escrito: `getDataRange()` lee las filas de relleno de fórmula como `""` e infla
  el conteo. Si el conteo de acá no coincide con el `filas_datos` de `SOLAPAS`, eso es hallazgo;
- cuáles de esos encabezados **ya tienen fila en `MAPEO`** y cuáles no.

---

## `0.2` · El corte JM — la regla ya está dada, falta medir sus bordes

**El usuario la fijó el 10/08 y no es una hipótesis de este prompt:**

> **El corte JM/GCBA de `looker` está en el nombre de la campaña.** Si el nombre contiene `JM`,
> la fila es JM. **Todo lo demás es GCBA**, por negación.

Ejemplo dado: `PRIMERA PERSONA | JM | PAULA PARETTO 27/7`. El nombre viene en segmentos separados
por ` | ` y `JM` es uno de esos segmentos.

**Eso es expresable con lo que ya existe**: `campana~=JM` y su negado `campana!~=JM`, el operador
que se construyó el 08/08. **No hace falta join para el corte.**

Lo que este prompt mide son **los bordes**, que es donde una regla así se rompe en silencio:

- **Cuántas filas contienen `JM`** con la semántica de `~=`, y cuántas no. Los dos números tienen
  que sumar el total.
- **Falsos positivos:** filas donde `JM` aparece **dentro de otra palabra o de otro segmento**, y
  no como segmento propio. Reportarlas enteras, no contarlas. Si hay cero, decirlo — un cero
  medido es lo que deja usar `~=` sin culpa.
- **Variantes de escritura:** `jm`, `Jm`, con espacios de más, con otro separador. **La
  comparación es sensible a mayúsculas** —medido el 09/08, 594 de 594—, así que una sola fila en
  minúscula se va a GCBA sin avisar. Reportar los segmentos distintos que aparecen en la posición
  donde suele ir `JM`.
- **Filas sin nombre de campaña, o con el nombre vacío.** No caen en JM ni en GCBA: caen en
  ninguno, y por la regla de negación terminarían contadas como GCBA. **Nombrarlas.**
- Y el control que cierra: **JM + GCBA = total de filas**, sin solapamiento y sin resto.

**Si los bordes salen limpios, la salida de este prompt incluye escribir la regla como `R-23`** en
`REGLAS_NEGOCIO.md`, con la medición al lado y con el ejemplo del usuario textual. Escribir un
`.md` no es escribir una hoja: sigue sin cablearse ningún marcador acá.

**Y una acotación que la regla necesita para no viajar más lejos de lo que se midió:** vale para
`looker`. El corte JM/GCBA en Mail, SMS y CC **se resuelve por otros campos** y ésos no están en
esta base. No extender la regla a lo que no se midió.

---

## `0.3` · El período — la dinámica ya lo tiene, las otras dos no

**Confirmado por el usuario el 10/08:** `resumen_metricas_dinamico` tiene `fecha_inicio`,
`fecha_fin` e `id_cuenta`. Y `MAPEO` ya declara `fecha_periodo` sobre esa solapa. **La disyuntiva
del `1.3` —elegir período o pasar la base a `snapshot`— no aplica a la dinámica: aplica a
`DIGITAL` y `Cuentas`, y sólo si `0.0` muestra que hacen falta.**

Lo que hay que medir igual, porque está mapeado y nadie lo verificó contra la hoja viva:

- **Qué columna es `fecha_periodo` hoy**, su tipo real de celda (`Date`, número, texto), cuántas
  vacías, mínimo y máximo. **`Base enviada` de `looker/CC` llega como serial de Excel mal
  formateado** y es el precedente de por qué el tipo se mide y no se supone.
- **Que sea `fecha_inicio` y no `fecha_fin`**, y cuántas filas de la ventana entran con una y con
  la otra. No para elegir —eso ya está elegido y respaldado por `S-02` y por
  `FECHAS_seleccion.md`— sino para saber cuánto se juega en esa elección.
- **Un riesgo conocido, para dimensionar y no para resolver acá:** una campaña digital arranca
  días antes del encuentro al que corresponde. Filtrar por `fecha_inicio` contra una ventana
  viernes–jueves puede dejar afuera campañas cuyo encuentro sí cae adentro. **Reportar cuántas
  filas caen en ese hueco** con la ventana en curso. Si son cero, la pregunta se cierra sola; si
  no, es un pendiente con número, que vale más que un pendiente sin él.

Para `DIGITAL` y `Cuentas`, si `0.0` las deja en juego: **toda columna con pinta de fecha**, con
nombre, tipo, vacías, mínimo y máximo, **todas y sin preseleccionar**. La detección es automática
y la elección es humana — el criterio está escrito en `Fuentes.gs` y respaldado por `S-02`. Y para
el otro lado de la disyuntiva: **¿esas solapas acumulan o se pisan?** Si cada corrida del reporte
de origen agrega filas, `snapshot` publicaría el histórico entero. Reportar qué muestran los
datos, sin concluir.

---

## `0.4` · Si el join hace falta igual, cuánto pesa

Sólo si `0.2` da que no. Medir, sin escribir:

- cuántas filas de `looker/DIGITAL` tienen un `id_cuenta` no vacío;
- cuántas de ésas **matchean** una fila de `looker/Cuentas`, y cuántas quedan huérfanas;
- si `id_cuenta` es **único** en `Cuentas` o hay repetidos. Un repetido convierte el join en una
  multiplicación de filas, y ése es el modo de falla que hay que conocer **antes** de diseñar la
  capacidad, no después;
- si el mismo par de columnas resuelve también `looker/CC` × `looker/Cuentas`, que es el bloqueo
  ya anotado de `R-15 Addendum 2`. **Si son el mismo join, es una capacidad y no dos.**

---

## Cierre

**Reportar y parar.** El reporte va a `BITACORA.md` con fecha y hora de lectura, y las preguntas
abiertas que queden a `PENDIENTES_consistencia.md`.

Cuatro salidas posibles, y conviene nombrarlas para que el reporte diga cuál fue:

0. **Parte o toda la Parte B sale de `resumen_metricas_dinamico`**, que ya está mapeada, es
   leíble y tiene período → eso se destraba solo, y los bloqueos quedan acotados a lo que
   realmente necesite el desglose por plataforma.
1. **El corte JM se expresa con `filtro`** → lo que falte se destraba mapeando campos, sin
   capacidad nueva.
2. **Hace falta join, y `0.4` lo dimensionó** → prompt propio de diseño, con los números adentro.
3. **`looker` no se puede leer hasta resolver el período de las solapas nuevas** → la decisión
   del `1.3` pasa a ser lo único que bloquea, y sólo para esas solapas: la dinámica ya tiene su
   `fecha_periodo`.
