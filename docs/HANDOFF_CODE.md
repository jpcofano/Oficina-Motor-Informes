# HANDOFF CODE — estado actual

> Lo escribe **solo Claude Code**, y se **reescribe** entero cada vez: es un puntero al
> presente, no un historial. La historia está en `docs/BITACORA.md`.

**Última actualización:** 2026-08-25 — se cerró el **fallback de `L-036`** que publicaba el Recap de
CABA, y tres instrumentos que se lavaban la cara. Antes: `D-41`, la etapa 4 partida por lámina — la
corrida pasó de **330 s a 118** y el deck **sale entero**.

---

## ⏱ Dónde estamos ahora mismo

### ✅ La corrida entra, y con margen

| | antes | ahora |
|---|---|---|
| total | 330 s de 350 | **118 s** |
| etapa 4 | 158 s | **33 s** |
| impresos · faltantes | 132 · 237 | **263 · 122** |

⭐⭐ **`L-047` cierra entera** y `V-113` quedó ampliado a las **cuatro** columnas del GLOBAL, todas
al dígito y **cruzando dos bases**. La pregunta del universo está contestada.

### ⏸ `L-036` — quedó en `-`, con UNA sola candidata viva

**No se toca sin el usuario** (decisión suya, 25/08).

**Lo que ya se descartó, con evidencia:**

- ⛔ **El fallback está cerrado.** `base_temario`/`hoja_temario` se declaran **siempre**, y sin filas
  el marcador devuelve `«FALTA:@post_sin_temario»` en vez de leer la solapa entera. Antes publicaba
  el **Recap de CABA — 2.463.980 habitantes** — como si fuera un encuentro.
- ⛔ **Las fechas NO son el eslabón.** Medido corriendo el parser real: escribe un `Date`. Lo que se
  ve como `23/07/2026` es el **formato de la celda**, no el tipo — y los dos consumidores hacen
  `instanceof Date ? x : parsearFechaCelda_(x)`.
- ⛔ **`vis_totales` y `vis_vtr_pct` salieron del `MAPEO`**: `leerFuente` indexa **por título** y en
  `Agenda JM | Post` *Visualizaciones* aparece cuatro veces. Gana el último, que es Programmatic.
  **La lámina queda con tres columnas de cinco.**

**La candidata que queda:** el **`id_cuenta` del anclaje contra el ID de `Agenda JM | Post`**.

⛔⛔ **Y antes de eso hay una pregunta previa, pedida por el usuario el 25/08:** *¿la fuente está bien
elegida?* Sólo JM tiene POST, pero eso dice **quién genera** el dato, no **en qué solapa está
cargado**. Hay que medir las **tres** solapas de `reuniones` —`Agenda JM | Post` (fuente),
`Digital | Base Post` (ignorar), `Métricas EDVs` (referencia, *«superconjunto de Agenda JM, 45
columnas»*)— contra los números que **el deck del equipo publica** para julio. **Si la fuente está
mal elegida, el eslabón que venimos persiguiendo no existe.**

⚠ **Y siguen faltando tres de las ocho columnas** —`post_camp`, `post_periodo`, `post_formato`—, sin
fuente en ninguna solapa. Pregunta al equipo, **sin prioridad**.

### ⭐ `julio_24_30` SIRVE como control — medido, no supuesto

No hace falta poblar `etapa` en agosto. Medido sobre el fixture del 20/08
(`DGPLES _ Seguimiento ECVs`, sha `f8ef3227…`), los dos ítems de `etapa=post` **tienen fila** en
`reuniones/Agenda JM | Post`:

| ítem | `id_cuenta` | Habitantes | Alcance | Impresiones | Visualizaciones | % VTR |
|---|---|---|---|---|---|---|
| **Retiro** (24/07) | `3346-JULJDGAG` | 41.475 | 47.753 | 136.971 | 41.204 | 0,30082 |
| **San Cristóbal** (23/07) | `3354-JULJDGAG` | 41.240 | **0** | **0** | **0** | **0** |

⭐ **Retiro ejercita el camino entero**, y **los tres bordes quedan cubiertos por el mismo control**:
**(1)** San Cristóbal con ceros ejercita *cero real* contra *sin dato*; **(2)** son **2 ítems para 4
ranuras**, así que las ranuras 3 y 4 tienen que salir `sin_datos`; **(3)** el `id_cuenta` del anclaje
es lo que encuentra la fila.

⚠ **Se perdió la identidad interna `% VTR = M/J`**, que era el control primario de la lámina. Lo
exigible ahora es la **coherencia de fila**.

### ⛔ Escrito y SIN CORRER: la reanudación del particionado

`continuacion.laminas_etapa4_hechas` y `CORRIDAS.ejecucion` **no se ejercitaron nunca**: la corrida
entró entera, así que no hubo tanda 2. **No se fabricó un corte para probarlo** (decisión del
usuario, 25/08).

