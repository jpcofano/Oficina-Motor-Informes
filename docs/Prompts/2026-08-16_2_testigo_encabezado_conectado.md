# 2026-08-16_2 — Conectar el testigo de `D-31`: que el motor compare el encabezado

> **Estado:** no ejecutado · **reemplaza:** nada · **subagente:** ninguno
>
> **Objetivo único:** que el motor **compare** el encabezado que `MAPEO` declara esperar contra
> el que encuentra en esa letra, y lo reporte. Nada más.
>
> **Frente 12 bis. Va antes de la tanda 1 de la migración** (usuario, 16/08): la migración toca
> muchas filas de configuración y conviene tener la alarma puesta antes, no después.

---

## Por qué existe: el frente 6 dejó el dato y no la alarma

`D-31` pobló **154 filas de `MAPEO`** con la columna `encabezado`. Medido el 16/08, el dato **no
lo mira nadie**:

- **`leerMapeoSinCache_` (`Config.gs:139`) ni siquiera indexa la columna.** Lee `base_id`,
  `solapa`, `campo_logico`, `hoja`, `columna`, `tipo_esperado`, `valores_incluidos` y `notas`.
- **`buscarMapeo` devuelve `{ ok, hoja, columna }`** y nada más.
- **No hay un solo punto del camino de lectura que compare el título esperado contra el
  encontrado.**

Es coherente con lo decidido —*"la función que valida se difiere"*, usuario, 14/08— y ese
diferimiento es lo que este prompt levanta.

### Y lo que hace que valga la pena, que es cómo falla hoy

**El motor lee por POSICIÓN.** El camino, medido:

```
MARCADORES.campo_logico
  → buscarMapeo(base, solapa, campo)      devuelve la LETRA
  → encabezadoEnColumna_(base, solapa, letra)
        headers[ columnaLetraAIndice_(letra) ]   ← la letra se vuelve índice
  → leerFuente arma la fila:  obj[h] = fila[i]   ← indexada por el TEXTO del encabezado
  → valoresDeCtx_ extrae con ctx.encabezado      ← el NOMBRE, nunca la letra
```

El encabezado aparece en el camino, pero **es derivado de la posición**: nunca se busca una
columna por su nombre.

**Consecuencia 1 — insertar una columna corre las letras y nada falla.** La letra corrida da un
índice válido, `headers[idx]` devuelve el título del **vecino**, y `obj[titulo]` devuelve el valor
del vecino. Un `SUMA` sobre la columna de al lado es **un número, no una excepción**.

**Consecuencia 2, peor, y no estaba escrita en ningún lado.** `obj[h] = fila[i]` con **títulos
repetidos gana el último**, y en estas bases los títulos repetidos son la norma: `Base_Digital`
tiene **ocho** `ID Cuentas`, `Agenda JM | Post` **cuatro** `% CTR`. Después de un corrimiento el
motor puede devolver **ni siquiera el vecino**, sino el valor de la última columna que comparta
ese título.

---

## Las tres cosas que este prompt tiene que respetar

### 1 · La política ya está decidida en `D-31`. La función la aplica, no la reinventa

**No se decide nada acá.** `D-31` ya dijo qué hacer cuando el testigo no coincide, y son tres
reglas que la implementación tiene que cumplir tal cual:

| regla | qué significa en el código |
|---|---|
| **no corregir la letra sola, nunca** | prohibido *"si el título no coincide, buscá la columna que sí lo tenga"*. **La letra manda.** El testigo **nunca es fallback** |
| **reportar los dos valores** | el mensaje dice el esperado **y** el encontrado, con base, solapa, campo y letra. Un *"no coincide"* a secas no se puede verificar |
| **no bloquear la corrida** | es un reporte, no una excepción. Un desalineamiento no puede dejar sin deck a quien lo necesita el jueves |

**El motivo de la primera, escrito para que nadie la ablande:** los títulos **se repiten**, así que
un fallback por título **acertaría a veces y erraría en silencio otras** — que es peor que el
problema que viene a resolver.

### 2 · El testigo compara **rótulos, no contenido**, y eso va en el código

