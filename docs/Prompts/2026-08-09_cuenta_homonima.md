# La cuenta homónima — desempate temporal. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-09 · **Ubicación:** `docs/Prompts/2026-08-09_cuenta_homonima.md`

> **Segundo prompt del formato nuevo: un objetivo, nada más.** El anterior funcionó —174 líneas de
> código en una corrida, después de tres corridas de pura documentación— y este mantiene la forma.
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final**, cuando el código funcione.

---

## Antes de empezar — cerrar lo que quedó abierto del prompt anterior

No es el objetivo, es deuda del prompt del 08/08. Tres cosas cortas, y después no se vuelve:

- **`HANDOFF_CODE.md` sigue sin reescribir.** Es el punto de partida de cada sesión; desactualizado
  hace perder la primera media hora de la siguiente.
- **Aclarar en el código y en la bitácora qué filtra `SECCIONES.filtro`.** El reporte del 08/08 dice
  que **filtra los ítems de la iteración**; en el diff aparece como filtro de marcador heredado
  (`fila.filtro || opciones.filtro_seccion`), que filtra **filas de la base**. Pueden ser las dos
  cosas y estar bien, pero hoy no se puede saber cuál leyendo. Dejarlo dicho en una frase, donde se
  lea.
- **El commit `073f210` dice "Partes A y B" y contiene también la D.** No se reescribe historia:
  alcanza con que la bitácora diga que la Parte D entró ahí, para que se pueda encontrar.

---

## El objetivo

**Que el motor lea la cuenta correcta cuando dos comparten nombre de campaña.**

El caso medido, que es el criterio de éxito: el encuentro de Orden Público es la cuenta
**`3387-JULJDGGC`** y el motor leyó **`3347-JULJDGAG`**. Las dos comparten el nombre de campaña
`TE CUENTO BS AS JM | 21/7 ORDEN PÚBLICO`, la `Segmentacion`, y hasta la columna `Audiencia`
(40874 / 37763 en las dos) — por eso `enc_audiencia = 37763` parecía correcto: **coincidía por
casualidad**. `3347` es del 16–17/07 con entregas chicas; `3387` es del 22–26/07 y es la que usó el
informe publicado.

**Por qué pasó, según lo ya medido:** `digital` es `modo_periodo = snapshot`, así que **nada filtra
por fecha**, y la elección entre dos cuentas homónimas se resuelve **sin desempate temporal**.

**Once números del deck salen de la cuenta equivocada.** Contra `docs/VALIDACION_2026-07-31.md`
§3.2: `enc_mails_enviados` 110 vs 44.043 · `enc_mails_entregados` 110 vs 43.439 · `enc_aperturas`
31 vs 4.652 · `enc_or` 28,2% vs 10,7% · `enc_clics_ctor` 1 vs 145 · `enc_ctor` 3,2% vs 3,1% ·
`enc_atendidos` 6.161 vs 71.234 · `enc_e75` 2.229 vs 27.599 · `enc_e75_pct` 36,2% vs 39% ·
`enc_marque1` 67 vs 256 · `enc_audiencia` 37.763 vs 78.637.

---

## Parte 0 — Dónde se elige la cuenta. Sólo lectura. Reportar y seguir.

**El prompt no dice dónde está el bug, porque no se verificó.** Lo que está medido es el síntoma y la
causa general, no la línea. Localizarlo es la primera mitad del trabajo.

- **0.1 · ¿Quién resuelve "qué cuenta corresponde a este encuentro"?** El join de `Union.gs` es
  `id_cuenta` ↔ `id_cuenta` y eso está auditado (`AUD-2`): ahí no hay ambigüedad posible. La
  ambigüedad tiene que estar **antes**, donde se decide con qué `id_cuenta` entrar. Encontrar esa
  función y reportarla por nombre.
- **0.2 · ¿Por qué campo desempata hoy?** Si es por nombre de campaña, decirlo. Si hay un desempate y
  falla, decir cuál.
- **0.3 · ¿Qué señal de fecha hay disponible en ese punto?** El desempate tiene que apoyarse en algo
  que exista: fecha de la campaña, fechas de envío, el rango del encuentro en `REUNIONES`. Listar qué
  hay, no suponer.
