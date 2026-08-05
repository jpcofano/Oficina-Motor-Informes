# Piloto de sembrado — el Resumen Ejecutivo, JM y GCBA. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-15 · **Ubicación:** `docs/Prompts/2026-08-15_piloto_resumen_ejecutivo.md`

> **Octavo prompt del formato nuevo: un objetivo, nada más.**
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final.**

---

## Antes de empezar — tres anotaciones cortas a `PENDIENTES_consistencia.md`

Las tres salieron de corridas anteriores y **ninguna quedó donde se lee**. Van primero porque son
baratas y porque el handoff se reescribe entero cada corrida.

- **`rrss_area1` aparece en dos cajas de la slide 21.** Colisión viva de tokens; ningún renombre la
  toca, así que no bloquea nada. `P2`. Hoy sólo figura en una lista vieja de familias numeradas, que
  no es lo mismo que estar anotada.
- **`{{enc_audiencia}} → {{enc_alcance}}` no se debe aplicar nunca.** El destino ya existe en la
  slide 6, así que aplicarlo crearía dos cajas con `enc_alcance` — la regresión conocida. Y
  `enc_audiencia` está cableado a `ivr_audiencia`: **la ocurrencia que queda es legítima, no un resto
  sin renombrar.** `P1`, porque una armonización futura puede intentarlo de nuevo sin saberlo.
- **`generarInforme` no vuelve.** El intento del 13/08 murió en el timeout de 540 s y el reintento
  dio `ECONNRESET`. **Consecuencia concreta: el arreglo de `SUMA` sobre cero filas está probado
  contra la función pero nunca contra un deck**, y hace tres corridas que no se verifica nada de
  punta a punta. `P1`. Anotar también el candidato ya identificado para el timeout —el scoring
  `O(realizadas × candidatos)` del anclaje— y que el anclaje solo tarda 93 s, así que hay ~450 s en
  otro lado.

---

## El objetivo

**Cablear el Resumen Ejecutivo, en sus dos versiones —JM y GCBA— y medir cuánto cuesta.**

Es un **piloto**, y tiene doble propósito. `MARCADORES` tiene 19 filas para 172 tokens de plantilla;
sembrar el resto es el trabajo grande que viene. Antes de invertir en ~150 filas hay que saber dos
cosas:

1. **Que el método de sembrado funciona** y produce números verificables en el deck.
2. **Cuánto tiempo agrega cada token a la generación.** Con 19 filas ya se toca el límite de Apps
   Script. **Si el tiempo escala con la cantidad de tokens, sembrar 150 produce un informe que no se
   puede generar**, y el objetivo siguiente pasa a ser el generador, no el cableado.

---

## La decisión del usuario del 15/08

**Las dos láminas de Resumen Ejecutivo llevan el período del informe** —la ventana semanal— **y cada
canal lo recorta por su propia fecha.** Una lámina es de JM y la otra de GCBA.

- **Mail: las que se mandaron esos días** → fecha de envío.
- **IVR: las que empezaron esos días** → fecha de inicio.

**Eso ya está mapeado y no hay que definirlo.** `MAPEO` tiene `fecha_periodo` elegida por solapa:
`Directa Mail` → columna **F** (`mail_fecha`, envío) · `Directa IVR` → columna **D** (`ivr_inicio`,
inicio) · `Directa SMS` → **D** · `Digital` → **E** · `Seguimiento digital` → **L**. **Coincide con
el criterio del usuario sin ningún cambio.**

**Esto contradice lo que declara `SECCIONES` hoy** —`resumen_ejecutivo` con `estado = manual` y
`falta = "es redacción, no dato"`— y esa declaración queda **derogada por la decisión del usuario**:
son datos agregados, no redacción. Corregir la fila.

El usuario agregó: *"en principio hacemos así y en todo caso más adelante ajustamos"*. **Preferir la
solución más simple y reversible.**

---

## Parte 0 — Medir. Sólo lectura. Reportar y seguir.

Cinco de estas seis pueden cambiar el diseño de la Parte A. **Ninguna está verificada.**

- **0.1 · El inventario real, de la plantilla y no del diccionario.** Cuántas cajas hay en las
  láminas de Resumen Ejecutivo, con qué tokens exactos, y en qué slides. `TOKENS.md` documenta tres
  `gcba_*` explícitos —`gcba_mail_envios`, `gcba_sms_envios`, `gcba_sms_entregados`— y describe al
  resto como *"los mismos con prefijo `gcba_`"* de `imp_ pauta_ mail_ cc_ ivr_`. **El conteo de 19
  que circula viene de una medición del 04/08, no del diccionario: medirlo de nuevo.**
- **0.2 · ¿Es una sección repetible o son dos láminas con tokens propios?** `SECCIONES` declara
  `resumen_ejecutivo` como `repetible` sobre `entidad (JM / GCBA)`. **Pero si los tokens de GCBA
  llevan prefijo propio —`gcba_mail_envios` frente a `mail_envios`— entonces no puede ser una sección
  repetida**: una sección repetible emite el mismo bloque de tokens por cada ítem. **Reportar qué
  hay, porque cambia todo el cableado.** Si son dos láminas con tokens propios, se declaran así.
- **0.3 · ⚠ El recorte por ventana en una base `snapshot`. Éste es el punto duro del prompt.**
  `digital` es `modo_periodo = snapshot` y **por diseño devuelve todas las filas, ignorando la
  ventana** — la nota de `BASES` explica por qué: sus solapas usan fecha de inicio con lead de 3 a 7
  días, y el recorte lo hace el agregador vía link campaña↔encuentro. **Eso es correcto para los
  `enc_*` y no se toca.** Pero el Resumen Ejecutivo necesita justo lo contrario: recorte por ventana,
  con `fecha_periodo` como campo. **Medir si un marcador puede pedir recorte por ventana aunque su
  base sea `snapshot`** —vía `periodo_ref`, vía `MARCADORES.filtro`, o de ninguna forma— y reportar
  cuál de las tres es. **No cambiar el `modo_periodo` de `digital`: rompe los `enc_*` que hoy
  funcionan.** Si no existe el mecanismo, proponer el más simple y seguir con él.