⚠ **Y el día que haga falta va a ser justo el día de una corrida larga**, que es el peor momento
para descubrir que no anda. Queda declarado como **escrito y sin ejecutar**, que es distinto de
*probado* — *una rama nueva que nunca se ejecutó no está sin probar: está sin escribir el control*.

---

## ⛔ Lo que frena el cierre de fase: el conteo de faltantes no es confiable

**`D-38` cierra cuando el usuario, mirando un deck completo, declara que los faltantes que quedan no
son relevantes.** No hay umbral ni conteo: **es revisión humana**. Por eso el instrumento importa —
y hoy **miente en las dos direcciones**:

- **Suma como faltantes cosas que nadie va a cablear nunca**: los **57 tokens** de `L-039`, `L-048` y
  `L-050`, que están **fuera de alcance** por `D-39`; y el **texto que escribe el equipo** —los seis
  `camp_bench_*`, `camp_dig_insight`, `camp_mail_insight`—.
- **Y no vio** que `L-036` publicara el Recap de CABA con forma de acierto.

⭐ **Además no agrupa por lámina**, que es como el usuario mira un deck — así que cruzarlo contra
`CIERRE_POR_LAMINA.md`, que **sí** está organizado por lámina, es a mano.

**La declaración va pegada a un `corrida_id`.** Sin corrida es una frase, no un cierre.

---

## ⛔ Lo que necesita el usuario, en orden

| # | qué | por qué |
|---|---|---|
| 1 | ⚠ **`reserva_cierre_seg` a 60, A MANO** | `CONFIG` **sólo siembra lo ausente** |
| 2 | **Medir las tres solapas de `reuniones`** contra el deck del equipo | ⛔ va **antes** que el `id_cuenta` de `L-036` |
| 3 | **Decidir el rótulo de Programmatic** | es lo único que lo destraba, y **no depende del equipo** |
| 4 | **Contestar `X-28`**, o pasársela al equipo | es lo único que bloquea el Call Center |
| 5 | **Aplicar configuración** | siguen faltando las **8 filas `REVISAR`** del `MAPEO` |

⚠ **Las preguntas al equipo NO bloquean nada** (decisión del usuario, 22/08). Están en
`PENDIENTES_consistencia.md` con todo lo medible ya medido, esperando sin frenar.

---

## ⛔ Lo que necesitás decidir sobre Programmatic, y es una sola cosa

**El diagnóstico está cerrado y el número no está roto: es el ACUMULADO.** `looker/DIGITAL`
actualiza la fila y no agrega filas, así que `Impresiones` trae todo desde que la campaña arrancó.
Autódromo empezó ocho días antes de la ventana y el equipo le atribuye **379.512** donde su fila
dice **3.756.321** — factor 9,9. Google, que casi no acumuló antes, cierra a **1,05×**.

⛔ **El dato semanal no existe en ninguna solapa**: `DIGITAL` no tiene columna temporal y
`CAMPAÑAS_DESGLOCE_DIGITAL` tiene grano **mes**. **Ninguna operación arregla esto.**

| | qué | qué cuesta |
|---|---|---|
| **(a)** | **Cambiar el rótulo** a *"acumulado de las campañas de la semana"* | ⭐ **cero código.** El número **ya es correcto para esa pregunta**. Es la barata y no depende de nadie |
| **(b)** | Pedirle al equipo el dato semanal | la única que hace el número de la semana. Depende de ellos |
| **(c)** | Publicar `/////` hasta que exista el dato | honesto, cuesta una celda, y **pierde** un número que hoy sirve para otra cosa |

**Mientras no decidas, queda `_revisar`** — que dice *"hay un número y no confíes"*, y **no es una de
las tres salidas: es el estado de espera.**

⚠ `imp_total`, `imp_meta` e `imp_google` **tienen la misma causa**, y `imp_total` además **incluye** a
Programmatic. Hoy **no están marcados**, por pedido tuyo.

---

## ⛔ Lo único que bloquea el Call Center: `X-28`

La **definición** está cerrada `exacto` (`V-105`, cuatro de cuatro contra el deck del 31/07):
«Base discada» = **`Base barrida`**, y el Resumen **no filtra** por `Tipo de llamado`. Lo que falta
es **qué cuentas entran**, y **ninguna regla escrita lo reproduce**: la pertenencia sola da el
gabinete entero (22 filas / 100.197 contra 2 / 6.011) y el filtro por nombre falla por los dos lados
—deja entrar `3387`, y deja afuera `3488-AGOJDGAG`, que **no dice «JM»**—.

⭐ **Los dos decks publican UNA SOLA CUENTA.** No hay regla que diga cuál. **Es pregunta al equipo.**

---

## ⛔ Dos cosas que hay que saber antes de leer un número

