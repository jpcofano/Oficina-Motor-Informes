# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-07, al cerrar la corrida nocturna `N1`–`N10` · último commit
al escribirlo: `d30e0c6`

## Dónde estamos

**La corrida completa.** `jm-20260807-004300` terminó **sin corte**: 120 s contra un techo de
350, barrida final en **0 tokens crudos**, 29 tokens con valor y 270 faltantes. Es la primera
corrida completa medida, y **entierra el punto 1 de "Trabado"** que arrastraba el handoff
anterior.

Con eso caen dos cosas más:

- **La proyección de `T2.2.2` era pesimista.** Decía ~190 s; la corrida real gastó **120**.
- **`jm-20260806-222554` tampoco estaba cortada.** Sus 29/270 son idénticos a los de la corrida
  completa. Los 270 faltantes **no son corte por tiempo**: son tokens sin cablear o sin fuente,
  que es otro problema y ya está inventariado.

**`T2.2.3` dio cero diferencias.** El deck de la corrida nueva contra el de
`jm-20260806-222554`, **pieza por pieza**: 26 láminas, 1389 piezas de texto, ninguna sólo en un
deck y ninguna con texto distinto. Evidencia completa en
`docs/PROTOCOLO_T2.2.3_corrida_2026-08-07.md`.

**`T2.1.2` construido** — el cierre de la corrida se escribe también cuando salta una excepción
inesperada. Control positivo por API con una excepción inyectada en la etapa 2: la fila de
`CORRIDAS` cierra con motivo propio, los 172 tokens quedan en `FALTANTES` con
`MOTIVO_EXCEPCION_` —distinguible del corte por tiempo— y la excepción no escapa.

## Pendiente de verificación humana

Nada de esto lo puede cerrar Code. Las tres cosas de código de la noche:

1. **`T2.1.2` · el cierre blindado.** Cómo probarlo: correr `generarInforme` desde el menú y
   confirmar que la corrida normal sigue igual. Para ver el camino nuevo hace falta forzar una
   excepción — está descrito en la entrada de `N2` de la bitácora, y el control ya corrió por
   API.
2. **`N8` · `excluida <nombre>`** en vez de `excluida undefined`, en el reporte del menú.
3. **`N8` · el aviso de láminas escondidas** termina ahora en *"Numeradas sobre el DECK
   EXPANDIDO, no sobre la plantilla"*.

**Las 10 pruebas pasan** después de los tres cambios.

## Trabado

1. **⚠ Sigue sin haber causa establecida de las muertes anteriores.** Ninguna corrida dejó
   registro de su propia muerte, y el panel **Ejecuciones** del editor es el único oráculo que
   lo diría — el token de la sesión no lo alcanza (le falta `script.processes`). **Pero ya no
   bloquea nada**: la corrida completa, y `T2.1.2` cubre la vía que faltaba.
2. **⚠ El instrumento tiene un punto ciego.** `marcarEtapa_` **traga sus excepciones a
   propósito**, así que una corrida puede llegar a la etapa 4 y dejar la fila diciendo que
   nunca arrancó. Es `T2.7`. **Merece prompt propio; no se tocó.**
3. **Cinco objetivos construidos y sin verificar contra un deck:** los 16 ceros falsos de
   `SUMA`; `ULTIMO` por fecha; los once de Orden Público; el agregado global de `digital`; y los
   24 marcadores del Resumen Ejecutivo. **Ahora hay un deck completo contra el cual mirarlos**
   — es `T2.4`, y es lo que sigue.
4. **Tres grupos recortan a cero filas** con el recorte por ventana: IVR (0 de 57 sobre
   `Inicio`), `sd_pauta_*` y `Digital`. No se sabe si es correcto.
5. **16 tokens del Resumen Ejecutivo sin fuente**: los ocho de Call Center (`cc_base` no existe
   en ninguna base), los seis de impresiones por plataforma, y `contenidos_total`.
6. **`CAMPANAS` sin filas de `jm`** y **`REUNIONES` no es el temario** (le faltan Primera
   Persona y Registro Civil).
7. **La lámina 7 tiene fuente y le falta una columna.** ~~20 de los 22 tokens nuevos no tienen
   fuente declarada~~ — **era falso**, corregido el 07/08: la fuente es la solapa
   `digital/Digital` y **6 de las 7 columnas ya estaban mapeadas** desde antes del 01/08. Falta
   **`Estado`, columna `G`**. Lo que sí bloquea es otra cosa: **la solapa no tiene ninguna fila
   en la ventana del informe** — sus fechas llegan hasta 2026-01-02 (`CONFIG_INFORMES.md`
   §1.8.1).

## Esperando decisión tuya

- **La lámina 7 de `jm`: cuál de las tres salidas** del `P2` de `comunicaciones_post`
  (`PENDIENTES_consistencia.md`). Adoptar las 28 de `CONFIG_INFORMES.md` §1.8 **es elegir la
  salida A**. Las tres están escritas con su costo; ninguna elegida.
- **`R-14` no tiene consumidor.** La regla está escrita y `sd_fecha_fin` ya está mapeado, pero
  nada la aplica todavía.
- **`secco` tiene 3 ranuras y las decisiones fijan 4.** No está decidido si `secco` también
  pasa a cuatro.
- **`T2.10`** —una lámina cada N ítems— está escrito y **no aprobado**. Necesita una decisión de
  esquema: dónde se declara el tamaño de página (lo natural, `SECCIONES.items_por_lamina`).
- **Los `m2_*` de la lámina 10 de `jm` siguen con sufijos secuenciales** (`_a`…`_e`) y
  `TOKENS.md` §1 declara que no los tienen. Discrepancia abierta desde el Paso 2.2.
