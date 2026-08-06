# Que una corrida se pueda verificar de punta a punta. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-17 · **Ubicación:** `docs/Prompts/2026-08-17_generar_informe.md`

> **Décimo prompt del formato nuevo: un objetivo, nada más.**
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final.**

---

## El objetivo

**Que `generarInforme` complete, deje registro, y se pueda mirar el deck resultante.**

**Éste es el bloqueo principal del proyecto, y ya no es una molestia de transporte.** Los últimos
**cuatro objetivos** —`SUMA` sobre cero filas, `ULTIMO` por fecha, el agregado global de `digital`, y
el sembrado del Resumen Ejecutivo— **están todos probados contra las funciones y ninguno contra un
deck**. Los 16 ceros falsos siguen sin confirmarse como corregidos. Los 24 marcadores nuevos, sin
verse.

Seguir sembrando encima de eso agrega superficie sin confirmar. **Se para el sembrado hasta que una
corrida se pueda mirar entera.**

---

## Lo que ya está medido, y no hay que volver a medir

- **El timeout de 540 s es de `tools/api.js`**, del lado del cliente. **No es el límite de Apps
  Script.** Que el cliente corte no prueba que la función haya muerto.
- **La respuesta vuelve una de cada cuatro veces**, más o menos. `ECONNRESET`, HTML 404, y respuestas
  demasiado grandes.
- **A veces el motor tampoco registra en `CORRIDAS`** — tres de las últimas cuatro. **Eso es lo que
  dice que no es sólo transporte.**
- **El anclaje tarda 93 s medidos**, y la generación completa tardaba **~250 s** cuando volvía.
  **Hay ~150 s sin atribuir y nadie cronometró las etapas por separado.**
- **El tiempo no escala con la cantidad de marcadores** —13 dieron 186–286 s y 19 dieron 226–346 s—,
  así que el costo está dominado por otra cosa.

---

## Parte 0 — Separar los tres problemas antes de arreglar ninguno. Sólo lectura. Reportar y seguir.

**Hay al menos tres cosas distintas mezcladas bajo "no vuelve", y arreglar la equivocada es la forma
más cara de perder una corrida.** Separarlas es el objetivo de esta parte.

- **0.1 · ⚠ ¿La función completa y la respuesta no vuelve, o la función no completa?** Es **la**
  pregunta. Se responde mirando **Drive**: lanzar una generación, esperar, y ver **si el deck existe
  aunque el cliente haya cortado**. Si el deck aparece, el problema es transporte y el motor está
  bien. Si no aparece, el motor muere y hay que ver dónde. **Reportar cuál de las dos es, con la
  evidencia.**
- **0.2 · ¿Qué dice el log de ejecución de Apps Script?** El cliente corta a 540 s, pero la ejecución
  queda registrada del lado de Google con su duración real y su estado —completada, timeout, error—.
  **Eso desempata `0.1` sin adivinar.**
- **0.3 · Cronometrar las etapas.** Los ~150 s sin atribuir. Instrumentar la generación para que
  registre cuánto tardó cada etapa —lectura de bases, anclaje, resolución de marcadores, copia de la
  plantilla, escritura de las cajas— y correrla una vez. **Es medición, no optimización: no cambiar
  nada todavía.**
- **0.4 · ¿Por qué no registra en `CORRIDAS`?** Ver **en qué momento** de la generación se escribe esa
  fila. Si se escribe al final, una corrida que muere antes no deja rastro **por diseño**, y eso es
  arreglable solo: escribir al empezar y actualizar al terminar. **Reportar cuándo se escribe hoy.**
- **0.5 · ¿La respuesta es demasiado grande?** Ya apareció `respuesta demasiado grande` en llamadas
  anteriores y `unirDigitalPorCuenta` no volvía ni devolviendo cinco campos. **Medir qué devuelve
  `generarInforme` hoy**: si son kilobytes o megabytes. Una respuesta enorme se corta en el
  transporte aunque la función haya andado perfecto.

Reportar los cinco y **seguir**. **Si `0.1` y `0.2` muestran que el motor completa bien, el objetivo
cambia de "arreglar el motor" a "no depender de la respuesta", y eso es mucho más barato.**

---

## Parte A — El arreglo, según lo que salga de la Parte 0

**No está escrito acá a propósito.** Van seis de ocho prompts con una premisa central falsa por
prescribir la solución antes de medir. Las tres salidas posibles, para que estén nombradas:

- **Si es transporte y el motor completa:** que `generarInforme` **devuelva poco** —un id de corrida y
  nada más— y que el resultado se consulte después con una segunda llamada barata. **La verificación
  deja de depender de que la respuesta vuelva.**
