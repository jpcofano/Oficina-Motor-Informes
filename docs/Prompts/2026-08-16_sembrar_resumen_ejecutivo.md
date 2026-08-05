# Sembrar el Resumen Ejecutivo, y que el denominador diga la verdad. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-16 · **Ubicación:** `docs/Prompts/2026-08-16_sembrar_resumen_ejecutivo.md`

> **Noveno prompt del formato nuevo: un objetivo, nada más.**
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final.**

---

## El objetivo

**Que las dos láminas de Resumen Ejecutivo tengan sus números en el deck, y que se pueda medir
cuánto se avanzó.**

Es lo que el piloto del 15/08 no llegó a hacer. **El mecanismo que lo bloqueaba ya está
implementado y probado**: un marcador de `digital` sin `id_cuenta` ahora cae a `leerFuente` y
recorta por la `fecha_periodo` de cada solapa —mail por envío, IVR por inicio—. Lo que falta es
sembrar.

**Y el riesgo que motivó hacer un piloto ya no aplica.** La serie histórica de `CORRIDAS` mostró que
**el tiempo de generación no escala con la cantidad de marcadores**: 13 marcadores dieron 186–286 s
y 19 dieron 226–346 s, y la dispersión con el mismo número es mayor que la diferencia entre los dos.
Sembrar no rompe la generación.

---

## Por qué el denominador entra en el mismo objetivo

**Esconder la lámina 10 no sacó sus 23 tokens del mapa.** `mapaDeTokens_` recorre todas las slides
sin distinguir las escondidas, así que sigue diciendo **195** cuando la plantilla emite **172**.

Esos 23 tokens **se cuentan como faltantes y no se van a llenar nunca**. Sin corregirlo, el "después"
de este sembrado se mide contra un denominador inflado y el número no significa lo que parece — que
es exactamente el problema que tuvo el conteo cuando `SUMA` devolvía ceros falsos.

**Decisión del usuario, 16/08: el mapa de tokens excluye las láminas escondidas.**

---

## Parte 0 — Medir. Sólo lectura. Reportar y seguir.

- **0.1 · ¿Cómo se detecta una lámina escondida desde el código?** `mapaDeTokens_` usa `SlidesApp`.
  **Verificar si el servicio simple expone algo como `isSkipped()`**, y si no, cuál es el camino —el
  servicio avanzado de Slides, o alguna otra señal—. **Si no hay forma de detectarlo, decirlo y
  proponer la alternativa** (por ejemplo, declarar las escondidas donde ya viven las congeladas), y
  seguir con ella.
- **0.2 · El cruce contra los `[MANUAL]`, que quedó pendiente de `0.5` del piloto.**
  `CONFIG_INFORMES.md` declara cuatro: `ecv_barrio1-3`, las conclusiones del período,
  `post_camp1-3`/`post_estado1-3`, y los tres `camp_*_insight`. **Verificar contra la plantilla que
  ninguno caiga en las slides 2 y 3.** Si alguno cae, no se cablea.
- **0.3 · Los 21 tokens de cada lámina, con su fuente.** Slide 2 (JM): 21 tokens en 18 cajas. Slide 3
  (GCBA): los mismos con prefijo `gcba_`, en 17 cajas. **Reportar para cada uno: solapa, campo lógico
  y operación propuesta.** Los que no tengan `campo_logico` en `MAPEO` son huecos para reportar, no
  para inventar.
- **0.4 · ⚠ ¿Por qué las cajas no coinciden con los tokens?** 21 tokens en 18 cajas en una lámina, y
  17 en la otra. **Alguna caja lleva más de un token, o algún token está en las dos.** Y las dos
  láminas difieren en una caja. Reportar la diferencia: puede ser normal, o puede ser un token
  faltante en GCBA como el `camp_env4_fecha` de la lámina 18.
- **0.5 · La foto previa, ahora que se puede medir sin depender de la respuesta.** Tokens con valor,
  faltantes, y tiempo desde `CORRIDAS`. **Si la corrida no deja fila en `CORRIDAS` —pasó en dos de
  tres— decirlo: es un problema de trazabilidad propio.**

Reportar los cinco y **seguir**.

---

## Parte A — El mapa excluye lo escondido

Con lo que salga de `0.1`:

- **`mapaDeTokens_` no cuenta los tokens de láminas escondidas.**
- **Pero los reporta aparte, no los borra.** Un token que existe en una lámina escondida sigue
  existiendo; lo que cambia es que no cuenta como faltante. **Si desaparece del reporte, nadie se va
  a acordar de que la lámina se puede volver a mostrar en un clic.**