**1 · `looker/DIGITAL` es inestable por CAMBIO** (`R-31`, `19/503`, **cero altas**). **El testigo
`V-110` no se puede volver a usar con criterio de igualdad sobre los `imp_*`** — su criterio
corregido, por marcador, está en el addendum del 23/08.

⭐ **Y `CLAUDE.md` §4 se corrigió por esto:** *"la cuenta de filas distingue se rompió de la base se
movió"* **sólo vale cuando la base se mueve por ALTA**. Con inestabilidad por CAMBIO la regla
**acusa al código que no tocó nada**.

**2 · El período elegido y el calculado dan la misma ventana y distinto temario.** `anclarEncuentros`
recorta `REUNIONES` por período **sólo si la ventana vino por `periodo_ref`**, así que sin período
entran **12 encuentros en vez de 2**. El deck `jm-20260821-230048` es eso, y salió **sin que nada
fallara**. Está como **P1** en `PENDIENTES_consistencia.md`.

⚠ **El camino desatendido del editor no pasa por el panel**, así que no ve el aviso.

---

## ⭐ Tres reglas nuevas en `CLAUDE.md` §4, y las tres salieron de perder tiempo

1. **Un fallback silencioso justificado por el estado actual del cableado tiene fecha de vencimiento
   y nadie la mira.** La premisa no era sobre el mundo sino **sobre el propio repo**, y **el trabajo
   previsto es la fecha de vencimiento**.
2. **Un filtro que descarta ANTES y no cuenta es invisible, y el que sí cuenta se lleva la culpa.**
   *«Descartadas por período: 6»* era correcto y señalaba al lugar equivocado. **Cuando un conteo
   acusa a un filtro, verificar qué LLEGÓ a ese filtro.**
3. **El FORMATO de una celda no dice su TIPO** — y el orden importa: **primero el consumidor,
   después el tipo.**

---

## Las suites

**Las 41 de `tools/` en verde.** Ampliados en la última jornada: `probar-tabla-post` 34 → **57**
(con la afirmación que impide repetir el bug del reversor: **no puede derivar de
`COLUMNAS_POST_L036_`**), `probar-parseo-temario` 29 → **37**, `probar-mapeo-post` **22 + 4
negativos**.

⚠ **Los dos bancos de `L-036` se pusieron en rojo solos y se actualizaron con afirmaciones
NEGATIVAS en vez de aflojarse** — si alguien vuelve a mapear `vis_totales`, rojo.

---

## Qué cambió en el panel

**Dos botones donde había uno**, y la pantalla dice cuál conviene:

- **Generar informe** — corre de una vez y devuelve el deck. **Sigue siendo el caso normal**: el
  arranque cuesta 70–80 s **por ejecución**.
- **Generar y que siga sola** — arranca la corrida desatendida. Si corta, se reanuda sola.

⚠ **El botón viejo NO se retiró a propósito.** Hasta que el desatendido esté probado punta a punta,
sacar la única forma que funciona hoy va para el lado equivocado.

**Pestaña «Corrida»** — sólo lectura. ⭐ Contesta *«¿está listo?»* con el **sello del nombre del
deck**, no con los tokens: las láminas escondidas dejan crudos permanentes en toda corrida.
**No se refresca sola y dice a qué hora leyó.**

**Pestaña «Anclajes»** — las filas huérfanas se pueden **archivar**. No se borran: vuelven solas si
la reunión vuelve a `mostrar = sí`.

---

## ⛔ Evidencia que no se puede perder

- **Los tres decks del 21/08**:
  `1_krz_dTgwVqFm8BbAIhxKl6VAvD3zMy1MYx9BUGlMnI` (194602, temario correcto, cerró) ·
  `10omnlzVY6nrwg6CX-EqyBIypTgQ6sY7XRB15JNkugC4` (224727, **sigue sellado** — es la prueba del corte) ·
  `1lg-FcqM5VlDAo4HaFI_0AuKEQ6H1hx4s_nmVWdqhPO0` (230048, el del temario de 12 encuentros).
- **Los tres fixtures**, con su huella en `docs/_fixtures/README.md`. El del 20/08 trae la base
  **y los dos decks del mismo día**.
- ⚠ **Dos `.pptx` de decks reales quedaron en el historial de git** (commit `7e48725`). Riesgo
  asumido por decisión del usuario.

---

## Cómo leer esto desde afuera

- **Qué se hizo y qué se midió** → `docs/BITACORA.md`.
- **Qué publica bien el motor y qué no** → `docs/VALIDACION_deck_generado_vs_equipo_2026-08-22.md`.
- **Qué lámina está cerrada y qué le falta** → `docs/CIERRE_POR_LAMINA.md`.
- **Qué sigue abierto** → `docs/PENDIENTES_consistencia.md`.
- **Qué hace una persona para sacar el informe** → `docs/PROCESO_SEMANAL.md`.