- **Si el motor muere por tiempo:** partirlo en etapas reanudables, o encontrar el costo real con
  `0.3` y bajarlo. **No optimizar el anclaje sólo porque es el sospechoso conocido: son 93 s de
  ~250.**
- **Si es la respuesta demasiado grande:** recortarla, que es la variante barata de la primera.

**Elegir la más simple que resuelva lo medido, aplicarla, y decir por qué se descartaron las otras.**

**Y en cualquier caso: `CORRIDAS` se escribe al empezar, no al terminar.** Una corrida que muere
tiene que dejar rastro; es la diferencia entre diagnosticar y adivinar. Si `0.4` muestra que ya es
así, no tocar nada.

---

## Parte B — Verificar los cuatro objetivos que quedaron sin confirmar

**Con una corrida que se pueda mirar, confirmar lo que se viene arrastrando.** Esto es el punto del
prompt: no alcanza con que la generación ande, hay que usarla.

- **Los 16 ceros falsos de `SUMA`**: San Cristóbal y Retiro tienen que mostrar `«FALTA»` y no `0` en
  `enc_atendidos`, `enc_audiencia`, `enc_marque1` y `enc_e75`.
- **`ULTIMO` por fecha**: `enc_mails_enviados` en **44.043**.
- **Los once de Orden Público**: `78.637 · 71.234 · 27.599 · 256 · 44.043 · 43.439 · 4.652 · 145`.
- **Los 24 marcadores del Resumen Ejecutivo**: que aparezcan, y que **JM y GCBA den distinto** —mail
  838.571 contra 3.839.688, OR 25,42% contra 28,57%—. **Si algún par da idéntico, el corte no se
  aplicó.**
- **Tokens con valor y faltantes sobre 172**, y **tiempo con 43 marcadores**.

**Si algo de esto no cierra, reportar la diferencia y no ajustar nada.**

---

## Lo que queda anotado y no entra acá

Tres cosas que Code midió y no resolvió. **Anotarlas en `PENDIENTES_consistencia.md` si no están, y
seguir.** No se tocan en este prompt.

- **Tres grupos recortan a cero filas**: IVR (0 de 57 sobre `Inicio`), `sd_pauta_*` y `Digital`.
  Mismo patrón, y no se sabe si es correcto o si el criterio de fecha no aplica a pauta. **Puede ser
  un hallazgo grande o puede ser nada; hoy no se sabe.**
- **16 tokens sin fuente**: los ocho de Call Center —`cc_base` no existe en ninguna base y Call
  Center no está en `digital`—, los seis de impresiones por plataforma, y `contenidos_total`.
  Pregunta para el equipo, no trabajo de motor.
- **La fila `resumen_ejecutivo` de `SECCIONES` sigue `repetible` + `manual`.** Ya está medido que no
  puede ser repetible. **Corregirla es de una línea: si sobra margen al final, hacerlo; si no,
  anotarlo.**

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.**
2. **No se edita ninguna plantilla `.pptx`**, ni se muestra de nuevo la lámina 10.
3. **No se siembra ningún marcador nuevo.** El sembrado está parado hasta que una corrida se pueda
   verificar.
4. **`BASES.modo_periodo` de `digital` no se cambia.**
5. **No se corre ninguna armonización**, y **`{{enc_audiencia}} → {{enc_alcance}}` no se aplica
   nunca**.
6. **No se toca el score de anclaje ni el desempate temporal** (objetivo B, anotado) **salvo que
   `0.3` muestre que ahí está el costo** — y en ese caso, sólo el rendimiento, nunca el criterio de
   match.
7. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **Se sabe si el motor completa o muere**, con evidencia.
- **Una corrida deja fila en `CORRIDAS` aunque falle.**
- **Se puede mirar un deck generado** sin depender de que la respuesta vuelva.
- **Los cuatro objetivos pendientes quedaron confirmados o desmentidos.**

**El tercero es el que no se puede saltear.** Sin eso, el próximo prompt arranca igual de ciego.

---

## El reporte

1. **Las cinco mediciones de la Parte 0.** En especial `0.1`: ¿completa o muere?
2. **Qué arreglo elegiste y por qué descartaste los otros dos.**
3. **Los cuatro objetivos pendientes**: cuáles quedaron confirmados y cuáles no.
4. **Tokens con valor y faltantes sobre 172**, y tiempo con 43 marcadores.
5. **Qué decisiones tomaste solo y por qué.**
6. **Qué premisa de este prompt resultó falsa**, si alguna.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
