# Paso 2026-08-21_19 — El desatendido entra al camino del usuario

**Estado:** no ejecutado.
**Reemplaza:** nada.
**Toca:** `PanelBackend.gs`, `Panel.html`, `docs/PROCESO_SEMANAL.md`, `docs/ESCRITORES.md`.

---

## Contexto — el corte está en el panel, la continuación no

`Desatendida.gs` tiene el mecanismo completo: plan por sección, encadenado por triggers,
autolimpieza, freno, y cuatro guardas. **No está cableado a ningún lado**: se arranca con
`iniciarCorridaDesatendidaJM()` desde el editor.

`panel_generar` llama a `generarInforme` **sin `continuable`**, así que no escribe `PLAN_CORRIDA`
ni crea trigger. **El botón del camino del usuario puede cortar y dejar un deck incompleto sin
forma de continuarlo.** Hasta el 21/08 no se notaba porque ninguna corrida había cortado.

**Y ya está mordiendo.** Medido sobre `CORRIDAS`, misma semana `agosto_14_20`:

| corrida | impresos | faltaron | etapa 4 |
|---|---|---|---|
| `jm-20260821-194602` | 92 | 312 | 191 s |
| `jm-20260821-224727` | 65 | 339 | 257 s |

**La segunda tiene el `_15` aplicado —que agrega 22 tokens resueltos— y pintó 27 valores menos.**
La diferencia no es el cableado: es que cortó. Y la desatendida `jm-20260821-230048`, con otro
período, pintó **228** en **124 s** de etapa 4.

---

## Parte 0 — verificación de premisas · **Sonnet** · sólo lectura · reportar y parar

**0.1 · El cableado que falta.** Confirmar contra el código que `panel_generar` no pasa
`continuable`, no escribe `PLAN_CORRIDA` y no crea triggers; y que `iniciarCorridaDesatendida_` no
está referenciada desde `Codigo.gs` ni `PanelBackend.gs`. Reportar toda entrada existente al
mecanismo.

**0.2 · Qué necesita el front para mostrar el avance.** `leerPlan_`, `leerEstadoCorrida_` y la
hoja `PLAN_CORRIDA` ya existen. Reportar qué devuelve cada uno y **si alcanza para pintar una
pantalla sin agregar nada al motor**. La respuesta esperada es que sí; si falta algo, decir qué.

**0.3 · ⭐ Por qué dos corridas de la misma semana dan distinto — medir, no explicar.** Sobre
`CORRIDAS`, comparar `jm-20260821-194602` y `jm-20260821-224727`: mismo `periodo_ref`, 92 contra
65 impresos y 312 contra 339 faltantes, con el `_15` aplicado en el medio. **La hipótesis es que
la segunda cortó y por eso pintó menos.** Verificarla contra el rastro de etapas y el reporte de
corte de cada una. ⛔ **Si la hipótesis no se sostiene, PARAR**: sería una regresión del `_15` y
eso va antes que cualquier pantalla.

**0.4 · El período de la desatendida.** `jm-20260821-230048` corrió con `R-11 (calculado)` y las
del panel con `agosto_14_20`. Reportar qué semana resuelve `R-11` hoy y si es la misma. **No es un
detalle**: el botón nuevo tiene que mandar el período elegido, no dejar que se calcule solo.

**0.5 · Las anclas huérfanas.** Las dos filas de `ANCLAJE_PENDIENTE` que el panel ya marca como
*"ninguna reunión vigente la reclama"*. Reportar cuántas hay y cómo se distingue una huérfana de
una vigente, que es lo que la Parte C necesita.

**Reportar y parar.**

---

## Parte A — el botón · **Opus** · effort alto

Un camino nuevo en `PanelBackend.gs` que arranca la corrida **desatendida**, y el botón que lo
llama.

Reglas:

1. **El período y las secciones viajan igual que hoy.** El botón nuevo no puede perder lo que el
   usuario eligió en pantalla — es la diferencia entre `agosto_14_20` y `R-11 (calculado)` que
   0.4 mide. Si el mecanismo hoy no acepta la lista de secciones, **reportarlo y parar** antes de
   inventarle un parámetro.
2. **No se duplica el motor.** `iniciarCorridaDesatendida_` ya hace todo; el camino nuevo lo
   llama, no lo reimplementa.
3. **La guarda de "ya hay una corrida en curso" se respeta y se muestra.** Hoy sólo va al
   `Logger`. En el panel tiene que verse, con el `corrida_id` de la que está corriendo y la salida
   —cancelar— a mano.
