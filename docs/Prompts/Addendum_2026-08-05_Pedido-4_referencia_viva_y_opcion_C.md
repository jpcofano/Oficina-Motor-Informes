# Addendum al `Pedido-4` — la referencia pasa a ser viva, y la sección se parte por lámina, no por token

**Deriva de:** `docs/Prompts/2026-08-04_Pedido-4_cerrar_ecv.md`, cuya **Parte 0 ya se corrió**
y paró como debía. Este addendum **no reemplaza el prompt**: sustituye su **Parte A**, sustituye
su **Parte D**, y deja **B, C y E como están**.

**Decisiones del usuario del 05/08 que lo motivan:**

1. Las bases son vivas. Los números de referencia del 03/08 no están mal — están **vencidos**.
2. De las tres salidas para los ocho tokens ambiguos, se elige **C**: no se parte por token, no se
   toca la plantilla, no se agrega `seccion_id` a `MARCADORES` todavía.

---

## Parte 0 bis — Verificar que lo medido el 04/08 sigue en pie. Sólo lectura. Reportar y **PARAR**.

La Parte 0 original se corrió el 04/08. Todo lo que sigue asume sus hallazgos. Antes de tocar nada,
confirmar que no se movieron. Es sólo lectura, por `eval` sobre la API, como se hizo esa vez.

- **0bis.1 · Los 19 tokens `ecv_*` siguen siendo 19**, con la misma partición: 9 de agregado semanal
  puro, 2 de encuentro, 8 presentes en las dos láminas. Si la plantilla cambió y el número se movió,
  reportar cuáles entraron o salieron y **parar**.
- **0bis.2 · `MARCADORES` sigue sin ninguna fila de familia `ecv`.** Si aparecieron filas, listarlas
  y **parar**: alguien cableó en el medio y este prompt está escrito contra otra base.
- **0bis.3 · `SECCIONES` sigue teniendo `encuentro` como `repetible` sobre `REUNIONES`**, con las
  cuatro subsecciones `encuentro_portada` / `_estrategia` / `_iceberg` / `_resultados`. Si el árbol
  cambió, reportar el diff y **parar**.
- **0bis.4 · Volver a medir los tres agregados sobre `rdv` con la ventana de `CONFIG`**, y reportar
  los valores de hoy junto a los del 04/08 (3364 · 811 · 16) y a los del 03/08 (2919 · 686 · 12).
  **No parar por esto** — el punto es dejar registrado cuánto se movió la base en un día, que es
  precisamente lo que este addendum viene a absorber.

Reportar los cuatro puntos y **PARAR**. Seguir sólo con luz verde.

---

## Parte A (sustituye a la Parte A original) — Una sección hermana, y los ocho quedan donde están

La Parte A original decía "partir en dos". No se puede: `MARCADORES` no tiene columna de sección
—las once columnas son `marcador`, `familia`, `informe_id`, `base_id`, `solapa`, `campo_logico`,
`periodo_ref`, `operacion`, `valor_fijo`, `formato`, `notas`— así que un token tiene **una sola
definición** y no puede valer el total de la semana en una lámina y el de un encuentro en otra.

En vez de partir:

- **Declarar una sección nueva en `SECCIONES`, hermana de `encuentro`, en modo agregado**, para la
  lámina del alcance semanal por herramienta. Que no itere sobre `REUNIONES` es todo el punto.
- **Asignarle únicamente los 9 tokens de agregado semanal puro** que identificó `0.2`:
  `ecv_encuentros`, `ecv_barrios`, `ecv_barrio1`, `ecv_barrio2`, `ecv_barrio3` y los cinco
  `ecv_insc_*_pct`. Si al medir de nuevo la partición cambió, mandan los 9 que salgan de `0bis.1`,
  no esta lista.
- **Los 8 ambiguos no se tocan.** Ni se mueven, ni se cablean, ni se renombran. Quedan exactamente
  donde están hoy y la lámina 6 sigue funcionando como funciona. Listarlos en el reporte con la
  leyenda de que están diferidos, no resueltos.
- **Los 2 de encuentro** (`ecv_barrio`, `ecv_poblacion`) también se quedan donde están.

Configuración reversible. **Correr el diff antes y después; la referencia sigue siendo
`protegidas (con diferencia): 0`.**

---

## Parte D (sustituye a la Parte D original) — Cerrar contra la corrida, no contra un número escrito

Los cuatro números de la Parte D original —2919, 686, 12, 2865/−54— **quedan derogados como
criterio de cierre**. No porque estuvieran mal: porque son una foto del 03/08 y la base se movió dos
veces desde entonces. Cablear un número fijo en un prompt lo condena a vencer.

El criterio pasa a ser **interno a la corrida**. Generar el informe y verificar, en la misma
ejecución y sobre la misma ventana:

- **D.1 · Los tres agregados del deck coinciden con la lectura cruda de `rdv`.** El motor y una
  lectura directa de la solapa, con el mismo filtro de ventana y la misma lista blanca de estados,
  tienen que dar el mismo `ecv_inscriptos`, `ecv_asistentes` y `ecv_encuentros`. Si difieren,
  reportar la diferencia y **parar**.
- **D.2 · La suma de los cinco `ecv_insc_*` contra `ecv_inscriptos`**, y **la diferencia explicada
  fila por fila**: qué encuentros la producen y cuántos inscriptos aporta cada uno. Al 04/08 era
  −20, un solo caso (`Palermo` del 29, sin ningún canal cargado). Lo que importa no es que el número
  sea 20: es que **cada unidad de la diferencia tenga una fila con nombre**. Si aparece diferencia
  sin fila que la explique, reportar y **parar**.
- **D.3 · Los agregados aparecen una sola vez en el deck, no cinco.** Es lo que la Parte A venía a
  arreglar y sigue siendo el control que dice si funcionó.
- **D.4 · Dejar los números de la corrida en la bitácora, con fecha y hora**, marcados como
  medición y no como referencia. La próxima corrida los va a contradecir y eso es correcto.

**Si algo no cierra, reportá la diferencia y pará. No ajustes nada para que cierre.**

---

## Lo que no cambia

Las Partes **B**, **C** y **E** del prompt original **siguen vigentes tal como están escritas**, con
una sola precisión sobre B: los tokens a cablear son **los 9 de la Parte A de este addendum**, no
los 19 de la familia.

Y el bloque **Qué NO hacer** del original sigue entero. Se le agrega:

- **No agregar `seccion_id` a `MARCADORES`.** Es la salida correcta a largo plazo y está aceptada
  como tal, pero desbloquea 8 tokens de 181 y hoy no se paga. Cuando toque, va con su propio prompt.
- **No editar la plantilla `.pptx` para renombrar tokens.** La plantilla es del equipo y el motor se
  adapta (`C-01`).
- **No cablear los 8 ambiguos "provisoriamente"** con el significado de una de las dos láminas. Un
  token mal definido produce un número plausible y equivocado, que es exactamente el modo de falla
  que el `Pedido-2` acaba de encontrar en el deck.

**Modelo:** Opus.
