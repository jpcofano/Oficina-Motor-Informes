# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-06, al cerrar el desglose del presupuesto · último commit
al escribirlo: `993d7b3`

## Dónde estamos

**Ya no es "por qué muere": es que no entra.** El presupuesto de una corrida está desglosado y
**suma ~661 s contra los 360 s que da Apps Script** — sin contar la etapa 5, que no se midió.
Las etapas **1+2+4 solas suman ~396 s**, así que **no entra ni con la etapa 3 valiendo cero**.

**El próximo trabajo es reanudación por etapas**, y está dicho por la medición, no por
preferencia.

**Dónde está el costo, medido:**

| | |
|---|---|
| etapa 1 · expandir | **119,8 s** — de los cuales **~63–70 s es el anclaje** (`itemsDeSeccion_`) y ~55 s la duplicación de slides |
| etapa 2 · mapa | **9,6 s** |
| etapa 3 · por ítem | **~256 s** — `resolverMarcadores` cuesta **~50 s por ítem**, y son 5 |
| etapa 4 · tokens fijos | **~267 s** — `resolverMarcadores('jm',{})` sola **238,9 s** |
| etapa 5 · faltantes | sin medir |

**`resolverMarcadores` se llama seis veces por corrida y cuesta ~50 s cada vez.** Ahí está el
presupuesto, no en lo que se sospechaba: `leerMarcadores_()` pesa **0,37 s** (0,7% de la
llamada), `getSlides()` **13 ms**, `replaceAllText` **~7 ms por token**.

**Lo que se cerró antes, y sigue en pie:** una invocación deja **una fila y un deck**; el
reintento del cliente ya no relanza la generación; la carpeta de salidas **cierra contra
`CORRIDAS`** (12 decks, 12 filas con deck, cero huérfanos).

**⚠ Sigue sin haber causa establecida de la muerte.** El límite de 6 minutos es el candidato
obvio y ahora tiene un presupuesto que lo respalda, pero **ninguna corrida dejó registro de su
propia muerte**. El panel **Ejecuciones** del editor de Apps Script es el único oráculo que lo
diría, y el token de la sesión no lo alcanza (le falta el scope `script.processes`).

## Trabado

1. **⚠ `generarInforme` no completa.** Es el punto 1 y bloquea a los demás.
2. **⚠ El instrumento tiene un punto ciego justo donde miramos.** `marcarEtapa_` **traga sus
   excepciones a propósito**, así que una corrida puede llegar a la etapa 4 y dejar la fila
   diciendo que nunca arrancó. Es exactamente lo que no permite decidir qué le pasó a
   `jm-20260805-232018`. **Merece prompt propio; no se tocó.**
3. **Cinco objetivos construidos y sin verificar contra un deck:** los 16 ceros falsos de
   `SUMA`; `ULTIMO` por fecha (`enc_mails_enviados` = 44.043); los once de Orden Público; el
   agregado global de `digital`; y los **24 marcadores del Resumen Ejecutivo** (`MARCADORES`
   pasó de 19 a **43 filas**). **Todos probados contra las funciones, ninguno contra el deck.**
4. **Tres grupos recortan a cero filas** con el recorte por ventana: IVR (0 de 57 sobre
   `Inicio`), `sd_pauta_*` y `Digital`. No se sabe si es correcto.
5. **16 tokens del Resumen Ejecutivo sin fuente**: los ocho de Call Center (`cc_base` no
   existe en ninguna base), los seis de impresiones por plataforma, y `contenidos_total`.
6. **`CAMPANAS` sin filas de `jm`** y **`REUNIONES` no es el temario** (le faltan Primera
   Persona y Registro Civil).

## Esperando decisión tuya

- **Los siete shortcuts del 04/08 18:42** siguen en la carpeta de salidas: el token tiene
  scope `drive.file` y **no puede borrar archivos que no creó el script**. O se borran a mano
  —son siete y ya se sabe qué son— o se reautoriza con scope `drive` completo, que agranda el
  permiso del cliente de pruebas a todo el Drive de la cuenta. **No se hizo ninguna de las dos.**
- **Los cuatro `ecv_barrio*`** — `ecv_barrios` necesita `DISTINCT`, que no existe; los otros
  tres están `[MANUAL]` con una `[?]` que resuelve los dos huecos a la vez.
- **Falta un formato "porcentaje sin signo"**; hoy se usa `numero`.
- **`camp_bench_*`**: ¿fijos o del período anterior?
- **La fila `resumen_ejecutivo` de `SECCIONES`** sigue `repetible` + `manual`, y está medido
  que **no puede ser repetible**: los tokens de GCBA llevan prefijo propio. Es una línea.