4. ⚠ **El botón viejo no se retira todavía.** Una corrida de una sola ejecución sigue siendo más
   barata cuando entra, y hasta que el desatendido esté probado punta a punta, sacarle al usuario
   la única forma que funciona hoy es un cambio en la dirección equivocada. **Dos botones, y la
   pantalla dice cuál conviene** — decidir cómo se rotulan es parte de esta parte.

---

## Parte B — ver la corrida mientras corre · **Opus** · effort alto

Sin esto, el botón de la Parte A es peor que el actual: hoy el usuario ve el resultado; con el
desatendido vería nada durante minutos.

- **Una función de sólo lectura** que devuelva el estado: `corrida_id`, número de ejecución, y el
  plan por sección con su estado —`pendiente` · `hecha` · `omitida` · `falló`—. Sale de
  `leerEstadoCorrida_` y `leerPlan_`; **no recalcula nada**.
- **La pantalla la muestra** y dice de cuándo es lo que está viendo. Sin autorefresco mágico: un
  botón de actualizar alcanza y no esconde cuándo se leyó.
- **El freno visible.** `cancelarCorridaDesatendida()` desde la pantalla, con confirmación. Un
  mecanismo desatendido sin botón de freno es peor que ninguno, y por eso el freno se construyó
  junto con el arranque.
- ⚠ **El sello es lo que contesta «¿está listo?»**, y vive en el nombre del deck. La pantalla
  tiene que decirlo, no dejar que se deduzca de los tokens: **los crudos no dicen qué falta** —las
  láminas escondidas dejan 49 permanentes en toda corrida.

---

## Parte C — sacar las anclas huérfanas de la vista · **Sonnet**

Las dos filas que el panel marca como *"ninguna reunión vigente la reclama"* siguen ocupando la
pantalla. Que estén marcadas es correcto y **no se toca**; lo que falta es poder archivarlas.

- **Archivar, no borrar.** Una columna de estado o un valor reservado en `elegido` —elegir cuál es
  parte de esta parte—, pero la fila queda: es el registro que el motor consulta y borrarla haría
  que la próxima corrida vuelva a preguntar lo mismo.
- **Reversible.** Si la reunión vuelve a `mostrar = sí`, el ancla tiene que poder volver.
- **Y el censo re-corrido**, no una fila escrita a mano, si esto agrega un escritor.

---

## Parte D — el `[object Object]` que quedó · **Sonnet**

El `_15` Parte D arregló el rótulo: el panel ya muestra *"vie 14/08 – jue 20/08 · corrida jm-…"*.
**Lo que sigue roto es el href** — los dos enlaces apuntan a
`.../presentation/d/[object Object]/edit`.

El comentario del `_15` dice que `deck` viaja como objeto **a propósito** porque *"el front lo
desarma en `deckCard`"*. Entonces el bug es de `deckCard`, no del adaptador. **Medirlo antes de
elegir el lado**, igual que se hizo con `periodo`.

---

## Parte E — la documentación · **Sonnet**

`docs/PROCESO_SEMANAL.md`, dueño de *"¿qué hace una persona para sacar el informe?"*:

- La sección *"Cuando una corrida se reanuda sola"* dice **[hoy, parcial]** y describe el
  mecanismo como algo del editor. Actualizar con lo que quede.
- **Y escribir el hallazgo, que es de proceso y no de código:** hasta hoy el botón del camino del
  usuario podía cortar sin salida, y no se había notado porque ninguna corrida había cortado. Va
  con las dos corridas medidas al lado.

---

## Fuera de alcance

- **El encabezado de `digital/Directa IVR`.** Las 12 desalineadas que encontró
  `verificarEncabezadosDeMapeo()` son un hallazgo aparte y **posiblemente estén moviendo números
  publicados hoy** — `ivr_audiencia` e `ivr_llamados` comparten rótulo falso. Va en su propio
  paso, y va antes que cualquier frente del plan.
- **Persistir el anclaje entre ejecuciones** (Parte C del `_10`). Es lo que haría que el
  desatendido rinda —hoy cada ejecución paga 70–80 s de arranque— y sigue sin construirse.
- **Los 552 faltantes de `jm-20260821-230048`.** Hay que mirarlos, pero contra `FALTANTES`, no
  desde acá.
- **Correr sola los viernes.** Esto lo habilita; agendarla es otra decisión.
