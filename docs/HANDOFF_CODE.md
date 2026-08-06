# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-18, antes de arrancar el objetivo de dónde muere la
generación · último commit al escribirlo: `5361f78`

## Dónde estamos

**El bloqueo del proyecto es que `generarInforme` no termina.** Todo lo demás está construido
y **nada de lo construido en los últimos cinco objetivos está verificado contra un deck**.

**El diagnóstico, corregido el 17/08 y ésta es la versión buena:**

- **El deck se crea siempre.** Hay **22 decks en la carpeta de salida** y estaban ahí desde el
  principio; nadie había mirado la carpeta.
- **Pero la corrida no termina.** Cuando `CORRIDAS` pasó a escribirse **al empezar**, la
  primera corrida dejó la fila **abierta**: `jm-20260805-222543`, con `deck_id` y el marcador
  *"(corrida en curso — si esto queda así, murió antes de terminar)"*.
- **Los 22 decks sólo probaban que llega a copiar la plantilla.** La fila abierta es lo que
  prueba que muere.
- **Son dos problemas a la vez, no uno excluyente:** el deck se crea (no es *sólo*
  transporte) y la corrida muere (no es *sólo* respuesta grande).

**El territorio está acotado:** la muerte está entre `abrirCorrida_` y `escribirCorrida_` —
expansión de secciones, resolución de marcadores, reemplazo de cajas, escritura de faltantes.

## Trabado

1. **⚠ `generarInforme` no completa.** Es el punto 1 y bloquea a los demás.
2. **Cinco objetivos construidos y sin verificar contra un deck:** los 16 ceros falsos de
   `SUMA`; `ULTIMO` por fecha (`enc_mails_enviados` = 44.043); los once de Orden Público; el
   agregado global de `digital`; y los **24 marcadores del Resumen Ejecutivo** (`MARCADORES`
   pasó de 19 a **43 filas**). **Todos probados contra las funciones, ninguno contra el deck.**
3. **Los reintentos del cliente no son idempotentes:** cada uno relanza la generación entera
   y deja otro deck. Explica los cinco decks de una sola corrida del 04/08. **Y arrastra que
   la verificación del 09/08 —"no hubo doble escritura"— era vacía**, porque `CORRIDAS` no
   registraba.
4. **Tres grupos recortan a cero filas** con el recorte por ventana: IVR (0 de 57 sobre
   `Inicio`), `sd_pauta_*` y `Digital`. No se sabe si es correcto.
5. **16 tokens del Resumen Ejecutivo sin fuente**: los ocho de Call Center (`cc_base` no
   existe en ninguna base), los seis de impresiones por plataforma, y `contenidos_total`.
6. **`CAMPANAS` sin filas de `jm`** y **`REUNIONES` no es el temario** (le faltan Primera
   Persona y Registro Civil).

## Esperando decisión tuya

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

1. **En qué etapa muere la generación** — instrumentar las etapas sobre la fila abierta.
2. **Verificar los cinco objetivos** con una corrida completa.
3. **Retomar el sembrado**, que está parado hasta que una corrida se pueda mirar.
4. **Objetivo B**, los tres grupos que recortan a cero, y los 16 tokens sin fuente.

## Qué mirar antes de tocar algo

- **`CORRIDAS` se abre al empezar** (`abrirCorrida_`) y `escribirCorrida_` completa esa fila.
  Una corrida que muere deja la fila con `deck_id` y sin conteos: **eso es el diagnóstico**.
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
- **Hay 22 decks con el mismo nombre** en la carpeta de salida: para verificar, tomar el
  `deck_id` de la fila de `CORRIDAS`, nunca la fecha de modificación.

## Números de referencia

`MARCADORES` en **43** filas. `MAPEO` en 122 (entraron `mail_tipo` y `mail_remitente`).
Plantilla: **172 tokens** (195 menos los 23 de la lámina escondida). **Las 10 pruebas pasan.**
Anclaje: 5 anclados, los cinco con score **1,00** (saturado). `CORRIDAS` en **15 filas**, la
última **abierta**. Último deck completo verificado: `1vEdfOnXV3o3SmJKuzCG_WcWoqn_9_9_cpiAt4DV8Paw`
(`jm-20260805-133836`), **34 con valor / 288 faltantes**, de los cuales **16 son ceros falsos**.