- **0.4 · ¿Cuántos casos homónimos hay además de este?** Uno arreglado a mano no es un arreglo.
  Contar los grupos de cuentas que comparten nombre de campaña en `digital`, y cuántos de esos caen
  en la ventana.

Reportar los cuatro y **seguir** — no parar.

---

## Parte A — El desempate

Con lo que salga de la Parte 0: **desempatar por proximidad temporal al encuentro**, no por orden de
aparición ni por el primero que matchee.

- **La regla se declara, no se cablea al caso.** Que funcione para `3387` y falle para el próximo
  homónimo no sirve.
- **Cuando no hay señal de fecha suficiente para desempatar, el marcador falla con motivo propio** —
  `«FALTA:...@homonimo_sin_desempate»` o equivalente— **y no elige una al azar**. Un número plausible
  de la cuenta equivocada es peor que un hueco: este bug sobrevivió porque `37763` parecía bien.
- **La traza tiene que decir qué cuenta se eligió y por qué.** Es la única forma de que el próximo
  caso se detecte sin auditar a mano.

Diff antes y después en todo cambio de configuración, con `protegidas (con diferencia): 0`.

---

## Parte B — Medir contra el informe publicado

Generar el informe y comparar los once números contra `VALIDACION_2026-07-31.md` §3.2.

- **Los cuatro de IVR son el control más duro:** con la cuenta correcta tienen que dar
  **78.637 · 71.234 · 27.599 · 256**, dígito a dígito.
- **Reportar cuáles cierran y cuáles no**, uno por uno. Si alguno no cierra, reportar la diferencia y
  **no ajustar nada** para que cierre.

---

## Lo que NO se toca, y esto importa

**`ULTIMO` no pasa a `SUMA` en este prompt.** Es una decisión explícita del usuario del 04/08:
**los dos cambios se miden por separado**, y el de la cuenta va primero. `VALIDACION` §3.2 respalda
el cambio y aun así no se hace acá.

Consecuencia esperable, que hay que anticipar y no confundir con un fracaso: **con la cuenta
corregida y `ULTIMO`, varios de los once pueden seguir sin cerrar.** Está medido que `3387` tiene
**cinco filas de mail** —22/07 ×2, 25/07, 27/07 y **03/08**— y que con `ULTIMO` sin filtro de fecha
tomaría la del **03/08, fuera de la ventana**, mientras que el informe publicado usa la del 25/07.
**Eso es el segundo problema, no una falla de este arreglo.** Reportarlo separado: cuáles fallan por
la cuenta y cuáles por la operación.

---

## Los demás límites

1. **No se edita ninguna celda de las cuatro bases.**
2. **No se edita ninguna plantilla `.pptx`.** Nada de descombinar celdas.
3. **No se agrega `seccion_id` a `MARCADORES`.**
4. **No se toca ninguno de los 7 tokens `ecv_` ambiguos**, ni los tres remitentes sueltos, ni
   `camp_bench_*`, ni `m2_` (tiene un `P1` abierto que decide el usuario).
5. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.**
6. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git** ni se borra
   nada curado por una persona.

---

## Cuándo está hecho

- **El motor lee `3387` y no `3347`** para el encuentro de Orden Público.
- **La regla es general**: se aplica a los otros casos homónimos que cuente `0.4`, o se dice por qué
  no.
- **Un homónimo sin desempate posible falla con motivo**, no con un número plausible.
- **Los cuatro de IVR cierran** contra el informe publicado.

Tres de cuatro es una buena corrida. Ninguno, y el reporte dice dónde se trabó.

---

## El reporte

1. **Dónde estaba el bug** — la función, en una línea.
2. **Los cuatro criterios: cuáles se cumplen.**
3. **Los once números, uno por uno**: cierra / no cierra, y si no, si es por la cuenta o por
   `ULTIMO`.
4. **Cuántos casos homónimos hay** y cuántos quedan resueltos por la regla.
5. **Qué decisiones tomaste solo y por qué.**
6. **Qué premisa de este prompt resultó falsa**, si alguna.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
