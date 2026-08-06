# Addendum — `2026-08-06_9_plan_escalera_completa.md`

La Parte 0 tumbó la premisa de los IDs. Este addendum la resuelve, cierra la
dependencia del anclaje y absorbe los dos hallazgos que el prompt había dejado
afuera. **Todo lo demás del prompt sigue en pie.**

---

## 1 · Los IDs: prefijo de tramo

`Paso 6` y `Paso 7` están ocupados en documentos vivos, y `Paso 5` ya se ejecutó,
así que `5.1` se leería como sub-paso de las secciones repetibles.

**La escalera usa `T<tramo>.<n>`.** No colisiona, no obliga a tocar ninguna
referencia viva —incluida la condición de reactivación del `P0`, que sigue
diciendo "Paso 6" y sigue significando lo mismo— y el ID dice a qué tramo
pertenece. La palabra "Paso" queda para la serie histórica y no se reusa.

**Tramo 2 — corte vertical, JM solo**
  - `T2.1` — la corrida siempre cierra · `T2.1.1` reloj y corte · `T2.1.2` el
    cierre se escribe siempre · `T2.1.3` la fila guarda hasta qué ítem llegó
  - `T2.2` — bajar el costo por ítem · `T2.2.1` medir · `T2.2.2` sacar lo
    repetido · `T2.2.3` comprobar que ningún valor cambió
  - `T2.3` — reanudar · `T2.3.1` continuar a mano · `T2.3.2` disparo automático ·
    `T2.3.3` `LockService` · `T2.3.4` el cliente consulta la fila
  - `T2.4` — los cuatro objetivos contra un deck real
  - `T2.5` — las operaciones que faltan
  - `T2.6` — los tres grupos que recortan a cero filas
  - `T2.7` — el instrumento (`marcarEtapa_`)
  - `T2.8` — el score de anclaje y el circuito de `ANCLAJE_PENDIENTE`
  - `T2.9` — el matcher (`Union.gs`) · `T2.9.1` `R-12` · `T2.9.2` los dos valores
    de ventana a `CONFIG` · `T2.9.3` el empate técnico · `T2.9.4` retirar
    `VALOR_STATUS_REALIZADA_` y `verificarPrecondicionAnclaje_` fuera de
    `leerFuente` · `T2.9.5` que la precondición devuelva **cuáles** son los grupos
    en violación, no sólo cuántos

**Tramo 3** — `T3.1` SECCO · `T3.2` exposición del repo público
**Tramo 4** — `T4.1` `getActiveUser()` · `T4.2` `doGet` y corrida a demanda ·
`T4.3` `D-16` acceso por usuario
**Tramo 5** — `T5.1` chequeo previo programado

El matcher pasa a `T2.9` porque la §2 ya lo tenía adentro del Tramo 2.
`T2.9.5` sale del propio ítem de `R-01`, que dice qué falta para responderlo y que
va con el paso del matcher.

---

## 2 · La dependencia del anclaje se contradice sola

`PENDIENTES` dice las dos cosas:

- El ítem de `R-01` (03/08): `anclarEncuentros()` **no corre** mientras la
  precondición falle, *"así que el matcher está bloqueado y con él la parte del
  Tramo 2 que depende de encuentros anclados"*.
- El ítem del score de anclaje: **los cinco anclajes dan `1,00` exacto** desde que
  la fecha entró al score el 10/08.

**Si hay cinco anclajes, corrió.** Y las mediciones de estos días cronometran el
anclaje en ~93 s dentro de las etapas 1 y 2.

**Medir cuál de las dos vale hoy, y reportar sin cerrar nada:**
  - ¿`verificarPrecondicionAnclaje_()` sigue dando 5 grupos en violación?
  - ¿`anclarEncuentros()` corre igual, o hay un camino que la saltea?

Si corre, la frase *"el matcher está bloqueado y con él la parte del Tramo 2"*
está vencida y **la escalera no lleva esa dependencia**. Si no corre, `T2.4` la
lleva escrita. **`T2.1` no depende de esto en ninguno de los dos casos** — el MVP
no necesita encuentros anclados.

---

## 3 · Los `###` mal archivados de `PENDIENTES_consistencia.md`

`## Preguntas al equipo` es una sección de viñetas: preguntas de dominio que
esperan respuesta humana. Debajo de la última viñeta le quedaron colgando varios
`###` que no lo son.

**Contarlos primero.** A mí me dan diez (desde `DISTINCT` hasta
`ecv_barrio no puede usarse como prefijo de familia`); la Parte 0 reportó siete.
**Que el número lo dé el archivo, no ninguno de los dos.**

**Clasificar uno por uno, no mover en bloque.** Alguno puede ser pregunta de
dominio de verdad — `3354` y `3346` con cero filas de mail contra lo que dice
`rdv`, por ejemplo. Para cada uno: **¿espera una respuesta humana, o es trabajo
con el dato ya medido?**
  - Trabajo → va bajo `## Sigue abierto`, con su prioridad intacta.
  - Pregunta → se convierte en viñeta, que es la forma de esa sección.

**No se cierra ni se reabre ninguno.** Sólo cambian de lugar y de forma. Las
prioridades no se tocan.

---

## 4 · El encabezado de `Paso-4.md`

Dice textual *"Nunca se ejecutó, así que se edita en el lugar y no lleva addendum
nuevo"*, y `BITACORA.md` registra `Paso 4 ✅ — motor de reemplazo (tokens fijos) +
registro de corrida (2026-08-04)`.

Corregir el encabezado: **ejecutado**, con la fecha y el puntero a esa entrada. El
cuerpo no se toca — un prompt ejecutado sólo lleva addendum, y este addendum no es
del Paso 4.

**Revisar si hay más prompts en la misma situación.** Si otro encabezado dice
"nunca se ejecutó" y la bitácora dice que corrió, entra en esta corrección.

---

## 5 · Los dos punteros delgados

Al resumir la §2, `carpeta_motor` y el rol `reader` de las bases tienen **una sola
aparición cada uno** en `BITACORA.md`. Sus punteros van a esas líneas, no al
título de la entrada.

---

## Cuándo está hecho

- La §2 se lee en una pantalla, con IDs `T<tramo>.<n>`.
- La dependencia del anclaje está escrita como corresponda, medida.
- Ningún `###` cuelga de `Preguntas al equipo` sin ser una pregunta.
- Ningún encabezado de prompt dice "nunca se ejecutó" sobre uno que corrió.

## El reporte

1. Qué dio la medición del anclaje, y si la dependencia entró o no.
2. Cuántos `###` había mal archivados y cómo quedó cada uno.
3. La §2: qué sacaste y a dónde fue.
4. Qué prompts tenían encabezado vencido.
5. Qué decisiones tomaste solo.
6. Qué premisa de este addendum resultó falsa, si alguna.

Sin trailer `Co-Authored-By`.

**Modelo:** Opus.