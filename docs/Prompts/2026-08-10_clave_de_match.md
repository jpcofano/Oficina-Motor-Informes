# La clave de match es Figura · Barrio · Fecha. Un solo objetivo.

**Estado:** vivo · **Fecha:** 2026-08-10 · **Ubicación:** `docs/Prompts/2026-08-10_clave_de_match.md`

> **Tercer prompt del formato nuevo: un objetivo, nada más.**
>
> **Documentación mínima mientras se trabaja:** una línea de bitácora por commit. **La documentación
> completa al final**, cuando el código funcione.

---

## Antes de empezar — `HANDOFF_CODE.md`, tercera vez

Lleva dos corridas pendiente. Es el punto de partida de cada sesión y desactualizado hace perder la
primera media hora de la siguiente. **Se escribe primero, con lo que hay hoy**, y después se empieza.
Si el resto de la corrida se cae, al menos eso queda.

---

## El objetivo

**Que el matcher entre `digital` y `rdv` use la clave que define el negocio, y que cuando no le
alcance, pregunte en vez de elegir.**

La corrida del 09/08 implementó un desempate temporal que no cambió nada, porque la premisa era
falsa: `3387` y `3347` nunca empataron. La explicación aparece al mirar de dónde sale el nombre que
se compara — y el usuario aportó, el 10/08, la regla de negocio que faltaba.

---

## Las dos cosas que están mal, según la regla de negocio

**1 · El nombre de campaña sale de la fuente equivocada.** Hoy `Union.gs` lo arma en una sola línea,
`sd_campana_digital || sd_campana_cuentas`. Si esos dos campos vienen vacíos para una cuenta, el
nombre queda en `''`, `parsearNombreCampana_` no saca nada, `solapamientoTokens_` da 0, y **esa
cuenta no puede ganar ningún match: no pierde un empate, no compite**.

**La regla del usuario (10/08):** el nombre sale, dentro del archivo `Seguimiento digital`, de las
solapas de canal **en este orden de prioridad**:

1. **`Directa Mail`** — manda, porque es el canal de donde salió la comunicación.
2. **`Directa IVR`**
3. **`Directa SMS`** — existe, pero **JM no la usa**.

**Se pone lo que hay**: la primera de la lista que tenga nombre para esa cuenta. No siempre hay
mail, no siempre hay IVR.

**2 · El score compara los campos equivocados.** Hoy `scoreMatchDigitalRdv_` puntúa por
barrio/comuna/eje, tipo de encuentro, y solapamiento de tokens del nombre. **La figura no entra en
ningún lado**, y la fecha se usa sólo como prefiltro de ±14 días.

**La regla del usuario (10/08): la clave es `Figura` · `Barrio` · `Fecha`.** Las tres. Y el
match es por confianza: **si todo coincide se sigue; si no, se pregunta.**

---

## Parte 0 — Medir antes de tocar. Sólo lectura. Reportar y seguir.

Nada de esto está verificado. Medirlo es la mitad del trabajo, y algunos resultados pueden cambiar el
diseño de la Parte A.

- **0.1 · ¿Existen los campos de nombre por canal, y con qué `campo_logico`?** Buscar en `MAPEO` los
  nombres de campaña de `Directa Mail`, `Directa IVR` y `Directa SMS` dentro de `digital`. Si alguno
  no está mapeado, decirlo: es un hueco de configuración, no de código.
- **0.2 · ¿Con qué formato viene cada uno?** Ésta es la medición que puede romper el plan. El parser
  `parsearNombreCampana_` espera una estructura para sacar barrio, eje y tipo. **Si el nombre de
  `Directa Mail` usa otra convención que el de `Seguimiento digital`, cambiar la fuente arregla la
  cobertura y rompe el parseo.** Traer tres ejemplos reales de cada solapa, sin interpretarlos.
- **0.3 · ¿Cuánta cobertura da cada canal?** Para las cuentas de la ventana: cuántas tienen nombre en
  `Directa Mail`, cuántas en `Directa IVR`, cuántas en `Directa SMS`, cuántas en ninguna, y cuántas
  quedan hoy con nombre vacío por usar sólo `sd_campana_*`. **El usuario estimó que mail cubre la
  mayoría de los casos pero pidió expresamente no cablear ese número: es la medición la que manda.**
- **0.4 · ¿De dónde sale la figura de cada lado?** En `rdv` está mapeada (`figura`, columna A). **Del
  lado `digital` no se sabe**: puede estar en un campo propio, puede haber que parsearla del nombre
  de campaña —el `JM` de `TE CUENTO BS AS JM | 21/7 ORDEN PÚBLICO` es un candidato— o puede no
  existir. **Reportar qué hay. Si no hay figura del lado digital, decirlo claro**, porque entonces la
  clave de tres no se puede construir y la Parte A cambia.
- **0.5 · El caso testigo, con los nombres a la vista.** Para `3387-JULJDGGC` y `3347-JULJDGAG`:
  qué nombre da cada solapa de canal, cuál da `sd_campana_*`, y qué score saca cada una hoy contra el
  encuentro de Orden Público. **Ahí tiene que verse por qué gana `3347`.**
- **0.6 · La foto de referencia, antes de tocar nada.** Correr el anclaje y anotar el resultado
  actual: cuántos anclados, cuántos sin link, cuántos en baja confianza, y el score de cada anclaje.
  Sin esto no se puede saber si el cambio mejora o empeora.