- **Los cuatro `ecv_barrio*`** — `ecv_barrios` necesita `DISTINCT`, que no existe.
- **Falta un formato "porcentaje sin signo"**; hoy se usa `numero`.
- **`camp_bench_*`**: ¿fijos o del período anterior?
- **La fila `resumen_ejecutivo` de `SECCIONES`** sigue `repetible` + `manual`, y está medido que
  **no puede ser repetible**. Es una línea.

## En pausa, y no se vuelve sobre esto

> Las tres preguntas sobre la lámina M2. **Los tres remitentes sueltos** y los **once
> `camp_resp_*`**. **`enc_e75_pct` da 38,74 contra 39 % publicado: es el mismo número
> redondeado, no es un error y no se ajusta.** El **objetivo B** —score de anclaje saturado en
> 1,00 y circuito de confianza sin probar— anotado como `P1`.

## Qué sigue

**La escalera vive en `docs/PLAN.md` §2, con IDs `T<tramo>.<n>`.**

1. **`T2.4` · los cuatro objetivos contra un deck real.** Es lo inmediato: ya hay deck completo
   y ya no hay excusa de presupuesto.
2. **`T2.1.3`** — la fila guarda hasta qué ítem llegó.
3. **`T2.3` · reanudar dejó de ser urgente.** Con 120 s contra 360, no está en el camino
   crítico. No se descarta.
4. **`T2.7` · el instrumento** — `marcarEtapa_` traga sus excepciones y las cinco marcas se
   pisan.

## Qué mirar antes de tocar algo

- **El cierre de la corrida corre siempre**, incluida la vía de excepción (`T2.1.2`). El estado
  que necesita —`mapa`, `expansion`, `porItem`, `resolucion`, `porMarcador`— se declara
  **afuera del `try`**, con valores vacíos usables. **Si agregás algo al cierre, tiene que
  tolerar que la corrida haya muerto en la etapa 1.**
- **⚠ Cuidado con los defaults vacíos pero truthy.** `barrerTokensNoAlcanzados_` decide
  re-escanear por `tokensDelMapa ? … : null`, y un `{}` lo engaña: la llamada pasa
  `mapa.lista.length ? mapa.tokens : null`. El bug se cazó la misma noche que se creó.
- **`FALTANTES` se pisa entera en cada corrida.** `escribirFaltantes_` limpia antes de escribir:
  es la foto de la última corrida, no un histórico. Cualquier corrida de prueba la borra.
- **El cliente ya no reintenta por defecto.** `tools/api.js` pide `--reintentar` explícito.
- **Las bases no se leen desde node** (scope `drive.file`): se mide por `fn=eval`. **⚠ `eval` es
  invocable por la API**, y con `globalThis.<fn> = …` se puede inyectar una excepción para
  probar el cierre — así corrió el control de `T2.1.2`.
- **El volcado de una hoja grande no entra en una línea de comandos de Windows** (~32 KB). Para
  restaurar `FALTANTES` hubo que mandarlo en tres lotes.
- **Tres numeraciones de lámina conviven** y confundirlas ya costó tiempo: el `.pptx` archivado,
  la presentación viva de Slides, y el **deck expandido** de una corrida. `TOKENS.md` §2.0 lo
  deja escrito y el aviso de escondidas ahora lo dice.
- **`mapaDeTokens_` excluye las láminas escondidas**: el denominador es **172**, no 195.
- **`esLaminaEscondida_` (`Armonizar.gs`) es la única llamada a `isSkipped()` del repo.**
- **Seis láminas están escondidas**: la 10 de `jm`; la 23, 25, 26, 27 y 28 de `secco`. No se
  emiten, y sus tokens quedan crudos en el deck a propósito.
- **`RATIO`/`PCT` parten después del filtro y del recorte por ventana**, no antes.
- **`SUMA` sobre cero filas devuelve `sin_datos`**; `CONTEO` sigue devolviendo `0`.
- **`ULTIMO` elige por fecha**, no por posición; empate con valores distintos → no elige.
- **`digital` sin `id_cuenta`** cae a `leerFuente` y **recorta por ventana**.
- **`SECCIONES.filtro` filtra ítems de la iteración; `MARCADORES.filtro` filtra filas.**
- **`tokenEsDeFamilia_` matchea por prefijo.** Por eso `camp_` no toma `camp1`, y `camp` tomaría
  también `camp_titulo`. Cualquier familia nueva se piensa contra las que ya están.
- **Nada que recorra una presentación puede usar `getShapes()`**, y `piezasDeTextoDeSlide_`
  **saltea las celdas combinadas no principales**.
- **Los decks se llaman todos igual** en la carpeta de salida: para verificar, tomar el
  `deck_id` de la fila de `CORRIDAS`, nunca la fecha de modificación.

## Números de referencia

`MARCADORES` en **43** filas. **`MAPEO` en 124** (entraron `sd_fecha_fin` y `sd_estado`).
Plantilla `jm`: **172 tokens** (195 menos los 23 de la lámina escondida) en 22 láminas;
`secco`, 29 láminas. **Las 10 pruebas pasan.** `CORRIDAS` en **23 filas**. `FALTANTES` en
**270**. Carpeta de salidas: **15 presentaciones, cero huérfanas** — todas con su fila en
`CORRIDAS`. **Una corrida completa cuesta 120 s** contra 350 de techo y 30 de reserva.

Los dos decks generados esta noche —`jm-20260807-004300` (control de `T2.2.3`) y
`jm-20260807-005413` (control de `T2.1.2`)— **están en la papelera**. Sus filas de `CORRIDAS`
quedan: son el registro de que se hicieron.
