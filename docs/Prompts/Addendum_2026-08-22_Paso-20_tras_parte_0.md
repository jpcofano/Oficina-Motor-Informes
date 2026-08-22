# Addendum · 2026-08-22 · Paso `2026-08-22_20` — después de la Parte 0

**Fecha:** 2026-08-22, con la Parte 0 corrida.
**Addendum a:** `docs/Prompts/2026-08-22_20_camp_por_cuenta_y_ventana.md` — **que no se edita.**

La Parte 0 tumbó las premisas de A y B. Las dos se reescriben acá; C y D siguen con ajustes.

---

## 1 · Parte A — **no es una celda, es una línea de `.gs`** · **Opus** · effort alto

`looker/resumen_metricas_dinamico` **ya declara** `campo_id_cuenta = id_cuenta`, y `id_cuenta` está
mapeado en la columna A. **La Parte A original es un no-op.**

La causa medida: en `itemsDeSeccion_`, la rama `REUNIONES` pone `id_cuenta` **dentro** de
`opciones`; la rama `CAMPANAS` lo pone como **hermano** de `opciones`. El consumidor lee
`opciones.id_cuenta`, alimentado por `opcionesItem`, que copia sólo `asignacion.item.opciones`.
**El productor llena un campo y el consumidor lee otro.**

- **El arreglo es que la rama `CAMPANAS` lo ponga donde el consumidor lo busca.** No se cambia el
  consumidor: `REUNIONES` ya funciona contra él y moverlo rompería lo que anda.
- ⚠ **Si `id_cuenta` como hermano lo lee alguien más, hay que verlo antes.** Reportar todo consumo
  de `item.id_cuenta` fuera de `opciones`. Si hay uno, se mantienen los dos hasta saber cuál sobra.
- **Control positivo:** un ítem de `CAMPANAS` con `id_cuenta` cargado llega al resolvedor con
  `opciones.id_cuenta` puesto, y uno sin cuenta llega sin él. Los dos asertos.
- **Son ocho marcadores, no nueve.** `camp_titulo` lee `digital/Seguimiento digital`. Los del
  agregado son `camp_impresiones`, `visualizaciones`, `clics`, `alcance`, `entregados`,
  `aperturas`, `ctor`, `frecuencia`.

**La verificación contra el deck del equipo sigue igual y sigue siendo obligatoria.** Que salga un
número no prueba nada: `ULTIMO` acaba de negarse a elegir entre 160 / 507 / 12.985 / 84.325.

⚠ **Y el comentario del `_44` —*"en cuanto la solapa declare su `campo_id_cuenta`, esto deja de ser
inerte"*— es falso y hay que corregirlo en el mismo commit.** La solapa lo declara y sigue inerte.
Es el tercer comentario esta semana que afirma un contrato sin testigo (`CLAUDE.md` §4).

---

## 2 · Parte B — **es anclaje, no ruteo de sección** · **Opus** · effort alto

La hipótesis del prompt está descartada, y bien: `enc_mails_entregados` —misma lámina, misma rama,
mismo `opciones.id_cuenta`— publicó 12.149. **El ítem llega.**

Lo medido: los dos juegos son **mutuamente excluyentes**. La copia con
`96.549 / 304 / 33.139 / 107.194` tiene Mail en `-`; la que tiene Mail en 12.149 tiene IVR en `-`.
**Dos ítems con dos cuentas distintas, y el equipo publica los dos juegos en una lámina.**

**La lámina es la correcta. La cuenta es la equivocada.**

- **Antes de tocar nada, correr `diagEnlaceDigitalDeEncuentros_('agosto_14_20')`** y reportar qué
  cuenta recibió cada ítem. Escribe y cuesta ~50 s, por eso no iba en Parte 0. **Reportar y parar
  ahí**: con eso se decide si es umbral, si es `sinLink`, o si el encuentro necesita dos cuentas.
- ⚠ **`ANCLAJE_PENDIENTE` no tiene fila para Salud.** O ancló por encima del umbral, o quedó
  `sinLink` — **y `sinLink` no deja rastro en la hoja**. Eso último es un hueco del registro y va
  a `PENDIENTES` aunque este paso no lo arregle: un encuentro que no ancla y no queda anotado es
  invisible.
- ⛔ **Si resulta que el encuentro necesita los dos juegos de una sola lámina**, eso no es un bug
  de anclaje: es que un encuentro puede tener más de una cuenta. **Parar y reportar** — es una
  decisión del usuario, no una corrección.

**Y `digital/Directa IVR` puede no estar fuera de alcance.** El `MAPEO` coincide exacto con la
`firma_encabezado` registrada. Si `verificarEncabezadosDeMapeo()` encuentra datos donde van
rótulos, **la hoja viva cambió después del censo** — y entonces es candidato a explicar el `-`, no
un frente aparte. **Leer la fila 1 viva y reportar.** Es una lectura, va antes de todo lo demás de
esta parte.

---

## 3 · Parte C — el aviso no distingue causas · **Sonnet**

Confirmado: `camp_remitente` **no tiene fila** en `MARCADORES` y `camp_titulo` **sí**, y los dos
caen en el mismo texto *"quedó crudo sin corte"*.

**Eso es el hallazgo, y va escrito**: el aviso mezcla *"nadie lo cableó"* con *"se cableó y el
escritor no lo pisó"*, que mandan a trabajos distintos. Es la familia del `/////` que no separaba
causas. Va a `PENDIENTES`; separarlo es otro paso.

`camp_remitente` queda para el paso de cableado. `camp_titulo` **sí se persigue acá**: tiene fila y
resuelve en otras láminas, así que el crudo es de un lugar puntual.

---

## 4 · Parte D — la fila 9 de `PERIODOS` es una trampa viva · **Sonnet**

⛔ **Sube de "rareza" a hallazgo P1.** `periodo_id = 'vie 14/08 -- jue 20/08 (por defecto)'`
**aparece en el selector del panel** como una opción que se lee *"por defecto"* y no lo es: es un
`periodo_ref` explícito. Elegirla activa el filtro `D-19` con ese id, que **ninguna fila de
`REUNIONES` tiene** — **un deck con cero encuentros y nada falla.**

Escribirlo en `PENDIENTES` con esas palabras. ⛔ **No borrar ni renombrar la fila**: es config y la
decide el usuario. El `julio_24_30` duplicado sí es inerte —`leerPeriodos()` colapsa— y sólo se
anota.

**El alta de `agosto_14_21` queda condicionada.** Son ocho días y el Addendum 1 de `R-11` fija
siete, inclusive. **Si se da de alta, la nota tiene que decir con esas palabras que contradice el
Addendum 1 y por qué** —el equipo actualiza el archivo el viernes al mediodía—. Sin esa frase, no
se da de alta: una fila que contradice una regla en silencio es peor que no tenerla.

---

## 5 · Orden

`2` primero —la lectura de la fila 1 del IVR, después el diagnóstico de anclaje—, luego `1`, luego
`3` y `4`. El `2` puede cambiar qué hace falta arreglar; el `1` no depende de nadie.
