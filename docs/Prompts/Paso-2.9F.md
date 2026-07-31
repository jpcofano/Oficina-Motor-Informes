# Paso 2.9F — Anclaje: filtrar, parecer, confirmar

> Cómo el motor decide qué fila de datos corresponde a cada reunión y a cada campaña.
> Leer antes: `docs/GRANO_TEMPORAL.md`.
> Trabajamos en español.

## El algoritmo

Es el mismo para los dos casos, cambia sólo el filtro previo:

| | reunión | campaña |
|---|---|---|
| **1. filtrar candidatos** | por **fecha** del encuentro | por **semana** del período |
| **2. matchear** | nombre más parecido | nombre más parecido |
| **3a. confianza alta** | pasa sola | pasa sola |
| **3b. confianza baja** | **pregunta al usuario** | **pregunta al usuario** |

## La distinción que hay que sostener

**El filtro de fecha reduce los candidatos. No selecciona las filas que se agregan.**

Una vez identificada la campaña, sus valores acumulados se toman **completos**, aunque
vengan de días fuera de la semana. La campaña que sostiene un Uno a uno del 24/07 corrió
antes; su total es el total.

Confundir las dos cosas produce números bajos sin ningún error visible. Es el motivo por
el que `GRANO_TEMPORAL.md` existe.

## Tarea

### 1. `anclar_()` — una sola función, dos configuraciones

Recibe: la lista de candidatos ya filtrada, el nombre a buscar, y el umbral.
Devuelve: el mejor candidato, su puntaje, y si supera el umbral.

No dupliques la lógica para reuniones y campañas. Lo único distinto es cómo se arma la
lista de candidatos.

### 2. El umbral sale del código

Hoy `0.6` está hardcodeado. **Va a `CONFIG`**, como fila propia. Si hace falta un umbral
distinto para reuniones y para campañas, que sean dos filas — pero que las dos vivan en
`CONFIG`.

### 3. Rastro mientras corre, no al final

`menuProbarUnionYAnclaje_` murió por el límite de 6 minutos y **se perdió todo** porque
el `alert` era lo último que ejecutaba. De ahí el "no hizo nada".

Escribí las marcas de tiempo y los resultados parciales **a medida que avanza**, no al
terminar. Si se corta, tiene que quedar lo que alcanzó a hacer.

### 4. Lo que no supera el umbral se pregunta

Los candidatos con confianza baja van a una hoja `ANCLAJE_PENDIENTE` con:

| columna | contenido |
|---|---|
| `reunion` o `campana` | qué se estaba buscando |
| `nombre_buscado` | el texto original |
| `candidato_1` … `candidato_3` | las tres mejores opciones |
| `puntaje_1` … `puntaje_3` | sus puntajes |
| `elegido` | **vacío — lo completa la persona** |

**El motor no elige por debajo del umbral.** Deja el hueco y sigue. Un token sin anclar
escribe `«FALTA:token»`.

### 5. Persistir lo confirmado

Una vez que la persona eligió, **guardalo**. No se vuelve a preguntar lo mismo en la
corrida siguiente.

Esto importa más de lo que parece: si cada corrida re-pregunta las mismas veinte
campañas, el panel se vuelve inusable y la gente empieza a confirmar sin mirar. Ahí el
paso humano deja de ser un control y pasa a ser un trámite.

## Restricciones

- Toda la aritmética vive sólo en `Marcadores.gs`. El anclaje propone vínculos, no
  calcula valores del informe.
- `SOLAPAS` manda. Ignorá `uso=ignorar`.
- **No uses `digital/RDV JM 2 VECES`.** Es texto pegado, no sirve como conjunto de
  control (ver Paso 2.9C.4).
- Nada hardcodeado: umbral en `CONFIG`, nombres de solapa en los registros.

## Test de aceptación

- Correr el anclaje para las reuniones de `REUNIONES` con `mostrar=sí`.
- **Termina sin timeout.** Con el filtro previo son pocos candidatos, no 500 × 1297.
- Los de confianza alta quedan resueltos; los de confianza baja aparecen en
  `ANCLAJE_PENDIENTE` con sus tres candidatos.
- Completar un `elegido` a mano y volver a correr: **no se vuelve a preguntar**.
- Bajar el umbral en `CONFIG` cambia cuántos pasan solos, sin tocar código.

## Commit

`feat: anclaje por filtro + similitud, con umbral en CONFIG y confirmación humana`