- **Dejar dicho en el código por qué.** Es la clase de decisión que alguien revierte en tres meses
  sin saber que existió.

---

## Parte B — Sembrar las dos láminas

- **Una fila de `MARCADORES` por token**, con `solapa` explícita.
- **No inventar ninguna fila cuyo `campo_logico` no exista en `MAPEO`**, ni ninguna operación fuera de
  las seis: `SUMA` · `CONTEO` · `ULTIMO` · `RATIO` · `PCT` · `TEXTO`.
- **Los porcentajes van por `PCT` o `RATIO`, nunca por `SUMA`.** Sumar dos porcentajes ya rompió una
  vez, con `enc_e75_pct`.
- **`alcance` y `frecuencia` no son sumables** (`CONFIG_INFORMES.md` §4.1): `ULTIMO` o lookup.
- **El recorte por ventana va por el mecanismo del 15/08**, con la `fecha_periodo` de cada solapa.
  **Si un marcador de estas láminas queda leyendo el `snapshot` completo, va a sumar todos los
  períodos y dar un número grande, plausible y equivocado.** Verificarlo marcador por marcador.
- **Corregir la fila `resumen_ejecutivo` de `SECCIONES`**, que sigue declarada `repetible` sobre
  entidad y `manual`. **`0.2` del piloto midió que no puede ser repetible**: los tokens de GCBA
  llevan prefijo propio y una sección repetible emite el mismo bloque por ítem. **Son dos láminas con
  tokens propios y se declaran así.**
- **Diff antes y después**, con `protegidas (con diferencia): 0` como referencia.

---

## Parte C — Medir

Generar el informe y reportar contra la foto de `0.5`:

- **Tokens con valor y faltantes, antes y después**, sobre el denominador corregido de la Parte A.
  **Decir los dos números** —el viejo de 195 y el nuevo de 172— la primera vez, para que el salto no
  se lea como un error.
- **Tiempo de generación**, desde `CORRIDAS`. Con ~42 marcadores nuevos, es la primera medición
  directa de si el tiempo escala.
- **Los números de las dos láminas contra una lectura cruda de la misma ventana.** Un agregado del
  período es fácil de verificar por fuera. Si no coinciden, reportar la diferencia y **no ajustar
  nada**.
- **JM contra GCBA**: son la misma métrica sobre dos recortes. **Si algún par da idéntico, es señal
  de que el corte no se aplicó** — el mismo modo de falla que `enc_audiencia` coincidiendo por
  casualidad.
- **Que ningún marcador que hoy funciona haya cambiado de valor.**

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.** `MARCADORES`, `SECCIONES` y `PERIODOS` son
   configuración del motor: escribir ahí está bien.
2. **No se edita ninguna plantilla `.pptx`**, ni se muestra de nuevo la lámina 10.
3. **`BASES.modo_periodo` de `digital` no se cambia.** Es `snapshot` por diseño y sostiene a los
   `enc_*`.
4. **No se corre ninguna armonización**, y **`{{enc_audiencia}} → {{enc_alcance}}` no se aplica
   nunca**: el destino ya existe en la slide 6.
5. **No se siembra ninguna familia fuera de las dos láminas del Resumen Ejecutivo.**
6. **No se toca el score de anclaje ni el desempate temporal** (objetivo B, anotado), ni los 7 `ecv_`
   ambiguos, ni los tres remitentes sueltos, ni `camp_bench_*`.
7. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.**
8. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **Las dos láminas muestran números en el deck**, y coinciden con una lectura cruda de la ventana.
- **JM y GCBA dan distinto** donde tienen que dar distinto.
- **El denominador es 172 y no 195.**
- **Se sabe cuánto tardó con ~42 marcadores más.**

---

## El reporte

1. **Las cinco mediciones de la Parte 0.** En especial `0.4`: ¿por qué las cajas no coinciden con los
   tokens?
2. **Cuántos tokens se sembraron** y cuáles quedaron afuera, con motivo.
3. **Tokens con valor y faltantes, antes y después**, sobre los dos denominadores.
4. **Tiempo de generación**, y qué implica para sembrar el resto.
5. **Qué decisiones tomaste solo y por qué.**
6. **Qué premisa de este prompt resultó falsa**, si alguna. Van seis de ocho; la Parte 0 las sigue
   atrapando, que es para lo que está.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