- **0.4 · La fuente de cada token.** `CONFIG_INFORMES.md` §4.1 fija Seguimiento Digital como fuente
  de fila para `mail_*`, `ivr_*` y `cc_*`. **Verificar que valga también para sus gemelos `gcba_*`**,
  y de dónde salen `imp_*`, `pauta_*` y los dos de SMS.
- **0.5 · Cruzar contra los `[MANUAL]` de `CONFIG_INFORMES.md` antes de cablear**, que es la
  corrección escrita el 06/08. Cualquier token de esta lista declarado manual **no se cablea**.
- **0.6 · La foto de tiempo, que es la mitad del piloto.** Correr la generación **antes** de sembrar
  y anotar: cuánto tarda, cuántos tokens con valor, cuántos faltantes. **Si no vuelve por el timeout,
  ése es el resultado y hay que decirlo** — y entonces medir el tiempo de las etapas por separado
  para saber dónde se va.

Reportar los seis y **seguir**. Si `0.2` o `0.3` dan algo que hace inviable la Parte A como está
escrita, **decirlo, proponer la variante, y seguir con ella.**

---

## Parte A — Sembrar

- **Una fila de `MARCADORES` por token**, con `solapa` explícita. **No inventar ninguna fila cuyo
  `campo_logico` no exista en `MAPEO`**: si falta, es un hueco para reportar, no un cableado.
- **No inventar operaciones.** Las seis son `SUMA` · `CONTEO` · `ULTIMO` · `RATIO` · `PCT` · `TEXTO`.
- **El recorte por ventana va por el mecanismo que salga de `0.3`**, usando `fecha_periodo` de cada
  solapa. Es el punto del prompt: **si estos marcadores heredan el `snapshot` de `digital`, van a
  sumar todas las filas de todos los períodos y el número va a salir grande, plausible y
  equivocado** — el modo de falla de siempre.
- **Los porcentajes van por `PCT` o `RATIO`, nunca por `SUMA`.** Sumar dos porcentajes es el error
  que ya apareció con `enc_e75_pct`.
- **`alcance` y `frecuencia`, si aparecen, no son sumables** (`CONFIG_INFORMES.md` §4.1): van por
  `ULTIMO`/lookup.
- **Diff antes y después**, con `protegidas (con diferencia): 0` como referencia.

---

## Parte B — Medir el piloto

Generar el informe y reportar, contra la foto de `0.6`:

- **Cuántos tokens con valor y cuántos faltantes**, antes y después.
- **⚠ Cuánto tardó la generación, antes y después.** Es el dato que decide el objetivo siguiente.
  **Si el tiempo creció en proporción a los tokens sembrados, el próximo prompt es el generador y no
  el sembrado** — y hay que decirlo con esas palabras en el reporte.
- **Los números, contra una lectura cruda de la base.** Un agregado sobre el período
  entero es fácil de verificar por fuera: si el motor y la lectura directa no coinciden, reportar la
  diferencia y **no ajustar nada**.
- **Que ningún marcador que hoy funciona haya cambiado de valor.**

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.** `PERIODOS`, `MARCADORES` y `SECCIONES` son
   hojas de configuración del motor: escribir ahí está bien.
   **Y `BASES.modo_periodo` de `digital` no se cambia**: es `snapshot` por diseño y sostiene a los
   `enc_*`.
2. **No se edita ninguna plantilla `.pptx`.** La lámina 10 ya está escondida y no se toca nada más.
3. **No se corre ninguna armonización.** No hay nada que aplicar salvo el renombre que colisiona.
4. **No se toca el score de anclaje ni el desempate temporal.** Sigue siendo el objetivo B, anotado.
5. **No se siembra ninguna familia que no sea la del Resumen Ejecutivo.** Es un piloto: si sale bien,
   el resto viene después con la medición de tiempo en la mano.
6. **No se agrega `seccion_id` a `MARCADORES`**, no se tocan los 7 `ecv_` ambiguos, ni los tres
   remitentes sueltos, ni `camp_bench_*`.
7. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.** La corrección de
   `SECCIONES.resumen_ejecutivo` es un dato de configuración desactualizado, no una decisión con ID.
8. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **Los tokens del Resumen Ejecutivo tienen fila en `MARCADORES`** — o se explica cuáles no y por qué.
- **Los marcadores recortan por la ventana del informe**, con la fecha propia de cada canal.
- **El deck muestra los números** y coinciden con una lectura cruda **de la misma ventana**.
- **Se sabe cuánto tiempo agrega cada token**, que es lo que decide el objetivo siguiente.

Tres de cuatro es buena corrida. **El cuarto es el que no se puede saltear**: sin la medición de
tiempo, el piloto no sirvió de piloto.

---

## El reporte

1. **Las seis mediciones de la Parte 0.** En especial `0.2` —¿repetible o dos láminas?— y `0.3`
   —¿se puede recortar por ventana en una base `snapshot`, y cómo?—.
2. **Cuántos tokens se sembraron** y cuáles quedaron afuera, con motivo.
3. **Tokens con valor y faltantes, antes y después.**
4. **⚠ Tiempo de generación, antes y después.** Y qué implica para el sembrado del resto.
5. **Qué decisiones tomaste solo y por qué.**
6. **Qué premisa de este prompt resultó falsa**, si alguna. Van cinco de siete; la Parte 0 las está
   atrapando, que es para lo que está.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