**`C-09` es la prueba de que el límite es real.** En `RDV_otros_ministros` los encabezados están
**corridos en origen**: el rótulo de la columna no describe lo que la columna tiene. Ahí el testigo
**va a coincidir siempre** y no va a detectar nada, porque lo que compara es el rótulo.

**Eso tiene que estar dicho en el comentario de la función**, no sólo en `D-31`. Una guarda cuyo
límite vive en otro documento se lee como si no tuviera límite, y el día que alguien confíe en ella
para una pregunta que no responde, el costo lo paga la confianza puesta en el resto.

Redactarlo como lo que es: **el testigo detecta que la columna se movió, no que el dato esté mal.**

### 3 · La prueba se escribe **antes** y **tiene que fallar**

**Una fila con `encabezado` esperado distinto del real, y el control tiene que ponerse rojo.** Si
se escribe la prueba después de la función y pasa a la primera, no se sabe si prueba algo.

⚠ **Y la pregunta que hay que hacerle al control verde, porque este repo ya pagó no hacerla:**
*"¿con qué otro dato seguiría pasando, y qué afirmación distinta estaría probando ahí?"*.
`Pruebas.gs:456` afirmaba *"`ULTIMO` saltea la celda vacía del final"* sobre `[10, 5, '']` y lo que
en realidad verificaba era *"`ULTIMO` elige por posición"* — el fixture satisfacía las dos por
igual, y pasó meses en verde. Acá el riesgo equivalente es un fixture donde el título esperado
difiera **y además** la letra apunte fuera de rango: pasaría por el motivo equivocado.

**El control positivo mínimo son dos casos, y el segundo es el que suele faltar:**

1. **esperado ≠ real** → reporta, con los dos valores, y **la corrida sigue**.
2. **esperado = real** → **no reporta nada.** Sin éste, una función que reporta siempre pasa el
   primero.

Y un tercero que conviene, porque es el estado real de 7 filas: **`encabezado` vacío** —las de
`promoverFechasElegidas()`— **no es un desalineamiento**. Vacío significa *"no declarado"*, y se
saltea sin reportar.

---

## Alcance — lo que este prompt **no** hace

- **No corrige ningún `MAPEO`.** Si la comparación encuentra desalineamientos reales, **se
  reportan y se paran ahí**: corregirlos es otro prompt y probablemente otra decisión.
- **No toca `SOLAPAS`, `MARCADORES` ni ninguna plantilla.**
- **No cambia `buscarMapeo` de contrato con sus llamadores.** Hay trece; romperlos para agregar
  una guarda sería cambiar el frente por el que se entra.
- **No agrega ninguna columna.** `encabezado` ya existe y está poblada.
- **No implementa `C-61`.** Está diferido detrás de la migración (usuario, 16/08).

---

## Dónde va el código, y por qué ahí

**El reparto de `CLAUDE.md` §2 lo decide solo:** resolver la estructura de una hoja es **acceso a
datos**, así que la comparación vive donde ya vive `encabezadoEnColumna_` y no en `Marcadores.gs`,
que sólo hace la cuenta.

**Y el reporte tiene que salir por un canal que alguien mire.** La traza de la corrida es la
candidata natural: es donde ya se distingue *"no calculable"* de *"falló el cableado"*. Si se elige
otro, decir cuál y por qué — **un reporte que no se lee es una función que no existe.**

**Wrapper público, sin `_` final** (`CLAUDE.md` §2), para poder correr la comparación **sobre todo
`MAPEO` de una** sin generar un informe: es la forma barata de saber si hoy hay algún
desalineamiento, y **esa medición es el primer resultado que este prompt tiene que dar.**

---

## Verificación — qué se reporta al terminar

1. **Los dos controles positivos corriendo**, y el nombre exacto de la función que los corre.
2. **El resultado de pasar la comparación sobre las 154 filas**: cuántas coinciden, cuántas no, y
   **las que no, con los dos valores**. Es la medición que `D-31` no pudo hacer cuando se escribió.
3. **Si aparece algún desalineamiento**, no tocarlo: reportarlo con base, solapa, campo y letra.
   ⚠ **Y antes de llamarlo hallazgo, descartar `C-09`**: en las solapas con encabezados corridos en
   origen, un rótulo que coincide no dice nada y uno que no coincide puede ser el corrimiento de
   origen y no un mapeo mal apuntado.
