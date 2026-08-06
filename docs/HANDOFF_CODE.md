# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-06, al cerrar "una invocación, una corrida" · último commit
al escribirlo: `06716de`

## Dónde estamos

**El bloqueo del proyecto sigue siendo que `generarInforme` no termina.** Todo lo demás está
construido y **nada de lo construido en los últimos cinco objetivos está verificado contra un
deck**.

**Lo que se cerró hoy:** una invocación deja **una fila y un deck**. El reintento del cliente
ya no relanza la generación. La carpeta de salidas **cierra contra `CORRIDAS`**: 12 decks, 12
filas con deck, cero huérfanos.

**El diagnóstico, y ésta es la versión buena:**

- **El deck se crea siempre**, y la corrida muere en el medio. Son dos cosas a la vez, no una
  excluyente: no es *sólo* transporte y no es *sólo* respuesta grande.
- **La muerte está entre `abrirCorrida_` y `escribirCorrida_`** — cinco etapas instrumentadas.
- **Dónde muere no es estable entre corridas.** El 05/08 una llegó a la etapa 4 a los +324 s;
  hoy `jm-20260806-135202` quedó en la etapa 3 a los +159 s. **Las etapas 1+2 tardaron 159 s
  hoy contra ≤125 s el 05/08.**
- **⚠ No hay causa establecida.** El límite de 6 minutos es un candidato, no un hecho probado:
  las dos corridas del 05/08 que lo "probaban" corrieron **de a dos sobre la misma planilla**.

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

1. **Por qué muere la corrida** — con una sola corrida por invocación, que es lo que faltaba
   para poder medir. El punto ciego de `marcarEtapa_` se cierra antes o al mismo tiempo.
2. **Verificar los cinco objetivos** con una corrida completa.
3. **Retomar el sembrado**, que está parado hasta que una corrida se pueda mirar.
4. **Objetivo B**, los tres grupos que recortan a cero, y los 16 tokens sin fuente.

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
última **abierta** (`jm-20260806-135202`, etapa 3). Carpeta de salidas: **12 decks** y 7
shortcuts, cero huérfanos.

**⚠ No hay ningún deck completo medido contra el denominador de hoy.** El
*34 con valor / 288 faltantes* de `jm-20260805-133836` **está superado**: se midió sobre 195
tokens y hoy son 172. No se vuelve a citar hasta que una corrida complete.
