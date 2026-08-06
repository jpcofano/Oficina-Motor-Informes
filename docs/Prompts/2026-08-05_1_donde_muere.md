# En qué etapa muere la generación. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-05 (el archivo decía 2026-08-18; ver el renombre del 06/08) · **Ubicación:** `docs/Prompts/2026-08-05_1_donde_muere.md`

> **Undécimo prompt del formato nuevo: un objetivo, nada más.**
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final.**

---

## Antes de empezar — `HANDOFF_CODE.md`

Lleva varias corridas pendiente y ahora hace falta de verdad: **el diagnóstico se dio vuelta en la
última corrida** y el handoff sigue diciendo lo viejo. Se escribe primero, con el estado corregido, y
después se empieza.

---

## El objetivo

**Saber en qué etapa muere `generarInforme`.**

**El diagnóstico actual, corregido por Code el 17/08:** el deck **se crea siempre** —está en Drive en
las 22 corridas— pero la corrida **no termina**: muere entre copiar la plantilla y escribir el
cierre. `CORRIDAS` pasó de 12 a 15 filas y la última quedó abierta, con `deck_id` y el marcador de
corrida en curso. **Eso es lo que prueba que muere; los 22 decks sólo probaban que llega a copiar.**

**Y son dos problemas a la vez, no uno:** el deck se crea (así que no es sólo transporte) y la
corrida muere (así que no es sólo respuesta grande). El prompt del 17/08 los planteó como
excluyentes y no lo son.

**El territorio está acotado:** entre `abrirCorrida_` y `escribirFaltantes_` hay unas ciento treinta
líneas. La muerte está ahí — en la expansión de secciones, la resolución de marcadores, el reemplazo
de cajas, o la escritura de faltantes.

---

## Parte 0 — Instrumentar. Reportar y seguir.

**Ahora es barato y antes no lo era.** Con la fila abierta desde el principio, cada etapa puede
escribir su duración en esa misma fila a medida que avanza. **La primera corrida que muera va a decir
en qué etapa**, sin que nadie tenga que estar mirando.

- **0.1 · Listar las etapas reales de `generarInforme`**, en orden, entre `abrirCorrida_` y
  `escribirCorrida_`. No inventarlas: leerlas del código y reportarlas.
- **0.2 · Instrumentar cada una para que escriba en la fila abierta**: qué etapa arrancó y cuánto
  tardó la anterior. **Que se escriba a medida que avanza, no al final** — si se acumula y se escribe
  junta, una corrida que muere no deja nada, que es el problema que se acaba de arreglar.
- **0.3 · Correr y mirar la fila.** Si la corrida muere, la fila dice hasta dónde llegó. Si completa,
  dice cuánto tardó cada etapa y **dónde están los ~150 s sin atribuir** —el anclaje son 93 s de
  ~250—.
- **0.4 · ¿Se duplica?** Si la corrida deja **más de una fila**, los reintentos del cliente están
  relanzando la generación entera. Es la hipótesis que explica los cinco decks de una sola corrida
  del 04/08. **Ahora se puede ver: reportar cuántas filas dejó.**

Reportar los cuatro y **seguir**.

---

## Parte A — Según lo que muestre la fila

**No está escrito acá a propósito.** Van siete de nueve prompts con una premisa central falsa por
prescribir antes de medir.

- **Si muere por tiempo en una etapa concreta:** atacar esa etapa. **No optimizar el anclaje sólo
  porque es el sospechoso conocido** — son 93 s de ~250, y el deck ya está creado cuando muere, así
  que el anclaje **ya pasó**.
- **Si muere por otra cosa** —cuota, memoria, una excepción tragada— reportar cuál y arreglar eso.
- **Si completa y el problema era sólo que la respuesta no volvía**, entonces alcanza con que
  `generarInforme` devuelva poco y el resultado se consulte aparte. **El mapa de tokens pesa 25.463
  caracteres**, y es la parte gorda.

**Elegir la más simple que resuelva lo medido y decir por qué se descartaron las otras.**

---

## Parte B — Verificar los cuatro objetivos, si la corrida completa

**Sólo si hay corrida completa.** Ya se intentó dos veces y no salió; no forzarlo.

- **Los 16 ceros falsos:** San Cristóbal y Retiro con `«FALTA»` y no `0` en `enc_atendidos`,
  `enc_audiencia`, `enc_marque1`, `enc_e75`.
- **`ULTIMO` por fecha:** `enc_mails_enviados` en **44.043**.
- **Los once de Orden Público:** `78.637 · 71.234 · 27.599 · 256 · 44.043 · 43.439 · 4.652 · 145`,
  más `enc_or` 10,7 · `enc_ctor` 3,1 · `enc_e75_pct` 38,74.
- **Los 24 del Resumen Ejecutivo:** que aparezcan y que **JM y GCBA den distinto** — mail 838.571
  contra 3.839.688, OR 25,42% contra 28,57%. **Si algún par da idéntico, el corte no se aplicó.**
- **Tokens con valor y faltantes sobre 172**, y **tiempo con 43 marcadores**.

**Confirmar por `deck_id` de la fila de `CORRIDAS` de qué deck se está leyendo**, no por fecha de
modificación: hay 22 decks con el mismo nombre.

Si algo no cierra, reportar la diferencia y **no ajustar nada**.

---

## Dos anotaciones a `PENDIENTES_consistencia.md`

Salieron del punto 7 del 17/08 y no están escritas:

- **Los reintentos del cliente no son idempotentes.** Cada reintento relanza la generación entera y
  deja otro deck; cinco decks de una sola corrida del 04/08. **Arrastra que la verificación del 09/08
  —"no hubo doble escritura, `CORRIDAS` tiene una sola fila"— era vacía**, porque `CORRIDAS` no
  registraba. `P1`.
- **Los decks de salida no llevan fecha ni `corrida_id` en el nombre**, así que "el deck generado" es
  ambiguo justo cuando la verificación depende de mirar el correcto. `P2`.

Y queda sin explicación, para anotar como observación: **los decks de 20:08, 20:14 y 20:20 del 05/08**
—seis minutos entre uno y otro— que nadie lanzó.

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.** `CORRIDAS` es hoja del motor: escribir ahí está
   bien.
2. **No se edita ninguna plantilla `.pptx`**, ni se muestra de nuevo la lámina 10.
3. **No se siembra ningún marcador nuevo.** El sembrado sigue parado.
4. **`BASES.modo_periodo` de `digital` no se cambia.**
5. **No se corre ninguna armonización**, y **`{{enc_audiencia}} → {{enc_alcance}}` no se aplica
   nunca**.
6. **No se toca el criterio de match del anclaje.** Si `0.3` muestra que ahí está el costo, sólo
   rendimiento.
7. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **La fila de `CORRIDAS` dice en qué etapa se murió**, o cuánto tardó cada una si completó.
- **Se sabe si la corrida se duplica.**
- **Si completó, los cuatro objetivos quedaron confirmados o desmentidos.**

**El primero es el que no se puede saltear.**

---

## El reporte

1. **Las cuatro mediciones de la Parte 0.** En especial `0.3`: ¿dónde murió, o dónde están los 150 s?
2. **Qué arreglo elegiste y por qué descartaste los otros.**
3. **Los cuatro objetivos pendientes**, si hubo corrida completa.
4. **Qué decisiones tomaste solo y por qué.**
5. **Qué premisa de este prompt resultó falsa**, si alguna.
6. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