Reportar los seis y **seguir** — no parar. Si `0.2` o `0.4` dan un resultado que hace inviable la
Parte A como está escrita, **decirlo, proponer la variante, y seguir con ella**.

---

## Parte A — El nombre, por prioridad de canal

Reemplazar la cadena `sd_campana_digital || sd_campana_cuentas` por la prioridad del negocio:
**`Directa Mail` → `Directa IVR` → `Directa SMS` → lo que hay hoy como último recurso.**

- **La prioridad se declara en un solo lugar**, como ya está `SOLAPAS_CANAL_DIGITAL_`. No repartida
  por el código.
- **`Directa SMS` entra en la lista aunque JM no la use.** La regla es del motor, no del informe.
- **Dejar en la traza de qué canal salió el nombre.** Cuando un match salga raro, eso es lo primero
  que se va a querer mirar.
- **Si dos canales dan nombres distintos para la misma cuenta, gana el primero de la lista** —
  decisión del usuario: manda el mail, porque es de donde salió la comunicación. **Pero contar
  cuántas veces pasa y reportarlo**: si son muchas, es señal de otra cosa.

---

## Parte B — La clave: Figura · Barrio · Fecha

Reescribir `scoreMatchDigitalRdv_` para que puntúe por las tres, **condicionado a lo que haya medido
`0.4`**.

- **Las tres coinciden → match, se sigue.**
- **No coinciden las tres → no se elige.** El ítem va a `ANCLAJE_PENDIENTE` con el top‑3 por
  confianza, que es exactamente lo que pidió el usuario: *se pregunta al usuario y se muestran los de
  mayor confianza*. **Ese mecanismo ya existe** —`obtenerHojaAnclajePendiente_()`,
  `registrarAnclajePendiente_()`, con columnas `candidato_1..3`, `puntaje_1..3` y `elegido`—. **No
  construir uno nuevo: usar ése.**
- **Un match que hoy pasa por solapamiento de tokens y no cumple las tres, deja de pasar.** Eso es lo
  que se pidió, no una regresión. **Pero medirlo contra la foto de `0.6` y reportarlo anclaje por
  anclaje**: cuáles siguen, cuáles pasan a pendiente, y con qué score.
- **La fecha sigue siendo prefiltro además de clave.** No sacar `candidatosCercanosPorFecha_`.

---

## Parte C — Medir contra el informe publicado

Sólo si la Parte B cerró. Generar el informe y comparar los once números de Orden Público contra
`docs/VALIDACION_2026-07-31.md` §3.2. Los cuatro de IVR son el control duro: **78.637 · 71.234 ·
27.599 · 256**.

**`ULTIMO` no pasa a `SUMA` en este prompt** — decisión del usuario del 04/08, los dos cambios se
miden por separado. Está medido que `3387` tiene cinco filas de mail, la última del **03/08, fuera de
la ventana**, así que **con la cuenta corregida y `ULTIMO` varios pueden seguir sin cerrar**. Eso es
el segundo problema, no una falla de este arreglo: **reportar separado cuáles fallan por la cuenta y
cuáles por la operación.**

---

## Los límites

1. **No se edita ninguna celda de las cuatro bases.** `ANCLAJE_PENDIENTE` es hoja de registro del
   motor, no una de las bases: escribir ahí está bien.
2. **No se edita ninguna plantilla `.pptx`.**
3. **`VENTANA_DIAS_CANDIDATOS_ANCLAJE_ = 14` está hardcodeado contra `CLAUDE.md` §2.** Está anotado
   como número raro. **No arreglarlo acá** — es otro objetivo, y sacarlo a configuración en medio de
   un cambio de score mezcla dos mediciones.
4. **No se agrega `seccion_id` a `MARCADORES`**, no se tocan los 7 `ecv_` ambiguos, ni los tres
   remitentes sueltos, ni `camp_bench_*`, ni `m2_`.
5. **No se deroga ni se reescribe una `R-NN`, `D-NN`, `S-NN` ni `C-01`.**
6. **No se ajusta ningún número para que cierre**, y **no se reescribe historia de git**.

---

## Cuándo está hecho

- **El nombre de campaña sale del canal correcto** y se ve en la traza de cuál.
- **La clave de match usa figura, barrio y fecha** — o se explica por qué no se pudo, con lo medido
  en `0.4`.
- **`3387` gana sobre `3347`** para Orden Público. **O**, si no gana, se sabe exactamente por qué con
  los números de `0.5` a la vista.
- **Lo que no cumple las tres va a `ANCLAJE_PENDIENTE`**, no a una elección silenciosa.

Tres de cuatro es buena corrida.

---

## El reporte

1. **Las seis mediciones de la Parte 0**, cortas.
2. **Los cuatro criterios: cuáles se cumplen.**
3. **Los anclajes, antes y después**: cuáles siguen, cuáles pasaron a pendiente, con score.
4. **Por qué ganaba `3347`** — la explicación concreta, no la hipótesis.
5. **Qué decisiones tomaste solo y por qué.**
6. **Qué premisa de este prompt resultó falsa**, si alguna. Van dos prompts seguidos con una premisa
   central falsa; es información útil, no un reproche.
7. **Los números que salieron raros.** Sin analizarlos.

**Recién después, la documentación completa.** Sin trailer `Co-Authored-By`.

**Modelo:** Opus.