## En pausa, y no se vuelve sobre esto

> Las tres preguntas sobre la lámina M2. **Los tres remitentes sueltos** y los **once
> `camp_resp_*`**: diferidos el 07/08. **`enc_e75_pct` da 38,74 contra 39% publicado: es el
> mismo número redondeado, no es un error y no se ajusta.** El **objetivo B** —score de
> anclaje saturado en 1,00 y circuito de confianza sin probar— anotado como `P1`.

## Qué sigue

1. **Reanudación por etapas.** Es lo que dice la medición: ninguna reorganización del trabajo
   actual entra en 360 s. Lo destraba la decisión de cómo se persiste el estado entre tramos.
2. **Mirar `resolverMarcadores` de cerca**, en paralelo: son ~50 s × 6 llamadas = ~300 s de los
   661. No hace falta para reanudar, pero es la mitad del presupuesto.
3. **Verificar los cinco objetivos** con una corrida completa — sigue bloqueado por el 1.
4. **Retomar el sembrado**, que está parado hasta que una corrida se pueda mirar.
5. **Objetivo B**, los tres grupos que recortan a cero, y los 16 tokens sin fuente.

## Qué mirar antes de tocar algo

- **El cliente ya no reintenta por defecto.** `tools/api.js` pide `--reintentar` explícito, y
  sólo lo pide quien sabe que la llamada no escribe. **Las mediciones por `eval` también
  perdieron el reintento**: si una devuelve HTML, el cliente lo dice y hay que repetirla a
  mano.
- **`CORRIDAS` se abre al empezar** (`abrirCorrida_`) y `escribirCorrida_` completa esa fila.
  Una corrida que muere deja la fila con `deck_id` y sin conteos: **eso es el diagnóstico** —
  con la salvedad del punto ciego de `marcarEtapa_`, arriba.
- **Las bases no se leen desde node** (scope `drive.file`): se mide por
  `tools/api.js llamar fn=eval`. **⚠ `eval` es invocable por la API.**
- **`mapaDeTokens_` excluye las láminas escondidas**: el denominador es **172**, no 195, y
  los 23 de la lámina 10 se reportan aparte.
- **`RATIO`/`PCT` parten después del filtro y del recorte por ventana**, no antes. Estaba al
  revés y `mail_or` dividía sobre todos los períodos.
- **`SUMA` sobre cero filas devuelve `sin_datos`**; `CONTEO` sigue devolviendo `0`. El corte
  es `conValor`, así que **un `0` escrito sigue siendo un dato**.
- **`ULTIMO` elige por fecha**, no por posición; empate con valores distintos → no elige.
- **`digital` sin `id_cuenta`** cae a `leerFuente` y **recorta por ventana** con la
  `fecha_periodo` de cada solapa. `BASES.modo_periodo` **no se toca**.
- **`SECCIONES.filtro` filtra ítems de la iteración; `MARCADORES.filtro` filtra filas.**
- **Nada que recorra una presentación puede usar `getShapes()`**, y
  `piezasDeTextoDeSlide_` **saltea las celdas combinadas no principales**.
- **Los decks se llaman todos igual** en la carpeta de salida: para verificar, tomar el
  `deck_id` de la fila de `CORRIDAS`, nunca la fecha de modificación.

## Números de referencia

`MARCADORES` en **43** filas. `MAPEO` en 122 (entraron `mail_tipo` y `mail_remitente`).
Plantilla: **172 tokens** (195 menos los 23 de la lámina escondida). **Las 10 pruebas pasan.**
Anclaje: 5 anclados, los cinco con score **1,00** (saturado). `CORRIDAS` en **18 filas**, la
última **abierta** (`jm-20260806-135202`, etapa 3). Carpeta de salidas: **12 decks**, cero
shortcuts, cero huérfanos. **Presupuesto de una corrida: ~661 s medidos contra 360 disponibles.**

**⚠ `mapaTokenObjectId_` cuenta 195 tokens distintos y `tokensPorSlide_` 193**, contra el
denominador de **172** que usa esta sección. No está explicado.

**⚠ No hay ningún deck completo medido contra el denominador de hoy.** El
*34 con valor / 288 faltantes* de `jm-20260805-133836` **está superado**: se midió sobre 195
tokens y hoy son 172. No se vuelve a citar hasta que una corrida complete.
